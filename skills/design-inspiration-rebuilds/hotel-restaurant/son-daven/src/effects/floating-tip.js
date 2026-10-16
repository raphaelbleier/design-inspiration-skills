/*
 * CURSOR-FOLLOWING TIP (desktop, hover devices).
 * The tip trails the pointer at an offset of 1.388rem using gsap.quickTo (power3, 1.2s).
 * Appear: from scale 2 + clip-path inset(0 50% 0 50% round 24px) to inset(0 round 24px),
 * scale 1 (0.8s "Out"). Leave: scale 0.5, opacity 0 (0.4s "In").
 * Elements opt in with data-drag-tip="Label"; cards use "Open".
 */
import { gsap, hasHover, isDesktop } from '../core/gsap.js';
import { $, $$ } from '../core/dom.js';

export function initTip() {
  if (!hasHover) return;
  const tip = $('#tip'), txt = $('#tip-text');
  const qx = gsap.quickTo(tip, 'x', { duration: 1.2, ease: 'power3' });
  const qy = gsap.quickTo(tip, 'y', { duration: 1.2, ease: 'power3' });
  const off = () => parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.388;
  addEventListener('pointermove', (e) => { qx(e.clientX + off()); qy(e.clientY + off()); });
  const show = (label) => {
    if (!isDesktop()) return;
    txt.textContent = label;
    gsap.killTweensOf(tip, 'scale,opacity,clipPath');
    gsap.fromTo(tip, { scale: 2, opacity: 1, clipPath: 'inset(0 50% 0 50% round 24px)' }, { scale: 1, clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 0.8, ease: 'Out' });
  };
  const hide = () => gsap.to(tip, { scale: 0.5, opacity: 0, duration: 0.4, ease: 'In', overwrite: 'auto' });
  $$('[data-drag-tip], [data-card]').forEach((el) => {
    const label = el.dataset.dragTip || 'Open';
    el.addEventListener('pointerenter', () => show(label));
    el.addEventListener('pointerleave', hide);
  });
}
