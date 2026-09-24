'use strict';
(()=>{
 const scenes=[...document.querySelectorAll('#universe-content main>section')],root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const names=['声音原野','共鸣海岸','好奇星系','下一站，小宇宙'];let current=0,busy=false,timer=0,sequence=0;
 const panel=document.createElement('div');panel.className='world-panel';panel.innerHTML='<span class="world-caption">小宇宙 · 声音漫游</span><nav aria-label="选择声音世界">'+names.map((n,i)=>`<button type="button" data-world="${i}" aria-pressed="${i===0}"><small>0${i+1}</small><span>${n}</span></button>`).join('')+'</nav><span class="world-help">选择坐标，进入另一片声音世界</span>';document.querySelector('#universe-content').append(panel);
 const buttons=[...panel.querySelectorAll('button')];
 scenes.forEach((s,i)=>{s.classList.add('world-scene');s.classList.toggle('world-current',i===0);s.inert=i!==0;s.setAttribute('aria-hidden',String(i!==0));s.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible'));});
 root.classList.add('world-ready');
 async function go(index,point){
  if(index===current||busy||index<0||index>=scenes.length)return;
  busy=true;const old=scenes[current],next=scenes[index];
  await Promise.allSettled([...next.querySelectorAll('img')].map(img=>img.decode?.()));
  // 下一场景渐入期间，旧场景始终保持完全不透明。
  old.inert=true;next.scrollTop=0;next.classList.add('world-arriving');next.inert=true;next.setAttribute('aria-hidden','false');root.classList.add('world-warping');
  if(!reduce.matches){const animation=next.animate([{opacity:0,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:800,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'});await animation.finished.catch(()=>{});next.classList.add('world-current');next.classList.remove('world-arriving');animation.cancel();}else{next.classList.add('world-current');next.classList.remove('world-arriving');}
  old.classList.remove('world-current');old.setAttribute('aria-hidden','true');current=index;busy=false;next.inert=false;root.classList.remove('world-warping');buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));window.dispatchEvent(new CustomEvent('world-arrived',{detail:{index}}));const heading=next.querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});window.dispatchEvent(new Event('resize'));
 }
 panel.addEventListener('click',e=>{const b=e.target.closest('[data-world]');if(b)go(Number(b.dataset.world));});
 document.querySelector('#universe-content').addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||a.hasAttribute('data-return-portal'))return;const index=scenes.findIndex(s=>'#'+s.id===a.getAttribute('href'));if(index>=0){e.preventDefault();go(index);}});
 panel.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?3:(current+(e.key==='ArrowRight'?1:3))%4;go(next);buttons[next].focus();});
 // 点击场景空白或能量球前进；文本选择、拖动和原有控件不会触发。
 const orb=document.createElement('button');orb.className='rift-orb';orb.type='button';orb.setAttribute('aria-label','触碰能量球，前往共鸣海岸');orb.innerHTML='<i></i><i></i><i></i><span>触碰 · 穿越</span>';document.querySelector('#universe-content').append(orb);
 const coords=e=>({x:e.clientX||innerWidth*.8,y:e.clientY||innerHeight*.72});
 orb.addEventListener('click',e=>go((current+1)%4,coords(e)));
 window.addEventListener('world-arrived',()=>orb.setAttribute('aria-label','触碰能量球，前往'+names[(current+1)%4]));
 let down=null;
 scenes.forEach(scene=>{
  scene.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};},{passive:true});
  scene.addEventListener('click',e=>{if(e.target.closest('a,button,input,select,textarea,[role="button"],.player,.comment,.category-result')||window.getSelection()?.toString())return;if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>8)return;go((current+1)%4,coords(e));});
 });
 // 类别翻转使用同一套 420ms 曲线；重复点击先取消旧动画。
 let flip;document.querySelectorAll('.bubble').forEach(b=>b.addEventListener('click',()=>{if(reduce.matches)return;flip?.cancel();flip=document.querySelector('.category-result').animate([{transform:'perspective(900px) rotateX(-12deg)',opacity:.25},{transform:'perspective(900px) rotateX(0)',opacity:1}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'});}));
 // 图片真实解码期间以品牌短句反馈加载状态，不伪造百分比。
 const entry=document.querySelector('.portal-enter'),label=entry.querySelector('span'),note=document.querySelector('.portal-label');let phase=0;const phrases=['寻找声音的坐标','让世界慢慢显影','与好奇心建立连接'];note.lastChild.textContent=' '+phrases[0];const loading=setInterval(()=>{phase++;note.lastChild.textContent=' '+phrases[phase%3];},1100);
 Promise.allSettled([...document.querySelectorAll('main img')].map(img=>img.decode?.())).then(()=>{clearInterval(loading);note.lastChild.textContent=' 声音已就绪 / 由你开启';label.textContent='进入小宇宙';});
 const deep=scenes.findIndex(s=>'#'+s.id===location.hash);if(deep>0)go(deep);
 document.addEventListener('visibilitychange',()=>{root.classList.toggle('world-paused',document.hidden);});
})();
