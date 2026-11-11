const frontmatter = (source) => source
  .replace(/^\uFEFF/, "")
  .match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? "";

export function declaredContentLanguages(source) {
  const metadata = frontmatter(source);
  const inline = metadata.match(/^languages:\s*\[([^\]]*)\]\s*$/m);
  if (inline) {
    return inline[1]
      .split(",")
      .map((language) => language.trim().replace(/^['"]|['"]$/g, ""))
      .filter(Boolean);
  }

  const block = metadata.match(/^languages:\s*\r?\n((?:\s+-\s*[^\r\n]+\r?\n?)*)/m);
  if (!block) return null;
  return [...block[1].matchAll(/^\s+-\s*([^\r\n]+)$/gm)]
    .map((match) => match[1].trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

export function contentIsRequiredInLanguage(source, language) {
  const languages = declaredContentLanguages(source);
  return languages === null || languages.includes(language);
}
