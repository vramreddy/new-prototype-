/* Home carousel: slides left to right every 10 seconds; text, images and featured property can be changed by Admin (ba3_car) */
(function(){var root=document.getElementById('car');if(!root||!window.BA)return;var BA=window.BA,esc=BA.esc,ov={};try{ov=BA.jget('ba3_car',{})||{}}catch(e){}
var S=[].slice.call(root.querySelectorAll('.cs-s')),def=window.BA_CAR||[];
S.forEach(function(s,i){var d=def[i]||{},o=ov[d.id]||{};if(o.hide){s.remove();return}
 if(o.title)s.querySelector('h2').textContent=o.title;if(o.prob)s.querySelector('.cs-p p').textContent=o.prob;if(o.sol)s.querySelector('.cs-sol p').textContent=o.sol;
 var a=s.querySelector('.cs-sol a');if(o.cta)a.textContent=o.cta+' →';if(o.href&&/^[a-z0-9\-_.\/?=&#]+$/i.test(o.href))a.setAttribute('href',o.href);
 if(o.img){var im=s.querySelector('.cs-img');im.innerHTML='<img src="'+o.img+'" alt="'+esc(o.title||d.title||'')+'" loading="lazy"><span class="cs-cap">'+esc(d.who||'')+'</span>'}
 if(o.pid){var p=BA.find&&BA.find(o.pid);if(p){var sv=s.querySelector('.cs-sol');sv.insertAdjacentHTML('beforeend','<a class="cs-fp" href="property.html?id='+esc(p.id)+'"><small>Featured</small><b>'+esc(p.short)+', '+esc(p.loc)+'</b><span>Reserve '+BA.inr(p.reserve)+' · auction in '+p.days+' days</span></a>')}}});
S=[].slice.call(root.querySelectorAll('.cs-s'));var n=S.length,cur=0,tm=null,paused=false,busy=false,dots=[].slice.call(root.querySelectorAll('.cs-d'));
dots.forEach(function(d,i){if(i>=n)d.remove()});dots=[].slice.call(root.querySelectorAll('.cs-d'));
if(!n){root.hidden=true;return}
function mark(){dots.forEach(function(d,i){d.classList.toggle('on',i===cur);d.setAttribute('aria-current',i===cur?'true':'false')});S.forEach(function(s,i){s.setAttribute('aria-hidden',i===cur?'false':'true')})}
S[0].classList.add('on');mark();
function go(t,dir){if(busy||t===cur||n<2)return;busy=true;var a=S[cur],b=S[t];dir=dir||1;
 if(dir<0){b.classList.add('from-r','nt');void b.offsetWidth;b.classList.remove('nt')}
 b.classList.add('on');a.classList.remove('on');cur=t;mark();setTimeout(function(){b.classList.remove('from-r');busy=false},760)}
function next(){go((cur+1)%n,1)}function prev(){go((cur-1+n)%n,-1)}
function start(){stop();if(paused||matchMedia('(prefers-reduced-motion:reduce)').matches||n<2)return;tm=setInterval(next,10000)}function stop(){if(tm){clearInterval(tm);tm=null}}
root.querySelector('.cs-next').onclick=function(){next();start()};root.querySelector('.cs-prev').onclick=function(){prev();start()};
dots.forEach(function(d,i){d.onclick=function(){go(i,i>cur?1:-1);start()}});
var pp=root.querySelector('.cs-pp');pp.onclick=function(){paused=!paused;pp.textContent=paused?'▶':'❚❚';pp.setAttribute('aria-label',paused?'Play':'Pause');if(paused)stop();else start()};
root.addEventListener('mouseenter',stop);root.addEventListener('mouseleave',start);root.addEventListener('focusin',stop);root.addEventListener('focusout',start);
start()})();
