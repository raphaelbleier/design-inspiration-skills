/**
 * Persistent HUD (DOM version of the original's in-canvas orthographic UI scene).
 *
 * TECHNIQUE: four corner groups + a few contextual elements, all driven from one update(loc)
 * call per frame so visibility is a pure function of scroll position:
 *  - manifesto (top right): igloo page only, fades out through the handover (tz).
 *  - scroll hint (bottom left): hides once you are > 25% of the igloo height away from its start.
 *  - callout (cubes page): project code + name, swaps (blur-fade) when the project changes.
 *  - room brackets "CLICK TO EXPLORE": only inside the entry room (p > .78).
 *  - sector label under the logo follows the page.
 * No boxes, cards or nav bar: just labels, `//////` markers and 1 px brackets.
 */
import { SCENES, PROJECTS } from './config.js';
import { clamp, smoothstep } from './eases.js';

const $ = (id) => document.getElementById(id);
const GLYPHS = '#/\\|<>+=%@01X';
const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Per-character scramble reveal: left-to-right lock-in, unlocked characters flicker. */
export function scramble(el, text = el.dataset.text ?? el.textContent, { dur = 0.9, delay = 0 } = {}) {
  el.dataset.text = text;
  const token = (el._sr = {});
  if (calm()) { el.textContent = text; return; }
  const t0 = performance.now() + delay * 1000;
  let lastFlick = 0, out = '';
  const tick = (now) => {
    if (el._sr !== token) return;
    const k = (now - t0) / (dur * 1000);
    if (k >= 1) { el.textContent = text; return; }
    if (now - lastFlick > 45 || k < 0) {
      lastFlick = now;
      const locked = Math.max(0, Math.floor(k * text.length));
      out = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        out += i < locked || ch === ' ' ? ch : k < 0 ? '\u2009' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function createHud() {
  const el = {
    hud: $('hud'), manifesto: $('manifesto'), hint: $('scroll-hint'), callout: $('callout'),
    code: $('callout-code'), name: $('callout-name'), room: $('room-ui'), sector: $('hud-sector'), date: $('hud-date'),
    logo: $('logo'), readout: $('hud-readout'),
  };
  const d = new Date();
  const dateText = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  el.date.textContent = dateText;
  let shownProject = -1, sector = '', readout = '', booted = false, shown = false;
  const hlEls = [...document.querySelectorAll('#manifesto .hl, #scroll-hint .hl')];
  const manifestoH = document.querySelector('#manifesto h2');
  const hlText = hlEls.map((n) => n.textContent);

  const setProject = (k) => {
    if (k === shownProject) return;
    shownProject = k;
    el.callout.classList.add('swap');
    setTimeout(() => {
      el.code.textContent = PROJECTS[k].code;
      el.name.textContent = PROJECTS[k].name;
      el.callout.classList.remove('swap');
    }, 180);
  };

  return {
    el,
    /** Boot cue (about 1.6 s into the intro): logo + date scramble in before the rest of the HUD. */
    boot() {
      if (booted) return;
      booted = true;
      el.hud.classList.add('boot');
      scramble(el.logo, 'NIVEO', { dur: 1.1 });
      scramble(el.date, dateText, { dur: 1.2, delay: 0.25 });
    },
    reveal() {
      this.boot();
      el.hud.classList.add('on');
      shown = true;
      hlEls.forEach((n, i) => scramble(n, hlText[i], { dur: 1.3, delay: 0.1 + i * 0.25 }));
      scramble(manifestoH, '////// Manifesto', { dur: 0.8 });
      scramble(el.sector, sector || el.sector.textContent, { dur: 0.9, delay: 0.3 });
    },
    update(L, project) {
      const id = SCENES[L.i].id;
      const inz = L.tz;
      el.manifesto.style.opacity = id === 'igloo' ? 1 - smoothstep(0.1, 0.5, inz) : 0;
      el.hint.style.opacity = id === 'igloo' && L.w < 0.25 * SCENES[0].height ? 1 : 0;
      const cub = id === 'cubes' ? smoothstep(0, 0.12, L.p) * (1 - smoothstep(0.05, 0.4, inz)) : 0;
      el.callout.style.opacity = cub;
      el.callout.style.pointerEvents = cub > 0.5 ? 'auto' : 'none';
      setProject(project);
      const room = id === 'entry' && L.p > 0.78 && inz === 0;
      el.room.classList.toggle('on', room);
      el.room.tabIndex = room ? 0 : -1;
      document.querySelectorAll('.room-tick').forEach((t) => t.classList.toggle('on', room));
      const label = SCENES[inz > 0.5 ? L.next : L.i].label;
      if (label !== sector) {
        sector = label;
        if (shown) { scramble(el.sector, label, { dur: 0.8 }); scramble(el.date, dateText, { dur: 0.8, delay: 0.1 }); }
        else el.sector.textContent = label;
      }
      const pct = String(Math.round((id === 'igloo' ? L.p : 0) * 100)).padStart(3, '0');
      const ro = `[ ${(71.2 + L.w * 0.31).toFixed(1)}N / ${(8.4 + L.w * 0.12).toFixed(1)}W / ${pct} ]`;
      if (ro !== readout) { readout = ro; el.readout.textContent = ro; }
      el.readout.style.opacity = el.manifesto.style.opacity;
    },
  };
}
