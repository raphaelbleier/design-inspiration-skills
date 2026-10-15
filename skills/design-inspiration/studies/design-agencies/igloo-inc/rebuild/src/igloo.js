/**
 * Page 1 - "Shelter": the igloo on the snowy mountain.
 *
 * TECHNIQUE
 *  - Two generated plates (exploded + assembled) sit on one plane. Scroll progress p drives
 *    uMix: a noise-threshold dissolve (fbm thresholded against uMix) swaps exploded -> assembled
 *    with a bright icy seam on the dissolve front, plus a slow bob while the bricks "float"
 *    and a cheap bloom (mip-biased texture sample, thresholded, added) that glows hardest while
 *    exploded. This stands in for the original's real brick meshes assembling.
 *  - Camera (fov 30): dolly z 10 -> 6.6 toward the igloo across p (the original moves x -2, z +10
 *    over a 14 s power1.inOut tween); mouse parallax adds +-0.2 x / +-0.12 y.
 *  - INTRO (introTL ~7 s, scroll locked): uIntro 0->1 over 1 s inOut3 (fade from the bg colour),
 *    then the camera drops from an aerial tilt (y +3.4, target y +2.6) to ground level over
 *    ~6 s with igloo_ease_1, while a white cube-edge lattice ("cage", visible 0 - 5.1 s)
 *    covers the igloo and dissolves; the plexus with numbers fades in as the cage leaves.
 *  - Plexus + number sprites live in plate-height units and fade out as bricks assemble
 *    (uMix .1 -> .6). Snow falls in front of the plate for depth.
 */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { PLATE_VERT, NOISE_GLSL, GRADE_GLSL, coverSize, mouseState } from './scene-utils.js';
import { createSnow } from './snow.js';
import { createPlexus } from './plexus.js';
import { COLORS } from './config.js';
import { clamp, lerp, smoothstep, ease, reducedMotion } from './eases.js';

const FOV = 30, D = 10;
// igloo centre in the wide plate, plate-height units (plate is 1.6 x 1)
const IX = 0.048, IY = -0.022;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tA, tE;
uniform float uMix, uTime, uIntro;
varying vec2 vUv;
${NOISE_GLSL}
${GRADE_GLSL}
void main(){
  vec2 uv = vUv;
  float floaty = 1. - smoothstep(.0, .7, uMix);
  vec2 ue = uv + vec2(sin(uTime * .6 + uv.y * 6.), cos(uTime * .5 + uv.x * 5.)) * .0035 * floaty;
  vec3 e = texture2D(tE, ue).rgb;
  vec3 a = texture2D(tA, uv).rgb;
  // exploded glow: blurred (mip bias) bright parts added back
  vec3 eb = texture2D(tE, ue, 4.).rgb;
  e += max(eb - .72, 0.) * vec3(.55, .75, 1.) * .7 * floaty;

  // dome is incomplete while exploded: upper part ghosts out into a blurred, darker shell
  vec2 dq = (uv - vec2(.53, .478)) / vec2(.13, .15);
  float dome = (1. - smoothstep(.75, 1.05, length(dq))) * smoothstep(.40, .50, uv.y);
  vec3 ghost = mix(texture2D(tE, ue, 3.).rgb, vec3(.8, .86, .92), .35);
  e = mix(e, ghost, dome * .6 * floaty);

  // assembly sweeps in from the ground up: bricks 'land' row by row
  float n = fbm(uv * 14. + 3.);
  float lift = clamp((uv.y - .34) / .3, 0., 1.) * dome * .55;
  float t = uMix * 1.5 - .2 - lift + (1. - dome) * .25;
  float r = smoothstep(n - .08, n + .08, t);
  float front = r * (1. - r) * 4.;
  vec3 col = mix(e, a, r) + vec3(.55, .72, 1.) * front * .28;
  col = grade(col, .85);
  // lift blacks (door hole) so no hard void shows through the frost wipe
  col = max(col, vec3(.30, .335, .39));

  // edge fade into the world colour (visible while the camera is tilted in the intro)
  float edge = smoothstep(0., .12, min(min(uv.x, 1. - uv.x), min(uv.y, 1. - uv.y)));
  vec3 bg = vec3(${(COLORS.bg >> 16) / 255}, ${((COLORS.bg >> 8) & 255) / 255}, ${(COLORS.bg & 255) / 255});
  col = mix(bg, col, edge);
  col = mix(bg, col, uIntro);
  gl_FragColor = vec4(col, 1.);
}`;

function lattice(nx, ny, nz, size) {
  const pts = [];
  const P = (i, j, k) => [(i / (nx - 1) - 0.5) * size[0], (j / (ny - 1) - 0.5) * size[1], (k / (nz - 1)) * size[2]];
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (let k = 0; k < nz; k++) {
    if (i < nx - 1) pts.push(...P(i, j, k), ...P(i + 1, j, k));
    if (j < ny - 1) pts.push(...P(i, j, k), ...P(i, j + 1, k));
    if (k < nz - 1) pts.push(...P(i, j, k), ...P(i, j, k + 1));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const m = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false });
  const l = new THREE.LineSegments(g, m);
  l.frustumCulled = false;
  return l;
}

export function createIgloo(tex) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 80);

  const mat = new THREE.ShaderMaterial({
    vertexShader: PLATE_VERT, fragmentShader: FRAG,
    uniforms: { tA: { value: tex.assembled }, tE: { value: tex.exploded }, uMix: { value: 0 }, uTime: { value: 0 }, uIntro: { value: 1 } },
  });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  scene.add(plate);

  const ui = new THREE.Group(); // plate-height units
  scene.add(ui);
  const plexus = createPlexus({ center: [IX, IY, 0.02], radius: [0.2, 0.12, 0.07], count: 16, k: 2, seed: 7 });
  ui.add(plexus.group);
  const cage = lattice(8, 5, 4, [0.6, 0.38, 0.3]);
  cage.position.set(IX, IY, 0.02);
  ui.add(cage);

  const snow = createSnow({ count: 1200, box: [12, 8, 7], fall: 0.045, wind: 0.015, size: 0.035, alpha: 0.75 });
  snow.points.position.set(0, 0, D * 0.35);
  scene.add(snow.points);

  const state = { p: 0, intro: 1, cam: 0, cage: 0, plexus: 1, shift: 0, shiftX: 0, size: { w: 1, h: 1, vh: 1 } };

  function layout(aspect) {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    const s = coverSize(1536 / 960, aspect, D, FOV, 1.08);
    state.size = s;
    state.shiftX = aspect < 1 ? IX * s.h : 0; // portrait: centre on the igloo, not the plate
    state.shift = aspect < 1 ? 0.045 * s.h : 0; // portrait: igloo sits in the lower half
    plate.scale.set(s.w, s.h, 1);
    ui.scale.setScalar(s.h);
    snow.uniforms.uPx.value = 0; // set at render (needs target height)
  }

  return {
    state,
    resize(w, h) { layout(w / h); },
    setProgress(p) { state.p = p; },
    /** Intro timeline: returns a gsap timeline. Scroll stays locked until it completes. */
    playIntro() {
      state.intro = 0; state.cam = 1; state.cage = 1; state.plexus = 0;
      const tl = gsap.timeline();
      tl.to(state, { intro: 1, duration: 1, ease: 'inOut3' }, 0)
        .to(state, { cam: 0, duration: 6, ease: 'igloo_ease_1' }, 0.5)
        .to(state, { cage: 0, duration: 2, ease: 'power2.inOut' }, 3.1) // cage visible 0 - 5.1 s
        .to(state, { plexus: 1, duration: 1.6, ease: 'power2.inOut' }, 4.4);
      return tl;
    },
    skipIntro() { state.intro = 1; state.cam = 0; state.cage = 0; state.plexus = 1; },
    render(renderer, target, time, mouse) {
      const { p } = state;
      const mix = smoothstep(0, 0.6, p);
      mat.uniforms.uMix.value = mix;
      mat.uniforms.uTime.value = time;
      mat.uniforms.uIntro.value = state.intro;
      // camera: dolly + intro tilt + mouse parallax
      const c = state.cam;
      const hs = state.size.h, cx = lerp(state.shiftX, IX * hs, p), cy = lerp(0, IY * hs, p) + state.shift;
      camera.position.set(cx + mouse.sx * 0.2, cy + c * 3.4 + mouse.sy * 0.12, D * (1 - 0.34 * p) + c * 1.5);
      camera.lookAt(cx, cy + c * 2.6, 0);
      // overlays
      const fade = 1 - smoothstep(0.1, 0.6, p);
      plexus.setOpacity(state.plexus * fade);
      plexus.update(time);
      cage.material.opacity = 0.55 * state.cage;
      cage.visible = state.cage > 0.003;
      cage.rotation.y = Math.sin(time * 0.2) * 0.04;
      snow.uniforms.uTime.value = reducedMotion() ? 0 : time;
      snow.uniforms.uPx.value = target.height / (2 * Math.tan((FOV * Math.PI) / 360));
      renderer.setRenderTarget(target);
      renderer.setClearColor(COLORS.bg, 1);
      renderer.clear();
      renderer.render(scene, camera);
    },
  };
}
