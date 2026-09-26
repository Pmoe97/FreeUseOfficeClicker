// ============================================================================
// 54-image-store — Images stored once, outside the saves: content-addressed kv entries,
// save/load/export hooks, garbage collection, and the storage report.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

// Every generated image is a base64 data: URL of 50–150 KB, and the game keeps them in
// gameState (profileImage, photos[], posts, chat, boss art…). Saved as-is, each save and
// each of the ~26 autosave snapshots carried its own copy of every image, and the same
// portrait sat in several places at once. So a save now carries a short reference
// ("fuocimg:<id>") in place of each image, and the image itself is written once to its
// own kv entry ("fuoc_img_<id>"), keyed by its content, so duplicates collapse.
//
// The live gameState is untouched: it still holds real data: URLs, so no rendering code
// changes. Only what goes into kv is rewritten (externalizeImagesForSave), and loads put
// the images back (internalizeImages) before the state is used. Exports re-inline them,
// so an exported file is still self-contained.

const IMG_KEY_PREFIX = "fuoc_img_",
    IMG_REF_PREFIX = "fuocimg:",
    IMG_INDEX_KEY = "fuoc_img_index",
    // Smaller data: URLs (the SVG placeholder tiles) aren't worth a kv entry.
    IMG_MIN_EXTERNAL = 2048,
    // GC never deletes an image written this recently, whatever the saves say — covers a
    // second open tab mid-save, and saves written while a GC pass is reading.
    IMG_GC_MIN_AGE_MS = 10 * 6e4;

// dataUrl → id, so an image is hashed once per session, not on every 5 s autosave.
let imageIdCache = new Map();
// id → [chars, addedAt] for every image in kv. Loaded once; kept in memory; persisted
// (debounced) after changes. It's what the storage report and GC read.
let imageIndex = null,
    imageIndexDirty = !1,
    imageIndexWriteTimer = null,
    imageGcRunning = !1;
// ids referenced by any save written during the current GC pass (never deleted by it).
const imageGcProtect = new Set();

// Two independent 53-bit hashes (cyrb53) + length: ~106 bits, so collisions between
// distinct images are not a practical concern.
function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++)
        (ch = str.charCodeAt(i)), (h1 = Math.imul(h1 ^ ch, 2654435761)), (h2 = Math.imul(h2 ^ ch, 1597334677));
    (h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)), (h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909));
    (h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)), (h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909));
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
function imageIdFor(dataUrl) {
    let id = imageIdCache.get(dataUrl);
    return (
        id ||
            ((id = `${dataUrl.length.toString(36)}_${cyrb53(dataUrl, 1).toString(36)}${cyrb53(dataUrl, 7).toString(36)}`),
            imageIdCache.set(dataUrl, id)),
        id
    );
}
function isExternalizableImage(v) {
    return "string" == typeof v && v.length >= IMG_MIN_EXTERNAL && v.startsWith("data:image/");
}
function isImageRef(v) {
    return "string" == typeof v && v.startsWith(IMG_REF_PREFIX);
}

// ── Index ────────────────────────────────────────────────────────────────────
async function loadImageIndex() {
    if (imageIndex) return imageIndex;
    let stored = null;
    try {
        stored = await kv.gameSave.get(IMG_INDEX_KEY);
    } catch (e) {}
    const keys = ((await kv.gameSave.keys()) || []).filter((k) => k.startsWith(IMG_KEY_PREFIX) && k !== IMG_INDEX_KEY),
        items = (stored && "object" == typeof stored.items && stored.items) || {},
        next = {};
    // Reconcile with what is actually in kv: the index can be stale after a crash or a
    // second tab. Unknown entries get their size read once.
    for (const k of keys) {
        const id = k.slice(IMG_KEY_PREFIX.length);
        if (Array.isArray(items[id])) next[id] = items[id];
        else {
            let len = 0;
            try {
                len = String((await kv.gameSave.get(k)) || "").length;
            } catch (e) {}
            (next[id] = [len, Date.now()]), (imageIndexDirty = !0);
        }
    }
    Object.keys(items).length !== keys.length && (imageIndexDirty = !0);
    return (imageIndex = next), imageIndexDirty && scheduleImageIndexWrite(), imageIndex;
}
function scheduleImageIndexWrite() {
    (imageIndexDirty = !0),
        imageIndexWriteTimer ||
            (imageIndexWriteTimer = setTimeout(async () => {
                (imageIndexWriteTimer = null), (imageIndexDirty = !1);
                try {
                    await kv.gameSave.set(IMG_INDEX_KEY, { v: 1, items: imageIndex });
                } catch (e) {
                    (imageIndexDirty = !0), console.warn("[ImageStore] Index write failed:", e);
                }
            }, 2e3));
}

// ── Save side ────────────────────────────────────────────────────────────────
// Returns a copy of `root` with every large data: URL replaced by a reference, sharing
// every untouched object with the original (copy-on-write), after writing any image kv
// doesn't have yet — so a save never points at an image that isn't stored.
// The copy the caller gets is always from a walk with nothing left to write, i.e. built
// synchronously, with no await between it and the caller's kv write: if new images had
// to be written first, the tree is walked again afterwards, so the save can't mix state
// from before and after the game ran during those writes.
async function externalizeImagesForSave(root) {
    await loadImageIndex();
    for (let pass = 0; ; pass++) {
        const { result, pending, used } = externalizeWalk(root);
        if (pending.size && pass < 3) {
            for (const [id, dataUrl] of pending)
                await kv.gameSave.set(IMG_KEY_PREFIX + id, dataUrl), (imageIndex[id] = [dataUrl.length, Date.now()]);
            scheduleImageIndexWrite();
            continue;
        }
        // (After 3 passes something keeps adding images; write the stragglers and go.)
        for (const [id, dataUrl] of pending)
            await kv.gameSave.set(IMG_KEY_PREFIX + id, dataUrl), (imageIndex[id] = [dataUrl.length, Date.now()]);
        pending.size && scheduleImageIndexWrite();
        if (imageGcRunning) for (const id of used) imageGcProtect.add(id);
        // Forget hashes of images the game no longer holds (keeps the cache from pinning them).
        if (imageIdCache.size > 2 * used.size + 200) {
            const keep = new Map();
            for (const [url, id] of imageIdCache) used.has(id) && keep.set(url, id);
            imageIdCache = keep;
        }
        return result;
    }
}
function externalizeWalk(root) {
    const pending = new Map(),
        used = new Set(),
        seen = new Map();
    function walk(v) {
        if ("string" == typeof v) {
            if (!isExternalizableImage(v)) return v;
            const id = imageIdFor(v);
            return used.add(id), imageIndex[id] || pending.set(id, v), IMG_REF_PREFIX + id;
        }
        if (!v || "object" != typeof v || v instanceof Set || v instanceof Map || v instanceof Date || ArrayBuffer.isView(v))
            return v;
        if (seen.has(v)) return seen.get(v);
        seen.set(v, v); // placeholder: a cycle keeps the original rather than recursing forever
        let out = null;
        if (Array.isArray(v))
            for (let i = 0; i < v.length; i++) {
                const x = v[i],
                    y = walk(x);
                y !== x && ((out = out || v.slice()), (out[i] = y));
            }
        else
            for (const k in v) {
                if (!Object.prototype.hasOwnProperty.call(v, k)) continue;
                const x = v[k],
                    y = walk(x);
                y !== x && ((out = out || { ...v }), (out[k] = y));
            }
        const r = out || v;
        return seen.set(v, r), r;
    }
    return { result: walk(root), pending, used };
}

// ── Load side ────────────────────────────────────────────────────────────────
// Replaces every reference in `root` with its image, IN PLACE (the caller owns a fresh
// copy read from kv). Missing images become a placeholder tile rather than a broken icon.
async function internalizeImages(root) {
    if (!root || "object" != typeof root) return { refs: 0, missing: 0 };
    const sites = [],
        seen = new Set();
    (function collect(v) {
        if (!v || "object" != typeof v || seen.has(v) || v instanceof Set || v instanceof Map) return;
        seen.add(v);
        if (Array.isArray(v)) for (let i = 0; i < v.length; i++) isImageRef(v[i]) ? sites.push([v, i]) : collect(v[i]);
        else for (const k in v) Object.prototype.hasOwnProperty.call(v, k) && (isImageRef(v[k]) ? sites.push([v, k]) : collect(v[k]));
    })(root);
    if (!sites.length) return { refs: 0, missing: 0 };
    const ids = [...new Set(sites.map(([o, k]) => o[k].slice(IMG_REF_PREFIX.length)))],
        urls = new Map();
    // A few reads at a time: plenty fast, and gentle on a slow storage backend.
    for (let i = 0; i < ids.length; i += 8)
        await Promise.all(
            ids.slice(i, i + 8).map(async (id) => {
                try {
                    const u = await kv.gameSave.get(IMG_KEY_PREFIX + id);
                    "string" == typeof u && (urls.set(id, u), imageIdCache.set(u, id));
                } catch (e) {}
            })
        );
    let missing = 0;
    const missingTile = placeholderImage(256, 256, "Image missing");
    for (const [o, k] of sites) {
        const u = urls.get(o[k].slice(IMG_REF_PREFIX.length));
        u ? (o[k] = u) : ((o[k] = missingTile), missing++);
    }
    return (
        missing && console.warn(`[ImageStore] ${missing} image reference(s) had no stored image — shown as placeholders`),
        { refs: sites.length, missing }
    );
}
// Collect the image ids a stored save references, without resolving them.
function collectImageRefs(root, into = new Set()) {
    const seen = new Set();
    (function walk(v) {
        if (isImageRef(v)) return void into.add(v.slice(IMG_REF_PREFIX.length));
        if (!v || "object" != typeof v || seen.has(v) || v instanceof Set || v instanceof Map) return;
        if ((seen.add(v), Array.isArray(v))) for (const x of v) walk(x);
        else for (const k in v) Object.prototype.hasOwnProperty.call(v, k) && walk(v[k]);
    })(root);
    return into;
}

// ── Garbage collection ───────────────────────────────────────────────────────
// Deletes stored images that no save and nothing in the live game references — e.g. after
// a gallery delete, a deleted save, or snapshot rotation. Refuses to run on anything it
// can't read completely: better to keep an orphan than lose an image a save still needs.
async function collectImageGarbage({ reason = "", quiet = !0 } = {}) {
    if (imageGcRunning) return null;
    imageGcRunning = !0;
    imageGcProtect.clear();
    try {
        await loadImageIndex();
        const keys = (await kv.gameSave.keys()) || [],
            referenced = new Set();
        for (const k of keys) {
            if (!(k.startsWith("fuoc_save_") || "gameState" === k)) continue;
            const v = await kv.gameSave.get(k);
            if (null == v) continue; // deleted while we were reading
            collectImageRefs(v, referenced);
        }
        // Anything the live game holds, stored or not yet saved, stays.
        (function walk(v, seen) {
            if (isExternalizableImage(v)) {
                const id = imageIdCache.get(v);
                return void (id && referenced.add(id));
            }
            if (!v || "object" != typeof v || seen.has(v) || v instanceof Set || v instanceof Map) return;
            if ((seen.add(v), Array.isArray(v))) for (const x of v) walk(x, seen);
            else for (const k in v) Object.prototype.hasOwnProperty.call(v, k) && walk(v[k], seen);
        })(gameState, new Set());
        const now = Date.now();
        let deleted = 0,
            freed = 0;
        for (const id of Object.keys(imageIndex)) {
            // Re-checked per image: a save may have run during an earlier await.
            if (referenced.has(id) || imageGcProtect.has(id) || !imageIndex[id]) continue;
            const [len, at] = imageIndex[id];
            if (now - (at || 0) < IMG_GC_MIN_AGE_MS) continue;
            // Out of the index first: a save that runs while the delete is in flight then
            // sees the image as unstored and writes it again (after the delete, in order).
            delete imageIndex[id];
            try {
                await kv.gameSave.delete(IMG_KEY_PREFIX + id), deleted++, (freed += len || 0);
            } catch (e) {
                imageIndex[id] = [len, at];
            }
        }
        return (
            deleted && scheduleImageIndexWrite(),
            (deleted || !quiet) &&
                console.log(`[ImageStore] GC${reason ? ` (${reason})` : ""}: ${deleted} unused image(s) removed, ${fmtKB(freed)} freed`),
            { deleted, freed }
        );
    } catch (e) {
        return console.warn("[ImageStore] GC skipped:", e), null;
    } finally {
        (imageGcRunning = !1), imageGcProtect.clear();
    }
}
let imageGcTimer = null;
function scheduleImageGc(reason, delay = 15e3) {
    clearTimeout(imageGcTimer), (imageGcTimer = setTimeout(() => collectImageGarbage({ reason }), delay));
}

// ── Storage report (Settings → Data) ─────────────────────────────────────────
async function getStorageReport() {
    await loadImageIndex();
    const saves = await listAllSaves(),
        byType = { manual: [0, 0], quick: [0, 0], auto: [0, 0], backup: [0, 0] };
    for (const s of saves) {
        const t = byType[s.saveType] ? s.saveType : "auto";
        byType[t][0]++, (byType[t][1] += s.bytes || 0);
    }
    const ids = Object.keys(imageIndex);
    return {
        saves: byType,
        saveCount: saves.length,
        saveBytes: saves.reduce((a, s) => a + (s.bytes || 0), 0),
        images: ids.length,
        imageBytes: ids.reduce((a, id) => a + (imageIndex[id][0] || 0), 0),
    };
}
function fmtBytes(n) {
    return n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(0, Math.round(n / 1024))} KB`;
}
async function renderStorageReport() {
    const box = document.getElementById("storageReport");
    if (!box) return;
    box.innerHTML = '<div style="color:var(--text-dim);">Measuring…</div>';
    try {
        const r = await getStorageReport(),
            row = (label, value, note = "") =>
                `<div style="display:flex; justify-content:space-between; gap:12px; padding:4px 0; border-bottom:1px solid var(--border);"><span>${label}${note ? ` <span style="color:var(--text-mute); font-size:0.8rem;">${note}</span>` : ""}</span><span class="num" style="font-weight:600; white-space:nowrap;">${value}</span></div>`;
        box.innerHTML =
            row("🖼️ Images", `${r.images} · ${fmtBytes(r.imageBytes)}`, "shared by all saves") +
            row("💾 Named saves", `${r.saves.manual[0]} · ${fmtBytes(r.saves.manual[1])}`) +
            row("⚡ Quick saves", `${r.saves.quick[0]} · ${fmtBytes(r.saves.quick[1])}`) +
            row("🔄 Autosave + snapshots", `${r.saves.auto[0] + r.saves.backup[0]} · ${fmtBytes(r.saves.auto[1] + r.saves.backup[1])}`) +
            `<div style="display:flex; justify-content:space-between; gap:12px; padding:8px 0 0; font-weight:700;"><span>Total</span><span class="num">${fmtBytes(r.imageBytes + r.saveBytes)}</span></div>`;
    } catch (e) {
        box.innerHTML = `<div style="color:var(--danger);">Couldn't measure storage: ${String(e?.message || e)}</div>`;
    }
}
async function cleanUpStoredImages() {
    const box = document.getElementById("storageReport");
    box && (box.innerHTML = '<div style="color:var(--text-dim);">Cleaning up…</div>');
    const r = await collectImageGarbage({ reason: "manual", quiet: !1 });
    showNotification(
        r ? (r.deleted ? `🧹 Removed ${r.deleted} unused image(s), freed ${fmtBytes(r.freed)}` : "🧹 Nothing to clean up") : "Clean-up is busy — try again in a moment",
        r ? "success" : "info"
    ),
        renderStorageReport();
}
(window.renderStorageReport = renderStorageReport), (window.cleanUpStoredImages = cleanUpStoredImages);
