// Perchance plugin shim — defines the two globals the game expects (window.generateText /
// window.generateImage) and points them at the local dev server's same-origin proxy
// endpoints (/ai/text -> Ollama, /ai/image -> ComfyUI).
//
// This file is injected at runtime by local-dev/server.mjs and is NEVER part of index.html,
// so the game stays byte-identical for Perchance. On Perchance, these globals are provided
// by the platform's AI plugins instead and this shim simply isn't present.
(function () {
    "use strict";

    // --- PERSISTENCE (kv) --------------------------------------------------
    // The game saves/loads via `kv.gameSave.get/set/keys/delete(...)` — on Perchance that's
    // the platform kv-plugin. Locally it doesn't exist, so without this every save/load
    // throws and NOTHING persists (every reload starts fresh). Provide an IndexedDB-backed
    // equivalent (handles the game's multi-MB saves + multiple slots). Only define if the
    // platform hasn't already (so this is a no-op on Perchance).
    if (typeof window.kv === "undefined") {
        const DB = "fuoc_kv",
            STORE = "gameSave";
        let dbp;
        const open = () =>
            dbp ||
            (dbp = new Promise((res, rej) => {
                const r = indexedDB.open(DB, 1);
                r.onupgradeneeded = () => r.result.createObjectStore(STORE);
                r.onsuccess = () => res(r.result);
                r.onerror = () => rej(r.error);
            }));
        const store = (mode) => open().then((db) => db.transaction(STORE, mode).objectStore(STORE));
        const done = (r) => new Promise((res, rej) => ((r.onsuccess = () => res(r.result)), (r.onerror = () => rej(r.error))));
        const gameSave = {
            async get(k) {
                return (await done((await store("readonly")).get(k))) ?? null;
            },
            async set(k, v) {
                await done((await store("readwrite")).put(v, k));
                return !0;
            },
            async delete(k) {
                await done((await store("readwrite")).delete(k));
                return !0;
            },
            async keys() {
                return (await done((await store("readonly")).getAllKeys())) || [];
            },
        };
        gameSave.del = gameSave.delete; // legacy alias seen in older save code
        window.kv = { gameSave };
        console.log("[LocalAI] kv shim active — saves persist to IndexedDB (fuoc_kv).");
    }

    async function postJson(path, body) {
        const r = await fetch(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || `${path} -> ${r.status}`);
        return data;
    }

    // --- TEXT --------------------------------------------------------------
    // Matches Perchance's contract: generateText(prompt, options) -> Promise<string>.
    // options may include { temperature, max_tokens, stopSequences, onChunk }.
    window.generateText = async function (prompt, options) {
        options = options || {};
        const { text } = await postJson("/ai/text", {
            prompt: typeof prompt === "string" ? prompt : String(prompt ?? ""),
            options: {
                temperature: options.temperature,
                max_tokens: options.max_tokens,
                stopSequences: options.stopSequences,
            },
        });
        // The game treats streaming as optional; emulate a single final chunk if asked.
        if (typeof options.onChunk === "function") {
            try {
                options.onChunk({ fullTextSoFar: text, text });
            } catch (e) {}
        }
        return text;
    };

    // --- IMAGE -------------------------------------------------------------
    // Matches Perchance's contract: generateImage(arg, options) -> Promise<urlString>.
    // The game passes arg as { prompt }. We return a data: URI, which the game accepts.
    window.generateImage = async function (arg, options) {
        const prompt = arg && typeof arg === "object" ? arg.prompt || "" : String(arg ?? "");
        const { dataUrl } = await postJson("/ai/image", {
            prompt,
            negativePrompt: arg && typeof arg === "object" ? arg.negativePrompt : undefined,
        });
        return dataUrl;
    };

    // --- GAME QUEUE REPORTER ----------------------------------------------
    // The local server's proxy only sees requests the game DISPATCHES. To diagnose "the next
    // prompt never funnels through", the panel also needs the game's own queue depth. We poll
    // window.AIRequestQueue/ImageRequestQueue.getStats() and forward the most recent queue log
    // lines, POSTing a compact snapshot to /ai/game-report (which the panel reads via
    // /api/activity). Best-effort and fully local — does nothing on Perchance (this shim is absent
    // there) and nothing until the game's queues exist.
    const queueLogTail = [];
    (function hookQueueLogs() {
        const wrap = (orig) =>
            function (...args) {
                try {
                    const first = String(args[0] ?? "");
                    if (first.includes("[AI Queue]") || first.includes("[Image Queue]")) {
                        queueLogTail.push({ t: Date.now(), msg: args.map((a) => (typeof a === "string" ? a : "")).join(" ").slice(0, 160) });
                        if (queueLogTail.length > 30) queueLogTail.shift();
                    }
                } catch (e) {}
                return orig.apply(this, args);
            };
        // Wrap now; the game's own log interceptor wraps on top of this later, so we still see
        // any [AI Queue]/[Image Queue] line it passes through.
        console.log = wrap(console.log.bind(console));
        console.error = wrap(console.error.bind(console));
    })();

    let lastReportKey = "";
    setInterval(async () => {
        try {
            const txt = window.AIRequestQueue?.getStats?.() || null;
            const img = window.ImageRequestQueue?.getStats?.() || null;
            if (!txt && !img && !queueLogTail.length) return; // game not booted yet
            // Skip POSTing identical idle snapshots so the panel's log tail stays meaningful.
            const key = JSON.stringify([txt, img, queueLogTail.length && queueLogTail[queueLogTail.length - 1].t]);
            if (key === lastReportKey) return;
            lastReportKey = key;
            await fetch("/ai/game-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: txt, image: img, logs: queueLogTail.slice(-30) }),
            });
        } catch (e) {}
    }, 1000);

    // Perchance-only template token (CEO chatroom) renders as literal text locally — hide it
    // so it isn't confusing during local testing. No effect on Perchance.
    function hideCommentsPluginLeftovers() {
        try {
            document.querySelectorAll("#ceoChatroom").forEach((el) => {
                if ((el.textContent || "").includes("commentsPlugin")) {
                    el.innerHTML =
                        '<div style="opacity:.5;font-style:italic;padding:20px;text-align:center">CEO chatroom (Perchance comments plugin) — unavailable in local mode</div>';
                }
            });
        } catch (e) {}
    }
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", hideCommentsPluginLeftovers, { once: true });
    else hideCommentsPluginLeftovers();

    console.log("[LocalAI] Perchance shim active — generateText + generateImage wired to local server.");
})();
