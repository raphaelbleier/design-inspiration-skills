/*
 * PRELOADER (first visit per session) + FLIP LOGO HAND-OFF.
 *
 *  1. Scroll locks; the transition grid starts fully covered in the dark theme.
 *  2. Logo sits centred (position:fixed class .logo--pre); a percent counter shows
 *     load progress (fonts + hero image + every halftone source).
 *  3. Hold >= 1.2s so the counter is readable, then the count fades.
 *  4. Grid wipes out (transition-grid reveal) while the hero image scales 1.5 -> 1
 *     over 2.4s "Out".
 *  5. After 0.4s the logo is moved to its header slot with GSAP Flip (1.8s "InOut",
 *     scale:true so the font-size change is a transform, not a reflow).
 *  6. Header drops in (yPercent -100 -> 0, 1.2s InOut), cookie card and sound toggle
 *     rise in, reveals start, scroll unlocks.
 * Repeat visits (sessionStorage.hasVisited) skip to the short version: the grid just
 * wipes out once assets are ready. No spinner: the counter and the logo carry the wait.
 */
import { gsap, Flip, reduced } from '../core/gsap.js';
import { lockScroll, unlockScroll } from '../core/lenis.js';
import { $ } from '../core/dom.js';
import { startCovered, reveal } from './transition-grid.js';

const seen = () => { try { return sessionStorage.getItem('hasVisited'); } catch { return null; } };
const mark = () => { try { sessionStorage.setItem('hasVisited', '1'); } catch { /* private mode */ } };

export async function runPreloader(ready, onIntro) {
  const pre = $('#preloader'), logo = $('#logo'), header = $('#header');
  const pct = $('#pre-pct');
  if (reduced) { pre.hidden = true; onIntro(); return; }

  lockScroll();
  startCovered('dark');
  pre.style.background = 'transparent';   // the grid is now the cover
  header.classList.remove('theme_on-light'); header.classList.add('theme_on-dark');
  const full = !seen();
  gsap.set('#sound, #cookie', { yPercent: 125 });
  gsap.set('.hero_media img', { scale: 1.5 });
  const rest = '.header_in > :not(.logo)';

  if (full) {
    logo.classList.add('logo--pre');                // header carries no transform, so fixed positioning holds
    gsap.set(rest, { opacity: 0 });
    gsap.fromTo(logo, { xPercent: -50, yPercent: -25, opacity: 0 }, { yPercent: -50, opacity: 1, duration: 1.2, ease: 'Out' });
    const c = { v: 0 };
    const count = gsap.to(c, { v: 92, duration: 2.4, ease: 'power2.out', onUpdate: () => (pct.textContent = Math.round(c.v)) });
    await Promise.all([ready, new Promise((r) => setTimeout(r, 1200))]);
    count.kill();
    await gsap.to(c, { v: 100, duration: 0.4, ease: 'none', onUpdate: () => (pct.textContent = Math.round(c.v)) });
    await gsap.to('.preloader_count', { opacity: 0, duration: 0.4 });
  } else {
    gsap.set(header, { yPercent: -100 });
    await ready;
  }

  onIntro();                                       // reveals start under the wipe
  const zoom = gsap.to('.hero_media img', { scale: 1, duration: 2.4, ease: 'Out' });
  reveal();
  if (full) {
    await new Promise((r) => setTimeout(r, 400));
    const state = Flip.getState(logo);
    logo.classList.remove('logo--pre');
    gsap.set(logo, { clearProps: 'all' });
    await Flip.from(state, { duration: 1.8, ease: 'InOut', scale: true });
    gsap.to(rest, { opacity: 1, duration: 0.8, clearProps: 'opacity' });
  } else {
    gsap.to(header, { yPercent: 0, duration: 1.2, ease: 'InOut' });
  }
  pre.hidden = true;
  gsap.to('#sound, #cookie', { yPercent: 0, duration: 1.2, ease: 'Out', stagger: 0.1 });
  mark();
  unlockScroll();
  await zoom;
}
