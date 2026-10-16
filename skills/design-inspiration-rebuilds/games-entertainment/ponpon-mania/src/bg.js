/* Sprayed-blob background (WebGL, one fullscreen triangle).
 * Technique: domain-warped fbm value noise -> thresholded into two flat colours. The threshold edge
 * is dithered with per-pixel grain, which gives the "airbrushed" speckled border of the blobs.
 *   uW     edge softness (home 0 -> flat, chapters .05 -> crisp spray, about .02 -> crisp cream clouds on pink)
 *   uGrain grain amplitude on the edge (chapters 1.0, about .08)
 *   uRad   radial bias (chapters 1): pulls the field toward one big centred round blob
 *   drift  p = uv * 1.0 * (aspect-corrected) + time * .035 + mouse * .06
 * Palettes tween with GSAP (1.2s, power2.inOut) when the view changes.
 */
import * as THREE from 'three';
import gsap from 'gsap';

export const PALETTES = {
  home:     { a: '#7f7fff', b: '#7f7fff', c: '#7f7fff', w: 0.5,  grain: 0.0, rad: 0 },
  chapters: { a: '#fb7a00', b: '#ee8fb8', c: '#fb7a00', w: 0.03, grain: 1.0, rad: 1 },
  about:    { a: '#ee8fb8', b: '#feece3', c: '#ee8fb8', w: 0.02, grain: 0.08, rad: 0 },
};

const frag = /* glsl */ `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform float uW; uniform float uGrain; uniform float uRad;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * vnoise(p); p *= 2.02; a *= 0.5; } return s; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 1.0 + uTime * 0.03 + uMouse * 0.06;
  vec2 q = vec2(fbm(p + 1.7), fbm(p + 8.3));
  float n = fbm(p + 1.6 * q);
  n -= uRad * (0.5 - length((uv - 0.5) * vec2(uRes.x / uRes.y, 1.0)));   // chapters: one big round blob centred
  float g = hash(gl_FragCoord.xy) - 0.5;
  float t = (n - 0.5) / max(uW, 0.001);
  float e = smoothstep(-1.0, 1.0, t + g * uGrain * 2.0);
  float e2 = smoothstep(-1.0, 1.0, (fbm(p * 1.3 + 4.0) - 0.62) / max(uW, 0.001) + g * uGrain * 2.0);
  vec3 col = mix(uA, uB, e);
  col = mix(col, uC, e2 * 0.6);
  gl_FragColor = vec4(col, 1.0);
}`;

THREE.ColorManagement.enabled = false;   // shader writes raw sRGB, skip the linear conversion
const col = (hex) => new THREE.Color(hex);
let U;

export function initBg(canvas, reduced) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  U = {
    uRes: { value: new THREE.Vector2() }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() },
    uA: { value: col(PALETTES.home.a) }, uB: { value: col(PALETTES.home.b) }, uC: { value: col(PALETTES.home.c) },
    uW: { value: PALETTES.home.w }, uGrain: { value: PALETTES.home.grain }, uRad: { value: 0 },
  };
  const geo = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: U, vertexShader: 'void main(){gl_Position=vec4(position,1.);}', fragmentShader: frag, depthTest: false })));

  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); renderer.getDrawingBufferSize(U.uRes.value); };
  addEventListener('resize', resize); resize();

  const m = { x: 0, y: 0 }, mt = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { mt.x = e.clientX / innerWidth - 0.5; mt.y = 0.5 - e.clientY / innerHeight; });
  gsap.ticker.add((t) => {
    m.x += (mt.x - m.x) * 0.05; m.y += (mt.y - m.y) * 0.05;
    U.uMouse.value.set(m.x, m.y);
    if (!reduced) U.uTime.value = t;
    renderer.render(scene, cam);
  });
}

export function setPalette(name, dur = 1.2) {
  const p = PALETTES[name];
  const d = reducedDur(dur);
  for (const [k, u] of [['a', 'uA'], ['b', 'uB'], ['c', 'uC']]) {
    const c = col(p[k]);
    gsap.to(U[u].value, { r: c.r, g: c.g, b: c.b, duration: d, ease: 'power2.inOut', overwrite: 'auto' });
  }
  gsap.to(U.uW, { value: p.w, duration: d, ease: 'power2.inOut', overwrite: 'auto' });
  gsap.to(U.uRad, { value: p.rad, duration: d, ease: 'power2.inOut', overwrite: 'auto' });
  gsap.to(U.uGrain, { value: p.grain, duration: d, ease: 'power2.inOut', overwrite: 'auto' });
}
const reducedDur = (d) => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : d);
