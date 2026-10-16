// Technique: three rotated colour bands (7deg, -4deg, 3deg) of accented letters. Each track is duplicated
// and scrubbed horizontally on scroll in alternating directions (xPercent 0 -> -35 / -35 -> 0).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const SETS = ['aãáăâäàāąå', 'eẽéěêëèēęė', 'uũúǔûüùūųů'];
export function initBands() {
  document.querySelectorAll('.band .track').forEach((t, i) => {
    t.innerHTML = Array(3).fill([...SETS[i]].map((c) => `<span>${c}</span>`).join('')).join('');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dir = i % 2 ? 1 : -1;
    gsap.fromTo(t, { xPercent: dir === -1 ? 0 : -35 }, { xPercent: dir === -1 ? -35 : 0, ease: 'none',
      scrollTrigger: { trigger: '.accents', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  });
}
