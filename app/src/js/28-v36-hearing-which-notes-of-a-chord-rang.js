/* ================= v36: hearing which notes of a chord rang ================= */
/* 12-bin pitch-class energy from an analyser's dB spectrum (70 Hz to 1.5 kHz) */
function chromaOf(db,sr,fft){const c=new Float32Array(12);const bw=sr/fft;const lo=Math.max(1,Math.floor(70/bw)),hi=Math.min(db.length-1,Math.ceil(1500/bw));
 let floor=-200;for(let i=lo;i<=hi;i++)if(db[i]>floor)floor=db[i];floor-=45;
 for(let i=lo+1;i<hi;i++){const v=db[i];if(v<floor||v<db[i-1]||v<db[i+1])continue;const a=Math.pow(10,v/20);const f=i*bw;const m=69+12*Math.log2(f/440);const pc=((Math.round(m)%12)+12)%12;const w=1-Math.min(1,Math.abs(m-Math.round(m))*1.6);c[pc]+=a*a*w*(f<400?1:400/f)}
 return c}
function chromaWindow(frames,t0,t1){const avg=new Float32Array(12);let n=0;frames.forEach(f=>{if(f.t>=t0&&f.t<=t1){for(let i=0;i<12;i++)avg[i]+=f.c[i];n++}});if(!n)return null;for(let i=0;i<12;i++)avg[i]/=n;return avg}
/* which of the wanted pitch classes are clearly missing */
function chordMissing(avg,pcs){if(!avg)return null;const want=[...new Set(pcs.map(p=>((p%12)+12)%12))];const top=Math.max(...want.map(p=>avg[p]),1e-12);const all=Math.max(...avg);if(all<1e-9)return null;
 return want.filter(p=>avg[p]<top*.07)}
function stringLabel(S,s){if(!S)return'';const n=S.length;const nm=SHARPN[S[s]%12];if(n>=6&&nm==='E')return(s===0?'low E':'high E')+' string';return nm+' string'}

