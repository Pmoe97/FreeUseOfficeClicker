# Artifact size: what's in it, and what's left to cut

Perchance refuses to save an oversized generator. The message is explicit:

> There's too much text in this generator to save it to Perchance's database. Can you
> perhaps break it into several smaller generators that you import into the main one?
> Note that perchance.org/upload can be used to upload large amounts of data.

A 3,952,048-byte artifact was rejected. The exact ceiling is undocumented (the FAQ is
not fetchable), and it is probably measured in **bytes**, not characters — this file
contains emoji, so bytes run ~0.7% above chars.

`npm run build` reports the size and warns when it approaches the known-bad figure.

## Where the bytes are

Measured on the artifact at 3,347,843 chars:

| Part | Chars | Notes |
| --- | --- | --- |
| JS string/template literals | ~1,580,000 | terser never rewrites string contents |
| JS code | ~1,370,000 | already mangled, locals + safe top-level names |
| CSS | ~148,000 | minified |
| HTML markup | ~250,000 | minified |

The dominant cost is **string data**, not code: prompts, data tables (name pools alone
are ~65k), and HTML built inside template literals.

## What the build already does

Six stages, each self-verifying — see the header of `build-perchance.mjs`. Net effect
3,916,624 → 3,347,843 (-14.5%):

| Stage | Saved |
| --- | --- |
| HTML indentation inside JS literals | 91,897 |
| terser (now including safe top-level mangling) | 1,886,518 |
| CSS | 128,482 |
| HTML markup | 244,280 |
| CSS token names (`--l-panel-deep-2` → `--ab`) | 49,874 |
| CRLF → LF | 376 |

## What's left, measured

Ordered by value, not by ease:

| Lever | Saving | Cost / risk |
| --- | --- | --- |
| **Pool long string literals, deflate + base64, inflate at boot** | **~460,000** | Needs a compact synchronous inflate in the artifact (~2k). Verifiable: round-trip the exact pool in Node with the same implementation at build time. Biggest lever by 5x. |
| Repeated inline `style="…"` → CSS classes | ~92,000 | 551 patterns reused. Source refactor, needs visual re-verification per batch. Also improves the source. |
| Alias `gameState` (3,995 uses), `showNotification` (670), `employees` (679) | ~47,000 | Mechanical, but the names appear inside strings (inline handlers), so the rewrite has to cover strings too. |
| Atomic utility classes for repeated declarations | up to ~247,000 gross | 696 distinct declarations. Much larger refactor; layout risk. |
| `compress.toplevel` (dead-code elimination) | ~58,000 | **Rejected.** Drops 342 top-level declarations, and live functions are among them (`runFridayPayroll`, `updateGameTime`, `processPayrollConsequences`) because dropping one dead root cascades. Silent breakage of a feature that fires on an in-game Friday. |

### Dead code, separately

That last row is still a real finding: something like 342 top-level declarations are
unreferenced from code, forming a dead subtree. Worth an audit **on its own terms** —
deleting genuinely dead features from the source would shrink the artifact *and* the
source, but it needs to be done deliberately, one root at a time, not inferred from a
minifier's cascade.

## If shrinking isn't enough

Perchance's own suggestions, in preference order:

1. `perchance.org/upload` for bulk data — the name pools and prompt templates are the
   obvious candidates, and they're inert data.
2. Split into several generators and `{import:}` them from the main one. The repo
   already uses that mechanism for plugins in `perchance.logic`.

Both add a dependency outside the single pasted file, which is why they're the fallback.

## Verifying a build

The dev server serves the artifact too, so the built file can be smoke-tested:

```bash
npm run build
```

Then open `http://localhost:3000/index.perchance.html` under `local-dev` and check:
tabs switch, Settings → Display works, and the 4-theme contrast audit is clean (see
`docs/theming.md`). The build's own guards cover handler names, `window.*` exposures,
`<textarea>`/`<pre>` contents, the markup tag skeleton, and a whitespace-only assertion
for each minification stage.
