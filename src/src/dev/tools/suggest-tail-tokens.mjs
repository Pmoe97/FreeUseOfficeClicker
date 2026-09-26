// Which of the remaining one-off literals actually matter for readability?
//
//   npm run theme:suggest
//
// A decorative colour used only as a gradient stop can stay a literal — it sits behind
// ink that already follows the fill. A colour used as TEXT cannot: on a light theme it
// keeps its dark-theme lightness and lands on an off-white panel. This prints
// ready-to-paste ACCENTS rows for exactly those.

import { HEX_RE, hsl } from './color-lib.mjs';
import { buildMap } from './palette.mjs';
import { readAllText } from './sources.mjs';

const src = readAllText();
const known = buildMap();

// Skip the generated theme layer and the swatch table.
const skip = [];
const push = (a, b) => {
    let from = 0;
    for (;;) {
        const s = src.indexOf(a, from);
        if (s === -1) break;
        const e = src.indexOf(b, s + a.length);
        if (e === -1) break;
        skip.push([s, e]);
        from = e;
    }
};
push('/* ==== FUOC THEME LAYER', 'END FUOC THEME LAYER ==== */');
push('fuoc-codemod:ignore-start', 'fuoc-codemod:ignore-end');
const inSkip = (i) => skip.some(([a, b]) => i >= a && i < b);

const rows = new Map();
for (const m of src.matchAll(HEX_RE)) {
    const hex = m[0].toLowerCase();
    if (inSkip(m.index)) continue;
    if (known.has(hex)) continue;
    const after = src[m.index + m[0].length] || '';
    if (/[0-9a-fA-F]/.test(after)) continue;

    const back = src.slice(Math.max(0, m.index - 70), m.index);
    const isText = /(?:^|[;{"'`(\s])color\s*:\s*$/.test(back) || /\.style\.color\s*=\s*["'`]$/.test(back);
    const isBorder = /border[a-z-]*:\s*[^;"'`]*$|solid\s*$/.test(back);
    const rec = rows.get(hex) || { hex, total: 0, text: 0, border: 0 };
    rec.total++;
    if (isText) rec.text++;
    if (isBorder) rec.border++;
    rows.set(hex, rec);
}

const risky = [...rows.values()]
    .filter((r) => r.text > 0)
    .sort((a, b) => b.text - a.text || b.total - a.total);

const name = (hex) => {
    const { h, s, l } = hsl(hex);
    if (s < 0.12) return l > 0.6 ? 'grey-lt' : 'grey';
    const bands = [
        [15, 'red'], [45, 'orange'], [70, 'yellow'], [160, 'green'], [200, 'teal'],
        [250, 'blue'], [290, 'violet'], [330, 'pink'], [361, 'red'],
    ];
    const base = bands.find(([max]) => h < max)[1];
    return `${base}${l > 0.72 ? '-pale' : l < 0.4 ? '-deep' : ''}`;
};

const used = new Map();
console.log(`${risky.length} one-off literal(s) used as text (of ${rows.size} untokenised):\n`);
console.log('// prettier-ignore');
for (const r of risky) {
    let n = `--l-x-${name(r.hex)}`;
    const seen = (used.get(n) || 0) + 1;
    used.set(n, seen);
    if (seen > 1) n += `-${seen}`;
    console.log(`    ['${n}',${' '.repeat(Math.max(1, 22 - n.length))}'${r.hex}'],   // text ×${r.text}, total ×${r.total}`);
}
