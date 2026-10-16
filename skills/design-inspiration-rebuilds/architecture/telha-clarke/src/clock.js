/** clock.js - live local time in the header, 12h with AM/PM (Intl, zone Australia/Perth), updated every 20s. */
export function initClock() {
  const el = document.querySelector('.time');
  const f = new Intl.DateTimeFormat('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Australia/Perth' });
  const tick = () => { el.textContent = f.format(new Date()).toUpperCase(); };
  tick(); setInterval(tick, 20000);
}
