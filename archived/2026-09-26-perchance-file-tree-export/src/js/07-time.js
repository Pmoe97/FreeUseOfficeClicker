// ============================================================================
// 07-time — Time engine: dilation, offline earnings, day/night cycles, scheduler hook helpers (ut..wt).
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

const ct = 2, dt = 1728e5;
function ut(u2) {
  if (!(u2 > 0)) return;
  let remaining = u2, guard = 0;
  for (; remaining > 0 && guard++ < 200; ) {
    const u3 = pe.getHour(), G2 = pe.getDay(), step = Math.min(remaining, 36e5);
    gameState.time.currentTime += step, remaining -= step;
    const h = pe.getHour(), day = pe.getDay();
    h !== u3 && onHourChange(h, u3), day !== G2 && onDayChange(day);
  }
  ea();
}
function pt(u2, label = "offline") {
  if (!gameState.time) return;
  if (gameState.time._offlinePaused = false, !(gameState.time.enabled && u2 > 6e4)) return;
  const delta = Math.min(2 * u2, dt);
  console.log(`[Offline Time] ${label}: ${(u2 / 36e5).toFixed(2)}h away \u2192 +${(delta / 36e5).toFixed(1)} game-hours (x2)`), ut(delta);
}
function ht(e) {
  if (!gameState.time || !gameState.time.enabled || gameState.time.paused || gameState.time._offlinePaused) return;
  const t = pe.getHour(), n = pe.getDay(), a = yt();
  gameState.time.currentTime += e * a;
  const o = pe.getHour(), i = pe.getDay();
  o !== t && onHourChange(o, t), i !== n && onDayChange(i);
}
function yt() {
  const e = gameState.time, t = e.timeDilation;
  if (!t || !t.enabled) return e.baseTimeScale || e.timeScale || 20;
  const n = vt();
  switch (e.activeContext = n, n) {
    case "conversation":
    case "group":
      return t.conversationScale ?? 1;
    case "social":
      return t.socialBrowsingScale ?? 10;
    default:
      return t.idleScale ?? e.baseTimeScale ?? e.timeScale ?? 20;
  }
}
function vt() {
  const e = $("chatModal");
  if (e && "none" !== e.style.display) {
    const e2 = $("chatInput");
    return e2 && (e2.value.length > 0 || bt()), "conversation";
  }
  const t = $("activeGroupChat");
  if (gameState.activeGroup && "groups" === gameState.activeTab && t && "none" !== t.style.display) return "group";
  const n = $("socialFeed"), a = document.querySelector('[data-tab="social"]');
  if (a?.classList.contains("active") || n && null !== n.offsetParent) return "social";
  const o = $("postModal");
  return o && "none" !== o.style.display ? "social" : "idle";
}
function bt() {
  if (!gameState.activeChat) return false;
  const e = gameState.chatHistory[gameState.activeChat.id] || [];
  if (0 === e.length) return false;
  const t = e[e.length - 1], n = (gameState.time?.currentTime || Date.now()) - (t.timestamp || 0);
  return n < 12e4 || !!(t.isPlayer && n < 3e5);
}
function wt(e) {
  gameState.time && (gameState.time.activeContext = e);
}
