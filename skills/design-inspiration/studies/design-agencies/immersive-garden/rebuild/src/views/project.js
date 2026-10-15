/* /projects/<slug>: centred 56px headline, "Launch website" link, 10-column hero media, text, parallax gallery, credits, next-project link. */
import { bySlug, projects } from '../data.js';

export function renderProject(slug) {
  const p = bySlug(slug) || projects[0];
  const next = projects[(projects.indexOf(p) + 1) % projects.length];
  const im = (i) => p.img[i % p.img.length];
  return `
  <article class="ppage" data-slug="${p.slug}">
    <section class="ppage__hero">
      <h1 class="ppage__title" data-reveal>${p.headline}</h1>
      <a class="ppage__launch" href="#/projects/${p.slug}" data-noop>Launch website</a>
    </section>
    <section class="grid"><div class="pmedia" style="grid-column:2 / span 10"><img src="./img/${im(0)}.webp" alt="" data-parallax></div></section>
    <section class="ppage__sect grid"><h2>The project</h2><p data-reveal>${p.body}</p></section>
    <section class="ppage__gal grid" id="backstage-gal">
      <div class="pmedia" style="--c:2;--n:5;--ar:3/4;--y:0"><img src="./img/${im(1)}.webp" alt="" data-parallax></div>
      <div class="pmedia" style="--c:8;--n:4;--ar:1/1;--y:12"><img src="./img/${im(2)}.webp" alt="" data-parallax></div>
      <div class="pmedia" style="--c:3;--n:8;--ar:16/9;--y:0"><img src="./img/${im(3)}.webp" alt="" data-parallax></div>
    </section>
    <section class="ppage__sect grid"><h2>Credits</h2>
      <div class="ppage__credits"><div><span>Client</span>${p.title}</div><div><span>Discipline</span>${p.tags}</div><div><span>Format</span>${p.type}</div><div><span>Year</span>2025</div></div></section>
    <a class="ppage__next" href="#/projects/${next.slug}"><small>Next project</small><strong>${next.title}</strong></a>
  </article>`;
}
