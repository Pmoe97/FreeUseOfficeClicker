// Collapse the source indentation carried inside HTML-producing string/template
// literals, and compute the set of top-level names that must NOT be mangled.
//
// Terser never touches string contents, so ~165k chars of template-literal indentation
// survives minification. acorn locates the literals precisely; the rewrite is
// whitespace-only and guarded.

import { parse } from 'acorn';
import { looksLikeHtml, collapseHtmlLiteral, sameIgnoringWhitespace } from './minify.mjs';

/**
 * @returns {{ code: string, saved: number, touched: number, skipped: number }}
 */
export function collapseHtmlLiterals(code) {
    let ast;
    try {
        ast = parse(code, { ecmaVersion: 'latest', sourceType: 'script' });
    } catch (e) {
        throw new Error(`acorn could not parse a <script> block: ${e.message}`);
    }

    const edits = [];
    let skipped = 0;

    walk(ast, (node) => {
        let start, end;
        if (node.type === 'Literal' && typeof node.value === 'string') {
            // inside the quotes only
            start = node.start + 1;
            end = node.end - 1;
        } else if (node.type === 'TemplateElement') {
            start = node.start;
            end = node.end;
        } else {
            return;
        }
        if (end <= start) return;

        const raw = code.slice(start, end);
        if (!/\s{2,}|\\n|[\r\n]/.test(raw)) return; // nothing to gain
        if (!looksLikeHtml(raw)) {
            skipped++;
            return;
        }
        const next = collapseHtmlLiteral(raw);
        if (next === raw) return;
        if (!sameIgnoringWhitespace(raw, next)) {
            skipped++;
            return; // refuse anything that changed more than whitespace
        }
        edits.push({ start, end, next, saved: raw.length - next.length });
    });

    let out = code;
    for (const e of edits.sort((a, b) => b.start - a.start)) {
        out = out.slice(0, e.start) + e.next + out.slice(e.end);
    }

    return {
        code: out,
        saved: edits.reduce((s, e) => s + e.saved, 0),
        touched: edits.length,
        skipped,
    };
}

/**
 * Names that terser must keep, because something outside the JS scope graph refers to
 * them by string: inline handlers, dynamic dispatch, window["x"], and any identifier
 * that happens to appear inside a string literal.
 *
 * Conservative on purpose — a false positive only costs a few bytes, while a false
 * negative silently breaks a button.
 */
export function computeReservedNames(fullHtml, jsBlocks) {
    const reserved = new Set();
    const IDENT = /[A-Za-z_$][\w$]*/g;

    // 1. every identifier-shaped token in the markup outside <script>
    const markup = fullHtml.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
    for (const m of markup.matchAll(IDENT)) reserved.add(m[0]);

    // 2. every identifier-shaped token inside any JS string or template literal
    for (const code of jsBlocks) {
        if (!code.trim()) continue;
        let ast;
        try {
            ast = parse(code, { ecmaVersion: 'latest', sourceType: 'script' });
        } catch {
            // If a block won't parse, reserve everything identifier-shaped in it.
            for (const m of code.matchAll(IDENT)) reserved.add(m[0]);
            continue;
        }
        walk(ast, (node) => {
            let text = null;
            if (node.type === 'Literal' && typeof node.value === 'string') text = node.value;
            else if (node.type === 'TemplateElement') text = node.value.raw;
            else if (node.type === 'MemberExpression' && node.object?.name === 'window' && node.property?.name) {
                reserved.add(node.property.name); // window.foo = …
            }
            if (text) for (const m of text.matchAll(IDENT)) reserved.add(m[0]);
        });
    }

    return reserved;
}

/** Top-level declared names, so the build can report what is/isn't manglable. */
export function topLevelNames(code) {
    const names = new Set();
    let ast;
    try {
        ast = parse(code, { ecmaVersion: 'latest', sourceType: 'script' });
    } catch {
        return names;
    }
    for (const node of ast.body) {
        if ((node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') && node.id) names.add(node.id.name);
        if (node.type === 'VariableDeclaration')
            for (const d of node.declarations) if (d.id.type === 'Identifier') names.add(d.id.name);
    }
    return names;
}

function walk(node, visit) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
        for (const n of node) walk(n, visit);
        return;
    }
    if (node.type) visit(node);
    for (const k in node) {
        if (k === 'type' || k === 'start' || k === 'end' || k === 'loc' || k === 'range') continue;
        walk(node[k], visit);
    }
}
