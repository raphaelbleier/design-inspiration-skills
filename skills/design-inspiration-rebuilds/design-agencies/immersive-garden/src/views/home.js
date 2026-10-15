/* HOME VIEW MARKUP: intro row (logo, baseline, "Scroll down"), hero, showreel plane, text blocks, project blocks laid out by templates in data.js, black footer. */
import { studio, homeProjects, templates, projects } from '../data.js';
import { logoMarkup } from '../logo.js';

const media = (p, src, [, c, n, r, y, ar]) => `
  <div class="pitem pitem--media" style="--c:${c};--n:${n};--r:${r};--y:${y};--ar:${ar}">
    <a class="media" href="#/projects/${p.slug}" data-cursor="Discover" aria-label="${p.title}">
      <img src="./img/${src}.webp" alt="" loading="lazy" decoding="async">
      <span class="media__veil"></span><span class="media__spot"></span>
    </a>
  </div>`;

const text = (p, [, c, n, r, y]) => `
  <div class="pitem pitem--text" style="--c:${c};--n:${n};--r:${r};--y:${y}">
    <p class="legend" data-reveal>${p.legend}</p>
    <p class="mlink"><a href="#/projects/${p.slug}">${p.title}</a><span>${p.type}</span></p>
  </div>`;

function block(p) {
  let mi = 0;
  const items = templates[p.tpl].map((it) => (it[0] === 'm' ? (mi < p.img.length ? media(p, p.img[mi++], it) : '') : text(p, it))).join('');
  return `<article class="pblock grid" data-slug="${p.slug}">${items}</article>`;
}

const tblock = (label, body, id) => `
  <section class="tblock" id="${id}"><div class="tblock__inner" style="display:contents">
    <p class="tblock__label">${label}</p><p class="tblock__text" data-reveal>${body}</p></div></section>`;

export function renderHome() {
  const blocks = homeProjects.map(block);
  blocks.splice(4, 0, tblock('Our mission', studio.mission, 'mission'));
  return `
  <section class="intro" id="top"><div class="intro__row grid">
    <div class="logo" data-logo-slot>${logoMarkup()}</div>
    <p class="intro__base">${studio.baseline}</p>
    <p class="intro__scroll">Scroll down</p>
  </div></section>

  <section class="hero grid"><h1 class="hero__text" data-reveal>${studio.hero}</h1></section>

  <section class="showreel grid" aria-label="Showreel">
    <div class="showreel__box" data-cursor="Play" data-showreel>
      <div class="showreel__frame">
        ${['show1', 'show2', 'show3'].map((s, i) => `<div class="showreel__slide${i ? '' : ' is-on'}"><img src="./img/${s}.webp" alt=""></div>`).join('')}
        <span class="showreel__shade"></span>
      </div>
      <div class="showreel__bar"><span>Showreel</span><button type="button" data-prev aria-label="Previous">&larr;</button><span class="count">1 / 3</span><button type="button" data-next aria-label="Next">&rarr;</button></div>
    </div>
  </section>

  ${tblock('Our approach', studio.approach, 'approach')}
  ${blocks.join('')}

  <footer class="footer" data-light>
    <div class="footer__art"><div class="footer__bg" style="background-image:url(./img/footer.webp)"></div>
    <div class="footer__lit" style="background-image:url(./img/footer.webp)"></div></div>
    <section class="footer__screen footer__screen--1">
      <a class="footer__cta" href="#/projects">See all projects<sup>(${projects.length})</sup></a>
    </section>
    <section class="footer__screen footer__screen--2">
      <button class="footer__mail" type="button" data-copy="${studio.email}" data-cursor="">${studio.email}<span class="tip">Copy to clipboard</span></button>
      <p class="footer__addr">${studio.address.join('<br>')}</p>
      <div class="footer__links"><a class="nl" href="mailto:${studio.email}?subject=Newsletter">Newsletter</a>
        <span class="soc"><a href="#/" data-noop>X</a><a href="#/" data-noop>Instagram</a><a href="#/" data-noop>Linkedin</a></span></div>
    </section>
  </footer>`;
}
