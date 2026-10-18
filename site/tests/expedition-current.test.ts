import { test } from "node:test";
import assert from "node:assert/strict";
import current from "../src/data/expedition-2026-10-17.json" with { type: "json" };
import previous from "../src/data/expedition-2026-10-10.json" with { type: "json" };
import { analyzeExpedition } from "../src/scripts/expedition-analysis.ts";
import { readFile } from "node:fs/promises";
import { marked } from "marked";
import { prepareShareAnalysis } from "../src/scripts/share-analysis.mjs";

test("higher threshold compares both weeks consistently without changing original ranks",()=>{
  for(const [data,count,homeCount,dieCount] of [[previous,453,217,12],[current,545,184,11]] as const){
    const selected=data.players.filter(p=>p.points>=50000);
    assert.equal(selected.length,count);
    const summary=analyzeExpedition(selected,data.alliances);
    assert.equal(summary.servers.find(s=>s.server===105)?.count,homeCount);
    assert.equal(summary.alliances.find(a=>a.tag==='DIE')?.count,dieCount);
    assert.ok(selected.every(p=>data.players.find(source=>source.rank===p.rank)?.points===p.points));
    assert.ok(summary.servers.find(s=>s.server===105)!.points/analyzeExpedition(data.players.filter(p=>p.points>=1000),data.alliances).servers.find(s=>s.server===105)!.points>0.99);
  }
});

test("October 17 covers every captured rank and excludes unidentified membership data", () => {
  assert.equal(current.players.length,720);
  assert.equal(new Set(current.players.map(p=>p.rank)).size,720);
  assert.ok(current.players.every(p=>p.player.trim()));
  assert.equal(current.alliances.length,19);
  assert.ok(current.alliances.every(a=>a.tag));
  const selected=current.players.filter(p=>p.points>=1000);
  assert.equal(selected.length,655);
  const result=analyzeExpedition(selected,current.alliances);
  const home=result.servers.find(s=>s.server===105)!;
  const opponent=result.servers.find(s=>s.server===107)!;
  assert.deepEqual([home.count,home.points,opponent.count,opponent.points],[271,182614549,379,481105141]);
  const die=result.alliances.find(a=>a.tag==="DIE")!;
  assert.deepEqual([die.count,die.points,die.members],[14,5243118,68]);
  assert.ok(result.alliances.filter(a=>!a.tag).every(a=>a.members===null));
});

test("October 17 reduced commentary retains public observations and hides DIE comparison",async()=>{
  const markdown=await readFile(new URL("../../content/Drachenwissen/Analysen/de/2026_10_17_Expeditionswahnsinn.md",import.meta.url),"utf8");
  const publicHtml=prepareShareAnalysis(marked.parse(markdown)).replace(/<div data-alliance-only>[\s\S]*?<\/div>/g,"");
  assert.ok(!publicHtml.includes("5.243.118"));
  assert.ok(publicHtml.includes("182.614.549"));
  assert.ok(publicHtml.includes("Datengrundlage"));
});
