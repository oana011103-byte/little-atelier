import {retroImage} from './retro-filter.js?v=retro32';
import {paintTexture} from './textures.js?v=borders47';
function darkColor(hex){const v=hex.replace('#','');const rgb=[0,2,4].map(i=>parseInt(v.slice(i,i+2),16));return rgb[0]*.299+rgb[1]*.587+rgb[2]*.114<130}
function photo(ctx,image,x,y,w,h,filter,index,isSample){
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();if(image){ctx.filter=filter;const z=isSample?[1,1.2,1.08,1.32,1.1,1][index]:1;const scale=Math.max(w/(image.naturalWidth||image.width),h/(image.naturalHeight||image.height))*z;const dw=(image.naturalWidth||image.width)*scale,dh=(image.naturalHeight||image.height)*scale;ctx.drawImage(image,x+(w-dw)/2,y+(h-dh)*(isSample?.26:.5),dw,dh)}else{ctx.fillStyle='#d5d3d4';ctx.fillRect(x,y,w,h);ctx.fillStyle='#f5f5ee';ctx.font='40px Courier New,monospace';ctx.textAlign='center';ctx.fillText(String(index+1).padStart(2,'0'),x+w/2,y+h/2+15)}ctx.restore();
}
export function renderFrame(canvas,state,sample,{thumbnail=false}={}){
 const {count,width:w,height:h,cells}=state.layout;
 const scale=thumbnail?.16:1;canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);const ctx=canvas.getContext('2d');ctx.scale(scale,scale);
 ctx.fillStyle=state.color;ctx.fillRect(0,0,w,h);
 // The material fills the fixed border. Photo apertures are drawn above it.
 paintTexture(ctx,w,h,state.frame);
 for(let i=0;i<count;i++){
  const [x,y,cellW,cellH]=cells[i];
  const im=state.photos[i]||(state.demo&&sample?.complete&&sample.naturalWidth?sample:null);
  const f={original:'none',bw:'grayscale(1)',warm:'sepia(.35) saturate(.8)',soft:'contrast(.88) brightness(1.12) saturate(.75)'}[state.filter];
  photo(ctx,im&&state.filter==='retro'?retroImage(im,state.retro):im,x,y,cellW,cellH,f||'none',i,im===sample);
 }
 const logo=state.layout.logo,caption=state.caption?.trim();
 ctx.fillStyle=darkColor(state.color)?'#fff6e6':'#292729';
 if(logo){
  ctx.save();
  if(caption){
   const coordinates=logo.paths.join(' ').match(/-?\d+(?:\.\d+)?/g).map(Number);
   const xs=coordinates.filter((_,i)=>i%2===0),left=Math.min(...xs),right=Math.max(...xs);
   const logoScale=.8,logoHeight=(logo.bottom-logo.top)*logoScale;
   const gap=6,available=w*.8;
   let size=logoHeight*.5;
   ctx.textAlign='center';ctx.textBaseline='alphabetic';
   ctx.font=`${size}px "Atelier Script", "Songti SC", cursive`;
   let metrics=ctx.measureText(caption);
   const inkHeight=metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
   if(inkHeight>0)size*=logoHeight*.5/inkHeight;
   size*=2/3;
   ctx.font=`${size}px "Atelier Script", "Songti SC", cursive`;
   metrics=ctx.measureText(caption);
   if(metrics.width>available){size*=available/metrics.width;ctx.font=`${size}px "Atelier Script", "Songti SC", cursive`;metrics=ctx.measureText(caption)}
   const textHeight=metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
   const groupHeight=logoHeight+gap+textHeight;
   const photoBottom=Math.max(...cells.map(([,y,,height])=>y+height));
   const top=Math.max(photoBottom+6,Math.min((logo.top+logo.bottom-groupHeight)/2,h-8-groupHeight));
   ctx.save();ctx.translate(w/2-(left+right)*logoScale/2,top-logo.top*logoScale);ctx.scale(logoScale,logoScale);
   ctx.fill(new Path2D(logo.paths.join(' ')),'evenodd');ctx.restore();
   ctx.fillText(caption,w/2,top+logoHeight+gap+metrics.actualBoundingBoxAscent);
  }else ctx.fill(new Path2D(logo.paths.join(' ')),'evenodd');
  ctx.restore();
 }

 return {width:w,height:h};
}
