/*
 * WORK: horizontal slider of portrait cards + FOOTAGE / POSTER mode
 * ----------------------------------------------------------------
 * Same Slider as home (axis x). 3 cards fully visible + peeks, active card centred (pitch = card width + gap = 429px @1440).
 * Per card the shader gets focus = smoothstep(1.5, 0, |offset|) and a signed speed:
 *   blur radius = (1-focus)*14px + |speed|*18px, brightness mix(.34, 1, focus). The card text gets a CSS blur from the same numbers.
 * Footage mode tweens one value f 0 -> 1 (0.8 s expo.out): cards fade/scale out, two staggered rows of square stills
 * drift in opposite directions (row direction alternates), blurred + dimmed by distance from the screen centre.
 * Tick scrubber: period of 80px per film, translateX(-frac(current) * 80); the centre frame never moves.
 */
import gsap from 'gsap';
import { films, mod } from '../data.js';
import { img } from '../assets.js';
import { GL } from '../gl.js';
import { workFragment, stillFragment } from '../shaders.js';
import { Slider } from '../slider.js';
import { Roller } from '../rollover.js';
import { Scroll } from '../scroll.js';
import { Ticket } from '../ticket.js';
import { btnTicket } from '../parts.js';

const px = (root, name) => { const v = getComputedStyle(root).getPropertyValue(name).trim(); return v.endsWith('rem') ? parseFloat(v) * 16 : parseFloat(v); };
const rowH = (a, b) => `<div class="tbl-row"><span class="ro-t">${a}</span><span class="ro-t">${b}</span></div>`;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const stillPool = ['h1', 'w1', 'h2', 'w2', 'h3', 'w3', 'h4', 'w4', 'h5', 'w5', 'h6', 'w6', 'case', 'dir'];

const card = (f, i) => `
<article class="card" data-i="${i}" aria-label="${f.title}">
  <div class="card-media"><img src="${img[f.w]}" alt="Portrait still from ${f.title.toLowerCase()}" ${i < 3 ? '' : 'loading="lazy"'}></div>
  <div class="card-ui"><span class="eyebrow">${f.kind}</span><h2 class="display ro-t">${f.title}</h2>
    <div class="tbl">${rowH('YEAR', f.year)}${rowH('LOCATION', f.place)}${rowH('CATEGORY', f.kind)}</div></div>
</article>`;

const toggleIcons = `
<button class="tg tg-poster is-on" type="button" aria-label="Poster view" aria-pressed="true"><svg viewBox="0 0 30 24" width="30" height="24"><path d="M1 3h3v18H1zM26 3h3v18h-3z" fill="currentColor"/><rect x="8" y="2" width="14" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/></svg></button>
<button class="tg tg-foot" type="button" aria-label="Footage view" aria-pressed="false"><svg viewBox="0 0 26 24" width="26" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="9" height="9" rx="1.5"/><rect x="15" y="2" width="9" height="9" rx="1.5"/><rect x="2" y="13" width="9" height="9" rx="1.5"/><rect x="15" y="13" width="9" height="9" rx="1.5"/></svg></button>`;

export const work = {
  fixed: true,
  render: () => `
<section class="view work" data-fixed>
  <div class="toggle" data-cursor="hide"><div class="toggle-pill">${toggleIcons}</div><div class="toggle-label"><b>FOOTAGE</b><i>MODE</i></div></div>
  <div class="hair" aria-hidden="true"></div>
  <div class="cards">${films.map(card).join('')}</div>
  <div class="foot-info"><img alt="" width="50" height="50"><span class="eyebrow"></span><b class="display"></b></div>
  <div class="scrub" aria-hidden="true"><div class="ticks"></div><i class="frame"></i></div>
  <div class="work-cta">${btnTicket('EXPLORE', '#/case/' + films[0].id)}</div>
</section>`,

  mount(root, params, { reduced }) {
    Scroll.lock();
    const view = root.querySelector('.work');
    const cards = [...root.querySelectorAll('.card')];
    const N = cards.length;
    const geo = { w: 390, h: 580, pitch: 430, top: 160, tile: 225, tpitch: 245, rowY: [0, 0] };
    const meshes = GL.ok ? cards.map((c, i) => GL.mesh(img[films[i].w], workFragment, { u_focus: { value: 1 }, u_speed: { value: 0 } })) : [];
    document.documentElement.classList.toggle('gl-on', GL.ok);

    // footage tiles (two rows)
    let tiles = [];
    const buildTiles = () => {
      tiles.forEach((t) => t.m && t.m.destroy()); tiles = [];
      if (!GL.ok) return;
      const per = Math.ceil((innerWidth + geo.tpitch * 2) / geo.tpitch) + 1;
      for (let r = 0; r < 2; r++) for (let i = 0; i < per; i++) {
        const n = (i * 5 + r * 3) % stillPool.length;
        const m = GL.mesh(img[stillPool[n]], stillFragment, { u_focus: { value: 1 }, u_crop: { value: [((n * 37) % 11 - 5) * 0.012, ((n * 53) % 9 - 4) * 0.012] }, u_in: { value: 0 } });
        tiles.push({ m, r, i, per });
      }
    };

    const measure = () => {
      geo.w = px(view, '--card-w'); geo.h = px(view, '--card-h'); geo.pitch = geo.w + px(view, '--card-gap');
      geo.top = (innerHeight - geo.h) / 2 + (innerWidth >= 768 ? 6 : 0);
      geo.tile = px(view, '--tile'); geo.tpitch = geo.tile * 1.09;
      geo.rowY = [innerHeight / 2 - 10 - geo.tile - 10, innerHeight / 2 - 10 + 10];
      buildTiles();
    };
    measure();
    window.addEventListener('resize', measure);

    // scrubber
    const ticks = root.querySelector('.ticks');
    ticks.innerHTML = Array.from({ length: 48 }, (_, i) => `<i style="height:${i % 8 === 0 ? 14 : i % 4 === 0 ? 10 : 6}px"></i>`).join('');

    // mode state
    const mode = { f: 0, target: 'poster' };
    const label = root.querySelector('.toggle-label');
    const setMode = (m) => {
      if (m === mode.target) return;
      mode.target = m;
      root.querySelector('.tg-poster').classList.toggle('is-on', m === 'poster'); root.querySelector('.tg-foot').classList.toggle('is-on', m === 'footage');
      root.querySelector('.tg-poster').setAttribute('aria-pressed', m === 'poster'); root.querySelector('.tg-foot').setAttribute('aria-pressed', m === 'footage');
      label.querySelector('b').textContent = m === 'poster' ? 'FOOTAGE' : 'POSTER';
      view.classList.toggle('is-footage', m === 'footage');
      gsap.to(mode, { f: m === 'footage' ? 1 : 0, duration: 0.8, ease: 'expo.out' });
    };
    root.querySelector('.tg-poster').addEventListener('click', () => setMode('poster'));
    root.querySelector('.tg-foot').addEventListener('click', () => setMode('footage'));

    const roller = new Roller(reduced);
    const startRoll = (i) => roller.start([...cards[i].querySelectorAll('.ro-t')]);
    const slider = new Slider({ count: N, axis: 'x', reduced, onSettle: (i) => mode.target === 'poster' && startRoll(i) });
    Ticket.list((i) => slider.goTo(i));

    const info = root.querySelector('.foot-info'), explore = root.querySelector('.work-cta a');
    const uis = cards.map((c) => c.querySelector('.card-ui'));
    let shown = -1;

    const tick = (time, dtms) => {
      slider.update(dtms / 1000);
      const sp = reduced ? 0 : slider.lspeed, sv = reduced ? 0 : slider.vel;
      const cx = innerWidth / 2 - (innerWidth >= 768 ? 11 : 0), F = mode.f;   // the original centres the active card 11px left of the hairline
      for (let i = 0; i < N; i++) {
        const off = slider.offset(i), x = cx - geo.w / 2 + off * geo.pitch, c = cards[i];
        const vis = Math.abs(off) < 3.1 && F < 0.999;
        c.style.visibility = vis ? 'visible' : 'hidden';
        const focus = smooth(1.5, 0, Math.abs(off));
        if (vis) {
          c.style.transform = `translate3d(${x.toFixed(2)}px, ${geo.top}px, 0) scale(${(1 - F * 0.06).toFixed(4)})`;
          const b = (1 - focus) * 4 + Math.min(sp * 80, 8);
          uis[i].style.filter = b > 0.3 ? `blur(${b.toFixed(2)}px)` : '';
          uis[i].style.opacity = ((0.35 + 0.65 * focus) * (1 - F)).toFixed(3);
        }
        if (meshes[i]) {
          const m = meshes[i]; m.u.u_focus.value = focus; m.u.u_speed.value = Math.max(-1, Math.min(1, sv * 14)); m.u.u_alpha.value = 1 - F;
          if (vis) { const s = 1 - F * 0.06; m.set(x + geo.w * (1 - s) / 2, geo.top + geo.h * (1 - s) / 2, geo.w * s, geo.h * s); } else m.set(0, 0, 0, 0);
        }
      }
      // footage rows
      if (tiles.length) {
        const per = tiles[0].per, span = per * geo.tpitch;
        tiles.forEach((t) => {
          const dir = t.r === 0 ? -1 : 1;
          const shiftX = dir * (time * 22) + dir * slider.current * geo.tpitch * 0.9 + (t.r ? geo.tpitch * 0.5 : 0);
          const x = mod(t.i * geo.tpitch + shiftX, span) - geo.tpitch;
          const focus = smooth(innerWidth * 0.62, 0, Math.abs(x + geo.tile / 2 - cx));
          t.m.u.u_focus.value = focus; t.m.u.u_in.value = F; t.m.u.u_alpha.value = 1;
          const s = 0.9 + F * 0.1, y = geo.rowY[t.r] + (1 - F) * (t.r ? 30 : -30);
          t.m.set(x + geo.tile * (1 - s) / 2, y + geo.tile * (1 - s) / 2, geo.tile * s, geo.tile * s);
        });
      }
      ticks.style.transform = `translateX(${(-(slider.current - Math.floor(slider.current)) * 80).toFixed(2)}px)`;
      GL.state.speed = Math.min(1, sp * 8);
      const idx = mod(Math.round(slider.current), N);
      if (idx !== shown) {
        shown = idx; Ticket.film(idx, false); roller.stop(); if (slider.settled && mode.target === 'poster') startRoll(idx);
        const f = films[idx]; explore.setAttribute('href', '#/case/' + f.id);
        info.querySelector('img').src = img[f.w]; info.querySelector('.eyebrow').textContent = f.kind; info.querySelector('b').textContent = f.title;
      }
      info.style.opacity = F.toFixed(3);
      if (Math.abs(slider.speed) > 0.003) roller.bump();
    };
    gsap.ticker.add(tick);

    // click a side card to bring it to the centre, centre card opens the case page
    const click = (e) => {
      const c = e.target.closest('.card'); if (!c || slider.dragged > 6 || mode.target !== 'poster') return;
      const i = +c.dataset.i;
      if (i === mod(Math.round(slider.current), N)) location.hash = '#/case/' + films[i].id; else slider.goTo(i);
    };
    root.addEventListener('click', click);

    if (!reduced) gsap.from(cards, { autoAlpha: 0, y: 40, duration: 1.4, stagger: 0.08, ease: 'expo.out', delay: 0.5 });
    startRoll(0);
    Ticket.film(0, true);
    return () => {
      gsap.ticker.remove(tick); slider.destroy(); roller.stop(); meshes.forEach((m) => m.destroy()); tiles.forEach((t) => t.m && t.m.destroy());
      window.removeEventListener('resize', measure); GL.state.speed = 0;
    };
  },
};
