// Renders a self-contained contact sheet of every theme, so the palettes can be
// eyeballed side by side without launching the game.
//
//   npm run theme:preview [-- outfile.html]      (default: ./theme-preview.html, gitignored)
//
// Values come from palette.mjs, so what you see is what the game gets.

import { writeFile } from 'node:fs/promises';
import { THEMES, valueFor, STRUCTURAL, ACCENTS } from './palette.mjs';
import { contrast } from './color-lib.mjs';

const out = process.argv[2] || 'theme-preview.html';
const v = (token, theme) => valueFor(token, theme);
const ratio = (a, b) => contrast(a, b).toFixed(1);

const BUTTONS = [
    ['--accent', 'Primary'],
    ['--danger', 'Danger'],
    ['--positive', 'Confirm'],
    ['--warning', 'Warning'],
    ['--accent-gold', 'Gold'],
    ['--l-pink', 'Gift'],
    ['--l-violet', 'Photo'],
    ['--l-indigo', 'Action'],
];

const CHIPS = ['--l-red', '--l-green', '--l-cyan', '--l-gold', '--l-pink', '--l-violet', '--l-indigo', '--l-orange'];

/** Ink that keeps its contrast on this fill — the same rule the codemod applies. */
function inkFor(fillHex, theme) {
    const light = v('--l-ink-on-fill', theme);
    const dark = v('--l-on-accent', theme);
    return contrast(light, fillHex) >= contrast(dark, fillHex) ? light : dark;
}

function panel(theme) {
    const bg = v('--l-bg', theme);
    const surface = v('--l-panel', theme);
    const surface2 = v('--surface-2', theme);
    const ink = v('--l-ink', theme);
    const dim = v('--text-dim', theme);
    const mute = v('--text-mute', theme);
    const border = v('--border', theme);
    const line = v('--l-line', theme);

    const buttons = BUTTONS.map(([token, label]) => {
        const fill = v(token, theme);
        const ink2 = inkFor(fill, theme);
        return `<span class="btn" style="background:${fill}; color:${ink2}; border-color:${fill}">${label}
                  <em style="color:${ink2}; opacity:.7">${ratio(ink2, fill)}</em></span>`;
    }).join('');

    const chips = CHIPS.map((token) => {
        const c = v(token, theme);
        return `<span class="chip" style="color:${c}; border-color:${c}">${token.replace('--l-', '')} <em>${ratio(c, surface)}</em></span>`;
    }).join('');

    return `
    <section class="theme" style="background:${bg}; color:${ink}">
      <header style="border-color:${border}">
        <h2 style="color:${ink}">${theme.label}</h2>
        <code style="color:${mute}">data-fuoc-theme="${theme.id}"</code>
      </header>

      <div class="card" style="background:${surface}; border-color:${border}">
        <h3 style="color:${ink}">Quarterly report</h3>
        <p style="color:${dim}">Secondary copy sits here — the dim ink, used for descriptions
           and helper text throughout the game.</p>
        <p class="mute" style="color:${mute}">Muted ink: timestamps, counts, disabled labels.</p>
        <div class="inset" style="background:${surface2}; border-color:${line}">
          <span style="color:${ink}">Inset panel</span>
          <span class="num" style="color:${v('--positive', theme)}">+$12,480</span>
          <span class="num" style="color:${v('--danger', theme)}">-$3,120</span>
        </div>
        <div class="btns">${buttons}</div>
        <div class="chips">${chips}</div>
      </div>

      <table style="color:${dim}; border-color:${border}">
        <tr><td>body ink on panel</td><td class="n" style="color:${ink}">${ratio(ink, surface)}:1</td></tr>
        <tr><td>dim ink on panel</td><td class="n" style="color:${ink}">${ratio(dim, surface)}:1</td></tr>
        <tr><td>muted ink on panel</td><td class="n" style="color:${ink}">${ratio(mute, surface)}:1</td></tr>
        <tr><td>lowest button ink</td><td class="n" style="color:${ink}">${Math.min(
            ...BUTTONS.map(([t]) => Number(ratio(inkFor(v(t, theme), theme), v(t, theme))))
        ).toFixed(1)}:1</td></tr>
      </table>
    </section>`;
}

const html = `<!doctype html>
<meta charset="utf-8">
<title>FUOC theme contact sheet</title>
<style>
  body { margin:0; font:14px/1.5 "Segoe UI", system-ui, sans-serif; background:#2a2d34; }
  .grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(340px,1fr)); gap:1px; }
  .theme { padding:18px; min-height:100%; }
  header { display:flex; align-items:baseline; justify-content:space-between; gap:10px;
           padding-bottom:10px; margin-bottom:14px; border-bottom:1px solid; }
  h2 { margin:0; font-size:1.1rem; }
  h3 { margin:0 0 8px; font-size:.98rem; }
  code { font-size:.72rem; }
  .card { border:1px solid; border-radius:11px; padding:14px; }
  p { margin:0 0 8px; font-size:.85rem; }
  p.mute { font-size:.78rem; }
  .inset { display:flex; gap:14px; align-items:center; border:1px solid; border-radius:7px;
           padding:9px 11px; margin:12px 0; font-size:.82rem; }
  .num { font-family:ui-monospace, "SF Mono", Menlo, monospace; font-weight:700; margin-left:auto; }
  .inset .num + .num { margin-left:0; }
  .btns { display:flex; flex-wrap:wrap; gap:6px; margin-top:12px; }
  .btn { border:1px solid; border-radius:7px; padding:6px 10px; font-size:.78rem; font-weight:700; }
  .btn em { font-style:normal; font-size:.68rem; margin-left:5px; }
  .chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
  .chip { border:1px solid; border-radius:999px; padding:3px 9px; font-size:.7rem; }
  .chip em { font-style:normal; opacity:.75; }
  table { width:100%; margin-top:14px; border-top:1px solid; border-collapse:collapse; font-size:.75rem; }
  td { padding:4px 0; }
  td.n { text-align:right; font-family:ui-monospace, Menlo, monospace; font-weight:700; }
</style>
<div class="grid">
${THEMES.map(panel).join('\n')}
</div>
<p style="color:#9aa0aa; font:12px/1.6 system-ui; padding:14px 18px; margin:0">
  Generated from tools/palette.mjs — ${STRUCTURAL.length + ACCENTS.length} bridge tokens.
  Numbers are WCAG contrast ratios; button figures are ink-on-fill.
</p>
`;

await writeFile(out, html, 'utf8');
console.log(`wrote ${out}`);
