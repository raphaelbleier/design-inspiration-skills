/*
 * Subpage opening load-in. Runs once fonts are ready (the original waits for its
 * `criticalContentLoaded` event). Initial state (CSS, .opening.pre):
 *   horizontal lines scaleX(0), vertical lines scaleY(0), misc elements scale(.9) + opacity 0.
 * Each element gets   opacity .7s {delay} cubic-bezier(.6,0,.6,1), transform .7s {delay} same curve
 * with delays:  h-lines i*200ms,  v-lines i*200+100ms,  misc (doodles, tags, title) i*80+160ms.
 * Lines start white and settle to the hairline colour 400ms after their own delay.
 * Arriving from a menu tile ("from-tile" flag): the title is already in place, so it skips its fade.
 */
import { currentSlug } from './data.js';
import { buildOpening } from './openings.js';
import { reduced } from './easing.js';

export function initOpening() {
  const op = document.querySelector('.opening');
  if (!op) return;
  buildOpening(currentSlug(), op);
  let fromTile = false;
  try { fromTile = !!sessionStorage.getItem('from-tile'); sessionStorage.removeItem('from-tile'); } catch {}
  const go = () => {
    const ease = 'cubic-bezier(.6,0,.6,1)';
    const set = (el, d) => {
      el.style.transition = `opacity .7s ${d}ms ${ease}, transform .7s ${d}ms ${ease}, background-color .3s ${d + 400}ms ease-in-out, color .3s ${d + 400}ms ease-in-out`;
    };
    op.querySelectorAll('.ol-h').forEach((el, i) => { set(el, i * 200); setTimeout(() => el.style.setProperty('--lc', 'var(--line)'), i * 200 + 400); });
    op.querySelectorAll('.ol-v').forEach((el, i) => { set(el, i * 200 + 100); setTimeout(() => el.style.setProperty('--lc', 'var(--line)'), i * 200 + 500); });
    op.querySelectorAll('.title-wrap, .oel').forEach((el, i) => set(el, i * 80 + 160));
    if (fromTile) op.querySelector('.title-wrap').style.transition = 'none';
    requestAnimationFrame(() => op.classList.remove('pre'));
  };
  if (reduced()) { op.classList.remove('pre'); op.querySelectorAll('.ol-h,.ol-v').forEach((l) => l.style.setProperty('--lc', 'var(--line)')); return; }
  if (fromTile) op.querySelector('.title-wrap').classList.add('landed');
  (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(go));
}
