/**
 * chrome.js - header dropdowns (white rounded panel under the pills, closes on outside click / Escape),
 * mobile menu, announcement bar close.
 */
export function initChrome() {
  const drops = { shop: document.getElementById('drop-shop'), learn: document.getElementById('drop-learn') };
  const triggers = [...document.querySelectorAll('[data-drop]')];
  const burger = document.getElementById('burger');
  const mm = document.getElementById('menu-m');
  const closeAll = () => {
    Object.values(drops).forEach((d) => (d.hidden = true));
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
    if (mm) { mm.hidden = true; burger.setAttribute('aria-expanded', 'false'); }
  };
  triggers.forEach((t) => t.addEventListener('click', (e) => {
    e.stopPropagation();
    const d = drops[t.dataset.drop], open = d.hidden;
    closeAll();
    if (open) { d.hidden = false; t.setAttribute('aria-expanded', 'true'); }
  }));
  burger.addEventListener('click', (e) => { e.stopPropagation(); const open = mm.hidden; closeAll(); if (open) { mm.hidden = false; burger.setAttribute('aria-expanded', 'true'); } });
  document.addEventListener('click', (e) => { if (!e.target.closest('.drop, .menu-m')) closeAll(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
  mm?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeAll));
  document.querySelector('.announce-x').addEventListener('click', () => document.querySelector('.announce').classList.add('off'));
}
