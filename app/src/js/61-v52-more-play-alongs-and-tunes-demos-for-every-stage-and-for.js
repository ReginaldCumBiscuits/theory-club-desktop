/* ================= v52: more play-alongs and tunes, demos for every stage and for the DAWs ================= */
Object.assign(DEMO_CH,{F:[1,3,3,2,1,1],Bm:[null,2,4,4,3,2],Cmaj7:[null,3,2,0,0,0],Dm7:[null,null,0,2,1,1],G7:[3,2,0,0,0,1],Am7:[null,0,2,0,1,0],E7:[0,2,0,1,0,0],Dm:[null,null,0,2,3,1],Fmaj7:[null,null,3,2,1,0]});
Object.assign(DEMO_FG,{F:[1,3,4,2,1,1],Bm:[0,1,3,4,2,1],Cmaj7:[0,3,2,0,0,0],Dm7:[0,0,0,2,1,1],G7:[3,2,0,0,0,1],Am7:[0,0,2,0,1,0],E7:[0,2,0,1,0,0],Dm:[0,0,0,2,3,1],Fmaj7:[0,0,3,2,1,0]});
/* drum hands from the pattern: R for hi-hat, L for snare (a typical right-handed kit), K for a kick on its own */
const dHands=rows=>{const n=Object.values(rows)[0].length;let h='';for(let i=0;i<n;i++)h+=rows.hat&&rows.hat[i]==='x'?'R':rows.snare&&rows.snare[i]==='x'?'L':rows.kick&&rows.kick[i]==='x'?'K':'.';return h};
Object.assign(CDEMOS.guitar,{
 4:{t:'Barre chords: F and Bm, then back to open chords',kind:'chords',seq:['F','Bm','C','G'],bpm:60},
 5:{t:'The G major scale, three notes on each string',kind:'frets',str:GT,seq:[[0,3,1],[0,5,2],[0,7,4],[1,3,1],[1,5,2],[1,7,4],[2,4,1],[2,5,2],[2,7,4],[3,4,1],[3,5,2],[3,7,4],[4,5,1],[4,7,3],[4,8,4]],bpm:80},
 6:{t:'A ii–V–I in C: Dm7, G7, Cmaj7',kind:'chords',seq:['Dm7','G7','Cmaj7','Cmaj7'],bpm:70},
 7:{t:'An A minor arpeggio across the strings',kind:'frets',str:GT,seq:[[0,5,1],[0,8,4],[1,7,3],[2,7,3],[3,5,1],[4,5,1],[5,5,1],[5,8,4]],bpm:76},
 8:{t:'The A Dorian mode',kind:'frets',str:GT,seq:[[0,5,1],[0,7,3],[0,8,4],[1,5,1],[1,7,3],[1,9,4],[2,5,1],[2,7,3]],bpm:76}});
Object.assign(CDEMOS.bass,{
 4:{t:'A walking bass line in C',kind:'frets',str:BT,seq:[[1,3,2],[2,2,1],[2,5,4],[3,2,1],[0,1,1],[0,5,4],[1,3,2],[1,5,4]],bpm:90},
 5:{t:'The A minor pentatonic',kind:'frets',str:BT,seq:[[0,5,1],[0,8,4],[1,5,1],[1,7,3],[2,5,1],[2,7,3]],bpm:80},
 6:{t:'Chord tones of Cmaj7: 1, 3, 5, 7',kind:'frets',str:BT,seq:[[1,3,2],[2,2,1],[2,5,4],[3,4,3],[3,5,4]],bpm:76},
 7:{t:'The G major scale',kind:'frets',str:BT,seq:[[0,3,2],[0,5,4],[1,2,1],[1,3,2],[1,5,4],[2,2,1],[2,4,3],[2,5,4]],bpm:80},
 8:{t:'Walking through a ii–V–I in C, chord tones only',kind:'frets',str:BT,seq:[[1,5,4],[2,3,2],[3,2,1],[3,5,4],[0,3,2],[1,2,1],[1,5,4],[2,3,2],[1,3,2],[2,2,1],[2,5,4],[3,4,3]],bpm:90}});
Object.assign(CDEMOS.piano,{
 4:{t:'Seventh chords for a ii–V–I in C (right hand)',kind:'keys',chords:true,seq:[[[62,65,69,72],'Dm7'],[[62,65,67,71],'G7'],[[60,64,67,71],'Cmaj7']],bpm:50},
 5:{t:'C major arpeggio, two octaves',kind:'keys',seq:[[60,1],[64,2],[67,3],[72,1],[76,2],[79,3],[84,5],[79,3],[76,2],[72,1],[67,3],[64,2],[60,1]],bpm:76},
 6:{t:'Seventh chords on each step: Cmaj7, Dm7, Em7, Fmaj7',kind:'keys',chords:true,seq:[[[60,64,67,71],'Cmaj7'],[[62,65,69,72],'Dm7'],[[64,67,71,74],'Em7'],[[65,69,72,76],'Fmaj7']],bpm:50},
 7:{t:'The C blues scale',kind:'keys',seq:[[60,1],[63,2],[65,3],[66,4],[67,1],[70,3],[72,4]],bpm:72},
 8:{t:'The chromatic scale, with standard fingering',kind:'keys',seq:[[60,1],[61,3],[62,1],[63,3],[64,1],[65,2],[66,3],[67,1],[68,3],[69,1],[70,3],[71,1],[72,2]],bpm:80}});
{const G={4:{t:'A 16th-note hi-hat groove',rows:{hat:'xxxxxxxxxxxxxxxx',snare:'....x.......x...',kick:'x.....x.x.......'},steps:16,hands:'RLRLRLRLRLRLRLRL',bpm:80},
 5:{t:'The shuffle: triplets with the middle one left out',rows:{hat:'x.xx.xx.xx.x',snare:'...x.....x..',kick:'x.....x.....'},steps:12,bpm:90},
 6:{t:'The double paradiddle: R L R L R R, L R L R L L',rows:{snare:'xxxxxxxxxxxx'},steps:12,hands:'RLRLRRLRLRLL',bpm:70},
 7:{t:'A linear groove: no two drums at once',rows:{hat:'.xx..x.xxx.x..xx',snare:'....x.......x...',kick:'x..x..x...x..x..'},steps:16,bpm:84},
 8:{t:'A half-time groove',rows:{hat:'x.x.x.x.x.x.x.x.',snare:'........x.......',kick:'x......x..x.....'},steps:16,bpm:76}};
 for(const n in G){const d=G[n];CDEMOS.drums[n]=Object.assign({kind:'drums',hands:d.hands||dHands(d.rows)},d)}}
Object.assign(CDEMOS.voice,{
 4:{t:'An arpeggio: do mi so do, and back',kind:'keys',sing:true,seq:[[60,'do'],[64,'mi'],[67,'so'],[72,'do'],[67,'so'],[64,'mi'],[60,'do']],bpm:66},
 5:{t:'The natural minor scale: la to la',kind:'keys',sing:true,seq:[[57,'la'],[59,'ti'],[60,'do'],[62,'re'],[64,'mi'],[65,'fa'],[67,'so'],[69,'la']],bpm:60},
 6:{t:'Leaps of a fourth and a fifth',kind:'keys',sing:true,seq:[[60,'do'],[65,'fa'],[60,'do'],[67,'so'],[62,'re'],[67,'so'],[62,'re'],[69,'la']],bpm:60},
 7:{t:'The chromatic scale',kind:'keys',sing:true,seq:[[60,'do'],[61,'di'],[62,'re'],[63,'ri'],[64,'mi'],[65,'fa'],[66,'fi'],[67,'so'],[68,'si'],[69,'la'],[70,'li'],[71,'ti'],[72,'do']],bpm:60},
 8:{t:'Harmony: a third above C D E D C',kind:'keys',sing:true,seq:[[64,'mi'],[65,'fa'],[67,'so'],[65,'fa'],[64,'mi']],bpm:56}});
/* the DAW courses: watch the pattern you'll program */
{const D={1:{t:'Program a basic beat',kind:'drums',bpm:90,steps:16,rows:{hat:'x.x.x.x.x.x.x.x.',snare:'....x.......x...',kick:'x.......x.x.....'}},
 2:{t:'A four-chord progression in the piano roll: C, Am, F, G',kind:'keys',chords:true,seq:[[[60,64,67],'C'],[[57,60,64],'Am'],[[53,57,60],'F'],[[55,59,62],'G']],bpm:60},
 3:{t:'A bassline that follows the chords',kind:'keys',seq:[[48,'C'],[48,'C'],[45,'A'],[45,'A'],[41,'F'],[41,'F'],[43,'G'],[43,'G']],bpm:90},
 4:{t:'Four on the floor, with off-beat hi-hats',kind:'drums',bpm:120,steps:16,rows:{hat:'..x...x...x...x.',snare:'....x.......x...',kick:'x...x...x...x...'}},
 6:{t:'A syncopated bassline: notes off the beat',kind:'keys',seq:[[45,'A'],[45,'A'],[48,'C'],[45,'A'],[41,'F'],[41,'F'],[43,'G'],[43,'G']],bpm:118},
 7:{t:'Programming a drum fill into the next bar',kind:'drums',bpm:100,steps:16,rows:{hat:'x.x.x.x.........',snare:'....x...xxxxxxxx',kick:'x.....x.........'}},
 8:{t:'Spread voicings: chords that leave room in the mix',kind:'keys',chords:true,seq:[[[48,55,64,71],'Cmaj7'],[[45,52,60,67],'Am7'],[[41,48,57,64],'Fmaj7'],[[43,50,59,65],'G7']],bpm:50},
 5:{t:'A synth arpeggio over Am, F, C, G',kind:'keys',seq:[[57,'A'],[60,'C'],[64,'E'],[60,'C'],[53,'F'],[57,'A'],[60,'C'],[57,'A'],[48,'C'],[52,'E'],[55,'G'],[52,'E'],[55,'G'],[59,'B'],[62,'D'],[59,'B']],bpm:110}};
 for(const n in D){D[n].daw=true;if(D[n].kind==='drums')D[n].hands=''}
 CDEMOS.ableton=D;CDEMOS.logic=D;CDEMOS.midi=D}

/* ---- more play-alongs ---- */
PA.push(
 ['Imagine','John Lennon','C',76,[['C',2],['Cmaj7',2],['F',4]]],
 ['Hey Jude','The Beatles','F',74,[['F',4],['C',4],['C7',4],['F',4],['Bb',4],['F',4],['C',4],['F',4]]],
 ['Wild Thing','The Troggs','A',112,[['A',1],['D',1],['E',1],['D',1]]],
 ['Louie Louie','The Kingsmen','A',120,[['A',2],['D',2],['Em',2],['D',2]]],
 ['Good Riddance (Time of Your Life)','Green Day','G',95,[['G',4],['C',4],['D',4],['G',4]]],
 ['Wonderwall','Oasis','Em',87,[['Em7',4],['G',4],['Dsus4',4],['A7sus4',4]]],
 ['Brown Eyed Girl','Van Morrison','G',150,[['G',4],['C',4],['G',4],['D',4]]],
 ['Hotel California','Eagles','Bm',74,[['Bm',4],['F#',4],['A',4],['E',4],['G',4],['D',4],['Em',4],['F#',4]]],
 ['House of the Rising Sun','Traditional','Am',120,[['Am',3],['C',3],['D',3],['F',3],['Am',3],['C',3],['E',6]]],
 ['Johnny B. Goode','Chuck Berry','Bb',168,[['Bb',16],['Eb',8],['Bb',8],['F',4],['Eb',4],['Bb',8]]],
 ['Smells Like Teen Spirit','Nirvana','F',117,[['F5',4],['Bb5',4],['Ab5',4],['Db5',4]]],
 ['Every Breath You Take','The Police','G',117,[['G',8],['Em',8],['C',4],['D',4],['G',8]]],
 ['I\'m Yours','Jason Mraz','B',76,[['B',4],['F#',4],['G#m',4],['E',4]]],
 ['Viva la Vida','Coldplay','Ab',138,[['Db',4],['Eb',4],['Ab',4],['Fm',4]]],
 ['Clocks','Coldplay','Eb',131,[['Eb',4],['Bbm',8],['Fm',4]]],
 ['Royals','Lorde','D',85,[['D',8],['C',4],['G',4]]],
 ['Wake Me Up','Avicii','Bm',124,[['Bm',4],['G',4],['D',4],['A',4]]],
 ['Counting Stars','OneRepublic','C#m',122,[['C#m',4],['E',4],['B',4],['A',4]]],
 ['Despacito','Luis Fonsi','Bm',89,[['Bm',4],['G',4],['D',4],['A',4]]],
 ['Jolene (capo 4 shapes)','Dolly Parton','Am',112,[['Am',4],['C',4],['G',4],['Am',4],['G',4],['Em',4],['Am',8]]],
 ['Island in the Sun','Weezer','Em',116,[['Em',4],['Am',4],['D',4],['G',4]]],
 ['Ring of Fire','Johnny Cash','G',105,[['G',4],['C',2],['G',2],['D',2],['G',6]]],
 ['Canon in D','Pachelbel (public domain)','D',60,[['D',4],['A',4],['Bm',4],['F#m',4],['G',4],['D',4],['G',4],['A',4]]],
 ['Minor blues in A','Practice','Am',90,[['Am',16],['Dm',8],['Am',8],['E7',4],['Dm',4],['Am',4],['E7',4]]],
 ['12-bar blues in G','Practice','G',110,[['G',16],['C',8],['G',8],['D',4],['C',4],['G',4],['D',4]]]);
PDTUNES.push(
 ['Happy Birthday','Traditional (public domain)',100,[[55,.75],[55,.25],[57,1],[55,1],[60,1],[59,2],[55,.75],[55,.25],[57,1],[55,1],[62,1],[60,2],[55,.75],[55,.25],[67,1],[64,1],[60,1],[59,1],[57,2],[65,.75],[65,.25],[64,1],[60,1],[62,1],[60,2]],[['C',3],['G',3],['G',3],['C',3],['C',3],['F',3],['C',2],['G',2],['C',3]]],
 ['Jingle Bells','James Lord Pierpont (public domain)',120,[[64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1.5],[62,.5],[64,4],[65,1],[65,1],[65,1.5],[65,.5],[65,1],[64,1],[64,1],[64,.5],[64,.5],[64,1],[62,1],[62,1],[64,1],[62,2],[67,2]],[['C',8],['C',4],['C',4],['F',4],['C',4],['D7',4],['G',4]]],
 ['Yankee Doodle','Traditional',120,[[60,1],[60,1],[62,1],[64,1],[60,1],[64,1],[62,1],[55,1],[60,1],[60,1],[62,1],[64,1],[60,2],[59,2],[60,1],[60,1],[62,1],[64,1],[65,1],[64,1],[62,1],[60,1],[59,1],[55,1],[57,1],[59,1],[60,2],[60,2]],[['C',4],['G',4],['C',4],['G',4],['C',4],['F',4],['G',4],['C',4]]],
 ['Old MacDonald','Traditional',110,[[67,1],[67,1],[67,1],[62,1],[64,1],[64,1],[62,2],[71,1],[71,1],[69,1],[69,1],[67,4]],[['G',4],['C',2],['G',2],['G',2],['D',2],['G',4]]],
 ['London Bridge','Traditional',110,[[67,1.5],[69,.5],[67,1],[65,1],[64,1],[65,1],[67,2],[62,1],[64,1],[65,2],[64,1],[65,1],[67,2],[67,1.5],[69,.5],[67,1],[65,1],[64,1],[65,1],[67,2],[62,2],[67,2],[64,1],[60,3]],[['C',8],['G',2],['C',2],['G',2],['C',2],['C',8],['G',4],['C',4]]],
 ['Silent Night','Franz Gruber (public domain)',80,[[67,1.5],[69,.5],[67,1],[64,3],[67,1.5],[69,.5],[67,1],[64,3],[74,2],[74,1],[71,3],[72,2],[72,1],[67,3]],[['C',12],['G',6],['C',6]]]);
/* Songs: search and an "easy" filter, now there are lots */
{const _ph=paHTML;paHTML=function(){const h=_ph();return h.replace('<div class="palist">',`<div class="row pafilter" style="gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px"><input type="search" id="pasearch" placeholder="Search songs or artists" aria-label="Search play-alongs" style="flex:1;min-width:0;max-width:320px"><label class="popt"><input type="checkbox" id="paeasy"> 2 or 3 chords only</label></div><div class="palist">`)}}
{const _vs=viewSongs;viewSongs=function(){_vs.apply(this,arguments);const q=main.querySelector('#pasearch'),e=main.querySelector('#paeasy');if(!q)return;const f=()=>{const t=q.value.trim().toLowerCase();main.querySelectorAll('[data-pa]').forEach(b=>{const S=PA[+b.dataset.pa];const nch=new Set(S[4].map(x=>x[0])).size;b.hidden=!!(t&&!(S[0]+' '+S[1]).toLowerCase().includes(t))||(e.checked&&nch>3)});main.querySelectorAll('[data-pd]').forEach(b=>{const S=PDTUNES[+b.dataset.pd];b.hidden=!!(t&&!(S[0]+' '+S[1]).toLowerCase().includes(t))})};q.oninput=f;e.onchange=f}}

