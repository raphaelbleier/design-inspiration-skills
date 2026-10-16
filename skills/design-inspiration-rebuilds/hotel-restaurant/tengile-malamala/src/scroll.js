/**
 * scroll.js - Lenis smooth scroll driven by the GSAP ticker.
 * Technique: Lenis `{ lerp: .1, smoothWheel: true }`, autoRaf:false, lenis.raf from gsap.ticker,
 * ScrollTrigger.update on each Lenis scroll event, gsap.ticker.lagSmoothing(0).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) document.documentElement.classList.add('rm');

export let lenis = null;

export function initScroll() {
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
  }
  gsap.ticker.lagSmoothing(0);
}

/** In-page anchors glide through Lenis. */
export function initAnchors(afterClick) {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const el = id.length > 1 && document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      afterClick?.();
      if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else el.scrollIntoView();
    });
  });
}
