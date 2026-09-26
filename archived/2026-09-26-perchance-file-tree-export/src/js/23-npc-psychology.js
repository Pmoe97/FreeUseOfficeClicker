// ============================================================================
// 23-npc-psychology — NPC psychology: archetypes gs, scene state, memory/remember, voice, chat sanitization, spending rate, quality tracking.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

const gs = { succubus: { forwardness: 30, dominance: 15, agreeableness: -10, loyalty: -10 }, incubus: { forwardness: 30, dominance: 15, agreeableness: -10, loyalty: -10 }, demon: { dominance: 20, volatility: 15, agreeableness: -15, loyalty: -10 }, tiefling: { dominance: 10, volatility: 10, forwardness: 8 }, angel: { agreeableness: 20, loyalty: 20, volatility: -15, forwardness: -8 }, vampire: { dominance: 18, expressiveness: -8, forwardness: 12, attachment: 10 }, elf: { expressiveness: -8, volatility: -10, agreeableness: 8 }, orc: { dominance: 18, volatility: 12, expressiveness: 8 }, goblin: { volatility: 18, agreeableness: -8, forwardness: 8 }, dwarf: { volatility: -10, loyalty: 15, dominance: 8 }, halfling: { agreeableness: 15, volatility: -8, expressiveness: 8 }, dragonborn: { dominance: 18, loyalty: 12, expressiveness: 8 }, fox: { forwardness: 15, expressiveness: 10, agreeableness: -5 }, cat: { agreeableness: -8, dominance: 8, expressiveness: -5 }, wolf: { dominance: 15, loyalty: 15, attachment: 10 }, werewolf: { dominance: 15, volatility: 15, attachment: 10 }, bunny: { agreeableness: 12, forwardness: 10, expressiveness: 10 }, rabbit: { agreeableness: 12, forwardness: 10, expressiveness: 10 }, fairy: { expressiveness: 15, volatility: 12, agreeableness: 8 }, dryad: { agreeableness: 12, volatility: -10, attachment: 12 }, mermaid: { expressiveness: 10, agreeableness: 8 }, lamia: { forwardness: 18, dominance: 12, attachment: 12 }, centaur: { dominance: 12, loyalty: 12 }, harpy: { volatility: 15, expressiveness: 12, dominance: 8 }, slime: { agreeableness: 12, volatility: 10, forwardness: 8 }, ghost: { expressiveness: -10, attachment: 15 }, robot: { expressiveness: -20, volatility: -20, forwardness: -10 }, cyborg: { expressiveness: -10, volatility: -10 }, alien: { volatility: 10, agreeableness: -5 } }, hs = ["agreeableness", "dominance", "expressiveness", "volatility", "attachment", "forwardness", "loyalty"];
function ys(e) {
  const clamp = (v) => Math.max(0, Math.min(100, Math.round(v))), u2 = String(e && (e.id || e.name) || "npc");
  let h = 2166136261;
  for (let i = 0; i < u2.length; i++) h ^= u2.charCodeAt(i), h = Math.imul(h, 16777619);
  let state = h >>> 0;
  const jitter = (base2, spread) => clamp(base2 + (2 * (state = Math.imul(state, 1664525) + 1013904223 >>> 0, state / 4294967296) - 1) * spread), p = e && e.personality || {}, flirty = p.flirty ?? 50, confidence = p.confidence ?? 50, outgoing = p.outgoing ?? 50, professional = p.professional ?? 50, prior = gs[e && e.race ? String(e.race).toLowerCase() : "human"] || {}, base = { agreeableness: 50, dominance: confidence, expressiveness: outgoing, volatility: clamp(100 - professional), attachment: 50, forwardness: flirty, loyalty: 50 }, axes = {};
  for (const k of hs) axes[k] = jitter(base[k] + (prior[k] || 0), 12);
  return axes;
}
function bs(npc) {
  if (!npc || !npc.personality || !npc.personality.axes || "object" != typeof npc.personality.axes) return;
  const ax = npc.personality.axes, p = npc.personality, clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
  "number" == typeof ax.dominance && (p.confidence = clamp(ax.dominance)), "number" == typeof ax.expressiveness && (p.outgoing = clamp(ax.expressiveness)), "number" == typeof ax.forwardness && (p.flirty = clamp(ax.forwardness)), "number" == typeof ax.volatility && (p.professional = clamp(100 - ax.volatility));
}
function ws(e) {
  e && (e.sceneState && "object" == typeof e.sceneState || (e.sceneState = { clothing: "", pose: "", ongoingAction: "", nsfw: "", updatedTurn: 0, scenarioId: "" }), e.personality && "object" == typeof e.personality || (e.personality = {}), e.personality.axes && "object" == typeof e.personality.axes || (e.personality.axes = ys(e)), void 0 === e.personality.freeform && (e.personality.freeform = ""), e.voice && "object" == typeof e.voice || (e.voice = { override: "" }), void 0 === e.voice.override && (e.voice.override = ""), Array.isArray(e.eventMemory) || (e.eventMemory = []));
}
function ks() {
  return String((gameState.time && gameState.time.day) ?? 0);
}
function Ss(npc) {
  const s = npc && npc.sceneState;
  return s && "object" == typeof s ? s.scenarioId && s.scenarioId !== ks() ? null : s.clothing || s.ongoingAction || s.pose ? s : null : null;
}
function Ts(npc) {
  const s = Ss(npc);
  return !(!s || !/\b(undress|undressed|nude|naked|topless|bottomless|strip|stripped)\b/i.test(s.clothing || ""));
}
function $s(npc) {
  const s = Ss(npc);
  if (!s) return "";
  const u2 = [];
  return s.clothing && u2.push(`currently ${s.clothing}`), s.pose && u2.push(s.pose), s.ongoingAction && u2.push(s.ongoingAction), u2.length ? `\u{1F4F8} CURRENT PHYSICAL STATE (carried over from earlier this scene \u2014 stays true until it changes): ${u2.join("; ")}.` : "";
}
function Cs(text) {
  if (!text || "string" != typeof text) return null;
  const t = text.toLowerCase();
  if (/\b(gets? dressed|get redressed|redress(es|ed)?|put(s|ting)? (her|his|their|my)?\s*clothes back|pull(s|ed)? (her|his|their|my)?\s*(shirt|top|dress|clothes) back on|button(s|ed)? (up|her|his)|cover(s|ed)? (up|herself|himself|themselves))\b/.test(t)) return { clothing: "", nsfw: "", ongoingAction: "" };
  const u2 = {};
  let touched = false;
  /\b(strips?|stripped|stripping|undress(es|ed|ing)?|take(s|n)? off (her|his|their|my)?\s*(shirt|top|dress|bra|clothes|pants)|pull(s|ed)? off (her|his|their|my)?\s*(shirt|top|dress|bra|clothes)|remove(s|d)? (her|his|their|my)?\s*(shirt|top|dress|bra|clothes)|naked|nude|topless|bottomless|clothes off)\b/.test(t) && (u2.clothing = "undressed", u2.nsfw = "explicit", touched = true);
  const act = t.match(/\b(kissing|making out|straddl\w+|grinding|going down on|riding|on (her|his|their) knees)\b/);
  return act && (u2.ongoingAction = act[0], u2.nsfw = u2.nsfw || "explicit", touched = true), touched ? u2 : null;
}
function Es(npc, text) {
  if (!npc) return;
  const u2 = Cs(text);
  u2 && (npc.sceneState && "object" == typeof npc.sceneState || (npc.sceneState = { clothing: "", pose: "", ongoingAction: "", nsfw: "", updatedTurn: 0, scenarioId: "" }), Object.assign(npc.sceneState, u2), npc.sceneState.updatedTurn = gameState.time && gameState.time.currentTime || Date.now(), npc.sceneState.scenarioId = ks());
}
function Ms(npc, entry) {
  if (!npc || !entry || !entry.summary) return;
  Array.isArray(npc.eventMemory) || (npc.eventMemory = []);
  const u2 = npc.eventMemory, G2 = u2.find((e) => e && !e.resolved && e.summary === entry.summary);
  if (G2) return G2.intensity = Math.max(G2.intensity || 0, entry.intensity || 0), void (G2.turn = entry.turn);
  u2.push(entry), u2.length > 8 && (u2.sort((a, b) => Number(b.resolved) - Number(a.resolved) || (a.intensity || 0) - (b.intensity || 0)), u2.shift());
}
function Ps(npc, text) {
  if (!npc || !Array.isArray(npc.eventMemory) || !text) return;
  const t = String(text).toLowerCase();
  /\b(sorry|apolog|my bad|forgive|make it up|made up|making up|reconcil|i was wrong|move past (it|this)|no hard feelings|we'?re (good|okay|ok)|all good now|hug it out)\b/.test(t) && npc.eventMemory.forEach((e) => e && "conflict" === e.type && !e.resolved && (e.resolved = true));
}
function Ls(npc, text, u2) {
  if (!npc || !text || "string" != typeof text) return;
  u2 = u2 || {}, Ps(npc, text);
  const t = text.toLowerCase(), turn = gameState.time && gameState.time.currentTime || Date.now(), involves = u2.involves || [], add = (type, summary, intensity) => Ms(npc, { type, summary, intensity, involves, turn, resolved: false });
  /\b(refuse|refused|won'?t|will not|no way|not doing|snap|snapped|glare|glared|storm|stormed off|slam|slammed|coldly|bites? back|scoff|scoffed|rolls? (her|his|their) eyes)\b/.test(t) && add("conflict", "pushed back / clashed with the Boss", 0.6), /\b(hurt|stung|wounded|betrayed|ignored|overlooked|dismissed|humiliat|embarrass)\b/.test(t) && add("conflict", "felt hurt or dismissed by the Boss", 0.7), /\b(kiss|kissed|hug|hugged|embrace|caress|cuddl|nuzzl|holds? (her|him|them) close)\b/.test(t) && add("relational", "shared a tender/physical moment with the Boss", 0.7), /\b(blush|melt|heart (skip|flutter)|adore|love you|so happy|grateful|smiles? warmly)\b/.test(t) && add("relational", "felt close/affectionate toward the Boss", 0.5), /\b(promise|i'?ll be there|see you (tonight|tomorrow|then)|it'?s a date|marry|move in|forever|always be (yours|here))\b/.test(t) && add("commitment", "made a promise/commitment with the Boss", 0.6);
}
function Ns(npc, instruction, roster) {
  const msg = (null == instruction ? "" : String(instruction)).toLowerCase().trim();
  if (!(msg && npc && roster && roster.length)) return null;
  const u2 = (nm) => {
    const f = (nm || "").split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    return f.length >= 2 && new RegExp(`\\b${f}\\b`).test(msg);
  };
  return u2(npc.name) || msg.includes((npc.name || "").toLowerCase()) ? null : roster.find((p) => p && p.id !== npc.id && u2(p.name)) || null;
}
function _s(npc, signal) {
  signal = signal || {};
  const ax = npc && npc.personality && npc.personality.axes || {}, A = (k) => "number" == typeof ax[k] ? ax[k] : 50, agreeableness = A("agreeableness"), volatility = A("volatility"), attachment = A("attachment");
  let anger = 0, jealousy = 0, hurt = 0, warm = 0;
  const events = npc && Array.isArray(npc.eventMemory) ? npc.eventMemory.filter((e) => e && !e.resolved) : [];
  for (const e of events) {
    const w = e.intensity || 0.5;
    "conflict" === e.type ? (anger += w * (0.5 + volatility / 200), hurt += w * (1 - agreeableness / 100)) : "relational" === e.type ? warm += w * (0.4 + attachment / 200) : "commitment" === e.type && (warm += 0.3 * w);
  }
  const u2 = (null == signal.incoming ? "" : String(signal.incoming)).toLowerCase();
  u2 && /\b(stupid|idiot|useless|shut up|worthless|pathetic|hate you|disappointed|incompetent|fuck you|screw you|you'?re fired)\b/.test(u2) && (anger += 0.6 * (0.6 + volatility / 200) + 0.4 * (1 - agreeableness / 100)), signal.addressedOther && (jealousy += 0.4 + attachment / 150);
  const G2 = [["angry", anger], ["jealous", jealousy], ["hurt", hurt], ["warm", warm]].sort((a, b) => b[1] - a[1]);
  return G2[0][1] < 0.5 ? null : { emotion: G2[0][0], intensity: Math.min(1, G2[0][1]) };
}
function Rs(npc, signal) {
  const d = _s(npc, signal);
  if (!d) return "";
  const line = { angry: "You are genuinely angry or irritated right now \u2014 do NOT smooth it over or play nice just to be agreeable. Let it show in what you say.", jealous: "The Boss's attention is on someone else and it stings \u2014 let a flicker of jealousy or pointedness show; don't pretend you don't notice.", hurt: "You're still hurt by something unresolved between you \u2014 be a little guarded or wounded; don't act like everything is fine.", warm: "You feel genuinely warm and drawn toward the Boss right now \u2014 let that affection color how you respond." }[d.emotion];
  return line ? `\u{1F4A2} EMOTIONAL STATE (let this shape your reply \u2014 do NOT default to agreeable/complacent): ${line}` : "";
}
function Ds(npc) {
  const open = (npc && Array.isArray(npc.eventMemory) ? npc.eventMemory : []).filter((e) => e && !e.resolved && e.summary).sort((a, b) => (b.intensity || 0) - (a.intensity || 0)).slice(0, 4);
  return open.length ? "\u{1F9E0} STILL UNRESOLVED BETWEEN YOU AND THE BOSS (colors how you feel \u2014 bring it up only if it fits):\n" + open.map((e) => `- ${e.summary}`).join("\n") : "";
}
function Os(npc) {
  let v = npc && npc.voice && npc.voice.override ? String(npc.voice.override).trim() : "";
  if (!v && npc && "function" == typeof Gr) try {
    v = String(Gr(npc) || "").trim();
  } catch (u2) {
    v = "";
  }
  return v && (v = v.split(";").map((s) => s.trim()).filter((s) => s && !/mid-?thought|continuation|starts?\s+posts?/i.test(s)).join("; ")), v ? `\u{1F5E3}\uFE0F VOICE (how ${(npc.name || "this character").split(" ")[0]} speaks \u2014 keep it consistent): ${v}` : "";
}
function Bs(blocks) {
  const parts = (blocks || []).map((s) => (s || "").trim()).filter(Boolean);
  return parts.length ? "\n\n" + parts.join("\n\n") : "";
}
function Fs(e) {
  if (!e || !e.stats) {
    if (!e) return;
    e.stats = {};
  }
  const t = e.stats;
  void 0 !== t.love && void 0 === t.affection && (t.affection = t.love, delete t.love), void 0 !== t.efficiency && void 0 === t.productivity && (t.productivity = t.efficiency, delete t.efficiency), void 0 !== t.anger && (void 0 === t.obedience && (t.obedience = Math.max(0, 100 - t.anger)), delete t.anger), void 0 === t.affection && (t.affection = 30), void 0 === t.comfort && (t.comfort = 50), void 0 === t.trust && (t.trust = 40), void 0 === t.desire && (t.desire = 10), void 0 === t.obedience && (t.obedience = 50), void 0 === t.productivity && (t.productivity = 60);
  for (const e2 of ["affection", "comfort", "trust", "desire", "obedience", "productivity"]) void 0 !== t[e2] && (t[e2] = Math.max(0, Math.min(100, t[e2])));
}
function remember(e, t, n = "note", a = 1) {
  if (!e) return;
  if (ensureEmployeeMemory(e), !t) return;
  if (Uo(t)) return void console.warn("[Memory] Refusing to remember AI-fallback text:", t);
  if (!(e.memory && e.memory.items || (console.error("[Memory] Employee memory not properly initialized:", e.name), ensureEmployeeMemory(e), e.memory && e.memory.items))) return void console.error("[Memory] Failed to initialize memory for:", e.name);
  const o = Date.now(), i = t.trim().toLowerCase(), s = e.memory.items.find((e2) => e2.text.trim().toLowerCase() === i);
  if (s) return s.ts = o, s.importance = Math.max(s.importance, a), void (s.count = (s.count || 1) + 1);
  e.memory.items.push({ text: t, type: n, importance: a, ts: o, count: 1 }), e.memory.items.length > e.memory.cap && (e.memory.items.sort((e2, t2) => e2.importance + 0.1 * (e2.count || 1) - (t2.importance + 0.1 * (t2.count || 1))), e.memory.items.shift());
}
function qs(e, t) {
  const n = [];
  if (!e) return n;
  const a = e.toLowerCase(), o = (e2, t2, a2 = 1) => n.push({ text: e2, type: t2, importance: a2 });
  return /\b(promot|raise|level up)\b/.test(a) && o("Discussed promotion/raise", "event", 1.8), /\b(fire|fir(e|ing)|terminat(e|ion))\b/.test(a) && o("Termination discussed", "event", 2), /\b(deadline|ship|launch|deliver(y|able)?)\b/.test(a) && o("Work deadline mentioned", "work", 1.3), /\b(gift|present|bonus)\b/.test(a) && o("Gift or bonus mentioned", "event", 1.4), /\b(meet(ing)?|1:1|one on one)\b/.test(a) && o("Meeting planned", "event", 1.1), /\b(date|coffee|lunch|dinner)\b/.test(a) && !/deadline/.test(a) && o("Social invitation", "relation", 1.5), /\b(thank|appreciate|grateful)\b/.test(a) && o("Expressed gratitude", "relation", 1), /\b(sorry|apolog|my bad)\b/.test(a) && o("Apologized", "relation", 1), /\b(love|adore|crush)\b/.test(a) && o("Romantic sentiment", "relation", 1.6), /\b(frustrat|annoy|angry|upset)\b/.test(a) && o("Negative emotion", "relation", 1.2), /\b(flirt|tease|cute|hot|sexy|attractive)\b/.test(a) && o("Flirtatious exchange", "relation", 1.4), /\b(kiss|touch|hold|hug|embrace)\b/.test(a) && o("Physical affection discussed", "intimacy", 1.7), /\b(want|desire|need) (you|me|us)\b/.test(a) && o("Expressed desire", "intimacy", 1.5), n;
}
function zs(e, t, n) {
  const a = t ? t.filter((t2) => e.text.toLowerCase().includes(t2)).length : 0, o = 1 / Math.max(1, (Date.now() - (e.ts || 0)) / 36e5);
  let i = 0;
  if (n && n.memory && n.memory.styleCounters) {
    const t2 = n.memory.styleCounters, a2 = e.text.toLowerCase(), o2 = /\b(manage|job|work|position|role)\b/.test(a2) || n.productManaged && a2.includes(n.productManaged.toLowerCase()), s2 = (n.hobbies || []).some((e2) => a2.toLowerCase().includes(e2.toLowerCase()));
    o2 && t2.total - t2.lastJobMention < 8 && (i = 2), s2 && t2.total - t2.lastHobbyMention < 6 && (i = 2.5);
  }
  const s = "relation" === e.type || "intimacy" === e.type ? 0.8 : 0;
  return 0.6 * a + 0.9 * (e.importance || 1) + 0.5 * o + 0.1 * (e.count || 1) + s - i;
}
function Gs(e, t, n = 25) {
  ensureEmployeeMemory(e);
  const a = cs(t).slice(0, 20);
  return e.memory.items.slice().sort((t2, n2) => zs(n2, a, e) - zs(t2, a, e)).slice(0, n);
}
function calculateScaledSpendingRate(e = null) {
  const t = Math.max(1e3, gameState.cash), n = Math.log10(t), a = Math.max(1, 1 + 0.5 * (n - 3));
  null === e && (e = 50 + 100 * Math.random());
  const o = e * a;
  return Math.min(o, 5e4);
}
function Hs(e) {
  gameState.aiContextQuality.employeeTracking[e] || (gameState.aiContextQuality.employeeTracking[e] = { physicalActions: [], narrativeAnchors: [], sensoryWords: [], slangWords: [], responseStructures: [], humorCount: 0, lastResponseTime: Date.now(), recentActionPhrases: [] }), gameState.aiContextQuality.employeeTracking[e].recentActionPhrases || (gameState.aiContextQuality.employeeTracking[e].recentActionPhrases = []), gameState.aiContextQuality.employeeTracking[e].slangWords || (gameState.aiContextQuality.employeeTracking[e].slangWords = []), gameState.aiContextQuality.intimacyEscalation[e] || (gameState.aiContextQuality.intimacyEscalation[e] = 0);
}
function Us(e) {
  if (!e) return [];
  const t = (e.match(/\*([^*]+)\*/g) || []).map((e2) => {
    let t2 = e2.replace(/\*/g, "").trim();
    return t2 = t2.toLowerCase().replace(/\s+/g, " "), t2.split(" ").length < 2 ? null : t2;
  }).filter(Boolean);
  return [...new Set(t)];
}
function Ys(e) {
  if (!e) return "";
  const t = ["the", "a", "an", "her", "his", "their", "my", "your", "our", "nervously", "quickly", "slowly", "gently", "softly", "roughly", "suddenly", "quietly", "loudly", "carefully", "slightly", "immediately", "finally", "just", "then", "still", "again", "back", "up", "down", "away", "over"];
  return e.toLowerCase().split(/\s+/).filter((e2) => !t.includes(e2) && e2.length > 2).slice(0, 3).join(" ");
}
function Ws(e, t) {
  if (!e || !t) return false;
  const n = Ys(e), a = Ys(t);
  if (n === a) return true;
  const o = n.split(" ")[0], i = a.split(" ")[0], s = [["sips", "sip", "drinks", "drink", "takes a sip", "takes sip"], ["wipes", "wipe", "wiping", "dabs", "dab", "dabbing"], ["laughs", "laugh", "laughing", "chuckles", "chuckle", "chuckling", "giggles", "giggle", "giggling"], ["smiles", "smile", "smiling", "grins", "grin", "grinning", "smirks", "smirk", "smirking"], ["looks", "look", "looking", "glances", "glance", "glancing", "peers", "peer", "peering"], ["leans", "lean", "leaning", "tilts", "tilt", "tilting"], ["touches", "touch", "touching", "brushes", "brush", "brushing", "strokes", "stroke", "stroking"], ["sighs", "sigh", "sighing", "exhales", "exhale", "exhaling", "breathes", "breathe", "breathing"], ["blushes", "blush", "blushing", "flushes", "flush", "flushing", "reddens", "redden", "reddening"], ["rolls", "roll", "rolling", "spins", "spin", "spinning"], ["crosses", "cross", "crossing", "folds", "fold", "folding"], ["runs", "run", "running", "drags", "drag", "dragging", "rakes", "rake", "raking"], ["shakes", "shake", "shaking", "nods", "nod", "nodding", "bobs", "bob", "bobbing"], ["bites", "bite", "biting", "nibbles", "nibble", "nibbling", "chews", "chew", "chewing"], ["plays", "play", "playing", "fidgets", "fidget", "fidgeting", "toys", "toy", "toying"], ["pulls", "pull", "pulling", "tugs", "tug", "tugging"], ["pushes", "push", "pushing", "shoves", "shove", "shoving"], ["arches", "arch", "arching", "curves", "curve", "curving", "bends", "bend", "bending"], ["gasps", "gasp", "gasping", "inhales", "inhale", "inhaling"], ["moans", "moan", "moaning", "groans", "groan", "groaning", "whimpers", "whimper", "whimpering"], ["spits", "spit", "spitting", "sprays", "spray", "spraying", "spurts", "spurt", "spurting"], ["coughs", "cough", "coughing", "chokes", "choke", "choking", "sputters", "sputter", "sputtering"]];
  for (const e2 of s) {
    const t2 = e2.some((e3) => o.includes(e3) || e3.includes(o)), n2 = e2.some((e3) => i.includes(e3) || e3.includes(i));
    if (t2 && n2) return true;
  }
  const r = ["coffee", "tea", "drink", "cup", "mug", "glass", "hair", "lip", "lips", "mouth", "hand", "hands", "finger", "fingers", "arm", "arms", "shoulder", "shoulders", "neck", "face", "cheek", "cheeks", "eye", "eyes", "brow", "eyebrow", "nose", "chin", "jaw", "shirt", "blouse", "dress", "skirt", "pants", "sleeve", "desk", "chair", "table", "counter", "wall", "door"];
  for (const n2 of r) if (e.includes(n2) && t.includes(n2)) {
    const n3 = e.split(" "), a2 = t.split(" ");
    if (n3[0] === a2[0] || n3[1] && a2[1] && n3[1] === a2[1]) return true;
  }
  return false;
}
function Vs(e) {
  Hs(e);
  const t = gameState.aiContextQuality.employeeTracking[e];
  if (!t.recentActionPhrases || 0 === t.recentActionPhrases.length) return "";
  const n = t.recentActionPhrases.slice(0, 6);
  return 0 === n.length ? "" : `
\u{1F6AB} DO NOT REPEAT THESE RECENT ACTIONS - You've already used these physical actions/gestures recently. Use COMPLETELY DIFFERENT actions this time:
${n.map((e2, t2) => `${t2 + 1}. "${e2}"`).join("\n")}

Instead, try: different body parts, different verbs, different props, or skip the physical action entirely and just use dialogue.`;
}
function Ks(e, t) {
  Hs(e);
  const n = gameState.aiContextQuality.employeeTracking[e];
  for (const e2 of t) if (n.recentActionPhrases.some((t2) => Ws(e2, t2))) {
    const t2 = n.recentActionPhrases.findIndex((t3) => Ws(e2, t3));
    if (t2 > 0) {
      const [e3] = n.recentActionPhrases.splice(t2, 1);
      n.recentActionPhrases.unshift(e3);
    }
  } else n.recentActionPhrases.unshift(e2);
  n.recentActionPhrases.length > 10 && (n.recentActionPhrases = n.recentActionPhrases.slice(0, 10));
}
function Js(e, t) {
  Hs(e);
  const n = gameState.aiContextQuality.employeeTracking[e], a = [], o = (t.toLowerCase(), [{ pattern: /arch(ing|ed|es)?\s+(back|spine)/i, name: "arching_back" }, { pattern: /gasp(ing|ed|s)?\b/i, name: "gasping" }, { pattern: /(fingers?|hands?)\s+(tangl(ing|ed|es)|in|through)\s+hair/i, name: "fingers_in_hair" }, { pattern: /(nails?|fingernails?)\s+(dig|digging|dug|scrap|scraping|scraped)/i, name: "nails_digging" }, { pattern: /trembl(ing|ed|es|e)\b/i, name: "trembling" }, { pattern: /(legs?|ankles?)\s+(hook|hooking|hooked|lock|locking|locked|wrap|wrapping|wrapped)/i, name: "legs_hooking" }, { pattern: /shudder(ing|ed|s)?\b/i, name: "shuddering" }, { pattern: /knuckle(s)?\s+(whit(en|ening|ened)|press(ing|ed)|tight(en|ening|ened)|clench(ing|ed))/i, name: "knuckles_action" }, { pattern: /\b(stormy|gray|grey|blue|green|brown|hazel)\s+(eyes?)\b/i, name: "eye_color_description" }, { pattern: /\bgap.?tooth(ed)?\s+(grin|smile|smirk)/i, name: "gap_tooth_descriptor" }, { pattern: /(shoulders?|arms?|hands?)\s+(slump|slumping|slumped)/i, name: "slumping" }, { pattern: /(breath|exhale|inhale)\s+(catch(es|ing|ed)|sharp(ly)?)/i, name: "breath_catching" }]), i = [];
  for (const { pattern: e2, name: s2 } of o) if (e2.test(t)) {
    i.push(s2);
    const e3 = n.physicalActions.filter((e4) => e4 === s2).length;
    e3 >= gameState.aiContextQuality.maxSameAction && a.push(`\u26A0\uFE0F REPETITION ALERT: You've used "${s2.replace(/_/g, " ")}" ${e3 + 1} times in recent responses. Use a completely different physical reaction this time.`);
  }
  const s = [{ pattern: /\bbuddy\b/i, name: "buddy_cat" }, { pattern: /\b(budget|thrift.?store|therapy|co.?pay|cheap|expensive)\b/i, name: "budget_humor" }, { pattern: /\bscar(red)?\b/i, name: "scar_reference" }, { pattern: /\bwork.?life\s+separation\b/i, name: "work_life_joke" }], r = [];
  for (const { pattern: e2, name: o2 } of s) if (e2.test(t)) {
    r.push(o2);
    const e3 = n.narrativeAnchors.filter((e4) => e4 === o2).length;
    e3 >= gameState.aiContextQuality.maxSameAnchor && a.push(`\u26A0\uFE0F CALLBACK OVERUSE: You've referenced "${o2.replace(/_/g, " ")}" ${e3 + 1} times recently. Find NEW details or humor - retire this callback.`);
  }
  const u2 = [{ pattern: /\bngl\b/i, name: "ngl" }, { pattern: /\btbh\b/i, name: "tbh" }, { pattern: /\bistg\b/i, name: "istg" }, { pattern: /\bfr\b/i, name: "fr" }, { pattern: /\blowkey\b/i, name: "lowkey" }], g = [];
  for (const { pattern: e2, name: o2 } of u2) if (e2.test(t)) {
    g.push(o2);
    const e3 = n.slangWords.filter((e4) => e4 === o2).length;
    e3 >= gameState.aiContextQuality.maxSameSlang && a.push(`\u26A0\uFE0F SLANG OVERUSE: You've used "${o2}" ${e3 + 1} times recently. Drop the abbreviations for a while - talk normally.`);
  }
  const l = [{ pattern: /\bbreath(less|lessly|ing|s)\b/i, name: "breath" }, { pattern: /\b(warm|heat|hot|burning|burns?|burned)\b/i, name: "warmth" }, { pattern: /\b(soft|softly|gentle|gently)\b/i, name: "softness" }, { pattern: /\b(sharp|sharply)\b/i, name: "sharpness" }], c = [];
  for (const { pattern: e2, name: n2 } of l) e2.test(t) && c.push(n2);
  const d = {};
  n.sensoryWords.forEach((e2) => d[e2] = (d[e2] || 0) + 1), c.forEach((e2) => {
    d[e2] >= 2 && a.push(`\u26A0\uFE0F SENSORY REPETITION: You've overused "${e2}" descriptors. Use alternatives from vocabulary bank.`);
  });
  const p = [{ pattern: /pressing\s+(against|into|on)\s+(the\s+)?(counter|marble|desk|table)/i, name: "pressing_against_surface" }, { pattern: /(fingers?|hands?)\s+(drum|drumming|tap|tapping|tapped)\s+/i, name: "fingers_drumming" }, { pattern: /\bphone\s+screen\b/i, name: "phone_screen_mention" }, { pattern: /\bwine\s+glass\b/i, name: "wine_glass_prop" }];
  for (const { pattern: n2, name: o2 } of p) if (n2.test(t) && gameState.employees.find((t2) => t2.id === e) && gameState.chatHistory[e]) {
    const t2 = gameState.chatHistory[e].filter((e2) => !e2.isPlayer).slice(-5).map((e2) => e2.content).filter((e2) => n2.test(e2)).length;
    t2 >= 2 && a.push(`\u{1F534} PHRASE OVERUSE: You've used the phrase pattern "${o2.replace(/_/g, " ")}" ${t2 + 1} times in last 5 responses. Use completely different actions/props.`);
  }
  if ((t.match(/—/g) || []).length >= 3 && (n.responseStructures.filter((e2) => "em_dash_heavy" === e2).length >= 1 && a.push("\u26A0\uFE0F PUNCTUATION OVERUSE: You're relying too heavily on em-dashes (\u2014). Use different punctuation: semicolons, short declaratives, or ellipses."), i.push("em_dash_heavy")), /^(arching|melting|hooking|gasping|leaning|pressing|pulling|pushing|sliding)/i.test(t.trim()) && (n.responseStructures.filter((e2) => "gerund_opening" === e2).length >= 1 && a.push("\u26A0\uFE0F SENTENCE STRUCTURE: You're starting too many responses with gerunds (Arching, Melting, etc.). Start with subject, dialogue, or action verb instead."), i.push("gerund_opening")), /\b(honestly|though honestly|but honestly|therapy|budget|thrift|cheap)\b/i.test(t)) {
    n.humorCount++;
    const t2 = gameState.employees.find((t3) => t3.id === e);
    if (t2) {
      const o2 = Math.round((t2.stats.affection + t2.stats.comfort + t2.stats.desire) / 3);
      gameState.aiContextQuality.intimacyEscalation[e] = o2, o2 > 70 && n.humorCount >= 2 && a.push(`\u26A0\uFE0F TONAL SHIFT NEEDED: Intimacy is VERY HIGH (${o2}%). Reduce meta-commentary and humor. Allow genuine vulnerability and overwhelmed emotion without quips.`);
    }
  } else n.humorCount = Math.max(0, n.humorCount - 1);
  n.physicalActions = [...i, ...n.physicalActions].slice(0, gameState.aiContextQuality.repetitionWindow), n.narrativeAnchors = [...r, ...n.narrativeAnchors].slice(0, gameState.aiContextQuality.repetitionWindow), n.sensoryWords = [...c, ...n.sensoryWords].slice(0, gameState.aiContextQuality.repetitionWindow), n.slangWords = [...g, ...n.slangWords].slice(0, gameState.aiContextQuality.repetitionWindow), n.responseStructures = [...n.responseStructures].slice(0, gameState.aiContextQuality.repetitionWindow);
  const m = Us(t);
  if (m.length > 0) {
    Ks(e, m);
    const t2 = gameState.aiContextQuality.employeeTracking[e];
    for (const e2 of m) t2.recentActionPhrases.filter((t3) => Ws(e2, t3) && t3 !== e2).length >= 2 && a.push(`\u{1F534} ACTION REPETITION: You've done similar actions to "${e2}" multiple times. Try something completely different!`);
  }
  return a;
}
function Qs(e) {
  Hs(e);
  const t = gameState.aiContextQuality.vocabularyBanks, n = (e2, t2 = 5) => [...e2].sort(() => Math.random() - 0.5).slice(0, t2);
  return `
\u{1F3A8} RESPONSE VARIETY TOOLKIT:
Use these alternatives to avoid repetition:

PHYSICAL REACTIONS (instead of arching/gasping/trembling):
- Arousal: ${n(t.arousal).join(", ")}
- Spinal: ${n(t.spinalReactions, 3).join(", ")}
- Breath: ${n(t.breathPatterns, 3).join(", ")}

SENSORY DESCRIPTORS (instead of warm/soft/breathless):
- Temperature: ${n(t.temperature, 4).join(", ")}
- Texture: ${n(t.texture, 4).join(", ")}
- Sounds: ${n(t.vocalSounds, 4).join(", ")}

MOVEMENT QUALITY: ${n(t.movementQuality, 5).join(", ")}

\u{1F4DD} STRUCTURE VARIETY:
- Rotate: em-dashes (\u2014), semicolons (;), ellipses (...), short declaratives
- Vary openings: Don't always start with gerunds (Arching, Melting)
- Mix sentence lengths: Alternate complex and punchy

\u26A0\uFE0F AVOID: Recycling the same actions/words from your last 3 responses
`;
}
function sanitizeNpcResponse(e, t = 10) {
  if (!e) return "";
  let n = String(e);
  const u2 = [{ name: "SEEDS", re: /\{SEEDS:[^}]*\}\s*/gi, to: "" }, { name: "BAN", re: /\{BAN:[^}]*\}\s*/gi, to: "" }, { name: "BOOST", re: /\{BOOST:[^}]*\}\s*/gi, to: "" }, { name: "GENERIC_TAG", re: /\{[A-Z]+:[^}]*\}\s*/g, to: "" }, { name: "LABEL_LINES", re: /(?:^|\n)\s*(Key choices:|Physical anchors:|Emotional arc:|Seed integration:|Relationship metrics:|Dialogue flow:|Meta commentary:|Scene breakdown:|Writing choices:|Character notes:|Technical details:).*?(?=\n|$)/gi, to: "" }, { name: "HEADINGS", re: /^#{1,6}\s+(Key choices|Physical anchors|Emotional arc|Seed integration|Relationship metrics|Dialogue flow|Meta commentary|Scene breakdown|Writing choices).*$/gim, to: "" }, { name: "METRICS", re: /\b(Affection|Trust|Desire|Intimacy|Obedience|Comfort)\s*\(\d+\s*→\s*\d+\)/gi, to: "" }, { name: "HR_RULES", re: /^[-*_]{3,}\s*$/gm, to: "" }, { name: "BRACKETS", re: /\[(.*?)\]/g, to: "", guard: (before, after) => after.trim() ? after : before.replace(/[\[\]]/g, "") }, { name: "LEAD_ACTION", re: /^\*\s*(laughs?|smiles?|grins?|nods?|shrugs?|sighs?|waves?)\s*\*\s*/gi, to: "" }, { name: "TRAIL_ACTION", re: /\s+\*\s*(laughs?|smiles?|grins?|nods?|shrugs?|sighs?|waves?)\s*\*$/gi, to: "" }, { name: "NL_COLLAPSE", re: /\n\s*\n\s*\n/g, to: "\n\n" }, { name: "WS_COLLAPSE", re: /\s+/g, to: " " }];
  for (const step of u2) {
    const before = n;
    if (n = n.replace(step.re, step.to), step.guard && (n = step.guard(before, n)), n !== before) {
      let removed = "";
      if ("" === step.to) try {
        const m = before.match(new RegExp(step.re.source, step.re.flags));
        m && (removed = " | removed: " + JSON.stringify(m.slice(0, 4).join(" \u22EF ")).slice(0, 180));
      } catch (u3) {
      }
      console.log(`[Sanitize] ${step.name}: ${before.length}\u2192${n.length} chars${removed}`);
    }
  }
  n = n.trim();
  const a = 3e3;
  if (n.length <= a) return n;
  console.log(`[Sanitize] TRUNCATE: ${n.length} chars exceeds 3000 cap`);
  const o = n.slice(0, a), i = Math.max(o.lastIndexOf(". "), o.lastIndexOf("! "), o.lastIndexOf("? "));
  n = i > 2500 ? n.slice(0, i + 1).trim() : o.trim() + "...";
  const s = n.match(/\b[A-Z][a-z]+:\s+[^:]{20,}/g);
  if (s && s.length > 2) {
    const e2 = n.split("\n").filter((e3) => e3.trim());
    for (let t2 = e2.length - 1; t2 >= 0; t2--) {
      const a2 = e2[t2].trim();
      if (!/^[A-Z][a-z]+:\s/.test(a2) && a2.length > 10) {
        n = e2.slice(t2).join(" ").trim();
        break;
      }
    }
    if (s.length > 5) {
      const e3 = n.split(/\n\n+/);
      n = e3[e3.length - 1] || n;
    }
  }
  return n;
}
function Xs(e, t = 50) {
  const n = gameState.chatHistory[e] || [];
  return gameState.employees.find((t2) => t2.id === e), n.slice(-t).map((e2) => {
    let t2 = `${e2.sender}: ${e2.content}`;
    if (e2.imageUrl) if (e2.isPlayer) t2 += ` [Player sent me a photo: ${e2.imageAlt || "a photo"}]`;
    else {
      let n2 = "";
      n2 = e2.imageAlt ? e2.imageAlt : e2.imagePrompt ? Zs(e2.imagePrompt) : "a personal photo", t2 += ` [IMPORTANT: I just sent a photo to the player. The image shows: ${n2}. I should remember I sent this and can refer to it in my next response.]`;
    }
    return t2;
  }).join("\n");
}
function Zs(e) {
  if (!e || e.length < 50) return e || "a personal photo";
  let t = "";
  return t = /\b(nude|naked|undressed)\b/i.test(e) ? "a nude/intimate photo" : /\b(topless|breasts? exposed|shirtless)\b/i.test(e) ? "a topless photo" : /\b(upskirt|under.*skirt|panties visible)\b/i.test(e) ? "an upskirt photo" : /\b(selfie|mirror|self-portrait)\b/i.test(e) ? "a selfie" : /\b(sexy|seductive|alluring|provocative)\b/i.test(e) ? "a sexy/provocative photo" : /\b(bent over|from behind|rear view|ass|butt)\b/i.test(e) ? "a rear view photo" : /\b(spread|legs apart|open)\b/i.test(e) ? "an explicit intimate photo" : /\b(office|work|desk|cubicle)\b/i.test(e) ? "a photo at the office" : /\b(bedroom|bed|sheets)\b/i.test(e) ? "a photo from the bedroom" : /\b(bathroom|shower|mirror)\b/i.test(e) ? "a bathroom photo" : e.substring(0, 60).replace(/,\s*$/, "") + "...", t;
}
function el(npc, opts) {
  let s = "function" == typeof ot ? ot(npc, opts || {}) : "";
  const scene = "function" == typeof $s ? $s(npc) : "";
  return scene && (s += (s ? "\n" : "") + scene), s;
}
function tl() {
  return "\u{1F6A8} CRITICAL SITUATIONAL AWARENESS:\n- READ THE PLAYER'S MESSAGE CAREFULLY. If they describe you being gagged, bound, unable to speak, or in any physically restrictive situation, RESPOND ACCORDINGLY.\n- If gagged/mouth covered: Use ONLY muffled sounds (mmph, mmmf, nngh, etc.) and physical reactions. NO clear speech.\n- If bound/restrained: Describe struggling, limited movement, inability to act freely.\n- If in the middle of an intimate act: React to what's ACTUALLY happening physically, not just chat casually.\n- MATCH THE SCENARIO: If the player describes an intense, physical, or restrictive situation, respond realistically to those constraints.\n- Don't ignore what the player just described happening. React to it authentically.";
}
function nl(npc, instruction, roster) {
  const msg = (null == instruction ? "" : String(instruction)).trim();
  if (!msg) return "";
  const u2 = npc.name, firstName = u2.split(" ")[0];
  if (!roster || 0 === roster.length) return `${u2}, the player just said: "${msg}"`;
  const lower = msg.toLowerCase(), G2 = (nm) => {
    const f = (nm || "").split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    return f.length >= 2 && new RegExp(`\\b${f}\\b`).test(lower);
  }, U2 = G2(firstName) || lower.includes(u2.toLowerCase()), other = roster.find((p) => p && p.id !== npc.id && G2(p.name)), J2 = /\b(everyone|everybody|all of you|you all|you guys|the room|each of you|y'?all)\b/.test(lower);
  return U2 ? `The Boss just said to you, ${firstName}: "${msg}" \u2014 respond to THIS first, above any coworker chatter.` : other && !J2 ? `The Boss said to ${other.name.split(" ")[0]}, not you: "${msg}". React as ${firstName} would to that being said to someone else \u2014 do not act as though you were told to do it.` : `The Boss said to the room: "${msg}". You, ${firstName}, are included \u2014 respond to it.`;
}
function ol() {
  return gameState.settings?.policy || "professional";
}
