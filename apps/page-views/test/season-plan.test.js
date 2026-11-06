import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/index.js';
const secret = 'test-edit-token-with-at-least-32-characters';
function environment() {
  const sqlite = new DatabaseSync(':memory:');
  return { ALLOWED_ORIGINS: 'https://anthlan.github.io', SEASON_PLAN_EDIT_TOKEN: secret, DB: {
    prepare(sql) {
      let args = [];
      return { bind(...values) { args = values; return this; },
        async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...args).changes) } }; },
        async first() { return sqlite.prepare(sql).get(...args); },
      };
    },
  } };
}
function request(method = 'GET', body, token = '') {
  return new Request('https://worker.test/api/season-plan', { method,
    headers: { Origin: 'https://anthlan.github.io', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
test('public readers cannot write; valid edit links can persist and reload cells', async () => {
  const env = environment();
  assert.equal((await (await worker.fetch(request(), env)).json()).canEdit, false);
  const update = { revision: 0, changes: [{ code: 'A1', entry: { alliance: 'DIE', note: 'Grün 🌍' } }] };
  assert.equal((await worker.fetch(request('POST', update), env)).status, 403);
  assert.equal((await worker.fetch(request('POST', update, 'wrong'), env)).status, 403);
  assert.equal((await worker.fetch(request('POST', update, secret), env)).status, 200);
  const saved = await (await worker.fetch(request(), env)).json();
  assert.equal(saved.cells.A1.note, 'Grün 🌍'); assert.equal(saved.revision, 1);
  assert.equal(JSON.stringify(saved).includes(secret), false);
});
test('stale versions cannot overwrite other alliances; deletion requires current revision', async () => {
  const env = environment();
  const change = (revision, code, entry) => request('POST', { revision, changes: [{ code, entry }] }, secret);
  await worker.fetch(change(0, 'A1', { alliance: 'GGR', note: '' }), env);
  assert.equal((await worker.fetch(change(0, 'B1', { alliance: 'DIE', note: '' }), env)).status, 409);
  const accepted = await (await worker.fetch(change(1, 'B1', { alliance: 'DIE', note: '' }), env)).json();
  assert.equal(accepted.cells.A1.alliance, 'GGR'); assert.equal(accepted.cells.B1.alliance, 'DIE');
  const removed = await (await worker.fetch(change(2, 'A1', null), env)).json(); assert.equal(removed.cells.A1, undefined);
});
test('invalid updates, foreign origins and missing server secrets are rejected', async () => {
  const env = environment();
  for (const entry of [{ alliance: 'unknown', note: '' }, { alliance: 'DIE', note: 'x'.repeat(301) }]) {
    assert.equal((await worker.fetch(request('POST', { revision: 0, changes: [{ code: 'A1', entry }] }, secret), env)).status, 400);
  }
  assert.equal((await worker.fetch(new Request('https://worker.test/api/season-plan'), env)).status, 403);
  delete env.SEASON_PLAN_EDIT_TOKEN;
  assert.equal((await worker.fetch(request('POST', {}, secret), env)).status, 403);
});
