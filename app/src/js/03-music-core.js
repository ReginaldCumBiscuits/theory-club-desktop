/* ================= music core ================= */
const LET='CDEFGAB', NAT=[0,2,4,5,7,9,11];
function parse(n){const L=LET.indexOf(n[0]);let a=0;for(const c of n.slice(1)){if(c==='b')a--;else if(c==='#')a++}return{L,a,pc:((NAT[L]+a)%12+12)%12}}
function asc(L,a){return LET[L]+(a<0?'b'.repeat(-a):'#'.repeat(a))}
function pr(s){return s[0]+s.slice(1).replace(/bb/g,'𝄫').replace(/##/g,'𝄪').replace(/b/g,'♭').replace(/#/g,'♯')}
function spellUp(root,semi,deg){const r=parse(root);const L=(r.L+deg-1)%7;const pc=(r.pc+semi)%12;let a=((pc-NAT[L])%12+12)%12;if(a>6)a-=12;return asc(L,a)}
function spellDown(root,semi,steps){const r=parse(root);const L=((r.L-steps)%7+7)%7;const pc=((r.pc-semi)%12+12)%12;let a=((pc-NAT[L])%12+12)%12;if(a>6)a-=12;return asc(L,a)}
function midiOf(name,oct){const{L,a}=parse(name);return 12*(oct+1)+NAT[L]+a}
const SHARPN=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'], FLATN=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const ord=n=>['','1st','2nd','3rd','4th','5th','6th','7th','8th'][n];
const mk=(semis,degs)=>semis.map((s,i)=>[s,degs?degs[i]:i+1]);
function formulaOf(steps){return steps.map(([s,d])=>{const ms=NAT[(d-1)%7]+12*Math.floor((d-1)/7);const df=s-ms;return(df<0?'♭'.repeat(-df):'♯'.repeat(df))+d}).join(' ')}
function stepPattern(semis){const s=[...semis,12];const m={1:'H',2:'W',3:'W+H',4:'2W'};return s.slice(1).map((v,i)=>m[v-s[i]]||((v-s[i])+'')).join(' ')}

const IVL=[
 {sh:'P1',s:0,d:1,n:'Unison'},
 {sh:'m2',s:1,d:2,n:'Minor 2nd',song:'the Jaws theme'},
 {sh:'M2',s:2,d:2,n:'Major 2nd',song:'Happy Birthday'},
 {sh:'m3',s:3,d:3,n:'Minor 3rd',song:'Greensleeves'},
 {sh:'M3',s:4,d:3,n:'Major 3rd',song:'When the Saints Go Marching In'},
 {sh:'P4',s:5,d:4,n:'Perfect 4th',song:'Here Comes the Bride'},
 {sh:'A4',s:6,d:4,n:'Augmented 4th',song:'The Simpsons theme'},
 {sh:'d5',s:6,d:5,n:'Diminished 5th',song:'the riff of Black Sabbath by Black Sabbath'},
 {sh:'P5',s:7,d:5,n:'Perfect 5th',song:'Twinkle Twinkle Little Star'},
 {sh:'m6',s:8,d:6,n:'Minor 6th',song:'the Love Story film theme'},
 {sh:'M6',s:9,d:6,n:'Major 6th',song:'My Bonnie Lies Over the Ocean'},
 {sh:'m7',s:10,d:7,n:'Minor 7th',song:'Somewhere from West Side Story'},
 {sh:'M7',s:11,d:7,n:'Major 7th',song:'the chorus leap in Take On Me'},
 {sh:'P8',s:12,d:8,n:'Octave',song:'Somewhere Over the Rainbow'}];
const IV=sh=>IVL.find(x=>x.sh===sh);
const earName=sh=>sh==='A4'?'Tritone':IV(sh).n;

const MAJ_SEMI=[0,2,4,5,7,9,11];
const MODE_INFO=[
 ['ionian','Ionian','the major scale itself','Happy and settled'],
 ['dorian','Dorian','minor with a raised 6th','Cool, jazzy minor'],
 ['phrygian','Phrygian','minor with a ♭2','Dark, with a Spanish edge'],
 ['lydian','Lydian','major with a ♯4','Bright and floating, a film-score favourite'],
 ['mixolydian','Mixolydian','major with a ♭7','Bluesy, rock-and-roll major'],
 ['aeolian','Aeolian','the natural minor scale','Sad, classic minor'],
 ['locrian','Locrian','minor with a ♭2 and a ♭5','Unstable and tense']];
const MODES=MODE_INFO.map(([id,name,char,feel],k)=>({id,name,char,feel,k,off:MAJ_SEMI[k],semis:MAJ_SEMI.map((_,i)=>(MAJ_SEMI[(i+k)%7]-MAJ_SEMI[k]+12)%12)}));
const BRIGHT=['lydian','ionian','mixolydian','dorian','aeolian','phrygian','locrian'];
function parentOf(root,k){return spellDown(root,MAJ_SEMI[k],k)}

const WORLD=[
 {id:'majpent',name:'Major pentatonic',origin:'China, Celtic and folk music worldwide',short:'East Asian & folk',semis:[0,2,4,7,9],degs:[1,2,3,5,6],lv:0,desc:'Five notes and no half steps, so nothing clashes. The black keys of a piano form one.'},
 {id:'minpent',name:'Minor pentatonic',origin:'Blues, rock and West African music',short:'Blues & rock',semis:[0,3,5,7,10],degs:[1,3,4,5,7],lv:0,desc:'The first scale most guitarists learn for soloing.'},
 {id:'blues',name:'Blues scale',origin:'African-American blues, USA',short:'American blues',semis:[0,3,5,6,7,10],degs:[1,3,4,5,5,7],lv:0,desc:'Minor pentatonic plus the ♭5 "blue note" that gives it grit.'},
 {id:'hirajoshi',name:'Hirajōshi',origin:'Japan, tuning for the koto',short:'Japanese',semis:[0,2,3,7,8],degs:[1,2,3,5,6],lv:0,desc:'A five-note scale with two half steps that sounds still and haunting.'},
 {id:'in',name:'In (Miyako-bushi)',origin:'Japan, shamisen and shakuhachi music',short:'Japanese',semis:[0,1,5,7,8],degs:[1,2,4,5,6],lv:1,desc:'The ♭2 and ♭6 give it its dark, temple-bell colour.'},
 {id:'yo',name:'Yo',origin:'Japan, folk songs',short:'Japanese',semis:[0,2,5,7,9],degs:[1,2,4,5,6],lv:1,desc:'A bright pentatonic used in Japanese folk song, with no 3rd at all.'},
 {id:'hijaz',name:'Phrygian dominant (Hijaz)',origin:'Middle East, flamenco and klezmer',short:'Middle Eastern',semis:[0,1,4,5,7,8,10],lv:1,desc:'Close to Maqam Hijaz; real maqams also use quarter tones. In klezmer it is called Freygish.'},
 {id:'hungarian',name:'Hungarian minor',origin:'Hungarian and Romani music',short:'Eastern European',semis:[0,2,3,6,7,8,11],lv:1,desc:'Harmonic minor with a raised 4th, giving two 1½-step gaps.'},
 {id:'wholetone',name:'Whole tone',origin:'France, Debussy and Impressionism',short:'French Impressionist',semis:[0,2,4,6,8,10],degs:[1,2,3,4,5,6],lv:1,desc:'Every step is a whole step, so there is no strong home note. Dreamy and floating.'},
 {id:'double',name:'Double harmonic (Bhairav)',origin:'India (Raga Bhairav) and Arabic music',short:'Indian & Arabic',semis:[0,1,4,5,7,8,11],lv:2,desc:'Two 1½-step gaps. Raga Bhairav, a morning raga, uses these notes.'},
 {id:'pelog',name:'Pelog (approx.)',origin:'Indonesia, Javanese and Balinese gamelan',short:'Indonesian',semis:[0,1,3,7,8],degs:[1,2,3,5,6],lv:2,desc:'Gamelan tunings vary by ensemble and do not match piano keys; this is a 12-note approximation.'}];

const SC={
 major:{name:'major',steps:mk([0,2,4,5,7,9,11])},
 natural:{name:'natural minor',steps:mk([0,2,3,5,7,8,10])},
 harmonic:{name:'harmonic minor',steps:mk([0,2,3,5,7,8,11])},
 melodic:{name:'melodic minor',steps:mk([0,2,3,5,7,9,11])}};
MODES.forEach(m=>SC[m.id]={name:m.name,steps:mk(m.semis)});
WORLD.forEach(w=>SC[w.id]={name:w.name,steps:mk(w.semis,w.degs)});
const scaleNotes=(root,t)=>SC[t].steps.map(([s,d])=>spellUp(root,s,d));
const scaleMidis=(root,t,base=60)=>{const r=base+parse(root).pc;return[...SC[t].steps.map(([s])=>r+s),r+12]};

const CH={
 maj:{name:'Major',sym:'',st:[[0,1],[4,3],[7,5]],sound:'bright and stable'},
 min:{name:'Minor',sym:'m',st:[[0,1],[3,3],[7,5]],sound:'darker and sadder than major'},
 dim:{name:'Diminished',sym:'°',st:[[0,1],[3,3],[6,5]],sound:'tense and squeezed, two minor 3rds stacked'},
 aug:{name:'Augmented',sym:'+',st:[[0,1],[4,3],[8,5]],sound:'dreamy and unresolved, two major 3rds stacked'},
 sus2:{name:'Suspended 2nd',sym:'sus2',st:[[0,1],[2,2],[7,5]],sound:'open and airy, neither major nor minor'},
 sus4:{name:'Suspended 4th',sym:'sus4',st:[[0,1],[5,4],[7,5]],sound:'hanging, it wants to fall back to the 3rd'},
 maj7:{name:'Major 7th',sym:'maj7',st:[[0,1],[4,3],[7,5],[11,7]],sound:'lush and soft'},
 '7':{name:'Dominant 7th',sym:'7',st:[[0,1],[4,3],[7,5],[10,7]],sound:'bluesy, and it wants to resolve'},
 m7:{name:'Minor 7th',sym:'m7',st:[[0,1],[3,3],[7,5],[10,7]],sound:'mellow and smooth'},
 m7b5:{name:'Half-diminished',sym:'m7♭5',st:[[0,1],[3,3],[6,5],[10,7]],sound:'moody, the ii chord of minor keys'},
 dim7:{name:'Diminished 7th',sym:'°7',st:[[0,1],[3,3],[6,5],[9,7]],sound:'pure suspense, stacked minor 3rds all the way'},
 mMaj7:{name:'Minor-major 7th',sym:'m(maj7)',st:[[0,1],[3,3],[7,5],[11,7]],sound:'spy-movie mysterious'},
 '9':{name:'Dominant 9th',sym:'9',st:[[0,1],[4,3],[7,5],[10,7],[14,9]],sound:'funky and full'},
 '7b9':{name:'7♭9',sym:'7♭9',st:[[0,1],[4,3],[7,5],[10,7],[13,9]],sound:'dark and dramatic, common resolving to minor'},
 '7#9':{name:'7♯9',sym:'7♯9',st:[[0,1],[4,3],[7,5],[10,7],[15,9]],sound:'gritty, both major and minor 3rd at once'},
 '13':{name:'Dominant 13th',sym:'13',st:[[0,1],[4,3],[10,7],[14,9],[21,13]],sound:'big-band jazzy (the 5th is usually left out)'},
 '7sus4':{name:'7sus4',sym:'7sus4',st:[[0,1],[5,4],[7,5],[10,7]],sound:'floating dominant, the 4th delays the 3rd'},
 '7#5':{name:'7♯5',sym:'7♯5',st:[[0,1],[4,3],[8,5],[10,7]],sound:'restless, the raised 5th pushes upward'}};
const chordNotes=(root,t)=>CH[t].st.map(([s,d])=>spellUp(root,s,d));
const chordSym=(root,t)=>pr(root)+CH[t].sym;
function chordMidis(root,t,base=48,inv=0){const r=base+parse(root).pc;const m=CH[t].st.map(([s])=>r+s);for(let i=0;i<inv;i++)m.push(m.shift()+12);return m}
function voice(root,t){const pc=parse(root).pc;let b=36+pc;if(b<40)b+=12;const up=CH[t].st.map(([s])=>{let m=(pc+s)%12;while(m<55)m+=12;return m});return[b,...up.sort((a,c)=>a-c)]}

const DIA={major:{tri:['maj','min','min','maj','maj','min','dim'],sev:['maj7','m7','m7','maj7','7','m7','m7b5']},minor:{tri:['min','dim','maj','min','min','maj','maj'],sev:['m7','m7b5','maj7','m7','m7','maj7','7']}};
function romanOf(deg,t){const b=['I','II','III','IV','V','VI','VII'][deg-1];const low=['min','dim','m7','m7b5','dim7','mMaj7'].includes(t);return(low?b.toLowerCase():b)+({dim:'°',m7b5:'ø7',dim7:'°7',aug:'+','7':'7',maj7:'maj7',m7:'7',mMaj7:'(maj7)','9':'9'}[t]||'')}
function chordAt(key,mode,deg,t){const sc=scaleNotes(key,mode==='major'?'major':'natural');const root=sc[deg-1];t=t||DIA[mode].tri[deg-1];return{root,t,sym:chordSym(root,t),roman:romanOf(deg,t)}}
const PROG=[
 {id:'pop',name:'The four-chord song',mode:'major',ch:[[1],[5],[6],[4]],note:'I–V–vi–IV. Hundreds of pop hits use exactly this loop.'},
 {id:'fifties',name:'50s doo-wop',mode:'major',ch:[[1],[6],[4],[5]],note:'I–vi–IV–V. Classic early rock-and-roll ballads.'},
 {id:'canon',name:'Pachelbel’s Canon',mode:'major',ch:[[1],[5],[6],[3],[4],[1],[4],[5]],note:'A descending bass line under eight chords.'},
 {id:'jazz',name:'Jazz ii–V–I',mode:'major',ch:[[2,'m7'],[5,'7'],[1,'maj7']],note:'The backbone of jazz standards. The V7 does the pulling.'},
 {id:'blues',name:'12-bar blues',mode:'major',ch:[[1,'7'],[1,'7'],[1,'7'],[1,'7'],[4,'7'],[4,'7'],[1,'7'],[1,'7'],[5,'7'],[4,'7'],[1,'7'],[5,'7']],note:'Every chord is a dominant 7th. One chord per bar.'},
 {id:'epic',name:'Epic minor',mode:'minor',ch:[[1],[6],[3],[7]],note:'i–VI–III–VII. Film trailers and stadium anthems.'},
 {id:'andalusian',name:'Andalusian cadence',mode:'minor',ch:[[1],[7],[6],[5,'maj']],note:'i–VII–VI–V. Flamenco. The V is borrowed from harmonic minor.'},
 {id:'minjazz',name:'Minor ii–V–i',mode:'minor',ch:[[2,'m7b5'],[5,'7'],[1,'m7']],note:'The minor-key version of the jazz cadence.'}];

const MAJ=['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];
const MIN=['A','E','B','F#','C#','G#','D#','Bb','F','C','G','D'];
function sigOf(k){const n=scaleNotes(k,'major');const s=n.filter(x=>x.includes('#')).length,f=n.filter(x=>x.slice(1).includes('b')).length;const type=s?'sharp':f?'flat':null,count=s||f;return{type,count,list:type?(type==='sharp'?'FCGDAEB':'BEADGCF').slice(0,count).split('').map(l=>pr(l+(type==='sharp'?'#':'b'))):[]}}
function sigLabel(c,t){return c===0?'No sharps or flats':c+' '+t+(c>1?'s':'')}

const ROOTS=[['C','G','F','D'],['C','G','D','A','E','F','Bb','Eb'],['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F']];
const MINROOTS=[['A','E','D'],['A','E','D','B','G','C'],['A','E','B','F#','C#','D','G','C','F','Bb','Eb']];

