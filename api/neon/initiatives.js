// api/neon/initiatives.js
// GET    → fetch all initiatives
// POST   → create or update an initiative (body: initiative object, id optional)
// PATCH  → partial update, only { id, jiraEpics } required
// DELETE → delete an initiative (body: { id })

import { neon }                       from '@neondatabase/serverless';
import { requireAuth, requireEditor } from '../_jwt.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;
  if (req.method !== 'GET' && !requireEditor(user, 'roadmap-neon', res)) return;

  const sql = neon(process.env.DATABASE_URL);

  // ── GET — list all ──────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      // Auto-migrate: add / drop columns as schema evolves
      await sql`ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS roi_inputs TEXT`;
      await sql`ALTER TABLE initiatives DROP COLUMN IF EXISTS roi`;
      await sql`ALTER TABLE initiatives DROP COLUMN IF EXISTS engineering_size`;
      await sql`ALTER TABLE initiatives ADD COLUMN IF NOT EXISTS jira_epics TEXT`;

      const rows = await sql`
        SELECT
          id, quarter, title, driver, team, theme,
          product_owner   AS "productOwner",
          tech_lead       AS "techLead",
          added_value     AS "addedValue",
          roi_inputs       AS "roiInputs",
          design_days      AS "designDays",
          engineering_days AS "engineeringDays",
          product_days     AS "productDays",
          delivery_status  AS "deliveryStatus",
          link, sort_order AS "sortOrder",
          year,
          jira_epics       AS "jiraEpics",
          created_at AS "createdAt", updated_at AS "updatedAt"
        FROM initiatives
        ORDER BY sort_order ASC, id ASC
      `;
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── PATCH — partial update (jira_epics only for now) ────────────────────────
  if (req.method === 'PATCH') {
    try {
      const { id, jiraEpics } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const val = jiraEpics != null ? JSON.stringify(jiraEpics) : null;
      await sql`UPDATE initiatives SET jira_epics = ${val} WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST — create or update ─────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const b = req.body;

      if (b.id) {
        // Update existing — extract jira_epics value before template literal
        const jiraEpicsVal = Array.isArray(b.jiraEpics) ? JSON.stringify(b.jiraEpics) : null;
        const rows = await sql`
          UPDATE initiatives SET
            quarter          = ${b.quarter          ?? 'Backlog'},
            title            = ${b.title            ?? ''},
            driver           = ${b.driver           ?? ''},
            team             = ${b.team             ?? ''},
            theme            = ${b.theme            ?? ''},
            product_owner    = ${b.productOwner     ?? ''},
            tech_lead        = ${b.techLead         ?? ''},
            added_value      = ${b.addedValue       ?? null},
            design_days      = ${b.designDays        ?? 0},
            engineering_days = ${b.engineeringDays  ?? 0},
            product_days     = ${b.productDays      ?? 0},
            year             = ${b.year             ?? new Date().getFullYear()},
            delivery_status  = ${b.deliveryStatus   ?? 'not-started'},
            link             = ${b.link             ?? ''},
            sort_order       = ${b.sortOrder        ?? 0},
            roi_inputs       = ${b.roiInputs        ?? null},
            jira_epics       = ${jiraEpicsVal}
          WHERE id = ${b.id}
          RETURNING id
        `;
        return res.status(200).json({ ok: true, id: rows[0]?.id, _je: jiraEpicsVal });
      } else {
        // Insert new
        const rows = await sql`
          INSERT INTO initiatives
            (quarter, title, driver, team, theme, product_owner, tech_lead,
             added_value, roi_inputs, design_days, engineering_days, product_days,
             year, delivery_status, link, sort_order, jira_epics)
          VALUES
            (${b.quarter          ?? 'Backlog'},
             ${b.title            ?? ''},
             ${b.driver           ?? ''},
             ${b.team             ?? ''},
             ${b.theme            ?? ''},
             ${b.productOwner     ?? ''},
             ${b.techLead         ?? ''},
             ${b.addedValue       ?? null},
             ${b.roiInputs        ?? null},
             ${b.designDays       ?? 0},
             ${b.engineeringDays  ?? 0},
             ${b.productDays      ?? 0},
             ${b.year             ?? new Date().getFullYear()},
             ${b.deliveryStatus   ?? 'not-started'},
             ${b.link             ?? ''},
             ${b.sortOrder        ?? 0},
             ${b.jiraEpics !== undefined ? JSON.stringify(b.jiraEpics) : null})
          RETURNING id
        `;
        return res.status(201).json({ ok: true, id: rows[0].id });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── DELETE ──────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM initiatives WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
