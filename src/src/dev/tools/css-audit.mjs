// Health report for the game's CSS (src/src/srcfiles/css/) and the colour literals
// across all of the source.
//
//   npm run css:audit                 summary
//   npm run css:audit -- --map        section map of the stylesheet, file:line
//   npm run css:audit -- --risk       literals that still can't follow a theme
//
// The point of --risk: a literal used as a gradient stop is fine, a literal used as
// TEXT is not — it keeps its dark-theme lightness on a light-theme panel. That list
// should stay near zero; if it grows, run `npm run theme:suggest`.

import { HEX_RE, hsl, contrast } from './color-lib.mjs';
import { buildMap, STRUCTURAL, SEMANTIC, ACCENTS, EFFECTS, VEILS, SHEENS, THEMES } from './palette.mjs';
import { readSources, cssPaths } from './sources.mjs';

const files = readSources();
const src = files.map((f) => f.text).join('\n');

const has = (f) => process.argv.includes(`--${f}`);

/* ── where the CSS lives ─────────────────────────────────────────────────────── */

// One stylesheet per file, loaded in cascade order by index.html. (CSS the game
// injects at runtime lives in JS template strings and is not counted here.)
const cssSet = new Set(cssPaths());
const stylesheets = files
    .filter((f) => cssSet.has(f.path))
    .map((f) => ({ rel: f.rel, lineCount: f.text.split('\n').length, chars: f.text.length }));

/* ── section map ─────────────────────────────────────────────────────────────── */

const sections = [];
for (const f of files) {
    f.text.split('\n').forEach((line, i) => {
        // Banner comments: /* ==== X ==== */, /* ── X ── */ or a /* ===...  block opener
        const banner = line.match(/^\s*\/\*\s*[=─-]{3,}\s*(.*?)\s*[=─-]*\s*\*?\/?\s*$/);
        if (banner && banner[1] && banner[1].length > 3) {
            sections.push({ file: f, line: i + 1, title: banner[1] });
            return;
        }
        const named = line.match(/^\s*\/\*\s*(?:-{2,}\s*)?([A-Z][^*/]{6,70}?)\s*(?:-{2,}\s*)?\*\/\s*$/);
        if (named) sections.push({ file: f, line: i + 1, title: named[1].trim() });
    });
}

/* ── literal risk ────────────────────────────────────────────────────────────── */

const known = buildMap();
const skipRanges = [];
{
    const push = (a, b) => {
        let from = 0;
        for (;;) {
            const s = src.indexOf(a, from);
            if (s === -1) break;
            const e = src.indexOf(b, s + a.length);
            if (e === -1) break;
            skipRanges.push([s, e]);
            from = e;
        }
    };
    push('/* ==== FUOC THEME LAYER', 'END FUOC THEME LAYER ==== */');
    push('fuoc-codemod:ignore-start', 'fuoc-codemod:ignore-end');
}
const inSkip = (i) => skipRanges.some(([a, b]) => i >= a && i < b);

const literals = new Map();
for (const m of src.matchAll(HEX_RE)) {
    if (inSkip(m.index)) continue;
    const hex = m[0].toLowerCase();
    if (/[0-9a-fA-F]/.test(src[m.index + m[0].length] || '')) continue;
    const back = src.slice(Math.max(0, m.index - 70), m.index);
    const isText = /(?:^|[;{"'`(\s])color\s*:\s*$/.test(back) || /\.style\.color\s*=\s*["'`]$/.test(back);
    const rec = literals.get(hex) || { hex, total: 0, text: 0, tokenised: known.has(hex) };
    rec.total++;
    if (isText) rec.text++;
    literals.set(hex, rec);
}
const untokenised = [...literals.values()].filter((r) => !r.tokenised);
const riskyText = untokenised.filter((r) => r.text > 0);

/* ── output ──────────────────────────────────────────────────────────────────── */

if (has('map')) {
    console.log(`Section map — ${stylesheets.length} stylesheets in src/src/srcfiles/css/\n`);
    let last = null;
    for (const s of sections.filter((s) => cssSet.has(s.file.path))) {
        if (s.file !== last) console.log(`  ${(last = s.file).rel}`);
        console.log(`  ${String(s.line).padStart(6)}  ${s.title}`);
    }
    process.exit(0);
}

if (has('risk')) {
    if (!riskyText.length) {
        console.log('No untokenised literal is used as text. ✓');
    } else {
        console.log(`${riskyText.length} untokenised literal(s) used as TEXT — these cannot follow a theme:\n`);
        for (const r of riskyText.sort((a, b) => b.text - a.text)) {
            const onLight = contrast(r.hex, '#f8f9fc').toFixed(1);
            console.log(`  ${r.hex}  text ×${r.text}  (${onLight}:1 on a light panel)`);
        }
        console.log('\nRun: npm run theme:suggest   for ready-to-paste palette rows.');
    }
    process.exit(0);
}

const tokenUses = (src.match(/var\(--[a-z0-9-]+\)/g) || []).length;
const importantUses = (src.match(/!important/g) || []).length;
const inlineStyles = (src.match(/style="/g) || []).length;
const tokenCount = STRUCTURAL.length + SEMANTIC.length + ACCENTS.length + EFFECTS.length + VEILS.length + SHEENS.length;

console.log(`CSS AUDIT — index.html + src/src/srcfiles/ (${files.length} files)\n`);
const cssChars = stylesheets.reduce((n, s) => n + s.chars, 0);
console.log(`  stylesheets           ${stylesheets.length}   ${(cssChars / 1024).toFixed(0)} KB total`);
for (const s of stylesheets) console.log(`    ${s.rel.replace('src/src/srcfiles/css/', '').padEnd(24)} ${String(s.lineCount).padStart(5)} lines, ${(s.chars / 1024).toFixed(0)} KB`);
console.log(`  documented sections   ${sections.length}   (npm run css:audit -- --map)`);
console.log(`  inline style="…"      ${inlineStyles}`);
console.log(`  !important            ${importantUses}`);
console.log('');
console.log(`  theme tokens          ${tokenCount} × ${THEMES.length} themes`);
console.log(`  var(--…) uses         ${tokenUses}`);
console.log('');
console.log(`  colour literals       ${[...literals.values()].reduce((s, r) => s + r.total, 0)} uses / ${literals.size} distinct`);
console.log(
    `    has a token         ${[...literals.values()].filter((r) => r.tokenised).length} distinct  (deliberately skipped: SVG attributes, ink already correct — ` +
        `\`npm run codemod:colors -- --report\` is the authority)`
);
console.log(`    one-off decorative  ${untokenised.length} distinct  — fine while they only sit behind ink that follows the fill`);
console.log(`    used as TEXT        ${riskyText.length} distinct  ${riskyText.length ? '← see --risk' : '✓'}`);

const worst = THEMES.map((t) => {
    const ink = t.idx === 0 ? '#ffffff' : STRUCTURAL.find((r) => r[0] === '--l-ink')[t.idx + 2];
    const panel = t.idx === 0 ? '#1a1a2e' : STRUCTURAL.find((r) => r[0] === '--l-panel')[t.idx + 2];
    return `${t.id} ${contrast(ink, panel).toFixed(1)}:1`;
});
console.log(`\n  body ink vs panel     ${worst.join('   ')}`);
