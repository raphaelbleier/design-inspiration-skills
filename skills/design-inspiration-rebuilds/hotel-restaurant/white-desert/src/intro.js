/* Load intro: navy cover with wordmark; an ellipse clip-path collapses to the centre.
   1.1s `power3.inOut` after a .5s hold. Hero word letters then rise in with stagger .05. */
import { gsap } from 'gsap';

export function initIntro() {
  const intro = document.getElementById('intro');
  const letters = document.querySelectorAll('#word span');
  gsap.set(letters, { yPercent: 110 });
  gsap.timeline({ delay: 0.5, onComplete: () => intro.remove() })
    .to(intro, { clipPath: 'ellipse(0% 0% at 50% 50%)', duration: 1.1, ease: 'power3.inOut' })
    .to(letters, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: 0.05 }, '-=.5');
}
