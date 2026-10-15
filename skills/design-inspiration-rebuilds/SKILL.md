---
name: design-inspiration-rebuilds
description: Runnable clean-room rebuilds (Vite projects with images) of the award-winning websites studied in the design-inspiration skill. Use when a design-inspiration study's Motion Spec or excerpts are not enough and you need the complete working implementation of an effect - WebGL scene, shader, scroll choreography, page transition - to read or run.
---

# Design inspiration: runnable rebuilds

Companion to the `design-inspiration` skill. Every folder `<category>/<slug>/` is a
self-contained Vite project that rebuilds one studied site clean-room (own code, fictional
content, generated images, open-source fonts). The study README with tokens, motion spec and
reasoning lives in `design-inspiration/studies/<category>/<slug>/README.md`.

## How to use

1. Find the study first via the `design-inspiration` skill's INDEX.md; its Motion Spec names the
   file for each effect (paths relative to the rebuild root, e.g. `src/scroll.js`).
2. Read that file here: `<category>/<slug>/src/...`. Every module starts with a header comment
   explaining the technique and its exact values.
3. To see it run: `cd <category>/<slug> && npm install && npm run dev`.

## Rules

- Learn the technique, then write your own implementation for the project's brand. Don't ship
  a rebuild's code, images or fictional copy as a product.
- Keep `prefers-reduced-motion` handling when you adapt an effect.
