/* MEDIA PLANE HOVER (DOM approximation of the WebGL plane shader)
   original: uHover tweened to 1 over 2 s, 3% inward scale, slow sin "breathe", a noise-masked
   circle around the cursor (darken ~6%, desaturate 10%), global 20% darken.
   here:    .media scales to .97 over 2 s (CSS), the image breathes 1.06 <-> 1.10 over 9 s,
            .media__veil darkens .20 -> .32, and .media__spot is a 150px radial shade that
            follows the pointer through --mx/--my. A parallax pass moves each image inside its
            frame by +-6% of its height against the scroll (original uMaskParallax .13). */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { state } from './state.js';
gsap.registerPlugin(ScrollTrigger);

export function mountMedia(root) {
  root.querySelectorAll('.media').forEach((m) => {
    m.addEventListener('pointermove', (e) => {
      const r = m.getBoundingClientRect(), s = m.querySelector('.media__spot');
      s.style.setProperty('--mx', `${e.clientX - r.left}px`); s.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  });
  if (state.reduced) return;
  root.querySelectorAll('.pmedia img, [data-parallax]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  root.querySelectorAll('.pitem--media').forEach((it) => {
    gsap.fromTo(it.querySelector('.media img'), { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: it, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}
