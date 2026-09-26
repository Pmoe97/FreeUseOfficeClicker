# `src/src/ref/` — design documents

Prose, not code. The code is the truth about what the game *does*; these documents record
what it is *for*, what was decided, and why.

| Folder | Holds | Lifecycle |
|---|---|---|
| **`structural/`** | Always-current reference, updated whenever the code moves under it. | Living |
| **`wip/`** | Plans and proposals with work still outstanding. | Moves to `complete/` |
| **`complete/`** | Finished work, kept as design record. (Empty so far.) | Terminal |
| **`archive/`** | Superseded or historical. Not maintained, not authoritative. | Terminal |

## Start here

- **How the game is laid out and loads** → [`structural/ARCHITECTURE.md`](structural/ARCHITECTURE.md)
- **Themes, colour tokens, accessibility options** → [`structural/theming.md`](structural/theming.md)

## Contents

| Doc | Status |
|---|---|
| `structural/ARCHITECTURE.md` | File tree, load order, the cross-file hoisting rule, cache busting, shipping, local dev, file map. |
| `structural/theming.md` | The theme system: bridge tokens, palette/recipes, the a11y layer, tooling. |
| `wip/game-audit-2026-09-26.md` | Whole-game audit: 5 high / 13 medium / 9 low bugs, unwired systems, QoL, and 4 questions for the user. Findings only — nothing fixed yet. |
| `wip/wardrobe-design.md` | NPC wardrobe system — proposal, not implemented. |
| `archive/artifact-size.md` | Where the bytes went in the single-file era and the minify build. Superseded by the file tree. |

Everything under `src/src/` ships to Perchance with the game, this folder included.
