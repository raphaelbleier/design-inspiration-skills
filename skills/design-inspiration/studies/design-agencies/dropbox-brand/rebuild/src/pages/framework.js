/*
 * Framework page.
 *  - opening: Canvas 2D whiteboard (fx/whiteboard.js)
 *  - strat-1: 200vh tall section with a sticky stage. ease = progress^2 drives 8 photo cards (translate in vw/dvh + rotate)
 *             and two cursor tags; a hand-drawn ellipse is drawn with stroke-dashoffset 500 -> 0 (pathLength=500)
 *  - strat-2: file tiles fade in with a 50ms stagger once the grid scrolls into view
 *  - tabs:    autoplaying carousel (4000ms per slide, starts on first visibility); .selected/.deselected cross-fade
 */
import '../shell.js';
import '../styles/pages.css';
import { onFrame, stickyProgress, inView } from '../fx/scroll.js';
import { initWhiteboard } from '../fx/whiteboard.js';
import { cursorTag } from '../fx/cursor-tags.js';
import { reduced } from '../easing.js';

initWhiteboard(document.querySelector('.opening'));

/* strat-1 */
const stage = document.getElementById('strat-1');
// [x vw, y dvh at progress 0, y dvh at progress 1, rotation a, rotation b]  rot = a + b*ease
const CARDS = [
  [-30, 60, 28, 3, 15], [-10, 60, 32, -6, 10], [35, 60, 26, -10, -10], [10, 60, 34, 6.1, -10],
  [30, -90, -30, 18, 10], [10, -100, -40, -3, 10], [-10, -95, -35, 1, -10], [-30, -90, -30, -8.2, -10],
];
const cards = [...stage.querySelectorAll('.pc')];
const tagA = cursorTag({ name: 'Brand Lead', initials: 'BL', id: 'blue' }), tagB = cursorTag({ name: 'Copy Chief', initials: 'CC', id: 'yellow', right: true });
stage.querySelector('.ct-slot.a').append(tagA); stage.querySelector('.ct-slot.b').append(tagB);
const circ = stage.querySelector('.circled');
onFrame(() => {
  const p = reduced() ? 1 : stickyProgress(stage), e = p * p;
  cards.forEach((c, i) => {
    const [x, y0, y1, ra, rb] = CARDS[i];
    c.style.transform = `translate(calc(${x}vw - 50%), calc(${y0 + (y1 - y0) * e}dvh - 50%)) rotate(${ra + rb * e}deg)`;
  });
  tagA.style.transform = `translate(${-30 * e}vw, ${30 * e}dvh)`; tagB.style.transform = `translate(${10 * e}vw, ${-50 * e}dvh)`;
  circ.classList.toggle('drawn', p > 0.12);
});

/* strat-2 */
const files = [...document.querySelectorAll('.file')];
inView(document.querySelector('.files'), () => files.forEach((f, i) => setTimeout(() => f.classList.add('in'), reduced() ? 0 : i * 50)));

/* tabs carousel */
const tabs = [...document.querySelectorAll('.tb')], slides = [...document.querySelectorAll('.slide')];
let cur = 0, timer;
function select(i) {
  slides[cur].classList.replace('selected', 'deselected'); tabs[cur].classList.remove('selected');
  const old = cur; setTimeout(() => slides[old].classList.remove('deselected'), 600);
  cur = i; slides[i].classList.add('selected'); tabs[i].classList.add('selected');
  tabs.forEach((t) => t.style.removeProperty('--run')); tabs[i].style.setProperty('--run', 1);
}
const play = () => { clearTimeout(timer); if (!reduced()) timer = setTimeout(() => { select((cur + 1) % 3); play(); }, 4000); };
tabs.forEach((t, i) => t.addEventListener('click', () => { select(i); play(); }));
inView(document.getElementById('tabs'), () => { tabs[0].style.setProperty('--run', 1); play(); }, '0px 0px -30% 0px');
