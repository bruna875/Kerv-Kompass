// api/migrate.js — run once to create / update the Neon schema
// Call via: GET /api/migrate?secret=<MIGRATE_SECRET>

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const secret = req.query.secret;
  if (process.env.NODE_ENV === 'production' && secret !== process.env.MIGRATE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {

    // ── initiatives ──────────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS initiatives (
        id               SERIAL PRIMARY KEY,
        quarter          VARCHAR(20)     NOT NULL DEFAULT 'Backlog',
        title            TEXT            NOT NULL,
        driver           TEXT            NOT NULL DEFAULT '',
        team             TEXT            NOT NULL DEFAULT '',
        theme            TEXT            NOT NULL DEFAULT '',
        product_owner    TEXT            NOT NULL DEFAULT '',
        tech_lead        TEXT            NOT NULL DEFAULT '',
        added_value      NUMERIC(15, 2),
        roi              NUMERIC(8, 4),
        design_days      NUMERIC(6, 1)   NOT NULL DEFAULT 0,
        engineering_days NUMERIC(6, 1)   NOT NULL DEFAULT 0,
        product_days     NUMERIC(6, 1)   NOT NULL DEFAULT 0,
        delivery_status  VARCHAR(20)     NOT NULL DEFAULT 'not-started',
        confidence       VARCHAR(20)     NOT NULL DEFAULT 'medium',
        link             TEXT            NOT NULL DEFAULT '',
        sort_order       INTEGER         NOT NULL DEFAULT 0,
        created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      )
    `;

    // ── team_budget ───────────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS team_budget (
        id               SERIAL PRIMARY KEY,
        team             TEXT            NOT NULL,
        quarter          VARCHAR(20)     NOT NULL,
        design_days      NUMERIC(6, 1)   NOT NULL DEFAULT 0,
        engineering_days NUMERIC(6, 1)   NOT NULL DEFAULT 0,
        product_days     NUMERIC(6, 1)   NOT NULL DEFAULT 0,
        UNIQUE (team, quarter)
      )
    `;

    // ── teams ─────────────────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS teams (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `;

    // ── team_members ──────────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id          SERIAL PRIMARY KEY,
        name        TEXT        NOT NULL,
        picture_url TEXT        NOT NULL DEFAULT '',
        role        VARCHAR(20) NOT NULL DEFAULT 'Product',
        team_id     INTEGER     REFERENCES teams(id) ON DELETE SET NULL
      )
    `;
    // Add team_id if the table already existed without it
    await sql`
      ALTER TABLE team_members
      ADD COLUMN IF NOT EXISTS team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL
    `;
    // Add title column
    await sql`
      ALTER TABLE team_members
      ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT ''
    `;
    // Add all_teams flag
    await sql`
      ALTER TABLE team_members
      ADD COLUMN IF NOT EXISTS all_teams BOOLEAN NOT NULL DEFAULT FALSE
    `;
    // Add team_ids (JSON array of team IDs, replaces single team_id)
    await sql`
      ALTER TABLE team_members
      ADD COLUMN IF NOT EXISTS team_ids TEXT NOT NULL DEFAULT '[]'
    `;
    // Migrate existing single team_id → team_ids
    await sql`
      UPDATE team_members
      SET team_ids = '[' || team_id || ']'
      WHERE team_id IS NOT NULL AND (team_ids = '[]' OR team_ids = '')
    `;

    // ── drivers ───────────────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS drivers (
        id             SERIAL PRIMARY KEY,
        name           TEXT        NOT NULL UNIQUE,
        template_slug  VARCHAR(60) NOT NULL DEFAULT ''
      )
    `;
    // Add template_slug if the table already existed without it
    await sql`
      ALTER TABLE drivers
      ADD COLUMN IF NOT EXISTS template_slug VARCHAR(60) NOT NULL DEFAULT ''
    `;

    // ── teams — description column ────────────────────────────────────────────
    await sql`
      ALTER TABLE teams
      ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''
    `;

    // ── themes ────────────────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS themes (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `;

    // ── engineering_size on initiatives ──────────────────────────────────────
    await sql`
      ALTER TABLE initiatives
      ADD COLUMN IF NOT EXISTS engineering_size VARCHAR(20) NOT NULL DEFAULT ''
    `;
    // ── year on initiatives (separate from quarter, not shown in UI) ─────────
    await sql`
      ALTER TABLE initiatives
      ADD COLUMN IF NOT EXISTS year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER
    `;

    // ── assumptions ───────────────────────────────────────────────────────────
    // Safe create — never drops existing data
    await sql`
      CREATE TABLE IF NOT EXISTS assumptions (
        id            SERIAL PRIMARY KEY,
        initiative_id INTEGER REFERENCES initiatives(id) ON DELETE CASCADE,
        category      VARCHAR(50)  NOT NULL DEFAULT 'Others',
        name          TEXT         NOT NULL,
        value         NUMERIC(15, 4),
        unit          VARCHAR(20)  NOT NULL DEFAULT 'dollar',
        created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `;

    // ── auto-update updated_at trigger ────────────────────────────────────────
    await sql`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    await sql`DROP TRIGGER IF EXISTS trg_initiatives_updated ON initiatives`;
    await sql`
      CREATE TRIGGER trg_initiatives_updated
      BEFORE UPDATE ON initiatives
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `;

    await sql`DROP TRIGGER IF EXISTS trg_assumptions_updated ON assumptions`;
    await sql`
      CREATE TRIGGER trg_assumptions_updated
      BEFORE UPDATE ON assumptions
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `;

    res.status(200).json({
      ok: true,
      message: 'Schema ready: initiatives, team_budget, teams, team_members, drivers, themes, assumptions'
    });

  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ error: err.message });
  }
}
