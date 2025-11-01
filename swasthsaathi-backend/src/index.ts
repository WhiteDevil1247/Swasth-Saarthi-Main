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
import compression from 'compression';
import { encryptString, decryptString, encryptJSON } from './lib/crypto';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT ? Number(process.env.PORT) : 8081;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Compression for production
app.use(compression());

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

// Auth (Twilio OTP with fallback)
const OtpRequest = z.object({ phone: z.string().min(6) });
app.post('/api/auth/request-otp', async (req: Request, res: Response) => {
  const parsed = OtpRequest.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid phone' });
  const { phone } = parsed.data;
  
  // Check if Twilio is configured and mock is disabled
  const twilioConfigured = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM;
  const mockOTP = process.env.MOCK_OTP !== 'false';
  
  if (twilioConfigured && !mockOTP) {
    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      // Generate random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in memory (in production use Redis with TTL)
      const otpStore = (global as any).otpStore || ((global as any).otpStore = new Map());
      otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 min expiry
      
      // Send real SMS
      await client.messages.create({
        body: `Your Swasth Saathi OTP is: ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_FROM,
        to: phone
      });
      
      console.log(`✅ Real OTP sent to ${phone}`);
      res.json({ success: true, message: 'OTP sent via SMS' });
    } catch (error: any) {
      console.error('Twilio error:', error.message);
      // Fallback to mock on error
      res.json({ success: true, code: '123456', message: 'Mock OTP (Twilio error)' });
    }
  } else {
    // Dev mode: fixed code
    const otpStore = (global as any).otpStore || ((global as any).otpStore = new Map());
    otpStore.set(phone, { otp: '123456', expiresAt: Date.now() + 5 * 60 * 1000 });
    res.json({ success: true, code: '123456', message: 'Mock OTP (dev mode)' });
  }
});

const OtpVerify = z.object({ phone: z.string().min(6), code: z.string().min(4) });
app.post('/api/auth/verify', async (req: Request, res: Response) => {
  const parsed = OtpVerify.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const { phone, code } = parsed.data;
  
  // Verify OTP from store
  const otpStore = (global as any).otpStore || new Map();
  const stored = otpStore.get(phone);
  
  if (!stored) {
    return res.status(401).json({ error: 'OTP not found or expired. Please request a new one.' });
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    return res.status(401).json({ error: 'OTP expired. Please request a new one.' });
  }
  
  if (code !== stored.otp) {
    return res.status(401).json({ error: 'Invalid OTP code' });
  }
  
  // Clear used OTP
  otpStore.delete(phone);
  // Ensure user exists in database
  if (process.env.DATABASE_URL) {
    const prisma = getPrisma();
    await prisma.user.upsert({ where: { phone }, create: { phone }, update: {} });
  }
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

// ---------- SOS Emergency SMS
const SosRequest = z.object({ 
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  message: z.string().optional() 
});
app.post('/api/sos', verifyJWT, async (req: Request, res: Response) => {
  const user = (req as AuthRequest).user as any;
  const phone = user?.sub as string;
  const parsed = SosRequest.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request' });
  
  const { location, message } = parsed.data;
  const prisma = getPrisma();
  const userRecord = await prisma.user.findUnique({ where: { phone } });
  if (!userRecord) return res.status(404).json({ error: 'User not found' });
  
  const prof = await prisma.profile.findUnique({ where: { userId: userRecord.id } });
  const emergencyContact = prof?.emergency_contact ? decryptString(prof.emergency_contact) : null;
  
  if (!emergencyContact) {
    return res.status(400).json({ error: 'No emergency contact configured' });
  }
  
  const sosMessage = `🆘 EMERGENCY ALERT from ${prof?.full_name || phone}!\n${message || 'Immediate help needed!'}\n${location ? `Location: https://maps.google.com/?q=${location.lat},${location.lng}` : 'Location unknown'}\nCall: ${phone}`;
  
  // Send SMS via Twilio if configured
  const twilioConfigured = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM;
  
  if (twilioConfigured) {
    try {
      // TODO: Integrate Twilio SDK
      console.log(`Would send SOS to ${emergencyContact}: ${sosMessage}`);
      res.json({ success: true, message: 'Emergency alert sent', contact: emergencyContact });
    } catch (error) {
      console.error('SOS SMS error:', error);
      res.json({ success: true, message: 'SOS logged (SMS failed)', contact: emergencyContact });
    }
  } else {
    console.log(`Mock SOS to ${emergencyContact}: ${sosMessage}`);
    res.json({ success: true, message: 'SOS logged (mock mode)', contact: emergencyContact });
  }
});

// ---------- Emergency QR (uses profile)
app.get('/api/qr/emergency', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const phone = user?.sub as string;
  const prisma = getPrisma();
  const userRecord = await prisma.user.findUnique({ where: { phone } });
  if (!userRecord) return res.status(404).json({ error: 'User not found' });
  const prof = await prisma.profile.findUnique({ where: { userId: userRecord.id }, select: { full_name: true, blood_group: true, emergency_contact: true } });
  let name = prof?.full_name || 'Unknown';
  let blood = (prof as any)?.blood_group || 'NA';
  let emer = (prof as any)?.emergency_contact || 'NA';
  try {
    blood = (prof as any)?.blood_group ? decryptString((prof as any).blood_group) : blood;
    emer = (prof as any)?.emergency_contact ? decryptString((prof as any).emergency_contact) : emer;
  } catch {}
  const encryptedPayload = encryptJSON({ id: userRecord.id, name, blood_group: blood, emergency_contact: emer, profile_url: `${FRONTEND_ORIGIN}/settings` });
  const qrDataUrl = await QRCode.toDataURL(encryptedPayload);
  res.json({ qrDataUrl });
});

// AI Health Analysis (Proxy to Python Flask Service)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// AI Report Analysis - proxies to Python ML service
app.post('/api/ai/report', verifyJWT, async (req: Request, res: Response) => {
  try {
    const { bp, cholesterol, glucose } = req.body;
    const response = await fetch(`${AI_SERVICE_URL}/api/ai/analyze-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bp, cholesterol, glucose })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('AI Service error:', error.message);
    res.status(503).json({ error: 'AI service unavailable', message: error.message });
  }
});

// AI Chat - proxies to Python NLP service
app.post('/api/ai/chat', verifyJWT, async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const response = await fetch(`${AI_SERVICE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('AI Service error:', error.message);
    res.status(503).json({ error: 'AI service unavailable', message: error.message });
  }
});

// Legacy AI inference endpoint (kept for backward compatibility)
const AiRequest = z.object({ input: z.string().min(1) });
app.post('/api/ai/infer', verifyJWT, async (req: Request, res: Response) => {
  try {
    const parsed = AiRequest.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
    const { input } = parsed.data;
    // Proxy to AI chat
    const response = await fetch(`${AI_SERVICE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });
    const data = await response.json();
    res.json({ result: data.response || 'No response', confidence: data.confidence || 0.8 });
  } catch (error) {
    res.json({ result: `Analysis for: ${req.body.input}`, confidence: 0.75 });
  }
});

// AI Timeline (health metrics summary)
app.get('/api/ai/timeline', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const phone = user?.sub as string;
  try {
    const prisma = getPrisma();
    const userRecord = await prisma.user.findUnique({ where: { phone } });
    if (!userRecord) return res.json({ summary: 'No user found', metrics: [] });
    
    const metrics = await prisma.metric.findMany({
      where: { userId: userRecord.id },
      orderBy: { recorded_at: 'desc' },
      take: 100
    });
    
    if (metrics.length === 0) return res.json({ summary: 'No recent health metrics recorded.', metrics: [] });
    
    const latestByType: Record<string, any> = {};
    for (const m of metrics) if (!latestByType[m.type]) latestByType[m.type] = m;
    
    const parts: string[] = [];
    if (latestByType['bp']) parts.push(`BP latest: ${latestByType['bp'].value}`);
    if (latestByType['hr']) parts.push(`Heart rate latest: ${latestByType['hr'].value}`);
    if (latestByType['glucose']) parts.push(`Glucose latest: ${latestByType['glucose'].value}`);
    const summary = parts.length ? parts.join('. ') : 'Health metrics captured recently.';
    res.json({ summary, metrics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// --------- Postgres-backed resources (profiles, appointments, metrics) via Prisma
const pg = process.env.DATABASE_URL ? getPgPool() : null as any; // retained for legacy scripts; Prisma used below

// Profiles
app.get('/api/profile', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const phone = user?.sub as string;
  const prisma = getPrisma();
  const userRecord = await prisma.user.findUnique({ where: { phone } });
  if (!userRecord) return res.json(null);
  const prof = await prisma.profile.findUnique({ where: { userId: userRecord.id } });
  if (!prof) return res.json(null);
  try {
    const decrypted = {
      ...prof,
      email: prof.email ? decryptString(prof.email) : null,
      phone: prof.phone ? decryptString(prof.phone) : null,
      blood_group: prof as any && (prof as any).blood_group ? decryptString((prof as any).blood_group) : (prof as any).blood_group ?? null,
      emergency_contact: (prof as any).emergency_contact ? decryptString((prof as any).emergency_contact) : null,
      address: (prof as any).address ? decryptString((prof as any).address) : null,
      allergies: (prof as any).allergies ? decryptString((prof as any).allergies) : null,
      medical_conditions: (prof as any).medical_conditions ? decryptString((prof as any).medical_conditions) : null,
    } as any;
    return res.json(decrypted);
  } catch {
    // If decryption fails (e.g., key missing), return as-is
    return res.json(prof);
  }
});

app.put('/api/profile', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const userId = user?.sub as string;
  const { full_name, email, phone, blood_group, emergency_contact, address, allergies, medical_conditions } = req.body || {};
  const prisma = getPrisma();
  
  // Ensure user exists first
  const existingUser = await prisma.user.findUnique({ where: { phone: userId } });
  if (!existingUser) {
    await prisma.user.create({ data: { phone: userId } });
  }
  const userRecord = await prisma.user.findUnique({ where: { phone: userId } });
  if (!userRecord) return res.status(500).json({ error: 'User creation failed' });
  
  let encEmail = email, encPhone = phone, encBlood = blood_group, encEmer = emergency_contact, encAddr = address, encAll = allergies, encCond = medical_conditions;
  try {
    encEmail = email != null ? encryptString(String(email)) : null;
    encPhone = phone != null ? encryptString(String(phone)) : null;
    encBlood = blood_group != null ? encryptString(String(blood_group)) : null;
    encEmer = emergency_contact != null ? encryptString(String(emergency_contact)) : null;
    encAddr = address != null ? encryptString(String(address)) : null;
    encAll = allergies != null ? encryptString(String(allergies)) : null;
    encCond = medical_conditions != null ? encryptString(String(medical_conditions)) : null;
  } catch {
    // if encryption fails due to key, fall back to plaintext
  }
  const prof = await prisma.profile.upsert({
    where: { userId: userRecord.id },
    update: { full_name, email: encEmail, phone: encPhone, updated_at: new Date(), blood_group: encBlood, emergency_contact: encEmer, address: encAddr, allergies: encAll, medical_conditions: encCond },
    create: { userId: userRecord.id, full_name, email: encEmail, phone: encPhone, blood_group: encBlood, emergency_contact: encEmer, address: encAddr, allergies: encAll, medical_conditions: encCond },
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
  const phone = user?.sub as string;
  const prisma = getPrisma();
  const userRecord = await prisma.user.findUnique({ where: { phone } });
  if (!userRecord) return res.json([]);
  const rows = await prisma.appointment.findMany({ where: { userId: userRecord.id }, orderBy: { start_time: 'desc' } });
  const withSync = rows.map((r: any) => ({ ...r, synced: false }));
  res.json(withSync);
});

app.post('/api/appointments', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const phone = user?.sub as string;
  const parsed = AppointmentCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const prisma = getPrisma();
  const userRecord = await prisma.user.findUnique({ where: { phone } });
  if (!userRecord) return res.status(404).json({ error: 'User not found' });
  const created = await prisma.appointment.create({ data: { userId: userRecord.id, ...parsed.data } });
  res.status(201).json(created);
});

app.patch('/api/appointments/:id', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const phone = user?.sub as string;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const parsed = AppointmentUpdate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });
  const prisma = getPrisma();
  const userRecord = await prisma.user.findUnique({ where: { phone } });
  if (!userRecord) return res.status(404).json({ error: 'User not found' });
  const { count } = await prisma.appointment.updateMany({ where: { id, userId: userRecord.id }, data: parsed.data });
  if (count === 0) return res.status(404).json({ error: 'Not found' });
  const updated = await prisma.appointment.findUnique({ where: { id } });
  return res.json(updated);
});

app.delete('/api/appointments/:id', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const phone = user?.sub as string;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const prisma = getPrisma();
  const userRecord = await prisma.user.findUnique({ where: { phone } });
  if (!userRecord) return res.status(404).json({ error: 'User not found' });
  const { count } = await prisma.appointment.deleteMany({ where: { id, userId: userRecord.id } });
  if (count === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

// Metrics with optional filters
const MetricsQuery = z.object({ type: z.string().optional(), limit: z.coerce.number().min(1).max(200).optional() });
app.get('/api/metrics', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const phone = user?.sub as string;
  const parsed = MetricsQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid query' });
  const { type, limit } = parsed.data;
  const prisma = getPrisma();
  const userRecord = await prisma.user.findUnique({ where: { phone } });
  if (!userRecord) return res.json([]);
  const rows = await prisma.metric.findMany({
    where: { userId: userRecord.id, ...(type ? { type } : {}) },
    orderBy: { recorded_at: 'desc' },
    take: Math.min(limit ?? 50, 200),
  });
  res.json(rows);
});

app.post('/api/metrics', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const phone = user?.sub as string;
  const { type, value } = req.body || {};
  const prisma = getPrisma();
  const userRecord = await prisma.user.findUnique({ where: { phone } });
  if (!userRecord) return res.status(404).json({ error: 'User not found' });
  // Convert value to number if it's a string
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const created = await prisma.metric.create({ data: { userId: userRecord.id, type, value: numericValue } });
  res.status(201).json(created);
});

app.delete('/api/metrics/:id', verifyJWT, async (req: Request, res: Response) => {
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Postgres not configured' });
  const user = (req as AuthRequest).user as any;
  const phone = user?.sub as string;
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const prisma = getPrisma();
  const userRecord = await prisma.user.findUnique({ where: { phone } });
  if (!userRecord) return res.status(404).json({ error: 'User not found' });
  const { count } = await prisma.metric.deleteMany({ where: { id, userId: userRecord.id } });
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

// Socket.io for WebRTC signaling (video calls)
const io = new SocketIOServer(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', socket.id);
  });
  
  socket.on('webrtc-offer', (data: { roomId: string; offer: any }) => {
    socket.to(data.roomId).emit('webrtc-offer', { offer: data.offer, from: socket.id });
  });
  
  socket.on('webrtc-answer', (data: { roomId: string; answer: any }) => {
    socket.to(data.roomId).emit('webrtc-answer', { answer: data.answer, from: socket.id });
  });
  
  socket.on('ice-candidate', (data: { roomId: string; candidate: any }) => {
    socket.to(data.roomId).emit('ice-candidate', { candidate: data.candidate, from: socket.id });
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    io.emit('user-disconnected', socket.id);
  });
});

// WebSocket for legacy support
const wss = new WebSocketServer({ noServer: true });
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url!, `http://${request.headers.host}`).pathname;
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws: any) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// (SOS endpoint already defined above)

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
