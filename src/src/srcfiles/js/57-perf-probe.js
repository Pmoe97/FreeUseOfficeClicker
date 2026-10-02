// ============================================================================
// 57-perf-probe — Always-on, near-free performance recorder + the "Copy performance report"
// button in Settings → Logging. For "it freezes / lags / my phone gets hot" reports from
// devices where the developer can't attach dev tools.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

// What it keeps (all in memory, nothing saved): main-thread stalls (long tasks), timer drift,
// tab hide/show events with how the page behaved just after returning, and how long saves took.
// Cost: one 1 s timer and a long-task observer. No per-frame work.
window.PerfProbe = (function () {
    const P = { start: Date.now(), vis: [], long: [], saves: [], afterReturn: [], hiddenAt: 0, returnAt: 0, lagWorst: 0, lagWorstAfterReturn: 0, saveCount: 0, saveTotalMs: 0, saveMaxMs: 0, longTaskApi: false };
    const cap = (arr, n) => arr.length > n && arr.splice(0, arr.length - n);
    const tabName = () => {
        try {
            return (0, eval)("gameState").activeTab || "?";
        } catch (e) {
            return "?";
        }
    };

    // Timer drift: a 1 s timer that fires late means the main thread was busy. Hidden tabs are
    // throttled by the browser on purpose, so only visible time counts.
    let last = performance.now();
    setInterval(() => {
        const t = performance.now(),
            d = t - last - 1000;
        last = t;
        if (document.hidden || d < 0) return;
        d > P.lagWorst && (P.lagWorst = Math.round(d));
        Date.now() - P.returnAt < 30000 && d > P.lagWorstAfterReturn && (P.lagWorstAfterReturn = Math.round(d));
    }, 1000);

    try {
        new PerformanceObserver((list) =>
            list.getEntries().forEach((e) => {
                if (document.hidden) return;
                P.long.push({ at: Date.now(), ms: Math.round(e.duration), sinceReturnS: P.returnAt ? Math.round((Date.now() - P.returnAt) / 1000) : null, tab: tabName() });
                cap(P.long, 40);
            })
        ).observe({ entryTypes: ["longtask"] });
        P.longTaskApi = true;
    } catch (e) {}

    // The queues are top-level consts (not on window), so they're reached through global eval.
    const queueStats = (name) => {
        try {
            return (0, eval)(name).getStats();
        } catch (e) {
            return null;
        }
    };
    function snapshot(label) {
        const q = (n) => queueStats(n) || {};
        const s = {
            label,
            dom: document.getElementsByTagName("*").length,
            heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
            anims: document.getAnimations ? document.getAnimations().filter((a) => a.playState === "running").length : null,
            textQ: q("AIRequestQueue").totalWaiting,
            imageQ: q("ImageRequestQueue").totalWaiting,
            longTasksSoFar: P.long.length,
            lagWorstMs: P.lagWorstAfterReturn,
        };
        P.afterReturn.push(s);
        cap(P.afterReturn, 8);
    }

    document.addEventListener("visibilitychange", () => {
        const t = Date.now();
        if (document.hidden) {
            P.hiddenAt = t;
            P.vis.push({ at: t, ev: "hidden" });
        } else {
            P.returnAt = t;
            P.lagWorstAfterReturn = 0;
            last = performance.now();
            P.vis.push({ at: t, ev: "visible", awaySec: P.hiddenAt ? Math.round((t - P.hiddenAt) / 1000) : 0 });
            setTimeout(() => !document.hidden && snapshot("+3s"), 3000);
            setTimeout(() => !document.hidden && snapshot("+30s"), 30000);
        }
        cap(P.vis, 20);
    });

    // Called by saveGameToSlot when a save ends.
    P.noteSave = (slot, ms, bytes) => {
        P.saveCount++, (P.saveTotalMs += ms), ms > P.saveMaxMs && (P.saveMaxMs = ms);
        P.saves.push({ at: Date.now(), slot, ms, kb: bytes ? Math.round(bytes / 1024) : 0 });
        cap(P.saves, 12);
    };

    // Images the game is holding in memory as data: URLs (what a phone has to keep around).
    function liveImages() {
        let n = 0,
            chars = 0;
        const seen = new Set();
        (function walk(v) {
            if (typeof v === "string") return void (v.startsWith("data:image/") && (n++, (chars += v.length)));
            if (!v || typeof v !== "object" || seen.has(v)) return;
            seen.add(v);
            if (Array.isArray(v)) for (const x of v) walk(x);
            else for (const k in v) Object.prototype.hasOwnProperty.call(v, k) && walk(v[k]);
        })((0, eval)("gameState"));
        return { n, mb: +(chars / 1048576).toFixed(1) };
    }

    function measureFps(ms = 2000) {
        return new Promise((resolve) => {
            if (document.hidden || !window.requestAnimationFrame) return resolve(null);
            let frames = 0;
            const t0 = performance.now(),
                tick = (now) => (now - t0 < ms ? (frames++, requestAnimationFrame(tick)) : resolve(Math.round((frames * 1000) / (now - t0))));
            requestAnimationFrame(tick);
        });
    }

    P.report = async function () {
        const gs = (0, eval)("gameState"),
            time = (t) => new Date(t).toTimeString().slice(0, 8),
            L = [],
            add = (s) => L.push(s);
        const fps = await measureFps();
        let imgs = { n: "?", mb: "?" };
        try {
            imgs = liveImages();
        } catch (e) {}
        const domImgs = [...document.images].filter((i) => i.complete && i.naturalWidth),
            decodedMB = Math.round(domImgs.reduce((a, i) => a + i.naturalWidth * i.naturalHeight * 4, 0) / 1048576);
        const scripts = [...document.scripts].map((s) => s.src.split("/").pop()).filter((n) => /^(01|02|25|51|57)-/.test(n));
        add(`FUOC performance report — ${new Date().toISOString()}`);
        add(`Build: ${scripts.join(", ") || "inline"}`);
        add(`Device: ${navigator.userAgent}`);
        add(`Screen ${screen.width}x${screen.height} @${window.devicePixelRatio}x, viewport ${innerWidth}x${innerHeight}, cores ${navigator.hardwareConcurrency || "?"}, memory ${navigator.deviceMemory || "?"} GB`);
        add(`Page open ${Math.round((Date.now() - P.start) / 1000)} s · tab "${tabName()}" · employees ${gs.employees?.length ?? "?"} · cash ${Math.round(gs.cash || 0)}`);
        add(`Memory: JS heap ${performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) + " MB" : "n/a"} · DOM nodes ${document.getElementsByTagName("*").length} · <img> on page ${document.images.length} (loaded ${domImgs.length}, ~${decodedMB} MB decoded) · images held in game state ${imgs.n} (${imgs.mb} MB as text)`);
        add(`Frame rate (2 s sample, idle): ${fps === null ? "n/a (hidden)" : fps + " fps"} · running CSS animations ${document.getAnimations ? document.getAnimations().filter((a) => a.playState === "running").length : "n/a"}`);
        const lastDur = typeof lastSaveDurationMs !== "undefined" ? lastSaveDurationMs : "n/a";
        add(`Saves: ${P.saveCount} this session, avg ${P.saveCount ? Math.round(P.saveTotalMs / P.saveCount) : 0} ms, slowest ${P.saveMaxMs} ms, last ${lastDur} ms`);
        P.saves.slice(-8).forEach((s) => add(`  ${time(s.at)} ${s.slot} ${s.ms} ms${s.kb ? ` (${s.kb} KB)` : ""}`));
        const longMs = P.long.reduce((a, x) => a + x.ms, 0);
        add(`Main-thread stalls (>=50 ms): ${P.longTaskApi ? `${P.long.length} recent, ${longMs} ms total, worst ${P.long.reduce((a, x) => Math.max(a, x.ms), 0)} ms` : "not supported by this browser"}`);
        P.long.slice(-10).forEach((x) => add(`  ${time(x.at)} ${x.ms} ms on "${x.tab}"${x.sinceReturnS === null ? "" : `, ${x.sinceReturnS} s after returning`}`));
        add(`Timer lag: worst ${P.lagWorst} ms overall, ${P.lagWorstAfterReturn} ms in the 30 s after the last return`);
        add(`Tab switches: ${P.vis.length ? P.vis.slice(-10).map((v) => `${time(v.at)} ${v.ev}${v.awaySec !== undefined ? ` (away ${v.awaySec}s)` : ""}`).join(" | ") : "none yet"}`);
        P.afterReturn.slice(-4).forEach((s) => add(`  after return ${s.label}: DOM ${s.dom}, heap ${s.heapMB ?? "n/a"} MB, animations ${s.anims}, queues text ${s.textQ}/image ${s.imageQ}, stalls so far ${s.longTasksSoFar}, worst lag ${s.lagWorstMs} ms`));
        const qs = (n) => {
            const s = queueStats(n);
            return s ? `${s.active} active / ${s.queued} queued` : "n/a";
        };
        add(`AI queues: text ${qs("AIRequestQueue")} · image ${qs("ImageRequestQueue")}`);
        const bad = (window.__logMirror || []).filter((e) => e.level === "warn" || e.level === "error").slice(-12);
        add(`Recent warnings/errors (${bad.length}):`);
        bad.forEach((e) => add(`  ${time(e.t)} [${e.level}] ${String(e.text).replace(/\s+/g, " ").slice(0, 160)}`));
        return L.join("\n");
    };

    // Clipboard, with the old textarea route for browsers that refuse the modern one.
    P.copyText = async function (text, fallbackEl) {
        try {
            if (navigator.clipboard && window.isSecureContext) return await navigator.clipboard.writeText(text), !0;
        } catch (e) {}
        try {
            const ta = fallbackEl || document.createElement("textarea");
            fallbackEl || ((ta.value = text), (ta.style.cssText = "position:fixed;left:0;top:0;opacity:0"), document.body.appendChild(ta));
            ta.focus(), ta.select();
            const ok = document.execCommand("copy");
            fallbackEl || ta.remove();
            return ok;
        } catch (e) {
            return !1;
        }
    };
    return P;
})();
