/* ================= v46: automatic updates in the desktop app ================= */
/* On every launch the app asks GitHub for the newest version straight away. If one is found in the first minute,
   it installs and restarts after a short countdown (unless you're mid-jam). Found later, it installs when you close the app. */
const UPD_T0=Date.now();
function updAuto(){return store.get('autoUpd',true)!==false}
function updBusy(){try{if(JO.status==='in')return true}catch(e){}if([...document.querySelectorAll('audio,video')].some(a=>!a.paused))return true;return /^#(tools-isolate|tools-online)/.test(location.hash)&&!!document.querySelector('.tsvp')}
function updCountdown(){if(document.getElementById('updov'))return;let n=6;const ov=document.createElement('div');ov.id='updov';ov.className='wnov';ov.setAttribute('role','alertdialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','updovt');ov.setAttribute('aria-describedby','updovd');
 ov.innerHTML=`<div class="wnbox panel"><span class="eyebrow">Update</span><h2 id="updovt">Updating to Theory Club ${esc(UPD.info.version)}</h2><p id="updovd" aria-live="polite">Theory Club will restart in <b id="updn">${n}</b> seconds. Your progress is kept.</p><div class="row"><button class="btn primary" id="updovgo">Restart now</button><button class="btn" id="updovno">Not now</button></div></div>`;
 document.body.appendChild(ov);const go=()=>{clearInterval(tm);ov.remove();updInstall()};const tm=setInterval(()=>{n--;const el=document.getElementById('updn');if(el)el.textContent=n;if(n<=0)go()},1000);
 ov.querySelector('#updovgo').onclick=go;ov.querySelector('#updovno').onclick=()=>{clearInterval(tm);ov.remove();UPD.dismissed=false;updBanner()};ov.querySelector('#updovno').focus()}
{const _b=updBanner;updBanner=function(){_b();const b=document.getElementById('updbar');if(!b||!updAuto())return;const s=b.querySelector('span');if(s&&!/when you close/.test(s.textContent))s.insertAdjacentHTML('beforeend',' <span class="hint">Or it installs by itself when you close Theory Club.</span>')}}
{const _c=updCheck;updCheck=async function(manual){await _c(manual);if(UPD.state==='ready'&&updAuto()&&!manual&&Date.now()-UPD_T0<60e3&&!updBusy())updCountdown()}}
{const _s=updSettings;updSettings=function(){_s();const el=document.getElementById('updset');if(!el||el.querySelector('#updauto'))return;
 el.insertAdjacentHTML('beforeend',`<label class="row" style="gap:8px;margin-top:10px;align-items:center"><input type="checkbox" id="updauto" ${updAuto()?'checked':''}> <span>Update automatically <span class="hint">(checks GitHub each time you open the app)</span></span></label>`);
 el.querySelector('#updauto').onchange=e=>{store.set('autoUpd',e.target.checked);natCall('update_auto',{on:e.target.checked}).catch(()=>{});updBanner()}}}
if(TAU){natCall('update_auto',{on:updAuto()}).catch(()=>{});setTimeout(()=>updCheck(false),1500)}
Object.assign(window,{updCountdown,updAuto});

