/*
 * CASE STUDY (Lenis page)
 * -----------------------
 * Full-bleed hero (75svh) with scrubbed parallax, then a cream (#faf7ef) body:
 *  - eyebrow + giant title between two full-width hairlines (row height = line-height .77em, overflow hidden, so the
 *    glyph bottoms are shaved by the rule, exactly like the original)
 *  - 4/8 grid: sticky portrait card (330px) + ticket-style credits (black label bars over dashed cells)
 *  - vertical marquee of award laurels over a rounded still, a player block, the "OUR FILMS" CTA, next-film ticket, footer
 * Reveals use ScrollTrigger with expo.out; images parallax with scrub:true while Lenis (lerp'd) drives the scroll.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { films, byId, mod } from '../data.js';
import { img } from '../assets.js';
import { Scroll } from '../scroll.js';
import { Ticket } from '../ticket.js';
import { footer, ourFilms, laurel, arrow, arrowLeft, arrowDown } from '../parts.js';

const nameCell = (label, name, cls = '') => `<div class="cc ${cls}"><span class="eyebrow">${label}</span><span class="display cc-name">${name}</span></div>`;

export const casePage = {
  render(params) {
    const f = byId(params.id), i = films.indexOf(f), next = films[mod(i + 1, films.length)];
    const c = f.credits;
    const fests = [f.festName, films[mod(i + 2, films.length)].festName, films[mod(i + 4, films.length)].festName];
    return `
<section class="view case" data-film="${i}">
  <header class="case-hero" data-color="light">
    <div class="hero-img"><img src="${img[f.h]}" alt="Still from ${f.title.toLowerCase()}"></div>
    <a class="back-pill" href="#/work" data-cursor="hide"><i>${arrowLeft}</i><span class="eyebrow">ALL WORK</span></a>
  </header>
  <div class="case-body" data-color="dark">
    <div class="case-head">
      <span class="eyebrow center">${f.kind}</span>
      <div class="ruled case-title"><div class="ruled-row"><h1 class="display ruled-word">${f.title}</h1></div></div>
      <button class="scroll-dot" type="button" aria-label="Scroll down">${arrowDown}</button>
    </div>
    <div class="case-grid">
      <aside class="director-card"><img src="${img[f.w]}" alt=""><div class="dc-in"><span class="eyebrow">DIRECTOR</span><span class="display">${c.director}</span></div></aside>
      <div class="credits">
        <div class="cr-top"><div class="cr-cell">${nameCell('DIRECTOR &amp; SCREENWRITER', c.director)}</div><div class="cr-cell">${nameCell('WRITTEN BY', c.writer)}</div></div>
        <div class="cr-three">
          <div><div class="bar eyebrow">PRODUCER</div><div class="cell">${c.prod}</div></div>
          <div><div class="bar eyebrow">EXECUTIVE PRODUCER</div><div class="cell">${c.exec1}</div></div>
          <div><div class="bar eyebrow">EXECUTIVE PRODUCER</div><div class="cell">${c.exec2}</div></div>
        </div>
        <div class="cr-crew"><div class="bar eyebrow">MAIN CREW</div>
          <div class="crew-grid"><div class="crew-cell"><span class="eyebrow">LEAD ACTOR</span><b class="display">${c.actor}</b></div><div class="crew-cell"><span class="eyebrow">LEAD ACTRESS</span><b class="display">${c.actress}</b></div>
          <div class="crew-cell wide"><span class="eyebrow">MUSIC</span><b class="display">${c.music}</b></div></div></div>
      </div>
    </div>

    <section class="awards" data-color="light"><div class="awards-img"><img src="${img.case}" alt="" loading="lazy"></div>
      <div class="marquee"><div class="marquee-in">${[0, 1].map(() => fests.map((n) => `<div class="mq-item">${laurel(46)}<span class="display">${n}</span></div>`).join('')).join('')}</div></div></section>

    <section class="player" data-color="light">
      <div class="player-box"><img src="${img[f.h]}" alt="" loading="lazy"><button class="play" type="button" aria-label="Play trailer"><svg viewBox="0 0 20 20" width="22" height="22"><path d="M5 3l12 7-12 7z" fill="currentColor"/></svg></button>
      <div class="pl-bar"><span class="eyebrow pl-t">00:00</span><i class="pl-track"><b></b></i><span class="eyebrow">TRAILER</span></div></div>
    </section>

    ${ourFilms()}

    <section class="next">
      <a class="next-all" href="#/work"><span class="eyebrow">SHOWCASE</span><b class="display">ALL WORK</b><em class="eyebrow">EXPLORE <i>${arrow}</i></em></a>
      <a class="next-film" href="#/case/${next.id}"><div class="nf-text"><span class="eyebrow">SHOWCASE</span><b class="display">${next.title}</b><em class="eyebrow">NEXT <i>${arrow}</i></em></div><div class="nf-img"><img src="${img[next.h]}" alt="" loading="lazy"></div></a>
    </section>
    ${footer()}
  </div>
</section>`;
  },

  mount(root, params, { reduced }) {
    Scroll.enable(); Scroll.top();
    const i = +root.querySelector('.case').dataset.film;
    Ticket.film(i, true);
    Ticket.list(() => {});
    const ctx = gsap.context(() => {
      if (!reduced) {
        gsap.from('.case-hero .hero-img', { scale: 1.12, duration: 2, ease: 'expo.out', delay: 0.4 });
        gsap.to('.case-hero img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.case-hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.from('.case-title h1', { yPercent: 100, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.case-head', start: 'top 85%' } });
        gsap.from('.cr-cell, .cr-three > div, .cr-crew, .director-card', { y: 50, autoAlpha: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.case-grid', start: 'top 82%' } });
        gsap.utils.toArray('.awards-img img, .next-film img, .cta-media img').forEach((im) =>
          gsap.fromTo(im, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
        gsap.from('.footer-ruled .ruled-word', { yPercent: 100, duration: 1.2, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.footer-ruled', start: 'top 85%' } });
      }
    }, root);

    root.querySelector('.scroll-dot').addEventListener('click', () => Scroll.to(root.querySelector('.case-grid')));

    // fake player: no video asset in this study, so the block animates a timecode + progress bar
    const box = root.querySelector('.player-box'), play = root.querySelector('.play'), bar = root.querySelector('.pl-track b'), tc = root.querySelector('.pl-t');
    const prog = { t: 0 }; let tw = null;
    play.addEventListener('click', () => {
      const playing = box.classList.toggle('is-playing');
      if (playing) { tw = gsap.to(prog, { t: 1, duration: 30 * (1 - prog.t), ease: 'none', onUpdate: () => { bar.style.transform = `scaleX(${prog.t})`; const s = Math.floor(prog.t * 30); tc.textContent = `00:${String(s).padStart(2, '0')}`; } }); }
      else tw && tw.kill();
    });
    return () => { ctx.revert(); ScrollTrigger.getAll().forEach((t) => t.kill()); tw && tw.kill(); };
  },
};
