// api/neon/fix-teams.js
// One-time migration: renames old team strings in both `teams` and `initiatives`
// GET /api/neon/fix-teams  → runs the migration and returns a report

import { neon } from '@neondatabase/serverless';

const RENAMES = [
  { from: 'APIs',            to: 'Content / APIs'   },
  { from: 'API Team',        to: 'Content / APIs'   },
  { from: 'Shared Services', to: 'Security / DevOps' },
  { from: 'Reporting',       to: 'Data'              },
  { from: 'Reporting Team',  to: 'Data'              },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const sql = neon(process.env.DATABASE_URL);
  const report = [];

  for (const { from, to } of RENAMES) {
    // Update teams table
    try {
      const r1 = await sql`UPDATE teams SET name=${to} WHERE name=${from}`;
      if (r1.count > 0) report.push({ table: 'teams', from, to, rows: r1.count });
    } catch (e) {
      report.push({ table: 'teams', from, to, error: e.message });
    }

    // Update initiatives table
    try {
      const r2 = await sql`UPDATE initiatives SET team=${to} WHERE team=${from}`;
      if (r2.count > 0) report.push({ table: 'initiatives', from, to, rows: r2.count });
    } catch (e) {
      report.push({ table: 'initiatives', from, to, error: e.message });
    }

    // Update team_budget table
    try {
      const r3 = await sql`UPDATE team_budget SET team=${to} WHERE team=${from}`;
      if (r3.count > 0) report.push({ table: 'team_budget', from, to, rows: r3.count });
    } catch (e) {
      report.push({ table: 'team_budget', from, to, error: e.message });
    }
  }

  return res.status(200).json({ ok: true, applied: report });
}
