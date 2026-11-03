/* ================= v40: sound engine upgrade ================= */
/* a mix bus like a real studio: rumble filter, gentle glue compression, a safety limiter, and a hall-style reverb send */
function makeHall(c,secs=1.9){const sr=c.sampleRate,L=Math.floor(sr*secs);const b=c.createBuffer(2,L,sr);
 const taps=[[.007,.5],[.011,.42],[.017,.38],[.023,.33],[.029,.3],[.037,.26],[.043,.22],[.053,.2],[.061,.17],[.071,.14]];
 for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let lp=0;
  taps.forEach(([t,g],i)=>{const at=Math.floor((t+(ch?.0017*(i%3):0))*sr);if(at<L)d[at]+=g*(i%2===ch?1:-1)});
  for(let i=0;i<L;i++){const x=i/sr;const k=Math.min(.94,.25+x*.55);lp=lp*k+(Math.random()*2-1)*(1-k);const env=Math.exp(-x*6.9/secs)*(x<.02?x/.02:1);d[i]+=lp*env*1.6}}
 const cv=c.createConvolver();cv.normalize=true;cv.buffer=b;return cv}
let _scc=null;function softClipCurve(){if(_scc)return _scc;const n=4096,k=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1,ax=Math.abs(x);k[i]=Math.sign(x)*(ax<.8?ax:.8+.2*Math.tanh((ax-.8)/.2))}return _scc=k}
function mixChain(c,master,wetAmt=.17){const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=28;hp.Q.value=.6;
 const glue=c.createDynamicsCompressor();glue.threshold.value=-16;glue.knee.value=10;glue.ratio.value=2.5;glue.attack.value=.015;glue.release.value=.22;
 const lim=c.createDynamicsCompressor();lim.threshold.value=-2.5;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.001;lim.release.value=.09;
 const mk=c.createGain();mk.gain.value=1.12;master.connect(hp);hp.connect(glue);glue.connect(mk);mk.connect(lim);const sc=c.createWaveShaper();sc.curve=softClipCurve();sc.oversample='2x';lim.connect(sc);sc.connect(c.destination);
 try{const pd=c.createDelay(.1);pd.delayTime.value=.018;const rv=makeHall(c);const rhp=c.createBiquadFilter();rhp.type='highpass';rhp.frequency.value=220;const rlp=c.createBiquadFilter();rlp.type='lowpass';rlp.frequency.value=7500;const wet=c.createGain();wet.gain.value=wetAmt;
  master.connect(pd);pd.connect(rv);rv.connect(rhp);rhp.connect(rlp);rlp.connect(wet);wet.connect(glue)}catch(e){}return glue}
/* recorded instruments: Salamander Grand Piano in two dynamic layers, and an electric guitar for the amp tones */
Object.assign(SMP_CENTS,{guitarE:{"40":-1,"48":1,"51":-1,"54":-1,"57":-2,"60":-2,"78":7,"81":1},piano:{"33":3,"36":5,"39":6,"42":3,"45":5,"51":1,"54":2,"57":9,"60":5,"63":7,"66":1,"69":6,"72":8,"75":6,"78":5,"81":8,"84":14,"87":11,"90":14,"93":14,"96":22}});
const isAmpTone=()=>{const id=window.__toneOvr||store.get('gtone','acoustic');return id&&id!=='acoustic'};
function nearestSample(S,m,suffix){let best=null,bd=99;for(const k in S){if(k==='ready')continue;const n=parseInt(k,10);if(suffix!=null&&k.slice(String(n).length)!==suffix)continue;const d=Math.abs(m-n);if(d<bd){bd=d;best=k}}return best}
/* softer notes are darker, like a real instrument; a tiny random variation stops repeated notes sounding mechanical */
function velTone(dest,vel,kind){if(!AC||vel>=.85)return dest;const f=AC.createBiquadFilter();f.type='lowpass';f.Q.value=.5;f.frequency.value=kind==='bass'?900+vel*5200:1500+vel*vel*14000;f.connect(dest);return f}
{const _tone=tone;tone=function(m,t,dur,vel,timbre,fx){const c=AC;if(!c)return;
 if(SND==='samples'&&(timbre==='piano'||(timbre==='guitar'&&isAmpTone()))){const kind=timbre==='piano'?'piano':'guitarE';const S=SMP[kind];
  if(S&&S.ready){m=Math.round(m);const v=Math.max(.05,Math.min(1.3,vel*(.96+Math.random()*.08)));const suf=kind==='piano'?(v<.55?'s':'l'):null;const best=nearestSample(S,m,suf);
   if(best!=null){const s=S[best];const n=parseInt(best,10);const rate=Math.pow(2,(m-n)/12-((SMP_CENTS[kind]&&SMP_CENTS[kind][n])||0)/1200);
    const dest=kind==='piano'?velTone(MASTER,v,'piano'):gtrOut();playSample(s,t,v*1.3/s.peak,rate,dest,t+Math.max(.15,dur)+(kind==='piano'?.45:.15),fx);return}}else loadSamples(kind)}
 if(SND==='samples'&&(timbre==='bass'||timbre==='guitar')&&SMP[timbre]&&SMP[timbre].ready&&vel<.85){const keep=MASTER;MASTER=velTone(keep,vel,timbre);try{return _tone(m,t,dur,vel*(.96+Math.random()*.08),timbre,fx)}finally{MASTER=keep}}
 return _tone(m,t,dur,vel,timbre,fx)}}
{const _ls=loadSamples;loadSamples=function(kind){if(kind==='guitar'&&AC&&SMPDATA.guitarE){const a=_ls('guitar'),e=_ls('guitarE');return a&&e?Promise.all([a,e]):a}return _ls(kind)}}
/* a drum kit spread across the stereo field, as the audience hears it */
const DPAN={hat:.28,open:.28,shaker:.3,tamb:-.3,tom1:.18,tom2:-.22,ride:-.32,bell:-.32,crash:.34,swish:.2,cowbell:-.2};
let DPBUS={};
function drumPanBus(lp,k){const p=DPAN[k]||0;if(!p||!AC.createStereoPanner)return drumBus(lp);const key=Math.round(lp)+'|'+p;const hit=DPBUS[key];if(hit&&hit.ctx===AC)return hit.n;const n=AC.createStereoPanner();n.pan.value=p;n.connect(drumBus(lp));DPBUS[key]={ctx:AC,n};return n}
Object.assign(window,{mixChain,makeHall,velTone,drumPanBus});

