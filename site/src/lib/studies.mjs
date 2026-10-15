import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Marked } from 'marked';
import { createHighlighter, bundledLanguages } from 'shiki';
import { parseFrontmatter } from '../../../scripts/studies.mjs';

// astro runs from site/, so the repo root is one level up.
const root = join(process.cwd(), '..');
const dir = join(root, 'skills/design-inspiration/studies');

export const REPO = 'https://github.com/raphaelbleier/design-inspiration-skills';
export const OPT_OUT = `${REPO}/issues/new?template=opt-out.yml`;

export function loadStudies() {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap(category =>
    readdirSync(join(dir, category)).filter(s => existsSync(join(dir, category, s, 'README.md'))).map(slug => {
      const md = readFileSync(join(dir, category, slug, 'README.md'), 'utf8');
      const m = parseFrontmatter(md);
      return {
        ...m, awards: m.awards ?? [], techniques: m.techniques ?? [], stack: m.stack ?? [],
        category, slug, md,
        hasThumb: existsSync(join(process.cwd(), 'public/thumbs', `${slug}.webp`)),
      };
    })).sort((a, b) => Number(b.year) - Number(a.year) || a.title.localeCompare(b.title));
}

const slugify = t => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const unescapeHtml = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

let hl;
const marked = new Marked({
  renderer: {
    heading({ tokens, depth }) {
      const html = this.parser.parseInline(tokens);
      return `<h${depth} id="${slugify(html)}">${html}</h${depth}>\n`;
    },
  },
});

// Returns { html, toc } for the README body (frontmatter and H1 stripped).
export async function renderStudy(md) {
  hl ??= await createHighlighter({ themes: ['github-light', 'github-dark'], langs: ['css', 'javascript', 'html', 'glsl', 'json', 'bash'] });
  const body = md.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/^\s*# .*\n/, '');
  let html = marked.parse(body);
  const blocks = [...html.matchAll(/<pre><code(?: class="language-([\w+-]+)")?>([\s\S]*?)<\/code><\/pre>/g)];
  for (const m of blocks) {
    let lang = m[1] ?? 'text';
    if (!hl.getLoadedLanguages().includes(lang)) {
      if (lang in bundledLanguages) await hl.loadLanguage(lang); else lang = 'text';
    }
    const out = hl.codeToHtml(unescapeHtml(m[2]), { lang, themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false });
    html = html.replace(m[0], () => `<div class="code" data-lang="${m[1] ?? ''}">${out}</div>`);
  }
  html = html.replace(/<table>/g, '<div class="tablewrap"><table>').replace(/<\/table>/g, '</table></div>');
  const toc = [...html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map(m => ({ id: m[1], text: m[2].replace(/<[^>]+>/g, '') }));
  return { html, toc };
}
