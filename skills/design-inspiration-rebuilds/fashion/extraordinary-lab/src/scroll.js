// Lenis on the GSAP ticker (lerp .08); page scroll progress 0..1 drives the camera along the spline.
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScroll(onFrame) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.08, smoothWheel: true, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);
  }
  gsap.ticker.add((time) => { lenis?.raf(time * 1000); onFrame(time * 1000); });
  return {
    lenis,
    progress: () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      return max > 0 ? scrollY / max : 0;
    },
  };
}
