/* Word-by-word headline reveal: each word is clipped in an overflow:hidden wrapper and
   its inner span slides yPercent 110 -> 0, .9s power3.out, stagger .06, when the heading hits 88% of the viewport.
   The squiggle underline draws with a stroke-dashoffset tween (1.2s power2.inOut). */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

function split(el) {
  const walk = (node) => [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((p) => {
        if (!p.trim()) { frag.append(p); return; }
        const w = document.createElement('span'); w.className = 'w';
        w.innerHTML = `<span>${p}</span>`; frag.append(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && !n.querySelector('svg')) walk(n);
  });
  walk(el);
  return el.querySelectorAll('.w>span');
}

export function initReveals() {
  document.querySelectorAll('[data-split]').forEach((el) => {
    const words = split(el);
    if (reduced) return;
    gsap.from(words, { yPercent: 110, duration: 0.9, ease: 'power3.out', stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  document.querySelectorAll('.ul path').forEach((p) => {
    if (reduced) return;
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(p, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', delay: 0.4,
      scrollTrigger: { trigger: p.closest('.ul'), start: 'top 85%', once: true } });
  });
}
