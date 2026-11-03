/* ================= v51: smarter practice, demos you can check, song play-alongs, a clearer You page ================= */
/* ---- review: passed checkpoints and demos come back before you forget them ---- */
function srsSyncCourse(){try{const S=jStore();jUnits().flat().forEach(u=>{const s=S[u.key];if(s&&s.passed)srsAdd({id:'jq-'+u.key,title:'Quiz: '+u.t,href:'#jq-'+u.key})})}catch(e){}}
/* ---- Today: built around what needs work ---- */
function weakSpots(){const out=[];try{const S=jStore();const n=stageNow();const Q=cQuizUnits(n);const units=(Q?Q.list:[]).concat(jUnits().flat());const failed=units.find(u=>{const s=S[u.key];return s&&!s.passed&&s.att>0});
  if(failed&&jUnlocked(failed.lv))out.push({k:'quiz',b:{name:'Retake: '+failed.t,href:'#jq-'+failed.key,what:`Your best so far is ${S[failed.key].best}/20. Read the lesson first, then try again.`}})}catch(e){}
 try{const due=srsDue();if(due.length)out.push({k:'review',b:{name:'Review',href:'#review',what:`${due.length} thing${due.length>1?'s':''} to refresh before you forget ${due.length>1?'them':'it'}.`}})}catch(e){}
 try{const st=store.get('stats',{})||{};let worst=null;for(const id in st){const s=st[id];if(s.a<8)continue;const h=s.h&&s.h.length>=6?s.h.reduce((a,x)=>a+x,0)/s.h.length:s.c/s.a;if(h<.7&&(!worst||h<worst[1]))worst=[id,h]}
  if(worst){const T=(typeof TOPICS!=='undefined'&&TOPICS.find(t=>t.id===worst[0]))||null;const nm=T?T.label||T.name||worst[0]:worst[0];out.push({k:'drill',b:{name:'Drill: '+nm,href:'#practice',what:`You're getting about ${Math.round(worst[1]*100)}% right lately. Pick “${nm}” in the topics and do one round.`}})}}catch(e){}
 try{const L=store.get('lastScore',null);if(L&&L.pct<85&&L.bars&&L.bars.length&&Date.now()-L.at<14*864e5)out.push({k:'bars',b:{name:'Fix the tricky bars',href:'#tools-isolate',what:`In “${L.title}” you scored ${L.pct}%. Loop bar${L.bars.length>1?'s':''} ${L.bars.slice(0,3).map(b=>b+1).join(', ')} slowly, then speed up.`}})}catch(e){}
 return out}
{const _tb=todayBlocks;todayBlocks=function(mins){if(mins<=5){const B=_tb(15);return[Object.assign({},B[1],{mins:3}),Object.assign({},B[2],{mins:2})]}
 const B=_tb(mins);const W=weakSpots();if(!W.length)return B;
 /* swap the theory/ear or jam part (or the last part) for the most useful fix */
 const slots=B.map((b,i)=>[b,i]).filter(([b])=>/^Theory|Groove|Jam along|Checkpoint/.test(b.name));const used=new Set();
 W.slice(0,mins>=50?2:1).forEach(w=>{const s=slots.find(([,i])=>!used.has(i));if(!s)return;used.add(s[1]);B[s[1]]=Object.assign({},w.b,{mins:B[s[1]].mins,why:true})});return B}}
/* a busy-day option */
{const _vt=viewToday;viewToday=function(){srsSyncCourse();_vt.apply(this,arguments);try{const pills=main.querySelector('.todayhead .pills');if(pills&&!pills.querySelector('[data-v="5"]')){pills.insertAdjacentHTML('afterbegin',`<button class="pill" data-v="5" aria-pressed="${dayMins()===5}">5 min</button>`);pills.querySelector('[data-v="5"]').onclick=()=>{store.set('todayMins',5);viewToday()}}
  if(dayMins()===5){const h=main.querySelector('.today h2');if(h&&!SESSION)h.textContent='5 minutes';const p=main.querySelector('.today>.hint');if(p)p.textContent='A busy day? Five minutes still counts, and keeps your streak going.'}
  main.querySelectorAll('.todaylist li').forEach((li,i)=>{});const J=(store.get('journal',[])||[])[0];if(J&&J.note){main.querySelector('.today').insertAdjacentHTML('beforeend',`<p class="hint todaynote">Last time you wrote: “${esc(J.note.slice(0,160))}”</p>`)}}catch(e){}}}

/* ---- the end of a session: a summary and a note for next time ---- */
function sessSummary(mins,blocks){if(document.getElementById('sumov'))return;const streak=playStreak();const n=stageNow();const X=cData().stages[n];const st=cState();const next=X.goals.find((_,i)=>!(st.goals&&st.goals[n+'.'+i]));
 const ov=document.createElement('div');ov.id='sumov';ov.className='wnov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','sumt');
 ov.innerHTML=`<div class="wnbox panel"><span class="eyebrow">Practice done</span><h2 id="sumt">${mins>=1?`${Math.round(mins)} minutes. Nice work.`:'Nice work.'}</h2>
  <ul class="sumlist">${blocks.map(b=>`<li>✓ ${esc(b.name)}</li>`).join('')}</ul>
  <p>${streak>1?`That's <b>${streak} days</b> in a row.`:'Come back tomorrow to start a streak.'}${next?` Tomorrow, keep going with: <b>${esc(next)}</b>`:''}</p>
  <label class="onbf" for="sumnote">A note for next time <span class="hint">(optional: what was hard, what to try)</span><textarea id="sumnote" rows="2" maxlength="300" placeholder="e.g. The change from C to G is still slow"></textarea></label>
  <div class="row"><button class="btn primary" id="sumok">Done</button></div></div>`;
 document.body.appendChild(ov);const t=ov.querySelector('#sumnote');setTimeout(()=>t.focus(),50);
 const close=()=>{const note=t.value.trim();const J=store.get('journal',[])||[];J.unshift({d:todayKey(),mins:Math.round(mins),note,blocks:blocks.map(b=>b.name)});store.set('journal',J.slice(0,200));ov.remove();if(location.hash===''||location.hash==='#home')route()};
 ov.querySelector('#sumok').onclick=close;ov.addEventListener('keydown',e=>{if(e.key==='Escape')close()})}
{const _sb=sessBar;let last=null;sessBar=function(){if(SESSION)last={blocks:SESSION.blocks.slice(0,SESSION.i+1),start:last&&last.start||Date.now(),acc:PT.on?PT.acc:0};const was=PT.on&&PT.bySession;const acc=PT.acc;_sb.apply(this,arguments);if(!SESSION&&was&&last){const m=Math.max(acc,PT.acc)/60;const b=last.blocks;last=null;if(m>=1)sessSummary(m,b)}if(!SESSION)last=null}}

/* ---- practice reminders ---- */
const REM={iv:null};
function remCfg(){return store.get('remind',{on:false,time:'18:00'})||{on:false,time:'18:00'}}
async function remNotify(title,body){try{const N=window.__TAURI__&&window.__TAURI__.notification;if(N){let ok=await N.isPermissionGranted();if(!ok)ok=(await N.requestPermission())==='granted';if(ok){N.sendNotification({title,body});return true}return false}}catch(e){}
 try{if('Notification' in window){if(Notification.permission==='default')await Notification.requestPermission();if(Notification.permission==='granted'){new Notification(title,{body});return true}}}catch(e){}return false}
function remTick(){const c=remCfg();if(!c.on)return;const now=new Date();const[h,m]=c.time.split(':').map(Number);if(now.getHours()*60+now.getMinutes()<h*60+m)return;const k=todayKey();if(store.get('remindDone','')===k)return;const L=store.get('plog',{})||{};store.set('remindDone',k);if((L[k]||0)>=300)return;remNotify('Time to practise','Today\'s practice is ready in Theory Club. Even five minutes keeps your streak.')}
async function remSchedule(){/* the Android app can remind you even when it's closed */try{const N=window.__TAURI__&&window.__TAURI__.notification;if(!N||!DROID)return;const c=remCfg();try{await N.cancelAll()}catch(e){}if(!c.on)return;const[h,m]=c.time.split(':').map(Number);const d=new Date();d.setHours(h,m,0,0);if(d<new Date())d.setDate(d.getDate()+1);if(N.Schedule&&N.Schedule.at)await N.sendNotification({id:51,title:'Time to practise',body:'Today\'s practice is ready in Theory Club.',schedule:N.Schedule.at(d,true,true)})}catch(e){}}
REM.iv=setInterval(remTick,60000);setTimeout(remTick,5000);
new MutationObserver(()=>{const b=document.getElementById('setbody');if(!b||!b.firstChild||document.getElementById('setrem'))return;const c=remCfg();
 b.insertAdjacentHTML('beforeend',`<div class="pickrow" id="setrem"><span class="eyebrow">Practice reminder</span><label class="row" style="gap:8px;align-items:center;flex-wrap:wrap"><input type="checkbox" id="remon" ${c.on?'checked':''}> Remind me at <input type="time" id="remtime" value="${esc(c.time)}" aria-label="Reminder time"></label><p class="hint">${DROID?'You get a notification at this time if you haven\'t practised yet.':TAU?'While the app is open, it reminds you at this time if you haven\'t practised yet.':'While this page is open, it reminds you at this time if you haven\'t practised yet.'}</p></div>`);
 const save=async()=>{const on=document.getElementById('remon').checked,time=document.getElementById('remtime').value||'18:00';store.set('remind',{on,time});store.set('remindDone','');if(on){const ok=await remNotify('Reminders are on',`Theory Club will remind you at ${time}.`);if(!ok)toast('Allow notifications for reminders to work.')}remSchedule()};
 document.getElementById('remon').onchange=save;document.getElementById('remtime').onchange=save}).observe(document.body,{childList:true,subtree:true});

/* ---- animated demos, with a "Check me" that listens ---- */
const DEMO_CH={G:[3,2,0,0,0,3],C:[null,3,2,0,1,0],D:[null,null,0,2,3,2],Em:[0,2,2,0,0,0],Am:[null,0,2,2,1,0],A:[null,0,2,2,2,0],E:[0,2,2,1,0,0]};
const DEMO_FG={G:[2,1,0,0,0,3],C:[0,3,2,0,1,0],D:[0,0,0,1,3,2],Em:[0,2,3,0,0,0],Am:[0,0,2,3,1,0],A:[0,0,1,2,3,0],E:[0,2,3,1,0,0]};
const GT=[40,45,50,55,59,64],BT=[28,33,38,43];
const CDEMOS={
 guitar:{1:{t:'Changing between G, C and D',kind:'chords',seq:['G','C','D','G'],bpm:60,goal:2},2:{t:'Strumming: down, down-up, up-down-up',kind:'strum',chord:'G',pat:'D.DU.UDU',bpm:70},3:{t:'The A minor pentatonic, first box',kind:'frets',str:GT,seq:[[0,5,1],[0,8,4],[1,5,1],[1,7,3],[2,5,1],[2,7,3],[3,5,1],[3,7,3],[4,5,1],[4,8,4],[5,5,1],[5,8,4]],bpm:72}},
 bass:{1:{t:'Root notes with two fingers',kind:'frets',str:BT,seq:[[0,5,'i'],[0,5,'m'],[0,5,'i'],[0,5,'m'],[1,5,'i'],[1,5,'m'],[1,5,'i'],[1,5,'m']],bpm:80},2:{t:'The octave shape',kind:'frets',str:BT,seq:[[0,3,1],[2,5,4],[0,3,1],[2,5,4],[1,3,1],[3,5,4],[1,3,1],[3,5,4]],bpm:80},3:{t:'The C major scale',kind:'frets',str:BT,seq:[[1,3,2],[1,5,4],[2,2,1],[2,3,2],[2,5,4],[3,2,1],[3,4,3],[3,5,4]],bpm:70}},
 piano:{1:{t:'Five-finger position in C (right hand)',kind:'keys',seq:[[60,1],[62,2],[64,3],[65,4],[67,5],[65,4],[64,3],[62,2],[60,1]],bpm:72},2:{t:'C major scale with the thumb tucked under',kind:'keys',seq:[[60,1],[62,2],[64,3],[65,1],[67,2],[69,3],[71,4],[72,5]],bpm:66},3:{t:'C major chord and its inversions',kind:'keys',chords:true,seq:[[[60,64,67],'1 3 5'],[[64,67,72],'1 2 5'],[[67,72,76],'1 3 5']],bpm:50}},
 drums:{1:{t:'A basic rock beat',kind:'drums',bpm:80,steps:8,rows:{hat:'xxxxxxxx',snare:'..x...x.',kick:'x...x...'},hands:'RRRRRRRR'},2:{t:'The paradiddle: R L R R, L R L L',kind:'drums',bpm:70,steps:8,rows:{snare:'xxxxxxxx'},hands:'RLRRLRLL'},3:{t:'A one-bar fill into the beat',kind:'drums',bpm:80,steps:16,rows:{hat:'x.x.x.x.........',snare:'..x...x.xxxxxxxx',kick:'x...x...........'},hands:'R.R.R.R.RLRLRLRL'}},
 voice:{1:{t:'Breathing: in for 4, hold for 4, out for 8',kind:'breath',bpm:60},2:{t:'Sing the major scale: do re mi',kind:'keys',sing:true,seq:[[60,'do'],[62,'re'],[64,'mi'],[65,'fa'],[67,'so'],[69,'la'],[71,'ti'],[72,'do']],bpm:60},3:{t:'Thirds: do mi, re fa, mi so',kind:'keys',sing:true,seq:[[60,'do'],[64,'mi'],[62,'re'],[65,'fa'],[64,'mi'],[67,'so'],[65,'fa'],[69,'la'],[67,'so']],bpm:66}}};
function demoFor(n){const d=CDEMOS[INST_RAW()]||CDEMOS[INST()];return d&&d[n]?d[n]:null}
function demoNotes(D){if(D.kind==='frets')return D.seq.map(([s,f])=>D.str[s]+f);if(D.kind==='keys'&&!D.chords)return D.seq.map(x=>x[0]);return null}
function demoSVG(D){const W=640;
 if(D.kind==='chords'||D.kind==='strum'||D.kind==='frets'){const S=D.kind==='frets'?D.str.length:6;const lo=D.kind==='frets'?Math.max(0,Math.min(...D.seq.map(x=>x[1]))-1):0;const nf=D.kind==='frets'?Math.max(5,Math.max(...D.seq.map(x=>x[1]))-lo):5;const x0=60,fw=(W-x0-20)/nf,y0=20,sh=24;const H=y0*2+sh*(S-1)+20;
  let g=`<svg viewBox="0 0 ${W} ${H}" class="demosvg" role="img" aria-label="${esc(D.t)}"><g class="fb">`;for(let s=0;s<S;s++)g+=`<line x1="${x0}" x2="${W-20}" y1="${y0+sh*(S-1-s)}" y2="${y0+sh*(S-1-s)}"/>`;for(let f=0;f<=nf;f++)g+=`<line x1="${x0+f*fw}" x2="${x0+f*fw}" y1="${y0}" y2="${y0+sh*(S-1)}" class="${f===0&&lo===0?'nut':''}"/>`;
  for(let f=1;f<=nf;f++)g+=`<text x="${x0+(f-.5)*fw}" y="${H-4}" class="fnum">${lo+f}</text>`;g+='</g><g class="dots"></g></svg>';return{svg:g,lo,x0,fw,y0,sh,S}}
 if(D.kind==='keys'){const all=D.seq.flatMap(x=>Array.isArray(x[0])?x[0]:[x[0]]);const lo=Math.min(60,Math.min(...all)-Math.min(...all)%12),hi=Math.max(lo+17,Math.max(...all)+(11-Math.max(...all)%12));const wk=[];for(let m=lo;m<=hi;m++)if(![1,3,6,8,10].includes(m%12))wk.push(m);const kw=(W-20)/wk.length;let g=`<svg viewBox="0 0 ${W} 130" class="demosvg" role="img" aria-label="${esc(D.t)}">`;
  wk.forEach((m,i)=>g+=`<rect class="wk" data-m="${m}" x="${10+i*kw}" y="10" width="${kw-2}" height="100" rx="4"/>`);wk.forEach((m,i)=>{if(m<hi&&![4,11].includes(m%12))g+=`<rect class="bk" data-m="${m+1}" x="${10+(i+1)*kw-kw*.3}" y="10" width="${kw*.58}" height="62" rx="3"/>`});return{svg:g+'<g class="dots"></g></svg>',kw,wk}}
 if(D.kind==='drums'){const rows=Object.keys(D.rows);const cw=(W-90)/D.steps,rh=34;let g=`<svg viewBox="0 0 ${W} ${rows.length*rh+44}" class="demosvg" role="img" aria-label="${esc(D.t)}">`;
  rows.forEach((r,ri)=>{g+=`<text x="8" y="${ri*rh+26}" class="rlab">${{hat:'Hi-hat',snare:'Snare',kick:'Kick'}[r]}</text>`;for(let i=0;i<D.steps;i++)g+=`<rect class="cell ${D.rows[r][i]==='x'?'on':''}" data-c="${i}" x="${80+i*cw}" y="${ri*rh+8}" width="${cw-4}" height="${rh-8}" rx="5"/>`});
  for(let i=0;i<D.steps;i++)if(D.hands[i]&&D.hands[i]!=='.')g+=`<text class="hand" data-c="${i}" x="${80+i*cw+cw/2-2}" y="${rows.length*rh+30}">${D.hands[i]}</text>`;return{svg:g+'</svg>'}}
 if(D.kind==='breath')return{svg:`<svg viewBox="0 0 ${W} 200" class="demosvg" role="img" aria-label="${esc(D.t)}"><circle class="breath" cx="${W/2}" cy="100" r="30"/><text class="bcount" x="${W/2}" y="106"></text></svg>`};
 return{svg:''}}
function demoPanel(n){const D=demoFor(n);if(!D)return'';const canCheck=!IN_CLAUDE()&&D.kind!=='breath'&&!D.daw&&navigator.mediaDevices;
 return`<section class="panel demo" data-demo="${n}"><h2>Watch, then try it</h2><p class="hint">${esc(D.t)}. ${D.kind==='breath'?'Follow the circle.':'Watch it in time, then play along.'}</p><div class="demobox"></div>
  <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center"><button class="btn primary" data-dplay>${ICON.play} Play the demo</button><label class="popt">Speed <select data-dbpm>${[.6,.8,1,1.2].map(r=>`<option value="${r}" ${r===1?'selected':''}>${Math.round(D.bpm*r)} BPM</option>`).join('')}</select></label>${canCheck?'<button class="btn" data-dcheck>Check me</button>':''}</div><div class="democheck" aria-live="polite"></div></section>`}
const DM={raf:0,stop:null};
function demoStop(){if(DM.stop)DM.stop();DM.stop=null;cancelAnimationFrame(DM.raf)}
function demoBind(root,n){const P=root.querySelector(`.demo[data-demo="${n}"]`);if(!P||P.dataset.b)return;P.dataset.b=1;const D=demoFor(n);const box=P.querySelector('.demobox');const G=demoSVG(D);box.innerHTML=G.svg;const svg=box.querySelector('svg');
 const tim=D.kind==='keys'||D.kind==='frets'||D.kind==='chords'?(D.kind==='keys'?'piano':INST()==='bass'?'bass':'guitar'):'guitar';
 const draw=i=>{const dots=svg.querySelector('.dots');
  if(D.kind==='frets'){const x=D.seq[i];if(!x){dots.innerHTML='';return}const[s,f,fg]=x;const cx=f===0?G.x0-14:G.x0+(f-G.lo-.5)*G.fw,cy=G.y0+G.sh*(G.S-1-s);dots.innerHTML=`<circle cx="${cx}" cy="${cy}" r="11" class="dot"/><text x="${cx}" y="${cy+4}" class="dtx">${fg}</text>`}
  if(D.kind==='chords'||D.kind==='strum'){const name=D.kind==='chords'?D.seq[i%D.seq.length]:D.chord;const fr=DEMO_CH[name],fg=DEMO_FG[name];let h='';fr.forEach((f,s)=>{const cy=G.y0+G.sh*(5-s);if(f==null)h+=`<text x="${G.x0-16}" y="${cy+4}" class="dtx mute">×</text>`;else if(f===0)h+=`<circle cx="${G.x0-14}" cy="${cy}" r="7" class="open"/>`;else{const cx=G.x0+(f-.5)*G.fw;h+=`<circle cx="${cx}" cy="${cy}" r="11" class="dot"/><text x="${cx}" y="${cy+4}" class="dtx">${fg[s]}</text>`}});
   h+=`<text x="${640-30}" y="16" class="cname">${name}</text>`;if(D.kind==='strum'){const p=D.pat;h+=p.split('').map((c,k)=>`<text x="${80+k*62}" y="${G.y0+G.sh*5+44}" class="arrow ${k===i%8?'on':''}">${c==='D'?'↓':c==='U'?'↑':'·'}</text>`).join('')}dots.innerHTML=h}
  if(D.kind==='keys'){svg.querySelectorAll('.hit').forEach(x=>x.classList.remove('hit'));const x=D.seq[i];dots.innerHTML='';if(!x)return;const ms=Array.isArray(x[0])?x[0]:[x[0]];ms.forEach(m=>{const r=svg.querySelector(`[data-m="${m}"]`);if(r)r.classList.add('hit')});
   const r=svg.querySelector(`[data-m="${ms[0]}"]`);if(r)dots.innerHTML=`<text x="${+r.getAttribute('x')+ +r.getAttribute('width')/2}" y="126" class="dtx big">${esc(String(x[1]))}</text>`}
  if(D.kind==='drums')svg.querySelectorAll('[data-c]').forEach(c=>c.classList.toggle('now',+c.dataset.c===i))};
 draw(0);
 const play=()=>{demoStop();const c=audio();if(!c)return;const rate=+P.querySelector('[data-dbpm]').value;const bpm=D.bpm*rate;const t0=c.currentTime+.15;let total,step,ev=[];
  if(D.kind==='breath'){const sec=60/bpm;const cyc=16*sec;total=cyc*2;const circ=svg.querySelector('.breath'),txt=svg.querySelector('.bcount');const tick=()=>{const t=(c.currentTime-t0);if(t>total){circ.setAttribute('r',30);txt.textContent='';return}const k=t%cyc;let r,lab;if(k<4*sec){r=30+60*k/(4*sec);lab='In '+(Math.floor(k/sec)+1)}else if(k<8*sec){r=90;lab='Hold '+(Math.floor((k-4*sec)/sec)+1)}else{r=90-60*(k-8*sec)/(8*sec);lab='Out '+(Math.floor((k-8*sec)/sec)+1)}circ.setAttribute('r',r.toFixed(1));txt.textContent=lab;DM.raf=requestAnimationFrame(tick)};tick();for(let b=0;b<32;b++)drum('click',t0+b*sec,b%16===0?1:.4);return}
  if(D.kind==='chords'){step=60/bpm*4;D.seq.forEach((nm,i)=>{const fr=DEMO_CH[nm];[0,1,2,3].forEach(b=>{const t=t0+i*step+b*step/4;fr.forEach((f,s)=>{if(f!=null)tone(GT[s]+f,t+s*.012,step/4*.9,b===0?.7:.45,'guitar')})})});total=D.seq.length*step;ev=D.seq.map((_,i)=>i*step)}
  else if(D.kind==='strum'){step=60/bpm/2;const fr=DEMO_CH[D.chord];for(let r=0;r<2;r++)D.pat.split('').forEach((p,k)=>{if(p==='.')return;const t=t0+(r*8+k)*step;const order=p==='D'?[0,1,2,3,4,5]:[5,4,3,2,1];order.forEach((s,j)=>{if(fr[s]!=null)tone(GT[s]+fr[s],t+j*.01,step*1.6,p==='D'?.6:.4,'guitar')})});total=16*step;ev=Array.from({length:16},(_,k)=>k*step)}
  else if(D.kind==='drums'){step=60/bpm/(D.steps/4);const rows=D.rows;for(let r=0;r<2;r++)for(let i=0;i<D.steps;i++){const t=t0+(r*D.steps+i)*step;for(const k in rows)if(rows[k][i]==='x')drum(k==='hat'?'hat':k,t,.8)}total=2*D.steps*step;ev=Array.from({length:2*D.steps},(_,k)=>k*step)}
  else{step=60/bpm;D.seq.forEach((x,i)=>{const ms=Array.isArray(x[0])?x[0]:[x[0]];ms.forEach(m=>tone(m,t0+i*step,step*.9,.6,tim))});total=D.seq.length*step;ev=D.seq.map((_,i)=>i*step)}
  let last=-1;const tick=()=>{const t=c.currentTime-t0;if(t>total+.2){draw(0);return}let i=-1;for(let k=0;k<ev.length;k++)if(ev[k]<=t)i=k;if(i!==last&&i>=0){last=i;draw(D.kind==='drums'?i%D.steps:i)}DM.raf=requestAnimationFrame(tick)};tick();DM.stop=()=>{}};
 P.querySelector('[data-dplay]').onclick=play;
 const ck=P.querySelector('[data-dcheck]');if(ck)ck.onclick=()=>demoCheck(P,D,n)}
/* listening check: plays nothing; you play it, and it ticks off what it hears */
async function demoCheck(P,D,n){const out=P.querySelector('.democheck');demoStop();try{if(!INPUT.active)await inputStart(store.get('indev',null)||null)}catch(e){out.innerHTML='<p class="hint">The microphone isn\'t available, so it can\'t listen.</p>';return}
 const c=AC;const t0=c.currentTime;let done=false;const finish=(ok,msg)=>{if(done)return;done=true;clearInterval(iv);out.innerHTML=`<p class="${ok?'good':'hint'}">${msg}</p>`;announce(msg);if(ok){srsAdd({id:'demo-'+INST_RAW()+'-'+n,title:'Play: '+D.t,href:'#course-'+n});if(D.goal!=null){const s=cState();s.goals=s.goals||{};if(!s.goals[n+'.'+D.goal]){s.goals[n+'.'+D.goal]=true;cSave(s);toast('Goal ticked: '+cGoals(n)[D.goal])}}}};
 const notes=demoNotes(D);let iv;
 if(notes){let k=0;const pcs=notes.map(m=>((m%12)+12)%12);const paint=()=>{out.innerHTML=`<p>Play it now, slowly. <span class="hint">${k} of ${notes.length}</span></p><div class="ckrow">${notes.map((m,i)=>`<span class="ck ${i<k?'ok':i===k?'cur':''}">${['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][pcs[i]]}</span>`).join('')}</div>`};paint();
  let held=0,lastM=null;iv=setInterval(()=>{const S=INPUT.samples;const s=S[S.length-1];if(c.currentTime-t0>90){finish(false,'Time\'s up. Try it again, slower.');return}if(!s||c.currentTime-s.t>.15)return;const pc=((s.m%12)+12)%12;if(pc===pcs[k]){held=lastM===s.m?held+1:1;lastM=s.m;if(held>=2){k++;held=0;lastM=null;paint();if(k>=notes.length)finish(true,'You played every note in order. ✓')}}},60);return}
 if(D.kind==='chords'||(D.kind==='keys'&&D.chords)){const seq=D.kind==='chords'?D.seq.map(nm=>{const fr=DEMO_CH[nm];return[...new Set(fr.map((f,s)=>f==null?null:((GT[s]+f)%12)).filter(x=>x!=null))]}):D.seq.map(x=>[...new Set(x[0].map(m=>m%12))]);const names=D.kind==='chords'?D.seq:D.seq.map(x=>x[1]);let k=0,good=0;
  const paint=()=>{out.innerHTML=`<p>Play each chord and let it ring.</p><div class="ckrow">${names.map((nm,i)=>`<span class="ck ${i<k?'ok':i===k?'cur':''}">${esc(nm)}</span>`).join('')}</div>`};paint();
  iv=setInterval(()=>{if(c.currentTime-t0>90){finish(false,'Time\'s up. Try again, and let each chord ring.');return}const C=INPUT.chroma||[];const f=C[C.length-1];if(!f||c.currentTime-f.t>.2)return;let tot=0,inn=0;for(let i=0;i<12;i++){const v=Math.max(0,f.c[i]);tot+=v;if(seq[k].includes(i))inn+=v}if(tot>0&&inn/tot>.6)good++;else good=Math.max(0,good-1);if(good>=6){good=0;k++;paint();if(k>=seq.length)finish(true,'Every chord rang clearly. ✓')}},80);return}
 if(D.kind==='strum'||D.kind==='drums'){const bpm=D.bpm;const per=D.kind==='strum'?60/bpm/2:60/bpm/(D.steps/4);const steps=D.kind==='strum'?D.pat.split('').map(x=>x!=='.'):Array.from({length:D.steps},(_,i)=>Object.values(D.rows).some(r=>r[i]==='x'));const L=steps.length;const ts=c.currentTime+60/bpm*4+.1;
  for(let b=0;b<4+L*2*per/(60/bpm);b++)drum('click',c.currentTime+.1+b*60/bpm,b<4?1:.35);out.innerHTML='<p>Count-in: four clicks, then play it twice along with the click.</p>';const oi=INPUT.onsets.length;const lat=((c.outputLatency||0)+(c.baseLatency||0)+.03);
  iv=setInterval(()=>{if(c.currentTime<ts+2*L*per+.4)return;const O=INPUT.onsets.slice(oi).map(t=>t-lat);const exp=[];for(let r=0;r<2;r++)steps.forEach((on,i)=>{if(on)exp.push(ts+(r*L+i)*per)});let hit=0;const used=new Set();exp.forEach(e=>{const j=O.findIndex((o,q)=>!used.has(q)&&Math.abs(o-e)<.09);if(j>=0){used.add(j);hit++}});const extra=O.filter((o,q)=>!used.has(q)&&o>ts-.1&&o<ts+2*L*per).length;const pct=Math.round(100*hit/Math.max(1,exp.length+extra*.5));
   finish(pct>=80,pct>=80?`${pct}% in time. ✓`:`${pct}% in time. Try it slower: change the speed and press Check me again.`)},120)}}
{const _vs=viewCourseStage;viewCourseStage=function(n){_vs(n);const put=()=>{if(location.hash!=='#course-'+n||main.querySelector('.demo'))return;const g=main.querySelector('.crsgoals');const h=demoPanel(n);if(g&&h){g.insertAdjacentHTML('afterend',h);demoBind(main,n)}};put();const ob=new MutationObserver(()=>{if(location.hash!=='#course-'+n){ob.disconnect();demoStop();return}put()});ob.observe(main,{childList:true})}}

/* ---- song play-alongs: the app's band plays the progression; public-domain tunes come with the melody ---- */
const PA=[
 ['Let It Be','The Beatles','C',72,[['C',4],['G',4],['Am',4],['F',4],['C',4],['G',4],['F',4],['C',4]]],
 ['Knockin\' on Heaven\'s Door','Bob Dylan','G',68,[['G',4],['D',4],['Am',8],['G',4],['D',4],['C',8]]],
 ['Stand By Me','Ben E. King','A',118,[['A',8],['F#m',8],['D',4],['E',4],['A',8]]],
 ['Zombie','The Cranberries','Em',84,[['Em',4],['C',4],['G',4],['D',4]]],
 ['Horse with No Name','America','Em',122,[['Em',4],['D',4]]],
 ['Sweet Home Alabama','Lynyrd Skynyrd','D',98,[['D',2],['C',2],['G',4]]],
 ['Three Little Birds','Bob Marley','A',74,[['A',8],['D',4],['A',4],['A',4],['E',4],['A',4],['D',4]]],
 ['Country Roads','John Denver','G',82,[['G',4],['Em',4],['D',4],['C',4],['G',4],['D',4],['C',4],['G',4]]],
 ['Bad Moon Rising','Creedence Clearwater Revival','D',180,[['D',4],['A',2],['G',2],['D',8]]],
 ['Twist and Shout','The Beatles','D',126,[['D',2],['G',2],['A',4]]],
 ['La Bamba','Ritchie Valens','C',150,[['C',2],['F',2],['G',4]]],
 ['No Woman No Cry','Bob Marley','C',78,[['C',2],['G',2],['Am',2],['F',2]]],
 ['Riptide','Vance Joy','Am',102,[['Am',4],['G',4],['C',8]]],
 ['Get Lucky','Daft Punk','Bm',116,[['Bm',4],['D',4],['F#m',4],['E',4]]],
 ['Someone Like You','Adele','A',67,[['A',4],['C#m',4],['F#m',4],['D',4]]],
 ['With or Without You','U2','D',110,[['D',4],['A',4],['Bm',4],['G',4]]],
 ['Don\'t Stop Believin\'','Journey','E',119,[['E',4],['B',4],['C#m',4],['A',4]]],
 ['Creep','Radiohead','G',92,[['G',4],['B',4],['C',4],['Cm',4]]],
 ['All Along the Watchtower','Jimi Hendrix','Am',113,[['Am',2],['G',2],['F',2],['G',2]]],
 ['Leaving on a Jet Plane','John Denver','G',96,[['G',4],['C',4],['G',4],['C',4],['G',4],['C',4],['D',8]]],
 ['12-bar blues in A','Practice','A',100,[['A',16],['D',8],['A',8],['E',4],['D',4],['A',4],['E',4]]],
 ['12-bar blues in E','Practice','E',100,[['E',16],['A',8],['E',8],['B',4],['A',4],['E',4],['B',4]]]];
/* public-domain tunes, with the melody: [note, beats] (60 = middle C) and chords [name, beats] */
const PDTUNES=[
 ['Ode to Joy','Beethoven (public domain)',100,[[64,1],[64,1],[65,1],[67,1],[67,1],[65,1],[64,1],[62,1],[60,1],[60,1],[62,1],[64,1],[64,1.5],[62,.5],[62,2],[64,1],[64,1],[65,1],[67,1],[67,1],[65,1],[64,1],[62,1],[60,1],[60,1],[62,1],[64,1],[62,1.5],[60,.5],[60,2]],[['C',4],['G',4],['C',4],['G',2],['C',2],['C',4],['G',4],['C',4],['G',2],['C',2]]],
 ['When the Saints Go Marching In','Traditional',110,[[60,1],[64,1],[65,1],[67,5],[60,1],[64,1],[65,1],[67,5],[60,1],[64,1],[65,1],[67,2],[64,2],[60,2],[64,2],[62,6]],[['C',8],['C',8],['C',8],['G',9]]],
 ['Twinkle Twinkle Little Star','Traditional',100,[[60,1],[60,1],[67,1],[67,1],[69,1],[69,1],[67,2],[65,1],[65,1],[64,1],[64,1],[62,1],[62,1],[60,2]],[['C',4],['F',2],['C',2],['F',2],['C',2],['G',2],['C',2]]],
 ['Frère Jacques','Traditional',110,[[60,1],[62,1],[64,1],[60,1],[60,1],[62,1],[64,1],[60,1],[64,1],[65,1],[67,2],[64,1],[65,1],[67,2]],[['C',16]]],
 ['Mary Had a Little Lamb','Traditional',110,[[64,1],[62,1],[60,1],[62,1],[64,1],[64,1],[64,2],[62,1],[62,1],[62,2],[64,1],[67,1],[67,2]],[['C',8],['G',4],['C',4]]],
 ['Amazing Grace','Traditional',80,[[55,1],[60,2],[64,.5],[60,.5],[64,2],[62,1],[60,2],[57,1],[55,2],[55,1],[60,2],[64,.5],[60,.5],[64,2],[62,1],[67,6]],[['C',3],['C',3],['F',3],['C',3],['C',3],['C',3],['G',6]]]];
const PA_Q={'':'maj',m:'min','7':'7',maj7:'maj7',m7:'m7','5':'5',sus4:'sus4','7sus4':'sus4',m7b5:'m7'};
function paChord(nm){const m=nm.match(/^([A-G][#b]?)(.*)$/);const R=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];const fl={Db:'C#',Eb:'D#',Gb:'F#',Ab:'G#',Bb:'A#'};const root=R.indexOf(fl[m[1]]||m[1]);const type=PA_Q[m[2]]||'maj';return{root,type,name:R[root]+(type==='maj'?'':type==='min'?'m':type)}}

function paOpen(kind,i){const S=kind==='pd'?PDTUNES[i]:PA[i];const bpm=kind==='pd'?S[2]:S[3];const bt=60/bpm;const prog=kind==='pd'?S[4]:S[4];const beatsPer=prog.reduce((a,x)=>a+x[1],0);const loops=kind==='pd'?1:Math.max(2,Math.ceil(32/beatsPer));const total=beatsPer*loops;const lead=1;
 const beats=[];for(let b=0;b<=total+4;b++)beats.push(+(lead+b*bt).toFixed(3));const chords=[];let t=0;for(let l=0;l<loops;l++)prog.forEach(([nm,b])=>{const c=paChord(nm);chords.push(Object.assign({t:+(lead+t*bt).toFixed(3),d:+(b*bt).toFixed(3)},c));t+=b});
 const notes=[];if(kind==='pd'){let u=0;S[3].forEach(([m,b])=>{notes.push({t:+(lead+u*bt).toFixed(3),d:+(b*bt*.95).toFixed(3),m,v:90});u+=b})}
 TS.res={part:kind==='pd'&&INST()!=='drums'?'vocals':'other',bpm,beats,notes,chords,hits:[]};TS.view=kind==='pd'?'lead':'';TS.title=S[0]+(kind==='pd'?'':' (play-along)');TS.ytId='';TS.yt=null;TS.L=null;TS.fileUrl=null;TS.urls={};TS.src='saved';TS.id=null;TS.offset=0;TS.mix='none';TS.app=true;TS.stage='play';
 if(location.hash==='#tools-isolate')route();else location.hash='#tools-isolate'}
function paHTML(){return`<section class="panel pasongs"><h2>Song play-alongs</h2><p class="hint">The app plays each song's chords in time so you can strum, solo or sing along, with tab, a speed control and Score my playing. They're the songs' chord progressions, not the recordings, so bring the feel yourself.</p>
 <div class="palist">${PA.map((s,i)=>`<button class="pacard" data-pa="${i}"><b>${esc(s[0])}</b><span class="hint">${esc(s[1])} · ${s[3]} BPM · ${esc(s[4].slice(0,4).map(x=>x[0]).join(' '))}</span></button>`).join('')}</div>
 <h3 class="toolgh" style="margin-top:16px">Tunes with the melody</h3><p class="hint">Traditional and public-domain tunes with the full melody, to play or sing.</p><div class="palist">${PDTUNES.map((s,i)=>`<button class="pacard" data-pd="${i}"><b>${esc(s[0])}</b><span class="hint">${esc(s[1])}</span></button>`).join('')}</div></section>`}
{const _vs=viewSongs;viewSongs=function(){_vs.apply(this,arguments);try{if(main.querySelector('.pasongs'))return;const ph=main.querySelector('.pagehead');(ph||main.firstChild).insertAdjacentHTML('afterend',paHTML());main.querySelectorAll('[data-pa]').forEach(b=>b.onclick=()=>paOpen('pa',+b.dataset.pa));main.querySelectorAll('[data-pd]').forEach(b=>b.onclick=()=>paOpen('pd',+b.dataset.pd))}catch(e){}}}

/* ---- loops that speed up when you get them right ---- */
{const _st=scTick;scTick=function(){const before=PLSC.t1;_st.apply(this,arguments);try{if(!PLSC.on||!store.get('autoSpeed',false)||TS.loopB==null)return;const vt=tsTime();if(before!=null&&vt<before-.5&&PLSC.t0!=null){/* the loop went round: score that pass */const keep={t0:PLSC.t0,t1:before};PLSC.t1=before;const r=scEval();PLSC.frames=[];PLSC.chroma=[];PLSC.onsets=[];PLSC.t0=vt;PLSC.t1=vt;if(!r)return;
  const sel=document.getElementById('tsrate');if(r.pct>=90&&TS.rate<1){const nr=Math.min(1,Math.round((TS.rate+.05)*100)/100);TS.rate=nr;if(TS.audioEl)TS.audioEl.playbackRate=nr;if(sel){if(![...sel.options].some(o=>+o.value===nr))sel.insertAdjacentHTML('beforeend',`<option value="${nr}">${Math.round(nr*100)}%</option>`);sel.value=String(nr)}toast(`${r.pct}% right. Speeding up to ${Math.round(nr*100)}%.`)}else toast(`${r.pct}% right on that pass.`)}}catch(e){}}}
{const _ui=tsScoreUI;tsScoreUI=function(){_ui.apply(this,arguments);const box=document.getElementById('tsscorebox');if(box&&!document.getElementById('tsauto'))box.insertAdjacentHTML('beforebegin',`<label class="popt tsautow" ${PLSC.on?'':'hidden'}><input type="checkbox" id="tsauto" ${store.get('autoSpeed',false)?'checked':''}> Speed up the loop when I get it right <span class="hint">(set a loop and a slower speed first)</span></label>`);const a=document.getElementById('tsauto');if(a)a.onchange=()=>store.set('autoSpeed',a.checked);const cb=document.getElementById('tsscore');if(cb&&!cb.dataset.v51){cb.dataset.v51=1;cb.addEventListener('change',()=>{const w=document.querySelector('.tsautow');if(w)w.hidden=!cb.checked})}}}
/* remember the last score, so Today can suggest fixing those bars */
{const _sh=scShow;scShow=function(){_sh.apply(this,arguments);try{if(PLSC.res){store.set('lastScore',{title:TS.title||'your song',pct:PLSC.res.pct,bars:PLSC.res.bars,at:Date.now()});const H=store.get('scores',[])||[];H.unshift({d:todayKey(),pct:PLSC.res.pct,title:TS.title||''});store.set('scores',H.slice(0,100))}}catch(e){}}}

/* ---- You: one clear picture of your progress ---- */
function youHTML(){const L=store.get('plog',{})||{};const wk=[];const d=new Date();d.setDate(d.getDate()-d.getDay());for(let w=7;w>=0;w--){let s=0;for(let i=0;i<7;i++){const x=new Date(d);x.setDate(d.getDate()-w*7+i);s+=L[todayKey(x)]||0}wk.push(Math.round(s/60))}const mx=Math.max(30,...wk);
 const n=stageNow(),st=cState();const t=cTicked(n,st),all=cGoals(n).length;let passed=0,tot=0;try{const S=jStore();jUnits().flat().forEach(u=>{tot++;if(S[u.key]&&S[u.key].passed)passed++})}catch(e){}
 const sc=(store.get('scores',[])||[]).slice(0,12).reverse();const J=(store.get('journal',[])||[]).filter(j=>j.note).slice(0,5);const lastBk=store.get('lastBackup',null);const days=lastBk?Math.floor((Date.now()-lastBk)/864e5):null;
 return`<section class="panel youview"><h2>Your progress</h2><div class="yougrid">
  <div><span class="eyebrow">Practice, last 8 weeks</span><svg viewBox="0 0 320 120" class="ychart" role="img" aria-label="Minutes practised each week: ${wk.join(', ')}">${wk.map((m,i)=>`<rect x="${8+i*39}" y="${100-90*m/mx}" width="30" height="${Math.max(1,90*m/mx)}" rx="4" class="${i===7?'cur':''}"/><text x="${23+i*39}" y="116" class="yl">${i===7?'This':''}</text>`).join('')}</svg><span class="hint">${wk[7]} minutes this week · ${wk.reduce((a,x)=>a+x,0)} in 8 weeks</span></div>
  <div><span class="eyebrow">Your course</span><b class="ybig">Stage ${n} of 8</b><i class="hbar" aria-hidden="true"><i style="width:${Math.round(100*t/all)}%"></i></i><span class="hint">${t} of ${all} goals · ${cHrs(cSecs(n,st))} hours in this stage</span></div>
  <div><span class="eyebrow">Quizzes passed</span><b class="ybig">${passed} of ${tot}</b><span class="hint">Day streak: ${playStreak()}</span></div>
  ${sc.length?`<div><span class="eyebrow">Play-along scores</span><svg viewBox="0 0 320 120" class="ychart" role="img" aria-label="Recent play-along scores: ${sc.map(x=>x.pct+'%').join(', ')}"><polyline fill="none" class="yline" points="${sc.map((x,i)=>`${10+i*(300/Math.max(1,sc.length-1))},${105-x.pct*.95}`).join(' ')}"/></svg><span class="hint">Latest: ${sc[sc.length-1].pct}%</span></div>`:''}</div></section>
 ${J.length?`<section class="panel"><h2>Your practice notes</h2><ul class="yjournal">${J.map(j=>`<li><span class="hint">${esc(parseKey(j.d).toLocaleDateString(undefined,{day:'numeric',month:'short'}))} · ${j.mins} min</span> ${esc(j.note)}</li>`).join('')}</ul></section>`:''}
 <section class="panel"><h2>Back up</h2><p class="hint">${days==null?'You haven\'t made a backup yet.':days===0?'Backed up today.':`Last backup: ${days} day${days>1?'s':''} ago.`} Your progress is saved on this device; a backup file lets you move it to another device or recover it.</p>${backupHTML()}</section>`}
{const _vp=viewProgress;viewProgress=function(){_vp.apply(this,arguments);try{if(main.querySelector('.youview'))return;const ph=main.querySelector('.pagehead');(ph||main.firstChild).insertAdjacentHTML('afterend',youHTML());bindBackup(main);const bk=main.querySelector('.youview~section #bkup');if(bk)bk.addEventListener('click',()=>store.set('lastBackup',Date.now()))}catch(e){}}}

/* ---- the Android app gets new versions from the download page ---- */
const DROID_REPO='ReginaldCumBiscuits/theory-club-desktop';
const vcmp=(a,b)=>{const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++){if((x[i]||0)!==(y[i]||0))return(x[i]||0)-(y[i]||0)}return 0};
async function droidUpdate(){if(!DROID)return;try{const cur=await natCall('app_version');const r=await fetch(`https://api.github.com/repos/${DROID_REPO}/releases/latest`);if(!r.ok)return;const j=await r.json();const v=String(j.tag_name||'').replace(/^v/,'');const apk=(j.assets||[]).find(a=>/android\.apk$/.test(a.name));if(!apk||vcmp(v,cur)<=0)return;
 let b=document.getElementById('updbar');if(!b){b=document.createElement('div');b.id='updbar';b.className='updbar';b.setAttribute('role','status');document.body.appendChild(b)}
 b.innerHTML=`<span>Theory Club ${esc(v)} is out.</span><button class="btn small primary" id="dupd">Download</button><button class="btn small" id="dlater">Later</button>`;
 b.querySelector('#dupd').onclick=async()=>{try{await window.__TAURI__.opener.openUrl(apk.browser_download_url)}catch(e){location.href=apk.browser_download_url}};b.querySelector('#dlater').onclick=()=>b.remove()}catch(e){}}
if(DROID){setTimeout(droidUpdate,4000);setTimeout(remSchedule,3000)}
Object.assign(window,{weakSpots,CDEMOS,demoFor,PA,PDTUNES,paOpen,remTick,youHTML,droidUpdate});

