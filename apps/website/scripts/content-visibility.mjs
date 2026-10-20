import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { normalizeContentLinks, logicalSource, isLocalizedSource, languageCodes } from "./content-files.mjs";

const ignoredDirectories = new Set([".git", ".github", "node_modules", "site"]);
const hiddenHeadingPattern = /^##\s*HIDDEN\s*$/i;

const hiddenHeadingLines = (markdown) => {
  let inFence = false;

  return markdown.replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return { hidden: false, line };
    }
    return { hidden: !inFence && hiddenHeadingPattern.test(line), line };
  });
};

export const hasHiddenMarker = (markdown) => hiddenHeadingLines(markdown).some(({ hidden }) => hidden);

export const removeHiddenMarker = (markdown) => hiddenHeadingLines(markdown)
  .filter(({ hidden }) => !hidden)
  .map(({ line }) => line)
  .join("\n")
  .replace(/^(?:\n){3,}/, "\n\n");

const repositoryPath = (repositoryRoot, absolutePath) => path
  .relative(repositoryRoot, absolutePath)
  .split(path.sep)
  .join("/");

async function walkMarkdownFiles(repositoryRoot, directory = repositoryRoot) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    if (entry.isDirectory() && languageCodes.has(entry.name) && entry.name !== "de") continue;

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walkMarkdownFiles(repositoryRoot, entryPath)));
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      const physical=repositoryPath(repositoryRoot,entryPath);
      if(physical.startsWith("content/") && !isLocalizedSource(physical)) continue;
      files.push({
        absolutePath: entryPath,
        sourcePath: logicalSource(repositoryPath(repositoryRoot, entryPath)),
      });
    }
  }

  return files;
}

const localImageReferences = (markdown, markdownSource) => {
  const sourceDirectory = path.posix.dirname(markdownSource);
  const references = new Set();

  for (const match of markdown.matchAll(/!\[[^\]]*]\(([^)\s]+)\)/g)) {
    const target = match[1];
    if (/^(?:[a-z]+:|\/|#)/i.test(target)) continue;

    try {
      references.add(path.posix.normalize(
        path.posix.join(sourceDirectory, decodeURIComponent(target).replaceAll("\\", "/")),
      ));
    } catch {
      // Ungültige URL-Kodierung bleibt dem Markdown-Renderer überlassen.
    }
  }

  return references;
};

export async function loadContentVisibility(repositoryRoot) {
  const markdownFiles = (await walkMarkdownFiles(repositoryRoot)).sort((a,b)=>Number(isLocalizedSource(repositoryPath(repositoryRoot,a.absolutePath)))-Number(isLocalizedSource(repositoryPath(repositoryRoot,b.absolutePath))));
  const hiddenDocuments = new Set();
  const hiddenImageReferences = new Set();
  const publicImageReferences = new Set();
  const markdownBySource = new Map();

  for (const markdownFile of markdownFiles) {
    const markdown = normalizeContentLinks(markdownFile.absolutePath,await readFile(markdownFile.absolutePath, "utf8"));
    const hidden = hasHiddenMarker(markdown);
    markdownBySource.set(markdownFile.sourcePath, markdown);

    if (hidden) hiddenDocuments.add(markdownFile.sourcePath);
    const imageReferences = hidden ? hiddenImageReferences : publicImageReferences;
    for (const imageSource of localImageReferences(markdown, markdownFile.sourcePath)) {
      imageReferences.add(imageSource);
    }
  }

  const hiddenOnlyImages = new Set(
    [...hiddenImageReferences].filter((sourcePath) => !publicImageReferences.has(sourcePath)),
  );

  return {
    hiddenDocuments,
    hiddenOnlyImages,
    markdownBySource,
  };
}
