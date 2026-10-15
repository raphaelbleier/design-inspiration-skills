/* PLASTER RELIEF BACKGROUND  (the site's signature effect, rebuilt with Three.js)

   What the original does: a fixed WebGL canvas shows a baked bas-relief of flowers and animals.
   The relief stays almost flat until the cursor (or an autonomous ghost cursor) "pushes"
   it: a 256px ping-pong flowmap stores how far each spot is extruded, and the vertex shader
   scales z by mix(0.05, 1, extrude). Scrolling and fast mode raise the extrusion globally.

   How this rebuild gets the same read without the baked GLB:
   1. FLOWMAP  - two 512px half-float render targets, ping-ponged each frame.
      new = max(prev * dissipation, stamp)     stamp = (1 - dist/radius)^1.5 * velocity
      The pointer AND the ghost cursor each stamp a *segment* (previous -> current position)
      so fast moves leave continuous trails. radius = 160 css px (min .11 of width),
      dissipation 0.985 per frame at 60fps (frame-rate independent via pow). The studied
      value is 0.953; its relief lingers longer visually because of the vertex extrusion
      easing, so 0.985 matches the felt trail.
   2. EXTRUSION - per pixel, extrude = flow + scrollSpeed*0.5 + fast*0.75 (all broken up by
      fbm noise so it grows in patches, like the noise-driven fast-mode extrude).
      A depth-map texture (white = nearer) is thresholded by extrude:
         mask = smoothstep(0.08, 0.32, depth * extrude * 1.9)
      so motifs *grow* out of the plaster instead of fading in.
   3. SHADING - the depth map is already lit (top-left), mapped to 0.66..0.965 white plaster.
      A 2-tap offset copy of the mask (+8px/-8px, 16px) gives the soft contact shadow
      (strength 0.15) that makes the shapes read as raised.
   4. PLASTER - base #c0c1c2-ish (0.752,0.757,0.762) with 3 octaves of fbm grain and very faint
      "vein" cracks (0.007 amplitude), plus a faint iridescent fringe (cosine palette) where the flow edge is.
   5. SCROLL - the tile scrolls at 0.25x the page scroll (parallax); the tile is mirrored
      (triangle wave) so it repeats infinitely without seams.
   6. FAST MODE - uFast (0..1, eased 1.5s) crossfades to the full lit relief photo, whitens
      the plaster toward #e5e5e5 and widens the view (the "fastModeZoom 0.6" feel).
   Rendering pauses when the canvas is hidden (other routes) or the About overlay is open. */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { state } from './state.js';
import { createGhost } from './ghost.js';

const vert = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;

const flowFrag = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D tPrev;
uniform vec4 uMouse;      // prev.xy, cur.xy   (uv)
uniform vec4 uGhost;      // prev.xy, cur.xy
uniform vec2 uStrength;   // mouse, ghost
uniform float uAspect, uRadius, uDecay;
float seg(vec2 p, vec2 a, vec2 b){
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0., 1.);
  return length(pa - ba * h);
}
vec2 w(vec2 uv){ return vec2(uv.x, uv.y / uAspect); }
float stamp(vec4 m, float s){
  float d = seg(w(vUv), w(m.xy), w(m.zw));
  return pow(clamp(1. - d / uRadius, 0., 1.), 1.5) * s;
}
void main(){
  float prev = texture2D(tPrev, vUv).r * uDecay;
  float v = max(prev, max(stamp(uMouse, uStrength.x), stamp(uGhost, uStrength.y)));
  gl_FragColor = vec4(v, 0., 0., 1.);
}`;

const mainFrag = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform sampler2D tFlow, tDepth, tLit;
uniform vec2 uSize;
uniform float uTile, uScroll, uTime, uSpeed, uFast, uStatic;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a * noise(p); p *= 2.03; a *= .5; } return s; }
vec2 tile(vec2 pos){                       // pos in css px, y up -> mirrored tile uv (v from top)
  vec2 t = vec2(pos.x / uTile + .12, (uSize.y - pos.y + uScroll) / (uTile * 1.5));
  return 1. - abs(1. - mod(t, 2.));
}
float flowAt(vec2 uv){
  vec2 o = vec2(1.6 / 512., 1.6 / 512. * uSize.x / uSize.y);
  return (texture2D(tFlow, uv).r * 2. + texture2D(tFlow, uv + vec2(o.x, 0.)).r + texture2D(tFlow, uv - vec2(o.x, 0.)).r
        + texture2D(tFlow, uv + vec2(0., o.y)).r + texture2D(tFlow, uv - vec2(0., o.y)).r) / 6.;
}
void main(){
  vec2 pos = vUv * uSize;
  float e = flowAt(vUv);
  float n = fbm(pos / (uSize.x * .16) + uTime * .06);
  float ext = e + uSpeed * .5 * (.55 + .9 * n) + uFast * (.75 + .6 * n) + uStatic * smoothstep(.42, .7, n);
  ext = clamp(ext, 0., 1.25);

  vec2 uv = tile(pos);
  float d = texture2D(tDepth, uv).r;
  float m = smoothstep(.08, .32, d * ext * 1.9);
  // shadow: sample the mask from the upper-left (light) so it falls to the lower-right
  float k = uSize.x / 1440.;
  float s1 = smoothstep(.08, .32, texture2D(tDepth, tile(pos + vec2(-8., 8.) * k)).r * ext * 1.9);
  float s2 = smoothstep(.08, .32, texture2D(tDepth, tile(pos + vec2(-16., 16.) * k)).r * ext * 1.9);
  float shadow = (s1 * .6 + s2 * .4) * (1. - m) * .15;

  // plaster
  float g1 = fbm(pos / 190.), g2 = fbm(pos / 23.);
  vec3 plaster = vec3(.752, .757, .762) * (.94 + .1 * g1 + .045 * g2);
  float vein = 1. - smoothstep(0., .028, abs(fbm(pos / 150. + 7.) - .5));
  plaster -= vein * .007;
  plaster = mix(plaster, vec3(.9), uFast * .55);
  plaster -= shadow;

  // relief colour: depth map is lit; fast mode uses the full-frame lit photo
  float lit = texture2D(tLit, uv).r;
  float rel1 = mix(.66, .965, smoothstep(.25, .85, d));
  float rel2 = mix(.72, .965, smoothstep(.45, .95, lit));
  vec3 relief = vec3(mix(rel1, rel2, uFast));
  float mTotal = max(m, uFast * smoothstep(.1, .5, ext) * .34);
  vec3 col = mix(plaster, mix(plaster, relief, 1.), mTotal);
  col = mix(col, vec3(.905), uFast * .6 * mTotal);

  // iridescent fringe at the flow edge
  float edge = e * (1. - e) * 4.;
  vec3 irid = .5 + .5 * cos(6.2831 * (vec3(0., .33, .67) + e * .8 + uTime * .03));
  col += (irid - .5) * .04 * edge * (1. - mTotal * .6);
  gl_FragColor = vec4(col, 1.);
}`;

export function initRelief(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch { canvas.style.display = 'none'; return { destroy() {}, setFast() {} }; }
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0xe8e8e8, 1);

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  const scene = new THREE.Scene(); scene.add(quad);

  const load = (url) => new THREE.TextureLoader().load(url, (t) => {
    t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; t.needsUpdate = true;
  });
  const tDepth = load('./img/relief-depth.webp'), tLit = load('./img/relief-lit.webp');

  const rtOpt = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
  let rtA, rtB, W = 1, H = 1;

  const flowMat = new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: flowFrag, depthTest: false, depthWrite: false,
    uniforms: { tPrev: { value: null }, uMouse: { value: new THREE.Vector4(.5, .5, .5, .5) }, uGhost: { value: new THREE.Vector4(-9, -9, -9, -9) },
      uStrength: { value: new THREE.Vector2() }, uAspect: { value: 1.6 }, uRadius: { value: .11 }, uDecay: { value: .985 } },
  });
  const mainMat = new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: mainFrag, depthTest: false, depthWrite: false,
    uniforms: { tFlow: { value: null }, tDepth: { value: tDepth }, tLit: { value: tLit }, uSize: { value: new THREE.Vector2(1440, 900) },
      uTile: { value: 1440 }, uScroll: { value: 0 }, uTime: { value: 0 }, uSpeed: { value: 0 }, uFast: { value: 0 }, uStatic: { value: state.reduced ? 1 : 0 } },
  });

  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setSize(W, H, false);
    const fh = Math.max(64, Math.round(512 * H / W));
    rtA?.dispose(); rtB?.dispose();
    rtA = new THREE.WebGLRenderTarget(512, fh, rtOpt); rtB = new THREE.WebGLRenderTarget(512, fh, rtOpt);
    for (const rt of [rtA, rtB]) { renderer.setRenderTarget(rt); renderer.clear(); }
    renderer.setRenderTarget(null);
    mainMat.uniforms.uSize.value.set(W, H);
    mainMat.uniforms.uTile.value = Math.max(W, 1100);       // motifs never get tiny on phones
    flowMat.uniforms.uAspect.value = W / H;
    flowMat.uniforms.uRadius.value = Math.max(.11, 160 / W);
  }
  resize(); addEventListener('resize', resize);

  const ghost = createGhost();
  const mouse = { x: .5, y: .5, px: .5, py: .5, vel: 0 };
  const fast = { v: 0 };
  let time = 0, lastMove = 0, gpx = -9, gpy = -9, pxs = 0;

  function frame(_, deltaMs) {
    if (document.body.dataset.route !== 'home' || document.body.classList.contains('about-open')) return;
    const dt = Math.min(deltaMs / 1000, .05); time += dt;
    const f60 = dt * 60;

    // pointer: eased (mouseEase .4), velocity lerped 0.1 (0.04 when idle)
    mouse.px = mouse.x; mouse.py = mouse.y;
    const e = 1 - Math.pow(1 - .4, f60);
    mouse.x += (state.mouse.x - mouse.x) * e; mouse.y += (1 - state.mouse.y - mouse.y) * e;
    const asp = W / H;
    const inst = Math.hypot(mouse.x - mouse.px, (mouse.y - mouse.py) / asp);
    const moving = inst > 1e-5;
    mouse.vel += (inst - mouse.vel) * (moving ? .1 : .04) * Math.min(f60, 3);

    // ghost cursor (off with reduced motion)
    let gs = 0;
    const gprevx = gpx, gprevy = gpy;
    if (!state.reduced) {
      ghost.update(dt, asp);
      if (ghost.active) { gpx = ghost.x; gpy = 1 - ghost.y; gs = Math.min(1, .5 + ghost.speed * 60); }
      else { gpx = -9; gpy = -9; }
    }

    const fu = flowMat.uniforms;
    fu.uMouse.value.set(mouse.px, mouse.py, mouse.x, mouse.y);
    fu.uGhost.value.set(gprevx < -1 ? gpx : gprevx, gprevy < -1 ? gpy : gprevy, gpx, gpy);
    fu.uStrength.value.set(state.fine ? Math.min(1, inst * 140 + mouse.vel * 40) : 0, gs);
    fu.uDecay.value = Math.pow(.985, f60);
    fu.tPrev.value = rtA.texture;
    quad.material = flowMat;
    renderer.setRenderTarget(rtB); renderer.render(scene, cam);
    [rtA, rtB] = [rtB, rtA];

    const mu = mainMat.uniforms;
    mu.tFlow.value = rtA.texture; mu.uTime.value = time;
    mu.uScroll.value = state.scroll * .25;
    mu.uSpeed.value += (state.speed - mu.uSpeed.value) * Math.min(1, .08 * f60);
    mu.uFast.value = fast.v;
    quad.material = mainMat;
    renderer.setRenderTarget(null); renderer.render(scene, cam);
  }
  gsap.ticker.add(frame);

  // touch devices: no pointer, so wake the relief with taps
  addEventListener('pointerdown', (ev) => { if (!state.fine) { state.mouse.x = ev.clientX / innerWidth; state.mouse.y = ev.clientY / innerHeight; } }, { passive: true });

  return {
    /** fast mode: 1.5 s ease "fast" in, 1.3 s ease "slow" out */
    setFast(on) { gsap.to(fast, { v: on ? 1 : 0, duration: on ? 1.5 : 1.3, ease: on ? 'fast' : 'slow', overwrite: true }); },
    destroy() { gsap.ticker.remove(frame); removeEventListener('resize', resize); renderer.dispose(); },
  };
}
