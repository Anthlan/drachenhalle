import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/index.js';
import { diffLeadership } from '../../shared/leadership-model.mjs';
const token = 'test-leadership-token-with-at-least-32-characters';
function environment() {
  const sqlite = new DatabaseSync(':memory:');
  return { ALLOWED_ORIGINS: 'https://anthlan.github.io', LEADERSHIP_EDIT_TOKEN: token, DB: {
    prepare(sql) { let values = []; return {
      bind(...args) { values = args; return this; },
      async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } }; },
      async first() { return sqlite.prepare(sql).get(...values); },
    }; },
  } };
}
const request = (method = 'GET', body, key = '') => new Request('https://worker.test/api/leadership', {
  method, headers: { Origin: 'https://anthlan.github.io', ...(key ? { Authorization: `Bearer ${key}` } : {}) },
  body: body === undefined ? undefined : JSON.stringify(body),
});
test('leadership is shared across readers; writing requires its own edit token', async () => {
  const env = environment();
  const current = await (await worker.fetch(request(), env)).json();
  assert.equal(current.canEdit, false); assert.equal(current.draft.posts.length, 8); assert.equal(current.draft.tasks.length, 20);
  assert.equal(current.draft.notes, '');
  const next = structuredClone(current.draft); next.tasks[0].primary = 'butler'; next.tasks[0].deputy = 'goettin';
  const body = { revision: current.revision, changes: diffLeadership(current.draft, next) };
  for (const key of ['', 'wrong']) assert.equal((await worker.fetch(request('POST', body, key), env)).status, 403);
  assert.equal((await worker.fetch(request('POST', body, token), env)).status, 200);
  const reader = await (await worker.fetch(request(), env)).json();
  assert.equal(reader.draft.tasks[0].primary, 'butler'); assert.equal(reader.draft.tasks[0].deputy, 'goettin');
  assert.equal(reader.revision, 1); assert.equal(JSON.stringify(reader).includes(token), false);
});
test('stale writers cannot replace shared work; independent fields can be retried', async () => {
  const env = environment(); const start = await (await worker.fetch(request(), env)).json();
  const a = structuredClone(start.draft); a.posts[4].title = 'Betreuung';
  const b = structuredClone(start.draft); b.tasks[1].primary = 'butler';
  assert.equal((await worker.fetch(request('POST', { revision: 0, changes: diffLeadership(start.draft, a) }, token), env)).status, 200);
  const conflict = await worker.fetch(request('POST', { revision: 0, changes: diffLeadership(start.draft, b) }, token), env);
  assert.equal(conflict.status, 409); assert.equal((await conflict.json()).draft.posts[4].title, 'Betreuung');
  assert.equal((await worker.fetch(request('POST', { revision: 1, changes: diffLeadership(start.draft, b) }, token), env)).status, 200);
  const read = await (await worker.fetch(request(), env)).json();
  assert.equal(read.draft.posts[4].title, 'Betreuung'); assert.equal(read.draft.tasks[1].primary, 'butler');
});
test('invalid assignments, fixed title changes, excessive text and foreign origins are rejected', async () => {
  const env = environment();
  const bad = [
    [{ scope: 'task', id: 'vertretung', field: 'primary', value: 'butler' }, { scope: 'task', id: 'vertretung', field: 'deputy', value: 'butler' }],
    [{ scope: 'task', id: 'vertretung', field: 'primary', value: 'unknown' }],
    [{ scope: 'post', id: 'butler', field: 'title', value: 'Changed' }],
    [{ scope: 'notes', field: 'notes', value: 'x'.repeat(12001) }],
    [{ scope: 'task', id: 'missing', field: 'mission', value: 'Text' }],
  ];
  for (const changes of bad) assert.equal((await worker.fetch(request('POST', { revision: 0, changes }, token), env)).status, 400);
  assert.equal((await worker.fetch(new Request('https://worker.test/api/leadership'), env)).status, 403);
  const current = await (await worker.fetch(request(), env)).json(); assert.equal(current.revision, 0);
  delete env.LEADERSHIP_EDIT_TOKEN;
  assert.equal((await worker.fetch(request('POST', { revision: 0, changes: [] }, token), env)).status, 403);
});
test('new tasks and deletions persist without altering the seed or unrelated records', async () => {
  const env = environment(); const first = await (await worker.fetch(request(), env)).json();
  const next = structuredClone(first.draft); const extra = { ...next.tasks[0], id: 'eigene-aufgabe', title: 'Gemeinsam definieren', primary: 'frei-1', deputy: 'butler' };
  next.tasks.push(extra); next.tasks = next.tasks.filter(task => task.id !== 'zug'); next.notes = 'Abgesprochen 🌍';
  const result = await worker.fetch(request('POST', { revision: 0, changes: diffLeadership(first.draft, next) }, token), env);
  assert.equal(result.status, 200); const saved = await result.json();
  assert.equal(saved.draft.tasks.some(task => task.id === 'zug'), false); assert.equal(saved.draft.tasks.find(task => task.id === extra.id).title, extra.title);
  assert.equal(saved.draft.notes, 'Abgesprochen 🌍');
});
