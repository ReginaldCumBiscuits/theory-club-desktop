/* ================= v47: the full course, from complete beginner to college level ================= */
const CPACE=[['relaxed','Relaxed',2.5,'about 25 minutes a day'],['steady','Steady',5,'about 50 minutes, 6 days a week'],['serious','Serious',10,'about 1½ hours a day'],['fulltime','Full-time',25,'like a full-time music student']];
const cInst=()=>COURSE.inst[INST_RAW()]?INST_RAW():'guitar';
const cData=()=>COURSE.inst[cInst()];
function cState(){const all=store.get('course',{})||{};return all[cInst()]||{goals:{},done:{}}}
function cSave(st){const all=store.get('course',{})||{};all[cInst()]=st;store.set('course',all)}
function cPace(){const p=store.get('coursePace','steady');return CPACE.find(x=>x[0]===p)||CPACE[1]}
function cTheory(n){const d=cData();return(d.theory||COURSE.theory)[n]||[]}
function cEar(n){const d=cData();return(d.ear||COURSE.ear)[n]||[]}
function cEquiv(n){const d=cData();return d.equiv&&d.equiv[n]||COURSE.stages[n-1].equiv}
function cGoals(n){return cData().stages[n].goals}
function cStageDone(n,st=cState()){if(st.done&&st.done[n])return true;const g=cGoals(n);return g.every((_,i)=>st.goals&&st.goals[n+'.'+i])}
function cCurrent(st=cState()){for(let n=1;n<=8;n++)if(!cStageDone(n,st))return n;return 9}
function cTicked(n,st=cState()){if(st.done&&st.done[n])return cGoals(n).length;return cGoals(n).filter((_,i)=>st.goals&&st.goals[n+'.'+i]).length}
/* time: each stage has a number of practice hours; your pace sets the hours per week */
/* skills need time to settle however much you practise, so each stage has a minimum length */const CMINW=[6,16,36,40,52,36,36,40];
function cWeeks(n){return Math.max(CMINW[n-1],COURSE.stages[n-1].hours/cPace()[2])}
function cFmt(w){if(w<9)return`${Math.max(1,Math.round(w))} week${Math.round(w)>1?'s':''}`;const m=w/4.345;if(m<18){const r=Math.round(m);return`${r} month${r>1?'s':''}`}const y=m/12;return`${(Math.round(y*2)/2).toString().replace('.5','½')} years`}
function cSpan(n){let a=0;for(let k=1;k<n;k++)a+=cWeeks(k);return[a,a+cWeeks(n)]}
const cBandCls=b=>({Beginner:'b1',Intermediate:'b2',Advanced:'b3',College:'b4'}[b]||'b1');
function courseLede(){const d=cData();const p=cPace();const g8=cSpan(5)[1],all=cSpan(8)[1];
 return`<p class="lede">${esc(d.intro)}</p><p class="hint">At a ${p[1].toLowerCase()} pace (${p[3]}), you'd reach ${d.equiv?'a release-ready level, ready to apply for a production degree,':'a Grade 8, audition-ready level'} in about <b>${cFmt(g8)}</b>, and the end of college level in about <b>${cFmt(all)}</b>. College stages are a degree's worth of work, so they need far more time each week than the early ones. A teacher, other musicians and regular feedback make a big difference at every stage, and they matter most from stage 5 on.</p>`}
function viewCourse(arg){const n=+arg;if(n>=1&&n<=8)return viewCourseStage(n);const d=cData(),st=cState(),cur=cCurrent(st);
 main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Your course · ${esc(d.name)}</span><h1>From complete beginner to college level</h1>${courseLede()}</div></div>
 <section class="panel"><span class="eyebrow">How much time can you give it?</span>${pillsHTML('cpace',CPACE.map(p=>[p[0],p[1]]),cPace()[0])}<p class="hint">${esc(cPace()[3].replace(/^./,c=>c.toUpperCase()))}. Change it whenever life changes; the plan adjusts.</p></section>
 <ol class="crsline">${COURSE.stages.map(S=>{const nn=S.id,done=cStageDone(nn,st),t=cTicked(nn,st),tot=cGoals(nn).length,sp=cSpan(nn);const state=done?'done':nn===cur?'cur':'';
  return`<li class="crsst ${state}"><a class="hcard" href="#course-${nn}"><span class="eyebrow"><span class="crsband ${cBandCls(S.band)}">${S.band}</span> Stage ${nn}${done?' · Done ✓':nn===cur?' · You are here':''}</span><b>${esc(S.title)}</b><span class="hint">${esc(d.stages[nn].focus)}</span><span class="crsmeta"><span>${esc(cEquiv(nn))}</span><span>${nn===1?'First':'From'} ${nn===1?cFmt(sp[1]):cFmt(sp[0])}${nn===1?'':' to '+cFmt(sp[1])}</span></span><i class="hbar" aria-hidden="true"><i style="width:${Math.round(100*t/tot)}%"></i></i><span class="sr-only">${t} of ${tot} goals done</span></a></li>`}).join('')}</ol>
 <details class="panel crsplace"><summary>Already play? Start at the right stage</summary><p class="hint">Read each stage's goals. Start at the first stage where you can't yet do everything on the list. Earlier stages are marked as done; you can untick them later.</p><div class="row" style="gap:8px;flex-wrap:wrap">${COURSE.stages.map(S=>`<button class="btn small" data-cstart="${S.id}">Start at stage ${S.id}</button>`).join('')}</div></details>
 <p class="hint">Grade comparisons are approximate and refer to the ABRSM, Trinity and RSL Rockschool exams. Times are estimates: everyone learns at a different speed.</p>`;
 bindPills(main,(g,v)=>{if(g==='cpace'){store.set('coursePace',v);viewCourse('')}});
 main.querySelectorAll('[data-cstart]').forEach(b=>b.onclick=()=>{const k=+b.dataset.cstart;const s=cState();s.done=s.done||{};for(let q=1;q<=8;q++){if(q<k)s.done[q]=true;else delete s.done[q]}cSave(s);toast(`Starting at stage ${k}`);location.hash='#course-'+k})}
function viewCourseStage(n){const d=cData(),S=COURSE.stages[n-1],X=d.stages[n],st=cState();const sp=cSpan(n);const tot=X.practice.reduce((a,p)=>a+p[0],0);
 const list=(h,a)=>a&&a.length?`<section class="panel"><h2>${h}</h2><ul class="crsl">${a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`:'';
 const render=()=>{const s=cState();const done=s.done&&s.done[n];const t=cTicked(n,s),all=X.goals.length;
 main.innerHTML=`<nav class="crumbs" aria-label="Breadcrumb"><a href="#course">Your course</a> › Stage ${n}</nav>
 <div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow"><span class="crsband ${cBandCls(S.band)}">${S.band}</span> Stage ${n} of 8 · ${esc(d.name)}</span><h1>${esc(S.title)}</h1><p class="lede">${esc(X.focus)}</p>
  <p class="hint">${esc(cEquiv(n))}. About ${S.hours.toLocaleString()} hours of practice: roughly ${cFmt(cWeeks(n))} at a ${cPace()[1].toLowerCase()} pace (${n===1?'the first':cFmt(sp[0])+' to '+cFmt(sp[1])+' into the course'}).</p></div></div>
 <section class="panel crsgoals"><h2>Ready to move on when…</h2><p class="hint">Tick each one when you can do it reliably, on a normal day, without warming up for it.</p>
  <ul class="crschk">${X.goals.map((g,i)=>`<li><label><input type="checkbox" data-cg="${i}" ${done||(s.goals&&s.goals[n+'.'+i])?'checked':''}> <span>${esc(g)}</span></label></li>`).join('')}</ul>
  <i class="hbar" aria-hidden="true"><i style="width:${Math.round(100*t/all)}%"></i></i><p class="hint" aria-live="polite">${t===all?`Stage ${n} done.${n<8?` On to stage ${n+1}.`:' You finished the whole course.'}`:`${t} of ${all} done`}</p>
  ${t===all&&n<8?`<a class="btn primary" href="#course-${n+1}">Start stage ${n+1}</a>`:''}</section>
 <section class="panel crsp"><h2>A typical practice day</h2><p class="hint">${tot} minutes. Split it differently if you need to, but keep every part in.</p><div class="crsday" role="list">${X.practice.map(([m,l])=>`<div class="crsseg" role="listitem" style="flex:${m}"><b>${m} min</b><span>${esc(l)}</span></div>`).join('')}</div></section>
 <div class="crsgrid">${list('Technique',X.tech)}${list('Theory',cTheory(n))}${list(cData().ear?'Critical listening':'Ear training',cEar(n))}${list(n>=6?'Repertoire and projects':'Songs and pieces',X.rep)}${list('Create',X.create)}<section class="panel"><h2>Milestone</h2><p>${esc(X.perform)}</p></section></div>
 ${X.links&&X.links.length?`<section class="panel crsp"><h2>Use in Theory Club</h2><div class="row" style="gap:8px;flex-wrap:wrap">${X.links.map(([h,l])=>`<a class="btn small" href="${h}">${esc(l)}</a>`).join('')}<a class="btn small" href="#journey">Learning journey quizzes</a></div></section>`:''}
 <nav class="row crsnav" aria-label="Stages">${n>1?`<a class="btn" href="#course-${n-1}">‹ Stage ${n-1}</a>`:'<span></span>'}<a class="btn" href="#course-all">All stages</a>${n<8?`<a class="btn" href="#course-${n+1}">Stage ${n+1} ›</a>`:'<span></span>'}</nav>`;
 main.querySelectorAll('[data-cg]').forEach(c=>c.onchange=()=>{const s2=cState();s2.goals=s2.goals||{};s2.done=s2.done||{};if(s2.done[n]&&!c.checked){delete s2.done[n];X.goals.forEach((_,i)=>{s2.goals[n+'.'+i]=true})}s2.goals[n+'.'+c.dataset.cg]=c.checked;if(!s2.started)s2.started=todayKey();cSave(s2);const y=window.scrollY;const id=c.dataset.cg;render();window.scrollTo(0,y);const again=main.querySelector(`[data-cg="${id}"]`);if(again)again.focus()})};
 render()}
/* way in from Home and the Learn page */

{const _vl=viewLearn;viewLearn=function(){_vl.apply(this,arguments);try{const nav=main.querySelector('.lnav');if(nav&&!nav.querySelector('.lcourse'))nav.insertAdjacentHTML('afterbegin',`<a href="#course" class="lcourse"><b>Your full course</b><span class="hint">Beginner to college, stage by stage</span></a>`)}catch(e){}}}
{const _r=route;route=function(){const h=location.hash.slice(1);if(h==='course'||h.startsWith('course-')){try{stopSeq();stopLoop();stopDemo()}catch(e){}renderChrome('learn');viewCourse(h.slice(7));return}return _r.apply(this,arguments)}}
Object.assign(window,{viewCourse,cState,cCurrent,COURSE});

