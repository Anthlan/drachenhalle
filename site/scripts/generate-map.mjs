import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDirectory, "..");
const repositoryRoot = path.resolve(siteRoot, "..");
const sourceDirectory = path.join(repositoryRoot, "Karte");
const dataPath = path.join(siteRoot, "src", "data", "map.generated.json");
const configurationPath = path.join(sourceDirectory, "GEBIETE.md");
const boundariesPath = path.join(sourceDirectory, "GRENZEN.md");
const regionMaskPath = path.join(sourceDirectory, "gebiete.mask.png");
const vectorSize = 1000;
const geometryWidth = 300;
const geometrySize = 1000;

const markdown = await readFile(configurationPath, "utf8");
const boundariesMarkdown = await readFile(boundariesPath, "utf8");
const rows = markdown
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /^\|\s*G\d{3}\s*\|/.test(line))
  .map((line) => {
    const cells = line.slice(1, -1).split("|").map((cell) => cell.trim());
    const match = cells[0]?.match(/^G(\d{3})$/);
    if (!match) throw new Error(`Ungültige Gebietsnummer: ${cells[0] ?? "(leer)"}`);
    const id = Number(match[1]);
    const cityLevel = cells[1] || "?";
    const alliance = cells[2] || "Unbekannt";
    const color = cells[3] || "#9b7b35";
    if (!/^(?:[1-7]|\?)$/.test(cityLevel)) {
      throw new Error(`Ungültiges Stadtlevel für G${match[1]}: ${cityLevel}. Erlaubt sind 1 bis 7 oder ?.`);
    }
    if (!/^#[0-9a-f]{6}$/i.test(color)) {
      throw new Error(`Ungültige Farbe für G${match[1]}: ${color}`);
    }
    return { id, code: `G${match[1]}`, cityLevel, alliance, color };
  });

const duplicateIds = rows.filter((row, index) => rows.findIndex((candidate) => candidate.id === row.id) !== index);
if (duplicateIds.length) {
  throw new Error(`Gebiete mehrfach eingetragen: ${[...new Set(duplicateIds.map((row) => row.code))].join(", ")}`);
}

const manualBoundaries = boundariesMarkdown
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /^\|\s*G\d{3}\s*\|/.test(line))
  .map((line) => {
    const cells = line.slice(1, -1).split("|").map((cell) => cell.trim());
    const match = cells[0]?.match(/^G(\d{3})$/);
    if (!match) throw new Error(`Ungültige Gebietsnummer in GRENZEN.md: ${cells[0] ?? "(leer)"}`);
    const id = Number(match[1]);
    const points = (cells[2] || "").split(";").map((point) => {
      const pointMatch = point.trim().match(/^(\d{1,4})\s*,\s*(\d{1,4})$/);
      if (!pointMatch) throw new Error(`Ungültiger Eckpunkt für G${match[1]}: ${point.trim() || "(leer)"}`);
      const x = Number(pointMatch[1]);
      const y = Number(pointMatch[2]);
      if (x < 0 || x > 1000 || y < 0 || y > 1000) {
        throw new Error(`Eckpunkt außerhalb der Kartenfläche für G${match[1]}: ${x},${y}`);
      }
      return { x, y };
    });
    if (points.length < 4) throw new Error(`G${match[1]} benötigt mindestens vier Eckpunkte.`);
    return { id, code: `G${match[1]}`, label: cells[1] || `Gebiet G${match[1]}`, points };
  });

const duplicateBoundaries = manualBoundaries.filter((boundary, index) => manualBoundaries.findIndex((candidate) => candidate.id === boundary.id) !== index);
if (duplicateBoundaries.length) {
  throw new Error(`Manuelle Grenzen mehrfach eingetragen: ${[...new Set(duplicateBoundaries.map((boundary) => boundary.code))].join(", ")}`);
}

const unknownBoundaryIds = manualBoundaries.filter((boundary) => !rows.some((row) => row.id === boundary.id));
if (unknownBoundaryIds.length) {
  throw new Error(`Manuelle Grenze ohne Gebietskonfiguration: ${unknownBoundaryIds.map((boundary) => boundary.code).join(", ")}`);
}

const { data: mask, info } = await sharp(regionMaskPath)
  .resize({ width: geometryWidth, kernel: "nearest" })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const rawIdAt = (x, y) => {
  if (x < 0 || y < 0 || x >= info.width || y >= info.height) return 0;
  const offset = (y * info.width + x) * info.channels;
  return mask[offset] + (mask[offset + 1] << 8) + (mask[offset + 2] << 16);
};

// Die Screenshots enthalten Beschriftungen, Minikarten und andere HUD-Elemente.
// Dadurch besitzt die extrahierte Maske Lücken innerhalb der eigentlichen Gebiete.
// Eine Mehrquellen-Flutung ordnet jede leere Rasterzelle dem nächstgelegenen
// erkannten Gebiet zu. So bleiben die klaren, rechtwinkligen Grenzverläufe erhalten,
// ohne dass verdeckte HUD-Flächen als Löcher in der Vektorkarte erscheinen.
const cleanedIds = new Uint32Array(info.width * info.height);
const queue = new Int32Array(info.width * info.height);
let queueStart = 0;
let queueEnd = 0;

for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    const index = y * info.width + x;
    const id = rawIdAt(x, y);
    cleanedIds[index] = id;
    if (id) queue[queueEnd++] = index;
  }
}

while (queueStart < queueEnd) {
  const index = queue[queueStart++];
  const id = cleanedIds[index];
  const x = index % info.width;
  const y = Math.floor(index / info.width);
  const neighbours = [
    x > 0 ? index - 1 : -1,
    x + 1 < info.width ? index + 1 : -1,
    y > 0 ? index - info.width : -1,
    y + 1 < info.height ? index + info.width : -1,
  ];
  for (const neighbour of neighbours) {
    if (neighbour < 0 || cleanedIds[neighbour]) continue;
    cleanedIds[neighbour] = id;
    queue[queueEnd++] = neighbour;
  }
}

const sourceIdAt = (x, y) => {
  if (x < 0 || y < 0 || x >= info.width || y >= info.height) return 0;
  return cleanedIds[y * info.width + x];
};

const pointInPolygon = (pointX, pointY, points) => {
  let inside = false;
  for (let current = 0, previous = points.length - 1; current < points.length; previous = current++) {
    const first = points[current];
    const second = points[previous];
    const crosses = (first.y > pointY) !== (second.y > pointY)
      && pointX < ((second.x - first.x) * (pointY - first.y)) / (second.y - first.y) + first.x;
    if (crosses) inside = !inside;
  }
  return inside;
};

const idAt = (x, y) => {
  if (x < 0 || y < 0 || x >= geometrySize || y >= geometrySize) return 0;
  const gameX = x + 0.5;
  const gameY = geometrySize - (y + 0.5);
  const manualBoundary = manualBoundaries.find((boundary) => pointInPolygon(gameX, gameY, boundary.points));
  const sourceX = Math.min(info.width - 1, Math.floor((x / geometrySize) * info.width));
  const sourceY = Math.min(info.height - 1, Math.floor((y / geometrySize) * info.height));
  return manualBoundary?.id ?? sourceIdAt(sourceX, sourceY);
};

const statistics = new Map();
for (let y = 0; y < geometrySize; y += 1) {
  for (let x = 0; x < geometrySize; x += 1) {
    const id = idAt(x, y);
    if (!id) continue;
    const current = statistics.get(id) ?? { pixels: 0, sumX: 0, sumY: 0 };
    current.pixels += 1;
    current.sumX += x + 0.5;
    current.sumY += y + 0.5;
    statistics.set(id, current);
  }
}

const maskIds = [...statistics.keys()].sort((first, second) => first - second);
const configuredIds = rows.map((row) => row.id).sort((first, second) => first - second);
const missingConfigurations = maskIds.filter((id) => !configuredIds.includes(id));
const supersededConfigurations = configuredIds.filter((id) => !maskIds.includes(id));
if (missingConfigurations.length) {
  const problems = missingConfigurations.map((id) => `Konfiguration fehlt: G${String(id).padStart(3, "0")}`);
  throw new Error(`Gebietskonfiguration ist nicht vollständig:\n${problems.map((problem) => `- ${problem}`).join("\n")}`);
}
if (supersededConfigurations.length) {
  console.log(`Durch bestätigte Grenzen vollständig ersetzte Automatikgebiete: ${supersededConfigurations.map((id) => `G${String(id).padStart(3, "0")}`).join(", ")}`);
}

const rectangles = [];
let activeRectangles = new Map();
for (let y = 0; y < geometrySize; y += 1) {
  const currentKeys = new Set();
  let x = 0;
  while (x < geometrySize) {
    const id = idAt(x, y);
    if (!id) {
      x += 1;
      continue;
    }
    const startX = x;
    while (x < geometrySize && idAt(x, y) === id) x += 1;
    const key = `${id}:${startX}:${x}`;
    currentKeys.add(key);
    const active = activeRectangles.get(key);
    if (active) active.height += 1;
    else activeRectangles.set(key, { id, x: startX, y, width: x - startX, height: 1 });
  }
  for (const [key, rectangle] of activeRectangles) {
    if (currentKeys.has(key)) continue;
    rectangles.push(rectangle);
    activeRectangles.delete(key);
  }
}
rectangles.push(...activeRectangles.values());

const horizontalEdges = new Map();
const verticalEdges = new Map();
const addEdge = (collection, key, value) => {
  const values = collection.get(key) ?? [];
  values.push(value);
  collection.set(key, values);
};

for (let y = 0; y < geometrySize; y += 1) {
  for (let x = 0; x < geometrySize; x += 1) {
    const id = idAt(x, y);
    if (!id) continue;
    if (idAt(x, y - 1) !== id) addEdge(horizontalEdges, `${id}:${y}`, x);
    if (idAt(x, y + 1) !== id) addEdge(horizontalEdges, `${id}:${y + 1}`, x);
    if (idAt(x - 1, y) !== id) addEdge(verticalEdges, `${id}:${x}`, y);
    if (idAt(x + 1, y) !== id) addEdge(verticalEdges, `${id}:${x + 1}`, y);
  }
}

const number = (value) => Number(value.toFixed(2));
const vectorX = (x) => number((x / geometrySize) * vectorSize);
const vectorY = (y) => number((y / geometrySize) * vectorSize);
const geometryById = new Map(maskIds.map((id) => [id, { fill: [], outline: [] }]));

for (const rectangle of rectangles) {
  const x = vectorX(rectangle.x);
  const y = vectorY(rectangle.y);
  const width = number(vectorX(rectangle.x + rectangle.width) - x);
  const height = number(vectorY(rectangle.y + rectangle.height) - y);
  geometryById.get(rectangle.id).fill.push(`M${x} ${y}h${width}v${height}h-${width}Z`);
}

const appendMergedEdges = (collection, horizontal) => {
  for (const [key, values] of collection) {
    const [idText, coordinateText] = key.split(":");
    const id = Number(idText);
    const coordinate = Number(coordinateText);
    values.sort((first, second) => first - second);
    let start = values[0];
    let end = start + 1;
    for (let index = 1; index <= values.length; index += 1) {
      const value = values[index];
      if (value === end) {
        end += 1;
        continue;
      }
      if (horizontal) {
        geometryById.get(id).outline.push(`M${vectorX(start)} ${vectorY(coordinate)}H${vectorX(end)}`);
      } else {
        geometryById.get(id).outline.push(`M${vectorX(coordinate)} ${vectorY(start)}V${vectorY(end)}`);
      }
      start = value;
      end = value + 1;
    }
  }
};

appendMergedEdges(horizontalEdges, true);
appendMergedEdges(verticalEdges, false);

const gameToVectorX = (x) => number((x / geometrySize) * vectorSize);
const gameToVectorY = (y) => number(((geometrySize - y) / geometrySize) * vectorSize);
const manualCenters = new Map();

for (const boundary of manualBoundaries) {
  const pathPoints = boundary.points.map((point) => `${gameToVectorX(point.x)} ${gameToVectorY(point.y)}`);
  const exactPath = `M${pathPoints.join("L")}Z`;
  geometryById.set(boundary.id, { fill: [exactPath], outline: [exactPath] });

  let doubledArea = 0;
  let centerX = 0;
  let centerY = 0;
  for (let index = 0; index < boundary.points.length; index += 1) {
    const current = boundary.points[index];
    const next = boundary.points[(index + 1) % boundary.points.length];
    const cross = current.x * next.y - next.x * current.y;
    doubledArea += cross;
    centerX += (current.x + next.x) * cross;
    centerY += (current.y + next.y) * cross;
  }
  const divisor = 3 * doubledArea;
  const fallback = boundary.points.reduce((center, point) => ({ x: center.x + point.x, y: center.y + point.y }), { x: 0, y: 0 });
  manualCenters.set(boundary.id, Math.abs(divisor) > Number.EPSILON
    ? { x: centerX / divisor, y: centerY / divisor }
    : { x: fallback.x / boundary.points.length, y: fallback.y / boundary.points.length });
}

const toGameX = (pixelX) => Math.min(999, Math.max(1, Math.round(pixelX)));
const toGameY = (pixelY) => Math.min(999, Math.max(1, Math.round(geometrySize - pixelY)));
const regions = rows
  .sort((first, second) => first.id - second.id)
  .filter((row) => manualCenters.has(row.id))
  .map((row) => {
    const stats = statistics.get(row.id);
    const centerX = stats.sumX / stats.pixels;
    const centerY = stats.sumY / stats.pixels;
    const geometry = geometryById.get(row.id);
    const manualCenter = manualCenters.get(row.id);
    return {
      ...row,
      manualBoundary: manualCenters.has(row.id),
      center: {
        vectorX: manualCenter ? gameToVectorX(manualCenter.x) : vectorX(centerX),
        vectorY: manualCenter ? gameToVectorY(manualCenter.y) : vectorY(centerY),
        x: manualCenter ? Math.round(manualCenter.x) : toGameX(centerX),
        y: manualCenter ? Math.round(manualCenter.y) : toGameY(centerY),
      },
      fillPath: geometry.fill.join(""),
      outlinePath: geometry.outline.join(""),
    };
  });

await mkdir(path.dirname(dataPath), { recursive: true });
await writeFile(dataPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  width: vectorSize,
  height: vectorSize,
  regions,
}, null, 2)}\n`, "utf8");

console.log(`Vektor-Ratskarte erzeugt: ${regions.length} bestätigte Gebiete`);
