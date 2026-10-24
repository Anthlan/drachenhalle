import {test} from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/data/expedition-2026-10-24.json' with {type:'json'};
import {analyzeExpedition} from '../src/scripts/expedition-analysis.ts';
test('24 October snapshots retain verified totals and unique players',()=>{
 assert.equal(data.players.length,688);assert.equal(data.afterPlayers.length,731);
 assert.equal(new Set(data.afterPlayers.map(p=>p.rank)).size,731);
 for(const [rows,count,points] of [[data.players,652,676404845],[data.afterPlayers,672,717124843]]){
  const a=analyzeExpedition(rows.filter(p=>p.points>=1000),data.alliances);
  assert.equal(a.count,count);assert.equal(rows.filter(p=>p.points>=1000).reduce((n,p)=>n+p.points,0),points);
 }
 assert.equal(data.alliances.length,20);
 assert.equal(data.afterPlayers.find(p=>p.server===112)?.points,68000);
});
test('matched comparison excludes unmatched players and applies the threshold to both snapshots',()=>{
 assert.equal(data.pairs.length,686);
 const cohort=data.pairs.filter(p=>p.beforePoints>=1000&&p.afterPoints>=1000);
 assert.equal(cohort.length,650);
 assert.equal(cohort.reduce((n,p)=>n+p.afterPoints-p.beforePoints,0),34869489);
 for(const minimum of [1000,50000,1000000])assert.ok(data.pairs.filter(p=>p.beforePoints>=minimum&&p.afterPoints>=minimum).every(p=>p.afterPoints>=p.beforePoints));
});

test('phase table follows the point slider for every selected threshold',async()=>{
 const {readFile}=await import('node:fs/promises');
 const {stripTypeScriptTypes}=await import('node:module');
 const {runInNewContext}=await import('node:vm');
 const source=await readFile(new URL('../src/scripts/expedition-phases.ts',import.meta.url),'utf8');
 const slider={value:'1000',addEventListener(_event,callback){this.update=callback;}};
 const table={innerHTML:''};
 const document={documentElement:{lang:'de'},querySelector(selector){return selector==='#exp-phase-data'?{textContent:JSON.stringify(data.pairs)}:selector==='#exp-phase-rows'?table:slider;}};
 runInNewContext(stripTypeScriptTypes(source,{mode:'strip'}),{document,window:{addEventListener(){}}});
 assert.match(table.innerHTML,/34|18/);
 for(const min of [1000,50000,1000000]){
  slider.value=String(min);slider.update();
  for(const server of [105,109,112]){
   const cohort=data.pairs.filter(p=>p.server===server&&p.beforePoints>=min&&p.afterPoints>=min);
   const delta=cohort.reduce((sum,p)=>sum+p.afterPoints-p.beforePoints,0);
   assert.ok(table.innerHTML.includes('+'+delta.toLocaleString('de')));
  }
  assert.ok(!table.innerHTML.includes('NaN'));
 }
});
