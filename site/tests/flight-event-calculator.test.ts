import assert from "node:assert/strict";
import test from "node:test";

import {
  COIN_PACKAGES,
  EVENT_VOUCHERS_PER_COIN,
  VOUCHER_PACKAGES,
  casinoProjection,
  expectedVoucherGap,
  optimizeHybridPurchase,
  optimizePackagePurchase,
  probabilityToReach,
  remainingPurchaseWindows,
  requiredCoinsForChance,
} from "../src/scripts/flight-event-calculator.ts";

test("berechnet den vollständigen Erwartungswert inklusive Spielautomaten-Luftabwurf", () => {
  assert.ok(Math.abs(EVENT_VOUCHERS_PER_COIN - 15.0831) < 0.001);
  assert.ok(Math.abs(casinoProjection(100).expected - 1508.31) < 0.1);
});

test("ignoriert den Versorgungsabwurf und nutzt nur dokumentierte Gutschein-Ausgänge", () => {
  const projection = casinoProjection(1);
  assert.equal(projection.guaranteed, 5);
  assert.ok(projection.expected > 15 && projection.expected < 15.2);
});

test("zählt angefangene Kaufperioden", () => {
  assert.equal(remainingPurchaseWindows(0, 0), 0);
  assert.equal(remainingPurchaseWindows(0, 1), 1);
  assert.equal(remainingPurchaseWindows(3, 1), 4);
  assert.equal(remainingPurchaseWindows(7, 17), 8);
});

test("leitet Punkte- und Aufgabenbelohnungen nicht aus der Münzanzahl ab", () => {
  const projection = casinoProjection(300);
  assert.ok(Math.abs(projection.expected - 300 * EVENT_VOUCHERS_PER_COIN) < 0.001);
  assert.equal(projection.guaranteed, 300 * 5);
});

test("findet den sicheren günstigsten Direktkauf für 60 Gutscheine", () => {
  const plan = optimizePackagePurchase(VOUCHER_PACKAGES, 1, 60);
  assert.ok(plan);
  assert.equal(plan.units, 60);
  assert.equal(plan.costCents, 848);
  assert.equal(plan.counts["voucher-20"], 1);
  assert.equal(plan.counts["voucher-40"], 1);
});

test("kauft direkt nur die Restlücke nach Bestand und erwartetem Münzertrag", () => {
  const expected = casinoProjection(100).expected;
  assert.equal(expectedVoucherGap(2000, 110, 100), Math.ceil(2000 - 110 - expected));
  assert.equal(expectedVoucherGap(1500, 110, 100), 0);
});

test("respektiert verbleibende Tageslimits", () => {
  const impossible = optimizePackagePurchase(VOUCHER_PACKAGES, 1, 2000);
  assert.equal(impossible, null);

  const coinPlan = optimizePackagePurchase(COIN_PACKAGES, 1, 6);
  assert.ok(coinPlan);
  assert.equal(coinPlan.units, 6);
  assert.equal(coinPlan.costCents, 368);
});

test("mehr Münzen erhöhen die Zielchance und die geforderte Sicherheit den Bedarf", () => {
  assert.ok(probabilityToReach(1000, 100) > probabilityToReach(1000, 50));
  const realistic = requiredCoinsForChance(4000, 0.8);
  const cautious = requiredCoinsForChance(4000, 0.95);
  assert.ok(realistic !== null && cautious !== null);
  assert.ok((cautious as number) >= (realistic as number));
});

test("kombiniert Münz- und Gutscheinpakete für große Ziele", () => {
  const common = {
    windows: 4,
    targetVouchers: 8192,
    securedVouchers: 114,
    availableCoins: 109,
    confidence: 0.8,
  };
  const casinoFirst = optimizeHybridPurchase({ ...common, strategy: "casino-first" });
  const voucherFirst = optimizeHybridPurchase({ ...common, strategy: "voucher-first" });
  const optimized = optimizeHybridPurchase({ ...common, strategy: "cost-optimized" });

  assert.ok(casinoFirst);
  assert.ok(voucherFirst);
  assert.ok(optimized);
  assert.ok(casinoFirst.coinPlan.units > 0);
  assert.ok(voucherFirst.coinPlan.units > 0 && voucherFirst.voucherPlan.units > 0);
  assert.ok(casinoFirst.probability >= 0.8);
  assert.ok(voucherFirst.probability >= 0.8);
  assert.ok(optimized.probability >= 0.8);
  assert.ok(optimized.totalCostCents <= casinoFirst.totalCostCents);
  assert.ok(optimized.totalCostCents <= voucherFirst.totalCostCents);
});
