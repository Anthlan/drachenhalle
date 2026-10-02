import assert from "node:assert/strict";
import test from "node:test";

import {
  COIN_PACKAGES,
  EVENT_VOUCHERS_PER_COIN,
  VOUCHER_PACKAGES,
  casinoProjection,
  expectedVoucherGap,
  milestoneVoucherBonus,
  optimizePackagePurchase,
  probabilityToReach,
  remainingPurchaseWindows,
  requiredCoinsForChance,
} from "../src/scripts/flight-event-calculator.ts";

test("berechnet den vollständigen Erwartungswert inklusive Spielautomaten-Luftabwurf", () => {
  assert.ok(Math.abs(EVENT_VOUCHERS_PER_COIN - 15.0831) < 0.001);
  assert.ok(Math.abs(casinoProjection(100, false).expected - 1508.31) < 0.1);
});

test("ignoriert den Versorgungsabwurf und nutzt nur dokumentierte Gutschein-Ausgänge", () => {
  const projection = casinoProjection(1, false);
  assert.equal(projection.guaranteed, 5);
  assert.ok(projection.expected > 15 && projection.expected < 15.2);
});

test("zählt angefangene Kaufperioden", () => {
  assert.equal(remainingPurchaseWindows(0, 0), 0);
  assert.equal(remainingPurchaseWindows(0, 1), 1);
  assert.equal(remainingPurchaseWindows(3, 1), 4);
  assert.equal(remainingPurchaseWindows(7, 17), 8);
});

test("berücksichtigt die expliziten Gutschein-Meilensteine", () => {
  assert.equal(milestoneVoucherBonus(299), 0);
  assert.equal(milestoneVoucherBonus(300), 200);
  assert.equal(milestoneVoucherBonus(500), 400);
  assert.equal(milestoneVoucherBonus(500, false), 0);
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
  const expected = casinoProjection(100, false).expected;
  assert.equal(expectedVoucherGap(2000, 110, 100, false), Math.ceil(2000 - 110 - expected));
  assert.equal(expectedVoucherGap(1500, 110, 100, false), 0);
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
  assert.ok(probabilityToReach(1000, 100, false) > probabilityToReach(1000, 50, false));
  const realistic = requiredCoinsForChance(4000, 0.8, true);
  const cautious = requiredCoinsForChance(4000, 0.95, true);
  assert.ok(realistic !== null && cautious !== null);
  assert.ok((cautious as number) >= (realistic as number));
});
