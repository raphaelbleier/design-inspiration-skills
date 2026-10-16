/**
 * marquee.js - infinite feature ticker in the red pill.
 * Content duplicated 2x; a linear gsap tween moves x by -50% forever, 28s per loop.
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

const ITEMS = ['Smart living', 'Social areas', 'Private kitchen & bathroom', '24/7 security',
  'Fast and reliable maintenance', 'Fully furnished'];

export function initMarquee() {
  const track = document.querySelector('.mq-track');
  const html = ITEMS.map((t) => `<span>${t}</span>`).join('');
  track.innerHTML = html + html + html + html;
  if (reduced) return;
  gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
}
