// ============================================================================
// 10-loans — Loans & credit: LOAN_TYPES, credit rating, loan products (pelican/investment/bond), interest, repayment.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

(window.debugScheduledEvents = debugScheduledEvents), (window.cancelScheduledEvent = cancelScheduledEvent);
const LOAN_TYPES = {
    small: { name: "Small Loan", amount: 5e4, interestRate: 0.05, color: "var(--l-green)" },
    medium: { name: "Medium Loan", amount: 25e4, interestRate: 0.08, color: "var(--l-gold)" },
    large: { name: "Large Loan", amount: 1e6, interestRate: 0.12, color: "var(--l-orange-3)" },
    massive: { name: "Shark Loan", amount: 1e7, interestRate: 0.2, color: "var(--l-red)" },
};
const INVESTMENT_TERMS = { 8: 0.15, 12: 0.25, 16: 0.4 };
function getCreditRating() {
    return Math.max(0, Math.min(100, gameState.creditRating ?? 80));
}
function bumpCreditRating(e) {
    gameState.creditRating = Math.max(0, Math.min(100, getCreditRating() + e));
}
function getCreditTier() {
    const e = getCreditRating();
    return e >= 90
        ? { label: "AAA", mult: 0.6 }
        : e >= 75
          ? { label: "A", mult: 0.8 }
          : e >= 55
            ? { label: "B", mult: 1 }
            : e >= 35
              ? { label: "C", mult: 1.5 }
              : { label: "JUNK", mult: 2 };
}
function getWeeklyIncomeEstimate() {
    return Math.max(1e3, Math.floor(604800 * (parseFloat(calculateCashPerSecond()) || 0)));
}
// Bridge loans size off the payroll arc (not prestige) so they stay relevant at every stage.
function getBridgeLoanAmount(e) {
    const t = Math.max("function" == typeof getWeeklyPayroll ? getWeeklyPayroll() : 0, 1e4);
    return Math.floor({ small: Math.max(5e4, 2 * t), medium: Math.max(25e4, 6 * t), large: Math.max(1e6, 20 * t) }[e] || 0);
}
function normalizeLoanKinds() {
    (gameState.loans || []).forEach((e) => {
        e.kind || (e.kind = "massive" === e.type ? "shark" : "bridge");
    });
}
function isInvestmentLoanUnlocked() {
    return (gameState.locations || []).filter((e) => e.owned).length >= 2;
}
function isBondsUnlocked() {
    return (gameState.prestigeLevel || 0) >= 1 || (gameState.locations || []).filter((e) => e.owned).length >= 4;
}
async function takeLoan(e) {
    const t = LOAN_TYPES[e];
    if (!t) return;
    if ("massive" === e) return void openPelicanModal();
    const a = getBridgeLoanAmount(e);
    if (
        await showConfirm(
            `Take out a ${t.name}?\n\nAmount: $${formatNumber(a)}\nInterest Rate: ${(100 * t.interestRate).toFixed(0)}% per week\n\n⚠️ Interest compounds weekly! Debt can spiral quickly.`,
            `🏦 ${t.name}`,
            { type: "warning", confirmText: "Take Loan" }
        )
    ) {
        gameState.loans || (gameState.loans = []);
        const n = {
            id: `loan_${Date.now()}`,
            type: e,
            kind: "bridge",
            principal: a,
            currentAmount: a,
            interestRate: hasAccountantPerk(4) ? Math.round(900 * t.interestRate) / 1e3 : t.interestRate,
            takenAt: gameState.time?.currentTime || Date.now(),
            weeksActive: 0,
        };
        gameState.loans.push(n),
            (gameState.cash += a),
            showNotification(`💰 Received $${formatNumber(a)} loan! Remember to pay it back...`, "success"),
            updatePayrollTab();
    }
}
function _loanModal(e, t) {
    const n = document.getElementById("loanProductModal");
    n && n.remove();
    const a = document.createElement("div");
    (a.id = "loanProductModal"), (a.className = "fuoc-ui neg-overlay"), (a.innerHTML = `<div class="neg-modal">${e}</div>`), document.body.appendChild(a), t && t(a);
}
function closeLoanProductModal() {
    const e = document.getElementById("loanProductModal");
    e && e.remove();
}
function openPelicanModal() {
    const e = Math.max("function" == typeof getWeeklyPayroll ? getWeeklyPayroll() : 0, 1e4),
        t = 50 * e,
        n = Math.min(t, 10 * e);
    _loanModal(
        `
          <div class="neg-head">
            <div class="neg-id">
              <div class="neg-name">🦩 Pelican Capital</div>
              <div class="neg-meta">Velocity Liquidity Solutions™ — "Capital at the speed of consequence."</div>
            </div>
            <button class="btn btn--ghost neg-x" onclick="closeLoanProductModal()">✕</button>
          </div>
          <div class="neg-refs">
            <div class="neg-ref"><span class="t">Rate</span><span class="num">20%/wk</span></div>
            <div class="neg-ref"><span class="t">Min payment</span><span class="num">10%/wk</span></div>
            <div class="neg-ref"><span class="t">Max</span><span class="num">$${formatNumber(t)}</span></div>
          </div>
          <label class="neg-field"><span class="t">Principal ($)</span><input type="number" id="pelicanAmount" inputmode="numeric" min="1000" max="${t}" step="1000" value="${n}"></label>
          <div class="neg-preview">Instant funding. Interest compounds weekly. A minimum payment of 10% of the balance is collected every Friday. Missed minimums escalate your rate by 5%/wk and may trigger a complimentary visit from a Client Success Manager. APR: yes. By accepting you waive things.</div>
          <div class="neg-actions">
            <button class="btn btn--primary" id="pelicanConfirm">Accept Terms</button>
            <button class="btn btn--ghost" onclick="closeLoanProductModal()">Walk Away</button>
          </div>`,
        (e) => {
            e.querySelector("#pelicanConfirm").onclick = () => {
                const e = Math.max(1e3, Math.min(t, parseInt(document.getElementById("pelicanAmount")?.value, 10) || 0));
                gameState.loans || (gameState.loans = []),
                    gameState.loans.push({
                        id: `loan_${Date.now()}`,
                        type: "massive",
                        kind: "shark",
                        principal: e,
                        currentAmount: e,
                        interestRate: hasAccountantPerk(4) ? 0.18 : 0.2,
                        minPaymentRate: 0.1,
                        missedPayments: 0,
                        takenAt: gameState.time?.currentTime || Date.now(),
                        weeksActive: 0,
                    }),
                    (gameState.cash += e),
                    closeLoanProductModal(),
                    showNotification(`🦩 Pelican Capital wired $${formatNumber(e)}. They know where the office is.`, "success"),
                    updatePayrollTab();
            };
        }
    );
}
function openInvestmentLoanModal() {
    if (!isInvestmentLoanUnlocked()) return void showNotification("🔒 Investment loans unlock when you own a 2nd location.", "info");
    const e = 8 * getWeeklyIncomeEstimate(),
        t = Math.min(e, 4 * getWeeklyIncomeEstimate());
    _loanModal(
        `
          <div class="neg-head">
            <div class="neg-id">
              <div class="neg-name">📈 Investment Loan</div>
              <div class="neg-meta">Borrow against future income. Repaid automatically over the term.</div>
            </div>
            <button class="btn btn--ghost neg-x" onclick="closeLoanProductModal()">✕</button>
          </div>
          <label class="neg-field"><span class="t">Principal ($, max $${formatNumber(e)})</span><input type="number" id="investAmount" inputmode="numeric" min="1000" max="${e}" step="1000" value="${t}"></label>
          <div class="neg-inputs" id="investTerms">
            <button class="btn btn--outline" data-term="8">8 wk · 15%</button>
            <button class="btn btn--outline" data-term="12">12 wk · 25%</button>
            <button class="btn btn--outline" data-term="16">16 wk · 40%</button>
          </div>
          <div class="neg-preview" id="investPreview">Pick a term.</div>
          <div class="neg-actions">
            <button class="btn btn--ghost" onclick="closeLoanProductModal()">Cancel</button>
          </div>`,
        (t) => {
            t.querySelectorAll("#investTerms [data-term]").forEach((n) => {
                n.onclick = () => {
                    const a = parseInt(n.dataset.term, 10),
                        o = INVESTMENT_TERMS[a] * (hasAccountantPerk(4) ? 0.9 : 1),
                        i = Math.max(1e3, Math.min(e, parseInt(document.getElementById("investAmount")?.value, 10) || 0)),
                        s = Math.floor(i * (1 + o)),
                        r = Math.ceil(s / a);
                    gameState.loans || (gameState.loans = []),
                        gameState.loans.push({
                            id: `loan_${Date.now()}`,
                            kind: "investment",
                            principal: i,
                            currentAmount: s,
                            installment: r,
                            termWeeks: a,
                            interestRate: o,
                            garnishing: !1,
                            takenAt: gameState.time?.currentTime || Date.now(),
                            weeksActive: 0,
                        }),
                        (gameState.cash += i),
                        closeLoanProductModal(),
                        showNotification(`📈 Investment loan funded: $${formatNumber(i)}. $${formatNumber(r)}/wk for ${a} weeks.`, "success"),
                        updatePayrollTab();
                };
            });
            const n = t.querySelector("#investAmount"),
                a = t.querySelector("#investPreview"),
                o = () => {
                    const t = Math.max(0, Math.min(e, parseInt(n.value, 10) || 0));
                    a.innerHTML = Object.entries(INVESTMENT_TERMS)
                        .map(([e, n]) => `${e} wk: <span class="num">$${formatNumber(Math.ceil((t * (1 + n)) / parseInt(e, 10)))}/wk</span>`)
                        .join(" · ");
                };
            n.addEventListener("input", o), o();
        }
    );
}
function openBondIssueModal() {
    if (!isBondsUnlocked()) return void showNotification("🔒 Corporate bonds unlock at Prestige 1 or with 4 owned locations.", "info");
    const e = getCreditTier(),
        t = Math.max(1e6, Math.floor(0.25 * (gameState.lifetimeEarnings || 0))),
        n = Math.max(25e4, Math.floor(0.05 * (gameState.lifetimeEarnings || 0))),
        a = (0.02 * e.mult * 100).toFixed(1);
    _loanModal(
        `
          <div class="neg-head">
            <div class="neg-id">
              <div class="neg-name">🏛️ Issue Corporate Bonds</div>
              <div class="neg-meta">Credit rating: ${e.label} · weekly coupon ${a}% · principal due at maturity</div>
            </div>
            <button class="btn btn--ghost neg-x" onclick="closeLoanProductModal()">✕</button>
          </div>
          <label class="neg-field"><span class="t">Principal ($${formatNumber(n)}–$${formatNumber(t)})</span><input type="number" id="bondAmount" inputmode="numeric" min="${n}" max="${t}" step="10000" value="${n}"></label>
          <div class="neg-inputs" id="bondTerms">
            <button class="btn btn--outline" data-term="12">12 wk</button>
            <button class="btn btn--outline" data-term="24">24 wk</button>
            <button class="btn btn--outline" data-term="52">52 wk</button>
          </div>
          <div class="neg-preview">Interest-only weekly coupons; the full principal balloons at maturity. Service it on time and your rating improves. Miss a coupon and the market remembers. The market always remembers.</div>
          <div class="neg-actions">
            <button class="btn btn--ghost" onclick="closeLoanProductModal()">Cancel</button>
          </div>`,
        (a) => {
            a.querySelectorAll("#bondTerms [data-term]").forEach((o) => {
                o.onclick = () => {
                    const i = parseInt(o.dataset.term, 10),
                        s = Math.max(n, Math.min(t, parseInt(document.getElementById("bondAmount")?.value, 10) || 0));
                    gameState.bonds || (gameState.bonds = []),
                        gameState.bonds.push({
                            id: `bond_${Date.now()}`,
                            principal: s,
                            couponRate: 0.02 * e.mult,
                            termWeeks: i,
                            weeksElapsed: 0,
                            missedCoupons: 0,
                            issuedAt: gameState.time?.currentTime || Date.now(),
                        }),
                        (gameState.cash += s),
                        closeLoanProductModal(),
                        showNotification(`🏛️ Bonds placed: $${formatNumber(s)} raised at ${(2 * e.mult).toFixed(1)}%/wk over ${i} weeks.`, "success"),
                        updatePayrollTab();
                };
            });
        }
    );
}
function onPelicanMissedPayment(e) {
    const t = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus && (e.career?.level || 1) < 7);
    showNotification(`🦩 Pelican Capital: minimum payment missed. Your rate is now ${(100 * e.interestRate).toFixed(0)}%/wk.`, "error"),
        e.missedPayments >= 2 && generateFinancialStressPosts(t, "debt_collectors", e.missedPayments),
        e.missedPayments >= 4 && bumpCreditRating(-10),
        void 0 !== StoryMinigames &&
            StoryMinigames.launchMinigame &&
            StoryMinigames.launchMinigame(
                "composure",
                {
                    title: "Client Success Check-In",
                    themeText: "A Pelican Capital 'Client Success Manager' is in the lobby. Stay calm. Say nothing actionable.",
                    difficulty: e.missedPayments >= 3 ? "hard" : "medium",
                },
                (n) => {
                    n && n.success
                        ? showNotification("🦩 You kept your composure. The Manager smiles, leaves a brochure, and takes a paperweight.", "info")
                        : (t.forEach((e) => {
                              e.stats && (e.stats.productivity = Math.max(10, (e.stats.productivity || 50) - 8));
                          }),
                          void 0 !== StoryEngine &&
                              StoryEngine.executeGameplayEffect &&
                              StoryEngine.executeGameplayEffect({
                                  type: "fine",
                                  amount: Math.max(1e3, Math.floor(0.05 * e.currentAmount)),
                                  reason: "Pelican Capital assessed an 'asset verification fee.'",
                              }),
                          showNotification("🦩 The visit rattled the office. An 'asset verification fee' was assessed.", "error"));
                }
            );
}
function processLoanInterest() {
    normalizeLoanKinds();
    const e = gameState.loans || [];
    let t = 0;
    e.forEach((e) => {
        if ("investment" === e.kind) {
            const t = Math.min(e.installment || 0, e.currentAmount);
            if ((e.weeksActive++, t <= 0)) return;
            if (gameState.cash >= t) (gameState.cash -= t), (e.currentAmount -= t), (e.garnishing = !1);
            else {
                e.garnishing = !0;
                const t = Math.max(0, Math.min(Math.floor(0.1 * getWeeklyIncomeEstimate()), Math.floor(gameState.cash), e.currentAmount));
                t > 0 && ((gameState.cash -= t), (e.currentAmount -= t)),
                    showNotification("⚠️ Missed investment-loan installment — income garnishment active.", "warning");
            }
        } else if ("shark" === e.kind) {
            const n = Math.floor(e.currentAmount * e.interestRate);
            (e.currentAmount += n), e.weeksActive++, (t += n);
            const a = Math.floor(e.currentAmount * (e.minPaymentRate || 0.1));
            gameState.cash >= a
                ? ((gameState.cash -= a), (e.currentAmount -= a))
                : ((e.missedPayments = (e.missedPayments || 0) + 1), (e.interestRate = Math.round(100 * (e.interestRate + 0.05)) / 100), onPelicanMissedPayment(e));
        } else {
            const n = Math.floor(e.currentAmount * e.interestRate);
            (e.currentAmount += n), e.weeksActive++, (t += n);
        }
    }),
        (gameState.loans = e.filter((e) => {
            if (e.currentAmount <= 0) {
                const t = "investment" === e.kind ? "Investment loan" : "shark" === e.kind ? "Pelican Capital balance" : "Loan";
                return showNotification(`🎉 ${t} fully repaid!`, "success"), "shark" !== e.kind && bumpCreditRating(2), !1;
            }
            return !0;
        }));
    (gameState.bonds || []).forEach((e) => {
        e.weeksElapsed++;
        const t = Math.floor(e.principal * e.couponRate);
        gameState.cash >= t
            ? ((gameState.cash -= t), e.weeksElapsed % 8 == 0 && bumpCreditRating(1))
            : ((e.missedCoupons = (e.missedCoupons || 0) + 1),
              bumpCreditRating(-15),
              showNotification("📉 Missed bond coupon — credit rating downgraded.", "error"));
        e.weeksElapsed >= e.termWeeks &&
            (gameState.cash >= e.principal
                ? ((gameState.cash -= e.principal), (e.matured = !0), bumpCreditRating(3), showNotification(`🏛️ Bond matured — repaid $${formatNumber(e.principal)}.`, "success"))
                : ((e.termWeeks += 4),
                  (e.couponRate = Math.round(1e4 * e.couponRate * 1.5) / 1e4),
                  bumpCreditRating(-25),
                  showNotification("🚨 Bond balloon missed! Rolled 4 weeks at a penalty coupon. The rating agencies noticed.", "error")));
    }),
        gameState.bonds && (gameState.bonds = gameState.bonds.filter((e) => !e.matured)),
        t > 0 && showNotification(`📈 Loan interest accrued: +$${formatNumber(t)} to debt`, "warning"),
        updatePayrollTab();
}
function payCustomLoanAmount(e) {
    const n = gameState.loans?.find((t) => t.id === e);
    if (!n) return;
    const inp = document.getElementById(`loanCustomAmt-${e}`);
    if (!inp) return;
    const a = parseFloat(inp.value);
    if (!a || a <= 0) return void showNotification("❌ Enter a valid amount", "error");
    if (a > n.currentAmount) return void showNotification(`❌ Amount exceeds remaining balance ($${formatNumber(n.currentAmount)})`, "error");
    if (a > gameState.cash) return void showNotification(`❌ Need $${formatNumber(a)} to repay!`, "error");
    repayLoan(e, a);
}
window.payCustomLoanAmount = payCustomLoanAmount;
async function repayLoan(e, t = null) {
    const n = gameState.loans?.find((t) => t.id === e);
    if (!n) return;
    const a = t || n.currentAmount;
    if (gameState.cash < a) return void showNotification(`❌ Need $${formatNumber(a)} to repay!`, "error");
    if (
        await showConfirm(
            `Repay $${formatNumber(a)} on this loan?\n\nRemaining after: $${formatNumber(Math.max(0, n.currentAmount - a))}`,
            "Repay Loan",
            { type: "info", confirmText: "Repay" }
        )
    ) {
        if (gameState.cash < a)
            return void showNotification(`❌ No longer have enough cash ($${formatNumber(a)} needed)!`, "error");
        (gameState.cash -= a),
            (n.currentAmount -= a),
            n.currentAmount <= 0
                ? ((gameState.loans = gameState.loans.filter((t) => t.id !== e)),
                  showNotification("🎉 Loan fully repaid!", "success"))
                : showNotification(
                      `✓ Paid $${formatNumber(a)}. Remaining: $${formatNumber(n.currentAmount)}`,
                      "success"
                  ),
            updatePayrollTab();
    }
}
function getTotalDebt() {
    const e = gameState.loans?.reduce((e, t) => e + t.currentAmount, 0) || 0,
        t = gameState.bonds?.reduce((e, t) => e + t.principal, 0) || 0;
    return e + t;
}
// ---- Accountant system: normal employees with an additive specialization.
// Capacity covers payroll processing at their assigned location; uncovered
// employees require the payday minigame (or get waved through with errors).
function getAccountants() {
    return gameState.employees.filter(
        (e) => e.hired && "active" === e.employmentStatus && "accountant" === e.specialization
    );
}
function getAccountantLevel(e) {
    return Math.max(1, Math.min(5, e.career?.level || 1));
}
