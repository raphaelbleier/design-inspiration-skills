/**
 * Game scene: third-person follow camera on the spherical planet.
 *
 * Movement on a sphere without any physics engine (the original uses a custom capsule on a worker):
 *   state = { p: unit position vector, f: unit forward tangent }
 *   step(s):  a = s / radius;  p' = p cos a + f sin a;  f' = f cos a - p sin a   (parallel transport), then re-orthonormalise.
 *   turning rotates f around p. Terrain height = groundR(dir) (same function that built the mesh); the sea (h < 0) and
 *   circular prop obstacles block movement. Jump: vy 5.5, gravity 14.
 * Controls: W/S or Up/Down walk, A/D or Left/Right turn (mouse-drag turns too), Shift sprint x1.3, Space jump,
 * E / Space talk. Touch: virtual stick, 75px radius, left 20 / bottom 25.
 * Camera: default relativeCameraPosition (0, 2, 5.75) behind the character, look-at offset (0, 1, 0.5),
 * exponential smoothing (1 - exp(-6 dt)); the outfit editor swaps to a front view (0, 1.0, -3.9).
 */
import * as THREE from 'three';
import { groundR, heightAt, R, SEA, BIOMES, biomeIndex } from './planet.js';
import { makeCharacter } from './character.js';
import { sfx } from './audio.js';

const T1 = new THREE.Vector3(), T2 = new THREE.Vector3();
function stepOnSphere(s, dist) {
  const a = dist / R, c = Math.cos(a), sn = Math.sin(a);
  T1.copy(s.p).multiplyScalar(c).addScaledVector(s.f, sn);
  T2.copy(s.f).multiplyScalar(c).addScaledVector(s.p, -sn);
  s.p.copy(T1).normalize(); s.f.copy(T2).addScaledVector(s.p, -T2.dot(s.p)).normalize();
}

export function createGame({ scene, camera, toon, obstacles }) {
  const keys = new Set(), joy = { x: 0, y: 0 }, drag = { on: false, x: 0, dx: 0 };
  const me = makeCharacter(toon); scene.add(me.group);
  const s = { p: new THREE.Vector3(0, 0, 1), f: new THREE.Vector3(1, 0, 0), y: 0, vy: 0, walk: 0, t: 0 };
  const npcs = [];
  const spawnNpc = (along, side, pick, name, lines, quest) => {
    const st = { p: s.p.clone(), f: s.f.clone() };
    stepOnSphere(st, along); st.f.applyAxisAngle(st.p, Math.PI / 2); stepOnSphere(st, side); st.f.applyAxisAngle(st.p, -Math.PI * 0.6);
    const c = makeCharacter(toon, pick); scene.add(c.group);
    npcs.push({ c, st, name, lines, quest, y: Math.max(heightAt(st.p), SEA) });
  };
  spawnNpc(9, 3.4, { hair: 1, top: 1, skirt: 3, shoes: 3 }, 'Dockhand', ['You look lost, courier. The harbor road goes on past the old stairs.', 'Take this parcel for the clerk behind the crates. He is shy.'], 0);
  spawnNpc(-12, -3.6, { hair: 2, top: 3, skirt: 1, shoes: 2 }, 'Clerk', ['Shh. Did anyone follow you? Never mind. The letter is for the lighthouse.'], 1);
  spawnNpc(20, 3, { hair: 4, top: 2, skirt: 4, shoes: 1 }, 'Chemist', ['Two boxes, same label. One hums. Please deliver the quiet one.'], 2);
  const frame = new THREE.Matrix4(), cam = { pos: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0), look: new THREE.Vector3() };
  const rel = { back: 5.75, up: 2, look: 1 }, relT = { back: 5.75, up: 2, look: 1 };
  let locked = false, front = false, biome = -1, onBiome = () => {}, nearNpc = null;

  function orient(group, p, f, lift) {
    const right = new THREE.Vector3().crossVectors(p, f).normalize();
    frame.makeBasis(right, p, f); group.quaternion.setFromRotationMatrix(frame);
    group.position.copy(p).multiplyScalar(groundR(p) + lift);
  }
  const blocked = (p) => heightAt(p) < SEA - 0.05 || obstacles.some((o) => o.d.angleTo(p) * R < o.r + 0.45);

  addEventListener('keydown', (e) => { keys.add(e.key.toLowerCase()); if (e.key === ' ' && !locked && !e.repeat && s.y < 0.05) { s.vy = 5.5; sfx.jump(); } });
  addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  addEventListener('blur', () => keys.clear());
  const cv = document.getElementById('gl');
  cv.addEventListener('pointerdown', (e) => { drag.on = true; drag.x = e.clientX; });
  addEventListener('pointermove', (e) => { if (drag.on) { drag.dx += e.clientX - drag.x; drag.x = e.clientX; } });
  addEventListener('pointerup', () => (drag.on = false));

  // virtual stick
  const joyEl = document.getElementById('joy'), knob = joyEl.querySelector('i');
  const jmove = (e) => { const r = joyEl.getBoundingClientRect(); let dx = e.clientX - (r.left + 75), dy = e.clientY - (r.top + 75); const l = Math.hypot(dx, dy); if (l > 75) { dx *= 75 / l; dy *= 75 / l; } joy.x = dx / 75; joy.y = -dy / 75; knob.style.transform = `translate(${dx}px,${dy}px)`; };
  joyEl.addEventListener('pointerdown', (e) => { joyEl.setPointerCapture(e.pointerId); jmove(e); e.stopPropagation(); });
  joyEl.addEventListener('pointermove', (e) => { if (joyEl.hasPointerCapture(e.pointerId)) jmove(e); });
  const jend = () => { joy.x = joy.y = 0; knob.style.transform = ''; };
  joyEl.addEventListener('pointerup', jend); joyEl.addEventListener('pointercancel', jend);

  const api = {
    me, npcs, state: s,
    set locked(v) { locked = v; }, get locked() { return locked; },
    set front(v) { front = v; Object.assign(relT, v ? { back: -3.9, up: 1.0, look: 0.95 } : { back: 5.75, up: 2, look: 1 }); },
    set onBiome(fn) { onBiome = fn; },
    get nearNpc() { return nearNpc; },
    /** snap camera + place the player (called when the game scene starts) */
    start() { orient(me.group, s.p, s.f, 0); this.update(0.016, 0, true); },
    update(dt, time, snap) {
      s.t += dt;
      const k = (n) => keys.has(n);
      const allowed = !locked && !front;
      const turn = allowed ? ((k('a') || k('arrowleft') ? 1 : 0) - (k('d') || k('arrowright') ? 1 : 0)) - joy.x : 0;
      if (allowed) s.f.applyAxisAngle(s.p, -drag.dx * 0.006);
      drag.dx = 0;
      const fwd = allowed ? ((k('w') || k('arrowup') ? 1 : 0) - (k('s') || k('arrowdown') ? 0.5 : 0)) + joy.y : 0;
      const sprint = k('shift') ? 1.3 : 1;
      s.f.applyAxisAngle(s.p, turn * 2.1 * dt);
      const dist = fwd * 5 * sprint * dt;
      if (dist) { const keep = { p: s.p.clone(), f: s.f.clone() }; stepOnSphere(s, dist); if (blocked(s.p)) { s.p.copy(keep.p); s.f.copy(keep.f); } }
      s.vy -= 14 * dt; s.y = Math.max(0, s.y + s.vy * dt); if (s.y === 0) s.vy = 0;
      const speed = Math.abs(fwd) * sprint;
      me.animate(s.t, speed, s.y > 0.05);
      orient(me.group, s.p, s.f, s.y);
      npcs.forEach((n) => { orient(n.c.group, n.st.p, n.st.f, 0); n.c.animate(s.t * 0.3, 0, false); n.c.head.rotation.y = Math.sin(s.t * 0.8 + n.st.p.x) * 0.25; });

      // nearest NPC in talking range
      nearNpc = locked ? null : npcs.find((n) => n.st.p.angleTo(s.p) * R < 3.4) || null;
      const bi = biomeIndex(s.p); if (bi !== biome) { biome = bi; onBiome(BIOMES[bi]); }

      // follow camera
      const e = snap ? 1 : 1 - Math.exp(-6 * dt);
      rel.back += (relT.back - rel.back) * e; rel.up += (relT.up - rel.up) * e; rel.look += (relT.look - rel.look) * e;
      const gp = s.p.clone().multiplyScalar(groundR(s.p) + s.y * 0.6);
      const want = gp.clone().addScaledVector(s.p, rel.up).addScaledVector(s.f, -rel.back + (front ? 0 : 0));
      cam.pos.lerp(want, e); cam.up.lerp(s.p, e).normalize();
      cam.look.copy(gp).addScaledVector(s.p, rel.look).addScaledVector(s.f, front ? 0 : 0.5);
      camera.position.copy(cam.pos); camera.up.copy(cam.up); camera.lookAt(cam.look);
    },
    /** screen position (px) of a point above a world object */
    project(v) { const p = v.clone().project(camera); return { x: (p.x * 0.5 + 0.5) * innerWidth, y: (-p.y * 0.5 + 0.5) * innerHeight, z: p.z }; },
    headWorld(g, h = 2.5) { return g.position.clone().addScaledVector(g.position.clone().normalize(), h); },
  };
  return api;
}
