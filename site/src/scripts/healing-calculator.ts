const getNumber = (formData: FormData, name: string) => {
  const value = String(formData.get(name) ?? "").trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const wholeNumber = (value: number | null, min: number, max: number) => (
  value !== null && Number.isInteger(value) && value >= min && value <= max
);

const TIER_BASE_SECONDS = {
  t1: 20,
  t2: 30,
  t3: 40,
  t4: 50,
  t5: 60,
  t6: 70,
  t7: 80,
  t8: 90,
  t9: 100,
  t10: 110,
} as const;

type TroopTier = keyof typeof TIER_BASE_SECONDS;

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
  const happyCharacter = root?.querySelector<HTMLImageElement>("[data-healing-character-happy]");
  const concernedCharacter = root?.querySelector<HTMLImageElement>("[data-healing-character-concerned]");
  const modeInputs = [...(root?.querySelectorAll<HTMLInputElement>('input[name="calculationMode"]') ?? [])];
  const modePanels = [...(root?.querySelectorAll<HTMLElement>("[data-healing-mode-panel]") ?? [])];

  if (!root || !form || !result || !error || !kicker || !title || !summary || !facts || !soldiers || !detail) return;

  const updateMode = () => {
    const selectedMode = modeInputs.find((input) => input.checked)?.value ?? "tier";
    modePanels.forEach((panel) => {
      const active = panel.dataset.healingModePanel === selectedMode;
      panel.hidden = !active;
      panel.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
        input.disabled = !active;
      });
    });
  };

  modeInputs.forEach((input) => input.addEventListener("change", updateMode));
  updateMode();

  const updateCharacter = (state: "success" | "danger") => {
    if (happyCharacter) happyCharacter.hidden = state !== "success";
    if (concernedCharacter) concernedCharacter.hidden = state !== "danger";
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.hidden = true;

    const data = new FormData(form);
    const helpSeconds = getNumber(data, "helpSeconds");
    const helpLimit = getNumber(data, "helpLimit");
    const activeHelpers = getNumber(data, "activeHelpers");
    const reservePercent = getNumber(data, "reservePercent");
    const calculationMode = String(data.get("calculationMode") ?? "tier");
    const requestedTier = String(data.get("troopTier") ?? "t8");
    const troopTier: TroopTier = requestedTier in TIER_BASE_SECONDS
      ? requestedTier as TroopTier
      : "t8";
    const healingSpeed = getNumber(data, "healingSpeed");
    const calibrationSoldiers = getNumber(data, "calibrationSoldiers");
    const calibrationHours = getNumber(data, "calibrationHours");
    const calibrationMinutes = getNumber(data, "calibrationMinutes");
    const calibrationSeconds = getNumber(data, "calibrationSeconds");

    if (
      !wholeNumber(helpSeconds, 1, 999999)
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

    const calibrationDuration = (calibrationHours ?? 0) * 3600
      + (calibrationMinutes ?? 0) * 60
      + (calibrationSeconds ?? 0);

    if (
      calculationMode === "calibration"
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

    if (
      calculationMode === "tier"
      && (healingSpeed === null || healingSpeed < 0 || healingSpeed > 9999)
    ) {
      error.textContent = "Bitte trage eine gültige Heilungsgeschwindigkeit ein.";
      error.hidden = false;
      return;
    }

    const secondsPerHelp = helpSeconds;
    const usableHelpers = Math.min(activeHelpers, helpLimit);
    const theoreticalSeconds = secondsPerHelp * usableHelpers;
    const safeSeconds = Math.floor(theoreticalSeconds * (1 - reservePercent / 100));

    facts.replaceChildren();
    addFact(facts, "Hilfszeit je Hilfe", formatDuration(secondsPerHelp));
    addFact(facts, "Nutzbare Helfer", `${usableHelpers} von ${activeHelpers}`);
    addFact(facts, "Theoretisch instant", formatDuration(theoreticalSeconds));
    addFact(facts, `Sicher mit ${reservePercent} % Reserve`, formatDuration(safeSeconds));

    if (usableHelpers === 0) {
      result.dataset.state = "danger";
      updateCharacter("danger");
      kicker.textContent = "Noch keine Hilfe eingeplant";
      title.textContent = "So wird der Block nicht instant";
      summary.textContent = "Ohne aktive Helfer wird keine Heilzeit durch Allianzhilfe abgezogen.";
      soldiers.textContent = "Noch keinen Heilblock starten";
      detail.textContent = "Plane mindestens einen erreichbaren Helfer ein oder nutze einen normalen, bewusst längeren Heilvorgang.";
      return;
    }

    const usesTierBase = calculationMode === "tier";
    const tierLabel = troopTier.toUpperCase();
    const baseSeconds = TIER_BASE_SECONDS[troopTier];
    const speedMultiplier = usesTierBase ? 1 + (healingSpeed as number) / 100 : 1;
    const secondsPerSoldier = usesTierBase
      ? baseSeconds / speedMultiplier
      : calibrationDuration / (calibrationSoldiers as number);
    const recommendedSoldiers = Math.floor(safeSeconds / secondsPerSoldier);
    const expectedDuration = recommendedSoldiers * secondsPerSoldier;
    result.dataset.state = recommendedSoldiers > 0 ? "success" : "danger";
    updateCharacter(recommendedSoldiers > 0 ? "success" : "danger");

    if (recommendedSoldiers <= 0) {
      kicker.textContent = "Kalibrierung geprüft";
      title.textContent = "Der sichere Block ist sehr klein";
      summary.textContent = `Dein sicheres Zeitfenster beträgt ${formatDuration(safeSeconds)}, liegt aber unter der kalibrierten Heilzeit eines Soldaten.`;
      soldiers.textContent = "Unter 1 Soldat";
      detail.textContent = "Prüfe deine Eingaben und plane mehr sofortige Helfer ein. Das Tool rundet nie nach oben.";
      return;
    }

    kicker.textContent = usesTierBase ? `Für ${tierLabel} berechnet` : "Persönlich kalibriert";
    title.textContent = "Dieser Heilblock sollte passen";
    summary.textContent = `Mit ${usableHelpers} sofortigen Hilfen und ${reservePercent} % Reserve bleibt der berechnete Block innerhalb deines sicheren Zeitfensters.`;
    const soldierLabel = recommendedSoldiers === 1
      ? usesTierBase ? `${tierLabel}-Soldat` : "Soldat"
      : usesTierBase ? `${tierLabel}-Soldaten` : "Soldaten";
    soldiers.textContent = `${recommendedSoldiers.toLocaleString("de-DE")} ${soldierLabel}`;
    detail.textContent = usesTierBase
      ? `Geschätzte Heilzeit: ${formatDuration(Math.ceil(expectedDuration))} Grundlage: ${baseSeconds} Sekunden je ${tierLabel} bei ${(healingSpeed as number).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} % Heilungsgeschwindigkeit.`
      : `Geschätzte Heilzeit: ${formatDuration(Math.ceil(expectedDuration))} Gültig für dieselbe Truppenstufe und Zusammensetzung wie deine Kalibrierung mit ${(calibrationSoldiers as number).toLocaleString("de-DE")} Soldaten.`;
  });

  form.requestSubmit();
};
