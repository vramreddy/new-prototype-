(function(){
var ST=window.ST,BA=ST.BA,FV=window.FV,esc=ST.esc,$=ST.$,staff=ST.staff;if(!staff||!$('app'))return;
var engs=FV.dir().filter(function(m){return m.role==='field'}),isAdm=staff.role!=='field';
var eid=isAdm?(BA.ls('ba3_fadm')||(engs[0]||{}).id):staff.id,tab='q',sel=null;
var RANK={overdue:0,urgent:1,ok:3};
function E(){return FV.get(eid)}
function ordered(list){return list.slice().sort(function(x,y){var sx=FV.sla(x.a),sy=FV.sla(y.a),rx=x.a.ret&&sx.level!=='overdue'?2:RANK[sx.level],ry=y.a.ret&&sy.level!=='overdue'?2:RANK[sy.level];if(rx!==ry)return rx-ry;var dx=sx.reasons.length?-sx.reasons[0].over:(sx.next?sx.next.due:0),dy=sy.reasons.length?-sy.reasons[0].over:(sy.next?sy.next.due:0);return dx-dy})}
function render(){var e=E();if(!e){$('app').innerHTML=ST.head('Field verification','No field engineer accounts exist yet. Onboard one in Admin, Staff.');return}
 var all=FV.mine(eid),open=ordered(all.filter(function(x){return !x.a.sub&&!x.a.fin})),subm=all.filter(function(x){return x.a.sub||x.a.fin}),c=FV.counts(open),dr=FV.drafts(eid),mgr=FV.get(e.manager);
 var right='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end">'+(isAdm?'<select id="es" class="cs" style="color:var(--ink)" aria-label="Field engineer">'+engs.map(function(m){return '<option value="'+m.id+'"'+(m.id===eid?' selected':'')+'>'+esc(m.name)+'</option>'}).join('')+'</select>':'')+'<a class="btn out sm" href="fieldapp.html" target="_blank">Open the Android app ↗</a></div>';
 $('app').innerHTML=ST.head('Field verification · '+esc(e.name),'Accept each visit within 18 hours and finish it within 48 hours. '+esc(e.cities.map(FV.cl).join(', '))+(mgr?' · Reports to '+esc(mgr.name):''),right)+
 '<div class="kpis">'+ST.kpi('To do',open.length,'Open site visits')+kc('Overdue',c.overdue,'overdue','Late items go to your District Sales Manager')+kc('Urgent',c.urgent,'urgent','Deadline within 6 hours')+ST.kpi('With checker',subm.filter(function(x){return !x.a.fin}).length,subm.filter(function(x){return x.a.fin}).length+' approved')+'</div>'+
 ST.tabsHtml([['q','My visits ('+open.length+')'],['d','Drafts ('+dr.length+')'],['s','Submitted ('+subm.length+')'],['x','With my DSM'],['c','Checker work'],['p','My profile']],tab)+'<div id="fb"></div>';
 $('tabs').onclick=function(ev){var b=ev.target.closest('button');if(b){tab=b.dataset.t;sel=null;render()}};
 if($('es'))$('es').onchange=function(){eid=this.value;BA.ls('ba3_fadm',eid);sel=null;render()};
 ({q:q,d:d,s:s,c:ck,p:pr,x:xv})[tab](open,subm,dr)}
function kc(l,v,lv,sub){var c=FV.COL[lv];return '<div class="kpi" style="border-left:6px solid '+(v?c.bd:'#e3e3e8')+';'+(v?'background:'+c.bg:'')+'"><small>'+l+'</small><b style="'+(v?'color:'+c.tx:'')+'">'+v+'</b><span>'+sub+'</span></div>'}
function pane(open,list){if(!sel||!list.some(function(x){return x.p.id===sel}))sel=list[0]?list[0].p.id:null;var host=$('fp');
 if(!sel){host.innerHTML='<div class="sc" style="padding:24px"><b style="font-size:19px">Nothing here</b><span>You are all caught up.</span></div>';return}
 var a=FV.asg()[sel];host.innerHTML='<div id="fpane">'+FV.taskHtml(sel)+FV.actionsHtml(sel)+(a.sched||a.ret||a.sub?'<div id="fm"></div>':'<div class="fvn"><b>Accept and schedule first.</b> The report opens once your visit time is booked.</div>')+'</div>';
 FV.taskWire($('fpane'),render);if($('fm'))FV.form($('fm'),sel,{eng:eid,onSubmit:function(){sel=null;render()}})}
function two(list,empty){$('fb').innerHTML='<div class="lwg" style="grid-template-columns:minmax(0,1fr) minmax(0,1.25fr)"><div id="fl"></div><div id="fp"></div></div>';
 var h='';if(!list.length)h='<div class="sc" style="padding:24px"><b style="font-size:19px">Nothing here</b><span>'+empty+'</span></div>';
 else{var g={overdue:[],urgent:[],ret:[],ok:[]};list.forEach(function(x){var s=FV.sla(x.a);g[s.level==='overdue'?'overdue':x.a.ret?'ret':s.level==='urgent'?'urgent':'ok'].push(x)});
  var T={overdue:['Overdue','overdue'],urgent:['Urgent','urgent'],ret:['Returned by checker','urgent'],ok:['On track','ok']};
  ['overdue','urgent','ret','ok'].forEach(function(k){if(!g[k].length)return;var cc=FV.COL[T[k][1]];h+='<h3 style="font:800 15px var(--f);margin:14px 0 8px;color:'+cc.tx+'"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+cc.bd+';margin-right:8px"></span>'+T[k][0]+' ('+g[k].length+')</h3>'+g[k].map(function(x){return FV.card(x.p.id,x.a,sel===x.p.id)}).join('')})}
 $('fl').innerHTML=h;$('fl').onclick=function(ev){var t=ev.target.closest('[data-task]');if(t){sel=t.dataset.task;render()}};pane(null,list)}
function xv(){var e=E();$('fb').innerHTML='<div id="xh"></div>';TRK.tracker($('xh'),TRK.cfgEng({id:e.id,name:e.name,role:'field',manager:e.manager}))}
function q(open){two(open,'No site visits are waiting. New ones appear here as soon as they are assigned.')}
function d(open,subm,dr){var L=dr.map(function(id){return {p:FV.property(id),a:FV.asg()[id]}}).filter(function(x){return x.p});two(L,'No drafts. A draft is saved whenever you add something to a report and leave it unsubmitted.')}
function s(open,subm){two(subm,'Reports you submit appear here while the checker reviews them.')}
function ck(){var Q=FV.queue().filter(function(x){return x.status==='submitted'&&x.eng!==eid}),ex=(window.BA_EXC||[]).filter(function(r){var s=(BA.jget('ba3_exc',{})[r.id]||{}).status||r.status;return s==='pending'||s==='review'}).length;
 $('fb').innerHTML=ST.panel('Checker work','<p style="color:var(--mute);margin:0 0 12px">Everything a checker does is open to you here. To keep every report checked by a second person, you cannot approve a report you submitted yourself.</p><div class="ac"><a class="btn" href="checker.html">Open the checker queue ('+ex+' exceptions, '+Q.length+' field reports)</a></div>')+
 ST.panel('Field reports waiting for a checker ('+Q.length+')',ST.table(['Property','Engineer','Submitted',''],Q.map(function(r){var p=FV.property(r.id);return '<tr><td><b>'+esc(p.short)+' · '+esc(p.loc)+'</b><br><small style="color:var(--mute)">'+r.id+'</small></td><td>'+esc(r.engName)+'</td><td>'+esc(FV.when(r.subAt))+'</td><td><a class="btn sm" href="fvreview.html?id='+r.id+'">Review</a></td></tr>'})))}
function pr(){var e=E(),m=FV.get(e.manager);$('fb').innerHTML=ST.panel('My profile','<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">'+FV.avatar(e,84)+'<div><b style="font-size:20px">'+esc(e.name)+'</b><br>+91 '+e.phone.slice(0,5)+' '+e.phone.slice(5)+' · '+esc(e.email)+'<br>'+esc(e.state)+': '+esc(e.cities.map(FV.cl).join(', '))+'</div></div><p style="margin:14px 0 0"><b>Reporting manager:</b> '+(m?esc(m.name)+' · '+FV.tel(m.phone):'not assigned')+'</p><p style="color:var(--mute);font-size:13px;margin:8px 0 0">Your details are managed by Admin. Ask them to change anything here.</p>')}
render();
})();
