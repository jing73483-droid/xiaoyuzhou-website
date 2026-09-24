'use strict';
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),sections=[...document.querySelectorAll('#universe-content main>section')];
 let frame=0;const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const rail=document.createElement('nav');rail.className='journey-nav';rail.setAttribute('aria-label','内容导航');
 const names=['发现声音','同频共鸣','兴趣星系','下载小宇宙'];
 sections.forEach((section,i)=>{
  section.classList.add('journey-scene');
  const atmosphere=document.createElement('div');atmosphere.className='scene-atmosphere';atmosphere.setAttribute('aria-hidden','true');atmosphere.innerHTML='<i></i><i></i><i></i>';section.prepend(atmosphere);
  const link=document.createElement('a');link.href='#'+section.id;link.innerHTML='<span>'+names[i]+'</span><i></i>';link.setAttribute('aria-label',names[i]);rail.append(link);
  section.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;const r=section.getBoundingClientRect();section.style.setProperty('--cursor-x',((e.clientX-r.left)/r.width*100)+'%');section.style.setProperty('--cursor-y',((e.clientY-r.top)/r.height*100)+'%');},{passive:true});
 });document.querySelector('#universe-content').append(rail);
 const links=[...rail.children];
 function render(){frame=0;if(!document.documentElement.classList.contains('portal-entered'))return;
  const vh=innerHeight;let nearest=0,distance=Infinity;
  sections.forEach((s,i)=>{const r=s.getBoundingClientRect(),visible=r.bottom>0&&r.top<vh;s.classList.toggle('in-view',visible);const d=Math.abs(r.top+r.height*.35-vh*.5);if(d<distance){distance=d;nearest=i;}if(!visible)return;
   const p=clamp((vh-r.top)/(vh+r.height),0,1),travel=(p-.5)*(innerWidth<701?60:160);
   s.style.setProperty('--travel',reduced.matches?'0px':travel+'px');s.style.setProperty('--turn',reduced.matches?'0deg':((p-.5)*32)+'deg');s.style.setProperty('--zoom',reduced.matches?'1':String(1.04+p*.1));s.style.setProperty('--sweep',p*100+'%');
  });links.forEach((a,i)=>{if(i===nearest)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(render);}addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',schedule);
 new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 document.querySelectorAll('.moment').forEach(b=>b.addEventListener('click',()=>{const s=document.querySelector('.community');s.classList.remove('signal-pulse');void s.offsetWidth;s.classList.add('signal-pulse');}));
 document.querySelectorAll('.bubble').forEach(b=>b.addEventListener('click',()=>{const s=document.querySelector('.explore');s.classList.remove('signal-pulse');void s.offsetWidth;s.classList.add('signal-pulse');}));schedule();
})();
