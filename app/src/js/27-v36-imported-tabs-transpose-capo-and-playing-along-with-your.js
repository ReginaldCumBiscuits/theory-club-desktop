/* ================= v36: imported tabs: transpose, capo, and playing along with your own recording ================= */
/* move every note by semi semitones, and show frets from a capo; sounding pitches stay real */
function transformEx(ex0,semi,capo){if(!ex0||(!semi&&!capo))return ex0;const ex=JSON.parse(JSON.stringify(ex0));const S=ex.S;const MAXF=22;
 const chordName=ms=>{try{return(identify(ms)[0]||{name:SHARPN[Math.min(...ms)%12]}).name}catch(e){return SHARPN[Math.min(...ms)%12]}};
 const place=(m,s0,used)=>{if(!S)return null;const order=S.map((o,i)=>i).sort((a,b)=>Math.abs(a-s0)-Math.abs(b-s0));for(const s of order){if(used&&used.has(s))continue;const F=m-S[s];if(F>=capo&&F<=MAXF)return{s,f:F-capo}}return null};
 let lost=0;
 ex.items.forEach(it=>{if(it.hits)return;
  if(it.col){const used=new Set();const ms=[];let ri=0;const src=it.chord||[];it.col=it.col.map(c=>{if(c.f==='x'){used.add(c.s);return c}const m0=src[ri]!=null?src[ri]:S[c.s]+c.f+(ex0.capo||0);ri++;const m=m0+semi;const p=place(m,c.s,used);if(!p){lost++;return null}used.add(p.s);ms.push(m);return p}).filter(Boolean);
   if(!it.col.length){it.mute=true;it.col=[{s:0,f:'x'}]}it.chord=ms;it.name=ms.length?chordName(ms):'x';return}
  if(it.pos){if(it.pos.f==='x'||it.m==null)return;const m=it.m+semi;const p=it.harm?{s:it.pos.s,f:it.pos.f}:place(m,it.pos.s);if(!p){lost++;return}it.pos=p;it.m=m;it.name=SHARPN[((m%12)+12)%12];return}
  if(it.chord){it.chord=it.chord.map(m=>m+semi);it.name=chordName(it.chord);return}
  if(it.m!=null){it.m+=semi;it.name=SHARPN[((it.m%12)+12)%12]}});
 if(semi){delete ex.key;ex.title=(ex.title||'')+` (${semi>0?'+':''}${semi})`}
 if(capo)ex.capo=capo;else delete ex.capo;ex._lost=lost;return ex}
/* your recording, kept on this device */
function mediaDB(){return new Promise((res,rej)=>{try{const r=indexedDB.open('theory-club-media',1);r.onupgradeneeded=()=>r.result.createObjectStore('media');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
async function mediaGet(id){try{const db=await mediaDB();return await new Promise(res=>{const q=db.transaction('media').objectStore('media').get(id);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})}catch(e){return null}}
async function mediaPut(id,v){try{const db=await mediaDB();await new Promise((res,rej)=>{const tx=db.transaction('media','readwrite');if(v==null)tx.objectStore('media').delete(id);else tx.objectStore('media').put(v,id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});return true}catch(e){return false}}
const MEDIA={};
function tabOpts(id){const O=store.get('tabopts',{})||{};return Object.assign({semi:0,capo:0,off:0,bpm0:0,vol:.9,on:true},O[id]||{})}
function tabOptsSet(id,o){const O=store.get('tabopts',{})||{};O[id]=o;store.set('tabopts',O)}
function mountTabPlayer(host,id,rec,srs){const ex0=exFromRec(rec);if(!ex0){host.innerHTML='<p class="hint">This tab couldn’t be read. Open Edit to fix it.</p>';return}
 const o=tabOpts(id);if(!o.bpm0)o.bpm0=rec.bpm||ex0.bpm||90;const pitched=!!ex0.S||ex0.items.some(it=>it.m!=null||it.chord);const fretted=!!ex0.S;
 host.innerHTML=`<div class="tabtools row">${pitched?`<div class="pickrow"><span class="eyebrow">Transpose</span><div class="row tstep"><button class="btn small" data-tr="-1" aria-label="Down a semitone">−</button><b class="trv" aria-live="polite"></b><button class="btn small" data-tr="1" aria-label="Up a semitone">+</button></div></div>`:''}${fretted?`<div class="pickrow"><span class="eyebrow">Capo</span>${pillsHTML('tcapo',[0,1,2,3,4,5,6,7].map(n=>[String(n),n?String(n):'None']),String(o.capo),'pills')}</div>`:''}</div><p class="hint trhint" hidden></p>
 <details class="recp"${o.hasMedia?' open':''}><summary>Play along with the recording</summary><div class="stack" style="gap:10px;padding-top:8px">
  <p class="hint">Load a recording of this song that you own. It stays on this device. Line it up once, then slow it down, loop bars and follow the tab with the real band.</p>
  <div class="row"><label class="btn small" for="rf-${id}">Choose an audio file</label><input type="file" id="rf-${id}" accept="audio/*,.mp3,.m4a,.wav,.ogg,.flac" class="sr"><span class="hint rname"></span></div>
  <div class="recctl stack" hidden style="gap:10px">
   <div class="row"><button class="btn small" id="rlisten">${ICON.play} Listen from the start</button><button class="btn small primary" id="rtap">Tap here when the tab’s first note plays</button></div>
   <div class="row roffrow"><span class="eyebrow">Tab starts at</span><button class="btn small" data-off="-0.5">−½ s</button><button class="btn small" data-off="-0.05">−</button><b class="roff"></b><button class="btn small" data-off="0.05">+</button><button class="btn small" data-off="0.5">+½ s</button></div>
   <div class="row"><label class="popt">Recording tempo <input type="number" class="rbpm" min="30" max="260" aria-label="Recording tempo"> BPM</label><label class="popt">Volume <input type="range" class="rvol" min="0" max="1" step=".05" aria-label="Recording volume"></label></div>
   <div class="row"><label class="pill" style="cursor:pointer"><input type="checkbox" class="ron"> Play the recording with the tab</label><button class="btn small" id="rdel">Remove recording</button></div>
   <p class="hint">Tip: turn off “Hear the part” to hear only the band and yourself. If the tab drifts from the recording, set the recording tempo to the song’s real tempo.</p></div></div></details>
 <div class="tp-player stack"></div>`;
 const $=q=>host.querySelector(q);const save=()=>tabOptsSet(id,o);
 const M=MEDIA[id]||(MEDIA[id]={el:null,url:null});
 const media=()=>M.el&&o.on&&M.ready?{el:M.el,offset:o.off,bpm0:o.bpm0}:null;
 const draw=()=>{const ex=transformEx(ex0,o.semi,o.capo);const tv=$('.trv');if(tv)tv.textContent=o.semi?(o.semi>0?'+':'')+o.semi:'0';
  const hint=$('.trhint');const msgs=[];if(o.capo)msgs.push(`Frets are counted from the capo: 0 is the capo fret.`);if(ex&&ex._lost)msgs.push(`${ex._lost} note${ex._lost>1?'s':''} didn’t fit on the neck and ${ex._lost>1?'were':'was'} left out.`);if(o.semi&&M.ready&&o.on)msgs.push('The recording stays in its original key.');hint.hidden=!msgs.length;hint.textContent=msgs.join(' ');
  mountPlayer($('.tp-player'),ex,{tabOrStaff:false,srs,media})};
 host.querySelectorAll('[data-tr]').forEach(b=>b.onclick=()=>{o.semi=Math.max(-12,Math.min(12,o.semi+ +b.dataset.tr));save();draw()});
 bindPills(host.querySelector('.tabtools'),(g,v)=>{if(g==='tcapo'){o.capo=+v;host.querySelectorAll('[data-group=tcapo] .pill').forEach(x=>x.setAttribute('aria-pressed',x.dataset.v===v));save();draw()}});
 const showCtl=()=>{const c=$('.recctl');c.hidden=!M.ready;$('.roff').textContent=o.off.toFixed(2)+' s';$('.rbpm').value=o.bpm0;$('.rvol').value=o.vol;$('.ron').checked=o.on;if(M.el)M.el.volume=o.vol;$('.rname').textContent=M.ready?(M.name||'Recording loaded'):''};
 const setFile=(blob,name)=>{if(M.url)URL.revokeObjectURL(M.url);M.url=URL.createObjectURL(blob);M.el=new Audio(M.url);M.el.preload='auto';try{M.el.preservesPitch=true;M.el.mozPreservesPitch=true;M.el.webkitPreservesPitch=true}catch(e){}M.name=name;M.ready=true;showCtl()};
 if(!M.ready)mediaGet(id).then(v=>{if(v&&v.blob){setFile(v.blob,v.name);if(!o.hasMedia){o.hasMedia=true;save()}draw()}});else showCtl();
 $(`#rf-${id}`).onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;setFile(f,f.name);o.hasMedia=true;o.on=true;save();showCtl();draw();const ok=await mediaPut(id,{blob:f,name:f.name});if(!ok)toast('The recording works now but couldn’t be saved for next time.')};
 $('#rlisten').onclick=()=>{if(!M.el)return;if(!M.el.paused){M.el.pause();$('#rlisten').innerHTML=ICON.play+' Listen from the start';return}M.el.playbackRate=1;M.el.currentTime=0;M.el.play().catch(()=>{});$('#rlisten').innerHTML='■ Stop';M.el.onpause=()=>{const b=$('#rlisten');if(b)b.innerHTML=ICON.play+' Listen from the start'}};
 $('#rtap').onclick=()=>{if(!M.el)return;if(M.el.paused){M.el.playbackRate=1;M.el.currentTime=0;M.el.play().catch(()=>{});toast('Listening. Tap again on the first note of the tab.');return}o.off=Math.max(0,+(M.el.currentTime-.12).toFixed(2));M.el.pause();save();showCtl();toast(`The tab starts ${o.off.toFixed(2)} s in`)};
 host.querySelectorAll('[data-off]').forEach(b=>b.onclick=()=>{o.off=Math.max(0,+(o.off+ +b.dataset.off).toFixed(2));save();showCtl()});
 $('.rbpm').onchange=e=>{o.bpm0=Math.max(30,Math.min(260,+e.target.value||o.bpm0));save();showCtl()};
 $('.rvol').oninput=e=>{o.vol=+e.target.value;if(M.el)M.el.volume=o.vol;save()};
 $('.ron').onchange=e=>{o.on=e.target.checked;save();draw()};
 $('#rdel').onclick=async()=>{if(M.el)M.el.pause();if(M.url)URL.revokeObjectURL(M.url);MEDIA[id]={el:null,url:null};await mediaPut(id,null);o.hasMedia=false;save();mountTabPlayer(host,id,rec,srs)};
 draw()}
mountMyTab=function(s){const f=myTabForSong(s);const h=document.getElementById('myplayer');if(!f||!h)return;mountTabPlayer(h,f.id,f.rec,{id:'tab:'+f.id,title:f.rec.title+' (your tab)',href:'#song-'+s})};
{const _vm=viewMyTab;viewMyTab=function(id){_vm(id);const r=myTabs()[id];const h=document.getElementById('myplayer');if(r&&h)mountTabPlayer(h,id,r,{id:'tab:'+id,title:(r.title||'Untitled tab')+' (your tab)',href:'#mytab-'+id})}}
{const _r=route;route=function(){Object.values(MEDIA).forEach(M=>{try{if(M.el)M.el.pause()}catch(e){}});_r()}}

