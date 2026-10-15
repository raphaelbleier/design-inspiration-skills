export const meta = {
  name: 'award-site-studies',
  description: 'Clean-room study pipeline per site: capture+analyse, rebuild, critic/fix loop (>=7), breakdown README',
  whenToUse: 'Producing design-inspiration-skills studies for a batch of approved Awwwards sites',
  phases: [
    { title: 'Analyse', detail: 'capture original + extract tokens/motion' },
    { title: 'Rebuild', detail: 'clean-room Vite rebuild from analysis only' },
    { title: 'Critic', detail: 'capture rebuild, score vs original, fix loop until >= 7' },
    { title: 'Breakdown', detail: 'write study README markdown' },
  ],
}

const REPO = '/home/bleier/Documents/Programming/design_inspiration_skills'
const PASS = 7
const MAX_FIX_ROUNDS = 2

const CRITIC_SCHEMA = {
  type: 'object',
  properties: {
    score1440: { type: 'number' }, score768: { type: 'number' }, score390: { type: 'number' },
    overall: { type: 'number' },
    fixes: { type: 'array', items: { type: 'string' } },
  },
  required: ['score1440', 'score768', 'score390', 'overall', 'fixes'],
}
const README_SCHEMA = {
  type: 'object',
  properties: { markdown: { type: 'string' } },
  required: ['markdown'],
}

const README_FORMAT = s => `Rebuild link and code excerpts:
- Intro line, exactly: Rebuild: [\`design-inspiration-rebuilds/${s.category}/${s.slug}\`](https://github.com/raphaelbleier/design-inspiration-skills/tree/main/skills/design-inspiration-rebuilds/${s.category}/${s.slug}) (fictional content, generated images, open-source fonts; installed with the optional \`design-inspiration-rebuilds\` skill). Run it with \`npm install && npm run dev\`.
- Motion Spec table: last column "Rebuild file", paths relative to the rebuild root (e.g. \`src/scroll.js\`).
- Right after the Motion Spec table add "### Key excerpts": 3-5 of the most instructive snippets from the rebuild source, each as **<effect>**: \`src/<file>\` followed by a fenced code block (js/glsl/css, max ~25 lines, decision-rich part only, "// ..." for elisions). Prefer the signature effect, the scroll setup, a reveal/transition with exact easing, and one shader if there is one.`

const LESSONS = `Lessons from earlier studies (apply them):
- Lenis/other smooth scrollers ignore window.scrollTo: scroll with \`playwright-cli -s=<session> mousewheel 0 <dy>\`.
- Always use a NAMED playwright-cli session (-s=<name>); several agents run in parallel. Close it when done.
- Hand-drawn SVG script lettering comes out illegible. For script/brush words use a free Google Font (e.g. Caveat Brush, Permanent Marker, Rock Salt, Kalam) revealed with a mask/clip animation.
- Hide fixed decorative marks while an overlay menu is open; check scrollWidth === innerWidth at 768 and 390 on every page.
- Run playwright-cli from ${REPO}/captures/<slug>/, never from inside the rebuild folder (it drops .playwright-cli/ snapshots where you run it).
- Subagents cannot write report files (.md reports); return text instead. Code/project files are fine.`

const CLEAN_ROOM = `Clean-room rules (hard):
- Never open captures/<slug>/bundles/ (original source) while building. Write all code from scratch.
- No original images, fonts, logos, videos or copy. No names or likeness of real people, real teams, real clients or real brands (incl. the studio's own client list) — invent fictional equivalents in the same tone and length.
- Fonts: closest free Google Fonts substitute for each original font.
- Images: generate ONLY with \`${REPO}/scripts/genimage.sh "<prompt>" <abs-path.png> <aspect>\` (Gemini Nano Banana via agy, Codex gpt-6-luna/gpt-image fallback; run up to 4 in parallel). Never use ComfyUI, stock photos, downloads or canvas-drawn fakes. If it exits 1, retry that image later in your run; if images still fail at the end, report which slots are missing. Convert to WebP <= 200 KB (python3 PIL), delete PNGs. ~10-25 images, reuse where sensible.
- The rebuild must not mention the original domain anywhere.`

function analysePrompt(s) {
  return `Analyse the award-winning website ${s.url} ("${s.title}" by ${s.studio}; ${s.awards}) for a clean-room study in ${REPO}.
Write ONLY into ${REPO}/captures/${s.slug}/ (gitignored, local only).

1. Run \`${REPO}/scripts/capture.sh ${s.url} ${REPO}/captures/${s.slug}/shots ${s.slug}-orig\` (3 breakpoints x 5 wheel-scroll positions; headless, so WebGL may render blank).
2. With \`playwright-cli -s=${s.slug}-an open --browser=chrome\` (headed, so WebGL renders) capture extra screenshots into captures/${s.slug}/shots-extra/: every section top at 1440x900, hero states, key interactions (menu open, hovers, page transition frames, cursor effects). Name them descriptively.
3. Download the HTML/JS/CSS bundles into captures/${s.slug}/bundles/ (curl) and inspect them (and computed styles via playwright-cli eval) for exact values.

${LESSONS}

Return (as your final text, not a file) a precise, evidence-based analysis in markdown:
## Structure — ordered sections, layout/grid, scroll behaviour.
## Design tokens — palette (hex + role), fonts (original name, weights, usage) + closest free Google Font substitute, type scale per role at 1440 and 390 (clamp() if fluid), root font-size logic, spacing, grid/containers, radii, borders, shadows.
## Motion spec — every animation: trigger, what animates, duration, easing (exact curves), stagger, library; smooth-scroll config; WebGL scenes (what is drawn, shader approach, scroll/mouse reaction); page transitions.
## Tech stack — libraries + versions, bundle weight.
## Why award-worthy — 3-5 key decisions + anti-patterns it avoids.
## Rebuild notes — which effects need WebGL vs CSS/GSAP, image slots with aspect ratio + mood description, section-by-section build plan.
## Evidence — list of screenshot files in shots-extra/ the builder should look at.`
}

function rebuildPrompt(s, analysis) {
  return `Build a CLEAN-ROOM rebuild of the award-winning site "${s.title}" (${s.awards}, by ${s.studio}) for the public repo ${REPO}. Goal: visually and in motion as close as possible to the original, so coding agents learn how award-level sites are built.

Inputs: the analysis below, plus screenshots you should Read: ${REPO}/captures/${s.slug}/shots/ (<WxH>-<scroll%>.png) and ${REPO}/captures/${s.slug}/shots-extra/.

${CLEAN_ROOM}

${LESSONS}

Output: ${REPO}/skills/design-inspiration-rebuilds/${s.category}/${s.slug}/ — self-contained Vite project:
- package.json with exact versions, scripts dev/build/preview; Vite base './' so dist works under any sub-path; commit-ready package-lock.json; .gitignore for node_modules and dist.
- Use the original's real stack where it is a public library (GSAP + ScrollTrigger/SplitText, Lenis, Three.js/OGL, Barba/Taxi-like transitions...). No framework unless the original's look depends on it.
- One module per effect under src/ with header comments explaining the technique and exact values (agents learn from these files).
- prefers-reduced-motion respected. Responsive at 1440, 768, 390.
- Do NOT write any README.md (another stage writes the study README).

Verify: npm install && npm run build green. Run \`npx vite preview --port ${s.port} --strictPort\` in background, screenshot with your own named session -s=${s.slug}-rb at 1440/768/390, compare with the original shots, iterate until close. Stop the preview server (kill by PID, never pkill -f with a pattern that matches your own shell) and close your session.

Return: files created, image prompts used, deviations from the original and why, anything unfinished.

=== ANALYSIS ===
${analysis}`
}

function criticPrompt(s) {
  return `You are a harsh, independent design critic. Judge how faithfully a clean-room rebuild reproduces "${s.title}" (${s.url}). Content is intentionally different (fictional names, generated images, substitute fonts) — do NOT penalise different content. Judge layout/grid, proportions, type scale & hierarchy, palette, spacing rhythm, section order, signature visual elements, motion/interaction fidelity, responsive behaviour, craft.

Steps:
1. cd ${REPO}/skills/design-inspiration-rebuilds/${s.category}/${s.slug} && npm install --silent && npm run build, then start \`npx vite preview --port ${s.port} --strictPort\` in background (remember its PID).
2. rm -rf ${REPO}/captures/${s.slug}/rebuild-shots && ${REPO}/scripts/capture.sh http://localhost:${s.port}/ ${REPO}/captures/${s.slug}/rebuild-shots ${s.slug}-cap
3. Compare rebuild-shots/ against ${REPO}/captures/${s.slug}/shots/ (same naming) and shots-extra/ (headed, use for WebGL heroes). Build side-by-side composites with python3 PIL in ${REPO}/captures/${s.slug}/critic-${s.slug}/ and look at them.
4. Check motion live with \`playwright-cli -s=${s.slug}-cr\` (scroll with mousewheel; menu; hovers; transitions; scrollWidth vs innerWidth at 768 and 390 on every page). Close the session, kill the preview by PID.
Write nothing in the repo.

Return scores 1-10 per breakpoint and overall (weighted; >= ${PASS} = done) and up to 10 prioritised, concrete fixes (what, where, what the original does, precise fix).`
}

function fixPrompt(s, critic, round) {
  return `Critic round ${round} scored the clean-room rebuild of "${s.title}" ${critic.overall}/10 (1440 ${critic.score1440}, 768 ${critic.score768}, 390 ${critic.score390}); done needs >= ${PASS}.
Rebuild: ${REPO}/skills/design-inspiration-rebuilds/${s.category}/${s.slug}/. Reference: ${REPO}/captures/${s.slug}/shots/, shots-extra/ and rebuild-shots/.

${CLEAN_ROOM}

${LESSONS}

Apply these fixes, most impactful first:
${critic.fixes.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Verify with your own named session -s=${s.slug}-fx${round} on a preview at port ${s.port} (--strictPort; kill by PID after), npm run build green. Return a short list of what changed and what you couldn't fix.`
}

function readmePrompt(s, analysis, critic) {
  return `Write the study README for the clean-room study of "${s.title}". Read the rebuild source in ${REPO}/skills/design-inspiration-rebuilds/${s.category}/${s.slug}/src/ so every Motion Spec row points to the real file and the excerpts are real code. Use ${REPO}/skills/design-inspiration/studies/design-agencies/lando-norris/README.md as the exact format template (frontmatter keys, section names, tone, length).

Frontmatter: title: ${s.title} / url: ${s.url} / studio: ${s.studio} / awards: [${s.awards}] / year: ${s.year} / category: ${s.category} / techniques: [kebab-case list] / stack: [lowercase library list].
${README_FORMAT(s)}
Required sections, exactly these headings: "## Design Tokens", "## Motion Spec", "## Why Award-Worthy", "## Credits". Credits must say the original is the IP of its creators, list the awards, and state that the rebuild contains no original code/assets/copy. Do not copy any Awwwards text.
Do not write the file — return the full markdown in the schema.

Final critic score: ${critic.overall}/10.

=== ANALYSIS ===
${analysis}`
}

const sites = args

const results = await pipeline(
  sites,
  s => agent(analysePrompt(s), { label: `analyse:${s.slug}`, phase: 'Analyse' }),
  async (analysis, s) => {
    await agent(rebuildPrompt(s, analysis), { label: `rebuild:${s.slug}`, phase: 'Rebuild' })
    return analysis
  },
  async (analysis, s) => {
    let critic = await agent(criticPrompt(s), { label: `critic:${s.slug}#1`, phase: 'Critic', schema: CRITIC_SCHEMA })
    const history = [critic.overall]
    for (let round = 1; critic.overall < PASS && round <= MAX_FIX_ROUNDS; round++) {
      await agent(fixPrompt(s, critic, round), { label: `fix:${s.slug}#${round}`, phase: 'Critic' })
      critic = await agent(criticPrompt(s), { label: `critic:${s.slug}#${round + 1}`, phase: 'Critic', schema: CRITIC_SCHEMA })
      history.push(critic.overall)
    }
    log(`${s.slug}: critic ${history.join(' -> ')}`)
    return { analysis, critic, history }
  },
  async ({ analysis, critic, history }, s) => {
    const readme = await agent(readmePrompt(s, analysis, critic), { label: `readme:${s.slug}`, phase: 'Breakdown', schema: README_SCHEMA })
    return { slug: s.slug, category: s.category, history, critic, readme: readme.markdown }
  },
)
return results