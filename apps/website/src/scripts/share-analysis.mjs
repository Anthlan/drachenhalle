// Mark alliance-specific commentary while keeping the public comparison intact.
export function prepareShareAnalysis(html) {
  if (!html.includes('<h2>Unsere Allianz DIE</h2>')) return html;
  return html
    .replace(/<p><strong>S105 bringt[\s\S]*?<\/strong><\/p>/, paragraph => '<div data-alliance-only>' + paragraph + '</div><p data-public-analysis-intro><strong>S105 bringt mehr Spieler in die Rangliste, S97 erzielt deutlich mehr Punkte.</strong></p>')
    .replace(/<h2>Unsere Allianz DIE<\/h2>[\s\S]*?(?=<h2>Datengrundlage<\/h2>)/, section => '<div data-alliance-only>' + section + '</div>');
}
