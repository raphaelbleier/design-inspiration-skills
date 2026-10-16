/*
 * hud.js - DOM paddles + ball + canvas trail, positioned from game state every frame.
 * Paddle: glassy grey bar (#b0b0b0 @ .93, white .62 outline, soft glow, drop shadow),
 * pulses on contact. Ball: spinning cream sphere with a seam (rotation follows travel)
 * and a blurred elliptical shadow. Trail: last ~16 positions drawn as tapered, fading
 * white strokes on a 2D canvas (original: gaussian-edged strip, opacity .5).
 */
import { PADDLE } from './layout.js'

export function createHud() {
  const $ = (id) => document.getElementById(id)
  const padYou = $('padYou'), padOpp = $('padOpp'), ball = $('ball'), ballB = ball.querySelector('b')
  const cv = $('trail'), ctx = cv.getContext('2d')
  let hist = [], rot = 0, last = null, dpr = 1

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2)
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr
  }

  function place(st, L) {
    const em = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const len = PADDLE * L.fw, th = 1.9 * em
    const put = (el, a, b) => {
      const [x, y] = L.pt(a, b)
      const w = L.portrait ? len : th, h = L.portrait ? th : len
      el.style.width = w + 'px'; el.style.height = h + 'px'
      el.style.transform = `translate3d(${x - w / 2}px,${y - h / 2}px,0)`
    }
    put(padYou, 0, st.pYou); put(padOpp, 1, st.pOpp)
    const [x, y] = L.pt(st.a, st.b)
    ball.style.transform = `translate3d(${x}px,${y}px,0)`
    if (last) rot += Math.hypot(x - last[0], y - last[1]) * .03 * (st.dir)
    last = [x, y]
    ballB.style.transform = `rotate(${rot}rad)`
    return [x, y]
  }

  function trail(x, y, active) {
    ctx.clearRect(0, 0, cv.width, cv.height)
    if (!active) { hist = []; return }
    hist.push([x, y]); if (hist.length > 16) hist.shift()
    ctx.lineCap = 'round'
    for (let i = 1; i < hist.length; i++) {
      const k = i / hist.length
      ctx.strokeStyle = `rgba(255,255,255,${.5 * k * k})`
      ctx.lineWidth = (1 + 9 * k) * dpr
      ctx.beginPath(); ctx.moveTo(hist[i - 1][0] * dpr, hist[i - 1][1] * dpr); ctx.lineTo(hist[i][0] * dpr, hist[i][1] * dpr); ctx.stroke()
    }
  }
  const pulse = (who) => { const el = who === 'you' ? padYou : padOpp; el.classList.add('hit'); setTimeout(() => el.classList.remove('hit'), 140) }
  const clearTrail = () => { hist = []; last = null }
  return { resize, place, trail, pulse, clearTrail, els: [padYou, padOpp, ball] }
}
