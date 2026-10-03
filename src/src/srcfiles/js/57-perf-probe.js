// ============================================================================
// 57-perf-probe — Always-on, near-free performance recorder + the "Measure 10 seconds" report in
// Settings → Logging. For "it freezes / lags / my phone gets hot" reports from devices where the
// developer can't attach dev tools.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

// Always on (in memory only, nothing saved): main-thread stalls (long tasks), timer drift, tab
// hide/show events with how the page behaved just after returning, and how long saves took (and
// which step of the save). Cost: one 1 s timer and a long-task observer. No per-frame work.
// While a measurement runs, every game function is also timed (see profileStart), so a freeze
// inside the window is traced to the function that caused it.
window.PerfProbe = (function () {
    const P = { start: Date.now(), vis: [], long: [], saves: [], afterReturn: [], hiddenAt: 0, returnAt: 0, lagWorst: 0, lagWorstAfterReturn: 0, saveCount: 0, saveTotalMs: 0, saveMaxMs: 0, longTaskApi: false, lastReport: "", lastParts: [], measuring: false };
    const cap = (arr, n) => arr.length > n && arr.splice(0, arr.length - n);
    const gs = () => (0, eval)("gameState");
    const tabName = () => {
        try {
            return gs().activeTab || "?";
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

    const queueStats = (name) => {
        try {
            return (0, eval)(name).getStats();
        } catch (e) {
            return null;
        }
    };
    const domCount = () => document.getElementsByTagName("*").length,
        heapMB = () => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null);

    function snapshot(label) {
        const q = (n) => queueStats(n) || {};
        P.afterReturn.push({
            label,
            dom: domCount(),
            heapMB: heapMB(),
            anims: document.getAnimations ? document.getAnimations().filter((a) => a.playState === "running").length : null,
            textQ: q("AIRequestQueue").totalWaiting,
            imageQ: q("ImageRequestQueue").totalWaiting,
            longTasksSoFar: P.long.length,
            lagWorstMs: P.lagWorstAfterReturn,
        });
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

    // Called by saveGameToSlot when a save ends. parts = { pre, ext, size, set } in ms: the work
    // before the image step, the image step, measuring the size, and the kv write.
    P.noteSave = (slot, ms, bytes, parts) => {
        P.saveCount++, (P.saveTotalMs += ms), ms > P.saveMaxMs && (P.saveMaxMs = ms);
        P.saves.push({ at: Date.now(), slot, ms, kb: bytes ? Math.round(bytes / 1024) : 0, parts: parts || null });
        cap(P.saves, 12);
    };

    // ── Function profiler (only while measuring) ───────────────────────────────
    // Swaps every game function for a timing wrapper (window properties, plus the methods of the
    // few big objects), then puts the originals back. Times are the synchronous part of each call,
    // which is what blocks the page; "self" leaves out the game functions it called. Calls that
    // started before the window (the 100 ms tick, held by the timer) aren't wrapped, but what they
    // call is.
    const PROF_SKIP = new Set(["$", "PerfProbe", "generateText", "generateImage", "requestAnimationFrame", "cancelAnimationFrame", "setTimeout", "setInterval", "clearTimeout", "clearInterval", "fetch", "queueMicrotask", "structuredClone"]);
    let prof = null;
    function profileStart() {
        if (prof) return;
        const stats = new Map(),
            slow = [],
            stack = [],
            installed = [];
        prof = { stats, slow, installed };
        const rec = (name, ms, self, depth) => {
            let s = stats.get(name);
            s || stats.set(name, (s = { n: 0, self: 0, total: 0, max: 0 }));
            s.n++, (s.self += self), (s.total += ms), ms > s.max && (s.max = ms);
            ms >= 150 && slow.length < 200 && slow.push({ at: Date.now(), name, ms: Math.round(ms), self: Math.round(self), depth });
        };
        const wrap = (name, f) => {
            const w = function (...args) {
                if (new.target) return Reflect.construct(f, args, new.target === w ? f : new.target);
                stack.push(0);
                const t = performance.now();
                try {
                    return f.apply(this, args);
                } finally {
                    const ms = performance.now() - t,
                        child = stack.pop();
                    stack.length && (stack[stack.length - 1] += ms);
                    rec(name, ms, ms - child, stack.length);
                }
            };
            try {
                Object.defineProperty(w, "name", { value: f.name });
                w.prototype = f.prototype;
                Object.assign(w, f);
            } catch (e) {}
            return w;
        };
        const isNative = (f) => /\{\s*\[native code\]\s*\}/.test(Function.prototype.toString.call(f));
        const install = (host, key, label) => {
            let f;
            try {
                f = host[key];
            } catch (e) {
                return;
            }
            if (typeof f !== "function" || isNative(f)) return;
            const d = Object.getOwnPropertyDescriptor(host, key);
            if (!d || !d.writable) return;
            const w = wrap(label, f);
            try {
                host[key] = w;
                installed.push([host, key, f, w]);
            } catch (e) {}
        };
        for (const k of Object.getOwnPropertyNames(window)) PROF_SKIP.has(k) || install(window, k, k);
        ["StoryEngine", "AIRequestQueue", "ImageRequestQueue"].forEach((n) => {
            try {
                const o = (0, eval)(n);
                Object.keys(o).forEach((k) => install(o, k, n + "." + k));
            } catch (e) {}
        });
        prof.count = installed.length;
    }
    function profileStop() {
        if (!prof) return null;
        const p = prof;
        prof = null;
        p.installed.forEach(([host, key, f, w]) => host[key] === w && (host[key] = f));
        return {
            wrapped: p.count,
            top: [...p.stats].sort((a, b) => b[1].self - a[1].self).slice(0, 25).map(([name, s]) => ({ name, self: Math.round(s.self), total: Math.round(s.total), n: s.n, max: Math.round(s.max) })),
            slow: p.slow,
        };
    }

    // Watches the page for `ms` while the player plays: frame rate (per second), slow frames, timer
    // drift, DOM churn, and the stalls / saves / slow calls that fall inside the window. onTick gets
    // the whole seconds left. The window ends on a timer, not a frame, so hiding the tab can't leave it hanging.
    function measureWindow(ms, onTick, profile) {
        return new Promise((resolve) => {
            const startWall = Date.now(),
                t0 = performance.now(),
                w = { ms, frames: 0, slow: 0, worstFrame: 0, perSec: [], lagWorst: 0, lagOver100: 0, muts: 0, domStart: domCount(), heapStart: heapMB(), prof: null };
            let lf = t0,
                secStart = t0,
                secFrames = 0,
                lastTimer = t0,
                raf;
            profile && profileStart();
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
                w.prof = profile ? profileStop() : null;
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
        })(gs());
        return { n, mb: +(chars / 1048576).toFixed(1) };
    }

    // "Android 10 · Chrome 154 · Mobile" instead of the whole user-agent string.
    function shortUA() {
        const ua = navigator.userAgent,
            m = (re) => (ua.match(re) || [])[1],
            os = /Android/.test(ua) ? "Android " + (m(/Android ([\d.]+)/) || "?") : /iPhone|iPad/.test(ua) ? "iOS " + (m(/OS ([\d_]+)/) || "?").replace(/_/g, ".") : /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "macOS" : "?",
            br = /Firefox\//.test(ua) ? "Firefox " + m(/Firefox\/([\d.]+)/) : /Edg\//.test(ua) ? "Edge " + m(/Edg\/([\d.]+)/) : /Chrome\//.test(ua) ? "Chrome " + (m(/Chrome\/(\d+)/) || "?") : /Safari\//.test(ua) ? "Safari " + (m(/Version\/([\d.]+)/) || "?") : "browser";
        return `${os} · ${br}${/Mobile/.test(ua) ? " Mobile" : ""}`;
    }

    // Split into pieces that fit one Discord message (2000 characters, a little under for safety).
    function chunk(text, max = 1850) {
        const parts = [];
        let cur = "";
        text.split("\n").forEach((line) => {
            cur && (cur + "\n" + line).length > max && (parts.push(cur), (cur = ""));
            cur = cur ? cur + "\n" + line : line;
        });
        cur && parts.push(cur);
        return parts.length > 1 ? parts.map((p, i) => `[${i + 1}/${parts.length}]\n${p}`) : parts;
    }
    P.chunk = chunk;

    // Builds two versions of the same report: `compact` (short enough to paste into a chat message) and
    // `full` (everything, for saving as a .txt file). Both start with the same measured window.
    P.report = async function (ms = 10000, onTick, profile = true) {
        const g = gs(),
            time = (t) => new Date(t).toTimeString().slice(0, 8),
            C = [],
            F = [],
            add = (s, f) => (C.push(s), F.push(f === undefined ? s : f)),
            only = (s) => F.push(s);
        const w = await measureWindow(ms, onTick, profile);
        let imgs = { n: "?", mb: "?" };
        try {
            imgs = liveImages();
        } catch (e) {}
        const domImgs = [...document.images].filter((i) => i.complete && i.naturalWidth),
            decodedMB = Math.round(domImgs.reduce((a, i) => a + i.naturalWidth * i.naturalHeight * 4, 0) / 1048576),
            ver = [...document.scripts].map((s) => s.src.split("/").pop()).filter((n) => /^(01|02|25|51|57)-/.test(n)).map((n) => n.slice(0, 2) + ":" + (n.split("?v=")[1] || "?")).join(" ");
        add(`FUOC perf ${new Date().toLocaleDateString(undefined, { month: "numeric", day: "numeric" })} ${time(Date.now()).slice(0, 5)} | build ${ver || "inline"}`);
        add(`${shortUA()} · ${screen.width}x${screen.height}@${window.devicePixelRatio}x · ${navigator.hardwareConcurrency || "?"} cores · ${navigator.deviceMemory || "?"} GB`);
        only(`User agent: ${navigator.userAgent}`);
        add(`tab ${tabName()} · up ${Math.round((Date.now() - P.start) / 1000)}s · employees ${g.employees?.length ?? "?"}`);
        add(`Mem heap ${w.heapStart ?? "n/a"}→${w.heapEnd ?? "n/a"} MB · DOM ${w.domStart}→${w.domEnd} · img on page ${document.images.length} (~${decodedMB} MB decoded) · img in state ${imgs.n} (${imgs.mb} MB)`);
        // Storage: how full the browser's quota is, and what the game keeps in it.
        let storage = "n/a",
            kvInfo = "n/a";
        try {
            const e = await navigator.storage.estimate();
            storage = `${Math.round(e.usage / 1048576)} of ${Math.round(e.quota / 1048576)} MB`;
        } catch (e) {}
        try {
            const keys = (await kv.gameSave.keys()) || [];
            kvInfo = `${keys.filter((k) => k.startsWith("fuoc_save_")).length} save slots, ${keys.filter((k) => k.startsWith("fuoc_img_")).length} stored images`;
        } catch (e) {}
        add(`Storage: browser ${storage} · ${kvInfo}`);
        const wl = w.long.reduce((a, x) => a + x.ms, 0),
            wlMax = w.long.reduce((a, x) => Math.max(a, x.ms), 0);
        add(
            w.frames < 3
                ? `${w.secs}s: only ${w.frames} frame(s) drawn — page not painting (frozen or in background)`
                : `${w.secs}s: ${Math.round(w.frames / w.secs)} fps (${w.perSec.join(" ")}) · frames>50ms ${w.slow}, max ${w.worstFrame}ms`
        );
        add(`  stalls ${P.longTaskApi ? `${w.long.length} (max ${wlMax}ms, ${wl}ms total)` : "n/a"} · lag max ${w.lagWorst}ms (${w.lagOver100} ticks>100ms) · DOM chg ${Math.round(w.muts / w.secs)}/s · saves ${w.saves.length}${w.saves.length ? ` (max ${Math.max(...w.saves.map((x) => x.ms))}ms)` : ""} · hidden ${w.hidden ? "yes" : "no"}`);
        if (w.prof) {
            const p = w.prof,
                line = (t) => `${t.name} ${t.self}/${t.n}/${t.max}`;
            add(`Profile (${p.wrapped} fns) top self ms/calls/max:`, `Profile (${p.wrapped} functions timed). Top by SELF time (self ms / total ms incl. callees / calls / slowest call ms):`);
            add("  " + (p.top.slice(0, 8).map(line).join("; ") || "none"), p.top.map((t) => `  ${t.name}: ${t.self} / ${t.total} / ${t.n} / ${t.max}`).join("\n") || "  none");
            const slow = p.slow.slice(-12);
            add(
                `Slow calls >=150ms (inner first${p.slow.length > 12 ? `, last 12 of ${p.slow.length}` : ""}):`,
                `Slow calls >=150 ms, in order they finished (inner calls first; d = call depth) — ${p.slow.length}:`
            );
            add("  " + (slow.map((x) => `${x.name} ${x.ms}ms (self ${x.self}, d${x.depth})`).join("; ") || "none"), p.slow.map((x) => `  ${time(x.at)} ${x.name} ${x.ms} ms (self ${x.self}, d${x.depth})`).join("\n") || "  none");
        }
        const lastDur = typeof lastSaveDurationMs !== "undefined" ? lastSaveDurationMs : "n/a";
        add(`Saves ${P.saveCount}: avg ${P.saveCount ? Math.round(P.saveTotalMs / P.saveCount) : 0}ms, max ${P.saveMaxMs}ms, last ${lastDur}ms`);
        const saveLine = (x) => `  ${time(x.at)} ${x.slot} ${x.ms}ms${x.kb ? ` ${x.kb}KB` : ""}${x.parts ? ` (pre ${x.parts.pre}/img ${x.parts.ext}/size ${x.parts.size}/kv ${x.parts.set})` : ""}`;
        C.push(...P.saves.slice(-5).map(saveLine));
        F.push(...P.saves.map(saveLine));
        const stallLine = (x) => `${time(x.at)} ${x.ms}ms ${x.tab}${x.sinceReturnS === null ? "" : ` (${x.sinceReturnS}s after return)`}`;
        add(`Stalls (session) ${P.longTaskApi ? `${P.long.length}: ` + (P.long.slice(-6).map(stallLine).join("; ") || "none") : "n/a"}`, `Main-thread stalls >=50 ms this session: ${P.longTaskApi ? P.long.length : "not supported by this browser"}${P.long.length ? "\n" + P.long.map((x) => "  " + stallLine(x)).join("\n") : ""}`);
        add(`Timer lag max ${P.lagWorst}ms (${P.lagWorstAfterReturn}ms in 30s after last return)`);
        add(
            `Tab switches: ${P.vis.length ? P.vis.slice(-6).map((v) => `${time(v.at)} ${v.ev}${v.awaySec !== undefined ? ` (away ${v.awaySec}s)` : ""}`).join(" | ") : "none"}`,
            `Tab switches: ${P.vis.length ? "\n" + P.vis.map((v) => `  ${time(v.at)} ${v.ev}${v.awaySec !== undefined ? ` (away ${v.awaySec}s)` : ""}`).join("\n") : "none"}`
        );
        const retLine = (x) => `  after return ${x.label}: DOM ${x.dom}, heap ${x.heapMB ?? "n/a"}MB, animations ${x.anims}, queues ${x.textQ}/${x.imageQ}, stalls ${x.longTasksSoFar}, lag ${x.lagWorstMs}ms`;
        C.push(...P.afterReturn.slice(-2).map(retLine));
        F.push(...P.afterReturn.map(retLine));
        const qs = (n) => {
            const s = queueStats(n);
            return s ? `${s.active}/${s.queued}` : "n/a";
        };
        add(`AI queues text ${qs("AIRequestQueue")} image ${qs("ImageRequestQueue")} (active/queued)`);
        // What the save is made of (images counted as the short references a save actually holds).
        try {
            const t0 = performance.now();
            await loadImageIndex();
            const walked = externalizeWalk(g).result,
                size = (v) => {
                    try {
                        return JSON.stringify(v)?.length || 0;
                    } catch (e) {
                        return 0;
                    }
                },
                rows = Object.keys(walked).map((k) => [k, size(walked[k])]).sort((a, b) => b[1] - a[1]),
                kb = (n) => Math.round(n / 1024),
                took = Math.round(performance.now() - t0);
            add(`Save parts KB: ${rows.slice(0, 5).map(([k, n]) => k + " " + kb(n)).join("; ")}`, `Save composition, KB (largest first; ${took} ms to measure):\n${rows.slice(0, 15).map(([k, n]) => `  ${k}: ${kb(n)}`).join("\n")}`);
            const emps = (walked.employees || []).map((e) => [e.name || "?", size(e)]).sort((a, b) => b[1] - a[1]).slice(0, 8);
            emps.length && only(`Largest employees, KB: ${emps.map(([n, v]) => n + " " + kb(v)).join("; ")}`);
        } catch (e) {
            only("Save composition: couldn't measure (" + e.message + ")");
        }
        const mirror = (window.__logMirror || []).filter((e) => (e.level === "warn" || e.level === "error") && !/\[Perf\]|Slow save/.test(e.text)),
            bad = mirror.slice(-4);
        bad.length && C.push("Warn/err: " + bad.map((e) => `${time(e.t)} ${String(e.text).replace(/\s+/g, " ").slice(0, 90)}`).join(" | "));
        mirror.length && F.push(`Recent warnings/errors (${Math.min(mirror.length, 40)} of ${mirror.length} in the log):\n` + mirror.slice(-40).map((e) => `  ${time(e.t)} [${e.level}] ${String(e.text).replace(/\s+/g, " ").slice(0, 220)}`).join("\n"));
        return { compact: C.join("\n"), full: F.join("\n") };
    };

    // Hands the report to the player as a file: the phone's share sheet when there is one (straight
    // to Discord, say), otherwise a normal download.
    P.saveFile = async function (text, name) {
        const file = new File([text], name, { type: "text/plain" });
        try {
            if (/Mobi|Android|iPhone|iPad/.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: name });
                return "shared";
            }
        } catch (e) {
            if (e && e.name === "AbortError") return "cancelled";
        }
        const url = URL.createObjectURL(file),
            a = document.createElement("a");
        (a.href = url), (a.download = name), (a.style.display = "none"), document.body.appendChild(a), a.click();
        setTimeout(() => (a.remove(), URL.revokeObjectURL(url)), 10000);
        return "downloaded";
    };
    P.fileName = () => {
        const d = new Date(),
            p = (n) => String(n).padStart(2, "0");
        return `fuoc-perf-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}.txt`;
    };

    // The button's flow: close Settings so the player can play, count down in a small banner,
    // then reopen Settings → Logging with the finished report.
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
            const r = await P.report(seconds * 1000, show);
            (P.lastReport = r.full), (P.lastParts = chunk(r.compact));
        } catch (e) {
            (P.lastReport = "Couldn't build the report: " + e.message), (P.lastParts = [P.lastReport]);
        }
        banner.remove();
        P.measuring = !1;
        modal && (modal.style.display = "flex");
        const tab = document.querySelector('.settings-tab-btn[data-settings-tab="logging"]');
        tab && tab.click();
        typeof showNotification === "function" && showNotification("📊 Measurement done — tap Share / save .txt", "success");
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
