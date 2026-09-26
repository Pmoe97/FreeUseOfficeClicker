// ============================================================================
// 23-npc-psychology — NPC psychology: archetypes RACE_AXIS_PRIORS, scene state, memory/remember, voice, chat sanitization, spending rate, quality tracking.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

// ── Phase 4 Pass 1: per-NPC state surface + procedural personality axes ──
// Per-race nudges (added to axis baselines, then jittered). Unknown/human races use {} (neutral).
const RACE_AXIS_PRIORS = {
    succubus: { forwardness: 30, dominance: 15, agreeableness: -10, loyalty: -10 },
    incubus: { forwardness: 30, dominance: 15, agreeableness: -10, loyalty: -10 },
    demon: { dominance: 20, volatility: 15, agreeableness: -15, loyalty: -10 },
    tiefling: { dominance: 10, volatility: 10, forwardness: 8 },
    angel: { agreeableness: 20, loyalty: 20, volatility: -15, forwardness: -8 },
    vampire: { dominance: 18, expressiveness: -8, forwardness: 12, attachment: 10 },
    elf: { expressiveness: -8, volatility: -10, agreeableness: 8 },
    orc: { dominance: 18, volatility: 12, expressiveness: 8 },
    goblin: { volatility: 18, agreeableness: -8, forwardness: 8 },
    dwarf: { volatility: -10, loyalty: 15, dominance: 8 },
    halfling: { agreeableness: 15, volatility: -8, expressiveness: 8 },
    dragonborn: { dominance: 18, loyalty: 12, expressiveness: 8 },
    fox: { forwardness: 15, expressiveness: 10, agreeableness: -5 },
    cat: { agreeableness: -8, dominance: 8, expressiveness: -5 },
    wolf: { dominance: 15, loyalty: 15, attachment: 10 },
    werewolf: { dominance: 15, volatility: 15, attachment: 10 },
    bunny: { agreeableness: 12, forwardness: 10, expressiveness: 10 },
    rabbit: { agreeableness: 12, forwardness: 10, expressiveness: 10 },
    fairy: { expressiveness: 15, volatility: 12, agreeableness: 8 },
    dryad: { agreeableness: 12, volatility: -10, attachment: 12 },
    mermaid: { expressiveness: 10, agreeableness: 8 },
    lamia: { forwardness: 18, dominance: 12, attachment: 12 },
    centaur: { dominance: 12, loyalty: 12 },
    harpy: { volatility: 15, expressiveness: 12, dominance: 8 },
    slime: { agreeableness: 12, volatility: 10, forwardness: 8 },
    ghost: { expressiveness: -10, attachment: 15 },
    robot: { expressiveness: -20, volatility: -20, forwardness: -10 },
    cyborg: { expressiveness: -10, volatility: -10 },
    alien: { volatility: 10, agreeableness: -5 },
};
const PERSONALITY_AXES = [
    "agreeableness",
    "dominance",
    "expressiveness",
    "volatility",
    "attachment",
    "forwardness",
    "loyalty",
];
// Procedurally derive the 7 personality axes (0..100), coherent with the NPC's race prior and
// existing flat personality, with deterministic per-NPC variance (same id → same axes, so legacy
// back-fill on load is reproducible). No LLM call. (Phase 4 Pass 1, Decisions 3/4/5.)
function derivePersonalityAxes(e) {
    const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
    const seedStr = String((e && (e.id || e.name)) || "npc");
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) (h ^= seedStr.charCodeAt(i)), (h = Math.imul(h, 16777619));
    let state = h >>> 0;
    const rand = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0), state / 4294967296);
    const jitter = (base, spread) => clamp(base + (2 * rand() - 1) * spread);
    const p = (e && e.personality) || {},
        flirty = p.flirty ?? 50,
        confidence = p.confidence ?? 50,
        outgoing = p.outgoing ?? 50,
        professional = p.professional ?? 50;
    const prior = RACE_AXIS_PRIORS[(e && e.race ? String(e.race).toLowerCase() : "human")] || {};
    const base = {
        agreeableness: 50,
        dominance: confidence, // confident → more dominant
        expressiveness: outgoing, // outgoing → more expressive
        volatility: clamp(100 - professional), // professional → more even-tempered
        attachment: 50,
        forwardness: flirty, // flirty → more forward
        loyalty: 50,
    };
    const axes = {};
    for (const k of PERSONALITY_AXES) axes[k] = jitter(base[k] + (prior[k] || 0), 12);
    return axes;
}
// Bridge-sync write-through (Phase 4 Pass 3, TRANSITIONAL): axes are the source of truth; when they
// are edited, push the 4 mapped axes back onto the legacy flat-five so the ~31 legacy readers +
// formatPersonality keep working unchanged. Inverse of the derivePersonalityAxes forward map (no
// jitter). `humor` has no axis → left untouched (last flat-five holdout). agreeableness/attachment/
// loyalty have no flat-five home → write nowhere. Future supersede pass retires this + the flat-five.
function syncFlatFiveFromAxes(npc) {
    if (!npc || !npc.personality || !npc.personality.axes || "object" != typeof npc.personality.axes) return;
    const ax = npc.personality.axes,
        p = npc.personality,
        clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
    "number" == typeof ax.dominance && (p.confidence = clamp(ax.dominance));
    "number" == typeof ax.expressiveness && (p.outgoing = clamp(ax.expressiveness));
    "number" == typeof ax.forwardness && (p.flirty = clamp(ax.forwardness));
    "number" == typeof ax.volatility && (p.professional = clamp(100 - ax.volatility));
}
// Stand up the four dormant/active per-NPC fields with safe defaults (back-compat: legacy saves
// missing any field get it here on load, never throwing). sceneState + personality.axes are active
// this pass; voice + eventMemory are dormant structure. (Phase 4 Pass 1, Decision 1.)
function ensureEmployeeStateSurface(e) {
    if (!e) return;
    (e.sceneState && "object" == typeof e.sceneState) ||
        (e.sceneState = { clothing: "", pose: "", ongoingAction: "", nsfw: "", updatedTurn: 0, scenarioId: "" });
    (e.personality && "object" == typeof e.personality) || (e.personality = {});
    (e.personality.axes && "object" == typeof e.personality.axes) ||
        (e.personality.axes = derivePersonalityAxes(e));
    void 0 === e.personality.freeform && (e.personality.freeform = "");
    (e.voice && "object" == typeof e.voice) || (e.voice = { override: "" });
    void 0 === e.voice.override && (e.voice.override = "");
    Array.isArray(e.eventMemory) || (e.eventMemory = []);
}
// ── Phase 4 Pass 1 / Bug B: scene-state persistence (B1 — derive from affirmed narration) ──
// Coarse "scene era" = game day; sceneState older than the current era is treated as stale
// (new-day / scene-change reset valve) without needing to hook every day-advance site.
function currentSceneEra() {
    return String((gameState.time && gameState.time.day) ?? 0);
}
// Returns the NPC's live sceneState only if it's from the current era and actually carries state;
// otherwise null (so default/stale NPCs surface nothing — preserves Phase 3 byte-identical baseline).
function activeSceneState(npc) {
    const s = npc && npc.sceneState;
    if (!s || "object" != typeof s) return null;
    if (s.scenarioId && s.scenarioId !== currentSceneEra()) return null;
    return s.clothing || s.ongoingAction || s.pose ? s : null;
}
function sceneStateIsUndressed(npc) {
    const s = activeSceneState(npc);
    return !!(s && /\b(undress|undressed|nude|naked|topless|bottomless|strip|stripped)\b/i.test(s.clothing || ""));
}
function sceneStateToPromptLine(npc) {
    const s = activeSceneState(npc);
    if (!s) return "";
    const bits = [];
    s.clothing && bits.push(`currently ${s.clothing}`), s.pose && bits.push(s.pose), s.ongoingAction && bits.push(s.ongoingAction);
    return bits.length
        ? `📸 CURRENT PHYSICAL STATE (carried over from earlier this scene — stays true until it changes): ${bits.join("; ")}.`
        : "";
}
// Derive a sceneState update from the NPC's NARRATED outcome (not the player's request). Reuses the
// existing detector vocabulary (strip/undress/nude…, kiss/straddle…). Returns null if nothing affirmed.
function deriveSceneStateFromNarration(text) {
    if (!text || "string" != typeof text) return null;
    const t = text.toLowerCase();
    if (
        /\b(gets? dressed|get redressed|redress(es|ed)?|put(s|ting)? (her|his|their|my)?\s*clothes back|pull(s|ed)? (her|his|their|my)?\s*(shirt|top|dress|clothes) back on|button(s|ed)? (up|her|his)|cover(s|ed)? (up|herself|himself|themselves))\b/.test(
            t
        )
    )
        return { clothing: "", nsfw: "", ongoingAction: "" };
    const upd = {};
    let touched = !1;
    if (
        /\b(strips?|stripped|stripping|undress(es|ed|ing)?|take(s|n)? off (her|his|their|my)?\s*(shirt|top|dress|bra|clothes|pants)|pull(s|ed)? off (her|his|their|my)?\s*(shirt|top|dress|bra|clothes)|remove(s|d)? (her|his|their|my)?\s*(shirt|top|dress|bra|clothes)|naked|nude|topless|bottomless|clothes off)\b/.test(
            t
        )
    )
        (upd.clothing = "undressed"), (upd.nsfw = "explicit"), (touched = !0);
    const act = t.match(/\b(kissing|making out|straddl\w+|grinding|going down on|riding|on (her|his|their) knees)\b/);
    return act && ((upd.ongoingAction = act[0]), (upd.nsfw = upd.nsfw || "explicit"), (touched = !0)), touched ? upd : null;
}
function applySceneStateFromNarration(npc, text) {
    if (!npc) return;
    const upd = deriveSceneStateFromNarration(text);
    if (!upd) return;
    (npc.sceneState && "object" == typeof npc.sceneState) ||
        (npc.sceneState = { clothing: "", pose: "", ongoingAction: "", nsfw: "", updatedTurn: 0, scenarioId: "" });
    Object.assign(npc.sceneState, upd),
        (npc.sceneState.updatedTurn = (gameState.time && gameState.time.currentTime) || Date.now()),
        (npc.sceneState.scenarioId = currentSceneEra());
}
// ── Phase 4 Pass 2 / Workstream C: eventMemory (parallel structured store, reused detection) ──
// Push a condensed event into the locked top-level e.eventMemory (NOT e.memory.items). Dedup by
// summary; intensity-weighted ~8 cap (evict resolved/lowest-intensity first).
function addEventMemory(npc, entry) {
    if (!npc || !entry || !entry.summary) return;
    Array.isArray(npc.eventMemory) || (npc.eventMemory = []);
    const arr = npc.eventMemory,
        dup = arr.find((e) => e && !e.resolved && e.summary === entry.summary);
    if (dup) return (dup.intensity = Math.max(dup.intensity || 0, entry.intensity || 0)), void (dup.turn = entry.turn);
    arr.push(entry),
        arr.length > 8 &&
            (arr.sort((a, b) => Number(b.resolved) - Number(a.resolved) || (a.intensity || 0) - (b.intensity || 0)),
            arr.shift());
}
// Resolution valve (mirrors Pass 1 redress→clear): NPC narration that reconciles flips unresolved
// conflict entries to resolved.
function resolveEventMemories(npc, text) {
    if (!npc || !Array.isArray(npc.eventMemory) || !text) return;
    const t = String(text).toLowerCase();
    /\b(sorry|apolog|my bad|forgive|make it up|made up|making up|reconcil|i was wrong|move past (it|this)|no hard feelings|we'?re (good|okay|ok)|all good now|hug it out)\b/.test(
        t
    ) && npc.eventMemory.forEach((e) => e && "conflict" === e.type && !e.resolved && (e.resolved = !0));
}
// Derive condensed events from the NPC's NARRATED outcome (affirmed action, not the raw request).
// Reuses the existing detection vocabulary. Records only relational / conflict / commitment — never
// mundane work chatter. Summaries are short paraphrases, never raw message text.
function detectEventSignals(npc, text, ctx) {
    if (!npc || !text || "string" != typeof text) return;
    ctx = ctx || {};
    resolveEventMemories(npc, text);
    const t = text.toLowerCase(),
        turn = (gameState.time && gameState.time.currentTime) || Date.now(),
        involves = ctx.involves || [],
        add = (type, summary, intensity) => addEventMemory(npc, { type, summary, intensity, involves, turn, resolved: !1 });
    /\b(refuse|refused|won'?t|will not|no way|not doing|snap|snapped|glare|glared|storm|stormed off|slam|slammed|coldly|bites? back|scoff|scoffed|rolls? (her|his|their) eyes)\b/.test(
        t
    ) && add("conflict", "pushed back / clashed with the Boss", 0.6),
        /\b(hurt|stung|wounded|betrayed|ignored|overlooked|dismissed|humiliat|embarrass)\b/.test(t) &&
            add("conflict", "felt hurt or dismissed by the Boss", 0.7),
        /\b(kiss|kissed|hug|hugged|embrace|caress|cuddl|nuzzl|holds? (her|him|them) close)\b/.test(t) &&
            add("relational", "shared a tender/physical moment with the Boss", 0.7),
        /\b(blush|melt|heart (skip|flutter)|adore|love you|so happy|grateful|smiles? warmly)\b/.test(t) &&
            add("relational", "felt close/affectionate toward the Boss", 0.5),
        /\b(promise|i'?ll be there|see you (tonight|tomorrow|then)|it'?s a date|marry|move in|forever|always be (yours|here))\b/.test(
            t
        ) && add("commitment", "made a promise/commitment with the Boss", 0.6);
}
// ── Phase 4 Pass 2 / Workstream B: procedural emotion derivation (no LLM call) ──
// In GROUP, whether the player's instruction is directed at a DIFFERENT NPC (the jealousy trigger).
function instructionTargetsOther(npc, instruction, roster) {
    const msg = (null == instruction ? "" : String(instruction)).toLowerCase().trim();
    if (!msg || !npc || !roster || !roster.length) return null;
    const nameHit = (nm) => {
        const f = (nm || "")
            .split(" ")[0]
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
        return f.length >= 2 && new RegExp(`\\b${f}\\b`).test(msg);
    };
    if (nameHit(npc.name) || msg.includes((npc.name || "").toLowerCase())) return null;
    return roster.find((p) => p && p.id !== npc.id && nameHit(p.name)) || null;
}
// Pick the dominant WARRANTED emotion from axes (propensities) + unresolved eventMemory (durability)
// + this turn's incoming signal/addressing. Derives AGAINST default agreeableness. Returns null when
// nothing is warranted (→ block emits nothing → byte-identity safe).
function deriveEmotion(npc, signal) {
    signal = signal || {};
    const ax = (npc && npc.personality && npc.personality.axes) || {},
        A = (k) => ("number" == typeof ax[k] ? ax[k] : 50),
        agreeableness = A("agreeableness"),
        volatility = A("volatility"),
        attachment = A("attachment");
    let anger = 0,
        jealousy = 0,
        hurt = 0,
        warm = 0;
    const events = npc && Array.isArray(npc.eventMemory) ? npc.eventMemory.filter((e) => e && !e.resolved) : [];
    for (const e of events) {
        const w = e.intensity || 0.5;
        "conflict" === e.type
            ? ((anger += w * (0.5 + volatility / 200)), (hurt += w * (1 - agreeableness / 100)))
            : "relational" === e.type
              ? (warm += w * (0.4 + attachment / 200))
              : "commitment" === e.type && (warm += 0.3 * w);
    }
    const inc = (null == signal.incoming ? "" : String(signal.incoming)).toLowerCase();
    inc &&
        /\b(stupid|idiot|useless|shut up|worthless|pathetic|hate you|disappointed|incompetent|fuck you|screw you|you'?re fired)\b/.test(
            inc
        ) &&
        (anger += 0.6 * (0.6 + volatility / 200) + 0.4 * (1 - agreeableness / 100));
    signal.addressedOther && (jealousy += 0.4 + attachment / 150);
    const cands = [
        ["angry", anger],
        ["jealous", jealousy],
        ["hurt", hurt],
        ["warm", warm],
    ].sort((a, b) => b[1] - a[1]);
    return cands[0][1] < 0.5 ? null : { emotion: cands[0][0], intensity: Math.min(1, cands[0][1]) };
}
// ── Pass 2 prompt-tail blocks — each returns "" when neutral/empty (byte-identity preserved) ──
function buildEmotionHintBlock(npc, signal) {
    const d = deriveEmotion(npc, signal);
    if (!d) return "";
    const map = {
        angry: "You are genuinely angry or irritated right now — do NOT smooth it over or play nice just to be agreeable. Let it show in what you say.",
        jealous:
            "The Boss's attention is on someone else and it stings — let a flicker of jealousy or pointedness show; don't pretend you don't notice.",
        hurt: "You're still hurt by something unresolved between you — be a little guarded or wounded; don't act like everything is fine.",
        warm: "You feel genuinely warm and drawn toward the Boss right now — let that affection color how you respond.",
    };
    const line = map[d.emotion];
    return line ? `💢 EMOTIONAL STATE (let this shape your reply — do NOT default to agreeable/complacent): ${line}` : "";
}
function buildEventMemoryBlock(npc) {
    const arr = npc && Array.isArray(npc.eventMemory) ? npc.eventMemory : [],
        open = arr
            .filter((e) => e && !e.resolved && e.summary)
            .sort((a, b) => (b.intensity || 0) - (a.intensity || 0))
            .slice(0, 4);
    return open.length
        ? "🧠 STILL UNRESOLVED BETWEEN YOU AND THE BOSS (colors how you feel — bring it up only if it fits):\n" +
              open.map((e) => `- ${e.summary}`).join("\n")
        : "";
}
function buildVoiceBlock(npc) {
    let v = npc && npc.voice && npc.voice.override ? String(npc.voice.override).trim() : "";
    // Chat used to drop the voice entirely when no explicit override was set (logged as
    // "voice block absent"), while social posts always derived one. Fall back to the same
    // personality-derived social voice card so chat and posts speak in one consistent voice.
    if (!v && npc && "function" == typeof getSocialVoiceCard)
        try {
            v = String(getSocialVoiceCard(npc) || "").trim();
        } catch (_) {
            v = "";
        }
    // The social voice card can carry post-only directives (e.g. "starts posts
    // mid-thought like a continuation"). In a SOCIAL POST that's correct — posts
    // open with "...and ...". In CHAT it makes the NPC begin every single reply
    // with "...and", which reads as a broken record. Strip any clause that tells
    // the model to start mid-thought / as a continuation before using it for chat.
    if (v)
        v = v
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s && !/mid-?thought|continuation|starts?\s+posts?/i.test(s))
            .join("; ");
    return v
        ? `🗣️ VOICE (how ${(npc.name || "this character").split(" ")[0]} speaks — keep it consistent): ${v}`
        : "";
}
function composeExtraTail(blocks) {
    const parts = (blocks || []).map((s) => (s || "").trim()).filter(Boolean);
    return parts.length ? "\n\n" + parts.join("\n\n") : "";
}
function ensureEmployeeStats(e) {
    if (!e || !e.stats) {
        if (!e) return;
        e.stats = {};
    }
    const t = e.stats;
    void 0 !== t.love && void 0 === t.affection && ((t.affection = t.love), delete t.love),
        void 0 !== t.efficiency &&
            void 0 === t.productivity &&
            ((t.productivity = t.efficiency), delete t.efficiency),
        void 0 !== t.anger &&
            (void 0 === t.obedience && (t.obedience = Math.max(0, 100 - t.anger)), delete t.anger),
        void 0 === t.affection && (t.affection = 30),
        void 0 === t.comfort && (t.comfort = 50),
        void 0 === t.trust && (t.trust = 40),
        void 0 === t.desire && (t.desire = 10),
        void 0 === t.obedience && (t.obedience = 50),
        void 0 === t.productivity && (t.productivity = 60);
    for (const e of ["affection", "comfort", "trust", "desire", "obedience", "productivity"])
        void 0 !== t[e] && (t[e] = Math.max(0, Math.min(100, t[e])));
}
function remember(e, t, n = "note", a = 1) {
    if (!e) return;
    if ((ensureEmployeeMemory(e), !t)) return;
    if (isAiFallback(t))
        return void console.warn("[Memory] Refusing to remember AI-fallback text:", t);
    if (
        !(
            (e.memory && e.memory.items) ||
            (console.error("[Memory] Employee memory not properly initialized:", e.name),
            ensureEmployeeMemory(e),
            e.memory && e.memory.items)
        )
    )
        return void console.error("[Memory] Failed to initialize memory for:", e.name);
    const o = Date.now(),
        i = t.trim().toLowerCase(),
        s = e.memory.items.find((e) => e.text.trim().toLowerCase() === i);
    if (s) return (s.ts = o), (s.importance = Math.max(s.importance, a)), void (s.count = (s.count || 1) + 1);
    e.memory.items.push({ text: t, type: n, importance: a, ts: o, count: 1 }),
        e.memory.items.length > e.memory.cap &&
            (e.memory.items.sort(
                (e, t) => e.importance + 0.1 * (e.count || 1) - (t.importance + 0.1 * (t.count || 1))
            ),
            e.memory.items.shift());
}
function extractSalientFacts(e, t) {
    const n = [];
    if (!e) return n;
    const a = e.toLowerCase(),
        o = (e, t, a = 1) => n.push({ text: e, type: t, importance: a });
    return (
        /\b(promot|raise|level up)\b/.test(a) && o("Discussed promotion/raise", "event", 1.8),
        /\b(fire|fir(e|ing)|terminat(e|ion))\b/.test(a) && o("Termination discussed", "event", 2),
        /\b(deadline|ship|launch|deliver(y|able)?)\b/.test(a) && o("Work deadline mentioned", "work", 1.3),
        /\b(gift|present|bonus)\b/.test(a) && o("Gift or bonus mentioned", "event", 1.4),
        /\b(meet(ing)?|1:1|one on one)\b/.test(a) && o("Meeting planned", "event", 1.1),
        /\b(date|coffee|lunch|dinner)\b/.test(a) && !/deadline/.test(a) && o("Social invitation", "relation", 1.5),
        /\b(thank|appreciate|grateful)\b/.test(a) && o("Expressed gratitude", "relation", 1),
        /\b(sorry|apolog|my bad)\b/.test(a) && o("Apologized", "relation", 1),
        /\b(love|adore|crush)\b/.test(a) && o("Romantic sentiment", "relation", 1.6),
        /\b(frustrat|annoy|angry|upset)\b/.test(a) && o("Negative emotion", "relation", 1.2),
        /\b(flirt|tease|cute|hot|sexy|attractive)\b/.test(a) && o("Flirtatious exchange", "relation", 1.4),
        /\b(kiss|touch|hold|hug|embrace)\b/.test(a) && o("Physical affection discussed", "intimacy", 1.7),
        /\b(want|desire|need) (you|me|us)\b/.test(a) && o("Expressed desire", "intimacy", 1.5),
        n
    );
}
function scoreMemory(e, t, n) {
    const a = t ? t.filter((t) => e.text.toLowerCase().includes(t)).length : 0,
        o = 1 / Math.max(1, (Date.now() - (e.ts || 0)) / 36e5);
    let i = 0;
    if (n && n.memory && n.memory.styleCounters) {
        const t = n.memory.styleCounters,
            a = e.text.toLowerCase(),
            o =
                /\b(manage|job|work|position|role)\b/.test(a) ||
                (n.productManaged && a.includes(n.productManaged.toLowerCase())),
            s = (n.hobbies || []).some((e) => a.toLowerCase().includes(e.toLowerCase()));
        o && t.total - t.lastJobMention < 8 && (i = 2), s && t.total - t.lastHobbyMention < 6 && (i = 2.5);
    }
    const s = "relation" === e.type || "intimacy" === e.type ? 0.8 : 0;
    return 0.6 * a + 0.9 * (e.importance || 1) + 0.5 * o + 0.1 * (e.count || 1) + s - i;
}
function retrieveMemories(e, t, n = 25) {
    ensureEmployeeMemory(e);
    const a = tokenize(t).slice(0, 20);
    return e.memory.items
        .slice()
        .sort((t, n) => scoreMemory(n, a, e) - scoreMemory(t, a, e))
        .slice(0, n);
}
function calculateScaledSpendingRate(e = null) {
    const t = Math.max(1e3, gameState.cash),
        n = Math.log10(t),
        a = Math.max(1, 1 + 0.5 * (n - 3));
    null === e && (e = 50 + 100 * Math.random());
    const o = e * a;
    return Math.min(o, 5e4);
}
function initializeAITracking(e) {
    gameState.aiContextQuality.employeeTracking[e] ||
        (gameState.aiContextQuality.employeeTracking[e] = {
            physicalActions: [],
            narrativeAnchors: [],
            sensoryWords: [],
            slangWords: [],
            responseStructures: [],
            humorCount: 0,
            lastResponseTime: Date.now(),
            recentActionPhrases: [],
        }),
        gameState.aiContextQuality.employeeTracking[e].recentActionPhrases ||
            (gameState.aiContextQuality.employeeTracking[e].recentActionPhrases = []),
        gameState.aiContextQuality.employeeTracking[e].slangWords ||
            (gameState.aiContextQuality.employeeTracking[e].slangWords = []),
        gameState.aiContextQuality.intimacyEscalation[e] || (gameState.aiContextQuality.intimacyEscalation[e] = 0);
}
function extractActionPhrases(e) {
    if (!e) return [];
    const t = (e.match(/\*([^*]+)\*/g) || [])
        .map((e) => {
            let t = e.replace(/\*/g, "").trim();
            return (t = t.toLowerCase().replace(/\s+/g, " ")), t.split(" ").length < 2 ? null : t;
        })
        .filter(Boolean);
    return [...new Set(t)];
}
function getActionCore(e) {
    if (!e) return "";
    const t = [
        "the",
        "a",
        "an",
        "her",
        "his",
        "their",
        "my",
        "your",
        "our",
        "nervously",
        "quickly",
        "slowly",
        "gently",
        "softly",
        "roughly",
        "suddenly",
        "quietly",
        "loudly",
        "carefully",
        "slightly",
        "immediately",
        "finally",
        "just",
        "then",
        "still",
        "again",
        "back",
        "up",
        "down",
        "away",
        "over",
    ];
    return e
        .toLowerCase()
        .split(/\s+/)
        .filter((e) => !t.includes(e) && e.length > 2)
        .slice(0, 3)
        .join(" ");
}
function areActionsSimilar(e, t) {
    if (!e || !t) return !1;
    const n = getActionCore(e),
        a = getActionCore(t);
    if (n === a) return !0;
    const o = n.split(" ")[0],
        i = a.split(" ")[0],
        s = [
            ["sips", "sip", "drinks", "drink", "takes a sip", "takes sip"],
            ["wipes", "wipe", "wiping", "dabs", "dab", "dabbing"],
            ["laughs", "laugh", "laughing", "chuckles", "chuckle", "chuckling", "giggles", "giggle", "giggling"],
            ["smiles", "smile", "smiling", "grins", "grin", "grinning", "smirks", "smirk", "smirking"],
            ["looks", "look", "looking", "glances", "glance", "glancing", "peers", "peer", "peering"],
            ["leans", "lean", "leaning", "tilts", "tilt", "tilting"],
            ["touches", "touch", "touching", "brushes", "brush", "brushing", "strokes", "stroke", "stroking"],
            ["sighs", "sigh", "sighing", "exhales", "exhale", "exhaling", "breathes", "breathe", "breathing"],
            ["blushes", "blush", "blushing", "flushes", "flush", "flushing", "reddens", "redden", "reddening"],
            ["rolls", "roll", "rolling", "spins", "spin", "spinning"],
            ["crosses", "cross", "crossing", "folds", "fold", "folding"],
            ["runs", "run", "running", "drags", "drag", "dragging", "rakes", "rake", "raking"],
            ["shakes", "shake", "shaking", "nods", "nod", "nodding", "bobs", "bob", "bobbing"],
            ["bites", "bite", "biting", "nibbles", "nibble", "nibbling", "chews", "chew", "chewing"],
            ["plays", "play", "playing", "fidgets", "fidget", "fidgeting", "toys", "toy", "toying"],
            ["pulls", "pull", "pulling", "tugs", "tug", "tugging"],
            ["pushes", "push", "pushing", "shoves", "shove", "shoving"],
            ["arches", "arch", "arching", "curves", "curve", "curving", "bends", "bend", "bending"],
            ["gasps", "gasp", "gasping", "inhales", "inhale", "inhaling"],
            ["moans", "moan", "moaning", "groans", "groan", "groaning", "whimpers", "whimper", "whimpering"],
            ["spits", "spit", "spitting", "sprays", "spray", "spraying", "spurts", "spurt", "spurting"],
            ["coughs", "cough", "coughing", "chokes", "choke", "choking", "sputters", "sputter", "sputtering"],
        ];
    for (const e of s) {
        const t = e.some((e) => o.includes(e) || e.includes(o)),
            n = e.some((e) => i.includes(e) || e.includes(i));
        if (t && n) return !0;
    }
    const r = [
        "coffee",
        "tea",
        "drink",
        "cup",
        "mug",
        "glass",
        "hair",
        "lip",
        "lips",
        "mouth",
        "hand",
        "hands",
        "finger",
        "fingers",
        "arm",
        "arms",
        "shoulder",
        "shoulders",
        "neck",
        "face",
        "cheek",
        "cheeks",
        "eye",
        "eyes",
        "brow",
        "eyebrow",
        "nose",
        "chin",
        "jaw",
        "shirt",
        "blouse",
        "dress",
        "skirt",
        "pants",
        "sleeve",
        "desk",
        "chair",
        "table",
        "counter",
        "wall",
        "door",
    ];
    for (const n of r)
        if (e.includes(n) && t.includes(n)) {
            const n = e.split(" "),
                a = t.split(" ");
            if (n[0] === a[0] || (n[1] && a[1] && n[1] === a[1])) return !0;
        }
    return !1;
}
function buildActionAvoidancePrompt(e) {
    initializeAITracking(e);
    const t = gameState.aiContextQuality.employeeTracking[e];
    if (!t.recentActionPhrases || 0 === t.recentActionPhrases.length) return "";
    const n = t.recentActionPhrases.slice(0, 6);
    if (0 === n.length) return "";
    return `\n🚫 DO NOT REPEAT THESE RECENT ACTIONS - You've already used these physical actions/gestures recently. Use COMPLETELY DIFFERENT actions this time:\n${n.map((e, t) => `${t + 1}. "${e}"`).join("\n")}\n\nInstead, try: different body parts, different verbs, different props, or skip the physical action entirely and just use dialogue.`;
}
function storeActionPhrases(e, t) {
    initializeAITracking(e);
    const n = gameState.aiContextQuality.employeeTracking[e];
    for (const e of t) {
        if (n.recentActionPhrases.some((t) => areActionsSimilar(e, t))) {
            const t = n.recentActionPhrases.findIndex((t) => areActionsSimilar(e, t));
            if (t > 0) {
                const [e] = n.recentActionPhrases.splice(t, 1);
                n.recentActionPhrases.unshift(e);
            }
        } else n.recentActionPhrases.unshift(e);
    }
    n.recentActionPhrases.length > 10 && (n.recentActionPhrases = n.recentActionPhrases.slice(0, 10));
}
function analyzeResponseForRepetition(e, t) {
    initializeAITracking(e);
    const n = gameState.aiContextQuality.employeeTracking[e],
        a = [],
        o =
            (t.toLowerCase(),
            [
                { pattern: /arch(ing|ed|es)?\s+(back|spine)/i, name: "arching_back" },
                { pattern: /gasp(ing|ed|s)?\b/i, name: "gasping" },
                { pattern: /(fingers?|hands?)\s+(tangl(ing|ed|es)|in|through)\s+hair/i, name: "fingers_in_hair" },
                {
                    pattern: /(nails?|fingernails?)\s+(dig|digging|dug|scrap|scraping|scraped)/i,
                    name: "nails_digging",
                },
                { pattern: /trembl(ing|ed|es|e)\b/i, name: "trembling" },
                {
                    pattern: /(legs?|ankles?)\s+(hook|hooking|hooked|lock|locking|locked|wrap|wrapping|wrapped)/i,
                    name: "legs_hooking",
                },
                { pattern: /shudder(ing|ed|s)?\b/i, name: "shuddering" },
                {
                    pattern:
                        /knuckle(s)?\s+(whit(en|ening|ened)|press(ing|ed)|tight(en|ening|ened)|clench(ing|ed))/i,
                    name: "knuckles_action",
                },
                {
                    pattern: /\b(stormy|gray|grey|blue|green|brown|hazel)\s+(eyes?)\b/i,
                    name: "eye_color_description",
                },
                { pattern: /\bgap.?tooth(ed)?\s+(grin|smile|smirk)/i, name: "gap_tooth_descriptor" },
                { pattern: /(shoulders?|arms?|hands?)\s+(slump|slumping|slumped)/i, name: "slumping" },
                { pattern: /(breath|exhale|inhale)\s+(catch(es|ing|ed)|sharp(ly)?)/i, name: "breath_catching" },
            ]),
        i = [];
    for (const { pattern: e, name: s } of o)
        if (e.test(t)) {
            i.push(s);
            const e = n.physicalActions.filter((e) => e === s).length;
            e >= gameState.aiContextQuality.maxSameAction &&
                a.push(
                    `⚠️ REPETITION ALERT: You've used "${s.replace(/_/g, " ")}" ${e + 1} times in recent responses. Use a completely different physical reaction this time.`
                );
        }
    const s = [
            { pattern: /\bbuddy\b/i, name: "buddy_cat" },
            { pattern: /\b(budget|thrift.?store|therapy|co.?pay|cheap|expensive)\b/i, name: "budget_humor" },
            { pattern: /\bscar(red)?\b/i, name: "scar_reference" },
            { pattern: /\bwork.?life\s+separation\b/i, name: "work_life_joke" },
        ],
        r = [];
    for (const { pattern: e, name: o } of s)
        if (e.test(t)) {
            r.push(o);
            const e = n.narrativeAnchors.filter((e) => e === o).length;
            e >= gameState.aiContextQuality.maxSameAnchor &&
                a.push(
                    `⚠️ CALLBACK OVERUSE: You've referenced "${o.replace(/_/g, " ")}" ${e + 1} times recently. Find NEW details or humor - retire this callback.`
                );
        }
    const u = [
            { pattern: /\bngl\b/i, name: "ngl" },
            { pattern: /\btbh\b/i, name: "tbh" },
            { pattern: /\bistg\b/i, name: "istg" },
            { pattern: /\bfr\b/i, name: "fr" },
            { pattern: /\blowkey\b/i, name: "lowkey" },
        ],
        g = [];
    for (const { pattern: e, name: o } of u)
        if (e.test(t)) {
            g.push(o);
            const e = n.slangWords.filter((e) => e === o).length;
            e >= gameState.aiContextQuality.maxSameSlang &&
                a.push(
                    `⚠️ SLANG OVERUSE: You've used "${o}" ${e + 1} times recently. Drop the abbreviations for a while - talk normally.`
                );
        }
    const l = [
            { pattern: /\bbreath(less|lessly|ing|s)\b/i, name: "breath" },
            { pattern: /\b(warm|heat|hot|burning|burns?|burned)\b/i, name: "warmth" },
            { pattern: /\b(soft|softly|gentle|gently)\b/i, name: "softness" },
            { pattern: /\b(sharp|sharply)\b/i, name: "sharpness" },
        ],
        c = [];
    for (const { pattern: e, name: n } of l) e.test(t) && c.push(n);
    const d = {};
    n.sensoryWords.forEach((e) => (d[e] = (d[e] || 0) + 1)),
        c.forEach((e) => {
            d[e] >= 2 &&
                a.push(
                    `⚠️ SENSORY REPETITION: You've overused "${e}" descriptors. Use alternatives from vocabulary bank.`
                );
        });
    const p = [
        {
            pattern: /pressing\s+(against|into|on)\s+(the\s+)?(counter|marble|desk|table)/i,
            name: "pressing_against_surface",
        },
        { pattern: /(fingers?|hands?)\s+(drum|drumming|tap|tapping|tapped)\s+/i, name: "fingers_drumming" },
        { pattern: /\bphone\s+screen\b/i, name: "phone_screen_mention" },
        { pattern: /\bwine\s+glass\b/i, name: "wine_glass_prop" },
    ];
    for (const { pattern: n, name: o } of p)
        if (n.test(t)) {
            if (gameState.employees.find((t) => t.id === e) && gameState.chatHistory[e]) {
                const t = gameState.chatHistory[e]
                    .filter((e) => !e.isPlayer)
                    .slice(-5)
                    .map((e) => e.content)
                    .filter((e) => n.test(e)).length;
                t >= 2 &&
                    a.push(
                        `🔴 PHRASE OVERUSE: You've used the phrase pattern "${o.replace(/_/g, " ")}" ${t + 1} times in last 5 responses. Use completely different actions/props.`
                    );
            }
        }
    if ((t.match(/—/g) || []).length >= 3) {
        n.responseStructures.filter((e) => "em_dash_heavy" === e).length >= 1 &&
            a.push(
                "⚠️ PUNCTUATION OVERUSE: You're relying too heavily on em-dashes (—). Use different punctuation: semicolons, short declaratives, or ellipses."
            ),
            i.push("em_dash_heavy");
    }
    if (/^(arching|melting|hooking|gasping|leaning|pressing|pulling|pushing|sliding)/i.test(t.trim())) {
        n.responseStructures.filter((e) => "gerund_opening" === e).length >= 1 &&
            a.push(
                "⚠️ SENTENCE STRUCTURE: You're starting too many responses with gerunds (Arching, Melting, etc.). Start with subject, dialogue, or action verb instead."
            ),
            i.push("gerund_opening");
    }
    if (/\b(honestly|though honestly|but honestly|therapy|budget|thrift|cheap)\b/i.test(t)) {
        n.humorCount++;
        const t = gameState.employees.find((t) => t.id === e);
        if (t) {
            const o = Math.round((t.stats.affection + t.stats.comfort + t.stats.desire) / 3);
            (gameState.aiContextQuality.intimacyEscalation[e] = o),
                o > 70 &&
                    n.humorCount >= 2 &&
                    a.push(
                        `⚠️ TONAL SHIFT NEEDED: Intimacy is VERY HIGH (${o}%). Reduce meta-commentary and humor. Allow genuine vulnerability and overwhelmed emotion without quips.`
                    );
        }
    } else n.humorCount = Math.max(0, n.humorCount - 1);
    (n.physicalActions = [...i, ...n.physicalActions].slice(0, gameState.aiContextQuality.repetitionWindow)),
        (n.narrativeAnchors = [...r, ...n.narrativeAnchors].slice(0, gameState.aiContextQuality.repetitionWindow)),
        (n.sensoryWords = [...c, ...n.sensoryWords].slice(0, gameState.aiContextQuality.repetitionWindow)),
        (n.slangWords = [...g, ...n.slangWords].slice(0, gameState.aiContextQuality.repetitionWindow)),
        (n.responseStructures = [...n.responseStructures].slice(0, gameState.aiContextQuality.repetitionWindow));
    const m = extractActionPhrases(t);
    if (m.length > 0) {
        storeActionPhrases(e, m);
        const t = gameState.aiContextQuality.employeeTracking[e];
        for (const e of m) {
            t.recentActionPhrases.filter((t) => areActionsSimilar(e, t) && t !== e).length >= 2 &&
                a.push(
                    `🔴 ACTION REPETITION: You've done similar actions to "${e}" multiple times. Try something completely different!`
                );
        }
    }
    return a;
}
function getVarietyGuidance(e) {
    initializeAITracking(e);
    const t = gameState.aiContextQuality.vocabularyBanks,
        n = (e, t = 5) => [...e].sort(() => Math.random() - 0.5).slice(0, t);
    return `\n🎨 RESPONSE VARIETY TOOLKIT:\nUse these alternatives to avoid repetition:\n\nPHYSICAL REACTIONS (instead of arching/gasping/trembling):\n- Arousal: ${n(t.arousal).join(", ")}\n- Spinal: ${n(t.spinalReactions, 3).join(", ")}\n- Breath: ${n(t.breathPatterns, 3).join(", ")}\n\nSENSORY DESCRIPTORS (instead of warm/soft/breathless):\n- Temperature: ${n(t.temperature, 4).join(", ")}\n- Texture: ${n(t.texture, 4).join(", ")}\n- Sounds: ${n(t.vocalSounds, 4).join(", ")}\n\nMOVEMENT QUALITY: ${n(t.movementQuality, 5).join(", ")}\n\n📝 STRUCTURE VARIETY:\n- Rotate: em-dashes (—), semicolons (;), ellipses (...), short declaratives\n- Vary openings: Don't always start with gerunds (Arching, Melting)\n- Mix sentence lengths: Alternate complex and punchy\n\n⚠️ AVOID: Recycling the same actions/words from your last 3 responses\n`;
}
function sanitizeNpcResponse(e, t = 10) {
    if (!e) return "";
    let n = String(e);
    // Ordered sanitize steps — SAME regexes/order as before, so the return value is
    // byte-identical for all callers. Each step logs a delta under the [Sanitize] tag
    // ONLY when it actually changes the string, so the per-rule culprit behind emptied
    // DMs is visible. Toggle this firehose in Settings → 🔍 Logging.
    const _sanSteps = [
        { name: "SEEDS", re: /\{SEEDS:[^}]*\}\s*/gi, to: "" },
        { name: "BAN", re: /\{BAN:[^}]*\}\s*/gi, to: "" },
        { name: "BOOST", re: /\{BOOST:[^}]*\}\s*/gi, to: "" },
        { name: "GENERIC_TAG", re: /\{[A-Z]+:[^}]*\}\s*/g, to: "" },
        {
            name: "LABEL_LINES",
            re: /(?:^|\n)\s*(Key choices:|Physical anchors:|Emotional arc:|Seed integration:|Relationship metrics:|Dialogue flow:|Meta commentary:|Scene breakdown:|Writing choices:|Character notes:|Technical details:).*?(?=\n|$)/gi,
            to: "",
        },
        {
            name: "HEADINGS",
            re: /^#{1,6}\s+(Key choices|Physical anchors|Emotional arc|Seed integration|Relationship metrics|Dialogue flow|Meta commentary|Scene breakdown|Writing choices).*$/gim,
            to: "",
        },
        { name: "METRICS", re: /\b(Affection|Trust|Desire|Intimacy|Obedience|Comfort)\s*\(\d+\s*→\s*\d+\)/gi, to: "" },
        { name: "HR_RULES", re: /^[-*_]{3,}\s*$/gm, to: "" },
        {
            name: "BRACKETS",
            re: /\[(.*?)\]/g,
            to: "",
            // Never let a fully-bracketed message collapse to empty: if stripping would
            // leave nothing but whitespace, unwrap instead (drop only the [ ] brackets,
            // keep the inner text). Normal messages are unaffected.
            guard: (before, after) => (after.trim() ? after : before.replace(/[\[\]]/g, "")),
        },
        { name: "LEAD_ACTION", re: /^\*\s*(laughs?|smiles?|grins?|nods?|shrugs?|sighs?|waves?)\s*\*\s*/gi, to: "" },
        { name: "TRAIL_ACTION", re: /\s+\*\s*(laughs?|smiles?|grins?|nods?|shrugs?|sighs?|waves?)\s*\*$/gi, to: "" },
        { name: "NL_COLLAPSE", re: /\n\s*\n\s*\n/g, to: "\n\n" },
        { name: "WS_COLLAPSE", re: /\s+/g, to: " " },
    ];
    for (const step of _sanSteps) {
        const before = n;
        n = n.replace(step.re, step.to);
        if (step.guard) n = step.guard(before, n);
        if (n !== before) {
            let removed = "";
            if ("" === step.to)
                try {
                    const m = before.match(new RegExp(step.re.source, step.re.flags));
                    m && (removed = " | removed: " + JSON.stringify(m.slice(0, 4).join(" ⋯ ")).slice(0, 180));
                } catch (_) {}
            console.log(`[Sanitize] ${step.name}: ${before.length}→${n.length} chars${removed}`);
        }
    }
    n = n.trim();
    const a = 3e3;
    if (n.length <= a) return n;
    console.log(`[Sanitize] TRUNCATE: ${n.length} chars exceeds ${a} cap`);
    const o = n.slice(0, a),
        i = Math.max(o.lastIndexOf(". "), o.lastIndexOf("! "), o.lastIndexOf("? "));
    n = i > 2500 ? n.slice(0, i + 1).trim() : o.trim() + "...";
    const s = n.match(/\b[A-Z][a-z]+:\s+[^:]{20,}/g);
    if (s && s.length > 2) {
        const e = n.split("\n").filter((e) => e.trim());
        for (let t = e.length - 1; t >= 0; t--) {
            const a = e[t].trim();
            if (!/^[A-Z][a-z]+:\s/.test(a) && a.length > 10) {
                n = e.slice(t).join(" ").trim();
                break;
            }
        }
        if (s.length > 5) {
            const e = n.split(/\n\n+/);
            n = e[e.length - 1] || n;
        }
    }
    return n;
}
function buildConversationHistoryWithImages(e, t = 50) {
    const n = gameState.chatHistory[e] || [];
    gameState.employees.find((t) => t.id === e);
    return n
        .slice(-t)
        .map((e) => {
            let t = `${e.sender}: ${e.content}`;
            if (e.imageUrl)
                if (e.isPlayer) {
                    t += ` [Player sent me a photo: ${e.imageAlt || "a photo"}]`;
                } else {
                    let n = "";
                    (n = e.imageAlt
                        ? e.imageAlt
                        : e.imagePrompt
                          ? summarizeImagePrompt(e.imagePrompt)
                          : "a personal photo"),
                        (t += ` [IMPORTANT: I just sent a photo to the player. The image shows: ${n}. I should remember I sent this and can refer to it in my next response.]`);
                }
            return t;
        })
        .join("\n");
}
function summarizeImagePrompt(e) {
    if (!e || e.length < 50) return e || "a personal photo";
    let t = "";
    return (
        (t = /\b(nude|naked|undressed)\b/i.test(e)
            ? "a nude/intimate photo"
            : /\b(topless|breasts? exposed|shirtless)\b/i.test(e)
              ? "a topless photo"
              : /\b(upskirt|under.*skirt|panties visible)\b/i.test(e)
                ? "an upskirt photo"
                : /\b(selfie|mirror|self-portrait)\b/i.test(e)
                  ? "a selfie"
                  : /\b(sexy|seductive|alluring|provocative)\b/i.test(e)
                    ? "a sexy/provocative photo"
                    : /\b(bent over|from behind|rear view|ass|butt)\b/i.test(e)
                      ? "a rear view photo"
                      : /\b(spread|legs apart|open)\b/i.test(e)
                        ? "an explicit intimate photo"
                        : /\b(office|work|desk|cubicle)\b/i.test(e)
                          ? "a photo at the office"
                          : /\b(bedroom|bed|sheets)\b/i.test(e)
                            ? "a photo from the bedroom"
                            : /\b(bathroom|shower|mirror)\b/i.test(e)
                              ? "a bathroom photo"
                              : e.substring(0, 60).replace(/,\s*$/, "") + "..."),
        t
    );
}
// ── Shared instruction-foregrounding helpers (Phase 3, Bugs A+C) ──
// Used by both solo buildChatPrompt and group buildGroupResponsePrompt so both paths
// foreground the player's instruction identically. Solo passes no roster, so these return
// byte-identical strings to the original inline solo logic. buildCurrentStateBlock is the
// future home for Bug B's sceneState (flags-only for now).
function buildCurrentStateBlock(npc, opts) {
    let s = "function" == typeof buildAIContextFromFlags ? buildAIContextFromFlags(npc, opts || {}) : "";
    // Phase 4 Bug B: append persisted scene state (clothing/pose/action) when present. Emits nothing
    // for default/stale state, so the Phase 3 byte-identical baseline holds for default-state NPCs.
    const scene = "function" == typeof sceneStateToPromptLine ? sceneStateToPromptLine(npc) : "";
    return scene && (s += (s ? "\n" : "") + scene), s;
}
function buildSituationalAwarenessBlock() {
    return `🚨 CRITICAL SITUATIONAL AWARENESS:\n- READ THE PLAYER'S MESSAGE CAREFULLY. If they describe you being gagged, bound, unable to speak, or in any physically restrictive situation, RESPOND ACCORDINGLY.\n- If gagged/mouth covered: Use ONLY muffled sounds (mmph, mmmf, nngh, etc.) and physical reactions. NO clear speech.\n- If bound/restrained: Describe struggling, limited movement, inability to act freely.\n- If in the middle of an intimate act: React to what's ACTUALLY happening physically, not just chat casually.\n- MATCH THE SCENARIO: If the player describes an intense, physical, or restrictive situation, respond realistically to those constraints.\n- Don't ignore what the player just described happening. React to it authentically.`;
}
function buildInstructionFocusBlock(npc, instruction, roster) {
    const msg = (null == instruction ? "" : String(instruction)).trim();
    if (!msg) return "";
    const fullName = npc.name,
        firstName = fullName.split(" ")[0];
    // Solo / single-recipient (no roster): original solo framing, byte-identical to legacy.
    if (!roster || 0 === roster.length) return `${fullName}, the player just said: "${msg}"`;
    // Group: foreground the instruction relative to the speaking NPC.
    const lower = msg.toLowerCase(),
        nameHit = (nm) => {
            const f = (nm || "")
                .split(" ")[0]
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");
            return f.length >= 2 && new RegExp(`\\b${f}\\b`).test(lower);
        },
        speakerNamed = nameHit(firstName) || lower.includes(fullName.toLowerCase()),
        other = roster.find((p) => p && p.id !== npc.id && nameHit(p.name)),
        roomWide = /\b(everyone|everybody|all of you|you all|you guys|the room|each of you|y'?all)\b/.test(lower);
    if (speakerNamed)
        return `The Boss just said to you, ${firstName}: "${msg}" — respond to THIS first, above any coworker chatter.`;
    if (other && !roomWide)
        return `The Boss said to ${other.name.split(" ")[0]}, not you: "${msg}". React as ${firstName} would to that being said to someone else — do not act as though you were told to do it.`;
    return `The Boss said to the room: "${msg}". You, ${firstName}, are included — respond to it.`;
}
// Single source of truth for the consent policy. Previously solo chat + stat-eval defaulted to
// "professional" while the four group paths defaulted to "open"; on a save where settings.policy
// was unset, the NPC (group) and the grader (eval) ran on opposite rulebooks. Every consent
// call site now resolves the identical value via this helper.
function getConsentPolicy() {
    return gameState.settings?.policy || "professional";
}
