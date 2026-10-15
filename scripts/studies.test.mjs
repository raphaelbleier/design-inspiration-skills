import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateStudy, buildIndex } from './studies.mjs';

const VALID = `---
title: Example Site
url: https://example-original.com
studio: Example Studio
awards: [SOTY 2025]
year: 2025
category: design-agencies
techniques: [webgl, page-transitions]
stack: [lenis, three]
---

## Design Tokens
x
## Motion Spec
\`\`\`js
gsap.to(el, { y: 0 });
\`\`\`
## Why Award-Worthy
x
## Credits
x
`;

function study(readme = VALID, files = { 'index.html': '<h1>Rebuild</h1>' }) {
  const dir = mkdtempSync(join(tmpdir(), 'study-'));
  writeFileSync(join(dir, 'README.md'), readme);
  mkdirSync(join(dir, 'rebuild'));
  writeFileSync(join(dir, 'rebuild', 'package.json'), '{}');
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, 'rebuild', name), body);
  return dir;
}

test('a complete study passes', () => {
  assert.deepEqual(validateStudy(study()), []);
});

test('a missing section is reported', () => {
  const errors = validateStudy(study(VALID.replace(/## Motion Spec\n[\s\S]*?(?=## Why)/, '')));
  assert.deepEqual(errors, ['missing section: Motion Spec']);
});

test('a Motion Spec without a code excerpt is reported', () => {
  const errors = validateStudy(study(VALID.replace(/```js[\s\S]*?```\n/, 'x\n')));
  assert.deepEqual(errors, ['Motion Spec has no code excerpt']);
});

test('a rebuild outside the study folder is validated', () => {
  const dir = study();
  const rebuild = join(dir, 'rebuild');
  writeFileSync(join(rebuild, 'main.js'), 'fetch("https://example-original.com/api")');
  const moved = mkdtempSync(join(tmpdir(), 'study-'));
  writeFileSync(join(moved, 'README.md'), VALID);
  assert.deepEqual(validateStudy(moved, { rebuild }), ['original-domain reference: rebuild/main.js']);
});

test('a missing frontmatter key is reported', () => {
  const errors = validateStudy(study(VALID.replace('studio: Example Studio\n', '')));
  assert.deepEqual(errors, ['missing frontmatter: studio']);
});

test('a rebuild loading assets from the original domain is rejected', () => {
  const dir = study(VALID, { 'index.html': '<img src="https://cdn.example-original.com/hero.jpg">' });
  assert.deepEqual(validateStudy(dir), ['original-domain reference: rebuild/index.html']);
});

test('a rebuild file identical to a captured original file is rejected', () => {
  const dir = study(VALID, { 'index.html': '<h1>Rebuild</h1>', 'logo.svg': '<svg>original</svg>' });
  const captures = mkdtempSync(join(tmpdir(), 'captures-'));
  mkdirSync(join(captures, 'bundles'));
  writeFileSync(join(captures, 'bundles', 'logo.svg'), '<svg>original</svg>');
  assert.deepEqual(validateStudy(dir, { captures }), ['copied from original: rebuild/logo.svg']);
});

test('a study without a rebuild is rejected', () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-'));
  writeFileSync(join(dir, 'README.md'), VALID);
  assert.deepEqual(validateStudy(dir), ['missing rebuild/package.json', 'missing rebuild/index.html']);
});

test('the index lists studies by category and by technique', () => {
  const index = buildIndex([
    { path: 'studies/design-agencies/a', title: 'A', category: 'design-agencies', techniques: ['webgl'], awards: ['SOTY 2025'] },
    { path: 'studies/fashion/b', title: 'B', category: 'fashion', techniques: ['webgl', 'typography'], awards: ['SOTD 2024'] },
  ]);
  assert.equal(index, `# Study Index

## By category

### design-agencies
- [A](studies/design-agencies/a/README.md) — SOTY 2025 — webgl

### fashion
- [B](studies/fashion/b/README.md) — SOTD 2024 — webgl, typography

## By technique

### typography
- [B](studies/fashion/b/README.md)

### webgl
- [A](studies/design-agencies/a/README.md)
- [B](studies/fashion/b/README.md)
`);
});

test('a study without a README is reported, not crashed on', () => {
  const dir = study();
  rmSync(join(dir, 'README.md'));
  assert.deepEqual(validateStudy(dir), ['missing README.md']);
});
