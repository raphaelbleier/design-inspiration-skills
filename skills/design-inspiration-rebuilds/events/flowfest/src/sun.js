// Technique: one sun symbol (jagged ray path generated once) reused for the fixed mascot, the badge and the footer.
// Mascot spins with scroll velocity-free scrub (360deg per page); footer sun rises from below the fold.
// Values: 28 rays, outer r 49 / inner r 44; mascot rotate 0 -> 720 over the page; footer sun y 30% -> 0, scrub.
import { gsap } from 'gsap';

export function initSun(reduced) {
  let d = '';
  const n = 28;
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? 44 : 49;
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;
  }
  document.getElementById('sun-rays').setAttribute('d', d + 'Z');
  if (reduced) return;
  gsap.to('.mascot svg', { rotate: 720, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.5 } });
  gsap.fromTo('.big-sun', { yPercent: 30 }, { yPercent: 0, ease: 'none',
    scrollTrigger: { trigger: '.foot-scene', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  gsap.from('.crowd', { yPercent: 100, duration: 1, ease: 'power3.out', stagger: 0.15,
    scrollTrigger: { trigger: '.foot-scene', start: 'top 80%', once: true } });
}
