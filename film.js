'use strict';
(()=>{
 const root=document.documentElement,host=document.querySelector('#universe-content'),scenes=[...document.querySelectorAll('.world-scene')],reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const titles=['声音，把世界打开','在同一秒，遇见共鸣','让好奇心，带你远行','下一站，回到你的生活'];
 let paused=reduce.matches,index=0,elapsed=0,last=0,raf=0,opened=false,transitioning=false;
 const panel=document.createElement('div');panel.className='film-controls';panel.innerHTML='<button type="button" class="film-toggle" aria-label="暂停自动漫游">暂停漫游</button><span class="film-caption"></span><div class="film-track" aria-hidden="true"><i></i></div><span class="film-count"></span>';host.append(panel);
 const toggle=panel.querySelector('button'),caption=panel.querySelector('.film-caption'),count=panel.querySelector('.film-count'),bar=panel.querySelector('i');
 function sync(){root.classList.toggle('film-ending',index===3);root.classList.toggle('film-mode',index!==3);root.classList.toggle('film-paused',paused||document.hidden);toggle.textContent=paused?'播放漫游':'暂停漫游';toggle.setAttribute('aria-label',paused?'播放自动漫游':'暂停自动漫游');toggle.setAttribute('aria-pressed',String(!paused));caption.textContent=titles[index];count.textContent=String(index+1).padStart(2,'0')+' / 04';}
 function loop(now){raf=0;const dt=Math.min(now-(last||now),100);last=now;if(opened&&!paused&&!document.hidden&&!transitioning){elapsed+=dt;bar.style.transform=`scaleX(${Math.min(elapsed/12000,1)})`;if(elapsed>=12000){if(index===3){paused=true;sync();}else{transitioning=true;window.dispatchEvent(new Event('film-next'));}}}if(opened)raf=requestAnimationFrame(loop);}
 function start(){last=0;if(!raf&&opened)raf=requestAnimationFrame(loop);}
 function pause(){paused=true;sync();}
 toggle.addEventListener('click',()=>{paused=!paused;if(!paused&&elapsed>=12000){elapsed=0;if(index===3){transitioning=true;window.dispatchEvent(new Event('film-next'));}}sync();start();});
 host.addEventListener('click',e=>{if(e.target.closest('.film-controls'))return;if(e.target.closest('a,button,.comment,.player'))pause();},true);
 host.addEventListener('keydown',e=>{if(e.key==='Tab')pause();});host.addEventListener('wheel',pause,{passive:true});host.addEventListener('touchmove',pause,{passive:true});
 window.addEventListener('world-entering',e=>{transitioning=true;e.detail.scene.classList.add('film-shot');});
 window.addEventListener('world-arrived',e=>{index=e.detail.index;if(index===3)paused=true;elapsed=0;transitioning=false;bar.style.transform='scaleX(0)';scenes.forEach((s,i)=>s.classList.toggle('film-shot',i===index));sync();});
 new MutationObserver(()=>{const active=root.classList.contains('portal-entered');if(active===opened)return;opened=active;if(opened){index=Math.max(0,scenes.findIndex(s=>s.classList.contains('world-current')));scenes[index].classList.add('film-shot');sync();start();}else{cancelAnimationFrame(raf);raf=0;elapsed=0;scenes.forEach(s=>s.classList.remove('film-shot'));}}).observe(root,{attributes:true,attributeFilter:['class']});
 reduce.addEventListener('change',()=>{paused=reduce.matches;sync();});document.addEventListener('visibilitychange',()=>{last=0;sync();});root.classList.add('film-mode');sync();
})();
