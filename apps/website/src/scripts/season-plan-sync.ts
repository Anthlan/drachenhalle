type Entry = { alliance: string; note: string };
type Plan = Record<string, Entry>;
type Snapshot = { cells: Plan; revision: number; canEdit?: boolean };
type Options = {
  endpoint: string; token: string;
  validate: (value: unknown) => Plan;
  onState: (cells: Plan, canEdit: boolean) => void;
  onStatus: (message: string) => void;
};
export function createPlanSync(options: Options) {
  let remote: Plan = {}, delivered: Plan = {}, revision = -1;
  let canEdit = false, busy = false, stopped = false;
  const pending = new Map<string, Entry | null>();
  const clone = (plan: Plan): Plan => JSON.parse(JSON.stringify(plan));
  function emit() {
    delivered = clone(remote);
    for (const [code, entry] of pending) {
      if (entry === null) delete delivered[code];
      else delivered[code] = { ...entry };
    }
    options.onState(clone(delivered), canEdit);
  }
  function accept(value: Snapshot) {
    if (!Number.isSafeInteger(value.revision) || value.revision < 0) throw new Error('Invalid revision');
    const cells = options.validate(value.cells);
    if (value.revision >= revision) { remote = cells; revision = value.revision; }
  }
  async function request(method = 'GET', body?: unknown) {
    const response = await fetch(options.endpoint, {
      method, cache: 'no-store', referrerPolicy: 'no-referrer',
      headers: { ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok && response.status !== 409) throw new Error(String(response.status));
    return { response, data: await response.json() as Snapshot };
  }
  async function refresh() {
    if (busy || stopped) return;
    busy = true;
    try {
      const { data } = await request(); accept(data); canEdit = data.canEdit === true;
      if (!canEdit && pending.size) options.onStatus('Bearbeitungslink ungültig. Ungespeicherte Änderungen bitte exportieren.');
      emit();
      if (!pending.size) options.onStatus(canEdit ? 'Gemeinsamer Plan · Bearbeitung aktiv' : 'Gemeinsamer Plan · Nur ansehen');
    } catch { options.onStatus('Verbindung unterbrochen. Der letzte Stand bleibt sichtbar.'); }
    finally { busy = false; }
    if (canEdit && pending.size) void flush();
  }
  async function flush() {
    if (busy || stopped || !canEdit || revision < 0 || !pending.size) return;
    busy = true;
    const batch = new Map(pending);
    try {
      const { response, data } = await request('POST', { revision, changes: [...batch].map(([code, entry]) => ({ code, entry })) });
      accept(data);
      if (response.status === 409) {
        options.onStatus('Andere Änderungen geladen. Eigene Änderungen werden erneut gespeichert.');
      } else {
        // A later local change to the same cell must remain queued.
        for (const [code, entry] of batch) if (JSON.stringify(pending.get(code)) === JSON.stringify(entry)) pending.delete(code);
        options.onStatus('Gemeinsamer Plan gespeichert.');
      }
      emit();
    } catch { options.onStatus('Speichern fehlgeschlagen. Änderungen bleiben vorgemerkt und werden erneut versucht.'); }
    finally { busy = false; }
    // Polling retries failed requests; avoid an unbounded retry loop on outages.
  }
  const timer = setInterval(() => { if (!document.hidden) void refresh(); }, 5000);
  void refresh();
  return {
    save(next: Plan) {
      if (!canEdit) return;
      for (const code of new Set([...Object.keys(delivered), ...Object.keys(next)])) {
        if (JSON.stringify(delivered[code]) !== JSON.stringify(next[code])) pending.set(code, next[code] ? { ...next[code] } : null);
      }
      emit(); void flush();
    },
    stop() { stopped = true; clearInterval(timer); },
    hasPending() { return pending.size > 0; },
  };
}
