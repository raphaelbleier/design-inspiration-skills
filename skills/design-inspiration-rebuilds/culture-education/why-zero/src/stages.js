/* Wheel/touch-driven stage track (the page itself never scrolls).
 * target in [0, N-1] moves by deltaY * .0016 (wheel) or drag distance; cur eases to target
 * (lerp .08 per 60fps frame, frame-rate independent). A stage panel is visible while |cur - i| < 1:
 * opacity 1 - d, y = d * 60px, blur d * 8px. Snapping to the nearest integer after 180ms idle. */
import gsap from 'gsap';

export function createStages(count, onChange) {
  const panels = [...document.querySelectorAll('.stage')];
  let target = 0, cur = 0, idle;
  const clamp = (v) => Math.min(count - 1, Math.max(0, v));
  const snap = () => { target = Math.round(target); };
  const bump = (d) => { target = clamp(target + d); clearTimeout(idle); idle = setTimeout(snap, 180); };

  addEventListener('wheel', (e) => bump(e.deltaY * 0.0016), { passive: true });
  let y0 = null;
  addEventListener('touchstart', (e) => { y0 = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', (e) => { if (y0 == null) return; const y = e.touches[0].clientY; bump((y0 - y) * 0.004); y0 = y; }, { passive: true });
  addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' || e.key === ' ') go(Math.round(target) + 1); if (e.key === 'ArrowUp') go(Math.round(target) - 1); });
  const go = (i) => { target = clamp(i); };

  function update(dt) {
    cur += (target - cur) * (1 - Math.pow(0.92, dt * 60));
    panels.forEach((p, i) => {
      const d = Math.min(1, Math.abs(cur - i)), s = Math.sign(i - cur);
      p.style.opacity = 1 - d;
      p.style.transform = `translateY(${s * d * 60}px)`;
      p.style.filter = d > 0.01 ? `blur(${d * 8}px)` : 'none';
      p.style.pointerEvents = d < 0.5 ? 'auto' : 'none';
    });
    onChange(cur / (count - 1), cur, Math.abs(target - Math.round(target)) < 0.02 ? Math.round(target) : null);
  }
  return { update, go, get index() { return Math.round(target); } };
}
