/* ================= drums ================= */
let NOISE=null;
function noise(){if(NOISE)return NOISE;const c=AC,b=c.createBuffer(1,c.sampleRate*1.5,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return NOISE=b}
function env(g,t,peak,dec){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+.003);g.gain.exponentialRampToValueAtTime(0.0001,t+dec)}
function nz(t,type,freq,peak,dec,q=0.7){const c=AC,s=c.createBufferSource();s.buffer=noise();const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=c.createGain();env(g,t,peak,dec);s.connect(f).connect(g).connect(MASTER);s.start(t);s.stop(t+dec+.05)}
function osc(t,type,f0,f1,peak,dec){const c=AC,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dec*.6);env(g,t,peak,dec);o.connect(g).connect(MASTER);o.start(t);o.stop(t+dec+.05)}
/* ---------- recorded samples: FluidR3 GM (CC BY 3.0) for piano, tonejs-instruments (CC BY 3.0) for bass, MusyngKite (CC BY-SA 3.0) for guitar; VCSL (CC0) for drums ---------- */
const SMPDATA=(()=>{const C={};const get=k=>{if(k in C)return C[k];let v;try{const el=document.getElementById('tc-smp-'+k);v=el?JSON.parse(el.textContent):undefined}catch(e){v=undefined}if(v!==undefined)C[k]=v;return v};return new Proxy({},{get:(t,k)=>typeof k==='string'?get(k):undefined,has:(t,k)=>!!get(k)})})();
const SMP={},SMPP={};let SND=store.get('snd','samples');
function b64ab(s){const bin=atob(s);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer}
function prepS(buf){const d=buf.getChannelData(0);let mx=0;for(let ch=0;ch<buf.numberOfChannels;ch++){const x=buf.getChannelData(ch);for(let i=0;i<x.length;i++){const a=Math.abs(x[i]);if(a>mx)mx=a}}let on=0;for(let i=0;i<d.length;i++){if(Math.abs(d[i])>mx*.1){on=i;break}}return{buf,peak:mx||1,off:Math.max(0,on/buf.sampleRate-.0015)}}
function loadSamples(kind){if(!AC||!SMPDATA[kind])return null;if(SMPP[kind])return SMPP[kind];SMP[kind]={};
 SMPP[kind]=Promise.all(Object.entries(SMPDATA[kind]).map(([k,b])=>new Promise(res=>{try{AC.decodeAudioData(b64ab(b),buf=>{SMP[kind][k]=prepS(buf);res()},()=>res())}catch(e){res()}}))).then(()=>{SMP[kind].ready=Object.keys(SMP[kind]).length>0});return SMPP[kind]}
const DRUM_LVL={kick:.95,snare:.8,rim:.5,hat:.36,open:.4,crash:.45,ride:.34,tom1:.72,tom2:.78};
/* tuning offsets of the recorded guitar notes, in cents, measured so chords ring in tune */
const SMP_CENTS={bass:{"28":6,"31":-4,"34":0,"37":0,"40":-1,"43":-2,"46":0,"49":0,"52":-2,"55":0,"58":0,"61":-2,"64":-2,"67":0},guitar:{"40":-10,"42":-16,"44":-9,"46":-16,"48":-8,"50":-10,"52":-13,"54":-13,"56":-8,"58":3,"60":-3,"62":-4,"64":-6,"66":-2,"68":-4,"70":5,"72":-4,"74":-3,"76":4,"78":6,"80":7,"82":1,"84":-2,"86":-2,"88":-2}};
function playSample(s,t,gain,rate,dest,maxEnd,fx){const c=AC;const src=c.createBufferSource();src.buffer=s.buf;src.playbackRate.value=rate;const g=c.createGain();const natural=t+(s.buf.duration-s.off)/rate;const end=Math.min(natural,maxEnd==null?natural:maxEnd);
 if(fx&&fx.soft){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(gain,t+.012)}else g.gain.setValueAtTime(gain,t);if(end<natural-.01){g.gain.setValueAtTime(gain,Math.max(t+.02,end-.08));g.gain.linearRampToValueAtTime(.0001,end)}if(fx)pitchFx(src,t,end,fx);src.connect(g).connect(slapOut(g,fx,dest));src.start(t,s.off);src.stop(end+.02)}
/* ---------- v35: playing technique marks (bends, vibrato, slides, legato) ---------- */
/* fx = {from: semitones to slide in from, pre: pre-bend, bend: semitones, release, vib, out: semitones to slide off, soft: legato attack} */
function pitchFx(src,t,end,fx){const p=src.detune;if(!p||!fx)return;const len=Math.max(.06,end-t);let base=0,tt=t;
 try{
 if(fx.from){p.setValueAtTime(fx.from*100,t);const g=Math.min(.09,len*.35);p.linearRampToValueAtTime(0,t+g);tt=t+g}
 else if(fx.pre){base=fx.pre*100;p.setValueAtTime(base,t)}else p.setValueAtTime(0,t);
 if(fx.bend&&!fx.pre){const s0=tt+Math.min(.035,len*.08),up=Math.min(.22,len*.38),n=24,a=new Float32Array(n),to=fx.bend*100;for(let i=0;i<n;i++){const x=i/(n-1);a[i]=base+(to-base)*(1-Math.pow(1-x,2.2))}p.setValueAtTime(base,s0);p.setValueCurveAtTime(a,s0,up);base=to;tt=s0+up+.001}
 if(fx.release){const rs=Math.max(tt+.03,t+len*.5),rl=Math.min(.2,Math.max(.06,len*.3));if(rs+rl<end){p.setValueAtTime(base,rs);p.linearRampToValueAtTime(0,rs+rl);base=0;tt=rs+rl+.001}}
 if(fx.vib){const vs=Math.max(tt+.01,t+Math.min(.16,len*.22)),vl=end-vs;if(vl>.12){const rate=fx.vibRate||5.6,depth=fx.vibDepth||(fx.bend?28:38),n=Math.max(8,Math.ceil(vl*240)),a=new Float32Array(n);
   for(let i=0;i<n;i++){const tau=i/(n-1)*vl;const ramp=Math.min(1,tau/.18);a[i]=base+(fx.bend?-1:1)*depth*ramp*(.5-.5*Math.cos(2*Math.PI*rate*tau))}p.setValueAtTime(base,vs);p.setValueCurveAtTime(a,vs,vl*.999);tt=end}}
 if(fx.out&&tt<end-.05){const os=Math.max(tt+.01,t+len*.55);p.setValueAtTime(base,os);p.linearRampToValueAtTime(base+fx.out*100,end)}
 }catch(e){}}
/* slap (S) and pop (P) marks: scooped mids and a bright top, a little louder */
function slapOut(g,fx,dest){if(!fx||!(fx.slap||fx.pop))return dest;const c=AC;const hs=c.createBiquadFilter();hs.type='highshelf';hs.frequency.value=fx.pop?1700:1100;hs.gain.value=fx.pop?13:9;const sc=c.createBiquadFilter();sc.type='peaking';sc.frequency.value=600;sc.Q.value=.9;sc.gain.value=-5;const pk=c.createBiquadFilter();pk.type='peaking';pk.frequency.value=fx.pop?3200:2400;pk.Q.value=1.4;pk.gain.value=6;const v=c.createGain();v.gain.value=fx.pop?1.25:1.35;hs.connect(sc);sc.connect(pk);pk.connect(v);v.connect(dest);return hs}

/* the marks on a tab item, turned into sound */
function itemFx(it,prev){const toks=(it.mk||'').split(/\s+/).filter(Boolean);const has=k=>toks.includes(k);const fx={};let any=false;
 const amt=it.bend!=null?it.bend:2;
 if(has('pb')){fx.pre=amt;any=true;if(has('r'))fx.release=true}
 else if(has('b')){fx.bend=amt;any=true;if(has('r'))fx.release=true}
 if((it.mk||'').includes('~')){fx.vib=true;any=true}
 if(has('/')||has('\\')){const pm=prev&&prev.m!=null&&it.m!=null?prev.m-it.m:null;fx.from=pm!=null&&pm!==0&&Math.abs(pm)<=12?pm:(has('/')?-2:2);fx.soft=true;any=true}
 if(has('si/')){fx.from=-3;any=true}else if(has('si\\')){fx.from=3;any=true}
 if(has('so/')){fx.out=4;any=true}else if(has('so\\')){fx.out=-5;any=true}
 if(has('h')||has('p')||has('t')){fx.soft=true;fx.legato=true;any=true}
 if(has('S')){fx.slap=true;any=true}if(has('P')){fx.pop=true;any=true}
 return any?fx:null}

/* ---------- v10 sound engine: plucked strings, piano, synthesized kit, room ---------- */
const SBUF={};let BUS={};
function busFor(kind){if(BUS[kind])return BUS[kind];const c=AC;let head=c.createGain();let tail=head;
 const add=n=>{tail.connect(n);tail=n};
 if(kind==='guitar'){const lo=c.createBiquadFilter();lo.type='peaking';lo.frequency.value=210;lo.Q.value=1;lo.gain.value=4;add(lo);const pr=c.createBiquadFilter();pr.type='peaking';pr.frequency.value=2600;pr.Q.value=.9;pr.gain.value=2.5;add(pr);const hs=c.createBiquadFilter();hs.type='highshelf';hs.frequency.value=6500;hs.gain.value=-6;add(hs)}
 else if(kind==='bass'){const lo=c.createBiquadFilter();lo.type='lowshelf';lo.frequency.value=120;lo.gain.value=3;add(lo);const mid=c.createBiquadFilter();mid.type='peaking';mid.frequency.value=900;mid.Q.value=1.2;mid.gain.value=2;add(mid);const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;add(lp)}
 else if(kind==='piano'){const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=9000;add(lp)}
 tail.connect(MASTER);BUS[kind]=head;return head}
function ksBuf(m,kind){const k=kind+m;if(SBUF[k])return SBUF[k];const c=AC,sr=c.sampleRate,f=440*Math.pow(2,(m-69)/12);
 const T60=kind==='bass'?Math.min(5,Math.max(1.4,4.2*Math.sqrt(55/f))):Math.min(4.2,Math.max(.7,3.4*Math.sqrt(110/f)));const secs=Math.min(T60+.2,kind==='bass'?4:3.6);const L=Math.floor(sr*secs);
 const b=c.createBuffer(1,L,sr),y=b.getChannelData(0);const D=sr/f-.5;const E=Math.ceil(D)+2;
 const P=Math.max(1,Math.round((sr/f)*(kind==='bass'?.2:.12)));const a=kind==='bass'?.82:.5;let lp=0;const ex=new Float32Array(E);
 for(let i=0;i<E;i++){lp=lp*a+(Math.random()*2-1)*(1-a);ex[i]=lp}
 for(let i=0;i<E;i++)y[i]=ex[i]-(i>=P?ex[i-P]*.92:0);
 const rho=Math.pow(10,-3/(f*T60));let zp=0;
 for(let n=E;n<L;n++){const p=n-D,i0=Math.floor(p),fr=p-i0;const z=(1-fr)*y[i0]+fr*(i0>0?y[i0-1]:0);y[n]=rho*.5*(z+zp);zp=z}
 let mx=0;for(let i=0;i<Math.min(L,sr*.2|0);i++)mx=Math.max(mx,Math.abs(y[i]));const g=mx?.9/mx:1;const fade=Math.floor(sr*.05);for(let i=0;i<L;i++){y[i]*=g;if(i>L-fade)y[i]*=(L-i)/fade}
 SBUF[k]=b;return b}
function pianoBuf(m){const k='p'+m;if(SBUF[k])return SBUF[k];const c=AC,sr=c.sampleRate,f=440*Math.pow(2,(m-69)/12);
 const secs=Math.min(4.5,Math.max(1.3,4.6-(m-36)*.055));const L=Math.floor(sr*secs);const b=c.createBuffer(1,L,sr),y=b.getChannelData(0);
 const B=.00012*Math.pow(2,(m-48)/14);const K=Math.max(3,Math.min(14,Math.floor(8500/f)));
 for(const cents of [-.9,.9]){const ff=f*Math.pow(2,cents/1200);
  for(let n=1;n<=K;n++){const fn=ff*n*Math.sqrt(1+B*n*n);if(fn>sr*.45)break;const w=2*Math.PI*fn/sr;const amp=Math.pow(1/n,1.15)*(n===1?.9:n===2?1:1)*(m<48?1:1/(1+(n-1)*.08));
   const tau=secs*.55/(1+(n-1)*.45),tau1=Math.min(.35,tau*.18);const d1=Math.exp(-1/(tau1*sr)),d2=Math.exp(-1/(tau*sr));let e1=.55*amp,e2=.45*amp;
   const cw=2*Math.cos(w);let s1=Math.sin(-w),s2=Math.sin(-2*w);
   for(let i=0;i<L;i++){const s0=cw*s1-s2;s2=s1;s1=s0;y[i]+=s0*(e1+e2);e1*=d1;e2*=d2}}}
 let lp=0;const hn=Math.floor(sr*.012);for(let i=0;i<hn;i++){lp=lp*.6+(Math.random()*2-1)*.4;y[i]+=lp*.25*(1-i/hn)}
 const att=Math.floor(sr*.003);for(let i=0;i<att;i++)y[i]*=i/att;
 let mx=0;for(let i=0;i<Math.min(L,sr*.15|0);i++)mx=Math.max(mx,Math.abs(y[i]));const g=mx?.85/mx:1;const fade=Math.floor(sr*.08);for(let i=0;i<L;i++){y[i]*=g;if(i>L-fade)y[i]*=(L-i)/fade}
 SBUF[k]=b;return b}
function tone(m,t,dur,vel,timbre,fx){const c=AC;if(!c)return;m=Math.round(m);
 if(SND==='samples'&&(timbre==='guitar'||timbre==='bass'||timbre==='piano')){const S=SMP[timbre];if(S&&S.ready){let best=null,bd=99;for(const k in S){if(k==='ready')continue;const d=Math.abs(m-k);if(d<bd){bd=d;best=k}}if(best!=null){const s=S[best];const rate=Math.pow(2,(m-best)/12-((SMP_CENTS[timbre]&&SMP_CENTS[timbre][best])||0)/1200);playSample(s,t,vel*1.35/s.peak,rate,timbre==='guitar'?gtrOut():MASTER,t+Math.max(.15,dur)+(timbre==='piano'?.35:.15),fx);return}}else loadSamples(timbre)}
 if(timbre==='guitar'||timbre==='bass'||timbre==='piano'){const buf=timbre==='piano'?pianoBuf(m):ksBuf(m,timbre);const src=c.createBufferSource();src.buffer=buf;const g=c.createGain();
  const v=vel*(timbre==='guitar'?1.55:timbre==='bass'?1.8:1.45);const end=Math.min(t+buf.duration,t+Math.max(.12,dur)+(timbre==='piano'?.3:.12));
  if(fx&&fx.soft){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.012)}else g.gain.setValueAtTime(v,t);g.gain.setValueAtTime(v,Math.max(t+.02,end-.09));g.gain.linearRampToValueAtTime(.0001,end);if(fx)pitchFx(src,t,end,fx);src.connect(g).connect(slapOut(g,fx,timbre==='guitar'&&gtrOut()!==MASTER?gtrOut():busFor(timbre)));src.start(t);src.stop(end+.02);return}
 toneOsc(m,t,dur,vel,timbre)}
function prewarm(kind){const run=()=>{try{const ms=kind==='bass'?[28,33,36,38,40,43,45]:kind==='piano'?[48,52,55,60,64,67,72]:[40,45,47,50,52,55,57,59,62,64];ms.forEach(m=>kind==='piano'?pianoBuf(m):ksBuf(m,kind))}catch(e){}};if(window.requestIdleCallback)requestIdleCallback(run,{timeout:2000});else setTimeout(run,300)}
/* drum kit */
function metallic(t,dec,peak,bp,hp){const c=AC;const g=c.createGain();env(g,t,peak,dec);const b=c.createBiquadFilter();b.type='bandpass';b.frequency.value=bp;b.Q.value=.8;const h=c.createBiquadFilter();h.type='highpass';h.frequency.value=hp;
 [2,3,4.16,5.43,6.79,8.21].forEach(r=>{const o=c.createOscillator();o.type='square';o.frequency.value=40*r*(1+Math.random()*.002);o.connect(b);o.start(t);o.stop(t+dec+.05)});b.connect(h).connect(g).connect(MASTER)}
/* ---------- electric guitar tones ---------- */
const GTONES=[['acoustic','Acoustic'],['clean','Clean electric'],['crunch','Crunch'],['drive','Overdrive']];
let GTBUS={};
function fuzzCurve(){const n=2048,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=x>0?Math.tanh(7*x)/Math.tanh(7):-Math.min(1,Math.pow(-x*3.2,.7))*.82}return c}
function shaperCurve(k){const n=2048,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(k*x)/Math.tanh(k)}return c}
function gtrOut(){const id=window.__toneOvr||store.get('gtone','acoustic');if(id==='acoustic'||!AC)return MASTER;const hit=GTBUS[id];if(hit&&hit.ctx===AC&&hit.master===MASTER)return hit.n;const c=AC;const inp=c.createGain();let tail=inp;const add=n=>{tail.connect(n);tail=n;return n};
 const hp=add(c.createBiquadFilter());hp.type='highpass';hp.frequency.value=id==='clean'?100:150;
 if(id==='clean'){const pk=add(c.createBiquadFilter());pk.type='peaking';pk.frequency.value=1600;pk.gain.value=-5;pk.Q.value=.7;const lp=add(c.createBiquadFilter());lp.type='lowpass';lp.frequency.value=5200;const og=add(c.createGain());og.gain.value=1.1;
  const d=c.createDelay(.05);d.delayTime.value=.012;const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.7;lg.gain.value=.0025;lfo.connect(lg).connect(d.delayTime);lfo.start();const wet=c.createGain();wet.gain.value=.45;og.connect(d);d.connect(wet);wet.connect(MASTER)}
 else{const pre=add(c.createGain());pre.gain.value=id==='crunch'?5:id==='fuzz'?24:14;const ws=add(c.createWaveShaper());ws.curve=id==='fuzz'?fuzzCurve():shaperCurve(id==='crunch'?2.2:4.5);ws.oversample='4x';const mid=add(c.createBiquadFilter());mid.type='peaking';mid.frequency.value=id==='drive'?750:id==='fuzz'?950:1100;mid.gain.value=id==='drive'?6:id==='fuzz'?4:3;mid.Q.value=.8;
  const cab=add(c.createBiquadFilter());cab.type='lowpass';cab.frequency.value=id==='drive'?3600:id==='fuzz'?3000:4400;cab.Q.value=1;const cab2=add(c.createBiquadFilter());cab2.type='lowpass';cab2.frequency.value=7000;const og=add(c.createGain());og.gain.value=id==='crunch'?.32:id==='fuzz'?.2:.24}
 if(id!=='clean'&&c.createStereoPanner){const pl=c.createStereoPanner(),pr=c.createStereoPanner();pl.pan.value=-.3;pr.pan.value=.3;const dl=c.createDelay(.05);dl.delayTime.value=.013;const dg=c.createGain();dg.gain.value=.75;const cab=c.createBiquadFilter();cab.type='peaking';cab.frequency.value=115;cab.Q.value=1.1;cab.gain.value=3;tail.connect(cab);cab.connect(pl);pl.connect(MASTER);cab.connect(dl);dl.connect(dg);dg.connect(pr);pr.connect(MASTER)}else tail.connect(MASTER);GTBUS[id]={ctx:AC,master:MASTER,n:inp};return inp}
/* ---------- drum mixer (per-piece volume) ---------- */
const MIXG={kick:'kick',snare:'snare',rim:'snare',clap:'snare',brushslap:'snare',hat:'hats',open:'hats',shaker:'hats',tamb:'hats',tom1:'toms',tom2:'toms',crash:'cym',ride:'cym',bell:'cym',swish:'cym',cowbell:'cym'};
let DMIX=Object.assign({kick:1,snare:1,hats:1,toms:1,cym:1},store.get('dmix',{}));
function mixFor(k){const g=MIXG[k];return g?DMIX[g]:1}

const DKITS={rock:{name:'Rock kit'},
 jazz:{name:'Jazz kit',tune:{kick:1.3,snare:1.12,tom1:1.18,tom2:1.2},lvl:{kick:.7,crash:.7},lp:12000},
 brushes:{name:'Brushes',sub:{snare:'brushslap',ride:'swish',crash:'swish',open:'swish'},lvl:{kick:.55,hat:.6,rim:.7},lp:9000},
 vintage:{name:'Vintage ’60s',tune:{snare:1.05,kick:1.08,tom1:1.06,tom2:1.06},lvl:{hat:.8},lp:4200},
 heavy:{name:'Big rock',tune:{kick:.9,snare:.94,tom1:.9,tom2:.88},lvl:{kick:1.15,snare:1.1}},
 electronic:{name:'Electronic',synth:true,sub:{rim:'clap'}}};
let DBUS={};
function drumBus(lp){lp=Math.round(lp);if(DBUS[lp])return DBUS[lp];const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;f.Q.value=.5;f.connect(MASTER);DBUS[lp]=f;return f}
const EKIT={kick:(t,v)=>{osc(t,'sine',120,38,1.05*v,.75);osc(t,'square',60,40,.05*v,.05)},
 snare:(t,v)=>{osc(t,'triangle',240,200,.3*v,.09);nz(t,'bandpass',1800,.55*v,.18,.9);nz(t,'highpass',6000,.2*v,.08)},
 hat:(t,v)=>nz(t,'highpass',9000,.22*v,.035,1),open:(t,v)=>nz(t,'highpass',8500,.2*v,.3,1),
 tom1:(t,v)=>osc(t,'sine',220,140,.7*v,.4),tom2:(t,v)=>osc(t,'sine',140,80,.8*v,.55),
 crash:(t,v)=>nz(t,'highpass',5000,.3*v,1.2),ride:(t,v)=>{nz(t,'highpass',7000,.12*v,.5);osc(t,'sine',3200,3150,.04*v,.4)}};
function drum(k,t,v=1,kit){if(!AC)return;const K=DKITS[kit]||DKITS.rock;if(K.sub&&K.sub[k])k=K.sub[k];v*=mixFor(k);if(K.lvl&&K.lvl[k]!=null)v*=K.lvl[k];if(kit)v*=.9+Math.random()*.2;
 if(SND==='samples'&&!K.synth&&DRUM_LVL[k]!=null){const S=SMP.drums;if(S&&S.ready&&S[k]){const s=S[k];playSample(s,t,v*DRUM_LVL[k]/s.peak,((K.tune&&K.tune[k])||1)*(1+(Math.random()-.5)*.025),v<.55?velTone(drumPanBus(K.lp||18000,k),v+.25,'piano'):drumPanBus(K.lp||18000,k));return}loadSamples('drums')}
 if(K.synth&&EKIT[k]){EKIT[k](t,v);return}switch(k){
 case'clap':[0,.011,.022].forEach((d,i)=>nz(t+d,'bandpass',1250,(i===2?.55:.35)*v,i===2?.16:.03,1.4));break;
 case'cowbell':{const c=AC,g=c.createGain(),b=c.createBiquadFilter();b.type='bandpass';b.frequency.value=900;b.Q.value=2;env(g,t,.22*v,.32);[540,800].forEach(f=>{const o=c.createOscillator();o.type='square';o.frequency.value=f;o.connect(b);o.start(t);o.stop(t+.36)});b.connect(g).connect(MASTER);break}
 case'tamb':nz(t,'highpass',7000,.3*v,.16,1);nz(t+.012,'bandpass',9500,.2*v,.12,3);metallic(t,.1,.08*v,11000,8000);break;
 case'shaker':{const c=AC,s=c.createBufferSource();s.buffer=noise();const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=5500;const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16*v,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.09);s.connect(f).connect(g).connect(MASTER);s.start(t);s.stop(t+.12);break}
 case'swish':{const c=AC,s=c.createBufferSource();s.buffer=noise();const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=3200;f.Q.value=.6;const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.2*v,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.24);s.connect(f).connect(g).connect(MASTER);s.start(t);s.stop(t+.3);break}
 case'brushslap':nz(t,'bandpass',2600,.4*v,.14,.8);osc(t,'triangle',200,180,.12*v,.08);break;
 case'bell':osc(t,'sine',2350,2340,.16*v,1.1);osc(t,'sine',3530,3500,.08*v,.7);metallic(t,.25,.06*v,9000,6000);break;
 case'kick':osc(t,'sine',150,44,.95*v,.45);osc(t,'triangle',90,40,.35*v,.18);nz(t,'highpass',2500,.22*v,.012);break;
 case'snare':osc(t,'triangle',190,170,.42*v,.11);osc(t,'triangle',330,300,.22*v,.07);nz(t,'bandpass',2200,.5*v,.2,.7);nz(t,'highpass',5000,.28*v,.14);break;
 case'rim':osc(t,'square',1750,1600,.1*v,.035);nz(t,'bandpass',2600,.22*v,.05,3);osc(t,'triangle',480,460,.18*v,.04);break;
 case'hat':metallic(t,.05,.3*v,10000,7000);break;
 case'open':metallic(t,.38,.26*v,9500,6500);break;
 case'ride':metallic(t,1.1,.16*v,8200,5200);osc(t,'sine',2950,2900,.05*v,.9);osc(t,'sine',4420,4400,.03*v,.6);break;
 case'crash':metallic(t,1.7,.24*v,7000,4200);nz(t,'highpass',5000,.32*v,1.5);break;
 case'tom1':osc(t,'sine',250,180,.65*v,.36);osc(t,'triangle',500,360,.12*v,.12);nz(t,'bandpass',1200,.08*v,.06);break;
 case'tom2':osc(t,'sine',140,98,.75*v,.5);osc(t,'triangle',280,200,.12*v,.15);nz(t,'bandpass',800,.08*v,.07);break;
 case'click':osc(t,'sine',1600,1600,.3*v,.04);break;
 case'clickhi':osc(t,'sine',2400,2400,.45*v,.05);break}}

const ROWS=[['crash','Crash'],['ride','Ride'],['open','Open hi-hat'],['hat','Hi-hat'],['rim','Cross-stick'],['snare','Snare'],['tom1','High tom'],['tom2','Floor tom'],['kick','Kick']];
const KIT=[['kick','Kick (bass) drum','Played with the right foot. The low thump, often on beat 1.'],['snare','Snare drum','The crack on beats 2 and 4 in most styles.'],['hat','Hi-hat, closed','Two cymbals held together for a tight, steady pulse.'],['open','Hi-hat, open','Lift the foot and the hats ring, often on the “and”.'],['ride','Ride cymbal','A big cymbal for steady patterns, especially in jazz.'],['crash','Crash cymbal','The accent that marks the start of a new section.'],['tom1','High tom','For fills that travel around the kit.'],['tom2','Floor tom','The deep tom, often the end of a fill.'],['rim','Cross-stick','Stick laid across the snare to click the rim. Ballads and bossa nova.']];
const GROOVES=[
 {id:'rock',name:'Rock beat',bpm:100,steps:16,feel:'The backbone of rock and pop: hi-hat eighths, snare on 2 and 4, kick on 1 and 3.',rows:{hat:'x.x.x.x.x.x.x.x.',snare:'....x.......x...',kick:'x.......x.x.....'}},
 {id:'disco',name:'Four on the floor',bpm:118,steps:16,feel:'Kick on every beat with open hi-hats on the “and”. Disco, house and dance pop.',rows:{open:'..x...x...x...x.',hat:'x...x...x...x...',snare:'....x.......x...',kick:'x...x...x...x...'}},
 {id:'half',name:'Half-time',bpm:140,steps:16,feel:'The snare moves to beat 3, so the groove feels half as fast. Metal breakdowns, trap and big choruses.',rows:{hat:'x.x.x.x.x.x.x.x.',snare:'........x.......',kick:'x.........x.....'}},
 {id:'funk',name:'Funk sixteenths',bpm:96,steps:16,feel:'Sixteenth-note hi-hats, a busy kick and quiet ghost notes on the snare.',rows:{hat:'xoxoxoxoxoxoxoxo',snare:'....x..o.o..x..o',kick:'x.x....x..x..x..'}},
 {id:'shuffle',name:'Shuffle',bpm:92,steps:12,feel:'Each beat splits into three and you play the first and last. Blues and swing rock.',rows:{hat:'x.xx.xx.xx.x',snare:'...x.....x..',kick:'x.....x.....'}},
 {id:'bossa',name:'Bossa nova',bpm:130,steps:16,feel:'A Brazilian groove: a steady kick pattern with a clave rhythm on the rim.',rows:{hat:'oooooooooooooooo',rim:'x..x..x...x..x..',kick:'x..xx..xx..xx..x'}},
 {id:'onedrop',name:'Reggae one drop',bpm:76,steps:16,feel:'Kick and rim land together on beat 3, with nothing on beat 1.',rows:{hat:'x.x.x.x.x.x.x.x.',rim:'........x.......',kick:'........x.......'}},
 {id:'jazz',name:'Jazz swing',bpm:140,steps:12,feel:'The ride plays “spang-a-lang” while the hi-hat pedal closes on 2 and 4.',rows:{ride:'x..x.xx..x.x',hat:'...x.....x..',kick:'o..o..o..o..'}}];
const RUDI=[
 {id:'single',name:'Single stroke roll',stick:'R L R L R L R L',desc:'Alternate hands evenly. The foundation of fast fills.'},
 {id:'double',name:'Double stroke roll',stick:'R R L L R R L L',desc:'Two strokes per hand. Builds smooth, even rolls.'},
 {id:'para',name:'Paradiddle',stick:'R L R R L R L L',desc:'Single, single, double. Great for moving between drums.'},
 {id:'dpara',name:'Double paradiddle',stick:'R L R L R R L R L R L L',desc:'Two singles then a double: six notes per group, so it fits triplet feels.'},
 {id:'flam',name:'Flam',stick:'lR rL lR rL',desc:'A quiet grace note just before the main stroke makes it sound fat. Lowercase is the grace note.'},
 {id:'drag',name:'Drag',stick:'llR rrL llR rrL',desc:'Two quick grace notes before the main stroke.'}];
function playRudiment(rd,bpm=84){const c=audio();if(!c)return;const sd=60/bpm/4;let t=c.currentTime+.12;const groups=rd.stick.split(' ');const per=rd.id==='dpara'?6:4;
 for(let rep=0;rep<2;rep++)groups.forEach((g,i)=>{const grace=g.length-1;for(let j=0;j<grace;j++)drum('snare',t-(grace-j)*.04,.28);drum('snare',t,i%per===0?1:.62);t+=sd*(grace?2:1)})}
const LOOP={timer:null};
function stopLoop(){if(LOOP.timer){clearInterval(LOOP.timer);LOOP.timer=null;if(LOOP.t0){logPractice((Date.now()-LOOP.t0)/1000);LOOP.t0=0}}}
function startLoop(getPat,{extra,onStep}={}){stopLoop();const c=audio();if(!c)return;LOOP.t0=Date.now();let abs=0,next=c.currentTime+.1;
 LOOP.timer=setInterval(()=>{const p=getPat();const sd=60/p.bpm/(p.per||p.steps/4);while(next<c.currentTime+.15){const s=abs%p.steps;for(const k in p.rows){const ch=p.rows[k][s];if(ch==='x')drum(k,next,1);else if(ch==='o')drum(k,next,.35)}if(extra)extra(abs,next,sd,p);const a=abs,when=next;setTimeout(()=>{if(LOOP.timer&&onStep)onStep(a,p)},Math.max(0,(when-c.currentTime)*1000));next+=sd;abs++}},25)}
function playPattern(p,bars=2){const c=audio();if(!c)return;const sd=60/p.bpm/(p.per||p.steps/4),t0=c.currentTime+.06;for(let b=0;b<bars;b++)for(let s=0;s<p.steps;s++)for(const k in p.rows){const ch=p.rows[k][s];if(ch==='x'||ch==='o')drum(k,t0+(b*p.steps+s)*sd,ch==='x'?1:.35)}}
function playClicks(acc,bars=2,bpm=112){const c=audio();if(!c)return;const sd=60/bpm,t0=c.currentTime+.06;let i=0;for(let b=0;b<bars;b++)for(const ch of acc){drum(ch==='x'?'click':'clickhi',t0+i*sd,ch==='Y'?.55:1);i++}}

