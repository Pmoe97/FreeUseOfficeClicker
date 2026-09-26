# archived/ — previous versions of the game

Frozen snapshots. Nothing here is loaded by the game or served by `local-dev` — the live
game is `index.html` + `main.pjs` + `src/src/` at the repo root.

| Folder | What it is |
|---|---|
| `2026-07-27-monolith/` | The last single-file version (commit f6de154): `index.html` (~5.9 MB, markup + one script + two style blocks) and the minify build that made it fit Perchance's size limit. Still buildable in place: `npm install` there, then `npm run build` → `index.perchance.html`. `index.perchance.BACKUP.html` is an older (June 2026) pasted artifact. `perchance.logic` is not here because it became `main.pjs` unchanged. |
| `2026-09-26-perchance-file-tree-export/` | The file-tree version as exported from Perchance: the split into `src/js/` + `src/css/` that the current layout follows. It was cut from the **minified** build, so its code has mangled names (`gameBalance` → `le`) and no comments. Kept for reference only; don't edit it. The current files were regenerated from the readable monolith at the same boundaries. |
