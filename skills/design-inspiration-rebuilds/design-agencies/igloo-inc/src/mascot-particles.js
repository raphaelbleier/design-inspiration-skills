/**
 * Particle mascot (the original uses a GPU-compute particle cloud that morphs from noise
 * into a mascot).
 *
 * TECHNIQUE
 *  - BUILD: draw the mascot image to a 192 px canvas, mask = distance from white > .12.
 *    Blur the mask twice (box blur) -> a soft "thickness" t, which becomes z depth
 *    (sqrt(t)), so the flat picture inflates into a rounded volume. ~26k points are drawn
 *    from the masked pixels (half on the front surface, half mirrored at the back so the
 *    figure holds up when it turns). Per-point luma from the pixel gives shading.
 *  - MORPH: vertex shader mixes target -> noise cloud with uShow (1 = noise, 0 = mascot),
 *    staggered per point (aRand.x) so the figure assembles like sand, not as a blob.
 *  - BURST: uBurst pushes points outward along their random vector (click feedback).
 *  - Point sprite fakes a lit sphere (normal from gl_PointCoord) -> grainy clay look.
 *  - Size scales with 1/depth via uPx (renderH / (2 tan(fov/2))).
 */
import * as THREE from 'three';

export function createMascot(image, { count = 26000 } = {}) {
  const N = 192;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(image, 0, 0, N, N);
  const d = g.getImageData(0, 0, N, N).data;
  let mask = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) {
    const r = d[i * 4], gg = d[i * 4 + 1], b = d[i * 4 + 2];
    mask[i] = Math.max(255 - r, 255 - gg, 255 - b) / 255 > 0.12 ? 1 : 0;
  }
  const blur = (src, R) => {
    const out = new Float32Array(N * N);
    const tmp = new Float32Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let s = 0, n = 0;
      for (let k = -R; k <= R; k++) { const xx = x + k; if (xx >= 0 && xx < N) { s += src[y * N + xx]; n++; } }
      tmp[y * N + x] = s / n;
    }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let s = 0, n = 0;
      for (let k = -R; k <= R; k++) { const yy = y + k; if (yy >= 0 && yy < N) { s += tmp[yy * N + x]; n++; } }
      out[y * N + x] = s / n;
    }
    return out;
  };
  const thick = blur(blur(mask, 7), 7);
  const idx = [];
  for (let i = 0; i < N * N; i++) if (mask[i]) idx.push(i);

  const pos = new Float32Array(count * 3), rnd = new Float32Array(count * 3), luma = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const px = idx[(Math.random() * idx.length) | 0];
    const x = (px % N) + Math.random(), y = Math.floor(px / N) + Math.random();
    const t = Math.sqrt(thick[px]);
    const side = i % 2 ? 1 : -1;
    pos[i * 3] = (x / N - 0.5);
    pos[i * 3 + 1] = -(y / N - 0.5);
    pos[i * 3 + 2] = side * (0.02 + t * 0.2) * (0.75 + Math.random() * 0.25);
    rnd.set([Math.random(), Math.random(), Math.random()], i * 3);
    luma[i] = (d[px * 4] + d[px * 4 + 1] + d[px * 4 + 2]) / 765;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 3));
  geo.setAttribute('aLuma', new THREE.BufferAttribute(luma, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uShow: { value: 1 }, uTime: { value: 0 }, uPx: { value: 800 }, uSize: { value: 0.017 }, uAlpha: { value: 0 }, uBurst: { value: 0 }, uRotY: { value: 0 }, uScale: { value: 3 } },
    vertexShader: /* glsl */ `
      attribute vec3 aRand; attribute float aLuma;
      uniform float uShow, uTime, uPx, uSize, uBurst, uRotY, uScale;
      varying float vL; varying float vD;
      void main(){
        vec3 r = aRand - .5;
        vec3 cloud = r * vec3(1.5, 1.7, 1.1) + vec3(sin(uTime * .3 + aRand.y * 6.), cos(uTime * .25 + aRand.x * 6.), sin(uTime * .2 + aRand.z * 6.)) * .03;
        float k = smoothstep(0., 1., clamp(uShow * 1.4 - aRand.x * .4, 0., 1.));
        vec3 p = mix(position, cloud, k) + normalize(r + .001) * uBurst * (.3 + aRand.z * .7);
        p.y += sin(uTime * .8) * .006;
        float cs = cos(uRotY), sn = sin(uRotY);
        p = vec3(p.x * cs + p.z * sn, p.y, -p.x * sn + p.z * cs);
        vec4 mv = modelViewMatrix * vec4(p * uScale, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1.3, uSize * (.7 + aRand.y * .6) * uPx / -mv.z);
        vL = aLuma; vD = p.z;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAlpha;
      varying float vL; varying float vD;
      void main(){
        vec2 pc = gl_PointCoord * 2. - 1.;
        float d2 = dot(pc, pc); if (d2 > 1.) discard;
        vec3 n = vec3(pc.x, -pc.y, sqrt(1. - d2));
        float lit = .72 + .28 * dot(n, normalize(vec3(-.4, .6, .7)));
        vec3 base = vec3(.40, .44, .53) + (vL - .35) * .5;
        vec3 col = base * lit + vD * .35;
        gl_FragColor = vec4(col, uAlpha);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return { points, uniforms: mat.uniforms };
}
