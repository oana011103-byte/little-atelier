export function setupHome({onEnter,onReturn}) {
  const home=document.querySelector('#home');
  const enter=document.querySelector('#enterBooth');
  let entering=false,transition;
  function show(){
    clearTimeout(transition);entering=false;onReturn();
    document.body.dataset.home='true';home.hidden=false;
    enter.disabled=false;enter.classList.remove('entering');
    document.querySelector('#homePrompt').textContent='Step inside. Make a little memory.';
    enter.focus({preventScroll:true});
  }
  enter.addEventListener('click',()=>{
    if(entering)return;entering=true;enter.classList.add('entering');
    enter.disabled=true;document.querySelector('#homePrompt').textContent='The light is on. Come on in…';
    transition=setTimeout(()=>{
      document.body.dataset.home='false';home.hidden=true;onEnter();
      document.querySelector('.layout-card.selected')?.focus({preventScroll:true});
      entering=false;
    },matchMedia('(prefers-reduced-motion: reduce)').matches?0:950);
  });
  document.querySelector('#navBooth').onclick=show;
}
