/* ================= v18: export helpers ================= */
const CRC_T=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC_T[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function makeZip(files){const enc=new TextEncoder();const parts=[],cen=[];let off=0;
 for(const f of files){const nm=enc.encode(f.name),d=f.bytes,crc=crc32(d);const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint32(14,crc,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nm.length,true);
  parts.push(new Uint8Array(h.buffer),nm,d);const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint32(16,crc,true);c.setUint32(20,d.length,true);c.setUint32(24,d.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);cen.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+d.length}
 const cl=cen.reduce((a,x)=>a+x.length,0);const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cl,true);e.setUint32(16,off,true);
 return new Blob([...parts,...cen,new Uint8Array(e.buffer)],{type:'application/zip'})}
const DL_OK=['txt','json','md','csv','html','svg','pdf','zip','webm','mp4','png'];
async function saveFile(name,data){const ext=name.split('.').pop().toLowerCase();
 if(IN_CLAUDE()){let fn=name,d=data;if(!DL_OK.includes(ext)){const bytes=data instanceof Blob?new Uint8Array(await data.arrayBuffer()):typeof data==='string'?new TextEncoder().encode(data):new Uint8Array(data);d=makeZip([{name,bytes}]);fn=name.replace(/\.[^.]+$/,'')+'.zip'}
  try{const dl=await window.claude.use('downloads');if(!dl){toast('Saving files isn’t available here.');return false}await dl.save({filename:fn,data:d});toast(fn.endsWith('.zip')&&!name.endsWith('.zip')?'Saved as a zip file. Unzip it to get '+name+'.':'Saved.');return true}catch(e){toast(e&&e.code==='declined'?'Cancelled.':'That file couldn’t be saved here.');return false}}
 const blob=data instanceof Blob?data:new Blob([data]);const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);return true}
/* Standard MIDI file: tracks of {t,d,n,v} in seconds */
const GM_OUT={kick:36,snare:38,rim:37,hat:42,open:46,ride:51,crash:49,tom1:48,tom2:43,clap:39,cowbell:56,tamb:54,shaker:70,bell:53,swish:38,brushslap:38};
function midiFile({bpm,num=4,den=4,tracks}){const PPQ=480,tk=s=>Math.round(s*bpm/60*PPQ);const vl=n=>{const o=[n&127];while(n>>=7)o.unshift((n&127)|128);return o};const str=s=>[...new TextEncoder().encode(s)];
 const chunk=(id,bytes)=>{const h=[...str(id),(bytes.length>>>24)&255,(bytes.length>>>16)&255,(bytes.length>>>8)&255,bytes.length&255];return[...h,...bytes]};
 const mpq=Math.round(60000000/bpm);const t0=[0,0xFF,0x51,3,(mpq>>16)&255,(mpq>>8)&255,mpq&255,0,0xFF,0x58,4,num,Math.log2(den),24,8,0,0xFF,0x2F,0];
 const trk=tracks.map(T=>{const ev=[];T.notes.forEach(x=>{const a=tk(x.t),b=Math.max(a+1,tk(x.t+x.d));const v=Math.max(1,Math.min(127,Math.round(x.v)));ev.push([a,1,0x90|T.ch,x.n,v],[b,0,0x80|T.ch,x.n,0])});ev.sort((p,q)=>p[0]-q[0]||p[1]-q[1]);
  const out=[0,0xFF,0x03,...vl(str(T.name).length),...str(T.name)];if(T.ch!==9)out.push(0,0xC0|T.ch,T.prog||0);let last=0;ev.forEach(e=>{out.push(...vl(e[0]-last),e[2],e[3],e[4]);last=e[0]});out.push(0,0xFF,0x2F,0);return chunk('MTrk',out)});
 const hdr=chunk('MThd',[0,1,0,tracks.length+1,PPQ>>8,PPQ&255]);return new Uint8Array([...hdr,...chunk('MTrk',t0),...trk.flat()])}
/* collects what a band would play, for MIDI export */
function midiSink(){const tr={drums:{name:'Drums',ch:9,notes:[]},bass:{name:'Bass',ch:1,prog:33,notes:[]},guitar:{name:'Guitar',ch:2,prog:25,notes:[]},piano:{name:'Piano',ch:3,prog:0,notes:[]}};
 return{drum:(k,t,v=1)=>{const n=GM_OUT[k];if(n)tr.drums.notes.push({t,d:.1,n,v:Math.min(127,40+v*80)})},tone:(m,t,d,v,tb)=>{(tr[tb]||tr.guitar).notes.push({t,d,n:Math.round(m),v:Math.min(127,30+v*260)})},tracks:()=>Object.values(tr).filter(x=>x.notes.length)}}
function wavBlob(buf){const ch=buf.numberOfChannels,sr=buf.sampleRate,n=buf.length;const dv=new DataView(new ArrayBuffer(44+n*ch*2));const w=(o,s)=>[...s].forEach((c,i)=>dv.setUint8(o+i,c.charCodeAt(0)));
 w(0,'RIFF');dv.setUint32(4,36+n*ch*2,true);w(8,'WAVE');w(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,ch,true);dv.setUint32(24,sr,true);dv.setUint32(28,sr*ch*2,true);dv.setUint16(32,ch*2,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,n*ch*2,true);
 const d=[...Array(ch)].map((_,c)=>buf.getChannelData(c));let o=44;for(let i=0;i<n;i++)for(let c=0;c<ch;c++){const x=Math.max(-1,Math.min(1,d[c][i]));dv.setInt16(o,x<0?x*0x8000:x*0x7FFF,true);o+=2}return new Blob([dv.buffer],{type:'audio/wav'})}
/* renders sound offline: swaps the live audio graph for an offline one while `fn` schedules notes */
async function renderOffline(secs,fn){if(!audio())return null;if(SND==='samples')await Promise.all(['drums','guitar','bass','piano'].map(k=>loadSamples(k)));
 const sr=44100,off=new OfflineAudioContext(2,Math.ceil(sr*secs),sr);const keep={AC,MASTER,BUS,DBUS,NOISE};
 AC=off;MASTER=off.createGain();MASTER.gain.value=.9;mixChain(off,MASTER);BUS={};DBUS={};NOISE=null;
 try{fn(off)}finally{AC=keep.AC;MASTER=keep.MASTER;BUS=keep.BUS;DBUS=keep.DBUS;NOISE=keep.NOISE}return off.startRendering()}
async function exportAudio(name,secs,fn){toast('Making the audio file…');const buf=await renderOffline(secs,fn);if(!buf)return;await saveFile(name,wavBlob(buf))}
/* printable page with the app's own styles */
function printNotation(title,html){const css=[...document.querySelectorAll('style')].map(s=>s.textContent).join('\n');
 const doc=`<!doctype html><html data-theme="light"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}\nbody{background:#fff;padding:24px;max-width:none}.sidebar,.tabbar,.toolbar{display:none!important}h1{font:700 22px var(--f-body);margin:0 0 4px}.sub{color:#666;margin:0 0 18px}.scroll{overflow:visible!important}svg .cur,svg .arr{display:none}@media print{body{padding:0}.noprint{display:none}}</style></head><body><h1>${esc(title)}</h1><p class="sub">Theory Club · ${new Date().toLocaleDateString()}</p>${html}<p class="noprint" style="margin-top:24px"><button onclick="print()">Print or save as PDF</button></p></body></html>`;
 if(IN_CLAUDE()){saveFile(title.replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'-').toLowerCase()+'.html',doc);return}
 const w=window.open('','_blank');if(!w){saveFile('chart.html',doc);return}w.document.write(doc);w.document.close();setTimeout(()=>{try{w.focus();w.print()}catch(e){}},400)}
const fileSlug=s=>String(s||'theory-club').replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'-').toLowerCase()||'theory-club';

function gtonePills(){return`<div class="pickrow"><span class="eyebrow">Guitar sound</span>${pillsHTML('gtone',GTONES,store.get('gtone','acoustic'))}</div>`}
function gtonePreview(){const c=audio();if(!c)return;const t=c.currentTime+.05;strum(gtrVoice('E','maj'),t,1.4,.2)}


/* ---------- your own chord progressions ---------- */
const CH_ALIAS={'':'maj',maj:'maj',M:'maj',m:'min',min:'min','-':'min',dim:'dim','°':'dim',o:'dim',aug:'aug','+':'aug',sus:'sus4',sus4:'sus4',sus2:'sus2',maj7:'maj7',M7:'maj7','Δ':'maj7','Δ7':'maj7','7':'7',dom7:'7',m7:'m7',min7:'m7','-7':'m7',m7b5:'m7b5','m7♭5':'m7b5','ø':'m7b5','ø7':'m7b5',dim7:'dim7','°7':'dim7',o7:'dim7',mMaj7:'mMaj7','m(maj7)':'mMaj7','9':'9','7b9':'7b9','7♭9':'7b9','13':'13','7sus4':'7sus4','7sus':'7sus4',add9:'sus2',m9:'m7',maj9:'maj7','6':'maj',m6:'min',min6:'min',maj6:'maj',m11:'m7',11:'7sus4'};
function parseChord(sym){const m=/^([A-Ga-g])([#b♯♭]?)([^/]*)/.exec(String(sym).trim());if(!m)return null;const root=m[1].toUpperCase()+(m[2]==='♯'||m[2]==='#'?'#':m[2]?'b':'');const suf=m[3].trim();const t=CH_ALIAS[suf]!=null?CH_ALIAS[suf]:(/^m(?!aj)/.test(suf)?'min':null);if(!t)return null;return{root,t,sym:chordSym(root,t)}}
function parseLine(txt){const bars=[],bad=[];String(txt||'').split(/[\s|,]+/).filter(Boolean).forEach(tok=>{if(tok==='%'&&bars.length){bars.push({...bars[bars.length-1]});return}const c=parseChord(tok);if(c)bars.push(c);else bad.push(tok)});return{bars,bad}}
const SONG_DEF={V:'C Am F G',C:'F G C Am',B:'Dm Em F G',form:'V V C C V C B C'};
function songBars(S){const sec={V:parseLine(S.V),C:parseLine(S.C),B:parseLine(S.B)};const names={V:'Verse',C:'Chorus',B:'Bridge'};const out=[];const bad=[...sec.V.bad,...sec.C.bad,...sec.B.bad];
 String(S.form||'').toUpperCase().split(/[\s,]+/).filter(Boolean).forEach(f=>{const k=f[0];if(!sec[k]||!sec[k].bars.length)return;sec[k].bars.forEach((c,i)=>out.push({...c,roman:i===0?names[k]:'',sec:k}))});
 if(!out.length)['V','C','B'].forEach(k=>sec[k].bars.forEach((c,i)=>out.push({...c,roman:i===0?names[k]:'',sec:k})));return{bars:out,bad}}
function songKey(bars){const c=bars[0];if(!c)return{key:'C',mode:'major'};const minor=['min','m7','m7b5','dim','mMaj7'].includes(c.t);return{key:c.root,mode:minor?'minor':'major'}}

/* ---------- walking bass and jazz comping ---------- */
function beatPositions(g){if(g.groups){const o=[];let a=0;g.groups.forEach(x=>{o.push(a);a+=x});return o}const per=g.steps/4;return[0,per,2*per,3*per]}
function walkBar(c,n,beats){const R=bassRootMidi(c.root),third=CH[c.t].st[1][0],fifth=(CH[c.t].st[2]||[7])[0];const pick=a=>a[Math.floor(Math.random()*a.length)];
 let nr=bassRootMidi(n.root);const notes=[R];const mids=[R+third,R+fifth,R+12,R+fifth,R+(CH[c.t].st[3]?CH[c.t].st[3][0]:9)];
 while(notes.length<beats-1)notes.push(pick(mids.filter(x=>x!==notes[notes.length-1])));
 if(beats>1){const last=notes[notes.length-1];while(nr<last-6)nr+=12;while(nr>last+6)nr-=12;notes.push(nr+(Math.random()<.5?-1:1))}
 return notes.map(m=>{while(m>55)m-=12;while(m<28)m+=12;return m})}
function rootless(c){const pc=parse(c.root).pc;const tt={maj7:[4,7,11,14],m7:[3,7,10,14],'7':[4,9,10,14],'9':[4,9,10,14],'13':[4,9,10,14],m7b5:[3,6,10,12],dim7:[3,6,9,12],'7b9':[4,7,10,13],mMaj7:[3,7,11,14],maj:[4,7,9,14],min:[3,7,10,14],sus4:[5,7,10,14],'7sus4':[5,7,10,14],sus2:[2,7,12,14],dim:[3,6,9,12],aug:[4,8,12,16]}[c.t]||[4,7,11,14];
 let base=48+pc;const ns=tt.map(x=>base+x);while(Math.min(...ns)<52)ns.forEach((x,i)=>ns[i]+=12);while(Math.min(...ns)>63)ns.forEach((x,i)=>ns[i]-=12);
 if(Math.random()<.5){const b=[...ns].sort((a,b)=>a-b);b[0]+=12;b[1]+=12;if(Math.max(...b)<=76)return b.sort((a,b)=>a-b)}return ns.sort((a,b)=>a-b)}
const COMP_RHY={16:[[0,6],[2,10],[0,10],[4,14],[6,12],[2,6,12],[0,7,12]],12:[[0,5],[3,9],[0,8],[5,11],[2,8],[0,6,11]]};
const JAZZY=new Set(['bossa','gypsy','cafe']);

/* ---------- saved grooves ---------- */
function myGrooves(){return store.get('mygrooves',[])}

/* one step of the band, played into `out` (the speakers, or a MIDI or audio file) */
function bandStep(st,abs,t,sd,out){const{jid,g,chords,on,fillN,kit,inst,bassStyle,chordInst}=st;const steps=g.steps;const cs=chords;if(!cs.length)return;const bi=Math.floor(abs/steps),b=bi%cs.length,s=abs%steps,half=Math.floor(steps/2),c=cs[b],n=cs[(b+1)%cs.length];const R=bassRootMidi(c.root);
 let tt=t;if(g.swing){const pos=s%4;if(g.swingUnit==='16'){if(pos%2===1)tt+=sd*.333*g.swing}else{if(pos===2)tt+=sd*.667*g.swing;else if(pos===3)tt+=sd*.5*g.swing}}
 if(on.drums){const fs=fillsFor(g);const fl=fillN?fs[Math.floor(abs/(steps*fillN))%fs.length]:null;const h=drumVary(g,abs,drumStep(g,fl,fillN,abs));for(const k in h)out.drum(k,tt,h[k]*.85,kit)}
 if(on.perc){const ph=percHits(jid,g,abs);for(const k in ph)out.drum(k,tt,ph[k]*.7,kit)}
 const bp=beatPositions(g);
 if(on.bass){const walk=bassStyle==='walk'||(bassStyle==='auto'&&['gypsy','cafe'].includes(jid));
  if(walk){if(s===0)st.wb[bi]=walkBar(c,n,bp.length);const k=bp.indexOf(s);if(k>=0&&st.wb[bi])out.tone(st.wb[bi][k],tt,sd*(bp[k+1]!=null?bp[k+1]-s:steps-s)*.9,.38,'bass')}
  else if(bassStyle==='auto'&&jid==='funk'&&steps===16){const h={0:0,3:0,7:12,10:7}[s];if(h!=null)out.tone(R+h,tt,sd*2,.36,'bass')}
  else if(bassStyle==='auto'&&jid==='reggae'&&steps===16){if(s===half)out.tone(R,tt,sd*half*.8,.4,'bass');else if(s===half+4)out.tone(R+7,tt,sd*3,.34,'bass')}
  else if(bassStyle==='auto'&&['punk','indie','krautrock'].includes(jid)&&steps===16){if(s%2===0)out.tone(R,tt,sd*1.6,.3,'bass')}
  else if(bassStyle==='roots'){const k=bp.indexOf(s);if(k>=0)out.tone(R,tt,sd*(bp[k+1]!=null?bp[k+1]-s:steps-s)*.85,.34,'bass')}
  else if(s===0||s===half)out.tone(s===half&&!['ballad','cafe'].includes(jid)?R+7:R,tt,sd*half*.9,.34,'bass')}
 if(on.chords){if(chordInst==='piano'&&(JAZZY.has(jid)||st.comp)){if(s===0){const rs=COMP_RHY[steps]||[bp[0],bp[Math.floor(bp.length/2)]||0];st.cr[bi]=rs[Math.floor(Math.random()*rs.length)].filter(x=>x<steps)}const r=st.cr[bi]||[];const i=r.indexOf(s);if(i>=0){const v=rootless(c);const nx=r[i+1]!=null?r[i+1]:steps;v.forEach(m=>out.tone(m,tt,sd*Math.min(nx-s,steps/2)*.9,.13,'piano'))}}
  else playBandChord(jid,c,s,steps,tt,sd,.16,chordInst,out,g)}}

TOOLPAGES.jam=el=>{const inst=INST();let jid=jamFor(),key=null,bpm=JAMS.find(j=>j.id===jid).bpm,playing=false,fillN=4,kit='auto',src=store.get('jamsrc','style'),bassStyle='auto',chordInst=inst==='piano'?'piano':'guitar',groove='style';
 const on={drums:inst!=='drums',perc:true,bass:inst!=='bass',chords:!(inst==='guitar'&&false)};let song=Object.assign({},SONG_DEF,store.get('jamsong',{}));
 const KIT_ID=()=>kit==='auto'?(JAMKIT[jid]||'rock'):kit;const J=()=>JAMS.find(j=>j.id===jid);
 const G=()=>{if(groove!=='style'){const m=myGrooves().find(x=>x.id===groove);if(m)return m}return GROOVES.find(x=>x.id===J().groove)};
 const sb=()=>songBars(song);
 const tonality=()=>{if(src==='song'){const k=songKey(sb().bars);return k}return{key:key,mode:J().mode}};
 const md=()=>J().mode==='major'?'M':'m';
 const chords=()=>src==='song'?sb().bars:J().prog.map(([d,t])=>chordAt(key,J().mode,d,t));
 const state=()=>({jid,g:G(),chords:chords(),on,fillN,kit:KIT_ID(),inst,bassStyle,chordInst,comp:chordInst==='piano'&&src==='song'&&JAZZY.has(jid),wb:{},cr:{}});
 const scaleFor=()=>{const T=tonality();const j=J();if(src!=='song')return j.scale;const wantMinor=T.mode==='minor';const s=j.scale;const minorish=['minpent','blues','dorian','natural','harmonic','hijaz'].includes(s);return wantMinor===minorish?s:(wantMinor?'minpent':'majpent')};
 let live=null;
 const segs=()=>{const out=[];chords().forEach((c,i)=>{if(c.roman||!out.length)out.push({name:c.roman||'',sec:c.sec,start:i,len:0});out[out.length-1].len++});return out};let curSeg=0;
 const segOf=b=>{const S=segs();return Math.max(0,S.findIndex(x=>b>=x.start&&b<x.start+x.len))};
 const songRow=k=>{const S=segs(),cs=chords(),sg=S[k]||S[0];if(!sg)return'';return`<div class="songtl">${S.map((x,i)=>`<span class="tlseg s${x.sec||''} ${i===k?'on':''}" style="flex:${x.len}" title="${esc(x.name)}, ${x.len} bars">${esc(x.name)}</span>`).join('')}</div><div class="chordrow">${cs.slice(sg.start,sg.start+sg.len).map((c,j)=>`<span class="cbtn" data-b="${sg.start+j}"><small>${j===0?esc(sg.name):'&nbsp;'}</small><b>${c.sym}</b></span>`).join('')}</div>`};
 const chordRow=()=>src==='song'?songRow(curSeg=0):`<div class="chordrow">${chords().map((c,i)=>`<span class="cbtn" data-b="${i}"><small>${c.roman||'&nbsp;'}</small><b>${c.sym}</b></span>`).join('')}</div>`;
 const render=()=>{key=normKey(key||(J().mode==='major'?'C':'A'),md());stopLoop();playing=false;const j=J();const T=tonality();const sc=scaleFor();const sn=scaleNotes(T.key,sc),sm=scaleMidis(T.key,sc);const S=sb();const mg=myGrooves();
  el.innerHTML=`<p>Pick a style and a key and the band loops forever, so you can practise soloing, strumming or a part of your own over it. Turn off your own instrument's part and play it yourself, or type in the chords of your own song.</p>
  <div class="panel">${jamPicker(jid)}
  <div class="pickrow"><span class="eyebrow">Chords</span>${pillsHTML('src',[['style','The style’s progression'],['song','My own song']],src)}</div>
  ${src==='style'?`<div class="pickrow"><span class="eyebrow">Key</span>${pillsHTML('k',keyItems(md()),key)}</div>`:`<div class="songed"><p class="hint">Type one chord per bar, like <b>C Am F G</b>. Use % to repeat the last bar. Chords such as Dm7, G7, Bbmaj7, F#m and Csus4 all work. The song form plays the sections in order: V = verse, C = chorus, B = bridge.</p>
   <div class="songgrid"><label>Verse<input id="sgV" value="${esc(song.V)}" autocomplete="off"></label><label>Chorus<input id="sgC" value="${esc(song.C)}" autocomplete="off"></label><label>Bridge<input id="sgB" value="${esc(song.B)}" autocomplete="off"></label><label>Song form<input id="sgF" value="${esc(song.form)}" autocomplete="off"></label></div>
   <p class="hint ${S.bad.length?'warn':''}" id="sgmsg">${S.bad.length?`I don’t recognise: ${S.bad.map(esc).join(', ')}`:`${S.bars.length} bars · key of ${pr(T.key)} ${T.mode}`}</p></div>`}
  <div class="row" style="gap:18px;align-items:flex-end;flex-wrap:wrap"><div class="pickrow"><span class="eyebrow">Band</span><div class="pills">${[['drums','Drums'],['perc','Percussion'],['bass','Bass'],['chords','Chords']].map(([k,l])=>`<button class="pill" data-part="${k}" aria-pressed="${on[k]}">${l}</button>`).join('')}</div></div><div class="pickrow"><span class="eyebrow">Drum fills</span>${pillsHTML('fn',[['0','Off'],['4','Every 4 bars'],['8','Every 8 bars']],String(fillN))}</div></div>
  <details class="ged"><summary>Band settings</summary>
   <div class="pickrow"><span class="eyebrow">Drum groove</span>${pillsHTML('gv',[['style',`Style (${(GROOVES.find(x=>x.id===j.groove)||{}).name||''})`],...mg.map(x=>[x.id,'★ '+esc(x.name)])],groove)}${mg.length?'':'<p class="hint">Save grooves on the Drum grooves page to use them here.</p>'}</div>
   <div class="pickrow"><span class="eyebrow">Drum kit</span>${pillsHTML('kit',[['auto',`Auto (${DKITS[JAMKIT[jid]||'rock'].name})`],...Object.entries(DKITS).map(([k,x])=>[k,x.name])],kit)}</div>
   <div class="pickrow"><span class="eyebrow">Bass plays</span>${pillsHTML('bs',[['auto','Style’s bass line'],['roots','Roots on the beat'],['walk','Walking bass']],bassStyle)}</div>
   <div class="pickrow"><span class="eyebrow">Chords on</span>${pillsHTML('ci',[['guitar','Guitar'],['piano','Piano']],chordInst)}</div>
   ${chordInst==='guitar'?gtonePills():`<p class="hint">${JAZZY.has(jid)?'In jazz styles the piano comps: jazz voicings without the root, on a different rhythm every bar.':'Piano plays the chords on the style’s rhythm.'}</p>`}
  </details>
  <div id="jch">${chordRow()}</div><p class="hint">${esc(j.tip)}</p>
  <div class="row pctl"><button class="btn primary small" id="pl">${ICON.play} Start the band</button><label class="tempo" for="jbpm">Tempo <input type="range" id="jbpm" min="50" max="220" value="${bpm}"> <span id="jbv">${bpm}</span> BPM</label></div>
  <div class="row"><button class="btn small" id="jmidi">Download as MIDI</button><button class="btn small" id="jwav">Download as audio (WAV)</button><span class="hint">One time round the chords, at least 8 bars.</span></div></div>
  <div class="panel"><h3>Solo with ${pr(T.key)} ${SC[sc].name.toLowerCase()}</h3>${chips(sn,0)}${instView(sm,[...sn,T.key],sm[0])}</div>`;
  bindPills(el,(g,v)=>{if(g==='j'){jid=v;bpm=J().bpm;key=normKey(key,md())}else if(g==='k')key=v;else if(g==='src'){src=v;store.set('jamsrc',v)}else if(g==='kit'){kit=v;const c=audio();if(c){const t0=c.currentTime+.05;['kick','snare','hat','snare'].forEach((d,i)=>drum(d,t0+i*.18,1,KIT_ID()))}return}else if(g==='fn'){fillN=+v;return}else if(g==='gv'){groove=v}else if(g==='bs'){bassStyle=v;if(live)live.bassStyle=v;return}else if(g==='ci'){chordInst=v}else if(g==='gtone'){store.set('gtone',v);gtonePreview();return}render();if(g==='gv'||g==='ci')el.querySelector('details.ged').open=true});
  const sgIn=el.querySelectorAll('.songgrid input');sgIn.forEach(inp=>inp.onchange=()=>{song={V:el.querySelector('#sgV').value,C:el.querySelector('#sgC').value,B:el.querySelector('#sgB').value,form:el.querySelector('#sgF').value};store.set('jamsong',song);const S2=sb();const T2=tonality();el.querySelector('#sgmsg').textContent=S2.bad.length?`I don’t recognise: ${S2.bad.join(', ')}`:`${S2.bars.length} bars · key of ${pr(T2.key)} ${T2.mode}`;el.querySelector('#sgmsg').classList.toggle('warn',!!S2.bad.length);el.querySelector('#jch').innerHTML=chordRow();if(live)live.chords=chords()});
  el.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>{on[b.dataset.part]=!on[b.dataset.part];b.setAttribute('aria-pressed',on[b.dataset.part])});
  el.querySelector('#jbpm').oninput=e=>{bpm=+e.target.value;el.querySelector('#jbv').textContent=bpm};
  const toLive={drum:(k,t,v,kt)=>drum(k,t,v,kt),tone:(m,t,d,v,tb)=>tone(m,t,d,v,tb)};
  el.querySelector('#pl').onclick=()=>{if(playing){stopLoop();playing=false;live=null;el.querySelector('#pl').innerHTML=ICON.play+' Start the band';return}playing=true;el.querySelector('#pl').innerHTML='■ Stop';live=state();
   startLoop(()=>{const g=G();live.g=g;live.fillN=fillN;live.kit=KIT_ID();return{steps:g.steps,per:g.den===8?2:undefined,rows:{},bpm}},{extra:(abs,t,sd)=>bandStep(live,abs,t,sd,toLive),
    onStep:(a,p)=>{if(a%p.steps)return;const b=Math.floor(a/p.steps)%live.chords.length;if(src==='song'){const k=segOf(b);if(k!==curSeg){curSeg=k;const jc=el.querySelector('#jch');if(jc)jc.innerHTML=songRow(k)}}el.querySelectorAll('#jch .cbtn').forEach(x=>x.classList.toggle('on',+x.dataset.b===b))}})};
  const exportLen=()=>{const st=state();const g=st.g;const L=st.chords.length||4;const bars=L>=8?L:L*Math.ceil(8/L);const per=g.den===8?2:g.steps/4;const sd=60/bpm/per;return{st,g,bars,sd,secs:bars*g.steps*sd}};
  el.querySelector('#jmidi').onclick=()=>{const{st,g,bars,sd}=exportLen();const sink=midiSink();for(let a=0;a<bars*g.steps;a++)bandStep(st,a,a*sd,sd,sink);saveFile(`${fileSlug(J().name)}-jam-${bpm}bpm.mid`,midiFile({bpm:g.den===8?bpm/2:bpm,num:g.num||4,den:g.den||4,tracks:sink.tracks()}))};
  el.querySelector('#jwav').onclick=()=>{const{st,g,bars,sd,secs}=exportLen();exportAudio(`${fileSlug(J().name)}-jam-${bpm}bpm.wav`,secs+2.5,()=>{const o={drum:(k,t,v,kt)=>drum(k,t+.05,v,kt),tone:(m,t,d,v,tb)=>tone(m,t+.05,d,v,tb)};for(let a=0;a<bars*g.steps;a++)bandStep(st,a,a*sd,sd,o)})}};
 render()};

/* ---------- drum page: time signatures, kits, swing, feel, mixer, saved grooves, export ---------- */
FILLS[16].push(
 {id:'linear',name:'Linear sixteenths',from:8,rows:{snare:'x..x..x.',tom1:'.x..x...',kick:'..x..x.x'}},
 {id:'paradiddle',name:'Paradiddle round the toms',from:8,rows:{tom1:'x.xx....',snare:'.x..x.xx',tom2:'.....x..',kick:'x...x...'}},
 {id:'bighits',name:'Big hits',from:0,rows:{crash:'x...x...x...x...',kick:'x...x...x...x...',snare:'....x.......xxxx'}});
const SNAREISH=new Set(['snare','rim','clap','brushslap']);
function swingOffset(s,sd,sw,unit){if(!sw)return 0;const pos=s%4;if(unit==='16')return pos%2===1?sd*.333*sw:0;return pos===2?sd*.667*sw:pos===3?sd*.5*sw:0}
function mixerHTML(){return`<div class="mixer">${[['kick','Kick'],['snare','Snare'],['hats','Hi-hats'],['toms','Toms'],['cym','Cymbals']].map(([k,l])=>`<label>${l}<input type="range" min="0" max="150" value="${Math.round(DMIX[k]*100)}" data-mix="${k}" aria-label="${l} volume"></label>`).join('')}</div>`}
function bindMixer(root){root.querySelectorAll('[data-mix]').forEach(r=>r.oninput=()=>{DMIX[r.dataset.mix]=+r.value/100;store.set('dmix',DMIX)})}
PAGES.drums=el=>{let meter='4/4',gid='rock',bpm=100,pat=null,playing=false,fillId='toms',fillN=4,kit=store.get('dkit','rock'),swing=0,swingUnit='8',feel=0;
 const M=()=>meterOf(meter);const mine=()=>myGrooves().filter(x=>(x.meter||'4/4')===meter);const list=()=>[...(meter==='4/4'?GROOVES:TSG[meter]),...mine()];
 const load=()=>{const m=M();if(!list().find(x=>x.id===gid))gid=list()[0].id;const g=list().find(x=>x.id===gid);
  if(g.id.startsWith('my-'))pat={steps:g.steps,per:g.per,groups:g.groups||null,num:g.num,den:g.den,rows:{...g.rows}};else pat=m.groups?{steps:m.groups.reduce((a,c)=>a+c,0),per:4,groups:m.groups,num:m.num,den:m.den,rows:{...g.rows}}:{steps:g.steps,rows:{...g.rows}};
  if(!pat.groups)delete pat.groups;bpm=g.bpm;swing=g.swing||0;swingUnit=g.swingUnit||'8';const fs=fillsFor(pat);if(!fs.find(f=>f.id===fillId))fillId=fs[0].id};load();
 const canSwing=()=>!pat.groups&&(pat.per||pat.steps/4)===4;
 const curFill=()=>{if(!fillN)return null;const fs=fillsFor(pat);return fs.find(f=>f.id===fillId)||fs[0]};
 const chart=rows=>pat.groups?drumChart(rowsToItems(pat.steps,rows),pat.steps,4,pat.num,{groups:pat.groups,num:pat.num,den:pat.den}):drumChart(rowsToItems(pat.steps,rows),pat.steps,pat.steps/4,4);
 const charts=()=>{const f=curFill();return`<div id="gchart">${chart(pat.rows)}</div>${f?`<p class="hint" style="margin-top:6px">Every ${fillN} bars the last bar becomes this fill, then a crash starts the next phrase:</p><div id="fchart">${chart(fillBarRows(pat,f))}</div>`:''}`};
 const hit=(k,v=1)=>{const c=audio();if(c)drum(k,c.currentTime+.03,v,kit)};
 const perOf=()=>pat.den===8?2:(pat.per||pat.steps/4);
 const sched=(abs,t,sd,out)=>{const h=drumStep(pat,curFill(),fillN,abs);if(abs===0){h.crash=1;delete h.hat;delete h.ride}const s=abs%pat.steps;const off=canSwing()?swingOffset(s,sd,swing/100,swingUnit):0;for(const k in h)out(k,Math.max(0,t+off+(SNAREISH.has(k)?feel/1000:0)),h[k])};
 const phraseBars=()=>fillN||4;
 const render=()=>{setSongs('drums',meter==='4/4'&&!gid.startsWith('my-')?gid:'rock');const g=list().find(x=>x.id===gid);const fs=fillsFor(pat);const m=M();const isMine=gid.startsWith('my-');
  el.innerHTML=`<span class="eyebrow">Drums</span><h1>Drum grooves & fills</h1><p>A groove is a pattern that repeats across the kit. A fill breaks the pattern for a beat or a bar to lead into the next section, then a crash marks the new start. Read the chart one beat at a time: cymbals are ×, the snare sits in the middle and the kick at the bottom.</p>
  <div class="panel"><div class="pickrow"><span class="eyebrow">Time signature</span>${pillsHTML('ts',METERS.map(x=>[x.id,x.id]),meter)}</div><p class="hint">${m.info}</p>
  <div class="pickrow"><span class="eyebrow">Groove</span>${pillsHTML('g',list().map(x=>[x.id,(x.id.startsWith('my-')?'★ ':'')+esc(x.name)]),gid,'select')}</div><p><b>${esc(g.name)}.</b> ${g.feel?esc(g.feel):'One of your saved grooves.'}${isMine?` <button class="btn small" id="gdel">Delete this groove</button>`:''}</p>
  <div class="row" style="gap:18px;align-items:flex-end;flex-wrap:wrap"><div class="pickrow"><span class="eyebrow">Kit sound</span>${pillsHTML('kit',Object.entries(DKITS).map(([k,x])=>[k,x.name]),kit,'select')}</div><div class="pickrow"><span class="eyebrow">Fill</span>${pillsHTML('f',[['none','No fill'],...fs.map(f=>[f.id,f.name])],fillN?fillId:'none','select')}</div><div class="pickrow"><span class="eyebrow">Fill every</span>${pillsHTML('n',[['2','2 bars'],['4','4 bars'],['8','8 bars']],String(fillN||4))}</div></div>
  <div id="charts">${charts()}</div>
  <div class="row pctl"><button class="btn primary small" id="pl">${playing?'■ Stop':ICON.play+' Play loop'}</button><label class="tempo" for="dbpm">Tempo <input type="range" id="dbpm" min="40" max="${m.den===8?260:220}" value="${bpm}"> <span id="dbv">${bpm}</span> ${m.den===8?'eighth notes per minute':'BPM'}</label><button class="btn small" id="rs">Reset pattern</button><span class="hint" id="dbar" aria-live="polite"></span></div>
  <details class="ged"><summary>Feel and mix</summary>
   ${canSwing()?`<div class="feelrow"><label class="tempo">Swing <input type="range" id="sw" min="0" max="100" value="${swing}"> <span id="swv">${swing?swing+'%':'Straight'}</span></label>${pillsHTML('su',[['8','Swing the eighths'],['16','Swing the sixteenths']],swingUnit)}</div><p class="hint">0% is straight. 100% is a full triplet shuffle. Most swing and hip-hop sits between 30% and 60%.</p>`:'<p class="hint">This groove already has its own feel, so swing is off.</p>'}
   <div class="feelrow"><label class="tempo">Backbeat <input type="range" id="fe" min="-30" max="30" value="${feel}"> <span id="fev">${feel===0?'On the beat':feel>0?feel+' ms laid back':-feel+' ms pushed'}</span></label></div><p class="hint">Laid back puts the snare a hair late for a heavy, relaxed groove. Pushed puts it early for urgency.</p>
   <span class="eyebrow">Volume of each part</span>${mixerHTML()}</details>
  <details class="ged"><summary>Edit the groove</summary><p class="hint">Each square is one slice of the bar. ${m.den===8?'The numbers count the eighth notes; “&” is the sixteenth between them.':'Count “1 e & a” for each beat.'} Tap a square to add a hit, again for a quiet ghost note, and a third time to clear it.</p><div id="gg">${grooveGrid(pat)}</div>
   <div class="row" style="margin-top:10px"><input id="gname" placeholder="Name your groove" maxlength="40" autocomplete="off"><button class="btn small primary" id="gsave">Save to My grooves</button><span class="hint" id="gmsg"></span></div></details>
  <div class="row"><button class="btn small" id="dmidi">Download as MIDI</button><button class="btn small" id="dwav">Download as audio (WAV)</button><button class="btn small" id="dprint">Print the chart</button></div></div>
  <h3>The kit</h3><p class="hint">Playing the ${DKITS[kit].name.toLowerCase()} sound. Change it with “Kit sound” above.</p><div class="scroll"><table class="tbl"><thead><tr><th>Piece</th><th>What it does</th><th>Hear</th></tr></thead><tbody>${KIT.map(([k,n,d])=>`<tr><td><b>${n}</b></td><td>${d}</td><td><button class="btn small" data-hit="${k}" aria-label="Play ${n}">${ICON.play}</button></td></tr>`).join('')}</tbody></table></div>
  <h3>Rudiments</h3><p>Rudiments are a drummer's scales: sticking patterns you practise slowly, then speed up. R is your right hand, L your left. Fills are mostly rudiments moved around the kit. To practise fills on their own, try <a href="#learn-fills">Fill practice</a>.</p>
  <div class="cols">${RUDI.map(rd=>`<div class="mini"><h4>${rd.name}</h4><span class="formula">${rd.stick}</span><span class="o">${rd.desc}</span><div><button class="btn small" data-rd="${rd.id}">${ICON.play} Hear it</button></div></div>`).join('')}</div>`;
  bindPills(el,(g2,v)=>{if(g2==='ts'){if(playing){stopLoop();playing=false}meter=v;load()}else if(g2==='g'){gid=v;load()}else if(g2==='kit'){kit=v;store.set('dkit',v);['kick','hat','snare','hat'].forEach((d,i)=>{const c=audio();if(c)drum(d,c.currentTime+.05+i*.17,1,kit)})}else if(g2==='su'){swingUnit=v;return}else if(g2==='f'){if(v==='none')fillN=0;else{fillId=v;if(!fillN)fillN=4}}else{fillN=+v}const open=[...el.querySelectorAll('details.ged')].map(d=>d.open);render();el.querySelectorAll('details.ged').forEach((d,i)=>d.open=open[i])});
  el.querySelector('#dbpm').oninput=e=>{bpm=+e.target.value;el.querySelector('#dbv').textContent=bpm};
  const sw=el.querySelector('#sw');if(sw)sw.oninput=()=>{swing=+sw.value;el.querySelector('#swv').textContent=swing?swing+'%':'Straight'};
  const fe=el.querySelector('#fe');fe.oninput=()=>{feel=+fe.value;el.querySelector('#fev').textContent=feel===0?'On the beat':feel>0?feel+' ms laid back':-feel+' ms pushed'};
  bindMixer(el);
  el.querySelector('#rs').onclick=()=>{load();render()};
  const gd=el.querySelector('#gdel');if(gd)gd.onclick=()=>{store.set('mygrooves',myGrooves().filter(x=>x.id!==gid));gid='';load();render();toast('Groove deleted.')};
  el.querySelector('#gsave').onclick=()=>{const nm=(el.querySelector('#gname').value||'').trim()||`My groove ${myGrooves().length+1}`;const id='my-'+Date.now().toString(36);const G={id,name:nm,meter,steps:pat.steps,per:pat.groups?4:(pat.per||pat.steps/4),groups:pat.groups||null,num:pat.num||4,den:pat.den||4,rows:{...pat.rows},bpm,swing,swingUnit,feel:''};
   store.set('mygrooves',[...myGrooves(),G].slice(-40));gid=id;load();render();toast(`Saved “${nm}”. It’s in My grooves here and in Jam along.`)};
  el.querySelector('#pl').onclick=()=>{if(playing){stopLoop();playing=false;render();return}playing=true;render();
   startLoop(()=>({steps:pat.steps,per:perOf(),rows:{},bpm}),{extra:(abs,t,sd)=>sched(abs,t,sd,(k,tt,v)=>drum(k,tt,v,kit)),
    onStep:(a,p)=>{const s=a%p.steps,b=Math.floor(a/p.steps);const fb=curFill()&&b%fillN===fillN-1;el.querySelectorAll('.cell.cur,#charts .cur').forEach(c=>c.classList.remove('cur'));el.querySelectorAll(`.cell[data-i="${s}"],#${fb?'fchart':'gchart'} [data-s="${s}"]`).forEach(c=>c.classList.add('cur'));const d=el.querySelector('#dbar');if(d&&s===0)d.textContent=fb?'Fill!':`Bar ${b%(fillN||4)+1}`}})};
  const sdOf=()=>60/bpm/perOf();
  el.querySelector('#dmidi').onclick=()=>{const sd=sdOf(),sink=midiSink();const n=phraseBars()*pat.steps;for(let a=0;a<n;a++)sched(a,a*sd,sd,(k,t,v)=>sink.drum(k,t,v));saveFile(`${fileSlug(g.name)}-${bpm}bpm.mid`,midiFile({bpm:pat.den===8?bpm/2:bpm,num:pat.num||4,den:pat.den||4,tracks:sink.tracks()}))};
  el.querySelector('#dwav').onclick=()=>{const sd=sdOf();const n=phraseBars()*pat.steps;exportAudio(`${fileSlug(g.name)}-${bpm}bpm.wav`,n*sd+2,()=>{for(let a=0;a<n;a++)sched(a,a*sd+.05,sd,(k,t,v)=>drum(k,t,v,kit))})};
  el.querySelector('#dprint').onclick=()=>printNotation(`${g.name} (${meter})`,el.querySelector('#charts').innerHTML);
  el.querySelectorAll('.cell').forEach(c=>c.onclick=()=>{const k=c.dataset.k,i=+c.dataset.i;const row=[...(pat.rows[k]||'.'.repeat(pat.steps))];row[i]=row[i]==='.'?'x':row[i]==='x'?'o':'.';pat.rows[k]=row.join('');c.classList.toggle('on',row[i]==='x');c.classList.toggle('gh',row[i]==='o');const ch=el.querySelector('#charts');if(ch)ch.innerHTML=charts();if(row[i]!=='.')hit(k,row[i]==='x'?1:.4)});
  el.querySelectorAll('[data-hit]').forEach(b=>b.onclick=()=>hit(b.dataset.hit));
  el.querySelectorAll('[data-rd]').forEach(b=>b.onclick=()=>playRudiment(RUDI.find(x=>x.id===b.dataset.rd)))};
 render()};

/* ---------- fill practice ---------- */
PAGES.fills=el=>{const base=GROOVES.filter(g=>g.steps===16&&!['funk'].includes(g.id));let gid='rock',bpm=80,lead=3,mode='you',len='any',fillId='surprise',kit=store.get('dkit','rock'),playing=false,ramp=false,stats=store.get('fillstats',{reps:0,clean:0,best:0});
 let cur=null,expect=[],hist=[],judgeT=null;
 const grooves=()=>[...base,...myGrooves().filter(x=>(x.meter||'4/4')==='4/4'&&x.steps===16)];
 const G=()=>grooves().find(x=>x.id===gid)||base[0];
 const pool=()=>FILLS[16].filter(f=>len==='any'||(len==='1'?f.from>=12:len==='2'?f.from===8:f.from===0));
 const pick=()=>{const p=pool();if(fillId==='surprise')return p[Math.floor(Math.random()*p.length)]||FILLS[16][0];return FILLS[16].find(f=>f.id===fillId)||p[0]};
 const phrase=()=>lead+1;
 const chartFor=f=>drumChart(rowsToItems(16,fillBarRows(G(),f)),16,4,4);
 const scoreHTML=()=>`<div class="fillstats"><span><b>${stats.reps}</b> fills played</span><span><b>${stats.clean}</b> clean landings</span><span><b>${stats.best||'–'}</b> best BPM landed clean</span></div>`;
 const render=()=>{const g=G();const p=pool();if(fillId!=='surprise'&&!p.find(f=>f.id===fillId))fillId='surprise';cur=cur||pick();
  el.innerHTML=`<span class="eyebrow">Drums</span><h1>Fill practice</h1><p>The hard part of a fill isn’t the fill, it’s getting out of it: landing the crash and kick exactly on beat 1 and dropping straight back into the groove. Here the band plays the groove, then leaves the fill bar to you.</p>
  <div class="panel"><div class="pickrow"><span class="eyebrow">Mode</span>${pillsHTML('mode',[['demo','Listen first'],['you','Your turn']],mode)}</div>
  <div class="pickrow"><span class="eyebrow">Groove</span>${pillsHTML('g',grooves().map(x=>[x.id,(x.id.startsWith('my-')?'★ ':'')+esc(x.name)]),gid,'select')}</div>
  <div class="pickrow"><span class="eyebrow">Fill</span>${pillsHTML('f',[['surprise','Surprise me'],...p.map(f=>[f.id,f.name])],fillId,'select')}</div>
  <details class="ged"><summary>More options</summary><div class="row" style="gap:18px;align-items:flex-end;flex-wrap:wrap"><div class="pickrow"><span class="eyebrow">Fill length</span>${pillsHTML('len',[['any','Any'],['1','1 beat'],['2','2 beats'],['bar','Whole bar']],len)}</div><div class="pickrow"><span class="eyebrow">Groove bars before the fill</span>${pillsHTML('lead',[['1','1'],['3','3'],['7','7']],String(lead))}</div></div>
  <div class="pickrow"><span class="eyebrow">Kit sound</span>${pillsHTML('kit',Object.entries(DKITS).map(([k,x])=>[k,x.name]),kit,'select')}</div><button class="pill" id="framp" aria-pressed="${ramp}">Speed up 4 BPM after each clean landing</button></details>
  <div class="fillnow"><div class="fillbar" id="fbar">${Array.from({length:phrase()},(_,i)=>`<span data-b="${i}" class="${i===lead?'fill':''}">${i===lead?'FILL':'Groove '+(i+1)}</span>`).join('')}</div></div>
  <h3 id="fname">${esc(cur.name)}</h3><div id="fchart">${chartFor(cur)}</div>
  <div class="row pctl"><button class="btn primary" id="fgo">${playing?'■ Stop':ICON.play+' Start'}</button><label class="tempo">Tempo <input type="range" id="fbpm" min="40" max="200" value="${bpm}"> <span id="fbv">${bpm}</span> BPM</label></div>
  <p class="hint">${mode==='you'?'In “Your turn” the drums drop out for the fill bar. The click keeps going: play the fill, then land the crash and kick on the next beat 1.':'The band plays the whole phrase, fill and all. Listen and count along, then switch to “Your turn”.'}</p>
  <div id="fres" class="fres" aria-live="polite">${LISTEN()?'Listening. Each fill gets a score.':IN_CLAUDE()?'Inside Claude the app can’t hear you. On the website version, plug in an e-kit (MIDI) or use the microphone to get each fill scored.':'Connect your e-kit or the microphone below to get each fill scored.'}</div>${scoreHTML()}
  ${inputPanelHTML()}</div>
  <div class="panel"><h3>How to practise fills</h3><div class="cols">
   <div class="mini"><h4>Count out loud</h4><p class="o">Say “1 2 3 4” through the groove bars so you always know where the fill starts.</p></div>
   <div class="mini"><h4>Start slow</h4><p class="o">Pick a tempo where you land the 1 every time. Turn on “Speed up” and let the app push you.</p></div>
   <div class="mini"><h4>Don’t rush</h4><p class="o">Most fills speed up by accident. If your landings are early, relax and let the fill breathe.</p></div>
   <div class="mini"><h4>Go round the kit</h4><p class="o">Learn each fill with your right hand leading, then try moving it to different drums.</p></div></div></div>`;
  bindPills(el,(gp,v)=>{if(gp==='mode')mode=v;else if(gp==='g')gid=v;else if(gp==='len'){len=v;cur=null}else if(gp==='lead')lead=+v;else if(gp==='f'){fillId=v;cur=null}else if(gp==='kit'){kit=v;store.set('dkit',v)}const was=playing;const op=el.querySelector('details.ged').open;stop();render();el.querySelector('details.ged').open=op;if(was){start();el.querySelector('#fgo').innerHTML='■ Stop'}});
  const ip=el.querySelector('.inpanel');if(ip)bindInputPanel(ip);
  el.querySelector('#fbpm').oninput=e=>{bpm=+e.target.value;el.querySelector('#fbv').textContent=bpm};
  el.querySelector('#framp').onclick=e=>{ramp=!ramp;e.target.setAttribute('aria-pressed',ramp)};
  el.querySelector('#fgo').onclick=()=>{if(playing){stop();render()}else{start();el.querySelector('#fgo').innerHTML='■ Stop'}}};
 const stop=()=>{stopLoop();playing=false;clearInterval(judgeT);expect=[]};
 const judgeFill=()=>{if(!AC||!expect.length)return;const now=AC.currentTime,lat=INPUT.lat||0;const done=expect.filter(e=>e.due+.25<now);if(!done.length)return;const ph=done[0].ph;const set=expect.filter(e=>e.ph===ph);if(set.some(e=>e.due+.25>=now))return;expect=expect.filter(e=>e.ph!==ph);
  if(!LISTEN())return;let ok=0,offs=[];set.filter(e=>!e.land).forEach(e=>{let bd=null;INPUT.onsets.forEach(t=>{const d=t-lat-e.t;if(Math.abs(d)<.12&&(bd==null||Math.abs(d)<Math.abs(bd)))bd=d});if(bd!=null&&Math.abs(bd)<.07){ok++;offs.push(bd)}});
  const L=set.find(e=>e.land);let ld=null;INPUT.onsets.forEach(t=>{const d=t-lat-L.t;if(Math.abs(d)<.15&&(ld==null||Math.abs(d)<Math.abs(ld)))ld=d});const landed=ld!=null&&Math.abs(ld)<.05;const n=set.length-1;const avg=offs.length?offs.reduce((a,b)=>a+b,0)/offs.length:0;
  stats.reps++;if(landed&&ok>=n*.8){stats.clean++;stats.best=Math.max(stats.best||0,bpm);if(ramp){bpm=Math.min(220,bpm+4);const r=el.querySelector('#fbpm');if(r){r.value=bpm;el.querySelector('#fbv').textContent=bpm}}}store.set('fillstats',stats);
  const msg=`${ok} of ${n} fill notes in time${offs.length?`, ${Math.abs(avg*1000)<8?'right on the beat':`${Math.round(Math.abs(avg)*1000)} ms ${avg<0?'early (rushing)':'late (dragging)'}`}`:''}. ${ld==null?'Didn’t hear the landing on 1.':landed?'Landed the 1!':`Landing was ${Math.round(Math.abs(ld)*1000)} ms ${ld<0?'early':'late'}.`}`;
  hist.unshift({msg,good:landed&&ok>=n*.8});hist=hist.slice(0,4);const r=el.querySelector('#fres');if(r)r.innerHTML=hist.map((h,i)=>`<div class="${h.good?'good':'warn'}${i?' old':''}">${esc(h.msg)}</div>`).join('');const st=el.querySelector('.fillstats');if(st)st.outerHTML=scoreHTML()};
 const start=()=>{audio();playing=true;cur=pick();const nm=el.querySelector('#fname');if(nm)nm.textContent=cur.name;const fc=el.querySelector('#fchart');if(fc)fc.innerHTML=chartFor(cur);
  startLoop(()=>({steps:16,rows:{},bpm}),{extra:(abs,t,sd)=>{const g=G();const P=phrase();const bar=Math.floor(abs/16),s=abs%16,pb=bar%P;
    const inFill=pb===lead;if(s%4===0)drum(s===0?'clickhi':'click',t,inFill?.55:.25);
    if(inFill&&mode==='you'){if(s>=cur.from)for(const k in cur.rows){if((cur.rows[k]||'')[s-cur.from]==='x'){expect.push({ph:bar,t,due:t});break}}if(s===15)expect.push({ph:bar,t:t+sd,due:t+sd,land:true});return}
    const h=drumStep(g,inFill?cur:null,P,abs);if(pb===0&&s===0&&bar>0){h.crash=1;h.kick=1;delete h.hat;delete h.ride;if(mode==='you'){delete h.crash;delete h.kick}}if(abs===0){h.crash=1;delete h.hat}for(const k in h)drum(k,t,h[k],kit)},
   onStep:(a)=>{const bar=Math.floor(a/16),s=a%16,P=phrase(),pb=bar%P;if(s)return;el.querySelectorAll('#fbar span').forEach(x=>x.classList.toggle('on',+x.dataset.b===pb));
    if(pb===0&&bar>0&&fillId==='surprise'){cur=pick();const nm=el.querySelector('#fname');if(nm)nm.textContent=cur.name;const fc=el.querySelector('#fchart');if(fc)fc.innerHTML=chartFor(cur)}}});
  clearInterval(judgeT);judgeT=setInterval(()=>{if(!document.body.contains(el)){clearInterval(judgeT);return}judgeFill()},150)};
 render()};

/* ---------- metronome, upgraded ---------- */
const MET_SOUNDS=[['click','Click'],['wood','Woodblock'],['hat','Hi-hat'],['cowbell','Cowbell']];
function metClick(snd,t,lvl){if(lvl<=0)return;const a=lvl>=2;if(snd==='click'){drum(a?'clickhi':'click',t,a?1:.7);return}
 if(snd==='wood'){osc(t,'sine',a?1750:1250,a?1700:1200,(a?.55:.4),.06);nz(t,'bandpass',a?2200:1700,a?.2:.12,.03,6);return}
 if(snd==='hat'){drum(a?'open':'hat',t,a?.7:.9);return}drum('cowbell',t,a?1.1:.7)}
TOOLPAGES.metronome=el=>{let bpm=store.get('metbpm',90),beats=4,unit=4,sub=1,snd=store.get('metsnd','click'),acc=[2,1,1,1],gap='off',ramp=false,rampBy=2,rampEvery=4,rampTo=Math.min(240,bpm+30),playing=false,taps=[],muteLog=[],gapRes=null;
 const GAPS=[['off','Off'],['1-1','1 bar on, 1 off'],['2-2','2 on, 2 off'],['4-4','4 on, 4 off'],['rand','Random bars off']];
 const fixAcc=()=>{while(acc.length<beats)acc.push(1);acc=acc.slice(0,beats);if(!acc.some(x=>x>0))acc[0]=2};
 const muted=bar=>{if(gap==='off')return false;if(gap==='rand'){const r=Math.sin(bar*12.9898+78.233)*43758.5453;return bar>1&&(r-Math.floor(r))<.3}const[on,off]=gap.split('-').map(Number);return bar%(on+off)>=on};
 const setB=v=>{bpm=Math.max(30,Math.min(260,Math.round(v)));store.set('metbpm',bpm);const b=el.querySelector('#mb'),r=el.querySelector('#mr');if(b)b.textContent=bpm;if(r)r.value=bpm};
 const render=()=>{fixAcc();el.innerHTML=`<p>Practise everything with a click: start slow enough to play cleanly, then raise the tempo a few beats per minute at a time.</p>
  <div class="panel met"><div class="row" style="justify-content:center;gap:16px"><button class="btn" id="mm" aria-label="Slower">−</button><div class="bpm"><b id="mb">${bpm}</b><span>${unit===8?'eighth notes per minute':'BPM'}</span></div><button class="btn" id="mp" aria-label="Faster">+</button></div>
  <input type="range" id="mr" min="30" max="260" value="${bpm}" aria-label="Tempo">
  <div class="beatdots edit">${acc.map((a,i)=>`<button data-b="${i}" class="${a===2?'one':a===0?'off':''}" aria-label="Beat ${i+1}: ${a===2?'accent':a===0?'silent':'normal'}"><span>${i+1}</span></button>`).join('')}</div>
  <p class="hint" style="text-align:center">Tap a beat to cycle it: accent, normal, silent.</p>
  <div class="row" style="justify-content:center"><button class="btn primary" id="go">${playing?'■ Stop':ICON.play+' Start'}</button><button class="btn" id="tap">Tap tempo</button><span class="hint" id="mstat" aria-live="polite"></span></div>
  <div class="row" style="gap:18px;flex-wrap:wrap;align-items:flex-end"><div class="pickrow"><span class="eyebrow">Beats per bar</span>${pillsHTML('beats',[1,2,3,4,5,6,7,8,9,10,11,12].map(n=>[String(n),String(n)]),String(beats))}</div><div class="pickrow"><span class="eyebrow">Beat is a</span>${pillsHTML('unit',[['4','Quarter (♩)'],['8','Eighth (♪)']],String(unit))}</div></div>
  <div class="pickrow"><span class="eyebrow">Clicks per beat</span>${pillsHTML('sub',[['1','None'],['2','Eighths'],['3','Triplets'],['4','Sixteenths']],String(sub))}</div>
  <div class="pickrow"><span class="eyebrow">Sound</span>${pillsHTML('snd',MET_SOUNDS,snd)}</div>
  <details class="ged"><summary>Gap click and speed trainer</summary>
   <div class="pickrow"><span class="eyebrow">Gap click</span>${pillsHTML('gap',GAPS,gap)}</div><p class="hint">The click goes silent for some bars. Keep counting and playing, and see if you’re still with it when it comes back.${LISTEN()?' The app is listening and will tell you how far you drifted in the silent bars.':''}</p>
   <div class="row" style="gap:12px;flex-wrap:wrap;align-items:center"><button class="pill" id="ramp" aria-pressed="${ramp}">Speed trainer</button><label class="tempo">Add <input type="number" id="rby" min="1" max="20" value="${rampBy}" style="width:56px"> BPM every <input type="number" id="rev" min="1" max="32" value="${rampEvery}" style="width:56px"> bars, up to <input type="number" id="rto" min="40" max="260" value="${rampTo}" style="width:64px"></label></div></details>
  <div id="gapres" class="hint"></div></div>
  <p class="hint">The accented click is beat 1. Space bar starts and stops the metronome while this page is open.</p>`;
  bindPills(el,(g,v)=>{if(g==='beats'){beats=+v;acc=[2,...Array(beats-1).fill(1)];if(unit===8&&beats%3===0&&beats>3)acc=acc.map((x,i)=>i===0?2:i%3===0?2:1)}else if(g==='unit'){unit=+v;if(unit===8&&beats%3===0&&beats>3)acc=acc.map((x,i)=>i===0?2:i%3===0?2:1)}else if(g==='sub')sub=+v;else if(g==='snd'){snd=v;store.set('metsnd',v);const c=audio();if(c){metClick(v,c.currentTime+.05,2);metClick(v,c.currentTime+.4,1)}return}else if(g==='gap')gap=v;restart()});
  el.querySelectorAll('.beatdots button').forEach(b=>b.onclick=()=>{const i=+b.dataset.b;acc[i]=acc[i]===2?1:acc[i]===1?0:2;restart()});
  el.querySelector('#mm').onclick=()=>setB(bpm-1);el.querySelector('#mp').onclick=()=>setB(bpm+1);el.querySelector('#mr').oninput=e=>setB(+e.target.value);
  el.querySelector('#tap').onclick=()=>{const now=performance.now();taps=taps.filter(x=>now-x<2500);taps.push(now);if(taps.length>=2){const iv=(taps[taps.length-1]-taps[0])/(taps.length-1);setB(60000/iv)}};
  el.querySelector('#ramp').onclick=e=>{ramp=!ramp;e.target.setAttribute('aria-pressed',ramp)};
  el.querySelector('#rby').onchange=e=>rampBy=Math.max(1,+e.target.value||2);el.querySelector('#rev').onchange=e=>rampEvery=Math.max(1,+e.target.value||4);el.querySelector('#rto').onchange=e=>rampTo=Math.max(40,+e.target.value||bpm);
  el.querySelector('#go').onclick=toggle};
 const restart=()=>{const was=playing;if(was){stopLoop();playing=false}const open=el.querySelector('details.ged')&&el.querySelector('details.ged').open;render();if(open)el.querySelector('details.ged').open=true;if(was)toggle()};
 const checkGap=()=>{if(!LISTEN()||!muteLog.length||!AC)return;const lat=INPUT.lat||0;const ds=[];muteLog.forEach(t=>{let bd=null;INPUT.onsets.forEach(o=>{const d=o-lat-t;if(Math.abs(d)<.2&&(bd==null||Math.abs(d)<Math.abs(bd)))bd=d});if(bd!=null)ds.push(bd)});muteLog=[];
  const r=el.querySelector('#gapres');if(!r)return;if(!ds.length){r.textContent='In the silent bars I didn’t hear you play on the beats.';return}const avg=ds.reduce((a,b)=>a+b,0)/ds.length;const ms=Math.round(Math.abs(avg)*1000);r.textContent=`Silent bars: you played ${ds.length} beats, ${ms<10?'right on time':`${ms} ms ${avg<0?'early (rushing)':'late (dragging)'} on average`}.`;r.className=ms<25?'good':'warn'};
 const toggle=()=>{if(playing){stopLoop();playing=false;checkGap();const g=el.querySelector('#go');if(g)g.innerHTML=ICON.play+' Start';const st=el.querySelector('#mstat');if(st)st.textContent='';return}playing=true;muteLog=[];el.querySelector('#go').innerHTML='■ Stop';let lastMuted=false;
  startLoop(()=>({steps:beats*sub,per:sub,rows:{},bpm}),{extra:(abs,t)=>{const steps=beats*sub,s=abs%steps,bar=Math.floor(abs/steps);
    if(s===0&&ramp&&bar>0&&bar%rampEvery===0&&bpm<rampTo){setTimeout(()=>setB(Math.min(rampTo,bpm+rampBy)),0)}
    const m=muted(bar);if(s===0){if(lastMuted&&!m)setTimeout(checkGap,300);lastMuted=m}
    if(m){if(s%sub===0)muteLog.push(t);return}
    if(s%sub===0)metClick(snd,t,acc[s/sub]);else if(acc[Math.floor(s/sub)]>0){if(snd==='hat')drum('hat',t,.45);else drum('click',t,.3)}},
   onStep:(a)=>{const steps=beats*sub,s=a%steps,bar=Math.floor(a/steps);if(s%sub)return;const b=s/sub;el.querySelectorAll('.beatdots button').forEach(x=>x.classList.toggle('cur',+x.dataset.b===b));const st=el.querySelector('#mstat');if(st&&s===0)st.textContent=muted(bar)?'Silent bar: keep counting':ramp?`${bpm} BPM`:''}})};
 document.onkeydown=e=>{if(e.key===' '&&location.hash==='#tools-metronome'&&!e.target.matches('input,textarea,button,select')){e.preventDefault();toggle()}};
 render()};

/* ---------- sight-reading drills ---------- */
const SR_RHY={1:[[4],[4],[2,2],['r4']],2:[[4],[2,2],[2,2],[1,1,2],[2,1,1],[3,1],['r2',2],[1,1,1,1]],3:[[1,1,2],[2,1,1],[1,1,1,1],[1,2,1],['r1',1,2],[3,1],['r2',1,1],[2,2]]};
function srRhythm(level,bars){const out=[];for(let b=0;b<bars;b++)for(let bt=0;bt<4;bt++){if(level>=2&&bt%2===0&&Math.random()<.15&&!(b===bars-1&&bt===2)){out.push({st:b*16+bt*4,dur:8});bt++;continue}const cell=SR_RHY[level][Math.floor(Math.random()*SR_RHY[level].length)];let o=b*16+bt*4;cell.forEach(x=>{if(typeof x==='string'){o+=+x.slice(1);return}out.push({st:o,dur:x});o+=x})}
 const last=out[out.length-1];if(last){last.dur=bars*16-last.st}return out}
function srPool(inst,level){if(inst==='piano')return level===1?[60,62,64,65,67]:level===2?[60,62,64,65,67,69,71,72]:[57,59,60,62,64,65,67,69,71,72,74,76,77];
 const S=inst==='bass'?STR4:STR;if(level===1)return S.slice();const major=new Set([0,2,4,5,7,9,11]);if(level===2){const o=[];S.forEach(x=>{for(let f=0;f<=3;f++)if(major.has((x+f)%12))o.push(x+f)});return[...new Set(o)].sort((a,b)=>a-b)}
 const pent=new Set([9,0,2,4,7]);const o=[];S.forEach(x=>{for(let f=5;f<=8;f++)if(pent.has((x+f)%12))o.push(x+f)});return[...new Set(o)].sort((a,b)=>a-b)}
function srPitched(inst,level,bars){const S=inst==='bass'?STR4:STR;const pool=srPool(inst,level);const rh=srRhythm(level,bars);let i=Math.floor(pool.length/2);
 const items=rh.map(r=>{const step=level===1?Math.floor(Math.random()*pool.length)-i:[-2,-1,-1,1,1,2,0][Math.floor(Math.random()*7)];i=Math.max(0,Math.min(pool.length-1,i+step));const m=pool[i];return{...r,m,name:SHARPN[m%12]}});
 if(inst!=='piano'){const lo=level===3?5:0,hi=level===3?8:4;items.forEach(it=>{let best=null;S.forEach((o,si)=>{const f=it.m-o;if(f>=(level===1?0:lo)&&f<=(level===1?0:hi)&&(best==null||si>best.s))best={s:si,f}});if(!best)S.forEach((o,si)=>{const f=it.m-o;if(f>=0&&f<=12&&(best==null||f<best.f))best={s:si,f}});it.pos=best;it.mk=''})}
 const lines=[];items.forEach((it,i)=>{const L=Math.floor(it.st/32);(lines[L]=lines[L]||[]).push(i)});return{items,steps:bars*16,per:4,beats:4,view:inst==='piano'?'staff':'tab',S,title:'Sight-reading',inst,bpm:[0,70,80,90][level],lines:lines.filter(Boolean)}}
function srDrums(level,bars){const N=bars*16;const rows={hat:'',snare:'',kick:'',tom1:'',tom2:'',open:'',crash:''};const set=(k,i,ch='x')=>{const a=rows[k].padEnd(N,'.').split('');a[i]=ch;rows[k]=a.join('')};Object.keys(rows).forEach(k=>rows[k]='.'.repeat(N));
 for(let b=0;b<bars;b++){const o=b*16;for(let s=0;s<16;s+=2)set('hat',o+s);set('snare',o+4);set('snare',o+12);set('kick',o);
  if(level===1){if(Math.random()<.6)set('kick',o+8);if(Math.random()<.3)set('kick',o+10)}
  else if(level===2){[6,8,10,14].forEach(s=>{if(Math.random()<.4)set('kick',o+s)});if(Math.random()<.3){set('hat',o+14,'.');set('open',o+14)}}
  else{[3,6,7,8,10,11,14,15].forEach(s=>{if(Math.random()<.3)set('kick',o+s)});[2,7,9,15].forEach(s=>{if(Math.random()<.3&&rows.kick[o+s]!=='x')set('snare',o+s,'o')});
   if(b===bars-1){for(let s=12;s<16;s++){set('hat',o+s,'.');set(s<14?'tom1':'tom2',o+s)}}}}
 if(bars>1)set('crash',0),set('hat',0,'.');for(const k in rows)if(!rows[k].includes('x')&&!rows[k].includes('o'))delete rows[k];
 const items=[];for(let s=0;s<N;s++){const hits={};for(const k in rows){const ch=rows[k][s];if(ch==='x')hits[k]=1;else if(ch==='o')hits[k]=.35}if(Object.keys(hits).length)items.push({st:s,dur:1,hits,cell:s})}const last=items[items.length-1];last.dur=N-last.st;
 return{items,steps:N,per:4,beats:4,view:'grid',groove:{steps:N,rows,per:4},S:STR,title:'Sight-reading',inst:'drums',bpm:[0,70,80,90][level]}}
TOOLPAGES.read=el=>{const inst=INST();let level=Math.min(3,LEVEL()+1),bars=4,n=0;
 const make=()=>inst==='drums'?srDrums(level,bars):srPitched(inst,level,bars);
 const render=()=>{n++;el.innerHTML=`<p>Sight-reading is playing music you’ve never seen before, at tempo, without stopping. A few minutes a day makes every new song easier to learn. Read one bar ahead of where you’re playing, and keep going even if you miss a note.</p>
  <div class="panel"><div class="row" style="gap:18px;flex-wrap:wrap;align-items:flex-end"><div class="pickrow"><span class="eyebrow">Level</span>${pillsHTML('lv',[['1','1: Simple'],['2','2: Moving'],['3','3: Tricky']],String(level))}</div><div class="pickrow"><span class="eyebrow">Length</span>${pillsHTML('bars',[['2','2 bars'],['4','4 bars'],['8','8 bars']],String(bars))}</div><button class="btn primary" id="srnew">New exercise</button></div>
  <p class="hint">${inst==='drums'?['','Hi-hat eighths with kick and snare on the beats.','Kick variations and open hi-hats.','Sixteenth kicks, ghost notes and a fill.'][level]:inst==='piano'?['','Five notes, C to G, in quarters and eighths.','The C major scale with sixteenths.','A wider range, dotted rhythms and rests.'][level]:['','Open strings only.','First position, notes of C major.','The A minor pentatonic box at the 5th fret, with sixteenths.'][level]}</p>
  <div id="srp" class="stack"></div></div>`;
  bindPills(el,(g,v)=>{if(g==='lv')level=+v;else bars=+v;render()});el.querySelector('#srnew').onclick=render;
  mountPlayer(el.querySelector('#srp'),make(),{tabOrStaff:inst!=='drums'})};
 render()};

/* ---------- find the note ---------- */
TOOLPAGES.findnote=el=>{const inst=INST();const fretted=inst==='guitar'||inst==='bass';const S=inst==='bass'?BSTR():GSTR();let mode=fretted?'string':'any',set='natural',round=0,ROUNDS=10,target=null,t0=0,times=[],misses=0,active=false;
 const best=store.get('notegame',{});const bk=()=>inst+':'+mode+':'+set;
 const NAT=['C','D','E','F','G','A','B'],ALL=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
 const newTarget=()=>{const pool=set==='natural'?NAT:ALL;let nm;do nm=pool[Math.floor(Math.random()*pool.length)];while(target&&nm===target.name&&pool.length>1);const s=fretted&&mode==='string'?Math.floor(Math.random()*S.length):null;target={name:nm,pc:parse(nm).pc,s};t0=performance.now()};
 const boardHTML=()=>fretted?fretboard({strings:S,all:true,frets:12}):keyboard({start:48,end:72});
 const prompt=()=>!target?'':`<b class="fntarget">${pr(target.name)}</b>${target.s!=null?` <span>on the ${SHARPN[S[target.s]%12]} string</span>`:''}`;
 const finish=()=>{active=false;const avg=times.reduce((a,b)=>a+b,0)/times.length;const prev=best[bk()];const isBest=!prev||avg<prev;if(isBest){best[bk()]=avg;store.set('notegame',best)}
  el.querySelector('#fnp').innerHTML=`<b>Done!</b> Average ${(avg/1000).toFixed(2)} s per note, ${misses} wrong ${misses===1?'guess':'guesses'}. ${isBest?'That’s your best time.':`Your best is ${(prev/1000).toFixed(2)} s.`}`;el.querySelector('#fngo').textContent='Play again'};
 const hitNote=(midi,si)=>{if(!active||!target)return false;const ok=((midi%12)+12)%12===target.pc&&(target.s==null||si==null||si===target.s);if(!ok){misses++;return false}times.push(performance.now()-t0);round++;if(round>=ROUNDS){finish();return true}newTarget();el.querySelector('#fnp').innerHTML=prompt();el.querySelector('#fnr').textContent=`Note ${round+1} of ${ROUNDS}`;return true};
 const render=()=>{el.innerHTML=`<p>Learn where every note lives. The app names a note, and you find it as fast as you can${LISTEN()?' by playing it on your instrument':' by clicking it'}. Ten notes per round.</p>
  <div class="panel"><div class="row" style="gap:18px;flex-wrap:wrap;align-items:flex-end">${fretted?`<div class="pickrow"><span class="eyebrow">Find it</span>${pillsHTML('mode',[['string','On a given string'],['any','Anywhere']],mode)}</div>`:''}<div class="pickrow"><span class="eyebrow">Notes</span>${pillsHTML('set',[['natural','Natural notes'],['all','All 12 notes']],set)}</div><button class="btn primary" id="fngo">Start</button></div>
  <div class="fnbox"><div id="fnp" class="fnprompt">${best[bk()]?`Best average: ${(best[bk()]/1000).toFixed(2)} s per note`:'Press Start.'}</div><span class="hint" id="fnr"></span></div>
  <div id="fnb">${boardHTML()}</div><p class="hint">${IN_CLAUDE()?'Click the note on the '+(fretted?'fretboard':'keyboard')+'. On the website version you can play it on your instrument instead.':LISTEN()?'Play the note, or click it.':'Click the note, or connect your instrument below and play it.'}</p>${inputPanelHTML()}</div>`;
  bindPills(el,(g,v)=>{if(g==='mode')mode=v;else set=v;active=false;render()});const ip=el.querySelector('.inpanel');if(ip)bindInputPanel(ip);
  el.querySelector('#fngo').onclick=()=>{round=0;times=[];misses=0;active=true;target=null;newTarget();el.querySelector('#fnp').innerHTML=prompt();el.querySelector('#fnr').textContent=`Note 1 of ${ROUNDS}`;el.querySelector('#fngo').textContent='Restart'};
  el.querySelector('#fnb').onclick=e=>{const g=e.target.closest('[data-midi]');if(!g||!active)return;const m=+g.dataset.midi,si=g.dataset.s!=null?+g.dataset.s:null;const ok=hitNote(m,si);g.classList.add(ok?'okflash':'badflash');setTimeout(()=>g.classList.remove('okflash','badflash'),350);const c=audio();if(c)tone(m,c.currentTime+.02,.6,.3,TIMBRE())}};
 let lastHeard=-1;const hear=()=>{if(!document.body.contains(el)){INPUT.listeners.delete(hear);return}if(!active||INPUT.midi==null){lastHeard=-1;return}if(INPUT.midi===lastHeard)return;lastHeard=INPUT.midi;hitNote(INPUT.midi,null)};INPUT.listeners.add(hear);
 render()};

/* ---------- practice session builder ---------- */
let SESSION=store.get('session',null);let SESS_T=null;
function sessionBlocks(mins){const inst=INST(),pitched=inst!=='drums';const due=srsDue().length;const seq=planSeq();const done=store.get('planDone',{});const next=seq.find(s=>!done[s.id])||seq[0];
 const lesson=next?{name:'Lesson: '+next.t,href:next.href||'#learn-'+next.learn,what:next.task||'Read the lesson and try it on your instrument.'}:{name:'Lesson',href:'#learn-'+INST_PRI[INST_RAW()][0],what:'Work through the lesson.'};
 const drill=inst==='drums'?{name:'Fill practice',href:'#learn-fills',what:'Play the fill bar yourself and land the 1.'}:{name:'Find the note',href:'#tools-findnote',what:'Two rounds. Try to beat your best time.'};
 const read={name:'Sight-reading',href:'#tools-read',what:'Two or three new exercises at your level.'};
 const warm={name:'Warm-up',href:'#warmup',what:'Loosen up with the speed trainer on.'};const rev={name:'Review',href:'#review',what:due?`${due} item${due>1?'s':''} due for review.`:'Revisit a lick or song you learned this week.'};
 const jam={name:'Jam along',href:'#tools-jam',what:pitched?'Solo or play chords over the band.':'Play along with the band, then turn its drums off and play them yourself.'};const songs={name:'Songs',href:'#songs',what:'Play through a technique study with the metronome.'};
 const B=mins===15?[[warm,3],[lesson,5],[drill,4],[jam,3]]:mins===30?[[warm,5],[due?rev:read,5],[lesson,8],[drill,6],[jam,6]]:[[warm,10],[rev,8],[lesson,15],[read,7],[drill,8],[songs,7],[jam,5]];
 return B.map(([b,m])=>({...b,mins:m}))}
function sessBar(){let bar=document.getElementById('sessbar');document.body.classList.toggle('has-sess',!!SESSION);if(!SESSION){if(bar)bar.remove();clearInterval(SESS_T);SESS_T=null;return}
 if(!bar){bar=document.createElement('div');bar.id='sessbar';bar.className='sessbar';bar.setAttribute('role','region');bar.setAttribute('aria-label','Practice session');document.body.appendChild(bar)}
 const b=SESSION.blocks[SESSION.i];const left=Math.max(0,Math.round((SESSION.end-Date.now())/1000));const over=left<=0;
 bar.innerHTML=`<div class="sbinfo"><span class="hint">Block ${SESSION.i+1} of ${SESSION.blocks.length}</span><b>${esc(b.name)}</b></div><b class="sbtime ${over?'over':''}">${over?'Time!':`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`}</b><a class="btn small" href="${b.href}">Open</a><button class="btn small primary" id="sbnext">${SESSION.i+1<SESSION.blocks.length?'Next':'Finish'}</button><button class="btn small" id="sbend" aria-label="End session">✕</button>`;
 bar.querySelector('#sbnext').onclick=()=>sessNext();bar.querySelector('#sbend').onclick=()=>{SESSION=null;store.set('session',null);sessBar();toast('Session ended.')}}
function sessNext(){if(!SESSION)return;SESSION.i++;if(SESSION.i>=SESSION.blocks.length){const n=(store.get('sessionsDone',0)||0)+1;store.set('sessionsDone',n);SESSION=null;store.set('session',null);sessBar();toast(`Session complete. That’s ${n} session${n>1?'s':''} so far.`);location.hash='#progress';return}
 const b=SESSION.blocks[SESSION.i];SESSION.end=Date.now()+b.mins*60000;SESSION.rang=false;store.set('session',SESSION);location.hash=b.href;sessBar()}
function sessStart(blocks){SESSION={blocks,i:0,end:Date.now()+blocks[0].mins*60000,rang:false};store.set('session',SESSION);location.hash=blocks[0].href;sessTick();clearInterval(SESS_T);SESS_T=setInterval(sessTick,1000)}
function sessTick(){if(!SESSION){sessBar();return}if(Date.now()>=SESSION.end&&!SESSION.rang){SESSION.rang=true;store.set('session',SESSION);const c=audio();if(c){drum('bell',c.currentTime+.05,1);drum('bell',c.currentTime+.35,.8)}toast(`Time’s up for ${SESSION.blocks[SESSION.i].name}. Press Next when you’re ready.`)}sessBar()}
function viewSession(){let mins=store.get('sessMins',30);
 const render=()=>{const blocks=sessionBlocks(mins);main.innerHTML=`<div class="pagehead"><div class="stack" style="gap:6px"><span class="eyebrow">Today</span><h1>Practice session</h1><p class="lede">Pick how long you have and the app plans a balanced session: warm up, learn something new, drill a skill, then have fun with it. A timer at the bottom of the screen walks you through each part.</p></div></div>
  <div class="stack"><div class="pickrow"><span class="eyebrow">How long?</span>${pillsHTML('mins',[['15','15 minutes'],['30','30 minutes'],['60','1 hour']],String(mins))}</div>
  <section class="panel"><ol class="sesslist">${blocks.map(b=>`<li><b>${b.mins} min</b><div><span>${esc(b.name)}</span><span class="hint">${esc(b.what)}</span></div></li>`).join('')}</ol>
  <div class="row"><button class="btn primary" id="sgo">${SESSION?'Restart the session':'Start the session'}</button>${SESSION?`<span class="hint">A session is running: ${esc(SESSION.blocks[SESSION.i].name)}.</span>`:''}</div></section>
  <p class="hint">Sessions completed: ${store.get('sessionsDone',0)||0}</p></div>`;
  bindPills(main,(g,v)=>{mins=+v;store.set('sessMins',mins);render()});main.querySelector('#sgo').onclick=()=>sessStart(blocks)};
 render()}
if(SESSION){if(!SESSION.blocks||!SESSION.blocks.length||Date.now()-SESSION.end>3*3600*1000){SESSION=null;store.set('session',null)}else{SESS_T=setInterval(sessTick,1000);setTimeout(sessBar,0)}}

/* ---------- print and MIDI for every player ---------- */
{const _mp=mountPlayer;mountPlayer=function(host,ex,opts){_mp(host,ex,opts);if(host._exp)host._exp.remove();const bar=document.createElement('div');bar.className='row pexp';
 bar.innerHTML=`<button class="lnk" data-x="fs">Full screen</button><button class="lnk" data-x="print">Print</button><button class="lnk" data-x="midi">MIDI file</button>`;host.after(bar);host._exp=bar;bar.querySelector('[data-x=fs]').onclick=()=>focusOn(host);
 bar.querySelector('[data-x=print]').onclick=()=>{const n=host.querySelector('.pnot');printNotation(ex.title||'Exercise',n?n.innerHTML:'')};
 bar.querySelector('[data-x=midi]').onclick=()=>{const bpm=ex.bpm||90;const sd=60/bpm/ex.per;const sink=midiSink();const tb=ex.inst==='bass'?'bass':ex.inst==='piano'?'piano':'guitar';
  ex.items.forEach(it=>{const t=it.st*sd,d=it.dur*sd*.95;if(it.hits)for(const k in it.hits)sink.drum(k,t,it.hits[k]);else if(it.chord)it.chord.forEach(m=>sink.tone(m,t,d,.2,tb));else if(it.m!=null)sink.tone(it.m,t,d,.3,tb)});
  saveFile(fileSlug(ex.title||'exercise')+'.mid',midiFile({bpm:ex.den===8?bpm/2:bpm,num:ex.beats||4,den:ex.den||4,tracks:sink.tracks()}))}}}

