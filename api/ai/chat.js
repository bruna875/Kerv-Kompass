// api/ai/chat.js
// POST { messages: [{role, content}], pageId: string }
// Returns SSE stream: data: { text } ... data: [DONE]

import Groq           from 'groq-sdk';
import { neon }       from '@neondatabase/serverless';
import { requireAuth } from '../_jwt.js';

const MODEL = 'llama-3.3-70b-versatile';

// ── Context builder ────────────────────────────────────────────────────────────

async function buildContext(sql, pageId) {
  const sections = [];

  // ── Fetch ALL platform data in parallel ──────────────────────────────────────
  const [
    teams,
    themes,
    jiraProjects,
    initiatives,
    productRequests,
    members,
    budget,
  ] = await Promise.all([
    sql`SELECT name, description FROM teams ORDER BY name ASC`.catch(() => []),
    sql`SELECT name FROM themes ORDER BY name ASC`.catch(() => []),
    sql`SELECT jira_id, team_name, board_type FROM jira_projects ORDER BY sort_order ASC`.catch(() => []),
    sql`
      SELECT title, quarter, team, theme, driver, delivery_status AS status,
             added_value AS value, engineering_days, design_days, product_days, year
      FROM initiatives
      ORDER BY year DESC, sort_order ASC
      LIMIT 120
    `.catch(() => []),
    sql`
      SELECT title, requester_name, team, theme, priority, status
      FROM product_requests
      ORDER BY created_at DESC
      LIMIT 80
    `.catch(() => []),
    sql`SELECT name, title, role FROM team_members ORDER BY name ASC`.catch(() => []),
    sql`SELECT team, quarter, design_days, engineering_days, product_days FROM team_budget ORDER BY team, quarter`.catch(() => []),
  ]);

  // Reference data
  if (teams.length) {
    sections.push('**Teams:** ' + teams.map(t => t.name + (t.description ? ` (${t.description})` : '')).join(', '));
  }
  if (themes.length) {
    sections.push('**Themes/Categories:** ' + themes.map(t => t.name).join(', '));
  }
  if (jiraProjects.length) {
    sections.push('**Jira Projects:** ' + jiraProjects.map(p => `${p.jira_id} → ${p.team_name} (${p.board_type})`).join(', '));
  }

  // Roadmap initiatives (always)
  if (initiatives.length) {
    const byQ = {};
    initiatives.forEach(r => {
      const k = `${r.year} ${r.quarter}`;
      if (!byQ[k]) byQ[k] = [];
      byQ[k].push(`• ${r.title} [${r.team}] — ${r.status}${r.value ? ` | Value: ${r.value}` : ''}`);
    });
    const lines = Object.entries(byQ).map(([q, items]) => `**${q}:**\n${items.join('\n')}`).join('\n\n');
    sections.push('**Roadmap Initiatives:**\n' + lines);
  }

  // Product requests (always)
  if (productRequests.length) {
    const byStatus = {};
    productRequests.forEach(r => {
      if (!byStatus[r.status]) byStatus[r.status] = [];
      byStatus[r.status].push(`• [${r.priority?.toUpperCase()}] ${r.title} — by ${r.requester_name}${r.team ? ` (${r.team})` : ''}`);
    });
    const lines = Object.entries(byStatus).map(([s, items]) => `**${s}:**\n${items.join('\n')}`).join('\n\n');
    sections.push('**Product Requests:**\n' + lines);
  }

  // Team members & capacity (always)
  if (members.length) {
    sections.push('**Team Members:** ' + members.map(m => `${m.name} (${m.role}${m.title ? ` — ${m.title}` : ''})`).join(', '));
  }
  if (budget.length) {
    const lines = budget.map(b => `• ${b.team} ${b.quarter}: Design ${b.design_days}d, Eng ${b.engineering_days}d, Product ${b.product_days}d`).join('\n');
    sections.push('**Team Capacity Budget:**\n' + lines);
  }

  // Note which page the user is currently on
  if (pageId) {
    const label = pageId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    sections.push(`**User's current page:** ${label}`);
  }

  return sections.join('\n\n');
}

// ── Handler ────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = requireAuth(req, res);
  if (!user) return;

  const { messages = [], pageId = '' } = req.body || {};
  if (!messages.length) return res.status(400).json({ error: 'messages required' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

  // Build context
  const sql = neon(process.env.DATABASE_URL);
  const context = await buildContext(sql, pageId);

  const pageLabel = pageId
    ? pageId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Dashboard Overview';

  const systemPrompt = `You are Gigi AI, an intelligent assistant embedded in the KERV Team product management platform.
You help product managers, engineers, and stakeholders understand roadmap status, team capacity, product requests, and sprint metrics.
You have full visibility into the entire platform — roadmap, product requests, team members, capacity budgets, and more.

**Live platform data:**
${context || 'No platform data available.'}

**Guidelines:**
- Be concise and direct. Avoid filler phrases.
- Use bullet points and bold text when it aids clarity.
- When referencing specific initiatives, requests, or team data, use the actual data provided above.
- If asked something outside your data, say so clearly and suggest what you can help with.
- Respond in the same language the user writes in.
- Today's date: ${new Date().toISOString().slice(0, 10)}.`;

  // Sanitise messages: only user/assistant roles, string content
  const safeMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: String(m.content || '') }))
    .slice(-20); // last 20 turns max

  // Stream SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const groq = new Groq({ apiKey });
    const stream = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: 'system', content: systemPrompt }, ...safeMessages],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e) {
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
