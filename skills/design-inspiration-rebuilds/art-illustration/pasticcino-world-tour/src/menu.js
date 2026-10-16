/* Technique: full-screen chapter menu opened with a circular clip-path from the button,
   0.8s power3.out; links rise with back.out(1.2) stagger .07. Click jumps the scrub. */
import { gsap } from 'gsap';
import { lock, lenis, reduced } from './scroll.js';

export function initMenu(scenes) {
  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  const list = menu.querySelector('ol');
  scenes.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button data-i="${i}"><small>${s.dataset.n}</small>${s.dataset.name}</button>`;
    list.append(li);
  });
  const origin = () => { const r = btn.getBoundingClientRect(); return `${r.left + r.width / 2}px ${r.top + r.height / 2}px`; };
  let isOpen = false;
  const toggle = (force) => {
    isOpen = force ?? !isOpen;
    btn.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    if (isOpen) {
      lock(true); menu.hidden = false;
      gsap.fromTo(menu, { clipPath: `circle(0px at ${origin()})` }, { clipPath: `circle(150vmax at ${origin()})`, duration: reduced ? 0.01 : 0.8, ease: 'power3.out' });
      gsap.fromTo(list.children, { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 0.9, ease: 'back.out(1.2)', stagger: 0.07, delay: 0.25 });
    } else {
      gsap.to(menu, { clipPath: `circle(0px at ${origin()})`, duration: 0.6, ease: 'power3.inOut', onComplete: () => { menu.hidden = true; lock(false); } });
    }
  };
  btn.addEventListener('click', () => toggle());
  list.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const total = document.documentElement.scrollHeight - innerHeight;
    toggle(false);
    const y = (b.dataset.i / (scenes.length - 1)) * total;
    setTimeout(() => (lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y)), 650);
  });
}
