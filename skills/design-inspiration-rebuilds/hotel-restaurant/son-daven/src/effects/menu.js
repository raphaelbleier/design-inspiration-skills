/*
 * MENU OVERLAY
 *  - Button icon: lines rotate +-45 into an X (CSS transition 0.8s InOut); label swaps Menu/Close.
 *  - Panel: a mask reveal. mask-image is a 4x-tall gradient; --mask-y tweens 200% -> 0%
 *    (1.8s "Out"), sliding the soft edge down the panel.
 *  - Menu headings reveal with the word effect (delay 0.4s), contact info follows.
 *  - While open: header forced to the dark theme, scroll locked, fixed marks hidden.
 *  - Hover: hovered item stays opacity 1 (0.1s) while the rest drop to 0.2 (0.8s), in CSS.
 *  - Link clicks close the menu then run the grid transition and jump (anchors.js).
 */
import { gsap, SplitText, reduced } from '../core/gsap.js';
import { lockScroll, unlockScroll } from '../core/lenis.js';
import { setThemeAll } from '../core/theme.js';
import { $, $$ } from '../core/dom.js';

let open = false, split = [];

export function initMenu() {
  const btn = $('#menu-btn'), menu = $('#menu'), header = $('#header'), label = $('[data-menu-label]');
  split = $$('.menu_list a', menu).map((a) => SplitText.create(a, { type: 'words' }));
  let prevTheme = '';

  async function toggle(force) {
    const to = force ?? !open;
    if (to === open) return;
    open = to;
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open);
    label.textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('is-menu', open);
    if (open) {
      prevTheme = [...header.classList].find((c) => c.startsWith('theme_on-'));
      header.classList.remove(prevTheme); header.classList.add('theme_on-dark'); header.dataset.themeLock = '1';
      lockScroll();
      menu.hidden = false;
      gsap.killTweensOf(menu);
      if (reduced) { gsap.set(menu, { '--mask-y': '0%' }); return; }
      gsap.fromTo(menu, { '--mask-y': '200%' }, { '--mask-y': '0%', duration: 1.8, ease: 'Out' });
      split.forEach((s, i) => gsap.fromTo(s.words, { yPercent: 100, opacity: 0, scale: 0.5 }, { yPercent: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'Out', delay: 0.4 + i * 0.05, stagger: 0.025 }));
      gsap.fromTo('.menu_foot', { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 1 });
    } else {
      delete header.dataset.themeLock;
      header.classList.remove('theme_on-dark'); header.classList.add(prevTheme);
      unlockScroll();
      if (reduced) { menu.hidden = true; return; }
      await gsap.to(menu, { '--mask-y': '200%', duration: 0.8, ease: 'InOut' });
      if (!open) menu.hidden = true;
    }
  }
  btn.addEventListener('click', () => toggle());
  addEventListener('keydown', (e) => e.key === 'Escape' && open && toggle(false));
  return { close: () => toggle(false), isOpen: () => open };
}
export { setThemeAll };
