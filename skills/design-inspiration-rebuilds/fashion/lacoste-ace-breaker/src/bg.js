// Background court slideshow. Technique: 4 stacked images, each fades in over 1.6s power1.inOut
// while slowly scaling 1.08 -> 1 over 9s; one new image every 5s (gsap.timeline repeat -1).
import gsap from 'gsap';
export function initBg(reduced) {
  const imgs = gsap.utils.toArray('.bg-img');
  if (reduced) return gsap.set(imgs[0], { opacity: 1, scale: 1 });
  const tl = gsap.timeline({ repeat: -1 });
  imgs.forEach((el, i) => {
    tl.fromTo(el, { opacity: 0, scale: 1.08 }, { opacity: 1, duration: 1.6, ease: 'power1.inOut' }, i * 5)
      .to(el, { scale: 1, duration: 9, ease: 'none' }, i * 5)
      .to(el, { opacity: 0, duration: 1.6, ease: 'power1.inOut' }, i * 5 + 5.4);
  });
  tl.set({}, {}, imgs.length * 5);
}
