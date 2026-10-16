/* Lenis driven by the GSAP ticker (autoRaf off, lagSmoothing(0)) so scroll, ScrollTrigger and WebGL share one clock.
 * Reduced motion: native scroll. Also feeds the nav progress dot (--prog = scroll / max). */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export let lenis = null;
const dot = document.querySelector('.scroll-dot');
const prog = () => dot.style.setProperty('--prog', (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)).toFixed(3));

export function initScroll(frame) {
  gsap.registerPlugin(ScrollTrigger);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lenis = new Lenis({ autoRaf: false, syncTouch: true });
    lenis.on('scroll', ScrollTrigger.update);
  }
  // debug hook for screenshot scripts: jump to p (0..1) of the page
  window.__scrollTo = (p) => { const y = p * (document.documentElement.scrollHeight - innerHeight); lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); };
  addEventListener('scroll', prog, { passive: true });
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((time, deltaMs) => {
    lenis?.raf(time * 1000);
    frame(Math.min(deltaMs / 1000, 0.05), time);
  });
}
