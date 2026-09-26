// ============================================================================
// 10-loans — Loans & credit: LOAN_TYPES, credit rating, loan products (pelican/investment/bond), interest, repayment.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

window.debugScheduledEvents = debugScheduledEvents, window.cancelScheduledEvent = cancelScheduledEvent;
const LOAN_TYPES = { small: { name: "Small Loan", amount: 5e4, interestRate: 0.05, color: "var(--n)" }, medium: { name: "Medium Loan", amount: 25e4, interestRate: 0.08, color: "var(--z)" }, large: { name: "Large Loan", amount: 1e6, interestRate: 0.12, color: "var(--db)" }, massive: { name: "Shark Loan", amount: 1e7, interestRate: 0.2, color: "var(--l)" } }, un = { 8: 0.15, 12: 0.25, 16: 0.4 };
function pn() {
  return Math.max(0, Math.min(100, gameState.creditRating ?? 80));
}
function mn(e) {
  gameState.creditRating = Math.max(0, Math.min(100, pn() + e));
}
function gn() {
  const e = pn();
  return e >= 90 ? { label: "AAA", mult: 0.6 } : e >= 75 ? { label: "A", mult: 0.8 } : e >= 55 ? { label: "B", mult: 1 } : e >= 35 ? { label: "C", mult: 1.5 } : { label: "JUNK", mult: 2 };
}
function hn() {
  return Math.max(1e3, Math.floor(604800 * (parseFloat(calculateCashPerSecond()) || 0)));
}
function yn(e) {
  const t = Math.max("function" == typeof getWeeklyPayroll ? getWeeklyPayroll() : 0, 1e4);
  return Math.floor({ small: Math.max(5e4, 2 * t), medium: Math.max(25e4, 6 * t), large: Math.max(1e6, 20 * t) }[e] || 0);
}
function fn() {
  (gameState.loans || []).forEach((e) => {
    e.kind || (e.kind = "massive" === e.type ? "shark" : "bridge");
  });
}
function vn() {
  return (gameState.locations || []).filter((e) => e.owned).length >= 2;
}
function bn() {
  return (gameState.prestigeLevel || 0) >= 1 || (gameState.locations || []).filter((e) => e.owned).length >= 4;
}
async function takeLoan(e) {
  const t = LOAN_TYPES[e];
  if (!t) return;
  if ("massive" === e) return void openPelicanModal();
  const a = yn(e);
  if (await Ev(`Take out a ${t.name}?

Amount: $${wu(a)}
Interest Rate: ${(100 * t.interestRate).toFixed(0)}% per week

\u26A0\uFE0F Interest compounds weekly! Debt can spiral quickly.`, `\u{1F3E6} ${t.name}`, { type: "warning", confirmText: "Take Loan" })) {
    gameState.loans || (gameState.loans = []);
    const n = { id: `loan_${Date.now()}`, type: e, kind: "bridge", principal: a, currentAmount: a, interestRate: Mn(4) ? Math.round(900 * t.interestRate) / 1e3 : t.interestRate, takenAt: gameState.time?.currentTime || Date.now(), weeksActive: 0 };
    gameState.loans.push(n), gameState.cash += a, showNotification(`\u{1F4B0} Received $${wu(a)} loan! Remember to pay it back...`, "success"), updatePayrollTab();
  }
}
function wn(e, t) {
  const n = document.getElementById("loanProductModal");
  n && n.remove();
  const a = document.createElement("div");
  a.id = "loanProductModal", a.className = "fuoc-ui neg-overlay", a.innerHTML = `<div class="neg-modal">${e}</div>`, document.body.appendChild(a), t && t(a);
}
function closeLoanProductModal() {
  const e = document.getElementById("loanProductModal");
  e && e.remove();
}
function openPelicanModal() {
  const e = Math.max("function" == typeof getWeeklyPayroll ? getWeeklyPayroll() : 0, 1e4), t = 50 * e, n = Math.min(t, 10 * e);
  wn(` <div class="neg-head"> <div class="neg-id"> <div class="neg-name">\u{1F9A9} Pelican Capital</div> <div class="neg-meta">Velocity Liquidity Solutions\u2122 \u2014 "Capital at the speed of consequence."</div> </div> <button class="btn btn--aj neg-x" onclick="closeLoanProductModal()">\u2715</button> </div> <div class="neg-refs"> <div class="neg-ref"><span class="t">Rate</span><span class="num">20%/wk</span></div> <div class="neg-ref"><span class="t">Min payment</span><span class="num">10%/wk</span></div> <div class="neg-ref"><span class="t">Max</span><span class="num">$${wu(t)}</span></div> </div> <label class="neg-field"><span class="t">Principal ($)</span><input type="number" id="pelicanAmount" inputmode="numeric" min="1000" max="${t}" step="1000" value="${n}"></label> <div class="neg-preview">Instant funding. Interest compounds weekly. A minimum payment of 10% of the balance is collected every Friday. Missed minimums escalate your rate by 5%/wk and may trigger a complimentary visit from a Client Success Manager. APR: yes. By accepting you waive things.</div> <div class="neg-actions"> <button class="btn btn--be" id="pelicanConfirm">Accept Terms</button> <button class="btn btn--aj" onclick="closeLoanProductModal()">Walk Away</button> </div>`, (e2) => {
    e2.querySelector("#pelicanConfirm").onclick = () => {
      const e3 = Math.max(1e3, Math.min(t, parseInt(document.getElementById("pelicanAmount")?.value, 10) || 0));
      gameState.loans || (gameState.loans = []), gameState.loans.push({ id: `loan_${Date.now()}`, type: "massive", kind: "shark", principal: e3, currentAmount: e3, interestRate: Mn(4) ? 0.18 : 0.2, minPaymentRate: 0.1, missedPayments: 0, takenAt: gameState.time?.currentTime || Date.now(), weeksActive: 0 }), gameState.cash += e3, closeLoanProductModal(), showNotification(`\u{1F9A9} Pelican Capital wired $${wu(e3)}. They know where the office is.`, "success"), updatePayrollTab();
    };
  });
}
function openInvestmentLoanModal() {
  if (!vn()) return void showNotification("\u{1F512} Investment loans unlock when you own a 2nd location.", "info");
  const e = 8 * hn(), t = Math.min(e, 4 * hn());
  wn(` <div class="neg-head"> <div class="neg-id"> <div class="neg-name">\u{1F4C8} Investment Loan</div> <div class="neg-meta">Borrow against future income. Repaid automatically over the term.</div> </div> <button class="btn btn--aj neg-x" onclick="closeLoanProductModal()">\u2715</button> </div> <label class="neg-field"><span class="t">Principal ($, max $${wu(e)})</span><input type="number" id="investAmount" inputmode="numeric" min="1000" max="${e}" step="1000" value="${t}"></label> <div class="neg-inputs" id="investTerms"> <button class="btn btn--outline" data-term="8">8 wk \xB7 15%</button> <button class="btn btn--outline" data-term="12">12 wk \xB7 25%</button> <button class="btn btn--outline" data-term="16">16 wk \xB7 40%</button> </div> <div class="neg-preview" id="investPreview">Pick a term.</div> <div class="neg-actions"> <button class="btn btn--aj" onclick="closeLoanProductModal()">Cancel</button> </div>`, (t2) => {
    t2.querySelectorAll("#investTerms [data-term]").forEach((n2) => {
      n2.onclick = () => {
        const a2 = parseInt(n2.dataset.term, 10), o2 = un[a2] * (Mn(4) ? 0.9 : 1), i = Math.max(1e3, Math.min(e, parseInt(document.getElementById("investAmount")?.value, 10) || 0)), s = Math.floor(i * (1 + o2)), r = Math.ceil(s / a2);
        gameState.loans || (gameState.loans = []), gameState.loans.push({ id: `loan_${Date.now()}`, kind: "investment", principal: i, currentAmount: s, installment: r, termWeeks: a2, interestRate: o2, garnishing: false, takenAt: gameState.time?.currentTime || Date.now(), weeksActive: 0 }), gameState.cash += i, closeLoanProductModal(), showNotification(`\u{1F4C8} Investment loan funded: $${wu(i)}. $${wu(r)}/wk for ${a2} weeks.`, "success"), updatePayrollTab();
      };
    });
    const n = t2.querySelector("#investAmount"), a = t2.querySelector("#investPreview"), o = () => {
      const t3 = Math.max(0, Math.min(e, parseInt(n.value, 10) || 0));
      a.innerHTML = Object.entries(un).map(([e2, n2]) => `${e2} wk: <span class="num">$${wu(Math.ceil(t3 * (1 + n2) / parseInt(e2, 10)))}/wk</span>`).join(" \xB7 ");
    };
    n.addEventListener("input", o), o();
  });
}
function openBondIssueModal() {
  if (!bn()) return void showNotification("\u{1F512} Corporate bonds unlock at Prestige 1 or with 4 owned locations.", "info");
  const e = gn(), t = Math.max(1e6, Math.floor(0.25 * (gameState.lifetimeEarnings || 0))), n = Math.max(25e4, Math.floor(0.05 * (gameState.lifetimeEarnings || 0))), a = (0.02 * e.mult * 100).toFixed(1);
  wn(` <div class="neg-head"> <div class="neg-id"> <div class="neg-name">\u{1F3DB}\uFE0F Issue Corporate Bonds</div> <div class="neg-meta">Credit rating: ${e.label} \xB7 weekly coupon ${a}% \xB7 principal due at maturity</div> </div> <button class="btn btn--aj neg-x" onclick="closeLoanProductModal()">\u2715</button> </div> <label class="neg-field"><span class="t">Principal ($${wu(n)}\u2013$${wu(t)})</span><input type="number" id="bondAmount" inputmode="numeric" min="${n}" max="${t}" step="10000" value="${n}"></label> <div class="neg-inputs" id="bondTerms"> <button class="btn btn--outline" data-term="12">12 wk</button> <button class="btn btn--outline" data-term="24">24 wk</button> <button class="btn btn--outline" data-term="52">52 wk</button> </div> <div class="neg-preview">Interest-only weekly coupons; the full principal balloons at maturity. Service it on time and your rating improves. Miss a coupon and the market remembers. The market always remembers.</div> <div class="neg-actions"> <button class="btn btn--aj" onclick="closeLoanProductModal()">Cancel</button> </div>`, (a2) => {
    a2.querySelectorAll("#bondTerms [data-term]").forEach((o) => {
      o.onclick = () => {
        const i = parseInt(o.dataset.term, 10), s = Math.max(n, Math.min(t, parseInt(document.getElementById("bondAmount")?.value, 10) || 0));
        gameState.bonds || (gameState.bonds = []), gameState.bonds.push({ id: `bond_${Date.now()}`, principal: s, couponRate: 0.02 * e.mult, termWeeks: i, weeksElapsed: 0, missedCoupons: 0, issuedAt: gameState.time?.currentTime || Date.now() }), gameState.cash += s, closeLoanProductModal(), showNotification(`\u{1F3DB}\uFE0F Bonds placed: $${wu(s)} raised at ${(2 * e.mult).toFixed(1)}%/wk over ${i} weeks.`, "success"), updatePayrollTab();
      };
    });
  });
}
function xn(e) {
  const t = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (e2.career?.level || 1) < 7);
  showNotification(`\u{1F9A9} Pelican Capital: minimum payment missed. Your rate is now ${(100 * e.interestRate).toFixed(0)}%/wk.`, "error"), e.missedPayments >= 2 && sn(t, "debt_collectors", e.missedPayments), e.missedPayments >= 4 && mn(-10), void 0 !== StoryMinigames && StoryMinigames.launchMinigame && StoryMinigames.launchMinigame("composure", { title: "Client Success Check-In", themeText: "A Pelican Capital 'Client Success Manager' is in the lobby. Stay calm. Say nothing actionable.", difficulty: e.missedPayments >= 3 ? "hard" : "medium" }, (n) => {
    n && n.success ? showNotification("\u{1F9A9} You kept your composure. The Manager smiles, leaves a brochure, and takes a paperweight.", "info") : (t.forEach((e2) => {
      e2.stats && (e2.stats.productivity = Math.max(10, (e2.stats.productivity || 50) - 8));
    }), void 0 !== StoryEngine && StoryEngine.executeGameplayEffect && StoryEngine.executeGameplayEffect({ type: "fine", amount: Math.max(1e3, Math.floor(0.05 * e.currentAmount)), reason: "Pelican Capital assessed an 'asset verification fee.'" }), showNotification("\u{1F9A9} The visit rattled the office. An 'asset verification fee' was assessed.", "error"));
  });
}
function processLoanInterest() {
  fn();
  const e = gameState.loans || [];
  let t = 0;
  e.forEach((e2) => {
    if ("investment" === e2.kind) {
      const t2 = Math.min(e2.installment || 0, e2.currentAmount);
      if (e2.weeksActive++, t2 <= 0) return;
      if (gameState.cash >= t2) gameState.cash -= t2, e2.currentAmount -= t2, e2.garnishing = false;
      else {
        e2.garnishing = true;
        const t3 = Math.max(0, Math.min(Math.floor(0.1 * hn()), Math.floor(gameState.cash), e2.currentAmount));
        t3 > 0 && (gameState.cash -= t3, e2.currentAmount -= t3), showNotification("\u26A0\uFE0F Missed investment-loan installment \u2014 income garnishment active.", "warning");
      }
    } else if ("shark" === e2.kind) {
      const n = Math.floor(e2.currentAmount * e2.interestRate);
      e2.currentAmount += n, e2.weeksActive++, t += n;
      const a = Math.floor(e2.currentAmount * (e2.minPaymentRate || 0.1));
      gameState.cash >= a ? (gameState.cash -= a, e2.currentAmount -= a) : (e2.missedPayments = (e2.missedPayments || 0) + 1, e2.interestRate = Math.round(100 * (e2.interestRate + 0.05)) / 100, xn(e2));
    } else {
      const n = Math.floor(e2.currentAmount * e2.interestRate);
      e2.currentAmount += n, e2.weeksActive++, t += n;
    }
  }), gameState.loans = e.filter((e2) => {
    if (e2.currentAmount <= 0) {
      return showNotification(`\u{1F389} ${"investment" === e2.kind ? "Investment loan" : "shark" === e2.kind ? "Pelican Capital balance" : "Loan"} fully repaid!`, "success"), "shark" !== e2.kind && mn(2), false;
    }
    return true;
  }), (gameState.bonds || []).forEach((e2) => {
    e2.weeksElapsed++;
    const t2 = Math.floor(e2.principal * e2.couponRate);
    gameState.cash >= t2 ? (gameState.cash -= t2, e2.weeksElapsed % 8 == 0 && mn(1)) : (e2.missedCoupons = (e2.missedCoupons || 0) + 1, mn(-15), showNotification("\u{1F4C9} Missed bond coupon \u2014 credit rating downgraded.", "error")), e2.weeksElapsed >= e2.termWeeks && (gameState.cash >= e2.principal ? (gameState.cash -= e2.principal, e2.matured = true, mn(3), showNotification(`\u{1F3DB}\uFE0F Bond matured \u2014 repaid $${wu(e2.principal)}.`, "success")) : (e2.termWeeks += 4, e2.couponRate = Math.round(1e4 * e2.couponRate * 1.5) / 1e4, mn(-25), showNotification("\u{1F6A8} Bond balloon missed! Rolled 4 weeks at a penalty coupon. The rating agencies noticed.", "error")));
  }), gameState.bonds && (gameState.bonds = gameState.bonds.filter((e2) => !e2.matured)), t > 0 && showNotification(`\u{1F4C8} Loan interest accrued: +$${wu(t)} to debt`, "warning"), updatePayrollTab();
}
function payCustomLoanAmount(e) {
  const n = gameState.loans?.find((t) => t.id === e);
  if (!n) return;
  const u2 = document.getElementById(`loanCustomAmt-${e}`);
  if (!u2) return;
  const a = parseFloat(u2.value);
  !a || a <= 0 ? showNotification("\u274C Enter a valid amount", "error") : a > n.currentAmount ? showNotification(`\u274C Amount exceeds remaining balance ($${wu(n.currentAmount)})`, "error") : a > gameState.cash ? showNotification(`\u274C Need $${wu(a)} to repay!`, "error") : repayLoan(e, a);
}
async function repayLoan(e, t = null) {
  const n = gameState.loans?.find((t2) => t2.id === e);
  if (!n) return;
  const a = t || n.currentAmount;
  if (gameState.cash < a) showNotification(`\u274C Need $${wu(a)} to repay!`, "error");
  else if (await Ev(`Repay $${wu(a)} on this loan?

Remaining after: $${wu(Math.max(0, n.currentAmount - a))}`, "Repay Loan", { type: "info", confirmText: "Repay" })) {
    if (gameState.cash < a) return void showNotification(`\u274C No longer have enough cash ($${wu(a)} needed)!`, "error");
    gameState.cash -= a, n.currentAmount -= a, n.currentAmount <= 0 ? (gameState.loans = gameState.loans.filter((t2) => t2.id !== e), showNotification("\u{1F389} Loan fully repaid!", "success")) : showNotification(`\u2713 Paid $${wu(a)}. Remaining: $${wu(n.currentAmount)}`, "success"), updatePayrollTab();
  }
}
function getTotalDebt() {
  const e = gameState.loans?.reduce((e2, t2) => e2 + t2.currentAmount, 0) || 0, t = gameState.bonds?.reduce((e2, t2) => e2 + t2.principal, 0) || 0;
  return e + t;
}
function kn() {
  return gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus && "accountant" === e.specialization);
}
function Sn(e) {
  return Math.max(1, Math.min(5, e.career?.level || 1));
}
window.payCustomLoanAmount = payCustomLoanAmount;
