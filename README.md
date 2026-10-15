# design-inspiration-skills

Clean-room studies of award-winning websites, packaged as an agent skill so any coding agent
has concrete, well-documented examples of how award-level web design is built.

Each study contains a design-token sheet, a motion spec and a breakdown of *why* the site
works, with code excerpts of every key effect, plus a runnable clean-room rebuild.

## Install

Two skills, so you choose how much lands in your project:

| Skill | Contains | Size |
|---|---|---|
| `design-inspiration` | Index, study READMEs: tokens, motion spec with code excerpts, why it works | a few MB |
| `design-inspiration-rebuilds` | Runnable Vite rebuild with images for every study | large (~2 MB per study) |

**Any agent ([Agent Skills](https://agentskills.io) CLI)**, pick one or both when prompted:

```bash
npx skills add raphaelbleier/design-inspiration-skills
# or non-interactive
npx skills add raphaelbleier/design-inspiration-skills --skill design-inspiration
```

**Claude Code plugin:**

```
/plugin install design-inspiration --marketplace raphaelbleier/design-inspiration-skills
/plugin install design-inspiration-rebuilds --marketplace raphaelbleier/design-inspiration-skills
```

Then ask your agent for an award-level site; it looks up matching studies in `INDEX.md`.

> **Status:** work in progress — pilot category in progress.

## Clean-room policy

- Not affiliated with Awwwards or with any studio whose work is studied here.
- No original code, images, fonts or copy are included. Every rebuild is written from scratch,
  uses placeholder copy, generated or freely licensed images, and open-source font substitutes.
- Every study credits and links the original site and its creators.
- Are you the creator of a studied site and want it removed? Open an
  [opt-out request](../../issues/new?template=opt-out.yml) — entries are removed on request.

## License

Code: [MIT](LICENSE). Original designs remain the intellectual property of their creators.
