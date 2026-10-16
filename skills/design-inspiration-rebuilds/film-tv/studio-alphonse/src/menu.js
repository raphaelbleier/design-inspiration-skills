// Menu. Technique: full-screen purple panel opens with clip-path inset(0 0 100% 0) -> inset(0) (.8s power3.inOut),
// three stripes scaleY 0 -> 1 (stagger .08), sticker pops in, items rise from a mask (yPercent 110 -> 0, stagger .06).
// Body scroll is locked while open; clicking a link closes it after 500ms and jumps to the anchor.
import { gsap } from 'gsap';
import { lenis } from './scroll.js';

export function initMenu() {
  const menu = document.getElementById('menu');
  const items = menu.querySelectorAll('.menu-item');
  const stripes = menu.querySelectorAll('.menu-stripes i');
  let tl;
  const build = () => {
    tl = gsap.timeline({ paused: true, onReverseComplete: () => menu.classList.remove('open') });
    tl.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'power3.inOut' })
      .fromTo(stripes, { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, 0.2)
      .fromTo('.menu-sticker', { scale: 0.3, rotate: -30, opacity: 0 }, { scale: 1, rotate: -8, opacity: 1, duration: 0.6, ease: 'back.out(2)' }, 0.5)
      .fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06 }, 0.35);
  };
  build();
  const open = () => { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); document.body.classList.add('no-scroll'); lenis?.stop(); tl.timeScale(1).play(); };
  const close = () => { menu.setAttribute('aria-hidden', 'true'); document.body.classList.remove('no-scroll'); lenis?.start(); tl.timeScale(1.4).reverse(); };
  document.getElementById('open-menu').addEventListener('click', open);
  document.getElementById('close-menu').addEventListener('click', close);
  items.forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    e.preventDefault(); close();
    setTimeout(() => {
      const t = document.querySelector(id);
      if (!t) return;
      lenis ? lenis.scrollTo(t, { immediate: true }) : t.scrollIntoView();
    }, 500);
  }));
}
