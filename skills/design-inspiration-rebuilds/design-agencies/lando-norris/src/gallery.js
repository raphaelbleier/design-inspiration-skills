/**
 * gallery.js - horizontal photo gallery. The section is pinned, a very wide absolutely
 * positioned track is translated 1px per 1px of scroll (end: "+=<track overflow>"), and the
 * canvas theme + header ink are scrubbed dark green -> cream across the same distance.
 * Captions/images are positioned with CSS custom properties (--x --y --w --h in rem).
 */
import { gsap, reduced } from './scroll.js';

export function initGallery(themeCtl) {
  const sec = document.querySelector('[data-gallery]');
  const track = sec.querySelector('[data-track]');
  if (reduced) { sec.classList.add('is-native'); return; }   // CSS: overflow-x auto, no pin

  const header = document.querySelector('.header');
  const getDist = () => track.scrollWidth - window.innerWidth;
  gsap.to(track, {
    x: () => -getDist(),
    ease: 'none',
    scrollTrigger: {
      trigger: sec, start: 'top top', end: () => '+=' + getDist(), pin: true, scrub: true, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: (self) => {
        // dark -> cream across the middle 50% of the gallery
        const p = gsap.utils.clamp(0, 1, (self.progress - 0.35) / 0.4);
        themeCtl.state.mix = p; themeCtl.apply();
        const ink = p > 0.5 ? 'dark' : 'light';
        header.setAttribute('data-ink', ink);
        sec.style.setProperty('--g-ink', gsap.utils.interpolate('#dde1d2', '#282c20', p));
      },
    },
  });
}
