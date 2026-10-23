import {readFile, mkdir, access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import config from '../src/i18n/config.json' with {type:'json'};

const site=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(site,'../..');
for(const {code} of config.languages){
  const source=path.join(root,'content/Bildgeschichten',code);
  const story=JSON.parse(await readFile(path.join(source,'Der_verbotene_Knopf.json'),'utf8'));
  if(story.pages.length!==3 || story.pages.some(page=>!page.alt || !page.description || !page.dialogue.length))throw Error(`Unvollständiger Comic-Lesetext: ${code}`);
  const destination=path.join(site,'public/stories/verbotener-knopf',code);
  await mkdir(destination,{recursive:true});
  for(let page=1;page<=3;page++){
    const number=String(page).padStart(2,'0');
    const input=path.join(source,`Der_verbotene_Knopf_Seite_${number}.png`);
    await access(input);
    await sharp(input).webp({quality:94}).toFile(path.join(destination,`seite-${number}.webp`));
  }
}
console.log(`Bildgeschichten: ${config.languages.length} vollständige Sprachfassungen mit je drei Bildseiten.`);
