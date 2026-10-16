/**
 * intel.js - pinned list of six lines. A scrubbed timeline (pin 700vh -> ~600vh of scroll) lights one line at a
 * time (.on class, opacity .35 -> 1) and pops the matching floating card in with a clip-path wipe from the bottom
 * (inset(100% 0 0 0) -> inset(0), 0.6s power2.out) then out again when the next line takes over.
 * Background image scales 1.15 -> 1.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initIntel() {
  if (reduced) return;
  const lis = gsap.utils.toArray('.intel-lines li');
  const cards = gsap.utils.toArray('.card');
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.intel', start: 'top top', end: 'bottom bottom', scrub: 0.6, pin: '.intel-pin', anticipatePin: 1 } });
  tl.fromTo('.intel-bg', { scale: 1.15 }, { scale: 1, duration: lis.length, ease: 'none' }, 0);
  lis.forEach((li, i) => {
    tl.call(() => lis.forEach((o, j) => o.classList.toggle('on', j === i)), null, i + 0.05);
    tl.fromTo(cards[i], { opacity: 1, clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.5, ease: 'power2.out' }, i + 0.05);
    tl.to(cards[i], { opacity: 0, duration: 0.3, ease: 'power2.in' }, i + 0.9);
  });
}
