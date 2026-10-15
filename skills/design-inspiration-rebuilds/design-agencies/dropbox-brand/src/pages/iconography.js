/*
 * Iconography.
 *  - letter tiles: hover scrambles a tile through a few glyphs, landing on a random one ("Hover to Shuffle")
 *  - folder stack: "New stack" clones a card (random icon, one of 32 names, item count) that flies in with a Web Animation;
 *    beyond 15 cards the oldest fades out and is removed
 *  - marquees: three rows at 125 / 110 / 95 px/s. A 4000ms ease-out-quint intro multiplies the speed (1 + 14*(1 - easeOutQuint(t))),
 *    rows are cloned so the loop is seamless, and they can be dragged and thrown (fx/drag-scroller.js).
 *    Speed is 0 under prefers-reduced-motion.
 */
import '../shell.js';
import '../styles/pages.css';
import { icon, ICON_NAMES } from '../fx/icons.js';
import { dragScroller } from '../fx/drag-scroller.js';
import { easeOutQuint, reduced } from '../easing.js';

const GLYPHS = ['2', '0', 'o', 'k', 'a', 'e', 's', 'g', 'b', 'r'];
document.querySelectorAll('.lt').forEach((t) => {
  const g = t.querySelector('.lt-g');
  if (t.dataset.c === 'x') g.innerHTML = '<svg viewBox="0 0 60 80"><path d="M6 6h48v6L36 40l18 28v6H6v-6l18-28L6 12z" fill="currentColor"/></svg>';
  let busy = false;
  t.addEventListener('mouseenter', () => {
    if (busy) return; busy = true; let i = 0;
    const tick = () => {
      g.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      if (++i < (reduced() ? 1 : 6)) setTimeout(tick, 60); else busy = false;
    };
    tick();
  });
});

const NAMES = 'Brand Kit,Launch Week,Q3 Pitch,Field Notes,Ad Variants,Press Room,Moodboards,Contracts,Receipts 2025,Show Reel,Team Offsite,Hiring Plan,Roadmap,Style Tests,Raw Footage,Voiceovers,Packaging,Retro Notes,Customer Calls,Beta Feedback,Pricing Drafts,Icon Sheets,Wall Art,Event Maps,Merch Ideas,Podcast Cuts,Site Audit,Playbooks,Stickers,Old Logos,Weekend Edits,Misc'.split(',');
const COLORS = ['#b4c8e1', '#fad24b', '#3dd3ee', '#b4dc19', '#ffafa5', '#c8aff0', '#f9a34b'];
const stack = document.querySelector('.stack');
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function addCard(first) {
  const el = document.createElement('div');
  el.className = 'fcard';
  const rot = (Math.random() - 0.5) * 8, dx = (Math.random() - 0.5) * 120, dy = (Math.random() - 0.5) * 70;
  el.style.cssText = `--bg:${pick(COLORS)};left:calc(50% - 150px + ${dx}px);top:calc(50% - 50px + ${dy}px);transform:rotate(${rot}deg)`;
  el.innerHTML = `${icon(pick(ICON_NAMES))}<div><b>${pick(NAMES)}</b><span>${1 + Math.floor(Math.random() * 480)} items</span></div>`;
  stack.append(el);
  if (!reduced() && !first) el.animate([{ transform: `translateY(-160px) rotate(${rot - 10}deg) scale(.9)`, opacity: 0 }, { transform: `rotate(${rot}deg)`, opacity: 1 }], { duration: 600, easing: 'cubic-bezier(.2,.9,.2,1)' });
  const cards = stack.querySelectorAll('.fcard:not(.out)');
  if (cards.length > 15) { const old = cards[0]; old.classList.add('out'); old.animate({ opacity: [1, 0] }, { duration: 400 }).finished.then(() => old.remove()); }
}
for (let i = 0; i < 4; i++) addCard(true);
document.querySelector('.new-stack').addEventListener('click', () => addCard(false));

document.querySelectorAll('.mq').forEach((row, ri) => {
  const track = row.querySelector('.mq-track'), speed = reduced() ? 0 : +row.dataset.speed, dir = +row.dataset.dir;
  const set = ICON_NAMES.map((n, i) => `<div class="mq-i" style="--bg:${COLORS[(i + ri * 2) % COLORS.length]}">${icon(ICON_NAMES[(i + ri * 5) % ICON_NAMES.length])}</div>`).join('');
  track.innerHTML = set + set + set;
  let x = 0, setW = 0, t0 = performance.now(), last = t0;
  const drag = dragScroller(row);                 // drag.x is added on top of the automatic drift
  const wrap = (v) => { setW = setW || track.scrollWidth / 3; return ((v % setW) - setW) % setW; };
  (function loop(now) {
    const dt = (now - last) / 1000; last = now;
    if (!row.classList.contains('dragging')) {
      const intro = 1 + 14 * (1 - easeOutQuint(Math.min(1, (now - t0) / 4000)));
      x += dir * speed * intro * dt * (speed ? 1 : 0);
    }
    setW = setW || track.scrollWidth / 3;
    track.style.transform = `translate3d(${wrap(x + drag.x)}px,0,0)`;
    requestAnimationFrame(loop);
  })(performance.now());
});
