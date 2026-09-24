'use strict';
(()=>{
 const root=document.documentElement, gate=document.querySelector('#portal'),content=document.querySelector('#universe-content'),canvas=document.querySelector('#signal-field'),toggle=document.querySelector('#portal-motion');
 const ctx=canvas.getContext('2d');const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let active=true,entering=false,paused=reducedMotion.matches,raf=0,time=0,last=0,width=0,height=0,dpr=1,warp=0,mx=0,my=0,tx=0,ty=0;
 const low=(navigator.hardwareConcurrency||8)<=4, count=low?620:1350;
 const points=Array.from({length:count},(_,i)=>({u:(i/count)*Math.PI*2,v:i*2.3999632297,seed:(Math.sin(i*127.1)*43758.5453)%1}));
 const stars=Array.from({length:low?50:100},()=>({x:Math.random(),y:Math.random(),size:Math.random()*1.4+.3}));
 root.classList.add('portal-active');content.inert=true;
 function resize(){if(!active)return;width=gate.clientWidth;height=gate.clientHeight;dpr=Math.min(devicePixelRatio||1,low?1:1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);draw();}
 function draw(){if(!ctx||!active||width<=0||height<=0)return;ctx.clearRect(0,0,width,height);const mobile=width<701,cx=width*(mobile?.79:.70)+mx*22,cy=height*.48+my*18,rad=Math.min(width*(mobile?.56:.265),height*.42)*(1+warp*2.7);
 const aura=ctx.createRadialGradient(cx,cy,rad*.22,cx,cy,rad*1.55);aura.addColorStop(0,'#17132600');aura.addColorStop(.43,'#9b8cff0b');aura.addColorStop(.67,'#945fff25');aura.addColorStop(1,'#06080e00');ctx.fillStyle=aura;ctx.fillRect(0,0,width,height);
 for(const s of stars){const x=(s.x*width+time*2*s.size)%width;ctx.fillStyle=`rgba(184,185,231,${.15+s.size*.2})`;ctx.fillRect(x,s.y*height,s.size,s.size);}
 const spin=time*.12,tilt=.42+my*.09,sorted=[];
 for(const p of points){const u=p.u+spin,v=p.v+time*.18;const tube=rad*(.22+.035*Math.sin(u*5+time*.65)),r=rad*.73+tube*Math.cos(v);const x=r*Math.cos(u),y=r*Math.sin(u),z=tube*Math.sin(v);const xx=x*Math.cos(tilt)+z*Math.sin(tilt),zz=-x*Math.sin(tilt)+z*Math.cos(tilt),yy=y*Math.cos(-.38)-zz*Math.sin(-.38);const depth=y*Math.sin(-.38)+zz*Math.cos(-.38),perspective=1+depth/(rad*4);sorted.push({x:cx+xx*perspective,y:cy+yy*perspective,z:depth,a:u,size:Math.max(.7,(1+depth/rad)*1.35)});}
 sorted.sort((a,b)=>a.z-b.z);for(const p of sorted){const light=Math.max(.18,.55+p.z/(rad*1.5));ctx.fillStyle=p.z>0?`rgba(176,174,255,${light})`:`rgba(194,125,233,${light})`;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();}
 ctx.save();ctx.translate(cx,cy);ctx.rotate(-.35+mx*.04);for(let ring=0;ring<3;ring++){ctx.strokeStyle=ring===0?'#c5bbff38':'#a58bff30';ctx.lineWidth=ring===0?1:.6;ctx.beginPath();ctx.ellipse(0,0,rad*(1.1+ring*.10),rad*(.73+ring*.03),ring*.11,0,Math.PI*2);ctx.stroke();}for(let i=0;i<70;i++){const a=i/70*Math.PI*2+time*.045,inner=rad*1.26,outer=inner+(i%5===0?8:3);ctx.strokeStyle=i%5===0?'#dabfff80':'#a4a1d940';ctx.beginPath();ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner*.84);ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer*.84);ctx.stroke();}ctx.restore();
 }
 function loop(now){raf=0;if(!active||document.hidden||paused&&!entering)return;const dt=Math.min((now-(last||now))/1000,.045);last=now;time+=dt;mx+=(tx-mx)*.06;my+=(ty-my)*.06;if(entering)warp=Math.min(1,warp+dt*1.3);draw();raf=requestAnimationFrame(loop);}
 function start(){last=0;if(!raf&&active&&!document.hidden&&(!paused||entering))raf=requestAnimationFrame(loop);}
 function finish(){active=false;entering=false;cancelAnimationFrame(raf);raf=0;root.classList.remove('portal-active','portal-entering');root.classList.add('portal-entered');content.inert=false;gate.inert=true;window.scrollTo({top:0,behavior:'instant'});document.querySelector('.content-hero-title').focus({preventScroll:true});window.dispatchEvent(new Event('resize'));}
 function enter(e){e?.preventDefault();if(entering||!active)return;entering=true;root.classList.add('portal-entering');start();setTimeout(finish,reducedMotion.matches?0:950);}
 document.querySelectorAll('[data-enter]').forEach(a=>a.addEventListener('click',enter));
 document.querySelector('[data-return-portal]').addEventListener('click',e=>{e.preventDefault();if(typeof stopAudio==='function'&&playing)stopAudio();active=true;warp=0;gate.inert=false;content.inert=true;root.classList.remove('portal-entered');root.classList.add('portal-active');window.scrollTo({top:0,behavior:'instant'});resize();start();gate.querySelector('.portal-enter').focus({preventScroll:true});});
 toggle.addEventListener('click',()=>{paused=!paused;syncToggle();if(paused){cancelAnimationFrame(raf);raf=0;}else start();});
 function syncToggle(){toggle.textContent=paused?'开启动效':'暂停动效';toggle.setAttribute('aria-pressed',String(paused));}
 gate.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||paused)return;tx=e.clientX/width-.5;ty=e.clientY/height-.5;},{passive:true});gate.addEventListener('pointerleave',()=>{tx=0;ty=0;});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();});
 reducedMotion.addEventListener('change',()=>{paused=reducedMotion.matches;syncToggle();cancelAnimationFrame(raf);raf=0;draw();start();});
 window.addEventListener('resize',resize,{passive:true});syncToggle();resize();start();
 let destination=null;try{destination=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{}
 if(destination&&destination!==gate&&content.contains(destination)){finish();destination.scrollIntoView({behavior:'instant'});}
})();
