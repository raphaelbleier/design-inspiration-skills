/*
 * HOME: infinite vertical roll of film slides
 * -------------------------------------------
 * DOM: one .slide per film (real <img> kept for SEO/a11y, hidden with opacity 0 once GL is up).
 * GL: one rect-driven mesh per slide, rect = the DOM media box + the slide's roll offset (px), so the DOM stays the
 * source of truth. Geometry: media inset --roll-gx / --roll-gy, pitch = media height + --roll-gap (42px @1440).
 * Motion: Slider (see slider.js) -> offset in slides -> translate3d on the slide + mesh rect + shader uniforms.
 * Velocity blur: slider.lspeed feeds u_speed (shader) and filter: blur(lspeed*60 px, max 10) on the slide text.
 * Title rollover: starts 2 s after SLIDER_SETTLED, repeats every 6 s (rollover.js).
 */
import gsap from 'gsap';
import { films } from '../data.js';
import { img } from '../assets.js';
import { GL } from '../gl.js';
import { homeFragment } from '../shaders.js';
import { Slider } from '../slider.js';
import { Roller } from '../rollover.js';
import { Scroll } from '../scroll.js';
import { Ticket } from '../ticket.js';
import { Cursor } from '../cursor.js';
import { laurel, stars, btnTicket } from '../parts.js';

const px = (root, name) => { const v = getComputedStyle(root).getPropertyValue(name).trim(); return v.endsWith('rem') ? parseFloat(v) * 16 : parseFloat(v); };
const row = (a, b) => `<div class="tbl-row"><span class="ro-t">${a}</span><span class="ro-t" data-v>${b}</span></div>`;

const slide = (f, i) => `
<article class="slide" data-i="${i}" aria-label="${f.title}">
  <div class="slide-media"><img src="${img[f.h]}" alt="Still from ${f.title.toLowerCase()}" ${i < 2 ? '' : 'loading="lazy"'} decoding="async"></div>
  <div class="slide-ui">
    <div class="ui-left">
      <div class="award"><span class="award-year">${f.year}</span><span class="award-fest">${f.fest}</span>${laurel(54)}</div>
      <div class="title-block">
        <span class="eyebrow">${f.kind}</span>
        <h2 class="display roll-title ro-t">${f.title}</h2>
        <div class="tbl">${row('DIRECTOR', f.director)}${row('YEAR', f.year)}${row('CATEGORY', f.kind)}</div>
      </div>
    </div>
    <div class="ui-right">
      <div class="reviews">${f.reviews.map((q, n) => `<div class="review">${stars}<span class="eyebrow">${n === 1 ? 'THE ' + f.festName + ' REPORT' : 'CRITICAL ACCLAIM'}</span><h3 class="display">${q}</h3></div>`).join('')}</div>
      ${btnTicket('EXPLORE', '#/case/' + f.id)}
    </div>
  </div>
</article>`;

export const home = {
  fixed: true,
  render: () => `
<section class="view home" data-fixed data-page-name="home">
  <div class="roll">${films.map(slide).join('')}</div>
  <div class="tutorial" data-cursor="hide" hidden>
    <p class="small">USE THE RIGHT MENU FOR SEAMLESS NAVIGATION</p>
    <button class="tut-close" type="button"><span>CLOSE</span><i><svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6"/></svg></i></button>
  </div>
</section>`,

  mount(root, params, { reduced }) {
    Scroll.lock();
    const slides = [...root.querySelectorAll('.slide')];
    const N = slides.length;
    const base = { x: 0, y: 0, w: 1, h: 1 }; let pitch = 1;
    const meshes = GL.ok ? slides.map((s, i) => GL.mesh(img[films[i].h], homeFragment, { u_offset: { value: 0 }, u_speed: { value: 0 } })) : [];
    document.documentElement.classList.toggle('gl-on', GL.ok);

    const measure = () => {
      const m = slides[0].querySelector('.slide-media');
      Object.assign(base, { x: m.offsetLeft, y: m.offsetTop, w: m.offsetWidth, h: m.offsetHeight });
      pitch = base.h + px(root, '--roll-gap');
    };
    measure();
    window.addEventListener('resize', measure);

    const roller = new Roller(reduced);
    const startRoll = (i) => roller.start([...slides[i].querySelectorAll('.ro-t')]);
    const slider = new Slider({ count: N, reduced, onSettle: startRoll });
    let shown = -1;
    const uis = slides.map((s) => s.querySelector('.slide-ui'));

    Ticket.list((i) => slider.goTo(i));

    const tick = (time, dtms) => {
      slider.update(dtms / 1000);
      const sp = reduced ? 0 : slider.lspeed;
      for (let i = 0; i < N; i++) {
        const off = slider.offset(i), y = off * pitch, vis = Math.abs(off) < 1.75;
        const s = slides[i];
        s.style.visibility = vis ? 'visible' : 'hidden';
        if (!vis) { if (meshes[i]) meshes[i].set(0, 0, 0, 0); continue; }
        s.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`;
        const b = Math.min(sp * 60, 10);
        uis[i].style.filter = b > 0.25 ? `blur(${b.toFixed(2)}px)` : '';
        uis[i].style.opacity = (1 - Math.min(1, Math.abs(off) / 0.55)).toFixed(3);   // only the active slide shows its text
        if (meshes[i]) {
          const m = meshes[i];
          m.u.u_offset.value = off; m.u.u_speed.value = Math.min(1, sp * 10);
          m.set(base.x, base.y + y, base.w, base.h);
        }
      }
      GL.state.speed = Math.min(1, sp * 8);
      const idx = ((Math.round(slider.current) % N) + N) % N;
      if (idx !== shown) { shown = idx; Ticket.film(idx, false); roller.stop(); if (slider.settled) startRoll(idx); }
      if (Math.abs(slider.speed) > 0.003) roller.bump();
    };
    gsap.ticker.add(tick);

    // PREV / NEXT hit areas in the top and bottom 18% of the stage (cursor label changes with them)
    Cursor.hit = (y) => (y < innerHeight * 0.18 ? 'PREV' : y > innerHeight * 0.82 ? 'NEXT' : null);
    const click = (e) => {
      if (e.target.closest('a,button,label,input,.tutorial,.nav') || slider.dragged > 6) return;   // label clicks re-fire on the hidden checkbox
      const z = Cursor.hit && Cursor.hit(e.clientY);
      if (z) slider.go(z === 'NEXT' ? 1 : -1);
    };
    window.addEventListener('click', click);

    // tutorial overlay: shown once per session
    const tut = root.querySelector('.tutorial');
    let seen = false; try { seen = sessionStorage.getItem('oriel-tut') === '1'; } catch (e) {}
    if (!seen && !reduced) {
      tut.hidden = false; gsap.from(tut, { autoAlpha: 0, y: 24, duration: 0.9, delay: 2.2, ease: 'expo.out' });
    }
    root.querySelector('.tut-close').addEventListener('click', () => {
      try { sessionStorage.setItem('oriel-tut', '1'); } catch (e) {}
      gsap.to(tut, { autoAlpha: 0, y: 16, duration: 0.5, ease: 'expo.out', onComplete: () => (tut.hidden = true) });
    });

    // entry reveal: active slide UI rises in once the page fades in
    const first = slides[0].querySelectorAll('.award, .eyebrow, .title-block .tbl, .review, .btn-ticket, .roll-title');
    if (!reduced) gsap.from(first, { y: 26, autoAlpha: 0, duration: 1.3, stagger: 0.06, ease: 'expo.out', delay: 0.5 });
    startRoll(0);
    Ticket.film(0, true);

    return () => {
      gsap.ticker.remove(tick); slider.destroy(); roller.stop(); meshes.forEach((m) => m.destroy());
      window.removeEventListener('resize', measure); window.removeEventListener('click', click);
      Cursor.hit = null; GL.state.speed = 0;
    };
  },
};
