/**
 * Shared helpers for the image-plate scenes.
 *
 * TECHNIQUE: the original draws photogrammetry meshes; this rebuild uses generated
 * image "plates" on a plane inside a real perspective scene. The camera dolly/tilt
 * gives parallax, shaders add fog, bloom and dissolves, and 3D particles / lines sit
 * in front of the plate so they move at a different depth.
 * Colour management is OFF everywhere: textures, shaders and render targets all
 * work in plain display values, so what a shader writes is what you see.
 */
import * as THREE from 'three';

THREE.ColorManagement.enabled = false;

const loader = new THREE.TextureLoader();
export function loadTexture(url) {
  return new Promise((res, rej) =>
    loader.load(
      url,
      (t) => {
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.anisotropy = 4;
        res(t);
      },
      undefined,
      rej,
    ),
  );
}

/** Size a plane so it covers the viewport at `dist` for a camera `fov` (deg). */
export function coverSize(imgAspect, viewAspect, dist, fov, margin = 1) {
  const vh = 2 * dist * Math.tan((fov * Math.PI) / 360);
  const vw = vh * viewAspect;
  let w, h;
  if (viewAspect > imgAspect) {
    w = vw * margin;
    h = w / imgAspect;
  } else {
    h = vh * margin;
    w = h * imgAspect;
  }
  return { w, h, vw, vh };
}

export const PLATE_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }
`;

/** value noise + fbm shared by several fragment shaders */
export const NOISE_GLSL = /* glsl */ `
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash21(i), hash21(i + vec2(1,0)), f.x), mix(hash21(i + vec2(0,1)), hash21(i + vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 5; i++){ s += a * vnoise(p); p *= 2.03; a *= .5; } return s; }
`;

/**
 * Cool-grey colour grade: desaturates the (too blue) generated plates towards the
 * #A0A5B1 snow world while keeping a hint of icy blue.
 */
export const GRADE_GLSL = /* glsl */ `
vec3 grade(vec3 c, float amount){
  float l = dot(c, vec3(.299, .587, .114));
  vec3 g = mix(vec3(l), c, .32);
  g = mix(g, vec3(l) * vec3(.93, .96, 1.02) + .035, .12);
  g = pow(max(g, vec3(0.)), vec3(1.3)) * .84; // darken: generated plates are far brighter than the #A0A5B1 world
  return mix(c, g, amount);
}
`;

export const mouseState = { x: 0, y: 0, sx: 0, sy: 0, px: 0, py: 0, vx: 0, vy: 0 };
