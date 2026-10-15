/*
 * Tiny scroll toolkit shared by every page effect.
 *  onFrame(fn)       rAF-throttled scroll + resize listener (the original's handlers are all rAF-throttled and read scrollY directly)
 *  stickyProgress(el) 0..1 progress through a tall section that holds a position:sticky stage:
 *                     -rect.top / (rect.height - innerHeight)
 *  inView(el, cb)    one-shot IntersectionObserver
 */
import { clamp } from '../easing.js';
export function onFrame(fn) {
  let t = false;
  const run = () => { t = false; fn(); };
  const req = () => { if (!t) { t = true; requestAnimationFrame(run); } };
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req);
  fn();
}
export const stickyProgress = (el) => { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); };
export function inView(el, cb, margin = '0px 0px -15% 0px') {
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); cb(); } }, { rootMargin: margin });
  io.observe(el);
}
