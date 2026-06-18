// seed-taxonomies.mjs — fast batch version using neon transactions

import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = "postgresql://neondb_owner:npg_0b2cePsmAXFk@ep-curly-tree-apk37mv4-pooler.c-7.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
const sql = neon(DATABASE_URL);
const DOWNLOADS = path.join(process.env.HOME, 'Downloads');

// ── CSV parser ──────────────────────────────────────────────────────────────
function parseCSV(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1); // strip BOM
  const lines = content.split('\n').filter(l => l.trim());
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
    return obj;
  }).filter(row => Object.values(row).some(v => v));
}

function parseCSVLine(line) {
  const result = [];
  let cur = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { result.push(cur); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur);
  return result;
}

// ── Bulk insert via neon transaction (chunks of 500) ────────────────────────
async function bulk(queries) {
  const SIZE = 500;
  for (let i = 0; i < queries.length; i += SIZE) {
    await sql.transaction(queries.slice(i, i + SIZE));
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Taxonomy tables — fast seed ===\n');

  // 1. emotions (10 rows)
  process.stdout.write('1. taxonomies_emotions … ');
  await sql`CREATE TABLE IF NOT EXISTS taxonomies_emotions (id VARCHAR(10) PRIMARY KEY, emotion_name TEXT NOT NULL)`;
  await sql`TRUNCATE taxonomies_emotions`;
  const emotions = parseCSV(path.join(DOWNLOADS, 'taxonomies_emotions.csv'));
  await bulk(emotions.map(r => sql`INSERT INTO taxonomies_emotions VALUES (${r['ID']}, ${r['Emotion Name']})`));
  console.log(`✓ ${emotions.length}`);

  // 2. sentiment (6 rows)
  process.stdout.write('2. taxonomies_sentiment … ');
  await sql`CREATE TABLE IF NOT EXISTS taxonomies_sentiment (id VARCHAR(10) PRIMARY KEY, name TEXT NOT NULL)`;
  await sql`TRUNCATE taxonomies_sentiment`;
  const sentiment = parseCSV(path.join(DOWNLOADS, 'taxonomies_sentiment.csv'));
  await bulk(sentiment.map(r => sql`INSERT INTO taxonomies_sentiment VALUES (${r['ID']}, ${r['Name']})`));
  console.log(`✓ ${sentiment.length}`);

  // 3. brand_safety (22 rows)
  process.stdout.write('3. taxonomies_brand_safety … ');
  await sql`CREATE TABLE IF NOT EXISTS taxonomies_brand_safety (id VARCHAR(20) PRIMARY KEY, brand_safety_name TEXT NOT NULL)`;
  await sql`TRUNCATE taxonomies_brand_safety`;
  const bs = parseCSV(path.join(DOWNLOADS, 'taxonomies_brand_safety.csv'));
  await bulk(bs.map(r => sql`INSERT INTO taxonomies_brand_safety VALUES (${r['ID']}, ${r['Brand Safety Name']})`));
  console.log(`✓ ${bs.length}`);

  // 4. objects (434 rows, no ID → SERIAL)
  process.stdout.write('4. taxonomies_objects … ');
  await sql`CREATE TABLE IF NOT EXISTS taxonomies_objects (id SERIAL PRIMARY KEY, name TEXT NOT NULL)`;
  await sql`TRUNCATE taxonomies_objects RESTART IDENTITY`;
  const objects = parseCSV(path.join(DOWNLOADS, 'taxonomies_objects.csv'));
  await bulk(objects.map(r => sql`INSERT INTO taxonomies_objects (name) VALUES (${r['Name']})`));
  console.log(`✓ ${objects.length}`);

  // 5. locations (123 rows)
  process.stdout.write('5. taxonomies_locations … ');
  await sql`CREATE TABLE IF NOT EXISTS taxonomies_locations (id VARCHAR(20) PRIMARY KEY, category TEXT, location_name TEXT NOT NULL, visual_contextual_cues TEXT)`;
  await sql`TRUNCATE taxonomies_locations`;
  const loc = parseCSV(path.join(DOWNLOADS, 'taxonomies_locations.csv'));
  await bulk(loc.map(r => sql`INSERT INTO taxonomies_locations VALUES (${r['ID']}, ${r['Category']}, ${r['Location Name']}, ${r['Visual/Contextual Cues']})`));
  console.log(`✓ ${loc.length}`);

  // 6. logos (476 rows)
  process.stdout.write('6. taxonomies_logos … ');
  await sql`CREATE TABLE IF NOT EXISTS taxonomies_logos (id VARCHAR(20) PRIMARY KEY, category TEXT, subcategory TEXT, logo_name TEXT NOT NULL)`;
  await sql`TRUNCATE taxonomies_logos`;
  const logos = parseCSV(path.join(DOWNLOADS, 'taxonomies_logos.csv'));
  await bulk(logos.map(r => sql`INSERT INTO taxonomies_logos VALUES (${r['ID']}, ${r['Category']}, ${r['Subcategory']}, ${r['Logo Name']})`));
  console.log(`✓ ${logos.length}`);

  // 7. IAB (697 rows)
  process.stdout.write('7. taxonomies_iab … ');
  await sql`CREATE TABLE IF NOT EXISTS taxonomies_iab (id INTEGER PRIMARY KEY, iab_name TEXT NOT NULL)`;
  await sql`TRUNCATE taxonomies_iab`;
  const iab = parseCSV(path.join(DOWNLOADS, 'taxonomies_IAB.csv'));
  await bulk(iab.map(r => sql`INSERT INTO taxonomies_iab VALUES (${parseInt(r['ID'])}, ${r['IAB Name']})`));
  console.log(`✓ ${iab.length}`);

  // 8. faces (1741 rows)
  process.stdout.write('8. taxonomies_faces … ');
  await sql`CREATE TABLE IF NOT EXISTS taxonomies_faces (id VARCHAR(20) PRIMARY KEY, category TEXT, subcategory TEXT, name TEXT NOT NULL)`;
  await sql`TRUNCATE taxonomies_faces`;
  const faces = parseCSV(path.join(DOWNLOADS, 'taxonomies_faces.csv'));
  await bulk(faces.map(r => sql`INSERT INTO taxonomies_faces VALUES (${r['ID']}, ${r['Category']}, ${r['Subcategory']}, ${r['Name']})`));
  console.log(`✓ ${faces.length}`);

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n=== Row counts ===');
  const counts = await sql`
    SELECT 'emotions'     AS t, COUNT(*) n FROM taxonomies_emotions    UNION ALL
    SELECT 'sentiment'    AS t, COUNT(*) n FROM taxonomies_sentiment   UNION ALL
    SELECT 'brand_safety' AS t, COUNT(*) n FROM taxonomies_brand_safety UNION ALL
    SELECT 'objects'      AS t, COUNT(*) n FROM taxonomies_objects     UNION ALL
    SELECT 'locations'    AS t, COUNT(*) n FROM taxonomies_locations   UNION ALL
    SELECT 'logos'        AS t, COUNT(*) n FROM taxonomies_logos       UNION ALL
    SELECT 'iab'          AS t, COUNT(*) n FROM taxonomies_iab         UNION ALL
    SELECT 'faces'        AS t, COUNT(*) n FROM taxonomies_faces
  `;
  counts.forEach(r => console.log(`  taxonomies_${r.t.padEnd(14)} ${r.n}`));
  console.log('\n✅ Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
