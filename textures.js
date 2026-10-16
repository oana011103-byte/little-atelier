// Original repeatable artwork. One renderer supplies both swatches and export.
const entries = [
 ['粉色格纹','gingham','#f8e9ec','#c98b9e'],['蓝色格纹','gingham','#edf5fa','#7496bc'],['绿色格纹','gingham','#eff0dd','#75865c'],['红色格纹','gingham','#f9eee0','#8e2935'],['紫色格纹','gingham','#f2eaf9','#a48abd'],
 ['黑白棋盘','checker','#f9f6ed','#34312f'],['樱粉棋盘','checker','#fff3ec','#df9bb0'],['酒红棋盘','checker','#faf2dc','#791f32'],['蓝黄棋盘','checker','#efd46d','#375774'],
 ['粉色波点','dots','#f1c8d6','#77283f'],['奶油波点','dots','#faf5e7','#343026'],['蓝色波点','dots','#c5dbe8','#5a3f50'],['黑底碎点','dots','#28262e','#eee8dc'],
 ['粉色细条','stripes','#fff4ed','#dfb8c2'],['黄油条纹','stripes','#fffbea','#e9d983'],['蓝色条纹','stripes','#f1f7f8','#93b5c8'],
 ['粉色菱格','argyle','#f9e9ed','#d7a8b9'],['紫色菱格','argyle','#eae3f3','#a98fb6'],
 ['玫瑰碎花','flowers','#fcf5df','#bd7189'],['蓝色小花','flowers','#edf4f2','#749dbb'],['奶油雏菊','daisy','#b9c5a1','#fffdf0'],['黑底雏菊','daisy','#272a2b','#f6efe0'],
 ['粉色爱心','hearts','#fce9ef','#c97494'],['酒红爱心','hearts','#722336','#f3d1d7'],['樱桃','cherry','#fff5de','#a62539'],['蝴蝶结','bows','#fff0f2','#b88599'],
 ['奶牛纹','cow','#faf7ed','#252426'],['经典豹纹','leopard','#bc956b','#47342a'],['粉色豹纹','leopard','#e7b7ca','#5e3448'],['斑马纹','zebra','#f9f7f0','#343134'],
 ['亚麻','linen','#e8dfcb','#b3a58b'],['牛仔','linen','#677d8d','#c6d2d6'],['粉色织物','linen','#e8cbd5','#a77b91'],['银色闪粉','glitter','#d3cfcb','#fffaf4'],['莓红闪粉','glitter','#9c2c61','#f2b0ce'],
 ['白色大理石','marble','#f8f7f2','#acaeab'],['黑色大理石','marble','#242529','#b5b1a3'],
 ['蜜桃光晕','aura','#f7cfb7','#e47c87'],['蓝色光晕','aura','#bfdbdf','#2e758a'],['丁香光晕','aura','#e6c5dc','#9d7cc0'],['抹茶光晕','aura','#dce5ce','#657b61'],['莓果光晕','aura','#ebb6c7','#9e294f'],['粉蓝渐变','gradient','#f2bbd1','#accfe5']
];
export const textures=entries.map(([name,type,bg,fg],i)=>({id:`texture-${i}`,name,type,bg,fg})).filter(t=>!['flowers','daisy'].includes(t.type)&&!['紫色菱格','粉色爱心','酒红爱心','樱桃','蝴蝶结','奶牛纹','经典豹纹','粉色豹纹'].includes(t.name));
const supplied=[['蓝花棉布','#f6f1df'],['浅蓝织纹','#d5ebf1'],['手绘星星','#ffffff'],['绒面豹纹','#987451'],['小鹿斑点','#a46b42'],['糖果彩点','#ffffff'],['白色蕾丝','#f4f4f2'],['浅灰格纹','#f4f4f4']];
textures.unshift(...supplied.map(([name,bg],i)=>({id:`supplied-${i+1}`,name,bg,type:'image',src:`assets/textures/user-${i+1}.jpg`,crop:i===4?.44:1})));
const imageLoads=new Map();
export function loadTexture(id){
 const t=textures.find(t=>t.id===id);if(t?.type!=='image')return Promise.resolve();
 if(!imageLoads.has(id))imageLoads.set(id,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{t.image=im;resolve()};im.onerror=()=>{imageLoads.delete(id);reject(new Error('材质加载失败'))};im.src=t.src}));
 return imageLoads.get(id);
}
const cache=new Map();
function rng(){let s=827;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)}
function dot(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill()}
function heart(c,x,y,color){c.fillStyle=color;c.beginPath();c.moveTo(x,y+10);c.bezierCurveTo(x-28,y-8,x-13,y-24,x,y-12);c.bezierCurveTo(x+13,y-24,x+28,y-8,x,y+10);c.fill()}
function tile(t){
 if(cache.has(t.id))return cache.get(t.id);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=160;const c=canvas.getContext('2d'),r=rng();
 c.fillStyle=t.bg;c.fillRect(0,0,160,160);c.fillStyle=t.fg;c.strokeStyle=t.fg;
 if(t.type==='gingham'){c.globalAlpha=.45;for(let i=0;i<160;i+=40){c.fillRect(i,0,20,160);c.fillRect(0,i,160,20)}c.globalAlpha=1}
 if(t.type==='checker')for(let y=0;y<4;y++)for(let x=0;x<4;x++)if((x+y)%2===0)c.fillRect(x*40,y*40,40,40);
 if(t.type==='dots')for(let y=20;y<160;y+=40)for(let x=20+(y%80===20?0:20);x<180;x+=40)dot(c,x,y,5,t.fg);
 if(t.type==='stripes')for(let x=0;x<160;x+=16)c.fillRect(x,0,6,160);
 if(t.type==='argyle'){for(let y=-40;y<200;y+=80)for(let x=0;x<200;x+=80){c.beginPath();c.moveTo(x,y);c.lineTo(x+40,y+40);c.lineTo(x,y+80);c.lineTo(x-40,y+40);c.closePath();c.fill()}c.strokeStyle=t.bg;c.setLineDash([3,3]);for(let x=-160;x<320;x+=80){c.beginPath();c.moveTo(x,0);c.lineTo(x+160,160);c.moveTo(x,160);c.lineTo(x+160,0);c.stroke()}}
 if(['flowers','daisy','hearts','cherry','bows'].includes(t.type))for(const [x,y] of [[40,40],[120,120]]){
  if(t.type==='hearts')heart(c,x,y,t.fg);
  if(t.type==='flowers'||t.type==='daisy'){c.strokeStyle='#84916b';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+8,y+23,x-4,y+35);c.stroke();c.fillStyle='#96a27b';c.beginPath();c.ellipse(x+8,y+20,10,4,-.6,0,Math.PI*2);c.fill();for(let i=0;i<6;i++){let a=i*Math.PI/3;dot(c,x+Math.cos(a)*10,y+Math.sin(a)*10,7,t.fg)}dot(c,x,y,5,'#e5c978')}
  if(t.type==='cherry'){c.strokeStyle='#64764e';c.lineWidth=2;c.beginPath();c.moveTo(x-9,y+5);c.quadraticCurveTo(x-6,y-10,x+8,y-20);c.lineTo(x+14,y+6);c.stroke();dot(c,x-9,y+7,9,t.fg);dot(c,x+14,y+10,10,t.fg);dot(c,x-12,y+4,2,'#f7c5c0')}
  if(t.type==='bows'){c.lineWidth=3;c.strokeStyle=t.fg;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-42,y-30,x-38,y+20,x,y);c.bezierCurveTo(x+42,y-30,x+38,y+20,x,y);c.moveTo(x,y);c.quadraticCurveTo(x-4,y+20,x-20,y+28);c.moveTo(x,y);c.quadraticCurveTo(x+4,y+20,x+20,y+28);c.stroke();dot(c,x,y,4,t.fg)}
 }
 if(t.type==='cow'||t.type==='leopard')for(let y=20;y<160;y+=40)for(let x=20;x<160;x+=40){const xx=x+(r()-.5)*18,yy=y+(r()-.5)*18;c.beginPath();for(let i=0;i<12;i++){const a=i*Math.PI/6,rad=(t.type==='cow'?19:12)*(r()*.6+.6);c.lineTo(xx+Math.cos(a)*rad,yy+Math.sin(a)*rad)}c.closePath();if(t.type==='cow'){c.fillStyle=t.fg;c.fill()}else{c.fillStyle='#c29a86';c.fill();c.strokeStyle=t.fg;c.lineWidth=5;c.stroke()}}
 if(t.type==='zebra'){c.lineWidth=12;for(let y=-20;y<200;y+=32){c.beginPath();c.moveTo(0,y);c.bezierCurveTo(55,y+35,105,y-35,160,y);c.stroke()}}
 if(t.type==='linen'||t.type==='gingham'){c.lineWidth=.6;for(let i=0;i<160;i+=3){c.strokeStyle=i%2?'#ffffff40':'#302c3320';c.beginPath();c.moveTo(i,0);c.lineTo(i,160);c.moveTo(0,i);c.lineTo(160,i);c.stroke()}}
 if(t.type==='glitter')for(let i=0;i<2200;i++)dot(c,r()*160,r()*160,.4+r()*1.2,r()>.5?t.fg:'#ffffff66');
 if(t.type==='marble'){c.lineWidth=1;for(let i=0;i<7;i++){c.globalAlpha=.12+r()*.25;c.beginPath();const y=i*30-10;c.moveTo(0,y);c.bezierCurveTo(55,y+25,95,y-25,160,y);c.stroke()}c.globalAlpha=1}
 cache.set(t.id,canvas);return canvas;
}
export function paintTexture(c,w,h,id){
 const t=textures.find(t=>t.id===id);if(!t)return;
 c.save();
 if(t.type==='image'){
  if(t.image){
   if(!cache.has(t.id)){
    // Mirror edges to avoid hard seams; omit the screenshot seam in the deer source.
    const im=t.image,sw=im.naturalWidth,sh=Math.floor(im.naturalHeight*t.crop),tw=650,th=Math.round(sh/sw*tw);
    const tile=document.createElement('canvas');tile.width=tw*2;tile.height=th*2;const tc=tile.getContext('2d');
    for(let y=0;y<2;y++)for(let x=0;x<2;x++){tc.save();tc.translate(x?tw*2:0,y?th*2:0);tc.scale(x?-1:1,y?-1:1);tc.drawImage(im,0,0,sw,sh,0,0,tw,th);tc.restore()}
    cache.set(t.id,tile);
   }
   c.fillStyle=c.createPattern(cache.get(t.id),'repeat');c.fillRect(0,0,w,h);
  }
  c.restore();return;
 }
 if(t.type==='aura'||t.type==='gradient'){let g=t.type==='aura'?c.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,Math.max(w,h)*.6):c.createLinearGradient(0,0,w,h);g.addColorStop(0,t.fg);g.addColorStop(1,t.bg);c.fillStyle=g}
 else{c.fillStyle=c.createPattern(tile(t),'repeat')}
 c.fillRect(0,0,w,h);c.restore();
}
export function textureSwatch(id){const t=textures.find(t=>t.id===id);if(t?.type==='image')return t.src;const c=document.createElement('canvas');c.width=c.height=160;paintTexture(c.getContext('2d'),160,160,id);return c.toDataURL('image/png')}
