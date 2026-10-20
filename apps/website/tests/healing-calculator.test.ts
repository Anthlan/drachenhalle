import assert from "node:assert/strict";
import test from "node:test";

import {
  effectiveHealingSpeed,
  tierSecondsPerSoldier,
} from "../src/scripts/healing-calculator.ts";

test("addiert beim Taktischen Minister genau 20 Prozentpunkte", () => {
  assert.equal(effectiveHealingSpeed(100.9, false), 100.9);
  assert.equal(effectiveHealingSpeed(100.9, true), 120.9);
});

test("der Amtsbonus verkürzt die Heilzeit je Soldat", () => {
  const withoutMinister = tierSecondsPerSoldier("t8", 100.9, false);
  const withMinister = tierSecondsPerSoldier("t8", 100.9, true);

  assert.ok(withMinister < withoutMinister);
  assert.equal(Math.round(withoutMinister * 1000), 44_798);
  assert.equal(Math.round(withMinister * 1000), 40_742);
});
