/*
 * score.js - odometer score digits (the original draws MSDF glyphs in WebGL; here it is
 * a DOM column per digit, Instrument Serif upright). Each column is a strip of 0-9
 * translated by -n em (the .score font-size). The ones column rolls over .8s outQuad;
 * the tens column only changes when the ones roll 9 -> 0.
 */
export function createScore(el) {
  const cols = [0, 1].map(() => {
    const c = document.createElement('div'); c.className = 'col'
    const s = document.createElement('div'); s.className = 'strip'
    for (let i = 0; i < 10; i++) { const d = document.createElement('div'); d.textContent = i; s.append(d) }
    c.append(s); el.append(c); return s
  })
  return (n) => {
    cols[0].style.transform = `translateY(${-Math.floor(n / 10)}em)`
    cols[1].style.transform = `translateY(${-(n % 10)}em)`
  }
}
