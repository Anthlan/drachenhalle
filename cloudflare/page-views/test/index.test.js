import assert from "node:assert/strict";
import test from "node:test";

import { isAllowedOrigin, normalizePath } from "../src/index.js";

test("normalizes Drachenhalle page paths", () => {
  assert.equal(normalizePath("/drachenhalle"), "/drachenhalle/");
  assert.equal(normalizePath("/drachenhalle/index.html"), "/drachenhalle/");
  assert.equal(normalizePath("/drachenhalle/docs/einstieg"), "/drachenhalle/docs/einstieg/");
  assert.equal(normalizePath("/drachenhalle/favicon.png"), "/drachenhalle/favicon.png");
});

test("rejects paths outside the site", () => {
  assert.equal(normalizePath("/"), null);
  assert.equal(normalizePath("/drachenhalle-kopie/"), null);
  assert.equal(normalizePath(null), null);
});

test("allows only explicitly configured origins", () => {
  const configured = "https://anthlan.github.io, http://localhost:4321";
  assert.equal(isAllowedOrigin("https://anthlan.github.io", configured), true);
  assert.equal(isAllowedOrigin("http://localhost:4321", configured), true);
  assert.equal(isAllowedOrigin("https://example.com", configured), false);
  assert.equal(isAllowedOrigin(null, configured), false);
});
