/* ================= v19: interface ================= */
/* --- instrument input lives in the toolbar --- */
function openInputSheet(){let ov=document.getElementById('inov');if(!ov){ov=document.createElement('div');ov.className='ov';ov.id='inov';ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="int"><div class="row" style="justify-content:space-between"><h2 id="int">Your instrument</h2><button class="btn small" id="inclose">Done</button></div><div id="inbody"></div></div>`;document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)closeInputSheet()});ov.querySelector('#inclose').onclick=closeInputSheet}
 ov.querySelector('#inbody').innerHTML=fullInputPanelHTML();const ip=ov.querySelector('.inpanel');if(ip)bindInputPanel(ip,syncInputUI);ov.hidden=false;setTimeout(()=>ov.querySelector('#inclose').focus(),30)}
function closeInputSheet(){const ov=document.getElementById('inov');if(ov)ov.hidden=true;syncInputUI();INPUT.listeners.forEach(f=>{try{f()}catch(e){}})}
function syncInputUI(){const on=LISTEN();const b=document.getElementById('inbtn');if(b){b.classList.toggle('on',on);b.setAttribute('aria-label',on?'Instrument connected':'Connect your instrument');b.title=on?(MIDIIN.active?'MIDI connected':'Listening'):'Connect your instrument'}
 document.querySelectorAll('.inpanel.mini .instx').forEach(x=>x.textContent=on?(MIDIIN.active&&!INPUT.active?`MIDI connected${MIDIIN.name?': '+MIDIIN.name:''}`:'Listening to your instrument'):'Your instrument isn’t connected')}
INPUT.listeners.add(()=>{const i=document.getElementById('inlvlbar');if(i)i.style.transform=`scaleY(${INPUT.active?Math.min(1,INPUT.level*14):0})`});
{const acts=document.querySelector('.hdr-actions');if(acts){const sb=document.createElement('button');sb.className='iconbtn';sb.id='cmdbtn';sb.setAttribute('aria-label','Search (⌘K)');sb.title='Search (⌘K)';sb.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/></svg>';
 const ib=document.createElement('button');ib.className='iconbtn inbtn';ib.id='inbtn';ib.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:1.4"><rect x="5.5" y="1.5" width="5" height="8" rx="2.5"/><path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2"/></svg><span class="lvl"><i id="inlvlbar"></i></span>';
 acts.prepend(ib);acts.prepend(sb);ib.onclick=openInputSheet;sb.onclick=()=>openCmdK();syncInputUI()}}

/* --- full-screen practice view for any player --- */
function focusOn(host){if(document.querySelector('.fsmode'))focusOff();host.classList.add('fsmode');document.body.classList.add('fs-on');const x=document.createElement('button');x.className='btn fsclose';x.id='fsclose';x.textContent='Exit full screen';x.onclick=focusOff;document.body.appendChild(x);host.scrollTop=0}
function focusOff(){document.querySelectorAll('.fsmode').forEach(h=>h.classList.remove('fsmode'));document.body.classList.remove('fs-on');const x=document.getElementById('fsclose');if(x)x.remove()}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('fs-on'))focusOff()});

/* --- the toolbar title appears once the page heading scrolls away --- */
function syncTitle(){const t=document.getElementById('tbtitle');if(!t)return;const h=document.querySelector('#main h1');const show=!h||h.getBoundingClientRect().bottom<64;t.classList.toggle('show',show)}
window.addEventListener('scroll',syncTitle,{passive:true});

/* --- home --- */
function playStreak(){const L=store.get('plog',{});let n=0;const d=new Date();if(!(L[todayKey(d)]>30))d.setDate(d.getDate()-1);while(L[todayKey(d)]>30){n++;d.setDate(d.getDate()-1)}return n}
function weekMinutes(){const L=store.get('plog',{});let t=0;const d=new Date();for(let i=0;i<7;i++){t+=L[todayKey(d)]||0;d.setDate(d.getDate()-1)}return Math.round(t/60)}
function viewHome(){return viewToday()}

/* --- ⌘K search --- */
function cmdIndex(){const inst=INST(),pitched=inst!=='drums';const out=[];const add=(t,h,k,g)=>out.push({t,h,k:(t+' '+(k||'')).toLowerCase(),g});
 [['home','Home'],['journey','Learning journey'],['session','Practice session'],['daily','Daily challenge'],['warmup','Warm-up'],['practice','Practice'],['songs','Songs'],['plan','Schedule'],['review','Review'],['progress','Progress'],['takes','Recordings'],['paths','Genre paths']].forEach(([h,t])=>add(t,'#'+h,'','Today & plan'));PATHS.forEach(P=>add(P.name+' path','#path-'+P.id,'genre path '+P.genres.join(' '),'Genre paths'));
 instLearn().forEach(([k,t])=>add(t,'#learn-'+k,k,INST_NAME[INST_RAW()]));LEARN_REC.forEach(([k,t])=>add(t,'#learn-'+k,'recording mic room '+k,'Home recording'));Object.keys(PL).filter(k=>!k.startsWith('rec-')&&!(INST_PRI[INST_RAW()]||[]).includes(k)).forEach(k=>add(PL[k].t,'#learn-'+k,k+' '+PL_GROUP(k),PL_GROUP(k)));if(pitched)[...LEARN_THEORY,['rhythm','Rhythm & time']].forEach(([k,t])=>add(t,'#learn-'+k,k,'Theory'));
 TOOLS.filter(([k])=>pitched||['jam','read','slow','transcribe','isolate','metronome'].includes(k)).forEach(([k,t])=>add(t,'#tools-'+k,k,'Tools'));
 if(pitched){MODES.forEach(m=>add(m.name,'#learn-modes','mode '+m.id,'Modes'));WORLD.forEach(w=>add(w.name,'#learn-world','scale '+w.short,'World scales'));Object.entries(CH).forEach(([k,c])=>add(c.name+' chord','#learn-chords',k+' '+c.sym,'Chords'));['major','natural minor','harmonic minor','melodic minor'].forEach(n=>add(n[0].toUpperCase()+n.slice(1)+' scale','#learn-scales','scale','Scales'));}
 else{GROOVES.forEach(g=>add(g.name,'#learn-drums','groove beat','Grooves'));RUDI.forEach(r=>add(r.name,'#learn-drums','rudiment '+r.stick,'Rudiments'));FILLS[16].forEach(f=>add(f.name,'#learn-fills','fill','Fills'))}
 JAMS.forEach(j=>add(j.name+' jam','#tools-jam',j.cat,'Jam styles'));
 (PLAYDB[inst]||[]).forEach(L=>{add(L.name,'#songs',L.genre+' legend player','Legends');L.songs.forEach(sg=>add(sg[0],'#song-'+slug(inst+'-'+sg[0]),L.name,'Songs'))});
 add('Settings','#!settings','sound volume tuning capo left-handed guitar sound kit','App');return out}
function openCmdK(){let ov=document.getElementById('cmdk');if(!ov){ov=document.createElement('div');ov.className='ov';ov.id='cmdk';ov.innerHTML=`<div class="sheet cmdk" role="dialog" aria-modal="true" aria-label="Search"><input id="cmdq" type="search" placeholder="Search lessons, tools, songs, scales…" autocomplete="off" aria-controls="cmdl"><ul id="cmdl" role="listbox"></ul><p class="hint">↑ ↓ to move · Enter to open · Esc to close</p></div>`;document.body.appendChild(ov);ov.addEventListener('click',e=>{if(e.target===ov)ov.hidden=true})}
 const idx=cmdIndex();const q=ov.querySelector('#cmdq'),ul=ov.querySelector('#cmdl');let sel=0,res=[];
 const run=()=>{const w=q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);res=(w.length?idx.filter(x=>w.every(t=>x.k.includes(t))).sort((a,b)=>(b.k.startsWith(w[0])?1:0)-(a.k.startsWith(w[0])?1:0)):idx.slice(0,12)).slice(0,30);sel=0;draw()};
 const draw=()=>{ul.innerHTML=res.length?res.map((x,i)=>`<li role="option" aria-selected="${i===sel}" data-i="${i}"><span>${esc(x.t)}</span><small>${esc(x.g)}</small></li>`).join(''):'<li class="hint">Nothing found</li>';const a=ul.querySelector('[aria-selected=true]');if(a)a.scrollIntoView({block:'nearest'})};
 const go=i=>{const x=res[i];if(!x)return;ov.hidden=true;if(x.h==='#!settings'){openSettings();return}if(location.hash===x.h)route();else location.hash=x.h};
 q.oninput=run;q.onkeydown=e=>{if(e.key==='ArrowDown'){sel=Math.min(res.length-1,sel+1);draw();e.preventDefault()}else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);draw();e.preventDefault()}else if(e.key==='Enter'){go(sel);e.preventDefault()}else if(e.key==='Escape'){ov.hidden=true}};
 ul.onclick=e=>{const li=e.target.closest('[data-i]');if(li)go(+li.dataset.i)};ov.hidden=false;q.value='';run();setTimeout(()=>q.focus(),20)}
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCmdK()}});

