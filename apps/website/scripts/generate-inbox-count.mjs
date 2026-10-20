import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(scriptDirectory, "..", "src", "data", "inbox.generated.json");
const inboxSharedLink = process.env.DROPBOX_INBOX_SHARED_LINK
  || "https://www.dropbox.com/scl/fo/l073m5tkhprle70lmyszw/ALC8vEJfILXuKqpmTWKw6Cg?rlkey=03rjgx0hhnzj7t8u4hsxzyr74&st=c6omhyut&dl=0";
const appKey = process.env.DROPBOX_APP_KEY;
const appSecret = process.env.DROPBOX_APP_SECRET;
const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;

if (!appKey || !appSecret || !refreshToken) {
  let fallback = "0";
  try {
    const existing = JSON.parse(await readFile(outputPath, "utf8"));
    fallback = String(Math.max(0, Number(existing.count) || 0));
  } catch {
    // Die eingecheckte Fallback-Datei wird beim ersten Lauf angelegt.
  }
  console.log(`Dropbox-Secrets fehlen; vorhandener Inbox-Zähler (${fallback}) bleibt unverändert.`);
  process.exit(0);
}

const tokenResponse = await fetch("https://api.dropboxapi.com/oauth2/token", {
  method: "POST",
  headers: {
    Authorization: `Basic ${Buffer.from(`${appKey}:${appSecret}`).toString("base64")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  }),
});

if (!tokenResponse.ok) {
  throw new Error(`Dropbox-Zugriffstoken konnte nicht erneuert werden (${tokenResponse.status}).`);
}

const { access_token: accessToken } = await tokenResponse.json();
if (!accessToken) throw new Error("Dropbox hat kein Zugriffstoken zurückgegeben.");

const foldersToRead = [""];
let count = 0;

while (foldersToRead.length > 0) {
  const folderPath = foldersToRead.shift();
  let cursor = null;
  let hasMore = true;

  while (hasMore) {
    const endpoint = cursor ? "files/list_folder/continue" : "files/list_folder";
    const body = cursor
      ? { cursor }
      : {
          path: folderPath,
          recursive: false,
          include_deleted: false,
          include_non_downloadable_files: true,
          shared_link: { url: inboxSharedLink },
        };
    const response = await fetch(`https://api.dropboxapi.com/2/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      let detail = "";
      try {
        const error = await response.json();
        detail = error.error_summary ? `: ${error.error_summary}` : "";
      } catch {
        // Die Statusnummer reicht als sichere Diagnose, falls Dropbox kein JSON liefert.
      }
      throw new Error(`Dropbox-Inbox konnte nicht gelesen werden (${response.status}${detail}).`);
    }

    const result = await response.json();
    for (const entry of result.entries || []) {
      if (entry[".tag"] === "file") count += 1;
      if (entry[".tag"] === "folder" && entry.path_lower) foldersToRead.push(entry.path_lower);
    }
    cursor = result.cursor;
    hasMore = Boolean(result.has_more && cursor);
  }
}
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({
  count,
  updatedAt: new Date().toISOString(),
  source: "dropbox",
}, null, 2)}\n`, "utf8");

console.log(`Dropbox-Inbox: ${count} Datei${count === 1 ? "" : "en"}.`);
