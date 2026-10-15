/*
 * Cubic-bezier solver, the same idea as CSS cubic-bezier() but callable from JS.
 * The original hand-rolls it (12 subdivisions) and uses cubicBezier(1, .25, .85, 1)
 * as the single "home scroll curve": it maps raw scroll progress to the eased
 * progress that drives tile scale, tile translation and the centre-button states.
 * Newton-free bisection is plenty fast for one call per frame.
 */
export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 12; i++) {           // 12 subdivisions
      t = (lo + hi) / 2;
      sx(t) < x ? (lo = t) : (hi = t);
    }
    return sy(t);
  };
}
export const homeCurve = cubicBezier(1, 0.25, 0.85, 1);
export const easeOutQuad = (t) => t * (2 - t);
export const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
export const easeInOutQuint = (t) => (t < 0.5 ? 0.5 * Math.pow(2 * t, 5) : 1 - 0.5 * Math.pow(2 * (1 - t), 5));
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
