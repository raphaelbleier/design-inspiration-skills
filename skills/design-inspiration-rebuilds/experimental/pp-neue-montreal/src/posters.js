// Technique: "The Universal Font" poster scatter. Each poster starts stacked at the centre (scale .3, rotation 0)
// and flies out to its CSS-defined offset/rotation (--x vw, --y vh, --r deg) while the section scrolls (scrub 1).
// Values: start 'top 85%' (-2% per poster), end 'center 45%', ease power3.out; then a +-12% yPercent drift.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function initPosters() {
  const sec = document.querySelector('.posters');
  [...sec.querySelectorAll('.pst')].forEach((p, i) => {
    const cs = getComputedStyle(p);
    const vw = (v) => (parseFloat(v) / 100) * innerWidth, vh = (v) => (parseFloat(v) / 100) * innerHeight;
    gsap.set(p, { xPercent: -50, yPercent: -50 });
    gsap.fromTo(p, { x: 0, y: 0, rotation: 0, scale: 0.3, opacity: 0 },
      { x: () => vw(cs.getPropertyValue('--x')), y: () => vh(cs.getPropertyValue('--y')),
        rotation: parseFloat(cs.getPropertyValue('--r')), scale: 1, opacity: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sec, start: `top ${85 - i * 2}%`, end: 'center 45%', scrub: 1, invalidateOnRefresh: true } });
  });
}
