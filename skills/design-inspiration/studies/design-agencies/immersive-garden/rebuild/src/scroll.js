/* SMOOTH SCROLL + SPEED MODEL
   Lenis (lerp .05, wheelMultiplier 1, syncTouch false on touch so native momentum stays; the
   original uses lerp 1 on mobile, i.e. effectively native). Lenis runs on window and is driven
   by gsap.ticker so ScrollTrigger and the WebGL loop share one clock.

   state.speed is the "scroll intensity" that decides slow vs fast mode:
       target = clamp(|velocity| / 38, 0, 1);   speed += (target - speed) * 0.1  (per 60fps frame)
   Fast mode needs it to reach fastTrigger .99 (about 0.75 s of sustained hard scrolling),
   and ends below slowTrigger .75, or 1 s after hitting either end of the page. */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from './state.js';
gsap.registerPlugin(ScrollTrigger);

export let lenis = null;

export function initScroll() {
  if (!state.reduced) {
    lenis = new Lenis({ lerp: state.fine ? 0.05 : 1, wheelMultiplier: 1, syncTouch: false, smoothWheel: true });
    lenis.on('scroll', (l) => { state.scroll = l.scroll; state.velocity = l.velocity; ScrollTrigger.update(); });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    addEventListener('scroll', () => { state.scroll = scrollY; ScrollTrigger.update(); }, { passive: true });
  }
  gsap.ticker.add((_, dtMs) => {
    const f60 = Math.min(dtMs / 16.67, 3);
    const v = lenis ? Math.abs(lenis.velocity) : 0;
    const target = Math.min(1, v / 38);
    state.speed += (target - state.speed) * (1 - Math.pow(0.9, f60));
  });
}

export const scrollTo = (y, opts = {}) => (lenis ? lenis.scrollTo(y, { duration: 1.6, ...opts }) : window.scrollTo({ top: y, behavior: 'smooth' }));
export const stop = () => lenis?.stop();
export const start = () => lenis?.start();
/* new view: browser clamps the old scrollTop to the new height first, so hard-reset it, re-measure, then sync Lenis */
export const reset = () => { window.scrollTo(0, 0); lenis?.resize(); lenis?.scrollTo(0, { immediate: true, force: true }); state.scroll = 0;
  // ScrollTrigger caches the scroll position; refresh() would restore the stale one (clamped to the new height)
  ScrollTrigger.clearScrollMemory(); ScrollTrigger.update(); };
