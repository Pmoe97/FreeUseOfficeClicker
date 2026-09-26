// ============================================================================
// 48-relationships — Relationship batch engine: relationship queue, friendship/drama updates between NPCs.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function startRelationshipBatching() {
    aiOptimization.relationshipBatchInterval ||
        ((aiOptimization.relationshipBatchInterval = setInterval(() => {
            processRelationshipBatch();
        }, aiOptimization.relationshipBatchDelay)),
        console.log("[AI Optimization] Relationship batching started (30s intervals)"));
}
async function processRelationshipBatch() {
    if (0 === aiOptimization.relationshipQueue.length) return;
    aiOptimization.relationshipQueue.length > 50 &&
        (console.log(
            `[AI Optimization] ⚠️ Queue too large (${aiOptimization.relationshipQueue.length}), trimming to 50`
        ),
        (aiOptimization.relationshipQueue = aiOptimization.relationshipQueue.slice(-50)));
    const e = [...aiOptimization.relationshipQueue];
    (aiOptimization.relationshipQueue = []),
        console.log(`[AI Optimization] Processing ${e.length} queued relationship evaluations`);
    for (let t = 0; t < e.length; t++) {
        const n = e[t];
        try {
            await evaluateNPCReactionToPostImmediate(n.viewer, n.postAuthor, n.post, n.comment),
                t < e.length - 1 && (await new Promise((e) => setTimeout(e, 100)));
        } catch (e) {
            console.error("[AI Optimization] Batch processing error:", e);
        }
    }
    console.log(`[AI Optimization] ✓ Batch complete. Queue now at ${aiOptimization.relationshipQueue.length}`);
}
function evaluateNPCReactionToPost(e, t, n, a = null) {
    if (!e || !t || e.id === t.id) return;
    applyRelationshipChange(e, t, analyzeNPCInteractionAlgorithmic(e, t, n, a), "algorithmic");
}
function analyzeNPCInteractionAlgorithmic(e, t, n, a) {
    e.relationships || (e.relationships = {});
    const o = (e.relationships[t.id] || { strength: 50, type: "colleague" }).strength,
        i = e.personality || {},
        s = t.personality || {};
    let r = 0,
        l = [];
    const c = (n.content || "").toLowerCase(),
        d = n.type || "text",
        p = n.explicitLevel || 0;
    n.imageUrl;
    if (
        ((r +=
            {
                meme: 1,
                funny: 1,
                achievement: 2,
                work_update: 0,
                selfie: 1,
                thirst_trap: 0,
                explicit: -1,
                life_update: 1,
                food: 0,
                travel: 1,
                fitness: 0,
                hobby: 1,
                entertainment: 0,
                mood: 0,
                question: 0,
                throwback: 1,
                tea_spilling: 2,
                gossip: 1,
            }[d] || 0),
        p >= 2)
    ) {
        const e = i.flirty || 50,
            t = i.professional || 50,
            n = i.confidence || 50;
        e > 70
            ? ((r += 2), l.push("flirty_viewer_likes_explicit"))
            : t > 70 && ((r -= 1), l.push("professional_viewer_uncomfortable")),
            n < 40 && p >= 3 && ((r -= 1), l.push("shy_viewer_uncomfortable"));
    }
    if (a) {
        const e = a.toLowerCase(),
            t = a.length,
            n = ["hate", "awful", "terrible", "worst", "wtf", "seriously", "ugh", "gross", "cringe", "yikes"],
            o = ["lol", "haha", "lmao", "rofl", "dead", "omg", "hilarious"],
            i = ["hot", "sexy", "damn", "gorgeous", "stunning", "fine", "looking good"],
            s = ["tea", "drama", "omg", "spill", "gossip", "scandal", "messy"],
            c = ["❤️", "💕", "😍", "🥰", "😊", "😁", "🎉", "👏", "✨", "💯", "🔥"],
            d = ["🙄", "😒", "😤", "💀", "😬"],
            p = ["😂", "🤣", "💀", "😭"],
            m = ["😏", "😘", "🥵", "👀", "🔥"],
            u = ["☕", "🫖", "👀", "🍿"];
        let g = 0,
            h = 0,
            y = 0,
            f = 0,
            b = 0;
        [
            "love",
            "amazing",
            "great",
            "awesome",
            "beautiful",
            "perfect",
            "best",
            "proud",
            "congrats",
            "yay",
            "yes",
            "nice",
            "good",
            "happy",
        ].forEach((t) => {
            e.includes(t) && (g += 1);
        }),
            n.forEach((t) => {
                e.includes(t) && (h += 1);
            }),
            o.forEach((t) => {
                e.includes(t) && (y += 1);
            }),
            i.forEach((t) => {
                e.includes(t) && (f += 1);
            }),
            s.forEach((t) => {
                e.includes(t) && (b += 1);
            }),
            c.forEach((e) => {
                a.includes(e) && (g += 1.5);
            }),
            d.forEach((e) => {
                a.includes(e) && (h += 1.5);
            }),
            p.forEach((e) => {
                a.includes(e) && (y += 1.5);
            }),
            m.forEach((e) => {
                a.includes(e) && (f += 1.5);
            }),
            u.forEach((e) => {
                a.includes(e) && (b += 1.5);
            });
        const v = Math.max(g, h, y, f, b);
        v > 0
            ? g === v
                ? ((r += 3), l.push("supportive_comment"))
                : y === v
                  ? ((r += 2), l.push("funny_comment"))
                  : f === v
                    ? ((r += 2), l.push("flirty_comment"))
                    : b === v
                      ? ((r += 1), l.push("dramatic_comment"))
                      : h === v && ((r -= 2), l.push("negative_comment"))
            : t < 15
              ? ((r += 0.5), l.push("generic_comment"))
              : ((r += 1), l.push("engaged_comment")),
            t > 50 && ((r += 0.5), l.push("lengthy_comment"));
    } else
        p < 2 && "achievement" !== d && "tea_spilling" !== d
            ? ((r += 0), l.push("casual_view"))
            : "achievement" === d
              ? ((r += 1), l.push("appreciates_achievement"))
              : ("tea_spilling" !== d && "gossip" !== d) || ((r += 0.5), l.push("interested_in_drama"));
    const m = i.outgoing || 50,
        u = s.outgoing || 50,
        g = i.humor || 50,
        h = s.humor || 50,
        y = i.flirty || 50,
        f = s.flirty || 50,
        b = (Math.abs(m - u) + Math.abs(g - h) + Math.abs(y - f)) / 3;
    b < 20
        ? ((r += 0.5), l.push("compatible_personalities"))
        : b > 60 && ((r -= 0.5), l.push("clashing_personalities")),
        o > 70 && r > 0 && ((r *= 1.2), l.push("strong_bond_amplifies")),
        o < 30 && r < 0 && ((r *= 0.7), l.push("weak_bond_dampens")),
        c.includes("@" + e.name.toLowerCase()) && ((r += 1.5), l.push("mentioned_in_post")),
        c.includes("?") && !a && ((r -= 0.5), l.push("ignored_question"));
    const v = (e.hobbies || []).map((e) => e.toLowerCase()),
        w = (n.tags || []).map((e) => e.toLowerCase()),
        x = v.filter((e) => w.includes(e)).length;
    x > 0 && ((r += 0.5 * x), l.push(`shared_interests_x${x}`));
    return Math.max(-5, Math.min(5, Math.round(10 * r) / 10));
}
function applyRelationshipChange(e, t, n, a = "ai") {
    if (!e || !t || e.id === t.id) return;
    e.relationships || (e.relationships = {}),
        e.relationships[t.id] || (e.relationships[t.id] = { strength: 50, type: "colleague", history: [] });
    const o = e.relationships[t.id],
        i = (o.strength || 50) + n;
    Array.isArray(o.history) || (o.history = []);
    (o.strength = Math.max(0, Math.min(100, i))),
        o.strength > 80
            ? (o.type = "best_friend")
            : o.strength > 65
              ? (o.type = "friend")
              : o.strength > 35
                ? (o.type = "colleague")
                : o.strength > 15
                  ? (o.type = "acquaintance")
                  : (o.type = "distant"),
        0 !== n &&
            (o.history.push({
                timestamp: gameState.time?.currentTime || Date.now(),
                type: "social_interaction",
                change: n,
                source: a,
            }),
            o.history.length > 20 && (o.history = o.history.slice(-20)),
            Math.abs(n) >= 4 && createGossipFromSocialInteraction(e, t, null, null, n));
}
async function evaluateNPCReactionToPostImmediate(e, t, n, a = null) {
    if (!e || !t || e.id === t.id) return;
    e.relationships || (e.relationships = {}),
        e.relationships[t.id] || (e.relationships[t.id] = { strength: 50, type: "colleague", history: [] });
    const o = e.relationships[t.id].strength || 50,
        i = (n.type, n.explicitLevel, !!a),
        s = e.personality || {},
        r =
            (s.flirty,
            s.professional,
            s.humor,
            `Post: "${n.content?.substring(0, 60) || ""}"${i ? `\nComment: "${a.substring(0, 50)}"` : ""}\nRel: ${o}/100\nOutput single number -5 to +5 only:`);
    try {
        const n = await queuedGenerateText(
                r,
                {
                    temperature: 0.3,
                    max_tokens: 3,
                    stopSequences: ["\n", " ", "Rating:", "**", "Why", "(", "The ", "This "],
                },
                `Evaluating social post reaction for ${e.name}`
            ),
            a = parseFloat(n.trim());
        !isNaN(a) && a >= -5 && a <= 5 && applyRelationshipChange(e, t, a, "ai");
    } catch (t) {
        console.error(`[Social Dynamics] Error evaluating ${e.name}'s reaction:`, t);
    }
}
async function evaluateNPCCommentInteraction(e, t, n, a, o) {
    if (!e || !t || e.id === t.id) return;
    e.relationships || (e.relationships = {}),
        e.relationships[t.id] || (e.relationships[t.id] = { strength: 50, type: "colleague", history: [] });
    const i = e.relationships[t.id],
        s = i.strength || 50,
        r = analyzeCommentReplyAlgorithmic(e, t, a, o, i);
    !isNaN(r) &&
        r >= -5 &&
        r <= 5 &&
        0 !== r &&
        ((i.strength = Math.max(0, Math.min(100, s + r))),
        i.strength > 80
            ? (i.type = "best_friend")
            : i.strength > 65
              ? (i.type = "friend")
              : i.strength > 35
                ? (i.type = "colleague")
                : (i.type = "distant"),
        console.log(`[Comment Dynamics] ${e.name} ↔ ${t.name}: ${r > 0 ? "+" : ""}${r} (${s} → ${i.strength})`),
        i.history.push({
            timestamp: gameState.time?.currentTime || Date.now(),
            type: "comment_exchange",
            description: `Replied to ${t.name}'s comment`,
            change: r,
        }),
        i.history.length > 20 && (i.history = i.history.slice(-20)));
}
function analyzeCommentReplyAlgorithmic(e, t, n, a, o) {
    const i = n.toLowerCase(),
        s = a.toLowerCase(),
        r = o.strength || 50;
    let l = 0;
    const c = e.personality || {},
        d = t.personality || {};
    let p = 0,
        m = 0,
        u = 0,
        g = 0,
        h = 0,
        y = 0;
    ["love", "great", "awesome", "amazing", "perfect", "yes", "agree", "right", "exactly", "totally"].forEach(
        (e) => {
            i.includes(e) && p++, s.includes(e) && u++;
        }
    ),
        ["hate", "wrong", "no", "disagree", "awful", "terrible", "stop", "wtf"].forEach((e) => {
            i.includes(e) && m++, s.includes(e) && g++;
        }),
        ["yeah", "yep", "same", "agree", "right", "exactly", "totally", "fr", "facts"].forEach((e) => {
            s.includes(e) && h++;
        }),
        ["but", "actually", "no", "nah", "disagree", "wrong"].forEach((e) => {
            s.includes(e) && y++;
        }),
        h > y && ((l += 2), r > 60 && (l += 1)),
        y > h && ((l -= 1.5), r < 40 && (l -= 0.5)),
        p > m && u > g && (l += 2),
        m > p && g > u && (h > 0 ? (l += 1.5) : (l -= 1)),
        ((p > m && g > u) || (m > p && u > g)) && (l -= 1);
    let f = 0;
    ["❤️", "💕", "😍", "🥰", "😊", "😁", "🎉", "✨"].forEach((e) => {
        a.includes(e) && (f += 1);
    }),
        ["😂", "🤣", "💀", "😭"].forEach((e) => {
            a.includes(e) && (f += 0.5);
        }),
        ["🙄", "😒", "😤", "😬"].forEach((e) => {
            a.includes(e) && (f -= 1);
        }),
        ["😏", "😘", "🥵", "🔥"].forEach((e) => {
            a.includes(e) && (f += 0.5);
        }),
        (l += f);
    const b = a.length;
    b > 50 ? (l += 0.5) : b < 10 && (l -= 0.3);
    const v = (Math.abs((c.humor || 50) - (d.humor || 50)) + Math.abs((c.outgoing || 50) - (d.outgoing || 50))) / 2;
    return (
        v < 25 ? (l += 0.5) : v > 65 && (l -= 0.3),
        r > 70 ? (l > 0 && (l *= 1.3), l < 0 && (l *= 0.7)) : r < 30 && (l *= 0.8),
        Math.max(-5, Math.min(5, Math.round(10 * l) / 10))
    );
}
function createGossipFromSocialInteraction(e, t, n, a, o) {
    const i = n?.explicitLevel || 0;
    if (Math.abs(o) < 3 && i < 2) return;
    let s = "",
        r = "gossip";
    if (
        (o >= 4
            ? ((s = `${e.name} and ${t.name} seem to be getting really close on social media`), (r = "friendship"))
            : o <= -4
              ? ((s = `${e.name} and ${t.name} had tension on social media`), (r = "fight"))
              : i >= 3 &&
                ((s = `${t.name} posted something VERY explicit and ${e.name} ${a ? "commented on it" : "saw it"}`),
                (r = "scandal")),
        s)
    ) {
        const n = 10 * Math.abs(o) + 15 * i;
        gameState.activeGossip || (gameState.activeGossip = []),
            gameState.activeGossip.push({
                id: `gossip_${Date.now()}_${Math.random()}`,
                subjectId: t.id,
                targetId: e.id,
                content: s,
                juiciness: n,
                timestamp: gameState.time?.currentTime || Date.now(),
                accuracy: 100,
                knownBy: [e.id],
            }),
            gameState.activeGossip.length > 50 && (gameState.activeGossip = gameState.activeGossip.slice(-50)),
            console.log(`[Gossip Created] ${s} (juiciness: ${n})`),
            n >= 65 &&
                (addToCompanyWideContext({
                    content: s,
                    type: r,
                    subjectIds: [e.id, t.id],
                    juiciness: n,
                    source: "gossip",
                }),
                console.log("[CompanyContext] Gossip was juicy enough to become public knowledge!"));
    }
}
function checkForGossipWorthyInteraction(e, t, n) {
    const a = (t || "").toLowerCase(),
        o = (n || "").toLowerCase(),
        i = e.intimacy || 0,
        s = e.stats?.desire || 0;
    if (i > 60 && s > 50 && /\b(sex|fuck|bed|sleep together|hook up|come over)\b/.test(a + o))
        createPlayerGossip({
            type: "hookup",
            npcId: e.id,
            description: `${e.name} and the boss hooked up`,
            juiciness: 90,
        });
    else {
        if (s > 40) {
            if (/\b(date|dating|girlfriend|boyfriend|relationship|love you)\b/.test(a + o))
                return void createPlayerGossip({
                    type: "date",
                    npcId: e.id,
                    description: `${e.name} and the boss went on a date`,
                    juiciness: 70,
                });
            if (/\b(kiss|kissing|kissed|make out)\b/.test(a + o))
                return void createPlayerGossip({
                    type: "hookup",
                    npcId: e.id,
                    description: `${e.name} and the boss kissed`,
                    juiciness: 65,
                });
        }
        s > 25 &&
            /\b(flirt|sexy|hot|gorgeous|beautiful|cute)\b/.test(a) &&
            Math.random() < 0.3 &&
            createPlayerGossip({
                type: "rumor",
                npcId: e.id,
                description: `the boss was flirting with ${e.name}`,
                juiciness: 45,
            }),
            /\b(promot|raise|bonus|favor|special treatment)\b/.test(a) &&
                createPlayerGossip({
                    type: "promotion",
                    npcId: e.id,
                    description: `${e.name} got special treatment from the boss`,
                    juiciness: 55,
                }),
            /\b(fire|fired|quit|resign|argument|fight|angry)\b/.test(a + o) &&
                createPlayerGossip({
                    type: "scandal",
                    npcId: e.id,
                    description: `${e.name} and the boss had a heated argument`,
                    juiciness: 60,
                });
    }
}
