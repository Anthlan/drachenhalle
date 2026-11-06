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
const root=document.querySelector<HTMLElement>('[data-planner]');
if(root){
  const get=<T extends Element>(selector:string)=>root.querySelector<T>(selector)!;
  const form=get<HTMLFormElement>('[data-editor]');
  const alliance=form.elements.namedItem('alliance') as HTMLSelectElement;
  const note=form.elements.namedItem('note') as HTMLTextAreaElement;
  const status=get<HTMLElement>('[data-status]');
  let plan:Plan={}; let selected=''; let activeAlliance=''; let suppressTokenClick=false;
  const message=(text:string)=>{status.textContent=t(text);};
  try{const saved=localStorage.getItem(key);if(saved)plan=validatePlan(JSON.parse(saved));}catch{message('Lokaler Plan konnte nicht geladen werden.');}
  function select(code:string){selected=code;get<HTMLElement>('[data-selection]').textContent=code;alliance.value=plan[code]?.alliance||'';note.value=plan[code]?.note||'';get<HTMLButtonElement>('[data-save]').disabled=false;get<HTMLButtonElement>('[data-clear]').disabled=false;render();}
  function render(){
    root!.querySelectorAll<HTMLButtonElement>('[data-cell]').forEach(button=>{const code=button.dataset.cell!;const entry=plan[code];button.dataset.plannerAlliance=entry?.alliance||'';button.setAttribute('aria-pressed',String(code===selected));button.setAttribute('aria-label',`${code}${entry?`: ${entry.alliance} ${entry.note}`:''}`);button.title=`${code} ${t(button.dataset.building || '')} ${button.dataset.level ? 'Lv'+button.dataset.level : ''}${entry?`: ${entry.alliance} ${entry.note}`:''}`;const span=button.querySelector<HTMLElement>('[data-assignment]')!;span.textContent=entry?(entry.alliance||'•'):'';});
    const list=get<HTMLUListElement>('[data-list]');list.replaceChildren();
    for(const [code,entry] of Object.entries(plan).sort(([a],[b])=>a.localeCompare(b,undefined,{numeric:true}))){const li=document.createElement('li');const button=document.createElement('button');button.type='button';button.textContent=`${code} · ${entry.alliance||t('Offen')}${entry.note?' · '+entry.note:''}`;button.onclick=()=>select(code);li.append(button);list.append(li);}
  }
  function persist(){render();try{localStorage.setItem(key,JSON.stringify(plan));message('Plan lokal gespeichert.');}catch{message('Speichern nicht möglich. Bitte den Plan exportieren.');}}
  function assign(code:string, tag:string){
    if(!alliances.includes(tag))return;
    plan[code]={alliance:tag,note:plan[code]?.note||''};select(code);persist();
  }
  root.querySelectorAll<HTMLButtonElement>('[data-alliance-token]').forEach(token=>{
    token.onclick=()=>{if(suppressTokenClick){suppressTokenClick=false;return;}activeAlliance=activeAlliance===token.dataset.allianceToken?'':token.dataset.allianceToken!;root.querySelectorAll<HTMLButtonElement>('[data-alliance-token]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.allianceToken===activeAlliance)));};
    let pointer: {id:number; x:number; y:number; ghost:HTMLElement|null} | null=null;
    token.onpointerdown=event=>{
      if(event.button!==0)return;
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
  form.onsubmit=event=>{event.preventDefault();if(!selected)return;plan[selected]={alliance:alliance.value,note:note.value.trim()};persist();};
  get<HTMLButtonElement>('[data-clear]').onclick=()=>{if(!selected)return;delete plan[selected];alliance.value='';note.value='';persist();};
  get<HTMLInputElement>('[data-zoom]').oninput=event=>{const value=(event.target as HTMLInputElement).value;get<HTMLElement>('[data-map]').style.width=value+'%';get<HTMLOutputElement>('[data-zoom-value]').value=value+' %';};
  get<HTMLButtonElement>('[data-export]').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,map:'season-2026-11-06',cells:plan},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='saisonplan-2026-11-06.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  get<HTMLInputElement>('[data-import]').onchange=async event=>{const input=event.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;try{if(file.size>500000)throw new Error('Too large');const data=JSON.parse(await file.text());if(data.version!==1||data.map!=='season-2026-11-06')throw new Error('Wrong map');const next=validatePlan(data.cells);if(!window.confirm(t('Lokalen Plan durch den importierten Plan ersetzen?')))return;plan=next;persist();if(selected)select(selected);}catch{message('Ungültige Plandatei. Der bisherige Plan bleibt erhalten.');}finally{input.value='';}};
  render();
}
