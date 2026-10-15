/**
 * Project detail overlay (`#/portfolio/<slug>`; hash routing so dist/ works under any sub-path).
 *
 * TECHNIQUE: a DOM overlay over the canvas. Opens with a circular clip-path reveal growing from
 * the pointer (inOut3, 1.1 s); copy lines rise in a stagger. The text column scrolls natively on
 * its own (the global virtual-scroll wheel handler ignores events inside `.detail`) and ArrowUp/Down
 * work there too. Escape, the Close button and the logo all return home. While open, body gets
 * `detail-open` which hides the decorative HUD marks (only the logo stays, as the way home).
 */
import { gsap } from 'gsap';
import { PROJECTS } from './config.js';
import coverUrls from './covers.js';

const $ = (id) => document.getElementById(id);

export function createDetail({ onOpen, onClose }) {
  const root = $('detail');
  let current = null, origin = ['50%', '50%'];

  function fill(pr) {
    $('detail-img').src = coverUrls[pr.image];
    $('detail-img').alt = `${pr.name} cover artwork`;
    $('detail-code').textContent = pr.code;
    $('detail-title').textContent = pr.name;
    $('detail-summary').innerHTML = pr.summary.map((t) => `<p>${t}</p>`).join('');
  }

  function open(slug) {
    const pr = PROJECTS.find((p) => p.slug === slug);
    if (!pr || current === pr) return;
    current = pr;
    fill(pr);
    root.hidden = false;
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('detail-open');
    $('detail-col').scrollTop = 0;
    onOpen?.(pr);
    gsap.killTweensOf([root, '.detail-cover img', '.detail-col > *']);
    gsap.fromTo(root, { clipPath: `circle(0% at ${origin[0]} ${origin[1]})` }, { clipPath: `circle(150% at ${origin[0]} ${origin[1]})`, duration: 1.1, ease: 'inOut3' });
    gsap.fromTo('.detail-cover img', { scale: 1.9 }, { scale: 1.45, duration: 1.8, ease: 'inOut3' });
    gsap.fromTo('.detail-col > *, .detail-close', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.06, delay: 0.5 });
    $('detail-close').focus({ preventScroll: true });
  }

  function close() {
    if (!current) return;
    current = null;
    gsap.to(root, {
      clipPath: `circle(0% at ${origin[0]} ${origin[1]})`, duration: 0.8, ease: 'inOut3',
      onComplete: () => { root.hidden = true; root.setAttribute('aria-hidden', 'true'); document.body.classList.remove('detail-open'); onClose?.(); },
    });
  }

  function route() {
    const m = location.hash.match(/^#\/portfolio\/([\w-]+)/);
    if (m) open(m[1]); else close();
  }
  window.addEventListener('hashchange', route);
  $('detail-close').addEventListener('click', () => { location.hash = '#/'; });
  $('logo').addEventListener('click', (e) => { e.preventDefault(); location.hash = '#/'; });
  window.addEventListener('keydown', (e) => {
    if (!current) return;
    if (e.key === 'Escape') location.hash = '#/';
    const col = $('detail-col');
    if (e.key === 'ArrowDown') col.scrollBy({ top: 150 });
    if (e.key === 'ArrowUp') col.scrollBy({ top: -150 });
  });

  return {
    route,
    go(slug, x, y) { origin = [`${x}px`, `${y}px`]; location.hash = `#/portfolio/${slug}`; },
    get isOpen() { return !!current; },
  };
}
