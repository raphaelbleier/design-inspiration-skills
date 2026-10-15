/*
 * TAXI-STYLE PAGE TRANSITIONS (hash router)
 * -----------------------------------------
 * The original uses Taxi.js with allowInterruption:false and removeOldContent:true: a quiet fade, not a wipe, and the
 * WebGL canvas persists. Same contract here, with hash routes so dist/ works under any sub-path:
 *   leave  wrapper autoAlpha 0 (0.2s) in parallel with GL alpha -> 0
 *   swap   unmount old page, render + mount new page, Scroll reset
 *   enter  wrapper autoAlpha 1 (0.8s) after a delay of 0.6s (case/about), 1.4s (home/work), 0 (contact/404);
 *          GL alpha -> 1 with a 0.4s delay
 * Interrupted navigation is ignored while busy and re-checked afterwards (allowInterruption:false).
 * Logo colour: IntersectionObserver with rootMargin "0 0 -90% 0" over [data-color] blocks flips the logo black/cream.
 */
import gsap from 'gsap';
import { GL } from './gl.js';
import { Ticket } from './ticket.js';
import { Scroll } from './scroll.js';
import { Cursor } from './cursor.js';
import { home } from './pages/home.js';
import { work } from './pages/work.js';
import { casePage } from './pages/case.js';
import { about } from './pages/about.js';
import { contact, policy, notFound } from './pages/contact.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const app = document.getElementById('app');
const logo = document.querySelector('.logo');
const routes = [
  [/^\/?$/, 'home', home], [/^\/work\/?$/, 'work', work], [/^\/case\/([\w-]+)\/?$/, 'case', casePage],
  [/^\/about\/?$/, 'about', about], [/^\/contact\/?$/, 'contact', contact], [/^\/policy\/?$/, 'policy', policy],
];
const enterDelay = { home: 1.4, work: 1.4, case: 0.6, about: 0.6, contact: 0, policy: 0.2, 404: 0 };
let current = null, unmount = null, busy = false, io = null, glRender = null;

const match = (hash) => {
  const path = hash.replace(/^#/, '') || '/';
  for (const [re, name, page] of routes) { const m = path.match(re); if (m) return { path, name, page, params: { id: m[1] } }; }
  return { path, name: '404', page: notFound, params: {} };
};

function watchColors() {
  io && io.disconnect();
  logo.classList.remove('is-dark');
  const els = app.querySelectorAll('[data-color]');
  if (!els.length) return;
  io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) logo.classList.toggle('is-dark', e.target.dataset.color === 'dark'); });
  }, { rootMargin: '0px 0px -90% 0px' });
  els.forEach((el) => io.observe(el));
}

async function go() {
  if (busy) return;
  const next = match(location.hash);
  if (current && current.path === next.path) return;
  busy = true;
  const d = reduced ? 0.01 : 0.2;
  // leave
  if (current) {
    await Promise.all([
      gsap.to(app, { autoAlpha: 0, duration: d, ease: 'power1.out' }),
      GL.ok ? gsap.to(GL.state, { alpha: 0, duration: d }) : null,
    ]);
    unmount && unmount();
  } else gsap.set(app, { autoAlpha: 0 });
  // swap
  window.scrollTo(0, 0);
  app.innerHTML = next.page.render(next.params);
  Ticket.mode(next.name);
  Cursor.text = 'SCROLL';
  document.title = next.name === 'home' ? 'Oriel Film Foundation' : `${next.name === 'case' ? 'Film' : next.name[0].toUpperCase() + next.name.slice(1)} | Oriel Film Foundation`;
  unmount = next.page.mount(app, next.params, { reduced });
  watchColors();
  if (glRender) { gsap.ticker.remove(glRender); gsap.ticker.add(glRender); }   // keep GL last in the frame
  current = next;
  // enter
  const delay = reduced ? 0 : enterDelay[next.name] ?? 0;
  gsap.to(app, { autoAlpha: 1, duration: reduced ? 0.01 : 0.8, delay, ease: 'power1.out' });
  if (GL.ok) gsap.to(GL.state, { alpha: 1, duration: reduced ? 0.01 : 0.8, delay: delay + 0.4 * (reduced ? 0 : 1) });
  await new Promise((r) => setTimeout(r, (delay + (reduced ? 0 : 0.8)) * 1000 * 0.6));
  busy = false;
  if (match(location.hash).path !== current.path) go();
}

export const Router = {
  start(renderFn) { glRender = renderFn; window.addEventListener('hashchange', go); go(); },
};
