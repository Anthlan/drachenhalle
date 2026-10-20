import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {createContext,runInContext} from 'node:vm';
import {analyzeExpedition,allianceKey,share} from '../src/scripts/expedition-analysis.ts';
import current from '../src/data/expedition-2026-10-17.json' with {type:'json'};
import previous from '../src/data/expedition-2026-10-10.json' with {type:'json'};

test('slider recalculates full dashboard and preserves threshold in shared links',async()=>{
 const source=(await readFile(new URL('../src/scripts/expedition-dashboard.ts',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');
 const script=stripTypeScriptTypes(source,{mode:'strip'});
 for(const [data,opponent]of [[previous,97],[current,107]]){
  const nodes=new Map();
  const node=key=>{if(!nodes.has(key))nodes.set(key,{value:'',textContent:'',innerHTML:'',dataset:{},setAttribute(){},scrollIntoView(){},focus(){}});return nodes.get(key)};
  node('#expedition-data').textContent=JSON.stringify({...data,players:data.players.filter(p=>p.points>=1000),allPlayers:data.players,minimumPoints:1000,opponentServer:opponent});
  node('#exp-metric').value='points';node('#exp-player-sort').value='rank';
  const cards=[0,1].map(i=>({querySelector:s=>node('card'+i+s),querySelectorAll:s=>s==='p b'?[node('p'+i+'0'),node('p'+i+'1')]:[0,1,2].map(j=>node('stat'+i+j))}));
  const extra={querySelectorAll:()=>[],querySelector:()=>node('extra-small'),insertBefore(){}};
  const shareButton={dataset:{shareUrl:'/drachenhalle/auswertungen/expeditionswahnsinn/2026-10-17/'}};
  const metricButton={dataset:{serverMetric:'points'},setAttribute(){},click(){this.onclick()}};
  const document={documentElement:{lang:'de'},querySelector:s=>s==='.exp-extra'?extra:s==='[data-server-metric][aria-pressed="true"]'?metricButton:node(s),querySelectorAll:s=>s==='.exp-scorecard'?cards:s==='[data-share-page]'?[shareButton]:s==='[data-server-metric]'?[metricButton]:[],createElement:()=>({textContent:''})};
  const location={href:'http://localhost/drachenhalle/auswertungen/expeditionswahnsinn/?view=content',search:'?view=content'};
  const context=createContext({document,window:{addEventListener(){}},location,history:{replaceState(a,b,url){location.href=String(url);location.search=url.search;}},URL,URLSearchParams,analyzeExpedition,allianceKey,share,t:s=>s});
  runInContext(script,context);
  for(const minimum of [1000,25000,50000,100000,500000,1000000,1000]){
   node('#exp-minimum').value=String(minimum);node('#exp-minimum').oninput();
   const expected=analyzeExpedition(data.players.filter(p=>p.points>=minimum),data.alliances);
   assert.equal(node('#exp-selected-count').textContent,String(expected.count));
   assert.equal(node('stat00').textContent,String(expected.servers.find(s=>s.server===105).count));
   assert.equal(node('#exp-minimum-number').value,String(minimum));
   assert.ok(shareButton.dataset.shareUrl.includes('min='+minimum));
   assert.ok(location.search.includes('view=content'));
   assert.equal(runInContext('filteredPlayers().length',context),expected.count);
  }
 }
});
