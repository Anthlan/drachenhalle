import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import * as model from '../../shared/leadership-model.mjs';
const source = (await readFile(new URL('../src/scripts/leadership-sync.mjs', import.meta.url), 'utf8')).replace(/^import .*;\r?\n/gm, '').replace('export function', 'function');
const settle = () => new Promise(resolve => setImmediate(resolve));
function harness(edit = true) {
  let remote = model.createLeadership(), revision = 0, latest, conflict = false, posts = 0, fail = false, hold;
  let release; const timers = new Map(); let next = 0, poll;
  const create = runInNewContext(source + ';createLeadershipSync', { ...model, structuredClone, AbortSignal, document: { hidden: false },
    setInterval(fn) { poll = fn; return 0; }, clearInterval() {},
    setTimeout(fn) { const id = ++next; timers.set(id, fn); return id; }, clearTimeout(id) { timers.delete(id); },
    fetch: async (url, init) => {
      if (init.method === 'POST') {
        posts++; if (fail) { fail = false; throw new Error('Offline'); }
        if (hold) { hold = false; await new Promise(resolve => release = resolve); }
        const body = JSON.parse(init.body);
        if (body.revision !== revision) return { ok: false, status: 409, json: async () => ({ draft: structuredClone(remote), revision, canEdit: edit }) };
        remote = model.applyLeadership(remote, body.changes); revision++;
      }
      return { ok: true, status: 200, json: async () => ({ draft: structuredClone(remote), revision, canEdit: edit }) };
    },
  });
  const sync = create({ initial: model.createLeadership(), endpoint: 'https://example.test/api/leadership', token: edit ? 'test' : '', onState: (draft, canEdit, hasConflict) => { latest = draft; conflict = hasConflict; }, onStatus() {} });
  return {
    sync, get latest() { return latest; }, get remote() { return remote; }, get conflict() { return conflict; }, get posts() { return posts; },
    mutate(fn) { fn(remote); revision++; }, fail() { fail = true; }, hold() { hold = true; }, release() { release(); },
    async poll() { await poll(); await settle(); },
    async timers() { const batch = [...timers.values()]; timers.clear(); for (const fn of batch) fn(); await settle(); await settle(); },
  };
}
test('shared readers cannot publish their browser state', async () => {
  const h = harness(false); await settle(); const next = structuredClone(h.latest); next.notes = 'Local';
  assert.equal(h.sync.save(next), false); await h.timers(); assert.equal(h.posts, 0); assert.equal(h.remote.notes, ''); h.sync.stop();
});
test('independent simultaneous fields merge without losing either writer', async () => {
  const h = harness(); await settle(); const next = structuredClone(h.latest); next.posts[4].title = 'Betreuung'; h.sync.save(next);
  h.mutate(remote => remote.tasks[0].primary = 'butler'); await h.timers(); await h.timers();
  assert.equal(h.remote.posts[4].title, 'Betreuung'); assert.equal(h.remote.tasks[0].primary, 'butler'); assert.equal(h.sync.hasPending(), false); h.sync.stop();
});
test('same-field conflicts require a choice and keep the local text until resolved', async () => {
  const h = harness(); await settle(); const next = structuredClone(h.latest); next.notes = 'My text'; h.sync.save(next);
  h.mutate(remote => remote.notes = 'Other text'); await h.timers();
  assert.equal(h.conflict, true); assert.equal(h.latest.notes, 'My text'); assert.equal(h.remote.notes, 'Other text');
  h.sync.resolve(false); assert.equal(h.latest.notes, 'Other text'); assert.equal(h.sync.hasPending(), false);
  const again = structuredClone(h.latest); again.notes = 'Explicit choice'; h.sync.save(again); h.mutate(remote => remote.notes = 'Another text'); await h.timers();
  h.sync.resolve(true); await settle(); assert.equal(h.remote.notes, 'Explicit choice'); h.sync.stop();
});
test('outages retain pending edits and polling retries them', async () => {
  const h = harness(); await settle(); const next = structuredClone(h.latest); next.posts[4].person = 'Player'; h.fail(); h.sync.save(next); await h.timers();
  assert.equal(h.sync.hasPending(), true); assert.equal(h.latest.posts[4].person, 'Player'); await h.poll();
  assert.equal(h.remote.posts[4].person, 'Player'); assert.equal(h.sync.hasPending(), false); h.sync.stop();
});
test('reverting an input while its previous value is in flight still saves the final value', async () => {
  const h = harness(); await settle(); const next = structuredClone(h.latest); next.notes = 'Temporary'; h.hold(); h.sync.save(next); await h.timers();
  const reverted = structuredClone(h.latest); reverted.notes = ''; h.sync.save(reverted); h.release(); await settle(); await h.timers(); await h.timers();
  assert.equal(h.remote.notes, ''); assert.equal(h.latest.notes, ''); assert.equal(h.sync.hasPending(), false); h.sync.stop();
});
test('new tasks can be edited before autosave; deleted remote tasks do not erase pending local text', async () => {
  const h = harness(); await settle(); const next = structuredClone(h.latest); next.tasks.push({ ...next.tasks[0], id: 'new-task', title: 'New task' }); h.sync.save(next);
  const edited = structuredClone(h.latest); edited.tasks.at(-1).mission = 'Final mission'; h.sync.save(edited); await h.timers();
  assert.equal(h.remote.tasks.find(task => task.id === 'new-task').mission, 'Final mission');
  const pending = structuredClone(h.latest); pending.tasks[0].mission = 'Keep this text'; h.sync.save(pending);
  h.mutate(remote => remote.tasks.splice(0, 1)); await h.timers();
  assert.equal(h.conflict, true); assert.equal(h.latest.tasks[0].mission, 'Keep this text'); h.sync.resolve(false); assert.notEqual(h.latest.tasks[0].id, pending.tasks[0].id); h.sync.stop();
});
