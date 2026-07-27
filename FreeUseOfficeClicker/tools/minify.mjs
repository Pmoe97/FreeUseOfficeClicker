// Conservative minifiers for the parts of index.html the build used to leave alone:
// CSS, HTML markup, and the HTML that lives inside JS template literals.
//
// Everything here is whitespace-only or comment-only removal. Nothing reorders, renames
// or rewrites a value, so each transform is verifiable: strip all whitespace from the
// before and after and the two must be identical. build-perchance.mjs asserts exactly
// that, which is what makes this safe to run over 100k lines nobody will re-read.

/* ────────────────────────────────────────────────────────────────────────────
   CSS
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Strip comments and collapse whitespace in a stylesheet.
 *
 * Deliberately does NOT remove the space *before* a colon: at selector level
 * `a :hover` (descendant) and `a:hover` (pseudo) are different rules. Spaces before
 * `(` stay too, so `and (max-width:700px)` keeps working.
 */
export function minifyCss(css) {
    let out = '';
    let i = 0;
    let depth = 0; // brace depth: >0 means we're inside a declaration block
    const n = css.length;

    while (i < n) {
        const c = css[i];

        // comments
        if (c === '/' && css[i + 1] === '*') {
            const end = css.indexOf('*/', i + 2);
            i = end === -1 ? n : end + 2;
            continue;
        }

        // strings — copied verbatim
        if (c === '"' || c === "'") {
            const quote = c;
            let j = i + 1;
            while (j < n) {
                if (css[j] === '\\') j += 2;
                else if (css[j] === quote) break;
                else j++;
            }
            out += css.slice(i, j + 1);
            i = j + 1;
            continue;
        }

        // url(...) — copied verbatim, may contain unquoted punctuation
        if ((c === 'u' || c === 'U') && /^url\(/i.test(css.slice(i, i + 4))) {
            const end = css.indexOf(')', i);
            out += css.slice(i, end === -1 ? n : end + 1);
            i = end === -1 ? n : end + 1;
            continue;
        }

        // whitespace runs → single space, then dropped next to safe punctuation
        if (/\s/.test(c)) {
            let j = i;
            while (j < n && /\s/.test(css[j])) j++;
            const prev = out[out.length - 1] || '';
            const next = css[j] || '';
            const dropAfter = '{};,:>+~(';
            const dropBefore = '{};,>+~)!';
            if (!dropAfter.includes(prev) && !dropBefore.includes(next)) out += ' ';
            i = j;
            continue;
        }

        if (c === '{') depth++;
        if (c === '}') {
            depth = Math.max(0, depth - 1);
            // drop the final semicolon in a block
            while (out.endsWith(';') || out.endsWith(' ')) out = out.slice(0, -1);
        }

        // inside a declaration block, `prop: value` can lose the space after the colon
        if (c === ':' && depth > 0) {
            out += ':';
            i++;
            while (i < n && /[ \t]/.test(css[i])) i++;
            continue;
        }

        out += c;
        i++;
    }

    return out.trim();
}

/* ────────────────────────────────────────────────────────────────────────────
   HTML markup
   ──────────────────────────────────────────────────────────────────────────── */

// Whitespace inside these is content, not formatting.
const VERBATIM_TAGS = ['script', 'style', 'textarea', 'pre'];
// Attributes whose values are whitespace-insensitive, so their indentation can go.
// (This is where the bulk of the savings is: prettier wraps long style="" values
// across many lines.)
const COLLAPSIBLE_ATTRS = new Set(['style', 'class']);

/**
 * Collapse formatting whitespace in HTML markup and drop comments.
 *
 * Whitespace runs become a single space rather than nothing: HTML renders a run of
 * whitespace as one space, so this is rendering-equivalent even between inline
 * elements, where deleting it outright would visibly join words.
 */
export function minifyMarkup(html, { stripComments = true } = {}) {
    let out = '';
    let i = 0;
    const n = html.length;

    while (i < n) {
        // comments
        if (html.startsWith('<!--', i)) {
            const end = html.indexOf('-->', i + 4);
            const stop = end === -1 ? n : end + 3;
            if (!stripComments) out += html.slice(i, stop);
            i = stop;
            continue;
        }

        // whitespace-sensitive elements: copy through, untouched
        const verbatim = VERBATIM_TAGS.find((t) => startsTag(html, i, t));
        if (verbatim) {
            const close = html.toLowerCase().indexOf('</' + verbatim, i);
            const end = close === -1 ? n : html.indexOf('>', close);
            out += html.slice(i, end === -1 ? n : end + 1);
            i = end === -1 ? n : end + 1;
            continue;
        }

        // a tag
        if (html[i] === '<') {
            const tagEnd = findTagEnd(html, i);
            out += minifyTag(html.slice(i, tagEnd));
            i = tagEnd;
            continue;
        }

        // text node
        let j = i;
        while (j < n && html[j] !== '<') j++;
        out += html.slice(i, j).replace(/\s+/g, ' ');
        i = j;
    }

    return out;
}

function startsTag(html, i, tag) {
    if (html[i] !== '<') return false;
    const rest = html.slice(i + 1, i + 1 + tag.length + 1).toLowerCase();
    return rest === tag + ' ' || rest === tag + '>' || rest === tag + '\n' || rest === tag + '\r';
}

/** End index (exclusive) of the tag starting at `i`, respecting quoted values. */
function findTagEnd(html, i) {
    let j = i + 1;
    let quote = null;
    while (j < html.length) {
        const c = html[j];
        if (quote) {
            if (c === quote) quote = null;
        } else if (c === '"' || c === "'") {
            quote = c;
        } else if (c === '>') {
            return j + 1;
        }
        j++;
    }
    return html.length;
}

/** Collapse whitespace between attributes, and inside style=/class= values. */
function minifyTag(tag) {
    let out = '';
    let i = 0;
    const n = tag.length;
    let lastAttr = '';

    while (i < n) {
        const c = tag[i];

        if (c === '"' || c === "'") {
            const quote = c;
            let j = i + 1;
            while (j < n && tag[j] !== quote) j++;
            const value = tag.slice(i + 1, j);
            out += quote + (COLLAPSIBLE_ATTRS.has(lastAttr) ? value.replace(/\s+/g, ' ').trim() : value) + quote;
            i = j + 1;
            continue;
        }

        if (/\s/.test(c)) {
            let j = i;
            while (j < n && /\s/.test(tag[j])) j++;
            const next = tag[j] || '';
            // no space needed before the tag's own '>' or '/>'
            out += next === '>' || (next === '/' && tag[j + 1] === '>') ? '' : ' ';
            i = j;
            continue;
        }

        // remember the attribute name we're about to read a value for
        const attr = tag.slice(i).match(/^([a-zA-Z-]+)\s*=/);
        if (attr) {
            lastAttr = attr[1].toLowerCase();
            out += attr[0].replace(/\s*=$/, '=');
            i += attr[0].length;
            continue;
        }

        out += c;
        i++;
    }
    return out;
}

/* ────────────────────────────────────────────────────────────────────────────
   HTML inside JS string / template literals
   ──────────────────────────────────────────────────────────────────────────── */

// Real markup: a closing tag, a self-closing tag, or a known element with attributes.
const HTML_SIGNS =
    /<\/[a-z][a-z0-9]*>|\/>|<(?:div|span|button|img|input|label|table|tr|td|th|ul|ol|li|p|h[1-6]|a|select|option|textarea|form|section|header|footer|strong|em|b|i|small|br|hr|style)[\s>]/i;

/**
 * Is this literal HTML markup we can safely reflow?
 *
 * Prompt strings are the thing to stay away from: their newlines and bullet layout are
 * part of what the model is being told, and several of them mention tags in passing
 * ("send me your <body>"), so tag-detection alone would misfire. Requiring real markup
 * AND rejecting anything that smells like a prompt keeps them out.
 */
export function looksLikeHtml(raw) {
    if (!HTML_SIGNS.test(raw)) return false;
    // `white-space: pre-*` turns whitespace back into content, and it can apply to text
    // written inline in the literal. Too fiddly to segment for the ~10 literals involved.
    if (/pre-wrap|pre-line|break-spaces/i.test(raw)) return false;
    // prompt/instruction text: numbered or bulleted lines, or an ALL-CAPS directive
    if (/(?:^|\\n|\n)\s*(?:[-*•]|\d+[.)])\s/.test(raw) && !/<\/(?:li|p|div)>/i.test(raw)) return false;
    if (/CRITICAL|INSTRUCTIONS?:|RULES\b|Return ONLY|You are\b/.test(raw)) return false;
    return true;
}

// Inside these, whitespace is the element's value. A literal containing one is still
// worth collapsing everywhere else — the largest literal in the file (46k, the
// custom-employee form) was being skipped entirely because of one <textarea> near its end.
const VERBATIM_REGION = /<(textarea|pre)\b[\s\S]*?<\/\1\s*>/gi;
const SENTINEL = '\u0000';

/**
 * Collapse formatting whitespace in an HTML-bearing literal, handling both real
 * newlines (template literals) and escaped ones (quoted strings), and leaving
 * <textarea>/<pre> regions exactly as they were.
 */
export function collapseHtmlLiteral(raw) {
    const keep = [];
    // Park verbatim regions behind NUL-delimited placeholders. A printable placeholder
    // would be unsafe: " 0 " occurs in ordinary HTML text ("Level 0 "), and the restore
    // pass would then splice a <textarea> into the wrong place.
    const parked = raw.replace(VERBATIM_REGION, (m) => {
        keep.push(m);
        return SENTINEL + (keep.length - 1) + SENTINEL;
    });

    const collapsed = parked
        // escaped newline/tab + indentation → single space
        .replace(/(?:\\n|\\r|\\t)+(?:[ \t]|\\t)*/g, ' ')
        // real newline + indentation → single space
        .replace(/[\r\n]+[ \t]*/g, ' ')
        // long runs of plain spaces → one
        .replace(/[ \t]{2,}/g, ' ');

    if (!keep.length) return collapsed;
    return collapsed.replace(new RegExp(SENTINEL + '(\\d+)' + SENTINEL, 'g'), (_, i) => keep[Number(i)]);
}

/** Same content once all whitespace is ignored? Used as the transform's guard. */
export function sameIgnoringWhitespace(a, b) {
    const strip = (s) => s.replace(/\\n|\\r|\\t/g, '').replace(/\s+/g, '');
    return strip(a) === strip(b);
}
