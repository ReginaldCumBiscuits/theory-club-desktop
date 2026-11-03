/* ================= v16: time signatures and kit choice on the drum page ================= */
const METERS=[{id:'4/4',num:4,den:4,groups:null,info:'Four quarter-note beats per bar. Most rock, pop, funk and hip-hop.'},
 {id:'3/4',num:3,den:4,groups:[4,4,4],info:'Three beats per bar, counted 1 2 3. Waltzes, many folk songs and ballads.'},
 {id:'2/4',num:2,den:4,groups:[4,4],info:'Two beats per bar. Marches, polkas and fast country two-steps.'},
 {id:'5/4',num:5,den:4,groups:[4,4,4,4,4],info:'Five beats per bar, usually felt as 3 + 2 or 2 + 3. Prog, jazz and film music.'},
 {id:'6/8',num:6,den:8,groups:[6,6],info:'Six eighth notes per bar, felt as two big beats of three: ONE two three FOUR five six.'},
 {id:'7/8',num:7,den:8,groups:[4,4,6],info:'Seven eighth notes, grouped 2 + 2 + 3. Prog rock and Balkan folk music.'},
 {id:'9/8',num:9,den:8,groups:[6,6,6],info:'Nine eighth notes in three groups of three. Irish slip jigs and some prog.'},
 {id:'12/8',num:12,den:8,groups:[6,6,6,6],info:'Twelve eighth notes in four groups of three. Slow blues, soul ballads and Afro-Cuban music.'}];
const TSG={
 '3/4':[{id:'waltz',name:'Waltz',bpm:96,feel:'Kick on 1, snare on 2 and 3: OOM-pah-pah.',rows:{hat:'x.x.x.x.x.x.',snare:'....x...x...',kick:'x...........'}},
  {id:'ballad34',name:'3/4 rock ballad',bpm:80,feel:'Big and slow: kick on 1, one snare on 3.',rows:{hat:'x.x.x.x.x.x.',snare:'........x...',kick:'x.....x.....'}},
  {id:'jazzwaltz',name:'Jazz waltz',bpm:132,feel:'Ride on every beat with a skip, hi-hat foot on 2 and 3.',rows:{ride:'x...x.x.x...',hat:'....x...x...',kick:'x.......o...'}}],
 '2/4':[{id:'polka',name:'Polka',bpm:110,feel:'Kick on the beats, snare on the “and”s. Bouncy and fast.',rows:{hat:'x.x.x.x.',snare:'..x...x.',kick:'x...x...'}},
  {id:'march',name:'March',bpm:112,feel:'Snare sixteenths and accents, like a marching band.',rows:{snare:'x.xxx.x.',crash:'x.......',kick:'x...x...'}}],
 '5/4':[{id:'rock5',name:'5/4 rock (3 + 2)',bpm:110,feel:'Count 1 2 3 1 2. Snare on the last beat of each group.',rows:{hat:'x.x.x.x.x.x.x.x.x.x.',snare:'........x.......x...',kick:'x.....x.....x.......'}},
  {id:'jazz5',name:'5/4 jazz (3 + 2)',bpm:150,feel:'Ride pattern with a hi-hat foot that marks the 3 + 2 split.',rows:{ride:'x...x.x.x...x...x.x.',hat:'........x.......x...',kick:'x...........x.......'}}],
 '6/8':[{id:'ballad68',name:'6/8 ballad',bpm:120,feel:'Six eighths on the hi-hat, kick on 1, snare on 4.',rows:{hat:'x.x.x.x.x.x.',snare:'......x.....',kick:'x.......x...'}},
  {id:'rock68',name:'6/8 rock',bpm:160,feel:'Driving and heavy, with the kick pushing into beat 4.',rows:{hat:'x.x.x.x.x.x.',snare:'......x.....',kick:'x...x.....x.'}},
  {id:'jig',name:'Jig',bpm:200,feel:'Irish and Scottish jigs: the bodhrán-style lilt of ONE-and-a TWO-and-a.',rows:{snare:'o.o.x.o.o.x.',tom2:'x.....x.....',kick:'x.....x.....'}}],
 '7/8':[{id:'rock78',name:'7/8 rock (2 + 2 + 3)',bpm:180,feel:'Count 1 2 1 2 1 2 3. The last group is one eighth longer.',rows:{hat:'x.x.x.x.x.x.x.',snare:'....x.......x.',kick:'x.......x.....'}},
  {id:'balkan',name:'Balkan 7/8',bpm:200,feel:'Floor tom on each group with snare in between: the dance feel of Balkan folk.',rows:{tom2:'x...x...x.....',snare:'..x...x...x.x.',kick:'x...x...x.....'}}],
 '9/8':[{id:'slipjig',name:'Slip jig',bpm:180,feel:'Three groups of three: ONE two three TWO two three THREE two three.',rows:{hat:'x.x.x.x.x.x.x.x.x.',snare:'......x.....x.....',kick:'x.................'}}],
 '12/8':[{id:'blues128',name:'12/8 slow blues',bpm:150,feel:'Triplets on the hi-hat, snare on 2 and 4. The sound of a slow blues.',rows:{hat:'x.x.x.x.x.x.x.x.x.x.x.x.',snare:'......x...........x.....',kick:'x.......x...x.......x...'}},
  {id:'afro128',name:'Afro-Cuban 6/8 bell',bpm:180,feel:'The famous bell pattern on the ride over a pulse on the dotted quarter.',rows:{ride:'x...x...x.x...x...x...x.',snare:'......o...........o.....',kick:'x.....x.....x.....x.....'}}]};
function meterOf(id){return METERS.find(m=>m.id===id)||METERS[0]}
function genFills(p){const S=p.steps,G=p.groups,L=S-G[G.length-1];let H=0,o=0;for(const g of G){if(o>=S/2){H=o;break}o+=g}if(!H)H=L;
 const run=(n,parts)=>{const r={};parts.forEach(k=>r[k]='');for(let i=0;i<n;i++){const k=parts[Math.min(parts.length-1,Math.floor(i*parts.length/n))];parts.forEach(q=>r[q]+=q===k?'x':'.')}return r};
 const kickOn=(n)=>{let s='';for(let i=0;i<n;i++)s+=i===0?'x':'.';return s};
 return[{id:'toms',name:'Down the toms',from:H,rows:{...run(S-H,['snare','tom1','tom2']),kick:kickOn(S-H)}},
  {id:'last',name:'Last-beat fill',from:L,rows:{...run(S-L,['snare','tom1','tom2']),kick:kickOn(S-L)}},
  {id:'snare',name:'Snare roll',from:H,rows:{snare:'x'.repeat(S-H),kick:kickOn(S-H)}}]}


