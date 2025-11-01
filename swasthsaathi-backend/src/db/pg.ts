import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPgPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) throw new Error('Postgres not configured: set DATABASE_URL (or POSTGRES_URL)');
    const ssl = String(process.env.PGSSL || process.env.PG_SSL || 'false').toLowerCase() === 'true';
    pool = new Pool({ connectionString, max: 10, ssl: ssl ? { rejectUnauthorized: false } as any : undefined });
  }
  return pool;
}

export function isPgConfigured() {
  return !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

export async function testPgConnection() {
  if (!isPgConfigured()) return; // silently no-op when not configured
  const client = await getPgPool().connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
}

export async function initPgSchema() {
  if (!isPgConfigured()) return; // silently no-op when not configured
  const client = await getPgPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        full_name TEXT,
        email TEXT,
        phone TEXT,
        dob DATE,
        blood_group TEXT,
        emergency_contact TEXT,
        address TEXT,
        allergies TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        provider TEXT,
        reason TEXT,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        status TEXT DEFAULT 'scheduled',
        calendar_event_id TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS metrics (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        value NUMERIC,
        recorded_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS hospitals (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        city TEXT,
        state TEXT,
        phone TEXT,
        type TEXT,
        beds INTEGER,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS ngos (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        contact TEXT,
        website TEXT,
        city TEXT,
        tags TEXT,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
  } finally {
    client.release();
  }
}


