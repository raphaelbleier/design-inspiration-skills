/*
 * HERO SCROLL AREA: 4 x 100vh section with a sticky 100vh stage.
 * One scrubbed timeline, progress 0..1 over "top top" -> "bottom top" (the full 3600px:
 * the sticky stage unpins at 2700 = 75% and scrolls away during the last 25%):
 *   0.00-0.50  title block flies up: yPercent -100, scale 0.5, opacity 0
 *   0.00-0.50  render pushes in (scale 1 -> 1.18, parent of the preloader's zoom)
 *   0.00-0.20  bottom copy + round button fade
 *   0.12-0.32  halftone canvas fades in over the photo; levels drift for the whole run:
 *              blackPoint 25 -> 45, whitePoint 200 -> 175 (bars thin out as you scroll)
 *   0.72-0.78  stage background sand -> ink (matches the theme flip at 75%)
 *   0.75-1.00  wrapper scales to 0.3 and fades out
 * Theme zones in the markup: light 0-75%, dark 75-100% (= 0-2700 light, 2700-3600 dark).
 * The original plays a 120-frame webp sequence on a 2D canvas here; this rebuild uses the
 * live shader on the still render, which gives the same dissolve with zero extra weight.
 */
import { gsap, reduced } from '../core/gsap.js';
import { createHalftone } from './halftone.js';
import { $ } from '../core/dom.js';

export function initHero(images) {
  const scene = createHalftone($('#hero-ht'), [{
    source: images.hero, xSquares: 110, ySquares: 62, bg: '--sand', fill: '--ink',
    blackPoint: 25, whitePoint: 200, threshold: 190, gamma: 1,
  }]);
  if (reduced) { document.documentElement.classList.add('reduced'); return; }
  const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 },
  });
  tl.to('.hero_t', { yPercent: -100, scale: 0.5, opacity: 0, duration: 0.5 }, 0)
    .to('.hero_media', { scale: 1.18, duration: 0.5 }, 0)
    .to('.hero_b, .btn-circle', { opacity: 0, duration: 0.2 }, 0)
    .to('#hero-ht', { opacity: 1, duration: 0.2 }, 0.12)
    .to('.hero_sticky', { backgroundColor: ink, duration: 0.06 }, 0.72)
    .to('.hero_wrap', { scale: 0.3, opacity: 0, duration: 0.25 }, 0.75);
  if (scene) tl.to(scene.layers[0].cfg, { blackPoint: 45, whitePoint: 175, duration: 1 }, 0);
}
