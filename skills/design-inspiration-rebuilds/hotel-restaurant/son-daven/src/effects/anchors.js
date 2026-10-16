/*
 * IN-PAGE NAVIGATION through the transition grid.
 * a[href^="#"] -> cover (grid scaleX 0->1), jump instantly (Lenis immediate), reveal.
 * With reduced motion the jump is a plain scroll.
 */
import { reduced } from '../core/gsap.js';
import { scrollToY, lockScroll, unlockScroll } from '../core/lenis.js';
import { cover, reveal } from './transition-grid.js';
import { $ } from '../core/dom.js';

export function initAnchors(menu) {
  document.addEventListener('click', async (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const wasOpen = menu.isOpen();
    if (wasOpen) menu.close();
    if (reduced) return scrollToY(target.getBoundingClientRect().top + scrollY, true);
    lockScroll();
    await cover();
    if (wasOpen) await new Promise((r) => setTimeout(r, 0));
    const id = a.getAttribute('href');
    const top = id === '#top' ? 0 : target.getBoundingClientRect().top + scrollY;
    scrollToY(top, true);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    unlockScroll();
    await reveal();
  });
}
