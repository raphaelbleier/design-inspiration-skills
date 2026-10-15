/**
 * GSAP setup + the site's custom eases + delta-time maths helpers.
 *
 * TECHNIQUE: every motion in the original is a GSAP tween on a plain object
 * (uniform values, camera params) or a delta-time lerp. The eases are
 * CustomEase SVG-path curves - extreme "slow start, long settle" S-curves that
 * give the cinematic feel. Values below are exact.
 *
 * Defaults: ease power2.inOut, duration .6, overwrite auto.
 */
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);
gsap.defaults({ ease: 'power2.inOut', duration: 0.6, overwrite: 'auto' });

export const EASE_PATHS = {
  inOut1: 'M0,0 C0.5,0 0.1,1 1,1',
  inOut2: 'M0,0 C0.56,0 0,1 1,1',
  inOut3: 'M0,0 C0.6,0 0,1 1,1', // scene centring, overlay reveals
  inOut4: 'M0,0 C0.4,0 -0.06,1 1,1',
  inOut5: 'M0,0 C0.171,0 0.77,-0.013 0.842,0.272 0.972,0.794 0.972,0.85 1,1',
  entry_ease: 'M0,0 C0.358,0 0.336,0.209 0.442,0.519 0.59,0.952 0.768,0.918 1,1',
  entry_ease_2: 'M0,0 C0.388,0.082 0.924,0.862 1,1',
  entry_ease_3: 'M0,0 C0.272,0 0.472,0.454 0.496,0.496 0.66,0.79 0.685,1 1,1', // camera fall
  igloo_ease_1: 'M0,0 C0.662,0.073 0.047,1 1,1',
};
for (const [name, path] of Object.entries(EASE_PATHS)) CustomEase.create(name, path);

export const ease = (name) => gsap.parseEase(name);

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const fit = (v, a, b, c, d) => lerp(c, d, clamp((v - a) / (b - a)));
export const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const mod = (a, n) => ((a % n) + n) % n;

/** Frame-rate independent lerp: t is the factor per 60 fps frame. */
export const lerpFPS = (a, b, t, dt) => lerp(a, b, 1 - Math.pow(1 - t, dt * 60));
/** Same, but the per-frame step is capped (used for the first scroll smoothing stage). */
export const lerpFPSLimited = (a, b, t, dt, cap) => {
  const step = (b - a) * (1 - Math.pow(1 - t, dt * 60));
  const c = cap * dt * 60;
  return a + clamp(step, -c, c);
};

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
