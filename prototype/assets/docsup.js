/* Staff self-service: upload address proof and passport-size photograph.
   Shown to field engineers, District Sales Managers and Circle Managers until both are on file. */
(function(){
var BA=window.BA,FV=window.FV;if(!BA||!FV||!FV.dir)return;
var ROLES=['field','dsm','circle'],PROOFS=['Aadhaar card','Passport','Voter ID','Driving licence'];
function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function me(){var s=BA.jget('ba3_staff',null);if(!s||!s.id)return null;return FV.get(s.id)||null}
function need(m){return !!m&&ROLES.indexOf(m.role)>-1&&m.docsPending===true}
function bar(){var m=me();var old=document.getElementById('docbar');if(old)old.remove();if(!need(m))return;
 var d=document.createElement('div');d.id='docbar';d.className='docbar';
 d.innerHTML='<b>Finish joining:</b> please upload your address proof (Aadhaar card or passport) and a passport-size photograph. <button class="btn sm" id="docgo">Upload now</button>';
 var h=document.querySelector('.sthd');if(h&&h.parentNode)h.parentNode.insertBefore(d,h.nextSibling);else document.body.prepend(d);
 document.getElementById('docgo').onclick=function(){open(m)}}
function open(m){
 var photo=null,files=[];
 BA.box('<h3>Upload your documents</h3><p style="color:var(--mute);font-size:14px;margin:0 0 10px">We need one address proof and one passport-size photograph. Pictures or PDF, up to 6 MB each. Only the scans are kept, not the number.</p>'+
 '<label class="form" style="max-width:none">Type of proof<select id="dpt">'+PROOFS.map(function(p){return '<option>'+p+'</option>'}).join('')+'</select></label>'+
 '<label class="form" style="max-width:none">Address proof (front and back, or all pages)<input type="file" id="dpf" accept="image/*,application/pdf" multiple></label>'+
 '<label class="form" style="max-width:none">Passport-size photograph<input type="file" id="dpp" accept="image/*"></label>'+
 '<p id="dpe" style="color:#9B1C47;font-weight:600;margin:6px 0" hidden></p><div class="ac"><button class="btn" id="dpg">Submit documents</button><button class="btn out" onclick="BA.closeBox()">Later</button></div>');
 var el=function(i){return document.getElementById(i)};
 el('dpg').onclick=function(){var fs=[].slice.call(el('dpf').files),ph=el('dpp').files[0],bad='';
  if(!fs.length&&!(m.aadhaar||[]).length)bad='Choose your address proof file.';
  fs.forEach(function(f){if(!/^image\//.test(f.type)&&f.type!=='application/pdf')bad=f.name+' is not a picture or PDF.';else if(f.size>6*1048576)bad=f.name+' is over 6 MB.'});
  if(!ph&&!m.photo)bad=bad||'Choose your passport-size photograph.';
  if(ph&&!/^image\//.test(ph.type))bad='The photograph must be a picture file.';
  if(bad){var e=el('dpe');e.textContent=bad;e.hidden=false;return}
  el('dpg').disabled=true;el('dpg').textContent='Saving…';var type=el('dpt').value;
  Promise.all(fs.map(function(f){var img=/^image\//.test(f.type);return (img?FV.imgBlob(f,1600):Promise.resolve(f)).then(function(b){return BA.idb.put(b)}).then(function(k){return {n:f.name,k:k,size:f.size,t:img?'image/jpeg':'application/pdf',type:type}})}))
  .then(function(added){return (ph?FV.imgData(ph,256):Promise.resolve(m.photo)).then(function(u){
   var all=FV.dir(),i=all.findIndex(function(x){return x.id===m.id});if(i<0)return;
   all[i].aadhaar=(all[i].aadhaar||[]).concat(added);all[i].photo=u;all[i].docsPending=false;all[i].docsAt=Date.now();FV.saveDir(all);
   var al=BA.jget('ba3_audit',[]);al.push({who:m.name,role:FV.ROLEL[m.role],what:'Uploaded address proof ('+type+') and photograph',at:Date.now()});BA.jset('ba3_audit',al);
   BA.notify('docs:'+m.id+':'+Date.now(),{type:'docs',to:['admin'],sev:'info',text:m.name+' ('+FV.ROLEL[m.role]+') uploaded their '+type.toLowerCase()+' and passport-size photograph.'});
   BA.closeBox();BA.toast('Thank you. Your documents are saved.');bar()})})
  .catch(function(){el('dpg').disabled=false;el('dpg').textContent='Submit documents';var e=el('dpe');e.textContent='Could not save the files on this device. Try again.';e.hidden=false})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bar);else setTimeout(bar,300);
})();
