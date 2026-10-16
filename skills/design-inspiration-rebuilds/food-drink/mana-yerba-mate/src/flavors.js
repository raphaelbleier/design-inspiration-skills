/**
 * flavors.js - giant FLAVORS word (letters rise from a clipped line, .9s power4.out, stagger .05),
 * sparkle stars pop with elastic, tile slider (x tween .7s power4.inOut, one tile per click).
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initFlavors() {
  const word = document.getElementById('big-word');
  word.setAttribute('aria-label', word.textContent);
  word.innerHTML = [...word.textContent].map((c) => `<span class="ch" aria-hidden="true">${c}</span>`).join('');
  if (!reduced) {
    gsap.set('.big-word .ch', { yPercent: 105 });
    gsap.to('.big-word .ch', { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.05,
      scrollTrigger: { trigger: word, start: 'top 85%', once: true } });
    gsap.fromTo('.stars i', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'elastic.out(.34,.26)', stagger: 0.12,
      scrollTrigger: { trigger: word, start: 'top 75%', once: true } });
  } else gsap.set('.stars i', { opacity: 1 });

  const track = document.getElementById('track');
  const tiles = track.children.length;
  let idx = 0;
  const visible = () => (innerWidth <= 900 ? 1 : 3);
  const step = (d) => {
    idx = Math.max(0, Math.min(tiles - visible(), idx + d));
    gsap.to(track, { x: () => -idx * (innerWidth <= 900 ? innerWidth : innerWidth / 3), duration: reduced ? 0 : 0.7, ease: 'power4.inOut' });
  };
  document.getElementById('s-prev').addEventListener('click', () => step(-1));
  document.getElementById('s-next').addEventListener('click', () => step(1));
  addEventListener('resize', () => step(0));
}
