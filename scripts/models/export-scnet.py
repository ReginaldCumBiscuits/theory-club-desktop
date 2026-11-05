# Exports SCNet (ZFTurbo's Music-Source-Separation-Training) to ONNX for the desktop app's separator.
# Usage: python export-scnet.py small config_musdb18_scnet.yaml scnet_checkpoint_musdb18.ckpt
# Needs torch, onnx, onnxruntime, pyyaml, einops and a checkout of Music-Source-Separation-Training (path below).
import sys,yaml,torch,numpy as np,time,math
from collections import deque
sys.path.insert(0,'/tmp/claude-0/v57/msst')
from models.scnet import SCNet
import models.scnet.separation as sep
torch.set_num_threads(2)
name,cfg,ck=sys.argv[1],sys.argv[2],sys.argv[3]
c=yaml.unsafe_load(open(cfg));m=SCNet(**c['model']);sd=torch.load(ck,map_location='cpu',weights_only=False)
sd=sd.get('state',sd) if isinstance(sd,dict) else sd;m.load_state_dict(sd);m.eval()
CH=int(sys.argv[4]) if len(sys.argv)>4 else int(c['audio']['chunk_size']);hop=c['model']['hop_size'];nfft=c['model']['nfft']
pad=hop-CH%hop
if (CH+pad)//hop%2==0: pad+=hop
L=CH+pad;T=L//hop+1;Fr=nfft//2+1
print('chunk',CH,'pad',pad,'T',T,'F',Fr)
# exact real-matrix DFT along the last axis instead of torch.fft (ONNX friendly)
import numpy as _np
def fc_forward(self,x):
    n=int(x.shape[3])
    if self.inverse:
        k=n;N=2*(k-1);kk=_np.arange(k)[:,None];nn_=_np.arange(N)[None,:];w=_np.ones(k);w[1:-1]=2
        C=torch.from_numpy((w[:,None]*_np.cos(2*_np.pi*kk*nn_/N)/_np.sqrt(N)).astype(_np.float32))
        S=torch.from_numpy((-w[:,None]*_np.sin(2*_np.pi*kk*nn_/N)/_np.sqrt(N)).astype(_np.float32))
        xr=x[:,:self.channels//2];xi=x[:,self.channels//2:]
        return torch.matmul(xr,C)+torch.matmul(xi,S)
    k=n//2+1;nn_=_np.arange(n)[:,None];kk=_np.arange(k)[None,:]
    C=torch.from_numpy((_np.cos(2*_np.pi*nn_*kk/n)/_np.sqrt(n)).astype(_np.float32));S=torch.from_numpy((-_np.sin(2*_np.pi*nn_*kk/n)/_np.sqrt(n)).astype(_np.float32))
    return torch.cat([torch.matmul(x,C),torch.matmul(x,S)],dim=1)
class Core(torch.nn.Module):
    def __init__(s,m):super().__init__();s.m=m
    def forward(s,x):
        m=s.m;B,C,Fr,T=x.shape;skips=[];lens=[];olens=[]
        for sd_ in m.encoder:
            x,skip,l,ol=sd_(x);skips.append(skip);lens.append(l);olens.append(ol)
        x=m.separation_net(x)
        for fus,su in m.decoder:
            x=fus(x,skips.pop());x=su(x,lens.pop(),olens.pop())
        return x
core=Core(m).eval()
torch.manual_seed(0);spec=torch.randn(1,4,Fr,T)*0.1
with torch.no_grad(): ref=core(spec) if name!='xl' else None
sep.FeatureConversion.forward=fc_forward
with torch.no_grad(): alt=core(spec) if name!='xl' else None
if ref is not None: print('matrix-DFT vs fft max diff',float((ref-alt).abs().max()),'out',tuple(alt.shape))
out=f'/tmp/claude-0/v57/sc/scnet_{name}.onnx'
with torch.no_grad(): torch.onnx.export(core,(spec,),out,input_names=['spec'],output_names=['out'],opset_version=17,dynamo=False,do_constant_folding=(name!='xl'))
import onnxruntime as ort
s=ort.InferenceSession(out,providers=['CPUExecutionProvider'])
t=time.time();o=s.run(None,{'spec':spec.numpy()})[0];dt=time.time()-t
print('onnx' if ref is None else float(np.abs(o-ref.numpy()).max()),'ort time %.2fs per %.1fs chunk'%(dt,CH/44100))
import os;print('size MB',os.path.getsize(out)/1e6)
