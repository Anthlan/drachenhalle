import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteDirectory = path.resolve(scriptDirectory, "..");
const sourceDirectory = path.join(siteDirectory, "public", "brand", "event-shop");
const outputDirectory = path.join(sourceDirectory, "items");

const columns = [207, 585, 963];
const pages = [
  {
    source: "vorratsdepot-exklusiv.png",
    rows: [1058, 1529, 2001],
    ids: [
      "ur-splitter", "deluxe-truhe", "vibranium",
      "hologramm", "flugzeug-deko", "avatarrahmen",
      "namensschild", "gebaeudeteil-a", "gebaeudeteil-b",
    ],
  },
  {
    source: "vorratsdepot-ausbau.png",
    rows: [1058, 1535, 2047],
    rowCropSizes: [210, 210, 194],
    ids: [
      "gebaeudeteil-c", "event-zufallstruhe", "deko-gutscheine",
      "puzzleteil", "bauplan-rot", "bauplan-gold",
      "ur-truhe", "holz", "fortschrittsbuch",
    ],
  },
  {
    source: "vorratsdepot-material.png",
    rows: [1082, 1579, 2074],
    ids: [
      "beschleuniger-3h", "flugmaterial", "fortschrittskiste-a",
      "fortschrittskiste-b", "metallspulen", "handbuecher",
      "versorgungskisten",
    ],
  },
];

await mkdir(outputDirectory, { recursive: true });

for (const page of pages) {
  for (let index = 0; index < page.ids.length; index += 1) {
    const row = Math.floor(index / 3);
    const column = index % 3;
    const cropSize = page.rowCropSizes?.[row] ?? 210;
    await sharp(path.join(sourceDirectory, page.source))
      .extract({
        left: Math.round(columns[column] - cropSize / 2),
        top: Math.round(page.rows[row] - cropSize / 2),
        width: cropSize,
        height: cropSize,
      })
      .resize(240, 240, { fit: "cover" })
      .webp({ quality: 88 })
      .toFile(path.join(outputDirectory, `${page.ids[index]}.webp`));
  }
}

console.log(`Generated ${pages.reduce((sum, page) => sum + page.ids.length, 0)} event shop thumbnails.`);
