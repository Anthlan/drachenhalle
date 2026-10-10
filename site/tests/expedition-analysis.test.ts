import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { analyzeExpedition, median, share } from "../src/scripts/expedition-analysis.ts";

test("Allianzgruppen unterscheiden Server und die Kürzel Asg und ASG", () => {
  const rows = [
    {rank:1,player:"A",tag:"Asg",alliance:"asgardianos",server:105,points:90},
    {rank:2,player:"B",tag:"ASG",alliance:"AsgardWar",server:97,points:30},
    {rank:3,player:"C",tag:"Asg",alliance:"asgardianos",server:105,points:10},
    {rank:4,player:"D",tag:"",alliance:"",server:112,points:5},
  ];
  const result = analyzeExpedition(rows, [{tag:"Asg",alliance:"asgardianos",server:105,members:4,capacity:100,power:1,level:1}]);
  assert.equal(result.alliances.length, 3);
  const home = result.alliances.find(a => a.key === "105:Asg")!;
  assert.equal(home.participation, .5);
  assert.equal(home.average, 50);
  assert.equal(home.top1, .9);
  assert.equal(home.top5, 1);
  assert.equal(home.pointsPerMember, 25);
  assert.equal(result.alliances.find(a => a.key === "97:ASG")!.participation, null);
  assert.equal(result.points, 135);
});

test("Median, leere Gruppen und bekannte Allianzen ohne Teilnehmer bleiben auswertbar", () => {
  assert.equal(median([100, 1, 2, 3]), 2.5);
  assert.equal(median([4, 1, 9]), 4);
  assert.equal(median([]), 0);
  assert.equal(share(0,0), 0);
  const result = analyzeExpedition([], [{tag:"DIE",alliance:"Drachenritter",server:105,members:58,capacity:100,power:1,level:1}]);
  assert.equal(result.alliances[0].participation, 0);
  assert.equal(result.alliances[0].top5, 0);
});

test("Vollständiger Datenstand: 563 Ränge, zusätzliche Server und abgestimmte Summen", () => {
  const data = JSON.parse(readFileSync(new URL("../src/data/expedition-2026-10-10.json", import.meta.url), "utf8"));
  assert.equal(data.players.length, 563);
  assert.deepEqual(data.players.map(p => p.rank), Array.from({length:563},(_,i)=>i+1));
  assert.ok(data.players.every((p,i) => Number.isSafeInteger(p.points) && p.points > 0 && (!i || p.points <= data.players[i-1].points)));
  const analysis = analyzeExpedition(data.players, data.alliances);
  assert.deepEqual(analysis.servers.map(s => [s.server,s.count]), [[97,242],[105,318],[108,1],[110,1],[112,1]]);
  assert.equal(analysis.servers.reduce((sum,s)=>sum+s.points,0), analysis.points);
  assert.equal(analysis.alliances.reduce((sum,a)=>sum+a.points,0), analysis.points);
  assert.equal(analysis.alliances.reduce((sum,a)=>sum+a.count,0), 563);
  assert.equal(data.alliances.length,20);
  assert.ok(analysis.alliances.every(a => a.participation === null || (a.participation >= 0 && a.participation <= 1)));
  assert.equal(analysis.alliances.find(a => a.tag === "DIE")!.members,58);
});
