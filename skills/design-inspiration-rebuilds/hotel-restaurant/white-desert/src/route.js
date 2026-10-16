/* Route map: section is 320vh with a sticky 100vh pin. The SVG arc is drawn by stroke-dashoffset
   (length -> 0, scrub .5, 5% -> 70%), the cyan dot rides the path via getPointAtLength, the pulse ring
   follows it, and the stat numbers count up while the arc draws. Map image drifts yPercent 6 -> -6. */
import { gsap } from 'gsap';

export function initRoute() {
  const arc = document.getElementById('arc');
  const dot = document.getElementById('pin');
  const pulse = document.getElementById('pulse');
  const len = arc.getTotalLength();
  gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });
  const stats = document.querySelectorAll('.stats strong[data-n]');
  const fmt = {
    time: (v) => { const h = Math.floor(v), m = Math.round((v - h) * 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ' HRS'; },
    km: (v) => Math.round(v).toLocaleString('en-US') + ' KM / ' + Math.round(v * 0.6214).toLocaleString('en-US') + ' MI',
  };
  const st = { p: 0 };
  gsap.timeline({ scrollTrigger: { trigger: '#route', start: 'top top', end: 'bottom bottom', scrub: 0.5 } })
    .to(st, {
      p: 1, ease: 'none', duration: 0.65,
      onUpdate() {
        arc.style.strokeDashoffset = len * (1 - st.p);
        const pt = arc.getPointAtLength(len * st.p);
        gsap.set([dot, pulse], { attr: { cx: pt.x, cy: pt.y } });
        stats.forEach((s) => (s.textContent = fmt[s.dataset.fmt](+s.dataset.n * st.p)));
      },
    }, 0.05)
    .fromTo('.route__map', { yPercent: 6 }, { yPercent: -6, ease: 'none', duration: 1 }, 0)
    .fromTo(pulse, { attr: { r: 12 } }, { attr: { r: 30 }, repeat: 5, yoyo: true, ease: 'sine.inOut', duration: 0.1 }, 0.05);
}
