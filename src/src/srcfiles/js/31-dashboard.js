// ============================================================================
// 31-dashboard — Dashboard: updateTabContent, updateDashboard, cash spark, action center, recent messages, top performers.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

window.updateCraftCombineInfo = function () {
    const info = $("craftCombineInfo");
    if (!info) return;
    const ia = gameState.giftInventory?.items.find((i) => i.id === $("craftCombineA")?.value),
        ib = gameState.giftInventory?.items.find((i) => i.id === $("craftCombineB")?.value);
    if (!ia || !ib) return void (info.textContent = "Pick two gifts to see the result.");
    const fee = Math.max(50, Math.round(0.25 * ((ia.price || 0) + (ib.price || 0)))),
        cat = _rarityRank(ia.category) >= _rarityRank(ib.category) ? ia.category : ib.category,
        price = (ia.price || 0) + (ib.price || 0) + fee;
    info.innerHTML = `Result: <span class="text-accent">${GIFT_CATEGORIES[cat]?.name || cat}</span> · value <span class="num text-pos">$${price.toLocaleString()}</span> · fee <span class="num text-neg">$${fee.toLocaleString()}</span>`;
};
window.updateCraftPersInfo = function () {
    const info = $("craftPersInfo");
    if (!info) return;
    const it = gameState.giftInventory?.items.find((i) => i.id === $("craftPersGift")?.value),
        npc = gameState.employees?.find((e) => e.id === $("craftPersNpc")?.value);
    if (!it || !npc) return void (info.textContent = "Pick a gift and a person.");
    const fee = Math.max(50, Math.round(0.3 * (it.price || 0))),
        pv = giftReactionPreview(npc, it);
    info.innerHTML = `${npc.name} now <span class="chip ${pv.cls}"><span>${pv.emoji}</span><span class="lbl">${pv.label}</span></span> → after <span class="chip chip--buff"><span>💝</span><span class="lbl">Personalized</span></span> · fee <span class="num text-neg">$${fee.toLocaleString()}</span>`;
};
window.craftCombineGifts = async function () {
    const a = $("craftCombineA")?.value,
        b = $("craftCombineB")?.value;
    if (!a || !b) return void showNotification("Pick two gifts to combine.", "warning");
    if (a === b) {
        const it = gameState.giftInventory.items.find((i) => i.id === a);
        if (!it || (it.quantity || 1) < 2)
            return void showNotification("Pick two different gifts (or a stack of 2+).", "warning");
    }
    const ia = gameState.giftInventory.items.find((i) => i.id === a),
        ib = gameState.giftInventory.items.find((i) => i.id === b);
    if (!ia || !ib) return void showNotification("Gift not found.", "error");
    if (ia.vaulted || ib.vaulted)
        return void showNotification("🔒 Vaulted gifts can't be crafted. Unvault first.", "warning");
    const fee = Math.max(50, Math.round(0.25 * ((ia.price || 0) + (ib.price || 0))));
    if (gameState.cash < fee)
        return void showNotification(`Need a $${fee.toLocaleString()} crafting fee.`, "error");
    if (
        !(await showConfirm(
            `Combine "${ia.name}" + "${ib.name}" into one higher-tier gift for a $${fee.toLocaleString()} crafting fee? Both inputs are consumed.`,
            "Combine Gifts",
            { confirmText: "Combine" }
        ))
    )
        return;
    const cat = _rarityRank(ia.category) >= _rarityRank(ib.category) ? ia.category : ib.category,
        price = (ia.price || 0) + (ib.price || 0) + fee,
        nameA = ia.name,
        nameB = ib.name,
        descA = ia.description,
        descB = ib.description;
    removeGiftFromInventory(a, 1), removeGiftFromInventory(b, 1), (gameState.cash -= fee);
    showNotification("🛠️ Crafting your combined gift…", "info");
    let name = `${nameA} × ${nameB}`,
        description = `A bespoke creation combining ${nameA} and ${nameB}.`;
    try {
        const raw = extractText(
                await queuedGenerateText(
                    `Combine these two gifts into ONE cohesive, higher-end gift. Invent a single product name and a 2-sentence description.\n\nGift A: ${nameA} — ${descA}\nGift B: ${nameB} — ${descB}\n\nReply as JSON only: {"name":"...","description":"..."}`,
                    { temperature: 0.9, max_tokens: 160 },
                    "Combine gifts"
                )
            ),
            m = raw.match(/\{[\s\S]*\}/),
            j = JSON.parse(m ? m[0] : raw);
        j.name && (name = j.name), j.description && (description = j.description);
    } catch (e) {
        console.warn("[Craft] combine LLM failed, using fallback name/description", e);
    }
    gameState.giftInventory.items.push({
        id: "gift_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        name,
        category: cat,
        price,
        description,
        imagePrompt: name,
        timesGiven: 0,
        quantity: 1,
        addedAt: Date.now(),
        crafted: !0,
    }),
        (lastInventoryRenderHash = null),
        (lastCraftControlsHash = null),
        updateGiftInventory(),
        renderCraftControls(),
        updateUI(),
        "function" == typeof saveGame && saveGame(!1),
        showNotification(`✨ Crafted "${name}"!`, "success");
};
window.craftPersonalizeGift = async function () {
    const gid = $("craftPersGift")?.value,
        npcId = $("craftPersNpc")?.value,
        note = ($("craftPersNote")?.value || "").trim();
    if (!gid || !npcId) return void showNotification("Pick a gift and a recipient.", "warning");
    const it = gameState.giftInventory.items.find((i) => i.id === gid),
        npc = gameState.employees.find((e) => e.id === npcId);
    if (!it || !npc) return void showNotification("Gift or person not found.", "error");
    if (it.vaulted) return void showNotification("🔒 Unvault this gift before personalizing.", "warning");
    const fee = Math.max(50, Math.round(0.3 * (it.price || 0)));
    if (gameState.cash < fee) return void showNotification(`Need $${fee.toLocaleString()} to personalize.`, "error");
    if (
        !(await showConfirm(
            `Personalize "${it.name}" for ${npc.name} for a $${fee.toLocaleString()} fee? It will delight them specifically.`,
            "Personalize Gift",
            { confirmText: "Personalize" }
        ))
    )
        return;
    const snapshot = { ...it };
    removeGiftFromInventory(gid, 1), (gameState.cash -= fee);
    showNotification("💝 Adding a personal touch…", "info");
    let description = snapshot.description;
    try {
        const t = extractText(
            await queuedGenerateText(
                `Rewrite this gift's description (2 sentences) so it feels personally chosen for ${npc.name}${note ? `, weaving in: "${note}"` : ""}. Keep what the item fundamentally is.\n\nItem: ${snapshot.name}\nCurrent: ${snapshot.description}\n\nReply with ONLY the new description text.`,
                { temperature: 0.9, max_tokens: 130 },
                "Personalize gift"
            )
        ).trim();
        t && (description = t);
    } catch (e) {
        console.warn("[Craft] personalize LLM failed, using fallback", e),
            (description = `${snapshot.description} Chosen especially for ${npc.name}.${note ? ` (${note})` : ""}`);
    }
    gameState.giftInventory.items.push({
        ...snapshot,
        id: "gift_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        description,
        quantity: 1,
        addedAt: Date.now(),
        personalizedFor: npcId,
        personalizedForName: npc.name,
        personalizedNote: note || null,
        crafted: !0,
    }),
        (lastInventoryRenderHash = null),
        (lastCraftControlsHash = null),
        updateGiftInventory(),
        renderCraftControls(),
        updateUI(),
        "function" == typeof saveGame && saveGame(!1),
        showNotification(`💝 "${snapshot.name}" personalized for ${npc.name}!`, "success");
};
function updateTabContent(e) {
    switch (e) {
        case "dashboard":
            updateDashboard(), refreshDashboardSections();
            break;
        case "business":
            updateBusinessTab();
            break;
        case "upgrades":
            switchCapitalPane(capitalPane);
            break;
        case "people":
            updatePeopleTab();
            break;
        case "gifts":
            updateGiftsTab();
            break;
        case "hr":
            updateHRTab();
            break;
        case "social":
            updateSocialTab();
            break;
        case "groups":
            initializeGroupsTab();
            break;
        case "payroll":
            updatePayrollTab();
            break;
        case "invest":
            (capitalPane = "invest"), switchTab("upgrades");
            break;
        case "ceocorner":
            break;
        case "story":
            void 0 !== StoryEngine &&
                StoryEngine.updateStoryUI &&
                (StoryEngine.updateStoryUI(), StoryEngine.hideStoryNotification());
    }
}
function updateDashboard() {
    const e = $("dashCash"),
        t = $("dashCashPerSec");
    e && (e.textContent = formatNumber(Math.floor(gameState.cash))),
        t && (t.textContent = formatNumber(calculateCashPerSecond()));
    const n = $("dashLifetimeEarnings"),
        a = $("dashPrestigeLevel");
    n && (n.textContent = formatNumber(Math.floor(gameState.lifetimeEarnings || 0))),
        a && (a.textContent = gameState.prestigeLevel || 0);
    const o = $("dashEmployeeCount"),
        i = $("dashManagerCount");
    o && (o.textContent = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus).length);
    const s = gameState.products.filter((e) => e.managerHired).length;
    i && (i.textContent = s);
    const r = $("dashProductCount"),
        l = $("dashRunningProducts"),
        c = gameState.products.filter((e) => e.unlocked).length,
        d = gameState.products.filter((e) => e.running || e.managerHired).length;
    r && (r.textContent = c), l && (l.textContent = d);
    const p = $("dashRecentMessages");
    p && !p.dataset.initialized && (renderDashboardMessages(), (p.dataset.initialized = "true"));
    const m = $("dashBossProgress");
    if (m) {
        const e = Object.keys(bossFightConfig || {}).length,
            t = (gameState.bossFights?.defeated || []).length,
            n = `${t}/${e}`;
        if (m.dataset.progress !== n)
            if (((m.dataset.progress = n), 0 === e))
                m.innerHTML =
                    '<div style="text-align:center; color:var(--text-mute); padding:10px; font-style:italic;">No bosses available</div>';
            else {
                const n = Math.floor((t / e) * 100);
                m.innerHTML = `\n            <div style="margin-bottom:15px;">\n              <div style="display:flex; justify-content:space-between; margin-bottom:5px;">\n                <span style="color:var(--text-dim); font-size:0.9rem;">Progress</span>\n                <span style="color:var(--danger); font-weight:600;">${t}/${e}</span>\n              </div>\n              <div style="background:var(--surface-2); height:12px; border-radius:6px; overflow:hidden;">\n                <div style="background:linear-gradient(90deg, var(--l-red), var(--l-pink)); height:100%; width:${n}%; transition:width 0.3s;"></div>\n              </div>\n            </div>\n            ${t < e ? '<div style="color:var(--text-dim); font-size:0.85rem; text-align:center;">💪 Keep growing to challenge the next boss!</div>' : '<div style="color:var(--positive); font-size:0.85rem; text-align:center;">🎉 All bosses defeated!</div>'}\n          `;
            }
    }
    const u = $("dashLocationCount"),
        g = $("dashTotalLocations"),
        h = $("dashEfficiency"),
        y = $("dashInfluencePoints"),
        f = $("dashIncomeMultiplier"),
        b = gameState.locations.filter((e) => e.unlocked).length,
        v = gameState.locations.length;
    u && (u.textContent = b), g && (g.textContent = v);
    const w = gameState.employees.reduce((e, t) => e + (t.stats?.efficiency ?? 0), 0),
        x = 100 * gameState.employees.length,
        S = x > 0 ? Math.max(0, Math.min(100, Math.floor((w / x) * 100))) : 100;
    h && (h.textContent = S), y && (y.textContent = gameState.influencePoints || 0);
    const k = gameState.influenceUpgrades?.incomeMultiplier || 0,
        T = influenceUpgrades.incomeMultiplier.effect(k);
    f && (f.textContent = T.toFixed(1));
    const C = $("dashWeeklyPayroll"),
        E = $("dashPayrollRatio"),
        I = $("dashRecentEvents"),
        M = $("dashPayrollStatus"),
        P = getWeeklyPayroll();
    if ((C && (C.textContent = formatNumber(P)), M)) {
        const e = timeHelpers?.getDay?.() ?? new Date().getDay(),
            t = 5 === e,
            n = gameState.payroll?.delayedWeeks || 0,
            a = hasAlreadyPaidThisWeek(),
            o = gameState.cash >= P,
            i = gameState.employees.filter(
                (e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7
            ).length;
        if (0 === i) M.style.display = "none";
        else if (n > 0)
            (M.style.display = "block"),
                (M.style.background = "linear-gradient(135deg, var(--l-red) 0%, var(--l-pink) 100%)"),
                (M.style.border = "2px solid var(--l-red-4)"),
                (M.style.animation = "pulse 2s infinite"),
                (M.innerHTML = `\n          <div style="display:flex; align-items:center; gap:10px;">\n            <span style="font-size:1.5rem;">🚨</span>\n            <div>\n              <div style="font-weight:700; color:var(--l-ink);">PAYROLL OVERDUE!</div>\n              <div style="font-size:0.8rem; color:var(--l-sheen-80);">${n} week${n > 1 ? "s" : ""} unpaid • Employees unhappy • Click to pay</div>\n            </div>\n          </div>\n        `);
        else if (t && !a)
            (M.style.display = "block"),
                (M.style.background = o
                    ? "linear-gradient(135deg, var(--l-gold) 0%, var(--l-orange-3) 100%)"
                    : "linear-gradient(135deg, var(--l-red) 0%, var(--l-pink) 100%)"),
                (M.style.border = o ? "2px solid var(--accent-gold)" : "2px solid var(--danger)"),
                (M.style.animation = "pulse 2s infinite"),
                (M.innerHTML = o
                    ? `\n            <div style="display:flex; align-items:center; gap:10px;">\n              <span style="font-size:1.5rem;">💰</span>\n              <div>\n                <div style="font-weight:700; color:var(--l-on-accent);">TODAY IS PAYDAY!</div>\n                <div style="font-size:0.8rem; color:var(--l-veil-70);">$${formatNumber(P)} due • ${i} employees • Click to pay</div>\n              </div>\n            </div>\n          `
                    : `\n            <div style="display:flex; align-items:center; gap:10px;">\n              <span style="font-size:1.5rem;">⚠️</span>\n              <div>\n                <div style="font-weight:700; color:var(--l-ink);">PAYDAY - CAN'T AFFORD!</div>\n                <div style="font-size:0.8rem; color:var(--l-sheen-80);">Need $${formatNumber(P)} • Have $${formatNumber(gameState.cash)} • Click to manage</div>\n              </div>\n            </div>\n          `);
        else if (a)
            (M.style.display = "block"),
                (M.style.background = "linear-gradient(135deg, var(--l-green) 0%, var(--l-cyan) 100%)"),
                (M.style.border = "2px solid var(--positive)"),
                (M.style.animation = "none"),
                (M.innerHTML =
                    '\n          <div style="display:flex; align-items:center; gap:10px;">\n            <span style="font-size:1.2rem;">✓</span>\n            <div>\n              <div style="font-weight:600; color:var(--l-ink);">Payroll Paid This Week</div>\n            </div>\n          </div>\n        ');
        else if (o) M.style.display = "none";
        else {
            const t = (5 - e + 7) % 7 || 7;
            (M.style.display = "block"),
                (M.style.background = "linear-gradient(135deg, var(--l-orange-3) 0%, var(--l-gold) 100%)"),
                (M.style.border = "2px solid var(--l-orange-3)"),
                (M.style.animation = "none"),
                (M.innerHTML = `\n          <div style="display:flex; align-items:center; gap:10px;">\n            <span style="font-size:1.2rem;">⚠️</span>\n            <div>\n              <div style="font-weight:600; color:var(--l-on-accent);">Payroll Warning</div>\n              <div style="font-size:0.8rem; color:var(--l-veil-70);">Need $${formatNumber(P)} in ${t} day${t > 1 ? "s" : ""}</div>\n            </div>\n          </div>\n        `);
        }
    }
    const A = 60 * (parseFloat(calculateCashPerSecond()) || 0) * 60 * 24 * 7;
    if (E)
        if (A > 0) {
            const e = Math.floor((P / A) * 100);
            (E.textContent = e + "%"), (E.style.color = e < 20 ? "var(--l-green)" : e < 50 ? "var(--l-gold)" : "var(--l-red)");
        } else (E.textContent = P > 0 ? "∞%" : "0%"), (E.style.color = P > 0 ? "var(--l-red)" : "var(--l-green)");
    if (I) {
        const e = gameState.companyEvents?.history?.slice(0, 3) || [];
        0 === e.length
            ? (I.innerHTML =
                  '<div style="text-align:center; color:var(--text-mute); font-size:0.85rem; font-style:italic;">No recent events</div>')
            : (I.innerHTML = e
                  .map((e) => {
                      const t = e.isPositive ? "var(--l-green)" : "var(--l-red)";
                      return `\n            <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 8px; background:var(--surface-2); border-radius:6px; margin-bottom:4px;">\n              <span style="font-size:0.8rem; color:var(--text-dim);">${e.name}</span>\n              <span style="font-size:0.8rem; color:${t}; font-weight:600;">-$${formatNumber(e.actualCost)}</span>\n            </div>\n          `;
                  })
                  .join(""));
    }
    const N = $("dashSocialMentions");
    N && !N.dataset.initialized && (renderDashboardMentions(), (N.dataset.initialized = "true"));
    const L = $("dashTopPerformers");
    L && !L.dataset.initialized && (renderDashboardTopPerformers(), (L.dataset.initialized = "true")),
        updateNewsFeed(),
        sampleCashSpark(),
        drawCashSpark(),
        updateSolvencyChip(!0),
        renderActionCenter(),
        renderDashQuickActions();
}
(window.deleteGiftFromInventory = async function (e) {
    const i = gameState.giftInventory.items.find((t) => t.id === e);
    if (i && i.vaulted)
        return void showNotification("🔒 This gift is vaulted and protected. Unvault it first to delete.", "warning");
    (await showConfirm("Delete this gift from your inventory?", "Delete Gift", {
        type: "danger",
        confirmText: "Delete",
    })) &&
        ((gameState.giftInventory.items = gameState.giftInventory.items.filter((t) => t.id !== e)),
        updateGiftInventory(),
        showNotification("Gift deleted from inventory", "info"));
}),
    (window.toggleGiftVault = function (e) {
        const t = gameState.giftInventory.items.find((t) => t.id === e);
        t &&
            ((t.vaulted = !t.vaulted),
            (lastInventoryRenderHash = null),
            updateGiftInventory(),
            "function" == typeof renderGiftVaultGrid && renderGiftVaultGrid(),
            "function" == typeof saveGame && saveGame(!1),
            showNotification(t.vaulted ? `🔒 "${t.name}" moved to the vault — protected.` : `🔓 "${t.name}" removed from the vault.`, t.vaulted ? "success" : "info"));
    }),
    (window.updateGiftInventory = updateGiftInventory),
    (window.updateGiftStore = updateGiftStore),
    (window.showGiftPreview = showGiftPreview),
    (window.purchaseGiftFromStore = purchaseGiftFromStore);
let _cashSparkBuf = [],
    _lastSparkSample = 0;
function sampleCashSpark() {
    const e = Date.now();
    (_cashSparkBuf.length && e - _lastSparkSample < 5e3) ||
        ((_lastSparkSample = e),
        _cashSparkBuf.push(Math.max(0, gameState.cash || 0)),
        _cashSparkBuf.length > 60 && _cashSparkBuf.shift());
}
function drawCashSpark() {
    const e = $("cashSpark");
    if (!e) return;
    const t = _cashSparkBuf.length ? _cashSparkBuf : [gameState.cash || 0, gameState.cash || 0],
        n = Math.min(...t),
        a = Math.max(...t) - n || 1,
        o =
            "M" +
            t
                .map((e, o) => [240 * (1 === t.length ? 0 : o / (t.length - 1)), 36 - ((e - n) / a) * 32])
                .map((e) => e[0].toFixed(1) + " " + e[1].toFixed(1))
                .join(" L "),
        i = e.querySelector(".line"),
        s = e.querySelector(".area");
    i && i.setAttribute("d", o), s && s.setAttribute("d", o + " L 240 40 L 0 40 Z");
    const pd = document.getElementById("cashSparkDelta");
    if (pd && t.length >= 2) {
        const dv = t[t.length - 1] - t[0];
        pd.textContent = (dv >= 0 ? "+" : "") + formatCash(dv) + " vs 5m ago";
        pd.className = "tile-delta " + (dv >= 0 ? "pos" : "neg");
    }
}
let _lastSolvency = 0;
function updateSolvencyChip(e) {
    const t = Date.now();
    if (!e && t - _lastSolvency < 1e3) return;
    _lastSolvency = t;
    const n = "function" == typeof getWeeklyPayroll ? getWeeklyPayroll() : 0,
        a = gameState.cash || 0,
        o = gameState.payroll?.delayedWeeks || 0,
        i = timeHelpers?.getDay?.() ?? 5,
        s = timeHelpers?.getHour?.() ?? 0,
        r = 5 === i,
        l = "function" == typeof hasAlreadyPaidThisWeek && hasAlreadyPaidThisWeek(),
        c = a >= n;
    let d = (5 - i + 7) % 7;
    0 === d && l && (d = 7);
    const p = 24 * d - s;
    let m = "ok",
        u = "Solvent";
    0 ===
    gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7)
        .length
        ? ((m = "ok"), (u = "No payroll"))
        : (gameState.payroll?.arrears?.amount || 0) > 0
          ? ((m = "crit"), (u = `Owed $${formatNumber(gameState.payroll.arrears.amount)}`))
          : o > 0
            ? ((m = "crit"), (u = `Overdue ${o}w`))
          : r && !l
            ? ((m = c ? "warn" : "crit"), (u = c ? "Payday today" : `Short $${formatNumber(Math.max(0, n - a))}`))
            : n > 0 && !c
              ? ((m = "crit"), (u = `Short $${formatNumber(Math.max(0, n - a))}`))
              : p <= 48
                ? ((m = "warn"), (u = p <= 24 ? `Payday in ${Math.max(1, p)}h` : `Payday in ${Math.ceil(p / 24)}d`))
                : ((m = "ok"), (u = `Payday in ${Math.ceil(p / 24)}d`));
    const g = $("paydaySolvencyChip");
    if (g) {
        g.className = "solvency solvency--" + m;
        const e = $("solvencyPay");
        e && (e.textContent = u);
    }
    const h = $("solvencyRing");
    if (h) {
        const e = 604800 * (parseFloat(calculateCashPerSecond()) || 0);
        let t = e > 0 ? Math.floor((n / e) * 100) : n > 0 ? 100 : 0;
        (t = Math.max(0, Math.min(100, t))),
            h.style.setProperty("--p", t),
            h.style.setProperty(
                "--gc",
                "crit" === m ? "var(--danger)" : "warn" === m ? "var(--warning)" : "var(--positive)"
            );
    }
}
function buildActionQueue() {
    const e = [],
        t = "function" == typeof getWeeklyPayroll ? getWeeklyPayroll() : 0,
        n = gameState.payroll?.delayedWeeks || 0,
        a = 5 === (timeHelpers?.getDay?.() ?? 5),
        o = "function" == typeof hasAlreadyPaidThisWeek && hasAlreadyPaidThisWeek(),
        i = gameState.cash || 0,
        s = i >= t,
        r = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus);
    n > 0
        ? e.push({
              sev: "crit",
              icon: "🚨",
              title: `Payroll overdue ${n}w`,
              meta: `$${formatNumber(t)} unpaid · morale dropping daily`,
              btn: "Pay",
              act: "switchTab('payroll')",
          })
        : a &&
          !o &&
          t > 0 &&
          e.push({
              sev: s ? "warn" : "crit",
              icon: "💸",
              title: s ? "Payday today" : "Payday — can't afford",
              meta: `$${formatNumber(t)} due` + (s ? "" : ` · have $${formatNumber(Math.floor(i))}`),
              btn: "Pay",
              act: "switchTab('payroll')",
          });
    const l = gameState.raiseRequests || [];
    if (l.length) {
        const t = l[0];
        e.push({
            sev: "warn",
            icon: "📈",
            title: `${l.length} raise request${l.length > 1 ? "s" : ""}`,
            meta:
                1 === l.length
                    ? `${t.employeeName} wants +${t.raisePercent}%`
                    : `${t.employeeName} +${t.raisePercent}% · +${l.length - 1} more`,
            btn: "Review",
            act: "switchTab('payroll')",
        });
    }
    if (void 0 !== StoryEngine && StoryEngine.getMinorEventCount) {
        const t = StoryEngine.getMinorEventCount() || 0;
        t > 0 &&
            e.push({
                sev: "info",
                icon: "📖",
                title: `${t} story beat${t > 1 ? "s" : ""} pending`,
                meta: "New developments await your decision",
                btn: "Open",
                act: "openEventPanel()",
            });
    }
    const c = r.filter((e) => (e.unreadMessages || 0) > 0);
    if (c.length) {
        const t = c.filter((e) => e.isFavorite),
            n = t[0] || c[0],
            a = c.reduce((e, t) => e + (t.unreadMessages || 0), 0);
        e.push({
            sev: "info",
            icon: "💬",
            title: t.length ? `VIP message · ${n.name}` : `${a} unread message${a > 1 ? "s" : ""}`,
            meta: t.length
                ? `${n.name} is waiting on a reply`
                : `from ${c.length} ${c.length > 1 ? "people" : "person"}`,
            btn: "Reply",
            act: `openChat('${n.id}')`,
        });
    }
    return e;
}
function renderActionCenter() {
    const e = $("actionCenterList");
    if (!e) return;
    const t = buildActionQueue(),
        n = t.map((e) => e.sev + e.title + e.meta).join("|");
    if (e.dataset.sig === n) return;
    e.dataset.sig = n;
    const a = $("actionCenterCount");
    a && (a.textContent = t.length ? `${t.length} open` : "all clear"),
        t.length
            ? (e.innerHTML = t
                  .map(
                      (e) =>
                          `\n      <div class="trow">\n        <div class="sig sig--${e.sev}">${e.icon}</div>\n        <div class="body"><div class="ttl">${e.title}<span class="sev sev--${e.sev}">${e.sev}</span></div><div class="meta">${e.meta}</div></div>\n        <button class="go" onclick="${e.act}">${e.btn}</button>\n      </div>`
                  )
                  .join(""))
            : (e.innerHTML = '<div class="ac-empty">✓ All clear — nothing needs you right now.</div>');
}
function renderDashQuickActions() {
    const e = $("dashQuickActions");
    if (!e) return;
    const t = [],
        n = "function" == typeof getWeeklyPayroll ? getWeeklyPayroll() : 0,
        a = gameState.payroll?.delayedWeeks || 0,
        o = timeHelpers?.getDay?.() ?? 5,
        i = "function" == typeof hasAlreadyPaidThisWeek && hasAlreadyPaidThisWeek();
    (a > 0 || (5 === o && !i && n > 0)) &&
        t.push({
            ic: "💸",
            t: "Compensation Run",
            s: `$${formatNumber(n)} ${a > 0 ? "overdue" : "due"}`,
            btn: "Pay now",
            cls: "btn--danger",
            act: "switchTab('payroll')",
        });
    const s = gameState.employees.filter(
        (e) => e.hired && "active" === e.employmentStatus && (e.unreadMessages || 0) > 0
    );
    if (s.length) {
        const e = s.find((e) => e.isFavorite) || s[0];
        t.push({
            ic: "✉️",
            t: `Reply · ${e.name}`,
            s: `${e.unreadMessages} unread`,
            btn: "Reply",
            cls: "btn--ghost",
            act: `openChat('${e.id}')`,
        });
    }
    const r = gameState.products.find((e) => e.unlocked && !e.managerHired && !e.running);
    r &&
        t.push({
            ic: "🏭",
            t: `${r.name || r.id || "A product"} is idle`,
            s: "Assign a manager for passive income",
            btn: "Boost",
            cls: "btn--primary",
            act: "switchTab('business')",
        }),
        t.length ||
            t.push({
                ic: "📈",
                t: "Grow the empire",
                s: "Buy upgrades to raise income",
                btn: "Upgrades",
                cls: "btn--ghost",
                act: "switchTab('upgrades')",
            });
    const l = t.map((e) => e.t + e.s).join("|");
    e.dataset.sig !== l &&
        ((e.dataset.sig = l),
        (e.innerHTML = t
            .map(
                (e) =>
                    `\n      <div class="qa-card">\n        <div class="ic">${e.ic}</div>\n        <div class="qt"><b>${e.t}</b><span>${e.s}</span></div>\n        <button class="btn ${e.cls}" onclick="${e.act}">${e.btn}</button>\n      </div>`
            )
            .join("")));
}
function renderDashboardMessages() {
    const e = $("dashRecentMessages");
    if (!e) return;
    const t = [];
    gameState.employees.forEach((e) => {
        const n = gameState.chatHistory[e.id] || [],
            a = e.unreadMessages || 0;
        if (n.length > 0) {
            const o = n[n.length - 1];
            t.push({ employee: e, message: o, unreadCount: a, timestamp: o.timestamp || Date.now() });
        }
    }),
        t.sort((e, t) => t.timestamp - e.timestamp),
        0 === t.length
            ? (e.innerHTML =
                  '<div style="text-align:center; color:var(--text-mute); padding:20px; font-style:italic;">No messages yet. Start chatting with employees!</div>')
            : (e.innerHTML = t
                  .slice(0, 5)
                  .map((e) => {
                      const t = getTimeAgo(e.timestamp),
                          n = e.message.content.substring(0, 80) + (e.message.content.length > 80 ? "..." : ""),
                          a =
                              e.unreadCount > 0
                                  ? `<span style="background:var(--l-red); color:var(--l-ink-on-fill); padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:600;">${e.unreadCount}</span>`
                                  : "";
                      return `\n          <div onclick="openChat('${e.employee.id}')" style="background:var(--surface-2); padding:12px; border-radius:8px; margin-bottom:10px; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='var(--l-panel-2)'" onmouseleave="this.style.background='var(--l-line)'">\n            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">\n              <div style="font-weight:600; color:var(--accent);">${e.employee.name}</div>\n              <div style="display:flex; align-items:center; gap:8px;">\n                ${a}\n                <div style="font-size:0.75rem; color:var(--text-mute);">${t}</div>\n              </div>\n            </div>\n            <div style="color:var(--text-dim); font-size:0.85rem;">${n}</div>\n          </div>\n        `;
                  })
                  .join(""));
}
function renderDashboardMentions() {
    const e = $("dashSocialMentions");
    if (!e) return;
    const t = (gameState.socialFeed || [])
        .filter((e) => e.content && e.content.toLowerCase().includes("@theboss"))
        .sort((e, t) => t.timestamp - e.timestamp);
    0 === t.length
        ? (e.innerHTML =
              '<div style="text-align:center; color:var(--text-mute); padding:20px; font-style:italic;">No mentions yet. Engage with employees!</div>')
        : (e.innerHTML = t
              .slice(0, 3)
              .map((e) => {
                  const t = gameState.employees.find((t) => t.id === e.authorId);
                  if (!t) return "";
                  const n = getTimeAgo(e.timestamp),
                      a = e.content.substring(0, 100) + (e.content.length > 100 ? "..." : "");
                  return `\n          <div onclick="switchTab('social')" style="background:var(--surface-2); padding:12px; border-radius:8px; margin-bottom:10px; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='var(--l-panel-2)'" onmouseleave="this.style.background='var(--l-line)'">\n            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">\n              <div style="font-weight:600; color:var(--l-pink);">${t.name}</div>\n              <div style="font-size:0.75rem; color:var(--text-mute);">${n}</div>\n            </div>\n            <div style="color:var(--text-dim); font-size:0.85rem;">${a}</div>\n            <div style="color:var(--danger); font-size:0.75rem; margin-top:5px;">💕 ${e.likes?.length || 0} likes • 💬 ${e.comments?.length || 0} comments</div>\n          </div>\n        `;
              })
              .filter((e) => e)
              .join(""));
}
function renderDashboardTopPerformers() {
    const e = $("dashTopPerformers");
    if (!e) return;
    const t = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus);
    if (0 === t.length)
        e.innerHTML =
            '<div style="text-align:center; color:var(--text-mute); padding:20px; font-style:italic;">No employees yet</div>';
    else {
        const n = t
            .map((e) => {
                const t = calculateEmployeePerformance(e);
                return { employee: e, score: t.score, grade: t.grade, breakdown: t.breakdown };
            })
            .sort((e, t) => t.score - e.score);
        (e.innerHTML = n
            .slice(0, 3)
            .map((e, t) => {
                const n = e.employee,
                    a = ["🥇", "🥈", "🥉"][t] || "🏅",
                    o = e.grade,
                    i = e.breakdown,
                    s = [
                        "📊 Performance Breakdown:",
                        `• Productivity: +${i.productivity} pts`,
                        `• Tenure: +${i.tenure} pts`,
                        `• Career Level: +${i.careerLevel} pts`,
                        `• Management: +${i.management} pts`,
                        `• Relationship: +${i.relationship} pts`,
                        `• Skills: +${i.skills} pts`,
                    ];
                i.activityPenalty < 0 && s.push(`• Inactivity: ${i.activityPenalty} pts`);
                const r = s.join("&#10;");
                return `\n          <div onclick="showEmployeeProfile('${n.id}')" title="${r}" style="background:var(--surface-2); padding:12px; border-radius:8px; margin-bottom:8px; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='var(--l-panel-2)'" onmouseleave="this.style.background='var(--l-line)'">\n            <div style="display:flex; justify-content:space-between; align-items:center;">\n              <div style="display:flex; align-items:center; gap:10px;">\n                <div style="font-size:1.5rem;">${a}</div>\n                <div>\n                  <div style="font-weight:600;">${getColoredName(n)}</div>\n                  <div style="color:var(--text-mute); font-size:0.8rem;">${n.career?.title || "Staff"} • ${n.productManaged || "Unassigned"}</div>\n                </div>\n              </div>\n              <div style="text-align:right;">\n                <div style="display:flex; align-items:center; gap:6px; justify-content:flex-end;">\n                  <span style="background:${fuocAlpha(o.color, "22")}; color:${o.color}; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:0.85rem;">${o.letter}</span>\n                  <span style="color:${o.color}; font-weight:600; font-size:0.9rem;">${Math.floor(e.score)} pts</span>\n                </div>\n                <div style="color:var(--text-mute); font-size:0.75rem;">${o.label}</div>\n              </div>\n            </div>\n          </div>\n        `;
            })
            .join("")),
            n.length > 3 &&
                (e.innerHTML += `\n          <div onclick="switchTab('people')" style="text-align:center; padding:8px; color:var(--accent); cursor:pointer; font-size:0.85rem; transition:color 0.2s;" onmouseenter="this.style.color='var(--l-green)'" onmouseleave="this.style.color='var(--l-cyan)'">\n            View All ${n.length} Employees →\n          </div>\n        `);
    }
}
function refreshDashboardSections() {
    const e = $("dashRecentMessages"),
        t = $("dashSocialMentions"),
        n = $("dashTopPerformers");
    e && ((e.dataset.initialized = ""), renderDashboardMessages(), (e.dataset.initialized = "true")),
        t && ((t.dataset.initialized = ""), renderDashboardMentions(), (t.dataset.initialized = "true")),
        n && ((n.dataset.initialized = ""), renderDashboardTopPerformers(), (n.dataset.initialized = "true"));
}
function getTimeAgo(e) {
    const t = (gameState.time?.currentTime || Date.now()) - e,
        n = Math.floor(t / 1e3),
        a = Math.floor(n / 60),
        o = Math.floor(a / 60),
        i = Math.floor(o / 24);
    return i > 0 ? `${i}d ago` : o > 0 ? `${o}h ago` : a > 0 ? `${a}m ago` : "Just now";
}
