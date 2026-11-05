# Reference separator in numpy: the same chunking, transforms and crossfades as src-tauri/src/sepcore.rs.
import numpy as np,onnxruntime as ort,time,sys,wave
NF=4096;HOP=1024;CH=485100;PAD=1300;L=CH+PAD;T=L//HOP+1;FR=NF//2+1
def stft(x):  # x: (L,) rectangular window, center reflect, normalized
    xp=np.pad(x,(NF//2,NF//2),mode='reflect');idx=np.arange(T)[:,None]*HOP+np.arange(NF)[None,:]
    return np.fft.rfft(xp[idx],axis=1).T/np.sqrt(NF)   # (F,T)
def istft(S,n):
    fr=np.fft.irfft(S.T*np.sqrt(NF),n=NF,axis=1)  # (T,NF)
    out=np.zeros((T-1)*HOP+NF);ws=np.zeros_like(out)
    for t in range(T): out[t*HOP:t*HOP+NF]+=fr[t];ws[t*HOP:t*HOP+NF]+=1
    out=out/np.maximum(ws,1e-8);return out[NF//2:NF//2+n]
def run_chunk(s,x):  # x (2,CH)
    xp=np.pad(x,((0,0),(0,PAD)))
    spec=np.zeros((1,4,FR,T),np.float32)
    for c in range(2):
        S=stft(xp[c]);spec[0,2*c]=S.real;spec[0,2*c+1]=S.imag
    y=s.run(None,{'spec':spec})[0][0]   # (16,F,T)
    out=np.zeros((4,2,CH),np.float32)
    for k in range(4):
        for c in range(2):
            S=y[k*4+c*2]+1j*y[k*4+c*2+1];out[k,c]=istft(S,L)[:CH]
    return out
def separate(s,mix,overlap=2):
    n=mix.shape[1];step=CH//overlap;fade=CH//10
    w=np.ones(CH,np.float32);w[:fade]=np.linspace(0,1,fade);w[-fade:]=np.linspace(1,0,fade)
    border=CH-step;xp=np.pad(mix,((0,0),(border,border)),mode='reflect') if n>border else np.pad(mix,((0,0),(border,border)))
    N=xp.shape[1];res=np.zeros((4,2,N),np.float32);cnt=np.zeros(N,np.float32);i=0
    while i<N:
        part=xp[:,i:i+CH];ln=part.shape[1]
        if ln<CH: part=np.pad(part,((0,0),(0,CH-ln)))
        o=run_chunk(s,part);ww=w.copy()
        if i==0: ww[:fade]=1
        if i+step>=N: ww[-fade:]=1
        res[:,:,i:i+ln]+=o[:,:,:ln]*ww[:ln];cnt[i:i+ln]+=ww[:ln];i+=step
    return (res/np.maximum(cnt,1e-8))[:,:,border:border+n]
if __name__=='__main__':
    def rwav(p):
        w=wave.open(p);return (np.frombuffer(w.readframes(w.getnframes()),np.int16).reshape(-1,w.getnchannels()).T/32768.).astype(np.float32)
    D='/tmp/claude-0/v48/data/mu/';mix=rwav(D+'mixture.wav')
    s=ort.InferenceSession('/tmp/claude-0/v57/sc/scnet_small.onnx',providers=['CPUExecutionProvider'])
    t=time.time();y=separate(s,mix);print('time',time.time()-t)
    src=['drums','bass','other','vocals']
    sdr=lambda r,e:10*np.log10((r**2).sum()/((r-e)**2).sum())
    print({k:round(float(sdr(rwav(D+k+'.wav'),y[i])),2) for i,k in enumerate(src)})
    ref=np.load('/tmp/claude-0/v57/sc/out_small.npy');print('vs torch full-model SDR',{k:round(float(sdr(ref[i],y[i])),1) for i,k in enumerate(src)})
