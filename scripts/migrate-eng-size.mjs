// scripts/migrate-eng-size.mjs
// Reads engineering_size column for every initiative,
// maps it to a short code, and writes it into roi_inputs as eng_size.
//
// Run: node --env-file=.env.local scripts/migrate-eng-size.mjs

import { neon } from '@neondatabase/serverless';

const SIZE_MAP = {
  'Extra Small': 'XS',
  'Small':       'S',
  'Medium':      'M',
  'Large':       'L',
  'Extra Large': 'XL',
};

const sql = neon(process.env.DATABASE_URL);

async function run() {
  const rows = await sql`
    SELECT id, engineering_size AS "engineeringSize", roi_inputs AS "roiInputs"
    FROM initiatives
    WHERE engineering_size IS NOT NULL AND engineering_size <> ''
  `;

  console.log(`Found ${rows.length} initiative(s) with an engineering_size value.\n`);

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const code = SIZE_MAP[row.engineeringSize];
    if (!code) {
      console.log(`  [SKIP] id=${row.id}  unknown size: "${row.engineeringSize}"`);
      skipped++;
      continue;
    }

    // Parse existing roi_inputs (or start fresh)
    let inputs = {};
    if (row.roiInputs) {
      try { inputs = JSON.parse(row.roiInputs); } catch { /* keep empty */ }
    }

    inputs.eng_size = code;

    await sql`
      UPDATE initiatives
      SET roi_inputs = ${JSON.stringify(inputs)},
          updated_at = NOW()
      WHERE id = ${row.id}
    `;

    console.log(`  [OK]   id=${row.id}  "${row.engineeringSize}" → eng_size: "${code}"`);
    updated++;
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped.`);
}

run().catch(err => { console.error(err); process.exit(1); });
