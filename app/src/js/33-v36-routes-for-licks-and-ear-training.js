/* ================= v36: routes for licks and ear training ================= */
NAV_SUB.train.splice(5,0,['licks','Licks'],['ear','Ear training']);

{const _sub=navSubHTML;navSubHTML=function(h){return _sub(h&&h.startsWith('lick-')?'licks':h)}}
{const _r=route;route=function(){const h=location.hash.slice(1)||'home';if(h==='licks'||h==='ear'||h.startsWith('lick-')){stopSeq();stopLoop();stopDemo();QUIZ=null;clearInterval(WU_T);focusOff();renderChrome(h);if(h==='licks')viewLicks();else if(h==='ear')viewEar();else viewLick(h.slice(5));navAddSub();return}_r()}}
{const _vt=viewTrain;viewTrain=function(){_vt();const g=main.querySelector('.hgrid');if(!g)return;const li=lickInst();const L=li?LICKLIB[li]:[];const S=lickStore();const n=L.filter(l=>S[l.id]&&S[l.id].learned).length;
 g.insertAdjacentHTML('beforeend',`${li?`<a class="hcard" href="#licks"><span class="eyebrow">Licks</span><b>${n?`${n} of ${L.length} learned`:`${L.length} licks to learn`}</b><span class="hint">Any key, with a band.</span></a>`:''}${earInst()?`<a class="hcard" href="#ear"><span class="eyebrow">Ear training</span><b>Hear it, play it</b><span class="hint">The app plays, you play it back.</span></a>`:''}`)}}

