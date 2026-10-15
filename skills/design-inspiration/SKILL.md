---
name: design-inspiration
description: Clean-room studies of award-winning websites (Awwwards Site of the Year / Month / Day, Developer Award) with design tokens, motion specs, the reasoning behind each design, and code excerpts of every key effect. Use when designing or building a website that should look and feel award-level - picking a visual direction, a type system, scroll or page-transition motion, WebGL effects - or when asked to make a site look "premium", "like an Awwwards site", or less generic.
---

# Design inspiration: award-winning website studies

Each study dissects one award-winning site and rebuilds it clean-room (own code, placeholder
copy, generated images, open-source fonts). Use the studies as references for *decisions*, not
as templates to clone.

## How to use

1. Open [INDEX.md](INDEX.md). Pick 1-3 studies whose **category** matches the project's industry
   or whose **technique** matches the effect you need.
2. Read each chosen study's `README.md`:
   - **Design Tokens** - colors, type scale, spacing, grid, radii, easing as CSS variables.
   - **Motion Spec** - every animation with trigger, duration, easing, stagger and library.
   - **Why Award-Worthy** - the decisions that make it work, and the anti-patterns it avoids.
3. The **Key excerpts** under each Motion Spec hold the essential code. For a complete,
   runnable implementation, use the optional `design-inspiration-rebuilds` skill (folder
   `<category>/<slug>/`, or the GitHub link in the study's intro) and open the file the
   Motion Spec names.

## Rules

- Adapt, don't copy: take the *principles* (contrast, rhythm, restraint, motion timing) and
  apply them to the project's own brand and content.
- Combine at most one "hero" technique (e.g. WebGL scene) with a calm supporting system;
  award sites are restrained everywhere except their signature moment.
- Keep the studies' easing curves and durations as starting values; tune by eye.
- Respect `prefers-reduced-motion` the way the rebuilds do.
