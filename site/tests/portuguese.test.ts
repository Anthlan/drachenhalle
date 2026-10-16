import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import config from '../src/i18n/config.json' with {type:'json'};
import english from '../src/i18n/en.json' with {type:'json'};
import portuguese from '../src/i18n/pt.json' with {type:'json'};
import {createTranslator,localizedNavigationUrl} from '../src/i18n/translate.mjs';
import {translateCalendar} from '../src/i18n/calendar.mjs';
import {repositoryRoot} from '../scripts/content-files.mjs';

test('Brazilian Portuguese covers UI keys without changing interpolation',()=>{
  const tokens=(value:string)=>[...value.matchAll(/\$\{([^}]+)\}/g)].map(match=>match[1]).sort();
  for(const key of Object.keys(english)){
    assert.ok(Object.hasOwn(portuguese,key),'Missing Portuguese key: '+key);
    assert.deepEqual(tokens(portuguese[key]),tokens(key),'Placeholder changed: '+key);
    assert.ok(!/QXK\d|KXQ|ZXQ\d|\u2047/.test(portuguese[key]),'Temporary or unknown translation token: '+key);
  }
  assert.equal(config.languages.find(language=>language.code==='pt')?.locale,'pt-BR');
  const t=createTranslator(portuguese,'pt-BR');
  assert.equal(t('Plünderungsquiz'),'Quiz de saques');
  assert.equal(t('Mitteilung kopieren'),'Copiar mensagem');
  assert.equal(t('4.000'),'4.000');
  assert.equal(t('38.000'),'38.000');
});

test('Portuguese page links and calendar preserve technical identifiers',()=>{
  assert.equal(localizedNavigationUrl('/drachenhalle/docs/pluenderungsquiz/?v=1#quiz','pt',config),'/drachenhalle/pt/docs/pluenderungsquiz/?v=1#quiz');
  assert.equal(localizedNavigationUrl('/drachenhalle/pt/docs/allianzregeln/','de',config),'/drachenhalle/docs/allianzregeln/');
  assert.equal(localizedNavigationUrl('/drachenhalle/tutorial/quiz/anthlan-check.webp','pt',config),'/drachenhalle/tutorial/quiz/anthlan-check.webp');
  const calendar='BEGIN:VEVENT\r\nUID:ambush@drachenhalle\r\nDTSTART;TZID=Europe/Berlin:20261017T040000\r\nSUMMARY:Allianz-Hinterhalt\r\nTRIGGER:-PT10M\r\nEND:VEVENT\r\n';
  const translated=translateCalendar(calendar,createTranslator(portuguese,'pt-BR'));
  assert.ok(translated.includes('SUMMARY:Emboscada da Aliança'));
  for(const value of ['UID:ambush@drachenhalle','DTSTART;TZID=Europe/Berlin:20261017T040000','TRIGGER:-PT10M'])assert.ok(translated.includes(value));
});

test('Portuguese knowledge graphics exist beside translated articles',()=>{
  const audit=JSON.parse(fs.readFileSync(path.join(repositoryRoot,'site/reports/russian-graphics-audit.json'),'utf8'));
  for(const item of audit.items.filter(item=>item.priority==='P1 – Wissensgrafik')){
    const localized=path.join(repositoryRoot,'content',path.dirname(item.source),'pt',path.basename(item.source));
    assert.ok(fs.existsSync(localized),'Missing Portuguese graphic: '+item.source);
  }
});

