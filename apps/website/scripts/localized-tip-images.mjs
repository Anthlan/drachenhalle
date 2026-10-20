import { readFile, readdir, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Localized originals live beside the translated content, with language last.
export async function localizedTipImages(repositoryRoot, outputRoot, base, language) {
  const areas = [
    { content: "Drachenwissen/Tipps", media: "media/knowledge/Tipps", category: "tips" },
    { content: "Allianz", media: "media/alliance", category: "alliance" },
    { content: "Drachenwissen/Events", media: "media/knowledge/Events", category: "event-guides" },
    { content: "Drachenwissen/Eventankuendigungen", media: "media/knowledge/Eventankuendigungen", category: "announcements" },
  ];
  const gallery = JSON.parse(await readFile(path.join(repositoryRoot, "apps/website/src/data/gallery.generated.json"), "utf8"));
  const replacements = [];
  for (const area of areas) {
    const directory = path.join(repositoryRoot, "content", area.content, language);
    const files = await readdir(directory).catch(error => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    const destination = path.join(outputRoot, "generated", area.category, language);
    await mkdir(destination, { recursive: true });
    for (const name of files.filter(name => /\.(?:png|jpe?g)$/i.test(name))) {
      const source = `${area.media}/${name}`;
      const item = gallery.items.find(item => item.sourcePath === source);
      if (!item) throw new Error(`Localized image has no original: ${source}`);
      const input = path.join(directory, name);
      const stem = name.slice(0, -path.extname(name).length);
      const prefix = `${base}/generated/${area.category}/${language}/`;
      await copyFile(input, path.join(destination, name));
      await sharp(input).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 90 }).toFile(path.join(destination, `${stem}-web.webp`));
      await sharp(input).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 85 }).toFile(path.join(destination, `${stem}-thumb.webp`));
      const encoded = source.split("/").map(encodeURIComponent).join("/");
      replacements.push(
        [item.webUrl, `${prefix}${stem}-web.webp`],
        [item.thumbnailUrl ?? item.thumbUrl, `${prefix}${stem}-thumb.webp`],
        [`https://raw.githubusercontent.com/Anthlan/drachenhalle/main/${encoded}`, `${prefix}${name}`],
        [item.repositoryUrl, `${prefix}${name}`],
      );
    }
  }
  return html => replacements.reduce((html, [from, to]) => from ? html.replaceAll(from, to) : html, html);
}
