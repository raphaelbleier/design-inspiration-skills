/* Pinned chapters (concept, air, science, product, interview).
   Technique: .chapter is tall (--len, 480-520vh) with a sticky 100vh .pin. One scrubbed timeline per
   chapter on a 0-100 scale: title group fades/rises in (0-6), leaves (16-22); each text block fades
   in line by line (opacity 0 + y 24 + blur 6px, stagger 2.5) and out after 28 units; the CTA appears
   with the first block; floating skewed photos drift upward at their own speed (data-speed) from
   +60vh*speed to -80vh*speed over the whole chapter, which makes them cross the viewport. */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initChapters() {
  if (reduced) return;
  gsap.utils.toArray('.chapter').forEach((ch) => {
    const tl = gsap.timeline({ defaults: { ease: 'none' },
      scrollTrigger: { trigger: ch, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } });
    const title = ch.querySelector('.ch-title');
    tl.fromTo(title, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 6, ease: 'power2.out' }, 0)
      .to(title, { autoAlpha: 0, y: -30, duration: 6 }, 16);

    ch.querySelectorAll('.text-block').forEach((b, i) => {
      const s = 26 + i * 34;
      tl.set(b, { visibility: 'visible' }, s)
        .fromTo(b.children, { opacity: 0, y: 24, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 6, stagger: 2.5, ease: 'power2.out' }, s)
        .to(b, { opacity: 0, duration: 4 }, s + 28)
        .set(b, { visibility: 'hidden', opacity: 1 }, s + 32);
    });
    tl.to(ch.querySelector('.cta'), { opacity: 1, duration: 6 }, 32)
      .to(ch.querySelector('.cta'), { opacity: 0, duration: 4 }, 96);

    ch.querySelectorAll('.ph').forEach((ph) => {
      const sp = +ph.dataset.speed;
      tl.fromTo(ph, { y: () => innerHeight * 0.6 * sp }, { y: () => -innerHeight * 0.8 * sp, duration: 100 }, 0);
    });
  });
}
