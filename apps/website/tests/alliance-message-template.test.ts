import test from "node:test";
import assert from "node:assert/strict";
import {
  fillAllianceAmbushMessage,
  fillCityConquestMessage,
  fillFortressAttackMessage,
  fillRaidShieldMessage,
  fillZombieSiegeMessage,
  isAllianceAmbushMessageComplete,
  isCityConquestMessageComplete,
  isFortressAttackMessageComplete,
  isRaidShieldMessageComplete,
  isZombieSiegeMessageComplete,
} from "../src/lib/alliance-message-template.mjs";

test("füllt die deutsche Zombie-Mitteilung vollständig aus", () => {
  const template = "Heute [UHRZEIT], Stufe [STUFE], Basen ab [BASIS-LEVEL].";
  assert.equal(
    fillZombieSiegeMessage(template, { time: "21:00", level: "12", baseLevel: "18" }),
    "Heute 21:00, Stufe 12, Basen ab 18.",
  );
});

test("erkennt und ersetzt auch die Platzhalter der Übersetzungen", () => {
  const template = "[TIME] · [NIVEAU] · [УРОВЕНЬ БАЗЫ] · [NÍVEL DA BASE]";
  assert.equal(
    fillZombieSiegeMessage(template, { time: "20:30", level: "9", baseLevel: "16" }),
    "20:30 · 9 · 16 · 16",
  );
});

test("aktiviert den fertigen Kopiertext erst bei drei Angaben", () => {
  assert.equal(isZombieSiegeMessageComplete({ time: "21:00", level: "10", baseLevel: "" }), false);
  assert.equal(isZombieSiegeMessageComplete({ time: "25:00", level: "10", baseLevel: "15" }), false);
  assert.equal(isZombieSiegeMessageComplete({ time: "21:00", level: "0", baseLevel: "15" }), false);
  assert.equal(isZombieSiegeMessageComplete({ time: "21:00", level: "10", baseLevel: "15" }), true);
});

test("füllt Stadtlevel und Uhrzeit für die Stadteroberung ein", () => {
  const template = "Um [UHRZEIT] greifen wir eine Stadt auf Level [STADTLEVEL] an.";
  assert.equal(
    fillCityConquestMessage(template, { time: "19:30", cityLevel: "6" }),
    "Um 19:30 greifen wir eine Stadt auf Level 6 an.",
  );
  assert.equal(isCityConquestMessageComplete({ time: "19:30", cityLevel: "" }), false);
  assert.equal(isCityConquestMessageComplete({ time: "19:30", cityLevel: "6" }), true);
});

test("ersetzt die Stadteroberungs-Platzhalter in allen Sprachen", () => {
  const template = "[TIME] · [HEURE] · [ВРЕМЯ] · [HORÁRIO] | [CITY LEVEL] · [NIVEAU DE VILLE] · [УРОВЕНЬ ГОРОДА] · [NÍVEL DA CIDADE]";
  assert.equal(
    fillCityConquestMessage(template, { time: "20:15", cityLevel: "7" }),
    "20:15 · 20:15 · 20:15 · 20:15 | 7 · 7 · 7 · 7",
  );
});

test("füllt Festungslevel und Uhrzeit für den Festungsangriff ein", () => {
  const template = "Um [UHRZEIT] greifen wir eine Festung auf Level [FESTUNGSLEVEL] an.";
  assert.equal(
    fillFortressAttackMessage(template, { time: "20:30", fortressLevel: "4" }),
    "Um 20:30 greifen wir eine Festung auf Level 4 an.",
  );
  assert.equal(isFortressAttackMessageComplete({ time: "20:30", fortressLevel: "" }), false);
  assert.equal(isFortressAttackMessageComplete({ time: "20:30", fortressLevel: "4" }), true);
});

test("ersetzt die Festungsangriff-Platzhalter in allen Sprachen", () => {
  const template = "[TIME] · [HEURE] · [ВРЕМЯ] · [HORÁRIO] | [FORTRESS LEVEL] · [NIVEAU DE FORTERESSE] · [УРОВЕНЬ КРЕПОСТИ] · [NÍVEL DA FORTALEZA]";
  assert.equal(
    fillFortressAttackMessage(template, { time: "20:30", fortressLevel: "4" }),
    "20:30 · 20:30 · 20:30 · 20:30 | 4 · 4 · 4 · 4",
  );
});

test("setzt die gemeinsame Schildzeit im Raubzugplan in allen Sprachen ein", () => {
  const template = "Freitag [UHRZEIT] · Friday [TIME] · Vendredi [HEURE] · Пятница [ВРЕМЯ] · Sexta-feira [HORÁRIO]";
  assert.equal(
    fillRaidShieldMessage(template, { time: "20:00" }),
    "Freitag 20:00 · Friday 20:00 · Vendredi 20:00 · Пятница 20:00 · Sexta-feira 20:00",
  );
  assert.equal(isRaidShieldMessageComplete({ time: "" }), false);
  assert.equal(isRaidShieldMessageComplete({ time: "24:00" }), false);
  assert.equal(isRaidShieldMessageComplete({ time: "20:00" }), true);
});

test("setzt die Startzeit des Allianz-Hinterhalts in allen Sprachen ein", () => {
  const template = "Heute [UHRZEIT] · Today [TIME] · Aujourd’hui [HEURE] · Сегодня [ВРЕМЯ] · Hoje [HORÁRIO]";
  assert.equal(
    fillAllianceAmbushMessage(template, { time: "19:45" }),
    "Heute 19:45 · Today 19:45 · Aujourd’hui 19:45 · Сегодня 19:45 · Hoje 19:45",
  );
  assert.equal(isAllianceAmbushMessageComplete({ time: "" }), false);
  assert.equal(isAllianceAmbushMessageComplete({ time: "19:60" }), false);
  assert.equal(isAllianceAmbushMessageComplete({ time: "19:45" }), true);
});
