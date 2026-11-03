/* ================= UI ================= */
if(typeof document!=='undefined'){
const main=document.getElementById('main');

let QUIZ=null;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

document.addEventListener('click',e=>{const k=e.target.closest('.kb .k, .fb .fd');if(!k||k.dataset.midi==null)return;const m=+k.dataset.midi;play([m],{mode:'seq',dur:1.1});k.classList.add('flash');setTimeout(()=>k.classList.remove('flash'),180);k.dispatchEvent(new CustomEvent('keypick',{bubbles:true,detail:m}))});
document.addEventListener('keydown',e=>{if(!QUIZ||e.target.matches('input,textarea,select'))return;if(/^[1-4]$/.test(e.key))QUIZ.choose(+e.key-1);else if(e.key==='Enter')QUIZ.next();else if(e.key===' '&&QUIZ.replay){e.preventDefault();QUIZ.replay()}});

function runQuiz(host,qs,{label,onDone}){let i=0,score=0;const marks=[];let answered=false;
 function show(){const q=qs[i];answered=false;q._t0=Date.now();
  host.innerHTML=`<section class="qcard" aria-live="polite"><div class="qtop"><span>${esc(label)} · ${i+1} of ${qs.length}</span><span class="qtopic">${esc(q.topicLabel)}${q.meta?' · '+esc(q.meta):''}</span></div>
   <div class="pbar"><i style="width:${i/qs.length*100}%"></i></div><h2 class="qprompt">${esc(q.prompt)}</h2><div class="qvis"></div><div class="opts${q.options.length===2?' two':''}"></div><div class="qfoot" hidden></div></section>`;
  const vis=host.querySelector('.qvis'),opts=host.querySelector('.opts');
  if(q.visual)vis.insertAdjacentHTML('beforeend',`<div class="scroll" style="display:flex;justify-content:center;width:100%">${q.visual()}</div>`);
  if(q.play){const b=document.createElement('button');b.className='playbig';b.innerHTML=ICON.play+' Play sound';b.onclick=()=>q.play();vis.append(b);vis.insertAdjacentHTML('beforeend','<p class="hint">Press space to hear it again.</p>');if(q.autoplay&&AC&&AC.state==='running')setTimeout(()=>q.play(),250)}
  q.options.forEach((o,j)=>{const b=document.createElement('button');b.className='opt';b.innerHTML=`<kbd>${j+1}</kbd><span>${esc(o)}</span>`;b.onclick=()=>choose(j);opts.append(b)});
  QUIZ={choose,next:()=>{if(answered)advance()},replay:q.play||q.reveal||null}}
 function choose(j){if(answered)return;const q=qs[i];if(j>=q.options.length)return;answered=true;logPractice(Math.min(60,(Date.now()-(q._t0||Date.now()))/1000));const ok=q.options[j]===q.answer;if(ok)score++;marks.push(ok);
  const st=store.get('stats',{});const s=st[q.topic]||{a:0,c:0};s.a++;if(ok)s.c++;s.h=(s.h||[]).concat(ok?1:0).slice(-20);st[q.topic]=s;store.set('stats',st);const H=store.get('hist',{}),dk=todayKey();H[dk]=H[dk]||{a:0,c:0};H[dk].a++;if(ok)H[dk].c++;const hk=Object.keys(H).sort();hk.slice(0,-60).forEach(k=>delete H[k]);store.set('hist',H);
  host.querySelectorAll('.opt').forEach((b,k)=>{b.disabled=true;const v=q.options[k];if(v===q.answer)b.classList.add('right');else if(k===j)b.classList.add('wrong');else b.classList.add('dim')});
  const f=host.querySelector('.qfoot');f.hidden=false;
  f.innerHTML=`<div class="explain"><span class="verdict ${ok?'ok':'no'}">${ok?'Correct.':'Not quite. The answer is '+esc(q.answer)+'.'}</span><p>${esc(q.explain)}</p></div><div class="row">${q.reveal||q.play?`<button class="btn small" data-hear>${ICON.again} Hear it</button>`:''}<button class="btn primary" data-next>${i+1<qs.length?'Next question':'See your score'}</button></div>`;
  const hear=f.querySelector('[data-hear]');if(hear)hear.onclick=()=>(q.reveal||q.play)();
  f.querySelector('[data-next]').onclick=advance;f.querySelector('[data-next]').focus({preventScroll:true});
  if(q.reveal)q.reveal()}
 function advance(){i++;if(i<qs.length)show();else{QUIZ=null;onDone(score,marks)}}
 show()}

/* ---------- Daily ---------- */
function streak(log){let n=0;const d=new Date();if(!log[todayKey(d)])d.setDate(d.getDate()-1);while(log[todayKey(d)]){n++;d.setDate(d.getDate()-1)}return n}
function viewDaily(){const key=todayKey(),log=store.get('dailylog',{}),done=log[key];const nice=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
 main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">${esc(greet())} · ${esc(nice)}</span><h1>Today’s ten questions</h1><p class="lede">Picked from what you’re learning (${MYINST().map(i=>INST_NAME[i].toLowerCase()).join(', ')}), from easy to advanced. A new set arrives at midnight.</p></div>
 <div class="stat"><div><b>${streak(log)}</b>day streak</div><div><b>${Object.keys(log).length}</b>days played</div><div><b>${Math.round((store.get('plog',{})[todayKey()]||0)/60)}</b>min today</div></div></div><div class="stack"><div id="dq"></div>${forYouHTML()}<section class="panel" id="lbtoday"></section><section class="panel">${chForm()}</section></div>`;bindChForm(main);bindForYou(main);fillCloud();
 const host=document.getElementById('dq');
 const finish=(score,marks)=>{const L=store.get('dailylog',{});L[key]={score,marks,at:Date.now()};store.set('dailylog',L);result(score,marks);boardWrite()};
 const result=(score,marks)=>{const dateTxt=new Date().toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});const share=`Theory Club daily · ${dateTxt}\n${score}/10  ${marks.map(m=>m?'●':'○').join('')}`;
  host.innerHTML=`<section class="qcard result"><span class="eyebrow">Today's score</span><div class="big">${score}<span style="font-size:.45em;color:var(--muted)">/10</span></div><div class="dots">${marks.map(m=>`<i class="${m?'ok':''}"></i>`).join('')}</div>
  <p class="lede">${score>=9?'Brilliant. Tell your friends to beat that.':score>=6?'Solid round. The red dots show where to practise.':'Good start. Every miss is something to learn.'} A new set arrives at midnight.</p>
  <textarea class="share" id="sharetxt" rows="2" readonly aria-label="Score to share">${esc(share)}</textarea><div class="row" style="justify-content:center"><button class="btn primary" id="copy">Copy score</button><a class="btn" href="#practice">Keep practising</a></div></section>`;
  const b=document.getElementById('copy'),ta=document.getElementById('sharetxt');b.onclick=()=>{try{navigator.clipboard.writeText(share).then(()=>b.textContent='Copied',()=>{ta.select();b.textContent='Selected, press Ctrl+C'})}catch(e){ta.select();b.textContent='Selected, press Ctrl+C'}}};
 if(done)result(done.score,done.marks);else runQuiz(host,dailySet(key,dailyPool()),{label:'Daily',onDone:finish})}

/* ---------- Practice ---------- */
function viewPractice(){const lv=LEVEL();const pool=topicPool();let sel=new Set(store.get('ptopics',pool).filter(id=>pool.includes(id)));if(!sel.size)sel=new Set(pool);const st=store.get('stats',{});
 const render=()=>{main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Practice · ${['Beginner','Intermediate','Advanced'][lv]}</span><h1>Pick what to drill</h1><p class="lede">Rounds are ten questions from the topics you select. Everyone in the club can practise at their own level. Topics you get wrong come up more often.</p></div><div class="pickrow"><span class="eyebrow">Level</span>${pillsHTML('lv',[['0','Beginner'],['1','Intermediate'],['2','Advanced']],String(lv))}</div></div>
  <div class="stack"><div class="row"><button class="btn small" id="all">Select all</button><button class="btn small" id="none">Clear</button></div>
  <div class="topics">${[...TOPICS.filter(t=>pool.includes(t.id)&&t.inst&&t.inst.includes(INST())),...TOPICS.filter(t=>pool.includes(t.id)&&!(t.inst&&t.inst.includes(INST())))].map(t=>{const s=st[t.id];return`<button class="tchip" aria-pressed="${sel.has(t.id)}" data-t="${t.id}"><b>${t.label}${t.inst&&t.inst.includes(INST())?` <span class="badge">${INST_NAME[INST()]}</span>`:''}</b><span>${t.sub}${s?` · ${Math.round(s.c/s.a*100)}% of ${s.a}`:''}</span></button>`}).join('')}</div>
  <div class="row"><button class="btn primary" id="go" ${sel.size?'':'disabled'}>${ICON.play} Start 10 questions</button><button class="btn" id="weakgo">Practise weak spots</button><button class="btn" id="chal" ${sel.size?'':'disabled'}>Challenge a friend</button><span class="hint">${sel.size} topic${sel.size===1?'':'s'} selected</span></div><section class="panel">${chForm()}</section></div>`;
  main.querySelectorAll('.tchip').forEach(b=>b.onclick=()=>{const t=b.dataset.t;sel.has(t)?sel.delete(t):sel.add(t);store.set('ptopics',[...sel]);render()});
  main.querySelector('#all').onclick=()=>{sel=new Set(pool);store.set('ptopics',[...sel]);render()};
  main.querySelector('#none').onclick=()=>{sel=new Set();store.set('ptopics',[]);render()};
  main.querySelector('#go').onclick=start;main.querySelector('#weakgo').onclick=()=>{const w=weakest();if(w.length)sel=new Set(w);if(!sel.size)sel=new Set(pool);start()};main.querySelector('#chal').onclick=()=>{location.hash='#'+makeChallenge(lv,[...sel])};bindChForm(main);bindPills(main,(g,v)=>{store.set('level',+v);viewPractice()})};
 const start=()=>{audio();const r=mulberry((Math.random()*2**32)>>>0);const ids=[...sel];const qs=Array.from({length:10},()=>makeQ(weightedPick(r,ids),r,lv));
  main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Practice · ${['Beginner','Intermediate','Advanced'][lv]}</span><h1>Practice round</h1></div><button class="btn small" id="quit">End round</button></div><div id="pq"></div>`;
  main.querySelector('#quit').onclick=()=>{QUIZ=null;render()};
  runQuiz(document.getElementById('pq'),shuffle(r,qs),{label:'Practice',onDone:(score,marks)=>{const h=document.getElementById('pq');h.innerHTML=`<section class="qcard result"><span class="eyebrow">Round complete</span><div class="big">${score}<span style="font-size:.45em;color:var(--muted)">/10</span></div><div class="dots">${marks.map(m=>`<i class="${m?'ok':''}"></i>`).join('')}</div><div class="row" style="justify-content:center"><button class="btn primary" id="again">Another round</button><button class="btn" id="back">Change topics</button><button class="btn" id="pch">Challenge a friend</button></div></section>`;h.querySelector('#pch').onclick=()=>{location.hash='#'+makeChallenge(lv,ids)};h.querySelector('#again').onclick=start;h.querySelector('#back').onclick=render}})};
 render();if(store.get('autostart',false)){store.set('autostart',false);start()}}

/* ---------- Learn ---------- */
const ROOT_PICK=['C','C#','Db','D','Eb','E','F','F#','Gb','G','Ab','A','Bb','B'];
function pillsHTML(name,items,val,force){const plain=l=>String(l).replace(/<[^>]*>/g,'');if(force==='select'||(force!=='pills'&&items.length>8&&items.reduce((a,[,l])=>a+plain(l).length,0)>80))return`<select class="psel" data-sel="${name}">${items.map(([v,l])=>`<option value="${esc(v)}" ${v===val?'selected':''}>${plain(l)}</option>`).join('')}</select>`;return`<div class="pills" data-group="${name}">${items.map(([v,l])=>`<button class="pill" data-v="${esc(v)}" aria-pressed="${v===val}">${l}</button>`).join('')}</div>`}
function bindPills(el,fn){el.querySelectorAll('.pills[data-group]').forEach(g=>g.querySelectorAll('.pill').forEach(b=>b.onclick=()=>fn(g.dataset.group,b.dataset.v)));el.querySelectorAll('select[data-sel]').forEach(x=>x.onchange=()=>fn(x.dataset.sel,x.value))}
const rootItems=list=>list.map(x=>[x,pr(x)]);
const chips=(notes,rootIdx=0,degs)=>`<div class="notes-line">${notes.map((n,i)=>`<span class="nchip ${i===rootIdx?'r':''}">${pr(n)}${degs?`<small>${degs[i]}</small>`:''}</span>`).join('')}</div>`;
const pbtn=(id,txt)=>`<button class="btn small" id="${id}">${ICON.play} ${txt}</button>`;
const PAGES={};

PAGES.notes=el=>{const inst=INST();let m=inst==='bass'?33:inst==='piano'?60:48,flats=false;const render=()=>{const wm=inst==='piano'?m:m+12;const nm=(flats?FLATN:SHARPN)[m%12],oct=Math.floor(wm/12)-1;const clef=inst==='bass'?'bass':inst==='piano'?(m>=60?'treble':'bass'):'treble';
 el.innerHTML=`<span class="eyebrow">Theory</span><h1>Notes & the staff</h1><p>Music uses seven letters, A to G, then repeats. The black keys are sharps (♯, a half step up) or flats (♭, a half step down), so the same key can have two names, like C♯ and D♭. Tap any ${inst==='piano'?'key':'fret'} to see where it sits on the staff.${inst==='piano'?'':` ${INST_NAME[inst]==='Bass'?'Bass':'Guitar'} music is written an octave higher than it sounds, so it fits on the staff with fewer ledger lines.`}</p>
 <div class="panel"><div class="split"><div class="stack" style="gap:6px"><span class="eyebrow">You played</span><h2 style="font-size:2.4rem">${pr(nm)}<span style="color:var(--muted);font-size:.5em">${oct}</span></h2><p class="hint">${inst==='piano'?(m===60?'Middle C, the note between the two staves.':clef==='treble'?'Treble clef: right hand, higher notes.':'Bass clef: left hand, lower notes.'):inst==='bass'?'Bass reads bass clef.':'Guitar reads treble clef.'}</p>${pillsHTML('acc',[['s','Show sharps'],['f','Show flats']],flats?'f':'s')}</div><div>${staff({clef,notes:[{name:nm,oct}]})}</div></div>
 ${noteInput(m)}</div>
 <div class="cols"><div class="mini"><h4>Treble clef</h4><p class="o">Lines, bottom to top: <b>E G B D F</b> (Every Good Boy Does Fine). Spaces spell <b>F A C E</b>.</p></div><div class="mini"><h4>Bass clef</h4><p class="o">Lines: <b>G B D F A</b> (Good Boys Do Fine Always). Spaces: <b>A C E G</b> (All Cows Eat Grass).</p></div><div class="mini"><h4>Ledger lines</h4><p class="o">Short extra lines for notes above or below the staff. Middle C sits on one ledger line between the clefs.</p></div></div>`;
 bindPills(el,(g,v)=>{flats=v==='f';render()});el.querySelector('.ninput').addEventListener('keypick',e=>{m=e.detail;render()})};render()};



PAGES.scales=el=>{let root='A',t='natural';const render=()=>{setSongs('scales',t);const n=scaleNotes(root,t),ms=scaleMidis(root,t);const semis=SC[t].steps.map(s=>s[0]);const map={};n.forEach((x,i)=>map[(parse(root).pc+semis[i])%12]={name:x,root:i===0});
 const rel=t==='major'?`Its relative minor is <b>${pr(spellUp(root,9,6))} minor</b>, which shares all the same notes.`:`Its relative major is <b>${pr(spellUp(root,3,3))} major</b>.${t!=='natural'?' (Shared with natural minor; harmonic and melodic minor raise some notes.)':''}`;
 el.innerHTML=`<span class="eyebrow">Theory</span><h1>Major & minor scales</h1><p>A scale is a set of notes in order. Major and minor scales use every letter once. What makes them different is the pattern of whole steps (W) and half steps (H).</p>
 <div class="panel"><div class="pickrow"><span class="eyebrow">Key note</span>${pillsHTML('root',keyItems('M'),root)}</div><div class="pickrow"><span class="eyebrow">Scale</span>${pillsHTML('t',[['major','Major'],['natural','Natural minor'],['harmonic','Harmonic minor'],['melodic','Melodic minor']],t)}</div>
 <h3>${pr(root)} ${SC[t].name}</h3>${chips(n,0,formulaOf(SC[t].steps).split(' '))}<p class="formula">Steps: ${stepPattern(semis)}</p><p>${rel}</p>
 <div class="row">${pbtn('up','Play up')}${pbtn('ud','Up and down')}</div>${instView(ms,[...n,root],ms[0])}</div>
 <h3>The three minor scales</h3><div class="cols"><div class="mini"><h4>Natural minor</h4><p class="o">The relative major started from its 6th note. Steps W H W W H W W. Sad and plain.</p></div><div class="mini"><h4>Harmonic minor</h4><p class="o">Raise the 7th. Now the V chord is major and pulls hard to the key note, but there's an exotic 1½-step gap.</p></div><div class="mini"><h4>Melodic minor</h4><p class="o">Raise the 6th and 7th going up for a smooth melody. Classical players come down in natural minor; jazz players keep it the same both ways.</p></div></div>
 <p class="callout">Finding a relative minor: from any major key, go down three half steps. C major → A minor, G major → E minor, F major → D minor.</p>`;
 bindPills(el,(g,v)=>{if(g==='root')root=v;else t=v;render()});el.querySelector('#up').onclick=()=>play(ms,{mode:'seq',gap:.3});el.querySelector('#ud').onclick=()=>{let down=t==='melodic'?scaleMidis(root,'natural').slice(0,-1).reverse():ms.slice(0,-1).reverse();play([...ms,...down],{mode:'seq',gap:.26})}};render()};

PAGES.modes=el=>{let root='D',id='dorian';const render=()=>{setSongs('modes',id);const m=MODES.find(x=>x.id===id);const n=scaleNotes(root,id),ms=scaleMidis(root,id);const P=parentOf(root,m.k);
 el.innerHTML=`<span class="eyebrow">Theory</span><h1>Modes</h1><p>Play the notes of a major scale but start on a different note, and you get a mode. Each one has its own flavour because the half steps land in different places. Hear each against a held bass note to feel its colour.</p>
 <div class="panel"><div class="pickrow"><span class="eyebrow">Start note</span>${pillsHTML('root',keyItems('M'),root)}</div><div class="pickrow"><span class="eyebrow">Mode</span>${pillsHTML('m',MODES.map(x=>[x.id,`${x.k+1} · ${x.name}`]),id)}</div>
 <h3>${pr(root)} ${m.name}</h3><p><b>${m.feel}.</b> It's ${m.char}. Same notes as <b>${pr(P)} major</b>, starting on its ${ord(m.k+1)} note.</p>${chips(n,0,formulaOf(SC[id].steps).split(' '))}
 <div class="row">${pbtn('drone','Play over a drone')}${pbtn('up','Scale only')}</div>${instView(ms,[...n,root],ms[0])}</div>
 <h3>From brightest to darkest</h3><div class="chordrow">${BRIGHT.map(x=>{const mm=MODES.find(y=>y.id===x);return`<button class="cbtn ${x===id?'on':''}" data-m="${x}"><b>${mm.name}</b><small>${formulaOf(SC[x].steps).split(' ').filter(s=>/[♭♯]/.test(s)).join(' ')||'no changes'}</small></button>`}).join('')}</div>
 <p class="hint">Each step darker flattens one more note. Lydian has a ♯4; Locrian flattens almost everything.</p>`;
 bindPills(el,(g,v)=>{if(g==='root')root=v;else id=v;render()});el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{id=b.dataset.m;render()});
 el.querySelector('#up').onclick=()=>play(ms,{mode:'seq',gap:.3});el.querySelector('#drone').onclick=()=>{play([ms[0]-24,ms[0]-12],{mode:'chord',dur:ms.length*.34+1.6});play([...ms,...ms.slice(0,-1).reverse()],{mode:'seq',gap:.34,at:.4})}};render()};

PAGES.world=el=>{let root='C',id='hirajoshi';const render=()=>{setSongs('world',id);const w=WORLD.find(x=>x.id===id);const n=scaleNotes(root,id),ms=scaleMidis(root,id);
 el.innerHTML=`<span class="eyebrow">Theory</span><h1>Scales from around the world</h1><p>Western major and minor are just two options. Musicians everywhere have chosen different notes, and many traditions also use pitches that fall between the piano keys. These versions fit a 12-note keyboard so you can play them.</p>
 <div class="panel"><div class="pickrow"><span class="eyebrow">Start note</span>${pillsHTML('root',keyItems('M'),root)}</div>
 <h3>${w.name}</h3><p class="formula">${esc(w.origin)} · ${formulaOf(SC[id].steps)}</p><p>${esc(w.desc)}</p>${chips(n,0)}<div class="row">${pbtn('up','Play up and down')}</div>${instView(ms,[...n,root],ms[0])}</div>
 <div class="cols">${WORLD.map(x=>`<button class="mini ${x.id===id?'sel':''}" data-w="${x.id}"><h4>${x.name}</h4><span class="o">${esc(x.origin)}</span><span class="formula">${formulaOf(SC[x.id].steps)}</span></button>`).join('')}</div>`;
 bindPills(el,(g,v)=>{root=v;render()});el.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{id=b.dataset.w;render();const m2=scaleMidis(root,id);play([...m2,...m2.slice(0,-1).reverse()],{mode:'seq',gap:.24})});
 el.querySelector('#up').onclick=()=>play([...ms,...ms.slice(0,-1).reverse()],{mode:'seq',gap:.26})};render()};

PAGES.chords=el=>{let root='C',t='maj',inv=0;const render=()=>{const n=chordNotes(root,t),len=n.length;if(inv>=len)inv=0;const ms=chordMidis(root,t,48,inv);const rn=n.slice(inv).concat(n.slice(0,inv));const sh=guitarShape(root,t);const names={};CH[t].st.forEach(([s],i)=>names[(parse(root).pc+s)%12]=n[i]);
 const grp=(lab,ks)=>`<div class="pickrow"><span class="eyebrow">${lab}</span>${pillsHTML('t',ks.map(k=>[k,CH[k].name]),t)}</div>`;
 el.innerHTML=`<span class="eyebrow">Theory</span><h1>Chords</h1><p>A chord is three or more notes played together. Most are built by stacking 3rds: take a note, skip one, take the next. The quality of each 3rd decides how the chord sounds.</p>
 <div class="panel"><div class="pickrow"><span class="eyebrow">Root</span>${pillsHTML('root',keyItems('M'),root)}</div>${grp('Triads',['maj','min','dim','aug','sus2','sus4'])}${grp('Sevenths',['maj7','7','m7','m7b5','dim7','mMaj7'])}
 <div class="split"><div class="stack" style="gap:10px"><h3>${chordSym(root,t)} <span class="formula">${CH[t].name}</span></h3><p>${formulaOf(CH[t].st)}. Sounds ${CH[t].sound}.</p>${chips(n,0,formulaOf(CH[t].st).split(' '))}
 <div class="pickrow"><span class="eyebrow">Inversion (which note is lowest)</span>${pillsHTML('inv',Array.from({length:len},(_,i)=>[String(i),['Root position','1st inversion','2nd inversion','3rd inversion'][i]]),String(inv))}</div>
 <div class="row">${pbtn('blk','Play chord')}${pbtn('arp','Arpeggio')}</div></div>${sh?`<div class="stack" style="gap:4px;align-items:center">${chordBox(sh,parse(root).pc,names)}<span class="hint">${sh.kind}</span></div>`:''}</div>${instView(ms,rn,48+parse(root).pc)}</div>`;
 bindPills(el,(g,v)=>{if(g==='root')root=v;else if(g==='t'){t=v;inv=0}else inv=+v;render();play(chordMidis(root,t,48,inv))});
 el.querySelector('#blk').onclick=()=>play(ms);el.querySelector('#arp').onclick=()=>play(ms,{mode:'seq',gap:.25});const cb=el.querySelector('.cbox');if(cb)cb.onclick=()=>play(shapeMidis(sh.frets),{mode:'strum'})};render()};

PAGES.dominant=el=>{let key='C';const render=()=>{const V=spellUp(key,7,5);const[R,third,fifth,sev]=chordNotes(V,'7');const vm=chordMidis(V,'7',48);const fam=['7','9','13','7b9','7#9','7#5','7sus4'];
 const secs=[2,3,4,5,6].map(d=>{const tr=spellUp(key,MAJ_SEMI[d-1],d);const D=spellUp(tr,7,5);const rom=['I','ii','iii','IV','V','vi'][d-1];return{d,tr,D,rom,t:DIA.major.tri[d-1]}});
 el.innerHTML=`<span class="eyebrow">Theory</span><h1>Dominant chords</h1><p>The dominant is the chord built on the 5th note of a key. Add a ♭7 and you get a <b>dominant 7th</b>, the chord that most wants to move home. Inside it, the 3rd and ♭7 sit a tritone apart, and that clash pulls: the 3rd rises a half step to the key note, the ♭7 falls a half step.</p>
 <div class="panel"><div class="pickrow"><span class="eyebrow">Key</span>${pillsHTML('k',keyItems('M'),key)}</div>
 <h3>In ${pr(key)} major, V7 is ${pr(V)}7</h3>${chips([R,third,fifth,sev],0,['1','3','5','♭7'])}<p>The tritone is <b>${pr(third)}</b> and <b>${pr(sev)}</b>. Hear how it resolves to ${pr(key)}.</p>
 <div class="row">${pbtn('res','Play V7 → I')}${pbtn('tri','Play the tritone')}</div>${instView(vm,[R,third,fifth,sev],vm[0])}</div>
 <h3>The dominant family</h3><p>Jazz and funk stack extra notes on top of the dominant 7th. They all keep the 3rd and ♭7, so they all still want to resolve.</p>
 <div class="scroll"><table class="tbl"><thead><tr><th>Chord</th><th>Formula</th><th>In ${pr(key)}</th><th>Sound</th></tr></thead><tbody>${fam.map(t=>`<tr data-k="${t}"><td><b>${chordSym(V,t)}</b></td><td class="formula">${formulaOf(CH[t].st)}</td><td>${chordNotes(V,t).map(pr).join(' ')}</td><td>${CH[t].sound}</td></tr>`).join('')}</tbody></table></div>
 <h3>Secondary dominants</h3><p>Any chord in a key can borrow its own V7 to make you expect it. V7/ii means “the V7 of the ii chord”.</p>
 <div class="chordrow">${secs.map(s=>`<button class="cbtn" data-s="${s.d}"><small>V7/${s.rom}</small><b>${pr(s.D)}7 → ${chordSym(s.tr,s.t)}</b></button>`).join('')}</div>`;
 bindPills(el,(g,v)=>{key=v;render()});
 el.querySelector('#res').onclick=()=>playSeq([voice(V,'7'),voice(key,'maj')],1.1);el.querySelector('#tri').onclick=()=>{const a=60+parse(third).pc;let b=60+parse(sev).pc;if(b<a)b+=12;play([a,b])};
 el.querySelectorAll('tr[data-k]').forEach(tr=>tr.onclick=()=>playSeq([voice(V,tr.dataset.k),voice(key,'maj')],1.1));
 el.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const s=secs.find(x=>x.d===+b.dataset.s);playSeq([voice(s.D,'7'),voice(s.tr,s.t)],1)})};render()};

PAGES.progressions=el=>{let key='C',mode='major',sev=false;const render=()=>{setSongs('progressions',mode);key=normKey(key,mode==='major'?'M':'m');
 const dia=[1,2,3,4,5,6,7].map(d=>chordAt(key,mode,d,sev?DIA[mode].sev[d-1]:null));const progs=PROG.filter(p=>p.mode===mode);
 el.innerHTML=`<span class="eyebrow">Theory</span><h1>Progressions</h1><p>Build a triad on every note of a scale and you get the chords that belong to that key. Roman numerals name them by position, so a progression works in any key: uppercase is major, lowercase is minor, ° is diminished.</p>
 <div class="panel"><div class="row" style="gap:16px">${pillsHTML('mode',[['major','Major key'],['minor','Minor key']],mode)}${pillsHTML('sev',[['0','Triads'],['1','7th chords']],sev?'1':'0')}</div><div class="pickrow"><span class="eyebrow">Key</span>${pillsHTML('k',keyItems(mode==='major'?'M':'m'),key)}</div>
 <div class="chordrow" id="dia">${dia.map((c,i)=>`<button class="cbtn" data-i="${i}"><small>${c.roman}</small><b>${c.sym}</b></button>`).join('')}</div></div>
 <div class="stack">${progs.map(p=>{const cs=p.ch.map(([d,t])=>chordAt(key,mode,d,t));return`<div class="panel prog" data-p="${p.id}"><div class="row" style="justify-content:space-between"><div><h3>${p.name}</h3><p class="hint">${esc(p.note)}</p></div><button class="btn small" data-play="${p.id}">${ICON.play} Play</button></div><div class="chordrow">${cs.map(c=>`<span class="cbtn"><small>${c.roman}</small><b>${c.sym}</b></span>`).join('')}</div></div>`}).join('')}</div>`;
 bindPills(el,(g,v)=>{if(g==='mode')mode=v;else if(g==='sev')sev=v==='1';else key=v;render()});
 el.querySelectorAll('#dia .cbtn').forEach(b=>b.onclick=()=>{const c=dia[+b.dataset.i];play(voice(c.root,c.t))});
 el.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>{const p=PROG.find(x=>x.id===b.dataset.play);const cs=p.ch.map(([d,t])=>chordAt(key,mode,d,t));const cells=el.querySelectorAll(`[data-p="${p.id}"] .chordrow .cbtn`);
  playSeq(cs.map(c=>voice(c.root,c.t)),p.id==='blues'?.75:.95,i=>cells.forEach((c,j)=>c.classList.toggle('on',j===i)))})};render()};

PAGES.circle=el=>{let i=0;const render=()=>{const k=MAJ[i],sg=sigOf(k),mn=MIN[i];const n=scaleNotes(k,'major');const dia=[1,2,3,4,5,6,7].map(d=>chordAt(k,'major',d));
 const cx=180,cy=180,ang=j=>(-90+j*30)*Math.PI/180;const P=(r,a)=>[cx+r*Math.cos(a),cy+r*Math.sin(a)];
 const arc=(r1,r2,j)=>{const a0=ang(j-.5),a1=ang(j+.5);const[p1,p2,p3,p4]=[P(r2,a0),P(r2,a1),P(r1,a1),P(r1,a0)];return`M${p1}A${r2},${r2} 0 0 1 ${p2}L${p3}A${r1},${r1} 0 0 0 ${p4}Z`};
 let svg=`<svg viewBox="0 0 360 360" role="group" aria-label="Circle of fifths">`;
 MAJ.forEach((K,j)=>{const[x,y]=P(144,ang(j));svg+=`<g class="seg ${j===i?'sel':''}" data-i="${j}" tabindex="0" role="button" aria-label="${pr(K)} major"><path d="${arc(116,172,j)}"/><text x="${x}" y="${y+6}" text-anchor="middle" font-size="17">${j===6?'F♯/G♭':pr(K)}</text></g>`});
 MIN.forEach((K,j)=>{const[x,y]=P(95,ang(j));svg+=`<g class="seg min ${j===i?'sel':''}" data-i="${j}" tabindex="0" role="button" aria-label="${pr(K)} minor"><path d="${arc(74,116,j)}"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="12.5">${pr(K)}m</text></g>`});
 svg+=`<circle class="ctr" cx="180" cy="180" r="72"/><text class="ctxt" x="180" y="180" text-anchor="middle" font-size="30">${sg.count||'0'}</text><text class="csub" x="180" y="200" text-anchor="middle">${sg.count?sg.type+(sg.count>1?'s':''):'sharps or flats'}</text></svg>`;
 el.innerHTML=`<span class="eyebrow">Theory</span><h1>Circle of fifths</h1><p>The circle lines up all twelve keys. Each step clockwise goes up a perfect 5th and adds one sharp; each step anti-clockwise adds a flat. Neighbours share almost all their notes, so they sound good together. Inner ring: the relative minors.</p>
 <div class="circlewrap"><div class="circle">${svg}</div><div class="panel"><h3>${j6(i,k)} major · ${pr(mn)} minor</h3>${staff({clef:'treble',sig:sg})}<p>${sg.count?`Key signature: <b>${sg.list.join(' ')}</b>`:'No sharps or flats.'}</p>${chips(n,0)}
 <div class="chordrow">${dia.map(c=>`<button class="cbtn" data-c="${c.root}|${c.t}"><small>${c.roman}</small><b>${c.sym}</b></button>`).join('')}</div>
 <p class="hint">Neighbours: ${pr(MAJ[(i+11)%12])} (IV) on the left, ${pr(MAJ[(i+1)%12])} (V) on the right.</p><div class="row">${pbtn('cad','Play I–IV–V–I')}</div></div></div>
 <div class="cols"><div class="mini"><h4>Order of sharps</h4><p class="o">F C G D A E B. “Father Charles Goes Down And Ends Battle.”</p></div><div class="mini"><h4>Order of flats</h4><p class="o">B E A D G C F, the sharps backwards. “Battle Ends And Down Goes Charles’ Father.”</p></div><div class="mini"><h4>Why fifths?</h4><p class="o">A V chord resolving to I is the strongest move in Western music. Going anti-clockwise round the circle is a chain of those resolutions.</p></div></div>`;
 el.querySelectorAll('.seg').forEach(g=>{const go=()=>{i=+g.dataset.i;render();play(voice(MAJ[i],'maj'))};g.onclick=go;g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});
 el.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const[R,t]=b.dataset.c.split('|');play(voice(R,t))});
 el.querySelector('#cad').onclick=()=>playSeq([1,4,5,1].map(d=>{const c=chordAt(k,'major',d,d===5?'7':null);return voice(c.root,c.t)}),.9)};render()};
function j6(i,k){return i===6?'F♯/G♭':pr(k)}

PAGES.shapes=el=>{let root='C',t='maj';const firsts=['C|maj','A|maj','G|maj','E|maj','D|maj','A|min','E|min','D|min','E|7','A|7','D|7','G|7'];const render=()=>{const sh=guitarShape(root,t);const n=chordNotes(root,t),names={};CH[t].st.forEach(([s],i)=>names[(parse(root).pc+s)%12]=n[i]);const ms=chordMidis(root,t);
 const types=['maj','min','7','m7','maj7','sus2','sus4','dim','aug','dim7','m7b5','9'];
 el.innerHTML=`<span class="eyebrow">Instruments</span><h1>Guitar & piano shapes</h1><p>The same chord looks different on each instrument. On piano, the notes sit together in one hand. On guitar, a few open shapes cover the first chords you'll learn, and two movable barre shapes (based on E and A) let you play any major or minor chord by sliding up the neck.</p>
 <div class="panel"><div class="pickrow"><span class="eyebrow">Root</span>${pillsHTML('root',keyItems('M'),root)}</div><div class="pickrow"><span class="eyebrow">Type</span>${pillsHTML('t',types.map(k=>[k,CH[k].sym?pr('X'+CH[k].sym).slice(1):'maj']),t)}</div>
 <div class="split"><div class="stack" style="gap:10px;min-width:0"><h3>${chordSym(root,t)}</h3>${chips(n,0,formulaOf(CH[t].st).split(' '))}<p class="hint">Piano: ${n.map(pr).join(' ')} from the root up. Orange keys and dots are the root.</p><div class="row">${pbtn('pp','Piano')}${sh?pbtn('gg','Strum guitar'):''}</div></div>
 <div class="stack" style="gap:4px;align-items:center">${sh?chordBox(sh,parse(root).pc,names)+`<span class="hint">${sh.kind}</span>`:'<p class="hint">No common guitar shape. Try the piano.</p>'}</div></div>${kbFor(ms,n)}</div>
 <h3>First guitar chords to learn</h3><div class="boxes">${firsts.map(k=>{const[R,T]=k.split('|');const s=guitarShape(R,T);return`<button data-k="${k}" class="${R===root&&T===t?'sel':''}">${chordBox(s,parse(R).pc,null,true)}${chordSym(R,T)}</button>`}).join('')}</div>`;
 bindPills(el,(g,v)=>{if(g==='root')root=v;else t=v;render()});
 el.querySelector('#pp').onclick=()=>play(ms);const gg=el.querySelector('#gg');if(gg)gg.onclick=()=>play(shapeMidis(sh.frets),{mode:'strum'});
 const big=el.querySelector('.split .cbox');if(big)big.onclick=()=>play(shapeMidis(sh.frets),{mode:'strum'});
 el.querySelectorAll('.boxes button').forEach(b=>b.onclick=()=>{[root,t]=b.dataset.k.split('|');render();play(shapeMidis(guitarShape(root,t).frets),{mode:'strum'})})};render()};

/* ---------- settings ---------- */
const GEAR='<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M11.3 1.5l.4 2.2c.6.2 1.1.5 1.6.9l2.1-.8 1.3 2.3-1.7 1.4c.1.6.1 1.2 0 1.8l1.7 1.4-1.3 2.3-2.1-.8c-.5.4-1 .7-1.6.9l-.4 2.2H8.7l-.4-2.2c-.6-.2-1.1-.5-1.6-.9l-2.1.8-1.3-2.3L5 9.3c-.1-.6-.1-1.2 0-1.8L3.3 6.1l1.3-2.3 2.1.8c.5-.4 1-.7 1.6-.9l.4-2.2zM10 6a2.4 2.4 0 1 0 0 4.8A2.4 2.4 0 0 0 10 6z" transform="translate(0 1.6)"/></svg>';
const INST_NOTE={guitar:'Notes, scales and chords show on a guitar neck and chord diagrams.',bass:'Notes and scales show on a 4-string bass neck, with bass sound.',piano:'Notes, scales and chords show on a piano keyboard.',drums:'Drum grooves, drum charts and rhythm. Guitar and theory lessons stay hidden while you practise drums.',ableton:'Ableton Live lessons, MIDI and recording. Notes and chords show on a piano keyboard, ready for your MIDI keyboard.',logic:'Logic Pro lessons, MIDI and recording. Notes and chords show on a piano keyboard, ready for your MIDI keyboard.',midi:'MIDI lessons with a live MIDI monitor. Notes and chords show on a piano keyboard.'};
function syncHeader(){document.getElementById('instlbl').textContent=INST_NAME[INST_RAW()]}

document.getElementById('setclose').onclick=closeSettings;
document.getElementById('setpanel').addEventListener('click',e=>{if(e.target.id==='setpanel')closeSettings()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('setpanel').hidden)closeSettings()});
syncHeader();

/* ---------- videos ---------- */
const CREATORS={
 jg:{name:'JustinGuitar',url:'https://www.youtube.com/channel/UCBNkm8o5LiEVLxO8w0p2sfQ',what:'Huge free guitar course, beginner to theory'},
 sbl:{name:'Scott’s Bass Lessons',url:'https://www.youtube.com/channel/UCWTj3vCqkQIsrTGSm4kM34g',what:'The best-known bass teaching channel'},
 pn:{name:'Pianote',url:'https://www.youtube.com/channel/UC_DmCvOP5Q_eBMRDvqqRXjg',what:'Friendly piano lessons for every level'},
 dr:{name:'Drumeo',url:'https://www.youtube.com/@drumeoofficial',what:'The largest drum lesson channel'},
 rb:{name:'Rick Beato',url:'https://www.youtube.com/@RickBeato',what:'Theory and ear training from a producer and teacher'},
 abl:{name:'Ableton',url:'https://www.youtube.com/@Ableton',what:'Official tutorials from the makers of Live'},
 mth:{name:'MusicTechHelpGuy',url:'https://www.youtube.com/@MusicTechHelpGuy',what:'Long-running Logic Pro tutorial channel'},
 itm:{name:'In The Mix',url:'https://www.youtube.com/channel/UCIcCXe3iWo6lq-iWKV40Oug',what:'Clear production tutorials for every DAW'},
 plap:{name:'Produce Like A Pro',url:'https://www.youtube.com/channel/UCpyUGZeMUtOvt57UACw3H2g',what:'Recording and mixing with producer Warren Huart'},
 rr:{name:'Recording Revolution',url:'https://www.youtube.com/@RecordingRevolution',what:'Home recording on a budget'}};
const VQ={notes:'how to read music',intervals:'intervals',scales:'major and minor scales',modes:'modes',world:'exotic scales',chords:'chord types',dominant:'dominant 7th chords',progressions:'chord progressions',circle:'circle of fifths'};
function videos(topic){const inst=INST();const main={guitar:'jg',bass:'sbl',piano:'pn',drums:'dr'}[inst];let list;
 if(PL[topic]){const q=PL[topic].vq;list=topic.startsWith('abl-')?[['abl',q],['itm','Ableton '+q]]:topic.startsWith('lgc-')?[['mth',q],['itm',q]]:topic.startsWith('midi-')?[['itm',q],['abl',q]]:topic.startsWith('th-')?[['rb',q],[main,q]]:topic.startsWith('g-')?[['jg',q],['rb',q]]:topic.startsWith('b-')?[['sbl',q]]:topic.startsWith('p-')?[['pn',q]]:topic.startsWith('d-')?[['dr',q]]:topic.startsWith('gv-')?[[main,q],['dr',q]]:topic.startsWith('sv-')?[['ea',q]]:[['rr',q],['plap',q]]}else
 if(topic==='solo')list=INST()==='bass'?[['sbl','bass solo and fills'],['sbl','pentatonic bass'],['sbl','bass improvisation']]:INST()==='piano'?[['pn','piano improvisation'],['pn','blues piano soloing'],['pn','pentatonic piano']]:[['jg','how to solo'],['jg','minor pentatonic soloing'],['rb','improvisation']];else if(topic==='charts')list=[['dr','how to read drum notation'],['dr','drum sheet music']];else if(topic==='fills')list=[['dr','drum fills for beginners'],['dr','how to land drum fills'],['dr','tom fills']];else
 if(topic==='drums')list=[['dr','beginner drum beats'],['dr','drum rudiments'],['dr','drum fills']];
 else if(topic==='rhythm')list=[['dr','how to count rhythms'],['dr','time signatures'],[main,'rhythm']];
 else if(topic==='bass')list=[['sbl','bass lines for beginners'],['sbl','walking bass'],['sbl','root fifth octave']];
 else if(topic==='fretboard')list=inst==='bass'?[['sbl','learn the fretboard'],['sbl','minor pentatonic']]:[['jg','notes on the fretboard'],['jg','pentatonic scale'],['rb','fretboard']];
 else if(topic==='caged')list=inst==='bass'?[['sbl','CAGED system'],['sbl','arpeggios']]:[['jg','CAGED system'],['jg','CAGED chords'],['rb','CAGED']];else if(topic==='strum')list=[['jg','strumming patterns'],['jg','rhythm guitar']];else if(topic==='tab')list=inst==='bass'?[['sbl','how to read bass tab']]:[['jg','how to read tab']];else if(topic==='shapes')list=inst==='piano'?[['pn','piano chords for beginners'],['pn','inversions']]:[['jg','beginner chords'],['jg','barre chords'],['pn','piano chords for beginners']];
 else list=[[main,VQ[topic]],['rb',VQ[topic]]];
 const v=vidsFor(topic);const tile=([id,t])=>`<a class="vtile" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener" data-yt="${id}" title="${esc(t)}"><span class="vth"><img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" alt="" loading="lazy"><span class="vpl">${ICON.play}</span></span><span class="vt">${esc(t)}</span></a>`;
 return`<section class="vids"><h3>Watch${v.length>3?` <span class="hint">${v.length} videos</span>`:''}</h3>${v.length?`<div class="vgrid2">${v.slice(0,3).map(tile).join('')}</div>${v.length>3?`<details class="more vmorev"><summary>${v.length-3} more video${v.length-3>1?'s':''}</summary><div class="vgrid2">${v.slice(3).map(tile).join('')}</div></details>`:''}`:''}<p class="vmore">More on YouTube: ${list.map(([c,q])=>{const C=CREATORS[c];return`<a href="${C.url}/search?query=${encodeURIComponent(q)}" target="_blank" rel="noopener">${C.name}</a>`}).join(' · ')}</p></section>`}
const VIDS=(()=>{const o={};`g-barre|IxXG5S8vSd8|Fail-Proof Guide To Easy Barre Chords on Guitar
g-barre|C7k0CWgI-xI|A Shape Major Barre Chords on Guitar
g-barre|EMerE4R8gW8|Cleaner, Buzz-Free Barre Chords: Tips for Beginners
g-barre|a3LEZCSIGdc|The Best Barre Chord Exercise for Beginners
g-barre|87reIeqqVrs|3 Secrets to Easy Barre Chords
g-triads|qWS22cV9REg|How to (Easily) Play Triad Chords on Guitar
g-triads|IZsTOwVayDc|Guitar Triads for Beginners
g-triads|dT7s4kQ3kPc|The Simple Way to Play Triads Across the Fretboard
g-triads|HVwoJEoD480|3 Triads = Rhythm Guitar All Over the Neck
g-triads|FgqYcsX5-OE|The Best Exercise to Master Triads Across the Fretboard
g-fingerstyle|kAeEMJ3sbHY|Fingerpicking for Beginners: 3 Easy Patterns
g-fingerstyle|_zsTA6wKd7A|10 Essential Fingerstyle Patterns
g-fingerstyle|ZTPxC0-r54I|Travis Picking: The Most Useful Pattern in 6 Steps
g-fingerstyle|xD3ZMFrpsnA|Travis Picking Made Easy
g-fingerstyle|6j2kgILCMuI|Fingerstyle Guitar for Beginners
g-lead|HX2BIjMpDFQ|Bends, Hammer-Ons, Pull-Offs & Vibrato Explained
g-lead|To7vDfgzSJE|Hammer-Ons and Pull-Offs Guitar Lesson
g-lead|06M2-51JF80|Bending Vibrato (JustinGuitar)
g-lead|TrYWfqO2qmc|How to Play a Bend With Vibrato
g-lead|BOFnzRTUB-g|Make Your Solos Sing: Bending and Vibrato
g-arps|6o3lWAnWCig|How to Play Arpeggios on Guitar: Beginner's Guide
g-arps|fxpn2pf0zf8|The Best Way To Learn Arpeggios on Guitar
g-arps|1rkRIoffK7I|Major Triad Arpeggio Shapes for Soloing
g-arps|0f_Kk0_VMcQ|Minor 7 Arpeggio Shapes for Soloing
g-arps|NIElocIi0E8|How to Start Soloing With Chord Tones
fretboard|ysYtD-JfmYM|Learn the Notes on the Guitar Fretboard Fast
fretboard|H8HCir6iq_w|The Fastest Way to Learn Guitar Notes
fretboard|PGUNHRpNG0I|Memorize the Fretboard: A Fun Way to Learn the Notes
fretboard|IY19gviuJ0c|The Only Fretboard Memorization Exercise You'll Need
fretboard|CYfmYV7XN5A|The Best Exercise to Learn the Guitar Fretboard
caged|7MbwbWSeZjc|The CAGED System (JustinGuitar)
caged|JR1TgDAiCFU|How to Actually Use the CAGED System
caged|V3HZK8FPEyA|The CAGED System Explained So It Actually Makes Sense
caged|93RDnOs7QHM|CAGED: Converting Open Chords to Moveable Chords
caged|65s8eIkfwNg|The CAGED System for Guitar
strum|hzC0orOGARw|5 Essential Strumming Patterns
strum|ROSfEEvIwrk|Your First Strumming Pattern
strum|6C2WFkVESBk|3 Essential Strumming Patterns
strum|goGNw2WlfpQ|10 Rhythm and Strumming Patterns Every Beginner Needs
strum|cs-Hl56Ejz8|6 Strum Patterns That Work for Any Song
tab|pQC3JsbgaTw|Learn How To Read TAB in 5 Minutes
tab|8I4GLtM-1P8|A Simple Guide To Reading Guitar TAB & Chord Diagrams
tab|kiUxlQnG5b8|How to Read Guitar Tabs for Beginners
tab|PrZtvdAqtwQ|How to Read Guitar Tab: Easy Beginners Lesson
solo|xJH21UfcgVU|Your First Guitar Solo: Easiest Way to Start
solo|5Qc426qgSho|Learn Your First Scale (Minor Pentatonic)
solo|Rqu7-v3YHN8|Basic Minor Pentatonic Soloing
solo|ZwFK6G-brkM|How to Use Pentatonic Scales in a Solo
solo|tcr6DVR8yUc|3 Ways to Solo With Minor Pentatonic Over Major Chords
shapes|lRJ_d3PqPIQ|8 Open Chords That You Should Know
shapes|BXlgeNZYY6c|Easy Guitar Chords For Beginners: All Open Chords
shapes|jGw52JobiiQ|Open Chords, Major, Minor & Right-Hand Technique
shapes|yUaVijopDQo|7 Basic Guitar Chords for Beginners
b-walking|Ilh4uMAdss8|Walking Bass Lesson: Beginner #1 (Scott Devine)
b-walking|ws6Ql411sG4|The Simplest Walking Bass Line Formula
b-walking|LWF-BT0TQjA|The Three Walking Bass Line Rules
b-walking|5KZ2XBvs1DU|Walking Bass: How to Create a Walking Line
b-walking|TqnxTGsrX4c|Easy Walking Bass Line with Tab
b-muting|rkI3uCfOPfA|Left Hand Muting Techniques for Bass
b-muting|KVkairp2POM|How To Play Dead Notes On Bass
b-muting|qZ5EnPzQWo0|How to Control Dead Notes on Bass
b-muting|axqb91tU5dY|3 Cool Muting Techniques for Bass Guitar
b-muting|kSq87P38FmU|Better Bass Lines with Dead Notes & Approach Notes
b-arps|27FUwPQB-T8|The 5 Most Important Arpeggios on Bass
b-arps|yz6JGFlzb2c|Triad Arpeggios For Bass Guitar
b-arps|g42yfItbZfo|6 Arpeggios Every Bassist Must Learn
b-arps|BVE3O3Kvo38|Seventh Chord Arpeggios for Bass: The Ultimate Guide
b-groove|ewMBhY_6qls|How Bass Players Interact with Drummers (Scott's Bass Lessons)
b-groove|sGOF-7JyggA|Locking In With The Kick Drum
b-groove|kOsVEOlLzu4|How to Lock In With a Drummer
b-groove|Rvp7vp5Y1Bo|How to Groove With a Drummer
b-groove|AUs0StvfJC4|How to Practise Groove
bass|HZmImX9p6Cc|Creating Bass Lines: Root, Five, Octave
bass|Z6TCexKJpAQ|Bass Lines in Any Style with Just 2 Notes
bass|c1pC20SXnqY|Beginner's Guide To Bass Guitar: The Absolute Basics
bass|nPgzsWvh4yI|10 Easy Bass Lines, 1 Chord Progression
bass|3pDpztz28z4|Easy Pop Bass Lines: Where to Start
bass|UktzOMM-9xw|New to Bass? Here's What to Learn First
fretboard:bass|IJYxp5T4tLI|Beginner's Guide To The Bass Fretboard
fretboard:bass|2L5a6C85Mds|3 Tips to Find Notes Faster on Bass
fretboard:bass|AuS5wwr7MjI|How to Memorise All the Notes on the Bass
fretboard:bass|m7v0iySKFOU|Easiest Method to Memorise the Whole Fretboard
fretboard:bass|w6FGjkiA0Xg|Bass Fretboard Memorisation Using Triads
p-fingering|8rb2JHTQAHM|How to Play All 12 Major Scales with Correct Fingerings
p-fingering|P5ESd3ds938|Easy Way To Master Major Scale Fingerings
p-fingering|sPlFBNRfkRg|All 12 Major Scales With Fingering for Both Hands
p-fingering|2biQFQ6n5zs|Scale Fingerings for C, G, D, A and E Major
p-lefthand|NvYzc7rsqBw|Easy Left Hand Patterns For Pop And Rock Piano
p-lefthand|U-OPBID8MFc|10 Left Hand Patterns Used in 1000s of Songs
p-lefthand|H4mgUezDJng|Left-Hand Patterns Every Pianist Wants to Learn
p-lefthand|BwlXoxAPBF0|3 Left-Hand Patterns for Beginners (Pianote)
p-lefthand|rn1ZejMbDR0|5 Piano Accompaniment Patterns You Should Know
p-voicings|jcDHtskxbbE|Chord Voicings for Jazz Piano: How They Work
p-voicings|oF6GRr7cN7Y|Transform Simple Chords into 2-Handed Voicings
p-voicings|4mh248D4Nt0|10 Important Chord Voicings You Probably Don't Know
p-voicings|FuUvn2tusIY|3 Must-Know Piano Voicings for Beginners
p-voicings|EnGXHbOgVKU|7 Levels of Piano Voicings
p-pedal|mWweMJjBcro|How To Correctly Use the Sustain Pedal
p-pedal|9ZItxWjEF7Q|Legato Pedalling: How to Use the Sustain Pedal
p-pedal|koJVelJdnZE|How to Use a Sustain Pedal (Pianote)
p-pedal|N3yS7pG1MGQ|A Simple Exercise for the Sustain Pedal
p-pedal|BV1GW3PGx8o|The Basics of Pedalling
p-hands|G78DQpEDDWE|Piano Hand Independence Exercises for Beginners
p-hands|rC7vofuY8jc|3 Easy Exercises to Improve Hand Independence
p-hands|FdNsVwnBP2A|7 Exercises for Hand Independence
p-hands|cgUMFKDSmao|The Hand Coordination Exercise Every Pianist Needs
p-hands|mpIhNCO-drM|Simple Exercise to Improve Hand Independence
d-dynamics|NdoKq0t2PBo|Beginner Ghost Notes (Drumeo)
d-dynamics|YRoiBlnK-oo|How To Play Ghost Notes On Drums
d-dynamics|pV52sP7fkEo|Ghost Notes and Accents (Part 1)
d-dynamics|bsdECbjNhuA|Better Ghost Notes for More Dynamic Grooves
d-independence|gsqs0KsDPLM|Independence Made Easy with Jared Falk (Drumeo)
d-independence|K11uK_etwO0|Hand Independence Builder For Beginner Drummers
d-independence|Q3drWJXJchw|Simple 4-Way Independence Drum Lesson
d-independence|XcgBOy-EiKA|6 Bass Drum Independence Exercises
d-independence|YschZCLsV4c|How to Separate Hands and Feet
d-swing|JBp_PvBqxWI|How To Play An Up-Beat Shuffle (Drumeo)
d-swing|caWIyBvvyMU|5 Legendary Shuffle Grooves
d-swing|x63hwjbr7ho|Shuffle and Swing Beats From Eighth-Note Triplets
d-swing|hgpvdq8g59w|Straight vs Shuffle and Swing
d-swing|gt2Sp_iG2hU|Blues Shuffle Beats
d-hats|1Q4IyYBIlHM|Opening and Closing Hi-Hats
d-hats|LIOUMHZOK5E|Try This Left Foot Hi-Hat Groove
d-hats|gpMm0kSuUR4|Opening the Hi-Hats (Beginner)
d-hats|hVnxBotHXp4|Eighth-Note Open Hi-Hat Beats
d-hats|IHdeWtd_7Wk|Cool Open and Closed Hi-Hat Ideas
d-tuning|HHO-lLhESo0|How To Tune Your Drums (Jared Falk)
d-tuning|U3qMyc1G3XE|Tuning Your Toms (Drumeo)
d-tuning|tKZD1FymwPE|How to Tune Your Toms
d-tuning|vxh9__IQ-78|How to Tune Your Snare Drum
drums|et9hU7QMDYU|How To Play Drums: Your Very First Drum Lesson
drums|t2A2UDmrgsw|The 4 Most Important Drum Grooves (Drumeo)
drums|Ti655F8LN0g|Rudiments: Single Strokes, Double Strokes, Paradiddles
drums|zBMiRlGKWTo|Learning Your First Drum Beat
drums|sRXZ1Bnw-Lo|10 Easy Drum Beats for Beginners
drums|KB-zZXDcIMo|5 Beginner Drum Beats
fills|vG5EKqx8MhU|Rock Drum Fills: Free Beginner Drum Lessons
fills|ut3QiU-Gz6A|Linear Drum Fills (Drumeo Live Lesson)
fills|Uhnc2cMNfzg|5 Drum Fills That Make Beginners Sound Pro
fills|DKo7xBj0hE0|5 Powerful Drum Fills for Beginners
fills|rRqWtYgwtY4|3 Pro-Sounding Beginner Drum Fills
charts|0myaW92-OFs|How To Read Drum Music in 5 Minutes
charts|_vn91WKcDIw|How to Read Drum Music (The Fast Way)
charts|fulgbZKZMKA|Drum Sheet Music: Notation and Sticking Explained
charts|XKxSJHLZtkI|How to Read Drum Notation
rhythm|L2DFeHG1D48|How to Count Music: Animated Rhythm Lesson
rhythm|9_kOJo3yfOY|Simple and Compound Time Signatures
rhythm|3zxsPCnDb0g|Rhythm and Note Values
rhythm|x3CK4-G5Eg4|How to Count Basic Rhythms (Complete)
rhythm|lK0V54_E0bk|Always Count Rhythms Like This for Accuracy
solo:bass|Nvx2RBBPJEk|Pentatonic Bass Masterclass: Solos, Fills & Lines
solo:bass|vz1C4TIfmho|How To Play Bass Solos: Major and Pentatonic Scales
solo:bass|fbEr_5S9x-E|Breaking Down Pentatonic Bass Fills
solo:bass|f9CH_LBtnu0|The Blues Scale on Bass for Lines and Fills
solo:piano|CjJwxtahGtw|How To Really Improvise Using The Blues Scale
solo:piano|pcBKQXM_XX8|How to Use the Pentatonic Scales on Piano
solo:piano|k1N4UA5y5kE|Improv for Beginners (Pianote)
solo:piano|eIcf5qpBLCA|Piano Improvisation 101
solo:piano|MhCGvCXvFio|Chords and Melodies: How to Improvise
shapes:piano|sUFx0G_Am1U|Learn All Major & Minor Piano Chords
shapes:piano|ARtRyfqZqCU|The Easiest Way to Learn All the Basic Piano Chords
shapes:piano|RqFdk29gOLw|How to Play Piano Chords
shapes:piano|KU4YLMlN5hk|Beginner's Guide to Chord Inversions
shapes:piano|BKi8cJHgTPM|Understanding Triad Inversions on Piano
notes|jK_9wFD2m2A|How to Read Sheet Music in 10 Minutes
notes|5DKoNY5bYYA|10-Minute Music Theory: How to Read Sheet Music
notes|IUfrL-2gofM|Treble Clef, Bass Clef and the Grand Staff
notes|KUtRCzK-Qko|Learn the Notes of the Treble and Bass Clefs in 5 Minutes
intervals|8RPggfJ5bjQ|Intervals: Half of Everything You Need To Know
intervals|2lVf7Vu09L4|The Easy Method to Work Out Intervals
intervals|w0t6lKLybyA|Identifying Intervals by Ear Using Popular Songs
intervals|RHjKit5YnLc|How to Sing and Play Intervals
intervals|iJ7TpJPGiCE|Ear Training: Sing the Intervals
scales|P-5ikEev6HI|Major & Minor Scales Explained
scales|VmYNlOnG86A|Major and Relative Minor Scales
scales|5kCvnI5GldU|What Major and Minor Really Mean
scales|2Bt-XiLO6n4|Whole Steps, Half Steps and the Major Scale Formula
scales|Sxla80heXgw|Half Steps, Whole Steps and the Major Scale
modes|-CJvTnjfAqY|Modes Made Easy
modes|EKBkjo2WCIs|How Modes Change a Song
modes|QYoxAvfjTpw|The Sound of Each Mode
modes|v_f9_4eEUyg|What Are Music Modes?
modes|6fBSiTdQB80|This Is How You Finally Understand the Modes
world|9ylhwJTzEes|Middle Eastern Scales: Modes of Harmonic Minor and More
world|CHUMiL-8K0E|The Modes of the Harmonic Minor
world|SlM-xEAiAJc|Exotic Scales: Phrygian Dominant and Harmonic Minor
world|w1TRZ3AAO7k|Hirajoshi Scale Lesson
world|-CerXEcCJcY|Songs That Use the Phrygian Dominant Scale
chords|YJmptmaBw94|Every Major & Minor Chord Explained in 20 Minutes
chords|B0nttVoDYDg|Seventh Chords Explained
chords|JfD0nHrJDC0|How Chords Work: Music Theory Crash Course
chords|7CxxJQHypW0|The 4 Types of Triads Explained
chords|EtCk-Iw6898|How Chords Work: The 7 Chords in a Key
dominant|3yFesW4jEkk|Dominant 7th Chords: What They Are & How to Use Them
dominant|RK4Yaxvm7og|Major 7th vs Dominant 7th Chords
dominant|d4BPkvWbBeQ|How to Resolve a Dominant 7th Chord
dominant|kLLci4bdB5U|Resolving the Dominant 7th Chord
dominant|z5p2SwcZ1Sg|What Is a Tritone Substitution?
dominant|ipLa1D1bJxE|What Is a 7th Chord? Dominant 7th Explained
progressions|xS2jNlUmi74|How to Read Roman Numerals in Chord Progressions (David Bennett)
progressions|M2skX-SNIvA|How the Roman Numeral System Works
progressions|mxVzktPGxaY|Build Any Chord Progression by Number
progressions|_JoMdR6R12w|Chord Progression Theory in a Major Key
progressions|WjBicbxfiKI|The World's Most Popular Progression: I–V–vi–IV
circle|Y9NKuSYT4WY|The Circle of Fifths Explained (No Confusing Theory)
circle|IcNUpRkt91s|Circle of Fifths
circle|Y3zyp1FwRC4|The Circle of Fifths Explained (and Why It's Useful)
circle|qF3mJzDulJ8|How to Actually Use the Circle of Fifths (Guitar)
circle|DbhcPRQT7bk|Circle of Fifths: Keys, Relative Minors and Accidentals
th-sevenths|rdLrnZ9E9H0|What are Diatonic Seventh Chords?
th-sevenths|wmb_rXK-uug|How to Build Diatonic Seventh Chords in C Major
th-sevenths|2jS89HU3_7E|Dominant and Major 7 Chords Explained
th-sevenths|9TQzDM3VNzs|7th Chords in a Major Scale Explained
th-sevenths|Ku-kFUSMWw4|Major 7, Minor 7 and Dominant 7 on Piano
th-cadences|EknaUvmYB4k|Musical Cadences: Explained!
th-cadences|N5iwOjI1TMA|Intro to Cadences
th-cadences|i5BctPKpxyA|Perfect, Imperfect, Plagal and Interrupted Cadences
th-cadences|saw50A8vWSg|Cadences: Perfect, Imperfect, Plagal, Interrupted
th-cadences|o7--JMDTlF4|The “Amen” Chords: What Is a Plagal Cadence?
th-cadences|C-u8RzFVgOc|Cadences: How to End a Piece of Music
th-secondary|YVQiE441t2M|What is a Secondary Dominant?
th-secondary|Bh-SJXSXeZ8|Secondary Dominant Chords Explained
th-secondary|gMxvpeAoDNo|Secondary Dominants: Examples From Radiohead to the Eagles
th-secondary|pMopMBiHKfQ|Songs That Use Secondary Dominants
th-secondary|-MW2CEq2Pco|Richer Progressions: Secondary Dominants Explained
th-borrowed|14gBV0Ni-DY|Modal Interchange: Borrowed Chords and Parallel Modes
th-borrowed|iT-o2o4snKU|The Most Beautiful Chords: Modal Borrowing
th-borrowed|LWeNCI2ukKc|Modal Interchange With Real Music Examples
th-borrowed|uwHKg0CfoNc|Reharmonise a Song: Secondary Dominants and Borrowed Chords
th-borrowed|aP0NEU7YVbk|Secondary Chords and Borrowed Chords
th-blues|nqA7_0Z1_PY|12 Bar Blues Explained
th-blues|SPgp_DulszA|The Things You Must Know To Play a 12 Bar Blues
th-blues|P96FQ2kBZCA|Blues Rhythm Guitar: 12-Bar Shuffle in Any Key
th-blues|PPrSRnLEK3o|The Complete Beginner Blues Shuffle Lesson
th-blues|0TxlHjPK0yk|12-Bar Blues Style (JustinGuitar)
th-extended|rLDRWDI-m3w|Extended Chords: 9ths, 11ths and 13ths
th-extended|vjRfVZDsHfY|You Understand Chord Extensions More Than You Think
th-extended|FdEUt5Dsvh4|Diatonic Extensions: 7ths, 9ths, 11ths and 13ths
th-extended|owi7EmvoGsk|How to Voice 9th, 11th and 13th Chords
th-extended|_GXLqQ6z6z8|Songs That Use 9th, 11th and 13th Chords
th-melody|jA7gdz56LtY|How to Write a Great Melody (Over Chords)
th-melody|u9Qvh3rq5-A|What Makes a Great Melody?
th-melody|ktq_gOZU2VU|How to Write a Melody (Theory and Composition)
th-melody|TKU2sYP4DKE|How to Come Up With a Motif
th-melody|UZ62XUeb_9E|Fix Your Repetitive Melodies
th-melody|GQ4WmW5P-rw|7 Melody Tricks They Use to Hook You
abl-tour|OtT5OCXgqjY|Ableton 12: Complete Beginner Basics
abl-tour|7_TRZwKxwS4|Ableton Live 12 for Beginners in 12 Minutes
abl-tour|gODmG3yqGbo|The Only Ableton Live 12 Beginner Guide You Need
abl-tour|kNQ3yMK5yf0|10 Essential Workflow Tips for Ableton Live
abl-session|KbtijycKgr0|All About Session View in Ableton Live
abl-session|o8diEg51rZs|Use Session View to Turn Loops into Full Tracks
abl-session|wdkI5SmF9l8|Using Clips and Scenes in Ableton Live
abl-session|vlQg_gScLXk|Ableton Session View: Beginner's Tutorial
abl-session|rN0ymr5IMFs|From Session View to Arrangement
abl-midi|Yy98aeNYJ6Q|How to Use Piano Roll in Ableton Live 12
abl-midi|HFrJGU0TZOA|Tips and Tricks for the Ableton Piano Roll
abl-midi|e8SkWy2rsK0|Ableton Piano Roll: The Complete Beginner Tutorial
abl-midi|3TAHOGHs-IQ|Where Is Ableton's Piano Roll?
abl-midi|YV71_bDFAJY|Ableton Piano Roll (MIDI Editor)
abl-drums|536sLoY5Wpg|Make a Beat in Ableton Live: Drum Rack for Beginners
abl-drums|wDhU-vbVUOI|Drums in Ableton: The Easiest Tutorial for Beginners
abl-drums|he5HdqpKzAE|Ableton Drum Rack: From Setup to MIDI Notes
abl-drums|L_Gq2F9vMRo|Easy 4/4 Beat Creation With Drum Rack
abl-audio|tVrfSV7_dhc|Ableton 12 Warping Made Super Simple for Beginners
abl-audio|OoVvYtqzT3s|3 Rules For Warping Your Audio in Ableton Live
abl-audio|zJCoFtlKTUc|Warping Whole Songs in Ableton
abl-audio|CvliTV6dLYQ|How to Record Vocals in Ableton Live 12
abl-audio|7dqrx3cE34I|How to Record Guitar in Ableton With an Interface
abl-devices|pCgJpy7B8rY|Audio Effect Rack is Ableton's Best Plugin
abl-devices|6208nvJ1tio|Effect Racks in Ableton Live: How to Build Them
abl-devices|TGhFt0O0B-g|Master Ableton Racks: Beginner's Guide
abl-devices|S_fFZQpwYkY|Building an Instrument Rack in Ableton
abl-auto|3PNht5RIQ6I|Understanding Automation in Ableton Live 12
abl-auto|cSPEC1ZD1_8|How to Add Automation in Ableton
abl-auto|96Kj6X1qBMM|Automation and Modulation in Ableton Live
abl-auto|zDaJBAYsqH8|Understanding Automation and Modulation in Ableton
abl-mix|bQ0NUjaIoQE|Ableton Arrangement Tutorial for Beginners
abl-mix|OmTqHQjut_8|How to Mix Down in Ableton Live: Beginner's Guide
abl-mix|mZx_CBiW68g|Arranging Songs in Arrangement View
abl-mix|xEiMRbiSBwE|5 Ways to Arrange Your Track in Ableton
abl-sampling|AyMGncKtS3w|How to Sample in Ableton Live (Simpler Full Tutorial)
abl-sampling|MqW3hgxhmF0|Sampling in Ableton Live using Simpler: Slicing
abl-sampling|xIyckZu_gtk|Chopping Samples in Ableton Live (Simpler)
abl-sampling|HVBHGwHJzqY|Use Simpler to Slice and Chop Samples
lgc-tour|eozjwdOAhOI|Logic Pro: A Complete Tutorial For The Overwhelmed Beginner
lgc-tour|C25hkCWMaSo|Logic Pro Ultimate Beginner's Guide (Full Course)
lgc-tour|xKWdaSf9y5U|Logic Pro Tutorial for Beginners in 13 Minutes
lgc-record|gFebXnxUDmI|Logic Pro 11: MIDI & Software Instruments
lgc-record|usLzR5f7AUA|How to Record MIDI & Fix Your Timing with Quantization
lgc-record|t7gF24_VP5g|Recording MIDI and Software Instruments in Logic
lgc-record|ocC3TTk0Wq4|MIDI Fundamentals and Software Instruments in Logic
lgc-pianoroll|RLATWQr4i4w|Logic Pro: Division and Piano Roll Quantize Explained
lgc-pianoroll|JSniv--Mmeo|Logic Pro: Piano Roll
lgc-pianoroll|usLzR5f7AUA|Record MIDI and Fix Your Timing With Quantize
lgc-drummer|oN6hs0-JKgw|Logic Pro 11 Session Drummer: 16-Minute Overview
lgc-drummer|6yl1DXNoxmk|How to Use Session Players + Chord ID in Logic Pro
lgc-drummer|CKTWDaJKYlU|Logic Pro Drummer: Everything You Need to Know
lgc-drummer|bZ1rqHsuI1s|How to Use Session Drummer, Step by Step
lgc-drummer|WsW4TS1i4z4|The Secret to Easy, Great Drums in Logic
lgc-audio|xdE6DNcDK70|How to Use Take Folders in Logic Pro (Fast Comping)
lgc-audio|Dp54RPzQVdM|Logic Pro: Take Folders and Quick Swipe Comping
lgc-audio|nFhtKxle_3U|Take Folders and Quick-Swipe Comping
lgc-flex|WwDiIlm7VY8|Logic's Flex Time Basics
lgc-flex|mO3BO6ndoWY|How to Tune Vocals with Flex Pitch in Logic Pro
lgc-flex|pEgUZ3N2Xmo|Flex Time in Logic Pro Explained
lgc-mix|azJPTYtwK_o|Logic Pro Mixing Tutorial: Everything You Need To Know
lgc-mix|jSFF8fotNhA|Mixing and Mastering in Logic Pro (Start to Finish)
lgc-mix|id6YGTBlBLA|Mixing and Mastering in Logic Pro (Full Tutorial)
lgc-mix|QvnFOCI6RuU|Compressing and Mixing Lead Vocals in Logic
lgc-mix|7337AX7Sius|How to EQ Vocals in Logic Pro
lgc-master|JxAfFKuqgoA|Logic Pro: Bounce Your Project, Settings & Dithering
lgc-master|jL1qxV9D79A|How to Bounce Out Your Master Mix in Logic Pro
lgc-master|dfzcvJoa1kA|Master in Logic Pro With the Mastering Assistant
lgc-master|k3UsH3d2GiM|Mastering in Logic Pro: Ultimate Beginner's Guide
lgc-master|b1U-N9IjlTw|Logic Pro Mastering Assistant Overview
lgc-sampler|_WdPD8cW0Vs|Logic Pro: Quick Sampler
lgc-sampler|iqJu0opJb2c|Logic Pro: Live Loops Quick Start Guide
lgc-sampler|BKtdVbqIwVA|Chop Breaks and Samples With Quick Sampler
lgc-sampler|_moUy0EpWc0|How to Chop Samples in Logic Pro
lgc-sampler|2_JA4N_MJFE|Live Loops Tutorial
midi-basics|M8aw_72dKY8|Understand MIDI Basics In 4 Minutes
midi-basics|1Wf9XBzK5BY|What Is MIDI? Why It's Not Audio
midi-basics|faZIkN_e_1s|MIDI Explained for Beginners
midi-setup|gAOCopX7Z_s|Setting Up A MIDI Controller & Keyboard To Your DAW
midi-setup|tCwBxW-p0Uo|How To Set Up Your MIDI Controller In Ableton Live
midi-setup|ybKrs5F3Zw8|MIDI Controller Basics for Beginners
midi-setup|dMU2Y2oP-Ic|How to Set Up Your MIDI Keyboard and Drum Pad
midi-velocity|VYveuWIqh8g|Humanizing Your MIDI: Velocity & Realistic Editing
midi-velocity|oHEUV3T9A1w|Humanize: Randomize Velocity, Position & Length in Logic
midi-velocity|MD5ahBluMT4|Add Realism to Virtual Piano With Velocity
midi-velocity|er38jXJRDVo|Editing MIDI Velocity
midi-quantize|-F-EC-tCJmo|Swing Quantization Explained
midi-quantize|l90yie29RoE|Logic Pro: How to Create a Groove Track
midi-quantize|I8ojIOkokuw|An Expert Explains Quantizing
midi-quantize|1_p2kSfk5eo|Humanize Your MIDI for Better Groove
midi-drums|1s1eFLGkOOw|How To Program Realistic Drums (Step By Step)
midi-drums|HcUWrQAyQog|Drum Programming Basics: All You Need to Know
midi-drums|CZ-C1P1Az8w|4 Ways to Humanise MIDI Drums
midi-drums|3R3zeo8bvK0|Make MIDI Drum Grooves More Human
midi-drums|wFnPXf1boi8|Advanced Hi-Hat Programming
midi-cc|mo2gvMUqVt4|MIDI: Mod Wheel, CC, Pitch Bend & Pressure
midi-cc|_fvbL7kz25g|Automating Mod and Pitch Wheels in Ableton Live
midi-cc|9i0X7EtCn60|MIDI CC Fully Explained
midi-cc|76JVtUVAfJQ|What Is MPE and How Does It Work?
midi-arp|4hyedYYkw-o|What is an Arpeggiator?
midi-arp|iPFHkJGgs2E|How to Spice Up Your Music with an Arpeggiator
midi-arp|zNbIFVqrzcQ|4 Creative Ways to Use Arpeggiators
midi-arp|P5B93Wz6Byc|All About the Arpeggiator in Ableton Live
midi-arp|5Q0NbenUyec|MIDI Tips: Arpeggios Made Easy
midi-synth|MHUApMHV1AA|Oscillators, Filters, Envelopes
midi-synth|iCeoFDBZhIA|Basic Components of Synthesizers
midi-synth|HJ5VxUAvSTE|Oscillators, Filters and Envelopes
midi-synth|sbEc5Kxc1s0|Understanding Envelopes and ADSR
rec-gear|OzKsp_KmdNc|Everything You Need To Start Recording Music
rec-gear|N39VZT6Dx9U|Home Studio Set Up: Equipment, MIDI, Audio & USB
rec-gear|hlMileAPyfg|The Ultimate Home Studio Setup Guide for Beginners
rec-gear|gKJaEVrThIs|10 Things You Need in a Home Studio
rec-levels|pinNLBnBRe8|Gain Staging: The 3 Rules You Need To Know (In The Mix)
rec-levels|FbbEt4hMEEo|How to Set Levels to Avoid Clipping
rec-levels|9CJ1BZ5JLqo|Beginner Guide to Gain Staging and Input Levels
rec-levels|YPrvtNKjIl0|What Bit Depth Should You Record At?
rec-levels|o3aDeHmOSrY|What Is Headroom?
rec-mics|qV6mxPpqTv0|How Do Microphone Polar Patterns Work?
rec-mics|-USGst7QqwU|Cardioid vs Omni vs Bi-directional Mics
rec-mics|NVbFS8kM2Ms|Dynamic, Condenser and Ribbon Microphones Explained
rec-mics|IgG9p0aO9Eg|Microphone Polar Patterns Explained
rec-placement|lPnvaCIpIXs|Microphone Placement: Set Up Your Mic like a Pro
rec-placement|ki6VcMitwWs|Vocal Mic Positioning Tips for the Home Studio
rec-placement|qCIJfORCXaY|How to Master Mic Placement
rec-placement|I58Il7yIerk|Proximity Effect Explained
rec-placement|bWvhMHjhYak|2 Things to Know About Proximity Effect
rec-room|qbI91QZ6TBc|The Basics of Room Acoustics
rec-room|xOjbxYcx8AU|Home Studio Acoustics Guide #1
rec-room|6pnobPtlzTs|Room Reverberation 101
rec-room|TXAHYFezGiA|The 4 Types of Reverb Explained
rec-treat|HO7aeraKLsM|How To Make Your Own Acoustic Panels
rec-treat|x-yBCtDem1A|How to do Acoustic Treatment for a Home Studio
rec-treat|0Zbj-dch_3g|Guide to Acoustic Treatment
rec-treat|AK1yunXHIB4|How to Treat Your Room on a Budget
rec-mix|T-QftdZZAZE|Mixing Basics 101: Gain Staging, EQ, Compression, Effects
rec-mix|UeTe_k8PZh8|Understanding EQ in 5 Minutes
rec-mix|LrzPMKg4dyU|Audio Effects Explained for Beginners
rec-vocals|aF8LTLQTy0w|How to Record Vocals at Home: Full Tutorial
rec-vocals|zsQ0mjcZPCA|The 5 Best Tips for Recording Vocals at Home
rec-vocals|F3hoSWigVWA|Top 10 Tips for Recording Vocals at Home
rec-vocals|aL2wMy_a5hM|How Far Should the Singer Be From the Mic?
rec-guitars|CTSsHqcYOag|Acoustic Guitar Recording Guide: One Microphone Setup
rec-guitars|6rtQc0b8cFU|How to Record Guitar at Home with a Mic & Interface
rec-guitars|LZNtnKIpjAs|How to Record Electric and Upright Bass at Home
rec-guitars|rntj-MKW5Rs|How I Record Electric Guitars at Home
rec-drums|HMU7z39hB3U|How to Record Drums with 1, 2, 3, 4 or 5 Microphones
rec-drums|j6LtM1GBq2A|How to Record Drums for Beginners (On a Budget)
rec-drums|_houWYp8QZw|Great-Sounding Drums With Just 2 Mics
rec-session|dohtMPU0Oxg|21 Recording Tips For Better Home Recordings
rec-session|EP5NwQyxsC4|6 Home Recording Tips I Wish I Knew When I Started
rec-session|UHAtq-Vzwy4|How to Run an Efficient Recording Session
rec-session|se2grxelIqk|How to Prepare for a Recording Session
tuner|a-SXdLzl-kM|How To Tune Your Guitar
tuner|7si11pQ5mgw|How to Tune a Guitar for Beginners
tuner|K-f32TZVgS8|How to Tune a Guitar Perfectly, Step by Step
tuner|ihlDFZjNM6g|Tune Your Guitar by Ear Using Harmonics
tuner|sDgGwT1DuME|Tune by Ear: The 5th/4th Fret Method
tuner|YwvrL1QgFIE|4 Ways to Tune Your Guitar by Ear
transcribe|WF4s8txqDYA|Learn the Basics of Music Transcription in Under 20 Minutes
transcribe|-gH4sfZ7ALg|How to Play Any Melody by Ear: Step by Step
transcribe|zm5R3w6UDeI|Jeff Berlin: How to Transcribe by Ear
transcribe|xt4H2zQjNBM|Beginner Transcribing Tips (JustinGuitar)
transcribe|bFtTvqASQ9k|My Method to Learning Any Song by Ear (Rick Beato)
slow|xt4H2zQjNBM|Beginner Transcribing Tips (JustinGuitar)
slow|3DuHf7VhU-o|How Pro Musicians Learn Songs Fast
slow|DQyF2CmMpVs|How to Learn Songs Faster
slow|bsd1b4iF5S8|Get Better at Music by Practising Less
metronome|9ihouLRdkak|How To Practice With A Metronome
metronome|T9LQZ_hvsKg|A Ridiculously Simple Metronome Practice Technique
metronome|BGocWs3LBd8|3 Great Ways to Practise With a Metronome
metronome|S8Ai5-hBNo4|How to Practise Drums With a Metronome
notes:piano|tEtukfFv3Wk|How To Play Piano: Your First Piano Lesson
notes:piano|tP9jIgOX1ts|How to Find All 12 Notes on the Piano
notes:piano|a24G6yX-vao|Naming Notes on the Piano
notes:piano|VaMHnmLm3rc|Learn All Piano Notes in 7 Minutes
progressions:piano|TGrJrtULOvo|This Pop Chord Progression Will Help You Play Hundreds of Songs
progressions:piano|OkcSCIIXukk|Chord Progressions 101 (Piano)
progressions:piano|7XnuxbanDKg|Easy Pop Chord Progressions for Piano
progressions:piano|fcbL907oq6U|The 10 Most Beautiful Piano Chord Progressions
progressions:piano|nvn3ILaL-w8|Pop Progression I–vi–IV–V in C Major
tab:bass|lnE203FxXrg|Beginner Bass Lesson: How To Read Tablature
tab:bass|kzWyrmgR3Uw|How To Read Bass Tabs
tab:bass|6pjLjUuYuG0|How to Read Bass Tab for Beginners
tab:bass|nAq1OwBf_N8|Rhythm Reading for Bass Made Simple
tab:bass|F80hI1Y52qA|How to Read Music on Bass: Ultimate Guide
gv-pocket|3Jzx6rve5fI|Playing in the Pocket
gv-pocket|3YRLT8ZvxsA|Build Pocket and Timing With This Exercise Routine
gv-pocket|2DCp5HlaiFY|What Is Groove? Time, Feel and Groove
gv-pocket|fQsBzrqd0t8|The Fundamentals of Groove in 7 Minutes
gv-pocket:bass|XpBgTsDjmwI|Improve Your Bass Groove and Play in the Pocket
gv-pocket:bass|NXQ3lMHzykk|How to Play Behind the Beat (Bassists & Drummers)
gv-pocket:bass|_Fl7mKUyxvQ|Nathan East's Tips for Playing in the Pocket
gv-pocket:bass|8T1XBYmWOP0|Should Bassists Play Behind or Ahead of the Beat?
gv-pocket:drums|5-GcEc9GDSU|How to Play in the Pocket on Drums
gv-pocket:drums|sDArmhPi-sc|How to Stay in the Pocket with The Pocket Queen
gv-pocket:drums|UB_G32rKNS0|Drumming Ahead of, On and Behind the Beat
gv-pocket:drums|JZILP4ojEfM|How to Develop an Amazing Pocket and Groove
gv-pocket:guitar|RLXhk_k4kYc|How I'm Learning to Play in the Pocket on Guitar
gv-pocket:guitar|mRGuzfMx5AE|Improve Your Rhythm Feel: Lock Into the Pocket
gv-pocket:guitar|3Jzx6rve5fI|Playing in the Pocket
gv-pocket:guitar|Hj7O0FeZmyo|The 3 Best Rhythm Guitar Exercises for Timing
gv-pocket:piano|zRQ9gsBeGwA|How to Play a Funky Groove on Piano
gv-pocket:piano|3Jzx6rve5fI|Playing in the Pocket
gv-pocket:piano|2DCp5HlaiFY|What Is Groove? Time, Feel and Groove
gv-pocket:piano|b8jh9L5Q6Uo|Better Rhythms on Piano: How to Play With Groove
gv-pocket:piano|IzQq1HXnZfk|How to Play With More Groove on Piano
d-pocket|5-GcEc9GDSU|How to Play in the Pocket on Drums
d-pocket|6XatoJTuJj4|Dennis Chambers: How to Play in the Pocket
d-pocket|NmpDzdKRCsw|Nate Smith: Playing in the Pocket
d-pocket|H7YmbzrdhWA|Top 5 Tips on Pocket Playing
gv-time|q_HXGS8H3AI|How to Count Basic Rhythms Better Using Subdivision
gv-time|S5bIfBduvbQ|Subdivision: What Is It and Why Do It?
gv-time|DuPgSagCKds|Develop Good Timing with 3 Simple Exercises
gv-time|ZQeTYelTqtE|Metronome Exercise to Improve Your Inner Clock
gv-time:drums|SFKsa7mch-o|Drummer Timing Exercise: Develop Your Internal Metronome
gv-time:drums|q_HXGS8H3AI|How to Count Basic Rhythms Better Using Subdivision
gv-time:drums|S5bIfBduvbQ|Subdivision: What Is It and Why Do It?
gv-time:drums|XcQh1v2sy78|Building Your Internal Clock on Drums
gv-time:drums|YbLk9DpCn8Q|The Ultimate Drummer's Timing Test
gv-synco|_uqu-aD9HpU|What Is Syncopation?
gv-synco|GmuWAs_TMV8|How to Count Syncopated Rhythms for Beginners
gv-synco|rHaw0P6__g4|7 Syncopated Rhythm Patterns You Need to Know
gv-synco|VJyP26t9VDo|How to Read Funky Syncopation (All Instruments)
gv-dynamics|_X8AHq7YAcM|Different Dynamics and How to Create Better Contrast
gv-dynamics|-ELHLRy0Ooo|Dynamics in Music Explained
gv-dynamics|ydmzGG2TVdM|Dynamics: How Composers Shape Feeling Through Volume
gv-dynamics|SAIvTZiNcqQ|Musical Expression Explained
gv-dynamics|KbrE4tnRRbA|How to Play With Feel
gv-styles|2DCp5HlaiFY|What Is Groove? Time, Feel and Groove
gv-styles|_WBZ5RYsxQY|What Is Swing? Groove, Timing and Feel Explained
gv-styles|8YA7QhySOt8|What Is Swing and How to Feel It
gv-styles|Ngq54VDriAg|3 Ways to Create Dilla's Drunk Drum Groove
g-funk|YCDRfOIzYqA|Funk Guitar: Muted and Pressed 16th Strumming
g-funk|EKTxz-yMcv8|The Essential Funk Practice Routine
g-funk|hACQLUShJw4|16th Note Strumming: Funk and Pop Patterns
g-funk|0r4dhxZQgRc|A 16th Note Funky Strumming Lesson
b-slap|iJyv56emOzI|How to Slap Bass for Beginners (Complete Walkthrough)
b-slap|DT73zJ0qHKQ|5 Exercises to Jump Start Your Slap Technique
b-slap|0AbtEDBgBY0|How to Play Slap Bass for Beginners (Nate Navarro)
b-slap|RkCyD-JgtV0|The Perfect Starter Slap Bass Riff
p-comping|CID96bCGRRg|Comping Rhythms for Beginners
p-comping|Y8iWV65hbLE|5 Comping Rhythms Every Jazz Musician Should Know
p-comping|V688USxrOb4|Best Left-Hand Comping Exercises and Rhythms
p-comping|SKrD0eopEWM|Accompanying Yourself: Comping Rhythms
caged:bass|vewKBiippCw|The CAGED System on Bass Guitar?!
caged:bass|ocycW9iOx0E|Major Triads on Bass: 3 Positions to Know
caged:bass|tYpSM25t0Fc|Mastering Bass Chords: Triads
caged:bass|aLE_9ij2AmI|Arpeggios That Match the CAGED Shapes
caged:bass|FXr0DucKiAo|The 5 Major Arpeggio Shapes (CAGED)
gv-space|2AtNAhpyTD0|Why Less Is More
gv-space|xUU8QejP6SE|Strumming Sounds Too Busy? Try This Simple Fix
gv-space|H8Qx_bTdWS8|Stronger Phrasing with Call and Response
gv-space|SjnogbV9fK4|Jared James Nichols: Call and Response Phrasing
sv-basics|cseioPh4yPY|How to Sing: Body, Posture and Breathing
sv-basics|RzSpxcj9gZc|Breath Support Made Simple for Beginner Singers
sv-basics|7KdbUwSYjdA|Breath Support: Posture and Inhalation
sv-basics|Bcn98eUsUdw|Teach Yourself to Sing in 10 Easy Steps
sv-pitch|acdWf29hdL0|How to Sing in Tune: Ear Training for Singers
sv-pitch|X82uXGgFR0U|Pitch Matching for Complete Beginners
sv-pitch|-2A6DYAj1fA|How to Sing in Tune
sv-pitch|KTcH5WCdpRA|How to Tell If You're Singing in Tune
sv-pitch|sW0kDEtH53I|Fix Your Pitch in 10 Minutes
sv-warmup|hULyHfs6BTE|5-Minute Vocal Warm-Up for Beginner Singers
sv-warmup|eMjPGKZF3hQ|Easy 5-Minute Vocal Warm-Up: All Voice Types
sv-warmup|OrVGbw5ABSo|Quick 5-Minute Vocal Warm-Up
sv-warmup|_9OK-jhmffQ|Beginner Lip Trills
sv-warmup|VsopQUDsHa0|Daily Warm-Up: Lip Trills and Open Vowels
sv-intervals|cOu6OQl6-rs|How to Hear and Sing Any Interval
sv-intervals|tij_mi8rihI|Learn Every Major Scale Interval for Singing
sv-intervals|sd_VacaFYqs|Ear Training Intervals for Singers
sv-intervals|LF6Zl-Uu-Ls|Ear Training for Singers (Sing-Along)
sv-intervals|RHjKit5YnLc|How to Sing and Play Intervals
sv-harmony|aiuufvor4nQ|How to Sing Vocal Harmony for Beginners
sv-harmony|Ov4k-iVz518|Vocal Harmony: Hearing Thirds Below
sv-harmony|WUuQRb7nQtw|How to Sing Harmony: Interval Ear Training Tricks
sv-harmony|kV84-ru5SPg|Vocal Harmony for Beginners: Hearing Thirds
sv-harmony|qqXuvOFIDdA|Singing in 3rds and 5ths
gv-odd|r97QB-3RTV4|How to Count Odd Time Signatures
gv-odd|2bgrWGUG1nM|How 7/8 Time Works (and Why It's Cool)
gv-odd|oA5jvtq9Neo|Odd Time Signatures: How to Count and Feel Them
gv-odd|up3V3LQ9i3A|Odd Time Signatures: Piano and Guitar Tutorial
gv-poly|3Y1MVB_Nbzk|2 vs 3 Polyrhythms Explained for Beginners
gv-poly|eMws3EcN1tU|How to Play 3 Against 2: The Ultimate Guide
gv-poly|r_-vVFXpnko|How to Play 4 Against 3 or 3 Against 2
gv-poly|16Ois7AmFko|3:2 Polyrhythm Drum Groove Made Easy
gv-half|fr26vIMioWY|Double Time vs Double-Time Feel, Demonstrated
gv-half|4pPx868sq80|Half-Time and Double-Time Grooves
gv-half|XX-cyxLXIvE|What Is a Half-Time Drum Beat?
gv-half|y4bot-UYYQE|Understanding Half Time and Double Time`.split('\n').forEach(l=>{const[k,id,t]=l.split('|');(o[k]=o[k]||[]).push([id,t])});return o})();
const GTR_TOPICS=['strum','caged','tab','fretboard','shapes','solo','tuner'];
function vidsFor(topic){const inst=INST();return VIDS[topic+':'+inst]||(GTR_TOPICS.includes(topic)&&inst!=='guitar'?null:VIDS[topic])||[]}
function openVideo(id,title){const d=document.createElement('div');d.className='vmodal';d.innerHTML=`<div class="vbox" role="dialog" aria-label="${esc(title||'Video')}"><div class="vhead"><b>${esc(title||'')}</b><a class="btn small" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">Open on YouTube</a><button class="btn small" data-x>Close</button></div><div class="vframe"><iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="${esc(title||'Video')}"></iframe></div></div>`;
 const close=()=>{d.remove();document.removeEventListener('keydown',k)};const k=e=>{if(e.key==='Escape')close()};d.onclick=e=>{if(e.target===d||e.target.closest('[data-x]'))close()};document.addEventListener('keydown',k);document.body.appendChild(d)}
document.addEventListener('error',e=>{const t=e.target;if(t&&t.tagName==='IMG'&&t.closest&&t.closest('.vth'))t.remove()},true);
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[data-yt]');if(!a||IN_CLAUDE()||e.metaKey||e.ctrlKey)return;e.preventDefault();openVideo(a.dataset.yt,a.title)});

/* ---------- instrument pages ---------- */
function noteInput(m){const inst=INST();if(inst==='piano')return`<div class="ninput">${keyboard({start:48,end:84,on:{[m]:'root'},labels:{48:'C3',60:'C4',72:'C5',84:'C6'}})}</div>`;
 const S=inst==='bass'?BSTR():GSTR();return`<div class="ninput">${fretboard({strings:S,all:true,exact:{[m]:{name:SHARPN[m%12],root:true}}})}</div>`}

PAGES.fretboard=el=>{const bass=INST()==='bass';const S=bass?BSTR():GSTR();const SN=S.map((m,i)=>(!bass&&i===0?'low ':!bass&&i===S.length-1?'high ':'')+SHARPN[m%12]);let mode='find',sel=S[1]+3,key='A',box=0;
 const render=()=>{let view='',info='';
  if(mode==='find'){const pc=sel%12;const map={[pc]:{name:pcName(pc).split('/')[0],root:true}};const spots=[];S.forEach((o,i)=>{for(let f=0;f<=12;f++)if((o+f)%12===pc)spots.push(`${SN[i]} ${f}`)});
   view=fretboard({strings:S,all:true,map});info=`<h3>${pcName(pc)}</h3><p class="hint">Tap any fret. This note appears at: ${spots.join(' · ')}</p>`}
  else if(mode==='nat'){const map={};LET.split('').forEach(l=>map[parse(l).pc]={name:l,root:l==='C'});view=fretboard({strings:S,map});info=`<p>Only the natural notes, A to G. Orange marks every C. Notice the pairs with no gap: E–F and B–C.</p>`}
  else{const spots=box<5?pentaSpots(key,box,S):null;const names=scaleNotes(key,'minpent');const map={};names.forEach((n,i)=>map[parse(n).pc]={name:n,root:i===0});const mx=spots?Math.max(...spots.map(x=>x.f)):12;
   view=spots?fretboard({strings:S,spots,frets:Math.max(15,mx)}):fretboard({strings:S,map,frets:15});info=`<div class="pickrow"><span class="eyebrow">Key</span>${pillsHTML('key',keyItems('m'),key)}</div><div class="pickrow"><span class="eyebrow">Position</span>${pillsHTML('box',[['0','Box 1'],['1','Box 2'],['2','Box 3'],['3','Box 4'],['4','Box 5'],['5','Whole neck']],String(box))}</div><p>${pr(key)} minor pentatonic: ${names.map(pr).join(' ')}. Box 1 starts on the root on the low string. Each box joins onto the next one up the neck.</p><div class="row">${pbtn('pb','Play this box')}</div>`}
  el.innerHTML=`<span class="eyebrow">${bass?'Bass':'Guitar'}</span><h1>The fretboard</h1><p>Each fret raises a string by one half step, and at fret 12 the notes repeat an octave higher. Learn the open strings (${SN.join(', ')}), then the natural notes, then the pentatonic boxes you'll use for soloing.</p>
  <div class="panel">${pillsHTML('mode',[['find','Find any note'],['nat','Natural notes'],['penta','Pentatonic boxes']],mode)}${info}${view}</div>
  <div class="cols"><div class="mini"><h4>Landmarks</h4><p class="o">Frets 3, 5, 7, 9 and 12 have dots. Fret 12 is the open string an octave up.</p></div><div class="mini"><h4>The 5th-fret rule</h4><p class="o">Fret 5 on a string sounds the same as the next string open${bass?'':', except the G string, where fret 4 matches the open B'}. That's how you tune by ear.</p></div><div class="mini"><h4>Octave shapes</h4><p class="o">From the low E or A string: two strings up, two frets up. ${bass?'':'From the D or G string, add one more fret because of the B string.'}</p></div></div>`;
  bindPills(el,(g,v)=>{if(g==='mode')mode=v;else if(g==='key')key=v;else if(g==='box')box=+v;render()});
  el.querySelector('.fb').closest('.scroll').addEventListener('keypick',e=>{if(mode==='find'){sel=e.detail;render()}});
  const pb=el.querySelector('#pb');if(pb)pb.onclick=()=>{const sp=box<5?pentaSpots(key,box,S):pentaSpots(key,0,S);const ms=sp.map(x=>S[x.s]+x.f).sort((a,b)=>a-b);play([...ms,...ms.slice(0,-1).reverse()],{mode:'seq',gap:.2})}};render()};

PAGES.bass=el=>{let key='A',pid='pop',pat='r58',bpm=96,playing=false,bar=0;
 const BP=[['roots','Root eighths'],['r5','Root and 5th'],['r58','Root, 5th, octave'],['walk','Walking line']];const PIDS=['pop','fifties','blues','jazz'];
 const chords=()=>PROG.find(x=>x.id===pid).ch.map(([d,t])=>chordAt(key,'major',d,t));
 const bm=root=>28+((parse(root).pc-4+12)%12);
 const line=cs=>cs.map((c,i)=>{const R=bm(c.root);const nx=bm(cs[(i+1)%cs.length].root);const th=CH[c.t].st[1][0];const fi=(CH[c.t].st.find(s=>s[1]===5)||[7])[0];
  if(pat==='roots')return[0,2,4,6,8,10,12,14].map(s=>[s,R]);if(pat==='r5')return[[0,R],[6,R],[8,R+fi],[12,R+fi]];if(pat==='r58')return[[0,R],[4,R+fi],[8,R+12],[12,R+fi]];return[[0,R],[4,R+th],[8,R+fi],[12,nx-1]]});
 const fbFor=c=>{const n=chordNotes(c.root,c.t),pc=parse(c.root).pc,map={};CH[c.t].st.slice(0,pat==='walk'?3:1).forEach(([s],i)=>map[(pc+s)%12]={name:n[i],root:i===0});const fi=CH[c.t].st.find(s=>s[1]===5);if(fi)map[(pc+fi[0])%12]={name:spellUp(c.root,fi[0],5)};return fretboard({strings:STR4,map})};
 const render=()=>{setSongs('bass',pat);const cs=chords();
  el.innerHTML=`<span class="eyebrow">Bass</span><h1>Bass lines</h1><p>The bass joins the chords to the drums. Most of the time you play the root of each chord, landing with the kick drum, then add the 5th, the octave, or passing notes to make the line move. Pick a progression and a pattern, then play along with the band.</p>
  <div class="panel"><div class="pickrow"><span class="eyebrow">Key</span>${pillsHTML('key',keyItems('M'),key)}</div><div class="pickrow"><span class="eyebrow">Progression</span>${pillsHTML('p',PIDS.map(id=>[id,PROG.find(x=>x.id===id).name]),pid)}</div><div class="pickrow"><span class="eyebrow">Pattern</span>${pillsHTML('pat',BP,pat)}</div>
  <div class="chordrow" id="bch">${cs.map((c,i)=>`<span class="cbtn ${playing&&i===bar?'on':''}"><small>${c.roman}</small><b>${c.sym}</b></span>`).join('')}</div>
  <div class="row"><button class="btn primary small" id="pl">${playing?'■ Stop':ICON.play+' Play with drums'}</button><label class="tempo" for="bbpm">Tempo <input type="range" id="bbpm" min="60" max="160" value="${bpm}"> <span id="bbv">${bpm}</span> BPM</label></div>
  <div id="bfb">${fbFor(cs[playing?bar:0])}</div><p class="hint">Orange is the root of the current chord; blue notes are the other chord tones the pattern uses.</p></div>
  <div class="cols"><div class="mini"><h4>Root and 5th</h4><p class="o">The 5th is one string up and two frets up from the root. Country, folk and rock live here.</p></div><div class="mini"><h4>The octave</h4><p class="o">Two strings up, two frets up. Disco and dance basslines bounce between root and octave.</p></div><div class="mini"><h4>Walking</h4><p class="o">One note per beat: root, 3rd, 5th, then the note one fret below the next chord's root.</p></div></div>`;
  bindPills(el,(g,v)=>{if(g==='key')key=v;else if(g==='p'){pid=v;bar=0}else pat=v;render()});
  el.querySelector('#bbpm').oninput=e=>{bpm=+e.target.value;el.querySelector('#bbv').textContent=bpm};
  el.querySelector('#pl').onclick=()=>{if(playing){stopLoop();playing=false;render();return}playing=true;bar=0;render();
   startLoop(()=>({...GROOVES[0],bpm}),{extra:(abs,t,sd)=>{const cs2=chords(),L=line(cs2);const b=Math.floor(abs/16)%cs2.length,s=abs%16;const ev=L[b].find(e=>e[0]===s);if(ev)tone(ev[1],t,sd*(pat==='roots'?1.8:3.4),.34,'bass')},
    onStep:abs=>{if(abs%16)return;const cs2=chords();bar=Math.floor(abs/16)%cs2.length;el.querySelectorAll('#bch .cbtn').forEach((c,j)=>c.classList.toggle('on',j===bar));const f=el.querySelector('#bfb');if(f)f.innerHTML=fbFor(cs2[bar])}})}};
 render()};

PAGES.rhythm=el=>{const NV=[['Whole note','𝅝',4,'1 2 3 4','Lasts the whole bar.'],['Half note','𝅗𝅥',2,'1 2 3 4','Two per bar.'],['Quarter note','♩',1,'1 2 3 4','One per beat. The basic pulse.'],['Eighth notes','♪',.5,'1 & 2 & 3 & 4 &','Two per beat.'],['Sixteenth notes','𝅘𝅥𝅯',.25,'1 e & a 2 e & a…','Four per beat.'],['Triplets','3',1/3,'1 trip let 2 trip let…','Three per beat.'],['Dotted quarter','♩.',1.5,'1 (2) & …','A quarter note plus half again.']];
 const TS=[['4/4','Xxxx',100,'Four quarter-note beats. Most pop, rock and hip-hop.'],['3/4','Xxx',110,'Three beats. Waltzes and many folk songs.'],['2/4','Xx',110,'Two beats. Marches and polkas.'],['6/8','XxxYxx',190,'Six eighth notes felt as two big beats of three. Irish jigs and slow ballads.'],['5/4','XxxYx',150,'Five beats, often 3 + 2. Take Five by Dave Brubeck.'],['7/8','XxYxYxx',230,'Seven eighth notes grouped 2 + 2 + 3. Balkan music and prog rock.']];
 el.innerHTML=`<span class="eyebrow">Rhythm</span><h1>Rhythm & time</h1><p>Rhythm is where notes land in time. The beat is the steady pulse you tap your foot to; note values say how long each note lasts compared with that beat. Every instrument needs this, and drummers live in it.</p>
 <div class="panel"><h3>Note values in 4/4</h3><div class="scroll"><table class="tbl"><thead><tr><th>Note</th><th><span class="sr-only">Symbol</span></th><th>Beats</th><th>Count it</th><th><span class="sr-only">Listen</span></th></tr></thead><tbody>${NV.map((n,i)=>`<tr><td><b>${n[0]}</b><br><span class="hint">${n[4]}</span></td><td class="big-sym">${n[1]}</td><td class="num">${n[2]===1/3?'⅓':n[2]===.25?'¼':n[2]===.5?'½':n[2]===1.5?'1½':n[2]}</td><td class="formula">${n[3]}</td><td><button class="btn small" data-nv="${i}" aria-label="Play ${esc(String(n[0]).replace(/<[^>]*>/g,''))}">${ICON.play}</button></td></tr>`).join('')}</tbody></table></div><p class="hint">Each play button clicks the beat and taps the note value on the snare over one bar.</p></div>
 <h3>Time signatures</h3><p>The top number is how many beats are in a bar; the bottom number is which note gets one beat (4 is a quarter note, 8 is an eighth). The high click is beat 1.</p>
 <div class="cols">${TS.map((t,i)=>`<div class="mini"><h4 class="big-sym" style="font-family:var(--f-display)">${t[0]}</h4><span class="o">${t[3]}</span><div><button class="btn small" data-ts="${i}">${ICON.play} Hear it</button></div></div>`).join('')}</div>
 <p class="callout">Practise with a click. Start slow enough that every note is even, then raise the tempo by 5 BPM at a time.</p>`;
 el.querySelectorAll('[data-nv]').forEach(b=>b.onclick=()=>{const n=NV[+b.dataset.nv];const c=audio();if(!c)return;const sd=60/90,t0=c.currentTime+.06;for(let i=0;i<4;i++)drum(i?'click':'clickhi',t0+i*sd,.7);const cnt=Math.round(4/n[2]);for(let i=0;i<cnt;i++)drum('snare',t0+i*n[2]*sd,.8)});
 el.querySelectorAll('[data-ts]').forEach(b=>b.onclick=()=>{const t=TS[+b.dataset.ts];playClicks(t[1],2,t[2])})};



/* ---------- learn shell ---------- */
const LEARN_THEORY=[['notes','Notes & the staff'],['intervals','Intervals'],['scales','Major & minor scales'],['modes','Modes'],['world','World scales'],['chords','Chords'],['dominant','Dominant chords'],['progressions','Progressions'],['circle','Circle of fifths']];
const LEARN_INST=[['fretboard','Fretboard'],['shapes','Chord shapes'],['caged','CAGED system'],['strum','Strumming'],['solo','Soloing'],['tab','Reading tab'],['bass','Bass lines'],['rhythm','Rhythm & time'],['drums','Drum grooves'],['fills','Fill practice'],['charts','Reading drum charts']];
const INST_PRI={guitar:['fretboard','shapes','caged','strum','solo','tab'],bass:['bass','fretboard','caged','solo','tab'],piano:['shapes','solo'],drums:['drums','fills','charts','rhythm']};
function instLearn(){return(INST_PRI[INST_RAW()]||INST_PRI.guitar).map(id=>LEARN_INST.find(l=>l[0]===id)).filter(Boolean)}
function viewLearn(id){stopDemo();const all=[...LEARN_INST,...LEARN_THEORY,...LEARN_REC];if(!all.find(l=>l[0]===id))id=INST_PRI[INST_RAW()][0];
 const link=([k,t])=>`<a href="#learn-${k}" ${k===id?'aria-current="page"':''}>${t}</a>`;
 main.innerHTML=`<div class="learn"><nav class="lnav" aria-label="Topics"><span class="lgrp">Instruments</span>${instLearn().map(link).join('')}${INST()!=='drums'?`<span class="lgrp">Theory</span>${LEARN_THEORY.map(link).join('')}`:''}<span class="lgrp">Groove &amp; feel</span>${LEARN_GROOVE.map(link).join('')}<span class="lgrp">Home recording</span>${LEARN_REC.map(link).join('')}</nav><div class="lmain"><div class="lbody" id="lb"></div><div id="songs"></div>${videos(id)}</div></div>`;
 const V=store.get('visited',{});if(!V[id]){V[id]=todayKey();store.set('visited',V)}setSongs(id);PAGES[id](document.getElementById('lb'))}

/* ---------- plan ---------- */
const CURR={
 guitar:[['Know your fretboard','fretboard',['fretnotes'],'Say each note name out loud as you play frets 0 to 12 on the low E and A strings.'],['First open chords','shapes',['shapes'],'Switch between C, G, D and Em for two minutes without stopping.'],['Rhythm and strumming','strum',['rhythm'],'Strum down on every beat, then down-up eighths, over the rock beat at 70 BPM.'],['Notes on the staff','notes',['notes'],'Find the notes of the treble clef lines (E G B D F) on your top three strings.'],['Reading tab','tab',['tab'],'Play the riff in the tab lesson, then write your own four-note riff in tab.'],['Intervals','intervals',['intervals','earint'],'Play every interval up from the A at fret 5 of the low E string.'],['The major scale','scales',['scales'],'Play G major in one position, slowly, up and down, saying the note names.'],['Minor pentatonic boxes','fretboard',['world','fretnotes'],'Learn box 1 of A minor pentatonic, then improvise over the Minor rock jam in Tools.'],['Your first solo','solo',['world'],'Learn two licks from the Soloing lesson, then improvise over the band aiming for orange chord tones.'],['Triads and chord types','chords',['chords','earchord'],'Play major then minor versions of A, D and E back to back.'],['Barre chords','shapes',['shapes'],'Practise F (E-shape) and B♭ (A-shape) barre chords until every string rings.'],['The CAGED system','caged',['caged'],'Play C major in all five CAGED shapes up the neck, then do the same for G.'],['Circle of fifths','circle',['keys'],'Play the I, IV and V chords in G, then D, then A.'],['Chord progressions','progressions',['progressions'],'Play I–V–vi–IV in G, then in D, along with the drum loop.'],['Dominant 7ths and the blues','dominant',['dominant'],'Play a 12-bar blues in A using A7, D7 and E7.'],['Minor scales','scales',['minors'],'Play A natural, harmonic and melodic minor and listen for the differences.'],['Modes','modes',['modes'],'Improvise over a drone using D Dorian, then D Mixolydian.'],['Scales from around the world','world',['world'],'Write a four-bar riff using Hirajōshi or Phrygian dominant.'],['Ear training review','intervals',['earint','earchord','earprog','earmelody'],'Play two notes, sing the interval, then check it on the neck.']],
 bass:[['Your bass fretboard','fretboard',['fretnotes'],'Name every note on the E and A strings up to fret 12.'],['Reading bass tab','tab',['tab'],'Play the riff in the tab lesson, then write your own in tab.'],['Rhythm and locking with the kick','rhythm',['rhythm','drums'],'Play root eighths on A over the rock beat, landing every note with the kick.'],['Playing the roots','bass',['bass','progressions'],'Play the roots of I–V–vi–IV in A with the drum loop.'],['Intervals','intervals',['intervals','earint'],'Find the 3rd, 5th and octave above a root on the A string.'],['Root, 5th, octave','bass',['bass'],'Play root–5th–octave over the 50s progression in G.'],['The major scale','scales',['scales'],'Play C and G major in one position, two octaves if you can.'],['Chords and arpeggios','chords',['chords','shapes'],'Arpeggiate major, minor and dominant 7th chords from the E string.'],['CAGED arpeggio positions','caged',['caged'],'Play an A major arpeggio in each of the five CAGED positions.'],['Minor pentatonic','fretboard',['world','fretnotes'],'Play box 1 of E minor pentatonic and make up a groove with it.'],['Circle of fifths','circle',['keys'],'Play roots around the circle anti-clockwise: C F B♭ E♭…'],['Walking bass and dominant 7ths','bass',['bass','dominant'],'Walk a 12-bar blues in A using root, 3rd, 5th and an approach note.'],['Minor scales','scales',['minors'],'Write a minor-key bass line using harmonic minor.'],['Modes','modes',['modes'],'Play a funky Dorian groove in E.'],['Ear training review','intervals',['earint','earchord','earprog','earmelody'],'Work out the bass line of a song you like by ear.']],
 piano:[['Notes and the staff','notes',['notes'],'Find every C on the keyboard, then play the treble clef line notes.'],['Rhythm and counting','rhythm',['rhythm'],'Clap and count quarter, eighth and sixteenth notes with the click.'],['Intervals','intervals',['intervals','earint'],'Play every interval up from middle C and sing it back.'],['Major scales','scales',['scales'],'Play C, G and F major hands separately with correct fingering.'],['Triads','chords',['chords','earchord'],'Play major and minor triads on every white key.'],['Inversions and shapes','shapes',['shapes'],'Play C, F and G in root position and both inversions.'],['Circle of fifths','circle',['keys'],'Play the scale of each key with one sharp or flat.'],['Chord progressions','progressions',['progressions'],'Play I–V–vi–IV in C with smooth inversions.'],['Minor scales','scales',['minors'],'Play A natural, harmonic and melodic minor.'],['7th chords and dominants','dominant',['dominant'],'Play ii–V–I in C with 7th chords.'],['Modes','modes',['modes'],'Improvise in D Dorian over a left-hand drone.'],['World scales','world',['world'],'Improvise on the black keys (major pentatonic).'],['Ear training review','intervals',['earint','earchord','earprog','earmelody'],'Play a chord with your eyes closed and name its quality.']],
 drums:[['The kit and its jobs','drums',['drums'],'Set up so you can reach everything; play each piece and say its name.'],['Note values','rhythm',['rhythm'],'Play quarters, eighths and sixteenths on the snare with a click.'],['Your first rock beat','drums',['drums'],['Reading drum charts','charts',['drums'],'Count each groove in the charts lesson out loud before you play it.'],'Play the rock beat at 70 BPM for two minutes without stopping.'],['Counting 8ths and 16ths','rhythm',['rhythm'],'Count “1 e & a” out loud while playing sixteenths on the hi-hat.'],['Rudiments','drums',['drums'],'Single strokes, doubles and paradiddles, 2 minutes each, slow and even.'],['Time signatures','rhythm',['rhythm'],'Play a beat in 3/4, then in 6/8.'],['Shuffle and triplets','drums',['drums','rhythm'],'Play the shuffle groove, then a triplet fill into a crash.'],['Grooves around the world','drums',['drums'],'Learn the bossa nova and reggae one-drop patterns.'],['Song form and fills','drums',['drums','rhythm'],'Play the rock beat for three bars and a fill in the fourth, eight times through.'],['Playing with a band','drums',['drums'],'Open Jam along, turn the drums off and keep time for the band for three minutes.'],['Ear training: grooves','drums',['drums','rhythm'],'Listen to a song you like and write its groove in the grid.']]};
const BLOCKS={15:[['Lesson',5],['Drill',5],['Play',5]],30:[['Lesson',10],['Drill',10],['Play',10]],45:[['Lesson',10],['Drill',10],['Play',20],['Daily',5]],60:[['Lesson',15],['Drill',15],['Play',25],['Daily',5]]};
const DAYN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const parseKey=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
function planSeq(){const inst=INST_RAW(),pinst=INST(),lv=LEVEL();const units=(CURR[inst]||CURR.guitar).slice([0,3,6][lv]);const seq=[];
 const songs=PROD.has(inst)?[]:likedSongs(pinst).filter(x=>!x.sg[1][0].startsWith('pd:')||pinst==='piano');let si=0;const stopic={guitar:'tab',bass:'bass',piano:'notes',drums:'drums'}[pinst];
 units.forEach((u,i)=>{const[t,learn,topics,task]=u;seq.push({t,learn,topics,task,id:inst+':'+t});if(i%3===2){const prev=units.slice(i-2,i+1);seq.push({t:'Review',sub:prev.map(p=>p[0]).join(', '),review:true,learn:prev[2][1],topics:[...new Set(prev.flatMap(p=>p[2]))],task:'Play through everything from the last three sessions without stopping, and note what still feels shaky.',id:inst+':review:'+i});const x=songs[si++];if(x)seq.push({t:'Song: '+x.sg[0],sub:x.L.name,learn:INST_PRI[inst][0],href:'#song-'+slug(pinst+'-'+x.sg[0]),topics:[stopic],task:`Open ${x.sg[0]}, practise each technique study, then import the real tab if you have it.`,id:inst+':song:'+slug(x.sg[0])})}});return seq}
function viewPlan(){const days=store.get('planDays',[1,3,5,6]);const mins=store.get('planMins',30);let start=store.get('planStart',null);if(!start){start=todayKey();store.set('planStart',start)}
 const done=store.get('planDone',{});const seq=planSeq();const todo=seq.filter(s=>!done[s.id]);const today=todayKey();
 const d=parseKey(start<today?start:start);let guard=0;const dated=[];if(days.length)while(dated.length<todo.length&&guard<800){if(days.includes(d.getDay()))dated.push({...todo[dated.length],date:todayKey(d)});d.setDate(d.getDate()+1);guard++}
 const late=dated.filter(s=>s.date<today).length;const next=dated[0];const pct=Math.round((seq.length-todo.length)/seq.length*100);
 const fmt=k=>{const x=parseKey(k);return x.toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})};
 const blk=s=>`<div class="blocks">${BLOCKS[mins].map(([b,m])=>`<span class="block"><b>${m} min</b> · ${b==='Lesson'?(s.review?'Reread the lessons':'Read and try the lesson'):b==='Drill'?'Practice round: '+s.topics.map(t=>TL[t]).join(', '):b==='Play'?'On your instrument: '+esc(s.task):'Today’s daily challenge'}</span>`).join('')}</div>`;
 const weeks=[];dated.forEach(s=>{const x=parseKey(s.date);const mon=new Date(x);mon.setDate(x.getDate()-((x.getDay()+6)%7));const k=todayKey(mon);let w=weeks.find(w=>w.k===k);if(!w)weeks.push(w={k,list:[]});w.list.push(s)});
 const TICK='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>';
 main.innerHTML=`${planNav('plan')}<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Learning plan · ${INST_NAME[INST()]} · ${['Beginner','Intermediate','Advanced'][LEVEL()]}</span><h1>Your learning schedule</h1><p class="lede">${seq.length} sessions on ${days.length} day${days.length===1?'':'s'} a week, ${mins} minutes each. Each is a short lesson, a practice round and something to play.</p></div>
  <div class="stack" style="gap:6px;min-width:160px"><span class="hint">${seq.length-todo.length} of ${seq.length} done</span><div class="meter"><i style="width:${pct}%"></i></div></div></div>
 <div class="stack">
 <div class="panel"><div class="row" style="gap:24px;align-items:flex-start"><div class="pickrow"><span class="eyebrow">Practice days</span><div class="pills">${[1,2,3,4,5,6,0].map(n=>`<button class="pill" data-day="${n}" aria-pressed="${days.includes(n)}">${DAYN[n]}</button>`).join('')}</div></div>
  <div class="pickrow"><span class="eyebrow">Minutes per session</span>${pillsHTML('mins',[['15','15'],['30','30'],['45','45'],['60','60']],String(mins))}</div></div>
  ${late?`<p class="callout">${late} session${late>1?'s are':' is'} overdue. <button class="btn small" id="restart">Reschedule from today</button></p>`:''}</div>
 ${next?`<section class="upnext"><span class="eyebrow">${next.date===today?'Today':next.date<today?'Overdue · '+fmt(next.date):'Up next · '+fmt(next.date)}</span><h2 style="font-size:1.6rem">${esc(next.t)}${next.sub?`: <span style="color:var(--muted)">${esc(next.sub)}</span>`:''}</h2>${blk(next)}
  <div class="row"><a class="btn" href="${next.href||'#learn-'+next.learn}">${next.href?'Open the song':'Open the lesson'}</a><button class="btn" id="drill">${ICON.play} Start practice round</button><button class="btn primary" data-done="${next.id}">Mark session done</button></div></section>`:`<section class="upnext"><h2>Plan complete</h2><p>You've finished every session for ${INST_NAME[INST()]} at this level. Move up a level in Settings to get the next plan.</p></section>`}
 ${weeks.map((w,i)=>`${i===2?`<details class="more"><summary>Show the full schedule (${weeks.slice(2).reduce((a,w)=>a+w.list.length,0)} more sessions)</summary>`:''}<div class="week"><span class="eyebrow">Week of ${fmt(w.k)}</span>${w.list.map(s=>`<div class="sess ${s.date===today?'today':''} ${s.date<today?'late':''}"><button class="tick" data-done="${s.id}" aria-pressed="false" aria-label="Mark ${esc(s.t)} done"></button><span class="sd">${fmt(s.date)}</span><span class="st"><b>${esc(s.t)}</b><span>${s.sub?esc(s.sub)+' · ':''}${s.topics.map(t=>TL[t]).join(', ')}</span></span><a class="btn small go" href="${s.href||'#learn-'+s.learn}">${s.href?'Song':'Lesson'}</a></div>`).join('')}</div>`).join('')}${weeks.length>2?'</details>':''}
 ${seq.length-todo.length?`<details class="more"><summary>Completed (${seq.length-todo.length})</summary><div class="week">${seq.filter(s=>done[s.id]).map(s=>`<div class="sess"><button class="tick" data-undo="${s.id}" aria-pressed="true" aria-label="Mark ${esc(s.t)} not done">${TICK}</button><span class="sd">Done</span><span class="st"><b>${esc(s.t)}</b><span>${s.topics.map(t=>TL[t]).join(', ')}</span></span><a class="btn small go" href="${s.href||'#learn-'+s.learn}">${s.href?'Song':'Lesson'}</a></div>`).join('')}</div></details>`:''}
 </div>`;
 main.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{const n=+b.dataset.day;const ds=days.includes(n)?days.filter(x=>x!==n):[...days,n];if(!ds.length)return;store.set('planDays',ds);viewPlan()});
 bindPills(main,(g,v)=>{store.set('planMins',+v);viewPlan()});
 main.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>{const D=store.get('planDone',{});D[b.dataset.done]=true;store.set('planDone',D);if(dated[0]&&dated[0].date<today)store.set('planStart',today);viewPlan()});
 main.querySelectorAll('[data-undo]').forEach(b=>b.onclick=()=>{const D=store.get('planDone',{});delete D[b.dataset.undo];store.set('planDone',D);viewPlan()});
 const rs=main.querySelector('#restart');if(rs)rs.onclick=()=>{store.set('planStart',today);viewPlan()};
 bindPA(main);const dr=main.querySelector('#drill');if(dr)dr.onclick=()=>{store.set('ptopics',next.topics);store.set('autostart',true);location.hash='#practice'}}

/* ---------- cloud: leaderboard + synced progress ---------- */
const CLOUD={db:null,user:null,uid:null,board:{},ready:false};
const SYNC_KEYS=['snd','profile','plog','goal','stats','hist','dailylog','chal','planDone','planDays','planMins','planStart','inst','level','tuning','lefty','capo','visited','ptopics','welcomed'];
const rawSet=(k,v)=>{try{localStorage.setItem('tc:'+k,JSON.stringify(v))}catch(e){}};
let pushT=null,pushBusy=Promise.resolve(),boardBusy=Promise.resolve();
store.hook=k=>{if(!SYNC_KEYS.includes(k))return;rawSet('localUpdated',Date.now());if(!CLOUD.db||!CLOUD.uid)return;clearTimeout(pushT);pushT=setTimeout(pushState,1500)};
function pushState(){if(!CLOUD.db||!CLOUD.uid)return;const v={};SYNC_KEYS.forEach(k=>{const x=store.get(k,undefined);if(x!==undefined)v[k]=x});const updated=store.get('localUpdated',Date.now());pushBusy=pushBusy.then(()=>CLOUD.db.doc('data/users/'+CLOUD.uid+'/state').set({updated,v})).catch(()=>{})}
function boardWrite(){if(!CLOUD.db||!CLOUD.uid)return;const log=store.get('dailylog',{});const days={};Object.keys(log).sort().slice(-60).forEach(k=>days[k]={score:log[k].score,at:log[k].at||0});const chal=store.get('chal',{});const ch={};Object.keys(chal).slice(-40).forEach(k=>ch[k]={score:chal[k].score,at:chal[k].at||0});
 const body={days,chal:ch,streak:streak(log),updated:Date.now()};boardBusy=boardBusy.then(()=>CLOUD.db.doc('board/'+CLOUD.uid).set(body)).catch(()=>{})}
function syncText(){return CLOUD.db&&CLOUD.uid?'Your progress, plan and settings are saved to your Claude account, so they follow you to other devices.':'Your progress is saved in this browser only.'}
async function cloudInit(){try{if(!window.claude||!window.claude.use){CLOUD.ready=true;fillCloud();return}
 const[db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);CLOUD.user=user;const uid=user?await user.id():null;
 if(db&&uid){CLOUD.db=db;CLOUD.uid=uid;
  try{const snap=await db.doc('data/users/'+uid+'/state').get();if(snap.exists){const d=snap.data();if((d.updated||0)>store.get('localUpdated',0)&&d.v){for(const k of SYNC_KEYS)if(k in d.v)rawSet(k,d.v[k]);rawSet('localUpdated',d.updated);syncHeader();route()}}else if(store.get('localUpdated',0))pushState()}catch(e){}
  let first=true;db.collection('board').onSnapshot(s=>{const b={};s.docs.forEach(x=>{b[x.id]=x.data()});CLOUD.board=b;if(first){first=false;if(!b[uid]&&Object.keys(store.get('dailylog',{})).length)boardWrite()}fillCloud()},()=>{})}
 }catch(e){}CLOUD.ready=true;fillCloud()}
function weekTotals(){const d=new Date();const keys=[];for(let i=0;i<7;i++){keys.push(todayKey(d));d.setDate(d.getDate()-1)}return Object.entries(CLOUD.board).map(([id,b])=>{let total=0,n=0;keys.forEach(k=>{if(b&&b.days&&b.days[k]){total+=b.days[k].score;n++}});return{id,total,n}}).filter(x=>x.n).sort((a,b)=>b.total-a.total)}
function lbList(rows,ps,val){return`<ol class="lb">${rows.map((x,i)=>`<li class="${x.id===CLOUD.uid?'me':''}"><span class="rk">${i+1}</span><img src="${esc((ps[x.id]&&ps[x.id].avatarUrl)||'')}" alt=""><span class="nm">${esc((ps[x.id]&&ps[x.id].name)||'Someone')}${x.id===CLOUD.uid?' (you)':''}</span>${val(x)}</li>`).join('')}</ol>`}
const LB_OFF='<p class="hint">Shared scores show here when you are signed in to Claude and the page is shared with you as a Contributor or higher. You can still copy your score into the group chat.</p>';
async function boardTodayHTML(){const head='<span class="eyebrow">Club leaderboard</span>';if(!CLOUD.ready)return head+'<p class="hint">Loading scores…</p>';if(!CLOUD.db)return head+LB_OFF;const today=todayKey();
 const rows=Object.entries(CLOUD.board).filter(([,d])=>d&&d.days&&d.days[today]).map(([id,d])=>({id,score:d.days[today].score,at:d.days[today].at||0,streak:d.streak||0})).sort((a,b)=>b.score-a.score||a.at-b.at);const week=weekTotals();
 const ids=[...new Set([...rows,...week].map(x=>x.id))];const ps=ids.length&&CLOUD.user?await CLOUD.user.profiles(ids):{};
 return`${head}<div class="lbcols"><div><h3>Today</h3>${rows.length?lbList(rows,ps,x=>`<span class="sc">${x.score}/10</span><span class="hint">${x.streak?x.streak+'-day streak':''}</span>`):'<p class="hint">Nobody has finished today\'s challenge yet.</p>'}</div>
 <div><h3>Last 7 days</h3>${week.length?lbList(week,ps,x=>`<span class="sc">${x.total} pts</span><span class="hint">${x.n} day${x.n>1?'s':''}</span>`):'<p class="hint">No scores this week yet.</p>'}</div></div>`}
async function boardChalHTML(code){const head='<span class="eyebrow">Challenge scores</span>';if(!CLOUD.ready)return head+'<p class="hint">Loading scores…</p>';if(!CLOUD.db)return head+LB_OFF;
 const rows=Object.entries(CLOUD.board).filter(([,d])=>d&&d.chal&&d.chal[code]).map(([id,d])=>({id,score:d.chal[code].score,at:d.chal[code].at||0})).sort((a,b)=>b.score-a.score||a.at-b.at);
 const ps=rows.length&&CLOUD.user?await CLOUD.user.profiles(rows.map(x=>x.id)):{};return head+(rows.length?lbList(rows,ps,x=>`<span class="sc">${x.score}/10</span>`):'<p class="hint">Nobody has finished this challenge yet.</p>')}
async function fillCloud(){const t=document.getElementById('lbtoday');if(t)t.innerHTML=await boardTodayHTML();const c=document.getElementById('lbchal');if(c)c.innerHTML=await boardChalHTML(c.dataset.code);const s=document.getElementById('syncnote');if(s)s.textContent=syncText()}
function copyBtn(btn,ta,text){btn.onclick=()=>{const fail=()=>{ta.focus();ta.select();btn.textContent='Selected: press Ctrl+C'};try{navigator.clipboard.writeText(text).then(()=>btn.textContent='Copied',fail)}catch(e){fail()}}}

/* ---------- challenges ---------- */
const CH_RE=/^ch-([0-2])-([a-z0-9]{4,10})-([a-z-]+)$/;
function chForm(){return`<form class="chform" novalidate><label for="chcode">Got a challenge code from a friend?</label><div class="row"><input id="chcode" autocomplete="off" spellcheck="false" placeholder="ch-1-k3x9p2-intervals"><button class="btn small">Open challenge</button></div><p class="hint" id="cherr" hidden>That code doesn't look right. It starts with ch- and has no spaces.</p></form>`}
function bindChForm(root){const f=root.querySelector('.chform');if(!f)return;f.addEventListener('submit',e=>{e.preventDefault();let v=f.querySelector('input').value.trim().toLowerCase();if(v.includes('#'))v=v.split('#').pop();if(CH_RE.test(v))location.hash='#'+v;else f.querySelector('#cherr').hidden=false})}
function makeChallenge(lv,topics){let tops=topics.filter(t=>DAILY_POOL.includes(t));if(!tops.length)tops=shuffle(Math.random,DAILY_POOL).slice(0,3);tops=tops.slice(0,8);const seed=Math.random().toString(36).slice(2,8).replace(/[^a-z0-9]/g,'a').padEnd(6,'x');return`ch-${lv}-${seed}-${tops.join('-')}`}
function viewChallenge(code){const m=CH_RE.exec(code);const tops=m?m[3].split('-').filter(t=>DAILY_POOL.includes(t)):[];if(!m||!tops.length){location.hash='#daily';return}const lv=+m[1];const done=store.get('chal',{})[code];
 main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Challenge · ${['Beginner','Intermediate','Advanced'][lv]}</span><h1>Same ten questions, who scores highest?</h1><p class="lede">Topics: ${tops.map(t=>TL[t]).join(', ')}. Everyone who opens this code gets exactly these questions.</p></div></div><div class="stack"><div id="cq"></div><section class="panel" id="lbchal" data-code="${code}"></section></div>`;
 const host=document.getElementById('cq');
 const result=(score,marks)=>{const txt=`I scored ${score}/10 on a Theory Club challenge. Can you beat it? Open Theory Club and enter this code: ${code}`;
  host.innerHTML=`<section class="qcard result"><span class="eyebrow">Your score</span><div class="big">${score}<span style="font-size:.45em;color:var(--muted)">/10</span></div>${marks.length?`<div class="dots">${marks.map(x=>`<i class="${x?'ok':''}"></i>`).join('')}</div>`:''}<p class="lede">Send this to your friends. The page's Share menu can also copy a link that opens this challenge directly.</p><textarea class="share" rows="3" readonly aria-label="Challenge message">${esc(txt)}</textarea><div class="row" style="justify-content:center"><button class="btn primary" id="ccopy">Copy message</button><a class="btn" href="#practice">Back to practice</a></div></section>`;
  copyBtn(host.querySelector('#ccopy'),host.querySelector('textarea'),txt)};
 if(done)result(done.score,done.marks||[]);
 else{host.innerHTML=`<section class="qcard result"><p class="lede">Ten questions. Some play sound, so turn your volume up first.</p><button class="btn primary" id="cgo">${ICON.play} Start the challenge</button></section>`;
  host.querySelector('#cgo').onclick=()=>{audio();const r=mulberry(hashStr(code));const qs=Array.from({length:10},()=>makeQ(pick(r,tops),r,lv));
   runQuiz(host,qs,{label:'Challenge',onDone:(score,marks)=>{const C=store.get('chal',{});C[code]={score,marks,at:Date.now()};store.set('chal',C);boardWrite();result(score,marks);fillCloud()}})}}
 fillCloud()}

/* ---------- weak spots ---------- */
function topicAcc(s){if(!s||!s.a)return null;const h=s.h&&s.h.length>=3?s.h:null;return h?h.reduce((a,b)=>a+b,0)/h.length:s.c/s.a}
function topicWeight(id){const s=store.get('stats',{})[id];if(!s||s.a<3)return 1.5;return .5+(1-topicAcc(s))*3}
function weightedPick(r,ids){const w=ids.map(topicWeight);let x=r()*w.reduce((a,b)=>a+b,0);for(let i=0;i<ids.length;i++){x-=w[i];if(x<=0)return ids[i]}return ids[ids.length-1]}
function weakest(n=3){const st=store.get('stats',{});const tried=TOPICS.filter(t=>st[t.id]&&st[t.id].a>=3&&topicPool().includes(t.id)).sort((a,b)=>topicAcc(st[a.id])-topicAcc(st[b.id])).map(t=>t.id);return tried.slice(0,n)}

/* ---------- progress ---------- */
function viewProgress(){const st=store.get('stats',{}),H=store.get('hist',{}),log=store.get('dailylog',{}),vis=store.get('visited',{}),done=store.get('planDone',{});
 const tot=Object.values(st).reduce((a,s)=>({a:a.a+s.a,c:a.c+s.c}),{a:0,c:0});const d=new Date();const days=[];for(let i=13;i>=0;i--){const x=new Date(d);x.setDate(d.getDate()-i);days.push(todayKey(x))}
 const mx=Math.max(10,...days.map(k=>H[k]?H[k].a:0));const lessons=myLessons();
 const rows=TOPICS.filter(t=>topicPool().includes(t.id)).map(t=>({t,s:st[t.id],acc:topicAcc(st[t.id])})).sort((a,b)=>(a.acc==null)-(b.acc==null)||(a.acc??0)-(b.acc??0));const weak=weakest();
 main.innerHTML=`${planNav('progress')}<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Progress</span><h1>How you're doing</h1><p class="hint" id="syncnote">${syncText()}</p></div></div>
 <div class="stack"><div class="tiles">${[[tot.a,'questions answered'],[tot.a?Math.round(tot.c/tot.a*100)+'%':'–','correct overall'],[streak(log),'day streak'],[Object.keys(log).length,'daily challenges'],[`${Object.keys(vis).length}/${lessons.length}`,'lessons opened'],[Object.keys(done).length,'plan sessions done']].map(([v,l])=>`<div class="tile"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
 ${milestonesHTML()}${practiceHTML()}<section class="panel"><h3>Last 14 days</h3>${days.some(k=>H[k]&&H[k].a)?'':'<p class="hint">No questions answered yet. Try the daily challenge.</p><!--'}<div class="bars" role="img" aria-label="Questions answered per day over the last 14 days">${days.map(k=>{const h=H[k]||{a:0,c:0};const x=parseKey(k);return`<div class="bar"><div class="col" style="height:${h.a/mx*100}%"><i style="height:${h.a?h.c/h.a*100:0}%"></i></div><span>${x.getDate()}</span></div>`}).join('')}</div><p class="hint"><span class="key k1"></span> correct <span class="key k2"></span> wrong, questions per day</p>${days.some(k=>H[k]&&H[k].a)?'':'-->'}</section>
 <section class="panel"><div class="row" style="justify-content:space-between"><h3>By topic, weakest first</h3>${weak.length?`<button class="btn primary small" id="weak">${ICON.play} Practise my weakest topics</button>`:''}</div>
 ${rows.some(r=>r.acc!=null)?'':'<!--'}<div class="scroll"><table class="tbl"><thead><tr><th>Topic</th><th>Accuracy</th><th>Answered</th><th></th></tr></thead><tbody>${rows.filter(r=>r.acc!=null).map(({t,s,acc})=>`<tr><td><b>${t.label}</b></td><td>${acc==null?'<span class="hint">Not tried</span>':`<div class="acc"><div class="meter"><i style="width:${Math.round(acc*100)}%;background:${acc<.6?'var(--bad)':acc<.8?'var(--root)':'var(--good)'}"></i></div><span class="num">${Math.round(acc*100)}%</span></div>`}</td><td class="num">${s?s.a:0}</td><td><button class="btn small" data-pt="${t.id}">Practise</button></td></tr>`).join('')}</tbody></table></div>${rows.some(r=>r.acc!=null)?'':'-->'}${rows.some(r=>r.acc==null)?`<div class="untried"><span class="hint">Not tried yet</span>${rows.filter(r=>r.acc==null).map(({t})=>`<button class="pill" data-pt="${t.id}">${t.label}</button>`).join('')}</div>`:''}<p class="hint">Accuracy uses your last 20 answers per topic.</p></section></div>`;
 bindPills(main,(g,v)=>{if(g==='goal'){store.set('goal',+v);viewProgress()}});const go=ids=>{store.set('ptopics',ids);store.set('autostart',true);location.hash='#practice'};
 main.querySelectorAll('[data-pt]').forEach(b=>b.onclick=()=>go([b.dataset.pt]));const w=main.querySelector('#weak');if(w)w.onclick=()=>go(weak)}
function planNav(cur){return`<nav class="subnav" aria-label="Plan sections"><a class="pill" href="#plan" ${cur==='plan'?'aria-current="page"':''}>Schedule</a><a class="pill" href="#progress" ${cur==='progress'?'aria-current="page"':''}>Progress</a></nav>`}

/* ---------- learn: strumming + tab ---------- */
const STRUMS=[{id:'quarters',name:'Down on every beat',slots:'D.D.D.D.',desc:'Start here: four even down-strums per bar.'},{id:'eighths',name:'Down-up eighths',slots:'DUDUDUDU',desc:'Keep your hand moving down and up like a pendulum.'},{id:'pop',name:'Campfire strum',slots:'D.DU.UDU',desc:'Down, down-up, up-down-up. Fits most pop and folk songs. On the gap your hand still moves, it just misses the strings.'},{id:'rock',name:'Driving rock',slots:'D.DUD.DU',desc:'Leans on the beats. Good for faster songs.'},{id:'skank',name:'Off-beat skank',slots:'.U.U.U.U',desc:'Only the “and”s, short and choppy. Reggae and ska.'},{id:'waltz',name:'Waltz (3/4)',slots:'D.DUDU',desc:'Three beats per bar: down, down-up, down-up.'}];
const STRUM_PROGS=[['G|maj','C|maj','D|maj','E|min'],['C|maj','G|maj','A|min','F|maj7'],['A|min','F|maj7','C|maj','G|maj'],['E|maj','A|maj','B|7','E|maj'],['D|maj','A|maj','B|min','G|maj']];
PAGES.strum=el=>{let sid='pop',pi=0,bpm=80,playing=false;const S=()=>STRUMS.find(x=>x.id===sid);
 const csym=k=>{const[R,t]=k.split('|');return chordSym(R,t)};
 const render=()=>{const st=S(),prog=STRUM_PROGS[pi];
  el.innerHTML=`<span class="eyebrow">Guitar</span><h1>Strumming patterns</h1><p>Your strumming hand keeps moving down and up in time, even when it doesn't hit the strings. Down-strums land on the beats (1 2 3 4) and up-strums on the “and”s in between. Pick a pattern, pick some chords, and play along.</p>
  <div class="panel"><div class="pickrow"><span class="eyebrow">Pattern</span>${pillsHTML('s',STRUMS.map(x=>[x.id,x.name]),sid)}</div><p>${st.desc}</p>
  <div class="strum">${[...st.slots].map((c,i)=>`<div class="sl ${i%2?'':'beat'}" data-i="${i}"><span class="ar ${c==='D'?'d':c==='U'?'u':'x'}" aria-label="${c==='D'?'down':c==='U'?'up':'miss'}">${c==='D'?'↓':c==='U'?'↑':'·'}</span><span class="ct">${i%2?'&':i/2+1}</span></div>`).join('')}</div>
  <div class="pickrow"><span class="eyebrow">Chords, one per bar</span>${pillsHTML('p',STRUM_PROGS.map((p,i)=>[String(i),p.map(csym).join(' ')]),String(pi))}</div>
  <div class="boxes" id="sbx">${prog.map((k,i)=>{const[R,t]=k.split('|');return`<button data-b="${i}">${chordBox(guitarShape(R,t),parse(R).pc,null,true)}${csym(k)}</button>`}).join('')}</div>
  <div class="row"><button class="btn primary small" id="pl">${playing?'■ Stop':ICON.play+' Play along'}</button><label class="tempo" for="sbpm">Tempo <input type="range" id="sbpm" min="50" max="140" value="${bpm}"> <span id="sbv">${bpm}</span> BPM</label></div></div>
  <div class="cols"><div class="mini"><h4>Loose wrist</h4><p class="o">Strum mostly from the wrist with a relaxed grip on the pick. Tension makes you speed up.</p></div><div class="mini"><h4>Never stop the arm</h4><p class="o">The down-up motion carries on through the gaps. That's what keeps the rhythm steady.</p></div><div class="mini"><h4>Change early</h4><p class="o">Start moving to the next chord on the last “and” of the bar; a few open strings there are fine.</p></div></div>`;
  bindPills(el,(g,v)=>{if(g==='s')sid=v;else pi=+v;render()});
  el.querySelector('#sbpm').oninput=e=>{bpm=+e.target.value;el.querySelector('#sbv').textContent=bpm};
  el.querySelectorAll('#sbx button').forEach(b=>b.onclick=()=>{const[R,t]=STRUM_PROGS[pi][+b.dataset.b].split('|');play(shapeMidis(guitarShape(R,t).frets),{mode:'strum'})});
  el.querySelector('#pl').onclick=()=>{if(playing){stopLoop();playing=false;render();return}playing=true;render();
   startLoop(()=>{const n=S().slots.length;return{steps:n,per:2,bpm,rows:{clickhi:'x'+'.'.repeat(n-1),click:[...'.'.repeat(n)].map((_,i)=>i&&i%2===0?'x':'.').join('')}}},
    {extra:(abs,t,sd)=>{const sl=S().slots,n=sl.length,c=sl[abs%n];if(c==='.')return;const pr2=STRUM_PROGS[pi];const[R,T]=pr2[Math.floor(abs/n)%pr2.length].split('|');let ms=shapeMidis(guitarShape(R,T).frets);if(c==='U')ms=ms.slice(-4).reverse();ms.forEach((m,i)=>tone(m,t+i*.011,sd*2.4,c==='D'?.2:.12,'guitar'))},
     onStep:(a,p)=>{const s=a%p.steps;el.querySelectorAll('.sl').forEach(x=>x.classList.toggle('cur',+x.dataset.i===s));if(s===0){const b=Math.floor(a/p.steps)%STRUM_PROGS[pi].length;el.querySelectorAll('#sbx button').forEach((x,j)=>x.classList.toggle('sel',j===b))}}})}};
 render()};
PAGES.tab=el=>{const bass=INST()==='bass';const S=bass?BSTR():GSTR();
 const RIFF=bass?[{s:0,f:5},{s:0,f:5},{s:0,f:8},{s:1,f:5},{s:1,f:7},{s:0,f:8},{s:0,f:7},{s:0,f:5}]:[{s:1,f:0},{s:2,f:2},{s:3,f:2},{s:2,f:2},{s:1,f:3},{s:2,f:0},{s:2,f:2},{s:1,f:0}];
 const CHORD=bass?[[{s:0,f:3},{s:1,f:5}]]:[[{s:0,f:3},{s:1,f:2},{s:2,f:0},{s:3,f:0},{s:4,f:0},{s:5,f:3}]];
 const SYM=[['0','Open string','Play the string without fretting it.'],['h','Hammer-on','Pick the first note, then tap a finger down for the second.'],['p','Pull-off','Pick the higher note, then flick your finger off to sound the lower one.'],['/','Slide up','Slide your finger up the string to the next fret number.'],['\\','Slide down','Slide down to the next fret number.'],['b','Bend','Push the string sideways to raise the pitch.'],['~','Vibrato','Wobble the note by shaking the string slightly.'],['x','Muted note','Rest a finger on the string for a percussive click.']];
 el.innerHTML=`<span class="eyebrow">${bass?'Bass':'Guitar'}</span><h1>Reading tab</h1><p>Tab (tablature) is the quickest way to write ${bass?'bass':'guitar'} music. Each line is a string, with the thinnest string at the top, and each number is the fret to play. Read left to right; numbers in the same column are played together.</p>
 <div class="panel"><h3>A short riff</h3><div class="scroll" id="riff">${tabSVG(S,RIFF)}</div><div class="row">${pbtn('pr','Play the riff')}</div><p class="hint">Each number lights up as it plays. ${bass?'It starts on the 5th fret of the E string, which is A.':'It starts on the open A string.'}</p></div>
 <div class="panel"><h3>${bass?'Two notes at once':'A chord in tab'}</h3><div class="scroll">${tabSVG(S,CHORD)}</div><p>${bass?'Stacked numbers ring together: here G on the E string and D on the A string, a root and 5th.':'One column, six numbers: that is an open G chord, read from the low E string (bottom) up.'}</p><div class="row">${pbtn('pc','Hear it')}</div></div>
 <h3>Symbols you'll see</h3><div class="scroll"><table class="tbl"><thead><tr><th>Symbol</th><th>Name</th><th>What to do</th></tr></thead><tbody>${SYM.map(([a,b,c])=>`<tr><td class="formula" style="font-size:1.1rem">${esc(a)}</td><td><b>${b}</b></td><td>${c}</td></tr>`).join('')}</tbody></table></div>
 <p class="callout">Most tab doesn't show rhythm. Listen to the recording while you read, or look for tab that has rhythm marks above the numbers.</p>`;
 el.querySelector('#pr').onclick=()=>{stopSeq();const box=el.querySelector('#riff');RIFF.forEach((p,j)=>seqTimers.push(setTimeout(()=>{play([S[p.s]+p.f],{mode:'seq',dur:.6});box.querySelectorAll('[data-c]').forEach(x=>x.classList.toggle('hi',+x.dataset.c===j))},j*380)));seqTimers.push(setTimeout(()=>box.querySelectorAll('.hi').forEach(x=>x.classList.remove('hi')),RIFF.length*380+300))};
 el.querySelector('#pc').onclick=()=>play(CHORD[0].map(p=>S[p.s]+p.f),{mode:'strum'})};

PAGES.caged=el=>{const bass=INST()==='bass';const S=bass?STR4:STR;let key='C',q='maj',shape='C',penta=false;
 const BANDCOL=['b0','b1','b2','b3','b4'];
 const render=()=>{const t=q==='maj'?'maj':'min';const pc=parse(key).pc;const names={};chordNotes(key,t).forEach((n,i)=>names[(pc+CH[t].st[i][0])%12]=n);
  const all=CAGED_ORDER.map(x=>cagedShape(key,q,x)).sort((a,b)=>a.k-b.k);const order=all.map(x=>x.shape);
  let view,info;
  if(shape==='all'){const map={};Object.entries(names).forEach(([p,n])=>map[p]={name:n,root:+p===pc});const bands=all.map((sh,i)=>{const[a,b]=cagedWindow(sh);return{from:a,to:b,label:sh.shape,cls:BANDCOL[CAGED_ORDER.indexOf(sh.shape)]}});
   view=fretboard({strings:S,map,frets:15,bands});info=`<p>All five shapes for ${chordSym(key,t)}, from the nut upwards: <b>${order.join(' → ')}</b>. Each shaded zone is one shape, and neighbouring shapes share notes where they overlap.</p>`}
  else{const sh=cagedShape(key,q,shape);const spots=cagedSpots(key,q,sh,S,penta);const[a,b]=cagedWindow(sh);const rs=bass?CAGED_BASS_ROOT[shape]:CAGED_ROOT[shape].lab;const rf=sh.k+CAGED_ROOT[shape].o;
   view=`<div class="split"><div class="stack" style="gap:8px;min-width:0"><h3>${chordSym(key,t)}, ${shape} shape</h3><p>Root on the ${rs}, fret ${rf}. ${sh.k?`That's the open ${shape}${q==='min'?'m':''} chord moved up ${sh.k} fret${sh.k>1?'s':''}${bass?'':`, with your first finger barring fret ${sh.k}`}.`:`At this key it's the open ${shape}${q==='min'?'m':''} chord itself.`}</p><div class="row">${pbtn('cs',bass?'Play the arpeggio':'Strum it')}${bass?'':pbtn('ca','Arpeggio')}</div></div>${bass?'':`<div class="stack" style="gap:4px;align-items:center">${chordBox(sh,pc,names)}<span class="hint">${shape} shape</span></div>`}</div>${fretboard({strings:S,spots,frets:Math.max(12,b+2)})}`;
   info=''}
  el.innerHTML=`<span class="eyebrow">${bass?'Bass':'Guitar'}</span><h1>The CAGED system</h1><p>Every major chord can be played with five shapes, borrowed from the open chords C, A, G, E and D. Slide those shapes up the neck and they join together in that order, covering the whole fretboard. ${bass?'On bass you use the same five zones to find arpeggios and scale positions anywhere on the neck.':'Learn them and you can play any chord, arpeggio or scale in any position.'}</p>
  <div class="panel"><div class="pickrow"><span class="eyebrow">Chord</span>${pillsHTML('key',keyItems('M'),key)}</div>
  <div class="row" style="gap:20px">${pillsHTML('q',[['maj','Major'],['min','Minor']],q)}${pillsHTML('pen',[['0','Chord tones'],['1','Add pentatonic']],penta?'1':'0')}</div>
  <div class="pickrow"><span class="eyebrow">Shape</span>${pillsHTML('shape',[...order.map(x=>[x,x+' shape']),['all','Whole neck']],shape)}</div>${info}${view}
  <p class="hint">Orange notes are the root.${penta?' Hollow notes are the pentatonic scale around the shape.':''}${bass?' Shapes are shown on the four bass strings.':''}</p></div>
  <div class="cols"><div class="mini"><h4>Find the root first</h4><p class="o">C and A shapes have their root on the 5th string, G and E on the 6th, D on the 4th. Find the root note, then build the shape around it.</p></div><div class="mini"><h4>Learn E and A first</h4><p class="o">They're the barre chords you already know. Then add C, G and D one at a time.</p></div><div class="mini"><h4>Practise in one place</h4><p class="o">Pick a spot like fret 5 and play every chord in a song using whichever shape is nearest.</p></div></div>
  <div class="row"><button class="btn primary" id="cq">${ICON.play} Practise the CAGED system</button></div>`;
  bindPills(el,(g,v)=>{if(g==='key')key=v;else if(g==='q')q=v;else if(g==='pen')penta=v==='1';else shape=v;render()});
  const sh=shape==='all'?null:cagedShape(key,q,shape);
  const cs=el.querySelector('#cs');if(cs)cs.onclick=()=>{if(bass){const sp=cagedSpots(key,q,sh,S,false);play(sp.map(x=>S[x.s]+x.f).sort((a,b)=>a-b),{mode:'seq',gap:.28})}else play(shapeMidis(sh.frets),{mode:'strum'})};
  const ca=el.querySelector('#ca');if(ca)ca.onclick=()=>play(shapeMidis(sh.frets).sort((a,b)=>a-b),{mode:'seq',gap:.25});
  const cb=el.querySelector('.split .cbox');if(cb)cb.onclick=()=>play(shapeMidis(sh.frets),{mode:'strum'});
  el.querySelector('#cq').onclick=()=>{store.set('ptopics',['caged']);store.set('autostart',true);location.hash='#practice'}};
 render()};

/* ---------- tools ---------- */
const TOOLS=[['jam','Jam along'],['online','Jam online'],['read','Sight-reading'],['findnote','Find the note'],['slow','Slow down a song'],['transcribe','Play to tab'],['metronome','Metronome'],['tuner','Tuner'],['finder','Chord finder']];
const TOOLPAGES={};
function viewTools(id){if(id&&id.startsWith('online-')){JO.pendingCode=id.slice(7).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5);id='online'}if(!TOOLS.find(t=>t[0]===id))id='jam';const T=TOOLS.find(t=>t[0]===id);
 main.innerHTML=`<nav class="subnav" aria-label="Tools">${TOOLS.map(([k,t])=>`<a class="pill" href="#tools-${k}" ${k===id?'aria-current="page"':''}>${t}</a>`).join('')}</nav><div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Tools</span><h1>${T[1]}</h1></div></div><div class="lbody" id="tb"></div>`;
 TOOLPAGES[id](document.getElementById('tb'))}
const JAMS=[{id:'rock',name:'Rock',groove:'rock',mode:'major',prog:[[1],[5],[6],[4]],scale:'majpent',bpm:100,tip:'Solo with the major pentatonic. Land on the root of each chord as it changes.'},
 {id:'blues',name:'12-bar blues',groove:'shuffle',mode:'major',prog:PROG.find(p=>p.id==='blues').ch,scale:'blues',bpm:88,tip:'Use the blues scale from the key note. The ♭5 sounds great as a passing note, not a resting one.'},
 {id:'minor',name:'Minor rock',groove:'rock',mode:'minor',prog:[[1],[6],[3],[7]],scale:'minpent',bpm:92,tip:'Minor pentatonic box 1 fits all four chords. Start and end phrases on the root.'},
 {id:'funk',name:'Funk vamp',groove:'funk',mode:'minor',prog:[[1,'m7'],[1,'m7']],scale:'dorian',bpm:96,tip:'One chord, so you can relax and explore. Dorian adds a bright 6th to minor.'},
 {id:'ballad',name:'Slow ballad',groove:'rock',mode:'major',prog:[[1],[6],[4],[5]],scale:'major',bpm:68,tip:'Play fewer notes and hold them longer. Try targeting the 3rd of each chord.'},
 {id:'bossa',name:'Bossa nova',groove:'bossa',mode:'major',prog:[[2,'m7'],[5,'7'],[1,'maj7'],[1,'maj7']],scale:'major',bpm:130,tip:'The major scale fits all of it. Over the 7 chord, try leaning on its 3rd.'}];


TOOLPAGES.tuner=el=>{let timer=null,cur=null;const inst=INST();
 const sets=[['Guitar',GSTR(),'guitar'],['Bass',BSTR(),'bass']];if(inst==='bass')sets.reverse();
 const stop=()=>{clearInterval(timer);timer=null;cur=null;el.querySelectorAll('.tstr').forEach(b=>b.setAttribute('aria-pressed','false'))};
 el.innerHTML=`${tunerLiveHTML()}<p>Play a reference note, then play the same string and turn its tuning peg until the two sound the same. When they're close you'll hear a slow wobble; tune until it disappears. Tuning: <b>${TUNE().name}</b> (change it in Settings).</p>
 ${sets.map(([nm,S,tb])=>`<div class="panel"><h3>${nm}</h3><div class="tstrs">${S.map((m,i)=>`<button class="tstr" data-m="${m}" data-tb="${tb}" aria-pressed="false"><b>${SHARPN[m%12]}<sub>${Math.floor(m/12)-1}</sub></b><span>String ${S.length-i}</span></button>`).join('')}</div></div>`).join('')}
 <div class="panel"><h3>Reference A</h3><p class="hint">A4 = 440 Hz, the note bands and orchestras tune to.</p><div class="tstrs"><button class="tstr" data-m="69" data-tb="piano" aria-pressed="false"><b>A<sub>4</sub></b><span>440 Hz</span></button></div></div>
 <div class="cols"><div class="mini"><h4>The 5th-fret method</h4><p class="o">Once the low string is right, fret 5 on each string matches the next string open, except fret 4 on the G string, which matches B.</p></div><div class="mini"><h4>Tune up to the note</h4><p class="o">If you're sharp, drop below the note and come back up. Strings hold their tuning better that way.</p></div>${IN_CLAUDE()?'<div class="mini"><h4>About plugging in</h4><p class="o">Inside Claude this page can\'t use your microphone, so it can\'t show a needle. The website version can. Tuning by ear also trains your ear.</p></div>':'<div class="mini"><h4>Plugged in?</h4><p class="o">Use the meter at the top. Play one string at a time and let it ring.</p></div>'}</div>`;bindTunerLive(el);
 el.querySelectorAll('.tstr').forEach(b=>b.onclick=()=>{const m=+b.dataset.m;if(cur===b){stop();return}stop();cur=b;b.setAttribute('aria-pressed','true');const go=()=>play([m],{mode:'seq',dur:2.2,timbre:b.dataset.tb});go();timer=setInterval(go,2000)});
 const obs=new MutationObserver(()=>{if(!document.body.contains(el)){stop();obs.disconnect()}});obs.observe(document.getElementById('main'),{childList:true})};
TOOLPAGES.finder=el=>{const inst=INST();
 if(inst==='piano'){let sel=new Set([60,64,67]);const render=()=>{const ms=[...sel].sort((a,b)=>a-b);const res=identify(ms);const on={};ms.forEach(m=>on[m]=m===ms[0]?'root':'on');
   el.innerHTML=`<p>Tap keys to build a chord and the finder names it. Tap a key again to remove it. The lowest key counts as the bass note.</p><div class="panel">${resHTML(res,ms)}<div class="row">${pbtn('fp','Play it')}<button class="btn small" id="fc">Clear</button></div>${keyboard({start:48,end:84,on,labels:{48:'C3',60:'C4',72:'C5'}})}</div>`;
   el.querySelector('.kb').addEventListener('keypick',e=>{const m=e.detail;sel.has(m)?sel.delete(m):sel.add(m);render()});el.querySelector('#fp').onclick=()=>play(ms);el.querySelector('#fc').onclick=()=>{sel.clear();render()}};render();return}
 const S=inst==='bass'?BSTR():GSTR();let fr=inst==='bass'?[3,5,null,null]:[null,3,2,0,1,0];
 const render=()=>{const ms=fr.map((f,i)=>f==null?null:S[i]+f+CAPO()).filter(x=>x!=null);const res=identify(ms);const spots=fr.map((f,i)=>f==null?null:{s:i,f,name:SHARPN[(S[i]+f+CAPO())%12],root:false}).filter(Boolean);
  el.innerHTML=`<p>Tap one fret per string, or a fret on the left of the nut for an open string. Tap the same spot again to mute that string. The finder names the chord${CAPO()?` you hear with the capo on fret ${CAPO()}`:''}.</p>
  <div class="panel">${resHTML(res,ms)}<div class="row">${pbtn('fp','Strum it')}<button class="btn small" id="fc">Clear</button></div><div id="fbx">${fretboard({strings:S,all:true,spots})}</div>
  <div class="strset">${S.map((m,i)=>`<span>${SHARPN[m%12]}: <b>${fr[i]==null?'×':fr[i]}</b></span>`).join('')}</div>${inst!=='bass'&&S.length===6?`<div style="display:flex;justify-content:center">${chordBox({frets:fr,barre:null},ms.length?ms.reduce((a,b)=>a<b?a:b)%12:-1,null)}</div>`:''}</div>`;
  el.querySelector('#fbx').addEventListener('click',e=>{const g=e.target.closest('.fd');if(!g||g.dataset.s==null)return;const s=+g.dataset.s,f=+g.dataset.f;fr[s]=fr[s]===f?null:f;render()});
  el.querySelector('#fp').onclick=()=>play(ms,{mode:inst==='bass'?'seq':'strum',gap:.3});el.querySelector('#fc').onclick=()=>{fr=fr.map(()=>null);render()}};render()};
function resHTML(res,ms){const notes=[...new Set(ms.map(m=>m%12))].map(pc=>pr(RN[pc]));return`<div class="found">${res.length?`<div><span class="eyebrow">This is</span><h2>${res[0].name}</h2><p class="hint">${res[0].desc}</p></div>${res.length>1?`<div><span class="eyebrow">Could also be named</span><p>${res.slice(1).map(x=>`<b>${x.name}</b>`).join(' · ')}</p></div>`:''}`:`<div><span class="eyebrow">This is</span><h2>${ms.length?'Not a chord I know':'Nothing yet'}</h2><p class="hint">${ms.length<2?'Add at least two different notes.':'Try removing a note.'}</p></div>`}<div><span class="eyebrow">Notes</span><p>${notes.join(' ')||'–'}</p></div></div>`}

/* ---------- songs ---------- */
const SONGS={
 'progressions:pop':[['Let It Be','The Beatles','Verse and chorus use I–V–vi–IV'],['Don’t Stop Believin’','Journey','The intro loop is I–V–vi–IV'],['With or Without You','U2','The same four chords all song'],['Someone Like You','Adele','The piano part loops I–V–vi–IV']],
 'progressions:fifties':[['Stand By Me','Ben E. King','The whole song is I–vi–IV–V'],['Every Breath You Take','The Police','Verses follow I–vi–IV–V'],['Earth Angel','The Penguins','Classic doo-wop changes']],
 'progressions:canon':[['Canon in D','Johann Pachelbel','Where the progression comes from'],['Basket Case','Green Day','The verse uses the same chord sequence'],['Graduation (Friends Forever)','Vitamin C','Borrows the Canon directly']],
 'progressions:jazz':[['Autumn Leaves','Joseph Kosma','Chains of ii–V–I'],['Fly Me to the Moon','Bart Howard','ii–V–I moving around the circle']],
 'progressions:blues':[['Johnny B. Goode','Chuck Berry','Rock-and-roll 12-bar blues'],['Hound Dog','Elvis Presley','Classic 12-bar form'],['Pride and Joy','Stevie Ray Vaughan','A shuffle 12-bar in E']],
 'progressions:epic':[['Zombie','The Cranberries','Em–C–G–D is i–VI–III–VII'],['Save Tonight','Eagle-Eye Cherry','Am–F–C–G throughout']],
 'progressions:andalusian':[['Hit the Road Jack','Ray Charles','Am–G–F–E all the way through'],['Runaway','Del Shannon','The verse walks down Am–G–F–E'],['Walk Don’t Run','The Ventures','Built on the falling cadence']],
 'progressions:minjazz':[['Autumn Leaves','Joseph Kosma','A minor ii–V–i closes each section'],['Blue Bossa','Kenny Dorham','Minor ii–V–i in C minor']],
 'modes:ionian':[['Let It Be','The Beatles','A plain major-scale melody'],['Do-Re-Mi','The Sound of Music','Sings the scale itself']],
 'modes:dorian':[['Oye Como Va','Santana','An Am7–D9 vamp in A Dorian'],['So What','Miles Davis','D Dorian, then E♭ Dorian'],['Scarborough Fair','Traditional','The melody is Dorian']],
 'modes:mixolydian':[['Sweet Home Alabama','Lynyrd Skynyrd','D–C–G: the ♭7 chord gives it away'],['Norwegian Wood','The Beatles','The melody uses the ♭7']],
 'modes:lydian':[['The Simpsons Theme','Danny Elfman','Opens on the ♯4'],['Flying in a Blue Dream','Joe Satriani','A Lydian showcase']],
 'modes:aeolian':[['All Along the Watchtower','Bob Dylan / Jimi Hendrix','An Am–G–F loop'],['Zombie','The Cranberries','Natural minor throughout']],
 'world:minpent':[['Stairway to Heaven (solo)','Led Zeppelin','An A minor pentatonic solo'],['Back in Black (riff)','AC/DC','E minor pentatonic with open strings']],
 'world:majpent':[['My Girl','The Temptations','The famous riff is major pentatonic'],['Amazing Grace','Traditional','The melody uses only five notes']],
 'world:blues':[['Smoke on the Water','Deep Purple','The riff adds the ♭5 blue note'],['Sunshine of Your Love','Cream','A riff built on the blues scale']],
 'world:in':[['Sakura Sakura','Traditional Japanese','A classic In-scale melody']],
 'world:hijaz':[['Misirlou','Dick Dale','Surf rock with a Middle Eastern scale'],['Hava Nagila','Traditional','A Freygish (Phrygian dominant) melody']],
 'world:double':[['Misirlou','Dick Dale','Often played with both 1½-step gaps']],
 'world:wholetone':[['Voiles','Claude Debussy','Almost entirely whole tone'],['You Are the Sunshine of My Life','Stevie Wonder','The intro uses whole-tone chords']],
 'drums:rock':[['Back in Black','AC/DC','A straight rock beat with hi-hat eighths']],
 'drums:disco':[['Stayin’ Alive','Bee Gees','Kick on every beat, open hats'],['Billie Jean','Michael Jackson','Four-on-the-floor kick under the groove']],
 'drums:half':[['Rosanna','Toto','The famous half-time shuffle']],
 'drums:funk':[['Superstition','Stevie Wonder','The sixteenth-note hi-hat intro'],['Cissy Strut','The Meters','A busy kick and ghost notes']],
 'drums:shuffle':[['Pride and Joy','Stevie Ray Vaughan','A driving blues shuffle'],['La Grange','ZZ Top','A boogie shuffle'],['Rosanna','Toto','The half-time version']],
 'drums:bossa':[['The Girl from Ipanema','Antônio Carlos Jobim','The classic bossa nova'],['Corcovado','Antônio Carlos Jobim','A gentle bossa groove']],
 'drums:onedrop':[['Is This Love','Bob Marley & the Wailers','One drop with the kick on 3'],['Stir It Up','Bob Marley & the Wailers','A laid-back one drop']],
 'drums:jazz':[['Take the “A” Train','Duke Ellington','A classic swing ride pattern'],['Sing, Sing, Sing','Benny Goodman','Swing with a famous tom groove']],
 'drums':[['Wipe Out','The Surfaris','A drum break full of single strokes']],
 'rhythm':[['Piano Man','Billy Joel','A 3/4 waltz feel'],['House of the Rising Sun','The Animals','Felt in 6/8'],['Take Five','Dave Brubeck Quartet','5/4'],['Money','Pink Floyd','7/4'],['Mission: Impossible Theme','Lalo Schifrin','5/4']],
 'bass:roots':[['Blitzkrieg Bop','Ramones','Pumping root eighths']],
 'bass:r5':[['Folsom Prison Blues','Johnny Cash','Classic root–5th country bass']],
 'bass:r58':[['I Will Survive','Gloria Gaynor','A root–octave disco bounce'],['Le Freak','Chic','Octave-jumping disco bass']],
 'bass:walk':[['Fly Me to the Moon','Bart Howard','Walking bass over ii–V–I'],['Autumn Leaves','Joseph Kosma','A standard walking practice tune']],
 'circle':[['Fly Me to the Moon','Bart Howard','The chords move round the circle'],['Autumn Leaves','Joseph Kosma','A chain of 4ths'],['I Will Survive','Gloria Gaynor','Descends around the circle']],
 'dominant':[['Johnny B. Goode','Chuck Berry','Dominant 7ths in a 12-bar'],['Purple Haze','Jimi Hendrix','The E7♯9 “Hendrix chord”']],
 'chords':[['Free Fallin’','Tom Petty','Sus4 chords colour the riff'],['Something','The Beatles','C to Cmaj7 to C7'],['Knockin’ on Heaven’s Door','Bob Dylan','Simple major and minor triads']],
 'shapes':[['Knockin’ on Heaven’s Door','Bob Dylan','G, D, Am and C open chords'],['Horse with No Name','America','Two easy open chords'],['Creep','Radiohead','Barre chord practice: B and Cm']],
 'caged':[['Little Wing','Jimi Hendrix','Decorates chord shapes up the neck'],['The Wind Cries Mary','Jimi Hendrix','Chord embellishments from moving shapes']],
 'strum':[['Knockin’ on Heaven’s Door','Bob Dylan','The campfire strum fits'],['Riptide','Vance Joy','Busy down-up strumming'],['Three Little Birds','Bob Marley & the Wailers','The off-beat skank']],
 'tab':[['Smoke on the Water','Deep Purple','A classic first riff'],['Seven Nation Army','The White Stripes','A riff on one string'],['Iron Man','Black Sabbath','A power-chord riff']],
 'notes':[['Ode to Joy','Ludwig van Beethoven','In Play along: read it on the staff'],['Twinkle Twinkle Little Star','Traditional','In Play along: a first melody']],
 'scales:major':[['Do-Re-Mi','The Sound of Music','Sings the major scale'],['Joy to the World','Traditional','Opens with a falling major scale']],
 'scales:natural':[['All Along the Watchtower','Bob Dylan / Jimi Hendrix','Natural minor'],['Zombie','The Cranberries','Natural minor throughout']],
 'scales:harmonic':[['Hava Nagila','Traditional','Uses the harmonic minor sound from its 5th note']]};
SONGS['solo']=SONGS['world:minpent'].concat(SONGS['world:majpent'],SONGS['modes:dorian']);SONGS['charts']=SONGS['drums:rock'].concat(SONGS['drums:funk'],SONGS['drums:disco']);SONGS['fretboard']=SONGS['world:minpent'].concat(SONGS['world:blues']);
const PA_MAP={};
function songsFor(topic,sub){if(topic==='intervals')return[];if(topic==='intervals_')return IVL.filter(x=>x.song).map(x=>[x.song.replace(/^the /,'').replace(/^./,c=>c.toUpperCase()),x.n,'The first two notes make this interval']);
 if(topic==='progressions'){const out=[];PROG.filter(p=>!sub||p.mode===sub).forEach(p=>(SONGS['progressions:'+p.id]||[]).forEach(s=>out.push([s[0],s[1],`${p.name}: ${s[2]}`])));return out}
 return SONGS[topic+':'+sub]||SONGS[topic]||[]}
function songsHTML(topic,sub){const list=songsFor(topic,sub).slice(0,8);const inst=INST();const word={guitar:'guitar',bass:'bass',piano:'piano',drums:'drum'}[inst];const pa=PA_MAP[topic];
 if(!list.length&&!pa)return'';
 return`<section class="songs"><h3>Hear it in songs</h3>${list.length?`<div class="schips">${list.map(([t,a,n])=>`<a class="schip" href="https://www.youtube.com/results?search_query=${encodeURIComponent(t.replace(/\s*\(.*?\)\s*/g,' ')+' '+a.split(' / ')[0]+' '+word+' lesson')}" target="_blank" rel="noopener" title="${esc(n)}"><b>${esc(t)}</b> <span>${esc(a)}</span></a>`).join('')}</div>`:''}
 ${pa?`<div class="row"><button class="btn" data-pa="${pa}">${ICON.play} Play along with an exercise</button><span class="hint">${inst==='drums'?'Drum chart':inst==='piano'?'Staff':'Tab or staff'}, metronome and count-in.</span></div>`:''}</section>`}
function setSongs(topic,sub){const el=document.getElementById('songs');if(!el)return;el.innerHTML=songsHTML(topic,sub);bindPA(el)}
function bindPA(root){root.querySelectorAll('[data-pa]').forEach(b=>b.onclick=()=>{store.set('paPreset',b.dataset.pa);location.hash='#tools-play'})}
/* ---------- instrument input (website version) ---------- */
const INPUT={stream:null,src:null,an:null,buf:null,raf:0,active:false,samples:[],onsets:[],env:0,lastOnset:0,level:0,midi:null,cents:0,hz:0,frame:0,dev:store.get('indev',null),lat:+store.get('inlat',0)||0,listeners:new Set()};
function detectPitch(buf,sr){const N=1024;let e0=0;for(let i=0;i<N;i++)e0+=buf[i]*buf[i];if(Math.sqrt(e0/N)<.006)return -1;const minL=Math.floor(sr/1100),maxL=Math.min(buf.length-N-2,Math.floor(sr/38));const v=new Float32Array(maxL+2);let mx=0;
 for(let L=minL;L<=maxL;L++){let ac=0,e=0;for(let j=0;j<N;j++){const a=buf[j],b=buf[j+L];ac+=a*b;e+=a*a+b*b}v[L]=e?2*ac/e:0;if(v[L]>mx)mx=v[L]}
 if(mx<.6)return -1;let best=-1;for(let L=minL+1;L<maxL;L++)if(v[L]>=.9*mx&&v[L]>=v[L-1]&&v[L]>=v[L+1]){best=L;break}if(best<0)return -1;
 const x1=v[best-1],x2=v[best],x3=v[best+1];const a=(x1+x3-2*x2)/2,b=(x3-x1)/2;return sr/(a?best-b/(2*a):best)}
function inputStop(){INPUT.active=false;cancelAnimationFrame(INPUT.raf);if(INPUT.stream)INPUT.stream.getTracks().forEach(t=>t.stop());INPUT.stream=null;INPUT.midi=null;INPUT.level=0;INPUT.listeners.forEach(f=>f())}
async function inputStart(deviceId){const c=audio();if(!c||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw{name:'Unsupported'};inputStop();
 const stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:deviceId?{exact:deviceId}:undefined,echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
 INPUT.stream=stream;INPUT.src=c.createMediaStreamSource(stream);INPUT.an=c.createAnalyser();INPUT.an.fftSize=4096;INPUT.buf=new Float32Array(4096);INPUT.src.connect(INPUT.an);INPUT.active=true;INPUT.samples=[];INPUT.onsets=[];
 const tick=()=>{if(!INPUT.active)return;INPUT.an.getFloatTimeDomainData(INPUT.buf);const B=INPUT.buf;let r=0;for(let i=B.length-1024;i<B.length;i++)r+=B[i]*B[i];r=Math.sqrt(r/1024);INPUT.level=r;const t=c.currentTime;
  const N=B.length;let en=0,ep=0;for(let i=N-512;i<N;i++)en+=B[i]*B[i];for(let i=N-1536;i<N-512;i++)ep+=B[i]*B[i];ep/=2;if(en/512>2e-4&&en>ep*2&&t-INPUT.lastOnset>.07){INPUT.onsets.push(t-.015);INPUT.lastOnset=t}
  if(++INPUT.frame%3===0){const hz=detectPitch(B.subarray(B.length-2600),c.sampleRate);if(hz>0){const mf=69+12*Math.log2(hz/440);INPUT.midi=Math.round(mf);INPUT.cents=Math.round((mf-INPUT.midi)*100);INPUT.hz=hz;INPUT.samples.push({t,m:INPUT.midi})}else INPUT.midi=null}
  if(INPUT.frame%3===1){if(!INPUT.fb||INPUT.fb.length!==INPUT.an.frequencyBinCount){INPUT.fb=new Float32Array(INPUT.an.frequencyBinCount);INPUT.an.smoothingTimeConstant=.25}INPUT.an.getFloatFrequencyData(INPUT.fb);const CH=(INPUT.chroma=INPUT.chroma||[]);CH.push({t,c:chromaOf(INPUT.fb,c.sampleRate,INPUT.an.fftSize)});while(CH.length&&CH[0].t<t-8)CH.shift()}
  const cut=t-8;while(INPUT.samples.length&&INPUT.samples[0].t<cut)INPUT.samples.shift();while(INPUT.onsets.length&&INPUT.onsets[0]<cut)INPUT.onsets.shift();
  INPUT.listeners.forEach(f=>f());INPUT.raf=requestAnimationFrame(tick)};tick()}
const IN_CLAUDE=()=>!!window.claude;
function inputPanelHTML(){if(IN_CLAUDE())return`<div class="inpanel mini"><span class="hint">To get scored as you play, use the website version: inside Claude the app can’t use your microphone or MIDI.</span></div>`;const on=LISTEN();return`<div class="inpanel mini"><span class="indot ${on?'on':''}"></span><span class="instx">${on?(INST_RAW()==='voice'?'Listening to your voice':'Listening to your instrument'):(INST_RAW()==='voice'?'Your microphone isn’t connected':'Your instrument isn’t connected')}</span><button class="btn small inopen">${on?'Input settings':'Connect'}</button></div>`}
function fullInputPanelHTML(){if(IN_CLAUDE())return`<div class="inpanel"><b>Plug in your instrument</b><p class="hint">Inside Claude this page isn't allowed to use your microphone or audio interface. Open the website version (your Netlify download) to plug in and get scored as you play. Everything else here works the same.</p></div>`;
 return`<div class="inpanel"><div class="row" style="justify-content:space-between"><b>Plug in your instrument</b><span class="hint" id="instat"></span></div><p class="hint">Connect a guitar or bass through an audio interface, or use your computer's microphone for any instrument, drums included. Wear headphones so the app's own sound doesn't get picked up.</p>
 <div class="row"><button class="btn small" id="inconn"></button><select id="indev" aria-label="Audio input"></select><span class="lvlm" aria-hidden="true"><i id="inlvl"></i></span><span class="innote" id="innote"></span></div><div class="row"><button class="btn small" id="incal" hidden>Calibrate delay</button><span class="hint" id="incalt"></span></div>${midiRowHTML()}<p class="hint" id="inerr" hidden></p></div>`}
function bindInputPanel(root,onState){if(root&&root.classList&&root.classList.contains('mini')){const b=root.querySelector('.inopen');if(b)b.onclick=openInputSheet;return}if(IN_CLAUDE())return;const b=root.querySelector('#inconn'),sel=root.querySelector('#indev'),err=root.querySelector('#inerr');if(!b)return;
 const sync=()=>{root.querySelector('#instat').textContent=INPUT.active?'Listening':'Not connected';b.textContent=INPUT.active?'Disconnect':'Connect input';sel.hidden=!INPUT.active||!sel.options.length;const cb=root.querySelector('#incal');if(cb)cb.hidden=!INPUT.active;const ct=root.querySelector('#incalt');if(ct&&INPUT.active&&!ct.dataset.busy)ct.textContent=INPUT.lat?`Delay set to ${Math.round(INPUT.lat*1000)} ms`:'Calibrate once so timing checks match your setup'};
 const fill=async()=>{try{const ds=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput');sel.innerHTML=ds.map(d=>`<option value="${esc(d.deviceId)}">${esc(d.label||'Audio input')}</option>`).join('');const cur=INPUT.stream&&INPUT.stream.getAudioTracks()[0];const id=cur&&cur.getSettings?cur.getSettings().deviceId:null;if(id)sel.value=id}catch(e){}sync()};
 bindMIDIRow(root);const cal=root.querySelector('#incal');if(cal)cal.onclick=()=>{const c=audio();if(!c||!INPUT.active)return;const ct=root.querySelector('#incalt');ct.dataset.busy='1';cal.disabled=true;const t0=c.currentTime+.6,sd=60/90,clicks=[];for(let i=0;i<8;i++){clicks.push(t0+i*sd);drum(i%4?'click':'clickhi',t0+i*sd,.8)}ct.textContent='Play one note on every click…';setTimeout(()=>{const d=clicks.map(t=>{let best=null;INPUT.onsets.forEach(o=>{const x=o-t;if(x>-.1&&x<.45&&(best==null||Math.abs(x)<Math.abs(best)))best=x});return best}).filter(x=>x!=null).sort((a,b)=>a-b);delete ct.dataset.busy;cal.disabled=false;if(d.length<4){ct.textContent='I didn’t hear enough notes. Try again, a little louder.';return}INPUT.lat=Math.max(0,Math.min(.4,d[Math.floor(d.length/2)]));store.set('inlat',INPUT.lat);ct.textContent=`Delay set to ${Math.round(INPUT.lat*1000)} ms`},(.6+8*sd+.7)*1000)};
 b.onclick=async()=>{err.hidden=true;if(INPUT.active){inputStop();sync();onState&&onState();return}try{await inputStart(INPUT.dev);await fill();onState&&onState()}catch(e){err.hidden=false;err.textContent=e&&e.name==='NotAllowedError'?'Microphone access was blocked. Allow it in your browser’s site settings, then try again.':e&&e.name==='Unsupported'?'This browser can’t use audio input.':'Couldn’t open that audio input. Check it is plugged in and not used by another app.'}};
 sel.onchange=async()=>{INPUT.dev=sel.value;store.set('indev',sel.value);try{await inputStart(sel.value)}catch(e){}sync()};
 const upd=()=>{if(!document.body.contains(root)){INPUT.listeners.delete(upd);return}const l=root.querySelector('#inlvl');if(l)l.style.width=Math.min(100,INPUT.level*500)+'%';const n=root.querySelector('#innote');if(n)n.textContent=INPUT.midi!=null?'Hearing '+pcName(((INPUT.midi%12)+12)%12)+(Math.floor(INPUT.midi/12)-1):'';if(!INPUT.active)sync()};
 INPUT.listeners.add(upd);sync();if(INPUT.active)fill()}

/* ---------- play along ---------- */
const MELODIES={ode:{name:'Ode to Joy',notes:[[3,1],[3,1],[4,1],[5,1],[5,1],[4,1],[3,1],[2,1],[1,1],[1,1],[2,1],[3,1],[3,1.5],[2,.5],[2,2],[3,1],[3,1],[4,1],[5,1],[5,1],[4,1],[3,1],[2,1],[1,1],[1,1],[2,1],[3,1],[2,1.5],[1,.5],[1,2]]},
 twinkle:{name:'Twinkle Twinkle',notes:[[1,1],[1,1],[5,1],[5,1],[6,1],[6,1],[5,2],[4,1],[4,1],[3,1],[3,1],[2,1],[2,1],[1,2]]},
 frere:{name:'Frère Jacques',notes:[[1,1],[2,1],[3,1],[1,1],[1,1],[2,1],[3,1],[1,1],[3,1],[4,1],[5,2],[3,1],[4,1],[5,2],[5,.5],[6,.5],[5,.5],[4,.5],[3,1],[1,1],[5,.5],[6,.5],[5,.5],[4,.5],[3,1],[1,1],[1,1],[-5,1],[1,2],[1,1],[-5,1],[1,2]]}};
const PA_TYPES={guitar:[['melody','Melodies'],['major','Major scale'],['penta','Pentatonic box'],['caged','CAGED arpeggio'],['chords','Chord strumming']],bass:[['melody','Melodies'],['major','Major scale'],['penta','Pentatonic box'],['caged','CAGED position'],['bassline','Bass line']],piano:[['melody','Melodies'],['major','Major scale'],['minor','Minor scale'],['arp','Arpeggios']],drums:[['groove','Grooves'],['rudiment','Rudiments']]};
function fitTab(ms,S){for(let p=0;p<=12;p++){const lo=p,hi=p+4;const out=[];let ok=true;for(const m of ms){let best=null;S.forEach((o,i)=>{const f=m-o;if(f>=lo&&f<=hi&&(best==null||f<best.f))best={s:i,f}});if(!best){ok=false;break}out.push(best)}if(ok)return out}
 return ms.map(m=>{let b=null;S.forEach((o,i)=>{const f=m-o;if(f>=0&&f<=20&&(b==null||f<b.f))b={s:i,f}});return b||{s:0,f:0}})}
const octOf=(name,m)=>{const{L,a}=parse(name);return Math.round((m-NAT[L]-a)/12)-1};
function paBuild(o){const inst=INST()==='drums'&&!['groove','rudiment'].includes(o.type)?'guitar':INST();const S=inst==='bass'?STR4:STR;const pc=parse(o.key).pc;let per=2,beats=4,view=inst==='piano'?'staff':'tab';const items=[];
 const add=(dur,x)=>{const l=items[items.length-1];items.push({st:l?l.st+l.dur:0,dur:Math.round(dur*per),...x})};let title='';
 const sc=scaleNotes(o.key,'major');const deg=d=>d>0?MAJ_SEMI[(d-1)%7]+12*Math.floor((d-1)/7):MAJ_SEMI[(-d-1)%7]-12;const lowRoot=S[0]+((pc-S[0]%12+12)%12);
 if(o.type==='melody'){const M=MELODIES[o.mel];title=`${M.name} in ${pr(o.key)}`;const m0=(inst==='bass'?36:inst==='piano'?60:48)+pc;M.notes.forEach(([d,b])=>add(b,{m:m0+deg(d),name:sc[(Math.abs(d)-1)%7]}))}
 else if(o.type==='major'||o.type==='minor'){const t=o.type==='major'?'major':o.minor;const ns=scaleNotes(o.key,t);const semis=SC[t].steps.map(s=>s[0]);const m0=inst==='piano'?60+pc:lowRoot;title=`${pr(o.key)} ${SC[t].name}, up and down`;
  const up=[...semis.map((s,i)=>[m0+s,ns[i]]),[m0+12,o.key]];const down=t==='melodic'?scaleNotes(o.key,'natural').map((n,i)=>[m0+SC.natural.steps[i][0],n]).reverse().slice(1):up.slice(0,-1).reverse();[...up,...down].forEach(([m,n],i,a)=>add(i===a.length-1?2:1,{m,name:n}))}
 else if(o.type==='arp'){const t=o.arp;const n=chordNotes(o.key,t);title=`${chordSym(o.key,t)} arpeggio, two octaves`;const m0=48+pc;const up=[];for(let oc=0;oc<2;oc++)CH[t].st.forEach(([s],i)=>up.push([m0+12*oc+s,n[i]]));up.push([m0+24,o.key]);[...up,...up.slice(0,-1).reverse()].forEach(([m,nm])=>add(.5,{m,name:nm}))}
 else if(o.type==='penta'){const sp=pentaSpots(o.key,o.box,S).map(x=>({...x,m:S[x.s]+x.f})).sort((a,b)=>a.m-b.m);title=`${pr(o.key)} minor pentatonic, box ${o.box+1}`;[...sp,...sp.slice(0,-1).reverse()].forEach(x=>add(.5,{m:x.m,name:x.name,pos:{s:x.s,f:x.f}}))}
 else if(o.type==='caged'){const sh=cagedShape(o.key,'maj',o.shape);const sp=cagedSpots(o.key,'maj',sh,S,false).map(x=>({...x,m:S[x.s]+x.f})).sort((a,b)=>a.m-b.m);title=`${pr(o.key)} major arpeggio, ${o.shape} shape`;[...sp,...sp.slice(0,-1).reverse()].forEach(x=>add(.5,{m:x.m,name:x.name,pos:{s:x.s,f:x.f}}))}
 else if(o.type==='chords'){const pg=STRUM_PROGS[o.prog];title=pg.map(k=>{const[R,t]=k.split('|');return chordSym(R,t)}).join(' – ')+', one strum per beat';view='tab';pg.forEach(k=>{const[R,t]=k.split('|');const sh=guitarShape(R,t);const col=sh.frets.map((f,i)=>f==null?null:{s:i,f}).filter(Boolean);for(let i=0;i<4;i++)add(1,{chord:shapeMidis(sh.frets),col,name:chordSym(R,t)})})}
 else if(o.type==='bassline'){const P=PROG.find(x=>x.id===o.pid);const cs=P.ch.map(([d,t])=>chordAt(o.key,'major',d,t));title=`${P.name} in ${pr(o.key)}: ${({r58:'root, 5th, octave',r5:'root and 5th',roots:'roots',walk:'walking line'})[o.pat]}`;
  cs.forEach((c,i)=>{const R=bassRootMidi(c.root),nx=bassRootMidi(cs[(i+1)%cs.length].root);const th=CH[c.t].st[1][0];const pat={r58:[0,7,12,7],r5:[0,0,7,7],roots:[0,0,0,0],walk:[0,th,7,nx-1-R]}[o.pat];pat.forEach(iv=>{const m=R+iv;add(1,{m,name:pcName(((m%12)+12)%12).split('/')[0].replace('♯','#').replace('♭','b')})})})}
 else if(o.type==='groove'){const g=GROOVES.find(x=>x.id===o.groove);per=g.steps/4;view='grid';title=`${g.name}, two bars`;for(let b=0;b<2;b++)for(let s=0;s<g.steps;s++){const hits={};for(const k in g.rows){const ch=g.rows[k][s];if(ch==='x')hits[k]=1;else if(ch==='o')hits[k]=.35}if(Object.keys(hits).length)items.push({st:b*g.steps+s,dur:1,hits,cell:s})}const last=items[items.length-1];last.dur=2*g.steps-last.st;return{items,steps:2*g.steps,per,beats,view,S,title,groove:g,inst}}
 else if(o.type==='rudiment'){const rd=RUDI.find(x=>x.id===o.rud);per=4;view='stick';title=`${rd.name}, sixteenth notes`;const st=rd.stick.split(' ');const grp=rd.id==='dpara'?6:4;for(let i=0;i<32;i++)add(.25,{hits:{snare:i%grp===0?1:.6},stick:st[i%st.length],acc:i%grp===0})}
 if(view==='tab'&&items.length&&!items[0].pos&&!items[0].col){const pos=fitTab(items.map(x=>x.m),S);items.forEach((x,i)=>x.pos=pos[i])}
 const bar=beats*per;const last=items[items.length-1];const tot=last.st+last.dur;if(tot%bar)last.dur+=bar-tot%bar;
 return{items,steps:last.st+last.dur,per,beats,view,S,title,inst}}
function paNotation(ex,mode){if(ex.view==='grid')return grooveGrid({steps:ex.groove.steps,rows:ex.groove.rows});
 if(ex.view==='stick')return`<div class="stk">${ex.items.map((it,i)=>`<span data-c="${i}" class="${it.acc?'acc':''}">${it.stick}</span>`).join('')}</div>`;
 const per=8;const chunks=[];for(let i=0;i<ex.items.length;i+=per)chunks.push(ex.items.slice(i,i+per));
 if(mode==='staff'&&!ex.items[0].chord){const shift=ex.inst==='piano'?0:12;return chunks.map((ch,ci)=>{const clef=ex.inst==='bass'?'bass':ex.inst==='piano'&&Math.min(...ch.map(x=>x.m))<55?'bass':'treble';return`<div class="scroll">${staff({clef,notes:ch.map(it=>({name:it.name,oct:octOf(it.name,it.m+shift)})),idx0:ci*per})}</div>`}).join('')}
 return chunks.map((ch,ci)=>`<div class="scroll">${tabSVG(ex.S,ch.map(it=>it.col||it.pos),-1,ci*per)}</div>`).join('')}
TOOLPAGES.play=el=>{const inst=INST();const types=PA_TYPES[inst];const pre=store.get('paPreset',null);store.set('paPreset',null);
 const o={type:types.find(t=>t[0]===pre)?pre:types[0][0],key:'C',mel:'ode',box:0,shape:'E',prog:0,pid:'pop',pat:'r58',minor:'natural',arp:'maj',groove:'rock',rud:'single'};
 let notation=inst==='piano'?'staff':'tab',bpm=inst==='drums'?80:70,count=true,click=true,part=true,loop=false,playing=false,ex=null,expect=[],res={ok:0,n:0},judgeT=null,lastCur=[];
 const elsFor=i=>{const it=ex.items[i];return it&&it.cell!=null?[...el.querySelectorAll(`#pan .cell[data-i="${it.cell}"]`)].filter(c=>c.classList.contains('on')||c.classList.contains('gh')):[...el.querySelectorAll(`#pan [data-c="${i}"],#pan [data-n="${i}"]`)]};
 const cur=i=>{lastCur.forEach(x=>x.classList.remove('cur'));lastCur=elsFor(i);lastCur.forEach(x=>x.classList.add('cur'))};
 const score=()=>{const s=el.querySelector('#pascore');if(s)s.textContent=INPUT.active?(res.n?`Listening: ${res.ok} of ${res.n} right (${Math.round(res.ok/res.n*100)}%)`:'Listening… play along when the count-in ends.'):(IN_CLAUDE()?'':'Connect your instrument below to get scored as you play.')};
 const judge=()=>{if(!AC)return;const now=AC.currentTime;expect=expect.filter(e=>{if(e.te+.18>now)return true;if(!INPUT.active)return false;const it=ex.items[e.i];let ok;
   if(it.hits||it.chord)ok=INPUT.onsets.some(t=>Math.abs(t-e.t)<.12);else{const ss=INPUT.samples.filter(s=>s.t>=e.t+.03&&s.t<=e.te+.12);ok=ss.some(s=>(((s.m-it.m)%12)+12)%12===0)}
   res.n++;if(ok)res.ok++;elsFor(e.i).forEach(x=>{x.classList.toggle('ok',ok);x.classList.toggle('bad',!ok)});score();return false})};
 const stop=()=>{stopLoop();clearInterval(judgeT);playing=false;lastCur.forEach(x=>x.classList.remove('cur'));const b=el.querySelector('#pago');if(b)b.innerHTML=ICON.play+' Start';const c=el.querySelector('#pacount');if(c)c.textContent=''};
 const go=()=>{if(playing){stop();return}audio();playing=true;expect=[];res={ok:0,n:0};el.querySelectorAll('#pan .ok,#pan .bad').forEach(x=>x.classList.remove('ok','bad'));score();el.querySelector('#pago').innerHTML='■ Stop';
  const byStep={};ex.items.forEach((it,i)=>(byStep[it.st]=byStep[it.st]||[]).push(i));const bar=ex.beats*ex.per,cs=count?bar:0;
  startLoop(()=>({steps:1,per:ex.per,rows:{},bpm}),{extra:(abs,t,sd)=>{if(abs<cs){if(abs%ex.per===0)drum(abs===0?'clickhi':'click',t,.9);return}let k=abs-cs;if(!loop&&k>=ex.steps)return;k%=ex.steps;
    if(click&&k%ex.per===0)drum(k%bar===0?'clickhi':'click',t,.5);
    (byStep[k]||[]).forEach(i=>{const it=ex.items[i];if(part){if(it.hits)for(const d in it.hits)drum(d,t,it.hits[d]);else if(it.chord)strum(it.chord,t,sd*it.dur*.95,.17,{spread:.012});else tone(it.m,t,Math.max(.25,sd*it.dur*.95),.3,inst==='drums'?'guitar':TIMBRE())}expect.push({i,t,te:t+it.dur*sd})})},
   onStep:abs=>{const c=el.querySelector('#pacount');if(abs<cs){if(c&&abs%ex.per===0)c.textContent=`Count-in: ${abs/ex.per+1}`;return}if(c)c.textContent='';let k=abs-cs;if(!loop&&k>=ex.steps){if(k===ex.steps)setTimeout(()=>{judge();stop();score()},400);return}k%=ex.steps;(byStep[k]||[]).forEach(cur)}});
  judgeT=setInterval(judge,100)};
 const opt=()=>{const keys=rootItems(['C','G','D','A','E','F']);const p=[];
  if(o.type!=='groove'&&o.type!=='rudiment'&&o.type!=='chords')p.push(`<div class="pickrow"><span class="eyebrow">Key</span>${pillsHTML('key',keys,o.key)}</div>`);
  if(o.type==='melody')p.push(`<div class="pickrow"><span class="eyebrow">Melody</span>${pillsHTML('mel',Object.entries(MELODIES).map(([k,v])=>[k,v.name]),o.mel)}</div>`);
  if(o.type==='penta')p.push(`<div class="pickrow"><span class="eyebrow">Box</span>${pillsHTML('box',[0,1,2,3,4].map(n=>[String(n),'Box '+(n+1)]),String(o.box))}</div>`);
  if(o.type==='caged')p.push(`<div class="pickrow"><span class="eyebrow">Shape</span>${pillsHTML('shape',CAGED_ORDER.map(x=>[x,x+' shape']),o.shape)}</div>`);
  if(o.type==='chords')p.push(`<div class="pickrow"><span class="eyebrow">Chords</span>${pillsHTML('prog',STRUM_PROGS.map((pg,i)=>[String(i),pg.map(k=>{const[R,t]=k.split('|');return chordSym(R,t)}).join(' ')]),String(o.prog))}</div>`);
  if(o.type==='bassline')p.push(`<div class="pickrow"><span class="eyebrow">Progression</span>${pillsHTML('pid',['pop','fifties','blues','jazz'].map(id=>[id,PROG.find(x=>x.id===id).name]),o.pid)}</div><div class="pickrow"><span class="eyebrow">Pattern</span>${pillsHTML('pat',[['r58','Root, 5th, octave'],['r5','Root and 5th'],['roots','Roots'],['walk','Walking']],o.pat)}</div>`);
  if(o.type==='minor')p.push(`<div class="pickrow"><span class="eyebrow">Minor scale</span>${pillsHTML('minor',[['natural','Natural'],['harmonic','Harmonic'],['melodic','Melodic']],o.minor)}</div>`);
  if(o.type==='arp')p.push(`<div class="pickrow"><span class="eyebrow">Chord</span>${pillsHTML('arp',[['maj','Major'],['min','Minor'],['7','Dominant 7th'],['maj7','Major 7th'],['m7','Minor 7th']],o.arp)}</div>`);
  if(o.type==='groove')p.push(`<div class="pickrow"><span class="eyebrow">Groove</span>${pillsHTML('groove',GROOVES.map(g=>[g.id,g.name]),o.groove)}</div>`);
  if(o.type==='rudiment')p.push(`<div class="pickrow"><span class="eyebrow">Rudiment</span>${pillsHTML('rud',RUDI.slice(0,4).map(r=>[r.id,r.name]),o.rud)}</div>`);return p.join('')};
 const tog=(id,label,on)=>`<button class="pill" data-tog="${id}" aria-pressed="${on}">${label}</button>`;
 const render=()=>{stop();ex=paBuild(o);const canStaff=(inst==='guitar'||inst==='bass')&&o.type!=='chords';
  el.innerHTML=`<p>Read along as the cursor moves through the ${ex.view==='tab'?'tab':ex.view==='staff'?'staff':'pattern'}. Start slow with the count-in and metronome, then speed up. ${inst==='drums'&&!['groove','rudiment'].includes(o.type)?'':''}</p>
  <div class="panel"><div class="pickrow"><span class="eyebrow">Exercise</span>${pillsHTML('type',types,o.type)}</div>${opt()}
  ${canStaff?`<div class="pickrow"><span class="eyebrow">Read it as</span>${pillsHTML('nt',[['tab','Tab'],['staff','Staff']],notation)}</div>`:''}
  <h3>${esc(ex.title)}</h3><div id="pan" class="pan">${paNotation(ex,canStaff?notation:ex.view)}</div>
  <div class="row"><button class="btn primary" id="pago">${ICON.play} Start</button><label class="tempo" for="pabpm">Tempo <input type="range" id="pabpm" min="40" max="180" value="${bpm}"> <span id="pabv">${bpm}</span> BPM</label><span class="hint" id="pacount" aria-live="polite"></span></div>
  <div class="pills">${tog('count','Count-in',count)}${tog('click','Metronome',click)}${tog('part','Hear the part',part)}${tog('loop','Loop',loop)}</div>
  <p class="hint" id="pascore" aria-live="polite"></p></div>${inputPanelHTML()}`;
  bindPills(el,(g,v)=>{if(g==='nt')notation=v;else if(['box','prog'].includes(g))o[g]=+v;else o[g]=v;render()});
  el.querySelectorAll('[data-tog]').forEach(b=>b.onclick=()=>{const k=b.dataset.tog;const v={count,click,part,loop}[k];if(k==='count')count=!v;if(k==='click')click=!v;if(k==='part')part=!v;if(k==='loop')loop=!v;b.setAttribute('aria-pressed',!v)});
  el.querySelector('#pabpm').oninput=e=>{bpm=+e.target.value;el.querySelector('#pabv').textContent=bpm};el.querySelector('#pago').onclick=go;
  bindInputPanel(el.querySelector('.inpanel')||el);score()};
 render()};
function tunerLiveHTML(){if(IN_CLAUDE())return'';return`<div class="panel tlive"><h3>Tune with your instrument plugged in</h3><div class="tread"><b id="tnote">–</b><span id="tcent">Connect your instrument below</span></div><div class="tmeter" aria-hidden="true"><span class="c0"></span><i id="tneedle"></i></div>${inputPanelHTML()}</div>`}
function bindTunerLive(root){if(IN_CLAUDE())return;const p=root.querySelector('.tlive');if(!p)return;bindInputPanel(p.querySelector('.inpanel'));
 const upd=()=>{if(!document.body.contains(p)){INPUT.listeners.delete(upd);return}const n=p.querySelector('#tnote'),c=p.querySelector('#tcent'),nd=p.querySelector('#tneedle');
  if(INPUT.active&&INPUT.midi!=null){const pc=((INPUT.midi%12)+12)%12;n.textContent=pcName(pc).split('/')[0]+(Math.floor(INPUT.midi/12)-1);const cc=INPUT.cents;c.textContent=Math.abs(cc)<=5?'In tune':cc<0?`${-cc} cents flat: tighten the string`:`${cc} cents sharp: loosen the string`;nd.style.left=(50+cc)+'%';nd.classList.toggle('ok',Math.abs(cc)<=5)}
  else{n.textContent='–';c.textContent=INPUT.active?'Play one string at a time':'Connect your instrument below'}};INPUT.listeners.add(upd)}

/* ---------- settings (v3) ---------- */
const SPK_ON='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" fill="currentColor"/><path d="M13 6.5a5 5 0 0 1 0 7M15.5 4a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const SPK_OFF='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" fill="currentColor"/><path d="M13 7.5l5 5M18 7.5l-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
function syncMute(){const b=document.getElementById('mutebtn');b.innerHTML=MUTED()?SPK_OFF:SPK_ON;b.setAttribute('aria-pressed',MUTED());b.setAttribute('aria-label',MUTED()?'Turn sound on':'Mute sound')}
document.getElementById('mutebtn').onclick=()=>{store.set('muted',!MUTED());applyVol();syncMute()};syncMute();
/* ---------- Mac window chrome: sidebar + toolbar ---------- */
const SBI={daw:'<svg viewBox="0 0 16 16"><rect x="1.5" y="3" width="13" height="10" rx="2"/><path d="M4.5 6v4M7 7v3M9.5 5.5v4.5M12 7.5v2.5"/></svg>',mic:'<svg viewBox="0 0 16 16"><rect x="5.5" y="1.5" width="5" height="8" rx="2.5"/><path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2M5.5 14.5h5"/></svg>',home:'<svg viewBox="0 0 16 16"><path d="M2.5 7.5 8 2.5l5.5 5v6h-4v-4h-3v4h-4z"/></svg>',session:'<svg viewBox="0 0 16 16"><circle cx="8" cy="9" r="5.5"/><path d="M8 6v3l2 1.5M6.5 1.5h3M8 1.5v2"/></svg>',tool_read:'<svg viewBox="0 0 16 16"><path d="M2 4h12M2 7h12M2 10h12M2 13h12"/><circle cx="5" cy="10" r="1.3" style="fill:currentColor"/><circle cx="10" cy="7" r="1.3" style="fill:currentColor"/></svg>',tool_findnote:'<svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/><circle cx="7" cy="7" r="1.2" style="fill:currentColor"/></svg>',daily:'<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"/></svg>',
 practice:'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r=".8" style="fill:currentColor"/></svg>',
 note:'<svg viewBox="0 0 16 16"><path d="M6 12.5V3.5l7-1.5v9"/><circle cx="4.3" cy="12.5" r="1.7"/><circle cx="11.3" cy="11" r="1.7"/></svg>',
 book:'<svg viewBox="0 0 16 16"><path d="M2.5 3.2c2-1 4-1 5.5.4 1.5-1.4 3.5-1.4 5.5-.4v9.6c-2-1-4-1-5.5.4-1.5-1.4-3.5-1.4-5.5-.4z"/><path d="M8 3.6v9.6"/></svg>',
 tool_play:'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/><path d="M6.6 5.6v4.8L10.4 8z" style="fill:currentColor"/></svg>',
 tool_jam:'<svg viewBox="0 0 16 16"><path d="M3 13V8M6.3 13V4M9.6 13V7M13 13V5"/></svg>',
 tool_online:'<svg viewBox="0 0 16 16"><circle cx="13" cy="3" r="1.6" style="fill:currentColor"/><path d="M3 13V8M6.3 13V4M9.6 13V7M13 13V5"/></svg>',
 tool_metronome:'<svg viewBox="0 0 16 16"><path d="M5 14h6L9.2 2.5H6.8z"/><path d="M8 10.5l4-6"/></svg>',
 tool_tuner:'<svg viewBox="0 0 16 16"><path d="M5.5 2v5a2.5 2.5 0 0 0 5 0V2M8 9.5V14"/></svg>',
 tool_finder:'<svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>',
 plan:'<svg viewBox="0 0 16 16"><path d="M7 4h7M7 8h7M7 12h7"/><path d="M2.3 4l1 1 1.6-2M2.3 8l1 1 1.6-2M2.3 12l1 1 1.6-2"/></svg>',
 warmup:'<svg viewBox="0 0 16 16"><path d="M8 14c-2.5 0-4-1.7-4-4 0-2.6 2.5-3.5 2.5-6.5 1.7 1 2.4 2.6 2.2 4.3.7-.4 1.2-1.1 1.4-2 1 1 1.9 2.4 1.9 4.2 0 2.3-1.5 4-4 4z"/></svg>',
 review:'<svg viewBox="0 0 16 16"><path d="M13.5 8A5.5 5.5 0 1 1 11.2 3.6"/><path d="M11.5 1.5v2.5H9"/><path d="M8 5v3l2 1.5"/></svg>',
 takes:'<svg viewBox="0 0 16 16"><rect x="5.5" y="1.5" width="5" height="8" rx="2.5"/><path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2"/></svg>',
 tool_slow:'<svg viewBox="0 0 16 16"><path d="M2 8h1.5M4.5 5v6M7 3v10M9.5 5.5v5M12 7v2M14 8h0"/></svg>',
 tool_transcribe:'<svg viewBox="0 0 16 16"><path d="M2 4h12M2 7h12M2 10h12M2 13h12" opacity=".5"/><circle cx="6" cy="10" r="1.6" style="fill:currentColor"/><circle cx="10.5" cy="7" r="1.6" style="fill:currentColor"/></svg>',
 songs:'<svg viewBox="0 0 16 16"><path d="M2.5 4h7M2.5 7.5h7M2.5 11h4"/><path d="M13 2.5v8.5"/><circle cx="11.3" cy="11.3" r="1.7"/><path d="M13 2.5l1.5 1"/></svg>',
 progress:'<svg viewBox="0 0 16 16"><path d="M2.5 13.5h11M4.5 11V8M8 11V4.5M11.5 11V6.5"/></svg>'};
const LOGO='<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="10" fill="var(--accent)"/><path d="M13 21.5V10.2l9-2v11.3" fill="none" stroke="#0A0A0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10.6" cy="21.6" r="2.6" fill="#0A0A0B"/><circle cx="19.6" cy="19.6" r="2.6" fill="#0A0A0B"/></svg>';
function openSidebar(){document.getElementById('sidebar').classList.add('open');document.getElementById('scrim').hidden=false;document.getElementById('sbtoggle').setAttribute('aria-expanded','true')}
function closeSidebar(){const sb=document.getElementById('sidebar');if(!sb)return;sb.classList.remove('open');document.getElementById('scrim').hidden=true;document.getElementById('sbtoggle').setAttribute('aria-expanded','false')}
document.getElementById('sbtoggle').onclick=()=>document.getElementById('sidebar').classList.contains('open')?closeSidebar():openSidebar();
document.getElementById('scrim').onclick=closeSidebar;
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSidebar()});
function renderChrome(h){const sb=document.getElementById('sidebar');const lid=h.startsWith('learn')?(h.slice(6)||INST_PRI[INST_RAW()][0]):null;const RAW=INST_RAW();
 const cur=/^(song-|tabimport|tabedit-|mytab-)/.test(h)?'songs':h.startsWith('ch-')?'daily':h.startsWith('learn')?'learn-'+lid:h.startsWith('tools')?'tools-'+(h.slice(6)||'jam'):(h||'home');
 const inst=INST(),pitched=inst!=='drums';const groups=[['Today',[['home','Home','home'],['journey','Learning journey','journey'],['daily','Daily challenge','daily'],['session','Practice session','session'],['warmup','Warm-up','warmup'],['practice','Practice','practice'],['songs','Songs','songs']]],[INST_NAME[RAW],instLearn().map(([k,t])=>['learn-'+k,t,PROD.has(RAW)?'daw':'note'])],pitched?['Theory',[...LEARN_THEORY,['rhythm','Rhythm & time']].map(([k,t])=>['learn-'+k,t,'book'])]:null,PROD.has(RAW)?null:['Groove & feel',LEARN_GROOVE.map(([k,t])=>['learn-'+k,t,'note'])],['Home recording',LEARN_REC.map(([k,t])=>['learn-'+k,t,'mic'])],['Tools',TOOLS.filter(([k])=>(pitched||['play','jam','online','read','slow','transcribe','isolate','metronome'].includes(k))&&!(PROD.has(RAW)&&k==='tuner')).map(([k,t])=>['tools-'+k,t,'tool_'+k])],['Plan',[['paths','Genre paths','plan'],['plan','Schedule','plan'],['review','Review','review'],['progress','Progress','progress'],['takes','Recordings','takes']]]].filter(Boolean);const mine=MYINST();
 sb.innerHTML=`<div class="sbbrand">${LOGO}<b>Theory Club</b></div>${mine.length>1?`<div class="sbinst" role="group" aria-label="Instrument">${mine.map(i=>`<button data-inst="${i}" aria-pressed="${i===RAW}">${INST_NAME[i]}</button>`).join('')}</div>`:''}${groups.map(([g,items])=>{const st=store.get('sbst',{})||{};const col=!items.some(x=>x[0]===cur)&&(g in st?!st[g]:!(g==='Today'||g===INST_NAME[RAW]));return`<div class="sbg ${col?'col':''}"><button class="sbl" data-g="${esc(g)}" aria-expanded="${!col}">${esc(g)}<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.5 3.5 5 6.5l2.5-3"/></svg></button>${items.map(([a,b,c])=>`<a href="#${a}" ${a===cur?'aria-current="page"':''}><span class="ic">${SBI[c]||''}</span><span>${esc(b)}</span></a>`).join('')}</div>`}).join('')}`;
 sb.querySelectorAll('.sbl[data-g]').forEach(b=>b.onclick=()=>{const g=b.dataset.g;let L=store.get('sbcol',[])||[];const grp=b.parentElement;const now=!grp.classList.contains('col');grp.classList.toggle('col',now);b.setAttribute('aria-expanded',!now);const st=store.get('sbst',{})||{};st[g]=!now;store.set('sbst',st)});
 const f=groups.flatMap(g=>g[1]).find(x=>x[0]===cur);document.getElementById('tbtitle').textContent=h.startsWith('ch-')?'Challenge':f?f[1]:'Theory Club';
 const ac=sb.querySelector('[aria-current]');if(ac&&ac.scrollIntoView&&!sb.dataset.scrolled){ac.scrollIntoView({block:'nearest'});sb.dataset.scrolled='1'}
 {const tbk=/^(song|tabimport|tabedit|mytab)/.test(h)||h==='songs'?'songs':h.startsWith('learn')?'learn':h==='practice'?'practice':h==='daily'||h==='home'||!h||h.startsWith('ch-')?'daily':'more';document.querySelectorAll('#tabbar [data-tb]').forEach(a=>{if(a.dataset.tb===tbk)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
 sb.querySelectorAll('[data-inst]').forEach(b=>b.onclick=()=>{store.set('inst',b.dataset.inst);syncHeader();const h2=location.hash.slice(1);if(/^(learn|tools-tuner|tools-finder|tools-findnote)/.test(h2))location.hash='#home';else route()});
 closeSidebar()}
/* ---------- Songs: legends, techniques, studies ---------- */
const TECH={
 guitar:{
  power:{name:'Power chords & palm muting',desc:'Two-note chords (root and 5th) with the picking hand resting lightly on the strings by the bridge for a tight chug.',per:4,beats:4,bpm:100,tab:'2|0:0+1:2|PM 2|0:0+1:2|PM 2|0:0+1:2|PM 2|0:0+1:2|PM 2|0:0+1:2|PM 2|0:0+1:2|PM 2|0:3+1:5 2|0:5+1:7 2|0:0+1:2|PM 2|0:0+1:2|PM 2|0:0+1:2|PM 2|0:0+1:2|PM 4|0:3+1:5 4|0:5+1:7'},
  tritone:{name:'The tritone riff',desc:'Moving a power chord six frets (a tritone) for a dark, unsettled sound.',per:4,beats:4,bpm:90,tab:'4|0:0+1:2 4|0:0+1:2 2|0:6+1:8 2|0:6+1:8 4|0:0+1:2 4|0:3+1:5 4|0:5+1:7 8|0:0+1:2|PM'},
  pent:{name:'Minor pentatonic licks',desc:'Lead lines from box 1 of the minor pentatonic, the core blues-rock vocabulary.',per:4,beats:4,bpm:84,tab:'2|5:5 2|4:8 2|4:5 2|3:7 2|3:5 2|2:7 2|2:5 2|1:7 4|3:7|b 2|3:5 2|2:7 8|2:7|~'},
  bends:{name:'Bends & vibrato',desc:'Pushing the string to raise the pitch, then shaking it to make the note sing.',per:4,beats:4,bpm:72,tab:'4|4:8|b 4|4:8|b 4|5:5 4|4:8 8|3:7|b 8|3:7|~'},
  dom7s9:{name:'The 7♯9 “Hendrix chord”',desc:'A dominant 7th with both a major and a minor 3rd sound, played as stabs.',per:4,beats:4,bpm:104,tab:'4|1:7+2:6+3:7+4:8 4|1:7+2:6+3:7+4:8 2|r 2|1:7+2:6+3:7+4:8 4|1:7+2:6+3:7+4:8 2|1:7+2:6+3:7+4:8 2|1:7+2:6+3:7+4:8 4|1:7+2:6+3:7+4:8 8|1:7+2:6+3:7+4:8|~'},
  arpeggio:{name:'Fingerpicked arpeggios',desc:'Picking chord notes one at a time so they ring together.',per:4,beats:4,bpm:76,tab:'2|1:0 2|3:2 2|4:1 2|5:0 2|4:1 2|3:2 2|1:0 2|3:2 2|1:3 2|3:0 2|4:1 2|5:0 2|4:1 2|3:0 2|1:3 2|3:0'},
  octaves:{name:'Octaves',desc:'Melodies played as two notes an octave apart, with the string in between muted.',per:4,beats:4,bpm:92,tab:'4|0:3+2:5 2|0:5+2:7 2|0:7+2:9 4|0:8+2:10 4|0:7+2:9 4|0:5+2:7 4|0:3+2:5 8|0:5+2:7'},
  funk:{name:'Sixteenth-note funk strumming',desc:'Constant 16th strumming where most strokes are muted scratches and a few ring out.',per:4,beats:4,bpm:100,tab:'1|1:7+2:6+3:7+4:7 1|2:x+3:x+4:x 1|2:x+3:x+4:x 1|1:7+2:6+3:7+4:7 1|2:x+3:x+4:x 1|1:7+2:6+3:7+4:7 1|2:x+3:x+4:x 1|2:x+3:x+4:x 1|1:7+2:6+3:7+4:7 1|2:x+3:x+4:x 1|2:x+3:x+4:x 1|1:7+2:6+3:7+4:7 1|2:x+3:x+4:x 1|1:7+2:6+3:7+4:7 1|2:x+3:x+4:x 1|2:x+3:x+4:x'},
  shuffle:{name:'Blues shuffle rhythm',desc:'The rocking root–5th to root–6th pattern, swung long-short.',per:3,beats:4,bpm:96,tab:'2|0:0+1:2 1|0:0+1:2 2|0:0+1:4 1|0:0+1:4 2|0:0+1:2 1|0:0+1:2 2|0:0+1:4 1|0:0+1:4 2|1:0+2:2 1|1:0+2:2 2|1:0+2:4 1|1:0+2:4 2|1:0+2:2 1|1:0+2:2 2|1:0+2:4 1|1:0+2:4'},
  jangle:{name:'Jangly open-string arpeggios',desc:'Chord shapes that keep open strings ringing for a bright, chiming sound.',per:4,beats:4,bpm:110,tab:'2|0:3 2|3:0 2|4:0 2|5:3 2|4:0 2|3:0 2|2:0 2|3:0 2|1:3 2|3:0 2|4:3 2|5:3 2|4:3 2|3:0 2|2:2 2|3:0'},
  downpick:{name:'Fast downpicking (gallop)',desc:'An eighth and two sixteenths, all downstrokes, palm-muted on the low string.',per:4,beats:4,bpm:120,tab:'2|0:0|PM 1|0:0|PM 1|0:0|PM 2|0:0|PM 1|0:0|PM 1|0:0|PM 2|0:0|PM 1|0:0|PM 1|0:0|PM 2|0:0|PM 1|0:0|PM 1|0:0|PM 2|0:0|PM 1|0:0|PM 1|0:0|PM 2|0:0|PM 1|0:0|PM 1|0:0|PM 4|0:3+1:5 4|0:5+1:7'},
  gypsy:{name:'Gypsy jazz arpeggios & la pompe',desc:'Fast minor arpeggios, then the off-beat “la pompe” comping rhythm.',per:4,beats:4,bpm:110,tab:'1|1:0 1|2:2 1|3:2 1|4:1 1|5:0 1|5:5 1|4:5 1|3:5 8|3:2|~ 2|1:0+2:2+3:2+4:1 2|r 2|1:0+2:2+3:2+4:1 2|r 2|1:0+2:2+3:2+4:1 2|r 2|1:0+2:2+3:2+4:1 2|r'},
  slides:{name:'Slides',desc:'Gliding between notes along one string.',per:4,beats:4,bpm:80,tab:'4|2:5 4|2:7|/ 4|2:9|/ 4|2:7 4|3:7|/ 4|3:9 8|3:9|~'},
  legato:{name:'Hammer-ons & pull-offs',desc:'Sounding notes with the fretting hand alone, for smooth, fast phrases.',per:4,beats:4,bpm:84,tab:'2|3:5 2|3:7|h 2|3:5|p 2|2:7 2|2:5 2|2:7|h 2|2:5|p 2|1:7 4|1:5 4|1:7|h 8|1:5|~'}},
 bass:{
  root8:{name:'Driving root eighths',desc:'Steady eighth notes on the root, locked to the kick and hi-hat.',per:4,beats:4,bpm:120,tab:'2|0:0 2|0:0 2|0:0 2|0:0 2|0:0 2|0:0 2|0:0 2|0:0 2|1:0 2|1:0 2|1:0 2|1:0 2|0:3 2|0:3 2|0:3 2|0:3'},
  r5:{name:'Root and 5th',desc:'Alternating the root and the 5th below or above it.',per:4,beats:4,bpm:100,tab:'4|1:3 4|0:3 4|1:3 4|0:3 4|0:3 4|1:5 4|0:3 4|1:5'},
  octave:{name:'Octave bounce',desc:'Jumping between a note and its octave, two strings and two frets up.',per:4,beats:4,bpm:116,tab:'2|0:5 2|2:7 2|0:5 2|2:7 2|0:5 2|2:7 2|0:5 2|2:7 2|0:3 2|2:5 2|0:3 2|2:5 2|0:3 2|2:5 2|0:3 2|2:5'},
  walk:{name:'Walking bass',desc:'One note per beat, stepping through chord tones and approach notes.',per:4,beats:4,bpm:120,tab:'4|0:1 4|0:5 4|1:3 4|1:0 4|1:1 4|1:5 4|2:3 4|1:5'},
  slap:{name:'Slap & pop',desc:'Thumb slaps on the low string and finger pops on the higher strings.',per:4,beats:4,bpm:96,tab:'2|0:0|S 2|2:2|P 1|0:0|S 1|0:x|S 2|2:2|P 2|0:0|S 2|1:2|S 2|2:2|P 2|1:0|S 2|0:0|S 2|2:2|P 1|0:0|S 1|0:x|S 2|2:2|P 2|0:3|S 2|1:2|S 2|2:5|P 2|1:5|S'},
  melodic:{name:'Melodic lines',desc:'Moving through scale and chord tones so the bass sings its own tune.',per:4,beats:4,bpm:104,tab:'2|1:3 2|2:2 2|2:5 2|1:3 2|2:2 2|3:2 2|3:4 2|3:5 4|2:5 2|2:2 2|1:5 8|1:3'},
  reggae:{name:'Reggae space',desc:'Deep, round notes with lots of space, leaving beat 1 empty.',per:4,beats:4,bpm:76,tab:'8|r 2|0:5 2|0:5 4|1:3 8|r 4|0:3 4|0:5'},
  gallop:{name:'Picked gallop',desc:'Fast eighth-and-two-sixteenths picking on the low string.',per:4,beats:4,bpm:120,tab:'2|0:0 1|0:0 1|0:0 2|0:0 1|0:0 1|0:0 2|0:0 1|0:0 1|0:0 2|0:0 1|0:0 1|0:0 2|0:0 1|0:0 1|0:0 2|0:0 1|0:0 1|0:0 4|0:3 4|0:5'}},
 drums:{
  rockbeat:{name:'Straight rock beat',desc:'Hi-hat eighths, snare on 2 and 4, kick on 1 and 3.',groove:'rock'},
  heavy:{name:'Heavy half-time groove',desc:'A slow, huge backbeat on beat 3 with room around every hit.',grid:{steps:16,rows:{hat:'x.x.x.x.x.x.x.x.',snare:'........x.......',kick:'x.x.......xx....'}},bpm:76},
  fills:{name:'Tom fills',desc:'One bar of groove, then sixteenths around the toms into a crash.',grid:{steps:32,per:4,rows:{crash:'x...............................',hat:'..x.x.x.x.x.x.x.................',snare:'....x.......x...xxxx............',tom1:'....................xxxx........',tom2:'........................xxxx....',kick:'x.......x.x.....................'}},bpm:92},
  ghost16:{name:'Sixteenths & ghost notes',desc:'Busy hi-hats with very quiet snare taps between the backbeats.',grid:{steps:16,rows:{hat:'xxxxxxxxxxxxxxxx',snare:'.o..x..o.o.ox..o',kick:'x.x...x...x.....'}},bpm:96},
  halfshuffle:{name:'Half-time shuffle',desc:'Triplet hi-hats, ghost notes on the middle triplet, backbeat on 3.',grid:{steps:12,rows:{hat:'x.xx.xx.xx.x',snare:'.o..o.x...o.',kick:'x........x..'}},bpm:86},
  shuffle:{name:'Shuffle',desc:'Long-short triplet feel on the hi-hat.',groove:'shuffle'},
  onedrop:{name:'One drop',desc:'Kick and rim click land together on beat 3.',groove:'onedrop'},
  swing:{name:'Swing ride pattern',desc:'“Spang-a-lang” on the ride with the hi-hat pedal on 2 and 4.',groove:'jazz'},
  toms:{name:'Floor-tom groove',desc:'A driving pattern on the floor tom with accents.',grid:{steps:16,rows:{tom2:'x.x.x.x.x.x.x.x.',tom1:'..x.......x.....',kick:'x...x...x...x...'}},bpm:120},
  doublekick:{name:'Double kick',desc:'Steady sixteenths split between two kick pedals.',grid:{steps:16,rows:{crash:'x...............',hat:'....x.......x...',snare:'....x.......x...',kick:'xxxxxxxxxxxxxxxx'}},bpm:100},
  disco:{name:'Four on the floor',desc:'Kick on every beat, open hats on the “and”.',groove:'disco'}},
 piano:{
  ballad:{name:'Ballad block chords',desc:'Smooth inversions so each chord moves as little as possible.',chords:[['C',[48,60,64,67]],['G/B',[47,62,67,71]],['Am',[45,60,64,69]],['F/A',[45,60,65,69]]],dur:8,bpm:72},
  boogie:{name:'Boogie-woogie left hand',desc:'A rolling eighth-note bass line climbing through the chord.',notes:[[36,'C'],[40,'E'],[43,'G'],[45,'A'],[46,'Bb'],[45,'A'],[43,'G'],[40,'E'],[41,'F'],[45,'A'],[48,'C'],[50,'D'],[51,'Eb'],[50,'D'],[48,'C'],[45,'A']],dur:2,bpm:120},
  alberti:{name:'Alberti bass',desc:'Low–high–middle–high broken chords, the classical left-hand pattern.',notes:[[48,'C'],[55,'G'],[52,'E'],[55,'G'],[48,'C'],[55,'G'],[52,'E'],[55,'G'],[47,'B'],[55,'G'],[53,'F'],[55,'G'],[47,'B'],[55,'G'],[53,'F'],[55,'G']],dur:2,bpm:100},
  arps:{name:'Broken-chord arpeggios',desc:'Chords spread out one note at a time across the keyboard.',notes:[[48,'C'],[52,'E'],[55,'G'],[60,'C'],[64,'E'],[60,'C'],[55,'G'],[52,'E'],[45,'A'],[48,'C'],[52,'E'],[57,'A'],[60,'C'],[57,'A'],[52,'E'],[48,'C']],dur:2,bpm:84},
  waltz:{name:'Waltz left hand',desc:'Bass note on beat 1, chord on beats 2 and 3.',beats:3,chords:[['C',[36]],['C',[52,55,60]],['C',[52,55,60]],['G7',[43]],['G7',[53,55,59]],['G7',[53,55,59]]],dur:4,bpm:120},
  jazzvoicings:{name:'Jazz rootless voicings',desc:'Chords without the root, built from 3rds, 7ths and colour notes.',chords:[['Dm9',[53,57,60,64]],['G13',[53,57,59,64]],['Cmaj9',[52,55,59,62]],['Cmaj9',[52,55,59,62]]],dur:8,bpm:90}}};
const PD={
 furelise:{title:'Für Elise (opening)',by:'Ludwig van Beethoven',per:2,beats:3,den:8,bpm:132,pd:true,notes:[[4,1,76],[5,1,75],[6,1,76],[7,1,75],[8,1,76],[9,1,71],[10,1,74],[11,1,72],[12,2,69],[15,1,60],[16,1,64],[17,1,69],[18,2,71],[21,1,64],[22,1,68],[23,1,71],[24,2,72],[27,1,64],[28,1,76],[29,1,75],[30,1,76],[31,1,75],[32,1,76],[33,1,71],[34,1,74],[35,1,72],[36,2,69],[39,1,60],[40,1,64],[41,1,69],[42,2,71],[45,1,64],[46,1,72],[47,1,71],[48,6,69]],techs:['Alternating half steps (E–D♯)','A minor arpeggios spread across the hands','3/8 time: count each bar in three'],note:'The famous opening section. It is in 3/8, so the metronome clicks three eighth notes per bar.'},
 minuet:{title:'Minuet in G',by:'Christian Petzold (long credited to J. S. Bach)',per:2,beats:3,bpm:110,pd:true,notes:[[0,2,74],[2,1,67],[3,1,69],[4,1,71],[5,1,72],[6,2,74],[8,2,67],[10,2,67],[12,2,76],[14,1,72],[15,1,74],[16,1,76],[17,1,78],[18,2,79],[20,2,67],[22,2,67],[24,2,72],[26,1,74],[27,1,72],[28,1,71],[29,1,69],[30,2,71],[32,1,72],[33,1,71],[34,1,69],[35,1,67],[36,2,66],[38,1,67],[39,1,69],[40,1,71],[41,1,67],[42,6,69]],techs:['Stepwise melody in G major','Leaps of an octave in bars 2 and 4','3/4 dance time'],note:'The first eight bars, as found in the Anna Magdalena Bach notebook.'},
 greensleeves:{title:'Greensleeves',by:'Traditional (English, 1500s)',per:2,beats:3,bpm:120,pd:true,notes:[[4,2,69],[6,4,72],[10,2,74],[12,3,76],[15,1,78],[16,2,76],[18,4,74],[22,2,71],[24,3,67],[27,1,69],[28,2,71],[30,4,72],[34,2,69],[36,3,69],[39,1,68],[40,2,69],[42,4,71],[46,2,68],[48,4,64],[52,2,69],[54,4,72],[58,2,74],[60,3,76],[63,1,78],[64,2,76],[66,4,74],[70,2,71],[72,3,67],[75,1,69],[76,2,71],[78,3,72],[81,1,71],[82,2,69],[84,3,68],[87,1,66],[88,2,68],[90,6,69]],techs:['A minor melody with a raised 6th and 7th (F♯, G♯)','Long–short rhythm in 3/4','Starts on the last beat of the bar'],note:'The famous English folk melody, first published in 1580.'},
 grace:{title:'Amazing Grace',by:'Traditional (melody “New Britain”, 1829)',per:2,beats:3,bpm:84,pd:true,notes:[[4,2,62],[6,4,67],[10,1,71],[11,1,67],[12,4,71],[16,2,69],[18,4,67],[22,2,64],[24,4,62],[28,2,62],[30,4,67],[34,1,71],[35,1,67],[36,4,71],[40,2,69],[42,12,74]],techs:['Major pentatonic melody','Slow 3/4 with a pickup note','Long held notes: practise your vibrato'],note:'The first phrase of the hymn tune, in G major.'},
 saints:{title:'When the Saints Go Marching In',by:'Traditional (American spiritual)',per:2,beats:4,bpm:110,pd:true,notes:[[2,2,60],[4,2,64],[6,2,65],[8,8,67],[18,2,60],[20,2,64],[22,2,65],[24,8,67],[34,2,60],[36,2,64],[38,2,65],[40,4,67],[44,4,64],[48,4,60],[52,4,64],[56,8,62]],techs:['Four-note phrases that start after a rest','Long notes held for a whole bar','Major key, only five different notes'],note:'The first two lines of the New Orleans jazz standard.'},
 canon:{title:'Canon in D (opening)',by:'Johann Pachelbel (around 1700)',per:2,beats:4,bpm:72,pd:true,notes:[[0,4,78],[4,4,76],[8,4,74],[12,4,73],[16,4,71],[20,4,69],[24,4,71],[28,4,73]],techs:['A falling scale in half notes','Follows the chords D–A–Bm–F♯m–G–D–G–A','Even, singing tone on every note'],note:'The opening violin line, over the famous eight-chord pattern.'},
 ode:{title:'Ode to Joy',by:'Ludwig van Beethoven',per:2,beats:4,bpm:100,pd:true,melody:'ode',techs:['Stepwise melody','Dotted rhythm at the end of each phrase'],note:'The main theme from the Ninth Symphony.'}};
const PLAYDB={
 guitar:[
  {genre:'Rock',name:'Jimi Hendrix',blurb:'Rewrote what an electric guitar could do: chords, fuzz and feedback all at once.',songs:[['Purple Haze',['dom7s9','pent','bends'],'Built on the E7♯9 chord and minor pentatonic riffs.'],['Little Wing',['legato','pent'],'Chord shapes decorated with hammer-ons and pull-offs.'],['Voodoo Child (Slight Return)',['pent','bends'],'Muted-string intro, then heavy pentatonic riffs.']]},
  {genre:'Rock',name:'Jimmy Page',blurb:'Led Zeppelin\'s riff-writer, mixing blues, folk and huge rock tones.',songs:[['Stairway to Heaven',['arpeggio','pent'],'Fingerpicked arpeggios that build to a minor pentatonic solo.'],['Whole Lotta Love',['pent','power'],'A riff on the low E string.'],['Black Dog',['pent','legato'],'A twisting riff that crosses the bar line.']]},
  {genre:'Blues',name:'B.B. King',blurb:'Said more with one bent note than most players say with a hundred.',songs:[['The Thrill Is Gone',['bends','pent'],'Slow minor blues with expressive bends and vibrato.'],['Every Day I Have the Blues',['bends','pent'],'Swinging blues phrased around his favourite box shape.'],['Sweet Little Angel',['bends'],'Slow blues full of vibrato.']]},
  {genre:'Blues',name:'Stevie Ray Vaughan',blurb:'Texas blues with heavy strings and huge tone.',songs:[['Pride and Joy',['shuffle','pent'],'A shuffle that mixes bass notes and chords in one part.'],['Texas Flood',['bends','pent'],'Slow blues with big bends.'],['Lenny',['arpeggio','legato'],'A gentle, chord-melody ballad.']]},
  {genre:'Metal',name:'Tony Iommi',blurb:'Black Sabbath\'s riff master, the architect of heavy metal.',songs:[['Iron Man',['power'],'A slow, heavy power-chord riff.'],['Paranoid',['power','downpick'],'Fast palm-muted power chords.'],['War Pigs',['power','tritone'],'Doom-laden riffs with lots of space.']]},
  {genre:'Metal',name:'James Hetfield',blurb:'Metallica\'s rhythm guitarist, famous for relentless downpicking.',songs:[['Enter Sandman',['power','tritone'],'A palm-muted riff that leans on the tritone.'],['Master of Puppets',['downpick','power'],'Fast downpicked chromatic riffs.'],['Nothing Else Matters',['arpeggio'],'Fingerpicked open-string arpeggios in E minor.']]},
  {genre:'Funk',name:'Nile Rodgers',blurb:'Chic\'s co-founder, the king of the muted sixteenth-note strum.',songs:[['Le Freak',['funk'],'Choppy, muted sixteenth strumming.'],['Good Times',['funk'],'A tight rhythm part built on one strum pattern.'],['Get Lucky',['funk'],'His signature strum on a Daft Punk hit.']]},
  {genre:'Jazz',name:'Wes Montgomery',blurb:'Played with his thumb and made octave melodies his signature.',songs:[['Four on Six',['octaves'],'Melodies and solos in octaves.'],['West Coast Blues',['octaves'],'A blues in 3/4 with octave lines.'],['Bumpin\' on Sunset',['octaves'],'A slow groove with singing octaves.']]},
  {genre:'French & café jazz',name:'Django Reinhardt',blurb:'Invented gypsy jazz, playing lightning runs with two fretting fingers.',songs:[['Minor Swing',['gypsy'],'Minor arpeggios over a driving la pompe rhythm.'],['Nuages',['gypsy','slides'],'A slow, sliding melody.']]},
  {genre:'Indie',name:'Johnny Marr',blurb:'The Smiths\' guitarist, known for jangly, layered arpeggios.',songs:[['This Charming Man',['jangle'],'Bright, ringing open-string arpeggios.'],['There Is a Light That Never Goes Out',['jangle','arpeggio'],'Ringing chord shapes and arpeggios.']]},
  {genre:'Classical',name:'Ludwig van Beethoven',blurb:'His melodies are public domain, so the full notes are included here.',songs:[['Für Elise (opening)',['pd:furelise']],['Ode to Joy',['pd:ode']]]},
  {genre:'Classical',name:'Christian Petzold',blurb:'Wrote the minuet long credited to Bach.',songs:[['Minuet in G',['pd:minuet']]]},
  {genre:'Classical',name:'Johann Pachelbel',blurb:'The Canon’s chord pattern is in countless pop songs.',songs:[['Canon in D (opening)',['pd:canon']]]},
  {genre:'Folk & traditional',name:'Traditional tunes',blurb:'Centuries-old melodies, free to play in full.',songs:[['Greensleeves',['pd:greensleeves']],['Amazing Grace',['pd:grace']],['When the Saints Go Marching In',['pd:saints']]]}],
 bass:[
  {genre:'Folk & traditional',name:'Traditional tunes',blurb:'Centuries-old melodies, free to play in full on bass.',songs:[['When the Saints Go Marching In',['pd:saints']],['Amazing Grace',['pd:grace']],['Greensleeves',['pd:greensleeves']]]},
  {genre:'Classical',name:'Johann Pachelbel',blurb:'Play the famous Canon melody an octave down.',songs:[['Canon in D (opening)',['pd:canon']]]},
  {genre:'Rock',name:'Paul McCartney',blurb:'Turned the bass into a second melody in The Beatles.',songs:[['Come Together',['melodic','octave'],'A slinky, syncopated riff.'],['Something',['melodic'],'Melodic counter-lines under the vocal.'],['Taxman',['octave','root8'],'Busy lines with octave jumps.']]},
  {genre:'Rock',name:'John Paul Jones',blurb:'Led Zeppelin\'s bassist and arranger, rock-solid and inventive.',songs:[['Ramble On',['melodic'],'Busy, melodic lines under the verses.'],['Black Dog',['gallop','melodic'],'Bass doubles the twisting riff.']]},
  {genre:'Motown',name:'James Jamerson',blurb:'The uncredited bassist on countless Motown hits.',songs:[['My Girl',['melodic','r5'],'The famous opening line.'],['What\'s Going On',['melodic','walk'],'Syncopated, flowing lines.'],['Ain\'t No Mountain High Enough',['melodic','octave'],'Driving, melodic Motown bass.']]},
  {genre:'Funk',name:'Bootsy Collins',blurb:'James Brown\'s and Parliament-Funkadelic\'s bass hero.',songs:[['Get Up (I Feel Like Being a) Sex Machine',['root8','octave'],'A locked, one-chord funk groove.'],['Stretchin\' Out (In a Rubber Band)',['octave','slap'],'Elastic, bouncing funk bass.']]},
  {genre:'Funk',name:'Flea',blurb:'Red Hot Chili Peppers bassist, slap-funk energy.',songs:[['Higher Ground',['slap'],'Slap and pop all the way.'],['Around the World',['slap','octave'],'Fast slap and octave lines.'],['Give It Away',['melodic','octave'],'A sparse, punchy funk riff.']]},
  {genre:'Metal',name:'Cliff Burton',blurb:'Metallica\'s bassist, playing lead lines through distortion.',songs:[['For Whom the Bell Tolls',['gallop','melodic'],'A distorted bass intro.'],['Orion',['melodic'],'A melodic bass section in an instrumental.'],['(Anesthesia) Pulling Teeth',['melodic'],'A bass solo.']]},
  {genre:'Prog',name:'Geddy Lee',blurb:'Rush\'s bassist and singer, precise and busy.',songs:[['Tom Sawyer',['gallop','melodic'],'Punchy, precise lines.'],['YYZ',['gallop'],'A fast instrumental with tricky timing.'],['Limelight',['melodic'],'Melodic lines under the chords.']]},
  {genre:'Jazz',name:'Jaco Pastorius',blurb:'Fretless pioneer who made the bass a solo voice.',songs:[['Teen Town',['melodic'],'Fast, flowing sixteenth lines.'],['Donna Lee',['walk','melodic'],'A bebop tune played on bass.'],['Portrait of Tracy',['melodic'],'Played almost entirely in harmonics.']]},
  {genre:'Reggae',name:'Aston “Family Man” Barrett',blurb:'The Wailers\' bassist, the heartbeat of Bob Marley\'s music.',songs:[['Is This Love',['reggae'],'Deep, round notes with lots of space.'],['Stir It Up',['reggae'],'A laid-back, melodic reggae line.'],['Exodus',['reggae','root8'],'A hypnotic, repeating groove.']]}],
 drums:[
  {genre:'Rock',name:'John Bonham',blurb:'Led Zeppelin\'s drummer, the sound of big rock drums.',songs:[['When the Levee Breaks',['heavy'],'A huge, slow groove recorded in a stairwell.'],['Rock and Roll',['rockbeat','fills'],'A driving rock beat with a famous intro.'],['Moby Dick',['fills','toms'],'An extended drum solo.']]},
  {genre:'Rock',name:'Dave Grohl',blurb:'Nirvana\'s drummer, hitting hard and filling big.',songs:[['Smells Like Teen Spirit',['rockbeat','fills'],'Big fills and a loud, straight beat.'],['In Bloom',['rockbeat','fills'],'Heavy, simple and powerful.'],['Everlong',['rockbeat'],'Fast, driving eighths (Foo Fighters).']]},
  {genre:'Funk',name:'Clyde Stubblefield',blurb:'James Brown\'s drummer, one of the most sampled players ever.',songs:[['Funky Drummer',['ghost16'],'A legendary break full of ghost notes.'],['Cold Sweat',['ghost16'],'Syncopated funk with a light touch.'],['Mother Popcorn',['ghost16'],'Busy, bouncing funk.']]},
  {genre:'Pop & rock',name:'Jeff Porcaro',blurb:'Toto\'s drummer and a top session player.',songs:[['Rosanna',['halfshuffle'],'The famous half-time shuffle.'],['Africa',['ghost16'],'A layered sixteenth-note groove.'],['Lido Shuffle',['shuffle'],'A driving shuffle (Boz Scaggs).']]},
  {genre:'Pop & rock',name:'Ringo Starr',blurb:'The Beatles\' drummer, always serving the song.',songs:[['Come Together',['toms','fills'],'A tom-heavy, laid-back groove.'],['Ticket to Ride',['rockbeat'],'An off-kilter beat.'],['Rain',['fills'],'Busy fills around a heavy groove.']]},
  {genre:'Reggae-rock',name:'Stewart Copeland',blurb:'The Police\'s drummer, mixing reggae and punk.',songs:[['Roxanne',['onedrop'],'Reggae-style verses.'],['Walking on the Moon',['onedrop'],'Spacious, reggae-influenced groove.'],['Message in a Bottle',['rockbeat','ghost16'],'Busy hi-hat work.']]},
  {genre:'Metal',name:'Lars Ulrich',blurb:'Metallica\'s drummer and co-founder.',songs:[['One',['doublekick','fills'],'A famous double-kick section.'],['Enter Sandman',['rockbeat','fills'],'A heavy, straight groove.'],['Master of Puppets',['doublekick','rockbeat'],'Fast and relentless.']]},
  {genre:'Jazz',name:'Gene Krupa',blurb:'Swing-era star who made the drummer a featured soloist.',songs:[['Sing, Sing, Sing',['toms','swing'],'The floor-tom “jungle” groove.']]},
  {genre:'Jazz',name:'Art Blakey',blurb:'Led the Jazz Messengers with fierce, driving swing.',songs:[['Moanin\'',['swing'],'Hard-bop swing on the ride.'],['Blues March',['swing'],'A marching jazz groove.']]}],
 piano:[
  {genre:'Classical',name:'Ludwig van Beethoven',blurb:'His music is public domain, so full notes are included here.',songs:[['Für Elise (opening)',['pd:furelise']],['Ode to Joy',['pd:ode']],['Moonlight Sonata',['arps'],'The first movement rolls through slow broken chords.']]},
  {genre:'Classical',name:'Johann Pachelbel',blurb:'The Canon’s chord pattern is in countless pop songs.',songs:[['Canon in D (opening)',['pd:canon']]]},
  {genre:'Folk & traditional',name:'Traditional tunes',blurb:'Centuries-old melodies, free to play in full.',songs:[['Greensleeves',['pd:greensleeves']],['Amazing Grace',['pd:grace']],['When the Saints Go Marching In',['pd:saints']]]},
  {genre:'Classical',name:'Johann Sebastian Bach',blurb:'The foundation of Western harmony.',songs:[['Minuet in G',['pd:minuet']],['Prelude in C major',['arps'],'One broken-chord pattern from start to finish.']]},
  {genre:'Pop & rock',name:'Elton John',blurb:'Piano-led songs with flowing, gospel-tinged chords.',songs:[['Your Song',['ballad','arps'],'Flowing broken chords.'],['Tiny Dancer',['ballad'],'Big, open piano chords.'],['Rocket Man',['ballad'],'Steady chords with smooth inversions.']]},
  {genre:'Pop & rock',name:'Billy Joel',blurb:'The Piano Man, mixing rock, pop and classical touches.',songs:[['Piano Man',['waltz'],'A 3/4 waltz feel.'],['Just the Way You Are',['ballad','jazzvoicings'],'Smooth, jazzy chords.']]},
  {genre:'Blues & rock and roll',name:'Jerry Lee Lewis',blurb:'Wild rock and roll piano with boogie-woogie roots.',songs:[['Great Balls of Fire',['boogie'],'Pounding boogie piano.'],['Whole Lotta Shakin\' Goin\' On',['boogie'],'A rolling boogie left hand.']]},
  {genre:'Blues & rock and roll',name:'Ray Charles',blurb:'Fused gospel, blues and jazz into soul music.',songs:[['What\'d I Say',['boogie'],'An electric piano riff over a 12-bar blues.'],['Georgia on My Mind',['ballad','jazzvoicings'],'Rich, soulful chords.']]},
  {genre:'Jazz',name:'Bill Evans',blurb:'Lyrical jazz pianist with beautiful voicings.',songs:[['Waltz for Debby',['waltz','jazzvoicings'],'A jazz waltz in 3/4.'],['Peace Piece',['arps'],'Improvised over a repeating left-hand figure.']]},
  {genre:'Jazz',name:'Thelonious Monk',blurb:'Angular melodies and surprising harmony.',songs:[['\'Round Midnight',['jazzvoicings'],'Dark, rich jazz harmony.'],['Blue Monk',['boogie','jazzvoicings'],'A quirky blues.']]}]};
const slug=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function parseTab(str,S){const items=[];let st=0;for(const tok of str.trim().split(/\s+/)){const[d,c,mk0]=tok.split('|');const dur=+d;if(c==='r'){st+=dur;continue}let bendN=null;const mk=(mk0||'').split('_').map(x=>{const m=x.match(/^b(\d)$/);if(m){bendN=+m[1];return'b'}return x==='br'?'b r':x}).join(' ');
 const nh=/(^|_)NH(_|$)/.test(mk0||'');const ps=c.split('+').map(x=>{const[s,f]=x.split(':');const o={s:+s,f:f==='x'?'x':+f};if(nh&&o.f!=='x')o.harm=true;return o});const real=ps.filter(p=>p.f!=='x');const ms=real.map(p=>nh?harmPitch(S[p.s],p.f):S[p.s]+p.f);const it={st,dur,mk:(mk||'').split(' ').filter(x=>x&&x!=='NH').join(' ')};if(nh)it.harm=true;if(bendN!=null)it.bend=bendN;if(/\bPM\b/.test(it.mk))it.pm=true;
 if(ps.length>1){it.col=ps;it.chord=ms;it.name=ms.length?SHARPN[Math.min(...ms)%12]:'x'}else{it.pos=ps[0];if(real.length){it.m=ms[0];it.name=SHARPN[ms[0]%12]}else{it.mute=true;it.name='x'}}
 items.push(it);st+=dur}return{items,steps:st}}
function studyEx(inst,key){const T=TECH[inst][key];if(!T)return null;const S=inst==='bass'?STR4:STR;
 if(inst==='drums'){const g=T.groove?GROOVES.find(x=>x.id===T.groove):null;const grid=g?{steps:g.steps,rows:g.rows,per:g.steps/4}:{steps:T.grid.steps,rows:T.grid.rows,per:T.grid.per||T.grid.steps/4};
  const per=grid.per;const bars=grid.steps/(4*per);const reps=bars>=2?1:2;const items=[];for(let b=0;b<reps;b++)for(let s=0;s<grid.steps;s++){const hits={};for(const k in grid.rows){const ch=grid.rows[k][s];if(ch==='x')hits[k]=1;else if(ch==='o')hits[k]=.35}if(Object.keys(hits).length)items.push({st:b*grid.steps+s,dur:1,hits,cell:s})}
  const total=reps*grid.steps;const last=items[items.length-1];last.dur=total-last.st;return{items,steps:total,per,beats:4,view:'grid',groove:grid,S,title:T.name,inst,bpm:T.bpm||(g&&g.bpm)||96}}
 if(inst==='piano'){const per=4,beats=T.beats||4;const items=[];let st=0;
  if(T.chords){T.chords.forEach(([n,ms,dd])=>{const du=dd||T.dur;items.push(ms.length===1?{st,dur:du,m:ms[0],name:SHARPN[ms[0]%12]+'',chordName:n}:{st,dur:du,chord:ms,name:n});st+=du});return{items,steps:st,per,beats,view:'chips',S,title:T.name,inst,bpm:T.bpm}}
  T.notes.forEach(([m,n])=>{items.push({st,dur:T.dur,m,name:n});st+=T.dur});return{items,steps:st,per,beats,view:'staff',S,title:T.name,inst,bpm:T.bpm}}
 const{items,steps}=parseTab(T.tab,S);return{items,steps,per:T.per,beats:T.beats,view:'tab',S,title:T.name,inst,bpm:T.bpm}}
function pdEx(inst,id){const P=PD[id];const S=inst==='bass'?STR4:STR;
 if(P.melody){const ex=paBuild({type:'melody',key:'C',mel:P.melody});return{...ex,title:P.title,bpm:P.bpm,view:inst==='piano'?'staff':'tab'}}
 const shift=inst==='piano'?0:inst==='bass'?-24:-12;const items=P.notes.map(([st,dur,m])=>({st,dur,m:m+shift,name:SHARPN[(m+shift)%12]}));const last=items[items.length-1];
 if(inst!=='piano'){const pos=fitTab(items.map(x=>x.m),S);items.forEach((x,i)=>x.pos=pos[i])}
 return{items,steps:last.st+last.dur,per:P.per,beats:P.beats,den:P.den||4,view:inst==='piano'?'staff':'tab',S,title:P.title,inst,bpm:P.bpm}}
function findSong(s){for(const inst of [INST(),'guitar','bass','drums','piano']){for(const L of PLAYDB[inst]||[])for(const sg of L.songs)if(slug(inst+'-'+sg[0])===s)return{inst,L,sg}}return null}
function viewSongs(){const inst=INST();const db=PLAYDB[inst];const liked=db.filter(l=>genreLiked(l.genre));let genre=store.get('sgenre',null)||(liked.length?'For you':'All');const genres=[...(liked.length?['For you']:[]),'All',...new Set(db.map(l=>l.genre))];if(!genres.includes(genre))genre=liked.length?'For you':'All';
 const render=()=>{main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Songs · ${INST_NAME[inst]}</span><h1>Learn from the legends</h1><p class="lede">Pick a player and one of their best-known songs. You'll see which techniques it uses, and a study for each one that you can play along to with a metronome and a moving cursor.</p></div></div>
  <div class="stack">${myTabsPanel()}<div class="pickrow"><span class="eyebrow">Genre</span>${pillsHTML('genre',genres.map(g=>[g,g]),genre)}</div>
  <div class="legends">${db.filter(l=>genre==='All'||(genre==='For you'?genreLiked(l.genre):l.genre===genre)).sort((a,b)=>genreLiked(b.genre)-genreLiked(a.genre)).map(l=>`<section class="legend"><div class="lhead"><span class="lav" aria-hidden="true">${esc(l.name.split(' ').map(w=>w[0]).filter(c=>/[A-Z]/.test(c)).slice(0,2).join(''))}</span><div><h3>${esc(l.name)}</h3><span class="hint">${esc(l.genre)}</span></div></div><p class="hint">${esc(l.blurb)}</p><ol class="tracks">${l.songs.map((s,i)=>`<li><a href="#song-${slug(inst+'-'+s[0])}"><span class="tn">${i+1}</span><span class="tt">${esc(s[0])}</span><span class="tg">${s[1][0].startsWith('pd:')?'Full piece':s[1].length+' technique'+(s[1].length>1?'s':'')}</span><span class="chev" aria-hidden="true">›</span></a></li>`).join('')}</ol></section>`).join('')}</div>
  <p class="hint">Want other instruments' legends? Switch instrument in Settings.</p></div>`;
  bindPills(main,(g,v)=>{genre=v;store.set('sgenre',v);render()})};render()}
function viewSong(s){const f=findSong(s);if(!f){location.hash='#songs';return}{const seen=store.get('songsSeen',[])||[];if(!seen.includes(s)){seen.push(s);store.set('songsSeen',seen.slice(-200))}}const{inst,L,sg}=f;const[title,techs,note]=sg;const isPD=techs[0].startsWith('pd:');const P=isPD?PD[techs[0].slice(3)]:null;
 const q=encodeURIComponent(`${title} ${L.name}`);const word={guitar:'guitar',bass:'bass',drums:'drum',piano:'piano'}[inst];let sel=isPD?null:techs[0];let step=(TECHX[inst]||{})[sel]?'move':'study';window.__toneOvr=inst==='guitar'?songTone(s,L,title):null;
 const render=()=>{main.innerHTML=`<a class="back" href="#songs">‹ Songs</a><div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">${esc(L.genre)} · ${esc(L.name)}${inst!==INST()?` · ${INST_NAME[inst]}`:''}</span><h1>${esc(title)}</h1><p class="lede">${esc(isPD?P.note:note||'')}</p></div>
  <div class="row"><a class="btn" href="https://duckduckgo.com/?q=${encodeURIComponent('songsterr '+title+' '+L.name)}" target="_blank" rel="noopener">Find the tab on Songsterr ↗</a><a class="btn" href="https://www.youtube.com/results?search_query=${q}+${word}+lesson" target="_blank" rel="noopener">Video lesson ↗</a></div></div>
  <div class="stack">${isPD?'':myTabSection(s)}${isPD?`<p class="callout">This piece is in the public domain, so the full ${inst==='piano'?'notes are':'part is'} below.</p>`:`<p class="callout">The real tab is copyrighted, so the app can’t include it. To play the actual song, import a tab you have: paste a text tab, or open a Guitar Pro or MusicXML file. It plays back with this song’s sound, bends and vibrato included. The lessons below teach each technique with original exercises.</p>`}
  <section class="panel"><h3>Techniques in this song</h3><div class="techs">${isPD?P.techs.map(t=>`<div class="tech"><b>${esc(t)}</b></div>`).join(''):techs.map(k=>{const T=TECH[inst][k];return`<button class="tech ${k===sel?'sel':''}" data-t="${k}" aria-pressed="${k===sel}"><b>${esc(T.name)}</b><span class="hint">${esc(T.desc)}</span><span class="tp">${k===sel?'Practising now':'Practise this'}</span></button>`}).join('')+(songWorkout(inst,techs)?`<button class="tech ${sel==='_all'?'sel':''}" data-t="_all" aria-pressed="${sel==='_all'}"><b>Song workout</b><span class="hint">All ${songWorkout(inst,techs).length} techniques in one ${songWorkout(inst,techs).length*4}-bar piece.</span><span class="tp">${sel==='_all'?'Practising now':'Put it together'}</span></button>`:'')}</div></section>
  ${isPD?`<section class="panel"><div class="row" style="justify-content:space-between"><h3>${esc(P.title)}, full part</h3></div><div id="player" class="stack"></div></section>`:songLessonHTML(inst,sel,step,techs,s,L,title)}</div>`;
  main.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{sel=b.dataset.t;step='move';render();const lp=main.querySelector('.slesson');if(lp)lp.scrollIntoView({block:'start',behavior:'smooth'})});main.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{step=b.dataset.step;render();const lp=main.querySelector('.slesson');if(lp)lp.scrollIntoView({block:'start',behavior:'smooth'})});
  main.querySelectorAll('.stone .pill').forEach(b=>b.onclick=()=>{const T=store.get('songtone',{})||{};T[s]=b.dataset.v;store.set('songtone',T);window.__toneOvr=b.dataset.v;main.querySelectorAll('.stone .pill').forEach(x=>x.setAttribute('aria-pressed',x===b));try{gtonePreview()}catch(e){}});
  const ex=isPD?pdEx(inst,techs[0].slice(3)):songStepEx(inst,sel,step,techs);mountPlayer(document.getElementById('player'),ex,{srs:{id:'song:'+s+':'+(isPD?'pd':sel+(step&&step!=='study'?':'+step:'')),title:isPD?title:`${title}: ${techLabel(inst,sel)}${sel!=='_all'&&step!=='study'&&(TECHX[inst]||{})[sel]?' · '+TECHX[inst][sel][step].name:''}`,href:'#song-'+s}});if(!isPD)mountMyTab(s)};render()}
/* ---------- imported tabs (user's own) ---------- */
const TAB_BODY=/^[-0-9|xXhHpPbr\/\\~()<>.*=sSPtT: ]+$/;
function tabLineInfo(l){const t=l.replace(/\s+$/,'');const m=t.match(/^\s*([A-Ga-g][#b]?)?\s*([|:])/);if(!m)return null;const body=t.slice(m[0].length);if(body.length<3||!TAB_BODY.test(body))return null;const d=(body.match(/[-.]/g)||[]).length;if(d<3||d/body.length<.25)return null;return{label:m[1]||null,body,off:m[0].length}}
const EXT_TUN={4:[28,33,38,43],5:[23,28,33,38,43],6:[40,45,50,55,59,64],7:[35,40,45,50,55,59,64]};
function parseAsciiTab(text,{mode='spacing',beats=4}={}){const lines=String(text||'').replace(/\t/g,'    ').split(/\r?\n/);const systems=[];let cur=null,pre=[];const unknown=new Set();
 lines.forEach(l=>{const i=tabLineInfo(l);if(i){if(!cur){cur=[];cur.pre=pre.slice(-2)}cur.push(i)}else{if(cur){systems.push(cur);cur=null;pre=[]}if(l.trim())pre.push(l);else pre=[]}});if(cur)systems.push(cur);
 const sys=systems.filter(s=>s.length>=4&&s.length<=7);if(!sys.length)return{error:'I couldn’t find any tab lines. Each string should be on its own line, starting with its name and a bar line, like  e|---0---3---|'};
 const n=sys[0].length;const okSys=sys.filter(s=>s.length===n);
 const std=n===6?GSTR():n===4?BSTR():EXT_TUN[n];const labels=okSys[0].map(x=>x.label).reverse();
 const S=std.map((m,i)=>{const L=labels[i];if(!L)return m;const pc=parse(L[0].toUpperCase()+L.slice(1)).pc;let best=m;for(let d=-6;d<=5;d++)if(((m+d)%12+12)%12===pc){best=m+d;break}return best});
 const per=12,bar=beats*per;const items=[];let barBase=0;const cnt={};const add=k=>cnt[k]=(cnt[k]||0)+1;let usedLetters=false,usedPM=false;const DUR={w:48,h:24,q:12,e:6,s:3};
 okSys.forEach(rows=>{const off=rows[0].off;const w=Math.max(...rows.map(r=>r.body.length));const evs={};let letters=null;const pm=[];
  (rows.pre||[]).forEach(L=>{const t=L.replace(/\s+$/,'');if(/^[\sWHQESwhqes.]+$/.test(t)&&/[WHQESwhqes]/.test(t)){letters={};for(let p=0;p<t.length;p++){const c=t[p].toLowerCase();if(DUR[c]){let d=DUR[c];if(t[p+1]==='.')d=d*1.5;letters[p-off]=d}}}
   else{const re=/P\.?\s?M\.?/gi;let m;while((m=re.exec(t))){let e=m.index+m[0].length;while(e<t.length&&'-.|~_ '.includes(t[e])&&!(t[e]===' '&&t[e+1]===' '))e++;pm.push([m.index-off,e-off-1])}}});
  if(letters)usedLetters=true;if(pm.length)usedPM=true;
  rows.forEach((r,ri)=>{const s=n-1-ri;const b=r.body;const shift=r.off-off;const mkNext={};let lastF=null,gh=false,hm=false,lastEv=null,slideIn=null;
   for(let j=0;j<b.length;j++){const c=b[j];const J=j+shift;
    if(c>='0'&&c<='9'){let f=c,k=j;if(b[j+1]>='0'&&b[j+1]<='9'&&+(c+b[j+1])<=24){f=c+b[j+1];k=j+1}const fr=+f;
     let mk='';const pend=mkNext[s];if(pend){if(j-pend.at<=2){mk=pend.m;if(mk==='slide'||mk==='/'||mk==='\\')mk=lastF!=null&&fr<lastF?'\\':'/'}else if(lastEv&&/slide|\/|\\/.test(pend.m)){lastEv.mk=(lastEv.mk||'')+(pend.m==='\\'?' so\\':' so/');add('slides out')}}mkNext[s]=null;
     if(!mk&&slideIn&&j-slideIn.at<=2){mk=slideIn.m==='\\'?'si\\':'si/';add('slides in')}slideIn=null;const ev={s,f:fr,mk,ghost:gh,harm:hm};gh=false;hm=false;
     let q=k+1;while(q<b.length){const ch=b[q];
      if('hHpP/\\sStT'.includes(ch)){const m=/[sS]/.test(ch)?'slide':/[tT]/.test(ch)?'t':ch.toLowerCase();mkNext[s]={m,at:q};add(m==='h'?'hammer-ons':m==='p'?'pull-offs':m==='t'?'taps':'slides');q++;break}
      if(ch==='b'){ev.mk='b';add('bends');q++;let tg='';while(b[q]>='0'&&b[q]<='9'){tg+=b[q];q++}if(tg)ev.bend=+tg-fr;if(b[q]==='r'){ev.mk='b r';add('releases');q++;while(b[q]>='0'&&b[q]<='9')q++}continue}
      if(ch==='r'){q++;while(b[q]>='0'&&b[q]<='9')q++;continue}
      if(ch==='~'){ev.mk=ev.mk?ev.mk+' ~':'~';add('vibrato');q++;continue}
      if(ch==='.'){ev.stac=true;add('staccato notes');q++;continue}
      break}
     (evs[J]=evs[J]||[]).push(ev);lastF=fr;lastEv=ev;j=q-1}
    else if(c==='/'||c==='\\'||c==='s'||c==='S'){slideIn={m:c==='\\'?'\\':'/',at:j}}
    else if(c==='x'||c==='X'){(evs[J]=evs[J]||[]).push({s,f:'x',mk:''});add('dead notes')}
    else if(c==='('||c===')'){if(c==='('){add('ghost notes');gh=true}}
    else if(c==='<'||c==='>'){if(c==='<'){add('harmonics');hm=true}}
    else if(!'-|=:* '.includes(c))unknown.add(c)}
   const pe=mkNext[s];if(pe&&lastEv&&/slide|\/|\\/.test(pe.m)){lastEv.mk=(lastEv.mk||'')+(pe.m==='\\'?' so\\':' so/');add('slides out')}});
  const top=rows[0].body;let bars=[];for(let j=0;j<top.length;j++)if(top[j]==='|')bars.push(j);if(!bars.length||bars[0]>1)bars.unshift(-1);if(bars[bars.length-1]<w-2)bars.push(w);
  {const cs=Object.keys(evs).map(Number).sort((a,b)=>a-b);for(let k=1;k<cs.length;k++){const a=cs[k-1],b=cs[k];if(evs[a]&&evs[b]&&b-a===1&&evs[a].some(e=>typeof e.f==='number'&&e.f>=10)&&!evs[a].some(e=>evs[b].some(x=>x.s===e.s))){evs[a].push(...evs[b]);delete evs[b];cs[k]=a}}}
  const cols=Object.keys(evs).map(Number).sort((a,b)=>a-b);const nb=Math.max(1,bars.length-1);let run=0,lastD=6;const stMap={};
  if(mode==='spacing'&&!letters){for(let k=0;k<nb;k++){const a=bars[k]+1,e=bars[k+1];const inB=cols.filter(j=>j>=a&&j<e);if(!inB.length)continue;const fit=asciiFitBar(inB.map(j=>j-a),e-a,beats);
    if(fit)inB.forEach((j,q)=>stMap[j]=barBase+k*bar+fit.idx[q]*(bar/(beats*fit.sub)));
    else{let last=-1;inB.forEach(j=>{let o=Math.round((j-a)/Math.max(1,e-a)*bar/3)*3;if(o<=last)o=last+1;o=Math.min(bar-1,o);last=o;stMap[j]=barBase+k*bar+o})}}}
  cols.forEach(j=>{let st;const ps=evs[j];
   if(letters&&mode==='spacing'){let d=letters[j]!=null?letters[j]:letters[j-1]!=null?letters[j-1]:letters[j+1]!=null?letters[j+1]:lastD;lastD=d;st=barBase+run;run+=d}
   else if(mode==='spacing')st=stMap[j]!=null?stMap[j]:barBase;else st=null;
   const real=ps.filter(p=>p.f!=='x');const ms=real.map(p=>p.harm?harmPitch(S[p.s],p.f):S[p.s]+p.f);const mk=ps.map(p=>p.mk).find(Boolean)||'';const stac=ps.some(p=>p.stac);const inPM=pm.some(([a,e])=>j>=a&&j<=e);
   const it=ps.length>1?{col:ps.map(p=>({s:p.s,f:p.f})),chord:ms,name:ms.length?SHARPN[Math.min(...ms)%12]:'x',mk}:real.length?{pos:{s:ps[0].s,f:ps[0].f},m:ms[0],name:SHARPN[ms[0]%12],mk}:{pos:{s:ps[0].s,f:'x'},mute:true,name:'x',mk};
   if(stac){it.stac=true;if(!it.mk)it.mk='·'}const bd=ps.find(p=>p.bend!=null);if(bd)it.bend=bd.bend;if(ps.some(p=>p.ghost))it.ghost=true;if(ps.some(p=>p.harm))it.harm=true;if(inPM){it.pm=true;it.mk=it.mk==='·'?'PM·':it.mk||'PM';add('palm-muted notes')}it._st=st;items.push(it)});
  barBase+=mode!=='spacing'?0:letters?Math.max(bar,Math.ceil(run/bar)*bar):nb*bar});
 if(!items.length)return{error:'I found tab lines but no fret numbers in them.'};
 let prev=-1;items.forEach((it,i)=>{let st=mode==='spacing'?it._st:mode==='eighths'?i*6:i*3;if(st<=prev)st=prev+1;it.st=st;prev=st;delete it._st});
 items.forEach((it,i)=>{const nx=items[i+1];it.dur=nx?nx.st-it.st:Math.max(1,(Math.floor(it.st/bar)+1)*bar-it.st)});
 const last=items[items.length-1];let steps=last.st+last.dur;if(steps%bar)steps+=bar-steps%bar;last.dur=steps-last.st;
 const tlines=[];let curL=[];const byBar={};items.forEach((it,i)=>{const b=Math.floor(it.st/bar);(byBar[b]=byBar[b]||[]).push(i)});
 Object.keys(byBar).map(Number).sort((a,b)=>a-b).forEach(b=>{const idx=byBar[b];if(curL.length&&curL.length+idx.length>16){tlines.push(curL);curL=[]}if(idx.length>16){for(let i=0;i<idx.length;i+=16)tlines.push(idx.slice(i,i+16))}else curL.push(...idx)});if(curL.length)tlines.push(curL);
 let per2=per;if(items.every(it=>it.st%3===0&&it.dur%3===0)&&steps%3===0){items.forEach(it=>{it.st/=3;it.dur/=3});steps/=3;per2=4}
 return{items,steps,per:per2,beats,view:'tab',S,inst:n<=5?'bass':'guitar',lines:tlines,strings:n,bars:Math.round(steps/(beats*per2)),systems:okSys.length,info:{cnt,letters:usedLetters,pm:usedPM,unknown:[...unknown]}}}
function asciiFitBar(ps,Wd,beats){let best=null;const SUBS=[[1,0],[2,.02],[4,.04],[3,.1],[6,.14],[12,.3]];
 for(const[sub,cx]of SUBS){const g=beats*sub;for(let L=0;L<=4;L++)for(let T=0;T<=3;T++){const cw=(Wd-L-T)/g;if(cw<.95)continue;const idx=ps.map(p=>Math.round((p-L)/cw));if(idx.some(v=>v<0||v>=g))continue;let bad=false;for(let k=1;k<idx.length;k++)if(idx[k]<=idx[k-1]){bad=true;break}if(bad)continue;
   let err=0;ps.forEach((p,k)=>{const r=(p-L)/cw-idx[k];err+=r*r});err/=ps.length;const sc=err*4+cx+.01*(L+T)+(L>1?.03*(L-1):0);if(!best||sc<best.sc)best={sc,sub,idx,err}}}
 return best}
/* ---------- the guide on the import page ---------- */
const TAB_EX={
 basic:{t:'Layout and chords',d:'One line per string, highest string at the top. Numbers are frets; numbers stacked in the same column are played together.',x:'e|0---0---3-------|\nB|1---0---0-------|\nG|0---0---0-------|\nD|2---0---0-------|\nA|3---2---2-------|\nE|----3---3-------|'},
 spacing:{t:'Timing from the spacing',d:'Give every beat the same number of characters. Here each beat is 4 characters (1 e & a), so notes 2 apart are eighth notes and 4 apart are quarter notes.',x:'  1e&a2e&a3e&a4e&a\ne|----------------|\nB|----------------|\nG|----------------|\nD|------------0-2-|\nA|----0-2-3-------|\nE|3---------------|'},
 rhythm:{t:'A rhythm line',d:'Write a letter above each note: W whole, H half, Q quarter, E eighth, S sixteenth. Add a dot after the letter for a dotted note. The app then ignores the spacing.',x:'  Q   E E Q.    E\ne|----------------|\nB|----------------|\nG|----------------|\nD|----------------|\nA|0---2-3-5-----3-|\nE|----------------|'},
 legato:{t:'Hammer-ons, pull-offs and slides',d:'h = hammer-on, p = pull-off, / = slide up, \\ = slide down (s works for either). Write the letter between the two frets: 5h7, 7p5, 7/9, 9\\7.',x:'e|----------------------|\nB|----------------------|\nG|-5h7p5---7/9---9\\7----|\nD|----------------------|\nA|----------------------|\nE|----------------------|'},
 bends:{t:'Bends and vibrato',d:'b = bend: 7b9 means pick fret 7 and bend it up to the pitch of fret 9. Add r for a release (7b9r7). ~ after a note = vibrato.',x:'e|---------------------|\nB|-8b10----8b10r8--8~--|\nG|---------------------|\nD|---------------------|\nA|---------------------|\nE|---------------------|'},
 short:{t:'Staccato, palm muting and dead notes',d:'A dot right after a fret number (0.) = staccato: short and detached. Write PM with dashes on the line above the tab to palm-mute those notes. x = a dead (muted) note with no pitch.',x:'  PM------\ne|----------------|\nB|----------------|\nG|----------------|\nD|----------------|\nA|----------------|\nE|0.0.0.0.3-x-5-x-|'},
 bass:{t:'Bass tab',d:'Four lines, G on top. Everything else works the same.',x:'G|----------------|\nD|--------2---4---|\nA|----2-------2---|\nE|0-------0-------|'}};
const TAB_SYMBOLS=[['5h7','Hammer-on from 5 to 7'],['7p5','Pull-off from 7 to 5'],['5/7  7\\5','Slide up / slide down (or 5s7)'],['7b9','Bend fret 7 up to fret 9’s pitch'],['7b9r7','Bend and release'],['7~','Vibrato'],['0.','Staccato: short note'],['x','Dead note (muted, no pitch)'],['(5)','Ghost note: very quiet'],['<12>','Natural harmonic'],['PM---','On the line above: palm mute'],['| ','Bar line']];
function tabGuideHTML(){return`<details class="ged tabguide" ${store.get('tabguideSeen',false)?'':'open'}><summary>How to write a text tab the app can read</summary>
 <div class="stack" style="gap:10px;margin-top:10px"><div class="cols two"><div class="mini"><h4>The basics</h4><ul class="tgl"><li>One line per string, <b>highest string on top</b>, each starting with its name and a bar line: <code>e|</code></li><li>Numbers are frets. Numbers in the <b>same column</b> are played together as a chord.</li><li>Put <code>|</code> at every bar line. Keep all the string lines the same length.</li><li>Leave a blank line between each row of tab.</li></ul></div>
 <div class="mini"><h4>Getting the rhythm right</h4><ul class="tgl"><li><b>Spacing:</b> give every beat the same number of dashes (4 per beat is easiest). Choose “From the spacing”.</li><li><b>Rhythm line:</b> letters above the notes: <code>W H Q E S</code>, with a dot for dotted notes. It’s used automatically.</li><li><b>All the same length?</b> Choose “Even eighths” or “Even sixteenths”.</li><li>Triplets and ties can’t be written in text. Use a Guitar Pro or MusicXML file for those.</li></ul></div></div>
 <div class="scroll"><table class="tbl tsym"><thead><tr><th>Write</th><th>Means</th></tr></thead><tbody>${TAB_SYMBOLS.map(([a,b])=>`<tr><td><code>${esc(a)}</code></td><td>${esc(b)}</td></tr>`).join('')}</tbody></table></div>
 <div><span class="eyebrow">Examples: tap one to load it and hear it</span><div class="tgx">${Object.entries(TAB_EX).map(([k,e])=>`<button class="mini tgb" data-tx="${k}"><h4>${esc(e.t)}</h4><span class="o">${esc(e.d)}</span><pre>${esc(e.x)}</pre></button>`).join('')}</div></div></div></details>`}
function tabInfoText(r){if(!r||!r.info)return'';const c=r.info.cnt;const parts=Object.entries(c).map(([k,v])=>`${v} ${v===1?k.replace(/s$/,'').replace('vibrato','vibrato'):k}`);let s=parts.length?` Found ${parts.join(', ')}.`:'';if(r.info.letters)s+=' Timing taken from your rhythm line.';if(r.info.unknown.length)s+=` I skipped these symbols: ${r.info.unknown.join(' ')}`;return s}

function myTabs(){return store.get('mytabs',{})}
function myTabForSong(s){const T=myTabs();const ids=Object.keys(T).filter(k=>T[k].song===s).sort((a,b)=>(T[b].updated||0)-(T[a].updated||0));return ids.length?{id:ids[0],rec:T[ids[0]]}:null}
function myTabsPanel(){const T=myTabs();const ids=Object.keys(T).sort((a,b)=>(T[b].updated||0)-(T[a].updated||0));
 return`<section class="panel"><div class="row" style="justify-content:space-between"><div><h3>My tabs</h3><p class="hint">Tabs you import are saved in this browser only.</p></div><a class="btn primary" href="#tabimport">Import a tab</a></div>${ids.length?`<ol class="tracks">${ids.map((id,i)=>{const r=T[id];return`<li><a href="${r.song?'#song-'+r.song:'#mytab-'+id}"><span class="tn">${i+1}</span><span class="tt">${esc(r.title||'Untitled tab')}${r.artist?` <span class="hint">· ${esc(r.artist)}</span>`:''}</span><span class="tg">${r.bpm} BPM</span><span class="chev" aria-hidden="true">›</span></a></li>`}).join('')}</ol>`:'<p class="hint">No tabs yet. Import one here, or open a song and import its tab there.</p>'}</section>`}
function myTabSection(s){const f=myTabForSong(s);if(!f)return`<section class="panel"><div class="row" style="justify-content:space-between"><div><h3>Your tab</h3><p class="hint">Have the tab for this song? Paste it in and play along with the metronome, arrow and mistake checking.</p></div><a class="btn primary" href="#tabimport-${s}">Import your tab</a></div></section>`;
 return`<section class="panel"><div class="row" style="justify-content:space-between"><div><h3>Your tab</h3><p class="hint">${esc(f.rec.title)} · ${f.rec.bpm} BPM · imported by you</p></div><a class="btn" href="#tabedit-${f.id}">Edit</a></div><div id="myplayer" class="stack"></div></section>`}
function mountMyTab(s){const f=myTabForSong(s);const h=document.getElementById('myplayer');if(!f||!h)return;const ex=exFromRec(f.rec);if(!ex){h.innerHTML='<p class="hint">This tab couldn’t be read. Open Edit to fix it.</p>';return}mountPlayer(h,ex,{tabOrStaff:false,srs:{id:'tab:'+f.id,title:f.rec.title+' (your tab)',href:'#song-'+s}})}
function viewMyTab(id){const r=myTabs()[id];if(!r){location.hash='#songs';return}const ex=exFromRec(r);
 main.innerHTML=`<a class="back" href="#songs">‹ Songs</a><div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">My tab${r.artist?' · '+esc(r.artist):''}</span><h1>${esc(r.title||'Untitled tab')}</h1><p class="lede">${ex?`${ex.bars} bars · ${ex.items.length} notes · ${r.bpm} BPM`:'This tab couldn’t be read.'}</p></div><a class="btn" href="#tabedit-${id}">Edit</a></div><section class="panel"><div id="myplayer" class="stack"></div></section>`;
 if(ex)mountPlayer(document.getElementById('myplayer'),ex,{tabOrStaff:false,srs:{id:'tab:'+id,title:(r.title||'Untitled tab')+' (your tab)',href:'#mytab-'+id}})}

/* ---------- drum charts (standard drum-kit notation) ---------- */
const DPOS={kick:1,tom2:3,snare:5,rim:5,tom1:7,ride:8,hat:9,open:9,crash:10};
const DX={hat:1,open:1,ride:1,crash:1,rim:1};
function rowsToItems(steps,rows){const items=[];for(let s=0;s<steps;s++){const hits={};for(const k in rows){const ch=(rows[k]||'')[s];if(ch==='x')hits[k]=1;else if(ch==='o')hits[k]=.35}if(Object.keys(hits).length)items.push({st:s,dur:1,hits})}return items}
function drumChart(items,steps,per,beats,{edit=false,key=false,labels=null,groups=null,num=null,den=4}={}){const GR=groups||Array(beats).fill(per);const barS=GR.reduce((a,c)=>a+c,0);const nb=Math.max(1,Math.ceil(steps/barS));const perLine=barS<=16?2:1;const slotW=per===3?30:per===2?40:24;
 const y0=104,y=p=>y0-p*5;const byStep={};items.forEach((it,i)=>{byStep[it.st]={it,i}});let out='';
 for(let l0=0;l0<nb;l0+=perLine){const bars=[];for(let b=l0;b<Math.min(nb,l0+perLine);b++)bars.push(b);const first=l0===0;const lead=26+(first?22:0);const barW=barS*slotW+16;const W=lead+bars.length*barW+6,H=key?166:150;
  let s=`<svg class="staff dchart" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="Drum chart, bars ${l0+1} to ${bars[bars.length-1]+1}">`;
  for(let i=0;i<5;i++)s+=`<line x1="2" x2="${W-4}" y1="${y(i*2)}" y2="${y(i*2)}"/>`;
  s+=`<rect class="pclef" x="9" y="${y(6)}" width="4" height="20"/><rect class="pclef" x="16" y="${y(6)}" width="4" height="20"/>`;
  if(first&&!key)s+=`<text class="tsig" x="${26+8}" y="${y(4)-1}" text-anchor="middle">${num||beats}</text><text class="tsig" x="${26+8}" y="${y(0)-1}" text-anchor="middle">${den}</text>`;
  bars.forEach((b,bi)=>{const bx=lead+bi*barW+10;const xs=s2=>bx+(s2-b*barS)*slotW+slotW/2;
   if(!key)s+=`<text class="bnum" x="${bx-6}" y="${y(8)-6}">${b+1}</text>`;
   for(let bt=0,off=0;bt<GR.length;off+=GR[bt],bt++){const gl=GR[bt],b0=b*barS+off,b1=b0+gl;
    for(const up of [true,false]){const ons=[];for(let s2=b0;s2<b1;s2++){const e=byStep[s2];if(!e)continue;const ks=Object.keys(e.it.hits).filter(k=>up?k!=='kick':k==='kick');if(ks.length)ons.push({s:s2,ks,i:e.i,v:e.it.hits})}
     const restY=up?y(6)+8:y(2)+8;const rest=(x,g)=>s+=`<text class="gl rest" x="${x-6}" y="${restY}" font-size="28">${g}</text>`;
     if(!ons.length){if(!key&&up){if(groups){if(gl===2)rest(xs(b0),'𝄾');else{rest(xs(b0)+1.5*slotW,'𝄽');if(gl===6)rest(xs(b0+4),'𝄾')}}else rest(xs(b0)+(per-1)*slotW/2,'𝄽')}continue}
     let notes;
     if(per===3&&!groups){notes=[];for(let s2=b0;s2<b1;s2++){const o=ons.find(x=>x.s===s2);if(o)notes.push({...o,d:2});else rest(xs(s2),'𝄾')}}
     else{const u=4/per;if(groups){let r=ons[0].s-b0,ps=b0;while(r>0){if(r>=4){rest(xs(ps)+1.5*slotW,'𝄽');ps+=4;r-=4}else if(r>=2){rest(xs(ps),'𝄾');ps+=2;r-=2}else{rest(xs(ps),'𝄿');ps++;r--}}}else{const g0=(ons[0].s-b0)*u;if(g0===1)rest(xs(b0),'𝄿');else if(g0===2)rest(xs(b0),'𝄾');else if(g0===3){rest(xs(b0),'𝄾');rest(xs(b0+2/u),'𝄿')}}
      notes=ons.map((o,j)=>({...o,d:((j<ons.length-1?ons[j+1].s:b1)-o.s)*u}))}
     const tops=[];notes.forEach(n=>{const x=xs(n.s);const ps=n.ks.map(k=>DPOS[k]).sort((a,c)=>a-c);let prevP=-9;
      n.ks.slice().sort((a,c)=>DPOS[a]-DPOS[c]).forEach(k=>{const p=DPOS[k];const hx=x+(p-prevP===1?9:0);prevP=p;const cy=y(p);const gh=n.v[k]<.5;
       if(p>=10)s+=`<line class="lg" x1="${hx-9}" x2="${hx+9}" y1="${y(10)}" y2="${y(10)}"/>`;
       if(DX[k]){s+=`<path class="xh" data-c="${n.i}" data-s="${n.s}" d="M${hx-4.5} ${cy-4.5}l9 9M${hx-4.5} ${cy+4.5}l9-9"/>`;if(k==='open')s+=`<circle class="xo" cx="${hx}" cy="${y(11.6)}" r="3.2"/>`;if(k==='rim')s+=`<circle class="xo" cx="${hx}" cy="${cy}" r="7"/>`}
       else s+=`<ellipse class="hd" data-c="${n.i}" data-s="${n.s}" cx="${hx}" cy="${cy}" rx="5.8" ry="4.3" transform="rotate(-20 ${hx} ${cy})"/>`;
       if(gh)s+=`<text class="ghost" x="${hx-11}" y="${cy+4}">(</text><text class="ghost" x="${hx+7}" y="${cy+4}">)</text>`;
       if(n.d===3||n.d===6)s+=`<circle class="hd" cx="${hx+10}" cy="${p%2===0?cy-3:cy}" r="1.9"/>`});
      n.x=x;n.hi=y(ps[ps.length-1]);n.lo=y(ps[0]);tops.push(n)});
     const beamed=notes.filter(n=>n.d<4);const sx=n=>up?n.x+5.3:n.x-5.3;
     const beamY=up?Math.min(...notes.map(n=>n.hi))-30:Math.max(...notes.map(n=>n.lo))+30;
     notes.forEach(n=>{const yy=beamed.length>=2&&n.d<4?beamY:(up?n.hi-30:n.lo+30);s+=`<line class="stem" x1="${sx(n)}" x2="${sx(n)}" y1="${up?n.lo:n.hi}" y2="${yy}"/>`;
      if(!(beamed.length>=2&&n.d<4)&&n.d<4){const fl=n.d<=1?2:1;for(let f=0;f<fl;f++){const fy=yy+(up?f*7:-f*7);s+=up?`<path class="flag" d="M${sx(n)} ${fy}c5 4 9 7 7 15c-1-5-4-8-7-9z"/>`:`<path class="flag" d="M${sx(n)} ${fy}c5-4 9-7 7-15c-1 5-4 8-7 9z"/>`}}});
     if(beamed.length>=2){const a=sx(beamed[0]),c2=sx(beamed[beamed.length-1]);s+=`<rect class="beam" x="${a}" y="${up?beamY:beamY-4.5}" width="${c2-a+1.4}" height="4.5"/>`;
      const sy2=up?beamY+7:beamY-11.5;beamed.forEach((n,j)=>{if(n.d>1)return;const nx=beamed[j+1],pv=beamed[j-1];if(nx&&nx.d===1)s+=`<rect class="beam" x="${sx(n)}" y="${sy2}" width="${sx(nx)-sx(n)+1.4}" height="4.5"/>`;else if(!(pv&&pv.d===1)){const dir=nx?1:-1;s+=`<rect class="beam" x="${dir>0?sx(n):sx(n)-9}" y="${sy2}" width="10" height="4.5"/>`}});
      if(per===3)s+=`<text class="tup" x="${(a+c2)/2}" y="${up?beamY-5:beamY+14}" text-anchor="middle">3</text>`}}}
   if(labels)for(const st in labels)s+=`<text class="klab" x="${xs(+st)}" y="${y(-6)}" text-anchor="middle">${labels[st]}</text>`;
   for(let s2=b*barS;s2<(b+1)*barS;s2++){const e=byStep[s2];if(e)s+=`<path class="arr" data-c="${e.i}" data-s="${s2}" d="M${xs(s2)-5} 2h10l-5 7z"/>`}
   if(edit)for(let s2=b*barS;s2<(b+1)*barS;s2++)s+=`<rect class="hit" data-step="${s2}" x="${xs(s2)-slotW/2}" y="${y(11)}" width="${slotW}" height="${y(-1)-y(11)}"/>`;
   const ex=bx+barS*slotW+6;s+=`<line class="bl" x1="${ex}" x2="${ex}" y1="${y(8)}" y2="${y(0)}"/>`;if(b===nb-1)s+=`<rect class="pclef" x="${ex+3}" y="${y(8)}" width="3.5" height="40"/>`});
  out+=`<div class="scroll dline">${s}</svg></div>`}
 return`<div class="dchartwrap">${out}</div>`}
function drumKeyChart(){const pieces=[['crash','Crash'],['hat','Hi-hat'],['open','Open hi-hat'],['ride','Ride'],['tom1','High tom'],['snare','Snare'],['rim','Cross-stick'],['tom2','Floor tom'],['kick','Kick']];const items=pieces.map(([k],i)=>({st:i*2,dur:2,hits:{[k]:1}}));
 const labels={};pieces.forEach(([k,n],i)=>labels[i*2]=n);return`<div class="dkey">${drumChart(items,18,2,9,{key:true,labels})}</div>`}
/* ---------- v9: score import, better player, shortcuts, backup, goals ---------- */
let ACTIVE=null;
let AT_P=null;
function loadAlphaTab(){if(window.alphaTab)return Promise.resolve(window.alphaTab);if(AT_P)return AT_P;AT_P=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@coderline/alphatab@1.8.4/dist/alphaTab.min.js';s.onload=()=>window.alphaTab?res(window.alphaTab):rej(new Error('load'));s.onerror=()=>{AT_P=null;rej(new Error('load'))};document.head.appendChild(s)});return AT_P}
const GM_DRUM=n=>({35:'kick',36:'kick',37:'rim',38:'snare',39:'snare',40:'snare',41:'tom2',43:'tom2',45:'tom2',47:'tom1',48:'tom1',50:'tom1',42:'hat',44:'hat',46:'open',49:'crash',52:'crash',55:'crash',57:'crash',51:'ride',53:'ride',59:'ride'})[n]||null;
const DRUM_LAB={crash:'CC',ride:'RD',open:'OH',hat:'HH',rim:'RS',snare:'SD',tom1:'T1',tom2:'FT',kick:'BD'};
function scoreTracks(score){return score.tracks.map((t,i)=>{const st=t.staves[0];const kind=st.isPercussion?'perc':st.tuning&&st.tuning.length?'string':'keys';return{i,name:t.name||('Track '+(i+1)),kind,strings:kind==='string'?st.tuning.length:0}})}
function pickTrack(tracks){const inst=INST();const f=t=>inst==='drums'?t.kind==='perc':inst==='bass'?t.kind==='string'&&t.strings<=5:inst==='piano'?t.kind==='keys':t.kind==='string'&&t.strings>=6;return(tracks.find(f)||tracks.find(t=>t.kind!=='perc')||tracks[0]).i}
function scoreToEx(score,ti){const tr=score.tracks[ti],st=tr.staves[0];const MB=score.masterBars;const mb0=MB[0];const num=mb0.timeSignatureNumerator,den=mb0.timeSignatureDenominator;const per=12*4/den;const T=80;
 const kind=st.isPercussion?'perc':st.tuning&&st.tuning.length?'string':'keys';const S=kind==='string'?st.tuning.slice().sort((a,b)=>a-b):STR;const items=[];
 const altN=m=>{const o=[];for(let k=0;k<8;k++)if(m&(1<<k))o.push(k+1);return o.join(',')};
 const barsInfo=MB.map(mb=>{let len;try{len=mb.calculateDuration()/T}catch(e){len=mb.timeSignatureNumerator*(48/mb.timeSignatureDenominator)}return{st:mb.start/T,len,num:mb.timeSignatureNumerator,den:mb.timeSignatureDenominator,repStart:!!mb.isRepeatStart,repEnd:(mb.repeatCount||0)>0,repCount:mb.repeatCount||0,alt:mb.alternateEndings?altN(mb.alternateEndings):'',section:mb.section?(mb.section.text||mb.section.marker||''):''}});
 for(const bar of st.bars){const start=bar.masterBar.start;const v=bar.voices[0];if(!v)continue;for(const b of v.beats){if(b.graceType)continue;if(b.isRest||!b.notes.length)continue;const s0=Math.round((start+b.playbackStart)/T);const dur=Math.max(1,Math.round(b.playbackDuration/T));
   const ns=b.notes.filter(n=>!n.isTieDestination);if(!ns.length){const p=items[items.length-1];if(p)p.dur=Math.max(p.dur,s0+dur-p.st);continue}
   if(kind==='perc'){const hits={};ns.forEach(n=>{const a=tr.percussionArticulations&&tr.percussionArticulations[n.percussionArticulation];const k=GM_DRUM(a?a.outputMidiNumber:n.realValue);if(k)hits[k]=n.isGhost?.35:1});if(Object.keys(hits).length)items.push({st:s0,dur,hits});continue}
   if(kind==='keys'){const ms=ns.map(n=>n.realValue).sort((a,b)=>a-b);items.push(ms.length>1?{st:s0,dur,chord:ms,name:(identify(ms)[0]||{name:SHARPN[ms[0]%12]}).name}:{st:s0,dur,m:ms[0],name:SHARPN[ms[0]%12]});continue}
   let bendAmt=null;const mk=(()=>{const t=new Set();ns.forEach(n=>{try{if(n.isHammerPullDestination){const o=n.hammerPullOrigin;t.add(o&&o.fret>n.fret?'p':'h')}
     if(n.slideOrigin){t.add(n.slideOrigin.fret>n.fret?'\\':'/')}
     if(n.slideInType===1)t.add('si/');else if(n.slideInType===2)t.add('si\\');
     if(n.slideOutType===3||n.slideOutType===6)t.add('so/');else if(n.slideOutType===4||n.slideOutType===5)t.add('so\\');
     if(n.hasBend){const bt=n.bendType||0;if(bt>=6)t.add('pb');else t.add('b');if(bt===3||bt===4||bt===8)t.add('r');const pts=n.bendPoints||[];const mx=pts.reduce((a,q)=>Math.max(a,q.value||0),0);if(mx)bendAmt=Math.round(mx/2)}
     if(n.vibrato>0)t.add('~');if(n.isLeftHandTapped)t.add('t')}catch(e){}});return[...t].join(' ')})();
   const fl={pm:ns.some(n=>n.isPalmMute),stac:ns.some(n=>n.isStaccato),letRing:ns.some(n=>n.isLetRing),ghost:ns.some(n=>n.isGhost),harm:ns.some(n=>n.harmonicType>0),acc:ns.some(n=>(n.accentuated||0)>0),trem:!!b.isTremolo};if(bendAmt!=null)fl.bend=bendAmt;
   const ps=ns.map(n=>{const s0=Math.max(0,Math.min(S.length-1,n.string-1));return{s:s0,f:n.isDead?'x':n.fret,m:n.harmonicType===1?harmPitch(S[s0],n.fret):n.realValue,dead:n.isDead}});const real=ps.filter(p=>!p.dead);
   items.push(Object.assign(ps.length>1?{st:s0,dur,col:ps.map(p=>({s:p.s,f:p.f})),chord:real.map(p=>p.m),name:real.length?SHARPN[Math.min(...real.map(p=>p.m))%12]:'x',mk}:real.length?{st:s0,dur,pos:{s:ps[0].s,f:ps[0].f},m:ps[0].m,name:SHARPN[ps[0].m%12],mk}:{st:s0,dur,pos:{s:ps[0].s,f:'x'},mute:true,name:'x',mk},fl))}}
 if(!items.length)return{error:'That track has no notes.'};
 items.sort((a,b)=>a.st-b.st);const lastB=barsInfo[barsInfo.length-1];let steps=Math.max(lastB.st+lastB.len,items[items.length-1].st+items[items.length-1].dur);
 const bar=num*per;const lines=[];let cur=[];const byBar={};items.forEach((it,i)=>{(byBar[Math.floor(it.st/bar)]=byBar[Math.floor(it.st/bar)]||[]).push(i)});
 Object.keys(byBar).map(Number).sort((a,b)=>a-b).forEach(b=>{const idx=byBar[b];if(cur.length&&cur.length+idx.length>16){lines.push(cur);cur=[]}if(idx.length>16){for(let i=0;i<idx.length;i+=16)lines.push(idx.slice(i,i+16))}else cur.push(...idx)});if(cur.length)lines.push(cur);
 const view=kind==='perc'?'drumtab':kind==='string'?'tab':'staff';
 const std=S.length===6?[40,45,50,55,59,64]:S.length===4?[28,33,38,43]:null;const tuningName=kind==='string'&&std&&S.some((m,i)=>m!==std[i])?'Tuning: '+engNames(S).join(' '):'';
 let key=0;try{key=mb0.keySignature||0}catch(e){}let capo=0;try{capo=st.capo||0}catch(e){}
 return{items,steps,per,beats:num,den,view,S,inst:kind==='perc'?'drums':kind==='string'?(S.length<=5?'bass':'guitar'):'piano',bpm:Math.round(score.tempo)||100,lines,strings:S.length,bars:MB.length,barsInfo,key,capo,tuningName,title:score.title||''}}
function drumTabSVG(rows,cols,off){const n=rows.length,W=Math.max(220,50+cols.length*30),H=26+n*16;const y=i=>24+i*16;
 let s=`<svg class="tab dtab" viewBox="0 0 ${W} ${H}" width="${Math.min(W*1.25,900)}" role="img" aria-label="Drum tab">`;
 rows.forEach((k,i)=>s+=`<text class="tl" x="2" y="${y(i)+4}">${DRUM_LAB[k]}</text><line x1="24" x2="${W-6}" y1="${y(i)}" y2="${y(i)}"/>`);
 cols.forEach((c,j)=>{const x=44+j*30;s+=`<path class="arr" data-c="${off+j}" d="M${x-5} 2h10l-5 7z"/>`;rows.forEach((k,i)=>{if(c[k]!=null)s+=`<rect class="tb" data-c="${off+j}" x="${x-8}" y="${y(i)-7}" width="16" height="14" rx="3"/><text class="tn" data-c="${off+j}" x="${x}" y="${y(i)+4}" text-anchor="middle">${c[k]<.5?'o':'x'}</text>`})});return s+'</svg>'}

/* rhythm-aware staff notes */
function staffEvents(ex,ch){const den=ex.den||4;const q=d=>d/ex.per*(4/den);const out=[];let prevEnd=null;ch.items.forEach(it=>{if(prevEnd!=null&&it.st>prevEnd)out.push({rest:true,q:q(it.st-prevEnd)});out.push({name:it.name,m:it.m,q:q(it.dur)});prevEnd=it.st+it.dur});return out}

