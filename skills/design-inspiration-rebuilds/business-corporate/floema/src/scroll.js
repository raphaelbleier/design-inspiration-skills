// Smooth scroll: Lenis driven by the GSAP ticker (one frame loop for scroll + ScrollTrigger).
// Values: lerp .1, smoothWheel, lagSmoothing off. Anchor links go through lenis.scrollTo.
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export let lenis;
export function initScroll() {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const el = id.length > 1 && document.querySelector(id);
      if (el) { e.preventDefault(); lenis.scrollTo(el, { duration: 1.4 }); }
    }));
}
