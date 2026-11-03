/* ================= v40: look up any musician ================= */
/* In Claude, Theory Club asks Claude to research a musician you name and builds them into an icon with
   the same shape as the built-in ones: career eras, real songs with years, and the techniques each song teaches.
   Elsewhere you can add a musician yourself by listing a few of their songs. */
const MYICON_KEY='myicons';
function iconNorm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/^the\s+/,'').replace(/[^a-z0-9]+/g,' ').trim()}
function addIconData(inst,ic){if(!ICONS[inst])ICONS[inst]=[];const i=ICONS[inst].findIndex(x=>iconNorm(x.name)===iconNorm(ic.name));if(i>=0)ICONS[inst][i]=ic;else ICONS[inst].push(ic);
 if(!PLAYDB[inst])return;const norm=t=>t.toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9']+/g,' ').trim();let L=PLAYDB[inst].find(x=>x.name===ic.name);if(!L){L={genre:ic.genre,name:ic.name,blurb:ic.blurb,songs:[]};PLAYDB[inst].push(L)}
 ic.eras.forEach(e=>e.songs.forEach(([t,y,ks,note])=>{const ok=ks.filter(k=>TECH[inst][k]);if(!ok.length||L.songs.some(s=>norm(s[0])===norm(t)))return;L.songs.push([t,ok.slice(0,5),note])}))}
(()=>{const M=store.get(MYICON_KEY,{})||{};for(const inst in M)(M[inst]||[]).forEach(ic=>{try{addIconData(inst,ic)}catch(e){}})})();
function saveMyIcon(inst,ic){const M=store.get(MYICON_KEY,{})||{};M[inst]=(M[inst]||[]).filter(x=>iconNorm(x.name)!==iconNorm(ic.name));M[inst].push(ic);store.set(MYICON_KEY,M);addIconData(inst,ic)}
function findIcon(name){const n=iconNorm(name);if(!n)return[];const out=[];for(const inst in ICONS)ICONS[inst].forEach(ic=>{const m=iconNorm(ic.name);if(m===n||m.includes(n)||(n.length>3&&n.includes(m)))out.push({inst,ic})});return out}
function iconGenres(inst){return PLAYDB[inst]?[...new Set(PLAYDB[inst].map(L=>L.genre))].filter(g=>g!=='Classical'||inst==='piano'):['Pop','Rock','Jazz','Soul & R&B','Folk & traditional','Classical']}
/* clean up whatever comes back so it can never break the app */
function cleanIcon(raw,inst){if(!raw||typeof raw!=='object'||raw.unknown)return null;const TT=techT(inst);const now=new Date().getFullYear();
 const eras=(Array.isArray(raw.eras)?raw.eras:[]).slice(0,4).map(e=>({label:String(e&&e.label||'').slice(0,90),songs:(Array.isArray(e&&e.songs)?e.songs:[]).slice(0,4).map(s=>{const y=parseInt(s&&s.year,10);const ks=(Array.isArray(s&&s.techniques)?s.techniques:[]).map(String).filter(k=>TT[k]).slice(0,5);return s&&s.title&&y>1850&&y<=now&&ks.length?[String(s.title).slice(0,80),y,ks,String(s.note||'').slice(0,160)]:null}).filter(Boolean)})).filter(e=>e.songs.length);
 eras.forEach(e=>e.songs.sort((a,b)=>a[1]-b[1]));eras.sort((a,b)=>a.songs[0][1]-b.songs[0][1]);
 if(eras.reduce((n,e)=>n+e.songs.length,0)<3)return null;
 const g=iconGenres(inst);return{name:String(raw.name||'').slice(0,60),genre:g.includes(raw.genre)?raw.genre:g[0],blurb:String(raw.blurb||'').slice(0,200),eras,custom:raw.custom||'claude'}}
async function researchIcon(name,inst,onStatus){const sample=window.claude?await window.claude.use('sample'):null;if(!sample)throw{code:'unavailable'};
 const TT=techT(inst),XX=techX(inst);const list=Object.keys(TT).filter(k=>!k.startsWith('__')).map(k=>`${k}: ${TT[k].name} — ${TT[k].desc}`).join('\n');
 const role={guitar:'guitarist',bass:'bassist',drums:'drummer',piano:'pianist or keyboard player',voice:'singer'}[inst];
 const prompt=`You are an experienced music teacher building a lesson plan that teaches ${inst} technique through one musician's songs, from their early career to their late career.

Musician the student typed: "${name}"
Instrument the student is learning: ${inst}

Use what you know about this musician. If you don't know a real musician by this name, or they aren't known as a ${role} (or for ${inst} parts in their music), reply with only {"unknown": true, "suggestions": [up to 3 similar, well-known ${role}s]}.

Otherwise reply with only this JSON:
{"name": "their usual name, correctly spelled", "genre": one of ${JSON.stringify(iconGenres(inst))}, "blurb": "one plain sentence about their ${inst} style", "eras": [{"label": "Early career: <band or album> (<years>)", "songs": [{"title": "...", "year": 1999, "techniques": ["key", ...], "note": "one sentence on what this song teaches a ${inst} student"}]}]}

Rules:
- Three eras in order (early career, middle career, late career). If their career is short, use two.
- Two or three real, well-known songs per era where they play ${inst}. Use the year the song was first released. Never invent a song, and leave out any song you're unsure about.
- For each song choose 2 to 4 technique keys ONLY from this list, and only ones that genuinely feature in that song's ${inst} part:
${list}
- Write in plain, friendly British English.`;
 onStatus&&onStatus('Researching '+name+'…');
 const raw=await sample.json(prompt,{modelTier:'default',cache:{gcTime:86400000}});
 if(raw&&raw.unknown)throw{code:'unknown',suggestions:Array.isArray(raw.suggestions)?raw.suggestions.slice(0,3).map(String):[]};
 const ic=cleanIcon(raw,inst);if(!ic)throw{code:'thin'};ic.researched=new Date().toISOString().slice(0,10);return ic}
/* the offline way: list songs, choose a style, and the app assigns techniques from that style’s road */
function manualIcon(name,inst,roadId,lines){const TT=techT(inst);const r=ROADMAP[roadId];const pool1=r?r.lv[1].tech:((JTECH[inst]||[])[1]||[]);const pool2=r?r.lv[2].tech:((JTECH[inst]||[])[2]||[]);const base=((JTECH[inst]||[])[0]||['breath','legatov','sirens']);
 const songs=lines.map(l=>{const m=l.match(/^(.*?)[\s,(–-]+((?:18|19|20)\d\d)\)?\s*$/);return m?[m[1].trim(),+m[2]]:null}).filter(x=>x&&x[0]).sort((a,b)=>a[1]-b[1]).slice(0,9);if(songs.length<2)return null;
 const n=songs.length,cut=[Math.ceil(n/3),Math.ceil(2*n/3)];const pools=[[...base,...pool1],[...pool1],[...pool1,...pool2]];
 const eras=[[],[],[]];songs.forEach(([t,y],i)=>{const e=i<cut[0]?0:i<cut[1]?1:2;const P=pools[e].filter(k=>TT[k]);const ks=[...new Set([P[(i*2)%P.length],P[(i*2+1)%P.length],P[(i*3+2)%P.length]].filter(Boolean))];eras[e].push([t,y,ks,'Techniques chosen from the '+(r?r.name:'all-round')+' road. Listen to the original and adjust to what you hear.'])});
 const lab=['Early career','Middle career','Late career'];return{name,genre:iconGenres(inst)[0],blurb:`Added by you${r?` · ${r.name} style`:''}.`,eras:eras.map((s,i)=>s.length?{label:`${lab[i]} (${s[0][1]}${s.length>1&&s[s.length-1][1]!==s[0][1]?'–'+s[s.length-1][1]:''})`,songs:s}:null).filter(Boolean),custom:'manual'}}
function lookupPanelHTML(q,inst){if(!q||q.trim().length<2)return'';const hits=findIcon(q);const here=hits.filter(h=>h.inst===inst),other=hits.filter(h=>h.inst!==inst);if(here.length)return'';
 return`<div class="lookup panel-lite"><b>Can’t find “${esc(q.trim())}”?</b>${other.length?`<p class="hint">${other.map(h=>`${esc(h.ic.name)} is in <a href="#" data-sw="${h.inst}">${esc(INST_NAME[h.inst]||h.inst)}</a>`).join(' · ')}.</p>`:''}
  <p class="hint">${IN_CLAUDE()?'Theory Club can research them and build their career into lessons, just like the musicians above.':'Theory Club can look up their songs on Wikipedia and build their career into lessons, just like the musicians above.'}</p>
  <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn small primary" id="lkres">Research ${esc(q.trim())}</button><button class="btn small" id="lkman">Add them myself</button></div><div id="lkout" class="stack" aria-live="polite"></div></div>`}
function wireLookup(root,getQ,inst,onAdded,switchInst){const out=root.querySelector('#lkout');if(!out)return;
 root.querySelectorAll('[data-sw]').forEach(a=>a.onclick=e=>{e.preventDefault();switchInst(a.dataset.sw)});
 const res=root.querySelector('#lkres'),man=root.querySelector('#lkman');let ctl=null;
 res.onclick=async()=>{const name=getQ().trim();res.disabled=true;man.disabled=true;out.innerHTML=`<p class="hint"><span class="spin"></span> Researching ${esc(name)}’s career and songs. This can take up to a minute…</p>`;
  try{const ic=await researchIcon(name,inst);saveMyIcon(inst,ic);out.innerHTML=`<p>Added <b>${esc(ic.name)}</b>: ${ic.eras.reduce((n,e)=>n+e.songs.length,0)} songs across ${ic.eras.length} eras.</p><p class="hint">Researched by Claude from what it knows. Years and details can occasionally be off; the songs link to practice pages you can check against the recordings.</p>`;onAdded(ic)}
  catch(e){const c=e&&e.code;res.disabled=false;man.disabled=false;
   out.innerHTML=c==='unavailable'?`<p class="hint">Research uses Claude, which is available when you open Theory Club inside Claude. Here, use “Add them myself”.</p>`:
    c==='unknown'?`<p>I couldn’t find a ${inst==='voice'?'singer':'player'} called “${esc(name)}”.${e.suggestions&&e.suggestions.length?` Did you mean ${e.suggestions.map(s=>`<a href="#" data-try="${esc(s)}">${esc(s)}</a>`).join(', ')}?`:' Check the spelling, or add them yourself.'}</p>`:
    c==='not_granted'||c==='sampling_disabled'?`<p class="hint">Claude isn’t allowed to answer for this page, so research is off. You can still add them yourself.</p>`:
    c==='rate_limited'?`<p class="hint">Claude is busy for you right now. Try again in a few minutes.</p>`:
    c==='thin'||c==='invalid_json'?`<p class="hint">Claude couldn’t put together enough reliable songs. Try their full name, or add them yourself.</p>`:`<p class="hint">Something went wrong reaching Claude. Try again in a moment.</p>`;
   out.querySelectorAll('[data-try]').forEach(a=>a.onclick=ev=>{ev.preventDefault();const s=root.querySelector('#picq');if(s){s.value=a.dataset.try;s.dispatchEvent(new Event('input'))}})}};
 man.onclick=()=>{const name=getQ().trim();const rs=roadsFor(inst);out.innerHTML=`<div class="stack"><label>Their style <select id="lkroad">${rs.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join('')}<option value="">Not sure / all-round</option></select></label>
  <label>A few of their songs, one per line, with the year <textarea id="lksongs" rows="5" placeholder="Song title (1994)\nAnother song (1998)\nA late song (2010)"></textarea></label>
  <div class="row"><button class="btn small primary" id="lkadd">Add ${esc(name)}</button></div><p class="hint" id="lkmsg"></p></div>`;
  out.querySelector('#lkadd').onclick=()=>{const ic=manualIcon(name,inst,out.querySelector('#lkroad').value,out.querySelector('#lksongs').value.split('\n').map(s=>s.trim()).filter(Boolean));if(!ic){out.querySelector('#lkmsg').textContent='Add at least two songs, each with a year, like “Creep (1992)”.';return}saveMyIcon(inst,ic);onAdded(ic)}}}

