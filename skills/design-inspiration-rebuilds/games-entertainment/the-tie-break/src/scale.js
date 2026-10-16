/*
 * scale.js - the "design unit" system.
 *
 * html font-size = 10px * min(vw / designW, vh / designH)
 *   landscape design size 1920x1080, portrait (max-width 1080 + portrait) 402x732.
 * Every size in style.css is in em, so the whole UI scales like a poster:
 *   1440x900 -> 7.5px   390x844 -> 9.7px   768x1024 -> 14px.
 * Calc-division of lengths is not portable, hence JS on resize.
 */
export const portraitQuery = matchMedia('(max-width:1080px) and (orientation:portrait)')

export function applyScale() {
  const w = innerWidth, h = innerHeight
  const portrait = portraitQuery.matches
  const [dw, dh] = portrait ? [402, 732] : [1920, 1080]
  document.documentElement.style.fontSize = 10 * Math.min(w / dw, h / dh) + 'px'
  document.body.classList.toggle('portrait', portrait)
  return portrait
}

export const isPortrait = () => portraitQuery.matches
export const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches
