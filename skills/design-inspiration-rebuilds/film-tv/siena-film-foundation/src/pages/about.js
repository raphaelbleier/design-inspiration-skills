/*
 * ABOUT: CSS-3D sphere wall + text blocks (Lenis page)
 * ----------------------------------------------------
 * The wall is CSS 3D, not WebGL: perspective 600 on the grid, 36 tiles (9x4 desktop, 6x6 mobile).
 * One paused timeline: every tile tweens from a radial scatter {x/y up to 900px, z -3000 .. -1800, rotateX/Y +-160..250deg,
 * opacity .05, scale .4} to its place on a bulging sphere {rotateY u*19deg, rotateX -v*15deg, z up to +70}.
 * Stagger {amount .15, from center, grid}, ease none, duration 1. Scroll scrubs it: value follows the scroll progress
 * (assembled at 55% of the sticky range) and the timeline is driven with lvalue = lerp(lvalue, value, .1); tl.seek(lvalue*total).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { img } from '../assets.js';
import { Scroll } from '../scroll.js';
import { Ticket } from '../ticket.js';
import { footer, ourFilms, ruled, arrowDown } from '../parts.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
const pool = ['h1', 'w1', 'h2', 'w2', 'h3', 'w3', 'h4', 'w4', 'h5', 'w5', 'h6', 'w6', 'case', 'dir'];
const tag = (t) => `<div class="tag-ticket"><span>${t}</span><i></i></div>`;

export const about = {
  render() {
    const tiles = Array.from({ length: 36 }, (_, n) => {
      const k = pool[(n * 7 + 3) % pool.length], ox = (n * 29) % 70 + 15, oy = (n * 47) % 60 + 20, z = 1 + ((n * 13) % 5) * 0.12;
      return `<figure class="tile"><img src="${img[k]}" alt="" loading="lazy" style="object-position:${ox}% ${oy}%;transform:scale(${z})"></figure>`;
    }).join('');
    return `
<section class="view about" data-color="light">
  <div class="a-intro">
    <div class="arch-frame"><img class="arch" src="${img.w4}" alt=""></div>
    <div class="a-center"><p class="a-lead display" data-a="abouttext">ORIEL FILM FOUNDATION IS A</p>
      ${ruled(['FILM', 'PRODUCTION', 'HOUSE'], 'a-ruled')}
      <p class="a-lead display" data-a="abouttext">DEDICATED TO CRAFTING GROUNDBREAKING NARRATIVES</p>
      <button class="a-dot" type="button" aria-label="Scroll down">${arrowDown}</button></div>
    <div class="arch-frame"><img class="arch" src="${img.w2}" alt=""></div>
  </div>

  <div class="wall" data-track="abouthero"><div class="wall-stage"><div class="wall-grid" data-a="aboutgrid">${tiles}</div></div></div>

  <section class="who">
    ${tag('WHO WE ARE')}
    <div class="founders">
      <article class="founder"><img src="${img.w2}" alt="" loading="lazy"><div><span class="eyebrow">FOUNDER</span><h3 class="display">ELSA<br>VANTERPOOL</h3><p data-a="abouttext">Elsa Vanterpool is a writer, director and producer known for patient, image-led documentaries. She founded Oriel to produce socially curious work and co-produced the festival favourite The Long Tide, and her first book on small-crew filmmaking is out this season.</p></div></article>
      <article class="founder"><img src="${img.w1}" alt="" loading="lazy"><div><span class="eyebrow">FOUNDER</span><h3 class="display">THEO<br>MARCHAND-LIND</h3><p data-a="abouttext">Theo Marchand-Lind is a seasoned producer with experience in drama series, feature films and documentaries. A film studies graduate, he has shepherded projects from first treatment to festival premiere, and joined Oriel in 2024 to lead development and financing.</p></div></article>
    </div>
  </section>

  <section class="services">
    ${tag('OUR SERVICES')}
    <div class="svc-grid">
      <article class="svc"><div class="svc-bar eyebrow">SERVICE 1</div><div class="svc-body"><h3 class="display">FILM<br>FINANCING</h3></div></article>
      <article class="svc"><div class="svc-bar eyebrow">SERVICE 2</div><div class="svc-body"><h3 class="display">FILM<br>PRODUCTION</h3></div></article>
    </div>
  </section>
  ${ourFilms()}
  ${footer()}
</section>`;
  },

  mount(root, params, { reduced }) {
    Scroll.enable(); Scroll.top(); Ticket.list(() => {});
    const grid = root.querySelector('.wall-grid'), tiles = [...grid.children];
    const mobile = matchMedia('(max-width: 767px)').matches;
    const cols = mobile ? 6 : 9, rows = mobile ? 6 : 4;
    grid.style.setProperty('--cols', cols);
    let splits = [];

    const tl = gsap.timeline({ paused: true });
    const rnd = gsap.utils.random;
    tiles.forEach((t, n) => {
      const c = n % cols, r = Math.floor(n / cols), u = (c - (cols - 1) / 2) / ((cols - 1) / 2), v = (r - (rows - 1) / 2) / ((rows - 1) / 2);
      const radial = Math.hypot(u, v) || 0.4, dx = (u || rnd(-.4, .4)) / radial, dy = (v || rnd(-.4, .4)) / radial;
      tl.fromTo(t,
        { x: dx * rnd(500, 900), y: dy * rnd(500, 900), z: rnd(-3000, -1800), rotationX: rnd(160, 250) * (v >= 0 ? 1 : -1), rotationY: rnd(160, 250) * (u >= 0 ? -1 : 1), opacity: 0.05, scale: 0.4 },
        { x: 0, y: 0, z: 70 * (1 - (u * u + v * v) / 2), rotationX: -v * 15, rotationY: u * 19, opacity: 1, scale: 1, ease: 'none', duration: 1, immediateRender: true,
          // stagger from the centre: the middle tiles land first
          }, Math.hypot(u, v) / Math.SQRT2 * 0.15);
    });
    const total = tl.totalDuration();
    let value = 0, lvalue = reduced ? 1 : 0;
    if (reduced) tl.progress(1);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: '.wall', start: 'top top', end: 'bottom bottom', onUpdate: (s) => { value = Math.min(1, s.progress / 0.55); } });
      // before the wall is reached, start already assembling a little so it is not empty when it sticks
      ScrollTrigger.create({ trigger: '.wall', start: 'top bottom', end: 'top top', onUpdate: (s) => { if (s.progress < 1 && value < 0.001) value = 0; } });
      if (!reduced) {
        gsap.from('.arch-frame', { y: 80, autoAlpha: 0, duration: 1.6, stagger: 0.1, ease: 'expo.out', delay: 0.5 });
        gsap.from('.a-ruled .ruled-word', { yPercent: 100, duration: 1.6, stagger: 0.12, ease: 'expo.out', delay: 0.7 });
        gsap.utils.toArray('.who .tag-ticket, .services .tag-ticket').forEach((el) => gsap.from(el, { scale: .8, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
        gsap.from('.founder', { y: 60, autoAlpha: 0, duration: 1.3, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.founders', start: 'top 85%' } });
        gsap.from('.svc', { y: 60, autoAlpha: 0, duration: 1.3, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.svc-grid', start: 'top 85%' } });
        gsap.utils.toArray('.cta-media img').forEach((im) => gsap.fromTo(im, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
        gsap.from('.footer-ruled .ruled-word', { yPercent: 100, duration: 1.2, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.footer-ruled', start: 'top 85%' } });
        // about text: line masks rise in (SplitText, free since GSAP 3.13)
        root.querySelectorAll('.founder p').forEach((p) => {
          const s = SplitText.create(p, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.1, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 90%' } }) });
          splits.push(s);
        });
      }
    }, root);

    const tick = () => {
      lvalue += (value - lvalue) * 0.1;
      if (!reduced) tl.time(lvalue * total);
    };
    gsap.ticker.add(tick);
    root.querySelector('.a-dot').addEventListener('click', () => Scroll.to(root.querySelector('.wall')));

    return () => { gsap.ticker.remove(tick); ctx.revert(); splits.forEach((s) => s.revert()); tl.kill(); ScrollTrigger.getAll().forEach((t) => t.kill()); };
  },
};
