import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
const source=(await readFile(new URL('../src/scripts/season-planner.ts',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'').replace(/export function /g,'function ');
const validate=runInNewContext(stripTypeScriptTypes(source,{mode:'strip'})+';validatePlan',{document:{querySelector:()=>null}});
test('planner imports only known cells, alliances and bounded text',()=>{
 assert.equal(validate({A1:{alliance:'DIE',note:'Start'},T20:{alliance:'',note:'Check'}}).A1.note,'Start');
 for(const bad of [null,[],{A0:{alliance:'DIE',note:''}},{U1:{alliance:'DIE',note:''}},{A21:{alliance:'DIE',note:''}},{A1:{alliance:'toString',note:''}},{A1:{alliance:'DIE',note:'x'.repeat(301)}}])assert.throws(()=>validate(bad));
});
test('planner preserves notes as plain text',()=>{assert.equal(validate({A1:{alliance:'DIE',note:'<script>example</script>'}}).A1.note,'<script>example</script>');});

test('planner accepts all ten server alliances and migrates the old BTS spelling',()=>{
 for(const alliance of ['GGR','CCE','BTs','Lrs','IGGG','TuT','BOD','DIE','LIG','Beep'])assert.equal(validate({A1:{alliance,note:''}}).A1.alliance,alliance);
 assert.equal(validate({A1:{alliance:'BTS',note:'Keep'}}).A1.alliance,'BTs');
});

test('dragging and click placement retain notes, ignore foreign drops and save the chosen alliance',()=>{
 const node=(dataset={})=>({dataset,value:'',textContent:'',setAttribute(){},querySelector(){return this.assignment},replaceChildren(){},append(){}});
 const cell=node({cell:'A1'});cell.assignment=node();
 const token=node({allianceToken:'DIE'});
 const nodes=new Map();const get=s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)};
 get('[data-editor]').elements={namedItem:name=>get(name)};
 const root={querySelector:get,querySelectorAll:s=>s==='[data-cell]'?[cell]:s==='[data-alliance-token]'?[token]:[]};
 let saved='';
 runInNewContext(stripTypeScriptTypes(source,{mode:'strip'}),{t:s=>s,document:{querySelector:()=>root,addEventListener(){},createElement:()=>node()},localStorage:{getItem:()=>JSON.stringify({A1:{alliance:'GGR',note:'Preserve note'}}),setItem:(key,value)=>saved=value}});
 let payload='';token.ondragstart({dataTransfer:{setData:(type,value)=>payload=value}});assert.equal(payload,'DIE');
 cell.ondrop({preventDefault(){},dataTransfer:{getData:()=>payload}});
 assert.equal(JSON.parse(saved).A1.alliance,'DIE');assert.equal(JSON.parse(saved).A1.note,'Preserve note');
 const previous=saved;cell.ondrop({preventDefault(){},dataTransfer:{getData:()=>'<bad>'}});assert.equal(saved,previous);
 token.onclick();cell.onclick();assert.equal(JSON.parse(saved).A1.alliance,'DIE');
});

test('shared plans round-trip Unicode notes and reject malformed links',()=>{
 const context={document:{querySelector:()=>null}};
 const api=runInNewContext(stripTypeScriptTypes(source,{mode:'strip'})+';({encodeSharedPlan,decodeSharedPlan})',context);
 const plan={A1:{alliance:'DIE',note:'Grün 🌍 Привет'},T20:{alliance:'BTs',note:''}};
 assert.equal(JSON.stringify(api.decodeSharedPlan(api.encodeSharedPlan(plan))),JSON.stringify(plan));
 for(const value of ['%',encodeURIComponent('{}'),encodeURIComponent(JSON.stringify([['A1','wrong','']]))])assert.throws(()=>api.decodeSharedPlan(value));
});
