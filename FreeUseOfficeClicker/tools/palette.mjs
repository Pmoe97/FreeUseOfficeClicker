// THE PALETTE TABLE — single source of truth for the theme system.
//
// The game grew without a central stylesheet: ~2,900 colour literals are baked into
// inline styles inside JS template strings, where no stylesheet can reach them. The
// fix is a *bridge* layer: every legacy literal maps 1:1 to a CSS custom property
// whose dark-theme value is byte-identical to the literal it replaced. That makes the
// codemod visually a no-op on the default theme, and gives every other theme a single
// place to re-tune.
//
// role decides how a theme transforms the colour:
//   surface  panel/background fill      light theme flips it to an off-white ramp
//   line     border / divider           flips to a light-grey stroke
//   ink      foreground text            flips to near-black
//   onDark   text that sits on a bright accent fill — must stay dark in EVERY theme
//   accent   brand/status hue           kept, but re-tuned for contrast per theme
//
// Regenerate the CSS after editing:  npm run theme:tokens

import { forceContrast, fromHsl, hsl, contrast } from './color-lib.mjs';

/* ────────────────────────────────────────────────────────────────────────────
   1. Structural colours — hand-authored per theme.
   These carry the whole look, so they are not left to a transform.
   ──────────────────────────────────────────────────────────────────────────── */

// prettier-ignore
export const STRUCTURAL = [
    // token                legacy       role       light      hcDark     dim
    ['--l-bg',              '#0f1419',  'surface', '#eceef3', '#000000', '#171b22'],
    ['--l-bg-black',        '#0a0a0a',  'surface', '#e8eaf0', '#000000', '#14171d'],
    ['--l-bg-black-2',      '#1a1a1a',  'surface', '#f2f3f7', '#0a0a0a', '#1f2229'],
    ['--l-panel',           '#1a1a2e',  'surface', '#f8f9fc', '#0b0b12', '#20242e'],
    ['--l-panel-2',         '#16213e',  'surface', '#f1f3f8', '#08101f', '#1c2230'],
    ['--l-panel-3',         '#1c2738',  'surface', '#e9edf4', '#0d1520', '#232a36'],
    ['--l-panel-deep',      '#0e1522',  'surface', '#e6eaf2', '#000208', '#161b25'],
    ['--l-panel-deep-2',    '#101a2a',  'surface', '#e8ecf4', '#02060f', '#181e29'],
    ['--l-panel-deep-3',    '#142035',  'surface', '#eaeef5', '#050b16', '#1b2230'],
    ['--l-panel-alt',       '#1a1f2e',  'surface', '#f0f2f7', '#0a0d14', '#20242e'],
    ['--l-panel-alt-2',     '#1a1d23',  'surface', '#eef0f4', '#0a0c0f', '#1f2228'],
    ['--l-panel-violet',    '#1a1028',  'surface', '#f3eefb', '#0c0616', '#221933'],
    ['--l-slate',           '#2d3436',  'surface', '#dfe3e6', '#14191a', '#333a3d'],
    ['--l-slate-2',         '#2f3336',  'surface', '#e1e4e6', '#16191a', '#353a3d'],
    ['--l-black',           '#000000',  'surface', '#e4e7ee', '#000000', '#0d1014'],

    ['--l-line',            '#0f3460',  'line',    '#ccd6e6', '#3c6ba8', '#1c3f6b'],
    ['--l-neutral-3',       '#333333',  'line',    '#d6d9df', '#4a4a4a', '#3a3d44'],
    ['--l-neutral-4',       '#444444',  'line',    '#ccd0d6', '#5c5c5c', '#4a4d54'],
    ['--l-neutral-5',       '#555555',  'line',    '#b9bec7', '#7a7a7a', '#5c6068'],
    ['--l-neutral-6',       '#666666',  'line',    '#a8aeb8', '#8f8f8f', '#6d717a'],
    ['--l-neutral-7',       '#777777',  'line',    '#9aa1ac', '#a3a3a3', '#7d828b'],
    ['--l-neutral-8',       '#888888',  'line',    '#7d848f', '#b5b5b5', '#8d929b'],
    ['--l-neutral-9',       '#999999',  'line',    '#6f7681', '#c4c4c4', '#9ba0a8'],

    ['--l-ink',             '#ffffff',  'ink',     '#1b2129', '#ffffff', '#d5dae3'],
    ['--l-ink-dim',         '#cccccc',  'ink',     '#39414c', '#f0f0f0', '#aeb5c0'],
    ['--l-ink-dim-2',       '#aaaaaa',  'ink',     '#4d5561', '#e0e0e0', '#98a0ac'],
    ['--l-ink-cool',        '#a0aec0',  'ink',     '#4a5566', '#dce6f5', '#93a0b3'],
    ['--l-ink-cool-2',      '#b2bec3',  'ink',     '#495259', '#e4eef2', '#a1abb1'],
    ['--l-ink-cool-3',      '#d1d5db',  'ink',     '#3b424c', '#f2f5f9', '#b4bac3'],
    ['--l-ink-slate',       '#636e72',  'ink',     '#5a646a', '#9aa8ae', '#727d83'],
    ['--l-ink-soft',        '#e8f0f7',  'ink',     '#2b323b', '#ffffff', '#c6ced8'],

    // Text printed ON a saturated fill (gold buttons, coloured chips). It has to
    // follow the fill, not the page: dark-theme accents are bright so the ink is
    // near-black, but the light theme DARKENS accents for page contrast, so there
    // the same ink must go white. Hence the flip in the light column.
    ['--l-on-accent',       '#0f1419',  'onDark',  '#ffffff', '#000000', '#12161d'],
];

/* ────────────────────────────────────────────────────────────────────────────
   1b. The pre-existing design-system tokens (from the .fuoc-ui overhaul).
   These already back the redesigned components, so every theme must restate
   them. Dark column repeats today's value so nothing shifts on the default.
   ──────────────────────────────────────────────────────────────────────────── */

// prettier-ignore
export const SEMANTIC = [
    // token              dark        light      hcDark     dim
    ['--bg',             '#0a0d13', '#eceef3', '#000000', '#151920'],
    ['--surface',        '#111722', '#f8f9fc', '#08090d', '#1c212a'],
    ['--surface-2',      '#18202e', '#f1f3f8', '#0e1118', '#232935'],
    ['--surface-3',      '#1f2937', '#e9edf4', '#151a24', '#2a313e'],
    ['--border',         '#26303f', '#d4dae5', '#9aa7bd', '#313947'],
    ['--border-strong',  '#37445a', '#b6bfd0', '#7f8ea8', '#43506a'],
    ['--text',           '#e7ecf3', '#1b2129', '#ffffff', '#d5dae3'],
    ['--text-dim',       '#8a97ac', '#4a5566', '#d5dde8', '#98a4b6'],
    ['--text-mute',      '#5d6878', '#66707f', '#a9b4c2', '#6f7988'],
    ['--accent',         '#4c8dff', '#1b5fd0', '#7fb2ff', '#4a7fd6'],
    ['--accent-dim',     '#23314f', '#dbe6fb', '#12233d', '#28344c'],
    ['--accent-ink',     '#cfe0ff', '#0b3576', '#e8f1ff', '#bccfee'],
    ['--positive',       '#36b37e', '#127a51', '#4fe3a4', '#3d9d75'],
    ['--positive-dim',   '#143a2c', '#d6f2e5', '#0a2b1f', '#1a3b2f'],
    ['--danger',         '#e5484d', '#c01c22', '#ff7a7f', '#c9525a'],
    ['--danger-dim',     '#3a1719', '#fbdedf', '#2c0d0f', '#3b2024'],
    ['--warning',        '#f5a623', '#94620a', '#ffc457', '#d09441'],
    ['--warning-dim',    '#3a2c12', '#fbeed3', '#2b1f08', '#3a2f1b'],
    ['--accent-gold',    '#f5c542', '#8a6a05', '#ffdb6b', '#d3ac49'],
    ['--accent-gold-dim','#3a3112', '#faf0cf', '#2b2408', '#3a3320'],

    // chat bubble palette
    ['--chat-self',      '#38bdf8', '#0b6b93', '#7fd9ff', '#4098bf'],
    ['--chat-self-2',    '#2563eb', '#1b4bb8', '#6a9dff', '#3a5fbe'],
    ['--chat-self-fill', '#13243b', '#e2eefb', '#001a2e', '#1a2738'],
    ['--chat-other',     '#ff5ec8', '#a3128a', '#ff96dc', '#cc63ab'],
    ['--chat-other-2',   '#b832d6', '#8a1ba6', '#dd7cf0', '#9a4bb0'],
    ['--chat-narrator',  '#a855f7', '#6d21b8', '#c896ff', '#8f5cc4'],
    ['--chat-narrator-2','#7c3aed', '#5417b0', '#a986ff', '#6d4bb8'],
    ['--chat-memory',    '#f5b942', '#8a6207', '#ffd27a', '#cfa24b'],
    ['--chat-memory-2',  '#d97706', '#8a4d04', '#ffab4d', '#b0742f'],
];

/** Non-colour, per-theme values (shadows, glows, focus ring). */
// prettier-ignore
export const EFFECTS = [
    ['--shadow-1',
        '0 1px 2px rgba(0,0,0,0.45)', '0 1px 2px rgba(18,25,38,0.10)',
        '0 0 0 1px #ffffff40',        '0 1px 2px rgba(0,0,0,0.35)'],
    ['--shadow-2',
        '0 10px 30px rgba(0,0,0,0.5)', '0 8px 24px rgba(18,25,38,0.12)',
        '0 0 0 2px #ffffff33',         '0 10px 30px rgba(0,0,0,0.4)'],
    ['--sheet-shadow',
        '0 -14px 40px rgba(0,0,0,0.5)', '0 -10px 32px rgba(18,25,38,0.14)',
        '0 -2px 0 2px #ffffff33',       '0 -14px 40px rgba(0,0,0,0.4)'],
    // Backdrop behind modals — pure black at 70% is punishing in a light theme.
    ['--scrim',
        'rgba(0,0,0,0.7)', 'rgba(32,40,54,0.42)', 'rgba(0,0,0,0.88)', 'rgba(0,0,0,0.62)'],
    ['--focus-ring',
        '#7fb2ff', '#0b53c8', '#ffffff', '#6f9ad6'],
    // Multiplier the glow/neon rules read, so "reduce glow" and the flatter themes
    // can dial neon down without every rule being rewritten.
    ['--glow', '1', '0', '0.35', '0.5'],
];

/* ────────────────────────────────────────────────────────────────────────────
   2. Accents — the hue is kept; each theme re-tunes lightness for contrast.
   ──────────────────────────────────────────────────────────────────────────── */

// prettier-ignore
export const ACCENTS = [
    ['--l-indigo',        '#667eea'],   ['--l-indigo-lt',     '#7193ff'],
    ['--l-indigo-deep',   '#764ba2'],   ['--l-indigo-dark',   '#341f97'],
    ['--l-purple-deep',   '#533483'],

    ['--l-red',           '#e94560'],   ['--l-red-lt',        '#ff6b6b'],
    ['--l-red-2',         '#d63031'],   ['--l-red-3',         '#e74c3c'],
    ['--l-red-4',         '#ff4444'],   ['--l-red-dim',       '#c73e54'],
    ['--l-red-dark',      '#8b0000'],

    ['--l-green',         '#4ecca3'],   ['--l-green-2',       '#00b894'],
    ['--l-green-3',       '#2ecc71'],   ['--l-green-4',       '#06d6a0'],
    ['--l-green-lt',      '#5ad6a6'],   ['--l-green-lt-2',    '#55efc4'],
    ['--l-green-dark',    '#2d8a6e'],

    ['--l-cyan',          '#00d4ff'],   ['--l-cyan-dark',     '#0099cc'],
    ['--l-cyan-2',        '#3fc7ff'],   ['--l-cyan-3',        '#3dd6ed'],
    ['--l-teal',          '#4ecdc4'],   ['--l-teal-2',        '#00cec9'],
    ['--l-blue',          '#3498db'],   ['--l-blue-2',        '#0984e3'],
    ['--l-discord',       '#5865f2'],

    ['--l-gold',          '#ffd700'],   ['--l-gold-lt',       '#ffc457'],
    ['--l-orange',        '#ffa500'],   ['--l-orange-2',      '#ff9800'],
    ['--l-orange-3',      '#ff9500'],   ['--l-orange-4',      '#e67e22'],
    ['--l-orange-red',    '#ff4500'],   ['--l-amber',         '#f39c12'],
    ['--l-amber-2',       '#f9a826'],   ['--l-amber-3',       '#f9a825'],
    ['--l-amber-4',       '#ffa726'],   ['--l-amber-5',       '#ff9f1c'],
    ['--l-yellow',        '#f9ca24'],   ['--l-yellow-2',      '#f1c40f'],

    ['--l-pink',          '#ff6b9d'],   ['--l-pink-2',        '#e84393'],
    ['--l-pink-lt',       '#fd79a8'],   ['--l-pink-3',        '#ff69b4'],
    ['--l-pink-pale',     '#f093fb'],   ['--l-magenta',       '#f72585'],
    ['--l-magenta-2',     '#b5179e'],   ['--l-crimson',       '#ff0055'],
    ['--l-plum',          '#6b2d5b'],

    ['--l-violet',        '#c77dff'],   ['--l-violet-2',      '#9b59b6'],
    ['--l-violet-3',      '#9d4edd'],   ['--l-violet-4',      '#8e44ad'],
    ['--l-violet-lt',     '#a29bfe'],   ['--l-violet-deep',   '#6c5ce7'],
    ['--l-violet-deep-2', '#7c3aed'],
];

/* ────────────────────────────────────────────────────────────────────────────
   2b. Translucent fills.
   `background: rgba(0,0,0,.3)` inset panels are everywhere. Left alone they stay
   dark holes in a light theme, so each alpha step gets a token. In light themes the
   veil inverts to a faint cool grey (same alpha maths, far lower opacity) so dark
   ink on top keeps its contrast.
   Modal *backdrops* use the same tokens and still read as a dim — just gentler.
   ──────────────────────────────────────────────────────────────────────────── */

export const VEIL_ALPHAS = [
    0.05, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9,
    0.92, 0.95, 0.98,
];

const a = (n) => String(Math.round(n * 100) / 100);
const clamp01 = (n) => Math.max(0, Math.min(1, n));

/** Dark veils (rgba black) — the inset/scrim family. */
export const VEILS = VEIL_ALPHAS.map((alpha) => ({
    token: `--l-veil-${String(Math.round(alpha * 100)).padStart(2, '0')}`,
    alpha,
    dark: `rgba(0, 0, 0, ${a(alpha)})`,
    light: `rgba(28, 36, 50, ${a(clamp01(alpha * 0.45))})`,
    hc: `rgba(0, 0, 0, ${a(clamp01(alpha * 1.15))})`,
    dim: `rgba(0, 0, 0, ${a(clamp01(alpha * 0.9))})`,
}));

/** Light veils (rgba white) — hairline highlights, hover washes. Must invert. */
export const SHEENS = VEIL_ALPHAS.map((alpha) => ({
    token: `--l-sheen-${String(Math.round(alpha * 100)).padStart(2, '0')}`,
    alpha,
    dark: `rgba(255, 255, 255, ${a(alpha)})`,
    light: `rgba(20, 28, 42, ${a(clamp01(alpha * 0.5))})`,
    hc: `rgba(255, 255, 255, ${a(clamp01(alpha * 1.25))})`,
    dim: `rgba(255, 255, 255, ${a(clamp01(alpha * 0.85))})`,
}));

/** rgba(...) literal -> token, for the codemod. Keyed on normalised text. */
export function buildAlphaMap() {
    const map = new Map();
    for (const v of VEILS) map.set(`rgba(0,0,0,${a(v.alpha)})`, v.token);
    for (const s of SHEENS) map.set(`rgba(255,255,255,${a(s.alpha)})`, s.token);
    return map;
}

/* ────────────────────────────────────────────────────────────────────────────
   3. Themes
   ──────────────────────────────────────────────────────────────────────────── */

export const THEMES = [
    {
        id: 'dark',
        label: 'Midnight (default)',
        idx: 0,
        // Accents unchanged — guarantees the codemod is a visual no-op here.
        accent: (hex) => hex,
        pageBg: '#0f1419',
    },
    {
        id: 'light',
        label: 'Daylight',
        idx: 1,
        // Astigmatism-friendly: darken accents onto the off-white page so text and
        // fills clear 4.5:1, and cap saturation so nothing glares.
        accent: (hex) => {
            const c = forceContrast(hex, '#eceef3', 4.5, -1);
            const h = hsl(c);
            return fromHsl({ h: h.h, s: Math.min(h.s, 0.72), l: Math.min(h.l, 0.46) });
        },
        pageBg: '#eceef3',
    },
    {
        id: 'hc-dark',
        label: 'High Contrast',
        idx: 2,
        // Push every accent to 7:1 on pure black.
        accent: (hex) => {
            const c = forceContrast(hex, '#000000', 7, 1);
            const h = hsl(c);
            return fromHsl({ h: h.h, s: Math.min(1, h.s * 1.1), l: Math.max(h.l, 0.6) });
        },
        pageBg: '#000000',
    },
    {
        id: 'dim',
        label: 'Dimmed',
        idx: 3,
        // Low-glare dark: desaturate and pull toward mid-lightness so nothing burns.
        accent: (hex) => {
            const h = hsl(hex);
            return fromHsl({ h: h.h, s: h.s * 0.72, l: h.l * 0.82 + 0.06 });
        },
        pageBg: '#171b22',
    },
];

/** literal -> { token, role } for every colour the codemod knows how to replace. */
export function buildMap() {
    const map = new Map();
    for (const row of STRUCTURAL) {
        const [token, legacy, role] = row;
        // 'onDark' is reachable only through the codemod's "dark literal used as text"
        // rule. Keying it by its literal would make it shadow --l-bg, which shares the
        // same #0f1419 — and every page background would then flip to white ink.
        if (role === 'onDark') continue;
        map.set(legacy, { token, role, row });
        // 3-digit shorthand spelling of the same colour (e.g. #333 for #333333)
        const short = shorthand(legacy);
        if (short) map.set(short, { token, role, row });
    }
    for (const [token, legacy] of ACCENTS) {
        map.set(legacy, { token, role: 'accent' });
        const short = shorthand(legacy);
        if (short) map.set(short, { token, role: 'accent' });
    }
    return map;
}

/**
 * One-off dark surfaces and greys (~300 literals used once or twice each) would
 * stay dark holes in a light theme. Rather than mint a token per one-off, snap them
 * to the nearest structural token — but only when the colour is close enough that
 * the dark theme can't tell the difference. Saturated one-offs (a brown, a maroon)
 * fail the distance test and keep their literal, which is the right call: they are
 * decorative accents, not structure.
 */
export function snapToStructural(hex, maxDistance = 0.06) {
    const { s, l } = hsl(hex);
    let band;
    if (l <= 0.34) band = ['surface', 'line'];
    else if (s <= 0.16 && l >= 0.5) band = ['ink', 'line'];
    else return null;

    const target = parseRgb(hex);
    let best = null;
    for (const row of STRUCTURAL) {
        const [token, legacy, role] = row;
        if (!band.includes(role)) continue;
        // Distance alone would fold a dark maroon into a grey — close in RGB, obviously
        // different on screen. Require the hue to agree too (or the source to be near-grey).
        const t = hsl(legacy);
        const hueGap = Math.min(Math.abs(t.h - hsl(hex).h), 360 - Math.abs(t.h - hsl(hex).h));
        const hueOk = t.s <= 0.16 ? s <= 0.35 : hueGap <= 35 || s <= 0.2;
        if (!hueOk) continue;
        const d = rgbDistance(target, parseRgb(legacy));
        if (!best || d < best.d) best = { token, role, d };
    }
    if (!best || best.d > maxDistance) return null;
    return { token: best.token, role: best.role, distance: best.d };
}

function parseRgb(hex) {
    let h = hex.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbDistance(a, b) {
    const dr = (a[0] - b[0]) / 255,
        dg = (a[1] - b[1]) / 255,
        db = (a[2] - b[2]) / 255;
    return Math.sqrt(dr * dr + dg * dg + db * db) / Math.sqrt(3);
}

function shorthand(hex) {
    const h = hex.slice(1);
    if (h.length !== 6) return null;
    if (h[0] === h[1] && h[2] === h[3] && h[4] === h[5]) return `#${h[0]}${h[2]}${h[4]}`;
    return null;
}

/** Resolved value of `token` in `theme`. */
export function valueFor(token, theme) {
    const s = STRUCTURAL.find((r) => r[0] === token);
    // STRUCTURAL row: [token, legacy, role, light, hc, dim] — dark reuses the legacy literal.
    if (s) return theme.idx === 0 ? s[1] : s[theme.idx + 2];
    const a = ACCENTS.find((r) => r[0] === token);
    if (a) return theme.accent(a[1]);
    // SEMANTIC / EFFECTS row: [token, dark, light, hc, dim]
    const t = SEMANTIC.find((r) => r[0] === token) || EFFECTS.find((r) => r[0] === token);
    if (t) return t[theme.idx + 1];
    const v = VEILS.find((r) => r.token === token) || SHEENS.find((r) => r.token === token);
    if (v) return v[['dark', 'light', 'hc', 'dim'][theme.idx]];
    return null;
}

/** Lowest accent contrast in a theme — sanity metric printed by the generator. */
export function auditTheme(theme) {
    const bg = theme.pageBg;
    const worst = ACCENTS.map(([token, legacy]) => ({
        token,
        value: theme.accent(legacy),
        ratio: contrast(theme.accent(legacy), bg),
    })).sort((a, b) => a.ratio - b.ratio);
    return worst;
}
