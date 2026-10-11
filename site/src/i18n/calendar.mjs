// Translate display text only. Dates, timezones, IDs and alarms are unchanged.
export function translateCalendar(source,translate) {
  const decode=value=>value.replace(/\\([nN,;\\])/g,(_,character)=>/[nN]/.test(character)?"\n":character);
  const encode=value=>value.replaceAll("\\","\\\\").replaceAll("\n","\\n").replaceAll(",","\\,").replaceAll(";","\\;");
  return source.replace(/\r?\n[ \t]/g,"").split(/\r?\n/).map(line=> {
    const match=line.match(/^((?:SUMMARY|DESCRIPTION|LOCATION)(?:;[^:]*)?:)(.*)$/);
    return match?match[1]+encode(translate(decode(match[2]))):line;
  }).join("\r\n");
}
