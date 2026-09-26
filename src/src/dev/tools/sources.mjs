// Where the game's source lives, for the theme/CSS tooling.
//
// The game used to be one index.html. It is now the Perchance file-tree layout:
//   index.html                      markup + the small inline boot scripts
//   src/src/srcfiles/css/*.css      the stylesheet, in cascade order
//   src/src/srcfiles/js/*.js        the game script, in load order
// Tools that scan for colour literals read ALL of it. Tools that rewrite use
// joinForRewrite/splitRewritten so a pass runs over one string exactly as it did on
// the monolith (cross-file context intact), then lands back in the right files.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const REPO = join(here, '..', '..', '..', '..'); // src/src/dev/tools -> repo root
export const SRCFILES = join(REPO, 'src', 'src', 'srcfiles');
export const INDEX = join(REPO, 'index.html');

const listDir = (sub, ext) =>
    readdirSync(join(SRCFILES, sub))
        .filter((f) => f.endsWith(ext))
        .sort()
        .map((f) => join(SRCFILES, sub, f));
export const cssPaths = () => listDir('css', '.css');
export const jsPaths = () => listDir('js', '.js');
export const allPaths = () => [INDEX, ...cssPaths(), ...jsPaths()];

/** Repo-relative, forward-slash path for messages. */
export const rel = (p) => relative(REPO, p).replace(/\\/g, '/');

/** [{ path, rel, text }] for the given paths (default: every source file). */
export function readSources(paths = allPaths()) {
    return paths.map((p) => ({ path: p, rel: rel(p), text: readFileSync(p, 'utf8') }));
}

/** Every source file as one string, for read-only scans. */
export const readAllText = (paths) => readSources(paths).map((f) => f.text).join('\n');

// A boundary marker no pass will touch: a comment with no colour, no backtick, no `${`.
const mark = (i) => `\n/*@@fuoc-source-boundary:${i}@@*/\n`;

export function joinForRewrite(files) {
    return files.map((f, i) => mark(i) + f.text).join('');
}

/** Inverse of joinForRewrite. Throws if a pass disturbed a marker. */
export function splitRewritten(joined, files) {
    const out = [];
    for (let i = 0; i < files.length; i++) {
        const start = joined.indexOf(mark(i));
        if (start === -1) throw new Error(`source boundary ${i} (${files[i].rel}) lost during rewrite`);
        const from = start + mark(i).length;
        const next = i + 1 < files.length ? joined.indexOf(mark(i + 1), from) : joined.length;
        if (next === -1) throw new Error(`source boundary ${i + 1} lost during rewrite`);
        out.push(joined.slice(from, next));
    }
    return out;
}

/** Write back only the files whose text changed. Returns the rel paths written. */
export function writeChanged(files, texts) {
    const written = [];
    files.forEach((f, i) => {
        if (texts[i] !== f.text) {
            writeFileSync(f.path, texts[i], 'utf8');
            written.push(f.rel);
        }
    });
    return written;
}
