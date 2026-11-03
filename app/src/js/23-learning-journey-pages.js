/* ================= learning journey: pages ================= */
function jLessonLinks(u){return u.lessons.filter(k=>PAGES[k]||PL[k]||[...LEARN_INST,...LEARN_THEORY].find(x=>x[0]===k)||k==='rhythm').map(k=>`<a href="#learn-${k}">${esc(learnTitle?learnTitle(k):k)}</a>`).join(' · ')}
function viewJourney(){const units=jUnits();const S=jStore();let sel=+(store.get('jlv',jCurLevel()));if(!jUnlocked(sel))sel=jCurLevel();
 const render=()=>{const lvDone=units.map((U,lv)=>U.filter(u=>S[u.key]&&S[u.key].passed).length);const next=units[sel].find(u=>!(S[u.key]&&S[u.key].passed));const locked=!jUnlocked(sel);
  main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Learning journey · ${esc(INST_NAME[INST_RAW()]||'')}</span><h1>From beginner to experienced</h1><p class="lede">Every topic has a lesson and a 20-question quiz with new questions each time. Score ${JPASS} or more to pass. Pass every topic in a level to unlock the next.</p></div></div>
  <div class="jlevels" role="tablist">${JLV.map((n,lv)=>{const un=jUnlocked(lv),done=lvDone[lv]===units[lv].length;return`<button class="jlv ${lv===sel?'on':''} ${un?'':'locked'} ${done?'done':''}" role="tab" aria-selected="${lv===sel}" data-lv="${lv}"><span class="eyebrow">${un?(done?'Complete ✓':lv===jCurLevel()?'In progress':'Unlocked'):'🔒 Locked'}</span><b>${n}</b><i class="hbar"><i style="width:${Math.round(lvDone[lv]/units[lv].length*100)}%"></i></i><small class="hint">${lvDone[lv]} of ${units[lv].length} topics passed</small></button>`}).join('')}</div>
  ${locked?`<p class="callout">Pass every ${JLV[sel-1]} quiz to unlock ${JLV[sel]}. You can look at the topics below, and open their lessons any time.</p>`:''}
  <div class="jlist">${units[sel].map((u,i)=>{const s=S[u.key];const passed=s&&s.passed;const isNext=!locked&&next===u;return`<div class="junit ${passed?'passed':''} ${isNext?'next':''} ${locked?'locked':''}">
   <span class="jnum">${passed?'✓':i+1}</span><div class="jbody"><b>${esc(u.t)}</b>${u.lessons.length?`<span class="hint jlinks">Lesson: ${jLessonLinks(u)}</span>`:''}<span class="hint">${s?`Best ${s.best}/${JN}${passed?' · passed':` · need ${JPASS}`} · ${s.att} attempt${s.att>1?'s':''}`:isNext?'Up next':'Not started'}</span></div>
   <div class="jact">${u.lessons.length?`<a class="btn small" href="#learn-${u.lessons[0]}">Lesson</a>`:''}${locked?'':`<a class="btn small ${isNext?'primary':''}" href="#jq-${u.key}">${passed?'Retake quiz':'Take quiz'}</a>`}</div></div>`}).join('')}</div>`;
  main.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{sel=+b.dataset.lv;store.set('jlv',sel);render()})};
 render()}
function viewJourneyQuiz(key){const u=jUnits().flat().find(x=>x.key===key);if(!u||!jUnlocked(u.lv)){location.hash='#journey';return}audio();
 const begin=()=>{const qs=jMake(u);window.__jqs=qs;
  main.innerHTML=`<a class="back" href="#journey">‹ Learning journey</a><div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">${JLV[u.lv]} · quiz</span><h1>${esc(u.t)}</h1><p class="lede">${qs.length} questions. Score ${JPASS} or more to pass.</p></div><button class="btn small" id="jquit">Stop</button></div><div id="jqq"></div>`;
  main.querySelector('#jquit').onclick=()=>{QUIZ=null;location.hash='#journey'};
  runQuiz(main.querySelector('#jqq'),qs,{label:u.t,onDone:(score,marks)=>{const S=jStore();const prev=S[u.key]||{best:0,att:0,passed:false};const wasDone=jLevelDone(u.lv);const passed=score>=JPASS;
   jSave(u.key,{best:Math.max(prev.best,score),att:prev.att+1,passed:prev.passed||passed,at:Date.now()});const nowDone=jLevelDone(u.lv);const unlocked=!wasDone&&nowDone&&u.lv<2;
   if(nowDone&&LEVEL()<Math.min(2,u.lv+1)&&u.lv<2)store.set('level',u.lv+1);
   const missed=qs.map((q,i)=>marks[i]?null:q).filter(Boolean);const units=jUnits()[u.lv];const nx=units.find(x=>{const s=jStore()[x.key];return!(s&&s.passed)});
   const h=main.querySelector('#jqq');h.innerHTML=`<section class="qcard result jres ${passed?'pass':'fail'}"><span class="eyebrow">${passed?'Passed':'Not this time'}</span><div class="big">${score}<span style="font-size:.45em;color:var(--muted)">/${qs.length}</span></div>
    <div class="dots">${marks.map(m=>`<i class="${m?'ok':''}"></i>`).join('')}</div>
    <p class="o">${passed?(unlocked?`That’s every ${JLV[u.lv]} topic passed. <b>${JLV[u.lv+1]} is now unlocked.</b>`:u.lv===2&&nowDone?'That’s the whole journey. You’ve passed every Experienced topic.':'Nice work. On to the next topic.'):`You need ${JPASS} to pass, ${JPASS-score} more than this time. Have another look at the lesson, then try again: the questions change every time.`}</p>
    <div class="row" style="justify-content:center">${passed?(nx?`<a class="btn primary" href="#jq-${nx.key}">Next: ${esc(nx.t)}</a>`:unlocked?`<a class="btn primary" href="#journey" data-jlv="${u.lv+1}">Start ${JLV[u.lv+1]}</a>`:''):`${u.lessons.length?`<a class="btn primary" href="#learn-${u.lessons[0]}">Review the lesson</a>`:''}`}<button class="btn" id="jagain">Try a new set</button><a class="btn" href="#journey">Back to the journey</a></div></section>
    ${missed.length?`<section class="panel"><h3>Questions to review</h3><ul class="jmiss">${missed.map(q=>`<li><span>${esc(q.prompt)}${q.meta?` <span class="hint">(${esc(q.meta)})</span>`:''}</span>${q.visual?`<div class="scroll jvis">${(()=>{try{return q.visual()}catch(e){return''}})()}</div>`:''}<b>${esc(q.answer)}</b><small class="hint">${esc(q.explain||'')}</small></li>`).join('')}</ul></section>`:''}`;
   h.querySelector('#jagain').onclick=begin;const sl=h.querySelector('[data-jlv]');if(sl)sl.onclick=()=>store.set('jlv',+sl.dataset.jlv);
   if(passed&&unlocked)toast(`${JLV[u.lv+1]} unlocked`)}})};
 begin()}
/* routes, sidebar, Home and lesson pages */
{const _r=route;route=function(){const h=location.hash.slice(1);if(h==='journey'||h.startsWith('jq-')){stopSeq();stopLoop();stopDemo();QUIZ=null;clearInterval(WU_T);focusOff();renderChrome('journey');if(h==='journey')viewJourney();else viewJourneyQuiz(h.slice(3));return}_r()}}
SBI.journey='<svg viewBox="0 0 16 16"><path d="M3 13.5c2-4 8-1 10-6"/><circle cx="3" cy="13.5" r="1.5"/><path d="M11 2.5h3.5v3.5"/><path d="M14.5 2.5 10 7"/></svg>';

{const _vl=viewLearn;viewLearn=function(id){_vl(id);const lid=id||'';const u=jUnits().flat().find(x=>x.lessons.includes(lid)&&jUnlocked(x.lv));const lb=main.querySelector('#lb')||main.querySelector('.lbody');if(!u||!lb||lb.querySelector('.jcta'))return;const s=jStore()[u.key];
 const add=()=>{if(lb.querySelector('.jcta'))return;lb.insertAdjacentHTML('beforeend',`<section class="panel jcta"><div><span class="eyebrow">Learning journey · ${JLV[u.lv]}</span><h3>Quiz: ${esc(u.t)}</h3><p class="hint">${JN} questions, pass mark ${JPASS}.${s?` Your best: ${s.best}/${JN}${s.passed?' ✓':''}.`:''}</p></div><a class="btn primary" href="#jq-${u.key}">${s&&s.passed?'Retake':'Take'} the quiz</a></section>`)};add();setTimeout(add,60)}}

