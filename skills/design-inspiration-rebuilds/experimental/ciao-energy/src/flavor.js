/* Syncs the page to the active flavour: background colours (CSS vars tweened .8s power2.out),
 * rim-light colour, name swap (chars slide out up .3s, new chars rise from 110% .7s power3.out, stagger .025),
 * description fade, counter. */
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import * as THREE from 'three';
import { FLAVORS } from './flavors.js';
import { onIndex } from './carousel.js';
import { tintLight } from './scene.js';

gsap.registerPlugin(SplitText);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const names = [...document.querySelectorAll('.js-name')];
const desc = document.querySelector('.js-desc');
const count = document.querySelector('.js-count');
const splits = new Map();

function setName(el, text, first) {
  const old = splits.get(el);
  const put = () => {
    old?.revert();
    el.textContent = text;
    if (REDUCED) return;
    const sp = SplitText.create(el, { type: 'words,chars', mask: 'chars' });
    splits.set(el, sp);
    if (!first) gsap.from(sp.chars, { yPercent: 110, duration: 0.7, ease: 'power3.out', stagger: 0.025 });
  };
  if (old && !REDUCED) gsap.to(old.chars, { yPercent: -110, duration: 0.3, ease: 'power2.in', stagger: 0.015, onComplete: put });
  else put();
}

function apply(i, first) {
  const f = FLAVORS[i];
  gsap.to(document.documentElement, { '--p': f.p, '--s': f.s, duration: first ? 0 : 0.8, ease: 'power2.out' });
  gsap.to(tintLight.color, { ...new THREE.Color(f.s), duration: first ? 0 : 0.8 });
  names.forEach((n) => setName(n, f.name, first));
  gsap.fromTo(desc, { opacity: 0 }, { opacity: 1, duration: 0.6 });
  desc.textContent = f.desc;
  count.textContent = `0${i + 1} / 0${FLAVORS.length}`;
}

export function initFlavor() {
  apply(0, true);
  onIndex((i) => apply(i, false));
}
