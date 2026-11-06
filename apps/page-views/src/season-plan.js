const tags = new Set(['GGR', 'CCE', 'BTs', 'Lrs', 'IGGG', 'TuT', 'BOD', 'DIE', 'LIG', 'Beep']);
export const PLAN_ID = 'season-2026-11-06';
export function validateChanges(changes) {
  if (!Array.isArray(changes) || !changes.length || changes.length > 400) throw new Error('Invalid changes');
  const seen = new Set();
  return changes.map(({ code, entry }) => {
    if (typeof code !== 'string' || !/^[A-T](?:[1-9]|1[0-9]|20)$/.test(code) || seen.has(code)) throw new Error('Invalid cell');
    seen.add(code);
    if (entry === null) return { code, entry };
    if (!entry || typeof entry.note !== 'string' || entry.note.length > 300 || (entry.alliance !== '' && !tags.has(entry.alliance))) throw new Error('Invalid entry');
    return { code, entry: { alliance: entry.alliance, note: entry.note } };
  });
}
const reply = (data, status, origin) => Response.json(data, { status, headers: {
  'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization', Vary: 'Origin',
}});
function authorized(request, secret) {
  if (typeof secret !== 'string' || secret.length < 32) return false;
  const provided = request.headers.get('Authorization') || '';
  const expected = `Bearer ${secret}`;
  let difference = provided.length ^ expected.length;
  for (let i = 0; i < expected.length; i++) difference |= (provided.charCodeAt(i) || 0) ^ expected.charCodeAt(i);
  return difference === 0;
}
export async function seasonPlan(request, env, origin) {
  if (request.method === 'OPTIONS') return reply(null, 200, origin);
  if (!['GET', 'POST'].includes(request.method)) return reply({ error: 'Method not allowed' }, 405, origin);
  if (request.method === 'POST' && !authorized(request, env.SEASON_PLAN_EDIT_TOKEN)) return reply({ error: 'Edit link required' }, 403, origin);
  try {
    const db = env.DB.withSession ? env.DB.withSession('first-primary') : env.DB;
    await db.prepare(`CREATE TABLE IF NOT EXISTS season_plans (
      id TEXT PRIMARY KEY, cells TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();
    await db.prepare('INSERT OR IGNORE INTO season_plans (id, cells) VALUES (?, ?)').bind(PLAN_ID, '{}').run();
    const read = async () => {
      const row = await db.prepare('SELECT cells, revision, updated_at FROM season_plans WHERE id = ?').bind(PLAN_ID).first();
      return { map: PLAN_ID, cells: JSON.parse(row.cells), revision: row.revision, updatedAt: row.updated_at };
    };
    const current = await read();
    if (request.method === 'GET') return reply({ ...current, canEdit: authorized(request, env.SEASON_PLAN_EDIT_TOKEN) }, 200, origin);
    let body, changes;
    try {
      const raw = await request.text();
      if (raw.length > 200000) return reply({ error: 'Request too large' }, 413, origin);
      body = JSON.parse(raw);
      if (!Number.isSafeInteger(body.revision) || body.revision < 0) throw new Error('Invalid revision');
      changes = validateChanges(body.changes);
    } catch { return reply({ error: 'Invalid plan update' }, 400, origin); }
    if (current.revision !== body.revision) return reply(current, 409, origin);
    for (const { code, entry } of changes) {
      if (entry === null) delete current.cells[code];
      else current.cells[code] = entry;
    }
    // Atomic compare-and-swap protects against another writer between read and update.
    const result = await db.prepare(`UPDATE season_plans SET cells = ?, revision = revision + 1,
      updated_at = CURRENT_TIMESTAMP WHERE id = ? AND revision = ?`)
      .bind(JSON.stringify(current.cells), PLAN_ID, body.revision).run();
    if (!result.meta.changes) return reply(await read(), 409, origin);
    return reply(await read(), 200, origin);
  } catch { return reply({ error: 'Plan storage unavailable' }, 503, origin); }
}
