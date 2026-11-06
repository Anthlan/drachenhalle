import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {runInNewContext} from 'node:vm';
const source=stripTypeScriptTypes((await readFile(new URL('../src/scripts/season-plan-sync.ts',import.meta.url),'utf8')).replace('export function','function'),{mode:'strip'});
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('live plan reads are readonly and do not publish a local plan',async()=>{
 let poll;let posts=0;let latest;
 const create=runInNewContext(source+';createPlanSync',{document:{hidden:false},AbortSignal,setInterval:fn=>(poll=fn,1),clearInterval(){},fetch:async(url,init)=>{if(init.method==='POST')posts++;return {ok:true,status:200,json:async()=>({revision:0,cells:{},canEdit:false})}}});
 const sync=create({endpoint:'https://example.test/api/season-plan',token:'',validate:x=>x,onState:(cells,edit)=>latest={cells,edit},onStatus(){}});
 await settle();sync.save({A1:{alliance:'DIE',note:''}});await settle();
 assert.equal(posts,0);assert.equal(latest.edit,false);assert.equal(Object.keys(latest.cells).length,0);sync.stop();
});
test('conflicts merge independent cells and pending writes survive transient failures',async()=>{
 let poll;let calls=0;let latest;let revision=0;let remote={};let fail=true;
 const create=runInNewContext(source+';createPlanSync',{document:{hidden:false},AbortSignal,setInterval:fn=>(poll=fn,1),clearInterval(){},fetch:async(url,init)=>{
   if(init.method==='POST'){
     calls++;if(fail){fail=false;throw new Error('Offline');}
     const body=JSON.parse(init.body);
     if(calls===2){remote.B1={alliance:'GGR',note:''};revision++;}
     if(body.revision!==revision)return {ok:false,status:409,json:async()=>({revision,cells:remote})};
     for(const {code,entry}of body.changes){if(entry===null)delete remote[code];else remote[code]=entry;}revision++;
   }
   return {ok:true,status:200,json:async()=>({revision,cells:JSON.parse(JSON.stringify(remote)),canEdit:true})};
 }});
 const sync=create({endpoint:'https://example.test/api/season-plan',token:'edit',validate:x=>x,onState:cells=>latest=cells,onStatus(){}});
 await settle();sync.save({A1:{alliance:'DIE',note:'Keep'}});await settle();assert.equal(sync.hasPending(),true);
 await poll();await settle();await settle();
 assert.equal(sync.hasPending(),true);
 await poll();await settle();await settle();
 assert.equal(latest.A1.alliance,'DIE');assert.equal(latest.B1.alliance,'GGR');assert.equal(sync.hasPending(),false);assert.equal(calls,3);
 sync.save({B1:latest.B1});await settle();assert.equal(remote.A1,undefined);sync.stop();
});
