import test from "node:test";
import assert from "node:assert/strict";
import {
  fillCityConquestMessage,
  fillZombieSiegeMessage,
  isCityConquestMessageComplete,
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
