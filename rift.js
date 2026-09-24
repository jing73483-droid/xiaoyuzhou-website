'use strict';
(()=>{
 const host=document.querySelector('#universe-content'),orb=document.querySelector('.rift-orb'),root=document.documentElement,fine=matchMedia('(hover:hover) and (pointer:fine)');let frame=0,x=innerWidth*.8,y=innerHeight*.72;
 function place(){frame=0;orb.style.left=x+'px';orb.style.top=y+'px';}
 function reset(){root.classList.remove('bubble-cursor');orb.style.removeProperty('left');orb.style.removeProperty('top');}
 host.addEventListener('pointermove',e=>{if(!fine.matches||e.pointerType==='touch')return;x=e.clientX;y=e.clientY;root.classList.add('bubble-cursor');orb.classList.toggle('over-control',!!e.target.closest('a,button,input,select,textarea'));if(!frame)frame=requestAnimationFrame(place);},{passive:true});
 host.addEventListener('pointerleave',reset);window.addEventListener('blur',reset);fine.addEventListener('change',reset);
 document.addEventListener('keydown',e=>{if(e.key==='Tab')reset();});
})();
