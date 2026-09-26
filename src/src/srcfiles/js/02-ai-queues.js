// ============================================================================
// 02-ai-queues — AI text + image request queues (queuedGenerateText/queuedGenerateImage, ImageRequestQueue, debug hooks).
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

async function queuedGenerateText(e, t = {}, n = "Text Generation") {
    if ("function" != typeof generateText)
        return (
            console.warn("[AI Queue] generateText not available, using fallback"),
            AIRequestQueue.getFallbackResponse(n, new Error("generateText not available"))
        );
    gameState.pendingAIRequests || (gameState.pendingAIRequests = { text: [], image: [] });
    const a = Date.now() + Math.random(),
        o = {
            id: a,
            prompt: e,
            options: Object.fromEntries(Object.entries(t).filter(([, e]) => "function" != typeof e)),
            description: n,
            timestamp: Date.now(),
        };
    gameState.pendingAIRequests.text.push(o),
        console.log(`[AI Queue] 💾 Auto-persisted: ${n} (${gameState.pendingAIRequests.text.length} pending)`),
        "function" == typeof saveGame && saveGame(!1).catch((e) => console.warn("[AI Queue] Save warning:", e));
    try {
        const o = await AIRequestQueue.enqueue(() => generateText(e, t, n), n),
            i = gameState.pendingAIRequests.text.findIndex((e) => e.id === a);
        return (
            -1 !== i &&
                (gameState.pendingAIRequests.text.splice(i, 1),
                console.log(
                    `[AI Queue] ✅ Completed & removed: ${n} (${gameState.pendingAIRequests.text.length} remaining)`
                )),
            o
        );
    } catch (e) {
        console.error(`[AI Queue] Final fallback for ${n}:`, e);
        const t = gameState.pendingAIRequests.text.findIndex((e) => e.id === a);
        return -1 !== t && gameState.pendingAIRequests.text.splice(t, 1), AIRequestQueue.getFallbackResponse(n, e);
    }
}
async function queuedGenerateTextPersistent(e) {
    return "function" != typeof generateText
        ? (console.warn("[AI Queue] generateText not available, using fallback"),
          AIRequestQueue.getFallbackResponse(
              e.description || "Text Generation",
              new Error("generateText not available")
          ))
        : await AIRequestQueue.enqueuePersistent(e);
}
async function queuedGenerateImagePersistent(e) {
    return "function" != typeof generateImage
        ? (console.warn("[Image Queue] generateImage not available, using fallback"),
          ImageRequestQueue.getFallbackResponse(
              e.description || "Image Generation",
              new Error("generateImage not available")
          ))
        : await ImageRequestQueue.enqueuePersistent(e);
}
window.aiQueueDebug = {
    status: () => {
        const e = AIRequestQueue.getStats(),
            t = AIRequestQueue.getPendingCount();
        return (
            console.log("🔍 [AI Queue Status]"),
            console.log(`Active: ${e.active}, Queued: ${e.queued}, Max: ${e.maxConcurrent}`),
            console.log(`Total pending: ${e.totalWaiting}`),
            console.log(`💾 Persistent pending: ${t}`),
            e
        );
    },
    analyze: () => AIRequestQueue.analyzeFailures(),
    clearFailures: () => AIRequestQueue.clearFailureData(),
    getFailures: () => window.aiQueueFailures || [],
    setMax: (e) => {
        AIRequestQueue.updateMaxConcurrent(e), console.log(`✅ Max concurrent requests set to ${e}`);
    },
    getPending: () => gameState.pendingAIRequests?.text || [],
    clearPending: () => {
        const e = gameState.pendingAIRequests?.text?.length || 0;
        return (
            gameState.pendingAIRequests && (gameState.pendingAIRequests.text = []),
            console.log(`🗑️ Cleared ${e} persistent pending requests`),
            e
        );
    },
    help: () => {
        console.log("🔧 [AI Queue Debug Commands]"),
            console.log("aiQueueDebug.status()       - Show current queue status"),
            console.log("aiQueueDebug.analyze()      - Analyze Max Requests failures"),
            console.log("aiQueueDebug.setMax(15)     - Set max concurrent requests"),
            console.log("aiQueueDebug.clearFailures() - Clear failure tracking data"),
            console.log("aiQueueDebug.getFailures()  - Get raw failure data"),
            console.log("aiQueueDebug.getPending()   - Get persistent pending requests"),
            console.log("aiQueueDebug.clearPending() - Clear persistent pending requests"),
            console.log("aiQueueDebug.help()         - Show this help");
    },
};
const ImageRequestQueue = {
    activeRequests: 0,
    requestQueue: [],
    maxConcurrent: 8,
    requestTimeoutMs: 18e4,
    init() {
        (this.maxConcurrent = gameState?.settings?.maxImageRequests || 8),
            console.log(`[Image Queue] Initialized with max ${this.maxConcurrent} concurrent requests`),
            this.updateUI();
    },
    updateMaxConcurrent(e) {
        (this.maxConcurrent = Math.max(1, Math.min(25, e))),
            gameState.settings && (gameState.settings.maxImageRequests = this.maxConcurrent),
            this.processQueue(),
            this.updateUI(),
            console.log(`[Image Queue] Updated max concurrent to ${this.maxConcurrent}`);
    },
    async enqueue(e, t = "Image Generation") {
        return new Promise((n, a) => {
            const o = {
                id: Date.now() + Math.random(),
                function: e,
                description: t,
                resolve: n,
                reject: a,
                timestamp: Date.now(),
            };
            this.requestQueue.push(o),
                console.log(`[Image Queue] Queued: ${t} (Queue: ${this.requestQueue.length})`),
                this.updateUI(),
                this.processQueue();
        });
    },
    async processQueue() {
        for (; this.activeRequests < this.maxConcurrent && this.requestQueue.length > 0; ) {
            const e = this.requestQueue.shift();
            this.activeRequests++,
                this.updateUI(),
                console.log(
                    `[Image Queue] Starting: ${e.description} (Active: ${this.activeRequests}, Queued: ${this.requestQueue.length})`
                );
            let t = !1;
            try {
                const n = await this.executeWithRetry(e);
                e.resolve(n), (t = !0);
            } catch (t) {
                console.error(`[Image Queue] Final error in ${e.description}:`, t);
                const n = this.getFallbackResponse(e.description, t);
                e.resolve(n);
            } finally {
                this.activeRequests--,
                    t &&
                        void 0 !== gameState &&
                        (gameState.generationStats ||
                            (gameState.generationStats = { totalTextGenerations: 0, totalImageGenerations: 0 }),
                        gameState.generationStats.totalImageGenerations++),
                    this.updateUI(),
                    console.log(
                        `[Image Queue] Completed: ${e.description} (Active: ${this.activeRequests}, Queued: ${this.requestQueue.length})`
                    ),
                    this.processQueue();
            }
        }
    },
    async executeWithRetry(e, t = 3) {
        for (let n = 1; n <= t; n++)
            try {
                const t = await Promise.race([
                    e.function(),
                    new Promise((_, rej) =>
                        setTimeout(() => rej(new Error("Image request timeout")), this.requestTimeoutMs)
                    ),
                ]);
                let a = t;
                t instanceof String && (a = t.valueOf());
                if (
                    !(
                        a &&
                        "string" == typeof a &&
                        a.length > 50 &&
                        (a.startsWith("http") || a.startsWith("data:") || a.startsWith("blob:"))
                    )
                )
                    throw (
                        (console.warn(
                            `[Image Queue] Invalid image response on attempt ${n}:`,
                            typeof a,
                            a?.substring?.(0, 50) || a
                        ),
                        new Error("Invalid image URL received: " + typeof a))
                    );
                return a;
            } catch (a) {
                console.warn(`[Image Queue] Attempt ${n}/${t} failed for ${e.description}:`, a);
                const o = a?.message || "",
                    i =
                        /max.*request|too.*many.*request|request.*limit|rate.*limit|exceeded.*limit|quota.*exceeded/i.test(
                            o
                        ),
                    s = /content.*policy|inappropriate.*content|unsafe.*content|violation|blocked/i.test(o),
                    r = /network|timeout|connection|fetch/i.test(o);
                if (
                    ((i || s) &&
                        (this.logImageFailure(e, a, n, {
                            type: i ? "rate_limit" : "content_policy",
                            isRateLimit: i,
                            isContentPolicy: s,
                        }),
                        1 === n &&
                            i &&
                            (console.warn(
                                "[Image Queue] 🚨 Rate limit detected on first attempt - extending wait time"
                            ),
                            await new Promise((e) => setTimeout(e, 8e3)))),
                    n === t)
                )
                    throw (
                        ((i || s) &&
                            this.logImageFailure(
                                e,
                                a,
                                n,
                                { type: i ? "rate_limit" : "content_policy", isRateLimit: i, isContentPolicy: s },
                                !0
                            ),
                        a)
                    );
                let l;
                (l = i ? 3e3 * Math.pow(2, n) : s ? 1e3 : r ? 2e3 * Math.pow(2, n - 1) : 1500 * Math.pow(2, n - 1)),
                    console.log(`[Image Queue] Retrying ${e.description} in ${l}ms...`),
                    await new Promise((e) => setTimeout(e, l));
            }
    },
    logImageFailure(e, t, n, a = {}, o = !1) {
        const i = new Date().toISOString(),
            s = {
                activeRequests: this.activeRequests,
                queuedRequests: this.requestQueue.length,
                maxConcurrent: this.maxConcurrent,
                totalPending: this.activeRequests + this.requestQueue.length,
                failedRequest: e.description,
                attempt: n,
                error: t.message || "Unknown error",
                errorType: a.type || "unknown",
                isRateLimit: a.isRateLimit || !1,
                isContentPolicy: a.isContentPolicy || !1,
                timestamp: i,
            },
            r = a.isRateLimit ? "🚨" : a.isContentPolicy ? "⚠️" : "❌",
            l = a.isRateLimit ? "RATE LIMIT" : a.isContentPolicy ? "CONTENT POLICY" : "GENERATION";
        return (
            console.error(`${r} [IMAGE QUEUE] ${l} ERROR DETECTED:`),
            console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
            console.error(`📍 Request: ${e.description}`),
            console.error(`🖼️ Queue State: ${this.activeRequests} active, ${this.requestQueue.length} queued`),
            console.error(`⚙️ Max Concurrent: ${this.maxConcurrent}`),
            console.error(`📊 Total Pending: ${s.totalPending}`),
            console.error(`🎯 Attempt: ${n}${o ? " (FINAL)" : ""}`),
            console.error(`⚠️ Error Type: ${l}`),
            console.error(`🔍 Error: ${t.message}`),
            console.error(`🕐 Time: ${i}`),
            console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
            window.imageQueueFailures || (window.imageQueueFailures = []),
            window.imageQueueFailures.push(s),
            window.imageQueueFailures.length > 20 && window.imageQueueFailures.shift(),
            o &&
                "function" == typeof showNotification &&
                (a.isRateLimit
                    ? showNotification(
                          `🚨 Image Rate Limit Hit!\nQueue: ${this.activeRequests} active, ${this.requestQueue.length} waiting\nConsider lowering max requests to ${Math.max(3, this.maxConcurrent - 2)}`,
                          "warning",
                          8e3
                      )
                    : a.isContentPolicy
                      ? showNotification(
                            "⚠️ Image Content Policy Violation\nThe image request was blocked by safety filters.\nTrying alternative approach...",
                            "warning",
                            6e3
                        )
                      : showNotification(
                            `❌ Image Generation Failed\nRequest: ${e.description}\nUsing fallback image...`,
                            "error",
                            6e3
                        )),
            s
        );
    },
    getFallbackResponse(e, t) {
        const n = t?.message || "Unknown error";
        console.log(`[Image Queue] Using fallback for ${e}: ${n}`);
        const a = e.toLowerCase();
        return a.includes("profile") || a.includes("employee") || a.includes("manager")
            ? placeholderImage(200, 200, "Profile", "#4ecca3", "#ffffff")
            : a.includes("social") || a.includes("post")
              ? placeholderImage(300, 200, "Social Post", "#00d4ff", "#ffffff")
              : a.includes("gift") || a.includes("present")
                ? placeholderImage(150, 150, "Gift", "#ffd700", "#ffffff")
                : a.includes("chat") || a.includes("message")
                  ? placeholderImage(200, 150, "Message", "#ff6b9d", "#ffffff")
                  : a.includes("scene") || a.includes("office")
                    ? placeholderImage(400, 250, "Office Scene", "#232931", "#ffffff")
                    : placeholderImage(250, 200, "Image Unavailable", "#666666", "#ffffff");
    },
    updateUI() {
        const e = document.getElementById("imageQueueStatus"),
            t = document.getElementById("imageQueueCounts"),
            n = document.getElementById("imageTotalGenerated");
        e &&
            (0 === this.activeRequests && 0 === this.requestQueue.length
                ? ((e.textContent = "Ready"), (e.style.color = "var(--l-green)"))
                : this.requestQueue.length > 0
                  ? ((e.textContent = "Busy (Queued)"), (e.style.color = "var(--l-gold)"))
                  : ((e.textContent = "Generating"), (e.style.color = "var(--l-pink)"))),
            t && (t.textContent = `${this.activeRequests}/${this.requestQueue.length}`),
            n &&
                void 0 !== gameState &&
                gameState.generationStats &&
                (n.textContent = (gameState.generationStats.totalImageGenerations || 0).toLocaleString());
    },
    getStats() {
        return {
            active: this.activeRequests,
            queued: this.requestQueue.length,
            maxConcurrent: this.maxConcurrent,
            totalWaiting: this.activeRequests + this.requestQueue.length,
        };
    },
    analyzeFailures() {
        if (!window.imageQueueFailures || 0 === window.imageQueueFailures.length)
            return console.log("🔍 [Image Queue Analysis] No failures recorded yet."), null;
        const e = window.imageQueueFailures,
            t = e.filter((e) => e.isRateLimit),
            n = e.filter((e) => e.isContentPolicy),
            a = e.filter((e) => !e.isRateLimit && !e.isContentPolicy),
            o = {
                totalFailures: e.length,
                rateLimitFailures: t.length,
                contentPolicyFailures: n.length,
                otherFailures: a.length,
                avgActiveAtFailure: e.reduce((e, t) => e + t.activeRequests, 0) / e.length,
                avgQueuedAtFailure: e.reduce((e, t) => e + t.queuedRequests, 0) / e.length,
                avgMaxConcurrentAtFailure: e.reduce((e, t) => e + t.maxConcurrent, 0) / e.length,
                maxActiveAtFailure: Math.max(...e.map((e) => e.activeRequests)),
                recentFailures: e.slice(-5),
            };
        let i = this.maxConcurrent;
        if (t.length > 0) {
            const e = t.reduce((e, t) => e + t.activeRequests, 0) / t.length,
                n = Math.floor(0.7 * e);
            i = Math.max(3, Math.min(15, n));
        }
        return (
            console.log("🔍 [IMAGE QUEUE FAILURE ANALYSIS]"),
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
            console.log(`🖼️ Total image generation failures: ${o.totalFailures}`),
            console.log(`🚨 Rate limit failures: ${o.rateLimitFailures}`),
            console.log(`⚠️ Content policy failures: ${o.contentPolicyFailures}`),
            console.log(`❌ Other failures: ${o.otherFailures}`),
            console.log(`📈 Average active requests at failure: ${o.avgActiveAtFailure.toFixed(1)}`),
            console.log(`📋 Average queued requests at failure: ${o.avgQueuedAtFailure.toFixed(1)}`),
            console.log(`⚙️ Average max concurrent setting: ${o.avgMaxConcurrentAtFailure.toFixed(1)}`),
            console.log(`🎯 Highest active count at failure: ${o.maxActiveAtFailure}`),
            t.length > 0 && console.log(`💡 RECOMMENDED max concurrent: ${i} (current: ${this.maxConcurrent})`),
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
            o.recentFailures.length > 0 &&
                (console.log("🕐 Recent failures:"),
                o.recentFailures.forEach((e, t) => {
                    const n = e.isRateLimit ? "🚨" : e.isContentPolicy ? "⚠️" : "❌";
                    console.log(
                        `  ${t + 1}. ${n} ${e.activeRequests} active, ${e.queuedRequests} queued (max: ${e.maxConcurrent}) - ${e.failedRequest}`
                    );
                })),
            t.length > 0 &&
                i < this.maxConcurrent &&
                (console.log(`\n🎛️ Consider lowering max concurrent to ${i} for better stability.`),
                console.log(`   Use: ImageRequestQueue.updateMaxConcurrent(${i})`)),
            n.length > 0 &&
                (console.log(`\n⚠️ ${n.length} content policy violations detected.`),
                console.log("   Consider reviewing image prompts to ensure they comply with safety guidelines.")),
            o
        );
    },
    clearFailureData() {
        if (window.imageQueueFailures) {
            const e = window.imageQueueFailures.length;
            (window.imageQueueFailures = []), console.log(`🗑️ [Image Queue] Cleared ${e} failure records.`);
        }
    },
    savePersistentRequest(e) {
        gameState.pendingAIRequests || (gameState.pendingAIRequests = { text: [], image: [] });
        const t = {
            id: e.id || Date.now() + Math.random(),
            type: e.type || "generic",
            prompt: e.prompt,
            description: e.description || "Image Generation",
            callback: e.callback,
            callbackData: e.callbackData,
            timestamp: Date.now(),
        };
        return (
            gameState.pendingAIRequests.image.push(t),
            console.log(
                `[Image Queue] 💾 Saved persistent request: ${t.description} (${gameState.pendingAIRequests.image.length} pending)`
            ),
            "function" == typeof debouncedSave && debouncedSave(),
            t.id
        );
    },
    completePersistentRequest(e) {
        if (!gameState.pendingAIRequests?.image) return;
        const t = gameState.pendingAIRequests.image.findIndex((t) => t.id === e);
        if (-1 !== t) {
            const e = gameState.pendingAIRequests.image.splice(t, 1)[0];
            console.log(
                `[Image Queue] ✅ Completed persistent request: ${e.description} (${gameState.pendingAIRequests.image.length} remaining)`
            ),
                "function" == typeof debouncedSave && debouncedSave();
        }
    },
    async restorePendingRequests() {
        if (!gameState.pendingAIRequests?.image || 0 === gameState.pendingAIRequests.image.length)
            return void console.log("[Image Queue] No pending requests to restore");
        const e = gameState.pendingAIRequests.image.length;
        console.log(`[Image Queue] 🔄 Restoring ${e} pending image generation requests...`);
        const t = [...gameState.pendingAIRequests.image];
        gameState.pendingAIRequests.image = [];
        let n = 0;
        for (const e of t)
            try {
                const t = (Date.now() - e.timestamp) / 36e5;
                if (t > 24) {
                    console.log(`[Image Queue] ⏭️ Skipping stale request (${t.toFixed(1)}h old): ${e.description}`);
                    continue;
                }
                console.log(`[Image Queue] 🔄 Re-queueing: ${e.description}`),
                    n++,
                    gameState.pendingAIRequests.image.push(e),
                    this.enqueue(() => generateImage(e.prompt), e.description)
                        .then((t) => {
                            const n = gameState.pendingAIRequests.image.findIndex((t) => t.id === e.id);
                            -1 !== n &&
                                (gameState.pendingAIRequests.image.splice(n, 1),
                                console.log(`[Image Queue] ✅ Restored request completed: ${e.description}`));
                        })
                        .catch((t) => {
                            const n = gameState.pendingAIRequests.image.findIndex((t) => t.id === e.id);
                            -1 !== n && gameState.pendingAIRequests.image.splice(n, 1),
                                console.error(`[Image Queue] Restored request failed: ${e.description}`, t);
                        });
            } catch (t) {
                console.error(`[Image Queue] Error restoring request ${e.description}:`, t);
            }
        "function" == typeof showNotification &&
            n > 0 &&
            showNotification(`🔄 Restored ${n} pending image requests`, "info", 4e3);
    },
    async enqueuePersistent(e) {
        const t = this.savePersistentRequest(e);
        try {
            const n = await this.enqueue(() => generateImage(e.prompt), e.description);
            if ((this.completePersistentRequest(t), e.callback && "function" == typeof window[e.callback]))
                try {
                    await window[e.callback](n, e.callbackData);
                } catch (t) {
                    console.error(`[Image Queue] Callback error for ${e.description}:`, t);
                }
            return n;
        } catch (t) {
            throw (console.error(`[Image Queue] Persistent request failed: ${e.description}`, t), t);
        }
    },
    getPendingCount: () => gameState.pendingAIRequests?.image?.length || 0,
};
async function queuedGenerateImage(e, t = "Image Generation", n = {}) {
    const promptText = "string" == typeof e ? e : e?.prompt || "";
    if (!promptText.trim())
        return (
            console.warn("[Image Queue] Empty image prompt - skipping generation:", t),
            ImageRequestQueue.getFallbackResponse(t, new Error("Empty image prompt"))
        );
    console.log(`[Prompt] 🎨 IMAGE · ${t} (${promptText.length} chars):\n${promptText}`);
    if ("function" != typeof generateImage)
        return (
            console.warn("[Image Queue] generateImage not available, using fallback"),
            ImageRequestQueue.getFallbackResponse(t, new Error("generateImage not available"))
        );
    gameState.pendingAIRequests || (gameState.pendingAIRequests = { text: [], image: [] });
    const a = Date.now() + Math.random(),
        o = { id: a, prompt: e, description: t, timestamp: Date.now() };
    gameState.pendingAIRequests.image.push(o),
        console.log(`[Image Queue] 💾 Auto-persisted: ${t} (${gameState.pendingAIRequests.image.length} pending)`),
        "function" == typeof saveGame && saveGame(!1).catch((e) => console.warn("[Image Queue] Save warning:", e));
    try {
        const o = await ImageRequestQueue.enqueue(() => generateImage(e, Object.keys(n).length ? n : void 0), t),
            i = gameState.pendingAIRequests.image.findIndex((e) => e.id === a);
        return (
            -1 !== i &&
                (gameState.pendingAIRequests.image.splice(i, 1),
                console.log(
                    `[Image Queue] ✅ Completed & removed: ${t} (${gameState.pendingAIRequests.image.length} remaining)`
                )),
            o
        );
    } catch (e) {
        console.error(`[Image Queue] Final fallback for ${t}:`, e);
        const n = gameState.pendingAIRequests.image.findIndex((e) => e.id === a);
        return (
            -1 !== n && gameState.pendingAIRequests.image.splice(n, 1), ImageRequestQueue.getFallbackResponse(t, e)
        );
    }
}
window.imageQueueDebug = {
    status: () => {
        const e = ImageRequestQueue.getStats(),
            t = ImageRequestQueue.getPendingCount();
        return (
            console.log("🔍 [Image Queue Status]"),
            console.log(`Active: ${e.active}, Queued: ${e.queued}, Max: ${e.maxConcurrent}`),
            console.log(`Total pending: ${e.totalWaiting}`),
            console.log(`💾 Persistent pending: ${t}`),
            e
        );
    },
    analyze: () => ImageRequestQueue.analyzeFailures(),
    clearFailures: () => ImageRequestQueue.clearFailureData(),
    getFailures: () => window.imageQueueFailures || [],
    setMax: (e) => {
        ImageRequestQueue.updateMaxConcurrent(e), console.log(`✅ Max concurrent image requests set to ${e}`);
    },
    getPending: () => gameState.pendingAIRequests?.image || [],
    clearPending: () => {
        const e = gameState.pendingAIRequests?.image?.length || 0;
        return (
            gameState.pendingAIRequests && (gameState.pendingAIRequests.image = []),
            console.log(`🗑️ Cleared ${e} persistent pending image requests`),
            e
        );
    },
    setTotalGenerated: (e) => (
        gameState.generationStats ||
            (gameState.generationStats = { totalTextGenerations: 0, totalImageGenerations: 0 }),
        (gameState.generationStats.totalImageGenerations = e),
        ImageRequestQueue.updateUI(),
        console.log(`✅ Set total image generations to ${e.toLocaleString()}`),
        e
    ),
    help: () => {
        console.log("🔧 [Image Queue Debug Commands]"),
            console.log("imageQueueDebug.status()       - Show current queue status"),
            console.log("imageQueueDebug.analyze()      - Analyze generation failures"),
            console.log("imageQueueDebug.setMax(8)      - Set max concurrent requests"),
            console.log("imageQueueDebug.clearFailures() - Clear failure tracking data"),
            console.log("imageQueueDebug.getFailures()  - Get raw failure data"),
            console.log("imageQueueDebug.getPending()   - Get persistent pending requests"),
            console.log("imageQueueDebug.clearPending() - Clear persistent pending requests"),
            console.log("imageQueueDebug.setTotalGenerated(1000) - Set total generated count"),
            console.log("imageQueueDebug.help()         - Show this help");
    },
};
