// ============================================================================
// 48-relationships — Relationship batch engine: relationship queue, friendship/drama updates between NPCs.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function zf() {
  ge.relationshipBatchInterval || (ge.relationshipBatchInterval = setInterval(() => {
    Gf();
  }, ge.relationshipBatchDelay), console.log("[AI Optimization] Relationship batching started (30s intervals)"));
}
async function Gf() {
  if (0 === ge.relationshipQueue.length) return;
  ge.relationshipQueue.length > 50 && (console.log(`[AI Optimization] \u26A0\uFE0F Queue too large (${ge.relationshipQueue.length}), trimming to 50`), ge.relationshipQueue = ge.relationshipQueue.slice(-50));
  const e = [...ge.relationshipQueue];
  ge.relationshipQueue = [], console.log(`[AI Optimization] Processing ${e.length} queued relationship evaluations`);
  for (let t = 0; t < e.length; t++) {
    const n = e[t];
    try {
      await Wf(n.viewer, n.postAuthor, n.post, n.comment), t < e.length - 1 && await new Promise((e2) => setTimeout(e2, 100));
    } catch (e2) {
      console.error("[AI Optimization] Batch processing error:", e2);
    }
  }
  console.log(`[AI Optimization] \u2713 Batch complete. Queue now at ${ge.relationshipQueue.length}`);
}
function Hf(e, t, n, a = null) {
  e && t && e.id !== t.id && Yf(e, t, Uf(e, t, n, a), "algorithmic");
}
function Uf(e, t, n, a) {
  e.relationships || (e.relationships = {});
  const o = (e.relationships[t.id] || { strength: 50, type: "colleague" }).strength, i = e.personality || {}, s = t.personality || {};
  let r = 0, l = [];
  const c = (n.content || "").toLowerCase(), d = n.type || "text", p = n.explicitLevel || 0;
  if (n.imageUrl, r += { meme: 1, funny: 1, achievement: 2, work_update: 0, selfie: 1, thirst_trap: 0, explicit: -1, life_update: 1, food: 0, travel: 1, fitness: 0, hobby: 1, entertainment: 0, mood: 0, question: 0, throwback: 1, tea_spilling: 2, gossip: 1 }[d] || 0, p >= 2) {
    const e2 = i.flirty || 50, t2 = i.professional || 50, n2 = i.confidence || 50;
    e2 > 70 ? (r += 2, l.push("flirty_viewer_likes_explicit")) : t2 > 70 && (r -= 1, l.push("professional_viewer_uncomfortable")), n2 < 40 && p >= 3 && (r -= 1, l.push("shy_viewer_uncomfortable"));
  }
  if (a) {
    const e2 = a.toLowerCase(), t2 = a.length, n2 = ["hate", "awful", "terrible", "worst", "wtf", "seriously", "ugh", "gross", "cringe", "yikes"], o2 = ["lol", "haha", "lmao", "rofl", "dead", "omg", "hilarious"], i2 = ["hot", "sexy", "damn", "gorgeous", "stunning", "fine", "looking good"], s2 = ["tea", "drama", "omg", "spill", "gossip", "scandal", "messy"], c2 = ["\u2764\uFE0F", "\u{1F495}", "\u{1F60D}", "\u{1F970}", "\u{1F60A}", "\u{1F601}", "\u{1F389}", "\u{1F44F}", "\u2728", "\u{1F4AF}", "\u{1F525}"], d2 = ["\u{1F644}", "\u{1F612}", "\u{1F624}", "\u{1F480}", "\u{1F62C}"], p2 = ["\u{1F602}", "\u{1F923}", "\u{1F480}", "\u{1F62D}"], m2 = ["\u{1F60F}", "\u{1F618}", "\u{1F975}", "\u{1F440}", "\u{1F525}"], u3 = ["\u2615", "\u{1FAD6}", "\u{1F440}", "\u{1F37F}"];
    let g2 = 0, h2 = 0, y2 = 0, f2 = 0, b2 = 0;
    ["love", "amazing", "great", "awesome", "beautiful", "perfect", "best", "proud", "congrats", "yay", "yes", "nice", "good", "happy"].forEach((t3) => {
      e2.includes(t3) && (g2 += 1);
    }), n2.forEach((t3) => {
      e2.includes(t3) && (h2 += 1);
    }), o2.forEach((t3) => {
      e2.includes(t3) && (y2 += 1);
    }), i2.forEach((t3) => {
      e2.includes(t3) && (f2 += 1);
    }), s2.forEach((t3) => {
      e2.includes(t3) && (b2 += 1);
    }), c2.forEach((e3) => {
      a.includes(e3) && (g2 += 1.5);
    }), d2.forEach((e3) => {
      a.includes(e3) && (h2 += 1.5);
    }), p2.forEach((e3) => {
      a.includes(e3) && (y2 += 1.5);
    }), m2.forEach((e3) => {
      a.includes(e3) && (f2 += 1.5);
    }), u3.forEach((e3) => {
      a.includes(e3) && (b2 += 1.5);
    });
    const v2 = Math.max(g2, h2, y2, f2, b2);
    v2 > 0 ? g2 === v2 ? (r += 3, l.push("supportive_comment")) : y2 === v2 ? (r += 2, l.push("funny_comment")) : f2 === v2 ? (r += 2, l.push("flirty_comment")) : b2 === v2 ? (r += 1, l.push("dramatic_comment")) : h2 === v2 && (r -= 2, l.push("negative_comment")) : t2 < 15 ? (r += 0.5, l.push("generic_comment")) : (r += 1, l.push("engaged_comment")), t2 > 50 && (r += 0.5, l.push("lengthy_comment"));
  } else p < 2 && "achievement" !== d && "tea_spilling" !== d ? (r += 0, l.push("casual_view")) : "achievement" === d ? (r += 1, l.push("appreciates_achievement")) : "tea_spilling" !== d && "gossip" !== d || (r += 0.5, l.push("interested_in_drama"));
  const m = i.outgoing || 50, u2 = s.outgoing || 50, g = i.humor || 50, h = s.humor || 50, y = i.flirty || 50, f = s.flirty || 50, b = (Math.abs(m - u2) + Math.abs(g - h) + Math.abs(y - f)) / 3;
  b < 20 ? (r += 0.5, l.push("compatible_personalities")) : b > 60 && (r -= 0.5, l.push("clashing_personalities")), o > 70 && r > 0 && (r *= 1.2, l.push("strong_bond_amplifies")), o < 30 && r < 0 && (r *= 0.7, l.push("weak_bond_dampens")), c.includes("@" + e.name.toLowerCase()) && (r += 1.5, l.push("mentioned_in_post")), c.includes("?") && !a && (r -= 0.5, l.push("ignored_question"));
  const v = (e.hobbies || []).map((e2) => e2.toLowerCase()), w = (n.tags || []).map((e2) => e2.toLowerCase()), x = v.filter((e2) => w.includes(e2)).length;
  return x > 0 && (r += 0.5 * x, l.push(`shared_interests_x${x}`)), Math.max(-5, Math.min(5, Math.round(10 * r) / 10));
}
function Yf(e, t, n, a = "ai") {
  if (!e || !t || e.id === t.id) return;
  e.relationships || (e.relationships = {}), e.relationships[t.id] || (e.relationships[t.id] = { strength: 50, type: "colleague", history: [] });
  const o = e.relationships[t.id], i = (o.strength || 50) + n;
  Array.isArray(o.history) || (o.history = []), o.strength = Math.max(0, Math.min(100, i)), o.strength > 80 ? o.type = "best_friend" : o.strength > 65 ? o.type = "friend" : o.strength > 35 ? o.type = "colleague" : o.strength > 15 ? o.type = "acquaintance" : o.type = "distant", 0 !== n && (o.history.push({ timestamp: gameState.time?.currentTime || Date.now(), type: "social_interaction", change: n, source: a }), o.history.length > 20 && (o.history = o.history.slice(-20)), Math.abs(n) >= 4 && Jf(e, t, null, null, n));
}
async function Wf(e, t, n, a = null) {
  if (!e || !t || e.id === t.id) return;
  e.relationships || (e.relationships = {}), e.relationships[t.id] || (e.relationships[t.id] = { strength: 50, type: "colleague", history: [] });
  const o = e.relationships[t.id].strength || 50, i = (n.type, n.explicitLevel, !!a), s = e.personality || {}, r = (s.flirty, s.professional, s.humor, `Post: "${n.content?.substring(0, 60) || ""}"${i ? `
Comment: "${a.substring(0, 50)}"` : ""}
Rel: ${o}/100
Output single number -5 to +5 only:`);
  try {
    const n2 = await queuedGenerateText(r, { temperature: 0.3, max_tokens: 3, stopSequences: ["\n", " ", "Rating:", "**", "Why", "(", "The ", "This "] }, `Evaluating social post reaction for ${e.name}`), a2 = parseFloat(n2.trim());
    !isNaN(a2) && a2 >= -5 && a2 <= 5 && Yf(e, t, a2, "ai");
  } catch (t2) {
    console.error(`[Social Dynamics] Error evaluating ${e.name}'s reaction:`, t2);
  }
}
async function Vf(e, t, n, a, o) {
  if (!e || !t || e.id === t.id) return;
  e.relationships || (e.relationships = {}), e.relationships[t.id] || (e.relationships[t.id] = { strength: 50, type: "colleague", history: [] });
  const i = e.relationships[t.id], s = i.strength || 50, r = Kf(e, t, a, o, i);
  !isNaN(r) && r >= -5 && r <= 5 && 0 !== r && (i.strength = Math.max(0, Math.min(100, s + r)), i.strength > 80 ? i.type = "best_friend" : i.strength > 65 ? i.type = "friend" : i.strength > 35 ? i.type = "colleague" : i.type = "distant", console.log(`[Comment Dynamics] ${e.name} \u2194 ${t.name}: ${r > 0 ? "+" : ""}${r} (${s} \u2192 ${i.strength})`), i.history.push({ timestamp: gameState.time?.currentTime || Date.now(), type: "comment_exchange", description: `Replied to ${t.name}'s comment`, change: r }), i.history.length > 20 && (i.history = i.history.slice(-20)));
}
function Kf(e, t, n, a, o) {
  const i = n.toLowerCase(), s = a.toLowerCase(), r = o.strength || 50;
  let l = 0;
  const c = e.personality || {}, d = t.personality || {};
  let p = 0, m = 0, u2 = 0, g = 0, h = 0, y = 0;
  ["love", "great", "awesome", "amazing", "perfect", "yes", "agree", "right", "exactly", "totally"].forEach((e2) => {
    i.includes(e2) && p++, s.includes(e2) && u2++;
  }), ["hate", "wrong", "no", "disagree", "awful", "terrible", "stop", "wtf"].forEach((e2) => {
    i.includes(e2) && m++, s.includes(e2) && g++;
  }), ["yeah", "yep", "same", "agree", "right", "exactly", "totally", "fr", "facts"].forEach((e2) => {
    s.includes(e2) && h++;
  }), ["but", "actually", "no", "nah", "disagree", "wrong"].forEach((e2) => {
    s.includes(e2) && y++;
  }), h > y && (l += 2, r > 60 && (l += 1)), y > h && (l -= 1.5, r < 40 && (l -= 0.5)), p > m && u2 > g && (l += 2), m > p && g > u2 && (h > 0 ? l += 1.5 : l -= 1), (p > m && g > u2 || m > p && u2 > g) && (l -= 1);
  let f = 0;
  ["\u2764\uFE0F", "\u{1F495}", "\u{1F60D}", "\u{1F970}", "\u{1F60A}", "\u{1F601}", "\u{1F389}", "\u2728"].forEach((e2) => {
    a.includes(e2) && (f += 1);
  }), ["\u{1F602}", "\u{1F923}", "\u{1F480}", "\u{1F62D}"].forEach((e2) => {
    a.includes(e2) && (f += 0.5);
  }), ["\u{1F644}", "\u{1F612}", "\u{1F624}", "\u{1F62C}"].forEach((e2) => {
    a.includes(e2) && (f -= 1);
  }), ["\u{1F60F}", "\u{1F618}", "\u{1F975}", "\u{1F525}"].forEach((e2) => {
    a.includes(e2) && (f += 0.5);
  }), l += f;
  const b = a.length;
  b > 50 ? l += 0.5 : b < 10 && (l -= 0.3);
  const v = (Math.abs((c.humor || 50) - (d.humor || 50)) + Math.abs((c.outgoing || 50) - (d.outgoing || 50))) / 2;
  return v < 25 ? l += 0.5 : v > 65 && (l -= 0.3), r > 70 ? (l > 0 && (l *= 1.3), l < 0 && (l *= 0.7)) : r < 30 && (l *= 0.8), Math.max(-5, Math.min(5, Math.round(10 * l) / 10));
}
function Jf(e, t, n, a, o) {
  const i = n?.explicitLevel || 0;
  if (Math.abs(o) < 3 && i < 2) return;
  let s = "", r = "gossip";
  if (o >= 4 ? (s = `${e.name} and ${t.name} seem to be getting really close on social media`, r = "friendship") : o <= -4 ? (s = `${e.name} and ${t.name} had tension on social media`, r = "fight") : i >= 3 && (s = `${t.name} posted something VERY explicit and ${e.name} ${a ? "commented on it" : "saw it"}`, r = "scandal"), s) {
    const n2 = 10 * Math.abs(o) + 15 * i;
    gameState.activeGossip || (gameState.activeGossip = []), gameState.activeGossip.push({ id: `gossip_${Date.now()}_${Math.random()}`, subjectId: t.id, targetId: e.id, content: s, juiciness: n2, timestamp: gameState.time?.currentTime || Date.now(), accuracy: 100, knownBy: [e.id] }), gameState.activeGossip.length > 50 && (gameState.activeGossip = gameState.activeGossip.slice(-50)), console.log(`[Gossip Created] ${s} (juiciness: ${n2})`), n2 >= 65 && (Jr({ content: s, type: r, subjectIds: [e.id, t.id], juiciness: n2, source: "gossip" }), console.log("[CompanyContext] Gossip was juicy enough to become public knowledge!"));
  }
}
function Qf(e, t, n) {
  const a = (t || "").toLowerCase(), o = (n || "").toLowerCase(), i = e.intimacy || 0, s = e.stats?.desire || 0;
  if (i > 60 && s > 50 && /\b(sex|fuck|bed|sleep together|hook up|come over)\b/.test(a + o)) rs({ type: "hookup", npcId: e.id, description: `${e.name} and the boss hooked up`, juiciness: 90 });
  else {
    if (s > 40) {
      if (/\b(date|dating|girlfriend|boyfriend|relationship|love you)\b/.test(a + o)) return void rs({ type: "date", npcId: e.id, description: `${e.name} and the boss went on a date`, juiciness: 70 });
      if (/\b(kiss|kissing|kissed|make out)\b/.test(a + o)) return void rs({ type: "hookup", npcId: e.id, description: `${e.name} and the boss kissed`, juiciness: 65 });
    }
    s > 25 && /\b(flirt|sexy|hot|gorgeous|beautiful|cute)\b/.test(a) && Math.random() < 0.3 && rs({ type: "rumor", npcId: e.id, description: `the boss was flirting with ${e.name}`, juiciness: 45 }), /\b(promot|raise|bonus|favor|special treatment)\b/.test(a) && rs({ type: "promotion", npcId: e.id, description: `${e.name} got special treatment from the boss`, juiciness: 55 }), /\b(fire|fired|quit|resign|argument|fight|angry)\b/.test(a + o) && rs({ type: "scandal", npcId: e.id, description: `${e.name} and the boss had a heated argument`, juiciness: 60 });
  }
}
