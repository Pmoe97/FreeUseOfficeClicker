// ============================================================================
// 37-upgrades — Upgrades: capital panes, workforce/location programs, flagship status, product upgrades, managers, gifts/hr tab updaters.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

let capitalPane = "upgrades",
    capitalLocId = null;
function switchCapitalPane(e) {
    capitalPane = e;
    const t = $("capUpgradesPane"),
        n = $("capInvestPane");
    t && (t.hidden = "upgrades" !== e),
        n && (n.hidden = "invest" !== e),
        document.querySelectorAll("#capitalSeg button").forEach((t) => {
            t.classList.toggle("is-active", t.dataset.cap === e);
        }),
        "invest" === e ? (updatePrestigeUI(), renderInfluenceUpgrades()) : updateUpgradesTab();
}
function switchCapitalLocation(e) {
    (capitalLocId = e), updateUpgradesTab();
}
function capRow(e) {
    const t = !!e.max && e.level >= e.max,
        n = !t && gameState.cash >= e.cost,
        a = e.lvlText || `Lv ${e.level}${e.max ? `/${e.max}` : ""}`,
        o = t
            ? `<span class="badge upg-max">${e.maxText || (e.oneTime ? "OWNED" : "MAXED")}</span>`
            : `<button class="btn upg-buy num ${n ? "btn--primary" : "btn--outline"}" ${n ? "" : "disabled"} data-cost="${e.cost}" onclick="${e.act}">$${formatNumber(e.cost)}</button>`;
    return `<div class="upg-row${t ? " is-maxed" : ""}"><div class="upg-info"><div class="upg-name">${e.icon ? `${e.icon} ` : ""}${e.name}</div><div class="upg-desc">${e.desc}</div></div><div class="upg-state"><span class="pill num">${a}</span><span class="upg-eff num">${t || !e.effNext ? e.effNow : `${e.effNow} → ${e.effNext}`}</span></div>${o}</div>`;
}
function updateUpgradesTab() {
    const e = $("capCashPill");
    e && (e.textContent = `$${formatNumber(Math.floor(gameState.cash))}`);
    const t = $("capOpsList");
    if (t) {
        const e = gameState.globalUpgrades?.clickPower || 0,
            n = gameState.influenceUpgrades?.clickPower || 0,
            a = 1 + 0.1 * e + influenceUpgrades.clickPower.effect(n),
            o = gameState.globalUpgrades?.goldenTouch || 0,
            i = gameState.globalUpgrades?.timeDilation || 0,
            s = gameState.globalUpgrades?.empireBuilder || 0;
        t.innerHTML = [
            capRow({
                icon: "👆",
                name: "Click Power",
                desc: `Manual intervention training. Base −1.0s per click, +0.1s per level${n > 0 ? " (total includes Quick Hands)" : ""}.`,
                level: e,
                effNow: `−${a.toFixed(2)}s/click`,
                effNext: `−${(a + 0.1).toFixed(2)}s/click`,
                cost: Math.floor(gameBalance.upgradeBaseCosts.clickPower * Math.pow(2, e)),
                act: "buyClickPower()",
            }),
            capRow({
                icon: "🤚",
                name: "Golden Touch",
                desc: "Executive presence, monetized. All income +5% per level.",
                level: o,
                effNow: `+${5 * o}%`,
                effNext: `+${5 * (o + 1)}%`,
                cost: Math.floor(1e18 * Math.pow(10, o)),
                act: "buyGoldenTouch()",
            }),
            capRow({
                icon: "⏱️",
                name: "Time Dilation",
                desc: "Calendar compression at scale. All products produce 3% faster per level.",
                level: i,
                effNow: `+${3 * i}% speed`,
                effNext: `+${3 * (i + 1)}% speed`,
                cost: Math.floor(5e18 * Math.pow(12, i)),
                act: "buyTimeDilation()",
            }),
            capRow({
                icon: "👑",
                name: "Empire Builder",
                desc: "Org-chart densification. Employee productivity +10% per level.",
                level: s,
                effNow: `+${10 * s}%`,
                effNext: `+${10 * (s + 1)}%`,
                cost: Math.floor(1e19 * Math.pow(15, s)),
                act: "buyEmpireBuilder()",
            }),
        ].join("");
    }
    const n = gameState.locations.filter((e) => e.unlocked),
        a = $("capLocBar"),
        o = $("capLocList");
    if (a && o && n.length) {
        n.some((e) => e.id === capitalLocId) ||
            (capitalLocId = n.some((e) => e.id === gameState.activeLocationId)
                ? gameState.activeLocationId
                : n[0].id);
        a.innerHTML = n
            .map(
                (e) =>
                    `<button class="${e.id === capitalLocId ? "is-active" : ""}" onclick="switchCapitalLocation('${e.id}')">${e.name}</button>`
            )
            .join("");
        const t = capitalLocId;
        o.innerHTML = getLocationProgramRows(t).join("");
    }
    const i = $("capWorkforceBand"),
        s = $("capWorkforceList");
    if (i && s) {
        const e = getWorkforceRows();
        (i.hidden = 0 === e.length), (s.innerHTML = e.join(""));
    }
}
function getLocationProgramRows(e) {
    const t = gameState.globalUpgrades?.incomeBoost?.[e] || 0,
        n = gameState.globalUpgrades?.costReduction?.[e] || 0;
    return [
        capRow({
            icon: "💰",
            name: "Income Boost",
            desc: "Site-wide revenue enhancement program. All products here earn +10% per level.",
            level: t,
            effNow: `+${10 * t}%`,
            effNext: `+${10 * (t + 1)}%`,
            cost: Math.floor(gameBalance.upgradeBaseCosts.incomeBoost[e] * Math.pow(2.5, t)),
            act: `buyIncomeBoost('${e}')`,
        }),
        capRow({
            icon: "💸",
            name: "Cost Reduction",
            desc: "Preferred-rate procurement. All spending here costs −5% per level: unlocks, upgrades, staff.",
            level: n,
            max: 19,
            effNow: `−${Math.min(95, 5 * n)}%`,
            effNext: `−${Math.min(95, 5 * (n + 1))}%`,
            cost: Math.floor(gameBalance.upgradeBaseCosts.costReduction[e] * Math.pow(3, n)),
            act: `buyCostReduction('${e}')`,
        }),
        ...Object.values(locationPrograms).map((t) => {
            const n = getLocationProgramLevel(t.key, e);
            return capRow({
                icon: t.icon,
                name: t.name,
                desc: t.desc,
                level: n,
                max: t.max,
                oneTime: t.oneTime,
                effNow: t.eff(n),
                effNext: n < t.max && !t.oneTime ? t.eff(n + 1) : "",
                cost: Math.floor(
                    gameBalance.upgradeBaseCosts.costReduction[e] * t.baseMult * Math.pow(t.costGrowth, n)
                ),
                act: `buyLocationProgram('${t.key}','${e}')`,
            });
        }),
        (() => {
            const t = gameState.globalUpgrades?.flagship || { locationId: null, moves: 0 },
                n = t.locationId === e;
            return capRow({
                icon: "🏛️",
                name: "Flagship Status",
                desc: "Exactly one site carries the brand. +25% income here. Re-designation fees escalate.",
                level: n ? 1 : 0,
                max: 1,
                oneTime: !0,
                maxText: "FLAGSHIP",
                lvlText: n ? "Designated" : t.locationId ? "Held elsewhere" : "Unassigned",
                effNow: "+25% income",
                cost: Math.floor(4 * gameBalance.upgradeBaseCosts.costReduction[e] * Math.pow(2, t.moves)),
                act: `buyFlagshipStatus('${e}')`,
            });
        })(),
    ];
}
const workforceUpgrades = {
    ergonomics: {
        key: "ergonomics",
        icon: "🪑",
        name: "Ergonomic Compliance Initiative",
        desc: "Chairs that meet the standard the chairs are measured by. Staffed-product output +4% per level.",
        baseCost: 2e5,
        mult: 1.8,
        max: 20,
        eff: (e) => `+${4 * e}% output`,
    },
    promotionTrack: {
        key: "promotionTrack",
        icon: "📈",
        name: "Internal Promotion Track",
        desc: "Growth opportunities, printed on cardstock. Staff position upgrades cost −5% per level.",
        baseCost: 1e6,
        mult: 2.2,
        max: 8,
        eff: (e) => `−${5 * e}% upgrade cost`,
    },
    payrollConsultants: {
        key: "payrollConsultants",
        icon: "🧾",
        name: "Payroll Optimization Consultants",
        desc: "They found inefficiencies. The inefficiencies were wages. Total payroll −4% per level.",
        baseCost: 2e6,
        mult: 2.0,
        max: 8,
        eff: (e) => `−${4 * e}% payroll`,
    },
    recruiting: {
        key: "recruiting",
        icon: "🎯",
        name: "Executive Recruiting Retainer",
        desc: "A wider funnel of qualified persons. +1 candidate per hiring round per level.",
        baseCost: 75e4,
        mult: 3.0,
        max: 3,
        eff: (e) => `${3 + e} candidates`,
    },
};
function getWorkforceLevel(e) {
    return gameState.globalUpgrades?.workforce?.[e] || 0;
}
function buyWorkforceUpgrade(e) {
    const t = workforceUpgrades[e];
    if (!t) return;
    const n = getWorkforceLevel(e);
    if (n >= t.max) return showNotification("Already at policy ceiling.");
    const a = Math.floor(t.baseCost * Math.pow(t.mult, n));
    if (gameState.cash < a) return showNotification("Not enough cash!");
    gameState.globalUpgrades || (gameState.globalUpgrades = {}),
        gameState.globalUpgrades.workforce || (gameState.globalUpgrades.workforce = {});
    (gameState.cash -= a),
        (gameState.globalUpgrades.workforce[e] = n + 1),
        showNotification(`${t.name} → level ${n + 1}`),
        updateUpgradesTab(),
        updateUI();
}
function getWorkforceRows() {
    return Object.values(workforceUpgrades).map((e) => {
        const t = getWorkforceLevel(e.key);
        return capRow({
            icon: e.icon,
            name: e.name,
            desc: e.desc,
            level: t,
            max: e.max,
            effNow: e.eff(t),
            effNext: t < e.max ? e.eff(t + 1) : "",
            cost: Math.floor(e.baseCost * Math.pow(e.mult, t)),
            act: `buyWorkforceUpgrade('${e.key}')`,
        });
    });
}
const locationPrograms = {
    nightShift: {
        key: "nightShift",
        icon: "🌙",
        name: "Night Shift Authorization",
        desc: "The lights stay on; the paperwork says it's voluntary. Products here cycle +5% faster per level.",
        baseMult: 1.5,
        costGrowth: 2.4,
        max: 5,
        eff: (e) => `+${5 * e}% speed`,
    },
    expressPermit: {
        key: "expressPermit",
        icon: "📜",
        name: "Express Permitting Variance",
        desc: "A variance was obtained. Products here can be unlocked in any order.",
        baseMult: 5,
        costGrowth: 1,
        max: 1,
        oneTime: !0,
        eff: (e) => (e > 0 ? "Chain waived" : "Unlock in any order"),
    },
    keyholder: {
        key: "keyholder",
        icon: "🗝️",
        name: "After-Hours Keyholder",
        desc: "Someone trustworthy has a key now. Idle products here restart on their own, no staff required.",
        baseMult: 8,
        costGrowth: 1,
        max: 1,
        oneTime: !0,
        eff: (e) => (e > 0 ? "Auto-start active" : "Auto-start idle products"),
    },
};
function getLocationProgramLevel(e, t) {
    return gameState.globalUpgrades?.[e]?.[t] || 0;
}
function buyLocationProgram(e, t) {
    const n = locationPrograms[e];
    if (!n) return;
    const a = getLocationProgramLevel(e, t);
    if (a >= n.max) return;
    const o = Math.floor(gameBalance.upgradeBaseCosts.costReduction[t] * n.baseMult * Math.pow(n.costGrowth, a));
    if (gameState.cash < o) return showNotification("Not enough cash!");
    gameState.globalUpgrades || (gameState.globalUpgrades = {}),
        gameState.globalUpgrades[e] || (gameState.globalUpgrades[e] = {});
    const i = gameState.locations.find((e) => e.id === t);
    (gameState.cash -= o),
        (gameState.globalUpgrades[e][t] = a + 1),
        showNotification(`${n.name} — ${i ? i.name : t}`),
        updateUpgradesTab(),
        updateUI();
}
function renderProcurementBar(e) {
    if ((gameState.influenceUpgrades?.procurementDesk || 0) < 1) return;
    const t = document.createElement("div");
    (t.className = "biz-bulkbar"),
        (t.innerHTML = `<button class="btn btn--outline" onclick="maxUpgradeAllProducts()">🖇️ Upgrade All (Max)</button>`),
        e.appendChild(t);
}
function maxUpgradeAllProducts() {
    const e = gameState.products.filter(
        (e) => e.locationId === gameState.activeLocationId && e.unlocked && e.level < 999
    );
    let t = 0,
        n = 0,
        a = 0;
    e.forEach((e) => {
        const o = calculateMaxAffordableUpgrades(e, gameState.cash);
        o.count > 0 &&
            ((gameState.cash -= o.totalCost),
            (e.level = Math.min(999, e.level + o.count)),
            (e.upgradeCost = e.level < 999 ? getProductUpgradeCost(e) : 0),
            (t += o.count),
            (n += o.totalCost),
            a++);
    });
    t > 0
        ? (showNotification(
              `Procurement Desk: +${t} levels across ${a} product${1 === a ? "" : "s"} for $${formatNumber(n)}`
          ),
          updateProductsList())
        : showNotification("Nothing affordable to upgrade here.");
}
function buyFlagshipStatus(e) {
    gameState.globalUpgrades || (gameState.globalUpgrades = {}),
        gameState.globalUpgrades.flagship || (gameState.globalUpgrades.flagship = { locationId: null, moves: 0 });
    const t = gameState.globalUpgrades.flagship;
    if (t.locationId === e) return;
    const n = Math.floor(4 * gameBalance.upgradeBaseCosts.costReduction[e] * Math.pow(2, t.moves));
    if (gameState.cash < n) return showNotification("Not enough cash!");
    const a = gameState.locations.find((t) => t.id === e);
    (gameState.cash -= n),
        t.locationId && (t.moves += 1),
        (t.locationId = e),
        showNotification(`Flagship designation: ${a ? a.name : e}. +25% income on site.`),
        updateUpgradesTab(),
        updateUI();
}
function refreshCapitalTab() {
    if ("upgrades" !== gameState.activeTab) return;
    const e = $("capCashPill");
    if (e) {
        const t = `$${formatNumber(Math.floor(gameState.cash))}`;
        e.textContent !== t && (e.textContent = t);
    }
    const t = $("capInvestDot");
    if (t) {
        const e =
            (gameState.lifetimeEarnings >= 1e5 && calculateInfluenceGain() > 0) ||
            Object.values(influenceUpgrades).some(
                (e) =>
                    e.getCurrentLevel() < e.maxLevel && gameState.influencePoints >= getInfluenceUpgradeCost(e.id)
            );
        t.hidden === e && (t.hidden = !e);
    }
    if ("invest" === capitalPane)
        return (
            updatePrestigeUI(),
            void document.querySelectorAll("#influenceUpgradesContainer .upg-buy").forEach((e) => {
                const t = parseFloat(e.dataset.ipcost) || 0,
                    n = gameState.influencePoints >= t;
                e.disabled === n &&
                    ((e.disabled = !n),
                    e.classList.toggle("btn--primary", n),
                    e.classList.toggle("btn--outline", !n));
            })
        );
    document.querySelectorAll("#capUpgradesPane .upg-buy").forEach((e) => {
        const t = parseFloat(e.dataset.cost) || 0,
            n = gameState.cash >= t;
        e.disabled === n &&
            ((e.disabled = !n), e.classList.toggle("btn--primary", n), e.classList.toggle("btn--outline", !n));
    });
}
function getLocationCostMult(e) {
    const t = gameState.globalUpgrades?.costReduction?.[e] || 0;
    return t > 0 ? 1 - Math.min(95, 5 * t) / 100 : 1;
}
function getProductDiscountMult() {
    const e = gameState.influenceUpgrades?.productDiscount || 0;
    return influenceUpgrades.productDiscount.effect(e);
}
function getProductBaseUpgradeCost(e) {
    if (!e.baseUpgradeCost) {
        const t = e.costGrowth || gameBalance.productCostMultiplier;
        // Legacy saves: stored upgradeCost = base × growth^level, with costReduction
        // baked in only if the product has been upgraded at least once.
        let n = e.upgradeCost / Math.pow(t, Math.max(0, e.level));
        e.level > 0 && (n /= getLocationCostMult(e.locationId));
        e.baseUpgradeCost = Math.max(1, Math.floor(n));
    }
    return e.baseUpgradeCost;
}
function getProductUpgradeCost(e, t = 0) {
    const n = getProductBaseUpgradeCost(e),
        a = e.costGrowth || gameBalance.productCostMultiplier;
    return Math.max(
        1,
        Math.floor(n * Math.pow(a, e.level + t) * getLocationCostMult(e.locationId) * getProductDiscountMult())
    );
}
function getProductUnlockCost(e) {
    return Math.floor(e.unlockCost * getLocationCostMult(e.locationId) * getProductDiscountMult());
}
function getManagerHireCost(e) {
    const t = gameState.influenceUpgrades?.employeeDiscount || 0;
    return Math.floor(
        e.managerHireCost * influenceUpgrades.employeeDiscount.effect(t) * getLocationCostMult(e.locationId)
    );
}
function getManagerUpgradeCost(e) {
    const t = 1 - 0.05 * (gameState.globalUpgrades?.workforce?.promotionTrack || 0);
    return Math.floor(e.managerUpgradeCost * getLocationCostMult(e.locationId) * t);
}
function calculateBulkUpgradeCost(e, t) {
    if (t <= 0) return 0;
    let n = 0;
    for (let a = 0; a < t; a++) n += getProductUpgradeCost(e, a);
    return n;
}
function calculateMaxAffordableUpgrades(e, t) {
    let n = 0,
        a = 0;
    for (;;) {
        if (e.level + n >= 999) break;
        const o = getProductUpgradeCost(e, n);
        if (a + o > t) break;
        if (((a += o), n++, n >= 1e3)) break;
    }
    return { count: n, totalCost: a };
}
function upgradeProduct(e) {
    const t = gameState.products.find((t) => t.id === e);
    if (!t) return;
    const n = 999;
    if (t.level >= n) return showNotification(`${t.name} is at max level (999)!`);
    const a = document.querySelector(`.upgrade-product-btn[data-id="${e}"]`),
        o = Math.min((a && parseInt(a.dataset.count)) || 1, n - t.level),
        i = calculateBulkUpgradeCost(t, o);
    if (gameState.cash < i) return showNotification("Not enough cash!");
    gameState.cash -= i;
    const c = o;
    (t.level += o), (t.upgradeCost = t.level < n ? getProductUpgradeCost(t) : 0);
    showNotification(
        `${t.name} upgraded to Lv.${t.level}${c > 1 ? ` (+${c})` : ""}${t.level >= n ? " [MAX]" : ""}`
    ),
        updateProductsList();
}
function hireOrUpgradeManager(e) {
    const t = gameState.products.find((t) => t.id === e);
    if (t)
        if (t.managerHired) {
            if (t.managerOnboarding)
                return showNotification(
                    "Staff onboarding in progress. Position upgrade available after onboarding completes."
                );
            const n = getManagerUpgradeCost(t);
            if (gameState.cash < n) return showNotification("Not enough cash!");
            (gameState.cash -= n),
                (t.managerLevel += 1),
                (t.managerUpgradeCost = Math.floor(1.25 * t.managerUpgradeCost)),
                showNotification(
                    `${t.name} position upgraded to Lv.${t.managerLevel} - Better equipment & efficiency!`
                ),
                updatePeopleTab(),
                updateProductsList();
        } else showManagerHiringModal(e);
}
function createOrLinkManagerNPC(e) {
    const t = `mgr_${e.id}`;
    if (gameState.employees.some((e) => e.id === t)) return;
    const n = ["Jade", "Morgan", "Riley", "Avery", "Sam", "Harper", "Quinn", "Rowan"],
        a = ["Park", "Davis", "Johnson", "Garcia", "Smith", "Lee", "Kim", "Patel"],
        o = {
            id: t,
            name: `${n[Math.floor(Math.random() * n.length)]} ${a[Math.floor(Math.random() * a.length)]}`,
            position: `Manager – ${e.name}`,
            trait: "Workhorse",
            personality: "Friendly",
            stats: {
                comfort: generateEmployeeStat("comfort"),
                affection: generateEmployeeStat("affection"),
                desire: generateEmployeeStat("desire"),
                trust: generateEmployeeStat("trust"),
                friendship: generateEmployeeStat("friendship"),
                productivity: generateEmployeeStat("productivity"),
            },
            hired: !0,
            level: 1,
            bio: `Keeps ${e.name} on track.`,
            employmentStatus: "active",
            location: e.locationId || "headquarters",
        };
    initializeEmployeeSocialData(o),
        gameState.employees.push(o),
        "dashboard" === gameState.activeTab && refreshDashboardSections(),
        generateRandomRelationships(o.id),
        generateFirstEmployeePost(o).catch((e) => {
            console.error("First post generation failed:", e);
        });
}
function updateGiftsTab() {
    const a = $("recommendedGiftRange");
    if (a && "function" == typeof calculateGiftPriceScale) {
        const s = calculateGiftPriceScale();
        a.textContent = `$${Math.round(s.minRecommended).toLocaleString()} - $${Math.round(s.maxRecommended).toLocaleString()}`;
    }
    switch (giftPane) {
        case "inventory":
            updateGiftInventory();
            break;
        case "vault":
            renderGiftVaultGrid();
            break;
        case "craft":
            renderCraftControls();
            break;
        default:
            updateGiftStore();
    }
}
function updateHRTab() {
    const e = $("atmosphereSlider"),
        t = $("atmosphereValue"),
        n = $("guidelinesSlider"),
        a = $("guidelinesValue"),
        o = $("policyValue");
    if (e && t) {
        e.value = gameState.settings.atmosphere ?? 50;
        const n = gameState.settings.atmosphere ?? 50;
        let a = "Balanced";
        n < 33 ? (a = "Professional") : n > 66 && (a = "Relaxed"), (t.textContent = a);
    }
    if (n && a) {
        n.value = gameState.settings.guidelines ?? 50;
        const e = gameState.settings.guidelines ?? 50;
        let t = "Standard";
        e < 33 ? (t = "Reserved") : e > 66 && (t = "Outgoing"), (a.textContent = t);
    }
    if (
        (document.querySelectorAll(".policy-btn").forEach((e) => {
            e.classList.toggle("active", e.dataset.policy === gameState.settings.policy);
        }),
        o)
    ) {
        const e = { professional: "Professional", casual: "Casual", open: "Enthusiastic" };
        o.textContent = e[gameState.settings.policy] || "Professional";
    }
}
