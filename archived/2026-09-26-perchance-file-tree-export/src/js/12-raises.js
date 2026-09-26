// ============================================================================
// 12-raises — Salary advances, raise requests, raise negotiation, bonus pool, updatePayrollTab.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function jn() {
  gameState.salaryAdvances || (gameState.salaryAdvances = []);
  const e = gameState.time?.currentTime || Date.now();
  if (gameState.salaryAdvances = gameState.salaryAdvances.filter((t2) => e - t2.requestedAt < 6048e5), gameState.salaryAdvances.length >= 2) return;
  const t = gameState.employees.filter((t2) => t2.hired && "active" === t2.employmentStatus && (t2.career?.level || 1) < 7 && !(t2.advanceDebt && t2.advanceDebt.remaining > 0) && !gameState.salaryAdvances.some((e2) => e2.employeeId === t2.id) && Math.random() < 0.04 + Math.max(0, 50 - (t2.stats?.comfort || 50)) / 1e3);
  if (0 === t.length) return;
  const n = t[Math.floor(Math.random() * t.length)], a = 1 + Math.floor(3 * Math.random()), o = Math.floor(getScaledSalary(n.career?.salary || 1e5) / 52) * a, i = ["Car made a sound. The expensive kind.", "Rent went up. My landlord cited 'the economy.'", "Family thing. I'd rather not get into it.", "Vet bills. He's fine now. He'd better be.", "My water heater has opinions about being alive."];
  gameState.salaryAdvances.push({ id: `adv_${Date.now()}`, employeeId: n.id, employeeName: n.name, weeks: a, amount: o, reason: i[Math.floor(Math.random() * i.length)], requestedAt: e }), showNotification(`\u{1F4B8} ${n.name} is asking for a ${a}-week salary advance.`, "info"), updatePayrollTab();
}
function approveAdvance(e, t = null) {
  const n = gameState.salaryAdvances?.find((t2) => t2.id === e);
  if (!n) return;
  const a = gameState.employees.find((e2) => e2.id === n.employeeId);
  if (!a) return void (gameState.salaryAdvances = gameState.salaryAdvances.filter((t2) => t2.id !== e));
  const o = Math.max(0, t ?? n.amount);
  if (o <= 0) return;
  if (gameState.cash < o) return void showNotification(`\u274C Need $${wu(o)} on hand for the advance.`, "error");
  gameState.cash -= o, a.advanceDebt = { remaining: (a.advanceDebt?.remaining || 0) + o, perWeek: Math.max(1, Math.ceil(o / (2 * n.weeks))) }, a.stats || (a.stats = {});
  const i = o >= n.amount;
  a.stats.trust = Math.min(100, (a.stats.trust || 50) + (i ? 8 : 4)), a.stats.affection = Math.min(100, (a.stats.affection || 50) + (i ? 5 : 2)), a.advanceDenials = 0, gameState.salaryAdvances = gameState.salaryAdvances.filter((t2) => t2.id !== e), showNotification(i ? `\u2713 Advanced ${a.name} $${wu(o)} \u2014 repaid via payroll over ${2 * n.weeks} weeks.` : `\u2713 Advanced ${a.name} $${wu(o)} (less than asked). They'll manage.`, "success"), updatePayrollTab();
}
async function denyAdvance(e) {
  const t = gameState.salaryAdvances?.find((t2) => t2.id === e);
  if (!t) return;
  const n = gameState.employees.find((e2) => e2.id === t.employeeId);
  gameState.salaryAdvances = gameState.salaryAdvances.filter((t2) => t2.id !== e), n && (n.stats || (n.stats = {}), n.advanceDenials = (n.advanceDenials || 0) + 1, n.stats.trust = Math.max(0, (n.stats.trust || 50) - 5), n.advanceDenials >= 3 && (n.stats.trust = Math.max(0, n.stats.trust - 10), qn(n, { key: "strapped", emoji: "\u{1F4B8}", label: "Strapped", tone: "debuff", durationDays: 21 }), sn([n], "underpaid", 1))), showNotification(`\u274C Denied ${t.employeeName}'s advance request.`, "warning"), updatePayrollTab();
}
function negotiateAdvance(e) {
  const t = gameState.salaryAdvances?.find((t2) => t2.id === e);
  t && wn(` <div class="neg-head"> <div class="neg-id"> <div class="neg-name">\u{1F4B8} Salary Advance \u2014 ${t.employeeName}</div> <div class="neg-meta">"${t.reason}"</div> </div> <button class="btn btn--aj neg-x" onclick="closeLoanProductModal()">\u2715</button> </div> <div class="neg-refs"> <div class="neg-ref"><span class="t">Asking</span><span class="num">$${wu(t.amount)}</span></div> <div class="neg-ref"><span class="t">Repayment</span><span class="num">${2 * t.weeks} wk deductions</span></div> </div> <label class="neg-field"><span class="t">Advance ($)</span><input type="number" id="advAmount" inputmode="numeric" min="0" step="100" value="${t.amount}"></label> <div class="neg-actions"> <button class="btn btn--be" id="advConfirm">Advance</button> <button class="btn btn--aj" onclick="closeLoanProductModal()">Cancel</button> </div>`, (n) => {
    n.querySelector("#advConfirm").onclick = () => {
      const t2 = parseInt(document.getElementById("advAmount")?.value, 10) || 0;
      closeLoanProductModal(), approveAdvance(e, t2);
    };
  });
}
function generateRaiseRequests() {
  gameState.raiseRequests || (gameState.raiseRequests = []);
  const e = gameState.time?.currentTime || Date.now();
  if (gameState.raiseRequests.filter((t2) => e - t2.requestedAt >= 6048e5).forEach((t2) => {
    const n2 = gameState.employees.find((e2) => e2.id === t2.employeeId);
    n2 && n2.hired && (n2.stats || (n2.stats = {}), n2.stats.trust = Math.max(0, (n2.stats.trust || 50) - 5), showNotification(`\u{1F615} ${t2.employeeName}'s raise request expired unanswered.`, "warning"));
  }), gameState.raiseRequests = gameState.raiseRequests.filter((t2) => e - t2.requestedAt < 6048e5), gameState.raiseRequests.length >= 3) return;
  const t = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.career?.level || 1) < 7);
  if (0 === t.length) return;
  const n = t.filter((t2) => {
    if (gameState.raiseRequests.some((e2) => e2.employeeId === t2.id)) return false;
    if (t2.raiseCooldownUntil && e < t2.raiseCooldownUntil) return false;
    const n2 = t2.performanceScore || 50, a2 = t2.hireDate || Date.now(), o2 = 0.1 + n2 / 500 + 0.02 * Math.floor((e - a2) / 6048e5);
    return Math.random() < o2;
  });
  if (0 === n.length) return;
  const a = n[Math.floor(Math.random() * n.length)], o = a.career?.salary || 1e5, u2 = Math.max(0, (getMarketRate(a) - o) / o * 100), i = Math.min(50, Math.max(10 + Math.floor(15 * Math.random()) + (a.nextRaiseBump || 0), Math.floor(u2 / 2))), s = Math.floor(o * (i / 100)), r = ["I've been working really hard lately and feel I deserve more.", "I've taken on additional responsibilities and would like my salary to reflect that.", "I've been here a while now and think it's time for a raise.", "I got an offer from another company... but I'd rather stay here if the pay is right.", "With my performance lately, I think I've earned a bump.", "The cost of living has gone up and I need a little more to get by."], l = { id: `raise_${Date.now()}`, employeeId: a.id, employeeName: a.name, currentSalary: o, requestedRaise: s, raisePercent: i, reason: r[Math.floor(Math.random() * r.length)], requestedAt: e };
  gameState.raiseRequests.push(l), showNotification(`\u{1F4DD} ${a.name} is requesting a raise!`, "info"), updatePayrollTab();
}
async function approveRaise(e) {
  const t = gameState.raiseRequests?.find((t2) => t2.id === e);
  if (!t) return;
  const n = gameState.employees.find((e2) => e2.id === t.employeeId);
  n && await Ev(`Approve ${t.employeeName}'s raise request?

Current: $${wu(t.currentSalary)}/year
New: $${wu(t.currentSalary + t.requestedRaise)}/year
(+${t.raisePercent}%)`, "Approve Raise", { type: "info", confirmText: "Approve" }) && (n.career.salary = t.currentSalary + t.requestedRaise, n.stats || (n.stats = {}), n.stats.affection = Math.min(100, (n.stats.affection || 50) + 15), n.stats.trust = Math.min(100, (n.stats.trust || 50) + 10), n.stats.productivity = Math.min(100, (n.stats.productivity || 50) + 5), n.nextRaiseBump = 0, n.raiseCooldownUntil = (gameState.time?.currentTime || Date.now()) + 24192e5, (n.career.salary || 1e5) >= 0.95 * getMarketRate(n) && zn(n, "underpaid"), gameState.raiseRequests = gameState.raiseRequests.filter((t2) => t2.id !== e), showNotification(`\u2713 ${t.employeeName}'s raise approved! They're thrilled!`, "success"), updatePayrollTab());
}
async function denyRaise(e) {
  const t = gameState.raiseRequests?.find((t2) => t2.id === e);
  if (!t) return;
  const n = gameState.employees.find((e2) => e2.id === t.employeeId);
  n && await Ev(`Deny ${t.employeeName}'s raise request?

This will hurt their morale and they may become less productive.`, "Deny Raise", { type: "danger", confirmText: "Deny" }) && (n.stats || (n.stats = {}), n.stats.affection = Math.max(0, (n.stats.affection || 50) - 10), n.stats.trust = Math.max(0, (n.stats.trust || 50) - 15), n.stats.productivity = Math.max(20, (n.stats.productivity || 50) - 10), qn(n, { key: "passedover", emoji: "\u{1F612}", label: "Passed Over", tone: "debuff", durationDays: 14 }), n.nextRaiseBump = (n.nextRaiseBump || 0) + 5, n.raiseCooldownUntil = (gameState.time?.currentTime || Date.now()) + 12096e5, gameState.raiseRequests = gameState.raiseRequests.filter((t2) => t2.id !== e), showNotification(`\u274C ${t.employeeName}'s raise denied. They're disappointed.`, "warning"), updatePayrollTab());
}
function counterOfferRaise(e) {
  const t = gameState.raiseRequests?.find((t2) => t2.id === e);
  t && openRaiseNegotiation(t.employeeId, e);
}
function qn(e, t) {
  if (!e) return;
  e.flags || (e.flags = { systemFlags: [], customFlags: [] }), Array.isArray(e.flags.customFlags) || (e.flags.customFlags = []);
  const n = gameState.time?.currentTime ?? Date.now(), a = n + 864e5 * t.durationDays;
  e.flags.customFlags = e.flags.customFlags.filter((e2) => !("payroll" === e2.category && e2.key === "payroll:" + t.key)), e.flags.customFlags.push({ id: "function" == typeof Qe ? Qe() : "pf" + Date.now() + Math.random(), key: "payroll:" + t.key, category: "payroll", source: "payroll", setBy: "payroll", emoji: t.emoji, playerDescription: t.label, priority: "medium", affectsContext: false, setDate: n, timestamp: n, duration: 864e5 * t.durationDays, expirationDate: a, autoRemove: a, metadata: { tone: t.tone, programName: "Payroll" } });
}
function zn(e, t) {
  e?.flags?.customFlags && (e.flags.customFlags = e.flags.customFlags.filter((e2) => !("payroll" === e2.category && e2.key === "payroll:" + t)));
}
let Gn = null;
function openRaiseNegotiation(e, t = null) {
  const n = gameState.employees.find((t2) => t2.id === e);
  if (!n || !n.career) return;
  const a = t ? gameState.raiseRequests?.find((e2) => e2.id === t) : null, o = n.career.salary || 1e5, i = getMarketRate(n), s = a ? a.requestedRaise : Math.max(Math.max(0, i - o), Math.floor(0.05 * o));
  closeRaiseNegotiation(), Gn = { employeeId: e, requestId: t };
  const r = gameState.hierarchyLevels?.[n.career.level || 1] || {}, l = n.profileImage ? `<img class="avatar-sm" src="${n.profileImage}">` : `<div class="avatar-sm init" style="--cr:${r.color || "var(--d)"}">${(n.name || "?").charAt(0).toUpperCase()}</div>`, c = gameState.products?.find((e2) => n.productId && e2.id === n.productId || n.productManaged && e2.name === n.productManaged), d = gameState.locations?.find((e2) => e2.id === (c?.locationId || n.locationId)), p = document.createElement("div");
  p.id = "raiseNegModal", p.className = "fuoc-ui neg-overlay", p.innerHTML = ` <div class="neg-modal"> <div class="neg-head"> ${l} <div class="neg-id"> <div class="neg-name">${n.name}</div> <div class="neg-meta">${r.title || n.career.title || "Staff"}${d ? " \xB7 " + d.name.replace(/^\S+\s/, "") : ""}</div> </div> <button class="btn btn--aj neg-x" onclick="closeRaiseNegotiation()">\u2715</button> </div> ${a ? `<div class="neg-quote">"${a.reason}"</div>` : ""} <div class="neg-refs"> <div class="neg-ref"><span class="t">Current</span><span class="num">$${wu(o)}</span></div> <div class="neg-ref"><span class="t">Market</span><span class="num">$${wu(i)}</span></div> ${a ? `<div class="neg-ref"><span class="t">Asking</span><span class="num">+$${wu(a.requestedRaise)}</span></div>` : ""} </div> <div class="neg-inputs"> <label class="neg-field"><span class="t">Raise ($/yr)</span><input type="number" id="negAmount" inputmode="numeric" min="0" step="100" value="${s}"></label> <label class="neg-field"><span class="t">Raise (%)</span><input type="number" id="negPercent" inputmode="decimal" min="0" step="0.5" value="${o > 0 ? Math.round(s / o * 1e3) / 10 : 0}"></label> </div> <div class="neg-preview" id="negPreview"></div> <div class="neg-actions"> <button class="btn btn--be" id="negOfferBtn">Offer</button> ${a ? '<button class="btn btn--outline" id="negDeclineBtn">Decline</button>' : ""} <button class="btn btn--aj" onclick="closeRaiseNegotiation()">Cancel</button> </div> </div>`, document.body.appendChild(p);
  const m = p.querySelector("#negAmount"), u2 = p.querySelector("#negPercent");
  m.addEventListener("input", () => {
    const e2 = parseInt(m.value, 10) || 0;
    u2.value = o > 0 ? Math.round(e2 / o * 1e3) / 10 : 0, Un();
  }), u2.addEventListener("input", () => {
    const e2 = parseFloat(u2.value) || 0;
    m.value = Math.floor(o * (e2 / 100)), Un();
  }), p.querySelector("#negOfferBtn").onclick = () => Wn(), a && (p.querySelector("#negDeclineBtn").onclick = () => Vn()), Un();
}
function closeRaiseNegotiation() {
  Gn = null;
  const e = document.getElementById("raiseNegModal");
  e && e.remove();
}
function Hn(e, t, n) {
  if (!t || n >= (t.requestedRaise || 0)) return 1;
  const a = t.requestedRaise > 0 ? n / t.requestedRaise : 1, o = ((e.stats?.trust ?? 50) - 50) / 50 * 0.1;
  return Math.max(0.05, Math.min(1, 0.15 + 0.9 * a + o));
}
function Un() {
  if (!Gn) return;
  const e = gameState.employees.find((e2) => e2.id === Gn.employeeId), t = Gn.requestId ? gameState.raiseRequests?.find((e2) => e2.id === Gn.requestId) : null, n = document.getElementById("negPreview");
  if (!e || !n) return;
  const a = parseInt(document.getElementById("negAmount")?.value, 10) || 0, o = e.career.salary || 1e5, i = getMarketRate(e), s = (o + a) / Math.max(1, i), r = Hn(e, t, a);
  let l, c;
  s >= 1.15 ? (l = '<span class="pos">Above market \u2014 generous</span>', c = "Trust ++ \xB7 Affection + \xB7 loyalty boost") : s >= 0.95 ? (l = '<span class="pos">Fair \u2014 at market</span>', c = "Trust + \xB7 Affection + \xB7 stable") : (l = '<span class="mid">Below market</span>', c = "Half goodwill \xB7 underpaid pressure remains");
  const d = t ? a >= t.requestedRaise ? '<span class="pos">Will accept</span>' : `${Math.round(100 * r)}% likely to accept \u2014 rejection stings` : '<span class="pos">Will accept</span>';
  n.innerHTML = `${d}<br>${l} \xB7 ${c}`;
}
function Yn(e, t, n) {
  e.career.salary = (e.career.salary || 1e5) + t, e.stats || (e.stats = {});
  const a = getMarketRate(e), o = e.career.salary / Math.max(1, a), i = n ? 1.25 : 1;
  let s;
  if (o >= 1.15) {
    const gen = Math.min(0.35, Math.max(0, Math.min(1.5, o) - 1.15)), gain = Math.round((12 + 23 * gen) * i);
    e.stats.trust = Math.min(100, (e.stats.trust || 50) + gain), e.stats.affection = Math.min(100, (e.stats.affection || 50) + 10), e.stats.productivity = Math.min(100, (e.stats.productivity || 50) + 5), qn(e, { key: "wellpaid", emoji: "\u{1F49B}", label: "Well Paid", tone: "buff", durationDays: 28 }), s = `\u{1F389} ${e.name} is thrilled \u2014 paid above market!`, "function" == typeof ln && ln(e, t, "grateful");
  } else o >= 0.95 ? (e.stats.trust = Math.min(100, (e.stats.trust || 50) + Math.round(10 * i)), e.stats.affection = Math.min(100, (e.stats.affection || 50) + 15), e.stats.productivity = Math.min(100, (e.stats.productivity || 50) + 5), s = `\u2713 ${e.name} accepted the raise. Fair pay, steady ship.`) : (e.stats.trust = Math.min(100, (e.stats.trust || 50) + Math.round(5 * i)), e.stats.affection = Math.min(100, (e.stats.affection || 50) + 7), e.stats.productivity = Math.min(100, (e.stats.productivity || 50) + 2), s = `\u2713 ${e.name} accepted \u2014 but they know it's below market.`);
  o >= 0.95 && zn(e, "underpaid"), e.nextRaiseBump = 0, e.raiseCooldownUntil = (gameState.time?.currentTime || Date.now()) + 24192e5, showNotification(s, "success");
}
function Wn() {
  if (!Gn) return;
  const e = gameState.employees.find((e2) => e2.id === Gn.employeeId), t = Gn.requestId ? gameState.raiseRequests?.find((e2) => e2.id === Gn.requestId) : null, n = parseInt(document.getElementById("negAmount")?.value, 10) || 0;
  if (!e) return void closeRaiseNegotiation();
  if (n <= 0) return void showNotification("Enter a raise amount (or Decline).", "warning");
  const a = Hn(e, t, n);
  !t || n >= (t.requestedRaise || 0) || Math.random() < a ? Yn(e, n, !t) : (e.stats || (e.stats = {}), e.stats.affection = Math.max(0, (e.stats.affection || 50) - 5), e.stats.trust = Math.max(0, (e.stats.trust || 50) - 8), qn(e, { key: "passedover", emoji: "\u{1F612}", label: "Passed Over", tone: "debuff", durationDays: 14 }), e.nextRaiseBump = (e.nextRaiseBump || 0) + 5, e.raiseCooldownUntil = (gameState.time?.currentTime || Date.now()) + 12096e5, showNotification(`\u{1F624} ${e.name} rejected the low offer.`, "warning")), t && (gameState.raiseRequests = gameState.raiseRequests.filter((e2) => e2.id !== t.id)), closeRaiseNegotiation(), updatePayrollTab(), "function" == typeof updatePeopleTab && updatePeopleTab();
}
function Vn() {
  if (!Gn?.requestId) return void closeRaiseNegotiation();
  const e = Gn.requestId;
  closeRaiseNegotiation(), denyRaise(e);
}
async function openBonusPoolModal() {
  const e = gameState.payroll?.bonusPool || 0, t = await Iv(`Current bonus pool: $${wu(e)}

Enter amount to add to the bonus pool (will be distributed to all employees):`, "\u{1F3C6} Bonus Pool", { defaultValue: "10000", placeholder: "Amount to add..." });
  if (null === t) return;
  const n = parseInt(t.replace(/[^0-9]/g, ""));
  if (isNaN(n) || n <= 0) return void showNotification("Invalid amount!", "error");
  if (gameState.cash < n) return void showNotification(`\u274C Need $${wu(n)} to fund bonus pool!`, "error");
  const a = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.career?.level || 1) < 7);
  if (0 === a.length) return void showNotification("No employees to give bonuses to!", "error");
  const o = Math.floor(n / a.length);
  await Ev(`Distribute $${wu(n)} in bonuses?

${a.length} employees will each receive $${wu(o)}

This will significantly boost morale!`, "Distribute Bonuses", { type: "info", confirmText: "Distribute" }) && (gameState.cash -= n, a.forEach((e2) => {
    e2.stats || (e2.stats = {}), e2.stats.affection = Math.min(100, (e2.stats.affection || 50) + 15), e2.stats.productivity = Math.min(100, (e2.stats.productivity || 50) + 10), e2.stats.trust = Math.min(100, (e2.stats.trust || 50) + 10);
  }), o >= 500 && Yo(a, o, "bonus_pool"), showNotification(`\u{1F389} Distributed $${wu(n)} in bonuses! Everyone is ecstatic!`, "success"), updatePayrollTab());
}
function updatePayrollTab() {
  const e = (5 - (pe?.getDay?.() ?? (/* @__PURE__ */ new Date()).getDay()) + 7) % 7 || 7, t = document.getElementById("payrollNextPayday"), n = document.getElementById("payrollPaydayCountdown");
  t && (t.textContent = "Friday"), n && (n.textContent = 0 === e ? "Today!" : `In ${e} day${e > 1 ? "s" : ""}`);
  const a = getWeeklyPayroll(), o = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.career?.level || 1) < 7).length, i = document.getElementById("payrollWeeklyTotal"), s = document.getElementById("payrollEmployeeCount");
  i && (i.textContent = wu(a)), s && (s.textContent = o);
  const r = dn(), l = document.getElementById("payrollCurrentCash"), c = document.getElementById("payrollCashStatus");
  if (l && (l.textContent = wu(gameState.cash)), c) if (r) c.textContent = "\u2713 Payroll paid this week!", c.className = "tile-sub text-pos";
  else {
    const e2 = gameState.cash >= a;
    c.textContent = e2 ? "\u2713 Can afford payroll" : "\u26A0\uFE0F Cannot afford payroll!", c.className = e2 ? "tile-sub" : "tile-sub text-neg";
  }
  n && (r ? (n.textContent = "\u2713 Paid!", n.className = "tile-sub text-pos") : (n.textContent = 0 === e ? "Today!" : `In ${e} day${e > 1 ? "s" : ""}`, n.className = "tile-sub"));
  const d = getTotalDebt(), p = document.getElementById("payrollTotalDebt"), m = document.getElementById("payrollDebtStatus");
  if (p && (p.textContent = wu(d)), m) {
    const e2 = gameState.loans?.length || 0;
    m.textContent = 0 === e2 ? "No active loans" : `${e2} active loan${e2 > 1 ? "s" : ""}`;
  }
  const u2 = document.getElementById("earlyPayBtn");
  u2 && (r ? (u2.disabled = true, u2.innerHTML = "\u2713 Payroll Paid This Week") : (u2.disabled = false, u2.innerHTML = "\u{1F381} Pay Early (+10% bonus to morale)"));
  const G2 = document.getElementById("payrollCreditPill");
  G2 && (G2.textContent = `Rating ${gn().label}`);
  const U2 = document.getElementById("payrollRunQuality");
  U2 && (U2.textContent = gameState.payroll?.lastRunQuality ? `Last run: ${gameState.payroll.lastRunQuality}` : "");
  const g = document.getElementById("payrollAutoPay");
  g && (g.checked = false !== gameState.payroll?.autoPayEnabled);
  const h = document.getElementById("payrollDelayedWarning"), y = document.getElementById("payrollDelayedWeeks"), f = document.getElementById("payrollDelayedAmount"), b = gameState.payroll?.delayedWeeks || 0, B = gameState.payroll?.arrears?.amount || 0;
  h && (h.style.display = b > 0 || B > 0 ? "block" : "none"), y && (y.textContent = B > 0 ? `$${wu(B)} in unpaid wages` : `${b} week(s) unpaid`), f && (f.textContent = wu(a * b + B));
  const v = document.getElementById("payrollPrestigeMultiplier");
  if (v) {
    const e2 = Math.pow(1.5, gameState.prestigeLevel || 0);
    v.textContent = e2.toFixed(2) + "x";
  }
  const w = document.getElementById("payrollEmployeeList");
  if (w) {
    const e2 = getPayrollBreakdown();
    0 === e2.length ? w.innerHTML = '<div class="empty-note">No employees on payroll</div>' : w.innerHTML = e2.map((e3) => {
      const t2 = gameState.hierarchyLevels?.[e3.employee.career?.level || 1] || {}, n2 = e3.isProRated, a2 = getMarketRate(e3.employee), o2 = e3.baseSalary / Math.max(1, a2), i2 = o2 >= 1.15 ? '<span class="text-pos" title="Above market">\u25B2 above market</span>' : o2 >= 0.9 ? '<span class="text-dim" title="At market">\u25C6 at market</span>' : '<span class="text-neg" title="Below market">\u25BC below market</span>', s2 = "function" == typeof Ld ? Ld(e3.employee) : "", r2 = gameState.locations?.find((t3) => t3.id === En(e3.employee));
      return ` <div class="subpanel row-between ${n2 ? "subpanel--hn" : ""}"> <div> <div class="fw-600">${e3.employee.name} ${s2}</div> <div class="fs-sm text-dim">${t2.title || "Staff"}${r2 ? " \xB7 " + r2.name.replace(/^\S+\s/, "") : ""}</div> <div class="fs-xs">${i2}</div> ${n2 ? `<div class="fs-xs text-gold num">\u{1F195} ${e3.daysWorked}/5 days this week</div>` : ""} </div> <div class="row"> <div class="text-right"> <div class="text-pos fw-600 num">$${wu(e3.scaledSalary)}/yr</div> ${n2 ? `<div class="fs-xs text-gold num">$${wu(e3.proRatedPay)} this week</div>` : `<div class="fs-xs text-dim num">$${wu(e3.fullWeeklyPay)}/week</div>`} </div> <button class="btn btn--aj" onclick="openRaiseNegotiation('${e3.employee.id}')" title="Adjust salary" style="min-width:44px;min-height:44px;">\u{1F4AC}</button> </div> </div> `;
    }).join("");
  }
  document.querySelectorAll("#payrollTab .loan-btn[data-loan]").forEach((t2) => {
    const n2 = LOAN_TYPES[t2.dataset.loan];
    if (!n2) return;
    const a2 = t2.querySelector(".loan-d");
    a2 && (a2.textContent = `$${wu(yn(t2.dataset.loan))} \u2022 ${(100 * n2.interestRate).toFixed(0)}% weekly`);
  });
  const J2 = document.getElementById("investLoanBtn"), ee2 = document.getElementById("investLoanDesc");
  J2 && (J2.disabled = !vn(), ee2 && (ee2.textContent = vn() ? `Up to $${wu(8 * hn())} \u2022 auto-repaid` : "Unlocks with 2nd location"));
  const te2 = document.getElementById("bondIssueBtn"), ne2 = document.getElementById("bondIssueDesc");
  te2 && (te2.disabled = !bn(), ne2 && (ne2.textContent = bn() ? `Rating ${gn().label} \u2022 ${(2 * gn().mult).toFixed(1)}%/wk coupon` : "Prestige 1+ or 4 locations"));
  const x = document.getElementById("payrollActiveLoans");
  if (x) {
    fn();
    const e2 = gameState.loans || [], bonds = gameState.bonds || [];
    0 === e2.length && 0 === bonds.length ? x.innerHTML = '<div class="empty-note">No active loans</div>' : x.innerHTML = e2.map((e3) => {
      const t2 = LOAN_TYPES[e3.type], n2 = e3.currentAmount - e3.principal;
      let a2 = t2?.name || "Loan", o2 = t2?.color || "var(--e)", i2 = `<span>Principal: $${wu(e3.principal)}</span><span>Interest: +$${wu(Math.max(0, n2))}</span>`;
      return "shark" === e3.kind ? (a2 = "\u{1F9A9} Pelican Capital", o2 = "var(--l)", i2 = `<span>Min Friday: $${wu(Math.floor(e3.currentAmount * (e3.minPaymentRate || 0.1)))}</span><span>${(100 * e3.interestRate).toFixed(0)}%/wk${e3.missedPayments ? ` \xB7 ${e3.missedPayments} missed` : ""}</span>`) : "investment" === e3.kind && (a2 = "\u{1F4C8} Investment Loan", o2 = "var(--j)", i2 = `<span>$${wu(e3.installment)}/wk auto</span><span>${e3.garnishing ? "\u26A0\uFE0F garnishing" : `~${Math.max(1, Math.ceil(e3.currentAmount / Math.max(1, e3.installment)))} wk left`}</span>`), ` <div class="subpanel" style="border-left:3px solid ${o2}; border-radius:0 var(--r2) var(--r2) 0;"> <div class="row-between mb-1"> <span class="fw-600" style="color:${o2};">${a2}</span> <span class="text-neg fw-600 num">$${wu(e3.currentAmount)}</span> </div> <div class="row-between fs-sm text-dim mb-1 num">${i2}</div> <div class="row"> <button onclick="repayLoan('${e3.id}')" class="btn btn--fg flex-1">Pay Full</button> <button onclick="repayLoan('${e3.id}', ${Math.floor(e3.currentAmount / 2)})" class="btn btn--aj flex-1">Pay Half</button> </div> <div class="row mt-1"> <input type="number" id="loanCustomAmt-${e3.id}" placeholder="Custom amount" min="0" max="${e3.currentAmount}" step="1" class="flex-1" style="min-width:0;" /> <button onclick="payCustomLoanAmount('${e3.id}')" class="btn btn--aj">Pay</button> </div> </div> `;
    }).join("") + bonds.map((e3) => ` <div class="subpanel" style="border-left:3px solid var(--m); border-radius:0 var(--r2) var(--r2) 0;"> <div class="row-between mb-1"> <span class="fw-600 text-gold">\u{1F3DB}\uFE0F Corporate Bond</span> <span class="text-neg fw-600 num">$${wu(e3.principal)}</span> </div> <div class="row-between fs-sm text-dim num"> <span>Coupon $${wu(Math.floor(e3.principal * e3.couponRate))}/wk</span> <span>Matures in ${Math.max(0, e3.termWeeks - e3.weeksElapsed)} wk${e3.missedCoupons ? ` \xB7 ${e3.missedCoupons} missed` : ""}</span> </div> </div> `).join("");
  }
  const oe2 = document.getElementById("payrollCoverageGrid");
  if (oe2) {
    const e2 = Nn(), t2 = Object.entries(e2.byLocation).filter(([, e3]) => e3.total > 0 || e3.accountants.length > 0);
    0 === t2.length ? oe2.innerHTML = '<div class="empty-note">No employees on payroll</div>' : oe2.innerHTML = t2.map(([t3, n2]) => {
      const a2 = gameState.locations?.find((e3) => e3.id === t3), o2 = n2.total <= n2.capacity, i2 = n2.accountants.map((e3) => `<span class="pill" title="Capacity ${$n(e3)} \xB7 level rises with promotions">${e3.name} \xB7 L${Sn(e3)} <button onclick="reassignAccountant('${e3.id}')" class="btn btn--aj" style="min-height:28px;padding:0 6px;" title="Reassign department">\u2194</button></span>`).join(" ");
      return ` <div class="subpanel"> <div class="row-between mb-1"> <span class="fw-600">${a2?.name || t3}</span> <span class="${o2 ? "text-pos" : "text-neg"} fw-600 num">${Math.min(n2.total, n2.capacity)}/${n2.total} covered</span> </div> <div class="fs-xs text-dim">${i2 || (o2 ? "" : '<span class="text-neg">\u26A0\uFE0F No accountant \u2014 manual payroll every Friday</span>')}</div> </div>`;
    }).join("");
  }
  const ae2 = document.getElementById("acctPoolGrid");
  if (ae2) {
    Dn();
    const e2 = gameState.payroll.accountantPool || [];
    ae2.innerHTML = e2.map((e3) => {
      const t3 = Tn[e3.accountantTrait] || { label: "\u2014", emoji: "\u2022", tone: "mixed" };
      return ` <div class="acct-card"> <div class="row-between"><span class="fw-600">${yl(e3)}</span><span class="pill">Lv ${e3.career.level}</span></div> <div class="big num">${$n(e3)} <span class="fs-xs text-dim">capacity</span></div> <span class="chip ${"buff" === t3.tone ? "chip--buff" : "chip--debuff"}"><span>${t3.emoji}</span><span class="lbl">${t3.label}</span></span> <div class="fs-sm num">$${wu(e3.salaryAsk)}<span class="fs-xs text-dim">/yr ask</span></div> <button class="btn btn--outline" onclick="openAccountantProfile('${e3.id}')">View &amp; Hire</button> </div>`;
    }).join("") + Array(Math.max(0, 3 - e2.length)).fill('<div class="acct-card"><div class="empty-note">Slot open \u2014 refills with the next drip</div></div>').join("");
    const t2 = document.getElementById("acctPoolCountdown");
    if (t2) {
      const e3 = Math.max(0, Math.ceil(((gameState.payroll.acctPoolNextRefresh || 0) - (gameState.time?.currentTime || Date.now())) / 864e5));
      t2.textContent = `New candidate in ${e3} day${1 === e3 ? "" : "s"}`;
    }
    const n2 = document.getElementById("acctPoolRecruitBtn");
    if (n2) {
      const e3 = void 0 !== StoryEngine && StoryEngine.calculateScaledCost ? StoryEngine.calculateScaledCost(5e3, "medium") : 5e3;
      n2.textContent = `Recruit New Pool \u2014 $${wu(e3)}`;
    }
  }
  const S = document.getElementById("payrollHistory");
  if (S) {
    const e2 = gameState.payroll?.weeklyPayrollHistory || [];
    0 === e2.length ? S.innerHTML = '<div class="empty-note">No payroll history yet</div>' : S.innerHTML = e2.slice().reverse().slice(0, 8).map((e3) => ` <div class="list-row"> <span class="text-dim fs-sm">${new Date(e3.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span> <span class="fw-600 ${e3.hadEnough ? "text-pos" : "text-neg"}">$${wu(e3.amount)}</span> </div> `).join("");
  }
  const k = document.getElementById("payrollRaiseRequests");
  if (k) {
    const e2 = gameState.raiseRequests || [], u3 = gameState.salaryAdvances || [], G3 = u3.map((e3) => ` <div class="subpanel"> <div class="row-between mb-1"> <span class="fw-600">\u{1F4B8} ${e3.employeeName}</span> <span class="text-gold num">$${wu(e3.amount)} advance</span> </div> <div class="fs-sm text-dim italic mb-1">"${e3.reason}"</div> <div class="row"> <button onclick="approveAdvance('${e3.id}')" class="btn btn--be flex-1">\u2713 Advance</button> <button onclick="negotiateAdvance('${e3.id}')" class="btn btn--outline flex-1">\u2194 Adjust</button> <button onclick="denyAdvance('${e3.id}')" class="btn btn--k flex-1">\u2715 Deny</button> </div> </div> `).join("");
    0 === e2.length && 0 === u3.length ? k.innerHTML = '<div class="empty-note">No pending requests</div>' : k.innerHTML = e2.map((e3) => ` <div class="subpanel"> <div class="row-between mb-1"> <span class="fw-600">\u{1F4DD} ${e3.employeeName}</span> <span class="text-gold num">+${e3.raisePercent}% ($${wu(e3.requestedRaise)})</span> </div> <div class="fs-sm text-dim italic mb-1">"${e3.reason}"</div> <div class="row"> <button onclick="approveRaise('${e3.id}')" class="btn btn--be flex-1">\u2713 Approve</button> <button onclick="counterOfferRaise('${e3.id}')" class="btn btn--outline flex-1">\u2194 Negotiate</button> <button onclick="denyRaise('${e3.id}')" class="btn btn--k flex-1">\u2715 Deny</button> </div> </div> `).join("") + G3;
  }
}
