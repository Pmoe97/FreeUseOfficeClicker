// Prints the DisplaySettings THEMES entries with swatches taken from the real palette,
// so the picker previews cannot drift from what a theme actually looks like.
//
//   npm run theme:picker
//
// Paste the output between the fuoc-codemod:ignore markers in index.html (the
// display-settings boot script near the top — it stays inline so the theme applies
// before first paint).

import { THEMES, valueFor } from './palette.mjs';

const BLURB = {
    dark: 'The original dark navy look.',
    light: 'Off-white and low-glare — easier with astigmatism.',
    'hc-dark': 'Pure black with brightened text and strong borders.',
    dim: 'Muted and soft for long sessions or light sensitivity.',
    crimson: 'Near-black with red-tinted panels. Aggressive.',
    'terminal-green': 'Phosphor green on black, like an old CRT.',
    'terminal-amber': 'Amber phosphor on black. Warmer than green.',
    ocean: 'Deep navy-teal with cyan accents. Cool and calm.',
    synthwave: 'Violet and magenta neon on near-black.',
    slate: 'Neutral grey with no colour cast at all.',
    nordic: 'Soft desaturated blue-grey. Low contrast.',
    sepia: 'Warm paper tones, low blue light.',
};

// The picker has less room than the generator's report, so a couple of names are shorter.
const LABEL = { dark: 'Midnight' };

const GROUP = {
    dark: 'Standard',
    light: 'Standard',
    auto: 'Standard',
    'hc-dark': 'Easy on the eyes',
    dim: 'Easy on the eyes',
    sepia: 'Easy on the eyes',
    nordic: 'Easy on the eyes',
    crimson: 'Flavour',
    ocean: 'Flavour',
    synthwave: 'Flavour',
    slate: 'Flavour',
    'terminal-green': 'Flavour',
    'terminal-amber': 'Flavour',
};

const ORDER = [
    'dark', 'light', 'auto',
    'hc-dark', 'dim', 'sepia', 'nordic',
    'crimson', 'ocean', 'synthwave', 'slate', 'terminal-green', 'terminal-amber',
];

const byId = new Map(THEMES.map((t) => [t.id, t]));

const entry = (id) => {
    if (id === 'auto') {
        return [
            '            {',
            '                id: "auto",',
            '                label: "Match System",',
            '                group: "Standard",',
            '                blurb: "Follows your device\'s light/dark setting.",',
            '                swatch: ["#171b22", "#eceef3", "#4c8dff", "#36b37e"],',
            '            },',
        ].join('\n');
    }
    const t = byId.get(id);
    if (!t) throw new Error('unknown theme ' + id);
    const swatch = [
        valueFor('--l-bg', t),
        valueFor('--l-panel', t),
        valueFor('--accent', t),
        valueFor('--positive', t),
    ];
    return [
        '            {',
        `                id: "${t.id}",`,
        `                label: "${LABEL[t.id] || t.label}",`,
        `                group: "${GROUP[t.id]}",`,
        `                blurb: "${BLURB[t.id]}",`,
        `                swatch: [${swatch.map((c) => `"${c}"`).join(', ')}],`,
        '            },',
    ].join('\n');
};

console.log('        var THEMES = [');
for (const id of ORDER) console.log(entry(id));
console.log('        ]; // fuoc-codemod:ignore-end');
