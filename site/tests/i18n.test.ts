import { test } from "node:test";
import assert from "node:assert/strict";
import { createTranslator, localizedPageUrl, localizedNavigationUrl, languageAvailable } from "../src/i18n/translate.mjs";
import config from "../src/i18n/config.json" with { type: "json" };
import english from "../src/i18n/en.json" with { type: "json" };
import russian from "../src/i18n/ru.json" with { type: "json" };
import { translateCalendar } from "../src/i18n/calendar.mjs";
import { normalizeContentLinks, repositoryRoot } from "../scripts/content-files.mjs";
import path from "node:path";

test("language routes preserve counterpart paths and shared downloads",()=> {
  assert.equal(localizedPageUrl("/drachenhalle/docs/tipp-01/?sort=points#details","en"),"/drachenhalle/en/docs/tipp-01/?sort=points#details");
  assert.equal(localizedPageUrl("/drachenhalle/en/docs/tipp-01/","de"),"/drachenhalle/docs/tipp-01/");
  assert.equal(localizedPageUrl("https://anthlan.github.io/drachenhalle/docs/tipp-01/","en"),"https://anthlan.github.io/drachenhalle/en/docs/tipp-01/");
  assert.equal(localizedPageUrl("/drachenhalle/fr/docs/tipp-01/","en","/drachenhalle",["de","en","fr"]),"/drachenhalle/en/docs/tipp-01/");
  for(const url of ["/drachenhalle/brand/anthlan.webp","/drachenhalle/_astro/app.js","/drachenhalle/generated/calendar/event.ics","https://example.com/article/"])
    assert.equal(localizedPageUrl(url,"en"),url);
});

test("specific templates win and nested labels are translated",()=> {
  const t=createTranslator({"${left} von ${right}":"${left} of ${right}","${shown} von ${total} Allianzen":"${shown} of ${total} alliances","Punkte":"Points","${count} Punkte":"${count} points"});
  assert.equal(t("15 von 77 Allianzen"),"15 of 77 alliances");
  assert.equal(t("38.000 Punkte"),"38,000 points");
});

test("full hall templates win before partial compound labels",()=> {
  const t=createTranslator(english);
  assert.equal(t("Wächter · Stufe 160"),"Guardian · Level 160");
  assert.equal(t("Besiegt"),"Defeated");
  assert.equal(t("Ehrenplatz frei"),"Unclaimed");
});

test("Russian supports all pages with valid counterpart links",()=> {
  const ru=config.languages.find(item=>item.code==="ru")!;
  assert.equal(languageAvailable("/drachenhalle/en/auswertungen/expeditionswahnsinn/#analyse",ru,config),true);
  assert.equal(languageAvailable("/drachenhalle/ruhmeshalle/",ru,config),true);
  assert.equal(localizedNavigationUrl("/drachenhalle/auswertungen/expeditionswahnsinn/?server=105#spieler","ru",config),"/drachenhalle/ru/auswertungen/expeditionswahnsinn/?server=105#spieler");
  assert.equal(localizedNavigationUrl("/drachenhalle/docs/allianzregeln/","ru",config),"/drachenhalle/ru/docs/allianzregeln/");
  assert.equal(localizedNavigationUrl("/drachenhalle/brand/image.webp","ru",config),"/drachenhalle/brand/image.webp");
  const t=createTranslator(russian,"ru-RU");
  assert.equal(t("Seite 2 / 12"),"Страница 2 / 12");
  assert.equal(t("Rang;Spieler;Allianzkürzel;Allianz;Server;Punkte"),"Место;Игрок;Тег альянса;Альянс;Сервер;Очки");
  assert.ok(!/Punkte|Teilnehmer|Allianzmitglied/.test(t("Ø 637 655 Punkte pro Teilnehmer · Median 762 697 Punkte · 164 911 Punkte pro Allianzmitglied.")));
});

test("calendar translations preserve event timezones and alarms",()=> {
  const source="BEGIN:VEVENT\r\nUID:event@drachenhalle\r\nDTSTART;TZID=Europe/Berlin:20261017T040000\r\nSUMMARY:Allianz-Hinterhalt\r\nDESCRIPTION:Heilen\\, dann starten.\r\nTRIGGER:-PT10M\r\nEND:VEVENT\r\n";
  const result=translateCalendar(source,createTranslator({"Allianz-Hinterhalt":"Alliance Ambush","Heilen, dann starten.":"Heal, then start."}));
  assert.ok(result.includes("SUMMARY:Alliance Ambush"));
  assert.ok(result.includes("DESCRIPTION:Heal\\, then start."));
  for(const unchanged of ["UID:event@drachenhalle","DTSTART;TZID=Europe/Berlin:20261017T040000","TRIGGER:-PT10M"])assert.ok(result.includes(unchanged));
});

test("moved Markdown resolves shared media through logical generator paths",()=> {
  const file=path.join(repositoryRoot,"content/Drachenwissen/Tipps/de/Tipp_01.md");
  const source="![Image](../../../../Drachenwissen/Tipps/Tipp_01.png) [Rule](../../../Allianz/de/Allianz_Regeln.md) [External](https://example.com/a.md)";
  const normalized=normalizeContentLinks(file,source);
  assert.equal(normalized,"![Image](Tipp_01.png) [Rule](../../Allianz/Allianz_Regeln.md) [External](https://example.com/a.md)");
});

test("translation preserves whitespace, numeric placeholders and composed headings",()=> {
  const t=createTranslator({"Allianz":"Alliance","DIE Drachenhalle":"DIE Dragon Hall","${count} Spieler · Seite ${page}":"${count} players · Page ${page}","Keine Daten verfügbar.":"No data available."});
  assert.equal(t("\n Keine   Daten verfügbar. \n"),"\n No data available. \n");
  assert.equal(t("563 Spieler · Seite 2"),"563 players · Page 2");
  assert.equal(t("Allianz · DIE Drachenhalle"),"Alliance · DIE Dragon Hall");
  assert.equal(t("← Allianz"),"← Alliance");
  assert.equal(t("Anthlan"),"Anthlan");
});


test("Russian UI catalog covers English keys and preserves interpolation",()=> {
  for(const key of Object.keys(english)){
    assert.ok(Object.hasOwn(russian,key), 'Missing Russian UI key: '+key);
    const placeholders=(value:string)=>[...value.matchAll(/\$\{([^}]+)\}/g)].map(match=>match[1]).sort();
    assert.deepEqual(placeholders(russian[key]),placeholders(key),'Interpolation differs: '+key);
    assert.ok(!/QXK\d|KXQ/.test(russian[key]),'Temporary token in '+key);
  }
});
