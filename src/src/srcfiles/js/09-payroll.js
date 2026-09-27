// ============================================================================
// 09-payroll — Payroll: onHourChange/onDayChange, salary scaling, weekly payroll processing, payroll modal UI, payNow/auto-pay.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function onHourChange(e, t) {
    9 === e && clockInEmployees(),
        17 === e && (clockOutEmployees(), flushSkillWorkDigest()),
        processNpcScheduledEvents(),
        updateEmployeeActivities(),
        updateAllNPCStatuses();
    [6, 7, 8].includes(e) && processMorningWakeUpResponses();
    const n = 36e5,
        a = gameState.time?.currentTime || Date.now();
    gameState.employees.forEach((e) => {
        if (e.chatCommMode && "auto" !== e.chatCommMode) {
            const t = e.lastPlayerMessageTime || 0,
                o = a - t;
            o >= 1728e5 &&
                (debugLog(
                    "Chat",
                    `Resetting ${e.name}'s comm mode to auto (inactive for ${Math.floor(o / n)} hours)`
                ),
                (e.chatCommMode = "auto"));
        }
    }),
        gameState.employees.forEach((e) => {
            e.schedule &&
                e.schedule.isCurrentlyWorking &&
                (accrueWorkHourSkills(e), (e.schedule.hoursWorkedToday += 1));
        }),
        updateTimeDisplay();
}
function onDayChange(e) {
    gameState.employees.forEach((e) => {
        e.schedule && ((e.schedule.hoursWorkedToday = 0), e.schedule.lastClockOut && (e.schedule.daysWorked += 1)),
            cleanupExpiredFlags(e); // expired flags were hidden but never removed from the save
    }),
        5 === e && generateWeekendPlans(),
        5 === e &&
            (gameState.payroll?.autoPayEnabled ? runFridayPayroll() : showPayrollModal(),
            processLoanInterest(),
            processPayrollConsequences(),
            applyFactionWeeklyEffects(),
            generateRaiseRequests(),
            generateAdvanceRequests()),
        e >= 1 && e <= 5 && checkForCompanyEvent(),
        processScheduledEventEffects(),
        1 === e &&
            (gameState.companyEvents && (gameState.companyEvents.eventsThisWeek = 0),
            gameState.payroll || (gameState.payroll = { enabled: !0, autoPayEnabled: !0 }),
            (gameState.payroll.payWeekStart = gameState.time?.currentTime || Date.now())),
        1 === e && updateEmployeePerformanceMetrics(),
        processFlagChains(),
        processNpcRelationshipLifecycle(),
        updateAllNPCStatuses(),
        (gameState.currentDay = gameDayNumber()), // fast-forward runs day changes between ticks
        void 0 !== StoryEngine && StoryEngine.processOngoingEffects && StoryEngine.processOngoingEffects(),
        updateTimeDisplay();
}
function getScaledSalary(e) {
    const t = gameState.prestigeLevel || 0,
        n = Math.pow(1.5, t),
        a = 1 - 0.04 * (gameState.globalUpgrades?.workforce?.payrollConsultants || 0),
        o = 1 - ("function" == typeof getAccountingDiscount ? getAccountingDiscount() : 0);
    return Math.floor(e * n * a * o);
}
function getLocationTierIndex(e) {
    if (!e) return 0;
    const t = (gameState.locations || []).findIndex((t) => t.id === e);
    return t >= 0 ? t : 0;
}
function getProductPayRank(e) {
    if (!e) return 0.5;
    const t = (gameState.products || []).filter((t) => (t.locationId || "garage") === (e.locationId || "garage"));
    if (t.length <= 1) return 0.5;
    const n = t
        .slice()
        .sort((e, t) => (e.unlockCost || 0) - (t.unlockCost || 0))
        .findIndex((t) => t.id === e.id);
    return n < 0 ? 0.5 : n / (t.length - 1);
}
// Market rate = career band (hierarchy base) × location tier band (1.6^tier) × product
// modifier (0.9–1.25 by unlock-cost rank within the location). Computed, never stored.
function getMarketRate(e, t = null) {
    const n = t ?? e?.career?.level ?? 1,
        a = gameState.hierarchyLevels?.[n]?.baseSalary || 1e5;
    if (!e) return a;
    const o = getEmployeeProduct(e),
        i = getLocationTierIndex(o?.locationId || e.locationId),
        s = Math.pow(1.6, i),
        r = o ? 0.9 + 0.35 * getProductPayRank(o) : 1;
    return Math.floor(a * s * r);
}
function processWeeklyPayroll() {
    if (hasAlreadyPaidThisWeek()) return void console.log("[Payroll] Skipped weekly run — already paid this week.");
    gameState.payroll ||
        (gameState.payroll = {
            enabled: !0,
            lastPayday: null,
            totalPaidThisWeek: 0,
            weeklyPayrollHistory: [],
            autoPayEnabled: !0,
            payWeekStart: null,
        });
    gameState.payroll.marketModelSince || (gameState.payroll.marketModelSince = gameState.time?.currentTime || Date.now());
    const e = gameState.employees.filter(
        (e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7
    );
    if (0 === e.length) return void (gameState.payroll.payWeekStart = null);
    const t = gameState.time?.currentTime || Date.now(),
        n = gameState.payroll.payWeekStart || getPayWeekStart(t);
    let a = 0;
    const o = [];
    let i = 0;
    e.forEach((e) => {
        const s = e.career?.salary || 1e5,
            r = getScaledSalary(s),
            l = Math.floor(r / 52),
            c = calculateDaysWorkedThisWeek(e, n, t);
        let d = Math.floor(l * (c / 5));
        if (e.advanceDebt && e.advanceDebt.remaining > 0) {
            const t = Math.min(d, e.advanceDebt.perWeek || d, e.advanceDebt.remaining);
            (d -= t),
                (e.advanceDebt.remaining -= t),
                e.advanceDebt.remaining <= 0 &&
                    ((e.advanceDebt = null), showNotification(`✓ ${e.name}'s salary advance is fully repaid.`, "info"));
        }
        (a += d),
            c < 5 && i++,
            o.push({ name: e.name, baseSalary: s, scaledSalary: r, fullWeeklyPay: l, daysWorked: c, actualPay: d });
    });
    const s = gameState.cash >= a;
    if (s) gameState.cash -= a;
    else {
        const e = Math.max(0, Math.floor(gameState.cash)),
            n = a - e;
        (gameState.cash -= e),
            gameState.payroll.arrears || (gameState.payroll.arrears = { amount: 0, sinceWeekId: null, missedCount: 0 }),
            (gameState.payroll.arrears.amount += n),
            gameState.payroll.arrears.sinceWeekId || (gameState.payroll.arrears.sinceWeekId = getCurrentPayWeekId()),
            gameState.payroll.arrears.missedCount++;
    }
    (gameState.payroll.lastPayday = t),
        (gameState.payroll.totalPaidThisWeek = a),
        gameState.payroll.weeklyPayrollHistory.push({
            date: gameState.payroll.lastPayday,
            amount: a,
            employeeCount: e.length,
            proRatedCount: i,
            hadEnough: s,
        }),
        gameState.payroll.weeklyPayrollHistory.length > 12 && gameState.payroll.weeklyPayrollHistory.shift(),
        (gameState.payroll.payWeekStart = null),
        (gameState.payroll.lastPaidWeek = getCurrentPayWeekId()),
        (gameState.payroll.delayedWeeks = 0);
    const r = formatCash(a),
        l = i > 0 ? ` (${i} pro-rated)` : "";
    s
        ? showNotification(`💰 Weekly Payroll: -${r} (${e.length} employees${l})`, "info")
        : (showNotification(
              `🚨 Payroll shortfall! $${formatNumber(gameState.payroll.arrears?.amount || 0)} in unpaid wages.`,
              "error"
          ),
          console.log(`[Payroll] Shortfall booked to arrears. Cash: $${gameState.cash.toLocaleString()}`)),
        console.log(`[Payroll] Paid ${e.length} employees: $${a.toLocaleString()}${l}`);
        "function" == typeof remember &&
            e.forEach((e) => {
                remember(e, "Payday came through — got paid this week", "event", 1);
            });
}
// Weekly payroll-pressure pass: arrears fallout, underpayment-vs-market ramp,
// chips, feed complaints, attrition. Runs every Friday after the pay step.
function processPayrollConsequences() {
    gameState.payroll || (gameState.payroll = {});
    const e = gameState.time?.currentTime || Date.now(),
        t = gameState.employees.filter(
            (e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7
        );
    if (0 === t.length) return;
    const n = gameState.payroll.arrears;
    if (n && n.amount > 0) {
        t.forEach((e) => {
            e.stats || (e.stats = {}),
                (e.stats.productivity = Math.max(10, (e.stats.productivity || 50) - 15)),
                (e.stats.trust = Math.max(0, (e.stats.trust || 50) - 10)),
                addPayrollChip(e, { key: "unpaid", emoji: "🚫", label: "Unpaid Wages", tone: "debuff", durationDays: 7 });
        }),
            generateFinancialStressPosts(t, "missed_payroll", n.missedCount);
        if (n.missedCount >= 2) {
            const e = Math.min(0.3, 0.08 * n.missedCount) * (gameState.story?.factionEffects?.attritionMult || 1);
            t.forEach((t) => {
                Math.random() < e &&
                    (t.stats?.trust || 50) < 35 &&
                    ((t.employmentStatus = "resigned"),
                    (t.hired = !1),
                    showNotification(`😠 ${t.name} quit over unpaid wages!`, "error"));
            });
        }
    }
    const a = gameState.payroll.marketModelSince || e;
    t.forEach((t) => {
        if (!t.career || "active" !== t.employmentStatus) return;
        const n = t.career.salary || 1e5,
            o = getMarketRate(t);
        if (n < 0.9 * o) {
            t.career.underpaidSince || (t.career.underpaidSince = e);
            const i = Math.floor((e - Math.max(t.career.underpaidSince, a)) / 6048e5);
            t.stats || (t.stats = {}),
                i >= 1 &&
                    ((t.stats.productivity = Math.max(30, (t.stats.productivity || 50) - 3)),
                    addPayrollChip(t, {
                        key: "underpaid",
                        emoji: i >= 8 ? "😤" : "📉",
                        label: i >= 8 ? "One Foot Out" : "Underpaid",
                        tone: i >= 8 ? "debuff" : "mixed",
                        durationDays: 10,
                    })),
                i >= 4 &&
                    ((t.stats.trust = Math.max(0, (t.stats.trust || 50) - 4)),
                    (t.stats.affection = Math.max(0, (t.stats.affection || 50) - 2)),
                    Math.random() < 0.25 && generateFinancialStressPosts([t], "underpaid", 1)),
                i >= 8 &&
                    (t.stats.trust || 50) < 35 &&
                    Math.random() < Math.min(0.25, 0.04 * (i - 7)) * (gameState.story?.factionEffects?.attritionMult || 1) &&
                    ((t.employmentStatus = "resigned"),
                    (t.hired = !1),
                    showNotification(`😤 ${t.name} resigned — chronically underpaid.`, "error"));
        } else t.career.underpaidSince && ((t.career.underpaidSince = null), removePayrollChip(t, "underpaid"));
    });
}
// F2: weekly faction effects that aren't payroll-shaped — reformer demand payoff/drag
// and the underground's grey-market cash (with a small scandal risk). Bounded.
function applyFactionWeeklyEffects() {
    const fe = gameState.story?.factionEffects;
    if (!fe || "function" != typeof isStoryEnabled || !isStoryEnabled()) return;
    const active = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus);
    if (fe.reformerDemand?.active)
        fe.reformerDemand.met
            ? (gameState.story.reputationScore = Math.min(100, (gameState.story.reputationScore || 50) + 2))
            : active.forEach((e) => {
                  e.stats && (e.stats.comfort = Math.max(0, (e.stats.comfort || 60) - 3));
              });
    if (fe.underground?.active && Math.random() < 0.5) {
        const size = gameState.story.factions?.underground?.strength || 1,
            gain = 500 * size * (gameState.story.currentAct || 1);
        (gameState.cash = (gameState.cash || 0) + gain),
            "function" == typeof showNotification &&
                showNotification(`🌑 An off-the-books deal nets ${formatCash(gain)}.`, "info");
        Math.random() < 0.15 &&
            ((gameState.story.reputationScore = Math.max(0, (gameState.story.reputationScore || 50) - 5)),
            void 0 !== StoryEngine &&
                StoryEngine.addJournalEntry({
                    title: "🌑 Whispers of a Scandal",
                    content:
                        "One of the underground's deals left a trail. Nothing proven — yet. Your reputation takes a quiet hit.",
                    type: "faction",
                    memorable: !0,
                }));
    }
}
function generateFinancialStressPosts(e, t = "missed_payroll", n = 1) {
    if (!e || 0 === e.length || "function" != typeof createSocialPost) return;
    const a = {
            missed_payroll: [
                "Direct deposit said 'pending.' It has been 'pending' since Friday.",
                "Fun fact: my landlord does not accept 'pending.'",
                "Updating my resume on my lunch break. The lunch I packed. From home.",
                "Payroll is 'being processed.' So is my patience.",
                "Day three of pretending the paycheck is just fashionably late.",
            ],
            underpaid: [
                "checked the market rate for my job today. interesting.",
                "love what I do. wish what I do loved me back financially.",
                "Recruiter DMs are starting to look... compelling.",
                "Performance review: exceeds expectations. Paycheck: declines comment.",
            ],
            debt_collectors: [
                "There is a man in the lobby with a flamingo lapel pin and he is *smiling*.",
                "Why does the 'Client Success Manager' know my badge number?",
                "The office paperweights are disappearing one meeting at a time.",
                "Saw the company's lender's car outside. It's nicer than the company.",
            ],
        }[t] || ["Thinking a lot about compensation lately."],
        o = Math.min(3, Math.max(1, Math.floor(e.length / 3) + (n >= 2 ? 1 : 0))),
        i = [...e].sort(() => Math.random() - 0.5).slice(0, o),
        s = gameState.time?.currentTime || Date.now();
    i.forEach((e, t) => {
        let o = a[Math.floor(Math.random() * a.length)],
            r = [];
        n >= 2 &&
            t > 0 &&
            ((o = `@${i[0].name} said it best. The books are 'fine,' apparently. So where's the money?`),
            (r = [i[0].name]));
        createSocialPost({
            authorId: e.id,
            authorName: e.name,
            type: "complaint",
            content: o,
            timestamp: s + 3e4 * t,
            likes: [],
            comments: [],
            mentions: r,
            mood: "frustrated",
            tags: ["payroll", "worklife"],
        });
    });
}
async function generateRaiseReactionPost(e, t, n = "grateful") {
    if ("function" != typeof createSocialPost || "function" != typeof queuedGenerateText) return;
    const o = e.personality || {},
        s = e.stats?.affection || 50,
        r = e.intimacy || 0,
        grateful = "grateful" === n,
        amt = "number" == typeof t && t > 0 ? `$${formatNumber(t)} ` : "",
        voice = [
            personalityToText(o.outgoing || 50, "outgoing"),
            personalityToText(o.professional || 50, "professional"),
            personalityToText(o.flirty || 50, "flirty"),
            personalityToText(o.confidence || 50, "confident"),
            personalityToText(o.humor || 50, "humorous"),
        ].join(", "),
        canSpicy =
            grateful &&
            ("function" != typeof isSFWMode || !isSFWMode()) &&
            (o.flirty || 50) > 55 &&
            s > 55 &&
            r > 40,
        c = Math.random();
    let tone,
        explicitLevel = 0;
    grateful
        ? canSpicy && c < 0.2
            ? ((tone =
                  'flirty and sexually suggestive about how you intend to "thank" @TheBoss for the raise — bold, adult, and in your own voice'),
              (explicitLevel = 2))
            : (o.flirty || 50) > 50 && s > 60 && c < 0.4
              ? (tone = "playful and a little flirty, teasing @TheBoss about the raise")
              : c < 0.68
                ? (tone = "genuinely grateful, maybe a touch emotional about being recognized")
                : c < 0.88
                  ? (tone =
                        "excited and a bit braggy — you earned this; maybe mention what you'll do with the extra money")
                  : (tone = "dry, witty, or chaotic — an unexpected creative take on getting a raise")
        : (tone = "muted and a little uncertain, processing some compensation news");
    const prompt = `You are ${e.name}, a ${e.age || 25}-year-old ${
            "Male" === e.gender ? "man" : "woman"
        } posting on social media.\n\nYour personality: ${voice}\nYour affection toward your boss: ${s}/100\n${
            r > 30 ? `Your intimacy level with boss: ${r}/100 (close/flirty)` : ""
        }\n\n💰 SITUATION: You just got a ${amt}RAISE (a higher salary) at your job${
            grateful ? "" : " — though it's complicated"
        }!\n\nWrite a post that is ${tone}. 1-2 sentences. Sound like a real person on social media.\n\nRULES:\n- Write ONLY the post text, nothing else\n- 1-2 emojis max\n- NO hashtags\n- NO meta-commentary or explanations\n\nWrite ONLY the post:`;
    try {
        let a = await queuedGenerateText(
            prompt,
            { temperature: 0.95, max_tokens: 100, stopSequences: ["\n\n", "---", "Rating:", "(Note:"] },
            `Generating raise reaction post for ${e.name}`
        );
        (a = extractText(a)),
            (a = a.replace(/\{[A-Z]+:[^}]*\}\s*/g, "")),
            (a = a.replace(/^\*\*[^*]+\*\*\s*/g, "")),
            (a = a.split(/\n\s*\(/)[0].trim()),
            (a = a.replace(/\b(the\s+)?([Mm]y\s+)?([Oo]ur\s+)?[Bb]oss\b/g, "@TheBoss")),
            (a = a.replace(/@@TheBoss/g, "@TheBoss")),
            (a = a.replace(/@[Bb]oss\b/g, "@TheBoss")),
            "function" == typeof cleanWithLearning && (a = cleanWithLearning(a));
        if (!a || a.length < 2) return;
        createSocialPost({
            authorId: e.id,
            authorName: e.name,
            type: explicitLevel > 0 ? "lewd" : "appreciation",
            content: a,
            timestamp: gameState.time?.currentTime || Date.now(),
            likes: [],
            comments: [],
            mentions: a.includes("@TheBoss") ? ["TheBoss"] : [],
            mood: "excited",
            tags: ["raise", "grateful", "worklife"],
            explicitLevel: explicitLevel,
            nsfwLevel: explicitLevel,
        });
    } catch (a) {
        console.error("[AI] Raise post generation failed - discarding post:", a);
    }
}
function getPayWeekStart(e) {
    const t = new Date(e),
        n = t.getDay(),
        a = 0 === n ? 6 : n - 1;
    return t.setDate(t.getDate() - a), t.setHours(0, 0, 0, 0), t.getTime();
}
function calculateDaysWorkedThisWeek(e, t, n) {
    const a = e.hireDate || 0,
        o = Math.max(t, a),
        i = new Date(o),
        s = new Date(n);
    let r = 0;
    const l = new Date(i);
    for (l.setHours(12, 0, 0, 0); l <= s; ) {
        const e = l.getDay();
        e >= 1 && e <= 5 && r++, l.setDate(l.getDate() + 1);
    }
    return Math.min(5, r);
}
function getWeeklyPayroll(e = !1) {
    const t = gameState.employees.filter(
        (e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7
    );
    let n = 0;
    const a = gameState.time?.currentTime || Date.now(),
        o = gameState.payroll?.payWeekStart || getPayWeekStart(a);
    return (
        t.forEach((t) => {
            const i = getScaledSalary(t.career?.salary || 1e5),
                s = Math.floor(i / 52);
            if (e) {
                const e = calculateDaysWorkedThisWeek(t, o, a);
                n += Math.floor(s * (e / 5));
            } else n += s;
        }),
        n
    );
}
function getPayrollBreakdown() {
    const e = gameState.employees.filter(
            (e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7
        ),
        t = gameState.time?.currentTime || Date.now(),
        n = gameState.payroll?.payWeekStart || getPayWeekStart(t);
    return e.map((e) => {
        const a = e.career?.salary || 1e5,
            o = getScaledSalary(a),
            i = Math.floor(o / 52),
            s = calculateDaysWorkedThisWeek(e, n, t);
        return {
            employee: e,
            baseSalary: a,
            scaledSalary: o,
            fullWeeklyPay: i,
            daysWorked: s,
            proRatedPay: Math.floor(i * (s / 5)),
            isProRated: s < 5,
        };
    });
}
function showPayrollModal() {
    const e = getWeeklyPayroll(!0),
        t = getWeeklyPayroll(!1),
        n = getPayrollBreakdown(),
        a = n.filter((e) => e.isProRated).length,
        o = gameState.cash >= e,
        i = n.length;
    if (0 === i) return;
    const s = Math.floor(0.1 * e),
        r = t - e;
    let l = "";
    if (a > 0) {
        l = `<div class="neg-quote"><div class="text-gold fw-600 mb-1">📋 Pro-Rated Pay (${a} employee${a > 1 ? "s" : ""})</div>${n
                .filter((e) => e.isProRated)
                .slice(0, 3)
                .map(
                    (e) =>
                        `<div class="row-between fs-sm"><span>${e.employee.name}</span><span class="text-pos num">${e.daysWorked}/5 days → $${formatNumber(e.proRatedPay)}</span></div>`
                )
                .join("")}${a > 3 ? `<div class="fs-xs text-mute mt-1">…and ${a - 3} more</div>` : ""}<div class="text-pos fs-sm mt-1 num">💰 You save $${formatNumber(r)} this week</div></div>`;
    }
    const c = document.getElementById("payrollModal");
    c && c.remove();
    const d = document.createElement("div");
    (d.id = "payrollModal"),
        (d.className = "fuoc-ui neg-overlay"),
        (d.innerHTML = `
        <div class="neg-modal">
          <div class="neg-head">
            <div class="neg-id">
              <div class="neg-name">💰 Friday Payday</div>
              <div class="neg-meta">Time to pay your ${i} employee${i > 1 ? "s" : ""}</div>
            </div>
          </div>
          ${l}
          <div class="neg-refs">
            <div class="neg-ref"><span class="t">Payroll due</span><span class="num text-neg">$${formatNumber(e)}${a > 0 ? ` <span class="fs-xs text-mute">(full wk $${formatNumber(t)})</span>` : ""}</span></div>
            <div class="neg-ref"><span class="t">Your cash</span><span class="num ${o ? "text-pos" : "text-neg"}">$${formatNumber(gameState.cash)}</span></div>
          </div>
          ${o ? "" : '<div class="neg-preview text-neg">⚠️ You can\'t afford payroll. Take a loan, delay it, or let the shortfall go to arrears.</div>'}
          <div class="neg-actions" style="flex-direction: column;">
            <button onclick="payNowFromModal()" ${o ? "" : "disabled"} class="btn btn--lg btn--primary w-full">✓ Pay Now ($${formatNumber(e)})</button>
            <button onclick="payEarlyBonusFromModal()" ${gameState.cash < e + s ? "disabled" : ""} class="btn btn--lg btn--outline w-full">🎁 Pay + 10% Bonus ($${formatNumber(e + s)})</button>
            <button onclick="delayPayroll()" class="btn btn--lg btn--danger w-full">⏰ Delay Payment</button>
            <button onclick="openLoanFromPayroll()" class="btn btn--lg btn--ghost w-full">🏦 Take Out a Loan First</button>
          </div>
        </div>`),
        document.body.appendChild(d);
}
function closePayrollModal() {
    const e = document.getElementById("payrollModal");
    e && e.remove();
}
function payNowFromModal() {
    processWeeklyPayroll(), closePayrollModal();
}
function payEarlyBonusFromModal() {
    const e = getWeeklyPayroll(!0),
        t = Math.floor(0.1 * e);
    processWeeklyPayroll(), (gameState.cash -= t);
    const n = gameState.employees.filter(
        (e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7
    );
    n.forEach((e) => {
        e.stats || (e.stats = {}),
            (e.stats.affection = Math.min(100, (e.stats.affection || 50) + 10)),
            (e.stats.productivity = Math.min(100, (e.stats.productivity || 50) + 5)),
            (e.stats.trust = Math.min(100, (e.stats.trust || 50) + 5));
    });
    const a = n.length > 0 ? Math.floor(t / n.length) : 0;
    a >= 500 && generateBonusSocialPosts(n, a, "payday_bonus"),
        showNotification(`🎁 Paid bonus of $${formatNumber(t)}! Employees are thrilled!`, "success"),
        closePayrollModal();
}
function delayPayroll() {
    gameState.payroll || (gameState.payroll = {}),
        (gameState.payroll.delayedWeeks = (gameState.payroll.delayedWeeks || 0) + 1);
    const e = gameState.payroll.delayedWeeks,
        t = gameState.employees.filter(
            (e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7
        );
    t.forEach((t) => {
        t.stats || (t.stats = {}),
            (t.stats.productivity = Math.max(10, (t.stats.productivity || 50) - 10 * e)),
            (t.stats.affection = Math.max(0, (t.stats.affection || 50) - 5 * e)),
            (t.stats.trust = Math.max(0, (t.stats.trust || 50) - 8 * e));
    });
    let n = "";
    1 === e
        ? (n = "⚠️ Employees are grumbling about late pay. Productivity -10%.")
        : 2 === e
          ? (n = "😠 Employees are angry! Productivity -20%, morale dropping.")
          : e >= 3 &&
            ((n = "🚨 CRITICAL: Employees may start quitting! Pay them immediately!"),
            t.forEach((t) => {
                Math.random() < 0.15 * (e - 2) &&
                    ((t.employmentStatus = "resigned"),
                    (t.hired = !1),
                    showNotification(`😤 ${t.name} quit due to unpaid wages!`, "error"));
            })),
        showNotification(n, e >= 3 ? "error" : "warning"),
        closePayrollModal(),
        updatePayrollTab();
}
function openLoanFromPayroll() {
    closePayrollModal(), switchTab("payroll");
}
async function payNow() {
    const e = gameState.payroll?.delayedWeeks || 0,
        n = gameState.payroll?.arrears?.amount || 0,
        t = n + (e > 0 ? getWeeklyPayroll() * e : 0);
    if (t <= 0) return;
    if (gameState.cash < t)
        return void showNotification(`❌ Need $${formatNumber(t)} to pay all owed wages!`, "error");
    if (
        await showConfirm(`Pay all owed wages?\n\nTotal: $${formatNumber(t)}`, "Clear Payroll Debt", {
            type: "warning",
            confirmText: "Pay All",
        })
    ) {
        if (gameState.cash < t)
            return void showNotification(`❌ No longer have enough cash ($${formatNumber(t)} needed)!`, "error");
        (gameState.cash -= t),
            (gameState.payroll.delayedWeeks = 0),
            gameState.payroll.arrears && (gameState.payroll.arrears = { amount: 0, sinceWeekId: null, missedCount: 0 });
        gameState.employees
            .filter((e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7)
            .forEach((e) => {
                e.stats || (e.stats = {}),
                    (e.stats.productivity = Math.min(100, (e.stats.productivity || 50) + 5)),
                    (e.stats.trust = Math.min(100, (e.stats.trust || 50) + 3)),
                    removePayrollChip(e, "unpaid");
            }),
            showNotification(`✓ Paid $${formatNumber(t)} in back wages. Employees relieved.`, "success"),
            updatePayrollTab();
    }
}
function getCurrentPayWeekId() {
    const e = gameState.time?.currentTime || Date.now(),
        t = new Date(e),
        n = t.getDay(),
        a = t.getDate() - n + (0 === n ? -6 : 1),
        o = new Date(t.setDate(a)),
        i = o.getFullYear();
    return `${i}-W${Math.ceil(((o - new Date(i, 0, 1)) / 864e5 + 1) / 7)
            .toString()
            .padStart(2, "0")}`;
}
function hasAlreadyPaidThisWeek() {
    if (!gameState.payroll) return !1;
    const e = getCurrentPayWeekId();
    return gameState.payroll.lastPaidWeek === e;
}
async function payEarlyBonus() {
    if (hasAlreadyPaidThisWeek())
        return void showNotification("⚠️ Payroll already paid this week! Wait until next Monday.", "warning");
    const e = getWeeklyPayroll(),
        t = Math.floor(0.1 * e),
        n = e + t;
    if (e <= 0) return void showNotification("ℹ️ No employees to pay!", "info");
    if (gameState.cash < n)
        return void showNotification(`❌ Need $${formatNumber(n)} for payroll + bonus!`, "error");
    if (
        await showConfirm(
            `Pay this week's salaries early with a 10% bonus?\n\nPayroll: $${formatNumber(e)}\nBonus: $${formatNumber(t)}\nTotal: $${formatNumber(n)}\n\n+10 Affection, +5 Productivity for all employees!`,
            "Early Bonus Payment",
            { type: "info", confirmText: "Pay Bonus" }
        )
    ) {
        if (gameState.cash < n)
            return void showNotification(`❌ No longer have enough cash ($${formatNumber(n)} needed)!`, "error");
        (gameState.cash -= n),
            gameState.payroll || (gameState.payroll = {}),
            (gameState.payroll.lastPaidWeek = getCurrentPayWeekId()),
            (gameState.payroll.lastPayday = gameState.time?.currentTime || Date.now());
        const e = gameState.employees.filter(
            (e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7
        );
        e.forEach((e) => {
            e.stats || (e.stats = {}),
                (e.stats.affection = Math.min(100, (e.stats.affection || 50) + 10)),
                (e.stats.productivity = Math.min(100, (e.stats.productivity || 50) + 5)),
                (e.stats.trust = Math.min(100, (e.stats.trust || 50) + 5));
        }),
            gameState.payroll.weeklyPayrollHistory || (gameState.payroll.weeklyPayrollHistory = []),
            gameState.payroll.weeklyPayrollHistory.push({
                date: gameState.payroll.lastPayday,
                amount: n,
                employeeCount: e.length,
                hadEnough: !0,
                wasEarlyBonus: !0,
            }),
            showNotification("🎁 Paid early bonus! Employees love you!", "success"),
            updatePayrollTab();
    }
}
function toggleAutoPay() {
    gameState.payroll || (gameState.payroll = {}),
        (gameState.payroll.autoPayEnabled = !gameState.payroll.autoPayEnabled);
    const e = document.getElementById("payrollAutoPay");
    e && (e.checked = gameState.payroll.autoPayEnabled),
        showNotification(
            gameState.payroll.autoPayEnabled
                ? "✓ Auto-pay enabled. Payroll will be automatic on Fridays."
                : "⚠️ Auto-pay disabled. You'll need to manually pay each Friday.",
            gameState.payroll.autoPayEnabled ? "success" : "warning"
        );
}
