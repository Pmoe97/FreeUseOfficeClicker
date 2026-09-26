// ============================================================================
// 33-programs — Programs: program definitions Nd, runProgram, renderProgramsCard, target menus.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function Pd(u2) {
  const by = {};
  gameState.products.forEach((p) => {
    if (!p.unlocked) return;
    const v = "function" == typeof currentValue ? currentValue(p) : p.value || 0;
    by[p.locationId] = (by[p.locationId] || 0) + v;
  });
  let top = null, max = -1;
  return Object.entries(by).forEach(([k, v]) => v > max && (max = v, top = k)), top === u2;
}
function Ad(e, chip, program) {
  e.flags || (e.flags = { systemFlags: [], customFlags: [] }), Array.isArray(e.flags.customFlags) || (e.flags.customFlags = []);
  const now = gameState.time?.currentTime ?? Date.now(), exp = now + 864e5 * chip.durationDays;
  e.flags.customFlags = e.flags.customFlags.filter((f) => !("program" === f.category && f.source === program.id && f.playerDescription === chip.label)), e.flags.customFlags.push({ id: "function" == typeof Qe ? Qe() : "pf" + Date.now() + Math.random(), key: "program:" + program.id + ":" + chip.label, category: "program", source: program.id, setBy: "program", emoji: chip.emoji, playerDescription: chip.label, priority: "medium", affectsContext: false, setDate: now, timestamp: now, duration: 864e5 * chip.durationDays, expirationDate: exp, autoRemove: exp, metadata: { tone: chip.priority, programName: program.name } });
}
function Ld(e) {
  const flags = ("function" == typeof Xe ? Xe(e) : []).filter((f) => "program" === f.category || "payroll" === f.category);
  if (!flags.length) return "";
  const now = gameState.time?.currentTime ?? Date.now(), one = (f) => {
    const tone = f.metadata?.tone, u2 = "buff" === tone ? "chip--buff" : "debuff" === tone ? "chip--debuff" : "chip--mixed", left = f.expirationDate ? Math.max(0, Math.ceil((f.expirationDate - now) / 864e5)) : null;
    return `<span class="chip ${u2}" title="${`${f.metadata?.programName || f.source || "Program"}${null != left ? " \xB7 " + left + "d left" : ""}`}"><span>${f.emoji || "\u2022"}</span><span class="lbl">${f.playerDescription || ""}</span></span>`;
  };
  return flags.length <= 3 ? flags.map(one).join("") : flags.slice(0, 2).map(one).join("") + `<span class="chip-overflow">+${flags.length - 2}</span>`;
}
const Nd = [{ id: "training", tier: "company", emoji: "\u{1F393}", name: "Training Workshop", flavor: "Mandatory upskilling. Productivity rises; enthusiasm is assumed.", legacy: true, run: () => conductTrainingWorkshop(), cost: { display: "$500/emp", cashFn: () => 500 * Sd().length, cooldownDays: 0 } }, { id: "teambuilding", tier: "company", emoji: "\u{1F389}", name: "Team Building", flavor: "Trust falls, ropes courses, and a shared spreadsheet of feelings.", legacy: true, run: () => conductTeamBuilding(), cost: { display: "$800/emp \xB7 14d", cashFn: () => 800 * Sd().length, cooldownDays: 14 } }, { id: "review", tier: "individual", emoji: "\u{1F4CA}", name: "Performance Review", flavor: "A structured conversation about growth, framed as a dialogue.", legacy: true, run: (t) => kd(t), cost: { display: "$200 \xB7 7d", cashFn: () => 200, cooldownDays: 7 } }, { id: "wellness", tier: "company", emoji: "\u{1F9D8}", name: "Wellness & Mindfulness Initiative", flavor: "Guided breathing, ergonomic chairs, and a fruit basket no one touches.", cost: { cashFn: (c) => StoryEngine.calculateScaledCost(2e3 * c.affected.length), cooldownDays: 7 }, benefit: { description: "+15 comfort, +10 affection to all.", applyFn: (c) => {
  const back = c.program.conditionalDrawback.condition(c);
  c.affected.forEach((e) => {
    Cd(e, "comfort", back ? 7 : 15), Cd(e, "affection", 10), back && Cd(e, "obedience", -5);
  });
} }, activePenalty: { description: "None.", applyFn: () => {
}, durationDays: 0 }, conditionalDrawback: { condition: (c) => $d(c.affected, "trust") < 35, description: "Avg trust < 35 \u2014 they see through it; comfort gain halved, \u22125 obedience." }, chips: [{ emoji: "\u{1F9D8}", label: "Zen", priority: "buff", durationDays: 5 }] }, { id: "loyalty_recal", tier: "company", emoji: "\u26D3\uFE0F", name: "Loyalty Recalibration Program", flavor: "A 'voluntary' values workshop. Attendance is noted. Enthusiasm is measured.", cost: { cashFn: (c) => StoryEngine.calculateScaledCost(8e3 * c.affected.length), cooldownDays: 10 }, benefit: { description: "+20 obedience, +12 trust to all; \u22128 comfort.", applyFn: (c) => {
  const back = c.program.conditionalDrawback.condition(c);
  c.affected.forEach((e) => {
    Cd(e, "obedience", 20), Cd(e, "trust", 12), Cd(e, "comfort", -8), back && Cd(e, "affection", -15);
  });
} }, activePenalty: { description: "Company output \u22128% for 1 day.", applyFn: () => Md(0.92, 1), durationDays: 1 }, conditionalDrawback: { condition: (c) => $d(c.affected, "trust") > 70, description: "Avg trust > 70 \u2014 they resent the implication; \u221215 affection." }, chips: [{ emoji: "\u26D3\uFE0F", label: "Recalibrated", priority: "debuff", durationDays: 1 }], unlockCondition: (u2) => (u2.prestigeLevel || 0) >= 1 || Sd().length >= 5, unlockReason: "Prestige 1, or 5+ employees" }, { id: "open_door", tier: "company", emoji: "\u{1F6AA}", name: "Open-Door Transparency Week", flavor: "Leadership pledges radical candor for five business days. Results may vary.", cost: { cashFn: (c) => StoryEngine.calculateScaledCost(4e3 * c.affected.length), cooldownDays: 6 }, benefit: { description: "+15 trust to all.", applyFn: (c) => c.affected.forEach((e) => Cd(e, "trust", 15)) }, activePenalty: { description: "None.", applyFn: () => {
}, durationDays: 0 }, conditionalDrawback: { condition: (c) => c.affected.some((e) => (e.stats?.comfort ?? 50) < 30), description: "Someone's comfort < 30 \u2014 grievances surface; the unhappiest gets \u221210 obedience (2d).", applyFn: (c) => {
  const v = c.affected.filter((e) => (e.stats?.comfort ?? 50) < 30).sort((a, b) => (a.stats?.comfort ?? 50) - (b.stats?.comfort ?? 50))[0];
  v && (Cd(v, "obedience", -10), Ad(v, { emoji: "\u{1F624}", label: "Vocal", priority: "debuff", durationDays: 2 }, c.program));
} }, chips: [{ emoji: "\u{1F6AA}", label: "Candid", priority: "buff", durationDays: 5 }] }, { id: "mandatory_fun", tier: "company", emoji: "\u{1F388}", name: "Mandatory Fun Day", flavor: "Attendance at the celebration of morale is compulsory. You will have fun. This will be measured.", cost: { cashFn: (c) => StoryEngine.calculateScaledCost(5e3 * c.affected.length), cooldownDays: 7 }, benefit: { description: "+12 comfort, +8 affection to all.", applyFn: (c) => {
  const back = c.program.conditionalDrawback.condition(c);
  c.affected.forEach((e) => {
    Cd(e, "comfort", back ? 0 : 12), Cd(e, "affection", 8), back && Cd(e, "obedience", -5);
  });
} }, activePenalty: { description: "Everyone offline 1 day (managed-product income pauses).", applyFn: (c) => c.affected.forEach((e) => Ed(e, 1, "Mandatory Fun Day")), durationDays: 1 }, conditionalDrawback: { condition: (c) => $d(c.affected, "productivity") > 80, description: "Avg productivity > 80 \u2014 they'd rather be working; no comfort gain, \u22125 obedience." }, chips: [{ emoji: "\u{1F388}", label: "Fun (Mand.)", priority: "mixed", durationDays: 1 }] }, { id: "synergy", tier: "company", emoji: "\u{1F4C9}", name: "Synergy Restructuring", flavor: "An all-staff memo about 'rightsizing for agility.' No one is fired. Everyone gets the message.", cost: { cashFn: (c) => StoryEngine.calculateScaledCost(3e3 * c.affected.length), cooldownDays: 21 }, benefit: { description: "+25 obedience, +15 productivity to all; \u221215 affection, \u221212 comfort, \u221220 trust.", applyFn: (c) => c.affected.forEach((e) => {
  Cd(e, "obedience", 25), Cd(e, "productivity", 15), Cd(e, "affection", -15), Cd(e, "comfort", -12), Cd(e, "trust", -20);
}) }, activePenalty: { description: "Company-wide morale & trust hit.", applyFn: () => {
}, durationDays: 0 }, conditionalDrawback: { condition: (c) => $d(c.affected, "affection") < 45, description: "Avg affection < 45 \u2014 resignation risk; flag a flight risk and brace for departures.", applyFn: (c) => {
  const v = c.affected.sort((a, b) => (a.stats?.affection ?? 50) - (b.stats?.affection ?? 50))[0];
  v && Ad(v, { emoji: "\u{1F6AA}", label: "Flight Risk", priority: "debuff", durationDays: 5 }, c.program), showNotification("\u26A0\uFE0F Morale is dangerously low \u2014 watch for resignations.", "warning");
} }, chips: [{ emoji: "\u{1F4C9}", label: "On Notice", priority: "debuff", durationDays: 5 }], unlockCondition: (u2) => (u2.prestigeLevel || 0) >= 2, unlockReason: "Prestige 2" }, { id: "regional_sprint", tier: "department", emoji: "\u{1F3C3}", name: "Regional Productivity Sprint", flavor: "One location goes all-in for a quarter. Snacks provided. Overtime implied.", cost: { cashFn: (c) => StoryEngine.calculateScaledCost(6e3 * Math.max(1, c.affected.length)), cooldownDays: 4 }, benefit: { description: "Location output +25% (2d); +10 productivity to its staff (\u221210 comfort).", applyFn: (c) => {
  Id(c.target, 1.25, 2), c.affected.forEach((e) => {
    Cd(e, "productivity", 10), Cd(e, "comfort", -10);
  });
} }, activePenalty: { description: "Sprinting staff lose comfort for the push.", applyFn: () => {
}, durationDays: 2 }, conditionalDrawback: { condition: (c) => c.affected.some((e) => (e.stats?.comfort ?? 50) < 30), description: "A team member's comfort < 30 \u2014 burnout risk; possible \u221215 productivity (3d).", applyFn: (c) => c.affected.filter((e) => (e.stats?.comfort ?? 50) < 30).forEach((e) => {
  Math.random() < 0.5 && (Cd(e, "productivity", -15), Ad(e, { emoji: "\u{1F975}", label: "Burnt Out", priority: "debuff", durationDays: 3 }, c.program));
}) }, chips: [{ emoji: "\u{1F3C3}", label: "Sprinting", priority: "mixed", durationDays: 2 }] }, { id: "compliance", tier: "department", emoji: "\u{1F4CB}", name: "Compliance & Conduct Enforcement", flavor: "A reminder, in writing, of expectations. And consequences. Mostly consequences.", cost: { cashFn: (c) => StoryEngine.calculateScaledCost(4e3 * Math.max(1, c.affected.length)), cooldownDays: 8 }, benefit: { description: "+18 obedience to the location; \u221210 affection, \u221212 comfort.", applyFn: (c) => c.affected.forEach((e) => {
  Cd(e, "obedience", 18), Cd(e, "affection", -10), Cd(e, "comfort", -12);
}) }, activePenalty: { description: "A climate of caution settles in.", applyFn: () => {
}, durationDays: 3 }, conditionalDrawback: { condition: (c) => $d(c.affected, "affection") < 40, description: "Location avg affection < 40 \u2014 resentment; one employee becomes a flight risk.", applyFn: (c) => {
  const v = c.affected.sort((a, b) => (a.stats?.affection ?? 50) - (b.stats?.affection ?? 50))[0];
  v && Ad(v, { emoji: "\u{1F6AA}", label: "Flight Risk", priority: "debuff", durationDays: 5 }, c.program);
} }, chips: [{ emoji: "\u{1F4CB}", label: "Under Review", priority: "debuff", durationDays: 3 }] }, { id: "glow_up", tier: "department", emoji: "\u{1FAB4}", name: "Location Glow-Up", flavor: "New plants, a neon sign that says HUSTLE, and a cold-brew tap. Morale is now mandatory.", cost: { cashFn: () => StoryEngine.calculateScaledCost(2e4), cooldownDays: 12 }, benefit: { description: "+20 comfort to the location; output +10% (2d) after reopening.", applyFn: (c) => {
  c.affected.forEach((e) => Cd(e, "comfort", 20)), Id(c.target, 1.1, 2);
} }, activePenalty: { description: "Closed for renovation ~1 day (location products offline).", applyFn: (c) => gameState.products.forEach((p) => {
  p.locationId === c.target && (p.disabled = true, p.disabledUntil = (gameState.currentDay || 0) + 1, p.disabledReason = "Renovation");
}), durationDays: 1 }, conditionalDrawback: { condition: (c) => Pd(c.target), description: "This is your top-earning location \u2014 the renovation closure costs real income." }, chips: [{ emoji: "\u{1FAB4}", label: "Renovated", priority: "buff", durationDays: 2 }] }, { id: "exec_coaching", tier: "individual", emoji: "\u{1F680}", name: "Executive Coaching", flavor: "Intensive 1:1 development for a high-potential. Expensive. Occasionally produces a monster.", cost: { cashFn: () => StoryEngine.calculateScaledCost(5e4), cooldownDays: 10 }, benefit: { description: "+15 productivity, big management XP, marks Fast-Track.", applyFn: (c) => {
  const e = c.affected[0];
  e && (Cd(e, "productivity", 15), "function" == typeof gainSkillXP && gainSkillXP(e, "management", 60, "exec_coaching"), e.fastTrack = true);
} }, activePenalty: { description: "In coaching ~1 day (offline).", applyFn: (c) => c.affected[0] && Ed(c.affected[0], 1, "Executive Coaching"), durationDays: 1 }, conditionalDrawback: { condition: (c) => (c.affected[0]?.stats?.trust ?? 50) < 40, description: "Their trust < 40 \u2014 they'll leverage it (expect a raise request)." }, chips: [{ emoji: "\u{1F680}", label: "Coaching", priority: "mixed", durationDays: 1 }, { emoji: "\u2B50", label: "Fast-Track", priority: "buff", durationDays: 30 }] }, { id: "retention_bonus", tier: "individual", emoji: "\u{1F4B0}", name: "Discretionary Retention Bonus", flavor: "An off-cycle 'thank you' for someone you'd hate to lose. Strictly merit-based, of course.", cost: { cashFn: () => StoryEngine.calculateScaledCost(8e4), cooldownDays: 14 }, benefit: { description: "+20 affection, +15 trust, +10 obedience.", applyFn: (c) => {
  const e = c.affected[0];
  e && (Cd(e, "affection", 20), Cd(e, "trust", 15), Cd(e, "obedience", 10));
} }, activePenalty: { description: "None.", applyFn: () => {
}, durationDays: 0 }, conditionalDrawback: { condition: (c) => {
  const e = c.affected[0];
  return !!e && Sd().some((o) => o.id !== e.id && (o.stats?.productivity ?? 0) > (e.stats?.productivity ?? 0));
}, description: "A more productive peer got nothing \u2014 favoritism; 1\u20132 others lose comfort.", applyFn: (c) => {
  const e = c.affected[0];
  e && Sd().filter((o) => o.id !== e.id).sort(() => Math.random() - 0.5).slice(0, 2).forEach((o) => Cd(o, "comfort", -5));
} }, chips: [{ emoji: "\u{1F4B0}", label: "Bonused", priority: "buff", durationDays: 7 }] }, { id: "wardrobe", tier: "individual", emoji: "\u{1F48B}", name: "Wardrobe & Image Consultation", flavor: "A brand-alignment session to refine an employee's professional presentation. The dress code is\u2026 aspirational.", cost: { cashFn: () => StoryEngine.calculateScaledCost(15e3), cooldownDays: 7 }, targetGate: (e) => (e.stats?.affection ?? 0) >= 40 || "Requires affection \u2265 40 (relationship gate)", benefit: { description: "+15 desire, +10 affection.", applyFn: (c) => {
  const e = c.affected[0];
  e && (Cd(e, "desire", 15), Cd(e, "affection", 10));
} }, activePenalty: { description: "At the consultation ~1 day (offline).", applyFn: (c) => c.affected[0] && Ed(c.affected[0], 1, "Image Consultation"), durationDays: 1 }, conditionalDrawback: { condition: (c) => (c.affected[0]?.stats?.comfort ?? 50) < 40, description: "Their comfort < 40 \u2014 feels objectified; \u221210 trust.", applyFn: (c) => c.affected[0] && Cd(c.affected[0], "trust", -10) }, chips: [{ emoji: "\u{1F48B}", label: "Restyled", priority: "mixed", durationDays: 7 }] }];
function runProgram(u2, target = null) {
  const p = Nd.find((x) => x.id === u2);
  if (!p) return void showNotification("Unknown program.", "error");
  if (gameState.productivitySystems || (gameState.productivitySystems = {}), gameState.productivitySystems.programCooldowns || (gameState.productivitySystems.programCooldowns = {}), p.legacy) return void p.run(target);
  const cd = gameState.productivitySystems.programCooldowns, today = gameState.currentDay || 0, G2 = "individual" === p.tier && target ? u2 + ":" + target : u2;
  if ((cd[G2] || 0) > today) return void showNotification(`${p.name} is on cooldown (${(cd[G2] || 0) - today}d left).`, "warning");
  if (p.unlockCondition && !p.unlockCondition(gameState)) return void showNotification(`${p.name} is locked: ${p.unlockReason || "not yet available"}.`, "warning");
  if ("individual" === p.tier) {
    const emp2 = gameState.employees.find((e) => e.id === target);
    if (!emp2 || "active" !== emp2.employmentStatus) return void showNotification("Select an active employee.", "warning");
    if (p.targetGate) {
      const g = p.targetGate(emp2);
      if (true !== g) return void showNotification("string" == typeof g ? g : `${emp2.name} isn't eligible.`, "warning");
    }
  }
  if ("department" === p.tier && !target) return void showNotification("Select a location.", "warning");
  const affected = Td(p.tier, target);
  if (!affected.length) return void showNotification("No eligible employees for this program.", "warning");
  const cost = Math.floor(p.cost.cashFn({ affected, target, gameState }));
  if (gameState.cash < cost) return void showNotification(`Not enough cash \u2014 ${p.name} costs $${wu(cost)}.`, "error");
  gameState.cash -= cost, cd[G2] = today + (p.cost.cooldownDays || 0);
  const U2 = { affected, target, gameState, today, program: p };
  p.benefit && p.benefit.applyFn && p.benefit.applyFn(U2), p.activePenalty && p.activePenalty.applyFn && p.activePenalty.applyFn(U2), p.conditionalDrawback && p.conditionalDrawback.condition(U2) && p.conditionalDrawback.applyFn && p.conditionalDrawback.applyFn(U2), (p.chips || []).forEach((chip) => affected.forEach((e) => Ad(e, chip, p))), fh = true, "function" == typeof logCompanyEvent && logCompanyEvent({ type: "program", description: `${p.name} conducted`, sentiment: "neutral", importance: 5 }), showNotification(`${p.emoji || "\u{1F4CB}"} ${p.name} is now underway.`, "success"), saveGame(false), updatePeopleTab(), "function" == typeof updateUI && updateUI();
}
window.runProgram = runProgram;
let _d = "all";
function renderProgramsCard() {
  const body = document.getElementById("programsBody");
  if (!body) return;
  const today = gameState.currentDay || 0, u2 = gameState.productivitySystems?.programCooldowns || {}, seg = `<div class="seg mb-2" id="programsTierSeg">${[["all", "All"], ["company", "Company"], ["department", "Dept"], ["individual", "Individual"]].map((t) => `<button data-ptier="${t[0]}"${_d === t[0] ? ' class="is-active"' : ""}>${t[1]}</button>`).join("")}</div>`, rows = Nd.filter((p) => "all" === _d || p.tier === _d).map((p) => {
    const locked = p.unlockCondition && !p.unlockCondition(gameState), G2 = !p.legacy && (u2[p.id] || 0) > today, U2 = G2 ? (u2[p.id] || 0) - today : 0;
    let cost = "";
    try {
      cost = p.cost.display || "$" + wu(Math.floor(p.cost.cashFn({ affected: Td(p.tier, null), target: null, gameState })));
    } catch (u3) {
    }
    let warn = "";
    if ("company" === p.tier && p.conditionalDrawback) try {
      p.conditionalDrawback.condition({ affected: Td("company", null), gameState, program: p }) && (warn = `<div class="text-neg fs-xs">\u26A0\uFE0F ${p.conditionalDrawback.description}</div>`);
    } catch (u3) {
    }
    const btn = locked ? `<button class="btn btn--aj" disabled title="${p.unlockReason || ""}">\u{1F512} ${p.unlockReason || "Locked"}</button>` : G2 ? `<button class="btn btn--aj" disabled><span class="num">${U2}</span>d</button>` : `<button class="btn btn--be" onclick="onProgramRun('${p.id}', this)">Run</button>`;
    return `<div class="prog" data-pid="${p.id}"> <div class="row-between"><div class="fw-600 fs-sm">${p.emoji} ${p.name}</div><span class="num text-dim fs-xs">${cost}</span></div> <div class="text-dim fs-xs">${p.flavor}</div> ${warn} <div class="row" style="justify-content:flex-end">${btn}</div> </div>`;
  }).join("");
  body.innerHTML = seg + `<div class="col" style="max-height:46vh; overflow-y:auto; padding-right:var(--s3)">${rows}</div>`, document.getElementById("programsTierSeg")?.querySelectorAll("button").forEach((b) => b.onclick = () => (_d = b.dataset.ptier, renderProgramsCard()));
}
function onProgramRun(id, u2) {
  const p = Nd.find((x) => x.id === id);
  if (p) return "company" === p.tier ? (runProgram(id, null), void renderProgramsCard()) : void Rd(p, u2);
}
function Rd(p, u2) {
  document.querySelectorAll(".prog-target-menu").forEach((m) => m.remove());
  const wrap = u2.parentElement;
  let items;
  if (wrap.style.position = "relative", "department" === p.tier) {
    items = (gameState.locations || []).filter((l) => l.unlocked || l.owned).map((l) => `<button class="btn btn--aj" onclick="runProgramTarget('${p.id}','${l.id}')">${l.name || l.id}</button>`).join("") || '<div class="text-dim fs-xs">No locations.</div>';
  } else items = '<input class="input mb-1" placeholder="\u{1F50D} employee\u2026" oninput="filterProgTargets(this.value)" /><div id="progTargetList" class="col" style="gap:2px; max-height:40vh; overflow-y:auto">' + Sd().map((e) => {
    const u3 = !p.targetGate || true === p.targetGate(e);
    return `<button class="btn btn--aj prog-target-emp" data-nm="${(e.name || "").toLowerCase()}" ${u3 ? "" : "disabled"} onclick="runProgramTarget('${p.id}','${e.id}')">${"function" == typeof yl ? yl(e) : e.name}${u3 ? "" : " \u{1F512}"}</button>`;
  }).join("") + "</div>";
  const menu = document.createElement("div");
  menu.className = "row-menu prog-target-menu", menu.style.minWidth = "210px", menu.innerHTML = items + `<button class="btn btn--aj" onclick="this.closest('.prog-target-menu').remove()">Cancel</button>`, wrap.appendChild(menu);
}
function runProgramTarget(id, target) {
  document.querySelectorAll(".prog-target-menu").forEach((m) => m.remove()), runProgram(id, target), renderProgramsCard();
}
function filterProgTargets(q) {
  q = (q || "").toLowerCase(), document.querySelectorAll("#progTargetList .prog-target-emp").forEach((b) => b.style.display = b.dataset.nm.includes(q) ? "" : "none");
}
