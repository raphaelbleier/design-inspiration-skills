/* "Hold & move" interaction on the hand panel.
 * The round cursor chip follows the pointer (quickTo .35s power3). Dragging pushes the hand toward the pointer,
 * clamped to +-90px; release springs it back with elastic.out(1, .5). Pure decoration: scroll is never blocked. */
import gsap from 'gsap';

export function initHand(panel) {
  const hand = panel.querySelector('#hand');
  const hold = panel.querySelector('#hold');
  if (!matchMedia('(hover: hover)').matches) return;
  const hx = gsap.quickTo(hold, 'x', { duration: 0.35, ease: 'power3' });
  const hy = gsap.quickTo(hold, 'y', { duration: 0.35, ease: 'power3' });
  const dx = gsap.quickTo(hand, 'x', { duration: 0.5, ease: 'power3' });
  const dy = gsap.quickTo(hand, 'y', { duration: 0.5, ease: 'power3' });
  let down = null;
  panel.addEventListener('pointermove', (e) => {
    const r = panel.getBoundingClientRect();
    hx(e.clientX - r.left - 38); hy(e.clientY - r.top - 38);
    if (down) {
      dx(gsap.utils.clamp(-90, 90, (e.clientX - down.x) * 0.6));
      dy(gsap.utils.clamp(-90, 90, (e.clientY - down.y) * 0.6));
    }
  });
  panel.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; gsap.to(hold, { scale: 0.85, duration: 0.2 }); });
  const up = () => {
    if (!down) return;
    down = null;
    gsap.to(hold, { scale: 1, duration: 0.3 });
    gsap.to(hand, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, .5)', overwrite: true });
  };
  addEventListener('pointerup', up);
  panel.addEventListener('pointerleave', up);
}
