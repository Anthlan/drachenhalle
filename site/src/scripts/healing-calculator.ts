const getNumber = (formData: FormData, name: string) => {
  const value = String(formData.get(name) ?? "").trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const wholeNumber = (value: number | null, min: number, max: number) => (
  value !== null && Number.isInteger(value) && value >= min && value <= max
);

const formatDuration = (totalSeconds: number) => {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")} Std.`;
  return `${minutes}:${String(remainder).padStart(2, "0")} Min.`;
};

const addFact = (container: HTMLElement, label: string, value: string) => {
  const item = document.createElement("div");
  const term = document.createElement("span");
  const detail = document.createElement("strong");
  term.textContent = label;
  detail.textContent = value;
  item.append(term, detail);
  container.append(item);
};

export const initializeHealingCalculator = () => {
  const root = document.querySelector<HTMLElement>("[data-healing-calculator]");
  const form = root?.querySelector<HTMLFormElement>("[data-healing-form]");
  const result = root?.querySelector<HTMLElement>("[data-healing-result]");
  const error = root?.querySelector<HTMLElement>("[data-healing-error]");
  const kicker = root?.querySelector<HTMLElement>("[data-healing-kicker]");
  const title = root?.querySelector<HTMLElement>("[data-healing-title]");
  const summary = root?.querySelector<HTMLElement>("[data-healing-summary]");
  const facts = root?.querySelector<HTMLElement>("[data-healing-facts]");
  const soldiers = root?.querySelector<HTMLElement>("[data-healing-soldiers]");
  const detail = root?.querySelector<HTMLElement>("[data-healing-detail]");

  if (!root || !form || !result || !error || !kicker || !title || !summary || !facts || !soldiers || !detail) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.hidden = true;

    const data = new FormData(form);
    const helpMinutes = getNumber(data, "helpMinutes");
    const helpSeconds = getNumber(data, "helpSeconds");
    const helpLimit = getNumber(data, "helpLimit");
    const activeHelpers = getNumber(data, "activeHelpers");
    const reservePercent = getNumber(data, "reservePercent");
    const calibrationSoldiers = getNumber(data, "calibrationSoldiers");
    const calibrationHours = getNumber(data, "calibrationHours");
    const calibrationMinutes = getNumber(data, "calibrationMinutes");
    const calibrationSeconds = getNumber(data, "calibrationSeconds");

    if (
      !wholeNumber(helpMinutes, 0, 59)
      || !wholeNumber(helpSeconds, 0, 59)
      || !wholeNumber(helpLimit, 1, 100)
      || !wholeNumber(activeHelpers, 0, 100)
      || reservePercent === null
      || reservePercent < 0
      || reservePercent > 25
    ) {
      error.textContent = "Bitte prüfe Hilfszeit, Hilfslimit, Helferzahl und Sicherheitsreserve.";
      error.hidden = false;
      return;
    }

    const calibrationFieldsFilled = [
      calibrationSoldiers,
      calibrationHours,
      calibrationMinutes,
      calibrationSeconds,
    ].some((value) => value !== null);
    const calibrationDuration = (calibrationHours ?? 0) * 3600
      + (calibrationMinutes ?? 0) * 60
      + (calibrationSeconds ?? 0);

    if (
      calibrationFieldsFilled
      && (
        !wholeNumber(calibrationSoldiers, 1, 99999999)
        || !wholeNumber(calibrationHours ?? 0, 0, 999)
        || !wholeNumber(calibrationMinutes ?? 0, 0, 59)
        || !wholeNumber(calibrationSeconds ?? 0, 0, 59)
        || calibrationDuration <= 0
      )
    ) {
      error.textContent = "Für die Kalibrierung werden eine Soldatenzahl und eine vollständige Heilzeit benötigt.";
      error.hidden = false;
      return;
    }

    const secondsPerHelp = helpMinutes * 60 + helpSeconds;
    if (secondsPerHelp <= 0) {
      error.textContent = "Die Hilfszeit muss größer als null sein.";
      error.hidden = false;
      return;
    }

    const usableHelpers = Math.min(activeHelpers, helpLimit);
    const theoreticalSeconds = secondsPerHelp * usableHelpers;
    const safeSeconds = Math.floor(theoreticalSeconds * (1 - reservePercent / 100));
    const helpersCapped = activeHelpers > helpLimit;

    facts.replaceChildren();
    addFact(facts, "Hilfszeit je Hilfe", formatDuration(secondsPerHelp));
    addFact(facts, "Nutzbare Helfer", `${usableHelpers} von ${activeHelpers}`);
    addFact(facts, "Theoretisch instant", formatDuration(theoreticalSeconds));
    addFact(facts, `Sicher mit ${reservePercent} % Reserve`, formatDuration(safeSeconds));

    if (usableHelpers === 0) {
      result.dataset.state = "danger";
      kicker.textContent = "Noch keine Hilfe eingeplant";
      title.textContent = "So wird der Block nicht instant";
      summary.textContent = "Ohne aktive Helfer wird keine Heilzeit durch Allianzhilfe abgezogen.";
      soldiers.textContent = "Noch keinen Heilblock starten";
      detail.textContent = "Plane mindestens einen erreichbaren Helfer ein oder nutze einen normalen, bewusst längeren Heilvorgang.";
      return;
    }

    if (!calibrationFieldsFilled) {
      result.dataset.state = "warning";
      kicker.textContent = "Zeitfenster berechnet";
      title.textContent = "Dein sicherer Heilblock";
      summary.textContent = `Plane einen Heilblock von höchstens ${formatDuration(safeSeconds)} ${helpersCapped ? `Dein Hilfslimit begrenzt die Berechnung auf ${helpLimit} Helfer.` : ""}`.trim();
      soldiers.textContent = "Soldatenzahl noch offen";
      detail.textContent = "Trage links einen echten Heilblock ein, damit der Rechner dieses Zeitfenster in eine persönliche Soldatenzahl übersetzt.";
      return;
    }

    const secondsPerSoldier = calibrationDuration / (calibrationSoldiers as number);
    const recommendedSoldiers = Math.floor(safeSeconds / secondsPerSoldier);
    const expectedDuration = recommendedSoldiers * secondsPerSoldier;
    result.dataset.state = recommendedSoldiers > 0 ? "success" : "danger";

    if (recommendedSoldiers <= 0) {
      kicker.textContent = "Kalibrierung geprüft";
      title.textContent = "Der sichere Block ist sehr klein";
      summary.textContent = `Dein sicheres Zeitfenster beträgt ${formatDuration(safeSeconds)}, liegt aber unter der kalibrierten Heilzeit eines Soldaten.`;
      soldiers.textContent = "Unter 1 Soldat";
      detail.textContent = "Prüfe deine Eingaben und plane mehr sofortige Helfer ein. Das Tool rundet nie nach oben.";
      return;
    }

    kicker.textContent = "Persönlich kalibriert";
    title.textContent = "Dieser Heilblock sollte passen";
    summary.textContent = `Mit ${usableHelpers} sofortigen Hilfen und ${reservePercent} % Reserve bleibt der berechnete Block innerhalb deines sicheren Zeitfensters.`;
    soldiers.textContent = `${recommendedSoldiers.toLocaleString("de-DE")} Soldaten`;
    detail.textContent = `Geschätzte Heilzeit: ${formatDuration(expectedDuration)} Gültig für dieselbe Truppenstufe und Zusammensetzung wie deine Kalibrierung mit ${(calibrationSoldiers as number).toLocaleString("de-DE")} Soldaten.`;
  });

  form.requestSubmit();
};
