/**
 * scroll.js - Lenis smooth scroll driven by the GSAP ticker.
 * Technique: Lenis `{ lerp: .1, smoothWheel: true }`, autoRaf:false, lenis.raf called from gsap.ticker,
 * ScrollTrigger.update on every Lenis scroll event, gsap.ticker.lagSmoothing(0).
 * One frame loop drives scroll, ScrollTrigger and the Three.js render (frame callbacks).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) document.documentElement.classList.add('rm');

export let lenis = null;
const frameCallbacks = new Set();
export const onFrame = (fn) => frameCallbacks.add(fn);

export function initScroll() {
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
  }
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((time) => {
    if (lenis) lenis.raf(time * 1000);
    frameCallbacks.forEach((fn) => fn(time));
  });
}

/** Anchor links go through Lenis so they glide. */
export function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const el = id.length > 1 && document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { duration: 1.4 });
      else el.scrollIntoView();
    });
  });
}
