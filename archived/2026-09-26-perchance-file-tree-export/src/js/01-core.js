// ============================================================================
// 01-core — Global constants (CAPS), debugLog/debugWarn, core math (cycle time, values, click reduction) & economy config object `le`.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

const G = 100, U = 100, J = 3e4, CAPS = { CHAT_MESSAGES_PER_NPC: 200, CHAT_MESSAGES_SAVE: 100, EVENT_MEMORIES_PER_EMP: 25, EVENT_MEMORIES_GLOBAL: 30, SOCIAL_POSTS: 500, SOCIAL_POST_IMAGES_KEEP: 1e3, RECENT_POST_TYPES: 50, CONVERSATION_ARCHIVE: 5, STORY_EXPIRY_MS: 36e5, MEMORY_ITEMS_DEFAULT: 300, MEMORY_ITEMS_MIN: 50, MEMORY_ITEMS_MAX: 1e3, AI_QUALITY_EXAMPLES: 20 }, ee = 2e4, te = [{ maxAge: 6e4, minSpacing: 18e3 }, { maxAge: 6e5, minSpacing: 75e3 }, { maxAge: 36e5, minSpacing: 6e5 }, { maxAge: 864e5, minSpacing: 1656e4 }], ne = 26, oe = 12, ae = 12e6;
function debugLog(e, ...t) {
  gameState?.settings?.debugMode && console.log(`[${e}]`, ...t);
}
function debugWarn(e, ...t) {
  gameState?.settings?.debugMode && console.warn(`[${e}]`, ...t);
}
function ie(e) {
  const t = { speedMultiplier: 1, incomeMultiplier: 1, trainingMultiplier: 1, managerChain: [] };
  if (!e || !e.managerId) return t;
  const n = gameState.employees.find((t2) => t2.id === e.managerId);
  if (!n || "active" !== n.employmentStatus || n.unavailable && n.unavailableUntil > (gameState.currentDay || 0)) return t;
  const a = gameState.corporatePyramid?.positions?.[1]?.find((e2) => e2.employeeId === n.id);
  if (!a) return t;
  const o = /* @__PURE__ */ new Set();
  let i = a;
  for (; i && i.reportsTo && !o.has(i.positionId); ) {
    o.add(i.positionId);
    const e2 = se(i.reportsTo);
    if (!e2 || !e2.employeeId) break;
    const n2 = gameState.employees.find((t2) => t2.id === e2.employeeId);
    if (!n2 || "active" !== n2.employmentStatus) break;
    const a2 = n2.career?.level || e2.level, s = gameState.hierarchyLevels?.[a2];
    if (s) {
      const e3 = { 2: { speed: 1.05, income: 1.05, training: 1.03 }, 3: { speed: 1.08, income: 1.08, training: 1.05 }, 4: { speed: 1.12, income: 1.12, training: 1.08 }, 5: { speed: 1.15, income: 1.15, training: 1.1 }, 6: { speed: 1.2, income: 1.2, training: 1.15 }, 7: { speed: 1.25, income: 1.25, training: 1.2 } }[a2] || { speed: 1, income: 1, training: 1 };
      let o2 = 1;
      if (n2.skills?.management) {
        const e4 = n2.skills.management;
        o2 = 1 + 0.02 * (("number" == typeof e4 ? e4 : e4.level || 0) || 1);
      }
      t.speedMultiplier *= Math.pow(e3.speed, o2), t.incomeMultiplier *= Math.pow(e3.income, o2), t.trainingMultiplier *= Math.pow(e3.training, o2), t.managerChain.push({ name: n2.name, title: s.title, level: a2, speedBonus: e3.speed, incomeBonus: e3.income, effectiveness: o2 });
    }
    i = e2;
  }
  return t;
}
function se(e) {
  if (!gameState.corporatePyramid?.positions) return null;
  if ("ceo" === e && gameState.corporatePyramid.ceoPosition) return gameState.corporatePyramid.ceoPosition;
  if ("secretary" === e && gameState.corporatePyramid.secretaryPosition) return gameState.corporatePyramid.secretaryPosition;
  for (let t = 1; t <= 7; t++) {
    const n = gameState.corporatePyramid.positions[t];
    if (Array.isArray(n)) {
      const t2 = n.find((t3) => t3.positionId === e);
      if (t2) return t2;
    }
  }
  return null;
}
function getManagerSpeedMultiplier(e) {
  if (!e.managerHired || 0 === e.managerLevel) return 1;
  let t = Math.pow(0.92, e.managerLevel);
  const n = gameState.influenceUpgrades?.autoProgress || 0;
  t /= Cb.autoProgress.effect(n);
  const a = gameState.globalUpgrades?.timeDilation || 0;
  a > 0 && (t *= 1 / (1 + 0.03 * a));
  const o = gameState.employees.find((t2) => t2.productManaged === e.name && t2.hired);
  if (o && o.loyaltyBonus && (t /= 1 + o.loyaltyBonus), t /= ie(e).speedMultiplier, o) {
    t /= 0.85 + 0.15 * (o.stats?.productivity || 50) / 100;
    const e2 = o.stats?.trust || 50;
    t /= e2 <= 70 ? 0.85 + 0.15 * e2 / 70 : 1 + 0.15 * (e2 - 70) / 30, t /= 0.92 + (o.stats?.obedience || 50) / 1250;
  }
  return t;
}
function currentCycleTimeMs(e) {
  let t = Math.floor(e.baseTimeMs * getManagerSpeedMultiplier(e));
  const n = gameState.employees.find((t2) => t2.productManaged === e.name && t2.hired);
  if (n && e.managerHired && n.skills) {
    let a = 1;
    e.name && (e.name.toLowerCase().includes("software") || e.name.toLowerCase().includes("tech") || e.name.toLowerCase().includes("app")) && (a *= 1 - 0.05 * (n.skills.technical?.level || 0)), e.name && (e.name.toLowerCase().includes("design") || e.name.toLowerCase().includes("art") || e.name.toLowerCase().includes("creative")) && (a *= 1 - 0.05 * (n.skills.creative?.level || 0)), a *= 1 - 0.02 * (n.skills.management?.level || 0), t = Math.floor(t * a);
  }
  const o = gameState.globalUpgrades?.nightShift?.[e.locationId] || 0;
  return o > 0 && (t = Math.floor(t / (1 + 0.05 * o))), Math.max(100, t);
}
function currentValue(e) {
  const t = e.level || 0, n = e.valuePerUnit || 3, a = 1 + (e.valuePerUpgrade || 0.1) * t, o = e.valueExponent ?? le.productIncomeExponent;
  let i = n * Math.pow(a, o) * le.globalIncomeMultiplier;
  const s = gameState.globalUpgrades?.incomeBoost?.[e.locationId] || 0;
  s > 0 && (i *= 1 + 10 * s / 100), gameState.globalUpgrades?.flagship?.locationId === e.locationId && (i *= 1.25);
  const r = gameState.employees.find((t2) => t2.productManaged === e.name && t2.hired);
  if (r && r.career && e.managerHired) {
    const e2 = r.career.level || 1, t2 = gameState.hierarchyLevels?.[e2];
    t2 && t2.productBonusPercent && (i *= 1 + t2.productBonusPercent / 100);
  }
  if (i *= ie(e).incomeMultiplier, gameState.corporateHierarchy && gameState.corporateHierarchy.executiveRoles) {
    let e2 = 1;
    if (gameState.corporateHierarchy.executiveRoles.COO) {
      const t2 = gameState.employees.find((e3) => e3.id === gameState.corporateHierarchy.executiveRoles.COO);
      t2 && "active" === t2.employmentStatus && (e2 *= 1.1);
    }
    if (gameState.corporateHierarchy.executiveRoles.CFO) {
      const t2 = gameState.employees.find((e3) => e3.id === gameState.corporateHierarchy.executiveRoles.CFO);
      t2 && "active" === t2.employmentStatus && (e2 *= 1.1);
    }
    i *= e2, gameState.globalIncomeMultiplier = e2;
  }
  if (r && e.managerHired) {
    const t2 = r.stats?.productivity || 50;
    let n2 = 1;
    const a2 = gameState.globalUpgrades?.empireBuilder || 0;
    a2 > 0 && (n2 = 1 + 0.1 * a2), n2 += 0.04 * (gameState.globalUpgrades?.workforce?.ergonomics || 0);
    let o2 = 0;
    r.skills && (e.name && (e.name.toLowerCase().includes("software") || e.name.toLowerCase().includes("tech") || e.name.toLowerCase().includes("app")) && (o2 += Qa(r, "technical")), e.name && (e.name.toLowerCase().includes("design") || e.name.toLowerCase().includes("art") || e.name.toLowerCase().includes("creative")) && (o2 += Qa(r, "creative")), o2 += 0.5 * Qa(r, "management")), i *= 0.7 + Math.min(150, (t2 + o2) * n2) / 187.5;
  }
  const l = gameState.influenceUpgrades?.incomeMultiplier || 0;
  l > 0 && (i *= Cb.incomeMultiplier.effect(l));
  const c = gameState.globalUpgrades?.goldenTouch || 0;
  return c > 0 && (i *= Math.pow(1.05, c)), i *= gameState.story?.factionEffects?.incomeMult || 1, +i.toFixed(2);
}
function clickReductionMs(e) {
  const t = e.clickSecondsBase || 1, n = 0.1 * (gameState.globalUpgrades?.clickPower || 0), a = gameState.influenceUpgrades?.clickPower || 0;
  return 1e3 * (t + n + Cb.clickPower.effect(a));
}
const le = { globalIncomeMultiplier: 2.5, globalCostReduction: 0.7, productCostMultiplier: 1.22, productIncomeMultiplier: 1.2, productIncomeExponent: 0.95, startingCash: 150, firstProductUnlockCost: 80, baseClickReduction: 1, clickPowerGrowth: 1, managerCostReduction: 0.7, bossHealthMultiplier: 2, bossTimeLimit: 60, bossRewardMultiplier: 5, upgradeBaseCosts: { clickPower: 1e4, incomeBoost: { garage: 5e4, home_office: 15e4, office_suite: 5e6, factory: 25e7, rnd: 5e10, creative_studio: 5e12, private_club: 5e14, velvet_room: 5e16, inner_sanctum: 5e17 }, costReduction: { garage: 1e5, home_office: 3e5, office_suite: 1e7, factory: 5e8, rnd: 1e11, creative_studio: 1e13, private_club: 1e15, velvet_room: 1e17, inner_sanctum: 1e18 } } }, ce = { recentEmojis: [], maxRecent: 24, currentTarget: null, emojis: { smileys: ["\u{1F600}", "\u{1F603}", "\u{1F604}", "\u{1F601}", "\u{1F606}", "\u{1F605}", "\u{1F923}", "\u{1F602}", "\u{1F642}", "\u{1F643}", "\u{1F609}", "\u{1F60A}", "\u{1F607}", "\u{1F970}", "\u{1F60D}", "\u{1F929}", "\u{1F618}", "\u{1F617}", "\u{1F61A}", "\u{1F619}", "\u{1F972}", "\u{1F60B}", "\u{1F61B}", "\u{1F61C}", "\u{1F92A}", "\u{1F61D}", "\u{1F911}", "\u{1F917}", "\u{1F92D}", "\u{1F92B}", "\u{1F914}", "\u{1F910}", "\u{1F928}", "\u{1F610}", "\u{1F611}", "\u{1F636}", "\u{1F60F}", "\u{1F612}", "\u{1F644}", "\u{1F62C}", "\u{1F925}", "\u{1F60C}", "\u{1F614}", "\u{1F62A}", "\u{1F924}", "\u{1F634}", "\u{1F637}", "\u{1F912}", "\u{1F915}", "\u{1F922}", "\u{1F92E}", "\u{1F927}", "\u{1F975}", "\u{1F976}", "\u{1F974}", "\u{1F635}", "\u{1F92F}", "\u{1F920}", "\u{1F973}", "\u{1F978}", "\u{1F60E}", "\u{1F913}", "\u{1F9D0}"], gestures: ["\u{1F44B}", "\u{1F91A}", "\u{1F590}", "\u270B", "\u{1F596}", "\u{1F44C}", "\u{1F90C}", "\u{1F90F}", "\u270C\uFE0F", "\u{1F91E}", "\u{1F91F}", "\u{1F918}", "\u{1F919}", "\u{1F448}", "\u{1F449}", "\u{1F446}", "\u{1F595}", "\u{1F447}", "\u261D\uFE0F", "\u{1F44D}", "\u{1F44E}", "\u270A", "\u{1F44A}", "\u{1F91B}", "\u{1F91C}", "\u{1F44F}", "\u{1F64C}", "\u{1F450}", "\u{1F932}", "\u{1F91D}", "\u{1F64F}", "\u{1F4AA}", "\u{1F9BE}", "\u{1F9BF}", "\u{1F9B5}", "\u{1F9B6}", "\u{1F442}", "\u{1F9BB}", "\u{1F443}", "\u{1F9E0}", "\u{1FAC0}", "\u{1FAC1}", "\u{1F9B7}", "\u{1F9B4}", "\u{1F440}", "\u{1F441}", "\u{1F445}", "\u{1F444}", "\u{1F48B}"], hearts: ["\u2764\uFE0F", "\u{1F9E1}", "\u{1F49B}", "\u{1F49A}", "\u{1F499}", "\u{1F49C}", "\u{1F5A4}", "\u{1F90D}", "\u{1F90E}", "\u{1F494}", "\u2764\uFE0F\u200D\u{1F525}", "\u2764\uFE0F\u200D\u{1FA79}", "\u{1F495}", "\u{1F49E}", "\u{1F493}", "\u{1F497}", "\u{1F496}", "\u{1F498}", "\u{1F49D}", "\u{1F49F}", "\u{1F48C}", "\u{1F4A2}", "\u{1F4A5}", "\u{1F4AB}", "\u{1F4A6}", "\u{1F4A8}", "\u{1F573}\uFE0F", "\u{1F4AC}", "\u{1F441}\uFE0F\u200D\u{1F5E8}\uFE0F", "\u{1F5E8}\uFE0F", "\u{1F5EF}\uFE0F", "\u{1F4AD}"], objects: ["\u{1F389}", "\u{1F38A}", "\u{1F388}", "\u{1F381}", "\u{1F380}", "\u{1F3C6}", "\u{1F947}", "\u{1F948}", "\u{1F949}", "\u26BD", "\u{1F3C0}", "\u{1F3C8}", "\u26BE", "\u{1F3BE}", "\u{1F3D0}", "\u{1F3C9}", "\u{1F3B1}", "\u{1F3D3}", "\u{1F3F8}", "\u{1F945}", "\u{1F94A}", "\u{1F94B}", "\u26F3", "\u26F8\uFE0F", "\u{1F3A3}", "\u{1F3BD}", "\u{1F3BF}", "\u{1F6F7}", "\u{1F94C}", "\u{1F3AF}", "\u{1FA80}", "\u{1FA81}", "\u{1F3B1}", "\u{1F3AE}", "\u{1F579}\uFE0F", "\u{1F3B0}", "\u{1F3B2}", "\u{1F9E9}", "\u265F\uFE0F", "\u{1F3AD}", "\u{1F3A8}", "\u{1F9F5}", "\u{1FAA1}", "\u{1F9F6}", "\u{1FAA2}", "\u{1F4F7}", "\u{1F4F8}", "\u{1F4F9}", "\u{1F3A5}", "\u{1F4FD}\uFE0F", "\u{1F3AC}", "\u{1F4FA}", "\u{1F4FB}", "\u{1F399}\uFE0F", "\u{1F39A}\uFE0F", "\u{1F39B}\uFE0F", "\u{1F3A7}", "\u{1F3B7}", "\u{1FA97}", "\u{1F3B8}", "\u{1F3B9}", "\u{1F3BA}", "\u{1F3BB}", "\u{1FA95}", "\u{1F941}", "\u{1FA98}", "\u{1F4F1}", "\u{1F4F2}", "\u260E\uFE0F", "\u{1F4DE}", "\u{1F4DF}", "\u{1F4E0}", "\u{1F50B}", "\u{1F50C}", "\u{1F4BB}", "\u{1F5A5}\uFE0F", "\u{1F5A8}\uFE0F", "\u2328\uFE0F", "\u{1F5B1}\uFE0F", "\u{1F5B2}\uFE0F", "\u{1F4BE}", "\u{1F4BF}", "\u{1F4C0}", "\u{1F9EE}", "\u{1F3A5}"], symbols: ["\u2728", "\u2B50", "\u{1F31F}", "\u{1F4AB}", "\u2705", "\u274C", "\u2B55", "\u{1F525}", "\u{1F4AF}", "\u{1F3AF}", "\u{1F4A2}", "\u{1F4A4}", "\u{1F4A8}", "\u{1F573}\uFE0F", "\u2714\uFE0F", "\u2611\uFE0F", "\u2716\uFE0F", "\u2795", "\u2796", "\u2797", "\u2753", "\u2754", "\u2755", "\u2757", "\u3030\uFE0F", "\u{1F4B1}", "\u{1F4B2}", "\u26A0\uFE0F", "\u{1F6B8}", "\u{1F531}", "\u{1F4DB}", "\u{1F530}", "\u2733\uFE0F", "\u2747\uFE0F", "\u267B\uFE0F", "\u{1F4A0}", "\u{1F537}", "\u{1F536}", "\u{1F539}", "\u{1F538}", "\u{1F53A}", "\u{1F53B}", "\u{1F48E}", "\u{1F518}", "\u{1F532}", "\u{1F533}"] }, init() {
  const e = localStorage.getItem("recentEmojis");
  if (e) try {
    this.recentEmojis = JSON.parse(e);
  } catch (e2) {
    this.recentEmojis = [];
  }
  document.querySelectorAll(".emoji-category-btn").forEach((e2) => {
    e2.addEventListener("click", (t) => {
      t.stopPropagation(), this.switchCategory(e2.dataset.category);
    });
  }), document.addEventListener("click", (e2) => {
    const t = document.getElementById("emojiPickerTray");
    "block" !== t.style.display || t.contains(e2.target) || e2.target.classList.contains("emoji-picker-trigger") || this.hide();
  }), this.renderRecent();
}, show(e, t) {
  console.log("EmojiPicker.show() called", { targetInput: e, triggerButton: t }), this.currentTarget = e;
  const n = document.getElementById("emojiPickerTray");
  console.log("Picker element:", n);
  const a = t.getBoundingClientRect();
  console.log("Button rect:", a);
  const o = window.innerHeight - a.bottom, i = a.top;
  o > 420 || o > i ? (n.style.top = `${a.bottom + 5}px`, n.style.bottom = "auto") : (n.style.bottom = window.innerHeight - a.top + 5 + "px", n.style.top = "auto");
  let s = a.left;
  s + 320 > window.innerWidth && (s = window.innerWidth - 320 - 10), n.style.left = `${Math.max(10, s)}px`, n.style.display = "block", console.log("Picker display set to block, styles:", { display: n.style.display, top: n.style.top, left: n.style.left, zIndex: n.style.zIndex }), this.switchCategory("recent");
}, hide() {
  document.getElementById("emojiPickerTray").style.display = "none", this.currentTarget = null;
}, switchCategory(e) {
  document.querySelectorAll(".emoji-category-btn").forEach((t) => {
    t.dataset.category === e ? (t.style.background = "var(--cd)", t.style.color = "var(--b)", t.classList.add("active")) : (t.style.background = "transparent", t.style.color = "var(--ar)", t.classList.remove("active"));
  }), "recent" === e ? this.renderRecent() : this.renderCategory(e);
}, renderRecent() {
  const e = document.getElementById("emojiPickerContent");
  0 !== this.recentEmojis.length ? (e.innerHTML = this.recentEmojis.map((e2) => `<button class="emoji-btn" data-emoji="${e2}" style="padding:4px; background:transparent; border:none; font-size:1.1rem; cursor:pointer; border-radius:4px; transition:all 0.15s; flex-shrink:0; width:32px; height:32px; display:flex; align-items:center; justify-content:center;" onmouseenter="this.style.background='var(--cd)'; this.style.transform='scale(1.15)'" onmouseleave="this.style.background='transparent'; this.style.transform='scale(1)'">${e2}</button>`).join(""), this.attachEmojiClickHandlers()) : e.innerHTML = '<div style="width:100%; text-align:center; padding:40px 20px; color:var(--e);">No recent emojis yet<br><span style="font-size:2rem; margin-top:10px; display:block;">\u{1F550}</span></div>';
}, renderCategory(e) {
  const t = document.getElementById("emojiPickerContent"), n = this.emojis[e] || [];
  t.innerHTML = n.map((e2) => `<button class="emoji-btn" data-emoji="${e2}" style="padding:4px; background:transparent; border:none; font-size:1.1rem; cursor:pointer; border-radius:4px; transition:all 0.15s; flex-shrink:0; width:32px; height:32px; display:flex; align-items:center; justify-content:center;" onmouseenter="this.style.background='var(--cd)'; this.style.transform='scale(1.15)'" onmouseleave="this.style.background='transparent'; this.style.transform='scale(1)'">${e2}</button>`).join(""), this.attachEmojiClickHandlers();
}, attachEmojiClickHandlers() {
  document.querySelectorAll(".emoji-btn").forEach((e) => {
    e.addEventListener("click", (t) => {
      t.stopPropagation(), this.insertEmoji(e.dataset.emoji);
    });
  });
}, insertEmoji(e) {
  if (!this.currentTarget) return;
  const t = this.currentTarget, n = t.selectionStart || 0, a = t.selectionEnd || 0, o = t.value;
  t.value = o.substring(0, n) + e + o.substring(a);
  const i = n + e.length;
  t.setSelectionRange(i, i), t.focus(), this.recentEmojis = this.recentEmojis.filter((t2) => t2 !== e), this.recentEmojis.unshift(e), this.recentEmojis.length > this.maxRecent && (this.recentEmojis = this.recentEmojis.slice(0, this.maxRecent)), localStorage.setItem("recentEmojis", JSON.stringify(this.recentEmojis));
} }, AIRequestQueue = { activeRequests: 0, requestQueue: [], maxConcurrent: 15, requestTimeoutMs: 12e4, init() {
  this.maxConcurrent = gameState?.settings?.maxAiRequests || 15, console.log(`[AI Queue] Initialized with max ${this.maxConcurrent} concurrent requests`), this.updateUI();
}, updateMaxConcurrent(e) {
  this.maxConcurrent = Math.max(1, Math.min(50, e)), gameState.settings && (gameState.settings.maxAiRequests = this.maxConcurrent), this.processQueue(), this.updateUI(), console.log(`[AI Queue] Updated max concurrent to ${this.maxConcurrent}`);
}, async enqueue(e, t = "AI Request") {
  return new Promise((n, a) => {
    const o = { id: Date.now() + Math.random(), function: e, description: t, resolve: n, reject: a, timestamp: Date.now() };
    this.requestQueue.push(o), console.log(`[AI Queue] Queued: ${t} (Queue: ${this.requestQueue.length})`), this.updateUI(), this.processQueue();
  });
}, async processQueue() {
  for (; this.activeRequests < this.maxConcurrent && this.requestQueue.length > 0; ) {
    const e = this.requestQueue.shift();
    this.activeRequests++, this.updateUI(), console.log(`[AI Queue] Starting: ${e.description} (Active: ${this.activeRequests}, Queued: ${this.requestQueue.length})`);
    let t = false;
    try {
      const n = await this.executeWithRetry(e);
      e.resolve(n), t = true;
    } catch (u2) {
      console.error(`[AI Queue] Final error in ${e.description}:`, u2);
      const n = this.getFallbackResponse(e.description, u2);
      e.resolve(n);
    } finally {
      this.activeRequests--, t && void 0 !== gameState && (gameState.generationStats || (gameState.generationStats = { totalTextGenerations: 0, totalImageGenerations: 0 }), gameState.generationStats.totalTextGenerations++), this.updateUI(), console.log(`[AI Queue] Completed: ${e.description} (Active: ${this.activeRequests}, Queued: ${this.requestQueue.length})`), this.processQueue();
    }
  }
}, async executeWithRetry(e, t = 2) {
  for (let n = 1; n <= t; n++) try {
    return await Promise.race([e.function(), new Promise((_, u2) => setTimeout(() => u2(new Error("AI request timeout")), this.requestTimeoutMs))]);
  } catch (u2) {
    console.warn(`[AI Queue] Attempt ${n}/${t} failed for ${e.description}:`, u2);
    const o = /max.*request|too.*many.*request|request.*limit|rate.*limit|exceeded.*limit/i.test(u2?.message || "");
    if (o && (this.logMaxRequestsFailure(e, u2, n), 1 === n && (console.warn("[AI Queue] \u{1F6A8} Max Requests detected on first attempt - extending wait time"), await new Promise((e2) => setTimeout(e2, 5e3)))), n === t) throw o && this.logMaxRequestsFailure(e, u2, n, true), u2;
    const i = o ? 2e3 * Math.pow(2, n) : 1e3 * Math.pow(2, n - 1);
    console.log(`[AI Queue] Retrying ${e.description} in ${i}ms...`), await new Promise((e2) => setTimeout(e2, i));
  }
}, logMaxRequestsFailure(e, t, n, a = false) {
  const o = (/* @__PURE__ */ new Date()).toISOString(), i = { activeRequests: this.activeRequests, queuedRequests: this.requestQueue.length, maxConcurrent: this.maxConcurrent, totalPending: this.activeRequests + this.requestQueue.length, failedRequest: e.description, attempt: n, error: t.message || "Unknown error", timestamp: o };
  return console.error("\u{1F6A8} [AI QUEUE] MAX REQUESTS ERROR DETECTED:"), console.error("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), console.error(`\u{1F4CD} Request: ${e.description}`), console.error(`\u{1F522} Queue State: ${this.activeRequests} active, ${this.requestQueue.length} queued`), console.error(`\u2699\uFE0F Max Concurrent: ${this.maxConcurrent}`), console.error(`\u{1F4CA} Total Pending: ${i.totalPending}`), console.error(`\u{1F3AF} Attempt: ${n}${a ? " (FINAL)" : ""}`), console.error(`\u26A0\uFE0F Error: ${t.message}`), console.error(`\u{1F550} Time: ${o}`), console.error("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), window.aiQueueFailures || (window.aiQueueFailures = []), window.aiQueueFailures.push(i), window.aiQueueFailures.length > 20 && window.aiQueueFailures.shift(), a && "function" == typeof showNotification && showNotification(`\u{1F6A8} AI Rate Limit Hit!
Queue: ${this.activeRequests} active, ${this.requestQueue.length} waiting
Consider lowering max requests to ${Math.max(5, this.maxConcurrent - 5)}`, "warning", 8e3), i;
}, getFallbackResponse(e, t) {
  const n = t?.message || "Unknown error";
  return console.log(`[AI Queue] Using fallback for ${e}: ${n}`), e.toLowerCase().includes("chat") || e.toLowerCase().includes("response") ? "I'm having some difficulty with my words right now. Could you try asking again?" : e.toLowerCase().includes("gift") ? { name: "Thoughtful Note", description: "A handwritten note expressing appreciation. Sometimes the simplest gestures mean the most.", price: 5, type: "misc" } : e.toLowerCase().includes("family member") ? JSON.stringify({ bio: "A family member who recently joined the company. They bring a unique perspective shaped by their family connections.", personalityTraits: ["Friendly", "Adaptable", "Family-oriented"], keyTrait: "Reliable", hobbies: ["Reading", "Cooking"], kinks: ["Roleplay", "Teasing"], personality: { confidence: 50, outgoing: 50, flirty: 40, professional: 60, humor: 50 }, physical: { hairColor: "brown", hairStyle: "natural", hairLength: "medium", hairTexture: "smooth", eyeColor: "brown", eyeShape: "almond", skinTone: "fair", bodyShape: "average", heightBuild: "average height", breastSize: "medium", buttSize: "average", fashion: "casual professional", accessories: "none", notableFeatures: "warm smile" } }) : e.toLowerCase().includes("profile") || e.toLowerCase().includes("manager") ? "This person has a warm personality and brings positive energy to any workplace." : e.toLowerCase().includes("meeting") ? "The discussion was productive, though some technical details need to be worked out later." : "I'm experiencing some technical difficulties. Please try again in a moment.";
}, updateUI() {
  const e = document.getElementById("aiQueueStatus"), t = document.getElementById("aiQueueCounts"), n = document.getElementById("aiTotalGenerated");
  e && (0 === this.activeRequests && 0 === this.requestQueue.length ? (e.textContent = "Ready", e.style.color = "var(--n)") : this.requestQueue.length > 0 ? (e.textContent = "Busy (Queued)", e.style.color = "var(--z)") : (e.textContent = "Processing", e.style.color = "var(--u)")), t && (t.textContent = `${this.activeRequests}/${this.requestQueue.length}`), n && void 0 !== gameState && gameState.generationStats && (n.textContent = (gameState.generationStats.totalTextGenerations || 0).toLocaleString());
}, getStats() {
  return { active: this.activeRequests, queued: this.requestQueue.length, maxConcurrent: this.maxConcurrent, totalWaiting: this.activeRequests + this.requestQueue.length };
}, analyzeFailures() {
  if (!window.aiQueueFailures || 0 === window.aiQueueFailures.length) return console.log("\u{1F50D} [AI Queue Analysis] No Max Requests failures recorded yet."), null;
  const e = window.aiQueueFailures, t = { totalFailures: e.length, avgActiveAtFailure: e.reduce((e2, t2) => e2 + t2.activeRequests, 0) / e.length, avgQueuedAtFailure: e.reduce((e2, t2) => e2 + t2.queuedRequests, 0) / e.length, avgMaxConcurrentAtFailure: e.reduce((e2, t2) => e2 + t2.maxConcurrent, 0) / e.length, maxActiveAtFailure: Math.max(...e.map((e2) => e2.activeRequests)), recentFailures: e.slice(-5) }, n = Math.floor(0.8 * t.avgActiveAtFailure), a = Math.max(5, Math.min(25, n));
  return console.log("\u{1F50D} [AI QUEUE FAILURE ANALYSIS]"), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), console.log(`\u{1F4CA} Total Max Requests failures: ${t.totalFailures}`), console.log(`\u{1F4C8} Average active requests at failure: ${t.avgActiveAtFailure.toFixed(1)}`), console.log(`\u{1F4CB} Average queued requests at failure: ${t.avgQueuedAtFailure.toFixed(1)}`), console.log(`\u2699\uFE0F Average max concurrent setting: ${t.avgMaxConcurrentAtFailure.toFixed(1)}`), console.log(`\u{1F3AF} Highest active count at failure: ${t.maxActiveAtFailure}`), console.log(`\u{1F4A1} RECOMMENDED max concurrent: ${a} (current: ${this.maxConcurrent})`), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), t.recentFailures.length > 0 && (console.log("\u{1F550} Recent failures:"), t.recentFailures.forEach((e2, t2) => {
    console.log(`  ${t2 + 1}. ${e2.activeRequests} active, ${e2.queuedRequests} queued (max: ${e2.maxConcurrent}) - ${e2.failedRequest}`);
  })), a < this.maxConcurrent && (console.log(`
\u{1F39B}\uFE0F Consider lowering max concurrent to ${a} for better stability.`), console.log(`   Use: AIRequestQueue.updateMaxConcurrent(${a})`)), t;
}, clearFailureData() {
  if (window.aiQueueFailures) {
    const e = window.aiQueueFailures.length;
    window.aiQueueFailures = [], console.log(`\u{1F5D1}\uFE0F [AI Queue] Cleared ${e} failure records.`);
  }
}, savePersistentRequest(e) {
  gameState.pendingAIRequests || (gameState.pendingAIRequests = { text: [], image: [] });
  const t = { id: e.id || Date.now() + Math.random(), type: e.type || "generic", prompt: e.prompt, options: e.options || {}, description: e.description || "Text Generation", callback: e.callback, callbackData: e.callbackData, timestamp: Date.now() };
  return gameState.pendingAIRequests.text.push(t), console.log(`[AI Queue] \u{1F4BE} Saved persistent request: ${t.description} (${gameState.pendingAIRequests.text.length} pending)`), "function" == typeof debouncedSave && debouncedSave(), t.id;
}, completePersistentRequest(e) {
  if (!gameState.pendingAIRequests?.text) return;
  const t = gameState.pendingAIRequests.text.findIndex((t2) => t2.id === e);
  if (-1 !== t) {
    const e2 = gameState.pendingAIRequests.text.splice(t, 1)[0];
    console.log(`[AI Queue] \u2705 Completed persistent request: ${e2.description} (${gameState.pendingAIRequests.text.length} remaining)`), "function" == typeof debouncedSave && debouncedSave();
  }
}, async restorePendingRequests() {
  if (!gameState.pendingAIRequests?.text || 0 === gameState.pendingAIRequests.text.length) return void console.log("[AI Queue] No pending requests to restore");
  const e = gameState.pendingAIRequests.text.length;
  console.log(`[AI Queue] \u{1F504} Restoring ${e} pending text generation requests...`);
  const t = [...gameState.pendingAIRequests.text];
  gameState.pendingAIRequests.text = [];
  let n = 0;
  for (const e2 of t) try {
    const t2 = (Date.now() - e2.timestamp) / 36e5;
    if (t2 > 24) {
      console.log(`[AI Queue] \u23ED\uFE0F Skipping stale request (${t2.toFixed(1)}h old): ${e2.description}`);
      continue;
    }
    console.log(`[AI Queue] \u{1F504} Re-queueing: ${e2.description}`), n++, gameState.pendingAIRequests.text.push(e2), this.enqueue(() => generateText(e2.prompt, e2.options || {}), e2.description).then((t3) => {
      const n2 = gameState.pendingAIRequests.text.findIndex((t4) => t4.id === e2.id);
      -1 !== n2 && (gameState.pendingAIRequests.text.splice(n2, 1), console.log(`[AI Queue] \u2705 Restored request completed: ${e2.description}`));
    }).catch((t3) => {
      const n2 = gameState.pendingAIRequests.text.findIndex((t4) => t4.id === e2.id);
      -1 !== n2 && gameState.pendingAIRequests.text.splice(n2, 1), console.error(`[AI Queue] Restored request failed: ${e2.description}`, t3);
    });
  } catch (t2) {
    console.error(`[AI Queue] Error restoring request ${e2.description}:`, t2);
  }
  "function" == typeof showNotification && n > 0 && showNotification(`\u{1F504} Restored ${n} pending AI requests`, "info", 4e3);
}, async enqueuePersistent(e) {
  const t = this.savePersistentRequest(e);
  try {
    const n = await this.enqueue(() => generateText(e.prompt, e.options || {}), e.description);
    if (this.completePersistentRequest(t), e.callback && "function" == typeof window[e.callback]) try {
      await window[e.callback](n, e.callbackData);
    } catch (t2) {
      console.error(`[AI Queue] Callback error for ${e.description}:`, t2);
    }
    return n;
  } catch (t2) {
    throw console.error(`[AI Queue] Persistent request failed: ${e.description}`, t2), t2;
  }
}, getPendingCount: () => gameState.pendingAIRequests?.text?.length || 0 };
