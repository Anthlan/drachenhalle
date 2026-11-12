const zombieSiegeTokens = {
  time: ["[UHRZEIT]", "[TIME]", "[HEURE]", "[ВРЕМЯ]", "[HORA]"],
  level: ["[STUFE]", "[LEVEL]", "[NIVEAU]", "[УРОВЕНЬ]", "[NÍVEL]"],
  baseLevel: [
    "[BASIS-LEVEL]",
    "[BASE LEVEL]",
    "[NIVEAU DE BASE]",
    "[УРОВЕНЬ БАЗЫ]",
    "[NÍVEL DA BASE]",
  ],
};
const cityConquestTokens = {
  time: ["[UHRZEIT]", "[TIME]", "[HEURE]", "[ВРЕМЯ]", "[HORÁRIO]"],
  cityLevel: ["[STADTLEVEL]", "[CITY LEVEL]", "[NIVEAU DE VILLE]", "[УРОВЕНЬ ГОРОДА]", "[NÍVEL DA CIDADE]"],
};
const fortressAttackTokens = {
  time: ["[UHRZEIT]", "[TIME]", "[HEURE]", "[ВРЕМЯ]", "[HORÁRIO]"],
  fortressLevel: ["[FESTUNGSLEVEL]", "[FORTRESS LEVEL]", "[NIVEAU DE FORTERESSE]", "[УРОВЕНЬ КРЕПОСТИ]", "[NÍVEL DA FORTALEZA]"],
};
const raidShieldTokens = {
  time: ["[UHRZEIT]", "[TIME]", "[HEURE]", "[ВРЕМЯ]", "[HORÁRIO]"],
};
const allianceAmbushTokens = {
  time: ["[UHRZEIT]", "[TIME]", "[HEURE]", "[ВРЕМЯ]", "[HORÁRIO]"],
  level: ["[STUFE]", "[LEVEL]", "[NIVEAU]", "[УРОВЕНЬ]", "[NÍVEL]"],
};

const normalizedValue = (value) => String(value ?? "").trim();
const validTime = (value) => {
  const match = normalizedValue(value).match(/^(\d{2}):(\d{2})$/);
  return Boolean(match && Number(match[1]) < 24 && Number(match[2]) < 60);
};
const positiveInteger = (value) => /^\d+$/.test(normalizedValue(value)) && Number(value) >= 1;

const fillMessage = (template, values, tokensByField) => {
  let message = String(template ?? "");

  for (const [field, tokens] of Object.entries(tokensByField)) {
    const value = normalizedValue(values[field]);
    if (!value) continue;
    for (const token of tokens) message = message.split(token).join(value);
  }

  return message;
};

export const isZombieSiegeMessageComplete = (values) =>
  validTime(values.time) && positiveInteger(values.level) && positiveInteger(values.baseLevel);

export const fillZombieSiegeMessage = (template, values) => {
  return fillMessage(template, values, zombieSiegeTokens);
};

export const isCityConquestMessageComplete = (values) =>
  validTime(values.time) && positiveInteger(values.cityLevel);

export const fillCityConquestMessage = (template, values) =>
  fillMessage(template, values, cityConquestTokens);

export const isFortressAttackMessageComplete = (values) =>
  validTime(values.time) && positiveInteger(values.fortressLevel);

export const fillFortressAttackMessage = (template, values) =>
  fillMessage(template, values, fortressAttackTokens);

export const isRaidShieldMessageComplete = (values) => validTime(values.time);

export const fillRaidShieldMessage = (template, values) =>
  fillMessage(template, values, raidShieldTokens);

export const isAllianceAmbushMessageComplete = (values) =>
  validTime(values.time) && positiveInteger(values.level);

export const fillAllianceAmbushMessage = (template, values) =>
  fillMessage(template, values, allianceAmbushTokens);
