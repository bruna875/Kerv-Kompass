// api/neon/budget.js
// GET  → fetch all team budgets (optionally ?quarter=Q1)
// POST → upsert a budget entry (body: { team, quarter, designDays, engineeringDays, productDays })

import { neon }                       from '@neondatabase/serverless';
import { requireAuth, requireEditor } from '../_jwt.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;
  if (req.method !== 'GET' && !requireEditor(user, 'teamcapacity-neon', res)) return;

  const sql = neon(process.env.DATABASE_URL);

  // ── GET ─────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { quarter } = req.query;
      const rows = quarter
        ? await sql`
            SELECT team, quarter,
              design_days      AS "designDays",
              engineering_days AS "engineeringDays",
              product_days     AS "productDays"
            FROM team_budget WHERE quarter = ${quarter}
            ORDER BY team ASC`
        : await sql`
            SELECT team, quarter,
              design_days      AS "designDays",
              engineering_days AS "engineeringDays",
              product_days     AS "productDays"
            FROM team_budget
            ORDER BY team ASC, quarter ASC`;

      // Return as nested map: { teamName: { Q1: {...}, Q2: {...} } }
      const map = {};
      rows.forEach(function(r) {
        if (!map[r.team]) map[r.team] = {};
        map[r.team][r.quarter] = {
          design:      parseFloat(r.designDays)      || 0,
          engineering: parseFloat(r.engineeringDays) || 0,
          product:     parseFloat(r.productDays)     || 0
        };
      });
      return res.status(200).json(map);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST (upsert) ───────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const b = req.body;
      if (!b.team || !b.quarter) {
        return res.status(400).json({ error: 'team and quarter required' });
      }
      await sql`
        INSERT INTO team_budget (team, quarter, design_days, engineering_days, product_days)
        VALUES (${b.team}, ${b.quarter}, ${b.designDays ?? 0}, ${b.engineeringDays ?? 0}, ${b.productDays ?? 0})
        ON CONFLICT (team, quarter) DO UPDATE SET
          design_days      = EXCLUDED.design_days,
          engineering_days = EXCLUDED.engineering_days,
          product_days     = EXCLUDED.product_days
      `;
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
