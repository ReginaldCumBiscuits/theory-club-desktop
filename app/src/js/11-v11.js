/* ================= v11 ================= */
/* ---------- MIDI input (website version) ---------- */
const MIDIIN={active:false,access:null,name:'',hits:[],raw:new Set()};
function LISTEN(){return INPUT.active||MIDIIN.active}
function midiMsg(e){MIDIIN.raw.forEach(f=>{try{f(e.data)}catch(x){}});const[st,note,vel]=e.data;if((st&0xf0)!==0x90||!vel)return;const c=audio();if(!c)return;const t=c.currentTime,lat=INPUT.lat||0;
 INPUT.onsets.push(t+lat);[.04,.08,.12,.16].forEach(o=>INPUT.samples.push({t:t+lat+o,m:note}));const pc=GM_DRUM(note);MIDIIN.hits.push({t,piece:pc,m:note});
 INPUT.midi=note;INPUT.cents=0;clearTimeout(MIDIIN.tm);MIDIIN.tm=setTimeout(()=>{if(!INPUT.active)INPUT.midi=null;INPUT.listeners.forEach(f=>f())},350);
 const cut=t-8;while(INPUT.samples.length&&INPUT.samples[0].t<cut)INPUT.samples.shift();while(INPUT.onsets.length&&INPUT.onsets[0]<cut)INPUT.onsets.shift();while(MIDIIN.hits.length&&MIDIIN.hits[0].t<cut)MIDIIN.hits.shift();INPUT.listeners.forEach(f=>f())}
async function connectMIDI(){if(!navigator.requestMIDIAccess)throw new Error('unsupported');const acc=await navigator.requestMIDIAccess();MIDIIN.access=acc;const hook=()=>{const ins=[...acc.inputs.values()];ins.forEach(i=>i.onmidimessage=midiMsg);MIDIIN.name=ins.map(i=>i.name).join(', ');MIDIIN.active=ins.length>0;INPUT.listeners.forEach(f=>f())};acc.onstatechange=hook;hook();return MIDIIN.active}
function disconnectMIDI(){if(MIDIIN.access)[...MIDIIN.access.inputs.values()].forEach(i=>i.onmidimessage=null);MIDIIN.active=false;MIDIIN.name='';INPUT.listeners.forEach(f=>f())}
function midiRowHTML(){if(IN_CLAUDE())return'';if(!navigator.requestMIDIAccess)return`<p class="hint">Electronic drum kits and keyboards connect over MIDI in Chrome or Edge. This browser doesn’t support MIDI.</p>`;
 return`<div class="row"><button class="btn small" id="midiconn"></button><span class="hint" id="midistat"></span></div>`}
function bindMIDIRow(root){const b=root.querySelector('#midiconn');if(!b)return;const st=root.querySelector('#midistat');
 const sync=()=>{b.textContent=MIDIIN.active?'Disconnect MIDI':'Connect e-drums or keyboard (MIDI)';st.textContent=MIDIIN.active?`Connected: ${MIDIIN.name}. Every hit is read exactly.`:(MIDIIN.access?'No MIDI device found. Plug it in by USB and try again.':'')};
 b.onclick=async()=>{if(MIDIIN.active){disconnectMIDI();sync();return}try{await connectMIDI()}catch(e){st.textContent=e&&e.name==='SecurityError'?'MIDI access was blocked. Allow it in your browser’s site settings.':'MIDI isn’t available in this browser. Try Chrome or Edge.';return}sync()};sync()}

/* ---------- timing graph ---------- */
function timingHTML(tm){const pts=tm.filter(x=>x.d!=null);if(pts.length<3)return'';const ms=pts.map(x=>x.d*1000);const avg=ms.reduce((a,b)=>a+b,0)/ms.length;const sd=Math.sqrt(ms.reduce((a,b)=>a+(b-avg)**2,0)/ms.length);
 const W=Math.max(320,Math.min(900,pts.length*14+60)),H=170,lim=200,X=i=>44+i*(W-60)/Math.max(1,pts.length-1),Y=v=>H/2-Math.max(-lim,Math.min(lim,v))*(H/2-16)/lim;
 let s=`<svg class="tgraph" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="Timing of each note, early below the line, late above"><rect class="tband" x="40" y="${Y(30)}" width="${W-44}" height="${Y(-30)-Y(30)}"/>`;
 [-200,-100,0,100,200].forEach(v=>s+=`<line class="${v?'tg':'t0'}" x1="40" x2="${W-4}" y1="${Y(v)}" y2="${Y(v)}"/><text class="tl" x="36" y="${Y(v)+3}" text-anchor="end">${v>0?'+'+v:v}</text>`);
 s+=`<text class="tl" x="${W-6}" y="${Y(200)+10}" text-anchor="end">late</text><text class="tl" x="${W-6}" y="${Y(-200)-4}" text-anchor="end">early</text>`;
 pts.forEach((p,i)=>{const v=ms[i];s+=`<circle class="tp ${Math.abs(v)<=30?'g':Math.abs(v)<=80?'m':'b'}" cx="${X(i)}" cy="${Y(v)}" r="4"><title>${esc(p.w||'')}: ${v>0?'late':'early'} ${Math.round(Math.abs(v))} ms</title></circle>`});
 const tight=ms.filter(v=>Math.abs(v)<=30).length;const tend=Math.abs(avg)<12?'right on the beat on average':avg<0?`rushing by ${Math.round(-avg)} ms on average`:`dragging by ${Math.round(avg)} ms on average`;
 return`<h4>Your timing</h4><p class="hint">You were ${tend}. ${tight} of ${pts.length} notes landed within 30 ms (the green band). Spread: ±${Math.round(sd)} ms.</p><div class="scroll">${s}</svg></div>`}

/* ---------- review (spaced repetition) ---------- */
const SRS_STEPS=[1,3,7,14,30,60,120];
function srsGet(){return store.get('srs',{})}
function srsAdd(it){const S=srsGet();if(S[it.id])return;const d=new Date();d.setDate(d.getDate()+1);S[it.id]={title:it.title,href:it.href,step:0,due:todayKey(d),added:todayKey(),reps:0};store.set('srs',S)}
function srsRate(id,how){const S=srsGet();const r=S[id];if(!r)return;r.step=how==='again'?0:Math.min(SRS_STEPS.length-1,r.step+(how==='easy'?2:1));const d=new Date();d.setDate(d.getDate()+SRS_STEPS[r.step]);r.due=todayKey(d);r.reps=(r.reps||0)+1;store.set('srs',S);store.set('srsReviews',(store.get('srsReviews',0)||0)+1)}
function srsDue(){const S=srsGet(),t=todayKey();return Object.entries(S).filter(([,r])=>r.due<=t).sort((a,b)=>a[1].due<b[1].due?-1:1)}
function srsButtonHTML(srs){if(!srs)return'';const r=srsGet()[srs.id];return`<div class="row psrs">${r?`<span class="hint">In your review list · next check ${parseKey(r.due).toLocaleDateString(undefined,{day:'numeric',month:'short'})}</span>`:`<button class="btn small" data-srsadd>Add to my review list</button><span class="hint">It will come back in a day, then a few days, then a week, so it sticks.</span>`}</div>`}
function viewReview(){const S=srsGet();const due=srsDue();const later=Object.entries(S).filter(([,r])=>r.due>todayKey()).sort((a,b)=>a[1].due<b[1].due?-1:1);const fmt=k=>parseKey(k).toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'});
 main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Review</span><h1>Keep it fresh</h1><p class="lede">Licks, studies and tabs you’ve added come back for a quick play just before you’d forget them. Open each one, play it through, then say how it went.</p></div></div>
 <div class="stack"><section class="panel"><h3>Due today${due.length?` (${due.length})`:''}</h3>${due.length?`<div class="revlist">${due.map(([id,r])=>`<div class="rev"><div><b>${esc(r.title)}</b><span class="hint">Reviewed ${r.reps||0} time${r.reps===1?'':'s'}</span></div><div class="row"><a class="btn small" href="${r.href}">Open</a><span class="hint">How did it go?</span><button class="btn small" data-rate="again" data-id="${esc(id)}">Again</button><button class="btn small" data-rate="good" data-id="${esc(id)}">Good</button><button class="btn small" data-rate="easy" data-id="${esc(id)}">Easy</button></div></div>`).join('')}</div>`:'<p class="hint">Nothing due. Add licks, song studies or your own tabs with “Add to my review list” under any player.</p>'}</section>
 ${later.length?`<section class="panel"><h3>Coming up</h3><div class="revlist">${later.map(([id,r])=>`<div class="rev"><div><b>${esc(r.title)}</b><span class="hint">Next: ${fmt(r.due)}</span></div><div class="row"><a class="btn small" href="${r.href}">Open</a><button class="btn small" data-rm="${esc(id)}">Remove</button></div></div>`).join('')}</div></section>`:''}</div>`;
 main.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{srsRate(b.dataset.id,b.dataset.rate);viewReview()});
 main.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{const S2=srsGet();delete S2[b.dataset.rm];store.set('srs',S2);viewReview()})}

/* ---------- recordings (IndexedDB) ---------- */
function idb(){return new Promise((res,rej)=>{try{const r=indexedDB.open('theory-club',1);r.onupgradeneeded=()=>{r.result.createObjectStore('takes',{keyPath:'id'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
async function takeSave(meta,blob){try{const db=await idb();await new Promise((res,rej)=>{const tx=db.transaction('takes','readwrite');tx.objectStore('takes').put({...meta,blob});tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});store.set('takesCount',(store.get('takesCount',0)||0)+1);return true}catch(e){return false}}
async function takeList(){try{const db=await idb();return await new Promise((res,rej)=>{const r=db.transaction('takes').objectStore('takes').getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)})}catch(e){return null}}
async function takeDelete(id){try{const db=await idb();await new Promise(res=>{const tx=db.transaction('takes','readwrite');tx.objectStore('takes').delete(id);tx.oncomplete=res;tx.onerror=res})}catch(e){}}
let TAKE_URLS=[];
async function viewTakes(){main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Recordings</span><h1>Your takes</h1><p class="lede">Every take you record with “Record” turned on is kept here, grouped by what you played, so you can hear yourself improve. They’re stored in this browser only and aren’t included in backups.</p></div></div><div class="stack" id="tk"><p class="hint">Loading…</p></div>`;
 TAKE_URLS.forEach(u=>URL.revokeObjectURL(u));TAKE_URLS=[];const list=await takeList();const box=document.getElementById('tk');if(!box)return;
 if(list==null){box.innerHTML='<p class="hint">Recordings can’t be stored in this browser.</p>';return}
 if(!list.length){box.innerHTML=`<section class="panel"><p class="hint">No takes yet. Plug in your instrument (website version), turn on <b>Record</b> in any player, and play.</p></section>`;return}
 const groups={};list.sort((a,b)=>b.at-a.at).forEach(t=>(groups[t.title]=groups[t.title]||[]).push(t));
 box.innerHTML=Object.entries(groups).map(([title,ts])=>`<section class="panel"><h3>${esc(title)}</h3><div class="revlist">${ts.map(t=>{const u=URL.createObjectURL(t.blob);TAKE_URLS.push(u);return`<div class="take2"><div><b>${new Date(t.at).toLocaleDateString(undefined,{day:'numeric',month:'short'})} · ${new Date(t.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</b><span class="hint">${t.bpm} BPM${t.score!=null?` · ${t.score}% right`:''}</span></div><audio controls preload="none" src="${u}"></audio><span class="row"><button class="btn small" data-del="${t.id}">Delete</button><span class="row" data-conf="${t.id}" hidden><button class="btn small dangerfill" data-dely="${t.id}">Delete take</button><button class="btn small" data-deln="${t.id}">Keep</button></span></span></div>`}).join('')}</div></section>`).join('');
 box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{b.hidden=true;box.querySelector(`[data-conf="${b.dataset.del}"]`).hidden=false});
 box.querySelectorAll('[data-deln]').forEach(b=>b.onclick=()=>{box.querySelector(`[data-conf="${b.dataset.deln}"]`).hidden=true;box.querySelector(`[data-del="${b.dataset.deln}"]`).hidden=false});
 box.querySelectorAll('[data-dely]').forEach(b=>b.onclick=async()=>{await takeDelete(b.dataset.dely);viewTakes()})}

/* ---------- warm-ups ---------- */
function tabEx(str,S,inst,bpm,per=4){const{items,steps}=parseTab(str,S);const bar=4*per;let st=steps;if(st%bar){items[items.length-1].dur+=bar-st%bar;st+=bar-st%bar}return{items,steps:st,per,beats:4,view:'tab',S,inst,bpm}}
function chromaticTab(nS,frets=[1,2,3,4]){const up=[],down=[];for(let s=0;s<nS;s++)frets.forEach(f=>up.push(`1|${s}:${f}`));for(let s=nS-1;s>=0;s--)frets.slice().reverse().forEach(f=>down.push(`1|${s}:${f}`));return up.concat(down).join(' ')}
function warmups(inst){const S=inst==='bass'?STR4:STR;
 if(inst==='guitar')return[{id:'chrom',name:'Chromatic 1-2-3-4',desc:'One finger per fret, across all six strings and back. Keep each finger close to the fretboard.',ex:()=>tabEx(chromaticTab(6),S,'guitar',70)},
  {id:'perm',name:'Finger twister 1-3-2-4',desc:'Same idea in a trickier order, which builds independence between your fingers.',ex:()=>tabEx(chromaticTab(6,[1,3,2,4]),S,'guitar',60)},
  {id:'scale',name:'C major scale, open position',desc:'Up and down in time. Say the note names as you go.',ex:()=>{const e=paBuild({type:'major',key:'C'});e.bpm=72;return e}},
  {id:'strum',name:'Down-up strumming',desc:'Eighth-note strumming on G, C, D and Em. Keep your arm moving all the time.',ex:()=>{const e=paBuild({type:'chords',prog:0,key:'C'});e.bpm=70;return e}}];
 if(inst==='bass')return[{id:'chrom',name:'Chromatic 1-2-3-4',desc:'One finger per fret on all four strings and back. Alternate your plucking fingers.',ex:()=>tabEx(chromaticTab(4),S,'bass',70)},
  {id:'perm',name:'Finger twister 1-3-2-4',desc:'Builds fretting-hand independence.',ex:()=>tabEx(chromaticTab(4,[1,3,2,4]),S,'bass',60)},
  {id:'r58',name:'Root, 5th, octave',desc:'The shape you’ll use in hundreds of songs, locked to the click.',ex:()=>{const e=paBuild({type:'bassline',key:'A',pid:'pop',pat:'r58'});e.bpm=84;return e}}];
 if(inst==='piano')return[{id:'five',name:'Five-finger pattern',desc:'Thumb on C, one finger per key: C D E F G and back. Keep a curved hand.',ex:()=>({items:[60,62,64,65,67,65,64,62,60,62,64,65,67,65,64,62].map((m,i)=>({st:i*2,dur:2,m,name:SHARPN[m%12]})),steps:32,per:4,beats:4,view:'staff',S:STR,inst:'piano',bpm:80})},
  {id:'scale',name:'C major scale',desc:'Thumb tucks under after E going up; finger 3 crosses over going down.',ex:()=>{const e=paBuild({type:'major',key:'C'});e.bpm=72;return e}},
  {id:'arp',name:'C major arpeggio',desc:'Two octaves of C–E–G, smooth and even.',ex:()=>{const e=paBuild({type:'arp',key:'C',arp:'maj'});e.bpm=70;return e}}];
 return[{id:'ladder',name:'Single-stroke ladder',desc:'Alternate hands on the snare: quarters, eighths, triplets, then sixteenths, one bar each. Keep the sticks low and even.',ex:()=>{const items=[];let st=0,k=0;[[12,4],[6,8],[4,12],[3,16]].forEach(([d,n])=>{for(let i=0;i<n;i++){items.push({st,dur:d,hits:{snare:i%(48/d/4)===0?1:.6},stick:k%2?'L':'R',acc:i%(n/4)===0});st+=d;k++}});return{items,steps:192,per:12,beats:4,view:'stick',S:STR,inst:'drums',bpm:70}}},
  {id:'accent',name:'Accent shifter',desc:'Sixteenths with the accent moving one note later each bar. Accents loud, others quiet.',ex:()=>{const items=[];for(let b=0;b<4;b++)for(let i=0;i<16;i++){const acc=i%4===b;items.push({st:b*16+i,dur:1,hits:{snare:acc?1:.4},stick:i%2?'L':'R',acc})}return{items,steps:64,per:4,beats:4,view:'stick',S:STR,inst:'drums',bpm:72}}},
  {id:'groove',name:'Rock beat, slow and steady',desc:'Lock in the most important groove at 60 BPM. Make every hi-hat the same volume.',ex:()=>{const e=paBuild({type:'groove',groove:'rock',key:'C'});e.bpm=60;return e}}]}
let WU_T=null;
function viewWarmup(){const inst=INST();const list=warmups(inst);let sel=list[0].id;const W=store.get('warmlog',{});const done=!!W[todayKey()];
 const render=()=>{clearInterval(WU_T);const w=list.find(x=>x.id===sel);
  main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Warm-up · ${INST_NAME[inst]}</span><h1>Five-minute warm-up</h1><p class="lede">Loosen up before you practise. Start slow, turn on the speed trainer, and stop if anything hurts.</p></div>
  <div class="wutimer"><b id="wut">5:00</b><button class="btn primary small" id="wugo">${done?'Warm up again':'Start the timer'}</button>${done?'<span class="hint">Done today</span>':''}</div></div>
  <div class="stack"><div class="pickrow"><span class="eyebrow">Exercise</span>${pillsHTML('wu',list.map(x=>[x.id,x.name]),sel)}</div><section class="panel"><h3>${esc(w.name)}</h3><p class="hint">${esc(w.desc)}</p><div id="wup" class="stack"></div></section></div>`;
  bindPills(main,(g,v)=>{sel=v;render()});mountPlayer(main.querySelector('#wup'),w.ex(),{tabOrStaff:inst!=='guitar'||w.id==='scale'});
  main.querySelector('#wugo').onclick=()=>{let left=300;const el=main.querySelector('#wut');const btn=main.querySelector('#wugo');btn.disabled=true;clearInterval(WU_T);
   WU_T=setInterval(()=>{if(!document.body.contains(el)){clearInterval(WU_T);return}left--;el.textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;if(left<=0){clearInterval(WU_T);const W2=store.get('warmlog',{});W2[todayKey()]=1;store.set('warmlog',W2);el.textContent='Done';btn.disabled=false;btn.textContent='Warm up again';toast('Warm-up done. Ready to practise.')}},1000)}};
 render()}

/* ---------- slow down a recording ---------- */
TOOLPAGES.slow=el=>{let audioEl=null,srcNode=null,buf=null,url=null,A=null,B=null,loopOn=false,speed=1,raf=0,drag=null;
 const fmt=t=>t==null||isNaN(t)?'–':`${Math.floor(t/60)}:${(t%60).toFixed(1).padStart(4,'0')}`;
 el.innerHTML=`<p>Load a recording of a song you’re learning. Loop the tricky part and slow it down. The pitch stays the same, so you can play along at your own speed. The file stays on this device.</p>
 <section class="panel"><div class="row"><label class="btn primary" for="slfile">Open an audio file</label><input type="file" id="slfile" accept="audio/*" class="sr"><span class="hint" id="slname">MP3, M4A, WAV or similar</span></div>
 <div id="slui" hidden class="stack"><canvas id="slwave" height="120" aria-label="Waveform. Drag across it to choose a section to loop."></canvas>
 <div class="row"><button class="btn primary" id="slplay">${ICON.play} Play</button><span class="sltime" id="sltime">0:00.0</span><button class="btn small" id="sla">Set start (A)</button><button class="btn small" id="slb">Set end (B)</button><button class="btn small" id="slloop" aria-pressed="false">Loop A–B</button><button class="btn small" id="slclr">Clear</button></div>
 <div class="row"><label class="tempo">Speed <input type="range" id="slsp" min="40" max="125" value="100" aria-label="Playback speed"> <span id="slspv">100%</span></label><div class="pills" data-group="slp">${[50,60,75,90,100].map(v=>`<button class="pill" data-v="${v}" aria-pressed="${v===100}">${v}%</button>`).join('')}</div></div>
 <p class="hint" id="slab">Drag across the waveform, or use Set start and Set end, to pick a section to loop. Space plays or pauses.</p></div><p class="hint" id="slerr" hidden></p></section>`;
 const $=q=>el.querySelector(q);const cv=$('#slwave');
 const draw=()=>{if(!buf||!document.body.contains(cv))return;const dpr=devicePixelRatio||1;const w=cv.clientWidth,h=120;if(cv.width!==w*dpr){cv.width=w*dpr;cv.height=h*dpr}const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);const cs=getComputedStyle(document.documentElement);const col=n=>cs.getPropertyValue(n).trim();
  const d=buf.getChannelData(0),step=Math.max(1,Math.floor(d.length/w)),dur=buf.duration;if(A!=null&&B!=null){g.fillStyle=col('--accent-soft');g.fillRect(A/dur*w,0,(B-A)/dur*w,h)}
  g.fillStyle=col('--muted');for(let x=0;x<w;x++){let mn=1,mx=-1;for(let i=x*step;i<Math.min(d.length,(x+1)*step);i+=4){const v=d[i];if(v<mn)mn=v;if(v>mx)mx=v}g.fillRect(x,h/2+mn*h/2*.95,1,Math.max(1,(mx-mn)*h/2*.95))}
  g.fillStyle=col('--accent');[A,B].forEach(t=>{if(t!=null)g.fillRect(t/dur*w-1,0,2,h)});if(audioEl){g.fillStyle=col('--root');g.fillRect(audioEl.currentTime/dur*w-1,0,2,h)}};
 const tick=()=>{if(!audioEl||!document.body.contains(el)){cancelAnimationFrame(raf);if(audioEl&&!document.body.contains(el))audioEl.pause();return}if(loopOn&&A!=null&&B!=null&&audioEl.currentTime>=B){audioEl.currentTime=A}$('#sltime').textContent=fmt(audioEl.currentTime);draw();raf=requestAnimationFrame(tick)};
 const syncAB=()=>{$('#slab').textContent=A!=null||B!=null?`Loop from ${fmt(A)} to ${fmt(B)}${loopOn?' · looping':''}`:'Drag across the waveform, or use Set start and Set end, to pick a section to loop. Space plays or pauses.';$('#slloop').setAttribute('aria-pressed',loopOn);draw()};
 const setSpeed=v=>{speed=Math.max(.4,Math.min(1.25,v));if(audioEl){audioEl.playbackRate=speed}$('#slsp').value=Math.round(speed*100);$('#slspv').textContent=Math.round(speed*100)+'%';el.querySelectorAll('[data-group="slp"] .pill').forEach(p=>p.setAttribute('aria-pressed',+p.dataset.v===Math.round(speed*100)))};
 const toggle=()=>{if(!audioEl)return;if(audioEl.paused){audio();if(loopOn&&A!=null&&(audioEl.currentTime<A||audioEl.currentTime>=B))audioEl.currentTime=A;audioEl.play().catch(()=>{$('#slerr').hidden=false;$('#slerr').textContent='This file couldn’t be played here. Try the website version, or a different file format.'})}else audioEl.pause()};
 $('#slfile').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;$('#slerr').hidden=true;if(audioEl){audioEl.pause()}if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(f);A=B=null;loopOn=false;
  audioEl=new Audio();audioEl.src=url;audioEl.preservesPitch=true;audioEl.mozPreservesPitch=true;audioEl.webkitPreservesPitch=true;audioEl.playbackRate=speed;
  audioEl.onplay=()=>{$('#slplay').innerHTML='■ Pause';cancelAnimationFrame(raf);raf=requestAnimationFrame(tick)};audioEl.onpause=()=>{$('#slplay').innerHTML=ICON.play+' Play'};audioEl.onerror=()=>{$('#slerr').hidden=false;$('#slerr').textContent='This file couldn’t be opened. Try an MP3 or WAV file.'};
  try{const c=audio();srcNode=c.createMediaElementSource(audioEl);srcNode.connect(MASTER)}catch(err){}
  $('#slname').textContent=f.name;$('#slui').hidden=false;try{const c=audio();buf=await c.decodeAudioData(await f.arrayBuffer())}catch(err){buf=null}syncAB();setTimeout(draw,50)});
 $('#slplay').onclick=toggle;$('#sla').onclick=()=>{if(!audioEl)return;A=audioEl.currentTime;if(B!=null&&B<=A)B=null;syncAB()};$('#slb').onclick=()=>{if(!audioEl)return;B=audioEl.currentTime;if(A==null)A=0;if(B<=A){B=null}else loopOn=true;syncAB()};
 $('#slloop').onclick=()=>{if(A!=null&&B!=null)loopOn=!loopOn;syncAB()};$('#slclr').onclick=()=>{A=B=null;loopOn=false;syncAB()};
 $('#slsp').oninput=e=>setSpeed(+e.target.value/100);el.querySelectorAll('[data-group="slp"] .pill').forEach(p=>p.onclick=()=>setSpeed(+p.dataset.v/100));
 const tAt=ev=>{const r=cv.getBoundingClientRect();return buf?Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width))*buf.duration:0};
 cv.addEventListener('pointerdown',ev=>{if(!buf)return;drag={t0:tAt(ev),moved:false};cv.setPointerCapture(ev.pointerId)});
 cv.addEventListener('pointermove',ev=>{if(!drag)return;const t=tAt(ev);if(Math.abs(t-drag.t0)>.15){drag.moved=true;A=Math.min(drag.t0,t);B=Math.max(drag.t0,t);loopOn=true;syncAB()}});
 cv.addEventListener('pointerup',ev=>{if(!drag)return;if(!drag.moved&&audioEl){audioEl.currentTime=tAt(ev);draw()}drag=null});
 ACTIVE={el,go:toggle,tempo:d=>setSpeed(speed+d/100),loop:()=>{if(A!=null&&B!=null){loopOn=!loopOn;syncAB()}}}};

/* ---------- play it, see the tab ---------- */
TOOLPAGES.transcribe=el=>{const inst=INST();const S=inst==='bass'?BSTR():GSTR();let bpm=80,q=4,rec=false,t0=0,tEnd=0,ex=null,click=true;
 el.innerHTML=`<p>Play a riff, melody${inst==='drums'?' or groove':''} and Theory Club writes it down as ${inst==='drums'?'a drum chart':inst==='piano'?'notation':'tab'}. Set the tempo, listen to the one-bar count-in, play in time with the click, then press Stop. Wear headphones so the click doesn’t get written down too.</p>
 ${IN_CLAUDE()?'':''}<section class="panel"><div class="row" style="gap:20px;align-items:flex-end"><label class="tempo">Tempo <input type="range" id="trbpm" min="40" max="180" value="${bpm}" aria-label="Tempo"> <span id="trbv">${bpm}</span> BPM</label>
 <div class="pickrow"><span class="eyebrow">Shortest note</span>${pillsHTML('q',[['2','Eighths'],['4','Sixteenths']],String(q))}</div><button class="pill" data-tog="click" aria-pressed="true">Metronome</button></div>
 <div class="row"><button class="btn primary" id="trgo">● Record</button><span class="hint" id="trstat" aria-live="polite"></span></div>${inputPanelHTML()}</section>
 <section class="panel" id="trout" hidden><div class="formgrid"><label>Title<input id="trttl" value="My riff" autocomplete="off"></label></div><div id="trprev" class="stack"></div><div class="row"><button class="btn primary" id="trsave">Save to My tabs</button><span class="hint" id="trsv"></span></div></section>`;
 const $=q2=>el.querySelector(q2);const ip=el.querySelector('.inpanel');if(ip)bindInputPanel(ip);
 $('#trbpm').oninput=e=>{bpm=+e.target.value;$('#trbv').textContent=bpm};bindPills(el,(g,v)=>{q=+v});
 el.querySelector('[data-tog="click"]').onclick=e=>{click=!click;e.currentTarget.setAttribute('aria-pressed',click)};
 const build=()=>{const sd=60/bpm/q,lat=INPUT.lat||0;const ons=INPUT.onsets.map(t=>t-lat).filter(t=>t>=t0-sd/2&&t<=tEnd);const items=[];
  ons.forEach(t=>{const st=Math.max(0,Math.round((t-t0)/sd));if(items.length&&items[items.length-1].st>=st)return;
   if(inst==='drums'){const h=MIDIIN.hits.filter(x=>Math.abs(x.t-t)<.06&&x.piece);const hits={};(h.length?h:[{piece:'snare'}]).forEach(x=>hits[x.piece]=1);items.push({st,dur:1,hits});return}
   const [lo,hi]=inst==='bass'?[23,67]:inst==='piano'?[21,96]:[36,88];const ss=INPUT.samples.filter(s=>s.t-lat>=t+.02&&s.t-lat<=t+.2&&s.m>=lo&&s.m<=hi).map(s=>s.m);if(!ss.length)return;const cnt={};ss.forEach(m=>cnt[m]=(cnt[m]||0)+1);const m=+Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0];items.push({st,dur:1,m,name:SHARPN[m%12]})});
  if(!items.length)return null;const bar=4*q;const base=Math.floor(items[0].st/bar)*bar;items.forEach(it=>it.st-=base);items.forEach((it,i)=>{const nx=items[i+1];it.dur=nx?nx.st-it.st:Math.max(1,(Math.floor(it.st/bar)+1)*bar-it.st)});
  const last=items[items.length-1];let steps=last.st+last.dur;if(steps%bar)steps+=bar-steps%bar;last.dur=steps-last.st;
  if(inst!=='drums'&&inst!=='piano'){const pos=fitTab(items.map(x=>x.m),S);items.forEach((x,i)=>x.pos=pos[i])}
  return{items,steps,per:q,beats:4,view:inst==='drums'?'drumtab':inst==='piano'?'staff':'tab',S,inst,bpm,bars:steps/bar}};
 const stopRec=()=>{rec=false;stopLoop();tEnd=AC.currentTime;$('#trgo').textContent='● Record';ex=build();if(!ex){$('#trstat').textContent='I didn’t catch any notes. Check your input level, play a little louder, and try again.';return}
  $('#trstat').textContent=`Caught ${ex.items.length} notes in ${ex.bars} bar${ex.bars>1?'s':''}.`;$('#trout').hidden=false;mountPlayer($('#trprev'),ex,{tabOrStaff:inst!=='drums'})};
 $('#trgo').onclick=()=>{if(rec){stopRec();return}if(!LISTEN()){$('#trstat').textContent=IN_CLAUDE()?'Plugging in only works in the website version.':'Connect your instrument below first.';return}
  const c=audio();rec=true;$('#trgo').textContent='■ Stop';$('#trout').hidden=true;const sd=60/bpm;t0=c.currentTime+.1+4*sd;let n=0;
  startLoop(()=>({steps:4,per:1,rows:{},bpm}),{extra:(abs,t)=>{if(abs<4||click)drum(abs%4===0?'clickhi':'click',t,abs<4?.9:.5)},onStep:abs=>{if(!rec)return;if(abs<4)$('#trstat').textContent=`Count-in ${abs+1}`;else{n=Math.floor((abs-4)/4)+1;$('#trstat').textContent=`Recording · bar ${n}`;if(n>16)stopRec()}}})};
 $('#trsave').onclick=()=>{if(!ex)return;const T=myTabs();const id=Date.now().toString(36);const keep={...ex};delete keep.bpm;T[id]={title:$('#trttl').value.trim()||'My riff',artist:'Me',bpm,song:null,updated:Date.now(),kind:'score',file:'Recorded in Theory Club',ex:keep};store.set('mytabs',T);store.set('transcribed',(store.get('transcribed',0)||0)+1);$('#trsv').innerHTML=`Saved. <a href="#mytab-${id}">Open it</a>`}};

/* ---------- milestones ---------- */
const MILESTONES=[
 ['streak3','On a roll','Play the daily challenge 3 days in a row',d=>d.streak>=3],['streak7','Week streak','7 days in a row',d=>d.streak>=7],['streak30','Unstoppable','30 days in a row',d=>d.streak>=30],
 ['q100','Hundred club','Answer 100 questions',d=>d.q>=100],['q500','Theory head','Answer 500 questions',d=>d.q>=500],
 ['hour','First hour','Practise for 60 minutes in total',d=>d.min>=60],['ten','Ten hours','Practise for 10 hours in total',d=>d.min>=600],
 ['loops10','Clean ten','Play 10 loops at 90% or better',d=>d.loops>=10],['loops100','Clean hundred','Play 100 loops at 90% or better',d=>d.loops>=100],
 ['solo','First solo','Open the Soloing lesson',d=>d.solo],['tab','Tab importer','Import or record your first tab',d=>d.tabs>=1],['take','On tape','Record your first take',d=>d.takes>=1],
 ['warm7','Warmed up','Finish 7 warm-ups',d=>d.warm>=7],['review10','Memory keeper','Do 10 reviews',d=>d.reviews>=10],
 ['plan5','On plan','Finish 5 plan sessions',d=>d.plan>=5],['song','Song student','Open 5 different song pages',d=>d.songs>=5]];
function msData(){const st=store.get('stats',{});const L=store.get('plog',{});const V=store.get('visited',{});return{streak:streak(store.get('dailylog',{})),q:Object.values(st).reduce((a,s)=>a+s.a,0),min:Object.values(L).reduce((a,b)=>a+b,0)/60,loops:store.get('cleanLoops',0)||0,solo:!!V.solo,tabs:Object.keys(myTabs()).length,takes:store.get('takesCount',0)||0,warm:Object.keys(store.get('warmlog',{})).length,reviews:store.get('srsReviews',0)||0,plan:Object.keys(store.get('planDone',{})).length,songs:(store.get('songsSeen',[])||[]).length}}
let MS_BUSY=false;
function checkMilestones(){if(MS_BUSY)return;MS_BUSY=true;try{const d=msData();const got=store.get('badges',{});const nw=MILESTONES.filter(m=>!got[m[0]]&&m[3](d));if(nw.length){nw.forEach(m=>got[m[0]]=todayKey());store.set('badges',got);nw.forEach((m,i)=>setTimeout(()=>toast(`Milestone: ${m[1]}`),i*1600))}}catch(e){}MS_BUSY=false}
function milestonesHTML(){const got=store.get('badges',{});const n=MILESTONES.filter(m=>got[m[0]]).length;return`<section class="panel"><h3>Milestones <span class="hint">${n} of ${MILESTONES.length}</span></h3><div class="badges">${MILESTONES.map(m=>`<div class="badge2 ${got[m[0]]?'on':''}"><span class="bico" aria-hidden="true">${got[m[0]]?'★':'☆'}</span><b>${m[1]}</b><span class="hint">${m[2]}</span></div>`).join('')}</div></section>`}
function toast(msg){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),3200)}
{const prev=store.hook;const MSK=new Set(['dailylog','stats','plog','cleanLoops','visited','mytabs','takesCount','warmlog','srsReviews','planDone','songsSeen']);store.hook=k=>{if(prev)prev(k);if(MSK.has(k))setTimeout(checkMilestones,0)}}
document.getElementById('tbmore').onclick=()=>openSidebar();
