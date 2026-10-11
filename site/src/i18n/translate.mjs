export const normalizeText = (text) => text.replace(/\s+/g, " ").trim();

export function createTranslator(catalog, locale = "en-GB") {
  const normalized = new Map(Object.entries(catalog).map(([key, value]) => [normalizeText(key), value]));
  const templates = Object.entries(catalog).filter(([key]) => key.includes("${"))
    .map(([key, value]) => {
      const names = [...key.matchAll(/\$\{([^}]+)\}/g)].map(match => match[1]);
      const pattern = key.split(/\$\{[^}]+\}/g).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("([\\s\\S]*?)");
      return { regex: new RegExp(`^${pattern}$`), names, value, specificity:key.replace(/\$\{[^}]+\}/g,"").length };
    }).sort((left,right)=>right.specificity-left.specificity);
  return function translate(text,depth=0) {
    const clean = normalizeText(text);
    if (!clean) return text;
    let result = catalog[text] ?? normalized.get(clean);
    if(result===undefined&&clean.includes(" · ")) {
      const parts=clean.split(" · ");
      const translatedParts=parts.map(part=>normalized.get(part)??part);
      if(parts.some((part,index)=>part!==translatedParts[index]))result=translatedParts.join(" · ");
    }
    if (result === undefined) {
      for (const template of templates) {
        const match = clean.match(template.regex);
        if (!match) continue;
        result = template.value.replace(/\$\{([^}]+)\}/g, (_, name) => {
          const captured=match[template.names.indexOf(name)+1]??"";
          return depth<3?translate(captured,depth+1):captured;
        });
        break;
      }
    }
    if (result === undefined && clean.includes(" · ")) {
      result = clean.split(" · ").map(part => depth<3?translate(part,depth+1):(normalized.get(part)??part)).join(" · ");
    }
    if (result === undefined && /^(?:← |→ )/.test(clean)) {
      result = clean.slice(0, 2) + (normalized.get(clean.slice(2)) ?? clean.slice(2));
    }
    if(result===undefined) {
      const months=["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
      let localized=clean.replace(new RegExp(`(?:(Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag), )?(\\d{1,2})\\. (${months.join("|")}) (\\d{4})`,"g"),(_,weekday,day,month,year)=> {
        const date=new Date(Date.UTC(Number(year),months.indexOf(month),Number(day)));
        return new Intl.DateTimeFormat(locale,{...(weekday?{weekday:"long"}:{}),day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(date);
      }).replace(/(\d{2}:\d{2}(?:–\d{2}:\d{2})?) Uhr/g,"$1");
      if(/^\d{1,3}(?:\.\d{3})+$/.test(localized))localized=new Intl.NumberFormat(locale).format(Number(localized.replaceAll(".","")));
      if(/^\d+,\d+\s*%$/.test(localized))localized=new Intl.NumberFormat(locale,{maximumFractionDigits:6}).format(Number(localized.replace(/\s*%$/,"").replace(",",".")))+" %";
      if(localized!==clean)result=localized;
    }
    if (result === undefined) return text;
    const leading = text.match(/^\s*/)[0];
    const trailing = text.match(/\s*$/)[0];
    return leading + result.trim() + trailing;
  };
}

export function localizedPageUrl(url, language, base = "/drachenhalle", languages = ["de", "en"], defaultLanguage = "de") {
  const siteOrigin="https://anthlan.github.io";
  if(url.startsWith(siteOrigin+base+"/")||url===siteOrigin+base)return siteOrigin+localizedPageUrl(url.slice(siteOrigin.length),language,base,languages,defaultLanguage);
  if (!url.startsWith(base + "/") && url !== base) return url;
  const remainder = url.slice(base.length);
  const first = remainder.split("/")[1];
  const suffix = languages.includes(first) ? remainder.slice(first.length + 1) : remainder;
  // Assets are shared across languages. Only document routes are localized.
  if (/^\/(?:_astro|brand|generated|tutorial|news|favicon)(?:\/|\.)/.test(suffix) || /\.[a-z0-9]+(?:[?#].*)?$/i.test(suffix)) return url;
  return `${base}${language === defaultLanguage ? "" : "/" + language}${suffix || "/"}`;
}
