// ============================================================================
// 02-ai-queues — AI text + image request queues (queuedGenerateText/queuedGenerateImage, ImageRequestQueue, debug hooks).
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

async function queuedGenerateText(e, t = {}, n = "Text Generation") {
  if ("function" != typeof generateText) return console.warn("[AI Queue] generateText not available, using fallback"), AIRequestQueue.getFallbackResponse(n, new Error("generateText not available"));
  gameState.pendingAIRequests || (gameState.pendingAIRequests = { text: [], image: [] });
  const a = Date.now() + Math.random(), o = { id: a, prompt: e, options: Object.fromEntries(Object.entries(t).filter(([, e2]) => "function" != typeof e2)), description: n, timestamp: Date.now() };
  gameState.pendingAIRequests.text.push(o), console.log(`[AI Queue] \u{1F4BE} Auto-persisted: ${n} (${gameState.pendingAIRequests.text.length} pending)`), "function" == typeof saveGame && saveGame(false).catch((e2) => console.warn("[AI Queue] Save warning:", e2));
  try {
    const o2 = await AIRequestQueue.enqueue(() => generateText(e, t, n), n), i = gameState.pendingAIRequests.text.findIndex((e2) => e2.id === a);
    return -1 !== i && (gameState.pendingAIRequests.text.splice(i, 1), console.log(`[AI Queue] \u2705 Completed & removed: ${n} (${gameState.pendingAIRequests.text.length} remaining)`)), o2;
  } catch (e2) {
    console.error(`[AI Queue] Final fallback for ${n}:`, e2);
    const t2 = gameState.pendingAIRequests.text.findIndex((e3) => e3.id === a);
    return -1 !== t2 && gameState.pendingAIRequests.text.splice(t2, 1), AIRequestQueue.getFallbackResponse(n, e2);
  }
}
async function de(e) {
  return "function" != typeof generateText ? (console.warn("[AI Queue] generateText not available, using fallback"), AIRequestQueue.getFallbackResponse(e.description || "Text Generation", new Error("generateText not available"))) : await AIRequestQueue.enqueuePersistent(e);
}
async function ue(e) {
  return "function" != typeof generateImage ? (console.warn("[Image Queue] generateImage not available, using fallback"), ImageRequestQueue.getFallbackResponse(e.description || "Image Generation", new Error("generateImage not available"))) : await ImageRequestQueue.enqueuePersistent(e);
}
window.aiQueueDebug = { status: () => {
  const e = AIRequestQueue.getStats(), t = AIRequestQueue.getPendingCount();
  return console.log("\u{1F50D} [AI Queue Status]"), console.log(`Active: ${e.active}, Queued: ${e.queued}, Max: ${e.maxConcurrent}`), console.log(`Total pending: ${e.totalWaiting}`), console.log(`\u{1F4BE} Persistent pending: ${t}`), e;
}, analyze: () => AIRequestQueue.analyzeFailures(), clearFailures: () => AIRequestQueue.clearFailureData(), getFailures: () => window.aiQueueFailures || [], setMax: (e) => {
  AIRequestQueue.updateMaxConcurrent(e), console.log(`\u2705 Max concurrent requests set to ${e}`);
}, getPending: () => gameState.pendingAIRequests?.text || [], clearPending: () => {
  const e = gameState.pendingAIRequests?.text?.length || 0;
  return gameState.pendingAIRequests && (gameState.pendingAIRequests.text = []), console.log(`\u{1F5D1}\uFE0F Cleared ${e} persistent pending requests`), e;
}, help: () => {
  console.log("\u{1F527} [AI Queue Debug Commands]"), console.log("aiQueueDebug.status()       - Show current queue status"), console.log("aiQueueDebug.analyze()      - Analyze Max Requests failures"), console.log("aiQueueDebug.setMax(15)     - Set max concurrent requests"), console.log("aiQueueDebug.clearFailures() - Clear failure tracking data"), console.log("aiQueueDebug.getFailures()  - Get raw failure data"), console.log("aiQueueDebug.getPending()   - Get persistent pending requests"), console.log("aiQueueDebug.clearPending() - Clear persistent pending requests"), console.log("aiQueueDebug.help()         - Show this help");
} };
const ImageRequestQueue = { activeRequests: 0, requestQueue: [], maxConcurrent: 8, requestTimeoutMs: 18e4, init() {
  this.maxConcurrent = gameState?.settings?.maxImageRequests || 8, console.log(`[Image Queue] Initialized with max ${this.maxConcurrent} concurrent requests`), this.updateUI();
}, updateMaxConcurrent(e) {
  this.maxConcurrent = Math.max(1, Math.min(25, e)), gameState.settings && (gameState.settings.maxImageRequests = this.maxConcurrent), this.processQueue(), this.updateUI(), console.log(`[Image Queue] Updated max concurrent to ${this.maxConcurrent}`);
}, async enqueue(e, t = "Image Generation") {
  return new Promise((n, a) => {
    const o = { id: Date.now() + Math.random(), function: e, description: t, resolve: n, reject: a, timestamp: Date.now() };
    this.requestQueue.push(o), console.log(`[Image Queue] Queued: ${t} (Queue: ${this.requestQueue.length})`), this.updateUI(), this.processQueue();
  });
}, async processQueue() {
  for (; this.activeRequests < this.maxConcurrent && this.requestQueue.length > 0; ) {
    const e = this.requestQueue.shift();
    this.activeRequests++, this.updateUI(), console.log(`[Image Queue] Starting: ${e.description} (Active: ${this.activeRequests}, Queued: ${this.requestQueue.length})`);
    let t = false;
    try {
      const n = await this.executeWithRetry(e);
      e.resolve(n), t = true;
    } catch (u2) {
      console.error(`[Image Queue] Final error in ${e.description}:`, u2);
      const n = this.getFallbackResponse(e.description, u2);
      e.resolve(n);
    } finally {
      this.activeRequests--, t && void 0 !== gameState && (gameState.generationStats || (gameState.generationStats = { totalTextGenerations: 0, totalImageGenerations: 0 }), gameState.generationStats.totalImageGenerations++), this.updateUI(), console.log(`[Image Queue] Completed: ${e.description} (Active: ${this.activeRequests}, Queued: ${this.requestQueue.length})`), this.processQueue();
    }
  }
}, async executeWithRetry(e, t = 3) {
  for (let n = 1; n <= t; n++) try {
    const t2 = await Promise.race([e.function(), new Promise((_, u2) => setTimeout(() => u2(new Error("Image request timeout")), this.requestTimeoutMs))]);
    let a = t2;
    if (t2 instanceof String && (a = t2.valueOf()), !(a && "string" == typeof a && a.length > 50 && (a.startsWith("http") || a.startsWith("data:") || a.startsWith("blob:")))) throw console.warn(`[Image Queue] Invalid image response on attempt ${n}:`, typeof a, a?.substring?.(0, 50) || a), new Error("Invalid image URL received: " + typeof a);
    return a;
  } catch (u2) {
    console.warn(`[Image Queue] Attempt ${n}/${t} failed for ${e.description}:`, u2);
    const o = u2?.message || "", i = /max.*request|too.*many.*request|request.*limit|rate.*limit|exceeded.*limit|quota.*exceeded/i.test(o), s = /content.*policy|inappropriate.*content|unsafe.*content|violation|blocked/i.test(o), r = /network|timeout|connection|fetch/i.test(o);
    if ((i || s) && (this.logImageFailure(e, u2, n, { type: i ? "rate_limit" : "content_policy", isRateLimit: i, isContentPolicy: s }), 1 === n && i && (console.warn("[Image Queue] \u{1F6A8} Rate limit detected on first attempt - extending wait time"), await new Promise((e2) => setTimeout(e2, 8e3)))), n === t) throw (i || s) && this.logImageFailure(e, u2, n, { type: i ? "rate_limit" : "content_policy", isRateLimit: i, isContentPolicy: s }, true), u2;
    let l;
    l = i ? 3e3 * Math.pow(2, n) : s ? 1e3 : r ? 2e3 * Math.pow(2, n - 1) : 1500 * Math.pow(2, n - 1), console.log(`[Image Queue] Retrying ${e.description} in ${l}ms...`), await new Promise((e2) => setTimeout(e2, l));
  }
}, logImageFailure(e, t, n, a = {}, o = false) {
  const i = (/* @__PURE__ */ new Date()).toISOString(), s = { activeRequests: this.activeRequests, queuedRequests: this.requestQueue.length, maxConcurrent: this.maxConcurrent, totalPending: this.activeRequests + this.requestQueue.length, failedRequest: e.description, attempt: n, error: t.message || "Unknown error", errorType: a.type || "unknown", isRateLimit: a.isRateLimit || false, isContentPolicy: a.isContentPolicy || false, timestamp: i }, r = a.isRateLimit ? "\u{1F6A8}" : a.isContentPolicy ? "\u26A0\uFE0F" : "\u274C", l = a.isRateLimit ? "RATE LIMIT" : a.isContentPolicy ? "CONTENT POLICY" : "GENERATION";
  return console.error(`${r} [IMAGE QUEUE] ${l} ERROR DETECTED:`), console.error("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), console.error(`\u{1F4CD} Request: ${e.description}`), console.error(`\u{1F5BC}\uFE0F Queue State: ${this.activeRequests} active, ${this.requestQueue.length} queued`), console.error(`\u2699\uFE0F Max Concurrent: ${this.maxConcurrent}`), console.error(`\u{1F4CA} Total Pending: ${s.totalPending}`), console.error(`\u{1F3AF} Attempt: ${n}${o ? " (FINAL)" : ""}`), console.error(`\u26A0\uFE0F Error Type: ${l}`), console.error(`\u{1F50D} Error: ${t.message}`), console.error(`\u{1F550} Time: ${i}`), console.error("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), window.imageQueueFailures || (window.imageQueueFailures = []), window.imageQueueFailures.push(s), window.imageQueueFailures.length > 20 && window.imageQueueFailures.shift(), o && "function" == typeof showNotification && (a.isRateLimit ? showNotification(`\u{1F6A8} Image Rate Limit Hit!
Queue: ${this.activeRequests} active, ${this.requestQueue.length} waiting
Consider lowering max requests to ${Math.max(3, this.maxConcurrent - 2)}`, "warning", 8e3) : a.isContentPolicy ? showNotification("\u26A0\uFE0F Image Content Policy Violation\nThe image request was blocked by safety filters.\nTrying alternative approach...", "warning", 6e3) : showNotification(`\u274C Image Generation Failed
Request: ${e.description}
Using fallback image...`, "error", 6e3)), s;
}, getFallbackResponse(e, t) {
  const n = t?.message || "Unknown error";
  console.log(`[Image Queue] Using fallback for ${e}: ${n}`);
  const a = e.toLowerCase();
  return a.includes("profile") || a.includes("employee") || a.includes("manager") ? "https://via.placeholder.com/200x200/4ecca3/ffffff?text=Profile" : a.includes("social") || a.includes("post") ? "https://via.placeholder.com/300x200/00d4ff/ffffff?text=Social+Post" : a.includes("gift") || a.includes("present") ? "https://via.placeholder.com/150x150/ffd700/ffffff?text=Gift" : a.includes("chat") || a.includes("message") ? "https://via.placeholder.com/200x150/ff6b9d/ffffff?text=Message" : a.includes("scene") || a.includes("office") ? "https://via.placeholder.com/400x250/232931/ffffff?text=Office+Scene" : "https://via.placeholder.com/250x200/666666/ffffff?text=Image+Unavailable";
}, updateUI() {
  const e = document.getElementById("imageQueueStatus"), t = document.getElementById("imageQueueCounts"), n = document.getElementById("imageTotalGenerated");
  e && (0 === this.activeRequests && 0 === this.requestQueue.length ? (e.textContent = "Ready", e.style.color = "var(--n)") : this.requestQueue.length > 0 ? (e.textContent = "Busy (Queued)", e.style.color = "var(--z)") : (e.textContent = "Generating", e.style.color = "var(--v)")), t && (t.textContent = `${this.activeRequests}/${this.requestQueue.length}`), n && void 0 !== gameState && gameState.generationStats && (n.textContent = (gameState.generationStats.totalImageGenerations || 0).toLocaleString());
}, getStats() {
  return { active: this.activeRequests, queued: this.requestQueue.length, maxConcurrent: this.maxConcurrent, totalWaiting: this.activeRequests + this.requestQueue.length };
}, analyzeFailures() {
  if (!window.imageQueueFailures || 0 === window.imageQueueFailures.length) return console.log("\u{1F50D} [Image Queue Analysis] No failures recorded yet."), null;
  const e = window.imageQueueFailures, t = e.filter((e2) => e2.isRateLimit), n = e.filter((e2) => e2.isContentPolicy), a = e.filter((e2) => !e2.isRateLimit && !e2.isContentPolicy), o = { totalFailures: e.length, rateLimitFailures: t.length, contentPolicyFailures: n.length, otherFailures: a.length, avgActiveAtFailure: e.reduce((e2, t2) => e2 + t2.activeRequests, 0) / e.length, avgQueuedAtFailure: e.reduce((e2, t2) => e2 + t2.queuedRequests, 0) / e.length, avgMaxConcurrentAtFailure: e.reduce((e2, t2) => e2 + t2.maxConcurrent, 0) / e.length, maxActiveAtFailure: Math.max(...e.map((e2) => e2.activeRequests)), recentFailures: e.slice(-5) };
  let i = this.maxConcurrent;
  if (t.length > 0) {
    const e2 = t.reduce((e3, t2) => e3 + t2.activeRequests, 0) / t.length, n2 = Math.floor(0.7 * e2);
    i = Math.max(3, Math.min(15, n2));
  }
  return console.log("\u{1F50D} [IMAGE QUEUE FAILURE ANALYSIS]"), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), console.log(`\u{1F5BC}\uFE0F Total image generation failures: ${o.totalFailures}`), console.log(`\u{1F6A8} Rate limit failures: ${o.rateLimitFailures}`), console.log(`\u26A0\uFE0F Content policy failures: ${o.contentPolicyFailures}`), console.log(`\u274C Other failures: ${o.otherFailures}`), console.log(`\u{1F4C8} Average active requests at failure: ${o.avgActiveAtFailure.toFixed(1)}`), console.log(`\u{1F4CB} Average queued requests at failure: ${o.avgQueuedAtFailure.toFixed(1)}`), console.log(`\u2699\uFE0F Average max concurrent setting: ${o.avgMaxConcurrentAtFailure.toFixed(1)}`), console.log(`\u{1F3AF} Highest active count at failure: ${o.maxActiveAtFailure}`), t.length > 0 && console.log(`\u{1F4A1} RECOMMENDED max concurrent: ${i} (current: ${this.maxConcurrent})`), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), o.recentFailures.length > 0 && (console.log("\u{1F550} Recent failures:"), o.recentFailures.forEach((e2, t2) => {
    const n2 = e2.isRateLimit ? "\u{1F6A8}" : e2.isContentPolicy ? "\u26A0\uFE0F" : "\u274C";
    console.log(`  ${t2 + 1}. ${n2} ${e2.activeRequests} active, ${e2.queuedRequests} queued (max: ${e2.maxConcurrent}) - ${e2.failedRequest}`);
  })), t.length > 0 && i < this.maxConcurrent && (console.log(`
\u{1F39B}\uFE0F Consider lowering max concurrent to ${i} for better stability.`), console.log(`   Use: ImageRequestQueue.updateMaxConcurrent(${i})`)), n.length > 0 && (console.log(`
\u26A0\uFE0F ${n.length} content policy violations detected.`), console.log("   Consider reviewing image prompts to ensure they comply with safety guidelines.")), o;
}, clearFailureData() {
  if (window.imageQueueFailures) {
    const e = window.imageQueueFailures.length;
    window.imageQueueFailures = [], console.log(`\u{1F5D1}\uFE0F [Image Queue] Cleared ${e} failure records.`);
  }
}, savePersistentRequest(e) {
  gameState.pendingAIRequests || (gameState.pendingAIRequests = { text: [], image: [] });
  const t = { id: e.id || Date.now() + Math.random(), type: e.type || "generic", prompt: e.prompt, description: e.description || "Image Generation", callback: e.callback, callbackData: e.callbackData, timestamp: Date.now() };
  return gameState.pendingAIRequests.image.push(t), console.log(`[Image Queue] \u{1F4BE} Saved persistent request: ${t.description} (${gameState.pendingAIRequests.image.length} pending)`), "function" == typeof debouncedSave && debouncedSave(), t.id;
}, completePersistentRequest(e) {
  if (!gameState.pendingAIRequests?.image) return;
  const t = gameState.pendingAIRequests.image.findIndex((t2) => t2.id === e);
  if (-1 !== t) {
    const e2 = gameState.pendingAIRequests.image.splice(t, 1)[0];
    console.log(`[Image Queue] \u2705 Completed persistent request: ${e2.description} (${gameState.pendingAIRequests.image.length} remaining)`), "function" == typeof debouncedSave && debouncedSave();
  }
}, async restorePendingRequests() {
  if (!gameState.pendingAIRequests?.image || 0 === gameState.pendingAIRequests.image.length) return void console.log("[Image Queue] No pending requests to restore");
  const e = gameState.pendingAIRequests.image.length;
  console.log(`[Image Queue] \u{1F504} Restoring ${e} pending image generation requests...`);
  const t = [...gameState.pendingAIRequests.image];
  gameState.pendingAIRequests.image = [];
  let n = 0;
  for (const e2 of t) try {
    const t2 = (Date.now() - e2.timestamp) / 36e5;
    if (t2 > 24) {
      console.log(`[Image Queue] \u23ED\uFE0F Skipping stale request (${t2.toFixed(1)}h old): ${e2.description}`);
      continue;
    }
    console.log(`[Image Queue] \u{1F504} Re-queueing: ${e2.description}`), n++, gameState.pendingAIRequests.image.push(e2), this.enqueue(() => generateImage(e2.prompt), e2.description).then((t3) => {
      const n2 = gameState.pendingAIRequests.image.findIndex((t4) => t4.id === e2.id);
      -1 !== n2 && (gameState.pendingAIRequests.image.splice(n2, 1), console.log(`[Image Queue] \u2705 Restored request completed: ${e2.description}`));
    }).catch((t3) => {
      const n2 = gameState.pendingAIRequests.image.findIndex((t4) => t4.id === e2.id);
      -1 !== n2 && gameState.pendingAIRequests.image.splice(n2, 1), console.error(`[Image Queue] Restored request failed: ${e2.description}`, t3);
    });
  } catch (t2) {
    console.error(`[Image Queue] Error restoring request ${e2.description}:`, t2);
  }
  "function" == typeof showNotification && n > 0 && showNotification(`\u{1F504} Restored ${n} pending image requests`, "info", 4e3);
}, async enqueuePersistent(e) {
  const t = this.savePersistentRequest(e);
  try {
    const n = await this.enqueue(() => generateImage(e.prompt), e.description);
    if (this.completePersistentRequest(t), e.callback && "function" == typeof window[e.callback]) try {
      await window[e.callback](n, e.callbackData);
    } catch (t2) {
      console.error(`[Image Queue] Callback error for ${e.description}:`, t2);
    }
    return n;
  } catch (t2) {
    throw console.error(`[Image Queue] Persistent request failed: ${e.description}`, t2), t2;
  }
}, getPendingCount: () => gameState.pendingAIRequests?.image?.length || 0 };
async function queuedGenerateImage(e, t = "Image Generation", n = {}) {
  const u2 = "string" == typeof e ? e : e?.prompt || "";
  if (!u2.trim()) return console.warn("[Image Queue] Empty image prompt - skipping generation:", t), ImageRequestQueue.getFallbackResponse(t, new Error("Empty image prompt"));
  if (console.log(`[Prompt] \u{1F3A8} IMAGE \xB7 ${t} (${u2.length} chars):
${u2}`), "function" != typeof generateImage) return console.warn("[Image Queue] generateImage not available, using fallback"), ImageRequestQueue.getFallbackResponse(t, new Error("generateImage not available"));
  gameState.pendingAIRequests || (gameState.pendingAIRequests = { text: [], image: [] });
  const a = Date.now() + Math.random(), o = { id: a, prompt: e, description: t, timestamp: Date.now() };
  gameState.pendingAIRequests.image.push(o), console.log(`[Image Queue] \u{1F4BE} Auto-persisted: ${t} (${gameState.pendingAIRequests.image.length} pending)`), "function" == typeof saveGame && saveGame(false).catch((e2) => console.warn("[Image Queue] Save warning:", e2));
  try {
    const o2 = await ImageRequestQueue.enqueue(() => generateImage(e, Object.keys(n).length ? n : void 0), t), i = gameState.pendingAIRequests.image.findIndex((e2) => e2.id === a);
    return -1 !== i && (gameState.pendingAIRequests.image.splice(i, 1), console.log(`[Image Queue] \u2705 Completed & removed: ${t} (${gameState.pendingAIRequests.image.length} remaining)`)), o2;
  } catch (e2) {
    console.error(`[Image Queue] Final fallback for ${t}:`, e2);
    const n2 = gameState.pendingAIRequests.image.findIndex((e3) => e3.id === a);
    return -1 !== n2 && gameState.pendingAIRequests.image.splice(n2, 1), ImageRequestQueue.getFallbackResponse(t, e2);
  }
}
window.imageQueueDebug = { status: () => {
  const e = ImageRequestQueue.getStats(), t = ImageRequestQueue.getPendingCount();
  return console.log("\u{1F50D} [Image Queue Status]"), console.log(`Active: ${e.active}, Queued: ${e.queued}, Max: ${e.maxConcurrent}`), console.log(`Total pending: ${e.totalWaiting}`), console.log(`\u{1F4BE} Persistent pending: ${t}`), e;
}, analyze: () => ImageRequestQueue.analyzeFailures(), clearFailures: () => ImageRequestQueue.clearFailureData(), getFailures: () => window.imageQueueFailures || [], setMax: (e) => {
  ImageRequestQueue.updateMaxConcurrent(e), console.log(`\u2705 Max concurrent image requests set to ${e}`);
}, getPending: () => gameState.pendingAIRequests?.image || [], clearPending: () => {
  const e = gameState.pendingAIRequests?.image?.length || 0;
  return gameState.pendingAIRequests && (gameState.pendingAIRequests.image = []), console.log(`\u{1F5D1}\uFE0F Cleared ${e} persistent pending image requests`), e;
}, setTotalGenerated: (e) => (gameState.generationStats || (gameState.generationStats = { totalTextGenerations: 0, totalImageGenerations: 0 }), gameState.generationStats.totalImageGenerations = e, ImageRequestQueue.updateUI(), console.log(`\u2705 Set total image generations to ${e.toLocaleString()}`), e), help: () => {
  console.log("\u{1F527} [Image Queue Debug Commands]"), console.log("imageQueueDebug.status()       - Show current queue status"), console.log("imageQueueDebug.analyze()      - Analyze generation failures"), console.log("imageQueueDebug.setMax(8)      - Set max concurrent requests"), console.log("imageQueueDebug.clearFailures() - Clear failure tracking data"), console.log("imageQueueDebug.getFailures()  - Get raw failure data"), console.log("imageQueueDebug.getPending()   - Get persistent pending requests"), console.log("imageQueueDebug.clearPending() - Clear persistent pending requests"), console.log("imageQueueDebug.setTotalGenerated(1000) - Set total generated count"), console.log("imageQueueDebug.help()         - Show this help");
} };
