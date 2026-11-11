import { createLeadership, applyLeadership } from '../../shared/leadership-model.mjs';

const PLAN_ID = 'allianzfuehrung';
const reply = (data, status, origin) => Response.json(data, { status, headers: {
  'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization', Vary: 'Origin',
}});
function authorized(request, secret) {
  if (typeof secret !== 'string' || secret.length < 32) return false;
  const provided = request.headers.get('Authorization') || ''; const expected = `Bearer ${secret}`;
  let difference = provided.length ^ expected.length;
  for (let i = 0; i < expected.length; i++) difference |= (provided.charCodeAt(i) || 0) ^ expected.charCodeAt(i);
  return difference === 0;
}
export async function leadership(request, env, origin) {
  if (request.method === 'OPTIONS') return reply(null, 200, origin);
  if (!['GET', 'POST'].includes(request.method)) return reply({ error: 'Method not allowed' }, 405, origin);
  const canEdit = authorized(request, env.LEADERSHIP_EDIT_TOKEN);
  if (request.method === 'POST' && !canEdit) return reply({ error: 'Edit link required' }, 403, origin);
  try {
    const db = env.DB.withSession ? env.DB.withSession('first-primary') : env.DB;
    await db.prepare(`CREATE TABLE IF NOT EXISTS leadership_plans (
      id TEXT PRIMARY KEY, draft TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();
    await db.prepare('INSERT OR IGNORE INTO leadership_plans (id, draft) VALUES (?, ?)').bind(PLAN_ID, JSON.stringify(createLeadership())).run();
    const read = async () => {
      const row = await db.prepare('SELECT draft, revision, updated_at FROM leadership_plans WHERE id = ?').bind(PLAN_ID).first();
      return { draft: JSON.parse(row.draft), revision: row.revision, updatedAt: row.updated_at, canEdit };
    };
    const current = await read();
    if (request.method === 'GET') return reply(current, 200, origin);
    let body, next;
    try {
      const raw = await request.text(); if (raw.length > 1_800_000) return reply({ error: 'Request too large' }, 413, origin);
      body = JSON.parse(raw);
      if (!Number.isSafeInteger(body.revision) || body.revision < 0) throw new Error('Invalid revision');
      if (body.revision !== current.revision) return reply(current, 409, origin);
      next = applyLeadership(current.draft, body.changes);
      if (JSON.stringify(next).length > 1_500_000) throw new Error('Draft too large');
    } catch { return reply({ error: 'Invalid leadership update' }, 400, origin); }
    const result = await db.prepare(`UPDATE leadership_plans SET draft = ?, revision = revision + 1,
      updated_at = CURRENT_TIMESTAMP WHERE id = ? AND revision = ?`).bind(JSON.stringify(next), PLAN_ID, body.revision).run();
    if (!result.meta.changes) return reply(await read(), 409, origin);
    return reply(await read(), 200, origin);
  } catch { return reply({ error: 'Leadership storage unavailable' }, 503, origin); }
}
