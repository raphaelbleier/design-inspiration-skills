/* Technique: chapter title swap with an ellipse clip-path wipe from the baseline,
   0.9s power2.inOut, plus a 35% y drift (same shape language as the cards). */
import { gsap } from 'gsap';

export function setChapter(scene) {
  const n = document.querySelector('.ch-n'), name = document.querySelector('.ch-name');
  n.textContent = scene.dataset.n; name.textContent = scene.dataset.name;
  gsap.fromTo(name, { clipPath: 'ellipse(75% 0% at 50% 100%)', yPercent: 35 },
    { clipPath: 'ellipse(75% 130% at 50% 100%)', yPercent: 0, duration: 0.9, ease: 'power2.inOut', overwrite: true });
}
