import { createLeadershipSync } from './leadership-sync.mjs';
import { translateClient as t } from '../i18n/client';
import { validateLeadership } from '../../../shared/leadership-model.mjs';

interface WorkshopPost {
  id: string; title: string; fixed: boolean; person: string; availability: string;
}
interface WorkshopTask {
  id: string; title: string; category: string; mission: string; decisions: string;
  tasks: string; boundary: string; time: string; primary: string | null; deputy: string | null;
}
interface WorkshopDraft {
  id: string; version: number; title: string; date: string; members: number;
  people: string[]; notes: string; posts: WorkshopPost[]; tasks: WorkshopTask[];
}
type Assignment = "primary" | "deputy";

export function initializeLeadershipWorkshop() {
  const root = document.getElementById("leadership-workshop");
  const seed = document.getElementById("leadership-seed");
  if (!root || !seed?.textContent) return;
  const original = JSON.parse(seed.textContent) as WorkshopDraft;
  let draft = structuredClone(original);
  const shared = root.dataset.shared === 'true';
  let writable = !shared;
  let sync: ReturnType<typeof createLeadershipSync> | undefined;
  let token = '';
  const storageKey = `die-workshop:${draft.id}:v${draft.version}`;
  const status = document.getElementById("save-state")!;
  const notice = document.getElementById("board-notice")!;
  let selected: string | null = null;
  let dragged: string | null = null;
  let query = "";
  let filter = "all";
  const postTitle = (id: string | null) => draft.posts.find(post => post.id === id)?.title.trim() || "Freier Posten";
  const textFields = ["id", "title", "category", "mission", "decisions", "tasks", "boundary", "time"] as const;

  function validate(value: unknown): WorkshopDraft {
    try { return validateLeadership(value) as WorkshopDraft; }
    catch { throw new Error('Die Datei ist kein passender Führungsentwurf.'); }
  }
  // Preserve edits from the previous area-based draft, including deputy suggestions.
  function migrate(value: any): WorkshopDraft {
    if (value?.id !== original.id || value.version !== 1 || !Array.isArray(value.roles) || value.roles.length !== 8) throw new Error("Unbekannter Entwurf.");
    const migrated = structuredClone(original);
    const mapping = ["butler", "goettin", "rekrutierer", "frei-1", "frei-2", "kriegsherr", "frei-3", "frei-4"];
    migrated.notes = typeof value.notes === "string" ? value.notes : "";
    migrated.tasks = value.roles.map((role: any, index: number) => {
      if (!role || !["id", "title", "owner", "deputy", "time", "mission", "decisions", "tasks", "boundary"].every(key => typeof role[key] === "string")) throw new Error("Der bisherige Entwurf ist unvollständig.");
      const post = migrated.posts.find(item => item.id === mapping[index])!;
      post.person = role.owner; post.availability = role.time;
      if (!post.fixed) post.title = role.title;
      if (role.deputy.trim()) migrated.notes += `\nBisheriger Vertretungsvorschlag für ${role.title}: ${role.deputy}. Bitte einem R4-Posten zuordnen.`;
      return { id: `uebernommen-${index + 1}`, title: role.title, category: "Bisheriger Entwurf", mission: role.mission, decisions: role.decisions, tasks: role.tasks, boundary: role.boundary, time: role.time, primary: post.id, deputy: null };
    });
    return validate(migrated);
  }
  if (!shared) try {
    const saved = localStorage.getItem(storageKey);
    const previous = localStorage.getItem(`die-workshop:${draft.id}:v1`);
    if (saved) { draft = validate(JSON.parse(saved)); status.textContent = "Letzter Arbeitsstand geladen."; }
    else if (previous) { draft = migrate(JSON.parse(previous)); localStorage.setItem(storageKey, JSON.stringify(draft)); status.textContent = "Bisheriger Entwurf übernommen; Vertretungsvorschläge stehen in den Notizen."; }
  } catch { status.textContent = "Gespeicherter Stand konnte nicht geladen werden. Die vorhandenen Daten bleiben erhalten."; }

  function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = "", text = "") {
    const node = document.createElement(tag); node.className = className;
    if (text) node.textContent = t(text);
    return node;
  }
  function button(text: string, className: string, action: () => void) {
    const node = element("button", className, text); node.type = "button"; node.addEventListener("click", action); return node;
  }
  function save() {
    if (shared) { if (writable) sync?.save(structuredClone(draft)); return; }
    try { localStorage.setItem(storageKey, JSON.stringify(draft)); status.textContent = "Arbeitsstand in diesem Browser gesichert."; }
    catch { status.textContent = "Speichern nicht möglich. Bitte den Entwurf exportieren."; }
  }
  function say(message: string, error = false) { notice.textContent = t(message); notice.classList.toggle("is-error", error); }
  function assign(taskId: string, postId: string, kind: Assignment) {
    if (!writable) return;
    const task = draft.tasks.find(task => task.id === taskId);
    if (!task || !draft.posts.some(post => post.id === postId)) return;
    if (task[kind === "primary" ? "deputy" : "primary"] === postId) { say("Hauptverantwortung und Vertretung müssen bei unterschiedlichen Posten liegen.", true); return; }
    task[kind] = postId; selected = null; render(); save();
    say(`${task.title}: ${kind === "primary" ? "Hauptverantwortung" : "Vertretung"} bei ${postTitle(postId)}.`);
  }
  function unassign(taskId: string, kind: Assignment) {
    if (!writable) return;
    const task = draft.tasks.find(task => task.id === taskId); if (!task) return;
    task[kind] = null; render(); save(); say(`${task.title}: ${kind === "primary" ? "Hauptverantwortung" : "Vertretung"} wieder offen.`);
  }
  function selectTask(taskId: string) {
    if (!writable) return;
    selected = selected === taskId ? null : taskId; updateSelection();
    say(selected ? `„${draft.tasks.find(task => task.id === taskId)!.title}“ ausgewählt. Jetzt bei einem Posten auf „Hier zuordnen“ klicken.` : "Auswahl aufgehoben.");
  }
  function updateSelection() {
    root!.classList.toggle("has-selection", selected !== null);
    root!.querySelectorAll<HTMLElement>("[data-task]").forEach(card => {
      const active = card.dataset.task === selected;
      card.classList.toggle("is-selected", active);
      card.querySelector(".task-name")!.setAttribute("aria-pressed", String(active));
    });
    document.getElementById("selected-name")!.textContent = draft.tasks.find(task => task.id === selected)?.title || "Keine Aufgabe ausgewählt";
    (document.getElementById("clear-selection") as HTMLButtonElement).hidden = !selected;
  }
  function taskCard(task: WorkshopTask, kind: Assignment | null = null) {
    const card = element("article", `task-card${kind ? " is-assigned" : ""}${selected === task.id ? " is-selected" : ""}`);
    card.dataset.task = task.id; card.draggable = writable;
    const line = element("div", "task-topline");
    const handle = element("span", "task-drag-handle editor-only", "⠿");
    handle.setAttribute("aria-hidden", "true"); handle.title = "Aufgabe ziehen"; line.append(handle);
    const choose = button(task.title, "task-name", () => selectTask(task.id));
    choose.textContent = task.title; choose.setAttribute('translate', 'no');
    choose.setAttribute("aria-pressed", String(selected === task.id)); choose.setAttribute("aria-label", `Aufgabe auswählen: ${task.title}`); line.append(choose);
    if (kind) {
      const remove = button("×", "remove-task editor-only", () => unassign(task.id, kind));
      remove.setAttribute("aria-label", `${task.title}: ${kind === "primary" ? "Hauptverantwortung" : "Vertretung"} entfernen`); line.append(remove);
    }
    card.append(line);
    if (!kind) {
      const category = element("p", "task-category", task.category); category.textContent = task.category; category.setAttribute('translate', 'no');
      const mission = element("p", "task-description", task.mission); mission.textContent = task.mission; mission.setAttribute('translate', 'no');
      card.append(category, mission);
      const coverage = element("div", "task-coverage");
      coverage.append(element("span", task.primary ? "covered" : "uncovered", `Haupt: ${task.primary ? postTitle(task.primary) : "offen"}`), element("span", task.deputy ? "covered" : "uncovered", `Vertretung: ${task.deputy ? postTitle(task.deputy) : "offen"}`));
      card.append(coverage);
    }
    card.append(button(kind ? "Details" : "Aufgabe bearbeiten", "text-button editor-only", () => openTask(task.id)));
    card.addEventListener("dragstart", event => {
      if (!writable) { event.preventDefault(); return; }
      dragged = task.id; event.dataTransfer?.setData("text/plain", task.id);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
      card.classList.add("is-dragging"); root!.classList.add("is-dragging-task");
    });
    card.addEventListener("dragend", () => {
      dragged = null; root!.classList.remove("is-dragging-task"); card.classList.remove("is-dragging");
      root!.querySelectorAll(".is-over").forEach(node => node.classList.remove("is-over"));
    });
    return card;
  }
  function makeDropzone(post: WorkshopPost, kind: Assignment) {
    const zone = element("section", `dropzone ${kind}`); zone.dataset.post = post.id; zone.dataset.kind = kind;
    const head = element("div", "zone-heading"); head.append(element("h4", "", kind === "primary" ? "Haupt" : "Vertretung"), element("span", "zone-count", "0"));
    const assignButton = button("Hier zuordnen", "assign-selected editor-only", () => { if (selected) assign(selected, post.id, kind); else say("Zuerst eine Aufgabe auswählen oder hierher ziehen."); });
    const list = element("div", "zone-tasks"); const hint = element("p", "drop-hint", "Aufgabe hierher ziehen"); zone.append(head, list, hint, assignButton);
    zone.addEventListener("dragover", event => { if (dragged) { event.preventDefault(); zone.classList.add("is-over"); } });
    zone.addEventListener("dragleave", event => { if (!zone.contains(event.relatedTarget as Node)) zone.classList.remove("is-over"); });
    zone.addEventListener("drop", event => {
      event.preventDefault(); event.stopPropagation(); if (dragged) assign(dragged, post.id, kind);
      dragged = null; root!.classList.remove("is-dragging-task"); root!.querySelectorAll(".is-over").forEach(node => node.classList.remove("is-over"));
    });
    return zone;
  }
  function buildPosts() {
    document.getElementById("posts")!.replaceChildren(...draft.posts.map((post, index) => {
      const card = element("article", "post-card"); card.dataset.postCard = post.id;
      const header = element("header", "post-topline"); header.append(element("span", "post-number", `R4 · ${String(index + 1).padStart(2, "0")}`), element("span", "post-type", post.fixed ? "Fester Titel" : "Frei benennbar"));
      card.append(header); const heading = element("h3", "post-title", post.title); heading.dataset.postTitle = post.id; heading.setAttribute("translate", "no"); card.append(heading);
      if (!post.fixed) {
        const label = element("label", "editor-only", "Name des Postens"); const input = element("input"); input.value = post.title; input.maxLength = 80; input.dataset.postField = "title"; input.placeholder = `Freier Posten ${index - 3}`; label.append(input); card.append(label);
      }
      const personLabel = element("label", "editor-only person-label", "Besetzung"); const person = element("input"); person.value = post.person; person.dataset.postField = "person"; person.setAttribute("list", "people"); person.autocomplete = "off"; person.maxLength = 80; person.placeholder = "Gemeinsam festlegen"; personLabel.append(person); card.append(personLabel, element("p", "person-display presentation-only", post.person || "Besetzung offen"));
      const details = element("details", "post-settings editor-only"); details.append(element("summary", "", "Verfügbarkeit festhalten"));
      const timeLabel = element("label", "", "Zeitbudget / Verfügbarkeit"); const time = element("textarea"); time.value = post.availability; time.rows = 2; time.maxLength = 2000; time.dataset.postField = "availability"; time.placeholder = "Welche Zeiten kann die Person abdecken?"; timeLabel.append(time); details.append(timeLabel);
      card.append(details, element("p", "post-availability presentation-only", post.availability), makeDropzone(post, "primary"), makeDropzone(post, "deputy")); return card;
    }));
  }
  function renderPool() {
    const tasks = draft.tasks.filter(task => `${task.title} ${task.category} ${task.mission} ${task.tasks}`.toLocaleLowerCase("de").includes(query) && (filter === "all" || (filter === "primary" ? !task.primary : !task.deputy)));
    const pool = document.getElementById("task-pool")!; pool.replaceChildren(...tasks.map(task => taskCard(task)));
    if (!tasks.length) pool.append(element("p", "empty-pool", "Keine passenden Aufgaben."));
    document.getElementById("pool-count")!.textContent = `${tasks.length} von ${draft.tasks.length}`;
  }
  function render() {
    renderPool();
    for (const post of draft.posts) {
      const card = root!.querySelector<HTMLElement>(`[data-post-card="${post.id}"]`)!;
      for (const input of card.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-post-field]')) {
        const value = post[input.dataset.postField as 'title' | 'person' | 'availability'];
        if (input.value !== value) input.value = value;
      }
      card.querySelector<HTMLElement>("[data-post-title]")!.textContent = post.title.trim() || "Freier Posten";
      card.querySelector<HTMLElement>(".person-display")!.textContent = post.person.trim() || "Besetzung offen";
      card.querySelector<HTMLElement>(".post-availability")!.textContent = post.availability;
      for (const kind of ["primary", "deputy"] as const) {
        const zone = card.querySelector<HTMLElement>(`[data-kind="${kind}"]`)!;
        const tasks = draft.tasks.filter(task => task[kind] === post.id);
        zone.querySelector(".zone-tasks")!.replaceChildren(...tasks.map(task => taskCard(task, kind)));
        zone.querySelector<HTMLElement>(".drop-hint")!.hidden = tasks.length > 0; zone.querySelector(".zone-count")!.textContent = String(tasks.length);
        zone.querySelector(".assign-selected")!.setAttribute("aria-label", `${postTitle(post.id)}: als ${kind === "primary" ? "Hauptverantwortung" : "Vertretung"} zuordnen`);
      }
    }
    updateSelection();
    const openPrimary = draft.tasks.filter(task => !task.primary); const openDeputy = draft.tasks.filter(task => !task.deputy);
    document.getElementById("task-count")!.textContent = String(draft.tasks.length); document.getElementById("primary-open")!.textContent = String(openPrimary.length); document.getElementById("deputy-open")!.textContent = String(openDeputy.length);
    const issues: string[] = [];
    if (openPrimary.length) issues.push(`${openPrimary.length} Aufgaben ohne Hauptverantwortung.`);
    if (openDeputy.length) issues.push(`${openDeputy.length} Aufgaben ohne Vertretung.`);
    const unstaffed = draft.posts.filter(post => !post.person.trim() && draft.tasks.some(task => task.primary === post.id || task.deputy === post.id));
    if (unstaffed.length) issues.push(`Aufgaben verteilt, Besetzung offen: ${unstaffed.map(post => postTitle(post.id)).join(", ")}.`);
    const byPerson = new Map<string, WorkshopPost[]>();
    for (const post of draft.posts) if (post.person.trim()) { const key = post.person.trim().toLocaleLowerCase("de"); byPerson.set(key, [...(byPerson.get(key) || []), post]); }
    for (const posts of byPerson.values()) if (posts.length > 1) issues.push(`${posts[0].person}: mehrere Posten (${posts.map(post => postTitle(post.id)).join(", ")}). Zeitbudget und Vertretungen prüfen.`);
    for (const task of draft.tasks) {
      const primary = draft.posts.find(post => post.id === task.primary); const deputy = draft.posts.find(post => post.id === task.deputy);
      if (primary?.person.trim() && deputy?.person.trim() && primary.person.trim().toLocaleLowerCase("de") === deputy.person.trim().toLocaleLowerCase("de")) issues.push(`${task.title}: Haupt und Vertretung liegen trotz unterschiedlicher Posten bei derselben Person.`);
    }
    if (!issues.length) issues.push("Alle Aufgaben haben Hauptverantwortung, Vertretung und besetzte Posten. Jetzt Zusagen, Zeitbudget und Entscheidungsrechte gemeinsam prüfen.");
    document.getElementById("coverage-gaps")!.replaceChildren(...issues.map(text => element("li", "", text)));
    document.getElementById("assignment-rows")!.replaceChildren(...draft.tasks.map(task => { const row = element("tr"); for (const text of [task.title, task.primary ? postTitle(task.primary) : "Offen", task.deputy ? postTitle(task.deputy) : "Offen"]) row.append(element("td", "", text)); return row; }));
    document.getElementById("task-mandates")!.replaceChildren(...draft.tasks.map(task => {
      const detail = element("details", "mandate"); detail.append(element("summary", "", task.title)); const list = element("dl");
      for (const [label, value] of [["Auftrag", task.mission], ["Aufgaben", task.tasks], ["Entscheidungen", task.decisions], ["Grenzen & Übergaben", task.boundary], ["Verfügbarkeit", task.time]]) list.append(element("dt", "", label), element("dd", "", value || "Noch gemeinsam zu klären."));
      detail.append(list); return detail;
    }));
    updatePermissions();
  }
  function updatePermissions() {
    root!.classList.toggle('readonly', !writable);
    for (const field of root!.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>('[data-post-field], #notes, #add-task, #import, #import-file, #task-form input, #task-form textarea, #task-form button[type="submit"], #delete-task')) field.disabled = !writable;
    for (const card of root!.querySelectorAll<HTMLElement>('[data-task]')) card.draggable = writable;
    const share = document.getElementById('share-edit'); if (share) share.hidden = !(shared && writable && token);
    const takeLocal = document.getElementById('take-local'); if (takeLocal) takeLocal.hidden = !(shared && writable);
  }
  const dialog = document.getElementById("task-dialog") as HTMLDialogElement; const form = document.getElementById("task-form") as HTMLFormElement;
  let editing: string | null = null;
  function openTask(id: string | null = null) {
    if (!writable) return;
    editing = id; const task = draft.tasks.find(task => task.id === id);
    document.getElementById("dialog-title")!.textContent = task ? "Aufgabe bearbeiten" : "Neue Aufgabe";
    for (const field of textFields.filter(key => key !== "id")) (form.elements.namedItem(field) as HTMLInputElement).value = task?.[field] || "";
    const deletion = document.getElementById("delete-task") as HTMLButtonElement; deletion.hidden = !task; deletion.textContent = "Aufgabe löschen"; delete deletion.dataset.confirm;
    dialog.showModal(); (form.elements.namedItem("title") as HTMLInputElement).focus();
  }
  form.addEventListener("submit", event => {
    event.preventDefault(); if (!writable || !(form.elements.namedItem("title") as HTMLInputElement).value.trim()) return;
    if (!editing && draft.tasks.length >= 200) { say("Der Entwurf ist auf 200 Aufgaben begrenzt.", true); dialog.close(); return; }
    const task = draft.tasks.find(task => task.id === editing) || { id: `aufgabe-${crypto.randomUUID()}`, primary: null, deputy: null } as WorkshopTask;
    for (const key of textFields.filter(key => key !== "id")) task[key] = (form.elements.namedItem(key) as HTMLInputElement).value.trim();
    if (!editing) draft.tasks.push(task);
    dialog.close(); render(); save(); say(`„${task.title}“ gespeichert.`);
  });
  document.getElementById("cancel-task")!.addEventListener("click", () => dialog.close());
  document.getElementById("delete-task")!.addEventListener("click", event => {
    if (!writable) return;
    const target = event.currentTarget as HTMLButtonElement;
    if (!target.dataset.confirm) { target.dataset.confirm = "yes"; target.textContent = "Löschen bestätigen"; return; }
    const task = draft.tasks.find(task => task.id === editing); draft.tasks = draft.tasks.filter(task => task.id !== editing); if (selected === editing) selected = null;
    dialog.close(); render(); save(); say(`„${task?.title}“ und die zugehörigen Zuordnungen entfernt.`);
  });
  document.getElementById("add-task")!.addEventListener("click", () => openTask());
  document.getElementById("clear-selection")!.addEventListener("click", () => { selected = null; updateSelection(); say("Auswahl aufgehoben."); });
  document.getElementById("task-search")!.addEventListener("input", event => { query = (event.target as HTMLInputElement).value.toLocaleLowerCase("de").trim(); renderPool(); });
  document.getElementById("task-filter")!.addEventListener("change", event => { filter = (event.target as HTMLSelectElement).value; renderPool(); });
  root.addEventListener("input", event => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (!writable) return;
    if (target.id === "notes") { draft.notes = target.value; save(); return; }
    if (!target.dataset.postField) return;
    const post = draft.posts.find(post => post.id === target.closest<HTMLElement>("[data-post-card]")?.dataset.postCard);
    const key = target.dataset.postField as "title" | "person" | "availability";
    if (!post || (key === "title" && post.fixed)) return; post[key] = target.value; render(); save();
  });
  document.getElementById("present")!.addEventListener("click", () => { selected = null; render(); root.classList.add("presenting"); window.scrollTo(0, 0); document.getElementById("edit")!.focus(); });
  document.getElementById("edit")!.addEventListener("click", () => { root.classList.remove("presenting"); document.getElementById("present")!.focus(); });
  document.getElementById("print")!.addEventListener("click", () => window.print());
  function download(data: WorkshopDraft, name: string) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); const link = element("a"); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  document.getElementById("export")!.addEventListener("click", () => { download(draft, "DIE-Fuehrungsworkshop.json"); status.textContent = "Entwurf exportiert. Zum Weitergeben oder späteren Importieren."; });
  const importInput = document.getElementById("import-file") as HTMLInputElement;
  document.getElementById("import")!.addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", async () => {
    if (!writable) return;
    const file = importInput.files?.[0]; if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error("Die Datei ist zu groß.");
      const parsed = JSON.parse(await file.text()); const imported = parsed?.version === 1 ? migrate(parsed) : validate(parsed);
      download(draft, "DIE-Fuehrungsworkshop-vor-Import.json"); draft = imported; selected = null;
      buildPosts(); render(); (document.getElementById("notes") as HTMLTextAreaElement).value = draft.notes; save(); say("Entwurf importiert. Der vorherige Stand wurde als Sicherung zum Download angeboten.");
    } catch (error) { say(error instanceof Error ? error.message : "Import nicht möglich.", true); }
    importInput.value = "";
  });
  buildPosts(); render(); (document.getElementById("notes") as HTMLTextAreaElement).value = draft.notes;
  if (shared) {
    const hash = new URLSearchParams(location.hash.slice(1));
    try {
      token = hash.get('edit') || sessionStorage.getItem('die-leadership-edit') || '';
      if (hash.has('edit')) { sessionStorage.setItem('die-leadership-edit', token); history.replaceState(null, '', location.pathname + location.search); }
    } catch { token = hash.get('edit') || ''; if (hash.has('edit')) history.replaceState(null, '', location.pathname + location.search); }
    const endpoint = root.dataset.endpoint;
    if (!endpoint) { status.textContent = t('Gemeinsamer Speicher ist noch nicht eingerichtet.'); return; }
    status.textContent = t('Gemeinsamer Stand wird geladen …');
    sync = createLeadershipSync({
      initial: original, endpoint, token,
      onState(next: WorkshopDraft, canEdit: boolean, conflict: boolean) {
        draft = next; writable = canEdit; render();
        const notes = document.getElementById('notes') as HTMLTextAreaElement; if (notes.value !== draft.notes) notes.value = draft.notes;
        const banner = document.getElementById('sync-conflict'); if (banner) banner.hidden = !conflict;
      },
      onStatus(message: string) { status.textContent = t(message); },
    });
    document.getElementById('keep-remote')?.addEventListener('click', () => { download(draft, 'DIE-Fuehrungsworkshop-vor-Konfliktloesung.json'); sync?.resolve(false); });
    document.getElementById('keep-local')?.addEventListener('click', () => sync?.resolve(true));
    document.getElementById('share-edit')?.addEventListener('click', async () => {
      const link = new URL(location.href); link.hash = new URLSearchParams({ edit: token }).toString();
      const field = document.getElementById('edit-link') as HTMLInputElement; field.value = link.href; field.hidden = false;
      try { await navigator.clipboard.writeText(link.href); say('Bearbeitungslink kopiert. Nur an eure Bearbeitungsrunde weitergeben.'); } catch { field.focus(); field.select(); }
    });
    document.getElementById('take-local')?.addEventListener('click', () => {
      const control = document.getElementById('take-local') as HTMLButtonElement;
      if (!control.dataset.confirm) { control.dataset.confirm = 'yes'; control.textContent = t('Lokalen Stand gemeinsam übernehmen?'); return; }
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem(`die-workshop:${draft.id}:v1`) || 'null');
        if (!saved) { say('In diesem Browser wurde kein lokaler Entwurf gefunden.', true); return; }
        const imported = saved.version === 1 ? migrate(saved) : validate(saved);
        download(draft, 'DIE-Fuehrungsworkshop-vor-Uebernahme.json'); draft = imported; buildPosts(); render(); (document.getElementById('notes') as HTMLTextAreaElement).value = draft.notes; save();
      } catch { say('Der lokale Entwurf konnte nicht übernommen werden.', true); }
      delete control.dataset.confirm; control.textContent = t('Lokalen Entwurf übernehmen');
    });
    window.addEventListener('beforeunload', event => { if (sync?.hasPending()) { event.preventDefault(); event.returnValue = ''; } });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) void sync?.refresh(); });
  }
}
