// Technique: letter masks. Each giant letter sits in an overflow:hidden box and rises from yPercent 105
// with a 0.07s stagger, 1.1s expo-out ("power4.out"). Statement words slide up from their own line mask on
// scroll (start 'top 90%'). Headline letters drift apart slightly while scrolling out (scrub).
export function intro(gsap, ScrollTrigger) {
  gsap.from('.ltr', { yPercent: 105, duration: 1.1, ease: 'power4.out', stagger: 0.07, delay: 0.1 });
  gsap.from('.nav > *, .city', { opacity: 0, duration: 0.8, delay: 0.7, stagger: 0.1 });
  const st = document.getElementById('statement');
  gsap.from(st, { yPercent: 18, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.5 });
  gsap.to('.ltr', {
    yPercent: (i) => -8 - i * 3, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.from('.foot > *', {
    y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.12,
    scrollTrigger: { trigger: '.foot', start: 'top 80%', once: true },
  });
}
