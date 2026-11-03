/* ================= v39: technique levels in the journey ================= */
const JTECH={
 guitar:[['downpick','power','pent','slides','shuffle','skank','mutedriff'],['bends','vibrato','legato','doublestops','arpeggio','funk','travis','jangle','riffs','thumbchord'],['octaves','chicken','tremolo','gypsy','dom7s9','tritone','rakes','scratch','phrasing','chromatic','triadinv','blockchords']],
 bass:[['root8','r5','octave','bslides','reggae'],['walk','melodic','ghost','bchromatic','hook'],['slap','harmonics','fast16','bchords','gallop','unison']],
 drums:[['rockbeat','twobeat','hats','fills','motorik','disco'],['ghost16','shuffle','onedrop','toms','train','triplets','hits','washhat'],['halfshuffle','swing','brushes','doublekick','heavy','pressroll']],
 piano:[['ballad','arps','waltz','pump','alberti'],['boogie','octaves','ostinato','charleston','slipnote'],['jazzvoicings','stride','gliss','gospel','crush']]};
const jtInst=()=>{const i=INST_RAW();return JTECH[i]?i:null};
const jtKeys=(inst,lv)=>(JTECH[inst]||[])[lv]?JTECH[inst][lv].filter(k=>(TECH[inst]||(inst==='voice'?VTECH.T:{}))[k]):[];
/* people who already passed a level before technique topics existed keep the levels they unlocked */
(()=>{try{if(store.get('jtgrandDone',false))return;const all=store.get('journey',{})||{};const G={};
 for(const inst in all){if(!JOURNEY[inst])continue;const S=all[inst]||{};let g=0;for(let lv=0;lv<2;lv++){if(JOURNEY[inst][lv].every(id=>S[`${lv}.${id}`]&&S[`${lv}.${id}`].passed))g=lv+1;else break}if(g)G[inst]=g}
 store.set('jtgrand',G);store.set('jtgrandDone',true)}catch(e){}})();
const jGrand=lv=>{const g=(store.get('jtgrand',{})||{})[INST_RAW()]||0;return lv<=g};
['Beginner','Intermediate','Experienced'].forEach((n,lv)=>{JT['tech'+lv]=[n+' techniques',['jtech-'+lv],[['g:tech'+lv,1]]]});
for(const inst in JTECH)JOURNEY[inst].forEach((L,lv)=>{if(!L.includes('tech'+lv))L.push('tech'+lv)});
/* questions about the techniques at one level */
const jtMask=(txt,name)=>{let t=String(txt||'');const ws=[name,...name.split(/[ &,/]+/).filter(w=>w.length>4)];ws.forEach(w=>{t=t.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),'this')});return t.replace(/\b(the|a|an|your) this\b/gi,'this').replace(/\bthis this\b/gi,'this').replace(/(^|[.!?]\s+)this\b/g,(m,p)=>p+'This')};
const jtFirst=t=>String(t||'').split(/(?<=\.)\s/)[0];
function jtQuestion(r,lv,ks0,inst0){const inst=inst0||jtInst();const PLAYING=inst==='voice'?'singing':'playing';if(!inst)return null;const TT=techT(inst),XX=techX(inst);const ks=(ks0||jtKeys(inst,lv)).filter(k=>TT[k]);if(ks.length<2)return null;const all=Object.keys(TT).filter(k=>TT[k].name&&!k.startsWith('__'));
 const k=pick(r,ks);const T=TT[k],X=XX[k]||{};const others=n=>shuffle(r,[...shuffle(r,ks.filter(x=>x!==k)),...shuffle(r,all.filter(x=>x!==k&&!ks.includes(x)))]).slice(0,n);
 const nameQ=(prompt,explain)=>{const opts=[T.name];for(const o of others(12)){const nm=TT[o].name;if(!opts.includes(nm))opts.push(nm);if(opts.length===4)break}return opts.length===4?{prompt,options:shuffle(r,opts),answer:T.name,explain}:null};
 const textQ=(prompt,ans,field,explain)=>{if(!ans)return null;const opts=[ans];for(const o of others(all.length)){const Y=XX[o]||{};let v=Y[field];if(Array.isArray(v))v=pick(r,v);if(field==='theory')v=jtFirst(v);if(v&&!opts.includes(v)&&!v.toLowerCase().includes(T.name.toLowerCase()))opts.push(v);if(opts.length===4)break}return opts.length===4?{prompt,options:shuffle(r,opts),answer:ans,explain}:null};
 const kinds=['desc','desc','how','about','mist','songs','vary','plan','theory','history','fix'];
 for(let t=0;t<6;t++){const kind=pick(r,kinds);let q=null;
  if(kind==='desc')q=nameQ(`Which technique is this? “${T.desc}”`,X.about?jtFirst(X.about):T.desc);
  else if(kind==='how'&&X.how&&X.how.length){const h=pick(r,X.how);if(!h.toLowerCase().includes(T.name.toLowerCase()))q=nameQ(`“${jtMask(h,T.name)}” Which technique is this a step of?`,`It’s one of the steps for ${T.name}.`)}
  else if(kind==='about'&&X.about)q=nameQ(`Which technique is described here? “${jtMask(jtFirst(X.about),T.name)}”`,X.about);
  else if(kind==='mist'&&X.mist&&X.mist.length){const m=pick(r,X.mist);q=textQ(`Which of these is a common mistake when ${PLAYING} ${T.name}?`,m,'mist',`Watch out for this with ${T.name}: ${m}`)}
  else if(kind==='vary'&&X.vary&&X.vary.length){const v=pick(r,X.vary);q=textQ(`Once you’ve got ${T.name}, which of these is a variation to try?`,v,'vary',v)}
  else if(kind==='plan'&&X.plan&&X.plan.length)q=textQ(`What’s the first step in the practice plan for ${T.name}?`,X.plan[0],'plan',`Start slowly: ${X.plan[0]}`);
  else if(kind==='theory'&&X.theory)q=textQ(`Why does ${T.name} sound the way it does?`,jtFirst(X.theory),'theory',X.theory);
  else if(kind==='songs'){const yes=techSongs(inst,k,'');if(yes.length){const y=pick(r,yes);const no=[];(PLAYDB[inst]||[]).forEach(L=>L.songs.forEach(sg=>{if(Array.isArray(sg[1])&&!sg[1].includes(k)&&!String(sg[1][0]).startsWith('pd:'))no.push(`${sg[0]} (${L.name})`)}));const ans=`${y[1]} (${y[2]})`;const opts=[ans];for(const n of shuffle(r,no)){if(!opts.includes(n))opts.push(n);if(opts.length===4)break}if(opts.length===4)q={prompt:`Which of these songs uses ${T.name}?`,options:shuffle(r,opts),answer:ans,explain:`${y[1]} by ${y[2]} uses ${T.name}. You can practise it on the song’s page.`}}}
  else if(kind==='history'&&X.history)q=nameQ(`Which technique is this about? “${jtMask(X.history,T.name)}”`,X.history);
  else if(kind==='fix'&&X.fix&&X.fix.length){const fx=pick(r,X.fix);q=textQ(`With ${T.name}: “${fx[0]}”. What’s the fix?`,fx[1],'fixa',fx[1])}
  if(q){q.jt=k+':'+kind;return q}}
 return nameQ(`Which technique is this? “${T.desc}”`,T.desc)}
[0,1,2].forEach(lv=>{G['tech'+lv]=(r,lv2)=>{const q=jtQuestion(r,lv);if(q)q.topic='j-tech'+lv;return q}});
/* the technique workshop: every technique at a level, with its 3-step lesson */
function viewJTech(lv,o){o=o||{};const inst=o.inst||jtInst();if(!inst){location.hash='#journey';return}const TT=techT(inst),XX=techX(inst);const ks=(o.keys||jtKeys(inst,lv)).filter(k=>TT[k]);const key=o.quizKey||`${lv}.tech${lv}`;const S=jStore()[key];const un=jUnlocked(lv);const ttl=o.title||`${JLV[lv]} techniques`;const unitOK=jUnits().flat().some(u=>u.key===key);const back=o.back||'#journey';
 const card=k=>{const T=TT[k],X=XX[k]||{};const songs=PLAYDB[inst]?techSongs(inst,k,'').slice(0,4):[];
  return`<details class="panel jtcard" data-k="${k}"><summary><b>${esc(T.name)}</b><span class="hint">${esc(T.desc)}</span></summary>
  ${X.about?`<p>${esc(X.about)}</p>`:''}${X.theory?`<p class="hint"><b>How it works:</b> ${esc(X.theory)}</p>`:''}
  <div class="jtgrid">${X.how?`<div><h4>How to play it</h4><ol>${X.how.map(h=>`<li>${esc(h)}</li>`).join('')}</ol></div>`:''}${X.mist?`<div><h4>Watch out for</h4><ul>${X.mist.map(h=>`<li>${esc(h)}</li>`).join('')}</ul></div>`:''}
  ${X.plan?`<div><h4>Practice plan</h4><ol>${X.plan.map(h=>`<li>${esc(h)}</li>`).join('')}</ol></div>`:''}${X.vary?`<div><h4>Once you’ve got it, try</h4><ul>${X.vary.map(h=>`<li>${esc(h)}</li>`).join('')}</ul></div>`:''}</div>
  ${techMore(X)}${T.textonly?'':`<div class="row jtsteps">${X.move?`<button class="btn small" data-st="move">1 · ${esc(X.move.name)}</button>`:''}<button class="btn small" data-st="study">${X.move?'2 · ':''}Study</button>${X.phrase?`<button class="btn small" data-st="phrase">3 · ${esc(X.phrase.name)}</button>`:''}</div>
  <div class="jtplayer stack"></div>`}
  ${songs.length?`<p class="hint">Songs that use it: ${songs.map(s=>`<a href="#song-${s[0]}">${esc(s[1])}</a> (${esc(s[2])})`).join(' · ')}</p>`:''}</details>`};
 main.innerHTML=`<a class="back" href="${back}">‹ ${back==='#journey'?'Learning journey':'Back'}</a><div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">${JLV[lv]} · ${esc(INST_NAME[inst]||inst)}${o.road?' · '+esc(o.road):''}</span><h1>${esc(ttl)}</h1>
  ${o.noQuiz?`<p class="lede">${esc(TT[ks[0]]?TT[ks[0]].desc:'')} Open the lesson plan below and work through it at your own pace.</p>`:`<p class="lede">Learn these ${ks.length} techniques, then pass the quiz (${JPASS} out of ${JN}) to finish the ${JLV[lv]} level${lv<2?` and move on to ${JLV[lv+1]}`:''}. ${techT(inst)===VTECH.T?'Open each one and read how to do it, what to avoid and how to practise it.':'Open each one, read how it works and play through its three steps.'}</p>`}</div>
  ${un&&unitOK?`<a class="btn ${S&&S.passed?'':'primary'}" href="#jq-${key}">${S&&S.passed?'Retake the quiz':'Take the quiz'}</a>`:''}</div>
  ${S?`<p class="hint">Best ${S.best}/${JN}${S.passed?' · passed ✓':` · need ${JPASS}`}</p>`:''}${o.noQuiz?'':!unitOK?`<p class="callout">This quiz is on the ${esc(o.road||'')} road. Choose that road on the journey page to take it.</p>`:un?'':`<p class="callout">Pass every ${JLV[lv-1]} topic to unlock this quiz. You can still learn the techniques now.</p>`}
  <div class="stack jtlist">${ks.map(card).join('')}</div>`;
 main.querySelectorAll('.jtcard').forEach(d=>{const k=d.dataset.k;d.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{stopSeq();main.querySelectorAll('.jtplayer').forEach(p=>p.innerHTML='');d.querySelectorAll('[data-st]').forEach(x=>x.classList.toggle('primary',x===b));
  const ex=songStepEx(inst,k,b.dataset.st,[k]);if(ex)mountPlayer(d.querySelector('.jtplayer'),ex,{srs:{id:'jtech:'+inst+':'+k+':'+b.dataset.st,title:techLabel(inst,k),href:o.href||('#learn-jtech-'+lv)}})})})}
{const _r=route;route=function(){const h=location.hash.slice(1);const m=h.match(/^learn-jtech-([0-2])$/);if(m){stopSeq();stopLoop();stopDemo();QUIZ=null;renderChrome('journey');viewJTech(+m[1]);return}_r()}}
{const _jl=jLessonLinks;jLessonLinks=function(u){const t=u.lessons.find(k=>/^jtech-/.test(k));if(t)return`<a href="#learn-${t}">${JLV[u.lv]} techniques workshop</a>`;return _jl(u)}}

