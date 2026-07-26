// Rewrites hard-coded colour literals in index.html to theme tokens.
//
//   node tools/codemod-colors.mjs --stage=surfaces --dry
//   node tools/codemod-colors.mjs --stage=surfaces
//   node tools/codemod-colors.mjs --stage=text
//   node tools/codemod-colors.mjs --stage=accents
//   node tools/codemod-colors.mjs --stage=veils
//   node tools/codemod-colors.mjs --report            what's left, grouped
//
// Every replacement resolves to the SAME rgb on the default dark theme, so a
// correct run is invisible until the player picks another theme.
//
// What it refuses to touch:
//   • the generated theme layer, and anything between fuoc-codemod:ignore markers
//     (theme swatch tables need real literals)
//   • SVG fill=/stroke= attributes and setAttribute("fill", …) — presentation
//     attributes don't accept var()
//   • 8-digit #rrggbbaa literals, and literals whose value gets an alpha suffix
//     concatenated onto it in JS (`${c}44`) — see fuocAlpha() in index.html
//   • literals it has no token for (reported, never guessed)

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildMap, buildAlphaMap, snapToStructural, VEIL_ALPHAS } from './palette.mjs';
import { hsl } from './color-lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, '..', 'index.html');

const STAGES = {
    surfaces: new Set(['surface', 'line']),
    text: new Set(['ink', 'onDark', 'onFill']),
    accents: new Set(['accent']),
    veils: new Set(['veil']),
};

const arg = (name, dflt) => {
    const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.split('=')[1] : dflt;
};
const has = (name) => process.argv.includes(`--${name}`);

/* ── protected regions ──────────────────────────────────────────────────────── */

function protectedRanges(src) {
    const ranges = [];
    const push = (startMarker, endMarker) => {
        let from = 0;
        for (;;) {
            const s = src.indexOf(startMarker, from);
            if (s === -1) break;
            const e = src.indexOf(endMarker, s + startMarker.length);
            if (e === -1) break;
            ranges.push([s, e + endMarker.length]);
            from = e + endMarker.length;
        }
    };
    push('/* ==== FUOC THEME LAYER', 'END FUOC THEME LAYER ==== */');
    push('fuoc-codemod:ignore-start', 'fuoc-codemod:ignore-end');
    return ranges;
}

const inRanges = (ranges, i) => ranges.some(([a, b]) => i >= a && i < b);

/* ── context helpers ────────────────────────────────────────────────────────── */

/** The CSS declaration block / style string the literal sits inside. */
function declContext(src, index) {
    const backFrom = Math.max(0, index - 420);
    const rawBack = src.slice(backFrom, index);
    let back = rawBack;
    const startCut = Math.max(
        back.lastIndexOf('style="'),
        back.lastIndexOf("style='"),
        back.lastIndexOf('{'),
        back.lastIndexOf('`')
    );
    if (startCut > -1) back = back.slice(startCut);

    let fwd = src.slice(index, Math.min(src.length, index + 320));
    const endCandidates = ['"', "'", '}', '`'].map((c) => fwd.indexOf(c, 1)).filter((n) => n > 0);
    if (endCandidates.length) fwd = fwd.slice(0, Math.min(...endCandidates));

    return { back, fwd, rawBack, all: back + fwd };
}

// Component classes that paint a saturated fill from the stylesheet. An element using
// one of these carries no local `background`, so hasBrightFill() has to read the class
// attribute to know its `color: white` is ink-on-a-fill and not ink-on-a-panel.
const FILL_CLASS_RE =
    /class="[^"]*\b(?:btn--(?:danger|primary|positive|warning|gold|accent|lg)|badge|chip|pill|tag--|prog-chip|solvency)/;

// Tokens that denote a saturated fill. Includes the design-system semantics
// (`background: var(--danger)`), but deliberately excludes their *-dim variants,
// which are dark washes where ink should follow the page instead.
const BRIGHT_TOKEN_RE = new RegExp(
    'var\\(--(?:' +
        'l-(?:indigo|purple|red|green|cyan|teal|blue|discord|gold|orange|amber|yellow|pink|magenta|crimson|plum|violet)' +
        '|danger(?!-dim)|positive(?!-dim)|warning(?!-dim)|accent(?!-dim|-ink)' +
        '|chat-(?:self|other|narrator|memory)(?!-fill)' +
        ')'
);

/** Is the literal being used as a text colour? */
function isTextColor(back) {
    return (
        /(?:^|[;{"'\s(])color\s*:\s*$/.test(back) ||
        /\.style\.color\s*=\s*["'`]$/.test(back) ||
        /-webkit-text-fill-color\s*:\s*$/.test(back)
    );
}

/** Does the surrounding declaration paint a saturated / dynamic fill behind us? */
function hasBrightFill(ctx) {
    const s = ctx.all;
    const bgDecl = /background[a-z-]*\s*:\s*([^;"'`]*)/gi;
    let m;
    while ((m = bgDecl.exec(s))) {
        const value = m[1];
        if (/gradient|\$\{/.test(value)) return true; // dynamic or gradient fill
        if (BRIGHT_TOKEN_RE.test(value)) return true; // already-tokenised accent
        const hex = value.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/);
        if (hex && hsl(hex[0]).l > 0.34) return true;
    }
    // Gradient-filled ancestor written in the same template chunk (headers etc).
    if (/linear-gradient\([^)]*\)\s*;?\s*$/.test(ctx.back)) return true;
    // Fill supplied by a component class on the same tag.
    if (FILL_CLASS_RE.test(ctx.rawBack.slice(-220))) return true;
    return false;
}

/* ── the pass ───────────────────────────────────────────────────────────────── */

const TOKEN_MAP = buildMap();
const ALPHA_MAP = buildAlphaMap();

// `white` behaves exactly like #ffffff — but ONLY as a CSS value. The bare word
// also appears in `white-space:` and in a lot of prose ("alabaster white skin",
// which feeds image prompts), so isCssKeyword() below gates every match.
const LITERAL_RE = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b|\bwhite\b|rgba?\(\s*(?:0\s*,\s*0\s*,\s*0|255\s*,\s*255\s*,\s*255)\s*,\s*(?:0?\.\d+|1|0)\s*\)/g;

const COLOR_PROP =
    '(?:color|background|background-color|border-color|border-top-color|border-right-color|border-bottom-color|border-left-color|outline-color|caret-color|text-decoration-color|-webkit-text-fill-color|fill|stroke)';
const KEYWORD_AFTER_PROP = new RegExp(`(?:^|[;{"'\`(\\s])${COLOR_PROP}\\s*:\\s*$`, 'i');
// JS assignments: el.style.color = "white", el.style.setProperty("color", "white")
const KEYWORD_AFTER_JS_ASSIGN =
    /\.style\.(?:color|background|backgroundColor|borderColor|outlineColor|caretColor|fill|stroke)\s*=\s*["'`]$|setProperty\(\s*["'](?:color|background|background-color|border-color)["']\s*,\s*["'`]$/;
const KEYWORD_AFTER_BORDER_STYLE = /\b(?:solid|dashed|dotted|double|groove|ridge|inset|outset)\s+$/i;
const KEYWORD_IN_BORDER_VALUE = /(?:^|[;{"'`(\s])(?:border|outline)(?:-[a-z]+)?\s*:\s*[^;"'`]*\s$/i;

/**
 * Is this bare `white` an actual CSS colour value?
 * Requires a colour property (or border shorthand) immediately before it, and a
 * value terminator immediately after — which is what rules out `white-space`.
 */
function isCssKeyword(ctx, nextChar) {
    if (nextChar && !/[\s;,)"'`]/.test(nextChar)) return false;
    return (
        KEYWORD_AFTER_PROP.test(ctx.back) ||
        KEYWORD_AFTER_JS_ASSIGN.test(ctx.back) ||
        KEYWORD_AFTER_BORDER_STYLE.test(ctx.back) ||
        KEYWORD_IN_BORDER_VALUE.test(ctx.back)
    );
}

function normaliseAlpha(text) {
    const nums = text.match(/[\d.]+/g);
    if (!nums || nums.length < 4) return null;
    const isWhite = nums[0] === '255';
    let alpha = parseFloat(nums[3]);
    // Snap to the nearest generated step so odd one-off alphas still theme.
    let best = null;
    for (const a of VEIL_ALPHAS) if (best === null || Math.abs(a - alpha) < Math.abs(best - alpha)) best = a;
    if (Math.abs(best - alpha) > 0.031) return null;
    const key = `rgba(${isWhite ? '255,255,255' : '0,0,0'},${String(Math.round(best * 100) / 100)})`;
    return ALPHA_MAP.get(key) || null;
}

function run(src, stageRoles, opts) {
    const ranges = protectedRanges(src);
    const edits = [];
    const stats = { replaced: {}, skipped: {}, unknown: {}, snapped: {} };
    const bump = (bucket, key) => (bucket[key] = (bucket[key] || 0) + 1);

    for (const m of src.matchAll(LITERAL_RE)) {
        const raw = m[0];
        const i = m.index;
        if (inRanges(ranges, i)) continue;

        // 8-digit hex / partial reads
        const after = src[i + raw.length] || '';
        const before1 = src[i - 1] || '';
        if (raw.startsWith('#') && (/[0-9a-fA-F]/.test(after) || /[0-9a-fA-F#]/.test(before1))) {
            bump(stats.skipped, 'alpha-hex');
            continue;
        }

        const ctx = declContext(src, i);

        // SVG presentation attributes and setAttribute() colour values.
        if (/(?:fill|stroke)\s*=\s*["']$/.test(ctx.back) || /setAttribute\(\s*["'](?:fill|stroke|color)["']\s*,\s*["']$/.test(ctx.back)) {
            bump(stats.skipped, 'svg-attr');
            continue;
        }

        // A literal whose string gets an alpha suffix appended right after it.
        if (/^["'`]\s*(?:\+\s*["'`])?[0-9a-fA-F]{2}\b/.test(src.slice(i + raw.length, i + raw.length + 8))) {
            bump(stats.skipped, 'alpha-concat');
            continue;
        }

        let token = null;
        let role = null;

        if (raw.startsWith('rgb')) {
            token = normaliseAlpha(raw);
            role = 'veil';
            if (!token) {
                bump(stats.skipped, 'alpha-off-scale');
                continue;
            }
        } else {
            if (raw === 'white' && !isCssKeyword(ctx, after)) {
                bump(stats.skipped, 'white-not-a-colour');
                continue;
            }
            const key = raw === 'white' ? '#ffffff' : raw.toLowerCase();
            let entry = TOKEN_MAP.get(key);
            if (!entry) {
                // One-off dark surface or grey → snap to the nearest structural token.
                const snap = snapToStructural(key);
                if (!snap) {
                    bump(stats.unknown, key);
                    continue;
                }
                entry = snap;
                bump(stats.snapped, `${key}→${snap.token} (Δ${snap.distance.toFixed(3)})`);
            }
            token = entry.token;
            role = entry.role;

            const textUse = isTextColor(ctx.back);
            const brightFill = hasBrightFill(ctx);

            if (role === 'ink' && textUse && brightFill) {
                // Light ink printed on a saturated fill. It must NOT follow the page
                // ink (that would put dark text on a coloured button); it follows the
                // fill, which means going black in High Contrast where accents are
                // brightened to clear 7:1.
                token = '--l-ink-on-fill';
                role = 'onFill';
            }
            if ((role === 'surface' || role === 'line') && textUse) {
                // A dark literal used as TEXT means "ink on something bright".
                token = '--l-on-accent';
                role = 'onDark';
            }
        }

        if (!stageRoles.has(role)) continue;

        edits.push({ i, len: raw.length, token, raw });
        bump(stats.replaced, `${role}:${token}`);
    }

    let out = src;
    if (!opts.dry) {
        for (const e of edits.sort((a, b) => b.i - a.i)) {
            out = out.slice(0, e.i) + `var(${e.token})` + out.slice(e.i + e.len);
        }
    }
    return { out, edits, stats };
}

/* ── output guards ──────────────────────────────────────────────────────────────
   A find-and-replace over 100k lines fails quietly and at scale, so the pass
   refuses to write unless the output still satisfies these invariants. The
   `white-space` check exists because an early version of the regex matched the
   `white` in `white-space: nowrap` — and the `white` in prose that feeds image
   prompts ("alabaster white skin"). Cheap tripwires, expensive bug.
   ──────────────────────────────────────────────────────────────────────────── */

function guards(before, after) {
    const problems = [];
    const count = (s, re) => (s.match(re) || []).length;

    const invariants = [
        ['white-space declarations', /white-space/g],
        ['template interpolations', /\$\{/g],
        ['backticks', /`/g],
        ['SVG colour attributes', /(?:fill|stroke)="#/g],
        ['prose "white "', /\bwhite (?:hair|skin|shirt|dress|scales|fur|lace|blouse|coat|top)/gi],
    ];
    for (const [label, re] of invariants) {
        const a = count(before, re);
        const b = count(after, re);
        if (a !== b) problems.push(`${label}: ${a} → ${b}`);
    }

    // A token spliced into the middle of an identifier (var(--l-ink)-space), or one
    // left glued to an alpha suffix (var(--l-red)22 — invalid, declaration dropped).
    // Compared as counts, not presence: a handful of these predate the codemod.
    for (const [label, re] of [
        ['token glued to an identifier', /var\(--[a-z0-9-]+\)[-a-zA-Z]/g],
        ['token followed by an alpha suffix', /var\(--[a-z0-9-]+\)[0-9a-fA-F]{2}\b/g],
    ]) {
        const a = count(before, re);
        const b = count(after, re);
        if (b > a) {
            const samples = [...new Set(after.match(re) || [])].slice(0, 5).join(', ');
            problems.push(`${label}: ${a} → ${b} (${samples})`);
        }
    }

    return problems;
}

/* ── reporting ──────────────────────────────────────────────────────────────── */

function report(stats, edits) {
    const total = edits.length;
    const byRole = {};
    for (const [k, n] of Object.entries(stats.replaced)) {
        const role = k.split(':')[0];
        byRole[role] = (byRole[role] || 0) + n;
    }
    console.log(`\n${total} replacement(s)`, byRole);
    const skipped = Object.entries(stats.skipped).sort((a, b) => b[1] - a[1]);
    if (skipped.length) console.log('skipped:', Object.fromEntries(skipped));
    const snapped = Object.entries(stats.snapped).sort((a, b) => b[1] - a[1]);
    if (snapped.length) {
        const uses = snapped.reduce((s, [, n]) => s + n, 0);
        console.log(`snapped to nearest token (${snapped.length} literals, ${uses} uses), largest deltas:`);
        const byDelta = snapped
            .map(([k, n]) => ({ k, n, d: parseFloat(k.match(/Δ([\d.]+)/)?.[1] || '0') }))
            .sort((a, b) => b.d - a.d)
            .slice(0, 8);
        for (const s of byDelta) console.log(`   ${s.k} ×${s.n}`);
    }
    const unknown = Object.entries(stats.unknown).sort((a, b) => b[1] - a[1]);
    if (unknown.length) {
        const shown = unknown.slice(0, 18);
        console.log(
            `no token (${unknown.length} distinct, ${unknown.reduce((s, [, n]) => s + n, 0)} uses): ` +
                shown.map(([k, n]) => `${k}×${n}`).join(' ')
        );
    }
}

const src = await readFile(SRC, 'utf8');

if (has('report')) {
    const all = new Set(['surface', 'line', 'ink', 'onDark', 'accent', 'veil']);
    const { edits, stats } = run(src, all, { dry: true });
    console.log('Literals that STILL have a token available (i.e. not yet migrated):');
    report(stats, edits);
    process.exit(0);
}

const stage = arg('stage', '');
if (!STAGES[stage]) {
    console.error(`--stage= must be one of: ${Object.keys(STAGES).join(', ')}  (or --report)`);
    process.exit(1);
}

const { out, edits, stats } = run(src, STAGES[stage], { dry: has('dry') });
console.log(`stage "${stage}"${has('dry') ? ' (dry run)' : ''}`);
report(stats, edits);

const problems = guards(src, out);
if (problems.length) {
    console.error('\n✗ output guard failed — NOT writing:');
    for (const p of problems) console.error('   ' + p);
    process.exit(1);
}
console.log('✓ output guards passed');

if (!has('dry')) {
    await writeFile(SRC, out, 'utf8');
    console.log(`wrote ${SRC}`);
}
