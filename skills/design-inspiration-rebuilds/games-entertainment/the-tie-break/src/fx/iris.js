/*
 * iris.js - the signature "point reveal": a circular iris opens at the ball and shows a
 * sharp image over the blurred game. Constants are the original's, re-derived by hand:
 *   WIDTH  = (.06, .015, .2)   glow-ring widths          OFFSET = (0, .035, .075) ring lag
 *   GLOW   = .35  DISPLACE = 4  ZOOM = 3  (zoom eased by 1-(1-t)^3)
 * Three concentric masks m_i = smoothstep(r_i+.02, r_i-.02, d) are averaged -> soft,
 * three-step edge. Radii r_i = base - OFFSET_i, base = progress * 1.08 (distance d is
 * normalised by the farthest corner). A radial wave
 *   sin((d-r)*35 - t*6) * exp(-|d-r| * 40 / uThickness)
 * displaces the image UV outwards (amount .04 * DISPLACE * .6) and fades out at the end.
 * Image zooms 3 -> 1 over 2200 ms; progress runs 0 -> 1 over 2100 ms (outCubic).
 * playOut: same shader inverted (mask = 1 - mask) from the screen centre, 1100 ms:
 * the game opens back up as a growing circle. uThickness: 2.5 desktop, 1.5 portrait.
 * Pointer tilt: the image shifts toward the cursor, lerped at .08 (x .01 uv).
 * Reduced motion: no wave/zoom, just a .35 s wipe.
 */
import gsap from 'gsap'
import { reduced } from '../scale.js'

export function createIris() {
  const s = { on: 0, p: 0, z: 0, inv: 0, ox: 0, oy: 0, thick: 2.5, tx: 0, ty: 0, tgx: 0, tgy: 0 }
  addEventListener('pointermove', (e) => {
    s.tgx = (e.clientX / innerWidth - .5) * 2
    s.tgy = (e.clientY / innerHeight - .5) * 2
  })
  const tilt = () => { s.tx += (s.tgx - s.tx) * .08; s.ty += (s.tgy - s.ty) * .08 }

  function playIn(x, y, portrait) {
    Object.assign(s, { on: 1, p: 0, z: 0, inv: 0, ox: x, oy: y, thick: portrait ? 1.5 : 2.5 })
    const k = reduced ? .35 : 1
    gsap.to(s, { z: 1, duration: reduced ? .01 : 2.2, ease: 'power3.out' })
    return gsap.to(s, { p: 1, duration: 2.1 * k, ease: 'power3.out' }).then()
  }
  function playOut(portrait) {
    Object.assign(s, { on: 1, p: 0, z: 1, inv: 1, ox: innerWidth / 2, oy: innerHeight / 2, thick: portrait ? 1.5 : 2.5 })
    return gsap.to(s, { p: 1, duration: reduced ? .35 : 1.1, ease: 'power3.out', onComplete: () => (s.on = 0) }).then()
  }
  const active = () => s.on === 1
  return { s, playIn, playOut, tilt, active }
}

export const GLSL_IRIS = /* glsl */ `
uniform vec2 uIrisO, uTilt;
uniform float uIrisP, uIrisZ, uIrisInv, uIrisThick, uIrisOn, uIrisWave;
const vec3 IR_OFF = vec3(0., .035, .075);
const vec3 IR_W = vec3(.06, .015, .2);
vec3 irisReveal(vec3 col, vec2 p, vec2 uv, vec2 res){
  if (uIrisOn < .5) return col;
  vec2 o = uIrisO;
  float maxD = max(max(length(o), length(vec2(res.x - o.x, o.y))), max(length(vec2(o.x, res.y - o.y)), length(res - o)));
  float d = length(p - o) / maxD;
  vec3 r = uIrisP * 1.08 - IR_OFF;
  float m = (smoothstep(r.x + .02, r.x - .02, d) + smoothstep(r.y + .02, r.y - .02, d) + smoothstep(r.z + .02, r.z - .02, d)) / 3.;
  float dr = d - r.x;
  float wave = sin(dr * 35. - uTime * 6.) * exp(-abs(dr) * 40. / uIrisThick);
  vec2 dir = normalize(p - o + .001) * vec2(1., -1.);
  vec2 disp = dir * wave * .04 * 4. * .6 * uIrisWave * (1. - smoothstep(.7, 1., uIrisP)) * step(0., r.x);
  float z = mix(3., 1., uIrisZ * uIrisWave + (1. - uIrisWave));
  vec2 u = (uv - .5) / (z * 1.048) + .5 + disp + uTilt * .01;
  vec3 rev = uHasRev > .5 ? texture2D(uReveal, clamp(coverUV(u, uRevSize, res), 0., 1.)).rgb
    : mix(vec3(.34, .37, .44), vec3(.55, .58, .64), smoothstep(0., 1., u.y)) * (.9 + .1 * smoothstep(.9, .2, length(u - .5)));
  vec3 q = (d - r) / (IR_W * .5);
  vec3 g = exp(-q * q);
  float glow = (g.x + g.y * .6 + g.z * .5) * .35 * (1. - uIrisP);
  m = mix(m, 1. - m, uIrisInv);
  return mix(col, rev, m) + glow * (1. - uIrisInv * .5);
}
`
