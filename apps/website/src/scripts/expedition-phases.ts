const payload=document.querySelector('#exp-phase-data');
if(payload){
 const pairs=JSON.parse(payload.textContent||'[]') as {server:number;beforePoints:number;afterPoints:number}[];
 const render=()=>{
  const minimum=Number((document.querySelector('#exp-minimum') as HTMLInputElement).value);
  const filtered=pairs.filter(p=>p.beforePoints>=minimum&&p.afterPoints>=minimum);
  const number=(value:number)=>value.toLocaleString(document.documentElement.lang||'de');
  document.querySelector('#exp-phase-rows')!.innerHTML=[105,109,112].map(server=>{
   const rows=filtered.filter(p=>p.server===server);
   const before=rows.reduce((sum,p)=>sum+p.beforePoints,0),after=rows.reduce((sum,p)=>sum+p.afterPoints,0);
   return `<tr><td>S${server}</td><td>${number(rows.length)}</td><td>${number(before)}</td><td>${number(after)}</td><td>+${number(after-before)}</td></tr>`;
  }).join('');
 };
 document.querySelector('#exp-minimum')?.addEventListener('input',render);
 document.querySelector('#exp-minimum-number')?.addEventListener('change',render);
 window.addEventListener('pageshow',render);render();
}
