/*
 * HEADER BEHAVIOUR
 *  - hides on scroll-down after 1000px (yPercent -100, 0.8s), returns on scroll-up
 *  - forced visible within 160px of the page end (so the footer contacts stay reachable)
 *  - .header_bg fades in once scrolled past 1000px
 * One page-long ScrollTrigger supplies direction; no scroll listener of our own.
 */
import { gsap, ScrollTrigger, reduced } from '../core/gsap.js';
import { $ } from '../core/dom.js';

export function initHeader() {
  const header = $('#header');
  let hidden = false;
  const set = (h) => {
    if (h === hidden) return;
    hidden = h;
    gsap.to(header, { yPercent: h ? -100 : 0, duration: 0.8, ease: 'Out', overwrite: true });
  };
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate(self) {
      const y = self.scroll();
      header.classList.toggle('has-bg', y > 1000);
      if (document.body.classList.contains('is-menu')) return;
      const nearEnd = self.end - y < 160;
      set(!nearEnd && y > 1000 && self.direction === 1);
      if (self.direction === -1 || nearEnd) set(false);
    },
  });
  if (reduced) header.style.position = 'sticky';
}
