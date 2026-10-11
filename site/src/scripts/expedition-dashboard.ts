import {translateClient as t} from "../i18n/client";
import data from "../data/expedition-2026-10-10.json";
import { analyzeExpedition, allianceKey, share } from "./expedition-analysis";

const analysis = analyzeExpedition(data.players, data.alliances);
type Alliance = typeof analysis.alliances[number];
type Metric = "points" | "count" | "participation" | "average" | "pointsPerMember";
const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const number = (value: number) => Math.round(value).toLocaleString(document.documentElement.lang === "de" ? "de-DE" : document.documentElement.lang);
const percent = (value: number) => (value * 100).toLocaleString(document.documentElement.lang === "de" ? "de-DE" : document.documentElement.lang, {maximumFractionDigits:1}) + " %";
const compact = (value: number) => value >= 1e6 ? (value/1e6).toLocaleString(document.documentElement.lang === "de" ? "de-DE" : document.documentElement.lang,{maximumFractionDigits:2})+" Mio." : number(value);
const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]!));
const color = (server: number) => server === 105 ? "home" : server === 97 ? "opponent" : "others";
const serverFilter = $<HTMLSelectElement>("#exp-server");
const metricSelect = $<HTMLSelectElement>("#exp-metric");
const allianceSearch = $<HTMLInputElement>("#exp-alliance-search");
const detailSelect = $<HTMLSelectElement>("#exp-detail-select");
const playerSearch = $<HTMLInputElement>("#exp-player-search");
const playerAlliance = $<HTMLSelectElement>("#exp-player-alliance");
const playerSort = $<HTMLSelectElement>("#exp-player-sort");
const matchesServer = (server: number) => !serverFilter.value || (serverFilter.value === "other" ? ![105,97].includes(server) : server === Number(serverFilter.value));
let selectedAlliance = "105:DIE";
let page = 0;
const pageSize = 50;
const metricNames: Record<Metric,string> = {points:"Gesamtpunkte",count:"Teilnehmer",participation:"Beteiligungsquote",average:"Punkte pro Teilnehmer",pointsPerMember:"Punkte pro Allianzmitglied"};
const metricValue = (alliance: Alliance, metric: Metric) => alliance[metric];
const formatMetric = (value: number, metric: Metric) => metric === "participation" ? percent(value) : compact(value);

function allianceList() {
  const query = allianceSearch.value.trim().toLocaleLowerCase(document.documentElement.lang);
  const metric = metricSelect.value as Metric;
  return analysis.alliances.filter(a => matchesServer(a.server) && (!query || `${a.tag} ${a.name}`.toLocaleLowerCase(document.documentElement.lang).includes(query)))
    .sort((a,b) => (metricValue(b,metric) ?? -1) - (metricValue(a,metric) ?? -1) || b.points-a.points || a.key.localeCompare(b.key));
}

function renderAlliances() {
  const metric = metricSelect.value as Metric;
  const all = allianceList();
  const eligible = all.filter(a => metricValue(a,metric) !== null);
  const displayed = eligible.slice(0,15);
  const maximum = Math.max(0,...eligible.map(a => metricValue(a,metric)!));
  $("#chart-caption").textContent = `${displayed.length} von ${eligible.length} Allianzen · sortiert nach ${metricNames[metric]}. Wählt einen Balken für die Details.`;
  $("#exp-chart").innerHTML = displayed.length ? displayed.map(a => {
    const value = metricValue(a,metric)!;
    return `<button type="button" class="exp-bar-row" data-alliance="${escape(a.key)}" aria-pressed="${a.key===selectedAlliance}" title="${escape(a.name)} · S${a.server}: ${metric==='participation'?percent(value):number(value)} ${metric==='count'?'Teilnehmer':metric==='participation'?'':'Punkte'}"><span class="exp-bar-label"><b>${escape(a.tag||'—')}</b><small>S${a.server}</small></span><span class="exp-bar-track" aria-hidden="true"><span class="exp-bar-fill ${color(a.server)}" style="width:${share(value,maximum)*100}%;${value===0?'min-width:0':''}"></span></span><strong>${formatMetric(value,metric)}</strong></button>`;
  }).join("") : `<p class="exp-empty">${all.length ? 'Für diese Auswahl fehlen die Mitgliederzahlen. Wählt Gesamtpunkte, Teilnehmer oder Punkte pro Teilnehmer.' : 'Keine Allianz passt zu eurer Auswahl.'}</p>`;
  $("#alliance-table-count").textContent = `(${all.length})`;
  $("#exp-alliance-rows").innerHTML = all.length ? all.map(a=>`<tr><td><button type="button" data-alliance="${escape(a.key)}">[${escape(a.tag||'—')}] ${escape(a.name)}</button></td><td>S${a.server}</td><td class="num">${a.count}</td><td class="num">${a.members??'—'}</td><td class="num">${a.participation===null?'—':percent(a.participation)}</td><td class="num">${number(a.points)}</td><td class="num">${number(a.average)}</td><td class="num">${percent(a.serverShare)}</td></tr>`).join("") : '<tr><td colspan="8">Keine Allianz passt zu eurer Auswahl.</td></tr>';
  document.querySelectorAll<HTMLButtonElement>("button[data-alliance]").forEach(button => button.onclick = () => selectAlliance(button.dataset.alliance!,true));
}

function selectAlliance(key: string, focus = false) {
  const alliance = analysis.alliances.find(a => a.key === key);
  if (!alliance) return;
  selectedAlliance = key;
  detailSelect.value = key;
  $("#detail-title").textContent = `${alliance.tag==='DIE'?'Unsere Allianz DIE':alliance.tag?'['+alliance.tag+'] '+alliance.name:alliance.name} · S${alliance.server}`;
  const cards = [
    [number(alliance.points),"Gesamtpunkte"],
    [String(alliance.count),alliance.members!==null?`Teilnehmer / ${alliance.members} Mitglieder`:"Teilnehmer"],
    [alliance.participation===null?'—':percent(alliance.participation),"Beteiligungsquote"],
    [percent(alliance.serverShare),`Punkteanteil an S${alliance.server}`],
  ];
  $("#exp-detail-content").innerHTML = `<div class="exp-detail-stats">${cards.map(([value,label])=>`<div class="exp-detail-stat"><strong>${value}</strong><span>${escape(label)}</span></div>`).join('')}</div><div class="exp-detail-grid"><div><h3>Wie verteilen sich die Beiträge?</h3><p>Ø ${number(alliance.average)} Punkte pro Teilnehmer · Median ${number(alliance.median)} Punkte${alliance.pointsPerMember!==null?' · '+number(alliance.pointsPerMember)+' Punkte pro Allianzmitglied':''}.</p>${alliance.points ? `<div class="exp-concentration" role="img" aria-label="Punkteverteilung: Rang 1 ${percent(alliance.top1)}, Rang 2 bis 5 ${percent(alliance.top5-alliance.top1)}, übrige Spieler ${percent(1-alliance.top5)}"><span class="first" style="width:${alliance.top1*100}%"></span><span class="next-four" style="width:${(alliance.top5-alliance.top1)*100}%"></span><span class="rest" style="width:${(1-alliance.top5)*100}%"></span></div>` : '<p>Keine Punkte in der Rangliste.</p>'}<div class="exp-legend"><div><span><i style="background:var(--gold)"></i>Stärkster Beitrag</span><b>${percent(alliance.top1)}</b></div><div><span><i style="background:var(--opponent)"></i>Platz 2–5 innerhalb der Allianz</span><b>${percent(alliance.top5-alliance.top1)}</b></div><div><span><i style="background:#596382"></i>Übrige Teilnehmer</span><b>${percent(alliance.points?1-alliance.top5:0)}</b></div></div><p>Die Top 5 tragen <b>${percent(alliance.top5)}</b>, die Top 10 <b>${percent(alliance.top10)}</b> der Allianzpunkte.${alliance.members===null?' Für diese Allianz liegen keine Mitgliederzahlen vor.':''}</p></div><div><h3>Die fünf stärksten Beiträge</h3><ol class="exp-top-list">${alliance.players.slice(0,5).map(p=>`<li><span><small>#${p.rank}</small>${escape(p.player)}</span><strong>${number(p.points)}</strong></li>`).join('')||'<li>Keine Teilnehmer in der Rangliste.</li>'}</ol><button type="button" class="exp-link-button" id="exp-show-alliance-players">Alle ${alliance.count} Teilnehmer in der Rangliste ansehen →</button></div></div>`;
  $("#exp-show-alliance-players").onclick=()=>{
    serverFilter.value = [105,97].includes(alliance.server)?String(alliance.server):'other';
    playerAlliance.value=key;playerSearch.value='';page=0;renderAlliances();renderPlayers();$("#spieler").scrollIntoView({behavior:'smooth'});
  };
  renderAlliances();
  if(focus){$("#detail-title").focus({preventScroll:true});$("#allianz-detail").scrollIntoView({behavior:'smooth',block:'start'})}
}

function filteredPlayers() {
  const query = playerSearch.value.trim().toLocaleLowerCase(document.documentElement.lang);
  return data.players.filter(p => matchesServer(p.server) && (!playerAlliance.value || allianceKey(p)===playerAlliance.value) && (!query || p.player.toLocaleLowerCase(document.documentElement.lang).includes(query) || String(p.rank)===query.replace(/^#/,'')))
    .sort((a,b)=>playerSort.value==='name'?a.player.localeCompare(b.player,document.documentElement.lang)||a.rank-b.rank:playerSort.value==='points-asc'?a.points-b.points||a.rank-b.rank:a.rank-b.rank);
}

function renderPlayers() {
  const players=filteredPlayers();const totalPages=Math.max(1,Math.ceil(players.length/pageSize));page=Math.min(page,totalPages-1);
  const displayed=players.slice(page*pageSize,(page+1)*pageSize);
  $("#exp-player-count").textContent=`${players.length} von ${data.players.length} Spielern${serverFilter.value?' · Serverfilter aus dem Allianzvergleich ist aktiv':''}.`;
  $("#exp-player-rows").innerHTML=displayed.length?displayed.map(p=>`<tr><td class="num">${p.rank}</td><td>${escape(p.player)}</td><td>${p.tag?`<button type="button" data-player-alliance="${escape(allianceKey(p))}">[${escape(p.tag)}] ${escape(p.tag==='DIE'?'DIE':p.alliance)}</button>`:'Ohne Allianzangabe'}</td><td>S${p.server}</td><td class="num">${number(p.points)}</td></tr>`).join(''):'<tr><td colspan="5">Keine Spieler passen zu eurer Auswahl.</td></tr>';
  document.querySelectorAll<HTMLButtonElement>('[data-player-alliance]').forEach(button=>button.onclick=()=>selectAlliance(button.dataset.playerAlliance!,true));
  $("#exp-page").textContent=`Seite ${page+1} / ${totalPages}`;
  $<HTMLButtonElement>("#exp-prev").disabled=page===0;$<HTMLButtonElement>("#exp-next").disabled=page>=totalPages-1;
}

document.querySelectorAll<HTMLButtonElement>('[data-server-metric]').forEach(button=>button.onclick=()=>{
  const metric=button.dataset.serverMetric==='count'?'count':'points';
  const home=analysis.servers.find(s=>s.server===105)!;const opponent=analysis.servers.find(s=>s.server===97)!;
  const total=home[metric]+opponent[metric];const homeShare=share(home[metric],total);const opponentShare=share(opponent[metric],total);
  $("#server-share-bar").innerHTML=`<span class="home" style="width:${homeShare*100}%">S105 · ${percent(homeShare)}</span><span class="opponent" style="width:${opponentShare*100}%">S97 · ${percent(opponentShare)}</span>`;
  $("#server-share-bar").setAttribute('aria-label',`${metric==='count'?'Teilnehmer':'Punkte'}: S105 ${percent(homeShare)}, S97 ${percent(opponentShare)}`);
  document.querySelectorAll<HTMLButtonElement>('[data-server-metric]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
});
serverFilter.onchange=()=>{page=0;if(playerAlliance.value&&!analysis.alliances.some(a=>a.key===playerAlliance.value&&matchesServer(a.server)))playerAlliance.value='';renderAlliances();renderPlayers()};
metricSelect.onchange=renderAlliances;allianceSearch.oninput=renderAlliances;detailSelect.onchange=()=>selectAlliance(detailSelect.value);
playerSearch.oninput=()=>{page=0;renderPlayers()};playerAlliance.onchange=()=>{page=0;renderPlayers()};playerSort.onchange=()=>{page=0;renderPlayers()};
$("#exp-prev").onclick=()=>{page--;renderPlayers()};$("#exp-next").onclick=()=>{page++;renderPlayers()};
$("#exp-export").onclick=()=>{
  const cell=(value:string|number)=>typeof value==='number'?String(value):'"'+(/^[=+\-@]/.test(value)?"'":'')+value.replace(/"/g,'""')+'"';
  const heading=t('Rang;Spieler;Allianzkürzel;Allianz;Server;Punkte');
  const csv='\uFEFF'+[heading,...filteredPlayers().map(p=>[p.rank,p.player,p.tag,p.tag==='DIE'?'DIE':p.alliance,p.server,p.points].map(cell).join(';'))].join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='Expeditionswahnsinn_2026_10_10.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
selectAlliance(selectedAlliance);renderPlayers();
