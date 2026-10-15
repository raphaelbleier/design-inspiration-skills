/*
 * Horizontal drag with momentum (used by the icon marquees, the colour chip carousel and the
 * customer carousel). Pointer events write a position; on release the last pointer velocity
 * (px/ms) is multiplied by 50 and decays by friction .95 per frame until it stops.
 * Usage: const d = dragScroller(el, { onMove(x) {...}, bounds: [min, max] | null });
 *        d.x / d.set(x) / d.push(v)
 */
export function dragScroller(el, { onMove, bounds = null, friction = 0.95 } = {}) {
  const s = { x: 0, v: 0, dragging: false, moved: 0 };
  let lastX = 0, lastT = 0, raf = 0;
  const apply = (x) => {
    if (bounds) x = Math.min(bounds[1], Math.max(bounds[0], x));
    s.x = x; onMove?.(x);
  };
  const tick = () => {
    s.v *= friction; apply(s.x + s.v);
    if (Math.abs(s.v) > 0.1) raf = requestAnimationFrame(tick);
  };
  el.addEventListener('pointerdown', (e) => {
    s.dragging = true; s.moved = 0; lastX = e.clientX; lastT = performance.now(); cancelAnimationFrame(raf); s.v = 0;
    el.setPointerCapture(e.pointerId); el.classList.add('dragging');
  });
  el.addEventListener('pointermove', (e) => {
    if (!s.dragging) return;
    const dx = e.clientX - lastX, now = performance.now(), dt = Math.max(1, now - lastT);
    s.moved += Math.abs(dx); lastX = e.clientX; lastT = now;
    s.v = (dx / dt) * 50 / 3;           // velocity in px per ~16ms frame, scaled by the original's x50 momentum
    apply(s.x + dx);
  });
  const up = () => { if (!s.dragging) return; s.dragging = false; el.classList.remove('dragging'); raf = requestAnimationFrame(tick); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('click', (e) => { if (s.moved > 5) e.stopPropagation(); }, true);
  return { get x() { return s.x; }, set: apply, push(v) { s.v += v; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); } };
}
