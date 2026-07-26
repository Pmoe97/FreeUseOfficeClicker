// Health report for the CSS in index.html.
//
//   node tools/css-audit.mjs            summary
//   node tools/css-audit.mjs --map      section map of the main <style> block
//   node tools/css-audit.mjs --risk     literals that still can't follow a theme
//
// The point of --risk: a literal used as a gradient stop is fine, a literal used as
// TEXT is not — it keeps its dark-theme lightness on a light-theme panel. That list
// should stay near zero; if it grows, run tools/suggest-tail-tokens.mjs.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { HEX_RE, hsl, contrast } from './color-lib.mjs';
import { buildMap, STRUCTURAL, SEMANTIC, ACCENTS, EFFECTS, VEILS, SHEENS, THEMES } from './palette.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, '..', 'index.html');
const src = await readFile(SRC, 'utf8');
const lines = src.split('\n');

const has = (f) => process.argv.includes(`--${f}`);

/* ── where the CSS lives ─────────────────────────────────────────────────────── */

// Real style blocks are line-anchored markup. The file also contains <style> inside
// JS template strings (CSS the game injects at runtime), which must not be paired with
// the markup tags — regex pairing across them swallows the whole main block.
const styleBlocks = [];
{
    let open = null;
    lines.forEach((line, i) => {
        if (/^<style>\s*$/.test(line)) open = i;
        else if (/^<\/style>\s*$/.test(line) && open !== null) {
            const body = lines.slice(open + 1, i);
            styleBlocks.push({ startLine: open + 1, lineCount: body.length, chars: body.join('\n').length });
            open = null;
        }
    });
}

/* ── section map ─────────────────────────────────────────────────────────────── */

const sections = [];
lines.forEach((line, i) => {
    // Banner comments: /* ==== X ==== */, /* ── X ── */ or a /* ===...  block opener
    const banner = line.match(/^\s*\/\*\s*[=─-]{3,}\s*(.*?)\s*[=─-]*\s*\*?\/?\s*$/);
    if (banner && banner[1] && banner[1].length > 3) {
        sections.push({ line: i + 1, title: banner[1] });
        return;
    }
    const named = line.match(/^\s*\/\*\s*(?:-{2,}\s*)?([A-Z][^*/]{6,70}?)\s*(?:-{2,}\s*)?\*\/\s*$/);
    if (named) sections.push({ line: i + 1, title: named[1].trim() });
});

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
    const main = styleBlocks[styleBlocks.length - 1];
    console.log(`Section map — main <style> starts at line ${main.startLine} (${main.lineCount} lines)\n`);
    for (const s of sections.filter((s) => s.line >= main.startLine)) {
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
        console.log('\nRun: node tools/suggest-tail-tokens.mjs   for ready-to-paste palette rows.');
    }
    process.exit(0);
}

const tokenUses = (src.match(/var\(--[a-z0-9-]+\)/g) || []).length;
const importantUses = (src.match(/!important/g) || []).length;
const inlineStyles = (src.match(/style="/g) || []).length;
const tokenCount = STRUCTURAL.length + SEMANTIC.length + ACCENTS.length + EFFECTS.length + VEILS.length + SHEENS.length;

console.log('CSS AUDIT — FreeUseOfficeClicker/index.html\n');
console.log(`  <style> blocks        ${styleBlocks.length}`);
for (const b of styleBlocks) console.log(`    line ${String(b.startLine).padStart(6)}   ${b.lineCount} lines, ${(b.chars / 1024).toFixed(0)} KB`);
console.log(`  documented sections   ${sections.length}   (node tools/css-audit.mjs --map)`);
console.log(`  inline style="…"      ${inlineStyles}`);
console.log(`  !important            ${importantUses}`);
console.log('');
console.log(`  theme tokens          ${tokenCount} × ${THEMES.length} themes`);
console.log(`  var(--…) uses         ${tokenUses}`);
console.log('');
console.log(`  colour literals       ${[...literals.values()].reduce((s, r) => s + r.total, 0)} uses / ${literals.size} distinct`);
console.log(
    `    has a token         ${[...literals.values()].filter((r) => r.tokenised).length} distinct  (deliberately skipped: SVG attributes, ink already correct — ` +
        `\`node tools/codemod-colors.mjs --report\` is the authority)`
);
console.log(`    one-off decorative  ${untokenised.length} distinct  — fine while they only sit behind ink that follows the fill`);
console.log(`    used as TEXT        ${riskyText.length} distinct  ${riskyText.length ? '← see --risk' : '✓'}`);

const worst = THEMES.map((t) => {
    const ink = t.idx === 0 ? '#ffffff' : STRUCTURAL.find((r) => r[0] === '--l-ink')[t.idx + 2];
    const panel = t.idx === 0 ? '#1a1a2e' : STRUCTURAL.find((r) => r[0] === '--l-panel')[t.idx + 2];
    return `${t.id} ${contrast(ink, panel).toFixed(1)}:1`;
});
console.log(`\n  body ink vs panel     ${worst.join('   ')}`);
