// Technique: three cards pinned at the centre fan out as the section pins and scrubs.
// Left card rotate -26deg + x -14vw, right card +26deg + x 14vw, middle stays; transform-origin 50% 100%.
// Pin length 80% of viewport height.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function initFan() {
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' },
    scrollTrigger: { trigger: '.fan-sec', start: 'top top', end: '+=80%', scrub: 1, pin: true } });
  tl.fromTo('.c-l', { rotate: 0, xPercent: 0 }, { rotate: -26, xPercent: -30 }, 0)
    .fromTo('.c-r', { rotate: 0, xPercent: 0 }, { rotate: 26, xPercent: 30 }, 0)
    .fromTo('.c-m', { rotate: 0 }, { rotate: -2 }, 0)
    .fromTo('.fan-l, .fan-r', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, 0.2);
}
