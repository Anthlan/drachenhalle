import { defineConfig } from "astro/config";
import localizedBuild from "./scripts/localized-build.mjs";

export default defineConfig({
  site: "https://anthlan.github.io",
  base: "/drachenhalle",
  output: "static",
  integrations: [localizedBuild()],
});
