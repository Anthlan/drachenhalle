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

export const GUARANTEED_VOUCHERS_PER_COIN = 5;
export const THEORETICAL_EVENT_VOUCHERS_PER_COIN = baseMoments.mean + slotMoments.mean;
export const THEORETICAL_EVENT_VARIANCE_PER_COIN = baseMoments.variance + slotMoments.variance;
// Kaufpläne verwenden ausschließlich den garantierten Ertrag. Der aus seltenen
// Treffern berechnete Langzeitmittelwert bleibt nur als Information sichtbar.
export const EVENT_VOUCHERS_PER_COIN = GUARANTEED_VOUCHERS_PER_COIN;
export const EVENT_VARIANCE_PER_COIN = 0;
export const EVENT_STANDARD_DEVIATION_PER_COIN = 0;
export type DrawMultiplier = 1 | 5;

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

export type HybridStrategy = "casino-first" | "voucher-first" | "cost-optimized";

export type HybridPlan = {
  strategy: HybridStrategy;
  coinPlan: Exclude<PackagePlan, null>;
  voucherPlan: Exclude<PackagePlan, null>;
  totalCostCents: number;
  totalCoins: number;
  directVouchers: number;
  expectedTotal: number;
  lowTotal: number;
  highTotal: number;
  probability: number;
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
  { id: "voucher-800", label: "800 Gutscheine", units: 800, priceCents: 11999, perWindowLimit: 10 },
] as const;

export const F2P_SHOP_PRIORITIES = [
  {
    id: "ur-splitter",
    name: "UR-Omni-Heldensplitter",
    unit: "10 Splitter",
    price: 60,
    max: 1,
    perWindow: true,
    score: 98,
    reason: "Sehr selten, universell einsetzbar und täglich stark limitiert.",
  },
  {
    id: "deluxe-truhe",
    name: "Optionale Deluxe-Truhe",
    unit: "1 Truhe",
    price: 100,
    max: 1,
    perWindow: true,
    score: 94,
    reason: "Hohe Auswahlfreiheit für einen kleinen täglichen Gutscheinbetrag.",
  },
  {
    id: "ur-truhe",
    name: "UR-Auswahltruhe",
    unit: "1 Truhe",
    price: 300,
    max: 5,
    perWindow: false,
    score: 91,
    reason: "Gezielter UR-Fortschritt ist für kostenlose Spieler besonders wertvoll.",
  },
  {
    id: "bauplan-rot",
    name: "Roter Bauplan",
    unit: "1 Bauplan",
    price: 300,
    max: 10,
    perWindow: false,
    score: 87,
    reason: "Engpassmaterial mit dauerhaftem Ausbauwert.",
  },
  {
    id: "puzzleteil",
    name: "Goldenes Puzzleteil",
    unit: "1 Teil",
    price: 16,
    max: 300,
    perWindow: false,
    score: 82,
    reason: "Guter Lückenfüller: günstig, dauerhaft nützlich und fein dosierbar.",
  },
  {
    id: "gebaeudeteil-c",
    name: "Gebäudeteil C",
    unit: "1 Teil",
    price: 40,
    max: 80,
    perWindow: false,
    score: 76,
    reason: "Solider Ausbaufortschritt, wenn die seltenen Käufe bereits gedeckt sind.",
  },
] as const;

export const F2P_SPEED_PRIORITIES = [
  {
    id: "beschleuniger-3h",
    name: "3-Stunden-Beschleuniger",
    unit: "1 Beschleuniger",
    price: 16,
    max: 200,
    perWindow: false,
    score: 100,
    reason: "Der klarste direkte Zeitgewinn: Jeder Kauf überspringt drei Stunden Wartezeit.",
  },
  {
    id: "flugmaterial",
    name: "Flugmaterial",
    unit: "10.000 Material",
    price: 16,
    max: 100,
    perWindow: false,
    score: 88,
    reason: "Sofort nutzbares Material, wenn der Ausbau sonst auf Ressourcen wartet.",
  },
  {
    id: "versorgungskisten",
    name: "Versorgungskisten",
    unit: "10 Kisten",
    price: 40,
    max: 1000,
    perWindow: false,
    score: 80,
    reason: "Flexible Soforthilfe, sobald Beschleuniger und Flugmaterial gedeckt sind.",
  },
  {
    id: "fortschrittskiste-a",
    name: "Fortschrittskiste A",
    unit: "1 Truhe",
    price: 8,
    max: 1000,
    perWindow: false,
    score: 74,
    reason: "Günstiger Lückenfüller für unmittelbar einsetzbare Fortschrittsressourcen.",
  },
] as const;

export const F2P_HERO_PRIORITIES = [
  {
    id: "ur-splitter",
    name: "UR-Omni-Heldensplitter",
    unit: "10 Splitter",
    price: 60,
    max: 1,
    perWindow: true,
    score: 100,
    reason: "Universell einsetzbare UR-Splitter mit strengem Tageslimit zuerst sichern.",
  },
  {
    id: "deluxe-truhe",
    name: "Optionale Deluxe-Truhe",
    unit: "1 Truhe",
    price: 100,
    max: 1,
    perWindow: true,
    score: 95,
    reason: "Die Auswahlmöglichkeit macht die tägliche Truhe planbarer als Zufallsbelohnungen.",
  },
  {
    id: "ur-truhe",
    name: "UR-Auswahltruhe",
    unit: "1 Truhe",
    price: 300,
    max: 5,
    perWindow: false,
    score: 92,
    reason: "Gezielte UR-Auswahl für den Helden, den du tatsächlich weiterentwickelst.",
  },
  {
    id: "event-zufallstruhe",
    name: "Event-Zufallstruhe",
    unit: "1 Truhe",
    price: 100,
    max: 30,
    perWindow: false,
    score: 70,
    reason: "Ergänzung mit Zufallsfaktor, wenn die gezielten Auswahlkäufe ausgeschöpft sind.",
  },
  {
    id: "puzzleteil",
    name: "Goldenes Puzzleteil",
    unit: "1 Teil",
    price: 16,
    max: 300,
    perWindow: false,
    score: 66,
    reason: "Günstiger Lückenfüller für kleine Gutscheinreste.",
  },
] as const;

export const F2P_CONSTRUCTION_PRIORITIES = [
  {
    id: "bauplan-rot",
    name: "Roter Bauplan",
    unit: "1 Bauplan",
    price: 300,
    max: 10,
    perWindow: false,
    score: 100,
    reason: "Seltenes Engpassmaterial für hochwertige Ausbauvorhaben.",
  },
  {
    id: "bauplan-gold",
    name: "Goldener Bauplan",
    unit: "1 Bauplan",
    price: 60,
    max: 100,
    perWindow: false,
    score: 90,
    reason: "Breit nutzbarer Bauplanvorrat für die nächsten Ausbauschritte.",
  },
  {
    id: "gebaeudeteil-c",
    name: "Gebäudeteil C",
    unit: "1 Teil",
    price: 40,
    max: 80,
    perWindow: false,
    score: 84,
    reason: "Der günstigste Einstieg in die drei angebotenen Gebäudeteile.",
  },
  {
    id: "gebaeudeteil-a",
    name: "Gebäudeteil A",
    unit: "1 Teil",
    price: 100,
    max: 80,
    perWindow: false,
    score: 80,
    reason: "Gezielter Gebäudefortschritt, sobald Baupläne ausreichend vorhanden sind.",
  },
  {
    id: "gebaeudeteil-b",
    name: "Gebäudeteil B",
    unit: "1 Teil",
    price: 100,
    max: 80,
    perWindow: false,
    score: 80,
    reason: "Alternative für Ausbauten, bei denen speziell Teil B fehlt.",
  },
  {
    id: "flugmaterial",
    name: "Flugmaterial",
    unit: "10.000 Material",
    price: 16,
    max: 100,
    perWindow: false,
    score: 74,
    reason: "Preiswerter Resteverwerter für den unmittelbaren Flugzeugausbau.",
  },
] as const;

export type F2PPreference = "lasting" | "speed" | "hero" | "construction";

export type F2PRecommendation = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  cost: number;
  score: number;
  reason: string;
};

export const recommendF2PShopping = (
  voucherBudget: number,
  windows: number,
  preference: F2PPreference = "lasting",
) => {
  let remaining = Math.max(0, Math.floor(voucherBudget));
  const recommendations: F2PRecommendation[] = [];
  const priorities = preference === "speed"
    ? F2P_SPEED_PRIORITIES
    : preference === "hero"
      ? F2P_HERO_PRIORITIES
      : preference === "construction"
        ? F2P_CONSTRUCTION_PRIORITIES
        : F2P_SHOP_PRIORITIES;

  for (const item of priorities) {
    const maximum = item.perWindow ? item.max * Math.max(0, windows) : item.max;
    const quantity = Math.min(maximum, Math.floor(remaining / item.price));
    if (quantity <= 0) continue;
    const cost = quantity * item.price;
    recommendations.push({
      id: item.id,
      name: item.name,
      unit: item.unit,
      quantity,
      cost,
      score: item.score,
      reason: item.reason,
    });
    remaining -= cost;
  }

  return {
    budget: Math.max(0, Math.floor(voucherBudget)),
    spent: Math.max(0, Math.floor(voucherBudget)) - remaining,
    remaining,
    recommendations,
  };
};

export const remainingPurchaseWindows = (days: number, hours: number) => {
  const totalHours = Math.max(0, days * 24 + hours);
  return totalHours === 0 ? 0 : Math.ceil(totalHours / 24);
};

export const casinoProjection = (
  coins: number,
  centralConfidence = 0.8,
  drawMultiplier: DrawMultiplier = 1,
) => {
  const safeCoins = Math.max(0, Math.floor(coins));
  const expected = safeCoins * EVENT_VOUCHERS_PER_COIN;
  // Der Modus beeinflusst das tatsächliche Risiko, aber nicht die sichere
  // Kaufplanung: Hier zählt bewusst nur die garantierte Mindestbelohnung.
  void drawMultiplier;
  const standardDeviation = 0;
  const z = centralConfidence >= 0.95 ? 1.96 : centralConfidence >= 0.9 ? 1.645 : 1.282;
  const guaranteed = safeCoins * GUARANTEED_VOUCHERS_PER_COIN;
  return {
    expected,
    standardDeviation,
    guaranteed,
    low: Math.max(guaranteed, expected - z * standardDeviation),
    high: expected + z * standardDeviation,
  };
};

export const expectedVoucherGap = (
  targetVouchers: number,
  securedVouchers: number,
  availableCoins: number,
  drawMultiplier: DrawMultiplier = 1,
) => Math.max(
  0,
  Math.ceil(targetVouchers - securedVouchers - casinoProjection(availableCoins, 0.8, drawMultiplier).expected),
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

export const probabilityToReach = (
  neededVouchers: number,
  coins: number,
  drawMultiplier: DrawMultiplier = 1,
) => {
  if (neededVouchers <= 0) return 1;
  const projection = casinoProjection(coins, 0.8, drawMultiplier);
  if (neededVouchers <= projection.guaranteed) return 1;
  if (coins <= 0 || projection.standardDeviation <= 0) return 0;
  const z = (neededVouchers - 0.5 - projection.expected) / projection.standardDeviation;
  return Math.max(0, Math.min(1, 1 - normalCdf(z)));
};

export const requiredCoinsForChance = (
  neededVouchers: number,
  chance: number,
  maxCoins = 10000,
  drawMultiplier: DrawMultiplier = 1,
) => {
  if (neededVouchers <= 0) return 0;
  for (let coins = 1; coins <= maxCoins; coins += 1) {
    if (probabilityToReach(neededVouchers, coins, drawMultiplier) >= chance) return coins;
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

const buildExactPackagePlans = (
  packages: readonly EventPackage[],
  windows: number,
) => {
  const copies = packages.flatMap((pack) => (
    Array.from({ length: Math.max(0, windows) * pack.perWindowLimit }, () => pack)
  ));
  const maximum = copies.reduce((sum, pack) => sum + pack.units, 0);
  const costs = new Array<number>(maximum + 1).fill(Number.POSITIVE_INFINITY);
  const counts = new Array<Record<string, number> | null>(maximum + 1).fill(null);
  costs[0] = 0;
  counts[0] = {};

  for (const pack of copies) {
    for (let units = maximum - pack.units; units >= 0; units -= 1) {
      if (!Number.isFinite(costs[units])) continue;
      const nextUnits = units + pack.units;
      const nextCost = costs[units] + pack.priceCents;
      if (nextCost >= costs[nextUnits]) continue;
      costs[nextUnits] = nextCost;
      counts[nextUnits] = {
        ...(counts[units] ?? {}),
        [pack.id]: ((counts[units] ?? {})[pack.id] ?? 0) + 1,
      };
    }
  }

  return { maximum, costs, counts };
};

type PackageTable = ReturnType<typeof buildExactPackagePlans>;

const bestPlanAtLeast = (table: PackageTable, requiredUnits: number): Exclude<PackagePlan, null> | null => {
  const need = Math.max(0, Math.ceil(requiredUnits));
  let bestUnits = -1;
  let bestCost = Number.POSITIVE_INFINITY;
  for (let units = need; units <= table.maximum; units += 1) {
    if (table.costs[units] < bestCost) {
      bestUnits = units;
      bestCost = table.costs[units];
    }
  }
  if (bestUnits < 0 || !table.counts[bestUnits]) return null;
  return { units: bestUnits, costCents: bestCost, counts: table.counts[bestUnits] ?? {} };
};

const reliableCasinoYield = (coins: number, chance: number, drawMultiplier: DrawMultiplier) => {
  if (coins <= 0) return 0;
  const projection = casinoProjection(coins, 0.8, drawMultiplier);
  let low = 0;
  let high = Math.ceil(projection.high + projection.standardDeviation * 4 + 500);
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (probabilityToReach(middle, coins, drawMultiplier) >= chance) low = middle;
    else high = middle - 1;
  }
  return low;
};

const completeHybridPlan = (
  strategy: HybridStrategy,
  coinPlan: Exclude<PackagePlan, null>,
  voucherPlan: Exclude<PackagePlan, null>,
  availableCoins: number,
  securedVouchers: number,
  targetVouchers: number,
  confidence: number,
  drawMultiplier: DrawMultiplier,
): Exclude<HybridPlan, null> => {
  const totalCoins = availableCoins + coinPlan.units;
  const directVouchers = voucherPlan.units;
  const projection = casinoProjection(totalCoins, confidence, drawMultiplier);
  const neededFromCasino = Math.max(0, targetVouchers - securedVouchers - directVouchers);
  return {
    strategy,
    coinPlan,
    voucherPlan,
    totalCostCents: coinPlan.costCents + voucherPlan.costCents,
    totalCoins,
    directVouchers,
    expectedTotal: securedVouchers + directVouchers + projection.expected,
    lowTotal: securedVouchers + directVouchers + projection.low,
    highTotal: securedVouchers + directVouchers + projection.high,
    probability: probabilityToReach(neededFromCasino, totalCoins, drawMultiplier),
  };
};

export const optimizeHybridPurchase = ({
  strategy,
  windows,
  targetVouchers,
  securedVouchers,
  availableCoins,
  confidence,
  drawMultiplier = 1,
}: {
  strategy: HybridStrategy;
  windows: number;
  targetVouchers: number;
  securedVouchers: number;
  availableCoins: number;
  confidence: number;
  drawMultiplier?: DrawMultiplier;
}): HybridPlan => {
  const coinTable = buildExactPackagePlans(COIN_PACKAGES, windows);
  const voucherTable = buildExactPackagePlans(VOUCHER_PACKAGES, windows);
  const emptyPlan = { units: 0, costCents: 0, counts: {} };
  const totalGap = Math.max(0, targetVouchers - securedVouchers);
  const planCoinsForNeed = (neededFromCasino: number) => {
    const requiredTotal = requiredCoinsForChance(
      Math.max(0, neededFromCasino),
      confidence,
      availableCoins + coinTable.maximum,
      drawMultiplier,
    );
    if (requiredTotal === null) return null;
    return bestPlanAtLeast(coinTable, Math.max(0, requiredTotal - availableCoins));
  };

  if (strategy === "casino-first") {
    const casinoOnlyPlan = planCoinsForNeed(totalGap);
    const coinPlan = casinoOnlyPlan ?? bestPlanAtLeast(coinTable, coinTable.maximum);
    if (!coinPlan) return null;
    const directNeed = casinoOnlyPlan
      ? 0
      : Math.max(0, totalGap - reliableCasinoYield(availableCoins + coinPlan.units, confidence, drawMultiplier));
    const voucherPlan = bestPlanAtLeast(voucherTable, directNeed);
    if (!voucherPlan) return null;
    return completeHybridPlan(
      strategy,
      coinPlan,
      voucherPlan,
      availableCoins,
      securedVouchers,
      targetVouchers,
      confidence,
      drawMultiplier,
    );
  }

  if (strategy === "voucher-first") {
    const directNeed = Math.min(totalGap, voucherTable.maximum);
    const voucherPlan = bestPlanAtLeast(voucherTable, directNeed);
    if (!voucherPlan) return null;
    const coinPlan = planCoinsForNeed(Math.max(0, totalGap - voucherPlan.units));
    if (!coinPlan) return null;
    return completeHybridPlan(
      strategy,
      coinPlan,
      voucherPlan,
      availableCoins,
      securedVouchers,
      targetVouchers,
      confidence,
      drawMultiplier,
    );
  }

  let best: Exclude<HybridPlan, null> | null = null;
  for (let directUnits = 0; directUnits <= voucherTable.maximum; directUnits += 1) {
    const counts = voucherTable.counts[directUnits];
    if (!counts || !Number.isFinite(voucherTable.costs[directUnits])) continue;
    const voucherPlan = {
      units: directUnits,
      costCents: voucherTable.costs[directUnits],
      counts,
    };
    const coinPlan = planCoinsForNeed(Math.max(0, totalGap - directUnits));
    if (!coinPlan) continue;
    const candidate = completeHybridPlan(
      strategy,
      coinPlan,
      voucherPlan,
      availableCoins,
      securedVouchers,
      targetVouchers,
      confidence,
      drawMultiplier,
    );
    if (
      !best
      || candidate.totalCostCents < best.totalCostCents
      || (
        candidate.totalCostCents === best.totalCostCents
        && candidate.expectedTotal < best.expectedTotal
      )
    ) best = candidate;
  }
  return best ?? (totalGap === 0
    ? completeHybridPlan(strategy, emptyPlan, emptyPlan, availableCoins, securedVouchers, targetVouchers, confidence, drawMultiplier)
    : null);
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

const renderF2PPlan = (
  root: HTMLElement,
  plan: ReturnType<typeof recommendF2PShopping>,
) => {
  const list = root.querySelector<HTMLOListElement>("[data-flight-f2p-list]");
  if (!list) return;
  list.replaceChildren();

  if (plan.recommendations.length === 0) {
    const empty = document.createElement("li");
    empty.className = "flight-f2p-empty";
    empty.textContent = "Noch kein sinnvoller Kauf innerhalb des vorsichtigen Gutscheinrahmens. Gutscheine zunächst aufheben.";
    list.append(empty);
    return;
  }

  plan.recommendations.forEach((item, index) => {
    const row = document.createElement("li");
    const image = document.createElement("img");
    image.src = `/drachenhalle/brand/event-shop/items/${item.id}.webp`;
    image.alt = "";
    image.width = 240;
    image.height = 240;
    image.loading = "lazy";

    const copy = document.createElement("div");
    const heading = document.createElement("p");
    const rank = document.createElement("span");
    rank.textContent = String(index + 1).padStart(2, "0");
    const title = document.createElement("strong");
    title.textContent = item.name;
    heading.append(rank, title);

    const amount = document.createElement("b");
    amount.textContent = `${item.quantity.toLocaleString("de-DE")}× ${item.unit} · ${item.cost.toLocaleString("de-DE")} Gutscheine`;
    const reason = document.createElement("small");
    reason.textContent = item.reason;
    copy.append(heading, amount, reason);

    const score = document.createElement("em");
    score.textContent = `${item.score}/100`;
    score.title = "Gewichteter Nutzwert";
    row.append(image, copy, score);
    list.append(row);
  });
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

  const f2pPreferenceInputs = Array.from(
    root.querySelectorAll<HTMLInputElement>("[data-flight-f2p-preference]"),
  );
  let latestF2PBudget = 0;
  let latestF2PWindows = 0;

  const currentF2PPreference = (): F2PPreference => {
    const value = f2pPreferenceInputs.find((input) => input.checked)?.value;
    return value === "speed" || value === "hero" || value === "construction" ? value : "lasting";
  };

  const renderF2PRecommendation = () => {
    const preference = currentF2PPreference();
    const plan = recommendF2PShopping(latestF2PBudget, latestF2PWindows, preference);
    setText(result, "[data-flight-f2p-budget]", `${formatInteger(plan.budget)} Gutscheine`);
    setText(result, "[data-flight-f2p-spent]", `${formatInteger(plan.spent)} verplant`);
    setText(result, "[data-flight-f2p-remaining]", `${formatInteger(plan.remaining)} übrig`);

    const method = result.querySelector<HTMLElement>("[data-flight-f2p-method]");
    if (method) {
      const labels = preference === "speed"
        ? ["60 % direkter Zeitgewinn", "25 % sofort nutzbar", "15 % Preis-Leistung"]
        : preference === "hero"
          ? ["50 % gezielte Auswahl", "35 % Seltenheit & Limit", "15 % Preis-Leistung"]
          : preference === "construction"
            ? ["50 % Ausbau-Engpass", "30 % langfristiger Bedarf", "20 % Preis-Leistung"]
            : ["45 % Seltenheit & Limit", "35 % dauerhafter Fortschritt", "20 % Preis-Leistung"];
      method.replaceChildren(...labels.map((label) => {
        const chip = document.createElement("span");
        chip.textContent = label;
        return chip;
      }));
    }

    renderF2PPlan(result, plan);
  };

  f2pPreferenceInputs.forEach((input) => {
    input.addEventListener("change", renderF2PRecommendation);
  });

  const fields = [
    "currentCoins", "currentVouchers", "targetVouchers", "remainingDays", "remainingHours",
    "remainingFreeVouchers", "confidence", "purchaseStrategy", "includeFree", "includeDiamonds",
  ];

  const applyValues = (values: Record<string, unknown>) => {
    fields.forEach((name) => {
      const field = form.elements.namedItem(name);
      const value = values[name];
      if (field instanceof RadioNodeList && typeof value === "string") {
        field.value = value;
      } else if (field instanceof HTMLInputElement && field.type === "checkbox") {
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
      if (field instanceof RadioNodeList) values[name] = field.value;
      else if (field instanceof HTMLInputElement && field.type === "checkbox") values[name] = field.checked;
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
    const drawMultiplier: DrawMultiplier = data.get("drawMultiplier") === "5" ? 5 : 1;
    const purchaseStrategyValue = String(data.get("purchaseStrategy") ?? "cost-optimized");
    const purchaseStrategy: HybridStrategy = purchaseStrategyValue === "casino-first"
      || purchaseStrategyValue === "voucher-first"
      ? purchaseStrategyValue
      : "cost-optimized";
    const includeFree = data.get("includeFree") === "yes";
    const includeDiamonds = data.get("includeDiamonds") === "yes";

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
    const currentProjection = casinoProjection(availableCoins, confidence, drawMultiplier);
    const currentTotalExpected = securedVouchers + currentProjection.expected;
    const currentProbability = probabilityToReach(neededFromCasino, availableCoins, drawMultiplier);

    const meanCoinTarget = requiredCoinsForChance(neededFromCasino, 0.5, 10000, drawMultiplier);
    const confidenceCoinTarget = requiredCoinsForChance(neededFromCasino, confidence, 10000, drawMultiplier);
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
      drawMultiplier,
    );
    const directPlan = optimizePackagePurchase(VOUCHER_PACKAGES, windows, directGap);
    const hybridPlan = optimizeHybridPurchase({
      strategy: purchaseStrategy,
      windows,
      targetVouchers,
      securedVouchers,
      availableCoins,
      confidence,
      drawMultiplier,
    });

    const plannedCasinoCoins = availableCoins + (confidenceCoinPlan?.units ?? 0);
    const plannedProjection = casinoProjection(plannedCasinoCoins, confidence, drawMultiplier);
    const plannedProbability = probabilityToReach(neededFromCasino, plannedCasinoCoins, drawMultiplier);

    setText(result, "[data-flight-result-kicker]", currentProbability >= confidence ? "Ziel sicher gedeckt" : "Dein sicherer Kurs zum Ziel");
    setText(
      result,
      "[data-flight-result-title]",
      currentProbability >= confidence ? "Der Mindestwert reicht aus" : "Noch Nachschub einplanen",
    );
    setText(
      result,
      "[data-flight-result-summary]",
      currentProbability >= confidence
        ? "Dein Bestand und der garantierte Münzertrag decken das Ziel vollständig."
        : `Ohne Nachkauf sind ${formatInteger(currentTotalExpected)} von ${formatInteger(targetVouchers)} Gutscheinen sicher eingeplant.`,
    );
    setCharacter(result, currentProbability >= confidence ? "success" : "concerned");
    result.dataset.state = currentProbability >= confidence ? "success" : "concerned";

    setText(result, "[data-flight-windows]", `${windows}`);
    setText(result, "[data-flight-free-coins]", `${futureCoins}`);
    setText(result, "[data-flight-free-vouchers]", `${futureVouchers + diamondVouchers}`);
    setText(result, "[data-flight-current-vouchers]", formatInteger(securedVouchers));
    setText(result, "[data-flight-coin-expected]", formatInteger(currentProjection.expected));
    setText(result, "[data-flight-current-expected]", formatInteger(currentTotalExpected));
    setText(result, "[data-flight-current-range]", formatInteger(securedVouchers + currentProjection.low));
    setText(result, "[data-flight-current-chance]", currentProbability >= confidence ? "Ja" : "Nein");
    setText(result, "[data-flight-direct-gap]", `${formatInteger(directGap)} Gutscheine`);

    latestF2PBudget = Math.floor(securedVouchers + currentProjection.low);
    latestF2PWindows = windows;
    renderF2PRecommendation();

    const casinoRange = meanCoinPlan && confidenceCoinPlan
      ? meanCoinPlan.costCents === confidenceCoinPlan.costCents
        ? formatEuro(confidenceCoinPlan.costCents)
        : `${formatEuro(meanCoinPlan.costCents)}–${formatEuro(confidenceCoinPlan.costCents)}`
      : meanCoinPlan
        ? `ab ${formatEuro(meanCoinPlan.costCents)}`
        : "nicht vollständig verfügbar";
    setText(result, "[data-flight-casino-cost]", casinoRange);
    setText(result, "[data-flight-casino-coins]", `${plannedCasinoCoins} Münzen insgesamt`);
    setText(
      result,
      "[data-flight-casino-outcome]",
      `${formatInteger(securedVouchers + plannedProjection.expected)} Gutscheine sicher eingeplant`,
    );
    setText(result, "[data-flight-casino-chance]", plannedProbability >= confidence ? "Ziel sicher gedeckt" : "Ziel nicht sicher gedeckt");
    setText(result, "[data-flight-casino-plan]", describePlan(confidenceCoinPlan, COIN_PACKAGES));

    setText(result, "[data-flight-direct-cost]", directPlan ? formatEuro(directPlan.costCents) : "nicht verfügbar");
    setText(
      result,
      "[data-flight-direct-outcome]",
      directPlan
        ? directGap > 0
          ? `${formatInteger(directGap)} Gutscheine fehlen nach dem garantierten Ertrag.`
          : "Der garantierte Ertrag erreicht das Ziel bereits."
        : "Die sichere Restlücke lässt sich innerhalb der verbleibenden Tageslimits nicht vollständig kaufen.",
    );
    setText(result, "[data-flight-direct-plan]", describePlan(directPlan, VOUCHER_PACKAGES));

    const hybridLabels: Record<HybridStrategy, string> = {
      "casino-first": "Erst Casino, dann Gutscheine",
      "voucher-first": "Erst Gutscheine, dann Casino",
      "cost-optimized": "Geldoptimierte Kombination",
    };
    setText(result, "[data-flight-hybrid-kicker]", hybridLabels[purchaseStrategy]);
    setText(
      result,
      "[data-flight-hybrid-cost]",
      hybridPlan ? formatEuro(hybridPlan.totalCostCents) : "nicht verfügbar",
    );
    setText(
      result,
      "[data-flight-hybrid-outcome]",
      hybridPlan
        ? `${formatInteger(hybridPlan.expectedTotal)} Gutscheine sicher eingeplant`
        : "Das Ziel lässt sich mit den verbleibenden Münz- und Gutscheinlimits nicht vollständig planen.",
    );
    setText(
      result,
      "[data-flight-hybrid-coins]",
      hybridPlan
        ? `${hybridPlan.coinPlan.units.toLocaleString("de-DE")} Münzen nachkaufen`
        : "Münzlimit ausgeschöpft",
    );
    setText(
      result,
      "[data-flight-hybrid-vouchers]",
      hybridPlan
        ? `${hybridPlan.directVouchers.toLocaleString("de-DE")} Gutscheine direkt`
        : "Gutscheinlimit ausgeschöpft",
    );

    const coinStep = hybridPlan
      ? hybridPlan.coinPlan.units > 0
        ? `Casino: ${describePlan(hybridPlan.coinPlan, COIN_PACKAGES)}`
        : "Casino: vorhandene und kostenlose Münzen einsetzen"
      : "Casino-Anteil nicht verfügbar";
    const voucherStep = hybridPlan
      ? hybridPlan.voucherPlan.units > 0
        ? `Gutscheine: ${describePlan(hybridPlan.voucherPlan, VOUCHER_PACKAGES)}`
        : purchaseStrategy === "casino-first"
          ? "Gutscheine: nach dem Drehen nur eine tatsächliche Restlücke direkt schließen"
          : "Gutscheine: kein Direktkauf eingeplant"
      : "Gutschein-Anteil nicht verfügbar";
    const firstHybridStep = purchaseStrategy === "voucher-first" ? voucherStep : coinStep;
    const secondHybridStep = purchaseStrategy === "voucher-first" ? coinStep : voucherStep;
    setText(result, "[data-flight-hybrid-step-one]", firstHybridStep);
    setText(result, "[data-flight-hybrid-step-two]", secondHybridStep);

    const recommendation = currentProbability >= confidence
      ? "Nutze zuerst deine vorhandenen und kostenlosen Münzen. Ein Echtgeldkauf ist für die gewählte Sicherheit aktuell nicht nötig."
      : hybridPlan && hybridPlan.coinPlan.units > 0 && hybridPlan.voucherPlan.units > 0
        ? `${hybridLabels[purchaseStrategy]}: Der Kombi-Plan erweitert die einzeln begrenzten Wege und erreicht dein Ziel mit ${formatEuro(hybridPlan.totalCostCents)} geplanter Kaufsumme.`
      : directGap === 0
        ? "Der garantierte Mindestwert reicht bereits für dein Ziel. Ziehe vorhandene Münzen einzeln und prüfe danach den tatsächlichen Überschuss."
      : confidenceCoinPlan && (!directPlan || confidenceCoinPlan.costCents < directPlan.costCents)
        ? "Münzen bieten selbst mit nur 5 garantierten Gutscheinen den günstigeren Kurs. Ziehe einzeln und kaufe erst danach eine tatsächlich verbliebene Gutscheinlücke direkt."
        : directPlan
          ? "Für dieses Ziel ist der direkte Nachkauf der sicheren Restlücke günstiger. Vorhandene Münzen können die tatsächliche Lücke nur noch verkleinern."
          : "Mit den verbleibenden Kaufperioden ist das Ziel auf garantierter Basis nicht vollständig planbar.";
    setText(result, "[data-flight-recommendation]", recommendation);

    const query = new URLSearchParams();
    Object.entries(collectValues()).forEach(([key, value]) => query.set(key, typeof value === "boolean" ? (value ? "1" : "0") : value));
    if (shareButton) shareButton.dataset.shareUrl = `/drachenhalle/tools/eventrechner/?${query.toString()}`;
  });

  form.requestSubmit();
};
