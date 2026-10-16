// Loader. Technique: counter 0 -> 100 over 3s (power2.inOut) inside a cassette label,
// stickers pop in at staggered times, then the whole screen lifts away (yPercent -100, .9s power3.inOut).
// Mobile: counter runs 1.8s. Stickers: scale .4 -> 1 with back.out(2) and a small random rotation.
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

export function runLoader() {
  return new Promise((resolve) => {
    const loader = document.querySelector('.loader');
    const count = document.getElementById('count');
    if (reduced) { loader.remove(); return resolve(); }
    const dur = innerWidth > 991 ? 3 : 1.8;
    const num = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => { loader.remove(); resolve(); } });
    tl.to(num, { v: 100, duration: dur, ease: 'power2.inOut', onUpdate: () => (count.textContent = Math.round(num.v)) }, 0);
    gsap.utils.toArray('.st').forEach((el, i) => {
      tl.fromTo(el, { scale: 0.4, opacity: 0, rotate: gsap.utils.random(-25, 25) },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, 0.25 + i * (dur / 6));
    });
    tl.to('.cassette-mask', { yPercent: 12, opacity: 0, duration: 0.5, ease: 'power2.in' }, dur + 0.1);
    tl.to(loader, { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, dur + 0.2);
  });
}
