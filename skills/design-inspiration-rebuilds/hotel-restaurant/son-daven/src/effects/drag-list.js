/*
 * FREE-MODE DRAG LIST (blog) + FILTER PILL.
 * The original uses Swiper freeMode (momentum, bounce, slidesPerView:auto). Here
 * GSAP Draggable + InertiaPlugin give the same feel: type "x", inertia, bounds
 * recomputed on resize/filter. The filter pill is a highlight element whose x and width
 * tween (0.8s InOut) to the active button; the label colour flips at 50%.
 */
import { gsap, Draggable, ScrollTrigger } from '../core/gsap.js';
import { $, $$ } from '../core/dom.js';

export function initDragList() {
  const list = $('#blog-list');
  const bounds = () => ({ minX: Math.min(0, innerWidth - list.scrollWidth - 16), maxX: 0 });
  const drag = Draggable.create(list, { type: 'x', inertia: true, bounds: bounds(), edgeResistance: 0.75, allowContextMenu: true, minimumMovement: 4 })[0];
  const fit = () => { drag.applyBounds(bounds()); drag.update(); };
  addEventListener('resize', fit);

  const pills = $('#pills'), hl = $('.pills_hl', pills), btns = $$('button', pills);
  const move = (b, animate = true) => {
    const x = b.offsetLeft, w = b.offsetWidth;
    animate ? gsap.to(hl, { x, width: w, duration: 0.8, ease: 'InOut' }) : gsap.set(hl, { x, width: w });
  };
  document.fonts.ready.then(() => move($('.is-active', pills), false));
  btns.forEach((b) => b.addEventListener('click', () => {
    if (b.classList.contains('is-active')) return;
    const prev = $('.is-active', pills);
    move(b);
    gsap.delayedCall(0.4, () => { prev.classList.remove('is-active'); b.classList.add('is-active'); });
    const cat = b.dataset.filter;
    gsap.to(list, { opacity: 0, duration: 0.4, onComplete: () => {
      $$('.post', list).forEach((p) => (p.hidden = p.dataset.cat !== cat));
      gsap.set(list, { x: 0 }); drag.update(); fit();
      gsap.fromTo($$('.post:not([hidden])', list), { yPercent: 15, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'Out', stagger: 0.1 });
      gsap.to(list, { opacity: 1, duration: 0.2 }); ScrollTrigger.refresh();
    } });
  }));
  $$('.post', list).forEach((p) => (p.hidden = p.dataset.cat !== 'news'));
  fit();
}
