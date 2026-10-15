/**
 * transition.js - lime wipe page transition between index.html <-> on-track.html.
 *
 * Leave : click on [data-transition] -> the lime sheet slides up over the page (.9s expo),
 *         we wait 1000ms total (like the original), then navigate.
 * Enter : the next page starts with the sheet covering it (sessionStorage flag, set before
 *         navigating) and lifts off to the top once the page is ready.
 * It is a plain multi-page site; no router needed. A SPA router (Taxi/Barba) would only
 * keep the WebGL canvas alive across pages - not needed here.
 */
import { gsap, reduced } from './scroll.js';

const FLAG = 'wipe-pending';

export function initTransition() {
  const wipe = document.querySelector('[data-wipe]');
  if (!wipe) return;
  const mark = wipe.querySelector('.wipe__mark');

  // ENTER (new page)
  let pending = false;
  try { pending = sessionStorage.getItem(FLAG) === '1'; sessionStorage.removeItem(FLAG); } catch {}
  if (pending && !reduced) {
    gsap.set(wipe, { yPercent: 0, visibility: 'visible' });
    gsap.set(mark, { scale: 1, rotate: 0 });
    gsap.to(wipe, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', delay: 0.15, onComplete: () => gsap.set(wipe, { visibility: 'hidden' }) });
    gsap.to(mark, { scale: 1.6, duration: 1, ease: 'power2.in', delay: 0.1 });
  } else {
    gsap.set(wipe, { yPercent: 100, visibility: 'hidden' });
  }

  // LEAVE
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-transition]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    const samePage = url.pathname === location.pathname;
    if (samePage && url.hash) return;                     // in-page anchor: let it scroll
    e.preventDefault();
    if (reduced) { location.href = a.href; return; }
    try { sessionStorage.setItem(FLAG, '1'); } catch {}
    gsap.set(wipe, { yPercent: 100, visibility: 'visible' });
    gsap.set(mark, { scale: 0.6 });
    gsap.to(wipe, { yPercent: 0, duration: 0.9, ease: 'expo.inOut' });
    gsap.to(mark, { scale: 1, duration: 0.9, ease: 'expo.out', delay: 0.2 });
    setTimeout(() => { location.href = a.href; }, 1000);
  });
  // bfcache back button: make sure the sheet is not left over the page
  window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(wipe, { yPercent: 100, visibility: 'hidden' }); });
}
