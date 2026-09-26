// ============================================================================
// 43-game-loop — Game loop: gameTick, updateUI, cash-per-second, core upgrade purchases (click/income/cost/time).
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

let hh = Date.now();
function gameTick() {
  {
    const e = Date.now(), t = e - hh;
    hh = e, !document.hidden && !gameState.time?.paused && !gameState.time?._offlinePaused && t > 0 && (gameState.totalPlayTime = (gameState.totalPlayTime || 0) + Math.min(t, 2e3));
  }
  if (ht(100), gameState.products.forEach((e) => {
    if (!e.unlocked) return;
    const t = currentCycleTimeMs(e);
    if (t < 1e3 && e.managerHired) {
      const n = currentValue(e) / t * 100;
      return gameState.cash += n, gameState.totalEarnings += n, gameState.lifetimeEarnings += n, gameState.currentLifetimeIncome = (gameState.currentLifetimeIncome || 0) + n, void (e.running = true);
    }
    if (e.running) {
      if (e.timeRemainingMs -= 100, e.timeRemainingMs <= 0) {
        let n = currentValue(e);
        const u2 = gameState.influenceUpgrades?.luckyStreak || 0;
        if (u2 > 0 && Math.random() < Cb.luckyStreak.effect(u2) && (n *= 2 + Math.floor(4 * Math.random())), gameState.cash += n, gameState.totalEarnings += n, gameState.lifetimeEarnings += n, gameState.currentLifetimeIncome = (gameState.currentLifetimeIncome || 0) + n, e.managerHired) e.running = true, e.timeRemainingMs = t;
        else {
          e.running = false, e.timeRemainingMs = 0;
          const t2 = $(`selltxt-${e.id}`);
          t2 && (t2.textContent = "Sell");
        }
      }
    } else (e.managerHired || (gameState.globalUpgrades?.keyholder?.[e.locationId] || 0) > 0) && (e.running = true, e.timeRemainingMs = t);
  }), gameState._postGenCounter || (gameState._postGenCounter = 0), gameState._postGenCounter++, gameState._postGenCounter >= 100 && (gameState._postGenCounter = 0, autonomousPostGeneration().catch((e) => {
    console.error("Autonomous post generation error:", e);
  })), gameState.lifestyleAdjustmentCounter || (gameState.lifestyleAdjustmentCounter = 0), gameState.lifestyleAdjustmentCounter++, gameState.lifestyleAdjustmentCounter >= 10 && (gameState.lifestyleAdjustmentCounter = 0, adjustEmployeeLifestyles()), void 0 !== StoryEngine && StoryEngine.tick && !gameState.settings?.disableStoryEvents && !gameState.time?.paused) try {
    StoryEngine.tick();
  } catch (u2) {
    console.warn("[StoryEngine] Tick error:", u2);
  }
  if (gameState._storyPeriodicCounter || (gameState._storyPeriodicCounter = 0), ++gameState._storyPeriodicCounter >= 600 && (gameState._storyPeriodicCounter = 0, "function" == typeof Jn)) try {
    Jn();
  } catch (u2) {
    console.warn("[StoryPeriodic]", u2);
  }
  if (gameState._dynamicEventCounter || (gameState._dynamicEventCounter = 0), ++gameState._dynamicEventCounter >= 300 && (gameState._dynamicEventCounter = 0, "function" == typeof wo)) try {
    wo();
  } catch (u2) {
    console.warn("[DynamicEvent]", u2);
  }
  if (gameState._groupIdleConvCounter || (gameState._groupIdleConvCounter = 0), ++gameState._groupIdleConvCounter >= 300 && (gameState._groupIdleConvCounter = 0, "function" == typeof Qm)) try {
    Qm();
  } catch (u2) {
    console.warn("[GroupIdle]", u2);
  }
  gameState._cashCacheCounter || (gameState._cashCacheCounter = 0), ++gameState._cashCacheCounter >= 10 && (gameState._cashCacheCounter = 0, invalidateCashPerSecond()), updateUI();
}
function updateUI() {
  if (cashEl) {
    const e2 = formatCashDisplay(gameState.cash);
    cashEl.textContent = e2.displayText, cashEl.style.fontSize = e2.fontSize, cashEl.style.color = e2.color, cashEl.style.textShadow = e2.textShadow, cashEl.style.animation = e2.animation, cashEl.style.fontWeight = "bold", cashEl.style.transition = "all 0.3s ease";
  } else console.warn("cashEl is null in updateUI()");
  cashPerSecEl && (cashPerSecEl.textContent = wu(calculateCashPerSecond())), employeeCountEl && (employeeCountEl.textContent = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus).length);
  const e = gameState.products.filter((e2) => e2.unlocked).length;
  productCountEl && (productCountEl.textContent = e), "function" == typeof Jc && Jc(), "business" === gameState.activeTab && updateProductProgressBars(), "upgrades" === gameState.activeTab && Nu(), "dashboard" === gameState.activeTab && updateDashboard();
}
window.regenerateCommentImage = regenerateCommentImage;
let yh = 0, fh = true;
function invalidateCashPerSecond() {
  fh = true;
}
function calculateCashPerSecond() {
  if (!fh) return yh;
  let e = 0;
  return gameState.products.forEach((t) => {
    if (!t.unlocked || t.disabled) return;
    const n = currentCycleTimeMs(t);
    let m = 1;
    t.temporaryBoosts && t.temporaryBoosts.forEach((b) => m *= b.multiplier), (t.running || t.managerHired) && (e += currentValue(t) * m / (n / 1e3));
  }), yh = e, fh = false, e;
}
function buyClickPower() {
  const e = gameState.globalUpgrades.clickPower, t = le.upgradeBaseCosts.clickPower, n = Math.floor(t * Math.pow(2, e));
  if (gameState.cash < n) return showNotification("Not enough cash!");
  gameState.cash -= n, gameState.globalUpgrades.clickPower += 1, showNotification(`Click Power upgraded! Now -${(1 + 0.1 * gameState.globalUpgrades.clickPower).toFixed(1)}s per click`), updateUpgradesTab(), updateUI();
}
function buyIncomeBoost(e) {
  gameState.globalUpgrades || (gameState.globalUpgrades = {}), gameState.globalUpgrades.incomeBoost || (gameState.globalUpgrades.incomeBoost = {});
  const t = gameState.globalUpgrades.incomeBoost[e] || 0, n = le.upgradeBaseCosts.incomeBoost[e], a = Math.floor(n * Math.pow(2.5, t));
  if (gameState.cash < a) return showNotification("Not enough cash!");
  gameState.cash -= a, gameState.globalUpgrades.incomeBoost[e] = t + 1;
  const o = 10 * (t + 1);
  showNotification(`${gameState.locations.find((t2) => t2.id === e).name} income boost upgraded! Now +${o}%`), updateUpgradesTab(), updateUI();
}
function buyCostReduction(e) {
  gameState.globalUpgrades || (gameState.globalUpgrades = {}), gameState.globalUpgrades.costReduction || (gameState.globalUpgrades.costReduction = {});
  const t = gameState.globalUpgrades.costReduction[e] || 0, n = le.upgradeBaseCosts.costReduction[e], a = Math.floor(n * Math.pow(3, t));
  if (gameState.cash < a) return showNotification("Not enough cash!");
  gameState.cash -= a, gameState.globalUpgrades.costReduction[e] = t + 1;
  const o = Math.min(95, 5 * (t + 1));
  showNotification(`${gameState.locations.find((t2) => t2.id === e).name} cost reduction upgraded! Now -${o}%`), updateUpgradesTab(), updateUI();
}
function buyGoldenTouch() {
  gameState.globalUpgrades || (gameState.globalUpgrades = {});
  const e = gameState.globalUpgrades.goldenTouch || 0, t = Math.floor(1e18 * Math.pow(10, e));
  if (gameState.cash < t) return showNotification("Not enough cash!");
  gameState.cash -= t, gameState.globalUpgrades.goldenTouch = (gameState.globalUpgrades.goldenTouch || 0) + 1, showNotification(`Golden Touch upgraded! All income +${5 * gameState.globalUpgrades.goldenTouch}%`), updateUpgradesTab(), updateUI();
}
function buyTimeDilation() {
  gameState.globalUpgrades || (gameState.globalUpgrades = {});
  const e = gameState.globalUpgrades.timeDilation || 0, t = Math.floor(5e18 * Math.pow(12, e));
  if (gameState.cash < t) return showNotification("Not enough cash!");
  gameState.cash -= t, gameState.globalUpgrades.timeDilation = (gameState.globalUpgrades.timeDilation || 0) + 1, showNotification(`Time Dilation upgraded! Production speed +${3 * gameState.globalUpgrades.timeDilation}%`), updateUpgradesTab(), updateUI();
}
function buyEmpireBuilder() {
  gameState.globalUpgrades || (gameState.globalUpgrades = {});
  const e = gameState.globalUpgrades.empireBuilder || 0, t = Math.floor(1e19 * Math.pow(15, e));
  if (gameState.cash < t) return showNotification("Not enough cash!");
  gameState.cash -= t, gameState.globalUpgrades.empireBuilder = (gameState.globalUpgrades.empireBuilder || 0) + 1, showNotification(`Empire Builder upgraded! Employee productivity +${10 * gameState.globalUpgrades.empireBuilder}%`), updateUpgradesTab(), updateUI();
}
