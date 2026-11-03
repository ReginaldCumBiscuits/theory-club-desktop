/* ================= audio ================= */
let AC=null,MASTER=null;
function audio(){if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C();MASTER=AC.createGain();MASTER.gain.value=MUTED()?0:VOL();mixChain(AC,MASTER);prewarm(TIMBRE());loadSamples('drums');loadSamples(TIMBRE())}if(AC.state==='suspended')AC.resume();return AC}
function toneOsc(m,t,dur,vel,timbre){const c=AC,f=440*Math.pow(2,(m-69)/12);const g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';
 const o1=c.createOscillator(),o2=c.createOscillator(),g2=c.createGain();
 if(timbre==='bass'){o1.type='sawtooth';o2.type='sine';g2.gain.value=.9;lp.frequency.setValueAtTime(Math.min(1600,f*5),t);lp.frequency.exponentialRampToValueAtTime(Math.max(120,f*1.3),t+.5)}
 else if(timbre==='guitar'){o1.type='sawtooth';o2.type='triangle';g2.gain.value=.5;lp.frequency.setValueAtTime(Math.min(9000,f*8),t);lp.frequency.exponentialRampToValueAtTime(Math.max(300,f*1.5),t+.6)}
 else{o1.type='triangle';o2.type='sine';g2.gain.value=.25;lp.frequency.value=Math.min(7000,f*6)}
 o1.frequency.value=f;o2.frequency.value=timbre==='bass'?f:f*2;o2.connect(g2).connect(g);o1.connect(g);g.connect(lp).connect(MASTER);
 const v=timbre==='guitar'?vel*.55:timbre==='bass'?vel*.95:vel;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(v*.35,t+.35);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
 o1.start(t);o2.start(t);o1.stop(t+dur+.05);o2.stop(t+dur+.05)}
/* a strum: strings sound one after another, low to high on a down-strum and high to low on an up-strum */
function strum(ms,t,dur,vel,{dir='down',spread=.014,timbre='guitar',tone:T=tone}={}){const order=dir==='up'?[...ms].sort((a,b)=>b-a).slice(0,Math.min(ms.length,4)):[...ms].sort((a,b)=>a-b);const n=order.length;const v=vel*(dir==='up'?.8:1);
 order.forEach((m,i)=>T(m,t+i*spread*(.8+Math.random()*.4),dur,v*(.85+Math.random()*.25)*(dir==='down'&&i===0?1.1:1),timbre))}
function play(ms,{mode='chord',gap=.42,dur,timbre=TIMBRE(),at=0}={}){const c=audio();if(!c||!ms.length)return 0;const t0=c.currentTime+.03+at;
 if(mode==='chord'){const v=.32/Math.sqrt(ms.length)*1.2;if(timbre==='guitar'){strum(ms,t0,dur||1.9,v*1.1,{spread:.018});return dur||1.9}ms.forEach(m=>tone(m,t0,dur||1.7,v,timbre));return dur||1.7}
 if(mode==='strum'){const v=.34/Math.sqrt(ms.length)*1.5;strum(ms,t0,dur||2.2,v,{spread:.03});return 2}
 ms.forEach((m,i)=>tone(m,t0+i*gap,dur||gap*1.8,.28,timbre));return ms.length*gap}
let seqTimers=[];
function stopSeq(){seqTimers.forEach(clearTimeout);seqTimers=[]}
function playSeq(steps,beat,onStep){stopSeq();steps.forEach((s,i)=>seqTimers.push(setTimeout(()=>{play(s,{mode:'chord',dur:beat*1.05});onStep&&onStep(i)},i*beat*1000)));seqTimers.push(setTimeout(()=>onStep&&onStep(-1),steps.length*beat*1000))}

/* ---------- practice log (top level, used by the audio loop) ---------- */
function logPractice(sec){if(!(sec>0))return;sec=Math.min(sec,1800);const L=store.get('plog',{});const k=todayKey();L[k]=Math.round((L[k]||0)+sec);const ks=Object.keys(L).sort();ks.slice(0,-120).forEach(x=>delete L[x]);store.set('plog',L)}
