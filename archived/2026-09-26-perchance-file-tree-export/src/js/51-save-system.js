// ============================================================================
// 51-save-system — Save system: debounced save, SaveManager class, slots, snapshots, autosave, export/import, reset, prestige, initial employees.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

let Mv = false, Pv = null, Av = false;
const Nv = 500;
let _v = false, Rv = false, Dv = false, Ov = false;
const Bv = Date.now();
function Fv(e, t) {
  const n = ((Date.now() - Bv) / 1e3).toFixed(2);
  void 0 !== t ? console.log(`[BOOT +${n}s] ${e}`, t) : console.log(`[BOOT +${n}s] ${e}`);
}
function jv(e = gameState) {
  return { cash: e?.cash, employees: Array.isArray(e?.employees) ? e.employees.length : "n/a", locations: Array.isArray(e?.locations) ? e.locations.filter((e2) => e2.unlocked || e2.owned).length : "n/a", totalEarnings: e?.totalEarnings, prestige: e?.prestigeLevel, playTime: e?.totalPlayTime };
}
function qv(e) {
  try {
    return JSON.stringify(e).length;
  } catch (e2) {
    return -1;
  }
}
function zv(e = gameState) {
  const t = !Array.isArray(e.employees) || 0 === e.employees.length, n = !(e.totalEarnings > 0 || e.lifetimeEarnings > 0 || e.currentLifetimeIncome > 0), a = (e.cash || 0) <= ("object" == typeof le && le.startingCash || 150), o = !(e.totalPlayTime > 0 || e.prestigeLevel > 0);
  return t && n && a && o;
}
async function Gv(e) {
  let t = 0, n = null;
  for (; t < 2; ) {
    try {
      const n2 = await kv.gameSave.get(e);
      if (n2) return n2;
      0 === t && (Fv(`Read returned empty for "${e}" \u2014 retrying once`), await new Promise((e2) => setTimeout(e2, 250)));
    } catch (u2) {
      n = u2, Fv(`Read THREW for "${e}" (attempt ${t + 1})`, String(u2 && u2.message || u2)), await new Promise((e2) => setTimeout(e2, 250));
    }
    t++;
  }
  if (n) throw n;
  return null;
}
async function Hv() {
  try {
    return (await kv.gameSave.keys() || []).filter((e) => e.startsWith("fuoc_save_") && "fuoc_save_autosave" !== e && "fuoc_save_prevsession" !== e);
  } catch (u2) {
    return Fv(`Could not list save slots (${String(u2 && u2.message || u2)}) \u2014 treating as 'saves may exist'`), ["<unlistable>"];
  }
}
async function Uv(e) {
  if (!Ov && e) {
    Ov = true;
    try {
      await kv.gameSave.set("fuoc_save_prevsession", { ...e, meta: { ...e.meta || {}, saveName: "prevsession", saveType: "backup", backedUpAt: (/* @__PURE__ */ new Date()).toISOString() } }), Fv("GUARD 5: prior session backed up \u2192 slot fuoc_save_prevsession");
    } catch (e2) {
      Fv(`GUARD 5: prev-session backup failed (non-fatal): ${String(e2 && e2.message || e2)}`);
    }
  }
}
function debouncedSave() {
  Mv || (Av = true, Pv && clearTimeout(Pv), Pv = setTimeout(() => {
    Av && (Av = false, saveGame(false), console.log("[SaveManager] Debounced save executed"));
  }, Nv));
}
function flushPendingSave() {
  Pv && (clearTimeout(Pv), Pv = null), Av && (Av = false, saveGame(false), console.log("[SaveManager] Pending save flushed"));
}
async function saveGame(e = true) {
  if (!Mv) try {
    await saveGameToSlot("autosave", "auto", e);
  } catch (u2) {
    console.error("Error saving game:", u2), e && showNotification("Failed to save game!", "error");
  }
}
let Yv = false, Wv = 0;
const MIN_SAVE_INTERVAL = 500;
async function saveGameToSlot(e, t = "manual", n = true) {
  if (Mv) return null;
  if ("auto" === t) {
    if (!_v) return Fv(`Autosave BLOCKED \u2192 slot "${e}" (save system not ready \u2014 load not yet confirmed)`), null;
    if (zv() && !Rv) return console.warn(`[SaveManager] \u26A0 REFUSED blank autosave \u2192 slot "${e}"`, jv()), null;
  }
  const a = Date.now();
  if (Yv) {
    if ("auto" === t) return console.log("[SaveManager] Skipping auto-save (save already in progress)"), null;
    for (; Yv; ) await new Promise((e2) => setTimeout(e2, 50));
  }
  if ("auto" === t && a - Wv < MIN_SAVE_INTERVAL) return console.log("[SaveManager] Throttling auto-save (too soon since last save)"), null;
  Yv = true, Wv = a;
  try {
    const a2 = gameState.totalPlayTime || 0, o = { version: "250116200000", meta: { saveDate: (/* @__PURE__ */ new Date()).toISOString(), saveName: e, saveType: t, playTime: a2, gameDay: gameState.time?.day || 0, gameTime: gameState.time?.currentTime || Date.now(), money: gameState.cash || 0, employees: gameState.employees?.length || 0, prestigeLevel: gameState.prestigeLevel || 0 }, gameState }, i = [];
    try {
      const e2 = o.gameState, t2 = CAPS.CHAT_MESSAGES_SAVE;
      if (e2.employees && Array.isArray(e2.employees) && e2.employees.forEach((e3) => {
        e3.chatHistory && e3.chatHistory.length > t2 && (e3.chatHistory = e3.chatHistory.slice(-t2)), e3.conversationArchive && e3.conversationArchive.length > CAPS.CONVERSATION_ARCHIVE && (e3.conversationArchive = e3.conversationArchive.slice(-CAPS.CONVERSATION_ARCHIVE));
      }), e2.socialNetwork?.posts) {
        const t3 = e2.socialNetwork.posts.map((e3, t4) => ({ idx: t4, id: e3.id, hasImg: !!e3.imageUrl })).filter((e3) => e3.hasImg);
        t3.length > CAPS.SOCIAL_POST_IMAGES_KEEP && t3.slice(CAPS.SOCIAL_POST_IMAGES_KEEP).forEach((t4) => {
          i.push({ id: t4.id, url: e2.socialNetwork.posts[t4.idx].imageUrl }), e2.socialNetwork.posts[t4.idx].imageUrl = null;
        });
      }
      if (Fo(), e2.socialNetwork?.posts && e2.socialNetwork.posts.length > CAPS.SOCIAL_POSTS && (e2.socialNetwork.posts = e2.socialNetwork.posts.slice(0, CAPS.SOCIAL_POSTS)), e2.socialNetwork?.algorithm && !e2.socialNetwork.algorithm._foryouDefault && (e2.socialNetwork.algorithm._foryouDefault = true, "hot" === e2.socialNetwork.algorithm.sort && (e2.socialNetwork.algorithm.sort = "foryou")), "function" == typeof qo && qo(e2.socialNetwork), e2.socialNetwork?.stories) {
        const t3 = Date.now();
        e2.socialNetwork.stories = e2.socialNetwork.stories.filter((e3) => t3 - e3.createdAt < CAPS.STORY_EXPIRY_MS);
      }
      e2.dynamicEvents?.eventMemories && e2.dynamicEvents.eventMemories.length > CAPS.EVENT_MEMORIES_GLOBAL && (e2.dynamicEvents.eventMemories = e2.dynamicEvents.eventMemories.slice(-CAPS.EVENT_MEMORIES_GLOBAL)), e2.pendingAIRequests?.text?.length && (e2.pendingAIRequests.text = e2.pendingAIRequests.text.map((e3) => ({ ...e3, options: e3.options ? Object.fromEntries(Object.entries(e3.options).filter(([, e4]) => "function" != typeof e4)) : {} }))), delete e2._storyPeriodicCounter, delete e2._dynamicEventCounter, delete e2._groupIdleConvCounter, delete e2._cashCacheCounter;
    } catch (e2) {
      console.warn("[SaveManager] Pre-save trimming error (non-fatal):", e2);
    }
    if (o.meta.bytes = qv(o), "auto" === t && Fv(`Autosave WRITE \u2192 slot "${e}" (${o.meta.bytes} bytes)`, jv()), await kv.gameSave.set(`fuoc_save_${e}`, o), i.length > 0 && i.forEach(({ id: e2, url: t2 }) => {
      const n2 = gameState.socialNetwork?.posts?.find((t3) => t3.id === e2);
      n2 && (n2.imageUrl = t2);
    }), console.log(`[SaveManager] Saved to slot: ${e} (type: ${t})`), n) {
      let t2;
      t2 = /^autosave_\d+$/.test(e) ? "\u{1F4F8} Autosave snapshot saved" : "autosave" === e ? "\u{1F4BE} Autosaved" : /^quick_/.test(e) ? "\u26A1 Quick save created" : `\u2705 Game saved: ${e}`, showNotification(t2);
    }
    return Yv = false, o;
  } catch (a2) {
    if (console.error(`[SaveManager] Error saving to slot ${e}:`, a2), "QuotaExceededError" === a2.name || a2.message?.includes("QuotaExceededError")) console.error("[SaveManager] Storage quota exceeded!"), n && showNotification("\u{1F4BE} Storage full! Clear old saves in Save Manager.", "error", 8e3);
    else if (a2.message?.includes("can't access property") || a2.message?.includes("tracking is undefined")) {
      console.error("[SaveManager] Autosave tracking error, reinitializing..."), gameState.autosaveTracking || (gameState.autosaveTracking = { lastSnapshotTime: Date.now(), currentSlotIndex: 0, snapshotIntervalMinutes: 5 }, console.log("[SaveManager] Reinitialized autosave tracking")), n && showNotification("\u{1F4BE} Save system recovered. Trying again...", "info", 4e3);
      try {
        const r = { version: "250116200000", meta: { saveDate: (/* @__PURE__ */ new Date()).toISOString(), saveName: e, saveType: t, playTime: gameState.totalPlayTime || 0, gameDay: gameState.time?.day || 0, gameTime: gameState.time?.currentTime || Date.now(), money: gameState.cash || 0, employees: gameState.employees?.length || 0, prestigeLevel: gameState.prestigeLevel || 0 }, gameState };
        return await kv.gameSave.set(`fuoc_save_${e}`, r), n && showNotification(`${"auto" === t ? "\u{1F4BE}" : "quick" === t ? "\u26A1" : "\u2705"} Game saved to: ${e} (recovered)`, "success"), Yv = false, r;
      } catch (e2) {
        console.error("[SaveManager] Retry failed:", e2), n && showNotification("\u274C Save failed even after recovery!", "error");
      }
    } else n && showNotification("\u274C Failed to save game!", "error");
    throw Yv = false, a2;
  }
}
async function Vv(e) {
  try {
    console.log(`[SaveManager] Loading from slot: ${e}`);
    const t = await kv.gameSave.get(`fuoc_save_${e}`);
    return t ? t.gameState ? (await loadSaveData(t.gameState), console.log(`[SaveManager] Successfully loaded from slot: ${e}`), showNotification(`\u2705 Loaded save: ${e}`, "success"), true) : (console.error(`[SaveManager] Invalid save structure in slot: ${e}`), showNotification("\u274C Corrupted save file!", "error"), false) : (console.warn(`[SaveManager] No save found in slot: ${e}`), showNotification(`\u274C Save slot "${e}" not found!`, "error"), false);
  } catch (u2) {
    return console.error(`[SaveManager] Error loading from slot ${e}:`, u2), showNotification("\u274C Failed to load save!", "error"), false;
  }
}
async function Kv() {
  try {
    const e = [], t = await kv.gameSave.keys();
    for (const n of t) if (n.startsWith("fuoc_save_")) {
      const t2 = n.replace("fuoc_save_", ""), a = await kv.gameSave.get(n);
      a && a.meta && e.push({ slotName: t2, ...a.meta, hasGameState: !!a.gameState });
    }
    return e.sort((e2, t2) => new Date(t2.saveDate) - new Date(e2.saveDate)), console.log(`[SaveManager] Found ${e.length} save slots`), e;
  } catch (u2) {
    return console.error("[SaveManager] Error listing saves:", u2), [];
  }
}
async function Jv(e) {
  try {
    if ("autosave" === e || e.startsWith("autosave_")) return showNotification("\u274C Cannot delete autosave slots!", "error"), false;
    const t = `fuoc_save_${e}`;
    return await kv.gameSave.delete(t), console.log(`[SaveManager] Deleted slot: ${e}`), showNotification(`\u{1F5D1}\uFE0F Deleted save: ${e}`), true;
  } catch (u2) {
    return console.error(`[SaveManager] Error deleting slot ${e}:`, u2), showNotification("\u274C Failed to delete save!", "error"), false;
  }
}
async function Qv(e, t) {
  try {
    if ("autosave" === e || e.startsWith("autosave_") || "autosave" === t || t.startsWith("autosave_")) return showNotification("\u274C Cannot rename autosave slots!", "error"), false;
    if ((await kv.gameSave.keys()).includes(`fuoc_save_${t}`)) return showNotification("\u274C Save name already exists!", "error"), false;
    const n = await kv.gameSave.get(`fuoc_save_${e}`);
    return n ? (n.meta.saveName = t, await kv.gameSave.set(`fuoc_save_${t}`, n), await kv.gameSave.delete(`fuoc_save_${e}`), console.log(`[SaveManager] Renamed slot: ${e} \u2192 ${t}`), showNotification(`\u270F\uFE0F Renamed save to: ${t}`), true) : (showNotification("\u274C Original save not found!", "error"), false);
  } catch (t2) {
    return console.error(`[SaveManager] Error renaming slot ${e}:`, t2), showNotification("\u274C Failed to rename save!", "error"), false;
  }
}
function Xv(u2, G2, U2) {
  const parts = ["{"], keys = Object.keys(u2);
  return keys.forEach((k, J2) => {
    parts.push(JSON.stringify(k) + ":");
    const v = u2[k];
    if (G2.includes(k) && Array.isArray(v)) parts.push("["), v.forEach((item, i) => {
      parts.push(JSON.stringify(item)), i < v.length - 1 && parts.push(",");
    }), parts.push("]");
    else if (U2.includes(k) && v && "object" == typeof v && !Array.isArray(v)) {
      const u3 = Object.keys(v);
      parts.push("{"), u3.forEach((id, i) => {
        parts.push(JSON.stringify(id) + ":" + JSON.stringify(v[id])), i < u3.length - 1 && parts.push(",");
      }), parts.push("}");
    } else "socialNetwork" === k && v && "object" == typeof v ? parts.push(...Xv(v, ["posts"], [])) : parts.push(JSON.stringify(v));
    J2 < keys.length - 1 && parts.push(",");
  }), parts.push("}"), parts;
}
function Zv(payload) {
  const parts = ["{"], keys = Object.keys(payload);
  return keys.forEach((k, u2) => {
    parts.push(JSON.stringify(k) + ":"), "gameState" === k && payload[k] && "object" == typeof payload[k] ? parts.push(...Xv(payload[k], ["employees", "formerEmployees", "groups"], ["chatHistory"])) : parts.push(JSON.stringify(payload[k])), u2 < keys.length - 1 && parts.push(",");
  }), parts.push("}"), parts;
}
async function nb(e) {
  try {
    const t = await kv.gameSave.get(`fuoc_save_${e}`);
    if (!t) return void showNotification(`\u274C Save slot "${e}" not found!`, "error");
    const n = Zv(t), a = new Blob(n, { type: "application/json" }), o = URL.createObjectURL(a), i = `FUOC-${e}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/:/g, "-")}.json`, s = document.createElement("a");
    s.href = o, s.download = i, document.body.appendChild(s), s.click(), document.body.removeChild(s), URL.revokeObjectURL(o), console.log(`[SaveManager] Exported slot: ${e}`), showNotification(`\u{1F4E4} Exported: ${i}`, "success");
  } catch (u2) {
    console.error(`[SaveManager] Error exporting slot ${e}:`, u2), showNotification("\u274C Failed to export save!", "error");
  }
}
async function ob(e, t = null) {
  try {
    if (!e.gameState) throw new Error("Invalid save file structure");
    const n = t || `imported_${Date.now()}`;
    if ((await kv.gameSave.keys()).includes(`fuoc_save_${n}`)) throw new Error("Target slot already exists");
    return e.meta || (e.meta = {}), e.meta.saveName = n, e.meta.saveType = "manual", e.meta.importedAt = (/* @__PURE__ */ new Date()).toISOString(), await kv.gameSave.set(`fuoc_save_${n}`, e), console.log(`[SaveManager] Imported to slot: ${n}`), showNotification(`\u{1F4E5} Imported save: ${n}`, "success"), true;
  } catch (e2) {
    return console.error("[SaveManager] Error importing save:", e2), showNotification(`\u274C Import failed: ${e2.message}`, "error"), false;
  }
}
function ab(employeeId) {
  return (gameState.socialNetwork && gameState.socialNetwork.posts || []).filter((p) => p.authorId === employeeId);
}
function ib(emp2) {
  const u2 = (emp2.conversationArchive || []).reduce((a, c) => a + (c.messages || []).length, 0);
  return { photos: (emp2.photos || []).length, posts: ab(emp2.id).length, messages: (gameState.chatHistory && gameState.chatHistory[emp2.id] || []).length + u2, memories: (emp2.memory && emp2.memory.items || []).length };
}
function rb(employeeId, options = {}) {
  const emp2 = gameState.employees.find((x) => x.id === employeeId);
  if (!emp2) return null;
  const src = JSON.parse(JSON.stringify(emp2)), character = { name: src.name, firstName: src.firstName || null, lastName: src.lastName || null, age: src.age, gender: src.gender, race: src.race, ethnicity: src.ethnicity || null, customRace: src.customRace || null, bio: src.bio || "", personality: src.personality || {}, personalityTraits: src.personalityTraits || [], keyTrait: src.keyTrait || null, hobbies: src.hobbies || [], kinks: src.kinks || [], voice: src.voice || null, physical: src.physical || {}, stats: src.stats || {}, personalLife: src.personalLife || null, nicknameForPlayer: src.nicknameForPlayer || null, chatSettings: src.chatSettings || null, chatCommMode: src.chatCommMode || null, career: src.career ? { level: src.career.level || 1, salary: src.career.salary } : null, schedule: src.schedule ? { workDays: src.schedule.workDays, workStartHour: src.schedule.workStartHour, workEndHour: src.schedule.workEndHour, shiftType: src.schedule.shiftType, ptoBalance: src.schedule.ptoBalance } : null, social: src.social && src.social.username ? { username: src.social.username } : null, profileImage: src.profileImage || null };
  character.physical && "object" == typeof character.physical && (delete character.physical.fullDescription, delete character.physical.shortDescription);
  const included = { gallery: false, social: false, conversations: false, memories: false };
  if (options.gallery && Array.isArray(src.photos) && src.photos.length && (character.photos = src.photos, included.gallery = true), options.social) {
    const posts = ab(employeeId).map((p) => ({ type: p.type || "status", content: p.content || "", imageUrl: p.imageUrl || null, imagePrompt: p.imagePrompt || null, altText: p.altText || null, mood: p.mood || null, tags: p.tags || [], explicitLevel: p.explicitLevel || 0, poll: p.poll || null, timestamp: p.timestamp }));
    posts.length && (character._socialPosts = posts, included.social = true);
  }
  if (options.conversations) {
    const live = gameState.chatHistory && gameState.chatHistory[employeeId] || [];
    live.length && (character._chatHistory = JSON.parse(JSON.stringify(live))), Array.isArray(src.conversationArchive) && src.conversationArchive.length && (character.conversationArchive = src.conversationArchive), included.conversations = !(!character._chatHistory && !character.conversationArchive);
  }
  return options.memories && src.memory && (src.memory.items || []).length && (character.memory = src.memory, included.memories = true), { fuocCharacterExport: true, version: "250116200000", exportedAt: (/* @__PURE__ */ new Date()).toISOString(), included, character };
}
function sb(employeeId, options = {}) {
  try {
    const wrapper = rb(employeeId, options);
    if (!wrapper) return void showNotification("\u274C Character not found!", "error");
    const json = JSON.stringify(wrapper, null, 2), blob = new Blob([json], { type: "application/json" }), url = URL.createObjectURL(blob), u2 = `FUOC-character-${(wrapper.character.name || "character").replace(/[^a-z0-9]+/gi, "_").slice(0, 40)}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/:/g, "-")}.json`, a = document.createElement("a");
    a.href = url, a.download = u2, document.body.appendChild(a), a.click(), document.body.removeChild(a), URL.revokeObjectURL(url);
    const extras = Object.entries(wrapper.included).filter(([, v]) => v).map(([k]) => k);
    return console.log(`[Character Export] Exported ${wrapper.character.name} (extras: ${extras.join(", ") || "none"})`), { wrapper, filename: u2 };
  } catch (u2) {
    return console.error("[Character Export] Error:", u2), showNotification("\u274C Failed to export character!", "error"), null;
  }
}
function lb(n, u2, G2) {
  return `${n} ${1 === n ? u2 : G2 || u2 + "s"}`;
}
function ub(opts) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed; inset:0; background:var(--an); z-index:10003; display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box;";
  const u2 = (opts.rows || []).map((r) => `<div style="display:flex; gap:10px; align-items:center; padding:9px 11px; background:var(--i); border-radius:8px; margin-bottom:6px;"><span style="font-size:1.05rem; flex-shrink:0;">${r.icon}</span><span style="color:var(--b); font-size:0.92rem;">${r.text}</span></div>`).join(""), G2 = (opts.notes || []).map((n) => `<div style="display:flex; gap:8px; padding:10px 12px; background:rgba(255,193,7,0.08); border:1px solid rgba(255,193,7,0.25); border-radius:8px; margin-top:10px;"><span style="flex-shrink:0;">\u24D8</span><span style="color:var(--a); font-size:0.82rem; line-height:1.5;"><strong style="color:var(--gb);">${n.title}</strong> ${n.text}</span></div>`).join("");
  overlay.innerHTML = ` <div style="background:var(--h); border:1px solid var(--o); border-radius:16px; max-width:480px; width:100%; max-height:90vh; overflow:auto; box-shadow:0 20px 60px var(--ab);"> <div style="padding:18px 20px; border-bottom:1px solid var(--o);"> <h2 style="margin:0; color:${opts.accent || "var(--g)"}; font-size:1.15rem;">${opts.title}</h2> </div> <div style="padding:18px 20px;"> ${u2}${G2}
          ${opts.footnote ? `<p style="color:var(--e); font-size:0.78rem; margin:12px 0 0 0; line-height:1.45;">${opts.footnote}</p>` : ""} <button class="char-summary-done" style="width:100%; margin-top:16px; padding:12px; background:linear-gradient(135deg, var(--n) 0%, var(--u) 100%); border:none; border-radius:8px; color:var(--q); font-weight:700; cursor:pointer;">Done</button> </div> </div>`, document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector(".char-summary-done")?.addEventListener("click", close), overlay.addEventListener("click", (e) => {
    e.target === overlay && close();
  });
}
function pb(wrapper, filename) {
  const c = wrapper.character, u2 = wrapper.included || {}, G2 = (c.conversationArchive || []).reduce((a, x) => a + (x.messages || []).length, 0), rows = [{ icon: "\u2705", text: "Core character \u2014 identity, personality, appearance, stats &amp; profile picture" }];
  u2.gallery && rows.push({ icon: "\u{1F5BC}\uFE0F", text: lb((c.photos || []).length, "gallery image") }), u2.social && rows.push({ icon: "\u{1F4F1}", text: lb((c._socialPosts || []).length, "social post") }), u2.conversations && rows.push({ icon: "\u{1F4AC}", text: lb((c._chatHistory || []).length + G2, "chat message") }), u2.memories && rows.push({ icon: "\u{1F9E0}", text: lb((c.memory?.items || []).length, "learned memory", "learned memories") }), ub({ title: `\u{1F4E4} ${c.name} exported`, accent: "var(--x)", rows, footnote: `Saved as <strong style="color:var(--b);">${filename}</strong> to your downloads. Import it from <strong style="color:var(--b);">Hire \u2192 \u2728 Custom Employee \u2192 \u{1F4E5} Import Character</strong> in any save.` });
}
function gb(employeeId) {
  const emp2 = gameState.employees.find((x) => x.id === employeeId);
  if (!emp2) return void showNotification("\u274C Character not found!", "error");
  const c = ib(emp2), u2 = (key, icon, title, count, unit, note, u3) => {
    const has = count > 0;
    return ` <label style="display:flex; gap:10px; align-items:flex-start; padding:10px 12px; background:var(--i); border:1px solid var(--r); border-radius:8px; margin-bottom:8px; cursor:${has ? "pointer" : "default"}; opacity:${has ? "1" : "0.55"};"> <input type="checkbox" data-exp-opt="${key}" ${has ? "" : "disabled"} style="margin-top:3px; flex-shrink:0; width:16px; height:16px; cursor:${has ? "pointer" : "default"};"> <span style="flex:1;"> <span style="color:var(--b); font-weight:600;">${icon} ${title}</span> <span style="color:var(--e); font-weight:500;"> \xB7 ${has ? `${count} ${unit}${1 === count ? "" : "s"}` : "none yet"}</span> <span style="display:block; color:var(--e); font-size:0.78rem; margin-top:3px; line-height:1.4;">${has ? note : u3 || "Nothing to include for this character yet."}</span> </span> </label>`;
  }, G2 = (icon, title) => ` <label style="display:flex; gap:10px; align-items:center; padding:9px 12px; background:rgba(78,204,163,0.08); border:1px solid rgba(78,204,163,0.3); border-radius:8px; margin-bottom:8px;"> <input type="checkbox" checked disabled style="flex-shrink:0; width:16px; height:16px;"> <span style="color:var(--b); font-weight:600;">${icon} ${title}</span> <span style="margin-left:auto; color:var(--g); font-size:0.72rem; font-weight:700; letter-spacing:0.5px;">REQUIRED</span> </label>`, overlay = document.createElement("div");
  overlay.id = "charExportModal", overlay.style.cssText = "position:fixed; inset:0; background:var(--an); z-index:10002; display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box;", overlay.innerHTML = ` <div style="background:var(--h); border:1px solid var(--o); border-radius:16px; max-width:560px; width:100%; max-height:90vh; overflow:auto; box-shadow:0 20px 60px var(--ab);"> <div style="padding:18px 20px; border-bottom:1px solid var(--o); display:flex; justify-content:space-between; align-items:center;"> <h2 style="margin:0; color:var(--x); font-size:1.2rem;">\u{1F4E4} Export ${emp2.name}</h2> <button id="charExportClose" style="background:none; border:none; color:var(--e); font-size:24px; cursor:pointer; line-height:1;">&times;</button> </div> <div style="padding:18px 20px;"> <p style="color:var(--a); margin:0 0 14px 0; font-size:0.9rem;">Choose what travels with this character. The core is always included so they arrive intact; the rest is up to you.</p> <div style="margin-bottom:6px; color:var(--e); font-size:0.75rem; font-weight:700; letter-spacing:0.5px;">ALWAYS INCLUDED</div> ${G2("\u{1F464}", "Identity, personality & bio")}
          ${G2("\u{1F3A8}", "Physical appearance")}
          ${G2("\u2764\uFE0F", "Relationship stats &amp; profile picture")} <div style="margin:14px 0 6px 0; color:var(--e); font-size:0.75rem; font-weight:700; letter-spacing:0.5px;">OPTIONAL \u2014 bring more of their history</div> ${u2("gallery", "\u{1F5BC}\uFE0F", "Full image gallery", c.photos, "photo", "Every saved picture, not just the profile shot. Makes the file bigger \u2014 sometimes several MB.", "")}
          ${u2("social", "\u{1F4F1}", "Social posts", c.posts, "post", "Their past posts drop into your new feed. Likes &amp; comments from old coworkers don't come along.", "")}
          ${u2("conversations", "\u{1F4AC}", "Conversation history", c.messages, "message", "Your full chat log with them. Can be large; mentions of old coworkers or events may not line up in the new save.", "")}
          ${u2("memories", "\u{1F9E0}", "Learned memories", c.memories, "memory", "What they remember about you, so they feel continuous. May reference people or moments from the old save.", "")} <div style="display:flex; gap:10px; margin-top:18px;"> <button id="charExportConfirm" style="flex:1; padding:12px; background:linear-gradient(135deg, var(--x) 0%, var(--en) 100%); border:none; border-radius:8px; color:var(--q); font-weight:700; cursor:pointer; font-size:0.95rem;">\u{1F4E4} Export Character</button> <button id="charExportCancel" style="flex:0 0 auto; padding:12px 20px; background:var(--ag); border:1px solid var(--r); border-radius:8px; color:var(--a); cursor:pointer;">Cancel</button> </div> </div> </div>`, document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector("#charExportClose")?.addEventListener("click", close), overlay.querySelector("#charExportCancel")?.addEventListener("click", close), overlay.addEventListener("click", (e) => {
    e.target === overlay && close();
  }), overlay.querySelector("#charExportConfirm")?.addEventListener("click", () => {
    const options = {};
    overlay.querySelectorAll("[data-exp-opt]").forEach((cb) => {
      options[cb.getAttribute("data-exp-opt")] = cb.checked;
    });
    const result = sb(employeeId, options);
    close(), result && pb(result.wrapper, result.filename);
  });
}
function hb(productId = null) {
  const input = document.getElementById("importCharacterFileInput");
  input ? (input.onchange = (u2) => {
    const file = u2.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const parsed = JSON.parse(re.target.result);
          if (parsed && parsed.gameState) return void showNotification("\u274C That's a full save file. Use the Save Manager to load it.", "error", 5e3);
          if (!parsed || !parsed.fuocCharacterExport || !parsed.character) return void showNotification("\u274C Not a valid character file!", "error");
          yb(parsed.character, productId);
        } catch (u3) {
          console.error("[Character Import] Error:", u3), showNotification("\u274C Failed to read character file!", "error");
        }
        u2.target.value = "";
      }, reader.onerror = () => showNotification("\u274C Failed to read file!", "error"), reader.readAsText(file);
    }
  }, input.click()) : showNotification("\u274C Import system not available!", "error");
}
function yb(u2, productId = null) {
  try {
    const char = JSON.parse(JSON.stringify(u2)), G2 = [], U2 = u2.personality;
    U2 && "object" == typeof U2 && 0 !== Object.keys(U2).length ? U2.axes || G2.push("personality axes") : G2.push("personality profile"), u2.stats && "object" == typeof u2.stats || G2.push("relationship stats");
    const J2 = u2.physical;
    if (J2 && "object" == typeof J2 && (J2.hair || J2.hairColor || J2.eyes || J2.eyeColor) || G2.push("appearance details"), u2.gender || G2.push("gender"), ["id", "hireDate", "relationships", "eventMemory", "unreadMessages", "interactions", "totalEarned", "bankBalance", "productId", "productManaged", "position", "locationId"].forEach((k) => delete char[k]), char.social = char.social && char.social.username ? { username: char.social.username } : null, "function" == typeof dr && (char.gender = dr(char.gender)), char.physical && "object" == typeof char.physical) try {
      "function" == typeof rr && rr(char.physical);
    } catch (u3) {
    }
    if ("function" == typeof ps && ps(char), "function" == typeof Fs && Fs(char), "function" == typeof ws && ws(char), !char.personality?.axes && "function" == typeof ys) try {
      char.personality = char.personality || {}, char.personality.axes = ys(char), "function" == typeof bs && bs(char);
    } catch (u3) {
    }
    if (char.physical && "function" == typeof mr) try {
      mr(char.physical, char.gender);
    } catch (u3) {
    }
    lc = JSON.parse(JSON.stringify(char)), lc.__autofilled = G2, char.generatedProfileImage = char.profileImage || null, char.gender = { femaleFuta: "female_futa", transWoman: "trans_woman", transMan: "trans_man" }[char.gender] || char.gender;
    const pid = productId || gameState.currentHiringProductId || gameState.products?.find((p) => !p.managerHired)?.id || gameState.products?.[0]?.id;
    if (!pid) return lc = null, void showNotification("\u274C No product available to assign the character to.", "error");
    yc(char, pid, "Import");
  } catch (u3) {
    console.error("[Character Import] Prepare failed:", u3), showNotification("\u274C Failed to import character!", "error"), lc = null;
  }
}
function fb(d, u2) {
  if (!d || !u2) return;
  u2.schedule && (d.schedule = { ...d.schedule || {}, ...u2.schedule }), u2.personalLife && (d.personalLife = { ...u2.personalLife || {}, ...d.personalLife || {} }), u2.voice && (d.voice = { ...d.voice || {}, ...u2.voice }), u2.personality?.freeform && d.personality && (d.personality.freeform = d.personality.freeform || u2.personality.freeform), u2.social?.username && (d.social = d.social || {}, d.social.username = d.social.username || u2.social.username), u2.chatSettings && (d.chatSettings = d.chatSettings || u2.chatSettings), u2.chatCommMode && (d.chatCommMode = d.chatCommMode || u2.chatCommMode), u2.nicknameForPlayer && (d.nicknameForPlayer = d.nicknameForPlayer || u2.nicknameForPlayer), u2.physical && d.physical && (["face", "raceFeatures", "ethnicityFeatures", "distinguishingFeatures", "piercings", "tattoos"].forEach((k) => {
    const v = u2.physical[k], empty = null == d.physical[k] || Array.isArray(d.physical[k]) && 0 === d.physical[k].length;
    null != v && empty && (d.physical[k] = JSON.parse(JSON.stringify(v)));
  }), null != u2.physical.genitals && (d.physical.genitals = JSON.parse(JSON.stringify(u2.physical.genitals))), null != u2.physical.accessories && (d.physical.accessories = u2.physical.accessories)), u2.ethnicity && !d.ethnicity && (d.ethnicity = u2.ethnicity), u2.customRace && !d.customRace && (d.customRace = JSON.parse(JSON.stringify(u2.customRace)));
  const restored = [];
  try {
    if (Array.isArray(u2.photos) && u2.photos.length) {
      d.photos = d.photos || [];
      const seen = new Set(d.photos.map((p) => p && p.url));
      u2.photos.forEach((p) => {
        p && p.url && !seen.has(p.url) && (d.photos.push(JSON.parse(JSON.stringify(p))), seen.add(p.url));
      }), restored.push("gallery");
    }
    u2.memory && (u2.memory.items || []).length && (d.memory = JSON.parse(JSON.stringify(u2.memory)), "function" == typeof ensureEmployeeMemory && ensureEmployeeMemory(d), restored.push("memories"));
    let G3 = false;
    Array.isArray(u2._chatHistory) && u2._chatHistory.length && (gameState.chatHistory = gameState.chatHistory || {}, gameState.chatHistory[d.id] = JSON.parse(JSON.stringify(u2._chatHistory)), d.unreadMessages = 0, G3 = true), Array.isArray(u2.conversationArchive) && u2.conversationArchive.length && (d.conversationArchive = JSON.parse(JSON.stringify(u2.conversationArchive)), G3 = true), G3 && restored.push("chat history"), Array.isArray(u2._socialPosts) && u2._socialPosts.length && gameState.socialNetwork && (gameState.socialNetwork.posts = gameState.socialNetwork.posts || [], "number" != typeof gameState.socialNetwork.postIdCounter && (gameState.socialNetwork.postIdCounter = 0), u2._socialPosts.forEach((p) => {
      const u3 = p.timestamp || Date.now();
      gameState.socialNetwork.posts.push({ id: `post_${++gameState.socialNetwork.postIdCounter}_${u3}`, authorId: d.id, authorName: d.name, authorImage: d.profileImage || null, type: p.type || "status", content: p.content || "", imageUrl: p.imageUrl || null, imagePrompt: p.imagePrompt || null, altText: p.altText || null, mood: p.mood || null, tags: p.tags || [], referencedEmployees: [], referencedEvent: null, referencedChat: null, explicitLevel: p.explicitLevel || 0, isPlayerPost: false, poll: p.poll || null, timestamp: u3, likes: [], dislikes: [], comments: [], views: 0 });
    }), restored.push("posts"));
  } catch (u3) {
    console.warn("[Import] optional payload restore failed:", u3);
  }
  delete d._chatHistory, delete d._socialPosts;
  const G2 = (u2.__autofilled || []).filter(Boolean);
  if (restored.length || G2.length) {
    const rows = [{ icon: "\u2705", text: "Core character restored \u2014 identity, personality, appearance &amp; stats" }];
    restored.includes("gallery") && rows.push({ icon: "\u{1F5BC}\uFE0F", text: lb((u2.photos || []).length, "gallery image") }), restored.includes("posts") && rows.push({ icon: "\u{1F4F1}", text: lb((u2._socialPosts || []).length, "social post") + " added to your feed" }), restored.includes("chat history") && rows.push({ icon: "\u{1F4AC}", text: lb((u2._chatHistory || []).length, "chat message") + " restored" }), restored.includes("memories") && rows.push({ icon: "\u{1F9E0}", text: lb((u2.memory?.items || []).length, "learned memory", "learned memories") });
    const notes = G2.length ? [{ title: "Auto-filled:", text: `${G2.join(", ")} weren't in this file (it's from an older export), so they were generated from what was available \u2014 usually nothing you'd notice. The character still arrives complete.` }] : [];
    ub({ title: `\u2705 ${d.name} imported`, accent: "var(--g)", rows, notes });
  }
  try {
    "function" == typeof mr && mr(d.physical, d.gender);
  } catch (u3) {
  }
  try {
    "function" == typeof ws && ws(d);
  } catch (u3) {
  }
}
async function vb() {
  try {
    const e = await kv.gameSave.get("gameState");
    if (!e) return void console.log("[SaveManager] No legacy save to migrate");
    console.log("[SaveManager] Found legacy save, migrating...");
    const t = { version: "250116200000", meta: { saveDate: (/* @__PURE__ */ new Date()).toISOString(), saveName: "migrated_legacy", saveType: "manual", playTime: 0, gameDay: e.time?.day || 0, money: e.cash || 0, employees: e.employees?.length || 0, prestigeLevel: e.prestigeLevel || 0, migratedFrom: "legacy_single_save" }, gameState: e };
    return await kv.gameSave.set("fuoc_save_migrated_legacy", t), await kv.gameSave.set("fuoc_save_autosave", { ...t, meta: { ...t.meta, saveName: "autosave", saveType: "auto" } }), await kv.gameSave.delete("gameState"), console.log("[SaveManager] \u2705 Legacy save migrated successfully and removed"), showNotification("\u2705 Save migrated to new system!", "success"), true;
  } catch (u2) {
    return console.error("[SaveManager] Migration error:", u2), false;
  }
}
function bb(e) {
  return "number" == typeof e.playTime && e.playTime > 0 ? Math.max(0, (gameState.totalPlayTime || 0) - e.playTime) : Math.max(0, Date.now() - new Date(e.saveDate || Date.now()).getTime());
}
function wb(e) {
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s ago`;
  const n = Math.floor(t / 60);
  if (n < 60) return `${n}m ago`;
  const a = e / 36e5;
  return a < 24 ? `${a < 10 ? a.toFixed(1) : Math.round(a)}h ago` : `${Math.floor(a / 24)}d ago`;
}
const xb = [{ key: "min", label: "\u26A1 Last minute", maxAge: 6e4 }, { key: "ten", label: "\u{1F550} Last 10 minutes", maxAge: 6e5 }, { key: "hour", label: "\u{1F552} Last hour", maxAge: 36e5 }, { key: "day", label: "\u{1F4C5} Last 24 hours", maxAge: 864e5 }, { key: "older", label: "\u{1F5C4}\uFE0F Older", maxAge: 1 / 0 }];
function kb(e) {
  const t = bb(e);
  return xb.find((e2) => t <= e2.maxAge) || xb[xb.length - 1];
}
class SaveManager {
  constructor() {
    this.view = { tab: "manual", sortKey: "savedAt", sortDir: "desc", query: "", selectedId: null }, this.modal = null, this.editingNameId = null;
  }
  async show() {
    this.modal || (this.modal = this.buildHTML(), document.body.appendChild(this.modal), this.attachEventListeners()), await this.render();
    const e = this.modal.querySelector(".save-list-container");
    e && (e.scrollTop = 0), this.modal.style.display = "flex";
    try {
      document.body.dataset.smPrevOverflow = document.body.style.overflow || "", document.body.style.overflow = "hidden";
    } catch (e2) {
    }
  }
  hide() {
    if (this.modal) {
      this.modal.style.display = "none";
      try {
        document.body.style.overflow = document.body.dataset.smPrevOverflow || "", delete document.body.dataset.smPrevOverflow;
      } catch (u2) {
      }
    }
  }
  buildHTML() {
    const e = document.createElement("div");
    return e.className = "save-manager-modal", e.innerHTML = ' <div class="save-manager-container"> <!-- Header --> <div class="save-manager-header"> <div class="save-manager-title"> <div class="save-manager-logo">\u{1F4BE}</div> <div> <h2>Save Manager</h2> <div class="save-manager-subtitle">Manage your game saves \u2022 Quick Save (F5) \u2022 Quick Load (F9)</div> </div> </div> <button class="save-manager-close" id="sm-close">\u2715</button> </div> <!-- Actions --> <div class="save-manager-actions"> <button class="sm-btn accent" id="sm-continue">\u25B6 Continue</button> <button class="sm-btn success" id="sm-quick-save">\u23FA Quick Save</button> <button class="sm-btn primary" id="sm-quick-load">\u23EE Quick Load</button> <button class="sm-btn" id="sm-export-all">\u{1F4E4} Export</button> <button class="sm-btn" id="sm-import">\u{1F4E5} Import</button> <input type="file" id="sm-import-file" accept=".json" style="display: none;"> </div> <!-- Toolbar --> <div class="save-manager-toolbar"> <div class="save-tab-group"> <button class="save-tab active" id="sm-tab-manual">Manual Saves</button> <button class="save-tab" id="sm-tab-auto">Autosaves & Quick Saves</button> </div> <div class="save-search-box"> <span class="save-search-icon">\u{1F50D}</span> <input type="text" id="sm-search" placeholder="Search saves..." /> </div> </div> <!-- Save List --> <div class="save-list-container"> <table class="save-table"> <thead> <tr> <th class="sortable" data-sort="name">Name <span class="sort-arrow">\u25BE</span></th> <th class="sortable" data-sort="day">Day</th> <th class="sortable" data-sort="savedAt">Saved At <span class="sort-arrow">\u25BE</span></th> <th>Money</th> <th>Employees</th> <th class="sortable" data-sort="playTime">Playtime</th> <th style="width: 250px;">Actions</th> </tr> </thead> <tbody id="sm-tbody"> <!-- Populated by render() --> </tbody> </table> <!-- Mobile Card Container --> <div class="save-card-container" id="sm-card-container"> <!-- Populated by render() --> </div> </div> <!-- Footer --> <div class="save-manager-footer"> <div class="save-footer-hint"> <span>Tips:</span> <span><span class="kbd">F5</span> Quick Save</span> <span><span class="kbd">F9</span> Quick Load</span> <span><span class="kbd">Esc</span> Close</span> </div> <div class="save-count" id="sm-count"> Loading saves... </div> </div> </div> ', e;
  }
  attachEventListeners() {
    const e = this.modal;
    e.querySelector("#sm-close").addEventListener("click", () => this.hide()), e.addEventListener("click", (t2) => {
      t2.target === e && this.hide();
    }), this._escHandler && document.removeEventListener("keydown", this._escHandler), this._escHandler = (t2) => {
      "Escape" === t2.key && "flex" === e.style.display && this.hide();
    }, document.addEventListener("keydown", this._escHandler), e.querySelector("#sm-continue").addEventListener("click", () => this.handleContinue()), e.querySelector("#sm-quick-save").addEventListener("click", () => this.handleQuickSave()), e.querySelector("#sm-quick-load").addEventListener("click", () => this.handleQuickLoad()), e.querySelector("#sm-export-all").addEventListener("click", () => this.handleExportSelected());
    const t = e.querySelector("#sm-import"), n = e.querySelector("#sm-import-file");
    t.addEventListener("click", () => n.click()), n.addEventListener("change", (e2) => this.handleImport(e2)), e.querySelector("#sm-tab-manual").addEventListener("click", () => this.switchTab("manual")), e.querySelector("#sm-tab-auto").addEventListener("click", () => this.switchTab("auto"));
    let a = null;
    e.querySelector("#sm-search").addEventListener("input", (e2) => {
      this.view.query = e2.target.value.toLowerCase(), clearTimeout(a), a = setTimeout(() => this.render(), 150);
    }), e.querySelectorAll("th.sortable").forEach((e2) => {
      e2.addEventListener("click", () => {
        const t2 = e2.dataset.sort;
        this.view.sortKey === t2 ? this.view.sortDir = "asc" === this.view.sortDir ? "desc" : "asc" : (this.view.sortKey = t2, this.view.sortDir = "desc"), this.render();
      });
    });
  }
  async switchTab(e) {
    this.view.tab = e;
    const t = this.modal.querySelector("#sm-tab-manual"), n = this.modal.querySelector("#sm-tab-auto");
    "manual" === e ? (t.classList.add("active"), n.classList.remove("active")) : (n.classList.add("active"), t.classList.remove("active")), await this.render();
    const a = this.modal.querySelector(".save-list-container");
    a && (a.scrollTop = 0);
  }
  async render() {
    const e = this.modal.querySelector("#sm-tbody"), t = this.modal.querySelector("#sm-card-container"), n = this.modal.querySelector("#sm-count"), a = await Kv();
    let o = a.filter((e2) => "manual" === this.view.tab ? "manual" === e2.saveType : "auto" === e2.saveType || "quick" === e2.saveType);
    this.view.query && (o = o.filter((e2) => `${e2.saveName}`.toLowerCase().includes(this.view.query))), o.sort((e2, t2) => {
      let n2, a2;
      switch (this.view.sortKey) {
        case "name":
          n2 = e2.saveName.toLowerCase(), a2 = t2.saveName.toLowerCase();
          break;
        case "day":
          n2 = e2.gameDay || 0, a2 = t2.gameDay || 0;
          break;
        case "savedAt":
          n2 = new Date(e2.saveDate).getTime(), a2 = new Date(t2.saveDate).getTime();
          break;
        case "playTime":
          n2 = e2.playTime || 0, a2 = t2.playTime || 0;
          break;
        default:
          n2 = 0, a2 = 0;
      }
      const o2 = "asc" === this.view.sortDir ? 1 : -1;
      return n2 > a2 ? o2 : n2 < a2 ? -o2 : 0;
    });
    const i = a.filter((e2) => "manual" === e2.saveType).length, s = a.filter((e2) => "auto" === e2.saveType).length, r = a.filter((e2) => "quick" === e2.saveType).length;
    n.textContent = `${i} manual \u2022 ${s} auto \u2022 ${r} quick \u2022 showing ${o.length}`;
    const l = this.modal.querySelector("#sm-export-all");
    if (l && (l.disabled = !this.view.selectedId, l.style.opacity = this.view.selectedId ? "1" : "0.45", l.style.cursor = this.view.selectedId ? "" : "not-allowed"), 0 === o.length ? (e.innerHTML = ` <tr> <td colspan="7" style="text-align: center; padding: 60px 20px; color: var(--a);"> <div class="empty-state"> <div class="empty-state-icon">\u{1F4BE}</div> <h3>No saves found</h3> <p>${"manual" === this.view.tab ? "Create a new save to get started!" : "Autosaves will appear here automatically."}</p> </div> </td> </tr> `, t.innerHTML = ` <div style="text-align: center; padding: 40px 20px; color: var(--a);"> <div class="empty-state"> <div class="empty-state-icon">\u{1F4BE}</div> <h3>No saves found</h3> <p>${"manual" === this.view.tab ? "Create a new save to get started!" : "Autosaves will appear here automatically."}</p> </div> </div> `) : (() => {
      if (!("auto" === this.view.tab && "savedAt" === this.view.sortKey && "desc" === this.view.sortDir)) return e.innerHTML = o.map((e2) => this.buildRowHTML(e2)).join(""), void (t.innerHTML = o.map((e2) => this.buildCardHTML(e2)).join(""));
      let l2 = "", c = "", d = null;
      for (const i2 of o) {
        const s2 = kb(i2);
        s2.key !== d && (d = s2.key, l2 += `<tr class="sm-tier-row"><td colspan="7" style="padding:10px 12px 4px;font-size:0.78rem;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:var(--a);border-top:1px solid var(--o,var(--t));">${s2.label}</td></tr>`, c += `<div class="sm-tier-header" style="grid-column:1/-1;padding:8px 4px 2px;font-size:0.78rem;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:var(--a);">${s2.label}</div>`), l2 += this.buildRowHTML(i2), c += this.buildCardHTML(i2);
      }
      e.innerHTML = l2, t.innerHTML = c;
    })(), "manual" === this.view.tab) {
      const n2 = document.createElement("tr");
      n2.className = "create-row", n2.id = "sm-create-row", n2.innerHTML = ' <td colspan="7"> <span class="create-save-link"> <span>+</span> <span>Create New Save</span> </span> </td> ', e.insertBefore(n2, e.firstChild);
      const a2 = document.createElement("div");
      a2.className = "save-card create-row", a2.id = "sm-create-card", a2.innerHTML = ' <div style="text-align: center; padding: 20px 10px; cursor: pointer;"> <span class="create-save-link"> <span style="font-size: 1.5rem;">+</span> <span>Create New Save</span> </span> </div> ', t.insertBefore(a2, t.firstChild), n2.addEventListener("click", () => this.handleCreateSave()), a2.addEventListener("click", () => this.handleCreateSave());
    }
    this.attachRowListeners(), this.updateSortArrows();
  }
  buildRowHTML(e) {
    const t = new Date(e.saveDate).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }), n = xu(e.money || 0), a = this.formatPlaytime(e.playTime || 0), o = this.view.selectedId === e.slotName;
    let i = e.saveName;
    if ("autosave" === e.slotName) i = "Latest Autosave";
    else if (e.slotName.startsWith("autosave_")) i = `Autosave \u2014 ${wb(bb(e))}`;
    else if (/^quick_(\d+)$/.test(e.slotName)) {
      const t2 = parseInt(e.slotName.replace("quick_", "")), n2 = new Date(t2);
      i = `Quick Save \u2014 ${n2.toLocaleDateString()} ${n2.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    const s = "auto" === e.saveType ? `<span class="save-name-display" style="color:var(--d);font-weight:600;">${i}</span>` : `<input type="text" class="save-name-input" value="${i}" data-slot="${e.slotName}" data-original="${e.saveName}" />`;
    return ` <tr data-slot="${e.slotName}" ${o ? 'class="selected"' : ""}> <td> <div class="save-name-cell"> ${s} <span class="save-tag ${e.saveType}">${e.saveType}</span> </div> </td> <td class="meta">Day ${e.gameDay || 0}</td> <td class="meta">${t}</td> <td>${n}</td> <td>${e.employees || 0}</td> <td class="meta">${a}</td> <td> <div class="save-row-actions"> <button class="save-action-btn load" data-action="load" data-slot="${e.slotName}">Load</button> <button class="save-action-btn export" data-action="export" data-slot="${e.slotName}">Export</button> ${"auto" !== e.saveType ? `<button class="save-action-btn delete" data-action="delete" data-slot="${e.slotName}">\u2715</button>` : ""} </div> </td> </tr> `;
  }
  buildCardHTML(e) {
    const t = new Date(e.saveDate).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }), n = xu(e.money || 0), a = this.formatPlaytime(e.playTime || 0), o = this.view.selectedId === e.slotName;
    let i = e.saveName;
    if ("autosave" === e.slotName) i = "Latest Autosave";
    else if (e.slotName.startsWith("autosave_")) i = `Autosave \u2014 ${wb(bb(e))}`;
    else if (/^quick_(\d+)$/.test(e.slotName)) {
      const t2 = parseInt(e.slotName.replace("quick_", "")), n2 = new Date(t2);
      i = `Quick Save \u2014 ${n2.toLocaleDateString()} ${n2.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    const s = "auto" === e.saveType ? `<span style="color:var(--d);font-size:0.95rem;font-weight:700;">${i}</span>` : `<input type="text" class="save-name-input" value="${i}" data-slot="${e.slotName}" data-original="${e.saveName}" style="background:transparent;border:none;color:var(--d);font-size:0.95rem;font-weight:700;padding:0;width:100%;" />`;
    return ` <div class="save-card ${o ? "selected" : ""}" data-slot="${e.slotName}"> <div class="save-card-header"> <div class="save-card-title"> <div class="save-card-name"> ${s} </div> <span class="save-tag ${e.saveType}">${e.saveType}</span> </div> </div> <div class="save-card-meta"> <div class="save-card-meta-item"> <span>\u{1F4C5}</span> <span>Day ${e.gameDay || 0}</span> </div> <div class="save-card-meta-item"> <span>\u{1F552}</span> <span>${t}</span> </div> <div class="save-card-meta-item"> <span>\u{1F4B0}</span> <span>${n}</span> </div> <div class="save-card-meta-item"> <span>\u{1F465}</span> <span>${e.employees || 0}</span> </div> <div class="save-card-meta-item"> <span>\u23F1\uFE0F</span> <span>${a}</span> </div> </div> <div class="save-card-actions"> <button class="save-action-btn load" data-action="load" data-slot="${e.slotName}">Load</button> <button class="save-action-btn export" data-action="export" data-slot="${e.slotName}">Export</button> ${"auto" !== e.saveType ? `<button class="save-action-btn delete" data-action="delete" data-slot="${e.slotName}">Delete</button>` : ""} </div> </div> `;
  }
  attachRowListeners() {
    const e = this.modal.querySelector("#sm-tbody"), t = this.modal.querySelector("#sm-card-container");
    [...e.querySelectorAll(".save-action-btn"), ...t.querySelectorAll(".save-action-btn")].forEach((e2) => {
      e2.addEventListener("click", (e3) => {
        const t2 = e3.target.dataset.action, n = e3.target.dataset.slot;
        "load" === t2 ? this.handleLoad(n) : "export" === t2 ? this.handleExport(n) : "delete" === t2 && this.handleDelete(n);
      });
    }), [...e.querySelectorAll(".save-name-input"), ...t.querySelectorAll(".save-name-input")].forEach((e2) => {
      e2.addEventListener("focus", (e3) => {
        e3.target.select(), this.editingNameId = e3.target.dataset.slot;
      }), e2.addEventListener("blur", (e3) => {
        this.handleRename(e3);
      }), e2.addEventListener("keydown", (e3) => {
        "Enter" === e3.key ? e3.target.blur() : "Escape" === e3.key && (e3.target.value = e3.target.dataset.original, e3.target.blur());
      });
    }), e.querySelectorAll("tr[data-slot]").forEach((e2) => {
      e2.addEventListener("click", (t2) => {
        "INPUT" !== t2.target.tagName && "BUTTON" !== t2.target.tagName && (this.view.selectedId = e2.dataset.slot, this.render());
      });
    }), t.querySelectorAll(".save-card[data-slot]").forEach((e2) => {
      e2.addEventListener("click", (t2) => {
        "INPUT" !== t2.target.tagName && "BUTTON" !== t2.target.tagName && (this.view.selectedId = e2.dataset.slot, this.render());
      });
    });
  }
  updateSortArrows() {
    this.modal.querySelectorAll("th.sortable").forEach((e) => {
      const t = e.querySelector(".sort-arrow");
      t && (e.dataset.sort === this.view.sortKey ? (t.textContent = "asc" === this.view.sortDir ? "\u25B4" : "\u25BE", t.style.opacity = "1") : (t.textContent = "\u25BE", t.style.opacity = "0.5"));
    });
  }
  formatPlaytime(e) {
    const t = Math.floor(e / 36e5), n = Math.floor(e % 36e5 / 6e4);
    return t > 0 ? `${t}h ${n}m` : `${n}m`;
  }
  async handleContinue() {
    const e = await Kv();
    if (0 === e.length) return void showNotification("\u274C No saves found!", "error");
    const t = e[0];
    await Vv(t.slotName), this.hide();
  }
  async handleQuickSave() {
    const e = `quick_${Date.now()}`;
    await saveGameToSlot(e, "quick", true), await this.render();
  }
  async handleQuickLoad() {
    const e = (await Kv()).filter((e2) => "quick" === e2.saveType);
    0 !== e.length ? (await Vv(e[0].slotName), this.hide()) : showNotification("\u274C No quick saves found!", "error");
  }
  async handleCreateSave() {
    const e = `manual_${Date.now()}`;
    await saveGameToSlot(e, "manual", true), await this.render();
  }
  async handleLoad(e) {
    false !== await Vv(e) && this.hide();
  }
  async handleExport(e) {
    await nb(e);
  }
  async handleExportSelected() {
    this.view.selectedId ? await nb(this.view.selectedId) : showNotification("\u274C No save selected!", "error");
  }
  async handleDelete(e) {
    await Ev(`Delete save "${e}"?

This cannot be undone!`, "Delete Save", { type: "danger", confirmText: "Delete" }) && (await Jv(e), await this.render());
  }
  async handleRename(e) {
    const t = e.target, n = t.dataset.slot, a = t.value.trim();
    if (a === n || "" === a || a === t.dataset.original) return t.value = t.dataset.original, void (this.editingNameId = null);
    await Qv(n, a) ? (this.view.selectedId === n && (this.view.selectedId = a), await this.render()) : t.value = t.dataset.original, this.editingNameId = null;
  }
  async handleImport(e) {
    const t = e.target.files[0];
    if (!t) return;
    const n = new FileReader();
    n.onload = async (e2) => {
      try {
        const t2 = e2.target.result, n2 = JSON.parse(t2);
        if (!n2.gameState) return void showNotification("\u274C Invalid save file format!", "error");
        const a = n2.meta?.saveName || "imported", o = n2.meta?.saveDate ? new Date(n2.meta.saveDate).toLocaleString() : "Unknown", i = n2.gameState.cash ? xu(n2.gameState.cash) : "Unknown";
        if (!await Ev(`Import save "${a}"?

\u{1F4B0} ${i}
\u{1F4C5} ${o}

This will create a new save slot.`, "Import Save", { type: "info", confirmText: "Import" })) return;
        await ob(n2), await this.render();
      } catch (e3) {
        console.error("[SaveManager] Import error:", e3), showNotification("\u274C Failed to import save!", "error");
      }
    }, n.readAsText(t), e.target.value = "";
  }
}
let Sb = null;
function Tb() {
  return Sb || (Sb = new SaveManager()), Sb;
}
async function loadGame() {
  try {
    await vb(), Fv('KV read attempt \u2192 slot "fuoc_save_autosave"');
    let e = await Gv("fuoc_save_autosave"), u2 = "fuoc_save_autosave";
    e || (Fv('Primary slot empty \u2192 trying legacy slot "gameState"'), (e = await Gv("gameState")) && (u2 = "gameState"));
    let G2 = false;
    try {
      "1" === localStorage.getItem("fuoc_intentional_reset") && (G2 = true, localStorage.removeItem("fuoc_intentional_reset"));
    } catch (u3) {
    }
    if (!e && G2 && Fv("DECISION: intentional reset sentinel present \u2192 NEW GAME (Save Manager snapshots preserved)"), !e && !G2) {
      const u3 = await Hv();
      if (u3.length > 0) return Fv("DECISION: live save slot EMPTY but other save slots exist \u2192 REFUSING to start new game (GUARD 3)", u3), console.warn(`[SaveManager] \u26A0 Live save slot empty while ${u3.length} other save(s) exist \u2014 NOT overwriting. Recover via Save Manager.`), _v = false, Dv = true, void showNotification("\u26A0 Could not load your latest save \u2014 open the Save Manager to recover it. Autosave is paused to protect your data.", "error", 12e3);
    }
    if (e) {
      Fv(`KV read OK \u2190 slot "${u2}" (${qv(e)} bytes)`), await Uv(e);
      const t = e.gameState || e;
      if (Fv("Parse OK \u2014 incoming save summary", jv(t)), t.usedEmployeeNames && Array.isArray(t.usedEmployeeNames) && (console.log(`[LoadGame] Pre-converting usedEmployeeNames Array (${t.usedEmployeeNames.length} items) to Set`), t.usedEmployeeNames = new Set(t.usedEmployeeNames)), t.blockedProactiveMessages && Array.isArray(t.blockedProactiveMessages) && (console.log(`[LoadGame] Pre-converting blockedProactiveMessages Array (${t.blockedProactiveMessages.length} items) to Set`), t.blockedProactiveMessages = new Set(t.blockedProactiveMessages)), t.recentTopics && !t.recentTopics.has) {
        const e2 = Object.entries(t.recentTopics);
        console.log(`[LoadGame] Pre-converting recentTopics object (${e2.length} items) to Map`), t.recentTopics = new Map(e2);
      }
      const n = gameState.hierarchyLevels;
      gameState = { ...gameState, ...t, hierarchyLevels: n, activeLocationId: t.activeLocationId || "garage", upgradeMultiplier: t.upgradeMultiplier || 1, time: { ...gameState.time, ...t.time || {}, currentTime: t.time?.currentTime || gameState.time.currentTime }, locations: (t.locations || gameState.locations).map((e2) => ({ unlocked: e2.unlocked ?? e2.owned ?? "garage" === e2.id, owned: e2.owned ?? e2.unlocked ?? "garage" === e2.id, ...e2 })), products: (t.products || gameState.products).map((e2) => ({ baseUpgradeCost: e2.baseUpgradeCost ?? e2.upgradeCost ?? 50, costGrowth: e2.costGrowth ?? 1.35, valueExponent: e2.valueExponent ?? 0.85, managerSpeedCapPct: e2.managerSpeedCapPct ?? 0.4, unlocked: e2.unlocked ?? "website" === e2.id, unlockCost: e2.unlockCost ?? ({ website: 0, app: 100, consulting: 400, cloud: 1800, seo: 3e3, branding: 5e3, ecommerce: 8e3, automation: 12e3, copywriting: 0, video_editing: 2e4, marketing: 35e3, consulting_premium: 55e3, saas: 85e3 }[e2.id] || 0), ...e2 })), employees: t.employees || gameState.employees, settings: { ...gameState.settings, ...t.settings || {} }, chatHistory: t.chatHistory || {}, typingStates: t.typingStates || {}, onboarding: t.onboarding || [], pendingAIRequests: { text: t.pendingAIRequests?.text || [], image: t.pendingAIRequests?.image || [] }, generationStats: { totalTextGenerations: t.generationStats?.totalTextGenerations || 0, totalImageGenerations: t.generationStats?.totalImageGenerations || 0 }, playerProfile: { ...gameState.playerProfile, ...t.playerProfile || {} }, socialNetwork: { ...gameState.socialNetwork, ...t.socialNetwork || {}, posts: t.socialNetwork?.posts || [], globalEvents: t.socialNetwork?.globalEvents || [], postIdCounter: t.socialNetwork?.postIdCounter || 0, algorithm: { sort: "foryou", bestTimeFrame: "all", contentRating: "all", postType: "all", author: "all", engagement: "all", searchQuery: "", ...t.socialNetwork?.algorithm || {} }, recentPostTypes: t.socialNetwork?.recentPostTypes || [], playerDraft: t.socialNetwork?.playerDraft || { caption: "", imagePrompt: "", altText: "", imageUrl: null } }, companyContext: { ...gameState.companyContext, ...t.companyContext || {} }, companyWideContext: { ...gameState.companyWideContext, ...t.companyWideContext || {}, currentBuzz: t.companyWideContext?.currentBuzz || [], lastUpdate: t.companyWideContext?.lastUpdate || Date.now(), maxItems: t.companyWideContext?.maxItems || 40, decayTime: t.companyWideContext?.decayTime || 6048e5 }, prestigeLevel: t.prestigeLevel ?? 0, influencePoints: t.influencePoints ?? 0, lifetimeEarnings: t.lifetimeEarnings ?? 0, lifetimeEarningsConverted: t.lifetimeEarningsConverted ?? 0, prestigeMultiplier: t.prestigeMultiplier ?? 1, globalUpgrades: { clickPower: t.globalUpgrades?.clickPower ?? 0, incomeBoost: t.globalUpgrades?.incomeBoost ?? {}, costReduction: t.globalUpgrades?.costReduction ?? {} }, bossFights: { active: t.bossFights?.active || null, defeated: t.bossFights?.defeated || [], history: t.bossFights?.history || [] }, raceSettings: Ml(t.raceSettings) }, gameState.employees.forEach((e2) => {
        if (initializeEmployeeSocialData(e2), ensureEmployeeMemory(e2), (() => {
          if (e2.race) {
            const u3 = String(e2.race).toLowerCase().trim();
            (RACES[u3] || Cl[u3]) && (e2.race = Il(u3));
          }
          e2.physical && "object" == typeof e2.physical && (!e2.physical.race && e2.race && (e2.physical.race = e2.race), lr(e2.physical));
        })(), e2.giftPreferences || (e2.giftPreferences = bl()), e2.hireDate || (e2.hireDate = Date.now() - 30 * Math.random() * 24 * 60 * 60 * 1e3), e2.career || (e2.career = { level: 1, title: gameState.hierarchyLevels[1].title, salary: gameState.hierarchyLevels[1].baseSalary, startDate: e2.hireDate || Date.now(), promotionHistory: [], directReports: [], managerId: null }, console.log(`[LoadGame] Initialized career data for ${e2.name} at Level 1`)), "Entry Level" === e2.career.title) {
          e2.career.title = "Staff", e2.career.level = 1;
          const t2 = gameState.hierarchyLevels?.[1];
          t2 && (e2.career.salary = t2.baseSalary), console.log(`[LoadGame Migration] Updated ${e2.name}'s title from "Entry Level" to "Staff" (Level 1)`);
        }
        if (e2.career) {
          const t2 = e2.career.level || 1, n2 = gameState.hierarchyLevels?.[t2], a2 = n2?.baseSalary || 1e5;
          if (e2.career.salary !== a2) {
            const o2 = e2.career.salary || 0;
            e2.career.salary = a2, o2 !== a2 && console.log(`[LoadGame Migration] Salary synced for ${e2.name}: $${o2.toLocaleString()} -> $${a2.toLocaleString()} (Level ${t2} ${n2?.title || "Staff"})`);
          }
        }
        if (e2.career && e2.career.title) {
          const t2 = Object.keys(gameState.hierarchyLevels || {}).find((t3) => {
            const n2 = gameState.hierarchyLevels[t3];
            return n2 && n2.title === e2.career.title;
          });
          t2 && e2.career.level != t2 && (e2.career.level = parseInt(t2), console.log(`[LoadGame Migration] Synced ${e2.name}'s level to ${t2} to match title "${e2.career.title}"`));
        }
      }), Array.isArray(gameState.groups) && gameState.groups.forEach((g) => {
        Array.isArray(g.messages) && g.messages.forEach((m) => {
          m && "string" != typeof m.imageDesc && (m.imageDesc = "");
        });
      });
      let a = 0;
      gameState.employees.forEach((e2) => {
        if (e2.position && /Manager\s*[–-]\s*(.+)/.test(e2.position)) {
          const t2 = e2.position.match(/Manager\s*[–-]\s*(.+?)(?:\s*•|$)/);
          if (t2) {
            const n2 = t2[1].trim();
            console.log(`[LoadGame Migration] Found old position for ${e2.name}: "${e2.position}" -> extracting product: "${n2}"`);
            const o2 = gameState.products.find((e3) => e3.name.toLowerCase() === n2.toLowerCase());
            o2 && o2.unlocked && !o2.managerHired ? (o2.managerHired = true, o2.managerId = e2.id, o2.managerLevel = o2.managerLevel || 1, o2.onboardStartTime = null, console.log(`[LoadGame Migration] \u2713 Auto-assigned ${e2.name} to "${o2.name}"`), a++) : o2 ? console.log(`[LoadGame Migration] \u26A0 Product "${n2}" found but already has staff or is locked`) : console.log(`[LoadGame Migration] \u26A0 Product "${n2}" not found`);
          }
        }
        e2.position && (console.log(`[LoadGame Migration] Cleaning up old position field for ${e2.name}: "${e2.position}"`), delete e2.position), e2.productManaged && (console.log(`[LoadGame Migration] Cleaning up old productManaged field for ${e2.name}: "${e2.productManaged}"`), delete e2.productManaged);
      }), a > 0 && (console.log(`[LoadGame Migration] Auto-assigned ${a} employee(s) to their products from old save data`), showNotification(`Migration: Auto-assigned ${a} employee(s) to their positions!`));
      const o = new Set(gameState.employees.filter((e2) => "active" === e2.employmentStatus).map((e2) => e2.id));
      let i = 0;
      gameState.products.forEach((e2) => {
        if (e2.managerHired && e2.managerId) {
          if (!o.has(e2.managerId)) {
            const t2 = gameState.employees.find((t3) => t3.id === e2.managerId), n2 = t2 ? `alumni/inactive (${t2.employmentStatus})` : "non-existent";
            console.log(`[LoadGame Migration] Product "${e2.name}" has ${n2} managerId: ${e2.managerId} - clearing`), e2.managerHired = false, e2.managerId = null, e2.managerLevel = 0, e2.managerOnboarding = false, e2.running = false, e2.timeRemainingMs = 0, i++;
          }
        } else e2.managerHired && !e2.managerId && (console.log(`[LoadGame Migration] Product "${e2.name}" has managerHired=true but no managerId - clearing`), e2.managerHired = false, e2.managerLevel = 0, i++);
      }), i > 0 && (console.log(`[LoadGame Migration] Fixed ${i} product(s) with invalid manager references`), showNotification(`Migration: Fixed ${i} orphaned product assignment(s).`)), gameState.products.forEach((e2) => {
        if (e2.managerHired && e2.managerId) {
          const t2 = gameState.corporatePyramid?.positions?.[1]?.find((t3) => t3.productId === e2.id);
          if (t2 && !t2.employeeId) {
            t2.employeeId = e2.managerId, t2.isVacant = false;
            const n2 = gameState.employees.find((t3) => t3.id === e2.managerId);
            n2 && console.log(`[LoadGame Migration] \u2713 Synced ${n2.name} to corporate pyramid position: ${t2.title}`);
          }
        }
      }), gameState.corporatePyramid?.positions && (Object.keys(gameState.corporatePyramid.positions).forEach((e2) => {
        const t2 = gameState.corporatePyramid.positions[e2];
        Array.isArray(t2) && t2.forEach((e3) => {
          if (e3.employeeId && !o.has(e3.employeeId)) {
            const t3 = gameState.employees.find((t4) => t4.id === e3.employeeId), n2 = t3 ? `alumni (${t3.employmentStatus})` : "non-existent";
            console.log(`[LoadGame Migration] Clearing ${n2} employee from pyramid position: ${e3.title}`), e3.employeeId = null, e3.isVacant = true;
          }
        });
      }), gameState.corporatePyramid.ceoPosition?.employeeId && !o.has(gameState.corporatePyramid.ceoPosition.employeeId) && (console.log("[LoadGame Migration] Clearing non-active employee from CEO position"), gameState.corporatePyramid.ceoPosition.employeeId = null, gameState.corporatePyramid.ceoPosition.isVacant = true), gameState.corporatePyramid.secretaryPosition?.employeeId && !o.has(gameState.corporatePyramid.secretaryPosition.employeeId) && (console.log("[LoadGame Migration] Clearing non-active employee from Secretary position"), gameState.corporatePyramid.secretaryPosition.employeeId = null, gameState.corporatePyramid.secretaryPosition.isVacant = true)), gameState.giftInventory || (gameState.giftInventory = { items: [], capacity: 1 / 0 }), gameState.giftStore || (gameState.giftStore = { items: [] }), void 0 === gameState.currentLifetimeIncome && (gameState.currentLifetimeIncome = gameState.totalEarnings || 0), gameState.givenUniqueGifts || (gameState.givenUniqueGifts = []), gameState.createdUniqueGifts || (gameState.createdUniqueGifts = []), gameState.time && 60 === gameState.time.timeScale && (console.log("[LoadGame] Updating timeScale from 60 to 20 (1 game min = 3 real seconds)"), gameState.time.timeScale = 20), gameState.usedEmployeeNames && gameState.usedEmployeeNames.has || (console.warn("[LoadGame] usedEmployeeNames not a Set, initializing empty Set"), gameState.usedEmployeeNames = /* @__PURE__ */ new Set()), gameState.blockedProactiveMessages && gameState.blockedProactiveMessages.has || (console.warn("[LoadGame] blockedProactiveMessages not a Set, initializing empty Set"), gameState.blockedProactiveMessages = /* @__PURE__ */ new Set()), gameState.recentTopics && gameState.recentTopics.has || (console.warn("[LoadGame] recentTopics not a Map, initializing empty Map"), gameState.recentTopics = /* @__PURE__ */ new Map()), gameState.genderSettings || (console.log("[LoadGame] Initializing missing genderSettings with defaults"), gameState.genderSettings = { female: 100, male: 0, femaleFuta: 0, transMan: 0, transWoman: 0 }), gameState.aiQuality || (console.log("[LoadGame] Initializing missing aiQuality (RLHF system) with defaults"), gameState.aiQuality = { goodExamples: { posts: [], comments: [], chats: [] }, badExamples: { posts: [], comments: [], chats: [] }, bannedPatterns: [], stats: { totalVotes: 0, upvotes: 0, downvotes: 0, postsVoted: 0, commentsVoted: 0, chatsVoted: 0 }, maxExamplesPerType: 20, tutorialShown: false }), gameState.playerMentionStats || (gameState.playerMentionStats = { totalMentions: 0, positiveReactions: 0, negativeReactions: 0, lastMentionTime: null }), gameState.activeGossip || (gameState.activeGossip = []), gameState.lastProactiveMessageCheck || (gameState.lastProactiveMessageCheck = 0), gameState.lifestyleAdjustmentCounter || (gameState.lifestyleAdjustmentCounter = 0), gameState.currentCandidates || (gameState.currentCandidates = null), gameState.usedEmployeeNames || (gameState.usedEmployeeNames = /* @__PURE__ */ new Set()), updateCompanyAwareness(), !gameState.employees.some((e2) => e2.relationships && Object.keys(e2.relationships).length > 0) && gameState.employees.length > 1 && generateRandomRelationships(), gl(), showNotification("Game loaded!"), gameState.settings?.maxAiRequests && (AIRequestQueue.updateMaxConcurrent(gameState.settings.maxAiRequests), console.log("[AI Queue] Re-initialized after game load with max:", gameState.settings.maxAiRequests));
      const G3 = gameState.offlineEarnings?.lastPlayedRealTime || gameState.lastPlayTime || gameState.lastInteractionTime || Date.now();
      $b(), gameState.time && (gameState.time._offlinePaused = false), pt(Date.now() - G3, "load");
    } else await migrateFromLocalStorage();
    Dv || _v ? _v && Fv("DECISION: loaded existing save", jv()) : (e || (Rv = true, Fv("DECISION: no existing save found anywhere \u2192 legitimate NEW GAME", jv())), _v = true, Fv("Load complete \u2014 save system READY", jv()));
  } catch (u2) {
    console.error("[SaveManager] Error loading game:", u2), Fv("DECISION: load FAILED with exception \u2192 refusing to overwrite save slot (GUARD 3)", String(u2 && u2.message || u2)), _v = false, Dv = true, showNotification("\u26A0 Could not load your save (read error) \u2014 open the Save Manager to recover it. Autosave is paused to protect your data.", "error", 12e3);
  }
}
function $b() {
  gameState.offlineEarnings || (gameState.offlineEarnings = { enabled: true, maxDuration: 864e5, rate: 0.5, lastPlayedRealTime: Date.now() });
  const e = Date.now(), t = gameState.offlineEarnings.lastPlayedRealTime || gameState.lastInteractionTime || gameState.lastPlayTime || e, n = e - t;
  if (n < 3e5) return gameState.offlineEarnings.lastPlayedRealTime = e, gameState.lastInteractionTime = e, void (gameState.lastPlayTime = e);
  if (!gameState.offlineEarnings.enabled) return gameState.offlineEarnings.lastPlayedRealTime = e, gameState.lastInteractionTime = e, void (gameState.lastPlayTime = e);
  const a = parseFloat(calculateCashPerSecond());
  if (a <= 0) return gameState.offlineEarnings.lastPlayedRealTime = e, gameState.lastInteractionTime = e, void (gameState.lastPlayTime = e);
  const o = Math.floor(n / 1e3), i = Math.floor(gameState.offlineEarnings.maxDuration / 1e3), s = Math.min(o, i);
  let r = gameState.offlineEarnings.rate;
  const l = gameState.influenceUpgrades?.offlineEarnings || 0;
  l > 0 && (r = Cb.offlineEarnings.effect(l));
  const c = a * s, d = Math.floor(c * r);
  console.log(`[AFK] Time away: ${(s / 60).toFixed(1)} minutes`), console.log(`[AFK] Income rate: $${wu(a)}/sec`), console.log(`[AFK] Full earnings (100%): $${wu(c)}`), console.log(`[AFK] AFK earnings (${(100 * r).toFixed(1)}%): $${wu(d)}`);
  const p = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), u2 = p > 0 ? `${p}h ${m}m` : `${m}m`, g = document.getElementById("afkIncomeModal"), h = document.getElementById("afkTimeAway"), y = document.getElementById("afkIncomeRate"), f = document.getElementById("afkFullEarnings"), b = document.getElementById("afkEarnings"), v = document.getElementById("afkRate"), w = document.getElementById("claimAfkIncome"), x = document.getElementById("closeAfkIncome");
  h && (h.textContent = u2), y && (y.textContent = `$${wu(a)}/sec`), f && (f.textContent = `$${wu(c)}`), b && (b.textContent = `$${wu(d)}`), v && (v.textContent = 100 * r + "%"), g && (g.style.display = "flex"), w && (w.onclick = () => {
    gameState.cash += d, gameState.currentLifetimeIncome = (gameState.currentLifetimeIncome || 0) + d, gameState.lastPlayTime = e, gameState.lastInteractionTime = e, gameState.offlineEarnings.lastPlayedRealTime = e, updateUI(), g && (g.style.display = "none"), showNotification(`Claimed $${wu(d)} AFK earnings!`);
  }), x && (x.onclick = () => {
    gameState.cash += d, gameState.currentLifetimeIncome = (gameState.currentLifetimeIncome || 0) + d, gameState.lastPlayTime = e, gameState.lastInteractionTime = e, gameState.offlineEarnings.lastPlayedRealTime = e, updateUI(), g && (g.style.display = "none");
  });
}
async function migrateFromLocalStorage() {
  try {
    const e = localStorage.gameState;
    if (e) {
      console.log("Migrating old localStorage save to kv-plugin...");
      const t = JSON.parse(e);
      await kv.gameSave.set("gameState", t), delete localStorage.gameState, console.log("Migration complete! Old localStorage data cleared."), showNotification("Save data migrated to new storage system!"), await loadGame();
    }
  } catch (u2) {
    console.error("Error migrating from localStorage:", u2);
  }
}
const Cb = { incomeMultiplier: { id: "incomeMultiplier", name: "Income Multiplier", description: "Increase all income by 10% per level", icon: "\u{1F4B0}", baseCost: 5, costIncrease: 1.3, maxLevel: 50, getCurrentLevel: () => gameState.influenceUpgrades?.incomeMultiplier || 0, effect: (e) => 1 + 0.1 * e }, startingCash: { id: "startingCash", name: "Starting Capital", description: "Start each prestige with more cash", icon: "\u{1F4B5}", baseCost: 3, costIncrease: 1.4, maxLevel: 100, getCurrentLevel: () => gameState.influenceUpgrades?.startingCash || 0, effect: (e) => 50 * e }, clickPower: { id: "clickPower", name: "Quick Hands", description: "Click products to reduce time by +0.05s per level", icon: "\u{1F446}", baseCost: 3, costIncrease: 1.3, maxLevel: 50, getCurrentLevel: () => gameState.influenceUpgrades?.clickPower || 0, effect: (e) => 0.05 * e }, employeeDiscount: { id: "employeeDiscount", name: "HR Efficiency", description: "Reduce employee costs by 5% per level", icon: "\u{1F454}", baseCost: 4, costIncrease: 1.35, maxLevel: 10, getCurrentLevel: () => gameState.influenceUpgrades?.employeeDiscount || 0, effect: (e) => Math.max(0.5, 1 - 0.05 * e) }, productDiscount: { id: "productDiscount", name: "Bulk Buying", description: "Reduce product costs by 3% per level", icon: "\u{1F4E6}", baseCost: 4, costIncrease: 1.35, maxLevel: 15, getCurrentLevel: () => gameState.influenceUpgrades?.productDiscount || 0, effect: (e) => Math.max(0.55, 1 - 0.03 * e) }, autoProgress: { id: "autoProgress", name: "Automation Boost", description: "Managers work 5% faster per level", icon: "\u26A1", baseCost: 6, costIncrease: 1.4, maxLevel: 20, getCurrentLevel: () => gameState.influenceUpgrades?.autoProgress || 0, effect: (e) => 1 + 0.05 * e }, bossWarrior: { id: "bossWarrior", name: "Boss Warrior", description: "Deal +15% damage to bosses per level", icon: "\u2694\uFE0F", baseCost: 8, costIncrease: 1.5, maxLevel: 25, getCurrentLevel: () => gameState.influenceUpgrades?.bossWarrior || 0, effect: (e) => 1 + 0.15 * e }, prestigeBonus: { id: "prestigeBonus", name: "Prestige Master", description: "Gain +5% more Influence Points per prestige per level", icon: "\u2728", baseCost: 10, costIncrease: 1.6, maxLevel: 20, getCurrentLevel: () => gameState.influenceUpgrades?.prestigeBonus || 0, effect: (e) => 1 + 0.05 * e }, offlineEarnings: { id: "offlineEarnings", name: "Passive Income", description: "Boost offline earnings rate (+5% per level, starting at 25%)", icon: "\u{1F4A4}", baseCost: 5, costIncrease: 1.35, maxLevel: 15, getCurrentLevel: () => gameState.influenceUpgrades?.offlineEarnings || 0, effect: (e) => Math.min(0.75, 0.25 + 0.05 * e) }, relationshipGains: { id: "relationshipGains", name: "Charisma", description: "Gifts build relationships +10% faster per level", icon: "\u{1F496}", baseCost: 5, costIncrease: 1.4, maxLevel: 25, getCurrentLevel: () => gameState.influenceUpgrades?.relationshipGains || 0, effect: (e) => 1 + 0.1 * e }, luckyStreak: { id: "luckyStreak", name: "Lucky Streak", description: "Random chance for 2x-5x income on product completion (+2% per level)", icon: "\u{1F340}", baseCost: 12, costIncrease: 1.5, maxLevel: 20, getCurrentLevel: () => gameState.influenceUpgrades?.luckyStreak || 0, effect: (e) => 0.02 * e }, employeeRetention: { id: "employeeRetention", name: "Employee Loyalty", description: "Keep +10% of employees after prestige per level", icon: "\u{1F91D}", baseCost: 15, costIncrease: 1.7, maxLevel: 10, getCurrentLevel: () => gameState.influenceUpgrades?.employeeRetention || 0, effect: (e) => Math.min(1, 0.1 * e) }, goldenParachute: { id: "goldenParachute", name: "Golden Parachute", description: "After prestige, your most expensive owned location starts unlocked", icon: "\u{1FA82}", baseCost: 60, costIncrease: 1, maxLevel: 1, getCurrentLevel: () => gameState.influenceUpgrades?.goldenParachute || 0, effect: (e) => e }, institutionalMemory: { id: "institutionalMemory", name: "Institutional Memory", description: "Workforce perks survive prestige \u2014 the HR paperwork outlives the company", icon: "\u{1F5C4}\uFE0F", baseCost: 35, costIncrease: 1, maxLevel: 1, getCurrentLevel: () => gameState.influenceUpgrades?.institutionalMemory || 0, effect: (e) => e }, procurementDesk: { id: "procurementDesk", name: "Procurement Desk", description: "Adds an Upgrade All (Max) action to the Business tab", icon: "\u{1F587}\uFE0F", baseCost: 40, costIncrease: 1, maxLevel: 1, getCurrentLevel: () => gameState.influenceUpgrades?.procurementDesk || 0, effect: (e) => e } };
function Eb() {
  const e = gameState.lifetimeEarnings - (gameState.lifetimeEarningsConverted || 0);
  let t = Math.floor(Math.sqrt(e / 1e4));
  const n = gameState.influenceUpgrades?.prestigeBonus || 0;
  if (n > 0) {
    const e2 = Cb.prestigeBonus.effect(n);
    t = Math.floor(t * e2);
  }
  return t;
}
function Ib(e) {
  const t = Cb[e];
  if (!t) return 0;
  const n = t.getCurrentLevel();
  return n >= t.maxLevel ? 1 / 0 : Math.ceil(t.baseCost * Math.pow(t.costIncrease, n));
}
function purchaseInfluenceUpgrade(e) {
  const t = Cb[e];
  if (!t) return false;
  const n = t.getCurrentLevel();
  if (n >= t.maxLevel) return showNotification("Upgrade is at max level!"), false;
  const a = Ib(e);
  return gameState.influencePoints < a ? (showNotification("Not enough Influence Points!"), false) : (gameState.influencePoints -= a, gameState.influenceUpgrades[e] = n + 1, showNotification(`Upgraded ${t.name} to level ${n + 1}!`), Pb(), Mb(), true);
}
function Mb() {
  const e = document.getElementById("influenceUpgradesContainer");
  e && (e.innerHTML = Object.values(Cb).map((e2) => {
    const t = e2.getCurrentLevel(), n = Ib(e2.id), a = t >= e2.maxLevel, o = !a && gameState.influencePoints >= n, i = a ? `<span class="badge upg-max">${1 === e2.maxLevel ? "OWNED" : "MAXED"}</span>` : `<button class="btn upg-buy num ${o ? "btn--be" : "btn--outline"}" ${o ? "" : "disabled"} data-ipcost="${n}" onclick="purchaseInfluenceUpgrade('${e2.id}')">${n} IP</button>`;
    return `<div class="upg-row${a ? " is-maxed" : ""}"><div class="upg-info"><div class="upg-name">${e2.icon} ${e2.name}</div><div class="upg-desc">${e2.description}</div></div><div class="upg-state"><span class="pill num">${1 === e2.maxLevel ? t >= 1 ? "Acquired" : "One-time" : `Lv ${t}/${e2.maxLevel}`}</span></div>${i}</div>`;
  }).join(""));
}
function Pb() {
  const e = document.getElementById("currentPrestigeLevel"), t = document.getElementById("lifetimeEarningsDisplay"), n = document.getElementById("currentInfluencePoints"), a = document.getElementById("currentMultiplier"), o = document.getElementById("nextPrestigeInfluence"), i = document.getElementById("prestigeRequirement");
  e && (e.textContent = gameState.prestigeLevel), t && (t.textContent = `$${wu(gameState.lifetimeEarnings)}`), n && (n.textContent = gameState.influencePoints);
  const s = gameState.influenceUpgrades?.incomeMultiplier || 0, r = Cb.incomeMultiplier.effect(s);
  a && (a.textContent = `${r.toFixed(1)}x`);
  const l = Eb();
  o && (o.textContent = l);
  const c = gameState.lifetimeEarnings >= 1e5 && l > 0, d = document.getElementById("prestigeBtn");
  if (d) {
    if (c) d.disabled = false, d.style.opacity = "1", d.style.cursor = "pointer", i && (i.textContent = "");
    else if (d.disabled = true, d.style.opacity = "0.5", d.style.cursor = "not-allowed", i) if (gameState.lifetimeEarnings < 1e5) {
      const e2 = 1e5 - gameState.lifetimeEarnings;
      i.textContent = `Requires $100k total earnings (need $${wu(e2)} more)`;
    } else {
      const e2 = gameState.lifetimeEarnings - (gameState.lifetimeEarningsConverted || 0), t2 = Math.max(0, 1e4 - e2);
      i.textContent = `Earn $${wu(t2)} more this run to gain Influence`;
    }
  }
}
function Ab() {
  const e = Eb();
  if (e <= 0 || gameState.lifetimeEarnings < 1e5) return void showNotification("You need at least $100k lifetime earnings to prestige!");
  const t = document.getElementById("prestigeModal"), n = document.getElementById("prestigeGainAmount");
  n && (n.textContent = `+${e}`), t && (t.style.display = "flex");
}
function executePrestige() {
  gameState.pendingAIRequests?.text?.length && (gameState.pendingAIRequests.text = gameState.pendingAIRequests.text.map((req) => ({ ...req, options: req.options ? Object.fromEntries(Object.entries(req.options).filter(([, v]) => "function" != typeof v)) : {} })));
  const u2 = structuredClone(gameState);
  try {
    const e = Eb();
    gameState.influencePoints += e, gameState.prestigeLevel += 1, gameState.lifetimeEarningsConverted = gameState.lifetimeEarnings, gameState.currentLifetimeIncome = 0;
    const t = gameState.influencePoints, n = gameState.prestigeLevel, a = gameState.lifetimeEarnings, o = gameState.lifetimeEarningsConverted, i = JSON.parse(JSON.stringify(gameState.influenceUpgrades || {})), s = JSON.parse(JSON.stringify(gameState.settings || {})), r = gameState.settings?.playerBio || "", l = JSON.parse(JSON.stringify(gameState.genderSettings || {})), c = JSON.parse(JSON.stringify(gameState.raceSettings || {})), u3 = gameState.hrSettings?.startingStatRanges || {}, d = { startingStatRanges: { productivity: { ...u3.productivity || {} }, trust: { ...u3.trust || {} }, friendship: { ...u3.friendship || {} }, desire: { ...u3.desire || {} }, comfort: { ...u3.comfort || {} }, affection: { ...u3.affection || {} } } }, p = { items: (gameState.giftInventory?.items || []).map((e2) => ({ ...e2 })), capacity: gameState.giftInventory?.capacity || 1 / 0 }, m = { items: (gameState.giftStore?.items || []).map((e2) => ({ ...e2 })) }, G2 = [...gameState.givenUniqueGifts || []], g = [...gameState.createdUniqueGifts || []];
    console.log(`\u{1F381} Preserving ${p.items.length} inventory gifts and ${m.items.length} store gifts through prestige`);
    const h = JSON.parse(JSON.stringify(gameState.generationStats || { totalTextGenerations: 0, totalImageGenerations: 0 })), y = JSON.parse(JSON.stringify(gameState.pregnancySettings || { duration: 14, minDuration: 7, maxDuration: 21 })), f = JSON.parse(JSON.stringify(gameState.ethnicitySettings || {}));
    console.log(`\u{1F4CA} Preserving generation stats: ${h.totalTextGenerations} text, ${h.totalImageGenerations} images`);
    const U2 = /* @__PURE__ */ new Set(), J2 = gameState.influenceUpgrades?.employeeRetention || 0;
    if (J2 > 0) {
      const e2 = gameState.employees.filter((e3) => e3 && e3.name && "active" === e3.employmentStatus), t2 = Math.floor(e2.length * Cb.employeeRetention.effect(J2));
      e2.sort((e3, t3) => cu(t3) - cu(e3)).slice(0, t2).forEach((e3) => U2.add(e3.id)), console.log(`\u{1F91D} Employee Loyalty: retaining ${U2.size} of ${e2.length} employees through prestige`);
    }
    gameState.employees.forEach((e2) => {
      if (e2 && "active" === e2.employmentStatus) try {
        jo(e2);
      } catch (u4) {
        console.warn("[Prestige] Failed to salvage social images for", e2.name, u4);
      }
    });
    const b = JSON.parse(JSON.stringify(gameState.formerEmployees || [])), v = [];
    gameState.employees.forEach((e2) => {
      if (!e2 || !e2.name) return;
      const t2 = JSON.parse(JSON.stringify(e2));
      if (U2.has(t2.id) && "active" === t2.employmentStatus) return t2.productManaged = null, t2.productId = null, t2.managerOnboarding = false, void v.push(t2);
      t2.hired = false, "active" === t2.employmentStatus && (t2.employmentStatus = "prestige_reset", t2.departureDate = gameState.time?.currentTime || Date.now(), t2.prestigeResetLevel = n, t2.productManaged = null, t2.productId = null, t2.career && (t2.career.previousLevel = t2.career.level, t2.career.previousTitle = t2.career.title, t2.career.level = 0, t2.career.title = "Former Employee")), v.push(t2);
    }), console.log(`\u{1F393} Preserved ${v.length} employees as alumni through prestige`);
    const w = JSON.parse(JSON.stringify(gameState.chatHistory || {}));
    console.log(`\u{1F4AC} Preserved chat history for ${Object.keys(w).length} conversations through prestige`);
    const ee2 = gameState.story ? JSON.parse(JSON.stringify(gameState.story)) : StoryEngine.getDefaultStoryState(), x = [];
    gameState.employees.forEach((e2) => {
      if (!e2 || !e2.name) return;
      if ("active" !== e2.employmentStatus) return;
      if (U2.has(e2.id)) return;
      const t2 = cu(e2), a2 = du(e2), o2 = { id: e2.id, name: e2.name, age: e2.age, gender: e2.gender, previousLevel: e2.career?.level || 1, previousTitle: e2.career?.title || "Staff", previousSalary: e2.career?.salary || 1e5, promotionHistory: e2.career?.promotionHistory ? [...e2.career.promotionHistory] : [], skills: e2.skills ? JSON.parse(JSON.stringify(e2.skills)) : {}, personality: JSON.parse(JSON.stringify(e2.personality || {})), relationshipStrength: t2, rehireBonus: a2, memory: e2.memory ? JSON.parse(JSON.stringify(e2.memory)) : {}, chatHistory: gameState.chatHistory[e2.id] ? JSON.parse(JSON.stringify(gameState.chatHistory[e2.id])) : [], physical: e2.physical ? JSON.parse(JSON.stringify(e2.physical)) : {}, photos: e2.photos ? JSON.parse(JSON.stringify(e2.photos)) : [], profileImage: e2.profileImage, bio: e2.bio, keyTrait: e2.keyTrait, personalityTraits: e2.personalityTraits ? [...e2.personalityTraits] : [], hobbies: e2.hobbies ? [...e2.hobbies] : [], kinks: e2.kinks ? [...e2.kinks] : [], productId: e2.productId, productManaged: e2.productManaged, giftPreferences: e2.giftPreferences ? JSON.parse(JSON.stringify(e2.giftPreferences)) : null, timesRehired: e2.timesRehired || 0, originalHireDate: e2.hireDate || Date.now(), lastPrestigeLevel: n };
      x.push(o2);
    }), console.log(`\u{1F4BC} Preserved ${x.length} employees to rehire pool`), gameState.employees.forEach((e2) => {
      if (e2.productManaged) {
        const t2 = b.findIndex((t3) => t3.originalId === (e2.originalId || e2.id)), a2 = { originalId: e2.originalId || e2.id, name: e2.name, age: e2.age, gender: e2.gender, position: e2.position, productManaged: e2.productManaged, profileImage: e2.profileImage, bio: e2.bio, personality: e2.personality, personalityTraits: e2.personalityTraits, hobbies: e2.hobbies, kinks: e2.kinks, traits: e2.traits, keyTrait: e2.keyTrait, physical: e2.physical, chatHistory: gameState.chatHistory[e2.id] || [], photos: e2.photos || [], memory: e2.memory, stats: e2.stats, relationships: e2.relationships, intimacy: e2.intimacy, timesRehired: t2 >= 0 ? (b[t2].timesRehired || 0) + 1 : 1, lastPrestigeLevel: n };
        t2 >= 0 ? b[t2] = a2 : b.push(a2);
      }
    });
    const S = { website: 0, app: 80, consulting: 300, cloud: 1200, seo: 3e3, branding: 5e3, ecommerce: 8e3, automation: 12e3, copywriting: 0, video_editing: 2e4, marketing: 35e3, consulting_premium: 55e3, saas: 85e3, virtual_assistant: 12e4, social_media_mgmt: 18e4, online_courses: 25e4, business_coaching: 35e4, digital_marketing: 48e4, enterprise_saas: 0, enterprise_software: 7e5, api_marketplace: 12e5, white_label: 2e6, cybersecurity: 35e5, data_analytics: 55e5, crm_system: 85e5, ai_integration: 13e6, blockchain: 2e7, acquisitions: 3e7, custom_keychains: 0, branded_tshirts: 35e6, phone_cases: 6e7, custom_mugs: 1e8, tech_gadgets: 15e7, luxury_merch: 23e7, smart_devices: 35e7, wearables: 52e7, vr_headsets: 78e7, drones: 117e7, patent_licensing: 0, venture_capital: 15e8, hedge_fund: 25e8, market_manipulation: 4e9, insider_trading: 65e8, tax_havens: 1e10, lobbying: 15e9, government_contracts: 23e9, space_tourism: 35e9, quantum_computing: 5e10 }, k = { website: 250, app: 750, consulting: 1500, cloud: 2500, seo: 4e3, branding: 6e3, ecommerce: 9e3, automation: 12500, copywriting: 17500, video_editing: 25e3, marketing: 35e3, consulting_premium: 5e4, saas: 75e3, virtual_assistant: 11e4, social_media_mgmt: 16e4, online_courses: 225e3, business_coaching: 325e3, digital_marketing: 45e4, enterprise_saas: 75e4, enterprise_software: 11e5, api_marketplace: 165e4, white_label: 25e5, cybersecurity: 375e4, data_analytics: 55e5, crm_system: 85e5, ai_integration: 13e6, blockchain: 2e7, acquisitions: 3e7, custom_keychains: 45e6, branded_tshirts: 7e7, phone_cases: 105e6, custom_mugs: 16e7, tech_gadgets: 24e7, luxury_merch: 36e7, smart_devices: 54e7, wearables: 81e7, vr_headsets: 1215e6, drones: 18225e5, patent_licensing: 273375e4, venture_capital: 4100625e3, hedge_fund: 6150937500, market_manipulation: 9226406250, insider_trading: 13839609375, tax_havens: 207594140625e-1, lobbying: 3113912109375e-2, government_contracts: 46708681640625e-3, space_tourism: 700630224609375e-4, quantum_computing: 105094533691406e-3 }, T = Cb.startingCash.effect(gameState.influenceUpgrades?.startingCash || 0), te2 = (gameState.influenceUpgrades?.goldenParachute || 0) > 0 && gameState.locations.filter((e2) => e2.unlocked && "garage" !== e2.id).sort((e2, t2) => (t2.cost || 0) - (e2.cost || 0))[0]?.id || null, C = { cash: le.startingCash + T, playerUpgrades: { clickPower: 0 }, totalEarnings: 0, onboarding: [], lastPlayTime: Date.now(), prestigeLevel: n, influencePoints: t, lifetimeEarnings: a, lifetimeEarningsConverted: o, prestigeMultiplier: 1, influenceUpgrades: i, globalUpgrades: { clickPower: 0, incomeBoost: {}, costReduction: {}, goldenTouch: 0, timeDilation: 0, empireBuilder: 0, workforce: (gameState.influenceUpgrades?.institutionalMemory || 0) > 0 ? JSON.parse(JSON.stringify(gameState.globalUpgrades?.workforce || {})) : {}, nightShift: {}, expressPermit: {}, keyholder: {}, flagship: { locationId: null, moves: 0 } }, bossFights: { active: null, defeated: [], history: [] }, locations: gameState.locations.map((e2) => ({ ...e2, owned: "garage" === e2.id || e2.id === te2, unlocked: "garage" === e2.id || e2.id === te2, products: [] })), activeLocationId: "garage", products: gameState.products.map((e2) => ({ id: e2.id, name: e2.name, locationId: e2.locationId, nsfwLevel: e2.nsfwLevel, valuePerUnit: e2.valuePerUnit, baseUpgradeCost: e2.baseUpgradeCost, costGrowth: e2.costGrowth, valuePerUpgrade: e2.valuePerUpgrade, valueExponent: e2.valueExponent, baseTimeMs: e2.baseTimeMs, clickSecondsBase: e2.clickSecondsBase, managerHireCost: e2.managerHireCost, managerUpgradeCost: void 0 !== k[e2.id] ? k[e2.id] : e2.managerUpgradeCost, managerSpeedCapPct: e2.managerSpeedCapPct, unlockCost: void 0 !== S[e2.id] ? S[e2.id] : e2.unlockCost, quantity: 0, level: 0, upgradeCost: e2.baseUpgradeCost, unlocked: false, running: false, timeRemainingMs: 0, managerHired: false, managerLevel: 0 })), employees: v, hierarchyLevels: gameState.hierarchyLevels, corporateHierarchy: { levels: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }, executiveRoles: { COO: null, CFO: null } }, corporatePyramid: { ceo: { positionId: "ceo", title: "CEO", level: 7, employeeId: "player", subordinates: [], isPlayer: true }, secretaryPosition: { positionId: "secretary", title: "Executive Secretary", level: 6.5, employeeId: null, reportsTo: "ceo", subordinates: [] }, positions: { 6: [{ positionId: "senior_exec", title: "Senior Executive", level: 6, employeeId: null, reportsTo: "ceo", subordinates: [], span: 2 }], 5: [{ positionId: "cfo", title: "Chief Financial Officer", level: 5, employeeId: null, reportsTo: "senior_exec", subordinates: [], span: 2 }, { positionId: "coo", title: "Chief Operating Officer", level: 5, employeeId: null, reportsTo: "senior_exec", subordinates: [], span: 2 }], 4: [{ positionId: "branch_mgr_1", title: "Branch Manager 1", level: 4, employeeId: null, reportsTo: "cfo", subordinates: [], locationsManaged: [], span: 3 }, { positionId: "branch_mgr_2", title: "Branch Manager 2", level: 4, employeeId: null, reportsTo: "cfo", subordinates: [], locationsManaged: [], span: 3 }, { positionId: "branch_mgr_3", title: "Branch Manager 3", level: 4, employeeId: null, reportsTo: "coo", subordinates: [], locationsManaged: [], span: 2 }, { positionId: "branch_mgr_4", title: "Branch Manager 4", level: 4, employeeId: null, reportsTo: "coo", subordinates: [], locationsManaged: [], span: 1 }], 3: [], 2: [], 1: [] }, promotionCosts: { 1: 500, 2: 2e3, 3: 1e4, 4: 5e4, 5: 15e4, 6: 5e5, 7: 0 } }, rehirePool: x, currentHiringCandidates: { newHires: [], rehires: [], productId: null, activeTab: "newHires" }, globalIncomeMultiplier: 1, formerEmployees: b, socialNetwork: { posts: [], globalEvents: [], postIdCounter: 0, lastPostGeneration: 0, postGenerationInterval: 3e5, feedFilter: "all", feedSort: "recent", algorithm: { sort: "foryou", bestTimeFrame: "all", contentRating: "all", postType: "all", author: "all", engagement: "all", searchQuery: "" }, recentPostTypes: [], playerDraft: { caption: "", imagePrompt: "", altText: "", imageUrl: null } }, companyContext: { totalEmployees: 0, locationEmployeeCounts: {}, recentHires: [], recentFires: [], recentPromotions: [], interdepartmentalEvents: [] }, socialFeed: [], socialStats: { totalPosts: 0, totalLikes: 0, totalComments: 0 }, chatHistory: w, activeChat: null, news: ["Tech startup raises $1M in seed funding", "New productivity app trends in office spaces", "Remote work policies reshape company cultures", "AI integration boosts efficiency across industries"], settings: { ...s, playerBio: r }, genderSettings: l, raceSettings: c, hrSettings: d, giftInventory: p, giftStore: m, givenUniqueGifts: G2, createdUniqueGifts: g, currentLifetimeIncome: 0, aiQuality: gameState.aiQuality || { goodExamples: { posts: [], comments: [], chats: [] }, badExamples: { posts: [], comments: [], chats: [] }, bannedPatterns: [], stats: { totalVotes: 0, upvotes: 0, downvotes: 0, postsVoted: 0, commentsVoted: 0, chatsVoted: 0 }, maxExamplesPerType: 20, tutorialShown: false }, generationStats: h, pregnancySettings: y, ethnicitySettings: f, time: { enabled: true, currentTime: Date.now(), timeScale: gameState.time?.timeScale ?? 20, baseTimeScale: gameState.time?.baseTimeScale ?? 20, lastHour: null, lastDay: null, paused: false, timeDilation: { enabled: true, conversationScale: 1, groupChatScale: 2, socialBrowsingScale: 10, idleScale: null }, activeContext: "idle" }, pendingAIRequests: { text: [], image: [] }, lastInteractionTime: Date.now(), pageHiddenTime: null, offlineEarnings: { enabled: true, maxDuration: 288e5, rate: 0.25, lastPlayedRealTime: Date.now() }, payroll: { enabled: true, lastPayday: null, totalPaidThisWeek: 0, weeklyPayrollHistory: [], autoPayEnabled: true, delayedWeeks: 0, bonusPool: 0 }, loans: [], raiseRequests: [], companyEvents: { active: [], history: [], nextEventCheck: Date.now(), eventChance: 0.15, eventsThisWeek: 0 }, npcScheduledEvents: [], performanceTracking: { enabled: true, lastUpdate: Date.now(), weeklyReviews: [], topPerformersHistory: [] }, bossImages: {}, bossFightSettings: gameState.bossFightSettings || { difficulty: "normal", largerButtons: false, highContrastIndicators: false, screenShakeIntensity: 1, reducedFlashing: false }, groups: [], activeGroup: null, groupSpeakerQueue: [], gifts: gameState.gifts || [{ id: "coffee", name: "Coffee", cost: 10, effect: { productivity: 5 }, description: "Boosts productivity" }, { id: "giftcard", name: "Gift Card", cost: 50, effect: { affection: 10 }, description: "Increases affection" }, { id: "lunch", name: "Lunch", cost: 30, effect: { comfort: 15 }, description: "Improves comfort" }, { id: "bonus", name: "Cash Bonus", cost: 100, effect: { desire: 20 }, description: "Raises desire" }], playerProfile: gameState.playerProfile || { companyName: "", firstName: "", lastName: "", age: null, gender: "", race: "human", ethnicity: "", physical: { heightBuild: "", hair: { color: "", style: "", length: "", texture: "" }, eyes: { color: "", shape: "" }, face: { shape: "", nose: "", lips: "", cheekbones: "", jawline: "", facialHair: "" }, skin: { tone: "", texture: "" }, body: { shape: "", chestSize: "", chestDescriptor: "chest", buttSize: "", legs: "" }, genitals: [], fashion: "", accessories: "", distinguishingFeature: "" }, personality: "", personalityTraits: [], hobbies: [], likes: [], dislikes: [], kinks: [], skinTone: "", height: "", bodyType: "", hairColor: "", hairStyle: "", eyeColor: "", facialHair: "", genitalType: "", genitalDetails: "", chestSize: "", buildDetails: "", additionalDetails: "" }, aiContextQuality: { employeeTracking: {}, vocabularyBanks: gameState.aiContextQuality?.vocabularyBanks || {}, intimacyEscalation: {}, repetitionWindow: 3, maxSameAction: 1, maxSameAnchor: 2, maxSameSlang: 2 }, flagDetection: { tracking: {}, suggestions: [], settings: gameState.flagDetection?.settings || { enabled: true, sensitivity: "medium", aiAssist: true, autoApprove: [] } }, flagChains: { active: [], suggestions: [], definitions: gameState.flagChains?.definitions || {} }, children: [], typingStates: {}, companyWideContext: { currentBuzz: [], lastUpdate: Date.now(), maxItems: 40, decayTime: 6048e5 }, activeTab: "dashboard", upgradeMultiplier: 1 };
    Object.keys(gameState).forEach((e2) => delete gameState[e2]), Object.assign(gameState, C), gameState.story = ee2, "function" == typeof Od && Od(), "function" == typeof initializeBossImages && initializeBossImages();
    const E = document.getElementById("prestigeModal");
    E && (E.style.display = "none"), saveGame(false), updateUI(), Pb(), Mb(), "function" == typeof renderSocialFeed && renderSocialFeed(true);
    const $2 = p.items.length + m.items.length, I = v.length - U2.size;
    if (showNotification(`\u2728 Prestiged! Gained ${e} Influence Points!${U2.size > 0 ? ` \u{1F91D} ${U2.size} loyal employees stayed!` : ""}${I > 0 ? ` \u{1F393} ${I} employees moved to Alumni!` : ""}${$2 > 0 ? ` \u{1F381} ${$2} gifts preserved!` : ""}`, 5e3), "function" == typeof Zn) try {
      Zn(n);
    } catch (u4) {
      console.warn("[Story] Prestige hook error:", u4);
    }
    switchTab("dashboard"), setTimeout(() => {
      try {
        updateDashboard(), sd(), updateBusinessTab(), updatePeopleTab();
      } catch (u4) {
        console.error("[Prestige] Post-prestige UI refresh error (non-fatal):", u4);
      }
    }, 100), setTimeout(maybeShowDiscordPromo, 600);
  } catch (G2) {
    console.error("[Prestige] executePrestige failed \u2014 rolling back:", G2), Object.keys(gameState).forEach((k) => delete gameState[k]), Object.assign(gameState, u2), showNotification("\u274C Prestige failed \u2014 no changes were made. Try reloading your save.", "error", 7e3);
    const E = document.getElementById("prestigeModal");
    E && (E.style.display = "none");
  }
}
function Lb(e) {
  return /^autosave_snap_\d+$/.test(e) || /^autosave_\d+$/.test(e);
}
function Nb() {
  const e = gameState.autosaveTracking || (gameState.autosaveTracking = {});
  return Array.isArray(e.snapshots) || (e.snapshots = []), e.snapshots;
}
function _b(e) {
  return `${((+e || 0) / 1024 | 0).toLocaleString()} KB`;
}
function Rb(e) {
  const t = Math.max(0, Math.floor((+e || 0) / 1e3)), n = Math.floor(t / 3600), a = Math.floor(t % 3600 / 60);
  return `${n}:${String(a).padStart(2, "0")}`;
}
async function Db() {
  try {
    const e = await kv.gameSave.keys() || [], t = [];
    for (const n of e) {
      if (!n.startsWith("fuoc_save_")) continue;
      const a = n.replace("fuoc_save_", "");
      if (!Lb(a)) continue;
      const o = await kv.gameSave.get(n);
      if (!o) continue;
      const i = o.meta || {};
      t.push({ slot: a, playTime: "number" == typeof i.playTime ? i.playTime : 0, saveDate: i.saveDate || (/* @__PURE__ */ new Date()).toISOString(), bytes: "number" == typeof i.bytes ? i.bytes : qv(o) });
    }
    t.sort((e2, t2) => t2.playTime - e2.playTime || new Date(t2.saveDate) - new Date(e2.saveDate)), gameState.autosaveTracking = gameState.autosaveTracking || {}, gameState.autosaveTracking.snapshots = t, Fv(`Snapshot manifest reconciled: ${t.length} snapshot(s), ${_b(t.reduce((e2, t2) => e2 + (t2.bytes || 0), 0))} total`);
  } catch (u2) {
    Fv(`Snapshot reconcile failed (non-fatal): ${String(u2 && u2.message || u2)}`);
  }
}
function Ob(e, t) {
  const n = [...e].sort((e2, t2) => t2.playTime - e2.playTime);
  if (n.length <= 1) return [];
  const a = [], o = [], r = /* @__PURE__ */ new Set();
  let l = 0;
  for (const e2 of n) {
    const n2 = t - e2.playTime, s2 = te.findIndex((e3) => n2 <= e3.maxAge);
    if (-1 === s2) {
      l < oe ? (a.push(e2), l++) : o.push(e2);
      continue;
    }
    const i = `${s2}:${Math.floor(e2.playTime / te[s2].minSpacing)}`;
    r.has(i) ? o.push(e2) : (r.add(i), a.push(e2), l++);
  }
  for (a.sort((e2, t2) => t2.playTime - e2.playTime); a.length > ne; ) o.push(a.pop());
  let s = a.reduce((e2, t2) => e2 + (t2.bytes || 0), 0);
  for (; s > ae && a.length > oe; ) {
    const e2 = a.pop();
    s -= e2.bytes || 0, o.push(e2);
  }
  return o;
}
async function Bb() {
  const e = Nb(), t = void 0, n = Ob(e, gameState.totalPlayTime || 0);
  if (n.length) {
    const t2 = new Set(n.map((e2) => e2.slot));
    for (const e2 of n) try {
      await kv.gameSave.delete(`fuoc_save_${e2.slot}`);
    } catch (t3) {
      console.warn(`[Snapshot] Failed to delete evicted slot ${e2.slot}:`, t3);
    }
    gameState.autosaveTracking.snapshots = e.filter((e2) => !t2.has(e2.slot));
  }
  return n.map((e2) => e2.slot);
}
function Fb() {
  const e = Nb(), t = gameState.totalPlayTime || 0, n = { lastMin: 0, last10: 0, lastHour: 0, lastDay: 0, older: 0 };
  for (const a of e) {
    const e2 = t - a.playTime;
    e2 <= 6e4 && n.lastMin++, e2 <= 6e5 && n.last10++, e2 <= 36e5 && n.lastHour++, e2 <= 864e5 && n.lastDay++, e2 > 864e5 && n.older++;
  }
  return n;
}
async function jb() {
  const e = `autosave_snap_${Date.now()}`, t = gameState.totalPlayTime || 0;
  let n;
  try {
    n = await saveGameToSlot(e, "auto", false);
  } catch (t2) {
    if ("QuotaExceededError" !== t2?.name && !t2?.message?.includes("QuotaExceededError")) return void console.error("[Snapshot] Write failed:", t2);
    {
      console.warn("[Snapshot] Storage full \u2014 evicting oldest snapshot(s) and retrying.");
      const e2 = Nb().sort((e3, t4) => e3.playTime - t4.playTime).slice(0, 3);
      for (const t4 of e2) try {
        await kv.gameSave.delete(`fuoc_save_${t4.slot}`);
      } catch (e3) {
      }
      const t3 = new Set(e2.map((e3) => e3.slot));
      gameState.autosaveTracking.snapshots = Nb().filter((e3) => !t3.has(e3.slot));
      try {
        n = await saveGameToSlot(`autosave_snap_${Date.now()}`, "auto", false);
      } catch (e3) {
        return void console.error("[Snapshot] Retry after eviction failed:", e3);
      }
    }
  }
  if (!n) return;
  const a = n.meta?.bytes || qv(n);
  Nb().unshift({ slot: n.meta?.saveName || e, playTime: t, saveDate: n.meta?.saveDate || (/* @__PURE__ */ new Date()).toISOString(), bytes: a });
  const i = await Bb(), s = Nb(), r = s.reduce((e2, t2) => e2 + (t2.bytes || 0), 0), l = Fb();
  console.log(`[Snapshot] \u{1F4F8} ${e} | ${_b(a)} | pool: ${s.length} snaps, ${_b(r)} total | playtime ${Rb(t)} | tiers \u27E81m:${l.lastMin} 10m:${l.last10} 1h:${l.lastHour} 24h:${l.lastDay}\u27E9` + (i.length ? ` | evicted ${i.length}` : ""));
}
function snapshotReport() {
  const e = Nb(), t = e.reduce((e2, t2) => e2 + (t2.bytes || 0), 0), n = e.reduce((e2, t2) => Math.max(e2, t2.bytes || 0), 0), a = Fb();
  return console.log(`[Snapshot Report] ${e.length} snapshots | total ${_b(t)} | avg ${_b(e.length ? t / e.length : 0)} | largest ${_b(n)} | budget ${_b(ae)}`), console.log(`[Snapshot Report] distribution \u2192 last 1m:${a.lastMin}  10m:${a.last10}  1h:${a.lastHour}  24h:${a.lastDay}  older:${a.older}`), console.table(e.map((e2) => ({ slot: e2.slot, ageOfPlay: Rb((gameState.totalPlayTime || 0) - e2.playTime), size: _b(e2.bytes), savedAt: e2.saveDate }))), { count: e.length, totalBytes: t, tiers: a };
}
gameState.influenceUpgrades || (gameState.influenceUpgrades = {}, Object.keys(Cb).forEach((e) => {
  gameState.influenceUpgrades[e] = 0;
}));
let qb = null;
function setupAutosave() {
  qb && (clearInterval(qb), qb = null), gameState.settings.autosave && (gameState.autosaveTracking || (gameState.autosaveTracking = { lastSnapshotPlayTime: 0, snapshots: [] }), Array.isArray(gameState.autosaveTracking.snapshots) || (gameState.autosaveTracking.snapshots = []), "number" != typeof gameState.autosaveTracking.lastSnapshotPlayTime && (gameState.autosaveTracking.lastSnapshotPlayTime = 0), qb = setInterval(async () => {
    const e = gameState.autosaveTracking || (gameState.autosaveTracking = { lastSnapshotPlayTime: 0, snapshots: [] });
    await saveGameToSlot("autosave", "auto", false);
    const t = gameState.totalPlayTime || 0;
    t - (e.lastSnapshotPlayTime || 0) >= ee && (e.lastSnapshotPlayTime = t, await jb());
  }, 5e3));
}
function exportSave() {
  try {
    const parts = Zv({ version: "250116200000", timestamp: gameState.time?.currentTime || Date.now(), date: (/* @__PURE__ */ new Date()).toISOString(), gameState }), n = `FreeUseOffice-Save-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
    try {
      const e = new Blob(parts, { type: "application/json" }), a = URL.createObjectURL(e), o = document.createElement("a");
      o.href = a, o.download = n, document.body.appendChild(o), o.click(), document.body.removeChild(o), URL.revokeObjectURL(a), showNotification(`\u{1F4BE} Save exported: ${n}`, "success");
    } catch (u2) {
      let t;
      console.log("Download failed, trying clipboard fallback...", u2);
      try {
        t = parts.join("");
      } catch (u3) {
        return console.error("Clipboard fallback also failed (save too large to join):", u3), void showNotification("\u274C Save too large to export via fallback. Try Save Manager \u2192 export a trimmed slot instead.", "error", 8e3);
      }
      navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t).then(() => {
        showNotification("\u{1F4CB} Save data copied to clipboard! Paste it into a text file to save.", "success", 5e3);
      }).catch((e) => {
        console.log("Clipboard failed, showing modal...", e), zb(t, n);
      }) : zb(t, n);
    }
  } catch (u2) {
    console.error("Error exporting save:", u2), showNotification("\u274C Failed to export save!", "error");
  }
}
function zb(e, t) {
  const n = document.createElement("div");
  n.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bn); z-index:10000; display:flex; align-items:center; justify-content:center; padding:20px;", n.innerHTML = ` <div style="background:var(--h); border-radius:12px; padding:20px; max-width:600px; width:100%; max-height:90vh; overflow:auto;"> <h3 style="margin:0 0 15px 0; color:var(--d);">\u{1F4CB} Export Save Data</h3> <p style="color:var(--a); font-size:0.9rem; margin:0 0 15px 0;"> Copy this text and save it to a file named: <strong style="color:var(--b);">${t}</strong> </p> <textarea readonly style="width:100%; height:300px; background:var(--i); border:1px solid var(--t); border-radius:6px; color:var(--b); padding:10px; font-family:monospace; font-size:0.85rem; resize:vertical;">${e}</textarea> <div style="display:flex; gap:10px; margin-top:15px;"> <button onclick="navigator.clipboard.writeText(this.parentElement.parentElement.querySelector('textarea').value).then(() => showNotification('\u{1F4CB} Copied to clipboard!', 'success')).catch(() => showNotification('\u274C Copy failed', 'error'))" style="flex:1; padding:12px; background:var(--n); border:none; border-radius:8px; color:var(--q); font-weight:600; cursor:pointer;"> \u{1F4CB} Copy to Clipboard </button> <button onclick="this.closest('div[style*="position:fixed"]').remove()" style="flex:1; padding:12px; background:var(--l); border:none; border-radius:8px; color:var(--s); font-weight:600; cursor:pointer;"> Close </button> </div> </div> `, document.body.appendChild(n), n.querySelector("textarea").select(), showNotification("\u{1F4BE} Save data ready! Copy and paste into a text file.", "info", 5e3);
}
function Gb() {
  const e = document.getElementById("importFileInput");
  e ? e.click() : showNotification("\u274C Import system not available!", "error");
}
function handleImportedFile(e) {
  const t = e.target.files[0];
  if (!t) return;
  const n = new FileReader();
  n.onload = async function(t2) {
    try {
      const e2 = t2.target.result, n2 = JSON.parse(e2);
      if (!n2.gameState) return void (void 0 !== n2.cash && void 0 !== n2.products ? await Ev("This appears to be an old save format. Import anyway? (May cause issues)", "Old Save Format", { type: "warning", confirmText: "Import Anyway" }) && await loadSaveData(n2) : showNotification("\u274C Invalid save file format!", "error"));
      const a = n2.date ? new Date(n2.date).toLocaleString() : "Unknown", o = n2.gameState.cash ? xu(n2.gameState.cash) : "Unknown", s = `\uFFFD Money: ${o}
\u{1F465} Employees: ${n2.gameState.employees ? n2.gameState.employees.length : 0}
\u2728 Prestige Level: ${n2.gameState.prestigeLevel || 0}
\u{1F4C5} Save Date: ${a}

\u26A0\uFE0F This will overwrite your current progress!`;
      await Ev(s, "\u{1F4E5} Import Save File?", { type: "warning" }) && (await loadSaveData(n2.gameState), showNotification("\u2705 Save imported successfully!", "success"));
    } catch (u2) {
      console.error("Error importing save:", u2), showNotification("\u274C Failed to import save! File may be corrupted.", "error");
    }
    e.target.value = "";
  }, n.onerror = function() {
    showNotification("\u274C Failed to read file!", "error");
  }, n.readAsText(t);
}
async function loadSaveData(e) {
  try {
    if (!e || "object" != typeof e) throw new Error("Invalid save data structure");
    gameState.pendingAIRequests?.text?.length && (gameState.pendingAIRequests.text = gameState.pendingAIRequests.text.map((req) => ({ ...req, options: req.options ? Object.fromEntries(Object.entries(req.options).filter(([, v]) => "function" != typeof v)) : {} })));
    const t = structuredClone(gameState);
    Object.keys(gameState).forEach((e2) => delete gameState[e2]), Object.assign(gameState, t, e, { hierarchyLevels: t.hierarchyLevels, settings: { ...t.settings, ...e.settings || {} }, time: { ...t.time, ...e.time || {}, currentTime: e.time?.currentTime || t.time?.currentTime }, socialNetwork: { ...t.socialNetwork, ...e.socialNetwork || {}, algorithm: { ...t.socialNetwork?.algorithm, ...e.socialNetwork?.algorithm || {} } }, bossFights: { ...t.bossFights, ...e.bossFights || {} }, globalUpgrades: { ...t.globalUpgrades, ...e.globalUpgrades || {} }, playerProfile: { ...t.playerProfile, ...e.playerProfile || {} }, companyContext: { ...t.companyContext, ...e.companyContext || {} }, companyWideContext: { ...t.companyWideContext, ...e.companyWideContext || {} } }), gameState.usedEmployeeNames && Array.isArray(gameState.usedEmployeeNames) && (gameState.usedEmployeeNames = new Set(gameState.usedEmployeeNames)), gameState.blockedProactiveMessages && Array.isArray(gameState.blockedProactiveMessages) && (gameState.blockedProactiveMessages = new Set(gameState.blockedProactiveMessages)), gameState.recentTopics && !gameState.recentTopics.has && (gameState.recentTopics = new Map(Object.entries(gameState.recentTopics))), Array.isArray(gameState.employees) && gameState.employees.forEach((e2) => {
      if ("function" == typeof initializeEmployeeSocialData && initializeEmployeeSocialData(e2), "function" == typeof ensureEmployeeMemory && ensureEmployeeMemory(e2), e2.giftPreferences || "function" != typeof bl || (e2.giftPreferences = bl()), e2.career || (e2.career = { level: 1, title: gameState.hierarchyLevels?.[1]?.title || "Staff", salary: gameState.hierarchyLevels?.[1]?.baseSalary || 1e5, startDate: e2.hireDate || Date.now(), promotionHistory: [], directReports: [], managerId: null }), e2.career) {
        const t2 = e2.career.level || 1, n = gameState.hierarchyLevels?.[t2];
        n && (e2.career.salary = n.baseSalary);
      }
    }), console.log("[LoadSave] Merged save data with default state (migration-safe)"), gameState.autosaveTracking || (gameState.autosaveTracking = { lastSnapshotTime: Date.now(), currentSlotIndex: 0, snapshotIntervalMinutes: 5 }, console.log("[LoadSave] Restored missing autosaveTracking")), gameState.flagDetection && "object" == typeof gameState.flagDetection || (gameState.flagDetection = { tracking: {}, suggestions: [], settings: {} }, console.log("[LoadSave] Restored missing flagDetection"));
    {
      const e2 = gameState.flagDetection;
      e2.tracking && "object" == typeof e2.tracking || (e2.tracking = {}), Array.isArray(e2.suggestions) || (e2.suggestions = []), e2.settings && "object" == typeof e2.settings || (e2.settings = {}), void 0 === e2.settings.enabled && (e2.settings.enabled = true), e2.settings.sensitivity || (e2.settings.sensitivity = "medium"), void 0 === e2.settings.aiAssist && (e2.settings.aiAssist = true), Array.isArray(e2.settings.autoApprove) || (e2.settings.autoApprove = []);
    }
    gameState.socialNetwork?.posts && Array.isArray(gameState.socialNetwork.posts) && (gameState.socialNetwork.posts.forEach((e2) => {
      Array.isArray(e2.likes) || (e2.likes = []), Array.isArray(e2.comments) || (e2.comments = []), Array.isArray(e2.dislikes) || (e2.dislikes = []);
    }), console.log("[LoadSave] Validated social post arrays")), Array.isArray(gameState.employees) && gameState.employees.forEach((e2) => {
      e2.flags && (Array.isArray(e2.flags.systemFlags) || (e2.flags.systemFlags = []), Array.isArray(e2.flags.customFlags) || (e2.flags.customFlags = []));
    }), gameState.settings || (gameState.settings = { autosave: true, maxAiRequests: 15, maxImageRequests: 8 }, console.log("[LoadSave] Restored missing settings")), gameState.settings.autoVisualization ? (void 0 === gameState.settings.autoVisualization.customPrompt && (gameState.settings.autoVisualization.customPrompt = ""), void 0 === gameState.settings.autoVisualization.addToGallery && (gameState.settings.autoVisualization.addToGallery = true), void 0 === gameState.settings.autoVisualization.cooldownAfterManual && (gameState.settings.autoVisualization.cooldownAfterManual = true), void 0 === gameState.settings.autoVisualization.intensityDetection && (gameState.settings.autoVisualization.intensityDetection = false), void 0 === gameState.settings.autoVisualization.intensityThreshold && (gameState.settings.autoVisualization.intensityThreshold = 50)) : (gameState.settings.autoVisualization = { enabled: false, minFrequency: 5, maxFrequency: 10, style: "global", perspective: "dynamic", nsfwLevel: "match", customPrompt: "", addToGallery: true, cooldownAfterManual: true, intensityDetection: false, intensityThreshold: 50, totalGenerated: 0 }, console.log("[LoadSave] Added missing autoVisualization settings"));
    try {
      await kv.gameSave.set("gameState", gameState);
    } catch (e2) {
      console.warn("[LoadSave] Storage save failed, but load continuing:", e2);
    }
    return _v = true, Dv = false, Rv = false, Ov = true, Fv("Save loaded via Save Manager / import \u2014 save system READY", jv()), updateUI(), Pb(), Mb(), switchTab("dashboard"), setTimeout(() => {
      try {
        updateDashboard(), sd(), updateBusinessTab(), updatePeopleTab(), updateSocialTab();
        const e2 = $("customCompanyContext"), t2 = $("customWorldContext"), n = $("customAIContext");
        e2 && gameState.settings?.customContext?.company && (e2.value = gameState.settings.customContext.company), t2 && gameState.settings?.customContext?.world && (t2.value = gameState.settings.customContext.world), n && gameState.settings?.customContext?.aiNotes && (n.value = gameState.settings.customContext.aiNotes);
      } catch (u2) {
        console.error("[LoadSave] Post-load UI refresh error (non-fatal):", u2), showNotification("\u26A0\uFE0F Save loaded, but a panel failed to refresh.", "warning", 5e3);
      }
    }, 100), setupAutosave(), void 0 !== AIRequestQueue && gameState.settings && (AIRequestQueue.updateMaxConcurrent(gameState.settings.maxAiRequests || 15), console.log("[LoadSave] Reinitialized AI Request Queue")), true;
  } catch (e2) {
    return console.error("Error loading save data:", e2), e2.message?.includes("QuotaExceededError") ? showNotification("\u{1F4BE} Storage full! Game loaded but autosave disabled.", "warning", 8e3) : e2.message?.includes("tracking is undefined") ? showNotification("\u{1F527} Save data repaired automatically.", "success", 4e3) : showNotification("\u274C Failed to load save data!", "error"), false;
  }
}
async function resetGame() {
  if (await Ev("Are you sure you want to reset the game? This will start a fresh game, but your saved games will remain available in the Save Manager.", "Reset Game", { type: "danger", confirmText: "Reset" })) try {
    Mv = true, qb && (clearInterval(qb), qb = null), await new Promise((e) => setTimeout(e, 100)), (() => {
      try {
        localStorage.setItem("fuoc_intentional_reset", "1");
      } catch (u2) {
      }
    })(), await kv.gameSave.delete("fuoc_save_autosave"), await kv.gameSave.delete("gameState"), localStorage.removeItem("gameState"), await (async () => {
      try {
        const e = await kv.gameSave.keys() || [];
        for (const t of e) t.startsWith("fuoc_save_") && Lb(t.replace("fuoc_save_", "")) && await kv.gameSave.delete(t);
      } catch (u2) {
        console.warn("[Reset] Snapshot cleanup failed (non-fatal):", u2);
      }
    })(), await new Promise((e) => setTimeout(e, 100)), showNotification("Game reset! Starting fresh game. Your saves are still in Save Manager."), await new Promise((e) => setTimeout(e, 500)), location.reload();
  } catch (u2) {
    console.error("Error resetting game:", u2), showNotification("Error resetting game. Please try again."), Mv = false;
  }
}
function unlockLocation(e) {
  const t = gameState.locations.find((t2) => t2.id === e);
  if (!t) return showNotification("Location not found!");
  if (t.unlocked) return showNotification("Location already unlocked!");
  if (!checkLocationUnlockable(e)) return showNotification("Complete all products in previous locations first!");
  if (gameState.cash < t.cost) return showNotification(`Need $${wu(t.cost)} to unlock ${t.name}!`);
  gameState.cash -= t.cost, t.unlocked = true, t.owned = true, Od(), gameState.activeLocationId = e;
  const n = gameState.products.find((t2) => t2.locationId === e);
  n && 0 === n.unlockCost && (n.unlocked = true), "function" == typeof onLocationUnlocked && onLocationUnlocked(e);
  const a = gameState.locations.findIndex((t2) => t2.id === e);
  if (a >= 0 && a < gameState.locations.length - 1) {
    const e2 = gameState.locations[a + 1];
    "function" != typeof generateUniqueBoss || gameState.bossFights?.generatedBosses?.[e2.id] || generateUniqueBoss(e2.id).catch((e3) => console.warn("[Boss] Failed to pre-generate next boss:", e3));
  }
  showNotification(`${t.name} unlocked!`), updateBusinessTab(), updateUI();
}
function purchaseLocation(e) {
  unlockLocation(e);
}
function generateInitialEmployees() {
  const e = ["Hardworking", "Creative", "Analytical", "Charismatic", "Detail-oriented", "Adaptable"], t = ["Friendly", "Reserved", "Outgoing", "Thoughtful", "Energetic", "Calm"], n = ["Reading", "Photography", "Hiking", "Gaming", "Cooking", "Traveling", "Music", "Art", "Yoga", "Dancing"], a = ["Exhibitionism", "Bondage", "Roleplay", "Dominance", "Submission", "Voyeurism", "Teasing", "Spanking"];
  for (let o = 0; o < 2; o++) {
    const i = wl(), s = "function" == typeof selectRaceForEmployee ? selectRaceForEmployee() : "human", r = "human" === s && "function" == typeof kl ? kl() : null, l = generateUniqueName(i, r, s), c = e[Math.floor(Math.random() * e.length)], d = t[Math.floor(Math.random() * t.length)], p = Math.floor(3 * Math.random()) + 1, m = [];
    for (; m.length < p; ) {
      const e2 = n[Math.floor(Math.random() * n.length)];
      m.includes(e2) || m.push(e2);
    }
    const u2 = Math.floor(3 * Math.random()) + 2, g = [];
    for (; g.length < u2; ) {
      const e2 = a[Math.floor(Math.random() * a.length)];
      g.includes(e2) || g.push(e2);
    }
    const h = { affection: 20 + Math.floor(20 * Math.random()), comfort: 40 + Math.floor(30 * Math.random()), trust: 30 + Math.floor(30 * Math.random()), desire: 5 + Math.floor(15 * Math.random()), obedience: 40 + Math.floor(30 * Math.random()), productivity: 50 + Math.floor(30 * Math.random()) }, y = ni(i, s, r), f = { confidence: 30 + Math.floor(50 * Math.random()), outgoing: 20 + Math.floor(60 * Math.random()), flirty: 10 + Math.floor(70 * Math.random()), professional: 30 + Math.floor(50 * Math.random()), humor: 20 + Math.floor(60 * Math.random()) };
    gameState.employees.push({ id: `emp_${Date.now()}_${o}`, name: l, position: "Employee", gender: i, race: s, ethnicity: r, trait: c, personality: f, personalityTraits: [d], hobbies: m, kinks: g, stats: h, level: 1, hired: true, bio: `A ${d.toLowerCase()} and ${c.toLowerCase()} team member who enjoys ${m.join(", ")}.`, physical: y, profileImage: null, memory: [] });
  }
}
