// ============================================================================
// 12-raises — Salary advances, raise requests, raise negotiation, bonus pool, updatePayrollTab.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function generateAdvanceRequests() {
    gameState.salaryAdvances || (gameState.salaryAdvances = []);
    const e = gameState.time?.currentTime || Date.now();
    if (
        ((gameState.salaryAdvances = gameState.salaryAdvances.filter((t) => e - t.requestedAt < 6048e5)),
        gameState.salaryAdvances.length >= 2)
    )
        return;
    const t = gameState.employees.filter(
        (t) =>
            t.hired &&
            "active" === t.employmentStatus &&
            (t.career?.level || 1) < 7 &&
            !(t.advanceDebt && t.advanceDebt.remaining > 0) &&
            !gameState.salaryAdvances.some((e) => e.employeeId === t.id) &&
            Math.random() < 0.04 + Math.max(0, 50 - (t.stats?.comfort || 50)) / 1e3
    );
    if (0 === t.length) return;
    const n = t[Math.floor(Math.random() * t.length)],
        a = 1 + Math.floor(3 * Math.random()),
        o = Math.floor(getScaledSalary(n.career?.salary || 1e5) / 52) * a,
        i = [
            "Car made a sound. The expensive kind.",
            "Rent went up. My landlord cited 'the economy.'",
            "Family thing. I'd rather not get into it.",
            "Vet bills. He's fine now. He'd better be.",
            "My water heater has opinions about being alive.",
        ];
    gameState.salaryAdvances.push({
        id: `adv_${Date.now()}`,
        employeeId: n.id,
        employeeName: n.name,
        weeks: a,
        amount: o,
        reason: i[Math.floor(Math.random() * i.length)],
        requestedAt: e,
    }),
        showNotification(`💸 ${n.name} is asking for a ${a}-week salary advance.`, "info"),
        updatePayrollTab();
}
function approveAdvance(e, t = null) {
    const n = gameState.salaryAdvances?.find((t) => t.id === e);
    if (!n) return;
    const a = gameState.employees.find((e) => e.id === n.employeeId);
    if (!a) return void (gameState.salaryAdvances = gameState.salaryAdvances.filter((t) => t.id !== e));
    const o = Math.max(0, t ?? n.amount);
    if (o <= 0) return;
    if (gameState.cash < o) return void showNotification(`❌ Need $${formatNumber(o)} on hand for the advance.`, "error");
    (gameState.cash -= o),
        (a.advanceDebt = {
            remaining: (a.advanceDebt?.remaining || 0) + o,
            perWeek: Math.max(1, Math.ceil(o / (2 * n.weeks))),
        }),
        a.stats || (a.stats = {});
    const i = o >= n.amount;
    (a.stats.trust = Math.min(100, (a.stats.trust || 50) + (i ? 8 : 4))),
        (a.stats.affection = Math.min(100, (a.stats.affection || 50) + (i ? 5 : 2))),
        (a.advanceDenials = 0),
        (gameState.salaryAdvances = gameState.salaryAdvances.filter((t) => t.id !== e)),
        showNotification(
            i
                ? `✓ Advanced ${a.name} $${formatNumber(o)} — repaid via payroll over ${2 * n.weeks} weeks.`
                : `✓ Advanced ${a.name} $${formatNumber(o)} (less than asked). They'll manage.`,
            "success"
        ),
        updatePayrollTab();
}
async function denyAdvance(e) {
    const t = gameState.salaryAdvances?.find((t) => t.id === e);
    if (!t) return;
    const n = gameState.employees.find((e) => e.id === t.employeeId);
    (gameState.salaryAdvances = gameState.salaryAdvances.filter((t) => t.id !== e)),
        n &&
            (n.stats || (n.stats = {}),
            (n.advanceDenials = (n.advanceDenials || 0) + 1),
            (n.stats.trust = Math.max(0, (n.stats.trust || 50) - 5)),
            n.advanceDenials >= 3 &&
                ((n.stats.trust = Math.max(0, n.stats.trust - 10)),
                addPayrollChip(n, { key: "strapped", emoji: "💸", label: "Strapped", tone: "debuff", durationDays: 21 }),
                generateFinancialStressPosts([n], "underpaid", 1))),
        showNotification(`❌ Denied ${t.employeeName}'s advance request.`, "warning"),
        updatePayrollTab();
}
function negotiateAdvance(e) {
    const t = gameState.salaryAdvances?.find((t) => t.id === e);
    if (!t) return;
    _loanModal(
        `
          <div class="neg-head">
            <div class="neg-id">
              <div class="neg-name">💸 Salary Advance — ${t.employeeName}</div>
              <div class="neg-meta">"${t.reason}"</div>
            </div>
            <button class="btn btn--ghost neg-x" onclick="closeLoanProductModal()">✕</button>
          </div>
          <div class="neg-refs">
            <div class="neg-ref"><span class="t">Asking</span><span class="num">$${formatNumber(t.amount)}</span></div>
            <div class="neg-ref"><span class="t">Repayment</span><span class="num">${2 * t.weeks} wk deductions</span></div>
          </div>
          <label class="neg-field"><span class="t">Advance ($)</span><input type="number" id="advAmount" inputmode="numeric" min="0" step="100" value="${t.amount}"></label>
          <div class="neg-actions">
            <button class="btn btn--primary" id="advConfirm">Advance</button>
            <button class="btn btn--ghost" onclick="closeLoanProductModal()">Cancel</button>
          </div>`,
        (n) => {
            n.querySelector("#advConfirm").onclick = () => {
                const t = parseInt(document.getElementById("advAmount")?.value, 10) || 0;
                closeLoanProductModal(), approveAdvance(e, t);
            };
        }
    );
}
function generateRaiseRequests() {
    gameState.raiseRequests || (gameState.raiseRequests = []);
    const e = gameState.time?.currentTime || Date.now();
    gameState.raiseRequests
        .filter((t) => e - t.requestedAt >= 6048e5)
        .forEach((t) => {
            const n = gameState.employees.find((e) => e.id === t.employeeId);
            n &&
                n.hired &&
                (n.stats || (n.stats = {}),
                (n.stats.trust = Math.max(0, (n.stats.trust || 50) - 5)),
                showNotification(`😕 ${t.employeeName}'s raise request expired unanswered.`, "warning"));
        });
    if (
        ((gameState.raiseRequests = gameState.raiseRequests.filter((t) => e - t.requestedAt < 6048e5)),
        gameState.raiseRequests.length >= 3)
    )
        return;
    const t = gameState.employees.filter(
        (e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7
    );
    if (0 === t.length) return;
    const n = t.filter((t) => {
        if (gameState.raiseRequests.some((e) => e.employeeId === t.id)) return !1;
        if (t.raiseCooldownUntil && e < t.raiseCooldownUntil) return !1;
        const n = t.performanceScore || 50,
            a = t.hireDate || Date.now(),
            o = 0.1 + n / 500 + 0.02 * Math.floor((e - a) / 6048e5);
        return Math.random() < o;
    });
    if (0 === n.length) return;
    const a = n[Math.floor(Math.random() * n.length)],
        o = a.career?.salary || 1e5,
        marketGapPct = Math.max(0, ((getMarketRate(a) - o) / o) * 100),
        i = Math.min(50, Math.max(10 + Math.floor(15 * Math.random()) + (a.nextRaiseBump || 0), Math.floor(marketGapPct / 2))),
        s = Math.floor(o * (i / 100)),
        r = [
            "I've been working really hard lately and feel I deserve more.",
            "I've taken on additional responsibilities and would like my salary to reflect that.",
            "I've been here a while now and think it's time for a raise.",
            "I got an offer from another company... but I'd rather stay here if the pay is right.",
            "With my performance lately, I think I've earned a bump.",
            "The cost of living has gone up and I need a little more to get by.",
        ],
        l = {
            id: `raise_${Date.now()}`,
            employeeId: a.id,
            employeeName: a.name,
            currentSalary: o,
            requestedRaise: s,
            raisePercent: i,
            reason: r[Math.floor(Math.random() * r.length)],
            requestedAt: e,
        };
    gameState.raiseRequests.push(l),
        showNotification(`📝 ${a.name} is requesting a raise!`, "info"),
        updatePayrollTab();
}
async function approveRaise(e) {
    const t = gameState.raiseRequests?.find((t) => t.id === e);
    if (!t) return;
    const n = gameState.employees.find((e) => e.id === t.employeeId);
    if (!n) return;
    (await showConfirm(
        `Approve ${t.employeeName}'s raise request?\n\nCurrent: $${formatNumber(t.currentSalary)}/year\nNew: $${formatNumber(t.currentSalary + t.requestedRaise)}/year\n(+${t.raisePercent}%)`,
        "Approve Raise",
        { type: "info", confirmText: "Approve" }
    )) &&
        ((n.career.salary = t.currentSalary + t.requestedRaise),
        n.stats || (n.stats = {}),
        (n.stats.affection = Math.min(100, (n.stats.affection || 50) + 15)),
        (n.stats.trust = Math.min(100, (n.stats.trust || 50) + 10)),
        (n.stats.productivity = Math.min(100, (n.stats.productivity || 50) + 5)),
        (n.nextRaiseBump = 0),
        (n.raiseCooldownUntil = (gameState.time?.currentTime || Date.now()) + 24192e5),
        (n.career.salary || 1e5) >= 0.95 * getMarketRate(n) && removePayrollChip(n, "underpaid"),
        (gameState.raiseRequests = gameState.raiseRequests.filter((t) => t.id !== e)),
        showNotification(`✓ ${t.employeeName}'s raise approved! They're thrilled!`, "success"),
        updatePayrollTab());
}
async function denyRaise(e) {
    const t = gameState.raiseRequests?.find((t) => t.id === e);
    if (!t) return;
    const n = gameState.employees.find((e) => e.id === t.employeeId);
    if (!n) return;
    (await showConfirm(
        `Deny ${t.employeeName}'s raise request?\n\nThis will hurt their morale and they may become less productive.`,
        "Deny Raise",
        { type: "danger", confirmText: "Deny" }
    )) &&
        (n.stats || (n.stats = {}),
        (n.stats.affection = Math.max(0, (n.stats.affection || 50) - 10)),
        (n.stats.trust = Math.max(0, (n.stats.trust || 50) - 15)),
        (n.stats.productivity = Math.max(20, (n.stats.productivity || 50) - 10)),
        addPayrollChip(n, { key: "passedover", emoji: "😒", label: "Passed Over", tone: "debuff", durationDays: 14 }),
        (n.nextRaiseBump = (n.nextRaiseBump || 0) + 5),
        (n.raiseCooldownUntil = (gameState.time?.currentTime || Date.now()) + 12096e5),
        (gameState.raiseRequests = gameState.raiseRequests.filter((t) => t.id !== e)),
        showNotification(`❌ ${t.employeeName}'s raise denied. They're disappointed.`, "warning"),
        updatePayrollTab());
}
function counterOfferRaise(e) {
    const t = gameState.raiseRequests?.find((t) => t.id === e);
    t && openRaiseNegotiation(t.employeeId, e);
}
function addPayrollChip(e, t) {
    if (!e) return;
    e.flags || (e.flags = { systemFlags: [], customFlags: [] }), Array.isArray(e.flags.customFlags) || (e.flags.customFlags = []);
    const n = gameState.time?.currentTime ?? Date.now(),
        a = n + t.durationDays * 864e5;
    (e.flags.customFlags = e.flags.customFlags.filter((e) => !("payroll" === e.category && e.key === "payroll:" + t.key))),
        e.flags.customFlags.push({
            id: "function" == typeof generateFlagId ? generateFlagId() : "pf" + Date.now() + Math.random(),
            key: "payroll:" + t.key,
            category: "payroll",
            source: "payroll",
            setBy: "payroll",
            emoji: t.emoji,
            playerDescription: t.label,
            priority: "medium",
            affectsContext: !1,
            setDate: n,
            timestamp: n,
            duration: t.durationDays * 864e5,
            expirationDate: a,
            autoRemove: a,
            metadata: { tone: t.tone, programName: "Payroll" },
        });
}
function removePayrollChip(e, t) {
    e?.flags?.customFlags &&
        (e.flags.customFlags = e.flags.customFlags.filter((e) => !("payroll" === e.category && e.key === "payroll:" + t)));
}
let _negCtx = null;
function openRaiseNegotiation(e, t = null) {
    const n = gameState.employees.find((t) => t.id === e);
    if (!n || !n.career) return;
    const a = t ? gameState.raiseRequests?.find((e) => e.id === t) : null,
        o = n.career.salary || 1e5,
        i = getMarketRate(n),
        s = a ? a.requestedRaise : Math.max(Math.max(0, i - o), Math.floor(0.05 * o));
    closeRaiseNegotiation(), (_negCtx = { employeeId: e, requestId: t });
    const r = gameState.hierarchyLevels?.[n.career.level || 1] || {},
        l = n.profileImage
            ? `<img class="avatar-sm" src="${n.profileImage}">`
            : `<div class="avatar-sm init" style="--lvl:${r.color || "var(--accent)"}">${(n.name || "?").charAt(0).toUpperCase()}</div>`,
        c = getEmployeeProduct(n),
        d = gameState.locations?.find((e) => e.id === (c?.locationId || n.locationId)),
        p = document.createElement("div");
    (p.id = "raiseNegModal"),
        (p.className = "fuoc-ui neg-overlay"),
        (p.innerHTML = `
        <div class="neg-modal">
          <div class="neg-head">
            ${l}
            <div class="neg-id">
              <div class="neg-name">${n.name}</div>
              <div class="neg-meta">${r.title || n.career.title || "Staff"}${d ? " · " + d.name.replace(/^\S+\s/, "") : ""}</div>
            </div>
            <button class="btn btn--ghost neg-x" onclick="closeRaiseNegotiation()">✕</button>
          </div>
          ${a ? `<div class="neg-quote">"${a.reason}"</div>` : ""}
          <div class="neg-refs">
            <div class="neg-ref"><span class="t">Current</span><span class="num">$${formatNumber(o)}</span></div>
            <div class="neg-ref"><span class="t">Market</span><span class="num">$${formatNumber(i)}</span></div>
            ${a ? `<div class="neg-ref"><span class="t">Asking</span><span class="num">+$${formatNumber(a.requestedRaise)}</span></div>` : ""}
          </div>
          <div class="neg-inputs">
            <label class="neg-field"><span class="t">Raise ($/yr)</span><input type="number" id="negAmount" inputmode="numeric" min="0" step="100" value="${s}"></label>
            <label class="neg-field"><span class="t">Raise (%)</span><input type="number" id="negPercent" inputmode="decimal" min="0" step="0.5" value="${o > 0 ? Math.round((s / o) * 1e3) / 10 : 0}"></label>
          </div>
          <div class="neg-preview" id="negPreview"></div>
          <div class="neg-actions">
            <button class="btn btn--primary" id="negOfferBtn">Offer</button>
            ${a ? '<button class="btn btn--outline" id="negDeclineBtn">Decline</button>' : ""}
            <button class="btn btn--ghost" onclick="closeRaiseNegotiation()">Cancel</button>
          </div>
        </div>`),
        document.body.appendChild(p);
    const m = p.querySelector("#negAmount"),
        u = p.querySelector("#negPercent");
    m.addEventListener("input", () => {
        const e = parseInt(m.value, 10) || 0;
        (u.value = o > 0 ? Math.round((e / o) * 1e3) / 10 : 0), updateNegPreview();
    }),
        u.addEventListener("input", () => {
            const e = parseFloat(u.value) || 0;
            (m.value = Math.floor(o * (e / 100))), updateNegPreview();
        }),
        (p.querySelector("#negOfferBtn").onclick = () => resolveRaiseOffer()),
        a && (p.querySelector("#negDeclineBtn").onclick = () => declineRaiseFromNegotiation()),
        updateNegPreview();
}
function closeRaiseNegotiation() {
    _negCtx = null;
    const e = document.getElementById("raiseNegModal");
    e && e.remove();
}
function raiseAcceptChance(e, t, n) {
    if (!t || n >= (t.requestedRaise || 0)) return 1;
    const a = t.requestedRaise > 0 ? n / t.requestedRaise : 1,
        o = (((e.stats?.trust ?? 50) - 50) / 50) * 0.1;
    return Math.max(0.05, Math.min(1, 0.15 + 0.9 * a + o));
}
function updateNegPreview() {
    if (!_negCtx) return;
    const e = gameState.employees.find((e) => e.id === _negCtx.employeeId),
        t = _negCtx.requestId ? gameState.raiseRequests?.find((e) => e.id === _negCtx.requestId) : null,
        n = document.getElementById("negPreview");
    if (!e || !n) return;
    const a = parseInt(document.getElementById("negAmount")?.value, 10) || 0,
        o = e.career.salary || 1e5,
        i = getMarketRate(e),
        s = (o + a) / Math.max(1, i),
        r = raiseAcceptChance(e, t, a);
    let l, c;
    s >= 1.15
        ? ((l = '<span class="pos">Above market — generous</span>'), (c = "Trust ++ · Affection + · loyalty boost"))
        : s >= 0.95
          ? ((l = '<span class="pos">Fair — at market</span>'), (c = "Trust + · Affection + · stable"))
          : ((l = '<span class="mid">Below market</span>'), (c = "Half goodwill · underpaid pressure remains"));
    const d = t ? (a >= t.requestedRaise ? '<span class="pos">Will accept</span>' : `${Math.round(100 * r)}% likely to accept — rejection stings`) : '<span class="pos">Will accept</span>';
    n.innerHTML = `${d}<br>${l} · ${c}`;
}
function applyRaiseOutcome(e, t, n) {
    (e.career.salary = (e.career.salary || 1e5) + t), e.stats || (e.stats = {});
    const a = getMarketRate(e),
        o = e.career.salary / Math.max(1, a),
        i = n ? 1.25 : 1;
    let s;
    if (o >= 1.15) {
        const gen = Math.min(0.35, Math.max(0, Math.min(1.5, o) - 1.15)),
            gain = Math.round((12 + 23 * gen) * i);
        (e.stats.trust = Math.min(100, (e.stats.trust || 50) + gain)),
            (e.stats.affection = Math.min(100, (e.stats.affection || 50) + 10)),
            (e.stats.productivity = Math.min(100, (e.stats.productivity || 50) + 5)),
            addPayrollChip(e, { key: "wellpaid", emoji: "💛", label: "Well Paid", tone: "buff", durationDays: 28 }),
            (s = `🎉 ${e.name} is thrilled — paid above market!`);
        "function" == typeof generateRaiseReactionPost && generateRaiseReactionPost(e, t, "grateful");
    } else
        o >= 0.95
            ? ((e.stats.trust = Math.min(100, (e.stats.trust || 50) + Math.round(10 * i))),
              (e.stats.affection = Math.min(100, (e.stats.affection || 50) + 15)),
              (e.stats.productivity = Math.min(100, (e.stats.productivity || 50) + 5)),
              (s = `✓ ${e.name} accepted the raise. Fair pay, steady ship.`))
            : ((e.stats.trust = Math.min(100, (e.stats.trust || 50) + Math.round(5 * i))),
              (e.stats.affection = Math.min(100, (e.stats.affection || 50) + 7)),
              (e.stats.productivity = Math.min(100, (e.stats.productivity || 50) + 2)),
              (s = `✓ ${e.name} accepted — but they know it's below market.`));
    o >= 0.95 && removePayrollChip(e, "underpaid"),
        (e.nextRaiseBump = 0),
        (e.raiseCooldownUntil = (gameState.time?.currentTime || Date.now()) + 24192e5),
        showNotification(s, "success");
}
function resolveRaiseOffer() {
    if (!_negCtx) return;
    const e = gameState.employees.find((e) => e.id === _negCtx.employeeId),
        t = _negCtx.requestId ? gameState.raiseRequests?.find((e) => e.id === _negCtx.requestId) : null,
        n = parseInt(document.getElementById("negAmount")?.value, 10) || 0;
    if (!e) return void closeRaiseNegotiation();
    if (n <= 0) return void showNotification("Enter a raise amount (or Decline).", "warning");
    const a = raiseAcceptChance(e, t, n),
        o = !t || n >= (t.requestedRaise || 0) || Math.random() < a;
    o
        ? applyRaiseOutcome(e, n, !t)
        : (e.stats || (e.stats = {}),
          (e.stats.affection = Math.max(0, (e.stats.affection || 50) - 5)),
          (e.stats.trust = Math.max(0, (e.stats.trust || 50) - 8)),
          addPayrollChip(e, { key: "passedover", emoji: "😒", label: "Passed Over", tone: "debuff", durationDays: 14 }),
          (e.nextRaiseBump = (e.nextRaiseBump || 0) + 5),
          (e.raiseCooldownUntil = (gameState.time?.currentTime || Date.now()) + 12096e5),
          showNotification(`😤 ${e.name} rejected the low offer.`, "warning")),
        t && (gameState.raiseRequests = gameState.raiseRequests.filter((e) => e.id !== t.id)),
        closeRaiseNegotiation(),
        updatePayrollTab(),
        "function" == typeof updatePeopleTab && updatePeopleTab();
}
function declineRaiseFromNegotiation() {
    if (!_negCtx?.requestId) return void closeRaiseNegotiation();
    const e = _negCtx.requestId;
    closeRaiseNegotiation(), denyRaise(e);
}
async function openBonusPoolModal() {
    const e = gameState.payroll?.bonusPool || 0,
        t = await showPrompt(
            `Current bonus pool: $${formatNumber(e)}\n\nEnter amount to add to the bonus pool (will be distributed to all employees):`,
            "🏆 Bonus Pool",
            { defaultValue: "10000", placeholder: "Amount to add..." }
        );
    if (null === t) return;
    const n = parseInt(t.replace(/[^0-9]/g, ""));
    if (isNaN(n) || n <= 0) return void showNotification("Invalid amount!", "error");
    if (gameState.cash < n)
        return void showNotification(`❌ Need $${formatNumber(n)} to fund bonus pool!`, "error");
    const a = gameState.employees.filter(
        (e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7
    );
    if (0 === a.length) return void showNotification("No employees to give bonuses to!", "error");
    const o = Math.floor(n / a.length);
    (await showConfirm(
        `Distribute $${formatNumber(n)} in bonuses?\n\n${a.length} employees will each receive $${formatNumber(o)}\n\nThis will significantly boost morale!`,
        "Distribute Bonuses",
        { type: "info", confirmText: "Distribute" }
    )) &&
        ((gameState.cash -= n),
        a.forEach((e) => {
            e.stats || (e.stats = {}),
                (e.stats.affection = Math.min(100, (e.stats.affection || 50) + 15)),
                (e.stats.productivity = Math.min(100, (e.stats.productivity || 50) + 10)),
                (e.stats.trust = Math.min(100, (e.stats.trust || 50) + 10));
        }),
        o >= 500 && generateBonusSocialPosts(a, o, "bonus_pool"),
        showNotification(`🎉 Distributed $${formatNumber(n)} in bonuses! Everyone is ecstatic!`, "success"),
        updatePayrollTab());
}
function updatePayrollTab() {
    const e = (5 - (timeHelpers?.getDay?.() ?? new Date().getDay()) + 7) % 7 || 7,
        t = document.getElementById("payrollNextPayday"),
        n = document.getElementById("payrollPaydayCountdown");
    t && (t.textContent = "Friday"), n && (n.textContent = 0 === e ? "Today!" : `In ${e} day${e > 1 ? "s" : ""}`);
    const a = getWeeklyPayroll(),
        o = gameState.employees.filter(
            (e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7
        ).length,
        i = document.getElementById("payrollWeeklyTotal"),
        s = document.getElementById("payrollEmployeeCount");
    i && (i.textContent = formatNumber(a)), s && (s.textContent = o);
    const r = hasAlreadyPaidThisWeek(),
        l = document.getElementById("payrollCurrentCash"),
        c = document.getElementById("payrollCashStatus");
    if ((l && (l.textContent = formatNumber(gameState.cash)), c))
        if (r) (c.textContent = "✓ Payroll paid this week!"), (c.className = "tile-sub text-pos");
        else {
            const e = gameState.cash >= a;
            (c.textContent = e ? "✓ Can afford payroll" : "⚠️ Cannot afford payroll!"),
                (c.className = e ? "tile-sub" : "tile-sub text-neg");
        }
    n &&
        (r
            ? ((n.textContent = "✓ Paid!"), (n.className = "tile-sub text-pos"))
            : ((n.textContent = 0 === e ? "Today!" : `In ${e} day${e > 1 ? "s" : ""}`), (n.className = "tile-sub")));
    const d = getTotalDebt(),
        p = document.getElementById("payrollTotalDebt"),
        m = document.getElementById("payrollDebtStatus");
    if ((p && (p.textContent = formatNumber(d)), m)) {
        const e = gameState.loans?.length || 0;
        m.textContent = 0 === e ? "No active loans" : `${e} active loan${e > 1 ? "s" : ""}`;
    }
    const u = document.getElementById("earlyPayBtn");
    u &&
        (r
            ? ((u.disabled = !0), (u.innerHTML = "✓ Payroll Paid This Week"))
            : ((u.disabled = !1), (u.innerHTML = "🎁 Pay Early (+10% bonus to morale)")));
    const cp = document.getElementById("payrollCreditPill");
    cp && (cp.textContent = `Rating ${getCreditTier().label}`);
    const rq = document.getElementById("payrollRunQuality");
    rq &&
        (rq.textContent = gameState.payroll?.lastRunQuality
            ? `Last run: ${gameState.payroll.lastRunQuality}`
            : "");
    const g = document.getElementById("payrollAutoPay");
    g && (g.checked = !1 !== gameState.payroll?.autoPayEnabled);
    const h = document.getElementById("payrollDelayedWarning"),
        y = document.getElementById("payrollDelayedWeeks"),
        f = document.getElementById("payrollDelayedAmount"),
        b = gameState.payroll?.delayedWeeks || 0,
        B = gameState.payroll?.arrears?.amount || 0;
    h && (h.style.display = b > 0 || B > 0 ? "block" : "none"),
        y && (y.textContent = B > 0 ? `$${formatNumber(B)} in unpaid wages` : `${b} week(s) unpaid`),
        f && (f.textContent = formatNumber(a * b + B));
    const v = document.getElementById("payrollPrestigeMultiplier");
    if (v) {
        const e = Math.pow(1.5, gameState.prestigeLevel || 0);
        v.textContent = e.toFixed(2) + "x";
    }
    const w = document.getElementById("payrollEmployeeList");
    if (w) {
        const e = getPayrollBreakdown();
        0 === e.length
            ? (w.innerHTML = '<div class="empty-note">No employees on payroll</div>')
            : (w.innerHTML = e
                  .map((e) => {
                      const t = gameState.hierarchyLevels?.[e.employee.career?.level || 1] || {},
                          n = e.isProRated,
                          a = getMarketRate(e.employee),
                          o = e.baseSalary / Math.max(1, a),
                          i =
                              o >= 1.15
                                  ? '<span class="text-pos" title="Above market">▲ above market</span>'
                                  : o >= 0.9
                                    ? '<span class="text-dim" title="At market">◆ at market</span>'
                                    : '<span class="text-neg" title="Below market">▼ below market</span>',
                          s =
                              "function" == typeof renderProgramChips ? renderProgramChips(e.employee) : "",
                          r = gameState.locations?.find((t) => t.id === getEmployeeWorkLocation(e.employee));
                      return `\n            <div class="subpanel row-between ${n ? "subpanel--gold" : ""}">\n              <div>\n                <div class="fw-600">${e.employee.name} ${s}</div>\n                <div class="fs-sm text-dim">${t.title || "Staff"}${r ? " · " + r.name.replace(/^\S+\s/, "") : ""}</div>\n                <div class="fs-xs">${i}</div>\n                ${n ? `<div class="fs-xs text-gold num">🆕 ${e.daysWorked}/5 days this week</div>` : ""}\n              </div>\n              <div class="row">\n                <div class="text-right">\n                  <div class="text-pos fw-600 num">$${formatNumber(e.scaledSalary)}/yr</div>\n                  ${n ? `<div class="fs-xs text-gold num">$${formatNumber(e.proRatedPay)} this week</div>` : `<div class="fs-xs text-dim num">$${formatNumber(e.fullWeeklyPay)}/week</div>`}\n                </div>\n                <button class="btn btn--ghost" onclick="openRaiseNegotiation('${e.employee.id}')" title="Adjust salary" style="min-width:44px;min-height:44px;">💬</button>\n              </div>\n            </div>\n          `;
                  })
                  .join(""));
    }
    document.querySelectorAll("#payrollTab .loan-btn[data-loan]").forEach((t) => {
        const n = LOAN_TYPES[t.dataset.loan];
        if (!n) return;
        const a = t.querySelector(".loan-d");
        a && (a.textContent = `$${formatNumber(getBridgeLoanAmount(t.dataset.loan))} • ${(100 * n.interestRate).toFixed(0)}% weekly`);
    });
    const ib = document.getElementById("investLoanBtn"),
        ibd = document.getElementById("investLoanDesc");
    ib &&
        ((ib.disabled = !isInvestmentLoanUnlocked()),
        ibd &&
            (ibd.textContent = isInvestmentLoanUnlocked()
                ? `Up to $${formatNumber(8 * getWeeklyIncomeEstimate())} • auto-repaid`
                : "Unlocks with 2nd location"));
    const bb = document.getElementById("bondIssueBtn"),
        bbd = document.getElementById("bondIssueDesc");
    bb &&
        ((bb.disabled = !isBondsUnlocked()),
        bbd &&
            (bbd.textContent = isBondsUnlocked()
                ? `Rating ${getCreditTier().label} • ${(2 * getCreditTier().mult).toFixed(1)}%/wk coupon`
                : "Prestige 1+ or 4 locations"));
    const x = document.getElementById("payrollActiveLoans");
    if (x) {
        normalizeLoanKinds();
        const e = gameState.loans || [],
            bonds = gameState.bonds || [];
        0 === e.length && 0 === bonds.length
            ? (x.innerHTML = '<div class="empty-note">No active loans</div>')
            : (x.innerHTML =
                  e
                      .map((e) => {
                          const t = LOAN_TYPES[e.type],
                              n = e.currentAmount - e.principal;
                          let a = t?.name || "Loan",
                              o = t?.color || "var(--text-mute)",
                              i = `<span>Principal: $${formatNumber(e.principal)}</span><span>Interest: +$${formatNumber(Math.max(0, n))}</span>`;
                          "shark" === e.kind
                              ? ((a = "🦩 Pelican Capital"),
                                (o = "var(--l-red)"),
                                (i = `<span>Min Friday: $${formatNumber(Math.floor(e.currentAmount * (e.minPaymentRate || 0.1)))}</span><span>${(100 * e.interestRate).toFixed(0)}%/wk${e.missedPayments ? ` · ${e.missedPayments} missed` : ""}</span>`))
                              : "investment" === e.kind &&
                                ((a = "📈 Investment Loan"),
                                (o = "var(--l-indigo)"),
                                (i = `<span>$${formatNumber(e.installment)}/wk auto</span><span>${e.garnishing ? "⚠️ garnishing" : `~${Math.max(1, Math.ceil(e.currentAmount / Math.max(1, e.installment)))} wk left`}</span>`));
                          return `\n            <div class="subpanel" style="border-left:3px solid ${o}; border-radius:0 var(--r2) var(--r2) 0;">\n              <div class="row-between mb-1">\n                <span class="fw-600" style="color:${o};">${a}</span>\n                <span class="text-neg fw-600 num">$${formatNumber(e.currentAmount)}</span>\n              </div>\n              <div class="row-between fs-sm text-dim mb-1 num">${i}</div>\n              <div class="row">\n                <button onclick="repayLoan('${e.id}')" class="btn btn--pos flex-1">Pay Full</button>\n                <button onclick="repayLoan('${e.id}', ${Math.floor(e.currentAmount / 2)})" class="btn btn--ghost flex-1">Pay Half</button>\n              </div>\n              <div class="row mt-1">\n                <input type="number" id="loanCustomAmt-${e.id}" placeholder="Custom amount" min="0" max="${e.currentAmount}" step="1" class="flex-1" style="min-width:0;" />\n                <button onclick="payCustomLoanAmount('${e.id}')" class="btn btn--ghost">Pay</button>\n              </div>\n            </div>\n          `;
                      })
                      .join("") +
                  bonds
                      .map(
                          (e) =>
                              `\n            <div class="subpanel" style="border-left:3px solid var(--accent-gold); border-radius:0 var(--r2) var(--r2) 0;">\n              <div class="row-between mb-1">\n                <span class="fw-600 text-gold">🏛️ Corporate Bond</span>\n                <span class="text-neg fw-600 num">$${formatNumber(e.principal)}</span>\n              </div>\n              <div class="row-between fs-sm text-dim num">\n                <span>Coupon $${formatNumber(Math.floor(e.principal * e.couponRate))}/wk</span>\n                <span>Matures in ${Math.max(0, e.termWeeks - e.weeksElapsed)} wk${e.missedCoupons ? ` · ${e.missedCoupons} missed` : ""}</span>\n              </div>\n            </div>\n          `
                      )
                      .join(""));
    }
    const cov = document.getElementById("payrollCoverageGrid");
    if (cov) {
        const e = getPayrollCoverage(),
            t = Object.entries(e.byLocation).filter(([, e]) => e.total > 0 || e.accountants.length > 0);
        0 === t.length
            ? (cov.innerHTML = '<div class="empty-note">No employees on payroll</div>')
            : (cov.innerHTML = t
                  .map(([t, n]) => {
                      const a = gameState.locations?.find((e) => e.id === t),
                          o = n.total <= n.capacity,
                          i = n.accountants
                              .map(
                                  (e) =>
                                      `<span class="pill" title="Capacity ${getAccountantCapacity(e)} · level rises with promotions">${e.name} · L${getAccountantLevel(e)} <button onclick="reassignAccountant('${e.id}')" class="btn btn--ghost" style="min-height:28px;padding:0 6px;" title="Reassign department">↔</button></span>`
                              )
                              .join(" ");
                      return `\n            <div class="subpanel">\n              <div class="row-between mb-1">\n                <span class="fw-600">${a?.name || t}</span>\n                <span class="${o ? "text-pos" : "text-neg"} fw-600 num">${Math.min(n.total, n.capacity)}/${n.total} covered</span>\n              </div>\n              <div class="fs-xs text-dim">${i || (o ? "" : '<span class="text-neg">⚠️ No accountant — manual payroll every Friday</span>')}</div>\n            </div>`;
                  })
                  .join(""));
    }
    const pg = document.getElementById("acctPoolGrid");
    if (pg) {
        ensureAccountantPool();
        const e = gameState.payroll.accountantPool || [];
        pg.innerHTML =
            e
                .map((e) => {
                    const t = ACCT_TRAITS[e.accountantTrait] || { label: "—", emoji: "•", tone: "mixed" };
                    return `\n            <div class="acct-card">\n              <div class="row-between"><span class="fw-600">${getColoredName(e)}</span><span class="pill">Lv ${e.career.level}</span></div>\n              <div class="big num">${getAccountantCapacity(e)} <span class="fs-xs text-dim">capacity</span></div>\n              <span class="chip ${"buff" === t.tone ? "chip--buff" : "chip--debuff"}"><span>${t.emoji}</span><span class="lbl">${t.label}</span></span>\n              <div class="fs-sm num">$${formatNumber(e.salaryAsk)}<span class="fs-xs text-dim">/yr ask</span></div>\n              <button class="btn btn--outline" onclick="openAccountantProfile('${e.id}')">View &amp; Hire</button>\n            </div>`;
                })
                .join("") +
            Array(Math.max(0, 3 - e.length))
                .fill('<div class="acct-card"><div class="empty-note">Slot open — refills with the next drip</div></div>')
                .join("");
        const t = document.getElementById("acctPoolCountdown");
        if (t) {
            const e = Math.max(
                0,
                Math.ceil(
                    ((gameState.payroll.acctPoolNextRefresh || 0) - (gameState.time?.currentTime || Date.now())) / 864e5
                )
            );
            t.textContent = `New candidate in ${e} day${1 === e ? "" : "s"}`;
        }
        const n = document.getElementById("acctPoolRecruitBtn");
        if (n) {
            const e =
                void 0 !== StoryEngine && StoryEngine.calculateScaledCost
                    ? StoryEngine.calculateScaledCost(5e3, "medium")
                    : 5e3;
            n.textContent = `Recruit New Pool — $${formatNumber(e)}`;
        }
    }
    const S = document.getElementById("payrollHistory");
    if (S) {
        const e = gameState.payroll?.weeklyPayrollHistory || [];
        0 === e.length
            ? (S.innerHTML = '<div class="empty-note">No payroll history yet</div>')
            : (S.innerHTML = e
                  .slice()
                  .reverse()
                  .slice(0, 8)
                  .map(
                      (e) =>
                          `\n            <div class="list-row">\n              <span class="text-dim fs-sm">${new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>\n              <span class="fw-600 ${e.hadEnough ? "text-pos" : "text-neg"}">$${formatNumber(e.amount)}</span>\n            </div>\n          `
                  )
                  .join(""));
    }
    const k = document.getElementById("payrollRaiseRequests");
    if (k) {
        const e = gameState.raiseRequests || [],
            adv = gameState.salaryAdvances || [],
            advHtml = adv
                .map(
                    (e) =>
                        `\n            <div class="subpanel">\n              <div class="row-between mb-1">\n                <span class="fw-600">💸 ${e.employeeName}</span>\n                <span class="text-gold num">$${formatNumber(e.amount)} advance</span>\n              </div>\n              <div class="fs-sm text-dim italic mb-1">"${e.reason}"</div>\n              <div class="row">\n                <button onclick="approveAdvance('${e.id}')" class="btn btn--primary flex-1">✓ Advance</button>\n                <button onclick="negotiateAdvance('${e.id}')" class="btn btn--outline flex-1">↔ Adjust</button>\n                <button onclick="denyAdvance('${e.id}')" class="btn btn--danger flex-1">✕ Deny</button>\n              </div>\n            </div>\n          `
                )
                .join("");
        0 === e.length && 0 === adv.length
            ? (k.innerHTML = '<div class="empty-note">No pending requests</div>')
            : (k.innerHTML = e
                  .map(
                      (e) =>
                          `\n            <div class="subpanel">\n              <div class="row-between mb-1">\n                <span class="fw-600">📝 ${e.employeeName}</span>\n                <span class="text-gold num">+${e.raisePercent}% ($${formatNumber(e.requestedRaise)})</span>\n              </div>\n              <div class="fs-sm text-dim italic mb-1">"${e.reason}"</div>\n              <div class="row">\n                <button onclick="approveRaise('${e.id}')" class="btn btn--primary flex-1">✓ Approve</button>\n                <button onclick="counterOfferRaise('${e.id}')" class="btn btn--outline flex-1">↔ Negotiate</button>\n                <button onclick="denyRaise('${e.id}')" class="btn btn--danger flex-1">✕ Deny</button>\n              </div>\n            </div>\n          `
                  )
                  .join("") + advHtml);
    }
}
