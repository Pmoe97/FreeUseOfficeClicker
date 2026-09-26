// ============================================================================
// 32-business — Business tab: locations, products list, progress bars, promotions, training workshops, team building, programs effects.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function updateBusinessTab() {
    const e = $("locationSubtabs");
    e &&
        ((e.innerHTML = ""),
        gameState.locations.forEach((t, n) => {
            if (isSFWMode() && t.nsfwLevel && t.nsfwLevel > 0) return;
            checkLocationUnlockable(t.id);
            const a = !t.unlocked,
                o = gameState.activeLocationId === t.id,
                i = gameState.cash >= t.cost,
                s = n > 0 ? gameState.locations[n - 1] : null,
                r = !s || s.unlocked,
                l = t.requiresPrestiges && gameState.prestigeLevel < t.requiresPrestiges,
                c = document.createElement("button");
            if (((c.className = "location-subtab biz-loc"), (c.dataset.locationId = t.id), a))
                if (l)
                    (c.classList.add("locked")),
                        (c.innerHTML = `🔒 ${t.name}<br><span style="font-size:0.8em;">Requires ${t.requiresPrestiges} Prestige</span>`),
                        (c.disabled = !0);
                else if (r)
                    if (i)
                        if (n > 0) {
                            const e = bossFightConfig[t.id];
                            if (e && gameState.bossFights.defeated.includes(e.id))
                                (c.classList.add("unlockable")),
                                    (c.innerHTML = `🔓 ${t.name}<br><span style="font-size:0.8em;">Claim Victory</span>`),
                                    (c.onclick = () => unlockLocation(t.id));
                            else {
                                const e = checkBossFightRequirements(t.id);
                                c.classList.add("boss");
                                const n = !e.canFight && e.reason && "no_boss" !== e.reason;
                                if (n) {
                                    const n =
                                        "cooldown" === e.reason
                                            ? `Cooldown: ${formatCooldownTime(e.cooldownRemaining)}`
                                            : "already_defeated" === e.reason
                                              ? "Already Defeated"
                                              : e.reason;
                                    c.innerHTML = `⚔️ ${t.name}<br><span style="font-size:0.7em; color:var(--l-x-orange);">${n}</span>`;
                                } else
                                    c.innerHTML = `⚔️ ${t.name}<br><span style="font-size:0.8em;">Boss Fight!</span>`;
                                c.onclick = async () => {
                                    n && "cooldown" === e.reason
                                        ? showNotification(
                                              `Boss fight on cooldown! ${formatCooldownTime(e.cooldownRemaining)} remaining.`,
                                              "warning"
                                          )
                                        : "already_defeated" === e.reason
                                          ? showNotification("You already defeated this boss!", "info")
                                          : startBossFight(t.id);
                                };
                            }
                        } else
                            (c.classList.add("unlockable")),
                                (c.innerHTML = `<span>🔓 ${t.name}</span><span class="sub">Unlock: ${formatNumber(t.cost)}</span>`),
                                (c.onclick = () => unlockLocation(t.id));
                    else
                        (c.classList.add("locked")),
                            (c.innerHTML = `<span>🔒 ${t.name}</span><span class="sub">Need: ${formatNumber(t.cost)}</span>`),
                            (c.disabled = !0);
                else
                    (c.classList.add("locked")),
                        (c.innerHTML = `<span>🔒 ${t.name}</span>`),
                        (c.disabled = !0);
            else {
                const e = t.nsfwLevel ? "🔞".repeat(t.nsfwLevel) : "";
                o && c.classList.add("active"),
                    (c.innerHTML = `<span>${t.name}${e ? " " + e : ""}</span>`),
                    (c.onclick = () => {
                        (gameState.activeLocationId = t.id), applyLocationTheme(t), updateBusinessTab();
                    });
            }
            e.appendChild(c);
        }));
    const t = document.getElementById("locationInfo");
    if (t) {
        const e = gameState.locations.find((e) => e.id === gameState.activeLocationId);
        if (e && e.unlocked && e.theme) {
            const n = e.nsfwLevel ? `<span class="nsfw">⚠️ NSFW Level ${e.nsfwLevel}</span> • ` : "";
            (t.style.display = "flex"),
                (t.innerHTML = `<div class="ico">${e.name.split(" ")[0]}</div><div><span class="nm">${e.name}</span> <span class="desc">${n}${e.theme.description}</span></div>`);
        } else t.style.display = "none";
    }
    updateProductsList();
}
function checkLocationUnlockable(e) {
    const t = gameState.locations.find((t) => t.id === e);
    if (!t) return !1;
    if (t.unlocked) return !1;
    if (gameState.cash < t.cost) return !1;
    if (t.requiresPrestiges && gameState.prestigeLevel < t.requiresPrestiges) return !1;
    const n = gameState.locations.findIndex((t) => t.id === e);
    if (0 === n) return !0;
    if (n > 0) {
        if (!gameState.locations[n - 1].unlocked) return !1;
    }
    return !0;
}
// The one unlock path (there used to be a second copy in 51-save-system.js that won, and
// it built the ladder but skipped the theme and the save). Seats the new site on the
// corporate ladder, switches to it and its theme, and saves.
function unlockLocation(e) {
    const t = gameState.locations.find((t) => t.id === e);
    if (!t) return void showNotification("Location not found!", "error");
    if (t.unlocked) return void showNotification(`${t.name} is already unlocked!`, "info");
    if (t.requiresPrestiges && gameState.prestigeLevel < t.requiresPrestiges)
        return void showNotification(`${t.name} requires ${t.requiresPrestiges} Prestige!`, "error");
    if (gameState.cash < t.cost) return void showNotification(`Need $${formatNumber(t.cost)} to unlock ${t.name}!`, "error");
    if (!checkLocationUnlockable(e)) return void showNotification("Unlock the previous location first!", "error");
    (gameState.cash -= t.cost), (t.unlocked = !0), (t.owned = !0);
    "function" == typeof initializeHierarchicalPyramid && initializeHierarchicalPyramid();
    const n = gameState.products.find((t) => t.locationId === e && 0 === t.unlockCost);
    n && (n.unlocked = !0),
        (gameState.activeLocationId = e),
        applyLocationTheme(t),
        "function" == typeof onLocationUnlocked && onLocationUnlocked(e);
    const a = gameState.locations.findIndex((t) => t.id === e);
    if (a >= 0 && a < gameState.locations.length - 1) {
        const e = gameState.locations[a + 1];
        "function" != typeof generateUniqueBoss ||
            gameState.bossFights?.generatedBosses?.[e.id] ||
            generateUniqueBoss(e.id).catch((e) => console.warn("[Boss] Failed to pre-generate next boss:", e));
    }
    showNotification(`${t.name} unlocked!`, "success"),
        "function" == typeof updateBusinessTab && updateBusinessTab(),
        updateUI(),
        saveGame();
}
function applyLocationTheme(e) {
    if (!e || !e.theme) return;
    const t = document.body,
        n = e.theme;
    n.background && (t.style.background = n.background), (gameState.currentTheme = n);
}
function updateProductsList() {
    if (!productsList) return;
    clearUpgradeButtonCache(), (productsList.innerHTML = "");
    const e = gameState.locations.find((e) => e.id === gameState.activeLocationId);
    if (!e || !e.unlocked)
        return void (productsList.innerHTML =
            '<p class="biz-empty">Select an unlocked location to view products.</p>');
    const t = gameState.products.filter(
        (e) => e.locationId === gameState.activeLocationId && !(isSFWMode() && e.nsfwLevel && e.nsfwLevel > 0)
    );
    0 !== t.length
        ? (renderProcurementBar(productsList),
          t.forEach((e) => {
              const t = document.createElement("div");
              if (
                  ((t.className = "product-card prod"),
                  !e.unlocked)
              ) {
                  const n = currentValue(e),
                      i = getProductUnlockCost(e),
                      s = Math.round(100 * (1 - i / e.unlockCost)),
                      r = s > 0,
                      l = canUnlockProduct(e),
                      c = gameState.cash >= i,
                      d = l.canUnlock && c;
                  let p = "";
                  return (
                      t.classList.add("locked"),
                      l.canUnlock ||
                          (p = `<div class="prod-req"><div class="t">⚠️ Requirements Not Met</div><div class="r">${l.reason}</div></div>`),
                      (t.innerHTML = `<div class="prod-h"><span class="nm">${e.name}</span><span class="lvl">🔒 Locked</span></div><div class="prod-lock-note">Unlock to earn $${formatNumber(n)} / unit.</div>${p}<div class="prod-actions locked-row"><button class="unlock-product-btn act unlock" data-id="${e.id}" ${d ? "" : "disabled"}><span class="lbl">🔓 Unlock</span><span class="num">${r ? `$${formatNumber(i)} <span class="strike">$${formatNumber(e.unlockCost)}</span> <span class="disc">-${s}%</span>` : `$${formatNumber(e.unlockCost)}`}</span></button></div>`),
                      void productsList.appendChild(t)
                  );
              }
              const n = gameState.upgradeMultiplier,
                  a = 999,
                  o = e.level >= a;
              let i, s, r;
              if (o) (i = 0), (s = 0), (r = "MAX LEVEL (999)");
              else if ("max" === n) {
                  const t = calculateMaxAffordableUpgrades(e, gameState.cash);
                  (i = t.totalCost),
                      (s = Math.min(t.count, a - e.level)),
                      (r = `Upgrade x${s} (${formatNumber(i)})`);
              } else
                  1 === n
                      ? ((i = getProductUpgradeCost(e)), (s = 1), (r = `Upgrade (${formatNumber(i)})`))
                      : ((i = calculateBulkUpgradeCost(e, Math.min(n, a - e.level))),
                        (s = Math.min(n, a - e.level)),
                        (r = `Upgrade x${s} (${formatNumber(i)})`));
              const l = currentCycleTimeMs(e),
                  c = l < 1e3 && e.managerHired,
                  d = e.running ? Math.min(100, 100 * (1 - e.timeRemainingMs / l)) : 0,
                  p = !!e.managerOnboarding;
              let m, u, g, h, y;
              const f =
                  e.managerId &&
                  (gameState.employees.find((t) => t.id === e.managerId && "active" === t.employmentStatus) ||
                      (gameState.onboarding && gameState.onboarding.find((t) => t.id === e.managerId)));
              if (
                  (e.managerHired &&
                      !f &&
                      ((e.managerHired = !1),
                      (e.managerId = null),
                      (e.managerLevel = 0),
                      (e.managerOnboarding = !1)),
                  c)
              )
                  (m = "🔒 Optimized (Constant)"),
                      (u = "disabled"),
                      (g = "not-allowed"),
                      (h = "0.6"),
                      (y = "var(--l-neutral-3)");
              else if (p)
                  (m = "Onboarding in Progress"),
                      (u = "disabled"),
                      (g = "not-allowed"),
                      (h = "0.7"),
                      (y = "var(--l-purple-deep)");
              else if (e.managerHired) {
                  const n = getManagerUpgradeCost(e),
                      t = gameState.cash >= n;
                  (m = `Upgrade Position ($${formatNumber(n)})`),
                      (u = t ? "" : "disabled"),
                      (g = t ? "pointer" : "not-allowed"),
                      (h = t ? "1" : "0.5"),
                      (y = t ? "var(--l-purple-deep)" : "var(--l-neutral-3)");
              } else {
                  const n = getManagerHireCost(e),
                      t = gameState.cash >= n;
                  (m = `Hire Staff ($${formatNumber(n)})`),
                      (u = t ? "" : "disabled"),
                      (g = t ? "pointer" : "not-allowed"),
                      (h = t ? "1" : "0.5"),
                      (y = t ? "var(--l-purple-deep)" : "var(--l-neutral-3)");
              }
              const upLbl = o ? "MAX" : s > 1 ? `Upgrade ×${s}` : "Upgrade",
                  upNum = o ? "Lv 999" : `$${formatNumber(i)}`;
              let mgrLbl,
                  mgrNum = "",
                  mgrCls = "",
                  mgrCost = 0,
                  mgrGated = false;
              if (c) (mgrLbl = "Optimized"), (mgrNum = "Constant"), (mgrCls = "is-optimized");
              else if (p) (mgrLbl = "Onboarding"), (mgrNum = "in progress"), (mgrCls = "is-onboarding");
              else if (e.managerHired)
                  (mgrLbl = "Upgrade Staff"),
                      (mgrNum = `$${formatNumber((mgrCost = getManagerUpgradeCost(e)))}`),
                      (mgrGated = true);
              else
                  (mgrLbl = "Hire Staff"),
                      (mgrNum = `$${formatNumber((mgrCost = getManagerHireCost(e)))}`),
                      (mgrGated = true);
              t.classList.toggle("running", !!e.running),
                  t.classList.toggle("maxed", o),
                  t.classList.toggle("constant", c);
              const b = currentValue(e),
                  v = c
                      ? `<span class="v num">$<span id="val-${e.id}">${formatNumber(b / (l / 1e3))}</span></span><span class="unit">/sec</span>`
                      : `<span class="v num">$<span id="val-${e.id}">${formatNumber(b)}</span></span><span class="unit">/unit · <span id="cyc-${e.id}">${(l / 1e3).toFixed(1)}</span>s</span>`;
              (t.innerHTML = `<div class="prod-h"><span class="nm">${e.name}${c ? " ⚡" : ""}</span><span class="lvl">Lv ${e.level}${o ? " 🏆" : ""}</span></div><div class="prod-stat">${v}</div><div class="bar"><i id="prog-${e.id}" style="width:${d}%;"></i></div><div class="prod-actions">${c ? '<div class="prod-stream">⚡ Constant</div>' : `<button class="sell-btn act sell" data-id="${e.id}"><span class="lbl" id="selltxt-${e.id}">${e.running ? "Click: -1s" : "Sell"}</span></button>`}<button class="upgrade-product-btn act up" data-id="${e.id}" data-count="${s}" data-cost="${i}" ${o ? "disabled" : ""}><span class="lbl">${upLbl}</span><span class="num">${upNum}</span></button><button class="manager-btn act mgr ${mgrCls}" data-id="${e.id}" data-mgr-cost="${mgrCost}" data-mgr-gated="${mgrGated ? 1 : 0}" ${u}><span class="lbl">${mgrLbl}</span><span class="num">${mgrNum}</span></button></div>${
                      e.managerHired
                          ? (() => {
                                const t = gameState.employees.find((t) => t.id === e.managerId);
                                if (!t)
                                    return '<div class="prod-staff warn">⚠️ Staff lost — re-hire to reassign</div>';
                                const n = t.name,
                                    a = e.managerLevel || 1,
                                    o = getManagerialBonuses(e);
                                let i = "";
                                if (o.managerChain && o.managerChain.length > 0) {
                                    i = `<div class="prod-staff chain">📊 +${(100 * (o.speedMultiplier - 1)).toFixed(0)}% speed · +${(100 * (o.incomeMultiplier - 1)).toFixed(0)}% income</div>`;
                                }
                                return `<div class="prod-staff ok">${c ? `⚡ Staffed by ${n} — peak efficiency` : p ? `⏳ ${n} onboarding…` : `✓ Staffed by ${n} (Lv.${a})`}</div>${i}`;
                            })()
                          : '<div class="prod-staff warn">⚠️ No staff — automation off</div>'
                  }\n      `),
                  delete e._wasConstantStream,
                  productsList.appendChild(t);
          }))
        : (productsList.innerHTML =
              '<p class="biz-empty">No products available in this location.</p>');
}
let upgradeButtonCache = new Map();
let managerButtonCache = new Map();
function updateProductProgressBars() {
    for (const e of gameState.products) {
        if (!e.unlocked) {
            const t = document.querySelector(`.unlock-product-btn[data-id="${e.id}"]`);
            if (t) {
                const o = getProductUnlockCost(e),
                    i = canUnlockProduct(e),
                    s = gameState.cash >= o,
                    r = i.canUnlock && s;
                t.disabled === r && (t.disabled = !r);
            }
            continue;
        }
        const t = $(`prog-${e.id}`),
            n = $(`selltxt-${e.id}`),
            a = $(`val-${e.id}`),
            o = $(`cyc-${e.id}`);
        if (!t) continue;
        const i = currentCycleTimeMs(e),
            s = i < 1e3 && e.managerHired;
        if (s !== (e._wasConstantStream || !1))
            if (((e._wasConstantStream = s), s)) {
                if (
                    ((t.style.width = "100%"),
                    (t.style.background = "linear-gradient(90deg, var(--positive), var(--accent), var(--positive))"),
                    (t.style.backgroundSize = "200% 100%"),
                    (t.style.animation = "constantStream 1.5s linear infinite"),
                    a)
                ) {
                    const t = currentValue(e) / (i / 1e3);
                    a.textContent = formatNumber(t);
                }
                o && (o.textContent = "⚡ Constant");
            } else
                (t.style.background = "var(--accent)"),
                    (t.style.backgroundSize = "100% 100%"),
                    (t.style.animation = "none"),
                    (t.style.width = "0%");
        if (s)
            (t.style.animation && "none" !== t.style.animation && "" !== t.style.animation) ||
                ((t.style.width = "100%"),
                (t.style.background = "linear-gradient(90deg, var(--positive), var(--accent), var(--positive))"),
                (t.style.backgroundSize = "200% 100%"),
                (t.style.animation = "constantStream 1.5s linear infinite"));
        else {
            const s = e.running ? Math.min(100, 100 * (1 - e.timeRemainingMs / i)) : 0;
            if (
                ((t.style.width = `${s}%`),
                n && (n.textContent = e.running ? "Click: -1s" : "Sell"),
                a && (a.textContent = formatNumber(currentValue(e))),
                o)
            ) {
                const e = (i / 1e3).toFixed(1);
                o.textContent !== e && (o.textContent = e);
            }
        }
        let r = upgradeButtonCache.get(e.id);
        if (
            ((r && document.contains(r)) ||
                ((r = document.querySelector(`.upgrade-product-btn[data-id="${e.id}"]`)),
                r && upgradeButtonCache.set(e.id, r)),
            r)
        ) {
            const t = parseInt(r.dataset.cost) || e.upgradeCost,
                n = 999,
                a = e.level >= n,
                o = a || gameState.cash < t || 0 === t;
            r.disabled !== o && (r.disabled = o);
        }
        let mb = managerButtonCache.get(e.id);
        if (
            ((mb && document.contains(mb)) ||
                ((mb = document.querySelector(`.manager-btn[data-id="${e.id}"]`)),
                mb && managerButtonCache.set(e.id, mb)),
            mb && "1" === mb.dataset.mgrGated)
        ) {
            const cost = parseFloat(mb.dataset.mgrCost) || 0,
                shouldDisable = gameState.cash < cost;
            mb.disabled !== shouldDisable && (mb.disabled = shouldDisable);
        }
        if (
            (e._upgradeTickCount || (e._upgradeTickCount = 0),
            e._upgradeTickCount++,
            e._upgradeTickCount >= 10 && ((e._upgradeTickCount = 0), r))
        ) {
            const t = gameState.upgradeMultiplier,
                n = 999;
            let a, o, i;
            if (e.level >= n) (o = 0), (a = 0), (i = `MAX LEVEL (${n})`);
            else if ("max" === t) {
                const t = calculateMaxAffordableUpgrades(e, gameState.cash);
                (o = Math.min(t.count, n - e.level)), (a = t.totalCost), (i = `Upgrade x${o} (${formatNumber(a)})`);
            } else
                1 === t
                    ? ((o = 1), (a = getProductUpgradeCost(e)), (i = `Upgrade (${formatNumber(a)})`))
                    : ((o = Math.min(t, n - e.level)),
                      (a = calculateBulkUpgradeCost(e, o)),
                      (i = `Upgrade x${o} (${formatNumber(a)})`));
            const upLbl = e.level >= n ? "MAX" : o > 1 ? `Upgrade ×${o}` : "Upgrade",
                upNum = e.level >= n ? "Lv 999" : `$${formatNumber(a)}`,
                lblEl = r.querySelector(".lbl"),
                numEl = r.querySelector(".num");
            lblEl && lblEl.textContent !== upLbl && (lblEl.textContent = upLbl);
            numEl && numEl.textContent !== upNum && (numEl.textContent = upNum);
            (r.dataset.count = o), (r.dataset.cost = a);
        }
    }
}
function clearUpgradeButtonCache() {
    upgradeButtonCache.clear();
}
function toggleEmployeeFavorite(e) {
    const t = gameState.employees.find((t) => t.id === e);
    t && ((t.isFavorite = !t.isFavorite), updatePeopleTab(), saveGame());
}
function calculateAverageRelationship(e) {
    if (!e.stats) return 0;
    return (
        0.8 *
            (((e.stats.affection || 0) +
                (e.stats.comfort || 0) +
                (e.stats.trust || 0) +
                (e.stats.desire || 0) +
                (e.stats.obedience || 0)) /
                5) +
        0.2 * (e.memory?.intimacyLevel || 0)
    );
}
function getPromotionRequirements(e, t = null) {
    return (
        {
            2: { minProductivity: 60, minManagement: 1 },
            3: { minProductivity: 70, minManagement: 2 },
            4: { minProductivity: 75, minManagement: 4 },
            5: { minProductivity: 80, minManagement: 6 },
            6: { minProductivity: 85, minManagement: 8 },
            7: { minProductivity: 90, minManagement: 10 },
        }[e] || null
    );
}
function canPromote(e) {
    if (!e || !e.career) return !1;
    const t = e.career.level + 1;
    if (t > 7) return !1;
    const n = getPromotionRequirements(t, e);
    if (!n) return !1;
    if ((e.stats.productivity || 0) < n.minProductivity) return !1;
    if (n.minManagement) {
        if ((e.skills?.management?.level || 0) < n.minManagement) return !1;
    }
    return !0;
}
function promoteEmployee(e) {
    if (!canPromote(e)) return !1;
    const t = e.career.level,
        n = e.career.title,
        a = e.career.salary,
        o = t + 1,
        i = gameState.hierarchyLevels[o];
    if (!i) return !1;
    const marketNew = getMarketRate(e, o),
        marketOld = getMarketRate(e, t);
    (e.career.level = o),
        (e.career.title = i.title),
        (e.career.salary = marketNew + Math.max(0, a - marketOld));
    const s = e.career.startDate;
    return (
        (e.career.startDate = Date.now()),
        e.career.promotionHistory.push({
            date: Date.now(),
            fromLevel: t,
            toLevel: o,
            timeInRole: (Date.now() - s) / 864e5,
            reason: "Performance milestone reached",
        }),
        updateCorporateHierarchy(),
        generatePromotionPost(e, o),
        updatePeopleTab(),
        showPromotionCelebration(e, n, t, a, i),
        console.log(`[Promotion] ${e.name} promoted from Level ${t} to Level ${o} (${i.title})`),
        !0
    );
}
function showPromotionCelebration(e, t, n, a, o) {
    const newSalary = e.career?.salary ?? o.baseSalary,
        i = newSalary - a,
        s = a > 0 ? Math.round((i / a) * 100) : 0,
        r = document.createElement("div");
    (r.id = "promotionCelebrationOverlay"),
        (r.style.cssText =
            "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-75); z-index:10000000; display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s;"),
        (r.innerHTML = `\n      <div style="background:linear-gradient(135deg, var(--l-panel) 0%, var(--l-line) 50%, var(--l-panel) 100%); border-radius:20px; padding:30px 35px; max-width:420px; width:90%; box-shadow:0 25px 80px rgba(78,204,163,0.3); border:2px solid var(--positive); animation:slideIn 0.4s; text-align:center; position:relative; overflow:hidden;">\n        \x3c!-- Confetti effect --\x3e\n        <div style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; overflow:hidden;" id="confettiContainer"></div>\n        \n        <div style="font-size:3rem; margin-bottom:10px; animation:bounceIn 0.6s;">🎉</div>\n        <h2 style="margin:0 0 5px 0; color:var(--positive); font-size:1.4rem; font-weight:700;">PROMOTION!</h2>\n        <p style="color:var(--text-dim); margin:0 0 20px 0; font-size:0.85rem;">${e.name} has been promoted</p>\n        \n        \x3c!-- Before/After --\x3e\n        <div style="display:flex; align-items:center; justify-content:center; gap:15px; margin-bottom:20px;">\n          <div style="text-align:center; padding:12px 18px; background:var(--l-sheen-05); border-radius:12px; border:1px solid var(--border); min-width:100px;">\n            <div style="font-size:0.7rem; color:var(--text-mute); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Before</div>\n            <div style="font-size:1rem; color:var(--danger); font-weight:600;">${t}</div>\n            <div style="font-size:0.75rem; color:var(--text-mute); margin-top:2px;">Level ${n}</div>\n          </div>\n          <div style="font-size:1.5rem; color:var(--positive); animation:pulse 1s infinite;">→</div>\n          <div style="text-align:center; padding:12px 18px; background:rgba(78,204,163,0.1); border-radius:12px; border:1px solid var(--positive-dim); min-width:100px;">\n            <div style="font-size:0.7rem; color:var(--positive); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Now</div>\n            <div style="font-size:1rem; color:var(--positive); font-weight:700;">${o.title}</div>\n            <div style="font-size:0.75rem; color:var(--text-mute); margin-top:2px;">Level ${e.career.level}</div>\n          </div>\n        </div>\n        \n        \x3c!-- Salary change --\x3e\n        <div style="background:var(--l-sheen-05); border-radius:10px; padding:12px 16px; margin-bottom:20px; border:1px solid var(--border);">\n          <div style="display:flex; justify-content:space-between; align-items:center;">\n            <span style="color:var(--text-mute); font-size:0.85rem;">💰 Salary</span>\n            <span style="color:var(--positive); font-weight:600; font-size:0.95rem;">$${formatCash(a)} → $${formatCash(newSalary)}</span>\n          </div>\n          <div style="text-align:right; margin-top:4px;">\n            <span style="color:var(--positive); font-size:0.75rem; background:rgba(78,204,163,0.15); padding:2px 8px; border-radius:10px;">+$${formatCash(i)}/yr (+${s}%)</span>\n          </div>\n        </div>\n        \n        <button onclick="this.closest('#promotionCelebrationOverlay').style.animation='fadeOut 0.2s';setTimeout(()=>document.getElementById('promotionCelebrationOverlay')?.remove(),200);" \n          style="padding:12px 35px; background:linear-gradient(135deg, var(--l-green), #45b393); border:none; border-radius:10px; color:var(--l-on-accent); cursor:pointer; font-weight:700; font-size:1rem; transition:all 0.2s; box-shadow:0 4px 15px rgba(78,204,163,0.3);">\n          Congratulations! 🎊\n        </button>\n      </div>\n    `),
        document.body.appendChild(r);
    const l = r.querySelector("#confettiContainer"),
        c = ["var(--l-green)", "var(--l-red)", "var(--l-indigo)", "var(--l-amber-4)", "var(--l-pink)", "#00d2ff"];
    for (let e = 0; e < 30; e++) {
        const e = document.createElement("div"),
            t = c[Math.floor(Math.random() * c.length)],
            n = 100 * Math.random(),
            a = 2 * Math.random(),
            o = 4 + 6 * Math.random();
        (e.style.cssText = `position:absolute; top:-10px; left:${n}%; width:${o}px; height:${o}px; background:${t}; border-radius:${Math.random() > 0.5 ? "50%" : "2px"}; opacity:0.8; animation:confettiFall ${2 + 2 * Math.random()}s ${a}s linear infinite;`),
            l.appendChild(e);
    }
    if (!document.getElementById("confettiStyle")) {
        const e = document.createElement("style");
        (e.id = "confettiStyle"),
            (e.textContent =
                "\n        @keyframes confettiFall { 0% { transform:translateY(-10px) rotate(0deg); opacity:1; } 100% { transform:translateY(500px) rotate(720deg); opacity:0; } }\n        @keyframes bounceIn { 0% { transform:scale(0); } 50% { transform:scale(1.2); } 100% { transform:scale(1); } }\n        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }\n      "),
            document.head.appendChild(e);
    }
    r.addEventListener("click", (e) => {
        e.target === r && ((r.style.animation = "fadeOut 0.2s"), setTimeout(() => r.remove(), 200));
    });
}
function checkForPromotions() {
    if (!gameState.employees || 0 === gameState.employees.length) return;
    let e = 0;
    gameState.employees.forEach((t) => {
        "active" === t.employmentStatus && t.career && canPromote(t) && promoteEmployee(t) && e++;
    }),
        e > 0 && console.log(`[Promotion] Auto-promoted ${e} employee(s)`);
}
function canPromoteEmployee(e) {
    if (!e || "active" !== e.employmentStatus) return !1;
    if (!e.career) return !1;
    const t = getEmployeePosition(e.id);
    if (!t) return !1;
    const n = t.level;
    for (let t = Math.floor(n) + 1; t <= 6; t++) {
        const n = gameState.corporatePyramid.positions[t];
        if (n)
            for (const t of n) {
                if (canFillPosition(e, t).canFill) return !0;
            }
    }
    if ("secretary" !== t.positionId && e.career.level >= 1 && e.career.level <= 3) {
        const e = gameState.corporatePyramid.secretaryPosition;
        if (e && !e.employeeId) return !0;
    }
    return !1;
}
function startPromotionFlow(e) {
    void 0 !== ModalManager && ModalManager.close && ModalManager.close("profileModal"),
        setTimeout(() => {
            openCorporatePyramidModal(e);
        }, 150);
}
function conductTrainingWorkshop() {
    const e = gameState.employees.filter((e) => "active" === e.employmentStatus);
    if (0 === e.length) return void showNotification("No active employees to train!", "error");
    const t = 500 * e.length;
    if (gameState.cash < t)
        return void showNotification(
            `Not enough cash! Training costs $${formatNumber(t)} ($${formatNumber(500)} per employee)`,
            "error"
        );
    gameState.cash -= t;
    let n = 0;
    e.forEach((e) => {
        e.stats || (e.stats = {});
        const t = e.stats.productivity || 50,
            a = 5 + Math.floor(6 * Math.random());
        (e.stats.productivity = Math.min(100, t + a)), gainSkillXP(e, "management", 20, "training_workshop"), n++;
    }),
        gameState.productivitySystems || (gameState.productivitySystems = {}),
        (gameState.productivitySystems.lastWorkshop = Date.now()),
        showNotification(`🎓 Training Workshop completed! ${n} employees gained +5-10 productivity!`, "success"),
        logCompanyEvent({
            type: "training",
            description: "Company-wide training workshop conducted",
            sentiment: "positive",
            importance: 6,
        }),
        flushPendingSave(),
        saveGame(!1),
        updatePeopleTab(),
        updateUI();
}
function conductPerformanceReview(e) {
    const t = gameState.employees.find((t) => t.id === e);
    if (!t || "active" !== t.employmentStatus)
        return void showNotification("Employee not found or inactive!", "error");
    gameState.productivitySystems || (gameState.productivitySystems = {}),
        gameState.productivitySystems.reviewCooldowns || (gameState.productivitySystems.reviewCooldowns = {});
    const n = gameState.productivitySystems.reviewCooldowns[e] || 0,
        a = (Date.now() - n) / 864e5;
    if (a < 7) {
        const e = Math.ceil(7 - a);
        return void showNotification(`${t.name} was recently reviewed. Wait ${e} more day(s).`, "error");
    }
    if (gameState.cash < 200)
        return void showNotification(`Not enough cash! Performance review costs $${formatNumber(200)}`, "error");
    (gameState.cash -= 200), t.stats || (t.stats = {});
    const o = t.stats.productivity || 50;
    let i, s;
    o < 50
        ? ((i = 15 + Math.floor(6 * Math.random())),
          (s = `${t.name} appreciated the feedback and showed significant improvement!`))
        : o < 75
          ? ((i = 10 + Math.floor(6 * Math.random())),
            (s = `${t.name} took the feedback well and improved their productivity!`))
          : ((i = 5 + Math.floor(6 * Math.random())),
            (s = `${t.name} is already performing well, but found ways to optimize further!`)),
        (t.stats.productivity = Math.min(100, o + i)),
        void 0 !== t.stats.affection && (t.stats.affection = Math.min(100, (t.stats.affection || 50) + 5)),
        (gameState.productivitySystems.reviewCooldowns[e] = Date.now()),
        showNotification(`📊 ${s} (+${i} productivity)`, "success"),
        t.career || (t.career = {}),
        t.career.reviewHistory || (t.career.reviewHistory = []),
        t.career.reviewHistory.push({
            date: Date.now(),
            productivityBefore: o,
            productivityAfter: t.stats.productivity,
            boost: i,
        }),
        saveGame(),
        updatePeopleTab(),
        updateUI();
}
function conductTeamBuilding() {
    const e = gameState.employees.filter((e) => "active" === e.employmentStatus);
    if (0 === e.length) return void showNotification("No active employees for team building!", "error");
    gameState.productivitySystems || (gameState.productivitySystems = {});
    const t = gameState.productivitySystems.lastTeamBuilding || 0,
        n = (Date.now() - t) / 864e5;
    if (n < 14) {
        return void showNotification(
            `Team building activities need time to be effective. Wait ${Math.ceil(14 - n)} more day(s).`,
            "error"
        );
    }
    const a = 800 * e.length;
    if (gameState.cash < a)
        return void showNotification(
            `Not enough cash! Team building costs $${formatNumber(a)} ($${formatNumber(800)} per employee)`,
            "error"
        );
    gameState.cash -= a;
    let o = 0;
    e.forEach((e) => {
        e.stats || (e.stats = {});
        const t = e.stats.productivity || 50,
            n = 3 + Math.floor(5 * Math.random());
        (e.stats.productivity = Math.min(100, t + n)),
            void 0 !== e.stats.affection && (e.stats.affection = Math.min(100, (e.stats.affection || 50) + 8)),
            void 0 !== e.stats.comfort && (e.stats.comfort = Math.min(100, (e.stats.comfort || 50) + 8)),
            gainSkillXP(e, "social", 30, "team_building"),
            o++;
    }),
        (gameState.productivitySystems.lastTeamBuilding = Date.now()),
        showNotification(
            `🎉 Team Building Activity completed! ${o} employees bonded and improved! (+3-7 productivity, +8 morale)`,
            "success"
        ),
        logCompanyEvent({
            type: "team_building",
            description: "Company team building event held",
            sentiment: "positive",
            importance: 7,
        }),
        flushPendingSave(),
        saveGame(!1),
        updatePeopleTab(),
        updateUI();
}

/* ============================================================
   COMPANY PROGRAMS SYSTEM (14 programs on the flags/unavailable/
   temporaryBoosts engines). Cooldowns + unavailability + output
   boosts are day-keyed (gameState.currentDay); chips are flags
   (ms-keyed via time.currentTime). See plan file for the spec.
   ============================================================ */
function _progActive() {
    return gameState.employees.filter((e) => "active" === e.employmentStatus);
}
function _progAffected(tier, target) {
    if ("individual" === tier) {
        const e = gameState.employees.find((x) => x.id === target);
        return e ? [e] : [];
    }
    if ("department" === tier) return _progActive().filter((e) => e.locationId === target);
    return _progActive();
}
function _progAvg(list, stat) {
    if (!list || !list.length) return 50;
    return list.reduce((s, e) => s + (e.stats?.[stat] ?? 50), 0) / list.length;
}
function _progBump(e, stat, delta) {
    e.stats || (e.stats = {});
    e.stats[stat] = Math.max(0, Math.min(100, (e.stats[stat] ?? 50) + delta));
}
function _progUnavailable(e, days, reason) {
    (e.unavailable = !0), (e.unavailableUntil = (gameState.currentDay || 0) + days), (e.unavailableReason = reason);
}
function _progBoostLocation(locId, multiplier, days) {
    gameState.products.forEach((p) => {
        p.locationId === locId &&
            (p.temporaryBoosts || (p.temporaryBoosts = []),
            p.temporaryBoosts.push({ multiplier, expiresDay: (gameState.currentDay || 0) + days, source: "program" }));
    });
}
function _progBoostAll(multiplier, days) {
    gameState.products.forEach((p) => {
        p.temporaryBoosts || (p.temporaryBoosts = []),
            p.temporaryBoosts.push({ multiplier, expiresDay: (gameState.currentDay || 0) + days, source: "program" });
    });
}
