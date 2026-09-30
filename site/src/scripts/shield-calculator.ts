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
  shields8: number;
};

type ShieldStep = {
  at: Date;
  hours: 8 | 24;
  phase: "continuous" | "before-capital" | "after-capital";
};

type PhasePlan = {
  complete: boolean;
  counts: ShieldCounts;
  durationMs: number;
  requiredMs: number;
  coverageEnd: Date;
  steps: ShieldStep[];
};

type SplitPlan = {
  complete: boolean;
  before: PhasePlan;
  after: PhasePlan;
  steps: ShieldStep[];
};

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

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

const compareComplete = (
  a: { count: number; excess: number },
  b: { count: number; excess: number },
  strategy: string,
) => {
  if (strategy === "least-waste") return a.excess - b.excess || a.count - b.count;
  return a.count - b.count || a.excess - b.excess;
};

const buildSteps = (
  start: Date,
  counts: ShieldCounts,
  phase: ShieldStep["phase"],
) => {
  const steps: ShieldStep[] = [];
  const cursor = new Date(start);
  const durations: Array<8 | 24> = [
    ...Array.from({ length: counts.shields24 }, () => 24 as const),
    ...Array.from({ length: counts.shields8 }, () => 8 as const),
  ];

  for (const hours of durations) {
    steps.push({ at: new Date(cursor), hours, phase });
    cursor.setTime(cursor.getTime() + hours * HOUR);
  }

  return { steps, coverageEnd: cursor };
};

const choosePhasePlan = (
  start: Date,
  end: Date,
  inventory: ShieldCounts,
  strategy: string,
  phase: ShieldStep["phase"],
): PhasePlan => {
  const requiredMs = Math.max(0, end.getTime() - start.getTime());
  let bestComplete: { counts: ShieldCounts; durationMs: number; count: number; excess: number } | null = null;
  let bestPartial: { counts: ShieldCounts; durationMs: number; count: number } | null = null;

  for (let shields24 = 0; shields24 <= inventory.shields24; shields24 += 1) {
    for (let shields8 = 0; shields8 <= inventory.shields8; shields8 += 1) {
      const count = shields24 + shields8;
      const durationMs = (shields24 * 24 + shields8 * 8) * HOUR;
      if (count === 0 && requiredMs > 0) continue;

      if (durationMs >= requiredMs) {
        const candidate = {
          counts: { shields24, shields8 },
          durationMs,
          count,
          excess: durationMs - requiredMs,
        };
        if (!bestComplete || compareComplete(candidate, bestComplete, strategy) < 0) bestComplete = candidate;
      } else {
        const candidate = { counts: { shields24, shields8 }, durationMs, count };
        if (
          !bestPartial
          || candidate.durationMs > bestPartial.durationMs
          || (candidate.durationMs === bestPartial.durationMs && candidate.count < bestPartial.count)
        ) bestPartial = candidate;
      }
    }
  }

  const selected = bestComplete ?? bestPartial ?? {
    counts: { shields24: 0, shields8: 0 },
    durationMs: 0,
    count: 0,
  };
  const { steps, coverageEnd } = buildSteps(start, selected.counts, phase);

  return {
    complete: Boolean(bestComplete) || requiredMs === 0,
    counts: selected.counts,
    durationMs: selected.durationMs,
    requiredMs,
    coverageEnd,
    steps,
  };
};

const chooseSplitPlan = (
  firstStart: Date,
  capitalStart: Date,
  restartAt: Date,
  raidEnd: Date,
  inventory: ShieldCounts,
  strategy: string,
): SplitPlan => {
  const beforeRequired = Math.max(0, capitalStart.getTime() - firstStart.getTime());
  const afterRequired = Math.max(0, raidEnd.getTime() - restartAt.getTime());
  let bestComplete: {
    before: ShieldCounts;
    after: ShieldCounts;
    count: number;
    excess: number;
  } | null = null;
  let bestPartial: {
    before: ShieldCounts;
    after: ShieldCounts;
    count: number;
    covered: number;
    excess: number;
  } | null = null;

  for (let before24 = 0; before24 <= inventory.shields24; before24 += 1) {
    for (let before8 = 0; before8 <= inventory.shields8; before8 += 1) {
      for (let after24 = 0; after24 <= inventory.shields24 - before24; after24 += 1) {
        for (let after8 = 0; after8 <= inventory.shields8 - before8; after8 += 1) {
          const beforeDuration = (before24 * 24 + before8 * 8) * HOUR;
          const afterDuration = (after24 * 24 + after8 * 8) * HOUR;
          const count = before24 + before8 + after24 + after8;
          const isComplete = beforeDuration >= beforeRequired && afterDuration >= afterRequired;
          const excess = Math.max(0, beforeDuration - beforeRequired) + Math.max(0, afterDuration - afterRequired);
          const candidate = {
            before: { shields24: before24, shields8: before8 },
            after: { shields24: after24, shields8: after8 },
            count,
            excess,
          };

          if (isComplete) {
            if (!bestComplete || compareComplete(candidate, bestComplete, strategy) < 0) bestComplete = candidate;
            continue;
          }

          const covered = Math.min(beforeDuration, beforeRequired) + Math.min(afterDuration, afterRequired);
          const partialCandidate = { ...candidate, covered };
          if (
            !bestPartial
            || partialCandidate.covered > bestPartial.covered
            || (
              partialCandidate.covered === bestPartial.covered
              && compareComplete(partialCandidate, bestPartial, strategy) < 0
            )
          ) bestPartial = partialCandidate;
        }
      }
    }
  }

  const selected = bestComplete ?? bestPartial ?? {
    before: { shields24: 0, shields8: 0 },
    after: { shields24: 0, shields8: 0 },
  };
  const beforeBuilt = buildSteps(firstStart, selected.before, "before-capital");
  const afterBuilt = buildSteps(restartAt, selected.after, "after-capital");
  const before: PhasePlan = {
    complete: beforeBuilt.coverageEnd >= capitalStart,
    counts: selected.before,
    durationMs: beforeBuilt.coverageEnd.getTime() - firstStart.getTime(),
    requiredMs: beforeRequired,
    coverageEnd: beforeBuilt.coverageEnd,
    steps: beforeBuilt.steps,
  };
  const after: PhasePlan = {
    complete: afterBuilt.coverageEnd >= raidEnd,
    counts: selected.after,
    durationMs: afterBuilt.coverageEnd.getTime() - restartAt.getTime(),
    requiredMs: afterRequired,
    coverageEnd: afterBuilt.coverageEnd,
    steps: afterBuilt.steps,
  };

  return {
    complete: before.complete && after.complete,
    before,
    after,
    steps: [...before.steps, ...after.steps],
  };
};

const escapeCalendarText = (value: string) => value
  .replaceAll("\\", "\\\\")
  .replaceAll("\n", "\\n")
  .replaceAll(",", "\\,")
  .replaceAll(";", "\\;");

const createCalendar = (
  raid: ShieldEvent,
  steps: ShieldStep[],
  capital: ShieldEvent | null,
  capitalMode: string,
) => {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const entries = steps.map((step, index) => {
    const end = new Date(step.at.getTime() + 15 * MINUTE);
    const phaseText = step.phase === "after-capital"
      ? "Schutz nach der Hauptstadteroberung erneuern."
      : "Geplanter Schildwechsel für den Raubzug.";
    return [
      "BEGIN:VEVENT",
      `UID:schildplan-${raid.date}-${index}@drachenhalle`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=Europe/Berlin:${toCalendarValue(step.at)}`,
      `DTEND;TZID=Europe/Berlin:${toCalendarValue(end)}`,
      `SUMMARY:${escapeCalendarText(`🛡️ ${step.hours}-Stunden-Schild setzen`)}`,
      `DESCRIPTION:${escapeCalendarText(`${phaseText} Bitte den aktuellen Schildstatus im Spiel prüfen.`)}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT10M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeCalendarText(`${step.hours}-Stunden-Schild in 10 Minuten setzen`)}`,
      "END:VALARM",
      "END:VEVENT",
    ];
  });

  if (capital && capitalMode !== "passive") {
    const capitalStart = parseEventDate(capital, "start");
    const noticeEnd = new Date(capitalStart.getTime() + 15 * MINUTE);
    entries.push([
      "BEGIN:VEVENT",
      `UID:schildplan-hauptstadt-${raid.date}@drachenhalle`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=Europe/Berlin:${toCalendarValue(capitalStart)}`,
      `DTEND;TZID=Europe/Berlin:${toCalendarValue(noticeEnd)}`,
      `SUMMARY:${escapeCalendarText("⚔️ Hauptstadteroberung: Schildstatus beachten")}`,
      `DESCRIPTION:${escapeCalendarText("Offensive Aktionen können den Schild beenden und 15 Minuten Battle Frenzy auslösen.")}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeCalendarText("Hauptstadteroberung beginnt – Schildstatus und Rolle prüfen")}`,
      "END:VALARM",
      "END:VEVENT",
    ]);
  }

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DIE Drachenhalle//Schildrechner//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-TIMEZONE:Europe/Berlin",
    ...entries.flat(),
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

  if (!form || !firstShieldInput || !result || !raidDate || !raidLink || !calculateButton) return;

  if (!raid) {
    raidDate.textContent = "Im veröffentlichten Kalender ist aktuell kein zukünftiger Raubzug eingetragen.";
    calculateButton.disabled = true;
    firstShieldInput.disabled = true;
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

  let currentCalendar = "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (formError) formError.hidden = true;

    const formData = new FormData(form);
    const inventory = {
      shields24: boundedCount(formData.get("shields24")),
      shields8: boundedCount(formData.get("shields8")),
    };
    const firstStart = new Date(String(formData.get("firstShield") ?? ""));
    const strategy = String(formData.get("strategy") ?? "fewest");
    const capitalMode = String(formData.get("capitalMode") ?? "passive");

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

    const startsLate = firstStart > raidStart;
    let steps: ShieldStep[] = [];
    let complete = false;
    let coverageEnd = firstStart;
    let missingMs = 0;
    let summary = "";
    let note = "";
    let kicker = "Schildbestand geprüft";
    let title = "Dein Schildplan";

    if (capital && capitalMode === "active" && firstStart < parseEventDate(capital, "start")) {
      const capitalStart = parseEventDate(capital, "start");
      const capitalEnd = parseEventDate(capital, "end");
      const restartAt = new Date(capitalEnd.getTime() + 15 * MINUTE);
      const split = chooseSplitPlan(firstStart, capitalStart, restartAt, raidEnd, inventory, strategy);
      steps = split.steps;
      complete = split.complete && !startsLate;
      coverageEnd = split.after.coverageEnd;
      missingMs = Math.max(0, split.before.requiredMs - split.before.durationMs)
        + Math.max(0, split.after.requiredMs - split.after.durationMs)
        + Math.max(0, firstStart.getTime() - raidStart.getTime());
      note = `Aktive Angriffe können dein laufendes Schild beenden. Der Plan behandelt ${formatDateTime(capitalStart)} bis ${formatDateTime(restartAt)} Uhr bewusst als Kampf- und Battle-Frenzy-Fenster und setzt den Schutz danach neu an.`;
      if (complete) {
        kicker = "Für Kampf und Schutz vorbereitet";
        title = "Dein Bestand passt";
        summary = "Du kannst den Raubzug vor und nach der aktiven Hauptstadteroberung mit deinem Bestand abdecken.";
      } else {
        kicker = "Schutzlücke erkannt";
        title = "Anthlan macht sich Sorgen";
        summary = `Für die Schutzphasen vor und nach dem Kampf fehlen dir ungefähr ${formatDuration(missingMs)} Abdeckung.`;
      }
    } else {
      const plan = choosePhasePlan(firstStart, raidEnd, inventory, strategy, "continuous");
      steps = plan.steps;
      coverageEnd = plan.coverageEnd;
      complete = plan.complete && !startsLate;
      missingMs = Math.max(0, raidEnd.getTime() - coverageEnd.getTime())
        + Math.max(0, firstStart.getTime() - raidStart.getTime());

      if (complete && capital && capitalMode === "unclear") {
        kicker = "Plan passt – Rolle noch offen";
        title = "Fast alles geklärt";
        summary = "Dein Bestand reicht für durchgehenden Schutz. Kläre vor Samstag noch, ob du bei der Hauptstadteroberung aktiv kämpfst.";
        note = "Bei aktiver Teilnahme wäre dieser durchgehende Plan nicht mehr gültig, weil offensive Aktionen den Schild beenden können.";
      } else if (complete) {
        kicker = "Gut vorbereitet";
        title = "Dein Schildplan passt";
        summary = `Dein ausgewählter Bestand schützt dich bis ${formatDateTime(coverageEnd)} Uhr und deckt damit den gesamten Raubzug ab.`;
        note = capital
          ? "Du hast angegeben, während der Hauptstadteroberung unter Schild zu bleiben. Offensive Aktionen würden diesen Plan verändern."
          : "Die Erinnerungen werden zehn Minuten vor jedem geplanten Schildwechsel ausgelöst.";
      } else {
        kicker = "Schutzlücke erkannt";
        title = "Anthlan macht sich Sorgen";
        summary = startsLate
          ? `Dein erster Schild beginnt nach dem Start des Raubzugs. Insgesamt bleiben ungefähr ${formatDuration(missingMs)} ungeschützt.`
          : `Mit deinem aktuellen Bestand fehlen ungefähr ${formatDuration(missingMs)} Schutz bis zum Ende des Raubzugs.`;
        note = "Ergänze deinen Bestand oder verschiebe den Start. Erst bei vollständiger Abdeckung kann ein verlässlicher Erinnerungskalender erstellt werden.";
      }
    }

    result.dataset.state = complete ? (capital && capitalMode === "unclear" ? "warning" : "success") : "danger";
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
      addFact(resultFacts, "Bestand", `${inventory.shields24} × 24h · ${inventory.shields8} × 8h`);
      addFact(resultFacts, complete ? "Abgedeckt bis" : "Plan reicht bis", formatDateTime(coverageEnd));
    }

    if (scheduleList) {
      scheduleList.replaceChildren();
      if (steps.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "Mit dem eingetragenen Bestand kann noch kein Schildwechsel geplant werden.";
        scheduleList.append(empty);
      } else {
        for (const step of steps) {
          const item = document.createElement("li");
          const time = document.createElement("time");
          const label = document.createElement("strong");
          const phase = document.createElement("span");
          time.dateTime = step.at.toISOString();
          time.textContent = `${formatDateTime(step.at)} Uhr`;
          label.textContent = `${step.hours}-Stunden-Schild setzen`;
          phase.textContent = step.phase === "after-capital"
            ? "Schutz nach Kampf und Battle Frenzy"
            : step.phase === "before-capital"
              ? "Schutz bis zur aktiven Kampfphase"
              : "Durchgehender Raubzugschutz";
          item.append(time, label, phase);
          scheduleList.append(item);
        }
      }
    }

    currentCalendar = complete ? createCalendar(raid, steps, capital, capitalMode) : "";
    if (downloadButton) downloadButton.disabled = !currentCalendar;
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
