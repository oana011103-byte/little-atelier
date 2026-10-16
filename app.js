import {createStickerEditor} from './sticker-editor.js?v=rotate12';
import {renderFrame} from './frame-art.js?v=pink14';
import {textures,textureSwatch,loadTexture} from './textures.js?v=8';
import {palette} from './frame-catalog.js';
const $=s=>document.querySelector(s);
const layouts=[{id:'classic',name:'经典四连',count:4,cols:1,kind:'strip'},{id:'trio',name:'心动三连',count:3,cols:1,kind:'strip'},{id:'duo',name:'双倍快乐',count:2,cols:1,kind:'strip'},{id:'grid',name:'四格日记',count:4,cols:2,kind:'special'},{id:'single',name:'一张宝丽来',count:1,cols:1,kind:'special'},{id:'six',name:'六格故事',count:6,cols:2,kind:'special'}];
const state={frameCategory:'all',step:1,layout:layouts[0],category:'all',color:'#faf8f1',frame:'plain',caption:'',filter:'bw',photos:[],demo:true,stream:null,busy:false,token:0};
const stickerEditor=createStickerEditor($('#strip'),$('.sticker-layer'),draw);
const sample=new Image();sample.src='assets/portrait.jpg';sample.onload=draw;
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),4000)}
function stopCamera(){state.token++;state.busy=false;state.stream?.getTracks().forEach(t=>t.stop());state.stream=null}
function setStep(n){if(state.busy)return toast('正在拍摄，请稍等片刻');if(n===3&&state.photos.length<state.layout.count)return toast(`请先拍摄或上传 ${state.layout.count} 张照片`);if(n!==2)stopCamera();state.step=n;render();}
function title(t,s){return `<div class="title-row"><div><h2>${t}</h2></div></div>`}
function render(){document.querySelectorAll('.step').forEach(b=>b.classList.toggle('active',+b.dataset.step===state.step));const panel=$('#controlPanel');if(state.step===1){panel.innerHTML=title('选择排版','一张、两张，或者把快乐排成一整条。')+`<div class="layout-grid">${layouts.map(l=>`<button class="layout-card ${l.id===state.layout.id?'selected':''}" data-layout="${l.id}" aria-pressed="${l.id===state.layout.id}"><span class="check">${l.id===state.layout.id?'✓':''}</span><span class="layout-icon ${l.id}">${'<b></b>'.repeat(l.count)}</span><span class="layout-name">${l.name}<small>${l.count} 张</small></span></button>`).join('')}</div><button class="primary" id="toCamera" aria-label="开始拍照"><span aria-hidden="true" style="font-family:Apple Color Emoji,Segoe UI Emoji,sans-serif">📷</span></button>`;panel.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{const scroll=$('.layout-grid').scrollLeft;state.layout=layouts.find(l=>l.id===b.dataset.layout);render();$('.layout-grid').scrollLeft=scroll});$('#toCamera').onclick=()=>setStep(2)}else if(state.step===2){panel.innerHTML=title('拍照','准备好你的笑容，或者上传喜欢的照片。')+`<div class="camera-box"><div class="camera-empty"><span>◎</span>打开摄像头<br><br>也可以直接上传照片</div><video id="video" autoplay muted playsinline></video><span class="counter" aria-live="assertive"></span></div><div class="row"><button id="enableCamera">◎ 打开摄像头</button><label>倒计时 <select id="delay"><option value="3">3 秒</option><option value="5">5 秒</option><option value="0">无</option></select></label><button class="upload" id="upload">↑ 上传照片</button><input type="file" id="files" accept="image/*" multiple hidden></div><div class="thumbnails"></div><button class="primary" id="capture" ${state.stream?'':'disabled'}>连拍 ${state.layout.count} 张 <span>◎</span></button><button class="secondary" id="toEdit" style="width:100%;margin-top:9px" ${state.photos.length>=state.layout.count?'':'disabled'}>编辑照片 ↗</button>`;const thumbs=$('.thumbnails');state.photos.slice(0,state.layout.count).forEach(im=>{const el=new Image();el.src=im.src;el.alt='已选照片';thumbs.append(el)});if(state.stream)attachVideo();$('#enableCamera').onclick=startCamera;$('#upload').onclick=()=>$('#files').click();$('#files').onchange=upload;$('#capture').onclick=capture;$('#toEdit').onclick=()=>setStep(3)}else{panel.innerHTML=title('编辑照片','加上一点喜欢，让这一刻变得独一无二。')+`<button class="secondary browse-frames" id="browseFrames">更换相框与底色 ↗</button><label class="label" for="filter">滤镜</label><div class="row"><select class="filter-select" id="filter"><option value="original">原图</option><option value="bw">黑白</option><option value="warm">复古</option><option value="soft">柔光</option></select></div><label class="label" for="caption">文字（可选）</label><input class="text-input" id="caption" maxlength="40"><div class="edit-actions"><button class="primary" id="download">下载 PNG <span>↓</span></button><button class="secondary" id="again">再拍一次 ↺</button></div>`;$('#caption').value=state.caption;$('#filter').value=state.filter;$('#caption').oninput=e=>{state.caption=e.target.value;draw()};$('#filter').onchange=e=>{state.filter=e.target.value;draw()};$('#browseFrames').onclick=()=>$('#framePicker').scrollIntoView({behavior:'smooth',block:'center'});$('#download').onclick=download;$('#again').onclick=()=>setStep(2)}draw()}
function attachVideo(){const v=$('#video');v.style.display='block';v.srcObject=state.stream;$('.camera-empty').style.display='none';v.play().catch(()=>{});}
async function startCamera(){if(state.stream)return;const token=state.token;$('#enableCamera').disabled=true;try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('unsupported');const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280}},audio:false});if(state.step!==2||token!==state.token){stream.getTracks().forEach(t=>t.stop());return}state.stream=stream;attachVideo();$('#capture').disabled=false;$('#enableCamera').textContent='● 摄像头已开启'}catch(e){toast(e.name==='NotAllowedError'?'摄像头权限未开启，可在浏览器中允许，或直接上传照片。':'未找到可用摄像头，请连接设备或上传照片。');if($('#enableCamera'))$('#enableCamera').disabled=false}}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function capture(){if(state.busy||!state.stream)return;const v=$('#video');if(!v.videoWidth)return toast('摄像头还在准备，请稍后再试');state.busy=true;state.photos=[];state.demo=false;const token=state.token;const delay=+$('#delay').value;$('#capture').disabled=true;$('#upload').disabled=true;try{for(let i=0;i<state.layout.count;i++){for(let j=delay;j>0;j--){$('.counter').textContent=j;await wait(1000);if(token!==state.token)return}$('.counter').textContent='♡';const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;const ctx=c.getContext('2d');ctx.translate(c.width,0);ctx.scale(-1,1);ctx.drawImage(v,0,0);const im=await loadImage(c.toDataURL('image/jpeg',.95));state.photos.push(im);draw();await wait(400);if(token!==state.token)return}state.busy=false;setStep(3)}catch(e){state.busy=false;toast('拍摄中断，请重新尝试');render()}}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
async function upload(e){const files=[...e.target.files];if(!files.length)return;state.busy=true;$('#upload').disabled=true;try{const incoming=[];for(const file of files.slice(0,state.layout.count)){if(!file.type.startsWith('image/'))continue;if(file.size>25*1024*1024){toast('单张照片请小于 25 MB');continue}const url=URL.createObjectURL(file);try{incoming.push(await loadImage(url))}catch{toast('有一张照片无法读取，请尝试 JPG 或 PNG')}finally{URL.revokeObjectURL(url)}}if(state.photos.length>=state.layout.count)state.photos=[];state.photos.push(...incoming);state.photos=state.photos.slice(0,state.layout.count);state.demo=false;}finally{state.busy=false;render()}}
function draw(){
 const c=$('#strip');if(!c)return;
 const size=renderFrame(c,state,sample);
 stickerEditor.paint(c);
 stickerEditor.sync();
 fitPreview(size.width,size.height);
 $('#toggleDemo').textContent=state.demo?'隐藏示例':'显示示例';
 syncFrameSelection();
}
let materialRequest=0;
function renderFrameLibrary(){
 const grid=$('#frameGrid');
 grid.innerHTML='<label class="custom-material" title="自选颜色"><input type="color" id="customColor" value="'+state.color+'" aria-label="自选边框颜色"></label>'+
 palette.map(([name,color])=>`<button class="material-swatch" data-color="${color}" style="background:${color}" aria-label="${name}" title="${name}"></button>`).join('')+
 textures.map(t=>`<button class="material-swatch" data-material="${t.id}" aria-label="${t.name}" title="${t.name}"><img src="${textureSwatch(t.id)}" alt="" draggable="false"></button>`).join('');
 grid.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{if(state.busy)return;materialRequest++;state.frame='plain';state.color=b.dataset.color;draw()});
 grid.querySelectorAll('[data-material]').forEach(b=>b.onclick=async()=>{if(state.busy)return;const request=++materialRequest;b.setAttribute('aria-busy','true');try{await loadTexture(b.dataset.material);if(request!==materialRequest)return;state.frame=b.dataset.material;state.color=textures.find(t=>t.id===state.frame).bg;draw()}catch{toast('材质加载失败，请再试一次')}finally{b.removeAttribute('aria-busy')}});
 $('#customColor').oninput=e=>{if(state.busy)return;materialRequest++;state.frame='plain';state.color=e.target.value;draw()};
 syncFrameSelection();
}
function syncFrameSelection(){
 document.querySelectorAll('[data-material]').forEach(b=>b.setAttribute('aria-pressed',String(state.frame===b.dataset.material)));
 document.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(state.frame==='plain'&&state.color===b.dataset.color)));
 $('#selectedFrame').textContent=textures.find(t=>t.id===state.frame)?.name||palette.find(p=>p[1]===state.color)?.[0]||'自选颜色';
 if($('#customColor'))$('#customColor').value=state.color;
}
function download(){if(state.photos.length<state.layout.count)return toast('请先完成拍照或上传照片');$('#strip').toBlob(blob=>{if(!blob)return toast('导出失败，请重试');const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`petal-${Date.now()}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('照片已导出')},'image/png')}
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>setStep(+b.dataset.step));$('#toggleDemo').onclick=()=>{state.demo=!state.demo;draw()};$('#navBooth').onclick=()=>{setStep(1);$('#workspace').scrollIntoView({behavior:'smooth'})};$('#navFrames').onclick=()=>$('#framePicker').scrollIntoView({behavior:'smooth',block:'center'});$('#navAbout').onclick=()=>$('#about').showModal();$('#about .close').onclick=()=>$('#about').close();$('#about').onclick=e=>{if(e.target===$('#about'))$('#about').close()};
window.addEventListener('pagehide',stopCamera);
renderFrameLibrary();render();
document.fonts.load('42px OanaHand').then(draw);

function fitPreview(w=$('#strip').width,h=$('#strip').height){
 const stage=$('.preview-stage');
 const desktop=window.matchMedia('(min-width:1000px)').matches;
 const availableHeight=desktop?Math.max(100,stage.clientHeight-42):Math.min(500,Math.max(100,stage.clientHeight-32));
 const availableWidth=desktop?Math.max(100,stage.clientWidth-48):Math.min(360,Math.max(100,stage.clientWidth-40));
 $('.paper-wrap').style.width=`${Math.min(availableWidth,availableHeight*w/h)}px`;
}
new ResizeObserver(()=>fitPreview()).observe($('.preview-stage'));
