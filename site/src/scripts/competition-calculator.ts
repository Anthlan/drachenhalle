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
  if (!form || !output) return;
  const key = "drachenhalle-competition-v1";
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "null");
    if (saved && typeof saved === "object") for (const input of form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[name]")) {
      if (typeof saved[input.name] === "string") input.value = saved[input.name];
    }
  } catch { /* Speicher ist optional. */ }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const n = (name: string) => Number(data.get(name));
    const fmt = (value: number) => value.toLocaleString("de-DE");
    output.replaceChildren();
    const line = (message: string) => { const p = document.createElement("p"); p.textContent = message; output.append(p); };
    try {
      const plan = pointsPlan(n("current"), n("target"), n("points"), n("stock"));
      line(plan.missing === 0 ? "Wettkampfziel erreicht. Für dieses Ziel musst du keine weiteren Vorräte einsetzen." : `Es fehlen ${fmt(plan.missing)} Punkte. Du brauchst ${fmt(plan.needed!)} Einheiten der gewählten Aktion. Mit deinem Bestand kannst du ${fmt(plan.use)} einsetzen; ${fmt(plan.remaining)} bleiben übrig. Danach fehlen ${fmt(plan.shortfall)} Punkte.`);
      const phase = String(data.get("phase"));
      const action = String(data.get("action"));
      const matches = action === phase && action !== "other";
      line(matches ? "Passende Einsatzbereitschaft ausgewählt: Prüfe vor dem Einsatz, ob dieselbe Aktion in beiden aktuellen Aufgabenlisten zählt." : "Keine bestätigte Überschneidung gewählt. Prüfe die nächste passende Einsatzbereitschaft und die Wettkampf-Frist, bevor du Vorräte einsetzt.");
      if (matches && n("readinessPoints") > 0) {
        const readiness = pointsPlan(n("readinessCurrent"), n("readinessTarget"), n("readinessPoints"), n("stock"));
        const both = Math.max(plan.needed!, readiness.needed!);
        line(`Für beide Ziele zusammen brauchst du ${fmt(both)} Einheiten. Verfügbar: ${fmt(n("stock"))}. ${both <= n("stock") ? `Dein Bestand reicht; ${fmt(n("stock") - both)} Einheiten bleiben übrig.` : "Dein Bestand reicht nicht für beide Ziele."}`);
      } else line("Für eine gemeinsame Zielberechnung wähle eine passende Phase und trage deren Punkte je Einheit ein.");
      const radarFields = ["radar", "cap", "arrivals"];
      const radarComplete = radarFields.every(name => String(data.get(name) ?? "").trim() !== "");
      if (!radarComplete) {
        line("Für eine Radarplanung ergänze Bestand, Speicherlimit und Auffüllmenge. Deine Punkteplanung ist unabhängig davon berechnet.");
        try { localStorage.setItem(key, JSON.stringify(Object.fromEntries(data))); } catch { /* Speicher ist optional. */ }
        return;
      }
      const radar = radarPlan(n("radar"), n("cap"), n("arrivals"));
      line(`Radar vor der nächsten Auffüllung: ${fmt(radar.clear)} Quests erledigen, um möglichst viel Platz zu schaffen. ${fmt(radar.saved)} vorhandene Quests kannst du halten. Erwarteter Bestand danach: ${fmt(radar.projected)}.`);
      if (radar.unavoidable > 0) line("Die Auffüllmenge übersteigt das gesamte Speicherlimit. Prüfe deine Eingaben; diese Auffüllung lässt sich nicht vollständig speichern.");
      line("Sparbeginn: Halte Quests nur, wenn sie bis zum nächsten Radar-Wertungstag gültig bleiben. Prüfe vor jeder Auffüllung erneut den freien Platz. Nach dem letzten nötigen Freimachen kannst du den Rest halten. Eine feste Uhrzeit braucht eure bestätigten Auffüllzeiten und Ablaufregeln.");
      try { localStorage.setItem(key, JSON.stringify(Object.fromEntries(data))); } catch { /* Kein Speicher nötig. */ }
    } catch (error) { line(error instanceof Error ? error.message : "Bitte prüfe deine Eingaben."); }
  });
}
