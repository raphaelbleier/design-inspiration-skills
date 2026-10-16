/*
 * NAV ITEM HOVER (desktop, hover devices only).
 * Each [data-nav-hover] gets two stacked copies of its label, both split into chars.
 * On enter: copy 1 chars -> opacity 0, yPercent -75, scale 0; copy 2 chars from
 * yPercent 75, scale 0 -> in, with a 0.2s delay. 0.8s "Out", stagger 0.025 from random.
 * Leave reverses it. The random order is what makes it feel like a shimmer, not a roll.
 */
import { gsap, SplitText, hasHover, isDesktop } from '../core/gsap.js';
import { $$ } from '../core/dom.js';

export function initNavHover() {
  if (!hasHover) return;
  $$('[data-nav-hover]').forEach((el) => {
    const t = el.textContent;
    el.innerHTML = `<span class="nh1">${t}</span><span class="nh2" aria-hidden="true">${t}</span>`;
    const a = SplitText.create(el.querySelector('.nh1'), { type: 'chars' }).chars;
    const b = SplitText.create(el.querySelector('.nh2'), { type: 'chars' }).chars;
    gsap.set(b, { opacity: 0, yPercent: 75, scale: 0 });
    const opts = { duration: 0.8, ease: 'Out', stagger: { each: 0.025, from: 'random' }, overwrite: true };
    el.addEventListener('pointerenter', () => {
      if (!isDesktop()) return;
      gsap.to(a, { opacity: 0, yPercent: -75, scale: 0, ...opts });
      gsap.to(b, { opacity: 1, yPercent: 0, scale: 1, ...opts, delay: 0.2 });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(b, { opacity: 0, yPercent: 75, scale: 0, ...opts });
      gsap.to(a, { opacity: 1, yPercent: 0, scale: 1, ...opts, delay: 0.2 });
    });
  });
}
