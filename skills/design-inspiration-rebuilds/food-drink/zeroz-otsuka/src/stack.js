/* Chapter 4 product stacks: two piles of photo slabs in CSS 3D, left pile rotateY +62deg, right
   -62deg (perspective 900px). Technique: slab i sits at x = i * 54px * side, z = -i * gap, and on
   scroll the gap opens from 8px to 46px while the whole pile slides in from the edge (x +-30vw -> 0)
   and back out, so the cards fan like an opening book. */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initStack() {
  if (reduced) return;
  const ch = document.querySelector('#product');
  [['.stack-l', 1], ['.stack-r', -1]].forEach(([sel, side]) => {
    const st = ch.querySelector(sel), cards = [...st.children];
    const set = (gap) => cards.forEach((c, i) => gsap.set(c, { x: side * i * 54, z: -i * gap, rotateY: side * 62, yPercent: -50 }));
    const o = { gap: 8, shift: 40 };
    set(o.gap);
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: ch, start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
      .fromTo(st, { x: () => -side * innerWidth * 0.3 }, { x: 0, duration: 30, ease: 'power2.out' }, 0)
      .to(o, { gap: 46, duration: 50, onUpdate: () => set(o.gap) }, 10)
      .to(st, { x: () => -side * innerWidth * 0.3, duration: 20 }, 80);
  });
}
