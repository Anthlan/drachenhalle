const zombieSiegeTokens = {
  time: ["[UHRZEIT]", "[TIME]", "[HEURE]", "[ВРЕМЯ]", "[HORA]"],
  serverTime: ["[SERVERZEIT]", "[SERVER TIME]", "[HEURE SERVEUR]", "[ВРЕМЯ СЕРВЕРА]", "[HORA DO SERVIDOR]"],
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
  serverTime: ["[SERVERZEIT]", "[SERVER TIME]", "[HEURE SERVEUR]", "[ВРЕМЯ СЕРВЕРА]", "[HORÁRIO DO SERVIDOR]"],
  cityLevel: ["[STADTLEVEL]", "[CITY LEVEL]", "[NIVEAU DE VILLE]", "[УРОВЕНЬ ГОРОДА]", "[NÍVEL DA CIDADE]"],
};
const fortressAttackTokens = {
  time: ["[UHRZEIT]", "[TIME]", "[HEURE]", "[ВРЕМЯ]", "[HORÁRIO]"],
  serverTime: ["[SERVERZEIT]", "[SERVER TIME]", "[HEURE SERVEUR]", "[ВРЕМЯ СЕРВЕРА]", "[HORÁRIO DO SERVIDOR]"],
  fortressLevel: ["[FESTUNGSLEVEL]", "[FORTRESS LEVEL]", "[NIVEAU DE FORTERESSE]", "[УРОВЕНЬ КРЕПОСТИ]", "[NÍVEL DA FORTALEZA]"],
};
const raidShieldTokens = {
  time: ["[UHRZEIT]", "[TIME]", "[HEURE]", "[ВРЕМЯ]", "[HORÁRIO]"],
};
const allianceAmbushTokens = {
  time: ["[UHRZEIT]", "[TIME]", "[HEURE]", "[ВРЕМЯ]", "[HORÁRIO]"],
  serverTime: ["[SERVERZEIT]", "[SERVER TIME]", "[HEURE SERVEUR]", "[ВРЕМЯ СЕРВЕРА]", "[HORÁRIO DO SERVIDOR]"],
  level: ["[STUFE]", "[LEVEL]", "[NIVEAU]", "[УРОВЕНЬ]", "[NÍVEL]"],
};

const normalizedValue = (value) => String(value ?? "").trim();
const validTime = (value) => {
  const match = normalizedValue(value).match(/^(\d{2}):(\d{2})$/);
  return Boolean(match && Number(match[1]) < 24 && Number(match[2]) < 60);
};
const positiveInteger = (value) => /^\d+$/.test(normalizedValue(value)) && Number(value) >= 1;

const berlinUtcOffsetHours = (referenceDate) => {
  const date = referenceDate instanceof Date ? referenceDate : new Date(referenceDate ?? Date.now());
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const berlinHour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  return (berlinHour - date.getUTCHours() + 24) % 24;
};

export const serverTimeOffsetHours = (referenceDate = new Date()) =>
  berlinUtcOffsetHours(referenceDate) === 2 ? 4 : 3;

export const calculateServerTime = (localTime, referenceDate = new Date()) => {
  if (!validTime(localTime)) return "";
  const [hours, minutes] = normalizedValue(localTime).split(":").map(Number);
  const serverHours = (hours - serverTimeOffsetHours(referenceDate) + 24) % 24;
  return `${String(serverHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const withServerTime = (values) => ({
  ...values,
  serverTime: normalizedValue(values.serverTime) || calculateServerTime(values.time, values.referenceDate),
});

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
  return fillMessage(template, withServerTime(values), zombieSiegeTokens);
};

export const isCityConquestMessageComplete = (values) =>
  validTime(values.time) && positiveInteger(values.cityLevel);

export const fillCityConquestMessage = (template, values) =>
  fillMessage(template, withServerTime(values), cityConquestTokens);

export const isFortressAttackMessageComplete = (values) =>
  validTime(values.time) && positiveInteger(values.fortressLevel);

export const fillFortressAttackMessage = (template, values) =>
  fillMessage(template, withServerTime(values), fortressAttackTokens);

export const isRaidShieldMessageComplete = (values) => validTime(values.time);

export const fillRaidShieldMessage = (template, values) =>
  fillMessage(template, values, raidShieldTokens);

export const isAllianceAmbushMessageComplete = (values) =>
  validTime(values.time) && positiveInteger(values.level);

export const fillAllianceAmbushMessage = (template, values) =>
  fillMessage(template, withServerTime(values), allianceAmbushTokens);
