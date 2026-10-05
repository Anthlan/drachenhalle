import assert from "node:assert/strict";
import test from "node:test";
import { pointsPlan, radarPlan } from "../src/scripts/competition-calculator.ts";

test("rundet den Bedarf auf und zeigt eine Bestandslücke", () => {
  assert.deepEqual(pointsPlan(10, 101, 20, 3), { missing: 91, needed: 5, use: 3, remaining: 0, shortfall: 31 });
});
test("erreichtes Ziel benötigt keine weiteren Vorräte", () => {
  assert.equal(pointsPlan(101, 100, 20, 3).use, 0);
});
test("Radar hält den maximalen Bestand ohne die nächste Auffüllung zu blockieren", () => {
  assert.deepEqual(radarPlan(28, 35, 10), { clear: 3, saved: 25, projected: 35, unavoidable: 0 });
  assert.equal(radarPlan(20, 35, 10).clear, 0);
  assert.equal(radarPlan(35, 35, 10).clear, 10);
});
test("unmögliche Radarwerte und zu große Auffüllungen werden erkannt", () => {
  assert.throws(() => radarPlan(36, 35, 10));
  assert.equal(radarPlan(2, 5, 10).unavoidable, 5);
});
