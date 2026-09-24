'use strict';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(pointer: fine)');
const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
for (const wave of document.querySelectorAll('.wave')) {
  const count = wave.classList.contains('timeline-wave') ? 100 : 22;
  for (let n=0;n<count;n++) { const bar=document.createElement('i');bar.style.setProperty('--h',`${8+Math.abs(Math.sin(n*1.7)*Math.cos(n*.35))*32}px`);bar.style.setProperty('--delay',`${-(n%7)*.11}s`);wave.append(bar); }
}
if(!reduced.matches) {
  document.documentElement.classList.add('js-motion');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
for(const card of document.querySelectorAll('.tilt')) {
  let frame=0;
  card.addEventListener('pointermove',event=>{if(!fine.matches||reduced.matches||lowPower)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const r=card.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;card.style.setProperty('--rx',`${-y*12}deg`);card.style.setProperty('--ry',`${x*12}deg`);card.style.setProperty('--mx',`${(x+.5)*100}%`);card.style.setProperty('--my',`${(y+.5)*100}%`);});});
  card.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');});
}
let scrollFrame=0;
function parallax(){scrollFrame=0;if(reduced.matches||lowPower||innerWidth<701)return;const scene=document.querySelector('.hero-scene'),r=scene.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;const delta=Math.max(-350,Math.min(550,innerHeight*.55-r.top));for(const el of scene.querySelectorAll('[data-depth]'))el.style.translate=`0 ${delta*Number(el.dataset.depth)}px`;}
addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(parallax);},{passive:true});
addEventListener('resize',()=>{document.querySelectorAll('[data-depth],.landscape').forEach(el=>{el.style.translate='';el.style.transform='';});parallax();});
parallax();
const comments=[...document.querySelectorAll('.comment')];
comments[0].classList.add('active');
document.querySelectorAll('.moment').forEach(button=>button.addEventListener('click',()=>{const i=Number(button.dataset.moment);document.querySelectorAll('.moment').forEach((b,n)=>{b.classList.toggle('active',n===i);b.setAttribute('aria-pressed',String(n===i));});comments.forEach((c,n)=>c.classList.toggle('active',n===i));document.querySelector('#moment').value=['04:12','17:36','32:18'][i];}));
const categories={culture:['泛文化','换个视角，看日常。','书、电影、城市与生活。熟悉的事物，也有陌生的一面。'],business:['商业','听懂变化，发现可能。','聊一家公司，也聊一个时代。透过商业故事，理解世界的运转。'],mind:['心理','向内探索，更懂自己。','关于关系、情绪与成长。在别人的故事里，找到自己的答案。'],life:['生活','日常里，藏着小宇宙。','做饭、散步、出发去旅行。把普通的一天，过得有声有色。'],science:['科技','让想象，比未来先到。','从人工智能到浩瀚星空。用好奇心，打开下一个问题。']};
document.querySelectorAll('.bubble').forEach(button=>button.addEventListener('click',()=>{const value=categories[button.dataset.category];document.querySelector('#category-label').textContent=`正在探索 · ${value[0]}`;document.querySelector('#category-title').textContent=value[1];document.querySelector('#category-description').textContent=value[2];document.querySelectorAll('.bubble').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});}));
// 原创合成环境音；只在主动点击后启动，不获取麦克风权限。
let context,source,analyser,gain,audioFrame=0,playing=false,started=0;
const play=document.querySelector('#play'),status=document.querySelector('#play-status'),clock=document.querySelector('#play-time');
function stopAudio(){playing=false;source?.stop();source?.disconnect();source=null;cancelAnimationFrame(audioFrame);document.body.classList.remove('playing');play.textContent='▶';play.setAttribute('aria-label','播放声音演示');play.setAttribute('aria-pressed','false');status.textContent='原创环境音 · 点击试听';clock.textContent='00:00';document.querySelector('#audio-progress').style.width='0%';document.documentElement.style.setProperty('--amplitude','1');context?.suspend();}
function renderAudio(){if(!playing)return;const data=new Uint8Array(analyser.fftSize);analyser.getByteTimeDomainData(data);let sum=0;for(const sample of data)sum+=Math.pow((sample-128)/128,2);if(!reduced.matches)document.documentElement.style.setProperty('--amplitude',String(1+Math.min(.65,Math.sqrt(sum/data.length)*4)));const seconds=Math.floor((performance.now()-started)/1000);clock.textContent=`00:${String(seconds).padStart(2,'0')}`;document.querySelector('#audio-progress').style.width=`${Math.min(100,seconds/30*100)}%`;if(seconds>=30){stopAudio();return;}audioFrame=requestAnimationFrame(renderAudio);}
play.addEventListener('click',async()=>{if(playing){stopAudio();return;}play.disabled=true;try{const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)throw new Error('unsupported');context ||= new AudioContext();await context.resume();const rate=context.sampleRate,buffer=context.createBuffer(1,rate*30,rate),channel=buffer.getChannelData(0);let brown=0;for(let n=0;n<channel.length;n++){brown=(brown+Math.random()*.04-.02)/1.015;const t=n/rate,envelope=Math.min(1,t/2,(30-t)/2),sea=.35+.25*Math.sin(t*.75);channel[n]=(brown*sea+Math.sin(t*2*Math.PI*174.61)*.025+Math.sin(t*2*Math.PI*261.63)*.013)*envelope;}source=context.createBufferSource();source.buffer=buffer;gain=context.createGain();gain.gain.value=.55;analyser=context.createAnalyser();analyser.fftSize=256;source.connect(gain);gain.connect(analyser);analyser.connect(context.destination);source.start();playing=true;started=performance.now();document.body.classList.add('playing');play.textContent='Ⅱ';play.setAttribute('aria-label','暂停声音演示');play.setAttribute('aria-pressed','true');status.textContent='正在试听 · 海边漫游';renderAudio();}catch(error){status.textContent='声音暂不可用，请稍后重试';}finally{play.disabled=false;}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)stopAudio();});
reduced.addEventListener('change',()=>{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));document.querySelectorAll('[data-depth],.landscape').forEach(el=>{el.style.translate='';el.style.transform='';});});
