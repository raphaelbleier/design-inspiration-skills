/*
 * COOKIE CARD: enters from yPercent 100 once the intro is done (preloader.js),
 * leaves the same way. The choice is remembered for the session only.
 */
import { gsap } from '../core/gsap.js';
import { $, $$ } from '../core/dom.js';

export function initCookie() {
  const card = $('#cookie');
  let done = false;
  try { done = sessionStorage.getItem('cookieOk') === '1'; } catch { /* ignore */ }
  card.hidden = done;
  $$('[data-cookie-close]', card).forEach((b) => b.addEventListener('click', async () => {
    try { sessionStorage.setItem('cookieOk', '1'); } catch { /* ignore */ }
    await gsap.to(card, { yPercent: 100, duration: 0.8, ease: 'InOut' });
    card.hidden = true;
  }));
}
