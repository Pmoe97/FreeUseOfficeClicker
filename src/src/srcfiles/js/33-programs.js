// ============================================================================
// 33-programs — Programs: program definitions PROGRAMS, runProgram, renderProgramsCard, target menus.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function _isTopEarnerLocation(locId) {
    const by = {};
    gameState.products.forEach((p) => {
        if (!p.unlocked) return;
        const v = "function" == typeof currentValue ? currentValue(p) : p.value || 0;
        by[p.locationId] = (by[p.locationId] || 0) + v;
    });
    let top = null,
        max = -1;
    Object.entries(by).forEach(([k, v]) => v > max && ((max = v), (top = k)));
    return top === locId;
}
// Chip = a flag (category:"program"); pushed directly to avoid addFlag()'s
// per-call saveGame() across a whole roster (runProgram saves once at end).
function _progChip(e, chip, program) {
    e.flags || (e.flags = { systemFlags: [], customFlags: [] });
    Array.isArray(e.flags.customFlags) || (e.flags.customFlags = []);
    const now = gameState.time?.currentTime ?? Date.now(),
        exp = now + chip.durationDays * 864e5;
    e.flags.customFlags = e.flags.customFlags.filter(
        (f) => !("program" === f.category && f.source === program.id && f.playerDescription === chip.label)
    );
    e.flags.customFlags.push({
        id: "function" == typeof generateFlagId ? generateFlagId() : "pf" + Date.now() + Math.random(),
        key: "program:" + program.id + ":" + chip.label,
        category: "program",
        source: program.id,
        setBy: "program",
        emoji: chip.emoji,
        playerDescription: chip.label,
        priority: "medium",
        affectsContext: !1,
        setDate: now,
        timestamp: now,
        duration: chip.durationDays * 864e5,
        expirationDate: exp,
        autoRemove: exp,
        metadata: { tone: chip.priority, programName: program.name },
    });
}
function renderProgramChips(e) {
    const flags = ("function" == typeof getActiveFlags ? getActiveFlags(e) : []).filter(
        (f) => "program" === f.category || "payroll" === f.category
    );
    if (!flags.length) return "";
    const now = gameState.time?.currentTime ?? Date.now(),
        one = (f) => {
            const tone = f.metadata?.tone,
                cls = "buff" === tone ? "chip--buff" : "debuff" === tone ? "chip--debuff" : "chip--mixed",
                left = f.expirationDate ? Math.max(0, Math.ceil((f.expirationDate - now) / 864e5)) : null,
                title = `${f.metadata?.programName || f.source || "Program"}${null != left ? " · " + left + "d left" : ""}`;
            return `<span class="chip ${cls}" title="${title}"><span>${f.emoji || "•"}</span><span class="lbl">${f.playerDescription || ""}</span></span>`;
        };
    return flags.length <= 3
        ? flags.map(one).join("")
        : flags.slice(0, 2).map(one).join("") + `<span class="chip-overflow">+${flags.length - 2}</span>`;
}

const PROGRAMS = [
    // ---- Legacy (preserved exactly; PROGRAMS entry delegates to the existing fn) ----
    {
        id: "training",
        tier: "company",
        emoji: "🎓",
        name: "Training Workshop",
        flavor: "Mandatory upskilling. Productivity rises; enthusiasm is assumed.",
        legacy: !0,
        run: () => conductTrainingWorkshop(),
        cost: { display: "$500/emp", cashFn: () => 500 * _progActive().length, cooldownDays: 0 },
    },
    {
        id: "teambuilding",
        tier: "company",
        emoji: "🎉",
        name: "Team Building",
        flavor: "Trust falls, ropes courses, and a shared spreadsheet of feelings.",
        legacy: !0,
        run: () => conductTeamBuilding(),
        cost: { display: "$800/emp · 14d", cashFn: () => 800 * _progActive().length, cooldownDays: 14 },
    },
    {
        id: "review",
        tier: "individual",
        emoji: "📊",
        name: "Performance Review",
        flavor: "A structured conversation about growth, framed as a dialogue.",
        legacy: !0,
        run: (t) => conductPerformanceReview(t),
        cost: { display: "$200 · 7d", cashFn: () => 200, cooldownDays: 7 },
    },
    // ---- New: company-wide ----
    {
        id: "wellness",
        tier: "company",
        emoji: "🧘",
        name: "Wellness & Mindfulness Initiative",
        flavor: "Guided breathing, ergonomic chairs, and a fruit basket no one touches.",
        cost: { cashFn: (c) => StoryEngine.calculateScaledCost(2e3 * c.affected.length), cooldownDays: 7 },
        benefit: {
            description: "+15 comfort, +10 affection to all.",
            applyFn: (c) => {
                const back = c.program.conditionalDrawback.condition(c);
                c.affected.forEach((e) => {
                    _progBump(e, "comfort", back ? 7 : 15), _progBump(e, "affection", 10), back && _progBump(e, "obedience", -5);
                });
            },
        },
        activePenalty: { description: "None.", applyFn: () => {}, durationDays: 0 },
        conditionalDrawback: {
            condition: (c) => _progAvg(c.affected, "trust") < 35,
            description: "Avg trust < 35 — they see through it; comfort gain halved, −5 obedience.",
        },
        chips: [{ emoji: "🧘", label: "Zen", priority: "buff", durationDays: 5 }],
    },
    {
        id: "loyalty_recal",
        tier: "company",
        emoji: "⛓️",
        name: "Loyalty Recalibration Program",
        flavor: "A 'voluntary' values workshop. Attendance is noted. Enthusiasm is measured.",
        cost: { cashFn: (c) => StoryEngine.calculateScaledCost(8e3 * c.affected.length), cooldownDays: 10 },
        benefit: {
            description: "+20 obedience, +12 trust to all; −8 comfort.",
            applyFn: (c) => {
                const back = c.program.conditionalDrawback.condition(c);
                c.affected.forEach((e) => {
                    _progBump(e, "obedience", 20),
                        _progBump(e, "trust", 12),
                        _progBump(e, "comfort", -8),
                        back && _progBump(e, "affection", -15);
                });
            },
        },
        activePenalty: { description: "Company output −8% for 1 day.", applyFn: () => _progBoostAll(0.92, 1), durationDays: 1 },
        conditionalDrawback: {
            condition: (c) => _progAvg(c.affected, "trust") > 70,
            description: "Avg trust > 70 — they resent the implication; −15 affection.",
        },
        chips: [{ emoji: "⛓️", label: "Recalibrated", priority: "debuff", durationDays: 1 }],
        unlockCondition: (gs) => (gs.prestigeLevel || 0) >= 1 || _progActive().length >= 5,
        unlockReason: "Prestige 1, or 5+ employees",
    },
    {
        id: "open_door",
        tier: "company",
        emoji: "🚪",
        name: "Open-Door Transparency Week",
        flavor: "Leadership pledges radical candor for five business days. Results may vary.",
        cost: { cashFn: (c) => StoryEngine.calculateScaledCost(4e3 * c.affected.length), cooldownDays: 6 },
        benefit: { description: "+15 trust to all.", applyFn: (c) => c.affected.forEach((e) => _progBump(e, "trust", 15)) },
        activePenalty: { description: "None.", applyFn: () => {}, durationDays: 0 },
        conditionalDrawback: {
            condition: (c) => c.affected.some((e) => (e.stats?.comfort ?? 50) < 30),
            description: "Someone's comfort < 30 — grievances surface; the unhappiest gets −10 obedience (2d).",
            applyFn: (c) => {
                const v = c.affected
                    .filter((e) => (e.stats?.comfort ?? 50) < 30)
                    .sort((a, b) => (a.stats?.comfort ?? 50) - (b.stats?.comfort ?? 50))[0];
                v && (_progBump(v, "obedience", -10), _progChip(v, { emoji: "😤", label: "Vocal", priority: "debuff", durationDays: 2 }, c.program));
            },
        },
        chips: [{ emoji: "🚪", label: "Candid", priority: "buff", durationDays: 5 }],
    },
    {
        id: "mandatory_fun",
        tier: "company",
        emoji: "🎈",
        name: "Mandatory Fun Day",
        flavor: "Attendance at the celebration of morale is compulsory. You will have fun. This will be measured.",
        cost: { cashFn: (c) => StoryEngine.calculateScaledCost(5e3 * c.affected.length), cooldownDays: 7 },
        benefit: {
            description: "+12 comfort, +8 affection to all.",
            applyFn: (c) => {
                const back = c.program.conditionalDrawback.condition(c);
                c.affected.forEach((e) => {
                    _progBump(e, "comfort", back ? 0 : 12), _progBump(e, "affection", 8), back && _progBump(e, "obedience", -5);
                });
            },
        },
        activePenalty: {
            description: "Everyone offline 1 day (managed-product income pauses).",
            applyFn: (c) => c.affected.forEach((e) => _progUnavailable(e, 1, "Mandatory Fun Day")),
            durationDays: 1,
        },
        conditionalDrawback: {
            condition: (c) => _progAvg(c.affected, "productivity") > 80,
            description: "Avg productivity > 80 — they'd rather be working; no comfort gain, −5 obedience.",
        },
        chips: [{ emoji: "🎈", label: "Fun (Mand.)", priority: "mixed", durationDays: 1 }],
    },
    {
        id: "synergy",
        tier: "company",
        emoji: "📉",
        name: "Synergy Restructuring",
        flavor: "An all-staff memo about 'rightsizing for agility.' No one is fired. Everyone gets the message.",
        cost: { cashFn: (c) => StoryEngine.calculateScaledCost(3e3 * c.affected.length), cooldownDays: 21 },
        benefit: {
            description: "+25 obedience, +15 productivity to all; −15 affection, −12 comfort, −20 trust.",
            applyFn: (c) =>
                c.affected.forEach((e) => {
                    _progBump(e, "obedience", 25),
                        _progBump(e, "productivity", 15),
                        _progBump(e, "affection", -15),
                        _progBump(e, "comfort", -12),
                        _progBump(e, "trust", -20);
                }),
        },
        activePenalty: { description: "Company-wide morale & trust hit.", applyFn: () => {}, durationDays: 0 },
        conditionalDrawback: {
            condition: (c) => _progAvg(c.affected, "affection") < 45,
            description: "Avg affection < 45 — resignation risk; flag a flight risk and brace for departures.",
            applyFn: (c) => {
                const v = c.affected.sort((a, b) => (a.stats?.affection ?? 50) - (b.stats?.affection ?? 50))[0];
                v && _progChip(v, { emoji: "🚪", label: "Flight Risk", priority: "debuff", durationDays: 5 }, c.program),
                    showNotification("⚠️ Morale is dangerously low — watch for resignations.", "warning");
            },
        },
        chips: [{ emoji: "📉", label: "On Notice", priority: "debuff", durationDays: 5 }],
        unlockCondition: (gs) => (gs.prestigeLevel || 0) >= 2,
        unlockReason: "Prestige 2",
    },
    // ---- New: department/location ----
    {
        id: "regional_sprint",
        tier: "department",
        emoji: "🏃",
        name: "Regional Productivity Sprint",
        flavor: "One location goes all-in for a quarter. Snacks provided. Overtime implied.",
        cost: { cashFn: (c) => StoryEngine.calculateScaledCost(6e3 * Math.max(1, c.affected.length)), cooldownDays: 4 },
        benefit: {
            description: "Location output +25% (2d); +10 productivity to its staff (−10 comfort).",
            applyFn: (c) => {
                _progBoostLocation(c.target, 1.25, 2),
                    c.affected.forEach((e) => {
                        _progBump(e, "productivity", 10), _progBump(e, "comfort", -10);
                    });
            },
        },
        activePenalty: { description: "Sprinting staff lose comfort for the push.", applyFn: () => {}, durationDays: 2 },
        conditionalDrawback: {
            condition: (c) => c.affected.some((e) => (e.stats?.comfort ?? 50) < 30),
            description: "A team member's comfort < 30 — burnout risk; possible −15 productivity (3d).",
            applyFn: (c) =>
                c.affected
                    .filter((e) => (e.stats?.comfort ?? 50) < 30)
                    .forEach((e) => {
                        Math.random() < 0.5 &&
                            (_progBump(e, "productivity", -15),
                            _progChip(e, { emoji: "🥵", label: "Burnt Out", priority: "debuff", durationDays: 3 }, c.program));
                    }),
        },
        chips: [{ emoji: "🏃", label: "Sprinting", priority: "mixed", durationDays: 2 }],
    },
    {
        id: "compliance",
        tier: "department",
        emoji: "📋",
        name: "Compliance & Conduct Enforcement",
        flavor: "A reminder, in writing, of expectations. And consequences. Mostly consequences.",
        cost: { cashFn: (c) => StoryEngine.calculateScaledCost(4e3 * Math.max(1, c.affected.length)), cooldownDays: 8 },
        benefit: {
            description: "+18 obedience to the location; −10 affection, −12 comfort.",
            applyFn: (c) =>
                c.affected.forEach((e) => {
                    _progBump(e, "obedience", 18), _progBump(e, "affection", -10), _progBump(e, "comfort", -12);
                }),
        },
        activePenalty: { description: "A climate of caution settles in.", applyFn: () => {}, durationDays: 3 },
        conditionalDrawback: {
            condition: (c) => _progAvg(c.affected, "affection") < 40,
            description: "Location avg affection < 40 — resentment; one employee becomes a flight risk.",
            applyFn: (c) => {
                const v = c.affected.sort((a, b) => (a.stats?.affection ?? 50) - (b.stats?.affection ?? 50))[0];
                v && _progChip(v, { emoji: "🚪", label: "Flight Risk", priority: "debuff", durationDays: 5 }, c.program);
            },
        },
        chips: [{ emoji: "📋", label: "Under Review", priority: "debuff", durationDays: 3 }],
    },
    {
        id: "glow_up",
        tier: "department",
        emoji: "🪴",
        name: "Location Glow-Up",
        flavor: "New plants, a neon sign that says HUSTLE, and a cold-brew tap. Morale is now mandatory.",
        cost: { cashFn: () => StoryEngine.calculateScaledCost(2e4), cooldownDays: 12 },
        benefit: {
            description: "+20 comfort to the location; output +10% (2d) after reopening.",
            applyFn: (c) => {
                c.affected.forEach((e) => _progBump(e, "comfort", 20)), _progBoostLocation(c.target, 1.1, 2);
            },
        },
        activePenalty: {
            description: "Closed for renovation ~1 day (location products offline).",
            applyFn: (c) =>
                gameState.products.forEach((p) => {
                    p.locationId === c.target &&
                        ((p.disabled = !0), (p.disabledUntil = (gameState.currentDay || 0) + 1), (p.disabledReason = "Renovation"));
                }),
            durationDays: 1,
        },
        conditionalDrawback: {
            condition: (c) => _isTopEarnerLocation(c.target),
            description: "This is your top-earning location — the renovation closure costs real income.",
        },
        chips: [{ emoji: "🪴", label: "Renovated", priority: "buff", durationDays: 2 }],
    },
    // ---- New: individual ----
    {
        id: "exec_coaching",
        tier: "individual",
        emoji: "🚀",
        name: "Executive Coaching",
        flavor: "Intensive 1:1 development for a high-potential. Expensive. Occasionally produces a monster.",
        cost: { cashFn: () => StoryEngine.calculateScaledCost(5e4), cooldownDays: 10 },
        benefit: {
            description: "+15 productivity, big management XP, marks Fast-Track.",
            applyFn: (c) => {
                const e = c.affected[0];
                e &&
                    (_progBump(e, "productivity", 15),
                    "function" == typeof gainSkillXP && gainSkillXP(e, "management", 60, "exec_coaching"),
                    (e.fastTrack = !0));
            },
        },
        activePenalty: {
            description: "In coaching ~1 day (offline).",
            applyFn: (c) => c.affected[0] && _progUnavailable(c.affected[0], 1, "Executive Coaching"),
            durationDays: 1,
        },
        conditionalDrawback: {
            condition: (c) => (c.affected[0]?.stats?.trust ?? 50) < 40,
            description: "Their trust < 40 — they'll leverage it (expect a raise request).",
        },
        chips: [
            { emoji: "🚀", label: "Coaching", priority: "mixed", durationDays: 1 },
            { emoji: "⭐", label: "Fast-Track", priority: "buff", durationDays: 30 },
        ],
    },
    {
        id: "retention_bonus",
        tier: "individual",
        emoji: "💰",
        name: "Discretionary Retention Bonus",
        flavor: "An off-cycle 'thank you' for someone you'd hate to lose. Strictly merit-based, of course.",
        cost: { cashFn: () => StoryEngine.calculateScaledCost(8e4), cooldownDays: 14 },
        benefit: {
            description: "+20 affection, +15 trust, +10 obedience.",
            applyFn: (c) => {
                const e = c.affected[0];
                e && (_progBump(e, "affection", 20), _progBump(e, "trust", 15), _progBump(e, "obedience", 10));
            },
        },
        activePenalty: { description: "None.", applyFn: () => {}, durationDays: 0 },
        conditionalDrawback: {
            condition: (c) => {
                const e = c.affected[0];
                return !!e && _progActive().some((o) => o.id !== e.id && (o.stats?.productivity ?? 0) > (e.stats?.productivity ?? 0));
            },
            description: "A more productive peer got nothing — favoritism; 1–2 others lose comfort.",
            applyFn: (c) => {
                const e = c.affected[0];
                e &&
                    _progActive()
                        .filter((o) => o.id !== e.id)
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 2)
                        .forEach((o) => _progBump(o, "comfort", -5));
            },
        },
        chips: [{ emoji: "💰", label: "Bonused", priority: "buff", durationDays: 7 }],
    },
    {
        id: "wardrobe",
        tier: "individual",
        emoji: "💋",
        name: "Wardrobe & Image Consultation",
        flavor: "A brand-alignment session to refine an employee's professional presentation. The dress code is… aspirational.",
        cost: { cashFn: () => StoryEngine.calculateScaledCost(15e3), cooldownDays: 7 },
        targetGate: (e) => (e.stats?.affection ?? 0) >= 40 || "Requires affection ≥ 40 (relationship gate)",
        benefit: {
            description: "+15 desire, +10 affection.",
            applyFn: (c) => {
                const e = c.affected[0];
                e && (_progBump(e, "desire", 15), _progBump(e, "affection", 10));
            },
        },
        activePenalty: {
            description: "At the consultation ~1 day (offline).",
            applyFn: (c) => c.affected[0] && _progUnavailable(c.affected[0], 1, "Image Consultation"),
            durationDays: 1,
        },
        conditionalDrawback: {
            condition: (c) => (c.affected[0]?.stats?.comfort ?? 50) < 40,
            description: "Their comfort < 40 — feels objectified; −10 trust.",
            applyFn: (c) => c.affected[0] && _progBump(c.affected[0], "trust", -10),
        },
        chips: [{ emoji: "💋", label: "Restyled", priority: "mixed", durationDays: 7 }],
    },
];

function runProgram(programId, target = null) {
    const p = PROGRAMS.find((x) => x.id === programId);
    if (!p) return void showNotification("Unknown program.", "error");
    gameState.productivitySystems || (gameState.productivitySystems = {});
    gameState.productivitySystems.programCooldowns || (gameState.productivitySystems.programCooldowns = {});
    if (p.legacy) return void p.run(target); // existing fn handles its own cash/cooldown/notify/save
    const cd = gameState.productivitySystems.programCooldowns,
        today = gameState.currentDay || 0,
        cdKey = "individual" === p.tier && target ? programId + ":" + target : programId;
    // 1-6: validate everything before mutating
    if ((cd[cdKey] || 0) > today)
        return void showNotification(`${p.name} is on cooldown (${(cd[cdKey] || 0) - today}d left).`, "warning");
    if (p.unlockCondition && !p.unlockCondition(gameState))
        return void showNotification(`${p.name} is locked: ${p.unlockReason || "not yet available"}.`, "warning");
    if ("individual" === p.tier) {
        const emp = gameState.employees.find((e) => e.id === target);
        if (!emp || "active" !== emp.employmentStatus) return void showNotification("Select an active employee.", "warning");
        if (p.targetGate) {
            const g = p.targetGate(emp);
            if (!0 !== g) return void showNotification("string" == typeof g ? g : `${emp.name} isn't eligible.`, "warning");
        }
    }
    if ("department" === p.tier && !target) return void showNotification("Select a location.", "warning");
    const affected = _progAffected(p.tier, target);
    if (!affected.length) return void showNotification("No eligible employees for this program.", "warning");
    const cost = Math.floor(p.cost.cashFn({ affected, target, gameState }));
    if (gameState.cash < cost)
        return void showNotification(`Not enough cash — ${p.name} costs $${formatNumber(cost)}.`, "error");
    // committed: mutate
    (gameState.cash -= cost), (cd[cdKey] = today + (p.cost.cooldownDays || 0));
    const ctx = { affected, target, gameState, today, program: p };
    p.benefit && p.benefit.applyFn && p.benefit.applyFn(ctx);
    p.activePenalty && p.activePenalty.applyFn && p.activePenalty.applyFn(ctx);
    p.conditionalDrawback &&
        p.conditionalDrawback.condition(ctx) &&
        p.conditionalDrawback.applyFn &&
        p.conditionalDrawback.applyFn(ctx);
    (p.chips || []).forEach((chip) => affected.forEach((e) => _progChip(e, chip, p)));
    (_cashPerSecondDirty = !0),
        "function" == typeof logCompanyEvent &&
            logCompanyEvent({ type: "program", description: `${p.name} conducted`, sentiment: "neutral", importance: 5 }),
        showNotification(`${p.emoji || "📋"} ${p.name} is now underway.`, "success"),
        saveGame(!1),
        updatePeopleTab(),
        "function" == typeof updateUI && updateUI();
}
window.runProgram = runProgram;

let _programsTierFilter = "all";
function renderProgramsCard() {
    const body = document.getElementById("programsBody");
    if (!body) return;
    const today = gameState.currentDay || 0,
        cds = gameState.productivitySystems?.programCooldowns || {},
        tiers = [
            ["all", "All"],
            ["company", "Company"],
            ["department", "Dept"],
            ["individual", "Individual"],
        ],
        seg = `<div class="seg mb-2" id="programsTierSeg">${tiers
                .map((t) => `<button data-ptier="${t[0]}"${_programsTierFilter === t[0] ? ' class="is-active"' : ""}>${t[1]}</button>`)
                .join("")}</div>`,
        rows = PROGRAMS.filter((p) => "all" === _programsTierFilter || p.tier === _programsTierFilter)
            .map((p) => {
                const locked = p.unlockCondition && !p.unlockCondition(gameState),
                    onCd = !p.legacy && (cds[p.id] || 0) > today,
                    cdLeft = onCd ? (cds[p.id] || 0) - today : 0;
                let cost = "";
                try {
                    cost =
                        p.cost.display ||
                        "$" + formatNumber(Math.floor(p.cost.cashFn({ affected: _progAffected(p.tier, null), target: null, gameState })));
                } catch (e) {}
                let warn = "";
                if ("company" === p.tier && p.conditionalDrawback)
                    try {
                        p.conditionalDrawback.condition({ affected: _progAffected("company", null), gameState, program: p }) &&
                            (warn = `<div class="text-neg fs-xs">⚠️ ${p.conditionalDrawback.description}</div>`);
                    } catch (e) {}
                const btn = locked
                    ? `<button class="btn btn--ghost" disabled title="${p.unlockReason || ""}">🔒 ${p.unlockReason || "Locked"}</button>`
                    : onCd
                      ? `<button class="btn btn--ghost" disabled><span class="num">${cdLeft}</span>d</button>`
                      : `<button class="btn btn--primary" onclick="onProgramRun('${p.id}', this)">Run</button>`;
                return `<div class="prog" data-pid="${p.id}">
            <div class="row-between"><div class="fw-600 fs-sm">${p.emoji} ${p.name}</div><span class="num text-dim fs-xs">${cost}</span></div>
            <div class="text-dim fs-xs">${p.flavor}</div>
            ${warn}
            <div class="row" style="justify-content:flex-end">${btn}</div>
          </div>`;
            })
            .join("");
    (body.innerHTML = seg + `<div class="col" style="max-height:46vh; overflow-y:auto; padding-right:var(--s3)">${rows}</div>`),
        document
            .getElementById("programsTierSeg")
            ?.querySelectorAll("button")
            .forEach((b) => (b.onclick = () => ((_programsTierFilter = b.dataset.ptier), renderProgramsCard())));
}
function onProgramRun(id, btnEl) {
    const p = PROGRAMS.find((x) => x.id === id);
    if (!p) return;
    if ("company" === p.tier) return runProgram(id, null), void renderProgramsCard();
    openProgramTargeting(p, btnEl);
}
function openProgramTargeting(p, btnEl) {
    document.querySelectorAll(".prog-target-menu").forEach((m) => m.remove());
    const wrap = btnEl.parentElement;
    wrap.style.position = "relative";
    let items;
    if ("department" === p.tier) {
        const locs = (gameState.locations || []).filter((l) => l.unlocked || l.owned);
        items =
            locs.map((l) => `<button class="btn btn--ghost" onclick="runProgramTarget('${p.id}','${l.id}')">${l.name || l.id}</button>`).join("") ||
            '<div class="text-dim fs-xs">No locations.</div>';
    } else {
        items =
            `<input class="input mb-1" placeholder="🔍 employee…" oninput="filterProgTargets(this.value)" />` +
            `<div id="progTargetList" class="col" style="gap:2px; max-height:40vh; overflow-y:auto">` +
            _progActive()
                .map((e) => {
                    const elig = !p.targetGate || !0 === p.targetGate(e);
                    return `<button class="btn btn--ghost prog-target-emp" data-nm="${(e.name || "").toLowerCase()}" ${elig ? "" : "disabled"} onclick="runProgramTarget('${p.id}','${e.id}')">${"function" == typeof getColoredName ? getColoredName(e) : e.name}${elig ? "" : " 🔒"}</button>`;
                })
                .join("") +
            `</div>`;
    }
    const menu = document.createElement("div");
    (menu.className = "row-menu prog-target-menu"),
        (menu.style.minWidth = "210px"),
        (menu.innerHTML = items + `<button class="btn btn--ghost" onclick="this.closest('.prog-target-menu').remove()">Cancel</button>`),
        wrap.appendChild(menu);
}
function runProgramTarget(id, target) {
    document.querySelectorAll(".prog-target-menu").forEach((m) => m.remove()), runProgram(id, target), renderProgramsCard();
}
function filterProgTargets(q) {
    q = (q || "").toLowerCase();
    document.querySelectorAll("#progTargetList .prog-target-emp").forEach((b) => (b.style.display = b.dataset.nm.includes(q) ? "" : "none"));
}
(window.onProgramRun = onProgramRun),
    (window.runProgramTarget = runProgramTarget),
    (window.filterProgTargets = filterProgTargets),
    (window.renderProgramsCard = renderProgramsCard);
