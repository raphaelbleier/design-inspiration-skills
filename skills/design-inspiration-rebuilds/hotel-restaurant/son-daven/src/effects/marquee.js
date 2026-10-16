/*
 * MARQUEE: 24s linear loop. The track holds the label twice (two identical halves),
 * so animating xPercent 0 -> -50 repeats seamlessly. It plays only while in view and
 * its timeScale follows scroll speed: timeScale(1 + 0.01 * |scrollVelocity|).
 */
import { gsap, ScrollTrigger, reduced } from '../core/gsap.js';
import { $$ } from '../core/dom.js';

export function initMarquee() {
  $$('[data-marquee]').forEach((el) => {
    if (reduced) return;
    const tween = gsap.to(el, { xPercent: -50, duration: 24, ease: 'none', repeat: -1, paused: true });
    ScrollTrigger.create({
      trigger: el, start: 'top bottom', end: 'bottom top',
      onToggle: (s) => (s.isActive ? tween.play() : tween.pause()),
      onUpdate: (s) => tween.timeScale(1 + 0.01 * Math.abs(s.getVelocity())),
    });
  });
}
