/* Technique: featured products rail = native overflow-x scroller with pointer drag (grab cursor) and
   vertical-wheel passthrough kept native so Lenis page scroll is not hijacked. Cards enter with a
   stagger (.9s power3.out, y 60 -> 0, opacity 0 -> 1, stagger .08). */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initRail() {
  const rail = document.getElementById('rail');
  let down = false, x0 = 0, s0 = 0;
  rail.addEventListener('pointerdown', (e) => { down = true; x0 = e.clientX; s0 = rail.scrollLeft; rail.style.cursor = 'grabbing'; });
  addEventListener('pointerup', () => { down = false; rail.style.cursor = ''; });
  rail.addEventListener('pointermove', (e) => { if (down) rail.scrollLeft = s0 - (e.clientX - x0); });
  rail.addEventListener('dragstart', (e) => e.preventDefault());
  if (!reduced)
    gsap.from('.card', { y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: rail, start: 'top 85%', once: true } });
}
