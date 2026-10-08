import assert from "node:assert/strict";
import test from "node:test";
import { pointsPlan, radarPlan, durationMinutes } from "../src/scripts/competition-calculator.ts";
import { actionPoints, competitionDays, nextRadarDay, milestoneProgress, competitionMilestones } from "../src/data/competition.ts";

test("Beschleuniger zählen Tage, Stunden und Minuten gemeinsam", () => {
  assert.equal(durationMinutes(1, 2, 30), 1590);
  assert.equal(durationMinutes(0, 24, 60), 1500);
  assert.equal(durationMinutes(0, 0, 0), 0);
  const research = competitionDays[2].actions.find(action => action.id === "research")!;
  assert.equal(actionPoints(research, durationMinutes(1, 2, 30)), 200340);
});

test("Meilensteine unterscheiden erreichte Punkte von geplantem Einsatz", () => {
  const progress = milestoneProgress(145000, 405000);
  assert.equal(progress[1].status, "reached");
  assert.equal(progress[2].status, "planned");
  assert.equal(progress[3].status, "open");
  assert.equal(progress[3].missing, 100000);
  assert.equal(milestoneProgress(7190000, 0).every(m => m.status === "reached"), true);
  assert.equal(competitionMilestones.length, 9);
});

test("Mittwoch kombiniert Radar, Forschungsdaten und Minuten ohne Einheiten zu vermischen", () => {
  const actions = competitionDays[2].actions;
  const points = (id: string, amount: number) => actionPoints(actions.find(a => a.id === id)!, amount);
  assert.equal(points("radar", 20) + points("data", 1000) + points("research", 60), 1130560);
  assert.equal(points("component-7", 1), 1701000);
});
test("Radarplanung überspringt Tage ohne Radarwertung einschließlich Wochenende", () => {
  assert.deepEqual(nextRadarDay(0), {index:2, days:2});
  assert.deepEqual(nextRadarDay(1), {index:2, days:1});
  assert.deepEqual(nextRadarDay(4), {index:0, days:3});
  assert.deepEqual(nextRadarDay(5), {index:0, days:2});
  assert.deepEqual(nextRadarDay(6), {index:0, days:1});
});
test("Helden-EP und Energie verwenden vollständige belegte Wertungsblöcke", () => {
  const xp = competitionDays[3].actions.find(a => a.id === "xp")!;
  assert.equal(actionPoints(xp, 649), 0);
  assert.equal(actionPoints(xp, 1300), 4);
  assert.equal(actionPoints(xp, 1300, 4 / 650), 8);
  const energy = competitionDays[1].actions.find(a => a.id === "build-power")!;
  assert.equal(actionPoints(energy, 19), 231);
});

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
