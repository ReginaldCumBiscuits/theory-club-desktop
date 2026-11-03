/* ================= v34: simpler navigation ================= */
/* Seven places in the sidebar. Everything else lives inside them: a Learn library, a Practice hub,
   a Tools grid and a Progress section, each with a small tab row where it has sub-pages. */
const NAV=[['home','Home','home'],['journey','Journey','journey'],['learn','Learn','book'],['songs','Songs','songs'],['train','Practice','practice'],['tools','Tools','tool_metronome'],['progress','Progress','progress']];
const NAV_SUB={
 train:[['train','Overview'],['session','Session'],['daily','Daily challenge'],['warmup','Warm-up'],['practice','Drills'],['review','Review']],
 progress:[['progress','Stats'],['plan','Schedule'],['paths','Genre paths'],['takes','Recordings']]};
function navSection(h){h=h||'home';
 if(/^(song-|tabimport|tabedit-|mytab-)/.test(h)||h==='songs')return'songs';
 if(h==='journey'||h.startsWith('jq-'))return'journey';
 if(h==='learn'||h.startsWith('learn-'))return'learn';
 if(h==='tools'||h.startsWith('tools-'))return'tools';
 if(['train','session','daily','warmup','practice','review'].includes(h)||h.startsWith('ch-'))return'train';
 if(['progress','plan','paths','takes'].includes(h)||h.startsWith('path-'))return'progress';
 return'home'}
const toolsFor=()=>{const RAW=INST_RAW(),pitched=INST()!=='drums';return TOOLS.filter(([k])=>(pitched||['play','jam','online','read','slow','transcribe','isolate','metronome'].includes(k))&&!(PROD.has(RAW)&&k==='tuner'))};
renderChrome=function(h){const sb=document.getElementById('sidebar');const RAW=INST_RAW();const sec=navSection(h);const mine=MYINST();
 sb.innerHTML=`<div class="sbbrand">${LOGO}<b>Theory Club</b></div>${mine.length>1?`<div class="sbinst" role="group" aria-label="Instrument">${mine.map(i=>`<button data-inst="${i}" aria-pressed="${i===RAW}">${INST_NAME[i]}</button>`).join('')}</div>`:''}
  <nav class="sbnav" aria-label="Main">${NAV.map(([a,b,c])=>`<a href="#${a}" ${a===sec?'aria-current="page"':''}><span class="ic">${SBI[c]||''}</span><span>${esc(b)}</span></a>`).join('')}</nav>`;
 const tt=document.getElementById('tbtitle');if(tt)tt.textContent=h.startsWith('ch-')?'Challenge':(NAV.find(n=>n[0]===sec)||[0,'Theory Club'])[1];
 const tbk=sec==='songs'?'songs':sec==='learn'||sec==='journey'?'learn':sec==='train'?'practice':sec==='home'?'daily':'more';document.querySelectorAll('#tabbar [data-tb]').forEach(a=>{if(a.dataset.tb===tbk)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 sb.querySelectorAll('[data-inst]').forEach(b=>b.onclick=()=>{store.set('inst',b.dataset.inst);syncHeader();const h2=location.hash.slice(1);if(/^(learn-|tools-tuner|tools-finder|tools-findnote|jq-)/.test(h2))location.hash='#'+navSection(h2).replace('home','home');else route()});
 closeSidebar()};
/* the tab row for sections with sub-pages */
function navSubHTML(h){const sec=navSection(h);const L=NAV_SUB[sec];if(!L)return'';const cur=h.startsWith('ch-')?'daily':h.startsWith('path-')?'paths':h;return`<nav class="secnav pills" aria-label="${esc((NAV.find(n=>n[0]===sec)||[])[1]||'')}">${L.map(([k,t])=>`<a class="pill" href="#${k}" ${k===cur?'aria-current="page"':''}>${esc(t)}</a>`).join('')}</nav>`}
function navAddSub(){const h=location.hash.slice(1)||'home';const html=navSubHTML(h);if(!html||main.querySelector('.secnav'))return;main.insertAdjacentHTML('afterbegin',html)}
/* ---------- Learn library ---------- */
function learnSections(){const RAW=INST_RAW(),pitched=INST()!=='drums';const out=[[INST_NAME[RAW]||'Your instrument',instLearn()]];
 if(!PROD.has(RAW))out.push(['Groove & feel',LEARN_GROOVE]);if(pitched)out.push(['Theory',[...LEARN_THEORY,['rhythm','Rhythm & time']]]);out.push(['Home recording',LEARN_REC]);
 return out.map(([t,L])=>[t,L.filter((x,i,a)=>a.findIndex(y=>y[0]===x[0])===i)])}
function viewLibrary(){const secs=learnSections();let q=store.get('libq','')||'';const last=store.get('lastplace',null);
 const done=k=>{try{return lessonDone(k)}catch(e){return false}};
 const render=()=>{const ql=q.trim().toLowerCase();
  const body=secs.map(([t,L])=>{const items=L.filter(([k,n])=>!ql||n.toLowerCase().includes(ql));if(!items.length)return'';const d=L.filter(([k])=>done(k)).length;
   return`<section class="libsec"><div class="row" style="justify-content:space-between;align-items:baseline"><h3>${esc(t)}</h3><span class="hint">${d} of ${L.length} done</span></div><div class="libgrid">${items.map(([k,n])=>`<a class="libitem ${done(k)?'done':''}" href="#learn-${k}"><span>${esc(n)}</span>${done(k)?'<i aria-label="done">✓</i>':''}</a>`).join('')}</div></section>`}).join('');
  main.querySelector('#libbody').innerHTML=body||'<p class="hint">No lessons match that.</p>'};
 main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Learn</span><h1>Lessons</h1></div></div>
  <div class="libtop">${last&&last.h&&last.h.startsWith('learn-')?`<a class="btn small" href="#${last.h}">Continue: ${esc(last.title||'last lesson')}</a>`:''}<input type="search" id="libq" placeholder="Find a lesson" aria-label="Find a lesson"></div><div id="libbody" class="stack"></div>`;
 const inp=main.querySelector('#libq');inp.value=q;inp.oninput=()=>{q=inp.value;store.set('libq',q);render()};render()}
/* lessons: a back link and previous / next instead of the long side list */
{const _vl=viewLearn;viewLearn=function(id){_vl(id);const flat=learnSections().flatMap(([t,L])=>L.map(x=>[...x,t]));const i=flat.findIndex(x=>x[0]===id);const lb=main.querySelector('#lb')||main.querySelector('.lbody');if(!lb)return;
 const sec=i>=0?flat[i][2]:'Learn';const pv=i>0&&flat[i-1][2]===sec?flat[i-1]:null,nx=i>=0&&flat[i+1]&&flat[i+1][2]===sec?flat[i+1]:null;
 const top=`<a class="back lback" href="#learn">‹ ${esc(sec)}</a>`;const foot=`<nav class="lpn">${pv?`<a class="btn" href="#learn-${pv[0]}">‹ ${esc(pv[1])}</a>`:'<span></span>'}${nx?`<a class="btn" href="#learn-${nx[0]}">${esc(nx[1])} ›</a>`:''}</nav>`;
 const add=()=>{if(!main.querySelector('.lback'))(main.querySelector('.learn')||lb).insertAdjacentHTML('beforebegin',top);if(!lb.querySelector('.lpn'))lb.insertAdjacentHTML('beforeend',foot)};add();setTimeout(add,80)}}
/* ---------- Tools grid ---------- */
const TOOL_DESC={jam:'Play along with a backing band',online:'Jam live with friends',read:'Sight-reading practice',findnote:'Find notes fast on your instrument',slow:'Slow a song down without changing pitch',transcribe:'Play and see it as tab',metronome:'Click, subdivisions and gap click',tuner:'Tune with your instrument plugged in',finder:'Name any chord',play:'Play freely'};
function viewToolsHub(){return viewPlay()}
{const _vt=viewTools;viewTools=function(id){_vt(id);const sn=main.querySelector('nav.subnav');if(sn)sn.outerHTML=`<a class="back" href="#tools">‹ Tools</a>`}}
/* ---------- Practice hub ---------- */
function viewTrain(){const due=srsDue().length;const log=store.get('dailylog',{})||{},dDone=!!log[todayKey()];const card=(href,eyebrow,title,sub,cls='')=>`<a class="hcard ${cls}" href="${href}"><span class="eyebrow">${eyebrow}</span><b>${title}</b>${sub?`<span class="hint">${sub}</span>`:''}</a>`;
 main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Practice</span><h1>What do you want to practise?</h1></div></div>
 <section class="panel hsess"><div><span class="eyebrow">Practice session</span><h3>${SESSION?`In progress: ${esc(SESSION.blocks[SESSION.i].name)}`:'Let the app plan it'}</h3><p class="hint">Warm-up, your next lesson, a drill and a jam, with a timer for each part.</p></div><div class="row">${SESSION?`<a class="btn primary" href="${SESSION.blocks[SESSION.i].href}">Carry on</a>`:[15,30,60].map(m=>`<button class="btn ${m===30?'primary':''}" data-sess="${m}">${m===60?'1 hour':m+' min'}</button>`).join('')}</div></section>
 <div class="hgrid">${card('#daily','Daily challenge',dDone?'Done today ✓':'Today’s 5 questions',dDone?'Come back tomorrow.':'Same questions for everyone.',dDone?'hc-done':'')}${card('#practice','Drills','Pick topics to drill','Ten questions at your level.')}${card('#review','Review',due?`${due} due`:'Nothing due','Things come back before you forget them.')}${card('#warmup','Warm-up','Five minutes','Loosen up before you play.')}${card('#journey','Journey quizzes','Pass topics, unlock levels','20 questions, pass mark 16.')}${card('#tools-jam','Jam along','Play with the band','')}</div>`;
 main.querySelectorAll('[data-sess]').forEach(b=>b.onclick=()=>sessStart(sessionBlocks(+b.dataset.sess)))}
/* ---------- routes ---------- */
{const _r=route;route=function(){const h=location.hash.slice(1)||'home';
 if(h==='learn'||h==='train'||h==='tools'){stopSeq();stopLoop();stopDemo();QUIZ=null;clearInterval(WU_T);focusOff();renderChrome(h);if(h==='learn')viewLibrary();else if(h==='train')viewTrain();else viewToolsHub();navAddSub();return}
 _r();navAddSub()}}
/* Home: lighter. The week summary already has the streak and minutes, so the stat row goes; jam and warm-up live in Practice. */

{const tb=document.querySelector('#tabbar a[data-tb="practice"]');if(tb)tb.setAttribute('href','#train')}

