/*
 * LENIS SMOOTH SCROLL (case, about, contact, policy)
 * --------------------------------------------------
 * Options: duration 1, smoothWheel true, orientation vertical, touchMultiplier 2,
 * easing t => t === 1 ? 1 : 1 - 2^(-10t) (expo out). scrollTo duration 0.8.
 * Not created with autoRaf: it is driven from gsap.ticker so scroll, GSAP and WebGL share one clock.
 * Lenis ignores window.scrollTo while smoothing, so tests must use the mouse wheel.
 * Home/work have no native scroll at all (html.is-locked): the Slider owns the wheel there.
 */
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const expoOut = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
let lenis = null;
let tick = null;

export const Scroll = {
  get lenis() { return lenis; },
  enable() {
    document.documentElement.classList.remove('is-locked');
    if (lenis) return lenis;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    lenis = new Lenis({ duration: 1, smoothWheel: !reduced, orientation: 'vertical', touchMultiplier: 2, easing: expoOut });
    lenis.on('scroll', ScrollTrigger.update);
    tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return lenis;
  },
  lock() {
    document.documentElement.classList.add('is-locked');
    if (lenis) { gsap.ticker.remove(tick); lenis.destroy(); lenis = null; }
    window.scrollTo(0, 0);
  },
  top() { lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0); },
  to(target) { lenis ? lenis.scrollTo(target, { duration: 0.8, easing: expoOut }) : (typeof target === 'number' ? window.scrollTo(0, target) : target.scrollIntoView({ behavior: 'smooth' })); },
};
