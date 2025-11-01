import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { getPgPool, testPgConnection, initPgSchema } from '../src/db/pg';

// Usage: ts-node --transpile-only scripts/import_hospitals.ts "C:\\path\\to\\file.csv"
async function main() {
  const csvPath = process.argv[2] || path.resolve(process.cwd(), 'hospitals.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found:', csvPath);
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  await testPgConnection();
  await initPgSchema();
  const pg = getPgPool();

  console.log('Importing hospitals from', csvPath);

  const parser = fs.createReadStream(csvPath).pipe(parse({
    bom: true,
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }));

  const batch: any[] = [];
  let total = 0;

  async function flush() {
    if (batch.length === 0) return;
    const client = await pg.connect();
    try {
      await client.query('BEGIN');
      for (const r of batch) {
        await client.query(
          `INSERT INTO hospitals (name, address, city, state, phone, type, beds, latitude, longitude)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT DO NOTHING`,
          [r.name, r.address, r.city, r.state, r.phone, r.type, r.beds, r.latitude, r.longitude]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Batch insert failed:', e);
      process.exit(1);
    } finally {
      client.release();
    }
    total += batch.length;
    console.log(`Inserted batch: ${batch.length}, total: ${total}`);
    batch.length = 0;
  }

  for await (const record of parser) {
    const name = record.name || record.Name || record.hospital || record.Hospital || '';
    if (!name) continue;
    const city = record.city || record.City || '';
    const state = record.state || record.State || '';
    const address = record.address || record.Address || '';
    const phone = record.phone || record.Phone || record.contact || '';
    const type = record.type || record.Type || record.category || '';
    const beds = Number(record.beds || record.Beds || 0) || null;
    const latitude = parseFloat(record.latitude || record.lat || record.Latitude || '');
    const longitude = parseFloat(record.longitude || record.lng || record.Longitude || '');

    batch.push({ name, address, city, state, phone, type, beds, latitude: isFinite(latitude) ? latitude : null, longitude: isFinite(longitude) ? longitude : null });

    if (batch.length >= 500) await flush();
  }
  await flush();

  console.log('Import completed. Total inserted (approx):', total);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
