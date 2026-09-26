// ============================================================================
// 34-corporate — Corporate pyramid: structure math, modal, ladder, promotions, transfers, zoom.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function Dd() {
  Object.keys(gameState.corporateHierarchy.levels).forEach((e) => {
    gameState.corporateHierarchy.levels[e] = [];
  }), gameState.employees.forEach((e) => {
    if ("active" !== e.employmentStatus) return;
    if (!e.career) return;
    const t = e.career.level;
    gameState.corporateHierarchy.levels[t] && gameState.corporateHierarchy.levels[t].push(e.id);
  });
}
function Od() {
  if (!gameState.corporatePyramid) return void console.error("[Pyramid] corporatePyramid not found in gameState!");
  gameState.corporatePyramid.secretaryPosition || (gameState.corporatePyramid.secretaryPosition = { positionId: "secretary", title: "Executive Secretary", level: 6.5, employeeId: null, reportsTo: "ceo", subordinates: [] }), gameState.corporatePyramid.positions && "object" == typeof gameState.corporatePyramid.positions || (console.log("[Pyramid] Migrating to hierarchical structure..."), gameState.corporatePyramid.positions = { 6: [{ positionId: "senior_exec", title: "Senior Executive", level: 6, employeeId: null, reportsTo: "ceo", subordinates: [], span: 2 }], 5: [{ positionId: "cfo", title: "Chief Financial Officer", level: 5, employeeId: null, reportsTo: "senior_exec", subordinates: [], span: 2 }, { positionId: "coo", title: "Chief Operating Officer", level: 5, employeeId: null, reportsTo: "senior_exec", subordinates: [], span: 2 }], 4: [{ positionId: "branch_mgr_1", title: "Branch Manager 1", level: 4, employeeId: null, reportsTo: "cfo", subordinates: [], locationsManaged: [], span: 3 }, { positionId: "branch_mgr_2", title: "Branch Manager 2", level: 4, employeeId: null, reportsTo: "cfo", subordinates: [], locationsManaged: [], span: 3 }, { positionId: "branch_mgr_3", title: "Branch Manager 3", level: 4, employeeId: null, reportsTo: "coo", subordinates: [], locationsManaged: [], span: 2 }, { positionId: "branch_mgr_4", title: "Branch Manager 4", level: 4, employeeId: null, reportsTo: "coo", subordinates: [], locationsManaged: [], span: 1 }], 3: [], 2: [], 1: [] }, gameState.corporatePyramid.promotionCosts || (gameState.corporatePyramid.promotionCosts = { 1: 500, 2: 2e3, 3: 1e4, 4: 5e4, 5: 15e4, 6: 5e5, 7: 0 }));
  for (let e2 = 1; e2 <= 6; e2++) Array.isArray(gameState.corporatePyramid.positions[e2]) || (gameState.corporatePyramid.positions[e2] = []);
  const e = gameState.locations.filter((e2) => e2.unlocked);
  e.length, e.forEach((e2, t) => {
    if (!gameState.corporatePyramid.positions[3].find((t2) => t2.locationId === e2.id)) {
      const n = Math.floor(t / 2.25), a = `branch_mgr_${Math.min(n + 1, 4)}`;
      gameState.corporatePyramid.positions[3].push({ positionId: `regional_mgr_${e2.id}`, title: `Regional Manager - ${e2.name}`, level: 3, employeeId: null, reportsTo: a, subordinates: [], locationId: e2.id, span: 3 });
    }
  }), e.forEach((e2) => {
    const t = gameState.products.filter((t2) => t2.locationId === e2.id && t2.unlocked).length, n = Math.max(1, Math.ceil(t / 5));
    for (let t2 = 0; t2 < n; t2++) gameState.corporatePyramid.positions[2].find((n2) => n2.locationId === e2.id && n2.managerId === t2) || gameState.corporatePyramid.positions[2].push({ positionId: `local_mgr_${e2.id}_${t2}`, title: `Local Manager ${t2 + 1} - ${e2.name}`, level: 2, employeeId: null, reportsTo: `regional_mgr_${e2.id}`, subordinates: [], locationId: e2.id, managerId: t2, span: 5 });
  }), e.forEach((e2) => {
    gameState.products.filter((t) => t.locationId === e2.id && t.unlocked).forEach((t, n) => {
      if (!gameState.corporatePyramid.positions[1].find((e3) => e3.productId === t.id)) {
        const a = gameState.corporatePyramid.positions[2].filter((t2) => t2.locationId === e2.id), o = a[Math.floor(n / 5) % a.length];
        gameState.corporatePyramid.positions[1].push({ positionId: `staff_${t.id}`, title: `${t.name} Staff`, level: 1, employeeId: null, reportsTo: o ? o.positionId : null, locationId: e2.id, productId: t.id });
      }
    });
  }), console.log(`[Pyramid] Initialized: ${gameState.corporatePyramid.positions[1].length} Staff, ${gameState.corporatePyramid.positions[2].length} Local Managers, ${gameState.corporatePyramid.positions[3].length} Regional Managers`);
}
function Bd(e) {
  if ("ceo" === e) return gameState.corporatePyramid.ceo;
  if ("secretary" === e) return gameState.corporatePyramid.secretaryPosition;
  for (let t = 1; t <= 6; t++) {
    const n = gameState.corporatePyramid.positions[t];
    if (Array.isArray(n)) {
      const t2 = n.find((t3) => t3.positionId === e);
      if (t2) return t2;
    }
  }
  return null;
}
function Fd(e) {
  if (gameState.corporatePyramid.secretaryPosition?.employeeId === e) return gameState.corporatePyramid.secretaryPosition;
  for (let t = 1; t <= 6; t++) {
    const n = gameState.corporatePyramid.positions[t];
    if (Array.isArray(n)) {
      const t2 = n.find((t3) => t3.employeeId === e);
      if (t2) return t2;
    }
  }
  return null;
}
function jd(e) {
  const t = Fd(e);
  if (t) return Math.floor(t.level);
  const n = gameState.employees.find((t2) => t2.id === e);
  return n?.career?.level || 1;
}
function qd(e) {
  const t = [];
  for (let n = 1; n <= 6; n++) {
    const a = gameState.corporatePyramid.positions[n];
    Array.isArray(a) && a.forEach((n2) => {
      if (n2.reportsTo === e && n2.employeeId) {
        const e2 = gameState.employees.find((e3) => e3.id === n2.employeeId);
        e2 && t.push({ employee: e2, position: n2 });
      }
    });
  }
  return t;
}
function zd(e, t) {
  if (console.log("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), console.log(`[PROMOTION CHECK] Evaluating ${e.name} for ${t.title}`), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), !e || !t) return console.log("\u274C FAILED: Invalid employee or position"), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"), { canFill: false, reason: "Invalid employee or position" };
  if (t.employeeId && t.employeeId !== e.id) {
    const e2 = gameState.employees.find((e3) => e3.id === t.employeeId), n2 = e2 ? e2.name : "someone";
    return console.log(`\u274C FAILED: Position already occupied by ${n2}`), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"), { canFill: false, reason: `Position already occupied by ${n2}` };
  }
  if (!e.career) return console.log("\u274C FAILED: Employee has no career data"), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"), { canFill: false, reason: "Employee has no career data" };
  if (console.log("\u{1F4CA} Employee Stats:"), console.log(`   \u2022 Current Level: ${e.career.level} (${e.career.title})`), console.log(`   \u2022 Productivity: ${Math.round(e.stats.productivity)}%`), console.log(`   \u2022 Management Skill: Lv.${e.skills?.management?.level || 0}`), console.log("   \u2022 Other Skills:", { technical: e.skills?.technical?.level || 0, social: e.skills?.social?.level || 0, creativity: e.skills?.creativity?.level || 0 }), console.log("\n\u{1F3AF} Position Requirements:"), console.log(`   \u2022 Position: ${t.title}`), console.log(`   \u2022 Required Level: ${t.level}`), "secretary" === t.positionId) {
    if (console.log("   \u2022 Type: Secretary (special - Level 1-3 employees only)"), e.career.level >= 1 && e.career.level <= 3) return console.log("\n\u2705 SUCCESS: Meets all requirements!"), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"), { canFill: true, reason: "Meets all requirements" };
    const t2 = e.career.level > 3 ? "Too senior for this role" : "Requires Level 1 minimum";
    return console.log(`
\u274C FAILED: ${t2}`), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"), { canFill: false, reason: t2 };
  }
  const n = Math.floor(t.level), a = n - 1;
  if (console.log(`   \u2022 Position Level: ${n}`), console.log(`   \u2022 Minimum Employee Level Required: ${a}`), e.career.level < a) {
    const t2 = gameState.hierarchyLevels[a] || gameState.hierarchyLevels[1] || { title: "Staff", color: "var(--n)", icon: "\u{1F464}" }, n2 = `Requires at least Level ${a}${t2 ? " (" + t2.title + ")" : ""}`;
    return console.log(`
\u274C FAILED: ${n2}`), console.log(`   Employee is Level ${e.career.level}, needs to be at least Level ${a}`), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"), { canFill: false, reason: n2 };
  }
  if (console.log(`   \u2713 Level requirement met (${e.career.level} >= ${a})`), n >= 2) {
    const t2 = fd(n, e);
    if (console.log(`
\u{1F4CB} Checking Promotion Requirements for Level ${n}:`), t2) {
      if (console.log(`   \u2022 Required Productivity: ${t2.minProductivity}%`), console.log(`   \u2022 Required Management: Lv.${t2.minManagement || 0}`), t2.minProductivity && e.stats.productivity < t2.minProductivity) {
        const n2 = `Requires ${t2.minProductivity}% productivity (currently ${Math.round(e.stats.productivity)}%)`;
        return console.log(`
\u274C FAILED: ${n2}`), console.log(`   Need ${t2.minProductivity - Math.round(e.stats.productivity)}% more productivity`), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"), { canFill: false, reason: n2 };
      }
      if (console.log(`   \u2713 Productivity requirement met (${Math.round(e.stats.productivity)}% >= ${t2.minProductivity}%)`), t2.minManagement) {
        const n2 = e.skills?.management?.level || 0;
        if (n2 < t2.minManagement) {
          const e2 = `Requires Management Lv.${t2.minManagement} (currently Lv.${n2})`;
          return console.log(`
\u274C FAILED: ${e2}`), console.log(`   Need ${t2.minManagement - n2} more management level(s)`), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"), { canFill: false, reason: e2 };
        }
        console.log(`   \u2713 Management requirement met (Lv.${n2} >= Lv.${t2.minManagement})`);
      }
    }
  }
  return console.log("\n\u2705 SUCCESS: All requirements met!"), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"), { canFill: true, reason: "Meets all requirements" };
}
function Gd(e, t) {
  if (!e || !t) return 0;
  if ("secretary" === t.positionId) return 1e3;
  const n = Math.floor(t.level), a = gameState.corporatePyramid.promotionCosts[n] || 1e3, o = Fd(e.id);
  return o && t.level <= o.level ? Math.floor(0.3 * a) : a;
}
function Hd(e, t, n = true) {
  console.log("\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557"), console.log("\u2551  ASSIGNMENT ATTEMPT                    \u2551"), console.log("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D");
  const a = gameState.employees.find((t2) => t2.id === e);
  if (!a) return console.log(`\u274C Employee not found: ${e}`), { success: false, message: "Employee not found", cost: 0 };
  const o = Bd(t);
  if (!o) return console.log(`\u274C Position not found: ${t}`), { success: false, message: "Position not found", cost: 0 };
  if (console.log(`\u{1F464} Employee: ${a.name}`), console.log(`\u{1F4CD} Target Position: ${o.title} (Level ${o.level})`), o.isPlayer) return console.log("\u274C Cannot assign employee to CEO position (player-only)"), { success: false, message: "Cannot assign employee to CEO position", cost: 0 };
  const i = Fd(a.id);
  if (i && i.positionId === t) return console.log(`\u274C Employee is already in this position: ${o.title}`), { success: false, message: `${a.name} is already in this position!`, cost: 0 };
  console.log("\n\u{1F50D} Running eligibility check...");
  const s = zd(a, o);
  if (!s.canFill) return console.log(`\u274C ASSIGNMENT BLOCKED: ${s.reason}`), { success: false, message: s.reason, cost: 0 };
  console.log("\u2705 Eligibility check passed!");
  const r = Gd(a, o);
  if (console.log(`\u{1F4B0} Assignment cost: $${wu(r)}`), console.log(`\u{1F4B5} Current cash: $${wu(gameState.cash)}`), n && gameState.cash < r) return console.log(`\u274C ASSIGNMENT BLOCKED: Insufficient funds (need $${wu(r - gameState.cash)} more)`), { success: false, message: `Not enough cash! Need $${wu(r)}`, cost: r };
  if (i) {
    if (console.log(`
\u{1F4E4} Removing from current position: ${i.title}`), i.employeeId = null, i.isVacant = true, i.productId) {
      const t2 = gameState.products.find((e2) => e2.id === i.productId);
      t2 && t2.managerHired && t2.managerId === e && (t2.managerHired = false, t2.managerId = null, console.log(`   \u26A0\uFE0F Product "${t2.name}" now vacant - automation disabled`));
    }
  } else console.log("\n\u{1F4E5} First-time assignment (employee not currently in any position)");
  if (console.log(`
\u{1F4E5} Assigning to new position: ${o.title}`), o.employeeId = e, o.isVacant = false, o.productId) {
    const t2 = gameState.products.find((e2) => e2.id === o.productId);
    t2 && (a.productManaged = t2.name, t2.managerHired = true, t2.managerId = e, console.log(`   \u2713 Now managing product: ${t2.name}`));
  } else a.productManaged = null, console.log("   \u2713 Management position (no specific product)");
  n && (gameState.cash -= r, console.log(`   \u{1F4B8} Deducted $${wu(r)} from cash`), console.log(`   \u{1F4B5} Remaining cash: $${wu(gameState.cash)}`));
  const l = a.career.level, c = a.career.title;
  if ("secretary" === o.positionId || "Executive Secretary" === o.title) a.career.level = 6, a.career.title = "Executive Secretary", a.career.salary = 5e5, console.log("   \u{1F3AF} Special: Secretary position (Level 6 equivalent)");
  else {
    const e2 = Math.floor(o.level);
    if (a.career.level !== e2) {
      const t2 = gameState.hierarchyLevels[e2] || gameState.hierarchyLevels[1] || { title: "Staff", color: "var(--n)", icon: "\u{1F464}", baseSalary: 1e5 };
      if (t2) {
        const n2 = a.career.level < e2, o2 = a.career.level > e2;
        a.career.level = e2, a.career.title = t2.title, a.career.salary = t2.baseSalary, n2 ? console.log(`   \u{1F4C8} Promoted: ${c} (Lv.${l}) \u2192 ${t2.title} (Lv.${e2})`) : o2 && console.log(`   \u{1F4C9} Demoted: ${c} (Lv.${l}) \u2192 ${t2.title} (Lv.${e2})`);
      }
    } else console.log(`   \u27A1\uFE0F  Lateral move (Level ${a.career.level} stays same)`);
  }
  if (console.log("\n\u2705 ASSIGNMENT SUCCESSFUL!"), console.log("\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557"), console.log(`\u2551  ${a.name} \u2192 ${o.title}`), console.log("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n"), void 0 !== StoryEngine && StoryEngine.trackAction) {
    const e2 = Math.floor(o.level);
    l < e2 ? StoryEngine.trackAction("promoted_employee", { employeeId: a.id, employeeName: a.name, fromLevel: l, toLevel: e2, newTitle: o.title }) : l > e2 && StoryEngine.trackAction("demoted_employee", { employeeId: a.id, employeeName: a.name, fromLevel: l, toLevel: e2, newTitle: o.title });
  }
  return { success: true, message: i ? "Employee relocated successfully!" : "Employee assigned successfully!", cost: r, needsRehire: !(!i || !i.productId), vacatedPosition: i || null };
}
function Ud(e) {
  const t = Fd(e);
  if (!t) return false;
  t.employeeId = null, t.isVacant = true;
  const n = gameState.employees.find((t2) => t2.id === e);
  return n && (n.productManaged = null), true;
}
function openCorporatePyramidModal(e = null) {
  try {
    const t = document.getElementById("pyramidModal");
    if (!t) return void console.error("Pyramid modal element not found!");
    gameState.employees || (gameState.employees = []), gameState.corporateHierarchy || (gameState.corporateHierarchy = { levels: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }, executiveRoles: { COO: null, CFO: null } }), gameState.hierarchyLevels || (gameState.hierarchyLevels = [{ level: 1, capacity: 1, unlockCost: 0 }, { level: 2, capacity: 2, unlockCost: 5e4 }, { level: 3, capacity: 3, unlockCost: 2e5 }, { level: 4, capacity: 4, unlockCost: 8e5 }, { level: 5, capacity: 5, unlockCost: 32e5 }, { level: 6, capacity: 6, unlockCost: 128e5 }, { level: 7, capacity: 7, unlockCost: 512e5 }]), gameState.corporatePyramid || (gameState.corporatePyramid = { ceo: { positionId: "ceo", title: "CEO", level: 7, employeeId: "player", subordinates: [], isPlayer: true } }), "object" == typeof gameState.corporatePyramid.positions && gameState.corporatePyramid.promotionCosts || "function" == typeof Od && Od();
    const view = localStorage.getItem("fuoc_ladder_view") || "list";
    t.innerHTML = ` <div class="modal-box ladder-modal"> <div class="card-h"> <div style="display:flex; align-items:baseline; gap:var(--s2); min-width:0;"> <span class="t">\u{1F3E2} CORPORATE LADDER</span> <span class="text-dim fs-xs">${e ? "Select a position to assign" : "Manage your organization"}</span> </div> <button class="modal-close" onclick="closeCorporatePyramidModal()">\u2715</button> </div> <div class="ladder-legend"> <span><span class="dot" style="background:var(--g)"></span>Filled</span> <span><span class="dot" style="background:var(--r)"></span>Vacant</span> <span><span class="dot" style="background:var(--d)"></span>Selected</span> <span class="flex-1"></span> <div class="seg" id="ladderViewToggle"> <button data-view="list">\u2261 List</button> <button data-view="spatial">\u229E Spatial</button> </div> </div> <div class="ladder-modal-body" id="ladderBody"></div> ${e ? Jd(e) : ""} </div> `, t.style.display = "flex", Xd(view, e);
    const tg = document.getElementById("ladderViewToggle");
    tg && tg.querySelectorAll("button").forEach((b) => {
      b.onclick = () => {
        localStorage.setItem("fuoc_ladder_view", b.dataset.view), Xd(b.dataset.view, e);
      };
    });
  } catch (e2) {
    console.error("Error opening Corporate Pyramid Modal:", e2), showNotification(`Failed to open Corporate Ladder: ${e2 && e2.message || e2}`, "error");
  }
}
function Yd(e) {
  let t = "";
  const n = e ? gameState.employees.find((t2) => t2.id === e) : null;
  return t += ` <div style="text-align:center; margin-bottom:40px;"> <div style="display:inline-flex; align-items:center; justify-content:center; gap:20px;"> <!-- CEO Position --> <div style="display:inline-block; position:relative;"> <div class="pyramid-position ceo-position" data-position-id="ceo" style="background:linear-gradient(135deg, var(--z), #ffed4e); padding:24px 50px; border-radius:12px; box-shadow:0 6px 20px rgba(255,215,0,0.5); border:3px solid var(--m);"> <div style="font-size:2.5rem; margin-bottom:8px;">\u{1F451}</div> <div style="font-weight:700; font-size:1.3rem; color:var(--q);">CEO</div> <div style="font-size:0.9rem; color:var(--q); margin-top:4px;">You</div> </div> </div> <!-- Secretary Position --> <div style="display:inline-block; position:relative; transform:scale(0.85);"> ${Kd(gameState.corporatePyramid.secretaryPosition || { positionId: "secretary", title: "Executive Secretary", level: 6.5, employeeId: null, reportsTo: "ceo", subordinates: [] }, n)} </div> </div> </div> `, t += Wd(6, "Senior Executive", n), t += Wd(5, "Officers (CFO, COO)", n), t += Wd(4, "Branch Managers", n), t += Wd(3, "Regional Managers", n), t += Wd(2, "Local Managers", n), t += Wd(1, "Staff", n), t;
}
function Wd(e, t, n) {
  const a = gameState.corporatePyramid.positions[e];
  if (!a || 0 === a.length) return "";
  const o = gameState.hierarchyLevels[e] || gameState.hierarchyLevels[1] || { title: "Staff", color: "var(--n)", icon: "\u{1F464}", baseSalary: 1e5 };
  let i = ` <div style="margin-bottom:50px;"> <h3 style="color:${o.color}; margin-bottom:20px; text-align:center; font-size:1.2rem; display:flex; align-items:center; justify-content:center; gap:10px;"> <span style="font-size:1.5rem;">${o.icon}</span> Level ${e}: ${t} <span style="background:var(--ba); padding:4px 12px; border-radius:12px; font-size:0.8rem; color:var(--a);"> ${a.filter((e2) => e2.employeeId).length} / ${a.length} filled </span> </h3> <div style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center; max-width:1200px; margin:0 auto;"> `;
  return a.forEach((e2) => {
    i += Vd(e2, n, o);
  }), i += " </div> </div> ", i;
}
function Vd(e, t, n) {
  const a = e.employeeId ? gameState.employees.find((t2) => t2.id === e.employeeId) : null, o = !a;
  let i = false, s = "";
  if (t) {
    const n2 = zd(t, e);
    i = n2.canFill, s = n2.reason;
  }
  const color = i ? "var(--m)" : o ? "var(--r)" : n.color || "var(--g)", bg = i ? "var(--cz)" : o ? "var(--f)" : "var(--h)", c = qd(e.positionId).length;
  return ` <div class="pyramid-position" data-position-id="${e.positionId}"
           data-can-select="${i}"
           data-cost="${t && gameState.corporatePyramid.promotionCosts[e.level] || 0}"
           style="--cr:${color}; background:${bg}; border:2px solid var(--cr); border-radius:var(--r3); padding:16px; width:220px; cursor:pointer; transition:all 0.3s ease; box-shadow:var(--bx);" onmouseenter="this.style.transform='scale(1.05)';" onmouseleave="this.style.transform='scale(1)';"> <div style="text-align:center; margin-bottom:12px;"> <div style="font-size:1.5rem; margin-bottom:4px;">${n.icon}</div> <div style="font-weight:600; font-size:0.85rem; color:var(--y);">${e.title}</div> ${e.locationId ? `<div class="text-mute" style="font-size:0.7rem; margin-top:2px;">${gameState.locations.find((t2) => t2.id === e.locationId)?.name || ""}</div>` : ""} </div> ${a ? ` <div style="text-align:center; position:relative;"> ${vd(a) ? ' <div class="pill pill--fg" style="position:absolute; top:-4px; right:calc(50% - 46px); font-size:0.65rem; z-index:1; animation:pulse 2s infinite;"> \u2B06\uFE0F READY </div> ' : ""} <img src="${a.profileImage || "https://placehold.co/60x60"}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--cr); margin-bottom:8px;"> <div style="font-size:0.85rem; font-weight:600; color:var(--y);">${a.name}</div> <div class="text-dim" style="font-size:0.7rem; margin-top:2px;">${n.title}</div> ${c > 0 ? `<div class="text-pos" style="font-size:0.65rem; margin-top:4px;">\u{1F465} <span class="num">${c}</span> report${1 !== c ? "s" : ""}</div>` : ""} </div> ` : ` <div style="text-align:center; padding:20px 0;"> <div style="font-size:2rem; opacity:0.3;">\u{1F464}</div> <div class="text-mute" style="font-size:0.75rem; margin-top:8px;">Vacant</div> ${e.span ? `<div class="text-mute" style="font-size:0.65rem; margin-top:4px;">Manages ${e.span}</div>` : ""} </div> `}
        
        ${i ? ` <div style="margin-top:12px; padding:8px; background:var(--cz); border-radius:var(--r2); text-align:center;"> <div style="font-size:0.7rem; color:var(--m); font-weight:600;">\u2713 CAN ASSIGN</div> <div style="font-size:0.7rem; color:var(--y); margin-top:2px;">Cost: $<span class="num">${wu(gameState.corporatePyramid.promotionCosts[e.level] || 0)}</span></div> </div> ` : t ? ` <div style="margin-top:12px; padding:8px; background:var(--cn); border-radius:var(--r2); text-align:center;"> <div style="font-size:0.65rem; color:var(--k);">${s}</div> </div> ` : ""} </div> `;
}
function Kd(e, t) {
  const n = e.employeeId ? gameState.employees.find((t2) => t2.id === e.employeeId) : null, a = !n;
  let o = false, i = "";
  t && (t.career.level >= 1 && t.career.level <= 3 ? o = true : t.career.level > 3 && (i = "Too senior for this role"));
  const s = o ? "var(--cz)" : a ? "var(--f)" : "var(--h)", r = o ? "var(--m)" : a ? "var(--r)" : "var(--d)";
  return ` <div class="pyramid-position secretary-position" data-position-id="${e.positionId}"
           data-can-select="${o}"
           data-cost="${t ? 1e3 : 0}"
           style="--cr:${r}; background:${s}; border:2px solid var(--cr); border-radius:var(--r3); padding:14px; width:180px; cursor:pointer; transition:all 0.3s ease; box-shadow:var(--bx);" onmouseenter="this.style.transform='scale(1.05)';" onmouseleave="this.style.transform='scale(1)';"> <div style="text-align:center; margin-bottom:10px;"> <div style="font-size:1.3rem; margin-bottom:4px;">\u{1F4CB}</div> <div style="font-weight:600; font-size:0.8rem; color:var(--y);">${e.title}</div> <div class="text-mute" style="font-size:0.65rem; margin-top:2px;">Reports to CEO</div> </div> ${n ? ` <div style="text-align:center; position:relative;"> <img src="${n.profileImage || "https://placehold.co/50x50"}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--cr); margin-bottom:6px;"> <div style="font-size:0.8rem; font-weight:600; color:var(--y);">${n.name}</div> <div class="text-dim" style="font-size:0.65rem; margin-top:2px;">Level <span class="num">${n.career?.level || 1}</span></div> </div> ` : ' <div style="text-align:center; padding:15px 0;"> <div style="font-size:1.5rem; opacity:0.3;">\u{1F464}</div> <div class="text-mute" style="font-size:0.7rem; margin-top:6px;">Vacant</div> <div class="text-mute" style="font-size:0.6rem; margin-top:2px;">Early-game position</div> </div> '}
        
        ${o ? ` <div style="margin-top:10px; padding:6px; background:var(--cz); border-radius:var(--r2); text-align:center;"> <div style="font-size:0.65rem; color:var(--m); font-weight:600;">\u2713 CAN ASSIGN</div> <div style="font-size:0.65rem; color:var(--y); margin-top:2px;">Cost: $<span class="num">${wu(1e3)}</span></div> </div> ` : t ? ` <div style="margin-top:10px; padding:6px; background:var(--cn); border-radius:var(--r2); text-align:center;"> <div style="font-size:0.6rem; color:var(--k);">${i}</div> </div> ` : ""} </div> `;
}
function Jd(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  if (!t) return "";
  const n = gameState.hierarchyLevels[t.career?.level] || gameState.hierarchyLevels[1] || { title: "Staff", color: "var(--n)" };
  return ` <div class="ladder-foot"> <div class="who"> <img src="${t.profileImage || "https://placehold.co/50x50"}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid ${n.color}; flex:0 0 auto;"> <div style="min-width:0;"> <div class="nm" style="color:var(--y); font-weight:600;">${t.name}</div> <div class="text-dim fs-xs">${n.title} \u2022 Level <span class="num">${t.career?.level || 1}</span></div> </div> </div> <button class="btn btn--k" onclick="closeCorporatePyramidModal()">Cancel</button> </div> `;
}
function Qd(e) {
  const sel = e ? gameState.employees.find((x) => x.id === e) : null, u2 = gameState.corporatePyramid, H = gameState.hierarchyLevels || {}, G2 = (id) => id && gameState.locations.find((l) => l.id === id)?.name || "", chip = (pos, color) => {
    const U2 = "player" === pos.employeeId, J2 = "ceo" === pos.positionId, ee2 = "secretary" === pos.positionId, emp2 = pos.employeeId && !U2 ? gameState.employees.find((x) => x.id === pos.employeeId) : null;
    let te2 = false, reason = "", cost = 0;
    if (sel && !J2) if (ee2) {
      const u3 = sel.career?.level || 1;
      u3 >= 1 && u3 <= 3 ? te2 = true : u3 > 3 && (reason = "Too senior for this role"), cost = 1e3;
    } else {
      const r = zd(sel, pos);
      te2 = r.canFill, reason = r.reason, cost = u2.promotionCosts[pos.level] || 0;
    }
    const reports = qd(pos.positionId).length, ready = emp2 && vd(emp2);
    let ne2, nm, meta;
    U2 ? (ne2 = `<span class="avatar-sm init" style="--cr:${color}">\u{1F451}</span>`, nm = "You", meta = "CEO") : emp2 ? (ne2 = emp2.profileImage ? `<img class="avatar-sm" src="${emp2.profileImage}">` : `<span class="avatar-sm init" style="--cr:${color}">${(emp2.name || "?").charAt(0).toUpperCase()}</span>`, nm = yl(emp2), meta = pos.title + (pos.locationId ? " \xB7 " + G2(pos.locationId) : "")) : (ne2 = `<span class="avatar-sm init" style="--cr:${color}">\u{1F464}</span>`, nm = '<span style="color:var(--e)">Vacant</span>', meta = pos.title + (pos.locationId ? " \xB7 " + G2(pos.locationId) : ""));
    let right = "";
    return sel && te2 ? right = `<span class="pill pill--hn">\uFF0B Assign</span><span class="num text-dim fs-xs">$${wu(cost)}</span>` : sel && !J2 && reason ? right = `<span class="meta">${reason}</span>` : (ready && (right += '<span class="pill pill--fg">\u2B06 READY</span>'), reports > 0 && (right += `<span class="num text-dim fs-xs">\u{1F465} ${reports}</span>`)), `<div class="ladder-pos pyramid-position${te2 ? " is-selected" : ""}" data-position-id="${pos.positionId}" data-can-select="${te2}" data-cost="${cost}" style="--cr:${color}">
            ${ne2} <div style="min-width:0;flex:1"><div class="nm">${nm}</div><div class="meta">${meta}</div></div> <div style="display:flex;align-items:center;gap:var(--s2);flex:0 0 auto">${right}</div> </div>`;
  };
  let html = '<div id="pyramidCanvas"><div class="ladder-list">';
  const ceo = u2.ceo || { positionId: "ceo", title: "CEO", level: 7, employeeId: "player" };
  html += '<div class="ladder-positions">' + chip(ceo, "var(--m)") + "</div>", u2.secretaryPosition && (html += '<div class="ladder-positions">' + chip(u2.secretaryPosition, "var(--d)") + "</div>");
  for (let lvl = 6; lvl >= 1; lvl--) {
    const positions = u2.positions && u2.positions[lvl] || [];
    if (0 === positions.length) continue;
    const info = H[lvl] || { title: "Level " + lvl, color: "var(--r)", icon: "\u{1F464}" }, filled = positions.filter((p) => p.employeeId).length;
    html += `<div><div class="ladder-band" style="--cr:${info.color}"><span>${info.icon || ""}</span><span>L${lvl} \xB7 ${info.title}</span><span class="num">${filled} / ${positions.length} filled</span></div><div class="ladder-positions">${positions.map((p) => chip(p, info.color)).join("")}</div></div>`;
  }
  return html + "</div></div>";
}
function Xd(view, u2) {
  const body = document.getElementById("ladderBody");
  if (!body) return;
  if ("spatial" === view) try {
    if (!gameState.corporatePyramid?.positions) throw new Error("corporatePyramid not initialized");
    body.innerHTML = `<div class="row" style="justify-content:center; gap:var(--s2); margin-bottom:var(--s2);"><button class="btn btn--aj" onclick="pyramidZoom('in')">\u{1F50D}+</button><button class="btn btn--aj" onclick="pyramidZoom('out')">\u{1F50D}-</button><button class="btn btn--aj" onclick="pyramidZoom('reset')">Reset</button></div><div id="pyramidContainer" style="position:relative; overflow:auto; background:var(--i); border-radius:var(--r2); cursor:grab; height:60vh;"><div id="pyramidCanvas" style="transform-origin:top left; transition:transform 0.3s ease; padding:40px; min-width:100%; min-height:100%;">${Yd(u2)}</div></div>`, Zd(), lu(), eu(), nu(u2);
  } catch (G2) {
    console.error("[Ladder] Spatial view failed \u2014 falling back to list view:", G2), view = "list", body.innerHTML = Qd(u2), nu(u2);
  }
  else body.innerHTML = Qd(u2), nu(u2);
  const tg = document.getElementById("ladderViewToggle");
  tg && tg.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.view === view));
}
function Zd() {
  const e = document.getElementById("pyramidContainer");
  if (!e) return;
  let t = false, n = 0, a = 0, o = 0, i = 0;
  e.addEventListener("mousedown", (s2) => {
    s2.target.closest(".pyramid-position") || s2.target.draggable || (t = true, e.style.cursor = "grabbing", n = s2.pageX - e.offsetLeft, a = s2.pageY - e.offsetTop, o = e.scrollLeft, i = e.scrollTop);
  }), e.addEventListener("mouseleave", () => {
    t = false, e.style.cursor = "grab";
  }), e.addEventListener("mouseup", () => {
    t = false, e.style.cursor = "grab";
  }), e.addEventListener("mousemove", (s2) => {
    if (!t) return;
    s2.preventDefault();
    const r2 = s2.pageX - e.offsetLeft, l2 = s2.pageY - e.offsetTop, c2 = 1.5 * (r2 - n), d = 1.5 * (l2 - a);
    e.scrollLeft = o - c2, e.scrollTop = i - d;
  });
  let s = 0, r = 0, l = 0, c = 0;
  e.addEventListener("touchstart", (t2) => {
    t2.target.closest(".pyramid-position") || (s = t2.touches[0].pageX, r = t2.touches[0].pageY, l = e.scrollLeft, c = e.scrollTop);
  }, { passive: true }), e.addEventListener("touchmove", (t2) => {
    if (t2.target.closest(".pyramid-position")) return;
    const n2 = t2.touches[0].pageX, a2 = t2.touches[0].pageY, o2 = 1.5 * (s - n2), i2 = 1.5 * (r - a2);
    e.scrollLeft = l + o2, e.scrollTop = c + i2;
  }, { passive: true });
}
function eu() {
  document.querySelectorAll(".pyramid-position[data-position-id]").forEach((e) => {
    const t = e.dataset.positionId;
    if ("ceo" === t) return;
    const n = Bd(t);
    n && n.employeeId && (e.draggable = true, e.style.cursor = "pointer", e.addEventListener("dragstart", (a) => {
      a.dataTransfer.effectAllowed = "move", a.dataTransfer.setData("employeeId", n.employeeId), a.dataTransfer.setData("sourcePositionId", t), e.style.opacity = "0.5";
    }), e.addEventListener("dragend", (t2) => {
      e.style.opacity = "1";
    })), e.addEventListener("dragover", (n2) => {
      "ceo" !== t && (n2.preventDefault(), n2.dataTransfer.dropEffect = "move", e.style.transform = "scale(1.05)", e.style.boxShadow = "0 6px 20px rgba(255,215,0,0.5)");
    }), e.addEventListener("dragleave", (t2) => {
      e.style.transform = "", e.style.boxShadow = "";
    }), e.addEventListener("drop", (n2) => {
      if (n2.preventDefault(), e.style.transform = "", e.style.boxShadow = "", "ceo" === t) return;
      const a = n2.dataTransfer.getData("employeeId"), o = n2.dataTransfer.getData("sourcePositionId");
      a && t !== o && tu(a, t);
    });
  });
}
async function tu(e, t) {
  const n = gameState.employees.find((t2) => t2.id === e), a = Bd(t);
  if (!n || !a) return;
  const o = zd(n, a);
  if (!o.canFill) return void showNotification(o.reason, "error");
  const i = Gd(n, a), s = `Move ${n.name} to ${a.title}?

Cost: $${wu(i)}`;
  if (await Ev(s, "Confirm Relocation", { type: "info", confirmText: "Move" })) {
    const n2 = Hd(e, t, true);
    n2.success ? (showNotification(n2.message, "success"), closeCorporatePyramidModal(), setTimeout(() => openCorporatePyramidModal(), 100)) : showNotification(n2.message, "error");
  }
}
function nu(e) {
  const t = document.getElementById("pyramidCanvas");
  if (!t) return void console.error("[Pyramid] pyramidCanvas container not found");
  const n = t._positionClickHandler;
  n && t.removeEventListener("click", n);
  const a = (t2) => {
    const n2 = t2.target.closest(".pyramid-position");
    if (!n2) return;
    const a2 = n2.dataset.positionId;
    if (console.log(`[Pyramid] Clicked position: ${a2}`), "ceo" !== a2) if (e) if (console.log(`[Pyramid] Assignment mode - selectedEmployee: ${e}`), "true" === n2.dataset.canSelect) {
      const t3 = parseInt(n2.dataset.cost);
      ou(e, a2, t3);
    } else showNotification("Employee does not meet position requirements", "error");
    else console.log(`[Pyramid] Opening details modal for: ${a2}`), au(a2);
    else console.log("[Pyramid] CEO position clicked - ignoring");
  };
  t._positionClickHandler = a, t.addEventListener("click", a), console.log("[Pyramid] Click handler setup complete (event delegation mode)");
}
function ou(e, t, n) {
  const a = gameState.employees.find((t2) => t2.id === e), o = Bd(t);
  if (!a || !o) return;
  const i = Fd(a.id), s = i ? gameState.hierarchyLevels[Math.floor(i.level)] : null;
  let r = gameState.hierarchyLevels[Math.floor(o.level)];
  if (r || (r = { icon: "\u{1F4CB}", color: "var(--u)", title: "Position" }), "secretary" === o.positionId && (r = { icon: "\u{1F4CB}", color: "#e879f9", title: "Executive Secretary" }), gameState.cash < n) return void showNotification(`Not enough cash! Need $${wu(n)}`, "error");
  const l = document.createElement("div");
  l.id = "promotionConfirmModal", l.style.cssText = "position:fixed !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; background:var(--bn) !important; display:flex !important; align-items:center !important; justify-content:center !important; z-index:10000010 !important; animation:fadeIn 0.2s ease;";
  const c = i && o.level > i.level, d = c ? "Promote" : i ? "Transfer" : "Assign", p = c ? "var(--n)" : "var(--u)";
  l.innerHTML = ` <style> @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } } </style> <div style="background:var(--i); border-radius:16px; box-shadow:0 20px 60px var(--ax); max-width:700px; width:90%; overflow:hidden; animation:slideUp 0.3s ease;"> <!-- Header --> <div style="padding:24px; background:linear-gradient(135deg, ${p}, ${fuocAlpha(p, "22")}); border-bottom:2px solid ${p};"> <h2 style="margin:0; color:var(--b); font-size:1.8rem; text-align:center; display:flex; align-items:center; justify-content:center; gap:12px;"> ${c ? "\u2B06\uFE0F" : "\u2194\uFE0F"} <span>Confirm ${d}</span> </h2> </div> <!-- Content --> <div style="padding:32px 24px;"> <!-- Employee Card --> <div style="text-align:center; margin-bottom:24px;"> <img src="${a.profileImage || "https://placehold.co/80x80"}" style="width:80px; height:80px; border-radius:50%; border:3px solid ${p}; object-fit:cover; box-shadow:0 4px 12px var(--am);"> <h3 style="color:var(--b); margin:12px 0 4px 0; font-size:1.3rem;">${a.name}</h3> ${a.career ? `<div style="color:var(--e); font-size:0.9rem;">Currently: ${a.career.title || "Employee"} (Level ${a.career.level || 1})</div>` : ""} </div> <!-- Position Cards with Arrow --> <div style="display:flex; align-items:center; justify-content:center; gap:16px; margin:24px 0;"> <!-- Old Position (if exists) --> ${i ? ` <div style="flex:1; background:var(--h); border:2px solid ${s?.color || "var(--af)"}; border-radius:12px; padding:16px; text-align:center;"> <div style="font-size:1.5rem; margin-bottom:8px;">${s?.icon || "\u{1F4CB}"}</div> <div style="color:var(--b); font-weight:600; font-size:0.9rem; margin-bottom:4px;">${i.title}</div> <div style="color:var(--e); font-size:0.75rem;">Level ${Math.floor(i.level)}</div> </div> ` : ' <div style="flex:1; background:var(--h); border:2px dashed var(--af); border-radius:12px; padding:16px; text-align:center; opacity:0.5;"> <div style="font-size:1.5rem; margin-bottom:8px;">\u274C</div> <div style="color:var(--e); font-weight:600; font-size:0.9rem;">Unassigned</div> </div> '} <!-- Arrow --> <div style="font-size:2rem; color:${p}; animation:pulse 2s infinite;">
              ${c ? "\u2B06\uFE0F" : "\u27A1\uFE0F"} </div> <!-- New Position --> <div style="flex:1; background:linear-gradient(135deg, ${fuocAlpha(r.color, "22")}, ${fuocAlpha(r.color, "11")}); border:2px solid ${r.color}; border-radius:12px; padding:16px; text-align:center; box-shadow:0 0 20px ${fuocAlpha(r.color, "44")};"> <div style="font-size:1.5rem; margin-bottom:8px;">${r.icon}</div> <div style="color:var(--b); font-weight:600; font-size:0.9rem; margin-bottom:4px;">${o.title}</div> <div style="color:${r.color}; font-size:0.75rem; font-weight:600;">Level ${Math.floor(o.level)}</div> </div> </div> <!-- Cost Info --> <div style="background:var(--ad); border:2px solid ${gameState.cash >= n ? p : "var(--l)"}; border-radius:10px; padding:16px; margin:24px 0;"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"> <span style="color:var(--e); font-size:0.9rem;">Cost:</span> <span style="color:${gameState.cash >= n ? "var(--n)" : "var(--l)"}; font-weight:700; font-size:1.2rem;">$${wu(n)}</span> </div> <div style="display:flex; justify-content:space-between; align-items:center;"> <span style="color:var(--e); font-size:0.9rem;">Your Cash:</span> <span style="color:var(--b); font-weight:600; font-size:1rem;">$${wu(gameState.cash)}</span> </div> ${gameState.cash >= n ? ` <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:8px; border-top:1px solid var(--o);"> <span style="color:var(--e); font-size:0.9rem;">After ${d}:</span> <span style="color:var(--g); font-weight:600; font-size:1rem;">$${wu(gameState.cash - n)}</span> </div> ` : ""} </div> ${gameState.cash < n ? ' <div style="background:rgba(233,69,96,0.1); border:1px solid var(--k); border-radius:8px; padding:12px; margin-bottom:16px; text-align:center;"> <span style="color:var(--k); font-size:0.9rem; font-weight:600;">\u26A0\uFE0F Insufficient funds!</span> </div> ' : ""} <!-- Action Buttons --> <div style="display:flex; gap:12px; margin-top:24px;"> <button onclick="document.getElementById('promotionConfirmModal').remove()" style="flex:1; padding:14px; background:var(--h); border:2px solid var(--r); border-radius:10px; color:var(--b); font-weight:600; font-size:1rem; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='var(--w)'; this.style.borderColor='var(--er)'" onmouseleave="this.style.background='var(--w)'; this.style.borderColor='var(--af)'"> \u2715 Cancel </button> <button onclick="executePromotion('${e}', '${t}')" 
              style="flex:1; padding:14px; background:${gameState.cash >= n ? `linear-gradient(135deg, ${p}, ${fuocAlpha(p, "dd")})` : "var(--af)"}; border:none; border-radius:10px; color:${gameState.cash >= n ? "var(--bj)" : "var(--eg)"}; font-weight:700; font-size:1rem; cursor:${gameState.cash >= n ? "pointer" : "not-allowed"}; transition:all 0.2s; box-shadow:${gameState.cash >= n ? `0 4px 12px ${fuocAlpha(p, "44")}` : "none"};"
              ${gameState.cash >= n ? `onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px ${fuocAlpha(p, "66")}'" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px ${fuocAlpha(p, "44")}'"` : "disabled"}
            >
              \u2713 Confirm ${d} </button> </div> </div> </div> `, document.body.appendChild(l), l.addEventListener("click", (e2) => {
    e2.target === l && l.remove();
  });
}
function executePromotion(e, t) {
  const n = document.getElementById("promotionConfirmModal");
  n && n.remove();
  const a = Hd(e, t, true);
  if (a.success) {
    if (showNotification(a.message, "success"), a.needsRehire && a.vacatedPosition) {
      const e2 = gameState.products.find((e3) => e3.id === a.vacatedPosition.productId);
      e2 && setTimeout(() => {
        showNotification(`\u26A0\uFE0F ${a.vacatedPosition.title} is now vacant! Hire a new staff member to restore automation for ${e2.name}`, "warning", 5e3);
      }, 1500);
    }
    document.querySelectorAll(".position-details-modal").forEach((m) => m.remove());
    const pm = document.getElementById("pyramidModal");
    pm && "none" !== pm.style.display && Xd(localStorage.getItem("fuoc_ladder_view") || "list", null), updatePeopleTab(), updateProductsList(), updateBusinessTab();
  } else showNotification(a.message, "error");
}
function au(e) {
  const t = Bd(e);
  if (!t) return;
  const n = t.employeeId ? gameState.employees.find((e2) => e2.id === t.employeeId) : null, a = Math.floor(t.level), o = gameState.hierarchyLevels[a] || { icon: "\u{1F4CB}", color: "var(--u)", title: "Position" }, i = "secretary" === t.positionId, s = i ? "\u{1F4CB}" : o.icon, r = i ? "#e879f9" : o.color, l = document.createElement("div");
  l.id = `positionDetailsModal_${e}`, l.className = "position-details-modal", l.style.cssText = "position:fixed !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; background:var(--ax) !important; display:flex !important; align-items:center !important; justify-content:center !important; z-index:10000010 !important;", l.innerHTML = ` <div style="background:var(--i); width:90%; max-width:500px; border-radius:12px; box-shadow:0 8px 32px var(--ab); overflow:hidden;"> <div style="padding:20px; border-bottom:2px solid var(--ba); background:linear-gradient(135deg, var(--ds) 0%, var(--ae) 100%);"> <h3 style="margin:0; color:var(--b); font-size:1.5rem; display:flex; align-items:center; gap:10px;"> <span>${s}</span> ${t.title} </h3> <p style="margin:4px 0 0 0; color:var(--e); font-size:0.9rem;">Level ${t.level} Position${i ? " \u2022 Reports to CEO" : ""}</p> </div> <div style="padding:20px;"> ${n ? ` <div style="text-align:center; margin-bottom:20px;"> <img src="${n.profileImage || "https://placehold.co/100x100"}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid ${r}; margin-bottom:12px;"> <div style="font-size:1.2rem; font-weight:600; color:var(--b); margin-bottom:4px;">${n.name}</div> <div style="font-size:0.9rem; color:var(--a);">Current Level: ${n.career?.level || 1}</div> <div style="font-size:0.9rem; color:var(--g); margin-top:8px;">Salary: $${wu(n.career?.salary || n.salary || 0)}/year</div> </div> <div style="margin-bottom:20px;"> <div style="font-size:0.9rem; color:var(--e); margin-bottom:8px;">Skills:</div> <div style="display:flex; gap:8px; flex-wrap:wrap;"> ${n.skills && "object" == typeof n.skills ? Object.entries(n.skills).filter(([e2, t2]) => t2 && t2.level > 0).map(([e2, t2]) => ` <span style="padding:4px 10px; background:var(--h); border-radius:6px; font-size:0.8rem; color:var(--d);"> ${e2.charAt(0).toUpperCase() + e2.slice(1)} Lv${t2.level} </span> `).join("") : '<span style="color:var(--e); font-size:0.8rem;">No skills yet</span>'} </div> </div> ${(() => {
    const e2 = (n.career?.level || 1) + 1, t2 = e2 > 7, a2 = vd(n), o2 = t2 ? null : fd(e2, n);
    if (t2) return ' <div style="margin-bottom:20px; padding:12px; background:linear-gradient(135deg, var(--z) 0%, #ffed4e 100%); border-radius:8px; border:2px solid var(--bm);"> <div style="font-size:0.9rem; font-weight:600; color:var(--q); margin-bottom:4px; display:flex; align-items:center; gap:8px;"> <span style="font-size:1.2rem;">\u{1F451}</span> Maximum Level Reached </div> <div style="font-size:0.75rem; color:var(--q);">This employee has reached the highest career level!</div> </div> ';
    const i2 = gameState.hierarchyLevels[e2] || gameState.hierarchyLevels[e2 - 1] || { title: "Next Level", color: "var(--u)", icon: "\u2B06\uFE0F", baseSalary: 135e3 }, s2 = n.stats?.productivity || 0, r2 = n.skills?.management?.level || 0, l2 = s2 >= (o2?.minProductivity || 0), c2 = !o2?.minManagement || r2 >= o2.minManagement;
    return a2 ? ` <div style="margin-bottom:20px; padding:12px; background:linear-gradient(135deg, var(--n) 0%, #3ba882 100%); border-radius:8px; border:2px solid var(--g);"> <div style="font-size:0.9rem; font-weight:600; color:var(--q); margin-bottom:4px; display:flex; align-items:center; gap:8px;"> <span style="font-size:1.2rem;">\u2B06\uFE0F</span> Ready for Promotion! </div> <div style="font-size:0.75rem; color:var(--q); margin-bottom:8px;"> ${n.name} can be promoted to <strong>${i2.title}</strong> (Level ${e2}) </div> <div style="font-size:0.7rem; color:var(--q);"> \u2713 Productivity: ${s2}% (needs ${o2.minProductivity}%)<br> ${o2.minManagement ? `\u2713 Management: Level ${r2} (needs ${o2.minManagement})` : ""} </div> </div> ` : ` <div style="margin-bottom:20px; padding:12px; background:rgba(233,69,96,0.2); border-radius:8px; border:2px solid var(--k);"> <div style="font-size:0.9rem; font-weight:600; color:var(--k); margin-bottom:4px; display:flex; align-items:center; gap:8px;"> <span style="font-size:1.2rem;">\u{1F4CB}</span> Promotion Requirements </div> <div style="font-size:0.75rem; color:var(--b); margin-bottom:8px;"> For promotion to <strong>${i2.title}</strong> (Level ${e2}): </div> <div style="font-size:0.7rem; color:var(--b);"> ${l2 ? "\u2713" : "\u2717"} Productivity: ${s2}% ${l2 ? '<span style="color:var(--g);">(met!)</span>' : `<span style="color:var(--k);">(needs ${o2.minProductivity}%)</span>`}<br> ${o2.minManagement ? `
                        ${c2 ? "\u2713" : "\u2717"} Management: Level ${r2} ${c2 ? '<span style="color:var(--g);">(met!)</span>' : `<span style="color:var(--k);">(needs ${o2.minManagement})</span>`}
                      ` : ""} </div> </div> `;
  })()} <!-- Action Buttons --> <div style="display:flex; gap:10px; margin-bottom:10px;"> <button id="transferEmployeeBtn" style="flex:1; padding:12px; background:var(--u); border:none; border-radius:8px; color:var(--q); cursor:pointer; font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px;" title="Transfer to another position at the same level"> <span>\u{1F504}</span> Transfer </button> <button id="promoteEmployeeBtn" ${vd(n) ? "" : "disabled"} style="flex:1; padding:12px; background:${vd(n) ? "var(--n)" : "var(--ag)"}; border:none; border-radius:8px; color:${vd(n) ? "var(--ae)" : "var(--as)"}; cursor:${vd(n) ? "pointer" : "not-allowed"}; font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px; opacity:${vd(n) ? "1" : "0.5"};" title="${vd(n) ? "Promote to next level" : "Not eligible for promotion yet"}"> <span>\u2B06\uFE0F</span> Promote </button> </div> <button id="terminateEmployeeBtn" style="width:100%; padding:12px; background:var(--l); border:none; border-radius:8px; color:var(--s); cursor:pointer; font-weight:600; margin-bottom:10px; display:flex; align-items:center; justify-content:center; gap:6px;"> <span>\u{1F6AB}</span> Terminate Employment </button> ` : ' <div style="text-align:center; padding:40px 20px;"> <div style="font-size:3rem; opacity:0.3; margin-bottom:12px;">\u{1F464}</div> <div style="font-size:1.1rem; color:var(--a); margin-bottom:8px;">Position Vacant</div> <div style="font-size:0.85rem; color:var(--e);">Go to People tab and click "Promote" on an employee to assign them here.</div> </div> '} <button id="closeDetailsBtn" style="width:100%; padding:12px; background:var(--f); border:none; border-radius:8px; color:var(--b); cursor:pointer; font-weight:600;"> Close </button> </div> </div> `, document.body.appendChild(l), l.addEventListener("click", (e2) => {
    e2.target === l && l.remove();
  });
  const c = l.querySelector("#closeDetailsBtn");
  if (c && c.addEventListener("click", () => {
    l.remove();
  }), n) {
    const e2 = l.querySelector("#transferEmployeeBtn");
    e2 && e2.addEventListener("click", () => {
      iu(n, t), l.remove();
    });
    const a2 = l.querySelector("#promoteEmployeeBtn");
    a2 && !a2.disabled && a2.addEventListener("click", () => {
      l.remove(), openCorporatePyramidModal(n.id);
    });
    const o2 = l.querySelector("#terminateEmployeeBtn");
    o2 && o2.addEventListener("click", async () => {
      await Ev(`Are you sure you want to terminate ${n.name}?

This will:
\u2022 Remove them from this position
\u2022 Set their status to "alumni"
\u2022 Disable automation if they manage a product`, "Terminate Employee", { type: "danger", confirmText: "Terminate" }) && (handleEmployeeAction(n.id, "fire"), l.remove(), "flex" === document.getElementById("pyramidModal").style.display && openCorporatePyramidModal());
    });
  }
}
function iu(e, t) {
  console.log(`
[TRANSFER] Opening transfer modal for ${e.name} from ${t.title}`);
  const n = document.createElement("div");
  n.id = "transferModal", n.style.cssText = "position:fixed !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; background:var(--ax) !important; display:flex !important; align-items:center !important; justify-content:center !important; z-index:10000010 !important;";
  const a = "secretary" === t.positionId || "Executive Secretary" === t.title, o = Math.floor(t.level), i = [];
  if (a || (gameState.corporatePyramid.positions[o] || []).filter((e2) => e2.positionId !== t.positionId && !e2.employeeId).forEach((e2) => {
    i.push({ ...e2, transferType: "lateral" });
  }), o > 1) {
    const e2 = 1;
    for (let t2 = a ? 3 : o - 1; t2 >= e2; t2--) (gameState.corporatePyramid.positions[t2] || []).filter((e3) => !e3.employeeId).forEach((e3) => {
      i.push({ ...e3, transferType: "demotion", levelDifference: o - t2 });
    });
  }
  console.log(`[TRANSFER] Found ${i.length} total options (lateral + demotion)${a ? " [Executive Secretary: max demotion to Level 3]" : ""}`), n.innerHTML = ` <div style="background:var(--i); width:90%; max-width:700px; border-radius:12px; box-shadow:0 8px 32px var(--ab); overflow:hidden; max-height:85vh; display:flex; flex-direction:column;"> <div style="padding:20px; border-bottom:2px solid var(--ba); background:linear-gradient(135deg, ${a ? "var(--ap) 0%, var(--em) 100%" : "var(--u) 0%, #0088cc 100%"});"> <h3 style="margin:0; color:#${a ? "fff" : "0f1419"}; font-size:1.5rem; display:flex; align-items:center; gap:10px;"> <span>\u{1F504}</span> ${a ? "Demote" : "Transfer or Demote"} ${e.name} </h3> <p style="margin:4px 0 0 0; color:#${a ? "ddd" : "000"}; font-size:0.9rem;">
            Current: ${t.title} (Level ${o})${a ? " \u2022 Special Role" : ""} </p> </div> <div style="flex:1; overflow-y:auto; padding:20px;"> ${i.length > 0 ? `
            ${a ? ' <div style="margin-bottom:16px; padding:12px; background:rgba(155,89,182,0.2); border-left:4px solid var(--ap); border-radius:6px;"> <div style="font-size:0.85rem; color:var(--ap); font-weight:600; margin-bottom:4px;">\u{1F454} Executive Secretary Special Rules</div> <div style="font-size:0.75rem; color:var(--b);"> \u2022 Executive Secretary is a <strong>special high-level role</strong> that can be filled early<br/> \u2022 Not equivalent to other Level 6, 5, or 4 management positions<br/> \u2022 Can only be demoted to <strong>Level 3 (Regional Manager) or below</strong><br/> \u2022 Demotion cost: <strong>50%</strong> of destination hiring cost </div> </div> ' : ' <div style="margin-bottom:16px; padding:12px; background:rgba(255,193,7,0.2); border-left:4px solid var(--ew); border-radius:6px;"> <div style="font-size:0.85rem; color:var(--ew); font-weight:600; margin-bottom:4px;">\u26A0\uFE0F Transfer Cost Policy</div> <div style="font-size:0.75rem; color:var(--b);"> \u2022 <strong>Lateral transfers</strong> (same level): 75% of destination hiring cost<br/> \u2022 <strong>Demotions</strong> (lower level): 50% of destination hiring cost </div> </div> '} <div style="display:flex; flex-direction:column; gap:12px;"> ${i.map((e2) => {
    const t2 = gameState.locations.find((t3) => t3.id === e2.locationId), n2 = e2.productId ? gameState.products.find((t3) => t3.id === e2.productId) : null, a2 = n2 ? n2.managerHireCost || 500 : t2 ? 500 * (gameState.locations.indexOf(t2) + 1) : 500, o2 = "demotion" === e2.transferType ? 0.5 : 0.75, i2 = Math.floor(a2 * o2), s = gameState.cash >= i2, r = gameState.hierarchyLevels[e2.level], l = "demotion" === e2.transferType ? "var(--bs)" : "var(--u)", c = "demotion" === e2.transferType ? "var(--bs)" : "var(--n)";
    return ` <div class="transfer-option" data-position-id="${e2.positionId}" data-cost="${i2}" data-type="${e2.transferType}" style="padding:16px; background:var(--h); border-radius:8px; border:2px solid ${s ? l : "var(--af)"}; cursor:${s ? "pointer" : "not-allowed"}; transition:all 0.3s ease; opacity:${s ? "1" : "0.5"};" onmouseenter="if(${s}) this.style.borderColor='${c}'; this.style.transform='translateX(4px)';" onmouseleave="this.style.borderColor='${s ? l : "var(--af)"}'; this.style.transform='translateX(0)';"> <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;"> <div style="flex:1;"> <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;"> ${"demotion" === e2.transferType ? '<span style="background:var(--bs); color:var(--q); padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:700;">\u2B07 DEMOTION</span>' : '<span style="background:var(--u); color:var(--q); padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:700;">\u2194 LATERAL</span>'} <span style="font-weight:600; color:var(--b); font-size:0.95rem;">${e2.title}</span> </div> <div style="font-size:0.75rem; color:var(--e); margin-left:0px;"> Level ${e2.level}: ${r ? r.title : "Unknown"} </div> ${t2 ? `<div style="font-size:0.75rem; color:var(--e); margin-top:2px;">\u{1F4CD} ${t2.name}</div>` : ""}
                        ${n2 ? `<div style="font-size:0.75rem; color:var(--g); margin-top:2px;">\u{1F4E6} ${n2.name}</div>` : ""}
                        ${"demotion" === e2.transferType ? `<div style="font-size:0.7rem; color:var(--bs); margin-top:4px;">\u26A0\uFE0F Salary will decrease to $${wu(r.baseSalary)}</div>` : ""} </div> <div style="text-align:right;"> <div style="font-size:0.9rem; font-weight:600; color:${s ? c : "var(--l)"};">
                          $${wu(i2)} </div> <div style="font-size:0.65rem; color:var(--e); margin-top:2px;"> (${Math.round(100 * o2)}% of hire cost) </div> </div> </div> ${s ? ` <div style="margin-top:8px; padding:6px; background:rgba(78,204,163,0.2); border-radius:4px; text-align:center;"> <div style="font-size:0.7rem; color:${c};">\u2713 Click to ${"demotion" === e2.transferType ? "demote" : "transfer"}</div> </div> ` : ` <div style="margin-top:8px; padding:6px; background:rgba(233,69,96,0.2); border-radius:4px; text-align:center;"> <div style="font-size:0.7rem; color:var(--k);">Need $${wu(i2 - gameState.cash)} more</div> </div> `} </div> `;
  }).join("")} </div> ` : ` <div style="text-align:center; padding:40px 20px;"> <div style="font-size:3rem; opacity:0.3; margin-bottom:12px;">\u{1F504}</div> <div style="font-size:1.1rem; color:var(--a); margin-bottom:8px;">No ${a ? "Demotion" : "Transfer"} Options Available</div> <div style="font-size:0.85rem; color:var(--e);"> ${a ? "All positions at Level 3 (Regional Manager) and below are currently filled." : "All positions at this level and below are currently filled."} </div> </div> `} </div> <div style="padding:16px; border-top:2px solid var(--ba); background:var(--ae);"> <button id="closeTransferModal" style="width:100%; padding:12px; background:var(--f); border:none; border-radius:8px; color:var(--b); cursor:pointer; font-weight:600;"> Cancel </button> </div> </div> `, document.body.appendChild(n), n.querySelector("#closeTransferModal").addEventListener("click", () => {
    n.remove();
  }), n.querySelectorAll(".transfer-option").forEach((a2) => {
    const o2 = a2.dataset.positionId, i2 = parseInt(a2.dataset.cost), s = a2.dataset.type;
    gameState.cash >= i2 && a2.addEventListener("click", async () => {
      const a3 = Bd(o2);
      if (!a3) return;
      const r = "demotion" === s, l = r ? "Demote" : "Transfer", c = gameState.hierarchyLevels[a3.level];
      let d = `${l} ${e.name} to ${a3.title}?

Cost: $${wu(i2)}
Remaining cash: $${wu(gameState.cash - i2)}`;
      if (r && c && (d += `

\u26A0\uFE0F This is a demotion!
New salary: $${wu(c.baseSalary)}`), await Ev(d, r ? "Confirm Demotion" : "Confirm Transfer", { type: r ? "warning" : "info", confirmText: l })) {
        if (console.log(`[TRANSFER] Executing ${r ? "demotion" : "transfer"} to ${a3.title} for $${wu(i2)}`), a3.employeeId) return void showNotification(`Cannot ${r ? "demote" : "transfer"}: ${a3.title} is now occupied by someone else!`, "error");
        if (t.employeeId = null, t.isVacant = true, t.productId) {
          const n2 = gameState.products.find((e2) => e2.id === t.productId);
          n2 && n2.managerId === e.id && (n2.managerHired = false, n2.managerId = null);
        }
        const s2 = Hd(e.id, o2, false);
        if (s2.success) {
          gameState.cash -= i2;
          const t2 = r ? "demoted" : "transferred";
          showNotification(`${e.name} ${t2} to ${a3.title}! Cost: $${wu(i2)}`, "success"), n.remove(), "flex" === document.getElementById("pyramidModal").style.display && openCorporatePyramidModal(), updatePeopleTab(), "people" === gameState.activeTab && switchTab("people"), saveGame();
        } else showNotification(`${l} failed: ${s2.message}`, "error");
      }
    });
  });
}
async function ru(e, t) {
  const n = gameState.employees.find((e2) => e2.id === t);
  n && await Ev(`Remove ${n.name} from this position?`, "Remove from Position", { type: "warning", confirmText: "Remove" }) && (Ud(t) ? (showNotification(`${n.name} removed from position`, "success"), closeCorporatePyramidModal(), setTimeout(() => openCorporatePyramidModal(), 100)) : showNotification("Failed to remove employee", "error"));
}
window.onProgramRun = onProgramRun, window.runProgramTarget = runProgramTarget, window.filterProgTargets = filterProgTargets, window.renderProgramsCard = renderProgramsCard, gameState.peopleSorting || (gameState.peopleSorting = { sortBy: "recentMessages", showFavoritesOnly: false }), window.canPromoteEmployee = canPromoteEmployee, window.startPromotionFlow = startPromotionFlow, window.executePromotion = executePromotion;
let su = 1;
function pyramidZoom(e) {
  const t = document.getElementById("pyramidCanvas");
  t && ("in" === e ? su = Math.min(su + 0.2, 2) : "out" === e ? su = Math.max(su - 0.2, 0.5) : "reset" === e && (su = 1), t.style.transform = `scale(${su})`);
}
function lu() {
  const e = document.getElementById("pyramidContainer"), t = document.getElementById("pyramidCanvas");
  if (!e || !t) return;
  let n = 0, a = su;
  e.addEventListener("touchstart", (e2) => {
    if (2 === e2.touches.length) {
      e2.preventDefault();
      const t2 = e2.touches[0], o = e2.touches[1];
      n = Math.hypot(o.pageX - t2.pageX, o.pageY - t2.pageY), a = su;
    }
  }, { passive: false }), e.addEventListener("touchmove", (e2) => {
    if (2 === e2.touches.length) {
      e2.preventDefault();
      const o = e2.touches[0], i = e2.touches[1], s = Math.hypot(i.pageX - o.pageX, i.pageY - o.pageY) / n;
      su = Math.max(0.5, Math.min(2, a * s)), t.style.transform = `scale(${su})`;
    }
  }, { passive: false });
}
function closeCorporatePyramidModal() {
  const e = document.getElementById("pyramidModal");
  e && (e.style.display = "none", e.innerHTML = ""), su = 1;
}
