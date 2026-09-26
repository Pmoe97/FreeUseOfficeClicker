// ============================================================================
// 32-business — Business tab: locations, products list, progress bars, promotions, training workshops, team building, programs effects.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function updateBusinessTab() {
  const e = $("locationSubtabs");
  e && (e.innerHTML = "", gameState.locations.forEach((t2, n) => {
    if (Ue() && t2.nsfwLevel && t2.nsfwLevel > 0) return;
    checkLocationUnlockable(t2.id);
    const a = !t2.unlocked, o = gameState.activeLocationId === t2.id, i = gameState.cash >= t2.cost, s = n > 0 ? gameState.locations[n - 1] : null, r = !s || s.unlocked, l = t2.requiresPrestiges && gameState.prestigeLevel < t2.requiresPrestiges, c = document.createElement("button");
    if (c.className = "location-subtab biz-loc", c.dataset.locationId = t2.id, a) if (l) c.classList.add("locked"), c.innerHTML = `\uFFFD\uFE0F ${t2.name}<br><span style="font-size:0.8em;">Requires ${t2.requiresPrestiges} Prestige</span>`, c.disabled = true;
    else if (r) if (i) if (n > 0) {
      const e2 = Fe[t2.id];
      if (e2 && gameState.bossFights.defeated.includes(e2.id)) c.classList.add("unlockable"), c.innerHTML = `\u{1F513} ${t2.name}<br><span style="font-size:0.8em;">Claim Victory</span>`, c.onclick = () => unlockLocation(t2.id);
      else {
        const e3 = checkBossFightRequirements(t2.id);
        c.classList.add("boss");
        const n2 = !e3.canFight && e3.reason && "no_boss" !== e3.reason;
        if (n2) {
          const n3 = "cooldown" === e3.reason ? `Cooldown: ${Ih(e3.cooldownRemaining)}` : "already_defeated" === e3.reason ? "Already Defeated" : e3.reason;
          c.innerHTML = `\u2694\uFE0F ${t2.name}<br><span style="font-size:0.7em; color:var(--fd);">${n3}</span>`;
        } else c.innerHTML = `\u2694\uFE0F ${t2.name}<br><span style="font-size:0.8em;">Boss Fight!</span>`;
        c.onclick = async () => {
          n2 && "cooldown" === e3.reason ? showNotification(`Boss fight on cooldown! ${Ih(e3.cooldownRemaining)} remaining.`, "warning") : "already_defeated" === e3.reason ? showNotification("You already defeated this boss!", "info") : startBossFight(t2.id);
        };
      }
    } else c.classList.add("unlockable"), c.innerHTML = `<span>\u{1F513} ${t2.name}</span><span class="sub">Unlock: ${wu(t2.cost)}</span>`, c.onclick = () => unlockLocation(t2.id);
    else c.classList.add("locked"), c.innerHTML = `<span>\u{1F512} ${t2.name}</span><span class="sub">Need: ${wu(t2.cost)}</span>`, c.disabled = true;
    else c.classList.add("locked"), c.innerHTML = `<span>\u{1F512} ${t2.name}</span>`, c.disabled = true;
    else {
      const e2 = t2.nsfwLevel ? "\u{1F51E}".repeat(t2.nsfwLevel) : "";
      o && c.classList.add("active"), c.innerHTML = `<span>${t2.name}${e2 ? " " + e2 : ""}</span>`, c.onclick = () => {
        gameState.activeLocationId = t2.id, ud(t2), updateBusinessTab();
      };
    }
    e.appendChild(c);
  }));
  const t = document.getElementById("locationInfo");
  if (t) {
    const e2 = gameState.locations.find((e3) => e3.id === gameState.activeLocationId);
    if (e2 && e2.unlocked && e2.theme) {
      const n = e2.nsfwLevel ? `<span class="nsfw">\u26A0\uFE0F NSFW Level ${e2.nsfwLevel}</span> \u2022 ` : "";
      t.style.display = "flex", t.innerHTML = `<div class="ico">${e2.name.split(" ")[0]}</div><div><span class="nm">${e2.name}</span> <span class="desc">${n}${e2.theme.description}</span></div>`;
    } else t.style.display = "none";
  }
  updateProductsList();
}
function checkLocationUnlockable(e) {
  const t = gameState.locations.find((t2) => t2.id === e);
  if (!t) return false;
  if (t.unlocked) return false;
  if (gameState.cash < t.cost) return false;
  if (t.requiresPrestiges && gameState.prestigeLevel < t.requiresPrestiges) return false;
  const n = gameState.locations.findIndex((t2) => t2.id === e);
  return 0 === n || !(n > 0 && !gameState.locations[n - 1].unlocked);
}
function unlockLocation(e) {
  const t = gameState.locations.find((t2) => t2.id === e);
  if (!t || t.unlocked) return;
  if (!checkLocationUnlockable(e)) return void showNotification("Cannot unlock this location yet!", "error");
  if (gameState.cash < t.cost) return void showNotification("Not enough cash to unlock this location!", "error");
  gameState.cash -= t.cost, t.unlocked = true, t.owned = true;
  const n = gameState.products.find((t2) => t2.locationId === e && 0 === t2.unlockCost);
  n && (n.unlocked = true), gameState.activeLocationId = e, ud(t), "function" == typeof onLocationUnlocked && onLocationUnlocked(e);
  const a = gameState.locations.findIndex((t2) => t2.id === e);
  if (a >= 0 && a < gameState.locations.length - 1) {
    const e2 = gameState.locations[a + 1];
    "function" != typeof generateUniqueBoss || gameState.bossFights?.generatedBosses?.[e2.id] || generateUniqueBoss(e2.id).catch((e3) => console.warn("[Boss] Failed to pre-generate next boss:", e3));
  }
  showNotification(`${t.name} unlocked!`, "success"), updateUI(), saveGame();
}
function ud(e) {
  if (!e || !e.theme) return;
  const t = document.body, n = e.theme;
  n.background && (t.style.background = n.background), gameState.currentTheme = n;
}
function updateProductsList() {
  if (!productsList) return;
  hd(), productsList.innerHTML = "";
  const e = gameState.locations.find((e2) => e2.id === gameState.activeLocationId);
  if (!e || !e.unlocked) return void (productsList.innerHTML = '<p class="biz-empty">Select an unlocked location to view products.</p>');
  const t = gameState.products.filter((e2) => e2.locationId === gameState.activeLocationId && !(Ue() && e2.nsfwLevel && e2.nsfwLevel > 0));
  0 !== t.length ? (Lu(productsList), t.forEach((e2) => {
    const t2 = document.createElement("div");
    if (t2.className = "product-card prod", !e2.unlocked) {
      const n2 = currentValue(e2), i2 = Bu(e2), s2 = Math.round(100 * (1 - i2 / e2.unlockCost)), r2 = s2 > 0, l2 = canUnlockProduct(e2), c2 = gameState.cash >= i2, d2 = l2.canUnlock && c2;
      let p2 = "";
      return t2.classList.add("locked"), l2.canUnlock || (p2 = `<div class="prod-req"><div class="t">\u26A0\uFE0F Requirements Not Met</div><div class="r">${l2.reason}</div></div>`), t2.innerHTML = `<div class="prod-h"><span class="nm">${e2.name}</span><span class="lvl">\u{1F512} Locked</span></div><div class="prod-lock-note">Unlock to earn $${wu(n2)} / unit.</div>${p2}<div class="prod-actions locked-row"><button class="unlock-product-btn act unlock" data-id="${e2.id}" ${d2 ? "" : "disabled"}><span class="lbl">\u{1F513} Unlock</span><span class="num">${r2 ? `$${wu(i2)} <span class="strike">$${wu(e2.unlockCost)}</span> <span class="disc">-${s2}%</span>` : `$${wu(e2.unlockCost)}`}</span></button></div>`, void productsList.appendChild(t2);
    }
    const n = gameState.upgradeMultiplier, a = 999, o = e2.level >= a;
    let i, s, r;
    if (o) i = 0, s = 0, r = "MAX LEVEL (999)";
    else if ("max" === n) {
      const t3 = zu(e2, gameState.cash);
      i = t3.totalCost, s = Math.min(t3.count, a - e2.level), r = `Upgrade x${s} (${wu(i)})`;
    } else 1 === n ? (i = Ou(e2), s = 1, r = `Upgrade (${wu(i)})`) : (i = qu(e2, Math.min(n, a - e2.level)), s = Math.min(n, a - e2.level), r = `Upgrade x${s} (${wu(i)})`);
    const l = currentCycleTimeMs(e2), c = l < 1e3 && e2.managerHired, d = e2.running ? Math.min(100, 100 * (1 - e2.timeRemainingMs / l)) : 0, p = !!e2.managerOnboarding;
    let m, u2, g, h, y;
    const f = e2.managerId && (gameState.employees.find((t3) => t3.id === e2.managerId && "active" === t3.employmentStatus) || gameState.onboarding && gameState.onboarding.find((t3) => t3.id === e2.managerId));
    if (e2.managerHired && !f && (e2.managerHired = false, e2.managerId = null, e2.managerLevel = 0, e2.managerOnboarding = false), c) m = "\u{1F512} Optimized (Constant)", u2 = "disabled", g = "not-allowed", h = "0.6", y = "var(--ag)";
    else if (p) m = "Onboarding in Progress", u2 = "disabled", g = "not-allowed", h = "0.7", y = "var(--at)";
    else if (e2.managerHired) {
      const n2 = ju(e2), t3 = gameState.cash >= n2;
      m = `Upgrade Position ($${wu(n2)})`, u2 = t3 ? "" : "disabled", g = t3 ? "pointer" : "not-allowed", h = t3 ? "1" : "0.5", y = t3 ? "var(--at)" : "var(--ag)";
    } else {
      const n2 = Fu(e2), t3 = gameState.cash >= n2;
      m = `Hire Staff ($${wu(n2)})`, u2 = t3 ? "" : "disabled", g = t3 ? "pointer" : "not-allowed", h = t3 ? "1" : "0.5", y = t3 ? "var(--at)" : "var(--ag)";
    }
    const G2 = o ? "MAX" : s > 1 ? `Upgrade \xD7${s}` : "Upgrade", U2 = o ? "Lv 999" : `$${wu(i)}`;
    let J2, ee2 = "", te2 = "", ne2 = 0, oe2 = false;
    c ? (J2 = "Optimized", ee2 = "Constant", te2 = "is-optimized") : p ? (J2 = "Onboarding", ee2 = "in progress", te2 = "is-onboarding") : e2.managerHired ? (J2 = "Upgrade Staff", ee2 = `$${wu(ne2 = ju(e2))}`, oe2 = true) : (J2 = "Hire Staff", ee2 = `$${wu(ne2 = Fu(e2))}`, oe2 = true), t2.classList.toggle("running", !!e2.running), t2.classList.toggle("maxed", o), t2.classList.toggle("constant", c);
    const b = currentValue(e2), v = c ? `<span class="v num">$<span id="val-${e2.id}">${wu(b / (l / 1e3))}</span></span><span class="unit">/sec</span>` : `<span class="v num">$<span id="val-${e2.id}">${wu(b)}</span></span><span class="unit">/unit \xB7 <span id="cyc-${e2.id}">${(l / 1e3).toFixed(1)}</span>s</span>`;
    t2.innerHTML = `<div class="prod-h"><span class="nm">${e2.name}${c ? " \u26A1" : ""}</span><span class="lvl">Lv ${e2.level}${o ? " \u{1F3C6}" : ""}</span></div><div class="prod-stat">${v}</div><div class="bar"><i id="prog-${e2.id}" style="width:${d}%;"></i></div><div class="prod-actions">${c ? '<div class="prod-stream">\u26A1 Constant</div>' : `<button class="sell-btn act sell" data-id="${e2.id}"><span class="lbl" id="selltxt-${e2.id}">${e2.running ? "Click: -1s" : "Sell"}</span></button>`}<button class="upgrade-product-btn act up" data-id="${e2.id}" data-count="${s}" data-cost="${i}" ${o ? "disabled" : ""}><span class="lbl">${G2}</span><span class="num">${U2}</span></button><button class="manager-btn act mgr ${te2}" data-id="${e2.id}" data-mgr-cost="${ne2}" data-mgr-gated="${oe2 ? 1 : 0}" ${u2}><span class="lbl">${J2}</span><span class="num">${ee2}</span></button></div>${e2.managerHired ? (() => {
      const t3 = gameState.employees.find((t4) => t4.id === e2.managerId);
      if (!t3) return '<div class="prod-staff warn">\u26A0\uFE0F Staff lost \u2014 re-hire to reassign</div>';
      const n2 = t3.name, a2 = e2.managerLevel || 1, o2 = ie(e2);
      let i2 = "";
      return o2.managerChain && o2.managerChain.length > 0 && (i2 = `<div class="prod-staff chain">\u{1F4CA} +${(100 * (o2.speedMultiplier - 1)).toFixed(0)}% speed \xB7 +${(100 * (o2.incomeMultiplier - 1)).toFixed(0)}% income</div>`), `<div class="prod-staff ok">${c ? `\u26A1 Staffed by ${n2} \u2014 peak efficiency` : p ? `\u23F3 ${n2} onboarding\u2026` : `\u2713 Staffed by ${n2} (Lv.${a2})`}</div>${i2}`;
    })() : '<div class="prod-staff warn">\u26A0\uFE0F No staff \u2014 automation off</div>'}
      `, delete e2._wasConstantStream, productsList.appendChild(t2);
  })) : productsList.innerHTML = '<p class="biz-empty">No products available in this location.</p>';
}
let pd = /* @__PURE__ */ new Map(), gd = /* @__PURE__ */ new Map();
function updateProductProgressBars() {
  for (const e of gameState.products) {
    if (!e.unlocked) {
      const t2 = document.querySelector(`.unlock-product-btn[data-id="${e.id}"]`);
      if (t2) {
        const o2 = Bu(e), i2 = canUnlockProduct(e), s2 = gameState.cash >= o2, r2 = i2.canUnlock && s2;
        t2.disabled === r2 && (t2.disabled = !r2);
      }
      continue;
    }
    const t = $(`prog-${e.id}`), n = $(`selltxt-${e.id}`), a = $(`val-${e.id}`), o = $(`cyc-${e.id}`);
    if (!t) continue;
    const i = currentCycleTimeMs(e), s = i < 1e3 && e.managerHired;
    if (s !== (e._wasConstantStream || false)) if (e._wasConstantStream = s, s) {
      if (t.style.width = "100%", t.style.background = "linear-gradient(90deg, var(--g), var(--d), var(--g))", t.style.backgroundSize = "200% 100%", t.style.animation = "constantStream 1.5s linear infinite", a) {
        const t2 = currentValue(e) / (i / 1e3);
        a.textContent = wu(t2);
      }
      o && (o.textContent = "\u26A1 Constant");
    } else t.style.background = "var(--d)", t.style.backgroundSize = "100% 100%", t.style.animation = "none", t.style.width = "0%";
    if (s) t.style.animation && "none" !== t.style.animation && "" !== t.style.animation || (t.style.width = "100%", t.style.background = "linear-gradient(90deg, var(--g), var(--d), var(--g))", t.style.backgroundSize = "200% 100%", t.style.animation = "constantStream 1.5s linear infinite");
    else {
      const s2 = e.running ? Math.min(100, 100 * (1 - e.timeRemainingMs / i)) : 0;
      if (t.style.width = `${s2}%`, n && (n.textContent = e.running ? "Click: -1s" : "Sell"), a && (a.textContent = wu(currentValue(e))), o) {
        const e2 = (i / 1e3).toFixed(1);
        o.textContent !== e2 && (o.textContent = e2);
      }
    }
    let r = pd.get(e.id);
    if (r && document.contains(r) || (r = document.querySelector(`.upgrade-product-btn[data-id="${e.id}"]`), r && pd.set(e.id, r)), r) {
      const t2 = parseInt(r.dataset.cost) || e.upgradeCost, n2 = 999, o2 = e.level >= n2 || gameState.cash < t2 || 0 === t2;
      r.disabled !== o2 && (r.disabled = o2);
    }
    let mb = gd.get(e.id);
    if (mb && document.contains(mb) || (mb = document.querySelector(`.manager-btn[data-id="${e.id}"]`), mb && gd.set(e.id, mb)), mb && "1" === mb.dataset.mgrGated) {
      const cost = parseFloat(mb.dataset.mgrCost) || 0, u2 = gameState.cash < cost;
      mb.disabled !== u2 && (mb.disabled = u2);
    }
    if (e._upgradeTickCount || (e._upgradeTickCount = 0), e._upgradeTickCount++, e._upgradeTickCount >= 10 && (e._upgradeTickCount = 0, r)) {
      const t2 = gameState.upgradeMultiplier, n2 = 999;
      let a2, o2, i2;
      if (e.level >= n2) o2 = 0, a2 = 0, i2 = `MAX LEVEL (${n2})`;
      else if ("max" === t2) {
        const t3 = zu(e, gameState.cash);
        o2 = Math.min(t3.count, n2 - e.level), a2 = t3.totalCost, i2 = `Upgrade x${o2} (${wu(a2)})`;
      } else 1 === t2 ? (o2 = 1, a2 = Ou(e), i2 = `Upgrade (${wu(a2)})`) : (o2 = Math.min(t2, n2 - e.level), a2 = qu(e, o2), i2 = `Upgrade x${o2} (${wu(a2)})`);
      const u2 = e.level >= n2 ? "MAX" : o2 > 1 ? `Upgrade \xD7${o2}` : "Upgrade", G2 = e.level >= n2 ? "Lv 999" : `$${wu(a2)}`, U2 = r.querySelector(".lbl"), J2 = r.querySelector(".num");
      U2 && U2.textContent !== u2 && (U2.textContent = u2), J2 && J2.textContent !== G2 && (J2.textContent = G2), r.dataset.count = o2, r.dataset.cost = a2;
    }
  }
}
function hd() {
  pd.clear();
}
function toggleEmployeeFavorite(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  t && (t.isFavorite = !t.isFavorite, updatePeopleTab(), saveGame());
}
function yd(e) {
  return e.stats ? ((e.stats.affection || 0) + (e.stats.comfort || 0) + (e.stats.trust || 0) + (e.stats.desire || 0) + (e.stats.obedience || 0)) / 5 * 0.8 + 0.2 * (e.memory?.intimacyLevel || 0) : 0;
}
function fd(e, t = null) {
  return { 2: { minProductivity: 60, minManagement: 1 }, 3: { minProductivity: 70, minManagement: 2 }, 4: { minProductivity: 75, minManagement: 4 }, 5: { minProductivity: 80, minManagement: 6 }, 6: { minProductivity: 85, minManagement: 8 }, 7: { minProductivity: 90, minManagement: 10 } }[e] || null;
}
function vd(e) {
  if (!e || !e.career) return false;
  const t = e.career.level + 1;
  if (t > 7) return false;
  const n = fd(t, e);
  return !!n && (!((e.stats.productivity || 0) < n.minProductivity) && !(n.minManagement && (e.skills?.management?.level || 0) < n.minManagement));
}
function bd(e) {
  if (!vd(e)) return false;
  const t = e.career.level, n = e.career.title, a = e.career.salary, o = t + 1, i = gameState.hierarchyLevels[o];
  if (!i) return false;
  const u2 = getMarketRate(e, o), G2 = getMarketRate(e, t);
  e.career.level = o, e.career.title = i.title, e.career.salary = u2 + Math.max(0, a - G2);
  const s = e.career.startDate;
  return e.career.startDate = Date.now(), e.career.promotionHistory.push({ date: Date.now(), fromLevel: t, toLevel: o, timeInRole: (Date.now() - s) / 864e5, reason: "Performance milestone reached" }), Dd(), uu(e, o), updatePeopleTab(), wd(e, n, t, a, i), console.log(`[Promotion] ${e.name} promoted from Level ${t} to Level ${o} (${i.title})`), true;
}
function wd(e, t, n, a, o) {
  const u2 = e.career?.salary ?? o.baseSalary, i = u2 - a, s = a > 0 ? Math.round(i / a * 100) : 0, r = document.createElement("div");
  r.id = "promotionCelebrationOverlay", r.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--eu); z-index:10000000; display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s;", r.innerHTML = ` <div style="background:linear-gradient(135deg, var(--ad) 0%, var(--t) 50%, var(--ad) 100%); border-radius:20px; padding:30px 35px; max-width:420px; width:90%; box-shadow:0 25px 80px rgba(78,204,163,0.3); border:2px solid var(--g); animation:slideIn 0.4s; text-align:center; position:relative; overflow:hidden;"> <!-- Confetti effect --> <div style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; overflow:hidden;" id="confettiContainer"></div> <div style="font-size:3rem; margin-bottom:10px; animation:bounceIn 0.6s;">\u{1F389}</div> <h2 style="margin:0 0 5px 0; color:var(--g); font-size:1.4rem; font-weight:700;">PROMOTION!</h2> <p style="color:var(--a); margin:0 0 20px 0; font-size:0.85rem;">${e.name} has been promoted</p> <!-- Before/After --> <div style="display:flex; align-items:center; justify-content:center; gap:15px; margin-bottom:20px;"> <div style="text-align:center; padding:12px 18px; background:var(--bb); border-radius:12px; border:1px solid var(--o); min-width:100px;"> <div style="font-size:0.7rem; color:var(--e); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Before</div> <div style="font-size:1rem; color:var(--k); font-weight:600;">${t}</div> <div style="font-size:0.75rem; color:var(--e); margin-top:2px;">Level ${n}</div> </div> <div style="font-size:1.5rem; color:var(--g); animation:pulse 1s infinite;">\u2192</div> <div style="text-align:center; padding:12px 18px; background:rgba(78,204,163,0.1); border-radius:12px; border:1px solid var(--cs); min-width:100px;"> <div style="font-size:0.7rem; color:var(--g); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Now</div> <div style="font-size:1rem; color:var(--g); font-weight:700;">${o.title}</div> <div style="font-size:0.75rem; color:var(--e); margin-top:2px;">Level ${e.career.level}</div> </div> </div> <!-- Salary change --> <div style="background:var(--bb); border-radius:10px; padding:12px 16px; margin-bottom:20px; border:1px solid var(--o);"> <div style="display:flex; justify-content:space-between; align-items:center;"> <span style="color:var(--e); font-size:0.85rem;">\u{1F4B0} Salary</span> <span style="color:var(--g); font-weight:600; font-size:0.95rem;">$${xu(a)} \u2192 $${xu(u2)}</span> </div> <div style="text-align:right; margin-top:4px;"> <span style="color:var(--g); font-size:0.75rem; background:rgba(78,204,163,0.15); padding:2px 8px; border-radius:10px;">+$${xu(i)}/yr (+${s}%)</span> </div> </div> <button onclick="this.closest('#promotionCelebrationOverlay').style.animation='fadeOut 0.2s';setTimeout(()=>document.getElementById('promotionCelebrationOverlay')?.remove(),200);" style="padding:12px 35px; background:linear-gradient(135deg, var(--n), #45b393); border:none; border-radius:10px; color:var(--q); cursor:pointer; font-weight:700; font-size:1rem; transition:all 0.2s; box-shadow:0 4px 15px rgba(78,204,163,0.3);"> Congratulations! \u{1F38A} </button> </div> `, document.body.appendChild(r);
  const l = r.querySelector("#confettiContainer"), c = ["var(--n)", "var(--l)", "var(--j)", "var(--dn)", "var(--v)", "#00d2ff"];
  for (let e2 = 0; e2 < 30; e2++) {
    const e3 = document.createElement("div"), t2 = c[Math.floor(Math.random() * c.length)], n2 = 100 * Math.random(), a2 = 2 * Math.random(), o2 = 4 + 6 * Math.random();
    e3.style.cssText = `position:absolute; top:-10px; left:${n2}%; width:${o2}px; height:${o2}px; background:${t2}; border-radius:${Math.random() > 0.5 ? "50%" : "2px"}; opacity:0.8; animation:confettiFall ${2 + 2 * Math.random()}s ${a2}s linear infinite;`, l.appendChild(e3);
  }
  if (!document.getElementById("confettiStyle")) {
    const e2 = document.createElement("style");
    e2.id = "confettiStyle", e2.textContent = "\n        @keyframes confettiFall { 0% { transform:translateY(-10px) rotate(0deg); opacity:1; } 100% { transform:translateY(500px) rotate(720deg); opacity:0; } }\n        @keyframes bounceIn { 0% { transform:scale(0); } 50% { transform:scale(1.2); } 100% { transform:scale(1); } }\n        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }\n      ", document.head.appendChild(e2);
  }
  r.addEventListener("click", (e2) => {
    e2.target === r && (r.style.animation = "fadeOut 0.2s", setTimeout(() => r.remove(), 200));
  });
}
function xd() {
  if (!gameState.employees || 0 === gameState.employees.length) return;
  let e = 0;
  gameState.employees.forEach((t) => {
    "active" === t.employmentStatus && t.career && vd(t) && bd(t) && e++;
  }), e > 0 && console.log(`[Promotion] Auto-promoted ${e} employee(s)`);
}
function canPromoteEmployee(e) {
  if (!e || "active" !== e.employmentStatus) return false;
  if (!e.career) return false;
  const t = Fd(e.id);
  if (!t) return false;
  const n = t.level;
  for (let t2 = Math.floor(n) + 1; t2 <= 6; t2++) {
    const n2 = gameState.corporatePyramid.positions[t2];
    if (n2) {
      for (const t3 of n2) if (zd(e, t3).canFill) return true;
    }
  }
  if ("secretary" !== t.positionId && e.career.level >= 1 && e.career.level <= 3) {
    const e2 = gameState.corporatePyramid.secretaryPosition;
    if (e2 && !e2.employeeId) return true;
  }
  return false;
}
function startPromotionFlow(e) {
  void 0 !== ModalManager && ModalManager.close && ModalManager.close("profileModal"), setTimeout(() => {
    openCorporatePyramidModal(e);
  }, 150);
}
function conductTrainingWorkshop() {
  const e = gameState.employees.filter((e2) => "active" === e2.employmentStatus);
  if (0 === e.length) return void showNotification("No active employees to train!", "error");
  const t = 500 * e.length;
  if (gameState.cash < t) return void showNotification(`Not enough cash! Training costs $${wu(t)} ($${wu(500)} per employee)`, "error");
  gameState.cash -= t;
  let n = 0;
  e.forEach((e2) => {
    e2.stats || (e2.stats = {});
    const t2 = e2.stats.productivity || 50, a = 5 + Math.floor(6 * Math.random());
    e2.stats.productivity = Math.min(100, t2 + a), gainSkillXP(e2, "management", 20, "training_workshop"), n++;
  }), gameState.productivitySystems || (gameState.productivitySystems = {}), gameState.productivitySystems.lastWorkshop = Date.now(), showNotification(`\u{1F393} Training Workshop completed! ${n} employees gained +5-10 productivity!`, "success"), logCompanyEvent({ type: "training", description: "Company-wide training workshop conducted", sentiment: "positive", importance: 6 }), flushPendingSave(), saveGame(false), updatePeopleTab(), updateUI();
}
function kd(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  if (!t || "active" !== t.employmentStatus) return void showNotification("Employee not found or inactive!", "error");
  gameState.productivitySystems || (gameState.productivitySystems = {}), gameState.productivitySystems.reviewCooldowns || (gameState.productivitySystems.reviewCooldowns = {});
  const n = gameState.productivitySystems.reviewCooldowns[e] || 0, a = (Date.now() - n) / 864e5;
  if (a < 7) {
    const e2 = Math.ceil(7 - a);
    return void showNotification(`${t.name} was recently reviewed. Wait ${e2} more day(s).`, "error");
  }
  if (gameState.cash < 200) return void showNotification(`Not enough cash! Performance review costs $${wu(200)}`, "error");
  gameState.cash -= 200, t.stats || (t.stats = {});
  const o = t.stats.productivity || 50;
  let i, s;
  o < 50 ? (i = 15 + Math.floor(6 * Math.random()), s = `${t.name} appreciated the feedback and showed significant improvement!`) : o < 75 ? (i = 10 + Math.floor(6 * Math.random()), s = `${t.name} took the feedback well and improved their productivity!`) : (i = 5 + Math.floor(6 * Math.random()), s = `${t.name} is already performing well, but found ways to optimize further!`), t.stats.productivity = Math.min(100, o + i), void 0 !== t.stats.affection && (t.stats.affection = Math.min(100, (t.stats.affection || 50) + 5)), gameState.productivitySystems.reviewCooldowns[e] = Date.now(), showNotification(`\u{1F4CA} ${s} (+${i} productivity)`, "success"), t.career || (t.career = {}), t.career.reviewHistory || (t.career.reviewHistory = []), t.career.reviewHistory.push({ date: Date.now(), productivityBefore: o, productivityAfter: t.stats.productivity, boost: i }), saveGame(), updatePeopleTab(), updateUI();
}
function conductTeamBuilding() {
  const e = gameState.employees.filter((e2) => "active" === e2.employmentStatus);
  if (0 === e.length) return void showNotification("No active employees for team building!", "error");
  gameState.productivitySystems || (gameState.productivitySystems = {});
  const t = gameState.productivitySystems.lastTeamBuilding || 0, n = (Date.now() - t) / 864e5;
  if (n < 14) return void showNotification(`Team building activities need time to be effective. Wait ${Math.ceil(14 - n)} more day(s).`, "error");
  const a = 800 * e.length;
  if (gameState.cash < a) return void showNotification(`Not enough cash! Team building costs $${wu(a)} ($${wu(800)} per employee)`, "error");
  gameState.cash -= a;
  let o = 0;
  e.forEach((e2) => {
    e2.stats || (e2.stats = {});
    const t2 = e2.stats.productivity || 50, n2 = 3 + Math.floor(5 * Math.random());
    e2.stats.productivity = Math.min(100, t2 + n2), void 0 !== e2.stats.affection && (e2.stats.affection = Math.min(100, (e2.stats.affection || 50) + 8)), void 0 !== e2.stats.comfort && (e2.stats.comfort = Math.min(100, (e2.stats.comfort || 50) + 8)), gainSkillXP(e2, "social", 30, "team_building"), o++;
  }), gameState.productivitySystems.lastTeamBuilding = Date.now(), showNotification(`\u{1F389} Team Building Activity completed! ${o} employees bonded and improved! (+3-7 productivity, +8 morale)`, "success"), logCompanyEvent({ type: "team_building", description: "Company team building event held", sentiment: "positive", importance: 7 }), flushPendingSave(), saveGame(false), updatePeopleTab(), updateUI();
}
function Sd() {
  return gameState.employees.filter((e) => "active" === e.employmentStatus);
}
function Td(tier, target) {
  if ("individual" === tier) {
    const e = gameState.employees.find((x) => x.id === target);
    return e ? [e] : [];
  }
  return "department" === tier ? Sd().filter((e) => e.locationId === target) : Sd();
}
function $d(list, stat) {
  return list && list.length ? list.reduce((s, e) => s + (e.stats?.[stat] ?? 50), 0) / list.length : 50;
}
function Cd(e, stat, delta) {
  e.stats || (e.stats = {}), e.stats[stat] = Math.max(0, Math.min(100, (e.stats[stat] ?? 50) + delta));
}
function Ed(e, days, reason) {
  e.unavailable = true, e.unavailableUntil = (gameState.currentDay || 0) + days, e.unavailableReason = reason;
}
function Id(u2, multiplier, days) {
  gameState.products.forEach((p) => {
    p.locationId === u2 && (p.temporaryBoosts || (p.temporaryBoosts = []), p.temporaryBoosts.push({ multiplier, expiresDay: (gameState.currentDay || 0) + days, source: "program" }));
  });
}
function Md(multiplier, days) {
  gameState.products.forEach((p) => {
    p.temporaryBoosts || (p.temporaryBoosts = []), p.temporaryBoosts.push({ multiplier, expiresDay: (gameState.currentDay || 0) + days, source: "program" });
  });
}
