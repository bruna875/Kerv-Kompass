import { neon } from '@neondatabase/serverless';
import { requireAuth, requireEditor } from '../_jwt.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  const sql = neon(process.env.DATABASE_URL);

  // Auto-migrate tables
  await sql`CREATE TABLE IF NOT EXISTS okr_objectives (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::int,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS okr_key_results (
    id SERIAL PRIMARY KEY,
    objective_id INTEGER REFERENCES okr_objectives(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    owner TEXT DEFAULT '',
    type TEXT DEFAULT 'percent',
    goal_value NUMERIC DEFAULT NULL,
    current_value NUMERIC DEFAULT 0,
    department TEXT DEFAULT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS goal_value NUMERIC DEFAULT NULL`;
  await sql`ALTER TABLE okr_objectives ADD COLUMN IF NOT EXISTS departments TEXT DEFAULT '[]'`;
  await sql`ALTER TABLE okr_objectives ADD COLUMN IF NOT EXISTS quarter TEXT DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS quarter TEXT DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS jan_value NUMERIC DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS feb_value NUMERIC DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS mar_value NUMERIC DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS apr_value NUMERIC DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS may_value NUMERIC DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS jun_value NUMERIC DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS jul_value NUMERIC DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS aug_value NUMERIC DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS sep_value NUMERIC DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS oct_value NUMERIC DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS nov_value NUMERIC DEFAULT NULL`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS dec_value NUMERIC DEFAULT NULL`;
  // Migrate: drop legacy columns, rename team → department
  await sql`ALTER TABLE okr_key_results DROP COLUMN IF EXISTS target_value`;
  await sql`ALTER TABLE okr_key_results DROP COLUMN IF EXISTS notes`;
  // Rename team → department (idempotent: silently skips if already renamed)
  try { await sql`ALTER TABLE okr_key_results RENAME COLUMN team TO department`; } catch(_) {}
  // Ensure department column exists after any migration path
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS department TEXT DEFAULT NULL`;
  // Archive support
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`;
  await sql`ALTER TABLE okr_key_results ADD COLUMN IF NOT EXISTS note TEXT DEFAULT ''`;

  // GET — return objectives + key results for a year, plus all available years
  if (req.method === 'GET') {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const [objectives, allYearsRows] = await Promise.all([
        sql`SELECT * FROM okr_objectives WHERE year = ${year} ORDER BY sort_order, id`,
        sql`SELECT DISTINCT year FROM okr_objectives ORDER BY year ASC`
      ]);
      const keyResults = objectives.length > 0
        ? await sql`SELECT * FROM okr_key_results WHERE objective_id = ANY(${objectives.map(o => o.id)}) AND (status IS NULL OR status = 'active') ORDER BY objective_id, department NULLS FIRST, sort_order, id`
        : [];
      const availableYears = allYearsRows.map(r => r.year);
      if (!availableYears.includes(year)) availableYears.push(year);
      availableYears.sort();
      return res.json({ objectives, keyResults, availableYears });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  // POST — save-objective | save-kr | update-progress
  if (req.method === 'POST') {
    const body = req.body;
    try {
      if (body.action === 'save-objective') {
        if (!requireEditor(user, 'company-okrs', res)) return;
        const { id, title, description, year, sortOrder, departments } = body;
        const depts = JSON.stringify(Array.isArray(departments) ? departments : []);
        if (id) {
          await sql`UPDATE okr_objectives SET title=${title}, description=${description||''}, year=${year||new Date().getFullYear()}, sort_order=${sortOrder||0}, departments=${depts} WHERE id=${id}`;
          return res.json({ ok: true, id });
        } else {
          const [row] = await sql`INSERT INTO okr_objectives (title,description,year,sort_order,departments) VALUES (${title},${description||''},${year||new Date().getFullYear()},${sortOrder||0},${depts}) RETURNING id`;
          return res.json({ ok: true, id: row.id });
        }
      }
      if (body.action === 'save-kr') {
        if (!requireEditor(user, 'company-okrs', res)) return;
        const { id, objectiveId, title, owner, type, goalValue, currentValue, department, sortOrder, year } = body;
        const { janValue, febValue, marValue, aprValue, mayValue, junValue, julValue, augValue, sepValue, octValue, novValue, decValue } = body;
        const gv = (goalValue !== undefined && goalValue !== null && goalValue !== '') ? goalValue : null;
        const yr = year ? parseInt(year) : null;
        const mv = (v) => v !== undefined && v !== null ? parseFloat(v) : null;
        if (id) {
          await sql`UPDATE okr_key_results SET title=${title}, owner=${owner||''}, type=${type||'percent'}, goal_value=${gv}, current_value=${currentValue||0}, department=${department||null}, sort_order=${sortOrder||0}, year=${yr}, jan_value=${mv(janValue)}, feb_value=${mv(febValue)}, mar_value=${mv(marValue)}, apr_value=${mv(aprValue)}, may_value=${mv(mayValue)}, jun_value=${mv(junValue)}, jul_value=${mv(julValue)}, aug_value=${mv(augValue)}, sep_value=${mv(sepValue)}, oct_value=${mv(octValue)}, nov_value=${mv(novValue)}, dec_value=${mv(decValue)} WHERE id=${id}`;
          return res.json({ ok: true, id });
        } else {
          const [row] = await sql`INSERT INTO okr_key_results (objective_id,title,owner,type,goal_value,current_value,department,sort_order,year,jan_value,feb_value,mar_value,apr_value,may_value,jun_value,jul_value,aug_value,sep_value,oct_value,nov_value,dec_value) VALUES (${objectiveId},${title},${owner||''},${type||'percent'},${gv},${currentValue||0},${department||null},${sortOrder||0},${yr},${mv(janValue)},${mv(febValue)},${mv(marValue)},${mv(aprValue)},${mv(mayValue)},${mv(junValue)},${mv(julValue)},${mv(augValue)},${mv(sepValue)},${mv(octValue)},${mv(novValue)},${mv(decValue)}) RETURNING id`;
          return res.json({ ok: true, id: row.id });
        }
      }
      if (body.action === 'archive-kr') {
        if (!requireEditor(user, 'company-okrs', res)) return;
        const { id, status, note } = body;
        const validStatus = status === 'missed' ? 'missed' : 'completed';
        await sql`UPDATE okr_key_results SET status=${validStatus}, note=${note||''} WHERE id=${id}`;
        return res.json({ ok: true });
      }
      if (body.action === 'update-progress') {
        const canUpdate = user.superAdmin ||
          (user.permissions && (user.permissions['company-okrs'] || user.permissions['roadmap-neon']));
        if (!canUpdate) return res.status(403).json({ error: 'Forbidden' });
        const { id, currentValue } = body;
        await sql`UPDATE okr_key_results SET current_value=${currentValue||0} WHERE id=${id}`;
        return res.json({ ok: true });
      }
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  // DELETE
  if (req.method === 'DELETE') {
    if (!requireEditor(user, 'company-okrs', res)) return;
    try {
      const { type, id } = req.body;
      if (type === 'objective') await sql`DELETE FROM okr_objectives WHERE id=${id}`;
      else if (type === 'kr') await sql`DELETE FROM okr_key_results WHERE id=${id}`;
      return res.json({ ok: true });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }
}
