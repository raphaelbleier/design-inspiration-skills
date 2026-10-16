// Technique: scrubbed intro. Panel width 100vw -> 20vw over the first 100vh while the title shrinks
// from clamp(56px,11vw,190px) to 32px and the chapter list / footer fade in. Desktop only; on mobile the panel is the hero.
// Values: scrub true, ease none (scroll is already smoothed by Lenis), toc fades in over the last 30%.
import gsap from 'gsap';
export function initHero() {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    const big = Math.min(Math.max(innerWidth * 0.11, 56), 190);
    gsap.set('#title', { fontSize: big, top: '38vh' });
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#spacer', start: 'top top', end: 'bottom top', scrub: true } });
    tl.to(':root', { '--pw': '20vw' }, 0).to('#title', { fontSize: 32, top: 62 }, 0)
      .to(['#toc', '.panel__foot'], { opacity: 1, duration: .3 }, .7);
  });
  mm.add('(min-width: 901px) and (prefers-reduced-motion: reduce)', () => {
    gsap.set(':root', { '--pw': '20vw' }); gsap.set(['#toc', '.panel__foot'], { opacity: 1 });
  });
}
