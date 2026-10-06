import { competitionDays, actionPoints, actionBlock, nextRadarDay, competitionMilestones, milestoneProgress } from "../data/competition.ts";

export function pointsPlan(current: number, target: number, perAction: number, stock: number) {
  const missing = Math.max(0, target - current);
  const needed = perAction > 0 ? Math.ceil(missing / perAction) : null;
  const use = needed === null ? 0 : Math.min(needed, stock);
  return { missing, needed, use, remaining: stock - use, shortfall: Math.max(0, missing - use * perAction) };
}
export function radarPlan(stock: number, cap: number, arrivals: number) {
  if (stock > cap) throw new Error("Der Radarbestand darf das Speicherlimit nicht überschreiten.");
  const overflow = Math.max(0, stock + arrivals - cap);
  const clear = Math.min(stock, overflow);
  return { clear, saved: stock - clear, projected: Math.min(cap, stock - clear + arrivals), unavoidable: Math.max(0, arrivals - cap) };
}
export function initializeCompetitionCalculator() {
  const form = document.querySelector<HTMLFormElement>("[data-competition-form]");
  const output = document.querySelector<HTMLElement>("[data-competition-output]");
  const select = form?.querySelector<HTMLSelectElement>("[name=day]");
  if (!form || !output || !select) return;
  const key = "drachenhalle-competition-week-v2";
  const fmt = (value: number) => Math.round(value).toLocaleString("de-DE");
  const number = (name: string) => Number((form.elements.namedItem(name) as HTMLInputElement)?.value ?? 0);
  const line = (message: string) => { const p = document.createElement("p"); p.textContent = message; output.append(p); };
  const save = () => { try { localStorage.setItem(key, JSON.stringify(Object.fromEntries(new FormData(form)))); } catch { /* Speicherung optional. */ } };
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "null");
    for (const input of form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[name]")) if (saved && typeof saved[input.name] === "string") input.value = saved[input.name];
    for (const day of competitionDays) {
      const goal = form.elements.namedItem(`${day.id}-goal`) as HTMLSelectElement;
      if (saved && !saved[`${day.id}-goal`] && Number(saved[`${day.id}-target`]) > 0) goal.value = "custom";
    }
    if (!competitionDays.some(day => day.id === select.value)) select.value = "mon";
  } catch { /* Mit Standardwerten starten. */ }
  const update = () => {
    const day = competitionDays.find(day => day.id === select.value)!;
    for (const panel of form.querySelectorAll<HTMLElement>("[data-day]")) panel.hidden = panel.dataset.day !== day.id;
    const invalid = form.querySelector<HTMLInputElement>(`[data-day="${day.id}"] input:invalid`);
    if (invalid) { output.replaceChildren(); line("Bitte gültige, nicht negative Mengen und Punkte eintragen."); return; }
    let total = 0;
    for (const action of day.actions) {
      const points = actionPoints(action, number(`${day.id}-${action.id}-quantity`), number(`${day.id}-${action.id}-rate`) / actionBlock(action));
      total += points;
      const cell = form.querySelector<HTMLElement>(`[data-points="${day.id}-${action.id}"]`);
      if (cell) cell.textContent = fmt(points);
    }
    output.replaceChildren();
    const current = number(`${day.id}-current`);
    const goal = form.elements.namedItem(`${day.id}-goal`) as HTMLSelectElement;
    const targetInput = form.elements.namedItem(`${day.id}-target`) as HTMLInputElement;
    if (goal.value === "next") targetInput.value = String(competitionMilestones.find(points => points > current) ?? 0);
    else if (goal.value !== "custom") targetInput.value = goal.value;
    const target = number(`${day.id}-target`);
    const milestones = form.querySelector<HTMLOListElement>("[data-milestones]")!;
    milestones.replaceChildren();
    for (const milestone of milestoneProgress(current, total)) {
      const item = document.createElement("li"); item.dataset.status = milestone.status;
      const title = document.createElement("strong"); title.textContent = `Meilenstein ${milestone.number} · ${fmt(milestone.points)}`;
      const status = document.createElement("span"); status.textContent = milestone.status === "reached" ? "Erreicht" : milestone.status === "planned" ? "Mit Plan abgedeckt" : `Noch ${fmt(milestone.missing)} Punkte mit diesem Plan`;
      item.append(title, status); milestones.append(item);
    }
    line(`${day.day}: ${day.title}. Dein geplanter Einsatz bringt ${fmt(total)} Punkte. Zusammen mit ${fmt(current)} vorhandenen Punkten: ${fmt(current + total)}.`);
    line(target > 0 ? (current + total >= target ? `Dein Ziel von ${fmt(target)} Punkten ist abgedeckt. Prüfe vor weiterem Einsatz, ob wir zusätzliche Punkte für den Tagessieg benötigen.` : `Zum Ziel fehlen nach diesem Plan noch ${fmt(target - current - total)} Punkte. Ergänze gezielt eine passende Vorratsmenge.`) : current >= competitionMilestones.at(-1)! ? "Alle neun dokumentierten Punkteschwellen sind erreicht. Zusätzlichen Einsatz für unseren Tagessieg abstimmen." : "Trage deine persönliche Belohnungsgrenze oder unser vereinbartes Tagesziel ein, um die verbleibende Lücke zu sehen.");
    line(day.save);
    line(`Einsatzbereitschaft: ${day.readiness}`);
    const next = nextRadarDay(competitionDays.indexOf(day));
    line(`Nächster Radar-Wertungstag nach ${day.day}: ${competitionDays[next.index].day} (in ${next.days} Tagen). ${day.actions.some(a => a.id === "radar") ? "Heute zählen Radarquests ebenfalls. Erst das heutige Ziel prüfen, dann für den nächsten Radar-Tag halten." : "Radar für diesen nächsten Tag halten, sofern Gültigkeit und Speicherplatz es zulassen."}`);
  };
  select.addEventListener("change", () => { update(); save(); });
  form.addEventListener("input", event => {
    const input = event.target as HTMLInputElement;
    if (input.name === `${select.value}-target`) (form.elements.namedItem(`${select.value}-goal`) as HTMLSelectElement).value = "custom";
    update(); save();
  });
  form.addEventListener("submit", event => { event.preventDefault(); if (form.reportValidity()) { update(); save(); } });
  form.querySelector<HTMLButtonElement>("[data-radar-calculate]")?.addEventListener("click", () => {
    const result = form.querySelector<HTMLElement>("[data-radar-result]")!;
    const inputs = ["radar", "cap", "arrivals"].map(name => form.elements.namedItem(name) as HTMLInputElement);
    if (inputs.some(input => !input.value.trim() || !input.checkValidity())) { result.textContent = "Bitte Radarbestand, Speicherlimit und Auffüllmenge vollständig und gültig eintragen."; return; }
    try {
      const plan = radarPlan(number("radar"), number("cap"), number("arrivals"));
      result.textContent = `Vor der nächsten Auffüllung ${plan.clear} Quests freimachen; ${plan.saved} vorhandene Quests halten. Danach voraussichtlich ${plan.projected} Quests gespeichert. ${plan.unavoidable ? "Die Auffüllmenge übersteigt das Limit; bitte prüfen." : "Vor jeder weiteren Auffüllung neu prüfen."} Eine genaue Sparuhrzeit braucht noch bestätigte Auffüllzeiten und Ablaufregeln.`;
    } catch(error) { result.textContent = (error as Error).message; }
    save();
  });
  form.querySelector<HTMLButtonElement>("[data-clear-day]")?.addEventListener("click", () => {
    for (const input of form.querySelectorAll<HTMLInputElement>(`[data-day="${select.value}"] input[data-quantity]`)) input.value = "0";
    update(); save();
  });
  update();
}
