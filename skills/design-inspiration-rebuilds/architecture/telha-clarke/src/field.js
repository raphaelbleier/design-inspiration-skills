/**
 * field.js - "All Work" image field: absolutely placed thumbnails drift at different speeds.
 * Each image has data-depth (0.3-1.2): yPercent travels -60*depth -> +60*depth over the section (scrub true),
 * far images (depth < .6) sit at opacity .35 so the field reads as layers. Title is sticky in the centre.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initField() {
  const imgs = gsap.utils.toArray('.field .f');
  imgs.forEach((im) => { const d = +im.dataset.depth; im.style.opacity = d < 0.6 ? 0.35 : 1; });
  if (reduced) return;
  imgs.forEach((im) => {
    const d = +im.dataset.depth;
    gsap.fromTo(im, { yPercent: 60 * d }, { yPercent: -60 * d, ease: 'none',
      scrollTrigger: { trigger: '.allwork', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}
