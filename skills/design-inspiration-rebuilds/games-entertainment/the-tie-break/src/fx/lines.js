/*
 * lines.js - white court lines drawn in the fragment shader.
 *
 * Each line is a segment distance field (anti-aliased, 2 CSS px thick in landscape,
 * 1.5 in portrait) combined with the background through the OVERLAY blend with amount 1:
 *   overlay(bg, white) = bg < .5 ? 2*bg : 1     -> lines pick up the photo's hue
 *   (dark blue photo => blue line, bright photo => white line)
 * Geometry is stored as fractions of the viewport (landscape court = 100vw x 100vh,
 * like the original's ".wrapper-court--wide"). Portrait uses its own, rotated set.
 * Draw-in: a master tween P (0..1) with per-line stagger, each segment grows from a->b.
 * The net ticks ("net") have a second factor `reach`: short stubs on the home screen,
 * long dashes (leaving a hole for the centre logo) while playing.
 */
import gsap from 'gsap'
import { reduced } from '../scale.js'

export const MAX_LINES = 16

// [x0,y0,x1,y1, delay] ; kind 'net' endpoints are computed from `reach`
const LAND = [
  [0, .093, .461, .093, 0], [1, .093, .544, .093, 0],
  [0, .193, .461, .193, .04], [1, .193, .544, .193, .04],
  [0, .814, .455, .814, .08], [1, .814, .544, .814, .08],
  [0, .907, .455, .907, .12], [1, .907, .544, .907, .12],
  [.273, .193, .273, .814, .2], [.727, .193, .727, .814, .2],
  [.273, .489, .335, .489, .35], [.727, .489, .665, .489, .35],
]
/*
 * Portrait court: a 402x669 box (width min(100vw, 58.944vh), centred) with the same
 * court rotated 90deg. Landscape service lines land on y = .2496/.7593 and sidelines on
 * x = .0622/.9378 of that box. Sidelines run the full screen height with a gap at the
 * net, the net stubs are pinned to the screen edges. Returns viewport fractions.
 */
function portraitSet(W, H, reach) {
  const Wc = Math.min(W, .58944 * H), Hc = Wc * 669 / 402
  const X = (x) => ((W - Wc) / 2 + x * Wc) / W, Y = (y) => ((H - Hc) / 2 + y * Hc) / H
  const [xl, xr, yt, yb] = [X(.0622), X(.9378), Y(.2496), Y(.7593)]
  const gt = Y(.455), gb = Y(.545), r = .31 * reach
  return [
    [xl, yt, xr, yt, 0], [xr, yb, xl, yb, .05],
    [xl, 0, xl, gt, .1], [xl, 1, xl, gb, .1], [xr, 0, xr, gt, .1], [xr, 1, xr, gb, .1],
    [X(.5), yt, X(.5), Y(.319), .3], [X(.5), yb, X(.5), Y(.689), .3],
    [0, .5, X(.0622 + r), .5, .45], [1, .5, X(.9378 - r), .5, .45],
  ]
}

export function createLines() {
  const state = { P: 0, reach: 0, portrait: false, alpha: 1 }
  // net stubs (landscape): top/bottom, short on the home screen, long while playing
  const net = () => {
    const r = state.reach
    return [[.5, .095, .5, .19 + .22 * r], [.5, .905, .5, .81 - .22 * r]]
  }

  const ease = (t) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3)

  /** fill `out` (array of Vector4, px, y down) for the current frame */
  function fill(out, W, H, dpr) {
    const set = state.portrait ? portraitSet(innerWidth, innerHeight, state.reach) : LAND.concat(net().map((l) => [...l, .45]))
    const all = set.map((l) => ({ l, d: l[4] }))
    let i = 0
    for (const { l, d } of all) {
      const e = ease((state.P - d * .45) / (1 - d * .45))
      out[i++].set(l[0] * W, l[1] * H, (l[0] + (l[2] - l[0]) * e) * W, (l[1] + (l[3] - l[1]) * e) * H)
    }
    for (; i < MAX_LINES; i++) out[i].set(0, 0, 0, 0)
  }

  const drawIn = (dur = 2.2) => gsap.fromTo(state, { P: 0 }, { P: 1, duration: reduced ? .01 : dur, ease: 'none' })
  const setReach = (v, dur = 1.2) => gsap.to(state, { reach: v, duration: reduced ? .01 : dur, ease: 'power3.out' })
  return { state, fill, drawIn, setReach, thickness: (dpr) => (state.portrait ? 1.5 : 2) * dpr }
}

export const GLSL_LINES = /* glsl */ `
uniform vec4 uLines[${MAX_LINES}];
uniform float uLineTh, uLineAmt;
float segLine(vec2 p, vec4 s){
  vec2 a = s.xy, b = s.zw, ba = b - a;
  if (dot(ba, ba) < .25) return 0.;
  float h = clamp(dot(p - a, ba) / dot(ba, ba), 0., 1.);
  float d = length(p - a - ba * h);
  return 1. - smoothstep(uLineTh * .5 - .5, uLineTh * .5 + .5, d);
}
vec3 overlayBlend(vec3 b, vec3 s){
  return mix(2. * b * s, 1. - 2. * (1. - b) * (1. - s), step(.5, b));
}
vec3 courtLines(vec3 col, vec2 p){
  float m = 0.;
  for (int i = 0; i < ${MAX_LINES}; i++) m = max(m, segLine(p, uLines[i]));
  return mix(col, mix(col, overlayBlend(col, vec3(1.)), uLineAmt), m);
}
`
