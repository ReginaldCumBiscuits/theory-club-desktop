/* ================= learning journey: the routes ================= */
/* each topic: id, title, lessons (learn ids), sources [[kind:id, weight]] */
const JT={
 notes:['Notes & the staff',['notes'],[['g:notes',1]]],
 fret:['The fretboard',['fretboard'],[['g:fretnotes',1]]],
 shapes:['Chord shapes',['shapes'],[['g:shapes',1]]],
 tab:['Reading tab',['tab'],[['g:tab',1]]],
 strum:['Strumming & rhythm',['strum','rhythm'],[['b:strum',2],['g:rhythm',1]]],
 intervals:['Intervals',['intervals'],[['g:intervals',2],['g:earint',1]]],
 scales:['Major & minor scales',['scales'],[['g:scales',2],['g:minors',1]]],
 pocket:['The pocket & subdivision',['gv-pocket','gv-time'],[['b:pocket',2],['j:time',1],['b:dtime',1]]],
 barre:['Barre chords',['g-barre'],[['j:barre',3],['b:barre',1]]],
 triads:['Chords & triads',['chords','g-triads'],[['g:chords',1],['j:triad',2]]],
 caged:['The CAGED system',['caged'],[['g:caged',1]]],
 solo:['Soloing & pentatonics',['solo'],[['b:solo',1],['j:pent',1]]],
 prog:['Progressions & keys',['progressions','circle'],[['g:progressions',1],['g:keys',1],['j:degree',1]]],
 dom:['Dominant & seventh chords',['dominant','th-sevenths'],[['g:dominant',1],['j:sev',2]]],
 funk:['Syncopation & funk',['gv-synco','g-funk'],[['b:funk',2],['j:synco',1]]],
 finger:['Fingerpicking',['g-fingerstyle'],[['b:finger',1]]],
 blues:['The blues',['th-blues'],[['j:blues',3],['b:blues',1]]],
 lead:['Lead techniques',['g-lead'],[['b:lead',1]]],
 arps:['Arpeggios',['g-arps'],[['j:arp',3],['b:arps',1]]],
 modes:['Modes',['modes'],[['g:modes',1]]],
 cadsec:['Cadences & secondary dominants',['th-cadences','th-secondary'],[['j:cad',1],['j:sec',1]]],
 borext:['Borrowed & extended chords',['th-borrowed','th-extended'],[['j:bor',1],['j:ext',1]]],
 oddpoly:['Odd time & polyrhythms',['gv-odd','gv-poly'],[['j:odd',2],['j:poly',2],['b:oddpoly',1]]],
 ear:['Ear training',['intervals','progressions'],[['g:earchord',1],['g:earprog',1],['g:earmelody',1],['g:earint',1]]],
 world:['World scales',['world'],[['g:world',1]]],
 melody:['Writing melodies',['th-melody'],[['b:melody',2],['j:degree',1]]],
 bfret:['The bass fretboard',['fretboard'],[['g:fretnotes',1]]],
 broots:['Roots, 5ths & bass lines',['bass'],[['g:bass',1]]],
 bgroove:['Locking with the drums',['b-groove','gv-pocket'],[['b:bgroove',1],['b:pocket',1],['j:time',1]]],
 barps:['Chord tones & arpeggios',['b-arps'],[['j:arp',2],['g:bass',1]]],
 bwalk:['Walking bass lines',['b-walking'],[['j:walk',2],['g:bass',1]]],
 bmute:['Muting & dead notes',['b-muting'],[['b:bmute',1]]],
 bslap:['Slap & pop',['b-slap'],[['b:bslap',1]]],
 styles:['Groove styles & feel',['gv-styles','gv-half'],[['b:styles',1],['b:half',1]]],
 synco:['Syncopation',['gv-synco'],[['j:synco',2],['b:funk',1]]],
 pfing:['Scale fingering',['p-fingering','scales'],[['b:pfing',2],['g:scales',1]]],
 plh:['Left-hand patterns',['p-lefthand'],[['b:plh',1]]],
 ppedal:['Pedal & hands together',['p-pedal','p-hands'],[['b:ppedal',1],['b:phands',1]]],
 pvoice:['Voicings',['p-voicings'],[['j:voicing',2],['b:pvoice',1]]],
 pcomp:['Comping & rhythm',['p-comping','gv-synco'],[['b:pcomp',2],['j:synco',1]]],
 kit:['The kit & grooves',['drums'],[['g:drums',1]]],
 rhythm:['Rhythm & note values',['rhythm'],[['g:rhythm',1],['j:time',1]]],
 charts:['Reading drum charts',['charts'],[['b:charts',2],['g:rhythm',1]]],
 dhats:['Hi-hat techniques',['d-hats'],[['b:dhats',1]]],
 dpocket:['Backbeat & the pocket',['d-pocket','gv-pocket'],[['b:dpocket',1],['b:pocket',1]]],
 fills:['Rudiments & fills',['fills'],[['b:fills',1],['g:drums',1]]],
 ddyn:['Dynamics & ghost notes',['d-dynamics','gv-dynamics'],[['b:ddyn',1],['b:gvdyn',1]]],
 dind:['Independence',['d-independence'],[['b:dind',1]]],
 dswing:['Shuffles & swing',['d-swing'],[['b:dswing',1]]],
 dsynco:['Syncopation',['gv-synco'],[['j:synco',2],['b:funk',1]]],
 dtune:['Tuning your drums',['d-tuning'],[['b:dtune',1]]],
 rhythm2:['Advanced rhythm',['rhythm','gv-time'],[['g:rhythm',2],['j:time',1]]],
 dear:['Drum ears & reading',['drums','charts'],[['g:drums',1],['b:charts',1]]],
 space:['Space & feel',['gv-space','gv-dynamics'],[['b:space',2],['b:gvdyn',1]]],
 svbasics:['Singing basics',['sv-basics'],[['b:svbasics',1]]],
 svpitch:['Matching pitch',['sv-pitch'],[['b:svpitch',2],['g:earint',1]]],
 svwarm:['Vocal warm-ups',['sv-warmup'],[['b:svwarm',1]]],
 svint:['Singing intervals',['sv-intervals','intervals'],[['j:svint',2],['g:intervals',1]]],
 svharm:['Harmony singing',['sv-harmony'],[['b:svharm',1],['j:harm3',2]]],
 vrhythm:['Rhythm & the pocket',['rhythm','gv-pocket'],[['g:rhythm',1],['b:pocket',1],['j:time',1]]],
 vphrase:['Syncopation & phrasing',['gv-synco','gv-space'],[['j:synco',1],['b:space',1]]],
 daw:['Your DAW',[],[['g:DAW',1]]],
 midi:['MIDI',['midi-basics'],[['g:midi',1]]],
 rec:['Home recording',['rec-gear','rec-levels'],[['g:recording',1]]],
 harmony:['Harmony',['th-sevenths','th-cadences'],[['g:harmony',1],['j:sev',1]]]};
const JOURNEY={
 guitar:[['notes','fret','shapes','tab','strum','intervals','scales','pocket'],['barre','triads','caged','solo','prog','dom','funk','finger','blues'],['lead','arps','modes','cadsec','borext','oddpoly','ear','world','melody']],
 bass:[['notes','bfret','broots','tab','rhythm','intervals','scales','bgroove'],['barps','bwalk','bmute','caged','prog','synco','bslap','blues'],['modes','dom','cadsec','borext','oddpoly','ear','styles']],
 piano:[['notes','shapes','pfing','intervals','rhythm','plh','pocket'],['triads','ppedal','prog','dom','pvoice','pcomp','blues'],['modes','cadsec','borext','oddpoly','ear','world','melody']],
 drums:[['kit','rhythm','charts','pocket','dhats','dpocket'],['fills','ddyn','dind','dswing','dsynco','dtune','styles'],['oddpoly','rhythm2','dear','space']],
 voice:[['svbasics','svpitch','notes','intervals','svwarm','vrhythm'],['svint','scales','svharm','triads','prog','vphrase'],['modes','ear','melody','cadsec','oddpoly']],
 daw:[['daw','midi','rec','notes','rhythm'],['daw','midi','rec','triads','prog'],['daw','midi','rec','harmony','ear']]};
JB.plh.push(
 ['A “broken octave” left hand alternates…','The low and high notes of an octave',['Two different chords','Black and white keys','Two pedals'],'Gives movement to a held bass note.'],
 ['In a ballad, sustaining the left-hand root with the pedal…','Gives a warm, full foundation',['Makes it staccato','Speeds it up','Mutes the right hand'],'Change the pedal with each chord.'],
 ['Left-hand “root–5th–octave” rolls are typical of…','Pop and worship piano accompaniment',['Baroque counterpoint only','Drum solos','Jazz walking only'],'A rolling, open pattern.'],
 ['A walking bass in the left hand plays…','One note per beat moving towards the next chord',['Long held chords','Only octaves','Trills'],'Jazz piano borrows it from the bass.'],
 ['When the left hand jumps between bass note and chord, you should…','Look ahead and move early, keeping a loose wrist',['Watch the right hand','Jump at the last moment','Use the soft pedal'],'Prepare the jump.'],
 ['Why keep the left hand quieter than the right in most songs?','So the melody stands out',['Because it is lower','To save energy','It isn’t needed'],'Balance puts the tune on top.'],
 ['A “tenth” in the left hand is…','Root and the 3rd an octave higher',['Ten notes at once','The 10th fret','A ten-bar phrase'],'A wide, warm interval for bigger hands, or rolled.']);
JB.dhats.push(
 ['Playing quarter notes on the hi-hat instead of eighths gives…','A more open, relaxed feel',['A busier feel','A swing feel','A blast beat'],'Fewer notes, more space.'],
 ['A hi-hat “choke” on a crash means…','Grabbing the cymbal to stop it',['Opening the hat','Hitting the rim','Playing the bell'],'Used for sudden stops.'],
 ['Moving from hi-hat to ride in a chorus usually…','Opens up the sound and lifts the energy',['Makes it quieter','Changes the key','Slows the tempo'],'The ride gives a bigger wash.'],
 ['Eighth notes on a closed hi-hat in a rock beat land on…','Every beat and every “and”',['Only beat 1','Only the backbeats','Triplets only'],'1 & 2 & 3 & 4 &.']);
JB.dind.push(
 ['Playing the hi-hat with your foot while the hands play a groove adds…','A fourth limb to the pattern',['A tempo change','A fill','A key change'],'Full four-way coordination.'],
 ['A good order to learn a new groove is…','Hands first, then add the kick, then the hi-hat foot',['Everything at full speed at once','Feet only forever','Start with fills'],'Layer one limb at a time.'],
 ['When the kick plays a syncopated pattern, the hi-hat should…','Stay perfectly steady',['Follow the kick','Stop','Speed up'],'The steady part anchors the variation.'],
 ['Counting “1 e & a” while drumming helps independence because…','It places every limb on the shared grid',['It tunes the drums','It replaces the click','It makes you louder'],'Every note has a name.']);
JB.dswing.push(
 ['In a swing feel, the second eighth note of each beat is played…','Late, on the last note of the triplet',['Early','Exactly halfway','Not at all'],'Long-short.'],
 ['A “straight-eighth” rock song played with swing feel would sound…','Bluesy and bouncy',['Exactly the same','Like a march','Like double time'],'Swing changes the character completely.'],
 ['The jazz ride “skip” note falls on…','The last triplet of beats 2 and 4',['Beat 1','Every sixteenth','The & of 3 only'],'Ding, ding-a ding.'],
 ['Heavier swing (closer to triplets) is common at…','Slower tempos',['Very fast tempos only','No tempo','Only in metal'],'At fast tempos swing flattens towards even eighths.']);
JB.svwarm.push(
 ['Humming on “mm” and sliding up and down warms up…','Resonance and smooth register changes',['Only the low notes','Your breathing only','Your rhythm'],'A gentle start.'],
 ['Tongue trills (rolled r) as a warm-up help…','Release tongue tension while sounding pitch',['Breathe faster','Practise lyrics','Clap time'],'Like lip trills, but with the tongue.'],
 ['Staccato “ha-ha-ha” warm-ups train…','Breath support and the diaphragm',['Vibrato only','Pitch only','Tuning'],'Short bursts engage the core.'],
 ['Warming up the speaking voice first (counting, talking) helps…','Ease into singing gently',['Sing higher instantly','Replace singing practice','Change your vocal type'],'Start where the voice already works.']);
JB.ablx=[
 ['In Ableton, what does the Browser show?','Instruments, effects, samples and your files',['Only the mixer','Only automation','The audio settings only'],'Drag anything from the Browser onto a track.'],
 ['What is a clip in Ableton?','A piece of MIDI or audio that can loop',['A track’s volume','A plug-in','An export setting'],'Clips live in slots (Session) or on the timeline (Arrangement).'],
 ['Warp markers in Ableton are used to…','Line audio up with the grid and change tempo',['Add reverb','Mute a track','Record MIDI'],'Warp stretches audio without changing pitch.'],
 ['Which device chops a sample across pads?','Drum Rack (or Simpler in Slice mode)',['Utility','EQ Eight','Limiter'],'Slice to pads to play chops.'],
 ['Return tracks in Ableton are used for…','Shared effects like reverb and delay',['Recording audio','MIDI only','Exporting'],'Send each track an amount.'],
 ['What does the Global Quantize setting affect?','When launched clips start',['Note pitch','Track colours','CPU usage'],'Clips start on the next bar or beat.'],
 ['Freezing a track in Ableton…','Renders it temporarily to save CPU',['Deletes it','Mutes it forever','Exports the song'],'Unfreeze to edit again.'],
 ['Groove Pool in Ableton is used to…','Apply swing and feel to clips',['Organise samples','Tune vocals','Draw automation'],'Grooves shift timing and velocity.'],
 ['What does arming a track do?','Gets it ready to record',['Mutes it','Solos it','Deletes it'],'The record arm button.'],
 ['A Live Set is saved as which kind of file?','.als',['.wav','.logicx','.mid'],'Collect and Save keeps samples with it.']];
JB.lgcx=[
 ['In Logic, the Library shows…','Patches and sounds for the selected track',['Your audio files only','The mixer','Automation lanes'],'Open it with Y.'],
 ['What is a region in Logic?','A block of MIDI or audio on a track',['A plug-in slot','A tempo change','A bus'],'Regions can be moved, looped and edited.'],
 ['Take folders in Logic hold…','Several recorded takes so you can comp the best parts',['Effects presets','Drum kits','Marker lists'],'Swipe to comp.'],
 ['What does Flex Time do?','Moves the timing of notes inside audio',['Changes the key','Adds reverb','Exports stems'],'Fix timing without re-recording.'],
 ['Bus sends in Logic are used for…','Shared effects like reverb on an aux',['Recording MIDI','Muting tracks','Tuning'],'Many tracks share one reverb.'],
 ['Which Logic feature writes drum parts that follow your song?','Drummer (Session Players)',['Flex Pitch','Smart Tempo','Score editor'],'Virtual drummers you can direct.'],
 ['The Step Sequencer is used for…','Programming patterns on a grid',['Mastering','Recording vocals','Editing tempo maps'],'Great for beats and patterns.'],
 ['Smart Tempo in Logic…','Detects and matches tempo from recordings',['Sets track colours','Exports MP3s','Tunes vocals'],'Record freely, then align.'],
 ['Bouncing in Logic means…','Exporting the mix to an audio file',['Muting a track','Duplicating regions','Opening the Library'],'Bounce for sharing or mastering.'],
 ['A Logic project is saved as which file?','.logicx',['.als','.wav','.ptx'],'The Logic Pro project format.']];
JB.recx=[
 ['What is clipping in recording?','Distortion when the signal goes over the maximum level',['A quiet recording','A type of microphone','A reverb effect'],'Leave headroom.'],
 ['A good peak level when recording at 24-bit is about…','-12 to -6 dBFS',['0 dBFS exactly','+6 dBFS','-60 dBFS'],'Plenty of headroom, no clipping.'],
 ['A pop filter is used to…','Reduce plosive “p” and “b” blasts',['Add reverb','Boost bass','Tune vocals'],'Place it between singer and mic.'],
 ['Phantom power (48V) is needed for…','Most condenser microphones',['Dynamic mics','Guitars plugged in directly','Headphones'],'Dynamic mics don’t need it.'],
 ['A DI box is used to…','Plug a guitar or bass straight into a mic input properly',['Power speakers','Record drums','Add delay'],'Converts the signal level and impedance.'],
 ['Why use closed-back headphones when recording?','So the mic doesn’t pick up the click and backing',['They’re louder','They’re cheaper','They add bass'],'Avoids bleed into the recording.'],
 ['Moving a directional mic closer to the source adds…','More bass (proximity effect)',['More treble only','Less level','Reverb'],'Use distance to shape tone.'],
 ['What does an audio interface do?','Converts audio to digital for the computer and back',['Mixes the song automatically','Masters tracks','Writes lyrics'],'It has mic preamps and outputs.'],
 ['Sample rate 48 kHz means…','48,000 samples per second',['48 tracks','48 bits','48 dB'],'Common for music and video.'],
 ['Treating the walls behind the singer helps reduce…','Room reflections',['Mic sensitivity','Latency','Tuning problems'],'Absorption makes a drier recording.']];
JT.daw[2]=[['g:DAW',1],['b:DAWX',1]];JT.rec[2]=[['g:recording',1],['b:recx',1]];

const JLV=['Beginner','Intermediate','Experienced'];const JPASS=16,JN=20;
const jInst=()=>{const r=INST_RAW();return JOURNEY[r]?r:PROD.has(r)?'daw':'guitar'};
const jUnits=(inst=jInst())=>(window.jLevels?window.jLevels(inst):JOURNEY[inst]).map((ids,lv)=>ids.map(id=>({key:`${lv}.${id}`,id,lv,t:JT[id][0]+(id==='daw'?`: ${INST_NAME[INST_RAW()]||'DAW'}`:''),lessons:JT[id][1],src:JT[id][2]})));
const jStore=()=>{const all=store.get('journey',{})||{};return all[INST_RAW()]||{}};
const jSave=(key,rec)=>{const all=store.get('journey',{})||{};const mine=all[INST_RAW()]||{};mine[key]=rec;all[INST_RAW()]=mine;store.set('journey',all)};
const jLevelDone=(lv)=>{const S=jStore();return jUnits()[lv].every(u=>S[u.key]&&S[u.key].passed)};
const jUnlocked=lv=>lv===0||jLevelDone(lv-1)||lv<=((store.get('jtgrand',{})||{})[INST_RAW()]||0);
const jCurLevel=()=>jLevelDone(0)?(jLevelDone(1)?2:1):0;
function jMake(u){const r=mulberry((Math.random()*2**32)>>>0);const lv=u.lv;const out=[],seen=new Set();const banks={};
 const W=u.src.reduce((a,s)=>a+s[1],0);
 const one=()=>{let x=r()*W,s=u.src[0];for(const c of u.src){x-=c[1];if(x<=0){s=c;break}}const[kind,id]=s[0].split(':');
  if(kind==='b'){const bid=id==='DAWX'?({ableton:'ablx',logic:'lgcx'}[INST_RAW()]||null):id;if(!bid||!JB[bid])return null;if(!banks[id])banks[id]=shuffle(r,JB[bid]);const b=banks[id].pop();if(!b)return null;const[q,a,d,e]=b;return{prompt:q,options:shuffle(r,[a,...d]),answer:a,explain:e,topic:'j-'+u.id}}
  if(kind==='j')return Object.assign(JG[id](r,lv),{topic:'j-'+u.id});
  const gid=id==='DAW'?({ableton:'ableton',logic:'logic'}[INST_RAW()]||'midi'):id;if(!G[gid])return null;const q=G[gid](r,lv);q.topic=gid;return q};
 const take=(gen,tries)=>{for(let t=0;t<tries&&out.length<JN;t++){let q;try{q=gen()}catch(e){q=null}if(!q||!q.options||!q.options.includes(q.answer)||new Set(q.options).size!==q.options.length)continue;const k=q.prompt+'|'+q.answer+'|'+(q.meta||'')+'|'+(q.explain||'');if(seen.has(k))continue;seen.add(k);q.topicLabel=u.t;out.push(q)}};
 take(one,800);
 /* not enough variety at this level: stretch with the same topic's next level up */
 for(let up=1;up<=2&&out.length<JN;up++){const lv2=Math.min(2,lv+up);const gens=u.src.filter(s=>/^[gj]:/.test(s[0]));if(!gens.length)break;take(()=>{const[kind,id]=pick(r,gens)[0].split(':');if(kind==='j')return Object.assign(JG[id](r,lv2),{topic:'j-'+u.id});const gid=id==='DAW'?({ableton:'ableton',logic:'logic'}[INST_RAW()]||'midi'):id;const q=G[gid](r,lv2);q.topic=gid;q.meta=q.meta||undefined;return q},600)}
 return shuffle(r,out)}

