import {createTranslator,localizedNavigationUrl} from "./translate.mjs";
import catalog from "./catalog.mjs";
// Localized static pages are fully readable without JavaScript. This module
// translates content produced later by shared interactive tools and galleries.
const language=document.documentElement.lang;
const base=config.base;
const t=createTranslator(catalog,config.languages.find(item=>item.code===language)?.locale);
globalThis.dieTranslate=t;
const pageLink=url=>localizedNavigationUrl(url,language,config);
function localize(root) {
  if(root.nodeType===Node.TEXT_NODE){if(!root.parentElement?.closest("script,style,[translate=no]")){const value=t(root.nodeValue);if(value!==root.nodeValue)root.nodeValue=value;}return;}
  if(root.nodeType!==Node.ELEMENT_NODE)return;
  if(root.matches("script,style,[translate=no]"))return;
  for(const attribute of ["title","alt","placeholder","aria-label"])if(root.hasAttribute(attribute)){const old=root.getAttribute(attribute),value=t(old);if(value!==old)root.setAttribute(attribute,value);}
  if(root.matches("a[href]")&&!root.hasAttribute("data-language")){const old=root.getAttribute("href"),value=pageLink(old);if(old!==value)root.setAttribute("href",value);}
  if(root.hasAttribute("data-share-url")){const old=root.getAttribute("data-share-url"),value=pageLink(old);if(old!==value)root.setAttribute("data-share-url",value);}
  for(const child of root.childNodes)localize(child);
}
localize(document.body);
const observer=new MutationObserver(records=> {
  observer.disconnect();
  for(const record of records){if(record.type==="characterData")localize(record.target);else if(record.type==="attributes")localize(record.target);else for(const node of record.addedNodes)localize(node);}
  observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["title","alt","placeholder","aria-label","href","data-share-url"]});
});
observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["title","alt","placeholder","aria-label","href","data-share-url"]});
document.querySelectorAll("[data-language]").forEach(link=> {
  const selected=link.dataset.language===language;
  link.setAttribute("aria-current",selected?"true":"false");
});
// Preserve hash and active filters when switching to the corresponding page.
document.addEventListener("click",event=> {
  const button=event.target.closest("[data-copy], [data-copy-text]");
  if(button?.dataset.copyText)button.dataset.copyText=t(button.dataset.copyText);
},true);
