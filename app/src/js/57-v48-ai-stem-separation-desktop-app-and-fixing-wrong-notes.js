/* ================= v48: AI stem separation (desktop app) and fixing wrong notes ================= */
const AISEP={st:null};
async function aiStatus(){if(!TAU)return null;try{AISEP.st=await TAU.invoke('ai_status')}catch(e){AISEP.st=null}return AISEP.st}
function aiUse(){return !!(TAU&&AISEP.st&&AISEP.st.runtime&&AISEP.st.installed&&store.get('aiSep',true))}
async function aiListen(fn){const ev=window.__TAURI__&&window.__TAURI__.event;if(!ev||!ev.listen)return()=>{};try{return await ev.listen('ai-progress',e=>fn(e.payload||{}))}catch(e){return()=>{}}}
/* the model works at 44.1 kHz */
async function aiTo44(L,R,sr){if(sr===44100)return[L,R];const n=Math.round(L.length*44100/sr);const oc=new OfflineAudioContext(2,n,44100);const b=oc.createBuffer(2,L.length,sr);b.copyToChannel(L,0);b.copyToChannel(R,1);const s=oc.createBufferSource();s.buffer=b;s.connect(oc.destination);s.start();const o=await oc.startRendering();return[o.getChannelData(0).slice(),o.getChannelData(1).slice()]}
async function aiSeparate(part,onP){const key=(TS.title||'')+'|'+TS.dur+'|'+TS.sr+'|'+(TS.L?TS.L.length:0);if(TS.aiKey!==key){TS.aiKey=key;TS.ai={}}if(TS.ai[part])return TS.ai[part];
 const[L,R]=await aiTo44(TS.L,TS.R,TS.sr);const buf=new Float32Array(L.length*2);buf.set(L,0);buf.set(R,L.length);
 const un=await aiListen(p=>{if(p.stage==='separate')onP(p.p||0);if(p.stage==='device')AISEP.gpu=!!p.gpu});
 try{const ab=await TAU.invoke('ai_separate',new Uint8Array(buf.buffer),{headers:{'x-part':part,'x-gpu':store.get('aiGpu',true)?'1':'0'}});const f=new Float32Array(ab instanceof ArrayBuffer?ab:new Uint8Array(ab).buffer);const n=f.length/2;
  let e1=0,e2=0;for(let i=0;i<n;i+=8){e1+=f[i]*f[i]}for(let i=0;i<L.length;i+=16){e2+=L[i]*L[i]}const quiet=Math.sqrt(e1/(n/8))<.03*Math.sqrt(e2/(L.length/16));
  const res={L:f.slice(0,n),R:f.slice(n),sr:22050,quiet};TS.ai[part]=res;return res}finally{un()}}
/* runs the transcriber, with the AI-separated part when it's on */
async function tsPost(W,rs,bar,b){const send=(pre,base)=>{if(base){const om=W.onmessage;W.onmessage=e=>{const d=e.data;if(d&&!d.done&&!d.error){om({data:Object.assign({},d,{p:base+(1-base)*(d.p||0)})})}else om(e)}}
  const L=new Float32Array(TS.L),Rr=TS.R===TS.L?null:new Float32Array(TS.R);const msg={L,R:Rr,sr:TS.sr,part:TS.part};const tr=[L.buffer,...(Rr?[Rr.buffer]:[])];if(pre){msg.pre={L:pre.L.slice(),R:pre.R.slice(),sr:pre.sr};tr.push(msg.pre.L.buffer,msg.pre.R.buffer)}W.postMessage(msg,tr)};
 if(TAU&&!AISEP.st)await aiStatus();
 if(!aiUse()||!TS.L){send(null);return}
 const nm={vocals:'vocals',drums:'drums',bass:'bass',other:'guitar and keys'}[TS.part]||TS.part;const setP=p=>{rs.textContent=`Separating the ${nm} with AI… ${Math.round(p*100)}%`;bar.style.width=Math.round(p*50)+'%';const bw=document.getElementById('tsbarw');if(bw)bw.setAttribute('aria-valuenow',Math.round(p*50))};
 setP(0);let pre=null;try{pre=await aiSeparate(TS.part,setP)}catch(e){toast('AI separation didn\'t work ('+String(e).slice(0,120)+'). Using the standard separator.');send(null);return}
 if(pre.quiet){toast(`The AI found hardly any ${nm} in this song, so the standard separator was used.`);send(null,.5);return}
 TS.aiUsed=TS.part;send(pre,.5)}
/* the AI separation box on the "choose a part" step */
async function aiBox(){const el=document.getElementById('aibox');if(!el)return;const st=await aiStatus();if(!document.body.contains(el))return;if(!st||!st.runtime){el.remove();return}
 if(!st.installed){el.innerHTML=`<div class="aihead"><div class="stack" style="gap:4px;min-width:0;flex:1"><b>${st.old?'A better AI separator is ready':'AI separation'}</b><span class="hint">${st.old?`The new separator (SCNet) pulls vocals, bass, drums and the rest apart more cleanly than the old one, so notes and chords come out more accurately. It's a one-time ${st.download_mb} MB download and replaces the old 119 MB one.`:`A trained separation model pulls each part out far more cleanly, so the notes and chords come out much more accurately. It runs on your computer and needs a one-time ${st.download_mb} MB download.`}</span></div><button class="btn" id="aiget">${st.old?'Update':'Download'}</button></div><p class="hint" id="aigs" aria-live="polite"></p>`;
  const b=el.querySelector('#aiget'),gs=el.querySelector('#aigs');b.onclick=async()=>{b.disabled=true;gs.textContent='Starting the download…';const un=await aiListen(p=>{if(p.stage==='download')gs.textContent=`Downloading… ${Math.round((p.p||0)*100)}%`});
   try{await TAU.invoke('ai_install');store.set('aiSep',true);announce('AI separation is ready');toast('AI separation is ready');aiBox()}catch(e){gs.textContent=String(e);b.disabled=false}finally{un()}};return}
 const on=store.get('aiSep',true);el.innerHTML=`<label class="aihead"><input type="checkbox" id="aiuse" ${on?'checked':''}><span class="stack" style="gap:2px;min-width:0"><b>Use AI separation</b><span class="hint">Much cleaner parts and more accurate notes. A typical song takes a minute or two, depending on your computer.</span></span></label><label class="aihead" style="padding-left:26px"><input type="checkbox" id="aigpu" ${store.get('aiGpu',true)?'checked':''}><span class="stack" style="gap:2px;min-width:0"><span>Use the graphics card when it can</span><span class="hint">Usually several times faster. If it doesn't work on your computer, the app uses the processor instead.${AISEP.gpu===true?' Last time: graphics card.':AISEP.gpu===false?' Last time: processor.':''}</span></span></label><button class="btn small" id="airm">Remove the AI download (${st.download_mb} MB)</button>`;
 el.querySelector('#aigpu').onchange=e=>store.set('aiGpu',e.target.checked);
 el.querySelector('#aiuse').onchange=e=>store.set('aiSep',e.target.checked);
 const rm=el.querySelector('#airm');rm.onclick=async()=>{if(!rm.dataset.sure){rm.dataset.sure=1;rm.textContent='Tap again to remove it';return}try{await TAU.invoke('ai_remove');TS.ai={};toast('Removed. You can download it again any time.');aiBox()}catch(e){toast(String(e))}}}
function aiMount(){if(!TAU||TS.stage!=='part')return;const run=document.getElementById('tsrun');const row=run&&run.closest('.row');if(row&&!document.getElementById('aibox')){row.insertAdjacentHTML('beforebegin','<div id="aibox" class="aibox"></div>');aiBox()}}
/* ---- fixing a wrong note, chord or drum hit ---- */
const FIXN=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];const fixNm=m=>FIXN[((m%12)+12)%12]+(Math.floor(m/12)-1);
function tsFixItems(){const R=TS.res;if(!R)return{kind:'',list:[]};if(R.part==='drums')return{kind:'hit',list:R.hits||[]};if(R.part==='other'&&TS.view!=='lead')return{kind:'chord',list:(R.chords||[]).filter(c=>c.name!=='N')};return{kind:'note',list:R.notes||[]}}
function tsFixBars(){const B=(TS.res&&TS.res.beats)||[];const bars=[];for(let i=0;i<B.length;i+=4)bars.push([B[i],i+4<B.length?B[i+4]:1e9]);return bars.length?bars:[[0,1e9]]}
function tsFixHTML(){const{kind,list}=tsFixItems();const bars=tsFixBars();const bi=Math.min(TS.fixBar||0,bars.length-1);const[a,z]=bars[bi];const inBar=list.map((x,i)=>[x,i]).filter(([x])=>x.t>=a-.03&&x.t<z-.03);
 const sel=TS.fixSel!=null&&list[TS.fixSel]&&inBar.some(([,i])=>i===TS.fixSel)?TS.fixSel:null;const it=sel!=null?list[sel]:null;
 const lab=x=>kind==='note'?fixNm(x.m):kind==='chord'?x.name:{kick:'Kick',snare:'Snare',hat:'Hi-hat'}[x.k]||x.k;
 let ctl='';if(it){if(kind==='note')ctl=`<div class="row tsfixc"><button class="btn small" data-fx="play">Play it</button><button class="btn small" data-fx="up">Up a semitone</button><button class="btn small" data-fx="dn">Down a semitone</button><button class="btn small" data-fx="o+">Up an octave</button><button class="btn small" data-fx="o-">Down an octave</button><button class="btn small" data-fx="del">Delete</button></div>`;
  else if(kind==='chord')ctl=`<div class="row tsfixc"><label class="popt">Root <select id="fxroot">${FIXN.map((n,i)=>`<option value="${i}" ${i===it.root?'selected':''}>${n}</option>`).join('')}</select></label><label class="popt">Type <select id="fxtype">${[['maj','major'],['min','minor'],['7','7'],['m7','minor 7'],['maj7','major 7'],['5','power (5)'],['sus4','sus4']].map(([v,t])=>`<option value="${v}" ${v===it.type?'selected':''}>${t}</option>`).join('')}</select></label><button class="btn small" data-fx="del">Delete</button></div>`;
  else ctl=`<div class="row tsfixc"><label class="popt">Drum <select id="fxdrum">${[['kick','Kick'],['snare','Snare'],['hat','Hi-hat']].map(([v,t])=>`<option value="${v}" ${v===it.k?'selected':''}>${t}</option>`).join('')}</select></label><button class="btn small" data-fx="del">Delete</button></div>`}
 return `<p class="hint">Pick the bar, then the ${kind==='hit'?'drum hit':kind} that's wrong. Changes show in the tab straight away; press Save to keep them.</p>
  <div class="row"><label class="popt">Bar <select id="fxbar">${bars.map((b,i)=>`<option value="${i}" ${i===bi?'selected':''}>${i+1}</option>`).join('')}</select></label><button class="btn small" data-fx="prev" aria-label="Previous bar">◀</button><button class="btn small" data-fx="next" aria-label="Next bar">▶</button></div>
  <div class="row tsfixl" role="group" aria-label="In this bar">${inBar.length?inBar.map(([x,i])=>`<button class="btn small${i===sel?' primary':''}" data-fi="${i}" aria-pressed="${i===sel}">${esc(lab(x))} <span class="hint">${tsClock(x.t)}</span></button>`).join(''):'<span class="hint">Nothing in this bar.</span>'}</div>${ctl}`}
function tsFixPanel(){const tab=document.querySelector('.tstab');if(!tab||!TS.res)return;let d=document.getElementById('tsfix');if(!d){const sec=tab.closest('section');if(!sec)return;sec.insertAdjacentHTML('beforeend',`<details id="tsfix" class="tsread"${TS.fixOpen?' open':''}><summary>Fix a wrong note</summary><div id="tsfixb"></div></details>`);d=document.getElementById('tsfix');d.ontoggle=()=>{TS.fixOpen=d.open}}
 const box=d.querySelector('#tsfixb');if(box.dataset.done)return;box.dataset.done=1;const paint=()=>{box.innerHTML=tsFixHTML();bind()};
 const changed=msg=>{TS.res.edited=true;announce(msg);const sv=document.getElementById('tssave');TS.fixOpen=true;route();setTimeout(()=>{const s2=document.getElementById('tssave');if(s2)s2.textContent='Save changes';const f=document.querySelector('#tsfix summary');if(f)f.focus()},60)};
 const bind=()=>{const bs=tsFixBars();const fb=box.querySelector('#fxbar');fb.onchange=()=>{TS.fixBar=+fb.value;TS.fixSel=null;paint()};
  box.querySelectorAll('[data-fi]').forEach(b=>b.onclick=()=>{TS.fixSel=+b.dataset.fi;paint();const{kind,list}=tsFixItems();const x=list[TS.fixSel];if(kind==='note'&&x&&audio()){tone(x.m,AC.currentTime+.02,.5,.7)}});
  const{kind,list}=tsFixItems();const it=TS.fixSel!=null?list[TS.fixSel]:null;
  box.querySelectorAll('[data-fx]').forEach(b=>b.onclick=()=>{const f=b.dataset.fx;if(f==='prev'||f==='next'){TS.fixBar=Math.max(0,Math.min(bs.length-1,(TS.fixBar||0)+(f==='next'?1:-1)));TS.fixSel=null;paint();return}if(!it)return;
   if(f==='play'){if(audio())tone(it.m,AC.currentTime+.02,.5,.7);return}
   if(f==='del'){const R=TS.res;if(kind==='note')R.notes=R.notes.filter(x=>x!==it);else if(kind==='chord')R.chords=R.chords.filter(x=>x!==it);else R.hits=R.hits.filter(x=>x!==it);TS.fixSel=null;changed('Deleted');return}
   const dm={up:1,dn:-1,'o+':12,'o-':-12}[f];if(dm){it.m=Math.max(21,Math.min(108,it.m+dm));if(audio())tone(it.m,AC.currentTime+.02,.5,.7);changed('Now '+fixNm(it.m))}});
  const fr=box.querySelector('#fxroot'),ft=box.querySelector('#fxtype');if(fr&&it){const ch=()=>{it.root=+fr.value;it.type=ft.value;it.name=FIXN[it.root]+(it.type==='maj'?'':it.type==='min'?'m':it.type);changed('Now '+it.name)};fr.onchange=ch;ft.onchange=ch}
  const fd=box.querySelector('#fxdrum');if(fd&&it)fd.onchange=()=>{it.k=fd.value;changed('Now '+fd.options[fd.selectedIndex].text)}};
 paint()}
new MutationObserver(()=>{if(!/^#tools-isolate/.test(location.hash))return;if(TS.stage==='play')tsFixPanel();else if(TS.stage==='part')aiMount()}).observe(document.getElementById('main'),{childList:true,subtree:true});
Object.assign(window,{aiStatus,aiUse,tsFixPanel,tsFixHTML});

