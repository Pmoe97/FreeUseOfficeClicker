// ============================================================================
// 09-payroll — Payroll: onHourChange/onDayChange, salary scaling, weekly payroll processing, payroll modal UI, payNow/auto-pay.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function onHourChange(e, t) {
  9 === e && _o(), 17 === e && Ro(), Nt(), Sa(), ba(), [6, 7, 8].includes(e) && xa();
  const a = gameState.time?.currentTime || Date.now();
  gameState.employees.forEach((e2) => {
    if (e2.chatCommMode && "auto" !== e2.chatCommMode) {
      const t2 = e2.lastPlayerMessageTime || 0, o = a - t2;
      o >= 1728e5 && (debugLog("Chat", `Resetting ${e2.name}'s comm mode to auto (inactive for ${Math.floor(o / 36e5)} hours)`), e2.chatCommMode = "auto");
    }
  }), gameState.employees.forEach((e2) => {
    if (e2.schedule && e2.schedule.isCurrentlyWorking) {
      const t2 = gameState.products.find((t3) => t3.name === e2.productManaged);
      if (t2) {
        const n = t2.locationId || "garage";
        "rnd" === n ? gainSkillXP(e2, "technical", 3, "work hour") : "creative_studio" === n ? gainSkillXP(e2, "creative", 3, "work hour") : "office_suite" === n || "factory" === n ? gainSkillXP(e2, "management", 2, "work hour") : (gainSkillXP(e2, "technical", 1, "work hour"), gainSkillXP(e2, "social", 1, "work hour"));
      }
      e2.schedule.hoursWorkedToday += 1;
    }
  }), ea();
}
function onDayChange(e) {
  gameState.employees.forEach((e2) => {
    e2.schedule && (e2.schedule.hoursWorkedToday = 0, e2.schedule.lastClockOut && (e2.schedule.daysWorked += 1));
  }), 5 === e && ia(), 5 === e && (gameState.payroll?.autoPayEnabled ? Bn() : showPayrollModal(), processLoanInterest(), tn(), nn(), generateRaiseRequests(), jn()), e >= 1 && e <= 5 && checkForCompanyEvent(), Ao(), 1 === e && (gameState.companyEvents && (gameState.companyEvents.eventsThisWeek = 0), gameState.payroll || (gameState.payroll = { enabled: true, autoPayEnabled: true }), gameState.payroll.payWeekStart = gameState.time?.currentTime || Date.now()), 1 === e && updateEmployeePerformanceMetrics(), processFlagChains(), za(), ba(), void 0 !== StoryEngine && StoryEngine.processOngoingEffects && StoryEngine.processOngoingEffects(), ea();
}
function getScaledSalary(e) {
  const t = gameState.prestigeLevel || 0, n = Math.pow(1.5, t), a = 1 - 0.04 * (gameState.globalUpgrades?.workforce?.payrollConsultants || 0), o = 1 - ("function" == typeof Pn ? Pn() : 0);
  return Math.floor(e * n * a * o);
}
function Xt(e) {
  if (!e) return 0;
  const t = (gameState.locations || []).findIndex((t2) => t2.id === e);
  return t >= 0 ? t : 0;
}
function Zt(e) {
  if (!e) return 0.5;
  const t = (gameState.products || []).filter((t2) => (t2.locationId || "garage") === (e.locationId || "garage"));
  if (t.length <= 1) return 0.5;
  const n = t.slice().sort((e2, t2) => (e2.unlockCost || 0) - (t2.unlockCost || 0)).findIndex((t2) => t2.id === e.id);
  return n < 0 ? 0.5 : n / (t.length - 1);
}
function getMarketRate(e, t = null) {
  const n = t ?? e?.career?.level ?? 1, a = gameState.hierarchyLevels?.[n]?.baseSalary || 1e5;
  if (!e) return a;
  const o = gameState.products?.find((t2) => e.productId && t2.id === e.productId || e.productManaged && t2.name === e.productManaged), i = Xt(o?.locationId || e.locationId), s = Math.pow(1.6, i), r = o ? 0.9 + 0.35 * Zt(o) : 1;
  return Math.floor(a * s * r);
}
function processWeeklyPayroll() {
  if (dn()) return void console.log("[Payroll] Skipped weekly run \u2014 already paid this week.");
  gameState.payroll || (gameState.payroll = { enabled: true, lastPayday: null, totalPaidThisWeek: 0, weeklyPayrollHistory: [], autoPayEnabled: true, payWeekStart: null }), gameState.payroll.marketModelSince || (gameState.payroll.marketModelSince = gameState.time?.currentTime || Date.now());
  const e = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.career?.level || 1) < 7);
  if (0 === e.length) return void (gameState.payroll.payWeekStart = null);
  const t = gameState.time?.currentTime || Date.now(), n = gameState.payroll.payWeekStart || getPayWeekStart(t);
  let a = 0;
  const o = [];
  let i = 0;
  e.forEach((e2) => {
    const s2 = e2.career?.salary || 1e5, r2 = getScaledSalary(s2), l2 = Math.floor(r2 / 52), c = calculateDaysWorkedThisWeek(e2, n, t);
    let d = Math.floor(l2 * (c / 5));
    if (e2.advanceDebt && e2.advanceDebt.remaining > 0) {
      const t2 = Math.min(d, e2.advanceDebt.perWeek || d, e2.advanceDebt.remaining);
      d -= t2, e2.advanceDebt.remaining -= t2, e2.advanceDebt.remaining <= 0 && (e2.advanceDebt = null, showNotification(`\u2713 ${e2.name}'s salary advance is fully repaid.`, "info"));
    }
    a += d, c < 5 && i++, o.push({ name: e2.name, baseSalary: s2, scaledSalary: r2, fullWeeklyPay: l2, daysWorked: c, actualPay: d });
  });
  const s = gameState.cash >= a;
  if (s) gameState.cash -= a;
  else {
    const e2 = Math.max(0, Math.floor(gameState.cash)), n2 = a - e2;
    gameState.cash -= e2, gameState.payroll.arrears || (gameState.payroll.arrears = { amount: 0, sinceWeekId: null, missedCount: 0 }), gameState.payroll.arrears.amount += n2, gameState.payroll.arrears.sinceWeekId || (gameState.payroll.arrears.sinceWeekId = cn()), gameState.payroll.arrears.missedCount++;
  }
  gameState.payroll.lastPayday = t, gameState.payroll.totalPaidThisWeek = a, gameState.payroll.weeklyPayrollHistory.push({ date: gameState.payroll.lastPayday, amount: a, employeeCount: e.length, proRatedCount: i, hadEnough: s }), gameState.payroll.weeklyPayrollHistory.length > 12 && gameState.payroll.weeklyPayrollHistory.shift(), gameState.payroll.payWeekStart = null, gameState.payroll.lastPaidWeek = cn(), gameState.payroll.delayedWeeks = 0;
  const r = xu(a), l = i > 0 ? ` (${i} pro-rated)` : "";
  s ? showNotification(`\u{1F4B0} Weekly Payroll: -${r} (${e.length} employees${l})`, "info") : (showNotification(`\u{1F6A8} Payroll shortfall! $${wu(gameState.payroll.arrears?.amount || 0)} in unpaid wages.`, "error"), console.log(`[Payroll] Shortfall booked to arrears. Cash: $${gameState.cash.toLocaleString()}`)), console.log(`[Payroll] Paid ${e.length} employees: $${a.toLocaleString()}${l}`), "function" == typeof remember && e.forEach((e2) => {
    remember(e2, "Payday came through \u2014 got paid this week", "event", 1);
  });
}
function tn() {
  gameState.payroll || (gameState.payroll = {});
  const e = gameState.time?.currentTime || Date.now(), t = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.career?.level || 1) < 7);
  if (0 === t.length) return;
  const n = gameState.payroll.arrears;
  if (n && n.amount > 0 && (t.forEach((e2) => {
    e2.stats || (e2.stats = {}), e2.stats.productivity = Math.max(10, (e2.stats.productivity || 50) - 15), e2.stats.trust = Math.max(0, (e2.stats.trust || 50) - 10), qn(e2, { key: "unpaid", emoji: "\u{1F6AB}", label: "Unpaid Wages", tone: "debuff", durationDays: 7 });
  }), sn(t, "missed_payroll", n.missedCount), n.missedCount >= 2)) {
    const e2 = Math.min(0.3, 0.08 * n.missedCount) * (gameState.story?.factionEffects?.attritionMult || 1);
    t.forEach((t2) => {
      Math.random() < e2 && (t2.stats?.trust || 50) < 35 && (t2.employmentStatus = "resigned", t2.hired = false, showNotification(`\u{1F620} ${t2.name} quit over unpaid wages!`, "error"));
    });
  }
  const a = gameState.payroll.marketModelSince || e;
  t.forEach((t2) => {
    if (!t2.career || "active" !== t2.employmentStatus) return;
    if ((t2.career.salary || 1e5) < 0.9 * getMarketRate(t2)) {
      t2.career.underpaidSince || (t2.career.underpaidSince = e);
      const i = Math.floor((e - Math.max(t2.career.underpaidSince, a)) / 6048e5);
      t2.stats || (t2.stats = {}), i >= 1 && (t2.stats.productivity = Math.max(30, (t2.stats.productivity || 50) - 3), qn(t2, { key: "underpaid", emoji: i >= 8 ? "\u{1F624}" : "\u{1F4C9}", label: i >= 8 ? "One Foot Out" : "Underpaid", tone: i >= 8 ? "debuff" : "mixed", durationDays: 10 })), i >= 4 && (t2.stats.trust = Math.max(0, (t2.stats.trust || 50) - 4), t2.stats.affection = Math.max(0, (t2.stats.affection || 50) - 2), Math.random() < 0.25 && sn([t2], "underpaid", 1)), i >= 8 && (t2.stats.trust || 50) < 35 && Math.random() < Math.min(0.25, 0.04 * (i - 7)) * (gameState.story?.factionEffects?.attritionMult || 1) && (t2.employmentStatus = "resigned", t2.hired = false, showNotification(`\u{1F624} ${t2.name} resigned \u2014 chronically underpaid.`, "error"));
    } else t2.career.underpaidSince && (t2.career.underpaidSince = null, zn(t2, "underpaid"));
  });
}
function nn() {
  const u2 = gameState.story?.factionEffects;
  if (!u2 || "function" != typeof Ht || !Ht()) return;
  const active = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus);
  if (u2.reformerDemand?.active && (u2.reformerDemand.met ? gameState.story.reputationScore = Math.min(100, (gameState.story.reputationScore || 50) + 2) : active.forEach((e) => {
    e.stats && (e.stats.comfort = Math.max(0, (e.stats.comfort || 60) - 3));
  })), u2.underground?.active && Math.random() < 0.5) {
    const gain = 500 * (gameState.story.factions?.underground?.strength || 1) * (gameState.story.currentAct || 1);
    gameState.cash = (gameState.cash || 0) + gain, "function" == typeof showNotification && showNotification(`\u{1F311} An off-the-books deal nets ${xu(gain)}.`, "info"), Math.random() < 0.15 && (gameState.story.reputationScore = Math.max(0, (gameState.story.reputationScore || 50) - 5), void 0 !== StoryEngine && StoryEngine.addJournalEntry({ title: "\u{1F311} Whispers of a Scandal", content: "One of the underground's deals left a trail. Nothing proven \u2014 yet. Your reputation takes a quiet hit.", type: "faction", memorable: true }));
  }
}
function sn(e, t = "missed_payroll", n = 1) {
  if (!e || 0 === e.length || "function" != typeof createSocialPost) return;
  const a = { missed_payroll: ["Direct deposit said 'pending.' It has been 'pending' since Friday.", "Fun fact: my landlord does not accept 'pending.'", "Updating my resume on my lunch break. The lunch I packed. From home.", "Payroll is 'being processed.' So is my patience.", "Day three of pretending the paycheck is just fashionably late."], underpaid: ["checked the market rate for my job today. interesting.", "love what I do. wish what I do loved me back financially.", "Recruiter DMs are starting to look... compelling.", "Performance review: exceeds expectations. Paycheck: declines comment."], debt_collectors: ["There is a man in the lobby with a flamingo lapel pin and he is *smiling*.", "Why does the 'Client Success Manager' know my badge number?", "The office paperweights are disappearing one meeting at a time.", "Saw the company's lender's car outside. It's nicer than the company."] }[t] || ["Thinking a lot about compensation lately."], o = Math.min(3, Math.max(1, Math.floor(e.length / 3) + (n >= 2 ? 1 : 0))), i = [...e].sort(() => Math.random() - 0.5).slice(0, o), s = gameState.time?.currentTime || Date.now();
  i.forEach((e2, t2) => {
    let o2 = a[Math.floor(Math.random() * a.length)], r = [];
    n >= 2 && t2 > 0 && (o2 = `@${i[0].name} said it best. The books are 'fine,' apparently. So where's the money?`, r = [i[0].name]), createSocialPost({ authorId: e2.id, authorName: e2.name, type: "complaint", content: o2, timestamp: s + 3e4 * t2, likes: [], comments: [], mentions: r, mood: "frustrated", tags: ["payroll", "worklife"] });
  });
}
async function ln(e, t, n = "grateful") {
  if ("function" != typeof createSocialPost || "function" != typeof queuedGenerateText) return;
  const o = e.personality || {}, s = e.stats?.affection || 50, r = e.intimacy || 0, grateful = "grateful" === n, u2 = "number" == typeof t && t > 0 ? `$${wu(t)} ` : "", voice = [dv(o.outgoing || 50, "outgoing"), dv(o.professional || 50, "professional"), dv(o.flirty || 50, "flirty"), dv(o.confidence || 50, "confident"), dv(o.humor || 50, "humorous")].join(", "), G2 = grateful && ("function" != typeof Ue || !Ue()) && (o.flirty || 50) > 55 && s > 55 && r > 40, c = Math.random();
  let tone, explicitLevel = 0;
  grateful ? G2 && c < 0.2 ? (tone = 'flirty and sexually suggestive about how you intend to "thank" @TheBoss for the raise \u2014 bold, adult, and in your own voice', explicitLevel = 2) : tone = (o.flirty || 50) > 50 && s > 60 && c < 0.4 ? "playful and a little flirty, teasing @TheBoss about the raise" : c < 0.68 ? "genuinely grateful, maybe a touch emotional about being recognized" : c < 0.88 ? "excited and a bit braggy \u2014 you earned this; maybe mention what you'll do with the extra money" : "dry, witty, or chaotic \u2014 an unexpected creative take on getting a raise" : tone = "muted and a little uncertain, processing some compensation news";
  const prompt = `You are ${e.name}, a ${e.age || 25}-year-old ${"Male" === e.gender ? "man" : "woman"} posting on social media.

Your personality: ${voice}
Your affection toward your boss: ${s}/100
${r > 30 ? `Your intimacy level with boss: ${r}/100 (close/flirty)` : ""}

\u{1F4B0} SITUATION: You just got a ${u2}RAISE (a higher salary) at your job${grateful ? "" : " \u2014 though it's complicated"}!

Write a post that is ${tone}. 1-2 sentences. Sound like a real person on social media.

RULES:
- Write ONLY the post text, nothing else
- 1-2 emojis max
- NO hashtags
- NO meta-commentary or explanations

Write ONLY the post:`;
  try {
    let a = await queuedGenerateText(prompt, { temperature: 0.95, max_tokens: 100, stopSequences: ["\n\n", "---", "Rating:", "(Note:"] }, `Generating raise reaction post for ${e.name}`);
    if (a = extractText(a), a = a.replace(/\{[A-Z]+:[^}]*\}\s*/g, ""), a = a.replace(/^\*\*[^*]+\*\*\s*/g, ""), a = a.split(/\n\s*\(/)[0].trim(), a = a.replace(/\b(the\s+)?([Mm]y\s+)?([Oo]ur\s+)?[Bb]oss\b/g, "@TheBoss"), a = a.replace(/@@TheBoss/g, "@TheBoss"), a = a.replace(/@[Bb]oss\b/g, "@TheBoss"), "function" == typeof cleanWithLearning && (a = cleanWithLearning(a)), !a || a.length < 2) return;
    createSocialPost({ authorId: e.id, authorName: e.name, type: explicitLevel > 0 ? "lewd" : "appreciation", content: a, timestamp: gameState.time?.currentTime || Date.now(), likes: [], comments: [], mentions: a.includes("@TheBoss") ? ["TheBoss"] : [], mood: "excited", tags: ["raise", "grateful", "worklife"], explicitLevel, nsfwLevel: explicitLevel });
  } catch (u3) {
    console.error("[AI] Raise post generation failed - discarding post:", u3);
  }
}
function getPayWeekStart(e) {
  const t = new Date(e), n = t.getDay(), a = 0 === n ? 6 : n - 1;
  return t.setDate(t.getDate() - a), t.setHours(0, 0, 0, 0), t.getTime();
}
function calculateDaysWorkedThisWeek(e, t, n) {
  const a = e.hireDate || 0, o = Math.max(t, a), i = new Date(o), s = new Date(n);
  let r = 0;
  const l = new Date(i);
  for (l.setHours(12, 0, 0, 0); l <= s; ) {
    const e2 = l.getDay();
    e2 >= 1 && e2 <= 5 && r++, l.setDate(l.getDate() + 1);
  }
  return Math.min(5, r);
}
function getWeeklyPayroll(e = false) {
  const t = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.career?.level || 1) < 7);
  let n = 0;
  const a = gameState.time?.currentTime || Date.now(), o = gameState.payroll?.payWeekStart || getPayWeekStart(a);
  return t.forEach((t2) => {
    const i = getScaledSalary(t2.career?.salary || 1e5), s = Math.floor(i / 52);
    if (e) {
      const e2 = calculateDaysWorkedThisWeek(t2, o, a);
      n += Math.floor(s * (e2 / 5));
    } else n += s;
  }), n;
}
function getPayrollBreakdown() {
  const e = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.career?.level || 1) < 7), t = gameState.time?.currentTime || Date.now(), n = gameState.payroll?.payWeekStart || getPayWeekStart(t);
  return e.map((e2) => {
    const a = e2.career?.salary || 1e5, o = getScaledSalary(a), i = Math.floor(o / 52), s = calculateDaysWorkedThisWeek(e2, n, t);
    return { employee: e2, baseSalary: a, scaledSalary: o, fullWeeklyPay: i, daysWorked: s, proRatedPay: Math.floor(i * (s / 5)), isProRated: s < 5 };
  });
}
function showPayrollModal() {
  const e = getWeeklyPayroll(true), t = getWeeklyPayroll(false), n = getPayrollBreakdown(), a = n.filter((e2) => e2.isProRated).length, o = gameState.cash >= e, i = n.length;
  if (0 === i) return;
  const s = Math.floor(0.1 * e), r = t - e;
  let l = "";
  a > 0 && (l = `<div class="neg-quote"><div class="text-gold fw-600 mb-1">\u{1F4CB} Pro-Rated Pay (${a} employee${a > 1 ? "s" : ""})</div>${n.filter((e2) => e2.isProRated).slice(0, 3).map((e2) => `<div class="row-between fs-sm"><span>${e2.employee.name}</span><span class="text-pos num">${e2.daysWorked}/5 days \u2192 $${wu(e2.proRatedPay)}</span></div>`).join("")}${a > 3 ? `<div class="fs-xs text-mute mt-1">\u2026and ${a - 3} more</div>` : ""}<div class="text-pos fs-sm mt-1 num">\u{1F4B0} You save $${wu(r)} this week</div></div>`);
  const c = document.getElementById("payrollModal");
  c && c.remove();
  const d = document.createElement("div");
  d.id = "payrollModal", d.className = "fuoc-ui neg-overlay", d.innerHTML = ` <div class="neg-modal"> <div class="neg-head"> <div class="neg-id"> <div class="neg-name">\u{1F4B0} Friday Payday</div> <div class="neg-meta">Time to pay your ${i} employee${i > 1 ? "s" : ""}</div> </div> </div> ${l} <div class="neg-refs"> <div class="neg-ref"><span class="t">Payroll due</span><span class="num text-neg">$${wu(e)}${a > 0 ? ` <span class="fs-xs text-mute">(full wk $${wu(t)})</span>` : ""}</span></div> <div class="neg-ref"><span class="t">Your cash</span><span class="num ${o ? "text-pos" : "text-neg"}">$${wu(gameState.cash)}</span></div> </div> ${o ? "" : `<div class="neg-preview text-neg">\u26A0\uFE0F You can't afford payroll. Take a loan, delay it, or let the shortfall go to arrears.</div>`} <div class="neg-actions" style="flex-direction: column;"> <button onclick="payNowFromModal()" ${o ? "" : "disabled"} class="btn btn--lg btn--be w-full">\u2713 Pay Now ($${wu(e)})</button> <button onclick="payEarlyBonusFromModal()" ${gameState.cash < e + s ? "disabled" : ""} class="btn btn--lg btn--outline w-full">\u{1F381} Pay + 10% Bonus ($${wu(e + s)})</button> <button onclick="delayPayroll()" class="btn btn--lg btn--k w-full">\u23F0 Delay Payment</button> <button onclick="openLoanFromPayroll()" class="btn btn--lg btn--aj w-full">\u{1F3E6} Take Out a Loan First</button> </div> </div>`, document.body.appendChild(d);
}
function closePayrollModal() {
  const e = document.getElementById("payrollModal");
  e && e.remove();
}
function payNowFromModal() {
  processWeeklyPayroll(), closePayrollModal();
}
function payEarlyBonusFromModal() {
  const e = getWeeklyPayroll(true), t = Math.floor(0.1 * e);
  processWeeklyPayroll(), gameState.cash -= t;
  const n = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.career?.level || 1) < 7);
  n.forEach((e2) => {
    e2.stats || (e2.stats = {}), e2.stats.affection = Math.min(100, (e2.stats.affection || 50) + 10), e2.stats.productivity = Math.min(100, (e2.stats.productivity || 50) + 5), e2.stats.trust = Math.min(100, (e2.stats.trust || 50) + 5);
  });
  const a = n.length > 0 ? Math.floor(t / n.length) : 0;
  a >= 500 && Yo(n, a, "payday_bonus"), showNotification(`\u{1F381} Paid bonus of $${wu(t)}! Employees are thrilled!`, "success"), closePayrollModal();
}
function delayPayroll() {
  gameState.payroll || (gameState.payroll = {}), gameState.payroll.delayedWeeks = (gameState.payroll.delayedWeeks || 0) + 1;
  const e = gameState.payroll.delayedWeeks, t = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.career?.level || 1) < 7);
  t.forEach((t2) => {
    t2.stats || (t2.stats = {}), t2.stats.productivity = Math.max(10, (t2.stats.productivity || 50) - 10 * e), t2.stats.affection = Math.max(0, (t2.stats.affection || 50) - 5 * e), t2.stats.trust = Math.max(0, (t2.stats.trust || 50) - 8 * e);
  });
  let n = "";
  1 === e ? n = "\u26A0\uFE0F Employees are grumbling about late pay. Productivity -10%." : 2 === e ? n = "\u{1F620} Employees are angry! Productivity -20%, morale dropping." : e >= 3 && (n = "\u{1F6A8} CRITICAL: Employees may start quitting! Pay them immediately!", t.forEach((t2) => {
    Math.random() < 0.15 * (e - 2) && (t2.employmentStatus = "resigned", t2.hired = false, showNotification(`\u{1F624} ${t2.name} quit due to unpaid wages!`, "error"));
  })), showNotification(n, e >= 3 ? "error" : "warning"), closePayrollModal(), updatePayrollTab();
}
function openLoanFromPayroll() {
  closePayrollModal(), switchTab("payroll");
}
async function payNow() {
  const e = gameState.payroll?.delayedWeeks || 0, t = (gameState.payroll?.arrears?.amount || 0) + (e > 0 ? getWeeklyPayroll() * e : 0);
  if (!(t <= 0)) {
    if (gameState.cash < t) showNotification(`\u274C Need $${wu(t)} to pay all owed wages!`, "error");
    else if (await Ev(`Pay all owed wages?

Total: $${wu(t)}`, "Clear Payroll Debt", { type: "warning", confirmText: "Pay All" })) {
      if (gameState.cash < t) return void showNotification(`\u274C No longer have enough cash ($${wu(t)} needed)!`, "error");
      gameState.cash -= t, gameState.payroll.delayedWeeks = 0, gameState.payroll.arrears && (gameState.payroll.arrears = { amount: 0, sinceWeekId: null, missedCount: 0 }), gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.career?.level || 1) < 7).forEach((e2) => {
        e2.stats || (e2.stats = {}), e2.stats.productivity = Math.min(100, (e2.stats.productivity || 50) + 5), e2.stats.trust = Math.min(100, (e2.stats.trust || 50) + 3), zn(e2, "unpaid");
      }), showNotification(`\u2713 Paid $${wu(t)} in back wages. Employees relieved.`, "success"), updatePayrollTab();
    }
  }
}
function cn() {
  const e = gameState.time?.currentTime || Date.now(), t = new Date(e), n = t.getDay(), a = t.getDate() - n + (0 === n ? -6 : 1), o = new Date(t.setDate(a)), i = o.getFullYear();
  return `${i}-W${Math.ceil(((o - new Date(i, 0, 1)) / 864e5 + 1) / 7).toString().padStart(2, "0")}`;
}
function dn() {
  if (!gameState.payroll) return false;
  const e = cn();
  return gameState.payroll.lastPaidWeek === e;
}
async function payEarlyBonus() {
  if (dn()) return void showNotification("\u26A0\uFE0F Payroll already paid this week! Wait until next Monday.", "warning");
  const e = getWeeklyPayroll(), t = Math.floor(0.1 * e), n = e + t;
  if (e <= 0) showNotification("\u2139\uFE0F No employees to pay!", "info");
  else if (gameState.cash < n) showNotification(`\u274C Need $${wu(n)} for payroll + bonus!`, "error");
  else if (await Ev(`Pay this week's salaries early with a 10% bonus?

Payroll: $${wu(e)}
Bonus: $${wu(t)}
Total: $${wu(n)}

+10 Affection, +5 Productivity for all employees!`, "Early Bonus Payment", { type: "info", confirmText: "Pay Bonus" })) {
    if (gameState.cash < n) return void showNotification(`\u274C No longer have enough cash ($${wu(n)} needed)!`, "error");
    gameState.cash -= n, gameState.payroll || (gameState.payroll = {}), gameState.payroll.lastPaidWeek = cn(), gameState.payroll.lastPayday = gameState.time?.currentTime || Date.now();
    const e2 = gameState.employees.filter((e3) => e3.hired && "active" === e3.employmentStatus && (e3.career?.level || 1) < 7);
    e2.forEach((e3) => {
      e3.stats || (e3.stats = {}), e3.stats.affection = Math.min(100, (e3.stats.affection || 50) + 10), e3.stats.productivity = Math.min(100, (e3.stats.productivity || 50) + 5), e3.stats.trust = Math.min(100, (e3.stats.trust || 50) + 5);
    }), gameState.payroll.weeklyPayrollHistory || (gameState.payroll.weeklyPayrollHistory = []), gameState.payroll.weeklyPayrollHistory.push({ date: gameState.payroll.lastPayday, amount: n, employeeCount: e2.length, hadEnough: true, wasEarlyBonus: true }), showNotification("\u{1F381} Paid early bonus! Employees love you!", "success"), updatePayrollTab();
  }
}
function toggleAutoPay() {
  gameState.payroll || (gameState.payroll = {}), gameState.payroll.autoPayEnabled = !gameState.payroll.autoPayEnabled;
  const e = document.getElementById("payrollAutoPay");
  e && (e.checked = gameState.payroll.autoPayEnabled), showNotification(gameState.payroll.autoPayEnabled ? "\u2713 Auto-pay enabled. Payroll will be automatic on Fridays." : "\u26A0\uFE0F Auto-pay disabled. You'll need to manually pay each Friday.", gameState.payroll.autoPayEnabled ? "success" : "warning");
}
