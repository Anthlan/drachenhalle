export const BASE_VOUCHER_OUTCOMES = [
  { vouchers: 5, probability: 0.896 },
  { vouchers: 50, probability: 0.1025 },
  { vouchers: 250, probability: 0.0014 },
  { vouchers: 500, probability: 0.0001 },
] as const;

// Slot-Kombinationen und die Gutscheinseite der Luftabwurf-Truhe.
// Der separate Eventbereich "Versorgungsabwurf" mit Hilfsgütern ist nicht enthalten.
export const SLOT_VOUCHER_OUTCOMES = [
  { vouchers: 0, probability: 0.634 },
  { vouchers: 7, probability: 0.181 },
  { vouchers: 10, probability: 0.14333333333333334 },
  { vouchers: 40, probability: 0.015 },
  { vouchers: 50, probability: 0.017777777777777778 },
  { vouchers: 100, probability: 0.008888888888888889 },
] as const;

const moments = (outcomes: ReadonlyArray<{ vouchers: number; probability: number }>) => {
  const mean = outcomes.reduce((sum, outcome) => sum + outcome.vouchers * outcome.probability, 0);
  const secondMoment = outcomes.reduce(
    (sum, outcome) => sum + outcome.vouchers ** 2 * outcome.probability,
    0,
  );
  return { mean, variance: secondMoment - mean ** 2 };
};

const baseMoments = moments(BASE_VOUCHER_OUTCOMES);
const slotMoments = moments(SLOT_VOUCHER_OUTCOMES);

export const EVENT_VOUCHERS_PER_COIN = baseMoments.mean + slotMoments.mean;
export const EVENT_VARIANCE_PER_COIN = baseMoments.variance + slotMoments.variance;
export const EVENT_STANDARD_DEVIATION_PER_COIN = Math.sqrt(EVENT_VARIANCE_PER_COIN);
export const GUARANTEED_VOUCHERS_PER_COIN = 5;

export type EventPackage = {
  id: string;
  label: string;
  units: number;
  priceCents: number;
  perWindowLimit: number;
};

export type PackagePlan = {
  units: number;
  costCents: number;
  counts: Record<string, number>;
} | null;

export const COIN_PACKAGES: readonly EventPackage[] = [
  { id: "coin-2", label: "2 Münzen", units: 2, priceCents: 119, perWindowLimit: 1 },
  { id: "coin-4", label: "4 Münzen", units: 4, priceCents: 249, perWindowLimit: 1 },
  { id: "coin-5", label: "5 Münzen", units: 5, priceCents: 599, perWindowLimit: 1 },
  { id: "coin-10", label: "10 Münzen", units: 10, priceCents: 1199, perWindowLimit: 1 },
  { id: "coin-20", label: "20 Münzen", units: 20, priceCents: 2399, perWindowLimit: 1 },
  { id: "coin-50", label: "50 Münzen", units: 50, priceCents: 5999, perWindowLimit: 1 },
  { id: "coin-100", label: "100 Münzen", units: 100, priceCents: 11999, perWindowLimit: 20 },
] as const;

export const VOUCHER_PACKAGES: readonly EventPackage[] = [
  { id: "voucher-20", label: "20 Gutscheine", units: 20, priceCents: 249, perWindowLimit: 1 },
  { id: "voucher-40", label: "40 Gutscheine", units: 40, priceCents: 599, perWindowLimit: 1 },
  { id: "voucher-80", label: "80 Gutscheine", units: 80, priceCents: 1199, perWindowLimit: 1 },
  { id: "voucher-160", label: "160 Gutscheine", units: 160, priceCents: 2399, perWindowLimit: 1 },
  { id: "voucher-400", label: "400 Gutscheine", units: 400, priceCents: 5999, perWindowLimit: 1 },
  { id: "voucher-800", label: "800 Gutscheine", units: 800, priceCents: 11999, perWindowLimit: 1 },
] as const;

export const remainingPurchaseWindows = (days: number, hours: number) => {
  const totalHours = Math.max(0, days * 24 + hours);
  return totalHours === 0 ? 0 : Math.ceil(totalHours / 24);
};

export const milestoneVoucherBonus = (coins: number, enabled = true) => {
  if (!enabled) return 0;
  if (coins >= 500) return 400;
  if (coins >= 300) return 200;
  return 0;
};

export const casinoProjection = (coins: number, milestones = true, centralConfidence = 0.8) => {
  const safeCoins = Math.max(0, Math.floor(coins));
  const bonus = milestoneVoucherBonus(safeCoins, milestones);
  const expected = safeCoins * EVENT_VOUCHERS_PER_COIN + bonus;
  const standardDeviation = Math.sqrt(safeCoins * EVENT_VARIANCE_PER_COIN);
  const z = centralConfidence >= 0.95 ? 1.96 : centralConfidence >= 0.9 ? 1.645 : 1.282;
  const guaranteed = safeCoins * GUARANTEED_VOUCHERS_PER_COIN + bonus;
  return {
    expected,
    standardDeviation,
    guaranteed,
    low: Math.max(guaranteed, expected - z * standardDeviation),
    high: expected + z * standardDeviation,
    milestoneBonus: bonus,
  };
};

export const expectedVoucherGap = (
  targetVouchers: number,
  securedVouchers: number,
  availableCoins: number,
  milestones = true,
) => Math.max(
  0,
  Math.ceil(targetVouchers - securedVouchers - casinoProjection(availableCoins, milestones).expected),
);

const erf = (value: number) => {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
};

const normalCdf = (value: number) => 0.5 * (1 + erf(value / Math.sqrt(2)));

export const probabilityToReach = (neededVouchers: number, coins: number, milestones = true) => {
  if (neededVouchers <= 0) return 1;
  const projection = casinoProjection(coins, milestones);
  if (neededVouchers <= projection.guaranteed) return 1;
  if (coins <= 0 || projection.standardDeviation <= 0) return 0;
  const z = (neededVouchers - 0.5 - projection.expected) / projection.standardDeviation;
  return Math.max(0, Math.min(1, 1 - normalCdf(z)));
};

export const requiredCoinsForChance = (
  neededVouchers: number,
  chance: number,
  milestones = true,
  maxCoins = 10000,
) => {
  if (neededVouchers <= 0) return 0;
  for (let coins = 1; coins <= maxCoins; coins += 1) {
    if (probabilityToReach(neededVouchers, coins, milestones) >= chance) return coins;
  }
  return null;
};

export const optimizePackagePurchase = (
  packages: readonly EventPackage[],
  windows: number,
  requiredUnits: number,
): PackagePlan => {
  const need = Math.max(0, Math.ceil(requiredUnits));
  if (need === 0) return { units: 0, costCents: 0, counts: {} };
  const copies = packages.flatMap((pack) => (
    Array.from({ length: Math.max(0, windows) * pack.perWindowLimit }, () => pack)
  ));
  const maximum = copies.reduce((sum, pack) => sum + pack.units, 0);
  if (maximum < need) return null;

  const costs = new Array<number>(maximum + 1).fill(Number.POSITIVE_INFINITY);
  const plans = new Array<Record<string, number> | null>(maximum + 1).fill(null);
  costs[0] = 0;
  plans[0] = {};

  for (const pack of copies) {
    for (let units = maximum - pack.units; units >= 0; units -= 1) {
      if (!Number.isFinite(costs[units])) continue;
      const nextUnits = units + pack.units;
      const nextCost = costs[units] + pack.priceCents;
      if (nextCost >= costs[nextUnits]) continue;
      costs[nextUnits] = nextCost;
      plans[nextUnits] = {
        ...(plans[units] ?? {}),
        [pack.id]: ((plans[units] ?? {})[pack.id] ?? 0) + 1,
      };
    }
  }

  let bestUnits = -1;
  let bestCost = Number.POSITIVE_INFINITY;
  for (let units = need; units <= maximum; units += 1) {
    if (costs[units] < bestCost) {
      bestUnits = units;
      bestCost = costs[units];
    }
  }
  if (bestUnits < 0 || !plans[bestUnits]) return null;
  return { units: bestUnits, costCents: bestCost, counts: plans[bestUnits] ?? {} };
};

const wholeNumber = (value: FormDataEntryValue | null, fallback = 0) => {
  const parsed = Number(String(value ?? ""));
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
};

const formatInteger = (value: number) => Math.round(value).toLocaleString("de-DE");
const formatEuro = (cents: number) => (cents / 100).toLocaleString("de-DE", {
  style: "currency",
  currency: "EUR",
});
const formatPercent = (value: number) => `${Math.round(value * 100)} %`;

const describePlan = (plan: PackagePlan, packages: readonly EventPackage[]) => {
  if (!plan) return "Mit den verbleibenden Kaufperioden nicht erreichbar.";
  const parts = packages
    .map((pack) => ({ pack, count: plan.counts[pack.id] ?? 0 }))
    .filter(({ count }) => count > 0)
    .map(({ pack, count }) => `${count}× ${pack.label}`);
  return parts.length > 0 ? parts.join(" · ") : "Kein Nachkauf nötig.";
};

const setText = (root: ParentNode, selector: string, value: string) => {
  const element = root.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
};

const setCharacter = (root: HTMLElement, state: "navigator" | "concerned" | "success") => {
  root.querySelectorAll<HTMLImageElement>("[data-flight-character]").forEach((image) => {
    image.hidden = image.dataset.flightCharacter !== state;
  });
};

const STORAGE_KEY = "drachenhalle-flight-event-values-v1";

export const initializeFlightEventCalculator = () => {
  const root = document.querySelector<HTMLElement>("[data-flight-event-calculator]");
  const form = root?.querySelector<HTMLFormElement>("[data-flight-event-form]");
  const result = root?.querySelector<HTMLElement>("[data-flight-event-result]");
  const error = root?.querySelector<HTMLElement>("[data-flight-event-error]");
  const shareButton = document.querySelector<HTMLButtonElement>("[data-flight-share]");
  const saveButton = root?.querySelector<HTMLButtonElement>("[data-flight-save]");
  const clearButton = root?.querySelector<HTMLButtonElement>("[data-flight-clear]");
  const storageStatus = root?.querySelector<HTMLElement>("[data-flight-storage-status]");
  if (!root || !form || !result || !error) return;

  const fields = [
    "currentCoins", "currentVouchers", "targetVouchers", "remainingDays", "remainingHours",
    "remainingFreeVouchers", "confidence", "includeFree", "includeDiamonds", "includeMilestones",
  ];

  const applyValues = (values: Record<string, unknown>) => {
    fields.forEach((name) => {
      const field = form.elements.namedItem(name);
      const value = values[name];
      if (field instanceof HTMLInputElement && field.type === "checkbox") {
        if (typeof value === "boolean") field.checked = value;
      } else if ((field instanceof HTMLInputElement || field instanceof HTMLSelectElement) && typeof value === "string") {
        field.value = value;
      }
    });
  };

  const params = new URLSearchParams(window.location.search);
  if (params.size > 0) {
    const values: Record<string, unknown> = {};
    fields.forEach((name) => {
      if (!params.has(name)) return;
      const field = form.elements.namedItem(name);
      values[name] = field instanceof HTMLInputElement && field.type === "checkbox"
        ? params.get(name) === "1"
        : params.get(name) ?? "";
    });
    applyValues(values);
  } else {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        applyValues(JSON.parse(stored) as Record<string, unknown>);
        if (clearButton) clearButton.hidden = false;
        if (storageStatus) storageStatus.textContent = "Deine zuletzt gespeicherten Werte wurden geladen.";
      }
    } catch {
      if (storageStatus) storageStatus.textContent = "Gespeicherte Werte konnten nicht geladen werden.";
    }
  }

  const collectValues = () => {
    const values: Record<string, string | boolean> = {};
    fields.forEach((name) => {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement && field.type === "checkbox") values[name] = field.checked;
      else if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) values[name] = field.value;
    });
    return values;
  };

  saveButton?.addEventListener("click", () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collectValues()));
      if (clearButton) clearButton.hidden = false;
      if (storageStatus) storageStatus.textContent = "Eventstand auf diesem Gerät gespeichert.";
    } catch {
      if (storageStatus) storageStatus.textContent = "Die Werte konnten nicht gespeichert werden.";
    }
  });

  clearButton?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    clearButton.hidden = true;
    if (storageStatus) storageStatus.textContent = "Gespeicherte Werte gelöscht.";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.hidden = true;
    const data = new FormData(form);
    const currentCoins = wholeNumber(data.get("currentCoins"));
    const currentVouchers = wholeNumber(data.get("currentVouchers"));
    const targetVouchers = wholeNumber(data.get("targetVouchers"), 4000);
    const remainingDays = wholeNumber(data.get("remainingDays"));
    const remainingHours = Math.min(23, wholeNumber(data.get("remainingHours")));
    const remainingFreeVouchers = Math.min(99, wholeNumber(data.get("remainingFreeVouchers")));
    const confidence = Number(data.get("confidence") ?? 0.8);
    const includeFree = data.get("includeFree") === "yes";
    const includeDiamonds = data.get("includeDiamonds") === "yes";
    const includeMilestones = data.get("includeMilestones") === "yes";

    if (targetVouchers <= 0 || remainingDays > 30) {
      error.textContent = "Bitte prüfe Zielwert und Restlaufzeit.";
      error.hidden = false;
      return;
    }

    const windows = remainingPurchaseWindows(remainingDays, remainingHours);
    const futureCoins = includeFree ? windows : 0;
    const futureVouchers = remainingFreeVouchers;
    const diamondVouchers = includeDiamonds ? windows : 0;
    const availableCoins = currentCoins + futureCoins;
    const securedVouchers = currentVouchers + futureVouchers + diamondVouchers;
    const neededFromCasino = Math.max(0, targetVouchers - securedVouchers);
    const currentProjection = casinoProjection(availableCoins, includeMilestones, confidence);
    const currentTotalExpected = securedVouchers + currentProjection.expected;
    const currentProbability = probabilityToReach(neededFromCasino, availableCoins, includeMilestones);

    const meanCoinTarget = requiredCoinsForChance(neededFromCasino, 0.5, includeMilestones);
    const confidenceCoinTarget = requiredCoinsForChance(neededFromCasino, confidence, includeMilestones);
    const meanCoinPlan = meanCoinTarget === null
      ? null
      : optimizePackagePurchase(COIN_PACKAGES, windows, Math.max(0, meanCoinTarget - availableCoins));
    const confidenceCoinPlan = confidenceCoinTarget === null
      ? null
      : optimizePackagePurchase(COIN_PACKAGES, windows, Math.max(0, confidenceCoinTarget - availableCoins));

    const directGap = expectedVoucherGap(
      targetVouchers,
      securedVouchers,
      availableCoins,
      includeMilestones,
    );
    const directPlan = optimizePackagePurchase(VOUCHER_PACKAGES, windows, directGap);

    const plannedCasinoCoins = availableCoins + (confidenceCoinPlan?.units ?? 0);
    const plannedProjection = casinoProjection(plannedCasinoCoins, includeMilestones, confidence);
    const plannedProbability = probabilityToReach(neededFromCasino, plannedCasinoCoins, includeMilestones);

    setText(result, "[data-flight-result-kicker]", currentProbability >= confidence ? "Ziel bereits realistisch" : "Dein Kurs zum Ziel");
    setText(
      result,
      "[data-flight-result-title]",
      currentProbability >= confidence ? "Du liegst gut in der Luft" : "Noch Nachschub einplanen",
    );
    setText(
      result,
      "[data-flight-result-summary]",
      currentProbability >= confidence
        ? `Mit deinem Bestand und den eingeplanten Gratisquellen liegt die geschätzte Zielchance bei ${formatPercent(currentProbability)}.`
        : `Ohne Nachkauf werden etwa ${formatInteger(currentTotalExpected)} von ${formatInteger(targetVouchers)} Gutscheinen erwartet.`,
    );
    setCharacter(result, currentProbability >= confidence ? "success" : "concerned");
    result.dataset.state = currentProbability >= confidence ? "success" : "concerned";

    setText(result, "[data-flight-windows]", `${windows}`);
    setText(result, "[data-flight-free-coins]", `${futureCoins}`);
    setText(result, "[data-flight-free-vouchers]", `${futureVouchers + diamondVouchers}`);
    setText(result, "[data-flight-current-vouchers]", formatInteger(securedVouchers));
    setText(result, "[data-flight-coin-expected]", formatInteger(currentProjection.expected));
    setText(result, "[data-flight-current-expected]", formatInteger(currentTotalExpected));
    setText(result, "[data-flight-current-range]", `${formatInteger(securedVouchers + currentProjection.low)}–${formatInteger(securedVouchers + currentProjection.high)}`);
    setText(result, "[data-flight-current-chance]", formatPercent(currentProbability));
    setText(result, "[data-flight-direct-gap]", `${formatInteger(directGap)} Gutscheine`);

    const casinoRange = meanCoinPlan && confidenceCoinPlan
      ? `${formatEuro(meanCoinPlan.costCents)}–${formatEuro(confidenceCoinPlan.costCents)}`
      : meanCoinPlan
        ? `ab ${formatEuro(meanCoinPlan.costCents)}`
        : "nicht vollständig verfügbar";
    setText(result, "[data-flight-casino-cost]", casinoRange);
    setText(result, "[data-flight-casino-coins]", `${plannedCasinoCoins} Münzen insgesamt`);
    setText(
      result,
      "[data-flight-casino-outcome]",
      `${formatInteger(securedVouchers + plannedProjection.expected)} erwartet · ${formatInteger(securedVouchers + plannedProjection.low)}–${formatInteger(securedVouchers + plannedProjection.high)} im Korridor`,
    );
    setText(result, "[data-flight-casino-chance]", `Zielchance ca. ${formatPercent(plannedProbability)}`);
    setText(result, "[data-flight-casino-plan]", describePlan(confidenceCoinPlan, COIN_PACKAGES));

    setText(result, "[data-flight-direct-cost]", directPlan ? formatEuro(directPlan.costCents) : "nicht verfügbar");
    setText(
      result,
      "[data-flight-direct-outcome]",
      directPlan
        ? directGap > 0
          ? `${formatInteger(directGap)} Gutscheine fehlen nach dem erwartbaren Ertrag.`
          : "Dein erwartbarer Ertrag erreicht das Ziel bereits."
        : "Die erwartete Restlücke lässt sich innerhalb der verbleibenden Tageslimits nicht vollständig kaufen.",
    );
    setText(result, "[data-flight-direct-plan]", describePlan(directPlan, VOUCHER_PACKAGES));

    const recommendation = currentProbability >= confidence
      ? "Nutze zuerst deine vorhandenen und kostenlosen Münzen. Ein Echtgeldkauf ist für die gewählte Sicherheit aktuell nicht nötig."
      : directGap === 0
        ? "Der Erwartungswert reicht bereits für dein Ziel. Drehe zuerst deine vorhandenen Münzen und prüfe danach, ob überhaupt noch eine Restlücke besteht."
      : confidenceCoinPlan && (!directPlan || confidenceCoinPlan.costCents < directPlan.costCents)
        ? "Münzen bieten den günstigeren statistischen Kurs. Drehe sie zuerst und kaufe erst danach eine tatsächlich verbliebene Gutscheinlücke direkt."
        : directPlan
          ? "Für dieses Ziel ist der direkte Nachkauf der erwarteten Restlücke planbarer. Drehe vorhandene Münzen zuerst, denn die tatsächliche Lücke kann kleiner oder größer ausfallen."
          : "Mit den verbleibenden Kaufperioden ist das Ziel weder statistisch vorsichtig noch garantiert vollständig planbar.";
    setText(result, "[data-flight-recommendation]", recommendation);

    const query = new URLSearchParams();
    Object.entries(collectValues()).forEach(([key, value]) => query.set(key, typeof value === "boolean" ? (value ? "1" : "0") : value));
    if (shareButton) shareButton.dataset.shareUrl = `/drachenhalle/tools/eventrechner/?${query.toString()}`;
  });

  form.requestSubmit();
};
