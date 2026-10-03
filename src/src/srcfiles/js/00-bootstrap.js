// ============================================================================
// 00-bootstrap — Boot & settings panel init — debug helpers, closeHiringModal, settings/log categories IIFE.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================


/* =========================================================================
   Console Log Control Panel — interceptor
   Installs before any boot/game logging so even early [BOOT ...] lines are
   filterable. Reads a standalone localStorage config (fuoc_log_settings) and
   suppresses console.log/info/debug by the [Tag] prefix on each message.
   console.warn / console.error are protected (shown by default); they obey
   the per-category toggles only when "Silence warnings"/"Silence errors" is
   turned on. Everything is reached through window.__logCfg / window.LogControl
   so it survives minification.
   ========================================================================= */
(function () {
    const LS_KEY = "fuoc_log_settings";

    // Ordered category groups of [Tag] prefixes. "uncategorized" is the
    // fallback bucket and also collects auto-discovered tags.
    const LOG_CATEGORIES = [
        { id: "imagesai", label: "Images & AI", icon: "🖼️", tags: ["Prompt", "AI Queue", "Image Queue", "IMAGE GEN", "Image Request", "Request Image", "Image Mentions", "Auto-Vis", "Scene Visualization", "AI Optimization", "AI Training", "Nuclear Context"] },
        { id: "saveboot", label: "Save & Boot", icon: "💾", tags: ["BOOT", "SaveManager", "LoadGame", "Snapshot"] },
        { id: "story", label: "Story & Events", icon: "📖", tags: ["StoryEngine", "Stories", "Event", "Dynamic Events", "Drama", "Chain"] },
        { id: "social", label: "Social", icon: "💬", tags: ["Social", "Comments", "Comment Dynamics", "PostModal", "Algorithm", "Feed Update", "Notification", "Mention", "Mentions", "DeletePost", "Proactive DM", "Sanitize"] },
        { id: "npc", label: "NPC & Gossip", icon: "🧠", tags: ["GossipEngine", "Gossip Created", "CompanyContext", "Autonomous"] },
        { id: "economy", label: "Economy", icon: "🎁", tags: ["Gift", "Gift Price", "Gift Consequences", "Payroll", "AFK"] },
        { id: "hr", label: "HR & People", icon: "👔", tags: ["Hire", "Rehire", "Fire", "Promotion", "Pyramid", "Names", "Gender", "Race", "Ethnicity", "Custom Employee", "Birth", "Pregnancy"] },
        { id: "systems", label: "Systems", icon: "⚙️", tags: ["Schedule", "Performance", "Perspective", "Groups", "Flags", "Skills", "Chat", "Enc"] },
        { id: "uncategorized", label: "Uncategorized", icon: "❓", tags: [] },
    ];

    // Flat lookup: normalized-lowercase tag -> categoryId.
    const TAG_REGISTRY = {};
    LOG_CATEGORIES.forEach(function (c) {
        c.tags.forEach(function (t) {
            TAG_REGISTRY[t.toLowerCase()] = c.id;
        });
    });

    function loadCfg() {
        const def = { masterOn: true, suppressWarn: false, suppressError: false, tags: {}, cats: {} };
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return def;
            const parsed = JSON.parse(raw) || {};
            return {
                masterOn: parsed.masterOn !== false,
                suppressWarn: parsed.suppressWarn === true,
                suppressError: parsed.suppressError === true,
                tags: Object.assign({}, parsed.tags),
                cats: Object.assign({}, parsed.cats),
            };
        } catch (e) {
            return def;
        }
    }

    const cfg = loadCfg();
    window.__logCfg = cfg;
    window.__logSeen = window.__logSeen || {}; // tagKey(lower) -> display tag

    function save() {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(cfg));
        } catch (e) {}
    }

    // Strip the [BOOT +0.45s] time suffix so all boot lines collapse to "BOOT".
    function normTag(raw) {
        let t = String(raw).trim();
        if (/^BOOT\b/i.test(t)) t = "BOOT";
        return t;
    }

    // First [Tag] at/near the start; tolerant of a short emoji/whitespace prefix.
    const TAG_RE = /^.{0,6}?\[([^\]]+)\]/u;

    // Effective on/off for a resolved (tagKey, catId). Explicit tag override
    // wins, else explicit category override, else default on.
    function effective(tagKey, catId) {
        if (tagKey != null && Object.prototype.hasOwnProperty.call(cfg.tags, tagKey)) return cfg.tags[tagKey] !== false;
        if (Object.prototype.hasOwnProperty.call(cfg.cats, catId)) return cfg.cats[catId] !== false;
        return true;
    }

    // Parse first arg -> { allowed }. Records seen tags for UI auto-discovery.
    function allowedFor(firstArg) {
        let catId = "uncategorized";
        let tagKey = null;
        if (typeof firstArg === "string") {
            const m = firstArg.match(TAG_RE);
            if (m) {
                const disp = normTag(m[1]);
                tagKey = disp.toLowerCase();
                window.__logSeen[tagKey] = disp;
                catId = TAG_REGISTRY[tagKey] || "uncategorized";
            }
        }
        return effective(tagKey, catId);
    }

    const _log = console.log.bind(console);
    const _warn = console.warn.bind(console);
    const _error = console.error.bind(console);
    const _info = console.info ? console.info.bind(console) : _log;
    const _debug = console.debug ? console.debug.bind(console) : _log;

    /* --- In-app console mirror (volatile; mobile bug reporting) ---
       A capped in-memory ring buffer of everything that actually reaches the
       real console, plus uncaught errors. Never persisted: lives only on
       window, cleared on refresh. The Logging tab renders from it. */
    const MIRROR_CAP = 1000;
    window.__logMirror = window.__logMirror || [];

    // Flatten console args to one display string. MUST NOT call console.*
    // (would re-enter these wrappers and loop). Handles objects/circular.
    function serializeArgs(args) {
        const out = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (typeof a === "string") out.push(a);
            else if (a instanceof Error) out.push(a.stack || a.message || String(a));
            else if (a === null) out.push("null");
            else if (a === undefined) out.push("undefined");
            else if (typeof a === "object") {
                try {
                    out.push(JSON.stringify(a));
                } catch (e) {
                    try { out.push(String(a)); } catch (e2) { out.push("[Unserializable]"); }
                }
            } else out.push(String(a));
        }
        return out.join(" ");
    }

    function pushMirror(level, args) {
        let text;
        try {
            text = Array.isArray(args) || (args && typeof args.length === "number") ? serializeArgs(args) : String(args);
        } catch (e) {
            text = "[Unserializable log]";
        }
        const entry = { t: Date.now(), level: level, text: text };
        const buf = window.__logMirror;
        buf.push(entry);
        if (buf.length > MIRROR_CAP) buf.splice(0, buf.length - MIRROR_CAP);
        if (window.__onMirror) {
            try { window.__onMirror(entry); } catch (e) {}
        }
    }

    // log / info / debug: governed by master toggle + per-category flags.
    // Mirror captures only on the path that actually reaches the console.
    function logWrapper(orig, level) {
        return function () {
            if (cfg.masterOn === false) return;
            if (allowedFor(arguments[0])) {
                pushMirror(level, arguments);
                return orig.apply(console, arguments);
            }
        };
    }
    // warn / error: protected. Always shown unless the matching "silence"
    // switch is on AND the message's category is toggled off.
    function levelWrapper(orig, suppressKey, level) {
        return function () {
            if (cfg[suppressKey] === true && !allowedFor(arguments[0])) return;
            pushMirror(level, arguments);
            return orig.apply(console, arguments);
        };
    }

    console.log = logWrapper(_log, "log");
    console.info = logWrapper(_info, "info");
    console.debug = logWrapper(_debug, "debug");
    console.warn = levelWrapper(_warn, "suppressWarn", "warn");
    console.error = levelWrapper(_error, "suppressError", "error");

    // Uncaught errors / rejections reach the real console too -> mirror them.
    window.addEventListener("error", function (e) {
        pushMirror("error", ["Uncaught " + ((e && e.error && e.error.stack) || (e && e.message) || String(e))]);
    });
    window.addEventListener("unhandledrejection", function (e) {
        const r = e && e.reason;
        pushMirror("error", ["Unhandled rejection: " + ((r && r.stack) || (r && r.message) || String(r))]);
    });

    window.LogMirror = {
        buffer: window.__logMirror,
        CAP: MIRROR_CAP,
        clear: function () { window.__logMirror.length = 0; },
    };

    // Which tag keys (registered + discovered) belong to a category.
    function tagsForCategory(catId) {
        const set = {};
        const cat = LOG_CATEGORIES.find(function (c) { return c.id === catId; });
        if (cat) cat.tags.forEach(function (t) { set[t.toLowerCase()] = t; });
        Object.keys(window.__logSeen).forEach(function (k) {
            if ((TAG_REGISTRY[k] || "uncategorized") === catId) set[k] = window.__logSeen[k];
        });
        return set; // { tagKey: displayTag }
    }

    window.LogControl = {
        LS_KEY: LS_KEY,
        categories: LOG_CATEGORIES,
        registry: TAG_REGISTRY,
        cfg: cfg,
        seen: function () { return window.__logSeen; },
        tagsForCategory: tagsForCategory,
        effective: effective,
        save: save,
        setMaster: function (b) { cfg.masterOn = !!b; save(); },
        setSuppressWarn: function (b) { cfg.suppressWarn = !!b; save(); },
        setSuppressError: function (b) { cfg.suppressError = !!b; save(); },
        setTag: function (tagKey, b) { cfg.tags[tagKey] = !!b; save(); },
        setCategory: function (catId, b) {
            cfg.cats[catId] = !!b;
            // Clear per-tag overrides in this category so children follow it.
            Object.keys(tagsForCategory(catId)).forEach(function (k) { delete cfg.tags[k]; });
            save();
        },
        setAll: function (b) {
            cfg.tags = {};
            if (b) cfg.cats = {};
            else LOG_CATEGORIES.forEach(function (c) { cfg.cats[c.id] = false; });
            save();
        },
        reset: function () {
            cfg.masterOn = true;
            cfg.suppressWarn = false;
            cfg.suppressError = false;
            cfg.tags = {};
            cfg.cats = {};
            save();
        },
    };
})();

/* ============================================================================
   Builds the Settings → 🎨 Display panel from DisplaySettings.
   Theme cards preview themselves with literal swatch colours (a token would
   resolve to the ACTIVE theme and make all five cards identical).
   ============================================================================ */
window.renderDisplaySettings = function () {
    const root = document.getElementById("displayPanelRoot");
    if (!root || !window.DisplaySettings) return;
    const DS = window.DisplaySettings;
    const cfg = DS.get();

    const cardCss = "background:var(--surface-2); border-radius:12px; padding:18px; margin-bottom:16px;";
    const h3Css = "margin:0 0 6px 0; font-size:1.05rem;";
    const noteCss = "color:var(--text-dim); font-size:0.85rem; margin:0 0 14px 0; line-height:1.45;";

    const themeCard = (t) => {
        const on = cfg.theme === t.id;
        const swatches = t.swatch
            .map(
                (c) =>
                    `<span style="width:18px; height:18px; border-radius:4px; background:${c}; border:1px solid var(--border); display:inline-block;"></span>`
            )
            .join("");
        return `
                <button
                    class="fuoc-theme-card${on ? " is-active" : ""}"
                    data-theme-id="${t.id}"
                    aria-pressed="${on ? "true" : "false"}"
                    title="${t.blurb}"
                >
                    <span class="tc-head">
                        <span class="tc-name">${t.label}</span>
                        ${on ? '<span class="tc-check">✓</span>' : ""}
                    </span>
                    <span class="tc-swatches">${swatches}</span>
                    <span class="tc-blurb">${t.blurb}</span>
                </button>`;
    };

    const toggle = (key, label, note) => `
            <label class="fuoc-a11y-row">
                <input type="checkbox" data-display-toggle="${key}" ${cfg[key] ? "checked" : ""} />
                <span class="a11y-text">
                    <span class="a11y-label">${label}</span>
                    <span class="a11y-note">${note}</span>
                </span>
            </label>`;

    // Thirteen cards in one flat grid would bury High Contrast and Dimmed among the
    // flavour themes, so they're grouped. Themes without a group fall into "Other",
    // which means adding one to the palette can never make it disappear from the UI.
    const themeGroups = () => {
        const order = ["Standard", "Easy on the eyes", "Flavour", "Other"];
        const buckets = {};
        DS.THEMES.forEach((t) => {
            const g = order.indexOf(t.group) > -1 ? t.group : "Other";
            (buckets[g] = buckets[g] || []).push(t);
        });
        return order
            .filter((g) => buckets[g] && buckets[g].length)
            .map(
                (g) =>
                    `<div class="fuoc-theme-group">
                            <span class="tg-label">${g}</span>
                            <div class="fuoc-theme-grid">${buckets[g].map(themeCard).join("")}</div>
                        </div>`
            )
            .join("");
    };

    const pct = Math.round(cfg.scale * 100);

    root.innerHTML = `
            <div style="${cardCss}">
                <h3 style="${h3Css}">🎨 Theme</h3>
                <p style="${noteCss}">
                    Changes apply instantly and are remembered on this device — they live outside
                    your save, so resetting the game or importing a character won't undo them.
                </p>
                ${themeGroups()}
            </div>

            <div style="${cardCss}">
                <h3 style="${h3Css}">🔤 Text size</h3>
                <p style="${noteCss}">Scales the interface text. Layouts reflow to match.</p>
                <div class="fuoc-scale-row">
                    <input type="range" id="displayScaleRange" min="90" max="140" step="5" value="${pct}" />
                    <output id="displayScaleOut" class="num">${pct}%</output>
                    <button id="displayScaleReset" class="fuoc-mini-btn" type="button">Reset</button>
                </div>
            </div>

            <div style="${cardCss}">
                <h3 style="${h3Css}">♿ Accessibility</h3>
                <p style="${noteCss}">Each of these works with any theme.</p>
                ${toggle("reduceGlow", "Reduce glow &amp; transparency", "Removes neon text-shadows, blur and see-through panels. The biggest help if bright text on dark looks smeared or doubled.")}
                ${toggle("reduceMotion", "Reduce motion", "Stops animations and transitions, without needing to change your device settings.")}
                ${toggle("bigTargets", "Larger buttons &amp; inputs", "Gives every control a 44px minimum tap area.")}
                ${toggle("focusRings", "Strong focus outline", "Makes the keyboard focus ring thicker and higher contrast.")}
                ${toggle("readableFont", "High-legibility font", "Switches the interface to a wider font with more distinct letter shapes.")}
                <div style="margin-top:14px;">
                    <button id="displayResetAll" class="fuoc-mini-btn" type="button">Reset all display settings</button>
                </div>
            </div>`;

    // ---- wiring ----
    root.querySelectorAll("[data-theme-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
            DS.setTheme(btn.dataset.themeId);
            window.renderDisplaySettings();
        });
    });

    root.querySelectorAll("[data-display-toggle]").forEach((box) => {
        box.addEventListener("change", () => {
            const patch = {};
            patch[box.dataset.displayToggle] = box.checked;
            DS.set(patch);
        });
    });

    const range = document.getElementById("displayScaleRange");
    const out = document.getElementById("displayScaleOut");
    if (range) {
        range.addEventListener("input", () => {
            out.textContent = range.value + "%";
            DS.setScale(Number(range.value) / 100);
        });
    }
    const scaleReset = document.getElementById("displayScaleReset");
    if (scaleReset) {
        scaleReset.addEventListener("click", () => {
            DS.setScale(1);
            window.renderDisplaySettings();
        });
    }
    const resetAll = document.getElementById("displayResetAll");
    if (resetAll) {
        resetAll.addEventListener("click", () => {
            DS.reset();
            window.renderDisplaySettings();
        });
    }
};

/* Builds the Settings → 🔍 Logging panel from LogControl's registry + config. */
window.renderLoggingSettings = function () {
    const root = document.getElementById("loggingPanelRoot");
    if (!root || !window.LogControl) return;
    const LC = window.LogControl,
        cfg = LC.cfg,
        cats = LC.categories,
        ui = (window.__logUIState = window.__logUIState || { collapsed: {}, search: "" });
    if (ui.mirrorLevel === undefined) ui.mirrorLevel = "all";
    if (ui.mirrorAutoscroll === undefined) ui.mirrorAutoscroll = true;

    const cardCss = "background:var(--surface-2);border-radius:12px;padding:18px;margin-bottom:16px;";
    const rowCss = "display:flex;align-items:center;gap:10px;padding:6px 4px;";
    const btnCss = (bg) =>
        "padding:8px 14px;border:none;border-radius:8px;color:var(--l-ink);cursor:pointer;font-weight:600;font-size:.82rem;background:" + bg + ";";
    const esc = (s) =>
        String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    // {key,disp,on}[] for a category — registered tags + any discovered this session.
    function childList(catId) {
        const map = LC.tagsForCategory(catId);
        return Object.keys(map)
            .sort()
            .map((k) => ({ key: k, disp: map[k], on: LC.effective(k, catId) }));
    }

    // Console mirror helpers (volatile in-memory buffer from window.__logMirror).
    const LEVEL_COLOR = { log: "var(--text-dim)", info: "#6db3f2", warn: "#e9a23b", error: "var(--l-red-lt)", debug: "var(--l-ink-cool)" };
    const mirrorPasses = (entry) => ui.mirrorLevel === "all" || entry.level === ui.mirrorLevel;
    const fmtTime = (t) => {
        const d = new Date(t);
        const p = (n) => String(n).padStart(2, "0");
        return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
    };
    const mirrorRowHtml = (entry) =>
        `<div class="logMirrorRow" data-level="${entry.level}" style="padding:2px 6px;border-bottom:1px solid var(--l-sheen-05);color:${LEVEL_COLOR[entry.level] || "var(--text)"};white-space:pre-wrap;word-break:break-word">` +
        `<span style="color:var(--l-on-accent)">[${fmtTime(entry.t)}]</span> ${esc(entry.text)}</div>`;
    const chip = (val, label) => {
        const on = ui.mirrorLevel === val;
        return `<button class="logMirrorChip" data-level="${val}" style="padding:4px 10px;border:1px solid ${on ? "var(--l-indigo)" : "var(--border)"};border-radius:14px;background:${on ? "rgba(102,126,234,.18)" : "transparent"};color:${on ? "#9db0ff" : "var(--text-dim)"};cursor:pointer;font-size:.74rem">${label}</button>`;
    };

    let html = "";

    // Console Mirror card (first / headline — for mobile bug reporting).
    const mirrorRows = window.__logMirror.filter(mirrorPasses).map(mirrorRowHtml).join("");
    html +=
        `<div style="${cardCss}">` +
        `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">` +
        `<h3 style="margin:0;color:var(--accent)">🖥️ Console Mirror</h3>` +
        `<span id="logMirrorCount" style="color:var(--text-dim);font-size:.8rem"></span>` +
        `<span style="flex:1"></span>` +
        `<button id="logMirrorCopy" style="${btnCss("#2e7d52")}">📋 Copy</button>` +
        `<button id="logMirrorClear" style="${btnCss("#7a3b3b")}">Clear</button>` +
        `</div>` +
        `<p style="color:var(--text-dim);font-size:.8rem;margin:0 0 10px 0">A live in-app copy of the dev console for reporting bugs. Volatile — cleared on refresh, never saved.</p>` +
        `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px">` +
        chip("all", "All") + chip("log", "Log") + chip("warn", "Warn") + chip("error", "Error") +
        `<span style="flex:1"></span>` +
        `<label style="display:flex;align-items:center;gap:5px;cursor:pointer;color:var(--text-dim);font-size:.78rem"><input type="checkbox" id="logMirrorAutoscroll" ${ui.mirrorAutoscroll ? "checked" : ""} style="accent-color:var(--l-indigo)"> Autoscroll</label>` +
        `</div>` +
        `<div id="logMirrorBody" style="height:300px;overflow:auto;background:var(--l-bg-black);border:1px solid var(--border);border-radius:8px;padding:6px 4px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.78rem;line-height:1.45">${mirrorRows}</div>` +
        `<textarea id="logMirrorCopyArea" readonly style="position:absolute;left:-9999px;top:-9999px;opacity:0" aria-hidden="true"></textarea>` +
        `</div>`;

    // Performance report card (see 57-perf-probe.js): measures 10 s of play, then gives a copy-paste summary
    // (split into parts that each fit one Discord message).
    const perfParts = (window.PerfProbe && window.PerfProbe.lastParts) || [],
        perfText = perfParts.join("\n\n");
    html +=
        `<div style="${cardCss}">` +
        `<h3 style="margin:0 0 6px 0;color:var(--accent)">📱 Performance Report</h3>` +
        `<p style="color:var(--text-dim);font-size:.82rem;margin:0 0 10px 0">If the game is slow, freezes or makes your device hot: tap Measure. This menu closes for 10 seconds so you can play (do whatever makes it lag, like switching away and back), then it comes back with a report to copy and send to the developer. It holds timings and counts only. No save data. The game runs a little slower while measuring.</p>` +
        `<div style="display:flex;gap:8px;flex-wrap:wrap">` +
        `<button id="perfReportRun" style="${btnCss("#2e7d52")}">▶ Measure 10 seconds</button>` +
        perfParts.map((_, i) => `<button class="perfReportCopy" data-part="${i}" style="${btnCss("#3a5a9a")}">📋 Copy${perfParts.length > 1 ? " part " + (i + 1) + "/" + perfParts.length : " report"}</button>`).join("") +
        `</div>` +
        `<textarea id="perfReportOut" readonly style="display:${perfText ? "block" : "none"};width:100%;height:220px;margin-top:10px;background:var(--l-bg-black);color:var(--text-dim);border:1px solid var(--border);border-radius:8px;padding:8px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.72rem;box-sizing:border-box">${esc(perfText)}</textarea>` +
        `</div>`;

    // Header card: master + protected level switches.
    html +=
        `<div style="${cardCss}">` +
        `<h3 style="margin:0 0 6px 0;color:var(--accent)">🔍 Console Logging</h3>` +
        `<p style="color:var(--text-dim);font-size:.85rem;margin:0 0 14px 0">Quiet the dev console by category or individual tag. Errors and warnings stay visible unless you silence them below. Saved separately from your game.</p>` +
        `<label style="${rowCss}cursor:pointer"><input type="checkbox" id="logMaster" ${cfg.masterOn ? "checked" : ""} style="width:18px;height:18px;accent-color:var(--l-indigo)"> <strong>Enable all console logging</strong></label>` +
        `<label style="${rowCss}cursor:pointer"><input type="checkbox" id="logSupWarn" ${cfg.suppressWarn ? "checked" : ""} style="width:16px;height:16px;accent-color:#e9a23b"> Silence warnings <span style="color:var(--l-on-accent);font-size:.78rem">(then category toggles apply to warnings)</span></label>` +
        `<label style="${rowCss}cursor:pointer"><input type="checkbox" id="logSupErr" ${cfg.suppressError ? "checked" : ""} style="width:16px;height:16px;accent-color:var(--l-red)"> Silence errors <span style="color:var(--l-on-accent);font-size:.78rem">(not recommended)</span></label>` +
        `</div>`;

    // Toolbar.
    html +=
        `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px">` +
        `<input id="logSearch" type="text" placeholder="🔎 Filter tags…" value="${esc(ui.search)}" style="flex:1;min-width:160px;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)">` +
        `<button id="logEnableAll" style="${btnCss("#2e7d52")}">Enable all</button>` +
        `<button id="logDisableAll" style="${btnCss("#7a3b3b")}">Disable all</button>` +
        `<button id="logReset" style="${btnCss("var(--l-neutral-4)")}">Reset</button>` +
        `</div>`;

    // Category groups.
    cats.forEach((cat) => {
        const children = childList(cat.id);
        const onCount = children.filter((c) => c.on).length;
        const total = children.length;
        const allOn = total > 0 && onCount === total;
        const collapsed = !!ui.collapsed[cat.id];
        const discoveredNote =
            cat.id === "uncategorized" && total > 0
                ? `<div style="color:var(--l-on-accent);font-size:.78rem;padding:2px 0 8px 0">Includes tags discovered this session.</div>`
                : "";
        html +=
            `<div class="logCat" style="${cardCss}padding:0;overflow:hidden">` +
            `<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--surface)">` +
            `<input type="checkbox" class="logCatBox" data-cat="${cat.id}" ${allOn ? "checked" : ""} style="width:17px;height:17px;accent-color:var(--l-indigo)">` +
            `<span class="logCatToggle" data-cat="${cat.id}" style="flex:1;cursor:pointer;font-weight:600">${cat.icon} ${esc(cat.label)} <span style="color:var(--text-dim);font-weight:400;font-size:.8rem">(${onCount}/${total} on)</span></span>` +
            `<span class="logCatToggle" data-cat="${cat.id}" style="cursor:pointer;color:var(--text-dim);font-size:.9rem">${collapsed ? "▸" : "▾"}</span>` +
            `</div>` +
            `<div class="logCatBody" data-cat="${cat.id}" style="display:${collapsed ? "none" : "block"};padding:8px 16px 12px 38px">` +
            discoveredNote +
            (total === 0
                ? `<div style="color:var(--l-on-accent);font-size:.82rem;padding:6px 0">No tags seen yet this session.</div>`
                : children
                      .map(
                          (c) =>
                              `<label class="logTagRow" data-tagtext="${esc(c.disp.toLowerCase())}" style="display:flex;align-items:center;gap:9px;padding:4px 0;cursor:pointer">` +
                              `<input type="checkbox" class="logTagBox" data-tag="${esc(c.key)}" ${c.on ? "checked" : ""} style="width:15px;height:15px;accent-color:var(--l-indigo)">` +
                              `<span style="font-size:.88rem">[${esc(c.disp)}]</span></label>`
                      )
                      .join("")) +
            `</div></div>`;
    });

    root.innerHTML = html;

    // Tri-state for category boxes (mixed children -> indeterminate).
    cats.forEach((cat) => {
        const children = childList(cat.id);
        const onCount = children.filter((c) => c.on).length;
        const box = root.querySelector('.logCatBox[data-cat="' + cat.id + '"]');
        if (box) box.indeterminate = children.length > 0 && onCount > 0 && onCount < children.length;
    });

    const rerender = () => window.renderLoggingSettings();

    root.querySelector("#logMaster").addEventListener("change", (e) => LC.setMaster(e.target.checked));
    root.querySelector("#logSupWarn").addEventListener("change", (e) => LC.setSuppressWarn(e.target.checked));
    root.querySelector("#logSupErr").addEventListener("change", (e) => LC.setSuppressError(e.target.checked));
    root.querySelector("#logEnableAll").addEventListener("click", () => {
        LC.setAll(true);
        rerender();
    });
    root.querySelector("#logDisableAll").addEventListener("click", () => {
        LC.setAll(false);
        rerender();
    });
    root.querySelector("#logReset").addEventListener("click", () => {
        ui.search = "";
        LC.reset();
        rerender();
    });

    const search = root.querySelector("#logSearch");
    const applyFilter = () => {
        const q = (search.value || "").toLowerCase().trim();
        ui.search = q;
        root.querySelectorAll(".logTagRow").forEach((r) => {
            r.style.display = !q || r.getAttribute("data-tagtext").indexOf(q) !== -1 ? "flex" : "none";
        });
    };
    search.addEventListener("input", applyFilter);

    root.querySelectorAll(".logCatToggle").forEach((el) =>
        el.addEventListener("click", () => {
            const id = el.getAttribute("data-cat");
            ui.collapsed[id] = !ui.collapsed[id];
            rerender();
        })
    );
    root.querySelectorAll(".logCatBox").forEach((box) =>
        box.addEventListener("change", () => {
            LC.setCategory(box.getAttribute("data-cat"), box.checked);
            rerender();
        })
    );
    root.querySelectorAll(".logTagBox").forEach((box) =>
        box.addEventListener("change", () => {
            LC.setTag(box.getAttribute("data-tag"), box.checked);
            rerender();
        })
    );

    // --- Console mirror wiring ---
    const mBody = root.querySelector("#logMirrorBody");
    const mCount = root.querySelector("#logMirrorCount");
    const updateMirrorCount = () => {
        if (mCount) mCount.textContent = window.__logMirror.filter(mirrorPasses).length + " lines";
    };
    const scrollMirror = () => {
        if (mBody && ui.mirrorAutoscroll) mBody.scrollTop = mBody.scrollHeight;
    };
    updateMirrorCount();
    scrollMirror();

    // Live append while the pane is mounted. Re-registered each render so the
    // latest body node is the target; capture avoids touching console.*.
    window.__onMirror = (entry) => {
        if (!mBody || !mBody.isConnected) return;
        if (!mirrorPasses(entry)) {
            updateMirrorCount();
            return;
        }
        mBody.insertAdjacentHTML("beforeend", mirrorRowHtml(entry));
        const cap = (window.LogMirror && window.LogMirror.CAP) || 1000;
        while (mBody.childElementCount > cap) mBody.removeChild(mBody.firstChild);
        updateMirrorCount();
        scrollMirror();
    };

    root.querySelectorAll(".logMirrorChip").forEach((b) =>
        b.addEventListener("click", () => {
            ui.mirrorLevel = b.getAttribute("data-level");
            rerender();
        })
    );
    const autoBox = root.querySelector("#logMirrorAutoscroll");
    if (autoBox)
        autoBox.addEventListener("change", () => {
            ui.mirrorAutoscroll = autoBox.checked;
            scrollMirror();
        });

    const perfRun = root.querySelector("#perfReportRun");
    perfRun && perfRun.addEventListener("click", () => window.PerfProbe && window.PerfProbe.runMeasurement(10));
    root.querySelectorAll(".perfReportCopy").forEach((btn) =>
        btn.addEventListener("click", async () => {
            const parts = (window.PerfProbe && window.PerfProbe.lastParts) || [],
                text = parts[Number(btn.getAttribute("data-part"))] || "",
                ok = text && (await window.PerfProbe.copyText(text));
            typeof showNotification === "function" &&
                showNotification(ok ? "📋 Copied" + (parts.length > 1 ? " — paste it, then copy the next part" : "") : "Couldn't copy — select the text below and copy it by hand", ok ? "success" : "info");
        })
    );

    const clearBtn = root.querySelector("#logMirrorClear");
    if (clearBtn)
        clearBtn.addEventListener("click", () => {
            window.LogMirror && window.LogMirror.clear();
            if (mBody) mBody.innerHTML = "";
            updateMirrorCount();
        });

    const copyBtn = root.querySelector("#logMirrorCopy");
    if (copyBtn)
        copyBtn.addEventListener("click", () => {
            const text = window.__logMirror
                .filter(mirrorPasses)
                .map((e) => "[" + fmtTime(e.t) + "] [" + e.level.toUpperCase() + "] " + e.text)
                .join("\n");
            const done = () =>
                typeof showNotification === "function" && showNotification("📋 Console copied to clipboard", "success");
            const fallback = () => {
                const ta = root.querySelector("#logMirrorCopyArea");
                if (!ta) return;
                ta.value = text;
                ta.style.position = "static";
                ta.style.left = "auto";
                ta.style.top = "auto";
                ta.style.opacity = "1";
                ta.style.width = "100%";
                ta.style.height = "120px";
                ta.focus();
                ta.select();
                let ok = false;
                try { ok = document.execCommand("copy"); } catch (e) {}
                if (ok) {
                    ta.style.cssText = "position:absolute;left:-9999px;top:-9999px;opacity:0";
                    done();
                } else if (typeof showNotification === "function") {
                    showNotification("Select the text below and copy manually", "info");
                }
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, fallback);
            } else fallback();
        });

    applyFilter();
};

function debugModal() {
    const e = document.getElementById("hiringModal");
    if (!e) return void console.warn("No #hiringModal in DOM");
    const t = getComputedStyle(e);
    console.table({
        display: t.display,
        visibility: t.visibility,
        opacity: t.opacity,
        position: t.position,
        zIndex: t.zIndex,
        pointerEvents: t.pointerEvents,
    }),
        console.log("Modal rect:", e.getBoundingClientRect());
}
function closeHiringModal() {
    const e = document.getElementById("hiringModal");
    e && e.remove();
    const t = window.__hiringEscHandler__;
    t && (window.removeEventListener("keydown", t), (window.__hiringEscHandler__ = null)),
        modalRegistry.delete("hiring");
}
window.modalRegistry = window.modalRegistry || new Map();
