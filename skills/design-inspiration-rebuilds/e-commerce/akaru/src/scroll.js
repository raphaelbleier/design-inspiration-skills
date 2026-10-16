// Technique: Lenis smooth scroll driven by the GSAP ticker.
// Values: lerp .1, smoothWheel, autoRaf off, lagSmoothing(0). Disabled for reduced motion.
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export let lenis = null;
export function initScroll(reduce) {
  if (reduce) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const el = document.querySelector(a.getAttribute('href'));
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { duration: 1.4, easing: (x) => 1 - Math.pow(1 - x, 4) });
    }));
}
