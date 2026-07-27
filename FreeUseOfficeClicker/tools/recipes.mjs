// RECIPE THEMES — a theme from ~12 lines instead of 197 hand-picked colours.
//
// The first four themes (dark/light/hc-dark/dim) carry a hand-authored value for every
// token, which is right for the ones that define the product's look. It does not scale:
// eight more would mean 1,182 more hand-picked colours.
//
// A recipe instead describes the *shape* of a theme — where its surfaces, lines and ink
// sit on the lightness scale, and what happens to hue — and derives all 197 values from
// the default theme's values. Two principles make that safe rather than merely quick:
//
//  1. LIGHTNESS STRUCTURE IS PRESERVED, hue and saturation are not. A recipe re-tints;
//     it does not re-rank. --l-panel-2 stays darker than --l-panel-3, and accents keep
//     roughly the lightness they had in the default theme. That matters for more than
//     aesthetics: the codemod already decided, per site, whether ink on a given fill
//     should be light or dark, using the DEFAULT theme's accent lightness. Keep that
//     lightness and every one of those decisions stays correct.
//
//  2. SEMANTIC HUES SURVIVE. Money green, loss red and warning amber keep their hue
//     family; only decorative hues (indigo, cyan, violet, pink…) are pulled toward the
//     theme. This is a game whose screens are full of +$ and -$ figures, so hue there
//     carries information, and it is also the colour-blindness safety net.
//
// Decorative hues are compressed toward the theme hue rather than flattened onto it, so
// a palette keeps internal variety: two chips that differed by 60° still differ, by ~11°.

import { fromHsl, hsl, contrast, forceContrast } from './color-lib.mjs';

const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
const lerp = (a, b, t) => a + (b - a) * t;

/** Hue of the default theme's dominant accent (#667eea). Maps exactly onto theme hue. */
const DECORATIVE_ANCHOR = 229;

/** Token families whose hue means something. */
const SEMANTIC_FAMILY = /green|red|gold|orange|amber|yellow|crimson/i;
const SEMANTIC_TOKENS = new Set(['--positive', '--danger', '--warning', '--accent-gold', '--chat-memory']);

function isSemantic(token) {
    return SEMANTIC_TOKENS.has(token) || SEMANTIC_FAMILY.test(token.replace(/^--l-/, ''));
}

/* ────────────────────────────────────────────────────────────────────────────
   The recipes
   ──────────────────────────────────────────────────────────────────────────── */

// Ranges are [value at the DARKEST end of the default ramp, value at the LIGHTEST end].
// For a light-mode recipe they run the other way, which is what inverts the ramp.
export const RECIPES = {
    crimson: {
        label: 'Crimson',
        mode: 'dark',
        hue: 355,
        pageBg: '#150609',
        surface: { range: [0.055, 0.21], sat: 0.5 },
        line: { range: [0.22, 0.62], sat: 0.34 },
        ink: { range: [0.60, 0.94], sat: 0.14 },
        accent: { satScale: 1.05, lightScale: 1, hueSpread: 0.16 },
    },
    'terminal-green': {
        label: 'Terminal',
        mode: 'dark',
        hue: 138,
        pageBg: '#00090a',
        // Phosphor on glass: surfaces stay very dark and barely tinted, ink glows.
        surface: { range: [0.02, 0.16], sat: 0.42 },
        line: { range: [0.20, 0.58], sat: 0.40 },
        ink: { range: [0.50, 0.76], sat: 0.85, forceSat: true },
        accent: { satScale: 1.15, lightScale: 1.02, hueSpread: 0.1 },
    },
    'terminal-amber': {
        label: 'Amber CRT',
        mode: 'dark',
        hue: 38,
        pageBg: '#0b0600',
        surface: { range: [0.03, 0.17], sat: 0.45 },
        line: { range: [0.21, 0.58], sat: 0.42 },
        ink: { range: [0.50, 0.74], sat: 0.88, forceSat: true },
        accent: { satScale: 1.12, lightScale: 1.02, hueSpread: 0.1 },
    },
    ocean: {
        label: 'Deep Ocean',
        mode: 'dark',
        hue: 196,
        pageBg: '#04141c',
        surface: { range: [0.06, 0.22], sat: 0.55 },
        line: { range: [0.22, 0.62], sat: 0.38 },
        ink: { range: [0.60, 0.94], sat: 0.16 },
        accent: { satScale: 1.05, lightScale: 1, hueSpread: 0.18 },
    },
    synthwave: {
        label: 'Synthwave',
        mode: 'dark',
        hue: 288,
        pageBg: '#0d0417',
        surface: { range: [0.055, 0.22], sat: 0.55 },
        line: { range: [0.22, 0.62], sat: 0.42 },
        ink: { range: [0.62, 0.95], sat: 0.20 },
        accent: { satScale: 1.15, lightScale: 1.03, hueSpread: 0.22 },
    },
    slate: {
        label: 'Slate',
        mode: 'dark',
        hue: 215,
        pageBg: '#14161a',
        // No colour cast: saturation near zero everywhere structural.
        surface: { range: [0.075, 0.24], sat: 0.05 },
        line: { range: [0.24, 0.62], sat: 0.04 },
        ink: { range: [0.60, 0.93], sat: 0.03 },
        accent: { satScale: 0.85, lightScale: 1, hueSpread: 0.3 },
    },
    nordic: {
        label: 'Nordic',
        mode: 'dark',
        hue: 220,
        pageBg: '#2e3440',
        // Deliberately low contrast, like Dimmed but cooler: surfaces start much lighter.
        surface: { range: [0.20, 0.34], sat: 0.16 },
        line: { range: [0.34, 0.68], sat: 0.14 },
        ink: { range: [0.66, 0.92], sat: 0.14 },
        accent: { satScale: 0.7, lightScale: 1.05, hueSpread: 0.26 },
    },
    sepia: {
        label: 'Sepia Paper',
        mode: 'light',
        hue: 34,
        pageBg: '#f1e7d5',
        // Light mode: the ramp inverts. Darkest default surface → lightest paper.
        // Kept off pure white on purpose — the point of this theme is warmth and less
        // blue light, and a 0.97 top just reads as "Daylight with a tint".
        surface: { range: [0.925, 0.83], sat: 0.62 },
        line: { range: [0.78, 0.34], sat: 0.34 },
        ink: { range: [0.42, 0.15], sat: 0.30, forceSat: true },
        accent: { satScale: 0.9, lightScale: 1, hueSpread: 0.16 },
    },
};

/* ────────────────────────────────────────────────────────────────────────────
   Derivation
   ──────────────────────────────────────────────────────────────────────────── */

// The lightness span each role covers in the DEFAULT theme, used to place a token on
// its recipe ramp. Measured from the STRUCTURAL table rather than assumed.
const SPANS = {
    surface: [0.0, 0.34],
    line: [0.20, 0.62],
    ink: [0.40, 1.0],
};

function placeOnRamp(darkHex, role, spec) {
    const { l } = hsl(darkHex);
    const [lo, hi] = SPANS[role];
    const t = clamp((l - lo) / (hi - lo));
    return lerp(spec.range[0], spec.range[1], t);
}

/** Re-tint a structural colour onto the recipe's ramp, keeping its rank. */
export function deriveStructural(darkHex, role, recipe) {
    const spec = recipe[role];
    const { l: darkL, s } = hsl(darkHex);
    const light = placeOnRamp(darkHex, role, spec);
    // A colour that was already near-grey in the default stays near-grey here, so the
    // neutral greys (#333, #888) don't suddenly acquire the theme's cast.
    //
    // `forceSat` opts out of that: body ink is #ffffff in the default, i.e. zero
    // saturation, so the rule washed Terminal's text out to near-white — and phosphor-
    // coloured text is the entire point of a CRT theme. Themes whose identity lives in
    // the ink tint set it.
    const sat = spec.forceSat ? spec.sat : spec.sat * clamp(0.35 + s * 2.2, 0.35, 1);
    let out = fromHsl({ h: recipe.hue, s: sat, l: light });

    // The `line` ramp is asked to do two jobs: its dark end paints fills (--l-neutral-3
    // on an inactive chip) and its light end paints muted ink on top of them
    // (--l-neutral-8). On a deliberately compressed ramp — Nordic, Sepia — the two ends
    // land ~2.7:1 apart and that text stops being readable. Push the ink end away from
    // the fill end until it clears 3:1, rather than hand-tuning every recipe.
    const [lo, hi] = SPANS.line;
    const t = clamp((darkL - lo) / (hi - lo));
    if (role === 'line' && t >= 0.5) {
        const fillEnd = fromHsl({ h: recipe.hue, s: sat, l: spec.range[0] });
        if (contrast(out, fillEnd) < 3.05) {
            out = forceContrast(out, fillEnd, 3.05, recipe.mode === 'light' ? -1 : 1);
        }
    }
    return out;
}

/** Re-hue an accent: semantic families keep their hue, decorative ones move. */
export function deriveAccent(darkHex, token, recipe) {
    const h = hsl(darkHex);
    const spec = recipe.accent;
    let hue;
    if (isSemantic(token)) {
        // Nudge toward the theme just enough to feel deliberate, never enough to
        // confuse a gain with a loss.
        const delta = ((recipe.hue - h.h + 540) % 360) - 180;
        hue = h.h + delta * 0.12;
    } else {
        // Compress the decorative hue wheel into a band around the theme hue.
        const delta = ((h.h - DECORATIVE_ANCHOR + 540) % 360) - 180;
        hue = recipe.hue + delta * (spec.hueSpread ?? 0.18);
    }
    const sat = clamp(h.s * (spec.satScale ?? 1));
    const light = clamp(h.l * (spec.lightScale ?? 1) + (spec.lightShift ?? 0));
    let out = fromHsl({ h: hue, s: sat, l: light });

    // Guarantee the accent is legible as text on the worst-case panel of this theme, the
    // same floor the hand-authored themes are held to.
    const min = recipe.mode === 'light' ? 4.5 : 3;
    const bg = recipe.floorBg || recipe.pageBg;
    if (contrast(out, bg) < min) {
        out = forceContrast(out, bg, min, recipe.mode === 'light' ? -1 : 1);
    }
    return out;
}

/**
 * Ink printed on an accent fill. Which way this goes depends on how bright the theme's
 * accents ended up, so it is measured rather than assumed: whichever of near-black or
 * near-white wins on the theme's most common fill colours.
 */
export function deriveOnFill(recipe, sampleFills, prefer) {
    const dark = fromHsl({ h: recipe.hue, s: 0.35, l: 0.06 });
    const light = fromHsl({ h: recipe.hue, s: 0.06, l: 0.97 });
    const score = (ink) => sampleFills.reduce((s, f) => s + Math.min(contrast(ink, f), 12), 0);
    if (prefer === 'dark') return dark;
    if (prefer === 'light') return light;
    return score(dark) >= score(light) ? dark : light;
}

// The page background a recipe *declares* is only a starting intent; what actually paints
// is --l-bg, derived from the ramp. Overwrite pageBg with the derived value so contrast is
// measured against the colour really on screen.
//
// floorBg is the surface a contrast floor should actually be measured against: accent text
// mostly sits on PANELS, not on the page, and the panel ramp runs lighter than the page.
// Nordic made that concrete — its polar-night surfaces are much lighter than the other
// dark themes, so accents that cleared 3:1 on its page still landed at 2.8:1 on its cards.
// Worst case is the light end of the surface ramp for a dark theme, the dark end for light.
for (const recipe of Object.values(RECIPES)) {
    recipe.pageBg = deriveStructural('#0f1419', 'surface', recipe);
    const ends = recipe.surface.range.map((l) => fromHsl({ h: recipe.hue, s: recipe.surface.sat, l }));
    recipe.floorBg = recipe.mode === 'light' ? darkest(ends) : lightest(ends);
}

function lightest(colours) {
    return colours.reduce((a, b) => (hsl(a).l >= hsl(b).l ? a : b));
}
function darkest(colours) {
    return colours.reduce((a, b) => (hsl(a).l <= hsl(b).l ? a : b));
}

/** A *-dim companion: the faint wash behind a status colour. */
export function deriveDim(baseHex, recipe) {
    const h = hsl(baseHex);
    return recipe.mode === 'light'
        ? fromHsl({ h: h.h, s: clamp(h.s * 0.45), l: 0.92 })
        : fromHsl({ h: h.h, s: clamp(h.s * 0.55), l: 0.12 });
}
