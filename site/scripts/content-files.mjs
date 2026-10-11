import { readFile as fsReadFile, readdir as fsReaddir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "../src/i18n/config.json" with { type: "json" };
export const repositoryRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const sourceAreas=new Set(["Aktuelles","Allianz","Drachenwissen","Tutorials","Termine"]);
export const languageCodes=new Set(config.languages.map(item=>item.code));
export const isLocalizedSource=source=>source.startsWith("content/")&&languageCodes.has(path.posix.basename(path.posix.dirname(source)));
export function logicalSource(source){if(!isLocalizedSource(source))return source;const parts=source.split('/');parts.shift();parts.splice(-2,1);return parts.join('/');}
export const localizedSource=(source,language=config.defaultLanguage)=>path.posix.join('content',path.posix.dirname(logicalSource(source)),language,path.posix.basename(source));
export function contentPath(file,language=config.defaultLanguage){
 if(typeof file!=="string"||!file.toLowerCase().endsWith(".md"))return file;
 const relative=path.relative(repositoryRoot,file).split(path.sep).join('/');
 if(relative.startsWith("..")||path.isAbsolute(relative)||!sourceAreas.has(relative.split('/')[0]))return file;
 const localized=path.join(repositoryRoot,localizedSource(relative,language));return existsSync(localized)?localized:file;
}
export function normalizeContentLinks(file,text){
 const physical=path.relative(repositoryRoot,file).split(path.sep).join('/');
 if(!isLocalizedSource(physical)||typeof text!=="string")return text;
 const virtual=logicalSource(physical);
 return text.replace(/(!?\[[^\]]*\]\()([^\s)]+)/g,(match,prefix,url)=>{
 if(/^(?:[a-z]+:|\/|#)/i.test(url))return match;
 const [target,fragment]=url.split('#');
 const resolved=logicalSource(path.posix.normalize(path.posix.join(path.posix.dirname(physical),decodeURIComponent(target))));
 return prefix+path.posix.relative(path.posix.dirname(virtual),resolved).split('/').map(encodeURIComponent).join('/')+(fragment?'#'+fragment:'');});
}
export const readFile=async(file,...args)=>{const resolved=contentPath(file);return normalizeContentLinks(resolved,await fsReadFile(resolved,...args));};
export const repositorySource=source=>path.relative(repositoryRoot,contentPath(path.join(repositoryRoot,source))).split(path.sep).join('/');
export async function readdir(directory,options){
 const entries=await fsReaddir(directory,options).catch(e=>{if(e.code==='ENOENT')return [];throw e;});
 const relative=path.relative(repositoryRoot,directory);if(!sourceAreas.has(relative.split(path.sep)[0]))return entries;
 const localized=path.join(repositoryRoot,'content',relative,config.defaultLanguage);if(!existsSync(localized))return entries;
 const localizedEntries=(await fsReaddir(localized,options)).filter(e=>(typeof e==='string'?e:e.name).endsWith('.md'));
 const names=new Set(localizedEntries.map(e=>typeof e==='string'?e:e.name));return [...entries.filter(e=>!names.has(typeof e==='string'?e:e.name)),...localizedEntries];
}
