/* Scroll timeline: one object `data` holds every scene parameter; a GSAP timeline tweens it.
 * 8 steps of duration 1 = the first 8 viewport-high sections; ScrollTrigger scrubs it (scrub: true,
 * Lenis already smooths the wheel). Step i is the move from section i-1 to section i, ease power1.inOut.
 * Angles are written in degrees and converted in `r`. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const r = (deg) => (deg * Math.PI) / 180;

export const data = {
  camX: 0, camY: 0, camZ: 10, camRX: 0, camRY: 0, camRZ: 0, fov: 30,
  canScale: 1, canX: 0, canY: 0, canZ: 0, canRX: 0, canRY: 0, canRZ: 0, spin: 0,
  spacing: 4.6, wave: 0, swirl: 0, baseOffset: 0,
  env: 1, spot: 0, tint: 1, pointer: 0.2, fade: 1,
};

const STEPS = [
  // 1 taste: can tilts right, camera comes in close
  { camZ: 6.5, fov: 40, canX: 1.0, canY: -0.4, canRX: r(-30), canRY: r(12), canRZ: r(18), spacing: 9, baseOffset: 8, env: 0.8 },
  // 2-5 benefits: camera orbits a little, can spins 120deg per step, spotlight on
  { camY: -0.6, camZ: 12, fov: 22, camRZ: r(-8), camRX: 0, canX: 0, canY: 0.2, canRX: 0, canRY: 0, canRZ: 0, spin: r(120), spacing: 2.4, baseOffset: 8, env: 0.35, spot: 60, tint: 0.4, pointer: 0 },
  { camX: 1.6, camY: -0.5, camZ: 12, camRY: r(-10), camRZ: r(4), canX: -0.8, spin: r(240), spacing: 2.4 },
  { camX: -1.6, camY: -0.5, camRY: r(10), camRZ: r(-4), canX: 0.8, spin: r(360), spacing: 2.2 },
  { camX: 0, camY: -0.3, camRY: 0, camRX: 0, camRZ: r(8), canX: 0, canY: 0.2, spin: r(480), spacing: 2.4 },
  // 6 argument: pull back, cans ripple
  { camY: 0, camZ: 13, fov: 24, camRX: 0, camRZ: 0, canY: 0, spin: r(540), spacing: 1.7, wave: 1, env: 0.7, spot: 0, tint: 1.2 },
  // 7 packshot: cans spiral into a helix, base drops away
  { camX: -3, camY: -3, camZ: 18, fov: 30, camRX: r(10), camRY: r(-9), camRZ: r(-10), canZ: -0.4, spin: r(540), spacing: 0.5, wave: 0, swirl: 1, baseOffset: 20, env: 0.5, tint: 2 },
  // 8 leave: camera sinks, scene fades out for the black content sections
  { camX: 0, camY: -6, camZ: 10, camRX: 0, camRY: 0, camRZ: 0, spacing: 0.6, fade: 0 },
];

export function buildTimeline(endEl) {
  gsap.registerPlugin(ScrollTrigger);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power1.inOut', duration: 1 } });
  STEPS.forEach((s) => tl.to(data, s));
  ScrollTrigger.create({ animation: tl, trigger: document.body, start: 0, end: () => endEl.offsetTop, scrub: true });
  return tl;
}
