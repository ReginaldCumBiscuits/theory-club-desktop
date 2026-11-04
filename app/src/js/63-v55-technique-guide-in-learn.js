/* v55: the technique guide in Learn. Every technique from the course for your instrument, stage by
   stage, with the same explanations, videos, diagrams and ticks as the course pages; searchable,
   linked from Learn's topic list, the instrument lessons, the Learn tabs and the search box. */
function ctxTotal(inst){let g=0,t=0;for(const n in CTX[inst]||{}){const[a,b]=ctxCount(inst,+n);g+=a;t+=b}return`${g} of ${t} ticked`}
function techGuideHTML(){const inst=cInst(),d=cData(),now=stageNow();
 const stages=Object.keys(CTX[inst]||{}).map(Number).sort((a,b)=>a-b);
 return`<div class="tguide"><h2>Technique guide</h2>
 <p class="lede">Every technique in your course, from your first day to college level. Open one to see how to do it, what it should feel like, the usual mistake, how to check yourself, and a video to watch. <span class="hint ctxtot">${ctxTotal(inst)}</span></p>
 <div class="tgtools"><label class="tgsearch"><span class="sr">Search techniques</span><input type="search" id="tgq" placeholder="Search techniques, e.g. grip, vibrato, pedal" autocomplete="off"></label>
 <nav class="pills tgjump" aria-label="Stages">${stages.map(n=>`<a class="pill" href="#learn-technique-${n}"${n===now?' aria-current="step"':''}>Stage ${n}</a>`).join('')}</nav></div>
 <p class="hint" id="tgnone" hidden>No techniques match that search.</p>
 ${stages.map(n=>{const S=COURSE.stages[n-1],X=d.stages[n],[g,t]=ctxCount(inst,n);return`<section class="panel tgst" id="tg-${n}" data-n="${n}"><h3>Stage ${n}: ${esc(S.title)} ${n===now?'<span class="tgnow">You are here</span>':''} <span class="hint ctxc">${g} of ${t} ticked</span></h3>
  <div class="ctxl">${X.tech.map((nm,i)=>ctxItemHTML(inst,n,i,nm)).join('')}</div>
  <p class="hint"><a href="#course-${n}">Open stage ${n} of the course</a></p></section>`}).join('')}</div>`}
function techGuideBind(){const q=main.querySelector('#tgq');if(!q)return;ctxBind(main);
 q.oninput=()=>{const w=q.value.toLowerCase().trim().split(/\s+/).filter(Boolean);let any=0;
  main.querySelectorAll('.tgst').forEach(s=>{let vis=0;s.querySelectorAll('.ctx').forEach(d=>{const ok=!w.length||w.every(x=>d.textContent.toLowerCase().includes(x));d.hidden=!ok;if(ok)vis++});s.hidden=!vis;any+=vis});
  main.querySelector('#tgnone').hidden=!!any}}
/* Learn: the guide lives in the Learn layout, under its own group in the topic list */
{const _vl=viewLearn;viewLearn=function(id){const m=/^technique(?:-(\d+)(?:-(\d+))?)?$/.exec(id||'');if(!m||!CTX[cInst()]){_vl(id);return addGuideLinks()}
 _vl(INST_PRI[INST_RAW()]?.[0]||id);const lb=main.querySelector('#lb'),lm=main.querySelector('.lmain');if(!lb||!lm){main.innerHTML=techGuideHTML()}else{lm.innerHTML=techGuideHTML()}
 addGuideLinks();main.querySelectorAll('.lnav a').forEach(a=>{if(a.getAttribute('href')==='#learn-technique')a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});techGuideBind();
 const n=m[1]&&+m[1],i=m[2]!=null?+m[2]:null;if(n&&i!=null)ctxOpen(0,`.ctx[data-id="${cInst()}-${n}-${i}"]`);else if(n){const s=main.querySelector('#tg-'+n);if(s)setTimeout(()=>s.scrollIntoView({block:'start'}),40)}}}
function addGuideLinks(){if(!CTX[cInst()])return;const nav=main.querySelector('.lnav');if(nav&&!nav.querySelector('[href="#learn-technique"]'))nav.insertAdjacentHTML('afterbegin','<span class="lgrp">Technique</span><a href="#learn-technique">Technique guide</a>');
 const lb=main.querySelector('#lb');const h=location.hash.slice(7);if(lb&&instLearn().some(l=>l[0]===h)&&!main.querySelector('.tglink')){lb.insertAdjacentHTML('afterbegin',`<a class="tglink" href="#learn-technique"><b>Technique guide</b><span>Every technique in your course, step by step, with videos and diagrams. ${esc(ctxTotal(cInst()))}.</span><span aria-hidden="true">→</span></a>`)}}
/* the Learn tabs and the search box */
NAV_SUB.course.splice(2,0,['learn-technique','Techniques']);
{const _ci=cmdIndex;cmdIndex=function(){const out=_ci();try{const inst=cInst(),d=cData();for(const n in CTX[inst]||{}){d.stages[n].tech.forEach((nm,i)=>out.push({t:nm,h:`#learn-technique-${n}-${i}`,k:(nm+' technique stage '+n+' how to').toLowerCase(),g:'Technique'}))}out.push({t:'Technique guide',h:'#learn-technique',k:'technique guide techniques how to video',g:'Learn'})}catch(e){}return out}}
