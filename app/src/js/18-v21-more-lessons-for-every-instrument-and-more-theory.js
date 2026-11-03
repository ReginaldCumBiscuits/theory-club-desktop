/* ================= v21: more lessons for every instrument and more theory ================= */
function mkTab(str,inst,bpm,title){const S=inst==='bass'?STR4:STR;const{items,steps}=parseTab(str,S);return{items,steps,per:4,beats:4,view:'tab',S,title,inst,bpm}}
function mkStaff(notes,bpm,title){let st=0;const items=notes.map(([m,d])=>{const it={st,dur:d,m,name:SHARPN[m%12]};st+=d;return it});const last=items[items.length-1];if(st%16){last.dur+=16-st%16;st+=16-st%16-0}return{items,steps:Math.ceil(st/16)*16,per:4,beats:4,view:'staff',S:STR,title,inst:'piano',bpm}}
function mkDrum(rows,steps,bpm,title){const items=[];for(let s=0;s<steps;s++){const hits={};for(const k in rows){const ch=rows[k][s];if(ch==='x')hits[k]=1;else if(ch==='o')hits[k]=.35}if(Object.keys(hits).length)items.push({st:s,dur:1,hits,cell:s})}const last=items[items.length-1];last.dur=steps-last.st;return{items,steps,per:4,beats:4,view:'grid',groove:{steps,rows,per:4},S:STR,title,inst:'drums',bpm}}
const R4=s=>s.repeat(4);

/* ---------- guitar ---------- */
PL['g-barre']={t:'Barre chords',intro:'A barre chord uses one finger across all the strings, like a moveable capo, with an open-chord shape in front of it. Learn two shapes and you can play every major and minor chord anywhere on the neck.',
 ideas:[['E shape','Your open E chord, moved up and barred. The root is on the low E string: barre at fret 3 and it’s G, at fret 5 it’s A.'],['A shape','Your open A chord, barred. The root is on the A string: barre at fret 3 for C, fret 5 for D.'],['Minor versions','Lift one finger: Em shape and Am shape. The root stays on the same string.'],['Pressure','Roll the barre finger slightly onto its bony side, keep the thumb behind the neck, and pull back with the arm instead of squeezing.']],
 try:['Play an F barre chord (E shape, fret 1) and check each string rings.','Find G, A, B and C with the E shape, saying the root name each time.','Play the change study above at 60 BPM without stopping.','Play the progression A–D–E using only barre chords.'],
 mistakes:['Squeezing as hard as you can: it tires the hand fast.','Barre finger flat on its soft pad, so the middle strings buzz.'],tip:'Start with a partial barre on just the top 3 strings, then add strings as your hand gets stronger.',demo:'barre',ex:[['Change study (G–C–Am–F)',()=>mkTab(R4('4|0:3+1:5+2:5+3:4+4:3+5:3 ')+R4('4|1:3+2:5+3:5+4:5+5:3 ')+R4('4|0:5+1:7+2:7+3:5+4:5+5:5 ')+R4('4|0:1+1:3+2:3+3:2+4:1+5:1 '),'guitar',70,'Barre chord changes')]],vq:'barre chords'};
PL['g-triads']={t:'Triads on the top strings',intro:'A triad is a three-note chord. Played on the top three strings, triads are small, bright and fit anywhere in a band: funk, indie and soul guitarists live on them.',
 ideas:[['Three shapes per chord','Each chord has three positions on the G, B and E strings: root on top, third on top and fifth on top. Together they climb the neck.'],['Inversions','The lowest note changes in each shape: root position, first inversion and second inversion.'],['Voice leading','Moving from one chord to the next, choose the nearest shape. The notes move only a fret or two.'],['Where they fit','Over a band, triads stay out of the bass and the keys’ middle register.']],
 try:['Find all three C major shapes on the top strings and play them up the neck.','Do the same for G, then switch between C and G using the closest shapes.','Play the exercise above, then move it to D and A.','Play a minor triad by lowering the third by one fret in each shape.'],
 mistakes:['Letting the lower strings ring: mute them with the fretting hand.','Always jumping back to the open position.'],tip:'Say which note is on top (root, third or fifth) as you play each shape.',demo:'triads',ex:[['C and G up the neck',()=>mkTab('4|3:0+4:1+5:0 4|3:5+4:5+5:3 4|3:9+4:8+5:8 4|3:5+4:5+5:3 4|3:4+4:3+5:3 4|3:7+4:8+5:7 4|3:12+4:12+5:10 4|3:7+4:8+5:7','guitar',72,'Top-string triads')]],vq:'triads guitar'};
PL['g-fingerstyle']={t:'Fingerpicking',intro:'Fingerpicking uses the thumb for bass notes and the fingers for the higher strings. It turns simple chords into flowing parts for folk, pop ballads and acoustic songs.',
 ideas:[['P-I-M-A','Thumb (p) takes the bottom three strings, index (i) the G string, middle (m) the B string and ring (a) the high E.'],['Arpeggio patterns','Play the chord one string at a time: p-i-m-a, or p-i-m-i. Keep the fingers close to the strings.'],['Travis picking','The thumb alternates between two bass strings on every beat while the fingers play between. See the Travis study in Songs.'],['Hold the whole chord','Fret the full chord shape even though you play one note at a time, so notes ring together.']],
 try:['Play the p-i-m-a pattern on C and Am at 70 BPM.','Change pattern to p-i-m-i-a-i-m-i.','Try the Travis picking study.','Fingerpick a song you know with just its chords.'],
 mistakes:['Thumb hitting the wrong bass string: learn each chord’s root string.','Fingers lifting far from the strings.'],tip:'Anchor your little finger lightly on the guitar top while you learn, then let it go later.',ex:[['P-I-M-A on C and Am',()=>mkTab(('2|1:3 2|3:0 2|4:1 2|5:0 ').repeat(2)+('2|1:0 2|3:2 2|4:1 2|5:0 ').repeat(2),'guitar',70,'Fingerpicking pattern')],['Travis picking',()=>studyEx('guitar','travis')]],vq:'fingerpicking patterns'};
PL['g-lead']={t:'Lead techniques',intro:'Hammer-ons, pull-offs, slides, bends and vibrato are what make a guitar melody sound like a voice. They connect notes and add expression.',
 ideas:[['Hammer-on (h)','Pick one note, then bring another finger down hard on a higher fret without picking. Two notes, one pick stroke.'],['Pull-off (p)','The reverse: fret two notes, pick the higher one, then pull that finger off sideways to sound the lower one.'],['Slide (/ \\)','Pick a note and slide the same finger to another fret, keeping pressure.'],['Bend (b)','Push the string up to raise the pitch, usually a whole step (two frets). Use two or three fingers together.'],['Vibrato (~)','Small, even bends back and forth on a held note. Wide and slow for blues, fast and narrow for rock.']],
 try:['Play the legato study above slowly.','Play the bends study and check each bend reaches the right pitch.','Add vibrato to the last note of a lick.','Use the Soloing page and add one technique to every phrase.'],
 mistakes:['Bending flat: check against the fretted note two frets up.','Vibrato that only goes one way.'],tip:'Fret the target note first, then bend up to match it.',ex:[['Hammer-ons & pull-offs',()=>studyEx('guitar','legato')],['Bends & vibrato',()=>studyEx('guitar','bends')],['Slides',()=>studyEx('guitar','slides')]],vq:'hammer on pull off bend vibrato'};
PL['g-arps']={t:'Arpeggios',intro:'An arpeggio is a chord played one note at a time. Knowing where the chord tones sit on the neck makes solos that follow the chords instead of just the scale.',
 ideas:[['Chord tones','A major chord is root, 3rd and 5th. Land on these when the chord changes and your solo sounds “right”.'],['Shapes','Each chord has an arpeggio shape in every CAGED position. Start with the one around your favourite scale box.'],['Sweep or alternate','Pick one note per string with alternate picking first. Sweeping (one stroke across strings) comes later.'],['Use them in solos','Mix arpeggio notes with scale notes. Target the 3rd of each chord.']],
 try:['Play the A minor arpeggio study above at 70 BPM.','Pick a chord above and find its tones across the whole neck.','Over the Jam along band, play only chord tones for one chorus.','Play arpeggios for C, Am, F and G in one position.'],
 mistakes:['Letting arpeggio notes ring into each other.','Learning shapes without saying the note names.'],tip:'The 3rd decides major or minor. Practise finding it first.',demo:'arps',ex:[['A minor arpeggio',()=>mkTab('2|0:5 2|1:3 2|1:7 2|2:7 2|3:5 2|4:5 2|5:5 2|4:5 2|3:5 2|2:7 2|1:7 2|1:3 8|0:5','guitar',72,'A minor arpeggio')]],vq:'arpeggios guitar'};
/* ---------- bass ---------- */
PL['b-arps']={t:'Chord tones & arpeggios',intro:'A bass line that hits the root, 3rd and 5th of each chord always fits. Learn the shapes once and move them anywhere.',
 ideas:[['Major shape','From the root, the 3rd is one string up and one fret back, and the 5th is one string up and two frets forward.'],['Minor shape','Lower the 3rd by one fret: one string up and two frets back. Everything else stays.'],['The octave','Two strings up, two frets up. Great for disco and funk bounces.'],['Over changes','Play root on beat 1, then chord tones. When the chord changes, change shape.']],
 try:['Play the C–Am–F–G arpeggio study above.','Find major and minor arpeggios from every note on the E and A strings.','Over the Jam along band, play only arpeggio notes.','Add a passing note between two arpeggio notes.'],
 mistakes:['Forgetting which chord you’re on.','Playing the 3rd of the wrong quality (major over minor).'],tip:'Say “root, three, five” out loud as you play.',demo:'arps',ex:[['C–Am–F–G arpeggios',()=>mkTab('4|1:3 4|2:2 4|2:5 4|3:5 4|0:5 4|1:3 4|1:7 4|2:7 4|0:1 4|0:5 4|1:3 4|2:3 4|0:3 4|1:2 4|1:5 4|2:5','bass',80,'Bass arpeggios')]],vq:'bass arpeggios chord tones'};
PL['b-walking']={t:'Building walking lines',intro:'A walking bass line plays one note per beat and moves towards the next chord. It’s the sound of jazz and swing, and it follows a simple recipe.',
 ideas:[['Beat 1: the root','Start each bar on the root so everyone hears the chord.'],['Beats 2 and 3: chord tones or steps','Use the 3rd, 5th, or notes from the scale.'],['Beat 4: the approach','A note one fret above or below the next root pulls the ear into the next bar.'],['Shape','Walk up for a while, then down. Avoid jumping around.']],
 try:['Play the F blues walking study above with the metronome on 2 and 4.','Write your own walking line over F7 and Bb7 using the recipe.','Walk over the Café swing style in Jam along.','Use only chromatic approach notes for a chorus.'],
 mistakes:['Landing somewhere other than the root on beat 1.','Playing every note the same length: walk smoothly, almost legato.'],tip:'Let the metronome click on beats 2 and 4 only, like a drummer’s hi-hat.',ex:[['F blues walking line',()=>mkTab('4|0:1 4|0:5 4|1:3 4|1:2 4|1:1 4|1:5 4|2:3 4|2:2 4|2:3 4|2:1 4|1:5 4|1:3 4|0:5 4|1:1 4|1:2 4|1:3','bass',100,'Walking bass in F')]],vq:'walking bass lines'};
PL['b-muting']={t:'Muting & dead notes',intro:'Great bass players control the notes they don’t play. Muting keeps strings quiet, and dead notes (x) add rhythm without pitch, which is the secret of funk.',
 ideas:[['Fretting-hand muting','Lift pressure off a note to stop it, and lay unused fingers across strings you’re not playing.'],['Plucking-hand muting','Rest your thumb on lower strings (floating thumb) so they don’t ring.'],['Dead notes','Lay the fretting fingers lightly on the string and pluck: a percussive “thud” with no pitch.'],['Note length','Short notes feel funky, long notes feel smooth. Decide on purpose.']],
 try:['Play the funk study above and make the x notes clearly percussive.','Play root eighths and stop each note exactly on the next beat.','Practise floating thumb on a string-crossing line.'],
 mistakes:['Open strings ringing under everything.','Dead notes so loud they sound like real notes.'],tip:'Record yourself: unwanted ringing is easier to hear on playback.',ex:[['Funk with dead notes',()=>mkTab(('2|0:0 1|0:x 1|0:x 2|0:0 2|2:2 1|1:x 1|1:x 2|1:2 2|0:3 2|0:0 ').repeat(2),'bass',90,'Dead-note groove')],['Slap & pop',()=>studyEx('bass','slap')]],vq:'bass muting technique dead notes'};
PL['b-groove']={t:'Locking with the drums',intro:'The bass and the kick drum are the foundation of a band. When they hit together, the groove feels solid; when they argue, it feels messy.',
 ideas:[['Listen to the kick','Play your notes where the kick drum plays, especially on beat 1.'],['Space','Leaving gaps lets the snare and the groove breathe.'],['Pocket','Playing right on the beat, slightly ahead (urgent) or slightly behind (laid back) changes the feel.'],['Repetition','A repeated two-bar figure is often better than a busy line.']],
 try:['Turn on the drums in Jam along and match your notes to the kick.','Play the same line ahead of, on, and behind the beat.','Write a two-bar line and repeat it for two minutes without changing it.'],
 mistakes:['Filling every gap.','Ignoring the kick drum pattern.'],tip:'Practise with the bass off and the drums loud. Your line should feel like part of the kit.',ex:[['Root eighths',()=>studyEx('bass','root8')],['Root and 5th',()=>studyEx('bass','r5')]],vq:'locking in with the drummer bass'};
/* ---------- piano ---------- */
PL['p-fingering']={t:'Scale fingering',intro:'Good fingering means you never run out of fingers. The trick is the thumb: it tucks under to continue a scale going up, and fingers cross over it coming down.',
 ideas:[['C, G, D, A and E major (right hand)','1 2 3, thumb under, 1 2 3 4 5. Going down: 5 4 3 2 1, 3 over, 3 2 1.'],['Left hand','5 4 3 2 1, 3 over, 3 2 1 going up; the reverse coming down.'],['F major (right hand)','1 2 3 4 on F G A B♭, thumb under to C: 1 2 3 4.'],['Rules','Thumbs avoid black keys. Keep the wrist level and let the arm move sideways.']],
 try:['Play C major hands separately with the fingering shown, then hands together.','Learn G and F major fingerings.','Play the exercise above with the metronome, slowly.','Play two octaves without stopping at the thumb-under.'],
 mistakes:['Thumb landing on a black key.','Twisting the wrist instead of moving the arm.'],tip:'Practise the thumb-under movement on its own: 3 then 1, back and forth, slowly.',demo:'fingering',ex:[['C major up and down',()=>mkStaff([60,62,64,65,67,69,71,72,71,69,67,65,64,62,60].map(m=>[m,2]),80,'C major scale')]],vq:'piano scale fingering'};
PL['p-lefthand']={t:'Left-hand patterns',intro:'The left hand is the rhythm section on piano. A few patterns cover most styles: block chords, broken chords, octaves, Alberti bass, stride and boogie.',
 ideas:[['Block chords','The whole chord on the beat. Simple and strong for pop.'],['Root and octave','Root low, octave above. Fills the bass with less clutter.'],['Broken and Alberti','Chord notes one at a time: low–high–middle–high is the classical Alberti bass.'],['Stride and boogie','Jazz and rock’n’roll: jump between bass and chord, or walk a rolling bass line.']],
 try:['Play each study above with the left hand alone.','Play C–Am–F–G with each pattern.','Add a simple right-hand melody over the Alberti bass.'],
 mistakes:['Left hand too loud: it’s the accompaniment.','Big jumps without looking ahead.'],tip:'Look at the left hand only for the jumps; keep your eyes on the music the rest of the time.',ex:[['Alberti bass',()=>studyEx('piano','alberti')],['Stride',()=>studyEx('piano','stride')],['Boogie-woogie',()=>studyEx('piano','boogie')],['Country pump',()=>studyEx('piano','pump')]],vq:'left hand piano patterns'};
PL['p-voicings']={t:'Pop & jazz voicings',intro:'A voicing is how you spread a chord’s notes across the keyboard. The right voicing sounds rich, keeps clear of the bass, and moves smoothly to the next chord.',
 ideas:[['Pop voicing','Root (or root and octave) in the left hand, a triad in the right hand near middle C. Choose inversions that move the least.'],['Shell voicings','Jazz left hand: root with the 3rd and 7th. Just three notes describe the chord.'],['Rootless voicings','3rd, 5th, 7th and 9th without the root, leaving it to the bass player.'],['Voice leading','Keep common notes, move the others by the smallest step.']],
 try:['Play ii–V–I in C with each voicing type above and compare.','Move the progression to F and B♭.','Play pop voicings for I–V–vi–IV with smooth inversions.'],
 mistakes:['Thick low chords that turn to mud below C3.','Jumping the right hand to root position every chord.'],tip:'In the right hand, keep your thumb near middle C and let the chords come to you.',demo:'voicings',vq:'piano voicings jazz pop'};
PL['p-pedal']={t:'Using the sustain pedal',intro:'The sustain pedal lets notes ring after you let go, joining chords smoothly. Used badly it blurs everything; used well it makes the piano sing.',
 ideas:[['Legato pedalling','Play the chord, then press the pedal just after. At the next chord, lift the pedal as you play, then press again. It’s up–down slightly after the beat.'],['Half pedalling','Lift partly to thin out a blur without losing everything.'],['Where to change','Change the pedal every time the harmony changes.'],['Other pedals','The left (una corda) softens the tone; the middle (sostenuto) holds only the notes already down.']],
 try:['Listen to the three versions above.','Play C–Am–F–G with legato pedalling, changing exactly at each chord.','Play a scale with the pedal held down and hear why it needs changing.'],
 mistakes:['Holding the pedal through chord changes.','Pressing the pedal at the same moment as the chord, which cuts the joins.'],tip:'Say “play, pedal” out loud: the pedal always comes just after the chord.',demo:'pedal',vq:'how to use the sustain pedal'};
PL['p-hands']={t:'Hands together',intro:'Playing different things in each hand is the big piano skill. It comes from practising each hand alone, then combining slowly, then speeding up.',
 ideas:[['Hands separately first','Learn each hand until it’s automatic.'],['Slow it right down','Half speed hands together beats full speed with mistakes.'],['Find the anchors','Notice where the hands play together (often beat 1) and line those up first.'],['Independence drills','Keep a steady left-hand pattern while the right hand plays different rhythms.']],
 try:['Play the melody, then the bass, then both together, using the buttons above.','Clap the right-hand rhythm while tapping the left-hand beats on your leg.','Learn a piece four bars at a time, hands together.'],
 mistakes:['Practising hands together before each hand is solid.','Speeding up the easy bits.'],tip:'When something goes wrong, practise just the two beats around the mistake.',demo:'hands',vq:'piano hand independence'};
/* ---------- drums ---------- */
PL['d-dynamics']={t:'Dynamics & ghost notes',intro:'Great drumming isn’t only what you play but how loud each note is. Accents and ghost notes give a groove its shape.',
 ideas:[['Stroke heights','Full stroke (high to high), down stroke (high to low, accent), tap (low to low) and up stroke (low to high).'],['Accents','Loud notes on purpose. Use down strokes so the next note can be quiet.'],['Ghost notes','Very soft snare taps between the backbeats, from a couple of centimetres above the head.'],['Balance','The whole kit should sound like one instrument: cymbals not drowning the drums.']],
 try:['Play the accent exercise above with clear loud and soft notes.','Play the ghost-note groove, keeping ghosts really quiet.','Record yourself and check the backbeat is louder than everything else.'],
 mistakes:['Ghost notes as loud as the backbeat.','Squeezing the sticks for accents instead of using height.'],tip:'Height, not force: a higher stick makes a louder note.',ex:[['Accents on each beat',()=>mkDrum({snare:R4('xooo')},16,80,'Accent exercise')],['Ghost-note groove',()=>studyEx('drums','ghost16')]],vq:'drum dynamics ghost notes'};
PL['d-independence']={t:'Independence',intro:'Independence means each limb does its own job without the others copying it. The classic way to build it: keep the hands steady and change the kick.',
 ideas:[['Start with the ostinato','Hi-hat eighths and snare on 2 and 4 must run on autopilot.'],['Then move the foot','Change the kick pattern bar by bar while the hands stay the same.'],['Count out loud','Say “1 e & a” so you know exactly where each kick lands.'],['Then swap','Keep the kick steady and change the hi-hat or snare instead.']],
 try:['Play the four kick variations above, looping each bar.','Play all four bars in a row without stopping.','Make up your own kick pattern and loop it for two minutes.'],
 mistakes:['The hi-hat stopping or changing when the kick gets busy.','Speeding up on the hard bars.'],tip:'Practise each bar at a tempo where it feels boring, then add 5 BPM.',ex:[['Four kick variations',()=>mkDrum({hat:'x.x.x.x.x.x.x.x.'.repeat(4),snare:'....x.......x...'.repeat(4),kick:'x.......x.......'+'x.....x.x.......'+'x.......x.x...x.'+'x.x.....x.x.....'},64,80,'Kick independence')]],vq:'drum independence exercises'};
PL['d-swing']={t:'Shuffles & swing',intro:'Swing music divides each beat into three, not two. Shuffles, swing and half-time shuffles all come from this triplet feel.',
 ideas:[['The triplet','Count “1-trip-let 2-trip-let”. A shuffle plays the first and last of each three.'],['Shuffle','The 12-bar blues feel: long–short, long–short.'],['Jazz swing','The ride plays “ding, ding-a ding” with the hi-hat foot on 2 and 4.'],['Half-time shuffle','A heavy, rolling groove with ghost notes on the triplets, made famous in rock and funk.']],
 try:['Play each study above.','Switch between straight eighths and shuffle without stopping.','Play the shuffle along with the 12-bar blues in Jam along.'],
 mistakes:['Swinging some notes and not others.','Rushing the short note.'],tip:'Sing the triplets before you play them.',ex:[['Shuffle',()=>studyEx('drums','shuffle')],['Jazz swing',()=>studyEx('drums','swing')],['Half-time shuffle',()=>studyEx('drums','halfshuffle')]],vq:'shuffle swing drums'};
PL['d-hats']={t:'Hi-hat techniques',intro:'The hi-hat is the most expressive part of the kit. How open it is and how you strike it changes the whole groove.',
 ideas:[['Closed','Tight “tick”. Play with the tip on the top cymbal.'],['Open on the “&”','Lift the foot for one note and close it on the next beat: the classic disco “tss”.'],['Half-open','A wash between closed and open, great for loud rock.'],['Foot chick','Close the hats with the foot alone, often on 2 and 4 in jazz.'],['Shoulder vs tip','Hit the edge with the stick’s shoulder for a louder, trashier sound.']],
 try:['Play four-on-the-floor with open hats on the “&” of every beat.','Alternate tip and shoulder on hi-hat eighths.','Play a jazz ride pattern with the foot chick on 2 and 4.'],
 mistakes:['Opening and not closing in time, so the hats ring into the beat.'],tip:'Think of the foot closing the hats as a note: it has to be in time.',ex:[['Four on the floor',()=>studyEx('drums','disco')],['Rock beat',()=>studyEx('drums','rockbeat')]],vq:'hi hat technique'};
PL['d-tuning']={t:'Tuning your drums',intro:'Well-tuned drums sound better at any price. Tuning is about tension: even all the way round, then high or low to suit the music.',
 ideas:[['Even tension','Tighten each lug a little at a time in a star pattern, like a car wheel.'],['Tap and listen','Tap an inch from each lug. Adjust until every point sounds the same pitch.'],['Batter and reso','The top (batter) head controls feel and attack; the bottom (resonant) head controls tone and sustain.'],['Intervals','Many drummers tune toms a 4th or 5th apart.'],['Muting','A little gel or tape on the edge tames ringing. Don’t overdo it.']],
 try:['Hear the tunings above.','Detune one drum and tune it up evenly with the star pattern.','Tune your toms to a 4th apart using a note from the keyboard.'],
 mistakes:['Tuning by turning one lug a lot.','Muting so much the drum sounds like cardboard.'],tip:'Push the centre of a new head firmly a few times to seat it before tuning.',demo:'tuning',vq:'how to tune drums'};
/* ---------- production and recording ---------- */
PL['midi-synth']={t:'Synth basics',intro:'Most synths work the same way: an oscillator makes a raw tone, a filter shapes its brightness, and envelopes shape how it changes over time. Learn these and any synth makes sense.',
 ideas:[['Oscillator','The raw waveform. Sine is pure, triangle soft, square hollow, sawtooth bright and buzzy.'],['Filter','A low-pass filter removes highs. Cutoff sets where; resonance boosts the cutoff for a squelchy peak.'],['Envelope (ADSR)','Attack, decay, sustain, release: how the sound starts, settles, holds and fades.'],['LFO','A slow wave that moves another setting: vibrato on pitch, wobble on the filter.']],
 try:['Play the synth above with each waveform.','Make a pluck: short attack, short decay, no sustain.','Make a pad: slow attack, long release, filter half closed.','Add the LFO to the filter for a wobble.'],
 mistakes:['Turning everything up at once: change one knob at a time.'],tip:'Most presets are just these four ideas. Open a preset you like and look at its settings.',widget:'synth',vq:'synth basics'};
PL['abl-sampling']={t:'Sampling & Simpler',intro:'Sampling means turning any recording into an instrument: a vocal chop, a drum hit, a field recording. In Live, Simpler does most of it.',
 ideas:[['Simpler modes','Classic plays the sample across the keyboard; One-Shot plays it once like a drum hit; Slice chops it to pads.'],['Warp in Simpler','Turn on Warp so a loop stays in time at any pitch.'],['Chopping','Slice by transient, beat or manually, then play the slices from a MIDI clip.'],['Clearing samples','Sampling other people’s records needs permission to release. Use your own recordings or royalty-free packs.']],
 try:['Drag a vocal sample into Simpler in Classic mode and play a melody with it.','Slice a drum loop and rearrange the slices.','Record a sound with your phone and turn it into an instrument.'],
 mistakes:['Leaving clicks at slice starts: use a short fade.'],tip:'Right-click a clip → Convert to New MIDI Track gives you instant chops.',vq:'Simpler sampling'};
PL['lgc-sampler']={t:'Quick Sampler & Live Loops',intro:'Quick Sampler turns any audio into an instrument in seconds, and Live Loops gives Logic an Ableton-style grid for trying ideas.',
 ideas:[['Quick Sampler','Drag audio onto an empty track header and choose Quick Sampler. Modes: Classic, One Shot, Slice, Recorder.'],['Slice mode','Chops a loop at transients and maps each slice to a key.'],['Live Loops grid','Cells of loops you trigger in time, organised into scenes.'],['Perform to the timeline','Record your Live Loops performance into the Tracks area.']],
 try:['Turn a vocal phrase into a Quick Sampler instrument.','Slice a drum loop and play a new beat on the keyboard.','Build three scenes in Live Loops and record a performance.'],
 mistakes:['Forgetting Flex/Follow tempo settings, so samples drift.'],tip:'Use the Recorder mode to sample straight from your mic.',vq:'Quick Sampler Live Loops'};
PL['rec-vocals']={t:'Recording vocals',intro:'Vocals are the centre of most songs. Comfort, a good headphone mix and a calm room matter as much as the microphone.',
 ideas:[['Mic and distance','A cardioid mic 15–25 cm away with a pop filter. Closer for intimate, further for powerful singers.'],['The room behind the singer','The mic faces the wall behind the singer, so treat that wall first (a duvet works).'],['Headphone mix','Plenty of their own voice, a little reverb so they feel good, and the click if needed.'],['Takes','Record 3–5 full takes, then comp the best lines.'],['Levels','Peaks around −10 dB; quiet verses and loud choruses may need different gain.']],
 try:['Record one verse at three distances and compare.','Try the duvet trick and compare.','Record three takes and comp the best lines.'],
 mistakes:['Singer too close to a wall.','No water and no breaks: voices tire quickly.'],tip:'Record the first few warm-up takes. They are often the most natural.',vq:'how to record vocals at home'};
PL['rec-guitars']={t:'Recording guitar & bass',intro:'Guitars can be recorded with a mic on the amp, a mic on the acoustic, or straight into the interface (DI) through amp simulators. Bass almost always gets a DI.',
 ideas:[['DI and amp sims','Plug into the Hi-Z input and use an amp plug-in. Quiet, flexible and you can change the tone later.'],['Re-amping','Record the clean DI, then send it back out through a real amp later.'],['Double-tracking','Record the same rhythm part twice and pan one left, one right for a huge sound.'],['Acoustic','Point the mic near the 12th–14th fret, 15–30 cm away. A second mic near the bridge adds body.'],['Bass','A DI for clean low end, plus an amp mic or amp sim for character.']],
 try:['Record a DI guitar part and try three amp sims on it.','Double-track a rhythm part and pan the takes hard left and right.','Record bass DI and compare with an amp sim.'],
 mistakes:['Double-tracking by copying the same take: it doesn’t sound wider.','Too much distortion: it sounds smaller in a mix.'],tip:'Use less gain than you think for recorded rhythm guitar.',vq:'recording guitar and bass at home'};
PL['rec-drums']={t:'Recording drums',intro:'Drums are the hardest thing to record at home: loud, many mics and lots of room sound. Start simple and add mics only when needed.',
 ideas:[['One mic','A single mic in front of the kit at about chest height can sound great.'],['Glyn Johns (3–4 mics)','One overhead above the snare, one by the floor tom pointing across the kit at the same distance from the snare, plus kick and snare mics.'],['Spaced pair or XY','Two overheads for stereo. Check they’re the same distance from the snare.'],['Phase','When two mics hear the same drum at different times, the sound can thin out. Flip polarity and listen for the fuller one.'],['Tune first','Good tuning and fresh heads beat any plug-in.']],
 try:['Record the kit with one mic, then with three, and compare.','Measure overheads to the snare with a string or tape.','Flip polarity on the kick or snare mic and keep the fuller sound.'],
 mistakes:['Overheads at different distances from the snare.','Recording in a small, boomy room with no treatment.'],tip:'If the kit sounds good in the room, it will be much easier to record.',vq:'recording drums at home'};
/* ---------- theory ---------- */
PL['th-sevenths']={t:'Seventh chords in a key',intro:'Add one more third on top of each triad in a key and you get its seventh chords. They’re the sound of jazz, soul, R&B and a lot of pop.',
 ideas:[['In a major key','I maj7, ii m7, iii m7, IV maj7, V7, vi m7, vii m7♭5. Only V is a dominant 7th.'],['In a minor key','i m7, ii m7♭5, ♭III maj7, iv m7, v m7 (or V7 with a raised 7th), ♭VI maj7, ♭VII 7.'],['Why V7 pulls home','Its 3rd and 7th form a tritone that resolves inwards to the tonic chord.'],['The ii–V–I','ii7–V7–Imaj7 is the most common progression in jazz.']],
 try:['Play every seventh chord in C above, then in another key.','Listen to the ii–V–I and the I–vi–ii–V.','Spell the seventh chords of G major out loud.'],
 mistakes:['Calling every 7th chord “dominant”: maj7 and m7 are different sounds.'],tip:'Maj7 sounds dreamy, m7 mellow, 7 bluesy and restless, m7♭5 dark and unresolved.',demo:'prog:sevenths',quiz:'harmony',vq:'diatonic seventh chords'};
PL['th-cadences']={t:'Cadences',intro:'A cadence is the end of a musical phrase, like punctuation. Some sound finished, some ask a question, and one fools you.',
 ideas:[['Perfect (authentic)','V–I. The strongest full stop.'],['Plagal','IV–I. The softer “amen” ending.'],['Imperfect (half)','Any chord to V. A comma: the music wants to continue.'],['Interrupted (deceptive)','V–vi. You expect home and get a surprise.']],
 try:['Hear each cadence above in two different keys.','Spot the cadences at the end of phrases in a song you know.','End a progression you wrote with each type and compare.'],
 mistakes:['Thinking every phrase must end on I.'],tip:'Play V and stop. That pull you feel is why cadences work.',demo:'prog:cadences',quiz:'harmony',vq:'cadences music theory'};
PL['th-secondary']={t:'Secondary dominants',intro:'A secondary dominant is a dominant 7th chord borrowed to point at a chord other than I. It adds colour and strong pull without changing key.',
 ideas:[['V of V','In C, the V chord is G. The dominant of G is D7, so D7 → G is “V of V” (written V7/V).'],['Any chord can have one','Except the diminished vii: V7/ii, V7/iii, V7/IV, V7/V and V7/vi are all common.'],['The giveaway','A raised note that isn’t in the key, like the F♯ in D7 in C major.'],['Chains','E7–A7–D7–G7–C goes round the circle of fifths, one secondary dominant after another.']],
 try:['Play each example above and listen for the pull.','Find V7/V and V7/vi in G and F.','Add a secondary dominant before the vi chord in a progression of your own.'],
 mistakes:['Forgetting the 3rd is raised: in C, V7/vi is E7, not Em7.'],tip:'To find V of any chord, count up a 5th from that chord’s root and play a 7th chord.',demo:'prog:secondary',quiz:'harmony',vq:'secondary dominants'};
PL['th-borrowed']={t:'Borrowed chords',intro:'Borrowed chords come from the parallel minor key (same root, other mode). They add a bittersweet or heroic colour to a major song.',
 ideas:[['iv (minor four)','In C, F minor instead of F major. Instantly wistful.'],['♭VII','B♭ in C. Rock and film music love it.'],['♭VI','A♭ in C. Big, cinematic, often followed by ♭VII then I.'],['♭III','E♭ in C. Bright and bold in rock.']],
 try:['Play each progression above.','Swap IV for iv at the end of a chorus you know.','Write I–♭VI–♭VII–I in three keys.'],
 mistakes:['Using borrowed chords everywhere: they work as a surprise.'],tip:'IV–iv–I is one of the most emotional moves in pop. Listen for it.',demo:'prog:borrowed',quiz:'harmony',vq:'modal interchange borrowed chords'};
PL['th-blues']={t:'The blues',intro:'The 12-bar blues is the backbone of rock’n’roll, jazz and soul. Every chord is a dominant 7th, and the melody uses the blues scale over all of them.',
 ideas:[['The form','I7 for 4 bars, IV7 for 2, I7 for 2, V7, IV7, I7, then V7 as a turnaround.'],['Quick change','Go to IV7 in bar 2 and back to I7 in bar 3.'],['Minor blues','i m7, iv m7 and a V7: darker, as in many jazz and soul tunes.'],['Melody','Minor pentatonic or blues scale from the key note over everything; mix in major pentatonic for sweetness.']],
 try:['Play the 12-bar above and count the bars out loud.','Play it in A and E, the classic guitar keys.','Solo over it with the blues scale in Jam along (12-bar blues).'],
 mistakes:['Losing count: say the bar numbers.'],tip:'Listen for bar 9: the V7 is where the tension peaks.',demo:'prog:blues',quiz:'harmony',vq:'12 bar blues'};
PL['th-extended']={t:'Extended chords',intro:'Keep stacking thirds past the 7th and you get 9ths, 11ths and 13ths. They’re the lush chords of jazz, neo-soul, R&B and film music.',
 ideas:[['9th chords','7th chord plus the 9th (the 2nd an octave up). Cmaj9, Cm9, C9.'],['add9','A triad plus the 9th, without the 7th. Bright, used everywhere in pop.'],['11th and 13th','The 11th sits well on minor chords (Cm11). On dominant chords the 13th is more common.'],['Voicing them','Leave out the 5th (and often the root): the 3rd, 7th and extension carry the sound.']],
 try:['Play each chord above and hear what each extension adds.','Swap the chords in a progression for their 9th versions.','Play a 13th chord with only root, 3rd, 7th and 13th.'],
 mistakes:['Playing every note of a 13th chord: it turns to mud.'],tip:'Try Cmaj9 to Fmaj9 for an instant neo-soul sound.',demo:'ext',vq:'extended chords 9th 11th 13th'};
PL['th-melody']={t:'Writing melodies',intro:'Memorable melodies use a few simple ideas: a short motif, repetition with change, and a shape that rises and falls with a high point.',
 ideas:[['Motif','A short idea of 3–5 notes. Most great melodies grow from one.'],['Repeat and vary','Play it again, then change the rhythm, the ending or the starting note.'],['Sequence','Repeat the motif starting on a higher or lower note.'],['Chord tones on strong beats','Land on notes of the chord on beat 1; use passing notes between.'],['Shape','Mostly steps with a few leaps, and one high point per phrase.']],
 try:['Hear the motif and its variations above.','Write a 4-note motif and make three variations.','Write an 8-bar melody over C–Am–F–G that lands on chord tones.'],
 mistakes:['Too many different ideas: repeat more.','Every phrase ending on the root.'],tip:'Sing it before you play it. If you can’t remember it, nobody else will.',demo:'melody',vq:'how to write a melody'};

const NEWL=Object.keys(PL).filter(k=>!PAGES[k]);NEWL.forEach(k=>PAGES[k]=lessonPage(k));
NEWL.filter(k=>k.startsWith('th-')).forEach(k=>LEARN_THEORY.push([k,PL[k].t]));
NEWL.filter(k=>k.startsWith('rec-')).forEach(k=>LEARN_REC.push([k,PL[k].t]));
NEWL.filter(k=>!k.startsWith('th-')&&!k.startsWith('rec-')).forEach(k=>LEARN_INST.push([k,PL[k].t]));
[['guitar','g-'],['bass','b-'],['piano','p-'],['drums','d-']].forEach(([i,p])=>INST_PRI[i].push(...NEWL.filter(k=>k.startsWith(p))));
INST_PRI.ableton.push('abl-sampling','midi-synth');INST_PRI.logic.push('lgc-sampler','midi-synth');INST_PRI.midi.push('midi-synth');
const TH_CURR=[['Seventh chords in a key','th-sevenths',['harmony'],'Play every seventh chord in C and G, then the ii–V–I in three keys.'],['The blues','th-blues',['harmony'],'Play the 12-bar blues in A and count the bars out loud.'],['Cadences','th-cadences',['harmony'],'Find the cadence at the end of each phrase in a song you know.'],['Secondary dominants','th-secondary',['harmony'],'Add a V7/vi to a progression you know.'],['Borrowed chords','th-borrowed',['harmony'],'Use IV–iv–I at the end of a chorus.'],['Extended chords','th-extended',['harmony','chords'],'Turn a progression into 9th chords.'],['Writing melodies','th-melody',['earmelody'],'Write an 8-bar melody from one 4-note motif.']];
CURR.guitar.push(['Barre chords','g-barre',['shapes'],'Play G–C–Am–F as barre chords without stopping.'],['Lead techniques','g-lead',['world'],'Add a bend, a slide and vibrato to one solo phrase.'],['Triads on the top strings','g-triads',['chords'],'Play C and G triads all the way up the neck.'],['Fingerpicking','g-fingerstyle',['shapes'],'Fingerpick C–Am–F–G with p-i-m-a.'],['Arpeggios','g-arps',['chords'],'Solo over Jam along using only chord tones.'],...TH_CURR,['Recording guitar & bass','rec-guitars',['recording'],'Double-track a rhythm part.']);
CURR.bass.push(['Chord tones & arpeggios','b-arps',['chords'],'Play arpeggios for C–Am–F–G.'],['Locking with the drums','b-groove',['rhythm'],'Play only where the kick drum plays for one song.'],['Muting & dead notes','b-muting',['bass'],'Play the dead-note groove with no ringing strings.'],['Building walking lines','b-walking',['bass'],'Walk over an F blues for two choruses.'],...TH_CURR.slice(0,4),['Recording guitar & bass','rec-guitars',['recording'],'Record a DI bass part and try an amp sim.']);
CURR.piano.push(['Scale fingering','p-fingering',['scales'],'Play C, G and F major with the right fingering, hands separately.'],['Left-hand patterns','p-lefthand',['chords'],'Play C–Am–F–G with Alberti bass and with stride.'],['Using the sustain pedal','p-pedal',['chords'],'Play a progression with legato pedalling.'],['Hands together','p-hands',['notes'],'Learn Ode to Joy hands together, four bars at a time.'],['Pop & jazz voicings','p-voicings',['chords','harmony'],'Play ii–V–I with shells and rootless voicings in three keys.'],...TH_CURR,['Recording vocals','rec-vocals',['recording'],'Record a verse at three mic distances.']);
CURR.drums.push(['Dynamics & ghost notes','d-dynamics',['drums'],'Play the accent exercise with a clear difference between loud and soft.'],['Independence','d-independence',['drums'],'Loop each kick variation for two minutes.'],['Hi-hat techniques','d-hats',['drums'],'Play four-on-the-floor with clean open hats.'],['Shuffles & swing','d-swing',['rhythm'],'Switch between straight and shuffle without stopping.'],['Tuning your drums','d-tuning',['drums'],'Tune a tom evenly with the star pattern.'],['Recording drums','rec-drums',['recording'],'Record your kit with one mic, then three, and compare.']);
CURR.ableton.push(['Synth basics','midi-synth',['midi'],'Make a pluck, a pad and a bass on the synth.'],['Sampling & Simpler','abl-sampling',['ableton'],'Chop a vocal into a playable instrument.'],...TH_CURR.slice(0,2),['Recording vocals','rec-vocals',['recording'],'Record and comp three vocal takes.']);
CURR.logic.push(['Synth basics','midi-synth',['midi'],'Make a pluck, a pad and a bass on the synth.'],['Quick Sampler & Live Loops','lgc-sampler',['logic'],'Build three Live Loops scenes and record a performance.'],...TH_CURR.slice(0,2),['Recording vocals','rec-vocals',['recording'],'Record and comp three vocal takes.']);
CURR.midi.push(['Synth basics','midi-synth',['midi'],'Make a pluck, a pad and a bass on the synth.'],...TH_CURR.slice(0,3));

/* ---------- demos for the new lessons ---------- */
const DEMOS={};
const ROMAN_FIX=s=>s;
function resolveChord(key,mode,spec){if(Array.isArray(spec)){const c=chordAt(key,mode,spec[0],spec[1]);if(spec[2])c.roman=spec[2];return c}
 if(spec.v){const tg=chordAt(key,'major',spec.v);const root=spellUp(tg.root,7,5);return{root,t:'7',sym:chordSym(root,'7'),roman:'V7/'+tg.roman}}
 if(spec.b){const c=chordAt(key,'minor',spec.b,spec.t);return{...c,roman:spec.r||c.roman}}return chordAt(key,mode,1)}
const PROGSETS={
 sevenths:[{n:'All seven in the key',mode:'major',ch:[1,2,3,4,5,6,7].map(d=>[d,DIA.major.sev[d-1]]),beat:1},{n:'ii–V–I',mode:'major',ch:[[2,'m7'],[5,'7'],[1,'maj7']]},{n:'I–vi–ii–V',mode:'major',ch:[[1,'maj7'],[6,'m7'],[2,'m7'],[5,'7']]},{n:'iii–vi–ii–V–I',mode:'major',ch:[[3,'m7'],[6,'m7'],[2,'m7'],[5,'7'],[1,'maj7']]},{n:'Minor key sevenths',mode:'minor',ch:[1,2,3,4,5,6,7].map(d=>[d,DIA.minor.sev[d-1]])}],
 cadences:[{n:'Perfect (V–I)',mode:'major',ch:[[1],[4],[5,'7'],[1]]},{n:'Plagal (IV–I)',mode:'major',ch:[[1],[5],[4],[1]]},{n:'Imperfect (ends on V)',mode:'major',ch:[[1],[6],[4],[5]]},{n:'Interrupted (V–vi)',mode:'major',ch:[[1],[4],[5,'7'],[6]]}],
 secondary:[{n:'V7/vi',mode:'major',ch:[[1],{v:6},[6],[4]]},{n:'V7/V',mode:'major',ch:[[1],{v:5},[5,'7'],[1]]},{n:'V7/IV',mode:'major',ch:[[1],{v:4},[4],[1]]},{n:'V7/ii',mode:'major',ch:[[1],[6],{v:2},[2],[5,'7'],[1]]},{n:'Circle chain',mode:'major',ch:[{v:6},{v:2},{v:5},[5,'7'],[1]]}],
 borrowed:[{n:'IV–iv–I',mode:'major',ch:[[1],[4],{b:4,t:'min',r:'iv'},[1]]},{n:'I–♭VII–IV–I',mode:'major',ch:[[1],{b:7,t:'maj',r:'♭VII'},[4],[1]]},{n:'I–♭VI–♭VII–I',mode:'major',ch:[[1],{b:6,t:'maj',r:'♭VI'},{b:7,t:'maj',r:'♭VII'},[1]]},{n:'I–♭III–IV–I',mode:'major',ch:[[1],{b:3,t:'maj',r:'♭III'},[4],[1]]}],
 blues:[{n:'12-bar blues',mode:'major',ch:[1,1,1,1,4,4,1,1,5,4,1,5].map(d=>[d,'7']),beat:.75},{n:'Quick change',mode:'major',ch:[1,4,1,1,4,4,1,1,5,4,1,5].map(d=>[d,'7']),beat:.75},{n:'Minor blues',mode:'minor',ch:[[1,'m7'],[1,'m7'],[1,'m7'],[1,'m7'],[4,'m7'],[4,'m7'],[1,'m7'],[1,'m7'],[6,'7'],[5,'7'],[1,'m7'],[5,'7']],beat:.75}]};
function progDemo(host,setId){let key='C',si=0,cur=-1;const sets=PROGSETS[setId];
 const chords=()=>{const S=sets[si];return S.ch.map(sp=>resolveChord(normKey(key,S.mode==='minor'?'m':'M'),S.mode,sp))};
 const render=()=>{const S=sets[si];key=normKey(key,S.mode==='minor'?'m':'M');const cs=chords();host.innerHTML=`<h3>Hear it</h3><div class="pickrow"><span class="eyebrow">${S.mode==='minor'?'Minor key':'Key'}</span>${pillsHTML('k',keyItems(S.mode==='minor'?'m':'M'),key)}</div>${pillsHTML('ps',sets.map((x,i)=>[String(i),x.n]),String(si))}
  <div class="chordrow" id="pdc" style="margin-top:10px">${cs.map((c,i)=>`<button class="cbtn" data-i="${i}"><small>${esc(c.roman||'')}</small><b>${c.sym}</b></button>`).join('')}</div><div class="row"><button class="btn primary small" id="pdp">${ICON.play} Play</button><span class="hint">Click a chord to hear it on its own and see it.</span></div><div id="pdv"></div>`;
  bindPills(host,(g,v)=>{if(g==='k')key=v;else si=+v;render()});
  host.querySelector('#pdp').onclick=()=>{const cs2=chords();playSeq(cs2.map(c=>voice(c.root,c.t)),S.beat||.9,i=>host.querySelectorAll('#pdc .cbtn').forEach((b,j)=>b.classList.toggle('on',j===i)))};
  host.querySelectorAll('#pdc .cbtn').forEach(b=>b.onclick=()=>{const c=chords()[+b.dataset.i];play(voice(c.root,c.t));const ms=chordMidis(c.root,c.t,inst()==='bass'?36:48);host.querySelector('#pdv').innerHTML=`<p class="hint">${c.sym}: ${chordNotes(c.root,c.t).map(pr).join(' ')}</p>${instView(ms,chordNotes(c.root,c.t),ms[0])}`})};
 const inst=()=>INST();render()}
['sevenths','cadences','secondary','borrowed','blues'].forEach(k=>DEMOS['prog:'+k]=h=>progDemo(h,k));
DEMOS.barre=host=>{let root='G',q='maj',shape='E';
 const frets=()=>{const pc=parse(root).pc;if(shape==='E'){let f=((pc-4)%12+12)%12;if(f===0)f=12;return q==='maj'?[f,f+2,f+2,f+1,f,f]:[f,f+2,f+2,f,f,f]}let f=((pc-9)%12+12)%12;if(f===0)f=12;return q==='maj'?[null,f,f+2,f+2,f+2,f]:[null,f,f+2,f+2,f+1,f]};
 const render=()=>{const fr=frets();const names={};const t=q==='maj'?'maj':'min';chordNotes(root,t).forEach((n,i)=>names[(parse(root).pc+CH[t].st[i][0])%12]=n);
  host.innerHTML=`<h3>Find any barre chord</h3><div class="pickrow"><span class="eyebrow">Chord</span>${pillsHTML('r',keyItems('M'),root)}</div><div class="row" style="gap:16px;flex-wrap:wrap">${pillsHTML('q',[['maj','Major'],['min','Minor']],q)}${pillsHTML('sh',[['E','E shape (root on 6th string)'],['A','A shape (root on 5th string)']],shape)}</div>
  <div class="row" style="align-items:center;gap:20px;margin-top:8px">${chordBox({frets:fr,barre:Math.min(...fr.filter(x=>x!=null))},parse(root).pc,names)}<div><p><b>${chordSym(root,t)}</b> · ${shape} shape, barre at fret ${Math.min(...fr.filter(x=>x!=null))}</p><button class="btn primary small" id="bp">${ICON.play} Strum it</button></div></div>`;
  bindPills(host,(g,v)=>{if(g==='r')root=v;else if(g==='q')q=v;else shape=v;render();strumIt()});host.querySelector('#bp').onclick=strumIt};
 const strumIt=()=>{const c=audio();if(!c)return;const ms=frets().map((f,i)=>f==null?null:STR[i]+f).filter(x=>x!=null);strum(ms,c.currentTime+.03,1.8,.22,{spread:.02})};render()};
DEMOS.triads=host=>{let root='C',q='maj';const S=GSTR();
 const render=()=>{const t=q;const pcs=CH[t].st.map(([x])=>(parse(root).pc+x)%12);const names=chordNotes(root,t);const spots=[];for(let s=3;s<6;s++)for(let f=0;f<=15;f++){const pc=(S[s]+f)%12;const i=pcs.indexOf(pc);if(i>=0)spots.push({s,f,name:names[i],root:i===0})}
  host.innerHTML=`<h3>Every ${chordSym(root,t)} triad on the top strings</h3><div class="pickrow"><span class="eyebrow">Chord</span>${pillsHTML('r',keyItems('M'),root)}</div>${pillsHTML('q',[['maj','Major'],['min','Minor'],['dim','Diminished']],q)}${fretboard({strings:S,spots,frets:15})}<p class="hint">Orange is the root. Each group of three neighbouring notes across the G, B and E strings is one shape.</p><div class="row"><button class="btn primary small" id="tp">${ICON.play} Hear the three inversions</button></div>`;
  bindPills(host,(g,v)=>{if(g==='r')root=v;else q=v;render()});host.querySelector('#tp').onclick=()=>{[0,1,2].forEach(inv=>setTimeout(()=>play(chordMidis(root,q,60,inv),{timbre:'guitar'}),inv*700))}};render()};
DEMOS.arps=host=>{let root='A',t='min';
 const render=()=>{const ms=chordMidis(root,t,INST()==='bass'?33:45);const nn=chordNotes(root,t);host.innerHTML=`<h3>Chord tones across the neck</h3><div class="pickrow"><span class="eyebrow">Root</span>${pillsHTML('r',keyItems('M'),root)}</div>${pillsHTML('t',[['maj','Major'],['min','Minor'],['7','Dominant 7'],['m7','Minor 7'],['maj7','Major 7']],t)}<p class="hint">${chordSym(root,t)}: ${nn.map(pr).join(' ')}. Orange is the root.</p>${instView(ms,nn,ms[0])}<div class="row"><button class="btn primary small" id="ap">${ICON.play} Hear the arpeggio</button></div>`;
  bindPills(host,(g,v)=>{if(g==='r')root=v;else t=v;render()});host.querySelector('#ap').onclick=()=>play([...ms,ms[0]+12],{mode:'seq',gap:.28})};render()};
DEMOS.fingering=host=>{const FG={C:['C','major'],G:['G','major'],D:['D','major'],F:['F','major'],Am:['A','natural']};const RH={C:[1,2,3,1,2,3,4,5],G:[1,2,3,1,2,3,4,5],D:[1,2,3,1,2,3,4,5],F:[1,2,3,4,1,2,3,4],Am:[1,2,3,1,2,3,4,5]},LH={C:[5,4,3,2,1,3,2,1],G:[5,4,3,2,1,3,2,1],D:[5,4,3,2,1,3,2,1],F:[5,4,3,2,1,3,2,1],Am:[5,4,3,2,1,3,2,1]};let sc='C',hand='R';
 const render=()=>{const[k,t]=FG[sc];const ms=scaleMidis(k,t,hand==='R'?60:48);const fing=(hand==='R'?RH:LH)[sc];const on={},labels={};ms.forEach((m,i)=>{on[m]=i===0||i===7?'root':'on';labels[m]=String(fing[i])});const lo=Math.floor(ms[0]/12)*12;
  host.innerHTML=`<h3>Finger numbers</h3><p class="hint">1 is the thumb, 5 the little finger. Shown going up; reverse them coming down.</p><div class="row" style="gap:16px;flex-wrap:wrap">${pillsHTML('sc',Object.keys(FG).map(x=>[x,x==='Am'?'A minor':x+' major']),sc)}${pillsHTML('h',[['R','Right hand'],['L','Left hand']],hand)}</div>${keyboard({start:lo,end:lo+24,on,labels})}<div class="row"><button class="btn primary small" id="fp">${ICON.play} Hear it</button></div>`;
  bindPills(host,(g,v)=>{if(g==='sc')sc=v;else hand=v;render()});host.querySelector('#fp').onclick=()=>play([...ms,...ms.slice(0,-1).reverse()],{mode:'seq',gap:.3,timbre:'piano'})};render()};
DEMOS.voicings=host=>{let key='C',vt='pop';
 const chords=()=>[chordAt(key,'major',2,'m7'),chordAt(key,'major',5,'7'),chordAt(key,'major',1,'maj7')];
 const voicingOf=(c,prev)=>{const pc=parse(c.root).pc;const R=36+pc+(pc>7?-12:0)+12;if(vt==='pop'){const tri=c.t==='m7'?'min':'maj';let best=null;for(let inv=0;inv<3;inv++){const v=chordMidis(c.root,tri,57,inv).map(x=>x<57?x+12:x);const d=prev?v.reduce((a,x,i)=>a+Math.abs(x-(prev[i+1]||x)),0):Math.abs(v[0]-60);if(!best||d<best.d)best={v,d}}return[R,...best.v.sort((a,b)=>a-b)]}
  if(vt==='shell'){const third=CH[c.t].st[1][0],sev=CH[c.t].st[3][0];return[R,R+sev,R+third+12]}return[R-12,...rootless(c)]};
 const render=()=>{const cs=chords();let prev=null;const vs=cs.map(c=>{const v=voicingOf(c,prev);prev=v;return v});const all=vs.flat();const lo=Math.floor(Math.min(...all)/12)*12;
  host.innerHTML=`<h3>ii–V–I three ways</h3><div class="pickrow"><span class="eyebrow">Key</span>${pillsHTML('k',keyItems('M'),key)}</div>${pillsHTML('vt',[['pop','Pop: root + triad'],['shell','Jazz shells: root, 7th, 3rd'],['rootless','Rootless (bass plays the root)']],vt)}
  <div class="vcol">${cs.map((c,i)=>`<div><b>${c.sym}</b>${keyboard({start:lo,end:lo+36,on:Object.fromEntries(vs[i].map(m=>[m,'on']))})}</div>`).join('')}</div><div class="row"><button class="btn primary small" id="vp">${ICON.play} Play</button></div>`;
  bindPills(host,(g,v)=>{if(g==='k')key=v;else vt=v;render()});host.querySelector('#vp').onclick=()=>{const c=audio();if(!c)return;vs.forEach((v,i)=>v.forEach(m=>tone(m,c.currentTime+.05+i*1.3,1.3,.14,'piano')))}};render()};
DEMOS.pedal=host=>{host.innerHTML=`<h3>Hear the pedal</h3><p class="hint">C–Am–F–G as broken chords, three ways.</p><div class="row"><button class="btn small" data-p="none">${ICON.play} No pedal</button><button class="btn small" data-p="blur">${ICON.play} Pedal held down (blurred)</button><button class="btn small" data-p="legato">${ICON.play} Legato pedalling</button></div>`;
 host.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const c=audio();if(!c)return;const t0=c.currentTime+.05,e=.32;const P=b.dataset.p;['C','A','F','G'].forEach((r,ci)=>{const ms=chordMidis(r,r==='A'?'min':'maj',48);[ms[0],ms[1],ms[2],ms[0]+12,ms[1]+12,ms[2]+12].forEach((m,i)=>{const st=ci*6+i;const t=t0+st*e;const dur=P==='none'?e*.9:P==='blur'?(24-st)*e+1.5:(6-i)*e;tone(m,t,dur,.2,'piano')})})})};
DEMOS.hands=host=>{const RH=[64,64,65,67,67,65,64,62,60,60,62,64,64,62,62],RHd=[1,1,1,1,1,1,1,1,1,1,1,1,1.5,.5,2],LH=[[48,4],[43,4],[48,4],[43,4]];
 host.innerHTML=`<h3>One hand, then both</h3><p class="hint">Ode to Joy (Beethoven, public domain): the melody, then the bass, then together.</p><div class="row"><button class="btn small" data-h="R">${ICON.play} Right hand</button><button class="btn small" data-h="L">${ICON.play} Left hand</button><button class="btn primary small" data-h="B">${ICON.play} Together</button></div>`;
 host.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{const c=audio();if(!c)return;const t0=c.currentTime+.05,q=.5;const h=b.dataset.h;if(h!=='L'){let t=0;RH.forEach((m,i)=>{tone(m,t0+t*q,RHd[i]*q*.95,.3,'piano');t+=RHd[i]})}if(h!=='R'){let t=0;LH.forEach(([m,d])=>{tone(m,t0+t*q,d*q*.95,.2,'piano');tone(m+7,t0+t*q,d*q*.95,.15,'piano');t+=d})}})};
DEMOS.tuning=host=>{host.innerHTML=`<h3>Hear different tunings</h3><div class="row">${[['low','Low and fat',.8],['mid','Medium',1],['high','High and tight',1.25]].map(([k,l,r])=>`<button class="btn small" data-r="${r}">${ICON.play} ${l}</button>`).join('')}</div><p class="hint">Snare, then high tom and floor tom. Low tunings suit rock; high tunings suit jazz and funk.</p>`;
 host.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{const c=audio();if(!c)return;const r=+b.dataset.r,t0=c.currentTime+.05;const S=SMP.drums;['snare','snare','tom1','tom1','tom2','tom2'].forEach((k,i)=>{const t=t0+i*.28;if(SND==='samples'&&S&&S.ready&&S[k])playSample(S[k],t,DRUM_LVL[k]/S[k].peak,r,MASTER);else drum(k,t,1)});if(!(S&&S.ready))loadSamples('drums')})};
DEMOS.ext=host=>{let root='C';const EX=[['',[0,4,7],'Major triad'],['maj7',[0,4,7,11],'Major 7th'],['add9',[0,4,7,14],'Add 9: triad + 9th'],['maj9',[0,4,7,11,14],'Major 9th'],['9',[0,4,7,10,14],'Dominant 9th'],['m9',[0,3,7,10,14],'Minor 9th'],['m11',[0,3,10,14,17],'Minor 11th (no 5th)'],['13',[0,4,10,14,21],'Dominant 13th (no 5th or 11th)'],['7♯9',[0,4,10,15],'The “Hendrix chord”']];
 const render=()=>{const pc=parse(root).pc;host.innerHTML=`<h3>Build them up</h3><div class="pickrow"><span class="eyebrow">Root</span>${pillsHTML('r',keyItems('M'),root)}</div><div class="cols">${EX.map(([s,iv,d],i)=>`<button class="mini" data-e="${i}"><h4>${pr(root)}${s}</h4><span class="o">${d}</span></button>`).join('')}</div><div id="exv"></div>`;
  bindPills(host,(g,v)=>{root=v;render()});host.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{const[s,iv]=EX[+b.dataset.e];const ms=iv.map(x=>48+pc+x);play(ms);host.querySelector('#exv').innerHTML=keyboard({start:48,end:84,on:Object.fromEntries(ms.map((m,i)=>[m,i===0?'root':'on']))})})};render()};
DEMOS.melody=host=>{let key='C';const M=[[1,1],[2,1],[3,1],[5,1]];const VAR=[['Motif',M],['Repeat',[...M,...M]],['Sequence (one step up)',[...M,...M.map(([d,l])=>[d+1,l])]],['New rhythm',[...M,[1,1.5],[2,.5],[3,1],[5,1]]],['Upside down',[...M,[1,1],[0,1],[-1,1],[-3,1]]],['New ending',[...M,[1,1],[2,1],[3,1],[1,1]]]];
 const deg=(k,d)=>{const sc=scaleMidis(k,'major',60).slice(0,7);const o=Math.floor((d-1)/7),i=((d-1)%7+7)%7;return sc[i]+12*o};
 host.innerHTML=`<h3>One motif, many melodies</h3><div class="pickrow"><span class="eyebrow">Key</span>${pillsHTML('k',keyItems('M'),key)}</div><div class="row">${VAR.map(([n],i)=>`<button class="btn small" data-mv="${i}">${ICON.play} ${n}</button>`).join('')}</div>`;
 bindPills(host,(g,v)=>{key=v;host.querySelectorAll('[data-group=k] .pill').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===v))});
 host.querySelectorAll('[data-mv]').forEach(b=>b.onclick=()=>{const c=audio();if(!c)return;const t0=c.currentTime+.05,q=.4;let t=0;const ns=VAR[+b.dataset.mv][1];const tot=ns.reduce((a,x)=>a+x[1],0);chordMidis(key,'maj',48).forEach(m=>tone(m,t0,tot*q,.08,'piano'));ns.forEach(([d,l])=>{tone(deg(key,d),t0+t*q,l*q*.9,.3,'piano');t+=l})})};
/* synth */
WIDGETS.synth=host=>{const P={wave:'sawtooth',cut:1800,res:4,a:.01,d:.25,s:.6,r:.4,lfo:0,lfoR:4};const held=new Map();
 const noteOn=m=>{const c=audio();if(!c||held.has(m))return;const t=c.currentTime;const o=c.createOscillator();o.type=P.wave;o.frequency.value=440*Math.pow(2,(m-69)/12);const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=P.cut;f.Q.value=P.res;const g=c.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(.22,t+P.a);g.gain.linearRampToValueAtTime(.22*P.s+.0001,t+P.a+P.d);
  let l=null;if(P.lfo>0){l=c.createOscillator();l.frequency.value=P.lfoR;const lg=c.createGain();lg.gain.value=P.cut*P.lfo;l.connect(lg).connect(f.frequency);l.start(t)}o.connect(f).connect(g).connect(MASTER);o.start(t);held.set(m,{o,g,l})};
 const noteOff=m=>{const v=held.get(m);if(!v)return;held.delete(m);const c=AC,t=c.currentTime;v.g.gain.cancelScheduledValues(t);v.g.gain.setValueAtTime(Math.max(.0001,v.g.gain.value),t);v.g.gain.linearRampToValueAtTime(.0001,t+P.r);v.o.stop(t+P.r+.05);if(v.l)v.l.stop(t+P.r+.05)};
 const sl=(id,label,min,max,step,val,fmt)=>`<label class="tempo">${label} <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"> <span>${fmt(val)}</span></label>`;
 host.innerHTML=`<h3>Play a synth</h3><p class="hint">Hold a key to play. Change one setting at a time and listen.</p>${pillsHTML('w',[['sine','Sine'],['triangle','Triangle'],['square','Square'],['sawtooth','Sawtooth']],P.wave)}
  <div class="mixgrid"><div class="mini"><h4>Filter</h4>${sl('scut','Cutoff',60,8000,10,P.cut,v=>v+' Hz')}${sl('sres','Resonance',0,20,.5,P.res,v=>v)}</div><div class="mini"><h4>Envelope</h4>${sl('sa','Attack',0,2,.01,P.a,v=>v+' s')}${sl('sd','Decay',0,2,.01,P.d,v=>v+' s')}${sl('ss','Sustain',0,1,.01,P.s,v=>Math.round(v*100)+'%')}${sl('sr','Release',0,3,.01,P.r,v=>v+' s')}</div><div class="mini"><h4>LFO → filter</h4>${sl('sl','Depth',0,1,.01,P.lfo,v=>Math.round(v*100)+'%')}${sl('slr','Rate',.2,12,.1,P.lfoR,v=>v+' Hz')}</div></div>
  <div class="row"><span class="eyebrow">Presets</span><button class="btn small" data-pre="pluck">Pluck</button><button class="btn small" data-pre="pad">Pad</button><button class="btn small" data-pre="bass">Bass</button><button class="btn small" data-pre="wobble">Wobble</button></div><div id="skb">${keyboard({start:48,end:72})}</div>`;
 bindPills(host,(g,v)=>{P.wave=v});const map={scut:'cut',sres:'res',sa:'a',sd:'d',ss:'s',sr:'r',sl:'lfo',slr:'lfoR'};
 const syncUI=()=>{Object.entries(map).forEach(([id,k])=>{const r=host.querySelector('#'+id);r.value=P[k];r.dispatchEvent(new Event('input'))});host.querySelectorAll('[data-group=w] .pill').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===P.wave))};
 Object.entries(map).forEach(([id,k])=>{const r=host.querySelector('#'+id);r.oninput=()=>{P[k]=+r.value;const s=r.nextElementSibling;s.textContent=id==='scut'?r.value+' Hz':id==='ss'||id==='sl'?Math.round(r.value*100)+'%':id==='slr'?r.value+' Hz':id==='sres'?r.value:r.value+' s'}});
 const PRE={pluck:{wave:'sawtooth',cut:2400,res:6,a:.005,d:.2,s:0,r:.2,lfo:0},pad:{wave:'sawtooth',cut:900,res:2,a:1.2,d:.5,s:.8,r:1.8,lfo:.15,lfoR:.5},bass:{wave:'square',cut:500,res:8,a:.005,d:.3,s:.5,r:.15,lfo:0},wobble:{wave:'sawtooth',cut:700,res:12,a:.01,d:.1,s:1,r:.2,lfo:.9,lfoR:3}};
 host.querySelectorAll('[data-pre]').forEach(b=>b.onclick=()=>{Object.assign(P,PRE[b.dataset.pre]);syncUI();noteOn(48);setTimeout(()=>noteOff(48),900)});
 const kb=host.querySelector('#skb');kb.addEventListener('pointerdown',e=>{const k=e.target.closest('[data-midi]');if(!k)return;e.preventDefault();const m=+k.dataset.midi;noteOn(m);k.classList.add('on');const up=()=>{noteOff(m);k.classList.remove('on');window.removeEventListener('pointerup',up)};window.addEventListener('pointerup',up)})};

function tidyIntro(root){(root||document).querySelectorAll('#main h1').forEach(h1=>{let p=h1.nextElementSibling;if(!p||p.tagName!=='P'||p.dataset.td||p.children.length)return;p.dataset.td='1';const t=p.textContent.replace(/\s+/g,' ').trim();const ss=t.match(/[^.!?]+[.!?]+["”’)]*(\s+|$)/g);if(!ss||ss.length<3||ss.join('').length<t.length-2)return;let keep=ss[0];if(keep.split(' ').length<20)keep+=ss[1];const rest=t.slice(keep.length).trim();if(!rest||rest.split(' ').length<8)return;p.textContent=keep.trim()+' ';const b=document.createElement('button');b.className='lnk more';b.textContent='More';b.onclick=()=>{p.textContent=t};p.appendChild(b)})}
{const mm=document.getElementById('main');if(mm&&window.MutationObserver){let q=false;new MutationObserver(()=>{if(q)return;q=true;queueMicrotask(()=>{q=false;tidyIntro()})}).observe(mm,{childList:true,subtree:true})}}


/* ---------- online jam (website version) ---------- */
const JO={me:{id:null,name:'',inst:''},host:false,hostId:null,code:null,link:null,peers:{},sess:null,inp:null,bus:null,status:'idle',err:'',el:null,off:0,offOk:false,offS:[],lastStep:-1e9,schedKey:'',timers:[],det:null,calQ:null,lastCal:0,pendingCode:null};
const JO_MAX=4;
const joLoc=()=>Object.assign({click:true,drums:true,bass:true,chords:false},store.get('joloc',{})||{});
const JO_ICE=()=>{const t=store.get('joturn',null);const l=[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'}];if(t&&t.urls)l.push({urls:t.urls,username:t.user||undefined,credential:t.pass||undefined});return l};
function joNow(){if(JO.native&&JO.natClock)return natNow();return performance.now()+(JO.host?0:JO.off)}
function joCtx(ms){const c=AC;const local=ms-(JO.host?0:JO.off);const ts=c.getOutputTimestamp?c.getOutputTimestamp():null;if(ts&&ts.performanceTime>0&&ts.contextTime>0)return ts.contextTime+(local-ts.performanceTime)/1000;return c.currentTime+(local-performance.now())/1000}
function joRt(){const c=AC;return((c&&c.baseLatency)||0)+((c&&c.outputLatency)||0)+(JO.inp&&JO.inp.inLat!=null?JO.inp.inLat:.01)+(+store.get('joadj',0)||0)/1000}
function joBus(){const c=audio();if(JO.bus&&JO.bus.ctx===c)return JO.bus.g;const g=c.createGain();const lim=c.createDynamicsCompressor();lim.threshold.value=-2;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.002;lim.release.value=.12;g.connect(lim);lim.connect(c.destination);JO.bus={ctx:c,g};return g}
function joGraph(){const c=audio();if(JO.inp&&JO.inp.ctx===c)return JO.inp;const g=c.createGain();g.gain.value=store.get('jogain',1);const amp=c.createGain();const dest=c.createMediaStreamDestination();const an=c.createAnalyser();an.fftSize=1024;const mon=c.createGain();mon.gain.value=store.get('jomon',false)?1:0;
 g.connect(amp);amp.connect(dest);amp.connect(an);amp.connect(mon);mon.connect(joBus());JO.inp={ctx:c,g,amp,dest,an,mon,src:null,stream:null,chain:[],inLat:null,label:''};joSetAmp(store.get('joamp','direct'));return JO.inp}
function joSetAmp(id){const I=JO.inp;if(!I)return;store.set('joamp',id);const c=I.ctx;try{I.g.disconnect()}catch(e){}I.chain.forEach(n=>{try{n.disconnect()}catch(e){}});I.chain=[];
 if(id==='direct'){I.g.connect(I.amp);return}let tail=I.g;const add=n=>{tail.connect(n);tail=n;I.chain.push(n);return n};
 const hp=add(c.createBiquadFilter());hp.type='highpass';hp.frequency.value=id==='clean'?90:140;
 if(id==='clean'){const pk=add(c.createBiquadFilter());pk.type='peaking';pk.frequency.value=1600;pk.gain.value=-4;pk.Q.value=.7;const lp=add(c.createBiquadFilter());lp.type='lowpass';lp.frequency.value=5600;const o=add(c.createGain());o.gain.value=1.4}
 else{const pre=add(c.createGain());pre.gain.value=id==='crunch'?6:16;const ws=add(c.createWaveShaper());ws.curve=shaperCurve(id==='crunch'?2.2:4.5);ws.oversample='4x';const mid=add(c.createBiquadFilter());mid.type='peaking';mid.frequency.value=id==='drive'?750:1100;mid.gain.value=id==='drive'?6:3;mid.Q.value=.8;
  const cab=add(c.createBiquadFilter());cab.type='lowpass';cab.frequency.value=id==='drive'?3600:4400;cab.Q.value=1;const cab2=add(c.createBiquadFilter());cab2.type='lowpass';cab2.frequency.value=7000;const o=add(c.createGain());o.gain.value=id==='crunch'?.35:.26}
 tail.connect(I.amp)}
async function joDevices(){try{return(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput')}catch(e){return[]}}
async function joConnectInput(devId){const I=joGraph();if(I.stream)I.stream.getTracks().forEach(t=>t.stop());
 const stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:devId?{exact:devId}:undefined,echoCancellation:false,noiseSuppression:false,autoGainControl:false,channelCount:{ideal:2},sampleRate:{ideal:48000},latency:{ideal:0}}});
 if(I.src)try{I.src.disconnect()}catch(e){}const src=I.ctx.createMediaStreamSource(stream);src.connect(I.g);I.src=src;I.stream=stream;const tr=stream.getAudioTracks()[0];const st=tr&&tr.getSettings?tr.getSettings():{};I.inLat=typeof st.latency==='number'?st.latency:.01;I.label=tr?tr.label:'';I.dev=st.deviceId||devId||'';store.set('jodev',I.dev);
 Object.values(JO.peers).forEach(P=>joSendCtl(P,{k:'info',rt:joRt(),name:JO.me.name,inst:JO.me.inst}))}

/* links: how players find each other. The host relays connection messages; audio goes player to player. */
function joLinkBC(isHost,code,onMsg){const hostId='tcjam-'+code.toLowerCase();const id=isHost?hostId:'p'+Math.random().toString(36).slice(2,10);const bc=new BroadcastChannel('tcjam-'+code.toLowerCase());bc.onmessage=e=>{const m=e.data;if(m&&m.to===id)onMsg(m.from,m.d)};return Promise.resolve({id,hostId,send:(to,d)=>bc.postMessage({to,from:id,d}),close:()=>bc.close()})}
function joLoadPeer(){if(window.Peer)return Promise.resolve();const one=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)});return one('https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js').catch(()=>one('https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js'))}
async function joLinkPeer(isHost,code,onMsg,onDrop){await joLoadPeer();return new Promise((res,rej)=>{const hostId='tcjam-'+code.toLowerCase();const conns={};let done=false;const ok=v=>{if(!done){done=true;res(v)}},bad=e=>{if(!done){done=true;rej(e)}};
 const srv=store.get('jopeer',null);const opt={config:{iceServers:JO_ICE()},...(srv&&srv.host?{host:srv.host,port:+srv.port||443,path:srv.path||'/',secure:srv.secure!==false}:{})};const peer=isHost?new window.Peer(hostId,opt):new window.Peer(opt);
 const wire=c=>{c.on('data',d=>onMsg(c.peer,d));c.on('close',()=>{delete conns[c.peer];onDrop(c.peer)});c.on('error',()=>{})};
 peer.on('error',e=>{const t=e&&e.type;bad(new Error(t==='unavailable-id'?'That room code is already in use. Start a new room.':t==='peer-unavailable'?'No room with that code. Check it with the host.':t==='network'||t==='server-error'||t==='socket-error'?'Could not reach the connection server. Check your internet.':'Could not connect ('+(t||'unknown')+').'));if(done&&t==='peer-unavailable')JO.err='Lost the room.'});
 peer.on('disconnected',()=>{try{peer.reconnect()}catch(e){}});
 peer.on('open',id=>{const api={id,hostId,send:(to,d)=>{const c=conns[to];if(c&&c.open)c.send(d)},close:()=>{try{peer.destroy()}catch(e){}}};
  if(isHost){peer.on('connection',c=>{conns[c.peer]=c;wire(c)});ok(api)}
  else{const c=peer.connect(hostId,{reliable:true});conns[hostId]=c;wire(c);c.on('open',()=>ok(api));setTimeout(()=>bad(new Error('Could not reach that room. Check the code, or the host may have left.')),15000)}})})}

const joCode=()=>Array.from({length:5},()=>'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*31)]).join('');
async function joOpen(isHost,code){const c=audio();if(!c)throw new Error('This browser has no Web Audio.');if(!window.RTCPeerConnection)throw new Error('This browser can’t make live connections. Try Chrome, Edge or Firefox.');joGraph();
 try{loadSamples('bass');loadSamples('piano')}catch(e){}JO.me.name=(store.get('joname','')||'').trim()||'Player';JO.me.inst=INST_RAW();JO.host=isHost;JO.code=code;JO.peers={};JO.off=0;JO.offOk=isHost;JO.offS=[];JO.err='';JO.status='connecting';joRender();
 const onMsg=(from,d)=>joMsg(from,d),onDrop=id=>joDrop(id);
 const link=store.get('jolink','peer')==='bc'?await joLinkBC(isHost,code,onMsg):await joLinkPeer(isHost,code,onMsg,onDrop);
 JO.link=link;JO.me.id=link.id;JO.hostId=link.hostId;JO.status='in';
 if(isHost){JO.sess=JO.sess&&JO.sess.v?{...JO.sess,playing:false}:{v:1,mode:'sync',bars:'cycle',bpm:96,beats:4,style:'rock',key:'A',playing:false,t0:0};JO.roster=[{id:JO.me.id,name:JO.me.name,inst:JO.me.inst}]}
 else link.send(JO.hostId,{k:'hello',name:JO.me.name,inst:JO.me.inst});
 joStartTimers();joRender()}
function joMsg(from,d){if(!d||typeof d!=='object')return;
 if(JO.host){if(d.k==='hello'){if(JO.roster.length>=JO_MAX&&!JO.roster.find(r=>r.id===from)){JO.link.send(from,{k:'full'});return}JO.roster=JO.roster.filter(r=>r.id!==from).concat([{id:from,name:String(d.name||'Player').slice(0,24),inst:String(d.inst||'')}]);joRoster()}
  else if(d.k==='sig'){if(d.to===JO.me.id)joOnSig(from,d.data);else if(JO.roster.find(r=>r.id===d.to))JO.link.send(d.to,{k:'sig',from,data:d.data})}
  else if(d.k==='bye')joDrop(from)}
 else{if(d.k==='roster'){JO.roster=d.list;if(d.sess)joSetSess(d.sess);joMesh()}else if(d.k==='sig')joOnSig(d.from,d.data);else if(d.k==='full'){JO.err='That room is full (4 players).';joLeave(true)}else if(d.k==='end'){JO.err='The host closed the room.';joLeave(true)}}}
function joRoster(){JO.roster.forEach(r=>{if(r.id!==JO.me.id)JO.link.send(r.id,{k:'roster',list:JO.roster,sess:JO.sess})});joMesh()}
function joDrop(id){const P=JO.peers[id];if(P)joClosePeer(P);delete JO.peers[id];if(JO.host){JO.roster=(JO.roster||[]).filter(r=>r.id!==id);joRoster()}else if(id===JO.hostId&&JO.status==='in'){JO.err='Lost the connection to the host.';joLeave(true)}joRender()}
function joMesh(){const ids=new Set((JO.roster||[]).map(r=>r.id));(JO.roster||[]).forEach(r=>{if(r.id===JO.me.id)return;let P=JO.peers[r.id];if(!P){P=joPC(r.id);if(JO.me.id<r.id)joOffer(r.id).catch(()=>{})}P.name=r.name;P.inst=r.inst});Object.keys(JO.peers).forEach(id=>{if(!ids.has(id)){joClosePeer(JO.peers[id]);delete JO.peers[id]}});joRender()}
function joSig(to,data){if(!JO.link)return;if(JO.host)JO.link.send(to,{k:'sig',from:JO.me.id,data});else JO.link.send(JO.hostId,{k:'sig',to,data})}
function joMunge(sdp){const m=sdp.match(/a=rtpmap:(\d+) opus\/48000/i);if(!m)return sdp;const pt=m[1];const want='stereo=1;sprop-stereo=1;maxaveragebitrate=128000;useinbandfec=1;usedtx=0';const re=new RegExp('a=fmtp:'+pt+' ([^\\r\\n]*)');
 return re.test(sdp)?sdp.replace(re,(x,p)=>'a=fmtp:'+pt+' '+p.split(';').filter(kv=>!/^(stereo|sprop-stereo|maxaveragebitrate|useinbandfec|usedtx)=/.test(kv.trim())).concat(want.split(';')).join(';')):sdp.replace('a=rtpmap:'+pt+' opus/48000/2','a=rtpmap:'+pt+' opus/48000/2\r\na=fmtp:'+pt+' '+want)}
function joPC(rid){let P=JO.peers[rid];if(P&&P.pc)return P;P=JO.peers[rid]=Object.assign(P||{},{id:rid,state:'connecting',pend:[],vol:1,mute:false,L:null,rt:.02,D:0,jb:null,rtt:null,loss:0});
 const pc=new RTCPeerConnection({iceServers:JO_ICE(),bundlePolicy:'max-bundle'});P.pc=pc;const I=joGraph();const tr=I.dest.stream.getAudioTracks()[0];P.sender=pc.addTrack(tr,I.dest.stream);
 try{const p=P.sender.getParameters();p.encodings=(p.encodings&&p.encodings.length?p.encodings:[{}]).map(e=>({...e,maxBitrate:128000,priority:'high',networkPriority:'high'}));P.sender.setParameters(p).catch(()=>{})}catch(e){}
 P.ctl=pc.createDataChannel('ctl',{negotiated:true,id:0});P.clk=pc.createDataChannel('clk',{negotiated:true,id:1,ordered:false,maxRetransmits:0});
 P.ctl.onmessage=e=>{try{joCtl(P,JSON.parse(e.data))}catch(x){}};P.clk.onmessage=e=>{try{joClk(P,JSON.parse(e.data))}catch(x){}};
 P.ctl.onopen=()=>{joSendCtl(P,{k:'info',rt:joRt(),name:JO.me.name,inst:JO.me.inst});if(JO.host)joSendCtl(P,{k:'sess',s:JO.sess});joSendCtl(P,{k:'calreq'});joRender()};
 pc.onicecandidate=e=>{if(e.candidate)joSig(rid,{ice:e.candidate.toJSON()})};
 pc.ontrack=e=>joAttach(P,(e.streams&&e.streams[0])||new MediaStream([e.track]),e.receiver);
 pc.onconnectionstatechange=()=>{P.state=pc.connectionState;if(P.state==='failed')P.err='Couldn’t connect directly. Add a TURN server under Advanced, or try another network.';joRender()};return P}
async function joOffer(rid){const P=joPC(rid);const o=await P.pc.createOffer();o.sdp=joMunge(o.sdp);await P.pc.setLocalDescription(o);joSig(rid,{sdp:{type:o.type,sdp:P.pc.localDescription.sdp}})}
async function joOnSig(from,d){if(!d)return;if(!JO.peers[from]&&!(JO.roster||[]).find(r=>r.id===from))return;const P=joPC(from),pc=P.pc;
 try{if(d.sdp){await pc.setRemoteDescription(d.sdp);for(const c of P.pend.splice(0))try{await pc.addIceCandidate(c)}catch(e){}
  if(d.sdp.type==='offer'){const a=await pc.createAnswer();a.sdp=joMunge(a.sdp);await pc.setLocalDescription(a);joSig(from,{sdp:{type:a.type,sdp:pc.localDescription.sdp}})}}
 else if(d.ice){if(pc.remoteDescription)await pc.addIceCandidate(d.ice);else P.pend.push(d.ice)}}catch(e){P.err='Connection setup failed.';joRender()}}
function joClosePeer(P){try{P.pc&&P.pc.close()}catch(e){}if(P.node){try{P.node.src.disconnect();P.node.g.disconnect()}catch(e){}if(P.node.a)P.node.a.srcObject=null}P.state='closed'}
const joSendCtl=(P,o)=>{if(P.ctl&&P.ctl.readyState==='open')try{P.ctl.send(JSON.stringify(o))}catch(e){}};
function joBroadcast(o){if(JO.native&&JO.link){if(o.k==='sess'&&JO.host)(JO.roster||[]).forEach(r=>{if(r.id!==JO.me.id)JO.link.send(r.id,{k:'sess',s:o.s})});return}Object.values(JO.peers).forEach(P=>joSendCtl(P,o))}

/* clock: every player locks to the host's clock (NTP style, best of the fastest round trips) */
function joClk(P,m){if(m.k==='ping'){if(P.clk.readyState==='open')P.clk.send(JSON.stringify({k:'pong',a:m.a,b:performance.now()}));return}
 if(m.k==='pong'&&P.id===JO.hostId){const c=performance.now(),rtt=c-m.a;if(rtt<0||rtt>2000)return;JO.offS.push({rtt,off:m.b+rtt/2-c});if(JO.offS.length>40)JO.offS.shift();const best=JO.offS.slice().sort((x,y)=>x.rtt-y.rtt).slice(0,Math.max(3,Math.ceil(JO.offS.length/4)));const off=best.reduce((a,x)=>a+x.off,0)/best.length;
  JO.off=JO.offOk?JO.off+(off-JO.off)*.3:off;JO.clkRtt=best[0].rtt;if(JO.offS.length>=5&&!JO.offOk){JO.offOk=true;joRender()}}}
function joCtl(P,m){if(m.k==='info'){if(typeof m.rt==='number')P.rt=Math.max(0,Math.min(.3,m.rt));if(m.name)P.name=String(m.name).slice(0,24);if(m.inst)P.inst=String(m.inst);joUpdateDelay(P);joRender()}
 else if(m.k==='sess'&&!JO.host&&P.id===JO.hostId){joSetSess(m.s)}
 else if(m.k==='calreq'){joQueueCal()}
 else if(m.k==='cal'){joCalArm(P,m)}
 else if(m.k==='setreq'&&JO.host){/* guests may not change the session */}}
function joSetSess(s){if(!s||typeof s!=='object')return;const prev=JO.sess;JO.sess={...s};JO.sess.bpm=Math.max(40,Math.min(240,+JO.sess.bpm||96));if(!prev||prev.mode!==JO.sess.mode)Object.values(JO.peers).forEach(joApplyJB);Object.values(JO.peers).forEach(P=>joUpdateDelay(P));joRender()}
function joChange(patch){if(!JO.host)return;const s=JO.sess;const n={...s,...patch};if(s.playing&&('bpm'in patch)&&patch.bpm!==s.bpm){const barMs=s.beats*60000/s.bpm;const now=joNow();const nb=Math.ceil((now-s.t0)/barMs)+1;n.t0=s.t0+nb*barMs-(nb)*(n.beats*60000/n.bpm)}
 if(patch.playing===true)n.t0=joNow()+1200+n.beats*60000/n.bpm;joSetSess(n);joBroadcast({k:'sess',s:JO.sess})}

/* latency: a short marker tone from each player, timed on the shared clock, tells every listener the exact delay */
function joQueueCal(){if(JO.calQ)return;JO.calQ=setTimeout(()=>{JO.calQ=null;joSendCal()},400)}
function joSendCal(){if(!AC||!JO.inp)return;const T0=joNow()+900;const Ts=[T0,T0+500,T0+1000];joBroadcast({k:'cal',Ts,rt:joRt()});JO.lastCal=Date.now();
 const c=AC,I=JO.inp;Ts.forEach(T=>{const t=joCtx(T);const o=c.createOscillator(),g=c.createGain();o.frequency.value=2000;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.7,t+.0015);g.gain.setValueAtTime(.7,t+.03);g.gain.linearRampToValueAtTime(0,t+.036);o.connect(g);g.connect(I.dest);o.start(t);o.stop(t+.05)})}
const JO_DET=`class D extends AudioWorkletProcessor{constructor(){super();this.arm=0;this.after=0;this.thr=.2;this.port.onmessage=e=>{this.arm=e.data.arm?1:0;this.after=e.data.after||0;this.thr=e.data.thr||.2}}process(i){const x=i[0]&&i[0][0];if(x&&this.arm&&currentTime+x.length/sampleRate>=this.after){for(let n=0;n<x.length;n++){const t=currentTime+n/sampleRate;if(t>=this.after&&Math.abs(x[n])>this.thr){this.arm=0;this.port.postMessage({t});break}}}return true}}registerProcessor('tc-onset',D)`;
async function joDetFor(P){const c=AC;if(!c.audioWorklet)return null;if(JO.det!==c){try{await c.audioWorklet.addModule(URL.createObjectURL(new Blob([JO_DET],{type:'application/javascript'})))}catch(e){await c.audioWorklet.addModule('data:application/javascript;charset=utf-8,'+encodeURIComponent(JO_DET))}JO.det=c}
 if(P.node.det)return P.node.det;const n=new AudioWorkletNode(c,'tc-onset',{numberOfOutputs:1});const z=c.createGain();z.gain.value=0;P.node.src.connect(n);n.connect(z);z.connect(c.destination);P.node.det=n;n.port.onmessage=e=>joCalHit(P,e.data.t);return n}
async function joCalArm(P,m){if(!P.node||!Array.isArray(m.Ts))return;if(typeof m.rt==='number')P.rt=Math.max(0,Math.min(.3,m.rt));const det=await joDetFor(P).catch(()=>null);if(!det)return;
 P.cal={Ts:m.Ts.slice(0,5),i:0,hits:[]};const g=P.node.g.gain,t0=joCtx(m.Ts[0])-.05;g.cancelScheduledValues(AC.currentTime);g.setValueAtTime(g.value,AC.currentTime);g.setValueAtTime(0,Math.max(AC.currentTime,t0));joArmNext(P);clearTimeout(P.calT);P.calT=setTimeout(()=>joCalDone(P),(m.Ts[m.Ts.length-1]-joNow())+1200)}
function joArmNext(P){const k=P.cal;if(!k||k.i>=k.Ts.length)return;P.node.det.port.postMessage({arm:true,after:joCtx(k.Ts[k.i])-.004,thr:.18})}
function joCalHit(P,t){const k=P.cal;if(!k)return;const L=t-joCtx(k.Ts[k.i]);if(L>0&&L<3)k.hits.push(L);k.i++;if(k.i<k.Ts.length)joArmNext(P);else joCalDone(P)}
function joCalDone(P){clearTimeout(P.calT);const k=P.cal;P.cal=null;if(!P.node)return;const g=P.node.g.gain;const t=AC.currentTime+.25;g.setValueAtTime(0,AC.currentTime);g.linearRampToValueAtTime(P.mute?0:P.vol,t);
 if(k&&!k.hits.length&&(P.calTries=(P.calTries||0)+1)<3){joSendCtl(P,{k:'calreq'})}if(k&&k.hits.length){const h=k.hits.slice().sort((a,b)=>a-b);P.L=h[Math.floor(h.length/2)];P.jb0=P.jb;P.rtt0=P.rtt;P.calAt=Date.now();joUpdateDelay(P,true)}else if(P.L==null)P.err='Couldn’t measure the delay yet. Press Re-measure when it’s quiet.';joRender()}
function joLnow(P){if(P.L==null)return null;let L=P.L+(P.rt||0);if(P.jb!=null&&P.jb0!=null)L+=P.jb-P.jb0;if(P.rtt!=null&&P.rtt0!=null)L+=(P.rtt-P.rtt0)/2;return Math.max(0,L)}
function joSyncBars(s){if(s.bars!=='cycle')return Math.max(1,+s.bars||1);const st=joStyle(s);return st.prog?st.prog.length:4}
function joUpdateDelay(P,force){if(!P.node||!AC)return;const s=JO.sess;let D=0;const L=joLnow(P);
 if(s&&s.mode==='sync'&&L!=null){const barS=s.beats*60/s.bpm;let K=joSyncBars(s);while(K>1&&K*barS>40)K=Math.ceil(K/2);let span=K*barS;while(span<L+.02)span+=K*barS;D=Math.min(59,span-L);P.K=Math.round(span/barS)}
 P.D=D;const p=P.node.d.delayTime,now=AC.currentTime;if(force||Math.abs(p.value-D)>(s&&s.mode==='sync'?.003:.5)){p.cancelScheduledValues(now);p.setValueAtTime(p.value,now);p.linearRampToValueAtTime(D,now+(force||Math.abs(p.value-D)>.25?.02:.15))}}
function joApplyJB(P){const r=P.node&&P.node.rec;if(!r)return;try{r.jitterBufferTarget=JO.sess&&JO.sess.mode==='sync'?120:0}catch(e){}try{r.playoutDelayHint=JO.sess&&JO.sess.mode==='sync'?.12:0}catch(e){}}
function joAttach(P,stream,rec){const c=audio();if(P.node){try{P.node.src.disconnect();P.node.g.disconnect()}catch(e){}}
 const a=new Audio();a.muted=true;a.srcObject=stream;a.play().catch(()=>{});const src=c.createMediaStreamSource(stream);const d=c.createDelay(60);const g=c.createGain();g.gain.value=P.mute?0:P.vol;const pan=c.createStereoPanner?c.createStereoPanner():c.createGain();
 src.connect(d);d.connect(g);g.connect(pan);pan.connect(joBus());P.node={a,src,d,g,pan,rec,det:null};joApplyJB(P);joUpdateDelay(P,true);joRender()}
async function joStats(P){if(!P.pc||P.pc.connectionState!=='connected')return;let r;try{r=await P.pc.getStats()}catch(e){return}let inb=null,pair=null;r.forEach(x=>{if(x.type==='inbound-rtp'&&(x.kind==='audio'||x.mediaType==='audio'))inb=x;if(x.type==='candidate-pair'&&x.nominated&&x.state==='succeeded')pair=x});
 if(inb){const pv=P._inb;if(pv&&inb.jitterBufferEmittedCount>pv.jitterBufferEmittedCount){const jb=(inb.jitterBufferDelay-pv.jitterBufferDelay)/(inb.jitterBufferEmittedCount-pv.jitterBufferEmittedCount);P.jb=P.jb==null?jb:P.jb+(jb-P.jb)*.35}
  if(pv){const lost=(inb.packetsLost||0)-(pv.packetsLost||0),got=(inb.packetsReceived||0)-(pv.packetsReceived||0);P.loss=got+lost>0?Math.max(0,lost)/(got+lost):0}P._inb={jitterBufferDelay:inb.jitterBufferDelay||0,jitterBufferEmittedCount:inb.jitterBufferEmittedCount||0,packetsLost:inb.packetsLost||0,packetsReceived:inb.packetsReceived||0}}
 if(pair&&typeof pair.currentRoundTripTime==='number')P.rtt=P.rtt==null?pair.currentRoundTripTime:P.rtt+(pair.currentRoundTripTime-P.rtt)*.35;
 if(P.jb0==null&&P.jb!=null&&P.L!=null)P.jb0=P.jb;if(P.rtt0==null&&P.rtt!=null&&P.L!=null)P.rtt0=P.rtt;joUpdateDelay(P)}
function joStartTimers(){joStopTimers();JO.timers.push(setInterval(()=>{const H=JO.peers[JO.hostId];if(!JO.host&&H&&H.clk&&H.clk.readyState==='open')H.clk.send(JSON.stringify({k:'ping',a:performance.now()}))},400));
 JO.timers.push(setInterval(()=>{Object.values(JO.peers).forEach(joStats);joPaint()},1000));JO.timers.push(setInterval(joTick,25))}
function joStopTimers(){JO.timers.forEach(clearInterval);JO.timers=[]}

/* the shared band: every player renders the same click and backing locally, timed on the shared clock */
function joStyle(s){const j=JAMS.find(x=>x.id===s.style);if(!j)return{g:null,prog:null,mode:'major'};return{g:GROOVES.find(g=>g.id===j.groove)||null,prog:j.prog,mode:j.mode,scale:j.scale,name:j.name}}
function joChordAt(s,bar){const st=joStyle(s);if(!st.prog)return null;const[d,t]=st.prog[((bar%st.prog.length)+st.prog.length)%st.prog.length];try{return chordAt(normKey(s.key,st.mode),st.mode,d,t)}catch(e){return null}}
function joTick(){const s=JO.sess;if(!s||!s.playing||!AC||(!JO.host&&!JO.offOk))return;const st=joStyle(s);const steps=st.g?st.g.steps:s.beats;const barMs=s.beats*60000/s.bpm,stepMs=barMs/steps;const now=joNow(),ahead=now+220;const key=[s.t0,s.bpm,s.style,s.key].join('|');
 if(JO.schedKey!==key){JO.schedKey=key;JO.lastStep=Math.max(-steps-1,Math.ceil((now-s.t0)/stepMs)-1)}const L=joLoc();
 for(let i=JO.lastStep+1;s.t0+i*stepMs<ahead;i++){JO.lastStep=i;const tms=s.t0+i*stepMs;if(tms<now-30)continue;const t=joCtx(tms);const k=((i%steps)+steps)%steps,bar=Math.floor(i/steps),per=steps/s.beats;
  if(i<0){if(k%per===0)metClick('click',t,k===0?2:1);continue}
  if(L.click&&k%per===0)metClick('click',t,k===0?2:1);
  if(L.drums&&st.g)for(const[r,p]of Object.entries(st.g.rows)){const ch=p[k];if(ch==='x')drum(r,t,1);else if(ch==='o')drum(r,t,.35)}
  const ch=joChordAt(s,bar);if(!ch)continue;const barS=barMs/1000;
  if(L.bass&&(k===0||k===steps/2)){const pc=parse(ch.root).pc;tone(28+((pc-4+12)%12),t,barS/2*.9,.85,'bass')}
  if(L.chords&&k===0)voice(ch.root,ch.t).slice(1).forEach(m=>tone(m,t,barS*.95,.32,'piano'))}}

function joLeave(quiet){if(JO.link){if(JO.host)Object.keys(JO.peers).forEach(id=>JO.link.send(id,{k:'end'}));else JO.link.send(JO.hostId,{k:'bye'});const l=JO.link;setTimeout(()=>l.close(),300)}
 Object.values(JO.peers).forEach(joClosePeer);JO.peers={};JO.link=null;JO.roster=[];JO.status='idle';joStopTimers();if(JO.sess)JO.sess.playing=false;if(!quiet)JO.err='';joRender()}
window.addEventListener('beforeunload',()=>{if(JO.link)joLeave(true)});

/* page */
const JO_HELP=`<details class="more"><summary>Using your own amp plugins</summary><div class="stack" style="gap:8px">
 <p>The browser can’t load plugins itself, so run them where you normally do and send the result here.</p>
 <div class="cols"><div class="mini"><h4>Mac</h4><p class="o">Install the free <b>BlackHole 2ch</b> driver. In your plugin host (Logic, Ableton, a Neural DSP standalone, AU Lab) set the output to BlackHole. Here, pick <b>BlackHole 2ch</b> as your input.</p></div>
 <div class="mini"><h4>Windows</h4><p class="o">Install the free <b>VB-Audio Virtual Cable</b>. In your DAW or plugin host (Cantabile Lite, Element, a standalone amp sim) set the output to <b>CABLE Input</b>. Here, pick <b>CABLE Output</b>.</p></div>
 <div class="mini"><h4>Hear yourself</h4><p class="o">Keep monitoring in your DAW or interface, which is the fastest path. Leave “Hear myself here” off so you don’t hear yourself twice.</p></div></div>
 <p class="hint">No plugins? Plug your guitar into your interface and use the built-in amp below.</p></div></details>`;
function joMeter(){const I=JO.inp;if(!I||!I.an)return 0;const b=new Float32Array(I.an.fftSize);I.an.getFloatTimeDomainData(b);let p=0;for(const x of b)p=Math.max(p,Math.abs(x));return p}
function joLatTxt(P){const L=joLnow(P);if(L==null)return P.state==='connected'?'Measuring…':'';const ms=Math.round(L*1000);if(JO.sess&&JO.sess.mode==='sync')return`Locked ${P.K||joSyncBars(JO.sess)} bar${(P.K||1)>1?'s':''} behind · ${ms} ms delay`;return`${ms} ms behind you`}
function joQual(P){const L=joLnow(P);if(L==null)return'';if(JO.sess&&JO.sess.mode==='sync')return P.loss>.03?'warn':'good';return L<.03?'good':L<.05?'ok':'warn'}
function joPaint(){if(!JO.el||!document.body.contains(JO.el))return;Object.values(JO.peers).forEach(P=>{const r=JO.el.querySelector(`[data-pl="${CSS.escape(P.id)}"]`);if(!r)return;const l=r.querySelector('.jlat');if(l)l.textContent=joLatTxt(P);const q=r.querySelector('.jq');if(q)q.className='jq '+joQual(P);const st=r.querySelector('.jst');if(st)st.textContent=P.state==='connected'?(P.loss>.02?Math.round(P.loss*100)+'% dropouts':''):P.state==='failed'?'Not connected':'Connecting…'})}
let JO_RAF=0;function joAnim(){cancelAnimationFrame(JO_RAF);const step=()=>{if(!JO.el||!document.body.contains(JO.el))return;const m=JO.el.querySelector('#jomtr');if(m&&!JO.native)m.style.width=Math.min(100,joMeter()*140)+'%';const b=JO.el.querySelector('#jobeat'),s=JO.sess;
 if(b&&s){if(s.playing&&(JO.host||JO.offOk)){const barMs=s.beats*60000/s.bpm,x=(joNow()-s.t0)/barMs;if(x<-1){b.innerHTML=`<b>Get ready</b><span></span>`}else if(x<0){b.innerHTML=`<b>Count-in</b><span>${Math.min(s.beats,Math.floor((x+1)*s.beats)+1)}</span>`}else{const bar=Math.floor(x),beat=Math.floor((x-bar)*s.beats)+1;const ch=joChordAt(s,bar);b.innerHTML=`<b>${ch?pr(ch.sym):'Bar '+(bar+1)}</b><span>${[...Array(s.beats)].map((_,i)=>`<i class="${i+1===beat?'on':''}"></i>`).join('')}</span>`}}else b.innerHTML=`<b>${s.playing?'Syncing clocks…':'Stopped'}</b><span></span>`}
 JO_RAF=requestAnimationFrame(step)};JO_RAF=requestAnimationFrame(step)}
function joRender(){const el=JO.el;if(!el||!document.body.contains(el))return;const host=JO.host,s=JO.sess,inRoom=JO.status==='in';const I=JO.inp;const L=joLoc();const NV=inRoom?JO.native:joNative();
 const inputPanel=NV?natPanel():`<section class="panel"><h3>Your sound</h3><div class="row" style="gap:10px;align-items:flex-end"><label class="popt">Input <select id="jodev"><option value="">Default input</option></select></label><button class="btn ${I&&I.stream?'':'primary'}" id="joconn">${I&&I.stream?'Change input':'Connect input'}</button><span class="jmeter"><i id="jomtr"></i></span></div>
  ${I&&I.stream?`<p class="hint">Using ${esc(I.label||'your input')}.</p>`:''}
  <div class="pickrow"><span class="eyebrow">Sound</span>${pillsHTML('amp',[['direct','Direct (my plugins)'],['clean','Clean amp'],['crunch','Crunch'],['drive','Drive']],store.get('joamp','direct'))}</div>
  <div class="row" style="gap:16px"><label class="popt">Level <input type="range" id="jogain" min="0" max="4" step=".05" value="${store.get('jogain',1)}"></label><label class="popt"><input type="checkbox" id="jomon" ${store.get('jomon',false)?'checked':''}> Hear myself here</label></div>${JO_HELP}</section>`;
 const joinPanel=`<section class="panel"><h3>Play together</h3><label class="popt">Your name <input id="joname" maxlength="24" value="${esc(store.get('joname',''))}" placeholder="Name"></label>
  ${TAU&&!DROID?`<div class="pickrow"><span class="eyebrow">Engine</span>${pillsHTML('eng',[['native','Desktop audio (ASIO, CoreAudio)'],['web','Browser']],store.get('joeng','native'))}</div>`:''}
  <div class="row" style="gap:10px"><button class="btn primary" id="johost">Start a room</button><span class="hint">or</span><input id="jocode" class="jcode" maxlength="5" placeholder="CODE" value="${esc(JO.pendingCode||'')}" aria-label="Room code"><button class="btn" id="jojoin">Join</button></div>
  ${JO.status==='connecting'?'<p class="hint">Connecting…</p>':''}${JO.err?`<p class="callout">${esc(JO.err)}</p>`:''}
  <details class="more"><summary>Advanced</summary><div class="stack" style="gap:8px"><p class="hint">Some school, work and mobile networks block direct connections. A TURN server relays the audio when that happens.</p>
  <div class="row" style="gap:8px"><input id="joturl" placeholder="turn:host:3478" value="${esc((store.get('joturn',{})||{}).urls||'')}"><input id="jotuser" placeholder="Username" value="${esc((store.get('joturn',{})||{}).user||'')}"><input id="jotpass" placeholder="Password" type="password" value="${esc((store.get('joturn',{})||{}).pass||'')}"><button class="btn small" id="jotsave">Save</button></div>
  <label class="popt">Own connection server <input id="josrv" placeholder="peer.example.com:443/myapp" value="${esc((()=>{const v=store.get('jopeer',null);return v&&v.host?v.host+':'+(v.port||443)+(v.path||'/'):''})())}"></label><p class="hint">Leave empty to use the free public PeerJS server. Everyone in a room must use the same one.</p>
  ${TAU?`<label class="popt">Desktop UDP port <input type="number" id="joport" min="0" max="65535" value="${+store.get('joport',0)||0}" style="width:90px"></label><p class="hint">0 picks any free port. Set a fixed one if you forward it on your router so others can always reach you.</p>`:''}
  <label class="popt">Extra delay of my setup <input type="number" id="joadj" min="-50" max="200" value="${+store.get('joadj',0)||0}" style="width:70px"> ms</label><p class="hint">Raise this if others hear you late in loop sync. Most setups leave it at 0.</p></div></details></section>`;
 const players=()=>{const me=`<div class="jpl me"><span class="jq good"></span><span class="jn"><b>${esc(JO.me.name)} (you)</b><span class="hint">${esc(INST_NAME[JO.me.inst]||'')}${host?' · host':''}</span></span><span class="jlat">${NV?(JO.natAudio?'Sending':'Audio off'):I&&I.stream?'Sending':'Listening only'}</span></div>`;
  return me+Object.values(JO.peers).map(P=>`<div class="jpl" data-pl="${esc(P.id)}"><span class="jq ${joQual(P)}"></span><span class="jn"><b>${esc(P.name||'Player')}</b><span class="hint">${esc(INST_NAME[P.inst]||'')}${P.id===JO.hostId?' · host':''} <span class="jst"></span></span></span><span class="jlat">${joLatTxt(P)}</span><input type="range" class="jvol" data-v="${esc(P.id)}" min="0" max="1.5" step=".05" value="${P.vol}" aria-label="Volume"><button class="pill" data-m="${esc(P.id)}" aria-pressed="${!!P.mute}">Mute</button>${P.err?`<span class="hint jerr">${esc(P.err)}</span>`:''}</div>`).join('')};
 const sessPanel=s?`<section class="panel"><div class="row" style="justify-content:space-between"><h3>Session</h3><div class="jbeat" id="jobeat"></div></div>
  ${host?`<div class="pickrow"><span class="eyebrow">Mode</span>${pillsHTML('mode',[['sync','Loop sync (any distance)'],['live','Live (same city)']],s.mode)}</div>
   ${s.mode==='sync'?`<div class="pickrow"><span class="eyebrow">Hear each other</span>${pillsHTML('bars',[['cycle','One chord cycle later'],['1','1 bar later'],['2','2 bars'],['4','4 bars']],String(s.bars))}</div>`:''}
   <div class="pickrow"><span class="eyebrow">Backing</span>${pillsHTML('style',[['click','Click only'],...JAMS.map(j=>[j.id,j.name])],s.style)}</div>
   ${s.style!=='click'?`<div class="pickrow"><span class="eyebrow">Key</span>${pillsHTML('key',keyItems(joStyle(s).mode),normKey(s.key,joStyle(s).mode))}</div>`:''}
   <div class="row" style="gap:12px"><button class="btn primary" id="joplay">${s.playing?'Stop':ICON.play+' Start'}</button><label class="tempo">Tempo <input type="range" id="jobpm" min="50" max="200" value="${s.bpm}"> <span id="jobpmv">${s.bpm}</span> BPM</label></div>`
  :`<p class="hint">${s.mode==='sync'?`Loop sync: you hear the others ${s.bars==='cycle'?'one chord cycle':s.bars+' bar'+(s.bars>1?'s':'')} later, locked to the beat.`:'Live: you hear each other as it happens.'} ${JO.offOk?'':'Syncing clocks…'} The host picks the tempo and backing.</p>`}
  <div class="pickrow"><span class="eyebrow">In my ears</span><div class="pills">${[['click','Click'],['drums','Drums'],['bass','Bass'],['chords','Chords']].filter(x=>!(NV&&x[0]==='chords')).map(([k,t])=>`<button class="pill" data-loc="${k}" aria-pressed="${!!L[k]}">${t}</button>`).join('')}</div></div>
  <p class="hint">${s.mode==='sync'?'Everyone plays to the same click. Each player reaches you a whole number of bars late, so it lands in time no matter how far away they are.':'Best under about 30 ms. If it feels late, switch to loop sync.'}</p></section>`:'';
 el.innerHTML=`<p>${TAU?'Play with up to seven friends using your audio interface.':'Play with up to three friends.'} Everyone hears the same click and backing in sync, and your sound goes straight to the others.</p>
  ${inRoom?`<section class="panel jroom"><div class="row" style="justify-content:space-between;align-items:center"><div><span class="eyebrow">Room</span><div class="jcodebig">${esc(JO.code)}</div></div><div class="row" style="gap:8px"><button class="btn small" id="jocopy">Copy invite link</button>${NV?'':'<button class="btn small" id="jorecal">Re-measure delay</button>'}<button class="btn small" id="joleave">Leave</button></div></div>
   <div class="jplayers">${players()}</div>${Object.keys(JO.peers).length?'':'<p class="hint">Waiting for players. Send them the code or the invite link.</p>'}</section>${sessPanel}${inputPanel}`:JO.pendingCode?`${joinPanel}${inputPanel}`:`${inputPanel}${joinPanel}`}`;
 joBind();if(NV)natBind();joAnim()}
function joBind(){const el=JO.el,$=q=>el.querySelector(q);
 const dev=$('#jodev');if(dev){joDevices().then(ds=>{const cur=(JO.inp&&JO.inp.dev)||store.get('jodev','');ds.forEach((d,i)=>{if(!d.deviceId||d.deviceId==='default')return;const o=document.createElement('option');o.value=d.deviceId;o.textContent=d.label||'Input '+(i+1);dev.appendChild(o)});dev.value=[...dev.options].some(o=>o.value===cur)?cur:''})}
 const cn=$('#joconn');if(cn)cn.onclick=async()=>{cn.disabled=true;try{await joConnectInput(dev?dev.value:'');JO.err=''}catch(e){JO.err=e&&e.name==='NotAllowedError'?'The browser blocked the input. Allow microphone access for this site and try again.':'Couldn’t open that input.'}joRender()};
 bindPills(el,(g,v)=>{if(g==='eng'){store.set('joeng',v);joRender();return}if(g==='amp'){joGraph();joSetAmp(v);joRender()}else if(g==='mode')joChange({mode:v});else if(g==='bars')joChange({bars:v==='cycle'?'cycle':+v});else if(g==='style')joChange({style:v});else if(g==='key')joChange({key:v})});
 const ga=$('#jogain');if(ga)ga.oninput=e=>{store.set('jogain',+e.target.value);joGraph().g.gain.value=+e.target.value};
 const mo=$('#jomon');if(mo)mo.onchange=e=>{store.set('jomon',e.target.checked);joGraph().mon.gain.value=e.target.checked?1:0};
 const nm=$('#joname');if(nm)nm.onchange=e=>store.set('joname',e.target.value.trim().slice(0,24));
 const cd=$('#jocode');if(cd)cd.oninput=e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'')};
 const go=async(isHost)=>{if(nm)store.set('joname',nm.value.trim().slice(0,24));const code=isHost?joCode():(cd.value||'').trim().toUpperCase();if(!isHost&&code.length<4){JO.err='Type the room code from the host.';joRender();return}JO.pendingCode=null;try{await joOpen(isHost,code)}catch(e){JO.status='idle';JO.err=e&&e.message||'Could not connect.';if(JO.link){JO.link.close();JO.link=null}joRender()}};
 const h=$('#johost');if(h)h.onclick=()=>go(true);const j=$('#jojoin');if(j)j.onclick=()=>go(false);
 const ts=$('#jotsave');if(ts)ts.onclick=()=>{store.set('joturn',{urls:$('#joturl').value.trim(),user:$('#jotuser').value.trim(),pass:$('#jotpass').value});ts.textContent='Saved'};
 const sv=$('#josrv');if(sv)sv.onchange=e=>{const m=e.target.value.trim().match(/^(?:https?:\/\/)?([^:\/]+)(?::(\d+))?(\/.*)?$/);store.set('jopeer',m?{host:m[1],port:+(m[2]||443),path:m[3]||'/',secure:(m[2]||'443')!=='80'&&m[1]!=='localhost'&&m[1]!=='127.0.0.1'}:null)};
 const pt=$('#joport');if(pt)pt.onchange=e=>store.set('joport',Math.max(0,Math.min(65535,+e.target.value||0)));
 const ad=$('#joadj');if(ad)ad.onchange=e=>{store.set('joadj',Math.max(-50,Math.min(200,+e.target.value||0)));joBroadcast({k:'info',rt:joRt()})};
 const lv=$('#joleave');if(lv)lv.onclick=()=>joLeave();
 const cp=$('#jocopy');if(cp)cp.onclick=()=>{const u=(/^https?:/.test(location.protocol)?location.href.split('#')[0]:'https://reginaldcumbiscuits.github.io/theory-club-desktop/app/')+'#tools-online-'+JO.code;/* the apps share a web link anyone can open */(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>{cp.textContent='Copied'},()=>{cp.textContent=u})};
 const rc=$('#jorecal');if(rc)rc.onclick=()=>{joBroadcast({k:'calreq'});joQueueCal();rc.textContent='Measuring…';setTimeout(()=>{rc.textContent='Re-measure delay'},3500)};
 const pl=$('#joplay');if(pl)pl.onclick=()=>{audio();joChange({playing:!JO.sess.playing})};
 const bp=$('#jobpm');if(bp){bp.oninput=e=>{$('#jobpmv').textContent=e.target.value};bp.onchange=e=>joChange({bpm:+e.target.value})}
 el.querySelectorAll('[data-loc]').forEach(b=>b.onclick=()=>{const L=joLoc();L[b.dataset.loc]=!L[b.dataset.loc];store.set('joloc',L);b.setAttribute('aria-pressed',L[b.dataset.loc]);if(JO.native)natMix()});
 el.querySelectorAll('.jvol').forEach(r=>r.oninput=e=>{const P=JO.peers[r.dataset.v];if(!P)return;P.vol=+e.target.value;if(P.native)natCall('engine_set_peer',{key:P.id,gain:P.vol,mute:!!P.mute}).catch(()=>{});if(P.node&&!P.cal)P.node.g.gain.value=P.mute?0:P.vol});
 el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const P=JO.peers[b.dataset.m];if(!P)return;P.mute=!P.mute;b.setAttribute('aria-pressed',P.mute);if(P.native)natCall('engine_set_peer',{key:P.id,gain:P.vol,mute:!!P.mute}).catch(()=>{});if(P.node&&!P.cal)P.node.g.gain.value=P.mute?0:P.vol})}
TOOLPAGES.online=el=>{if(IN_CLAUDE()){el.innerHTML=`<p>Play live with up to three friends: a shared click and backing band, your guitar sent straight to the others, and delay measured all the time so it stays in time.</p><div class="callout">Jamming needs your audio input, which isn’t available inside Claude. Open the website version of Theory Club to start or join a room.</div>${JO_HELP}`;return}
 JO.el=el;joRender()};


/* ---------- desktop engine (Theory Club desktop app: ASIO, WASAPI, CoreAudio) ---------- */
const TAU=window.__TAURI__&&window.__TAURI__.core&&window.__TAURI__.core.invoke?window.__TAURI__.core:null;
const natCall=(c,a)=>TAU.invoke(c,a||{});
/* the Android app: no desktop audio engine, no self-installing updates */
const DROID=!!TAU&&/Android/i.test(navigator.userAgent);
const joNative=()=>!!TAU&&!DROID&&store.get('joeng','native')==='native';
Object.assign(JO,{native:false,nat:null,natAudio:null,natNet:null,natClock:null,natSent:{},natHosts:null,natDevs:null,natErr:'',natPoll:0});
function natNow(){const c=JO.natClock;return c?c.shared+(performance.now()-c.perf):performance.now()}
const natCfg=()=>Object.assign({host:'',input:'',output:'',ch:-1,buffer:128},store.get('jonat',{})||{});
function natSess(s){if(!s)return null;const st=joStyle(s);const steps=st.g?st.g.steps:s.beats;const rows=st.g?Object.entries(st.g.rows):[];
 const bass=st.prog?st.prog.map((_,i)=>{const ch=joChordAt(s,i);return ch?28+((parse(ch.root).pc-4+12)%12):-1}):[];
 return{playing:!!s.playing,t0_ms:+s.t0||0,bpm:+s.bpm||96,beats:+s.beats||4,steps:+steps||4,rows,bass,mode:s.mode==='live'?'live':'sync',sync_bars:joSyncBars(s)}}
function natMix(){if(!TAU)return;const L=joLoc();natCall('engine_set_mix',{mix:{click:!!L.click,drums:!!L.drums,bass:!!L.bass,click_vol:.6,band_vol:.75}}).catch(()=>{})}
function natApplyLocal(){if(!TAU)return;natCall('engine_set_local',{monitor:!!store.get('jonmon',false),inputGain:+store.get('jogain',1),monitorGain:1}).catch(()=>{});const c=store.get('jocodec','opus');natCall('engine_set_codec',{codec:c,bitrate:128000}).catch(()=>{})}
function natStartPoll(){if(JO.natPoll)return;JO.natPoll=setInterval(async()=>{if(!JO.natAudio&&!JO.natNet){clearInterval(JO.natPoll);JO.natPoll=0;return}let s;const t=performance.now();try{s=await natCall('stats')}catch(e){return}
 JO.nat=s;JO.natClock={shared:s.shared_ms+(performance.now()-t)/2,perf:performance.now()};if(JO.native)JO.offOk=JO.host||!!s.synced;
 if(s.audio_error&&JO.natAudio&&!s.audio){JO.natErr='The audio device stopped: '+s.audio_error}
 (s.peers||[]).forEach(p=>{const P=JO.peers[p.key];if(P){P.nat=p;P.state=p.state}});joPaint();natMeters()},250)}
function natMeters(){const el=JO.el;if(!el||!JO.nat)return;const s=JO.nat;const a=el.querySelector('#nmin'),b=el.querySelector('#nmout'),l=el.querySelector('#nlat');if(a)a.style.width=Math.min(100,s.in_level*140)+'%';if(b)b.style.width=Math.min(100,s.out_level*140)+'%';
 if(l&&JO.natAudio)l.textContent=`${Math.round(s.in_ms+s.out_ms)} ms through your interface${s.xruns?` · ${s.xruns} dropouts`:''}`}
const NAT_HELP=`<details class="more"><summary>Plugins, ASIO and getting the lowest delay</summary><div class="stack" style="gap:8px">
 <div class="cols"><div class="mini"><h4>Lowest delay</h4><p class="o">Plug into your audio interface and pick its <b>ASIO</b> driver (Windows) or <b>CoreAudio</b> device (Mac). Try 64 or 128 samples. Use your interface’s direct monitoring, or tick “Hear myself through the app”.</p></div>
 <div class="mini"><h4>Plugins on Mac</h4><p class="o">Run your amp plugins in Logic, Ableton or a standalone amp sim, set its output to <b>BlackHole 2ch</b>, and pick BlackHole as the input here. Macs let several apps share one interface.</p></div>
 <div class="mini"><h4>Plugins on Windows</h4><p class="o">Most ASIO drivers allow one app per interface. Either host your plugins in <b>Voicemeeter</b> and pick its ASIO driver here, or send your plugin host to <b>VB-Cable</b> and choose WASAPI → CABLE Output here (a few ms slower).</p></div></div>
 <p class="hint">Dropouts or crackles? Raise the buffer one step. Uncompressed sound needs about 1 Mbit/s each way per player.</p></div></details>`;
function natPanel(){const A=JO.natAudio,cfg=natCfg(),hosts=JO.natHosts||[],dl=JO.natDevs||{inputs:[],outputs:[]};
 const opt=(list,val)=>`<option value="">System default</option>`+list.map(d=>`<option value="${esc(d.id)}" ${d.id===val?'selected':''}>${esc(d.name)}</option>`).join('');
 const inDev=dl.inputs.find(d=>d.id===cfg.input)||dl.inputs.find(d=>d.default)||dl.inputs[0];const chs=Math.max(1,Math.min(32,inDev?inDev.channels:2));
 return`<section class="panel"><div class="row" style="justify-content:space-between"><h3>Audio setup</h3><span class="hint">${A?`${esc(A.host)} · ${A.out_rate/1000} kHz`:'Audio is off'}</span></div>
  <div class="row nrow"><label class="popt">Driver <select id="nhost">${hosts.length?hosts.map(h=>`<option value="${esc(h.id)}" ${h.id===cfg.host?'selected':''}>${esc(h.name)}</option>`).join(''):'<option>Loading…</option>'}</select></label>
  <label class="popt">Input <select id="nin">${opt(dl.inputs,cfg.input)}</select></label>
  <label class="popt">Channel <select id="nch"><option value="-1">All, mixed</option>${Array.from({length:chs},(_,i)=>`<option value="${i}" ${+cfg.ch===i?'selected':''}>${i+1}</option>`).join('')}</select></label>
  <label class="popt">Output <select id="nout">${opt(dl.outputs,cfg.output)}</select></label>
  <label class="popt">Buffer <select id="nbuf">${[0,32,48,64,96,128,192,256,512].map(b=>`<option value="${b}" ${+cfg.buffer===b?'selected':''}>${b?b+' samples':'Driver default'}</option>`).join('')}</select></label></div>
  <div class="row" style="gap:10px;align-items:center"><button class="btn ${A?'':'primary'}" id="nstart">${A?'Apply':'Start audio'}</button>${A?'<button class="btn" id="nstop">Stop</button>':''}<span class="jmeter" title="Input level"><i id="nmin"></i></span><span class="jmeter" title="Output level"><i id="nmout"></i></span><span class="hint" id="nlat"></span></div>
  ${JO.natErr?`<p class="callout">${esc(JO.natErr)}</p>`:''}
  <div class="row" style="gap:16px;flex-wrap:wrap"><label class="popt">Level <input type="range" id="ngain" min="0" max="4" step=".05" value="${store.get('jogain',1)}"></label><label class="popt"><input type="checkbox" id="nmon" ${store.get('jonmon',false)?'checked':''}> Hear myself through the app</label>
  <label class="popt">Send as <select id="ncodec"><option value="opus">Opus (any internet)</option><option value="pcm" ${store.get('jocodec','opus')==='pcm'?'selected':''}>Uncompressed (fast or local networks)</option></select></label></div>${NAT_HELP}</section>`}
async function natLoadDevs(host){try{JO.natDevs=await natCall('engine_devices',{host:host||null});JO.natErr=''}catch(e){JO.natDevs={inputs:[],outputs:[]};JO.natErr=String(e)}joRender()}
function natBind(){const el=JO.el,$=q=>el.querySelector(q);if(!$('#nhost'))return;
 if(!JO.natHosts){natCall('engine_hosts').then(h=>{JO.natHosts=h;const c=natCfg();if(!c.host||!h.find(x=>x.id===c.host)){const pref=h.find(x=>/asio/i.test(x.id))||h.find(x=>/coreaudio/i.test(x.id))||h[0];c.host=pref?pref.id:'';store.set('jonat',c)}natLoadDevs(natCfg().host)}).catch(e=>{JO.natErr=String(e);joRender()})}
 const save=()=>{const c={host:$('#nhost').value,input:$('#nin').value,output:$('#nout').value,ch:+$('#nch').value,buffer:+$('#nbuf').value};store.set('jonat',c);return c};
 $('#nhost').onchange=()=>{const c=save();c.input='';c.output='';store.set('jonat',c);JO.natDevs=null;natLoadDevs(c.host)};
 ['#nin','#nout','#nch','#nbuf'].forEach(q=>$(q).onchange=()=>{save();if(q==='#nin')joRender()});
 $('#nstart').onclick=async()=>{const c=save();const b=$('#nstart');b.disabled=true;b.textContent='Starting…';
  try{JO.natAudio=await natCall('engine_start',{cfg:{host:c.host||null,input:c.input||null,output:c.output||null,input_channel:+c.ch,buffer:+c.buffer,rate:0}});JO.natErr='';natApplyLocal();natMix();if(JO.sess)natCall('engine_set_session',{sess:natSess(JO.sess)}).catch(()=>{});natStartPoll()}
  catch(e){JO.natAudio=null;JO.natErr=String(e)}joRender()};
 const st=$('#nstop');if(st)st.onclick=async()=>{await natCall('engine_stop').catch(()=>{});JO.natAudio=null;joRender()};
 $('#ngain').oninput=e=>{store.set('jogain',+e.target.value);natApplyLocal()};
 $('#nmon').onchange=e=>{store.set('jonmon',e.target.checked);natApplyLocal()};
 $('#ncodec').onchange=e=>{store.set('jocodec',e.target.value);natApplyLocal()}}

// route the shared Jam online page through the desktop engine when it's in use
{const _open=joOpen;joOpen=async function(isHost,code){JO.native=joNative();if(!JO.native)return _open(isHost,code);
  if(!JO.natAudio)throw new Error('Start your audio first, in Audio setup.');
  JO.me.name=(store.get('joname','')||'').trim()||'Player';JO.me.inst=INST_RAW();JO.host=isHost;JO.code=code;JO.peers={};JO.natSent={};JO.err='';JO.status='connecting';joRender();
  const onMsg=(from,d)=>joMsg(from,d),onDrop=id=>joDrop(id);
  const link=store.get('jolink','peer')==='bc'?await joLinkBC(isHost,code,onMsg):await joLinkPeer(isHost,code,onMsg,onDrop);
  JO.link=link;JO.me.id=link.id;JO.hostId=link.hostId;
  try{JO.natNet=await natCall('net_open',{room:code,me:link.id,host:link.hostId,port:+store.get('joport',0)||0})}catch(e){link.close();JO.link=null;throw new Error(String(e))}
  JO.status='in';JO.offOk=isHost;
  if(isHost){JO.sess={v:1,engine:'native',mode:'sync',bars:'cycle',bpm:96,beats:4,style:'rock',key:'A',playing:false,t0:0};JO.roster=[{id:JO.me.id,name:JO.me.name,inst:JO.me.inst}];natCall('engine_set_session',{sess:natSess(JO.sess)}).catch(()=>{})}
  else link.send(JO.hostId,{k:'hello',name:JO.me.name,inst:JO.me.inst,engine:'native'});
  natMix();natStartPoll();joRender()}}
{const _msg=joMsg;joMsg=function(from,d){if(!d||typeof d!=='object')return;
  if(JO.host&&d.k==='hello'&&((d.engine==='native')!==!!JO.native)){JO.link.send(from,{k:'engine',need:JO.native?'native':'web'});return}
  if(JO.host&&d.k==='hello'&&JO.native&&JO.roster.length>=8&&!JO.roster.find(r=>r.id===from)){JO.link.send(from,{k:'full'});return}
  if(!JO.host&&JO.native&&d.k==='sess'&&from===JO.hostId){joSetSess(d.s);return}
  if(!JO.host&&d.k==='engine'){JO.err=d.need==='native'?'This room uses the desktop app’s audio engine. Join it from the Theory Club desktop app.':'This room was started in a web browser. Join from the website, or switch Engine to Browser here.';joLeave(true);return}
  if(JO.native&&JO.host&&d.k==='hello'){JO.roster=JO.roster.filter(r=>r.id!==from).concat([{id:from,name:String(d.name||'Player').slice(0,24),inst:String(d.inst||'')}]);joRoster();return}
  return _msg(from,d)}}
{const _mesh=joMesh;joMesh=function(){if(!JO.native)return _mesh();const ids=new Set((JO.roster||[]).map(r=>r.id));
  (JO.roster||[]).forEach(r=>{if(r.id===JO.me.id)return;let P=JO.peers[r.id];if(!P)P=JO.peers[r.id]={id:r.id,native:true,vol:1,mute:false,state:'punching'};P.name=r.name;P.inst=r.inst;
   if(!JO.natSent[r.id]&&JO.natNet){JO.natSent[r.id]=1;joSig(r.id,{nat:{cands:JO.natNet.cands}})}});
  Object.keys(JO.peers).forEach(id=>{if(!ids.has(id)){natCall('net_drop',{key:id}).catch(()=>{});delete JO.peers[id];delete JO.natSent[id]}});joRender()}}
{const _sig=joOnSig;joOnSig=async function(from,d){if(!JO.native)return _sig(from,d);if(!d||!d.nat||!Array.isArray(d.nat.cands))return;const P=JO.peers[from];
  try{await natCall('net_peer',{key:from,name:(P&&P.name)||'Player',cands:d.nat.cands.slice(0,8).map(String)})}catch(e){}
  if(!JO.natSent[from]&&JO.natNet){JO.natSent[from]=1;joSig(from,{nat:{cands:JO.natNet.cands}})}}}
{const _drop=joDrop;joDrop=function(id){if(JO.native)natCall('net_drop',{key:id}).catch(()=>{});return _drop(id)}}
{const _leave=joLeave;joLeave=function(quiet){const was=JO.native&&JO.natNet;_leave(quiet);if(was){natCall('net_close').catch(()=>{});JO.natNet=null}JO.natSent={}}}
{const _set=joSetSess;joSetSess=function(s){_set(s);if(JO.native&&JO.sess)natCall('engine_set_session',{sess:natSess(JO.sess)}).catch(()=>{})}}
{const _tick=joTick;joTick=function(){if(JO.native)return;return _tick()}}
{const _paint=joPaint;joPaint=function(){_paint();if(!JO.native||!JO.el)return;Object.values(JO.peers).forEach(P=>{const r=JO.el.querySelector(`[data-pl="${CSS.escape(P.id)}"]`);if(!r||!P.nat)return;const st=r.querySelector('.jst');if(st)st.textContent=P.nat.loss>.02?Math.round(P.nat.loss*100)+'% dropouts':P.nat.state==='direct'?'direct':P.nat.state==='relay'?'via host':''})}}
{const _lt=joLatTxt;joLatTxt=function(P){if(!P.native)return _lt(P);const n=P.nat;if(!n||n.state==='punching')return'Connecting…';if(n.state==='lost')return'Can’t reach this player';if(n.state==='left')return'Left';
  const via=n.state==='relay'?' · via host':'';const net=n.net_ms!=null?Math.max(0,Math.round(n.net_ms)):null;
  if(JO.sess&&JO.sess.mode==='sync')return`Locked ${n.bars||'–'} bar${n.bars>1?'s':''} behind · ${net==null?'–':net} ms network${via}`;return`${n.delay_ms!=null?Math.round(n.delay_ms):'–'} ms behind you${via}`}}
{const _q=joQual;joQual=function(P){if(!P.native)return _q(P);const n=P.nat;if(!n||n.state==='punching')return'';if(n.state==='lost')return'warn';if(n.loss>.03)return'warn';if(JO.sess&&JO.sess.mode==='live'){const d=n.delay_ms||99;return d<30?'good':d<50?'ok':'warn'}return n.state==='relay'?'ok':'good'}}


/* ---------- desktop app updates ---------- */
const UPD={state:'idle',info:null,err:'',ver:'',dismissed:false,last:0};
function updBanner(){let b=document.getElementById('updbar');if(UPD.state!=='ready'||UPD.dismissed){if(b)b.remove();return}
 if(!b){b=document.createElement('div');b.id='updbar';b.className='updbar';b.setAttribute('role','status');document.body.appendChild(b)}
 const jam=JO.status==='in';
 b.innerHTML=`<span><b>Theory Club ${esc(UPD.info.version)} is ready.</b> ${jam?'It will install when you restart, so finish your jam first.':'Restart to start using it.'}</span><button class="btn small primary" id="updgo">${jam?'Leave jam and restart':'Restart now'}</button><button class="btn small" id="updlater">Later</button>`;
 b.querySelector('#updgo').onclick=updInstall;b.querySelector('#updlater').onclick=()=>{UPD.dismissed=true;updBanner()}}
async function updCheck(manual){if(!TAU||DROID||UPD.state==='checking'||UPD.state==='ready')return;UPD.state='checking';UPD.err='';updSettings();
 try{const r=await natCall('update_check');UPD.last=Date.now();if(r){UPD.info=r;UPD.state='ready';UPD.dismissed=false}else UPD.state='current'}
 catch(e){UPD.state='error';UPD.err=String(e)}updBanner();updSettings()}
async function updInstall(){if(UPD.state!=='ready')return;try{if(JO.status==='in')joLeave(true)}catch(e){}UPD.state='installing';updBanner();updSettings();
 try{await natCall('update_install')}catch(e){UPD.state='error';UPD.err=String(e);updSettings()}}
function updSettings(){const body=document.getElementById('setbody');if(!TAU||DROID||!body||document.getElementById('setpanel').hidden)return;let el=body.querySelector('#updset');
 if(!el){el=document.createElement('section');el.id='updset';el.className='panel';body.appendChild(el)}
 const msg={idle:'',checking:'Checking…',current:'You have the latest version.',ready:`Version ${UPD.info&&esc(UPD.info.version)} is downloaded and ready.`,installing:'Installing…',error:'Couldn’t check for updates. You might be offline.'}[UPD.state]||'';
 el.innerHTML=`<h3>App updates</h3><p class="hint">Theory Club ${esc(UPD.ver||'')} for desktop. New versions download in the background and install when you restart.</p>
  <div class="row" style="gap:10px;align-items:center">${UPD.state==='ready'?'<button class="btn primary" id="updnow">Restart and update</button>':`<button class="btn" id="updchk" ${UPD.state==='checking'?'disabled':''}>Check for updates</button>`}<span class="hint">${msg}</span></div>`;
 const a=el.querySelector('#updchk');if(a)a.onclick=()=>updCheck(true);const g=el.querySelector('#updnow');if(g)g.onclick=updInstall}
if(TAU){natCall('app_version').then(v=>{UPD.ver=v}).catch(()=>{});
 setInterval(()=>{if(Date.now()-UPD.last>6*3600e3)updCheck(false)},15*60e3);
 {const _os=openSettings;openSettings=function(){_os();updSettings()}}
 const sb=document.getElementById('setbody');if(sb&&window.MutationObserver)new MutationObserver(()=>{if(!sb.querySelector('#updset'))updSettings()}).observe(sb,{childList:true});
 {const _lv=joLeave;joLeave=function(q){_lv(q);updBanner()}}}


/* ---------- appearance: theme and accent, shared with Companion and Unreel ---------- */
const TC_ACCENTS=[['blue','Blue','#93C5FD'],['orange','Orange','#FDBA74'],['green','Green','#86EFAC'],['purple','Purple','#C4B5FD']];
function applyLook(){const r=document.documentElement;const t=store.get('theme','system');if(t==='light'||t==='dark')r.dataset.theme=t;else delete r.dataset.theme;
 const a=store.get('accent','blue');if(a&&a!=='blue')r.dataset.accent=a;else delete r.dataset.accent;
 const m=document.querySelector('meta[name="theme-color"]');if(m){const dark=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);m.content=dark?'#0A0A0B':'#F2F2F7'}}
applyLook();
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyLook)}catch(e){}
function lookSettings(){const body=document.getElementById('setbody');if(!body||document.getElementById('setpanel').hidden)return;let el=body.querySelector('#lookset');
 if(!el){el=document.createElement('section');el.id='lookset';el.className='appear';const first=body.firstElementChild;body.insertBefore(el,first?first.nextSibling:null)}
 const t=store.get('theme','system'),a=store.get('accent','blue');
 el.innerHTML=`<h3>Appearance</h3><div class="pickrow"><span class="eyebrow">Theme</span>${pillsHTML('look',[['system','System'],['light','Light'],['dark','Dark']],t)}</div>
  <div class="pickrow"><span class="eyebrow">Accent</span><div class="swatches" role="group" aria-label="Accent colour">${TC_ACCENTS.map(([k,n,c])=>`<button class="swatch" style="--sw:${c}" data-acc="${k}" aria-pressed="${k===a}" aria-label="${n}" title="${n}"></button>`).join('')}</div></div>`;
 bindPills(el,(g,v)=>{store.set('theme',v);applyLook();lookSettings()});
 el.querySelectorAll('[data-acc]').forEach(b=>b.onclick=()=>{store.set('accent',b.dataset.acc);applyLook();lookSettings()})}
{const _os=openSettings;openSettings=function(){_os();lookSettings()}}
{const sb=document.getElementById('setbody');if(sb&&window.MutationObserver)new MutationObserver(()=>{if(!sb.querySelector('#lookset'))lookSettings()}).observe(sb,{childList:true})}

/* ---------- groove & feel: the pocket, time, syncopation, space, styles ---------- */
const GVL={cur:null};
function gvStop(){const c=GVL.cur;if(!c)return;GVL.cur=null;clearInterval(c.timer);c.timers.forEach(clearTimeout);if(c.onstop)c.onstop()}
/* step scheduler: cfg() returns {bpm,per,steps,step(s,t,sd)}; runs until gvStop, the host leaves the page, or max steps */
function gvStart(host,cfg,{onstop=null,max=0}={}){gvStop();const c=audio();if(!c)return null;const st={timer:0,timers:[],onstop};let s=0,t=c.currentTime+.12;
 const tick=()=>{if(!host.isConnected){gvStop();return}const k=cfg();const sd=60/k.bpm/k.per;while(t<c.currentTime+.25){if(max&&s>=max){const left=Math.max(0,(t-c.currentTime)*1000)+150;st.timers.push(setTimeout(()=>{if(GVL.cur===st)gvStop()},left));clearInterval(st.timer);return}k.step(s%k.steps,t,sd,s);t+=sd;s++}};
 GVL.cur=st;tick();st.timer=setInterval(tick,40);return st}
function gvAt(t,fn){const c=AC;if(!c||!GVL.cur)return;GVL.cur.timers.push(setTimeout(fn,Math.max(0,(t-c.currentTime)*1000)))}
window.addEventListener('hashchange',gvStop);
{const _sd=stopDemo;stopDemo=function(){_sd();gvStop()}}
const gvPart=()=>({bass:'bass',drums:'snare'}[INST()]||'chords');
const gvMs=v=>v===0?'right on the beat':`${Math.abs(v)} ms ${v<0?'ahead':'behind'}`;

/* the pocket: move one part ahead of or behind the beat */
WIDGETS.pocket=host=>{let part=gvPart(),ms=0,bpm=90,quiz=null,score={ok:0,n:0,run:0};
 const BASS=[[0,33,5],[6,33,2],[8,33,2],[10,36,3],[14,38,2],[16,29,5],[22,29,2],[24,29,2],[26,31,3],[30,32,2]];
 const CH=[[4,[57,60,64]],[12,[57,60,64]],[20,[57,60,65]],[28,[57,60,65]]];
 const off=p=>((quiz?quiz.ms:ms)/1000)*((p===part||part==='all')?1:0);
 const step=(s,t,sd)=>{const b=s%16;
  if(b%2===0)drum('hat',t+off('hat'),b%4===0?.8:.5);
  if(b===0||b===8||b===10)drum('kick',t+off('kick'),1);
  if(b===4||b===12)drum('snare',t+off('snare'),1);
  BASS.forEach(([st,m,d])=>{if(st===s)tone(m,t+off('bass'),d*sd*.92,.5,'bass')});
  CH.forEach(([st,ns])=>{if(st===s)ns.forEach(m=>tone(m,t+off('chords'),sd*1.6,.17,'piano'))});
  if(host.querySelector('#pkclk')?.checked&&b%4===0)drum(b===0?'clickhi':'click',t,.45)};
 const viz=()=>{const W=600,H=96,sd=60/bpm/4*1000,px=W/4/sd;const x0=20;const v=quiz?0:ms;let g='';
  for(let i=0;i<=4;i++){const x=x0+i*sd*px*1;g+=`<line x1="${x}" x2="${x}" y1="10" y2="${H-18}" class="${i%4===0?'gb':'gs'}"/>`}
  g+=`<text x="${x0}" y="${H-4}" class="pkt">beat</text><text x="${x0+sd*px}" y="${H-4}" class="pkt">e</text><text x="${x0+2*sd*px}" y="${H-4}" class="pkt">&amp;</text><text x="${x0+3*sd*px}" y="${H-4}" class="pkt">a</text>`;
  g+=`<circle cx="${x0}" cy="28" r="7" class="pkgrid"/><text x="${x0+12}" y="32" class="pkt">drums</text>`;
  const nx=x0+v*px;g+=`<circle cx="${nx}" cy="58" r="7" class="pkme"/><text x="${nx+12}" y="62" class="pkt">${esc(({bass:'bass',snare:'snare',chords:'chords',all:'whole band'})[part])}${quiz?' (?)':''}</text>`;
  return`<svg viewBox="0 0 ${W+40} ${H}" class="pkviz" role="img" aria-label="One beat, zoomed in. The moving part is ${quiz?'hidden':gvMs(v)}.">${g}</svg>`};
 const render=()=>{const playing=!!(GVL.cur&&GVL.cur.host===host);
  host.innerHTML=`<h3>Hear the pocket</h3><p class="hint">A 2-bar groove. Move one part a few milliseconds early or late and listen to how the feel changes, even though the tempo stays the same.</p>
  <div class="gvrow"><span class="eyebrow">Move</span>${pillsHTML('pkp',[['bass','Bass'],['snare','Snare'],['chords','Chords'],['all','Whole band vs click']],part)}</div>
  <div class="gvrow"><span class="eyebrow">Feel</span>${pillsHTML('pkf',[['-25','Ahead'],['0','On'],['25','Behind']],String(ms))}</div>
  <div class="row pkslide"><input type="range" id="pkms" min="-60" max="60" step="5" value="${ms}" aria-label="Offset in milliseconds"><b id="pkv">${gvMs(ms)}</b></div>
  <div class="scroll">${viz()}</div>
  <div class="row"><button class="btn primary small" id="pkgo">${playing?'Stop':ICON.play+' Play'}</button><label class="pill" style="cursor:pointer"><input type="checkbox" id="pkclk" ${part==='all'?'checked':''}> Click</label>
   <label class="row hint" style="gap:6px">Tempo <input type="range" id="pkbpm" min="60" max="130" step="5" value="${bpm}" style="width:120px"> <span id="pkbv">${bpm}</span></label></div>
  <h4>Ear test</h4><p class="hint">${esc(({bass:'The bass is',snare:'The snare is',chords:'The chords are',all:'The whole band is'})[part])} ahead, on or behind. Listen twice, then choose.</p>
  <div class="row"><button class="btn small" id="pkq">${quiz?'Hear it again':'New question'}</button>${quiz?`<button class="btn small" data-a="-1">Ahead</button><button class="btn small" data-a="0">On</button><button class="btn small" data-a="1">Behind</button>`:''}<span class="hint" id="pks">${score.n?`${score.ok} of ${score.n}${score.run>2?` · ${score.run} in a row`:''}`:''}</span></div><p class="hint" id="pkr" aria-live="polite"></p>`;
  bindPills(host,(g,v)=>{if(g==='pkp')part=v;else ms=+v;quiz=null;render();if(GVL.cur)play()});
  const sl=host.querySelector('#pkms');sl.oninput=()=>{ms=+sl.value;host.querySelector('#pkv').textContent=gvMs(ms);host.querySelector('.scroll').innerHTML=viz();host.querySelectorAll('[data-group=pkf] .pill').forEach(p=>p.setAttribute('aria-pressed',p.dataset.v===String(ms)))};
  const bp=host.querySelector('#pkbpm');bp.oninput=()=>{bpm=+bp.value;host.querySelector('#pkbv').textContent=bpm;host.querySelector('.scroll').innerHTML=viz()};
  host.querySelector('#pkgo').onclick=()=>{if(GVL.cur&&GVL.cur.host===host){gvStop();return}quiz=null;play()};
  host.querySelector('#pkq').onclick=()=>{if(!quiz){const a=[-1,0,1][Math.floor(Math.random()*3)];quiz={a,ms:a*(25+Math.round(Math.random()*2)*5)};render()}play(64)};
  host.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(!quiz)return;const ok=+b.dataset.a===quiz.a;score.n++;if(ok){score.ok++;score.run++}else score.run=0;const was=gvMs(quiz.ms);gvStop();quiz=null;render();host.querySelector('#pkr').textContent=(ok?'Right: ':'Not quite: ')+'it was '+was+'.'})};
 const play=(max=0)=>{const st=gvStart(host,()=>({bpm,per:4,steps:32,step}),{max,onstop:()=>{if(host.isConnected){const b=host.querySelector('#pkgo');if(b)b.innerHTML=ICON.play+' Play'}}});if(st){st.host=host;const b=host.querySelector('#pkgo');if(b)b.textContent='Stop'}};
 render()};

/* subdivision & the gap click */
WIDGETS.subdiv=host=>{let sub=2,bpm=72,gap=false,two4=false;
 const SUBS=[['1','Quarters'],['2','Eighths'],['3','Triplets'],['4','Sixteenths'],['sw','Swing']];
 const per=()=>sub==='sw'?3:+sub;
 const step=(s,t,sd,abs)=>{const p=per();const beat=Math.floor(s/p),inb=s%p,bar=Math.floor(abs/(p*4));const silent=gap&&bar%4>=2;
  if(inb===0)gvAt(t,()=>{host.querySelectorAll('.sdot').forEach((d,i)=>d.classList.toggle('on',i===beat%4));const g=host.querySelector('#sdgap');if(g)g.textContent=silent?'Keep going…':''});
  if(silent)return;
  if(inb===0){if(two4){if(beat%2===1)drum('clickhi',t,.6)}else drum(beat%4===0?'clickhi':'click',t,beat%4===0?.6:.5)}
  else if(sub==='sw'){if(inb===2)drum('hat',t,.35)}else drum('hat',t,.3)};
 const render=()=>{const playing=!!(GVL.cur&&GVL.cur.host===host);host.innerHTML=`<h3>Feel the subdivisions</h3><p class="hint">The click on the beat stays the same; the quiet notes show what to count in between.</p>
  ${pillsHTML('sd',SUBS,String(sub))}
  <div class="sdots" aria-hidden="true">${[1,2,3,4].map(i=>`<span class="sdot"><b>${i}</b></span>`).join('')}<span class="hint" id="sdgap"></span></div>
  <p class="hint">Count: <b class="mono">${{1:'1 2 3 4',2:'1 & 2 & 3 & 4 &',3:'1 trip let 2 trip let …',4:'1 e & a 2 e & a …',sw:'1 (trip) let 2 (trip) let …'}[sub]}</b></p>
  <div class="row"><button class="btn primary small" id="sdgo">${playing?'Stop':ICON.play+' Play'}</button><label class="row hint" style="gap:6px">Tempo <input type="range" id="sdbpm" min="40" max="160" step="2" value="${bpm}" style="width:130px"> <span id="sdbv">${bpm}</span></label></div>
  <div class="row"><label class="pill" style="cursor:pointer"><input type="checkbox" id="sdgapc" ${gap?'checked':''}> Gap click (2 bars on, 2 off)</label><label class="pill" style="cursor:pointer"><input type="checkbox" id="sd24" ${two4?'checked':''}> Click on 2 and 4 only</label></div>`;
  bindPills(host,(g,v)=>{sub=v==='sw'?'sw':+v;render();if(GVL.cur&&GVL.cur.host===host)play()});
  const bp=host.querySelector('#sdbpm');bp.oninput=()=>{bpm=+bp.value;host.querySelector('#sdbv').textContent=bpm};
  host.querySelector('#sdgapc').onchange=e=>{gap=e.target.checked};host.querySelector('#sd24').onchange=e=>{two4=e.target.checked};
  host.querySelector('#sdgo').onclick=()=>{if(GVL.cur&&GVL.cur.host===host){gvStop();return}play()}};
 const play=()=>{const st=gvStart(host,()=>({bpm,per:per(),steps:per()*4,step}),{onstop:()=>{if(host.isConnected){const b=host.querySelector('#sdgo');if(b)b.innerHTML=ICON.play+' Play';host.querySelectorAll('.sdot').forEach(d=>d.classList.remove('on'))}}});if(st){st.host=host;host.querySelector('#sdgo').textContent='Stop'}};
 render()};

/* syncopation patterns over a groove */
WIDGETS.synco=host=>{const P=[['on','On the beat','x...x...x...x...','Square and solid: every hit lands on a beat.'],['off','Offbeats','..x...x...x...x.','Every “and”. The skank in reggae and ska.'],['charl','Charleston','x.....x.........','Beat 1, then the “and” of 2. A jazz and pop staple.'],['push','Pushes','......x.......x.','The “and” of 2 and of 4, arriving early for beats 3 and 1.'],['tres','Tresillo (3-3-2)','x..x..x.x..x..x.','The 3-3-2 rhythm behind Latin music, reggaeton and a lot of pop.'],['clave','Son clave (3-2)','x..x...x..x.x...','Five hits over two halves. The rhythmic key of Cuban music.'],['funk','Sixteenth funk','x..x..x...xx.x..','Hits on the “e” and “a”: the busiest, funkiest syncopation.']];
 let cur='push',bpm=96,voice=INST()==='drums'?'clap':INST()==='bass'?'bass':'chord';
 const step=(s,t,sd)=>{const b=s%16;if(b%2===0)drum('hat',t,.4);if(b===0||b===8)drum('kick',t,.9);if(b===4||b===12)drum('snare',t,.75);
  const p=P.find(x=>x[0]===cur);if(p[2][b]==='x'){if(voice==='clap')drum('clap',t,1);else if(voice==='bass')tone(33,t,sd*1.8,.55,'bass');else[57,60,64].forEach(m=>tone(m,t,sd*1.5,.2,'piano'))}
  gvAt(t,()=>host.querySelectorAll('.sgrid i').forEach((c,i)=>c.classList.toggle('now',i===b)))};
 const render=()=>{const p=P.find(x=>x[0]===cur);const playing=!!(GVL.cur&&GVL.cur.host===host);host.innerHTML=`<h3>Hear syncopation</h3><p class="hint">The drums keep a plain beat. The highlighted cells are where the ${voice==='clap'?'clap':voice==='bass'?'bass':'chord'} plays.</p>
  ${pillsHTML('sy',P.map(x=>[x[0],x[1]]),cur)}
  <div class="sgrid" role="img" aria-label="${esc(p[1])}: 16 sixteenth-note cells">${[...p[2]].map((c,i)=>`<i class="${c==='x'?'hit':''} ${i%4===0?'b':''}"><span>${['1','e','&','a'][i%4]==='1'?(i/4+1):['','e','&','a'][i%4]}</span></i>`).join('')}</div>
  <p class="o">${esc(p[3])}</p>
  <div class="row"><button class="btn primary small" id="sygo">${playing?'Stop':ICON.play+' Play'}</button>${pillsHTML('syv',[['chord','Chord'],['bass','Bass'],['clap','Clap']],voice)}</div>`;
  bindPills(host,(g,v)=>{if(g==='sy')cur=v;else voice=v;render();if(GVL.cur&&GVL.cur.host===host)play()});
  host.querySelector('#sygo').onclick=()=>{if(GVL.cur&&GVL.cur.host===host){gvStop();return}play()}};
 const play=()=>{const st=gvStart(host,()=>({bpm,per:4,steps:16,step}),{onstop:()=>{if(host.isConnected){const b=host.querySelector('#sygo');if(b)b.innerHTML=ICON.play+' Play';host.querySelectorAll('.sgrid i').forEach(c=>c.classList.remove('now'))}}});if(st){st.host=host;host.querySelector('#sygo').textContent='Stop'}};
 render()};

/* space: busy vs sparse */
WIDGETS.space=host=>{const L={busy:[[0,45],[1,48],[2,52],[3,45],[4,57],[5,55],[6,52],[7,50],[8,48],[9,45],[10,48],[11,50],[12,52],[13,55],[14,57],[15,55]],sparse:[[0,45,3],[3,48,1],[6,52,2],[12,55,2],[14,52,1]],call:[[0,57,2],[2,60,2],[4,64,4],[16,64,1],[17,62,1],[18,60,2],[20,57,4]]};
 let cur='sparse',bpm=88;const steps=()=>cur==='call'?32:16;
 const step=(s,t,sd)=>{const b=s%16;if(b%2===0)drum('hat',t,.4);if(b===0||b===10)drum('kick',t,.9);if(b===4||b===12)drum('snare',t,.8);
  L[cur].forEach(([st,m,d])=>{if(st===s)tone(m,t,(d||1)*sd*.9,.36,cur==='busy'||cur==='sparse'?'guitar':'piano')})};
 const render=()=>{const playing=!!(GVL.cur&&GVL.cur.host===host);host.innerHTML=`<h3>Busy vs space</h3><p class="hint">The same idea played three ways over one groove. Notice which one lets the drums breathe and which one you remember.</p>
  ${pillsHTML('spc',[['busy','Every sixteenth'],['sparse','With space'],['call','Call and response']],cur)}
  <p class="o">${{busy:'16 notes a bar: impressive, but the groove gets buried.',sparse:'5 notes a bar with rests between them. Each note has room to land.',call:'A phrase, a bar of silence, then an answer. The silence is part of the line.'}[cur]}</p>
  <button class="btn primary small" id="spgo">${playing?'Stop':ICON.play+' Play'}</button>`;
  bindPills(host,(g,v)=>{cur=v;render();if(GVL.cur&&GVL.cur.host===host)play()});
  host.querySelector('#spgo').onclick=()=>{if(GVL.cur&&GVL.cur.host===host){gvStop();return}play()}};
 const play=()=>{const st=gvStart(host,()=>({bpm,per:4,steps:steps(),step}),{onstop:()=>{if(host.isConnected){const b=host.querySelector('#spgo');if(b)b.innerHTML=ICON.play+' Play'}}});if(st){st.host=host;host.querySelector('#spgo').textContent='Stop'}};
 render()};

/* groove styles: where each style's pocket sits */
const GV_STYLES=[
 {id:'rock',g:'rock',name:'Rock',pocket:'On top of the beat, even eighths. Kick and bass hit together.',sn:0,bass:'kick'},
 {id:'funk',g:'funk',name:'Funk',pocket:'Dead on the grid. Every sixteenth counts, and the “one” is the strongest beat.',sn:0,bass:'kick'},
 {id:'disco',g:'disco',name:'Disco & house',pocket:'Slightly ahead and driving. Octave bass bounces on every eighth.',sn:-8,bass:'oct'},
 {id:'hiphop',name:'Laid-back hip-hop',pocket:'Swung sixteenths with the snare late. The “drunk” feel made famous by J Dilla.',sn:28,swing:.62,bass:'kick',bpm:84,steps:16,rows:{hat:'x.xxx.x.x.xxx.x.',snare:'....x.......x...',kick:'x..x......x..x..'}},
 {id:'shuffle',g:'shuffle',name:'Blues shuffle',pocket:'Long-short triplets, relaxed. Everyone swings the same amount.',sn:6,bass:'kick'},
 {id:'onedrop',g:'onedrop',name:'Reggae',pocket:'Way behind and heavy. Beat 1 is empty; the bass carries the melody.',sn:22,bass:'kick'},
 {id:'bossa',g:'bossa',name:'Bossa nova',pocket:'Smooth and light, right on the beat. The bass plays root–fifth on 1 and 3.',sn:0,bass:'r5'},
 {id:'jazz',g:'jazz',name:'Jazz swing',pocket:'The ride sits on top and the bass walks on every beat, often pushing slightly ahead.',sn:0,bass:'walk'}];
WIDGETS.styles=host=>{let cur='rock';
 const cfgOf=st=>{const G=st.g?GROOVES.find(x=>x.id===st.g):st;return{rows:G.rows,steps:G.steps,bpm:st.bpm||G.bpm,per:G.steps/4}};
 const step=(s,t,sd)=>{const st=GV_STYLES.find(x=>x.id===cur);const k=cfgOf(st);const sw=st.swing&&s%2===1?sd*(st.swing-.5)*2:0;const tt=t+sw;
  for(const r in k.rows){const ch=k.rows[r][s];if(ch==='x'||ch==='o'){const lag=(r==='snare'||r==='rim')?(st.sn||0)/1000:0;drum(r,tt+lag,ch==='x'?1:.35)}}
  const beat=s%k.per===0,bi=Math.floor(s/k.per);
  if(st.bass==='kick'&&k.rows.kick&&k.rows.kick[s]==='x')tone(33,tt,sd*1.7,.5,'bass');
  if(st.bass==='oct'&&s%2===0)tone(s%4===0?33:45,tt,sd*.9,.5,'bass');
  if(st.bass==='r5'&&beat&&bi%2===0)tone(bi===0?33:40,tt,sd*k.per*1.8,.5,'bass');
  if(st.bass==='walk'&&beat)tone([33,36,38,40][bi%4],tt,sd*k.per*.9,.5,'bass')};
 const render=()=>{const st=GV_STYLES.find(x=>x.id===cur);const playing=!!(GVL.cur&&GVL.cur.host===host);host.innerHTML=`<h3>Every style has its own pocket</h3>
  ${pillsHTML('gvs',GV_STYLES.map(x=>[x.id,x.name]),cur)}<p class="o"><b>${esc(st.name)}.</b> ${esc(st.pocket)}</p>${st.sn?`<p class="hint">Snare: ${gvMs(st.sn)}${st.swing?` · sixteenths swung ${Math.round(st.swing*100)}%`:''}</p>`:''}
  <button class="btn primary small" id="gvsgo">${playing?'Stop':ICON.play+' Play'}</button>`;
  bindPills(host,(g,v)=>{cur=v;render();if(GVL.cur&&GVL.cur.host===host)play()});
  host.querySelector('#gvsgo').onclick=()=>{if(GVL.cur&&GVL.cur.host===host){gvStop();return}play()}};
 const play=()=>{const st=gvStart(host,()=>{const k=cfgOf(GV_STYLES.find(x=>x.id===cur));return{bpm:k.bpm,per:k.per,steps:k.steps,step}},{onstop:()=>{if(host.isConnected){const b=host.querySelector('#gvsgo');if(b)b.innerHTML=ICON.play+' Play'}}});if(st){st.host=host;host.querySelector('#gvsgo').textContent='Stop'}};
 render()};

/* ---------- the lessons ---------- */
PL['gv-pocket']={t:'Playing in the pocket',intro:'The pocket is when a band’s timing locks so well that the groove just sits there and makes people move. It comes from everyone agreeing exactly where the beat is, and placing their notes around it the same way every time.',
 ideas:[['Where the beat is','The drummer’s kick and snare set it. Everyone else places their notes against the drums, not their own idea of the beat.'],['Ahead, on, behind','A few milliseconds early sounds urgent and driving. Right on sounds tight. A few milliseconds late sounds relaxed and heavy.'],['Consistency wins','A part that is always 15 ms late feels great. A part that wanders early and late feels sloppy.'],['Listen more than you play','Lock to the kick and hi-hat first. If you can’t hear them, you’re playing too much or too loud.']],
 try:['In the player above, move the bass ahead, on and behind. Describe how each one feels.','Get 5 right in a row in the ear test.','Play along in Jam along at 80 BPM and try to make your notes disappear into the kick and snare.','Record yourself with a click and check whether you drift early or late.'],
 mistakes:['Rushing busy parts and dragging quiet ones.','Locking to the click but not to the drummer.','Thinking “behind the beat” means slower: the tempo stays the same.'],
 tip:'Play quarter notes with a click at 60 BPM. When you’re perfectly on it, the click seems to vanish under your note.',widget:'pocket',vq:'playing in the pocket'};
PL['gv-time']={t:'Subdivision & inner time',intro:'Good time comes from feeling the small notes between the beats. Count the sixteenths in your head and the big beats land where they should.',
 ideas:[['Subdivide','Count “1 e & a” even when you only play on the beat. It stops you rushing.'],['Slow is harder','At slow tempos there’s more room to drift. Practise there on purpose.'],['Click on 2 and 4','Like a jazz hi-hat. You feel the backbeat and supply beats 1 and 3 yourself.'],['The gap click','The click drops out for two bars. Keep going alone and check you land with it when it comes back.']],
 try:['Play along with quarters, eighths, triplets and sixteenths above, counting out loud.','Turn on the gap click and clap through the silent bars.','Set the click to 50 BPM and play eighths for two minutes.','Switch between eighths and triplets every bar without stopping.'],
 mistakes:['Speeding up as the notes get busier.','Only practising at comfortable tempos.'],
 tip:'If the gap click catches you early, you’re rushing; late, you’re dragging. Most people rush.',widget:'subdiv',vq:'subdivision inner time practice'};
PL['gv-synco']={t:'Syncopation & pushes',intro:'Syncopation puts the accents where you don’t expect them: on the “and”, or just before a beat. It’s what makes a rhythm funky instead of square.',
 ideas:[['Offbeats','The “and” between beats. Reggae and ska chords live there.'],['Pushes','A chord arrives an eighth early, before the beat it belongs to. Pop and rock choruses are full of them.'],['Tresillo and clave','The 3-3-2 and clave rhythms behind Latin music, reggaeton and a lot of pop.'],['Keep the pulse','Syncopation only works over a steady beat. Tap your foot on every beat the whole time.']],
 try:['Play each pattern above and clap along.','Count the sixteenths out loud while the push pattern plays.','Take a chord progression you know and push every chord change an eighth early.','Play the tresillo on one note, then on the chords of a song.'],
 mistakes:['Letting the foot follow the syncopation instead of the beat.','Syncopating everything: it needs the plain beats around it.'],
 tip:'Say the pattern first (“da … da-da … da”). If you can say it in time, you can play it.',widget:'synco',vq:'syncopation explained'};
PL['gv-dynamics']={t:'Dynamics & accents',intro:'How loud each note is shapes a groove as much as when it’s played. Accents show where the strong beats are; quiet notes fill in the feel.',
 ideas:[['Accents','Lean on the notes that matter: the backbeat, the first note of a riff, the push.'],['Ghost notes','Very quiet notes between the main ones, felt more than heard. They add motion.'],['Build and drop','Quieter verses make bigger choruses. Changing volume across a song is the easiest way to add excitement.'],['Touch changes tone','A lighter touch is darker and softer, not just quieter. Use it.']],
 try:['Compare the flat and accented hi-hats above.','Play one riff at three volumes: soft, medium, loud.','Play a groove with accents only on 2 and 4.','Play a verse quietly and the chorus loudly, without speeding up in the chorus.'],
 mistakes:['Playing everything at one volume.','Speeding up when you get louder and slowing down when you get softer.'],
 tip:'Record yourself. What feels like a big difference while playing often sounds tiny on the recording.',widget:'velocity',vq:'dynamics accents groove'};
PL['gv-space']={t:'Space & less is more',intro:'The notes you leave out are part of the groove. Gaps let the other players be heard, and make your notes hit harder.',
 ideas:[['Rests are rhythm','A rest in the right place is as strong as a note.'],['Note length','Short notes bounce; long notes glide. The same notes with different lengths groove differently.'],['Call and response','Play a phrase, leave a gap, answer it. Blues and soul are built on this.'],['Repetition','A simple part repeated with total consistency is more powerful than a busy one that keeps changing.']],
 try:['Compare the three versions above.','Play a bass line or riff with half the notes taken out.','Play only on beat 1 for a whole chorus of a song.','Play a phrase, then leave a whole bar empty, then answer it.'],
 mistakes:['Filling every gap because silence feels scary.','Holding every note too long, so nothing has shape.'],
 tip:'Ask what the song needs, not what you can play.',widget:'space',vq:'less is more groove space'};
PL['gv-styles']={t:'Groove styles',intro:'Every style has its own pocket: where the backbeat sits, how much the small notes swing and which instrument drives.',
 ideas:[['Straight vs swung','Rock and funk play even sixteenths; blues, jazz and much hip-hop swing them.'],['Where the backbeat sits','Funk snares are dead on; reggae and hip-hop snares often lean late.'],['Who drives','In disco the kick and bass push forward; in jazz the ride cymbal leads.'],['Copy the records','Every style has a sound in its timing. Play along with the classic records, not just a click.']],
 try:['Play each style above and describe its feel in one word.','Play the same chords over rock, funk and reggae grooves.','Pick a style and play along with three records from it.'],
 mistakes:['Playing every style with the same straight, on-top feel.','Swinging some notes and not others.'],
 tip:'Learn the style’s drum groove first. Once you can hum it, your part will fit.',widget:'styles',vq:'groove styles explained'};

PL['g-funk']={t:'Funk rhythm guitar',intro:'Funk guitar is percussion with pitch. The strumming hand keeps moving in sixteenths, and you only let some of them ring.',
 ideas:[['Constant sixteenths','Down on every beat and every “&”, up on every “e” and “a”. Keep the arm moving even when you don’t hit the strings.'],['Muted scratches','Relax the fretting hand so the strings go dead. Those scratches are part of the rhythm.'],['Small shapes','Ninth chords and triads on the top strings cut through without getting in the bass’s way.'],['Lock with the hi-hat','Your sixteenths should line up with the drummer’s exactly.']],
 try:['Play the study above at 70 BPM, then 90.','Scratch muted sixteenths for one minute, accenting only the backbeat.','Play an E9 chord on just the “e” of every beat.'],
 mistakes:['Stopping the strumming hand between chords.','Letting chords ring too long.'],
 tip:'Think like a drummer: your hand is the hi-hat, your chords are the snare.',widget:'synco',ex:[['Sixteenth-note funk',()=>studyEx('guitar','funk')]],vq:'funk rhythm guitar'};
PL['b-slap']={t:'Slap & pop',intro:'Slap bass hits the low strings with the side of the thumb and snaps the high strings with a finger. It’s bright and percussive: funk, disco and pop love it.',
 ideas:[['The thumb','Bounce the bony side of the thumb off the string, as if hitting a drum, and let it rebound.'],['The pop','Hook a finger under the G or D string and let it snap back against the frets.'],['Octaves','Thumb the root, pop the octave: the classic slap pattern.'],['Ghost notes','Muted thumb hits between the real notes keep the sixteenth groove going.']],
 try:['Play the study above slowly with a click.','Thumb the root on every beat, then pop the octave on the “&”.','Add a muted thumb ghost note before each pop.'],
 mistakes:['Digging in too hard: a light bounce is louder.','Letting open strings ring between notes.'],
 tip:'Lower the volume and let the technique make the sound. Slap gets messy fast if it’s loud.',ex:[['Slap & pop',()=>studyEx('bass','slap')],['Octave bounce',()=>studyEx('bass','octave')]],vq:'slap bass for beginners'};
PL['p-comping']={t:'Comping & rhythm',intro:'Comping is accompanying: playing chords in a rhythm that supports a singer or soloist. The rhythm you choose matters more than the voicing.',
 ideas:[['Pick a rhythm','Charleston (1 and the “&” of 2), pushes (the “&” of 2 and 4), or offbeats. Each gives a different feel.'],['Leave room','Comp in the gaps of the melody, not on top of it.'],['Share the job','If the bass plays the root, your left hand doesn’t have to.'],['Short and long','Short stabs sound funky; long held chords sound like a pad.']],
 try:['Play each rhythm in the player above with your own chords.','Comp a ii–V–I with the Charleston rhythm in three keys.','Comp a pop song using only pushes.'],
 mistakes:['Playing a chord on every beat.','Left hand doubling the bass in the same low register.'],
 tip:'Sing the melody while you comp. You’ll hear where the gaps are.',widget:'synco',vq:'piano comping rhythms'};
PL['d-pocket']={t:'The backbeat & the pocket',intro:'A drummer’s first job is to make the band feel good. That means a steady hi-hat, a strong, consistent backbeat and a kick that locks with the bass.',
 ideas:[['The backbeat','Snare on 2 and 4, the same height and the same volume every time.'],['Where the snare sits','Dead on for funk and pop. A touch late for a laid-back, heavy feel.'],['Hi-hat as the clock','Keep the hat smooth and even. It’s what the band times against.'],['Play for the song','Fills are punctuation. The groove is the sentence.']],
 try:['In the player above, move the snare ahead, on and behind.','Play the rock beat for five minutes without one fill.','Record yourself and check every backbeat is the same volume.'],
 mistakes:['Speeding up into fills.','Uneven backbeats: some loud, some quiet.'],
 tip:'Listen to Al Jackson Jr., Jeff Porcaro and Questlove. They’re famous for how they play simple grooves.',widget:'pocket',ex:[['Straight rock beat',()=>studyEx('drums','rockbeat')],['Sixteenths & ghost notes',()=>studyEx('drums','ghost16')],['One drop',()=>studyEx('drums','onedrop')]],vq:'drummer playing in the pocket'};

/* register: pages, the Groove & feel group, instrument lists and the plan */
const LEARN_GROOVE=Object.keys(PL).filter(k=>k.startsWith('gv-')).map(k=>[k,PL[k].t]);
['gv-pocket','gv-time','gv-synco','gv-dynamics','gv-space','gv-styles','g-funk','b-slap','p-comping','d-pocket'].forEach(k=>PAGES[k]=lessonPage(k));
LEARN_INST.push(...LEARN_GROOVE,['g-funk',PL['g-funk'].t],['b-slap',PL['b-slap'].t],['p-comping',PL['p-comping'].t],['d-pocket',PL['d-pocket'].t]);
INST_PRI.guitar.push('g-funk');INST_PRI.bass.push('b-slap');INST_PRI.piano.push('p-comping');{const d=INST_PRI.drums;d.splice(Math.min(d.length,4),0,'d-pocket')}
{const g=[['Playing in the pocket','gv-pocket',['rhythm'],'Get 5 in a row in the pocket ear test.'],['Subdivision & inner time','gv-time',['rhythm'],'Keep time through the gap click at 60 BPM.'],['Syncopation & pushes','gv-synco',['rhythm'],'Push every chord change of a song an eighth early.']];
 ['guitar','bass','piano','drums'].forEach(i=>{if(CURR[i])CURR[i].push(...g)});
 CURR.guitar&&CURR.guitar.push(['Funk rhythm guitar','g-funk',['rhythm'],'Play muted sixteenths with accents on 2 and 4 for one minute.']);
 CURR.bass&&CURR.bass.push(['Slap & pop','b-slap',['bass'],'Thumb the root and pop the octave for one minute at 80 BPM.']);
 CURR.piano&&CURR.piano.push(['Comping & rhythm','p-comping',['harmony'],'Comp a ii–V–I with the Charleston rhythm in three keys.']);
 CURR.drums&&CURR.drums.push(['The backbeat & the pocket','d-pocket',['drums'],'Play the rock beat for five minutes with every backbeat the same.'])}
{const _ml=myLessons;myLessons=function(){const a=_ml();LEARN_GROOVE.forEach(x=>{if(!a.find(y=>y[0]===x[0]))a.push(x)});return a}}

/* ---------- pocket check: measure how early or late you play ---------- */
const PK_DET=`class P extends AudioWorkletProcessor{constructor(){super();this.f=0;this.s=0;this.h=0;this.thr=.012;this.port.onmessage=e=>{if(e.data.thr)this.thr=e.data.thr}}
process(ins){const x=ins[0]&&ins[0][0];if(!x)return true;const sr=sampleRate,a1=Math.exp(-1/(sr*.0005)),r1=Math.exp(-1/(sr*.025)),a2=Math.exp(-1/(sr*.1));let pk=0;
for(let n=0;n<x.length;n++){const v=Math.abs(x[n]);if(v>pk)pk=v;this.f=v>this.f?v+(this.f-v)*a1:v+(this.f-v)*r1;this.s=this.f+(this.s-this.f)*a2;
if(this.h>0)this.h--;else if(this.f>this.thr&&this.f>this.s*1.8){this.h=Math.round(sr*.07);this.port.postMessage({t:currentTime+n/sr})}}
this.port.postMessage({pk});return true}}registerProcessor('tc-pocket',P)`;
const PK={node:null,src:null,ctx:null,hits:[],pk:0,listeners:new Set()};
async function pkEnsure(){const c=audio();if(!c||!c.audioWorklet||!INPUT.active||!INPUT.src)return false;
 if(PK.ctx!==c){try{await c.audioWorklet.addModule(URL.createObjectURL(new Blob([PK_DET],{type:'application/javascript'})))}catch(e){try{await c.audioWorklet.addModule('data:application/javascript;charset=utf-8,'+encodeURIComponent(PK_DET))}catch(e2){return false}}
  PK.ctx=c;const n=new AudioWorkletNode(c,'tc-pocket',{numberOfOutputs:1});const z=c.createGain();z.gain.value=0;n.connect(z);z.connect(c.destination);PK.node=n;PK.src=null;
  n.port.onmessage=e=>{if(e.data.t!=null){PK.hits.push(e.data.t);if(PK.hits.length>400)PK.hits.splice(0,100);PK.listeners.forEach(f=>f(e.data.t))}else if(e.data.pk!=null)PK.pk=Math.max(e.data.pk,PK.pk*.9)}}
 if(PK.src!==INPUT.src){try{PK.src&&PK.src.disconnect(PK.node)}catch(e){}INPUT.src.connect(PK.node);PK.src=INPUT.src}return true}
/* round trip = sound out of the speakers + sound back in from your instrument */
const pkEstimate=()=>{const c=AC;const tr=INPUT.stream&&INPUT.stream.getAudioTracks()[0];const st=tr&&tr.getSettings?tr.getSettings():{};return((c&&c.baseLatency)||0)+((c&&c.outputLatency)||0)+(typeof st.latency==='number'?st.latency:.01)};
const pkAdj=()=>(+store.get('pkadj',0)||0)/1000;
const pkRT=()=>{const m=store.get('pklat',null);return(m&&m.dev===(INPUT.dev||'')?m.rt:pkEstimate())+pkAdj()};
const pkRTsrc=()=>{const m=store.get('pklat',null);return m&&m.dev===(INPUT.dev||'')?'measured':'estimated'};
async function pkMeasure(){const c=audio();if(!(await pkEnsure()))return null;PK.node.port.postMessage({thr:.006});const t0=c.currentTime+.4,gap=.45,T=[];for(let i=0;i<8;i++){T.push(t0+i*gap);drum('clickhi',t0+i*gap,1.2)}
 const from=PK.hits.length;await new Promise(r=>setTimeout(r,(.4+8*gap+.5)*1000));PK.node.port.postMessage({thr:.012});const H=PK.hits.slice(from);
 const d=T.map(t=>{const h=H.find(x=>x-t>.002&&x-t<.4);return h!=null?h-t:null}).filter(x=>x!=null).sort((a,b)=>a-b);if(d.length<5)return null;
 const med=d[Math.floor(d.length/2)];const spread=d[d.length-2]-d[1];if(spread>.015)return null;store.set('pklat',{rt:med,dev:INPUT.dev||'',at:Date.now()});return med}
const pkMean=a=>a.reduce((x,y)=>x+y,0)/(a.length||1);
const pkSD=a=>{const m=pkMean(a);return Math.sqrt(pkMean(a.map(x=>(x-m)*(x-m))))};
function pkVerdict(avg,sd){const where=Math.abs(avg)<6?'right on the beat':`${Math.round(Math.abs(avg))} ms ${avg<0?'ahead of':'behind'} the beat`;
 const how=sd<8?'rock steady':sd<14?'steady':sd<24?'a little loose':'loose';
 const feel=Math.abs(avg)<6?'a tight, on-top pocket':avg<0?(avg<-20?'rushing':'a driving, pushed feel'):(avg>25?'dragging':'a laid-back pocket');
 return{where,how,feel}}

WIDGETS.pocketcheck=host=>{let bpm=80,sub='4',bars=8,backing='click',aim=0,state='idle',run=null,last=null;
 const SUBS=[['4','Quarter notes'],['8','Eighth notes'],['bb','Backbeat (2 and 4)']];
 const hist=()=>store.get('pkhist',[])||[];
 const midiOn=()=>MIDIIN.active&&!INPUT.active;
 const strip=(offs,big)=>{const W=600,H=big?70:54,x=v=>W/2+Math.max(-60,Math.min(60,v))/60*(W/2-14);let g=`<rect x="${x(aim-8)}" y="4" width="${x(aim+8)-x(aim-8)}" height="${H-20}" rx="6" class="pkzone"/>`;
  [-60,-30,0,30,60].forEach(v=>g+=`<line x1="${x(v)}" x2="${x(v)}" y1="4" y2="${H-16}" class="${v===0?'gb':'gs'}"/><text x="${x(v)}" y="${H-3}" text-anchor="${v===-60?'start':v===60?'end':'middle'}" class="pkt">${v===0?'on':v<0?Math.abs(v)+' ahead':v+' behind'}</text>`);
  offs.forEach((v,i)=>g+=`<circle cx="${x(v)}" cy="${8+((i*7)%(H-30))+4}" r="4.5" class="pkdot ${i===offs.length-1?'new':''}"/>`);
  if(offs.length>2){const m=pkMean(offs);g+=`<line x1="${x(m)}" x2="${x(m)}" y1="2" y2="${H-14}" class="pkavg"/>`}
  return`<svg viewBox="0 0 ${W} ${H}" class="pkviz pkstrip" role="img" aria-label="Your hits, from 60 ms ahead to 60 ms behind">${g}</svg>`};
 const resultHTML=r=>{if(!r)return'';if(r.offs.length<6)return`<p class="o">I only heard ${r.offs.length} notes on the beat. Play a little louder, or check the level meter in input settings.</p>`;
  const avg=pkMean(r.offs),sd=pkSD(r.offs),v=pkVerdict(avg,sd);const half=Math.floor(r.offs.length/2),a1=pkMean(r.offs.slice(0,half)),a2=pkMean(r.offs.slice(half));const drift=a2-a1;
  const onAim=Math.abs(avg-aim)<8;
  return`<div class="pkres"><div class="pkbig"><b>${Math.abs(avg)<1?'0':(avg<0?'−':'+')+Math.abs(avg).toFixed(0)} ms</b><span>${esc(v.where)}</span></div><div class="pkbig"><b>±${sd.toFixed(0)} ms</b><span>${esc(v.how)}</span></div><div class="pkbig"><b>${r.offs.length}/${r.n}</b><span>beats heard</span></div></div>
   <p class="o">That's ${esc(v.feel)}.${aim?` You aimed for ${gvMs(aim)}: ${onAim?'nailed it.':`${Math.round(Math.abs(avg-aim))} ms off.`}`:''}${Math.abs(drift)>8?` You ${drift<0?'rushed':'dragged'} as you went: ${Math.round(Math.abs(a1))} ms ${a1<0?'ahead':'behind'} in the first half, ${Math.round(Math.abs(a2))} ms ${a2<0?'ahead':'behind'} in the second.`:''}${r.missed>r.n*.3?' Quite a few beats had no note near them, so the timing is based on fewer notes.':''}</p>
   ${sd>=14?'<p class="hint">Tip: drop to a slower tempo and play quarter notes. Steadiness comes before speed.</p>':Math.abs(avg)>20&&!aim?`<p class="hint">Tip: try aiming for “on” and listen for the click disappearing under your note.</p>`:''}`};
 const histHTML=()=>{const H=hist();if(!H.length)return'';return`<details class="more"><summary>${H.length>1?`Your last ${H.length} checks`:'Your last check'}</summary><table class="tbl"><thead><tr><th>When</th><th>Tempo</th><th>Feel</th><th>Steadiness</th></tr></thead><tbody>${H.slice().reverse().map(h=>`<tr><td>${new Date(h.at).toLocaleDateString([], {day:'numeric',month:'short'})}</td><td>${h.bpm}</td><td>${gvMs(Math.round(h.avg))}</td><td>±${Math.round(h.sd)} ms</td></tr>`).join('')}</tbody></table></details>`};
 const render=()=>{const listening=LISTEN();const rt=pkRT();
  host.innerHTML=`<h3>Check your pocket</h3><p class="hint">Play along with the click and see exactly how early or late you are. Use headphones if you play into a microphone, so it doesn't hear the click.</p>
  ${IN_CLAUDE()?`<p class="o">Inside Claude this page can't use your microphone. Open Theory Club on the website or in the desktop app to use the pocket check.</p>`:`
  ${inputPanelHTML()}
  ${listening?`<div class="row pklat"><span class="hint">${midiOn()?'MIDI input: timing uses your sound card’s output delay.':`Sound card delay: <b>${Math.round(rt*1000)} ms</b> (${pkRTsrc()}${pkAdj()?`, fine-tuned ${pkAdj()>0?'+':''}${Math.round(pkAdj()*1000)} ms`:''}).`}</span>${midiOn()?'':`<button class="btn small" id="pkmeas">Measure it</button>`}<span class="hint" id="pkmt" aria-live="polite"></span></div>
  <details class="more pkfine"><summary>Fine-tune the delay</summary><p class="hint">If every check reads early or late by about the same amount, even when you play carefully on the click, nudge this until a careful take reads close to 0. Positive values mean your setup has more delay than measured.</p><div class="row pkslide"><input type="range" id="pkadj" min="-40" max="40" step="1" value="${Math.round(pkAdj()*1000)}" aria-label="Delay fine-tune in milliseconds"><b id="pkadjv">${Math.round(pkAdj()*1000)} ms</b><button class="btn small" id="pkadj0">Reset</button></div></details>`:''}
  <div class="gvrow"><span class="eyebrow">Play</span>${pillsHTML('pks',SUBS,sub)}</div>
  <div class="gvrow"><span class="eyebrow">Aim</span>${pillsHTML('pka',[['-20','Ahead'],['0','On'],['20','Behind']],String(aim))}</div>
  <div class="gvrow"><span class="eyebrow">Over</span>${pillsHTML('pkb',[['click','Click'],['groove','Drums']],backing)}<label class="row hint" style="gap:6px">Tempo <input type="range" id="pkcb" min="50" max="160" step="2" value="${bpm}" style="width:130px"> <span id="pkcbv">${bpm}</span></label></div>
  <div class="row"><button class="btn primary small" id="pkgo2" ${listening?'':'disabled'}>${state==='run'?'Stop':`${ICON.play} Start (${bars} bars)`}</button><span class="hint" id="pkst" aria-live="polite">${listening?'':'Connect your instrument first.'}</span></div>
  <div class="scroll" id="pkstrip">${strip(run?run.offs:last?last.offs:[],true)}</div>
  <div id="pkres">${state==='idle'?resultHTML(last):''}</div>${histHTML()}`}`;
  if(IN_CLAUDE())return;
  const ip=host.querySelector('.inpanel');if(ip)bindInputPanel(ip,()=>{});
  bindPills(host,(g,v)=>{if(g==='pks')sub=v;else if(g==='pka')aim=+v;else if(g==='pkb')backing=v;if(state!=='run')render()});
  const sl=host.querySelector('#pkcb');sl.oninput=()=>{bpm=+sl.value;host.querySelector('#pkcbv').textContent=bpm};
  const mb=host.querySelector('#pkmeas');if(mb)mb.onclick=async()=>{const t=host.querySelector('#pkmt');mb.disabled=true;t.textContent='Turn your speakers up and hold still. Listening for 8 clicks…';const r=await pkMeasure();mb.disabled=false;
   if(r==null)t.textContent=`Couldn't hear the clicks clearly. That's normal with headphones or a guitar plugged straight in; the estimate (${Math.round(pkEstimate()*1000)} ms) will be used.`;else{t.textContent='';render();host.querySelector('#pkmt').textContent=`Measured: ${Math.round(r*1000)} ms.`}};
  {const a=host.querySelector('#pkadj');if(a){a.oninput=()=>{host.querySelector('#pkadjv').textContent=a.value+' ms'};a.onchange=()=>{store.set('pkadj',+a.value);const fd=host.querySelector('.pkfine');render();const f=host.querySelector('.pkfine');if(f)f.open=true}}const r0=host.querySelector('#pkadj0');if(r0)r0.onclick=()=>{store.set('pkadj',0);render();const f=host.querySelector('.pkfine');if(f)f.open=true}}
  host.querySelector('#pkgo2').onclick=()=>{if(state==='run'){finish(true);return}start()}};
 const start=async()=>{const c=audio();if(!c||!LISTEN())return;const midi=midiOn();if(!midi&&!(await pkEnsure())){host.querySelector('#pkst').textContent='This browser can’t time notes precisely. Try Chrome, Edge or the desktop app.';return}
  const per=sub==='4'?1:sub==='8'?2:1;const spb=60/bpm,sd=spb/per,steps=per*4;const rt=midi?((c.baseLatency||0)+(c.outputLatency||0)):pkRT();
  run={offs:[],n:0,missed:0,targets:[],used:new Set(),rt,t0:0,midi,mh:MIDIIN.hits.length,bpm};state='run';render();
  const G=GROOVES.find(g=>g.id==='rock');const total=(bars+1)*steps;
  gvStart(host,()=>({bpm,per,steps,step:(s,t,sdd,abs)=>{const bar=Math.floor(abs/steps),beat=Math.floor(s/per),inb=s%per;
   if(bar===0){if(inb===0){drum(beat===0?'clickhi':'click',t,.8);gvAt(t,()=>{const e=host.querySelector('#pkst');if(e)e.textContent=`Count-in ${beat+1}`})}return}
   if(bar===1&&s===0)gvAt(t,()=>{const e=host.querySelector('#pkst');if(e)e.textContent='Play!'});
   if(backing==='click'){if(inb===0)drum(beat===0?'clickhi':'click',t,beat===0?.7:.55)}else{const gs=s*(16/steps);if(Number.isInteger(gs))for(const r in G.rows){const ch=G.rows[r][gs];if(ch==='x'||ch==='o')drum(r,t,ch==='x'?.9:.35)}}
   const want=sub==='bb'?(inb===0&&beat%2===1):true;if(want){run.targets.push(t);run.n++}}}),{max:total,onstop:()=>finish(false)});
  if(GVL.cur)GVL.cur.host=host;
  const onHit=h=>{if(!run)return;const raw=h-run.rt;const win=sd/2;let bi=-1,bd=1;run.targets.forEach((t,i)=>{const d=raw-t;if(Math.abs(d)<win&&Math.abs(d)<Math.abs(bd)&&!run.used.has(i)){bd=d;bi=i}});if(bi<0)return;run.used.add(bi);run.offs.push(bd*1000);const st=host.querySelector('#pkstrip');if(st)st.innerHTML=strip(run.offs,true)};
  run.onHit=onHit;if(!midi)PK.listeners.add(onHit);else run.mt=setInterval(()=>{while(run&&run.mh<MIDIIN.hits.length){const h=MIDIIN.hits[run.mh++];onHit(h.t)}},30)};
 const finish=manual=>{if(!run)return;const r=run;run=null;PK.listeners.delete(r.onHit);clearInterval(r.mt);if(manual)gvStop();state='idle';
  r.missed=Math.max(0,r.n-r.offs.length);last=r;if(r.offs.length>=6){const H=hist();H.push({at:Date.now(),bpm:r.bpm,avg:pkMean(r.offs),sd:pkSD(r.offs),sub});store.set('pkhist',H.slice(-10))}
  if(host.isConnected)render()};
 const off=()=>{if(!host.isConnected){INPUT.listeners.delete(re);return}};const re=()=>{off();if(state==='idle'&&host.isConnected){const b=host.querySelector('#pkgo2');if(b&&b.disabled===LISTEN())render()}};INPUT.listeners.add(re);
 render()};
/* the pocket lessons get the check under the listening player */
{const _p=WIDGETS.pocket;WIDGETS.pocket=host=>{_p(host);const sec=document.createElement('section');sec.className='panel';sec.id='pkc';host.insertAdjacentElement('afterend',sec);WIDGETS.pocketcheck(sec)}}

/* ---------- groove & feel 2: odd meters, polyrhythms, half and double time ---------- */
WIDGETS.odd=host=>{const M=[['54a','5/4 (3+2)',[3,2],4,'Take Five by Dave Brubeck: count “1-2-3 1-2”.'],['54b','5/4 (2+3)',[2,3],4,'The same five beats, grouped the other way round.'],['78a','7/8 (2+2+3)',[2,2,3],8,'Quick and lopsided, with a long group at the end: a staple of Balkan music and prog rock.'],['78b','7/8 (3+2+2)',[3,2,2],8,'The long group first. It feels like a stumble that lands on its feet.'],['74','7/4 (4+3)',[4,3],4,'A bar of 4 with a beat missing. Money by Pink Floyd and Solsbury Hill by Peter Gabriel are in 7.'],['98','9/8 (2+2+2+3)',[2,2,2,3],8,'Blue Rondo à la Turk by Dave Brubeck uses this grouping.'],['68','6/8 (3+3)',[3,3],8,'Two groups of three: compare with 3/4, which is three groups of two.'],['34','3/4 (2+2+2)',[2,2,2],8,'The waltz, counted in eighths. Same six eighths as 6/8, different accents.']];
 let cur='78a',bpm=0,drums=true,count=true;const m=()=>M.find(x=>x[0]===cur);const defB=x=>x[3]===8?220:120;
 const starts=g=>{const o=[];let a=0;g.forEach(n=>{o.push(a);a+=n});return o};
 const step=(s,t,sd)=>{const x=m(),g=x[2],st=starts(g),tot=g.reduce((a,b)=>a+b,0);const gi=st.indexOf(s);
  if(gi>=0){drum(s===0?'clickhi':'click',t,s===0?.75:.55);if(drums){if(gi===0)drum('kick',t,1);else if(gi===st.length-1)drum('snare',t,.95);else drum(gi%2?'snare':'kick',t,.8)}}else if(count)drum('click',t,.18);
  if(drums)drum('hat',t,gi>=0?.55:.3);
  gvAt(t,()=>host.querySelectorAll('.odcells i').forEach((c,i)=>c.classList.toggle('now',i===s)))};
 const render=()=>{const x=m(),g=x[2],tot=g.reduce((a,b)=>a+b,0);if(!bpm)bpm=defB(x);const playing=!!(GVL.cur&&GVL.cur.host===host);let i=0;
  host.innerHTML=`<h3>Count odd meters</h3><p class="hint">The accents mark the start of each group. Count each group from 1: “1-2 1-2 1-2-3”.</p>
  ${pillsHTML('odm',M.map(y=>[y[0],y[1]]),cur)}
  <div class="odcells" role="img" aria-label="${esc(x[1])}">${g.map(n=>`<span class="odg">${Array.from({length:n},(_,k)=>`<i class="${k===0?'acc':''}" data-i="${i++}"><b>${k+1}</b></i>`).join('')}</span>`).join('')}</div>
  <p class="o">${esc(x[4])}</p>
  <div class="row"><button class="btn primary small" id="odgo">${playing?'Stop':ICON.play+' Play'}</button><label class="pill" style="cursor:pointer"><input type="checkbox" id="oddr" ${drums?'checked':''}> Drums</label><label class="pill" style="cursor:pointer"><input type="checkbox" id="odct" ${count?'checked':''}> Every ${x[3]===8?'eighth':'beat'}</label>
  <label class="row hint" style="gap:6px">Speed <input type="range" id="odbpm" min="${x[3]===8?120:60}" max="${x[3]===8?340:180}" step="5" value="${bpm}" style="width:120px"> <span id="odbv">${bpm}</span></label></div>`;
  bindPills(host,(gg,v)=>{cur=v;bpm=0;render();if(GVL.cur&&GVL.cur.host===host)play()});
  host.querySelector('#oddr').onchange=e=>drums=e.target.checked;host.querySelector('#odct').onchange=e=>count=e.target.checked;
  const sl=host.querySelector('#odbpm');sl.oninput=()=>{bpm=+sl.value;host.querySelector('#odbv').textContent=bpm};
  host.querySelector('#odgo').onclick=()=>{if(GVL.cur&&GVL.cur.host===host){gvStop();return}play()}};
 const play=()=>{const st=gvStart(host,()=>{const x=m();return{bpm,per:1,steps:x[2].reduce((a,b)=>a+b,0),step}},{onstop:()=>{if(host.isConnected){const b=host.querySelector('#odgo');if(b)b.innerHTML=ICON.play+' Play';host.querySelectorAll('.odcells i').forEach(c=>c.classList.remove('now'))}}});if(st){st.host=host;host.querySelector('#odgo').textContent='Stop'}};
 render()};

WIDGETS.poly=host=>{const R=[['3:2','3 against 2','Say “not dif-fi-cult”: “not” together, then the 3 and the 2 split.'],['2:3','2 against 3','The same rhythm with the hands swapped.'],['4:3','4 against 3','Say “pass the gol-den but-ter”.'],['3:4','3 against 4','The same as 4 against 3, felt from the other side.'],['5:4','5 against 4','Hard to say, easier to feel: lock to the 4 and let the 5 float over it.']];
 let cur='3:2',cyc=1.6,on={a:true,b:true};const parts=()=>cur.split(':').map(Number);
 const lcm=(a,b)=>{const g=(x,y)=>y?g(y,x%y):x;return a*b/g(a,b)};
 const step=(s,t,sd)=>{const[a,b]=parts(),L=lcm(a,b);if(on.a&&s%(L/a)===0)drum(s===0?'clickhi':'click',t,.75);if(on.b&&s%(L/b)===0)drum(s===0?'kick':'rim',t,s===0?.8:.75);
  if(s===0)gvAt(t,()=>{const h=host.querySelector('.pyhand');if(h){h.style.animation='none';void h.offsetWidth;h.style.animation=`pyspin ${cyc}s linear`}});
  gvAt(t,()=>{host.querySelectorAll('.pyd').forEach(d=>d.classList.toggle('now',+d.dataset.s===s))})};
 const svg=()=>{const[a,b]=parts(),L=lcm(a,b),C=110,r1=88,r2=58;let g=`<circle cx="${C}" cy="${C}" r="${r1}" class="pyr"/><circle cx="${C}" cy="${C}" r="${r2}" class="pyr"/>`;
  const pt=(k,n,r)=>{const an=-Math.PI/2+k/n*2*Math.PI;return[C+r*Math.cos(an),C+r*Math.sin(an)]};
  for(let k=0;k<a;k++){const[x,y]=pt(k,a,r1);g+=`<circle cx="${x}" cy="${y}" r="9" class="pyd pa" data-s="${k*L/a}"/>`}
  for(let k=0;k<b;k++){const[x,y]=pt(k,b,r2);g+=`<circle cx="${x}" cy="${y}" r="9" class="pyd pb" data-s="${k*L/b}"/>`}
  g+=`<g class="pyhand" style="transform-origin:${C}px ${C}px"><line x1="${C}" y1="${C}" x2="${C}" y2="${C-r1-12}"/></g>`;
  return`<svg viewBox="0 0 ${2*C} ${2*C}" class="pyviz" role="img" aria-label="${a} evenly spaced beats on the outer ring, ${b} on the inner ring">${g}</svg>`};
 const render=()=>{const x=R.find(y=>y[0]===cur),[a,b]=parts();const playing=!!(GVL.cur&&GVL.cur.host===host);
  host.innerHTML=`<h3>Hear polyrhythms</h3><p class="hint">Two even pulses over the same stretch of time. The outer ring plays ${a}, the inner ring plays ${b}. They meet on 1.</p>
  ${pillsHTML('pym',R.map(y=>[y[0],y[1]]),cur)}<div class="pywrap">${svg()}<div class="stack" style="gap:8px"><p class="o">${esc(x[2])}</p>
  <label class="pill" style="cursor:pointer"><input type="checkbox" id="pya" ${on.a?'checked':''}> Outer ${a} (click)</label><label class="pill" style="cursor:pointer"><input type="checkbox" id="pyb" ${on.b?'checked':''}> Inner ${b} (rim)</label>
  <label class="row hint" style="gap:6px">Cycle <input type="range" id="pyc" min="1" max="4" step=".1" value="${cyc}" style="width:110px"> <span id="pycv">${cyc.toFixed(1)} s</span></label>
  <button class="btn primary small" id="pygo" style="align-self:flex-start">${playing?'Stop':ICON.play+' Play'}</button></div></div>
  <p class="hint">Tap the outer ring with your right hand and the inner ring with your left. Then swap.</p>`;
  bindPills(host,(g,v)=>{cur=v;render();if(GVL.cur&&GVL.cur.host===host)play()});
  host.querySelector('#pya').onchange=e=>on.a=e.target.checked;host.querySelector('#pyb').onchange=e=>on.b=e.target.checked;
  const sl=host.querySelector('#pyc');sl.oninput=()=>{cyc=+sl.value;host.querySelector('#pycv').textContent=cyc.toFixed(1)+' s'};
  host.querySelector('#pygo').onclick=()=>{if(GVL.cur&&GVL.cur.host===host){gvStop();return}play()}};
 const play=()=>{const st=gvStart(host,()=>{const[a,b]=parts(),L=lcm(a,b);return{bpm:60/cyc,per:L,steps:L,step}},{onstop:()=>{if(host.isConnected){const b=host.querySelector('#pygo');if(b)b.innerHTML=ICON.play+' Play';const hd=host.querySelector('.pyhand');if(hd)hd.style.animation='none';host.querySelectorAll('.pyd').forEach(d=>d.classList.remove('now'))}}});if(st){st.host=host;host.querySelector('#pygo').textContent='Stop'}};
 render()};

WIDGETS.halfdbl=host=>{let cur='normal',bpm=100;const CH=[[57,[57,60,64]],[53,[57,60,65]],[48,[55,60,64]],[55,[55,59,62]]];
 const F={normal:{name:'Normal',d:'Snare on 2 and 4, hi-hat eighths.',hat:'x.x.x.x.x.x.x.x.',snare:'....x.......x...',kick:'x.......x.x.....'},
  half:{name:'Half-time',d:'Snare only on 3. Same tempo, same chords, but it feels half as fast and twice as heavy.',hat:'x...x...x...x...',snare:'........x.......',kick:'x.........x.....'},
  double:{name:'Double-time',d:'',hat:'xxxxxxxxxxxxxxxx',snare:'..x...x...x...x.',kick:'x...x...x...x...'}};
 F.double.d='The snare comes twice as often and the hats play sixteenths. It feels twice as fast, yet the chords change at the same rate.';
 const step=(s,t,sd)=>{const f=F[cur],b=s%16,bar=Math.floor(s/16);['hat','snare','kick'].forEach(r=>{if(f[r][b]==='x')drum(r,t,r==='hat'?(b%4===0?.6:.4):.95)});
  if(b===0){const[ba,ch]=CH[bar%4];tone(ba-24,t,sd*14,.5,'bass');ch.forEach(m=>tone(m,t,sd*15,.14,'piano'))}
  if(b===0)gvAt(t,()=>host.querySelectorAll('.hdch span').forEach((c,i)=>c.classList.toggle('now',i===bar%4)))};
 const render=()=>{const playing=!!(GVL.cur&&GVL.cur.host===host);host.innerHTML=`<h3>Half-time and double-time</h3><p class="hint">The same 4 chords at the same tempo, over three different drum feels. Switch while it plays.</p>
  ${pillsHTML('hdf',Object.entries(F).map(([k,v])=>[k,v.name]),cur)}<div class="hdch">${['Am','F','C','G'].map(c=>`<span>${c}</span>`).join('')}</div><p class="o">${esc(F[cur].d)}</p>
  <div class="row"><button class="btn primary small" id="hdgo">${playing?'Stop':ICON.play+' Play'}</button><label class="row hint" style="gap:6px">Tempo <input type="range" id="hdbpm" min="70" max="140" step="2" value="${bpm}" style="width:120px"> <span id="hdbv">${bpm}</span></label></div>`;
  bindPills(host,(g,v)=>{cur=v;render();const b=host.querySelector('#hdgo');if(GVL.cur&&GVL.cur.host===host&&b)b.textContent='Stop'});
  const sl=host.querySelector('#hdbpm');sl.oninput=()=>{bpm=+sl.value;host.querySelector('#hdbv').textContent=bpm};
  host.querySelector('#hdgo').onclick=()=>{if(GVL.cur&&GVL.cur.host===host){gvStop();return}play()}};
 const play=()=>{const st=gvStart(host,()=>({bpm,per:4,steps:64,step}),{onstop:()=>{if(host.isConnected){const b=host.querySelector('#hdgo');if(b)b.innerHTML=ICON.play+' Play';host.querySelectorAll('.hdch span').forEach(c=>c.classList.remove('now'))}}});if(st){st.host=host;host.querySelector('#hdgo').textContent='Stop'}};
 render()};

PL['gv-odd']={t:'Odd time signatures',intro:'Odd meters like 5/4 and 7/8 aren’t random: they’re groups of 2 and 3 strung together. Count the groups, not the beats, and they start to feel natural.',
 ideas:[['Groups of 2 and 3','7/8 is usually 2+2+3 or 3+2+2. Find the grouping and count each group from 1.'],['Feel the long beat','The group of 3 feels like a slightly longer step. That limp is the character of the meter.'],['Same notes, new accents','6/8 and 3/4 have the same six eighths: 6/8 is 3+3, 3/4 is 2+2+2.'],['Hum before you play','Sing the accents along with the player before you try playing in the meter.']],
 try:['Play each meter above and clap the accents.','Count 7/8 out loud as “1-2 1-2 1-2-3” for a minute without stopping.','Play a simple riff in 5/4 by adding a beat to a 4/4 riff you know.','Listen to Take Five and count along.'],
 mistakes:['Counting every eighth as one long number (“1 to 7”) instead of in groups.','Rushing the group of 3 to make it feel like 2.'],
 tip:'Start with the drums on and the tempo slow. Once the accents feel normal, switch the drums off.',widget:'odd',vq:'odd time signatures explained'};
PL['gv-poly']={t:'Polyrhythms',intro:'A polyrhythm is two even pulses at once, like 3 beats in the time of 2. They give African, Latin, jazz and progressive music their rolling, layered feel.',
 ideas:[['3 against 2','The most common one. It’s the basis of 6/8 Afro-Cuban grooves and the hemiola in classical music.'],['Find where they meet','Both pulses land together on 1. Everything between is the interesting part.'],['Say it','Phrases like “not dif-fi-cult” (3:2) or “pass the gol-den but-ter” (4:3) put the combined rhythm in your mouth.'],['One pulse at a time','Learn each pulse alone, then layer them. Keep the slower one in your foot.']],
 try:['Tap 3 against 2 on your legs with the player above, then swap hands.','Say “not dif-fi-cult” while tapping 3:2.','Play 4 against 3 at a slow cycle until it feels even.','Over a 4/4 groove, play a riff in groups of three eighths.'],
 mistakes:['Squashing one pulse so it lines up with the other.','Going too fast too soon: slow cycles are easier to feel.'],
 tip:'Turn one ring off, tap along, then turn it back on. Your hand keeps going while your ear adds the other pulse.',widget:'poly',vq:'polyrhythms explained'};
PL['gv-half']={t:'Half-time & double-time feel',intro:'Changing the feel without changing the tempo is one of the most powerful tools in a song. Half-time makes a chorus huge; double-time makes it urgent.',
 ideas:[['Half-time','The snare moves to beat 3. The music feels half as fast and much heavier. Common in metal breakdowns, trap and big choruses.'],['Double-time','The snare comes twice as often and the subdivisions double. It feels like the song has sped up.'],['The chords stay put','The harmony usually changes at the same rate, which is how the listener knows the tempo hasn’t moved.'],['Use it for sections','Switching feel for one section gives a song lift without new material.']],
 try:['Switch between the three feels while the player runs.','Play the same chord progression over each feel and adjust your strumming or line to match.','Take a song you know and play its chorus in half-time.'],
 mistakes:['Actually slowing down in half-time.','Rushing in double-time.'],
 tip:'Keep counting the original tempo in your head when the feel changes.',widget:'halfdbl',vq:'half time double time feel explained'};
['gv-odd','gv-poly','gv-half'].forEach(k=>{PAGES[k]=lessonPage(k);LEARN_INST.push([k,PL[k].t]);LEARN_GROOVE.push([k,PL[k].t])});
['guitar','bass','piano','drums'].forEach(i=>{if(CURR[i])CURR[i].push(['Odd time signatures','gv-odd',['rhythm'],'Count 7/8 as 2+2+3 for a minute without stopping.'],['Polyrhythms','gv-poly',['rhythm'],'Tap 3 against 2, then swap hands.'],['Half-time & double-time feel','gv-half',['rhythm'],'Play one progression over all three feels.'])});

/* ---------- activity log: what happened on each day (for the weekly summary) ---------- */
const ALOG_KEEP=60;
function alogDay(k=todayKey()){const A=store.get('alog',{})||{};return A[k]||{ticks:0,lessons:[],songs:[],pk:0,tr:[],loops:0}}
function alogAdd(fn){const A=store.get('alog',{})||{};const k=todayKey();const d=A[k]||{ticks:0,lessons:[],songs:[],pk:0,tr:[],loops:0};fn(d);A[k]=d;const ks=Object.keys(A).sort();while(ks.length>ALOG_KEEP)delete A[ks.shift()];ALOG_RAW_SET('alog',A)}
const ALOG_RAW_SET=(k,v)=>{try{localStorage.setItem('tc:'+k,JSON.stringify(v))}catch(e){}};
{const _set=store.set;store.set=function(k,v){try{
  if(k==='checks'){const prev=store.get('checks',{})||{};let added=0;const ls=[];for(const id in v){const a=new Set(prev[id]||[]);(v[id]||[]).forEach(i=>{if(!a.has(i)){added++;if(!ls.includes(id))ls.push(id);lessonReviewAdd(id,i)}})}if(added)alogAdd(d=>{d.ticks+=added;ls.forEach(id=>{if(!d.lessons.includes(id))d.lessons.push(id)})})}
  else if(k==='pkhist'){const h=(v||[])[v.length-1];if(h)alogAdd(d=>{d.pk++;d.pkLast={avg:h.avg,sd:h.sd,bpm:h.bpm}})}
  else if(k==='tbest'){const prev=store.get('tbest',{})||{};for(const t in v){if(!prev[t]||v[t].bpm>prev[t].bpm)alogAdd(d=>{const e=d.tr.find(x=>x.t===t);if(e)e.bpm=Math.max(e.bpm,v[t].bpm);else d.tr.push({t,bpm:v[t].bpm})})}}
  else if(k==='cleanLoops')alogAdd(d=>d.loops++);
 }catch(e){}return _set.call(store,k,v)}}
{const _ar=afterRoute;afterRoute=function(){_ar();const h=location.hash.slice(1);if(h.startsWith('song-')){const S=new Set(store.get('songsSeen',[])||[]);if(!S.has(h)){S.add(h);store.set('songsSeen',[...S].slice(-400))}alogAdd(d=>{if(!d.songs.includes(h))d.songs.push(h)})}}}

/* ---------- spaced review for lesson tasks ---------- */
function lessonReviewAdd(id,i){if(store.get('trysrs',true)===false)return;const L=PL[id];if(!L||!L.try||!L.try[i])return;const S=srsGet();const key=`try:${id}:${i}`;if(S[key])return;const d=new Date();d.setDate(d.getDate()+3);
 S[key]={title:`${L.t}: ${L.try[i]}`,href:'#learn-'+id,step:1,due:todayKey(d),added:todayKey(),reps:0,kind:'lesson'};ALOG_RAW_SET('srs',S);if(store.hook)store.hook('srs')}
{const _lp=lessonPage;lessonPage=function(id){const f=_lp(id);return el=>{f(el);const tick=el.querySelector('#ckp');const sec=tick&&tick.closest('section');if(!sec||sec.querySelector('.trysrs'))return;const on=store.get('trysrs',true)!==false;
  const p=document.createElement('p');p.className='hint trysrs';p.innerHTML=`<label style="cursor:pointer"><input type="checkbox" ${on?'checked':''}> Bring ticked tasks back in Review</label> · they return after 3 days, then a week, then longer, so they stick.`;sec.appendChild(p);p.querySelector('input').onchange=e=>store.set('trysrs',e.target.checked)}}}
['gv-pocket','gv-time','gv-synco','gv-dynamics','gv-space','gv-styles','gv-odd','gv-poly','gv-half','g-funk','b-slap','p-comping','d-pocket'].forEach(k=>PAGES[k]=lessonPage(k));
Object.keys(PL).forEach(k=>PAGES[k]=lessonPage(k));
{const _vr=viewReview;viewReview=function(){_vr();main.querySelectorAll('.rev').forEach(r=>{const a=r.querySelector('a[href^="#learn-"]');if(a&&!r.querySelector('.revtag')){const t=document.createElement('span');t.className='revtag';t.textContent='Lesson task';const b=r.querySelector('b');if(b)b.insertAdjacentElement('beforebegin',t)}})}}

/* ---------- genre paths ---------- */
const PATHS=[
 {id:'blues',name:'Blues',jam:['blues'],genres:['Blues','Blues & rock and roll'],alt:['Motown','Rock','Funk'],blurb:'The 12-bar form, the shuffle feel and saying a lot with a few notes.',steps:[
  ['learn','th-blues','Learn the 12-bar form and count it.','pitched'],['learn','d-swing','Shuffles and swing: the blues feel.','drums'],['learn','gv-time','Feel triplets: the blues lives on them.'],
  ['learn','scales','The minor pentatonic and blues scale.','pitched'],['learn','g-lead','Bends and vibrato: the blues voice.','guitar'],['learn','b-walking','Walking and shuffle bass lines.','bass'],['learn','p-lefthand','Boogie and shuffle left-hand patterns.','piano'],
  ['learn','drums','Play a shuffle groove from the groove library.','drums'],['learn','gv-dynamics','Dynamics: build the band up and bring it down.','drums'],['songs',null,'Learn a song from the masters.'],['learn','gv-space','Call and response: leave room between phrases.'],['jam','blues','Jam over the 12-bar blues for 10 minutes.']]},
 {id:'funk',name:'Funk',jam:['funk'],genres:['Funk','Motown'],alt:['Pop & rock','Rock'],blurb:'Sixteenths, ghost notes and a pocket so tight it pulls you in.',steps:[
  ['learn','gv-pocket','Find the pocket and check yours.'],['learn','gv-synco','Syncopation on the “e” and “a”.'],['learn','g-funk','Muted sixteenth strumming.','guitar'],['learn','b-muting','Dead notes and muting.','bass'],['learn','b-slap','Slap and pop.','bass'],['learn','p-comping','Short, syncopated comping.','piano'],['learn','d-dynamics','Ghost notes and accents.','drums'],
  ['learn','gv-dynamics','Make the quiet notes quiet.'],['learn','d-pocket','The backbeat and the pocket.','drums'],['learn','d-hats','Sixteenth hi-hats with open-hat accents.','drums'],['songs',null,'Learn a funk or Motown groove.'],['jam','funk','Lock into the funk vamp for 10 minutes.']]},
 {id:'rock',name:'Rock',jam:['rock','minor'],genres:['Rock','Pop & rock','Indie'],blurb:'Power, drive and riffs: on top of the beat with plenty of attitude.',steps:[
  ['learn','g-barre','Barre and power chords.','guitar'],['learn','strum','Strumming patterns that drive.','guitar'],['learn','bass','Driving root-note lines.','bass'],['learn','shapes','Chords and inversions for rock.','piano'],['learn','drums','The rock beat and its variations.','drums'],
  ['learn','gv-half','Half-time choruses and double-time drive.'],['learn','th-borrowed','The ♭VII and ♭VI chords rock loves.','pitched'],['learn','solo','Your first rock solo.','pitched'],['learn','fills','Fills that set up a chorus.','drums'],
  ['songs',null,'Learn a rock classic.'],['jam','rock','Jam with the rock band.']]},
 {id:'metal',name:'Metal',jam:['metal','minor'],genres:['Metal','Prog'],alt:['Rock'],blurb:'Tight downpicking, dark scales, half-time breakdowns and odd meters.',steps:[
  ['learn','modes','Phrygian and Aeolian: the dark modes.','pitched'],['learn','world','Harmonic minor and Phrygian dominant.','pitched'],['learn','g-lead','Precise bends, vibrato and lead technique.','guitar'],['learn','b-muting','Tight muting for heavy lines.','bass'],
  ['learn','d-independence','Independence for double-kick patterns.','drums'],['learn','gv-half','Half-time breakdowns.'],['learn','fills','Fast fills around the toms.','drums'],['learn','gv-odd','Odd meters, as in prog metal.'],['learn','gv-poly','Polyrhythms over a straight pulse.'],
  ['songs',null,'Learn a metal or prog song.'],['jam','metal','Jam over a heavy minor groove.']]},
 {id:'jazz',name:'Jazz',jam:['cafe','bossa','gypsy'],genres:['Jazz','French & café jazz'],alt:['Blues & rock and roll'],blurb:'Seventh chords, swing feel and outlining the changes.',steps:[
  ['learn','th-sevenths','Seventh chords and the ii–V–I.','pitched'],['learn','gv-time','Swing eighths and the click on 2 and 4.'],['learn','d-swing','The swing ride pattern.','drums'],['learn','d-independence','Comping on the snare against the ride.','drums'],['learn','g-arps','Arpeggios to outline the chords.','guitar'],['learn','b-walking','Walking bass lines.','bass'],['learn','p-voicings','Shells and rootless voicings.','piano'],['learn','p-comping','Comping rhythms.','piano'],
  ['learn','th-extended','9ths, 11ths and 13ths.','pitched'],['learn','th-secondary','Secondary dominants.','pitched'],['songs',null,'Learn a jazz tune.'],['jam','cafe','Swing over the café jazz changes.']]},
 {id:'reggae',name:'Reggae',jam:['reggae','onedrop'],genres:['Reggae','Reggae-rock'],alt:['Funk','Motown','Pop & rock'],blurb:'Space, offbeats and a pocket that sits way back.',steps:[
  ['learn','gv-synco','Offbeats: where reggae chords live.'],['learn','gv-styles','The one drop and its laid-back pocket.'],['learn','gv-space','Space: what you leave out matters most.'],['learn','b-groove','Lock with the kick; the bass sings the melody.','bass'],['learn','d-hats','Hi-hat work for the one drop.','drums'],
  ['learn','gv-pocket','Practise playing behind the beat.'],['learn','d-pocket','Lay the backbeat way back.','drums'],['songs',null,'Learn a reggae song.'],['jam','reggae','Jam with a reggae groove.']]},
 {id:'songwriting',name:'Pop & songwriting',jam:['ballad','soul'],genres:['Pop & rock','Indie','Motown'],alt:['Rock'],blurb:'The progressions, cadences and melodies behind most hit songs.',steps:[
  ['learn','progressions','Roman numerals and the four-chord song.','pitched'],['learn','circle','The circle of fifths.','pitched'],['learn','th-cadences','Cadences: how phrases end.','pitched'],['learn','th-melody','Writing a melody.','pitched'],['learn','th-borrowed','One borrowed chord for emotion.','pitched'],
  ['learn','gv-half','Lift a chorus with a feel change.'],['learn','fills','Fills that set up each section.','drums'],['songs',null,'Learn a pop song and find its numbers.'],['jam','ballad','Write over the ballad backing.']]}];
let JAMPICK=null;
{const _jp=TOOLPAGES.jam;TOOLPAGES.jam=el=>{const p=JAMPICK;JAMPICK=null;if(p&&JAMS.find(j=>j.id===p)){const _jf=jamFor;jamFor=()=>p;try{_jp(el)}finally{jamFor=_jf}}else _jp(el)}}
const learnTitle=k=>{const all=[...LEARN_INST,...LEARN_THEORY,...LEARN_REC,['rhythm','Rhythm & time']];const f=all.find(x=>x[0]===k);return f?f[1]:PL[k]?PL[k].t:k};
const lessonDone=k=>{const L=PL[k];if(!L||!L.try)return false;const ck=(store.get('checks',{})||{})[k]||[];return ck.length>=L.try.length};
function pathSteps(P){const inst=INST(),pitched=inst!=='drums';const voice=INST_RAW()==='voice';const ok=f=>!f||(voice?f==='voice':f===inst)||(f==='pitched'&&pitched);const out=[];
 P.steps.forEach(([kind,ref,why,f])=>{if(!ok(f))return;if(kind==='learn'){if(!PAGES[ref]&&!PL[ref]&&![...LEARN_INST,...LEARN_THEORY].find(x=>x[0]===ref)&&ref!=='rhythm')return;out.push({key:'l:'+ref,kind,href:'#learn-'+ref,title:learnTitle(ref),why,auto:lessonDone(ref)})}
  else if(kind==='songs'){let db=(PLAYDB[inst]||[]).filter(l=>P.genres.includes(l.genre)),fb=false;if(!db.length&&P.alt)for(const g of P.alt){db=(PLAYDB[inst]||[]).filter(l=>l.genre===g).slice(0,1);if(db.length){fb=true;break}}const picks=[];db.forEach(l=>l.songs.slice(0,1).forEach(sg=>picks.push({l,sg})));picks.slice(0,3).forEach(({l,sg},i)=>{const h='#song-'+slug(inst+'-'+sg[0]);out.push({key:'s:'+h,kind:'song',href:h,title:`${sg[0]} (${l.name})`,why:i===0?why:sg[2]||'',auto:(store.get('songsSeen',[])||[]).includes(h.slice(1))})})}
  else if(kind==='jam'){const id=[ref,...P.jam].find(j=>JAMS.find(x=>x.id===j));if(id){const J=JAMS.find(x=>x.id===id);out.push({key:'j:'+id,kind,href:'#tools-jam',jam:id,title:`Jam along: ${J.name}`,why})}}});
 return out}
const pathDoneMap=id=>((store.get('pathDone',{})||{})[id])||{};
const stepDone=(P,s)=>s.auto||!!pathDoneMap(P.id)[s.key];
function pathProgress(P){const S=pathSteps(P);const d=S.filter(s=>stepDone(P,s)).length;return{d,n:S.length,next:S.find(s=>!stepDone(P,s))}}
function viewPaths(){const cur=store.get('pathCur',null);
 main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Genre paths</span><h1>Pick a style and follow the route</h1><p class="lede">Each path strings together lessons, songs and jams in a sensible order for ${INST_NAME[INST_RAW()]||'your instrument'}.</p></div></div>
 <div class="pathgrid">${PATHS.map(P=>{const g=pathProgress(P);return`<a class="hcard pathcard ${cur===P.id?'cur':''}" href="#path-${P.id}"><span class="eyebrow">${cur===P.id?'Your current path':`${g.n} steps`}</span><b>${esc(P.name)}</b><span class="hint">${esc(P.blurb)}</span><i class="hbar"><i style="width:${g.n?Math.round(g.d/g.n*100):0}%"></i></i><small class="hint">${g.d} of ${g.n} done</small></a>`}).join('')}</div>`}
function viewPath(id){const P=PATHS.find(x=>x.id===id);if(!P){location.hash='#paths';return}store.set('pathCur',id);
 const render=()=>{const S=pathSteps(P),g=pathProgress(P);
  main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow"><a href="#paths">Genre paths</a></span><h1>${esc(P.name)}</h1><p class="lede">${esc(P.blurb)}</p></div></div>
  <div class="stack"><section class="panel"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${g.d} of ${g.n} steps done</h3>${g.next?`<a class="btn primary small" href="${g.next.href}" data-jam="${g.next.jam||''}">Next: ${esc(g.next.title)}</a>`:'<span class="hint">Path complete. Try another style.</span>'}</div><i class="hbar" style="margin-top:10px"><i style="width:${g.n?Math.round(g.d/g.n*100):0}%"></i></i></section>
  <ol class="pathsteps">${S.map((s,i)=>{const dn=stepDone(P,s);return`<li class="${dn?'done':''} ${g.next===s?'next':''}"><span class="pnum">${dn?'✓':i+1}</span><div class="stack" style="gap:2px;flex:1"><a href="${s.href}" data-jam="${s.jam||''}"><b>${esc(s.title)}</b></a><span class="hint">${esc(s.why||'')}${s.auto?' · done':''}</span></div>${s.auto?'':`<label class="pill" style="cursor:pointer"><input type="checkbox" data-step="${esc(s.key)}" ${dn?'checked':''}> Done</label>`}</li>`}).join('')}</ol>
  <p class="hint">Lessons tick themselves off when you finish their “Try it” list, and songs when you open them. Tick the rest yourself.</p></div>`;
  main.querySelectorAll('[data-step]').forEach(c=>c.onchange=()=>{const A=store.get('pathDone',{})||{};A[P.id]=A[P.id]||{};if(c.checked)A[P.id][c.dataset.step]=1;else delete A[P.id][c.dataset.step];store.set('pathDone',A);render()});
  main.querySelectorAll('[data-jam]').forEach(a=>{if(a.dataset.jam)a.addEventListener('click',()=>{JAMPICK=a.dataset.jam})})};
 render()}
{const _r=route;route=function(){const h=location.hash.slice(1);if(h==='paths'||h.startsWith('path-')){stopSeq();stopLoop();stopDemo();QUIZ=null;clearInterval(WU_T);focusOff();renderChrome('paths');if(h==='paths')viewPaths();else viewPath(h.slice(5));return}_r()}}

/* ---------- Home: this week ---------- */
function weekSummaryHTML(){const L=store.get('plog',{})||{};const now=new Date();const mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7));
 const days=[];for(let i=0;i<7;i++){const d=new Date(mon);d.setDate(mon.getDate()+i);days.push(d)}
 const secs=k=>L[k]||0;const thisW=days.reduce((a,d)=>a+secs(todayKey(d)),0);let lastW=0;for(let i=1;i<=7;i++){const d=new Date(mon);d.setDate(mon.getDate()-i);lastW+=secs(todayKey(d))}
 const logs=days.map(d=>alogDay(todayKey(d)));const ticks=logs.reduce((a,x)=>a+x.ticks,0);const lessons=new Set(logs.flatMap(x=>x.lessons));const songs=new Set(logs.flatMap(x=>x.songs));const loops=logs.reduce((a,x)=>a+x.loops,0);
 const pk=logs.filter(x=>x.pkLast).map(x=>x.pkLast).pop();const tr=logs.flatMap(x=>x.tr).sort((a,b)=>b.bpm-a.bpm);
 const tm=Math.round(thisW/60),lm=Math.round(lastW/60);const diff=lm?Math.round((tm-lm)/lm*100):null;const today=todayKey();
 const P=PATHS.find(x=>x.id===store.get('pathCur',null));const pg=P&&pathProgress(P);
 const pkEver=(store.get('pkhist',[])||[]).length;const due=srsDue().length;
 const realInst=['guitar','bass','piano','drums'].includes(INST_RAW());const next=due?{h:'#review',t:`${due} review${due>1?'s':''} due`,s:'Quick replays so things stick.'}:!pkEver&&realInst?{h:'#learn-gv-pocket',t:'Check your pocket',s:'See how early or late you really play.'}:pg&&pg.next?{h:pg.next.href,t:pg.next.title,s:`Next on your ${P.name} path`,jam:pg.next.jam}:!P?{h:'#paths',t:'Pick a genre path',s:'A route through lessons, songs and jams.'}:null;
 const stat=(b,s)=>`<div><b>${b}</b><span>${s}</span></div>`;
 return`<section class="panel wsum"><div class="row" style="justify-content:space-between;align-items:baseline"><h3 style="margin:0">This week</h3><span class="hint">${diff==null?'':diff>=0?`Up ${diff}% on last week`:`Down ${Math.abs(diff)}% on last week`}</span></div>
  <div class="wdays">${days.map(d=>{const k=todayKey(d);const m=Math.round(secs(k)/60);return`<span class="wday ${m>0?'on':''} ${k===today?'today':''}" title="${m} min"><i style="--h:${Math.min(100,m/45*100)}%"></i><small>${d.toLocaleDateString(undefined,{weekday:'narrow'})}</small></span>`}).join('')}</div>
  <div class="wstats">${stat(tm+' min','practised')}${stat(ticks,'tasks ticked')}${stat(lessons.size,'lessons worked on')}${stat(songs.size,'songs opened')}${loops?stat(loops,'clean loops'):''}</div>
  ${pk||tr.length?`<div class="wrec">${pk?`<span>Pocket: <b>${gvMs(Math.round(pk.avg))}</b>, ±${Math.round(pk.sd)} ms at ${pk.bpm} BPM</span>`:''}${tr.length?`<span>Tempo record: <b>${esc(tr[0].t)}</b> at ${tr[0].bpm} BPM${tr.length>1?` (+${tr.length-1} more)`:''}</span>`:''}</div>`:''}
  ${pg?`<a class="wpath" href="#path-${P.id}"><span class="eyebrow">${esc(P.name)} path</span><i class="hbar"><i style="width:${Math.round(pg.d/pg.n*100)}%"></i></i><small class="hint">${pg.d} of ${pg.n}</small></a>`:''}
  ${next?`<a class="wnext" href="${next.h}" data-jam="${next.jam||''}"><span class="eyebrow">Suggested next</span><b>${esc(next.t)}</b><span class="hint">${esc(next.s)}</span></a>`:''}</section>`}


/* ---------- jam: shared chord chart ---------- */
const JC_MAX=32;
function jcParse(txt){const toks=String(txt||'').split(/[\s|,]+/).filter(Boolean).slice(0,JC_MAX);const bad=[];const out=[];
 toks.forEach(t=>{if(t==='%'||t==='-'){out.push('%');return}const c=parseChord(t);if(c)out.push(c.sym||t);else bad.push(t)});return{chart:out,bad}}
{const _c=joChordAt;joChordAt=function(s,bar){const C=s&&Array.isArray(s.chart)&&s.chart.length?s.chart:null;if(!C)return _c(s,bar);const n=C.length;let i=((bar%n)+n)%n,k=0;while(C[i]==='%'&&k<n){i=(i-1+n)%n;k++}return C[i]==='%'?null:parseChord(C[i])}}
{const _b=joSyncBars;joSyncBars=function(s){if(s&&s.bars==='cycle'&&Array.isArray(s.chart)&&s.chart.length)return s.chart.length;return _b(s)}}
if(typeof natSess==='function'){const _n=natSess;natSess=function(s){const o=_n(s);if(o&&s&&Array.isArray(s.chart)&&s.chart.length)o.bass=s.chart.map((_,i)=>{const ch=joChordAt(s,i);return ch?28+((parse(ch.root).pc-4+12)%12):-1});return o}}
const jcBars=s=>{if(!s)return 0;if(Array.isArray(s.chart)&&s.chart.length)return s.chart.length;const st=joStyle(s);return st.prog?st.prog.length:0};
function jcPresets(s){const st=joStyle(s);const mode=st.mode||'major';const key=normKey(s.key||'A',mode);const at=(d,t,m=mode)=>{try{const c=chordAt(normKey(key,m),m,d,t);return c.sym}catch(e){return null}};
 const maj=mode==='major'?key:key;return[['pop','Pop (I–V–vi–IV)',[at(1,null,'major'),at(5,null,'major'),at(6,null,'major'),at(4,null,'major')]],['blues','12-bar blues',[1,1,1,1,4,4,1,1,5,4,1,5].map(d=>at(d,'7','major'))],['jazz','Jazz ii–V–I',[at(2,'m7','major'),at(5,'7','major'),at(1,'maj7','major'),at(1,'maj7','major')]],['minor','Minor (i–VI–III–VII)',[at(1,null,'minor'),at(6,null,'minor'),at(3,null,'minor'),at(7,null,'minor')]]].filter(p=>p[2].every(Boolean))}
function jcPanelHTML(){const s=JO.sess;if(!s)return'';const n=jcBars(s);const custom=Array.isArray(s.chart)&&s.chart.length;
 const cells=Array.from({length:n},(_,i)=>{const c=s.chart&&s.chart.length?s.chart[i]:null;const ch=joChordAt(s,i);return`<span class="jcbar" data-b="${i}"><small>${i+1}</small><b>${c==='%'?'%':ch?esc(pr(ch.sym)):'–'}</b></span>`}).join('');
 return`<section class="panel" id="jchart"><div class="row" style="justify-content:space-between;align-items:baseline"><h3 style="margin:0">Chord chart</h3><span class="hint">${custom?'The host’s chords':s.style==='click'?'No chords with click only':'From the backing style'}${n?` · ${n} bars, then repeat`:''}</span></div>
  ${n?`<div class="jcgrid">${cells}</div><p class="hint jcnext" aria-live="polite"></p>`:'<p class="hint">Pick a backing style, or the host can type in chords.</p>'}
  ${JO.host?`<details class="more" ${custom?'open':''}><summary>Write your own chords</summary><div class="stack" style="gap:8px"><p class="hint">One chord per bar, separated by spaces or bars. Use % to repeat the previous bar. Everyone sees it, and the backing bass and chords follow it.</p>
   <div class="row" style="gap:8px;flex-wrap:wrap"><input id="jctxt" style="flex:1;min-width:220px" value="${esc(custom?s.chart.join(' | '):'')}" placeholder="Am | F | C | G"><button class="btn small primary" id="jcset">Use these chords</button>${custom?'<button class="btn small" id="jcclr">Back to the style’s chords</button>':''}</div>
   <div class="row" style="gap:6px;flex-wrap:wrap"><span class="hint">Quick start:</span>${jcPresets(s).map(([k,t,c])=>`<button class="pill" data-jcp="${esc(c.join(' '))}">${esc(t)}</button>`).join('')}</div><p class="hint" id="jcerr"></p></div></details>`:''}</section>`}
function jcBind(el){const $=q=>el.querySelector(q);const set=$('#jcset');if(set)set.onclick=()=>{const{chart,bad}=jcParse($('#jctxt').value);const e=$('#jcerr');if(bad.length){e.textContent=`I don’t recognise: ${bad.slice(0,4).join(', ')}. Try names like Am, F#m7, Bb, G7, Cmaj7.`;return}if(!chart.length){e.textContent='Type at least one chord.';return}joChange({chart})};
 const clr=$('#jcclr');if(clr)clr.onclick=()=>joChange({chart:null});el.querySelectorAll('[data-jcp]').forEach(b=>b.onclick=()=>{const t=$('#jctxt');t.value=b.dataset.jcp.split(' ').join(' | ')})}
let JC_RAF=0;function jcAnim(){cancelAnimationFrame(JC_RAF);let last=-2;const step=()=>{const el=JO.el&&JO.el.querySelector('#jchart');if(!el){JC_RAF=0;return}const s=JO.sess;let cur=-1,nx='';
  if(s&&s.playing&&(JO.host||JO.offOk)){const n=jcBars(s);const barMs=s.beats*60000/s.bpm,x=(joNow()-s.t0)/barMs;if(x>=0&&n){const bar=Math.floor(x);cur=bar%n;const ch=joChordAt(s,bar+1);const beat=Math.floor((x-bar)*s.beats)+1;nx=ch&&beat===s.beats?`Next: ${pr(ch.sym)}`:''}}
  if(cur!==last){el.querySelectorAll('.jcbar').forEach(b=>b.classList.toggle('now',+b.dataset.b===cur));last=cur}const ne=el.querySelector('.jcnext');if(ne&&ne.textContent!==nx)ne.textContent=nx;JC_RAF=requestAnimationFrame(step)};JC_RAF=requestAnimationFrame(step)}

/* ---------- jam: recording ---------- */
const JR_W=`class R extends AudioWorkletProcessor{constructor(){super();this.on=0;this.at=0;this.end=1e12;this.buf=new Int16Array(24000);this.n=0;this.port.onmessage=e=>{const d=e.data;if(d.start!=null){this.at=d.start;this.on=1}if(d.stop!=null)this.end=d.stop}}
flush(){if(this.n){const b=this.buf.slice(0,this.n);this.port.postMessage({pcm:b},[b.buffer]);this.n=0}}
process(ins){if(!this.on)return true;const inp=ins[0]||[];const nc=inp.length;const sr=sampleRate;for(let i=0;i<128;i++){const t=currentTime+i/sr;if(t<this.at)continue;if(t>=this.end){this.flush();this.port.postMessage({done:1});this.on=0;return true}let v=0;for(let c=0;c<nc;c++)v+=inp[c][i];if(nc)v/=nc;v=v>1?1:v<-1?-1:v;this.buf[this.n++]=v*32767;if(this.n===this.buf.length)this.flush()}return true}}registerProcessor('tc-rec',R)`;
const JR={on:false,t0:0,tracks:[],done:[],ctx:null,timer:0,native:null,nres:null,err:''};
async function jrModule(c){if(JR.ctx===c)return true;try{await c.audioWorklet.addModule(URL.createObjectURL(new Blob([JR_W],{type:'application/javascript'})))}catch(e){try{await c.audioWorklet.addModule('data:application/javascript;charset=utf-8,'+encodeURIComponent(JR_W))}catch(e2){return false}}JR.ctx=c;return true}
function jrTrack(name,src,shift){const c=AC;const n=new AudioWorkletNode(c,'tc-rec',{numberOfInputs:1,numberOfOutputs:1,channelCount:2,channelCountMode:'explicit'});const z=c.createGain();z.gain.value=0;src.connect(n);n.connect(z);z.connect(c.destination);
 const T={name,node:n,src,z,chunks:[],len:0,pad:0,shift:shift||0,done:false};n.port.onmessage=e=>{if(e.data.pcm){T.chunks.push(e.data.pcm);T.len+=e.data.pcm.length}else if(e.data.done){T.done=true}};
 const at=Math.max(JR.t0,c.currentTime+.05);T.pad=Math.round((at-JR.t0)*c.sampleRate);n.port.postMessage({start:at});JR.tracks.push(T);return T}
async function jrStart(){JR.err='';JR.done.forEach(d=>URL.revokeObjectURL(d.url));JR.done=[];JR.nres=null;
 if(JO.native&&typeof natCall==='function'){const d=new Date();const folder=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}-${String(d.getSeconds()).padStart(2,'0')}`;
  try{JR.native=await natCall('rec_start',{folder,me:JO.me.name||'Me'});JR.on=true;JR.t0=performance.now()}catch(e){JR.err=String(e)}jrPaint();return}
 const c=audio();if(!c||!c.audioWorklet){JR.err='This browser can’t record here. Try Chrome or Edge.';jrPaint();return}if(!(await jrModule(c))){JR.err='Couldn’t start the recorder.';jrPaint();return}
 JR.tracks=[];JR.t0=c.currentTime+.15;JR.on=true;
 jrTrack('Backing',MASTER,0);if(JO.inp&&JO.inp.stream)jrTrack(`${JO.me.name||'You'} (you)`,JO.inp.amp,Math.max(0,joRt()));
 Object.values(JO.peers).forEach(P=>{if(P.node&&P.node.d)P.recT=jrTrack(P.name||'Player',P.node.d,0)});jrPaint()}
async function jrStop(){if(!JR.on)return;JR.on=false;
 if(JO.native&&JR.native){try{JR.nres=await natCall('rec_stop')}catch(e){JR.err=String(e)}JR.native=null;jrPaint();return}
 const c=AC,end=c.currentTime+.05;JR.tracks.forEach(T=>T.node.port.postMessage({stop:end}));await new Promise(r=>setTimeout(r,300));
 const sr=c.sampleRate,total=Math.max(...JR.tracks.map(T=>T.pad+T.len));
 const pcm=T=>{const out=new Int16Array(total);let o=T.pad-Math.round(T.shift*sr);for(const ch of T.chunks){for(let i=0;i<ch.length;i++,o++)if(o>=0&&o<total)out[o]=ch[i]}return out};
 const wav=(d)=>{const b=new ArrayBuffer(44+d.length*2),v=new DataView(b);const w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+d.length*2,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,d.length*2,true);new Int16Array(b,44).set(d);return new Blob([b],{type:'audio/wav'})};
 const stamp=new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');const fn=n=>`theory-club-jam-${stamp}-${n.replace(/[^\w ()-]/g,'').replace(/\s+/g,'-').toLowerCase()}.wav`;
 const all=JR.tracks.map(T=>({name:T.name,d:pcm(T)}));const mix=new Int16Array(total);all.forEach(({d})=>{for(let i=0;i<total;i++){const s=mix[i]+d[i]*.8;mix[i]=s>32767?32767:s<-32768?-32768:s}});
 JR.done=[{name:'Mix',d:mix},...all].map(x=>{const blob=wav(x.d);return{name:x.name,blob,url:URL.createObjectURL(blob),file:fn(x.name)}});
 JR.tracks.forEach(T=>{try{T.src.disconnect(T.node);T.node.disconnect();T.z.disconnect()}catch(e){}});JR.tracks=[];Object.values(JO.peers).forEach(P=>P.recT=null);
 const m=JR.done[0];takeSave({id:Date.now().toString(36)+'jam',title:`Jam ${new Date().toLocaleString([], {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}`,bpm:JO.sess?JO.sess.bpm:null,score:null,at:Date.now(),type:'audio/wav'},m.blob);jrPaint()}
{const _a=joAttach;joAttach=function(P,stream,rec){_a(P,stream,rec);if(JR.on&&!JO.native&&P.node&&P.node.d&&!P.recT&&JR.ctx===AC)P.recT=jrTrack(P.name||'Player',P.node.d,0)}}
const jrClock=()=>{const s=JO.native?(JR.on?(performance.now()-JR.t0)/1000:0):(JR.on&&AC?Math.max(0,AC.currentTime-JR.t0):0);return`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`};
function jrPanelHTML(){const nat=JO.native&&typeof natCall==='function';const n=nat?null:JR.done.length;
 return`<section class="panel" id="jrec"><div class="row" style="justify-content:space-between;align-items:center"><h3 style="margin:0">Record the jam</h3><div class="row" style="gap:10px;align-items:center">${JR.on?`<span class="jrdot"></span><b id="jrt">${jrClock()}</b>`:''}<button class="btn ${JR.on?'':'primary'} small" id="jrgo">${JR.on?'■ Stop recording':'● Record'}</button></div></div>
  <p class="hint">${nat?'Saves one WAV file per player plus the backing, lined up exactly as you heard them, ready to drop into a DAW.':'Records each player, you and the backing as separate WAV files, lined up the way you heard them. The mix is also saved to Recordings.'} The files stay on your computer, and the others see that you’re recording.</p>${Object.values(JO.peers).filter(P=>P.rec).length?`<p class="callout">${Object.values(JO.peers).filter(P=>P.rec).map(P=>esc(P.name||'A player')).join(', ')} ${Object.values(JO.peers).filter(P=>P.rec).length>1?'are':'is'} recording this jam.</p>`:''}
  ${JR.err?`<p class="callout">${esc(JR.err)}</p>`:''}
  ${nat&&JR.on&&JR.native?`<p class="hint">Saving to ${esc(JR.native)}</p>`:''}
  ${nat&&JR.nres?`<div class="jrfiles"><p class="o">${JR.nres.files.length} files, ${Math.round(JR.nres.seconds)} seconds.</p><ul>${JR.nres.files.map(f=>`<li>${esc(f.name)}</li>`).join('')}</ul><button class="btn small" id="jropen">Show in folder</button></div>`:''}
  ${!nat&&JR.done.length?`<div class="jrfiles">${JR.done.map((d,i)=>`<div class="take"><b>${esc(d.name)}</b><audio controls src="${d.url}"></audio><a class="btn small" href="${d.url}" download="${esc(d.file)}">Download</a></div>`).join('')}<button class="btn small" id="jrall" style="align-self:flex-start">Download all ${JR.done.length} files</button></div>`:''}</section>`}
function jrPaint(){const el=JO.el&&JO.el.querySelector('#jrec');if(!el)return;el.outerHTML=jrPanelHTML();jrBind()}
function jrBind(){const el=JO.el;if(!el)return;const g=el.querySelector('#jrgo');if(g)g.onclick=()=>{if(JR.on)jrStop();else jrStart()};
 const o=el.querySelector('#jropen');if(o)o.onclick=()=>natCall('rec_open',{path:JR.nres.dir}).catch(e=>{JR.err=String(e);jrPaint()});
 const a=el.querySelector('#jrall');if(a)a.onclick=()=>{el.querySelectorAll('.jrfiles a[download]').forEach((x,i)=>setTimeout(()=>x.click(),i*400))};
 clearInterval(JR.timer);if(JR.on)JR.timer=setInterval(()=>{const t=JO.el&&JO.el.querySelector('#jrt');if(!t){return}t.textContent=jrClock()},500)}
{const _l=joLeave;joLeave=function(q){if(JR.on)jrStop();return _l(q)}}
{const _s=jrStart,_t=jrStop;jrStart=async function(){await _s();if(JR.on)joBroadcast({k:'rec',on:true})};jrStop=async function(){const w=JR.on;await _t();if(w)joBroadcast({k:'rec',on:false})}}
{const _c=joCtl;joCtl=function(P,m){if(m&&m.k==='rec'){P.rec=!!m.on;jrPaint();return}return _c(P,m)}}

/* add both panels to the room page */
{const _r=joRender;joRender=function(){_r();const el=JO.el;if(!el||!document.body.contains(el)||JO.status!=='in'||!JO.sess)return;const beat=el.querySelector('#jobeat');const sp=beat&&beat.closest('section');
 if(sp&&!el.querySelector('#jchart')){sp.insertAdjacentHTML('afterend',jcPanelHTML());jcBind(el);jcAnim()}
 const ch=el.querySelector('#jchart');if(ch&&!el.querySelector('#jrec')){ch.insertAdjacentHTML('afterend',jrPanelHTML());jrBind()}}}

/* ---------- singing: pitch matching, warm-ups, intervals, harmony ---------- */
const SV_TYPES=[['low','Low voice',48,'Bass or baritone: most men'],['mid','Middle voice',55,'Tenor, or a low alto'],['high','High voice',62,'Alto or soprano: most women and children']];
const svType=()=>store.get('svtype','mid');
const svCentre=()=>(SV_TYPES.find(x=>x[0]===svType())||SV_TYPES[1])[2];
const svMidiNow=()=>INPUT.active&&INPUT.midi!=null&&INPUT.hz>0?69+12*Math.log2(INPUT.hz/440):null;
const svName=m=>{const r=Math.round(m);return`${SHARPN[((r%12)+12)%12]}${Math.floor(r/12)-1}`};
const svFold=(m,target)=>{let d=m-target;d-=12*Math.round(d/12);return target+d};
const svCss=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim()||'#888';
function svTypeHTML(){return`<div class="gvrow"><span class="eyebrow">Your voice</span>${pillsHTML('svt',SV_TYPES.map(x=>[x[0],x[1]]),svType())}<span class="hint">${esc((SV_TYPES.find(x=>x[0]===svType())||[])[3]||'')}</span></div>`}
function svInputHTML(){if(IN_CLAUDE())return`<p class="callout">Inside Claude this page can’t use your microphone. Open Theory Club on the website or in the desktop app to sing with live pitch.</p>`;return inputPanelHTML()}
function svPlayNote(m,t,dur){tone(m,t,dur,.32,'piano')}

/* a scrolling lane: target notes as bars, your voice as a line */
function svLane(host,opts){const W=760,H=220,PXS=110;let raf=0,pts=[],plan=null,res=null;
 const cv=document.createElement('canvas');cv.className='svlane';cv.width=W*2;cv.height=H*2;host.appendChild(cv);const g=cv.getContext('2d');g.scale(2,2);
 const draw=()=>{const c=AC;if(!c||!plan){raf=0;return}const now=c.currentTime,lat=(INPUT.lat||.06);const tNow=now-lat;
  const m=svMidiNow();if(m!=null&&tNow>=plan.t0-.5&&tNow<=plan.t1+.3){const tgt=plan.notes.find(n=>tNow>=n.t&&tNow<n.t+n.d&&n.sing);pts.push({t:tNow,m:tgt?svFold(m,tgt.m):m,ok:tgt?Math.abs(svFold(m,tgt.m)-tgt.m)<.5:false})}
  const lo=plan.lo-3,hi=plan.hi+3,y=v=>H-14-(v-lo)/(hi-lo)*(H-28),x=t=>W*.3+(t-now)*PXS;
  g.clearRect(0,0,W,H);g.fillStyle=svCss('--surface-2');g.fillRect(0,0,W,H);
  g.font='11px system-ui';for(let v=Math.ceil(lo);v<=hi;v++){g.strokeStyle=svCss('--line');g.lineWidth=v%12===0?1.2:.5;g.beginPath();g.moveTo(0,y(v));g.lineTo(W,y(v));g.stroke();if([0,4,7].includes(((v%12)+12)%12)){g.fillStyle=svCss('--muted');g.fillText(svName(v),4,y(v)-2)}}
  plan.notes.forEach(n=>{const x0=x(n.t),x1=x(n.t+n.d);if(x1<0||x0>W)return;g.fillStyle=n.sing?svCss('--accent'):svCss('--surface-3');g.globalAlpha=n.sing?(tNow>n.t+n.d?.45:.85):.9;
   if(n.glide!=null){g.strokeStyle=g.fillStyle;g.lineWidth=10;g.lineCap='round';g.beginPath();g.moveTo(x0,y(n.m));g.lineTo(x1,y(n.glide));g.stroke()}else{g.beginPath();g.roundRect?g.roundRect(x0,y(n.m)-6,Math.max(4,x1-x0-2),12,6):g.rect(x0,y(n.m)-6,Math.max(4,x1-x0-2),12);g.fill()}g.globalAlpha=1;
   if(n.label&&x0>-40){g.fillStyle=svCss('--muted');g.fillText(n.label,x0+2,y(n.m)-10)}});
  g.lineWidth=3;g.lineCap='round';for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];if(b.t-a.t>.2)continue;const xa=x(a.t),xb=x(b.t);if(xb<0)continue;g.strokeStyle=b.ok?svCss('--good'):svCss('--root');g.beginPath();g.moveTo(xa,y(a.m));g.lineTo(xb,y(b.m));g.stroke()}
  g.strokeStyle=svCss('--ink');g.globalAlpha=.35;g.lineWidth=1.5;g.beginPath();g.moveTo(W*.3,0);g.lineTo(W*.3,H);g.stroke();g.globalAlpha=1;
  const ph=plan.notes.find(n=>tNow>=n.t&&tNow<n.t+n.d);const st=host.querySelector('.svst');if(st)st.textContent=tNow<plan.t0?'Get ready…':ph?(ph.sing?(m!=null?`You: ${svName(m)} · target ${svName(ph.m)}`:`Sing ${svName(ph.m)}`):'Listen…'):'';
  if(now>plan.t1+.6){finish();return}raf=requestAnimationFrame(draw)};
 const finish=()=>{cancelAnimationFrame(raf);raf=0;if(!plan)return;const P=plan;plan=null;let tot=0,ok=0;P.notes.filter(n=>n.sing).forEach(n=>{const a=n.t+n.d*.15,b=n.t+n.d*.85;const inn=pts.filter(p=>p.t>=a&&p.t<=b);const slots=Math.max(1,Math.round((b-a)*15));tot+=slots;
   const good=n.glide!=null?inn.filter(p=>{const f=(p.t-n.t)/n.d;const tg=n.m+(n.glide-n.m)*f;return Math.abs(svFold(p.m,tg)-tg)<.6}).length:inn.filter(p=>p.ok).length;ok+=Math.min(slots,good*slots/Math.max(1,(b-a)*15))});
  res={pct:Math.round(ok/Math.max(1,tot)*100),heard:pts.length>5};opts.onDone&&opts.onDone(res)};
 return{play(notes,{lo,hi}){cancelAnimationFrame(raf);pts=[];const c=audio();if(!c)return;const t0=c.currentTime+.6;const N=notes.map(n=>({...n,t:t0+n.t}));
   N.forEach(n=>{if(!n.play)return;if(n.glide!=null)svGlide(n.m,n.glide,n.t,n.d);else svPlayNote(n.m,n.t,n.d*.95)});plan={notes:N,t0,t1:Math.max(...N.map(n=>n.t+n.d)),lo,hi};raf=requestAnimationFrame(draw)},
  stop(){if(plan){plan.t1=0}},busy:()=>!!plan,el:cv}}

/* pitch matching: hear a note, sing it, hold it in tune for a second */
WIDGETS.pitchmatch=host=>{let target=null,hold=0,last=0,streak=0,best=+store.get('svbest',0)||0,raf=0;
 const pick=()=>{const c=svCentre();let m;do{m=c-5+Math.floor(Math.random()*13)}while(target&&m===target);target=m;hold=0;const a=audio();if(a)svPlayNote(m,a.currentTime+.05,1.4)};
 const render=()=>{host.innerHTML=`<h3>Match the note</h3><p class="hint">Hear a note, then sing it on “ah”. Hold it in tune for a second to score. Any octave counts.</p>${svTypeHTML()}${svInputHTML()}
  <div class="pmwrap"><div class="pmnote"><span class="eyebrow">Target</span><b id="pmt">${target!=null?svName(target):'–'}</b><button class="btn small" id="pmagain" ${target==null?'disabled':''}>Hear it again</button></div>
  <div class="pmmeter"><div class="pmscale"><span>Flat</span><span>In tune</span><span>Sharp</span></div><div class="pmtrack"><i class="pmzone"></i><i class="pmneedle" id="pmn"></i></div><div class="pmhold"><i id="pmh"></i></div><p class="hint" id="pms" aria-live="polite">${LISTEN()?'Press Start.':'Connect your microphone first.'}</p></div></div>
  <div class="row"><button class="btn primary small" id="pmgo" ${LISTEN()?'':'disabled'}>${target==null?'Start':'Next note'}</button><span class="hint">Streak <b id="pmsk">${streak}</b> · best ${best}</span></div>`;
  bindPills(host,(g,v)=>{store.set('svtype',v);target=null;render()});const ip=host.querySelector('.inpanel');if(ip)bindInputPanel(ip,()=>{});
  host.querySelector('#pmgo').onclick=()=>{pick();host.querySelector('#pmt').textContent=svName(target);host.querySelector('#pmagain').disabled=false;host.querySelector('#pmgo').textContent='Skip';loop()};
  host.querySelector('#pmagain').onclick=()=>{const a=audio();if(a&&target!=null)svPlayNote(target,a.currentTime+.05,1.4)}};
 const loop=()=>{cancelAnimationFrame(raf);last=performance.now();const step=()=>{if(!host.isConnected)return;const now=performance.now(),dt=(now-last)/1000;last=now;const m=svMidiNow();const n=host.querySelector('#pmn'),h=host.querySelector('#pmh'),s=host.querySelector('#pms');
   if(target!=null&&m!=null){const d=(svFold(m,target)-target)*100;n.style.left=`${50+Math.max(-50,Math.min(50,d))}%`;n.classList.toggle('ok',Math.abs(d)<25);if(Math.abs(d)<25)hold+=dt;else hold=Math.max(0,hold-dt*.5);s.textContent=Math.abs(d)<25?'Hold it…':Math.abs(d)>=80?`Too ${d<0?'low':'high'} by about ${Math.round(Math.abs(d)/100)} semitone${Math.round(Math.abs(d)/100)>1?'s':''}: ${d<0?'slide up':'come down'} slowly`:d<0?`A little flat (${Math.round(-d)} cents): lift it`:`A little sharp (${Math.round(d)} cents): relax it down`}
   else{hold=Math.max(0,hold-dt*.5);if(s&&target!=null)s.textContent='Sing on “ah”…'}
   if(h)h.style.width=Math.min(100,hold*100)+'%';
   if(hold>=1){streak++;if(streak>best){best=streak;store.set('svbest',best)}s.textContent=`In tune: ${svName(target)} ✓`;host.querySelector('#pmsk').textContent=streak;hold=0;const t=target;setTimeout(()=>{if(!host.isConnected||target!==t)return;pick();const e=host.querySelector('#pmt');if(e)e.textContent=svName(target)},900)}
   raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)};
 const re=()=>{if(!host.isConnected){INPUT.listeners.delete(re);return}const b=host.querySelector('#pmgo');if(b&&b.disabled===LISTEN())render()};INPUT.listeners.add(re);
 render()};

/* sequences for the lane: [semitone, beats] relative to a start note */
const SV_WARM=[['scale5','5-note scale','1-2-3-4-5-4-3-2-1 on “ah”, then up a semitone.',[[0,1],[2,1],[4,1],[5,1],[7,1],[5,1],[4,1],[2,1],[0,2]]],
 ['arp','Arpeggio','1-3-5-8-5-3-1: wider jumps, keep the tone even.',[[0,1],[4,1],[7,1],[12,2],[7,1],[4,1],[0,2]]],
 ['siren','Siren','Glide smoothly up a fifth and back, like a siren, on “ng” or “oo”.',[['g',0,7,3],['g',7,0,3]]],
 ['thirds','Thirds','1-3-2-4-3-5-4-2-1: trains your ear to step and skip.',[[0,1],[4,1],[2,1],[5,1],[4,1],[7,1],[5,1],[2,1],[0,2]]]];
const svSeq=(pat,root,bpm,{call=true,reps=1,up=1}={})=>{const b=60/bpm;const out=[];let t=0;
 for(let r=0;r<reps;r++){const base=root+r*up;const notes=pat.map(p=>p[0]==='g'?{m:base+p[1],glide:base+p[2],d:p[3]*b}:{m:base+p[0],d:p[1]*b});
  if(call){notes.forEach(n=>{out.push({...n,t,play:true,sing:false});t+=n.d});t+=b}
  notes.forEach(n=>{out.push({...n,t,play:!call,sing:true});t+=n.d});t+=b}
 return out};
const svRange=N=>{const ms=N.flatMap(n=>[n.m,n.glide??n.m]);return{lo:Math.min(...ms),hi:Math.max(...ms)}};
function svLaneWidget(host,{title,hint,items,build,extra}){let cur=items[0][0],call=true,bpm=84,lane=null,last=null;
 const render=()=>{const it=items.find(x=>x[0]===cur);host.innerHTML=`<h3>${esc(title)}</h3><p class="hint">${esc(hint)}</p>${svTypeHTML()}${svInputHTML()}
  ${pillsHTML('svi',items.map(x=>[x[0],x[1]]),cur)}<p class="o">${esc(it[2])}</p>${extra?extra():''}
  <div class="row"><button class="btn primary small" id="svgo">${ICON.play} Start</button>${pillsHTML('svm',[['call','Listen, then sing'],['along','Sing along']],call?'call':'along')}
  <label class="row hint" style="gap:6px">Tempo <input type="range" id="svbpm" min="50" max="130" step="2" value="${bpm}" style="width:110px"> <span id="svbv">${bpm}</span></label></div>
  <div class="svhost"></div><div class="row"><span class="hint svst" aria-live="polite">${LISTEN()?'':'Connect your microphone to see your pitch. You can still listen and sing.'}</span></div><p class="o svres" aria-live="polite">${last?resTxt(last):''}</p>`;
  lane=svLane(host.querySelector('.svhost'),{onDone:r=>{last=r;const e=host.querySelector('.svres');if(e)e.textContent=resTxt(r);const b=host.querySelector('#svgo');if(b)b.innerHTML=ICON.play+' Again'}});
  bindPills(host,(g,v)=>{if(g==='svt')store.set('svtype',v);else if(g==='svi')cur=v;else if(g==='svm')call=v==='call';else if(extra&&extra.onPill)extra.onPill(g,v);render()});
  const ip=host.querySelector('.inpanel');if(ip)bindInputPanel(ip,()=>render());
  const sl=host.querySelector('#svbpm');sl.oninput=()=>{bpm=+sl.value;host.querySelector('#svbv').textContent=bpm};
  host.querySelector('#svgo').onclick=()=>{if(lane.busy()){lane.stop();return}const N=build(cur,{call,bpm});lane.play(N,svRange(N));host.querySelector('#svgo').textContent='Stop';const e=host.querySelector('.svres');if(e)e.textContent=''}};
 const resTxt=r=>!r.heard?(LISTEN()?'I didn’t hear you sing. Check the level in input settings.':''):r.pct>=85?`${r.pct}% in tune. Lovely: try it a step higher.`:r.pct>=60?`${r.pct}% in tune. Nearly there: sing the hard notes slowly on their own.`:`${r.pct}% in tune. Slow it down and use “Listen, then sing”.`;
 render()}
WIDGETS.vwarm=host=>svLaneWidget(host,{title:'Warm up',hint:'Each pattern is played, then you sing it back. It moves up a semitone each time. Stop if anything strains.',items:SV_WARM,
 build:(cur,{call,bpm})=>{const it=SV_WARM.find(x=>x[0]===cur);const pat=it[3];const span=Math.max(...pat.flatMap(p=>p[0]==='g'?[p[1],p[2]]:[p[0]]));return svSeq(pat,svCentre()-Math.round(span/2)-1,bpm,{call,reps:3,up:1})}});
const SV_INTS=[['m3','Minor 3rd',3],['M3','Major 3rd',4],['P4','Perfect 4th',5],['P5','Perfect 5th',7],['M6','Major 6th',9],['oct','Octave',12],['m2','Half step',1],['M2','Whole step',2]];
WIDGETS.vint=host=>svLaneWidget(host,{title:'Sing intervals',hint:'Sing the low note, then jump to the high one and back. Think of a song that starts with that jump.',items:SV_INTS.map(([k,n,s])=>[k,n,{1:'Jaws theme.',2:'Happy Birthday: “Hap-py”.',3:'Greensleeves: the first two notes.',4:'Oh When the Saints: “Oh when”.',5:'Here Comes the Bride.',7:'Twinkle Twinkle: “Twin-kle, twin-kle”.',9:'My Bonnie Lies over the Ocean.',12:'Somewhere over the Rainbow: “Some-where”.'}[s]]),
 build:(cur,{call,bpm})=>{const s=SV_INTS.find(x=>x[0]===cur)[2];const r=svCentre()-Math.round(s/2);return svSeq([[0,1],[s,2],[0,2]],r,bpm,{call,reps:3,up:2})}});
/* harmony: a public-domain melody with a line a third above or below */
const SV_TUNES=[['ode','Ode to Joy (Beethoven)',[[4,1],[4,1],[5,1],[7,1],[7,1],[5,1],[4,1],[2,1],[0,1],[0,1],[2,1],[4,1],[4,1.5],[2,.5],[2,2]]],
 ['twinkle','Twinkle Twinkle (traditional)',[[0,1],[0,1],[7,1],[7,1],[9,1],[9,1],[7,2],[5,1],[5,1],[4,1],[4,1],[2,1],[2,1],[0,2]]],
 ['grace','Amazing Grace (traditional)',[[-5,1],[0,2],[4,.5],[0,.5],[4,2],[2,1],[0,2],[-3,1],[-5,3]]]];
const svDia=[0,2,4,5,7,9,11];const svThird=(s,dir)=>{const o=Math.floor(s/12),pc=((s%12)+12)%12;let i=svDia.indexOf(pc);if(i<0)return s+(dir>0?3:-3);const j=i+2*dir;const oct=Math.floor(j/7);return o*12+svDia[((j%7)+7)%7]+12*oct};
let SV_PART='above';
WIDGETS.vharm=host=>{const ex=()=>`<div class="gvrow"><span class="eyebrow">You sing</span>${pillsHTML('svp',[['melody','The melody'],['above','A third above'],['below','A third below']],SV_PART)}</div>`;ex.onPill=(g,v)=>{if(g==='svp')SV_PART=v};
 svLaneWidget(host,{title:'Sing harmony',hint:'The piano plays the tune. Your line is shown as bars: sing it while the tune plays. In “Listen, then sing”, you hear your part first.',items:SV_TUNES.map(([k,n])=>[k,n,'']),extra:ex,
 build:(cur,{call,bpm})=>{const tune=SV_TUNES.find(x=>x[0]===cur)[2];const b=60/bpm;const root=svCentre()-4;let t=0;const mel=[],mine=[];
  tune.forEach(([s,d])=>{const dd=d*b;const h=SV_PART==='melody'?s:svThird(s,SV_PART==='above'?1:-1);mel.push({m:root+s,d:dd,t,play:true,sing:false});mine.push({m:root+h,d:dd,t,play:false,sing:true,label:''});t+=dd});
  if(!call)return[...mel,...mine];
  const pre=mine.map(n=>({...n,play:true,sing:false}));const off=t+2*b;return[...pre,...mel.map(n=>({...n,t:n.t+off})),...mine.map(n=>({...n,t:n.t+off}))]}})};
PL['sv-basics']={t:'Singing basics',intro:'Good singing starts with breath, posture and a relaxed throat. Get those right and pitch and tone get much easier.',
 ideas:[['Breathe low','Breathe into your belly and sides, not your shoulders. Your shoulders should stay still.'],['Stand tall, stay loose','Feet apart, knees soft, chin level. Tension in the jaw or neck pulls you off pitch.'],['Support','Let the air out steadily, as if blowing out a candle slowly without making it go out.'],['Warm up first','A few minutes of humming, lip trills and sirens protects your voice and makes high notes easier.']],
 try:['Breathe in for 4, out on a hiss for 8, five times.','Hum a comfortable note for as long as feels easy.','Do the warm-ups lesson before every singing session.','Record yourself singing a verse and listen back once.'],
 mistakes:['Pushing louder to reach high notes.','Singing through pain or hoarseness: stop and rest.','Lifting the chin for high notes.'],
 tip:'If a note feels tight, try it quieter, not louder. Volume comes from support, not squeezing.',widget:'pitchmatch',vq:'singing for beginners breathing posture'};
PL['sv-pitch']={t:'Matching pitch',intro:'Singing in tune is a skill, not a gift. It’s your ear and voice learning to agree, and it improves quickly with feedback.',
 ideas:[['Listen first','Hear the note in your head before you sing it.'],['Slide into it','If you’re unsure, start a little low and slide up until it locks in.'],['Any octave counts','Men often sing an octave below a piano note. That’s still matching.'],['Hum it','Humming is easier to tune than an open vowel. Hum, then open to “ah”.']],
 try:['Get a streak of 5 in the matcher above.','Match 10 notes humming, then 10 on “ah”.','Play a note on your instrument and sing it back.'],
 mistakes:['Singing louder when unsure: try softer.','Giving up when you can’t hear yourself: cover one ear.'],
 tip:'Cupping a hand behind one ear helps you hear your own voice much more clearly.',widget:'pitchmatch',vq:'how to sing in tune pitch matching'};
PL['sv-warmup']={t:'Vocal warm-ups',intro:'Warm-ups wake up your breath, loosen your voice and stretch your range gently. Five minutes before singing makes a big difference.',
 ideas:[['Start in the middle','Begin where your voice is comfortable and move outwards.'],['Lip trills and sirens','They keep the throat relaxed while the pitch moves.'],['Scales on vowels','“Ah”, “ee” and “oo” each train a different shape.'],['Stop before strain','Warm-ups should feel easy. If anything hurts, stop.']],
 try:['Do the 5-note scale three times, moving up.','Do sirens on “ng” until they feel smooth.','Sing the arpeggio getting 80% in tune.'],
 mistakes:['Starting with your highest notes.','Skipping warm-ups on busy days.'],
 tip:'Drink water and keep it slow. The aim is ease, not range.',widget:'vwarm',vq:'vocal warm up exercises'};
PL['sv-intervals']={t:'Singing intervals',intro:'Being able to sing an interval means you can sing any melody you read or imagine. Song references make each one easy to remember.',
 ideas:[['Use song openings','Each interval has a famous tune that starts with it. Sing the tune, then the interval.'],['Up and back','Sing up to the note and back down to check the root is still there.'],['Small first','Steps and thirds before sixths and octaves.'],['Hear it inside','Imagine the higher note before you sing it.']],
 try:['Sing each interval above with its song reference.','Get 80% in tune on the 5th and the octave.','Play a root on your instrument and sing a major 3rd above it.'],
 mistakes:['Landing sharp on big upward jumps.','Losing the root on the way back down.'],
 tip:'Big jumps are easier if you think of them as landing softly on the top note.',widget:'vint',vq:'singing intervals ear training'};
PL['sv-harmony']={t:'Harmony singing',intro:'Harmony singing means holding your own line while someone else sings the tune. Thirds above or below the melody are where most harmonies start.',
 ideas:[['Thirds','Sing the note two scale steps above or below the melody. It moves in parallel and sounds sweet.'],['Learn your part alone','Sing it with “Listen, then sing” until it’s secure.'],['Then add the tune','Sing along while the tune plays. If you drift onto the melody, slow down.'],['Blend','Match the lead singer’s vowel and volume so the voices merge.']],
 try:['Sing the melody of Ode to Joy, then the third above.','Sing the third below Twinkle Twinkle with the tune playing.','Sing a harmony to a song you know with the recording.'],
 mistakes:['Following the melody instead of your part.','Singing the harmony louder than the lead.'],
 tip:'Put one finger in an ear while you learn a harmony: it helps you hear your own line.',widget:'vharm',vq:'how to sing harmony'};
const LEARN_SING=['sv-basics','sv-pitch','sv-warmup','sv-intervals','sv-harmony'].map(k=>[k,PL[k].t]);
LEARN_SING.forEach(([k])=>{PAGES[k]=lessonPage(k);LEARN_INST.push([k,PL[k].t])});

/* ---------- Voice as an instrument ---------- */
INST_NAME.voice='Voice';INST_DESC.voice='Singing, any voice type';
INST_PRI.voice=LEARN_SING.map(x=>x[0]);
CURR.voice=[['Singing basics','sv-basics',['earint'],'Breathe in for 4, out on a hiss for 8, five times, then hum a comfortable note.'],['Matching pitch','sv-pitch',['earint'],'Get a streak of 5 in the note matcher.'],['Vocal warm-ups','sv-warmup',['scales'],'Sing the 5-note scale three times, moving up.'],['Notes on the staff','notes',['notes'],'Name the notes of a melody you know on the staff.'],['Intervals','intervals',['intervals','earint'],'Sing each interval from a note on the piano.'],['Singing intervals','sv-intervals',['earint'],'Get 80% in tune on the 5th and the octave.'],['Major & minor scales','scales',['scales'],'Sing a major and a natural minor scale on “ah”.'],['Harmony singing','sv-harmony',['earchord'],'Sing the third above Ode to Joy with the tune playing.'],['Playing in the pocket','gv-pocket',['rhythm'],'Clap along to the groove ahead, on and behind the beat.'],['Subdivision & inner time','gv-time',['rhythm'],'Keep counting through the gap click at 60 BPM.'],['Syncopation & pushes','gv-synco',['rhythm'],'Sing a melody with every phrase pushed an eighth early.'],['Writing melodies','th-melody',['earmelody'],'Sing an 8-bar melody over C–Am–F–G.'],['Recording vocals','rec-vocals',['recording'],'Record a verse at three mic distances.']];
CREATORS.ea={name:'Eric Arceneaux',url:'https://www.youtube.com/c/ericarceneaux',what:'Clear singing lessons and voice exercises'};
{const _sb=sessionBlocks;sessionBlocks=function(m){const B=_sb(m);if(INST_RAW()!=='voice')return B;return B.map(b=>b.href==='#warmup'?{...b,name:'Vocal warm-up',href:'#learn-sv-warmup',what:'Sing the warm-ups, starting in the middle of your range.'}:b.href==='#tools-findnote'?{...b,name:'Pitch matching',href:'#learn-sv-pitch',what:'Get a streak of 5 notes in tune.'}:b.href==='#tools-jam'?{...b,what:'Sing a melody or a harmony over the band.'}:b)}}
PATHS.forEach(P=>{const i=P.steps.findIndex(s=>s[0]==='jam');const add=[['learn','sv-harmony','Sing a harmony line over the style.','voice']];P.steps.unshift(['learn','sv-warmup','Warm up before every session.','voice']);if(i>=0)P.steps.splice(i+1,0,...add);else P.steps.push(...add)});

/* ---------- tuner v2: YIN pitch, median + smoothing, hold, string lock ---------- */
const TN={ds:null,d:null,c:null};
function tunerPitch(buf,sr){/* downsample by 2 (averaging) for speed; guitar/bass/voice all sit well below 6 kHz */
 const n=buf.length>>1;if(!TN.ds||TN.ds.length!==n)TN.ds=new Float32Array(n);const x=TN.ds;let rms=0;for(let i=0;i<n;i++){const v=(buf[2*i]+buf[2*i+1])*.5;x[i]=v;rms+=v*v}rms=Math.sqrt(rms/n);if(rms<.004)return null;
 const fs=sr/2,W=Math.min(1024,n>>1),minT=Math.max(2,Math.floor(fs/1400)),maxT=Math.min(n-W-1,Math.floor(fs/27));
 if(!TN.d||TN.d.length<maxT+2){TN.d=new Float32Array(maxT+2);TN.c=new Float32Array(maxT+2)}const d=TN.d,cm=TN.c;
 for(let t=1;t<=maxT;t++){let s=0;for(let j=0;j<W;j++){const df=x[j]-x[j+t];s+=df*df}d[t]=s}
 cm[0]=1;let run=0;for(let t=1;t<=maxT;t++){run+=d[t];cm[t]=run?d[t]*t/run:1}
 let T=-1;for(let t=minT;t<maxT;t++){if(cm[t]<.15){while(t+1<maxT&&cm[t+1]<cm[t])t++;T=t;break}}
 if(T<0){let b=1e9;for(let t=minT;t<maxT;t++)if(cm[t]<b){b=cm[t];T=t}if(b>.35)return null}
 const a=cm[T-1],b=cm[T],c=cm[T+1];const den=a+c-2*b;const tt=den?T+(a-c)/(2*den):T;return{hz:fs/tt,clar:1-cm[T],rms}}
const tnMed=a=>{const s=a.slice().sort((x,y)=>x-y);return s[s.length>>1]};
bindTunerLive=function(root){if(IN_CLAUDE())return;const p=root.querySelector('.tlive');if(!p)return;bindInputPanel(p.querySelector('.inpanel'));
 const inst=INST();const S=inst==='bass'?BSTR():inst==='guitar'?GSTR():null;let hist=[],sm=null,lastGood=0,frame=0,inTuneSince=0,lock=null;
 const strip=p.querySelector('.tstrs2');if(strip&&S){strip.innerHTML=`<button class="pill" data-lk="" aria-pressed="true">Auto</button>`+S.map((m,i)=>`<button class="pill" data-lk="${m}" aria-pressed="false">${SHARPN[m%12]}${Math.floor(m/12)-1}</button>`).join('');
  strip.querySelectorAll('[data-lk]').forEach(b=>b.onclick=()=>{lock=b.dataset.lk?+b.dataset.lk:null;strip.querySelectorAll('[data-lk]').forEach(x=>x.setAttribute('aria-pressed',x===b));hist=[];sm=null})}
 const upd=()=>{if(!document.body.contains(p)){INPUT.listeners.delete(upd);return}const n=p.querySelector('#tnote'),c=p.querySelector('#tcent'),nd=p.querySelector('#tneedle'),hzE=p.querySelector('#thz');
  if(!INPUT.active){n.textContent='–';c.textContent='Connect your instrument below';nd.style.left='50%';nd.classList.remove('ok');p.classList.remove('hold');return}
  if((++frame&1)||!INPUT.buf||!AC)return;
  const r=tunerPitch(INPUT.buf,AC.sampleRate);const now=performance.now();
  if(r&&r.clar>.8&&r.hz>27&&r.hz<1500){let mf=69+12*Math.log2(r.hz/440);
   /* octave slips: snap to the octave nearest the running value */
   if(sm!=null){const k=Math.round((sm-mf)/12);if(k&&Math.abs(sm-(mf+12*k))<.6)mf+=12*k}
   hist.push(mf);if(hist.length>5)hist.shift();const med=tnMed(hist);
   if(sm==null||Math.abs(med-sm)>.6)sm=med;else sm+= (med-sm)*.3;lastGood=now}
  else if(now-lastGood>1200){hist=[];sm=null}
  if(sm==null){n.textContent='–';c.textContent='Play one string at a time and let it ring';nd.style.left='50%';nd.classList.remove('ok');p.classList.remove('hold');S&&strip&&strip.querySelectorAll('[data-lk]').forEach(b=>b.classList.remove('near'));return}
  let target=lock;if(target==null&&S){let best=null;S.forEach(m=>{let d=sm-m;if(best==null||Math.abs(d)<Math.abs(sm-best))best=m});if(Math.abs(sm-best)<2.5)target=best}
  const ref=target!=null?target:Math.round(sm);const cents=Math.round((sm-ref)*100);const cc=Math.max(-50,Math.min(50,cents));
  n.textContent=`${SHARPN[((ref%12)+12)%12]}${Math.floor(ref/12)-1}`;if(hzE)hzE.textContent=`${(440*Math.pow(2,(sm-69)/12)).toFixed(1)} Hz`;
  const ok=Math.abs(cents)<=3;if(ok){if(!inTuneSince)inTuneSince=now}else inTuneSince=0;const locked=ok&&now-inTuneSince>300;
  c.textContent=Math.abs(cents)>50?(cents<0?'Well below: tighten':'Well above: loosen'):locked?'In tune ✓':ok?'Hold it…':cents<0?`${-cents} cents flat: tighten`:`${cents} cents sharp: loosen`;
  nd.style.left=(50+cc)+'%';nd.classList.toggle('ok',locked);p.classList.toggle('hold',now-lastGood>150);
  if(strip)strip.querySelectorAll('[data-lk]').forEach(b=>b.classList.toggle('near',b.dataset.lk!==''&&+b.dataset.lk===target))};
 INPUT.listeners.add(upd)}
tunerLiveHTML=function(){if(IN_CLAUDE())return'';const inst=INST();const strs=inst==='guitar'||inst==='bass';
 return`<div class="panel tlive"><h3>Tune with your instrument plugged in</h3><div class="tread"><b id="tnote">–</b><span id="tcent">Connect your instrument below</span><small class="hint" id="thz"></small></div><div class="tmeter" aria-hidden="true"><span class="c0"></span><span class="tzone"></span><i id="tneedle"></i></div><div class="tscale" aria-hidden="true"><span>−50</span><span>0</span><span>+50</span></div>${strs?`<div class="row tlockrow"><span class="eyebrow">String</span><div class="pills tstrs2" role="group" aria-label="Which string"></div></div>`:''}${inputPanelHTML()}</div>`}

