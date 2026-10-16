/* Technique: three full-bleed slides, stepped by "Next" or auto every 6s. The incoming slide is stacked on top
   and revealed with a clip-path wipe from the bottom (inset 100% 0 0 0 -> 0) while its image settles from
   scale 1.08 to 1. The 01/02/03 counter swaps which numeral is large; the caption crossfades with a 24px lift.
   Values: wipe 1.2s power3.inOut; caption .6s power2.out. */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initHero() {
  const slides = [...document.querySelectorAll('.slide')];
  const caps = [...document.querySelectorAll('.cap')];
  const counts = [...document.querySelectorAll('.count')];
  let i = 0, busy = false, timer;

  gsap.set(slides[0].querySelector('img'), { scale: 1 });

  function go(n) {
    if (busy || n === i) return;
    busy = true;
    const from = slides[i], to = slides[n];
    const dur = reduced ? 0 : 1.2;
    gsap.set(to, { visibility: 'visible', zIndex: 2, clipPath: 'inset(100% 0 0 0)' });
    gsap.set(to.querySelector('img'), { scale: 1.08 });
    gsap.to(to, { clipPath: 'inset(0% 0 0 0)', duration: dur, ease: 'power3.inOut',
      onComplete() { gsap.set(from, { visibility: 'hidden' }); gsap.set(to, { zIndex: 1 }); from.classList.remove('is-on'); to.classList.add('is-on'); busy = false; } });
    gsap.to(to.querySelector('img'), { scale: 1, duration: dur + 0.4, ease: 'power2.out' });
    gsap.to(caps[i], { opacity: 0, y: -24, duration: 0.4, ease: 'power2.in' });
    gsap.fromTo(caps[n], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, delay: dur * 0.45, ease: 'power2.out' });
    counts.forEach((c, k) => c.classList.toggle('is-big', k === n));
    i = n;
  }
  const next = () => go((i + 1) % slides.length);
  document.getElementById('next').addEventListener('click', () => { next(); reset(); });
  function reset() { clearInterval(timer); if (!reduced) timer = setInterval(next, 6000); }
  reset();
}
