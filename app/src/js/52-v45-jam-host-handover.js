/* ================= v45: jam host handover ================= */
function joRejoin(code,asHost,sess,okMsg,tries,delay){let n=0;const go=()=>{if(JO.status==='in'){JREC.retrying=false;return}if(asHost&&sess)JO.sess=sess;
  joOpen(asHost,code).then(()=>{JREC.retrying=false;JO.err=okMsg||'';joRender()}).catch(()=>{n++;if(n<tries){JO.err=asHost?`Taking over the room (try ${n+1} of ${tries})…`:`Reconnecting (try ${n+1} of ${tries})…`;JO.status='idle';joRender();setTimeout(go,delay)}else{JREC.retrying=false;JO.status='idle';JO.err='Couldn\'t get back into the room. Ask for the room code and join again.';joRender()}})};return go}
{const _jm=joMsg;joMsg=function(from,d){if(d&&d.k==='handover'&&!JO.host){const code=JO.code,me=JO.me.id,mine=d.to===me;JREC.retrying=true;const keep=JO.sess;JO.err='';_joLeaveRaw(true);JO.err=mine?'The host left, so you\'re hosting now. Getting the room ready…':`The host left. ${String(d.name||'Another player').slice(0,24)} is hosting now. Reconnecting…`;joRender();
  setTimeout(joRejoin(code,mine,mine?Object.assign({},keep||{},d.sess||{},{playing:false}):null,mine?'You\'re hosting this room now. Everyone is reconnecting to you.':'',mine?8:10,mine?2500:3000),mine?800:3000);return}_jm(from,d)}}
let _joLeaveRaw=null;
{const _jl=joLeave;_joLeaveRaw=q=>_jl(q);joLeave=function(quiet){
 /* the host leaves on purpose: hand the room to the next player instead of closing it */
 if(JO.host&&!quiet&&JO.link&&JO.status==='in'){const others=(JO.roster||[]).filter(r=>r.id!==JO.me.id);if(others.length){const nh=others[0];others.forEach(r=>{try{JO.link.send(r.id,{k:'handover',to:nh.id,name:nh.name,sess:Object.assign({},JO.sess,{playing:false})})}catch(e){}});const send=JO.link.send;JO.link.send=(to,d)=>{if(d&&d.k==='end')return;send(to,d)}}}
 /* the host drops out without warning: the remaining players agree on a new host (the lowest id) */
 const lost=!!quiet&&!JO.host&&/Lost the connection to the host/.test(JO.err||'');if(lost&&JO.code&&!JREC.retrying){const code=JO.code,me=JO.me.id,hostId=JO.hostId,sess=JO.sess;const cands=(JO.roster||[]).filter(r=>r.id!==hostId).map(r=>r.id).sort();
  if(cands.length>1){JREC.retrying=true;const r=_jl.apply(this,arguments);const mine=cands[0]===me;const nm=((JO.roster||[]).find(x=>x.id===cands[0])||{}).name;JO.err=mine?'The host dropped out, so you\'re taking over the room…':'The host dropped out. Waiting for the next player to take over…';joRender();
   setTimeout(joRejoin(code,mine,mine?Object.assign({},sess||{},{playing:false}):null,mine?'You\'re hosting this room now.':'',mine?20:24,5000),mine?1500:6000);return r}}
 return _jl.apply(this,arguments)}}
