// Female/Male pill. Technique: blue thumb slides with translateX/width read from the active button (.5s expo-out),
// and the torso lathe morphs by tweening state.sex 0 <-> 1 (1s power2.inOut), re-meshing on every update.
import gsap from 'gsap';
import { state, applySex, reduced } from './scene.js';

export function initToggle() {
  const root = document.getElementById('sex'), thumb = root.querySelector('.toggle__thumb');
  const btns = [...root.querySelectorAll('.toggle__btn')];
  const place = (b, animate = true) => {
    const set = { x: b.offsetLeft - 6, width: b.offsetWidth, duration: animate && !reduced ? 0.5 : 0, ease: 'expo.out' };
    gsap.to(thumb, set);
  };
  btns.forEach((b) => b.addEventListener('click', () => {
    btns.forEach((o) => o.classList.toggle('is-on', o === b));
    place(b);
    const to = b.dataset.sex === 'male' ? 1 : 0;
    gsap.to(state, { sex: to, duration: reduced ? 0 : 1, ease: 'power2.inOut', onUpdate: applySex });
  }));
  document.fonts.ready.then(() => place(btns[0], false));
  addEventListener('resize', () => place(root.querySelector('.is-on'), false));
}
