/*
 * Voice & Tone.
 * "Generate options" is a deliberate fake-AI interaction: pick a surface (Marketing / Website / Product), press the
 * button and an alternative line is streamed in word by word. First word after 400ms, then each following word
 * after 30 + random*150 ms; the button gets a .loading class (spinner) until the last word lands.
 */
import '../shell.js';
import '../styles/pages.css';
import { inView } from '../fx/scroll.js';
import { reduced } from '../easing.js';

const COPY = {
  marketing: {
    tag: 'Copy Chief',
    lines: ['Everything you made, right where you left it.', 'Your best work deserves a better home than a folder named final-final.', 'Find it fast. Share it faster. Get back to making.', 'One place for the messy middle and the finished thing.', 'Less hunting, more making. That is the whole pitch.'],
  },
  website: {
    tag: 'Brand Lead',
    lines: ['Start free, upgrade when your stack outgrows the shelf.', 'Plans that grow with the team, not ahead of it.', 'Bring your files. We will bring the room to keep them in.', 'Pricing without the fine print scavenger hunt.', 'Pick a plan. Change your mind anytime. We will not sulk.'],
  },
  product: {
    tag: 'Design Ops',
    lines: ['Something went wrong on our side. Try again in a minute.', 'That file is too big for now. Compress it or split it up.', 'Nothing here yet. Drop a file to get started.', 'Saved. You can close this tab whenever you like.', 'Link copied. Anyone with it can view.'],
  },
};
const line = document.querySelector('.vt3-line'), tag = document.querySelector('.vt3-tag'), gen = document.querySelector('.gen');
const seg = [...document.querySelectorAll('.sg')];
let key = 'marketing', idx = 0, run = 0;
const show = (text) => { line.textContent = text; };
function select(k) {
  key = k; idx = 0; run++; gen.classList.remove('loading');
  seg.forEach((s) => s.classList.toggle('on', s.dataset.k === k));
  show(COPY[k].lines[0]); tag.textContent = COPY[k].tag;
}
seg.forEach((s) => s.addEventListener('click', () => select(s.dataset.k)));
select('marketing');
gen.addEventListener('click', () => {
  const my = ++run, lines = COPY[key].lines; idx = (idx + 1) % lines.length;
  const words = lines[idx].split(' ');
  if (reduced()) { show(lines[idx]); return; }
  gen.classList.add('loading'); show('');
  let i = 0;
  const next = () => {
    if (my !== run) return;
    line.textContent = words.slice(0, ++i).join(' ');
    if (i < words.length) setTimeout(next, 30 + Math.random() * 150); else gen.classList.remove('loading');
  };
  setTimeout(next, 400);
});
document.querySelectorAll('.qt').forEach((q, i) => inView(q, () => setTimeout(() => q.classList.add('in'), i * 120), '0px 0px -10% 0px'));
