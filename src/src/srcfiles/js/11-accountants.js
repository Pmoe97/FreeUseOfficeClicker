// ============================================================================
// 11-accountants — Accountants: trait config ACCT_TRAITS, candidate pool, hiring/onboarding, PayrollMinigames, payroll coverage logic.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

const ACCT_TRAITS = {
    forensic: { label: "Forensic Eye", emoji: "🔍", tone: "buff", desc: "Fraud pre-flagged in audits, at any level" },
    networked: { label: "Networked", emoji: "🤝", tone: "buff", desc: "−10% interest on new loans, at any level" },
    spreadsheet: { label: "Spreadsheet Whisperer", emoji: "📊", tone: "buff", desc: "+4 processing capacity" },
    calm: { label: "Calm Under Audit", emoji: "🧘", tone: "buff", desc: "Halves payroll error penalties, at any level" },
    rushes: { label: "Rushes Audits", emoji: "⏩", tone: "debuff", desc: "Never halves error penalties, even at L2+" },
    expensive: { label: "Expensive Taste", emoji: "💎", tone: "debuff", desc: "Always asks 15–30% above market" },
    hoarder: { label: "Paper Hoarder", emoji: "🗄️", tone: "debuff", desc: "−4 processing capacity" },
    bythebook: { label: "By-The-Book", emoji: "📏", tone: "debuff", desc: "Doesn't contribute the payroll cost discount" },
};
function getAccountantCapacity(e) {
    const t = 4 + 4 * getAccountantLevel(e),
        n = "spreadsheet" === e.accountantTrait ? 4 : "hoarder" === e.accountantTrait ? -4 : 0;
    return Math.max(4, t + n);
}
// Perk resolution: career level grants the tier, traits can grant early or veto.
function accountantGrantsPerk(e, t) {
    const n = e.accountantTrait;
    return 2 === t && "rushes" === n
        ? !1
        : 3 === t && "bythebook" === n
          ? !1
          : getAccountantLevel(e) >= t ||
            (2 === t && "calm" === n) ||
            (4 === t && "networked" === n) ||
            (5 === t && "forensic" === n);
}
// The product someone runs. The product's own managerId is authoritative; productId and
// productManaged are the employee's copy of it and can lag behind a transfer (the old
// productId used to win here and put transferred staff back at their old site).
function getEmployeeProduct(e) {
    if (!e) return null;
    const p = gameState.products || [];
    return (
        p.find((t) => t.managerHired && t.managerId === e.id) ||
        (e.productId && p.find((t) => t.id === e.productId)) ||
        (e.productManaged && p.find((t) => t.name === e.productManaged)) ||
        null
    );
}
function getEmployeeWorkLocation(e) {
    return getEmployeeProduct(e)?.locationId || e.locationId || "garage";
}
function hasAccountantPerk(e) {
    return getAccountants().some((t) => accountantGrantsPerk(t, e));
}
function getAccountingDiscount() {
    return Math.min(0.1, 0.02 * getAccountants().filter((e) => accountantGrantsPerk(e, 3)).length);
}
// One-time cleanup of the retired "train as accountant" mechanic: legacy converts
// kept their original position, so position !== "Accountant" identifies them.
// Self-extinguishing — once reverted, the filter matches nothing.
function migrateTrainedAccountants() {
    const e = gameState.employees.filter((e) => "accountant" === e.specialization && "Accountant" !== e.position);
    0 !== e.length &&
        (e.forEach((e) => {
            delete e.specialization, delete e.accountant;
        }),
        showNotification(
            `🧮 Accounting restructure: the train-on-the-job program was discontinued. ${e.map((e) => e.name).join(", ")} returned to their old role${e.length > 1 ? "s" : ""}. Hire dedicated accountants from the Payroll tab — coverage may have changed!`,
            "warning"
        ));
}
function getPayrollCoverage() {
    migrateTrainedAccountants();
    const e = gameState.employees.filter(
            (e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7
        ),
        t = {},
        n = [];
    e.forEach((e) => {
        const a = getEmployeeWorkLocation(e);
        t[a] || (t[a] = { total: 0, capacity: 0, accountants: [], employees: [] }),
            "accountant" === e.specialization
                ? (t[a].accountants.push(e), (t[a].capacity += getAccountantCapacity(e)))
                : (t[a].total++, t[a].employees.push(e));
    });
    for (const e in t) {
        const a = t[e];
        a.covered = Math.min(a.total, a.capacity);
        a.total > a.capacity && n.push(...a.employees.slice(a.capacity));
    }
    return { byLocation: t, uncovered: n };
}
// Accountants are hired as dedicated employees through the same candidate
// machinery as manager hires (generatePotentialHires), so they arrive as
// full social NPCs. position: "Accountant" is their role identity and the
// context other systems (chat, feed, profiles) read.
// Progression-scaled candidate quality: range from owned locations + prestige,
// uniform roll within it, top-half levels soft-gated by the player's pay
// reputation (avg actual salary vs market across the roster).
function rollAccountantLevel() {
    const e = (gameState.locations || []).filter((e) => e.owned).length + 2 * (gameState.prestigeLevel || 0),
        t = Math.max(1, Math.min(5, 1 + Math.floor(e / 2))),
        n = 1 + Math.floor(Math.random() * t);
    if (n <= Math.ceil(t / 2)) return n;
    const a = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus && e.career),
        o = a.length
            ? a.reduce((e, t) => e + (t.career.salary || 1e5) / Math.max(1, getMarketRate(t)), 0) / a.length
            : 1,
        i = Math.max(0.2, Math.min(1, o - 0.25));
    return Math.random() < i ? n : Math.max(1, Math.ceil(n / 2));
}
function generateAccountantCandidate() {
    const e = (generatePotentialHires(null) || [])[0];
    if (!e) return null;
    (e.position = "Accountant"), (e.productId = null);
    const t = rollAccountantLevel(),
        n = gameState.hierarchyLevels?.[t] || {};
    (e.career.level = t), (e.career.title = n.title || "Staff");
    const a = Object.keys(ACCT_TRAITS);
    e.accountantTrait = a[Math.floor(Math.random() * a.length)];
    const o = (gameState.locations || []).some((e) => e.owned && e.id === gameState.activeLocationId)
            ? gameState.activeLocationId
            : "garage",
        i = getMarketRate({ ...e, locationId: o }, t);
    let s = 0.85 + 0.3 * Math.random();
    "expensive" === e.accountantTrait && (s = 1.15 + 0.15 * Math.random());
    return (e.salaryAsk = Math.floor(i * s)), (e.askDept = o), e;
}
function ensureAccountantPool() {
    gameState.payroll || (gameState.payroll = {});
    Array.isArray(gameState.payroll.accountantPool) || (gameState.payroll.accountantPool = []);
    const e = gameState.time?.currentTime || Date.now(),
        t = gameState.payroll.accountantPool;
    if ((gameState.payroll.acctPoolNextRefresh || (gameState.payroll.acctPoolNextRefresh = e + 6048e5), 0 === t.length))
        for (; t.length < 3; ) {
            const e = generateAccountantCandidate();
            if (!e) break;
            t.push(e);
        }
    else
        for (let n = 0; e >= gameState.payroll.acctPoolNextRefresh && n < 10; n++) {
            gameState.payroll.acctPoolNextRefresh += 6048e5;
            const e = generateAccountantCandidate();
            if (!e) break;
            t.length < 3 ? t.push(e) : (t.shift(), t.push(e));
        }
}
function passAccountantCandidate(e) {
    gameState.payroll?.accountantPool &&
        ((gameState.payroll.accountantPool = gameState.payroll.accountantPool.filter((t) => t.id !== e)),
        closeLoanProductModal(),
        updatePayrollTab());
}
async function recruitNewAccountantPool() {
    const e =
        void 0 !== StoryEngine && StoryEngine.calculateScaledCost ? StoryEngine.calculateScaledCost(5e3, "medium") : 5e3;
    if (gameState.cash < e) return void showNotification(`❌ Recruitment drive costs $${formatNumber(e)}.`, "error");
    (await showConfirm(
        `Commission a recruitment drive?\n\nCost: $${formatNumber(e)}\nAll 3 candidate slots are replaced immediately.`,
        "Recruit New Pool",
        { type: "info", confirmText: "Recruit" }
    )) &&
        ((gameState.cash -= e),
        (gameState.payroll.accountantPool = []),
        (gameState.payroll.acctPoolNextRefresh = (gameState.time?.currentTime || Date.now()) + 6048e5),
        ensureAccountantPool(),
        showNotification("🧮 Fresh candidates sourced. The staffing agency sends its regards.", "success"),
        updatePayrollTab());
}
function openAccountantProfile(e) {
    ensureAccountantPool();
    const t = gameState.payroll.accountantPool.find((t) => t.id === e);
    if (!t) return;
    const n = ACCT_TRAITS[t.accountantTrait] || { label: "Unremarkable", emoji: "•", tone: "mixed", desc: "" },
        a = (gameState.locations || []).filter((e) => e.owned),
        o = a.some((e) => e.id === t.askDept) ? t.askDept : a[0]?.id || "garage",
        i = gameState.hierarchyLevels?.[t.career.level] || {},
        s = (t.personalityTraits || []).slice(0, 3).join(", "),
        r = (t.hobbies || []).slice(0, 2).join(" and "),
        l = () => {
            const e = document.getElementById("acctProfDept")?.value || o,
                n = getMarketRate({ ...t, locationId: e }, t.career.level),
                a = t.salaryAsk / Math.max(1, n),
                i =
                    a > 1.05
                        ? '<span class="text-neg">▲ above market</span>'
                        : a >= 0.95
                          ? '<span class="text-dim">◆ at market</span>'
                          : '<span class="text-pos">▼ below market</span>',
                s = document.getElementById("acctProfMarket");
            s && (s.innerHTML = `Market: <span class="num">$${formatNumber(n)}</span>/yr · ${i}`);
        };
    _loanModal(
        `
          <div class="neg-head">
            <div class="neg-id">
              <div class="neg-name">${getColoredName(t)} <span class="pill">Accountant · Lv ${t.career.level}</span></div>
              <div class="neg-meta">${i.title || "Staff"} candidate</div>
            </div>
            <button class="btn btn--ghost neg-x" onclick="closeLoanProductModal()">✕</button>
          </div>
          <div class="neg-head">
            <div class="avatar-sm init" style="--lvl:${i.color || "var(--accent)"}">${(t.name || "?").charAt(0).toUpperCase()}</div>
            <div class="neg-id">
              <div class="fs-sm">${(t.gender || "").charAt(0).toUpperCase() + (t.gender || "").slice(1)} · ${formatEthnicity(t.ethnicity || t.race)} · ${t.age}</div>
              <div class="fs-xs text-dim">${s}${r ? ". Into " + r + "." : ""}</div>
            </div>
          </div>
          <div class="tile">
            <div class="k">Capacity</div>
            <div class="big num">Handles ${getAccountantCapacity(t)} employees</div>
            <div class="tile-sub">Assignment: <span id="acctProfDeptLabel">unassigned — choose below</span></div>
          </div>
          <div>
            <span class="chip ${"buff" === n.tone ? "chip--buff" : "chip--debuff"}"><span>${n.emoji}</span><span class="lbl">${n.label}</span></span>
            <div class="fs-xs text-dim mt-1">${n.desc}</div>
          </div>
          <div class="neg-preview">
            Asking: <span class="num fw-600">$${formatNumber(t.salaryAsk)}</span>/yr<br>
            <span class="fs-xs" id="acctProfMarket"></span>
          </div>
          <label class="neg-field"><span class="t">Department</span>
            <select id="acctProfDept" class="neg-select">${a.map((e) => `<option value="${e.id}" ${e.id === o ? "selected" : ""}>${e.name}</option>`).join("")}</select>
          </label>
          <div class="neg-actions">
            <button class="btn btn--primary" onclick="hireAccountantCandidate('${t.id}')">Hire — $${formatNumber(t.salaryAsk)}/yr</button>
            <button class="btn btn--ghost" onclick="passAccountantCandidate('${t.id}')">Pass</button>
          </div>`,
        (e) => {
            const t = e.querySelector("#acctProfDept"),
                n = () => {
                    l();
                    const e = document.getElementById("acctProfDeptLabel"),
                        n = (gameState.locations || []).find((e) => e.id === t?.value);
                    e && n && (e.textContent = n.name);
                };
            t && t.addEventListener("change", n), n();
        }
    );
}
function hireAccountantCandidate(e) {
    ensureAccountantPool();
    const t = gameState.payroll.accountantPool.find((t) => t.id === e);
    if (!t) return;
    const n = document.getElementById("acctProfDept")?.value || t.askDept || "garage";
    (t.locationId = n), (t.location = n);
    const a = 4 * Math.floor(getScaledSalary(t.salaryAsk) / 52);
    if (gameState.cash < a) return void showNotification(`❌ Signing costs $${formatNumber(a)} (4 weeks up front).`, "error");
    (gameState.cash -= a),
        (gameState.payroll.accountantPool = gameState.payroll.accountantPool.filter((t) => t.id !== e)),
        (t.position = "Accountant"),
        (t.specialization = "accountant"),
        (t.accountant = { assignedLocationId: n }),
        (t.hired = !0),
        (t.onboarding = !0),
        (t.bioComplete = !1),
        (t.employmentStatus = "onboarding"),
        (t.hireDate = gameNow()),
        (t.career.salary = t.salaryAsk || getMarketRate(t)),
        gameState.usedEmployeeNames || (gameState.usedEmployeeNames = new Set()),
        gameState.usedEmployeeNames.add && gameState.usedEmployeeNames.add(t.name),
        gameState.onboarding || (gameState.onboarding = []),
        gameState.onboarding.push(t),
        closeLoanProductModal(),
        showNotification(`🧮 ${t.name} is onboarding as Accountant — building their profile…`, "info"),
        updatePayrollTab(),
        "function" == typeof updatePeopleTab && updatePeopleTab(),
        finalizeAccountantOnboarding(t).catch((e) => {
            console.error("[Accountant] Onboarding failed:", e);
        });
}
// Mirrors the manager onboarding pass (selectManagerCandidate): LLM bio +
// detailed physical appearance + profile image, then promote to active.
async function finalizeAccountantOnboarding(t) {
    const g = t.gender || "female",
        article = "male" === g || "transMan" === g ? "male" : "female";
    try {
        // Roll the look first so the AI writes around it rather than inventing colours.
        t.physical = generateDetailedPhysicalAppearance(g, t.race || "human", t.ethnicity || null);
        const prompt = `\n  Create an in-world, adult ${article} NPC profile (no meta-talk) for: ${t.name}, age ${t.age}.\n  Gender: ${g}.\n  ${describeFixedLookForAi(t)}\n  Role: Accountant (handles company payroll). Department: ${(gameState.locations || []).find((e) => e.id === t.locationId)?.name || t.locationId}.\n  Personality traits: ${(t.personalityTraits || []).join(", ")}. Key trait: ${t.keyTrait || ""}.\n  Hobbies: ${(t.hobbies || []).join(", ")}. Kink preferences: ${(t.kinks || []).join(", ")}.\n\n  Respond as a compact JSON object with these keys ONLY:\n  {\n  "name": {"first":"", "last":""},\n  "age": <number>,\n  "gender": "${g}",\n  "bio": "<2-3 sentence personality/background, world-grounded, references their work as an accountant>",\n  "appearance": {\n  "bodyShape": "",\n  "breastSize": "",\n  "buttSize": "",\n  "fashion": ""\n  },\n  "personalityTraits": [${(t.personalityTraits || []).map((e) => `"${e}"`).join(", ")}],\n  "kinks": [${(t.kinks || []).map((e) => `"${e}"`).join(", ")}]\n  }\n  `,
            raw =
                "function" == typeof generateText
                    ? await queuedGenerateText(prompt, {}, `Accountant Profile - ${t.name}`)
                    : `{"name":{"first":"${t.name.split(" ")[0]}","last":"${t.name.split(" ")[1] || ""}"},"age":${t.age},"gender":"${g}","bio":"A meticulous accountant who keeps the company's books airtight and its auditors bored.","appearance":{"heightBuild":"average","hair":{"color":"brown","style":"neat","length":"medium"},"eyes":{"color":"brown","shape":"almond"},"skinTone":"medium","bodyShape":"average","breastSize":"medium","buttSize":"average","fashion":"business casual"},"personalityTraits":["${(t.personalityTraits || []).join('","')}"],"kinks":["${(t.kinks || []).join('","')}"]}`;
        let o;
        try {
            // Local models often wrap the JSON in prose or a code fence.
            o = JSON.parse((extractText(raw).match(/\{[\s\S]*\}/) || ["null"])[0]);
        } catch {
            o = null;
        }
        o && o.name
            ? ((t.name = `${o.name.first} ${o.name.last}`.trim() || t.name),
              (t.age = o.age ?? t.age),
              (t.bio = o.bio || "Keeps the ledgers clean and the audits short."),
              mergeAiAppearance(t.physical, o.appearance, g),
              (t.personalityTraits = o.personalityTraits || t.personalityTraits),
              (t.kinks = o.kinks || t.kinks))
            : (t.bio = "A meticulous accountant who keeps the company's books airtight and its auditors bored.");
        if ("function" == typeof generateImage && t.physical)
            try {
                const e = buildProfilePortraitPrompt(t),
                    n = await queuedGenerateImage(applyImageStyle(e), `Profile image for new accountant ${t.name}`);
                n &&
                    ((t.profileImage = n),
                    t.photos || (t.photos = []),
                    t.photos.push({ url: n, source: "profile", caption: "Initial profile picture", timestamp: Date.now() }));
            } catch (e) {
                console.warn("[Accountant] Profile image generation failed:", e);
            }
    } catch (e) {
        console.error("[Accountant] Profile generation error:", e),
            t.physical || (t.physical = generateDetailedPhysicalAppearance(g, t.race || "human", t.ethnicity || null)),
            t.bio || (t.bio = "A meticulous accountant who keeps the company's books airtight.");
    }
    (t.onboarding = !1),
        (t.bioComplete = !0),
        (t.employmentStatus = "active"),
        (gameState.onboarding = (gameState.onboarding || []).filter((e) => e.id !== t.id)),
        t.hireDate || (t.hireDate = gameNow()),
        "function" == typeof initializeEmployeeSocialData && (t.socialData || initializeEmployeeSocialData(t)),
        gameState.employees.some((e) => e.id === t.id) || gameState.employees.push(t),
        "function" == typeof updateCompanyAwareness && updateCompanyAwareness(),
        "function" == typeof generateRandomRelationships && generateRandomRelationships(t.id),
        "function" == typeof logCompanyEvent &&
            logCompanyEvent({
                type: "hire",
                involvedEmployees: [t.id],
                location: t.locationId,
                description: `${t.name} joined as Accountant`,
                sentiment: "positive",
                importance: 7,
            }),
        "function" == typeof generateFirstEmployeePost &&
            generateFirstEmployeePost(t).catch((e) => {
                console.error("Accountant welcome post failed:", e);
            }),
        showNotification(`🧮 ${t.name} joined as Accountant. The ledgers tremble.`, "success"),
        "function" == typeof saveGame && saveGame(!1),
        updatePayrollTab(),
        "function" == typeof updatePeopleTab && updatePeopleTab();
}
function reassignAccountant(e) {
    const t = gameState.employees.find((t) => t.id === e);
    if (!t || "accountant" !== t.specialization) return;
    const n = (gameState.locations || []).filter((e) => e.owned);
    _loanModal(
        `
          <div class="neg-head">
            <div class="neg-id">
              <div class="neg-name">↔ Reassign ${t.name}</div>
              <div class="neg-meta">Move this accountant to a different department.</div>
            </div>
            <button class="btn btn--ghost neg-x" onclick="closeLoanProductModal()">✕</button>
          </div>
          <div class="scroll-y" style="max-height:50vh">
            ${n
                .map(
                    (n) =>
                        `<div class="subpanel row-between"><span class="fw-600">${n.name}</span><button class="btn btn--outline" ${n.id === t.locationId ? "disabled" : ""} onclick="assignAccountantTo('${e}','${n.id}')">${n.id === t.locationId ? "Current" : "Assign"}</button></div>`
                )
                .join("")}
          </div>`
    );
}
function assignAccountantTo(e, t) {
    const n = gameState.employees.find((t) => t.id === e);
    n &&
        "accountant" === n.specialization &&
        ((n.locationId = t),
        (n.location = t),
        n.accountant && (n.accountant.assignedLocationId = t),
        closeLoanProductModal(),
        showNotification(`🧮 ${n.name} reassigned.`, "success"),
        updatePayrollTab());
}
// ---- Payroll minigame: 2-3 rotating events per payday for uncovered headcount.
// checkrun/signature reskin StoryMinigames types; audit/crunch are custom overlays.
const PayrollMinigames = {
    _queue: [],
    _results: [],
    _onDone: null,
    EVENTS: ["checkrun", "audit", "crunch", "signature"],
    start(e, t) {
        const n = e > 8 ? 3 : 2,
            a = gameState.payroll?.lastRunLineup || [];
        let o = [...this.EVENTS].sort(() => Math.random() - 0.5).slice(0, n);
        JSON.stringify(o) === JSON.stringify(a) && o.push(o.shift());
        gameState.payroll && (gameState.payroll.lastRunLineup = o),
            (this._queue = [...o]),
            (this._results = []),
            (this._onDone = t),
            this._next();
    },
    _next() {
        const e = this._queue.shift();
        if (!e) {
            const e = this._results,
                t = e.every(Boolean) ? "clean" : e.some(Boolean) ? "partial" : "failed",
                n = this._onDone;
            return (this._onDone = null), void (n && n(t));
        }
        "checkrun" === e
            ? StoryMinigames.launchMinigame(
                  "precision",
                  { title: "Check Run", themeText: "Stamp each paycheck while it's over the ink pad.", difficulty: "medium" },
                  (e) => {
                      this._results.push(!(!e || !e.success)), this._next();
                  }
              )
            : "signature" === e
              ? StoryMinigames.launchMinigame(
                    "intensity",
                    { title: "Signature Sprint", themeText: "It is 4:54 PM on a Friday. Sign everything.", difficulty: "medium" },
                    (e) => {
                        this._results.push(!(!e || !e.success)), this._next();
                    }
                )
              : "audit" === e
                ? this._runAudit()
                : this._runCrunch();
    },
    _overlay(e) {
        const t = document.getElementById("payrollMgOverlay");
        t && t.remove();
        const n = document.createElement("div");
        return (
            (n.id = "payrollMgOverlay"),
            (n.className = "fuoc-ui neg-overlay"),
            (n.innerHTML = `<div class="neg-modal">${e}</div>`),
            document.body.appendChild(n),
            n
        );
    },
    _closeOverlay() {
        const e = document.getElementById("payrollMgOverlay");
        e && e.remove();
    },
    _runAudit() {
        const e = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus),
            t = () => e[Math.floor(Math.random() * e.length)]?.name || "An employee",
            n = [
                { text: `${t()} — team lunch, $42`, fraud: !1 },
                { text: `${t()} — client coffee, $18`, fraud: !1 },
                { text: `${t()} — ergonomic chair (the old one 'left'), $230`, fraud: !1 },
                { text: `${t()} — conference parking, $35`, fraud: !1 },
                { text: `${t()} — 'client dinner', Saturday, 2:00 AM, $480`, fraud: !0 },
                { text: `${t()} — timesheet: 9 workdays this week`, fraud: !0 },
                { text: `${t()} — printer ink, $1,250`, fraud: !0 },
                { text: `${t()} — mileage: office to office, 600 mi`, fraud: !0 },
            ]
                .sort(() => Math.random() - 0.5)
                .slice(0, 5),
            a = hasAccountantPerk(5);
        let o = 0,
            i = 0;
        const s = this._overlay(`
              <div class="neg-head"><div class="neg-id"><div class="neg-name">🧾 Expense Audit</div><div class="neg-meta">Approve the legitimate. Flag the creative.${a ? " (Your L5 accountant pre-flagged the suspicious ones.)" : ""}</div></div></div>
              <div id="mgSlip" class="neg-quote"></div>
              <div class="neg-preview" id="mgAuditScore">Slip 1 of ${n.length}</div>
              <div class="neg-actions">
                <button class="btn btn--primary" id="mgApprove">✓ Approve</button>
                <button class="btn btn--outline" id="mgFlag">🚩 Flag</button>
              </div>`),
            r = s.querySelector("#mgSlip"),
            l = s.querySelector("#mgAuditScore"),
            c = () => {
                const e = n[o];
                (r.innerHTML = `${e.fraud && a ? '<span class="text-neg">●</span> ' : ""}${e.text}`),
                    (l.textContent = `Slip ${o + 1} of ${n.length} · ${i} correct`);
            },
            d = (e) => {
                const t = n[o];
                e !== t.fraud
                    ? i++
                    : t.fraud && (gameState.cash = Math.max(0, gameState.cash - Math.max(500, Math.floor(0.01 * getWeeklyPayroll()))));
                o++,
                    o >= n.length
                        ? (this._closeOverlay(), this._results.push(i >= n.length - 1), this._next())
                        : c();
            };
        (s.querySelector("#mgApprove").onclick = () => d(!1)), (s.querySelector("#mgFlag").onclick = () => d(!0)), c();
    },
    _runCrunch() {
        const e = [],
            t = Math.floor(5 * Math.random());
        for (let n = 0; n < 5; n++) {
            const a = 100 + Math.floor(900 * Math.random()),
                o = 100 + Math.floor(900 * Math.random()),
                i = 100 + Math.floor(900 * Math.random());
            let s = a + o + i;
            n === t && (s -= 10 + 10 * Math.floor(9 * Math.random()));
            e.push({ a, b: o, c: i, sum: s, wrong: n === t });
        }
        const n = this._overlay(`
              <div class="neg-head"><div class="neg-id"><div class="neg-name">🧮 Number Crunch</div><div class="neg-meta">One total is wrong. It is, somehow, always in the company's favor. Tap it.</div></div></div>
              <div id="mgLedger">${e.map((e, t) => `<button class="subpanel row-between w-full num" data-row="${t}" style="min-height:44px;cursor:pointer;border:1px solid var(--border);"><span>${e.a} + ${e.b} + ${e.c}</span><span class="fw-600">= ${e.sum}</span></button>`).join("")}</div>
              <div class="neg-preview" id="mgCrunchTimer">12s</div>`);
        let a = 12;
        const o = setInterval(() => {
            a--;
            const e = n.querySelector("#mgCrunchTimer");
            e && (e.textContent = `${a}s`),
                a <= 0 && (clearInterval(o), this._closeOverlay(), this._results.push(!1), this._next());
        }, 1e3);
        n.querySelectorAll("[data-row]").forEach((t) => {
            t.onclick = () => {
                clearInterval(o), this._closeOverlay(), this._results.push(e[parseInt(t.dataset.row, 10)].wrong), this._next();
            };
        });
    },
};
function runFridayPayroll() {
    if (hasAlreadyPaidThisWeek()) return;
    const e = getPayrollCoverage().uncovered;
    if (0 === e.length || void 0 === StoryMinigames) return void processWeeklyPayroll();
    _loanModal(
        `
          <div class="neg-head">
            <div class="neg-id">
              <div class="neg-name">🗂️ Friday Payroll Run</div>
              <div class="neg-meta">${e.length} employee${e.length > 1 ? "s" : ""} lack accountant coverage and need manual processing.</div>
            </div>
          </div>
          <div class="neg-preview">Run it yourself for a clean ledger (2% rebate), or wave it through and let the errors land where they land.</div>
          <div class="neg-actions">
            <button class="btn btn--primary" id="prRun">🕹️ Run Payroll</button>
            <button class="btn btn--ghost" id="prSkip">Wave It Through</button>
          </div>`,
        (t) => {
            (t.querySelector("#prRun").onclick = () => {
                closeLoanProductModal(),
                    PayrollMinigames.start(e.length, (t) => {
                        processWeeklyPayroll(), applyPayrollRunOutcome(t, e);
                    });
            }),
                (t.querySelector("#prSkip").onclick = () => {
                    closeLoanProductModal(), processWeeklyPayroll(), applyPayrollRunOutcome("failed", e, !0);
                });
        }
    );
}
function applyPayrollRunOutcome(e, t, n = !1) {
    gameState.payroll && (gameState.payroll.lastRunQuality = n ? "skipped" : e);
    if ("clean" === e) {
        const e = Math.floor(0.02 * (gameState.payroll?.totalPaidThisWeek || 0));
        e > 0 &&
            ((gameState.cash += e),
            showNotification(`✨ Clean payroll run — $${formatNumber(e)} in processing efficiencies recovered.`, "success"));
    } else if ("failed" === e || n) {
        const e = hasAccountantPerk(2),
            a = Math.min(t.length, e ? 1 : 2),
            o = [...t].sort(() => Math.random() - 0.5).slice(0, a);
        o.forEach((t) => {
            t.stats || (t.stats = {});
            if (Math.random() < 0.5)
                (t.stats.trust = Math.max(0, (t.stats.trust || 50) - (e ? 3 : 5))),
                    addPayrollChip(t, { key: "payerror", emoji: "🧾", label: "Paycheck Error", tone: "debuff", durationDays: 7 }),
                    Math.random() < 0.25 && generateFinancialStressPosts([t], "missed_payroll", 1);
            else {
                const n = Math.floor(getScaledSalary(t.career?.salary || 1e5) / 52 / (e ? 4 : 2));
                gameState.cash = Math.max(0, gameState.cash - n);
            }
        });
        o.length > 0 &&
            showNotification(
                `🧾 Payroll errors hit ${o.length} paycheck${o.length > 1 ? "s" : ""}. HR apologizes 'for any inconvenience.'`,
                "warning"
            );
    }
    updatePayrollTab();
}
