/* Tall parallax: the 130%-high image inside a 110vh window moves yPercent -11 -> 11 over the section's
   passage through the viewport (scrub: true), plus the banner image at -8 -> 8. */
import { gsap } from 'gsap';

export function initParallax() {
  [['#tall', '.tall__img', 11], ['#banner', '#bimg', 8]].forEach(([trigger, img, amt]) =>
    gsap.fromTo(img, { yPercent: -amt }, {
      yPercent: amt, ease: 'none',
      scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true },
    }));
}
