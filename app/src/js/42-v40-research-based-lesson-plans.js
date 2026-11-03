/* ================= v40: research-based lesson plans ================= */
/* Each technique gets the same seven-step plan, built on: sound before symbol (Gordon, Suzuki), feeling the beat in the body (Dalcroze, Kodály),
   learning by ear in short phrases (traditional and popular musicians, Lucy Green), slow accurate practice (Duke, Simmons & Cash 2009),
   mental rehearsal (Bernardi et al. 2013), mixing techniques (Carter & Grahn 2016), creating (Orff, Green) and spaced review (Simmons 2012). */
const PLAN_WHY={
 listen:'Hearing music before reading it is the starting point of the Suzuki, Kodály and Gordon methods, and of how most popular and traditional musicians learn.',
 feel:'Dalcroze and Kodály teachers start rhythm with the body: clapping, stepping and counting aloud make the beat something you feel, not just read.',
 copy:'Traditional musicians, from Irish sessions to Indian music lessons, learn a phrase at a time by copying. Lucy Green’s research found that learning by ear like this improves listening and motivation.',
 slow:'In a study of advanced pianists (Duke, Simmons & Cash, 2009), what predicted a good performance the next day was how accurately they practised, not how long or how many times they played it.',
 mental:'Pianists who rehearsed a piece in their head and then played it for ten minutes did about as well as those who only played it (Bernardi and colleagues, 2013).',
 mix:'Skilled clarinettists who switched between pieces while practising tended to improve more than when they practised one piece at a time, even though switching felt harder (Carter & Grahn, 2016).',
 create:'Orff teaching and Lucy Green’s classroom studies both build in improvising and making up your own versions, which helps understanding and keeps practice fun.',
 review:'Musicians who practised a passage, slept and practised again made fewer errors than those who crammed it into one session (Simmons, 2012). Short, regular practice beats one long session.'};
function planPartner(inst,k,pool){const P=(pool||[]).filter(x=>x!==k&&techT(inst)[x]);if(P.length)return P[0];for(const L of (JTECH[inst]||[]))if(L.includes(k)){const o=L.filter(x=>x!==k&&techT(inst)[x]);if(o.length)return o[0]}return null}
function lessonPlanHTML(inst,k,pool){const T=techT(inst)[k],X=techX(inst)[k];if(!T||!X)return'';const text=!!T.textonly;
 const bpm=(X.move&&X.move.bpm)||T.bpm||80,slow=Math.max(40,Math.round(bpm*.7/4)*4),goal=(X.phrase&&X.phrase.bpm)||bpm;
 const songs=PLAYDB[inst]?techSongs(inst,k,'').slice(0,2):[];const pt=planPartner(inst,k,pool);const ptn=pt?techT(inst)[pt].name:null;
 const vary=(X.vary&&X.vary[0])||'Change the rhythm of one bar.';
 const steps=text?[
  ['listen','Listen',4,'Listen to singers known for it (see “Where it comes from”) two or three times before you try it. Notice what it sounds like and when they use it.'],
  ['feel','Feel it in your body',2,'Breathe low and slow for a minute. Stand tall, loosen your shoulders and jaw.'],
  ['copy','Copy a short phrase',8,'Pick one short line from a song, sing it, record it and compare with the original. Copy just that line until it matches.'],
  ['slow','Practise it slowly and accurately',8,`Use the steps under “How to do it”. Go slowly and stop the moment something feels tight: ${esc((X.mist&&X.mist[0])||'tension is the main thing to avoid')}`],
  ['mental','Rehearse it in your head',1,'Before singing again, imagine the sound and the feeling once, silently.'],
  ['create','Make it yours',4,`Try this: ${esc(vary)}`],
  ['review','Come back tomorrow and next week',0,'Five minutes tomorrow does more than an extra half hour today.']]:[
  ['listen','Listen first',3,`Press play on the Study example and listen twice without playing. Hum or sing it back.${songs.length?` Then hear it in a real song: ${songs.map(s=>`<a href="#song-${s[0]}">${esc(s[1])}</a>`).join(' or ')}.`:''}`],
  ['feel','Feel the rhythm',2,'Tap or clap the rhythm along with the playback and count out loud (“1 & 2 &”). For drums, tap it on your legs first.'],
  ['copy','Copy it in small pieces',8,`Learn step 1${X.move?` (“${esc(X.move.name)}”)`:''} one bar at a time. Copy it by ear first, then check the ${inst==='drums'?'grid':inst==='piano'?'notation':'tab'}.`],
  ['slow','Practise slowly, without mistakes',10,`Set the tempo to about ${slow} BPM. Play it three times in a row with no mistakes, then raise it by 4 BPM. If you make a mistake, slow down rather than repeating it. Aim for ${goal} BPM over a few days.`],
  ['mental','Play it in your head',1,'Before your next try, imagine playing it once: hear the sound and picture your hands.'],
  ['mix','Mix it with another technique',5,ptn?`Alternate a few minutes on this with a few minutes on <b>${esc(ptn)}</b>. It feels harder than sticking to one, but you’ll remember both better.`:'Alternate it with something you already know, a few minutes each.'],
  ['create','Make it yours',4,`Try a variation: ${esc(vary)} Then improvise four bars of your own using the technique.`],
  ['review','Come back tomorrow and next week',0,'Five minutes tomorrow and again in a week does more than an extra half hour today.']];
 const tot=steps.reduce((a,s)=>a+s[2],0);
 return`<details class="lplan"><summary><b>Lesson plan</b> <span class="hint">${steps.length} steps · about ${tot} minutes · <span class="lpq">short on time? Do steps 1, 4 and ${steps.length}</span></span></summary>
  <ol class="lpsteps">${steps.map(([id,name,min,txt])=>`<li><div><b>${name}</b>${min?` <span class="hint">${min} min</span>`:''}</div><div>${txt}</div><details class="lpwhy"><summary>Why this works</summary><p class="hint">${PLAN_WHY[id]}</p></details></li>`).join('')}</ol>
  <p class="hint"><a href="#learn-method">How Theory Club teaches, and the research behind it</a></p></details>`}
/* add the plan to song lessons and technique workshops */
{const _sl=songLessonHTML;songLessonHTML=function(inst,sel,step,techs,s,L,title){const h=_sl(inst,sel,step,techs,s,L,title);if(sel==='_all'||!(TECHX[inst]||{})[sel])return h;const lp=lessonPlanHTML(inst,sel,techs);const at=h.indexOf('<div class="pills lsteps"');return at<0?h+lp:h.slice(0,at)+lp+h.slice(at)}}
{const _vt=viewJTech;viewJTech=function(lv,o){_vt(lv,o);o=o||{};const inst=o.inst||jtInst();if(!inst)return;const ks=[...main.querySelectorAll('.jtcard')].map(d=>d.dataset.k);
 main.querySelectorAll('.jtcard').forEach(d=>{const k=d.dataset.k;const anchor=d.querySelector('.jtsteps')||d.querySelector('.jtplayer')||d.lastElementChild;const html=lessonPlanHTML(inst,k,ks);if(anchor&&anchor.parentNode===d)anchor.insertAdjacentHTML('beforebegin',html);else d.insertAdjacentHTML('beforeend',html)})}}
/* ---------- road weekly plan and can-do milestones (like graded-exam criteria) ---------- */
function roadPlanHTML(x){const TT=techT(x.inst),XX=techX(x.inst);const voice=x.inst==='voice';
 const can=lv=>x.lv[lv].tech.filter(k=>TT[k]).map(k=>{const X=XX[k]||{};const b=X.phrase&&X.phrase.bpm;return voice?`I can explain and demonstrate ${TT[k].name.toLowerCase()} in a song, comfortably and without strain.`:`I can play “${esc(X.phrase?X.phrase.name:TT[k].name)}” (${esc(TT[k].name)})${b?` cleanly at ${b} BPM`:''}.`});
 const L1=x.lv[1],t1=L1.tech.filter(k=>TT[k]).map(k=>TT[k].name);
 const week=[['Day 1','Warm up 5 min · new technique 15 min (use its lesson plan) · listen to one song from the road 10 min'],['Day 2','Warm up 5 min · yesterday’s technique, slowly and accurately 10 min · a topic lesson 15 min'],['Day 3','Warm up 5 min · mix two techniques, a few minutes each 15 min · learn a short phrase by ear 10 min'],['Day 4','Warm up 5 min · topic quiz 10 min · play along with a song 15 min'],['Day 5','Warm up 5 min · improvise or write 4 bars with this week’s technique 15 min · review last week’s technique 10 min'],['Weekend','Play for fun: jam with friends, record yourself, or take the road quiz']];
 return`<section class="panel"><h3>A week on this road</h3><p class="hint">About 30 minutes a day, five days a week. Short, regular sessions work better than one long one. Take one technique per week, in order: ${t1.map(esc).join(', ')}.</p>
  <table class="wkplan"><tbody>${week.map(([d,t])=>`<tr><th>${d}</th><td>${t}</td></tr>`).join('')}</tbody></table></section>
  <section class="panel"><h3>What you’ll be able to do</h3><div class="lgrid"><div><h4>After ${JLV[1]}</h4><ul class="cando">${can(1).map(c=>`<li>${c}</li>`).join('')}</ul></div><div><h4>After ${JLV[2]}</h4><ul class="cando">${can(2).map(c=>`<li>${c}</li>`).join('')}</ul></div></div><p class="hint">Tick these off yourself when they feel easy, then take the quizzes to pass each level.</p></section>`}
{const _rg=viewRoadGuide;viewRoadGuide=function(id){_rg(id);const x=ROADMAP[id];if(!x)return;const secs=main.querySelectorAll('section.panel');if(secs[0])secs[0].insertAdjacentHTML('afterend',roadPlanHTML(x))}}
/* ---------- “How Theory Club teaches”: the method, in plain words ---------- */
PAGES.method=el=>{const P=[
 ['Hear it before you read it','Babies learn to speak long before they read. Music works the same way. The Suzuki, Kodály and Gordon methods all start with listening and singing before notation, so every lesson here starts with the sound.','Edwin Gordon called this “audiation”: hearing music in your head with understanding.'],
 ['Feel the beat in your body','Clap it, tap it, step it and count it out loud. Swiss teacher Émile Jaques-Dalcroze built a whole method (eurhythmics) on moving to music, and Kodály teachers use rhythm syllables like “ta” and “ti-ti”.','That’s why lessons ask you to tap along first.'],
 ['Learn by ear, a phrase at a time','In Irish sessions, Indian classical lessons and rock bands, music is passed on by copying short phrases. Lucy Green studied how popular musicians learn and brought it into schools: students copied real songs by ear, and their listening, playing and motivation improved.','So lessons link to real songs, and ask you to copy before you read.'],
 ['Practise slowly and accurately','A study of advanced pianists found that how accurately they practised predicted how well they played the next day, while the amount of practice and number of repetitions did not (Duke, Simmons & Cash, 2009). Mistakes you repeat are mistakes you learn.','Play it right three times in a row, then speed up a little.'],
 ['Practise in your head too','Pianists who rehearsed a passage in their imagination and then played it for ten minutes did nearly as well as those who only played it (Bernardi and colleagues, 2013). Imagining the sound and movement is real practice, and saves your hands.',''],
 ['Mix it up','Switching between two or three things in a session feels harder than drilling one, but a study of skilled clarinettists found it tended to lead to better playing (Carter & Grahn, 2016). That feeling of difficulty is part of learning.','Each lesson plan suggests a technique to mix with.'],
 ['Little and often','Musicians who practised, slept and practised again made fewer errors than those who did it all in one go (Simmons, 2012). Research on spacing in music is still growing (one 2017 study of beginners with short gaps found no difference), so the safest advice is to come back on different days.','Your quizzes and reviews are spread out over days for this reason.'],
 ['Make something of your own','Carl Orff’s Schulwerk has children improvise from the first lesson, and Green’s research shows composing and improvising alongside playing deepens understanding. Every technique ends with “make it yours”.',''],
 ['Small steps, then a goal','Graded exams (ABRSM, Trinity, Rockschool) and the Suzuki repertoire move in small steps, each adding one new skill. Theory Club’s levels and roads work the same way, with clear “I can…” goals.','']];
 el.innerHTML=`<div class="lhead"><span class="eyebrow">Learning</span><h1>How Theory Club teaches</h1><p class="lede">Every lesson follows the same simple plan, built from music-education research and from how classical, traditional and popular musicians have always learned.</p></div>
  <section class="panel"><h3>The lesson plan in one line</h3><p><b>Listen → feel the beat → copy a little at a time → practise slowly and accurately → mix it up → make it yours → come back tomorrow.</b></p></section>
  ${P.map(([h,t,n])=>`<section class="panel"><h3>${h}</h3><p>${t}</p>${n?`<p class="hint">${n}</p>`:''}</section>`).join('')}
  <section class="panel"><h3>Sources</h3><ul class="hint"><li>Duke, R. A., Simmons, A. L. & Cash, C. D. (2009). It’s not how much; it’s how. <i>Journal of Research in Music Education</i>.</li><li>Carter, C. E. & Grahn, J. A. (2016). Optimizing music learning: blocked and interleaved practice schedules. <i>Frontiers in Psychology</i>.</li><li>Simmons, A. L. (2012). Distributed practice and procedural memory consolidation in musicians’ skill learning. <i>Journal of Research in Music Education</i>.</li><li>Wiseheart, M., D’Souza, A. A. & Chae, J. (2017). Lack of spacing effects during piano learning. <i>PLoS ONE</i>.</li><li>Bernardi, N. F. and colleagues (2013). Mental practice in music memorization. <i>Music Perception</i>.</li><li>Green, L. (2002). <i>How Popular Musicians Learn</i>; Green, L. (2008). <i>Music, Informal Learning and the School</i>.</li><li>Gordon, E. E. <i>Learning Sequences in Music</i> (Music Learning Theory).</li><li>The Suzuki, Kodály, Dalcroze and Orff approaches to music education.</li></ul></section>`};
if(typeof LEARN_THEORY!=='undefined'&&!LEARN_THEORY.find(x=>x[0]==='method'))LEARN_THEORY.unshift(['method','How we teach']);

