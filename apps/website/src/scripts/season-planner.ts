import { createPlanSync } from './season-plan-sync';
import { translateClient as t } from '../i18n/client';
type Entry = {alliance:string; note:string};
type Plan = Record<string,Entry>;
const alliances = ['GGR','CCE','BTs','Lrs','IGGG','TuT','BOD','DIE','LIG','Beep'];
const key='die-season-planning-2026-11-06-v1';
export function validatePlan(value:unknown): Plan {
  if(!value || typeof value!=='object' || Array.isArray(value)) throw new Error('Invalid plan');
  const plan:Plan={};
  for(const [code,entry] of Object.entries(value)) {
    if(!/^[A-T](?:[1-9]|1[0-9]|20)$/.test(code) || !entry || typeof entry!=='object' || Array.isArray(entry)) throw new Error('Invalid cell');
    const {alliance,note}=entry as Entry;
    if(typeof alliance!=='string' || (alliance!=='' && !alliances.includes(alliance) && alliance !== 'BTS') || typeof note!=='string' || note.length>300) throw new Error('Invalid entry');
    plan[code]={alliance:alliance === 'BTS' ? 'BTs' : alliance,note};
  }
  return plan;
}
export function encodeSharedPlan(plan:Plan): string {
  return encodeURIComponent(JSON.stringify(Object.entries(validatePlan(plan)).map(([code,entry])=>[code,entry.alliance,entry.note])));
}
export function decodeSharedPlan(encoded:string): Plan {
  if(encoded.length>500000)throw new Error('Link too large');
  const rows=JSON.parse(decodeURIComponent(encoded));
  if(!Array.isArray(rows)||rows.length>400)throw new Error('Invalid shared plan');
  const cells:Record<string,Entry>=Object.create(null);
  for(const row of rows){if(!Array.isArray(row)||row.length!==3||typeof row[0]!=='string'||Object.hasOwn(cells,row[0]))throw new Error('Invalid shared cell');cells[row[0]]={alliance:row[1],note:row[2]};}
  return validatePlan(cells);
}
const root=document.querySelector<HTMLElement>('[data-planner]');
if(root){
  const get=<T extends Element>(selector:string)=>root.querySelector<T>(selector)!;
  const form=get<HTMLFormElement>('[data-editor]');
  const alliance=form.elements.namedItem('alliance') as HTMLSelectElement;
  const note=form.elements.namedItem('note') as HTMLTextAreaElement;
  const status=get<HTMLElement>('[data-status]');
  let plan:Plan={}; let selected=''; let activeAlliance=''; let suppressTokenClick=false;
  const endpoint=root.dataset?.planEndpoint || '';
  const snapshotMode=typeof location!=='undefined'&&location.hash.startsWith('#plan=');
  const liveMode=Boolean(endpoint)&&!snapshotMode;
  let writable=!liveMode;
  let sync:ReturnType<typeof createPlanSync>|undefined;
  let editToken='';
  if(liveMode){
    const hash=new URLSearchParams(location.hash.slice(1));
    try{editToken=hash.get('edit')||sessionStorage.getItem('die-season-edit')||'';if(hash.has('edit')){sessionStorage.setItem('die-season-edit',editToken);history.replaceState(null,'',location.pathname+location.search);}}catch{editToken=hash.get('edit')||'';}
  }
  const syncStatus=(text:string)=>{const el=root.querySelector<HTMLElement>('[data-sync-status]');if(el)el.textContent=t(text);};
  function updatePermissions(){
    root!.querySelectorAll<HTMLButtonElement>('[data-alliance-token]').forEach(button=>button.disabled=!writable);
    alliance.disabled=!writable;note.disabled=!writable;
    get<HTMLButtonElement>('[data-save]').disabled=!writable||!selected;
    get<HTMLButtonElement>('[data-clear]').disabled=!writable||!selected;
    get<HTMLInputElement>('[data-import]').disabled=!writable;
    get<HTMLButtonElement>('[data-share-edit]').hidden=!(liveMode&&writable&&editToken);
  }
  const message=(text:string)=>{status.textContent=t(text);};
  try{const saved=localStorage.getItem(key);if(saved)plan=validatePlan(JSON.parse(saved));}catch{message('Lokaler Plan konnte nicht geladen werden.');}
  if(typeof location!=='undefined' && location.hash.startsWith('#plan=')){
    try{plan=decodeSharedPlan(location.hash.slice(6));message('Geteilter Plan geladen. Änderungen bleiben in deinem Browser.');}
    catch{message('Der geteilte Plan ist ungültig. Dein lokaler Plan bleibt erhalten.');}
  }
  get<HTMLButtonElement>('[data-share-plan]').onclick=async()=>{
    const url=new URL('https://anthlan.github.io'+location.pathname);
    if(!liveMode)url.hash='plan='+encodeSharedPlan(plan);
    const field=get<HTMLInputElement>('[data-share-link]');field.value=url.href;field.hidden=false;
    try{await navigator.clipboard.writeText(url.href);message('Link zum aktuellen Plan kopiert.');}
    catch{field.focus();field.select();message('Bitte den angezeigten Planlink kopieren.');}
  };
  const localBackup:Plan=JSON.parse(JSON.stringify(plan));
  if(liveMode)plan={};
  function select(code:string){selected=code;get<HTMLElement>('[data-selection]').textContent=code;alliance.value=plan[code]?.alliance||'';note.value=plan[code]?.note||'';updatePermissions();render();}
  function render(){
    root!.querySelectorAll<HTMLButtonElement>('[data-cell]').forEach(button=>{const code=button.dataset.cell!;const entry=plan[code];button.dataset.plannerAlliance=entry?.alliance||'';button.setAttribute('aria-pressed',String(code===selected));button.setAttribute('aria-label',`${code}${entry?`: ${entry.alliance} ${entry.note}`:''}`);button.title=`${code} ${t(button.dataset.building || '')} ${button.dataset.level ? 'Lv'+button.dataset.level : ''}${entry?`: ${entry.alliance} ${entry.note}`:''}`;const span=button.querySelector<HTMLElement>('[data-assignment]')!;span.textContent='';});
    const list=get<HTMLUListElement>('[data-list]');list.replaceChildren();
    for(const [code,entry] of Object.entries(plan).sort(([a],[b])=>a.localeCompare(b,undefined,{numeric:true}))){const li=document.createElement('li');const button=document.createElement('button');button.type='button';button.textContent=`${code} · ${entry.alliance||t('Offen')}${entry.note?' · '+entry.note:''}`;button.onclick=()=>select(code);li.append(button);list.append(li);}
  }
  function persist(){render();if(sync)sync.save(plan);get<HTMLInputElement>('[data-share-link]').hidden=true;if(typeof location!=='undefined'&&location.hash.startsWith('#plan='))history.replaceState(null,'',location.pathname+location.search);try{localStorage.setItem(key,JSON.stringify(plan));if(!liveMode)message('Plan lokal gespeichert.');}catch{message('Speichern nicht möglich. Bitte den Plan exportieren.');}}
  function assign(code:string, tag:string){
    if(!writable||!alliances.includes(tag))return;
    plan[code]={alliance:tag,note:plan[code]?.note||''};select(code);persist();
  }
  root.querySelectorAll<HTMLButtonElement>('[data-alliance-token]').forEach(token=>{
    token.onclick=()=>{if(suppressTokenClick){suppressTokenClick=false;return;}activeAlliance=activeAlliance===token.dataset.allianceToken?'':token.dataset.allianceToken!;root.querySelectorAll<HTMLButtonElement>('[data-alliance-token]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.allianceToken===activeAlliance)));};
    let pointer: {id:number; x:number; y:number; ghost:HTMLElement|null} | null=null;
    token.onpointerdown=event=>{
      if(!writable||event.button!==0)return;
      event.preventDefault();
      pointer={id:event.pointerId,x:event.clientX,y:event.clientY,ghost:null};
      token.setPointerCapture(event.pointerId);
    };
    token.onpointermove=event=>{
      if(!pointer||event.pointerId!==pointer.id)return;
      if(!pointer.ghost&&Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)<6)return;
      event.preventDefault();
      if(!pointer.ghost){pointer.ghost=document.createElement('div');pointer.ghost.textContent=token.dataset.allianceToken!;pointer.ghost.dataset.plannerAlliance=token.dataset.allianceToken!;pointer.ghost.setAttribute('aria-hidden','true');Object.assign(pointer.ghost.style,{position:'fixed',pointerEvents:'none',zIndex:'9999',background:'var(--alliance-color,#fff)',color:'var(--alliance-ink,#111)',padding:'8px 14px',border:'2px solid #075bff',borderRadius:'5px'});document.body.append(pointer.ghost);}
      pointer.ghost.style.left=event.clientX+12+'px';pointer.ghost.style.top=event.clientY+12+'px';
    };
    token.onpointerup=event=>{
      if(!pointer||event.pointerId!==pointer.id)return;
      const dragged=Boolean(pointer.ghost);pointer.ghost?.remove();pointer=null;
      if(dragged){suppressTokenClick=true;const target=document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLElement>('[data-cell]');if(target&&root.contains(target))assign(target.dataset.cell!,token.dataset.allianceToken!);}
    };
    token.onpointercancel=()=>{pointer?.ghost?.remove();pointer=null;};
    token.ondragstart=event=>{event.dataTransfer?.setData('application/x-die-alliance',token.dataset.allianceToken!);if(event.dataTransfer)event.dataTransfer.effectAllowed='copy';};
  });
  root.querySelectorAll<HTMLButtonElement>('[data-cell]').forEach(button=>{
    button.onclick=()=>activeAlliance?assign(button.dataset.cell!,activeAlliance):select(button.dataset.cell!);
    button.ondragover=event=>{if(event.dataTransfer?.types.includes('application/x-die-alliance')){event.preventDefault();event.dataTransfer.dropEffect='copy';button.dataset.dropTarget='true';}};
    button.ondragleave=()=>delete button.dataset.dropTarget;
    button.ondrop=event=>{event.preventDefault();delete button.dataset.dropTarget;const tag=event.dataTransfer?.getData('application/x-die-alliance')||'';assign(button.dataset.cell!,tag);};
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){activeAlliance='';root.querySelectorAll('[data-alliance-token]').forEach(b=>b.setAttribute('aria-pressed','false'));}});
  form.onsubmit=event=>{event.preventDefault();if(!writable||!selected)return;plan[selected]={alliance:alliance.value,note:note.value.trim()};persist();};
  get<HTMLButtonElement>('[data-clear]').onclick=()=>{if(!writable||!selected)return;delete plan[selected];alliance.value='';note.value='';persist();};
  get<HTMLInputElement>('[data-zoom]').oninput=event=>{const value=(event.target as HTMLInputElement).value;get<HTMLElement>('[data-map]').style.width=value+'%';get<HTMLOutputElement>('[data-zoom-value]').value=value+' %';};
  get<HTMLButtonElement>('[data-export]').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,map:'season-2026-11-06',cells:plan},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='saisonplan-2026-11-06.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  get<HTMLButtonElement>('[data-export-image]').onclick=()=>{
    const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=1100;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    ctx.fillStyle='#fff';ctx.fillRect(0,0,1440,1100);ctx.fillStyle='#17212b';ctx.font='bold 24px sans-serif';ctx.fillText(t('Kartenplaner'),20,32);
    root.querySelectorAll<HTMLButtonElement>('[data-alliance-token]').forEach((token,i)=>{const style=getComputedStyle(token);const x=20+i*140;ctx.fillStyle=style.getPropertyValue('--alliance-color');ctx.fillRect(x,48,130,30);ctx.fillStyle=style.getPropertyValue('--alliance-ink');ctx.font='bold 15px sans-serif';ctx.fillText(token.dataset.allianceToken!,x+10,69);});
    const cellWidth=70,cellHeight=48,top=110,left=20;
    ctx.textAlign='center';ctx.font='12px sans-serif';ctx.fillStyle='#17212b';for(let i=0;i<20;i++)ctx.fillText(String.fromCharCode(65+i),left+(i+.5)*cellWidth,top-7);
    root.querySelectorAll<HTMLButtonElement>('[data-cell]').forEach(button=>{
      const code=button.dataset.cell!;const x=left+(code.charCodeAt(0)-65)*cellWidth;const y=top+(Number(code.slice(1))-1)*cellHeight;const style=getComputedStyle(button);
      ctx.fillStyle=style.backgroundColor;ctx.fillRect(x,y,cellWidth,cellHeight);if(button.dataset.capital)return;ctx.strokeStyle='#777';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,cellWidth-1,cellHeight-1);
      if(button.dataset.capital)return;
      ctx.fillStyle=style.color;ctx.font='8px sans-serif';ctx.textAlign='left';ctx.fillText(code,x+4,y+10);
      if(button.dataset.level){ctx.strokeStyle='#17212b';ctx.lineWidth=3;ctx.strokeRect(x+1.5,y+1.5,cellWidth-3,cellHeight-3);ctx.textAlign='center';ctx.font='9px sans-serif';const words=t(button.dataset.building||'').split(' ');let line='',lines:string[]=[];for(const word of words){if(ctx.measureText(line+' '+word).width>64&&line){lines.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)lines.push(line);lines.slice(0,2).forEach((text,i)=>ctx.fillText(text,x+35,y+21+i*10));ctx.fillText('Lv'+button.dataset.level,x+35,y+43);}
    });
    const capitalX=left+9*cellWidth,capitalY=top+9*cellHeight;ctx.strokeStyle='#17212b';ctx.lineWidth=4;ctx.strokeRect(capitalX+2,capitalY+2,136,92);ctx.textAlign='center';ctx.font='bold 16px sans-serif';ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.strokeText(t('Hauptstadt'),capitalX+70,capitalY+43);ctx.fillStyle='#111';ctx.fillText(t('Hauptstadt'),capitalX+70,capitalY+43);ctx.font='13px sans-serif';ctx.strokeText('Lv7',capitalX+70,capitalY+63);ctx.fillText('Lv7',capitalX+70,capitalY+63);
    canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='saisonkarte-2026-11-06.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');
  };
  get<HTMLInputElement>('[data-import]').onchange=async event=>{if(!writable)return;const input=event.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;try{if(file.size>500000)throw new Error('Too large');const data=JSON.parse(await file.text());if(data.version!==1||data.map!=='season-2026-11-06')throw new Error('Wrong map');const next=validatePlan(data.cells);if(!window.confirm(t(liveMode?'Gemeinsamen Plan durch die importierte Datei ersetzen?':'Lokalen Plan durch den importierten Plan ersetzen?')))return;plan=next;persist();if(selected)select(selected);}catch{message('Ungültige Plandatei. Der bisherige Plan bleibt erhalten.');}finally{input.value='';}};
  get<HTMLButtonElement>('[data-seed-local]').onclick=()=>{if(!writable||Object.keys(plan).length)return;plan=JSON.parse(JSON.stringify(localBackup));persist();};
  get<HTMLButtonElement>('[data-share-edit]').onclick=async()=>{
    const url=new URL('https://anthlan.github.io'+location.pathname);url.hash='edit='+encodeURIComponent(editToken);
    const field=get<HTMLInputElement>('[data-share-link]');field.value=url.href;field.hidden=false;
    try{await navigator.clipboard.writeText(url.href);message('Bearbeitungslink kopiert. Nur an berechtigte Allianzen weitergeben.');}catch{field.focus();field.select();}
  };
  updatePermissions();
  if(liveMode){
    syncStatus('Gemeinsamer Plan wird geladen.');
    sync=createPlanSync({endpoint,token:editToken,validate:validatePlan,onState:(cells,canEdit)=>{plan=cells;writable=canEdit;updatePermissions();get<HTMLButtonElement>('[data-seed-local]').hidden=!canEdit||Object.keys(cells).length>0||Object.keys(localBackup).length===0;render();},onStatus:syncStatus});
    window.addEventListener('beforeunload',event=>{if(sync?.hasPending()){event.preventDefault();event.returnValue='';}});
    window.addEventListener('pagehide',()=>sync?.stop());
  }else syncStatus(snapshotMode?'Geteilter Planstand · Lokale Kopie':'Lokaler Plan · Gemeinsamer Speicher noch nicht eingerichtet');
  render();
}
