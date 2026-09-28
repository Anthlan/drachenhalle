import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDirectory, "..");
const repositoryRoot = path.resolve(siteRoot, "..");
const sourceDirectory = path.join(repositoryRoot, "Karte");
const outputDirectory = path.join(siteRoot, "public", "generated", "map");
const dataPath = path.join(siteRoot, "src", "data", "map.generated.json");
const configurationPath = path.join(sourceDirectory, "GEBIETE.md");
const baseMapPath = path.join(sourceDirectory, "Kartenbasis.webp");
const regionMaskPath = path.join(sourceDirectory, "gebiete.mask.png");

const markdown = await readFile(configurationPath, "utf8");
const rows = markdown
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /^\|\s*G\d{3}\s*\|/.test(line))
  .map((line) => {
    const cells = line.slice(1, -1).split("|").map((cell) => cell.trim());
    const match = cells[0]?.match(/^G(\d{3})$/);
    if (!match) throw new Error(`Ungültige Gebietsnummer: ${cells[0] ?? "(leer)"}`);
    const id = Number(match[1]);
    const name = cells[1] || `Gebiet ${match[1]}`;
    const color = cells[2] || "#9b7b35";
    const note = cells[3] || "";
    if (!/^#[0-9a-f]{6}$/i.test(color)) {
      throw new Error(`Ungültige Farbe für G${match[1]}: ${color}`);
    }
    return { id, code: `G${match[1]}`, name, color, note };
  });

const duplicateIds = rows.filter((row, index) => rows.findIndex((candidate) => candidate.id === row.id) !== index);
if (duplicateIds.length) {
  throw new Error(`Gebiete mehrfach eingetragen: ${[...new Set(duplicateIds.map((row) => row.code))].join(", ")}`);
}

const { data: mask, info } = await sharp(regionMaskPath)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const statistics = new Map();
for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    const offset = (y * info.width + x) * info.channels;
    const id = mask[offset] + (mask[offset + 1] << 8) + (mask[offset + 2] << 16);
    if (!id) continue;
    const current = statistics.get(id) ?? {
      pixels: 0,
      sumX: 0,
      sumY: 0,
      minX: info.width,
      minY: info.height,
      maxX: 0,
      maxY: 0,
    };
    current.pixels += 1;
    current.sumX += x;
    current.sumY += y;
    current.minX = Math.min(current.minX, x);
    current.minY = Math.min(current.minY, y);
    current.maxX = Math.max(current.maxX, x);
    current.maxY = Math.max(current.maxY, y);
    statistics.set(id, current);
  }
}

const maskIds = [...statistics.keys()].sort((first, second) => first - second);
const configuredIds = rows.map((row) => row.id).sort((first, second) => first - second);
const missingConfigurations = maskIds.filter((id) => !configuredIds.includes(id));
const staleConfigurations = configuredIds.filter((id) => !maskIds.includes(id));
if (missingConfigurations.length || staleConfigurations.length) {
  const problems = [
    ...missingConfigurations.map((id) => `Konfiguration fehlt: G${String(id).padStart(3, "0")}`),
    ...staleConfigurations.map((id) => `Gebiet fehlt in Grenzmaske: G${String(id).padStart(3, "0")}`),
  ];
  throw new Error(`Gebietskonfiguration ist nicht vollständig:\n${problems.map((problem) => `- ${problem}`).join("\n")}`);
}

const toGameX = (pixelX) => Math.round(1 + (pixelX / (info.width - 1)) * 998);
const toGameY = (pixelY) => Math.round(1 + ((info.height - 1 - pixelY) / (info.height - 1)) * 998);
const regions = rows
  .sort((first, second) => first.id - second.id)
  .map((row) => {
    const geometry = statistics.get(row.id);
    const centerX = geometry.sumX / geometry.pixels;
    const centerY = geometry.sumY / geometry.pixels;
    return {
      ...row,
      center: {
        pixelX: Math.round(centerX),
        pixelY: Math.round(centerY),
        x: toGameX(centerX),
        y: toGameY(centerY),
      },
      bounds: {
        minX: geometry.minX,
        minY: geometry.minY,
        maxX: geometry.maxX,
        maxY: geometry.maxY,
      },
    };
  });

await mkdir(outputDirectory, { recursive: true });
await mkdir(path.dirname(dataPath), { recursive: true });
await Promise.all([
  copyFile(baseMapPath, path.join(outputDirectory, "kartenbasis.webp")),
  copyFile(regionMaskPath, path.join(outputDirectory, "gebiete-mask.png")),
  writeFile(dataPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    width: info.width,
    height: info.height,
    baseMapUrl: "/drachenhalle/generated/map/kartenbasis.webp",
    maskUrl: "/drachenhalle/generated/map/gebiete-mask.png",
    regions,
  }, null, 2)}\n`, "utf8"),
]);

console.log(`Ratskarte erzeugt: ${regions.length} Gebiete`);
