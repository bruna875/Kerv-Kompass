// api/neon/assumptions.js
// GET    ?initiative_id=N  → assumptions for that initiative (all if omitted)
// POST   → create (no id) or update (with id)
// DELETE → delete by id

import { neon }                       from '@neondatabase/serverless';
import { requireAuth, requireEditor } from '../_jwt.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;
  if (req.method !== 'GET' && !requireEditor(user, 'roadmap-neon', res)) return;

  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      const { initiative_id } = req.query;
      const rows = initiative_id
        ? await sql`
            SELECT a.id, a.initiative_id AS "initiativeId", i.title AS "initiativeTitle",
                   a.category, a.name, a.value, a.unit,
                   a.created_at AS "createdAt"
            FROM assumptions a
            LEFT JOIN initiatives i ON i.id = a.initiative_id
            WHERE a.initiative_id = ${initiative_id}
            ORDER BY a.id ASC`
        : await sql`
            SELECT a.id, a.initiative_id AS "initiativeId", i.title AS "initiativeTitle",
                   a.category, a.name, a.value, a.unit,
                   a.created_at AS "createdAt"
            FROM assumptions a
            LEFT JOIN initiatives i ON i.id = a.initiative_id
            ORDER BY i.title ASC, a.category ASC, a.id ASC`;
      return res.status(200).json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { id, initiativeId, category, name, value, unit } = req.body;
      if (!name) return res.status(400).json({ error: 'name required' });
      let rows;
      if (id) {
        rows = await sql`
          UPDATE assumptions
          SET initiative_id=${initiativeId ?? null},
              category=${category ?? 'Others'},
              name=${name},
              value=${value ?? null},
              unit=${unit ?? 'dollar'}
          WHERE id=${id} RETURNING id
        `;
      } else {
        rows = await sql`
          INSERT INTO assumptions (initiative_id, category, name, value, unit)
          VALUES (${initiativeId ?? null}, ${category ?? 'Others'}, ${name}, ${value ?? null}, ${unit ?? 'dollar'})
          RETURNING id
        `;
      }
      return res.status(200).json({ ok: true, id: rows[0]?.id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      await sql`DELETE FROM assumptions WHERE id=${id}`;
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
