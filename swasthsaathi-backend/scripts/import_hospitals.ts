import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { PrismaClient } from '@prisma/client';

// Usage: ts-node --transpile-only scripts/import_hospitals.ts "C:\\path\\to\\file.csv"
async function main() {
  const csvPath = process.env.CSV_PATH || process.argv[2] || path.resolve(process.cwd(), 'hospitals.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found:', csvPath);
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  console.log('Importing hospitals from', csvPath);

  const parser = fs.createReadStream(csvPath).pipe(parse({
    bom: true,
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  }));

  let inserted = 0;
  let skipped = 0;

  let first = true;
  for await (const record of parser) {
    if (first) {
      console.log('Detected headers:', Object.keys(record));
      first = false;
    }
    const name = record.name || record.Name || record.hospital || record.Hospital || record.Hospital_Name || '';
    if (!name) continue;
    const city = record.city || record.City || '';
    const state = record.state || record.State || '';
    const address = record.address || record.Address || record.Street_Address_Raw || '';
    const phone = record.phone || record.Phone || record.contact || '';
    const type = record.type || record.Type || record.category || record.Classification || '';
    const beds = Number(record.beds || record.Beds || 0) || null;
    const latitude = parseFloat(record.latitude || record.lat || record.Latitude || record.Lat || '');
    const longitude = parseFloat(record.longitude || record.lng || record.Longitude || record.Long || '');

    // crude duplicate check by name+address
    const exists = await prisma.hospital.findFirst({ where: { name, address } });
    if (exists) { skipped++; continue; }
    await prisma.hospital.create({ data: {
      name,
      address: address || null,
      city: city || null,
      state: state || null,
      phone: phone || null,
      type: type || null,
      beds,
      latitude: isFinite(latitude) ? latitude : null,
      longitude: isFinite(longitude) ? longitude : null,
    }});
    inserted++;
  }
  console.log('Import completed. Inserted:', inserted, 'Skipped (duplicates):', skipped);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
