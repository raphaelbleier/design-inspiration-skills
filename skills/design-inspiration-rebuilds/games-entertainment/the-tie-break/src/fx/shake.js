/*
 * shake.js - camera shake, 300 ms. Amplitudes (fraction of the original's world units):
 * paddle hit .01, countdown pulse .00585, goal .1. Here: px = amp * viewportHeight * .35,
 * random direction per frame, linear decay. The offset is applied to the whole #stage
 * element via transform so GL and DOM shake together.
 */
import gsap from 'gsap'
import { reduced } from '../scale.js'

export function createShake(el) {
  const s = { a: 0 }
  function trigger(amp) {
    if (reduced) return
    gsap.killTweensOf(s)
    s.a = amp
    gsap.to(s, { a: 0, duration: .3, ease: 'none', onUpdate: tick, onComplete: tick })
  }
  function tick() {
    const px = s.a * innerHeight * .35
    el.style.transform = s.a < 1e-4 ? '' : `translate(${(Math.random() - .5) * 2 * px}px,${(Math.random() - .5) * 2 * px}px) scale(1.012)`
  }
  return { trigger }
}
