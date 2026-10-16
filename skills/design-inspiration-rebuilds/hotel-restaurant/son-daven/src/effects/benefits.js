/*
 * BENEFITS: two pinned passes.
 *
 * (1) ZOOM-THROUGH INTRO. A tree silhouette rendered as halftone bars sits small in the
 *     centre of a dark screen. Pinned for 300% of the viewport, one scrubbed timeline:
 *       0 - 1.2   bounds grow from 34% x 90% to 340% x 800% (a camera push through the
 *                 image; cells grow with it, so the bars get fat)
 *       0.8 - 1.3 minW -0.02 -> 1.02 and threshold -> 256: every cell becomes a full block,
 *                 the scene "blooms" into solid sand (the theme flips to light at 55%)
 *       1.3 - 2.0 title scales 0 -> 1 on the sand
 * (2) HORIZONTAL CARD PASS (>= 992px). The track moves x 0 -> -(scrollWidth - innerWidth)
 *     while pinned, scrub 1. Each card carries a fixed random rotation (+-5..10deg) and a
 *     vertical offset that counter-scrubs while it crosses the viewport, using
 *     containerAnimation so the card's own ScrollTrigger measures the horizontal motion.
 *     Below 992px the track is a plain horizontal scroller.
 * Cards: click opens a dark info panel (clip-path inset(0 0 100% 0) scale 1.1 -> inset(0),
 * 1.2s Out; plus icon rotates 90deg; close clips to inset(100% 0 0 0) scale .75, 0.8s InOut).
 */
import { gsap, reduced } from '../core/gsap.js';
import { setThemeAll } from '../core/theme.js';
import { createHalftone } from './halftone.js';
import { $, $$ } from '../core/dom.js';

const rnd = (a, b) => a + Math.random() * (b - a);

export function initBenefits(images) {
  const intro = $('#ben-intro');
  const scene = createHalftone($('#ben-ht'), [{
    source: images.tree, xSquares: 70, ySquares: 84, bgOpacity: 0, fill: '--sand',
    blackPoint: 20, whitePoint: 210, threshold: 200, x: 0.33, y: 0.05, w: 0.34, h: 0.9,
  }]);
  const cards = $$('[data-card]');

  if (!reduced) {
    const cfg = scene && scene.layers[0].cfg;
    const p = { z: 0 };
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: intro, start: 'top top', end: '+=300%', pin: true, scrub: true,
        onUpdate: (s) => setThemeAll(s.progress > 0.55 ? 'light' : 'dark'),
      },
    });
    tl.fromTo('.ben_title', { scale: 0, opacity: 1 }, { scale: 1, duration: 0.7 }, 1.3);
    if (cfg) {
      tl.to(p, {
        z: 1, duration: 1.2, ease: 'power2.in',
        onUpdate() {
          cfg.w = gsap.utils.interpolate(0.34, 3.4, p.z); cfg.h = gsap.utils.interpolate(0.9, 8, p.z);
          cfg.x = 0.5 - cfg.w / 2; cfg.y = 0.5 - cfg.h / 2;
        },
      }, 0).to(cfg, { minW: 1.02, threshold: 256, duration: 0.5 }, 0.8);
    } else {
      tl.to({}, { duration: 2 }, 0);
    }
    tl.to({}, { duration: 0.7 }, 1.3);

    gsap.matchMedia().add('(min-width: 992px)', () => {
      const track = $('#ben-track'), stage = $('#ben-h-stage');
      const dist = () => track.scrollWidth - innerWidth;
      const move = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: stage, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
      cards.forEach((c) => {
        const a = rnd(-140, 140);
        gsap.fromTo(c, { y: a }, { y: -a, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } });
      });
    });
  }
  cards.forEach((c) => gsap.set(c, { rotate: (Math.random() < 0.5 ? -1 : 1) * rnd(5, 10) }));

  // card info panels
  let openCard = null;
  const toggle = (card, open) => {
    const info = $('.card_info', card);
    card.classList.toggle('is-open', open);
    gsap.to($('.card_plus i', card), { rotate: open ? 90 : 0, duration: 0.4 });
    gsap.killTweensOf(info);
    if (open) {
      gsap.fromTo(info, { clipPath: 'inset(0 0 100% 0)', scale: 1.1 }, { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: 1.2, ease: 'Out' });
      gsap.fromTo(info.children, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: 'Out', stagger: 0.1, delay: 0.2 });
    } else {
      gsap.to(info, { clipPath: 'inset(100% 0 0 0)', scale: 0.75, duration: 0.8, ease: 'InOut', onComplete: () => gsap.set(info, { clipPath: 'inset(0 0 100% 0)', scale: 1 }) });
    }
  };
  cards.forEach((c) => c.addEventListener('click', () => {
    const open = openCard !== c;
    if (openCard && open) toggle(openCard, false);
    toggle(c, open);
    openCard = open ? c : null;
  }));
}
