/*
 * HALFTONE SCENES per section (financial mountain, developer valley, footer sheep).
 * Same shader, different configs. Each scene dissolves in on scroll through the
 * `threshold` uniform: threshold 0 hides every cell except pure black; ramping it to its
 * target lets the brightest cells appear last, so the image resolves from dark to light.
 * All three float over the page (bgOpacity 0) in the sand fill colour.
 */
import { gsap, reduced } from '../core/gsap.js';
import { createHalftone } from './halftone.js';
import { $ } from '../core/dom.js';

function dissolve(scene, trigger, target, start = 'top 85%', end = 'top 25%') {
  const cfg = scene.layers[0].cfg;
  if (reduced) return;
  cfg.threshold = 0;
  gsap.to(cfg, { threshold: target, ease: 'none', scrollTrigger: { trigger, start, end, scrub: true } });
}

export function initScenes(images) {
  const fin = createHalftone($('#fin-ht'), [{ source: images.ridge, xSquares: 90, ySquares: 64, bgOpacity: 0, fill: '--sand', blackPoint: 20, whitePoint: 215, threshold: 215 }]);
  fin && dissolve(fin, '#fin-ht', 215);

  const stats = createHalftone($('#stats-ht'), [{ source: images.blog2, xSquares: 120, ySquares: 40, bgOpacity: 0, fill: '--sand', blackPoint: 40, whitePoint: 210, threshold: 225, gamma: 1.1 }]);
  stats && dissolve(stats, '#stats-ht', 225, 'top 95%', 'top 40%');

  const foot = createHalftone($('#foot-ht'), [{ source: images.sheep, xSquares: 100, ySquares: 120, bgOpacity: 0, fill: '--sand', blackPoint: 10, whitePoint: 200, threshold: 215 }]);
  foot && dissolve(foot, '#foot-ht', 215, 'top 100%', 'top 40%');
}
