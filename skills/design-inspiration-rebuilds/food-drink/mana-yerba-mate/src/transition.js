/**
 * transition.js - circle wipe between the two pages. Click on [data-transition]: a yellow circle
 * (50vmax) scales 0 -> 3.2 in .8s power4.inOut, then navigation. The next page starts covered
 * (sessionStorage flag) and the circle shrinks away.
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

const wipe = () => document.getElementById('wipe');
const layer = () => document.getElementById('transition');

export function initTransition() {
  document.querySelectorAll('a[data-transition]').forEach((a) => a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (reduced || a.target || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    layer().classList.add('on');
    try { sessionStorage.setItem('wipe', '1'); } catch {}
    gsap.to(wipe(), { scale: 3.2, duration: 0.8, ease: 'power4.inOut', onComplete: () => (location.href = href) });
  }));
}

/** Returns a promise that resolves once the incoming wipe has uncovered the page (or at once). */
export function playEnter() {
  let flag = false;
  try { flag = sessionStorage.getItem('wipe') === '1'; sessionStorage.removeItem('wipe'); } catch {}
  if (!flag || reduced) return Promise.resolve(false);
  gsap.set(wipe(), { scale: 3.2 });
  layer().classList.add('on');
  return new Promise((res) => gsap.to(wipe(), { scale: 0, duration: 0.8, ease: 'power4.inOut', delay: 0.1,
    onComplete: () => { layer().classList.remove('on'); res(true); } }));
}
