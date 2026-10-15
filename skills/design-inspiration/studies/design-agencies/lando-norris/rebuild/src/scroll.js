/**
 * scroll.js - Lenis smooth scroll driven by the GSAP ticker.
 *
 * Rules that make this robust:
 *  1. Lenis does NOT run its own requestAnimationFrame (autoRaf:false). The gsap ticker
 *     calls lenis.raf(), so scroll position, ScrollTrigger and the WebGL render all
 *     update inside ONE frame loop -> no jitter between pinned elements and the shader.
 *  2. lenis.on('scroll', ScrollTrigger.update) keeps triggers in sync.
 *  3. gsap.ticker.lagSmoothing(0) - never "catch up" after a slow frame, Lenis already
 *     interpolates.
 *  4. A toggle button turns smooth scroll off (stored in localStorage); reduced motion
 *     turns it off by default.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const KEY = 'smooth-scroll';
let lenis = null;
const frameCallbacks = new Set();

function enabled() {
  try { const v = localStorage.getItem(KEY); if (v !== null) return v === '1'; } catch {}
  return !reduced;
}

function start() {
  if (lenis) return;
  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: true,        // also smooth touch scrolling (iOS/Android)
    touchMultiplier: 2,
    autoRaf: false,         // gsap ticker drives it
  });
  lenis.on('scroll', ScrollTrigger.update);
}

function stop() {
  if (!lenis) return;
  lenis.destroy();
  lenis = null;
}

export function initScroll() {
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((time) => {
    if (lenis) lenis.raf(time * 1000);      // gsap time is seconds, lenis wants ms
    frameCallbacks.forEach((fn) => fn(time * 1000));
  });
  if (enabled()) start();

  // toggle button (rendered by chrome.js)
  const btn = document.querySelector('[data-smooth-toggle]');
  if (btn) {
    const sync = () => btn.setAttribute('aria-pressed', String(!!lenis));
    sync();
    btn.addEventListener('click', () => {
      if (lenis) stop(); else start();
      try { localStorage.setItem(KEY, lenis ? '1' : '0'); } catch {}
      sync();
    });
  }
}

/** Run something every frame, in the same tick as Lenis (e.g. the shader render). */
export function onFrame(fn) { frameCallbacks.add(fn); return () => frameCallbacks.delete(fn); }

/** Stop/resume scrolling (menu open, page transition). */
export function lockScroll(lock) {
  if (lenis) lock ? lenis.stop() : lenis.start();
  document.documentElement.classList.toggle('is-locked', lock);
}

export function scrollToTop() { lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0); }
export { gsap, ScrollTrigger };
