import test from "node:test";
import assert from "node:assert/strict";

import {
  contentIsRequiredInLanguage,
  declaredContentLanguages,
} from "../scripts/content-languages.mjs";

test("content without a language declaration remains required everywhere", () => {
  const source = "# Gemeinsamer Inhalt\n";
  assert.equal(declaredContentLanguages(source), null);
  assert.equal(contentIsRequiredInLanguage(source, "fr"), true);
});

test("inline language declarations limit intentionally local content", () => {
  const source = "---\nlanguages: [de]\n---\n\n# Deutsche Ankündigung\n";
  assert.deepEqual(declaredContentLanguages(source), ["de"]);
  assert.equal(contentIsRequiredInLanguage(source, "de"), true);
  assert.equal(contentIsRequiredInLanguage(source, "en"), false);
});

test("block language declarations support staged translations", () => {
  const source = "---\nlanguages:\n  - de\n  - fr\n---\n\n# Inhalt\n";
  assert.deepEqual(declaredContentLanguages(source), ["de", "fr"]);
  assert.equal(contentIsRequiredInLanguage(source, "fr"), true);
  assert.equal(contentIsRequiredInLanguage(source, "pt"), false);
});
