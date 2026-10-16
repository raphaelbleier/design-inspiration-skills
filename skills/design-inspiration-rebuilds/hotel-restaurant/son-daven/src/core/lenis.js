/*
 * LENIS SMOOTH SCROLL (1.3.15), driven by the GSAP ticker.
 *
 *   duration 1.2, smoothWheel, touchMultiplier 2,
 *   easing t => min(1, 1.001 - 2^(-10t))   (expo-out)
 *
 * Wiring that matters:
 *   gsap.ticker.add(t => lenis.raf(t * 1000))   one clock for scroll + tweens
 *   lenis.on('scroll', ScrollTrigger.update)    pins/scrubs read Lenis' position
 * Lenis ignores window.scrollTo while smoothing: use lenis.scrollTo(y, {immediate}).
 *
 * A second instance (duration 0.6) is attached to [data-lenis-scroll] elements,
 * e.g. the scrollable info panel inside a benefit card.
 */
import Lenis from 'lenis';
import { gsap, ScrollTrigger, reduced } from './gsap.js';

export let lenis = null;
let locks = 0;

export function initLenis() {
  if (reduced) return null;
  lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
    touchMultiplier: 2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    infinite: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  return lenis;
}

/** Nested Lenis for inner scrollers (wrapper/content pair). */
export function initInnerScrollers(root = document) {
  if (reduced) return;
  root.querySelectorAll('[data-lenis-scroll]').forEach((wrapper) => {
    const l = new Lenis({ wrapper, content: wrapper.firstElementChild, duration: 0.6 });
    gsap.ticker.add((t) => l.raf(t * 1000));
  });
}

/** Counted scroll lock (preloader, menu, modals): stop Lenis + overflow hidden with scrollbar padding. */
export function lockScroll() {
  if (locks++ > 0) return;
  const sb = innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.paddingRight = sb + 'px';
  lenis && lenis.stop();
}
export function unlockScroll() {
  if (--locks > 0) return;
  locks = 0;
  document.documentElement.style.overflow = '';
  document.body.style.paddingRight = '';
  lenis && lenis.start();
}

export function scrollToY(y, immediate = false) {
  if (lenis) lenis.scrollTo(y, { immediate, force: true });
  else scrollTo(0, y);
}
