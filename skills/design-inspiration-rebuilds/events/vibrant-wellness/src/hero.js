// Hero intro. Technique: title split into per-letter spans that rise from yPercent 110 with a back-out ease
// (stagger .035), body glides up from y -4.6 -> -2.9 over 2.2s power3.out, CTA scales in elastic.
import gsap from 'gsap';
import { body, reduced } from './scene.js';

export function splitLetters(el) {
  el.querySelectorAll('i').forEach((line) => {
    const txt = line.textContent; line.textContent = '';
    line.style.overflow = 'hidden'; line.style.paddingBottom = '.08em';
    [...txt].forEach((c) => { const s = document.createElement('span'); s.textContent = c; line.appendChild(s); });
  });
  return [...el.querySelectorAll('span')];
}

export function playIntro() {
  const letters = splitLetters(document.querySelector('.hero__title'));
  if (reduced) return;
  body.position.y = -4.6;
  gsap.to(body.position, { y: -2.9, duration: 2.2, ease: 'power3.out' });
  gsap.from(letters, { yPercent: 110, duration: 1.1, ease: 'back.out(1.4)', stagger: 0.035, delay: 0.3 });
  gsap.from('.hero__mark, .hero__facts li, .toggle', { autoAlpha: 0, y: 14, duration: 0.9, ease: 'power2.out', stagger: 0.08, delay: 0.2 });
  gsap.from('.cta', { scale: 0.6, autoAlpha: 0, duration: 1.2, ease: 'elastic.out(1, .6)', delay: 1 });
}
