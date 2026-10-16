import {waitForVideo,cameraMessage} from './camera-runtime.js?v=camera22';
import {createStickerEditor} from './sticker-editor.js?v=fit25';
import {renderFrame} from './frame-art.js?v=fit25';
import {textures,textureSwatch,loadTexture} from './textures.js?v=fit25';
import {palette} from './frame-catalog.js?v=wizard21';
const $=s=>document.querySelector(s);
const layouts=[{id:'classic',name:'Classic 4-cut',count:4,cols:1,kind:'strip'},{id:'trio',name:'Film 3-cut',count:3,cols:1,kind:'strip'},{id:'duo',name:'Double',count:2,cols:1,kind:'strip'},{id:'grid',name:'Wide 4-cut',count:4,cols:2,kind:'special'},{id:'single',name:'Polaroid',count:1,cols:1,kind:'special'},{id:'six',name:'Basic 6-cut',count:6,cols:2,kind:'special'}];
const state={frameCategory:'all',step:1,layout:layouts[0],category:'all',color:'#fffaf0',frame:'plain',caption:'',filter:'original',photos:[],demo:true,stream:null,busy:false,token:0,timer:5,mode:'single',cameraStarting:false,cameraReady:false,cameraError:''};
const stickerEditor=createStickerEditor($('#strip'),$('.sticker-layer'),draw);
const sample=new Image();sample.src='assets/portrait.jpg';sample.onload=draw;
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),4000)}
function stopCamera(){state.token++;state.busy=false;state.cameraStarting=false;state.cameraReady=false;state.stream?.getTracks().forEach(t=>t.stop());state.stream=null}
function setStep(n){
 if(state.busy)return toast('Please wait for the current shot.');
 if(n>=3&&state.photos.length<state.layout.count)return toast(`Take or upload ${state.layout.count} photos first.`);
 if(n!==2){stopCamera();state.cameraError='';}state.step=n;render();
}
function title(t){return `<div class="title-row"><h2>${t}</h2></div>`}
function next(label,id='next'){return `<button class="primary" id="${id}">${label} <span>→</span></button>`}
function render(){
 document.body.dataset.step=state.step;
 document.querySelectorAll('.step').forEach(b=>{b.classList.toggle('active',+b.dataset.step===state.step);b.setAttribute('aria-current',+b.dataset.step===state.step?'step':'false')});
 const panel=$('#controlPanel');$('#pageActions').replaceChildren();
 $('#framePicker').hidden=state.step!==3;$('.sticker-picker').hidden=state.step!==4;
 $('.sticker-layer').style.pointerEvents=state.step===4?'auto':'none';
 if(state.step===1){
 panel.innerHTML=title('Choose your layout')+`<div class="layout-grid">${layouts.map(l=>`<button class="layout-card ${l.id===state.layout.id?'selected':''}" data-layout="${l.id}" aria-pressed="${l.id===state.layout.id}"><span class="layout-icon ${l.id}">${'<b></b>'.repeat(l.count)}</span><span class="layout-name">${l.name}</span></button>`).join('')}</div><p class="hint">Classic strips · 1:3 proportions</p><button class="primary" id="toCamera" aria-label="Open camera"><span aria-hidden="true">📷</span></button><button class="secondary" id="upload">↑ Upload</button><input type="file" id="files" accept="image/*" multiple hidden>`;
 panel.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{const scroll=$('.layout-grid').scrollLeft;state.layout=layouts.find(l=>l.id===b.dataset.layout);render();$('.layout-grid').scrollLeft=scroll});$('#toCamera').onclick=()=>setStep(2);$('#upload').onclick=()=>$('#files').click();$('#files').onchange=upload;
 }else if(state.step===2){
 panel.innerHTML=title('Make a little memory')+`<div class="camera-box"><div class="camera-empty">Camera preview</div><video id="video" autoplay muted playsinline></video><span class="counter" aria-live="assertive"></span></div><div class="row"><button id="enableCamera">Enable camera</button><button id="upload">Upload photos</button><input type="file" id="files" accept="image/*" multiple hidden></div><div class="camera-options"><fieldset><legend>Timer</legend><div class="segmented">${[0,3,5,10].map(n=>`<button type="button" data-timer="${n}" aria-pressed="${state.timer===n}">${n?n+'s':'Off'}</button>`).join('')}</div></fieldset><fieldset><legend>Mode</legend><div class="segmented">${[['single','Single shot'],['auto','Auto sequence']].map(([id,label])=>`<button type="button" data-mode="${id}" aria-pressed="${state.mode===id}">${label}</button>`).join('')}</div></fieldset></div><p id="cameraStatus" class="camera-status" role="status" hidden></p><div class="thumbnails"></div><p class="hint">${Math.min(state.photos.length,state.layout.count)} / ${state.layout.count} photos · take your time between poses</p><button class="primary" id="capture" disabled>${state.photos.length>=state.layout.count?'Retake photos':'Take photo'} <span>📷</span></button><button class="secondary" id="toEdit" ${state.photos.length>=state.layout.count?'':'disabled'}>Choose borders →</button>`;
 state.photos.slice(0,state.layout.count).forEach(im=>{const el=new Image();el.src=im.src;el.alt='Captured photo';$('.thumbnails').append(el)});
 $('#enableCamera').onclick=startCamera;
 panel.querySelectorAll('[data-timer]').forEach(b=>b.onclick=()=>{if(state.busy)return;state.timer=+b.dataset.timer;panel.querySelectorAll('[data-timer]').forEach(x=>x.setAttribute('aria-pressed',String(+x.dataset.timer===state.timer)))});
 panel.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{if(state.busy)return;state.mode=b.dataset.mode;panel.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.mode===state.mode)))});
 if(state.stream)resumeCamera();else if(state.cameraStarting){$('#enableCamera').disabled=true;cameraStatus('Waiting for camera permission…')}else if(state.cameraError)cameraStatus(state.cameraError,true);
 $('#upload').onclick=()=>$('#files').click();$('#files').onchange=upload;$('#capture').onclick=capture;$('#toEdit').onclick=()=>setStep(3);
 }else if(state.step===3){
 panel.innerHTML=title('Find your finish')+`<label class="label" for="filter">Photo filter</label><select id="filter" class="filter-select"><option value="original">Original</option><option value="bw">Black & white</option><option value="warm">Vintage</option><option value="soft">Soft</option></select>`+next('Add stickers');$('#filter').value=state.filter;$('#filter').onchange=e=>{state.filter=e.target.value;draw()};$('#next').onclick=()=>setStep(4);
 }else if(state.step===4){
 panel.innerHTML=title('Make it yours')+`<p class="hint">Tap to add. Drag, resize & rotate on your photo.</p><input class="text-input" id="caption" aria-label="Optional caption" maxlength="40" placeholder="A little note (optional)">`+next('Ready to save');$('#caption').value=state.caption;$('#caption').oninput=e=>{state.caption=e.target.value;draw()};$('#next').onclick=()=>setStep(5);
 }else{
 panel.innerHTML=`<div class="save-options"><label for="format">Save as </label><select id="format"><option value="png">PNG</option><option value="jpeg">JPG</option></select></div><p class="save-hint">Press and hold your photo to save it on your phone.</p>`+`<button class="primary" id="download">Download</button>`+`<button class="secondary" id="share">Share</button><button class="text-back" id="again">Back to stickers</button>`;$('#download').onclick=download;$('#share').onclick=sharePhoto;$('#again').onclick=()=>setStep(4);

 }
 const actions=$('#pageActions');
 const groups=state.step===1?[['#toCamera','#upload']]:state.step===2?[['#capture','#upload'],['#toEdit']]:state.step===5?[['.save-options'],['.save-hint'],['#download'],['#share'],['#again']]:[['#next']];
 for(const group of groups){const row=document.createElement('div');row.className='action-row';for(const selector of group){const el=panel.querySelector(selector);if(el)row.append(el)}actions.append(row)}
 $('.preview-heading > span').textContent=state.step===5?'your photostrip!':'Your preview';
 $('#toggleDemo').hidden=state.step===5;$('#saveImage').hidden=state.step!==5;$('#strip').hidden=state.step===5;
 draw();
}
function cameraStatus(message,error=false){const el=$('#cameraStatus');if(!el)return;el.hidden=!message;el.textContent=message;el.classList.toggle('error',error)}
function cameraFailed(error,stream,token){
 stream?.getTracks().forEach(t=>t.stop());
 if(token!==state.token||state.step!==2)return;
 state.stream=null;state.cameraReady=false;state.cameraStarting=false;state.cameraError=cameraMessage(error);
 const v=$('#video');if(v){v.srcObject=null;v.style.display='none'}
 if($('.camera-empty')){$('.camera-empty').style.display='block';$('.camera-empty').textContent='Camera unavailable'}
 $('#enableCamera').disabled=false;$('#enableCamera').textContent='Retry camera';$('#capture').disabled=true;cameraStatus(state.cameraError,true);
}
async function attachVideo(stream,token){
 const v=$('#video');if(!v)return;
 state.cameraReady=false;$('#capture').disabled=true;
 v.muted=true;v.autoplay=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.style.display='block';v.srcObject=stream;
 cameraStatus('Starting camera…');
 await waitForVideo(v);
 if(state.step!==2||token!==state.token||$('#video')!==v||state.stream!==stream)return;
 state.cameraReady=true;state.cameraError='';$('.camera-empty').style.display='none';$('#capture').disabled=state.busy;$('#enableCamera').disabled=false;$('#enableCamera').textContent='Restart camera';cameraStatus('');
}
async function resumeCamera(){const stream=state.stream,token=state.token;try{await attachVideo(stream,token)}catch(e){if(state.stream===stream)cameraFailed(e,stream,token)}}
async function startCamera(){
 if(state.cameraStarting||state.busy)return;
 stopCamera();const token=state.token;state.cameraStarting=true;state.cameraError='';$('#enableCamera').disabled=true;$('#capture').disabled=true;cameraStatus('Waiting for camera permission…');let stream;
 try{
  if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw Object.assign(new Error('Unsupported camera'),{name:'CameraUnsupported'});
  try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'user'}},audio:false})}catch(e){if(e.name!=='OverconstrainedError')throw e;stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false})}
  if(state.step!==2||token!==state.token){stream.getTracks().forEach(t=>t.stop());return}
  state.stream=stream;
  stream.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>{if(state.stream===stream)cameraFailed({name:'NotReadableError'},stream,token)},{once:true}));
  await attachVideo(stream,token);
 }catch(e){cameraFailed(e,stream,token)}finally{if(token===state.token)state.cameraStarting=false}
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function capture(){
 if(state.busy||!state.stream||!state.cameraReady)return;const v=$('#video');if(v.readyState<2||!v.videoWidth)return toast('Camera is getting ready.');
 if(state.photos.length>=state.layout.count)state.photos=[];
 state.busy=true;state.demo=false;const token=state.token,delay=state.timer,auto=state.mode==='auto',total=auto?state.layout.count-state.photos.length:1;
 $('#capture').disabled=true;$('#upload').disabled=true;$('#enableCamera').disabled=true;document.querySelectorAll('.segmented button').forEach(b=>b.disabled=true);
 try{for(let i=0;i<total;i++){
  for(let j=delay;j>0;j--){$('.counter').textContent=j;await wait(1000);if(token!==state.token)return}
  $('.counter').textContent='♡';const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;const ctx=c.getContext('2d');ctx.translate(c.width,0);ctx.scale(-1,1);ctx.drawImage(v,0,0);state.photos.push(await loadImage(c.toDataURL('image/jpeg',.95)));draw();await wait(auto?1500:350);if(token!==state.token)return;
 }state.busy=false;render();}catch{state.busy=false;toast('Capture interrupted. Please try again.');render()}
}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
async function upload(e){const files=[...e.target.files];if(!files.length)return;state.busy=true;$('#upload').disabled=true;try{const incoming=[];for(const file of files.slice(0,state.layout.count)){if(!file.type.startsWith('image/'))continue;if(file.size>25*1024*1024){toast('Each photo must be under 25 MB.');continue}const url=URL.createObjectURL(file);try{incoming.push(await loadImage(url))}catch{toast('Could not read a photo. Try JPG or PNG.')}finally{URL.revokeObjectURL(url)}}if(state.photos.length>=state.layout.count)state.photos=[];state.photos.push(...incoming);state.photos=state.photos.slice(0,state.layout.count);state.demo=false;}finally{state.busy=false;if(state.step===1)state.step=state.photos.length>=state.layout.count?3:2;render()}}
function draw(){
 const c=$('#strip');if(!c)return;
 const size=renderFrame(c,state,sample);
 stickerEditor.paint(c);
 stickerEditor.sync();
 fitPreview(size.width,size.height);
 $('#toggleDemo').textContent=state.demo?'Hide sample':'Show sample';
 syncFrameSelection();
 if(state.step===5)prepareSavedImage();
}
let materialRequest=0;
let borderCategory='All';
function renderFrameLibrary(){
 const categories=['All','Solid colors','Polka dots','Checks','Gradients','Animal prints','Others'];
 $('#borderCategories').innerHTML=categories.map(c=>`<button aria-pressed="${c===borderCategory}" data-border-category="${c}">${c}</button>`).join('');
 $('#borderCategories').querySelectorAll('button').forEach(b=>b.onclick=()=>{borderCategory=b.dataset.borderCategory;renderFrameLibrary()});
 const grid=$('#frameGrid');
 const colors='<label class="custom-material" title="Custom color"><input type="color" id="customColor" value="'+state.color+'" aria-label="Custom border color"></label>'+palette.map(([name,color])=>`<button class="material-swatch" data-color="${color}" style="background:${color}" aria-label="${name}" title="${name}"></button>`).join('');
 const patterns=textures.filter(t=>borderCategory==='All'||t.category===borderCategory).map(t=>`<button class="material-swatch" data-material="${t.id}" aria-label="${t.name}" title="${t.name}"><img src="${textureSwatch(t.id)}" alt="" draggable="false"></button>`).join('');
 grid.innerHTML=(['All','Solid colors'].includes(borderCategory)?colors:'')+(borderCategory==='Solid colors'?'':patterns);
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
let savedImageUrl=null,savedBlob=null,saveRevision=0;
function prepareSavedImage(){const revision=++saveRevision;$('#strip').toBlob(blob=>{if(!blob||revision!==saveRevision)return;savedBlob=blob;if(savedImageUrl)URL.revokeObjectURL(savedImageUrl);savedImageUrl=URL.createObjectURL(blob);$('#saveImage').src=savedImageUrl},'image/png')}
async function sharePhoto(){
 if(!savedBlob)return toast('Your photo is still getting ready. Please try again.');
 const file=new File([savedBlob],'photostrip.png',{type:'image/png'});
 if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'My photostrip'})}catch(e){if(e.name!=='AbortError')toast('Could not share. Please use Download.')}}else{download();toast('Sharing is not supported here. Your photo was downloaded.')}
}
function download(){if(state.photos.length<state.layout.count)return toast('Finish taking your photos first.');const format=$('#format').value;$('#strip').toBlob(blob=>{if(!blob)return toast('Export failed. Please retry.');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`photobooth-${Date.now()}.${format==='jpeg'?'jpg':'png'}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('Your photo is ready.')},`image/${format}`,.95)}
document.querySelectorAll('.steps [data-step]').forEach(b=>b.onclick=()=>setStep(+b.dataset.step));$('#toggleDemo').onclick=()=>{state.demo=!state.demo;draw()};$('#navBooth').onclick=()=>setStep(1);$('#navAbout').onclick=()=>$('#about').showModal();$('#about .close').onclick=()=>$('#about').close();$('#about').onclick=e=>{if(e.target===$('#about'))$('#about').close()};
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
