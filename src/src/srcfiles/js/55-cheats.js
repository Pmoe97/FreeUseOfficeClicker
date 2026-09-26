// ============================================================================
// 55-cheats — The Cheats & Debugging panel: rendered on open into #cheatsModal, one
// delegated listener, every action going through the game's own helpers.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

// Chat-driven stat gains the multipliers apply to (47-chat-ai.js reads
// gameState.cheatMultipliers[stat]); other stats never went through that path.
const CHEAT_MULT_STATS = [
    ["affection", "❤️ Affection"],
    ["comfort", "😌 Comfort"],
    ["trust", "🤝 Trust"],
    ["desire", "💕 Desire"],
    ["obedience", "🙇 Obedience"],
];
const CHEAT_SET_STATS = [
    ["affection", "Affection", "stats"],
    ["trust", "Trust", "stats"],
    ["comfort", "Comfort", "stats"],
    ["desire", "Desire", "stats"],
    ["obedience", "Obedience", "stats"],
    ["productivity", "Productivity", "stats"],
    ["confidence", "Confidence", "personality"],
    ["flirty", "Flirtiness", "personality"],
    ["professional", "Professionalism", "personality"],
    ["humor", "Humor", "personality"],
];
let cheatClockTimer = null;

function cheatActiveEmployees() {
    return gameState.employees.filter((e) => "active" === e.employmentStatus);
}
function cheatRefresh() {
    "function" == typeof invalidateCashPerSecond && invalidateCashPerSecond(),
        updateUI(),
        "function" == typeof updateBusinessTab && updateBusinessTab(),
        "people" === gameState.activeTab && updatePeopleTab(),
        saveGame(!1);
}
function cheatAgo(t) {
    const n = Math.floor(((gameState.time?.currentTime || Date.now()) - t) / 1e3);
    return n < 60 ? `${n}s ago` : n < 3600 ? `${Math.floor(n / 60)}m ago` : n < 86400 ? `${Math.floor(n / 3600)}h ago` : `${Math.floor(n / 86400)}d ago`;
}

function openCheatPanel() {
    const m = document.getElementById("cheatsModal");
    if (!m) return;
    gameState.cheatMultipliers || (gameState.cheatMultipliers = {});
    m.innerHTML = renderCheatPanel();
    m.style.display = "flex";
    if (!m._cheatsWired) {
        m._cheatsWired = !0;
        m.addEventListener("click", (e) => {
            if (e.target === m) return closeCheatPanel();
            const b = e.target.closest("[data-cheat]");
            b && (e.preventDefault(), runCheat(b.dataset.cheat, b));
        });
        m.addEventListener("input", (e) => {
            const t = e.target;
            if (t.dataset.mult) {
                const v = parseFloat(t.value) / 10;
                (gameState.cheatMultipliers[t.dataset.mult] = v), (t.nextElementSibling.textContent = `${v.toFixed(1)}×`);
            } else if ("cheatTimeScale" === t.id) {
                const v = parseInt(t.value);
                (gameState.time.timeScale = v),
                    (gameState.time.baseTimeScale = v),
                    gameState.time.timeDilation && (gameState.time.timeDilation.idleScale = v),
                    (document.getElementById("cheatTimeScaleVal").textContent = `${v}×`);
            }
        });
        m.addEventListener("change", (e) => {
            const t = e.target,
                d = gameState.time?.timeDilation;
            if ("cheatDilation" === t.id && d) (d.enabled = t.checked), renderCheatClock();
            else if (t.dataset.dilation && d) {
                const [k, lo, hi, def] = { conv: ["conversationScale", 1, 20, 1], group: ["groupChatScale", 1, 20, 2], social: ["socialBrowsingScale", 1, 50, 10] }[t.dataset.dilation];
                (d[k] = Math.max(lo, Math.min(hi, parseInt(t.value) || def))), (t.value = d[k]);
            }
        });
    }
    renderCheatClock(), renderCheatDebugLists();
    clearInterval(cheatClockTimer), (cheatClockTimer = setInterval(renderCheatClock, 1e3));
}
function closeCheatPanel() {
    const m = document.getElementById("cheatsModal");
    m && (m.style.display = "none"), clearInterval(cheatClockTimer), (cheatClockTimer = null);
}

function renderCheatPanel() {
    const t = gameState.time || {},
        d = t.timeDilation || {},
        scale = t.baseTimeScale || t.timeScale || 20,
        mult = CHEAT_MULT_STATS.map(([k, label]) => {
            const v = gameState.cheatMultipliers[k] || 1;
            return `<label class="cheat-slider"><span>${label}</span><input type="range" min="10" max="50" value="${10 * v}" data-mult="${k}"><output>${v.toFixed(1)}×</output></label>`;
        }).join(""),
        statOpts = CHEAT_SET_STATS.map(([k, l]) => `<option value="${k}">${l}</option>`).join(""),
        btn = (id, label, extra = "") => `<button class="cheat-btn${extra}" data-cheat="${id}">${label}</button>`;
    return `
      <div class="cheat-panel">
        <div class="cheat-head">
          <h2>⚡ Cheats &amp; Debugging</h2>
          <button class="cheat-close" data-cheat="close" title="Close">✕</button>
        </div>
        <div class="cheat-grid">
          <section class="cheat-card">
            <h3>💰 Money &amp; Prestige</h3>
            <div class="cheat-row">
              <input type="number" id="cheatCashAmount" value="100" min="0" step="any">
              <select id="cheatCashUnit">
                <option value="1">$</option><option value="1e3">K</option><option value="1e6" selected>M</option>
                <option value="1e9">B</option><option value="1e12">T</option><option value="1e15">Qa</option>
              </select>
              ${btn("cash-set", "Set")}${btn("cash-add", "Add")}
            </div>
            <div class="cheat-row">${btn("cash+1e6", "+$1M")}${btn("cash+1e9", "+$1B")}${btn("cash+1e12", "+$1T")}${btn("cash*10", "×10")}</div>
            <div class="cheat-row">
              <label class="cheat-lbl">Influence</label>
              <input type="number" id="cheatInfluence" value="${Math.floor(gameState.influencePoints || 0)}" min="0">
              ${btn("influence-set", "Set")}
            </div>
          </section>

          <section class="cheat-card">
            <h3>🏢 Business</h3>
            <div class="cheat-stack">
              ${btn("unlock-locations", "🏢 Unlock all locations")}
              ${btn("unlock-products", "📦 Unlock all products")}
              ${btn("product-levels", "⬆️ +10 levels on unlocked products")}
              ${btn("manager-levels", "🏅 +1 manager level on managed products")}
              ${btn("finish-cycles", "⚡ Finish every running cycle now")}
              ${btn("hire-managers", "👔 Hire a manager for every empty product")}
            </div>
          </section>

          <section class="cheat-card">
            <h3>👥 People</h3>
            <div class="cheat-stack">
              ${btn("max-stats", "🌟 Max every stat for everyone")}
              ${btn("make-available", "🩹 Make everyone available (clear sick/away)")}
            </div>
            <div class="cheat-row">
              <select id="cheatStatType">${statOpts}</select>
              <input type="number" id="cheatStatValue" value="100" min="0" max="100">
              ${btn("set-stat", "Set for all")}
            </div>
          </section>

          <section class="cheat-card">
            <h3>⏰ Time</h3>
            <div class="cheat-clock"><span id="cheatClock">—</span><span id="cheatClockStatus"></span></div>
            <div class="cheat-row">
              ${btn("pause", t.paused ? "▶️ Resume" : "⏸️ Pause")}
              ${btn("skip-1", "+1h")}${btn("skip-3", "+3h")}${btn("skip-8", "+8h")}${btn("skip-24", "+1 day")}${btn("skip-payday", "📅 Payday")}
            </div>
            <label class="cheat-slider"><span>Speed</span><input type="range" id="cheatTimeScale" min="1" max="120" value="${scale}"><output id="cheatTimeScaleVal">${scale}×</output></label>
            <div class="cheat-row">${btn("scale-5", "5×")}${btn("scale-20", "20× (default)")}${btn("scale-60", "60×")}</div>
            <div class="cheat-row cheat-dilation">
              <label><input type="checkbox" id="cheatDilation" ${!1 !== d.enabled ? "checked" : ""}> Slow time in</label>
              <label>chat <input type="number" data-dilation="conv" value="${d.conversationScale ?? 1}" min="1" max="20">×</label>
              <label>groups <input type="number" data-dilation="group" value="${d.groupChatScale ?? 2}" min="1" max="20">×</label>
              <label>social <input type="number" data-dilation="social" value="${d.socialBrowsingScale ?? 10}" min="1" max="50">×</label>
            </div>
          </section>

          <section class="cheat-card">
            <h3>📈 Chat stat gains</h3>
            <p class="cheat-note">Multiplies stat <em>gains</em> from chatting (losses are unaffected).</p>
            ${mult}
            <div class="cheat-row">${btn("mult-reset", "Reset 1×")}${btn("mult-max", "Max 5×")}</div>
          </section>

          <section class="cheat-card">
            <h3>📱 Social</h3>
            <div class="cheat-stack">
              ${btn("spawn-posts", "📝 Spawn 10 posts")}
              ${btn("clear-posts", "🗑️ Clear all posts", " danger")}
            </div>
          </section>
        </div>

        <details class="cheat-debug">
          <summary>🔎 Debug — scheduled events, office buzz, gossip</summary>
          <div class="cheat-grid">
            <section class="cheat-card"><h3>📅 Scheduled NPC events <span id="cheatEventsCount"></span></h3><div id="cheatEventsList" class="cheat-list"></div></section>
            <section class="cheat-card"><h3>📢 Office buzz <span id="cheatBuzzCount"></span></h3><div id="cheatBuzzList" class="cheat-list"></div>${btn("clear-buzz", "Clear all", " danger")}</section>
            <section class="cheat-card"><h3>🗣️ Gossip <span id="cheatGossipCount"></span></h3><div id="cheatGossipList" class="cheat-list"></div>${btn("clear-gossip", "Clear all", " danger")}</section>
          </div>
        </details>
      </div>`;
}

function renderCheatClock() {
    const c = document.getElementById("cheatClock"),
        s = document.getElementById("cheatClockStatus");
    if (!c || !gameState.time) return;
    c.textContent = new Date(gameState.time.currentTime).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    s && ((s.textContent = gameState.time.paused ? "Paused" : `Running ${gameState.time.baseTimeScale || gameState.time.timeScale || 20}×`), (s.className = gameState.time.paused ? "is-paused" : ""));
}
function renderCheatDebugLists() {
    const esc = (v) => ("function" == typeof escapeHtml ? escapeHtml(String(v ?? "")) : String(v ?? ""));
    const ev = (gameState.npcScheduledEvents || []).filter((e) => "pending" === e.status).sort((a, b) => a.triggerTime - b.triggerTime),
        now = gameState.time?.currentTime || Date.now(),
        el = document.getElementById("cheatEventsList");
    el &&
        ((document.getElementById("cheatEventsCount").textContent = `(${ev.length})`),
        (el.innerHTML = ev.length
            ? ev
                  .map((e) => {
                      const h = Math.max(0, Math.round((e.triggerTime - now) / 36e5));
                      return `<div class="cheat-item">${"player" === e.source ? "👤" : "🤖"} <strong>${esc(e.npcName || "NPC")}</strong> · ${esc(String(e.type || "event").replace(/_/g, " "))} · in ${h >= 24 ? `${Math.round(h / 24)}d` : `${h}h`}<div class="cheat-dim">${esc(e.originalPhrase || "")}</div></div>`;
                  })
                  .join("")
            : '<div class="cheat-dim">Nothing pending</div>'));
    const buzz = gameState.companyWideContext?.currentBuzz || [],
        bl = document.getElementById("cheatBuzzList");
    bl &&
        ((document.getElementById("cheatBuzzCount").textContent = `(${buzz.length})`),
        (bl.innerHTML = buzz.length
            ? buzz
                  .map((b, i) => `<div class="cheat-item"><button class="cheat-x" data-cheat="buzz-remove" data-idx="${i}" title="Remove">✕</button>${esc(b.content)}<div class="cheat-dim">${cheatAgo(b.timestamp)}${b.juiciness ? ` · juiciness ${b.juiciness}` : ""}</div></div>`)
                  .join("")
            : '<div class="cheat-dim">No office buzz yet</div>'));
    // knownGossip entries are either full items or { gossipId } references into activeGossip.
    const pool = gameState.socialNetwork?.activeGossip || [],
        gossipText = (g) => g.content || pool.find((x) => x.id === g.gossipId)?.content || "",
        withGossip = cheatActiveEmployees().filter((e) => e.gossip?.knownGossip?.length),
        gl = document.getElementById("cheatGossipList");
    gl &&
        ((document.getElementById("cheatGossipCount").textContent = `(${withGossip.length} people)`),
        (gl.innerHTML = withGossip.length
            ? withGossip
                  .map(
                      (e) =>
                          `<div class="cheat-item"><strong>${esc(e.name)}</strong> knows ${e.gossip.knownGossip.length}${e.gossip.knownGossip
                              .slice(0, 3)
                              .map((g) => `<div class="cheat-dim">• ${esc(gossipText(g))}</div>`)
                              .join("")}</div>`
                  )
                  .join("")
            : '<div class="cheat-dim">No gossip yet</div>'));
}

async function runCheat(id, el) {
    const v = (x) => document.getElementById(x)?.value;
    if ("close" === id) return closeCheatPanel();
    // ── money ──
    if ("cash-set" === id || "cash-add" === id) {
        const n = Math.max(0, parseFloat(v("cheatCashAmount")) || 0) * parseFloat(v("cheatCashUnit") || "1");
        return (gameState.cash = "cash-set" === id ? n : gameState.cash + n), showNotification(`💰 Cash is now $${formatCash(gameState.cash)}`, "success"), cheatRefresh();
    }
    if (id.startsWith("cash+")) return (gameState.cash += parseFloat(id.slice(5))), showNotification(`💰 Cash is now $${formatCash(gameState.cash)}`, "success"), cheatRefresh();
    if ("cash*10" === id) return (gameState.cash *= 10), showNotification(`💰 Cash is now $${formatCash(gameState.cash)}`, "success"), cheatRefresh();
    if ("influence-set" === id)
        return (
            (gameState.influencePoints = Math.max(0, parseInt(v("cheatInfluence")) || 0)),
            "function" == typeof updatePrestigeUI && updatePrestigeUI(),
            "function" == typeof renderInfluenceUpgrades && renderInfluenceUpgrades(),
            showNotification(`✨ Influence set to ${gameState.influencePoints}`, "success"),
            cheatRefresh()
        );
    // ── business ──
    if ("unlock-locations" === id) {
        let n = 0;
        gameState.locations.forEach((l) => {
            l.unlocked || ((l.unlocked = !0), (l.owned = !0), n++);
            const p = gameState.products.find((p) => p.locationId === l.id && 0 === p.unlockCost);
            p && (p.unlocked = !0);
        });
        // New sites need their ladder seats (the old cheat skipped this, then threw).
        return "function" == typeof initializeHierarchicalPyramid && initializeHierarchicalPyramid(), showNotification(`🏢 Unlocked ${n} location(s)`, "success"), cheatRefresh();
    }
    if ("unlock-products" === id) {
        let n = 0;
        return gameState.products.forEach((p) => p.unlocked || ((p.unlocked = !0), n++)), "function" == typeof initializeHierarchicalPyramid && initializeHierarchicalPyramid(), showNotification(`📦 Unlocked ${n} product(s)`, "success"), cheatRefresh();
    }
    if ("product-levels" === id) {
        let n = 0;
        return (
            gameState.products.forEach((p) => {
                p.unlocked && p.level < 999 && ((p.level = Math.min(999, p.level + 10)), (p.upgradeCost = p.level < 999 ? getProductUpgradeCost(p) : 0), n++);
            }),
            showNotification(`⬆️ +10 levels on ${n} product(s)`, "success"),
            cheatRefresh()
        );
    }
    if ("manager-levels" === id) {
        let n = 0;
        return (
            gameState.products.forEach((p) => {
                p.managerHired && ((p.managerLevel = (p.managerLevel || 1) + 1), (p.managerUpgradeCost = Math.floor(1.25 * (p.managerUpgradeCost || 100))), n++);
            }),
            showNotification(`🏅 +1 manager level on ${n} product(s)`, "success"),
            cheatRefresh()
        );
    }
    if ("finish-cycles" === id) {
        let n = 0;
        return gameState.products.forEach((p) => p.running && p.timeRemainingMs > 0 && ((p.timeRemainingMs = 0), n++)), showNotification(`⚡ Finished ${n} cycle(s)`, "success"), cheatRefresh();
    }
    if ("hire-managers" === id) {
        const empty = gameState.products.filter((p) => p.unlocked && !p.managerHired);
        if (!empty.length) return showNotification("Every unlocked product already has a manager", "info");
        if (!(await showConfirm(`Hire a manager for ${empty.length} product(s), free?\n\nEach new hire writes a profile and portrait, so this makes ${empty.length} AI text and image requests.`, "Hire Managers", { type: "info", confirmText: "Hire" })))
            return;
        let n = 0;
        for (const p of empty) {
            try {
                const c = generatePotentialHires(p.id);
                if (!c?.length) continue;
                (gameState.currentHiringProductId = p.id), (gameState.currentCandidates = c), (gameState.cash += getManagerHireCost(p)); // free: cover the fee
                await selectManagerCandidate(0), n++;
            } catch (e) {
                console.warn("[Cheats] Hire failed for", p.name, e);
            }
        }
        return "function" == typeof closeHiringModal && closeHiringModal(), showNotification(`👔 Hired ${n} manager(s)`, "success"), cheatRefresh(), openCheatPanel();
    }
    // ── people ──
    if ("max-stats" === id) {
        const es = cheatActiveEmployees();
        return (
            es.forEach((e) => {
                (e.stats = e.stats || {}), (e.personality = e.personality || {});
                CHEAT_SET_STATS.forEach(([k, , g]) => (e[g][k] = 100));
            }),
            showNotification(`🌟 Maxed every stat for ${es.length} people`, "success"),
            cheatRefresh()
        );
    }
    if ("set-stat" === id) {
        const k = v("cheatStatType"),
            n = Math.max(0, Math.min(100, parseInt(v("cheatStatValue")) || 0)),
            g = CHEAT_SET_STATS.find(([s]) => s === k)?.[2] || "stats",
            es = cheatActiveEmployees();
        return es.forEach((e) => ((e[g] = e[g] || {}), (e[g][k] = n))), showNotification(`✅ ${k} = ${n} for ${es.length} people`, "success"), cheatRefresh();
    }
    if ("make-available" === id) {
        let n = 0;
        return (
            cheatActiveEmployees().forEach((e) => {
                (e.unavailable || e.flags?.systemFlags?.some((f) => "sick" === f.key)) && n++;
                e.unavailable && ((e.unavailable = !1), delete e.unavailableUntil, delete e.unavailableReason);
                e.flags?.systemFlags && (e.flags.systemFlags = e.flags.systemFlags.filter((f) => "sick" !== f.key));
            }),
            showNotification(`🩹 ${n} people back at work`, "success"),
            cheatRefresh()
        );
    }
    // ── time ──
    if ("pause" === id) return (gameState.time.paused = !gameState.time.paused), (el.textContent = gameState.time.paused ? "▶️ Resume" : "⏸️ Pause"), renderCheatClock();
    if (id.startsWith("skip-")) {
        let ms;
        if ("skip-payday" === id) {
            // Payroll runs on the day change into Friday.
            const d = new Date(gameState.time.currentTime),
                days = (5 - d.getDay() + 7) % 7 || 7,
                target = new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, 0, 1);
            ms = target.getTime() - d.getTime();
        } else ms = 36e5 * parseInt(id.slice(5));
        // Stepping hour by hour runs every hour/day change on the way (payroll, schedules,
        // events) — the old buttons jumped the clock and called them without arguments.
        return fastForwardGameTime(ms), renderCheatClock(), showNotification(`⏩ Skipped ${ms >= 864e5 ? `${Math.round(ms / 864e5)} day(s)` : `${Math.round(ms / 36e5)}h`}`, "success"), cheatRefresh();
    }
    if (id.startsWith("scale-")) {
        const n = parseInt(id.slice(6)),
            r = document.getElementById("cheatTimeScale");
        return r && ((r.value = n), r.dispatchEvent(new Event("input", { bubbles: !0 }))), renderCheatClock();
    }
    // ── multipliers ──
    if ("mult-reset" === id || "mult-max" === id) {
        const n = "mult-max" === id ? 5 : 1;
        return CHEAT_MULT_STATS.forEach(([k]) => (gameState.cheatMultipliers[k] = n)), openCheatPanel(), showNotification(`📈 Chat stat gains ×${n}`, "info");
    }
    // ── social ──
    if ("spawn-posts" === id) {
        const es = cheatActiveEmployees();
        if (!es.length) return showNotification("No active employees to post", "error");
        const lines = ["Coffee break! ☕", "Busy day at work 💼", "Finally done with that project! 🎉", "Anyone else tired? 😴", "Looking forward to the weekend! 🌴", "That 3pm slump is REAL today 😩", "Someone brought donuts and I have zero self-control 🍩", "My plant is still alive after 2 months 🌱", "Trying a new recipe tonight, pray for my kitchen 🙏🍳", "The sunset from my window right now is unreal 🌅"];
        for (let i = 0; i < 10; i++) {
            const e = es[Math.floor(Math.random() * es.length)];
            createSocialPost({ authorId: e.id, authorName: e.name, type: "life_update", content: lines[Math.floor(Math.random() * lines.length)], timestamp: gameState.time.currentTime, likes: [], comments: [], mentions: [] });
        }
        return showNotification("📝 Spawned 10 posts", "success"), "social" === gameState.activeTab && renderSocialFeed(!0), saveGame(!1);
    }
    if ("clear-posts" === id) {
        const n = gameState.socialNetwork.posts.length;
        if (!(await showConfirm(`Delete all ${n} social posts? This can't be undone.`, "Clear Posts", { type: "danger", confirmText: "Delete all" }))) return;
        return (
            (gameState.socialNetwork.posts = []),
            (gameState.socialNetwork.recentPostTypes = []),
            (gameState.socialNetwork.globalEvents = []),
            "undefined" != typeof feedPaginationState && ((feedPaginationState.currentPage = 1), (feedPaginationState.totalPages = 1), (feedPaginationState.allPosts = [])),
            showNotification(`🗑️ Cleared ${n} posts`, "info"),
            "social" === gameState.activeTab && renderSocialFeed(!0),
            saveGame(!1)
        );
    }
    // ── debug ──
    if ("buzz-remove" === id) return gameState.companyWideContext?.currentBuzz?.splice(+el.dataset.idx, 1), renderCheatDebugLists(), saveGame(!1);
    if ("clear-buzz" === id)
        return (await showConfirm("Clear all office buzz? NPCs forget recent public events.", "Clear Buzz", { type: "warning", confirmText: "Clear" })) && gameState.companyWideContext && ((gameState.companyWideContext.currentBuzz = []), renderCheatDebugLists(), saveGame(!1));
    if ("clear-gossip" === id)
        return (
            (await showConfirm("Clear all gossip from every NPC?", "Clear Gossip", { type: "warning", confirmText: "Clear" })) &&
            (cheatActiveEmployees().forEach((e) => e.gossip && (e.gossip.knownGossip = [])), renderCheatDebugLists(), saveGame(!1))
        );
}
(window.openCheatPanel = openCheatPanel), (window.closeCheatPanel = closeCheatPanel);
