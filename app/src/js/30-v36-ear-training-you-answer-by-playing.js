/* ================= v36: ear training you answer by playing ================= */
const EAR_RANGE={guitar:[52,76],bass:[36,55],piano:[55,79],voice:[50,67]};
const EAR_SCALE=[[0,2,4,7,9],[0,2,4,5,7,9,11],[0,1,2,3,4,5,6,7,8,9,10,11]];
const EAR_IV=[[2,4,5,7,12],[2,3,4,5,7,8,9,10,12],[1,2,3,4,5,6,7,8,9,10,11,12]];
const IV_NAME={1:'minor 2nd',2:'major 2nd',3:'minor 3rd',4:'major 3rd',5:'perfect 4th',6:'tritone',7:'perfect 5th',8:'minor 6th',9:'major 6th',10:'minor 7th',11:'major 7th',12:'octave'};
const EAR_MODES=[['note','Find the note'],['interval','Intervals'],['phrase','Short phrases']];
function earInst(){const r=INST_RAW();if(r==='voice')return'voice';const i=INST();return i==='drums'?null:(EAR_RANGE[i]?i:'piano')}
function earTimbre(i){return i==='bass'?'bass':i==='guitar'?'guitar':'piano'}
function earQuestion(mode,lv,inst,r){const[lo,hi]=EAR_RANGE[inst];const sc=EAR_SCALE[lv];
 if(mode==='interval'){const ivs=EAR_IV[lv];const iv=pick(r,ivs);const down=lv===2&&r()<.4;const root=lo+Math.floor(r()*(hi-lo-12))+(down?12:0);const t=down?root-iv:root+iv;return{play:[root,t],want:[root,t],given:1,label:`${IV_NAME[iv]} ${down?'down':'up'}`,prompt:'Play both notes: the first, then the second.'}}
 const tonic=lo+Math.floor(r()*Math.max(1,hi-lo-14));const pool=[];for(let o=0;o<2;o++)sc.forEach(d=>{const m=tonic+o*12+d;if(m<=hi)pool.push(m)});
 if(mode==='note'){let t;do{t=pick(r,pool)}while(t===tonic);return{play:[tonic,t],want:[t],ref:tonic,label:`${pcName(t%12)} in the key of ${pcName(tonic%12)}`,prompt:'The first note is the key note. Play the second note.'}}
 const n=3+lv;const seq=[tonic];let i=0;for(let k=1;k<n;k++){const step=lv===0?pick(r,[-1,1,1,2]):pick(r,[-2,-1,1,1,2,3]);i=Math.max(0,Math.min(pool.length-1,i+step));if(pool[i]===seq[seq.length-1])i=Math.min(pool.length-1,i+1);seq.push(pool[i])}
 return{play:seq,want:seq,label:seq.map(m=>pcName(m%12)).join(' '),prompt:`Play all ${n} notes back. It starts on the key note.`}}
/* notes you played, from the pitch tracker: runs of the same pitch, split at new attacks */
function heardNotes(t0,strictOct){const S=INPUT.samples.filter(s=>s.t>=t0);const out=[];let cur=null;
 for(const s of S){const split=cur&&INPUT.onsets.some(o=>o>cur.last-.01&&o<=s.t+.03);if(cur&&s.m===cur.m&&s.t-cur.last<.2&&!split){cur.n++;cur.last=s.t;continue}
  if(cur&&cur.n>=2)out.push(cur);cur={m:s.m,first:s.t,last:s.t,n:1}}
 if(cur&&cur.n>=2)out.push(cur);
 const merged=[];out.forEach(x=>{const p=merged[merged.length-1];if(p&&p.m===x.m&&x.first-p.last<.12&&!INPUT.onsets.some(o=>o>p.last-.03&&o<=x.first+.01))p.last=x.last;else merged.push(x)});return merged}
function viewEar(){const inst=earInst();
 if(!inst){main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Practice</span><h1>Ear training</h1><p class="lede">Ear training needs a pitched instrument. Switch to guitar, bass, piano or voice to use it.</p></div></div>`;return}
 let mode=store.get('earmode','note'),lv=+(store.get('earlv',Math.min(2,LEVEL()))),q=null,state='idle',heard=[],t0=0,timer=null,tap=[],seed=(Date.now()^Math.floor(Math.random()*1e9))>>>0;
 const ST=()=>store.get('ear',{})||{};
 const rec=ok=>{const E=ST();const k=mode+lv;const x=E[k]||{n:0,ok:0,streak:0,best:0};x.n++;if(ok){x.ok++;x.streak++;x.best=Math.max(x.best,x.streak)}else x.streak=0;E[k]=x;store.set('ear',E);try{bumpStats(ok)}catch(e){}};
 const playQ=(after)=>{const c=audio();if(!c||!q)return;const t=c.currentTime+.08;const gap=.62;q.play.forEach((m,i)=>tone(m,t+i*gap,.5,.32,earTimbre(inst)));const end=t+q.play.length*gap+.35;if(after)setTimeout(after,(end-c.currentTime)*1000)};
 const listen=()=>{if(!LISTEN()){state='tap';draw();return}state='listen';heard=[];t0=AC.currentTime;draw();clearInterval(timer);const startedAt=Date.now();
  timer=setInterval(()=>{if(state!=='listen'){clearInterval(timer);return}heard=heardNotes(t0);const lastT=heard.length?heard[heard.length-1].last:null;const quiet=lastT!=null&&AC.currentTime-lastT>1.6;
   if(heard.length>=q.want.length||quiet||Date.now()-startedAt>15000){clearInterval(timer);finish(heard.map(h=>h.m))}else drawSlots()},120)};
 const match=(a,b)=>((a-b)%12+12)%12===0;
 const finish=(got)=>{state='done';q.got=got.slice(0,q.want.length);q.ok=q.want.every((m,i)=>q.got[i]!=null&&match(q.got[i],m));rec(q.ok);draw()};
 const next=()=>{const r=mulberry(seed++);q=earQuestion(mode,lv,inst,r);tap=[];state='play';draw();playQ(listen)};
 const drawSlots=()=>{const el=main.querySelector('.earslots');if(!el||!q)return;el.innerHTML=q.want.map((m,i)=>{const g=state==='done'?q.got[i]:state==='tap'?tap[i]:(heard[i]&&heard[i].m);const ok=g!=null&&match(g,m);const show=state==='done';
   return`<span class="eslot ${g==null?'':show?(ok?'ok':'bad'):'got'}">${g!=null?esc(pcName(((g%12)+12)%12)):'?'}${show&&!ok?`<small>${esc(pcName(m%12))}</small>`:''}</span>`}).join('')};
 const draw=()=>{const E=ST()[mode+lv]||{n:0,ok:0,streak:0,best:0};
  main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Practice · ${esc(INST_NAME[INST_RAW()]||'')}</span><h1>Ear training</h1><p class="lede">The app plays, you play it back on your ${inst==='voice'?'voice':'instrument'}. It listens and tells you which notes were right.</p></div></div>
  <div class="stack"><div class="pickrow"><span class="eyebrow">Exercise</span>${pillsHTML('em',EAR_MODES,mode,'pills')}</div><div class="pickrow"><span class="eyebrow">Level</span>${pillsHTML('el',[['0','Beginner'],['1','Intermediate'],['2','Experienced']],String(lv),'pills')}</div>
  <section class="panel earq">${q?`<p class="hint">${esc(q.prompt)}</p><div class="earslots" aria-live="polite"></div>
   <p class="earstat" aria-live="polite">${state==='play'?'Listen…':state==='listen'?'Your turn. Play it now.':state==='tap'?'Tap the note names in order.':state==='done'?(q.ok?'<b class="good">Right!</b> ':'<b class="bad">Not quite.</b> ')+`It was: ${esc(q.label)}.`:''}</p>
   ${state==='tap'?`<div class="earkeys">${SHARPN.map((n,i)=>`<button class="btn small" data-pc="${i}">${esc(pcName(i))}</button>`).join('')}</div>`:''}
   <div class="row"><button class="btn" id="eagain">${ICON.play} Hear it again</button>${state==='listen'||state==='tap'?`<button class="btn" id="egive">Show the answer</button>`:''}<button class="btn primary" id="enext">${state==='done'?'Next one':'Skip'}</button></div>`
   :`<p>${mode==='note'?'You’ll hear the key note, then another note. Find the second note on your instrument.':mode==='interval'?'You’ll hear two notes. Play them both back.':'You’ll hear a short tune that starts on the key note. Play it back.'}</p><button class="btn primary" id="estart">Start</button>`}</section>
  <div class="row earscore"><span class="hint">${E.n?`${E.ok} of ${E.n} right · streak ${E.streak} · best ${E.best}`:'No answers yet at this level.'}</span></div>
  ${IN_CLAUDE()?'<p class="hint">Inside Claude the app can’t use your microphone, so you answer by tapping note names. The website version listens to you play.</p>':`${inputPanelHTML()}<p class="hint">Headphones help: otherwise the microphone hears the app as well as you. No instrument handy? It falls back to tapping note names.</p>`}</div>`;
  drawSlots();
  bindPills(main,(g,v)=>{if(g==='em'){mode=v;store.set('earmode',v)}else{lv=+v;store.set('earlv',lv)}state='idle';q=null;clearInterval(timer);draw()});
  const $=s=>main.querySelector(s);if($('#estart'))$('#estart').onclick=next;if($('#enext'))$('#enext').onclick=()=>{clearInterval(timer);next()};
  if($('#eagain'))$('#eagain').onclick=()=>{const was=state;clearInterval(timer);if(was==='done'){playQ();return}state='play';draw();playQ(listen)};
  if($('#egive'))$('#egive').onclick=()=>{clearInterval(timer);finish(state==='tap'?tap:heard.map(h=>h.m))};
  main.querySelectorAll('[data-pc]').forEach(b=>b.onclick=()=>{const pc=+b.dataset.pc;tap.push(pc);tone(q.want[0]-((q.want[0]%12)-pc),AC.currentTime+.02,.4,.25,earTimbre(inst));drawSlots();if(tap.length>=q.want.length)finish(tap)});
  const ip=main.querySelector('.inpanel');if(ip)bindInputPanel(ip,()=>{if(state==='idle'||state==='done')draw()})};
 draw()}

