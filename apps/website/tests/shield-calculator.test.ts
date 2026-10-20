import assert from "node:assert/strict";
import test from "node:test";

import {
  buildProtectionSegments,
  buildTimelinePhases,
  findProtectionGaps,
  mergeActiveWindows,
  optimizeProtectionPlan,
} from "../src/scripts/shield-calculator.ts";

const at = (value: string) => new Date(value);

test("plant 24h und 8h lückenlos für einen 32-Stunden-Zeitraum", () => {
  const segments = [{
    start: at("2026-10-02T20:00:00+02:00"),
    end: at("2026-10-04T04:00:00+02:00"),
    label: "Raubzugschutz",
  }];
  const plan = optimizeProtectionPlan(
    segments,
    { shields72: 0, shields24: 1, shields12: 0, shields8: 1 },
    "fewest",
  );

  assert.equal(plan.complete, true);
  assert.deepEqual(plan.used, { shields72: 0, shields24: 1, shields12: 0, shields8: 1 });
  assert.equal(plan.steps.length, 2);
  assert.equal(plan.coverageEnd.getTime(), segments[0].end.getTime());
});

test("bevorzugt für elf Stunden das günstigere 12h-Schild", () => {
  const segments = [{
    start: at("2026-10-03T09:00:00+02:00"),
    end: at("2026-10-03T20:00:00+02:00"),
    label: "Schutzphase",
  }];
  const plan = optimizeProtectionPlan(
    segments,
    { shields72: 0, shields24: 1, shields12: 1, shields8: 0 },
    "cost",
  );

  assert.equal(plan.complete, true);
  assert.deepEqual(plan.used, { shields72: 0, shields24: 0, shields12: 1, shields8: 0 });
  assert.equal(plan.coverageEnd.getTime() - segments[0].end.getTime(), 60 * 60 * 1000);
});

test("trennt Schutzphasen inklusive Battle-Frenzy korrekt", () => {
  const raidStart = at("2026-10-03T04:00:00+02:00");
  const raidEnd = at("2026-10-04T04:00:00+02:00");
  const active = mergeActiveWindows([{
    start: at("2026-10-03T08:00:00+02:00"),
    end: at("2026-10-03T09:00:00+02:00"),
    restartAt: at("2026-10-03T09:15:00+02:00"),
    label: "Plünderfenster 1",
    type: "raid",
  }], raidStart, raidEnd);
  const segments = buildProtectionSegments(raidStart, raidEnd, active);

  assert.equal(segments.length, 2);
  assert.equal(segments[0].end.getTime(), active[0].start.getTime());
  assert.equal(segments[1].start.getTime(), active[0].restartAt.getTime());
});

test("meldet eine echte Schutzlücke bei fehlendem Bestand", () => {
  const raidStart = at("2026-10-03T04:00:00+02:00");
  const raidEnd = at("2026-10-04T04:00:00+02:00");
  const segments = [{ start: raidStart, end: raidEnd, label: "Raubzugschutz" }];
  const plan = optimizeProtectionPlan(
    segments,
    { shields72: 0, shields24: 0, shields12: 1, shields8: 0 },
    "fewest",
  );
  const gaps = findProtectionGaps(segments, plan.steps, raidStart, raidStart);

  assert.equal(plan.complete, false);
  assert.equal(gaps.length, 1);
  assert.equal(gaps[0].start.getTime(), at("2026-10-03T16:00:00+02:00").getTime());
  assert.equal(gaps[0].end.getTime(), raidEnd.getTime());
});

test("kennzeichnet überschüssige Schildlaufzeit im Zeitstrahl", () => {
  const raidStart = at("2026-10-03T04:00:00+02:00");
  const raidEnd = at("2026-10-04T04:00:00+02:00");
  const phases = buildTimelinePhases(raidStart, raidEnd, [{
    at: at("2026-10-03T00:00:00+02:00"),
    hours: 72,
    phaseLabel: "Durchgehender Schutz",
  }], []);

  assert.equal(phases.phases.some((phase) => phase.kind === "extra"), true);
  assert.equal(phases.phases.some((phase) => phase.kind === "protected"), true);
});
