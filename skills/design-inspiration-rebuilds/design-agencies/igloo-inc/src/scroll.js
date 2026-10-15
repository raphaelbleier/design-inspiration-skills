/**
 * Virtual infinite scroll (no native scroll: html/body overflow hidden, touch-action none).
 *
 * TECHNIQUE
 *  - Wheel / ArrowUp,Down (150 px) / touch drag only add to `t2` (target). 1 unit = ~1333 px
 *    of wheel delta (MULT = 0.00075).
 *  - t2 is clamped to +-750 px-equivalent around the current y, so a hard flick can never
 *    outrun the camera.
 *  - Two chained smoothers: t1 = lerpFPSLimited(t1, t2, .075, cap 100*MULT), then
 *    y = lerpFPS(y, t1, .15). Both are delta-time based (60 fps equivalent factors).
 *  - y is unbounded; the world position is mod(y, TOTAL), so the loop has no seam.
 *  - After 1.4 s of idle the view auto-centres: between pages it tweens to the nearest
 *    edge of the handover; inside a page that page's own autoCentre decides (see PAGE_REST).
 *    Tween = gsap.to(state, {y, ease:'inOut3', duration: expo.out(fit(dist,0,.2,.05,1))*1.5 + extra}).
 *  - Each page has progress p (0..1 of its content) and a handover value tz (0..1) in the
 *    last TRANSITION units, where the frost wipe to the next page plays.
 */
import { gsap } from 'gsap';
import { SCENES, TRANSITION } from './config.js';
import { clamp, fit, mod, ease, lerpFPS, lerpFPSLimited, reducedMotion } from './eases.js';

export const MULT = 0.00075;
const LIMIT = 750 * MULT;
export const TOTAL = SCENES.reduce((s, c) => s + c.height, 0);
const IDLE = 1.4;

export const tops = (() => {
  let t = 0;
  return SCENES.map((s) => { const top = t; t += s.height; return top; });
})();

/** Where a page settles when the view idles inside it. Returns target p or null (stay). */
const PAGE_REST = {
  igloo: (p) => (p < 0.35 ? 0 : null),
  cubes: (p) => (p < 0.5 ? 0.25 : 0.75),
  entry: (p) => (p < 0.45 ? 0.2 : p < 0.7 ? 0.76 : null),
};

export function locate(y) {
  const w = mod(y, TOTAL);
  for (let i = 0; i < SCENES.length; i++) {
    const h = SCENES[i].height, top = tops[i], end = top + h;
    if (w < end || i === SCENES.length - 1) {
      return {
        i, w, top, end, h,
        next: (i + 1) % SCENES.length,
        p: clamp((w - top) / (h - TRANSITION)),
        tz: clamp((w - (end - TRANSITION)) / TRANSITION),
      };
    }
  }
}

export function createScroll() {
  const s = { y: 0, t1: 0, t2: 0, vel: 0, enabled: false, auto: false, tween: null, lastActive: 0 };
  const now = () => performance.now() / 1000;

  const push = (dy) => {
    if (!s.enabled || s.auto) return;
    if (s.tween) { s.tween.kill(); s.tween = null; }
    s.hold = false;
    s.t2 = clamp(s.t2 + dy * MULT, s.y - LIMIT, s.y + LIMIT);
    s.lastActive = now();
  };

  window.addEventListener('wheel', (e) => {
    if (e.target.closest?.('.detail')) return;
    e.preventDefault();
    push(e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY);
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') push(150);
    else if (e.key === 'ArrowUp') push(-150);
  });

  let ty = null;
  window.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (ty === null || e.target.closest?.('.detail')) return;
    const y = e.touches[0].clientY;
    push((ty - y) * 1.6);
    ty = y;
  }, { passive: true });
  window.addEventListener('touchend', () => { ty = null; });

  /** Tween to an absolute y (programmatic). `lock` blocks user input until done. */
  s.to = (target, extra = 1, lock = false, duration) => {
    if (s.tween) s.tween.kill();
    const dist = Math.abs(target - s.y);
    const dur = duration ?? (reducedMotion() ? 0.01 : ease('expo.out')(fit(dist, 0, 0.2, 0.05, 1)) * 1.5 + extra);
    s.auto = lock;
    s.tween = gsap.to(s, {
      y: target, duration: dur, ease: 'inOut3',
      onComplete: () => { s.tween = null; s.auto = false; s.t1 = s.t2 = s.y; s.lastActive = now(); },
    });
  };

  const autoCentre = () => {
    const L = locate(s.y);
    let w;
    let extra = 1;
    if (L.tz > 0 && L.tz < 1) {
      w = L.tz < 0.5 ? L.end - TRANSITION : L.end;
    } else {
      const rest = PAGE_REST[SCENES[L.i].id](L.p);
      if (rest === null) return;
      w = L.top + rest * (L.h - TRANSITION);
      extra = 2;
    }
    if (Math.abs(w - L.w) < 0.004) return;
    s.to(s.y + (w - L.w), extra);
  };

  s.prevY = 0;
  s.update = (dt) => {
    const prev = s.prevY;
    if (s.tween) {
      s.t1 = s.t2 = s.y;
    } else {
      s.t1 = lerpFPSLimited(s.t1, s.t2, 0.075, dt, 100 * MULT);
      s.y = lerpFPS(s.y, s.t1, 0.15, dt);
    }
    s.prevY = s.y;
    const v = clamp((Math.abs(s.y - prev) / Math.max(dt, 1e-3)) * 0.35);
    s.vel = Math.max(s.vel * Math.pow(0.98, dt * 60), v); // friction .98, clamped 0-1
    if (v > 0.002) s.lastActive = now();
    if (!s.tween && s.enabled && !s.auto && !s.hold && now() - s.lastActive > IDLE) { s.lastActive = now(); autoCentre(); }
  };
  return s;
}
