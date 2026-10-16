export function setupHome({onEnter,onReturn}) {
  const home=document.querySelector('#home');
  const enter=document.querySelector('#enterBooth');
  let entering=false,transition;
  function show(){
    clearTimeout(transition);entering=false;document.body.classList.remove('studio-entering');onReturn();
    document.body.dataset.home='true';home.hidden=false;
    enter.disabled=false;enter.classList.remove('entering');
    document.querySelector('#homePrompt').textContent='Step inside. Make a little memory.';
    enter.focus({preventScroll:true});
  }
  enter.addEventListener('click',event=>{
    const keyboardEntry=event.detail===0;
    if(entering)return;entering=true;enter.classList.add('entering');
    enter.disabled=true;document.querySelector('#homePrompt').textContent='The light is on. Come on in…';
    transition=setTimeout(()=>{
      document.body.classList.add('studio-entering');
      document.body.dataset.home='false';home.hidden=true;onEnter();
      // Touch entry must not leave a synthetic focus ring on the first template.
      if(keyboardEntry)document.querySelector('.layout-card.selected')?.focus({preventScroll:true});
      entering=false;
    },matchMedia('(prefers-reduced-motion: reduce)').matches?0:950);
  });
  document.querySelector('main').addEventListener('animationend',event=>{
    if(event.animationName==='studio-reveal')document.body.classList.remove('studio-entering');
  });
  document.querySelector('#navBooth').onclick=show;
}
