import {createStickerEditor} from './sticker-editor.js?v=wizard21';
import {renderFrame} from './frame-art.js?v=wizard21';
import {textures,textureSwatch,loadTexture} from './textures.js?v=wizard21';
import {palette} from './frame-catalog.js?v=wizard21';
const $=s=>document.querySelector(s);
const layouts=[{id:'classic',name:'Classic 4-cut',count:4,cols:1,kind:'strip'},{id:'trio',name:'Film 3-cut',count:3,cols:1,kind:'strip'},{id:'duo',name:'Double',count:2,cols:1,kind:'strip'},{id:'grid',name:'Wide 4-cut',count:4,cols:2,kind:'special'},{id:'single',name:'Polaroid',count:1,cols:1,kind:'special'},{id:'six',name:'Basic 6-cut',count:6,cols:2,kind:'special'}];
const state={frameCategory:'all',step:1,layout:layouts[0],category:'all',color:'#fffaf0',frame:'plain',caption:'',filter:'original',photos:[],demo:true,stream:null,busy:false,token:0};
const stickerEditor=createStickerEditor($('#strip'),$('.sticker-layer'),draw);
const sample=new Image();sample.src='assets/portrait.jpg';sample.onload=draw;
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),4000)}
function stopCamera(){state.token++;state.busy=false;state.stream?.getTracks().forEach(t=>t.stop());state.stream=null}
function setStep(n){
 if(state.busy)return toast('Please wait for the current shot.');
 if(n>=3&&state.photos.length<state.layout.count)return toast(`Take or upload ${state.layout.count} photos first.`);
 if(n!==2)stopCamera();state.step=n;render();
}
function title(t){return `<div class="title-row"><h2>${t}</h2></div>`}
function next(label,id='next'){return `<button class="primary" id="${id}">${label} <span>→</span></button>`}
function render(){
 document.body.dataset.step=state.step;
 document.querySelectorAll('.step').forEach(b=>{b.classList.toggle('active',+b.dataset.step===state.step);b.setAttribute('aria-current',+b.dataset.step===state.step?'step':'false')});
 const panel=$('#controlPanel');
 $('#framePicker').hidden=state.step!==3;$('.sticker-picker').hidden=state.step!==4;
 $('.sticker-layer').style.pointerEvents=state.step===4?'auto':'none';
 if(state.step===1){
 panel.innerHTML=title('Choose your layout')+`<div class="layout-grid">${layouts.map(l=>`<button class="layout-card ${l.id===state.layout.id?'selected':''}" data-layout="${l.id}" aria-pressed="${l.id===state.layout.id}"><span class="layout-icon ${l.id}">${'<b></b>'.repeat(l.count)}</span><span class="layout-name">${l.name}</span></button>`).join('')}</div><p class="hint">Classic strips · 1:3 proportions</p><button class="primary" id="toCamera" aria-label="Open camera"><span aria-hidden="true">📷</span></button>`;
 panel.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{const scroll=$('.layout-grid').scrollLeft;state.layout=layouts.find(l=>l.id===b.dataset.layout);render();$('.layout-grid').scrollLeft=scroll});$('#toCamera').onclick=()=>setStep(2);
 }else if(state.step===2){
 panel.innerHTML=title('Make a little memory')+`<div class="camera-box"><div class="camera-empty">Camera preview</div><video id="video" autoplay muted playsinline></video><span class="counter" aria-live="assertive"></span></div><div class="row"><button id="enableCamera">Enable camera</button><button id="upload">Upload photos</button><input type="file" id="files" accept="image/*" multiple hidden></div><div class="row"><label>Timer <select id="delay"><option value="5">5 sec</option><option value="3">3 sec</option><option value="0">Off</option></select></label><label>Mode <select id="mode"><option value="single">One at a time</option><option value="auto">Auto sequence</option></select></label></div><div class="thumbnails"></div><p class="hint">${Math.min(state.photos.length,state.layout.count)} / ${state.layout.count} photos · take your time between poses</p><button class="primary" id="capture" ${state.stream?'':'disabled'}>${state.photos.length>=state.layout.count?'Retake photos':'Take photo'} <span>📷</span></button><button class="secondary" id="toEdit" ${state.photos.length>=state.layout.count?'':'disabled'}>Choose borders →</button>`;
 state.photos.slice(0,state.layout.count).forEach(im=>{const el=new Image();el.src=im.src;el.alt='Captured photo';$('.thumbnails').append(el)});
 if(state.stream)attachVideo();$('#enableCamera').onclick=startCamera;$('#upload').onclick=()=>$('#files').click();$('#files').onchange=upload;$('#capture').onclick=capture;$('#toEdit').onclick=()=>setStep(3);
 }else if(state.step===3){
 panel.innerHTML=title('Find your finish')+`<label class="label" for="filter">Photo filter</label><select id="filter" class="filter-select"><option value="original">Original</option><option value="bw">Black & white</option><option value="warm">Vintage</option><option value="soft">Soft</option></select>`+next('Add stickers');$('#filter').value=state.filter;$('#filter').onchange=e=>{state.filter=e.target.value;draw()};$('#next').onclick=()=>setStep(4);
 }else if(state.step===4){
 panel.innerHTML=title('Make it yours')+`<p class="hint">Tap to add. Drag, resize & rotate on your photo.</p>`+next('Ready to save');$('#next').onclick=()=>setStep(5);
 }else{
 panel.innerHTML=title('Your photostrip')+`<label class="label" for="caption">A little note (optional)</label><input class="text-input" id="caption" maxlength="40" placeholder="a day to remember"><label class="label" for="format">Save as</label><select id="format"><option value="png">PNG · best quality</option><option value="jpeg">JPG · smaller file</option></select>`+next('Download','download')+`<button class="secondary" id="again">Back to stickers</button>`;$('#caption').value=state.caption;$('#caption').oninput=e=>{state.caption=e.target.value;draw()};$('#download').onclick=download;$('#again').onclick=()=>setStep(4);
 }
 draw();
}
function attachVideo(){const v=$('#video');v.style.display='block';v.srcObject=state.stream;$('.camera-empty').style.display='none';v.play().catch(()=>{});}
async function startCamera(){if(state.stream)return;const token=state.token;$('#enableCamera').disabled=true;try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('unsupported');const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280}},audio:false});if(state.step!==2||token!==state.token){stream.getTracks().forEach(t=>t.stop());return}state.stream=stream;attachVideo();$('#capture').disabled=false;$('#enableCamera').textContent='Camera is on'}catch(e){toast(e.name==='NotAllowedError'?'Allow camera access in your browser, or upload photos.':'No camera found. Connect one or upload photos.');if($('#enableCamera'))$('#enableCamera').disabled=false}}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function capture(){
 if(state.busy||!state.stream)return;const v=$('#video');if(!v.videoWidth)return toast('Camera is getting ready.');
 if(state.photos.length>=state.layout.count)state.photos=[];
 state.busy=true;state.demo=false;const token=state.token,delay=+$('#delay').value,auto=$('#mode').value==='auto',total=auto?state.layout.count-state.photos.length:1;
 $('#capture').disabled=true;$('#upload').disabled=true;
 try{for(let i=0;i<total;i++){
  for(let j=delay;j>0;j--){$('.counter').textContent=j;await wait(1000);if(token!==state.token)return}
  $('.counter').textContent='♡';const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;const ctx=c.getContext('2d');ctx.translate(c.width,0);ctx.scale(-1,1);ctx.drawImage(v,0,0);state.photos.push(await loadImage(c.toDataURL('image/jpeg',.95)));draw();await wait(auto?1500:350);if(token!==state.token)return;
 }state.busy=false;render();}catch{state.busy=false;toast('Capture interrupted. Please try again.');render()}
}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
async function upload(e){const files=[...e.target.files];if(!files.length)return;state.busy=true;$('#upload').disabled=true;try{const incoming=[];for(const file of files.slice(0,state.layout.count)){if(!file.type.startsWith('image/'))continue;if(file.size>25*1024*1024){toast('Each photo must be under 25 MB.');continue}const url=URL.createObjectURL(file);try{incoming.push(await loadImage(url))}catch{toast('Could not read a photo. Try JPG or PNG.')}finally{URL.revokeObjectURL(url)}}if(state.photos.length>=state.layout.count)state.photos=[];state.photos.push(...incoming);state.photos=state.photos.slice(0,state.layout.count);state.demo=false;}finally{state.busy=false;render()}}
function draw(){
 const c=$('#strip');if(!c)return;
 const size=renderFrame(c,state,sample);
 stickerEditor.paint(c);
 stickerEditor.sync();
 fitPreview(size.width,size.height);
 $('#toggleDemo').textContent=state.demo?'Hide sample':'Show sample';
 syncFrameSelection();
}
let materialRequest=0;
let borderCategory='Solid colors';
function renderFrameLibrary(){
 const categories=['Solid colors','Polka dots','Checks','Gradients','Animal prints','Others'];
 $('#borderCategories').innerHTML=categories.map(c=>`<button aria-pressed="${c===borderCategory}" data-border-category="${c}">${c}</button>`).join('');
 $('#borderCategories').querySelectorAll('button').forEach(b=>b.onclick=()=>{borderCategory=b.dataset.borderCategory;renderFrameLibrary()});
 const grid=$('#frameGrid');
 grid.innerHTML=borderCategory==='Solid colors'?'<label class="custom-material" title="Custom color"><input type="color" id="customColor" value="'+state.color+'" aria-label="Custom border color"></label>'+palette.map(([name,color])=>`<button class="material-swatch" data-color="${color}" style="background:${color}" aria-label="${name}" title="${name}"></button>`).join(''):textures.filter(t=>t.category===borderCategory).map(t=>`<button class="material-swatch" data-material="${t.id}" aria-label="${t.name}" title="${t.name}"><img src="${textureSwatch(t.id)}" alt="" draggable="false"></button>`).join('');
 grid.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{materialRequest++;state.frame='plain';state.color=b.dataset.color;draw()});
 grid.querySelectorAll('[data-material]').forEach(b=>b.onclick=async()=>{const request=++materialRequest;b.setAttribute('aria-busy','true');try{await loadTexture(b.dataset.material);if(request!==materialRequest)return;state.frame=b.dataset.material;state.color=textures.find(t=>t.id===state.frame).bg;draw()}catch{toast('Could not load material. Please retry.')}finally{b.removeAttribute('aria-busy')}});
 if($('#customColor'))$('#customColor').oninput=e=>{materialRequest++;state.frame='plain';state.color=e.target.value;draw()};syncFrameSelection();
}
function syncFrameSelection(){
 document.querySelectorAll('[data-material]').forEach(b=>b.setAttribute('aria-pressed',String(state.frame===b.dataset.material)));
 document.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(state.frame==='plain'&&state.color===b.dataset.color)));
 $('#selectedFrame').textContent=textures.find(t=>t.id===state.frame)?.name||palette.find(p=>p[1]===state.color)?.[0]||'Custom color';
 if($('#customColor'))$('#customColor').value=state.color;
}
function download(){if(state.photos.length<state.layout.count)return toast('Finish taking your photos first.');const format=$('#format').value;$('#strip').toBlob(blob=>{if(!blob)return toast('Export failed. Please retry.');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`photobooth-${Date.now()}.${format==='jpeg'?'jpg':'png'}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('Your photo is ready.')},`image/${format}`,.95)}
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>setStep(+b.dataset.step));$('#toggleDemo').onclick=()=>{state.demo=!state.demo;draw()};$('#navBooth').onclick=()=>setStep(1);$('#navAbout').onclick=()=>$('#about').showModal();$('#about .close').onclick=()=>$('#about').close();$('#about').onclick=e=>{if(e.target===$('#about'))$('#about').close()};
window.addEventListener('pagehide',stopCamera);
renderFrameLibrary();render();
document.fonts.ready.then(draw);

function fitPreview(w=$('#strip').width,h=$('#strip').height){
 const stage=$('.preview-stage');
 const desktop=window.matchMedia('(min-width:1000px)').matches;
 const availableHeight=desktop?Math.max(100,stage.clientHeight-42):Math.min(500,Math.max(100,stage.clientHeight-32));
 const availableWidth=desktop?Math.max(100,stage.clientWidth-48):Math.min(360,Math.max(100,stage.clientWidth-40));
 $('.paper-wrap').style.width=`${Math.min(availableWidth,availableHeight*w/h)}px`;
}
new ResizeObserver(()=>fitPreview()).observe($('.preview-stage'));
