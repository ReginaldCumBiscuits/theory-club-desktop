/* ================= v49: one learning path, grouped tools, practice tracking, saving parts, play-along scoring ================= */
/* ---- 1. the course, topic quizzes and song plans are one section: Course ---- */





/* topic quizzes for each stage: Beginner topics in stages 1-2, Intermediate in 3-4, Experienced in 5 */
function cQuizUnits(n){if(n>5)return null;let U;try{U=jUnits()}catch(e){return null}const lv=n<=2?0:n<=4?1:2;const all=U[lv]||[];if(lv===2)return{lv,list:all};const h=Math.ceil(all.length/2);return{lv,list:n%2?all.slice(0,h):all.slice(h)}}
function cQuizHTML(n){const Q=cQuizUnits(n);if(!Q||!Q.list.length)return n>5?`<section class="panel crsq"><h2>Checkpoints</h2><p class="hint">The topic quizzes end at stage 5. From here, the milestone above is your test: play it for a teacher or record it and listen back honestly.</p><a class="btn small" href="#journey">Retake topic quizzes</a></section>`:'';
 const S=jStore();const open=jUnlocked(Q.lv);const passed=Q.list.filter(u=>S[u.key]&&S[u.key].passed).length;
 return`<section class="panel crsq"><h2>Checkpoint quizzes</h2><p class="hint">${passed} of ${Q.list.length} passed. Each has a short lesson and a ${JN}-question quiz; score ${JPASS} or more to pass. ${open?'':`They unlock when you've passed the ${JLV[Q.lv-1]} quizzes.`}</p>
  <ul class="crsql">${Q.list.map(u=>{const s=S[u.key];const ok=s&&s.passed;return`<li class="${ok?'ok':''}"><span class="crsqn" aria-hidden="true">${ok?'✓':''}</span><span class="stack" style="gap:0;min-width:0;flex:1"><b>${esc(u.t)}</b><span class="hint">${s?`Best ${s.best}/${JN}${ok?' · passed':''}`:'Not taken yet'}</span></span>${u.lessons.length?`<a class="btn small" href="#learn-${u.lessons[0]}">Lesson</a>`:''}${open?`<a class="btn small ${ok?'':'primary'}" href="#jq-${u.key}">${ok?'Retake':'Take quiz'}</a>`:''}</li>`}).join('')}</ul></section>`}
function cSongPlanHTML(){const P=store.get('lplan',null);const has=P&&P.plan;
 return`<section class="panel crsq"><h2>Learn through songs you love</h2><p class="hint">Pick up to five players you love and get a week-by-week plan that teaches this stage's techniques through their songs, from their early work to their later work.</p><div class="row" style="gap:8px;flex-wrap:wrap">${has?`<a class="btn small primary" href="#plan">Open your song plan</a><a class="btn small" href="#plan-new">Make a new one</a>`:`<a class="btn small primary" href="#plan-new">Build a song plan</a>`}</div></section>`}
/* ---- 2. practice time, counted towards each stage's hours ---- */
const PT={on:false,t0:0,acc:0,listen:false,iv:null,heard:0,stream:null,an:null,buf:null};
function cSecs(n,st=cState()){return(st.secs&&st.secs[n])||0}
function cAddSecs(sec){if(!(sec>0))return;try{const st=cState();const n=Math.min(8,cCurrent(st));st.secs=st.secs||{};st.secs[n]=(st.secs[n]||0)+sec;cSave(st)}catch(e){}}
{const _lp=logPractice;logPractice=function(sec,fromTimer){if(PT.on&&!fromTimer)return;/* the timer is already counting this time */_lp(sec);if(sec>0)cAddSecs(Math.min(sec,1800))}}
const cHrs=s=>{const h=s/3600;return h<10?(Math.round(h*10)/10).toString():Math.round(h).toLocaleString()};
function cHoursHTML(n){const st=cState();const s=cSecs(n,st);const H=COURSE.stages[n-1].hours;const pct=Math.min(100,Math.round(100*s/3600/H));
 return`<section class="panel crshrs"><h2>Practice time</h2><p class="hint"><b>${cHrs(s)}</b> of about ${H.toLocaleString()} hours logged in this stage. Time in Theory Club counts by itself; add practice you did away from it below, or use the practice timer at the top of the page.</p><i class="hbar" aria-hidden="true"><i style="width:${pct}%"></i></i>
  <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center"><label class="popt">Add <select id="clogm">${[10,15,20,30,45,60,90,120].map(m=>`<option value="${m}" ${m===30?'selected':''}>${m<60?m+' min':m/60+' hour'+(m>60?'s':'')}</option>`).join('')}</select></label><button class="btn small" id="clog">Add practice</button><button class="btn small" id="ctimer">${PT.on?'Practice timer is running':'Start the practice timer'}</button></div></section>`}
function ptFmt(s){s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')}
function ptTick(){/* every second: count it (or, when listening, only if it heard you), save every 15 seconds */
 if(!PT.on)return;let add=0;if(PT.listen){if(PT.an){PT.an.getFloatTimeDomainData(PT.buf);let r=0;for(let i=0;i<PT.buf.length;i++)r+=PT.buf[i]*PT.buf[i];r=Math.sqrt(r/PT.buf.length);if(r>.012)PT.heard=Date.now()}if(Date.now()-PT.heard<4000)add=1;PT.acc+=add}else{const now=Date.now();PT.acc+=(now-PT.t0)/1000;PT.t0=now}
 PT.unsaved=(PT.unsaved||0)+(PT.listen?add:1);if(PT.unsaved>=15){logPractice(PT.unsaved,true);PT.unsaved=0}ptPaint()}
async function ptStart(listen){if(PT.on)return;PT.listen=!!listen;PT.acc=0;PT.unsaved=0;PT.t0=Date.now();PT.heard=0;
 if(listen){try{const c=audio();PT.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});const src=c.createMediaStreamSource(PT.stream);PT.an=c.createAnalyser();PT.an.fftSize=2048;PT.buf=new Float32Array(2048);src.connect(PT.an)}catch(e){toast('The microphone isn\'t available, so the timer counts all the time instead.');PT.listen=false}}
 PT.on=true;try{const st=cState();if(!st.started){st.started=todayKey();cSave(st)}}catch(e){}PT.iv=setInterval(ptTick,1000);announce('Practice timer started');ptPaint()}
function ptStop(){if(!PT.on)return;ptTick();PT.on=false;clearInterval(PT.iv);if(PT.unsaved>0)logPractice(PT.unsaved,true);PT.unsaved=0;if(PT.stream){PT.stream.getTracks().forEach(t=>t.stop());PT.stream=null;PT.an=null}const s=PT.acc;toast(s>=60?`Saved ${Math.round(s/60)} minutes of practice.`:'Saved.');announce('Practice timer stopped');ptPaint();if(/^#course-/.test(location.hash))route()}
function ptPaint(){const b=document.getElementById('ptbtn');if(b){b.classList.toggle('on',PT.on);b.querySelector('.ptt').textContent=PT.on?ptFmt(PT.acc):'';b.setAttribute('aria-label',PT.on?`Practice timer, ${ptFmt(PT.acc)}. Open to stop`:'Practice timer')}const p=document.getElementById('ptpop');if(p&&!p.hidden)ptPop(true)}
function ptPop(keep){let p=document.getElementById('ptpop');if(!p){p=document.createElement('div');p.id='ptpop';p.className='ptpop';p.setAttribute('role','dialog');p.setAttribute('aria-label','Practice timer');p.hidden=true;document.body.appendChild(p)}if(!keep){p.hidden=!p.hidden;if(p.hidden)return}
 const canListen=!IN_CLAUDE()&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia;
 p.innerHTML=`<div class="row" style="justify-content:space-between;align-items:center"><b>Practice timer</b><button class="iconbtn" id="ptx" aria-label="Close">✕</button></div><div class="ptbig" aria-live="off">${ptFmt(PT.acc)}</div>
  ${PT.on?`<p class="hint">${PT.listen?(Date.now()-PT.heard<4000?'Hearing you play.':'Paused: it hasn\'t heard you for a few seconds.'):'Counting.'} It saves as it goes, to today's practice and your course stage.</p><button class="btn primary" id="ptstop">Stop</button>`:
  `<p class="hint">Time you practise counts towards your course stage's hours and your daily stats.</p>${canListen?`<label class="row" style="gap:8px;align-items:flex-start"><input type="checkbox" id="ptlisten" ${store.get('ptListen',true)?'checked':''}><span>Only count time when it hears me play <span class="hint">(uses the microphone; nothing is recorded)</span></span></label>`:''}<button class="btn primary" id="ptgo">Start</button>`}`;
 p.querySelector('#ptx').onclick=()=>{p.hidden=true;const b=document.getElementById('ptbtn');if(b)b.focus()};
 const g=p.querySelector('#ptgo');if(g)g.onclick=()=>{const l=p.querySelector('#ptlisten');const on=!!(l&&l.checked);store.set('ptListen',on);ptStart(on)};const s=p.querySelector('#ptstop');if(s)s.onclick=ptStop}
function ptMount(){const acts=document.querySelector('.hdr-actions');if(!acts||document.getElementById('ptbtn'))return;const b=document.createElement('button');b.className='iconbtn ptbtn';b.id='ptbtn';b.title='Practice timer';b.setAttribute('aria-label','Practice timer');b.innerHTML=`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg><span class="ptt"></span>`;b.onclick=()=>ptPop();acts.insertBefore(b,acts.firstChild);ptPaint()}
ptMount();window.addEventListener('beforeunload',()=>{if(PT.on&&PT.unsaved>0){try{logPractice(PT.unsaved,true)}catch(e){}}});
/* the stage page gets checkpoints, song plans and practice time; the overview gets hours and your road */
{const _vs=viewCourseStage;viewCourseStage=function(n){_vs(n);const put=()=>{if(location.hash!=='#course-'+n||main.querySelector('.crshrs'))return;const g=main.querySelector('.crsgoals');if(g)g.insertAdjacentHTML('afterend',cHoursHTML(n));const grid=main.querySelector('.crsgrid');if(grid)grid.insertAdjacentHTML('afterend',cQuizHTML(n)+cSongPlanHTML());main.querySelectorAll('a[href="#journey"]').forEach(a=>{if(a.closest('.crsp'))a.remove()});
  const lb=main.querySelector('#clog');if(lb)lb.onclick=()=>{const m=+main.querySelector('#clogm').value;const st=cState();st.secs=st.secs||{};st.secs[n]=(st.secs[n]||0)+m*60;if(!st.started)st.started=todayKey();cSave(st);const L=store.get('plog',{});L[todayKey()]=(L[todayKey()]||0)+m*60;store.set('plog',L);toast(`Added ${m} minutes`);const y=window.scrollY;route();window.scrollTo(0,y)};
  const tb=main.querySelector('#ctimer');if(tb)tb.onclick=()=>{ptPop();const p=document.getElementById('ptpop');if(p&&p.hidden)ptPop()}};
 put();const ob=new MutationObserver(()=>{if(location.hash!=='#course-'+n){ob.disconnect();return}put()});ob.observe(main,{childList:true})}}
{const _vc=viewCourse;viewCourse=function(arg){const r=_vc(arg);const n=+arg;if(n>=1&&n<=8)return r;try{const st=cState();main.querySelectorAll('.crsst').forEach((li,i)=>{const s=cSecs(i+1,st);if(s>0){const m=li.querySelector('.crsmeta');if(m)m.insertAdjacentHTML('beforeend',`<span>${cHrs(s)} of ${COURSE.stages[i].hours.toLocaleString()} hours</span>`)}});
  const pace=main.querySelector('.pagehead+section.panel');const rb=typeof roadBar==='function'?roadBar():'';if(pace&&rb&&!main.querySelector('.jroadbar'))pace.insertAdjacentHTML('afterend',rb)}catch(e){}return r}}
/* the course route now belongs to the Course section, with its tabs */
{const _r=route;route=function(){_r.apply(this,arguments);const h=location.hash.slice(1);if(navSection(h)==='course'){if(h==='course'||h.startsWith('course-'))renderChrome('course');navAddSub()}ptMount()}}
/* the topic quiz page explains where it fits */
{const _vj=viewJourney;viewJourney=function(){_vj.apply(this,arguments);try{const e=main.querySelector('.pagehead .eyebrow'),h=main.querySelector('.pagehead h1');if(e)e.textContent='Your course · Topic quizzes · '+(INST_NAME[INST_RAW()]||'');if(h)h.textContent='Topic quizzes';const l=main.querySelector('.pagehead .lede');if(l&&!l.dataset.v49){l.dataset.v49=1;l.insertAdjacentHTML('beforeend',' They are also the checkpoints in your course stages.')}}catch(e){}}}
/* ---- 3. Tools, grouped ---- */
const TOOL_GROUPS=[['Play along',['jam','online','isolate','slow','transcribe']],['Train',['read','findnote']],['Utilities',['metronome','tuner','finder']]];

/* ---- 4. save the separated part, and the song without it ---- */
async function tsSaveAudio(which){const u=TS.urls&&TS.urls[which];if(!u)return;const b=await (await fetch(u)).blob();const nm=((TS_PARTS.find(p=>p[0]===TS.res.part)||[])[1]||TS.res.part).toLowerCase().replace(/\W+/g,'-');await saveFile(slug(TS.title||'song')+'-'+(which==='part'?nm:'without-'+nm)+'.wav',b)}
function tsAudioBtns(){const t=document.getElementById('tstxt');if(!t||document.getElementById('tswavp')||!TS.urls||!TS.urls.part||!TS.L)return;const nm=((TS_PARTS.find(p=>p[0]===TS.res.part)||[])[1]||'').toLowerCase();
 t.insertAdjacentHTML('afterend',`<button class="btn" id="tswavp">Save the ${esc(nm)} (.wav)</button><button class="btn" id="tswavm">Save the song without it (.wav)</button>`);document.getElementById('tswavp').onclick=()=>tsSaveAudio('part');document.getElementById('tswavm').onclick=()=>tsSaveAudio('minus')}
/* ---- 5. play-along scoring: the app listens while you play along and marks what you hit ---- */
const PLSC={on:false,iv:null,frames:[],chroma:[],onsets:[],si:0,ci:0,oi:0,t0:null,t1:null,res:null,wasPlaying:false,idle:0};
function scLat(){const c=AC;return((c&&c.outputLatency)||0)+((c&&c.baseLatency)||0)+.045}
async function scStart(){try{if(!INPUT.active)await inputStart(store.get('indev',null)||null)}catch(e){toast(e&&e.name==='NotAllowedError'?'The microphone was blocked, so scoring can\'t listen.':'The microphone isn\'t available here.');return false}
 PLSC.on=true;PLSC.frames=[];PLSC.chroma=[];PLSC.onsets=[];PLSC.si=INPUT.samples.length;PLSC.ci=(INPUT.chroma||[]).length;PLSC.oi=INPUT.onsets.length;PLSC.t0=null;PLSC.t1=null;PLSC.res=null;PLSC.idle=0;PLSC.wasPlaying=false;clearInterval(PLSC.iv);PLSC.iv=setInterval(scTick,50);return true}
function scStop(){PLSC.on=false;clearInterval(PLSC.iv)}
function scTick(){if(!PLSC.on||!TS.res)return;const playing=tsPlaying();const c=AC;if(!c)return;const now=c.currentTime,vt=tsTime(),rate=TS.rate||1,lat=scLat();const map=t=>vt-(now-t)*rate-lat*rate;
 if(playing){PLSC.wasPlaying=true;PLSC.idle=0;if(PLSC.t0==null||vt<PLSC.t0-.5)PLSC.t0=Math.max(0,vt-.05);PLSC.t1=vt;
  const S=INPUT.samples;if(PLSC.si>S.length)PLSC.si=0;for(;PLSC.si<S.length;PLSC.si++){const s=S[PLSC.si];if(now-s.t<1.5)PLSC.frames.push({t:map(s.t),m:s.m})}
  const C=INPUT.chroma||[];if(PLSC.ci>C.length)PLSC.ci=0;for(;PLSC.ci<C.length;PLSC.ci++){const x=C[PLSC.ci];if(now-x.t<1.5)PLSC.chroma.push({t:map(x.t),c:x.c})}
  const O=INPUT.onsets;if(PLSC.oi>O.length)PLSC.oi=0;for(;PLSC.oi<O.length;PLSC.oi++){const o=O[PLSC.oi];if(now-o<1.5)PLSC.onsets.push(map(o))}}
 else{/* paused for a moment: show the score for what was played */const S=INPUT.samples;PLSC.si=S.length;PLSC.ci=(INPUT.chroma||[]).length;PLSC.oi=INPUT.onsets.length;if(PLSC.wasPlaying&&++PLSC.idle===16){PLSC.wasPlaying=false;scShow()}}}
function scEval(){const R=TS.res;if(!R||PLSC.t0==null)return null;const a=PLSC.t0,z=PLSC.t1;const ev=tsEvents().filter(e=>e.t>=a&&e.t<=z-.15);if(!ev.length)return null;const out=[];const kind=R.part==='drums'?'hit':R.part==='other'&&TS.view!=='lead'?'chord':'note';
 ev.forEach(e=>{let st='miss';
  if(kind==='note'){const end=e.t+Math.max(.12,Math.min(e.d||.3,.8));const fr=PLSC.frames.filter(f=>f.t>=e.t-.12&&f.t<=end);const ok=fr.filter(f=>f.m===e.m||Math.abs(f.m-e.m)===12);if(ok.length>=2){const first=ok[0].t;st=first-e.t>.12?'late':'hit'}else if(fr.length>=2)st='wrong'}
  else if(kind==='chord'){const ch=e.chord;const tpl=({maj:[0,4,7],min:[0,3,7],'7':[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10],'5':[0,7],sus4:[0,5,7]}[ch.type]||[0,4,7]).map(i=>(ch.root+i)%12);const fr=PLSC.chroma.filter(f=>f.t>=e.t-.1&&f.t<=e.t+Math.min(e.d||1,2));
   const good=fr.filter(f=>{const v=f.c;let tot=0,inn=0;for(let i=0;i<12;i++){const x=Math.max(0,v[i]);tot+=x;if(tpl.includes(i))inn+=x}return tot>0&&inn/tot>.55});if(fr.length>=3&&good.length>=fr.length*.35)st='hit';else if(fr.length>=3)st='wrong'}
  else{const o=PLSC.onsets.find(t=>Math.abs(t-e.t)<.09);if(o!=null)st='hit';else if(PLSC.onsets.find(t=>t-e.t>=.09&&t-e.t<.2)!=null)st='late'}
  out.push({e,st})});
 const n=out.length,hit=out.filter(x=>x.st==='hit').length,late=out.filter(x=>x.st==='late').length,wrong=out.filter(x=>x.st==='wrong').length,miss=out.filter(x=>x.st==='miss').length;const g=tsGrid(R.beats);const bars={};out.forEach(x=>{if(x.st!=='hit'){const b=Math.floor(g(x.e.t)/16);bars[b]=(bars[b]||0)+1}});
 return{kind,n,hit,late,wrong,miss,pct:Math.round(100*(hit+late*.5)/n),bars:Object.entries(bars).sort((p,q)=>q[1]-p[1]).map(x=>+x[0]),span:z-a,heard:PLSC.frames.length+PLSC.onsets.length}}
function scShow(){const r=scEval();const box=document.getElementById('tsscorebox');if(!box)return;document.querySelectorAll('.tstab .tsmiss').forEach(x=>x.classList.remove('tsmiss'));
 if(!r){box.innerHTML='<p class="hint">Play along for a few bars, then pause to see your score.</p>';return}
 if(r.heard<3){box.innerHTML='<p class="hint">It didn\'t hear you play. Check the microphone is on (the mic button at the top) and that it can hear your instrument.</p>';return}
 PLSC.res=r;try{logPractice(r.span/(TS.rate||1))}catch(e){}const W=r.kind==='hit'?'drum hits':r.kind==='chord'?'chords':'notes';
 box.innerHTML=`<div class="scsum"><b class="scpct">${r.pct}%</b><span><b>${r.hit}</b> of ${r.n} ${W} right${r.late?`, <b>${r.late}</b> late`:''}${r.wrong?`, <b>${r.wrong}</b> wrong ${r.kind==='chord'?'chord':'note'}${r.wrong>1?'s':''}`:''}${r.miss?`, <b>${r.miss}</b> missed`:''}.</span></div>
  ${r.bars.length?`<p class="hint">Bars to work on: ${r.bars.slice(0,8).map(b=>`<button class="btn small" data-scbar="${b}">Bar ${b+1}</button>`).join(' ')} They're outlined in the tab. Loop one and slow it down.</p>`:'<p class="hint">Every one right. Try it faster.</p>'}`;
 announce(`Score ${r.pct} percent`);r.bars.forEach(b=>document.querySelectorAll(`.tstab [data-bar="${b}"]`).forEach(x=>x.classList.add('tsmiss')));
 box.querySelectorAll('[data-scbar]').forEach(b=>b.onclick=()=>{const el=document.querySelector(`.tstab [data-bar="${b.dataset.scbar}"]`);if(el){el.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});if(el.focus)el.focus()}})}
function tsScoreUI(){const tr=document.querySelector('.tstrans');if(!tr||document.getElementById('tsscore')||!TS.res)return;if(IN_CLAUDE())return;
 tr.insertAdjacentHTML('beforeend',`<label class="popt"><input type="checkbox" id="tsscore" ${PLSC.on?'checked':''}> Score my playing</label>`);tr.insertAdjacentHTML('afterend',`<div id="tsscorebox" class="tsscorebox" aria-live="polite" ${PLSC.on?'':'hidden'}><p class="hint">Play along, then pause to see your score. Use headphones, or the microphone will hear the song as well as you.</p></div>`);
 const cb=document.getElementById('tsscore');cb.onchange=async()=>{const box=document.getElementById('tsscorebox');if(cb.checked){const ok=await scStart();if(!ok){cb.checked=false;return}box.hidden=false;toast('Listening. Press play and play along.')}else{scStop();box.hidden=true;document.querySelectorAll('.tstab .tsmiss').forEach(x=>x.classList.remove('tsmiss'))}};
 if(PLSC.on&&PLSC.res)scShow()}
new MutationObserver(()=>{if(!/^#tools-isolate/.test(location.hash)){if(PLSC.on)scStop();return}if(TS.stage==='play'){tsAudioBtns();tsScoreUI()}else if(PLSC.on)scStop()}).observe(document.getElementById('main'),{childList:true,subtree:true});
Object.assign(window,{ptStart,ptStop,PT,PLSC,__INPUT:()=>INPUT,__AC:()=>AC,tsEvents,tsPlaying,tsTime,scLat,scEval,scShow,cQuizUnits,cSecs,TOOL_GROUPS});

