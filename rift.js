'use strict';
(()=>{
 const host=document.querySelector('#universe-content'),canvas=document.createElement('canvas');canvas.className='rift-particles';canvas.setAttribute('aria-hidden','true');host.append(canvas);const ctx=canvas.getContext('2d');if(!ctx)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),low=(navigator.hardwareConcurrency||8)<=4;let w=0,h=0,raf=0,t=0,last=0,burst=-1,origin={x:0,y:0},mouse={x:-999,y:-999};
 const stars=Array.from({length:low?85:180},()=>({x:Math.random(),y:Math.random(),z:.3+Math.random(),a:Math.random()*Math.PI*2}));
 function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,low?1:1.5);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);draw();}
 function visible(){return document.documentElement.classList.contains('portal-entered')&&!document.hidden;}
 function draw(){ctx.clearRect(0,0,w,h);if(!visible())return;const warp=burst<0?0:Math.min(1,(performance.now()-burst)/1250);const expanding=burst>=0;
  for(const s of stars){let x=s.x*w,y=(s.y*h+t*5*s.z)%h;const dx=x-mouse.x,dy=y-mouse.y,dist=Math.hypot(dx,dy);if(dist<150&&dist>0){x+=dx/dist*(150-dist)*.14;y+=dy/dist*(150-dist)*.14;}
   if(expanding){const dx=x-origin.x,dy=y-origin.y,scale=1+warp*warp*5;const px=origin.x+dx*scale,py=origin.y+dy*scale;ctx.strokeStyle=`rgba(192,173,255,${(1-warp)*.75})`;ctx.lineWidth=s.z;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-dx*warp*.35,py-dy*warp*.35);ctx.stroke();}
   else{ctx.strokeStyle=`rgba(197,180,255,${.12+s.z*.16})`;ctx.beginPath();ctx.arc(x,y,1+s.z*2,0,Math.PI*2);ctx.stroke();}
  }
  if(expanding){const r=18+warp*warp*Math.hypot(w,h);ctx.strokeStyle=`rgba(217,192,255,${(1-warp)*.7})`;ctx.lineWidth=2+warp*8;ctx.beginPath();ctx.arc(origin.x,origin.y,r,0,Math.PI*2);ctx.stroke();const glow=ctx.createRadialGradient(origin.x,origin.y,0,origin.x,origin.y,Math.max(1,r));glow.addColorStop(0,'#bd9dff00');glow.addColorStop(.85,`rgba(172,133,255,${(1-warp)*.1})`);glow.addColorStop(1,'#cbbaff00');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);if(warp===1)burst=-1;}
 }
 function loop(now){raf=0;if(!visible()||reduced.matches)return;t+=Math.min((now-(last||now))/1000,.05);last=now;draw();raf=requestAnimationFrame(loop);}
 function sync(){cancelAnimationFrame(raf);raf=0;last=0;if(visible()&&!reduced.matches)raf=requestAnimationFrame(loop);else ctx.clearRect(0,0,w,h);}
 host.addEventListener('pointermove',e=>{mouse={x:e.clientX,y:e.clientY};const orb=document.querySelector('.rift-orb');if(!orb||reduced.matches)return;const r=orb.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;orb.style.setProperty('--pull-x',Math.abs(dx)<170?dx*.08+'px':'0px');orb.style.setProperty('--pull-y',Math.abs(dy)<170?dy*.08+'px':'0px');},{passive:true});host.addEventListener('pointerleave',()=>{mouse={x:-999,y:-999};});
 window.addEventListener('world-warp',e=>{origin=e.detail;burst=reduced.matches?-1:performance.now();document.documentElement.style.setProperty('--rift-x',origin.x+'px');document.documentElement.style.setProperty('--rift-y',origin.y+'px');sync();});window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});resize();sync();
})();
