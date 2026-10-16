// Collections list: hovering a row dims the others (opacity .25) and a small image follows the cursor.
// Follow: gsap.quickTo x/y .5s power3.out, offset (24, -60); image fades .3s. Disabled on touch.
import gsap from 'gsap';

export function initCollections(reduced) {
  if (matchMedia('(hover: none)').matches) return;
  const pop = document.querySelector('.coll-pop');
  const x = gsap.quickTo(pop, 'x', { duration: reduced ? 0 : 0.5, ease: 'power3.out' });
  const y = gsap.quickTo(pop, 'y', { duration: reduced ? 0 : 0.5, ease: 'power3.out' });
  addEventListener('pointermove', (e) => { x(e.clientX + 24); y(e.clientY - 60); });
  document.querySelectorAll('.coll li').forEach((li) => {
    li.addEventListener('pointerenter', () => { pop.src = li.dataset.img; gsap.to(pop, { opacity: 1, duration: 0.3 }); });
    li.addEventListener('pointerleave', () => gsap.to(pop, { opacity: 0, duration: 0.3 }));
  });
}
