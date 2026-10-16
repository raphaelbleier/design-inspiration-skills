/* Hero slider: one full-screen plane, two textures, a "smear" transition in a fragment shader.
   progress 0 -> 1 over 1.2s power3.inOut. The sample position is pushed along x by sin(pi*p) * 0.22 (strength),
   averaged over 12 taps (motion blur), with an RGB split of 0.012 * sin(pi*p) and a faint grain + vignette at rest.
   Input: wheel (|dy| > 20), drag/swipe (> 40px), arrow keys, 7s autoplay. Slide copy swaps with a word-rise. */
import * as THREE from 'three';
import gsap from 'gsap';
import { slides } from './data.js';
import { reduced, onFrame } from './scroll.js';

const vert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const frag = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA, uB;
uniform vec2 uScaleA, uScaleB;
uniform float uP, uTime;
uniform float uDir;
vec2 cover(vec2 uv, vec2 s){ return (uv - .5) * s + .5; }
vec3 tap(vec2 uv, float p, float split){
  vec2 a = cover(uv, uScaleA), b = cover(uv, uScaleB);
  float k = smoothstep(0., 1., p);
  vec3 ca = vec3(texture2D(uA, a + vec2(split, 0.)).r, texture2D(uA, a).g, texture2D(uA, a - vec2(split, 0.)).b);
  vec3 cb = vec3(texture2D(uB, b + vec2(split, 0.)).r, texture2D(uB, b).g, texture2D(uB, b - vec2(split, 0.)).b);
  return mix(ca, cb, k);
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  float bell = sin(3.14159265 * uP);
  float strength = .22 * bell * uDir;
  float split = .012 * bell + .0012;
  vec3 col = vec3(0.);
  for (int i = 0; i < 12; i++) {
    float t = float(i) / 11. - .5;
    vec2 uv = vUv + vec2(t * strength, t * strength * .08);
    col += tap(uv, uP, split);
  }
  col /= 12.;
  float v = smoothstep(1.1, .35, length(vUv - .5));
  col *= mix(.78, 1., v);
  col += (hash(vUv * 900. + uTime) - .5) * .045;
  gl_FragColor = vec4(col * .86, 1.);   // .86: the original dims slides so white copy stays readable
}`;

function fallbackTexture(i) {            // gradient stand-in until the .webp arrives (or if it is missing)
  const c = document.createElement('canvas'); c.width = 256; c.height = 144;
  const g = c.getContext('2d'); const h = (i * 47 + 20) % 360;
  const gr = g.createLinearGradient(0, 0, 256, 144);
  gr.addColorStop(0, `hsl(${h} 30% 28%)`); gr.addColorStop(1, `hsl(${h + 40} 35% 12%)`);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 144);
  const t = new THREE.CanvasTexture(c); t.userData.ar = 16 / 9; return t;
}

export function initSlider({ onChange }) {
  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  const scene = new THREE.Scene(), cam = new THREE.Camera();
  const tex = slides.map((_, i) => fallbackTexture(i));
  const loader = new THREE.TextureLoader();
  const loaded = Promise.all(slides.map((s, i) => new Promise((res) => loader.load(s.img, (t) => {
    t.colorSpace = THREE.SRGBColorSpace; t.userData.ar = t.image.width / t.image.height; tex[i] = t; res();
    if (i === cur || i === next) setTex();
  }, undefined, () => res()))));
  const u = {
    uA: { value: tex[0] }, uB: { value: tex[1] }, uScaleA: { value: new THREE.Vector2(1, 1) },
    uScaleB: { value: new THREE.Vector2(1, 1) }, uP: { value: 0 }, uTime: { value: 0 }, uDir: { value: 1 },
  };
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: u })));

  let cur = 0, next = 1, busy = false, W = 1, H = 1;
  const scaleFor = (t) => {              // object-fit: cover
    const ar = t.userData.ar || 16 / 9, va = W / H;
    return ar > va ? new THREE.Vector2(va / ar, 1) : new THREE.Vector2(1, ar / va);
  };
  function setTex() {
    u.uA.value = tex[cur]; u.uB.value = tex[next];
    u.uScaleA.value.copy(scaleFor(tex[cur])); u.uScaleB.value.copy(scaleFor(tex[next]));
  }
  function resize() {
    W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); setTex();
  }
  addEventListener('resize', resize); resize();
  onFrame((t) => { u.uTime.value = t % 10; if (active) renderer.render(scene, cam); });

  let active = true, timer;
  const go = (dir) => {
    if (busy) return; busy = true;
    next = (cur + dir + slides.length) % slides.length; u.uDir.value = dir; setTex();
    onChange(next, dir);
    if (reduced) { u.uP.value = 0; cur = next; setTex(); busy = false; return; }
    gsap.fromTo(u.uP, { value: 0 }, {
      value: 1, duration: 1.2, ease: 'power3.inOut',
      onComplete() { cur = next; u.uP.value = 0; u.uA.value = tex[cur]; u.uScaleA.value.copy(scaleFor(tex[cur])); busy = false; },
    });
  };
  const auto = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => active && go(1), 7000); };
  auto();

  let wheelLock = 0;
  addEventListener('wheel', (e) => {
    if (!active || Math.abs(e.deltaY) < 20 || performance.now() < wheelLock) return;
    wheelLock = performance.now() + 1300; go(e.deltaY > 0 ? 1 : -1); auto();
  }, { passive: true });
  addEventListener('keydown', (e) => {
    if (!active) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { go(1); auto(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { go(-1); auto(); }
  });
  let x0 = null;
  addEventListener('pointerdown', (e) => { x0 = active ? e.clientX : null; });
  addEventListener('pointerup', (e) => {
    if (x0 !== null && Math.abs(e.clientX - x0) > 40) { go(e.clientX < x0 ? 1 : -1); auto(); }
    x0 = null;
  });
  return {
    setActive(v) { active = v; canvas.style.visibility = v ? 'visible' : 'hidden'; },
    get index() { return cur; }, loaded,
  };
}
