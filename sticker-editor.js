const artNames=['Angel wings','Pink balloons','Candy buttons','I love me','Green flower','Blue bow','Happy birthday','My dear'];
const art=artNames.map((name,i)=>({emoji:`art-${i+1}`,name,search:name.toLowerCase(),group:'art',src:`assets/supplied/sticker-${i+1}.png`}));
const artImages=new Map();
export function createStickerEditor(canvas, layer, redraw) {
  let choices = [], category = 'art', query = '', page = 0;
  const favorites = ['🌷','🍒','🎀','🦋','🍀','🍓','🐰','💗','⭐','🌼','🫧','🪿','🧸','🪩','🪽','🍰','🦢','🩰','🐈','🪷','🍋','🧁','💌','🎧'];
  const categories = [['art','Stickers'],['recommended','Emoji'],['recent','Recent'],['all','All emoji'],['Smileys & Emotion','Faces'],['Animals & Nature','Nature'],['Food & Drink','Food'],['Objects','Objects'],['Symbols','Symbols']];
  let recent = [];
  try { const saved=JSON.parse(localStorage.getItem('petal-recent-emoji')||'[]'); if(Array.isArray(saved))recent=saved.filter(x=>typeof x==='string').slice(0,32); } catch {}
  const items = [];
  let selected = null, nextId = 0;
  const tray = document.querySelector('.sticker-tray');
  const tabs=document.querySelector('.emoji-categories');
  const status=document.querySelector('#emojiStatus');
  const more=document.querySelector('#emojiMore');
  function filtered(){
    if(category==='art'&&!query)return art;
    if(query)return [...art,...choices].filter(c=>c.search.includes(query)||c.emoji.includes(query));
    if(category==='recommended'||category==='recent')return (category==='recent'?recent:favorites).map(e=>choices.find(c=>c.emoji===e)).filter(Boolean);
    return choices.filter(c=>category==='all'||c.group===category);
  }
  function renderLibrary(reset=true){
    if(reset){page=0;tray.scrollTop=0;tray.replaceChildren()}
    const matches=filtered(), start=page*120;
    for(const c of matches.slice(start,start+120))makeChoice(c.emoji,c.name);
    status.textContent=matches.length?`${matches.length} items`:category==='recent'&&!query?'Your recent stickers':'No matches';
    more.hidden=matches.length<=(page+1)*120;
    for(const b of tabs.children)b.setAttribute('aria-pressed',String(b.dataset.category===category&&!query));
  }
  for(const [id,label] of categories){const b=document.createElement('button');b.textContent=label;b.dataset.category=id;b.onclick=()=>{category=id;query='';renderLibrary()};tabs.append(b)}
  more.onclick=()=>{page++;renderLibrary(false)};
  async function loadLibrary(){
    status.textContent='Loading…';
    try{const response=await fetch('assets/emoji-catalog.json');if(!response.ok)throw new Error('catalog');choices=await response.json();choices.forEach(c=>{c.name=c.english||c.emoji});renderLibrary()}
    catch{status.textContent='Could not load stickers';more.hidden=false;more.textContent='Retry';more.onclick=()=>{more.textContent='More';more.onclick=()=>{page++;renderLibrary(false)};loadLibrary()}}
  }
  loadLibrary();
  const clamp = v => Math.max(0, Math.min(1, v));
  function position(e) {
    const r = canvas.getBoundingClientRect();
    return {x: clamp((e.clientX-r.left)/r.width), y: clamp((e.clientY-r.top)/r.height), inside: e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom};
  }
  async function add(emoji, name, point = {x:.5,y:.5}) {
    const asset=art.find(a=>a.emoji===emoji);
    if(asset&&!artImages.has(emoji)){try{const im=new Image();im.src=asset.src;await im.decode();artImages.set(emoji,im)}catch{status.textContent='Could not load sticker';return}}

    const item = {id:++nextId,emoji,name,x:point.x,y:point.y,size:.3,angle:0,ratio:artImages.has(emoji)?artImages.get(emoji).naturalHeight/artImages.get(emoji).naturalWidth:1};
    items.push(item); selected=item; redraw();
    recent=[emoji,...recent.filter(e=>e!==emoji)].slice(0,32);
    try{localStorage.setItem('petal-recent-emoji',JSON.stringify(recent))}catch{}
  }
  function sync() {
    for(const box of layer.querySelectorAll('.placed-sticker')) if(!items.some(s=>s.id===Number(box.dataset.id))) box.remove();
    for(const item of items) {
      let box = layer.querySelector(`[data-id="${item.id}"]`);
      if(!box) {
        box=document.createElement('div');box.className='placed-sticker';box.dataset.id=item.id;
        const body=document.createElement('button');body.className='sticker-body';
        body.setAttribute('aria-label',`${item.name}: arrow keys to move, Delete to remove`);
        body.addEventListener('pointerdown',e=>move(e,item,body));
        body.onclick=()=>{selected=item;sync()};
        body.onkeydown=e=>{
          if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove(item);return}
          if(e.key==='Escape'){selected=null;sync();return}
          const delta={ArrowLeft:[-.01,0],ArrowRight:[.01,0],ArrowUp:[0,-.01],ArrowDown:[0,.01]}[e.key];
          if(delta){e.preventDefault();selected=item;item.x=clamp(item.x+delta[0]);item.y=clamp(item.y+delta[1]);redraw()}
        };
        const close=document.createElement('button');close.className='sticker-handle sticker-remove';close.textContent='×';close.setAttribute('aria-label',`Remove ${item.name}`);close.onclick=()=>remove(item);
        const resize=document.createElement('button');resize.className='sticker-handle sticker-resize';resize.textContent='↘';resize.setAttribute('aria-label',`Resize ${item.name}`);resize.title='Drag to resize';
        resize.onpointerdown=e=>{
          if(e.button!==0)return;e.preventDefault();selected=item;resize.setPointerCapture(e.pointerId);
          const rect=canvas.getBoundingClientRect(),cx=rect.left+item.x*rect.width,cy=rect.top+item.y*rect.height;
          const start=Math.max(1,Math.hypot(e.clientX-cx,e.clientY-cy)),size=item.size;
          resize.onpointermove=ev=>{item.size=Math.max(.08,Math.min(.8,size*Math.hypot(ev.clientX-cx,ev.clientY-cy)/start));redraw()};
          const end=()=>{resize.onpointermove=null;resize.onpointerup=null;resize.onpointercancel=null};resize.onpointerup=end;resize.onpointercancel=end;
        };
        resize.onkeydown=e=>{if(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft','+','-'].includes(e.key)){e.preventDefault();item.size=Math.max(.08,Math.min(.8,item.size+(['ArrowUp','ArrowRight','+'].includes(e.key)?.02:-.02)));redraw()}};
        const rotate=document.createElement('button');rotate.className='sticker-handle sticker-rotate';rotate.textContent='↻';rotate.setAttribute('aria-label',`Rotate ${item.name}`);rotate.title='Drag to rotate';
        rotate.onpointerdown=e=>{
          if(e.button!==0)return;e.preventDefault();selected=item;rotate.setPointerCapture(e.pointerId);
          const rect=canvas.getBoundingClientRect(),cx=rect.left+item.x*rect.width,cy=rect.top+item.y*rect.height;
          let previous=Math.atan2(e.clientY-cy,e.clientX-cx);
          rotate.onpointermove=ev=>{const angle=Math.atan2(ev.clientY-cy,ev.clientX-cx);let delta=angle-previous;if(delta>Math.PI)delta-=Math.PI*2;if(delta<-Math.PI)delta+=Math.PI*2;item.angle+=delta;previous=angle;redraw()};
          const end=()=>{rotate.onpointermove=null;rotate.onpointerup=null;rotate.onpointercancel=null};rotate.onpointerup=end;rotate.onpointercancel=end;
        };
        rotate.onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();item.angle+=(['ArrowRight','ArrowUp'].includes(e.key)?1:-1)*Math.PI/180*(e.shiftKey?15:5);redraw()}};
        box.append(body,close,resize,rotate);layer.append(box);
      }
      box.style.transform=`translate(-50%,-50%) rotate(${item.angle}rad)`;
      box.style.left=`${item.x*100}%`;box.style.top=`${item.y*100}%`;
      box.style.width=`${item.size*100}%`;box.style.height=`${item.size*(item.ratio||1)*canvas.width/canvas.height*100}%`;
      box.dataset.selected=String(selected===item);
      box.querySelector('.sticker-body').setAttribute('aria-pressed',String(selected===item));
      box.querySelectorAll('.sticker-handle').forEach(b=>b.hidden=selected!==item);
    }
  }
  function move(e,item,button) {
    if(e.button!==0)return;e.preventDefault();selected=item;
    const start=position(e), x=item.x, y=item.y;
    button.setPointerCapture(e.pointerId);sync();
    button.onpointermove=event=>{const p=position(event);item.x=clamp(x+p.x-start.x);item.y=clamp(y+p.y-start.y);redraw()};
    const end=()=>{button.onpointermove=null;button.onpointerup=null;button.onpointercancel=null;};
    button.onpointerup=end;button.onpointercancel=end;
  }
  function remove(item) {const index=items.indexOf(item);if(index>=0)items.splice(index,1);selected=null;redraw()}
  function makeChoice(emoji,name) {
    const button=document.createElement('button');const asset=art.find(a=>a.emoji===emoji);if(asset){const img=new Image();img.src=asset.src;img.alt=name;img.draggable=false;button.append(img)}else button.textContent=emoji;button.setAttribute('aria-label',`Add ${name}`);
    let dragged=false;
    button.onclick=()=>{if(!dragged)add(emoji,name);dragged=false};
    button.onpointerdown=e=>{
      if(e.button!==0)return;dragged=false;button.setPointerCapture(e.pointerId);
      const startX=e.clientX,startY=e.clientY;
      let ghost=null;
      button.onpointermove=event=>{
        if(Math.hypot(event.clientX-startX,event.clientY-startY)>5)dragged=true;
        if(!dragged)return;
        if(!ghost){ghost=document.createElement('div');ghost.className='sticker-ghost';if(asset){const img=new Image();img.src=asset.src;img.style.width='70px';ghost.append(img)}else ghost.textContent=emoji;ghost.setAttribute('aria-hidden','true');document.body.append(ghost)}
        ghost.style.left=`${event.clientX}px`;ghost.style.top=`${event.clientY}px`;
      };
      const end=event=>{
        ghost?.remove();button.onpointermove=null;button.onpointerup=null;button.onpointercancel=null;
        if(event.type==='pointerup'&&dragged){const p=position(event);if(p.inside)add(emoji,name,p)}
      };
      button.onpointerup=end;button.onpointercancel=end;
    };
    tray.append(button);
  }
  canvas.addEventListener('pointerdown',()=>{selected=null;sync()});
  return {sync,paint(target){const ctx=target.getContext('2d');ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.globalAlpha=1;ctx.filter='none';ctx.textAlign='center';ctx.textBaseline='middle';for(const item of items){ctx.font=`${item.size*target.width}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;ctx.save();ctx.translate(item.x*target.width,item.y*target.height);ctx.rotate(item.angle);if(artImages.has(item.emoji)){const im=artImages.get(item.emoji),w=item.size*target.width,h=w*item.ratio;ctx.drawImage(im,-w/2,-h/2,w,h)}else ctx.fillText(item.emoji,0,0);ctx.restore()}ctx.restore()}};
}
