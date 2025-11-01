// Usage: node scripts/import_hospitals_auto.js "C:\\path\\to\\file.csv"
import 'dotenv/config';
import fs from 'fs';
import csv from 'csv-parser';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgres://pguser:pgpass@localhost:5432/healthsaathi_db';
const pool = new Pool({ connectionString });

const filePath = process.argv[2] || './data/hospitals.csv';

function matchHeader(headers, ...possibleNames) {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const name of possibleNames) {
    const found = lower.find((h) => h.includes(name.toLowerCase()));
    if (found) return headers[lower.indexOf(found)];
  }
  return null;
}

async function ensureSchema() {
  await pool.query(`
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
  `);
}

async function main() {
  if (!fs.existsSync(filePath)) {
    console.error('CSV file not found:', filePath);
    process.exit(1);
  }

  await ensureSchema();

  let detectedHeaders = null;
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headers) => {
        detectedHeaders = headers;
        console.log('\n🧾 Detected CSV Headers:\n', headers);
        resolve();
      })
      .on('error', reject);
  });

  if (!detectedHeaders) {
    console.error('Failed to detect headers.');
    process.exit(1);
  }

  const mappings = {
    name: matchHeader(detectedHeaders, 'hospital name', 'hospital', 'name', 'clinic'),
    city: matchHeader(detectedHeaders, 'city', 'district', 'location'),
    address: matchHeader(detectedHeaders, 'address', 'area', 'locality', 'street'),
    contact: matchHeader(detectedHeaders, 'phone', 'contact', 'mobile', 'contact no', 'contact number'),
    type: matchHeader(detectedHeaders, 'type', 'category', 'speciality', 'specialty'),
    beds: matchHeader(detectedHeaders, 'beds', 'capacity'),
    latitude: matchHeader(detectedHeaders, 'latitude', 'lat'),
    longitude: matchHeader(detectedHeaders, 'longitude', 'lng', 'long'),
  };

  console.log('\n📌 Column Mapping Used:\n', mappings);

  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        rows.push({
          name: data[mappings.name] || 'Unnamed Hospital',
          city: data[mappings.city] || null,
          address: data[mappings.address] || null,
          phone: data[mappings.contact] || null,
          type: data[mappings.type] || null,
          beds: data[mappings.beds] ? Number(data[mappings.beds]) : null,
          latitude: data[mappings.latitude] ? Number(data[mappings.latitude]) : null,
          longitude: data[mappings.longitude] ? Number(data[mappings.longitude]) : null,
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`\n📦 Ready to insert ${rows.length} hospitals.`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const h of rows) {
      await client.query(
        `INSERT INTO hospitals (name, address, city, state, phone, type, beds, latitude, longitude)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT DO NOTHING`,
        [h.name, h.address, h.city, null, h.phone, h.type, h.beds, h.latitude, h.longitude]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Insert failed:', e);
    process.exit(1);
  } finally {
    client.release();
  }

  console.log('\n✅ Import completed successfully.');
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
