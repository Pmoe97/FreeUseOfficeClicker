# Theming & accessibility

How themes work in this game, why they're built this way, and what to do when you add UI.

Player-facing entry point: **Settings → 🎨 Display**. Twelve themes plus "Match System", a
90–140% text-size slider, and five accessibility switches.

| Group | Themes |
| --- | --- |
| Standard | Midnight (default), Daylight, Match System |
| Easy on the eyes | High Contrast, Dimmed, Sepia Paper, Nordic |
| Flavour | Crimson, Deep Ocean, Synthwave, Slate, Terminal, Amber CRT |

The grouping is deliberate: with thirteen cards in one flat grid, the two themes someone
came looking for because their eyes hurt would be buried among the fun ones.

---

## The problem this solves

The game grew without a central stylesheet. Colour lives in three places:

| Where | Roughly | Reachable by a stylesheet? |
| --- | --- | --- |
| The stylesheet (`src/src/srcfiles/css/`, once the main `<style>` block) | ~8.8k lines | yes |
| Inline `style="…"` in markup and JS template strings | ~4,400 attributes | **no** — inline styles beat every selector |
| Runtime-injected `<style>` from JS strings | a few blocks | yes |

An inline `style="background:#1a1a2e; color:#fff"` cannot be re-skinned from CSS at
all. Roughly 2,900 colour literals were baked in that way, which is why "just add a
light mode stylesheet" was never going to work here.

## The approach: a bridge layer

Every legacy literal was mapped **1:1** to a CSS custom property whose *dark-theme
value is identical to the literal it replaced*:

```
background: #1a1a2e     →   background: var(--l-panel)
color: #fff             →   color: var(--l-ink)
border: 1px solid #0f3460  →  border: 1px solid var(--l-line)
```

Because the dark values are unchanged, the migration was a visual no-op on the
default theme — and every other theme now has exactly one place to retune.

`tools/palette.mjs` is the single source of truth (tools live in `src/src/dev/tools/`;
run them from the repo root through the npm scripts). `npm run theme:tokens` regenerates
the theme layer inside `src/src/srcfiles/css/01-theme.css` between these sentinels:

```
/* ==== FUOC THEME LAYER · GENERATED … DO NOT EDIT BY HAND ==== */
/* ==== END FUOC THEME LAYER ==== */
```

Themes are selected by `data-fuoc-theme` on `<html>`, so `:root[data-fuoc-theme="light"]`
beats the base `:root` block on specificity regardless of source order.

## Token roles

The role decides how each theme transforms a colour:

| Role | Meaning | Light theme does |
| --- | --- | --- |
| `surface` | panel / background fill | flips to an off-white ramp |
| `line` | border, divider | flips to a light-grey stroke |
| `ink` | body text | flips to near-black |
| `accent` | brand / status hue | darkened until it clears 4.5:1 on the page |
| `onDark` (`--l-on-accent`) | **dark** ink printed on a coloured fill | goes **white** |
| `onFill` (`--l-ink-on-fill`) | **light** ink printed on a coloured fill | stays white |

The two on-fill roles are the subtle part. Ink on a coloured button must follow **the
fill**, not the page:

- Dark theme brightens accents → dark ink (`--l-on-accent`) reads best.
- Daylight *darkens* accents for page contrast → the same ink must go white.
- High Contrast brightens accents to clear 7:1 on black → white ink fails there, so
  `--l-ink-on-fill` goes black.

Which of the two a given spot needs is decided by contrast against the fill, not by
eyeballing lightness: a green `--positive` fill measures "dark" by lightness yet leaves
white text at 2.7:1.

## Adding UI

1. **Use tokens, never literals.** `var(--surface)`, `var(--text)`, `var(--danger)`.
2. **Text on a coloured fill** gets `var(--l-ink-on-fill)` or `var(--l-on-accent)` —
   not `#fff`. If you're unsure, write one, then run
   `npm run codemod:colors -- --stage=retune`, which picks the correct one by contrast.
3. **Colour + alpha**: call `fuocAlpha(colour, "44")`. Concatenating an alpha onto a
   `var()` (`var(--l-red)22`) is invalid CSS and the whole declaration is dropped.
   (Four such bugs already existed in the file and were fixed during this work.)
4. **Decorative one-offs are fine as literals** *if* they only ever sit behind ink that
   follows the fill. `npm run css:audit -- --risk` fails the moment a literal is used as
   text, which is the case that breaks a light theme.

## Two kinds of theme

**Hand-authored** (`dark`, `light`, `hc-dark`, `dim`): every one of the 197 tokens has a
value picked by hand, in a column of `STRUCTURAL`/`SEMANTIC`/`EFFECTS`. Right for the
themes that define the product's look — and unworkable beyond a handful, since each new
one is 197 more decisions.

**Recipe** (everything else): defined by a ~12-line spec in `tools/recipes.mjs` and
derived from the default theme's values. Two rules keep that safe rather than merely fast:

1. **Lightness structure is preserved; hue and saturation are not.** A recipe re-tints, it
   does not re-rank — `--l-panel-2` stays darker than `--l-panel-3`, and accents keep
   roughly the lightness they had in the default. This matters beyond aesthetics: the
   codemod already decided *per site* whether ink on a given fill should be light or dark,
   based on the default theme's accent lightness. Preserve that lightness and every one of
   those decisions stays correct.
2. **Semantic hues survive.** Money green, loss red and warning amber keep their hue
   family; only decorative hues (indigo, cyan, violet, pink…) are pulled toward the theme.
   This game's screens are full of +$ and −$ figures, so hue there carries information,
   and it doubles as the colour-blindness safety net.

Decorative hues are *compressed* toward the theme hue rather than flattened onto it, so a
palette keeps internal variety — two chips that differed by 60° still differ, by ~11°.

Every derived accent is then held to the same contrast floor as the hand-authored ones
(`forceContrast` against the theme's real page background, which is itself derived, not
declared).

## Adding a theme

Recipe (the normal case — ~12 lines):

1. Add an entry to `RECIPES` in `tools/recipes.mjs`: `mode`, `hue`, and the three ramps
   (`surface`, `line`, `ink`) plus an `accent` spec.
2. `npm run theme:tokens` — regenerates the layer and prints a contrast report.
3. `npm run theme:picker` — prints the `DisplaySettings.THEMES` table with
   swatches read from the real palette, so a card can never misrepresent its theme. Paste
   it between the `fuoc-codemod:ignore` markers in `index.html` (the inline
   display-settings boot script near the top). Give the theme a `group`
   (`Standard` / `Easy on the eyes` / `Flavour`); anything else lands in `Other` rather
   than vanishing from the picker.
4. `npm run theme:preview -- out.html` for a visual contact sheet, then re-audit in the
   browser (below).

Hand-authored: add a column to the three tables and an entry in `THEMES` with an
`accent()` transform. Only worth it if the theme needs per-token control.

**Cost:** ~8 KB of `01-theme.css` per theme. This used to matter because the single-file
artifact sat against a Perchance size ceiling (`../archive/artifact-size.md`); the file-tree
layout has no such ceiling.

## Accessibility layer

Options are `data-fuoc-*` attributes on `<html>`, applied by the DisplaySettings boot
script *before first paint* — no flash of the wrong theme.

| Attribute | Effect |
| --- | --- |
| `data-fuoc-scale` + `--ui-scale` | scales the root font size; 97% of type here is rem-based (1,963 rem vs 61 px) so nearly all text scales |
| `data-fuoc-motion="off"` | kills animations/transitions without needing the OS setting |
| `data-fuoc-flat="1"` | removes text-shadow glow, blur and translucency; swaps drop shadows for a crisp 1px edge. The main astigmatism win |
| `data-fuoc-targets="big"` | 44px minimum hit areas, 16px inputs (stops iOS focus-zoom) |
| `data-fuoc-focus="1"` | thicker, higher-contrast focus ring (a base ring is always on for keyboard users) |
| `data-fuoc-font="readable"` | Atkinson Hyperlegible → Verdana stack, tabular numerals preserved |

Preferences live in `localStorage` under `fuoc_display_settings`, deliberately **outside
the save file**: a display preference has to survive a save reset, apply on the title
screen, and work even if the save fails to load.

API: `window.DisplaySettings.get() / set(patch) / setTheme(id) / setScale(n) / toggle(key) / reset()`.
Changes fire a `fuoc:display-change` event on `window`.

## Verifying

`npm run css:audit`, `npm run theme:audit`, then in the browser:

```js
// Transitions must be killed first, or computed colours read mid-animation.
const k = document.createElement('style');
k.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}';
document.head.appendChild(k);

// Then walk every visible text node, compare its colour against its effective
// background, and flag anything under 3:1 — per theme, per tab, per modal.
```

The last full pass covered 11 tabs × 34 modals × 4 themes with **0 pairs under 3:1**,
and no horizontal overflow at 140% text with every accessibility option enabled.

Two gotchas when measuring in a headless/non-compositing preview:

- Elements with `transition: all` keep their *old* computed colour indefinitely because
  the animation timeline never advances. Kill transitions first (above).
- Emoji-only elements report meaningless contrast — their glyphs carry their own colour.
  Skip any element whose own text is only emoji.

## Files

All under `src/src/dev/tools/`:

| File | Purpose |
| --- | --- |
| `palette.mjs` | the palette table — every token, role, and per-theme value |
| `recipes.mjs` | recipe themes: a theme from a ~12-line spec |
| `gen-theme-css.mjs` | generates the theme layer; `--audit` for contrast |
| `codemod-colors.mjs` | literal → token migration, staged, with output guards |
| `css-audit.mjs` | health report, section map, literal risk list |
| `color-inventory.mjs` | classifies every literal in the source |
| `suggest-tail-tokens.mjs` | proposes palette rows for one-offs used as text |
| `color-lib.mjs` | colour maths (HSL, WCAG contrast) |
| `sources.mjs` | where the source lives; lets a pass run over every file as one string |

The codemod refuses to write unless its output guards pass: `white-space` count,
template-interpolation count, backtick balance, SVG colour attributes, prose like
"white hair" (it feeds image prompts), and tokens glued to identifiers or alpha
suffixes. An early version rewrote `white-space: nowrap` into a token — hence the
tripwires.

## Shipping a change

There is no build step: the files in the repo are what Perchance serves. After changing a
stylesheet, bump its `?v=` in `index.html` so players don't keep a cached copy — see
`ARCHITECTURE.md`.
