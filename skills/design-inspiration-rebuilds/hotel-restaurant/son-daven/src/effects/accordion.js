/*
 * FAQ ACCORDION. Height 0 -> auto in 1.2s "Out"; icon rotates 0 -> 90deg (0.8s InOut)
 * and the paragraph rises in. One panel open at a time. Closing mirrors it in 0.8s.
 * ScrollTrigger.refresh() after each tween because the page height changed.
 */
import { gsap, ScrollTrigger } from '../core/gsap.js';
import { $$ } from '../core/dom.js';

export function initAccordion() {
  const items = $$('.acc_i');
  const setOpen = (item, open) => {
    const q = item.querySelector('.acc_q'), a = item.querySelector('.acc_a');
    if (q.getAttribute('aria-expanded') === String(open)) return;
    q.setAttribute('aria-expanded', open);
    gsap.to(a, { height: open ? 'auto' : 0, duration: open ? 1.2 : 0.8, ease: open ? 'Out' : 'InOut', onComplete: () => ScrollTrigger.refresh() });
    gsap.to(item.querySelector('.acc_ic'), { rotate: open ? 90 : 0, duration: 0.8, ease: 'InOut' });
    open && gsap.fromTo(a.firstElementChild, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: 'Out' });
  };
  items.forEach((item) => item.querySelector('.acc_q').addEventListener('click', () => {
    const open = item.querySelector('.acc_q').getAttribute('aria-expanded') !== 'true';
    items.forEach((o) => o !== item && setOpen(o, false));
    setOpen(item, open);
  }));
}
