// ============================================================================
// 25-init — Boot DOM refs (settingsBtn/chatName), initGame, getPlayerDescription, ModalManager export.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

const settingsBtn = $("settingsBtn"),
    fullscreenBtn = $("fullscreenBtn"),
    closeSettingsBtn = $("closeSettingsBtn"),
    autosaveToggle = $("autosaveToggle"),
    atmosphereSlider = $("atmosphereSlider"),
    atmosphereValue = $("atmosphereValue"),
    guidelinesSlider = $("guidelinesSlider"),
    guidelinesValue = $("guidelinesValue"),
    saveBtn = $("saveBtn"),
    loadBtn = $("loadBtn"),
    exportBtn = $("exportBtn"),
    resetBtn = $("resetBtn"),
    cashEl = $("cashEl"),
    cashPerSecEl = $("cashPerSecEl"),
    employeeCountEl = $("employeeCountEl"),
    productCountEl = $("productCountEl"),
    revenueEl = $("revenueEl"),
    employeeCountDashboardEl = $("employeeCountDashboardEl"),
    productCountDashboardEl = $("productCountDashboardEl"),
    efficiencyEl = $("efficiencyEl"),
    productsList = $("productsList"),
    employeesList = $("employeesList"),
    giftsList = $("giftsList"),
    newsFeed = $("newsFeed"),
    newsContent = $("newsContent"),
    settingsPanel = $("settingsPanel"),
    chatModal = $("chatModal");
if (settingsPanel && !document.getElementById("debugAddMoneyBtn")) {
    const e = document.createElement("button");
    (e.id = "debugAddMoneyBtn"),
        (e.textContent = "Add $100,000 (Debug)"),
        (e.style.cssText =
            "margin:10px 0; padding:10px; background:var(--l-red); color:var(--l-ink-on-fill); border:none; border-radius:6px; font-size:1rem; cursor:pointer; width:100%"),
        (e.onclick = function () {
            (gameState.cash += 1e5), showNotification("Added $100,000 (Debug)"), updateUI();
        }),
        settingsPanel.appendChild(e);
    const t = document.createElement("button");
    (t.id = "debugTestFlagBtn"),
        (t.textContent = "🏷️ Test Flag Detection (Debug)"),
        (t.style.cssText =
            "margin:10px 0; padding:10px; background:var(--l-indigo); color:var(--l-ink-on-fill); border:none; border-radius:6px; font-size:1rem; cursor:pointer; width:100%"),
        (t.onclick = function () {
            if (gameState.activeChat && gameState.activeChat.id) {
                const e = gameState.employees.find((e) => e.id === gameState.activeChat.id);
                e
                    ? (console.log("[DEBUG] Testing flag detection for", e.name),
                      console.log("[DEBUG] Tracking data:", gameState.flagDetection.tracking[e.id]),
                      console.log(
                          "[DEBUG] Suggestions:",
                          gameState.flagDetection.suggestions.filter((t) => t.employeeId === e.id)
                      ),
                      checkFlagSuggestions(e),
                      showNotification("Flag detection test complete. Check console for details.", "info"))
                    : showNotification("Open a chat first!", "error");
            } else showNotification("Open a chat first to test flag detection!", "error");
        }),
        settingsPanel.appendChild(t);
}
const chatName = $("chatName"),
    chatAvatar = $("chatAvatar"),
    chatMessages = $("chatMessages"),
    chatTypingIndicator = $("chatTypingIndicator"),
    chatTypingName = $("chatTypingName"),
    chatInput = $("chatInput"),
    chatSendBtn = $("chatSendBtn"),
    closeChatBtn = $("closeChatBtn"),
    topBar = $("topBar"),
    ModalManager = {
        activeModals: [],
        baseZIndex: 1e4,
        show(e, t) {
            this.close(t);
            const n = this.baseZIndex + 10 * this.activeModals.length;
            return (
                (e.style.position = "fixed"),
                (e.style.top = "0"),
                (e.style.left = "0"),
                (e.style.width = "100%"),
                (e.style.height = "100%"),
                (e.style.display = "flex"),
                (e.style.justifyContent = "center"),
                (e.style.alignItems = "center"),
                (e.style.zIndex = n),
                (e.style.pointerEvents = "auto"),
                e.parentElement || document.body.appendChild(e),
                this.activeModals.push({ id: t, element: e, zIndex: n }),
                console.log(`Modal opened: ${t} (z-index: ${n})`),
                e
            );
        },
        close(e) {
            const t = this.activeModals.findIndex((t) => t.id === e);
            if (-1 !== t) {
                const n = this.activeModals[t];
                n.element.parentElement && n.element.remove(),
                    this.activeModals.splice(t, 1),
                    console.log(`Modal closed: ${e}`);
            }
        },
        closeAll() {
            for (; this.activeModals.length > 0; ) {
                const e = this.activeModals[0];
                this.close(e.id);
            }
        },
        isOpen(e) {
            return this.activeModals.some((t) => t.id === e);
        },
        getActiveModal() {
            return this.activeModals.length > 0 ? this.activeModals[this.activeModals.length - 1] : null;
        },
    };
async function initGame() {
    try {
        bootLog("Boot start — initGame()");
        // Repair: a stray unclosed <div> in the static #genderOptionsModal markup leaves
        // it without a closing tag, so the browser nests every following modal (groups,
        // cheats, corporate ladder, emoji tray) inside it. Those children inherit its
        // display:none and can never appear. Reparent them to <body> where they belong.
        try {
            const trap = document.getElementById("genderOptionsModal");
            trap &&
                trap.querySelectorAll(":scope > [id]").forEach((el) => {
                    /(?:Modal|Tray)$/.test(el.id) && document.body.appendChild(el);
                });
        } catch (e) {
            console.warn("[Repair] trapped-modal reparent failed:", e);
        }
        if (!topBar) return console.error("DOM elements not loaded yet"), void setTimeout(initGame, 100);
        if (
            ("undefined" == typeof generateText &&
                (console.warn("AI text plugin not loaded - chat features will be limited"),
                (window.generateText = async (e) => "I'm having trouble responding right now.")),
            AIRequestQueue.init(),
            console.log("[AI Queue] Initialized with max concurrent requests:", AIRequestQueue.maxConcurrent),
            ImageRequestQueue.init(),
            console.log("[Image Queue] Initialized with max concurrent requests:", ImageRequestQueue.maxConcurrent),
            "function" == typeof generateText &&
                ((window.originalGenerateText = generateText),
                // Prefer the explicit call-site description (passed through from
                // queuedGenerateText) — it's accurate and distinct per call. The old
                // content-sniffing heuristic mislabeled nearly everything "Social Post"
                // because almost every prompt contains the word "post" or "social".
                (window.describeTextRequest = (e, desc) => {
                    let n = desc || "Text Generation";
                    return (
                        !desc &&
                            "string" == typeof e &&
                            (e.includes("post") || e.includes("social")
                                ? (n = "Social Post")
                                : e.includes("chat") || e.includes("message") || e.includes("reply")
                                  ? (n = "Chat Message")
                                  : e.includes("profile") || e.includes("bio")
                                    ? (n = "Profile Generation")
                                    : e.includes("reaction") || e.includes("respond")
                                      ? (n = "NPC Reaction")
                                      : e.includes("meeting") || e.includes("group")
                                        ? (n = "Meeting Content")
                                        : (e.includes("image") || e.includes("photo")) && (n = "Image Analysis")),
                        n
                    );
                }),
                // The raw call, with no queueing: queuedGenerateText already runs inside the
                // queue and calls this. It used to call the queued generateText below, so every
                // request sat in the queue twice — and once as many were in flight as the limit
                // allowed, the outer ones held every slot while the inner ones waited for one.
                (window.unqueuedGenerateText = async (e, t, desc) => {
                    console.log(
                        `[Prompt] 📝 TEXT · ${describeTextRequest(e, desc)} (${String(e).length} chars):\n${String(e)}`
                    );
                    return await window.originalGenerateText(e, t);
                }),
                // Everything else that calls generateText directly is queued here.
                (window.generateText = async (e, t, desc) =>
                    await AIRequestQueue.enqueue(() => window.unqueuedGenerateText(e, t, desc), describeTextRequest(e, desc))),
                console.log("[AI Queue] Wrapped generateText with queue system")),
            gameState.onboarding || (gameState.onboarding = []),
            Array.isArray(gameState.employees) || (gameState.employees = []),
            await loadGame(),
            (() => {
                try {
                    const _canonEntity = (emp) => {
                        if (!emp) return;
                        if (emp.race) {
                            const rr = String(emp.race).toLowerCase().trim();
                            if (RACES[rr] || RACE_REMAP[rr]) emp.race = canonicalRace(rr);
                        }
                        if (emp.physical && "object" == typeof emp.physical) {
                            if (!emp.physical.race && emp.race) emp.physical.race = emp.race;
                            migratePhysicalSchema(emp.physical);
                        }
                    };
                    [gameState.employees, gameState.onboardingQueue, gameState.onboarding]
                        .filter(Array.isArray)
                        .forEach((arr) => arr.forEach(_canonEntity));
                    gameState.playerProfile && _canonEntity(gameState.playerProfile);
                } catch (e) {
                    console.warn("[Migration] physical schema migration failed", e);
                }
            })(),
            "function" == typeof reconcileGroupParticipants)
        ) {
            const e = reconcileGroupParticipants();
            e > 0 && console.log(`[Groups] Removed ${e} stale participant reference(s) on load`);
        }
        setTimeout(async () => {
            try {
                const e = gameState.pendingAIRequests?.text?.length || 0,
                    t = gameState.pendingAIRequests?.image?.length || 0;
                (e > 0 || t > 0) &&
                    (console.log(`[AI Queue Restore] Found ${e} text and ${t} image pending requests`),
                    e > 0 && void 0 !== AIRequestQueue && (await AIRequestQueue.restorePendingRequests()),
                    t > 0 && void 0 !== ImageRequestQueue && (await ImageRequestQueue.restorePendingRequests()));
            } catch (e) {
                console.error("[AI Queue Restore] Error restoring pending requests:", e);
            }
        }, 2e3),
            initializeHierarchicalPyramid(),
            gameState.products.forEach((e) => {
                e._costReductionApplied ||
                    ((e.baseUpgradeCost = Math.floor(e.baseUpgradeCost * gameBalance.globalCostReduction)),
                    (e.upgradeCost = Math.floor(e.upgradeCost * gameBalance.globalCostReduction)),
                    (e.managerHireCost = Math.floor(e.managerHireCost * gameBalance.managerCostReduction)),
                    (e.managerUpgradeCost = Math.floor(e.managerUpgradeCost * gameBalance.managerCostReduction)),
                    (e._costReductionApplied = !0));
            });
        const e = gameState.locations.find((e) => e.id === gameState.activeLocationId);
        if (
            (e && applyLocationTheme(e),
            setupEventListeners(),
            console.log("Initial updateUI() - gameState.cash:", gameState.cash),
            updateUI(),
            updateTabContent(gameState.activeTab),
            setTimeout(() => {
                console.log("Delayed updateUI() - gameState.cash:", gameState.cash),
                    updateUI(),
                    updateTabContent(gameState.activeTab);
            }, 100),
            reconcileSnapshotManifest(),
            setupAutosave(),
            startRelationshipBatching(),
            console.log("[AI Optimization] Systems initialized"),
            "function" == typeof initializeBossImages &&
                (initializeBossImages(), console.log("[Boss System] Boss images initialization queued")),
            "function" == typeof generateUniqueBoss)
        ) {
            const e = "home_office";
            gameState.bossFights?.generatedBosses?.[e] ||
                generateUniqueBoss(e)
                    .then((t) => {
                        t && console.log(`[Boss System] Pre-generated boss for ${e}:`, t.character?.firstName);
                    })
                    .catch((e) => console.warn("[Boss System] Failed to pre-generate boss:", e));
        }
        if (void 0 !== StoryEngine && StoryEngine.initialize)
            try {
                StoryEngine.initialize(),
                    console.log("[Story System] Initialized - Current Act:", gameState.story?.currentAct || 1),
                    setTimeout(() => {
                        StoryEngine.updateStoryUI && StoryEngine.updateStoryUI();
                    }, 500);
            } catch (e) {
                console.warn("[Story System] Initialization error:", e);
            }
    } catch (e) {
        console.error("Error initializing game:", e),
            showNotification("Failed to initialize game. Please refresh the page.");
    }
    if (!window.__productsDelegationBound__) {
        const e = document.getElementById("productsList");
        e &&
            (e.addEventListener("click", (e) => {
                const t = e.target.closest("button");
                if (!t) return;
                const n = t.dataset.id;
                if (n) {
                    if (t.classList.contains("sell-btn")) {
                        startOrClickProduct(n);
                        const e = gameState.products.find((e) => e.id === n),
                            t = document.getElementById(`selltxt-${n}`);
                        return void (t && (t.textContent = e?.running ? "Click: -1s" : "Sell"));
                    }
                    if (t.classList.contains("upgrade-product-btn")) return upgradeProduct(n);
                    if (t.classList.contains("manager-btn")) return hireOrUpgradeManager(n);
                    if (t.classList.contains("unlock-product-btn")) {
                        if (t.disabled) return;
                        return unlockProduct(n);
                    }
                }
            }),
            (window.__productsDelegationBound__ = !0));
    }
    // Diagnostics for "the game freezes / my phone gets hot" reports: note, at most every 3 s,
    // when something blocks the main thread for a quarter second or more. It shows in the
    // Settings → Logging console mirror, so a phone can report it without dev tools.
    try {
        if (window.PerformanceObserver && !window.__longTaskObserver) {
            let lastNote = 0;
            (window.__longTaskObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((t) => {
                    const now = Date.now();
                    t.duration >= 250 &&
                        !document.hidden &&
                        now - lastNote > 3e3 &&
                        ((lastNote = now), console.warn(`[Perf] ⏱ Main thread blocked for ${Math.round(t.duration)} ms`));
                });
            })).observe({ entryTypes: ["longtask"] });
        }
    } catch (e) {}
    window.__gameIntervalIds__ && window.__gameIntervalIds__.forEach((e) => clearInterval(e)),
        (window.__gameIntervalIds__ = []),
        window.__gameIntervalIds__.push(setInterval(gameTick, 100)),
        window.__gameIntervalIds__.push(setInterval(updateNews, 3e4)),
        window.__gameIntervalIds__.push(setInterval(checkForProactiveMessages, 12e4)),
        window.__gameIntervalIds__.push(setInterval(simulateOfficeEvents, 9e5)),
        window.__gameIntervalIds__.push(setInterval(cleanupExpiredGossip, 36e5)),
        updateTimeDisplay(),
        window.__gameIntervalIds__.push(setInterval(updateTimeDisplay, 200)),
        window.__gameIntervalIds__.push(
            setInterval(() => {
                AIRequestQueue && AIRequestQueue.updateUI();
            }, 2e3)
        ),
        setTimeout(() => {
            if (
                (initializeDynamicEventSystem(),
                updateEventBellNotification(),
                console.log("[Dynamic Events] System initialized"),
                gameState.settings?.disableStoryEvents)
            ) {
                const e = document.querySelector('.tab-btn[data-tab="story"]');
                e && (e.style.display = "none");
                const t = document.getElementById("eventBellBtn");
                t && (t.style.display = "none"),
                    console.log("[Settings] Story Mode & Events disabled - UI elements hidden");
            }
        }, 2e3);
}
function getPlayerDescription(e = "conversation", t = null) {
    const n = gameState.playerProfile,
        a = n.physical || {},
        o = a.hair || {},
        i = a.eyes || {},
        s = a.face || {},
        r = a.skin || {},
        l = a.body || {},
        c = (Array.isArray(a.genitals) ? a.genitals[0] : a.genitals) || {},
        d = t?.nicknameForPlayer?.trim(),
        p = n.firstName || n.lastName,
        m = [n.firstName, n.lastName].filter(Boolean).join(" ") || "the boss",
        u = n.firstName && n.lastName ? `${n.firstName} ${n.lastName}` : m,
        g = [];
    n.age && g.push(`${n.age} year old`),
        n.gender && g.push(n.gender),
        n.race && "human" !== n.race && g.push(n.race),
        "human" === n.race &&
            n.ethnicity &&
            g.push(`${"function" == typeof formatEthnicity ? formatEthnicity(n.ethnicity) : n.ethnicity}`);
    const h = [];
    a.heightBuild ? h.push(a.heightBuild) : n.height && h.push(n.height),
        (l.shape || n.bodyType) && h.push(`${l.shape || n.bodyType} build`);
    const y = [],
        f = r.tone || n.skinTone,
        b = r.texture;
    f && y.push(`${f} skin`), b && y.push(b);
    const v = [],
        w = o.color || n.hairColor,
        x = o.style || n.hairStyle,
        S = o.length,
        k = o.texture,
        T = [];
    S && T.push(S), w && T.push(w), x && T.push(x), k && T.push(k), T.length > 0 && v.push(`${T.join(" ")} hair`);
    const C = [],
        E = i.color || n.eyeColor,
        $ = i.shape;
    E && $ ? C.push(`${E} ${$} eyes`) : E && C.push(`${E} eyes`),
        s.shape && C.push(`${s.shape} face`),
        s.lips && C.push(`${s.lips} lips`),
        s.jawline && C.push(`${s.jawline} jawline`);
    const I = s.facialHair || n.facialHair;
    I && C.push(I);
    const M = [];
    (l.chestSize || n.chestSize) && M.push(l.chestSize || n.chestSize),
        l.buttSize && M.push(`${l.buttSize} butt`),
        l.legs && M.push(`${l.legs} legs`),
        n.buildDetails && M.push(n.buildDetails);
    const P = [];
    a.fashion && P.push(`wears ${a.fashion}`),
        a.accessories && P.push(a.accessories),
        a.distinguishingFeature && P.push(a.distinguishingFeature);
    const A = [],
        N = c.type || n.genitalType,
        L = c.size || n.genitalDetails,
        _ = c.characteristics;
    if (N) {
        let e = [N];
        L && e.push(`(${L})`), _ && e.push(`- ${_}`), A.push(e.join(" "));
    }
    const R = [];
    n.personalityTraits && n.personalityTraits.length > 0
        ? R.push(`Personality: ${n.personalityTraits.join(", ")}`)
        : n.personality && R.push(`Personality: ${formatPersonality(n.personality)}`),
        n.hobbies && n.hobbies.length > 0 && R.push(`Hobbies: ${n.hobbies.join(", ")}`),
        n.likes && n.likes.length > 0 && R.push(`Likes: ${n.likes.join(", ")}`),
        n.dislikes && n.dislikes.length > 0 && R.push(`Dislikes: ${n.dislikes.join(", ")}`),
        n.kinks &&
            n.kinks.length > 0 &&
            ("explicit" === e || "intimate" === e) &&
            R.push(`Kinks: ${n.kinks.join(", ")}`);
    let D = [];
    if ("image" === e)
        return (
            (D = [...g, ...h, ...y, ...v, ...C, ...M, ...P]),
            n.additionalDetails && D.push(n.additionalDetails),
            D.filter(Boolean).join(", ") || "person"
        );
    if ("explicit" === e)
        return (
            (D = [...g, ...h, ...y, ...v, ...C, ...M, ...A, ...P]),
            n.additionalDetails && D.push(n.additionalDetails),
            D.filter(Boolean).join(", ") || "person"
        );
    if ("post" === e) {
        D = [...g, ...h, ...v];
        const e = D.length > 0 ? `The boss (${u}): ${D.join(", ")}` : `The boss (${u})`;
        return d
            ? `${e}. NOTE: This employee calls the boss "${d}" - use this nickname naturally in posts about the boss, not "Boss" or other names.`
            : e;
    }
    (D = [...g, ...h, ...y, ...v, ...C]),
        P.length > 0 && D.push(...P),
        n.additionalDetails && D.push(n.additionalDetails);
    const F = [D.filter(Boolean).join(", "), R.filter(Boolean).join(". ")].filter(Boolean).join(". ");
    return "conversation" === e
        ? d
            ? F
                ? `⚠️ THE PLAYER is your boss. You have a special nickname for them: "${d}". Use this nickname OCCASIONALLY (about 1 in 4-5 messages) to feel natural and affectionate - NOT every single message. Most of the time just address them directly with "you" or skip using any name at all. The nickname is for special moments, flirting, or emphasis - not constant repetition. Their description: ${F}.`
                : `⚠️ THE PLAYER is your boss. You have a special nickname for them: "${d}". Use this nickname OCCASIONALLY (about 1 in 5-8+ messages) to feel natural and affectionate - NOT every single message. Most of the time just address them directly with "you" or skip using any name at all. The nickname is for special moments, flirting, or emphasis - not constant repetition.`
            : p
              ? F
                  ? `⚠️ THE PLAYER (your boss) is named ${u}. Do NOT call them by any other name. Their description: ${F}.`
                  : `⚠️ THE PLAYER is your boss and their name is ${u}. Do NOT call them by any other name.`
              : F
                ? `THE PLAYER (your boss) - refer to them as "boss" or "you": ${F}.`
                : 'THE PLAYER is your boss. You do NOT know their personal name - refer to them as "boss" or use "you" directly.'
        : F || m;
}
function getPlayerName() {
    const e = gameState.playerProfile;
    return e.firstName && e.lastName ? `${e.firstName} ${e.lastName}` : e.firstName ? e.firstName : "the boss";
}
window.ModalManager = ModalManager;
