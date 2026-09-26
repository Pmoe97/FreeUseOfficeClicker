// Inventory every colour literal in the game source (index.html + src/src/srcfiles/)
// and classify it, so the palette table below can be driven by what the code contains.
//
//   npm run colors:inventory                  summary table
//   npm run colors:inventory -- --json        machine-readable
//   npm run colors:inventory -- --ctx '#0f3460'   show surrounding text
//
// Roles:
//   surface  dark background/panel fill        -> must flip in a light theme
//   line     dark-ish border/divider           -> must flip
//   ink      white/grey foreground text        -> must flip
//   accent   saturated brand/status colour     -> re-tuned per theme, not flipped

import { HEX_RE, hsl, isAchromatic } from './color-lib.mjs';
import { readAllText } from './sources.mjs';

/** Heuristic role for a literal, refined by how it is used in the file. */
export function classify(hex, uses) {
    const { s, l } = hsl(hex);
    const borderish = uses.border / Math.max(1, uses.total);
    if (l <= 0.34) {
        // Dark values are structural: either a fill or a stroke.
        if (borderish >= 0.4) return 'line';
        return s <= 0.5 ? 'surface' : 'accent';
    }
    if (isAchromatic(hex, 0.14)) return l >= 0.55 ? 'ink' : 'line';
    return 'accent';
}

export async function inventory() {
    const src = readAllText();
    const map = new Map();

    for (const m of src.matchAll(HEX_RE)) {
        const hex = m[0].toLowerCase();
        // Skip 8-digit hex (#rrggbbaa) -- the \b in HEX_RE already excludes them,
        // but a 6-digit match immediately followed by 2 more hex digits would be a
        // partial read, so double-check the character after the match.
        const after = src[m.index + m[0].length] || '';
        if (/[0-9a-fA-F]/.test(after)) continue;

        const before = src.slice(Math.max(0, m.index - 60), m.index);
        const rec =
            map.get(hex) ||
            { hex, total: 0, border: 0, background: 0, color: 0, gradient: 0, shadow: 0 };
        rec.total++;
        if (/border[a-z-]*:\s*[^;"']*$|solid\s*$|dashed\s*$|dotted\s*$/i.test(before)) rec.border++;
        if (/background[a-z-]*:\s*[^;"']*$|background\s*=\s*["']?$/i.test(before)) rec.background++;
        if (/(?<!border-|background-|outline-|caret-|accent-)\bcolor:\s*$|\.color\s*=\s*["']$/i.test(before))
            rec.color++;
        if (/gradient\([^)]*$/i.test(before)) rec.gradient++;
        if (/(box-)?shadow:[^;"']*$/i.test(before)) rec.shadow++;
        map.set(hex, rec);
    }

    // `white` / `black` keywords are part of the same problem space.
    const kw = (re) => [...src.matchAll(re)].length;
    const whiteUses = kw(/\bcolor:\s*white\b/gi) + kw(/\bbackground[a-z-]*:\s*white\b/gi) + kw(/solid\s+white\b/gi);

    const rows = [...map.values()]
        .map((r) => ({ ...r, role: classify(r.hex, r), hsl: hsl(r.hex) }))
        .sort((a, b) => b.total - a.total);

    return { rows, whiteUses, srcLength: src.length };
}

if (process.argv[1] && process.argv[1].endsWith('color-inventory.mjs')) {
    const ctxFlag = process.argv.indexOf('--ctx');
    if (ctxFlag > -1) {
        const needle = process.argv[ctxFlag + 1];
        const src = readAllText();
        let n = 0;
        for (const m of src.matchAll(new RegExp(needle.replace('#', '#'), 'gi'))) {
            if (n++ > 25) break;
            console.log(
                '…' + src.slice(Math.max(0, m.index - 70), m.index + 25).replace(/\s+/g, ' ') + '…'
            );
        }
        process.exit(0);
    }

    const { rows, whiteUses } = await inventory();
    if (process.argv.includes('--json')) {
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    }

    const byRole = {};
    let total = 0;
    for (const r of rows) {
        byRole[r.role] = (byRole[r.role] || 0) + r.total;
        total += r.total;
    }
    console.log(`${rows.length} distinct literals, ${total} occurrences (+${whiteUses} "white" keyword uses)\n`);
    console.log('by role:', byRole, '\n');
    console.log('hex        n    role     L%   S%   border bg  color grad');
    for (const r of rows.filter((r) => r.total >= 2)) {
        console.log(
            r.hex.padEnd(10),
            String(r.total).padEnd(4),
            r.role.padEnd(8),
            String(Math.round(r.hsl.l * 100)).padStart(3),
            String(Math.round(r.hsl.s * 100)).padStart(4),
            String(r.border).padStart(6),
            String(r.background).padStart(4),
            String(r.color).padStart(5),
            String(r.gradient).padStart(5)
        );
    }
}
