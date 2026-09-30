type ShieldEvent = {
  slug?: string;
  title: string;
  date: string;
  time?: string | null;
  end?: string | null;
  endDate?: string | null;
  detailUrl: string;
};

type ShieldCounts = {
  shields24: number;
  shields12: number;
  shields8: number;
};

type ShieldHours = 8 | 12 | 24;

type ShieldStep = {
  at: Date;
  hours: ShieldHours;
  phaseLabel: string;
};

type ActiveWindow = {
  start: Date;
  end: Date;
  restartAt: Date;
  label: string;
  type: "capital" | "raid" | "mixed";
};

type ProtectionSegment = {
  start: Date;
  end: Date;
  label: string;
};

type Allocation = {
  counts: ShieldCounts;
  durationMs: number;
};

type PlanState = {
  used: ShieldCounts;
  allocations: Allocation[];
  completeSegments: number;
  coveredMs: number;
  excessMs: number;
};

type ProtectionPlan = {
  complete: boolean;
  steps: ShieldStep[];
  coveredMs: number;
  requiredMs: number;
  missingMs: number;
  used: ShieldCounts;
  coverageEnd: Date;
};

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const BATTLE_FRENZY_MINUTES = 15;
const MAX_RAID_WINDOWS = 5;

const emptyCounts = (): ShieldCounts => ({ shields24: 0, shields12: 0, shields8: 0 });

const parseEventDate = (event: ShieldEvent, boundary: "start" | "end") => {
  const date = boundary === "end" ? event.endDate ?? event.date : event.date;
  const time = boundary === "end" ? event.end ?? event.time ?? "00:00" : event.time ?? "00:00";
  return new Date(`${date}T${time}:00`);
};

const pad = (value: number) => String(value).padStart(2, "0");

const toInputValue = (date: Date) => (
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  + `T${pad(date.getHours())}:${pad(date.getMinutes())}`
);

const toCalendarValue = (date: Date) => (
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
  + `T${pad(date.getHours())}${pad(date.getMinutes())}00`
);

const formatDateTime = (date: Date) => new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
}).format(date);

const formatTime = (date: Date) => new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
}).format(date);

const formatEventWindow = (start: Date, end: Date) => {
  const startLabel = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(start);
  const endLabel = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(end);
  return `${startLabel} Uhr bis ${endLabel} Uhr`;
};

const formatDuration = (value: number) => {
  const totalMinutes = Math.max(0, Math.round(value / MINUTE));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return [
    days ? `${days} ${days === 1 ? "Tag" : "Tage"}` : "",
    hours ? `${hours} Std.` : "",
    minutes ? `${minutes} Min.` : "",
  ].filter(Boolean).join(" ") || "0 Min.";
};

const boundedCount = (value: FormDataEntryValue | null) => {
  const parsed = Number.parseInt(String(value ?? "0"), 10);
  return Number.isFinite(parsed) ? Math.min(20, Math.max(0, parsed)) : 0;
};

const countShields = (counts: ShieldCounts) => counts.shields24 + counts.shields12 + counts.shields8;

const durationForCounts = (counts: ShieldCounts) => (
  (counts.shields24 * 24 + counts.shields12 * 12 + counts.shields8 * 8) * HOUR
);

const addCounts = (left: ShieldCounts, right: ShieldCounts): ShieldCounts => ({
  shields24: left.shields24 + right.shields24,
  shields12: left.shields12 + right.shields12,
  shields8: left.shields8 + right.shields8,
});

const fitsInventory = (used: ShieldCounts, inventory: ShieldCounts) => (
  used.shields24 <= inventory.shields24
  && used.shields12 <= inventory.shields12
  && used.shields8 <= inventory.shields8
);

const stateKey = (counts: ShieldCounts) => `${counts.shields24}:${counts.shields12}:${counts.shields8}`;

const compareCompleteStates = (left: PlanState, right: PlanState, strategy: string) => {
  const countDifference = countShields(left.used) - countShields(right.used);
  const excessDifference = left.excessMs - right.excessMs;
  return strategy === "least-waste"
    ? excessDifference || countDifference
    : countDifference || excessDifference;
};

const isBetterForSameInventory = (
  candidate: PlanState,
  current: PlanState,
  processedSegments: number,
  strategy: string,
) => {
  const candidateComplete = candidate.completeSegments === processedSegments;
  const currentComplete = current.completeSegments === processedSegments;
  if (candidateComplete !== currentComplete) return candidateComplete;
  if (candidateComplete) return compareCompleteStates(candidate, current, strategy) < 0;
  return candidate.coveredMs > current.coveredMs
    || (
      candidate.coveredMs === current.coveredMs
      && (
        candidate.completeSegments > current.completeSegments
        || (
          candidate.completeSegments === current.completeSegments
          && candidate.excessMs < current.excessMs
        )
      )
    );
};

const allocationCandidates = (requiredMs: number, inventory: ShieldCounts) => {
  const candidates: Allocation[] = [];
  const upperDuration = requiredMs + 24 * HOUR;

  for (let shields24 = 0; shields24 <= inventory.shields24; shields24 += 1) {
    for (let shields12 = 0; shields12 <= inventory.shields12; shields12 += 1) {
      for (let shields8 = 0; shields8 <= inventory.shields8; shields8 += 1) {
        const counts = { shields24, shields12, shields8 };
        const durationMs = durationForCounts(counts);
        if (durationMs <= upperDuration) candidates.push({ counts, durationMs });
      }
    }
  }

  return candidates;
};

const buildSteps = (segment: ProtectionSegment, allocation: Allocation) => {
  const steps: ShieldStep[] = [];
  const cursor = new Date(segment.start);
  const durations: ShieldHours[] = [
    ...Array.from({ length: allocation.counts.shields24 }, () => 24 as const),
    ...Array.from({ length: allocation.counts.shields12 }, () => 12 as const),
    ...Array.from({ length: allocation.counts.shields8 }, () => 8 as const),
  ];

  for (const hours of durations) {
    steps.push({ at: new Date(cursor), hours, phaseLabel: segment.label });
    cursor.setTime(cursor.getTime() + hours * HOUR);
  }

  return { steps, coverageEnd: cursor };
};

const optimizeProtectionPlan = (
  segments: ProtectionSegment[],
  inventory: ShieldCounts,
  strategy: string,
): ProtectionPlan => {
  let states = new Map<string, PlanState>([[stateKey(emptyCounts()), {
    used: emptyCounts(),
    allocations: [],
    completeSegments: 0,
    coveredMs: 0,
    excessMs: 0,
  }]]);

  segments.forEach((segment, index) => {
    const requiredMs = Math.max(0, segment.end.getTime() - segment.start.getTime());
    const allocations = allocationCandidates(requiredMs, inventory);
    const nextStates = new Map<string, PlanState>();

    for (const state of states.values()) {
      for (const allocation of allocations) {
        const used = addCounts(state.used, allocation.counts);
        if (!fitsInventory(used, inventory)) continue;
        const coveredMs = Math.min(requiredMs, allocation.durationMs);
        const candidate: PlanState = {
          used,
          allocations: [...state.allocations, allocation],
          completeSegments: state.completeSegments + (allocation.durationMs >= requiredMs ? 1 : 0),
          coveredMs: state.coveredMs + coveredMs,
          excessMs: state.excessMs + Math.max(0, allocation.durationMs - requiredMs),
        };
        const key = stateKey(used);
        const current = nextStates.get(key);
        if (!current || isBetterForSameInventory(candidate, current, index + 1, strategy)) {
          nextStates.set(key, candidate);
        }
      }
    }

    states = nextStates;
  });

  const allStates = [...states.values()];
  const completeStates = allStates.filter((state) => state.completeSegments === segments.length);
  const selected = completeStates.length > 0
    ? completeStates.sort((left, right) => compareCompleteStates(left, right, strategy))[0]
    : allStates.sort((left, right) => (
      right.coveredMs - left.coveredMs
      || right.completeSegments - left.completeSegments
      || countShields(left.used) - countShields(right.used)
      || left.excessMs - right.excessMs
    ))[0] ?? {
      used: emptyCounts(),
      allocations: segments.map(() => ({ counts: emptyCounts(), durationMs: 0 })),
      completeSegments: 0,
      coveredMs: 0,
      excessMs: 0,
    };

  const steps: ShieldStep[] = [];
  let coverageEnd = segments[0]?.start ?? new Date();
  segments.forEach((segment, index) => {
    const built = buildSteps(segment, selected.allocations[index] ?? { counts: emptyCounts(), durationMs: 0 });
    steps.push(...built.steps);
    if (built.coverageEnd > coverageEnd) coverageEnd = built.coverageEnd;
  });
  const requiredMs = segments.reduce((sum, segment) => sum + segment.end.getTime() - segment.start.getTime(), 0);

  return {
    complete: selected.completeSegments === segments.length,
    steps,
    coveredMs: selected.coveredMs,
    requiredMs,
    missingMs: Math.max(0, requiredMs - selected.coveredMs),
    used: selected.used,
    coverageEnd,
  };
};

const mergeActiveWindows = (
  windows: ActiveWindow[],
  rangeStart: Date,
  rangeEnd: Date,
) => {
  const normalized = windows
    .filter((window) => window.end > rangeStart && window.start < rangeEnd)
    .map((window) => ({
      ...window,
      start: new Date(Math.max(window.start.getTime(), rangeStart.getTime())),
      end: new Date(Math.min(window.end.getTime(), rangeEnd.getTime())),
      restartAt: new Date(Math.min(window.restartAt.getTime(), rangeEnd.getTime())),
    }))
    .sort((left, right) => left.start.getTime() - right.start.getTime());

  const merged: ActiveWindow[] = [];
  for (const window of normalized) {
    const previous = merged.at(-1);
    if (!previous || window.start > previous.restartAt) {
      merged.push({ ...window });
      continue;
    }
    previous.end = new Date(Math.max(previous.end.getTime(), window.end.getTime()));
    previous.restartAt = new Date(Math.max(previous.restartAt.getTime(), window.restartAt.getTime()));
    if (!previous.label.includes(window.label)) previous.label = `${previous.label} & ${window.label}`;
    if (previous.type !== window.type) previous.type = "mixed";
  }
  return merged;
};

const buildProtectionSegments = (
  firstStart: Date,
  raidEnd: Date,
  windows: ActiveWindow[],
) => {
  const segments: ProtectionSegment[] = [];
  let cursor = new Date(firstStart);
  let previousWindow: ActiveWindow | null = null;

  for (const window of windows) {
    if (window.start > cursor) {
      const label = previousWindow
        ? `Schutz zwischen ${previousWindow.label} und ${window.label}`
        : `Schutz bis ${window.label}`;
      segments.push({ start: new Date(cursor), end: new Date(window.start), label });
    }
    if (window.restartAt > cursor) cursor = new Date(window.restartAt);
    previousWindow = window;
  }

  if (cursor < raidEnd) {
    segments.push({
      start: new Date(cursor),
      end: new Date(raidEnd),
      label: previousWindow ? `Schutz nach ${previousWindow.label}` : "Durchgehender Raubzugschutz",
    });
  }

  return segments;
};

const escapeCalendarText = (value: string) => value
  .replaceAll("\\", "\\\\")
  .replaceAll("\n", "\\n")
  .replaceAll(",", "\\,")
  .replaceAll(";", "\\;");

const calendarEntry = (
  uid: string,
  start: Date,
  end: Date,
  summary: string,
  description: string,
  alarmMinutes: number,
) => {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VEVENT",
    `UID:${uid}@drachenhalle`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Europe/Berlin:${toCalendarValue(start)}`,
    `DTEND;TZID=Europe/Berlin:${toCalendarValue(end)}`,
    `SUMMARY:${escapeCalendarText(summary)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    "BEGIN:VALARM",
    `TRIGGER:-PT${alarmMinutes}M`,
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeCalendarText(summary)}`,
    "END:VALARM",
    "END:VEVENT",
  ];
};

const createCalendar = (
  raid: ShieldEvent,
  steps: ShieldStep[],
  activeWindows: ActiveWindow[],
  capital: ShieldEvent | null,
  capitalMode: string,
) => {
  const entries = steps.flatMap((step, index) => calendarEntry(
    `schildplan-${raid.date}-${index}`,
    step.at,
    new Date(step.at.getTime() + 15 * MINUTE),
    `🛡️ ${step.hours}-Stunden-Schild setzen`,
    `${step.phaseLabel}. Bitte den aktuellen Schildstatus und zurückkehrende Märsche im Spiel prüfen.`,
    10,
  ));

  activeWindows.forEach((window, index) => {
    entries.push(...calendarEntry(
      `schildplan-aktiv-${raid.date}-${index}`,
      window.start,
      window.end,
      `⚔️ ${window.label}`,
      `Bewusstes Kampfzeitfenster ohne Schild. Neuer Schutz ist frühestens ab ${formatDateTime(window.restartAt)} Uhr geplant.`,
      15,
    ));
  });

  if (capital && capitalMode === "unclear") {
    const capitalStart = parseEventDate(capital, "start");
    entries.push(...calendarEntry(
      `schildplan-hauptstadt-offen-${raid.date}`,
      capitalStart,
      new Date(capitalStart.getTime() + 15 * MINUTE),
      "⚔️ Hauptstadteroberung: Teilnahme noch klären",
      "Bei aktiver Teilnahme muss der Schildplan neu berechnet werden.",
      30,
    ));
  }

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DIE Drachenhalle//Schildrechner//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-TIMEZONE:Europe/Berlin",
    ...entries,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
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

export const initializeShieldCalculator = () => {
  const root = document.querySelector<HTMLElement>("[data-shield-calculator]");
  const dataElement = document.querySelector<HTMLScriptElement>("#shield-events-data");
  const windowTemplate = document.querySelector<HTMLTemplateElement>("#shield-raid-window-template");
  if (!root || !dataElement) return;

  const data = JSON.parse(dataElement.textContent || "{}") as {
    raidEvents?: ShieldEvent[];
    capitalEvents?: ShieldEvent[];
  };
  const raidEvents = data.raidEvents ?? [];
  const capitalEvents = data.capitalEvents ?? [];
  const now = new Date();
  const requestedSlug = new URLSearchParams(window.location.search).get("event");
  const requestedRaid = requestedSlug
    ? raidEvents.find((event) => event.slug === requestedSlug && parseEventDate(event, "end") > now) ?? null
    : null;
  const raid = requestedRaid ?? raidEvents
    .map((event) => ({ event, end: parseEventDate(event, "end") }))
    .find(({ end }) => end > now)?.event ?? null;

  const form = root.querySelector<HTMLFormElement>("[data-shield-form]");
  const firstShieldInput = form?.elements.namedItem("firstShield") as HTMLInputElement | null;
  const calculateButton = root.querySelector<HTMLButtonElement>("[data-calculate-button]");
  const raidDate = root.querySelector<HTMLElement>("[data-raid-date]");
  const raidLink = root.querySelector<HTMLAnchorElement>("[data-raid-link]");
  const capitalHint = root.querySelector<HTMLElement>("[data-capital-hint]");
  const capitalModeField = root.querySelector<HTMLElement>("[data-capital-mode-field]");
  const formError = root.querySelector<HTMLElement>("[data-form-error]");
  const result = root.querySelector<HTMLElement>("[data-shield-result]");
  const resultKicker = root.querySelector<HTMLElement>("[data-result-kicker]");
  const resultTitle = root.querySelector<HTMLElement>("[data-result-title]");
  const resultSummary = root.querySelector<HTMLElement>("[data-result-summary]");
  const resultFacts = root.querySelector<HTMLElement>("[data-result-facts]");
  const resultNote = root.querySelector<HTMLElement>("[data-result-note]");
  const scheduleList = root.querySelector<HTMLOListElement>("[data-schedule-list]");
  const calmCharacter = root.querySelector<HTMLImageElement>("[data-character-calm]");
  const concernedCharacter = root.querySelector<HTMLImageElement>("[data-character-concerned]");
  const downloadButton = root.querySelector<HTMLButtonElement>("[data-download-plan]");
  const resultEventLink = root.querySelector<HTMLAnchorElement>("[data-result-event-link]");
  const addWindowButton = root.querySelector<HTMLButtonElement>("[data-add-raid-window]");
  const windowList = root.querySelector<HTMLElement>("[data-raid-window-list]");
  const emptyWindowHint = root.querySelector<HTMLElement>("[data-raid-window-empty]");
  const windowStatus = root.querySelector<HTMLElement>("[data-window-status]");

  if (!form || !firstShieldInput || !result || !raidDate || !raidLink || !calculateButton) return;

  if (!raid) {
    raidDate.textContent = "Im veröffentlichten Kalender ist aktuell kein zukünftiger Raubzug eingetragen.";
    calculateButton.disabled = true;
    firstShieldInput.disabled = true;
    if (addWindowButton) addWindowButton.disabled = true;
    return;
  }

  const raidStart = parseEventDate(raid, "start");
  const raidEnd = parseEventDate(raid, "end");
  const capital = capitalEvents.find((event) => event.date === raid.date) ?? null;
  const suggestedStart = new Date(raidStart.getTime() - 8 * HOUR);
  firstShieldInput.value = toInputValue(suggestedStart);
  raidDate.textContent = formatEventWindow(raidStart, raidEnd);
  raidLink.href = raid.detailUrl;
  raidLink.hidden = false;
  if (resultEventLink) resultEventLink.href = raid.detailUrl;

  if (capital && capitalHint && capitalModeField) {
    const capitalStart = parseEventDate(capital, "start");
    const capitalEnd = parseEventDate(capital, "end");
    capitalHint.textContent = `Parallel findet die Hauptstadteroberung von ${formatDateTime(capitalStart)} bis ${formatDateTime(capitalEnd)} Uhr statt.`;
    capitalHint.hidden = false;
    capitalModeField.hidden = false;
  }

  const updateWindowControls = () => {
    const count = windowList?.querySelectorAll("[data-raid-window]").length ?? 0;
    if (emptyWindowHint) emptyWindowHint.hidden = count > 0;
    if (addWindowButton) addWindowButton.disabled = count >= MAX_RAID_WINDOWS;
  };

  const addRaidWindow = () => {
    if (!windowTemplate || !windowList) return;
    const count = windowList.querySelectorAll("[data-raid-window]").length;
    if (count >= MAX_RAID_WINDOWS) return;
    const fragment = windowTemplate.content.cloneNode(true) as DocumentFragment;
    const row = fragment.querySelector<HTMLElement>("[data-raid-window]");
    const startInput = fragment.querySelector<HTMLInputElement>("[data-window-start]");
    const endInput = fragment.querySelector<HTMLInputElement>("[data-window-end]");
    const removeButton = fragment.querySelector<HTMLButtonElement>("[data-remove-raid-window]");
    if (!row || !startInput || !endInput || !removeButton) return;

    const start = new Date(raidStart);
    start.setHours(8 + count * 2, 0, 0, 0);
    while (start < raidStart) start.setDate(start.getDate() + 1);
    if (start >= raidEnd) start.setTime(Math.max(raidStart.getTime(), raidEnd.getTime() - HOUR));
    const end = new Date(Math.min(start.getTime() + HOUR, raidEnd.getTime()));
    const min = toInputValue(raidStart);
    const max = toInputValue(raidEnd);
    startInput.min = min;
    startInput.max = max;
    endInput.min = min;
    endInput.max = max;
    startInput.value = toInputValue(start);
    endInput.value = toInputValue(end);
    removeButton.addEventListener("click", () => {
      row.remove();
      updateWindowControls();
      if (windowStatus) windowStatus.textContent = "Plünderfenster entfernt. Plan bitte neu berechnen.";
    });
    windowList.append(fragment);
    updateWindowControls();
    startInput.focus();
    if (windowStatus) windowStatus.textContent = "Plünderfenster ergänzt. Zeiten prüfen und Schildplan neu berechnen.";
  };

  addWindowButton?.addEventListener("click", addRaidWindow);
  updateWindowControls();

  let currentCalendar = "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (formError) formError.hidden = true;

    const formData = new FormData(form);
    const inventory: ShieldCounts = {
      shields24: boundedCount(formData.get("shields24")),
      shields12: boundedCount(formData.get("shields12")),
      shields8: boundedCount(formData.get("shields8")),
    };
    const firstStart = new Date(String(formData.get("firstShield") ?? ""));
    const strategy = String(formData.get("strategy") ?? "fewest");
    const capitalMode = String(formData.get("capitalMode") ?? "passive");
    const returnBuffer = Math.min(15, Math.max(0, Number.parseInt(String(formData.get("returnBuffer") ?? "0"), 10) || 0));
    const cooldownMs = (BATTLE_FRENZY_MINUTES + returnBuffer) * MINUTE;

    if (Number.isNaN(firstStart.getTime())) {
      if (formError) {
        formError.textContent = "Bitte wähle einen gültigen Zeitpunkt für dein erstes Schild.";
        formError.hidden = false;
      }
      return;
    }
    if (firstStart >= raidEnd) {
      if (formError) {
        formError.textContent = "Das erste Schild muss vor dem Ende des Raubzugs gesetzt werden.";
        formError.hidden = false;
      }
      return;
    }

    const customWindows: ActiveWindow[] = [];
    const rows = [...(windowList?.querySelectorAll<HTMLElement>("[data-raid-window]") ?? [])];
    for (let index = 0; index < rows.length; index += 1) {
      const startInput = rows[index].querySelector<HTMLInputElement>("[data-window-start]");
      const endInput = rows[index].querySelector<HTMLInputElement>("[data-window-end]");
      const start = new Date(startInput?.value ?? "");
      const end = new Date(endInput?.value ?? "");
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        if (formError) {
          formError.textContent = `Bitte fülle Start und Ende für Plünderfenster ${index + 1} vollständig aus.`;
          formError.hidden = false;
        }
        return;
      }
      if (start < raidStart || end > raidEnd || end <= start) {
        if (formError) {
          formError.textContent = `Plünderfenster ${index + 1} muss vollständig im Raubzug liegen und nach seinem Start enden.`;
          formError.hidden = false;
        }
        return;
      }
      customWindows.push({
        start,
        end,
        restartAt: new Date(end.getTime() + cooldownMs),
        label: `Plünderfenster ${index + 1}`,
        type: "raid",
      });
    }

    const combatWindows = [...customWindows];
    if (capital && capitalMode === "active") {
      const start = parseEventDate(capital, "start");
      const end = parseEventDate(capital, "end");
      combatWindows.push({
        start,
        end,
        restartAt: new Date(end.getTime() + cooldownMs),
        label: "Hauptstadteroberung",
        type: "capital",
      });
    }

    const activeWindows = mergeActiveWindows(combatWindows, firstStart, raidEnd);
    const segments = buildProtectionSegments(firstStart, raidEnd, activeWindows);
    const plan = optimizeProtectionPlan(segments, inventory, strategy);
    const startsLate = firstStart > raidStart;
    const lateMs = Math.max(0, firstStart.getTime() - raidStart.getTime());
    const missingMs = plan.missingMs + lateMs;
    const complete = plan.complete && !startsLate;
    const hasUnclearCapital = Boolean(capital && capitalMode === "unclear");
    const resultState = complete ? (hasUnclearCapital ? "warning" : "success") : "danger";

    let kicker = "Schildbestand geprüft";
    let title = "Dein Schildplan";
    let summary = "";
    let note = "";

    if (complete && activeWindows.length > 0) {
      kicker = "Kampf und Schutz geplant";
      title = "Deine Schutzphasen passen";
      summary = activeWindows.length === 1
        ? `Dein Bestand deckt alle ${segments.length} Schutzphasen rund um ein aktives Zeitfenster ab.`
        : `Dein Bestand deckt alle ${segments.length} Schutzphasen rund um ${activeWindows.length} aktive Zeitfenster ab.`;
      note = `Während der markierten Kampfzeiten bist du bewusst ungeschützt. Neuer Schutz beginnt jeweils frühestens nach ${BATTLE_FRENZY_MINUTES} Minuten Battle Frenzy${returnBuffer ? ` und ${returnBuffer} Minuten Rückkehrpuffer` : ""}.`;
    } else if (complete) {
      kicker = hasUnclearCapital ? "Plan passt – Rolle noch offen" : "Gut vorbereitet";
      title = hasUnclearCapital ? "Fast alles geklärt" : "Dein Schildplan passt";
      summary = hasUnclearCapital
        ? "Dein Bestand reicht für durchgehenden Schutz. Kläre vor Samstag noch, ob du bei der Hauptstadteroberung aktiv kämpfst."
        : `Dein ausgewählter Bestand schützt dich bis ${formatDateTime(plan.coverageEnd)} Uhr und deckt damit den gesamten Raubzug ab.`;
      note = hasUnclearCapital
        ? "Bei aktiver Teilnahme muss der Plan mit der entsprechenden Auswahl neu berechnet werden."
        : "Die Erinnerungen werden zehn Minuten vor jedem geplanten Schildwechsel ausgelöst.";
    } else {
      kicker = "Schutzlücke erkannt";
      title = "Anthlan macht sich Sorgen";
      summary = startsLate
        ? `Dein erstes Schild beginnt nach dem Start des Raubzugs. Insgesamt bleiben ungefähr ${formatDuration(missingMs)} ungeplant.`
        : `Mit deinem aktuellen Bestand fehlen ungefähr ${formatDuration(missingMs)} Schutz in den geplanten Schutzphasen.`;
      note = "Ergänze deinen Bestand, verkürze aktive Zeitfenster oder verschiebe den Schildstart. Erst bei vollständiger Abdeckung wird ein Erinnerungskalender erstellt.";
    }

    result.dataset.state = resultState;
    result.hidden = false;
    if (resultKicker) resultKicker.textContent = kicker;
    if (resultTitle) resultTitle.textContent = title;
    if (resultSummary) resultSummary.textContent = summary;
    if (resultNote) resultNote.textContent = note;
    if (calmCharacter) calmCharacter.hidden = !complete;
    if (concernedCharacter) concernedCharacter.hidden = complete;

    if (resultFacts) {
      resultFacts.replaceChildren();
      addFact(resultFacts, "Raubzug", formatEventWindow(raidStart, raidEnd));
      addFact(resultFacts, "Bestand", `${inventory.shields24} × 24h · ${inventory.shields12} × 12h · ${inventory.shields8} × 8h`);
      addFact(
        resultFacts,
        activeWindows.length > 0 ? "Aktive Zeitfenster" : complete ? "Abgedeckt bis" : "Noch offen",
        activeWindows.length > 0
          ? `${activeWindows.length} geplant`
          : complete
            ? formatDateTime(plan.coverageEnd)
            : formatDuration(missingMs),
      );
    }

    if (scheduleList) {
      scheduleList.replaceChildren();
      const timeline = [
        ...plan.steps.map((step) => ({ at: step.at, kind: "shield" as const, step })),
        ...activeWindows.map((window) => ({ at: window.start, kind: "active" as const, window })),
      ].sort((left, right) => left.at.getTime() - right.at.getTime());

      if (timeline.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "Mit dem eingetragenen Bestand kann noch kein Ablauf geplant werden.";
        scheduleList.append(empty);
      } else {
        timeline.forEach((entry) => {
          const item = document.createElement("li");
          const time = document.createElement("time");
          const label = document.createElement("strong");
          const phase = document.createElement("span");
          time.dateTime = entry.at.toISOString();
          if (entry.kind === "shield") {
            time.textContent = `${formatDateTime(entry.step.at)} Uhr`;
            label.textContent = `${entry.step.hours}-Stunden-Schild setzen`;
            phase.textContent = entry.step.phaseLabel;
          } else {
            item.classList.add("is-active-window");
            time.textContent = `${formatDateTime(entry.window.start)} bis ${formatTime(entry.window.end)} Uhr`;
            label.textContent = `Aktiv: ${entry.window.label}`;
            phase.textContent = `Bewusst ohne Schild · neuer Schutz ab ${formatTime(entry.window.restartAt)} Uhr`;
          }
          item.append(time, label, phase);
          scheduleList.append(item);
        });
      }
    }

    currentCalendar = complete
      ? createCalendar(raid, plan.steps, activeWindows, capital, capitalMode)
      : "";
    if (downloadButton) downloadButton.disabled = !currentCalendar;
    if (windowStatus) windowStatus.textContent = activeWindows.length > 0
      ? activeWindows.length === 1
        ? "Ein aktives Zeitfenster im Plan berücksichtigt."
        : `${activeWindows.length} aktive Zeitfenster im Plan berücksichtigt.`
      : "";
  });

  downloadButton?.addEventListener("click", () => {
    if (!currentCalendar) return;
    const blob = new Blob([currentCalendar], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `schildplan-raubzug-${raid.date}.ics`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  form.requestSubmit();
};
