/* ================= v14: 12 keys, fills, genres, solos, intervals ================= */
const KEYM=['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'],KEYm=['C','C#','D','Eb','E','F','F#','G','G#','A','Bb','B'];
const ENH={C:'C',Db:'C#','C#':'Db',D:'D',Eb:'D#','D#':'Eb',E:'E',F:'F','F#':'Gb',Gb:'F#',G:'G',Ab:'G#','G#':'Ab',A:'A',Bb:'A#','A#':'Bb',B:'B'};
function keyList(mode){return mode==='m'||mode==='minor'?KEYm:KEYM}
function keyItems(mode){return keyList(mode).map(k=>[k,BLACK.has(parse(k).pc)?`${pr(k)}/${pr(ENH[k])}`:pr(k)])}
function normKey(k,mode){const L=keyList(mode);if(!k)return L[0];const pc=parse(k).pc;return L.find(x=>parse(x).pc===pc)||L[0]}

/* ---------- grooves, fills ---------- */
GROOVES.push(
 {id:'twobeat',name:'Country two-beat',bpm:120,steps:16,feel:'Kick on 1 and 3, snare on 2 and 4, hi-hat on every beat. The heartbeat of country and Americana.',rows:{hat:'x...x...x...x...',snare:'....x.......x...',kick:'x.......x.......'}},
 {id:'train',name:'Train beat',bpm:116,steps:16,feel:'Steady snare sixteenths with accents on 2 and 4, like a steam train. Country and rockabilly.',rows:{snare:'ooooxoooooooxooo',kick:'x.......x.......'}},
 {id:'motorik',name:'Motorik',bpm:124,steps:16,feel:'The hypnotic krautrock and indie beat: straight eighths that never let up.',rows:{hat:'x.x.x.x.x.x.x.x.',snare:'....x.......x...',kick:'x.x...x.x.x...x.'}},
 {id:'motown',name:'Motown backbeat',bpm:112,steps:16,feel:'Soul and Motown: the snare on every beat over a busy kick.',rows:{hat:'x.x.x.x.x.x.x.x.',snare:'x...x...x...x...',kick:'x.....x.x.......'}},
 {id:'punk',name:'Punk drive',bpm:168,steps:16,feel:'Fast and loud, with the kick pushing the beat along.',rows:{hat:'x.x.x.x.x.x.x.x.',snare:'....x.......x...',kick:'x...x.x.x...x.x.'}},
 {id:'surf',name:'Surf beat',bpm:150,steps:16,feel:'Floor-tom eighths under a snare backbeat, straight from the 1960s.',rows:{tom2:'x.x.x.x.x.x.x.x.',snare:'....x.......x...',kick:'x.......x.......'}},
 {id:'brushes',name:'Café jazz brushes',bpm:180,steps:12,feel:'Light swing for gypsy and café jazz, with a soft snare “chunk” on 2 and 4.',rows:{ride:'x..x.xx..x.x',snare:'...o.....o..',hat:'...x.....x..',kick:'o.....o.....'}});
const FILLS={16:[
 {id:'toms',name:'Down the toms',from:8,rows:{snare:'xx......',tom1:'..xx....',tom2:'....xxxx',kick:'x...x...'}},
 {id:'snare',name:'Snare sixteenths',from:8,rows:{snare:'xxxxxxxx',kick:'x...x...'}},
 {id:'last',name:'Last-beat fill',from:12,rows:{snare:'xx..',tom1:'..x.',tom2:'...x',kick:'x...'}},
 {id:'kicksnare',name:'Snare and kick',from:8,rows:{snare:'x.x.x.x.',kick:'.x.x.x.x'}},
 {id:'around',name:'Around the kit',from:0,rows:{snare:'xxxx........x.x.',tom1:'....xxxx........',tom2:'........xxxx.x.x',kick:'x...x...x...x...'}}],
 12:[{id:'trip',name:'Triplet roll',from:6,rows:{snare:'xxx...',tom1:'...xx.',tom2:'.....x'}},
 {id:'snare3',name:'Snare triplets',from:6,rows:{snare:'xxxxxx',kick:'x..x..'}},
 {id:'last3',name:'Last-beat triplet',from:9,rows:{snare:'x..',tom1:'.x.',tom2:'..x'}}]};
function fillsFor(g){return g.groups?genFills(g):FILLS[g.steps]||FILLS[16]}
function drumStep(g,fill,N,abs){const S=g.steps,bar=Math.floor(abs/S),s=abs%S,hits={};const fb=fill&&N&&bar%N===N-1;
 const src=fb&&s>=fill.from?fill.rows:g.rows,ix=fb&&s>=fill.from?s-fill.from:s;for(const k in src){const ch=(src[k]||'')[ix];if(ch==='x')hits[k]=1;else if(ch==='o')hits[k]=.35}
 if(fill&&N&&bar>0&&bar%N===0&&s===0){hits.crash=1;delete hits.hat;delete hits.ride;delete hits.open;hits.kick=1}return hits}
function fillBarRows(g,fill){const rows={};new Set([...Object.keys(g.rows),...Object.keys(fill.rows)]).forEach(k=>{let r='';for(let s=0;s<g.steps;s++)r+=s>=fill.from?((fill.rows[k]||'')[s-fill.from]||'.'):((g.rows[k]||'')[s]||'.');rows[k]=r});return rows}

/* ---------- drum grooves lesson (with fills) ---------- */


/* ---------- jam styles by genre ---------- */
const JAMCAT={rock:'Rock & pop',minor:'Rock & pop',ballad:'Rock & pop',blues:'Blues, soul & funk',funk:'Blues, soul & funk',bossa:'Jazz'};
JAMS.push(
 {id:'indie',cat:'Rock & pop',name:'Indie',groove:'motorik',mode:'major',prog:[[6],[4],[1],[5]],scale:'major',bpm:124,tip:'Short repeated riffs and chiming arpeggios work better here than long solos.'},
 {id:'punk',cat:'Rock & pop',name:'Punk',groove:'punk',mode:'major',prog:[[1],[4],[5],[4]],scale:'minpent',bpm:168,tip:'Power chords and fast down-strokes. For lead lines, short minor pentatonic bursts.'},
 {id:'krautrock',cat:'Rock & pop',name:'Krautrock',groove:'motorik',mode:'minor',prog:[[1],[1],[7],[7]],scale:'dorian',bpm:132,tip:'Hypnotic and repetitive. Dorian over the minor chord, and let ideas build slowly.'},
 {id:'soul',cat:'Blues, soul & funk',name:'Soul',groove:'motown',mode:'major',prog:[[1],[4],[2,'m7'],[5,'7']],scale:'majpent',bpm:108,tip:'Sing your lines. Major pentatonic with a few passing notes.'},
 {id:'gypsy',cat:'Jazz',name:'Gypsy jazz',groove:'brushes',mode:'minor',prog:[[1],[4],[5,'7'],[1]],scale:'harmonic',bpm:180,tip:'Outline each chord with arpeggios. Harmonic minor fits the dominant 7th perfectly.'},
 {id:'cafe',cat:'Jazz',name:'Café swing',groove:'brushes',mode:'major',prog:[[1,'maj7'],[6,'m7'],[2,'m7'],[5,'7']],scale:'major',bpm:140,tip:'Relaxed swing. Lean on the 3rd and 7th of each chord.'},
 {id:'altcountry',cat:'Country & roots',name:'Alt-country',groove:'twobeat',mode:'major',prog:[[1],[4],[1],[5]],scale:'majpent',bpm:110,tip:'Major pentatonic with a few bends. Double-stops on the top strings sound great.'},
 {id:'country',cat:'Country & roots',name:'Country train',groove:'train',mode:'major',prog:[[1],[1],[4],[5,'7']],scale:'majpent',bpm:120,tip:'Fast major pentatonic runs and chicken-picked double-stops.'},
 {id:'reggae',cat:'Country & roots',name:'Reggae',groove:'onedrop',mode:'major',prog:[[1],[4],[1],[5]],scale:'majpent',bpm:76,tip:'Leave lots of space. Short phrases on the off-beat sit perfectly.'},
 {id:'surf',cat:'Country & roots',name:'Surf',groove:'surf',mode:'minor',prog:[[1],[1],[6],[5,'maj']],scale:'hijaz',bpm:150,tip:'Tremolo-pick the melody. Phrygian dominant gives the exotic surf sound.'});
JAMS.forEach(j=>{if(!j.cat)j.cat=JAMCAT[j.id]||'Rock & pop'});
const JAM_ORDER=['Rock & pop','Blues, soul & funk','Jazz','Country & roots'];
function jamPicker(jid){return`<div class="pickrow"><span class="eyebrow">Style</span><select class="psel" data-sel="j" aria-label="Style">${JAM_ORDER.map(c=>`<optgroup label="${c}">${JAMS.filter(j=>j.cat===c).map(j=>`<option value="${j.id}" ${j.id===jid?'selected':''}>${esc(j.name)}</option>`).join('')}</optgroup>`).join('')}</select></div>`}


/* ---------- soloing for guitar, bass and piano ---------- */
const BASS_LICKS=[
 {id:'climb',name:'Pentatonic climb',style:'Rock & funk · A minor pentatonic',bpm:90,desc:'Up through box 1, then back to the root. Pluck every note evenly.',tab:'2|0:5 2|0:8 2|1:5 2|1:7 2|2:5 2|2:7 2|3:5 2|3:7 8|2:7 8|r'},
 {id:'octpop',name:'Octave pop',style:'Funk & disco · A and G',bpm:100,desc:'Root to octave and back, then move it down a whole step. Mute the open strings.',tab:'2|0:5 2|2:7 2|0:5 2|2:7 2|0:3 2|2:5 2|0:3 2|2:5 4|0:5 4|1:7 8|2:7'},
 {id:'walkup',name:'Chromatic walk-up',style:'Blues & jazz · A to D',bpm:96,desc:'Climbs one fret at a time into the next chord. Great at the end of a phrase.',tab:'4|0:5 4|0:6 4|0:7 4|0:8 4|1:5 4|1:6 4|1:7 4|2:5'},
 {id:'funky',name:'Funky sixteenths',style:'Funk · E Dorian',bpm:92,desc:'Dead notes (x) keep the groove moving between the real notes.',tab:'1|0:0 1|0:x 1|0:0 1|2:2 2|1:2 2|1:4 1|0:0 1|0:x 2|2:2 4|1:5 4|r 12|0:0'}];
const PIANO_LICKS=[
 {id:'blues',name:'Blues lick',style:'Blues · C blues scale',bpm:84,desc:'Climb the blues scale and fall back down. The F♯ is the “blue note”.',notes:[72,75,77,78,79,82,79,77,75,72]},
 {id:'cascade',name:'Pentatonic cascade',style:'Rock & pop · A minor pentatonic',bpm:92,desc:'Tumbling down two octaves of the pentatonic, ending on the root.',notes:[81,79,76,74,72,69,67,64,69]},
 {id:'gospel',name:'Gospel turn',style:'Soul & gospel · C major',bpm:80,desc:'Circles around the 3rd and resolves home. Hold the C chord in your left hand.',notes:[76,74,72,69,72,74,76,79,76,72]},
 {id:'dorian',name:'Dorian riff',style:'Jazz & funk · D Dorian',bpm:96,desc:'Uses the bright 6th (B) that makes Dorian cool rather than sad.',notes:[74,77,79,81,83,81,79,77,74]}];
const LICKSET={guitar:LICKS,bass:BASS_LICKS,piano:PIANO_LICKS};
Object.assign(SOLO_SCALE,{indie:'major',punk:'minpent',krautrock:'dorian',soul:'majpent',gypsy:'harmonic',cafe:'major',altcountry:'majpent',country:'majpent',reggae:'majpent',surf:'hijaz'});
const SOLO_INTRO={guitar:'A solo is a melody you make up on the spot. It sounds good when you pick the right scale, land on the notes of the chord that’s playing, and leave space so your ideas can breathe. Start with the minor pentatonic box you already know.',
 bass:'Bass solos are short melodic moments: a fill at the end of a phrase, a few bars over the band, or a full solo in jazz and funk. Lock in with the drums first, then use the same pentatonic shapes as guitar, an octave lower. Your job is still the groove, so keep it rhythmic.',
 piano:'On piano your left hand holds the chord, or just its root, while your right hand improvises. Start with the scale notes lit up on the keyboard, and land on the orange chord tones when the chord changes.'};
const SOLO_TIP={guitar:['Make notes sing','Bend up to a chord tone, add vibrato on long notes, and slide into phrases.'],bass:['Lock with the kick','Start and end your phrases with the kick drum. A great bass solo still grooves.'],piano:['Keep the left hand simple','Hold the chord or play the root on beat 1. Let the right hand do the talking.']};
PAGES.solo=el=>{const inst=LICKSET[INST()]?INST():'guitar';const S=inst==='bass'?BSTR():GSTR();const LK=LICKSET[inst]||LICKS;let jid=jamFor(),key=null,playing=false,bar=0,lick=LK[0].id;const J=()=>JAMS.find(j=>j.id===jid);const md=()=>J().mode==='major'?'M':'m';
 const chords=()=>J().prog.map(([d,t])=>chordAt(key,J().mode,d,t));
 const viewHTML=()=>{const cs=chords(),c=cs[bar%cs.length];const sc=scaleNotes(key,SOLO_SCALE[jid]);const ct=chordNotes(c.root,c.t);const ctp=new Set(ct.map(n=>parse(n).pc));const name={};sc.forEach(n=>name[parse(n).pc]=n);ct.forEach(n=>{if(!name[parse(n).pc])name[parse(n).pc]=n});
  if(inst==='piano'){const on={},labels={};for(let m=60;m<=84;m++){const pc=m%12;if(name[pc]!=null){on[m]=ctp.has(pc)?'root':'on';labels[m]=name[pc]}}return keyboard({start:60,end:84,on,labels})}
  const map={};Object.keys(name).forEach(p=>map[p]={name:name[p],root:ctp.has(+p)});return fretboard({strings:S,map,frets:15})};
 const nowHTML=()=>{const cs=chords(),c=cs[bar%cs.length];return`<b>Now: ${c.sym}</b> <span class="hint">Aim for ${chordNotes(c.root,c.t).map(pr).join(', ')} on the strong beats</span>`};
 const render=()=>{key=normKey(key||(J().mode==='major'?'C':'A'),md());stopLoop();playing=false;bar=0;const cs=chords();const sc=scaleNotes(key,SOLO_SCALE[jid]);
  el.innerHTML=`<span class="eyebrow">${INST_NAME[inst]}</span><h1>Soloing</h1><p>${SOLO_INTRO[inst]||SOLO_INTRO.guitar}</p>
  <section class="panel"><h3>1. Pick the right scale</h3><div class="scroll"><table class="tbl"><thead><tr><th>When the song is…</th><th>Solo with</th><th>Sound</th></tr></thead><tbody>
   <tr><td>Rock or blues in a minor key</td><td><b>Minor pentatonic</b>, then add the ♭5 for the blues scale</td><td>Gritty and classic</td></tr>
   <tr><td>A 12-bar blues</td><td><b>Blues scale</b> from the key note; mix in major pentatonic for a sweeter sound</td><td>Bluesy</td></tr>
   <tr><td>Happy, country or pop in a major key</td><td><b>Major pentatonic</b></td><td>Bright and open</td></tr>
   <tr><td>A funky one-chord minor vamp</td><td><b>Dorian</b> (minor with a raised 6th)</td><td>Cool, not sad</td></tr>
   <tr><td>Gypsy jazz in a minor key</td><td><b>Harmonic minor</b> and chord arpeggios</td><td>Dark and dramatic</td></tr>
   <tr><td>Rock over dominant 7 chords</td><td><b>Mixolydian</b> or minor pentatonic</td><td>Bluesy major</td></tr></tbody></table></div>
   <p class="callout">Shortcut: a major key's relative minor pentatonic is the same notes as its major pentatonic. In G major, play E minor pentatonic.</p></section>
  <section class="panel"><h3>2. Solo over the band</h3><p>Start the band and improvise with the highlighted notes. Orange notes belong to the chord playing right now; land on them at the start of a bar and your solo will fit. Blue notes are the rest of the scale.</p>
   ${jamPicker(jid)}<div class="pickrow"><span class="eyebrow">Key</span>${pillsHTML('k',keyItems(md()),key)}</div>${inst==='guitar'?gtonePills():''}
   <p class="hint">Scale: ${pr(key)} ${SC[SOLO_SCALE[jid]].name.toLowerCase()} · ${sc.map(pr).join(' ')}</p>
   <div class="row"><button class="btn primary" id="sgo">${ICON.play} Start the band</button><div class="chordrow" id="sch">${cs.map((c,i)=>`<span class="cbtn ${i===0?'on':''}"><small>${c.roman}</small><b>${c.sym}</b></span>`).join('')}</div></div>
   <div id="snow" class="snow">${nowHTML()}</div><div id="sfb">${viewHTML()}</div><p class="hint" id="shear" aria-live="polite"></p>${inputPanelHTML()}</section>
  <section class="panel"><h3>3. Phrase like a singer</h3><div class="cols">
   <div class="mini"><h4>Leave space</h4><p class="o">Play a short idea, then stop for a beat or two. Silence makes the next phrase land harder.</p></div>
   <div class="mini"><h4>Repeat, then change</h4><p class="o">Play an idea twice, then change the ending. Listeners love hearing an idea grow.</p></div>
   <div class="mini"><h4>Target chord tones</h4><p class="o">Land on an orange note when the chord changes. That's the difference between noodling and a solo.</p></div>
   <div class="mini"><h4>${SOLO_TIP[inst][0]}</h4><p class="o">${SOLO_TIP[inst][1]}</p></div>
   <div class="mini"><h4>Call and response</h4><p class="o">Ask a musical question with a phrase that ends up high, answer it with one that ends on the root.</p></div>
   <div class="mini"><h4>Build up</h4><p class="o">Start low, slow and simple. Climb higher and play busier as the solo goes on.</p></div></div></section>
  <section class="panel"><h3>4. Learn some licks</h3><p>Licks are ready-made phrases. Learn them, then change the rhythm or the last note to make them your own.</p><div class="pickrow"><span class="eyebrow">Lick</span>${pillsHTML('lick',LK.map(l=>[l.id,l.name]),lick)}</div><div id="lickbox" class="stack"></div></section>`;
  bindPills(el,(g,v)=>{if(g==='j'){jid=v;key=normKey(key,md())}else if(g==='k')key=v;else if(g==='lick'){lick=v;showLick();return}else if(g==='gtone'){store.set('gtone',v);gtonePreview();return}render()});
  const ip=el.querySelector('.inpanel');if(ip)bindInputPanel(ip);
  el.querySelector('#sgo').onclick=()=>{if(playing){stopLoop();playing=false;el.querySelector('#sgo').innerHTML=ICON.play+' Start the band';return}playing=true;el.querySelector('#sgo').innerHTML='■ Stop';const bpm=J().bpm;
   startLoop(()=>{const g=GROOVES.find(x=>x.id===J().groove);return{steps:g.steps,rows:{},bpm}},{extra:(abs,t,sd,p)=>{const g=GROOVES.find(x=>x.id===J().groove);const fs=fillsFor(g);const h=drumVary(g,abs,drumStep(g,fs[Math.floor(abs/(g.steps*4))%fs.length],4,abs));for(const k in h)drum(k,t,h[k]*.8,JAMKIT[jid]||'rock');const ph=percHits(jid,g,abs);for(const k in ph)drum(k,t,ph[k]*.6,JAMKIT[jid]||'rock');
     const cs2=chords();const b=Math.floor(abs/p.steps)%cs2.length,s2=abs%p.steps,half=p.steps/2,c=cs2[b];const R=bassRootMidi(c.root);
     if(inst!=='bass'&&(s2===0||s2===half))tone(s2===half?R+7:R,t,sd*half*.9,.32,'bass');playBandChord(jid,c,s2,p.steps,t,sd,inst==='piano'?.08:.12,'guitar')},
    onStep:(a,p)=>{if(a%p.steps)return;bar=Math.floor(a/p.steps);const cs2=chords();el.querySelectorAll('#sch .cbtn').forEach((x,i)=>x.classList.toggle('on',i===bar%cs2.length));el.querySelector('#sfb').innerHTML=viewHTML();el.querySelector('#snow').innerHTML=nowHTML()}})};
  const hear=()=>{if(!document.body.contains(el)){INPUT.listeners.delete(hear);return}const h=el.querySelector('#shear');if(!h)return;if(!LISTEN()||INPUT.midi==null){h.textContent='';return}const pc=((INPUT.midi%12)+12)%12;const cs2=chords(),c=cs2[bar%cs2.length];
   const inChord=chordNotes(c.root,c.t).some(n=>parse(n).pc===pc),inScale=scaleNotes(key,SOLO_SCALE[jid]).some(n=>parse(n).pc===pc);h.textContent=`You're playing ${pcName(pc)}: ${inChord?'a chord tone. Great note to land on.':inScale?'in the scale.':'outside the scale. Try a note next to it.'}`;h.className='hint '+(inChord?'good':inScale?'':'warn')};
  INPUT.listeners.add(hear);showLick()};
 const showLick=()=>{const L=LK.find(x=>x.id===lick);const box=el.querySelector('#lickbox');box.innerHTML=`<p><b>${esc(L.name)}</b> <span class="hint">${esc(L.style)}</span><br>${esc(L.desc)}</p><div class="lickp"></div>`;let ex;
  if(L.notes){const items=L.notes.map((m,i)=>({st:i*2,dur:2,m,name:SHARPN[m%12]}));const last=items[items.length-1];let steps=last.st+last.dur;if(steps%16)steps+=16-steps%16;last.dur=steps-last.st;ex={items,steps,per:4,beats:4,view:'staff',S:STR,title:L.name,inst:'piano',bpm:L.bpm}}
  else{const{items,steps}=parseTab(L.tab,S);ex={items,steps,per:4,beats:4,view:'tab',S,title:L.name,inst,bpm:L.bpm}}
  mountPlayer(box.querySelector('.lickp'),ex,{tabOrStaff:false,srs:{id:'lick:'+inst+':'+L.id,title:'Lick: '+L.name,href:'#learn-solo'}})};
 render()};

/* ---------- intervals, rebuilt per instrument ---------- */
const IVSHORT=['R','m2','M2','m3','M3','P4','TT','P5','m6','M6','m7','M7','P8'];
const COMPOUND=[['♭9','m9',13,'1 octave + minor 2nd','The dark colour in 7♭9 chords'],['9','M9',14,'1 octave + major 2nd','Add9 and 9th chords'],['♯9','A9',15,'1 octave + minor 3rd','The “Hendrix chord”'],['11','P11',17,'1 octave + perfect 4th','Sus and 11th chords'],['♯11','A11',18,'1 octave + tritone','Lydian sound'],['♭13','m13',20,'1 octave + minor 6th','Altered dominants'],['13','M13',21,'1 octave + major 6th','13th chords in jazz and soul']];
PAGES.intervals=el=>{const inst=INST();const fretted=inst==='guitar'||inst==='bass';const S=inst==='bass'?BSTR():GSTR();let root='C',sel='P5',view='one',rs=0,score={ok:0,n:0},quizIv=null,quizRoot=60,rm=60;
 const IVS=IVL.filter(x=>x.sh!=='P1');const invOf=iv=>{const s2=12-iv.s;return s2===0?{n:'Unison'}:IVL.find(x=>x.s===s2&&x.d===9-iv.d)||IVL.find(x=>x.s===s2)};
 const off=o=>o===0?'at the same fret':o>0?`${o} fret${o>1?'s':''} higher`:`${-o} fret${o<-1?'s':''} lower`;
 const render=()=>{root=normKey(root,'M');const iv=IV(sel),top=spellUp(root,iv.s,iv.d);const pc=parse(root).pc;let vis,tips='';
  if(fretted){let rf=((pc-S[rs])%12+12)%12;if(rf<3)rf+=12;rm=S[rs]+rf;const lo=Math.max(0,rf-4),hi=Math.min(17,rf+5);const spots=[];
   for(let s=rs;s<S.length;s++)for(let f=lo;f<=hi;f++){const d=S[s]+f-rm;if(d<0||d>12)continue;const isSel=d===iv.s||d===0||(iv.s===12&&d===0);if(view==='one'&&!isSel)continue;spots.push({s,f,name:IVSHORT[d],root:d===0||d===12,cls:view==='all'&&!isSel?'sc':''})}
   vis=fretboard({strings:S,spots,frets:Math.max(12,hi+1)});
   const lines=[`On the same string: ${iv.s} fret${iv.s>1?'s':''} up.`];for(let k=1;k<=2&&rs+k<S.length;k++){const o=iv.s-(S[rs+k]-S[rs]);if(Math.abs(o)<=5)lines.push(`${k===1?'One string':'Two strings'} up: ${off(o)}.`)}
   if(inst==='guitar')lines.push('Crossing from the G to the B string, shapes move one fret higher, because those two strings are tuned a major 3rd apart instead of a 4th.');
   tips=`<ul class="ivtips">${lines.map(l=>`<li>${l}</li>`).join('')}</ul>`}
  else{rm=60+pc;const on={},labels={};on[rm]='root';on[rm+iv.s]='on';labels[rm]=root;labels[rm+iv.s]=top;for(let i=1;i<iv.s;i++){on[rm+i]='step';labels[rm+i]=String(i)}vis=keyboard({start:60,end:84,on,labels});
   tips=`<p class="hint">Count every key, black and white, from ${pr(root)} to ${pr(top)}: ${iv.s} half step${iv.s>1?'s':''}. The numbered keys are the steps in between.</p>`}
  const inv=invOf(iv);
  el.innerHTML=`<span class="eyebrow">Theory</span><h1>Intervals</h1><p>An interval is the distance between two notes. Its number counts letter names (C to E is a 3rd: C, D, E). Its quality (major, minor or perfect) comes from the exact number of half steps. Every chord, scale and melody is built from intervals, so learning their sound and their shape on your instrument pays off everywhere.</p>
  <div class="panel"><div class="pickrow"><span class="eyebrow">Start note</span>${pillsHTML('root',keyItems('M'),root)}</div>
  <div class="pickrow"><span class="eyebrow">Interval</span>${pillsHTML('iv',IVS.map(x=>[x.sh,x.sh==='A4'?'TT':x.sh]),sel)}</div>
  ${fretted?`<div class="row" style="gap:18px"><div class="pickrow"><span class="eyebrow">Root on</span>${pillsHTML('rs',S.slice(0,S.length-2).map((m,i)=>[String(i),`${SHARPN[m%12]} string`]),String(rs))}</div><div class="pickrow"><span class="eyebrow">Show</span>${pillsHTML('view',[['one','This interval'],['all','Every interval']],view)}</div></div>`:''}
  <div class="ivhead"><h3>${pr(root)} up to ${pr(top)}: ${iv.n.toLowerCase()}</h3><span class="hint">${iv.s} half steps${iv.song?` · sounds like ${esc(iv.song)}`:''}</span></div>
  <div class="row">${pbtn('ivup','Up')}${pbtn('ivdn','Down')}${pbtn('ivto','Together')}</div>
  ${vis}${tips}
  <p class="hint">Turned upside down, ${/^[aeiou]/i.test(iv.n)?'an':'a'} ${iv.n.toLowerCase()} becomes ${/^[aeiou]/i.test(inv.n||'')?'an':'a'} ${(inv.n||'').toLowerCase()}: the two always add up to an octave (12 half steps).</p></div>
  <section class="panel"><h3>All the intervals from ${pr(root)}</h3><div class="scroll"><table class="tbl"><thead><tr><th>Interval</th><th>Half steps</th><th>From ${pr(root)}</th><th>Upside down</th><th>Sounds like</th></tr></thead><tbody>${IVS.map(x=>`<tr data-k="${x.sh}" class="${x.sh===sel?'sel':''}"><td><b>${x.n}</b> <span class="formula">${x.sh}</span></td><td class="num">${x.s}</td><td>${pr(root)} → ${pr(spellUp(root,x.s,x.d))}</td><td>${esc(invOf(x).n||'')}</td><td>${x.song?esc(x.song[0].toUpperCase()+x.song.slice(1)):''}</td></tr>`).join('')}</tbody></table></div>
  <p class="callout">The augmented 4th and diminished 5th are the same sound, six half steps, called the tritone. Which name you use depends on the spelling: C to F♯ is a 4th, C to G♭ is a 5th.</p></section>
  <section class="panel"><h3>Ear check</h3><p class="hint">Hear a mystery interval and name it. Your score here isn't saved; for full ear training use Practice.</p><div class="row"><button class="btn primary small" id="qgo">${ICON.play} Play a mystery interval</button><span class="hint" id="qsc">${score.n?`${score.ok} of ${score.n} right`:''}</span></div><div class="pills" id="qopts" hidden>${IVS.filter(x=>x.sh!=='d5').map(x=>`<button class="pill" data-q="${x.s}">${x.sh==='A4'?'Tritone':x.n}</button>`).join('')}</div><p class="hint" id="qfb" aria-live="polite"></p></section>
  <section class="panel"><h3>Beyond the octave</h3><p>Intervals bigger than an octave are called compound intervals. They're named like the simple interval plus 7 (a 2nd plus an octave is a 9th), and they give chords like 9ths and 13ths their names.</p><div class="cols">${COMPOUND.map(([n,sh,st,how,use])=>`<button class="mini" data-cmp="${st}"><h4>${n} <span class="formula">${st} half steps</span></h4><span class="o">${how}. ${use}.</span></button>`).join('')}</div></section>`;
  bindPills(el,(g,v)=>{if(g==='qz')return;if(g==='root')root=v;else if(g==='iv')sel=v;else if(g==='rs')rs=+v;else if(g==='view')view=v;render();if(g==='iv'||g==='root'){const i=IV(sel);play([rm,rm+i.s],{mode:'seq',gap:.55})}});
  el.querySelector('#ivup').onclick=()=>play([rm,rm+iv.s],{mode:'seq',gap:.55});el.querySelector('#ivdn').onclick=()=>play([rm+iv.s,rm],{mode:'seq',gap:.55});el.querySelector('#ivto').onclick=()=>play([rm,rm+iv.s]);
  el.querySelectorAll('tr[data-k]').forEach(tr=>tr.onclick=()=>{sel=tr.dataset.k;render();const i=IV(sel);play([rm,rm+i.s],{mode:'seq',gap:.55})});
  el.querySelectorAll('[data-cmp]').forEach(b=>b.onclick=()=>play([rm,rm+ +b.dataset.cmp],{mode:'seq',gap:.55}));
  const qo=el.querySelector('#qopts'),qf=el.querySelector('#qfb');
  const ask=()=>{const pool=IVS.filter(x=>x.sh!=='d5');quizIv=pool[Math.floor(Math.random()*pool.length)];quizRoot=(fretted?(inst==='bass'?36:48):57)+Math.floor(Math.random()*10);qo.hidden=false;qf.className='hint';qf.textContent='Which interval was that? Press Hear it again to repeat it.';el.querySelector('#qgo').innerHTML=ICON.play+' Hear it again';play([quizRoot,quizRoot+quizIv.s],{mode:'seq',gap:.6})};
  el.querySelector('#qgo').onclick=()=>{if(quizIv)play([quizRoot,quizRoot+quizIv.s],{mode:'seq',gap:.6});else ask()};
  qo.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{if(!quizIv)return;const ok=+b.dataset.q===quizIv.s;score.n++;if(ok)score.ok++;const an=/^[aeiou]/i.test(quizIv.n)?'an':'a';qf.textContent=ok?`Yes, ${an} ${quizIv.n.toLowerCase()}.${quizIv.song?` Think of ${quizIv.song}.`:''}`:`Not quite: it was ${an} ${quizIv.n.toLowerCase()} (${quizIv.s} half steps).`;qf.className='hint '+(ok?'good':'warn');el.querySelector('#qsc').textContent=`${score.ok} of ${score.n} right`;quizIv=null;qo.hidden=true;el.querySelector('#qgo').innerHTML=ICON.play+' Play another'})};
 render()};

/* ---------- v14: new techniques, legends and a public-domain rag ---------- */
(()=>{const rep=(t,n)=>Array(n).fill(t).join(' ');
Object.assign(TECH.guitar,{
 travis:{name:'Travis picking',desc:'The thumb alternates bass notes on beats while the fingers pick melody notes in between. The sound of country and folk.',per:4,beats:4,bpm:90,tab:'2|1:3+4:1 2|3:0 2|2:2 2|4:1 2|1:3 2|3:0 2|2:2+4:1 2|3:0 2|0:3+4:0 2|3:0 2|2:0 2|4:0 2|0:3 2|3:0 2|2:0+4:0 2|3:0'},
 chicken:{name:'Chicken picking',desc:'Snappy notes mixed with muted “clucks” (x), plucked with pick and fingers together. Country twang.',per:4,beats:4,bpm:100,tab:'2|2:2+3:2 2|2:x+3:x 2|2:2+3:2 2|4:3 2|4:x 2|4:3 2|5:2 2|4:3 2|3:4 2|3:x 2|3:4 2|2:2 2|2:x 2|2:2 4|1:0'},
 skank:{name:'Reggae skank',desc:'Short, choppy chords on the off-beats only. Let go of the chord right away so it sounds like a “chk”.',per:4,beats:4,bpm:76,tab:rep('2|r 2|3:2+4:3+5:2',4)+' '+rep('2|r 2|3:0+4:0+5:3',4)},
 tremolo:{name:'Tremolo picking',desc:'Very fast down-up picking on each note so it sounds like one long buzzing note. Classic surf guitar.',per:4,beats:4,bpm:90,tab:[rep('1|0:0',8),rep('1|0:3',4),rep('1|0:2',4),rep('1|0:5',4),rep('1|0:3',4),rep('1|0:1',4),rep('1|0:0',4)].join(' ')},
 doublestops:{name:'Double-stops',desc:'Two notes played together on neighbouring strings, often with a bend. Used in country, blues and alt-country solos.',per:4,beats:4,bpm:84,tab:'4|4:5+5:5 2|4:7+5:7 2|4:7+5:7|b 4|4:5+5:5 4|3:6+4:5 4|3:4+4:5 4|3:6+4:7 8|3:6+4:5|~'},
 mutedriff:{name:'Indie muted riff',desc:'A single-note riff with muted strums between the notes, played tight with the drums.',per:4,beats:4,bpm:120,tab:rep('2|1:2 2|1:x 2|2:4 2|1:x 2|1:2 2|2:4 2|2:2 2|1:x',2)}});
Object.assign(TECH.bass,{hook:{name:'High melodic bass',desc:'Playing melodies high on the neck so the bass sings like a lead instrument. A post-punk trademark.',per:4,beats:4,bpm:126,tab:'2|2:9 2|2:7 2|2:9 2|3:7 4|2:9 4|2:7 2|2:5 2|2:7 2|2:9 2|3:7 8|2:7'}});
Object.assign(TECH.drums,{
 train:{name:'Train beat',desc:'Constant snare sixteenths with accents on 2 and 4, like a locomotive.',groove:'train'},
 motorik:{name:'Motorik beat',desc:'Steady eighths that never change: hypnotic and driving.',groove:'motorik'},
 brushes:{name:'Café jazz brushes',desc:'Light swing on the ride with soft snare hits on 2 and 4.',groove:'brushes'},
 twobeat:{name:'Country two-beat',desc:'Kick on 1 and 3, snare on 2 and 4: simple and bouncy.',groove:'twobeat'}});
Object.assign(TECH.piano,{
 stride:{name:'Stride left hand',desc:'The left hand jumps between a low bass note on the beat and a chord in the middle of the keyboard.',chords:[['C',[36]],['C',[55,60,64]],['G',[43]],['C',[55,60,64]],['F',[41]],['F',[57,60,65]],['C',[48]],['C',[55,60,64]]],dur:4,bpm:96},
 pump:{name:'Country pump',desc:'Bass note then chord in steady eighths. Keep the chords short and bouncy.',chords:[['C',[36]],['C',[55,60,64]],['C',[43]],['C',[55,60,64]],['C',[36]],['C',[55,60,64]],['C',[43]],['C',[55,60,64]],['G',[43]],['G',[55,59,62]],['G',[38]],['G',[55,59,62]],['G',[43]],['G',[55,59,62]],['G',[38]],['G',[55,59,62]]],dur:2,bpm:120},
 charleston:{name:'Charleston rhythm',desc:'Chord on beat 1, then again on the “and” of 2. The bounce of 1920s jazz and swing.',chords:[['C6',[48,57,60,64],6],['C6',[48,57,60,64],10],['F6',[53,57,62,65],6],['F6',[53,57,62,65],10]],dur:4,bpm:110},
 slipnote:{name:'Slip-note',desc:'Slide from a grace note a step below into the melody note, for a country, twangy sound.',notes:[[74,'D'],[76,'E'],[72,'C'],[74,'D'],[76,'E'],[79,'G'],[76,'E'],[72,'C'],[69,'A'],[71,'B'],[72,'C'],[74,'D'],[76,'E'],[74,'D'],[72,'C'],[72,'C']],dur:2,bpm:100}});
PD.entertainer={title:'The Entertainer (opening)',by:'Scott Joplin',per:4,beats:4,bpm:80,pd:true,notes:[[13,1,74],[14,1,75],[15,1,76],[16,2,84],[18,1,76],[19,2,84],[21,1,76],[22,10,84],[34,1,84],[35,1,86],[36,1,87],[37,1,88],[38,1,84],[39,1,86],[40,2,88],[42,1,83],[43,2,86],[45,19,84]],techs:['Syncopation: notes that land between the beats','Chromatic pickup (D, D♯, E)','Octave leaps'],note:'Published in 1902 and now public domain. Ragtime is all about syncopated right-hand melodies over a steady left hand.'};
const L=(genre,name,blurb,songs)=>({genre,name,blurb,songs});
PLAYDB.guitar.push(
 L('French & café jazz','Stochelo Rosenberg','A leading modern gypsy-jazz guitarist, famous for his speed and clean tone.',[['Bossa Dorado',['gypsy','arpeggio'],'Minor-key melody with arpeggios over each chord.'],['Sweet Georgia Brown',['gypsy','legato'],'Fast swing lines with rest-stroke picking.']]),
 L('Country & Americana','Jason Isbell','Alt-country songwriter whose playing mixes open chords with tasteful double-stops.',[['Cover Me Up',['arpeggio','slides'],'Open-tuned fingerpicked accompaniment.'],['24 Frames',['jangle','doublestops'],'Bright strumming with double-stop fills.']]),
 L('Indie','Jeff Tweedy','Wilco\'s leader: folk chords, noisy textures and simple, singing lines.',[['Jesus, Etc.',['jangle','arpeggio'],'Gentle strummed chords with picked melody.'],['Impossible Germany',['pent','bends'],'Long, melodic guitar solos.']]),
 L('Country & Americana','Lucinda Williams','Raw, bluesy roots rock and country.',[['Car Wheels on a Gravel Road',['jangle','doublestops'],'Driving country-rock rhythm.'],['Righteously',['pent','bends'],'Bluesy riffs and bends.']]),
 L('Country & Americana','Chet Atkins','“Mr Guitar”, who made Travis picking famous.',[['Windy and Warm',['travis'],'Thumb bass with melody on top.'],['Mister Sandman',['travis','arpeggio'],'Chord melody with alternating bass.']]),
 L('Country & Americana','Brad Paisley','Modern country player known for chicken picking and fast runs.',[['Ticks',['chicken','doublestops'],'Twangy fills between vocal lines.'],['Mud on the Tires',['chicken','bends'],'Country lead lines with bends.']]),
 L('Indie','Jonny Greenwood','Radiohead\'s guitarist, mixing arpeggios, effects and bursts of noise.',[['Paranoid Android',['arpeggio','power'],'Shifts from picked chords to heavy riffs.'],['Just',['legato','power'],'Twisting chromatic riff and wild solo.']]),
 L('Indie','Albert Hammond Jr.','The Strokes\' rhythm guitarist: tight, clean, interlocking parts.',[['Last Nite',['downpick','mutedriff'],'Choppy strummed eighths.'],['Reptilia',['mutedriff','octaves'],'A single-note riff with muted strums.']]),
 L('Indie','Alex Turner','Arctic Monkeys\' frontman, from fast post-punk riffs to slinky desert-rock.',[['I Bet You Look Good on the Dancefloor',['downpick','power'],'Fast power-chord riffs.'],['Do I Wanna Know?',['pent','mutedriff'],'A slow, heavy single-note riff.']]),
 L('Rock','Dick Dale','“King of the Surf Guitar”, famous for rapid tremolo picking.',[['Misirlou',['tremolo'],'Tremolo-picked melody using Phrygian dominant.'],['Let\'s Go Trippin\'',['tremolo','shuffle'],'Classic surf twang.']]),
 L('Rock','Brian Setzer','Rockabilly revival hero of the Stray Cats.',[['Rock This Town',['shuffle','doublestops'],'Swinging rockabilly rhythm with double-stop fills.'],['Stray Cat Strut',['arpeggio','legato'],'Jazzy minor-key chords and runs.']]),
 L('Reggae','Bob Marley','His band\'s guitars defined the off-beat reggae skank.',[['Stir It Up',['skank'],'Off-beat chord chops.'],['Is This Love',['skank'],'Off-beat skank chords under the vocal.']]),
 L('Soul & R&B','Steve Cropper','Stax Records\' house guitarist, the master of short, perfect fills.',[['Green Onions',['shuffle','pent'],'A blues in F with stinging fills.'],['(Sittin\' On) The Dock of the Bay',['doublestops','arpeggio'],'Gentle double-stops between vocal lines.']]),
 L('Soul & R&B','Curtis Mayfield','Soul guitarist who played sweet chord fills in an open tuning.',[['People Get Ready',['doublestops','arpeggio'],'Chord-melody fills.'],['Move On Up',['funk'],'Driving funky strumming.']]),
 L('Folk & traditional','Nick Drake','Fingerpicking songwriter who used unusual open tunings.',[['Pink Moon',['travis','arpeggio'],'Fingerpicked chords with a moving bass.'],['River Man',['arpeggio'],'Flowing picked patterns in 5/4.']]));
PLAYDB.bass.push(
 L('Punk & post-punk','Peter Hook','Joy Division and New Order bassist who played melodies high on the neck.',[['Love Will Tear Us Apart',['hook'],'The bass plays the lead melody.'],['Ceremony',['hook','root8'],'Driving eighths and high melodic lines.']]),
 L('Punk & post-punk','Paul Simonon','The Clash\'s bassist, mixing punk drive with reggae grooves.',[['The Guns of Brixton',['reggae'],'A deep, spacious reggae bass line.'],['London Calling',['root8','r5'],'Punchy root notes with the drums.']]),
 L('Indie','Kim Deal','The Pixies and The Breeders\' bassist: simple, catchy and huge.',[['Gigantic',['root8','melodic'],'Simple melodic lines that drive the song.'],['Cannonball',['root8'],'A memorable eighth-note line.']]),
 L('Soul & R&B','Donald “Duck” Dunn','Stax and Booker T. & the M.G.\'s bassist, the definition of “in the pocket”.',[['Green Onions',['walk','r5'],'A 12-bar blues bass line.'],['Soul Man',['r5','octave'],'Bouncy soul groove.']]),
 L('Country & Americana','Bob Moore','Nashville session legend behind thousands of country records.',[['Oh, Pretty Woman',['r5','root8'],'Root-fifth country groove under the riff.'],['Crazy',['walk','r5'],'Smooth walking between chords.']]),
 L('Jazz','Charles Mingus','Bassist and composer who led some of jazz\'s boldest bands.',[['Goodbye Pork Pie Hat',['walk','melodic'],'Slow blues with expressive lines.'],['Moanin\'',['walk'],'Driving walking bass in a big band.']]));
PLAYDB.drums.push(
 L('Indie','Fabrizio Moretti','The Strokes\' drummer, known for minimal, motorik-style beats.',[['Last Nite',['rockbeat','motorik'],'Steady straight-eighth groove.'],['Someday',['rockbeat'],'A simple, catchy backbeat.']]),
 L('Indie','Matt Helders','Arctic Monkeys drummer famous for fast, busy grooves and fills.',[['Brianstorm',['toms','fills'],'Pounding toms and big fills.'],['Fluorescent Adolescent',['rockbeat','fills'],'Bouncy beat with plenty of fills.']]),
 L('Indie','Phil Selway','Radiohead\'s drummer, with precise and inventive grooves.',[['15 Step',['ghost16'],'A groove in 5/4 with lots of ghost notes.'],['Airbag',['ghost16','fills'],'Busy, broken-up grooves.']]),
 L('Indie','Klaus Dinger','Neu! drummer who invented the motorik beat.',[['Hallogallo',['motorik'],'Ten minutes of hypnotic steady eighths.'],['Für Immer',['motorik'],'The motorik beat in its purest form.']]),
 L('Country & Americana','W.S. “Fluke” Holland','Johnny Cash\'s drummer, master of the train beat.',[['Folsom Prison Blues',['train'],'The classic country train beat.'],['I Walk the Line',['train','twobeat'],'Brushes on a steady two-beat.']]),
 L('Soul & R&B','Al Jackson Jr.','Stax drummer, famous for the deepest pocket in soul.',[['Green Onions',['shuffle'],'A relaxed blues shuffle.'],['Let\'s Stay Together',['rockbeat','ghost16'],'Laid-back soul groove.']]),
 L('Jazz','Kenny Clarke','Bebop pioneer who moved the beat to the ride cymbal.',[['Bags\' Groove',['swing','brushes'],'Swing on the ride with light accents.'],['Django',['brushes','swing'],'Gentle brushwork in a ballad.']]));
PLAYDB.piano.push(
 L('French & café jazz','Michel Legrand','French composer and pianist, a master of lush jazz harmony.',[['The Windmills of Your Mind',['jazzvoicings','arps'],'Rich chords under a winding melody.'],['I Will Wait for You',['jazzvoicings','ballad'],'Romantic minor-key ballad.']]),
 L('French & café jazz','Erik Satie','His calm, simple pieces are public domain, so learn them freely.',[['Gymnopédie No. 1',['waltz','ballad'],'Slow 3/4 left hand and a floating melody.'],['Gnossienne No. 1',['ballad'],'Mysterious, free-flowing melody.']]),
 L('Jazz','Scott Joplin','“King of Ragtime”. His music is public domain, so the notes are included.',[['The Entertainer (opening)',['pd:entertainer']],['Maple Leaf Rag',['stride'],'The rag that made ragtime famous.']]),
 L('Jazz','Fats Waller','Stride piano giant with huge left-hand leaps and humour.',[['Ain\'t Misbehavin\'',['stride','charleston'],'Stride left hand under a swinging melody.'],['Handful of Keys',['stride'],'A stride showpiece.']]),
 L('Country & Americana','Floyd Cramer','Nashville pianist who invented the slip-note style.',[['Last Date',['slipnote'],'The slip-note sound in its most famous form.'],['On the Rebound',['pump','boogie'],'Bouncy, upbeat country piano.']]),
 L('Indie','Ben Folds','Piano-rock songwriter who plays the piano like a rock guitar.',[['Brick',['ballad','arps'],'Gentle broken chords.'],['Rockin\' the Suburbs',['pump','boogie'],'Hard-hitting rock piano.']]),
 L('Indie','Regina Spektor','Anti-folk songwriter with classical training.',[['Samson',['ballad','arps'],'Simple, beautiful chord accompaniment.'],['Fidelity',['alberti','arps'],'Bouncy broken chords.']]),
 L('Soul & R&B','Booker T. Jones','Organist of Booker T. & the M.G.\'s.',[['Green Onions',['boogie','pump'],'The famous blues organ riff.'],['Time Is Tight',['pump'],'Soul organ comping.']]));
CURR.bass.push(['Soloing and fills','solo',['world'],'Play the pentatonic climb lick, then make up your own two-bar fill over the jam band.']);
CURR.piano.push(['Soloing','solo',['world'],'Hold a C chord in your left hand and improvise with the C blues scale in your right.']);
})();
