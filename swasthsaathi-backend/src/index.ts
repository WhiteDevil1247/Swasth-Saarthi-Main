import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { connectMongo } from './db/mongo';
import { getPgPool, testPgConnection, initPgSchema } from './db/pg';
import { getPrisma, testPrismaConnection } from './db/prisma';
import { verifyJWT, AuthRequest } from './middleware/auth';
import { HealthRecord } from './models/HealthRecord';
import { ChatLog } from './models/ChatLog';
import QRCode from 'qrcode';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT ? Number(process.env.PORT) : 8081;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Logging & metrics
app.use(morgan('dev'));
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
  });
  next();
});

// CORS: strict single-origin
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());

// Basic rate limiting for API routes
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));

// Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'swasthsaathi-backend' });
});

// DB init (Mongo only for now)
(async () => {
  try {
    if (process.env.MONGO_URI) {
      await connectMongo(process.env.MONGO_URI);
      console.log('Mongo connected');
    }
    if (process.env.DATABASE_URL) {
      // Prefer Prisma for Postgres connectivity
      await testPrismaConnection();
      console.log('Postgres (Prisma) connected');
    } else {
      console.log('Postgres not configured (DATABASE_URL missing). Skipping PG init.');
    }
  } catch (err) {
    console.error('Database init error', err);
  }
})();

// Health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'swasthsaathi-backend' });
});

// Protected example
app.get('/api/me', verifyJWT, (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  res.json({ user });
});

// Auth (mock OTP/JWT)
const OtpRequest = z.object({ phone: z.string().min(6) });
app.post('/api/auth/request-otp', (req: Request, res: Response) => {
  const parsed = OtpRequest.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid phone' });
  // fixed code for dev
  res.json({ success: true, code: '123456' });
});

const OtpVerify = z.object({ phone: z.string().min(6), code: z.string().min(4) });
app.post('/api/auth/verify', (req: Request, res: Response) => {
  const parsed = OtpVerify.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const { phone, code } = parsed.data;
  if (code !== '123456') return res.status(401).json({ error: 'Invalid code' });
  const token = jwt.sign({ sub: phone, role: 'user' }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '1h' });
  res.json({ token });
});

// File storage (local)
const storageRoot = path.join(process.cwd(), 'storage');
const uploadRoot = path.join(storageRoot, 'uploads');
fs.mkdirSync(uploadRoot, { recursive: true });

const upload = multer({ dest: uploadRoot, limits: { fileSize: 10 * 1024 * 1024 } });

app.post('/api/upload', verifyJWT, upload.single('file'), async (req: Request, res: Response) => {
  const file = (req as any).file as { filename: string; originalname?: string } | undefined;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  // Save metadata to Mongo
  try {
    const user = (req as AuthRequest).user as any;
    await HealthRecord.create({
      user_id: user?.sub || 'anonymous',
      file_id: file.filename,
      original_name: file.originalname,
      file_type: (req as any).file?.mimetype,
    });
  } catch (e) {
    console.error('Failed to save health record metadata', e);
  }
  res.json({ id: file.filename, originalName: file.originalname });
});

app.get('/api/files', verifyJWT, (_req: Request, res: Response) => {
  const files = fs.readdirSync(uploadRoot).map((f) => ({ id: f }));
  res.json({ files });
});

// Health Records (Mongo metadata)
app.get('/api/records', verifyJWT, async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const docs = await HealthRecord.find({ user_id: userId }).sort({ created_at: -1 }).lean();
  res.json(docs);
});

app.get('/api/records/:id', verifyJWT, async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const doc = await HealthRecord.findOne({ _id: req.params.id, user_id: userId }).lean();
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

app.delete('/api/records/:id', verifyJWT, async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const doc = await HealthRecord.findOneAndDelete({ _id: req.params.id, user_id: userId }).lean();
  if (!doc) return res.status(404).json({ error: 'Not found' });
  try {
    const filepath = path.join(uploadRoot, doc.file_id);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch (e) {
    console.warn('Failed to remove file from disk', e);
  }
  res.status(204).send();
});

// ---------- Hospitals (Postgres via Prisma)
const HospitalsQuery = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  type: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().min(0.1).max(100).optional(),
});
app.get('/api/hospitals', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const q = HospitalsQuery.safeParse(req.query);
  if (!q.success) return res.status(400).json({ error: 'Invalid query' });
  const { search, city, type, limit, lat, lng, radiusKm } = q.data;
  const prisma = getPrisma();
  const lim = Math.min(limit ?? 50, 200);
  const items = await prisma.hospital.findMany({
    where: {
      AND: [
        search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { address: { contains: search, mode: 'insensitive' } }] } : {},
        city ? { city: { contains: city, mode: 'insensitive' } } : {},
        type ? { type: { contains: type, mode: 'insensitive' } } : {},
      ],
    },
    orderBy: { created_at: 'desc' },
    take: lim,
    select: { id: true, name: true, address: true, city: true, state: true, phone: true, type: true, beds: true, latitude: true, longitude: true },
  });
  const rows = items.map((r: any) => ({ id: r.id, name: r.name, address: r.address, city: r.city, state: r.state, contact: r.phone, type: r.type, beds: r.beds, lat: r.latitude, lng: r.longitude }));
  if (lat != null && lng != null && radiusKm != null) {
    const R = 6371;
    const withDist = rows
      .filter((r: any) => r.lat != null && r.lng != null)
      .map((r: any) => {
        const dLat = ((r.lat - lat) * Math.PI) / 180;
        const dLng = ((r.lng - lng) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(r.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return { ...r, distanceKm: R * c };
      })
      .filter((r: any) => r.distanceKm <= radiusKm)
      .sort((a: any, b: any) => a.distanceKm - b.distanceKm);
    return res.json(withDist);
  }
  res.json(rows);
});

app.get('/api/hospitals/:id', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const prisma = getPrisma();
  const h = await prisma.hospital.findUnique({ where: { id } });
  if (!h) return res.status(404).json({ error: 'Not found' });
  res.json({ id: h.id, name: h.name, address: h.address, city: h.city, state: h.state, contact: h.phone, type: h.type, beds: h.beds, lat: h.latitude, lng: h.longitude, synced: false });
});

// ---------- NGOs (Postgres via Prisma)
app.get('/api/ngos', verifyJWT, async (_req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const prisma = getPrisma();
  const rows = await prisma.ngo.findMany({ orderBy: { created_at: 'desc' }, take: 200 });
  res.json(rows);
});

app.get('/api/ngos/:id', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const prisma = getPrisma();
  const ngo = await prisma.ngo.findUnique({ where: { id } });
  if (!ngo) return res.status(404).json({ error: 'Not found' });
  res.json(ngo);
});

const NgoCreate = z.object({ name: z.string().min(1), description: z.string().optional(), contact: z.string().optional(), website: z.string().optional(), city: z.string().optional(), tags: z.string().optional() });
app.post('/api/ngos', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const parsed = NgoCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const prisma = getPrisma();
  const created = await prisma.ngo.create({ data: parsed.data });
  res.status(201).json({ ...created, synced: false });
});

// ---------- Emergency QR (uses profile)
app.get('/api/qr/emergency', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const prisma = getPrisma();
  const prof = await prisma.profile.findUnique({ where: { userId }, select: { full_name: true, blood_group: true, emergency_contact: true } });
  const payload = {
    id: userId,
    name: prof?.full_name || 'Unknown',
    blood_group: prof?.blood_group || 'NA',
    emergency_contact: prof?.emergency_contact || 'NA',
    profile_url: `${FRONTEND_ORIGIN}/settings`,
  };
  const qrDataUrl = await QRCode.toDataURL(JSON.stringify(payload));
  res.json({ qrDataUrl });
});

// AI Mock
const AiRequest = z.object({ input: z.string().min(1) });
app.post('/api/ai/infer', verifyJWT, (req: Request, res: Response) => {
  const parsed = AiRequest.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { input } = parsed.data;
  res.json({ result: `Mock analysis for: ${input}`, confidence: 0.87 });
});

// AI Timeline (mock heuristic)
app.get('/api/ai/timeline', verifyJWT, async (req: Request, res: Response) => {
  if (!pg) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const { rows } = await pg.query(
    `SELECT type, value, recorded_at FROM metrics WHERE user_id=$1 ORDER BY recorded_at DESC LIMIT 100`,
    [userId]
  );
  if (rows.length === 0) return res.json({ summary: 'No recent health metrics recorded.', metrics: [] });
  const latestByType: Record<string, any> = {};
  for (const m of rows) if (!latestByType[m.type]) latestByType[m.type] = m;
  const parts: string[] = [];
  if (latestByType['bp']) parts.push(`BP latest: ${latestByType['bp'].value}`);
  if (latestByType['hr']) parts.push(`Heart rate latest: ${latestByType['hr'].value}`);
  if (latestByType['glucose']) parts.push(`Glucose latest: ${latestByType['glucose'].value}`);
  const summary = parts.length ? parts.join('. ') : 'Health metrics captured recently.';
  res.json({ summary, metrics: rows });
});

// --------- Postgres-backed resources (profiles, appointments, metrics) via Prisma
const pg = process.env.DATABASE_URL ? getPgPool() : null as any; // retained for legacy scripts; Prisma used below

// Profiles
app.get('/api/profile', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const prisma = getPrisma();
  const prof = await prisma.profile.findUnique({ where: { userId } });
  res.json(prof ?? null);
});

app.put('/api/profile', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const { full_name, email, phone } = req.body || {};
  const prisma = getPrisma();
  const prof = await prisma.profile.upsert({
    where: { userId },
    update: { full_name, email, phone, updated_at: new Date() },
    create: { userId, full_name, email, phone },
  });
  res.json(prof);
});

// Appointments
const AppointmentCreate = z.object({
  provider: z.string().min(1),
  reason: z.string().min(1).optional().nullable(),
  start_time: z.coerce.date().optional().nullable(),
  end_time: z.coerce.date().optional().nullable(),
  status: z.enum(['scheduled','completed','cancelled']).optional().nullable(),
});

const AppointmentUpdate = z.object({
  provider: z.string().min(1).optional(),
  reason: z.string().min(1).optional(),
  start_time: z.coerce.date().optional().nullable(),
  end_time: z.coerce.date().optional().nullable(),
  status: z.enum(['scheduled','completed','cancelled']).optional(),
});
app.get('/api/appointments', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const prisma = getPrisma();
  const rows = await prisma.appointment.findMany({ where: { userId }, orderBy: { start_time: 'desc' } });
  const withSync = rows.map((r: any) => ({ ...r, synced: false }));
  res.json(withSync);
});

app.post('/api/appointments', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const parsed = AppointmentCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const prisma = getPrisma();
  const created = await prisma.appointment.create({ data: { userId, ...parsed.data } });
  res.status(201).json(created);
});

app.patch('/api/appointments/:id', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const parsed = AppointmentUpdate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const prisma = getPrisma();
  const { count } = await prisma.appointment.updateMany({ where: { id, userId }, data: parsed.data });
  if (count === 0) return res.status(404).json({ error: 'Not found' });
  const updated = await prisma.appointment.findUnique({ where: { id } });
  return res.json(updated);
});

app.delete('/api/appointments/:id', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const prisma = getPrisma();
  const { count } = await prisma.appointment.deleteMany({ where: { id, userId } });
  if (count === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

// Metrics with optional filters
const MetricsQuery = z.object({ type: z.string().optional(), limit: z.coerce.number().min(1).max(200).optional() });
app.get('/api/metrics', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const parsed = MetricsQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid query' });
  const { type, limit } = parsed.data;
  const prisma = getPrisma();
  const rows = await prisma.metric.findMany({
    where: { userId, ...(type ? { type } : {}) },
    orderBy: { recorded_at: 'desc' },
    take: Math.min(limit ?? 50, 200),
  });
  res.json(rows);
});

app.post('/api/metrics', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const { type, value } = req.body || {};
  const prisma = getPrisma();
  const created = await prisma.metric.create({ data: { userId, type, value } });
  res.status(201).json(created);
});

app.delete('/api/metrics/:id', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const prisma = getPrisma();
  const { count } = await prisma.metric.deleteMany({ where: { id, userId } });
  if (count === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

// ---- Google Calendar scaffold ----
app.get('/api/calendar/auth-url', verifyJWT, async (_req: Request, res: Response) => {
  const enabled = String(process.env.GOOGLE_CALENDAR_ENABLED || 'false').toLowerCase() === 'true';
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const redirect = process.env.GOOGLE_REDIRECT_URI || '';
  if (!enabled || !clientId || !redirect) {
    return res.json({ enabled: false, message: 'Calendar disabled or credentials missing' });
  }
  const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirect)}&scope=${scope}&access_type=offline&prompt=consent`;
  res.json({ enabled: true, url });
});

app.get('/api/calendar/oauth-callback', async (req: Request, res: Response) => {
  // Scaffold only: acknowledge receipt of code, but do not exchange without configured secrets
  const code = (req.query.code as string) || '';
  const enabled = String(process.env.GOOGLE_CALENDAR_ENABLED || 'false').toLowerCase() === 'true';
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const redirect = process.env.GOOGLE_REDIRECT_URI || '';
  if (!enabled || !clientId || !clientSecret || !redirect) {
    return res.status(400).json({ success: false, message: 'Calendar disabled or credentials missing', codeReceived: !!code });
  }
  // In a full implementation, exchange code for tokens and persist them per user
  res.json({ success: true, message: 'OAuth scaffold callback received', codeReceived: !!code });
});

// Chat logs (Mongo)
const ChatMessage = z.object({ role: z.enum(['user','assistant']), content: z.string().min(1) });
app.get('/api/chat', verifyJWT, async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const logs = await ChatLog.find({ user_id: userId }).sort({ created_at: -1 }).limit(100).lean();
  res.json(logs);
});

app.post('/api/chat', verifyJWT, async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const parsed = ChatMessage.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const { role, content } = parsed.data;
  const saved = await ChatLog.create({ user_id: userId, role, content });
  res.status(201).json(saved);
});

// WebSocket signaling
const wss = new WebSocketServer({ server, path: '/signalling' });
wss.on('connection', (socket) => {
  socket.on('message', (data) => {
    // naive broadcast to others; in prod add rooms, auth, etc.
    wss.clients.forEach((client) => {
      if (client !== socket && (client as any).readyState === 1) {
        (client as any).send(data);
      }
    });
  });
});

server.on('error', (err: any) => {
  if (err && (err.code === 'EADDRINUSE' || err.code === 'EACCES')) {
    console.error(`Port ${PORT} is already in use or requires elevated privileges.`);
    process.exit(1);
  }
  console.error('HTTP server error:', err);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  const message = typeof err?.message === 'string' ? err.message : 'Internal Server Error';
  res.status(500).json({ success: false, message });
});
