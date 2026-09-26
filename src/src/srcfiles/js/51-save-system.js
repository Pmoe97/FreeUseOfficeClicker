// ============================================================================
// 51-save-system — Save system: debounced save, SaveManager class, slots, snapshots, autosave, export/import, reset, prestige, initial employees.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

let isResetting = !1,
    saveDebounceTimer = null,
    savePending = !1;
const SAVE_DEBOUNCE_MS = 500;
// ─── Data-loss guards & boot diagnostics ────────────────────────────────────
// Background: a fresh open occasionally lands on a blank New Game even though a
// real save exists elsewhere. Root cause is almost certainly the live "autosave"
// slot read coming back empty/error on boot, the game silently keeping default
// state, and the 5s autosave timer then overwriting the real save with blanks.
// These flags + helpers make the next occurrence explainable AND make the
// overwrite structurally impossible.
let saveSystemReady = !1, // GUARD 1: no autosave may write until load is confirmed
    intentionalNewGame = !1, // true only when a blank state is a legitimate fresh start
    loadFailedNoOverwrite = !1, // GUARD 3: a failed/suspicious read must never be overwritten
    sessionBackupDone = !1; // GUARD 5: prior-session backup taken once per boot
const BOOT_T0 = Date.now();
function bootLog(e, t) {
    const n = ((Date.now() - BOOT_T0) / 1e3).toFixed(2);
    void 0 !== t ? console.log(`[BOOT +${n}s] ${e}`, t) : console.log(`[BOOT +${n}s] ${e}`);
}
function gameStateSummary(e = gameState) {
    return {
        cash: e?.cash,
        employees: Array.isArray(e?.employees) ? e.employees.length : "n/a",
        locations: Array.isArray(e?.locations) ? e.locations.filter((e) => e.unlocked || e.owned).length : "n/a",
        totalEarnings: e?.totalEarnings,
        prestige: e?.prestigeLevel,
        playTime: e?.totalPlayTime,
    };
}
function estimateSize(e) {
    try {
        return JSON.stringify(e).length;
    } catch (e) {
        return -1;
    }
}
// GUARD 2: a default/frame-zero state that must never overwrite a real save.
// Requires ALL signals to read as untouched — any earnings, any employee, any
// prestige, or above-starting cash means it is NOT blank.
function looksLikeBlankState(e = gameState) {
    const t = !Array.isArray(e.employees) || 0 === e.employees.length,
        n = !(e.totalEarnings > 0) && !(e.lifetimeEarnings > 0) && !(e.currentLifetimeIncome > 0),
        a = (e.cash || 0) <= (("object" == typeof gameBalance && gameBalance.startingCash) || 150),
        o = !(e.totalPlayTime > 0) && !(e.prestigeLevel > 0);
    return t && n && a && o;
}
// Read a slot with one retry. A clean empty result returns null (caller decides
// whether that is a genuine first run). A read that THROWS is retried, then
// propagated so loadGame's catch treats it as a failure (GUARD 3) — never as
// "no save", which would otherwise license an overwrite.
async function readSaveSlotResilient(e) {
    let t = 0,
        n = null;
    for (; t < 2; ) {
        try {
            const n = await kv.gameSave.get(e);
            if (n) return n;
            0 === t &&
                (bootLog(`Read returned empty for "${e}" — retrying once`),
                await new Promise((e) => setTimeout(e, 250)));
        } catch (a) {
            (n = a),
                bootLog(`Read THREW for "${e}" (attempt ${t + 1})`, String((a && a.message) || a)),
                await new Promise((e) => setTimeout(e, 250));
        }
        t++;
    }
    if (n) throw n;
    return null;
}
// List real save slots other than the live/backup slots. If we cannot even list,
// assume saves MIGHT exist (return non-empty) so we err toward NOT overwriting.
async function listOtherSaveSlots() {
    try {
        return (
            (await kv.gameSave.keys()) || []
        ).filter(
            (e) =>
                e.startsWith("fuoc_save_") && "fuoc_save_autosave" !== e && "fuoc_save_prevsession" !== e
        );
    } catch (e) {
        return (
            bootLog(`Could not list save slots (${String((e && e.message) || e)}) — treating as 'saves may exist'`),
            ["<unlistable>"]
        );
    }
}
// GUARD 5: belt-and-suspenders. The first time we successfully read the live save
// on boot, copy it to a single rolling "previous session" slot before anything
// can overwrite the live slot. One slot, not a history — accounted against the cap.
async function backupPreviousSession(e) {
    if (sessionBackupDone || !e) return;
    sessionBackupDone = !0;
    try {
        await kv.gameSave.set("fuoc_save_prevsession", {
            ...e,
            meta: {
                ...(e.meta || {}),
                saveName: "prevsession",
                saveType: "backup",
                backedUpAt: new Date().toISOString(),
            },
        }),
            bootLog("GUARD 5: prior session backed up → slot fuoc_save_prevsession");
    } catch (e) {
        bootLog(`GUARD 5: prev-session backup failed (non-fatal): ${String((e && e.message) || e)}`);
    }
}
// ────────────────────────────────────────────────────────────────────────────
function debouncedSave() {
    isResetting ||
        ((savePending = !0),
        saveDebounceTimer && clearTimeout(saveDebounceTimer),
        (saveDebounceTimer = setTimeout(() => {
            savePending && ((savePending = !1), saveGame(!1), console.log("[SaveManager] Debounced save executed"));
        }, SAVE_DEBOUNCE_MS)));
}
function flushPendingSave() {
    saveDebounceTimer && (clearTimeout(saveDebounceTimer), (saveDebounceTimer = null)),
        savePending && ((savePending = !1), saveGame(!1), console.log("[SaveManager] Pending save flushed"));
}
// force: a save the player asked for (the Save button) or one a big transition can't lose
// (prestige). Everything else is an automatic save and is skipped while the player has
// turned Autosave off in Settings.
async function saveGame(e = !0, force = !1) {
    if (!force && !1 === gameState.settings?.autosave) return;
    if (!isResetting)
        try {
            await saveGameToSlot("autosave", "auto", e);
        } catch (t) {
            console.error("Error saving game:", t), e && showNotification("Failed to save game!", "error");
        }
}
let saveInProgress = !1,
    lastSaveTime = 0;
const MIN_SAVE_INTERVAL = 500;
async function saveGameToSlot(e, t = "manual", n = !0) {
    if (isResetting) return null;
    // GUARD 1 + GUARD 2: auto-saves (timer + event-driven) are the only path that can
    // overwrite the live "autosave" slot during/after boot. Block them until the
    // initial load is confirmed, and refuse to persist a blank/default state over a
    // real save. Manual / save-manager writes (other types, other slots) are unaffected.
    if ("auto" === t) {
        if (!saveSystemReady)
            return bootLog(`Autosave BLOCKED → slot "${e}" (save system not ready — load not yet confirmed)`), null;
        if (looksLikeBlankState() && !intentionalNewGame)
            return (
                console.warn(`[SaveManager] ⚠ REFUSED blank autosave → slot "${e}"`, gameStateSummary()), null
            );
    }
    const a = Date.now();
    if (saveInProgress) {
        if ("auto" === t) return console.log("[SaveManager] Skipping auto-save (save already in progress)"), null;
        for (; saveInProgress; ) await new Promise((e) => setTimeout(e, 50));
    }
    if ("auto" === t && a - lastSaveTime < MIN_SAVE_INTERVAL)
        return console.log("[SaveManager] Throttling auto-save (too soon since last save)"), null;
    (saveInProgress = !0), (lastSaveTime = a);
    try {
        const a = gameState.totalPlayTime || 0,
            o = {
                version: "250116200000",
                meta: {
                    saveDate: new Date().toISOString(),
                    saveName: e,
                    saveType: t,
                    playTime: a,
                    gameDay: gameState.time?.day || 0,
                    gameTime: gameState.time?.currentTime || Date.now(),
                    money: gameState.cash || 0,
                    employees: gameState.employees?.length || 0,
                    prestigeLevel: gameState.prestigeLevel || 0,
                },
                // A shallow copy, so the fields below can be left out of the save without
                // touching the live game. The open chat would otherwise be saved as a second
                // full copy of that employee; the tick counters used to be deleted from the
                // live state on every 5 s autosave, which meant the 30–60 s story, dynamic-event
                // and group-idle ticks never fired.
                gameState: { ...gameState, activeChat: null },
            },
            i = [];
        try {
            const e = o.gameState,
                t = CAPS.CHAT_MESSAGES_SAVE;
            if (
                (e.employees &&
                    Array.isArray(e.employees) &&
                    e.employees.forEach((e) => {
                        e.chatHistory && e.chatHistory.length > t && (e.chatHistory = e.chatHistory.slice(-t)),
                            e.conversationArchive &&
                                e.conversationArchive.length > CAPS.CONVERSATION_ARCHIVE &&
                                (e.conversationArchive = e.conversationArchive.slice(-CAPS.CONVERSATION_ARCHIVE));
                    }),
                e.socialNetwork?.posts)
            ) {
                const t = e.socialNetwork.posts
                    .map((e, t) => ({ idx: t, id: e.id, hasImg: !!e.imageUrl }))
                    .filter((e) => e.hasImg);
                if (t.length > CAPS.SOCIAL_POST_IMAGES_KEEP) {
                    t.slice(CAPS.SOCIAL_POST_IMAGES_KEEP).forEach((t) => {
                        i.push({ id: t.id, url: e.socialNetwork.posts[t.idx].imageUrl }),
                            (e.socialNetwork.posts[t.idx].imageUrl = null);
                    });
                }
            }
            if (
                (salvagePrunedPostImages(),
                e.socialNetwork?.posts &&
                    e.socialNetwork.posts.length > CAPS.SOCIAL_POSTS &&
                    (e.socialNetwork.posts = e.socialNetwork.posts.slice(0, CAPS.SOCIAL_POSTS)),
                e.socialNetwork?.algorithm &&
                    !e.socialNetwork.algorithm._foryouDefault &&
                    ((e.socialNetwork.algorithm._foryouDefault = !0),
                    "hot" === e.socialNetwork.algorithm.sort && (e.socialNetwork.algorithm.sort = "foryou")),
                "function" == typeof enforceSocialCommentCaps && enforceSocialCommentCaps(e.socialNetwork),
                e.socialNetwork?.stories)
            ) {
                const t = Date.now();
                e.socialNetwork.stories = e.socialNetwork.stories.filter(
                    (e) => t - e.createdAt < CAPS.STORY_EXPIRY_MS
                );
            }
            e.dynamicEvents?.eventMemories &&
                e.dynamicEvents.eventMemories.length > CAPS.EVENT_MEMORIES_GLOBAL &&
                (e.dynamicEvents.eventMemories = e.dynamicEvents.eventMemories.slice(-CAPS.EVENT_MEMORIES_GLOBAL)),
                e.pendingAIRequests?.text?.length &&
                    (e.pendingAIRequests.text = e.pendingAIRequests.text.map((e) => ({
                        ...e,
                        options: e.options
                            ? Object.fromEntries(
                                  Object.entries(e.options).filter(([, e]) => "function" != typeof e)
                              )
                            : {},
                    }))),
                delete e._storyPeriodicCounter,
                delete e._dynamicEventCounter,
                delete e._groupIdleConvCounter,
                delete e._cashCacheCounter;
        } catch (e) {
            console.warn("[SaveManager] Pre-save trimming error (non-fatal):", e);
        }
        // Images go to the shared image store (54-image-store.js); the save keeps a short
        // reference to each. Nothing awaits between this and the kv write below.
        try {
            o.gameState = await externalizeImagesForSave(o.gameState);
        } catch (e) {
            console.warn("[ImageStore] Couldn't store images separately — saving them inline:", e);
        }
        (o.meta.bytes = estimateSize(o)), // stamp serialized size for manifest + size logging
            "auto" === t &&
                bootLog(`Autosave WRITE → slot "${e}" (${o.meta.bytes} bytes)`, gameStateSummary());
        if (
            (await kv.gameSave.set(`fuoc_save_${e}`, o),
            i.length > 0 &&
                i.forEach(({ id: e, url: t }) => {
                    const n = gameState.socialNetwork?.posts?.find((t) => t.id === e);
                    n && (n.imageUrl = t);
                }),
            console.log(`[SaveManager] Saved to slot: ${e} (type: ${t})`),
            n)
        ) {
            let t;
            (t = /^autosave_\d+$/.test(e)
                ? "📸 Autosave snapshot saved"
                : "autosave" === e
                  ? "💾 Autosaved"
                  : /^quick_/.test(e)
                    ? "⚡ Quick save created"
                    : `✅ Game saved: ${e}`),
                showNotification(t);
        }
        return (saveInProgress = !1), o;
    } catch (a) {
        if (
            (console.error(`[SaveManager] Error saving to slot ${e}:`, a),
            "QuotaExceededError" === a.name || a.message?.includes("QuotaExceededError"))
        )
            console.error("[SaveManager] Storage quota exceeded!"),
                n && showNotification("💾 Storage full! Clear old saves in Save Manager.", "error", 8e3);
        else if (a.message?.includes("can't access property") || a.message?.includes("tracking is undefined")) {
            console.error("[SaveManager] Autosave tracking error, reinitializing..."),
                gameState.autosaveTracking ||
                    ((gameState.autosaveTracking = {
                        lastSnapshotTime: Date.now(),
                        currentSlotIndex: 0,
                        snapshotIntervalMinutes: 5,
                    }),
                    console.log("[SaveManager] Reinitialized autosave tracking")),
                n && showNotification("💾 Save system recovered. Trying again...", "info", 4e3);
            try {
                // Rebuild the payload here — the original `o` is block-scoped to the try above.
                const r = {
                    version: "250116200000",
                    meta: {
                        saveDate: new Date().toISOString(),
                        saveName: e,
                        saveType: t,
                        playTime: gameState.totalPlayTime || 0,
                        gameDay: gameState.time?.day || 0,
                        gameTime: gameState.time?.currentTime || Date.now(),
                        money: gameState.cash || 0,
                        employees: gameState.employees?.length || 0,
                        prestigeLevel: gameState.prestigeLevel || 0,
                    },
                    gameState: gameState,
                };
                if ((await kv.gameSave.set(`fuoc_save_${e}`, r), n)) {
                    showNotification(
                        `${"auto" === t ? "💾" : "quick" === t ? "⚡" : "✅"} Game saved to: ${e} (recovered)`,
                        "success"
                    );
                }
                return (saveInProgress = !1), r;
            } catch (e) {
                console.error("[SaveManager] Retry failed:", e),
                    n && showNotification("❌ Save failed even after recovery!", "error");
            }
        } else n && showNotification("❌ Failed to save game!", "error");
        throw ((saveInProgress = !1), a);
    }
}
async function loadGameFromSlot(e) {
    try {
        console.log(`[SaveManager] Loading from slot: ${e}`);
        const t = await kv.gameSave.get(`fuoc_save_${e}`);
        t?.gameState && (await internalizeImages(t.gameState)); // references → images
        return t
            ? t.gameState
                ? (await loadSaveData(t.gameState),
                  // Loading a named save makes it the one you're playing; an autosave, snapshot
                  // or quick save belongs to whichever save it was taken from.
                  (gameState.currentSaveSlot = "manual" === t.meta?.saveType ? e : t.gameState.currentSaveSlot || null),
                  console.log(`[SaveManager] Successfully loaded from slot: ${e}`),
                  showNotification(`✅ Loaded save: ${e}`, "success"),
                  !0)
                : (console.error(`[SaveManager] Invalid save structure in slot: ${e}`),
                  showNotification("❌ Corrupted save file!", "error"),
                  !1)
            : (console.warn(`[SaveManager] No save found in slot: ${e}`),
              showNotification(`❌ Save slot "${e}" not found!`, "error"),
              !1);
    } catch (t) {
        return (
            console.error(`[SaveManager] Error loading from slot ${e}:`, t),
            showNotification("❌ Failed to load save!", "error"),
            !1
        );
    }
}
async function listAllSaves() {
    try {
        const e = [],
            t = await kv.gameSave.keys();
        for (const n of t)
            if (n.startsWith("fuoc_save_")) {
                const t = n.replace("fuoc_save_", ""),
                    a = await kv.gameSave.get(n);
                a && a.meta && e.push({ slotName: t, ...a.meta, hasGameState: !!a.gameState });
            }
        return (
            e.sort((e, t) => new Date(t.saveDate) - new Date(e.saveDate)),
            console.log(`[SaveManager] Found ${e.length} save slots`),
            e
        );
    } catch (e) {
        return console.error("[SaveManager] Error listing saves:", e), [];
    }
}
async function deleteSaveSlot(e) {
    try {
        if ("autosave" === e || e.startsWith("autosave_"))
            return showNotification("❌ Cannot delete autosave slots!", "error"), !1;
        const t = `fuoc_save_${e}`;
        return (
            await kv.gameSave.delete(t),
            scheduleImageGc("save deleted"),
            console.log(`[SaveManager] Deleted slot: ${e}`),
            showNotification(`🗑️ Deleted save: ${e}`),
            !0
        );
    } catch (t) {
        return (
            console.error(`[SaveManager] Error deleting slot ${e}:`, t),
            showNotification("❌ Failed to delete save!", "error"),
            !1
        );
    }
}
async function renameSaveSlot(e, t) {
    try {
        if ("autosave" === e || e.startsWith("autosave_") || "autosave" === t || t.startsWith("autosave_"))
            return showNotification("❌ Cannot rename autosave slots!", "error"), !1;
        if ((await kv.gameSave.keys()).includes(`fuoc_save_${t}`))
            return showNotification("❌ Save name already exists!", "error"), !1;
        const n = await kv.gameSave.get(`fuoc_save_${e}`);
        return n
            ? ((n.meta.saveName = t),
              await kv.gameSave.set(`fuoc_save_${t}`, n),
              await kv.gameSave.delete(`fuoc_save_${e}`),
              console.log(`[SaveManager] Renamed slot: ${e} → ${t}`),
              showNotification(`✏️ Renamed save to: ${t}`),
              !0)
            : (showNotification("❌ Original save not found!", "error"), !1);
    } catch (t) {
        return (
            console.error(`[SaveManager] Error renaming slot ${e}:`, t),
            showNotification("❌ Failed to rename save!", "error"),
            !1
        );
    }
}
// Blob-safe save serialization. A plain JSON.stringify(fullSave) can throw
// "RangeError: Invalid string length" once a save has accumulated enough employees/
// chat/gallery data to exceed the JS engine's max string length. Blob() accepts an
// array of parts and concatenates them natively, so chunking the known-large
// containers (employees, chatHistory, social posts) element-by-element means no
// single JSON.stringify call ever has to hold more than one item's worth of data —
// the resulting parts array is safe to pass straight to `new Blob(parts)`.
// JSON has no Set/Map: without this, usedEmployeeNames / blockedProactiveMessages exported
// as {} and the name-uniqueness history was lost on import. The loaders turn these arrays
// and objects back into a Set/Map.
function saveJsonReplacer(k, v) {
    return v instanceof Set ? [...v] : v instanceof Map ? Object.fromEntries(v) : v;
}
function chunkObjectParts(obj, arrayKeys, mapKeys) {
    const parts = ["{"],
        keys = Object.keys(obj);
    keys.forEach((k, idx) => {
        parts.push(JSON.stringify(k) + ":");
        const v = obj[k];
        if (arrayKeys.includes(k) && Array.isArray(v)) {
            parts.push("[");
            v.forEach((item, i) => {
                parts.push(JSON.stringify(item, saveJsonReplacer)), i < v.length - 1 && parts.push(",");
            }),
                parts.push("]");
        } else if (mapKeys.includes(k) && v && "object" == typeof v && !Array.isArray(v)) {
            const mk = Object.keys(v);
            parts.push("{"),
                mk.forEach((id, i) => {
                    parts.push(JSON.stringify(id) + ":" + JSON.stringify(v[id], saveJsonReplacer)), i < mk.length - 1 && parts.push(",");
                }),
                parts.push("}");
        } else if ("socialNetwork" === k && v && "object" == typeof v) {
            parts.push(...chunkObjectParts(v, ["posts"], []));
        } else parts.push(JSON.stringify(v, saveJsonReplacer));
        idx < keys.length - 1 && parts.push(",");
    }),
        parts.push("}");
    return parts;
}
function buildSaveBlobParts(payload) {
    const parts = ["{"],
        keys = Object.keys(payload);
    keys.forEach((k, idx) => {
        parts.push(JSON.stringify(k) + ":"),
            "gameState" === k && payload[k] && "object" == typeof payload[k]
                ? parts.push(
                      ...chunkObjectParts(payload[k], ["employees", "formerEmployees", "groups"], ["chatHistory"])
                  )
                : parts.push(JSON.stringify(payload[k], saveJsonReplacer)),
            idx < keys.length - 1 && parts.push(",");
    }),
        parts.push("}");
    return parts;
}
async function exportSaveSlot(e) {
    try {
        const t = await kv.gameSave.get(`fuoc_save_${e}`);
        if (!t) return void showNotification(`❌ Save slot "${e}" not found!`, "error");
        await internalizeImages(t.gameState || t); // an exported file carries its images
        const n = buildSaveBlobParts(t),
            a = new Blob(n, { type: "application/json" }),
            o = URL.createObjectURL(a),
            i = `FUOC-${e}-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`,
            s = document.createElement("a");
        (s.href = o),
            (s.download = i),
            document.body.appendChild(s),
            s.click(),
            document.body.removeChild(s),
            URL.revokeObjectURL(o),
            console.log(`[SaveManager] Exported slot: ${e}`),
            showNotification(`📤 Exported: ${i}`, "success");
    } catch (t) {
        console.error(`[SaveManager] Error exporting slot ${e}:`, t),
            showNotification("❌ Failed to export save!", "error");
    }
}
async function importSaveToSlot(e, t = null) {
    try {
        if (!e.gameState) throw new Error("Invalid save file structure");
        const n = t || `imported_${Date.now()}`;
        if ((await kv.gameSave.keys()).includes(`fuoc_save_${n}`)) throw new Error("Target slot already exists");
        return (
            e.meta || (e.meta = {}),
            (e.meta.saveName = n),
            (e.meta.saveType = "manual"),
            (e.meta.importedAt = new Date().toISOString()),
            (e.gameState = await externalizeImagesForSave(e.gameState)),
            await kv.gameSave.set(`fuoc_save_${n}`, e),
            console.log(`[SaveManager] Imported to slot: ${n}`),
            showNotification(`📥 Imported save: ${n}`, "success"),
            !0
        );
    } catch (e) {
        return (
            console.error("[SaveManager] Error importing save:", e),
            showNotification(`❌ Import failed: ${e.message}`, "error"),
            !1
        );
    }
}
// ── Single-Character Export / Import ───────────────────────────────────
// Serializes one character to a file and imports it into any save via the
// custom-employee confirmation flow. The REQUIRED skeleton (identity,
// personality, physical, stats, profile pic) always travels; OPTIONAL
// sections (gallery, social posts, conversation history, memories) are
// chosen per-export in openCharacterExportModal(). Save-specific state
// (ids, relationships, position binding) is always stripped.
function getEmployeeSocialPosts(employeeId) {
    const posts = (gameState.socialNetwork && gameState.socialNetwork.posts) || [];
    return posts.filter((p) => p.authorId === employeeId);
}
// How much optional data each section holds, for the export modal's labels.
function gatherExportCounts(emp) {
    const archiveMsgs = (emp.conversationArchive || []).reduce((a, c) => a + ((c.messages || []).length), 0);
    return {
        photos: (emp.photos || []).length,
        posts: getEmployeeSocialPosts(emp.id).length,
        messages: ((gameState.chatHistory && gameState.chatHistory[emp.id]) || []).length + archiveMsgs,
        memories: ((emp.memory && emp.memory.items) || []).length,
    };
}
function buildCharacterExport(employeeId, options = {}) {
    const emp = gameState.employees.find((x) => x.id === employeeId);
    if (!emp) return null;
    const src = JSON.parse(JSON.stringify(emp));
    // REQUIRED skeleton — always included.
    const character = {
        name: src.name,
        firstName: src.firstName || null,
        lastName: src.lastName || null,
        age: src.age,
        gender: src.gender,
        race: src.race,
        ethnicity: src.ethnicity || null,
        customRace: src.customRace || null,
        bio: src.bio || "",
        personality: src.personality || {},
        personalityTraits: src.personalityTraits || [],
        keyTrait: src.keyTrait || null,
        hobbies: src.hobbies || [],
        kinks: src.kinks || [],
        voice: src.voice || null,
        physical: src.physical || {},
        stats: src.stats || {},
        personalLife: src.personalLife || null,
        nicknameForPlayer: src.nicknameForPlayer || null,
        chatSettings: src.chatSettings || null,
        chatCommMode: src.chatCommMode || null,
        career: src.career ? { level: src.career.level || 1, salary: src.career.salary } : null,
        schedule: src.schedule
            ? {
                  workDays: src.schedule.workDays,
                  workStartHour: src.schedule.workStartHour,
                  workEndHour: src.schedule.workEndHour,
                  shiftType: src.schedule.shiftType,
                  ptoBalance: src.schedule.ptoBalance,
              }
            : null,
        social: src.social && src.social.username ? { username: src.social.username } : null,
        profileImage: src.profileImage || null,
    };
    // Drop derived description strings — rebuilt on import via syncPhysicalDescriptions
    if (character.physical && typeof character.physical === "object") {
        delete character.physical.fullDescription;
        delete character.physical.shortDescription;
    }
    // OPTIONAL sections (per-export checkboxes).
    const included = { gallery: !1, social: !1, conversations: !1, memories: !1 };
    if (options.gallery && Array.isArray(src.photos) && src.photos.length) {
        character.photos = src.photos;
        included.gallery = !0;
    }
    if (options.social) {
        const posts = getEmployeeSocialPosts(employeeId).map((p) => ({
            type: p.type || "status",
            content: p.content || "",
            imageUrl: p.imageUrl || null,
            imagePrompt: p.imagePrompt || null,
            altText: p.altText || null,
            mood: p.mood || null,
            tags: p.tags || [],
            explicitLevel: p.explicitLevel || 0,
            poll: p.poll || null,
            timestamp: p.timestamp,
        }));
        if (posts.length) {
            character._socialPosts = posts;
            included.social = !0;
        }
    }
    if (options.conversations) {
        const live = (gameState.chatHistory && gameState.chatHistory[employeeId]) || [];
        if (live.length) character._chatHistory = JSON.parse(JSON.stringify(live));
        if (Array.isArray(src.conversationArchive) && src.conversationArchive.length)
            character.conversationArchive = src.conversationArchive;
        included.conversations = !!(character._chatHistory || character.conversationArchive);
    }
    if (options.memories && src.memory && (src.memory.items || []).length) {
        character.memory = src.memory;
        included.memories = !0;
    }
    return {
        fuocCharacterExport: !0,
        version: "250116200000",
        exportedAt: new Date().toISOString(),
        included: included,
        character: character,
    };
}
function exportCharacterToFile(employeeId, options = {}) {
    try {
        const wrapper = buildCharacterExport(employeeId, options);
        if (!wrapper) return void showNotification("❌ Character not found!", "error");
        const json = JSON.stringify(wrapper, null, 2),
            blob = new Blob([json], { type: "application/json" }),
            url = URL.createObjectURL(blob),
            safe = (wrapper.character.name || "character").replace(/[^a-z0-9]+/gi, "_").slice(0, 40),
            fname = `FUOC-character-${safe}-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`,
            a = document.createElement("a");
        (a.href = url),
            (a.download = fname),
            document.body.appendChild(a),
            a.click(),
            document.body.removeChild(a),
            URL.revokeObjectURL(url);
        const extras = Object.entries(wrapper.included)
            .filter(([, v]) => v)
            .map(([k]) => k);
        console.log(`[Character Export] Exported ${wrapper.character.name} (extras: ${extras.join(", ") || "none"})`);
        return { wrapper: wrapper, filename: fname };
    } catch (err) {
        console.error("[Character Export] Error:", err),
            showNotification("❌ Failed to export character!", "error");
        return null;
    }
}
// n + correctly-pluralized noun ("1 photo" / "3 photos" / custom plural for memory→memories)
function plCount(n, singular, plural) {
    return `${n} ${1 === n ? singular : plural || singular + "s"}`;
}
// Shared completion-summary modal for export/import. rows:[{icon,text}], notes:[{title,text}].
function showCharacterSummaryModal(opts) {
    const overlay = document.createElement("div");
    overlay.style.cssText =
        "position:fixed; inset:0; background:var(--l-veil-85); z-index:10003; display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box;";
    const rowsHtml = (opts.rows || [])
        .map(
            (r) =>
                `<div style="display:flex; gap:10px; align-items:center; padding:9px 11px; background:var(--bg); border-radius:8px; margin-bottom:6px;"><span style="font-size:1.05rem; flex-shrink:0;">${r.icon}</span><span style="color:var(--l-ink); font-size:0.92rem;">${r.text}</span></div>`
        )
        .join("");
    const notesHtml = (opts.notes || [])
        .map(
            (n) =>
                `<div style="display:flex; gap:8px; padding:10px 12px; background:rgba(255,193,7,0.08); border:1px solid rgba(255,193,7,0.25); border-radius:8px; margin-top:10px;"><span style="flex-shrink:0;">ⓘ</span><span style="color:var(--text-dim); font-size:0.82rem; line-height:1.5;"><strong style="color:var(--l-x-orange-2);">${n.title}</strong> ${n.text}</span></div>`
        )
        .join("");
    overlay.innerHTML = `
      <div style="background:var(--surface); border:1px solid var(--border); border-radius:16px; max-width:480px; width:100%; max-height:90vh; overflow:auto; box-shadow:0 20px 60px var(--l-veil-50);">
        <div style="padding:18px 20px; border-bottom:1px solid var(--border);">
          <h2 style="margin:0; color:${opts.accent || "var(--positive)"}; font-size:1.15rem;">${opts.title}</h2>
        </div>
        <div style="padding:18px 20px;">
          ${rowsHtml}${notesHtml}
          ${opts.footnote ? `<p style="color:var(--text-mute); font-size:0.78rem; margin:12px 0 0 0; line-height:1.45;">${opts.footnote}</p>` : ""}
          <button class="char-summary-done" style="width:100%; margin-top:16px; padding:12px; background:linear-gradient(135deg, var(--l-green) 0%, var(--l-cyan) 100%); border:none; border-radius:8px; color:var(--l-on-accent); font-weight:700; cursor:pointer;">Done</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector(".char-summary-done")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
        e.target === overlay && close();
    });
}
function showCharacterExportSummary(wrapper, filename) {
    const c = wrapper.character,
        inc = wrapper.included || {};
    const archiveMsgs = (c.conversationArchive || []).reduce((a, x) => a + ((x.messages || []).length), 0);
    const rows = [{ icon: "✅", text: "Core character — identity, personality, appearance, stats &amp; profile picture" }];
    if (inc.gallery) rows.push({ icon: "🖼️", text: plCount((c.photos || []).length, "gallery image") });
    if (inc.social) rows.push({ icon: "📱", text: plCount((c._socialPosts || []).length, "social post") });
    if (inc.conversations)
        rows.push({ icon: "💬", text: plCount((c._chatHistory || []).length + archiveMsgs, "chat message") });
    if (inc.memories)
        rows.push({ icon: "🧠", text: plCount((c.memory?.items || []).length, "learned memory", "learned memories") });
    showCharacterSummaryModal({
        title: `📤 ${c.name} exported`,
        accent: "var(--l-violet)",
        rows: rows,
        footnote: `Saved as <strong style="color:var(--l-ink);">${filename}</strong> to your downloads. Import it from <strong style="color:var(--l-ink);">Hire → ✨ Custom Employee → 📥 Import Character</strong> in any save.`,
    });
}
// Export options modal — Required items shown locked; optional sections opt-in with
// small informative (non-alarming) notes about size / cross-save quirks.
function openCharacterExportModal(employeeId) {
    const emp = gameState.employees.find((x) => x.id === employeeId);
    if (!emp) return void showNotification("❌ Character not found!", "error");
    const c = gatherExportCounts(emp);
    const optRow = (key, icon, title, count, unit, note, disabledNote) => {
        const has = count > 0;
        return `
        <label style="display:flex; gap:10px; align-items:flex-start; padding:10px 12px; background:var(--bg); border:1px solid var(--border-strong); border-radius:8px; margin-bottom:8px; cursor:${has ? "pointer" : "default"}; opacity:${has ? "1" : "0.55"};">
          <input type="checkbox" data-exp-opt="${key}" ${has ? "" : "disabled"} style="margin-top:3px; flex-shrink:0; width:16px; height:16px; cursor:${has ? "pointer" : "default"};">
          <span style="flex:1;">
            <span style="color:var(--l-ink); font-weight:600;">${icon} ${title}</span>
            <span style="color:var(--text-mute); font-weight:500;"> · ${has ? `${count} ${unit}${1 === count ? "" : "s"}` : "none yet"}</span>
            <span style="display:block; color:var(--text-mute); font-size:0.78rem; margin-top:3px; line-height:1.4;">${has ? note : disabledNote || "Nothing to include for this character yet."}</span>
          </span>
        </label>`;
    };
    const reqRow = (icon, title) => `
        <label style="display:flex; gap:10px; align-items:center; padding:9px 12px; background:rgba(78,204,163,0.08); border:1px solid rgba(78,204,163,0.3); border-radius:8px; margin-bottom:8px;">
          <input type="checkbox" checked disabled style="flex-shrink:0; width:16px; height:16px;">
          <span style="color:var(--l-ink); font-weight:600;">${icon} ${title}</span>
          <span style="margin-left:auto; color:var(--positive); font-size:0.72rem; font-weight:700; letter-spacing:0.5px;">REQUIRED</span>
        </label>`;
    const overlay = document.createElement("div");
    overlay.id = "charExportModal";
    overlay.style.cssText =
        "position:fixed; inset:0; background:var(--l-veil-85); z-index:10002; display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box;";
    overlay.innerHTML = `
      <div style="background:var(--surface); border:1px solid var(--border); border-radius:16px; max-width:560px; width:100%; max-height:90vh; overflow:auto; box-shadow:0 20px 60px var(--l-veil-50);">
        <div style="padding:18px 20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
          <h2 style="margin:0; color:var(--l-violet); font-size:1.2rem;">📤 Export ${emp.name}</h2>
          <button id="charExportClose" style="background:none; border:none; color:var(--text-mute); font-size:24px; cursor:pointer; line-height:1;">&times;</button>
        </div>
        <div style="padding:18px 20px;">
          <p style="color:var(--text-dim); margin:0 0 14px 0; font-size:0.9rem;">Choose what travels with this character. The core is always included so they arrive intact; the rest is up to you.</p>
          <div style="margin-bottom:6px; color:var(--text-mute); font-size:0.75rem; font-weight:700; letter-spacing:0.5px;">ALWAYS INCLUDED</div>
          ${reqRow("👤", "Identity, personality & bio")}
          ${reqRow("🎨", "Physical appearance")}
          ${reqRow("❤️", "Relationship stats &amp; profile picture")}
          <div style="margin:14px 0 6px 0; color:var(--text-mute); font-size:0.75rem; font-weight:700; letter-spacing:0.5px;">OPTIONAL — bring more of their history</div>
          ${optRow("gallery", "🖼️", "Full image gallery", c.photos, "photo", "Every saved picture, not just the profile shot. Makes the file bigger — sometimes several MB.", "")}
          ${optRow("social", "📱", "Social posts", c.posts, "post", "Their past posts drop into your new feed. Likes &amp; comments from old coworkers don't come along.", "")}
          ${optRow("conversations", "💬", "Conversation history", c.messages, "message", "Your full chat log with them. Can be large; mentions of old coworkers or events may not line up in the new save.", "")}
          ${optRow("memories", "🧠", "Learned memories", c.memories, "memory", "What they remember about you, so they feel continuous. May reference people or moments from the old save.", "")}
          <div style="display:flex; gap:10px; margin-top:18px;">
            <button id="charExportConfirm" style="flex:1; padding:12px; background:linear-gradient(135deg, var(--l-violet) 0%, var(--l-violet-deep-2) 100%); border:none; border-radius:8px; color:var(--l-on-accent); font-weight:700; cursor:pointer; font-size:0.95rem;">📤 Export Character</button>
            <button id="charExportCancel" style="flex:0 0 auto; padding:12px 20px; background:var(--l-neutral-3); border:1px solid var(--border-strong); border-radius:8px; color:var(--text-dim); cursor:pointer;">Cancel</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector("#charExportClose")?.addEventListener("click", close);
    overlay.querySelector("#charExportCancel")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
        e.target === overlay && close();
    });
    overlay.querySelector("#charExportConfirm")?.addEventListener("click", () => {
        const options = {};
        overlay.querySelectorAll("[data-exp-opt]").forEach((cb) => {
            options[cb.getAttribute("data-exp-opt")] = cb.checked;
        });
        const result = exportCharacterToFile(employeeId, options);
        close();
        if (result) showCharacterExportSummary(result.wrapper, result.filename);
    });
}
function importCharacterFromFile(productId = null) {
    const input = document.getElementById("importCharacterFileInput");
    if (!input) return void showNotification("❌ Import system not available!", "error");
    input.onchange = (ev) => {
        const file = ev.target.files[0];
        if (file) {
            const reader = new FileReader();
            (reader.onload = (re) => {
                try {
                    const parsed = JSON.parse(re.target.result);
                    if (parsed && parsed.gameState)
                        return void showNotification(
                            "❌ That's a full save file. Use the Save Manager to load it.",
                            "error",
                            5e3
                        );
                    if (!parsed || !parsed.fuocCharacterExport || !parsed.character)
                        return void showNotification("❌ Not a valid character file!", "error");
                    prepareImportedCharacter(parsed.character, productId);
                } catch (err) {
                    console.error("[Character Import] Error:", err),
                        showNotification("❌ Failed to read character file!", "error");
                }
                ev.target.value = "";
            }),
                (reader.onerror = () => showNotification("❌ Failed to read file!", "error")),
                reader.readAsText(file);
        }
    };
    input.click();
}
function prepareImportedCharacter(rawChar, productId = null) {
    try {
        const char = JSON.parse(JSON.stringify(rawChar));
        // Note which modern fields the file was missing (older export) BEFORE the chain fills
        // them — surfaced in the import summary so the player knows what got reconstructed.
        const autofilled = [];
        const rp = rawChar.personality;
        if (!rp || "object" != typeof rp || 0 === Object.keys(rp).length) autofilled.push("personality profile");
        else if (!rp.axes) autofilled.push("personality axes");
        if (!rawChar.stats || "object" != typeof rawChar.stats) autofilled.push("relationship stats");
        const rph = rawChar.physical;
        if (!rph || "object" != typeof rph || (!rph.hair && !rph.hairColor && !rph.eyes && !rph.eyeColor))
            autofilled.push("appearance details");
        if (!rawChar.gender) autofilled.push("gender");
        // Defense in depth: strip save-specific state that must never ride along.
        // (memory / conversationArchive / photos / _chatHistory / _socialPosts are
        //  OPTIONAL export sections — kept here when present, restored by the overlay.)
        [
            "id",
            "hireDate",
            "relationships",
            "eventMemory",
            "unreadMessages",
            "interactions",
            "totalEarned",
            "bankBalance",
            "productId",
            "productManaged",
            "position",
            "locationId",
        ].forEach((k) => delete char[k]);
        char.social = char.social && char.social.username ? { username: char.social.username } : null;
        // Normalization / migration chain — upgrades old-schema exports to current shape
        if ("function" == typeof normalizeGender) char.gender = normalizeGender(char.gender);
        if (char.physical && "object" == typeof char.physical) {
            try {
                "function" == typeof normalizeGenitals && normalizeGenitals(char.physical);
            } catch (e) {}
        }
        "function" == typeof ensureEmployeePersonality && ensureEmployeePersonality(char);
        "function" == typeof ensureEmployeeStats && ensureEmployeeStats(char);
        "function" == typeof ensureEmployeeStateSurface && ensureEmployeeStateSurface(char);
        if (!char.personality?.axes && "function" == typeof derivePersonalityAxes) {
            try {
                (char.personality = char.personality || {}),
                    (char.personality.axes = derivePersonalityAxes(char)),
                    "function" == typeof syncFlatFiveFromAxes && syncFlatFiveFromAxes(char);
            } catch (e) {}
        }
        if (char.physical && "function" == typeof syncPhysicalDescriptions) {
            try {
                syncPhysicalDescriptions(char.physical, char.gender);
            } catch (e) {}
        }
        // Stash full skeleton for the hire-time overlay (preserves fields the form drops)
        pendingImportedSkeleton = JSON.parse(JSON.stringify(char));
        pendingImportedSkeleton.__autofilled = autofilled;
        // Surface the imported portrait in the confirmation modal + carry it to hire
        char.generatedProfileImage = char.profileImage || null;
        // The confirmation modal's gender dropdown uses legacy underscore tokens, but
        // normalizeGender() emits canonical camelCase — map back so futa/trans imports
        // don't silently fall through to the first option (female). (pendingImportedSkeleton
        // keeps canonical; finalizeCustomEmployee maps underscore→camelCase again on hire.)
        char.gender =
            { femaleFuta: "female_futa", transWoman: "trans_woman", transMan: "trans_man" }[char.gender] ||
            char.gender;
        const pid =
            productId ||
            gameState.currentHiringProductId ||
            gameState.products?.find((p) => !p.managerHired)?.id ||
            gameState.products?.[0]?.id;
        if (!pid) {
            pendingImportedSkeleton = null;
            return void showNotification("❌ No product available to assign the character to.", "error");
        }
        showCharacterConfirmationModal(char, pid, "Import");
    } catch (err) {
        console.error("[Character Import] Prepare failed:", err),
            showNotification("❌ Failed to import character!", "error"),
            (pendingImportedSkeleton = null);
    }
}
// Overlay the rich imported skeleton onto a freshly-finalized employee, restoring
// fields the custom-employee form doesn't capture (schedule, personalLife, voice,
// personality.freeform, social handle, and physical extras like raceFeatures/tattoos).
function applyImportedSkeletonOverlay(d, sk) {
    if (!d || !sk) return;
    if (sk.schedule) d.schedule = { ...(d.schedule || {}), ...sk.schedule };
    if (sk.personalLife) d.personalLife = { ...(sk.personalLife || {}), ...(d.personalLife || {}) };
    if (sk.voice) d.voice = { ...(d.voice || {}), ...sk.voice };
    if (sk.personality?.freeform && d.personality)
        d.personality.freeform = d.personality.freeform || sk.personality.freeform;
    if (sk.social?.username) {
        d.social = d.social || {};
        d.social.username = d.social.username || sk.social.username;
    }
    if (sk.chatSettings) d.chatSettings = d.chatSettings || sk.chatSettings;
    if (sk.chatCommMode) d.chatCommMode = d.chatCommMode || sk.chatCommMode;
    if (sk.nicknameForPlayer) d.nicknameForPlayer = d.nicknameForPlayer || sk.nicknameForPlayer;
    if (sk.physical && d.physical) {
        ["face", "raceFeatures", "ethnicityFeatures", "distinguishingFeatures", "piercings", "tattoos"].forEach(
            (k) => {
                const v = sk.physical[k];
                const empty = d.physical[k] == null || (Array.isArray(d.physical[k]) && 0 === d.physical[k].length);
                if (v != null && empty) d.physical[k] = JSON.parse(JSON.stringify(v));
            }
        );
        // Genitals (incl. grooming/characteristics) and accessories are always non-empty on
        // a freshly-created custom employee — the creation form rolls its own default for
        // both — so the empty-only restore above never fires for them and the imported
        // value gets silently dropped in favor of the form's default (reported as "grooming
        // reverts to waxed"). Import fidelity means keeping what was actually set, so always
        // prefer the imported value for these two when present.
        if (sk.physical.genitals != null) d.physical.genitals = JSON.parse(JSON.stringify(sk.physical.genitals));
        if (sk.physical.accessories != null) d.physical.accessories = sk.physical.accessories;
    }
    // Ethnicity lives on the employee, not under `physical`, and the overlay never restored
    // it — only fill it in if the confirmation form didn't already set it, so a deliberate
    // in-form choice isn't clobbered.
    if (sk.ethnicity && !d.ethnicity) d.ethnicity = sk.ethnicity;
    if (sk.customRace && !d.customRace) d.customRace = JSON.parse(JSON.stringify(sk.customRace));
    // ── Optional history payloads (only present if exported with those boxes ticked) ──
    const restored = [];
    try {
        // Gallery: merge imported photos into the new employee's gallery (dedupe by url)
        if (Array.isArray(sk.photos) && sk.photos.length) {
            d.photos = d.photos || [];
            const seen = new Set(d.photos.map((p) => p && p.url));
            sk.photos.forEach((p) => {
                if (p && p.url && !seen.has(p.url)) {
                    d.photos.push(JSON.parse(JSON.stringify(p)));
                    seen.add(p.url);
                }
            });
            restored.push("gallery");
        }
        // Learned memories
        if (sk.memory && (sk.memory.items || []).length) {
            d.memory = JSON.parse(JSON.stringify(sk.memory));
            "function" == typeof ensureEmployeeMemory && ensureEmployeeMemory(d);
            restored.push("memories");
        }
        // Conversation history: live DM log + archived conversations
        let convo = !1;
        if (Array.isArray(sk._chatHistory) && sk._chatHistory.length) {
            gameState.chatHistory = gameState.chatHistory || {};
            gameState.chatHistory[d.id] = JSON.parse(JSON.stringify(sk._chatHistory));
            d.unreadMessages = 0;
            convo = !0;
        }
        if (Array.isArray(sk.conversationArchive) && sk.conversationArchive.length) {
            d.conversationArchive = JSON.parse(JSON.stringify(sk.conversationArchive));
            convo = !0;
        }
        if (convo) restored.push("chat history");
        // Social posts: re-author into the new save's feed with fresh post ids
        if (Array.isArray(sk._socialPosts) && sk._socialPosts.length && gameState.socialNetwork) {
            gameState.socialNetwork.posts = gameState.socialNetwork.posts || [];
            "number" != typeof gameState.socialNetwork.postIdCounter &&
                (gameState.socialNetwork.postIdCounter = 0);
            sk._socialPosts.forEach((p) => {
                const ts = p.timestamp || Date.now();
                gameState.socialNetwork.posts.push({
                    id: `post_${++gameState.socialNetwork.postIdCounter}_${ts}`,
                    authorId: d.id,
                    authorName: d.name,
                    authorImage: d.profileImage || null,
                    type: p.type || "status",
                    content: p.content || "",
                    imageUrl: p.imageUrl || null,
                    imagePrompt: p.imagePrompt || null,
                    altText: p.altText || null,
                    mood: p.mood || null,
                    tags: p.tags || [],
                    referencedEmployees: [],
                    referencedEvent: null,
                    referencedChat: null,
                    explicitLevel: p.explicitLevel || 0,
                    isPlayerPost: !1,
                    poll: p.poll || null,
                    timestamp: ts,
                    likes: [],
                    dislikes: [],
                    comments: [],
                    views: 0,
                });
            });
            restored.push("posts");
        }
    } catch (err) {
        console.warn("[Import] optional payload restore failed:", err);
    }
    // Clean up transport-only fields so they don't linger on the employee record
    delete d._chatHistory;
    delete d._socialPosts;
    // Completion summary — what came over + anything reconstructed from an older export.
    const autofilled = (sk.__autofilled || []).filter(Boolean);
    if (restored.length || autofilled.length) {
        const rows = [{ icon: "✅", text: "Core character restored — identity, personality, appearance &amp; stats" }];
        if (restored.includes("gallery")) rows.push({ icon: "🖼️", text: plCount((sk.photos || []).length, "gallery image") });
        if (restored.includes("posts"))
            rows.push({ icon: "📱", text: plCount((sk._socialPosts || []).length, "social post") + " added to your feed" });
        if (restored.includes("chat history"))
            rows.push({ icon: "💬", text: plCount((sk._chatHistory || []).length, "chat message") + " restored" });
        if (restored.includes("memories"))
            rows.push({ icon: "🧠", text: plCount((sk.memory?.items || []).length, "learned memory", "learned memories") });
        const notes = autofilled.length
            ? [
                  {
                      title: "Auto-filled:",
                      text: `${autofilled.join(", ")} weren't in this file (it's from an older export), so they were generated from what was available — usually nothing you'd notice. The character still arrives complete.`,
                  },
              ]
            : [];
        showCharacterSummaryModal({ title: `✅ ${d.name} imported`, accent: "var(--positive)", rows: rows, notes: notes });
    }
    try {
        "function" == typeof syncPhysicalDescriptions && syncPhysicalDescriptions(d.physical, d.gender);
    } catch (e) {}
    try {
        "function" == typeof ensureEmployeeStateSurface && ensureEmployeeStateSurface(d);
    } catch (e) {}
}
async function migrateLegacySave() {
    try {
        const e = await kv.gameSave.get("gameState");
        if (!e) return void console.log("[SaveManager] No legacy save to migrate");
        // Only a save from before multi-slot saves has "gameState" and no autosave slot.
        // Save Manager loads used to write a copy of the loaded game here too; migrating
        // that copy overwrote the autosave, so every reload after a Save Manager load threw
        // away all the progress made since. With an autosave present it is that stale copy.
        if (await kv.gameSave.get("fuoc_save_autosave"))
            return void (await kv.gameSave.delete("gameState"), console.log("[SaveManager] Removed stale legacy \"gameState\" copy"));
        console.log("[SaveManager] Found legacy save, migrating...");
        const t = {
            version: "250116200000",
            meta: {
                saveDate: new Date().toISOString(),
                saveName: "migrated_legacy",
                saveType: "manual",
                playTime: 0,
                gameDay: e.time?.day || 0,
                money: e.cash || 0,
                employees: e.employees?.length || 0,
                prestigeLevel: e.prestigeLevel || 0,
                migratedFrom: "legacy_single_save",
            },
            gameState: e,
        };
        return (
            await kv.gameSave.set("fuoc_save_migrated_legacy", t),
            await kv.gameSave.set("fuoc_save_autosave", {
                ...t,
                meta: { ...t.meta, saveName: "autosave", saveType: "auto" },
            }),
            await kv.gameSave.delete("gameState"),
            console.log("[SaveManager] ✅ Legacy save migrated successfully and removed"),
            showNotification("✅ Save migrated to new system!", "success"),
            !0
        );
    } catch (e) {
        return console.error("[SaveManager] Migration error:", e), !1;
    }
}
// Save Manager display helpers for curated snapshots. Age is measured in gameplay
// time when the save carries a playTime stamp; legacy/older saves fall back to
// wall-clock so labels still read sensibly.
function saveAgeMs(e) {
    return "number" == typeof e.playTime && e.playTime > 0
        ? Math.max(0, (gameState.totalPlayTime || 0) - e.playTime)
        : Math.max(0, Date.now() - new Date(e.saveDate || Date.now()).getTime());
}
function formatAgo(e) {
    const t = Math.floor(e / 1e3);
    if (t < 60) return `${t}s ago`;
    const n = Math.floor(t / 60);
    if (n < 60) return `${n}m ago`;
    const a = e / 36e5;
    if (a < 24) return `${a < 10 ? a.toFixed(1) : Math.round(a)}h ago`;
    return `${Math.floor(a / 24)}d ago`;
}
// Tier bucket for grouping in the Autosaves tab. Order matters (newest→oldest).
const SAVE_TIER_BUCKETS = [
    { key: "min", label: "⚡ Last minute", maxAge: 6e4 },
    { key: "ten", label: "🕐 Last 10 minutes", maxAge: 6e5 },
    { key: "hour", label: "🕒 Last hour", maxAge: 36e5 },
    { key: "day", label: "📅 Last 24 hours", maxAge: 864e5 },
    { key: "older", label: "🗄️ Older", maxAge: 1 / 0 },
];
function saveTier(e) {
    const t = saveAgeMs(e);
    return SAVE_TIER_BUCKETS.find((e) => t <= e.maxAge) || SAVE_TIER_BUCKETS[SAVE_TIER_BUCKETS.length - 1];
}
// Save names double as slot keys (fuoc_save_<name>), so keep them short and free of
// characters that break the HTML attributes they end up in. The prefixes below belong to
// the automatic slots.
const RESERVED_SAVE_NAME = /^(autosave|quick_|prevsession$|gamestate$)/i;
function cleanSaveName(e) {
    return String(e || "")
        .replace(/[\u0000-\u001f"'<>\\`]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 60);
}
function defaultSaveName() {
    const e = gameState.playerProfile?.companyName || "My Company",
        t = new Date(gameNow());
    return cleanSaveName(`${e} – ${t.toLocaleDateString([], { month: "short", day: "numeric" })}`);
}
function smEsc(e) {
    return String(null == e ? "" : e).replace(/[&<>"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[e]);
}
// The in-game date a save was made at (meta.gameTime), for the list's "In-game" column.
// (It used to show meta.gameDay, which nothing ever set, so every save read "Day 0".)
function formatSaveGameTime(e) {
    return e.gameTime
        ? new Date(e.gameTime).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
        : "—";
}
class SaveManager {
    constructor() {
        (this.view = { tab: "manual", sortKey: "savedAt", sortDir: "desc", query: "", selectedId: null }),
            (this.modal = null),
            (this.editingNameId = null);
    }
    async show() {
        this.modal ||
            ((this.modal = this.buildHTML()), document.body.appendChild(this.modal), this.attachEventListeners()),
            await this.render();
        const e = this.modal.querySelector(".save-list-container");
        e && (e.scrollTop = 0), (this.modal.style.display = "flex");
        try {
            (document.body.dataset.smPrevOverflow = document.body.style.overflow || ""),
                (document.body.style.overflow = "hidden");
        } catch (e) {}
    }
    hide() {
        if (this.modal) {
            this.modal.style.display = "none";
            try {
                (document.body.style.overflow = document.body.dataset.smPrevOverflow || ""),
                    delete document.body.dataset.smPrevOverflow;
            } catch (e) {}
        }
    }
    buildHTML() {
        const e = document.createElement("div");
        return (
            (e.className = "save-manager-modal"),
            (e.innerHTML =
                '\n        <div class="save-manager-container">\n          \n          \x3c!-- Header --\x3e\n          <div class="save-manager-header">\n            <div class="save-manager-title">\n              <div class="save-manager-logo">💾</div>\n              <div>\n                <h2>Save Manager</h2>\n                <div class="save-manager-subtitle" id="sm-subtitle">Manage your game saves • Quick Save (F5) • Quick Load (F9)</div>\n              </div>\n            </div>\n            <button class="save-manager-close" id="sm-close">✕</button>\n          </div>\n\n          \x3c!-- Actions --\x3e\n          <div class="save-manager-actions">\n            <button class="sm-btn accent" id="sm-continue">▶ Continue</button>\n            <button class="sm-btn success" id="sm-save-current" style="display:none;">💾 Save</button>\n            <button class="sm-btn success" id="sm-quick-save">⏺ Quick Save</button>\n            <button class="sm-btn primary" id="sm-quick-load">⏮ Quick Load</button>\n            <button class="sm-btn" id="sm-export-all">📤 Export</button>\n            <button class="sm-btn" id="sm-import">📥 Import</button>\n            <input type="file" id="sm-import-file" accept=".json" style="display: none;">\n          </div>\n\n          \x3c!-- Toolbar --\x3e\n          <div class="save-manager-toolbar">\n            <div class="save-tab-group">\n              <button class="save-tab active" id="sm-tab-manual">Manual Saves</button>\n              <button class="save-tab" id="sm-tab-auto">Autosaves & Quick Saves</button>\n            </div>\n            <div class="save-search-box">\n              <span class="save-search-icon">🔍</span>\n              <input type="text" id="sm-search" placeholder="Search saves..." />\n            </div>\n          </div>\n\n          \x3c!-- Save List --\x3e\n          <div class="save-list-container">\n            <table class="save-table">\n              <thead>\n                <tr>\n                  <th class="sortable" data-sort="name">Name <span class="sort-arrow">▾</span></th>\n                  <th class="sortable" data-sort="day">In-game</th>\n                  <th class="sortable" data-sort="savedAt">Saved At <span class="sort-arrow">▾</span></th>\n                  <th>Money</th>\n                  <th>Employees</th>\n                  <th class="sortable" data-sort="playTime">Playtime</th>\n                  <th style="width: 260px;">Actions</th>\n                </tr>\n              </thead>\n              <tbody id="sm-tbody">\n                \x3c!-- Populated by render() --\x3e\n              </tbody>\n            </table>\n            \n            \x3c!-- Mobile Card Container --\x3e\n            <div class="save-card-container" id="sm-card-container">\n              \x3c!-- Populated by render() --\x3e\n            </div>\n          </div>\n\n          \x3c!-- Footer --\x3e\n          <div class="save-manager-footer">\n            <div class="save-footer-hint">\n              <span>Tips:</span>\n              <span><span class="kbd">F5</span> Quick Save</span>\n              <span><span class="kbd">F9</span> Quick Load</span>\n              <span><span class="kbd">Esc</span> Close</span>\n            </div>\n            <div class="save-count" id="sm-count">\n              Loading saves...\n            </div>\n          </div>\n          \n        </div>\n      '),
            e
        );
    }
    attachEventListeners() {
        const e = this.modal;
        e.querySelector("#sm-close").addEventListener("click", () => this.hide()),
            e.addEventListener("click", (t) => {
                t.target === e && this.hide();
            }),
            this._escHandler && document.removeEventListener("keydown", this._escHandler),
            (this._escHandler = (t) => {
                "Escape" === t.key && "flex" === e.style.display && this.hide();
            }),
            document.addEventListener("keydown", this._escHandler),
            e.querySelector("#sm-continue").addEventListener("click", () => this.handleContinue()),
            e.querySelector("#sm-save-current").addEventListener("click", () => {
                gameState.currentSaveSlot && this.handleOverwrite(gameState.currentSaveSlot);
            }),
            e.querySelector("#sm-quick-save").addEventListener("click", () => this.handleQuickSave()),
            e.querySelector("#sm-quick-load").addEventListener("click", () => this.handleQuickLoad()),
            e.querySelector("#sm-export-all").addEventListener("click", () => this.handleExportSelected());
        const t = e.querySelector("#sm-import"),
            n = e.querySelector("#sm-import-file");
        t.addEventListener("click", () => n.click()),
            n.addEventListener("change", (e) => this.handleImport(e)),
            e.querySelector("#sm-tab-manual").addEventListener("click", () => this.switchTab("manual")),
            e.querySelector("#sm-tab-auto").addEventListener("click", () => this.switchTab("auto"));
        let a = null;
        e.querySelector("#sm-search").addEventListener("input", (e) => {
            (this.view.query = e.target.value.toLowerCase()),
                clearTimeout(a),
                (a = setTimeout(() => this.render(!1), 150));
        }),
            e.querySelectorAll("th.sortable").forEach((e) => {
                e.addEventListener("click", () => {
                    const t = e.dataset.sort;
                    this.view.sortKey === t
                        ? (this.view.sortDir = "asc" === this.view.sortDir ? "desc" : "asc")
                        : ((this.view.sortKey = t), (this.view.sortDir = "desc")),
                        this.render(!1);
                });
            });
    }
    async switchTab(e) {
        this.view.tab = e;
        const t = this.modal.querySelector("#sm-tab-manual"),
            n = this.modal.querySelector("#sm-tab-auto");
        "manual" === e
            ? (t.classList.add("active"), n.classList.remove("active"))
            : (n.classList.add("active"), t.classList.remove("active")),
            await this.render(!1);
        const a = this.modal.querySelector(".save-list-container");
        a && (a.scrollTop = 0);
    }
    // reload: re-read the saves from storage. Every save is read in full to get its meta, so
    // only do that on open and after a change — searching, sorting and selecting reuse it.
    async render(reload = !0) {
        (reload || !this.saves) && (this.saves = await listAllSaves());
        const e = this.modal.querySelector("#sm-tbody"),
            t = this.modal.querySelector("#sm-card-container"),
            n = this.modal.querySelector("#sm-count"),
            a = this.saves;
        this.renderCurrent(a);
        let o = a.filter((e) =>
            "manual" === this.view.tab ? "manual" === e.saveType : "auto" === e.saveType || "quick" === e.saveType
        );
        this.view.query && (o = o.filter((e) => `${e.saveName}`.toLowerCase().includes(this.view.query))),
            o.sort((e, t) => {
                let n, a;
                switch (this.view.sortKey) {
                    case "name":
                        (n = e.saveName.toLowerCase()), (a = t.saveName.toLowerCase());
                        break;
                    case "day":
                        (n = e.gameTime || 0), (a = t.gameTime || 0);
                        break;
                    case "savedAt":
                        (n = new Date(e.saveDate).getTime()), (a = new Date(t.saveDate).getTime());
                        break;
                    case "playTime":
                        (n = e.playTime || 0), (a = t.playTime || 0);
                        break;
                    default:
                        (n = 0), (a = 0);
                }
                const o = "asc" === this.view.sortDir ? 1 : -1;
                return n > a ? o : n < a ? -o : 0;
            });
        const i = a.filter((e) => "manual" === e.saveType).length,
            s = a.filter((e) => "auto" === e.saveType).length,
            r = a.filter((e) => "quick" === e.saveType).length;
        n.textContent = `${i} manual • ${s} auto • ${r} quick • showing ${o.length}`;
        const l = this.modal.querySelector("#sm-export-all");
        if (
            (l &&
                ((l.disabled = !this.view.selectedId),
                (l.style.opacity = this.view.selectedId ? "1" : "0.45"),
                (l.style.cursor = this.view.selectedId ? "" : "not-allowed")),
            0 === o.length
                ? ((e.innerHTML = `\n          <tr>\n            <td colspan="7" style="text-align: center; padding: 60px 20px; color: var(--text-dim);">\n              <div class="empty-state">\n                <div class="empty-state-icon">💾</div>\n                <h3>No saves found</h3>\n                <p>${"manual" === this.view.tab ? "Create a new save to get started!" : "Autosaves will appear here automatically."}</p>\n              </div>\n            </td>\n          </tr>\n        `),
                  (t.innerHTML = `\n          <div style="text-align: center; padding: 40px 20px; color: var(--text-dim);">\n            <div class="empty-state">\n              <div class="empty-state-icon">💾</div>\n              <h3>No saves found</h3>\n              <p>${"manual" === this.view.tab ? "Create a new save to get started!" : "Autosaves will appear here automatically."}</p>\n            </div>\n          </div>\n        `))
                : (() => {
                      // Group the Autosaves tab into curated tiers (only when sorted
                      // newest-first, which keeps the tier order meaningful).
                      const r = "auto" === this.view.tab && "savedAt" === this.view.sortKey && "desc" === this.view.sortDir;
                      if (!r)
                          return (
                              (e.innerHTML = o.map((e) => this.buildRowHTML(e)).join("")),
                              void (t.innerHTML = o.map((e) => this.buildCardHTML(e)).join(""))
                          );
                      let l = "",
                          c = "",
                          d = null;
                      for (const i of o) {
                          const s = saveTier(i);
                          s.key !== d &&
                              ((d = s.key),
                              (l += `<tr class="sm-tier-row"><td colspan="7" style="padding:10px 12px 4px;font-size:0.78rem;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:var(--text-dim);border-top:1px solid var(--border,var(--l-line));">${s.label}</td></tr>`),
                              (c += `<div class="sm-tier-header" style="grid-column:1/-1;padding:8px 4px 2px;font-size:0.78rem;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:var(--text-dim);">${s.label}</div>`)),
                              (l += this.buildRowHTML(i)),
                              (c += this.buildCardHTML(i));
                      }
                      (e.innerHTML = l), (t.innerHTML = c);
                  })(),
            "manual" === this.view.tab)
        ) {
            const n = document.createElement("tr");
            (n.className = "create-row"),
                (n.id = "sm-create-row"),
                (n.innerHTML =
                    '\n          <td colspan="7">\n            <span class="create-save-link">\n              <span>+</span>\n              <span>Create New Save</span>\n            </span>\n          </td>\n        '),
                e.insertBefore(n, e.firstChild);
            const a = document.createElement("div");
            (a.className = "save-card create-row"),
                (a.id = "sm-create-card"),
                (a.innerHTML =
                    '\n          <div style="text-align: center; padding: 20px 10px; cursor: pointer;">\n            <span class="create-save-link">\n              <span style="font-size: 1.5rem;">+</span>\n              <span>Create New Save</span>\n            </span>\n          </div>\n        '),
                t.insertBefore(a, t.firstChild),
                n.addEventListener("click", () => this.handleCreateSave()),
                a.addEventListener("click", () => this.handleCreateSave());
        }
        this.attachRowListeners(), this.updateSortArrows();
    }
    // "Playing: <name>" in the header, plus a one-click save back into that slot.
    renderCurrent(e) {
        const t = gameState.currentSaveSlot,
            n = t && e.find((e) => e.slotName === t && "manual" === e.saveType),
            a = this.modal.querySelector("#sm-subtitle"),
            o = this.modal.querySelector("#sm-save-current");
        a &&
            (a.innerHTML = n
                ? `Playing: <strong style="color:var(--accent);">${smEsc(t)}</strong> • last saved ${smEsc(new Date(n.saveDate).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }))}`
                : "Not saved to a named save yet — use <strong>+ Create New Save</strong> • Quick Save (F5) • Quick Load (F9)"),
            o && ((o.style.display = n ? "" : "none"), (o.textContent = n ? `💾 Save to "${t}"` : "💾 Save"));
    }
    buildRowHTML(e) {
        const t = new Date(e.saveDate).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                ...(new Date(e.saveDate).getFullYear() !== new Date().getFullYear() && { year: "numeric" }),
                hour: "numeric",
                minute: "2-digit",
                hour12: !0,
            }),
            n = formatCash(e.money || 0),
            a = this.formatPlaytime(e.playTime || 0),
            o = this.view.selectedId === e.slotName,
            c = "manual" === e.saveType && e.slotName === gameState.currentSaveSlot;
        let i = e.saveName;
        if ("autosave" === e.slotName) i = "Latest Autosave";
        else if (e.slotName.startsWith("autosave_")) i = `Autosave — ${formatAgo(saveAgeMs(e))}`;
        else if (/^quick_(\d+)$/.test(e.slotName)) {
            const t = parseInt(e.slotName.replace("quick_", "")),
                n = new Date(t);
            i = `Quick Save — ${n.toLocaleDateString()} ${n.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        }
        const s =
            "auto" === e.saveType
                ? `<span class="save-name-display" style="color:var(--accent);font-weight:600;">${i}</span>`
                : `<input type="text" class="save-name-input" value="${smEsc(i)}" data-slot="${smEsc(e.slotName)}" data-original="${smEsc(e.saveName)}" />`;
        return `\n        <tr data-slot="${smEsc(e.slotName)}" class="${o ? "selected" : ""}${c ? " is-current" : ""}">\n          <td>\n            <div class="save-name-cell">\n              ${s}\n              <span class="save-tag ${e.saveType}">${e.saveType}</span>${c ? '<span class="save-tag current" title="The save you loaded or last saved to">Playing</span>' : ""}\n            </div>\n          </td>\n          <td class="meta">${formatSaveGameTime(e)}</td>\n          <td class="meta">${t}</td>\n          <td>${n}</td>\n          <td>${e.employees || 0}</td>\n          <td class="meta">${a}</td>\n          <td>\n            <div class="save-row-actions">\n              <button class="save-action-btn load" data-action="load" data-slot="${smEsc(e.slotName)}">Load</button>\n              <button class="save-action-btn export" data-action="export" data-slot="${smEsc(e.slotName)}" title="Export to a file">📤</button>${"manual" === e.saveType ? `<button class="save-action-btn overwrite" data-action="overwrite" data-slot="${smEsc(e.slotName)}" title="Replace this save with your current game">Overwrite</button>` : ""}\n              ${"auto" !== e.saveType ? `<button class="save-action-btn delete" data-action="delete" data-slot="${smEsc(e.slotName)}">✕</button>` : ""}\n            </div>\n          </td>\n        </tr>\n      `;
    }
    buildCardHTML(e) {
        const t = new Date(e.saveDate).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                ...(new Date(e.saveDate).getFullYear() !== new Date().getFullYear() && { year: "numeric" }),
                hour: "numeric",
                minute: "2-digit",
                hour12: !0,
            }),
            n = formatCash(e.money || 0),
            a = this.formatPlaytime(e.playTime || 0),
            o = this.view.selectedId === e.slotName,
            c = "manual" === e.saveType && e.slotName === gameState.currentSaveSlot;
        let i = e.saveName;
        if ("autosave" === e.slotName) i = "Latest Autosave";
        else if (e.slotName.startsWith("autosave_")) i = `Autosave — ${formatAgo(saveAgeMs(e))}`;
        else if (/^quick_(\d+)$/.test(e.slotName)) {
            const t = parseInt(e.slotName.replace("quick_", "")),
                n = new Date(t);
            i = `Quick Save — ${n.toLocaleDateString()} ${n.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        }
        const s =
            "auto" === e.saveType
                ? `<span style="color:var(--accent);font-size:0.95rem;font-weight:700;">${i}</span>`
                : `<input type="text" class="save-name-input" value="${smEsc(i)}" data-slot="${smEsc(e.slotName)}" data-original="${smEsc(e.saveName)}" style="background:transparent;border:none;color:var(--accent);font-size:0.95rem;font-weight:700;padding:0;width:100%;" />`;
        return `\n        <div class="save-card ${o ? "selected" : ""}${c ? " is-current" : ""}" data-slot="${smEsc(e.slotName)}">\n          <div class="save-card-header">\n            <div class="save-card-title">\n              <div class="save-card-name">\n                ${s}\n              </div>\n              <span class="save-tag ${e.saveType}">${e.saveType}</span>${c ? '<span class="save-tag current" title="The save you loaded or last saved to">Playing</span>' : ""}\n            </div>\n          </div>\n          \n          <div class="save-card-meta">\n            <div class="save-card-meta-item">\n              <span>📅</span>\n              <span>${formatSaveGameTime(e)}</span>\n            </div>\n            <div class="save-card-meta-item">\n              <span>🕒</span>\n              <span>${t}</span>\n            </div>\n            <div class="save-card-meta-item">\n              <span>💰</span>\n              <span>${n}</span>\n            </div>\n            <div class="save-card-meta-item">\n              <span>👥</span>\n              <span>${e.employees || 0}</span>\n            </div>\n            <div class="save-card-meta-item">\n              <span>⏱️</span>\n              <span>${a}</span>\n            </div>\n          </div>\n          \n          <div class="save-card-actions">\n            <button class="save-action-btn load" data-action="load" data-slot="${smEsc(e.slotName)}">Load</button>\n            <button class="save-action-btn export" data-action="export" data-slot="${smEsc(e.slotName)}" title="Export to a file">📤</button>${"manual" === e.saveType ? `<button class="save-action-btn overwrite" data-action="overwrite" data-slot="${smEsc(e.slotName)}" title="Replace this save with your current game">Overwrite</button>` : ""}\n            ${"auto" !== e.saveType ? `<button class="save-action-btn delete" data-action="delete" data-slot="${smEsc(e.slotName)}">Delete</button>` : ""}\n          </div>\n        </div>\n      `;
    }
    attachRowListeners() {
        const e = this.modal.querySelector("#sm-tbody"),
            t = this.modal.querySelector("#sm-card-container");
        [...e.querySelectorAll(".save-action-btn"), ...t.querySelectorAll(".save-action-btn")].forEach((e) => {
            e.addEventListener("click", (e) => {
                const t = e.target.dataset.action,
                    n = e.target.dataset.slot;
                "load" === t
                    ? this.handleLoad(n)
                    : "overwrite" === t
                      ? this.handleOverwrite(n)
                      : "export" === t
                      ? this.handleExport(n)
                      : "delete" === t && this.handleDelete(n);
            });
        });
        [...e.querySelectorAll(".save-name-input"), ...t.querySelectorAll(".save-name-input")].forEach((e) => {
            e.addEventListener("focus", (e) => {
                e.target.select(), (this.editingNameId = e.target.dataset.slot);
            }),
                e.addEventListener("blur", (e) => {
                    this.handleRename(e);
                }),
                e.addEventListener("keydown", (e) => {
                    "Enter" === e.key
                        ? e.target.blur()
                        : "Escape" === e.key && ((e.target.value = e.target.dataset.original), e.target.blur());
                });
        }),
            e.querySelectorAll("tr[data-slot]").forEach((e) => {
                e.addEventListener("click", (t) => {
                    "INPUT" !== t.target.tagName &&
                        "BUTTON" !== t.target.tagName &&
                        ((this.view.selectedId = e.dataset.slot), this.render(!1));
                });
            }),
            t.querySelectorAll(".save-card[data-slot]").forEach((e) => {
                e.addEventListener("click", (t) => {
                    "INPUT" !== t.target.tagName &&
                        "BUTTON" !== t.target.tagName &&
                        ((this.view.selectedId = e.dataset.slot), this.render(!1));
                });
            });
    }
    updateSortArrows() {
        this.modal.querySelectorAll("th.sortable").forEach((e) => {
            const t = e.querySelector(".sort-arrow");
            t &&
                (e.dataset.sort === this.view.sortKey
                    ? ((t.textContent = "asc" === this.view.sortDir ? "▴" : "▾"), (t.style.opacity = "1"))
                    : ((t.textContent = "▾"), (t.style.opacity = "0.5")));
        });
    }
    formatPlaytime(e) {
        const t = Math.floor(e / 36e5),
            n = Math.floor((e % 36e5) / 6e4);
        return t > 0 ? `${t}h ${n}m` : `${n}m`;
    }
    async handleContinue() {
        const e = await listAllSaves();
        if (0 === e.length) return void showNotification("❌ No saves found!", "error");
        const t = e[0];
        await loadGameFromSlot(t.slotName), this.hide();
    }
    async handleQuickSave() {
        const e = `quick_${Date.now()}`;
        await saveGameToSlot(e, "quick", !0), await this.render();
    }
    async handleQuickLoad() {
        const e = (await listAllSaves()).filter((e) => "quick" === e.saveType);
        0 !== e.length
            ? (await loadGameFromSlot(e[0].slotName), this.hide())
            : showNotification("❌ No quick saves found!", "error");
    }
    async handleCreateSave() {
        const e = defaultSaveName(),
            t = await showPrompt("Name this save. You can overwrite it later with the Overwrite button.", "💾 New Save", {
                defaultValue: e,
                placeholder: e,
            });
        if (null === t) return;
        const n = cleanSaveName(t) || e;
        if (RESERVED_SAVE_NAME.test(n)) return void showNotification("❌ That name is reserved — pick another.", "error");
        if (
            (await kv.gameSave.keys()).includes(`fuoc_save_${n}`) &&
            !(await showConfirm(`A save named "${n}" already exists.\n\nOverwrite it with your current game?`, "Overwrite Save", {
                type: "warning",
                confirmText: "Overwrite",
            }))
        )
            return;
        await this.writeManualSave(n);
    }
    async handleOverwrite(e) {
        (await showConfirm(
            `Overwrite "${e}" with your current game?\n\nWhat's in that save now will be replaced.`,
            "Overwrite Save",
            { type: "warning", confirmText: "Overwrite" }
        )) && (await this.writeManualSave(e));
    }
    // Writing a named save makes it the one you're "playing": the header shows it and the
    // Save button targets it. The field travels inside the save, so autosaves, snapshots
    // and reloads remember it too.
    async writeManualSave(e) {
        const t = gameState.currentSaveSlot;
        gameState.currentSaveSlot = e;
        if (!(await saveGameToSlot(e, "manual", !0))) return void (gameState.currentSaveSlot = t);
        (this.view.selectedId = e), saveGame(!1), await this.render();
    }
    async handleLoad(e) {
        !1 !== (await loadGameFromSlot(e)) && this.hide();
    }
    async handleExport(e) {
        await exportSaveSlot(e);
    }
    async handleExportSelected() {
        this.view.selectedId
            ? await exportSaveSlot(this.view.selectedId)
            : showNotification("❌ No save selected!", "error");
    }
    async handleDelete(e) {
        (await showConfirm(`Delete save "${e}"?\n\nThis cannot be undone!`, "Delete Save", {
            type: "danger",
            confirmText: "Delete",
        })) &&
            (await deleteSaveSlot(e)) &&
            (gameState.currentSaveSlot === e && ((gameState.currentSaveSlot = null), saveGame(!1)), await this.render());
    }
    async handleRename(e) {
        const t = e.target,
            n = t.dataset.slot,
            a = cleanSaveName(t.value);
        if (a === n || "" === a || a === t.dataset.original)
            return (t.value = t.dataset.original), void (this.editingNameId = null);
        if (RESERVED_SAVE_NAME.test(a))
            return (
                showNotification("❌ That name is reserved — pick another.", "error"),
                (t.value = t.dataset.original),
                void (this.editingNameId = null)
            );
        (await renameSaveSlot(n, a))
            ? (this.view.selectedId === n && (this.view.selectedId = a),
              gameState.currentSaveSlot === n && ((gameState.currentSaveSlot = a), saveGame(!1)),
              await this.render())
            : (t.value = t.dataset.original),
            (this.editingNameId = null);
    }
    async handleImport(e) {
        const t = e.target.files[0];
        if (!t) return;
        const n = new FileReader();
        (n.onload = async (e) => {
            try {
                const t = e.target.result,
                    n = JSON.parse(t);
                if (!n.gameState) return void showNotification("❌ Invalid save file format!", "error");
                const a = n.meta?.saveName || "imported",
                    o = n.meta?.saveDate ? new Date(n.meta.saveDate).toLocaleString() : "Unknown",
                    i = n.gameState.cash ? formatCash(n.gameState.cash) : "Unknown";
                if (
                    !(await showConfirm(
                        `Import save "${a}"?\n\n💰 ${i}\n📅 ${o}\n\nThis will create a new save slot.`,
                        "Import Save",
                        { type: "info", confirmText: "Import" }
                    ))
                )
                    return;
                await importSaveToSlot(n), await this.render();
            } catch (e) {
                console.error("[SaveManager] Import error:", e),
                    showNotification("❌ Failed to import save!", "error");
            }
        }),
            n.readAsText(t),
            (e.target.value = "");
    }
}
let saveManagerInstance = null;
function getSaveManager() {
    return saveManagerInstance || (saveManagerInstance = new SaveManager()), saveManagerInstance;
}
// Loads used to reset every salary to its level's flat baseSalary, wiping raises and
// leaving anyone above garage tier "underpaid" against the market model. A salary sitting
// exactly on that base is the reset's fingerprint: move it up to the market rate, once per
// save. Only ever raises pay.
function repairFlatSalaries() {
    if (gameState.salaryResetRepaired || !Array.isArray(gameState.employees)) return;
    let n = 0;
    gameState.employees.forEach((e) => {
        const b = gameState.hierarchyLevels?.[e.career?.level || 1]?.baseSalary;
        if (!e.career || "active" !== e.employmentStatus || !b || e.career.salary !== b) return;
        const m = getMarketRate(e);
        m > b && ((e.career.salary = m), n++);
    });
    (gameState.salaryResetRepaired = !0),
        n > 0 && console.log(`[LoadGame Migration] Restored market-rate salaries for ${n} employee(s)`);
}
async function loadGame() {
    try {
        await migrateLegacySave();
        bootLog('KV read attempt → slot "fuoc_save_autosave"');
        let e = await readSaveSlotResilient("fuoc_save_autosave"),
            __primarySlot = "fuoc_save_autosave";
        e ||
            (bootLog('Primary slot empty → trying legacy slot "gameState"'),
            (e = await readSaveSlotResilient("gameState")) && (__primarySlot = "gameState"));
        // GUARD 3 + GUARD 4: the live slot read came back empty. If ANY other save
        // exists, this is suspicious (a real save likely lives elsewhere) — do NOT
        // start a new game over the slot and do NOT let autosave run. Tell the player
        // to recover. Only a truly empty store is treated as a legitimate first run.
        let __intentionalReset = !1;
        try {
            "1" === localStorage.getItem("fuoc_intentional_reset") &&
                ((__intentionalReset = !0), localStorage.removeItem("fuoc_intentional_reset"));
        } catch (e) {}
        if (!e && __intentionalReset)
            bootLog("DECISION: intentional reset sentinel present → NEW GAME (Save Manager snapshots preserved)");
        if (!e && !__intentionalReset) {
            const __others = await listOtherSaveSlots();
            if (__others.length > 0)
                return (
                    bootLog(
                        "DECISION: live save slot EMPTY but other save slots exist → REFUSING to start new game (GUARD 3)",
                        __others
                    ),
                    console.warn(
                        `[SaveManager] ⚠ Live save slot empty while ${__others.length} other save(s) exist — NOT overwriting. Recover via Save Manager.`
                    ),
                    (saveSystemReady = !1),
                    (loadFailedNoOverwrite = !0),
                    void showNotification(
                        "⚠ Could not load your latest save — open the Save Manager to recover it. Autosave is paused to protect your data.",
                        "error",
                        12e3
                    )
                );
        }
        if (e) {
            bootLog(`KV read OK ← slot "${__primarySlot}" (${estimateSize(e)} bytes)`), await backupPreviousSession(e);
            const t = e.gameState || e;
            {
                // After the backup (which keeps the references): put the images back.
                const r = await internalizeImages(t);
                r.refs && bootLog(`Images restored from the image store: ${r.refs} reference(s), ${r.missing} missing`);
            }
            bootLog("Parse OK — incoming save summary", gameStateSummary(t));
            if (
                (t.usedEmployeeNames &&
                    Array.isArray(t.usedEmployeeNames) &&
                    (console.log(
                        `[LoadGame] Pre-converting usedEmployeeNames Array (${t.usedEmployeeNames.length} items) to Set`
                    ),
                    (t.usedEmployeeNames = new Set(t.usedEmployeeNames))),
                t.blockedProactiveMessages &&
                    Array.isArray(t.blockedProactiveMessages) &&
                    (console.log(
                        `[LoadGame] Pre-converting blockedProactiveMessages Array (${t.blockedProactiveMessages.length} items) to Set`
                    ),
                    (t.blockedProactiveMessages = new Set(t.blockedProactiveMessages))),
                t.recentTopics && !t.recentTopics.has)
            ) {
                const e = Object.entries(t.recentTopics);
                console.log(`[LoadGame] Pre-converting recentTopics object (${e.length} items) to Map`),
                    (t.recentTopics = new Map(e));
            }
            const n = gameState.hierarchyLevels;
            (gameState = {
                ...gameState,
                ...t,
                hierarchyLevels: n,
                activeLocationId: t.activeLocationId || "garage",
                upgradeMultiplier: t.upgradeMultiplier || 1,
                time: {
                    ...gameState.time,
                    ...(t.time || {}),
                    currentTime: t.time?.currentTime || gameState.time.currentTime,
                },
                locations: (t.locations || gameState.locations).map((e) => ({
                    unlocked: e.unlocked ?? e.owned ?? "garage" === e.id,
                    owned: e.owned ?? e.unlocked ?? "garage" === e.id,
                    ...e,
                })),
                products: (t.products || gameState.products).map((e) => ({
                    baseUpgradeCost: e.baseUpgradeCost ?? e.upgradeCost ?? 50,
                    costGrowth: e.costGrowth ?? 1.35,
                    valueExponent: e.valueExponent ?? 0.85,
                    managerSpeedCapPct: e.managerSpeedCapPct ?? 0.4,
                    unlocked: e.unlocked ?? "website" === e.id,
                    unlockCost:
                        e.unlockCost ??
                        ({
                            website: 0,
                            app: 100,
                            consulting: 400,
                            cloud: 1800,
                            seo: 3e3,
                            branding: 5e3,
                            ecommerce: 8e3,
                            automation: 12e3,
                            copywriting: 0,
                            video_editing: 2e4,
                            marketing: 35e3,
                            consulting_premium: 55e3,
                            saas: 85e3,
                        }[e.id] ||
                            0),
                    ...e,
                })),
                employees: t.employees || gameState.employees,
                settings: { ...gameState.settings, ...(t.settings || {}) },
                chatHistory: t.chatHistory || {},
                typingStates: t.typingStates || {},
                onboarding: t.onboarding || [],
                pendingAIRequests: {
                    text: t.pendingAIRequests?.text || [],
                    image: t.pendingAIRequests?.image || [],
                },
                generationStats: {
                    totalTextGenerations: t.generationStats?.totalTextGenerations || 0,
                    totalImageGenerations: t.generationStats?.totalImageGenerations || 0,
                },
                playerProfile: { ...gameState.playerProfile, ...(t.playerProfile || {}) },
                socialNetwork: {
                    ...gameState.socialNetwork,
                    ...(t.socialNetwork || {}),
                    posts: t.socialNetwork?.posts || [],
                    globalEvents: t.socialNetwork?.globalEvents || [],
                    postIdCounter: t.socialNetwork?.postIdCounter || 0,
                    algorithm: {
                        sort: "foryou",
                        bestTimeFrame: "all",
                        contentRating: "all",
                        postType: "all",
                        author: "all",
                        engagement: "all",
                        searchQuery: "",
                        ...(t.socialNetwork?.algorithm || {}),
                    },
                    recentPostTypes: t.socialNetwork?.recentPostTypes || [],
                    playerDraft: t.socialNetwork?.playerDraft || {
                        caption: "",
                        imagePrompt: "",
                        altText: "",
                        imageUrl: null,
                    },
                },
                companyContext: { ...gameState.companyContext, ...(t.companyContext || {}) },
                companyWideContext: {
                    ...gameState.companyWideContext,
                    ...(t.companyWideContext || {}),
                    currentBuzz: t.companyWideContext?.currentBuzz || [],
                    lastUpdate: t.companyWideContext?.lastUpdate || Date.now(),
                    maxItems: t.companyWideContext?.maxItems || 40,
                    decayTime: t.companyWideContext?.decayTime || 6048e5,
                },
                prestigeLevel: t.prestigeLevel ?? 0,
                influencePoints: t.influencePoints ?? 0,
                lifetimeEarnings: t.lifetimeEarnings ?? 0,
                lifetimeEarningsConverted: t.lifetimeEarningsConverted ?? 0,
                prestigeMultiplier: t.prestigeMultiplier ?? 1,
                globalUpgrades: {
                    clickPower: t.globalUpgrades?.clickPower ?? 0,
                    incomeBoost: t.globalUpgrades?.incomeBoost ?? {},
                    costReduction: t.globalUpgrades?.costReduction ?? {},
                },
                bossFights: {
                    active: t.bossFights?.active || null,
                    defeated: t.bossFights?.defeated || [],
                    history: t.bossFights?.history || [],
                },
                raceSettings: foldRaceWeights(t.raceSettings),
            }),
                gameState.employees.forEach((e) => {
                    if (
                        (initializeEmployeeSocialData(e),
                        ensureEmployeeMemory(e),
                        (() => {
                            if (e.race) {
                                const rr = String(e.race).toLowerCase().trim();
                                if (RACES[rr] || RACE_REMAP[rr]) e.race = canonicalRace(rr);
                            }
                            if (e.physical && "object" == typeof e.physical) {
                                if (!e.physical.race && e.race) e.physical.race = e.race;
                                migratePhysicalSchema(e.physical);
                            }
                        })(),
                        e.giftPreferences || (e.giftPreferences = generateGiftPreferences()),
                        e.hireDate || (e.hireDate = gameNow() - 30 * Math.random() * 24 * 60 * 60 * 1e3),
                        e.career ||
                            ((e.career = {
                                level: 1,
                                title: gameState.hierarchyLevels[1].title,
                                salary: gameState.hierarchyLevels[1].baseSalary,
                                startDate: e.hireDate || Date.now(),
                                promotionHistory: [],
                                directReports: [],
                                managerId: null,
                            }),
                            console.log(`[LoadGame] Initialized career data for ${e.name} at Level 1`)),
                        "Entry Level" === e.career.title)
                    ) {
                        (e.career.title = "Staff"), (e.career.level = 1);
                        const t = gameState.hierarchyLevels?.[1];
                        t && (e.career.salary = t.baseSalary),
                            console.log(
                                `[LoadGame Migration] Updated ${e.name}'s title from "Entry Level" to "Staff" (Level 1)`
                            );
                    }
                    // Salaries follow the market model (market rate + any negotiated raises), so a
                    // load must never reset them to the level's flat baseSalary — that used to wipe
                    // raises on every reload and flag everyone above garage tier as underpaid.
                    // Only fill in a salary that is missing or invalid.
                    e.career &&
                        !(e.career.salary > 0) &&
                        ((e.career.salary = getMarketRate(e)),
                        console.log(`[LoadGame Migration] Set missing salary for ${e.name}: $${e.career.salary.toLocaleString()}`));
                    if (e.career && e.career.title) {
                        const t = Object.keys(gameState.hierarchyLevels || {}).find((t) => {
                            const n = gameState.hierarchyLevels[t];
                            return n && n.title === e.career.title;
                        });
                        t &&
                            e.career.level != t &&
                            ((e.career.level = parseInt(t)),
                            console.log(
                                `[LoadGame Migration] Synced ${e.name}'s level to ${t} to match title "${e.career.title}"`
                            ));
                    }
                });
            repairFlatSalaries();
            // Hotfix 2: self-heal legacy saves where a group message's imageDesc was corrupted with a
            // DOM node (pre-DataCloneError-fix). Reset any non-string imageDesc to "" so loads don't throw.
            Array.isArray(gameState.groups) &&
                gameState.groups.forEach((g) => {
                    Array.isArray(g.messages) &&
                        g.messages.forEach((m) => {
                            m && "string" != typeof m.imageDesc && (m.imageDesc = "");
                        });
                });
            let a = 0;
            gameState.employees.forEach((e) => {
                // Legacy saves recorded a manager only as position "Manager – <product>". Current
                // saves also write that title, so only trust it for someone the save doesn't
                // already place: no product names them as manager and they hold no ladder seat.
                // (position/productManaged are live fields now — hiring, accountants and AI
                // prompts read them — so they are no longer deleted here.)
                const placed =
                    gameState.products.some((p) => p.managerId === e.id) ||
                    Object.values(gameState.corporatePyramid?.positions || {}).some(
                        (l) => Array.isArray(l) && l.some((p) => p.employeeId === e.id)
                    );
                if (!placed && "active" === e.employmentStatus && e.position && /Manager\s*[–-]\s*(.+)/.test(e.position)) {
                    const t = e.position.match(/Manager\s*[–-]\s*(.+?)(?:\s*•|$)/);
                    if (t) {
                        const n = t[1].trim();
                        console.log(
                            `[LoadGame Migration] Found old position for ${e.name}: "${e.position}" -> extracting product: "${n}"`
                        );
                        const o = gameState.products.find((e) => e.name.toLowerCase() === n.toLowerCase());
                        o && o.unlocked && !o.managerHired
                            ? ((o.managerHired = !0),
                              (o.managerId = e.id),
                              (o.managerLevel = o.managerLevel || 1),
                              (o.onboardStartTime = null),
                              console.log(`[LoadGame Migration] ✓ Auto-assigned ${e.name} to "${o.name}"`),
                              a++)
                            : o
                              ? console.log(
                                    `[LoadGame Migration] ⚠ Product "${n}" found but already has staff or is locked`
                                )
                              : console.log(`[LoadGame Migration] ⚠ Product "${n}" not found`);
                    }
                }
            }),
                a > 0 &&
                    (console.log(
                        `[LoadGame Migration] Auto-assigned ${a} employee(s) to their products from old save data`
                    ),
                    showNotification(`Migration: Auto-assigned ${a} employee(s) to their positions!`));
            const o = new Set(gameState.employees.filter((e) => "active" === e.employmentStatus).map((e) => e.id));
            let i = 0;
            gameState.products.forEach((e) => {
                if (e.managerHired && e.managerId) {
                    if (!o.has(e.managerId)) {
                        const t = gameState.employees.find((t) => t.id === e.managerId),
                            n = t ? `alumni/inactive (${t.employmentStatus})` : "non-existent";
                        console.log(
                            `[LoadGame Migration] Product "${e.name}" has ${n} managerId: ${e.managerId} - clearing`
                        ),
                            (e.managerHired = !1),
                            (e.managerId = null),
                            (e.managerLevel = 0),
                            (e.managerOnboarding = !1),
                            (e.running = !1),
                            (e.timeRemainingMs = 0),
                            i++;
                    }
                } else
                    e.managerHired &&
                        !e.managerId &&
                        (console.log(
                            `[LoadGame Migration] Product "${e.name}" has managerHired=true but no managerId - clearing`
                        ),
                        (e.managerHired = !1),
                        (e.managerLevel = 0),
                        i++);
            }),
                i > 0 &&
                    (console.log(`[LoadGame Migration] Fixed ${i} product(s) with invalid manager references`),
                    showNotification(`Migration: Fixed ${i} orphaned product assignment(s).`)),
                gameState.products.forEach((e) => {
                    if (e.managerHired && e.managerId) {
                        const t = gameState.corporatePyramid?.positions?.[1]?.find((t) => t.productId === e.id);
                        if (t && !t.employeeId) {
                            (t.employeeId = e.managerId), (t.isVacant = !1);
                            const n = gameState.employees.find((t) => t.id === e.managerId);
                            n &&
                                console.log(
                                    `[LoadGame Migration] ✓ Synced ${n.name} to corporate pyramid position: ${t.title}`
                                );
                        }
                    }
                }),
                gameState.corporatePyramid?.positions &&
                    (Object.keys(gameState.corporatePyramid.positions).forEach((e) => {
                        const t = gameState.corporatePyramid.positions[e];
                        Array.isArray(t) &&
                            t.forEach((e) => {
                                if (e.employeeId && !o.has(e.employeeId)) {
                                    const t = gameState.employees.find((t) => t.id === e.employeeId),
                                        n = t ? `alumni (${t.employmentStatus})` : "non-existent";
                                    console.log(
                                        `[LoadGame Migration] Clearing ${n} employee from pyramid position: ${e.title}`
                                    ),
                                        (e.employeeId = null),
                                        (e.isVacant = !0);
                                }
                            });
                    }),
                    gameState.corporatePyramid.ceoPosition?.employeeId &&
                        !o.has(gameState.corporatePyramid.ceoPosition.employeeId) &&
                        (console.log("[LoadGame Migration] Clearing non-active employee from CEO position"),
                        (gameState.corporatePyramid.ceoPosition.employeeId = null),
                        (gameState.corporatePyramid.ceoPosition.isVacant = !0)),
                    gameState.corporatePyramid.secretaryPosition?.employeeId &&
                        !o.has(gameState.corporatePyramid.secretaryPosition.employeeId) &&
                        (console.log("[LoadGame Migration] Clearing non-active employee from Secretary position"),
                        (gameState.corporatePyramid.secretaryPosition.employeeId = null),
                        (gameState.corporatePyramid.secretaryPosition.isVacant = !0))),
                gameState.giftInventory || (gameState.giftInventory = { items: [], capacity: 1 / 0 }),
                gameState.giftStore || (gameState.giftStore = { items: [] }),
                void 0 === gameState.currentLifetimeIncome &&
                    (gameState.currentLifetimeIncome = gameState.totalEarnings || 0),
                gameState.givenUniqueGifts || (gameState.givenUniqueGifts = []),
                gameState.createdUniqueGifts || (gameState.createdUniqueGifts = []),
                gameState.time &&
                    60 === gameState.time.timeScale &&
                    (console.log("[LoadGame] Updating timeScale from 60 to 20 (1 game min = 3 real seconds)"),
                    (gameState.time.timeScale = 20)),
                (gameState.usedEmployeeNames && gameState.usedEmployeeNames.has) ||
                    (console.warn("[LoadGame] usedEmployeeNames not a Set, initializing empty Set"),
                    (gameState.usedEmployeeNames = new Set())),
                (gameState.blockedProactiveMessages && gameState.blockedProactiveMessages.has) ||
                    (console.warn("[LoadGame] blockedProactiveMessages not a Set, initializing empty Set"),
                    (gameState.blockedProactiveMessages = new Set())),
                (gameState.recentTopics && gameState.recentTopics.has) ||
                    (console.warn("[LoadGame] recentTopics not a Map, initializing empty Map"),
                    (gameState.recentTopics = new Map())),
                gameState.genderSettings ||
                    (console.log("[LoadGame] Initializing missing genderSettings with defaults"),
                    (gameState.genderSettings = {
                        female: 100,
                        male: 0,
                        femaleFuta: 0,
                        transMan: 0,
                        transWoman: 0,
                    })),
                gameState.aiQuality ||
                    (console.log("[LoadGame] Initializing missing aiQuality (RLHF system) with defaults"),
                    (gameState.aiQuality = {
                        goodExamples: { posts: [], comments: [], chats: [] },
                        badExamples: { posts: [], comments: [], chats: [] },
                        bannedPatterns: [],
                        stats: {
                            totalVotes: 0,
                            upvotes: 0,
                            downvotes: 0,
                            postsVoted: 0,
                            commentsVoted: 0,
                            chatsVoted: 0,
                        },
                        maxExamplesPerType: 20,
                        tutorialShown: !1,
                    })),
                gameState.playerMentionStats ||
                    (gameState.playerMentionStats = {
                        totalMentions: 0,
                        positiveReactions: 0,
                        negativeReactions: 0,
                        lastMentionTime: null,
                    }),
                gameState.activeGossip || (gameState.activeGossip = []),
                gameState.lastProactiveMessageCheck || (gameState.lastProactiveMessageCheck = 0),
                gameState.lifestyleAdjustmentCounter || (gameState.lifestyleAdjustmentCounter = 0),
                gameState.currentCandidates || (gameState.currentCandidates = null),
                gameState.usedEmployeeNames || (gameState.usedEmployeeNames = new Set()),
                updateCompanyAwareness();
            !gameState.employees.some((e) => e.relationships && Object.keys(e.relationships).length > 0) &&
                gameState.employees.length > 1 &&
                generateRandomRelationships(),
                initializeUsedNames(),
                showNotification("Game loaded!"),
                gameState.settings?.maxAiRequests &&
                    (AIRequestQueue.updateMaxConcurrent(gameState.settings.maxAiRequests),
                    console.log(
                        "[AI Queue] Re-initialized after game load with max:",
                        gameState.settings.maxAiRequests
                    ));
            const awayMs = Math.max(0, Date.now() - getLastPresentRealTime());
            checkAfkIncome(awayMs),
                (gameState.time && (gameState.time._offlinePaused = !1),
                applyOfflineTimePassage(awayMs, "load"));
        } else await migrateFromLocalStorage();
        // Mark the save system ready. migrateFromLocalStorage may have recursively
        // loaded a save (which already set the flag) — in that case don't override.
        loadFailedNoOverwrite || scheduleImageGc("startup", 6e4);
        if (!loadFailedNoOverwrite && !saveSystemReady) {
            e ||
                ((intentionalNewGame = !0),
                bootLog("DECISION: no existing save found anywhere → legitimate NEW GAME", gameStateSummary()));
            (saveSystemReady = !0), bootLog("Load complete — save system READY", gameStateSummary());
        } else saveSystemReady && bootLog("DECISION: loaded existing save", gameStateSummary());
    } catch (err) {
        // GUARD 3 + GUARD 4: a read/parse error must NOT fall back to a silent new game
        // and must NOT overwrite the slot that failed to read. Keep autosave paused so
        // whatever is in the slot survives for the player to recover.
        console.error("[SaveManager] Error loading game:", err),
            bootLog("DECISION: load FAILED with exception → refusing to overwrite save slot (GUARD 3)", String((err && err.message) || err)),
            (saveSystemReady = !1),
            (loadFailedNoOverwrite = !0),
            showNotification(
                "⚠ Could not load your save (read error) — open the Save Manager to recover it. Autosave is paused to protect your data.",
                "error",
                12e3
            );
    }
}
// awayMs: how long the game wasn't running on screen — since the last visible tick (on
// load) or since the tab was hidden (on refocus). See markPlayerPresent in 07-time.js.
function checkAfkIncome(awayMs = Date.now() - getLastPresentRealTime()) {
    gameState.offlineEarnings ||
        (gameState.offlineEarnings = {
            enabled: !0,
            maxDuration: 864e5,
            rate: 0.5,
            lastPlayedRealTime: Date.now(),
        });
    const e = Date.now(),
        n = Math.max(0, awayMs);
    if (n < 3e5)
        return (
            (gameState.offlineEarnings.lastPlayedRealTime = e),
            (gameState.lastInteractionTime = e),
            void (gameState.lastPlayTime = e)
        );
    if (!gameState.offlineEarnings.enabled)
        return (
            (gameState.offlineEarnings.lastPlayedRealTime = e),
            (gameState.lastInteractionTime = e),
            void (gameState.lastPlayTime = e)
        );
    const a = parseFloat(calculateCashPerSecond());
    if (a <= 0)
        return (
            (gameState.offlineEarnings.lastPlayedRealTime = e),
            (gameState.lastInteractionTime = e),
            void (gameState.lastPlayTime = e)
        );
    const o = Math.floor(n / 1e3),
        i = Math.floor(gameState.offlineEarnings.maxDuration / 1e3),
        s = Math.min(o, i);
    let r = gameState.offlineEarnings.rate;
    const l = gameState.influenceUpgrades?.offlineEarnings || 0;
    l > 0 && (r = influenceUpgrades.offlineEarnings.effect(l));
    const c = a * s,
        d = Math.floor(c * r);
    console.log(`[AFK] Time away: ${(s / 60).toFixed(1)} minutes`),
        console.log(`[AFK] Income rate: $${formatNumber(a)}/sec`),
        console.log(`[AFK] Full earnings (100%): $${formatNumber(c)}`),
        console.log(`[AFK] AFK earnings (${(100 * r).toFixed(1)}%): $${formatNumber(d)}`);
    const p = Math.floor(s / 3600),
        m = Math.floor((s % 3600) / 60),
        u = p > 0 ? `${p}h ${m}m` : `${m}m`,
        g = document.getElementById("afkIncomeModal"),
        h = document.getElementById("afkTimeAway"),
        y = document.getElementById("afkIncomeRate"),
        f = document.getElementById("afkFullEarnings"),
        b = document.getElementById("afkEarnings"),
        v = document.getElementById("afkRate"),
        w = document.getElementById("claimAfkIncome"),
        x = document.getElementById("closeAfkIncome");
    h && (h.textContent = u),
        y && (y.textContent = `$${formatNumber(a)}/sec`),
        f && (f.textContent = `$${formatNumber(c)}`),
        b && (b.textContent = `$${formatNumber(d)}`),
        v && (v.textContent = Math.round(100 * r)), // the markup supplies the "%"
        g && (g.style.display = "flex"),
        w &&
            (w.onclick = () => {
                (gameState.cash += d),
                    (gameState.currentLifetimeIncome = (gameState.currentLifetimeIncome || 0) + d),
                    (gameState.lastPlayTime = e),
                    (gameState.lastInteractionTime = e),
                    (gameState.offlineEarnings.lastPlayedRealTime = e),
                    updateUI(),
                    g && (g.style.display = "none"),
                    showNotification(`Claimed $${formatNumber(d)} AFK earnings!`);
            }),
        x &&
            (x.onclick = () => {
                (gameState.cash += d),
                    (gameState.currentLifetimeIncome = (gameState.currentLifetimeIncome || 0) + d),
                    (gameState.lastPlayTime = e),
                    (gameState.lastInteractionTime = e),
                    (gameState.offlineEarnings.lastPlayedRealTime = e),
                    updateUI(),
                    g && (g.style.display = "none");
            });
}
async function migrateFromLocalStorage() {
    try {
        const e = localStorage.gameState;
        if (e) {
            console.log("Migrating old localStorage save to kv-plugin...");
            const t = JSON.parse(e);
            await kv.gameSave.set("gameState", t),
                delete localStorage.gameState,
                console.log("Migration complete! Old localStorage data cleared."),
                showNotification("Save data migrated to new storage system!"),
                await loadGame();
        }
    } catch (e) {
        console.error("Error migrating from localStorage:", e);
    }
}
const influenceUpgrades = {
    incomeMultiplier: {
        id: "incomeMultiplier",
        name: "Income Multiplier",
        description: "Increase all income by 10% per level",
        icon: "💰",
        baseCost: 5,
        costIncrease: 1.3,
        maxLevel: 50,
        getCurrentLevel: () => gameState.influenceUpgrades?.incomeMultiplier || 0,
        effect: (e) => 1 + 0.1 * e,
    },
    startingCash: {
        id: "startingCash",
        name: "Starting Capital",
        description: "Start each prestige with more cash",
        icon: "💵",
        baseCost: 3,
        costIncrease: 1.4,
        maxLevel: 100,
        getCurrentLevel: () => gameState.influenceUpgrades?.startingCash || 0,
        effect: (e) => 50 * e,
    },
    clickPower: {
        id: "clickPower",
        name: "Quick Hands",
        description: "Click products to reduce time by +0.05s per level",
        icon: "👆",
        baseCost: 3,
        costIncrease: 1.3,
        maxLevel: 50,
        getCurrentLevel: () => gameState.influenceUpgrades?.clickPower || 0,
        effect: (e) => 0.05 * e,
    },
    employeeDiscount: {
        id: "employeeDiscount",
        name: "HR Efficiency",
        description: "Reduce employee costs by 5% per level",
        icon: "👔",
        baseCost: 4,
        costIncrease: 1.35,
        maxLevel: 10,
        getCurrentLevel: () => gameState.influenceUpgrades?.employeeDiscount || 0,
        effect: (e) => Math.max(0.5, 1 - 0.05 * e),
    },
    productDiscount: {
        id: "productDiscount",
        name: "Bulk Buying",
        description: "Reduce product costs by 3% per level",
        icon: "📦",
        baseCost: 4,
        costIncrease: 1.35,
        maxLevel: 15,
        getCurrentLevel: () => gameState.influenceUpgrades?.productDiscount || 0,
        effect: (e) => Math.max(0.55, 1 - 0.03 * e),
    },
    autoProgress: {
        id: "autoProgress",
        name: "Automation Boost",
        description: "Managers work 5% faster per level",
        icon: "⚡",
        baseCost: 6,
        costIncrease: 1.4,
        maxLevel: 20,
        getCurrentLevel: () => gameState.influenceUpgrades?.autoProgress || 0,
        effect: (e) => 1 + 0.05 * e,
    },
    bossWarrior: {
        id: "bossWarrior",
        name: "Boss Warrior",
        description: "Deal +15% damage to bosses per level",
        icon: "⚔️",
        baseCost: 8,
        costIncrease: 1.5,
        maxLevel: 25,
        getCurrentLevel: () => gameState.influenceUpgrades?.bossWarrior || 0,
        effect: (e) => 1 + 0.15 * e,
    },
    prestigeBonus: {
        id: "prestigeBonus",
        name: "Prestige Master",
        description: "Gain +5% more Influence Points per prestige per level",
        icon: "✨",
        baseCost: 10,
        costIncrease: 1.6,
        maxLevel: 20,
        getCurrentLevel: () => gameState.influenceUpgrades?.prestigeBonus || 0,
        effect: (e) => 1 + 0.05 * e,
    },
    offlineEarnings: {
        id: "offlineEarnings",
        name: "Passive Income",
        description: "Boost offline earnings rate (+5% per level, starting at 25%)",
        icon: "💤",
        baseCost: 5,
        costIncrease: 1.35,
        maxLevel: 15,
        getCurrentLevel: () => gameState.influenceUpgrades?.offlineEarnings || 0,
        effect: (e) => Math.min(0.75, 0.25 + 0.05 * e),
    },
    relationshipGains: {
        id: "relationshipGains",
        name: "Charisma",
        description: "Gifts build relationships +10% faster per level",
        icon: "💖",
        baseCost: 5,
        costIncrease: 1.4,
        maxLevel: 25,
        getCurrentLevel: () => gameState.influenceUpgrades?.relationshipGains || 0,
        effect: (e) => 1 + 0.1 * e,
    },
    luckyStreak: {
        id: "luckyStreak",
        name: "Lucky Streak",
        description: "Random chance for 2x-5x income on product completion (+2% per level)",
        icon: "🍀",
        baseCost: 12,
        costIncrease: 1.5,
        maxLevel: 20,
        getCurrentLevel: () => gameState.influenceUpgrades?.luckyStreak || 0,
        effect: (e) => 0.02 * e,
    },
    employeeRetention: {
        id: "employeeRetention",
        name: "Employee Loyalty",
        description: "Keep +10% of employees after prestige per level",
        icon: "🤝",
        baseCost: 15,
        costIncrease: 1.7,
        maxLevel: 10,
        getCurrentLevel: () => gameState.influenceUpgrades?.employeeRetention || 0,
        effect: (e) => Math.min(1, 0.1 * e),
    },
    goldenParachute: {
        id: "goldenParachute",
        name: "Golden Parachute",
        description: "After prestige, your most expensive owned location starts unlocked",
        icon: "🪂",
        baseCost: 60,
        costIncrease: 1,
        maxLevel: 1,
        getCurrentLevel: () => gameState.influenceUpgrades?.goldenParachute || 0,
        effect: (e) => e,
    },
    institutionalMemory: {
        id: "institutionalMemory",
        name: "Institutional Memory",
        description: "Workforce perks survive prestige — the HR paperwork outlives the company",
        icon: "🗄️",
        baseCost: 35,
        costIncrease: 1,
        maxLevel: 1,
        getCurrentLevel: () => gameState.influenceUpgrades?.institutionalMemory || 0,
        effect: (e) => e,
    },
    procurementDesk: {
        id: "procurementDesk",
        name: "Procurement Desk",
        description: "Adds an Upgrade All (Max) action to the Business tab",
        icon: "🖇️",
        baseCost: 40,
        costIncrease: 1,
        maxLevel: 1,
        getCurrentLevel: () => gameState.influenceUpgrades?.procurementDesk || 0,
        effect: (e) => e,
    },
};
function calculateInfluenceGain() {
    const e = gameState.lifetimeEarnings - (gameState.lifetimeEarningsConverted || 0);
    let t = Math.floor(Math.sqrt(e / 1e4));
    const n = gameState.influenceUpgrades?.prestigeBonus || 0;
    if (n > 0) {
        const e = influenceUpgrades.prestigeBonus.effect(n);
        t = Math.floor(t * e);
    }
    return t;
}
function getInfluenceUpgradeCost(e) {
    const t = influenceUpgrades[e];
    if (!t) return 0;
    const n = t.getCurrentLevel();
    return n >= t.maxLevel ? 1 / 0 : Math.ceil(t.baseCost * Math.pow(t.costIncrease, n));
}
function purchaseInfluenceUpgrade(e) {
    const t = influenceUpgrades[e];
    if (!t) return !1;
    const n = t.getCurrentLevel();
    if (n >= t.maxLevel) return showNotification("Upgrade is at max level!"), !1;
    const a = getInfluenceUpgradeCost(e);
    return gameState.influencePoints < a
        ? (showNotification("Not enough Influence Points!"), !1)
        : ((gameState.influencePoints -= a),
          (gameState.influenceUpgrades[e] = n + 1),
          showNotification(`Upgraded ${t.name} to level ${n + 1}!`),
          updatePrestigeUI(),
          renderInfluenceUpgrades(),
          !0);
}
function renderInfluenceUpgrades() {
    const e = document.getElementById("influenceUpgradesContainer");
    e &&
        (e.innerHTML = Object.values(influenceUpgrades)
            .map((e) => {
                const t = e.getCurrentLevel(),
                    n = getInfluenceUpgradeCost(e.id),
                    a = t >= e.maxLevel,
                    o = !a && gameState.influencePoints >= n,
                    i = a
                        ? `<span class="badge upg-max">${1 === e.maxLevel ? "OWNED" : "MAXED"}</span>`
                        : `<button class="btn upg-buy num ${o ? "btn--primary" : "btn--outline"}" ${o ? "" : "disabled"} data-ipcost="${n}" onclick="purchaseInfluenceUpgrade('${e.id}')">${n} IP</button>`;
                return `<div class="upg-row${a ? " is-maxed" : ""}"><div class="upg-info"><div class="upg-name">${e.icon} ${e.name}</div><div class="upg-desc">${e.description}</div></div><div class="upg-state"><span class="pill num">${1 === e.maxLevel ? (t >= 1 ? "Acquired" : "One-time") : `Lv ${t}/${e.maxLevel}`}</span></div>${i}</div>`;
            })
            .join(""));
}
function updatePrestigeUI() {
    const e = document.getElementById("currentPrestigeLevel"),
        t = document.getElementById("lifetimeEarningsDisplay"),
        n = document.getElementById("currentInfluencePoints"),
        a = document.getElementById("currentMultiplier"),
        o = document.getElementById("nextPrestigeInfluence"),
        i = document.getElementById("prestigeRequirement");
    e && (e.textContent = gameState.prestigeLevel),
        t && (t.textContent = `$${formatNumber(gameState.lifetimeEarnings)}`),
        n && (n.textContent = gameState.influencePoints);
    const s = gameState.influenceUpgrades?.incomeMultiplier || 0,
        r = influenceUpgrades.incomeMultiplier.effect(s);
    a && (a.textContent = `${r.toFixed(1)}x`);
    const l = calculateInfluenceGain();
    o && (o.textContent = l);
    const c = gameState.lifetimeEarnings >= 1e5 && l > 0,
        d = document.getElementById("prestigeBtn");
    if (d)
        if (c) (d.disabled = !1), (d.style.opacity = "1"), (d.style.cursor = "pointer"), i && (i.textContent = "");
        else if (((d.disabled = !0), (d.style.opacity = "0.5"), (d.style.cursor = "not-allowed"), i)) {
            if (gameState.lifetimeEarnings < 1e5) {
                const e = 1e5 - gameState.lifetimeEarnings;
                i.textContent = `Requires $100k total earnings (need $${formatNumber(e)} more)`;
            } else {
                const e = gameState.lifetimeEarnings - (gameState.lifetimeEarningsConverted || 0),
                    t = Math.max(0, 1e4 - e);
                i.textContent = `Earn $${formatNumber(t)} more this run to gain Influence`;
            }
        }
}
function showPrestigeModal() {
    const e = calculateInfluenceGain();
    if (e <= 0 || gameState.lifetimeEarnings < 1e5)
        return void showNotification("You need at least $100k lifetime earnings to prestige!");
    const t = document.getElementById("prestigeModal"),
        n = document.getElementById("prestigeGainAmount");
    n && (n.textContent = `+${e}`), t && (t.style.display = "flex");
}
function executePrestige() {
    // Snapshot BEFORE any mutation. The counter bumps below happen before the heavy reads,
    // so a throw on an incomplete state (e.g. missing hrSettings) used to leave a half-prestiged
    // corrupt state (the "old group, 0 people" residue). On any failure we restore this snapshot.
    // Uses structuredClone (not JSON.stringify) because large saves — years of chat history,
    // galleries, social posts — can exceed the JS engine's max string length and throw
    // "RangeError: Invalid string length" before prestige even starts. structuredClone copies
    // the object graph natively with no intermediate string, so it has no such ceiling. It does
    // throw on function values, so strip the one place gameState can carry one (in-flight AI
    // request options — saveGameToSlot does this same strip pre-save) before cloning.
    if (gameState.pendingAIRequests?.text?.length)
        gameState.pendingAIRequests.text = gameState.pendingAIRequests.text.map((req) => ({
            ...req,
            options: req.options
                ? Object.fromEntries(Object.entries(req.options).filter(([, v]) => "function" != typeof v))
                : {},
        }));
    const __prestigeSnapshot = structuredClone(gameState);
    try {
    const e = calculateInfluenceGain();
    (gameState.influencePoints += e),
        (gameState.prestigeLevel += 1),
        (gameState.lifetimeEarningsConverted = gameState.lifetimeEarnings),
        (gameState.currentLifetimeIncome = 0);
    const t = gameState.influencePoints,
        n = gameState.prestigeLevel,
        a = gameState.lifetimeEarnings,
        o = gameState.lifetimeEarningsConverted,
        i = JSON.parse(JSON.stringify(gameState.influenceUpgrades || {})),
        s = JSON.parse(JSON.stringify(gameState.settings || {})),
        r = gameState.settings?.playerBio || "",
        l = JSON.parse(JSON.stringify(gameState.genderSettings || {})),
        c = JSON.parse(JSON.stringify(gameState.raceSettings || {})),
        __ssr = gameState.hrSettings?.startingStatRanges || {},
        d = {
            startingStatRanges: {
                productivity: { ...(__ssr.productivity || {}) },
                trust: { ...(__ssr.trust || {}) },
                friendship: { ...(__ssr.friendship || {}) },
                desire: { ...(__ssr.desire || {}) },
                comfort: { ...(__ssr.comfort || {}) },
                affection: { ...(__ssr.affection || {}) },
            },
        },
        p = {
            items: (gameState.giftInventory?.items || []).map((e) => ({ ...e })),
            capacity: gameState.giftInventory?.capacity || 1 / 0,
        },
        m = { items: (gameState.giftStore?.items || []).map((e) => ({ ...e })) },
        u = [...(gameState.givenUniqueGifts || [])],
        g = [...(gameState.createdUniqueGifts || [])];
    console.log(
        `🎁 Preserving ${p.items.length} inventory gifts and ${m.items.length} store gifts through prestige`
    );
    const h = JSON.parse(
            JSON.stringify(gameState.generationStats || { totalTextGenerations: 0, totalImageGenerations: 0 })
        ),
        y = JSON.parse(
            JSON.stringify(gameState.pregnancySettings || { duration: 14, minDuration: 7, maxDuration: 21 })
        ),
        f = JSON.parse(JSON.stringify(gameState.ethnicitySettings || {}));
    console.log(
        `📊 Preserving generation stats: ${h.totalTextGenerations} text, ${h.totalImageGenerations} images`
    );
    const retainedIds = new Set(),
        retentionLvl = gameState.influenceUpgrades?.employeeRetention || 0;
    if (retentionLvl > 0) {
        const e = gameState.employees.filter((e) => e && e.name && "active" === e.employmentStatus),
            t = Math.floor(e.length * influenceUpgrades.employeeRetention.effect(retentionLvl));
        e.sort((e, t) => calculateRelationshipStrength(t) - calculateRelationshipStrength(e))
            .slice(0, t)
            .forEach((e) => retainedIds.add(e.id));
        console.log(`🤝 Employee Loyalty: retaining ${retainedIds.size} of ${e.length} employees through prestige`);
    }
    gameState.employees.forEach((e) => {
        if (!e || "active" !== e.employmentStatus) return;
        try {
            salvageSocialForEmployee(e);
        } catch (t) {
            console.warn("[Prestige] Failed to salvage social images for", e.name, t);
        }
    });
    const b = JSON.parse(JSON.stringify(gameState.formerEmployees || [])),
        v = [];
    gameState.employees.forEach((e) => {
        if (!e || !e.name) return;
        const t = JSON.parse(JSON.stringify(e));
        if (retainedIds.has(t.id) && "active" === t.employmentStatus)
            return (t.productManaged = null), (t.productId = null), (t.managerOnboarding = !1), void v.push(t);
        (t.hired = !1),
            "active" === t.employmentStatus &&
                ((t.employmentStatus = "prestige_reset"),
                (t.departureDate = gameState.time?.currentTime || Date.now()),
                (t.prestigeResetLevel = n),
                (t.productManaged = null),
                (t.productId = null),
                t.career &&
                    ((t.career.previousLevel = t.career.level),
                    (t.career.previousTitle = t.career.title),
                    (t.career.level = 0),
                    (t.career.title = "Former Employee"))),
            v.push(t);
    }),
        console.log(`🎓 Preserved ${v.length} employees as alumni through prestige`);
    const w = JSON.parse(JSON.stringify(gameState.chatHistory || {}));
    console.log(`💬 Preserved chat history for ${Object.keys(w).length} conversations through prestige`);
    const preservedStory = gameState.story
        ? JSON.parse(JSON.stringify(gameState.story))
        : StoryEngine.getDefaultStoryState();
    const x = [];
    gameState.employees.forEach((e) => {
        if (!e || !e.name) return;
        if ("active" !== e.employmentStatus) return;
        if (retainedIds.has(e.id)) return;
        const t = calculateRelationshipStrength(e),
            a = calculateRehireBonus(e),
            o = {
                id: e.id,
                name: e.name,
                age: e.age,
                gender: e.gender,
                previousLevel: e.career?.level || 1,
                previousTitle: e.career?.title || "Staff",
                previousSalary: e.career?.salary || 1e5,
                promotionHistory: e.career?.promotionHistory ? [...e.career.promotionHistory] : [],
                skills: e.skills ? JSON.parse(JSON.stringify(e.skills)) : {},
                personality: JSON.parse(JSON.stringify(e.personality || {})),
                relationshipStrength: t,
                rehireBonus: a,
                memory: e.memory ? JSON.parse(JSON.stringify(e.memory)) : {},
                chatHistory: gameState.chatHistory[e.id]
                    ? JSON.parse(JSON.stringify(gameState.chatHistory[e.id]))
                    : [],
                physical: e.physical ? JSON.parse(JSON.stringify(e.physical)) : {},
                photos: e.photos ? JSON.parse(JSON.stringify(e.photos)) : [],
                profileImage: e.profileImage,
                bio: e.bio,
                keyTrait: e.keyTrait,
                personalityTraits: e.personalityTraits ? [...e.personalityTraits] : [],
                hobbies: e.hobbies ? [...e.hobbies] : [],
                kinks: e.kinks ? [...e.kinks] : [],
                productId: e.productId,
                productManaged: e.productManaged,
                giftPreferences: e.giftPreferences ? JSON.parse(JSON.stringify(e.giftPreferences)) : null,
                timesRehired: e.timesRehired || 0,
                originalHireDate: e.hireDate || Date.now(),
                lastPrestigeLevel: n,
            };
        x.push(o);
    }),
        console.log(`💼 Preserved ${x.length} employees to rehire pool`),
        gameState.employees.forEach((e) => {
            if (e.productManaged) {
                const t = b.findIndex((t) => t.originalId === (e.originalId || e.id)),
                    a = {
                        originalId: e.originalId || e.id,
                        name: e.name,
                        age: e.age,
                        gender: e.gender,
                        position: e.position,
                        productManaged: e.productManaged,
                        profileImage: e.profileImage,
                        bio: e.bio,
                        personality: e.personality,
                        personalityTraits: e.personalityTraits,
                        hobbies: e.hobbies,
                        kinks: e.kinks,
                        traits: e.traits,
                        keyTrait: e.keyTrait,
                        physical: e.physical,
                        chatHistory: gameState.chatHistory[e.id] || [],
                        photos: e.photos || [],
                        memory: e.memory,
                        stats: e.stats,
                        relationships: e.relationships,
                        intimacy: e.intimacy,
                        timesRehired: t >= 0 ? (b[t].timesRehired || 0) + 1 : 1,
                        lastPrestigeLevel: n,
                    };
                t >= 0 ? (b[t] = a) : b.push(a);
            }
        });
    const S = {
            website: 0,
            app: 80,
            consulting: 300,
            cloud: 1200,
            seo: 3e3,
            branding: 5e3,
            ecommerce: 8e3,
            automation: 12e3,
            copywriting: 0,
            video_editing: 2e4,
            marketing: 35e3,
            consulting_premium: 55e3,
            saas: 85e3,
            virtual_assistant: 12e4,
            social_media_mgmt: 18e4,
            online_courses: 25e4,
            business_coaching: 35e4,
            digital_marketing: 48e4,
            enterprise_saas: 0,
            enterprise_software: 7e5,
            api_marketplace: 12e5,
            white_label: 2e6,
            cybersecurity: 35e5,
            data_analytics: 55e5,
            crm_system: 85e5,
            ai_integration: 13e6,
            blockchain: 2e7,
            acquisitions: 3e7,
            custom_keychains: 0,
            branded_tshirts: 35e6,
            phone_cases: 6e7,
            custom_mugs: 1e8,
            tech_gadgets: 15e7,
            luxury_merch: 23e7,
            smart_devices: 35e7,
            wearables: 52e7,
            vr_headsets: 78e7,
            drones: 117e7,
            patent_licensing: 0,
            venture_capital: 15e8,
            hedge_fund: 25e8,
            market_manipulation: 4e9,
            insider_trading: 65e8,
            tax_havens: 1e10,
            lobbying: 15e9,
            government_contracts: 23e9,
            space_tourism: 35e9,
            quantum_computing: 5e10,
        },
        k = {
            website: 250,
            app: 750,
            consulting: 1500,
            cloud: 2500,
            seo: 4e3,
            branding: 6e3,
            ecommerce: 9e3,
            automation: 12500,
            copywriting: 17500,
            video_editing: 25e3,
            marketing: 35e3,
            consulting_premium: 5e4,
            saas: 75e3,
            virtual_assistant: 11e4,
            social_media_mgmt: 16e4,
            online_courses: 225e3,
            business_coaching: 325e3,
            digital_marketing: 45e4,
            enterprise_saas: 75e4,
            enterprise_software: 11e5,
            api_marketplace: 165e4,
            white_label: 25e5,
            cybersecurity: 375e4,
            data_analytics: 55e5,
            crm_system: 85e5,
            ai_integration: 13e6,
            blockchain: 2e7,
            acquisitions: 3e7,
            custom_keychains: 45e6,
            branded_tshirts: 7e7,
            phone_cases: 105e6,
            custom_mugs: 16e7,
            tech_gadgets: 24e7,
            luxury_merch: 36e7,
            smart_devices: 54e7,
            wearables: 81e7,
            vr_headsets: 1215e6,
            drones: 18225e5,
            patent_licensing: 273375e4,
            venture_capital: 4100625e3,
            hedge_fund: 6150937500,
            market_manipulation: 9226406250,
            insider_trading: 13839609375,
            tax_havens: 20759414062.5,
            lobbying: 31139121093.75,
            government_contracts: 46708681640.625,
            space_tourism: 70063022460.9375,
            quantum_computing: 105094533691.406,
        },
        T = influenceUpgrades.startingCash.effect(gameState.influenceUpgrades?.startingCash || 0),
        parachuteLocId =
            (gameState.influenceUpgrades?.goldenParachute || 0) > 0
                ? gameState.locations
                      .filter((e) => e.unlocked && "garage" !== e.id)
                      .sort((e, t) => (t.cost || 0) - (e.cost || 0))[0]?.id || null
                : null,
        C = {
            cash: gameBalance.startingCash + T,
            playerUpgrades: { clickPower: 0 },
            totalEarnings: 0,
            onboarding: [],
            lastPlayTime: Date.now(),
            prestigeLevel: n,
            influencePoints: t,
            lifetimeEarnings: a,
            lifetimeEarningsConverted: o,
            prestigeMultiplier: 1,
            influenceUpgrades: i,
            globalUpgrades: {
                clickPower: 0,
                incomeBoost: {},
                costReduction: {},
                goldenTouch: 0,
                timeDilation: 0,
                empireBuilder: 0,
                workforce:
                    (gameState.influenceUpgrades?.institutionalMemory || 0) > 0
                        ? JSON.parse(JSON.stringify(gameState.globalUpgrades?.workforce || {}))
                        : {},
                nightShift: {},
                expressPermit: {},
                keyholder: {},
                flagship: { locationId: null, moves: 0 },
            },
            bossFights: { active: null, defeated: [], history: [] },
            locations: gameState.locations.map((e) => ({
                ...e,
                owned: "garage" === e.id || e.id === parachuteLocId,
                unlocked: "garage" === e.id || e.id === parachuteLocId,
                products: [],
            })),
            activeLocationId: "garage",
            products: gameState.products.map((e) => ({
                id: e.id,
                name: e.name,
                locationId: e.locationId,
                nsfwLevel: e.nsfwLevel,
                valuePerUnit: e.valuePerUnit,
                baseUpgradeCost: e.baseUpgradeCost,
                costGrowth: e.costGrowth,
                valuePerUpgrade: e.valuePerUpgrade,
                valueExponent: e.valueExponent,
                baseTimeMs: e.baseTimeMs,
                clickSecondsBase: e.clickSecondsBase,
                managerHireCost: e.managerHireCost,
                managerUpgradeCost: void 0 !== k[e.id] ? k[e.id] : e.managerUpgradeCost,
                managerSpeedCapPct: e.managerSpeedCapPct,
                unlockCost: void 0 !== S[e.id] ? S[e.id] : e.unlockCost,
                quantity: 0,
                level: 0,
                upgradeCost: e.baseUpgradeCost,
                unlocked: !1,
                running: !1,
                timeRemainingMs: 0,
                managerHired: !1,
                managerLevel: 0,
            })),
            employees: v,
            hierarchyLevels: gameState.hierarchyLevels,
            corporateHierarchy: {
                levels: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] },
                executiveRoles: { COO: null, CFO: null },
            },
            corporatePyramid: {
                ceo: {
                    positionId: "ceo",
                    title: "CEO",
                    level: 7,
                    employeeId: "player",
                    subordinates: [],
                    isPlayer: !0,
                },
                secretaryPosition: {
                    positionId: "secretary",
                    title: "Executive Secretary",
                    level: 6.5,
                    employeeId: null,
                    reportsTo: "ceo",
                    subordinates: [],
                },
                positions: {
                    6: [
                        {
                            positionId: "senior_exec",
                            title: "Senior Executive",
                            level: 6,
                            employeeId: null,
                            reportsTo: "ceo",
                            subordinates: [],
                            span: 2,
                        },
                    ],
                    5: [
                        {
                            positionId: "cfo",
                            title: "Chief Financial Officer",
                            level: 5,
                            employeeId: null,
                            reportsTo: "senior_exec",
                            subordinates: [],
                            span: 2,
                        },
                        {
                            positionId: "coo",
                            title: "Chief Operating Officer",
                            level: 5,
                            employeeId: null,
                            reportsTo: "senior_exec",
                            subordinates: [],
                            span: 2,
                        },
                    ],
                    4: [
                        {
                            positionId: "branch_mgr_1",
                            title: "Branch Manager 1",
                            level: 4,
                            employeeId: null,
                            reportsTo: "cfo",
                            subordinates: [],
                            locationsManaged: [],
                            span: 3,
                        },
                        {
                            positionId: "branch_mgr_2",
                            title: "Branch Manager 2",
                            level: 4,
                            employeeId: null,
                            reportsTo: "cfo",
                            subordinates: [],
                            locationsManaged: [],
                            span: 3,
                        },
                        {
                            positionId: "branch_mgr_3",
                            title: "Branch Manager 3",
                            level: 4,
                            employeeId: null,
                            reportsTo: "coo",
                            subordinates: [],
                            locationsManaged: [],
                            span: 2,
                        },
                        {
                            positionId: "branch_mgr_4",
                            title: "Branch Manager 4",
                            level: 4,
                            employeeId: null,
                            reportsTo: "coo",
                            subordinates: [],
                            locationsManaged: [],
                            span: 1,
                        },
                    ],
                    3: [],
                    2: [],
                    1: [],
                },
                promotionCosts: { 1: 500, 2: 2e3, 3: 1e4, 4: 5e4, 5: 15e4, 6: 5e5, 7: 0 },
            },
            rehirePool: x,
            currentHiringCandidates: { newHires: [], rehires: [], productId: null, activeTab: "newHires" },
            globalIncomeMultiplier: 1,
            formerEmployees: b,
            socialNetwork: {
                posts: [],
                globalEvents: [],
                postIdCounter: 0,
                lastPostGeneration: 0,
                postGenerationInterval: 3e5,
                feedFilter: "all",
                feedSort: "recent",
                algorithm: {
                    sort: "foryou",
                    bestTimeFrame: "all",
                    contentRating: "all",
                    postType: "all",
                    author: "all",
                    engagement: "all",
                    searchQuery: "",
                },
                recentPostTypes: [],
                playerDraft: { caption: "", imagePrompt: "", altText: "", imageUrl: null },
            },
            companyContext: {
                totalEmployees: 0,
                locationEmployeeCounts: {},
                recentHires: [],
                recentFires: [],
                recentPromotions: [],
                interdepartmentalEvents: [],
            },
            socialFeed: [],
            socialStats: { totalPosts: 0, totalLikes: 0, totalComments: 0 },
            chatHistory: w,
            activeChat: null,
            news: [
                "Tech startup raises $1M in seed funding",
                "New productivity app trends in office spaces",
                "Remote work policies reshape company cultures",
                "AI integration boosts efficiency across industries",
            ],
            settings: { ...s, playerBio: r },
            genderSettings: l,
            raceSettings: c,
            hrSettings: d,
            giftInventory: p,
            giftStore: m,
            givenUniqueGifts: u,
            createdUniqueGifts: g,
            currentLifetimeIncome: 0,
            aiQuality: gameState.aiQuality || {
                goodExamples: { posts: [], comments: [], chats: [] },
                badExamples: { posts: [], comments: [], chats: [] },
                bannedPatterns: [],
                stats: { totalVotes: 0, upvotes: 0, downvotes: 0, postsVoted: 0, commentsVoted: 0, chatsVoted: 0 },
                maxExamplesPerType: 20,
                tutorialShown: !1,
            },
            generationStats: h,
            pregnancySettings: y,
            ethnicitySettings: f,
            time: {
                enabled: !0,
                currentTime: Date.now(),
                timeScale: gameState.time?.timeScale ?? 20,
                baseTimeScale: gameState.time?.baseTimeScale ?? 20,
                lastHour: null,
                lastDay: null,
                paused: !1,
                timeDilation: {
                    enabled: !0,
                    conversationScale: 1,
                    groupChatScale: 2,
                    socialBrowsingScale: 10,
                    idleScale: null,
                },
                activeContext: "idle",
            },
            pendingAIRequests: { text: [], image: [] },
            lastInteractionTime: Date.now(),
            pageHiddenTime: null,
            offlineEarnings: { enabled: !0, maxDuration: 288e5, rate: 0.25, lastPlayedRealTime: Date.now() },
            payroll: {
                enabled: !0,
                lastPayday: null,
                totalPaidThisWeek: 0,
                weeklyPayrollHistory: [],
                autoPayEnabled: !0,
                delayedWeeks: 0,
                bonusPool: 0,
            },
            loans: [],
            raiseRequests: [],
            companyEvents: {
                active: [],
                history: [],
                nextEventCheck: Date.now(),
                eventChance: 0.15,
                eventsThisWeek: 0,
            },
            npcScheduledEvents: [],
            performanceTracking: {
                enabled: !0,
                lastUpdate: Date.now(),
                weeklyReviews: [],
                topPerformersHistory: [],
            },
            bossImages: {},
            bossFightSettings: gameState.bossFightSettings || {
                difficulty: "normal",
                largerButtons: !1,
                highContrastIndicators: !1,
                screenShakeIntensity: 1,
                reducedFlashing: !1,
            },
            groups: [],
            activeGroup: null,
            groupSpeakerQueue: [],
            gifts: gameState.gifts || [
                {
                    id: "coffee",
                    name: "Coffee",
                    cost: 10,
                    effect: { productivity: 5 },
                    description: "Boosts productivity",
                },
                {
                    id: "giftcard",
                    name: "Gift Card",
                    cost: 50,
                    effect: { affection: 10 },
                    description: "Increases affection",
                },
                { id: "lunch", name: "Lunch", cost: 30, effect: { comfort: 15 }, description: "Improves comfort" },
                {
                    id: "bonus",
                    name: "Cash Bonus",
                    cost: 100,
                    effect: { desire: 20 },
                    description: "Raises desire",
                },
            ],
            playerProfile: gameState.playerProfile || {
                companyName: "",
                firstName: "",
                lastName: "",
                age: null,
                gender: "",
                race: "human",
                ethnicity: "",
                physical: {
                    heightBuild: "",
                    hair: { color: "", style: "", length: "", texture: "" },
                    eyes: { color: "", shape: "" },
                    face: { shape: "", nose: "", lips: "", cheekbones: "", jawline: "", facialHair: "" },
                    skin: { tone: "", texture: "" },
                    body: { shape: "", chestSize: "", chestDescriptor: "chest", buttSize: "", legs: "" },
                    genitals: [],
                    fashion: "",
                    accessories: "",
                    distinguishingFeature: "",
                },
                personality: "",
                personalityTraits: [],
                hobbies: [],
                likes: [],
                dislikes: [],
                kinks: [],
                skinTone: "",
                height: "",
                bodyType: "",
                hairColor: "",
                hairStyle: "",
                eyeColor: "",
                facialHair: "",
                genitalType: "",
                genitalDetails: "",
                chestSize: "",
                buildDetails: "",
                additionalDetails: "",
            },
            aiContextQuality: {
                employeeTracking: {},
                vocabularyBanks: gameState.aiContextQuality?.vocabularyBanks || {},
                intimacyEscalation: {},
                repetitionWindow: 3,
                maxSameAction: 1,
                maxSameAnchor: 2,
                maxSameSlang: 2,
            },
            flagDetection: {
                tracking: {},
                suggestions: [],
                settings: gameState.flagDetection?.settings || {
                    enabled: !0,
                    sensitivity: "medium",
                    aiAssist: !0,
                    autoApprove: [],
                },
            },
            flagChains: { active: [], suggestions: [], definitions: gameState.flagChains?.definitions || {} },
            children: [],
            typingStates: {},
            companyWideContext: { currentBuzz: [], lastUpdate: Date.now(), maxItems: 40, decayTime: 6048e5 },
            activeTab: "dashboard",
            upgradeMultiplier: 1,
        };
    Object.keys(gameState).forEach((e) => delete gameState[e]),
        Object.assign(gameState, C),
        (gameState.story = preservedStory),
        "function" == typeof initializeHierarchicalPyramid && initializeHierarchicalPyramid(),
        // The reset gameState above wipes bossFights down to {active, defeated, history} —
        // generatedBosses (the image cache) is gone — and locations get re-unlocked directly
        // in that object literal rather than through unlockLocation(), so the normal
        // onLocationUnlocked() boss-pregeneration trigger never fires either. Without this,
        // the first 1-2 post-prestige locations show a broken placeholder boss image.
        "function" == typeof initializeBossImages && initializeBossImages();
    const E = document.getElementById("prestigeModal");
    E && (E.style.display = "none"),
        saveGame(!1, !0),
        updateUI(),
        updatePrestigeUI(),
        renderInfluenceUpgrades(),
        "function" == typeof renderSocialFeed && renderSocialFeed(!0);
    const $ = p.items.length + m.items.length,
        I = v.length - retainedIds.size;
    if (
        (showNotification(
            `✨ Prestiged! Gained ${e} Influence Points!${retainedIds.size > 0 ? ` 🤝 ${retainedIds.size} loyal employees stayed!` : ""}${I > 0 ? ` 🎓 ${I} employees moved to Alumni!` : ""}${$ > 0 ? ` 🎁 ${$} gifts preserved!` : ""}`,
            5e3
        ),
        "function" == typeof onStoryPrestige)
    )
        try {
            onStoryPrestige(n);
        } catch (e) {
            console.warn("[Story] Prestige hook error:", e);
        }
    switchTab("dashboard"),
        setTimeout(() => {
            // Deferred refresh runs outside the try below — contain render errors here too.
            try {
                updateDashboard(), refreshDashboardSections(), updateBusinessTab(), updatePeopleTab();
            } catch (e) {
                console.error("[Prestige] Post-prestige UI refresh error (non-fatal):", e);
            }
        }, 100);
    setTimeout(maybeShowDiscordPromo, 600);
    } catch (err) {
        // Restore the pre-prestige snapshot so the bumped counters (influence/level) and any
        // partial state never persist. Same wipe-and-reassign idiom used elsewhere in the file.
        console.error("[Prestige] executePrestige failed — rolling back:", err),
            Object.keys(gameState).forEach((k) => delete gameState[k]),
            Object.assign(gameState, __prestigeSnapshot),
            showNotification("❌ Prestige failed — no changes were made. Try reloading your save.", "error", 7e3);
        const E = document.getElementById("prestigeModal");
        E && (E.style.display = "none");
    }
}
gameState.influenceUpgrades ||
    ((gameState.influenceUpgrades = {}),
    Object.keys(influenceUpgrades).forEach((e) => {
        gameState.influenceUpgrades[e] = 0;
    }));
// ─── Curated snapshot engine ────────────────────────────────────────────────
// Snapshot slots are named fuoc_save_autosave_snap_<ms>. A lightweight manifest in
// gameState.autosaveTracking.snapshots ([{slot, playTime, saveDate, bytes}]) lets us
// thin the pool without reading every slot from KV each cadence.
function isManagedSnapshotSlot(e) {
    // New timestamped snapshots, plus legacy autosave_0..9 rotation slots.
    return /^autosave_snap_\d+$/.test(e) || /^autosave_\d+$/.test(e);
}
function getSnapshotManifest() {
    const e = gameState.autosaveTracking || (gameState.autosaveTracking = {});
    return Array.isArray(e.snapshots) || (e.snapshots = []), e.snapshots;
}
function fmtKB(e) {
    return `${(((+e || 0) / 1024) | 0).toLocaleString()} KB`;
}
function fmtPlayClock(e) {
    const t = Math.max(0, Math.floor((+e || 0) / 1e3)),
        n = Math.floor(t / 3600),
        a = Math.floor((t % 3600) / 60);
    return `${n}:${String(a).padStart(2, "0")}`;
}
// Rebuild the manifest from what's actually in KV. Folds in legacy autosave_N slots;
// legacy entries without a recorded playTime are treated as oldest (playTime 0) so
// they age out gracefully under SNAPSHOT_MIN_KEEP protection.
async function reconcileSnapshotManifest() {
    try {
        const e = (await kv.gameSave.keys()) || [],
            t = [];
        for (const n of e) {
            if (!n.startsWith("fuoc_save_")) continue;
            const a = n.replace("fuoc_save_", "");
            if (!isManagedSnapshotSlot(a)) continue;
            const o = await kv.gameSave.get(n);
            if (!o) continue;
            const i = o.meta || {};
            t.push({
                slot: a,
                playTime: "number" == typeof i.playTime ? i.playTime : 0,
                saveDate: i.saveDate || new Date().toISOString(),
                bytes: "number" == typeof i.bytes ? i.bytes : estimateSize(o),
            });
        }
        t.sort((e, t) => t.playTime - e.playTime || new Date(t.saveDate) - new Date(e.saveDate)),
            (gameState.autosaveTracking = gameState.autosaveTracking || {}),
            (gameState.autosaveTracking.snapshots = t),
            bootLog(`Snapshot manifest reconciled: ${t.length} snapshot(s), ${fmtKB(t.reduce((e, t) => e + (t.bytes || 0), 0))} total`);
    } catch (e) {
        bootLog(`Snapshot reconcile failed (non-fatal): ${String((e && e.message) || e)}`);
    }
}
// Decide which manifest entries to keep, then return the rest to delete from KV.
// Uses absolute-time bucketing per tier: keep the NEWEST snapshot in each bucket
// (bucket = floor(playTime / tier.minSpacing)). Bucketing on absolute playTime is
// stable as time advances — a kept representative stays kept until it ages into a
// coarser tier, where it merges into a wider bucket and the newest survivor wins.
// (A naive "greedy spacing from newest" thins correctly at one instant but deletes
// snapshots the moment they cross a tier edge, so coarse tiers never fill.)
function computeSnapshotEvictions(e, t) {
    const n = [...e].sort((e, t) => t.playTime - e.playTime); // newest first
    if (n.length <= 1) return [];
    const a = [], // kept
        o = [], // evicted
        r = new Set(); // seen bucket ids
    let l = 0;
    for (const e of n) {
        const n = t - e.playTime, // age in gameplay ms
            s = SNAPSHOT_TIERS.findIndex((e) => n <= e.maxAge);
        if (-1 === s) {
            // Older than the oldest tier (>24h of play): keep only to satisfy MIN_KEEP.
            l < SNAPSHOT_MIN_KEEP ? (a.push(e), l++) : o.push(e);
            continue;
        }
        const i = `${s}:${Math.floor(e.playTime / SNAPSHOT_TIERS[s].minSpacing)}`;
        r.has(i) ? o.push(e) : (r.add(i), a.push(e), l++);
    }
    a.sort((e, t) => t.playTime - e.playTime);
    // Hard count cap: drop oldest kept beyond the cap.
    for (; a.length > SNAPSHOT_MAX_COUNT; ) o.push(a.pop());
    // Byte budget: drop oldest kept until under budget, but never below MIN_KEEP.
    let s = a.reduce((e, t) => e + (t.bytes || 0), 0);
    for (; s > SNAPSHOT_BYTE_BUDGET && a.length > SNAPSHOT_MIN_KEEP; ) {
        const e = a.pop();
        (s -= e.bytes || 0), o.push(e);
    }
    return o;
}
async function pruneSnapshots() {
    const e = getSnapshotManifest(),
        t = gameState.totalPlayTime || 0,
        n = computeSnapshotEvictions(e, t);
    if (n.length) {
        const t = new Set(n.map((e) => e.slot));
        for (const e of n)
            try {
                await kv.gameSave.delete(`fuoc_save_${e.slot}`);
            } catch (t) {
                console.warn(`[Snapshot] Failed to delete evicted slot ${e.slot}:`, t);
            }
        (gameState.autosaveTracking.snapshots = e.filter((e) => !t.has(e.slot))), scheduleImageGc("snapshot rotation");
    }
    return n.map((e) => e.slot);
}
// Distribution actually achieved, for logging / debug.
function snapshotTierCounts() {
    const e = getSnapshotManifest(),
        t = gameState.totalPlayTime || 0,
        n = { lastMin: 0, last10: 0, lastHour: 0, lastDay: 0, older: 0 };
    for (const a of e) {
        const e = t - a.playTime;
        e <= 6e4 && n.lastMin++, e <= 6e5 && n.last10++, e <= 36e5 && n.lastHour++, e <= 864e5 && n.lastDay++, e > 864e5 && n.older++;
    }
    return n;
}
// Take one curated snapshot: write a fresh slot, record it, prune, log size + pool.
async function recordSnapshot() {
    const e = `autosave_snap_${Date.now()}`,
        t = gameState.totalPlayTime || 0;
    let n;
    try {
        n = await saveGameToSlot(e, "auto", !1);
    } catch (t) {
        // QuotaExceededError: shrink the pool aggressively and retry once.
        if ("QuotaExceededError" === t?.name || t?.message?.includes("QuotaExceededError")) {
            console.warn("[Snapshot] Storage full — evicting oldest snapshot(s) and retrying.");
            const e = getSnapshotManifest().sort((e, t) => e.playTime - t.playTime).slice(0, 3);
            for (const t of e)
                try {
                    await kv.gameSave.delete(`fuoc_save_${t.slot}`);
                } catch (e) {}
            const t = new Set(e.map((e) => e.slot));
            gameState.autosaveTracking.snapshots = getSnapshotManifest().filter((e) => !t.has(e.slot));
            try {
                n = await saveGameToSlot(`autosave_snap_${Date.now()}`, "auto", !1);
            } catch (e) {
                return void console.error("[Snapshot] Retry after eviction failed:", e);
            }
        } else return void console.error("[Snapshot] Write failed:", t);
    }
    if (!n) return; // blocked by GUARD 1/2 (save system not ready / blank state)
    const a = n.meta?.bytes || estimateSize(n),
        o = getSnapshotManifest();
    o.unshift({ slot: n.meta?.saveName || e, playTime: t, saveDate: n.meta?.saveDate || new Date().toISOString(), bytes: a });
    const i = await pruneSnapshots(),
        s = getSnapshotManifest(),
        r = s.reduce((e, t) => e + (t.bytes || 0), 0),
        l = snapshotTierCounts();
    console.log(
        `[Snapshot] 📸 ${e} | ${fmtKB(a)} | pool: ${s.length} snaps, ${fmtKB(r)} total | playtime ${fmtPlayClock(t)} | tiers ⟨1m:${l.lastMin} 10m:${l.last10} 1h:${l.lastHour} 24h:${l.lastDay}⟩` +
            (i.length ? ` | evicted ${i.length}` : "")
    );
}
// Console helper: on-demand report of pool size / footprint / tier spread.
function snapshotReport() {
    const e = getSnapshotManifest(),
        t = e.reduce((e, t) => e + (t.bytes || 0), 0),
        n = e.reduce((e, t) => Math.max(e, t.bytes || 0), 0),
        a = snapshotTierCounts();
    return (
        console.log(
            `[Snapshot Report] ${e.length} snapshots | total ${fmtKB(t)} | avg ${fmtKB(e.length ? t / e.length : 0)} | largest ${fmtKB(n)} | budget ${fmtKB(SNAPSHOT_BYTE_BUDGET)}`
        ),
        console.log(`[Snapshot Report] distribution → last 1m:${a.lastMin}  10m:${a.last10}  1h:${a.lastHour}  24h:${a.lastDay}  older:${a.older}`),
        console.table(
            e.map((e) => ({
                slot: e.slot,
                ageOfPlay: fmtPlayClock((gameState.totalPlayTime || 0) - e.playTime),
                size: fmtKB(e.bytes),
                savedAt: e.saveDate,
            }))
        ),
        { count: e.length, totalBytes: t, tiers: a }
    );
}
let autosaveIntervalId = null;
function setupAutosave() {
    autosaveIntervalId && (clearInterval(autosaveIntervalId), (autosaveIntervalId = null)),
        gameState.settings.autosave &&
            (gameState.autosaveTracking ||
                (gameState.autosaveTracking = { lastSnapshotPlayTime: 0, snapshots: [] }),
            Array.isArray(gameState.autosaveTracking.snapshots) ||
                (gameState.autosaveTracking.snapshots = []),
            "number" != typeof gameState.autosaveTracking.lastSnapshotPlayTime &&
                (gameState.autosaveTracking.lastSnapshotPlayTime = 0),
            (autosaveIntervalId = setInterval(async () => {
                const e = gameState.autosaveTracking || (gameState.autosaveTracking = { lastSnapshotPlayTime: 0, snapshots: [] });
                // Keep the live "autosave" slot fresh every tick (boot-load target).
                await saveGameToSlot("autosave", "auto", !1);
                // Take a curated snapshot every SNAPSHOT_BASE_MS of *gameplay* time.
                // Gating on totalPlayTime means snapshots pause when the tab is hidden.
                const t = gameState.totalPlayTime || 0;
                t - (e.lastSnapshotPlayTime || 0) >= SNAPSHOT_BASE_MS &&
                    ((e.lastSnapshotPlayTime = t), await recordSnapshot());
            }, 5e3)));
}
function exportSave() {
    try {
        const e = {
                version: "250116200000",
                timestamp: gameState.time?.currentTime || Date.now(),
                date: new Date().toISOString(),
                gameState: gameState,
            },
            parts = buildSaveBlobParts(e),
            n = `FreeUseOffice-Save-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
        try {
            const e = new Blob(parts, { type: "application/json" }),
                a = URL.createObjectURL(e),
                o = document.createElement("a");
            (o.href = a),
                (o.download = n),
                document.body.appendChild(o),
                o.click(),
                document.body.removeChild(o),
                URL.revokeObjectURL(a),
                showNotification(`💾 Save exported: ${n}`, "success");
        } catch (e) {
            // Fallback only — clipboard/textarea need one real string, so this can still
            // hit the same string-length ceiling on a very large save. That's an acceptable
            // last resort here since the primary chunked Blob path above already succeeds
            // for the normal case; if this join itself throws, fail with a clear message
            // instead of an uncaught crash.
            console.log("Download failed, trying clipboard fallback...", e);
            let t;
            try {
                t = parts.join("");
            } catch (joinErr) {
                console.error("Clipboard fallback also failed (save too large to join):", joinErr),
                    showNotification(
                        "❌ Save too large to export via fallback. Try Save Manager → export a trimmed slot instead.",
                        "error",
                        8e3
                    );
                return;
            }
            navigator.clipboard && navigator.clipboard.writeText
                ? navigator.clipboard
                      .writeText(t)
                      .then(() => {
                          showNotification(
                              "📋 Save data copied to clipboard! Paste it into a text file to save.",
                              "success",
                              5e3
                          );
                      })
                      .catch((e) => {
                          console.log("Clipboard failed, showing modal...", e), showExportModal(t, n);
                      })
                : showExportModal(t, n);
        }
    } catch (e) {
        console.error("Error exporting save:", e), showNotification("❌ Failed to export save!", "error");
    }
}
function showExportModal(e, t) {
    const n = document.createElement("div");
    (n.style.cssText =
        "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-90); z-index:10000; display:flex; align-items:center; justify-content:center; padding:20px;"),
        (n.innerHTML = `\n      <div style="background:var(--surface); border-radius:12px; padding:20px; max-width:600px; width:100%; max-height:90vh; overflow:auto;">\n        <h3 style="margin:0 0 15px 0; color:var(--accent);">📋 Export Save Data</h3>\n        <p style="color:var(--text-dim); font-size:0.9rem; margin:0 0 15px 0;">\n          Copy this text and save it to a file named: <strong style="color:var(--l-ink);">${t}</strong>\n        </p>\n        <textarea readonly style="width:100%; height:300px; background:var(--bg); border:1px solid var(--l-line); border-radius:6px; color:var(--l-ink); padding:10px; font-family:monospace; font-size:0.85rem; resize:vertical;">${e}</textarea>\n        <div style="display:flex; gap:10px; margin-top:15px;">\n          <button onclick="navigator.clipboard.writeText(this.parentElement.parentElement.querySelector('textarea').value).then(() => showNotification('📋 Copied to clipboard!', 'success')).catch(() => showNotification('❌ Copy failed', 'error'))" style="flex:1; padding:12px; background:var(--l-green); border:none; border-radius:8px; color:var(--l-on-accent); font-weight:600; cursor:pointer;">\n            📋 Copy to Clipboard\n          </button>\n          <button onclick="this.closest('div[style*="position:fixed"]').remove()" style="flex:1; padding:12px; background:var(--l-red); border:none; border-radius:8px; color:var(--l-ink-on-fill); font-weight:600; cursor:pointer;">\n            Close\n          </button>\n        </div>\n      </div>\n    `),
        document.body.appendChild(n);
    n.querySelector("textarea").select(),
        showNotification("💾 Save data ready! Copy and paste into a text file.", "info", 5e3);
}
function importSave() {
    const e = document.getElementById("importFileInput");
    e ? e.click() : showNotification("❌ Import system not available!", "error");
}
function handleImportedFile(e) {
    const t = e.target.files[0];
    if (!t) return;
    const n = new FileReader();
    (n.onload = async function (t) {
        try {
            const e = t.target.result,
                n = JSON.parse(e);
            if (!n.gameState)
                return void (void 0 !== n.cash && void 0 !== n.products
                    ? (await showConfirm(
                          "This appears to be an old save format. Import anyway? (May cause issues)",
                          "Old Save Format",
                          { type: "warning", confirmText: "Import Anyway" }
                      )) && (await loadSaveData(n))
                    : showNotification("❌ Invalid save file format!", "error"));
            const a = n.date ? new Date(n.date).toLocaleString() : "Unknown",
                o = n.gameState.cash ? formatCash(n.gameState.cash) : "Unknown",
                i = n.gameState.employees ? n.gameState.employees.length : 0,
                s = `💰 Money: ${o}\n👥 Employees: ${i}\n✨ Prestige Level: ${n.gameState.prestigeLevel || 0}\n📅 Save Date: ${a}\n\n⚠️ This will overwrite your current progress!`;
            (await showConfirm(s, "📥 Import Save File?", { type: "warning" })) &&
                (await loadSaveData(n.gameState), showNotification("✅ Save imported successfully!", "success"));
        } catch (e) {
            console.error("Error importing save:", e),
                showNotification("❌ Failed to import save! File may be corrupted.", "error");
        }
        e.target.value = "";
    }),
        (n.onerror = function () {
            showNotification("❌ Failed to read file!", "error");
        }),
        n.readAsText(t);
}
async function loadSaveData(e) {
    try {
        if (!e || "object" != typeof e) throw new Error("Invalid save data structure");
        // structuredClone, not JSON.stringify — large saves can exceed the JS engine's max
        // string length here too (same failure mode as the prestige snapshot). Strip the one
        // place gameState can carry a function value (in-flight AI request options) first.
        if (gameState.pendingAIRequests?.text?.length)
            gameState.pendingAIRequests.text = gameState.pendingAIRequests.text.map((req) => ({
                ...req,
                options: req.options
                    ? Object.fromEntries(Object.entries(req.options).filter(([, v]) => "function" != typeof v))
                    : {},
            }));
        const t = structuredClone(gameState);
        Object.keys(gameState).forEach((e) => delete gameState[e]),
            Object.assign(gameState, t, e, {
                hierarchyLevels: t.hierarchyLevels,
                settings: { ...t.settings, ...(e.settings || {}) },
                time: { ...t.time, ...(e.time || {}), currentTime: e.time?.currentTime || t.time?.currentTime },
                socialNetwork: {
                    ...t.socialNetwork,
                    ...(e.socialNetwork || {}),
                    algorithm: { ...t.socialNetwork?.algorithm, ...(e.socialNetwork?.algorithm || {}) },
                },
                bossFights: { ...t.bossFights, ...(e.bossFights || {}) },
                globalUpgrades: { ...t.globalUpgrades, ...(e.globalUpgrades || {}) },
                playerProfile: { ...t.playerProfile, ...(e.playerProfile || {}) },
                companyContext: { ...t.companyContext, ...(e.companyContext || {}) },
                companyWideContext: { ...t.companyWideContext, ...(e.companyWideContext || {}) },
            }),
            gameState.usedEmployeeNames &&
                Array.isArray(gameState.usedEmployeeNames) &&
                (gameState.usedEmployeeNames = new Set(gameState.usedEmployeeNames)),
            gameState.blockedProactiveMessages &&
                Array.isArray(gameState.blockedProactiveMessages) &&
                (gameState.blockedProactiveMessages = new Set(gameState.blockedProactiveMessages)),
            gameState.recentTopics &&
                !gameState.recentTopics.has &&
                (gameState.recentTopics = new Map(Object.entries(gameState.recentTopics))),
            Array.isArray(gameState.employees) &&
                gameState.employees.forEach((e) => {
                    if (
                        ("function" == typeof initializeEmployeeSocialData && initializeEmployeeSocialData(e),
                        "function" == typeof ensureEmployeeMemory && ensureEmployeeMemory(e),
                        e.giftPreferences ||
                            "function" != typeof generateGiftPreferences ||
                            (e.giftPreferences = generateGiftPreferences()),
                        e.career ||
                            (e.career = {
                                level: 1,
                                title: gameState.hierarchyLevels?.[1]?.title || "Staff",
                                salary: gameState.hierarchyLevels?.[1]?.baseSalary || 1e5,
                                startDate: e.hireDate || Date.now(),
                                promotionHistory: [],
                                directReports: [],
                                managerId: null,
                            }),
                        e.career)
                    )
                        e.career.salary > 0 || (e.career.salary = getMarketRate(e)); // see loadGame: never reset to baseSalary
                }),
            repairFlatSalaries(),
            console.log("[LoadSave] Merged save data with default state (migration-safe)"),
            gameState.autosaveTracking ||
                ((gameState.autosaveTracking = {
                    lastSnapshotTime: Date.now(),
                    currentSlotIndex: 0,
                    snapshotIntervalMinutes: 5,
                }),
                console.log("[LoadSave] Restored missing autosaveTracking")),
            (gameState.flagDetection && "object" == typeof gameState.flagDetection) ||
                ((gameState.flagDetection = { tracking: {}, suggestions: [], settings: {} }),
                console.log("[LoadSave] Restored missing flagDetection"));
        {
            const e = gameState.flagDetection;
            (e.tracking && "object" == typeof e.tracking) || (e.tracking = {}),
                Array.isArray(e.suggestions) || (e.suggestions = []),
                (e.settings && "object" == typeof e.settings) || (e.settings = {}),
                void 0 === e.settings.enabled && (e.settings.enabled = !0),
                e.settings.sensitivity || (e.settings.sensitivity = "medium"),
                void 0 === e.settings.aiAssist && (e.settings.aiAssist = !0),
                Array.isArray(e.settings.autoApprove) || (e.settings.autoApprove = []);
        }
        gameState.socialNetwork?.posts &&
            Array.isArray(gameState.socialNetwork.posts) &&
            (gameState.socialNetwork.posts.forEach((e) => {
                Array.isArray(e.likes) || (e.likes = []),
                    Array.isArray(e.comments) || (e.comments = []),
                    Array.isArray(e.dislikes) || (e.dislikes = []);
            }),
            console.log("[LoadSave] Validated social post arrays")),
            Array.isArray(gameState.employees) &&
                gameState.employees.forEach((e) => {
                    e.flags &&
                        (Array.isArray(e.flags.systemFlags) || (e.flags.systemFlags = []),
                        Array.isArray(e.flags.customFlags) || (e.flags.customFlags = []));
                }),
            gameState.settings ||
                ((gameState.settings = { autosave: !0, maxAiRequests: 15, maxImageRequests: 8 }),
                console.log("[LoadSave] Restored missing settings")),
            gameState.settings.autoVisualization
                ? (void 0 === gameState.settings.autoVisualization.customPrompt &&
                      (gameState.settings.autoVisualization.customPrompt = ""),
                  void 0 === gameState.settings.autoVisualization.addToGallery &&
                      (gameState.settings.autoVisualization.addToGallery = !0),
                  void 0 === gameState.settings.autoVisualization.cooldownAfterManual &&
                      (gameState.settings.autoVisualization.cooldownAfterManual = !0),
                  void 0 === gameState.settings.autoVisualization.intensityDetection &&
                      (gameState.settings.autoVisualization.intensityDetection = !1),
                  void 0 === gameState.settings.autoVisualization.intensityThreshold &&
                      (gameState.settings.autoVisualization.intensityThreshold = 50))
                : ((gameState.settings.autoVisualization = {
                      enabled: !1,
                      minFrequency: 5,
                      maxFrequency: 10,
                      style: "global",
                      perspective: "dynamic",
                      nsfwLevel: "match",
                      customPrompt: "",
                      addToGallery: !0,
                      cooldownAfterManual: !0,
                      intensityDetection: !1,
                      intensityThreshold: 50,
                      totalGenerated: 0,
                  }),
                  console.log("[LoadSave] Added missing autoVisualization settings"));
        // A player-initiated load (Save Manager / import) is an explicit, trusted
        // populate of gameState — clear any boot-time failure hold and re-arm autosave.
        (saveSystemReady = !0),
            (loadFailedNoOverwrite = !1),
            (intentionalNewGame = !1),
            (sessionBackupDone = !0),
            bootLog("Save loaded via Save Manager / import — save system READY", gameStateSummary());
        // Make the loaded game the live one right away, so a reload continues from it.
        try {
            // Not skippable like a timer autosave: wait out one in flight and the throttle.
            for (; saveInProgress; ) await new Promise((e) => setTimeout(e, 50));
            (lastSaveTime = 0), await saveGameToSlot("autosave", "auto", !1);
        } catch (e) {
            console.warn("[LoadSave] Storage save failed, but load continuing:", e);
        }
        return (
            updateUI(),
            updatePrestigeUI(),
            renderInfluenceUpgrades(),
            switchTab("dashboard"),
            setTimeout(() => {
                // This deferred refresh runs OUTSIDE the load try/catch — a render error on
                // imperfect save data would otherwise escape as an uncaught exception (the
                // "crash on load" report). Contain it so the load itself stays successful.
                try {
                    updateDashboard(),
                        refreshDashboardSections(),
                        updateBusinessTab(),
                        updatePeopleTab(),
                        updateSocialTab();
                    const e = $("customCompanyContext"),
                        t = $("customWorldContext"),
                        n = $("customAIContext");
                    e &&
                        gameState.settings?.customContext?.company &&
                        (e.value = gameState.settings.customContext.company),
                        t &&
                            gameState.settings?.customContext?.world &&
                            (t.value = gameState.settings.customContext.world),
                        n &&
                            gameState.settings?.customContext?.aiNotes &&
                            (n.value = gameState.settings.customContext.aiNotes);
                } catch (e) {
                    console.error("[LoadSave] Post-load UI refresh error (non-fatal):", e),
                        showNotification("⚠️ Save loaded, but a panel failed to refresh.", "warning", 5e3);
                }
            }, 100),
            setupAutosave(),
            void 0 !== AIRequestQueue &&
                gameState.settings &&
                (AIRequestQueue.updateMaxConcurrent(gameState.settings.maxAiRequests || 15),
                console.log("[LoadSave] Reinitialized AI Request Queue")),
            !0
        );
    } catch (e) {
        return (
            console.error("Error loading save data:", e),
            e.message?.includes("QuotaExceededError")
                ? showNotification("💾 Storage full! Game loaded but autosave disabled.", "warning", 8e3)
                : e.message?.includes("tracking is undefined")
                  ? showNotification("🔧 Save data repaired automatically.", "success", 4e3)
                  : showNotification("❌ Failed to load save data!", "error"),
            !1
        );
    }
}
async function resetGame() {
    if (
        await showConfirm(
            "Are you sure you want to reset the game? This will start a fresh game, but your saved games will remain available in the Save Manager.",
            "Reset Game",
            { type: "danger", confirmText: "Reset" }
        )
    )
        try {
            (isResetting = !0),
                autosaveIntervalId && (clearInterval(autosaveIntervalId), (autosaveIntervalId = null)),
                await new Promise((e) => setTimeout(e, 100)),
                // Sentinel so the post-reload boot treats the empty live slot as an
                // intentional fresh start (not a suspicious disappearance) even though
                // autosave snapshots remain in the Save Manager. See loadGame GUARD 3.
                (() => {
                    try {
                        localStorage.setItem("fuoc_intentional_reset", "1");
                    } catch (e) {}
                })(),
                await kv.gameSave.delete("fuoc_save_autosave"),
                await kv.gameSave.delete("gameState"),
                localStorage.removeItem("gameState"),
                // Delete autosave snapshots (and legacy autosave_N slots): they belong to
                // the old game and would pollute the fresh pool (gameplay clock restarts at
                // 0 → negative ages). Manual/quick saves are preserved.
                await (async () => {
                    try {
                        const e = (await kv.gameSave.keys()) || [];
                        for (const t of e)
                            t.startsWith("fuoc_save_") &&
                                isManagedSnapshotSlot(t.replace("fuoc_save_", "")) &&
                                (await kv.gameSave.delete(t));
                    } catch (e) {
                        console.warn("[Reset] Snapshot cleanup failed (non-fatal):", e);
                    }
                })(),
                await new Promise((e) => setTimeout(e, 100)),
                showNotification("Game reset! Starting fresh game. Your saves are still in Save Manager."),
                await new Promise((e) => setTimeout(e, 500)),
                location.reload();
        } catch (e) {
            console.error("Error resetting game:", e),
                showNotification("Error resetting game. Please try again."),
                (isResetting = !1);
        }
}
function purchaseLocation(e) {
    unlockLocation(e);
}
function generateInitialEmployees() {
    const e = ["Hardworking", "Creative", "Analytical", "Charismatic", "Detail-oriented", "Adaptable"],
        t = ["Friendly", "Reserved", "Outgoing", "Thoughtful", "Energetic", "Calm"],
        n = [
            "Reading",
            "Photography",
            "Hiking",
            "Gaming",
            "Cooking",
            "Traveling",
            "Music",
            "Art",
            "Yoga",
            "Dancing",
        ],
        a = ["Exhibitionism", "Bondage", "Roleplay", "Dominance", "Submission", "Voyeurism", "Teasing", "Spanking"];
    for (let o = 0; o < 2; o++) {
        const i = selectGenderForEmployee(),
            s = "function" == typeof selectRaceForEmployee ? selectRaceForEmployee() : "human",
            r =
                "human" === s && "function" == typeof selectEthnicityForEmployee
                    ? selectEthnicityForEmployee()
                    : null,
            l = generateUniqueName(i, r, s),
            c = e[Math.floor(Math.random() * e.length)],
            d = t[Math.floor(Math.random() * t.length)],
            p = Math.floor(3 * Math.random()) + 1,
            m = [];
        for (; m.length < p; ) {
            const e = n[Math.floor(Math.random() * n.length)];
            m.includes(e) || m.push(e);
        }
        const u = Math.floor(3 * Math.random()) + 2,
            g = [];
        for (; g.length < u; ) {
            const e = a[Math.floor(Math.random() * a.length)];
            g.includes(e) || g.push(e);
        }
        const h = {
                affection: 20 + Math.floor(20 * Math.random()),
                comfort: 40 + Math.floor(30 * Math.random()),
                trust: 30 + Math.floor(30 * Math.random()),
                desire: 5 + Math.floor(15 * Math.random()),
                obedience: 40 + Math.floor(30 * Math.random()),
                productivity: 50 + Math.floor(30 * Math.random()),
            },
            y = generateDetailedPhysicalAppearance(i, s, r),
            f = {
                confidence: 30 + Math.floor(50 * Math.random()),
                outgoing: 20 + Math.floor(60 * Math.random()),
                flirty: 10 + Math.floor(70 * Math.random()),
                professional: 30 + Math.floor(50 * Math.random()),
                humor: 20 + Math.floor(60 * Math.random()),
            };
        gameState.employees.push({
            id: `emp_${Date.now()}_${o}`,
            name: l,
            position: "Employee",
            gender: i,
            race: s,
            ethnicity: r,
            trait: c,
            personality: f,
            personalityTraits: [d],
            hobbies: m,
            kinks: g,
            stats: h,
            level: 1,
            hired: !0,
            bio: `A ${d.toLowerCase()} and ${c.toLowerCase()} team member who enjoys ${m.join(", ")}.`,
            physical: y,
            profileImage: null,
            memory: [],
        });
    }
}
