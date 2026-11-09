import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {marked} from 'marked';
import {repositoryRoot} from '../scripts/content-files.mjs';
import config from '../src/i18n/config.json' with {type:'json'};
import {responsiveSanctionsTable} from '../src/lib/alliance-rules.mjs';
import {localizedRulesPoster} from '../scripts/localized-tip-images.mjs';
import sharp from 'sharp';

test('all languages preserve the complete sanctions matrix and onboarding step',()=>{
  for(const {code} of config.languages){
    const rules=fs.readFileSync(path.join(repositoryRoot,'content/Allianz',code,'Allianz_Regeln.md'),'utf8');
    const tutorial=fs.readFileSync(path.join(repositoryRoot,'content/Tutorials',code,'Allianz_Einstieg.md'),'utf8');
    const tokens=marked.lexer(rules);
    const table=tokens.find(token=>token.type==='table');
    assert.ok(table && table.type==='table',code+': sanctions table missing');
    assert.equal(table.header.length,3,code+': dialogue and no-dialogue columns required');
    assert.equal(table.rows.length,3,code+': all three violations required');
    assert.equal((tutorial.match(/^## /gm)??[]).length,10,code+': new onboarding step missing');
    assert.ok(tutorial.includes('#sanktionen'),code+': onboarding must link to full process');
    const copy=tokens.filter(token=>token.type==='code');
    assert.equal(copy.length,4,code+': all four copy messages required');
    assert.ok(copy[2].text.length<=1000,code+': sanctions message exceeds game limit');
    const reminder=copy[3].text;
    assert.ok(reminder.replaceAll('\n','\r\n').length+2<=1000,code+': reminder exceeds game limit including Windows line endings');
    for(const term of ['NAP10','Commander****','R1','R2','R3','R4/R5','24'])assert.ok(reminder.includes(term),code+': reminder misses '+term);
    assert.ok(!/https?:\/\//.test(reminder),code+': reminder must remain link-free');
    assert.equal((reminder.match(/<color=#FFD700>/g)??[]).length,4,code+': gold headings missing');
    assert.equal((reminder.match(/<color=#FF4040>/g)??[]).length,1,code+': sanctions heading missing');
    if(code==='de'){
      assert.ok(reminder.includes('Urlaub, Krankheit & Pausen gerne melden.'));
    }
    assert.ok(!/\bTuT\b/.test(rules),code+': process must be presented as our own');
  }
});

test('sanctions retain the unresolved case without inventing another punishment',()=>{
  const text=fs.readFileSync(path.join(repositoryRoot,'content/Allianz/de/Allianz_Regeln.md'),'utf8');
  const table=marked.lexer(text).find(token=>token.type==='table');
  assert.ok(table && table.type==='table');
  assert.match(table.rows[0][1].text,/gleich- oder höherwertig/);
  assert.equal(table.rows[0][2].text,'Basisangriff, aber keine vollständige Zerstörung');
  assert.equal(table.rows[1][1].text,'Basisangriff, aber keine vollständige Zerstörung');
  assert.equal(table.rows[1][2].text,'Basisangriffe bis zur vollständigen Zerstörung');
  assert.equal(table.rows[2][1].text,'Basisangriffe bis zur vollständigen Zerstörung');
  assert.equal(table.rows[2][2].text,'Nicht separat geregelt');
  const responsive = responsiveSanctionsTable(marked.parser([table]));
  assert.equal((responsive.match(/rules-cell-label/g)??[]).length,6);
  assert.match(responsive,/<thead>/);
  assert.match(responsive,/Nicht separat geregelt/);
  assert.match(text,/maximal \*\*24 Stunden\*\*/);
  assert.match(text,/Keine eigenmächtigen Gegenangriffe/);
  assert.match(text,/2 Verwarnungen/);
  assert.match(text,/9\. Tag die Entfernung/);
});

test('the onboarding overview refers to the same resolution process as the rules page',()=>{
  for(const {code} of config.languages){
    const rules=fs.readFileSync(path.join(repositoryRoot,'content/Allianz',code,'Allianz_Regeln.md'),'utf8');
    const tutorial=fs.readFileSync(path.join(repositoryRoot,'content/Tutorials',code,'Allianz_Einstieg.md'),'utf8');
    const steps=tutorial.split(/(?=^## )/m).slice(1);
    const overview=marked.lexer(steps[2]);
    const fourRules=overview.find(token=>token.type==='list'&&token.ordered);
    assert.ok(fourRules && fourRules.type==='list');
    assert.equal(fourRules.items.length,4);
    assert.match(fourRules.items[3].text,/\]\(\/drachenhalle\/docs\/allianzregeln\/#sanktionen\)/,code+': step 3, point 4 must link to the sanctions process');
    const processList=marked.lexer(steps[3]).find(token=>token.type==='list'&&token.ordered);
    const rulesList=marked.lexer(rules).find(token=>token.type==='list'&&token.ordered);
    assert.ok(processList && processList.type==='list' && rulesList && rulesList.type==='list');
    assert.deepEqual(processList.items.map(item=>item.text),rulesList.items.map(item=>item.text),code+': reporting and leadership responsibilities differ');
    assert.ok(steps[7].includes('/tools/schildrechner/'),code+': shield stock must link to actual shield planning');
  }
});

test('each language selects its own readable preview and full-resolution rules download',async()=>{
  const original='<img src="/drachenhalle/rules/allianz-regeln-de.webp"><a href="/drachenhalle/rules/allianz-regeln-de-4x.webp" download="DIE_Allianzregeln_de_4096x6144.webp">Download</a>';
  for(const {code} of config.languages){
    const html=localizedRulesPoster(original,config.base,code);
    const urls=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match=>match[1]);
    assert.equal(urls.length,2);
    assert.match(html,new RegExp(`download="DIE_Allianzregeln_${code}_4096x6144.webp"`));
    for(const [index,url]of urls.entries()){
      assert.ok(url.includes(`allianz-regeln-${code}`),code+': wrong poster language');
      const file=path.join(repositoryRoot,'apps/website/public',url.slice(config.base.length));
      assert.ok(fs.existsSync(file),code+': poster URL has no file');
      const image=await sharp(file).metadata();
      assert.deepEqual([image.width,image.height],index===0?[1024,1536]:[4096,6144]);
    }
  }
});
