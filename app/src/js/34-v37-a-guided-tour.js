/* ================= v37: a guided tour ================= */
const TOUR=[
 {t:'Welcome to Theory Club',b:'A one-minute look around so you know where everything lives. You can skip at any point and replay it from Settings.'},
 {sel:['#sidebar nav a[href="#home"]','#tabbar a[data-tb="home"]'],t:'Today',b:'Press Start today’s practice and the app takes you through a short session built from your course stage, aimed at what you find hard.'},
 {sel:['#sidebar nav a[href="#course"]','#tabbar a[data-tb="course"]'],t:'Learn',b:'Your course, stage by stage: goals to tick, an animated demo with Check me, checkpoint quizzes and every lesson.'},
 {sel:['#sidebar nav a[href="#play"]','#tabbar a[data-tb="play"]'],t:'Play',b:'Songs and play-alongs, the song transcriber, jamming with a band or friends, and tools like the chord finder.'},
 {sel:['#sidebar nav a[href="#progress"]','#tabbar a[data-tb="progress"]'],t:'You',b:'Your practice charts, notes, recordings and backups.'},
 {sel:['#ptbtn'],t:'Practice timer',b:'Time you practise counts towards your course stage. It can count only while it hears you play.'},
 {sel:['#inbtn'],t:'Connect your instrument',b:'Plug in or use the microphone. Then the app can hear you: Check me, Score my playing, the tuner and ear training all use it. Headphones help.'},
 {sel:['#cmdbtn'],t:'Search',b:'Find any lesson, song or tool by name. On a computer, press ⌘K or Ctrl+K.'},
 {sel:['#setbtn'],t:'Settings',b:'Switch instrument, set a practice reminder, change sounds and theme, back up your progress, and replay this tour.'},
 {t:'You’re ready',b:'A good first step: press Start today’s practice on the Today page.',end:true}];
function tourVisible(el){if(!el)return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1&&getComputedStyle(el).visibility!=='hidden'}
function startTour(){if(document.getElementById('tour'))return;closeSidebar&&closeSidebar();let i=0;
 const ov=document.createElement('div');ov.id='tour';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','tourt');ov.innerHTML='<div class="thole"></div><div class="tbub"></div>';document.body.appendChild(ov);
 const hole=ov.querySelector('.thole'),bub=ov.querySelector('.tbub');
 const done=()=>{store.set('toured',true);ov.remove();removeEventListener('resize',draw);removeEventListener('keydown',key,true);const hc=document.querySelector('.tourc');if(hc)hc.remove()};
 const target=S=>{let el=null;for(const q of S.sel||[]){const e=document.querySelector(q);if(tourVisible(e)){el=e;break}}let viaMore=false;if(!el&&S.sel){const m=document.querySelector('#tbmore');if(tourVisible(m)){el=m;viaMore=true}}return{el,viaMore}};
 function draw(){const S=TOUR[i];const{el,viaMore}=target(S);const last=i===TOUR.length-1;
  bub.innerHTML=`<span class="eyebrow">${i+1} of ${TOUR.length}</span><h3 id="tourt">${esc(S.t)}</h3><p>${esc(S.b)}${viaMore?` <b>On a phone it’s under More.</b>`:''}</p>
   <div class="row" style="justify-content:space-between"><button class="btn small tskip">${last?'Close':'Skip tour'}</button><div class="row" style="gap:8px">${i?'<button class="btn small tback">Back</button>':''}${last?`<a class="btn small" href="#daily" data-go>Daily challenge</a><a class="btn primary small" href="#journey" data-go>Start the Journey</a>`:`<button class="btn primary small tnext">${i===0?'Show me':'Next'}</button>`}</div></div>`;
  if(el){const r=el.getBoundingClientRect(),pad=6;hole.style.cssText=`left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px`;hole.classList.remove('none');
   const bw=Math.min(340,innerWidth-24);bub.style.width=bw+'px';const bh=bub.offsetHeight||180;let x,y;
   if(r.right+16+bw<innerWidth&&r.left<innerWidth/2){x=r.right+16;y=Math.max(12,Math.min(innerHeight-bh-12,r.top+r.height/2-bh/2))}
   else{x=Math.max(12,Math.min(innerWidth-bw-12,r.left+r.width/2-bw/2));y=r.bottom+14+bh<innerHeight?r.bottom+14:Math.max(12,r.top-14-bh)}
   bub.style.left=x+'px';bub.style.top=y+'px';bub.classList.remove('center')}
  else{hole.classList.add('none');hole.style.cssText='';bub.style.width='';bub.style.left='';bub.style.top='';bub.classList.add('center')}
  const n=bub.querySelector('.tnext');if(n){n.onclick=()=>{i++;draw()};n.focus()}const b=bub.querySelector('.tback');if(b)b.onclick=()=>{i--;draw()};bub.querySelector('.tskip').onclick=done;bub.querySelectorAll('[data-go]').forEach(a=>a.addEventListener('click',done))}
 const key=e=>{if(e.key==='Escape'){e.preventDefault();done()}else if(e.key==='ArrowRight'&&i<TOUR.length-1){e.preventDefault();i++;draw()}else if(e.key==='ArrowLeft'&&i>0){e.preventDefault();i--;draw()}};
 addEventListener('resize',draw);addEventListener('keydown',key,true);draw()}
/* offer it: right after the welcome questions, and once on Home for people who never saw it */


