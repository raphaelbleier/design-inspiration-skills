// Technique: two-slide quote switcher, opacity cross-fade .7s cubic-bezier(.65,.05,0,1), auto-advance 6s.
export function initQuotes() {
  const qs = [...document.querySelectorAll('.q')], ds = [...document.querySelectorAll('.dots button')];
  let i = 0, timer;
  const go = (n) => { i = n; qs.forEach((q, k) => q.classList.toggle('on', k === n)); ds.forEach((d, k) => d.classList.toggle('on', k === n)); };
  ds.forEach((d, k) => d.addEventListener('click', () => { go(k); clearInterval(timer); }));
  timer = setInterval(() => go((i + 1) % qs.length), 6000);
}
