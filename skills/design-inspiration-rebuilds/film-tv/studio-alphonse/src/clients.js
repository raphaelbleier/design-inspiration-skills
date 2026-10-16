// Clients. Technique: two tilted bands (rotate 2deg and -3deg) with infinite marquees in opposite
// directions (40s and 32s, linear). A yellow card follows the cursor inside the section
// (gsap.quickTo x/y 1s power4, rotation = deltaX / 4, reset to 0 after 66ms of stillness).
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

const names = ['Océane', 'Citrale', 'Danubia', 'Voltaire Énergie', 'Lumen', 'Fordham', 'Gaïa', 'Crunch', 'Orangerie', 'Australis', 'Yaourt Nord', 'Volkan', 'Île Un', 'Kiosque'];

export function initClients() {
  const cell = (n) => `<div class="cl">${n}</div>`;
  document.querySelectorAll('.band .track').forEach((tr) => {
    const dir = Number(tr.dataset.dir);
    const set = names.map(cell).join('');
    tr.innerHTML = set + set;
    const wrap = document.createElement('div');
    tr.parentElement.appendChild(wrap);
    wrap.style.cssText = 'display:flex;flex:none';
    wrap.appendChild(tr);
    wrap.parentElement.style.overflow = 'visible';
    if (reduced) return;
    gsap.fromTo(tr, { xPercent: dir > 0 ? -50 : 0 }, { xPercent: dir > 0 ? 0 : -50, duration: dir > 0 ? 32 : 40, ease: 'none', repeat: -1 });
  });
  if (reduced || innerWidth < 992) return;
  const sec = document.querySelector('.clients');
  const card = document.querySelector('.follow-card');
  const label = card.querySelector('span');
  const xTo = gsap.quickTo(card, 'x', { duration: 1, ease: 'power4' });
  const yTo = gsap.quickTo(card, 'y', { duration: 1, ease: 'power4' });
  const rTo = gsap.quickTo(card, 'rotation', { duration: 1, ease: 'power4' });
  let old = 0, t;
  sec.addEventListener('mouseenter', () => gsap.to(card, { opacity: 1, duration: 0.3 }));
  sec.addEventListener('mouseleave', () => gsap.to(card, { opacity: 0, duration: 0.3 }));
  sec.addEventListener('mousemove', (e) => {
    const r = sec.getBoundingClientRect();
    xTo(e.clientX - innerWidth / 2); yTo(e.clientY - r.top - r.height / 2);
    rTo((e.clientX - old) / 4); old = e.clientX;
    clearTimeout(t); t = setTimeout(() => rTo(0), 66);
    const hit = e.target.closest('.cl');
    label.textContent = hit ? hit.textContent : '';
  });
}
