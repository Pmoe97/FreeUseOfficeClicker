// Build step: minify index.html into a paste-into-Perchance artifact.
//
//   node build-perchance.mjs   (or: npm run build)
//
// Source of truth stays the readable index.html. This emits index.perchance.html,
// which is what you paste into the Perchance generator's HTML section.
//
// STAGES — each verifies itself before the next runs
//   1. HTML-in-JS literals   collapse the source indentation carried inside template
//                            literals. Terser never touches string contents, so ~165k
//                            chars of markup indentation used to survive minification.
//   2. terser                per <script>. Locals always mangled; top-level names too,
//                            minus a reserved set computed from every identifier that
//                            appears in a string or in the markup (inline handlers,
//                            dynamic dispatch, window.*). compress.toplevel stays FALSE
//                            so nothing is ever dropped.
//   3. CSS                   comments + whitespace, string/url aware.
//   4. markup                formatting whitespace + HTML comments, skipping
//                            script/style/textarea/pre.
//   5. token names           --l-panel-deep-2 → --ab across CSS, markup and JS strings.
//                            The source keeps its readable names.
//   6. line endings          CRLF → LF (the source is CRLF; that alone is ~35k chars).
//
// Why this is safe over 100k lines nobody re-reads: stages 1, 3 and 4 only remove
// whitespace and comments, and each asserts its output is identical to its input once
// all whitespace is stripped. Stage 5 asserts a 1:1 rename with unchanged var() and
// definition counts. Stage 2 leans on terser's AST plus the handler / window-exposure
// checks. Any failure aborts with a non-zero exit and the artifact is not trusted.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { minify as terserMinify } from 'terser';
import { minifyCss, minifyMarkup } from './tools/minify.mjs';
import { collapseHtmlLiterals, computeReservedNames, topLevelNames } from './tools/minify-js-literals.mjs';
import { shortenTokens, verifyTokenRename } from './tools/minify-tokens.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, 'index.html');
const OUT = join(here, 'index.perchance.html');

// Perchance rejects an oversized HTML section *silently*: the server drops the save and
// the editor then warns that the browser-side backup is newer than what it can see.
// 3.95M chars was rejected, so the real ceiling is below that.
const HARD_LIMIT = 3_900_000;
const HEADROOM_TARGET = 3_000_000;

const TERSER_BASE = {
  compress: { toplevel: false, drop_console: false }, // never drop top-level decls
  format: { comments: false },
};

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const fmt = (n) => n.toLocaleString('en-US');
const stripAllWs = (s) => s.replace(/\s+/g, '');
const stripCssComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const stripHtmlComments = (s) => s.replace(/<!--[\s\S]*?-->/g, '');
// Stage 1 turns escaped newlines/tabs into spaces as well as real ones, so the guard
// has to treat "\n" (two chars in the source) as whitespace too.
const stripWsAndEscapes = (s) => s.replace(/\\n|\\r|\\t/g, '').replace(/\s+/g, '');
// A final `;` before `}` is optional in CSS; dropping it is not a content change.
const normaliseCss = (s) => stripAllWs(s).replace(/;\}/g, '}').replace(/;$/, '');

async function main() {
  const src = await readFile(SRC, 'utf8');
  const beforeBytes = Buffer.byteLength(src, 'utf8');
  const beforeChars = src.length;

  const problems = [];
  const stages = [];
  const stage = (label, saved, extra = '') => stages.push({ label, saved, extra });

  // Split structurally, once. This is what makes the <style> and </script> strings that
  // live INSIDE JS literals harmless — no regex ever has to guess which is which.
  const parts = splitDocument(src);
  const scriptCount = parts.filter((p) => p.kind === 'script' && p.body.trim()).length;
  const styleCount = parts.filter((p) => p.kind === 'style').length;

  // ---- Stage 1: HTML indentation inside JS literals ---------------------------
  const jsBefore = parts.filter((p) => p.kind === 'script').map((p) => p.body);
  const reserved = computeReservedNames(src, jsBefore);

  let litSaved = 0;
  let litTouched = 0;
  let litSkipped = 0;
  for (const part of parts) {
    if (part.kind !== 'script' || !part.body.trim()) continue;
    const before = part.body;
    const { code, saved, touched, skipped } = collapseHtmlLiterals(before);
    if (stripWsAndEscapes(before) !== stripWsAndEscapes(code)) {
      problems.push('Stage 1 changed more than whitespace inside a <script> block');
      continue;
    }
    part.body = code;
    litSaved += saved;
    litTouched += touched;
    litSkipped += skipped;
  }
  stage('HTML inside JS literals', litSaved, `${litTouched} collapsed, ${litSkipped} left alone (prompts etc.)`);

  // ---- Stage 2: terser --------------------------------------------------------
  const topNames = new Set();
  for (const b of jsBefore) for (const n of topLevelNames(b)) topNames.add(n);
  const manglable = [...topNames].filter((n) => !reserved.has(n));

  // compress.toplevel is deliberately OFF. Turning it on saves ~58k, but it drops 342
  // top-level declarations — and spot-checking showed live functions among them
  // (runFridayPayroll, updateGameTime, processPayrollConsequences...). They go because
  // dropping one dead root cascades into everything only that root called, so proving
  // the whole subtree dead is a separate audit. A wrong call here breaks a feature that
  // only fires on an in-game Friday, silently. Not a trade worth making for 1.7%.
  const terserOpts = { ...TERSER_BASE, mangle: { toplevel: true, reserved: [...reserved] } };
  let jsBeforeChars = 0;
  let jsAfterChars = 0;
  for (const part of parts) {
    if (part.kind !== 'script' || !part.body.trim()) continue;
    jsBeforeChars += part.body.length;
    const res = await terserMinify(part.body, terserOpts);
    if (res.error) throw res.error;
    part.body = res.code;
    jsAfterChars += part.body.length;
  }
  stage('JS (terser)', jsBeforeChars - jsAfterChars,
    `${manglable.length} top-level names mangled, ${topNames.size - manglable.length} reserved`);

  // ---- Stage 3: CSS -----------------------------------------------------------
  let cssSaved = 0;
  for (const part of parts) {
    if (part.kind !== 'style') continue;
    const min = minifyCss(part.body);
    if (normaliseCss(stripCssComments(part.body)) !== normaliseCss(min)) {
      problems.push('CSS minify changed more than whitespace/comments');
      continue;
    }
    cssSaved += part.body.length - min.length;
    part.body = min;
  }
  stage('CSS', cssSaved, `${styleCount} block(s)`);

  // ---- Stage 4: markup --------------------------------------------------------
  // Captured before the rewrite so the tag-skeleton check compares markup to markup —
  // counting tags document-wide would trip over `<style>` mentioned inside a CSS comment.
  const markupBefore = parts.filter((p) => p.kind === 'markup').map((p) => p.body).join('');
  let mkSaved = 0;
  for (const part of parts) {
    if (part.kind !== 'markup') continue;
    const min = minifyMarkup(part.body);
    if (stripAllWs(stripHtmlComments(part.body)) !== stripAllWs(min)) {
      problems.push('Markup minify changed more than whitespace/comments');
      continue;
    }
    mkSaved += part.body.length - min.length;
    part.body = min;
  }
  stage('HTML markup', mkSaved);

  let out = joinDocument(parts);

  // ---- Stage 5: shorten custom-property names ---------------------------------
  const beforeTokens = out;
  const tok = shortenTokens(out);
  problems.push(...verifyTokenRename(beforeTokens, tok.text, tok.map));
  out = tok.text;
  stage('CSS token names', tok.saved, `${tok.renamed} renamed`);

  // ---- Stage 6: line endings --------------------------------------------------
  const beforeEol = out.length;
  out = out.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  stage('CRLF → LF', beforeEol - out.length);

  // --- Safety checks (against the final output) ---
  const minJs = collectJs(out);

  // 1) Every function referenced from an inline event handler must still exist.
  const handlerNames = collectHandlerNames(src);
  const missing = [...handlerNames].filter((name) => !hasToken(minJs, name));
  if (missing.length) {
    problems.push(`Handler function(s) missing from minified JS: ${missing.join(', ')}`);
  }

  // 2) Every reserved name that was declared at top level must survive verbatim —
  //    this is the check that catches an over-eager mangle.
  const lostReserved = [...topNames].filter((n) => reserved.has(n) && n.length > 2 && !hasToken(minJs, n));
  if (lostReserved.length) {
    problems.push(`Reserved top-level name(s) vanished: ${lostReserved.slice(0, 12).join(', ')}`);
  }

  // 3) window.X = exposures. terser MAY legitimately drop a global that is assigned
  //    but never read (dead code) -- that's a safe optimization, not breakage.
  const winNames = (s) => {
    const re = /\bwindow\.([A-Za-z_$][\w$]*)\s*=(?!=)/g;
    const set = new Set();
    let m;
    while ((m = re.exec(s))) set.add(m[1]);
    return set;
  };
  const winPre = winNames(collectJs(src));
  const winPost = winNames(minJs);
  const removedExposures = [...winPre].filter((n) => !winPost.has(n));
  const droppedButReferenced = removedExposures.filter(
    (n) => countMatches(src, new RegExp(`(?<![\\w$])${escapeRe(n)}(?![\\w$])`, 'g')) > 1
  );
  if (droppedButReferenced.length) {
    problems.push(`window exposure removed but still referenced elsewhere: ${droppedButReferenced.join(', ')}`);
  }

  // 3b) <textarea>/<pre> content is the element's VALUE — whitespace in there is not
  //     formatting. Both the markup pass and the JS-literal pass are supposed to leave
  //     those regions alone; this proves it, including for the ones written inside JS
  //     template literals (where the artifact escapes newlines, hence the normalising).
  //     Contents that are a `${…}` interpolation are excluded: those are JS, which
  //     terser is entitled to reformat (`a || ""` → `a||""`), and comparing them would
  //     report a difference that has nothing to do with whitespace-as-content.
  const verbatimContents = (html) =>
    [...html.matchAll(/<(textarea|pre)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)]
      .map((m) => m[2].replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\r\n/g, '\n'))
      .filter((c) => !c.includes('${'))
      .sort();
  const vBefore = verbatimContents(src);
  const vAfter = verbatimContents(out);
  if (vBefore.length !== vAfter.length) {
    problems.push(`textarea/pre count changed: ${vBefore.length} → ${vAfter.length}`);
  } else {
    const changed = vBefore.filter((c, i) => c !== vAfter[i]);
    if (changed.length) {
      problems.push(`textarea/pre content changed in ${changed.length} element(s) — whitespace there is content`);
    }
  }

  // 4) Structural sanity: the markup tag skeleton must be unchanged. Compared over the
  //    markup parts only, with comments stripped — a CSS comment can mention `<style>`,
  //    and a document-wide count would report that as a lost tag.
  const markupAfter = parts.filter((p) => p.kind === 'markup').map((p) => p.body).join('');
  const tags = (s) => (stripHtmlComments(s).match(/<\/?[a-zA-Z][a-zA-Z0-9-]*/g) || []).length;
  if (tags(markupBefore) !== tags(markupAfter)) {
    problems.push(`HTML tag count changed: ${tags(markupBefore)} → ${tags(markupAfter)}`);
  }

  // --- Write artifact ---
  if (problems.length) {
    console.error('\nSAFETY CHECK FAILED — artifact NOT written:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  await writeFile(OUT, out, 'utf8');
  const afterBytes = Buffer.byteLength(out, 'utf8');
  const afterChars = out.length;

  // --- Report ---
  console.log('');
  console.log(`Minified ${scriptCount} <script> block(s) and ${styleCount} <style> block(s).`);
  console.log('');
  for (const s of stages) {
    console.log(`  ${s.label.padEnd(24)} -${fmt(s.saved).padStart(9)} chars` + (s.extra ? `   ${s.extra}` : ''));
  }
  console.log('');
  console.log(`  before:  ${kb(beforeBytes)}   ${fmt(beforeChars)} chars`);
  console.log(`  after:   ${kb(afterBytes)}   ${fmt(afterChars)} chars`);
  console.log(`  saved:   ${kb(beforeBytes - afterBytes)}   ` +
    `${(100 * (1 - afterChars / beforeChars)).toFixed(1)}% smaller`);
  console.log('');
  console.log(`  handler fns checked:   ${handlerNames.size} (all present: ${missing.length === 0})`);
  console.log(`  window.X= exposures:   ${winPost.size} kept` +
    (removedExposures.length
      ? `, ${removedExposures.length} dead/unused removed (${removedExposures.join(', ')})`
      : ``));
  console.log('');

  if (afterChars >= HARD_LIMIT) {
    console.log(`  ⚠ STILL AT/OVER the ${fmt(HARD_LIMIT)} char ceiling Perchance rejected.`);
  } else if (afterChars >= HEADROOM_TARGET) {
    console.log(`  ✓ Under the rejected size, but tight. Headroom target is < ${fmt(HEADROOM_TARGET)} chars.`);
  } else {
    console.log(`  ✓ Under the target with headroom (< ${fmt(HEADROOM_TARGET)} chars).`);
  }
  console.log(`  → wrote ${OUT}`);
  console.log('');
}

/**
 * Split the document into an ordered list of parts:
 *   { kind: 'markup' | 'script' | 'style', body, open?, close? }
 *
 * Only line-anchored <style> tags count as real stylesheets — the file also contains
 * <style> inside JS template strings (CSS the game injects at runtime), and pairing
 * those with a regex swallows whole blocks.
 */
function splitDocument(src) {
  const parts = [];
  let i = 0;
  const lower = src.toLowerCase();

  while (i < src.length) {
    const nextScript = lower.indexOf('<script', i);
    const nextStyle = findRealStyle(src, i);
    const next = [nextScript, nextStyle].filter((n) => n !== -1).sort((a, b) => a - b)[0];

    if (next === undefined) {
      parts.push({ kind: 'markup', body: src.slice(i) });
      break;
    }
    if (next > i) parts.push({ kind: 'markup', body: src.slice(i, next) });

    if (next === nextScript) {
      const openEnd = src.indexOf('>', next) + 1;
      const close = lower.indexOf('</script>', openEnd);
      const bodyEnd = close === -1 ? src.length : close;
      parts.push({
        kind: 'script',
        open: src.slice(next, openEnd),
        body: src.slice(openEnd, bodyEnd),
        close: '</script>',
      });
      i = bodyEnd + '</script>'.length;
    } else {
      const openEnd = src.indexOf('>', next) + 1;
      const close = findRealStyleClose(src, openEnd);
      const bodyEnd = close === -1 ? src.length : close;
      parts.push({
        kind: 'style',
        open: src.slice(next, openEnd),
        body: src.slice(openEnd, bodyEnd),
        close: '</style>',
      });
      i = bodyEnd + '</style>'.length;
    }
  }
  return parts;
}

/** Index of the next line-anchored <style> tag at/after `from`, else -1. */
function findRealStyle(src, from) {
  const re = /(?:^|\r?\n)[ \t]*<style>[ \t]*(?=\r?\n)/g;
  re.lastIndex = from;
  const m = re.exec(src);
  if (!m) return -1;
  return m.index + m[0].indexOf('<style>');
}

function findRealStyleClose(src, from) {
  const re = /(?:^|\r?\n)[ \t]*<\/style>/g;
  re.lastIndex = from;
  const m = re.exec(src);
  if (!m) return -1;
  return m.index + m[0].indexOf('</style>');
}

function joinDocument(parts) {
  return parts.map((p) => (p.kind === 'markup' ? p.body : `${p.open}${p.body}${p.close}`)).join('');
}

// Concatenate the contents of all <script> blocks.
function collectJs(html) {
  const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let m, js = '';
  while ((m = re.exec(html))) js += m[1] + '\n';
  return js;
}

// Function names referenced from inline event handlers (onclick=, onchange=, ...),
// including dynamically-built handler strings inside JS template literals.
// Captures the called identifier, stripping an optional leading "window.".
function collectHandlerNames(html) {
  const re = /\bon[a-z]+\s*=\s*(?:"|'|\\?["'`])\s*(?:window\.)?([A-Za-z_$][\w$]*)\s*\(/gi;
  const KEYWORDS = new Set(['if', 'for', 'while', 'switch', 'return', 'function', 'var',
    'let', 'const', 'new', 'typeof', 'void', 'this', 'event', 'javascript', 'do', 'try']);
  const names = new Set();
  let m;
  while ((m = re.exec(html))) {
    const name = m[1];
    if (!KEYWORDS.has(name)) names.add(name);
  }
  return names;
}

function hasToken(js, name) {
  return new RegExp(`(?<![\\w$])${escapeRe(name)}(?![\\w$])`).test(js);
}
function countMatches(s, re) {
  return (s.match(re) || []).length;
}
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
