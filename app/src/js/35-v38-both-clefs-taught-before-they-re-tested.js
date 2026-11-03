/* ================= v38: both clefs, taught before they're tested ================= */
/* your instrument's own clef: bass reads bass clef, piano reads both, everyone else treble */
function homeClef(){const r=INST_RAW();return r==='bass'?'bass':r==='piano'?'both':'treble'}
function otherClef(){return homeClef()==='bass'?'treble':'bass'}
/* how often a quiz shows the other clef: never at beginner, sometimes at intermediate, half the time at experienced */
function noteClefFor(r,lv,force){const h=homeClef();if(force==='other')return otherClef();if(h==='both')return r()<.5?'treble':'bass';const p=lv<=0?0:lv===1?.25:.5;return r()<p?otherClef():h}
const CLEF_TIP={bass:'Shortcut: a line or space in bass clef is two letter names above the same spot in treble clef (bottom line E becomes G).',treble:'Shortcut: a line or space in treble clef is two letter names below the same spot in bass clef (bottom line G becomes E).'};
function noteQ(r,lv,clef){const ref=clef==='treble'?30:18;const[lo,hi]=lv===0?[-1,9]:lv===1?[-3,11]:[-4,12];
 const p=lo+Math.floor(r()*(hi-lo+1)),d=ref+p,L=d%7,oct=Math.floor(d/7);const a=lv===2&&r()<.6?(r()<.5?-1:1):0;const name=asc(L,a),ans=pr(name);
 const others=shuffle(r,[1,2,3,4,5,6]).map(k=>pr(asc((L+k)%7,a)));const dis=a?[pr(asc(L,0)),pr(asc(L,-a)),...others]:others;
 const where=p>=0&&p<=8?(p%2===0?'on a line':'in a space'):(p<0?'below the staff on ledger lines':'above the staff on ledger lines');
 const mn=clef==='treble'?'Treble clef lines are E G B D F; the spaces spell F A C E.':'Bass clef lines are G B D F A; the spaces are A C E G.';
 const h=homeClef();const other=h!=='both'&&clef!==h;
 return{prompt:other?`Name this note. It’s in ${clef} clef.`:'Name this note.',meta:clef==='treble'?'Treble clef':'Bass clef',visual:()=>staff({clef,notes:[{name,oct}]}),options:mkOpts(r,ans,dis),answer:ans,
  explain:`It's ${ans}${oct}, ${where}. ${mn}${other?' '+CLEF_TIP[clef]:''}`,reveal:()=>play([midiOf(name,oct)],{mode:'seq'})}}
G.notes=(r,lv)=>noteQ(r,lv,noteClefFor(r,lv));
G.otherclef=(r,lv)=>noteQ(r,Math.max(1,lv),noteClefFor(r,lv,'other'));
/* the Beginner journey quiz: your own clef only, even when it borrows harder questions to reach 20 */
G.noteshome=(r,lv)=>{const h=homeClef();return noteQ(r,lv,h==='both'?(r()<.5?'treble':'bass'):h)};
JT.notes=['Notes & the staff',['notes'],[['g:noteshome',1]]];
/* questions about how the clefs work */
JB.clef=[
 ['Where is middle C in treble clef?','On one ledger line below the staff',['On the bottom line','In the bottom space','On the middle line'],'Middle C sits just below the treble staff, on its own ledger line.'],
 ['Where is middle C in bass clef?','On one ledger line above the staff',['On the top line','In the top space','On the middle line'],'Middle C sits just above the bass staff. The same note links the two clefs.'],
 ['Bass clef lines, bottom to top, are…','G B D F A',['E G B D F','A C E G B','F A C E G'],'Good Boys Do Fine Always.'],
 ['Bass clef spaces, bottom to top, spell…','A C E G',['F A C E','G B D F','B D F A'],'All Cows Eat Grass.'],
 ['Treble clef lines, bottom to top, are…','E G B D F',['G B D F A','F A C E G','E G B D G'],'Every Good Boy Does Fine.'],
 ['Treble clef spaces, bottom to top, spell…','F A C E',['A C E G','E G B D','G B D F'],'The spaces spell FACE.'],
 ['The bottom line is E in treble clef. What is it in bass clef?','G',['C','E','A'],'Bass clef is two letter names above treble on the same line: E becomes G.'],
 ['The top line is F in treble clef. What is it in bass clef?','A',['D','F','G'],'Two letter names up: F becomes A.'],
 ['The bottom space is A in bass clef. What is it in treble clef?','F',['A','C','D'],'Treble clef is two letter names below bass clef on the same spot: A becomes F.'],
 ['The middle line of the bass clef is…','D',['B','F','C'],'Lines G B D F A: the middle one is D.'],
 ['The middle line of the treble clef is…','B',['D','G','C'],'Lines E G B D F: the middle one is B.'],
 ['A note on the second line up in bass clef is…','B',['G','D','E'],'G B D F A: the second line is B.'],
 ['A note in the top space of bass clef is…','G',['E','C','A'],'A C E G: the top space is G.'],
 ['A note in the bottom space of treble clef is…','F',['A','E','C'],'F A C E: the bottom space is F.'],
 ['Bass clef is also called…','The F clef',['The G clef','The C clef','The tenor clef'],'Its two dots sit either side of the F line.'],
 ['Treble clef is also called…','The G clef',['The F clef','The C clef','The alto clef'],'Its curl wraps around the G line.'],
 ['Which of these mostly read bass clef?','Bass guitar, cello and the piano’s left hand',['Guitar and violin','Flute and trumpet','Ukulele and mandolin'],'Low instruments use bass clef so their notes sit on the staff.'],
 ['Guitar music is written in treble clef but sounds…','An octave lower than written',['An octave higher than written','Exactly as written','A 5th lower than written'],'Writing it an octave up keeps it on the staff with fewer ledger lines. Bass guitar does the same in bass clef.'],
 ['The grand staff joins…','A treble staff and a bass staff',['Two treble staves','A tab staff and a treble staff','Four staves'],'Piano music uses it: right hand on top, left hand below.'],
 ['Why do low instruments use bass clef?','So their notes sit on the staff without lots of ledger lines',['Because it is easier to sing','Because it has more lines','Because sharps are not allowed in treble clef'],'Each clef puts a different range of notes on the five lines.']];
JT.otherclef=['Reading the other clef',['notes'],[['g:otherclef',2],['b:clef',1]]];
['guitar','bass','voice'].forEach(i=>{const L=JOURNEY[i]&&JOURNEY[i][1];if(L&&!L.includes('otherclef'))L.unshift('otherclef')});
/* the lesson: switch clefs, learn how they relate, and practise both */
PAGES.notes=el=>{const inst=INST();let m=inst==='bass'?33:inst==='piano'?60:48,flats=false;let cv=store.get('clefview',null);if(!['treble','bass','both'].includes(cv))cv=homeClef();
 const D={clef:homeClef()==='bass'?'bass':'treble',n:0,ok:0,q:null,done:false,seed:(Date.now()^Math.floor(Math.random()*1e9))>>>0};
 const newQ=()=>{const r=mulberry(D.seed++);const ref=D.clef==='treble'?30:18;let p;do{p=-2+Math.floor(r()*13)}while(D.q&&p===D.q.p);const d=ref+p;D.q={p,L:d%7,oct:Math.floor(d/7),picked:null}};
 const drill=()=>{const h=el.querySelector('#cdrill');if(!h)return;const best=(store.get('clefdrill',{})||{})[D.clef];
  if(D.done){h.innerHTML=`<p><b>${D.ok} of 5</b> right in ${D.clef} clef.${D.ok===5?' Perfect.':D.ok>=3?' Nearly there.':' Have another look at the lines and spaces above, then try again.'}</p><div class="row"><button class="btn primary small" id="cagain">Again</button></div>`;h.querySelector('#cagain').onclick=()=>{D.n=0;D.ok=0;D.done=false;newQ();drill()};return}
  if(!D.q)newQ();const q=D.q,name=LET[q.L];
  h.innerHTML=`<div class="split"><div>${staff({clef:D.clef,notes:[{name,oct:q.oct}]})}</div><div class="stack" style="gap:8px"><span class="hint">Note ${D.n+1} of 5${best!=null?` · your best: ${best}/5`:''}</span><div class="cletters">${['C','D','E','F','G','A','B'].map(x=>`<button class="btn small ${q.picked?(x===name?'good':x===q.picked?'bad':''):''}" data-l="${x}" ${q.picked?'disabled':''}>${x}</button>`).join('')}</div><p class="hint" aria-live="polite">${q.picked?(q.picked===name?'Right!':`That one is ${name}.`):'Which note is this?'}</p></div></div>`;
  h.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{q.picked=b.dataset.l;const ok=q.picked===name;if(ok)D.ok++;try{play([midiOf(name,q.oct)],{mode:'seq'})}catch(e){}drill();setTimeout(()=>{D.n++;if(D.n>=5){D.done=true;const B=store.get('clefdrill',{})||{};B[D.clef]=Math.max(B[D.clef]||0,D.ok);store.set('clefdrill',B)}else newQ();drill()},ok?650:1300)})};
 const render=()=>{const wm=inst==='piano'?m:m+12;const nm=(flats?FLATN:SHARPN)[m%12],oct=Math.floor(wm/12)-1;const h=homeClef();
  const one=c=>`<div class="clefbox"><span class="eyebrow">${c==='treble'?'Treble clef':'Bass clef'}</span>${staff({clef:c,notes:[{name:nm,oct}]})}</div>`;
  const hint=cv==='both'?'The same note in both clefs. Low notes need fewer ledger lines in bass clef, high notes in treble.':h==='both'?(cv==='treble'?'Treble clef: right hand, higher notes.':'Bass clef: left hand, lower notes.'):cv===h?`${INST_NAME[INST_RAW()]||'Your instrument'} reads ${h} clef.`:`${INST_NAME[INST_RAW()]||'Your instrument'} usually reads ${h} clef. Here’s the same note in ${cv} clef.`;
  el.innerHTML=`<span class="eyebrow">Theory</span><h1>Notes & the staff</h1><p>Music uses seven letters, A to G, then repeats. The black keys are sharps (♯, a half step up) or flats (♭, a half step down), so the same key can have two names, like C♯ and D♭. Tap any ${inst==='piano'?'key':'fret'} to see where it sits on the staff.${inst==='piano'?'':` ${INST_RAW()==='bass'?'Bass':'Guitar'} music is written an octave higher than it sounds, so it fits on the staff with fewer ledger lines.`}</p>
  <div class="panel"><div class="split"><div class="stack" style="gap:6px"><span class="eyebrow">You played</span><h2 style="font-size:2.4rem">${pr(nm)}<span style="color:var(--muted);font-size:.5em">${oct}</span></h2><p class="hint">${hint}</p><div class="pickrow"><span class="eyebrow">Show it in</span>${pillsHTML('cv',[['treble','Treble clef'],['bass','Bass clef'],['both','Both']],cv,'pills')}</div>${pillsHTML('acc',[['s','Show sharps'],['f','Show flats']],flats?'f':'s')}</div><div class="clefpair ${cv==='both'?'two':''}">${cv==='both'?one('treble')+one('bass'):one(cv)}</div></div>
  ${noteInput(m)}</div>
  <div class="cols"><div class="mini"><h4>Treble clef</h4><p class="o">Lines, bottom to top: <b>E G B D F</b> (Every Good Boy Does Fine). Spaces spell <b>F A C E</b>.</p></div><div class="mini"><h4>Bass clef</h4><p class="o">Lines: <b>G B D F A</b> (Good Boys Do Fine Always). Spaces: <b>A C E G</b> (All Cows Eat Grass).</p></div><div class="mini"><h4>Ledger lines</h4><p class="o">Short extra lines for notes above or below the staff. Middle C sits on one ledger line between the clefs.</p></div></div>
  <section class="panel"><h3>Reading the other clef</h3><p class="hint">${h==='both'?'Piano reads both clefs at once, so it’s worth knowing how they fit together.':`You’ll mostly read ${h} clef, but quizzes at Intermediate and Experienced also show ${otherClef()} clef, and so does a lot of the music you’ll meet.`}</p>
   <div class="cols"><div class="mini"><h4>Middle C links them</h4><p class="o">In treble clef, middle C sits on one ledger line <b>below</b> the staff. In bass clef it sits on one ledger line <b>above</b>.</p><div class="clefpair two sm">${staff({clef:'treble',notes:[{name:'C',oct:4}]})}${staff({clef:'bass',notes:[{name:'C',oct:4}]})}</div></div>
   <div class="mini"><h4>The two-letter shortcut</h4><p class="o">The same line or space is <b>two letter names higher</b> in bass clef than in treble clef. Bottom line: E in treble, <b>G</b> in bass. Top line: F in treble, <b>A</b> in bass. Spaces: F A C E become <b>A C E G</b>. (The bass clef notes still sound lower, because the whole staff sits lower.)</p></div>
   <div class="mini"><h4>The grand staff</h4><p class="o">Piano music joins a treble staff (right hand) and a bass staff (left hand) with a brace. Middle C sits between them, so a melody can move from one staff to the other.</p></div></div></section>
  <section class="panel clefdrillp"><div class="row" style="justify-content:space-between;align-items:center"><h3>Quick check</h3>${pillsHTML('dc',[['treble','Treble clef'],['bass','Bass clef']],D.clef,'pills')}</div><p class="hint">Name five notes. Try your own clef first, then the other one.</p><div id="cdrill"></div></section>`;
  bindPills(el,(g,v)=>{if(g==='acc'){flats=v==='f';render()}else if(g==='cv'){cv=v;store.set('clefview',v);render()}else if(g==='dc'){D.clef=v;D.n=0;D.ok=0;D.done=false;D.q=null;render()}});
  el.querySelector('.ninput').addEventListener('keypick',e=>{m=e.detail;render()});drill()};
 render()};

