/* v57: a trained note model for the song transcriber's bass and vocal lines.
   The hand-tuned pitch tracker merged repeated notes, jumped octaves and heard notes in the gaps. The Basic Pitch
   note model (Spotify, Apache 2.0, 230 KB) gives, for every 11.6 ms and each of the 88 piano keys, how likely a
   note is sounding and starting. A best-path search through those turns them into one clear line.
   Tested on six band arrangements and a real recording: bass notes right 70% → 80% (from the AI-separated part)
   and 59% → 85% on the real song's bass; vocals from the AI-separated part 63% → 72%.
   Desktop app: runs on the built-in ONNX Runtime (no download). Website and Android: ONNX Runtime Web,
   loaded the first time it's needed. If neither can run, the transcriber's own method is used. */
const BPN={fps:22050/256,win:142,hop:36164};
/* frame index → seconds: each 2-second window gives 142 usable frames and windows start every 36,164 samples */
const bpTime=f=>{const w=Math.floor(f/BPN.win);return(w*BPN.hop+(f-w*BPN.win)*256)/22050};
/* one line through the note activations: a best path over the keys in range plus "silence", then repeated notes
   split where the model hears a new start */
function bpMono(note,onset,nf,R,o={}){const lo=R[0]-21,hi=R[1]-21,K=hi-lo+1,S=K+1;
 const sw=o.sw??2.2,sil=o.sil??.32,ons=o.ons??.5,minF=o.minF??4,oct=o.oct??0;
 const em=new Float32Array(S),dp=new Float32Array(S),nd=new Float32Array(S),bp=new Int16Array(nf*S);
 const E=t=>{for(let k=0;k<K;k++){let v=note[t*88+lo+k];if(oct&&lo+k-12>=0){const u=note[t*88+lo+k-12];if(u>.12)v=Math.max(0,v-oct*u)}em[k]=Math.log(v+1e-4)}em[K]=Math.log(sil)};
 if(!nf)return[];E(0);for(let s=0;s<S;s++)dp[s]=em[s];
 for(let t=1;t<nf;t++){E(t);let b1=-1e9,i1=0;for(let s=0;s<S;s++)if(dp[s]>b1){b1=dp[s];i1=s}
  for(let s=0;s<S;s++){let best=dp[s],bi=s;const c=b1-(s===K||i1===K?sw*.6:sw);if(c>best){best=c;bi=i1}
   if(s<K&&onset[t*88+lo+s]>ons){const c2=b1-sw*.2;if(c2>best){best=c2;bi=i1}}nd[s]=best+em[s];bp[t*S+s]=bi}dp.set(nd)}
 let s=0,b=-1e9;for(let k=0;k<S;k++)if(dp[k]>b){b=dp[k];s=k}const path=new Int16Array(nf);for(let t=nf-1;t>=0;t--){path[t]=s;s=bp[t*S+s]}
 const notes=[];let t0=0;for(let t=1;t<=nf;t++){if(t<nf&&path[t]===path[t0])continue;if(path[t0]<K){const p=path[t0];const cuts=[t0];
   for(let u=t0+minF;u<t-minF+1;u++){const v=onset[u*88+lo+p];if(v>ons&&v>=onset[(u-1)*88+lo+p]&&v>=onset[(u+1)*88+lo+p]&&u-cuts[cuts.length-1]>=minF)cuts.push(u)}cuts.push(t);
   for(let c=0;c<cuts.length-1;c++){const a=cuts[c],z=cuts[c+1];if(z-a<minF)continue;let amp=0;for(let u=a;u<z;u++)amp+=note[u*88+lo+p];
    notes.push({t:+bpTime(a).toFixed(3),d:+Math.max(.06,bpTime(z)-bpTime(a)).toFixed(3),m:p+R[0],v:Math.round(50+70*Math.min(1,amp/(z-a)))})}}t0=t}
 return notes}
/* the model file: inline in the single-file app, a separate file on the website */
let BPMODEL=null;function bpModel(){if(BPMODEL)return BPMODEL;BPMODEL=(async()=>{let b64=SMPDATA.bpmodel;if(!b64){const r=await fetch('smp-bpmodel.json');if(!r.ok)throw new Error('no model');b64=JSON.parse(await r.text())}
 const s=atob(b64),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u})();BPMODEL.catch(()=>{BPMODEL=null});return BPMODEL}
/* ONNX Runtime Web for the website and Android */
const ORTV='1.23.0';let ORTP=null;
function ortLoad(){if(ORTP)return ORTP;const base=window.__ORTBASE||`https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORTV}/dist/`;
 ORTP=new Promise((res,rej)=>{if(window.ort&&window.ort.InferenceSession)return res(window.ort);const s=document.createElement('script');s.src=base+'ort.wasm.min.js';
  s.onload=()=>{try{ort.env.wasm.wasmPaths=base;ort.env.wasm.numThreads=1;res(ort)}catch(e){rej(e)}};s.onerror=()=>rej(new Error('ONNX Runtime Web did not load'));document.head.appendChild(s)});
 ORTP.catch(()=>{ORTP=null});return ORTP}
let BPSESS=null;
async function bpWebInfer(x,onP){const ort=await ortLoad();if(!BPSESS)BPSESS=ort.InferenceSession.create(await bpModel(),{executionProviders:['wasm']}).catch(e=>{BPSESS=null;throw e});const sess=await BPSESS;
 const NS=43844,OL=7680,HOP=NS-OL;const a=new Float32Array(OL/2+x.length);a.set(x,OL/2);const starts=[];for(let i=0;i<a.length;i+=HOP)starts.push(i);
 const nf=Math.floor(x.length*86/22050),note=new Float32Array(starts.length*142*88),onset=new Float32Array(starts.length*142*88);let f=0;const B=4;
 for(let g=0;g<starts.length;g+=B){const grp=starts.slice(g,g+B),buf=new Float32Array(grp.length*NS);grp.forEach((st,k)=>buf.set(a.subarray(st,Math.min(a.length,st+NS)),k*NS));
  const out=await sess.run({'serving_default_input_2:0':new ort.Tensor('float32',buf,[grp.length,NS,1])});const nv=out['StatefulPartitionedCall:1'].data,ov=out['StatefulPartitionedCall:2'].data;
  for(let k=0;k<grp.length;k++){const base=k*172*88+15*88;note.set(nv.subarray(base,base+142*88),f*88);onset.set(ov.subarray(base,base+142*88),f*88);f+=142}
  if(onP)onP(Math.min(1,(g+B)/starts.length));await new Promise(r=>setTimeout(r,0))}
 const n=Math.min(nf,f);return{note:note.subarray(0,n*88),onset:onset.subarray(0,n*88),nf:n}}
async function bpDeskInfer(x,onP){const un=await aiListen(p=>{if(p.stage==='notes'&&onP)onP(p.p||0)});try{const ab=await TAU.invoke('ai_notes',new Uint8Array(x.buffer,x.byteOffset,x.byteLength));
  const f=new Float32Array(ab instanceof ArrayBuffer?ab:new Uint8Array(ab).buffer);const h=f.length/2;return{note:f.subarray(0,h),onset:f.subarray(h),nf:h/88}}finally{un()}}
/* can this copy of the app run the note model? */
async function bpCan(){if(store.get('noteModel',true)===false)return null;if(TAU){if(!AISEP.st)await aiStatus();if(AISEP.st&&AISEP.st.runtime)return'desk';if(!DROID)return null}return typeof WebAssembly==='object'?'web':null}
async function bpLine(x,part,onP){const how=await bpCan();if(!how)return null;const P=how==='desk'?await bpDeskInfer(x,onP):await bpWebInfer(x,onP);
 return part==='bass'?bpMono(P.note,P.onset,P.nf,[23,67],{minF:6,oct:1}):bpMono(P.note,P.onset,P.nf,[43,88],{minF:4})}
/* in the transcriber: the bass always, the vocals when they came from the AI separator (on the standard
   separator's vocal part the model also picks up the instruments that leak through) */
{const _tp=tsPost;tsPost=async function(W,rs,bar,b){const part=TS.part;TS.noteModel=null;
 if(part==='bass'||part==='vocals'){const om=W.onmessage;W.onmessage=async e=>{const d=e.data;if(!d||!d.done||d.error||!d.stem||(part==='vocals'&&TS.aiUsed!=='vocals'))return om(e);
   try{rs.textContent=`Finding the ${part==='bass'?'bass notes':'sung notes'} with the note model…`;const x=d.sr===22050?d.stem:null;
    if(x){const notes=await bpLine(x,part,p=>{rs.textContent=`Finding the ${part==='bass'?'bass notes':'sung notes'} with the note model… ${Math.round(p*100)}%`;bar.style.width=Math.round(92+p*8)+'%'});
     if(notes&&notes.length>=3){d.notes=notes;TS.noteModel=part}}}catch(err){console.warn('note model:',err)}om({data:d})}}
 TS.aiUsed=null;return _tp(W,rs,bar,b)}}
Object.assign(window,{bpMono,bpTime,bpLine,bpCan,ortLoad,bpWebInfer});
/* say how the notes were found, next to the "Fix a wrong note" box */
{const _fp=tsFixPanel;tsFixPanel=function(){_fp();const d=document.getElementById('tsfix');if(!d||!TS.res)return;let n=document.getElementById('tsnm');const on=TS.noteModel&&TS.res.part===TS.noteModel;
 if(!on){if(n)n.remove();return}if(!n){d.insertAdjacentHTML('beforebegin','<p class="hint" id="tsnm"></p>');n=document.getElementById('tsnm')}
 const t=`The ${TS.noteModel==='bass'?'bass':'sung'} notes were found with a trained note model (Basic Pitch). If one is still wrong, fix it below.`;if(n.textContent!==t)n.textContent=t}}
