/*
 * CTA MODAL (consultation form).
 *  Open : card from { scale 0, rotateX -90, yPercent -100, rotate -25 } to identity,
 *         1.2s "Out", parent perspective 1000.
 *  Close: to { rotateX 90, yPercent 200, rotate 25 }, 0.8s "In".
 *  Submit: the card flips on rotateY (0 -> 180, 1.2s InOut) to reveal the thank-you face.
 * Scroll is locked while open. Escape and the backdrop close it.
 */
import { gsap, reduced } from '../core/gsap.js';
import { lockScroll, unlockScroll } from '../core/lenis.js';
import { $, $$ } from '../core/dom.js';

export function initModal() {
  const modal = $('#modal'), card = $('.modal_card', modal), form = $('#form');
  modal.style.perspective = '1000px';
  let open = false;

  async function show() {
    if (open) return; open = true;
    lockScroll();
    modal.hidden = false;
    gsap.set(card, { rotateY: 0 });
    gsap.fromTo('.modal_backdrop', { opacity: 0 }, { opacity: 1, duration: 0.8 });
    if (!reduced) await gsap.fromTo(card, { scale: 0, rotateX: -90, yPercent: -100, rotate: -25 }, { scale: 1, rotateX: 0, yPercent: 0, rotate: 0, duration: 1.2, ease: 'Out' });
    card.querySelector('input')?.focus();
  }
  async function hide() {
    if (!open) return; open = false;
    if (!reduced) {
      gsap.to('.modal_backdrop', { opacity: 0, duration: 0.8 });
      await gsap.to(card, { rotateX: 90, yPercent: 200, rotate: 25, duration: 0.8, ease: 'In' });
    }
    modal.hidden = true;
    unlockScroll();
  }
  $$('[data-modal-open]').forEach((b) => b.addEventListener('click', show));
  $$('[data-modal-close]', modal).forEach((b) => b.addEventListener('click', hide));
  addEventListener('keydown', (e) => e.key === 'Escape' && hide());
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    gsap.to(card, { rotateY: 180, duration: reduced ? 0 : 1.2, ease: 'InOut' });
  });
}
