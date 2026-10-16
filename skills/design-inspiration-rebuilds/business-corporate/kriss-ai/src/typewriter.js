/* Typewriter loop: types a phrase at 55ms/char, holds 1.6s, deletes at 28ms/char, next phrase. */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export function typeLoop(el, phrases) {
  if (reduce) { el.textContent = phrases[0]; return; }
  let i = 0, n = 0, del = false;
  const tick = () => {
    const full = phrases[i];
    n += del ? -1 : 1;
    el.textContent = full.slice(0, n);
    let wait = del ? 28 : 55;
    if (!del && n === full.length) { del = true; wait = 1600; }
    else if (del && n === 0) { del = false; i = (i + 1) % phrases.length; wait = 350; }
    setTimeout(tick, wait);
  };
  tick();
}
