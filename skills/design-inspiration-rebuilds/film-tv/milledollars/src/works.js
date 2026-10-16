/* Works list: hovering a row fades a full-bleed cover in behind the grid (.5s), the other rows dim to 30% white,
   the hovered row's top rule becomes a wavy line. Touch devices: no preview (list only). */
import gsap from 'gsap';
import { projects } from './data.js';

export function initWorks() {
  const bg = document.getElementById('hover-bg'), box = bg.firstElementChild;
  const list = document.querySelector('.list');
  const imgs = projects.map((p) => { const im = new Image(); im.src = p.img; im.alt = ''; return im; });
  const over = (e) => {
    const a = e.target.closest('.it'); if (!a) return;
    box.replaceChildren(imgs[a.dataset.i]);
    list.classList.add('dim'); a.classList.add('hot');
    gsap.to(bg, { opacity: 1, duration: 0.5, ease: 'power2.out', overwrite: true });
  };
  const out = (e) => {
    const a = e.target.closest('.it'); if (!a) return;
    a.classList.remove('hot'); list.classList.remove('dim');
    gsap.to(bg, { opacity: 0, duration: 0.4, ease: 'power2.out', overwrite: true });
  };
  if (matchMedia('(hover: hover)').matches) { list.addEventListener('pointerover', over); list.addEventListener('pointerout', out); }
  return () => { gsap.set(bg, { opacity: 0 }); box.replaceChildren(); };
}
