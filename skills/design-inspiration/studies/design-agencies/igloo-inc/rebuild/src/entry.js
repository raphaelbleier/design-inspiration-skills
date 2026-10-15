/**
 * Page 3 - "Descent": fall through three portals into the entry room.
 *
 * TECHNIQUE
 *  - FALL (p 0 -> .52). The camera flies down -z along a tube. Its z follows PATH * entry_ease_3
 *    (slow start, speed-up through the middle, soft stop). fov tweens 22 -> 30; roll (camera up
 *    vector) rotates 0 -> PI with power3.inOut over the middle of the fall, so the symmetrical
 *    tunnel appears to spiral. Nothing is time-based: everything is a pure function of the
 *    scroll progress p, so scrubbing backwards plays the fall in reverse.
 *  - TUNNEL: a generated tunnel plate rides on the camera (zooming towards the bright core) as
 *    the far backdrop; real 3D geometry sits in front of it: thin filler rings every 2.2 units
 *    (quad + radial ring shader, additive), instanced blocks around the wall, speed streaks
 *    ("smoke trails") and falling snow. Distance fade in every shader (visible 26 -> 4 units,
 *    hidden under .05 so nothing pops through the lens).
 *  - PORTALS at p = .28, .375, .465: thick glowing ring + swirling fbm plasma disc + a ring of
 *    dashed segments spinning against it + a thin warm (#CDA05E) fringe. Each is placed exactly
 *    where the camera is at that p, so it rushes past at the right moment.
 *  - FLASH: a white additive quad on the camera peaks at p .5 and hides the swap from tunnel
 *    to room (room p .5 - 1). Tunnel materials fade out with uFade = 1 - smoothstep(.49,.56,p).
 *  - ROOM: room plate (dolly 12% in, mouse parallax) + the particle mascot that morphs from
 *    noise to figure between p .54 and .8. HUD brackets appear at p > .78.
 */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { PLATE_VERT, NOISE_GLSL, GRADE_GLSL, coverSize } from './scene-utils.js';
import { createSnow } from './snow.js';
import { createMascot } from './mascot-particles.js';
import { COLORS } from './config.js';
import { clamp, lerp, smoothstep, ease, reducedMotion } from './eases.js';

const FALL_END = 0.52, PATH = 70, R = 2.2;
const PORTALS = [0.28, 0.375, 0.465];

const RING_VERT = /* glsl */ `
varying vec2 vP; varying float vZ;
void main(){ vP = position.xy; vec4 w = modelMatrix * vec4(position, 1.); vZ = w.z; gl_Position = projectionMatrix * viewMatrix * w; }`;
const RING_FRAG = /* glsl */ `
precision highp float;
uniform float uR, uW, uGlow, uAlpha, uFade, uCamZ, uSeg, uSpin, uTime, uPlasma;
varying vec2 vP; varying float vZ;
${NOISE_GLSL}
void main(){
  float rad = length(vP);
  float d = abs(rad - uR);
  float core = smoothstep(uW, 0., d);
  float glow = exp(-d / uGlow);
  float ang = atan(vP.y, vP.x) + uSpin;
  float dash = uSeg > 0. ? smoothstep(.3, .5, fract(ang * uSeg / 6.2832)) : 1.;
  vec3 col = vec3(.86, .93, 1.);
  float a = (core + glow * .45) * dash;
  // warm fringe just outside the ring (the only warm colour on the whole site)
  float fr = exp(-abs(rad - uR * 1.02) / (uGlow * .35)) * step(.5, uPlasma);
  col = mix(col, vec3(.80, .63, .37), clamp(fr * .6, 0., 1.));
  // plasma disc
  float pl = 0.;
  if (uPlasma > 0.){
    float n = fbm(vec2(ang * 1.2 + uTime * .5, rad * 3.5 - uTime * .7));
    pl = n * smoothstep(uR, uR * .15, rad) * uPlasma * .55;
    a += pl;
  }
  float dd = abs(vZ - uCamZ);
  a *= smoothstep(26., 4., dd) * smoothstep(.05, .7, dd) * uAlpha * uFade;
  gl_FragColor = vec4(col, a);
}`;

function ringMaterial(shared, o) {
  return new THREE.ShaderMaterial({
    vertexShader: RING_VERT, fragmentShader: RING_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uR: { value: R }, uW: { value: 0.01 }, uGlow: { value: 0.05 }, uAlpha: { value: 0.5 }, uSeg: { value: 0 }, uSpin: { value: 0 }, uPlasma: { value: 0 },
      uFade: shared.fade, uCamZ: shared.camZ, uTime: shared.time, ...Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { value: v }])),
    },
  });
}

export function createEntry(tex) {
  const shared = { fade: { value: 1 }, camZ: { value: 0 }, time: { value: 0 } };
  const fadeMats = []; // materials with plain opacity
  const camera = new THREE.PerspectiveCamera(22, 1, 0.05, 160);

  // ---------- tunnel world ----------
  const tunnel = new THREE.Scene();
  tunnel.add(camera);

  const bgMat = new THREE.ShaderMaterial({
    vertexShader: PLATE_VERT, transparent: true, depthWrite: false,
    uniforms: { t: { value: tex.tunnel }, uFade: shared.fade, uFlash: { value: 0 } },
    fragmentShader: /* glsl */ `precision highp float; uniform sampler2D t; uniform float uFade, uFlash; varying vec2 vUv;
      ${GRADE_GLSL}
      void main(){ vec3 c = grade(texture2D(t, vUv).rgb, .9); gl_FragColor = vec4(c, uFade); }`,
  });
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bgMat);
  bg.position.z = -60;
  bg.renderOrder = -2;
  camera.add(bg);

  const flashMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: { uA: { value: 0 } },
    vertexShader: PLATE_VERT,
    fragmentShader: /* glsl */ `precision highp float; uniform float uA; varying vec2 vUv;
      void main(){ float d = length(vUv - .5) * 1.6; float a = smoothstep(1., 0., d) * uA + uA * .35; gl_FragColor = vec4(vec3(.9, .95, 1.), a); }`,
  });
  const flash = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), flashMat);
  flash.position.z = -0.5;
  flash.renderOrder = 10;
  camera.add(flash);

  // filler rings
  const fillers = [];
  for (let z = -4; z > -PATH - 8; z -= 2.2) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(R * 3, R * 3), ringMaterial(shared, { uW: 0.012, uGlow: 0.06, uAlpha: 0.55 }));
    m.position.z = z;
    tunnel.add(m);
    fillers.push(m);
  }

  // portals
  const portals = PORTALS.map((pp, i) => {
    const z = -PATH * ease('entry_ease_3')(pp / FALL_END);
    const g = new THREE.Group();
    g.position.z = z;
    const base = new THREE.Mesh(new THREE.PlaneGeometry(R * 3, R * 3), ringMaterial(shared, { uW: 0.05, uGlow: 0.22, uAlpha: 0.95, uPlasma: 1 }));
    const seg = new THREE.Mesh(new THREE.PlaneGeometry(R * 3, R * 3), ringMaterial(shared, { uR: R * 1.06, uW: 0.04, uGlow: 0.07, uAlpha: 0.9, uSeg: 28 }));
    seg.position.z = 0.02;
    g.add(base, seg);
    tunnel.add(g);
    return { g, base, seg, z };
  });

  // blocks around the wall
  const boxGeo = new THREE.BoxGeometry(0.34, 0.12, 0.6);
  const blockMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uFade: shared.fade, uCamZ: shared.camZ },
    vertexShader: `varying vec3 vN; varying float vZ; void main(){ vN = normalize(mat3(modelMatrix * instanceMatrix) * normal); vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.); vZ = w.z; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `precision highp float; uniform float uFade, uCamZ; varying vec3 vN; varying float vZ;
      void main(){ float l = .5 + .5 * dot(normalize(vN), normalize(vec3(.3, .8, .5))); vec3 c = mix(vec3(.50, .55, .66), vec3(.93, .96, 1.), l);
        float dd = abs(vZ - uCamZ); float a = smoothstep(24., 4., dd) * smoothstep(.1, .8, dd) * uFade; gl_FragColor = vec4(c, a * .7); }`,
  });
  const blocks = new THREE.InstancedMesh(boxGeo, blockMat, 150);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 150; i++) {
    const a = Math.random() * Math.PI * 2, r = R * (0.78 + Math.random() * 0.2);
    dummy.position.set(Math.cos(a) * r, Math.sin(a) * r, -Math.random() * PATH);
    dummy.rotation.set(Math.random() * 3, Math.random() * 3, a);
    dummy.scale.setScalar(0.5 + Math.random() * 1.3);
    dummy.updateMatrix();
    blocks.setMatrixAt(i, dummy.matrix);
  }
  blocks.frustumCulled = false;
  tunnel.add(blocks);

  // speed streaks
  const sp = [], st = [];
  for (let i = 0; i < 240; i++) {
    const a = Math.random() * 6.28, r = R * (0.3 + Math.random() * 0.65), z = -Math.random() * PATH, len = 1 + Math.random() * 3;
    sp.push(Math.cos(a) * r, Math.sin(a) * r, z, Math.cos(a) * r, Math.sin(a) * r, z - len);
    st.push(0, 1);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  sg.setAttribute('aT', new THREE.Float32BufferAttribute(st, 1));
  const streaks = new THREE.LineSegments(sg, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uFade: shared.fade, uCamZ: shared.camZ },
    vertexShader: `attribute float aT; varying float vT; varying float vZ; void main(){ vT = aT; vec4 w = modelMatrix * vec4(position, 1.); vZ = w.z; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `precision highp float; uniform float uFade, uCamZ; varying float vT; varying float vZ;
      void main(){ float dd = abs(vZ - uCamZ); gl_FragColor = vec4(1., 1., 1., vT * .5 * smoothstep(20., 3., dd) * smoothstep(.1, .8, dd) * uFade); }`,
  }));
  streaks.frustumCulled = false;
  tunnel.add(streaks);

  const tSnow = createSnow({ count: 900, box: [7, 7, 24], fall: 0.02, wind: 0, size: 0.03, alpha: 0.8 });
  tunnel.add(tSnow.points);

  // ---------- room world ----------
  const room = new THREE.Scene();
  const rcam = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  const rmat = new THREE.ShaderMaterial({
    vertexShader: PLATE_VERT,
    uniforms: { t: { value: tex.room }, uPulse: { value: 0 } },
    fragmentShader: /* glsl */ `precision highp float; uniform sampler2D t; uniform float uPulse; varying vec2 vUv;
      ${GRADE_GLSL}
      void main(){
        vec3 c = texture2D(t, vUv).rgb;
        vec3 b = texture2D(t, vUv, 3.).rgb;
        c += max(b - .62, 0.) * .5 * (1. + uPulse);
        c = grade(c, .9);
        c = mix(c, vec3(dot(c, vec3(.33))) * vec3(.93, .96, 1.04) + .12, .2);
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  const rplate = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), rmat);
  room.add(rplate);
  const mascot = createMascot(tex.mascot.image, { count: window.innerWidth < 700 ? 16000 : 26000 });
  mascot.points.position.set(0, 0.1, 1.8);
  room.add(mascot.points);
  const dust = createSnow({ count: 500, box: [8, 5, 6], fall: -0.006, wind: 0.004, size: 0.016, alpha: 0.5 });
  dust.points.position.z = 2;
  room.add(dust.points);

  const state = { p: 0, burst: 0, aspect: 1 };
  const tunnelEase = ease('entry_ease_3');
  const p3 = ease('power3.inOut');

  return {
    state,
    mascot,
    get roomUI() { return state.p > 0.78; },
    resize(w, h) {
      state.aspect = w / h;
      camera.aspect = rcam.aspect = w / h;
      camera.updateProjectionMatrix(); rcam.updateProjectionMatrix();
      const s = coverSize(1536 / 960, w / h, 10, 30, 1.2);
      rplate.scale.set(s.w, s.h, 1);
      mascot.uniforms.uScale.value = Math.min(2.7, 2.7 * (w / h > 0.9 ? 1 : (w / h) / 0.9 + 0.25));
    },
    setProgress(p) { state.p = p; },
    burst() {
      gsap.killTweensOf(state, 'burst');
      gsap.timeline().to(state, { burst: 1.2, duration: 0.45, ease: 'power3.out' }).to(state, { burst: 0, duration: 1.4, ease: 'power2.inOut' });
    },
    render(renderer, target, time, mouse) {
      const { p } = state;
      const f = clamp(p / FALL_END);
      const fade = 1 - smoothstep(0.49, 0.56, p);
      shared.fade.value = fade;
      shared.time.value = time;
      const camZ = -PATH * tunnelEase(f);
      shared.camZ.value = camZ;

      // fall camera
      camera.fov = lerp(22, 30, ease('power1.inOut')(f));
      camera.updateProjectionMatrix();
      camera.position.set(mouse.sx * 0.08, mouse.sy * 0.05, camZ);
      camera.lookAt(mouse.sx * 0.08, mouse.sy * 0.05, camZ - 10);
      camera.rotateZ(Math.PI * p3(clamp((f - 0.1) / 0.8)));

      // backdrop zoom + flash
      const s = coverSize(1536 / 960, state.aspect, 60, camera.fov, 1.15 + 3.4 * Math.pow(f, 2.6));
      bg.scale.set(s.w, s.h, 1);
      const fs = coverSize(1, state.aspect, 0.5, camera.fov, 1.4);
      flash.scale.set(fs.w, fs.h, 1);
      flashMat.uniforms.uA.value = smoothstep(0.43, 0.505, p) * (1 - smoothstep(0.505, 0.57, p)) * (1 - 0.15 * smoothstep(0.3, 0.5, p));

      // portals: spin + plasma + sound-less pulse
      portals.forEach((o, i) => {
        o.seg.material.uniforms.uSpin.value = time * (i % 2 ? -0.5 : 0.5);
        o.g.rotation.z = time * 0.1 * (i + 1);
      });
      tSnow.points.position.set(0, 0, camZ - 10);
      tSnow.uniforms.uTime.value = reducedMotion() ? 0 : time;
      tSnow.uniforms.uPx.value = target.height / (2 * Math.tan((camera.fov * Math.PI) / 360));

      // room camera
      const r = clamp((p - 0.5) / 0.5);
      rcam.position.set(mouse.sx * 0.3, mouse.sy * 0.15 + 0.1, 10 * (1 + 0.14 * (1 - ease('power2.out')(clamp(r * 3)))));
      rcam.lookAt(0, 0, 0);
      const show = 1 - ease('entry_ease_2')(clamp((p - 0.54) / 0.26));
      const mu = mascot.uniforms;
      mu.uShow.value = show;
      mu.uTime.value = time;
      mu.uAlpha.value = smoothstep(0.52, 0.6, p);
      mu.uBurst.value = state.burst;
      mu.uRotY.value = mouse.sx * 0.5 + Math.sin(time * 0.3) * 0.15;
      mu.uPx.value = target.height / (2 * Math.tan((30 * Math.PI) / 360));
      dust.uniforms.uTime.value = reducedMotion() ? 0 : time;
      dust.uniforms.uPx.value = mu.uPx.value;
      rmat.uniforms.uPulse.value = 0.5 + 0.5 * Math.sin(time * 0.8);

      renderer.setRenderTarget(target);
      renderer.setClearColor(COLORS.bg, 1);
      renderer.autoClear = false;
      renderer.clear();
      if (p > 0.47) renderer.render(room, rcam);
      if (fade > 0.002) {
        if (p > 0.47) renderer.clearDepth();
        renderer.render(tunnel, camera);
      }
      renderer.autoClear = true;
    },
  };
}
