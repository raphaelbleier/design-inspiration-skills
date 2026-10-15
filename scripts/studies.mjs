import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const KEYS = ['title', 'url', 'studio', 'awards', 'year', 'category', 'techniques', 'stack'];
const SECTIONS = ['Design Tokens', 'Motion Spec', 'Why Award-Worthy', 'Credits'];
const SKIP = new Set(['node_modules', 'dist', '.astro']);

// Flat YAML subset: `key: value` and `key: [a, b]`.
export function parseFrontmatter(md) {
  const block = md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  return Object.fromEntries(block.split('\n').filter(l => l.includes(':')).map(l => {
    const i = l.indexOf(':');
    const v = l.slice(i + 1).trim();
    return [l.slice(0, i).trim(), v.startsWith('[') ? v.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean) : v];
  }));
}

function files(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter(e => e.isFile() && !e.parentPath.split('/').some(p => SKIP.has(p)))
    .map(e => join(e.parentPath, e.name));
}

const hash = f => createHash('sha256').update(readFileSync(f)).digest('hex');

// `captures`: local-only folder with downloaded original files; any byte-identical file in the rebuild is a copy.
export function validateStudy(dir, { captures } = {}) {
  if (!existsSync(join(dir, 'README.md'))) return ['missing README.md'];
  const md = readFileSync(join(dir, 'README.md'), 'utf8');
  const meta = parseFrontmatter(md);
  const rebuild = join(dir, 'rebuild');
  const host = meta.url ? new URL(meta.url).hostname.replace(/^www\./, '') : null;
  const originals = new Set(files(captures).map(hash));
  const rebuildFiles = files(rebuild);
  return [
    ...KEYS.filter(k => !meta[k]?.length).map(k => `missing frontmatter: ${k}`),
    ...SECTIONS.filter(s => !md.includes(`\n## ${s}\n`)).map(s => `missing section: ${s}`),
    ...['package.json', 'index.html'].filter(f => !existsSync(join(rebuild, f))).map(f => `missing rebuild/${f}`),
    ...rebuildFiles.filter(f => host && readFileSync(f, 'utf8').includes(host))
      .map(f => `original-domain reference: ${relative(dir, f)}`),
    ...rebuildFiles.filter(f => originals.has(hash(f))).map(f => `copied from original: ${relative(dir, f)}`),
  ];
}

export function buildIndex(studies) {
  const link = s => `[${s.title}](${s.path}/README.md)`;
  const group = (keysOf) => {
    const m = new Map();
    for (const s of studies) for (const k of keysOf(s)) m.set(k, [...(m.get(k) ?? []), s]);
    return [...m].sort(([a], [b]) => a.localeCompare(b));
  };
  const byCategory = group(s => [s.category]).map(([c, ss]) =>
    `### ${c}\n${ss.map(s => `- ${link(s)} — ${s.awards.join(', ')} — ${s.techniques.join(', ')}`).join('\n')}\n`);
  const byTechnique = group(s => s.techniques).map(([t, ss]) =>
    `### ${t}\n${ss.map(s => `- ${link(s)}`).join('\n')}\n`);
  return `# Study Index\n\n## By category\n\n${byCategory.join('\n')}\n## By technique\n\n${byTechnique.join('\n')}`;
}

// CLI: validate every study, then regenerate the index. CI runs this and fails on a stale INDEX.md via git diff.
if (import.meta.url === `file://${process.argv[1]}`) {
  const skill = new URL('../skills/design-inspiration/', import.meta.url).pathname;
  const root = new URL('../', import.meta.url).pathname;
  const dirs = existsSync(join(skill, 'studies'))
    ? readdirSync(join(skill, 'studies')).flatMap(c => readdirSync(join(skill, 'studies', c)).map(s => join('studies', c, s)))
    : [];
  let failed = false;
  const studies = dirs.map(path => {
    const errors = validateStudy(join(skill, path), { captures: join(root, 'captures', path.split('/').pop()) });
    for (const e of errors) console.error(`${path}: ${e}`);
    failed ||= errors.length > 0;
    return errors.includes('missing README.md') ? null : { path, ...parseFrontmatter(readFileSync(join(skill, path, 'README.md'), 'utf8')) };
  });
  writeFileSync(join(skill, 'INDEX.md'), buildIndex(studies.filter(Boolean)));
  console.log(`${studies.length} studies, ${failed ? 'FAILED' : 'ok'}`);
  process.exit(failed ? 1 : 0);
}
