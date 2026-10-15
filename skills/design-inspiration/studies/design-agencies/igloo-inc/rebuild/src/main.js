/**
 * Boot + render loop.
 *
 * TECHNIQUE
 *  - One fullscreen WebGL2 canvas, native scroll disabled (see style.css). Everything is driven
 *    from gsap.ticker (the original emits prerender/render/postrender events from it).
 *  - Adaptive DPR: min(dpr, 1.15) when dpr <= 2, else min(dpr, 1.5).
 *  - Per frame: scroll.update -> locate(y) -> pages render into their own render targets
 *    (page A always; page B too while in a handover) -> transition shader composites to screen.
 *  - Intro (first load): loader fades, introTL plays (~7 s) with scroll locked; the HUD reveals
 *    at 4.5 s. prefers-reduced-motion skips the intro and calms the glitch / snow / particles.
 *  - Breakpoint flags like the original: small = w < 1600 || h < 800, mobile = w < 640 || h < 640
 *    (CSS gutters 125 / 50 / 25 px are set from these in style.css via body classes).
 */
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/orbitron/800.css';
import '@fontsource/orbitron/900.css';
import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { loadTexture, mouseState } from './scene-utils.js';
import { createScroll, locate, tops, TOTAL } from './scroll.js';
import { createTransition } from './transition.js';
import { createIgloo } from './igloo.js';
import { createCubes } from './cubes.js';
import { createEntry } from './entry.js';
import { createHud } from './hud.js';
import { createDetail } from './detail.js';
import { createAudio } from './audio.js';
import { SCENES, TRANSITION, PROJECTS, COLORS } from './config.js';
import { lerpFPS, reducedMotion, clamp } from './eases.js';

import igloo from './assets/img/igloo-assembled.webp';
import iglooEx from './assets/img/igloo-exploded.webp';
import tunnel from './assets/img/tunnel.webp';
import room from './assets/img/room.webp';
import mascot from './assets/img/mascot.webp';
import shard1 from './assets/img/shard1.webp';
import shard2 from './assets/img/shard2.webp';

const canvas = document.getElementById('webgl');
const gl2 = canvas.getContext('webgl2', { antialias: false, powerPreference: 'high-performance' });
if (!gl2) {
  document.getElementById('nogl').hidden = false;
  document.getElementById('loader').remove();
  throw new Error('WebGL2 unavailable');
}

const renderer = new THREE.WebGLRenderer({ canvas, context: gl2, antialias: false });
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.autoClear = true;

const [tAssembled, tExploded, tTunnel, tRoom, tMascot, tShard1, tShard2] = await Promise.all(
  [igloo, iglooEx, tunnel, room, mascot, shard1, shard2].map(loadTexture),
);

const scroll = createScroll();
const transition = createTransition(renderer);
const pages = [
  createIgloo({ assembled: tAssembled, exploded: tExploded }),
  createCubes({ shard1: tShard1, shard2: tShard2 }),
  createEntry({ tunnel: tTunnel, room: tRoom, mascot: tMascot }),
];
const hud = createHud();
const audio = createAudio(document.getElementById('sound'));
const detail = createDetail({
  onOpen: () => { scroll.enabled = false; },
  onClose: () => { scroll.enabled = true; scroll.lastActive = performance.now() / 1000; },
});

let W = 1, H = 1, dpr = 1;
function resize() {
  W = window.innerWidth; H = window.innerHeight;
  const r = window.devicePixelRatio || 1;
  dpr = r <= 2 ? Math.min(r, 1.15) : Math.min(r, 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setSize(W, H, false);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const bw = Math.round(W * dpr), bh = Math.round(H * dpr);
  transition.resize(bw, bh);
  pages.forEach((p) => p.resize(bw, bh));
  const small = W < 1600 || H < 800, mobile = W < 640 || H < 640;
  document.body.classList.toggle('small', small);
  document.body.classList.toggle('mobile', mobile);
}
window.addEventListener('resize', resize);
resize();

// pointer
const tgt = { x: 0, y: 0 };
window.addEventListener('pointermove', (e) => {
  tgt.x = (e.clientX / W) * 2 - 1;
  tgt.y = -((e.clientY / H) * 2 - 1);
});
window.addEventListener('click', (e) => {
  if (detail.isOpen || e.target.closest('#hud a, #hud button')) return;
  const L = locate(scroll.y);
  if (SCENES[L.i].id === 'cubes' && L.tz < 0.15 && scroll.enabled && pages[1].hit(tgt.x, tgt.y)) {
    detail.go(PROJECTS[pages[1].state.project].slug, e.clientX, e.clientY);
  }
});
document.getElementById('callout').addEventListener('click', (e) => {
  detail.go(PROJECTS[pages[1].state.project].slug, e.clientX, e.clientY);
});
document.getElementById('room-ui').addEventListener('click', () => {
  // burst the particles, then ride forward (through the igloo) to the first shard
  pages[2].burst();
  const L = locate(scroll.y);
  const goal = tops[1] + 0.25 * (SCENES[1].height - TRANSITION);
  scroll.to(scroll.y + ((goal - L.w + TOTAL) % TOTAL), 0, true, 5);
});

// intro
const reduce = reducedMotion();
function start() {
  document.getElementById('loader').classList.add('done');
  if (reduce) {
    pages[0].skipIntro(); hud.reveal(); scroll.enabled = true;
  } else {
    const tl = pages[0].playIntro();
    tl.call(() => hud.boot(), null, 1.6);
    tl.call(() => hud.reveal(), null, 4.5);
    tl.call(() => { scroll.enabled = true; scroll.lastActive = performance.now() / 1000; }, null, 7);
  }
  detail.route();
}

let last = performance.now() / 1000;
gsap.ticker.add(() => {
  const now = performance.now() / 1000;
  const dt = Math.min(0.1, Math.max(0.001, now - last));
  last = now;
  const time = now;

  mouseState.x = tgt.x; mouseState.y = tgt.y;
  mouseState.sx = lerpFPS(mouseState.sx, reduce ? 0 : tgt.x, 0.06, dt);
  mouseState.sy = lerpFPS(mouseState.sy, reduce ? 0 : tgt.y, 0.06, dt);

  scroll.update(dt);
  const L = locate(scroll.y);
  const A = pages[L.i];
  A.setProgress(L.p);
  const cub = pages[1];
  cub.pointer(tgt.x, tgt.y, time, SCENES[L.i].id === 'cubes' && L.tz < 0.15 && !detail.isOpen && scroll.enabled);
  document.body.classList.toggle('pointer', cub.state.hover);

  A.render(renderer, transition.rtA, time, mouseState);
  if (L.tz > 0) {
    const B = pages[L.next];
    B.setProgress(0);
    B.render(renderer, transition.rtB, time, mouseState);
  }
  transition.draw(L.tz, scroll.vel, time, reduce);

  hud.update(L, cub.state.project);
  audio.update(L.i, L.p);
});

// test/debug hook for automated captures (jump to a scroll position)
window.__nivo = { scroll, locate, TOTAL, tops, pages, renderer };
// p in 0..1 across the whole loop; holds there (no idle auto-centre) so a capture tool sees the state
window.__scrollTo = (p) => {
  if (scroll.tween) { scroll.tween.kill(); scroll.tween = null; }
  scroll.y = scroll.t1 = scroll.t2 = clamp(p) * TOTAL * 0.97;
  scroll.hold = true;
};

start();
