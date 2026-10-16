import {paintTexture} from './textures.js?v=wizard21';
function darkColor(hex){const v=hex.replace('#','');const rgb=[0,2,4].map(i=>parseInt(v.slice(i,i+2),16));return rgb[0]*.299+rgb[1]*.587+rgb[2]*.114<130}
function random(seed=71){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
function paper(ctx,w,h,color){
  ctx.fillStyle=color;ctx.fillRect(0,0,w,h);
  const r=random();
  for(let i=0;i<w*h/95;i++){const x=r()*w,y=r()*h;ctx.fillStyle=r()>.55?'rgba(255,255,255,.24)':'rgba(85,66,46,.065)';ctx.fillRect(x,y,1+r()*2,1+r()*2)}
  ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1;
  for(let i=0;i<130;i++){const x=r()*w,y=r()*h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+7+r()*24,y+r()*5);ctx.stroke()}
}
function photo(ctx,image,x,y,w,h,filter,index,isSample){
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();if(image){ctx.filter=filter;const z=isSample?[1,1.2,1.08,1.32,1.1,1][index]:1;const scale=Math.max(w/image.naturalWidth,h/image.naturalHeight)*z;const dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;ctx.drawImage(image,x+(w-dw)/2,y+(h-dh)*(isSample?.26:.5),dw,dh)}else{ctx.fillStyle='#d5d3d4';ctx.fillRect(x,y,w,h);ctx.fillStyle='#f5f5ee';ctx.font='40px Courier New,monospace';ctx.textAlign='center';ctx.fillText(String(index+1).padStart(2,'0'),x+w/2,y+h/2+15)}ctx.restore();
}
export function renderFrame(canvas,state,sample,{thumbnail=false}={}){
 const {cols,count}=state.layout,rows=Math.ceil(count/cols),w=cols===2?1200:600;
 const margin=36,gap=18,top=36,bottom=100;
 const h=cols===1?(count===1?750:count===2?1200:1800):1800;
 const cellW=(w-margin*2-gap*(cols-1))/cols,cellH=(h-top-bottom-(rows-1)*gap)/rows;
 const scale=thumbnail?.16:1;canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);const ctx=canvas.getContext('2d');ctx.scale(scale,scale);
 paper(ctx,w,h,state.color);
 // The material fills the fixed border. Photo apertures are drawn above it.
 paintTexture(ctx,w,h,state.frame);
 for(let i=0;i<count;i++){
  const x=margin+i%cols*(cellW+gap),y=top+Math.floor(i/cols)*(cellH+gap);
  const im=state.photos[i]||(state.demo&&sample?.complete&&sample.naturalWidth?sample:null);
  const f={original:'none',bw:'grayscale(1)',warm:'sepia(.35) saturate(.8)',soft:'contrast(.88) brightness(1.12) saturate(.75)'}[state.filter];
  photo(ctx,im,x,y,cellW,cellH,f,i,im===sample);
 }
 if(state.caption){ctx.textAlign='center';ctx.fillStyle=darkColor(state.color)?'#fff6e6':'#67584f';ctx.font='28px Courier New,monospace';let caption=state.caption;while(ctx.measureText(caption).width>w-140&&caption.length)caption=caption.slice(0,-1);ctx.fillText(caption,w/2,h-62)}
 return {width:w,height:h};
}
