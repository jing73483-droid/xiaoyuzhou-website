'use strict';
(()=>{
 const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:700px)');
 const scenes=[...document.querySelectorAll('.world-scene')];let animations=[],initial=false;
 // 参考节奏：字间 35ms、卡片间 90ms；降低回弹幅度避免阅读眩晕。
 for(const scene of scenes){const heading=scene.querySelector('h2');heading.setAttribute('aria-label',heading.textContent);const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){const fragment=document.createDocumentFragment();for(const char of [...node.textContent]){const span=document.createElement('span');span.className='rhythm-char';span.setAttribute('aria-hidden','true');span.textContent=char;fragment.append(span);}node.replaceWith(fragment);}}
 function cancel(){animations.forEach(a=>a.cancel());animations=[];}
 function animate(el,frames,options){const a=el.animate(frames,{fill:'both',...options});animations.push(a);a.finished.then(()=>a.cancel()).catch(()=>{});}
 function enter(scene){cancel();if(!scene||reduce.matches)return;
  const chars=[...scene.querySelectorAll('.rhythm-char')];chars.forEach((el,i)=>animate(el,[{transform:'translate3d(0,65%,0)',opacity:0},{transform:'translate3d(0,0,0)',opacity:1}],{duration:680,delay:100+Math.min(i,22)*35,easing:'cubic-bezier(.22,1,.36,1)'}));
  const cards=[...scene.querySelectorAll('.player,.floating-cover,.comment,.bubble,.download-button')].filter(el=>!mobile.matches||!el.matches('.comment:not(.active)'));cards.forEach((el,i)=>animate(el,[{translate:`0 ${mobile.matches?16:30}px`,scale:'.97',opacity:0},{translate:'0 -2px',scale:'1.005',opacity:1,offset:.8},{translate:'0 0',scale:'1',opacity:1}],{duration:720,delay:190+Math.min(i,5)*90,easing:'cubic-bezier(.22,1,.36,1)'}));
  scene.querySelectorAll('.hero-copy>p,.section-heading>p,.explore-copy>p,.download-content>p,.content-kicker,.eyebrow').forEach((el,i)=>animate(el,[{translate:'0 12px',opacity:0},{translate:'0 0',opacity:1}],{duration:550,delay:240+i*45,easing:'cubic-bezier(.22,1,.36,1)'}));
 }
 root.classList.add('rhythm-on');
 window.addEventListener('world-entering',e=>enter(e.detail.scene));
 const observe=new MutationObserver(()=>{const opened=root.classList.contains('portal-entered');if(opened&&!initial){initial=true;enter(document.querySelector('.world-current'));}if(!opened){initial=false;cancel();}});observe.observe(root,{attributes:true,attributeFilter:['class']});
 if(root.classList.contains('portal-entered')){initial=true;enter(document.querySelector('.world-current'));}
 reduce.addEventListener('change',cancel);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 // 悬停仅微幅提起；保留原有音频、评论、类别语义与点击行为。
})();
