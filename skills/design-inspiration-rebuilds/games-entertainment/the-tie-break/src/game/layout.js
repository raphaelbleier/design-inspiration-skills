/*
 * layout.js - maps game space to the screen.
 * Game space: a = 0..1 along the court length (0 = player side), b = 0..1 across.
 * Landscape: a -> x (player left), b -> y inside the outer side lines (9.3%..90.7% of vh).
 * Portrait : axis rotated 90deg, a -> y (player at the bottom), b -> x (inside the portrait court box: 6.2%..93.8% of its width).
 */
import { isPortrait } from '../scale.js'

export function getLayout() {
  const W = innerWidth, H = innerHeight, portrait = isPortrait()
  let x0, x1, y0, y1
  if (!portrait) { x0 = .025 * W; x1 = .975 * W; y0 = .093 * H; y1 = .907 * H }
  else {
    const Wc = Math.min(W, .58944 * H), ox = (W - Wc) / 2
    x0 = ox + .0622 * Wc; x1 = ox + .9378 * Wc; y0 = .955 * H; y1 = .045 * H
  }
  const fl = portrait ? Math.abs(y0 - y1) : x1 - x0 // length in px
  const fw = portrait ? x1 - x0 : y1 - y0 // width in px
  const pt = portrait ? (a, b) => [x0 + b * (x1 - x0), y0 + a * (y1 - y0)] : (a, b) => [x0 + a * (x1 - x0), y0 + b * (y1 - y0)]
  return { W, H, portrait, fl, fw, pt }
}
export const PADDLE = .19 // paddle length as a fraction of the court width
