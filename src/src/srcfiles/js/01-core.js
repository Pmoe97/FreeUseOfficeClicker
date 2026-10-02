// ============================================================================
// 01-core — Global constants (CAPS, snapshot tiers), debugLog/debugWarn, core math (cycle time, values, click reduction), economy config `gameBalance`, emojiPicker, and the AI text queue `AIRequestQueue`.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

const GAME_TICK_INTERVAL = 100,
    INITIAL_CASH = 100,
    NEWS_UPDATE_INTERVAL = 3e4,
    CAPS = {
        CHAT_MESSAGES_PER_NPC: 200,
        CHAT_MESSAGES_SAVE: 100,
        EVENT_MEMORIES_PER_EMP: 25,
        EVENT_MEMORIES_GLOBAL: 30,
        SOCIAL_POSTS: 500,
        SOCIAL_POST_IMAGES_KEEP: 1e3,
        RECENT_POST_TYPES: 50,
        CONVERSATION_ARCHIVE: 5,
        STORY_EXPIRY_MS: 36e5,
        MEMORY_ITEMS_DEFAULT: 300,
        MEMORY_ITEMS_MIN: 50,
        MEMORY_ITEMS_MAX: 1e3,
        AI_QUALITY_EXAMPLES: 20,
    };
// ─── Curated autosave snapshot retention ────────────────────────────────────
// Snapshots are full saves taken every SNAPSHOT_BASE_MS of *gameplay* time and
// thinned into tiers so the Save Manager always offers a wide range of rollback
// points: dense for recent moments, sparse going back ~24h of play. All ages are
// measured in accumulated gameplay milliseconds (gameState.totalPlayTime). Tunable.
const SNAPSHOT_BASE_MS = 2e4, // take a new snapshot every 20s of gameplay
    SNAPSHOT_TIERS = [
        { maxAge: 6e4, minSpacing: 18e3 }, // last 1 min   → ~3-4
        { maxAge: 6e5, minSpacing: 75e3 }, // last 10 min  → ~10 cumulative
        { maxAge: 36e5, minSpacing: 6e5 }, // last 1 hour  → ~15 cumulative
        { maxAge: 864e5, minSpacing: 16560e3 }, // last 24h → ~20 cumulative
    ],
    SNAPSHOT_MAX_COUNT = 26, // hard cap on stored snapshots (margin over 20)
    SNAPSHOT_MIN_KEEP = 12, // always keep newest N, even if >24h old (cross-session)
    SNAPSHOT_BYTE_BUDGET = 12e6; // total chars across all snapshots; tune via [Snapshot] logs
function debugLog(e, ...t) {
    gameState?.settings?.debugMode && console.log(`[${e}]`, ...t);
}
function debugWarn(e, ...t) {
    gameState?.settings?.debugMode && console.warn(`[${e}]`, ...t);
}
function getManagerialBonuses(e) {
    const t = { speedMultiplier: 1, incomeMultiplier: 1, trainingMultiplier: 1, managerChain: [] };
    if (!e || !e.managerId) return t;
    const n = gameState.employees.find((t) => t.id === e.managerId);
    if (!n || "active" !== n.employmentStatus || (n.unavailable && n.unavailableUntil > (gameState.currentDay || 0)))
        return t;
    const a = gameState.corporatePyramid?.positions?.[1]?.find((e) => e.employeeId === n.id);
    if (!a) return t;
    const o = new Set();
    let i = a;
    for (; i && i.reportsTo && !o.has(i.positionId); ) {
        o.add(i.positionId);
        const e = findPositionById(i.reportsTo);
        if (!e || !e.employeeId) break;
        const n = gameState.employees.find((t) => t.id === e.employeeId);
        if (!n || "active" !== n.employmentStatus) break;
        const a = n.career?.level || e.level,
            s = gameState.hierarchyLevels?.[a];
        if (s) {
            const e = {
                2: { speed: 1.05, income: 1.05, training: 1.03 },
                3: { speed: 1.08, income: 1.08, training: 1.05 },
                4: { speed: 1.12, income: 1.12, training: 1.08 },
                5: { speed: 1.15, income: 1.15, training: 1.1 },
                6: { speed: 1.2, income: 1.2, training: 1.15 },
                7: { speed: 1.25, income: 1.25, training: 1.2 },
            }[a] || { speed: 1, income: 1, training: 1 };
            let o = 1;
            if (n.skills?.management) {
                const e = n.skills.management;
                o = 1 + 0.02 * (("number" == typeof e ? e : e.level || 0) || 1);
            }
            (t.speedMultiplier *= Math.pow(e.speed, o)),
                (t.incomeMultiplier *= Math.pow(e.income, o)),
                (t.trainingMultiplier *= Math.pow(e.training, o)),
                t.managerChain.push({
                    name: n.name,
                    title: s.title,
                    level: a,
                    speedBonus: e.speed,
                    incomeBonus: e.income,
                    effectiveness: o,
                });
        }
        i = e;
    }
    return t;
}
function findPositionById(e) {
    if (!gameState.corporatePyramid?.positions) return null;
    if ("ceo" === e && gameState.corporatePyramid.ceoPosition) return gameState.corporatePyramid.ceoPosition;
    if ("secretary" === e && gameState.corporatePyramid.secretaryPosition)
        return gameState.corporatePyramid.secretaryPosition;
    for (let t = 1; t <= 7; t++) {
        const n = gameState.corporatePyramid.positions[t];
        if (Array.isArray(n)) {
            const t = n.find((t) => t.positionId === e);
            if (t) return t;
        }
    }
    return null;
}
function getManagerSpeedMultiplier(e) {
    if (!e.managerHired || 0 === e.managerLevel) return 1;
    let t = Math.pow(0.92, e.managerLevel);
    const n = gameState.influenceUpgrades?.autoProgress || 0;
    t /= influenceUpgrades.autoProgress.effect(n);
    const a = gameState.globalUpgrades?.timeDilation || 0;
    if (a > 0) {
        t *= 1 / (1 + 0.03 * a);
    }
    const o = gameState.employees.find((t) => t.productManaged === e.name && t.hired);
    o && o.loyaltyBonus && (t /= 1 + o.loyaltyBonus);
    if (((t /= getManagerialBonuses(e).speedMultiplier), o)) {
        t /= 0.85 + (0.15 * (o.stats?.productivity || 50)) / 100;
        const e = o.stats?.trust || 50;
        t /= e <= 70 ? 0.85 + (0.15 * e) / 70 : 1 + (0.15 * (e - 70)) / 30;
        t /= 0.92 + (o.stats?.obedience || 50) / 1250;
    }
    return t;
}
function currentCycleTimeMs(e) {
    let t = Math.floor(e.baseTimeMs * getManagerSpeedMultiplier(e));
    const n = gameState.employees.find((t) => t.productManaged === e.name && t.hired);
    if (n && e.managerHired && n.skills) {
        let a = 1;
        if (
            e.name &&
            (e.name.toLowerCase().includes("software") ||
                e.name.toLowerCase().includes("tech") ||
                e.name.toLowerCase().includes("app"))
        ) {
            a *= 1 - 0.05 * (n.skills.technical?.level || 0);
        }
        if (
            e.name &&
            (e.name.toLowerCase().includes("design") ||
                e.name.toLowerCase().includes("art") ||
                e.name.toLowerCase().includes("creative"))
        ) {
            a *= 1 - 0.05 * (n.skills.creative?.level || 0);
        }
        (a *= 1 - 0.02 * (n.skills.management?.level || 0)), (t = Math.floor(t * a));
    }
    const o = gameState.globalUpgrades?.nightShift?.[e.locationId] || 0;
    o > 0 && (t = Math.floor(t / (1 + 0.05 * o)));
    return Math.max(100, t);
}
function currentValue(e) {
    const t = e.level || 0,
        n = e.valuePerUnit || 3,
        a = 1 + (e.valuePerUpgrade || 0.1) * t,
        o = e.valueExponent ?? gameBalance.productIncomeExponent;
    let i = n * Math.pow(a, o) * gameBalance.globalIncomeMultiplier;
    const s = gameState.globalUpgrades?.incomeBoost?.[e.locationId] || 0;
    if (s > 0) {
        i *= 1 + (10 * s) / 100;
    }
    gameState.globalUpgrades?.flagship?.locationId === e.locationId && (i *= 1.25);
    const r = gameState.employees.find((t) => t.productManaged === e.name && t.hired);
    if (r && r.career && e.managerHired) {
        const e = r.career.level || 1,
            t = gameState.hierarchyLevels?.[e];
        if (t && t.productBonusPercent) {
            i *= 1 + t.productBonusPercent / 100;
        }
    }
    if (
        ((i *= getManagerialBonuses(e).incomeMultiplier),
        gameState.corporateHierarchy && gameState.corporateHierarchy.executiveRoles)
    ) {
        let e = 1;
        if (gameState.corporateHierarchy.executiveRoles.COO) {
            const t = gameState.employees.find((e) => e.id === gameState.corporateHierarchy.executiveRoles.COO);
            t && "active" === t.employmentStatus && (e *= 1.1);
        }
        if (gameState.corporateHierarchy.executiveRoles.CFO) {
            const t = gameState.employees.find((e) => e.id === gameState.corporateHierarchy.executiveRoles.CFO);
            t && "active" === t.employmentStatus && (e *= 1.1);
        }
        (i *= e), (gameState.globalIncomeMultiplier = e);
    }
    if (r && e.managerHired) {
        const t = r.stats?.productivity || 50;
        let n = 1;
        const a = gameState.globalUpgrades?.empireBuilder || 0;
        a > 0 && (n = 1 + 0.1 * a);
        n += 0.04 * (gameState.globalUpgrades?.workforce?.ergonomics || 0);
        let o = 0;
        r.skills &&
            (e.name &&
                (e.name.toLowerCase().includes("software") ||
                    e.name.toLowerCase().includes("tech") ||
                    e.name.toLowerCase().includes("app")) &&
                (o += getSkillBonus(r, "technical")),
            e.name &&
                (e.name.toLowerCase().includes("design") ||
                    e.name.toLowerCase().includes("art") ||
                    e.name.toLowerCase().includes("creative")) &&
                (o += getSkillBonus(r, "creative")),
            (o += 0.5 * getSkillBonus(r, "management")));
        i *= 0.7 + Math.min(150, (t + o) * n) / 187.5;
    }
    const l = gameState.influenceUpgrades?.incomeMultiplier || 0;
    if (l > 0) {
        i *= influenceUpgrades.incomeMultiplier.effect(l);
    }
    const c = gameState.globalUpgrades?.goldenTouch || 0;
    if (c > 0) {
        i *= Math.pow(1.05, c);
    }
    i *= gameState.story?.factionEffects?.incomeMult || 1;
    return +i.toFixed(2);
}
function clickReductionMs(e) {
    const t = e.clickSecondsBase || 1,
        n = 0.1 * (gameState.globalUpgrades?.clickPower || 0),
        a = gameState.influenceUpgrades?.clickPower || 0;
    return 1e3 * (t + n + influenceUpgrades.clickPower.effect(a));
}
const gameBalance = {
        globalIncomeMultiplier: 2.5,
        globalCostReduction: 0.7,
        productCostMultiplier: 1.22,
        productIncomeMultiplier: 1.2,
        productIncomeExponent: 0.95,
        startingCash: 150,
        firstProductUnlockCost: 80,
        baseClickReduction: 1,
        clickPowerGrowth: 1,
        managerCostReduction: 0.7,
        bossHealthMultiplier: 2,
        bossTimeLimit: 60,
        bossRewardMultiplier: 5,
        upgradeBaseCosts: {
            clickPower: 1e4,
            incomeBoost: {
                garage: 5e4,
                home_office: 15e4,
                office_suite: 5e6,
                factory: 25e7,
                rnd: 5e10,
                creative_studio: 5e12,
                private_club: 5e14,
                velvet_room: 5e16,
                inner_sanctum: 5e17,
            },
            costReduction: {
                garage: 1e5,
                home_office: 3e5,
                office_suite: 1e7,
                factory: 5e8,
                rnd: 1e11,
                creative_studio: 1e13,
                private_club: 1e15,
                velvet_room: 1e17,
                inner_sanctum: 1e18,
            },
        },
    },
    emojiPicker = {
        recentEmojis: [],
        maxRecent: 24,
        currentTarget: null,
        emojis: {
            smileys: [
                "😀",
                "😃",
                "😄",
                "😁",
                "😆",
                "😅",
                "🤣",
                "😂",
                "🙂",
                "🙃",
                "😉",
                "😊",
                "😇",
                "🥰",
                "😍",
                "🤩",
                "😘",
                "😗",
                "😚",
                "😙",
                "🥲",
                "😋",
                "😛",
                "😜",
                "🤪",
                "😝",
                "🤑",
                "🤗",
                "🤭",
                "🤫",
                "🤔",
                "🤐",
                "🤨",
                "😐",
                "😑",
                "😶",
                "😏",
                "😒",
                "🙄",
                "😬",
                "🤥",
                "😌",
                "😔",
                "😪",
                "🤤",
                "😴",
                "😷",
                "🤒",
                "🤕",
                "🤢",
                "🤮",
                "🤧",
                "🥵",
                "🥶",
                "🥴",
                "😵",
                "🤯",
                "🤠",
                "🥳",
                "🥸",
                "😎",
                "🤓",
                "🧐",
            ],
            gestures: [
                "👋",
                "🤚",
                "🖐",
                "✋",
                "🖖",
                "👌",
                "🤌",
                "🤏",
                "✌️",
                "🤞",
                "🤟",
                "🤘",
                "🤙",
                "👈",
                "👉",
                "👆",
                "🖕",
                "👇",
                "☝️",
                "👍",
                "👎",
                "✊",
                "👊",
                "🤛",
                "🤜",
                "👏",
                "🙌",
                "👐",
                "🤲",
                "🤝",
                "🙏",
                "💪",
                "🦾",
                "🦿",
                "🦵",
                "🦶",
                "👂",
                "🦻",
                "👃",
                "🧠",
                "🫀",
                "🫁",
                "🦷",
                "🦴",
                "👀",
                "👁",
                "👅",
                "👄",
                "💋",
            ],
            hearts: [
                "❤️",
                "🧡",
                "💛",
                "💚",
                "💙",
                "💜",
                "🖤",
                "🤍",
                "🤎",
                "💔",
                "❤️‍🔥",
                "❤️‍🩹",
                "💕",
                "💞",
                "💓",
                "💗",
                "💖",
                "💘",
                "💝",
                "💟",
                "💌",
                "💢",
                "💥",
                "💫",
                "💦",
                "💨",
                "🕳️",
                "💬",
                "👁️‍🗨️",
                "🗨️",
                "🗯️",
                "💭",
            ],
            objects: [
                "🎉",
                "🎊",
                "🎈",
                "🎁",
                "🎀",
                "🏆",
                "🥇",
                "🥈",
                "🥉",
                "⚽",
                "🏀",
                "🏈",
                "⚾",
                "🎾",
                "🏐",
                "🏉",
                "🎱",
                "🏓",
                "🏸",
                "🥅",
                "🥊",
                "🥋",
                "⛳",
                "⛸️",
                "🎣",
                "🎽",
                "🎿",
                "🛷",
                "🥌",
                "🎯",
                "🪀",
                "🪁",
                "🎱",
                "🎮",
                "🕹️",
                "🎰",
                "🎲",
                "🧩",
                "♟️",
                "🎭",
                "🎨",
                "🧵",
                "🪡",
                "🧶",
                "🪢",
                "📷",
                "📸",
                "📹",
                "🎥",
                "📽️",
                "🎬",
                "📺",
                "📻",
                "🎙️",
                "🎚️",
                "🎛️",
                "🎧",
                "🎷",
                "🪗",
                "🎸",
                "🎹",
                "🎺",
                "🎻",
                "🪕",
                "🥁",
                "🪘",
                "📱",
                "📲",
                "☎️",
                "📞",
                "📟",
                "📠",
                "🔋",
                "🔌",
                "💻",
                "🖥️",
                "🖨️",
                "⌨️",
                "🖱️",
                "🖲️",
                "💾",
                "💿",
                "📀",
                "🧮",
                "🎥",
            ],
            symbols: [
                "✨",
                "⭐",
                "🌟",
                "💫",
                "✅",
                "❌",
                "⭕",
                "🔥",
                "💯",
                "🎯",
                "💢",
                "💤",
                "💨",
                "🕳️",
                "✔️",
                "☑️",
                "✖️",
                "➕",
                "➖",
                "➗",
                "❓",
                "❔",
                "❕",
                "❗",
                "〰️",
                "💱",
                "💲",
                "⚠️",
                "🚸",
                "🔱",
                "📛",
                "🔰",
                "✳️",
                "❇️",
                "♻️",
                "💠",
                "🔷",
                "🔶",
                "🔹",
                "🔸",
                "🔺",
                "🔻",
                "💎",
                "🔘",
                "🔲",
                "🔳",
            ],
        },
        init() {
            const e = localStorage.getItem("recentEmojis");
            if (e)
                try {
                    this.recentEmojis = JSON.parse(e);
                } catch (e) {
                    this.recentEmojis = [];
                }
            document.querySelectorAll(".emoji-category-btn").forEach((e) => {
                e.addEventListener("click", (t) => {
                    t.stopPropagation(), this.switchCategory(e.dataset.category);
                });
            }),
                document.addEventListener("click", (e) => {
                    const t = document.getElementById("emojiPickerTray");
                    "block" !== t.style.display ||
                        t.contains(e.target) ||
                        e.target.classList.contains("emoji-picker-trigger") ||
                        this.hide();
                }),
                this.renderRecent();
        },
        show(e, t) {
            console.log("EmojiPicker.show() called", { targetInput: e, triggerButton: t }),
                (this.currentTarget = e);
            const n = document.getElementById("emojiPickerTray");
            console.log("Picker element:", n);
            const a = t.getBoundingClientRect();
            console.log("Button rect:", a);
            const o = window.innerHeight - a.bottom,
                i = a.top;
            o > 420 || o > i
                ? ((n.style.top = `${a.bottom + 5}px`), (n.style.bottom = "auto"))
                : ((n.style.bottom = window.innerHeight - a.top + 5 + "px"), (n.style.top = "auto"));
            let s = a.left;
            s + 320 > window.innerWidth && (s = window.innerWidth - 320 - 10),
                (n.style.left = `${Math.max(10, s)}px`),
                (n.style.display = "block"),
                console.log("Picker display set to block, styles:", {
                    display: n.style.display,
                    top: n.style.top,
                    left: n.style.left,
                    zIndex: n.style.zIndex,
                }),
                this.switchCategory("recent");
        },
        hide() {
            (document.getElementById("emojiPickerTray").style.display = "none"), (this.currentTarget = null);
        },
        switchCategory(e) {
            document.querySelectorAll(".emoji-category-btn").forEach((t) => {
                t.dataset.category === e
                    ? ((t.style.background = "var(--l-slate-2)"), (t.style.color = "var(--l-ink)"), t.classList.add("active"))
                    : ((t.style.background = "transparent"),
                      (t.style.color = "var(--l-ink-dim-2)"),
                      t.classList.remove("active"));
            }),
                "recent" === e ? this.renderRecent() : this.renderCategory(e);
        },
        renderRecent() {
            const e = document.getElementById("emojiPickerContent");
            0 !== this.recentEmojis.length
                ? ((e.innerHTML = this.recentEmojis
                      .map(
                          (e) =>
                              `<button class="emoji-btn" data-emoji="${e}" style="padding:4px; background:transparent; border:none; font-size:1.1rem; cursor:pointer; border-radius:4px; transition:all 0.15s; flex-shrink:0; width:32px; height:32px; display:flex; align-items:center; justify-content:center;" onmouseenter="this.style.background='var(--l-slate-2)'; this.style.transform='scale(1.15)'" onmouseleave="this.style.background='transparent'; this.style.transform='scale(1)'">${e}</button>`
                      )
                      .join("")),
                  this.attachEmojiClickHandlers())
                : (e.innerHTML =
                      '<div style="width:100%; text-align:center; padding:40px 20px; color:var(--text-mute);">No recent emojis yet<br><span style="font-size:2rem; margin-top:10px; display:block;">🕐</span></div>');
        },
        renderCategory(e) {
            const t = document.getElementById("emojiPickerContent"),
                n = this.emojis[e] || [];
            (t.innerHTML = n
                .map(
                    (e) =>
                        `<button class="emoji-btn" data-emoji="${e}" style="padding:4px; background:transparent; border:none; font-size:1.1rem; cursor:pointer; border-radius:4px; transition:all 0.15s; flex-shrink:0; width:32px; height:32px; display:flex; align-items:center; justify-content:center;" onmouseenter="this.style.background='var(--l-slate-2)'; this.style.transform='scale(1.15)'" onmouseleave="this.style.background='transparent'; this.style.transform='scale(1)'">${e}</button>`
                )
                .join("")),
                this.attachEmojiClickHandlers();
        },
        attachEmojiClickHandlers() {
            document.querySelectorAll(".emoji-btn").forEach((e) => {
                e.addEventListener("click", (t) => {
                    t.stopPropagation(), this.insertEmoji(e.dataset.emoji);
                });
            });
        },
        insertEmoji(e) {
            if (!this.currentTarget) return;
            const t = this.currentTarget,
                n = t.selectionStart || 0,
                a = t.selectionEnd || 0,
                o = t.value;
            t.value = o.substring(0, n) + e + o.substring(a);
            const i = n + e.length;
            t.setSelectionRange(i, i),
                t.focus(),
                (this.recentEmojis = this.recentEmojis.filter((t) => t !== e)),
                this.recentEmojis.unshift(e),
                this.recentEmojis.length > this.maxRecent &&
                    (this.recentEmojis = this.recentEmojis.slice(0, this.maxRecent)),
                localStorage.setItem("recentEmojis", JSON.stringify(this.recentEmojis));
        },
    },
    AIRequestQueue = {
        activeRequests: 0,
        requestQueue: [],
        maxConcurrent: 15,
        requestTimeoutMs: 12e4,
        init() {
            (this.maxConcurrent = gameState?.settings?.maxAiRequests || 15),
                console.log(`[AI Queue] Initialized with max ${this.maxConcurrent} concurrent requests`),
                this.updateUI();
        },
        updateMaxConcurrent(e) {
            (this.maxConcurrent = Math.max(1, Math.min(50, e))),
                gameState.settings && (gameState.settings.maxAiRequests = this.maxConcurrent),
                this.processQueue(),
                this.updateUI(),
                console.log(`[AI Queue] Updated max concurrent to ${this.maxConcurrent}`);
        },
        async enqueue(e, t = "AI Request") {
            return new Promise((n, a) => {
                const o = {
                    id: Date.now() + Math.random(),
                    function: e,
                    description: t,
                    resolve: n,
                    reject: a,
                    timestamp: Date.now(),
                };
                this.requestQueue.push(o),
                    console.log(`[AI Queue] Queued: ${t} (Queue: ${this.requestQueue.length})`),
                    this.updateUI(),
                    this.processQueue();
            });
        },
        async processQueue() {
            for (; this.activeRequests < this.maxConcurrent && this.requestQueue.length > 0; ) {
                const e = this.requestQueue.shift();
                this.activeRequests++,
                    this.updateUI(),
                    console.log(
                        `[AI Queue] Starting: ${e.description} (Active: ${this.activeRequests}, Queued: ${this.requestQueue.length})`
                    );
                let t = !1;
                try {
                    const n = await this.executeWithRetry(e);
                    e.resolve(n), (t = !0);
                } catch (t) {
                    console.error(`[AI Queue] Final error in ${e.description}:`, t);
                    const n = this.getFallbackResponse(e.description, t);
                    e.resolve(n);
                } finally {
                    this.activeRequests--,
                        t &&
                            void 0 !== gameState &&
                            (gameState.generationStats ||
                                (gameState.generationStats = { totalTextGenerations: 0, totalImageGenerations: 0 }),
                            gameState.generationStats.totalTextGenerations++),
                        this.updateUI(),
                        console.log(
                            `[AI Queue] Completed: ${e.description} (Active: ${this.activeRequests}, Queued: ${this.requestQueue.length})`
                        ),
                        this.processQueue();
                }
            }
        },
        async executeWithRetry(e, t = 2) {
            for (let n = 1; n <= t; n++)
                try {
                    return await Promise.race([
                        e.function(),
                        new Promise((_, rej) =>
                            setTimeout(
                                () => rej(new Error("AI request timeout")),
                                this.requestTimeoutMs
                            )
                        ),
                    ]);
                } catch (a) {
                    console.warn(`[AI Queue] Attempt ${n}/${t} failed for ${e.description}:`, a);
                    const o = /max.*request|too.*many.*request|request.*limit|rate.*limit|exceeded.*limit/i.test(
                        a?.message || ""
                    );
                    if (
                        (o &&
                            (this.logMaxRequestsFailure(e, a, n),
                            1 === n &&
                                (console.warn(
                                    "[AI Queue] 🚨 Max Requests detected on first attempt - extending wait time"
                                ),
                                await new Promise((e) => setTimeout(e, 5e3)))),
                        n === t)
                    )
                        throw (o && this.logMaxRequestsFailure(e, a, n, !0), a);
                    const i = o ? 2e3 * Math.pow(2, n) : 1e3 * Math.pow(2, n - 1);
                    console.log(`[AI Queue] Retrying ${e.description} in ${i}ms...`),
                        await new Promise((e) => setTimeout(e, i));
                }
        },
        logMaxRequestsFailure(e, t, n, a = !1) {
            const o = new Date().toISOString(),
                i = {
                    activeRequests: this.activeRequests,
                    queuedRequests: this.requestQueue.length,
                    maxConcurrent: this.maxConcurrent,
                    totalPending: this.activeRequests + this.requestQueue.length,
                    failedRequest: e.description,
                    attempt: n,
                    error: t.message || "Unknown error",
                    timestamp: o,
                };
            return (
                console.error("🚨 [AI QUEUE] MAX REQUESTS ERROR DETECTED:"),
                console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
                console.error(`📍 Request: ${e.description}`),
                console.error(`🔢 Queue State: ${this.activeRequests} active, ${this.requestQueue.length} queued`),
                console.error(`⚙️ Max Concurrent: ${this.maxConcurrent}`),
                console.error(`📊 Total Pending: ${i.totalPending}`),
                console.error(`🎯 Attempt: ${n}${a ? " (FINAL)" : ""}`),
                console.error(`⚠️ Error: ${t.message}`),
                console.error(`🕐 Time: ${o}`),
                console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
                window.aiQueueFailures || (window.aiQueueFailures = []),
                window.aiQueueFailures.push(i),
                window.aiQueueFailures.length > 20 && window.aiQueueFailures.shift(),
                a &&
                    "function" == typeof showNotification &&
                    showNotification(
                        `🚨 AI Rate Limit Hit!\nQueue: ${this.activeRequests} active, ${this.requestQueue.length} waiting\nConsider lowering max requests to ${Math.max(5, this.maxConcurrent - 5)}`,
                        "warning",
                        8e3
                    ),
                i
            );
        },
        getFallbackResponse(e, t) {
            const n = t?.message || "Unknown error";
            return (
                console.log(`[AI Queue] Using fallback for ${e}: ${n}`),
                e.toLowerCase().includes("chat") || e.toLowerCase().includes("response")
                    ? "I'm having some difficulty with my words right now. Could you try asking again?"
                    : e.toLowerCase().includes("gift")
                      ? {
                            name: "Thoughtful Note",
                            description:
                                "A handwritten note expressing appreciation. Sometimes the simplest gestures mean the most.",
                            price: 5,
                            type: "misc",
                        }
                      : e.toLowerCase().includes("family member")
                        ? JSON.stringify({
                              bio: "A family member who recently joined the company. They bring a unique perspective shaped by their family connections.",
                              personalityTraits: ["Friendly", "Adaptable", "Family-oriented"],
                              keyTrait: "Reliable",
                              hobbies: ["Reading", "Cooking"],
                              kinks: ["Roleplay", "Teasing"],
                              personality: {
                                  confidence: 50,
                                  outgoing: 50,
                                  flirty: 40,
                                  professional: 60,
                                  humor: 50,
                              },
                              physical: {
                                  hairColor: "brown",
                                  hairStyle: "natural",
                                  hairLength: "medium",
                                  hairTexture: "smooth",
                                  eyeColor: "brown",
                                  eyeShape: "almond",
                                  skinTone: "fair",
                                  bodyShape: "average",
                                  heightBuild: "average height",
                                  breastSize: "medium",
                                  buttSize: "average",
                                  fashion: "casual professional",
                                  accessories: "none",
                                  notableFeatures: "warm smile",
                              },
                          })
                        : e.toLowerCase().includes("profile") || e.toLowerCase().includes("manager")
                          ? "This person has a warm personality and brings positive energy to any workplace."
                          : e.toLowerCase().includes("meeting")
                            ? "The discussion was productive, though some technical details need to be worked out later."
                            : "I'm experiencing some technical difficulties. Please try again in a moment."
            );
        },
        updateUI() {
            const e = document.getElementById("aiQueueStatus"),
                t = document.getElementById("aiQueueCounts"),
                n = document.getElementById("aiTotalGenerated");
            e &&
                (0 === this.activeRequests && 0 === this.requestQueue.length
                    ? ((e.textContent = "Ready"), (e.style.color = "var(--l-green)"))
                    : this.requestQueue.length > 0
                      ? ((e.textContent = "Busy (Queued)"), (e.style.color = "var(--l-gold)"))
                      : ((e.textContent = "Processing"), (e.style.color = "var(--l-cyan)"))),
                t && (t.textContent = `${this.activeRequests}/${this.requestQueue.length}`),
                n &&
                    void 0 !== gameState &&
                    gameState.generationStats &&
                    (n.textContent = (gameState.generationStats.totalTextGenerations || 0).toLocaleString());
        },
        getStats() {
            return {
                active: this.activeRequests,
                queued: this.requestQueue.length,
                maxConcurrent: this.maxConcurrent,
                totalWaiting: this.activeRequests + this.requestQueue.length,
            };
        },
        analyzeFailures() {
            if (!window.aiQueueFailures || 0 === window.aiQueueFailures.length)
                return console.log("🔍 [AI Queue Analysis] No Max Requests failures recorded yet."), null;
            const e = window.aiQueueFailures,
                t = {
                    totalFailures: e.length,
                    avgActiveAtFailure: e.reduce((e, t) => e + t.activeRequests, 0) / e.length,
                    avgQueuedAtFailure: e.reduce((e, t) => e + t.queuedRequests, 0) / e.length,
                    avgMaxConcurrentAtFailure: e.reduce((e, t) => e + t.maxConcurrent, 0) / e.length,
                    maxActiveAtFailure: Math.max(...e.map((e) => e.activeRequests)),
                    recentFailures: e.slice(-5),
                },
                n = Math.floor(0.8 * t.avgActiveAtFailure),
                a = Math.max(5, Math.min(25, n));
            return (
                console.log("🔍 [AI QUEUE FAILURE ANALYSIS]"),
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
                console.log(`📊 Total Max Requests failures: ${t.totalFailures}`),
                console.log(`📈 Average active requests at failure: ${t.avgActiveAtFailure.toFixed(1)}`),
                console.log(`📋 Average queued requests at failure: ${t.avgQueuedAtFailure.toFixed(1)}`),
                console.log(`⚙️ Average max concurrent setting: ${t.avgMaxConcurrentAtFailure.toFixed(1)}`),
                console.log(`🎯 Highest active count at failure: ${t.maxActiveAtFailure}`),
                console.log(`💡 RECOMMENDED max concurrent: ${a} (current: ${this.maxConcurrent})`),
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
                t.recentFailures.length > 0 &&
                    (console.log("🕐 Recent failures:"),
                    t.recentFailures.forEach((e, t) => {
                        console.log(
                            `  ${t + 1}. ${e.activeRequests} active, ${e.queuedRequests} queued (max: ${e.maxConcurrent}) - ${e.failedRequest}`
                        );
                    })),
                a < this.maxConcurrent &&
                    (console.log(`\n🎛️ Consider lowering max concurrent to ${a} for better stability.`),
                    console.log(`   Use: AIRequestQueue.updateMaxConcurrent(${a})`)),
                t
            );
        },
        clearFailureData() {
            if (window.aiQueueFailures) {
                const e = window.aiQueueFailures.length;
                (window.aiQueueFailures = []), console.log(`🗑️ [AI Queue] Cleared ${e} failure records.`);
            }
        },
        savePersistentRequest(e) {
            gameState.pendingAIRequests || (gameState.pendingAIRequests = { text: [], image: [] });
            const t = {
                id: e.id || Date.now() + Math.random(),
                type: e.type || "generic",
                prompt: e.prompt,
                options: e.options || {},
                description: e.description || "Text Generation",
                callback: e.callback,
                callbackData: e.callbackData,
                timestamp: Date.now(),
            };
            return (
                gameState.pendingAIRequests.text.push(t),
                console.log(
                    `[AI Queue] 💾 Saved persistent request: ${t.description} (${gameState.pendingAIRequests.text.length} pending)`
                ),
                "function" == typeof debouncedSave && debouncedSave(),
                t.id
            );
        },
        completePersistentRequest(e) {
            if (!gameState.pendingAIRequests?.text) return;
            const t = gameState.pendingAIRequests.text.findIndex((t) => t.id === e);
            if (-1 !== t) {
                const e = gameState.pendingAIRequests.text.splice(t, 1)[0];
                console.log(
                    `[AI Queue] ✅ Completed persistent request: ${e.description} (${gameState.pendingAIRequests.text.length} remaining)`
                ),
                    "function" == typeof debouncedSave && debouncedSave();
            }
        },
        // Requests saved here by an earlier session are not run again. Nothing was waiting on them: the
        // callers (a chat reply, a scene image) were gone with the old page, and the re-run result was
        // thrown away. Re-running only spent generations (and timed out, retried and re-saved in a
        // pile when a save held a dozen stale image requests). So they're just cleared.
        async restorePendingRequests() {
            const n = gameState.pendingAIRequests?.text?.length || 0;
            n > 0 && ((gameState.pendingAIRequests.text = []), console.log(`[AI Queue] Dropped ${n} request(s) left over from the last session`));
        },
        async enqueuePersistent(e) {
            const t = this.savePersistentRequest(e);
            try {
                const n = await this.enqueue(() => (window.unqueuedGenerateText || generateText)(e.prompt, e.options || {}, e.description), e.description);
                if ((this.completePersistentRequest(t), e.callback && "function" == typeof window[e.callback]))
                    try {
                        await window[e.callback](n, e.callbackData);
                    } catch (t) {
                        console.error(`[AI Queue] Callback error for ${e.description}:`, t);
                    }
                return n;
            } catch (t) {
                throw (console.error(`[AI Queue] Persistent request failed: ${e.description}`, t), t);
            }
        },
        getPendingCount: () => gameState.pendingAIRequests?.text?.length || 0,
    };
