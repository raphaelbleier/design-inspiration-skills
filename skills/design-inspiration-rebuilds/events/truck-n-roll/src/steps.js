/**
 * steps.js - sticky image column that swaps with the active step.
 * Each .step triggers at "top 55%": the matching image wipes in from the bottom with
 * clip-path inset(100% 0 0 0) -> inset(0), 0.9s power3.inOut; previous image stays underneath.
 * Desktop only (the pin column is hidden under 900px).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function steps() {
  const imgs = [...document.querySelectorAll('.si')];
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    document.querySelectorAll('.step').forEach((el, i) => {
      ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%',
        onToggle: (self) => {
          if (!self.isActive) return;
          imgs.forEach((im, k) => {
            im.style.zIndex = k <= i ? k + 1 : 0;
            if (k <= i) gsap.to(im, { clipPath: 'inset(0% 0 0 0)', duration: reduced ? 0 : 0.9, ease: 'power3.inOut', overwrite: 'auto' });
            else gsap.to(im, { clipPath: 'inset(100% 0 0 0)', duration: reduced ? 0 : 0.9, ease: 'power3.inOut', overwrite: 'auto' });
          });
        } });
      if (!reduced) gsap.from(el.children, { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
    });
  });
}
