/* INK-SMOKE MASK
   A ragged blob PNG (public/img/ink-mask.webp: radial falloff warped by fractal noise, alpha
   channel only) is used as a CSS mask-image on a fixed full-screen layer. The mask is sized
   --s x --s and positioned so the blob's centre sits on the TOP-RIGHT corner:
       mask-position: calc(100% + var(--s)/2) calc(0% - var(--s)/2)
   Animating --s from 0 to 5.3x the viewport diagonal makes the black "ink" bloom out of the
   corner and flood the screen (the noise-proof opaque core is radius 0.4 of half the image,
   i.e. 0.2*s, so s >= 5*diagonal guarantees full cover).
   Used for the About overlay (2.5 s, ease inkMask = cubic-bezier(.01875,.08,0,.991875), close 1 s
   linear) and for page transitions (cover 1.1 s power2.inOut, uncover 1.0 s power2.inOut). */
import { gsap } from 'gsap';
import { state } from './state.js';

export function initInk() {
  document.documentElement.style.setProperty('--ink-mask', `url("${new URL('./img/ink-mask.webp', document.baseURI).href}")`);
}
export const fullSize = () => Math.hypot(innerWidth, innerHeight) * 5.3;

export function maskTo(el, to, duration, ease) {
  const px = (v) => `${v}px`;
  if (state.reduced) { el.style.setProperty('--s', px(to)); return gsap.timeline(); }
  const o = { s: parseFloat(el.style.getPropertyValue('--s')) || 0 };
  return gsap.to(o, { s: to, duration, ease, overwrite: true, onUpdate: () => el.style.setProperty('--s', px(o.s)) });
}

/** cover the page with ink, run swap(), then recede */
export function inkTransition(swap) {
  const ink = document.getElementById('ink');
  ink.classList.add('is-on');
  return new Promise((resolve) => {
    maskTo(ink, fullSize(), state.reduced ? 0.01 : 1.1, 'power2.inOut').then?.(() => {});
    gsap.delayedCall(state.reduced ? 0 : 1.15, async () => {
      await swap();
      maskTo(ink, 0, state.reduced ? 0.01 : 1.0, 'power2.inOut');
      gsap.delayedCall(state.reduced ? 0 : 1.05, () => { ink.classList.remove('is-on'); resolve(); });
    });
  });
}
