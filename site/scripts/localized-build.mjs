import { readFile, readdir, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { createTranslator, localizedNavigationUrl, languageAvailable, normalizeText } from "../src/i18n/translate.mjs";
import config from "../src/i18n/config.json" with { type: "json" };
import { translateCalendar } from "../src/i18n/calendar.mjs";

import { logicalSource, localizedSource, isLocalizedSource } from "./content-files.mjs";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(siteRoot, "..");
const pageUrl=(url,language)=>localizedNavigationUrl(url,language,config);
const decode = text => text.replace(/&#(x[\da-f]+|\d+);/gi, (_, number) => String.fromCodePoint(number[0] === "x" ? parseInt(number.slice(1), 16) : Number(number)))
  .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, name) => ({amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" "})[name]);
const escape = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const stripFrontmatter = source => source.replace(/^\uFEFF/, "").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
async function walk(directory, extension) {
  let entries;
  try { entries = await readdir(directory, {withFileTypes:true}); } catch (error) { if(error.code === "ENOENT") return []; throw error; }
  const files = [];
  for(const entry of entries) {
    if(entry.isDirectory()) files.push(...await walk(path.join(directory,entry.name),extension));
    else if(entry.name.endsWith(extension)) files.push(path.join(directory,entry.name));
  }
  return files;
}
const leaves = html => html.split(/<[^>]*>/g).map(decode).map(normalizeText).filter(Boolean);
const normalizedWebsite=text=>text.replaceAll("DlE","DIE").replaceAll("dle","die");

async function loadCatalog(language) {
  const catalog = JSON.parse(await readFile(path.join(siteRoot,"src/i18n",language+".json"),"utf8"));
  const warnings = [];
  const translatedFiles = await localizedFiles(language);
  for(const englishPath of translatedFiles) {
    const relative = logicalSource(path.relative(repositoryRoot,englishPath).split(path.sep).join("/"));
    let source;
    try { source = await readFile(path.join(repositoryRoot,localizedSource(relative,config.defaultLanguage)),"utf8"); }
    catch { try { source=await readFile(path.join(repositoryRoot,relative),"utf8"); } catch { continue; } }
    const translated = await readFile(englishPath,"utf8");
    const originalTokens = marked.lexer(stripFrontmatter(source)).filter(token=>token.type!=="space");
    const englishTokens = marked.lexer(stripFrontmatter(translated)).filter(token=>token.type!=="space");
    if(originalTokens.length !== englishTokens.length) {
      warnings.push({source:relative,reason:"block-count",de:originalTokens.length,en:englishTokens.length});
      // Align by stable block type instead of shifting every later paragraph.
    }
    let cursor=0;
    for(const original of originalTokens) {
      let english=englishTokens[cursor];
      if(english?.type!==original.type) {
        const next=englishTokens.findIndex((token,index)=>index>=cursor&&index<cursor+4&&token.type===original.type);
        if(next<0) {warnings.push({source:relative,reason:"block-type",text:original.raw.slice(0,90)});continue;}
        cursor=next;english=englishTokens[cursor];
      }
      cursor++;
      const deHtml=marked.parser([original]),enHtml=marked.parser([english]);
      const dePlain=normalizeText(decode(deHtml.replace(/<[^>]*>/g,""))),enPlain=normalizeText(decode(enHtml.replace(/<[^>]*>/g,"")));
      if(dePlain!==enPlain) {
        catalog[dePlain]=enPlain;
        catalog[normalizedWebsite(dePlain)]=enPlain.replaceAll("DlE","DIE");
        if(original.type==="heading")catalog[normalizedWebsite(dePlain.replace(/^[^\p{L}\p{N}]+/u,""))]=enPlain.replace(/^[^\p{L}\p{N}]+/u,"").replaceAll("DlE","DIE");
      }
      const de=leaves(deHtml);
      const en=leaves(enHtml);
      const attributes=html=>[...html.matchAll(/\b(?:alt|title|aria-label)="([^"]*)"/g)].map(match=>decode(match[1]));
      const deAttrs=attributes(deHtml),enAttrs=attributes(enHtml);
      if(deAttrs.length===enAttrs.length)for(let index=0;index<deAttrs.length;index++)if(deAttrs[index]!==enAttrs[index])catalog[deAttrs[index]]=enAttrs[index];
      if(de.length!==en.length) {warnings.push({source:relative,reason:"inline-count",text:original.raw.slice(0,100),de:de.length,en:en.length});continue;}
      for(let index=0;index<de.length;index++) {
        if(de[index]!==en[index] && catalog[de[index]]===undefined) {
          catalog[de[index]]=en[index];
          catalog[normalizedWebsite(de[index])]=en[index].replaceAll("DlE","DIE");
        }
      }
    }
    // Metadata is visible on cards, article headers and social previews.
    for(const field of ["title","summary","description","category","location"]) {
      const pattern=new RegExp(`^${field}:\\s*["']?(.*?)["']?\\s*$`,"m");
      const original=source.match(pattern)?.[1],english=translated.match(pattern)?.[1];
      if(original&&english&&catalog[original]===undefined)catalog[original]=english;
    }
  }
  return {catalog,warnings};
}

function translateHtml(html, translate, language, sources) {
  let preservedDepth=0;
  // Keep scripts, styles, input values, identifiers and data attributes intact.
  const tokens=html.split(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<!--[^]*?-->|<[^>]*>)/gi);
  return tokens.map(token=> {
    if(preservedDepth){if(/^<\//.test(token))preservedDepth--;else if(/^<[^!]/.test(token)&&!/^<[^>]+\/>$/.test(token))preservedDepth++;return token;}
    if(/^<[^>]+\btranslate="no"/.test(token)){preservedDepth=1;return token;}
    if(/^<(?:script|style|!--)/i.test(token))return token;
    if(token.startsWith("<"))return token.replace(/(\s)(alt|title|placeholder|aria-label|content)="([^"]*)"/g,(match,space,attribute,value)=>`${space}${attribute}="${escape(translate(decode(value))).replaceAll('"',"&quot;")}"`)
      .replace(/(\s)(href|action|data-share-url)="([^"]*)"/g,(_,space,attribute,value)=> {
        let url=pageUrl(value,language);
        const repositoryMatch=value.match(/^(https:\/\/github\.com\/Anthlan\/drachenhalle\/blob\/main\/)(.+)$/);
        if(repositoryMatch) {
          const logical=logicalSource(decodeURIComponent(repositoryMatch[2]));
          if(sources.has(logical))url=repositoryMatch[1]+localizedSource(logical,language).split("/").map(encodeURIComponent).join("/");
        }
        if(value.startsWith(config.base+"/generated/events/")&&value.endsWith(".ics"))url=config.base+"/"+language+value.slice(config.base.length);
        return `${space}${attribute}="${url}"`;
      });
    return escape(translate(decode(token)));
  }).join("");
}

export default function localizedBuild() {
  return {name:"drachenhalle-languages",hooks:{"astro:build:done":async ({dir})=> {
    const out=fileURLToPath(dir);
    const htmlFiles=(await walk(out,".html")).filter(file=>!config.languages.some(language=>language.path&&path.relative(out,file).startsWith(language.path+path.sep)));
    for(const language of config.languages.filter(item=>item.code!==config.defaultLanguage)) {
      const {catalog,warnings}=await loadCatalog(language.code);
      const sources=new Set((await localizedFiles(language.code)).map(file=>logicalSource(path.relative(repositoryRoot,file).split(path.sep).join("/"))));
      const requiredSources=language.contentSources ?? (await localizedFiles(config.defaultLanguage)).map(file=>logicalSource(path.relative(repositoryRoot,file).split(path.sep).join("/")));
      const missing=requiredSources.filter(source=>!sources.has(source));
      const languageHtmlFiles=htmlFiles.filter(file=>languageAvailable(config.base+"/"+path.relative(out,file).split(path.sep).join("/").replace(/index\.html$/,""),language,config));
      if(missing.length)throw new Error(`Missing ${language.code} content translations: ${missing.join(", ")}`);
      if(warnings.length)throw new Error(`Translation structure differs: ${JSON.stringify(warnings)}`);
      const translate=createTranslator(catalog,language.locale);
      const runtimePath=path.join(out,"languages",language.code);
      await mkdir(runtimePath,{recursive:true});
      await writeFile(path.join(runtimePath,"catalog.json"),JSON.stringify(catalog));
      await writeFile(path.join(runtimePath,"catalog.mjs"),`export default ${JSON.stringify(catalog)};`);
      await writeFile(path.join(runtimePath,"runtime.js"),`const config=${JSON.stringify(config)};\n`+await readFile(path.join(siteRoot,"src/i18n/runtime.js"),"utf8"));
      await copyFile(path.join(siteRoot,"src/i18n/translate.mjs"),path.join(runtimePath,"translate.mjs"));
      for(const calendar of language.pages ? [] : await walk(path.join(out,"generated/events"),".ics")) {
        const target=path.join(out,language.path,path.relative(out,calendar));
        await mkdir(path.dirname(target),{recursive:true});
        await writeFile(target,translateCalendar(await readFile(calendar,"utf8"),translate));
      }
      for(const file of languageHtmlFiles) {
        const relative=path.relative(out,file);
        const germanUrl=config.base+"/"+relative.split(path.sep).join("/").replace(/index\.html$/,"" );
        const englishUrl=pageUrl(germanUrl,language.code);
        let html=translateHtml(await readFile(file,"utf8"),translate,language.code,sources);
        html=html.replace(/<html lang="de"/,`<html lang="${language.code}"`)
          .replace(/content="de_DE"/,`content="${language.locale.replace("-","_")}"`)
          .replaceAll(`https://anthlan.github.io${germanUrl}`,`https://anthlan.github.io${englishUrl}`);
        html=html.replace(/<head>/,`<head><script type="module" src="${config.base}/languages/${language.code}/runtime.js"></script>`);
        for(const choice of config.languages)html=html.replace(new RegExp(`hreflang="${choice.code}" href="[^"]*"`,"g"),`hreflang="${choice.code}" href="https://anthlan.github.io${pageUrl(germanUrl,choice.code)}"`);
        // Picker links must lead to counterparts, not both to the current language.
        for(const choice of config.languages)html=html.replace(new RegExp(`data-language="${choice.code}" href="[^"]*"`,"g"),`data-language="${choice.code}" href="${pageUrl(germanUrl,choice.code)}"`);
        html=html.replace(/(data-language="([^"]+)"[^>]*aria-current=")[^"]*/g,(_,prefix,code)=>prefix+(code===language.code?"true":"false"));
        const target=path.join(out,language.path,relative);
        await mkdir(path.dirname(target),{recursive:true});await writeFile(target,html);
      }
      await writeFile(path.join(runtimePath,"translation-report.json"),JSON.stringify({pages:languageHtmlFiles.length,entries:Object.keys(catalog).length,warnings},null,2));
      console.log(`[languages] ${language.code}: ${languageHtmlFiles.length} pages, ${Object.keys(catalog).length} translations, ${warnings.length} alignment notices`);
    }
  }}};
}

async function localizedFiles(language) { return (await walk(path.join(repositoryRoot,"content"),".md")).filter(file=>{const source=path.relative(repositoryRoot,file).split(path.sep).join("/");return isLocalizedSource(source)&&path.basename(path.dirname(file))===language;}); }
