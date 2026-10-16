// Technique: scrubbed zoom. A small rounded reel box (22vw x 15svh) grows to the full viewport as the
// pinned section scrolls (width/height/radius tween, ease none, scrub true), while the image
// scales 1 -> 1.25 and drifts yPercent -10 (same numbers as the original's Flip.fit zoom).
// The CTA thumbnail opens the same frame in a <dialog>, clip-path inset reveal 0.75s osmo.
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

export function initReel() {
  const sec = document.querySelector('[data-reel]');
  const box = sec.querySelector('[data-reel-box]');
  const img = sec.querySelector('[data-reel-img]');
  if (!reduced) {
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top bottom-=20%', end: 'bottom bottom', scrub: true } })
      .to(box, { width: '100vw', height: '100svh', borderRadius: 0, duration: 0.6 })
      .to(img, { scale: 1.25, yPercent: -10, duration: 0.4 }, '<0.2');
  } else gsap.set(box, { width: '100vw', height: '100svh', borderRadius: 0 });

  const modal = document.querySelector('[data-reel-modal]');
  document.querySelector('[data-open-reel]').addEventListener('click', () => {
    modal.showModal();
    if (!reduced) gsap.fromTo('.reel-frame', { clipPath: 'inset(50% 50% 50% 50% round 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 0.75, ease: 'osmo' });
  });
  document.querySelector('[data-close-reel]').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => e.target === modal && modal.close());
}
