/* ================= v45/v46: song transcriber — the background worker (stem separation and transcription) ================= */
function tsWorkerMain(){
 const post=(o,tr)=>self.postMessage(o,tr||[]);
 /* radix-2 FFT, in place */
 function fft(re,im,inv){const n=re.length;for(let i=1,j=0;i<n;i++){let b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}
  for(let len=2;len<=n;len<<=1){const a=(inv?2:-2)*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a);for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let j=0;j<len/2;j++){const ur=re[i+j],ui=im[i+j],k=i+j+len/2,vr=re[k]*cr-im[k]*ci,vi=re[k]*ci+im[k]*cr;re[i+j]=ur+vr;im[i+j]=ui+vi;re[k]=ur-vr;im[k]=ui-vi;const nr=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=nr}}}
  if(inv)for(let i=0;i<n;i++){re[i]/=n;im[i]/=n}}
 function resample(x,sr,to){if(sr===to)return x;const r=sr/to,n=Math.floor(x.length/r),y=new Float32Array(n);const k=Math.max(1,Math.round(r));for(let i=0;i<n;i++){const p=i*r,i0=Math.floor(p);let s=0,c=0;for(let j=-k+1;j<=k-1;j++){const q=i0+j;if(q>=0&&q<x.length){const w=k-Math.abs(j);s+=x[q]*w;c+=w}}y[i]=c?s/c:0}return y}
 const MS=new Float32Array(64);const med=(a,n)=>{for(let i=0;i<n;i++){const v=a[i];let j=i-1;while(j>=0&&MS[j]>v){MS[j+1]=MS[j];j--}MS[j+1]=v}return MS[n>>1]};
 /* --- separation: one streaming pass of short-time Fourier transforms --- */
 function separate(L,R,sr,part,prog,opt={}){const N=2048,H=512,B=N/2+1,K=17,hk=K>>1;const n=L.length;const nf=Math.ceil(n/H)+1;
  const win=new Float32Array(N);for(let i=0;i<N;i++)win[i]=.5-.5*Math.cos(2*Math.PI*i/N);
  const stem=new Float32Array(n+N),rest=new Float32Array(n+N),wsum=new Float32Array(n+N);
  const PL=opt.pre&&opt.pre[0],PR=opt.pre&&opt.pre[1];const ringL=[],ringR=[],ringM=[],ringP=[];for(let i=0;i<K;i++){ringP.push([new Float32Array(B),new Float32Array(B)]);ringL.push([new Float32Array(B),new Float32Array(B)]);ringR.push([new Float32Array(B),new Float32Array(B)]);ringM.push(new Float32Array(B))}
  const re=new Float32Array(N),im=new Float32Array(N),re2=new Float32Array(N),im2=new Float32Array(N);const col=new Float32Array(K),fr=new Float32Array(K);
  const hz=k=>k*sr/N;const sm=(x,a,b)=>x<=a?0:x>=b?1:(x-a)/(b-a);
  const FEAT={flux:new Float32Array(nf),sflux:new Float32Array(nf),chroma:[],bchroma:[],low:new Float32Array(nf),mid:new Float32Array(nf),high:new Float32Array(nf),rms:new Float32Array(nf),bands:[],flatM:new Float32Array(nf),flatH:new Float32Array(nf)};
  let prevMag=null,prevStem=null;const SAL=[];
  const frameIn=f=>{const o=f*H-N/2;const sl=ringL[f%K],sr_=ringR[f%K];for(let i=0;i<N;i++){const j=o+i;re[i]=j>=0&&j<n?L[j]*win[i]:0;im[i]=0;re2[i]=j>=0&&j<n?R[j]*win[i]:0;im2[i]=0}fft(re,im,false);fft(re2,im2,false);
   const m=ringM[f%K];for(let k=0;k<B;k++){sl[0][k]=re[k];sl[1][k]=im[k];sr_[0][k]=re2[k];sr_[1][k]=im2[k];const mr=(re[k]+re2[k])/2,mi=(im[k]+im2[k])/2;m[k]=Math.hypot(mr,mi)}
   if(PL){const pp=ringP[f%K];for(let i=0;i<N;i++){const j=o+i;re[i]=j>=0&&j<n?(PL[j]+PR[j])/2*win[i]:0;im[i]=0}fft(re,im,false);for(let k=0;k<B;k++){pp[0][k]=re[k];pp[1][k]=im[k]}}};
  const process=c=>{const sl=ringL[c%K],sr_=ringR[c%K],Mm=ringM[c%K];const avail=Math.min(K,nf);
   const outR=new Float32Array(N),outI=new Float32Array(N),resR=new Float32Array(N),resI=new Float32Array(N);let flux=0,sflux=0,lo=0,mi=0,hi=0;const ch=new Float32Array(12),bch=new Float32Array(12);
   const stemMag=new Float32Array(B);const hm_=new Float32Array(B);const bd=new Float32Array(5);let fmL=0,fmA=0,fmN=0,fhL=0,fhA=0,fhN=0;
   for(let k=0;k<B;k++){/* harmonic: median over time; percussive: median over frequency */
    if(VX.hw&&part==='vocals'){const w=VX.hw;for(let t=0;t<avail;t++){const R=ringM[t];let m=0;for(let q=Math.max(0,k-w);q<=Math.min(B-1,k+w);q++)if(R[q]>m)m=R[q];col[t]=m}}else for(let t=0;t<avail;t++)col[t]=ringM[t][k];const Hm=med(col,avail);let q=0;for(let d=-hk;d<=hk;d++){const kk=k+d;if(kk>=0&&kk<B)fr[q++]=Mm[kk]}const Pm=med(fr,q);
    const h2=Hm*Hm,p2=Pm*Pm,den=h2+p2+1e-12;const mh=h2/den,mp=p2/den;
    const lr=sl[0][k],li=sl[1][k],rr=sr_[0][k],ri=sr_[1][k];const dl=Math.hypot(lr-rr,li-ri),sa=Math.hypot(lr,li)+Math.hypot(rr,ri)+1e-9;let cen=1-dl/sa;cen=cen<0?0:cen;cen=cen*cen*cen*cen;
    const f=hz(k);const bassW=1-sm(f,180,320);const vband=sm(f,150,240)*(1-sm(f,6000,9000));
    let mask;if(part==='vocals'){mask=mh*Math.pow(cen,VX.cp)*vband*(1-bassW*.85);/* take out the bass line's overtones, which sit in the middle like the voice */const bf=opt.bassF0&&opt.bassF0[c];if(bf&&f<2500){const h=Math.round(f/bf);if(h>=1){const w=Math.max(bf*.03,sr/N*VX.nw);const dd=(f-h*bf)/w;mask*=1-VX.nd*Math.exp(-dd*dd)}}}else if(part==='drums')mask=mp*(1-sm(f,12000,16000)*.3);else if(part==='bass')mask=Math.pow(mh,VX.bp)*bassW*(1-sm(f,20,35)*0)*sm(f,25,40);else mask=mh*(1-bassW)*(1-cen*vband*.9);
    const mr=(lr+rr)/2,mii=(li+ri)/2;if(PL){const pp=ringP[c%K];outR[k]=pp[0][k];outI[k]=pp[1][k];resR[k]=mr-pp[0][k];resI[k]=mii-pp[1][k]}else{outR[k]=mr*mask;outI[k]=mii*mask;resR[k]=mr*(1-mask);resI[k]=mii*(1-mask)}if(k>0&&k<N/2){outR[N-k]=outR[k];outI[N-k]=-outI[k];resR[N-k]=resR[k];resI[N-k]=-resI[k]}
    const smag=Math.hypot(outR[k],outI[k]);stemMag[k]=smag;
    if(prevMag){const d=Math.log1p(Mm[k]*10)-Math.log1p(prevMag[k]*10);if(d>0)flux+=d}if(prevStem){const d=Math.log1p(smag*10)-Math.log1p(prevStem[k]*10);if(d>0)sflux+=d}
    const pm=Pm*mp;const pq=Pm>DR.marg*Hm?Mm[k]:0;if(f>30)bd[f<150?0:f<400?1:f<2500?2:f<5000?3:4]+=pq*pq;if(prevMag&&f>=400&&f<10000){const dd=Math.max(0,Mm[k]-prevMag[k])+1e-7;if(f<5000){fmL+=Math.log(dd);fmA+=dd;fmN++}else{fhL+=Math.log(dd);fhA+=dd;fhN++}}if(f>30&&f<150)lo+=pm;else if(f>=150&&f<2500)mi+=pm;else if(f>=5000)hi+=pm;
    if(!CH.peaks&&f>55&&f<2000){const pc=((Math.round(12*Math.log2(f/440))+69)%12+12)%12;const w=CH.src===2?Mm[k]*mh:part==='other'||part==='vocals'?smag:Mm[k]*mh;ch[pc]+=CH.pw===1?w:w*w;if(f<260)bch[pc]+=Mm[k]*mh*Mm[k]*mh}hm_[k]=Mm[k]*mh}
   if(CH.peaks){/* chroma from spectral peaks at their exact pitch, so a low E isn't counted as an F */const pkc=(X,lo,hi,acc,sq)=>{for(let k=2;k<B-1;k++){const f=hz(k);if(f<lo||f>hi)continue;const v=X[k];if(!(v>X[k-1]&&v>=X[k+1]&&v>0))continue;const a=Math.log(X[k-1]+1e-9),b=Math.log(v),cc=Math.log(X[k+1]+1e-9),dn=a+cc-2*b;const off=dn?(a-cc)/(2*dn):0;const p=12*Math.log2((k+off)*sr/N/440)+69;const pr=Math.round(p);const w=1-Math.min(1,Math.abs(p-pr)*2*CH.dw);const pc=((pr%12)+12)%12;acc[pc]+=(sq?v*v:v)*w}};
    pkc(part==='other'||part==='vocals'?stemMag:hm_,55,2000,ch,CH.pw!==1);pkc(hm_,30,260,bch,true)}
   if(opt.sal){/* melody salience: add up each candidate pitch's harmonics in the separated part */const sq=new Float32Array(B);for(let k=0;k<B;k++)sq[k]=Math.sqrt(stemMag[k]);const at=f=>{const x=f*N/sr;const i=Math.floor(x);if(i+1>=B)return 0;const fr=x-i;return Math.max(sq[i]*(1-fr)+sq[i+1]*fr,fr<.5?sq[i]:sq[i+1])};
    const R0=opt.sal[0],R1=opt.sal[1];const sal=[];for(let m=R0;m<=R1;m+=.2){const f0=440*Math.pow(2,(m-69)/12);let v=0,w=1;for(let h=1;h<=(opt.sal[2]||VX.nh);h++){const fh=f0*h;if(fh>5000)break;v+=w*at(fh);w*=(opt.sal[3]||VX.hd)}sal.push(v)}
    const pk=[];for(let i=1;i<sal.length-1;i++)if(sal[i]>sal[i-1]&&sal[i]>=sal[i+1])pk.push(i);pk.sort((a,b)=>sal[b]-sal[a]);
    SAL.push({t:c*H/sr,cs:pk.slice(0,4).map(i=>{const a=sal[i-1],b=sal[i],cc=sal[i+1],dn=a+cc-2*b;const off=dn?(a-cc)/(2*dn):0;return{m:R0+(i+off)*.2,s:b}})})}
   prevMag=Mm.slice();prevStem=stemMag;FEAT.flux[c]=flux;FEAT.sflux[c]=sflux;FEAT.low[c]=lo;FEAT.mid[c]=mi;FEAT.high[c]=hi;FEAT.chroma.push(ch);FEAT.bands.push(bd);FEAT.flatM[c]=fmN?Math.exp(fmL/fmN)/(fmA/fmN):0;FEAT.flatH[c]=fhN?Math.exp(fhL/fhN)/(fhA/fhN):0;FEAT.bchroma.push(bch);
   fft(outR,outI,true);fft(resR,resI,true);const o=c*H-N/2;let e=0;for(let i=0;i<N;i++){const j=o+i;if(j<0||j>=n)continue;stem[j]+=outR[i]*win[i];rest[j]+=resR[i]*win[i];wsum[j]+=win[i]*win[i];e+=outR[i]*outR[i]}FEAT.rms[c]=Math.sqrt(e/N)};
  for(let f=0;f<nf+hk;f++){if(f<nf)frameIn(f);const c=f-hk;if(c>=0&&c<nf)process(c);if(f%200===0)prog(f/(nf+hk))}
  for(let i=0;i<n;i++){const w=wsum[i]>1e-6?wsum[i]:1;stem[i]/=w;rest[i]/=w}
  return{stem:stem.subarray(0,n),rest:rest.subarray(0,n),F:FEAT,H,N,SAL}}
 /* the bass line's pitch, frame by frame, from a low-passed mix (used to keep it out of the vocals) */
 function bassTrack(l,r,sr){const n=l.length,x=new Float32Array(n);let a=0,b=0;const k=1-Math.exp(-2*Math.PI*260/sr);for(let i=0;i<n;i++){const v=(l[i]+r[i])/2;a+=(v-a)*k;b+=(a-b)*k;x[i]=b}
  const P=yinDs(x,sr,512,1536,35,330,8);const nf=Math.ceil(n/512)+1,out=new Float32Array(nf);const mx=Math.max(1e-9,...P.map(p=>p.r));P.forEach(p=>{if(p.f>0&&p.c>.7&&p.r>mx*.05){const c=Math.round(p.t*sr/512);if(c>=0&&c<nf)out[c]=p.f}});return out}
 const VX=Object.assign({nd:.5,nw:1.8,cp:2,fmin:120,hw:2,sal:1,nh:8,hd:.85,bsal:1,bp:2,bnh:5,bhd:.6},self.VXO||{});
 function backbeat(F,fps){const n=F.bands.length;if(n<fps*6)return 0;const nv=bs=>{const x=new Float32Array(n);for(let i=2;i<n;i++){const v=bs.reduce((a,b)=>a+Math.sqrt(F.bands[i][b]),0),p=Math.max(...[1,2].map(q=>bs.reduce((a,b)=>a+Math.sqrt(F.bands[i-q][b]),0)));x[i]=Math.max(0,v-p)}let m=0;for(let i=0;i<n;i++)m=Math.max(m,x[i]);if(m>0)for(let i=0;i<n;i++)x[i]/=m;
   const y=new Float32Array(n);for(let i=0;i<n;i++){let s=0,c=0;for(let j=-2;j<=2;j++){const k=i+j;if(k>=0&&k<n){const w=3-Math.abs(j);s+=x[k]*w;c+=w}}y[i]=s/c}return y};
  const hs=drums(F,fps);const imp=k=>{const x=new Float32Array(n);hs.forEach(h=>{if(h.k!==k)return;const c=Math.round((h.t-DR.off)*fps);for(let j=-2;j<=2;j++){const q=c+j;if(q>=0&&q<n)x[q]=Math.max(x[q],(3-Math.abs(j))/3*Math.pow(Math.max(0,(h.v-55)/65),2))}});return x};const sn=imp('snare'),kk=imp('kick');const xc=(a,b,lag)=>{let s=0;const L=Math.round(lag);for(let i=Math.max(0,-L);i<n&&i+L<n;i++)if(i+L>=0)s+=a[i]*b[i+L];return s};
  let best=0,Ps=0;const AC=[];for(let lag=Math.round(.6*fps);lag<=Math.round(2.6*fps);lag++){const v=xc(sn,sn,lag);AC.push([lag,v]);if(v>best){best=v;Ps=lag}}if(!Ps)return 0;/* the shortest strong period, not a multiple of it */for(const [lag,v] of AC){if(v>=best*.85){let pk=true;for(const [l2,v2] of AC)if(Math.abs(l2-lag)<=2&&v2>v)pk=false;if(pk){Ps=lag;best=v;break}}}
  const self0=xc(sn,sn,0),half=xc(sn,sn,Ps/2),kickBetween=xc(kk,sn,Ps/2),kickOn=xc(kk,sn,0),kk0=xc(kk,kk,0);
  BBDBG&&(BBDBG.v={Ps:Ps/fps,per:best/self0,half:half/best,kb:kickBetween/Math.sqrt(self0*kk0),ko:kickOn/Math.sqrt(self0*kk0)});
  if(best/self0>BB.per&&half<best*BB.half&&kickBetween>kickOn*BB.kb){const bpm=120*fps/Ps;if(bpm>=58&&bpm<=200)return Ps/2}return 0}
 const BB=Object.assign({per:.3,half:.6,kb:1.2},self.BBO||{});let BBDBG=self.BBD||null;
 /* --- tempo and beats (Ellis dynamic-programming beat tracker) --- */
 function beats(flux,fps,F){const n=flux.length;const env=new Float32Array(n);let mx=0;for(let i=0;i<n;i++){let s=0,c=0;for(let j=Math.max(0,i-8);j<=Math.min(n-1,i+8);j++){s+=flux[j];c++}env[i]=Math.max(0,flux[i]-s/c);if(env[i]>mx)mx=env[i]}if(mx>0)for(let i=0;i<n;i++)env[i]/=mx;
  /* a smoothed copy for tempo: kick and snare onsets are found a few frames apart from where they really are, so allow some slack */const es=new Float32Array(n);for(let i=0;i<n;i++){let s=0,c=0;for(let j=-3;j<=3;j++){const k=i+j;if(k<0||k>=n)continue;const w=4-Math.abs(j);s+=env[k]*w;c+=w}es[i]=s/c}
  let best=0,bl=0;for(let bpm=60;bpm<=190;bpm+=.5){const lag=60*fps/bpm;let s=0;for(let i=Math.ceil(lag);i<n;i++){const a=i-lag,a0=Math.floor(a),fr=a-a0;s+=es[i]*(es[a0]*(1-fr)+(es[a0+1]||0)*fr)}const w=Math.exp(-.5*Math.pow(Math.log2(bpm/110)/1.1,2));s*=w;if(s>best){best=s;bl=lag}}
  const acf=lag=>{let s=0;for(let i=Math.ceil(lag);i<n;i++){const a=i-lag,a0=Math.floor(a),fr=a-a0;s+=es[i]*(es[a0]*(1-fr)+(es[a0+1]||0)*fr)}return s};
  let lagB=bl||fps*60/100;const bb=F?backbeat(F,fps):0;
  if(bb){/* a snare backbeat with the kick in between fixes the beat level: the beat is half the snare's period */let b2=0,l2=bb;for(let f=.94;f<=1.06;f+=.005){const v=acf(bb*f);if(v>b2){b2=v;l2=bb*f}}lagB=l2}
  else{const bpm0=60*fps/lagB;if(bpm0<=95&&acf(lagB/2)>acf(lagB)*.4)lagB/=2;else if(bpm0>175)lagB*=2}const P=lagB;const sc=new Float32Array(n),bk=new Int32Array(n).fill(-1);for(let i=0;i<n;i++){let m=0,mi=-1;for(let j=Math.round(i-2*P);j<=Math.round(i-P/2);j++){if(j<0)continue;const v=sc[j]-100*Math.pow(Math.log((i-j)/P),2);if(v>m||mi<0&&j>=0){m=v;mi=j}}sc[i]=env[i]+(mi>=0?Math.max(0,m):0);bk[i]=mi}
  let e=n-1,bm=-1;for(let i=n-1;i>=Math.max(0,n-Math.round(P*2));i--)if(sc[i]>bm){bm=sc[i];e=i}const out=[];while(e>=0){out.push(e);e=bk[e]}out.reverse();
  /* report the tempo the tracked beats actually keep (median gap) */const gaps=[];for(let i=1;i<out.length;i++)gaps.push(out[i]-out[i-1]);gaps.sort((a,b)=>a-b);const g=gaps.length>4?gaps.slice(Math.floor(gaps.length*.25),Math.ceil(gaps.length*.75)):gaps;const mg=g.length?g.reduce((a,b)=>a+b,0)/g.length:P;
  return{bpm:Math.round(60*fps/mg*10)/10,beats:out.map(i=>i/fps)}}
 /* --- pitch (YIN) on the separated part --- */
 function yinDs(x,sr,hop,W,fmin,fmax,ds){const y=resample(x,sr,sr/ds);return yin(y,sr/ds,Math.max(1,Math.round(hop/ds)),Math.round(W/ds),fmin,fmax)}
 function yin(x,sr,hop,W,fmin,fmax){const out=[];const d=new Float32Array(W);const minT=Math.floor(sr/fmax),maxT=Math.min(W-1,Math.floor(sr/fmin));
  for(let s=0;s+2*W<x.length;s+=hop){let e=0;for(let i=0;i<W;i++)e+=x[s+i]*x[s+i];const rms=Math.sqrt(e/W);if(rms<1e-4){out.push({t:(s+W/2)/sr,f:0,c:0,r:rms,cs:[]});continue}
   d[0]=1;let run=0;let T=-1;for(let t=1;t<=maxT;t++){let v=0;for(let i=0;i<W;i++){const df=x[s+i]-x[s+i+t];v+=df*df}run+=v;d[t]=run?v*t/run:1;if(t>=minT&&T<0&&d[t]<.15){T=t}if(T>0&&t>T&&d[t]>d[t-1]){break}}
   if(T<0){let b=1e9;for(let t=minT;t<=maxT;t++)if(d[t]<b){b=d[t];T=t}if(b>.4&&!NX.cands){out.push({t:(s+W/2)/sr,f:0,c:0,r:rms,cs:[]});continue}if(b>.4){/* nothing clear: keep weak candidates for the tracker */const cs=[];for(let q=minT+1;q<maxT;q++)if(d[q]<d[q-1]&&d[q]<=d[q+1]&&d[q]<.7)cs.push({f:sr/q,c:1-d[q]});cs.sort((x,y)=>y.c-x.c);out.push({t:(s+W/2)/sr,f:0,c:0,r:rms,cs:cs.slice(0,3)});continue}}else{while(T+1<=maxT&&d[T+1]<d[T])T++}
   for(let g=0;g<2;g++){const h=Math.round(T/2);if(h>=minT){let hb=h;for(let q=h-2;q<=h+2;q++)if(q>=minT&&q<=maxT&&d[q]<d[hb])hb=q;if(d[hb]<d[T]+.12)T=hb;else break}else break}
   const a=d[T-1]||d[T],b=d[T],c=d[T+1]||d[T];const den=a+c-2*b;const tt=den?T+(a-c)/(2*den):T;
   /* other likely pitches (dips in the difference function), so the note tracker can choose a smooth line */const cs=[{f:sr/tt,c:1-b}];if(NX.cands){const dips=[];for(let q=minT+1;q<maxT;q++)if(d[q]<d[q-1]&&d[q]<=d[q+1]&&d[q]<.6&&Math.abs(q-T)>2){const a2=d[q-1],c2=d[q+1],dn=a2+c2-2*d[q];dips.push({f:sr/(dn?q+(a2-c2)/(2*dn):q),c:1-d[q]})}dips.sort((x,y)=>y.c-x.c).slice(0,3).forEach(x=>cs.push(x))}
   out.push({t:(s+W/2)/sr,f:sr/tt,c:1-b,r:rms,cs})}return out}
 const NX=Object.assign({bOn:0,bLp:300,bRise:.6,bFloor:7,bGap:.07,bMinC:.5,bDecay:2.3,bSkip:.035,bOff:-.01,snapK:.1,vsh:.015,obB:1.2,raB:1.15,obV:1.5,dip:.5,dip2:.75,raV:1.8,ra:1.8,cands:1,v:1,eOff:.8,tJ:.9,tS:.08,tO:.6,lo:.04,hy:.62,minF:3},self.NXO||{});
 /* note tracking: choose the smoothest likely pitch line through all frames (Viterbi), then cut it into notes */
 function notesV(P,onsets,minDur,RANGE){const n=P.length;if(!n)return[];const mx=Math.max(1e-6,...P.map(p=>p.r));const ST=P.map(p=>{const c=(p.cs||[]).map(x=>({m:69+12*Math.log2(x.f/440),c:x.c})).filter(x=>x.m>=RANGE[0]-.5&&x.m<=RANGE[1]+.5);return c});
  const INF=1e9;let prev=[0],prevS=[null];const back=[];
  for(let i=0;i<n;i++){const quiet=P[i].r<mx*NX.lo;const st=[null,...ST[i]];const em=st.map(x=>x==null?(quiet?0:NX.eOff*(ST[i].length?Math.max(...ST[i].map(y=>y.c)):0)):(quiet?1:0)+(1-x.c));
   const cur=new Array(st.length).fill(INF),bk=new Array(st.length).fill(0);
   for(let a=0;a<prevS.length;a++){const pa=prevS[a];for(let b=0;b<st.length;b++){const pb=st[b];let tc;if(pa==null&&pb==null)tc=0;else if(pa==null||pb==null)tc=NX.tO;else{const dm=Math.abs(pa.m-pb.m);tc=dm<.6?NX.tS*dm:NX.tJ+NX.tS*Math.min(dm,12)}const v=prev[a]+tc+em[b];if(v<cur[b]){cur[b]=v;bk[b]=a}}}
   back.push({st,bk});prev=cur;prevS=st}
  let bi=0;for(let b=1;b<prev.length;b++)if(prev[b]<prev[bi])bi=b;const line=new Array(n),lc=new Float32Array(n);for(let i=n-1;i>=0;i--){const x=back[i].st[bi];line[i]=x?x.m:null;lc[i]=x?x.c:0;bi=back[i].bk[bi]}
  /* cut into notes: round with hysteresis, and start a new note on a clear re-attack */
  const on=new Set(onsets.map(t=>Math.round(t*50)));const notes=[];let cur=null,pend=null,pc=0;
  for(let i=0;i<n;i++){const x=line[i],t=P[i].t;if(x==null){if(cur){cur.e=t;notes.push(cur);cur=null}pend=null;pc=0;continue}
   if(!cur){cur={t,e:t,m:Math.round(x),r:P[i].r,sum:x,k:1};continue}
   const lo3=Math.min(...[1,2,3].map(q=>P[i-q]?P[i-q].r:1e9));const reat=(on.has(Math.round(t*50))&&t-cur.t>.09&&P[i].r>lo3*NX.ra)||(NX.dip&&t-cur.t>.09&&cur.mc>0&&Math.min(lc[i-1],lc[i-2]||1)<cur.mc*NX.dip&&lc[i]>cur.mc*NX.dip2&&lc[i]>lc[i-1]);
   if(Math.abs(x-cur.m)>NX.hy){const mm=Math.round(x);if(pend===mm)pc++;else{pend=mm;pc=1}if(pc>=NX.minF){/* the new note began when the pitch first moved */const st0=P[i-pc+1].t;cur.e=st0;notes.push(cur);cur={t:st0,e:t,m:mm,r:P[i].r,sum:x,k:1};pend=null;pc=0}continue}
   pend=null;pc=0;if(reat){cur.e=t;notes.push(cur);cur={t,e:t,m:Math.round(x),r:P[i].r,sum:x,k:1};continue}cur.e=t;cur.r=Math.max(cur.r,P[i].r);cur.mc=Math.max(cur.mc||0,lc[i])}
  if(cur)notes.push(cur);const rm=Math.max(1e-6,...notes.map(x=>x.r));
  return notes.filter(x=>x.e-x.t>=minDur&&x.m>=RANGE[0]&&x.m<=RANGE[1]).map(x=>({t:+x.t.toFixed(3),d:+Math.max(.06,x.e-x.t).toFixed(3),m:x.m,v:Math.round(50+70*Math.min(1,x.r/rm))}))}
 function salFrames(S,sr){const all=[];S.SAL.forEach(f=>f.cs.forEach(c=>all.push(c.s)));all.sort((a,b)=>a-b);const ref=all[Math.floor(all.length*.97)]||1;
  return S.SAL.map((f,i)=>({t:f.t,r:S.F.rms[i]||0,f:0,c:0,cs:f.cs.map(c=>({f:440*Math.pow(2,(c.m-69)/12),c:Math.min(1,c.s/ref)}))}))}
 /* bass: find each note's attack first (in the low-frequency energy), then give each note the pitch heard after its attack */
 function bassByOnsets(x,sr,P,RANGE){const hop=128,W=512;const k=1-Math.exp(-2*Math.PI*NX.bLp/sr);let a=0,b=0;const n=x.length,nf=Math.floor((n-W)/hop);if(nf<4)return[];const lp=new Float32Array(n);for(let i=0;i<n;i++){a+=(x[i]-a)*k;b+=(a-b)*k;lp[i]=b}
  const E=new Float32Array(nf);for(let f=0;f<nf;f++){let e=0;for(let i=0;i<W;i++){const v=lp[f*hop+i];e+=v*v}E[f]=Math.log(1e-9+e/W)}let emx=-1e9;for(let f=0;f<nf;f++)emx=Math.max(emx,E[f]);
  const D=new Float32Array(nf);for(let f=3;f<nf;f++)D[f]=Math.max(0,E[f]-Math.min(E[f-2],E[f-3]));const fps=sr/hop;
  const on=[];for(let f=2;f<nf-2;f++){if(D[f]>=NX.bRise&&D[f]>=D[f-1]&&D[f]>D[f+1]&&E[f+2]>emx-NX.bFloor){const t=(f*hop+W/2)/sr;if(on.length&&t-on[on.length-1].t<NX.bGap){if(D[f]>on[on.length-1].d)on[on.length-1]={t,d:D[f],f}}else on.push({t,d:D[f],f})}}
  const pAt=(t0,t1)=>{const w={};let tot=0;P.forEach(p=>{if(p.t<t0||p.t>t1||!p.cs||!p.cs.length)return;const c=p.cs[0];const m=Math.round(69+12*Math.log2(c.f/440));if(m<RANGE[0]||m>RANGE[1])return;w[m]=(w[m]||0)+c.c;tot+=c.c});let bm=null,bv=0;for(const m in w)if(w[m]>bv){bv=w[m];bm=+m}return bm!=null&&bv>=NX.bMinC?bm:null};
  const notes=[];on.forEach((o,i)=>{const nx=on[i+1]?on[i+1].t:n/sr;let end=nx;const pk=E[Math.min(nf-1,o.f+3)];for(let f=o.f+3;f<nf&&(f*hop+W/2)/sr<nx;f++){if(E[f]<pk-NX.bDecay){end=(f*hop+W/2)/sr;break}}
   const m=pAt(o.t+NX.bSkip,Math.max(o.t+NX.bSkip+.03,Math.min(end,o.t+.6)));if(m!=null&&end-o.t>=.05)notes.push({t:+(o.t+NX.bOff).toFixed(3),d:+(end-o.t).toFixed(3),m,v:Math.round(60+50*Math.min(1,Math.exp(pk-emx)))})});
  return notes}
 function notesFrom(P,onsets,minDur,RANGE=[24,100]){if(NX.v)return notesV(P,onsets,minDur,RANGE);const mx=Math.max(1e-6,...P.map(p=>p.r));const v=P.map(p=>p.f>0&&p.c>.6&&p.r>mx*.04?69+12*Math.log2(p.f/440):null);
  const m=v.map((x,i)=>{if(x==null)return null;const w=[];for(let j=i-2;j<=i+2;j++)if(v[j]!=null)w.push(v[j]);w.sort((a,b)=>a-b);return Math.round(w[w.length>>1])});
  const notes=[];let cur=null;const on=new Set(onsets.map(t=>Math.round(t*50)));
  P.forEach((p,i)=>{const x=m[i];const lo3=Math.min(...[1,2,3].map(q=>P[i-q]?P[i-q].r:1e9));const split=cur&&on.has(Math.round(p.t*50))&&p.t-cur.t>.09&&p.r>lo3*1.35;if(x==null||!cur||x!==cur.m||split){if(cur&&cur.e-cur.t>=minDur)notes.push(cur);cur=x==null?null:{t:p.t,e:p.t,m:x,r:p.r}}else{cur.e=p.t;cur.r=Math.max(cur.r,p.r)}});if(cur&&cur.e-cur.t>=minDur)notes.push(cur);
  const merged=[];notes.forEach(nn=>{const l=merged[merged.length-1];if(l&&l.m===nn.m&&nn.t-l.e<.04&&!on.has(Math.round(nn.t*50)))l.e=nn.e;else merged.push(nn)});
  const rm=Math.max(1e-6,...merged.map(x=>x.r));return merged.filter(x=>x.m>=(RANGE[0])&&x.m<=RANGE[1]).map(x=>({t:+x.t.toFixed(3),d:+Math.max(.06,x.e-x.t+.03).toFixed(3),m:x.m,v:Math.round(50+70*Math.min(1,x.r/rm))}))}
 function peaks(x,fps,thr,gap){const out=[];const n=x.length;for(let i=1;i<n-1;i++){let s=0,c=0;for(let j=Math.max(0,i-10);j<=Math.min(n-1,i+10);j++){s+=x[j];c++}const local=s/c;if(x[i]>x[i-1]&&x[i]>=x[i+1]&&x[i]>local*thr&&x[i]>0){const t=i/fps;if(!out.length||t-out[out.length-1]>gap)out.push(t)}}return out}
 /* --- chords from the chroma of the separated part --- */
 const CH=Object.assign({src:0,pw:1,pen:.3,rb:.2,bb:.3,peaks:1,dw:.8},self.CHO||{});const CH_SC=[],CH_LAB=[];
 const NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];const TPL={maj:[0,4,7],min:[0,3,7],'7':[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10],'5':[0,7],sus4:[0,5,7]};
 function chords(F,fps,bt){const out=[];CH_SC.length=0;if(!CH_LAB.length)for(let r=0;r<12;r++)for(const t in TPL)CH_LAB.push([r,t]);const B=bt.length>2?bt:[];for(let i=0;i<B.length-1;i++){const a=Math.floor(B[i]*fps),b=Math.max(a+1,Math.floor(B[i+1]*fps));const c=new Float32Array(12),bc=new Float32Array(12);let en=0;for(let f=a;f<b&&f<F.chroma.length;f++){for(let k=0;k<12;k++){c[k]+=F.chroma[f][k];bc[k]+=F.bchroma[f][k];en+=F.chroma[f][k]}}
   if(CH.bb){const bm=Math.max(...bc),cm=Math.max(...c);if(bm>0&&cm>0)for(let k=0;k<12;k++)c[k]+=CH.bb*cm*bc[k]/bm}const mx=Math.max(...c);if(!(mx>0)){out.push({t:B[i],d:B[i+1]-B[i],name:'N'});CH_SC.push(new Array(84).fill(0));continue}for(let k=0;k<12;k++)c[k]=Math.sqrt(c[k]/mx);const broot=bc.indexOf(Math.max(...bc));let best=-1,bn='N',br=0,bt_='maj';
   const scs=[];for(let r=0;r<12;r++)for(const t in TPL){const T=TPL[t];let s=0;for(let k=0;k<12;k++){const inn=T.includes((k-r+12)%12);s+=inn?c[k]:-.55*c[k]}s/=T.length;if(t==='5')s*=.85;if(t==='7'||t==='maj7'||t==='m7')s*=.97;if(t==='sus4')s*=.9;if(r===broot&&Math.max(...bc)>0)s+=CH.rb;scs.push(s);if(s>best){best=s;br=r;bt_=t}}CH_SC.push(scs);
   out.push({t:+B[i].toFixed(3),d:+(B[i+1]-B[i]).toFixed(3),root:br,type:bt_,name:NAMES[br]+(bt_==='maj'?'':bt_==='min'?'m':bt_),en})}
  if(CH.pen&&out.length>2&&CH_SC.length===out.length){/* smooth: changing chord costs something, so one odd beat doesn't flip it */const K=CH_SC[0].length;let cost=CH_SC[0].map(v=>-v),bk=[];
   for(let i=1;i<out.length;i++){let bi=0;for(let k=1;k<K;k++)if(cost[k]<cost[bi])bi=k;const nc=new Array(K),b=new Array(K);for(let k=0;k<K;k++){const stay=cost[k],mv=cost[bi]+CH.pen;if(stay<=mv){nc[k]=stay-CH_SC[i][k];b[k]=k}else{nc[k]=mv-CH_SC[i][k];b[k]=bi}}cost=nc;bk.push(b)}
   let k=0;for(let q=1;q<cost.length;q++)if(cost[q]<cost[k])k=q;for(let i=out.length-1;i>=0;i--){const lab=CH_LAB[k];if(out[i].name!=='N'||out[i].en){out[i].root=lab[0];out[i].type=lab[1];out[i].name=NAMES[lab[0]]+(lab[1]==='maj'?'':lab[1]==='min'?'m':lab[1])}if(i>0)k=bk[i-1][k]}}
  const em=Math.max(1e-9,...out.map(x=>x.en||0));/* quiet beats: a fading chord keeps its name; only near-silence is 'no chord' */let prev=null;out.forEach(x=>{const e=x.en||0;if(e<em*.012||(e<em*.06&&!prev))x.name='N';else if(e<em*.06&&prev){x.name=prev.name;x.root=prev.root;x.type=prev.type}prev=x.name==='N'?null:x});return out}
 /* --- drum hits from the separated drums --- */
 function drums(F,fps){/* each drum is found in its own frequency band, then checked against the others */
  const n=F.bands.length;const band=(i,b)=>F.bands[i]?Math.sqrt(F.bands[i][b]):0;const sum=(i,bs)=>bs.reduce((s,b)=>s+band(i,b),0);
  const nov=bs=>{const x=new Float32Array(n);for(let i=2;i<n;i++){const v=sum(i,bs),p=Math.max(sum(i-1,bs),sum(i-2,bs));x[i]=Math.max(0,v-p)}return x};
  const pk=(x,rel,gap,lf)=>{const c=[];for(let i=1;i<n-1;i++){if(x[i]>x[i-1]&&x[i]>=x[i+1]&&x[i]>0){let s=0,q=0;for(let j=Math.max(0,i-12);j<=Math.min(n-1,i+12);j++){s+=x[j];q++}if(x[i]>s/q*(lf||1.4))c.push(i)}}
   const vals=c.map(i=>x[i]).sort((a,b)=>a-b);const p95=vals[Math.floor(vals.length*.95)]||0,md=vals[vals.length>>1]||0;const out=[];c.forEach(i=>{if(x[i]>=p95*rel&&(x[i]>=md*(rel>.3?1.3:DR.hm)||x[i]>=p95*DR.top)){if(out.length&&i-out[out.length-1]<gap*fps){if(x[i]>x[out[out.length-1]])out[out.length-1]=i}else out.push(i)}});return{idx:out,p95,md}};
  const K=nov([0]),Sn=nov(DR.sb),Hh=nov([4]);const kk=pk(K,DR.k,.07),ss=pk(Sn,DR.s,.07),hh=pk(Hh,DR.h,.05,DR.hl);const hits=[];const T=i=>+(i/fps+DR.off).toFixed(3);
  kk.idx.forEach(i=>{const lo=band(i,0),lm=band(i,1);if(lo>lm*DR.kr)hits.push({t:T(i),k:'kick',v:Math.round(60+60*Math.min(1,K[i]/(kk.p95||1)))})});
  ss.idx.forEach(i=>hits.push({t:T(i),k:'snare',v:Math.round(60+60*Math.min(1,Sn[i]/(ss.p95||1)))}));
  hh.idx.forEach(i=>hits.push({t:T(i),k:'hat',v:Math.round(50+60*Math.min(1,Hh[i]/(hh.p95||1)))}));
  return hits.sort((a,b)=>a.t-b.t)}
 const DR=Object.assign({k:.3,s:.7,h:.15,kr:1.5,off:0,marg:1,sb:[3,4],hl:1.4,hm:0,top:.7},self.DRO||{});const DR0=Object.assign({},DR);
 self.onmessage=e=>{const{L,R,sr,part,pre}=e.data;try{Object.assign(DR,DR0);const TS=22050;post({p:.02,msg:'Preparing the audio…'});let l=resample(L,sr,TS),r=R?resample(R,sr,TS):l;
  /* pre: this part already separated by the AI model (desktop app) */const opt={};if(pre){const ps=pre.sr||sr;const pl=resample(pre.L,ps,TS),pr=pre.R?resample(pre.R,ps,TS):pl;if(part==='drums'){l=pl;r=pr;/* a clean drum track: hats and kicks stand out more */Object.assign(DR,{kr:1,h:.08,hl:1.2},self.DRO||{})}else opt.pre=[pl,pr]}
  if(part==='vocals'){if(!pre)opt.bassF0=bassTrack(l,r,TS);if(VX.sal)opt.sal=[45,86]}if(part==='bass'&&VX.bsal)opt.sal=[26,66,VX.bnh,VX.bhd];const S=separate(l,r,TS,part,opt&&(p=>post({p:.05+p*.6,msg:'Separating the '+({vocals:'vocals',drums:'drums',bass:'bass',other:'guitar and keys'}[part])+'…'})),opt);const fps=TS/S.H;
  post({p:.68,msg:'Finding the beat…'});const BT=beats(S.F.flux,fps,S.F);
  let notes=[],ch=[],hits=[];
  if(part==='drums'){post({p:.75,msg:'Finding the drum hits…'});hits=drums(S.F,fps)}
  else{post({p:.72,msg:'Working out the notes…'});NX.ra=part==='vocals'?NX.raV:NX.raB;const P=(part==='vocals'||part==='bass')&&S.SAL.length?salFrames(S,TS):part==='bass'?yinDs(S.stem,TS,256,1536,35,400,4):yinDs(S.stem,TS,256,1024,part==='vocals'?VX.fmin:70,part==='vocals'?1100:1300,2);
   const ons=peaks(S.F.sflux,fps,part==='bass'?NX.obB:NX.obV,.07);notes=part==='bass'&&NX.bOn&&P.length&&P[0].cs?bassByOnsets(S.stem,TS,P,[23,67]):notesFrom(P,ons,part==='bass'?.08:.07,part==='bass'?[23,67]:part==='vocals'?[43,88]:[38,96]);if(part==='vocals')notes.forEach(x=>{x.t=+Math.max(0,x.t-NX.vsh).toFixed(3)});if(part==='bass'){/* a kick drum's low thump is often heard as a short, very low bass note: drop it and let the real note start on time */
    const kicks=drums(S.F,fps).filter(h=>h.k==='kick').map(h=>h.t-DR.off);
    const keep=[];notes.forEach((x,i)=>{const nx=notes[i+1];const onK=kicks.some(k=>Math.abs(k-x.t)<.11);if(onK&&x.d<.32&&nx&&nx.m-x.m>=7&&nx.t-(x.t+x.d)<.08){nx.d=+(nx.d+(nx.t-x.t)).toFixed(3);nx.t=x.t;return}keep.push(x)});notes=keep;/* a bass note that starts with the kick: its true start is the kick, not where the thump fades */if(NX.snapK)notes.forEach(x=>{const k=kicks.filter(k=>k<=x.t-.015&&k>=x.t-NX.snapK).pop();if(k!=null){x.d=+(x.d+x.t-k).toFixed(3);x.t=+k.toFixed(3)}})}if(part==='other'){post({p:.9,msg:'Working out the chords…'});ch=chords(S.F,fps,BT.beats)}}
  post({done:true,stem:S.stem,rest:S.rest,sr:TS,bpm:BT.bpm,beats:BT.beats,notes,chords:ch,hits},[S.stem.buffer,S.rest.buffer])}catch(err){post({error:String(err&&err.message||err)})}};
}

