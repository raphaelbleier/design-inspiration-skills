/*
 * CUSTOM CURSOR
 * -------------
 * 100px outlined ring with the label "SCROLL", following the pointer (lerp 0.2). Pressed state on mousedown.
 * Hidden over [data-cursor="hide"] (ticket, buttons, links) and on mouseleave; disabled for (hover: none).
 * On the home roll the top/bottom 18% of the stage turn it into PREV / NEXT hit areas (`stageHit`).
 */
import gsap from 'gsap';

const el = document.querySelector('.cursor');
const label = el.querySelector('.cursor-label');
let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, shown = false;
export const Cursor = { zone: null, text: 'SCROLL', hit: null };

if (!matchMedia('(hover: none)').matches) {
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    x = e.clientX; y = e.clientY;
    if (!shown) { shown = true; cx = x; cy = y; el.classList.add('is-on'); }
    const hide = e.target.closest('[data-cursor="hide"], a, button, label');
    el.classList.toggle('is-hidden', !!hide);
    if (Cursor.hit) { const z = Cursor.hit(y); label.textContent = z || Cursor.text; Cursor.zone = z; }
    else { label.textContent = Cursor.text; Cursor.zone = null; }
  });
  document.addEventListener('mouseleave', () => el.classList.remove('is-on')); 
  document.addEventListener('mouseenter', () => shown && el.classList.add('is-on'));
  window.addEventListener('pointerdown', () => el.classList.add('is-down'));
  window.addEventListener('pointerup', () => el.classList.remove('is-down'));
  gsap.ticker.add(() => {
    cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
    el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
  });
}
