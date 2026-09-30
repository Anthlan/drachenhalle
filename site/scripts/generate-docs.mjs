import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { loadContentVisibility, removeHiddenMarker } from "./content-visibility.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const siteDirectory = path.resolve(scriptDirectory, "..");
const repositoryDirectory = path.resolve(siteDirectory, "..");
const outputPath = path.join(siteDirectory, "src", "data", "docs.generated.json");
const galleryDataPath = path.join(siteDirectory, "src", "data", "gallery.generated.json");
const documentImageDataPath = path.join(siteDirectory, "src", "data", "document-images.generated.json");
const repositoryUrl = "https://github.com/Anthlan/drachenhalle";
const rawRepositoryUrl = "https://raw.githubusercontent.com/Anthlan/drachenhalle/main";

const encodeRepositoryPath = (sourcePath) => sourcePath
  .split("/")
  .map((segment) => encodeURIComponent(segment))
  .join("/");

const imageMimeType = (sourcePath) => {
  const extension = path.posix.extname(sourcePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  return "image/png";
};

const baseDocuments = [
  {
    source: "README.md",
    slug: "projekt",
    title: "Über das Archiv",
    section: "Projekt",
    summary: "Zweck, Struktur und Grundidee der öffentlichen DIE Drachenhalle.",
  },
  {
    source: "ARCHIVREGELN.md",
    slug: "archivregeln",
    title: "Archivregeln",
    section: "Projekt",
    summary: "Verbindliche Regeln für Ablage, Benennung und Pflege der Inhalte.",
  },
  {
    source: "Drachenwissen/Tipps/README.md",
    slug: "tipps",
    title: "Tipps",
    section: "Drachenwissen",
    summary: "Tipps und Spielwissen für den Alltag, gefiltert nach Art und Thema.",
  },
  {
    source: "Drachenwissen/Events/README.md",
    slug: "events",
    title: "Events",
    section: "Drachenwissen",
    summary: "Zeitlich begrenzte Event-Guides mit Währungen, Belohnungen und Empfehlungen nach Budget.",
  },
  {
    source: "Drachenwissen/Eventankuendigungen/README.md",
    slug: "eventankuendigungen",
    title: "Eventankündigungen",
    section: "Drachenwissen",
    summary: "Wiederverwendbare Hinweise zu bevorstehenden Allianz-Ereignissen mit Kopiervorlagen.",
  },
  {
    source: "Drachenwissen/Eventankuendigungen/AllianzHinterhalt_Start_Verlueste.md",
    slug: "eventankuendigung-hinterhalt",
    title: "Allianz-Hinterhalt: vorbereitet starten",
    section: "Drachenwissen",
    summary: "Hinweise zu Start, Verlustmanagement und effizientem Heilen.",
    parentSlug: "eventankuendigungen",
    kind: "alliance",
  },
  {
    source: "Drachenwissen/Eventankuendigungen/Raubzugkaempfe_Schilde_Hoch.md",
    slug: "eventankuendigung-raubzugkaempfe",
    title: "Raubzugkämpfe: Schilde rechtzeitig setzen",
    section: "Drachenwissen",
    summary: "Gefahrenzeitraum, Schildplan und Vorbereitung im Allianz-Shop.",
    parentSlug: "eventankuendigungen",
    kind: "alliance",
    imageSource: "Drachenwissen/Eventankuendigungen/Raubzugkaempfe_Schilde_Hoch.png",
  },
  {
    source: "Drachenwissen/Eventankuendigungen/ZombieBelagerung_Ablauf_Teilnahme.md",
    slug: "eventankuendigung-zombie-belagerung",
    title: "Zombie-Belagerung: gemeinsam verteidigen",
    section: "Drachenwissen",
    summary: "Ablauf, Teilnahme, Ausstieg und Unterstützung bei der Verteidigung.",
    parentSlug: "eventankuendigungen",
    kind: "alliance",
    imageSource: "Drachenwissen/Eventankuendigungen/ZombieBelagerung_Ablauf_Teilnahme.png",
  },
  {
    source: "Allianz/README.md",
    slug: "allianz",
    title: "Allianz",
    section: "Allianz",
    summary: "Regeln, Offiziere und Zuständigkeiten der DIE-Allianz auf einen Blick.",
  },
  {
    source: "Tutorials/README.md",
    slug: "tutorials",
    title: "Tutorials",
    section: "Tutorials",
    summary: "Schritt-für-Schritt-Anleitungen für wichtige Abläufe in der Drachenhalle.",
  },
  {
    source: "Tutorials/Allianz_Einstieg.md",
    slug: "dein-einstieg-bei-uns",
    title: "Dein Einstieg bei uns",
    section: "Tutorials",
    summary: "Der Schritt-für-Schritt-Einstieg für neue Mitglieder der DIE-Allianz.",
    parentSlug: "tutorials",
    kind: "onboarding",
  },
  {
    source: "Tutorials/Profilbild_Tutorial.md",
    slug: "profilbild-im-spiel",
    title: "Profilbild aus der Galerie im Spiel verwenden",
    section: "Tutorials",
    summary: "Vom Galerie-Download über den Bildausschnitt bis zur Prüfung des eigenen Custom-Avatars.",
    parentSlug: "tutorials",
    kind: "onboarding",
    tutorialStorageKey: "die-profilbild-tutorial-step-v1",
    tutorialProgressLabel: "Fortschritt im Profilbild-Tutorial",
    tutorialNavLabel: "Schritte des Profilbild-Tutorials",
    tutorialCompleteLabel: "Tutorial abschließen ✦",
    tutorialCompletionTitle: "Dein Avatar ist auf dem Weg!",
    tutorialCompletionText: "Du hast das Profilbild zur Prüfung eingereicht.",
    tutorialCharacters: [
      {
        position: "left",
        src: "/drachenhalle/tutorial/profilbild/12_somea_pruefung_chibi.webp",
        alt: "Somea als Chibi-Figur mit Sanduhr und Prüfzeichen",
      },
      {
        position: "right",
        src: "/drachenhalle/tutorial/profilbild/11_anthlan_download_chibi.webp",
        alt: "Anthlan als Chibi-Figur mit Smartphone und Downloadsymbol",
      },
    ],
  },
  {
    source: "Allianz/Allianz_Regeln.md",
    slug: "allianzregeln",
    title: "Unsere Regeln",
    section: "Allianz",
    summary: "Verbindliche Regeln zu NAP10, erlaubten Angriffen, Plündern und dem Umgang mit Verstößen.",
    parentSlug: "allianz",
    kind: "alliance",
    imageSource: "Allianz/Allianz_Regeln.png",
  },
  {
    source: "Allianz/Allianz_Offiziere.md",
    slug: "unsere-offiziere",
    title: "Unser Führungsteam",
    section: "Allianz",
    summary: "Anthlan und unsere aktuellen R4 auf einen Blick.",
    parentSlug: "allianz",
    kind: "officers",
    imageSource: "Allianz/Allianz_Fuehrungsteam.png",
  },
  {
    source: "Allianz/Allianz_Verantwortlichkeiten.md",
    slug: "unsere-verantwortlichkeiten",
    title: "Unsere Verantwortlichen",
    section: "Allianz",
    summary: "Feste Aufgabenbereiche, aktuelle Zuordnung und ein interaktives Zuordnungsspiel.",
    parentSlug: "allianz",
    kind: "responsibilities",
  },
  {
    source: "Styleguides/README.md",
    slug: "design-guidelines",
    title: "Design-Guidelines",
    section: "Gestaltung",
    summary: "Einstieg in die verbindliche Bildsprache und Textgestaltung.",
  },
  {
    source: "Styleguides/DlE-Stil – Chibi-Chatbilder.md",
    slug: "stil-chibi-chatbilder",
    title: "Stil: Chibi-Bilder",
    section: "Gestaltung",
    summary: "Darstellungsregeln für Chat- und Reaktionsbilder im Chibi-Stil S3.",
  },
  {
    source: "Styleguides/DlE-Stil – Chat-Bilder.md",
    slug: "stil-chatbilder",
    title: "Stil: Chat- und Reaktionsbilder",
    section: "Gestaltung",
    summary: "Gemeinsame Stilgruppen für szenische und wiederverwendbare Bildmotive.",
  },
  {
    source: "Styleguides/DlE-Stil – Avatarbilder.md",
    slug: "stil-avatarbilder",
    title: "Stil: Avatarbilder",
    section: "Gestaltung",
    summary: "Vorgaben für konsistente Avatare und Porträts.",
  },
  {
    source: "Styleguides/DlE-Stil – Charaktermodelle.md",
    slug: "stil-charaktermodelle",
    title: "Stil: Charaktermodelle",
    section: "Gestaltung",
    summary: "Verbindliches Seitenraster und Referenzumfang für neue Figuren.",
  },
  {
    source: "Styleguides/DlE-Stil – Allianz-Mitteilungen.md",
    slug: "stil-allianz-mitteilungen",
    title: "Stil: Allianz-Mitteilungen",
    section: "Gestaltung",
    summary: "Bildsprache und Aufbau offizieller Mitteilungen.",
  },
  {
    source: "Styleguides/DlE – Textformatierung.md",
    slug: "textformatierung",
    title: "Textformatierung",
    section: "Gestaltung",
    summary: "Farben, Hierarchien und Formatierung für Texte im Spiel.",
  },
  {
    source: "Galerie/Avatare/README.md",
    slug: "avatare",
    title: "Avatare",
    section: "Bildarchiv",
    summary: "Ablage und Benennung der persönlichen Avatarbilder.",
  },
  {
    source: "Galerie/Charaktermodelle/README.md",
    slug: "charaktermodelle",
    title: "Charaktermodelle",
    section: "Bildarchiv",
    summary: "Referenzen für Figuren, Kleidung und wiederkehrende Merkmale.",
  },
  {
    source: "Galerie/Chatbilder/README.md",
    slug: "chatbilder",
    title: "Chatbilder",
    section: "Bildarchiv",
    summary: "Regeln und Struktur für die Sammlung der Chatmotive.",
  },
  {
    source: "Galerie/Reaktionsbilder/README.md",
    slug: "reaktionsbilder",
    title: "Reaktionsbilder",
    section: "Bildarchiv",
    summary: "Kurze, wiederverwendbare Antworten und Grüße für den Allianzchat.",
  },
  {
    source: "Archiv/README.md",
    slug: "historisches-archiv",
    title: "Historisches Archiv",
    section: "Projekt",
    summary: "Frühere Stände, ersetzte Dateien und historische Referenzen.",
  },
];

const slugify = (value) => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replaceAll("ß", "ss")
  .replace(/([a-z])([A-Z])/g, "$1-$2")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 72);

const plainText = (value) => value
  .replace(/[`*_~]/g, "")
  .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
  .replace(/<[^>]+>/g, "")
  .replace(/\s+/g, " ")
  .trim();

const tipArtTags = ["Anleitung", "Strategie", "Optimierung"];
const tipTopicTags = ["Allianz", "Events", "Kampf", "Truppen", "Aufbau", "Weltkarte"];

const parseFrontmatter = (markdown) => {
  const normalizedMarkdown = markdown.replace(/^\uFEFF/, "");
  const match = normalizedMarkdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!match) return { data: {}, content: normalizedMarkdown };

  const data = {};
  let activeKey = null;

  for (const line of match[1].split(/\r?\n/)) {
    const keyMatch = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (keyMatch) {
      activeKey = keyMatch[1];
      const inlineValue = keyMatch[2].trim();
      data[activeKey] = inlineValue
        ? inlineValue.replace(/^\[|\]$/g, "").split(",").map((value) => value.trim()).filter(Boolean)
        : [];
      continue;
    }

    const listItemMatch = line.match(/^\s+-\s+(.+?)\s*$/);
    if (activeKey && listItemMatch) data[activeKey].push(listItemMatch[1]);
  }

  return {
    data,
    content: normalizedMarkdown.slice(match[0].length).replace(/^(?:\r?\n)+/, ""),
  };
};

const validateTipTags = (tags, allowedTags, field, source) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error(`${source}: Frontmatter-Feld "${field}" fehlt oder ist leer.`);
  }

  const unknownTags = tags.filter((tag) => !allowedTags.includes(tag));
  if (unknownTags.length > 0) {
    throw new Error(`${source}: Unbekannte ${field}-Tags: ${unknownTags.join(", ")}.`);
  }

  return tags;
};

const tipDirectory = path.join(repositoryDirectory, "Drachenwissen", "Tipps");
const tipFileNames = (await readdir(tipDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md") && entry.name.toLowerCase() !== "readme.md")
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right, "de", { numeric: true }));

let galleryItems = [];
try {
  galleryItems = JSON.parse(await readFile(galleryDataPath, "utf8")).items;
} catch {
  console.warn("Gallery data is unavailable; documentation images will be omitted.");
}

let documentImages = [];
try {
  documentImages = JSON.parse(await readFile(documentImageDataPath, "utf8")).items;
} catch {
  console.warn("Hidden document image data is unavailable; its images will be omitted.");
}

const renderImages = [...galleryItems, ...documentImages];
const contentVisibility = await loadContentVisibility(repositoryDirectory);

for (const document of baseDocuments) {
  if (!document.imageSource) continue;

  const image = galleryItems.find((item) => item.sourcePath === document.imageSource);
  document.imageUrl = image?.webUrl ?? null;
  document.imageRepositoryUrl = image?.repositoryUrl ?? null;
  document.imageOriginalUrl = image ? `${rawRepositoryUrl}/${encodeRepositoryPath(image.sourcePath)}` : null;
  document.imageOriginalName = image ? path.posix.basename(image.sourcePath) : null;
  document.imageOriginalMimeType = image ? imageMimeType(image.sourcePath) : null;
}

const tipDocuments = [];

for (const fileName of tipFileNames) {
  const source = `Drachenwissen/Tipps/${fileName}`;
  const sourcePath = path.join(tipDirectory, fileName);
  const sourceMarkdown = await readFile(sourcePath, "utf8");
  const { data: frontmatter, content: markdown } = parseFrontmatter(sourceMarkdown);
  const baseName = path.basename(fileName, path.extname(fileName));
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1] ?? baseName;
  const title = plainText(heading).replace(/^💡\s*/u, "");
  const introduction = markdown.match(/##\s+Wofür[^\n]*\r?\n+([\s\S]*?)(?=\r?\n##\s|$)/i)?.[1] ?? "";
  const summary = plainText(introduction.split(/\r?\n\s*\r?\n/)[0]) || "Praktischer Tipp für den Spielalltag.";
  const image = galleryItems.find((item) => {
    const itemBaseName = path.posix.basename(item.sourcePath, path.posix.extname(item.sourcePath));
    return item.sourcePath.startsWith("Drachenwissen/Tipps/") && itemBaseName === baseName;
  });

  tipDocuments.push({
    source,
    slug: slugify(baseName),
    title,
    section: "Drachenwissen",
    summary,
    parentSlug: "tipps",
    kind: "tip",
    artTags: validateTipTags(frontmatter.arten, tipArtTags, "arten", source),
    topicTags: validateTipTags(frontmatter.themen, tipTopicTags, "themen", source),
    imageUrl: image?.webUrl ?? null,
    imageRepositoryUrl: image?.repositoryUrl ?? null,
    imageOriginalUrl: image ? `${rawRepositoryUrl}/${encodeRepositoryPath(image.sourcePath)}` : null,
    imageOriginalName: image ? path.posix.basename(image.sourcePath) : null,
    imageOriginalMimeType: image ? imageMimeType(image.sourcePath) : null,
  });
}

const eventDirectory = path.join(repositoryDirectory, "Drachenwissen", "Events");
const eventFileNames = (await readdir(eventDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md") && entry.name.toLowerCase() !== "readme.md")
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right, "de", { numeric: true }));
const eventDocuments = [];

for (const fileName of eventFileNames) {
  const source = `Drachenwissen/Events/${fileName}`;
  const sourcePath = path.join(eventDirectory, fileName);
  const sourceMarkdown = await readFile(sourcePath, "utf8");
  const { content: markdown } = parseFrontmatter(sourceMarkdown);
  const baseName = path.basename(fileName, path.extname(fileName));
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1] ?? baseName;
  const title = plainText(heading).replace(/^✈️\s*/u, "");
  const introduction = markdown.match(/##\s+Wofür[^\n]*\r?\n+([\s\S]*?)(?=\r?\n##\s|$)/i)?.[1] ?? "";
  const summary = plainText(introduction.split(/\r?\n\s*\r?\n/)[0]) || "Zeitlich begrenzter Event-Guide.";
  const image = galleryItems.find((item) => {
    const itemBaseName = path.posix.basename(item.sourcePath, path.posix.extname(item.sourcePath));
    return item.sourcePath.startsWith("Drachenwissen/Events/") && itemBaseName === baseName;
  });

  eventDocuments.push({
    source,
    slug: slugify(baseName),
    title,
    section: "Drachenwissen",
    summary,
    parentSlug: "events",
    kind: "event",
    imageUrl: image?.webUrl ?? null,
    imageRepositoryUrl: image?.repositoryUrl ?? null,
    imageOriginalUrl: image ? `${rawRepositoryUrl}/${encodeRepositoryPath(image.sourcePath)}` : null,
    imageOriginalName: image ? path.posix.basename(image.sourcePath) : null,
    imageOriginalMimeType: image ? imageMimeType(image.sourcePath) : null,
  });
}

const registeredDocuments = [...baseDocuments, ...tipDocuments, ...eventDocuments];
const registeredSources = new Set(registeredDocuments.map((document) => document.source));
const parentDocuments = baseDocuments
  .filter((document) => path.posix.basename(document.source).toLowerCase() === "readme.md")
  .map((document) => ({ ...document, directory: path.posix.dirname(document.source) }))
  .sort((left, right) => right.directory.length - left.directory.length);

const sectionForSource = (source) => {
  if (source.startsWith("Allianz/")) return "Allianz";
  if (source.startsWith("Tutorials/")) return "Tutorials";
  if (source.startsWith("Drachenwissen/")) return "Drachenwissen";
  if (source.startsWith("Styleguides/")) return "Gestaltung";
  if (source.startsWith("Galerie/")) return "Bildarchiv";
  return "Projekt";
};

const hiddenDocuments = [];
for (const source of [...contentVisibility.hiddenDocuments].sort((left, right) => left.localeCompare(right, "de"))) {
  if (registeredSources.has(source)) continue;

  const sourceMarkdown = contentVisibility.markdownBySource.get(source);
  if (!sourceMarkdown) continue;

  const { content } = parseFrontmatter(sourceMarkdown);
  const markdown = removeHiddenMarker(content);
  const baseName = path.posix.basename(source, path.posix.extname(source));
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1] ?? baseName;
  const title = plainText(heading);
  const articleMarkdown = markdown.replace(/^#\s+.*?(?:\r?\n)+/, "");
  const summary = articleMarkdown
    .split(/\r?\n\s*\r?\n/)
    .map((block) => plainText(block))
    .find((block) => block && !block.startsWith("#")) ?? title;
  const section = sectionForSource(source);
  const parentDocument = parentDocuments.find((document) =>
    document.section === section
      && document.directory !== "."
      && path.posix.dirname(source).startsWith(document.directory),
  );

  hiddenDocuments.push({
    source,
    slug: slugify(baseName),
    title,
    section,
    summary,
    parentSlug: parentDocument?.slug,
    kind: "document",
    hidden: true,
  });
}

const documents = [...registeredDocuments, ...hiddenDocuments].map((document) => ({
  ...document,
  hidden: document.hidden || contentVisibility.hiddenDocuments.has(document.source),
}));
const duplicateSlugs = documents
  .map((document) => document.slug)
  .filter((slug, index, slugs) => slugs.indexOf(slug) !== index);
if (duplicateSlugs.length) {
  throw new Error(`Doppelte Dokument-Slugs: ${[...new Set(duplicateSlugs)].join(", ")}`);
}
const documentUrl = (document) => `/drachenhalle/docs/${document.slug}/`;
const documentUrlBySource = new Map(documents.map((document) => [document.source, documentUrl(document)]));

const sectionDescriptions = {
  Projekt: "Orientierung, Regeln und Hintergrund zum Archiv.",
  Drachenwissen: "Tipps, Strategien und Informationen für den Spiel- und Allianzalltag.",
  Tutorials: "Schritt-für-Schritt-Anleitungen für wichtige Abläufe.",
  Allianz: "Regeln, Offiziere und Zuständigkeiten der DIE-Allianz.",
  Gestaltung: "Verbindliche Regeln für Bilder und Texte.",
  Bildarchiv: "Struktur und Pflege der visuellen Inhalte.",
};

const normalizeWebsiteSpelling = (markdown, source) => {
  let normalized = markdown;

  if (source === "ARCHIVREGELN.md") {
    normalized = normalized
      .replace(
        /- \*\*Allianz – verbindliche Ingame-Schreibweise:\*\* DlE/g,
        "- **Allianz – Schreibweise auf dieser Website:** DIE",
      )
      .replace(
        /- \*\*Technischer Hinweis:\*\*.*(?:\r?\n|$)/,
        "- **Technischer Hinweis:** Der Textfilter im Spiel kann bei Allianz- und Spielernamen eine abweichende Schreibweise erforderlich machen.\n",
      )
      .replace(
        /Die Schreibweise \*\*DlE\*\*[\s\S]*?erklärt wird\./,
        "Auf dieser Website wird die Allianz durchgängig als **DIE** bezeichnet. Im Spiel kann aus technischen Filtergründen eine abweichende Schreibweise erforderlich sein.",
      );
  }

  return normalized.replaceAll("DlE", "DIE").replaceAll("dle", "die");
};

const resolveLocalMarkdownImages = (markdown, source) => {
  const sourceDirectory = path.posix.dirname(source);

  return markdown.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (match, alt, imageTarget) => {
    if (/^(?:[a-z]+:|\/|#)/i.test(imageTarget)) return match;

    let decodedTarget;
    try {
      decodedTarget = decodeURIComponent(imageTarget);
    } catch {
      return match;
    }

    const sourcePath = path.posix.normalize(
      path.posix.join(sourceDirectory, decodedTarget.replaceAll("\\", "/")),
    );
    const image = renderImages.find((item) => item.sourcePath === sourcePath);

    return image ? `![${alt}](${image.webUrl})` : match;
  });
};

const resolveLocalMarkdownLinks = (markdown, source) => {
  const sourceDirectory = path.posix.dirname(source);

  return markdown.replace(/(?<!!)\[([^\]]+)]\(([^)\s]+\.md)\)/gi, (match, label, linkTarget) => {
    if (/^(?:[a-z]+:|\/|#)/i.test(linkTarget)) return match;

    let decodedTarget;
    try {
      decodedTarget = decodeURIComponent(linkTarget);
    } catch {
      return match;
    }

    const targetSource = path.posix.normalize(
      path.posix.join(sourceDirectory, decodedTarget.replaceAll("\\", "/")),
    );
    if (contentVisibility.hiddenDocuments.has(targetSource) && targetSource !== source) return label;
    const websiteUrl = documentUrlBySource.get(targetSource);
    const targetUrl = websiteUrl ?? `${repositoryUrl}/blob/main/${encodeRepositoryPath(targetSource)}`;
    return `[${label}](${targetUrl})`;
  });
};

marked.setOptions({
  gfm: true,
  breaks: false,
});

const splitLevelTwoSections = (markdown) => {
  const headings = [...markdown.matchAll(/^##\s+(.+)$/gm)];

  return headings.map((heading, index) => {
    const displayTitle = plainText(heading[1]);
    return {
      title: displayTitle.toLowerCase(),
      displayTitle,
      markdown: markdown.slice(heading.index, headings[index + 1]?.index ?? markdown.length).trim(),
    };
  });
};

const removeTipMainImage = (markdown, imageUrl) => {
  if (!imageUrl) return markdown;

  return markdown.replace(/!\[([^\]]*)\]\(([^)\s]+)\)\s*/g, (match, _alt, imageTarget) =>
    imageTarget === imageUrl ? "" : match,
  );
};

const addHeadingIds = (html) => {
  const usedIds = new Map();

  return html.replace(/<h([2-6])>([\s\S]*?)<\/h\1>/g, (_match, level, content) => {
    const baseId = slugify(plainText(content)) || "abschnitt";
    const count = usedIds.get(baseId) ?? 0;
    usedIds.set(baseId, count + 1);
    const id = count === 0 ? baseId : `${baseId}-${count + 1}`;
    return `<h${level} id="${id}">${content}</h${level}>`;
  });
};

const decorateHiddenConsultation = (html) => html
  .replace(/<h3 id="([^"]+)">(Chancen)<\/h3>/gi, '<h3 id="$1" class="consultation-chances">$2</h3>')
  .replace(/<h3 id="([^"]+)">(Risiken)<\/h3>/gi, '<h3 id="$1" class="consultation-risks">$2</h3>');

const items = [];

for (const document of documents) {
  const sourcePath = path.join(repositoryDirectory, ...document.source.split("/"));
  const sourceMarkdown = contentVisibility.markdownBySource.get(document.source) ?? await readFile(sourcePath, "utf8");
  const { content } = parseFrontmatter(sourceMarkdown);
  const markdown = removeHiddenMarker(content);
  const normalizedMarkdown = resolveLocalMarkdownLinks(
    resolveLocalMarkdownImages(normalizeWebsiteSpelling(markdown, document.source), document.source),
    document.source,
  );
  const articleMarkdown = normalizedMarkdown.replace(/^#\s+.*?(?:\r?\n)+/, "");
  const parsedHtml = document.hidden
    ? addHeadingIds(await marked.parse(articleMarkdown))
    : await marked.parse(articleMarkdown);
  const html = document.hidden ? decorateHiddenConsultation(parsedHtml) : parsedHtml;
  const articleSections = ["tip", "event", "alliance"].includes(document.kind)
    ? splitLevelTwoSections(articleMarkdown)
    : [];
  const onboardingSections = document.kind === "onboarding"
    ? splitLevelTwoSections(articleMarkdown)
    : [];
  const tipSections = ["tip", "event"].includes(document.kind) ? articleSections : [];
  const briefSection = tipSections.find((section) => section.title === "das wichtigste in kürze");
  const detailStartIndex = tipSections.findIndex((section) => section.title.startsWith("wofür ist dieser"));
  const detailMarkdown = detailStartIndex >= 0
    ? tipSections.slice(detailStartIndex).map((section) => section.markdown).join("\n\n")
    : null;
  const detailIntroMarkdown = detailStartIndex >= 0
    ? tipSections[detailStartIndex].markdown
    : null;
  const detailBodyMarkdown = detailStartIndex >= 0
    ? tipSections.slice(detailStartIndex + 1).map((section) => section.markdown).join("\n\n")
    : null;
  const hasBriefView = Boolean(briefSection && detailMarkdown);
  const briefMarkdown = hasBriefView
    ? removeTipMainImage(briefSection.markdown, document.imageUrl)
    : null;
  const cleanedDetailMarkdown = hasBriefView
    ? removeTipMainImage(detailMarkdown, document.imageUrl)
    : null;
  const cleanedDetailIntroMarkdown = hasBriefView
    ? removeTipMainImage(detailIntroMarkdown, document.imageUrl)
    : null;
  const cleanedDetailBodyMarkdown = hasBriefView
    ? removeTipMainImage(detailBodyMarkdown, document.imageUrl)
    : null;
  const introSection = tipSections.find((section) => section.title.startsWith("wofür"));
  const mainSection = tipSections.find((section) => section.title === "tipp");
  const copySection = tipSections.find((section) => section.title.startsWith("html-block"));
  const allianceCopyMatch = document.kind === "alliance"
    ? /^##\s+Allianz-Mitteilung zum Kopieren\s*$/im.exec(articleMarkdown)
    : null;
  const allianceArticleMarkdown = allianceCopyMatch
    ? articleMarkdown.slice(0, allianceCopyMatch.index).trim()
    : null;
  const allianceCopyMarkdown = allianceCopyMatch
    ? articleMarkdown.slice(allianceCopyMatch.index).trim()
    : null;
  const encodedSource = encodeRepositoryPath(document.source);

  items.push({
    ...document,
    html,
    briefHtml: briefMarkdown ? addHeadingIds(await marked.parse(briefMarkdown)) : null,
    detailHtml: cleanedDetailMarkdown ? addHeadingIds(await marked.parse(cleanedDetailMarkdown)) : null,
    detailIntroHtml: cleanedDetailIntroMarkdown ? addHeadingIds(await marked.parse(cleanedDetailIntroMarkdown)) : null,
    detailBodyHtml: cleanedDetailBodyMarkdown ? addHeadingIds(await marked.parse(cleanedDetailBodyMarkdown)) : null,
    hasBriefView,
    introHtml: introSection ? await marked.parse(introSection.markdown) : null,
    tipHtml: mainSection ? await marked.parse(mainSection.markdown) : null,
    copyHtml: copySection ? await marked.parse(copySection.markdown) : null,
    allianceArticleHtml: allianceArticleMarkdown
      ? addHeadingIds(await marked.parse(removeTipMainImage(allianceArticleMarkdown, document.imageUrl)))
      : null,
    allianceCopyHtml: allianceCopyMarkdown ? addHeadingIds(await marked.parse(allianceCopyMarkdown)) : null,
    onboardingSteps: await Promise.all(onboardingSections.map(async (section, index) => ({
      id: `tutorial-${index + 1}-${slugify(section.title)}`,
      title: section.displayTitle,
      html: addHeadingIds(await marked.parse(section.markdown)),
    }))),
    url: documentUrl(document),
    repositoryUrl: `${repositoryUrl}/blob/main/${encodedSource}`,
  });
}

const sectionOrder = ["Projekt", "Tutorials", "Drachenwissen", "Allianz", "Gestaltung", "Bildarchiv"];
const sections = sectionOrder.map((name) => ({
  name,
  description: sectionDescriptions[name],
  items: items.filter((item) => item.section === name && !item.parentSlug && !item.hidden).map((item) => item.slug),
}));

await writeFile(
  outputPath,
  `${JSON.stringify({ documentCount: items.filter((item) => !item.hidden).length, sections, items }, null, 2)}\n`,
  "utf8",
);

console.log(`Generated ${items.length} documentation pages.`);
