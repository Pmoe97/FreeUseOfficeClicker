// ============================================================================
// 25-init — Boot DOM refs (settingsBtn/chatName), initGame, getPlayerDescription, ModalManager export.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

const settingsBtn = $("settingsBtn"), fullscreenBtn = $("fullscreenBtn"), closeSettingsBtn = $("closeSettingsBtn"), autosaveToggle = $("autosaveToggle"), atmosphereSlider = $("atmosphereSlider"), atmosphereValue = $("atmosphereValue"), guidelinesSlider = $("guidelinesSlider"), guidelinesValue = $("guidelinesValue"), saveBtn = $("saveBtn"), loadBtn = $("loadBtn"), exportBtn = $("exportBtn"), resetBtn = $("resetBtn"), cashEl = $("cashEl"), cashPerSecEl = $("cashPerSecEl"), employeeCountEl = $("employeeCountEl"), productCountEl = $("productCountEl"), revenueEl = $("revenueEl"), employeeCountDashboardEl = $("employeeCountDashboardEl"), productCountDashboardEl = $("productCountDashboardEl"), efficiencyEl = $("efficiencyEl"), productsList = $("productsList"), employeesList = $("employeesList"), giftsList = $("giftsList"), newsFeed = $("newsFeed"), newsContent = $("newsContent"), settingsPanel = $("settingsPanel"), chatModal = $("chatModal");
if (settingsPanel && !document.getElementById("debugAddMoneyBtn")) {
  const e = document.createElement("button");
  e.id = "debugAddMoneyBtn", e.textContent = "Add $100,000 (Debug)", e.style.cssText = "margin:10px 0; padding:10px; background:var(--l); color:var(--s); border:none; border-radius:6px; font-size:1rem; cursor:pointer; width:100%", e.onclick = function() {
    gameState.cash += 1e5, showNotification("Added $100,000 (Debug)"), updateUI();
  }, settingsPanel.appendChild(e);
  const t = document.createElement("button");
  t.id = "debugTestFlagBtn", t.textContent = "\u{1F3F7}\uFE0F Test Flag Detection (Debug)", t.style.cssText = "margin:10px 0; padding:10px; background:var(--j); color:var(--s); border:none; border-radius:6px; font-size:1rem; cursor:pointer; width:100%", t.onclick = function() {
    if (gameState.activeChat && gameState.activeChat.id) {
      const e2 = gameState.employees.find((e3) => e3.id === gameState.activeChat.id);
      e2 ? (console.log("[DEBUG] Testing flag detection for", e2.name), console.log("[DEBUG] Tracking data:", gameState.flagDetection.tracking[e2.id]), console.log("[DEBUG] Suggestions:", gameState.flagDetection.suggestions.filter((t2) => t2.employeeId === e2.id)), Aa(e2), showNotification("Flag detection test complete. Check console for details.", "info")) : showNotification("Open a chat first!", "error");
    } else showNotification("Open a chat first to test flag detection!", "error");
  }, settingsPanel.appendChild(t);
}
const chatName = $("chatName"), chatAvatar = $("chatAvatar"), chatMessages = $("chatMessages"), chatTypingIndicator = $("chatTypingIndicator"), chatTypingName = $("chatTypingName"), chatInput = $("chatInput"), chatSendBtn = $("chatSendBtn"), closeChatBtn = $("closeChatBtn"), topBar = $("topBar"), ModalManager = { activeModals: [], baseZIndex: 1e4, show(e, t) {
  this.close(t);
  const n = this.baseZIndex + 10 * this.activeModals.length;
  return e.style.position = "fixed", e.style.top = "0", e.style.left = "0", e.style.width = "100%", e.style.height = "100%", e.style.display = "flex", e.style.justifyContent = "center", e.style.alignItems = "center", e.style.zIndex = n, e.style.pointerEvents = "auto", e.parentElement || document.body.appendChild(e), this.activeModals.push({ id: t, element: e, zIndex: n }), console.log(`Modal opened: ${t} (z-index: ${n})`), e;
}, close(e) {
  const t = this.activeModals.findIndex((t2) => t2.id === e);
  if (-1 !== t) {
    const n = this.activeModals[t];
    n.element.parentElement && n.element.remove(), this.activeModals.splice(t, 1), console.log(`Modal closed: ${e}`);
  }
}, closeAll() {
  for (; this.activeModals.length > 0; ) {
    const e = this.activeModals[0];
    this.close(e.id);
  }
}, isOpen(e) {
  return this.activeModals.some((t) => t.id === e);
}, getActiveModal() {
  return this.activeModals.length > 0 ? this.activeModals[this.activeModals.length - 1] : null;
} };
async function initGame() {
  try {
    Fv("Boot start \u2014 initGame()");
    try {
      const trap = document.getElementById("genderOptionsModal");
      trap && trap.querySelectorAll(":scope > [id]").forEach((u2) => {
        /(?:Modal|Tray)$/.test(u2.id) && document.body.appendChild(u2);
      });
    } catch (u2) {
      console.warn("[Repair] trapped-modal reparent failed:", u2);
    }
    if (!topBar) return console.error("DOM elements not loaded yet"), void setTimeout(initGame, 100);
    if ("undefined" == typeof generateText && (console.warn("AI text plugin not loaded - chat features will be limited"), window.generateText = async (e2) => "I'm having trouble responding right now."), AIRequestQueue.init(), console.log("[AI Queue] Initialized with max concurrent requests:", AIRequestQueue.maxConcurrent), ImageRequestQueue.init(), console.log("[Image Queue] Initialized with max concurrent requests:", ImageRequestQueue.maxConcurrent), "function" == typeof generateText && (window.originalGenerateText = generateText, window.generateText = async (e2, t, desc) => {
      let n = desc || "Text Generation";
      return !desc && "string" == typeof e2 && (e2.includes("post") || e2.includes("social") ? n = "Social Post" : e2.includes("chat") || e2.includes("message") || e2.includes("reply") ? n = "Chat Message" : e2.includes("profile") || e2.includes("bio") ? n = "Profile Generation" : e2.includes("reaction") || e2.includes("respond") ? n = "NPC Reaction" : e2.includes("meeting") || e2.includes("group") ? n = "Meeting Content" : (e2.includes("image") || e2.includes("photo")) && (n = "Image Analysis")), console.log(`[Prompt] \u{1F4DD} TEXT \xB7 ${n} (${String(e2).length} chars):
${String(e2)}`), await AIRequestQueue.enqueue(() => window.originalGenerateText(e2, t), n);
    }, console.log("[AI Queue] Wrapped generateText with queue system")), gameState.onboarding || (gameState.onboarding = []), Array.isArray(gameState.employees) || (gameState.employees = []), await loadGame(), (() => {
      try {
        const u2 = (emp2) => {
          if (emp2) {
            if (emp2.race) {
              const u3 = String(emp2.race).toLowerCase().trim();
              (RACES[u3] || Cl[u3]) && (emp2.race = Il(u3));
            }
            emp2.physical && "object" == typeof emp2.physical && (!emp2.physical.race && emp2.race && (emp2.physical.race = emp2.race), lr(emp2.physical));
          }
        };
        [gameState.employees, gameState.onboardingQueue, gameState.onboarding].filter(Array.isArray).forEach((G2) => G2.forEach(u2)), gameState.playerProfile && u2(gameState.playerProfile);
      } catch (u2) {
        console.warn("[Migration] physical schema migration failed", u2);
      }
    })(), "function" == typeof jp) {
      const e2 = jp();
      e2 > 0 && console.log(`[Groups] Removed ${e2} stale participant reference(s) on load`);
    }
    setTimeout(async () => {
      try {
        const e2 = gameState.pendingAIRequests?.text?.length || 0, t = gameState.pendingAIRequests?.image?.length || 0;
        (e2 > 0 || t > 0) && (console.log(`[AI Queue Restore] Found ${e2} text and ${t} image pending requests`), e2 > 0 && void 0 !== AIRequestQueue && await AIRequestQueue.restorePendingRequests(), t > 0 && void 0 !== ImageRequestQueue && await ImageRequestQueue.restorePendingRequests());
      } catch (u2) {
        console.error("[AI Queue Restore] Error restoring pending requests:", u2);
      }
    }, 2e3), Od(), gameState.products.forEach((e2) => {
      e2._costReductionApplied || (e2.baseUpgradeCost = Math.floor(e2.baseUpgradeCost * le.globalCostReduction), e2.upgradeCost = Math.floor(e2.upgradeCost * le.globalCostReduction), e2.managerHireCost = Math.floor(e2.managerHireCost * le.managerCostReduction), e2.managerUpgradeCost = Math.floor(e2.managerUpgradeCost * le.managerCostReduction), e2._costReductionApplied = true);
    });
    const e = gameState.locations.find((e2) => e2.id === gameState.activeLocationId);
    if (e && ud(e), setupEventListeners(), console.log("Initial updateUI() - gameState.cash:", gameState.cash), updateUI(), updateTabContent(gameState.activeTab), setTimeout(() => {
      console.log("Delayed updateUI() - gameState.cash:", gameState.cash), updateUI(), updateTabContent(gameState.activeTab);
    }, 100), Db(), setupAutosave(), zf(), console.log("[AI Optimization] Systems initialized"), "function" == typeof initializeBossImages && (initializeBossImages(), console.log("[Boss System] Boss images initialization queued")), "function" == typeof generateUniqueBoss) {
      const e2 = "home_office";
      gameState.bossFights?.generatedBosses?.[e2] || generateUniqueBoss(e2).then((t) => {
        t && console.log(`[Boss System] Pre-generated boss for ${e2}:`, t.character?.firstName);
      }).catch((e3) => console.warn("[Boss System] Failed to pre-generate boss:", e3));
    }
    if (void 0 !== StoryEngine && StoryEngine.initialize) try {
      StoryEngine.initialize(), console.log("[Story System] Initialized - Current Act:", gameState.story?.currentAct || 1), setTimeout(() => {
        StoryEngine.updateStoryUI && StoryEngine.updateStoryUI();
      }, 500);
    } catch (u2) {
      console.warn("[Story System] Initialization error:", u2);
    }
  } catch (u2) {
    console.error("Error initializing game:", u2), showNotification("Failed to initialize game. Please refresh the page.");
  }
  if (!window.__productsDelegationBound__) {
    const e = document.getElementById("productsList");
    e && (e.addEventListener("click", (e2) => {
      const t = e2.target.closest("button");
      if (!t) return;
      const n = t.dataset.id;
      if (n) {
        if (t.classList.contains("sell-btn")) {
          startOrClickProduct(n);
          const e3 = gameState.products.find((e4) => e4.id === n), t2 = document.getElementById(`selltxt-${n}`);
          return void (t2 && (t2.textContent = e3?.running ? "Click: -1s" : "Sell"));
        }
        if (t.classList.contains("upgrade-product-btn")) return upgradeProduct(n);
        if (t.classList.contains("manager-btn")) return hireOrUpgradeManager(n);
        if (t.classList.contains("unlock-product-btn")) {
          if (t.disabled) return;
          return yu(n);
        }
      }
    }), window.__productsDelegationBound__ = true);
  }
  window.__gameIntervalIds__ && window.__gameIntervalIds__.forEach((e) => clearInterval(e)), window.__gameIntervalIds__ = [], window.__gameIntervalIds__.push(setInterval(gameTick, 100)), window.__gameIntervalIds__.push(setInterval(updateNews, 3e4)), window.__gameIntervalIds__.push(setInterval(ph, 12e4)), window.__gameIntervalIds__.push(setInterval(ts, 9e5)), window.__gameIntervalIds__.push(setInterval(ls, 36e5)), ea(), window.__gameIntervalIds__.push(setInterval(ea, 200)), window.__gameIntervalIds__.push(setInterval(() => {
    AIRequestQueue && AIRequestQueue.updateUI();
  }, 2e3)), setTimeout(() => {
    if (eo(), po(), console.log("[Dynamic Events] System initialized"), gameState.settings?.disableStoryEvents) {
      const e = document.querySelector('.tab-btn[data-tab="story"]');
      e && (e.style.display = "none");
      const t = document.getElementById("eventBellBtn");
      t && (t.style.display = "none"), console.log("[Settings] Story Mode & Events disabled - UI elements hidden");
    }
  }, 2e3);
}
function getPlayerDescription(e = "conversation", t = null) {
  const n = gameState.playerProfile, a = n.physical || {}, o = a.hair || {}, i = a.eyes || {}, s = a.face || {}, r = a.skin || {}, l = a.body || {}, c = (Array.isArray(a.genitals) ? a.genitals[0] : a.genitals) || {}, d = t?.nicknameForPlayer?.trim(), p = n.firstName || n.lastName, m = [n.firstName, n.lastName].filter(Boolean).join(" ") || "the boss", u2 = n.firstName && n.lastName ? `${n.firstName} ${n.lastName}` : m, g = [];
  n.age && g.push(`${n.age} year old`), n.gender && g.push(n.gender), n.race && "human" !== n.race && g.push(n.race), "human" === n.race && n.ethnicity && g.push(`${"function" == typeof fl ? fl(n.ethnicity) : n.ethnicity}`);
  const h = [];
  a.heightBuild ? h.push(a.heightBuild) : n.height && h.push(n.height), (l.shape || n.bodyType) && h.push(`${l.shape || n.bodyType} build`);
  const y = [], f = r.tone || n.skinTone, b = r.texture;
  f && y.push(`${f} skin`), b && y.push(b);
  const v = [], w = o.color || n.hairColor, x = o.style || n.hairStyle, S = o.length, k = o.texture, T = [];
  S && T.push(S), w && T.push(w), x && T.push(x), k && T.push(k), T.length > 0 && v.push(`${T.join(" ")} hair`);
  const C = [], E = i.color || n.eyeColor, $2 = i.shape;
  E && $2 ? C.push(`${E} ${$2} eyes`) : E && C.push(`${E} eyes`), s.shape && C.push(`${s.shape} face`), s.lips && C.push(`${s.lips} lips`), s.jawline && C.push(`${s.jawline} jawline`);
  const I = s.facialHair || n.facialHair;
  I && C.push(I);
  const M = [];
  (l.chestSize || n.chestSize) && M.push(l.chestSize || n.chestSize), l.buttSize && M.push(`${l.buttSize} butt`), l.legs && M.push(`${l.legs} legs`), n.buildDetails && M.push(n.buildDetails);
  const P = [];
  a.fashion && P.push(`wears ${a.fashion}`), a.accessories && P.push(a.accessories), a.distinguishingFeature && P.push(a.distinguishingFeature);
  const A = [], N = c.type || n.genitalType, L = c.size || n.genitalDetails, _ = c.characteristics;
  if (N) {
    let e2 = [N];
    L && e2.push(`(${L})`), _ && e2.push(`- ${_}`), A.push(e2.join(" "));
  }
  const R = [];
  n.personalityTraits && n.personalityTraits.length > 0 ? R.push(`Personality: ${n.personalityTraits.join(", ")}`) : n.personality && R.push(`Personality: ${wr(n.personality)}`), n.hobbies && n.hobbies.length > 0 && R.push(`Hobbies: ${n.hobbies.join(", ")}`), n.likes && n.likes.length > 0 && R.push(`Likes: ${n.likes.join(", ")}`), n.dislikes && n.dislikes.length > 0 && R.push(`Dislikes: ${n.dislikes.join(", ")}`), n.kinks && n.kinks.length > 0 && ("explicit" === e || "intimate" === e) && R.push(`Kinks: ${n.kinks.join(", ")}`);
  let D = [];
  if ("image" === e) return D = [...g, ...h, ...y, ...v, ...C, ...M, ...P], n.additionalDetails && D.push(n.additionalDetails), D.filter(Boolean).join(", ") || "person";
  if ("explicit" === e) return D = [...g, ...h, ...y, ...v, ...C, ...M, ...A, ...P], n.additionalDetails && D.push(n.additionalDetails), D.filter(Boolean).join(", ") || "person";
  if ("post" === e) {
    D = [...g, ...h, ...v];
    const e2 = D.length > 0 ? `The boss (${u2}): ${D.join(", ")}` : `The boss (${u2})`;
    return d ? `${e2}. NOTE: This employee calls the boss "${d}" - use this nickname naturally in posts about the boss, not "Boss" or other names.` : e2;
  }
  D = [...g, ...h, ...y, ...v, ...C], P.length > 0 && D.push(...P), n.additionalDetails && D.push(n.additionalDetails);
  const F = [D.filter(Boolean).join(", "), R.filter(Boolean).join(". ")].filter(Boolean).join(". ");
  return "conversation" === e ? d ? F ? `\u26A0\uFE0F THE PLAYER is your boss. You have a special nickname for them: "${d}". Use this nickname OCCASIONALLY (about 1 in 4-5 messages) to feel natural and affectionate - NOT every single message. Most of the time just address them directly with "you" or skip using any name at all. The nickname is for special moments, flirting, or emphasis - not constant repetition. Their description: ${F}.` : `\u26A0\uFE0F THE PLAYER is your boss. You have a special nickname for them: "${d}". Use this nickname OCCASIONALLY (about 1 in 5-8+ messages) to feel natural and affectionate - NOT every single message. Most of the time just address them directly with "you" or skip using any name at all. The nickname is for special moments, flirting, or emphasis - not constant repetition.` : p ? F ? `\u26A0\uFE0F THE PLAYER (your boss) is named ${u2}. Do NOT call them by any other name. Their description: ${F}.` : `\u26A0\uFE0F THE PLAYER is your boss and their name is ${u2}. Do NOT call them by any other name.` : F ? `THE PLAYER (your boss) - refer to them as "boss" or "you": ${F}.` : 'THE PLAYER is your boss. You do NOT know their personal name - refer to them as "boss" or use "you" directly.' : F || m;
}
function il() {
  const e = gameState.playerProfile;
  return e.firstName && e.lastName ? `${e.firstName} ${e.lastName}` : e.firstName ? e.firstName : "the boss";
}
window.ModalManager = ModalManager;
