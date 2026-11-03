/* ================= drawing ================= */
const BLACK=new Set([1,3,6,8,10]);
function keyboard({start=48,end=72,on={},labels={}}={}){const wh=[],bl=[];for(let m=start;m<=end;m++)(BLACK.has(m%12)?bl:wh).push(m);const ww=100/wh.length;
 let s=`<div class="kb" role="group" aria-label="Piano keyboard">`;
 wh.forEach((m,i)=>s+=`<button class="k w ${on[m]||''}" style="left:${i*ww}%;width:${ww}%" data-midi="${m}" aria-label="${SHARPN[m%12]}${Math.floor(m/12)-1}"><span>${labels[m]?pr(labels[m]):''}</span></button>`);
 bl.forEach(m=>{const i=wh.indexOf(m-1);s+=`<button class="k b ${on[m]||''}" style="left:${(i+1)*ww-ww*.31}%;width:${ww*.62}%" data-midi="${m}" aria-label="${SHARPN[m%12]}${Math.floor(m/12)-1}"><span>${labels[m]?pr(labels[m]):''}</span></button>`});
 return s+'</div>'}
function kbFor(midis,names,rootMidi){const mn=Math.min(...midis),mx=Math.max(...midis);const start=Math.floor(mn/12)*12;let end=start+24;while(end<mx)end+=12;const on={},labels={};midis.forEach((m,i)=>{on[m]=(rootMidi!=null?(m%12===rootMidi%12):i===0)?'root':'on';if(names)labels[m]=names[i]});return keyboard({start,end,on,labels})}
const ACCG={'-2':'𝄫','-1':'♭','1':'♯','2':'𝄪'};
function staff({clef='treble',notes=[],sig=null,names=false,idx0=null}){const g=10;const ref=clef==='treble'?30:18;const ps=notes.map(n=>{if(n.rest)return 4;const q=parse(n.name);return n.oct*7+q.L-ref});const top=44+Math.max(0,(Math.max(0,...ps)-11))*g/2,base=top+4*g,y=p=>base-p*g/2;const extra=Math.max(0,(-6-Math.min(0,...ps)))*g/2;
 const sigW=sig&&sig.count?sig.count*10+8:0;const x0=72+sigW,step=48;const W=Math.max(200,x0+notes.length*step+16),H=base+46+extra;
 let s=`<svg class="staff" viewBox="0 0 ${W} ${H}" width="${W*1.25}" role="img" aria-label="Music staff">`;
 for(let i=0;i<5;i++)s+=`<line x1="4" x2="${W-4}" y1="${y(i*2)}" y2="${y(i*2)}"/>`;
 s+=clef==='treble'?`<text class="gl" x="8" y="${y(2)+21}" font-size="52">𝄞</text>`:`<text class="gl" x="9" y="${y(6)+26}" font-size="48">𝄢</text>`;
 if(sig&&sig.count){const P=sig.type==='sharp'?[8,5,9,6,3,7,4]:[4,7,3,6,2,5,1];const sh=clef==='bass'?-2:0;for(let k=0;k<sig.count;k++){const p=P[k]+sh;s+=`<text class="gl" x="${58+k*10}" y="${y(p)+(sig.type==='sharp'?4:3)}" font-size="30">${sig.type==='sharp'?'♯':'♭'}</text>`}}
 let ni=0;
 notes.forEach((n,i)=>{const x=x0+i*step;const q=n.q==null?1:n.q;
  if(n.rest){const gl=q>=4?'𝄻':q>=2?'𝄼':q>=1?'𝄽':q>=.5?'𝄾':'𝄿';const yy=q>=4?y(6)+2:q>=2?y(4)+1:y(4)+9;s+=`<text class="gl rest" x="${x-6}" y="${yy}" font-size="30">${gl}</text>`;if(q===3||q===1.5||q===.75)s+=`<circle class="hd" cx="${x+10}" cy="${y(5)}" r="2"/>`;return}
  const{L,a}=parse(n.name);const p=n.oct*7+L-ref;const cy=y(p);const id=idx0!=null?idx0+ni:null;ni++;
  if(p<=-2)for(let k=-2;k>=p;k-=2)s+=`<line class="lg" x1="${x-11}" x2="${x+11}" y1="${y(k)}" y2="${y(k)}"/>`;
  if(p>=10)for(let k=10;k<=p;k+=2)s+=`<line class="lg" x1="${x-11}" x2="${x+11}" y1="${y(k)}" y2="${y(k)}"/>`;
  if(a)s+=`<text class="gl" x="${x-21}" y="${cy+(a>0?4:3)}" font-size="30">${ACCG[a]}</text>`;
  if(id!=null)s+=`<path class="arr" data-n="${id}" d="M${x-5} ${top-30}h10l-5 7z"/>`;
  const hollow=q>=2;s+=`<ellipse class="hd${hollow?' open':''}" ${id!=null?`data-n="${id}"`:''} cx="${x}" cy="${cy}" rx="6.3" ry="4.5" transform="rotate(-20 ${x} ${cy})"/>`;
  if(q<4){const up=p<4;const sx=up?x+5.7:x-5.7,y1=up?cy-1:cy+1,y2=up?cy-33:cy+33;s+=`<line class="stem" x1="${sx}" x2="${sx}" y1="${y1}" y2="${y2}"/>`;
   const flags=q<.5?2:q<1?1:0;for(let f=0;f<flags;f++){const fy=y2+(up?f*7:-f*7);s+=up?`<path class="flag" d="M${sx} ${fy}c5 4 9 7 7 15c-1-5-4-8-7-9z"/>`:`<path class="flag" d="M${sx} ${fy}c5-4 9-7 7-15c-1 5-4 8-7 9z"/>`}}
  if(q===3||q===1.5||q===.75)s+=`<circle class="hd" cx="${x+11}" cy="${p%2===0?cy-4:cy}" r="2"/>`;
  if(names)s+=`<text class="nm" x="${x}" y="${H-4}" text-anchor="middle">${pr(n.name)}</text>`});
 return s+'</svg>'}

function fretboard({map=null,exact=null,spots=null,all=false,mark=null,strings=GSTR(),frets=12,bands=null}={}){const n=strings.length;const L=LEFTY();const W=frets>12?880:820,nx=50,fw=(W-nx-14)/frets,sy=i=>20+(n-1-i)*25,H=sy(0)+34;const M=x=>L?W-x:x;
 const mid=(a,b)=>(sy(a)+sy(b))/2;const c1=n===6?mid(2,3):mid(1,2);const X=f=>M(f===0?nx-17:nx+(f-.5)*fw);
 let s=`<div class="scroll"><svg class="fb" viewBox="0 0 ${W} ${H}" style="min-width:${frets>12?700:620}px" role="img" aria-label="${n===4?'Bass':'Guitar'} fretboard${L?', left-handed':''}"><rect class="bg" x="${L?14:nx}" y="${sy(n-1)-6}" width="${W-nx-14}" height="${sy(0)-sy(n-1)+12}" rx="3"/>`;
 if(bands)bands.forEach(b=>{const xa=M(b.from===0?nx-30:nx+(b.from-1)*fw),xb=M(nx+b.to*fw);const x=Math.min(xa,xb),w=Math.abs(xb-xa);s+=`<rect class="band ${b.cls}" x="${x}" y="${sy(n-1)-6}" width="${w}" height="${sy(0)-sy(n-1)+12}"/><text class="bl" x="${x+w/2}" y="10" text-anchor="middle">${b.label}</text>`});
 [3,5,7,9,15,17].filter(f=>f<=frets).forEach(f=>s+=`<circle class="inl" cx="${X(f)}" cy="${c1}" r="5"/>`);
 if(frets>=12){const[a,b]=n===6?[mid(1,2),mid(3,4)]:[mid(0,1),mid(2,3)];s+=`<circle class="inl" cx="${X(12)}" cy="${a}" r="5"/><circle class="inl" cx="${X(12)}" cy="${b}" r="5"/>`}
 for(let f=1;f<=frets;f++)s+=`<line class="fr" x1="${M(nx+f*fw)}" x2="${M(nx+f*fw)}" y1="${sy(n-1)-6}" y2="${sy(0)+6}"/><text class="fn" x="${X(f)}" y="${H-6}" text-anchor="middle">${f}</text>`;
 s+=`<line class="nut" x1="${M(nx)}" x2="${M(nx)}" y1="${sy(n-1)-6}" y2="${sy(0)+6}"/>`;
 for(let i=0;i<n;i++)s+=`<text class="sn" x="${M(8)}" y="${sy(i)+4}" text-anchor="${L?'end':'start'}">${SHARPN[strings[i]%12]}</text><line class="st" x1="${M(nx-30)}" x2="${M(W-14)}" y1="${sy(i)}" y2="${sy(i)}" style="stroke-width:${n===6?2.4-i*.3:3.2-i*.5}"/>`;
 if(all)for(let i=0;i<n;i++)for(let f=0;f<=frets;f++)s+=`<g class="fd ghost" data-midi="${strings[i]+f}" data-s="${i}" data-f="${f}"><circle cx="${X(f)}" cy="${sy(i)}" r="10.5"/></g>`;
 const dots=[];
 if(spots)spots.forEach(p=>dots.push(p));
 else for(let i=0;i<n;i++)for(let f=0;f<=frets;f++){const m=strings[i]+f;const e=(exact&&exact[m])||(map&&map[m%12]);if(e)dots.push({s:i,f,name:e.name,root:e.root})}
 dots.forEach(p=>{const m=strings[p.s]+p.f;s+=`<g class="fd ${p.root?'root':''} ${p.cls||''}" data-midi="${m}" data-s="${p.s}" data-f="${p.f}"><circle cx="${X(p.f)}" cy="${sy(p.s)}" r="10.5"/><text x="${X(p.f)}" y="${sy(p.s)+3.6}" text-anchor="middle">${p.name?pr(p.name):''}</text></g>`});
 if(mark)s+=`<g class="fd root"><circle cx="${X(mark.f)}" cy="${sy(mark.s)}" r="11"/><text x="${X(mark.f)}" y="${sy(mark.s)+4}" text-anchor="middle" style="font-size:13px">?</text></g>`;
 return s+'</svg></div>'}
function chordBox(shape,rootPc,names,small){const fr=shape.frets;const L=LEFTY();const played=fr.filter(f=>f!=null&&f>0);const mx=played.length?Math.max(...played):0,mn=played.length?Math.min(...played):0;const base=mx<=5?1:mn;
 const W=140,left=30,sw=(W-60)/5,top=36,fh=22,H=top+5*fh+(small?10:28);const SX=i=>left+(L?5-i:i)*sw;
 let s=`<svg class="cbox" viewBox="0 0 ${W} ${H}" role="img" aria-label="Guitar chord diagram">`;
 for(let i=0;i<6;i++)s+=`<line x1="${left+i*sw}" x2="${left+i*sw}" y1="${top}" y2="${top+5*fh}"/>`;
 for(let f=0;f<=5;f++)s+=`<line class="${f===0&&base===1?'nutl':''}" x1="${left}" x2="${left+5*sw}" y1="${top+f*fh}" y2="${top+f*fh}"/>`;
 if(base>1)s+=`<text class="base" x="0" y="${top+fh*.68}" style="font-size:10px">${base}fr</text>`;
 if(shape.barre!=null){const idx=fr.map((f,i)=>f===shape.barre?i:-1).filter(i=>i>=0);if(idx.length>1){const xs=idx.map(SX);const a=Math.min(...xs),b=Math.max(...xs),cy=top+(shape.barre-base+.5)*fh;s+=`<rect class="cbar" x="${a-6}" y="${cy-6}" width="${b-a+12}" height="12" rx="6"/>`}}
 fr.forEach((f,i)=>{const x=SX(i);const pc=f==null?null:(STR[i]+f)%12;
  if(f==null)s+=`<text x="${x}" y="${top-9}" text-anchor="middle">×</text>`;
  else if(f===0)s+=`<circle class="open" cx="${x}" cy="${top-13}" r="4.5"/>`;
  else s+=`<circle class="dot ${pc===rootPc?'root':''}" cx="${x}" cy="${top+(f-base+.5)*fh}" r="7"/>`;
  if(!small&&f!=null&&names)s+=`<text class="lbl" x="${x}" y="${H-8}" text-anchor="middle">${pr(names[pc]||SHARPN[pc])}</text>`});
 return s+'</svg>'}
function tabSVG(strings,cols,hi=-1,off=0,marks=null,arrows=false){const n=strings.length,W=Math.max(220,44+cols.length*36);const top=(arrows?12:0)+(marks&&marks.some(Boolean)?14:0);const H=26+n*16+top;const y=i=>18+top+(n-1-i)*16;
 let s=`<svg class="tab" viewBox="0 0 ${W} ${H}" width="${Math.min(W*1.25,900)}" role="img" aria-label="Tab">`;
 for(let i=0;i<n;i++)s+=`<text class="tl" x="4" y="${y(i)+4}">${SHARPN[strings[i]%12]}</text><line x1="20" x2="${W-6}" y1="${y(i)}" y2="${y(i)}"/>`;
 cols.forEach((c,j)=>{const x=40+j*36;if(arrows)s+=`<path class="arr" data-c="${off+j}" d="M${x-5} 2h10l-5 7z"/>`;if(marks&&marks[j])s+=`<text class="mk" x="${x}" y="${(arrows?12:0)+10}" text-anchor="middle">${marks[j]}</text>`;(Array.isArray(c)?c:[c]).forEach(p=>{s+=`<rect class="tb${j===hi?' hi':''}" data-c="${off+j}" x="${x-10}" y="${y(p.s)-7}" width="20" height="14" rx="3"/><text class="tn${j===hi?' hi':''}" data-c="${off+j}" x="${x}" y="${y(p.s)+4}" text-anchor="middle">${p.f}</text>`})});
 return s+'</svg>'}
const RN=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
function identify(midis){const pcs=[...new Set(midis.map(m=>m%12))];if(pcs.length<2)return[];const bass=Math.min(...midis)%12;const out=[];
 if(pcs.length===2){const iv=(pcs[1]-pcs[0]+12)%12;const a=[pcs[0],pcs[1]];const lo=bass,hi=a.find(x=>x!==lo);const d=(hi-lo+12)%12;if(d===7)return[{name:pr(RN[lo])+'5',desc:'Power chord: root and 5th'}];const IVN={1:'Minor 2nd',2:'Major 2nd',3:'Minor 3rd',4:'Major 3rd',5:'Perfect 4th',6:'Tritone',8:'Minor 6th',9:'Major 6th',10:'Minor 7th',11:'Major 7th'};return[{name:`${pr(RN[lo])} + ${pr(RN[hi])}`,desc:IVN[d]+', two different notes'}]}
 for(const root of pcs){const iv=new Set(pcs.map(p=>(p-root+12)%12));for(const t in CH){const set=new Set(CH[t].st.map(([s])=>s%12));
  const same=set.size===iv.size&&[...set].every(x=>iv.has(x));const no5=!iv.has(7)&&set.has(7)&&set.size-1===iv.size&&[...set].filter(x=>x!==7).every(x=>iv.has(x));
  if(same||no5)out.push({root,t,no5,score:(root===bass?0:1)+(no5?.5:0)+(['9','13','7b9','7#9','7#5','7sus4','mMaj7'].includes(t)?.3:0)})}}
 out.sort((a,b)=>a.score-b.score);const seen=new Set();return out.filter(o=>{const k=o.root+o.t;if(seen.has(k))return false;seen.add(k);return true}).slice(0,4).map(o=>({name:pr(RN[o.root])+CH[o.t].sym+(o.root!==bass?'/'+pr(RN[bass]):''),desc:CH[o.t].name+(o.no5?' (no 5th)':'')+(o.root!==bass?`, with ${pr(RN[bass])} in the bass`:'')}))}

function instView(midis,names,rootMidi){const inst=INST();if(inst==='piano')return kbFor(midis,names,rootMidi);const rp=((rootMidi!=null?rootMidi:midis[0])%12+12)%12;const map={};midis.forEach((m,i)=>{const pc=m%12;if(!map[pc])map[pc]={name:names?names[i]:SHARPN[pc],root:pc===rp}});return fretboard({map,strings:inst==='bass'?BSTR():GSTR()})}
function grooveGrid(p){const per=p.per||p.steps/4;const gs=new Set();if(p.groups){let o=0;p.groups.forEach(g=>{gs.add(o);o+=g})}const lab=p.den===8?(i=>i%2===0?String(i/2+1):'&'):(i=>i%per===0?String(Math.floor(i/per)+1):(per===4?['','e','&','a']:['','&','a'])[i%per]);
 return`<div class="scroll"><table class="grid"><thead><tr><th></th>${Array.from({length:p.steps},(_,i)=>`<th class="${(p.groups?gs.has(i):i%per===0)?'beat':''}">${lab(i)}</th>`).join('')}</tr></thead><tbody>${ROWS.map(([k,l])=>{const row=p.rows[k]||'.'.repeat(p.steps);return`<tr><th scope="row">${l}</th>${[...row].map((ch,i)=>`<td><button class="cell ${ch==='x'?'on':ch==='o'?'gh':''}" data-k="${k}" data-i="${i}" aria-label="${l}, step ${i+1}"></button></td>`).join('')}</tr>`}).join('')}</tbody></table></div>`}
function pentaSpots(key,k,S){const pc=parse(key).pc;const semis=[0,3,5,7,10];const r=(pc-S[0]%12+12)%12;const start=S[0]+r;const tones=[];for(let o=0;o<5;o++)for(const x of semis)tones.push(start+o*12+x);
 const names=scaleNotes(key,'minpent');const st=tones.slice(k);const spots=[];S.forEach((open,i)=>[st[2*i],st[2*i+1]].forEach(p=>spots.push({s:i,f:p-open,name:names[semis.indexOf((p-start)%12)],root:(p-start)%12===0})));
 if(Math.min(...spots.map(x=>x.f))>=12)spots.forEach(x=>x.f-=12);return spots}


const ICON={play:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>',again:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2a6 6 0 1 0 6 6h-2a4 4 0 1 1-1.2-2.8L9 7h5V2l-1.8 1.8A6 6 0 0 0 8 2z" fill="currentColor"/></svg>'};

