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
 const logo=state.layout.logo;
 if(logo){ctx.fillStyle=darkColor(state.color)?'#fff6e6':'#292729';ctx.fill(new Path2D(logo.paths.join(' ')),'evenodd')}
 if(state.caption){ctx.textAlign='center';ctx.fillStyle=darkColor(state.color)?'#fff6e6':'#67584f';const photoBottom=Math.max(...cells.map(([,y,,height])=>y+height));const captionSize=Math.max(8,Math.min(28,w*.035,(logo?.top??h)-photoBottom-16));ctx.font=`${captionSize}px Courier New,monospace`;let caption=state.caption;while(ctx.measureText(caption).width>w-140&&caption.length)caption=caption.slice(0,-1);ctx.fillText(caption,w/2,Math.min(h-Math.min(40,h*.045),(logo?.top??h)-12))}
 return {width:w,height:h};
}
