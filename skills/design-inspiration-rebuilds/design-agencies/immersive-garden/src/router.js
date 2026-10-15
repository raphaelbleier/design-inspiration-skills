/* HASH ROUTER + PAGE TRANSITIONS
   Three views in one document (works from any sub-path / file server, no rewrite rules):
     #/                 home      relief canvas visible
     #/projects         list      #f3f3f3, no canvas
     #/projects/<slug>  project   #e8e8e8, no canvas
   Navigation = ink transition (ink.js): black blob blooms from the top-right corner, the view is
   swapped underneath it, then the blob recedes. Each view is mounted inside a gsap.context so
   its ScrollTriggers and SplitText instances are reverted on unmount. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from './state.js';
import { inkTransition } from './ink.js';
import { reset, scrollTo } from './scroll.js';
import { renderHome } from './views/home.js';
import { renderProjects, mountProjects } from './views/projects.js';
import { renderProject } from './views/project.js';
import { revealText } from './text-reveal.js';
import { mountShowreel } from './showreel.js';
import { mountMedia } from './media-hover.js';
import { mountFooter } from './footer.js';
import { mountFast } from './fast-mode.js';

const view = () => document.getElementById('view');
let ctx, cleanup, current = null;

const parse = () => {
  const h = location.hash;
  if (!h.startsWith('#/')) return current || { name: 'home' };
  const parts = h.slice(2).split('/').filter(Boolean);
  if (parts[0] === 'projects' && parts[1]) return { name: 'project', slug: parts[1] };
  if (parts[0] === 'projects') return { name: 'projects' };
  return { name: 'home' };
};
const key = (r) => `${r.name}:${r.slug || ''}`;

function mount(r) {
  const el = view();
  ctx?.revert(); cleanup?.();
  el.innerHTML = r.name === 'home' ? renderHome() : r.name === 'projects' ? renderProjects() : renderProject(r.slug);
  document.body.dataset.route = r.name; state.route = r.name;
  document.title = r.name === 'home' ? 'Lumen Orchard, digital experiences studio' : r.name === 'projects' ? 'Projects, Lumen Orchard' : `${r.slug.replace(/-/g, ' ')}, Lumen Orchard`;
  document.querySelector('.ui__back').setAttribute('href', r.name === 'project' ? '#/projects' : '#/');
  document.body.classList.remove('on-dark');
  reset();
  ctx = gsap.context(() => {
    revealText(el); mountMedia(el);
    if (r.name === 'home') { cleanup = mountShowreel(el); mountFooter(el); mountFast(); }
    if (r.name === 'projects') mountProjects(el);
    if (r.name === 'project') document.getElementById('backstage').onclick = (e) => { e.preventDefault(); scrollTo(document.getElementById('backstage-gal').offsetTop - innerHeight * 0.1); };
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  current = r;
}

export function initRouter() {
  mount(parse());
  addEventListener('hashchange', () => {
    const r = parse();
    if (current && key(r) === key(current)) return;
    inkTransition(async () => mount(r));
  });
}
