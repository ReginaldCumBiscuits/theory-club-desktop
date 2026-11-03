/* ================= v15: guitar voicings & strums, drum kits & percussion ================= */
/* extra percussion per style: step patterns over a 16 (or 12) step bar */
const PERC={indie:{tamb:'x.x.x.x.x.x.x.x.'},soul:{tamb:'....x.......x...',clap:'....x.......x...'},motown:{tamb:'....x.......x...'},
 bossa:{shaker:'xxxxxxxxxxxxxxxx'},reggae:{shaker:'..x...x...x...x.'},funk:{cowbell:'x.....x...x.....',clap:'....x.......x...'},
 krautrock:{shaker:'xxxxxxxxxxxxxxxx'},surf:{tamb:'....x.......x...'},altcountry:{shaker:'x.x.x.x.x.x.x.x.'},country:{tamb:'....x.......x...'},
 rock:{tamb:'....x.......x...'},ballad:{shaker:'x.x.x.x.x.x.x.x.'},blues:{tamb:'...x.x...x.x'},gypsy:{},cafe:{},minor:{},punk:{tamb:'x.x.x.x.x.x.x.x.'}};
const JAMKIT={rock:'rock',minor:'heavy',ballad:'vintage',blues:'vintage',funk:'rock',bossa:'jazz',indie:'vintage',punk:'rock',krautrock:'vintage',soul:'vintage',gypsy:'brushes',cafe:'brushes',altcountry:'brushes',country:'vintage',reggae:'jazz',surf:'vintage'};
/* bar-to-bar variation so the loop breathes: crash on the very first beat, an open hi-hat
   at the end of bar 2, a pickup kick in bar 3 and ghost notes on the snare */
function drumVary(g,abs,hits){const S=g.steps,bar=Math.floor(abs/S),s=abs%S,q=S/4,ph=bar%4;
 if(abs===0){hits.crash=1;delete hits.hat;delete hits.ride}
 if(ph===1&&s===S-q/2&&hits.hat){delete hits.hat;hits.open=.9}
 if(ph===2&&S===16&&s===10&&!hits.kick&&!hits.snare)hits.kick=.7;
 if(S===16&&(s===7||s===15)&&!hits.snare&&!hits.kick&&g.rows.snare&&g.rows.snare.includes('x')&&!hits.tom1&&!hits.tom2&&ph!==3)hits.snare=.22;
 for(const k in hits)if((k==='hat'||k==='ride'||k==='shaker')&&hits[k]>=.5)hits[k]*=s%q===0?1:.72;return hits}
function percHits(id,g,abs){const P=PERC[id];const out={};if(!P)return out;const S=g.steps,s=abs%S;for(const k in P){const r=P[k];const i=Math.round(s*r.length/S);if(s*r.length%S===0&&r[i]==='x')out[k]=s%(S/4)===0?1:.75}return out}

/* real guitar chord voicings, found on the fretboard: root in the bass, every chord tone, frets within reach */
const GV={};
function gtrVoice(root,t){const key=root+t;if(GV[key])return GV[key];const S=STR,rp=parse(root).pc,pcs=CH[t].st.map(([x])=>(rp+x)%12),need=new Set(pcs.filter((p,i)=>!(pcs.length>3&&CH[t].st[i][0]===7)));let best=null,bs=-1e9;
 for(let pos=0;pos<=9;pos++){const opts=S.map(o=>{const r=[];for(let f=pos===0?0:pos;f<=pos+3;f++)if(pcs.includes((o+f)%12))r.push(f);if(pos>0&&pos<=3&&pcs.includes(o%12))r.unshift(0);return r});
  for(let lo=0;lo<=2;lo++){if(!opts[lo].some(f=>(S[lo]+f)%12===rp))continue;const rec=(i,acc)=>{if(i===6){const notes=acc.map((f,j)=>f==null?null:S[j]+f);const played=notes.filter(x=>x!=null);if(played.length<4)return;const got=new Set(played.map(x=>x%12));for(const p of need)if(!got.has(p))return;
     const fr=acc.filter(f=>f!=null&&f>0);const span=fr.length?Math.max(...fr)-Math.min(...fr):0;if(span>3)return;const sc=played.length*3-(played.length-new Set(played).size)*6-span*2-pos*1.2+acc.filter(f=>f===0).length*1.5-(Math.max(...played)>76?4:0);if(sc>bs){bs=sc;best=played}return}
    if(i<lo){rec(i+1,[...acc,null]);return}const o=i===lo?opts[i].filter(f=>(S[i]+f)%12===rp):opts[i];for(const f of o)rec(i+1,[...acc,f]);if(i>lo+2&&i===5)rec(i+1,[...acc,null])};rec(0,[])}}
 GV[key]=best||voice(root,t);return GV[key]}
const STRUMPAT={16:[0,4,6,10,12,14],12:[0,3,5,6,9,11]};const STRUMSTYLE={ballad:[0,6,8,12],funk:[2,6,10,14],reggae:[4,12],bossa:[0,3,6,10],punk:[0,2,4,6,8,10,12,14],gypsy:[0,3,6,9],cafe:[0,3,6,9],krautrock:[0,2,4,6,8,10,12,14]};
function bandChords(jid,s,steps,g){if(g&&g.groups){const o=[];let a=0;g.groups.forEach(x=>{o.push(a);if(x>=4)o.push(a+x-2);a+=x});return o}if(g&&g.meter&&g.meter!=='4/4'){return beatPositions(g)}const p=STRUMSTYLE[jid]||STRUMPAT[steps]||[0,steps/2];return p.filter(x=>x<steps)}
function playBandChord(jid,c,s,steps,t,sd,vel,inst,out,g){const T=out?out.tone:tone;const hits=bandChords(jid,s,steps,g);const i=hits.indexOf(s);if(i<0)return;const nx=i+1<hits.length?hits[i+1]:steps+hits[0];const short=['funk','reggae','gypsy','cafe','punk','krautrock'].includes(jid);const dur=short?sd*(jid==='reggae'?1.4:1.1):sd*(nx-s)*.95;const q=steps/4;
 if(inst==='piano'){voice(c.root,c.t).slice(1).forEach(m=>T(m,t,dur,vel*.9,'piano'));return}
 const dist=['crunch','drive'].includes(store.get('gtone','acoustic'));const ms=jid==='punk'||(dist&&!JAZZY.has(jid))?(b=>[b,b+7,b+12])(gtrVoice(c.root,'maj')[0]):gtrVoice(c.root,c.t);strum(ms,t,dur,vel*(s%q===0?1:.8)*(dist?.8:1),{dir:s%q===0||jid==='punk'?'down':'up',spread:short?.008:.014,tone:T})}

