/**
 * Page 2 - "Archive": one ice shard per project, hover ripples, click opens the detail overlay.
 *
 * TECHNIQUE
 *  - One plate per project (shard artwork on a pale fog ground). Scroll p maps to s = (p-.25)/.5:
 *    s = 0 centres project 0, s = 1 centres project 1 (one scroll unit per project in the original).
 *    Plates slide vertically with an inOut3 step between projects and cross-fade, so you always
 *    "rest" on a shard (see PAGE_REST in scroll.js).
 *  - HOVER SPLAT: while the pointer moves over the shard (ellipse hit test), a ripple is pushed
 *    into a ring buffer of 8 (every ~15 ms like the original's mouse sim). The fragment shader sums
 *    up to 8 expanding sine rings, displaces the UVs by them and splits RGB along the wave to fake
 *    refraction / dispersion (stand-in for the transmission + caustics render).
 *  - A plexus of white hairlines floats off the shard; the callout label (DOM) is anchored left.
 *  - Slow idle drift: rotation.z +-0.5 deg and a 2% scale breathing so the plate never feels static.
 */
import * as THREE from 'three';
import { PLATE_VERT, NOISE_GLSL, GRADE_GLSL, coverSize } from './scene-utils.js';
import { createPlexus } from './plexus.js';
import { clamp, smoothstep, ease } from './eases.js';

const FOV = 30, D = 10, MAXR = 8;
const MASK = [[0.5, 0.78], [0.5, 0.78]];
const PLATE_SCALE = [0.8, 0.88]; // per-plate zoom (1 = cover)

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D t;
uniform float uTime, uAlpha, uAspect;
uniform vec2 uMask; // radial fog mask (inner, outer) so a plate's rectangle never shows
uniform vec4 uRip[${MAXR}];   // x, y (plate uv), start time, strength
varying vec2 vUv;
${NOISE_GLSL}
${GRADE_GLSL}
void main(){
  vec2 uv = vUv;
  vec2 disp = vec2(0.);
  float rim = 0.;
  for (int i = 0; i < ${MAXR}; i++){
    vec4 r = uRip[i];
    float age = uTime - r.z;
    if (age < 0. || age > 3.) continue;
    vec2 dv = (uv - r.xy) * vec2(uAspect, 1.);
    float d = length(dv);
    float front = age * .32;
    float env = exp(-age * 1.4) * r.w * smoothstep(front + .05, front - .02, d) * smoothstep(0., .06, front - d + .06);
    float w = sin((d - front) * 46.) * env;
    disp += normalize(dv + 1e-4) * w * .006;
    rim += abs(w);
  }
  vec3 c;
  c.r = texture2D(t, uv + disp * 1.6).r;
  c.g = texture2D(t, uv + disp).g;
  c.b = texture2D(t, uv + disp * .4).b;
  c = grade(c, .8);
  c += rim * vec3(.5, .6, .8) * .5;
  float edge = smoothstep(0., .14, min(min(uv.x, 1. - uv.x), min(uv.y, 1. - uv.y)));
  float rad = 1. - smoothstep(uMask.x, uMask.y, length((uv - .5) * vec2(1., 1.35)));
  gl_FragColor = vec4(c, uAlpha * edge * rad);
}`;

// Prism overlay: voronoi shards along the whole bottom 25 % of the screen with rainbow fringes.
const PRISM_FRAG = /* glsl */ `
precision highp float;
uniform float uTime, uAspect;
varying vec2 vUv;
vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
vec3 hue(float h){ return clamp(abs(mod(h * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.); }
// returns (F1, F2-F1, cell id)
vec3 vor(vec2 p){
  vec2 i = floor(p), f = fract(p); float d1 = 9., d2 = 9., id = 0.;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec2 g = vec2(float(x), float(y)); vec2 o = h2(i + g);
    o = .5 + .45 * sin(uTime * .35 + 6.2831 * o);
    float d = length(g + o - f);
    if (d < d1){ d2 = d1; d1 = d; id = h2(i + g).x; } else if (d < d2) d2 = d;
  }
  return vec3(d1, d2 - d1, id);
}
void main(){
  float band = 1. - smoothstep(0., .25, vUv.y);           // full bottom edge, fading up to 25 %
  if (band < .002) { gl_FragColor = vec4(0.); return; }
  vec2 p = vUv * vec2(uAspect, 1.) * vec2(7., 7.) * vec2(1., 1.6);
  vec3 c = vec3(0.);
  float a = 0.;
  for (int k = 0; k < 3; k++){                            // chromatic split: one tap per channel
    float off = (float(k) - 1.) * .035;
    vec3 v = vor(p + vec2(off * 2.2, off));
    float edge = smoothstep(.07, .0, v.y);
    float fill = (1. - v.x) * .22;
    float ch = edge * .95 + fill * .35 * hue(v.z)[k];
    c[k] = ch; a = max(a, ch);
  }
  vec3 v0 = vor(p);
  c += hue(v0.z + vUv.x * .5) * .07 * (1. - v0.x);        // rainbow refraction in the cell bodies
  gl_FragColor = vec4(c * band * .95, 1.);
}`;

export function createCubes(tex) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 80);
  const rips = Array.from({ length: MAXR }, () => new THREE.Vector4(0, 0, -99, 0));
  let ripI = 0;

  const plates = [tex.shard1, tex.shard2].map((t, k) => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: PLATE_VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
      uniforms: { t: { value: t }, uTime: { value: 0 }, uAlpha: { value: k ? 0 : 1 }, uAspect: { value: 1 }, uRip: { value: rips }, uMask: { value: new THREE.Vector2(...MASK[k]) } },
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    m.position.z = k * 0.01;
    scene.add(m);
    return m;
  });

  const ui = new THREE.Group();
  scene.add(ui);
  const plexus = createPlexus({ center: [0.14, -0.04, 0.05], radius: [0.2, 0.22, 0.08], count: 10, k: 2, seed: 3 });
  ui.add(plexus.group);

  const prismMat = new THREE.ShaderMaterial({
    vertexShader: PLATE_VERT, fragmentShader: PRISM_FRAG, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uAspect: { value: 1 } },
  });
  const prism = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), prismMat);
  prism.position.z = -1; prism.renderOrder = 20; prism.frustumCulled = false;
  camera.add(prism); scene.add(camera);

  const state = { p: 0, project: 0, hover: false, size: null, lastRip: 0, lastMx: 0, lastMy: 0 };

  function s2e(s) {
    const e = ease('inOut3');
    return s < 0 ? s * 0.35 : s > 1 ? 1 + (s - 1) * 0.35 : e(s);
  }

  return {
    state,
    resize(w, h) {
      camera.aspect = w / h; camera.updateProjectionMatrix();
      const s = coverSize(1536 / 960, w / h, D, FOV, 1.18);
      state.size = s;
      const ph = 2 * Math.tan((FOV * Math.PI) / 360);
      prism.scale.set(ph * (w / h), ph, 1); prismMat.uniforms.uAspect.value = w / h;
      plates.forEach((m) => { m.scale.set(s.w, s.h, 1); m.material.uniforms.uAspect.value = s.w / s.h; });
      ui.scale.setScalar(s.h);
    },
    setProgress(p) { state.p = p; state.project = p < 0.5 ? 0 : 1; },
    /** Is the pointer on the shard? (screen-space ellipse, -1..1) */
    hit(mx, my) { return (mx / 0.34) ** 2 + ((my + 0.03) / 0.6) ** 2 < 1; },
    pointer(mx, my, time, active) {
      state.hover = active && this.hit(mx, my);
      if (!state.hover) return;
      const moved = Math.hypot(mx - state.lastMx, my - state.lastMy);
      if (moved > 0.004 && time - state.lastRip > 0.015) {
        state.lastRip = time;
        rips[ripI].set(0.5 + (mx * 0.5) / 1.18, 0.5 + (my * 0.5) / 1.18, time, clamp(moved * 18, 0.25, 1));
        ripI = (ripI + 1) % MAXR;
      }
      state.lastMx = mx; state.lastMy = my;
    },
    render(renderer, target, time, mouse) {
      const s = (state.p - 0.25) / 0.5;
      const e = s2e(s);
      const vh = state.size.vh;
      const fit = Math.min(1, (state.size.vw / vh / 1.6) * 1.5); // portrait: contain the artwork by width instead of cropping it
      plates.forEach((m, k) => {
        const off = (k - e) * vh * 0.55;
        m.position.y = off;
        m.position.x = mouse.sx * -0.15 * (1 + k * 0.2);
        m.rotation.z = Math.sin(time * 0.2 + k) * 0.0085;
        const br = 1 + Math.sin(time * 0.5 + k * 2) * 0.01;
        m.scale.set(state.size.w * br * PLATE_SCALE[k] * fit, state.size.h * br * PLATE_SCALE[k] * fit, 1);
        m.material.uniforms.uAlpha.value = 1 - smoothstep(0.35, 1.1, Math.abs(k - e));
        m.material.uniforms.uTime.value = time;
        m.renderOrder = k === state.project ? 2 : 1;
      });
      plexus.setOpacity(1 - smoothstep(0.25, 0.7, Math.abs(state.project - e)));
      plexus.update(time);
      ui.position.y = (state.project - e) * vh * 0.55;
      camera.position.set(mouse.sx * 0.2, mouse.sy * 0.12, D);
      camera.lookAt(0, 0, 0);
      prismMat.uniforms.uTime.value = time;
      renderer.setRenderTarget(target);
      renderer.setClearColor(0xb6bac4, 1); // = the plates' fog, so radial-masked plates melt into the ground
      renderer.clear();
      renderer.render(scene, camera);
    },
  };
}
