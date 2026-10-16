/**
 * HUD: four square icon buttons on the right edge, 65px at desktop (right 30, first top 50), 45px on phones.
 * Top: checklist. Bottom stack (pitch = size + 17.5px): music, outfit, emoji wheel.
 * Panels share the paper-white / hard-shadow language: checklist, outfit editor (4 rows of arrow pairs + red X),
 * emoji wheel (10 icons, 5x2). Hover = 0.07s brightness flash. Opening any overlay hides the HUD and the touch stick.
 * Icons are inline SVG (fill #647A87-ish slate with dark ink stroke).
 */
import { OUTFITS } from './character.js';
import { boil, pop } from './stepped.js';
import { sfx, toggleMusic } from './audio.js';

const S = 'fill="#6f8a9c" stroke="#363a3c" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';
export const ICON = {
  list: `<svg viewBox="0 0 32 32"><g ${S}><rect x="3" y="5" width="6" height="5"/><rect x="3" y="13.5" width="6" height="5"/><rect x="3" y="22" width="6" height="5"/><rect x="12" y="5" width="17" height="5"/><rect x="12" y="13.5" width="17" height="5"/><rect x="12" y="22" width="17" height="5"/></g></svg>`,
  note: `<svg viewBox="0 0 32 32"><g ${S}><path d="M12 24V7l14-3v17"/><ellipse cx="9" cy="24" rx="4.5" ry="3.5"/><ellipse cx="23" cy="21" rx="4.5" ry="3.5"/></g></svg>`,
  noteOff: `<svg viewBox="0 0 32 32"><g ${S}><path d="M12 24V7l14-3v17"/><ellipse cx="9" cy="24" rx="4.5" ry="3.5"/><ellipse cx="23" cy="21" rx="4.5" ry="3.5"/></g><path d="M4 28L28 4" stroke="#f8f8f8" stroke-width="5" stroke-linecap="round"/><path d="M4 28L28 4" stroke="#363a3c" stroke-width="2" stroke-linecap="round"/></svg>`,
  shirt: `<svg viewBox="0 0 32 32"><g ${S}><path d="M11 4l5 3 5-3 8 5-3 6-4-2v14H10V13l-4 2-3-6z"/></g></svg>`,
  blob: `<svg viewBox="0 0 32 32"><g ${S}><path d="M16 4c3 3 1 5 3 7 5 1 9 5 9 10 0 4-3 7-12 7S4 25 4 21c0-5 4-9 9-10 2-2 0-4 3-7z"/></g><circle cx="12.5" cy="20" r="1.6" fill="#f8f8f8"/><circle cx="19.5" cy="20" r="1.6" fill="#f8f8f8"/><path d="M13 24q3 2 6 0" stroke="#f8f8f8" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`,
  left: `<svg viewBox="0 0 24 24"><path d="M18 3L5 12l13 9z" fill="#647A87" stroke="#363a3c" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  right: `<svg viewBox="0 0 24 24"><path d="M6 3l13 9-13 9z" fill="#647A87" stroke="#363a3c" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  x: `<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke="#363a3c" stroke-width="7" stroke-linecap="round"/><path d="M5 5l14 14M19 5L5 19" stroke="#c25959" stroke-width="4" stroke-linecap="round"/></svg>`,
};
const E = (body) => `<svg viewBox="0 0 32 32"><g stroke="#363a3c" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
export const EMOJI = [
  E('<path d="M16 4c-7 0-11 4-11 10 0 4 2 6 4 7v5h14v-5c2-1 4-3 4-7 0-6-4-10-11-10z" fill="#f1ecd8"/><circle cx="11.5" cy="14" r="3" fill="#363a3c"/><circle cx="20.5" cy="14" r="3" fill="#363a3c"/><path d="M14 22v3M18 22v3" fill="none"/>'),
  E('<path d="M4 11l12-6 12 6v12l-12 6-12-6z" fill="#cdb98c"/><path d="M4 11l12 6 12-6M16 17v12" fill="none"/>'),
  E('<path d="M8 5h14v20a3 3 0 0 0 3 3H11a3 3 0 0 1-3-3z" fill="#f1ecd8"/><path d="M12 10h7M12 15h7" fill="none"/>'),
  E('<path d="M8 4h16M8 28h16M10 4c0 8 12 8 12 12s-12 4-12 12M22 4c0 8-12 8-12 12s12 4 12 12" fill="#f3c258"/><path d="M11 26c1-4 9-4 10 0z" fill="#c25959"/>'),
  E('<circle cx="13" cy="13" r="8" fill="#cfe9f5"/><path d="M19 19l9 9" fill="none" stroke-width="4"/>'),
  E('<circle cx="16" cy="16" r="11" fill="#f3c258"/><circle cx="16" cy="16" r="5" fill="#f8f8f8"/>'),
  E('<path d="M4 22c0-6 4-8 6-8l4 4 12 2c2 0 2 6 0 6H4z" fill="#de794e"/><path d="M10 14v-5M13 18l3-3" fill="none"/>'),
  E('<path d="M16 28S4 20 4 12a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 8-12 16-12 16z" fill="#66BDE6"/>'),
  E('<path d="M16 5c3 4 1 5 3 7 5 1 9 5 9 10 0 4-3 6-12 6S4 26 4 22c0-5 4-9 9-10 2-2 0-3 3-7z" fill="#9a7a52"/>'),
  E('<path d="M9 28V14l-2-4V6h3v6h2V5h3v7h2V6h3v8l3-3 3 2-6 10v6z" fill="#f3c258"/>'),
];

export function createHud({ onOutfitToggle, onEmoji, onJoyVisible }) {
  const hud = document.getElementById('hud'), check = document.getElementById('checklist'), outfit = document.getElementById('outfit'), wheel = document.getElementById('wheel');
  const mk = (id, svg, label) => {
    const b = document.createElement('button'); b.id = id; b.className = 'hb ink-panel'; b.setAttribute('aria-label', label);
    b.innerHTML = `<div class="face"></div>${svg}`; b.addEventListener('pointerenter', () => { b.classList.add('flash'); sfx.hover(); setTimeout(() => b.classList.remove('flash'), 70); });
    document.body.append(b); b.hidden = true; boil(b, 1.2); return b;
  };
  const bList = mk('h-list', ICON.list, 'Checklist'), bMusic = mk('h-music', ICON.note, 'Music'), bOutfit = mk('h-outfit', ICON.shirt, 'Outfit'), bEmoji = mk('h-emoji', ICON.blob, 'Emotes');
  const all = [bList, bMusic, bOutfit, bEmoji];
  let overlay = null;

  // checklist
  const items = [['Climbing down the paper tower', 3, 'city'], ['A clerk who keeps ducking behind crates', 3, 'factory'], ['Lab coats and swapped parcels', 3, 'city'], ['A gift for the hilltop shrine', 2, 'forest'], ['A letter adrift offshore', 2, 'beach']];
  const progress = items.map(() => 0);
  const renderList = () => {
    check.querySelector('.inner').innerHTML = '<h2>Checklist:</h2><ul style="padding:0">' + items.map((it, i) =>
      `<li class="${progress[i] >= it[1] ? 'dim' : ''}"><span>${i + 1}. ${it[0]} (${progress[i]}/${it[1]})</span><img src="./img/${it[2]}.webp" alt="" width="70" height="44" onerror="this.style.visibility='hidden'"></li>`).join('') + '</ul>';
  };
  renderList(); boil(check, 1.5);

  // wheel
  const grid = wheel.querySelector('.grid');
  EMOJI.forEach((svg, i) => { const b = document.createElement('button'); b.innerHTML = svg; b.setAttribute('aria-label', 'Emote ' + (i + 1)); b.onclick = () => { sfx.pop(); close(); onEmoji(i); }; grid.append(b); });
  boil(wheel, 1.5);

  // outfit editor: 4 rows of arrow pairs flanking the character, red X on top
  const rows = ['hair', 'top', 'skirt', 'shoes'];
  const ys = [0.34, 0.5, 0.65, 0.81];
  const arrow = (dir, row, y) => {
    const b = document.createElement('button'); b.className = 'ink-panel'; b.setAttribute('aria-label', `${row} ${dir}`);
    b.innerHTML = `<div class="face"></div>${ICON[dir]}`; boil(b, 1.1);
    b.dataset.row = row; b.dataset.y = y; b.dataset.side = dir;
    b.onclick = () => { sfx.click(); const n = OUTFITS[row].length; hudApi.character.setPick({ [row]: (hudApi.character.pick[row] + (dir === 'left' ? n - 1 : 1)) % n }); };
    outfit.append(b); return b;
  };
  rows.forEach((r, i) => { arrow('left', r, ys[i]); arrow('right', r, ys[i]); });
  const xb = document.createElement('button'); xb.className = 'x ink-panel'; xb.setAttribute('aria-label', 'Close'); xb.innerHTML = `<div class="face"></div>${ICON.x}`; xb.onclick = () => close(); boil(xb, 1.1); outfit.append(xb);
  /** place arrows relative to the viewport centre column (the character sits there) */
  const layoutOutfit = () => {
    const w = innerWidth, h = innerHeight, gap = Math.min(155, w * 0.25);
    outfit.querySelectorAll('button[data-row]').forEach((b) => { b.style.left = w / 2 + (b.dataset.side === 'left' ? -gap : gap) + 'px'; b.style.top = h * b.dataset.y + 'px'; });
    xb.style.left = w / 2 + 'px'; xb.style.top = h * 0.2 + 'px';
  };
  addEventListener('resize', layoutOutfit); layoutOutfit();

  function setOverlay(name) {
    overlay = name;
    all.forEach((b) => (b.hidden = name === 'outfit' || !hudApi.visible));
    check.hidden = name !== 'check' ; wheel.hidden = name !== 'wheel'; outfit.hidden = name !== 'outfit';
    if (name === 'check') pop(check, true); if (name === 'wheel') pop(wheel, true);
    onOutfitToggle(name === 'outfit'); onJoyVisible(!name && hudApi.visible);
    document.body.classList.toggle('overlay-open', !!name);
  }
  function close() { setOverlay(null); }
  bList.onclick = () => { sfx.click(); overlay === 'check' ? close() : setOverlay('check'); };
  bOutfit.onclick = () => { sfx.click(); setOverlay('outfit'); };
  bEmoji.onclick = () => { sfx.click(); overlay === 'wheel' ? close() : setOverlay('wheel'); };
  let musicOn = true;
  bMusic.onclick = () => { sfx.click(); musicOn = toggleMusic(); bMusic.querySelector('svg').outerHTML = musicOn ? ICON.note : ICON.noteOff; };
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay) close(); });

  const hudApi = {
    visible: false, character: null,
    show(v) { hudApi.visible = v; all.forEach((b) => (b.hidden = !v)); onJoyVisible(v); },
    progress(i) { progress[i] = Math.min(items[i][1], progress[i] + 1); renderList(); },
    get overlay() { return overlay; },
  };
  return hudApi;
}
