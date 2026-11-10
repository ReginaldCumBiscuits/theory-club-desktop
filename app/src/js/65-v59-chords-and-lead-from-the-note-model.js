/* v59: guitar chords and the lead line from the note model, and a bass line that survives synth bass.
   Worked out on a whole album (eight real songs, from the AI-separated parts): the chords matched published
   chord charts about 94% of the time, and the bass notes land on a chord tone about 85% of the time.
   How the chords are found:
   1. the note model (Basic Pitch) hears every note in the guitar & keys part, and every note in the low end
      (the AI bass part, or the low end of the rest of the song);
   2. each beat gets a score for every chord: the notes it holds, and above all the bass note under it
      (in pop and rock the bass mostly plays the chord's root);
   3. songs repeat, so each beat borrows some evidence from the beats that sound most like it;
   4. a best-path search picks the chords, with changes cheap where this song changes chord (found from the
      song itself: every bar, every half bar, on the "and" for pushed chords) and dear elsewhere;
   5. the key is chosen from the notes and the chords, and the chords are spelled for that key. */
const CQ={'':[0,4,7],m:[0,3,7],'7':[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10],'6':[0,4,7,9],m6:[0,3,7,9],sus4:[0,5,7],sus2:[0,2,7],dim:[0,3,6],aug:[0,4,8],m7b5:[0,3,6,10],add9:[0,2,4,7]};
const CQP={'':0,m:0,'7':-.04,maj7:-.04,m7:-.04,'6':-.06,m6:-.08,sus4:-.07,sus2:-.08,dim:-.1,aug:-.1,m7b5:-.1,add9:-.08};
/* the app's own chord types (used for chord shapes and the chord sound) */
const CQT={'':'maj',m:'min','7':'7',maj7:'maj7',m7:'m7','6':'6',m6:'m6',sus4:'sus4',sus2:'sus2',dim:'dim',aug:'aug',m7b5:'m7b5',add9:'add9'};
const CLAB=[];for(let r=0;r<12;r++)for(const q in CQ)CLAB.push([r,q]);
const CTPL=CLAB.map(([r,q])=>{const t=new Float32Array(12);CQ[q].forEach((iv,i)=>{t[(r+iv)%12]=i===2?.8:1});t[r]=1.2;let n=0;for(const v of t)n+=v*v;n=Math.sqrt(n);return t.map(v=>v/n)});
const CTONE=CLAB.map(([r,q])=>{const t=new Float32Array(12);CQ[q].forEach(iv=>t[(r+iv)%12]=1);return t});
const N_SH=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],N_FL=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const KMAJ=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88],KMIN=[6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
/* per-beat pitch-class sums of the note model's "a note is sounding" values */
function cfBeats(P,beats,dur,lo,hi){const n=beats.length,out=[];let f=0;const nf=P.nf;
 for(let i=0;i<n;i++){const a=beats[i],z=i+1<n?beats[i+1]:dur,c=new Float32Array(12);while(f<nf&&bpTime(f)<a)f++;let g=f;
  while(g<nf&&bpTime(g)<z){for(let p=lo-21;p<=hi-21;p++)c[(p+21)%12]+=P.note[g*88+p];g++}out.push(c)}return out}
/* songs repeat: each beat borrows from the K beats that sound most like it, in context */
function cfRepeat(G,B,K=6,wt=.3,ctx=3){const n=G.length;if(n<16)return;const D=24,F=new Float32Array(n*D);
 const nz=(v,o)=>{let s=0;for(const x of v)s+=x*x;s=Math.sqrt(s)+1e-9;for(let k=0;k<12;k++)F[o+k]=v[k]/s};
 for(let i=0;i<n;i++){nz(G[i],i*D);nz(B[i],i*D+12)}
 const W=(2*ctx+1)*D,C=new Float32Array(n*W);for(let i=0;i<n;i++){let s=0;for(let k=-ctx;k<=ctx;k++){const j=i+k;if(j<0||j>=n)continue;for(let d=0;d<D;d++){const v=F[j*D+d];C[i*W+(k+ctx)*D+d]=v;s+=v*v}}s=Math.sqrt(s)+1e-9;for(let d=0;d<W;d++)C[i*W+d]/=s}
 const sumN=v=>{let s=0;for(const x of v)s+=x;return s+1e-9},Gn=G.map(v=>v.map(x=>x/sumN(v))),Bn=B.map(v=>v.map(x=>x/sumN(v)));
 for(let i=0;i<n;i++){const best=[];for(let j=0;j<n;j++){if(Math.abs(j-i)<=3)continue;let s=0;for(let d=0;d<W;d++)s+=C[i*W+d]*C[j*W+d];if(s<=.75)continue;best.push([s,j])}
  best.sort((a,b)=>b[0]-a[0]);const top=best.slice(0,K);const g=Gn[i].slice(),b=Bn[i].slice();
  if(top.length){for(const[,j]of top)for(let k=0;k<12;k++){g[k]+=wt*Gn[j][k]/top.length;b[k]+=wt*Bn[j][k]/top.length}}G[i]=g;B[i]=b}}
function cfScore(G,B,wb){return G.map((g,i)=>{let gn=0;for(const x of g)gn+=x*x;gn=Math.sqrt(gn)+1e-9;let bs=0;for(const x of B[i])bs+=x;bs+=1e-9;
 return CLAB.map(([r,q],l)=>{let s=0,ct=0;const T=CTPL[l],O=CTONE[l];for(let k=0;k<12;k++){s+=g[k]/gn*T[k];ct+=B[i][k]/bs*O[k]}return s+wb*B[i][r]/bs+.12*ct+CQP[q]})})}
function cfPath(S,pen){const n=S.length,K=CLAB.length;if(!n)return[];let dp=Float64Array.from(S[0]);const bp=new Uint16Array(n*K);
 for(let t=1;t<n;t++){let b=0;for(let k=1;k<K;k++)if(dp[k]>dp[b])b=k;const mv=dp[b]-pen[t],nd=new Float64Array(K);for(let k=0;k<K;k++){if(dp[k]>=mv){nd[k]=dp[k]+S[t][k];bp[t*K+k]=k}else{nd[k]=mv+S[t][k];bp[t*K+k]=b}}dp=nd}
 let k=0;for(let q=1;q<K;q++)if(dp[q]>dp[k])k=q;const p=new Array(n);for(let t=n-1;t>=0;t--){p[t]=k;k=bp[t*K+k]}return p}
const cfCorr=(a,b)=>{const ma=a.reduce((s,x)=>s+x,0)/12,mb=b.reduce((s,x)=>s+x,0)/12;let n=0,da=0,db=0;for(let i=0;i<12;i++){n+=(a[i]-ma)*(b[i]-mb);da+=(a[i]-ma)**2;db+=(b[i]-mb)**2}return n/Math.sqrt(da*db+1e-12)};
/* the chords, one entry per beat (like the transcriber's own) */
function cfChords(PG,PB,beats,dur,o={}){const WB=o.wb??1.5,CH=o.ch??.1,EX=o.ex??.7;if(!beats||beats.length<8)return null;
 let G=cfBeats(PG,beats,dur,40,88),B=cfBeats(PB,beats,dur,23,60);const en=G.map(v=>v.reduce((s,x)=>s+x,0)),bin=B.map(v=>v.reduce((s,x)=>s+x,0));
 const ch=new Float32Array(12);G.forEach((v,i)=>{for(let k=0;k<12;k++)ch[k]+=v[k]+B[i][k]});
 cfRepeat(G,B);const S=cfScore(G,B,WB);const n=S.length;
 const p0=cfPath(S,new Array(n).fill(CH)),chg=p0.map((l,i)=>i&&l!==p0[i-1]?1:0);
 const med=[...beats.slice(1).map((b,i)=>b-beats[i])].sort((a,b)=>a-b)[beats.length>>1]||.5;const per=60/med>160?8:4;
 let db=0,bestC=-1;for(let k=0;k<per;k++){let c=0;for(let i=k;i<n;i+=per)c+=chg[i];if(c>bestC){bestC=c;db=k}}
 const rate=new Array(per).fill(0),cnt=new Array(per).fill(0);for(let i=0;i<n;i++){const q=((i-db)%per+per)%per;rate[q]+=chg[i];cnt[q]++}
 const rm=Math.max(1e-6,...rate.map((v,i)=>v/Math.max(1,cnt[i])));const pen=new Array(n);for(let i=0;i<n;i++){const q=((i-db)%per+per)%per;pen[i]=CH+EX*(1-rate[q]/Math.max(1,cnt[q])/rm)}
 const p=cfPath(S,pen);
 /* a chord that lasts one eighth note at a fast tempo is a passing note, not a change */
 if(per===8){let i=0;while(i<n){let j=i;while(j<n&&p[j]===p[i])j++;if(j-i<2&&i>0)for(let u=i;u<j;u++)p[u]=p[i-1];i=j}}
 /* key: the pitch profile, then the chords decide between near neighbours */
 const kix=l=>{const[r,q]=CLAB[l];return r+(q==='m'||q==='m7'||q==='m6'?12:0)};const td=new Float32Array(24);p.forEach(l=>td[kix(l)]++);const tot=Math.max(1,p.length);
 let kb=null;for(let r=0;r<12;r++)for(let qi=0;qi<2;qi++){const P=(qi?KMIN:KMAJ).map((v,i)=>(qi?KMIN:KMAJ)[(i-r+12)%12]);const k=r+12*qi;
  const sc=cfCorr(P,ch)+1.2*td[k]/tot+.2*(kix(p[0])===k)+.15*(kix(p[n-1])===k)+.08*(qi===0);if(!kb||sc>kb[0])kb=[sc,r,qi]}
 const maj=kb[2]?(kb[1]+3)%12:kb[1],NM=[5,10,3,8,1].includes(maj)?N_FL:N_SH;const key=NM[kb[1]]+(kb[2]?'m':'');
 const emax=Math.max(1e-9,...en);const out=[];let i=0;
 while(i<n){let j=i;while(j<n&&p[j]===p[i])j++;const[r,q]=CLAB[p[i]];const bs=new Float32Array(12);for(let u=i;u<j;u++)for(let k=0;k<12;k++)bs[k]+=B[u][k];
  let br=0;for(let k=1;k<12;k++)if(bs[k]>bs[br])br=k;const bsum=bs.reduce((s,x)=>s+x,0);let name=NM[r]+q;if(br!==r&&bs[br]>.55*bsum)name+='/'+NM[br];
  for(let u=i;u<j;u++){const t=beats[u],z=u+1<n?beats[u+1]:dur;const quiet=en[u]<emax*.012&&bin[u]<1e-3;
   out.push(quiet?{t:+t.toFixed(3),d:+(z-t).toFixed(3),name:'N'}:{t:+t.toFixed(3),d:+(z-t).toFixed(3),root:r,type:CQT[q],name,en:en[u]})}i=j}
 return{chords:out,key,per,downbeat:db}}
/* a mono copy at 22.05 kHz, lowpassed (the low end of the rest of the song, for the bass under the chords) */
function cfBiquad(x,sr,f,type){const w=2*Math.PI*f/sr,c=Math.cos(w),s=Math.sin(w)/(2*Math.SQRT1_2);let b0,b1,b2;const a0=1+s,a1=-2*c,a2=1-s;
 if(type==='lp'){b0=(1-c)/2;b1=1-c;b2=(1-c)/2}else{b0=(1+c)/2;b1=-(1+c);b2=(1+c)/2}
 const y=new Float32Array(x.length);let x1=0,x2=0,y1=0,y2=0;for(let i=0;i<x.length;i++){const v=(b0*x[i]+b1*x1+b2*x2-a1*y1-a2*y2)/a0;x2=x1;x1=x[i];y2=y1;y1=v;y[i]=v}return y}
const cfLow=(x,sr,f=200)=>cfBiquad(cfBiquad(cfBiquad(x,sr,f,'lp'),sr,f,'lp'),sr,f,'lp');
const cfMono=(L,R)=>{if(!R||R===L)return L;const m=new Float32Array(L.length);for(let i=0;i<m.length;i++)m[i]=(L[i]+R[i])/2;return m};
/* synth bass (and some bass guitars) lands in the AI's "guitar & keys" part. Where the bass part is nearly empty
   but that part is full of low notes, the bass line takes its low end too. */
function cfBassMix(b,o,sr){const band=x=>cfBiquad(cfBiquad(cfLow(x,sr,180),sr,35,'hp'),sr,35,'hp');const lb=band(b),lob=band(o),lo=cfLow(cfLow(o,sr,220),sr,220);
 const w=sr*2,n=Math.ceil(b.length/w),mix=new Float32Array(n);let any=false;
 for(let k=0;k<n;k++){let eb=0,eo=0;const a=k*w,z=Math.min(b.length,a+w);for(let i=a;i<z;i++){eb+=lb[i]*lb[i];eo+=lob[i]*lob[i]}mix[k]=Math.max(0,Math.min(1,(Math.sqrt(eo/(eb+1e-12))-2)/3));if(mix[k]>0)any=true}
 if(!any)return null;const y=new Float32Array(b.length);for(let i=0;i<y.length;i++){const u=i/w-.5,k=Math.max(0,Math.min(n-1,Math.floor(u))),k2=Math.min(n-1,k+1),fr=Math.max(0,Math.min(1,u-k));y[i]=b[i]+(mix[k]*(1-fr)+mix[k2]*fr)*lo[i]}return y}
{const _ai=aiSeparate;aiSeparate=async function(part,onP){const r=await _ai(part,onP);if(part!=='bass'||r.mixed!=null)return r;let o=null;try{o=await _ai('other',()=>{})}catch(e){}
  if(o){const L=cfBassMix(r.L,o.L,r.sr),R=cfBassMix(r.R,o.R,r.sr);if(L&&R){let e1=0,e2=0;for(let i=0;i<L.length;i+=8)e1+=L[i]*L[i];for(let i=0;i<o.L.length;i+=8)e2+=(o.L[i]+r.L[i])**2;
    const m={L,R,sr:r.sr,mixed:true,quiet:Math.sqrt(e1)<.03*Math.sqrt(e2)};TS.ai.bass=m;return m}}r.mixed=false;return r}}
/* guitar chords and the lead line, in the transcriber */
async function bpPost(x,onP){const how=await bpCan();if(!how)return null;x=bpLevel(x);return how==='desk'?bpDeskInfer(x,onP):bpWebInfer(x,onP)}
{const _tp=tsPost;tsPost=async function(W,rs,bar,b){if(TS.part!=='other')return _tp(W,rs,bar,b);TS.cfKey=null;const om=W.onmessage;
 W.onmessage=async e=>{const d=e.data;if(!d||!d.done||d.error||!d.stem||d.sr!==22050)return om(e);
  try{const say=(m,p)=>{rs.textContent=m+(p!=null?` ${Math.round(p*100)}%`:'');if(p!=null)bar.style.width=Math.round(90+p*10)+'%'};
   say('Hearing the guitar and keys notes with the note model…',0);const PG=await bpPost(d.stem,p=>say('Hearing the guitar and keys notes with the note model…',p*.6));
   if(PG){let low=null;if(TS.aiUsed==='other'){try{const bs=await aiSeparate('bass',()=>{});if(bs&&!bs.quiet)low=cfMono(bs.L,bs.R)}catch(err){}}
    if(!low&&d.rest)low=cfLow(d.rest,22050,200);
    say('Hearing the bass under the chords…',.6);const PB=low?await bpPost(low,p=>say('Hearing the bass under the chords…',.6+p*.35)):null;
    const dur=d.stem.length/22050;const C=cfChords(PG,PB||{note:new Float32Array(PG.nf*88),nf:PG.nf},d.beats,dur);
    if(C&&C.chords.filter(c=>c.name!=='N').length>4){d.chords=C.chords;d.key=C.key;TS.cfKey=C.key}
    const lead=bpMono(PG.note,PG.onset,PG.nf,[40,88],{minF:5});if(lead.length>=3)d.notes=lead;TS.noteModel='other'}}catch(err){console.warn('chords from the note model:',err)}om({data:d})};
 return _tp(W,rs,bar,b)}}
/* chord shapes for the new chord types */
Object.assign(EFORM,{'6':[0,2,2,1,2,0],m6:[0,2,2,0,2,0],add9:[0,2,4,1,0,0]});Object.assign(AFORM,{'6':[null,0,2,2,2,2],m6:[null,0,2,2,1,2],add9:[null,0,2,4,2,0]});
{const _cs=tsChordShape;tsChordShape=function(c){const r=_cs(c);if(r||!c||c.name==='N')return r;try{const sh=guitarShape(TS_NAMES[c.root],c.type);if(sh&&sh.frets)return sh.frets}catch(e){}return null}}
/* the hint next to "Fix a wrong note" also covers the guitar part, and names the key */
{const _fp=tsFixPanel;tsFixPanel=function(){_fp();if(!TS.res||TS.res.part!=='other'||TS.noteModel!=='other')return;const d=document.getElementById('tsfix');if(!d)return;let n=document.getElementById('tsnm');
 if(!n){d.insertAdjacentHTML('beforebegin','<p class="hint" id="tsnm"></p>');n=document.getElementById('tsnm')}
 const t=`The chords and lead line were found with a trained note model (Basic Pitch)${TS.cfKey?`. The song looks to be in ${TS.cfKey.replace(/m$/,' minor')}${/m$/.test(TS.cfKey)?'':' major'}`:''}. If something is still wrong, fix it below.`;if(n.textContent!==t)n.textContent=t}}
Object.assign(window,{cfChords,cfBassMix,cfLow,bpPost});
