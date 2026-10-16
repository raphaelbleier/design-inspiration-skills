/**
 * shop.js - 300vh section, sticky stage on a black -> white gradient.
 * Title letters grow from scaleY .2 to 1 (origin bottom, stagger .08 of timeline, power2.out),
 * title uses mix-blend-mode: difference so it stays readable while the ground turns white.
 * Records: scrubbed y from +60*speed vh to -60*speed vh with their own rotation (data-rot deg),
 * blur ~ (1.2 - speed)*6px so slow ones read as far away.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

gsap.registerPlugin(ScrollTrigger);

export function initShop() {
  const recs = gsap.utils.toArray('.rec');
  recs.forEach((r) => { r.style.filter = `blur(${((1.2 - +r.dataset.speed) * 6).toFixed(1)}px)`; });
  if (reduced) return;
  const tl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.shop', start: 'top top', end: 'bottom bottom', scrub: true } });
  tl.fromTo('.shop-title .sl', { scaleY: 0.2 }, { scaleY: 1, duration: 0.4, ease: 'power2.out', stagger: 0.04 }, 0);
  recs.forEach((r) => {
    const s = +r.dataset.speed, rot = +r.dataset.rot;
    tl.fromTo(r, { yPercent: 0, y: () => innerHeight * 0.6 * s, rotation: rot * 2 },
      { y: () => -innerHeight * 0.6 * s, rotation: -rot, duration: 1 }, 0);
  });
}
