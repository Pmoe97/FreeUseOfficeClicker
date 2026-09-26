// ============================================================================
// 37-upgrades — Upgrades: capital panes, workforce/location programs, flagship status, product upgrades, managers, gifts/hr tab updaters.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

let ku = "upgrades", Tu = null;
function switchCapitalPane(e) {
  ku = e;
  const t = $("capUpgradesPane"), n = $("capInvestPane");
  t && (t.hidden = "upgrades" !== e), n && (n.hidden = "invest" !== e), document.querySelectorAll("#capitalSeg button").forEach((t2) => {
    t2.classList.toggle("is-active", t2.dataset.cap === e);
  }), "invest" === e ? (Pb(), Mb()) : updateUpgradesTab();
}
function switchCapitalLocation(e) {
  Tu = e, updateUpgradesTab();
}
function $u(e) {
  const t = !!e.max && e.level >= e.max, n = !t && gameState.cash >= e.cost, a = e.lvlText || `Lv ${e.level}${e.max ? `/${e.max}` : ""}`, o = t ? `<span class="badge upg-max">${e.maxText || (e.oneTime ? "OWNED" : "MAXED")}</span>` : `<button class="btn upg-buy num ${n ? "btn--be" : "btn--outline"}" ${n ? "" : "disabled"} data-cost="${e.cost}" onclick="${e.act}">$${wu(e.cost)}</button>`;
  return `<div class="upg-row${t ? " is-maxed" : ""}"><div class="upg-info"><div class="upg-name">${e.icon ? `${e.icon} ` : ""}${e.name}</div><div class="upg-desc">${e.desc}</div></div><div class="upg-state"><span class="pill num">${a}</span><span class="upg-eff num">${t || !e.effNext ? e.effNow : `${e.effNow} \u2192 ${e.effNext}`}</span></div>${o}</div>`;
}
function updateUpgradesTab() {
  const e = $("capCashPill");
  e && (e.textContent = `$${wu(Math.floor(gameState.cash))}`);
  const t = $("capOpsList");
  if (t) {
    const e2 = gameState.globalUpgrades?.clickPower || 0, n2 = gameState.influenceUpgrades?.clickPower || 0, a2 = 1 + 0.1 * e2 + Cb.clickPower.effect(n2), o2 = gameState.globalUpgrades?.goldenTouch || 0, i2 = gameState.globalUpgrades?.timeDilation || 0, s2 = gameState.globalUpgrades?.empireBuilder || 0;
    t.innerHTML = [$u({ icon: "\u{1F446}", name: "Click Power", desc: `Manual intervention training. Base \u22121.0s per click, +0.1s per level${n2 > 0 ? " (total includes Quick Hands)" : ""}.`, level: e2, effNow: `\u2212${a2.toFixed(2)}s/click`, effNext: `\u2212${(a2 + 0.1).toFixed(2)}s/click`, cost: Math.floor(le.upgradeBaseCosts.clickPower * Math.pow(2, e2)), act: "buyClickPower()" }), $u({ icon: "\u{1F91A}", name: "Golden Touch", desc: "Executive presence, monetized. All income +5% per level.", level: o2, effNow: `+${5 * o2}%`, effNext: `+${5 * (o2 + 1)}%`, cost: Math.floor(1e18 * Math.pow(10, o2)), act: "buyGoldenTouch()" }), $u({ icon: "\u23F1\uFE0F", name: "Time Dilation", desc: "Calendar compression at scale. All products produce 3% faster per level.", level: i2, effNow: `+${3 * i2}% speed`, effNext: `+${3 * (i2 + 1)}% speed`, cost: Math.floor(5e18 * Math.pow(12, i2)), act: "buyTimeDilation()" }), $u({ icon: "\u{1F451}", name: "Empire Builder", desc: "Org-chart densification. Employee productivity +10% per level.", level: s2, effNow: `+${10 * s2}%`, effNext: `+${10 * (s2 + 1)}%`, cost: Math.floor(1e19 * Math.pow(15, s2)), act: "buyEmpireBuilder()" })].join("");
  }
  const n = gameState.locations.filter((e2) => e2.unlocked), a = $("capLocBar"), o = $("capLocList");
  if (a && o && n.length) {
    n.some((e2) => e2.id === Tu) || (Tu = n.some((e2) => e2.id === gameState.activeLocationId) ? gameState.activeLocationId : n[0].id), a.innerHTML = n.map((e2) => `<button class="${e2.id === Tu ? "is-active" : ""}" onclick="switchCapitalLocation('${e2.id}')">${e2.name}</button>`).join("");
    const t2 = Tu;
    o.innerHTML = Cu(t2).join("");
  }
  const i = $("capWorkforceBand"), s = $("capWorkforceList");
  if (i && s) {
    const e2 = Mu();
    i.hidden = 0 === e2.length, s.innerHTML = e2.join("");
  }
}
function Cu(e) {
  const t = gameState.globalUpgrades?.incomeBoost?.[e] || 0, n = gameState.globalUpgrades?.costReduction?.[e] || 0;
  return [$u({ icon: "\u{1F4B0}", name: "Income Boost", desc: "Site-wide revenue enhancement program. All products here earn +10% per level.", level: t, effNow: `+${10 * t}%`, effNext: `+${10 * (t + 1)}%`, cost: Math.floor(le.upgradeBaseCosts.incomeBoost[e] * Math.pow(2.5, t)), act: `buyIncomeBoost('${e}')` }), $u({ icon: "\u{1F4B8}", name: "Cost Reduction", desc: "Preferred-rate procurement. All spending here costs \u22125% per level: unlocks, upgrades, staff.", level: n, max: 19, effNow: `\u2212${Math.min(95, 5 * n)}%`, effNext: `\u2212${Math.min(95, 5 * (n + 1))}%`, cost: Math.floor(le.upgradeBaseCosts.costReduction[e] * Math.pow(3, n)), act: `buyCostReduction('${e}')` }), ...Object.values(Pu).map((t2) => {
    const n2 = Au(t2.key, e);
    return $u({ icon: t2.icon, name: t2.name, desc: t2.desc, level: n2, max: t2.max, oneTime: t2.oneTime, effNow: t2.eff(n2), effNext: n2 < t2.max && !t2.oneTime ? t2.eff(n2 + 1) : "", cost: Math.floor(le.upgradeBaseCosts.costReduction[e] * t2.baseMult * Math.pow(t2.costGrowth, n2)), act: `buyLocationProgram('${t2.key}','${e}')` });
  }), (() => {
    const t2 = gameState.globalUpgrades?.flagship || { locationId: null, moves: 0 }, n2 = t2.locationId === e;
    return $u({ icon: "\u{1F3DB}\uFE0F", name: "Flagship Status", desc: "Exactly one site carries the brand. +25% income here. Re-designation fees escalate.", level: n2 ? 1 : 0, max: 1, oneTime: true, maxText: "FLAGSHIP", lvlText: n2 ? "Designated" : t2.locationId ? "Held elsewhere" : "Unassigned", effNow: "+25% income", cost: Math.floor(4 * le.upgradeBaseCosts.costReduction[e] * Math.pow(2, t2.moves)), act: `buyFlagshipStatus('${e}')` });
  })()];
}
const Eu = { ergonomics: { key: "ergonomics", icon: "\u{1FA91}", name: "Ergonomic Compliance Initiative", desc: "Chairs that meet the standard the chairs are measured by. Staffed-product output +4% per level.", baseCost: 2e5, mult: 1.8, max: 20, eff: (e) => `+${4 * e}% output` }, promotionTrack: { key: "promotionTrack", icon: "\u{1F4C8}", name: "Internal Promotion Track", desc: "Growth opportunities, printed on cardstock. Staff position upgrades cost \u22125% per level.", baseCost: 1e6, mult: 2.2, max: 8, eff: (e) => `\u2212${5 * e}% upgrade cost` }, payrollConsultants: { key: "payrollConsultants", icon: "\u{1F9FE}", name: "Payroll Optimization Consultants", desc: "They found inefficiencies. The inefficiencies were wages. Total payroll \u22124% per level.", baseCost: 2e6, mult: 2, max: 8, eff: (e) => `\u2212${4 * e}% payroll` }, recruiting: { key: "recruiting", icon: "\u{1F3AF}", name: "Executive Recruiting Retainer", desc: "A wider funnel of qualified persons. +1 candidate per hiring round per level.", baseCost: 75e4, mult: 3, max: 3, eff: (e) => `${3 + e} candidates` } };
function Iu(e) {
  return gameState.globalUpgrades?.workforce?.[e] || 0;
}
function buyWorkforceUpgrade(e) {
  const t = Eu[e];
  if (!t) return;
  const n = Iu(e);
  if (n >= t.max) return showNotification("Already at policy ceiling.");
  const a = Math.floor(t.baseCost * Math.pow(t.mult, n));
  if (gameState.cash < a) return showNotification("Not enough cash!");
  gameState.globalUpgrades || (gameState.globalUpgrades = {}), gameState.globalUpgrades.workforce || (gameState.globalUpgrades.workforce = {}), gameState.cash -= a, gameState.globalUpgrades.workforce[e] = n + 1, showNotification(`${t.name} \u2192 level ${n + 1}`), updateUpgradesTab(), updateUI();
}
function Mu() {
  return Object.values(Eu).map((e) => {
    const t = Iu(e.key);
    return $u({ icon: e.icon, name: e.name, desc: e.desc, level: t, max: e.max, effNow: e.eff(t), effNext: t < e.max ? e.eff(t + 1) : "", cost: Math.floor(e.baseCost * Math.pow(e.mult, t)), act: `buyWorkforceUpgrade('${e.key}')` });
  });
}
const Pu = { nightShift: { key: "nightShift", icon: "\u{1F319}", name: "Night Shift Authorization", desc: "The lights stay on; the paperwork says it's voluntary. Products here cycle +5% faster per level.", baseMult: 1.5, costGrowth: 2.4, max: 5, eff: (e) => `+${5 * e}% speed` }, expressPermit: { key: "expressPermit", icon: "\u{1F4DC}", name: "Express Permitting Variance", desc: "A variance was obtained. Products here can be unlocked in any order.", baseMult: 5, costGrowth: 1, max: 1, oneTime: true, eff: (e) => e > 0 ? "Chain waived" : "Unlock in any order" }, keyholder: { key: "keyholder", icon: "\u{1F5DD}\uFE0F", name: "After-Hours Keyholder", desc: "Someone trustworthy has a key now. Idle products here restart on their own, no staff required.", baseMult: 8, costGrowth: 1, max: 1, oneTime: true, eff: (e) => e > 0 ? "Auto-start active" : "Auto-start idle products" } };
function Au(e, t) {
  return gameState.globalUpgrades?.[e]?.[t] || 0;
}
function buyLocationProgram(e, t) {
  const n = Pu[e];
  if (!n) return;
  const a = Au(e, t);
  if (a >= n.max) return;
  const o = Math.floor(le.upgradeBaseCosts.costReduction[t] * n.baseMult * Math.pow(n.costGrowth, a));
  if (gameState.cash < o) return showNotification("Not enough cash!");
  gameState.globalUpgrades || (gameState.globalUpgrades = {}), gameState.globalUpgrades[e] || (gameState.globalUpgrades[e] = {});
  const i = gameState.locations.find((e2) => e2.id === t);
  gameState.cash -= o, gameState.globalUpgrades[e][t] = a + 1, showNotification(`${n.name} \u2014 ${i ? i.name : t}`), updateUpgradesTab(), updateUI();
}
function Lu(e) {
  if ((gameState.influenceUpgrades?.procurementDesk || 0) < 1) return;
  const t = document.createElement("div");
  t.className = "biz-bulkbar", t.innerHTML = '<button class="btn btn--outline" onclick="maxUpgradeAllProducts()">\u{1F587}\uFE0F Upgrade All (Max)</button>', e.appendChild(t);
}
function maxUpgradeAllProducts() {
  const e = gameState.products.filter((e2) => e2.locationId === gameState.activeLocationId && e2.unlocked && e2.level < 999);
  let t = 0, n = 0, a = 0;
  e.forEach((e2) => {
    const o = zu(e2, gameState.cash);
    o.count > 0 && (gameState.cash -= o.totalCost, e2.level = Math.min(999, e2.level + o.count), e2.upgradeCost = e2.level < 999 ? Ou(e2) : 0, t += o.count, n += o.totalCost, a++);
  }), t > 0 ? (showNotification(`Procurement Desk: +${t} levels across ${a} product${1 === a ? "" : "s"} for $${wu(n)}`), updateProductsList()) : showNotification("Nothing affordable to upgrade here.");
}
function buyFlagshipStatus(e) {
  gameState.globalUpgrades || (gameState.globalUpgrades = {}), gameState.globalUpgrades.flagship || (gameState.globalUpgrades.flagship = { locationId: null, moves: 0 });
  const t = gameState.globalUpgrades.flagship;
  if (t.locationId === e) return;
  const n = Math.floor(4 * le.upgradeBaseCosts.costReduction[e] * Math.pow(2, t.moves));
  if (gameState.cash < n) return showNotification("Not enough cash!");
  const a = gameState.locations.find((t2) => t2.id === e);
  gameState.cash -= n, t.locationId && (t.moves += 1), t.locationId = e, showNotification(`Flagship designation: ${a ? a.name : e}. +25% income on site.`), updateUpgradesTab(), updateUI();
}
function Nu() {
  if ("upgrades" !== gameState.activeTab) return;
  const e = $("capCashPill");
  if (e) {
    const t2 = `$${wu(Math.floor(gameState.cash))}`;
    e.textContent !== t2 && (e.textContent = t2);
  }
  const t = $("capInvestDot");
  if (t) {
    const e2 = gameState.lifetimeEarnings >= 1e5 && Eb() > 0 || Object.values(Cb).some((e3) => e3.getCurrentLevel() < e3.maxLevel && gameState.influencePoints >= Ib(e3.id));
    t.hidden === e2 && (t.hidden = !e2);
  }
  if ("invest" === ku) return Pb(), void document.querySelectorAll("#influenceUpgradesContainer .upg-buy").forEach((e2) => {
    const t2 = parseFloat(e2.dataset.ipcost) || 0, n = gameState.influencePoints >= t2;
    e2.disabled === n && (e2.disabled = !n, e2.classList.toggle("btn--be", n), e2.classList.toggle("btn--outline", !n));
  });
  document.querySelectorAll("#capUpgradesPane .upg-buy").forEach((e2) => {
    const t2 = parseFloat(e2.dataset.cost) || 0, n = gameState.cash >= t2;
    e2.disabled === n && (e2.disabled = !n, e2.classList.toggle("btn--be", n), e2.classList.toggle("btn--outline", !n));
  });
}
function _u(e) {
  const t = gameState.globalUpgrades?.costReduction?.[e] || 0;
  return t > 0 ? 1 - Math.min(95, 5 * t) / 100 : 1;
}
function Ru() {
  const e = gameState.influenceUpgrades?.productDiscount || 0;
  return Cb.productDiscount.effect(e);
}
function Du(e) {
  if (!e.baseUpgradeCost) {
    const t = e.costGrowth || le.productCostMultiplier;
    let n = e.upgradeCost / Math.pow(t, Math.max(0, e.level));
    e.level > 0 && (n /= _u(e.locationId)), e.baseUpgradeCost = Math.max(1, Math.floor(n));
  }
  return e.baseUpgradeCost;
}
function Ou(e, t = 0) {
  const n = Du(e), a = e.costGrowth || le.productCostMultiplier;
  return Math.max(1, Math.floor(n * Math.pow(a, e.level + t) * _u(e.locationId) * Ru()));
}
function Bu(e) {
  return Math.floor(e.unlockCost * _u(e.locationId) * Ru());
}
function Fu(e) {
  const t = gameState.influenceUpgrades?.employeeDiscount || 0;
  return Math.floor(e.managerHireCost * Cb.employeeDiscount.effect(t) * _u(e.locationId));
}
function ju(e) {
  const t = 1 - 0.05 * (gameState.globalUpgrades?.workforce?.promotionTrack || 0);
  return Math.floor(e.managerUpgradeCost * _u(e.locationId) * t);
}
function qu(e, t) {
  if (t <= 0) return 0;
  let n = 0;
  for (let a = 0; a < t; a++) n += Ou(e, a);
  return n;
}
function zu(e, t) {
  let n = 0, a = 0;
  for (; !(e.level + n >= 999); ) {
    const o = Ou(e, n);
    if (a + o > t) break;
    if (a += o, n++, n >= 1e3) break;
  }
  return { count: n, totalCost: a };
}
function upgradeProduct(e) {
  const t = gameState.products.find((t2) => t2.id === e);
  if (!t) return;
  const n = 999;
  if (t.level >= n) return showNotification(`${t.name} is at max level (999)!`);
  const a = document.querySelector(`.upgrade-product-btn[data-id="${e}"]`), o = Math.min(a && parseInt(a.dataset.count) || 1, n - t.level), i = qu(t, o);
  if (gameState.cash < i) return showNotification("Not enough cash!");
  gameState.cash -= i;
  const c = o;
  t.level += o, t.upgradeCost = t.level < n ? Ou(t) : 0, showNotification(`${t.name} upgraded to Lv.${t.level}${c > 1 ? ` (+${c})` : ""}${t.level >= n ? " [MAX]" : ""}`), updateProductsList();
}
function hireOrUpgradeManager(e) {
  const t = gameState.products.find((t2) => t2.id === e);
  if (t) if (t.managerHired) {
    if (t.managerOnboarding) return showNotification("Staff onboarding in progress. Position upgrade available after onboarding completes.");
    const n = ju(t);
    if (gameState.cash < n) return showNotification("Not enough cash!");
    gameState.cash -= n, t.managerLevel += 1, t.managerUpgradeCost = Math.floor(1.25 * t.managerUpgradeCost), showNotification(`${t.name} position upgraded to Lv.${t.managerLevel} - Better equipment & efficiency!`), updatePeopleTab(), updateProductsList();
  } else Sc(e);
}
function createOrLinkManagerNPC(e) {
  const t = `mgr_${e.id}`;
  if (gameState.employees.some((e2) => e2.id === t)) return;
  const n = ["Jade", "Morgan", "Riley", "Avery", "Sam", "Harper", "Quinn", "Rowan"], a = ["Park", "Davis", "Johnson", "Garcia", "Smith", "Lee", "Kim", "Patel"], o = { id: t, name: `${n[Math.floor(Math.random() * n.length)]} ${a[Math.floor(Math.random() * a.length)]}`, position: `Manager \u2013 ${e.name}`, trait: "Workhorse", personality: "Friendly", stats: { comfort: bu("comfort"), affection: bu("affection"), desire: bu("desire"), trust: bu("trust"), friendship: bu("friendship"), productivity: bu("productivity") }, hired: true, level: 1, bio: `Keeps ${e.name} on track.`, employmentStatus: "active", location: e.locationId || "headquarters" };
  initializeEmployeeSocialData(o), gameState.employees.push(o), "dashboard" === gameState.activeTab && sd(), generateRandomRelationships(o.id), generateFirstEmployeePost(o).catch((e2) => {
    console.error("First post generation failed:", e2);
  });
}
function updateGiftsTab() {
  const a = $("recommendedGiftRange");
  if (a && "function" == typeof Pr) {
    const s = Pr();
    a.textContent = `$${Math.round(s.minRecommended).toLocaleString()} - $${Math.round(s.maxRecommended).toLocaleString()}`;
  }
  switch (Nc) {
    case "inventory":
      updateGiftInventory();
      break;
    case "vault":
      Fc();
      break;
    case "craft":
      Hc();
      break;
    default:
      updateGiftStore();
  }
}
function updateHRTab() {
  const e = $("atmosphereSlider"), t = $("atmosphereValue"), n = $("guidelinesSlider"), a = $("guidelinesValue"), o = $("policyValue");
  if (e && t) {
    e.value = gameState.settings.atmosphere ?? 50;
    const n2 = gameState.settings.atmosphere ?? 50;
    let a2 = "Balanced";
    n2 < 33 ? a2 = "Professional" : n2 > 66 && (a2 = "Relaxed"), t.textContent = a2;
  }
  if (n && a) {
    n.value = gameState.settings.guidelines ?? 50;
    const e2 = gameState.settings.guidelines ?? 50;
    let t2 = "Standard";
    e2 < 33 ? t2 = "Reserved" : e2 > 66 && (t2 = "Outgoing"), a.textContent = t2;
  }
  if (document.querySelectorAll(".policy-btn").forEach((e2) => {
    e2.classList.toggle("active", e2.dataset.policy === gameState.settings.policy);
  }), o) {
    const e2 = { professional: "Professional", casual: "Casual", open: "Enthusiastic" };
    o.textContent = e2[gameState.settings.policy] || "Professional";
  }
}
