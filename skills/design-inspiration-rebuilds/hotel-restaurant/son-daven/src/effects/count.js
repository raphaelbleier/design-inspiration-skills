/*
 * STAT COUNTERS: [data-count="N"] counts 0 -> N when scrolled into view (once), 1.6s
 * "Out". An optional data-suffix (e.g. "+") is re-appended every frame.
 */
import { gsap, reduced } from '../core/gsap.js';
import { $$ } from '../core/dom.js';

export function initCounters() {
  if (reduced) return;
  $$('[data-count]').forEach((el) => {
    const n = +el.dataset.count, suf = el.dataset.suffix || '', o = { v: 0 };
    el.textContent = '0' + suf;
    gsap.to(o, { v: n, duration: 1.6, ease: 'Out', onUpdate: () => (el.textContent = Math.round(o.v) + suf), scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
}
