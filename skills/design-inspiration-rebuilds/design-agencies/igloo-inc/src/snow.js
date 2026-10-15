/**
 * Falling snow / dust: one THREE.Points, all motion in the vertex shader.
 *
 * TECHNIQUE: each flake has a fixed seed (x,y,z,size). Position = fract(seed + time*velocity)
 * wrapped into a box, so there is no per-frame JS and no respawn logic. Wind adds a slow
 * sine sway. Point size is world-size -> pixels via uPx (renderH / (2*tan(fov/2))) / viewDepth,
 * so flakes get bigger as the camera dollies in. Alpha fades at the box ends.
 */
import * as THREE from 'three';

export function createSnow({ count = 1400, box = [10, 7, 7], fall = 0.05, wind = 0.012, size = 0.03, alpha = 0.8, tint = [0.92, 0.95, 1] } = {}) {
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count * 4; i++) seeds[i] = Math.random();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: {
      uTime: { value: 0 }, uPx: { value: 800 }, uAlpha: { value: alpha }, uBox: { value: new THREE.Vector3(...box) },
      uFall: { value: fall }, uWind: { value: wind }, uSize: { value: size }, uTint: { value: new THREE.Vector3(...tint) },
    },
    vertexShader: /* glsl */ `
      attribute vec4 aSeed; uniform float uTime, uPx, uFall, uWind, uSize; uniform vec3 uBox;
      varying float vA;
      void main(){
        vec3 p = aSeed.xyz;
        p.y = fract(p.y - uTime * uFall * (.5 + aSeed.w));
        p.x = fract(p.x + uTime * uWind * (.4 + aSeed.w) + sin(uTime * .4 + aSeed.z * 20.) * .01);
        vec3 w = (p - .5) * uBox;
        vec4 mv = modelViewMatrix * vec4(w, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1., uSize * (.4 + aSeed.w) * uPx / max(.1, -mv.z));
        vA = smoothstep(0., .08, p.y) * smoothstep(1., .92, p.y) * (.35 + .65 * aSeed.w);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAlpha; uniform vec3 uTint; varying float vA;
      void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .1, d) * vA * uAlpha; gl_FragColor = vec4(uTint, a); }`,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return { points: pts, uniforms: mat.uniforms };
}
