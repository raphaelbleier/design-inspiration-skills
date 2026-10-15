/*
 * Global shell for every subpage:
 *  - left rail (60px; 48px bottom bar <=991px): vertical page title with mix-blend-mode:difference,
 *    "Partner Info" button, 1px+ blue scroll-progress bar (scaleY / scaleX on mobile)
 *  - .nav-background takes the computed background colour of the section under the viewport centre;
 *    a luminance test picks the Partner Info colour (#3080ff on dark, #0061fe on light)
 *  - the nav button (90px / 64px, left edge, scaled to 2/3 at rest). Menu states are classes on
 *    .nav-container: open, warp, close, no-transitions. Position uses the individual `translate`
 *    property and the warp keyframes animate `scale`, so the two never fight.
 *  - overscroll-to-open: wheel/touch past the page end fills a conic-gradient ring on the button
 *  - tile click: 600ms "enlarge" so the clicked tile *becomes* the next page's opening
 *    (title scaled to the destination .title size, same column, same dark background), then location.href
 */
import './styles/tokens.css';
import './styles/base.css';
import './styles/tiles.css';
import './styles/shell.css';
import { PAGES, currentSlug } from './data.js';
import { buildNav, setClosedPose } from './tiles.js';
import { markSVG } from './brandmark.js';
import { buildOutro } from './fx/outro.js';
import { reduced, clamp } from './easing.js';
import { initOpening } from './opening.js';

const page = PAGES.find((p) => p.slug === currentSlug());
const $ = (s, r = document) => r.querySelector(s);

document.body.insertAdjacentHTML('afterbegin', `
  <div class="rail">
    <div class="nav-background"></div>
    <div class="rail-title">${page.title}</div>
    <button class="partner" type="button">Partner Info</button>
    <div class="progress"></div>
  </div>
  <div class="nav-container">
    <div class="nav-wrapper"></div>
    <div class="nav-tiles"></div>
    <button class="nav-button" type="button" aria-label="Open menu" aria-expanded="false">
      <span class="nb-ring"></span>
      <svg class="nb-burger" viewBox="0 0 30 30"><path d="M4 8h22M4 15h22M4 22h22" stroke="#fff" stroke-width="1.6" fill="none"/></svg>
      ${markSVG('nb-mark')}
    </button>
  </div>`);
document.querySelector('main')?.setAttribute('id', 'main');
const rail = $('.rail'), container = $('.nav-container'), btn = $('.nav-button'), main = $('main');
const units = buildNav($('.nav-tiles'));
const outro = buildOutro();
const isDesktop = () => innerWidth > 991;

/* ---------- rail: progress + background follows section ---------- */
const bg = $('.nav-background'), prog = $('.progress'), partner = $('.partner');
let ticking = false;
function onScroll() {
  ticking = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? clamp(scrollY / max) : 0;
  prog.style.transform = isDesktop() ? `scaleY(${p})` : `scaleX(${p})`;
  const probe = innerHeight / 2;
  let color = '#fff';
  for (const s of document.querySelectorAll('main > .opening, main > section, main > .snap-stage')) {
    const r = s.getBoundingClientRect();
    if (r.top <= probe && r.bottom > probe) { color = getComputedStyle(s).backgroundColor; break; }
  }
  if (color === 'rgba(0, 0, 0, 0)') color = '#fff';
  bg.style.backgroundColor = color;
  const m = color.match(/\d+(\.\d+)?/g)?.map(Number) ?? [255, 255, 255];
  const lum = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
  rail.classList.toggle('on-dark', lum <= 0.5);
  partner.style.color = lum <= 0.5 ? '#3080ff' : '#0061fe';
}
const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); onScroll();
// sections that tint themselves (Color page) finish their background transition after the last scroll event
main.addEventListener('transitionend', (e) => { if (e.propertyName === 'background-color') req(); });

/* ---------- menu open / close ---------- */
setClosedPose(units);
let resizeT;
addEventListener('resize', () => {
  container.classList.add('no-transitions'); setClosedPose(units);
  clearTimeout(resizeT); resizeT = setTimeout(() => container.classList.remove('no-transitions'), 100);
});
let isOpen = false;
function setMenu(open) {
  if (open === isOpen) return;
  isOpen = open;
  container.classList.toggle('open', open);
  container.classList.toggle('close', !open);
  container.classList.toggle('warp', !reduced());
  btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
  main.inert = open; rail.classList.toggle('hidden', open);
  units.forEach((u) => (u.querySelector('.tile').inert = !open));
  setOverscroll(0);
  if (open) $('.tile', units[0]).focus({ preventScroll: true });
  else btn.focus({ preventScroll: true });
}
btn.addEventListener('click', () => setMenu(!isOpen));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { outroOpen ? setOutro(false) : setMenu(!isOpen); }
});

/* ---------- partner info outro ---------- */
let outroOpen = false;
function setOutro(o) {
  outroOpen = o; document.documentElement.classList.toggle('outro-open', o); outro.inert = !o;
  document.body.style.overflow = o ? 'hidden' : '';
}
partner.addEventListener('click', () => setOutro(true));
outro.querySelector('.outro-close').addEventListener('click', () => setOutro(false));

/* ---------- overscroll to open ---------- */
let target = 0, cur = 0, hist = [0, 0, 0], lastWheel = 0, touchY = null;
function setOverscroll(v) {
  target = cur = v; hist = [v, v, v]; paintOverscroll(v);
}
function paintOverscroll(v) {
  btn.style.setProperty('--overscroll-progress', v.toFixed(3));
  document.documentElement.classList.toggle('os-active', v > 0.01);
  document.documentElement.style.setProperty('--os', v.toFixed(3));
}
const atEnd = () => scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
addEventListener('wheel', (e) => {
  if (isOpen || outroOpen || !atEnd() || e.deltaY <= 0) return;
  target = clamp(target + e.deltaY / 1500); lastWheel = performance.now();
}, { passive: true });
addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', (e) => {
  if (touchY == null || isOpen || !atEnd()) return;
  const d = touchY - e.touches[0].clientY; if (d > 0) { target = clamp(d / 200); lastWheel = performance.now(); }
}, { passive: true });
addEventListener('touchend', () => { touchY = null; });
let last = performance.now();
(function loop(t) {
  const dt = t - last; last = t;
  if (!isOpen && (target > 0 || cur > 0)) {
    if (t - lastWheel > 120) target = clamp(target - 0.002 * dt);        // decay once the wheel goes idle
    hist.push(target); hist.shift();                                     // average of the last 3 values...
    const avg = (hist[0] + hist[1] + hist[2]) / 3;
    cur += (avg - cur) * 0.2;                                            // ...then ease towards it
    paintOverscroll(cur);
    if (cur > 0.985) { setMenu(true); }
  }
  requestAnimationFrame(loop);
})(last);

/* ---------- tile click -> enlarge -> navigate ---------- */
const titleScale = () => Math.min(innerWidth * 0.1, 200) / parseFloat(getComputedStyle($('.tile-title', units[0])).fontSize);
container.addEventListener('click', (e) => {
  const a = e.target.closest('a.tile');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
  try { sessionStorage.setItem('from-tile', a.dataset.slug); } catch {}
  if (!isDesktop() || reduced()) return;           // <=991px: plain navigation
  e.preventDefault();
  const unit = a.parentElement, title = $('.tile-title', a);
  const r = unit.getBoundingClientRect(), tr = title.getBoundingClientRect(), ar = a.getBoundingClientRect();
  container.classList.add('leaving');
  Object.assign(unit.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', right: 'auto', bottom: 'auto' });
  Object.assign(title.style, { top: tr.top - ar.top + 'px', left: tr.left - ar.left + 'px' });
  unit.offsetWidth;
  unit.classList.add('enlarge'); container.classList.add('close');
  const col2 = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--margin')) + (innerWidth - 2 * 120 - 11 * 24) / 12 + 24;
  requestAnimationFrame(() => {
    Object.assign(unit.style, { left: '0px', top: '0px', width: '100vw', height: '100dvh' });
    Object.assign(title.style, { top: '50%', left: col2 + 'px', transformOrigin: '0 50%', transform: `translateY(-50%) scale(${titleScale()})` });
  });
  setTimeout(() => { location.href = a.href; }, 600);
});
addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });

initOpening();
