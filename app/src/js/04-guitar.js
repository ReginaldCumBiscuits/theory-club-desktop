/* ================= guitar ================= */
const STR=[40,45,50,55,59,64];
const OPEN={'C|maj':[null,3,2,0,1,0],'A|maj':[null,0,2,2,2,0],'G|maj':[3,2,0,0,0,3],'E|maj':[0,2,2,1,0,0],'D|maj':[null,null,0,2,3,2],
 'A|min':[null,0,2,2,1,0],'E|min':[0,2,2,0,0,0],'D|min':[null,null,0,2,3,1],
 'E|7':[0,2,0,1,0,0],'A|7':[null,0,2,0,2,0],'D|7':[null,null,0,2,1,2],'G|7':[3,2,0,0,0,1],'C|7':[null,3,2,3,1,0],'B|7':[null,2,1,2,0,2],
 'A|m7':[null,0,2,0,1,0],'E|m7':[0,2,0,0,0,0],'D|m7':[null,null,0,2,1,1],
 'C|maj7':[null,3,2,0,0,0],'F|maj7':[null,null,3,2,1,0],'A|maj7':[null,0,2,1,2,0],'D|maj7':[null,null,0,2,2,2],
 'A|sus2':[null,0,2,2,0,0],'A|sus4':[null,0,2,2,3,0],'D|sus2':[null,null,0,2,3,0],'D|sus4':[null,null,0,2,3,3],'E|sus4':[0,2,2,2,0,0]};
const EFORM={maj:[0,2,2,1,0,0],min:[0,2,2,0,0,0],'7':[0,2,0,1,0,0],m7:[0,2,0,0,0,0],maj7:[0,null,1,1,0,null],sus4:[0,2,2,2,0,0],'13':[0,null,0,1,2,null]};
const AFORM={maj:[null,0,2,2,2,0],min:[null,0,2,2,1,0],'7':[null,0,2,0,2,0],m7:[null,0,2,0,1,0],maj7:[null,0,2,1,2,0],sus2:[null,0,2,2,0,0],sus4:[null,0,2,2,3,0],'7sus4':[null,0,2,0,3,0],dim:[null,0,1,2,1,null],aug:[null,0,-1,-2,-2,null],dim7:[null,0,1,-1,1,null],m7b5:[null,0,1,0,1,null],mMaj7:[null,0,2,1,1,0],'9':[null,0,-1,0,0,null],'7b9':[null,0,-1,0,-1,null],'7#9':[null,0,-1,0,1,null],'7#5':[null,0,null,0,2,1]};
function mov(off,r,kind){let fr=off.map(o=>o==null?null:o+r);if(fr.some(f=>f!=null&&f<0)){fr=fr.map(f=>f==null?null:f+12);r+=12}const mx=Math.max(...fr.filter(f=>f!=null));const zeros=off.filter(o=>o===0).length;return{frets:fr,barre:r>0&&zeros>=2&&off.every(o=>o==null||o>=0)?r:null,kind,score:mx}}
function guitarShape(root,t){const k=root+'|'+t;if(OPEN[k])return{frets:OPEN[k],barre:null,kind:'Open shape',score:0};const pc=parse(root).pc;const c=[];if(EFORM[t])c.push(mov(EFORM[t],(pc-4+12)%12,'E-shape, root on the 6th string'));if(AFORM[t])c.push(mov(AFORM[t],(pc-9+12)%12,'A-shape, root on the 5th string'));if(!c.length)return null;c.sort((a,b)=>a.score-b.score);return c[0]}
const shapeMidis=fr=>fr.map((f,i)=>f==null?null:STR[i]+f+CAPO()).filter(x=>x!=null);
const STR4=[28,33,38,43];
const PROD=new Set(['ableton','logic','midi']);const INST_RAW=()=>store.get('inst','guitar');const INST=()=>{const r=INST_RAW();return PROD.has(r)||r==='voice'?'piano':r};
const LEVEL=()=>store.get('level',0);
const TIMBRE=()=>({piano:'piano',bass:'bass'}[INST()]||'guitar');
const INST_NAME={guitar:'Guitar',bass:'Bass',piano:'Piano',drums:'Drums',ableton:'Ableton Live',logic:'Logic Pro',midi:'MIDI'};
const TUNINGS={standard:{name:'Standard',g:[40,45,50,55,59,64],b:[28,33,38,43]},dropd:{name:'Drop D',g:[38,45,50,55,59,64],b:[26,33,38,43]},halfdown:{name:'Half step down',g:[39,44,49,54,58,63],b:[27,32,37,42]}};
const TUNE=()=>TUNINGS[store.get('tuning','standard')]||TUNINGS.standard;
const GSTR=()=>TUNE().g, BSTR=()=>TUNE().b;
const LEFTY=()=>!!store.get('lefty',false);
const CAPO=()=>+store.get('capo',0)||0;
const VOL=()=>{const v=store.get('vol',.85);return typeof v==='number'?v:.85};
const MUTED=()=>!!store.get('muted',false);
function applyVol(){if(MASTER)MASTER.gain.value=MUTED()?0:VOL()}
const bassRootMidi=root=>28+((parse(root).pc-4+12)%12);



