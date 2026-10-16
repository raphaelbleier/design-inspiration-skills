/**
 * artwork.js - live clock in the nav (click cycles the city), a countdown to the next
 * full hour in the big display type, and the city list that swaps the preview image
 * (old frame fades to 0 in .4s, src swaps, fades back). Preview toggle is visual only.
 */
const ZONES = [['Oslo', 'Europe/Oslo'], ['Leeds', 'Europe/London'], ['Boston', 'America/New_York'], ['Taipei', 'Asia/Taipei']];
const pad = (n) => String(n).padStart(2, '0');

export function initArtwork() {
  const clock = document.getElementById('clock');
  let zi = 0;
  const tick = () => {
    const [name, tz] = ZONES[zi];
    clock.textContent = `${name} ${new Date().toLocaleTimeString('en-GB', { timeZone: tz })}`;
    const now = new Date();
    const left = 3600 - (now.getMinutes() * 60 + now.getSeconds());
    document.getElementById('countdown').textContent = `${pad(Math.floor(left / 3600))}:${pad(Math.floor(left / 60) % 60)}:${pad(left % 60)}`;
  };
  clock.addEventListener('click', () => { zi = (zi + 1) % ZONES.length; tick(); });
  tick(); setInterval(tick, 1000);

  const img = document.getElementById('prevImg');
  const base = import.meta.env.BASE_URL;
  document.querySelectorAll('#cities li').forEach((li) => li.addEventListener('mouseenter', () => {
    document.querySelectorAll('#cities li').forEach((o) => o.classList.toggle('on', o === li));
    img.classList.add('swap');
    setTimeout(() => { img.src = `${base}img/${li.dataset.img}.webp`; img.classList.remove('swap'); }, 400);
  }));
  const btns = document.querySelectorAll('.toggle button');
  btns.forEach((b) => b.addEventListener('click', () => btns.forEach((o) => o.classList.toggle('is-on', o === b))));
}
