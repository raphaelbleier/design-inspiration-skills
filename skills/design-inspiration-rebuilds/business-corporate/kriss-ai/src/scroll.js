/* Virtual scroll: no native scrolling. Wheel / touch / keys move a target stage value (0..4);
   the displayed value eases toward it (1 - exp(-dt * 5)); after 120ms of silence the target
   snaps to the stage in the direction of travel. Exact values: wheel 0.0018/px, touch 0.004/px. */
export const STAGES = 5;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let target = 0, cur = 0, base = 0, idle;
const clamp = (v) => Math.min(STAGES - 1, Math.max(0, v));

function settle() {
  const d = target - base;
  base = d > 0.05 ? Math.min(STAGES - 1, base + 1) : d < -0.05 ? Math.max(0, base - 1) : base;
  target = base;
}
function push(delta) {
  target = clamp(target + delta);
  clearTimeout(idle); idle = setTimeout(settle, 120);
}
export function goTo(i) { clearTimeout(idle); base = target = clamp(i); }
export function initScroll() {
  addEventListener('wheel', (e) => { e.preventDefault(); push(e.deltaY * 0.0018); }, { passive: false });
  let y = null;
  addEventListener('touchstart', (e) => { y = e.touches[0].clientY; base = Math.round(target); }, { passive: true });
  addEventListener('touchmove', (e) => { const ny = e.touches[0].clientY; push((y - ny) * 0.004); y = ny; }, { passive: true });
  addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') goTo(Math.round(target) + 1);
    if (e.key === 'ArrowUp' || e.key === 'PageUp') goTo(Math.round(target) - 1);
  });
}
export function step(dt) {
  cur = reduce ? target : cur + (target - cur) * (1 - Math.exp(-dt * 5));
  return cur;
}
