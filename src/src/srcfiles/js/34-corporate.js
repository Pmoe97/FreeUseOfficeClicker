// ============================================================================
// 34-corporate — Corporate pyramid: structure math, modal, ladder, promotions, transfers, zoom.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================


function updateCorporateHierarchy() {
    Object.keys(gameState.corporateHierarchy.levels).forEach((e) => {
        gameState.corporateHierarchy.levels[e] = [];
    }),
        gameState.employees.forEach((e) => {
            if ("active" !== e.employmentStatus) return;
            if (!e.career) return;
            const t = e.career.level;
            gameState.corporateHierarchy.levels[t] && gameState.corporateHierarchy.levels[t].push(e.id);
        });
}
function initializeHierarchicalPyramid() {
    if (!gameState.corporatePyramid)
        return void console.error("[Pyramid] corporatePyramid not found in gameState!");
    gameState.corporatePyramid.secretaryPosition ||
        (gameState.corporatePyramid.secretaryPosition = {
            positionId: "secretary",
            title: "Executive Secretary",
            level: 6.5,
            employeeId: null,
            reportsTo: "ceo",
            subordinates: [],
        }),
        (gameState.corporatePyramid.positions && "object" == typeof gameState.corporatePyramid.positions) ||
            (console.log("[Pyramid] Migrating to hierarchical structure..."),
            (gameState.corporatePyramid.positions = {
                6: [
                    {
                        positionId: "senior_exec",
                        title: "Senior Executive",
                        level: 6,
                        employeeId: null,
                        reportsTo: "ceo",
                        subordinates: [],
                        span: 2,
                    },
                ],
                5: [
                    {
                        positionId: "cfo",
                        title: "Chief Financial Officer",
                        level: 5,
                        employeeId: null,
                        reportsTo: "senior_exec",
                        subordinates: [],
                        span: 2,
                    },
                    {
                        positionId: "coo",
                        title: "Chief Operating Officer",
                        level: 5,
                        employeeId: null,
                        reportsTo: "senior_exec",
                        subordinates: [],
                        span: 2,
                    },
                ],
                4: [
                    {
                        positionId: "branch_mgr_1",
                        title: "Branch Manager 1",
                        level: 4,
                        employeeId: null,
                        reportsTo: "cfo",
                        subordinates: [],
                        locationsManaged: [],
                        span: 3,
                    },
                    {
                        positionId: "branch_mgr_2",
                        title: "Branch Manager 2",
                        level: 4,
                        employeeId: null,
                        reportsTo: "cfo",
                        subordinates: [],
                        locationsManaged: [],
                        span: 3,
                    },
                    {
                        positionId: "branch_mgr_3",
                        title: "Branch Manager 3",
                        level: 4,
                        employeeId: null,
                        reportsTo: "coo",
                        subordinates: [],
                        locationsManaged: [],
                        span: 2,
                    },
                    {
                        positionId: "branch_mgr_4",
                        title: "Branch Manager 4",
                        level: 4,
                        employeeId: null,
                        reportsTo: "coo",
                        subordinates: [],
                        locationsManaged: [],
                        span: 1,
                    },
                ],
                3: [],
                2: [],
                1: [],
            }),
            gameState.corporatePyramid.promotionCosts ||
                (gameState.corporatePyramid.promotionCosts = {
                    1: 500,
                    2: 2e3,
                    3: 1e4,
                    4: 5e4,
                    5: 15e4,
                    6: 5e5,
                    7: 0,
                }));
    for (let e = 1; e <= 6; e++)
        Array.isArray(gameState.corporatePyramid.positions[e]) || (gameState.corporatePyramid.positions[e] = []);
    const e = gameState.locations.filter((e) => e.unlocked);
    e.length;
    e.forEach((e, t) => {
        if (!gameState.corporatePyramid.positions[3].find((t) => t.locationId === e.id)) {
            const n = Math.floor(t / 2.25),
                a = `branch_mgr_${Math.min(n + 1, 4)}`;
            gameState.corporatePyramid.positions[3].push({
                positionId: `regional_mgr_${e.id}`,
                title: `Regional Manager - ${e.name}`,
                level: 3,
                employeeId: null,
                reportsTo: a,
                subordinates: [],
                locationId: e.id,
                span: 3,
            });
        }
    }),
        e.forEach((e) => {
            const t = gameState.products.filter((t) => t.locationId === e.id && t.unlocked).length,
                n = Math.max(1, Math.ceil(t / 5));
            for (let t = 0; t < n; t++) {
                gameState.corporatePyramid.positions[2].find((n) => n.locationId === e.id && n.managerId === t) ||
                    gameState.corporatePyramid.positions[2].push({
                        positionId: `local_mgr_${e.id}_${t}`,
                        title: `Local Manager ${t + 1} - ${e.name}`,
                        level: 2,
                        employeeId: null,
                        reportsTo: `regional_mgr_${e.id}`,
                        subordinates: [],
                        locationId: e.id,
                        managerId: t,
                        span: 5,
                    });
            }
        }),
        e.forEach((e) => {
            gameState.products
                .filter((t) => t.locationId === e.id && t.unlocked)
                .forEach((t, n) => {
                    if (!gameState.corporatePyramid.positions[1].find((e) => e.productId === t.id)) {
                        const a = gameState.corporatePyramid.positions[2].filter((t) => t.locationId === e.id),
                            o = a[Math.floor(n / 5) % a.length];
                        gameState.corporatePyramid.positions[1].push({
                            positionId: `staff_${t.id}`,
                            title: `${t.name} Staff`,
                            level: 1,
                            employeeId: null,
                            reportsTo: o ? o.positionId : null,
                            locationId: e.id,
                            productId: t.id,
                        });
                    }
                });
        }),
        console.log(
            `[Pyramid] Initialized: ${gameState.corporatePyramid.positions[1].length} Staff, ${gameState.corporatePyramid.positions[2].length} Local Managers, ${gameState.corporatePyramid.positions[3].length} Regional Managers`
        );
    reconcileLadderSeats();
}
// A product's manager should hold that product's staff seat. A seat created after the
// manager was hired (older saves, products unlocked out of order) used to stay empty
// forever, leaving the manager unseated — no transfers, no promotions. Seat them, then
// make everyone's recorded location match where they actually sit.
function reconcileLadderSeats() {
    const staff = gameState.corporatePyramid?.positions?.[1];
    if (!Array.isArray(staff)) return;
    let seated = 0;
    staff.forEach((pos) => {
        if (pos.employeeId || !pos.productId) return;
        const product = gameState.products.find((p) => p.id === pos.productId);
        if (!product?.managerHired || !product.managerId) return;
        const emp = gameState.employees.find((e) => e.id === product.managerId && "active" === e.employmentStatus);
        if (!emp || getEmployeePosition(emp.id)) return;
        (pos.employeeId = emp.id), (pos.isVacant = !1), seated++;
    });
    seated && console.log(`[Pyramid] Seated ${seated} product manager(s) who had no ladder seat`);
    gameState.employees.forEach((e) => "active" === e.employmentStatus && syncEmployeePlacement(e));
}
// Where someone works, derived from one source of truth: their ladder seat (a product seat
// carries the product and site; a manager seat carries the site), else the product whose
// manager they are. Called on every seat change and on load, so the People tab, filters,
// payroll market rates and AI prompts all agree after a transfer.
function syncEmployeePlacement(emp) {
    if (!emp) return;
    const pos = getEmployeePosition(emp.id),
        product = pos?.productId
            ? gameState.products.find((p) => p.id === pos.productId)
            : pos
              ? null
              : gameState.products.find((p) => p.managerHired && p.managerId === emp.id);
    if (product) {
        (emp.productId = product.id), (emp.productManaged = product.name);
        (emp.locationId = product.locationId), (emp.location = product.locationId);
        (!emp.position || /^Manager – /.test(emp.position)) && (emp.position = `Manager – ${product.name}`);
    } else if (pos) {
        emp.productId = null;
        pos.locationId && ((emp.locationId = pos.locationId), (emp.location = pos.locationId));
    }
}
function getPosition(e) {
    if ("ceo" === e) return gameState.corporatePyramid.ceo;
    if ("secretary" === e) return gameState.corporatePyramid.secretaryPosition;
    for (let t = 1; t <= 6; t++) {
        const n = gameState.corporatePyramid.positions[t];
        if (Array.isArray(n)) {
            const t = n.find((t) => t.positionId === e);
            if (t) return t;
        }
    }
    return null;
}
function getEmployeePosition(e) {
    if (gameState.corporatePyramid.secretaryPosition?.employeeId === e)
        return gameState.corporatePyramid.secretaryPosition;
    for (let t = 1; t <= 6; t++) {
        const n = gameState.corporatePyramid.positions[t];
        if (Array.isArray(n)) {
            const t = n.find((t) => t.employeeId === e);
            if (t) return t;
        }
    }
    return null;
}
function getEmployeeLevel(e) {
    const t = getEmployeePosition(e);
    if (t) return Math.floor(t.level);
    const n = gameState.employees.find((t) => t.id === e);
    return n?.career?.level || 1;
}
function getSubordinates(e) {
    const t = [];
    for (let n = 1; n <= 6; n++) {
        const a = gameState.corporatePyramid.positions[n];
        Array.isArray(a) &&
            a.forEach((n) => {
                if (n.reportsTo === e && n.employeeId) {
                    const e = gameState.employees.find((e) => e.id === n.employeeId);
                    e && t.push({ employee: e, position: n });
                }
            });
    }
    return t;
}
function canFillPosition(e, t) {
    if (
        (console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
        console.log(`[PROMOTION CHECK] Evaluating ${e.name} for ${t.title}`),
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
        !e || !t)
    )
        return (
            console.log("❌ FAILED: Invalid employee or position"),
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
            { canFill: !1, reason: "Invalid employee or position" }
        );
    if (t.employeeId && t.employeeId !== e.id) {
        const e = gameState.employees.find((e) => e.id === t.employeeId),
            n = e ? e.name : "someone";
        return (
            console.log(`❌ FAILED: Position already occupied by ${n}`),
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
            { canFill: !1, reason: `Position already occupied by ${n}` }
        );
    }
    if (!e.career)
        return (
            console.log("❌ FAILED: Employee has no career data"),
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
            { canFill: !1, reason: "Employee has no career data" }
        );
    if (
        (console.log("📊 Employee Stats:"),
        console.log(`   • Current Level: ${e.career.level} (${e.career.title})`),
        console.log(`   • Productivity: ${Math.round(e.stats.productivity)}%`),
        console.log(`   • Management Skill: Lv.${e.skills?.management?.level || 0}`),
        console.log("   • Other Skills:", {
            technical: e.skills?.technical?.level || 0,
            social: e.skills?.social?.level || 0,
            creativity: e.skills?.creativity?.level || 0,
        }),
        console.log("\n🎯 Position Requirements:"),
        console.log(`   • Position: ${t.title}`),
        console.log(`   • Required Level: ${t.level}`),
        "secretary" === t.positionId)
    ) {
        if (
            (console.log("   • Type: Secretary (special - Level 1-3 employees only)"),
            e.career.level >= 1 && e.career.level <= 3)
        )
            return (
                console.log("\n✅ SUCCESS: Meets all requirements!"),
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
                { canFill: !0, reason: "Meets all requirements" }
            );
        const t = e.career.level > 3 ? "Too senior for this role" : "Requires Level 1 minimum";
        return (
            console.log(`\n❌ FAILED: ${t}`),
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
            { canFill: !1, reason: t }
        );
    }
    const n = Math.floor(t.level),
        a = n - 1;
    if (
        (console.log(`   • Position Level: ${n}`),
        console.log(`   • Minimum Employee Level Required: ${a}`),
        e.career.level < a)
    ) {
        const t = gameState.hierarchyLevels[a] ||
                gameState.hierarchyLevels[1] || { title: "Staff", color: "var(--l-green)", icon: "👤" },
            n = `Requires at least Level ${a}${t ? " (" + t.title + ")" : ""}`;
        return (
            console.log(`\n❌ FAILED: ${n}`),
            console.log(`   Employee is Level ${e.career.level}, needs to be at least Level ${a}`),
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
            { canFill: !1, reason: n }
        );
    }
    if ((console.log(`   ✓ Level requirement met (${e.career.level} >= ${a})`), n >= 2)) {
        const t = getPromotionRequirements(n, e);
        if ((console.log(`\n📋 Checking Promotion Requirements for Level ${n}:`), t)) {
            if (
                (console.log(`   • Required Productivity: ${t.minProductivity}%`),
                console.log(`   • Required Management: Lv.${t.minManagement || 0}`),
                t.minProductivity && e.stats.productivity < t.minProductivity)
            ) {
                const n = `Requires ${t.minProductivity}% productivity (currently ${Math.round(e.stats.productivity)}%)`;
                return (
                    console.log(`\n❌ FAILED: ${n}`),
                    console.log(
                        `   Need ${t.minProductivity - Math.round(e.stats.productivity)}% more productivity`
                    ),
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
                    { canFill: !1, reason: n }
                );
            }
            if (
                (console.log(
                    `   ✓ Productivity requirement met (${Math.round(e.stats.productivity)}% >= ${t.minProductivity}%)`
                ),
                t.minManagement)
            ) {
                const n = e.skills?.management?.level || 0;
                if (n < t.minManagement) {
                    const e = `Requires Management Lv.${t.minManagement} (currently Lv.${n})`;
                    return (
                        console.log(`\n❌ FAILED: ${e}`),
                        console.log(`   Need ${t.minManagement - n} more management level(s)`),
                        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
                        { canFill: !1, reason: e }
                    );
                }
                console.log(`   ✓ Management requirement met (Lv.${n} >= Lv.${t.minManagement})`);
            }
        }
    }
    return (
        console.log("\n✅ SUCCESS: All requirements met!"),
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
        { canFill: !0, reason: "Meets all requirements" }
    );
}
function calculateRelocationCost(e, t) {
    if (!e || !t) return 0;
    if ("secretary" === t.positionId) return 1e3;
    const n = Math.floor(t.level),
        a = gameState.corporatePyramid.promotionCosts[n] || 1e3,
        o = getEmployeePosition(e.id);
    return o && t.level <= o.level ? Math.floor(0.3 * a) : a;
}
function assignEmployeeToPosition(e, t, n = !0) {
    console.log("\n╔════════════════════════════════════════╗"),
        console.log("║  ASSIGNMENT ATTEMPT                    ║"),
        console.log("╚════════════════════════════════════════╝");
    const a = gameState.employees.find((t) => t.id === e);
    if (!a)
        return console.log(`❌ Employee not found: ${e}`), { success: !1, message: "Employee not found", cost: 0 };
    const o = getPosition(t);
    if (!o)
        return console.log(`❌ Position not found: ${t}`), { success: !1, message: "Position not found", cost: 0 };
    if (
        (console.log(`👤 Employee: ${a.name}`),
        console.log(`📍 Target Position: ${o.title} (Level ${o.level})`),
        o.isPlayer)
    )
        return (
            console.log("❌ Cannot assign employee to CEO position (player-only)"),
            { success: !1, message: "Cannot assign employee to CEO position", cost: 0 }
        );
    const i = getEmployeePosition(a.id);
    if (i && i.positionId === t)
        return (
            console.log(`❌ Employee is already in this position: ${o.title}`),
            { success: !1, message: `${a.name} is already in this position!`, cost: 0 }
        );
    console.log("\n🔍 Running eligibility check...");
    const s = canFillPosition(a, o);
    if (!s.canFill)
        return console.log(`❌ ASSIGNMENT BLOCKED: ${s.reason}`), { success: !1, message: s.reason, cost: 0 };
    console.log("✅ Eligibility check passed!");
    const r = calculateRelocationCost(a, o);
    if (
        (console.log(`💰 Assignment cost: $${formatNumber(r)}`),
        console.log(`💵 Current cash: $${formatNumber(gameState.cash)}`),
        n && gameState.cash < r)
    )
        return (
            console.log(
                `❌ ASSIGNMENT BLOCKED: Insufficient funds (need $${formatNumber(r - gameState.cash)} more)`
            ),
            { success: !1, message: `Not enough cash! Need $${formatNumber(r)}`, cost: r }
        );
    // What they earn above the market rate for their current role (negotiated raises).
    // Measured before the move, re-applied on top of the new role's market rate below.
    const premium = Math.max(0, (a.career.salary || 0) - getMarketRate(a, a.career.level));
    if (i) {
        if (
            (console.log(`\n📤 Removing from current position: ${i.title}`),
            (i.employeeId = null),
            (i.isVacant = !0),
            i.productId)
        ) {
            const t = gameState.products.find((e) => e.id === i.productId);
            t &&
                t.managerHired &&
                t.managerId === e &&
                ((t.managerHired = !1),
                (t.managerId = null),
                console.log(`   ⚠️ Product "${t.name}" now vacant - automation disabled`));
        }
    } else console.log("\n📥 First-time assignment (employee not currently in any position)");
    if (
        (console.log(`\n📥 Assigning to new position: ${o.title}`),
        (o.employeeId = e),
        (o.isVacant = !1),
        o.productId)
    ) {
        const t = gameState.products.find((e) => e.id === o.productId);
        t &&
            ((a.productManaged = t.name),
            (t.managerHired = !0),
            (t.managerId = e),
            console.log(`   ✓ Now managing product: ${t.name}`));
    } else (a.productManaged = null), console.log("   ✓ Management position (no specific product)");
    syncEmployeePlacement(a);
    n &&
        ((gameState.cash -= r),
        console.log(`   💸 Deducted $${formatNumber(r)} from cash`),
        console.log(`   💵 Remaining cash: $${formatNumber(gameState.cash)}`));
    const l = a.career.level,
        c = a.career.title;
    if ("secretary" === o.positionId || "Executive Secretary" === o.title)
        (a.career.level = 6),
            (a.career.title = "Executive Secretary"),
            (a.career.salary = 5e5),
            console.log("   🎯 Special: Secretary position (Level 6 equivalent)");
    else {
        const e = Math.floor(o.level);
        if (a.career.level !== e) {
            const t = gameState.hierarchyLevels[e] ||
                gameState.hierarchyLevels[1] || { title: "Staff", color: "var(--l-green)", icon: "👤", baseSalary: 1e5 };
            if (t) {
                const n = a.career.level < e,
                    o = a.career.level > e;
                (a.career.level = e),
                    (a.career.title = t.title),
                    (a.career.salary = getMarketRate(a, e) + premium),
                    n
                        ? (console.log(`   📈 Promoted: ${c} (Lv.${l}) → ${t.title} (Lv.${e})`),
                          // They announce it on the feed (only the retired auto-promotion path did).
                          "function" == typeof generatePromotionPost &&
                              generatePromotionPost(a, e).catch((e) => console.warn("[Promotion Post]", e)))
                        : o && console.log(`   📉 Demoted: ${c} (Lv.${l}) → ${t.title} (Lv.${e})`);
            }
        } else
            // Same level, but a new site/product can have a different market rate.
            (a.career.salary = getMarketRate(a, e) + premium),
                console.log(`   ➡️  Lateral move (Level ${a.career.level} stays same)`);
    }
    if (
        (console.log("\n✅ ASSIGNMENT SUCCESSFUL!"),
        console.log("╔════════════════════════════════════════╗"),
        console.log(`║  ${a.name} → ${o.title}`),
        console.log("╚════════════════════════════════════════╝\n"),
        void 0 !== StoryEngine && StoryEngine.trackAction)
    ) {
        const e = Math.floor(o.level);
        l < e
            ? StoryEngine.trackAction("promoted_employee", {
                  employeeId: a.id,
                  employeeName: a.name,
                  fromLevel: l,
                  toLevel: e,
                  newTitle: o.title,
              })
            : l > e &&
              StoryEngine.trackAction("demoted_employee", {
                  employeeId: a.id,
                  employeeName: a.name,
                  fromLevel: l,
                  toLevel: e,
                  newTitle: o.title,
              });
    }
    return {
        success: !0,
        message: i ? "Employee relocated successfully!" : "Employee assigned successfully!",
        cost: r,
        needsRehire: !(!i || !i.productId),
        vacatedPosition: i || null,
    };
}
function removeEmployeeFromPyramid(e) {
    const t = getEmployeePosition(e);
    if (!t) return !1;
    (t.employeeId = null), (t.isVacant = !0);
    // Leaving a product seat means that product no longer has a manager (otherwise the
    // seat reconciler would put them straight back).
    gameState.products.forEach((p) => {
        p.managerId === e && ((p.managerHired = !1), (p.managerId = null), (p.managerLevel = 0));
    });
    const n = gameState.employees.find((t) => t.id === e);
    return n && ((n.productManaged = null), (n.productId = null)), !0;
}
function openCorporatePyramidModal(e = null) {
    try {
        const t = document.getElementById("pyramidModal");
        if (!t) return void console.error("Pyramid modal element not found!");
        gameState.employees || (gameState.employees = []),
            gameState.corporateHierarchy ||
                (gameState.corporateHierarchy = {
                    levels: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] },
                    executiveRoles: { COO: null, CFO: null },
                }),
            gameState.hierarchyLevels ||
                (gameState.hierarchyLevels = [
                    { level: 1, capacity: 1, unlockCost: 0 },
                    { level: 2, capacity: 2, unlockCost: 5e4 },
                    { level: 3, capacity: 3, unlockCost: 2e5 },
                    { level: 4, capacity: 4, unlockCost: 8e5 },
                    { level: 5, capacity: 5, unlockCost: 32e5 },
                    { level: 6, capacity: 6, unlockCost: 128e5 },
                    { level: 7, capacity: 7, unlockCost: 512e5 },
                ]);
        // Some saves never built corporatePyramid (the modal historically only lazy-inited
        // corporateHierarchy + hierarchyLevels). Both list and spatial views read it, so a
        // missing structure left the modal empty. Build it via the existing initializer.
        gameState.corporatePyramid ||
            (gameState.corporatePyramid = {
                ceo: { positionId: "ceo", title: "CEO", level: 7, employeeId: "player", subordinates: [], isPlayer: !0 },
            });
        ("object" == typeof gameState.corporatePyramid.positions && gameState.corporatePyramid.promotionCosts) ||
            ("function" == typeof initializeHierarchicalPyramid && initializeHierarchicalPyramid());
        const view = localStorage.getItem("fuoc_ladder_view") || "list";
        (t.innerHTML = `
      <div class="modal-box ladder-modal">
        <div class="card-h">
          <div style="display:flex; align-items:baseline; gap:var(--s2); min-width:0;">
            <span class="t">🏢 CORPORATE LADDER</span>
            <span class="text-dim fs-xs">${e ? "Select a position to assign" : "Manage your organization"}</span>
          </div>
          <button class="modal-close" onclick="closeCorporatePyramidModal()">✕</button>
        </div>
        <div class="ladder-legend">
          <span><span class="dot" style="background:var(--positive)"></span>Filled</span>
          <span><span class="dot" style="background:var(--border-strong)"></span>Vacant</span>
          <span><span class="dot" style="background:var(--accent)"></span>Selected</span>
          <span class="flex-1"></span>
          <div class="seg" id="ladderViewToggle">
            <button data-view="list">≡ List</button>
            <button data-view="spatial">⊞ Spatial</button>
          </div>
        </div>
        <div class="ladder-modal-body" id="ladderBody"></div>
        ${e ? buildSelectionFooter(e) : ""}
      </div>
    `),
            (t.style.display = "flex"),
            renderLadderView(view, e);
        const tg = document.getElementById("ladderViewToggle");
        tg &&
            tg.querySelectorAll("button").forEach((b) => {
                b.onclick = () => {
                    localStorage.setItem("fuoc_ladder_view", b.dataset.view), renderLadderView(b.dataset.view, e);
                };
            });
    } catch (e) {
        console.error("Error opening Corporate Pyramid Modal:", e),
            showNotification(`Failed to open Corporate Ladder: ${(e && e.message) || e}`, "error");
    }
}
function buildPyramidHTML(e) {
    let t = "";
    const n = e ? gameState.employees.find((t) => t.id === e) : null;
    return (
        (t += `\n      <div style="text-align:center; margin-bottom:40px;">\n        <div style="display:inline-flex; align-items:center; justify-content:center; gap:20px;">\n          \x3c!-- CEO Position --\x3e\n          <div style="display:inline-block; position:relative;">\n            <div class="pyramid-position ceo-position" data-position-id="ceo" style="background:linear-gradient(135deg, var(--l-gold), #ffed4e); padding:24px 50px; border-radius:12px; box-shadow:0 6px 20px rgba(255,215,0,0.5); border:3px solid var(--accent-gold);">\n              <div style="font-size:2.5rem; margin-bottom:8px;">👑</div>\n              <div style="font-weight:700; font-size:1.3rem; color:var(--l-on-accent);">CEO</div>\n              <div style="font-size:0.9rem; color:var(--l-on-accent); margin-top:4px;">You</div>\n            </div>\n          </div>\n          \n          \x3c!-- Secretary Position --\x3e\n          <div style="display:inline-block; position:relative; transform:scale(0.85);">\n            ${buildSecretaryTile(gameState.corporatePyramid.secretaryPosition || { positionId: "secretary", title: "Executive Secretary", level: 6.5, employeeId: null, reportsTo: "ceo", subordinates: [] }, n)}\n          </div>\n        </div>\n      </div>\n    `),
        (t += buildLevelSection(6, "Senior Executive", n)),
        (t += buildLevelSection(5, "Officers (CFO, COO)", n)),
        (t += buildLevelSection(4, "Branch Managers", n)),
        (t += buildLevelSection(3, "Regional Managers", n)),
        (t += buildLevelSection(2, "Local Managers", n)),
        (t += buildLevelSection(1, "Staff", n)),
        t
    );
}
function buildLevelSection(e, t, n) {
    const a = gameState.corporatePyramid.positions[e];
    if (!a || 0 === a.length) return "";
    const o = gameState.hierarchyLevels[e] ||
        gameState.hierarchyLevels[1] || { title: "Staff", color: "var(--l-green)", icon: "👤", baseSalary: 1e5 };
    let i = `\n      <div style="margin-bottom:50px;">\n        <h3 style="color:${o.color}; margin-bottom:20px; text-align:center; font-size:1.2rem; display:flex; align-items:center; justify-content:center; gap:10px;">\n          <span style="font-size:1.5rem;">${o.icon}</span>\n          Level ${e}: ${t}\n          <span style="background:var(--l-sheen-10); padding:4px 12px; border-radius:12px; font-size:0.8rem; color:var(--text-dim);">\n            ${a.filter((e) => e.employeeId).length} / ${a.length} filled\n          </span>\n        </h3>\n        <div style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center; max-width:1200px; margin:0 auto;">\n    `;
    return (
        a.forEach((e) => {
            i += buildPositionTile(e, n, o);
        }),
        (i += "\n        </div>\n      </div>\n    "),
        i
    );
}
function buildPositionTile(e, t, n) {
    const a = e.employeeId ? gameState.employees.find((t) => t.id === e.employeeId) : null,
        o = !a;
    let i = !1,
        s = "";
    if (t) {
        const n = canFillPosition(t, e);
        (i = n.canFill), (s = n.reason);
    }
    const color = i ? "var(--accent-gold)" : o ? "var(--border-strong)" : n.color || "var(--positive)",
        bg = i ? "var(--accent-gold-dim)" : o ? "var(--surface-2)" : "var(--surface)",
        c = getSubordinates(e.positionId).length;
    return `\n      <div class="pyramid-position" \n           data-position-id="${e.positionId}"\n           data-can-select="${i}"\n           data-cost="${(t && gameState.corporatePyramid.promotionCosts[e.level]) || 0}"\n           style="--lvl:${color}; background:${bg}; border:2px solid var(--lvl); border-radius:var(--r3); padding:16px; width:220px; cursor:pointer; transition:all 0.3s ease; box-shadow:var(--shadow-1);"\n           onmouseenter="this.style.transform='scale(1.05)';"\n           onmouseleave="this.style.transform='scale(1)';">\n        \n        <div style="text-align:center; margin-bottom:12px;">\n          <div style="font-size:1.5rem; margin-bottom:4px;">${n.icon}</div>\n          <div style="font-weight:600; font-size:0.85rem; color:var(--text);">${e.title}</div>\n          ${e.locationId ? `<div class="text-mute" style="font-size:0.7rem; margin-top:2px;">${gameState.locations.find((t) => t.id === e.locationId)?.name || ""}</div>` : ""}\n        </div>\n        \n        ${a ? `\n          <div style="text-align:center; position:relative;">\n            ${canPromote(a) ? '\n              <div class="pill pill--pos" style="position:absolute; top:-4px; right:calc(50% - 46px); font-size:0.65rem; z-index:1; animation:pulse 2s infinite;">\n                ⬆️ READY\n              </div>\n            ' : ""}\n            <img src="${a.profileImage || placeholderImage(60, 60)}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--lvl); margin-bottom:8px;">\n            <div style="font-size:0.85rem; font-weight:600; color:var(--text);">${a.name}</div>\n            <div class="text-dim" style="font-size:0.7rem; margin-top:2px;">${n.title}</div>\n            ${c > 0 ? `<div class="text-pos" style="font-size:0.65rem; margin-top:4px;">👥 <span class="num">${c}</span> report${1 !== c ? "s" : ""}</div>` : ""}\n          </div>\n        ` : `\n          <div style="text-align:center; padding:20px 0;">\n            <div style="font-size:2rem; opacity:0.3;">👤</div>\n            <div class="text-mute" style="font-size:0.75rem; margin-top:8px;">Vacant</div>\n            ${e.span ? `<div class="text-mute" style="font-size:0.65rem; margin-top:4px;">Manages ${e.span}</div>` : ""}\n          </div>\n        `}\n        \n        ${i ? `\n          <div style="margin-top:12px; padding:8px; background:var(--accent-gold-dim); border-radius:var(--r2); text-align:center;">\n            <div style="font-size:0.7rem; color:var(--accent-gold); font-weight:600;">✓ CAN ASSIGN</div>\n            <div style="font-size:0.7rem; color:var(--text); margin-top:2px;">Cost: $<span class="num">${formatNumber(gameState.corporatePyramid.promotionCosts[e.level] || 0)}</span></div>\n          </div>\n        ` : t ? `\n          <div style="margin-top:12px; padding:8px; background:var(--danger-dim); border-radius:var(--r2); text-align:center;">\n            <div style="font-size:0.65rem; color:var(--danger);">${s}</div>\n          </div>\n        ` : ""}\n      </div>\n    `;
}
function buildSecretaryTile(e, t) {
    const n = e.employeeId ? gameState.employees.find((t) => t.id === e.employeeId) : null,
        a = !n;
    let o = !1,
        i = "";
    t &&
        (t.career.level >= 1 && t.career.level <= 3
            ? (o = !0)
            : t.career.level > 3 && (i = "Too senior for this role"));
    const s = o ? "var(--accent-gold-dim)" : a ? "var(--surface-2)" : "var(--surface)",
        r = o ? "var(--accent-gold)" : a ? "var(--border-strong)" : "var(--accent)";
    return `\n      <div class="pyramid-position secretary-position" \n           data-position-id="${e.positionId}"\n           data-can-select="${o}"\n           data-cost="${t ? 1e3 : 0}"\n           style="--lvl:${r}; background:${s}; border:2px solid var(--lvl); border-radius:var(--r3); padding:14px; width:180px; cursor:pointer; transition:all 0.3s ease; box-shadow:var(--shadow-1);"\n           onmouseenter="this.style.transform='scale(1.05)';"\n           onmouseleave="this.style.transform='scale(1)';">\n        \n        <div style="text-align:center; margin-bottom:10px;">\n          <div style="font-size:1.3rem; margin-bottom:4px;">📋</div>\n          <div style="font-weight:600; font-size:0.8rem; color:var(--text);">${e.title}</div>\n          <div class="text-mute" style="font-size:0.65rem; margin-top:2px;">Reports to CEO</div>\n        </div>\n        \n        ${n ? `\n          <div style="text-align:center; position:relative;">\n            <img src="${n.profileImage || placeholderImage(50, 50)}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--lvl); margin-bottom:6px;">\n            <div style="font-size:0.8rem; font-weight:600; color:var(--text);">${n.name}</div>\n            <div class="text-dim" style="font-size:0.65rem; margin-top:2px;">Level <span class="num">${n.career?.level || 1}</span></div>\n          </div>\n        ` : '\n          <div style="text-align:center; padding:15px 0;">\n            <div style="font-size:1.5rem; opacity:0.3;">👤</div>\n            <div class="text-mute" style="font-size:0.7rem; margin-top:6px;">Vacant</div>\n            <div class="text-mute" style="font-size:0.6rem; margin-top:2px;">Early-game position</div>\n          </div>\n        '}\n        \n        ${o ? `\n          <div style="margin-top:10px; padding:6px; background:var(--accent-gold-dim); border-radius:var(--r2); text-align:center;">\n            <div style="font-size:0.65rem; color:var(--accent-gold); font-weight:600;">✓ CAN ASSIGN</div>\n            <div style="font-size:0.65rem; color:var(--text); margin-top:2px;">Cost: $<span class="num">${formatNumber(1e3)}</span></div>\n          </div>\n        ` : t ? `\n          <div style="margin-top:10px; padding:6px; background:var(--danger-dim); border-radius:var(--r2); text-align:center;">\n            <div style="font-size:0.6rem; color:var(--danger);">${i}</div>\n          </div>\n        ` : ""}\n      </div>\n    `;
}
function buildSelectionFooter(e) {
    const t = gameState.employees.find((t) => t.id === e);
    if (!t) return "";
    const n = gameState.hierarchyLevels[t.career?.level] ||
        gameState.hierarchyLevels[1] || { title: "Staff", color: "var(--l-green)" };
    return `\n      <div class="ladder-foot">\n        <div class="who">\n          <img src="${t.profileImage || placeholderImage(50, 50)}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid ${n.color}; flex:0 0 auto;">\n          <div style="min-width:0;">\n            <div class="nm" style="color:var(--text); font-weight:600;">${t.name}</div>\n            <div class="text-dim fs-xs">${n.title} • Level <span class="num">${t.career?.level || 1}</span></div>\n          </div>\n        </div>\n        <button class="btn btn--danger" onclick="closeCorporatePyramidModal()">Cancel</button>\n      </div>\n    `;
}
function buildLadderList(e) {
    const sel = e ? gameState.employees.find((x) => x.id === e) : null,
        cp = gameState.corporatePyramid,
        H = gameState.hierarchyLevels || {},
        locName = (id) => (id ? gameState.locations.find((l) => l.id === id)?.name || "" : "");
    const chip = (pos, color) => {
        const isPlayer = "player" === pos.employeeId,
            isCeo = "ceo" === pos.positionId,
            isSecretary = "secretary" === pos.positionId,
            emp = pos.employeeId && !isPlayer ? gameState.employees.find((x) => x.id === pos.employeeId) : null;
        let canSel = !1,
            reason = "",
            cost = 0;
        if (sel && !isCeo) {
            if (isSecretary) {
                const lv = sel.career?.level || 1;
                lv >= 1 && lv <= 3 ? (canSel = !0) : lv > 3 && (reason = "Too senior for this role"), (cost = 1e3);
            } else {
                const r = canFillPosition(sel, pos);
                (canSel = r.canFill), (reason = r.reason), (cost = cp.promotionCosts[pos.level] || 0);
            }
        }
        const reports = getSubordinates(pos.positionId).length,
            ready = emp && canPromote(emp);
        let avatarHtml, nm, meta;
        if (isPlayer)
            (avatarHtml = `<span class="avatar-sm init" style="--lvl:${color}">👑</span>`), (nm = "You"), (meta = "CEO");
        else if (emp)
            (avatarHtml = emp.profileImage
                ? `<img class="avatar-sm" src="${emp.profileImage}">`
                : `<span class="avatar-sm init" style="--lvl:${color}">${(emp.name || "?").charAt(0).toUpperCase()}</span>`),
                (nm = getColoredName(emp)),
                (meta = pos.title + (pos.locationId ? " · " + locName(pos.locationId) : ""));
        else
            (avatarHtml = `<span class="avatar-sm init" style="--lvl:${color}">👤</span>`),
                (nm = '<span style="color:var(--text-mute)">Vacant</span>'),
                (meta = pos.title + (pos.locationId ? " · " + locName(pos.locationId) : ""));
        let right = "";
        if (sel && canSel)
            right = `<span class="pill pill--gold">＋ Assign</span><span class="num text-dim fs-xs">$${formatNumber(cost)}</span>`;
        else if (sel && !isCeo && reason) right = `<span class="meta">${reason}</span>`;
        else
            ready && (right += '<span class="pill pill--pos">⬆ READY</span>'),
                reports > 0 && (right += `<span class="num text-dim fs-xs">👥 ${reports}</span>`);
        return `<div class="ladder-pos pyramid-position${canSel ? " is-selected" : ""}" data-position-id="${pos.positionId}" data-can-select="${canSel}" data-cost="${cost}" style="--lvl:${color}">
            ${avatarHtml}
            <div style="min-width:0;flex:1"><div class="nm">${nm}</div><div class="meta">${meta}</div></div>
            <div style="display:flex;align-items:center;gap:var(--s2);flex:0 0 auto">${right}</div>
          </div>`;
    };
    let html = '<div id="pyramidCanvas"><div class="ladder-list">';
    const ceo = cp.ceo || { positionId: "ceo", title: "CEO", level: 7, employeeId: "player" };
    html += '<div class="ladder-positions">' + chip(ceo, "var(--accent-gold)") + "</div>";
    cp.secretaryPosition && (html += '<div class="ladder-positions">' + chip(cp.secretaryPosition, "var(--accent)") + "</div>");
    for (let lvl = 6; lvl >= 1; lvl--) {
        const positions = (cp.positions && cp.positions[lvl]) || [];
        if (0 === positions.length) continue;
        const info = H[lvl] || { title: "Level " + lvl, color: "var(--border-strong)", icon: "👤" },
            filled = positions.filter((p) => p.employeeId).length;
        html += `<div><div class="ladder-band" style="--lvl:${info.color}"><span>${info.icon || ""}</span><span>L${lvl} · ${info.title}</span><span class="num">${filled} / ${positions.length} filled</span></div><div class="ladder-positions">${positions
                .map((p) => chip(p, info.color))
                .join("")}</div></div>`;
    }
    return (html += "</div></div>");
}
function renderLadderView(view, empId) {
    const body = document.getElementById("ladderBody");
    if (!body) return;
    // Spatial view depends on gameState.corporatePyramid, which some saves lack and
    // openCorporatePyramidModal does not lazily build. Guard it so a failure can never
    // leave an empty/broken modal — fall back to the list view instead.
    if ("spatial" === view) {
        try {
            if (!gameState.corporatePyramid?.positions) throw new Error("corporatePyramid not initialized");
            body.innerHTML = `<div class="row" style="justify-content:center; gap:var(--s2); margin-bottom:var(--s2);"><button class="btn btn--ghost" onclick="pyramidZoom('in')">🔍+</button><button class="btn btn--ghost" onclick="pyramidZoom('out')">🔍-</button><button class="btn btn--ghost" onclick="pyramidZoom('reset')">Reset</button></div><div id="pyramidContainer" style="position:relative; overflow:auto; background:var(--bg); border-radius:var(--r2); cursor:grab; height:60vh;"><div id="pyramidCanvas" style="transform-origin:top left; transition:transform 0.3s ease; padding:40px; min-width:100%; min-height:100%;">${buildPyramidHTML(empId)}</div></div>`;
            setupPyramidPanning(), setupPinchZoom(), setupDragAndDrop(), setupPositionClickHandlers(empId);
        } catch (err) {
            console.error("[Ladder] Spatial view failed — falling back to list view:", err),
                (view = "list"),
                (body.innerHTML = buildLadderList(empId)),
                setupPositionClickHandlers(empId);
        }
    } else (body.innerHTML = buildLadderList(empId)), setupPositionClickHandlers(empId);
    const tg = document.getElementById("ladderViewToggle");
    tg && tg.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.view === view));
}
function setupPyramidPanning() {
    const e = document.getElementById("pyramidContainer");
    if (!e) return;
    let t = !1,
        n = 0,
        a = 0,
        o = 0,
        i = 0;
    e.addEventListener("mousedown", (s) => {
        s.target.closest(".pyramid-position") ||
            s.target.draggable ||
            ((t = !0),
            (e.style.cursor = "grabbing"),
            (n = s.pageX - e.offsetLeft),
            (a = s.pageY - e.offsetTop),
            (o = e.scrollLeft),
            (i = e.scrollTop));
    }),
        e.addEventListener("mouseleave", () => {
            (t = !1), (e.style.cursor = "grab");
        }),
        e.addEventListener("mouseup", () => {
            (t = !1), (e.style.cursor = "grab");
        }),
        e.addEventListener("mousemove", (s) => {
            if (!t) return;
            s.preventDefault();
            const r = s.pageX - e.offsetLeft,
                l = s.pageY - e.offsetTop,
                c = 1.5 * (r - n),
                d = 1.5 * (l - a);
            (e.scrollLeft = o - c), (e.scrollTop = i - d);
        });
    let s = 0,
        r = 0,
        l = 0,
        c = 0;
    e.addEventListener(
        "touchstart",
        (t) => {
            t.target.closest(".pyramid-position") ||
                ((s = t.touches[0].pageX), (r = t.touches[0].pageY), (l = e.scrollLeft), (c = e.scrollTop));
        },
        { passive: !0 }
    ),
        e.addEventListener(
            "touchmove",
            (t) => {
                if (t.target.closest(".pyramid-position")) return;
                const n = t.touches[0].pageX,
                    a = t.touches[0].pageY,
                    o = 1.5 * (s - n),
                    i = 1.5 * (r - a);
                (e.scrollLeft = l + o), (e.scrollTop = c + i);
            },
            { passive: !0 }
        );
}
function setupDragAndDrop() {
    document.querySelectorAll(".pyramid-position[data-position-id]").forEach((e) => {
        const t = e.dataset.positionId;
        if ("ceo" === t) return;
        const n = getPosition(t);
        n &&
            n.employeeId &&
            ((e.draggable = !0),
            (e.style.cursor = "pointer"),
            e.addEventListener("dragstart", (a) => {
                (a.dataTransfer.effectAllowed = "move"),
                    a.dataTransfer.setData("employeeId", n.employeeId),
                    a.dataTransfer.setData("sourcePositionId", t),
                    (e.style.opacity = "0.5");
            }),
            e.addEventListener("dragend", (t) => {
                e.style.opacity = "1";
            })),
            e.addEventListener("dragover", (n) => {
                "ceo" !== t &&
                    (n.preventDefault(),
                    (n.dataTransfer.dropEffect = "move"),
                    (e.style.transform = "scale(1.05)"),
                    (e.style.boxShadow = "0 6px 20px rgba(255,215,0,0.5)"));
            }),
            e.addEventListener("dragleave", (t) => {
                (e.style.transform = ""), (e.style.boxShadow = "");
            }),
            e.addEventListener("drop", (n) => {
                if ((n.preventDefault(), (e.style.transform = ""), (e.style.boxShadow = ""), "ceo" === t)) return;
                const a = n.dataTransfer.getData("employeeId"),
                    o = n.dataTransfer.getData("sourcePositionId");
                a && t !== o && handleEmployeeDrop(a, t);
            });
    });
}
async function handleEmployeeDrop(e, t) {
    const n = gameState.employees.find((t) => t.id === e),
        a = getPosition(t);
    if (!n || !a) return;
    const o = canFillPosition(n, a);
    if (!o.canFill) return void showNotification(o.reason, "error");
    const i = calculateRelocationCost(n, a),
        s = `Move ${n.name} to ${a.title}?\n\nCost: $${formatNumber(i)}`;
    if (await showConfirm(s, "Confirm Relocation", { type: "info", confirmText: "Move" })) {
        const n = assignEmployeeToPosition(e, t, !0);
        n.success
            ? (showNotification(n.message, "success"),
              closeCorporatePyramidModal(),
              setTimeout(() => openCorporatePyramidModal(), 100))
            : showNotification(n.message, "error");
    }
}
function setupPositionClickHandlers(e) {
    const t = document.getElementById("pyramidCanvas");
    if (!t) return void console.error("[Pyramid] pyramidCanvas container not found");
    const n = t._positionClickHandler;
    n && t.removeEventListener("click", n);
    const a = (t) => {
        const n = t.target.closest(".pyramid-position");
        if (!n) return;
        const a = n.dataset.positionId;
        if ((console.log(`[Pyramid] Clicked position: ${a}`), "ceo" !== a))
            if (e) {
                console.log(`[Pyramid] Assignment mode - selectedEmployee: ${e}`);
                if ("true" === n.dataset.canSelect) {
                    const t = parseInt(n.dataset.cost);
                    confirmPositionAssignment(e, a, t);
                } else showNotification("Employee does not meet position requirements", "error");
            } else console.log(`[Pyramid] Opening details modal for: ${a}`), showPositionDetailsModal(a);
        else console.log("[Pyramid] CEO position clicked - ignoring");
    };
    (t._positionClickHandler = a),
        t.addEventListener("click", a),
        console.log("[Pyramid] Click handler setup complete (event delegation mode)");
}
function confirmPositionAssignment(e, t, n) {
    const a = gameState.employees.find((t) => t.id === e),
        o = getPosition(t);
    if (!a || !o) return;
    const i = getEmployeePosition(a.id),
        s = i ? gameState.hierarchyLevels[Math.floor(i.level)] : null;
    let r = gameState.hierarchyLevels[Math.floor(o.level)];
    if (
        (r || (r = { icon: "📋", color: "var(--l-cyan)", title: "Position" }),
        "secretary" === o.positionId && (r = { icon: "📋", color: "#e879f9", title: "Executive Secretary" }),
        gameState.cash < n)
    )
        return void showNotification(`Not enough cash! Need $${formatNumber(n)}`, "error");
    const l = document.createElement("div");
    (l.id = "promotionConfirmModal"),
        (l.style.cssText =
            "position:fixed !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; background:var(--l-veil-90) !important; display:flex !important; align-items:center !important; justify-content:center !important; z-index:10000010 !important; animation:fadeIn 0.2s ease;");
    const c = i && o.level > i.level,
        d = c ? "Promote" : i ? "Transfer" : "Assign",
        p = c ? "var(--l-green)" : "var(--l-cyan)";
    (l.innerHTML = `\n      <style>\n        @keyframes fadeIn {\n          from { opacity: 0; }\n          to { opacity: 1; }\n        }\n        @keyframes slideUp {\n          from { transform: translateY(30px); opacity: 0; }\n          to { transform: translateY(0); opacity: 1; }\n        }\n        @keyframes pulse {\n          0%, 100% { transform: scale(1); }\n          50% { transform: scale(1.05); }\n        }\n      </style>\n      <div style="background:var(--bg); border-radius:16px; box-shadow:0 20px 60px var(--l-veil-80); max-width:700px; width:90%; overflow:hidden; animation:slideUp 0.3s ease;">\n        \x3c!-- Header --\x3e\n        <div style="padding:24px; background:linear-gradient(135deg, ${p}, ${fuocAlpha(p, "22")}); border-bottom:2px solid ${p};">\n          <h2 style="margin:0; color:var(--l-ink); font-size:1.8rem; text-align:center; display:flex; align-items:center; justify-content:center; gap:12px;">\n            ${c ? "⬆️" : "↔️"}\n            <span>Confirm ${d}</span>\n          </h2>\n        </div>\n        \n        \x3c!-- Content --\x3e\n        <div style="padding:32px 24px;">\n          \x3c!-- Employee Card --\x3e\n          <div style="text-align:center; margin-bottom:24px;">\n            <img src="${a.profileImage || placeholderImage(80, 80)}" style="width:80px; height:80px; border-radius:50%; border:3px solid ${p}; object-fit:cover; box-shadow:0 4px 12px var(--l-veil-30);">\n            <h3 style="color:var(--l-ink); margin:12px 0 4px 0; font-size:1.3rem;">${a.name}</h3>\n            ${a.career ? `<div style="color:var(--text-mute); font-size:0.9rem;">Currently: ${a.career.title || "Employee"} (Level ${a.career.level || 1})</div>` : ""}\n          </div>\n          \n          \x3c!-- Position Cards with Arrow --\x3e\n          <div style="display:flex; align-items:center; justify-content:center; gap:16px; margin:24px 0;">\n            \x3c!-- Old Position (if exists) --\x3e\n            ${i ? `\n              <div style="flex:1; background:var(--surface); border:2px solid ${s?.color || "var(--l-neutral-5)"}; border-radius:12px; padding:16px; text-align:center;">\n                <div style="font-size:1.5rem; margin-bottom:8px;">${s?.icon || "📋"}</div>\n                <div style="color:var(--l-ink); font-weight:600; font-size:0.9rem; margin-bottom:4px;">${i.title}</div>\n                <div style="color:var(--text-mute); font-size:0.75rem;">Level ${Math.floor(i.level)}</div>\n              </div>\n            ` : '\n              <div style="flex:1; background:var(--surface); border:2px dashed var(--l-neutral-5); border-radius:12px; padding:16px; text-align:center; opacity:0.5;">\n                <div style="font-size:1.5rem; margin-bottom:8px;">❌</div>\n                <div style="color:var(--text-mute); font-weight:600; font-size:0.9rem;">Unassigned</div>\n              </div>\n            '}\n            \n            \x3c!-- Arrow --\x3e\n            <div style="font-size:2rem; color:${p}; animation:pulse 2s infinite;">\n              ${c ? "⬆️" : "➡️"}\n            </div>\n            \n            \x3c!-- New Position --\x3e\n            <div style="flex:1; background:linear-gradient(135deg, ${fuocAlpha(r.color, "22")}, ${fuocAlpha(r.color, "11")}); border:2px solid ${r.color}; border-radius:12px; padding:16px; text-align:center; box-shadow:0 0 20px ${fuocAlpha(r.color, "44")};">\n              <div style="font-size:1.5rem; margin-bottom:8px;">${r.icon}</div>\n              <div style="color:var(--l-ink); font-weight:600; font-size:0.9rem; margin-bottom:4px;">${o.title}</div>\n              <div style="color:${r.color}; font-size:0.75rem; font-weight:600;">Level ${Math.floor(o.level)}</div>\n            </div>\n          </div>\n          \n          \x3c!-- Cost Info --\x3e\n          <div style="background:var(--l-panel); border:2px solid ${gameState.cash >= n ? p : "var(--l-red)"}; border-radius:10px; padding:16px; margin:24px 0;">\n            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">\n              <span style="color:var(--text-mute); font-size:0.9rem;">Cost:</span>\n              <span style="color:${gameState.cash >= n ? "var(--l-green)" : "var(--l-red)"}; font-weight:700; font-size:1.2rem;">$${formatNumber(n)}</span>\n            </div>\n            <div style="display:flex; justify-content:space-between; align-items:center;">\n              <span style="color:var(--text-mute); font-size:0.9rem;">Your Cash:</span>\n              <span style="color:var(--l-ink); font-weight:600; font-size:1rem;">$${formatNumber(gameState.cash)}</span>\n            </div>\n            ${gameState.cash >= n ? `\n              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:8px; border-top:1px solid var(--border);">\n                <span style="color:var(--text-mute); font-size:0.9rem;">After ${d}:</span>\n                <span style="color:var(--positive); font-weight:600; font-size:1rem;">$${formatNumber(gameState.cash - n)}</span>\n              </div>\n            ` : ""}\n          </div>\n          \n          ${gameState.cash < n ? '\n            <div style="background:rgba(233,69,96,0.1); border:1px solid var(--danger); border-radius:8px; padding:12px; margin-bottom:16px; text-align:center;">\n              <span style="color:var(--danger); font-size:0.9rem; font-weight:600;">⚠️ Insufficient funds!</span>\n            </div>\n          ' : ""}\n          \n          \x3c!-- Action Buttons --\x3e\n          <div style="display:flex; gap:12px; margin-top:24px;">\n            <button onclick="document.getElementById('promotionConfirmModal').remove()" style="flex:1; padding:14px; background:var(--surface); border:2px solid var(--border-strong); border-radius:10px; color:var(--l-ink); font-weight:600; font-size:1rem; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='var(--l-panel-2)'; this.style.borderColor='var(--l-neutral-7)'" onmouseleave="this.style.background='var(--l-panel-2)'; this.style.borderColor='var(--l-neutral-5)'">\n              ✕ Cancel\n            </button>\n            <button \n              onclick="executePromotion('${e}', '${t}')" \n              style="flex:1; padding:14px; background:${gameState.cash >= n ? `linear-gradient(135deg, ${p}, ${fuocAlpha(p, "dd")})` : "var(--l-neutral-5)"}; border:none; border-radius:10px; color:${gameState.cash >= n ? "var(--l-black)" : "var(--l-neutral-9)"}; font-weight:700; font-size:1rem; cursor:${gameState.cash >= n ? "pointer" : "not-allowed"}; transition:all 0.2s; box-shadow:${gameState.cash >= n ? `0 4px 12px ${fuocAlpha(p, "44")}` : "none"};"\n              ${gameState.cash >= n ? `onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px ${fuocAlpha(p, "66")}'" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px ${fuocAlpha(p, "44")}'"` : "disabled"}\n            >\n              ✓ Confirm ${d}\n            </button>\n          </div>\n        </div>\n      </div>\n    `),
        document.body.appendChild(l),
        l.addEventListener("click", (e) => {
            e.target === l && l.remove();
        });
}
function executePromotion(e, t) {
    const n = document.getElementById("promotionConfirmModal");
    n && n.remove();
    const a = assignEmployeeToPosition(e, t, !0);
    if (a.success) {
        if ((showNotification(a.message, "success"), a.needsRehire && a.vacatedPosition)) {
            const e = gameState.products.find((e) => e.id === a.vacatedPosition.productId);
            e &&
                setTimeout(() => {
                    showNotification(
                        `⚠️ ${a.vacatedPosition.title} is now vacant! Hire a new staff member to restore automation for ${e.name}`,
                        "warning",
                        5e3
                    );
                }, 1500);
        }
        // Close the position-details popup but keep the ladder open + refreshed,
        // so the player can promote several people without reopening it.
        document.querySelectorAll(".position-details-modal").forEach((m) => m.remove());
        const pm = document.getElementById("pyramidModal");
        pm && "none" !== pm.style.display
            ? renderLadderView(localStorage.getItem("fuoc_ladder_view") || "list", null)
            : void 0;
        updatePeopleTab(), updateProductsList(), updateBusinessTab();
    } else showNotification(a.message, "error");
}
function showPositionDetailsModal(e) {
    const t = getPosition(e);
    if (!t) return;
    const n = t.employeeId ? gameState.employees.find((e) => e.id === t.employeeId) : null,
        a = Math.floor(t.level),
        o = gameState.hierarchyLevels[a] || { icon: "📋", color: "var(--l-cyan)", title: "Position" },
        i = "secretary" === t.positionId,
        s = i ? "📋" : o.icon,
        r = i ? "#e879f9" : o.color,
        l = document.createElement("div");
    (l.id = `positionDetailsModal_${e}`),
        (l.className = "position-details-modal"),
        (l.style.cssText =
            "position:fixed !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; background:var(--l-veil-80) !important; display:flex !important; align-items:center !important; justify-content:center !important; z-index:10000010 !important;"),
        (l.innerHTML = `\n      <div style="background:var(--bg); width:90%; max-width:500px; border-radius:12px; box-shadow:0 8px 32px var(--l-veil-50); overflow:hidden;">\n        <div style="padding:20px; border-bottom:2px solid var(--l-sheen-10); background:linear-gradient(135deg, var(--l-panel-deep-3) 0%, var(--l-bg) 100%);">\n          <h3 style="margin:0; color:var(--l-ink); font-size:1.5rem; display:flex; align-items:center; gap:10px;">\n            <span>${s}</span>\n            ${t.title}\n          </h3>\n          <p style="margin:4px 0 0 0; color:var(--text-mute); font-size:0.9rem;">Level ${t.level} Position${i ? " • Reports to CEO" : ""}</p>\n        </div>\n        \n        <div style="padding:20px;">\n          ${
                n
                    ? `\n            <div style="text-align:center; margin-bottom:20px;">\n              <img src="${n.profileImage || placeholderImage(100, 100)}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid ${r}; margin-bottom:12px;">\n              <div style="font-size:1.2rem; font-weight:600; color:var(--l-ink); margin-bottom:4px;">${n.name}</div>\n              <div style="font-size:0.9rem; color:var(--text-dim);">Current Level: ${n.career?.level || 1}</div>\n              <div style="font-size:0.9rem; color:var(--positive); margin-top:8px;">Salary: $${formatNumber(n.career?.salary || n.salary || 0)}/year</div>\n            </div>\n            \n            <div style="margin-bottom:20px;">\n              <div style="font-size:0.9rem; color:var(--text-mute); margin-bottom:8px;">Skills:</div>\n              <div style="display:flex; gap:8px; flex-wrap:wrap;">\n                ${
                          n.skills && "object" == typeof n.skills
                              ? Object.entries(n.skills)
                                    .filter(([e, t]) => t && t.level > 0)
                                    .map(
                                        ([e, t]) =>
                                            `\n                      <span style="padding:4px 10px; background:var(--surface); border-radius:6px; font-size:0.8rem; color:var(--accent);">\n                        ${e.charAt(0).toUpperCase() + e.slice(1)} Lv${t.level}\n                      </span>\n                    `
                                    )
                                    .join("")
                              : '<span style="color:var(--text-mute); font-size:0.8rem;">No skills yet</span>'
                      }\n              </div>\n            </div>\n            \n            ${(() => {
                          const e = (n.career?.level || 1) + 1,
                              t = e > 7,
                              a = canPromote(n),
                              o = t ? null : getPromotionRequirements(e, n);
                          if (t)
                              return '\n                  <div style="margin-bottom:20px; padding:12px; background:linear-gradient(135deg, var(--l-gold) 0%, #ffed4e 100%); border-radius:8px; border:2px solid var(--l-orange);">\n                    <div style="font-size:0.9rem; font-weight:600; color:var(--l-on-accent); margin-bottom:4px; display:flex; align-items:center; gap:8px;">\n                      <span style="font-size:1.2rem;">👑</span>\n                      Maximum Level Reached\n                    </div>\n                    <div style="font-size:0.75rem; color:var(--l-on-accent);">This employee has reached the highest career level!</div>\n                  </div>\n                ';
                          const i = gameState.hierarchyLevels[e] ||
                                  gameState.hierarchyLevels[e - 1] || {
                                      title: "Next Level",
                                      color: "var(--l-cyan)",
                                      icon: "⬆️",
                                      baseSalary: 135e3,
                                  },
                              s = n.stats?.productivity || 0,
                              r = n.skills?.management?.level || 0,
                              l = s >= (o?.minProductivity || 0),
                              c = !o?.minManagement || r >= o.minManagement;
                          return a
                              ? `\n                  <div style="margin-bottom:20px; padding:12px; background:linear-gradient(135deg, var(--l-green) 0%, #3ba882 100%); border-radius:8px; border:2px solid var(--positive);">\n                    <div style="font-size:0.9rem; font-weight:600; color:var(--l-on-accent); margin-bottom:4px; display:flex; align-items:center; gap:8px;">\n                      <span style="font-size:1.2rem;">⬆️</span>\n                      Ready for Promotion!\n                    </div>\n                    <div style="font-size:0.75rem; color:var(--l-on-accent); margin-bottom:8px;">\n                      ${n.name} can be promoted to <strong>${i.title}</strong> (Level ${e})\n                    </div>\n                    <div style="font-size:0.7rem; color:var(--l-on-accent);">\n                      ✓ Productivity: ${s}% (needs ${o.minProductivity}%)<br>\n                      ${o.minManagement ? `✓ Management: Level ${r} (needs ${o.minManagement})` : ""}\n                    </div>\n                  </div>\n                `
                              : `\n                  <div style="margin-bottom:20px; padding:12px; background:rgba(233,69,96,0.2); border-radius:8px; border:2px solid var(--danger);">\n                    <div style="font-size:0.9rem; font-weight:600; color:var(--danger); margin-bottom:4px; display:flex; align-items:center; gap:8px;">\n                      <span style="font-size:1.2rem;">📋</span>\n                      Promotion Requirements\n                    </div>\n                    <div style="font-size:0.75rem; color:var(--l-ink); margin-bottom:8px;">\n                      For promotion to <strong>${i.title}</strong> (Level ${e}):\n                    </div>\n                    <div style="font-size:0.7rem; color:var(--l-ink);">\n                      ${l ? "✓" : "✗"} Productivity: ${s}% ${l ? '<span style="color:var(--positive);">(met!)</span>' : `<span style="color:var(--danger);">(needs ${o.minProductivity}%)</span>`}<br>\n                      ${o.minManagement ? `\n                        ${c ? "✓" : "✗"} Management: Level ${r} ${c ? '<span style="color:var(--positive);">(met!)</span>' : `<span style="color:var(--danger);">(needs ${o.minManagement})</span>`}\n                      ` : ""}\n                    </div>\n                  </div>\n                `;
                      })()}\n            \n            \x3c!-- Action Buttons --\x3e\n            <div style="display:flex; gap:10px; margin-bottom:10px;">\n              <button id="transferEmployeeBtn" style="flex:1; padding:12px; background:var(--l-cyan); border:none; border-radius:8px; color:var(--l-on-accent); cursor:pointer; font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px;" title="Transfer to another position at the same level">\n                <span>🔄</span> Transfer\n              </button>\n              <button id="promoteEmployeeBtn" ${canPromote(n) ? "" : "disabled"} style="flex:1; padding:12px; background:${canPromote(n) ? "var(--l-green)" : "var(--l-neutral-3)"}; border:none; border-radius:8px; color:${canPromote(n) ? "var(--l-bg)" : "var(--l-neutral-6)"}; cursor:${canPromote(n) ? "pointer" : "not-allowed"}; font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px; opacity:${canPromote(n) ? "1" : "0.5"};" title="${canPromote(n) ? "Promote to next level" : "Not eligible for promotion yet"}">\n                <span>⬆️</span> Promote\n              </button>\n              <button id="unassignEmployeeBtn" style="flex:1; padding:12px; background:var(--surface-2); border:1px solid var(--border); border-radius:8px; color:var(--l-ink); cursor:pointer; font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px;" title="Take them off this seat (they stay employed)">\n                <span>↩️</span> Unassign\n              </button>\n            </div>\n            \n            <button id="terminateEmployeeBtn" style="width:100%; padding:12px; background:var(--l-red); border:none; border-radius:8px; color:var(--l-ink-on-fill); cursor:pointer; font-weight:600; margin-bottom:10px; display:flex; align-items:center; justify-content:center; gap:6px;">\n              <span>🚫</span> Terminate Employment\n            </button>\n          `
                    : '\n            <div style="text-align:center; padding:40px 20px;">\n              <div style="font-size:3rem; opacity:0.3; margin-bottom:12px;">👤</div>\n              <div style="font-size:1.1rem; color:var(--text-dim); margin-bottom:8px;">Position Vacant</div>\n              <div style="font-size:0.85rem; color:var(--text-mute);">Go to People tab and click "Promote" on an employee to assign them here.</div>\n            </div>\n          '
            }\n          \n          <button id="closeDetailsBtn" style="width:100%; padding:12px; background:var(--surface-2); border:none; border-radius:8px; color:var(--l-ink); cursor:pointer; font-weight:600;">\n            Close\n          </button>\n        </div>\n      </div>\n    `),
        document.body.appendChild(l),
        l.addEventListener("click", (e) => {
            e.target === l && l.remove();
        });
    const c = l.querySelector("#closeDetailsBtn");
    if (
        (c &&
            c.addEventListener("click", () => {
                l.remove();
            }),
        n)
    ) {
        const e = l.querySelector("#transferEmployeeBtn");
        e &&
            e.addEventListener("click", () => {
                showTransferModal(n, t), l.remove();
            });
        const a = l.querySelector("#promoteEmployeeBtn");
        a &&
            !a.disabled &&
            a.addEventListener("click", () => {
                l.remove(), openCorporatePyramidModal(n.id);
            });
        const u = l.querySelector("#unassignEmployeeBtn");
        u &&
            u.addEventListener("click", () => {
                l.remove(), removeEmployeeFromPosition(t, n.id);
            });
        const o = l.querySelector("#terminateEmployeeBtn");
        o &&
            o.addEventListener("click", async () => {
                (await showConfirm(
                    `Are you sure you want to terminate ${n.name}?\n\nThis will:\n• Remove them from this position\n• Set their status to "alumni"\n• Disable automation if they manage a product`,
                    "Terminate Employee",
                    { type: "danger", confirmText: "Terminate" }
                )) &&
                    (handleEmployeeAction(n.id, "fire"),
                    l.remove(),
                    "flex" === document.getElementById("pyramidModal").style.display &&
                        openCorporatePyramidModal());
            });
    }
}
// The salary someone would earn in a given seat: that seat's market rate (level, site,
// product) plus whatever they currently earn above market. Mirrors assignEmployeeToPosition.
function estimateSalaryForPosition(emp, pos) {
    const product = pos?.productId ? gameState.products.find((p) => p.id === pos.productId) : null,
        premium = Math.max(0, (emp.career?.salary || 0) - getMarketRate(emp, emp.career?.level)),
        asSeated = { ...emp, productId: product?.id || null, productManaged: product?.name || null, locationId: pos?.locationId || emp.locationId };
    return getMarketRate(asSeated, Math.floor(pos?.level || 1)) + premium;
}
function showTransferModal(e, t) {
    const transferEmp = e; // the option list below shadows `e`
    console.log(`\n[TRANSFER] Opening transfer modal for ${e.name} from ${t.title}`);
    const n = document.createElement("div");
    (n.id = "transferModal"),
        (n.style.cssText =
            "position:fixed !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; background:var(--l-veil-80) !important; display:flex !important; align-items:center !important; justify-content:center !important; z-index:10000010 !important;");
    const a = "secretary" === t.positionId || "Executive Secretary" === t.title,
        o = Math.floor(t.level),
        i = [];
    if (!a) {
        (gameState.corporatePyramid.positions[o] || [])
            .filter((e) => e.positionId !== t.positionId && !e.employeeId)
            .forEach((e) => {
                i.push({ ...e, transferType: "lateral" });
            });
    }
    if (o > 1) {
        const e = 1;
        for (let t = a ? 3 : o - 1; t >= e; t--) {
            (gameState.corporatePyramid.positions[t] || [])
                .filter((e) => !e.employeeId)
                .forEach((e) => {
                    i.push({ ...e, transferType: "demotion", levelDifference: o - t });
                });
        }
    }
    console.log(
        `[TRANSFER] Found ${i.length} total options (lateral + demotion)${a ? " [Executive Secretary: max demotion to Level 3]" : ""}`
    ),
        (n.innerHTML = `\n      <div style="background:var(--bg); width:90%; max-width:700px; border-radius:12px; box-shadow:0 8px 32px var(--l-veil-50); overflow:hidden; max-height:85vh; display:flex; flex-direction:column;">\n        <div style="padding:20px; border-bottom:2px solid var(--l-sheen-10); background:linear-gradient(135deg, ${a ? "var(--l-violet-2) 0%, var(--l-violet-4) 100%" : "var(--l-cyan) 0%, #0088cc 100%"});">\n          <h3 style="margin:0; color:#${a ? "fff" : "0f1419"}; font-size:1.5rem; display:flex; align-items:center; gap:10px;">\n            <span>🔄</span>\n            ${a ? "Demote" : "Transfer or Demote"} ${e.name}\n          </h3>\n          <p style="margin:4px 0 0 0; color:#${a ? "ddd" : "000"}; font-size:0.9rem;">\n            Current: ${t.title} (Level ${o})${a ? " • Special Role" : ""}\n          </p>\n        </div>\n        \n        <div style="flex:1; overflow-y:auto; padding:20px;">\n          ${
                i.length > 0
                    ? `\n            ${a ? '\n              <div style="margin-bottom:16px; padding:12px; background:rgba(155,89,182,0.2); border-left:4px solid var(--l-violet-2); border-radius:6px;">\n                <div style="font-size:0.85rem; color:var(--l-violet-2); font-weight:600; margin-bottom:4px;">👔 Executive Secretary Special Rules</div>\n                <div style="font-size:0.75rem; color:var(--l-ink);">\n                  • Executive Secretary is a <strong>special high-level role</strong> that can be filled early<br/>\n                  • Not equivalent to other Level 6, 5, or 4 management positions<br/>\n                  • Can only be demoted to <strong>Level 3 (Regional Manager) or below</strong><br/>\n                  • Demotion cost: <strong>50%</strong> of destination hiring cost\n                </div>\n              </div>\n            ' : '\n              <div style="margin-bottom:16px; padding:12px; background:rgba(255,193,7,0.2); border-left:4px solid var(--l-x-yellow); border-radius:6px;">\n                <div style="font-size:0.85rem; color:var(--l-x-yellow); font-weight:600; margin-bottom:4px;">⚠️ Transfer Cost Policy</div>\n                <div style="font-size:0.75rem; color:var(--l-ink);">\n                  • <strong>Lateral transfers</strong> (same level): 75% of destination hiring cost<br/>\n                  • <strong>Demotions</strong> (lower level): 50% of destination hiring cost\n                </div>\n              </div>\n            '}\n            \n            <div style="display:flex; flex-direction:column; gap:12px;">\n              ${i
                          .map((e) => {
                              const t = gameState.locations.find((t) => t.id === e.locationId),
                                  n = e.productId ? gameState.products.find((t) => t.id === e.productId) : null,
                                  a = n
                                      ? n.managerHireCost || 500
                                      : t
                                        ? 500 * (gameState.locations.indexOf(t) + 1)
                                        : 500,
                                  o = "demotion" === e.transferType ? 0.5 : 0.75,
                                  i = Math.floor(a * o),
                                  s = gameState.cash >= i,
                                  r = gameState.hierarchyLevels[e.level],
                                  l = "demotion" === e.transferType ? "var(--l-orange-2)" : "var(--l-cyan)",
                                  c = "demotion" === e.transferType ? "var(--l-orange-2)" : "var(--l-green)";
                              return `\n                  <div class="transfer-option" data-position-id="${e.positionId}" data-cost="${i}" data-type="${e.transferType}" style="padding:16px; background:var(--surface); border-radius:8px; border:2px solid ${s ? l : "var(--l-neutral-5)"}; cursor:${s ? "pointer" : "not-allowed"}; transition:all 0.3s ease; opacity:${s ? "1" : "0.5"};" onmouseenter="if(${s}) this.style.borderColor='${c}'; this.style.transform='translateX(4px)';" onmouseleave="this.style.borderColor='${s ? l : "var(--l-neutral-5)"}'; this.style.transform='translateX(0)';">\n                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">\n                      <div style="flex:1;">\n                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">\n                          ${"demotion" === e.transferType ? '<span style="background:var(--l-orange-2); color:var(--l-on-accent); padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:700;">⬇ DEMOTION</span>' : '<span style="background:var(--l-cyan); color:var(--l-on-accent); padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:700;">↔ LATERAL</span>'}\n                          <span style="font-weight:600; color:var(--l-ink); font-size:0.95rem;">${e.title}</span>\n                        </div>\n                        <div style="font-size:0.75rem; color:var(--text-mute); margin-left:0px;">\n                          Level ${e.level}: ${r ? r.title : "Unknown"}\n                        </div>\n                        ${t ? `<div style="font-size:0.75rem; color:var(--text-mute); margin-top:2px;">📍 ${t.name}</div>` : ""}\n                        ${n ? `<div style="font-size:0.75rem; color:var(--positive); margin-top:2px;">📦 ${n.name}</div>` : ""}\n                        ${"demotion" === e.transferType ? `<div style="font-size:0.7rem; color:var(--l-orange-2); margin-top:4px;">⚠️ Salary will change to about $${formatNumber(estimateSalaryForPosition(transferEmp, e))}</div>` : ""}\n                      </div>\n                      <div style="text-align:right;">\n                        <div style="font-size:0.9rem; font-weight:600; color:${s ? c : "var(--l-red)"};">\n                          $${formatNumber(i)}\n                        </div>\n                        <div style="font-size:0.65rem; color:var(--text-mute); margin-top:2px;">\n                          (${Math.round(100 * o)}% of hire cost)\n                        </div>\n                      </div>\n                    </div>\n                    \n                    ${s ? `\n                      <div style="margin-top:8px; padding:6px; background:rgba(78,204,163,0.2); border-radius:4px; text-align:center;">\n                        <div style="font-size:0.7rem; color:${c};">✓ Click to ${"demotion" === e.transferType ? "demote" : "transfer"}</div>\n                      </div>\n                    ` : `\n                      <div style="margin-top:8px; padding:6px; background:rgba(233,69,96,0.2); border-radius:4px; text-align:center;">\n                        <div style="font-size:0.7rem; color:var(--danger);">Need $${formatNumber(i - gameState.cash)} more</div>\n                      </div>\n                    `}\n                  </div>\n                `;
                          })
                          .join("")}\n            </div>\n          `
                    : `\n            <div style="text-align:center; padding:40px 20px;">\n              <div style="font-size:3rem; opacity:0.3; margin-bottom:12px;">🔄</div>\n              <div style="font-size:1.1rem; color:var(--text-dim); margin-bottom:8px;">No ${a ? "Demotion" : "Transfer"} Options Available</div>\n              <div style="font-size:0.85rem; color:var(--text-mute);">\n                ${a ? "All positions at Level 3 (Regional Manager) and below are currently filled." : "All positions at this level and below are currently filled."}\n              </div>\n            </div>\n          `
            }\n        </div>\n        \n        <div style="padding:16px; border-top:2px solid var(--l-sheen-10); background:var(--l-bg);">\n          <button id="closeTransferModal" style="width:100%; padding:12px; background:var(--surface-2); border:none; border-radius:8px; color:var(--l-ink); cursor:pointer; font-weight:600;">\n            Cancel\n          </button>\n        </div>\n      </div>\n    `),
        document.body.appendChild(n),
        n.querySelector("#closeTransferModal").addEventListener("click", () => {
            n.remove();
        }),
        n.querySelectorAll(".transfer-option").forEach((a) => {
            const o = a.dataset.positionId,
                i = parseInt(a.dataset.cost),
                s = a.dataset.type;
            gameState.cash >= i &&
                a.addEventListener("click", async () => {
                    const a = getPosition(o);
                    if (!a) return;
                    const r = "demotion" === s,
                        l = r ? "Demote" : "Transfer",
                        c = gameState.hierarchyLevels[a.level];
                    let d = `${l} ${e.name} to ${a.title}?\n\nCost: $${formatNumber(i)}\nRemaining cash: $${formatNumber(gameState.cash - i)}`;
                    const ns = estimateSalaryForPosition(e, a),
                        cs = e.career?.salary || 0;
                    if (
                        (r
                            ? c && (d += `\n\n⚠️ This is a demotion!\nNew salary: about $${formatNumber(ns)}`)
                            : Math.abs(ns - cs) > 0.01 * cs &&
                              (d += `\n\nSalary: $${formatNumber(cs)} → about $${formatNumber(ns)} (what the new seat pays)`),
                        await showConfirm(d, r ? "Confirm Demotion" : "Confirm Transfer", {
                            type: r ? "warning" : "info",
                            confirmText: l,
                        }))
                    ) {
                        if (
                            (console.log(
                                `[TRANSFER] Executing ${r ? "demotion" : "transfer"} to ${a.title} for $${formatNumber(i)}`
                            ),
                            a.employeeId)
                        )
                            return void showNotification(
                                `Cannot ${r ? "demote" : "transfer"}: ${a.title} is now occupied by someone else!`,
                                "error"
                            );
                        if (((t.employeeId = null), (t.isVacant = !0), t.productId)) {
                            const n = gameState.products.find((e) => e.id === t.productId);
                            n && n.managerId === e.id && ((n.managerHired = !1), (n.managerId = null));
                        }
                        const s = assignEmployeeToPosition(e.id, o, !1);
                        if (s.success) {
                            gameState.cash -= i;
                            const t = r ? "demoted" : "transferred";
                            showNotification(`${e.name} ${t} to ${a.title}! Cost: $${formatNumber(i)}`, "success"),
                                n.remove(),
                                "flex" === document.getElementById("pyramidModal").style.display &&
                                    openCorporatePyramidModal(),
                                updatePeopleTab(),
                                "people" === gameState.activeTab && switchTab("people"),
                                saveGame();
                        } else showNotification(`${l} failed: ${s.message}`, "error");
                    }
                });
        });
}
async function removeEmployeeFromPosition(e, t) {
    const n = gameState.employees.find((e) => e.id === t);
    if (
        n &&
        (await showConfirm(
            `Take ${n.name} off this seat?\n\nThey stay employed and paid, but stop managing anything (including any product this seat runs) until you give them a seat again.`,
            "Unassign",
            { type: "warning", confirmText: "Unassign" }
        ))
    ) {
        removeEmployeeFromPyramid(t)
            ? (showNotification(`${n.name} is unassigned`, "success"),
              saveGame(!1),
              "function" == typeof closeCorporatePyramidModal && closeCorporatePyramidModal(),
              setTimeout(() => openCorporatePyramidModal(), 100))
            : showNotification("Failed to remove employee", "error");
    }
}
gameState.peopleSorting || (gameState.peopleSorting = { sortBy: "recentMessages", showFavoritesOnly: !1 }),
    (window.canPromoteEmployee = canPromoteEmployee),
    (window.startPromotionFlow = startPromotionFlow),
    (window.executePromotion = executePromotion);
let pyramidZoomLevel = 1;
function pyramidZoom(e) {
    const t = document.getElementById("pyramidCanvas");
    t &&
        ("in" === e
            ? (pyramidZoomLevel = Math.min(pyramidZoomLevel + 0.2, 2))
            : "out" === e
              ? (pyramidZoomLevel = Math.max(pyramidZoomLevel - 0.2, 0.5))
              : "reset" === e && (pyramidZoomLevel = 1),
        (t.style.transform = `scale(${pyramidZoomLevel})`));
}
function setupPinchZoom() {
    const e = document.getElementById("pyramidContainer"),
        t = document.getElementById("pyramidCanvas");
    if (!e || !t) return;
    let n = 0,
        a = pyramidZoomLevel;
    e.addEventListener(
        "touchstart",
        (e) => {
            if (2 === e.touches.length) {
                e.preventDefault();
                const t = e.touches[0],
                    o = e.touches[1];
                (n = Math.hypot(o.pageX - t.pageX, o.pageY - t.pageY)), (a = pyramidZoomLevel);
            }
        },
        { passive: !1 }
    ),
        e.addEventListener(
            "touchmove",
            (e) => {
                if (2 === e.touches.length) {
                    e.preventDefault();
                    const o = e.touches[0],
                        i = e.touches[1],
                        s = Math.hypot(i.pageX - o.pageX, i.pageY - o.pageY) / n;
                    (pyramidZoomLevel = Math.max(0.5, Math.min(2, a * s))),
                        (t.style.transform = `scale(${pyramidZoomLevel})`);
                }
            },
            { passive: !1 }
        );
}
function closeCorporatePyramidModal() {
    const e = document.getElementById("pyramidModal");
    e && ((e.style.display = "none"), (e.innerHTML = "")), (pyramidZoomLevel = 1);
}
