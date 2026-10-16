// Technique: inline thumbnails inside the headline. Two slots, each cycles hard-cut through its own image set
// every 1.3s / 1.7s (no crossfade; opacity flips instantly, the cut is the look).
const sets = {
  a: ['portrait-red', 'portrait-mono', 'portrait-pink', 'collage-eye'],
  b: ['sneaker', 'pearl', 'object-chrome', 'poster-wave'],
};
export function cycle(reduce) {
  document.querySelectorAll('.thumb').forEach((el, k) => {
    const imgs = sets[el.dataset.set].map((n) => {
      const i = new Image(); i.src = `${import.meta.env.BASE_URL}img/${n}.webp`; i.alt = '';
      el.appendChild(i); return i;
    });
    let n = 0; imgs[0].classList.add('on');
    if (reduce) return;
    setInterval(() => {
      imgs[n].classList.remove('on'); n = (n + 1) % imgs.length; imgs[n].classList.add('on');
    }, k ? 1700 : 1300);
  });
}
