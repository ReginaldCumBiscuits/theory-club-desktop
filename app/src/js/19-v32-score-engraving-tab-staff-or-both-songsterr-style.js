/* ================= v32: score engraving (tab, staff or both, Songsterr-style) ================= */
/* One layout engine for every player. Bars can differ in length and time signature. Notes that cross a
   bar line are split and tied; gaps become rests; durations are spelled as dotted or triplet values.
   Spacing follows note length on a log curve (like engraved music), then each row is justified. */
const EL='CDEFGAB',EN=[0,2,4,5,7,9,11];
const HARM_OFF={12:12,7:19,19:19,5:24,24:24,4:28,9:28,16:28,3.2:31,3:31};const harmPitch=(open,f)=>open+(HARM_OFF[f]!=null?HARM_OFF[f]:f);
const engNames=S=>{const flat=[1,3,6,8,10].includes(((S[0]%12)+12)%12)&&S.every(m=>[1,3,6,8,10].includes(((m%12)+12)%12)||[0,5,2,7,9,4].includes(((m%12)+12)%12));return S.map(m=>(flat?FLATN:SHARPN)[((m%12)+12)%12].replace('b','♭').replace('#','♯'))};
const E_TRIP=[16/3,8/3,4/3,2/3];const E_VALS=[16,12,8,6,4,3,2,1.5,1,.75,.5];
function engKeyAlt(k){const a=[0,0,0,0,0,0,0];const sh='FCGDAEB',fl='BEADGCF';if(k>0)for(let i=0;i<k;i++)a[EL.indexOf(sh[i])]=1;if(k<0)for(let i=0;i<-k;i++)a[EL.indexOf(fl[i])]=-1;return a}
function engSpell(m,k){const pc=((m%12)+12)%12;const ka=engKeyAlt(k);let best=null;
 for(let L=0;L<7;L++)for(const a of[0,1,-1]){if(((EN[L]+a)%12+12)%12!==pc)continue;const sc=(a===ka[L]?0:a===0?1:(k<0?(a<0?2:3):(a>0?2:3)));if(!best||sc<best.sc)best={L,a,sc}}
 const oct=Math.floor((m-best.a)/12)-1;return{step:best.L+7*oct,alt:best.a,L:best.L}}
function engGuessKey(items){const h=new Array(12).fill(0);items.forEach(it=>(it.chord||(it.m!=null?[it.m]:[])).forEach(m=>h[((m%12)+12)%12]+=it.dur||1));
 let best=0,bs=-1;for(let k=-5;k<=6;k++){const t=((7*k)%12+12)%12;const sc=[0,2,4,5,7,9,11].reduce((a,d)=>a+h[(t+d)%12],0)+[0,2,3,5,7,8,10].reduce((a,d)=>a+h[(t+9+d)%12],0)*.0;if(sc>bs+1e-9||(Math.abs(sc-bs)<1e-9&&Math.abs(k)<Math.abs(best))){bs=sc;best=k}}return best}
function engSplit(d16){const out=[];let r=d16,guard=0;while(r>.24&&guard++<12){const ex=[...E_VALS,...E_TRIP].find(v=>Math.abs(v-r)<.02);if(ex){out.push({v:ex,tup:E_TRIP.includes(ex)?3:0});break}
  const trip=Math.abs(r*3-Math.round(r*3))<.03&&Math.abs(r*2-Math.round(r*2))>.03;if(trip){const t=E_TRIP.find(x=>x<=r+.01)||E_TRIP[E_TRIP.length-1];out.push({v:t,tup:3});r-=t;continue}
  const v=E_VALS.find(x=>x<=r+.01);if(!v){out.push({v:r,tup:0});break}out.push({v,tup:0});r-=v}return out}
function engBarsOf(ex){const per=ex.per,den=ex.den||4;if(ex.barsInfo&&ex.barsInfo.length)return ex.barsInfo.map((b,i)=>({...b,i}));const len=ex.beats*per;const nb=Math.max(1,Math.ceil(ex.steps/len));return Array.from({length:nb},(_,i)=>({i,st:i*len,len,num:ex.beats,den}))}
const engTq=ex=>ex.per*(ex.den||4)/4;/* ticks per quarter */
function engEvents(ex,bars){const tq=engTq(ex),t16=tq/4;const items=ex.items;const order=items.map((_,i)=>i).sort((a,b)=>items[a].st-items[b].st);
 const segs=bars.map(()=>[]);const barAt=t=>{let lo=0,hi=bars.length-1;while(lo<hi){const mid=(lo+hi+1)>>1;if(bars[mid].st<=t+1e-6)lo=mid;else hi=mid-1}return lo};
 order.forEach((i,k)=>{const it=items[i];const nx=order.slice(k+1).map(j=>items[j]).find(o=>o.st>it.st+1e-6);let e=it.st+Math.max(1e-3,it.dur);if(nx&&e>nx.st)e=nx.st;
  let s=it.st,first=true;while(s<e-1e-6){const b=barAt(s);const B=bars[b];const be=Math.min(e,B.st+B.len);const parts=engSplit((be-s)/t16);let t=s;
   parts.forEach((p,pi)=>{segs[b].push({i,it,st:t,v:p.v,tup:p.tup,cont:!first});first=false;t+=p.v*t16});s=be}
  });
 bars.forEach((B,b)=>{const S=segs[b].sort((a,c)=>a.st-c.st||(a.cont-c.cont));for(let k=0;k<S.length;k++){const nx=S[k+1];S[k].tieNext=!!(nx&&nx.i===S[k].i)}
  /* rests fill the gaps */
  const rests=[];let t=B.st;const end=B.st+B.len;S.forEach(e=>{if(e.st>t+t16*.24){let r=t;engSplit((e.st-t)/t16).forEach(p=>{rests.push({rest:true,st:r,v:p.v,tup:p.tup});r+=p.v*t16})}t=Math.max(t,e.st+e.v*t16)});
  if(t<end-t16*.24){if(!S.length)rests.push({rest:true,st:B.st,v:B.len/t16,bar:true,tup:0});else{let r=t;engSplit((end-t)/t16).forEach(p=>{rests.push({rest:true,st:r,v:p.v,tup:p.tup});r+=p.v*t16})}}
  segs[b]=[...S,...rests].sort((a,c)=>a.st-c.st)});
 /* tie links across segments */
 const lastSeg={};segs.forEach(S=>S.forEach(e=>{if(e.rest)return;if(e.cont&&lastSeg[e.i])e.prev=lastSeg[e.i];lastSeg[e.i]=e}));
 return segs}
const engW=d=>15+15*Math.log2(1+d);const engB=e=>e.tup?e.v*1.5:e.v;
function engrave(ex,mode){const items=ex.items;const S=ex.S;const hasTab=mode!=='staff'&&S&&items.length&&items.every(it=>it.col||it.pos||it.rest);const hasStaff=mode!=='tab'||!hasTab;
 const showTab=hasTab,showStaff=hasStaff&&items.some(it=>it.m!=null||it.chord||it.mute);
 const tq=engTq(ex),t16=tq/4;const bars=engBarsOf(ex);const segs=engEvents(ex,bars);const W=tabProWidth();const n=S?S.length:6;
 const inst=ex.inst;const trans=inst==='guitar'||inst==='bass'?12:0;
 const allM=[];items.forEach(it=>(it.chord||(it.m!=null?[it.m]:[])).forEach(m=>allM.push(m+trans)));allM.sort((a,b)=>a-b);
 const clef=inst==='bass'?'bass':inst==='guitar'?'treble':(allM.length&&allM[allM.length>>1]<60?'bass':'treble');const ref=clef==='treble'?30:18;
 const key=ex.key!=null?ex.key:engGuessKey(items);const kA=engKeyAlt(key);
 const pitches=it=>{if(it.mute&&!it.chord)return[];return(it.chord&&it.chord.length?it.chord:it.m!=null?[it.m]:[])};
 /* --- widths --- */
 const keyW=Math.abs(key)*9;
 bars.forEach((B,b)=>{const ev=segs[b];const slots=[];ev.forEach(e=>{const s=slots[slots.length-1];if(s&&Math.abs(s.st-e.st)<1e-6)s.ev.push(e);else slots.push({st:e.st,ev:[e]})});
  slots.forEach((s,k)=>{const nx=slots[k+1];const d=((nx?nx.st:B.st+B.len)-s.st)/t16;let w=engW(Math.max(.5,d));
   s.ev.forEach(e=>{if(e.rest)return;const it=e.it;const cols=it.col||(it.pos?[it.pos]:[]);if(cols.some(c=>String(c.f).length>1))w+=5;if(it.ghost||it.harm||e.cont)w+=6;if(showStaff&&pitches(it).some(m=>{const sp=engSpell(m+trans,key);return sp.alt!==kA[sp.L]}))w+=7;if(/\bb\b/.test(it.mk||''))w+=8});
   s.w=w});B.slots=slots;const prev=bars[b-1];B.sigChange=!prev||prev.num!==B.num||prev.den!==B.den;
  B.w=12+slots.reduce((a,s)=>a+s.w,0)+(B.sigChange&&b>0?20:0)+(B.repStart?12:0)+(B.repEnd?12:0)});
 const lead=showStaff?32:30;const firstExtra=(showStaff?26+keyW:0)+24;const rowExtra=showStaff?24+keyW:0;
 const rows=[];let cur=[],cw=0;bars.forEach(B=>{const avail=W-lead-(rows.length===0?firstExtra:rowExtra)-6;if(cur.length&&cw+B.w>avail){rows.push(cur);cur=[];cw=0}cur.push(B);cw+=B.w});if(cur.length)rows.push(cur);
 const out=[];const segPos=new Map();const engLastCh={v:null};
 const sp=8,LS=13;
 rows.forEach((row,ri)=>{const first=ri===0;const x0=lead+(first?firstExtra:rowExtra);const natural=row.reduce((a,B)=>a+B.w,0);const avail=W-x0-6;const stretch=(ri<rows.length-1||natural>avail*.7)?avail/natural:1;
  /* vertical layout */
  let minP=0,maxP=8;if(showStaff)row.forEach(B=>segs[B.i].forEach(e=>{if(e.rest)return;pitches(e.it).forEach(m=>{const p=engSpell(m+trans,key).step-ref;minP=Math.min(minP,p);maxP=Math.max(maxP,p)})}));
  const hasCh=row.some(B=>segs[B.i].some(e=>!e.rest&&!e.cont&&e.it.chord&&e.it.chord.length>=3));const marksH=30+(row.some(B=>B.section)?14:0)+(first&&(ex.bpm||ex.capo||ex.tuningName)?14:0)+(hasCh?14:0)+(row.some(B=>segs[B.i].some(e=>!e.rest&&/\bb\b|\br\b|pb/.test(e.it.mk||'')))&&!showStaff?10:0);
  const staffTop=marksH+Math.max(0,maxP-8)*sp/2+(showStaff?8:0);const staffBot=staffTop+4*sp;const staffEnd=showStaff?staffBot+Math.max(0,-minP)*sp/2+18:marksH-4;
  const tabTop=showTab?staffEnd+(showStaff?26:0):0;const tabBot=tabTop+(n-1)*LS;const H=(showTab?tabBot+(showStaff?16:46):staffEnd+6);
  const yS=p=>staffBot-p*sp/2;const yT=s=>tabTop+(n-1-s)*LS;
  let g='';const xEnd=x0+natural*stretch;
  /* staff lines, clef, key */
  if(showStaff){for(let i=0;i<5;i++)g+=`<line class="stl" x1="${lead-24}" x2="${xEnd}" y1="${yS(i*2)}" y2="${yS(i*2)}"/>`;
   g+=clef==='treble'?`<text class="gl" x="${lead-22}" y="${yS(2)+16}" font-size="40">𝄞</text>${inst==='guitar'?`<text class="tq" x="${lead-12}" y="${yS(-4)+4}" text-anchor="middle">8</text>`:''}`:`<text class="gl" x="${lead-21}" y="${yS(6)+18}" font-size="36">𝄢</text>`;
   if(key){const P=key>0?[8,5,9,6,3,7,4]:[4,7,3,6,2,5,1];const sh=clef==='bass'?-2:0;for(let k=0;k<Math.abs(key);k++)g+=`<text class="gl acc" x="${lead+4+k*9}" y="${yS(P[k]+sh)+4}" font-size="20">${key>0?'♯':'♭'}</text>`}
   g+=`<line class="blx" x1="${lead-24}" x2="${lead-24}" y1="${yS(8)}" y2="${yS(0)}"/>`}
  if(showTab){for(let s=0;s<n;s++)g+=`<line class="sl" x1="${lead-4}" x2="${xEnd}" y1="${yT(s)}" y2="${yT(s)}"/>`;engNames(S).forEach((nm,s)=>g+=`<text class="sn" x="${lead-10}" y="${yT(s)+4}" text-anchor="end">${nm}</text>`);g+=`<line class="blx" x1="${lead-4}" x2="${lead-4}" y1="${yT(n-1)}" y2="${yT(0)}"/>`}
  if(first){let tx=lead-22;const bits=[];if(ex.bpm)bits.push(`= ${ex.bpm}`);if(ex.capo)bits.push(`Capo ${ex.capo}`);if(ex.tuningName)bits.push(ex.tuningName);if(bits.length)g+=`<text class="tempo" x="${tx}" y="15">${ex.bpm?'<tspan class="qn">♩</tspan> ':''}${esc(bits.join('  ·  '))}</text>`}
  const sig=(x,B)=>{let s='';if(showStaff)s+=`<text class="tsS" x="${x}" y="${yS(6)+5}" text-anchor="middle">${B.num}</text><text class="tsS" x="${x}" y="${yS(2)+5}" text-anchor="middle">${B.den}</text>`;if(showTab){const cy=tabTop+(n-1)*LS/2;s+=`<text class="ts" x="${x}" y="${cy-2}" text-anchor="middle">${B.num}</text><text class="ts" x="${x}" y="${cy+17}" text-anchor="middle">${B.den}</text>`}return s};
  if(first)g+=sig(x0-12,row[0]);
  const vline=(x,cls='blx')=>{let s='';if(showStaff)s+=`<line class="${cls}" x1="${x}" x2="${x}" y1="${yS(8)}" y2="${yS(0)}"/>`;if(showTab)s+=`<line class="${cls}" x1="${x}" x2="${x}" y1="${yT(n-1)}" y2="${yT(0)}"/>`;return s};
  const dots=(x)=>{let s='';if(showStaff)[3,5].forEach(p=>s+=`<circle class="rdot" cx="${x}" cy="${yS(p)}" r="2"/>`);if(showTab){const c=tabTop+(n-1)*LS/2;[c-LS*.5-1,c+LS*.5+1].forEach(yy=>s+=`<circle class="rdot" cx="${x}" cy="${yy}" r="2"/>`)}return s};
  let x=x0;let pmRuns=[],pmS=null,pmL=null,lrRuns=[],lrS=null,lrL=null;const prevPos={};const topY=showStaff?staffTop:tabTop;const markY=Math.min(topY,(showStaff?yS(maxP):topY))-10;
  row.forEach((B,bi)=>{const bw=B.w*stretch;const bx=x;let nx=bx+6*stretch;
   if(B.repStart){g+=`<rect class="endbar" x="${bx+1}" y="${topY}" width="3" height="${(showTab?yT(0):yS(0))-topY}"/>`+dots(bx+12);nx+=12*stretch}
   if(B.sigChange&&!(first&&bi===0)){g+=sig(nx+8,B);nx+=20*stretch}
   g+=`<text class="bn" x="${bx+3}" y="${markY-2}">${B.i+1}</text>`;
   if(B.section)g+=`<text class="sec" x="${bx+3}" y="${markY-16}">${esc(B.section)}</text>`;
   if(B.alt)g+=`<path class="alt" d="M${bx+2} ${markY+2}V${markY-8}H${bx+bw-6}"/><text class="tq" x="${bx+6}" y="${markY}">${esc(String(B.alt))}.</text>`;
   const kAlt={};/* accidentals in force in this bar: step -> alt */
   const pos=[];B.slots.forEach(s=>{const w=s.w*stretch;s.ev.forEach(e=>pos.push({e,x:nx+Math.min(14,w*.35)}));nx+=w});
   /* beam groups */
   const e8=tq/2;const gk=(B.den===8)?(B.num%3===0?(t=>Math.floor(t/(3*e8))):(()=>{const pat=B.num===5?[3,2]:B.num===7?[2,2,3]:B.num===11?[3,3,3,2]:Array(Math.ceil(B.num/2)).fill(2);const edges=[];let a=0;pat.forEach(x=>{a+=x;edges.push(a*e8)});return t=>{let k=0;while(k<edges.length-1&&t>=edges[k]-1e-6)k++;return k}})()):(t=>Math.floor(t/(tq*4/B.den)));
   const groups=[];let cg=null;pos.forEach(p=>{const e=p.e;const k=gk(e.st-B.st+1e-6);if(e.rest||e.v>=4-.01){cg=null;return}if(!cg||cg.k!==k){cg={k,ps:[]};groups.push(cg)}cg.ps.push(p)});
   const staffStemDir={};groups.forEach(G=>{let sum=0,c=0;G.ps.forEach(p=>pitches(p.e.it).forEach(m=>{sum+=engSpell(m+trans,key).step-ref;c++}));const down=c?sum/c>=4:false;G.ps.forEach(p=>staffStemDir[p.e.st]=down)});
   pos.forEach(p=>{const e=p.e;const cx=p.x;
    if(e.rest){const v=e.v;
     if(showStaff){const gl=e.bar||v>=16?'𝄻':v>=8?'𝄼':v>=4?'𝄽':v>=2?'𝄾':'𝄿';const xx=e.bar?bx+bw/2:cx;const yy=e.bar||v>=16?yS(6)+3:v>=8?yS(4)+1:yS(4)+7;g+=`<text class="gl rest" x="${xx-5}" y="${yy}" font-size="22">${gl}</text>`;if([3,6,12,1.5].some(t=>Math.abs(v-t)<.01))g+=`<circle class="rdot" cx="${xx+9}" cy="${yS(5)}" r="1.7"/>`}
     if(showTab&&!showStaff){const gl=e.bar||v>=16?'𝄻':v>=8?'𝄼':v>=4?'𝄽':v>=2?'𝄾':'𝄿';const xx=e.bar?bx+bw/2:cx;g+=`<text class="rest" x="${xx-6}" y="${tabTop+(n-1)*LS/2+7}">${gl}</text>`}
     return}
    const it=e.it,i=e.i;const cols=it.col||(it.pos?[it.pos]:[]);const att=!e.cont;
    if(att)g+=`<rect class="hit" data-c="${i}" x="${cx-7}" y="${topY-6}" width="14" height="4"/>`;
    /* chord name */
    if(att&&it.chord&&it.chord.length>=3){const nm=(identify(it.chord)[0]||{}).name;if(nm&&nm!==engLastCh.v)g+=`<text class="cn" x="${cx}" y="${markY-14}" text-anchor="middle">${esc(nm)}</text>`;if(nm)engLastCh.v=nm}
    if(att&&it.acc)g+=`<text class="accent" x="${cx}" y="${(showStaff?Math.min(yS(Math.max(9,maxP+1)),yS(9)):tabTop-4)}" text-anchor="middle">&gt;</text>`;
    /* ---- staff ---- */
    if(showStaff){const ms=pitches(it);const down=!!staffStemDir[e.st]||(!groups.some(G=>G.ps.includes(p))&&(ms.length?ms.reduce((a,m)=>a+engSpell(m+trans,key).step-ref,0)/ms.length>=4:false));
     const heads=ms.map(m=>{const sp2=engSpell(m+trans,key);return{p:sp2.step-ref,alt:sp2.alt,step:sp2.step}}).sort((a,b)=>a.p-b.p);
     (it.col||[]).filter(c=>c&&c.f==='x').forEach(c=>{const sp2=engSpell(S[c.s]+trans,key);heads.push({p:sp2.step-ref,dead:true,alt:0,step:sp2.step})});heads.sort((a,b)=>a.p-b.p);if(it.mute&&!heads.length)heads.push({p:4,dead:true,alt:0,step:ref+4});
     const open=e.v>=8-.01;let accX=cx-12;
     heads.forEach((h,hi)=>{const cy=yS(h.p);
      if(h.p<=-2)for(let k=-2;k>=h.p;k-=2)g+=`<line class="lg" x1="${cx-9}" x2="${cx+9}" y1="${yS(k)}" y2="${yS(k)}"/>`;
      if(h.p>=10)for(let k=10;k<=h.p;k+=2)g+=`<line class="lg" x1="${cx-9}" x2="${cx+9}" y1="${yS(k)}" y2="${yS(k)}"/>`;
      if(att&&!h.dead){const inForce=kAlt[h.step]!=null?kAlt[h.step]:kA[((h.step%7)+7)%7];if(h.alt!==inForce){g+=`<text class="gl acc" x="${accX-4}" y="${cy+4}" font-size="17">${h.alt===0?'♮':h.alt>0?'♯':'♭'}</text>`;kAlt[h.step]=h.alt}}
      const second=hi>0&&h.p-heads[hi-1].p===1&&!heads[hi-1].shift;h.shift=second;const hx=cx+(second?(down?-9:9):0);
      if(h.dead||(it.mute&&it.chord&&!it.chord.length)){g+=`<path class="xh" data-c="${att?i:''}" d="M${hx-4} ${cy-4}L${hx+4} ${cy+4}M${hx-4} ${cy+4}L${hx+4} ${cy-4}"/>`}
      else if(it.harm){g+=`<path class="nh${open?' open':''}" ${att?`data-c="${i}"`:''} d="M${hx-5.5} ${cy}L${hx} ${cy-4.5}L${hx+5.5} ${cy}L${hx} ${cy+4.5}Z"/>`}
      else g+=`<ellipse class="nh${open?' open':''}${e.cont?' tied':''}" ${att?`data-c="${i}"`:''} cx="${hx}" cy="${cy}" rx="5.4" ry="3.9" transform="rotate(-20 ${hx} ${cy})"/>`;
      if(it.ghost&&att)g+=`<text class="gp" x="${hx-10}" y="${cy+4}">(</text><text class="gp" x="${hx+7}" y="${cy+4}">)</text>`;
      if([3,6,12,1.5].some(t=>Math.abs(e.v-t)<.01))g+=`<circle class="rdot" cx="${hx+9}" cy="${h.p%2===0?cy-3:cy}" r="1.7"/>`});
     p.heads=heads;p.down=down;
     if(e.v<16-.01&&heads.length){const sx=down?cx-5:cx+5;const yTop=yS(heads[heads.length-1].p),yBot=yS(heads[0].p);p.sx=sx;p.y0=down?yTop:yBot;p.yEnd=down?yBot+26:yTop-26}
     if(att&&it.stac&&heads.length)g+=`<circle class="rdot" cx="${cx}" cy="${down?yS(heads[heads.length-1].p)-9:yS(heads[0].p)+9}" r="1.6"/>`}
    /* ---- tab ---- */
    if(showTab){cols.forEach(c=>{if(!c)return;const f=String(c.f);const txt=e.cont?`(${f})`:it.ghost?`(${f})`:it.harm?`<${f}>`:f;const tw=Math.max(10,txt.length*7.2+4);
      g+=`<rect class="tb${e.cont?' tie':''}" ${att?`data-c="${i}"`:''} x="${cx-tw/2}" y="${yT(c.s)-7}" width="${tw}" height="14" rx="3"/><text class="tn${f==='x'?' dead':''}${e.cont?' tie':''}" ${att?`data-c="${i}"`:''} x="${cx}" y="${yT(c.s)+4.3}" text-anchor="middle">${esc(txt)}</text>`});
     if(att){const mk=it.mk||'';const toks=mk.split(/\s+/).filter(Boolean);const has=t=>toks.includes(t);const s0=(cols[0]||{s:0}).s;const pv0=prevPos[s0];const pv=pv0&&pv0.row===ri?pv0:null;
      if((has('h')||has('p')||has('t'))&&pv){const xa=pv.x+5,xb=cx-5,yy=yT(s0)-9;g+=`<path class="arc" d="M${xa} ${yy} Q${(xa+xb)/2} ${yy-11} ${xb} ${yy}"/><text class="tq" x="${(xa+xb)/2}" y="${yy-10}" text-anchor="middle">${has('p')?'P':has('t')?'T':'H'}</text>`}
      cols.forEach(c=>{if(!c)return;const yy=yT(c.s);const p2=prevPos[c.s];const near=p2&&p2.row===ri&&cx-p2.x<300;
       if(has('/')||has('\\')){const up=has('/');const xa=near?p2.x+8:cx-22,xb=cx-8;g+=`<line class="sld" x1="${xa}" x2="${xb}" y1="${yy+(up?4:-4)}" y2="${yy+(up?-4:4)}"/>`}
       if(has('si/')||has('si\\')){const up=has('si/');g+=`<line class="sld" x1="${cx-22}" x2="${cx-8}" y1="${yy+(up?5:-5)}" y2="${yy+(up?-1:1)}"/>`}
       if(has('so/')||has('so\\')){const up=has('so/');g+=`<line class="sld" x1="${cx+8}" x2="${cx+22}" y1="${yy+(up?1:-1)}" y2="${yy+(up?-5:5)}"/>`}});
      if(toks.some(t=>t==='b'||t==='r'||t==='pb')){const amt=it.bend!=null?it.bend:2;const lab=amt>=4?'2':amt>=3?'1½':amt<=1?'½':'full';const yy=yT(s0);const ty=tabTop-18;
       if(has('pb'))g+=`<line class="bend" x1="${cx+12}" x2="${cx+12}" y1="${yy-6}" y2="${ty+6}"/><path class="bendh" d="M${cx+8} ${ty+10} L${cx+12} ${ty+3} L${cx+16} ${ty+10}"/>`;
       else g+=`<path class="bend" d="M${cx+7} ${yy} Q${cx+14} ${yy} ${cx+14} ${ty+6}"/><path class="bendh" d="M${cx+10} ${ty+10} L${cx+14} ${ty+3} L${cx+18} ${ty+10}"/>`;
       g+=`<text class="bl" x="${cx+14}" y="${ty}" text-anchor="middle">${lab}</text>`;if(has('r'))g+=`<path class="bend" d="M${cx+18} ${ty+6} Q${cx+22} ${ty+6} ${cx+24} ${yy-6}"/><path class="bendh" d="M${cx+20} ${yy-10} L${cx+24} ${yy-4} L${cx+28} ${yy-10}"/>`}
      if(mk.includes('~')){let w='';const xa=cx+8,len=Math.max(14,(p.w||30)-14);for(let k=0;k<len;k+=6)w+=`${k?'':'M'+xa+' '+(tabTop-7)} q1.5 -3 3 0 q1.5 3 3 0 `;g+=`<path class="vib" d="${w}"/>`}
      if(has('S')||has('P'))g+=`<text class="tq sp" x="${cx}" y="${tabTop-5}" text-anchor="middle">${has('P')?'P':'S'}</text>`;
      if(it.trem)g+=`<path class="beam" d="M${cx-4} ${tabTop-14}l8 -3v2l-8 3zM${cx-4} ${tabTop-10}l8 -3v2l-8 3zM${cx-4} ${tabTop-6}l8 -3v2l-8 3z"/>`;
      if(it.stac&&!showStaff)g+=`<circle class="stac" cx="${cx}" cy="${yT(0)+11}" r="1.8"/>`;
      cols.forEach(c=>{if(c)prevPos[c.s]={x:cx,row:ri}})}
     if(it.pm){if(pmS==null)pmS=cx;pmL=cx}else if(att&&pmS!=null){pmRuns.push([pmS,pmL]);pmS=null}
     if(it.letRing){if(lrS==null)lrS=cx;lrL=cx}else if(att&&lrS!=null){lrRuns.push([lrS,lrL]);lrS=null}}
    /* ties */
    if(e.prev){const P=segPos.get(e.prev);if(P){if(P.row===ri)g+=engTie(P.x,cx,e,P,showStaff,showTab,yS,yT,staffStemDir[e.st],trans,key,ref,cols);else g+=engTie(x0-14,cx,e,null,showStaff,showTab,yS,yT,staffStemDir[e.st],trans,key,ref,cols)}}
    if(e.tieNext)segPos.set(e,{x:cx,row:ri});
    /* tab-only rhythm stems */
    if(showTab&&!showStaff){const stemTop=tabBot+8,stemLen=22;if(e.v<16-.01){const half=e.v>=8-.01;g+=`<line class="stem" x1="${cx}" x2="${cx}" y1="${stemTop}" y2="${stemTop+(half?stemLen*.55:stemLen)}"/>`}if([3,6,12,1.5].some(t=>Math.abs(e.v-t)<.01))g+=`<circle class="stac" cx="${cx+5}" cy="${stemTop+stemLen-2}" r="1.6"/>`}
    p.cx=cx});
   /* stems, beams, flags and tuplets on the staff (or under the tab) */
   const grouped=new Set();groups.forEach(G=>{G.ps.forEach(p=>grouped.add(p))});
   if(showStaff){groups.forEach(G=>{const ps=G.ps.filter(p=>p.sx!=null);if(!ps.length)return;const down=ps[0].down;
     if(ps.length>=2){const yb=down?Math.max(...ps.map(p=>p.yEnd)):Math.min(...ps.map(p=>p.yEnd));ps.forEach(p=>g+=`<line class="stem" x1="${p.sx}" x2="${p.sx}" y1="${p.y0}" y2="${yb}"/>`);
      const xa=ps[0].sx,xb=ps[ps.length-1].sx,bt=down?yb-4:yb;g+=`<rect class="beam" x="${xa}" y="${bt}" width="${xb-xa}" height="4"/>`;
      ps.forEach((p,j)=>{if(engB(p.e)>1.5)return;const nn=ps[j+1],pv=ps[j-1];const y2=down?bt-7:bt+7;if(nn&&engB(nn.e)<=1.5)g+=`<rect class="beam" x="${p.sx}" y="${y2}" width="${nn.sx-p.sx}" height="3.5"/>`;else if(!(pv&&engB(pv.e)<=1.5))g+=`<rect class="beam" x="${nn?p.sx:p.sx-7}" y="${y2}" width="7" height="3.5"/>`});
      if(ps.some(p=>p.e.tup))g+=`<text class="tq" x="${(xa+xb)/2}" y="${down?yb+11:yb-5}" text-anchor="middle">3</text>`}
     else{const p=ps[0];g+=`<line class="stem" x1="${p.sx}" x2="${p.sx}" y1="${p.y0}" y2="${p.yEnd}"/>`;const fl=engB(p.e)<=1.01?2:engB(p.e)<4?1:0;for(let f=0;f<fl;f++){const fy=p.yEnd+(down?-f*6:f*6);g+=down?`<path class="flag" d="M${p.sx} ${fy}c4-3 7-6 6-12c-1 4-3 7-6 8z"/>`:`<path class="flag" d="M${p.sx} ${fy}c4 3 7 6 6 12c-1-4-3-7-6-8z"/>`}if(p.e.tup)g+=`<text class="tq" x="${p.sx}" y="${down?p.yEnd+11:p.yEnd-5}" text-anchor="middle">3</text>`}});
    pos.forEach(p=>{if(p.sx==null||grouped.has(p))return;g+=`<line class="stem" x1="${p.sx}" x2="${p.sx}" y1="${p.y0}" y2="${p.yEnd}"/>`})}
   else if(showTab){const yb=tabBot+30;groups.forEach(G=>{const sm=G.ps;if(sm.length>=2){const xa=sm[0].cx,xb=sm[sm.length-1].cx;g+=`<rect class="beam" x="${xa-.6}" y="${yb-3}" width="${xb-xa+1.2}" height="3"/>`;
      sm.forEach((p,j)=>{if(engB(p.e)>1.5)return;const nn=sm[j+1],pv=sm[j-1];if(nn&&engB(nn.e)<=1.5)g+=`<rect class="beam" x="${p.cx-.6}" y="${yb-8}" width="${nn.cx-p.cx+1.2}" height="3"/>`;else if(!(pv&&engB(pv.e)<=1.5)){const dir=nn?1:-1;g+=`<rect class="beam" x="${dir>0?p.cx:p.cx-8}" y="${yb-8}" width="8" height="3"/>`}});
      if(sm.some(p=>p.e.tup))g+=`<text class="tq" x="${(xa+xb)/2}" y="${yb+11}" text-anchor="middle">3</text>`}
     else{const p=sm[0];const fl=engB(p.e)<=1.01?2:1;for(let f=0;f<fl;f++)g+=`<path class="flag" d="M${p.cx} ${yb-f*5}c4-3 7-5 6-11c-1 4-3 6-6 7z"/>`;if(p.e.tup)g+=`<text class="tq" x="${p.cx}" y="${yb+11}" text-anchor="middle">3</text>`}})}
   x+=bw;
   if(B.repEnd){g+=dots(x-12)+vline(x-4)+`<rect class="endbar" x="${x-2}" y="${topY}" width="3" height="${(showTab?yT(0):yS(0))-topY}"/>`;if(B.repCount>1)g+=`<text class="rep" x="${x-4}" y="${markY-2}" text-anchor="end">×${B.repCount}</text>`}
   else g+=vline(x)});
  if(pmS!=null)pmRuns.push([pmS,pmL]);if(lrS!=null)lrRuns.push([lrS,lrL]);const ly=(showTab?tabTop:staffTop)-(showStaff&&!showTab?Math.max(0,maxP-8)*sp/2+14:6);
  pmRuns.forEach(([a,b])=>{g+=`<text class="tq pm" x="${a-6}" y="${ly}">P.M.</text>${b>a+10?`<line class="pml" x1="${a+18}" x2="${b+6}" y1="${ly-3}" y2="${ly-3}"/><line class="pml" x1="${b+6}" x2="${b+6}" y1="${ly-6}" y2="${ly}"/>`:''}`});
  lrRuns.forEach(([a,b])=>{const yy=ly-12;g+=`<text class="tq" x="${a-6}" y="${yy}">let ring</text>${b>a+30?`<line class="pml" x1="${a+30}" x2="${b+6}" y1="${yy-3}" y2="${yy-3}"/><line class="pml" x1="${b+6}" x2="${b+6}" y1="${yy-6}" y2="${yy}"/>`:''}`});
  if(ri===rows.length-1&&!row[row.length-1].repEnd)g+=`<rect class="endbar" x="${x+1}" y="${topY}" width="3" height="${(showTab?yT(0):yS(0))-topY}"/>`;
  const cTop=showStaff?yS(Math.max(8,maxP))-8:tabTop-8,cBot=showTab?tabBot+8:yS(Math.min(0,minP))+8;g+=`<rect class="tcursor" x="-2" y="${cTop}" width="3" height="${cBot-cTop}" rx="1.5"/>`;
  out.push(`<div class="tline tprow"><svg class="tab tabpro eng${showStaff?' withstaff':''}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${showStaff&&showTab?'Notation and tab':showStaff?'Notation':'Tab'}, bars ${row[0].i+1} to ${row[row.length-1].i+1}">${g}</svg></div>`)});
 return`<div class="tabpro-wrap">${out.join('')}</div>`}
function engTie(xa,xb,e,P,showStaff,showTab,yS,yT,down,trans,key,ref,cols){let s='';const it=e.it;
 if(showStaff){const ms=(it.chord&&it.chord.length?it.chord:it.m!=null?[it.m]:[]);ms.forEach(m=>{const p=engSpell(m+trans,key).step-ref;const cy=yS(p)+(down?-7:7);const a=xa+7,b=xb-7;if(b>a)s+=`<path class="tie" d="M${a} ${cy} Q${(a+b)/2} ${cy+(down?-7:7)} ${b} ${cy}"/>`})}
 if(showTab&&!showStaff){(cols||[]).forEach(c=>{const cy=yT(c.s)+9;const a=xa+6,b=xb-10;if(b>a)s+=`<path class="tie" d="M${a} ${cy} Q${(a+b)/2} ${cy+6} ${b} ${cy}"/>`})}
 return s}

