/*
 * "Partner Info" outro panel + the credits cursor-tag burst.
 * Desktop: panel slides in from the left (translateX(-100%) -> 0, 0.7s cubic-bezier(.6,0,0,1)) leaving a 60px strip
 * of the page visible at the right. Mobile (<=991): a bottom sheet of 65vh + 48px.
 * Credits row: on mouseenter 10 cursor tags are laid out in a 5x2 grid inside 10% margins with a random
 * offset, and fly in from up to 200px away: transform/opacity 0.4s cubic-bezier(.15,.5,.05,1), delay 0-250ms random.
 */
import { cursorTag } from './cursor-tags.js';
import { BRAND } from '../data.js';

const PEOPLE = [
  ['Brand Lead', 'BL', 'blue'], ['Motion Lead', 'ML', 'purple'], ['Copy Chief', 'CC', 'yellow'], ['Art Director', 'AD', 'orange'],
  ['Type Designer', 'TD', 'green'], ['Producer', 'PR', 'cyan'], ['Design Ops', 'DO', 'pink'], ['Sound Designer', 'SD', 'red'],
  ['Illustrator', 'IL', 'purple'], ['Strategist', 'ST', 'blue'],
];

export function buildOutro() {
  const el = document.createElement('aside');
  el.className = 'outro'; el.setAttribute('aria-label', 'Partner info'); el.inert = true;
  el.innerHTML = `
    <button class="outro-close" aria-label="Close partner info"><span></span><span></span></button>
    <div class="outro-wrap">
      <h2 class="outro-quote">&ldquo;Good identity is built from the small decisions nobody notices until they are missing.&rdquo;</h2>
      <p class="outro-by">Maren Okafor-Lindt, Head of Craft</p>
      <div class="outro-cols">
        <p>These guidelines are a working tool, not a monument. They change when the product changes, and they are built to be borrowed from, bent and argued with.</p>
        <p>Partnering with us on a campaign, a launch or a co-branded surface? Start with the essentials below, then talk to the team before you design anything.</p>
        <ul class="outro-links">
          <li><a href="#" onclick="return false">Download the asset kit<i>&nearr;</i></a></li>
          <li><a href="#" onclick="return false">Co-branding checklist<i>&nearr;</i></a></li>
          <li><a href="#" onclick="return false">Request a review<i>&nearr;</i></a></li>
        </ul>
      </div>
      <div class="outro-credits"><span>${BRAND} Brand Studio</span><b aria-hidden="true">&times;</b><span>Dawnline Studio</span><div class="ct-field"></div></div>
    </div>`;
  document.body.append(el);
  const field = el.querySelector('.ct-field'), credits = el.querySelector('.outro-credits');
  const tags = PEOPLE.map(([name, initials, id], i) => {
    const t = cursorTag({ name, initials, id, right: i % 3 === 1 });
    t.classList.add('initial'); field.append(t); return t;
  });
  const place = () => {
    const r = el.getBoundingClientRect(), W = r.width * .8, H = r.height * .8;
    tags.forEach((t, i) => {
      const cx = (i % 5 + .5) / 5, cy = (Math.floor(i / 5) + .5) / 2;
      const x = r.width * .1 + cx * W - 60 + (Math.random() - .5) * 90, y = r.height * .1 + cy * H - 20 + (Math.random() - .5) * 60;
      t.style.setProperty('--x', x + 'px'); t.style.setProperty('--y', y + 'px');
      t.style.setProperty('--fx', (Math.random() - .5) * 400 + 'px'); t.style.setProperty('--fy', (Math.random() - .5) * 400 + 'px');
      t.style.transitionDelay = Math.random() * 250 + 'ms';
    });
  };
  credits.addEventListener('mouseenter', () => { place(); tags.forEach((t) => t.classList.remove('initial')); });
  credits.addEventListener('mouseleave', () => tags.forEach((t) => t.classList.add('initial')));
  return el;
}
