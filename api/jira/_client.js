// api/jira/_client.js
// Shared Jira Cloud REST client — used by all /api/jira/* endpoints

function host()  { return process.env.JIRA_HOST; }
function email() { return process.env.JIRA_EMAIL; }
function token() { return process.env.JIRA_API_TOKEN; }

function authHeader() {
  const creds = Buffer.from(`${email()}:${token()}`).toString('base64');
  return `Basic ${creds}`;
}

function headers() {
  return {
    Authorization: authHeader(),
    Accept:        'application/json',
    'Content-Type':'application/json'
  };
}

export async function jiraGet(path) {
  const url = `https://${host()}${path}`;
  const r = await fetch(url, { headers: headers() });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Jira GET ${r.status} ${path}: ${t.slice(0, 300)}`);
  }
  return r.json();
}

export async function jiraPost(path, body) {
  const url = `https://${host()}${path}`;
  const r = await fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Jira POST ${r.status} ${path}: ${t.slice(0, 300)}`);
  }
  if (r.status === 204) return { ok: true };
  return r.json();
}

export async function jiraPut(path, body) {
  const url = `https://${host()}${path}`;
  const r = await fetch(url, { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Jira PUT ${r.status} ${path}: ${t.slice(0, 300)}`);
  }
  if (r.status === 204) return { ok: true };
  return r.json();
}
