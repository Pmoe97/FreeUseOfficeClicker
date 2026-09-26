// Rename CSS custom properties to 2–3 character names in the ARTIFACT only.
//
// The theme system introduced ~200 tokens used ~6,900 times; readable names like
// --l-panel-deep-2 cost real bytes at that multiplier. The source keeps its readable
// names — this runs at build time, after terser, so it also catches token names that
// live inside JS strings and runtime getPropertyValue() lookups.

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

/** Names that must survive verbatim (platform / spec, not ours). */
const KEEP = new Set(['--safe-b']); // env() fallback token read by name in places

/**
 * @param {string} artifact full HTML text, post-terser
 * @returns {{ text: string, renamed: number, saved: number, map: Map<string,string> }}
 */
export function shortenTokens(artifact) {
    // Collect every custom property that is DEFINED somewhere. Renaming a token we
    // only ever read would be wrong (it may come from outside), so definitions gate it.
    const defined = new Set();
    for (const m of artifact.matchAll(/(--[a-zA-Z][\w-]*)\s*:/g)) defined.add(m[1]);
    // setProperty("--x", …) counts as a definition too.
    for (const m of artifact.matchAll(/setProperty\(\s*["'](--[a-zA-Z][\w-]*)["']/g)) defined.add(m[1]);

    // Only rename ones that are actually referenced, and where the new name is shorter.
    const candidates = [];
    for (const name of defined) {
        if (KEEP.has(name)) continue;
        const uses = countOccurrences(artifact, name);
        if (uses === 0) continue;
        candidates.push({ name, uses });
    }
    // Most-used names get the shortest replacements.
    candidates.sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name));

    const map = new Map();
    let counter = 0;
    for (const c of candidates) {
        let short;
        do {
            short = '--' + toBase26(counter++);
        } while (defined.has(short));
        if (short.length >= c.name.length) continue; // already short enough
        map.set(c.name, short);
    }

    // Longest first so --l-panel-2 is never partially rewritten by --l-panel.
    const ordered = [...map.keys()].sort((a, b) => b.length - a.length);
    let text = artifact;
    let saved = 0;
    for (const name of ordered) {
        const short = map.get(name);
        const re = new RegExp(escapeRe(name) + '(?![\\w-])', 'g');
        let hits = 0;
        text = text.replace(re, () => {
            hits++;
            return short;
        });
        saved += hits * (name.length - short.length);
    }

    return { text, renamed: map.size, saved, map };
}

/** Verify every original name is gone and the var() count is unchanged. */
export function verifyTokenRename(before, after, map) {
    const problems = [];
    for (const name of map.keys()) {
        if (new RegExp(escapeRe(name) + '(?![\\w-])').test(after)) problems.push(`token not fully renamed: ${name}`);
    }
    const varsBefore = (before.match(/var\(--/g) || []).length;
    const varsAfter = (after.match(/var\(--/g) || []).length;
    if (varsBefore !== varsAfter) problems.push(`var(--…) count changed: ${varsBefore} → ${varsAfter}`);
    const defsBefore = (before.match(/--[a-zA-Z][\w-]*\s*:/g) || []).length;
    const defsAfter = (after.match(/--[a-zA-Z][\w-]*\s*:/g) || []).length;
    if (defsBefore !== defsAfter) problems.push(`custom-property definitions changed: ${defsBefore} → ${defsAfter}`);
    return problems;
}

function countOccurrences(text, name) {
    return (text.match(new RegExp(escapeRe(name) + '(?![\\w-])', 'g')) || []).length;
}

function toBase26(n) {
    let s = '';
    do {
        s = ALPHABET[n % 26] + s;
        n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return s;
}

function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
