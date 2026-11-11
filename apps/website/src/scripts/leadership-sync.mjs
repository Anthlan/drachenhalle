import { validateLeadership, diffLeadership, applyLeadership, changeKey, changeValue, equal } from '../../../shared/leadership-model.mjs';

export function createLeadershipSync(options) {
  let remote = validateLeadership(options.initial), delivered = structuredClone(remote), revision = -1;
  let canEdit = false, busy = false, stopped = false, conflict = false;
  const pending = new Map(); let scheduled; let inFlight = new Map();
  const status = (message) => options.onStatus(message);
  function emit() {
    try { delivered = pending.size ? applyLeadership(remote, [...pending.values()]) : structuredClone(remote); }
    catch { conflict = true; }
    options.onState(structuredClone(delivered), canEdit, conflict);
  }
  function accept(snapshot, rebase = true) {
    if (!Number.isSafeInteger(snapshot.revision) || snapshot.revision < 0) throw new Error('Invalid revision');
    if (snapshot.revision < revision) return;
    const next = validateLeadership(snapshot.draft);
    if (rebase && pending.size) {
      for (const [key, change] of pending) {
        const current = changeValue(next, change);
        if (equal(current, change.value)) pending.delete(key);
        else if (!equal(current, change.before)) conflict = true;
      }
    }
    remote = next; revision = snapshot.revision;
    if (typeof snapshot.canEdit === 'boolean') canEdit = snapshot.canEdit;
  }
  async function request(method = 'GET', body) {
    const response = await fetch(options.endpoint, {
      method, cache: 'no-store', referrerPolicy: 'no-referrer',
      headers: { ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000),
    });
    if (response.status === 401 || response.status === 403) { canEdit = false; throw new Error('Unauthorized'); }
    if (!response.ok && response.status !== 409) throw new Error(String(response.status));
    return { response, data: await response.json() };
  }
  async function refresh() {
    if (busy || stopped) return;
    busy = true;
    try {
      const { data } = await request(); accept(data); emit();
      status(conflict ? 'Gleichzeitige Änderungen am selben Feld. Bitte entscheiden, welcher Stand gelten soll.' : pending.size ? 'Eigene Änderungen warten auf Speicherung.' : canEdit ? 'Gemeinsamer Stand · Bearbeitung aktiv' : 'Gemeinsamer Stand · Nur ansehen');
    } catch { status(pending.size ? 'Verbindung unterbrochen. Eigene Änderungen sind noch nicht gemeinsam gespeichert.' : 'Verbindung unterbrochen. Der letzte geladene Stand bleibt sichtbar.'); }
    finally { busy = false; }
    if (canEdit && pending.size && !conflict) void flush();
  }
  async function flush() {
    if (busy || stopped || !canEdit || revision < 0 || !pending.size || conflict) return;
    busy = true; const batch = new Map([...pending].map(([key, change]) => [key, structuredClone(change)])); inFlight = batch;
    status('Änderungen werden gemeinsam gespeichert …');
    try {
      const { response, data } = await request('POST', { revision, changes: [...batch.values()] });
      if (response.status === 409) {
        accept(data); emit();
        status(conflict ? 'Gleichzeitige Änderungen am selben Feld. Bitte entscheiden, welcher Stand gelten soll.' : 'Andere Änderungen geladen. Eigene Änderungen werden ergänzt.');
      } else {
        // Retain newer edits typed while this request was in flight.
        for (const [key, change] of batch) {
          const latest = pending.get(key);
          if (latest && equal(latest.value, change.value)) pending.delete(key);
          else if (latest) latest.before = change.value;
        }
        accept(data); emit(); status(pending.size ? 'Weitere Änderungen warten auf Speicherung.' : 'Gemeinsamer Stand gespeichert.');
      }
    } catch { emit(); status('Speichern fehlgeschlagen. Eigene Änderungen bleiben vorgemerkt. Bitte Seite geöffnet lassen oder exportieren.'); }
    finally { busy = false; inFlight = new Map(); }
    if (pending.size && !conflict) scheduled = setTimeout(() => void refresh(), 1500);
  }
  const timer = setInterval(() => { if (!document.hidden) void refresh(); }, 4000);
  void refresh();
  return {
    save(next) {
      if (!canEdit) return false;
      for (const change of diffLeadership(delivered, validateLeadership(next))) {
        const key = changeKey(change), existing = pending.get(key);
        const merged = { ...change, before: existing ? existing.before : change.field === '$item' ? changeValue(remote, change) : change.before };
        if (equal(merged.before, merged.value) && !inFlight.has(key)) pending.delete(key); else pending.set(key, merged);
      }
      // A create or delete supersedes earlier field changes for the same task.
      for (const change of [...pending.values()]) if (change.field === '$item') {
        const task = next.tasks.find(task => task.id === change.id);
        change.value = task || null;
        for (const [key, other] of pending) if (other.scope === 'task' && other.id === change.id && other.field !== '$item') pending.delete(key);
      }
      emit(); clearTimeout(scheduled); scheduled = setTimeout(() => void flush(), 650); return true;
    },
    resolve(useLocal) {
      if (!useLocal) pending.clear();
      else for (const change of pending.values()) change.before = changeValue(remote, change);
      conflict = false; emit();
      if (conflict) { status('Diese Zuordnung ist inzwischen widersprüchlich. Serverstand übernehmen und neu zuordnen.'); return; }
      if (useLocal) void flush(); else status('Aktueller gemeinsamer Stand übernommen.');
    },
    hasPending: () => pending.size > 0,
    refresh,
    stop() { stopped = true; clearInterval(timer); clearTimeout(scheduled); },
  };
}
