import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
const source=(await readFile(new URL('../src/scripts/season-planner.ts',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'').replace('export function validatePlan','function validatePlan');
const validate=runInNewContext(stripTypeScriptTypes(source,{mode:'strip'})+';validatePlan',{document:{querySelector:()=>null}});
test('planner imports only known cells, alliances and bounded text',()=>{
 assert.equal(validate({A1:{alliance:'DIE',note:'Start'},T20:{alliance:'',note:'Check'}}).A1.note,'Start');
 for(const bad of [null,[],{A0:{alliance:'DIE',note:''}},{U1:{alliance:'DIE',note:''}},{A21:{alliance:'DIE',note:''}},{A1:{alliance:'toString',note:''}},{A1:{alliance:'DIE',note:'x'.repeat(301)}}])assert.throws(()=>validate(bad));
});
test('planner preserves notes as plain text',()=>{assert.equal(validate({A1:{alliance:'DIE',note:'<script>example</script>'}}).A1.note,'<script>example</script>');});
