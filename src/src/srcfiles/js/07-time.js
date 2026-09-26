// ============================================================================
// 07-time — Time engine: dilation, offline earnings, day/night cycles, scheduler hook helpers (fastForwardGameTime..setTimeContext).
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

// While you're away the game clock advances at half of real time (a day away = half a
// game-day), capped so a long absence can't skip weeks of schedules and payroll.
const OFFLINE_TIME_SCALE = 0.5,
    OFFLINE_MAX_CATCHUP_GAME_MS = 48 * 36e5;
// "Away" means the game wasn't running on screen. gameTick stamps the last moment it ran
// with the tab visible; hide/unload stamp lastPlayTime. The latest of the two is when the
// player was last here. (Measuring from anything older — e.g. when the session started —
// paid AFK income for time actually spent playing, on every reload and tab switch.)
// The in-game clock "now". Anything measured in game days (tenure, payroll proration,
// raise eligibility) must stamp and compare with this, not Date.now() — the game clock
// runs at its own rate, so mixing the two skews every duration.
function gameNow() {
    return gameState.time?.currentTime || Date.now();
}
// Whole in-game days (local-midnight boundaries, like getDay()). This is the unit every
// "for N days" effect uses — unavailableUntil, disabledUntil, expiresDay, story ongoing
// effects — via gameState.currentDay, which gameTick keeps current. (Nothing used to
// write currentDay, so those durations compared against undefined and never ended.)
function gameDayNumber(t = gameNow()) {
    return Math.floor((t - 6e4 * new Date(t).getTimezoneOffset()) / 864e5);
}
function markPlayerPresent(t = Date.now()) {
    gameState.offlineEarnings && (gameState.offlineEarnings.lastPlayedRealTime = t);
    gameState.lastPlayTime = t;
}
function getLastPresentRealTime() {
    return Math.max(gameState.offlineEarnings?.lastPlayedRealTime || 0, gameState.lastPlayTime || 0) || Date.now();
}
function fastForwardGameTime(deltaMs) {
    if (!(deltaMs > 0)) return;
    let remaining = deltaMs,
        guard = 0;
    while (remaining > 0 && guard++ < 200) {
        const prevHour = timeHelpers.getHour(),
            prevDay = timeHelpers.getDay(),
            step = Math.min(remaining, 36e5);
        (gameState.time.currentTime += step), (remaining -= step);
        const h = timeHelpers.getHour(),
            day = timeHelpers.getDay();
        h !== prevHour && onHourChange(h, prevHour), day !== prevDay && onDayChange(day);
    }
    updateTimeDisplay();
}
function applyOfflineTimePassage(realElapsedMs, label = "offline") {
    if (!gameState.time) return;
    gameState.time._offlinePaused = !1;
    if (!gameState.time.enabled || !(realElapsedMs > 6e4)) return;
    const delta = Math.min(realElapsedMs * OFFLINE_TIME_SCALE, OFFLINE_MAX_CATCHUP_GAME_MS);
    console.log(
        `[Offline Time] ${label}: ${(realElapsedMs / 36e5).toFixed(2)}h away → +${(delta / 36e5).toFixed(1)} game-hours (x${OFFLINE_TIME_SCALE})`
    ),
        fastForwardGameTime(delta);
}
function updateGameTime(e) {
    if (!gameState.time || !gameState.time.enabled || gameState.time.paused || gameState.time._offlinePaused)
        return;
    const t = timeHelpers.getHour(),
        n = timeHelpers.getDay(),
        a = getEffectiveTimeScale();
    gameState.time.currentTime += e * a;
    const o = timeHelpers.getHour(),
        i = timeHelpers.getDay();
    o !== t && onHourChange(o, t), i !== n && onDayChange(i);
}
function getEffectiveTimeScale() {
    const e = gameState.time,
        t = e.timeDilation;
    if (!t || !t.enabled) return e.baseTimeScale || e.timeScale || 20;
    const n = detectCurrentTimeContext();
    switch (((e.activeContext = n), n)) {
        case "conversation":
            return t.conversationScale ?? 1;
        case "group":
            return t.conversationScale ?? 1;
        case "social":
            return t.socialBrowsingScale ?? 10;
        default:
            return t.idleScale ?? e.baseTimeScale ?? e.timeScale ?? 20;
    }
}
function detectCurrentTimeContext() {
    const e = $("chatModal");
    if (e && "none" !== e.style.display) {
        const e = $("chatInput");
        e && (e.value.length > 0 || isPlayerActiveInChat());
        return "conversation";
    }
    const t = $("activeGroupChat");
    if (gameState.activeGroup && "groups" === gameState.activeTab && t && "none" !== t.style.display)
        return "group";
    const n = $("socialFeed"),
        a = document.querySelector('[data-tab="social"]');
    if (a?.classList.contains("active") || (n && null !== n.offsetParent)) return "social";
    const o = $("postModal");
    return o && "none" !== o.style.display ? "social" : "idle";
}
function isPlayerActiveInChat() {
    if (!gameState.activeChat) return !1;
    const e = gameState.chatHistory[gameState.activeChat.id] || [];
    if (0 === e.length) return !1;
    const t = e[e.length - 1],
        n = (gameState.time?.currentTime || Date.now()) - (t.timestamp || 0);
    return n < 12e4 || !!(t.isPlayer && n < 3e5);
}
function setTimeContext(e) {
    gameState.time && (gameState.time.activeContext = e);
}
