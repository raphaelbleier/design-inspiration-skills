/*
 * CONTACT (+ policy / 404, same shell)
 * ------------------------------------
 * Full #ff0f00 page. Giant stacked headline between full-width hairlines (rows are lh .77em with overflow hidden, so
 * each word rises out of its own slot), then e-mail + phone set as huge lines between ruled rows.
 * The page is intentionally scroll-free at 1440x900 but Lenis is on for small viewports.
 */
import gsap from 'gsap';
import { Scroll } from '../scroll.js';
import { Ticket } from '../ticket.js';
import { ruled, btnTicket } from '../parts.js';

export const contact = {
  render: () => `
<section class="view contact" data-color="dark">
  <span class="eyebrow center c-eyebrow">CONTACT US</span>
  ${ruled(['CRAFT', 'THE NEXT', 'ACT'], 'c-ruled')}
  <div class="c-rows">
    <a class="c-row" href="mailto:hello@oriel.example"><i class="eyebrow">PROJECT INQUIRIES</i><span class="display">HELLO@ORIEL.EXAMPLE</span></a>
    <a class="c-row" href="tel:+442079460000"><i class="eyebrow">PHONE NUMBER</i><span class="display">+44 20 7946 0000</span></a>
  </div>
</section>`,
  mount(root, p, { reduced }) {
    Scroll.enable(); Scroll.top(); Ticket.list(() => {});
    if (!reduced) {
      gsap.from('.c-ruled .ruled-word', { yPercent: 100, duration: 1.6, stagger: 0.12, ease: 'expo.out', delay: 0.5 });
      gsap.from('.c-eyebrow, .c-row', { autoAlpha: 0, y: 20, duration: 1.2, stagger: 0.1, ease: 'expo.out', delay: 0.4 });
    }
    return () => {};
  },
};

export const policy = {
  render: () => `
<section class="view policy" data-color="dark"><div class="policy-in">
  <span class="eyebrow center">COOKIE · TERMS · PRIVACY</span>
  <h1 class="display">LEGAL, IN BRIEF</h1>
  <p>This is a fictional studio built for a design study. It sets no cookies beyond a one-hour preloader flag, collects no personal data and has no terms to agree to.</p>
  ${btnTicket('BACK HOME', '#/', 'solid')}
</div></section>`,
  mount() { Scroll.enable(); Scroll.top(); Ticket.list(() => {}); return () => {}; },
};

export const notFound = {
  render: () => `
<section class="view nf" data-color="light"><div class="nf-in"><span class="eyebrow">ERROR 404</span><h1 class="display">LOST<br>REEL</h1>${btnTicket('BACK HOME', '#/', 'cream')}</div></section>`,
  mount() { Scroll.lock(); Ticket.list(() => {}); return () => {}; },
};
