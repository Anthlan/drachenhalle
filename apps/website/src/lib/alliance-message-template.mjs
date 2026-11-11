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
