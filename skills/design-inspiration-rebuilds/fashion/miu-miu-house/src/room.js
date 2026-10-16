// WebGL room: one full-screen plane, two textures, a door "push-through" transition.
// Cover-fit UV, base zoom 1.08 (overscan), cursor parallax lerp .06 * 0.018 uv, wheel dolly zoom 1..1.35 (lerp .08).
// Transition: radial reveal from the door, 1.6s power2.inOut; old room zooms 1 -> 1.5, new room 1.3 -> 1,
// edge band (.22) displaces UVs outward by .04 for a soft ripple.
import * as THREE from 'three';
import gsap from 'gsap';

const frag = /* glsl */`
precision highp float;
uniform sampler2D uA, uB;
uniform vec2 uRes, uOrigin, uMouse;
uniform float uAspA, uAspB, uZoom, uProg, uTime;
varying vec2 vUv;
vec2 cover(vec2 s, float asp, float zoom, vec2 par){
  float r = uRes.x / uRes.y;
  vec2 k = r > asp ? vec2(1.0, asp / r) : vec2(r / asp, 1.0);
  return (s - .5) * k / zoom + .5 + par;
}
void main(){
  vec2 s = vUv;
  vec2 par = uMouse * .018;
  float d = distance(s * vec2(uRes.x / uRes.y, 1.0), uOrigin * vec2(uRes.x / uRes.y, 1.0));
  float r = uProg * 2.2;
  float edge = smoothstep(r, r - .22, d);                 // 1 inside the reveal
  vec2 dir = normalize(s - uOrigin + 1e-4);
  vec2 sA = s + dir * edge * (1.0 - edge) * .16;          // ripple at the band
  float zA = uZoom * 1.08 * mix(1.0, 1.5, uProg);
  float zB = 1.08 * mix(1.3, 1.0, uProg);
  vec3 a = texture2D(uA, cover(sA, uAspA, zA, par)).rgb;
  vec3 b = texture2D(uB, cover(sA, uAspB, zB, par)).rgb;
  vec3 col = mix(a, b, edge);
  float grain = fract(sin(dot(s * uRes + uTime, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - .5) * .028;                              // film grain
  gl_FragColor = vec4(col, 1.0);
}`;

export function createRoom(canvas, rooms) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const solid = (hex) => { const c = new THREE.Color(hex); const t = new THREE.DataTexture(
    new Uint8Array([c.r * 255, c.g * 255, c.b * 255, 255].map(Math.round)), 1, 1); t.needsUpdate = true; return t; };

  const tex = rooms.map((r) => solid(r.color));
  const asp = rooms.map((r) => r.aspect);
  const loader = new THREE.TextureLoader();
  rooms.forEach((r, i) => loader.load(r.img, (t) => {
    t.colorSpace = THREE.SRGBColorSpace; tex[i] = t; asp[i] = t.image.width / t.image.height;
    if (i === cur) { u.uA.value = t; u.uAspA.value = asp[i]; }
  }, undefined, () => {}));

  const u = {
    uA: { value: tex[0] }, uB: { value: tex[0] }, uRes: { value: new THREE.Vector2() },
    uOrigin: { value: new THREE.Vector2(.5, .5) }, uMouse: { value: new THREE.Vector2() },
    uAspA: { value: asp[0] }, uAspB: { value: asp[0] }, uZoom: { value: 1 }, uProg: { value: 0 }, uTime: { value: 0 },
  };
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ uniforms: u, vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}', fragmentShader: frag })));

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, busy = false, zoomT = 1;
  const mouse = new THREE.Vector2(), mouseT = new THREE.Vector2();

  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); u.uRes.value.set(canvas.width, canvas.height); };
  addEventListener('resize', resize); resize();
  addEventListener('pointermove', (e) => { mouseT.set((e.clientX / innerWidth - .5) * 2, -(e.clientY / innerHeight - .5) * 2); });
  addEventListener('wheel', (e) => { if (!busy) zoomT = THREE.MathUtils.clamp(zoomT - e.deltaY * .0006, 1, 1.35); }, { passive: true });

  // image-uv -> screen px, mirrors the shader (idle state, no transition)
  function toScreen(x, y) {
    const r = innerWidth / innerHeight, a = asp[cur];
    const kx = r > a ? 1 : r / a, ky = r > a ? a / r : 1;
    const z = u.uZoom.value * 1.08;
    const px = u.uMouse.value.x * .018, py = u.uMouse.value.y * .018;
    // shader: tex = (s-.5)*k/z + .5 + par  (texture v is flipped vs. top-left origin)
    const tu = x - px, tv = (1 - y) - py;
    const sx = (tu - .5) * z / kx + .5, sy = (tv - .5) * z / ky + .5;
    return { x: sx * innerWidth, y: (1 - sy) * innerHeight };
  }

  function go(to, from = { x: .5, y: .5 }) {
    if (busy || to === cur) return Promise.resolve();
    busy = true; zoomT = 1;
    u.uB.value = tex[to]; u.uAspB.value = asp[to];
    u.uOrigin.value.set(from.x, 1 - from.y);
    const done = () => { cur = to; u.uA.value = tex[to]; u.uAspA.value = asp[to]; u.uProg.value = 0; u.uZoom.value = 1; busy = false; };
    if (reduce) { done(); return Promise.resolve(); }
    return new Promise((res) => gsap.to(u.uProg, { value: 1, duration: 1.6, ease: 'power2.inOut', onComplete: () => { done(); res(); } }));
  }

  gsap.ticker.add((t) => {
    u.uTime.value = t;
    if (!reduce) {
      mouse.lerp(mouseT, .06); u.uMouse.value.copy(mouse);
      if (!busy) u.uZoom.value += (zoomT - u.uZoom.value) * .08;
    }
    renderer.render(scene, cam);
  });

  return { go, toScreen, get current() { return cur; }, get busy() { return busy; } };
}
