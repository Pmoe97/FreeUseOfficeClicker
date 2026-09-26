// ============================================================================
// 31-dashboard — Dashboard: updateTabContent, updateDashboard, cash spark, action center, recent messages, top performers.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function updateTabContent(e) {
  switch (e) {
    case "dashboard":
      updateDashboard(), sd();
      break;
    case "business":
      updateBusinessTab();
      break;
    case "upgrades":
      switchCapitalPane(ku);
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
      Wp();
      break;
    case "payroll":
      updatePayrollTab();
      break;
    case "invest":
      ku = "invest", switchTab("upgrades");
      break;
    case "ceocorner":
      break;
    case "story":
      void 0 !== StoryEngine && StoryEngine.updateStoryUI && (StoryEngine.updateStoryUI(), StoryEngine.hideStoryNotification());
  }
}
function updateDashboard() {
  const e = $("dashCash"), t = $("dashCashPerSec");
  e && (e.textContent = wu(Math.floor(gameState.cash))), t && (t.textContent = wu(calculateCashPerSecond()));
  const n = $("dashLifetimeEarnings"), a = $("dashPrestigeLevel");
  n && (n.textContent = wu(Math.floor(gameState.lifetimeEarnings || 0))), a && (a.textContent = gameState.prestigeLevel || 0);
  const o = $("dashEmployeeCount"), i = $("dashManagerCount");
  o && (o.textContent = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus).length);
  const s = gameState.products.filter((e2) => e2.managerHired).length;
  i && (i.textContent = s);
  const r = $("dashProductCount"), l = $("dashRunningProducts"), c = gameState.products.filter((e2) => e2.unlocked).length, d = gameState.products.filter((e2) => e2.running || e2.managerHired).length;
  r && (r.textContent = c), l && (l.textContent = d);
  const p = $("dashRecentMessages");
  p && !p.dataset.initialized && (ed(), p.dataset.initialized = "true");
  const m = $("dashBossProgress");
  if (m) {
    const e2 = Object.keys(Fe || {}).length, t2 = (gameState.bossFights?.defeated || []).length, n2 = `${t2}/${e2}`;
    if (m.dataset.progress !== n2) if (m.dataset.progress = n2, 0 === e2) m.innerHTML = '<div style="text-align:center; color:var(--e); padding:10px; font-style:italic;">No bosses available</div>';
    else {
      const n3 = Math.floor(t2 / e2 * 100);
      m.innerHTML = ` <div style="margin-bottom:15px;"> <div style="display:flex; justify-content:space-between; margin-bottom:5px;"> <span style="color:var(--a); font-size:0.9rem;">Progress</span> <span style="color:var(--k); font-weight:600;">${t2}/${e2}</span> </div> <div style="background:var(--f); height:12px; border-radius:6px; overflow:hidden;"> <div style="background:linear-gradient(90deg, var(--l), var(--v)); height:100%; width:${n3}%; transition:width 0.3s;"></div> </div> </div> ${t2 < e2 ? '<div style="color:var(--a); font-size:0.85rem; text-align:center;">\u{1F4AA} Keep growing to challenge the next boss!</div>' : '<div style="color:var(--g); font-size:0.85rem; text-align:center;">\u{1F389} All bosses defeated!</div>'}
          `;
    }
  }
  const u2 = $("dashLocationCount"), g = $("dashTotalLocations"), h = $("dashEfficiency"), y = $("dashInfluencePoints"), f = $("dashIncomeMultiplier"), b = gameState.locations.filter((e2) => e2.unlocked).length, v = gameState.locations.length;
  u2 && (u2.textContent = b), g && (g.textContent = v);
  const w = gameState.employees.reduce((e2, t2) => e2 + (t2.stats?.efficiency ?? 0), 0), x = 100 * gameState.employees.length, S = x > 0 ? Math.max(0, Math.min(100, Math.floor(w / x * 100))) : 100;
  h && (h.textContent = S), y && (y.textContent = gameState.influencePoints || 0);
  const k = gameState.influenceUpgrades?.incomeMultiplier || 0, T = Cb.incomeMultiplier.effect(k);
  f && (f.textContent = T.toFixed(1));
  const C = $("dashWeeklyPayroll"), E = $("dashPayrollRatio"), I = $("dashRecentEvents"), M = $("dashPayrollStatus"), P = getWeeklyPayroll();
  if (C && (C.textContent = wu(P)), M) {
    const e2 = pe?.getDay?.() ?? (/* @__PURE__ */ new Date()).getDay(), t2 = 5 === e2, n2 = gameState.payroll?.delayedWeeks || 0, a2 = dn(), o2 = gameState.cash >= P, i2 = gameState.employees.filter((e3) => e3.hired && "active" === e3.employmentStatus && (e3.career?.level || 1) < 7).length;
    if (0 === i2) M.style.display = "none";
    else if (n2 > 0) M.style.display = "block", M.style.background = "linear-gradient(135deg, var(--l) 0%, var(--v) 100%)", M.style.border = "2px solid var(--ei)", M.style.animation = "pulse 2s infinite", M.innerHTML = ` <div style="display:flex; align-items:center; gap:10px;"> <span style="font-size:1.5rem;">\u{1F6A8}</span> <div> <div style="font-weight:700; color:var(--b);">PAYROLL OVERDUE!</div> <div style="font-size:0.8rem; color:var(--ej);">${n2} week${n2 > 1 ? "s" : ""} unpaid \u2022 Employees unhappy \u2022 Click to pay</div> </div> </div> `;
    else if (t2 && !a2) M.style.display = "block", M.style.background = o2 ? "linear-gradient(135deg, var(--z) 0%, var(--db) 100%)" : "linear-gradient(135deg, var(--l) 0%, var(--v) 100%)", M.style.border = o2 ? "2px solid var(--m)" : "2px solid var(--k)", M.style.animation = "pulse 2s infinite", M.innerHTML = o2 ? ` <div style="display:flex; align-items:center; gap:10px;"> <span style="font-size:1.5rem;">\u{1F4B0}</span> <div> <div style="font-weight:700; color:var(--q);">TODAY IS PAYDAY!</div> <div style="font-size:0.8rem; color:var(--bp);">$${wu(P)} due \u2022 ${i2} employees \u2022 Click to pay</div> </div> </div> ` : ` <div style="display:flex; align-items:center; gap:10px;"> <span style="font-size:1.5rem;">\u26A0\uFE0F</span> <div> <div style="font-weight:700; color:var(--b);">PAYDAY - CAN'T AFFORD!</div> <div style="font-size:0.8rem; color:var(--ej);">Need $${wu(P)} \u2022 Have $${wu(gameState.cash)} \u2022 Click to manage</div> </div> </div> `;
    else if (a2) M.style.display = "block", M.style.background = "linear-gradient(135deg, var(--n) 0%, var(--u) 100%)", M.style.border = "2px solid var(--g)", M.style.animation = "none", M.innerHTML = ' <div style="display:flex; align-items:center; gap:10px;"> <span style="font-size:1.2rem;">\u2713</span> <div> <div style="font-weight:600; color:var(--b);">Payroll Paid This Week</div> </div> </div> ';
    else if (o2) M.style.display = "none";
    else {
      const t3 = (5 - e2 + 7) % 7 || 7;
      M.style.display = "block", M.style.background = "linear-gradient(135deg, var(--db) 0%, var(--z) 100%)", M.style.border = "2px solid var(--db)", M.style.animation = "none", M.innerHTML = ` <div style="display:flex; align-items:center; gap:10px;"> <span style="font-size:1.2rem;">\u26A0\uFE0F</span> <div> <div style="font-weight:600; color:var(--q);">Payroll Warning</div> <div style="font-size:0.8rem; color:var(--bp);">Need $${wu(P)} in ${t3} day${t3 > 1 ? "s" : ""}</div> </div> </div> `;
    }
  }
  const A = 60 * (parseFloat(calculateCashPerSecond()) || 0) * 60 * 24 * 7;
  if (E) if (A > 0) {
    const e2 = Math.floor(P / A * 100);
    E.textContent = e2 + "%", E.style.color = e2 < 20 ? "var(--n)" : e2 < 50 ? "var(--z)" : "var(--l)";
  } else E.textContent = P > 0 ? "\u221E%" : "0%", E.style.color = P > 0 ? "var(--l)" : "var(--n)";
  if (I) {
    const e2 = gameState.companyEvents?.history?.slice(0, 3) || [];
    0 === e2.length ? I.innerHTML = '<div style="text-align:center; color:var(--e); font-size:0.85rem; font-style:italic;">No recent events</div>' : I.innerHTML = e2.map((e3) => {
      const t2 = e3.isPositive ? "var(--n)" : "var(--l)";
      return ` <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 8px; background:var(--f); border-radius:6px; margin-bottom:4px;"> <span style="font-size:0.8rem; color:var(--a);">${e3.name}</span> <span style="font-size:0.8rem; color:${t2}; font-weight:600;">-$${wu(e3.actualCost)}</span> </div> `;
    }).join("");
  }
  const N = $("dashSocialMentions");
  N && !N.dataset.initialized && (od(), N.dataset.initialized = "true");
  const L = $("dashTopPerformers");
  L && !L.dataset.initialized && (rd(), L.dataset.initialized = "true"), updateNewsFeed(), Wc(), Vc(), Jc(true), Xc(), Zc();
}
window.updateCraftCombineInfo = function() {
  const info = $("craftCombineInfo");
  if (!info) return;
  const u2 = gameState.giftInventory?.items.find((i) => i.id === $("craftCombineA")?.value), G2 = gameState.giftInventory?.items.find((i) => i.id === $("craftCombineB")?.value);
  if (!u2 || !G2) return void (info.textContent = "Pick two gifts to see the result.");
  const fee = Math.max(50, Math.round(0.25 * ((u2.price || 0) + (G2.price || 0)))), cat = zc(u2.category) >= zc(G2.category) ? u2.category : G2.category, price = (u2.price || 0) + (G2.price || 0) + fee;
  info.innerHTML = `Result: <span class="text-accent">${ye[cat]?.name || cat}</span> \xB7 value <span class="num text-pos">$${price.toLocaleString()}</span> \xB7 fee <span class="num text-neg">$${fee.toLocaleString()}</span>`;
}, window.updateCraftPersInfo = function() {
  const info = $("craftPersInfo");
  if (!info) return;
  const it = gameState.giftInventory?.items.find((i) => i.id === $("craftPersGift")?.value), npc = gameState.employees?.find((e) => e.id === $("craftPersNpc")?.value);
  if (!it || !npc) return void (info.textContent = "Pick a gift and a person.");
  const fee = Math.max(50, Math.round(0.3 * (it.price || 0))), u2 = qr(npc, it);
  info.innerHTML = `${npc.name} now <span class="chip ${u2.cls}"><span>${u2.emoji}</span><span class="lbl">${u2.label}</span></span> \u2192 after <span class="chip chip--buff"><span>\u{1F49D}</span><span class="lbl">Personalized</span></span> \xB7 fee <span class="num text-neg">$${fee.toLocaleString()}</span>`;
}, window.craftCombineGifts = async function() {
  const a = $("craftCombineA")?.value, b = $("craftCombineB")?.value;
  if (!a || !b) return void showNotification("Pick two gifts to combine.", "warning");
  if (a === b) {
    const it = gameState.giftInventory.items.find((i) => i.id === a);
    if (!it || (it.quantity || 1) < 2) return void showNotification("Pick two different gifts (or a stack of 2+).", "warning");
  }
  const u2 = gameState.giftInventory.items.find((i) => i.id === a), G2 = gameState.giftInventory.items.find((i) => i.id === b);
  if (!u2 || !G2) return void showNotification("Gift not found.", "error");
  if (u2.vaulted || G2.vaulted) return void showNotification("\u{1F512} Vaulted gifts can't be crafted. Unvault first.", "warning");
  const fee = Math.max(50, Math.round(0.25 * ((u2.price || 0) + (G2.price || 0))));
  if (gameState.cash < fee) return void showNotification(`Need a $${fee.toLocaleString()} crafting fee.`, "error");
  if (!await Ev(`Combine "${u2.name}" + "${G2.name}" into one higher-tier gift for a $${fee.toLocaleString()} crafting fee? Both inputs are consumed.`, "Combine Gifts", { confirmText: "Combine" })) return;
  const cat = zc(u2.category) >= zc(G2.category) ? u2.category : G2.category, price = (u2.price || 0) + (G2.price || 0) + fee, U2 = u2.name, J2 = G2.name, ee2 = u2.description, te2 = G2.description;
  Lr(a, 1), Lr(b, 1), gameState.cash -= fee, showNotification("\u{1F6E0}\uFE0F Crafting your combined gift\u2026", "info");
  let name = `${U2} \xD7 ${J2}`, description = `A bespoke creation combining ${U2} and ${J2}.`;
  try {
    const raw = extractText(await queuedGenerateText(`Combine these two gifts into ONE cohesive, higher-end gift. Invent a single product name and a 2-sentence description.

Gift A: ${U2} \u2014 ${ee2}
Gift B: ${J2} \u2014 ${te2}

Reply as JSON only: {"name":"...","description":"..."}`, { temperature: 0.9, max_tokens: 160 }, "Combine gifts")), m = raw.match(/\{[\s\S]*\}/), j = JSON.parse(m ? m[0] : raw);
    j.name && (name = j.name), j.description && (description = j.description);
  } catch (u3) {
    console.warn("[Craft] combine LLM failed, using fallback name/description", u3);
  }
  gameState.giftInventory.items.push({ id: "gift_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6), name, category: cat, price, description, imagePrompt: name, timesGiven: 0, quantity: 1, addedAt: Date.now(), crafted: true }), Pc = null, Gc = null, updateGiftInventory(), Hc(), updateUI(), "function" == typeof saveGame && saveGame(false), showNotification(`\u2728 Crafted "${name}"!`, "success");
}, window.craftPersonalizeGift = async function() {
  const u2 = $("craftPersGift")?.value, G2 = $("craftPersNpc")?.value, note = ($("craftPersNote")?.value || "").trim();
  if (!u2 || !G2) return void showNotification("Pick a gift and a recipient.", "warning");
  const it = gameState.giftInventory.items.find((i) => i.id === u2), npc = gameState.employees.find((e) => e.id === G2);
  if (!it || !npc) return void showNotification("Gift or person not found.", "error");
  if (it.vaulted) return void showNotification("\u{1F512} Unvault this gift before personalizing.", "warning");
  const fee = Math.max(50, Math.round(0.3 * (it.price || 0)));
  if (gameState.cash < fee) return void showNotification(`Need $${fee.toLocaleString()} to personalize.`, "error");
  if (!await Ev(`Personalize "${it.name}" for ${npc.name} for a $${fee.toLocaleString()} fee? It will delight them specifically.`, "Personalize Gift", { confirmText: "Personalize" })) return;
  const snapshot = { ...it };
  Lr(u2, 1), gameState.cash -= fee, showNotification("\u{1F49D} Adding a personal touch\u2026", "info");
  let description = snapshot.description;
  try {
    const t = extractText(await queuedGenerateText(`Rewrite this gift's description (2 sentences) so it feels personally chosen for ${npc.name}${note ? `, weaving in: "${note}"` : ""}. Keep what the item fundamentally is.

Item: ${snapshot.name}
Current: ${snapshot.description}

Reply with ONLY the new description text.`, { temperature: 0.9, max_tokens: 130 }, "Personalize gift")).trim();
    t && (description = t);
  } catch (u3) {
    console.warn("[Craft] personalize LLM failed, using fallback", u3), description = `${snapshot.description} Chosen especially for ${npc.name}.${note ? ` (${note})` : ""}`;
  }
  gameState.giftInventory.items.push({ ...snapshot, id: "gift_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6), description, quantity: 1, addedAt: Date.now(), personalizedFor: G2, personalizedForName: npc.name, personalizedNote: note || null, crafted: true }), Pc = null, Gc = null, updateGiftInventory(), Hc(), updateUI(), "function" == typeof saveGame && saveGame(false), showNotification(`\u{1F49D} "${snapshot.name}" personalized for ${npc.name}!`, "success");
}, window.deleteGiftFromInventory = async function(e) {
  const i = gameState.giftInventory.items.find((t) => t.id === e);
  i && i.vaulted ? showNotification("\u{1F512} This gift is vaulted and protected. Unvault it first to delete.", "warning") : await Ev("Delete this gift from your inventory?", "Delete Gift", { type: "danger", confirmText: "Delete" }) && (gameState.giftInventory.items = gameState.giftInventory.items.filter((t) => t.id !== e), updateGiftInventory(), showNotification("Gift deleted from inventory", "info"));
}, window.toggleGiftVault = function(e) {
  const t = gameState.giftInventory.items.find((t2) => t2.id === e);
  t && (t.vaulted = !t.vaulted, Pc = null, updateGiftInventory(), "function" == typeof Fc && Fc(), "function" == typeof saveGame && saveGame(false), showNotification(t.vaulted ? `\u{1F512} "${t.name}" moved to the vault \u2014 protected.` : `\u{1F513} "${t.name}" removed from the vault.`, t.vaulted ? "success" : "info"));
}, window.updateGiftInventory = updateGiftInventory, window.updateGiftStore = updateGiftStore, window.showGiftPreview = showGiftPreview, window.purchaseGiftFromStore = purchaseGiftFromStore;
let Uc = [], Yc = 0;
function Wc() {
  const e = Date.now();
  Uc.length && e - Yc < 5e3 || (Yc = e, Uc.push(Math.max(0, gameState.cash || 0)), Uc.length > 60 && Uc.shift());
}
function Vc() {
  const e = $("cashSpark");
  if (!e) return;
  const t = Uc.length ? Uc : [gameState.cash || 0, gameState.cash || 0], n = Math.min(...t), a = Math.max(...t) - n || 1, o = "M" + t.map((e2, o2) => [240 * (1 === t.length ? 0 : o2 / (t.length - 1)), 36 - (e2 - n) / a * 32]).map((e2) => e2[0].toFixed(1) + " " + e2[1].toFixed(1)).join(" L "), i = e.querySelector(".line"), s = e.querySelector(".area");
  i && i.setAttribute("d", o), s && s.setAttribute("d", o + " L 240 40 L 0 40 Z");
  const u2 = document.getElementById("cashSparkDelta");
  if (u2 && t.length >= 2) {
    const G2 = t[t.length - 1] - t[0];
    u2.textContent = (G2 >= 0 ? "+" : "") + xu(G2) + " vs 5m ago", u2.className = "tile-delta " + (G2 >= 0 ? "pos" : "neg");
  }
}
let Kc = 0;
function Jc(e) {
  const t = Date.now();
  if (!e && t - Kc < 1e3) return;
  Kc = t;
  const n = "function" == typeof getWeeklyPayroll ? getWeeklyPayroll() : 0, a = gameState.cash || 0, o = gameState.payroll?.delayedWeeks || 0, i = pe?.getDay?.() ?? 5, s = pe?.getHour?.() ?? 0, r = 5 === i, l = "function" == typeof dn && dn(), c = a >= n;
  let d = (5 - i + 7) % 7;
  0 === d && l && (d = 7);
  const p = 24 * d - s;
  let m = "ok", u2 = "Solvent";
  0 === gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.career?.level || 1) < 7).length ? (m = "ok", u2 = "No payroll") : (gameState.payroll?.arrears?.amount || 0) > 0 ? (m = "crit", u2 = `Owed $${wu(gameState.payroll.arrears.amount)}`) : o > 0 ? (m = "crit", u2 = `Overdue ${o}w`) : r && !l ? (m = c ? "warn" : "crit", u2 = c ? "Payday today" : `Short $${wu(Math.max(0, n - a))}`) : n > 0 && !c ? (m = "crit", u2 = `Short $${wu(Math.max(0, n - a))}`) : p <= 48 ? (m = "warn", u2 = p <= 24 ? `Payday in ${Math.max(1, p)}h` : `Payday in ${Math.ceil(p / 24)}d`) : (m = "ok", u2 = `Payday in ${Math.ceil(p / 24)}d`);
  const g = $("paydaySolvencyChip");
  if (g) {
    g.className = "solvency solvency--" + m;
    const e2 = $("solvencyPay");
    e2 && (e2.textContent = u2);
  }
  const h = $("solvencyRing");
  if (h) {
    const e2 = 604800 * (parseFloat(calculateCashPerSecond()) || 0);
    let t2 = e2 > 0 ? Math.floor(n / e2 * 100) : n > 0 ? 100 : 0;
    t2 = Math.max(0, Math.min(100, t2)), h.style.setProperty("--p", t2), h.style.setProperty("--gc", "crit" === m ? "var(--k)" : "warn" === m ? "var(--cj)" : "var(--g)");
  }
}
function Qc() {
  const e = [], t = "function" == typeof getWeeklyPayroll ? getWeeklyPayroll() : 0, n = gameState.payroll?.delayedWeeks || 0, a = 5 === (pe?.getDay?.() ?? 5), o = "function" == typeof dn && dn(), i = gameState.cash || 0, s = i >= t, r = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus);
  n > 0 ? e.push({ sev: "crit", icon: "\u{1F6A8}", title: `Payroll overdue ${n}w`, meta: `$${wu(t)} unpaid \xB7 morale dropping daily`, btn: "Pay", act: "switchTab('payroll')" }) : a && !o && t > 0 && e.push({ sev: s ? "warn" : "crit", icon: "\u{1F4B8}", title: s ? "Payday today" : "Payday \u2014 can't afford", meta: `$${wu(t)} due` + (s ? "" : ` \xB7 have $${wu(Math.floor(i))}`), btn: "Pay", act: "switchTab('payroll')" });
  const l = gameState.raiseRequests || [];
  if (l.length) {
    const t2 = l[0];
    e.push({ sev: "warn", icon: "\u{1F4C8}", title: `${l.length} raise request${l.length > 1 ? "s" : ""}`, meta: 1 === l.length ? `${t2.employeeName} wants +${t2.raisePercent}%` : `${t2.employeeName} +${t2.raisePercent}% \xB7 +${l.length - 1} more`, btn: "Review", act: "switchTab('payroll')" });
  }
  if (void 0 !== StoryEngine && StoryEngine.getMinorEventCount) {
    const t2 = StoryEngine.getMinorEventCount() || 0;
    t2 > 0 && e.push({ sev: "info", icon: "\u{1F4D6}", title: `${t2} story beat${t2 > 1 ? "s" : ""} pending`, meta: "New developments await your decision", btn: "Open", act: "openEventPanel()" });
  }
  const c = r.filter((e2) => (e2.unreadMessages || 0) > 0);
  if (c.length) {
    const t2 = c.filter((e2) => e2.isFavorite), n2 = t2[0] || c[0], a2 = c.reduce((e2, t3) => e2 + (t3.unreadMessages || 0), 0);
    e.push({ sev: "info", icon: "\u{1F4AC}", title: t2.length ? `VIP message \xB7 ${n2.name}` : `${a2} unread message${a2 > 1 ? "s" : ""}`, meta: t2.length ? `${n2.name} is waiting on a reply` : `from ${c.length} ${c.length > 1 ? "people" : "person"}`, btn: "Reply", act: `openChat('${n2.id}')` });
  }
  return e;
}
function Xc() {
  const e = $("actionCenterList");
  if (!e) return;
  const t = Qc(), n = t.map((e2) => e2.sev + e2.title + e2.meta).join("|");
  if (e.dataset.sig === n) return;
  e.dataset.sig = n;
  const a = $("actionCenterCount");
  a && (a.textContent = t.length ? `${t.length} open` : "all clear"), t.length ? e.innerHTML = t.map((e2) => ` <div class="trow"> <div class="sig sig--${e2.sev}">${e2.icon}</div> <div class="body"><div class="ttl">${e2.title}<span class="sev sev--${e2.sev}">${e2.sev}</span></div><div class="meta">${e2.meta}</div></div> <button class="go" onclick="${e2.act}">${e2.btn}</button> </div>`).join("") : e.innerHTML = '<div class="ac-empty">\u2713 All clear \u2014 nothing needs you right now.</div>';
}
function Zc() {
  const e = $("dashQuickActions");
  if (!e) return;
  const t = [], n = "function" == typeof getWeeklyPayroll ? getWeeklyPayroll() : 0, a = gameState.payroll?.delayedWeeks || 0, o = pe?.getDay?.() ?? 5, i = "function" == typeof dn && dn();
  (a > 0 || 5 === o && !i && n > 0) && t.push({ ic: "\u{1F4B8}", t: "Compensation Run", s: `$${wu(n)} ${a > 0 ? "overdue" : "due"}`, btn: "Pay now", cls: "btn--k", act: "switchTab('payroll')" });
  const s = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.unreadMessages || 0) > 0);
  if (s.length) {
    const e2 = s.find((e3) => e3.isFavorite) || s[0];
    t.push({ ic: "\u2709\uFE0F", t: `Reply \xB7 ${e2.name}`, s: `${e2.unreadMessages} unread`, btn: "Reply", cls: "btn--aj", act: `openChat('${e2.id}')` });
  }
  const r = gameState.products.find((e2) => e2.unlocked && !e2.managerHired && !e2.running);
  r && t.push({ ic: "\u{1F3ED}", t: `${r.name || r.id || "A product"} is idle`, s: "Assign a manager for passive income", btn: "Boost", cls: "btn--be", act: "switchTab('business')" }), t.length || t.push({ ic: "\u{1F4C8}", t: "Grow the empire", s: "Buy upgrades to raise income", btn: "Upgrades", cls: "btn--aj", act: "switchTab('upgrades')" });
  const l = t.map((e2) => e2.t + e2.s).join("|");
  e.dataset.sig !== l && (e.dataset.sig = l, e.innerHTML = t.map((e2) => ` <div class="qa-card"> <div class="ic">${e2.ic}</div> <div class="qt"><b>${e2.t}</b><span>${e2.s}</span></div> <button class="btn ${e2.cls}" onclick="${e2.act}">${e2.btn}</button> </div>`).join(""));
}
function ed() {
  const e = $("dashRecentMessages");
  if (!e) return;
  const t = [];
  gameState.employees.forEach((e2) => {
    const n = gameState.chatHistory[e2.id] || [], a = e2.unreadMessages || 0;
    if (n.length > 0) {
      const o = n[n.length - 1];
      t.push({ employee: e2, message: o, unreadCount: a, timestamp: o.timestamp || Date.now() });
    }
  }), t.sort((e2, t2) => t2.timestamp - e2.timestamp), 0 === t.length ? e.innerHTML = '<div style="text-align:center; color:var(--e); padding:20px; font-style:italic;">No messages yet. Start chatting with employees!</div>' : e.innerHTML = t.slice(0, 5).map((e2) => {
    const t2 = ld(e2.timestamp), n = e2.message.content.substring(0, 80) + (e2.message.content.length > 80 ? "..." : ""), a = e2.unreadCount > 0 ? `<span style="background:var(--l); color:var(--s); padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:600;">${e2.unreadCount}</span>` : "";
    return ` <div onclick="openChat('${e2.employee.id}')" style="background:var(--f); padding:12px; border-radius:8px; margin-bottom:10px; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='var(--w)'" onmouseleave="this.style.background='var(--t)'"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;"> <div style="font-weight:600; color:var(--d);">${e2.employee.name}</div> <div style="display:flex; align-items:center; gap:8px;"> ${a} <div style="font-size:0.75rem; color:var(--e);">${t2}</div> </div> </div> <div style="color:var(--a); font-size:0.85rem;">${n}</div> </div> `;
  }).join("");
}
function od() {
  const e = $("dashSocialMentions");
  if (!e) return;
  const t = (gameState.socialFeed || []).filter((e2) => e2.content && e2.content.toLowerCase().includes("@theboss")).sort((e2, t2) => t2.timestamp - e2.timestamp);
  0 === t.length ? e.innerHTML = '<div style="text-align:center; color:var(--e); padding:20px; font-style:italic;">No mentions yet. Engage with employees!</div>' : e.innerHTML = t.slice(0, 3).map((e2) => {
    const t2 = gameState.employees.find((t3) => t3.id === e2.authorId);
    if (!t2) return "";
    const n = ld(e2.timestamp), a = e2.content.substring(0, 100) + (e2.content.length > 100 ? "..." : "");
    return ` <div onclick="switchTab('social')" style="background:var(--f); padding:12px; border-radius:8px; margin-bottom:10px; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='var(--w)'" onmouseleave="this.style.background='var(--t)'"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;"> <div style="font-weight:600; color:var(--v);">${t2.name}</div> <div style="font-size:0.75rem; color:var(--e);">${n}</div> </div> <div style="color:var(--a); font-size:0.85rem;">${a}</div> <div style="color:var(--k); font-size:0.75rem; margin-top:5px;">\u{1F495} ${e2.likes?.length || 0} likes \u2022 \u{1F4AC} ${e2.comments?.length || 0} comments</div> </div> `;
  }).filter((e2) => e2).join("");
}
function rd() {
  const e = $("dashTopPerformers");
  if (!e) return;
  const t = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus);
  if (0 === t.length) e.innerHTML = '<div style="text-align:center; color:var(--e); padding:20px; font-style:italic;">No employees yet</div>';
  else {
    const n = t.map((e2) => {
      const t2 = calculateEmployeePerformance(e2);
      return { employee: e2, score: t2.score, grade: t2.grade, breakdown: t2.breakdown };
    }).sort((e2, t2) => t2.score - e2.score);
    e.innerHTML = n.slice(0, 3).map((e2, t2) => {
      const n2 = e2.employee, a = ["\u{1F947}", "\u{1F948}", "\u{1F949}"][t2] || "\u{1F3C5}", o = e2.grade, i = e2.breakdown, s = ["\u{1F4CA} Performance Breakdown:", `\u2022 Productivity: +${i.productivity} pts`, `\u2022 Tenure: +${i.tenure} pts`, `\u2022 Career Level: +${i.careerLevel} pts`, `\u2022 Management: +${i.management} pts`, `\u2022 Relationship: +${i.relationship} pts`, `\u2022 Skills: +${i.skills} pts`];
      i.activityPenalty < 0 && s.push(`\u2022 Inactivity: ${i.activityPenalty} pts`);
      const r = s.join("&#10;");
      return ` <div onclick="showEmployeeProfile('${n2.id}')" title="${r}" style="background:var(--f); padding:12px; border-radius:8px; margin-bottom:8px; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='var(--w)'" onmouseleave="this.style.background='var(--t)'"> <div style="display:flex; justify-content:space-between; align-items:center;"> <div style="display:flex; align-items:center; gap:10px;"> <div style="font-size:1.5rem;">${a}</div> <div> <div style="font-weight:600;">${yl(n2)}</div> <div style="color:var(--e); font-size:0.8rem;">${n2.career?.title || "Staff"} \u2022 ${n2.productManaged || "Unassigned"}</div> </div> </div> <div style="text-align:right;"> <div style="display:flex; align-items:center; gap:6px; justify-content:flex-end;"> <span style="background:${fuocAlpha(o.color, "22")}; color:${o.color}; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:0.85rem;">${o.letter}</span> <span style="color:${o.color}; font-weight:600; font-size:0.9rem;">${Math.floor(e2.score)} pts</span> </div> <div style="color:var(--e); font-size:0.75rem;">${o.label}</div> </div> </div> </div> `;
    }).join(""), n.length > 3 && (e.innerHTML += ` <div onclick="switchTab('people')" style="text-align:center; padding:8px; color:var(--d); cursor:pointer; font-size:0.85rem; transition:color 0.2s;" onmouseenter="this.style.color='var(--n)'" onmouseleave="this.style.color='var(--u)'"> View All ${n.length} Employees \u2192 </div> `);
  }
}
function sd() {
  const e = $("dashRecentMessages"), t = $("dashSocialMentions"), n = $("dashTopPerformers");
  e && (e.dataset.initialized = "", ed(), e.dataset.initialized = "true"), t && (t.dataset.initialized = "", od(), t.dataset.initialized = "true"), n && (n.dataset.initialized = "", rd(), n.dataset.initialized = "true");
}
function ld(e) {
  const t = (gameState.time?.currentTime || Date.now()) - e, n = Math.floor(t / 1e3), a = Math.floor(n / 60), o = Math.floor(a / 60), i = Math.floor(o / 24);
  return i > 0 ? `${i}d ago` : o > 0 ? `${o}h ago` : a > 0 ? `${a}m ago` : "Just now";
}
