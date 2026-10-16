/**
 * intro.js - load sequence + offer modal.
 * 1. hero image opens with an inset clip-path (1.4s expo.out), rail tiles pop in with
 *    stagger .08 (x -40 -> 0, 1s expo.out), hero copy lines rise (yPercent 100 -> 0).
 * 2. After 900ms a yellow offer modal opens (.8s expo.out card slide).
 */
import gsap from 'gsap';
import { lenis, reduced } from './scroll.js';

export function initIntro() {
  const modal = document.getElementById('modal');
  const close = () => { modal.classList.remove('open'); lenis?.start(); };
  document.getElementById('mclose').onclick = close;
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('a')) close(); });
  addEventListener('keydown', (e) => e.key === 'Escape' && close());

  const open = () => { modal.classList.add('open'); };
  if (reduced) { setTimeout(open, 600); return; }

  gsap.from('.hero-img', { clipPath: 'inset(8% 8% 8% 8% round 60px)', scale: 1.06, duration: 1.4, ease: 'expo.out' });
  gsap.from('.logo, .tile, .pill', { x: -40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08 });
  setTimeout(open, 900);
}
