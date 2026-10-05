import crypto from "node:crypto";
import { mkdir, readFile, readdir, stat, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import { loadContentVisibility } from "./content-visibility.mjs";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(siteRoot, "..");
const outputDirectory = path.join(siteRoot, "public", "generated", "gallery");
const documentOutputDirectory = path.join(siteRoot, "public", "generated", "documents");
const dataFile = path.join(siteRoot, "src", "data", "gallery.generated.json");
const documentImageDataFile = path.join(siteRoot, "src", "data", "document-images.generated.json");
const styleIndexFile = path.join(repositoryRoot, "Galerie", "STILINDEX.md");
const avatarSetIndexFile = path.join(repositoryRoot, "Galerie", "Avatare", "SETINDEX.md");
const modelSetIndexFile = path.join(repositoryRoot, "Galerie", "Charaktermodelle", "SETINDEX.md");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const validStyles = new Set(["S1", "S2", "S3", "S4"]);

const contentAreas = [
  ["Drachenwissen/Tipps", "Tipp"],
  ["Drachenwissen/Events", "Event"],
  ["Drachenwissen/Eventankuendigungen", "Allianz"],
  ["Drachenwissen/Anleitungen", "Anleitung"],
  ["Allianz", "Allianz"],
  ["Drachenwissen/Strategien", "Strategie"],
  ["Drachenwissen/Analysen", "Analyse"],
  ["Galerie/Avatare", "Avatar"],
  ["Galerie/Charaktermodelle", "Charaktermodell"],
  ["Galerie/Chatbilder", "Chatbild"],
  ["Galerie/Reaktionsbilder", "Reaktionsbild"],
  ["Styleguides", "Stilguide"],
];

const knownPeople = [
  "Anthlan",
  "Bertpfanne",
  "Boshos",
  "ButterflySong",
  "DaVinci1986",
  "Drachenherz",
  "Helltrain",
  "Hitmann",
  "Hulkster666",
  "Kaylani",
  "Killergruppe",
  "Korpi92",
  "Lordmirko",
  "Odin71",
  "Odin81",
  "RuhrpottBlach",
  "Skibbi",
  "Somea",
  "Streetjudge",
  "Thor63",
  "mysteryZ",
];
const canonicalPeople = new Map(knownPeople.map((person) => [person.toLowerCase(), person]));

const transliterations = new Map([
  ["Raubzugkaempfe", "Raubzugkämpfe"],
  ["Zuendeln", "Zündeln"],
  ["Zurueck", "Zurück"],
  ["Allianzgespraech", "Allianzgespräch"],
  ["Koelsch", "Kölsch"],
  ["Krokodiltraenen", "Krokodiltränen"],
  ["Buero", "Büro"],
  ["Gaertner", "Gärtner"],
  ["Waechter", "Wächter"],
  ["Haende", "Hände"],
  ["Jaeger", "Jäger"],
  ["Aerger", "Ärger"],
  ["Faehigkeiten", "Fähigkeiten"],
  ["Erklaeren", "Erklären"],
  ["Verbuendete", "Verbündete"],
]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(entryPath)));
    if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) files.push(entryPath);
  }

  return files;
}

async function loadStyleIndex() {
  const content = await readFile(styleIndexFile, "utf8");
  const styles = [];
  const labels = new Map();
  const assignments = new Map();
  let currentStyle = null;

  for (const line of content.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(S\d+)\s+[–-]\s+(.+?)\s*$/);
    if (heading) {
      const [, value, label] = heading;
      if (!validStyles.has(value)) {
        throw new Error(`Ungültiger Stil ${value} im STILINDEX.md. Erlaubt sind ausschließlich S1, S2, S3 und S4.`);
      }
      if (labels.has(value)) throw new Error(`Stil ${value} ist im STILINDEX.md mehrfach definiert.`);

      currentStyle = value;
      labels.set(value, label);
      styles.push({ value, label });
      continue;
    }

    const imageLink = currentStyle && line.match(/^\s*-\s+\[[^\]]+\]\(([^)]+)\)\s*$/);
    if (!imageLink) continue;

    const linkedPath = decodeURIComponent(imageLink[1]).replaceAll("\\", "/");
    const sourcePath = path.posix.normalize(`Galerie/${linkedPath}`);
    if (!sourcePath.startsWith("Galerie/Chatbilder/") && !sourcePath.startsWith("Galerie/Reaktionsbilder/")) {
      throw new Error(`Ungültiger Bildpfad im STILINDEX.md: ${linkedPath}`);
    }
    if (assignments.has(sourcePath)) {
      throw new Error(`${sourcePath} ist im STILINDEX.md mehrfach zugeordnet.`);
    }
    assignments.set(sourcePath, currentStyle);
  }

  const missingStyleGroups = [...validStyles].filter((style) => !labels.has(style));
  if (missingStyleGroups.length) {
    throw new Error(`Im STILINDEX.md fehlen Stilgruppen: ${missingStyleGroups.join(", ")}.`);
  }
  return { assignments, labels, styles };
}

async function loadSetIndex({ indexFile, codePrefix, sourceDirectory, seriesName }) {
  const content = await readFile(indexFile, "utf8");
  const sets = [];
  const assignments = new Map();
  let currentSet = null;
  const headingPattern = new RegExp(`^##\\s+(${codePrefix}\\d+)\\s+[–-]\\s+(.+?)\\s*$`);

  for (const line of content.split(/\r?\n/)) {
    const heading = line.match(headingPattern);
    if (heading) {
      const [, value, label] = heading;
      if (sets.some((set) => set.value === value)) {
        throw new Error(`${seriesName} ${value} ist im SETINDEX.md mehrfach definiert.`);
      }

      currentSet = { value, label, status: "", description: "" };
      sets.push(currentSet);
      continue;
    }

    if (!currentSet) continue;

    const status = line.match(/^-\s+\*\*Status:\*\*\s+(.+?)\s*$/);
    if (status) {
      currentSet.status = status[1];
      continue;
    }

    const description = line.match(/^-\s+\*\*Beschreibung:\*\*\s+(.+?)\s*$/);
    if (description) {
      currentSet.description = description[1];
      continue;
    }

    const imageLink = line.match(/^\s*-\s+\[[^\]]+\]\(([^)]+)\)\s*$/);
    if (!imageLink) continue;

    const linkedPath = decodeURIComponent(imageLink[1]).replaceAll("\\", "/");
    const sourcePath = path.posix.normalize(`${sourceDirectory}/${linkedPath}`);
    if (!sourcePath.startsWith(`${sourceDirectory}/`) || path.posix.dirname(sourcePath) !== sourceDirectory) {
      throw new Error(`Ungültiger Bildpfad im SETINDEX.md für ${seriesName}: ${linkedPath}`);
    }
    if (assignments.has(sourcePath)) {
      throw new Error(`${sourcePath} ist im SETINDEX.md mehrfach zugeordnet.`);
    }
    assignments.set(sourcePath, currentSet.value);
  }

  if (!sets.length) throw new Error(`Im SETINDEX.md sind keine Einträge für ${seriesName} definiert.`);
  for (const set of sets) {
    if (!set.status || !set.description) {
      throw new Error(`${seriesName} ${set.value} benötigt Status und Beschreibung.`);
    }
  }

  return {
    assignments,
    sets,
    labels: new Map(sets.map((set) => [set.value, set.label])),
    statuses: new Map(sets.map((set) => [set.value, set.status])),
  };
}

function humanize(value, legacy = false) {
  if (!legacy && value === "Waechter130 VierHaendeEinSieg") return "Wächter 130 – Vier Hände, ein Sieg";
  let normalized = value;
  for (const [source, replacement] of transliterations) {
    if (legacy && source === "Haende") continue;
    normalized = normalized.replaceAll(source, replacement);
  }

  return normalized
    .replaceAll("_", " ")
    .replace(/([A-ZÄÖÜ]+)([A-ZÄÖÜ][a-zäöüß])/g, "$1 $2")
    .replace(/([a-zäöüß])([A-ZÄÖÜ0-9])/g, "$1 $2")
    .replace(/([0-9])([A-Za-zÄÖÜäöüß])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 52);
}

function parseMetadata(sourcePath, defaultCategory) {
  const category = defaultCategory;
  const baseName = path.basename(sourcePath, path.extname(sourcePath));
  const tokens = baseName.split("_").filter(Boolean);
  const dateIndex = tokens.findIndex((token, index) =>
    /^20\d{2}$/.test(token)
      && /^(0[1-9]|1[0-2])$/.test(tokens[index + 1] ?? "")
      && /^(0[1-9]|[12]\d|3[01])$/.test(tokens[index + 2] ?? "")
      && /^\d{4}$/.test(tokens[index + 3] ?? ""),
  );

  let date = null;
  let time = null;
  if (dateIndex >= 0) {
    const [year, month, day, clock] = tokens.splice(dateIndex, 4);
    date = `${year}-${month}-${day}`;
    time = `${clock.slice(0, 2)}:${clock.slice(2)}`;
  }

  const versionIndex = tokens.findIndex((token) => /^v\d+$/i.test(token));
  const version = versionIndex >= 0 ? Number(tokens.splice(versionIndex, 1)[0].slice(1)) : null;
  const people = [];

  if ((category === "Avatar" || category === "Charaktermodell") && canonicalPeople.has(tokens[0]?.toLowerCase())) {
    people.push(canonicalPeople.get(tokens.shift().toLowerCase()));
  }

  while (tokens.length && canonicalPeople.has(tokens.at(-1).toLowerCase())) {
    people.unshift(canonicalPeople.get(tokens.pop().toLowerCase()));
  }

  let title;
  if (category === "Avatar") {
    title = `${people[0] ?? humanize(tokens[0] ?? "Unbekannt")} – Avatar`;
  } else if (category === "Charaktermodell" && people.length) {
    title = `${people[0]} – ${humanize(tokens.join(" ") || "Referenzmodell")}`;
  } else {
    title = humanize(tokens.join(" ") || baseName);
  }

  if (version) title += ` · Version ${version}`;

  const legacyTitle = ["Avatar", "Charaktermodell"].includes(category)
    ? title
    : humanize(tokens.join(" ") || baseName, true) + (version ? ` · Version ${version}` : "");
  return { category, date, people, time, title, legacyTitle, version };
}

async function loadPreviousItems() {
  try {
    const data = JSON.parse(await readFile(dataFile, "utf8"));
    return new Map(data.items.map((item) => [item.sourcePath, item]));
  } catch {
    return new Map();
  }
}

async function loadPreviousDocumentImages() {
  try {
    const data = JSON.parse(await readFile(documentImageDataFile, "utf8"));
    return new Map(data.items.map((item) => [item.sourcePath, item]));
  } catch {
    return new Map();
  }
}

async function mapWithConcurrency(values, concurrency, worker) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await worker(values[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, run));
  return results;
}

await mkdir(outputDirectory, { recursive: true });
await mkdir(documentOutputDirectory, { recursive: true });
await mkdir(path.dirname(dataFile), { recursive: true });

const previousItems = await loadPreviousItems();
const previousDocumentImages = await loadPreviousDocumentImages();
const styleIndex = await loadStyleIndex();
const avatarSetIndex = await loadSetIndex({
  indexFile: avatarSetIndexFile,
  codePrefix: "A",
  sourceDirectory: "Galerie/Avatare",
  seriesName: "Avatar-Serie",
});
const modelSetIndex = await loadSetIndex({
  indexFile: modelSetIndexFile,
  codePrefix: "M",
  sourceDirectory: "Galerie/Charaktermodelle",
  seriesName: "Modell-Serie",
});
const contentVisibility = await loadContentVisibility(repositoryRoot);
const sources = [];

for (const [directory, category] of contentAreas) {
  const absoluteDirectory = path.join(repositoryRoot, directory);
  for (const absolutePath of await walk(absoluteDirectory)) {
    const relativePath = path.relative(repositoryRoot, absolutePath).split(path.sep).join("/");
    if (contentVisibility.hiddenOnlyImages.has(relativePath)) continue;
    sources.push({ absolutePath, category, relativePath });
  }
}

const sourcePathCounts = new Map();
for (const { relativePath } of sources) {
  sourcePathCounts.set(relativePath, (sourcePathCounts.get(relativePath) ?? 0) + 1);
}
const duplicateSourcePaths = [...sourcePathCounts].filter(([, count]) => count > 1).map(([sourcePath]) => sourcePath);
if (duplicateSourcePaths.length) {
  throw new Error(`Bilder wurden mehrfach erfasst:\n${duplicateSourcePaths.map((sourcePath) => `- ${sourcePath}`).join("\n")}`);
}

const styledSourcePaths = new Set(
  sources
    .map(({ relativePath }) => relativePath)
    .filter((relativePath) =>
      relativePath.startsWith("Galerie/Chatbilder/") || relativePath.startsWith("Galerie/Reaktionsbilder/"),
    ),
);
const missingStyleAssignments = [...styledSourcePaths].filter((sourcePath) => !styleIndex.assignments.has(sourcePath));
const orphanedStyleAssignments = [...styleIndex.assignments.keys()].filter((sourcePath) => !styledSourcePaths.has(sourcePath));

if (missingStyleAssignments.length || orphanedStyleAssignments.length) {
  const issues = [
    ...missingStyleAssignments.map((sourcePath) => `Stil fehlt: ${sourcePath}`),
    ...orphanedStyleAssignments.map((sourcePath) => `Bild fehlt: ${sourcePath}`),
  ];
  throw new Error(`STILINDEX.md ist nicht vollständig:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
}

const avatarSourcePaths = new Set(
  sources.filter(({ category }) => category === "Avatar").map(({ relativePath }) => relativePath),
);
const missingAvatarSetAssignments = [...avatarSourcePaths].filter(
  (sourcePath) => !avatarSetIndex.assignments.has(sourcePath),
);
const orphanedAvatarSetAssignments = [...avatarSetIndex.assignments.keys()].filter(
  (sourcePath) => !avatarSourcePaths.has(sourcePath),
);

if (missingAvatarSetAssignments.length || orphanedAvatarSetAssignments.length) {
  const issues = [
    ...missingAvatarSetAssignments.map((sourcePath) => `Avatar-Serie fehlt: ${sourcePath}`),
    ...orphanedAvatarSetAssignments.map((sourcePath) => `Avatar fehlt: ${sourcePath}`),
  ];
  throw new Error(`SETINDEX.md ist nicht vollständig:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
}

const modelSourcePaths = new Set(
  sources.filter(({ category }) => category === "Charaktermodell").map(({ relativePath }) => relativePath),
);
const missingModelSetAssignments = [...modelSourcePaths].filter(
  (sourcePath) => !modelSetIndex.assignments.has(sourcePath),
);
const orphanedModelSetAssignments = [...modelSetIndex.assignments.keys()].filter(
  (sourcePath) => !modelSourcePaths.has(sourcePath),
);

if (missingModelSetAssignments.length || orphanedModelSetAssignments.length) {
  const issues = [
    ...missingModelSetAssignments.map((sourcePath) => `Modell-Serie fehlt: ${sourcePath}`),
    ...orphanedModelSetAssignments.map((sourcePath) => `Charaktermodell fehlt: ${sourcePath}`),
  ];
  throw new Error(`SETINDEX.md der Charaktermodelle ist nicht vollständig:\n${issues.map((issue) => `- ${issue}`).join("\n")}`);
}

const items = await mapWithConcurrency(sources, 3, async ({ absolutePath, category, relativePath }) => {
  const fileStats = await stat(absolutePath);
  const fingerprint = `${fileStats.size}-${Math.trunc(fileStats.mtimeMs)}`;
  const metadata = parseMetadata(relativePath, category);
  const style = styleIndex.assignments.get(relativePath) ?? null;
  const styleLabel = style ? styleIndex.labels.get(style) : null;
  const avatarSet = avatarSetIndex.assignments.get(relativePath) ?? null;
  const avatarSetLabel = avatarSet ? avatarSetIndex.labels.get(avatarSet) : null;
  const avatarSetStatus = avatarSet ? avatarSetIndex.statuses.get(avatarSet) : null;
  const modelSet = modelSetIndex.assignments.get(relativePath) ?? null;
  const modelSetLabel = modelSet ? modelSetIndex.labels.get(modelSet) : null;
  const modelSetStatus = modelSet ? modelSetIndex.statuses.get(modelSet) : null;
  const series = avatarSet ?? modelSet;
  const seriesLabel = avatarSetLabel ?? modelSetLabel;
  const seriesStatus = avatarSetStatus ?? modelSetStatus;
  const seriesType = avatarSet ? "Avatar-Serie" : modelSet ? "Modell-Serie" : null;
  const hash = crypto.createHash("sha1").update(relativePath).digest("hex").slice(0, 8);
  const id = `${slugify(metadata.legacyTitle) || "bild"}-${hash}`;
  const thumbnailName = `${id}-thumb.webp`;
  const webName = `${id}-web.webp`;
  const thumbnailPath = path.join(outputDirectory, thumbnailName);
  const webPath = path.join(outputDirectory, webName);
  const previous = previousItems.get(relativePath);
  let width = previous?.width ?? null;
  let height = previous?.height ?? null;

  let outputsExist = true;
  try {
    await Promise.all([stat(thumbnailPath), stat(webPath)]);
  } catch {
    outputsExist = false;
  }

  if (previous?.fingerprint !== fingerprint || !outputsExist) {
    const image = sharp(absolutePath, { failOn: "warning" }).rotate();
    const sourceMetadata = await image.metadata();
    width = sourceMetadata.width ?? null;
    height = sourceMetadata.height ?? null;

    await Promise.all([
      image.clone().resize({ width: 480, withoutEnlargement: true }).webp({ quality: 68, effort: 5 }).toFile(thumbnailPath),
      image.clone().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(webPath),
    ]);
  }

  const encodedSourcePath = relativePath.split("/").map(encodeURIComponent).join("/");

  return {
    id,
    ...metadata,
    style,
    styleLabel,
    avatarSet,
    avatarSetLabel,
    avatarSetStatus,
    modelSet,
    modelSetLabel,
    modelSetStatus,
    series,
    seriesLabel,
    seriesStatus,
    seriesType,
    width,
    height,
    fingerprint,
    originalBytes: fileStats.size,
    sourcePath: relativePath,
    repositoryUrl: `https://github.com/Anthlan/drachenhalle/blob/main/${encodedSourcePath}`,
    thumbnailUrl: `/drachenhalle/generated/gallery/${thumbnailName}`,
    webUrl: `/drachenhalle/generated/gallery/${webName}`,
  };
});

items.sort((left, right) => {
  const leftDate = `${left.date ?? "0000-00-00"}T${left.time ?? "00:00"}`;
  const rightDate = `${right.date ?? "0000-00-00"}T${right.time ?? "00:00"}`;
  return rightDate.localeCompare(leftDate) || left.title.localeCompare(right.title, "de");
});

const expectedOutputs = new Set(items.flatMap((item) => [path.basename(item.thumbnailUrl), path.basename(item.webUrl)]));
for (const output of await readdir(outputDirectory)) {
  if (!expectedOutputs.has(output)) await unlink(path.join(outputDirectory, output));
}

const generatedBytes = (
  await Promise.all([...expectedOutputs].map(async (file) => (await stat(path.join(outputDirectory, file))).size))
).reduce((sum, size) => sum + size, 0);

const hiddenDocumentSources = [...contentVisibility.hiddenOnlyImages]
  .filter((sourcePath) => imageExtensions.has(path.posix.extname(sourcePath).toLowerCase()))
  .map((sourcePath) => ({
    absolutePath: path.join(repositoryRoot, ...sourcePath.split("/")),
    sourcePath,
  }));

const documentImages = await mapWithConcurrency(hiddenDocumentSources, 3, async ({ absolutePath, sourcePath }) => {
  const fileStats = await stat(absolutePath);
  const fingerprint = `${fileStats.size}-${Math.trunc(fileStats.mtimeMs)}`;
  const hash = crypto.createHash("sha1").update(sourcePath).digest("hex").slice(0, 10);
  const webName = `${slugify(path.posix.basename(sourcePath, path.posix.extname(sourcePath))) || "bild"}-${hash}-web.webp`;
  const webPath = path.join(documentOutputDirectory, webName);
  const previous = previousDocumentImages.get(sourcePath);
  let width = previous?.width ?? null;
  let height = previous?.height ?? null;

  let outputExists = true;
  try {
    await stat(webPath);
  } catch {
    outputExists = false;
  }

  if (previous?.fingerprint !== fingerprint || !outputExists) {
    const image = sharp(absolutePath, { failOn: "warning" }).rotate();
    const sourceMetadata = await image.metadata();
    width = sourceMetadata.width ?? null;
    height = sourceMetadata.height ?? null;
    await image.resize({ width: 1440, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(webPath);
  }

  return {
    sourcePath,
    webUrl: `/drachenhalle/generated/documents/${webName}`,
    width,
    height,
    fingerprint,
  };
});

const expectedDocumentOutputs = new Set(documentImages.map((item) => path.basename(item.webUrl)));
for (const output of await readdir(documentOutputDirectory)) {
  if (!expectedDocumentOutputs.has(output)) await unlink(path.join(documentOutputDirectory, output));
}

await writeFile(
  documentImageDataFile,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), items: documentImages }, null, 2)}\n`,
  "utf8",
);

const galleryData = {
  generatedAt: new Date().toISOString(),
  imageCount: items.length,
  originalBytes: items.reduce((sum, item) => sum + item.originalBytes, 0),
  generatedBytes,
  styles: styleIndex.styles.map((style) => ({
    ...style,
    count: items.filter((item) => item.style === style.value).length,
  })),
  avatarSets: avatarSetIndex.sets.map((set) => ({
    ...set,
    count: items.filter((item) => item.avatarSet === set.value).length,
  })),
  modelSets: modelSetIndex.sets.map((set) => ({
    ...set,
    count: items.filter((item) => item.modelSet === set.value).length,
  })),
  series: [
    ...avatarSetIndex.sets.map((set) => ({
      ...set,
      type: "Avatar-Serie",
      count: items.filter((item) => item.avatarSet === set.value).length,
    })),
    ...modelSetIndex.sets.map((set) => ({
      ...set,
      type: "Modell-Serie",
      count: items.filter((item) => item.modelSet === set.value).length,
    })),
  ],
  items,
};

await writeFile(dataFile, `${JSON.stringify(galleryData, null, 2)}\n`, "utf8");

const megabytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
console.log(
  `Gallery ready: ${items.length} originals (${megabytes(galleryData.originalBytes)}) → ${items.length * 2} web assets (${megabytes(generatedBytes)}); ${documentImages.length} hidden document assets`,
);
