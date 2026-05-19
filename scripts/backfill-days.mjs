// scripts/backfill-days.mjs
// For every initiative that has eng_size in roi_inputs but no eng_days/des_days/prd_days,
// compute the days from DB assumptions and write them back to:
//   • design_days, engineering_days, product_days  (columns — used by Team Capacity)
//   • roi_inputs JSON  (eng_days, des_days, prd_days — for future reads)
//
// Run: node --env-file=.env.local scripts/backfill-days.mjs

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// ── Load global assumptions ─────────────────────────────────────────────────
const asmRows = await sql`SELECT name, value FROM assumptions WHERE initiative_id IS NULL`;
function getAsm(namePart) {
  const lc = namePart.toLowerCase();
  const a  = asmRows.find(x => x.name.toLowerCase().includes(lc));
  return a ? (parseFloat(a.value) || 0) : 0;
}

const ENG_SIZE = { XS: getAsm('engineering t-shirt sizing - xs'), S: getAsm('engineering t-shirt sizing - s'), M: getAsm('engineering t-shirt sizing - m'), L: getAsm('engineering t-shirt sizing - l'), XL: getAsm('engineering t-shirt sizing - xl') };
const DES_SIZE = { XS: getAsm('design t-shirt sizing - xs'),      S: getAsm('design t-shirt sizing - s'),      M: getAsm('design t-shirt sizing - m'),      L: getAsm('design t-shirt sizing - l'),      XL: getAsm('design t-shirt sizing - xl') };
const PM_RATIO = getAsm('ratio engineer:pm') || getAsm('ratio engineer pm') || getAsm('engineer:pm') || 2.5;

console.log('Engineering sizing map:', ENG_SIZE);
console.log('Design sizing map:     ', DES_SIZE);
console.log('Engineer:PM ratio:     ', PM_RATIO);
console.log('');

// ── Load initiatives ────────────────────────────────────────────────────────
const rows = await sql`
  SELECT id, roi_inputs AS "roiInputs"
  FROM   initiatives
  WHERE  roi_inputs IS NOT NULL AND roi_inputs <> ''
`;

let updated = 0, skipped = 0;

for (const row of rows) {
  let ri = {};
  try { ri = JSON.parse(row.roiInputs); } catch(e) { skipped++; continue; }

  // Skip if days already present and non-zero
  if (ri.eng_days > 0 || ri.des_days > 0 || ri.prd_days > 0) {
    console.log(`  [SKIP] id=${row.id}  days already set (eng:${ri.eng_days} des:${ri.des_days} prd:${ri.prd_days})`);
    skipped++;
    continue;
  }

  const engCode = (ri.eng_size || '').toUpperCase();
  const desCode = (ri.des_size || ri.eng_size || '').toUpperCase(); // fall back to eng_size if des_size missing
  if (!engCode) { skipped++; continue; }

  const engDays = ENG_SIZE[engCode] || 0;
  const desDays = DES_SIZE[desCode] || 0;
  const prdDays = (PM_RATIO > 0 && engDays > 0) ? Math.floor(engDays / PM_RATIO) : 0;

  if (engDays === 0 && desDays === 0 && prdDays === 0) {
    console.log(`  [SKIP] id=${row.id}  size "${engCode}" maps to 0 days — check assumption names`);
    skipped++;
    continue;
  }

  // Write back to JSON and columns
  ri.eng_days = engDays;
  ri.des_days = desDays;
  ri.prd_days = prdDays;

  await sql`
    UPDATE initiatives
    SET design_days      = ${desDays},
        engineering_days = ${engDays},
        product_days     = ${prdDays},
        roi_inputs       = ${JSON.stringify(ri)},
        updated_at       = NOW()
    WHERE id = ${row.id}
  `;

  console.log(`  [OK]   id=${row.id}  ${engCode} → eng:${engDays}d  des:${desDays}d  prd:${prdDays}d`);
  updated++;
}

console.log(`\nDone. ${updated} updated, ${skipped} skipped.`);
