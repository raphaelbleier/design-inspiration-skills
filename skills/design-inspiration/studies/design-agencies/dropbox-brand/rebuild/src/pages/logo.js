/*
 * Logo page: a sticky stage with six scroll-snapped states.
 * The original runs a Rive state machine (centered.riv / mobile.riv) driven by hidden #logo-trigger-N clicks and
 * snaps with `scroll-snap-type: y mandatory` while scrollY is between 0.5 and 5 viewports. Here:
 *   - state = the section containing (scrollY + innerHeight/2); it is written to data-state on the stage and a
 *     pure-CSS layer cross-fade (styles/pages.css) plays the "state machine"
 *   - construction guides over the first stage collapse as you leave the opening: scaleX(1 - p) for p = scrollY/(0.5vh)
 *   - the snap type is toggled on <html> only inside the 0.5..5vh range, so the opening and the closing section scroll freely
 */
import '../shell.js';
import '../styles/pages.css';
import { onFrame } from '../fx/scroll.js';
import { clamp, reduced } from '../easing.js';

const wrap = document.getElementById('logo-wrap'), stage = wrap.querySelector('.lg-stage');
const secs = [...wrap.querySelectorAll('.logo-sec')], count = stage.querySelector('.lg-count b');
const guides = stage.querySelectorAll('.gd');
let state = 0;
onFrame(() => {
  const vh = innerHeight, y = scrollY;
  const inRange = y >= vh * 0.5 && y <= vh * 4.4 + 4;
  document.documentElement.classList.toggle('snap-y', inRange && !reduced());
  const mid = y + vh / 2;
  let s = 1;
  secs.forEach((el, i) => { if (mid >= el.offsetTop + wrap.offsetTop) s = i + 1; });
  if (s !== state) { state = s; stage.dataset.state = s; count.textContent = s; }
  const p = clamp(y / (vh * 0.5));
  guides.forEach((g) => g.style.setProperty('--gp', reduced() ? 0 : 1 - p));
  stage.classList.toggle('on', y > 0);
});
