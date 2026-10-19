import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import config from '../src/i18n/config.json' with {type:'json'};
import english from '../src/i18n/en.json' with {type:'json'};
import french from '../src/i18n/fr.json' with {type:'json'};
import {createTranslator,localizedNavigationUrl} from '../src/i18n/translate.mjs';
import {translateCalendar} from '../src/i18n/calendar.mjs';
import {repositoryRoot} from '../scripts/content-files.mjs';

test('French covers UI keys without changing interpolation',()=>{
  const tokens=(value:string)=>[...value.matchAll(/\$\{([^}]+)\}/g)].map(match=>match[1]).sort();
  for(const key of Object.keys(english)){
    assert.ok(Object.hasOwn(french,key),'Missing French key: '+key);
    assert.deepEqual(tokens(french[key]),tokens(key),'Placeholder changed: '+key);
    assert.ok(!/QXK\d|KXQ|ZXQ(?:PH)?\d|\u2047/.test(french[key]),'Temporary or unknown translation token: '+key);
  }
  assert.equal(config.languages.find(language=>language.code==='fr')?.locale,'fr-FR');
  const t=createTranslator(french,'fr-FR');
  assert.match(t('Plünderungsquiz'),/quiz/i);
  assert.match(t('Mitteilung kopieren'),/copi/i);
  assert.equal(t('4.000'),'4\u202f000');
});

test('French page links and calendar preserve technical identifiers',()=>{
  assert.equal(localizedNavigationUrl('/drachenhalle/docs/pluenderungsquiz/?v=1#quiz','fr',config),'/drachenhalle/fr/docs/pluenderungsquiz/?v=1#quiz');
  assert.equal(localizedNavigationUrl('/drachenhalle/fr/docs/allianzregeln/','de',config),'/drachenhalle/docs/allianzregeln/');
  assert.equal(localizedNavigationUrl('https://anthlan.github.io/drachenhalle/','fr',config),'https://anthlan.github.io/drachenhalle/fr/');
  assert.equal(localizedNavigationUrl('/drachenhalle/tutorial/quiz/anthlan-check.webp','fr',config),'/drachenhalle/tutorial/quiz/anthlan-check.webp');
  const calendar='BEGIN:VEVENT\r\nUID:ambush@drachenhalle\r\nDTSTART;TZID=Europe/Berlin:20261017T040000\r\nSUMMARY:Mitteilung kopieren\r\nTRIGGER:-PT10M\r\nEND:VEVENT\r\n';
  const translated=translateCalendar(calendar,createTranslator(french,'fr-FR'));
  assert.ok(translated.includes('SUMMARY:'+french['Mitteilung kopieren']));
  for(const value of ['UID:ambush@drachenhalle','DTSTART;TZID=Europe/Berlin:20261017T040000','TRIGGER:-PT10M'])assert.ok(translated.includes(value));
});

test('French knowledge graphics exist beside translated articles',()=>{
  const audit=JSON.parse(fs.readFileSync(path.join(repositoryRoot,'site/reports/russian-graphics-audit.json'),'utf8'));
  for(const item of audit.items.filter(item=>item.priority==='P1 – Wissensgrafik')){
    const localized=path.join(repositoryRoot,'content',path.dirname(item.source),'fr',path.basename(item.source));
    assert.ok(fs.existsSync(localized),'Missing French graphic: '+item.source);
  }
});
