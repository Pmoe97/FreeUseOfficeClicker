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

    const domCount = () => document.getElementsByTagName("*").length,
        heapMB = () => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null);

    // Watches the page for `ms` while the player plays: frame rate (per second), slow frames, timer
    // drift, DOM churn, and the stalls / saves that fall inside the window. onTick gets the whole
    // seconds left. The window ends on a timer, not a frame, so hiding the tab can't leave it hanging.
    function measureWindow(ms, onTick) {
        return new Promise((resolve) => {
            const startWall = Date.now(),
                t0 = performance.now(),
                w = { ms, frames: 0, slow: 0, worstFrame: 0, perSec: [], lagWorst: 0, lagOver100: 0, muts: 0, domStart: domCount(), heapStart: heapMB() };
            let lf = t0,
                secStart = t0,
                secFrames = 0,
                lastTimer = t0,
                raf;
            const mo = new MutationObserver((l) => (w.muts += l.length));
            mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
            const loop = (n) => {
                const d = n - lf;
                lf = n;
                if (!document.hidden && d < 1000) (w.frames++, secFrames++, d > 50 && w.slow++, d > w.worstFrame && (w.worstFrame = Math.round(d)));
                n - secStart >= 1000 && (w.perSec.push(secFrames), (secFrames = 0), (secStart = n));
                raf = requestAnimationFrame(loop);
            };
            raf = requestAnimationFrame(loop);
            const timer = setInterval(() => {
                const n = performance.now(),
                    d = n - lastTimer - 250;
                lastTimer = n;
                if (!document.hidden) {
                    d > w.lagWorst && (w.lagWorst = Math.round(d));
                    d > 100 && w.lagOver100++;
                }
                const left = Math.max(0, ms - (n - t0));
                onTick && onTick(Math.ceil(left / 1000));
                if (left > 0) return;
                clearInterval(timer), cancelAnimationFrame(raf), mo.disconnect();
                w.secs = +((n - t0) / 1000).toFixed(1);
                w.domEnd = domCount();
                w.heapEnd = heapMB();
                w.long = P.long.filter((x) => x.at >= startWall);
                w.saves = P.saves.filter((x) => x.at >= startWall);
                w.hidden = P.vis.some((v) => v.at >= startWall && v.ev === "hidden");
                resolve(w);
            }, 250);
        });
    }

    P.report = async function (ms = 10000, onTick) {
        const gs = (0, eval)("gameState"),
            time = (t) => new Date(t).toTimeString().slice(0, 8),
            L = [],
            add = (s) => L.push(s);
        const w = await measureWindow(ms, onTick);
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
        const wl = w.long.reduce((a, x) => a + x.ms, 0);
        add(
            w.frames < 3
                ? `MEASURED ${w.secs} s: only ${w.frames} frame(s) were drawn — the page was not painting (frozen, or the window was in the background)`
                : `MEASURED ${w.secs} s of play: ${Math.round(w.frames / w.secs)} fps average (per second: ${w.perSec.join(" ") || "n/a"}) · frames over 50 ms: ${w.slow}, slowest ${w.worstFrame} ms`
        );
        add(`  Stalls in window: ${P.longTaskApi ? `${w.long.length}, worst ${w.long.reduce((a, x) => Math.max(a, x.ms), 0)} ms, ${wl} ms total` : "n/a (not supported by this browser)"} · timer lag worst ${w.lagWorst} ms, ${w.lagOver100} ticks over 100 ms`);
        add(`  DOM changes ${Math.round(w.muts / w.secs)}/s · DOM nodes ${w.domStart} → ${w.domEnd} · JS heap ${w.heapStart ?? "n/a"} → ${w.heapEnd ?? "n/a"} MB · saves in window ${w.saves.length}${w.saves.length ? ` (slowest ${Math.max(...w.saves.map((x) => x.ms))} ms)` : ""} · tab hidden during window: ${w.hidden ? "yes" : "no"}`);
        add(`  Running CSS animations: ${document.getAnimations ? document.getAnimations().filter((a) => a.playState === "running").length : "n/a"}`);
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

    // The button's flow: close Settings so the player can play, count down in a small banner,
    // then reopen Settings → Logging with the finished report.
    P.lastReport = "";
    P.measuring = !1;
    P.runMeasurement = async function (seconds = 10) {
        if (P.measuring) return;
        P.measuring = !0;
        const modal = document.getElementById("settingsModal"),
            panel = document.getElementById("settingsPanel"),
            banner = document.createElement("div");
        modal && (modal.style.display = "none");
        panel && (panel.hidden = !0);
        banner.style.cssText =
            "position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:100200;pointer-events:none;padding:10px 18px;border-radius:999px;background:rgba(20,20,30,.92);color:#fff;border:1px solid var(--l-indigo,#667eea);font-weight:600;font-size:.9rem;box-shadow:0 4px 18px rgba(0,0,0,.5);white-space:nowrap";
        document.body.appendChild(banner);
        const show = (n) => (banner.textContent = `📊 Measuring… play normally (${n} s)`);
        show(seconds);
        try {
            P.lastReport = await P.report(seconds * 1000, show);
        } catch (e) {
            P.lastReport = "Couldn't build the report: " + e.message;
        }
        banner.remove();
        P.measuring = !1;
        modal && (modal.style.display = "flex");
        const tab = document.querySelector('.settings-tab-btn[data-settings-tab="logging"]');
        tab && tab.click();
        typeof showNotification === "function" && showNotification("📊 Measurement done — tap Copy report", "success");
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
