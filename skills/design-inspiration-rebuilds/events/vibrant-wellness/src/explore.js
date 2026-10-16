// Explore mode. Technique: "Start" tweens the camera proxy (view.pos/look) from the hero framing to a wider one
// (1.6s power3.inOut) and swaps panels. Each category carries a local-space hotspot on the body; selecting it
// tweens the camera towards that point and projects the DOM ring onto it every frame. Category names slide
// in a clipped window (yPercent 100 -> 0, .7s expo.out) in the direction of travel.
import gsap from 'gsap';
import * as THREE from 'three';
import { view, onFrame, project, toWorld, state, reduced } from './scene.js';

const CATS = [
  { id: 'neurology', name: 'Neurology', at: [0, 3.15, 0.3], zoom: 3.6, tests: ['Neural Panel', 'Neurotransmitters', 'Sleep Markers'] },
  { id: 'cardiovascular', name: 'Cardiovascular', at: [0.18, 1.95, 0.4], zoom: 4.6, tests: ['Cardio Panel', 'Lipid Profile', 'Inflammation'] },
  { id: 'toxins', name: 'Toxins', at: [-0.28, 1.15, 0.4], zoom: 4.6, tests: ['Toxin Screen', 'Heavy Metals', 'Mould Exposure'] },
  { id: 'gut', name: 'Gut Health', at: [0, 0.7, 0.42], zoom: 4.6, tests: ['Gut Panel', 'Food Sensitivity', 'Microbiome'] },
  { id: 'hormones', name: 'Hormones', at: [0, 2.68, 0.22], zoom: 4.2, tests: ['Hormone Panel', 'Thyroid Set', 'Stress Rhythm'] },
  { id: 'genetics', name: 'Genetics', at: [0, 1.6, 0.4], zoom: 8.2, tests: ['Genetics Suite', 'Nutrition Genes', 'Ancestry Traits'] },
  { id: 'longevity', name: 'Longevity', at: [0, 1.6, 0.4], zoom: 9.6, tests: ['Oxidative Stress', 'Cell Ageing', 'Recovery Index'] },
];
const WIDE = { pos: new THREE.Vector3(0, 0.3, 9.5), look: new THREE.Vector3(0, -1.9, 0) };

let idx = 0, open = false;
const $ = (id) => document.getElementById(id);
const names = $('names'), hot = $('hotspot'), tests = $('tests');

function row(c) {
  const d = document.createElement('div');
  d.innerHTML = `<img src="./img/${c.id}.webp" alt="" width="44" height="44"><span>${c.name}</span>`;
  return d;
}

function show(next, dir) {
  const c = CATS[next], old = names.firstElementChild, el = row(c);
  names.appendChild(el);
  const d = reduced ? 0 : 0.7;
  if (old) gsap.to(old, { yPercent: -110 * dir, duration: d, ease: 'expo.out', onComplete: () => old.remove() });
  gsap.fromTo(el, { yPercent: 110 * dir }, { yPercent: 0, duration: d, ease: 'expo.out' });
  tests.innerHTML = c.tests.map((t) => `<li>${t}</li>`).join('');
  gsap.from(tests.children, { y: 12, autoAlpha: 0, duration: reduced ? 0 : 0.5, stagger: 0.06, ease: 'power2.out' });
  fly(c);
}

function fly(c) {
  const w = toWorld(new THREE.Vector3(...c.at));
  const near = c.zoom < 6, d = reduced ? 0 : 1.4;
  // organ views: camera in front of the point, looking slightly below it so it sits in the upper screen half
  const pos = near ? new THREE.Vector3(w.x * 0.4, w.y + 0.2, c.zoom) : WIDE.pos.clone().setZ(c.zoom + 1.3);
  const look = near ? new THREE.Vector3(w.x, w.y - 0.55, 0) : WIDE.look;
  gsap.to(view.pos, { x: pos.x, y: pos.y, z: pos.z, duration: d, ease: 'power3.inOut', overwrite: true });
  gsap.to(view.look, { x: look.x, y: look.y, z: look.z, duration: d, ease: 'power3.inOut', overwrite: true });
  gsap.to(hot, { autoAlpha: near ? 1 : 0, duration: 0.4 });
}

export function initExplore() {
  const go = (dir) => { idx = (idx + dir + CATS.length) % CATS.length; show(idx, dir); };
  $('next').addEventListener('click', () => go(1));
  $('prev').addEventListener('click', () => go(-1));
  addEventListener('keydown', (e) => { if (!open) return; if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });

  $('start').addEventListener('click', () => {
    open = true;
    const d = reduced ? 0 : 1.6;
    gsap.to('.hero', { autoAlpha: 0, duration: reduced ? 0 : 0.6, ease: 'power2.in' });
    gsap.to(view.pos, { x: WIDE.pos.x, y: WIDE.pos.y, z: WIDE.pos.z, duration: d, ease: 'power3.inOut' });
    gsap.to(view.look, { x: WIDE.look.x, y: WIDE.look.y, z: WIDE.look.z, duration: d, ease: 'power3.inOut' });
    const ex = $('explore'); ex.classList.add('is-open'); ex.setAttribute('aria-hidden', 'false');
    gsap.from('.explore__panel > *', { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: reduced ? 0 : 0.8 });
    gsap.delayedCall(reduced ? 0 : 1.2, () => show(idx, 1));
  });

  const v = new THREE.Vector3();
  onFrame(() => {
    if (!open) return;
    const c = CATS[idx];
    const p = project(v.set(...c.at));
    gsap.set(hot, { x: p.x, y: p.y });
  });
}
