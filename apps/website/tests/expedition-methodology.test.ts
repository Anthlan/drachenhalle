import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { marked } from "marked";
import methodology from "../src/data/expedition-methodology.json" with { type: "json" };
import { prepareShareAnalysis } from "../src/scripts/share-analysis.mjs";

test("all analysis languages contain the complete interpretation disclaimer", async () => {
  for (const [language, text] of Object.entries(methodology)) {
    const markdown = await readFile(new URL(`../../../content/Drachenwissen/Analysen/${language}/2026_10_10_Expeditionswahnsinn.md`, import.meta.url), "utf8");
    for (const paragraph of text.paragraphs) assert.ok(markdown.includes(paragraph), language);
  }
});

test("reduced sharing retains the disclaimer while hiding DIE commentary", async () => {
  const markdown = await readFile(new URL("../../../content/Drachenwissen/Analysen/de/2026_10_10_Expeditionswahnsinn.md", import.meta.url), "utf8");
  const publicHtml = prepareShareAnalysis(marked.parse(markdown))
    .replace(/<div data-alliance-only>[\s\S]*?<\/div>/g, "");
  for (const paragraph of methodology.de.paragraphs) assert.ok(publicHtml.includes(paragraph));
  assert.ok(!publicHtml.includes("<h2>Unsere Allianz DIE</h2>"));
  assert.ok(publicHtml.includes("<h2>Datengrundlage</h2>"));
});
