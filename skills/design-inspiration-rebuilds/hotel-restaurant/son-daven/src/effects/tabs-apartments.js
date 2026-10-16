/*
 * APARTMENT TABS. All panels share one grid cell. Switching:
 *   outgoing  -> xPercent -125, rotate 15
 *   incoming  <- xPercent 125, rotate -15 (from the opposite side when going back)
 * 1.2s "InOut" for both; the active tab fades to full opacity (CSS). Direction follows
 * the index order so the stack feels like a physical row of cards.
 */
import { gsap } from '../core/gsap.js';
import { $, $$ } from '../core/dom.js';

export function initApartmentTabs() {
  const tabs = $$('[data-tab]');
  const panels = $$('.apt_panel', $('#apts-panels'));
  let cur = 0, busy = false;
  tabs.forEach((t) => t.addEventListener('click', () => {
    const next = +t.dataset.tab;
    if (next === cur || busy) return;
    busy = true;
    const dir = next > cur ? 1 : -1;
    tabs.forEach((b) => b.classList.toggle('is-active', b === t));
    const out = panels[cur], inn = panels[next];
    inn.classList.add('is-active');
    gsap.to(out, { xPercent: -125 * dir, rotate: 15 * dir, duration: 1.2, ease: 'InOut', onComplete: () => { out.classList.remove('is-active'); gsap.set(out, { clearProps: 'all' }); } });
    gsap.fromTo(inn, { xPercent: 125 * dir, rotate: -15 * dir }, { xPercent: 0, rotate: 0, duration: 1.2, ease: 'InOut', onComplete: () => { busy = false; } });
    cur = next;
  }));
}
