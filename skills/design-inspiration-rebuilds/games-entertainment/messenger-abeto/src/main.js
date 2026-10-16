/**
 * Orchestrator: loader -> intro -> BEGIN -> transition -> game. One renderer, one scene, one ink pipeline.
 *
 * INTRO play-in timeline (seconds, from the original's introScene.playInAnimation):
 *   0.2  planet y -80 -> 0 (2.25s inOut1) | scale 0.3 -> 1 (6.3s inOut3) | x-rot -pi -> 0 (2s inOut1)
 *   0.35 planet y-rot -1.15pi -> 0.12 (5.65s inOut3)
 *   1.45 atmosphere blob grows | 2.2 particles fade in | 2.35 title letters pop (elastic, 0.08s apart)
 *   3.3  BEGIN: scale elastic.out(1,0.9) 3.25s + x-rot from -180deg elastic.out(1,0.5) | 3.0 interaction unlocked
 * TRANSITION (switchToPresent), t = 0 at click:
 *   0 button spins -360deg (1.5s inOut1) | auto-rotate -> 0 (1s power2.inOut)
 *   0 camera theta -> -pi/4 and phi -> 1.7 (2.5s 'tweaked') | 0.4 radius -> game distance (2.75s inOut1) | 0 roll -> -pi/4 (3.35s)
 *   1.0 uFlash -> 1 (1s) | 0.85 diagonal white wipe #2 0 -> 1 (1.15s power2.inOut) | 1.5 loader shows
 *   2.3 game scene swaps in under full white; flash -> 0 (1s) and wipe #1 slope 0.3, 1 -> 0 (2s inOut1)
 */
import '@fontsource/silkscreen/400.css';
import '@fontsource/gaegu/400.css';
import '@fontsource/gaegu/700.css';
import '@fontsource/rem/500.css';
import './style.css';
import * as THREE from 'three';
import { gsap, REDUCED } from './ease.js';
import { loader } from './loader.js';
import { InkPipeline } from './outline.js';
import { buildPlanet, R, BIOMES } from './planet.js';
import { buildTitle, BLOCK_W, BLOCK_H } from './title.js';
import { createGame } from './game.js';
import { dialogue } from './dialogue.js';
import { createHud, EMOJI } from './hud.js';
import { boil, pop, wobblePoly } from './stepped.js';
import { startAudio, sfx } from './audio.js';

const $ = (s) => document.querySelector(s);
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
let dpr = devicePixelRatio <= 2 ? Math.min(devicePixelRatio, 1.15) : Math.min(devicePixelRatio, 1.5);
const pipe = new InkPipeline(renderer);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(20, 1, 0.5, 1200);
scene.add(camera);
const sun = new THREE.DirectionalLight('#fff6e6', 2.2); sun.position.set(-4, 6, 5); sun.target.position.set(0, 0, -10);
camera.add(sun, sun.target); scene.add(new THREE.AmbientLight('#dff3f1', 1.6));

const planet = buildPlanet();
const world = new THREE.Group(), spin = new THREE.Group();
world.add(spin); spin.add(planet.group); scene.add(world);
const title = buildTitle(planet.toon); camera.add(title.root);
const pts = new Float32Array(240); for (let i = 0; i < 240; i += 3) { const r = 55 + Math.random() * 70, a = Math.random() * 6.28, b = Math.acos(2 * Math.random() - 1); pts.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)], i); }
const particles = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pts, 3)), new THREE.PointsMaterial({ color: '#e6fbf6', size: 0.55, transparent: true, opacity: 0 }));
particles.userData.noInk = true; world.add(particles);
const game = createGame({ scene, camera, toon: planet.toon, obstacles: planet.obstacles });
game.me.group.visible = false; game.npcs.forEach((n) => (n.c.group.visible = false));

// ---- state ------------------------------------------------------------------------------------------------
let mode = 'intro', interactive = false, started = false, introD = 300;
const orbit = { auto: REDUCED ? 0 : 0.2, theta: 0, phi: Math.PI / 2, r: 300, roll: 0 };
const mouse = new THREE.Vector2(), ray = new THREE.Raycaster();
let hoverLetter = -1, planetPx = 600;

const hud = createHud({
  onOutfitToggle: (v) => { game.front = v; },
  onEmoji: (i) => emote(i),
  onJoyVisible: (v) => { $('#joy').hidden = !(v && (matchMedia('(pointer: coarse)').matches || innerWidth < 700)); },
});
hud.character = game.me;

// ---- layout ----------------------------------------------------------------------------------------------
function layout() {
  const W = innerWidth, H = innerHeight;
  renderer.setPixelRatio(dpr); renderer.setSize(W, H, false); pipe.setSize(W, H, dpr);
  camera.aspect = W / H;
  if (mode === 'intro') {
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const blockPx = Math.min(0.54 * H, (0.9 * W) / (BLOCK_W / BLOCK_H));
    planetPx = blockPx * 1.33;
    introD = ((2 * (R + 3) * H) / planetPx) / (2 * tan);
    if (!started) orbit.r = introD;
    const Dl = introD * 0.8;
    title.root.position.set(0, 0, -Dl);
    title.root.scale.setScalar(((blockPx / H) * 2 * Dl * tan) / BLOCK_H);
    camera.setViewOffset(W, H, 0, 0.06 * H, W, H);
    const u = pipe.u; u.uAtmoC.value.set(0.5, 0.56); u.uAtmoR.value = (planetPx / 2 / H) * 1.22;
  } else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}
addEventListener('resize', layout);
function skyIntro() { const u = pipe.u; u.uSkyA.value.set('#62BEBB'); u.uSkyB.value.set('#68c6c0'); u.uSkyC.value.set('#70cdc3'); }
function skyGame() { const u = pipe.u; u.uSkyA.value.set('#90E3D6'); u.uSkyB.value.set('#6ec7c3'); u.uSkyC.value.set('#58b4b6'); u.uAtmo.value = 0; }
skyIntro();

// ---- BEGIN button ----------------------------------------------------------------------------------------
const bBtn = $('#begin'), btn = bBtn.querySelector('.btn'), btnText = bBtn.querySelector('b'), btnShape = bBtn.querySelector('.shape');
const seedBtn = () => { btnShape.style.clipPath = wobblePoly(2.2); };
seedBtn(); setInterval(() => !REDUCED && seedBtn(), 140);
bBtn.addEventListener('pointerenter', () => { if (!interactive) return; bBtn.classList.add('flash'); seedBtn(); sfx.hover(); setTimeout(() => bBtn.classList.remove('flash'), 70); });
bBtn.addEventListener('pointerdown', () => interactive && gsap.to(btn, { scale: 0.95, duration: 0.02, ease: 'none' }));
addEventListener('pointerup', () => gsap.to(btn, { scale: 1, duration: 0.02, ease: 'none' }));
bBtn.addEventListener('wheel', (e) => {
  if (!interactive) return; e.preventDefault();
  gsap.to(btn, { rotationX: e.deltaY > 0 ? '-=90' : '+=90', duration: 1.5, ease: 'elastic.out(1, 0.9)', overwrite: 'auto' });
  btnText.classList.add('off'); gsap.delayedCall(0.19, () => btnText.classList.remove('off'));
}, { passive: false });
bBtn.addEventListener('click', () => interactive && begin());

// ---- diagonal wipes (clip-path), slope in % of viewport width ---------------------------------------------
const wipe = (el, p, S, fromRight) => {
  const top = p * (100 + S) - S, bot = p * (100 + S);
  el.style.clipPath = fromRight ? `polygon(${100 - top}% 0,100% 0,100% 100%,${100 - bot}% 100%)` : `polygon(0 0,${top}% 0,${bot}% 100%,0 100%)`;
};
const w1 = { p: 0 }, w2 = { p: 0 };
const wipe1 = $('#wipe1'), wipe2 = $('#wipe2');

// ---- intro play-in ---------------------------------------------------------------------------------------
function playIn() {
  world.position.y = -80; world.scale.setScalar(0.3); world.rotation.set(-Math.PI, 0.35 * Math.PI - 1.5 * Math.PI, 0);
  title.letters.forEach((l) => l.scale.setScalar(0.0001));
  const tl = gsap.timeline({ delay: 0.1 });
  tl.to(world.position, { y: 0, duration: 2.25, ease: 'inOut1' }, 0.2)
    .to(world.scale, { x: 1, y: 1, z: 1, duration: 6.3, ease: 'inOut3' }, 0.2)
    .to(world.rotation, { y: 0.12, duration: 5.65, ease: 'inOut3' }, 0.35)
    .to(world.rotation, { x: 0, duration: 2, ease: 'inOut1' }, 0.2)
    .to(pipe.u.uAtmo, { value: 1, duration: 0.01 }, 1.45)
    .to(particles.material, { opacity: 1, duration: 1.2, ease: 'none' }, 2.2)
    .call(() => sfx.whoosh(), null, 0.16);
  title.letters.forEach((l, i) => tl.to(l.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'elastic.out(1, 0.6)' }, 2.35 + i * 0.08));
  bBtn.hidden = false;
  tl.fromTo(btn, { scale: 0 }, { scale: 1, duration: 3.25, ease: 'elastic.out(1, 0.9)' }, 3.3)
    .fromTo(btn, { rotationX: -180 }, { rotationX: 0, duration: 3.25, ease: 'elastic.out(1, 0.5)' }, 3.3)
    .call(() => { interactive = true; }, null, 3.0);
  gsap.set(btn, { scale: 0 });
}

// ---- BEGIN -> game ---------------------------------------------------------------------------------------
function begin() {
  if (started) return; started = true; interactive = false; startAudio(); sfx.click(); sfx.whoosh();
  const gameR = R * 2.4, tl = gsap.timeline();
  tl.to(btn, { rotationX: '-=360', duration: 1.5, ease: 'inOut1', overwrite: 'auto' }, 0)
    .to(orbit, { auto: 0, duration: 1, ease: 'power2.inOut' }, 0)
    .to(orbit, { theta: -Math.PI / 4, phi: 1.7, duration: 2.5, ease: 'tweaked' }, 0)
    .to(orbit, { r: gameR, duration: 2.75, ease: 'inOut1' }, 0.4)
    .to(orbit, { roll: -Math.PI / 4, duration: 3.35, ease: 'inOut1' }, 0)
    .to(title.block.scale, { x: 0.0001, y: 0.0001, z: 0.0001, duration: 0.6, ease: 'power2.in' }, 0.2)
    .to(pipe.u.uFlash, { value: 1, duration: 1, ease: 'power2.inOut' }, 1)
    .to(w2, { p: 1, duration: 1.15, ease: 'power2.inOut', onUpdate: () => wipe(wipe2, w2.p, 30, false) }, 0.85)
    .call(() => loader.show(), null, 1.5)
    .call(enterGame, null, 2.3)
    .to(pipe.u.uFlash, { value: 0, duration: 1, ease: 'power2.inOut' }, 2.3)
    .fromTo(w1, { p: 1 }, { p: 0, duration: 2, ease: 'inOut1', immediateRender: false, onUpdate: () => wipe(wipe1, w1.p, 30, true) }, 2.3)
    .call(() => { loader.hide(); wipe2.style.clipPath = 'polygon(0 0,0 0,0 0,0 0)'; }, null, 2.7)
    .call(intro, null, 4.4);
  wipe(wipe1, 1, 30, true);
}
function enterGame() {
  mode = 'game';
  gsap.killTweensOf([world.position, world.scale, world.rotation]);
  world.position.set(0, 0, 0); world.scale.setScalar(1); world.rotation.set(0, 0, 0); spin.rotation.set(0, 0, 0);
  title.root.visible = false; particles.visible = false; bBtn.hidden = true;
  camera.fov = 62; camera.near = 0.1; camera.far = 500; camera.roll = 0; layout(); skyGame();
  game.me.group.visible = true; game.npcs.forEach((n) => (n.c.group.visible = true));
  game.locked = true; game.start();
}
async function intro() {
  await dialogue.say(['Oh no... the bell already rang twice. The parcels will not deliver themselves.', 'Five stops on my list today. Hilltop houses first, then the harbor, then who knows.', 'Walk with WASD or the arrow keys. Space jumps, Shift hurries, E talks.']);
  game.locked = false; hud.show(true);
}
async function talk(n) {
  game.locked = true; $('#npc-bubble').hidden = true;
  await dialogue.say(n.lines, n.name); hud.progress(n.quest); game.locked = false;
}
addEventListener('keydown', (e) => {
  if (e.defaultPrevented || mode !== 'game' || dialogue.open || hud.overlay) return;
  if ((e.key === 'e' || e.key === 'E') && game.nearNpc) talk(game.nearNpc);
});
$('#npc-bubble').addEventListener('pointerdown', (e) => { e.stopPropagation(); if (game.nearNpc && !dialogue.open) talk(game.nearNpc); });

// ---- game extras: banner, emote, tags --------------------------------------------------------------------
const banner = $('#banner'); boil(banner, 1.4); let bannerT;
game.onBiome = (b) => {
  if (mode !== 'game') return; banner.querySelector('span').textContent = b.name; banner.hidden = false; pop(banner, true);
  clearTimeout(bannerT); bannerT = setTimeout(() => pop(banner, false, () => (banner.hidden = true)), 2600);
};
const emoteEl = $('#emote'); let emoteT;
function emote(i) { emoteEl.innerHTML = EMOJI[i]; emoteEl.hidden = false; pop(emoteEl, true); clearTimeout(emoteT); emoteT = setTimeout(() => pop(emoteEl, false, () => (emoteEl.hidden = true)), 2200); }
const tag = document.createElement('div'); tag.className = 'tag'; tag.textContent = 'you'; tag.hidden = true; document.body.append(tag);

// ---- pointer parallax + title hover ----------------------------------------------------------------------
addEventListener('pointermove', (e) => { mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });

// ---- frame loop ------------------------------------------------------------------------------------------
let slow = 0, lastBoil = 0;
gsap.ticker.add((time, dtms) => {
  const dt = Math.min(dtms / 1000, 0.05);
  if (mode === 'intro') {
    spin.rotation.y += orbit.auto * dt;
    const sp = Math.sin(orbit.phi), c = camera.position;
    c.set(sp * Math.sin(orbit.theta), Math.cos(orbit.phi), sp * Math.cos(orbit.theta)).multiplyScalar(orbit.r);
    camera.up.set(0, 1, 0); camera.lookAt(0, 0, 0); camera.rotateZ(orbit.roll);
    title.block.rotation.set(0.1 - mouse.y * 0.03, -0.17 + mouse.x * 0.03, 0);
    if (!REDUCED && time - lastBoil > 0.14) { lastBoil = time; title.letters.forEach((l) => { l.rotation.z = (Math.random() - 0.5) * 0.012; l.userData.j = (Math.random() - 0.5) * 0.12; l.position.x = l.userData.home.x + l.userData.j; }); }
    if (interactive) {
      ray.setFromCamera(mouse, camera); title.root.updateMatrixWorld(true);
      const hit = ray.intersectObjects(title.letters, false)[0], idx = hit ? title.letters.indexOf(hit.object) : -1;
      if (idx !== hoverLetter) {
        if (hoverLetter >= 0) gsap.to(title.letters[hoverLetter].position, { z: 0, duration: 0.07, ease: 'none', overwrite: 'auto' });
        if (idx >= 0) { gsap.to(title.letters[idx].position, { z: 1.6, duration: 0.07, ease: 'none', overwrite: 'auto' }); sfx.hover(); }
        hoverLetter = idx;
      }
    }
    particles.rotation.y += dt * 0.01;
  } else {
    game.update(dt, time);
    const st = game.state; pipe.u.uCloudOff.value.set(Math.atan2(st.f.x, st.f.z) * 0.18, st.p.y * 0.5);
    const near = game.nearNpc, nb = $('#npc-bubble');
    if (near && !dialogue.open && !game.locked) { const p = game.project(game.headWorld(near.c.group, 2.6)); nb.hidden = false; nb.style.left = p.x + 'px'; nb.style.top = p.y + 'px'; } else nb.hidden = true;
    const hp = game.project(game.headWorld(game.me.group, 2.55));
    if (!emoteEl.hidden) { emoteEl.style.left = hp.x + 'px'; emoteEl.style.top = hp.y + 'px'; }
    tag.hidden = game.locked || hud.overlay === 'outfit'; tag.style.left = hp.x + 'px'; tag.style.top = hp.y - 4 + 'px';
  }
  pipe.render(scene, camera, time);
  // adaptive DPR: drop 0.15 when frames stay slow, floor 0.8
  slow = dtms > 26 ? slow + 1 : Math.max(0, slow - 1);
  if (slow > 40 && dpr > 0.8) { dpr = Math.max(0.8, dpr - 0.15); slow = 0; layout(); }
});

layout();
loader.show(true);
requestAnimationFrame(() => { gsap.delayedCall(0.9, () => { loader.hide(); playIn(); }); });
window.__ready = true;
