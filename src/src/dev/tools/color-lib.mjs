// Shared colour helpers for the theme tooling (inventory / codemod / token generator).
//
// Everything here is pure maths on sRGB hex strings -- no browser features, so the
// generated CSS is plain hex and works everywhere (no color-mix() dependency).

export const HEX_RE = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;

/** "#abc" | "#aabbcc" -> {r,g,b} 0-255 */
export function parseHex(hex) {
    let h = hex.replace('#', '').toLowerCase();
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
    };
}

export function toHex({ r, g, b }) {
    const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${c(r)}${c(g)}${c(b)}`;
}

/** sRGB -> HSL with h in [0,360), s/l in [0,1] */
export function rgbToHsl({ r, g, b }) {
    const R = r / 255,
        G = g / 255,
        B = b / 255;
    const max = Math.max(R, G, B),
        min = Math.min(R, G, B);
    const l = (max + min) / 2;
    let h = 0,
        s = 0;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) * 60;
        else if (max === G) h = ((B - R) / d + 2) * 60;
        else h = ((R - G) / d + 4) * 60;
    }
    return { h, s, l };
}

export function hslToRgb({ h, s, l }) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = (((h % 360) + 360) % 360) / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let [r, g, b] = [0, 0, 0];
    if (hp < 1) [r, g, b] = [c, x, 0];
    else if (hp < 2) [r, g, b] = [x, c, 0];
    else if (hp < 3) [r, g, b] = [0, c, x];
    else if (hp < 4) [r, g, b] = [0, x, c];
    else if (hp < 5) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    const m = l - c / 2;
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

export function hsl(hex) {
    return rgbToHsl(parseHex(hex));
}

export function fromHsl({ h, s, l }) {
    return toHex(hslToRgb({ h, s: Math.max(0, Math.min(1, s)), l: Math.max(0, Math.min(1, l)) }));
}

/** WCAG relative luminance */
export function luminance(hex) {
    const { r, g, b } = parseHex(hex);
    const lin = (v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two hex colours (1..21) */
export function contrast(a, b) {
    const la = luminance(a),
        lb = luminance(b);
    const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
}

/**
 * Walk lightness until `hex` clears `min` contrast against `bg`.
 * dir: -1 darkens (for light themes), +1 lightens (for dark themes).
 * Hue is preserved; saturation may be nudged so very pale colours can still land.
 */
export function forceContrast(hex, bg, min, dir) {
    const base = hsl(hex);
    let best = fromHsl(base);
    if (contrast(best, bg) >= min) return best;
    for (let step = 1; step <= 100; step++) {
        const l = base.l + dir * step * 0.01;
        if (l < 0 || l > 1) break;
        // Boost saturation slightly as we move so hues stay recognisable.
        const s = Math.min(1, base.s * (1 + step * 0.004));
        const candidate = fromHsl({ h: base.h, s, l });
        best = candidate;
        if (contrast(candidate, bg) >= min) return candidate;
    }
    return best;
}

/** Is this colour effectively grey/near-grey? */
export function isAchromatic(hex, satMax = 0.16) {
    return hsl(hex).s <= satMax;
}
