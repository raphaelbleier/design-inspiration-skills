/*
 * ripples.js - expanding rings at the ball (paddle hits) and screen centre (countdown).
 *
 * Fragment shader: three exp(-sharpness*|dist - radius|) rings (radii r, .7r, .45r),
 * faded by smoothstep(0,.08,p) * (1-p). The sum brightens the picture and pushes the UV
 * outward a little (refraction). Hit: 800 ms outQuad, countdown: 900 ms at scale 3.
 * Up to 4 concurrent ripples in a uniform array: (x px, y px, progress, scale).
 */
import gsap from 'gsap'
import { reduced } from '../scale.js'

export const MAX_RIP = 4

export function createRipples() {
  const pool = Array.from({ length: MAX_RIP }, () => ({ x: 0, y: 0, p: 0, s: 0 }))
  let n = 0
  function trigger(x, y, scale = 1, dur = .8) {
    if (reduced) return
    const r = pool[n++ % MAX_RIP]
    gsap.killTweensOf(r)
    Object.assign(r, { x, y, p: 0, s: scale })
    gsap.to(r, { p: 1, duration: dur, ease: 'power2.out', onComplete: () => (r.s = 0) })
  }
  const fill = (out, dpr) => pool.forEach((r, i) => out[i].set(r.x * dpr, r.y * dpr, r.p, r.s))
  return { trigger, fill }
}

export const GLSL_RIPPLES = /* glsl */ `
uniform vec4 uRip[${MAX_RIP}];
float rippleAt(vec2 p, vec4 r, float H, out vec2 dir){
  dir = vec2(0.);
  if (r.w <= 0.) return 0.;
  float d = length(p - r.xy) / H;
  float rad = r.z * r.w * .09 * 2.2;
  float w = exp(-28. * abs(d - rad)) + .5 * exp(-22. * abs(d - rad * .7)) + .3 * exp(-22. * abs(d - rad * .45));
  dir = normalize(p - r.xy + .001);
  return w * smoothstep(0., .08, r.z) * (1. - r.z);
}
`
