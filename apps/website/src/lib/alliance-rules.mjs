/** Preserve the semantic table and expose the column context on narrow screens. */
export function responsiveSanctionsTable(value) {
  return value.replace(/<table>([\s\S]*?)<\/table>/g, (_match, body) => {
    const headers = [...body.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map(match => match[1]);
    return `<div class="rules-table-wrap"><table>${body.replace(/<tr>([\s\S]*?)<\/tr>/g, (row, cells) => {
      if (!cells.includes("<td>")) return row;
      let index = 0;
      return `<tr>${cells.replace(/<td>([\s\S]*?)<\/td>/g, (_cell, content) => {
        const label = index > 0 ? `<span class="rules-cell-label" aria-hidden="true">${headers[index] ?? ""}</span>` : "";
        index++;
        return `<td>${label}${content}</td>`;
      })}</tr>`;
    })}</table></div>`;
  });
}

export function prepareRulesContent(html) {
  const parts = html.split(/(?=<h2\b)/);
  const intro = parts.shift();
  const ranks = parts[4] ?? "";
  const rankHeading = ranks.match(/^<h2[^>]*>[\s\S]*?<\/h2>/)?.[0] ?? "";
  return {
    intro,
    combat: parts.slice(0, 4),
    rankHeading,
    rankCards: ranks.slice(rankHeading.length).split(/(?=<h3\b)/).filter(part => part.trim()),
    community: parts[5] ?? "",
    sanctions: parts[6] ?? "",
    membership: parts[7] ?? "",
  };
}

export const ruleSubheading = value => value.replace(/<h2\b/g, "<h3").replace(/<\/h2>/g, "</h3>");

export function prepareRulesCopySections(sections) {
  return sections.map(section => {
    const heading = section.match(/^<h2[^>]*>([\s\S]*?)<\/h2>/);
    return {heading: heading?.[1] ?? "", html: section.slice(heading?.[0].length ?? 0)};
  });
}
