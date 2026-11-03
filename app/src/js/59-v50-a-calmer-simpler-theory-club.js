/* ================= v50: a calmer, simpler Theory Club ================= */
/* ---- show features as you're ready for them ---- */
const UNLOCK={'tools-online':2,'tools-read':2,'tools-transcribe':2,'tools-isolate':2,'plan':2,'roads':3};
const UNLOCK_NAME={'tools-online':'Jam online','tools-read':'Sight-reading','tools-transcribe':'Play to tab','tools-isolate':'Song transcriber','plan':'Song plans','roads':'Choosing a road'};
const showAll=()=>!!store.get('showAll',false);
/* people who already use the app keep everything they had; new people see things as they get to them */
if(store.get('v50mig',null)==null){store.set('v50mig',1);if(PROFILE())store.set('showAll',true)}
function stageNow(){try{return Math.min(8,cCurrent())}catch(e){return 1}}
function ready(k){return showAll()||!UNLOCK[k]||stageNow()>=UNLOCK[k]}
function isNew(k){const s=store.get('newSeen',{})||{};return !!UNLOCK[k]&&!showAll()&&stageNow()>=UNLOCK[k]&&!s[k]&&(store.get('unlockFrom',1)||1)<UNLOCK[k]}
function markSeen(k){const s=store.get('newSeen',{})||{};if(!s[k]){s[k]=1;store.set('newSeen',s)}}
function unlockCheck(){const n=stageNow();const last=store.get('unlockAt',null);if(last==null){store.set('unlockAt',n);return}if(n>last){const fresh=Object.keys(UNLOCK).filter(k=>UNLOCK[k]>last&&UNLOCK[k]<=n);store.set('unlockAt',n);if(fresh.length&&!showAll())setTimeout(()=>toast('New for you: '+fresh.map(k=>UNLOCK_NAME[k]).join(', ')+'.'),400)}}
const newTag=k=>isNew(k)?'<span class="newtag">New for you</span>':'';

/* ---- four sections: Today, Learn, Play, You ---- */
NAV.length=0;NAV.push(['home','Today','home'],['course','Learn','book'],['play','Play','songs'],['progress','You','progress']);
for(const k in NAV_SUB)delete NAV_SUB[k];
NAV_SUB.home=[['home','Today'],['daily','Daily challenge'],['train','More practice']];
NAV_SUB.course=[['course','Your course'],['learn','Lessons'],['journey','Quizzes'],['plan','Song plan']];
NAV_SUB.play=[['play','Everything'],['songs','Songs']];
NAV_SUB.progress=[['progress','Progress'],['takes','Recordings'],['paths','Genre paths']];
navSection=function(h){h=h||'home';
 if(['home','train','session','daily','warmup','practice','review'].includes(h)||h.startsWith('ch-'))return'home';
 if(h==='course'||h.startsWith('course-')||h==='journey'||h.startsWith('jq-')||h==='plan'||h==='plan-new'||h==='roads'||h==='learn'||h.startsWith('learn-')||h==='licks'||h.startsWith('lick-')||h==='ear')return'course';
 if(h==='play'||h==='songs'||/^(song-|tabimport|tabedit-|mytab-)/.test(h)||h==='tools'||h.startsWith('tools-'))return'play';
 if(['progress','paths','takes','plan-sched'].includes(h)||h.startsWith('path-'))return'progress';
 return'home'};
{const _rc=renderChrome;renderChrome=function(h){_rc(h);const sec=navSection(h==='journey'?'course':h);const tb={home:'home',course:'course',play:'play',progress:'progress'}[sec];document.querySelectorAll('#tabbar [data-tb]').forEach(a=>{if(a.dataset.tb===tb)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});const tt=document.getElementById('tbtitle');if(tt)tt.textContent=(NAV.find(n=>n[0]===sec)||[0,'Theory Club'])[1]}}
/* tabs only on the section front pages, not inside lessons and tools */
navSubHTML=function(h){const sec=navSection(h);const L=NAV_SUB[sec];if(!L)return'';if(!(L.some(x=>x[0]===h)||/^course-\d$/.test(h)||h.startsWith('ch-')))return'';const items=L.filter(([k])=>ready(k));const cur=h.startsWith('ch-')?'daily':/^course-/.test(h)?'course':h;
 return`<nav class="secnav pills" aria-label="${esc((NAV.find(n=>n[0]===sec)||[])[1]||'')}">${items.map(([k,t])=>`<a class="pill" href="#${k}" ${k===cur?'aria-current="page"':''}>${esc(t)}</a>`).join('')}</nav>`};
/* the phone tab bar */
function tabbarFix(){const tb=document.getElementById('tabbar');if(!tb||tb.dataset.v50)return;tb.dataset.v50=1;const ic=k=>`<span class="tbic" aria-hidden="true">${SBI[k]||''}</span>`;const more=tb.querySelector('#tbmore');
 tb.querySelectorAll('a').forEach(a=>a.remove());[['home','home','Today','home'],['course','course','Learn','book'],['play','play','Play','songs'],['progress','progress','You','progress']].reverse().forEach(([h,k,t,i])=>{const a=document.createElement('a');a.href='#'+h;a.dataset.tb=k;a.innerHTML=ic(i)+t;tb.insertBefore(a,tb.firstChild)})}
tabbarFix();
/* tuner and metronome, one tap away */
function quickTools(){const acts=document.querySelector('.hdr-actions');if(!acts)return;const want=[['metronome','Metronome']];const RAW=INST_RAW();if(INST()!=='drums'&&!PROD.has(RAW))want.unshift(['tuner','Tuner']);
 acts.querySelectorAll('.qtool').forEach(b=>{if(!want.some(w=>w[0]===b.dataset.q))b.remove()});
 want.forEach(([k,t])=>{if(acts.querySelector(`.qtool[data-q="${k}"]`))return;const a=document.createElement('a');a.className='iconbtn qtool';a.dataset.q=k;a.href='#tools-'+k;a.title=t;a.setAttribute('aria-label',t);a.innerHTML=`<span class="ic">${SBI['tool_'+k]||t}</span>`;const pt=document.getElementById('ptbtn');acts.insertBefore(a,pt?pt.nextSibling:acts.firstChild)})}
/* Play: songs and every playing tool in one place */
function viewPlay(){const T=toolsFor().filter(([k])=>ready('tools-'+k));const card=([k,t])=>`<a class="hcard toolcard" href="#tools-${k}"><span class="ic">${SBI['tool_'+k]||''}</span><b>${esc(t)}</b><span class="hint">${esc(TOOL_DESC[k]||'')}</span>${newTag('tools-'+k)}</a>`;
 const groups=[['Songs',[`<a class="hcard toolcard" href="#songs"><span class="ic">${SBI.songs||''}</span><b>Songs</b><span class="hint">Songs to learn at your level, with tab and play-along</span></a>`]],...TOOL_GROUPS.map(([g,ks])=>[g,ks.map(k=>T.find(x=>x[0]===k)).filter(Boolean).map(card)])];
 main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Play</span><h1>Play</h1><p class="lede">Songs, backing bands and tools for playing along.</p></div></div>${groups.filter(g=>g[1].length).map(([g,items])=>`<section class="toolgrp" aria-labelledby="pg-${g.replace(/\W/g,'')}"><h2 id="pg-${g.replace(/\W/g,'')}" class="toolgh">${g}</h2><div class="toolgrid">${items.join('')}</div></section>`).join('')}${showAll()?'':`<p class="hint">More tools appear as you move through your course. To see everything now, turn on “Show everything” in Settings.</p>`}`}


/* ---- today's practice, built from your course stage ---- */
function dayMins(){const p=cPace()[0];return store.get('todayMins',{relaxed:25,steady:30,serious:50,fulltime:60}[p]||30)}
function rot(a,salt){if(!a||!a.length)return null;const d=Math.floor(Date.now()/864e5);return a[(d+(salt||0))%a.length]}
function todayBlocks(mins){const n=stageNow(),X=cData().stages[n];const inst=INST();const songHref='#songs';
 const warm={name:'Warm-up',href:'#warmup',what:'Loosen up slowly, then build speed.'};
 const tech={name:'Technique',href:(X.links&&X.links[0]&&X.links[0][0])||'#course-'+n,what:rot(X.tech,0)||'This stage\'s technique.'};
 const song={name:'Play a song',href:songHref,what:(rot(X.rep,1)||'A song at your level')+'. Play along, slowly at first.'};
 let quiz=null;try{const Q=cQuizUnits(n);const S=jStore();const u=Q&&jUnlocked(Q.lv)&&Q.list.find(x=>!(S[x.key]&&S[x.key].passed));if(u)quiz={name:'Checkpoint: '+u.t,href:'#jq-'+u.key,what:'A 20-question quiz. Score 16 or more to pass.'}}catch(e){}
 const theory={name:inst==='drums'?'Groove and reading':'Theory and ear',href:'#review',what:rot([...cTheory(n),...cEar(n)],2)||'Review what you learned this week.'};
 const jam={name:'Jam along',href:'#tools-jam',what:'Play over the band: improvise or keep the groove.'};
 const last=quiz||theory;
 const B=mins<=15?[[warm,2],[tech,5],[song,5],[last,3]]:mins<=30?[[warm,3],[tech,9],[song,10],[last,8]]:mins<=50?[[warm,5],[tech,15],[song,15],[theory,7],[quiz||jam,8]]:[[warm,5],[tech,18],[song,17],[theory,8],[quiz||jam,7],[jam,5]];
 return B.map(([b,m])=>Object.assign({},b,{mins:m}))}
/* a session counts its own time */
{const _ss=sessStart;sessStart=function(blocks){_ss(blocks);if(!PT.on){ptStart(false);PT.bySession=true}}}
{const _sb=sessBar;sessBar=function(){_sb.apply(this,arguments);if(!SESSION&&PT.on&&PT.bySession){PT.bySession=false;ptStop()}}}
function viewToday(){unlockCheck();const n=stageNow(),S=COURSE.stages[n-1],X=cData().stages[n];const st=cState();const mins=dayMins();const blocks=todayBlocks(mins);const log=store.get('dailylog',{})||{},dDone=!!log[todayKey()];const last=store.get('lastplace',null);const wm=weekMinutes();const streak=playStreak();
 const next=X.goals.find((_,i)=>!(st.goals&&st.goals[n+'.'+i]));const t=cTicked(n,st),all=X.goals.length;
 main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">${esc(new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'}))}</span><h1>${esc(greet())}</h1></div></div>
 <section class="panel today"><div class="todayhead"><div class="stack" style="gap:4px;min-width:0"><span class="eyebrow">Today's practice</span><h2>${SESSION?'Keep going':`${mins} minutes`}</h2></div>${pillsHTML('tmins',[['15','15 min'],['30','30 min'],['50','50 min'],['60','1 hour']],String(mins))}</div>
  <ol class="todaylist">${blocks.map(b=>`<li><b>${b.mins} min</b><span class="stack" style="gap:0;min-width:0"><span>${esc(b.name)}</span><span class="hint">${esc(b.what)}</span></span></li>`).join('')}</ol>
  <button class="btn primary big" id="tgo">${SESSION?'Continue: '+esc(SESSION.blocks[SESSION.i].name):'Start today\'s practice'}</button>
  <p class="hint">The app takes you through each part with a timer and counts the time for you.</p></section>
 <div class="todaycards">
  <a class="hcard" href="#course-${n}"><span class="eyebrow">Your course · Stage ${n} of 8</span><b>${esc(S.title)}</b><span class="hint">${next?'Next goal: '+esc(next):'All goals ticked. Open the stage to move on.'}</span><i class="hbar" aria-hidden="true"><i style="width:${Math.round(100*t/all)}%"></i></i></a>
  ${last&&last.h?`<a class="hcard" href="#${esc(last.h)}"><span class="eyebrow">Continue where you left off</span><b>${esc(last.title||'Last page')}</b></a>`:''}
  <a class="hcard" href="#daily"><span class="eyebrow">Daily challenge</span><b>${dDone?'Done today ✓':'10 quick questions'}</b><span class="hint">${streak?`${streak}-day streak · `:''}${wm} min this week</span></a>
 </div>`;
 bindPills(main,(g,v)=>{if(g==='tmins'){store.set('todayMins',+v);viewToday()}});
 main.querySelector('#tgo').onclick=()=>{if(SESSION){location.hash=SESSION.blocks[SESSION.i].href;return}sessStart(blocks)}
 try{if(store.get('welcomed',false)&&store.get('wnSeen','')!==WN_VER&&!document.querySelector('#onb'))setTimeout(()=>{if(location.hash===''||location.hash==='#home')showWhatsNew()},700)}catch(e){}}


/* ---- a gentler course page: just where you are; the whole map is one tap away ---- */
{const _vc=viewCourse;viewCourse=function(arg){if(arg==='all'){_vc('');const h=main.querySelector('.pagehead h1');if(h)h.insertAdjacentHTML('beforebegin','<nav class="crumbs" aria-label="Breadcrumb"><a href="#course">Your course</a> › All stages</nav>');if(stageNow()<UNLOCK.roads&&!showAll()){const rb=main.querySelector('.jroadbar');if(rb)rb.remove()}return}
 const n=+arg;if(n>=1&&n<=8)return _vc(arg);unlockCheck();const k=stageNow(),S=COURSE.stages[k-1],X=cData().stages[k],st=cState();const t=cTicked(k,st),all=X.goals.length;const next=X.goals.map((g,i)=>[g,i]).find(([,i])=>!(st.goals&&st.goals[k+'.'+i]));const hrs=cSecs(k,st)/3600;
 main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Your course · ${esc(cData().name)}</span><h1>Stage ${k}: ${esc(S.title)}</h1><p class="lede">${esc(X.focus)}</p></div></div>
 <section class="panel crsnow"><span class="eyebrow">Your next goal</span>${next?`<label class="crsnext"><input type="checkbox" id="cnext"> <span>${esc(next[0])}</span></label><p class="hint">Tick it when you can do it reliably. ${t} of ${all} goals done in this stage.</p>`:`<p>Every goal in this stage is ticked.</p>`}
  <i class="hbar" aria-hidden="true"><i style="width:${Math.round(100*t/all)}%"></i></i>
  <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><a class="btn primary" href="#course-${k}">${next?'Open this stage':`Start stage ${Math.min(8,k+1)}`}</a><a class="btn" href="#home">Today's practice</a></div></section>
 <section class="panel"><span class="eyebrow">This week</span><p><b>${weekMinutes()}</b> minutes practised · <b>${cHrs(hrs*3600)}</b> of about ${S.hours.toLocaleString()} hours in this stage so far.</p></section>
 <p><a href="#course-all">See the whole course</a> <span class="hint">· all 8 stages, timings and your pace</span></p>`;
 const c=main.querySelector('#cnext');if(c)c.onchange=()=>{const s2=cState();s2.goals=s2.goals||{};s2.goals[k+'.'+next[1]]=c.checked;if(!s2.started)s2.started=todayKey();cSave(s2);announce('Goal ticked');setTimeout(()=>viewCourse(''),500)}}}
/* the stage page: goals and practice first; the detail folds away */
{const _vs=viewCourseStage;viewCourseStage=function(n){_vs(n);const fold=()=>{if(location.hash!=='#course-'+n)return;const g=main.querySelector('.crsgrid');if(g&&!g.closest('details')){const d=document.createElement('details');d.className='panel crsmore';d.innerHTML='<summary>What this stage covers: technique, theory, ear, songs and more</summary>';g.parentNode.insertBefore(d,g);d.appendChild(g)}
  const day=main.querySelector('.crsday');if(day&&!day.closest('details')){const sec=day.closest('section');if(sec){const d=document.createElement('details');d.className='panel crsmore';d.innerHTML='<summary>A typical practice day</summary>';sec.parentNode.insertBefore(d,sec);d.appendChild(sec);sec.classList.add('flat')}}
  if(!ready('plan'))main.querySelectorAll('.crsq').forEach(s=>{if(s.querySelector('a[href="#plan-new"],a[href="#plan"]'))s.remove()})};
 fold();const ob=new MutationObserver(()=>{if(location.hash!=='#course-'+n){ob.disconnect();return}fold()});ob.observe(main,{childList:true})}}

/* ---- the three-question start ---- */
const START_LEVEL=[['new','I\'m brand new','Never played, or only a little.',1,0],['some','I know a few basics','A few chords, beats or simple tunes.',2,0],['songs','I play songs comfortably','I can get through whole songs.',3,1],['adv','I\'m advanced','Years of playing, around Grade 6 or more.',5,2]];
const START_TIME=[['relaxed','About 20 minutes','Most days'],['steady','About 50 minutes','Most days'],['serious','1 to 2 hours','Every day'],['fulltime','It\'s my main thing','Like a full-time student']];
function openOnboarding(){const p=PROFILE()||{};const st={inst:(p.insts&&p.insts[0])||null,lvl:null,time:null};let step=0;
 let ov=document.getElementById('onb');if(!ov){ov=document.createElement('div');ov.id='onb';ov.className='onb';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','onbt');document.body.appendChild(ov)}
 const render=()=>{let body='';
  if(step===0)body=`<h2 id="onbt">What do you want to learn?</h2><p class="lede">Pick one to start. You can add more later in Settings.</p><div class="onbgrid">${['guitar','bass','piano','drums','voice','ableton','logic','midi'].map(i=>`<button class="onbcard" data-i="${i}" aria-pressed="${st.inst===i}"><b>${INST_NAME[i]}</b><span>${INST_DESC[i]}</span></button>`).join('')}</div>`;
  if(step===1)body=`<h2 id="onbt">How much can you already do?</h2><p class="lede">This puts you at the right stage of your course.</p><div class="onbgrid one">${START_LEVEL.map(([k,t,d])=>`<button class="onbcard" data-l="${k}" aria-pressed="${st.lvl===k}"><b>${t}</b><span>${d}</span></button>`).join('')}</div>`;
  if(step===2)body=`<h2 id="onbt">How much time do you have?</h2><p class="lede">Today's practice fits this, and you can change it any day.</p><div class="onbgrid one">${START_TIME.map(([k,t,d])=>`<button class="onbcard" data-t="${k}" aria-pressed="${st.time===k}"><b>${t}</b><span>${d}</span></button>`).join('')}</div>`;
  const can=step===0?!!st.inst:step===1?!!st.lvl:!!st.time;
  ov.innerHTML=`<div class="onbcard-wrap"><div class="onbdots" aria-hidden="true">${[0,1,2].map(i=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div><p class="hint">Question ${step+1} of 3</p>${body}<div class="row onbnav">${step?'<button class="btn" id="onbback">Back</button>':'<span></span>'}<button class="btn primary" id="onbnext" ${can?'':'disabled'}>${step===2?'Start':'Continue'}</button></div></div>`;
  ov.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{st.inst=b.dataset.i;render()});ov.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{st.lvl=b.dataset.l;render()});ov.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{st.time=b.dataset.t;render()});
  const bk=ov.querySelector('#onbback');if(bk)bk.onclick=()=>{step--;render()};ov.querySelector('#onbnext').onclick=next;const f=ov.querySelector('[aria-pressed="true"]')||ov.querySelector('.onbcard');if(f)f.focus()};
 const next=()=>{if(step<2){step++;render();return}const L=START_LEVEL.find(x=>x[0]===st.lvl);const stage=L[3];
  store.set('profile',{name:p.name||'',insts:[st.inst,...((p.insts||[]).filter(i=>i!==st.inst))],level:L[4],genres:p.genres||[],at:Date.now()});store.set('inst',st.inst);store.set('level',L[4]);store.set('welcomed',true);store.set('toured',true);store.set('wnSeen',WN_VER);try{store.set('ptopics',topicPool([st.inst]))}catch(e){}
  store.set('coursePace',st.time);store.set('todayMins',{relaxed:25,steady:30,serious:50,fulltime:60}[st.time]);
  const all=store.get('course',{})||{};const cs=all[st.inst]||{goals:{},done:{}};cs.done=cs.done||{};for(let q=1;q<stage;q++)cs.done[q]=true;cs.started=cs.started||todayKey();all[st.inst]=cs;store.set('course',all);store.set('unlockAt',stage);store.set('unlockFrom',stage);
  ov.remove();syncHeader();try{prewarm(st.inst==='drums'?'guitar':st.inst==='piano'?'piano':st.inst)}catch(e){}location.hash='#home';route();announce('All set. Here is today\'s practice.')};
 render()}

/* ---- Settings: show everything ---- */
new MutationObserver(()=>{const b=document.getElementById('setbody');if(!b||!b.firstChild||document.getElementById('setall'))return;b.insertAdjacentHTML('beforeend',`<div class="pickrow"><span class="eyebrow">Features</span><label class="row" style="gap:8px;align-items:flex-start;flex-wrap:nowrap"><input type="checkbox" id="setall" ${showAll()?'checked':''}><span>Show everything <span class="hint">(otherwise some tools appear as your course reaches them)</span></span></label></div>`);document.getElementById('setall').onchange=e=>{store.set('showAll',e.target.checked);route()}}).observe(document.body,{childList:true,subtree:true});

/* ---- routes ---- */
{const _r=route;route=function(){const h=location.hash.slice(1)||'home';
 if(h==='play'||h==='tools'){try{stopSeq();stopLoop();stopDemo()}catch(e){}renderChrome('play');viewPlay();navAddSub();quickTools();return}
 if(h==='course-all'){try{stopSeq();stopLoop();stopDemo()}catch(e){}renderChrome('course');viewCourse('all');navAddSub();quickTools();return}
 _r.apply(this,arguments);const k=h.startsWith('tools-')?h:h==='plan'||h==='plan-new'?'plan':h;if(UNLOCK[k]&&ready(k))markSeen(k);if(h==='home'){renderChrome('home');navAddSub()}const bk=main.querySelector('a.back[href="#tools"]');if(bk)bk.textContent='‹ Play';quickTools()}}
Object.assign(window,{viewToday,todayBlocks,stageNow,ready,UNLOCK,viewPlay});

