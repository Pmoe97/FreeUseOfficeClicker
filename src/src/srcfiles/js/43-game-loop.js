// ============================================================================
// 43-game-loop — Game loop: gameTick, updateUI, cash-per-second, core upgrade purchases (click/income/cost/time).
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

let lastPlayTickReal = Date.now();
function gameTick() {
    // Accumulate real gameplay time (the clock used for snapshot ages). Only counts
    // while the tab is visible and game time isn't paused; per-tick delta is clamped
    // so background throttling / sleep gaps don't inflate it.
    {
        const e = Date.now(),
            t = e - lastPlayTickReal;
        lastPlayTickReal = e;
        document.hidden || markPlayerPresent(e); // the AFK/offline anchor: last moment the game ran on screen
        !document.hidden &&
            !gameState.time?.paused &&
            !gameState.time?._offlinePaused &&
            t > 0 &&
            (gameState.totalPlayTime = (gameState.totalPlayTime || 0) + Math.min(t, 2e3));
    }
    if (
        (updateGameTime(100),
        gameState.products.forEach((e) => {
            if (!e.unlocked) return;
            const t = currentCycleTimeMs(e);
            if (t < 1e3 && e.managerHired) {
                const n = 100 * (currentValue(e) / t);
                return (
                    (gameState.cash += n),
                    (gameState.totalEarnings += n),
                    (gameState.lifetimeEarnings += n),
                    (gameState.currentLifetimeIncome = (gameState.currentLifetimeIncome || 0) + n),
                    void (e.running = !0)
                );
            }
            if (e.running) {
                if (((e.timeRemainingMs -= 100), e.timeRemainingMs <= 0)) {
                    let n = currentValue(e);
                    const luckLvl = gameState.influenceUpgrades?.luckyStreak || 0;
                    luckLvl > 0 &&
                        Math.random() < influenceUpgrades.luckyStreak.effect(luckLvl) &&
                        (n *= 2 + Math.floor(4 * Math.random()));
                    if (
                        ((gameState.cash += n),
                        (gameState.totalEarnings += n),
                        (gameState.lifetimeEarnings += n),
                        (gameState.currentLifetimeIncome = (gameState.currentLifetimeIncome || 0) + n),
                        e.managerHired)
                    )
                        (e.running = !0), (e.timeRemainingMs = t);
                    else {
                        (e.running = !1), (e.timeRemainingMs = 0);
                        const t = $(`selltxt-${e.id}`);
                        t && (t.textContent = "Sell");
                    }
                }
            } else
                (e.managerHired || (gameState.globalUpgrades?.keyholder?.[e.locationId] || 0) > 0) &&
                    ((e.running = !0), (e.timeRemainingMs = t));
        }),
        gameState._postGenCounter || (gameState._postGenCounter = 0),
        gameState._postGenCounter++,
        gameState._postGenCounter >= 100 &&
            ((gameState._postGenCounter = 0),
            autonomousPostGeneration().catch((e) => {
                console.error("Autonomous post generation error:", e);
            })),
        gameState.lifestyleAdjustmentCounter || (gameState.lifestyleAdjustmentCounter = 0),
        gameState.lifestyleAdjustmentCounter++,
        gameState.lifestyleAdjustmentCounter >= 10 &&
            ((gameState.lifestyleAdjustmentCounter = 0), adjustEmployeeLifestyles()),
        void 0 !== StoryEngine &&
            StoryEngine.tick &&
            !gameState.settings?.disableStoryEvents &&
            !gameState.time?.paused)
    )
        try {
            StoryEngine.tick();
        } catch (e) {
            console.warn("[StoryEngine] Tick error:", e);
        }
    if (
        (gameState._storyPeriodicCounter || (gameState._storyPeriodicCounter = 0),
        ++gameState._storyPeriodicCounter >= 600 &&
            ((gameState._storyPeriodicCounter = 0), "function" == typeof storyPeriodicTick))
    )
        try {
            storyPeriodicTick();
        } catch (e) {
            console.warn("[StoryPeriodic]", e);
        }
    if (
        (gameState._dynamicEventCounter || (gameState._dynamicEventCounter = 0),
        ++gameState._dynamicEventCounter >= 300 &&
            ((gameState._dynamicEventCounter = 0), "function" == typeof dynamicEventTick))
    )
        try {
            dynamicEventTick();
        } catch (e) {
            console.warn("[DynamicEvent]", e);
        }
    if (
        (gameState._groupIdleConvCounter || (gameState._groupIdleConvCounter = 0),
        ++gameState._groupIdleConvCounter >= 300 &&
            ((gameState._groupIdleConvCounter = 0), "function" == typeof checkGroupIdleConversations))
    )
        try {
            checkGroupIdleConversations();
        } catch (e) {
            console.warn("[GroupIdle]", e);
        }
    gameState._cashCacheCounter || (gameState._cashCacheCounter = 0),
        ++gameState._cashCacheCounter >= 10 && ((gameState._cashCacheCounter = 0), invalidateCashPerSecond()),
        updateUI();
}
function updateUI() {
    if (cashEl) {
        const e = formatCashDisplay(gameState.cash);
        (cashEl.textContent = e.displayText),
            (cashEl.style.fontSize = e.fontSize),
            (cashEl.style.color = e.color),
            (cashEl.style.textShadow = e.textShadow),
            (cashEl.style.animation = e.animation),
            (cashEl.style.fontWeight = "bold"),
            (cashEl.style.transition = "all 0.3s ease");
    } else console.warn("cashEl is null in updateUI()");
    cashPerSecEl && (cashPerSecEl.textContent = formatNumber(calculateCashPerSecond())),
        employeeCountEl &&
            (employeeCountEl.textContent = gameState.employees.filter(
                (e) => e.hired && "active" === e.employmentStatus
            ).length);
    const e = gameState.products.filter((e) => e.unlocked).length;
    productCountEl && (productCountEl.textContent = e),
        "function" == typeof updateSolvencyChip && updateSolvencyChip(),
        "business" === gameState.activeTab && updateProductProgressBars(),
        "upgrades" === gameState.activeTab && refreshCapitalTab(),
        "dashboard" === gameState.activeTab && updateDashboard();
}
window.regenerateCommentImage = regenerateCommentImage;
let _cachedCashPerSecond = 0,
    _cashPerSecondDirty = !0;
function invalidateCashPerSecond() {
    _cashPerSecondDirty = !0;
}
function calculateCashPerSecond() {
    if (!_cashPerSecondDirty) return _cachedCashPerSecond;
    let e = 0;
    return (
        gameState.products.forEach((t) => {
            if (!t.unlocked || t.disabled) return;
            const n = currentCycleTimeMs(t);
            let m = 1;
            t.temporaryBoosts && t.temporaryBoosts.forEach((b) => (m *= b.multiplier));
            (t.running || t.managerHired) && (e += (currentValue(t) * m) / (n / 1e3));
        }),
        (_cachedCashPerSecond = e),
        (_cashPerSecondDirty = !1),
        e
    );
}
function buyClickPower() {
    const e = gameState.globalUpgrades.clickPower,
        t = gameBalance.upgradeBaseCosts.clickPower,
        n = Math.floor(t * Math.pow(2, e));
    if (gameState.cash < n) return showNotification("Not enough cash!");
    (gameState.cash -= n), (gameState.globalUpgrades.clickPower += 1);
    showNotification(
        `Click Power upgraded! Now -${(1 + 0.1 * gameState.globalUpgrades.clickPower).toFixed(1)}s per click`
    ),
        updateUpgradesTab(),
        updateUI();
}
function buyIncomeBoost(e) {
    gameState.globalUpgrades || (gameState.globalUpgrades = {}),
        gameState.globalUpgrades.incomeBoost || (gameState.globalUpgrades.incomeBoost = {});
    const t = gameState.globalUpgrades.incomeBoost[e] || 0,
        n = gameBalance.upgradeBaseCosts.incomeBoost[e],
        a = Math.floor(n * Math.pow(2.5, t));
    if (gameState.cash < a) return showNotification("Not enough cash!");
    (gameState.cash -= a), (gameState.globalUpgrades.incomeBoost[e] = t + 1);
    const o = 10 * (t + 1);
    showNotification(`${gameState.locations.find((t) => t.id === e).name} income boost upgraded! Now +${o}%`),
        updateUpgradesTab(),
        updateUI();
}
function buyCostReduction(e) {
    gameState.globalUpgrades || (gameState.globalUpgrades = {}),
        gameState.globalUpgrades.costReduction || (gameState.globalUpgrades.costReduction = {});
    const t = gameState.globalUpgrades.costReduction[e] || 0,
        n = gameBalance.upgradeBaseCosts.costReduction[e],
        a = Math.floor(n * Math.pow(3, t));
    if (gameState.cash < a) return showNotification("Not enough cash!");
    (gameState.cash -= a), (gameState.globalUpgrades.costReduction[e] = t + 1);
    const o = Math.min(95, 5 * (t + 1));
    showNotification(`${gameState.locations.find((t) => t.id === e).name} cost reduction upgraded! Now -${o}%`),
        updateUpgradesTab(),
        updateUI();
}
function buyGoldenTouch() {
    gameState.globalUpgrades || (gameState.globalUpgrades = {});
    const e = gameState.globalUpgrades.goldenTouch || 0,
        t = Math.floor(1e18 * Math.pow(10, e));
    if (gameState.cash < t) return showNotification("Not enough cash!");
    (gameState.cash -= t), (gameState.globalUpgrades.goldenTouch = (gameState.globalUpgrades.goldenTouch || 0) + 1);
    showNotification(`Golden Touch upgraded! All income +${5 * gameState.globalUpgrades.goldenTouch}%`),
        updateUpgradesTab(),
        updateUI();
}
function buyTimeDilation() {
    gameState.globalUpgrades || (gameState.globalUpgrades = {});
    const e = gameState.globalUpgrades.timeDilation || 0,
        t = Math.floor(5e18 * Math.pow(12, e));
    if (gameState.cash < t) return showNotification("Not enough cash!");
    (gameState.cash -= t),
        (gameState.globalUpgrades.timeDilation = (gameState.globalUpgrades.timeDilation || 0) + 1);
    showNotification(`Time Dilation upgraded! Production speed +${3 * gameState.globalUpgrades.timeDilation}%`),
        updateUpgradesTab(),
        updateUI();
}
function buyEmpireBuilder() {
    gameState.globalUpgrades || (gameState.globalUpgrades = {});
    const e = gameState.globalUpgrades.empireBuilder || 0,
        t = Math.floor(1e19 * Math.pow(15, e));
    if (gameState.cash < t) return showNotification("Not enough cash!");
    (gameState.cash -= t),
        (gameState.globalUpgrades.empireBuilder = (gameState.globalUpgrades.empireBuilder || 0) + 1);
    showNotification(
        `Empire Builder upgraded! Employee productivity +${10 * gameState.globalUpgrades.empireBuilder}%`
    ),
        updateUpgradesTab(),
        updateUI();
}
