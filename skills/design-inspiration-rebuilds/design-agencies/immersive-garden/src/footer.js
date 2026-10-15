/* FOOTER: black, two screens (100dvh each).
   Screen 1: "See all projects" + superscript count, 1px underline (hover .6 opacity, .5 s).
   Screen 2: e-mail (click copies, label "Copy to clipboard" -> "Copied"), address, newsletter
   (underline scaleX .5 s), socials.
   Background: a dark flower photo (slow sway) and a brightened copy revealed by a 260px radial
   mask at the pointer ("the cursor acts as a light", original: 100-intensity point light).
   Cursor positions are written by cursor.js on [data-light] hosts. */
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function mountFooter(root) {
  const foot = root.querySelector('.footer');
  // while the black footer is under the header the fixed UI turns light and the corner buttons step aside
  if (foot) ScrollTrigger.create({ trigger: foot, start: 'top 60px', end: 'bottom top', onToggle: (st) => document.body.classList.toggle('on-dark', st.isActive) });
  const btn = root.querySelector('[data-copy]'); if (!btn) return;
  const tip = btn.querySelector('.tip');
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); tip.textContent = 'Copied'; } catch { tip.textContent = btn.dataset.copy; }
    setTimeout(() => { tip.textContent = 'Copy to clipboard'; }, 1800);
  });
  root.querySelectorAll('[data-noop]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
}
