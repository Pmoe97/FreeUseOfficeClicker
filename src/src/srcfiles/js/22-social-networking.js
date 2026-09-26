// ============================================================================
// 22-social-networking — Social networking: relationships, company awareness, event log, gossip engine, coworker context, memory.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function updateRelationship(e, t, n) {
    const a = gameState.employees.find((t) => t.id === e),
        o = gameState.employees.find((e) => e.id === t);
    if (!a || !o) return;
    initializeEmployeeSocialData(a),
        initializeEmployeeSocialData(o),
        a.relationships[t] || (a.relationships[t] = createRelationship({ targetId: t }));
    const i = a.relationships[t];
    (i.strength = Math.max(0, Math.min(100, i.strength + (n.impact || 0)))),
        (i.lastInteraction = Date.now()),
        i.history.push({
            timestamp: gameState.time?.currentTime || Date.now(),
            event: n.event || "interaction",
            impact: n.impact || 0,
        }),
        i.history.length > 50 && (i.history = i.history.slice(-50)),
        n.impact > 0 && i.positiveInteractions++,
        n.impact < 0 && i.conflicts++,
        i.strength > 80
            ? (i.type = "crush" === i.type ? "romantic" : "best_friend")
            : i.strength > 60
              ? (i.type = "crush" === i.type || "romantic" === i.type ? i.type : "friend")
              : i.strength < 20
                ? (i.type = "enemy")
                : i.strength < 30 && (i.type = "rival"),
        o.relationships[e] || (o.relationships[e] = createRelationship({ targetId: e }));
    const s = o.relationships[e],
        r = n.impact * (0.8 + 0.4 * Math.random());
    (s.strength = Math.max(0, Math.min(100, s.strength + r))),
        (s.lastInteraction = Date.now()),
        s.history.push({
            timestamp: gameState.time?.currentTime || Date.now(),
            event: n.event || "interaction",
            impact: r,
        }),
        s.history.length > 50 && (s.history = s.history.slice(-50)),
        r > 0 && s.positiveInteractions++,
        r < 0 && s.conflicts++,
        s.strength > 80
            ? (s.type = "crush" === s.type ? "romantic" : "best_friend")
            : s.strength > 60
              ? (s.type = "crush" === s.type || "romantic" === s.type ? s.type : "friend")
              : s.strength < 20
                ? (s.type = "enemy")
                : s.strength < 30 && (s.type = "rival");
}
function generateRandomRelationships(e = null) {
    const t = gameState.employees.filter((e) => "active" === e.employmentStatus);
    if (!(t.length < 2))
        if (e) {
            const n = t.find((t) => t.id === e);
            if (!n) return;
            t.forEach((t) => {
                if (t.id === e) return;
                const a = Math.random();
                let o,
                    i = "neutral";
                if (a < 0.08) o = 5 + 12 * Math.random();
                else if (a < 0.2) o = 12 + 13 * Math.random();
                else {
                    (o = 40 + 20 * Math.random()), t.locationId === n.locationId && (o += 10);
                    (o += 5 * (t.hobbies || []).filter((e) => (n.hobbies || []).includes(e)).length),
                        t.personality === n.personality && (o += 10 * Math.random()),
                        Math.random() < 0.05 && ((i = "crush"), (o += 15));
                }
                updateRelationship(e, t.id, { event: "initial_meeting", impact: o - 50 }),
                    "crush" === i && (n.relationships[t.id].type = "crush");
            });
        } else
            for (let e = 0; e < t.length - 1; e++)
                for (let n = e + 1; n < t.length; n++) {
                    if (Math.random() > 0.3) continue;
                    const a = t[e],
                        o = t[n],
                        i = 10 * (Math.random() - 0.5);
                    updateRelationship(a.id, o.id, { event: "background_interaction", impact: i });
                }
}
function updateCompanyAwareness() {
    const e = gameState.employees.filter((e) => "active" === e.employmentStatus);
    (gameState.companyContext.totalEmployees = e.length),
        (gameState.companyContext.locationEmployeeCounts = {}),
        e.forEach((e) => {
            const t = e.locationId || "garage";
            gameState.companyContext.locationEmployeeCounts[t] =
                (gameState.companyContext.locationEmployeeCounts[t] || 0) + 1;
        }),
        e.forEach((t) => {
            initializeEmployeeSocialData(t),
                (t.awareness.knowsCoworkers = e.filter((e) => e.id !== t.id).map((e) => e.id)),
                (t.awareness.knowsLocations = gameState.locations.filter((e) => e.unlocked).map((e) => e.id)),
                (t.awareness.companyKnowledge = { totalEmployees: e.length, lastUpdated: Date.now() }),
                e.forEach((e) => {
                    if (e.id === t.id) return;
                    t.relationships[e.id] || (t.relationships[e.id] = createRelationship({ targetId: e.id })),
                        (t.relationships[e.id].sharedLocation = t.locationId === e.locationId);
                    const n = (t.hobbies || []).filter((t) => (e.hobbies || []).includes(t));
                    t.relationships[e.id].sharedInterests = n;
                });
        });
}
function logCompanyEvent(e) {
    const t = createEvent(e);
    return (
        gameState.socialNetwork.globalEvents.push(t),
        gameState.socialNetwork.globalEvents.length > 100 &&
            (gameState.socialNetwork.globalEvents = gameState.socialNetwork.globalEvents.slice(-100)),
        t
    );
}
function getRelevantEvents(e, t = 10) {
    return gameState.socialNetwork.globalEvents
        .filter((t) => t.involvedEmployees.includes(e) || t.importance >= 7)
        .sort((e, t) => t.timestamp - e.timestamp)
        .slice(0, t);
}
function getCoworkerContext(e) {
    const t = gameState.employees.find((t) => t.id === e);
    if (!t) return "";
    initializeEmployeeSocialData(t);
    const n = gameState.employees.filter((t) => "active" === t.employmentStatus && t.id !== e),
        a = n.filter((e) => e.locationId === t.locationId);
    let o = `${t.name} works at ${t.locationId || "garage"} with ${a.length} coworkers. `;
    o += `The company has ${gameState.companyContext.totalEmployees} total employees. `;
    const i = Object.entries(t.relationships || {})
        .map(([e, t]) => {
            const a = n.find((t) => t.id === e);
            return a
                ? "best_friend" === t.type
                    ? `Best friend: ${a.name}`
                    : "crush" === t.type
                      ? `Has a crush on: ${a.name}`
                      : "romantic" === t.type
                        ? `In a relationship with: ${a.name}`
                        : "rival" === t.type
                          ? `Rival: ${a.name}`
                          : null
                : null;
        })
        .filter(Boolean);
    return i.length > 0 && (o += `Relationships: ${i.join(", ")}. `), o;
}
function getSocialVoiceCard(e) {
    // "starts posts mid-thought like a continuation" was a permanent per-NPC voice
    // trait (o[n % o.length]). For NPCs it landed on, it made EVERY post and comment
    // open with "...and ...", reading as a broken record. The voice is cached on
    // e.social.voice, so already-assigned NPCs keep the trait until cleaned here.
    // "uses abbreviations (ngl, fr, tbh, istg)" had the same failure mode: it was a
    // strict closed-list instruction, and the current (more instruction-literal)
    // text-gen model obeys it to the letter, so affected NPCs used those exact 4
    // tokens in nearly every message. Migrate any already-cached copy to the
    // frequency-capped wording below.
    if (e.social?.voice) {
        const c = String(e.social.voice)
            .split(";")
            .map((s) => s.trim())
            .map((s) =>
                /^uses abbreviations \(ngl,\s*fr,\s*tbh,\s*istg\)$/i.test(s)
                    ? "occasionally drops a slang abbreviation (ngl, fr, tbh, istg, lowkey) — rarely, never twice in a row, not every message"
                    : s
            )
            .filter((s) => s && !/mid-?thought|continuation|starts?\s+posts?/i.test(s))
            .join("; ");
        if (c && c !== e.social.voice) e.social.voice = c;
        return e.social.voice;
    }
    const t = e.personality || {},
        n = String(e.id || "x")
            .split("")
            .reduce((e, t) => e + t.charCodeAt(0), 0),
        a = [
            "lowercase rambler — run-on sentences, rarely capitalizes, chatty",
            "clipped — short fragments. No filler. Periods.",
            "emoji-forward — emoji carry half the tone",
            "dry deadpan — minimal punctuation, never exclaims, understates everything",
            "expressive — CAPS for emphasis, dramatic punctuation",
        ],
        o = [
            "occasionally drops a slang abbreviation (ngl, fr, tbh, istg, lowkey) — rarely, never twice in a row, not every message",
            "trails off with ellipses...",
            "asks rhetorical questions",
            "makes self-deprecating asides",
            "uses one. word. sentences. for emphasis",
        ],
        i =
            (t.professional || 50) > 70
                ? a[1]
                : (t.outgoing || 50) > 70
                  ? a[n % 2 == 0 ? 4 : 2]
                  : (t.humor || 50) > 65
                    ? a[3]
                    : a[n % a.length],
        s = `${i}; ${o[n % o.length]}; emoji budget ${(t.outgoing || 50) > 60 ? "1-2" : "0-1"} (vary which emoji — don't reuse the same one every message)`;
    return (e.social = e.social || {}), (e.social.voice = s), s;
}
function addSocialCallback(e, t, n = "post") {
    e &&
        t &&
        !isAiFallback(t) &&
        ((e.social = e.social || {}),
        (e.social.callbacks = e.social.callbacks || []),
        e.social.callbacks.push({
            t: gameState.time?.currentTime || Date.now(),
            gist: String(t).replace(/\s+/g, " ").substring(0, 100),
            tag: n,
        }),
        e.social.callbacks.length > 10 && (e.social.callbacks = e.social.callbacks.slice(-10)));
}
function buildSocialLifeNow(e) {
    const t = [],
        n = Object.entries(e.relationships || {}).find(([, e]) => "romantic" === e?.type);
    if (n) {
        const e = gameState.employees.find((e) => e.id === n[0]);
        e && t.push(`dating ${e.name}`);
    }
    const a = e.personalLife?.livingSituation;
    a?.pets?.length > 0 &&
        t.push(
            `has pet${a.pets.length > 1 ? "s" : ""}: ${a.pets
                    .slice(0, 2)
                    .map((e) => ("string" == typeof e ? e : e.name || e.type || "a pet"))
                    .join(", ")}`
        );
    "string" == typeof a?.type && t.push(`lives in ${a.type}`);
    const o = e.giftedPossessions,
        i = o
            ? [...(o.vehicles || []), ...(o.jewelry || []), ...(o.tech || [])]
                  .slice(-2)
                  .map((e) => e.item)
                  .filter(Boolean)
            : [];
    return i.length > 0 && t.push(`prized gifts from the boss: ${i.join(", ")}`), t.join("; ");
}
function buildSocialRecentLife(e, t = !1) {
    const n = (gameState.socialNetwork?.posts || [])
        .filter((t) => t.authorId === e.id)
        .slice(0, t ? 2 : 4)
        .map(
            (e) =>
                `- ${getTimeAgo(e.timestamp)}, you posted: "${(e.content || "").replace(/\s+/g, " ").substring(0, 90)}"`
        );
    if (t) return n.join("\n");
    const a = (e.social?.callbacks || []).slice(-3).map((e) => `- a while back: ${e.gist}`),
        o = (e.memory?.items || [])
            .filter((e) => "event" === e.type || "interaction" === e.type)
            .slice(-2)
            .map((e) => `- you remember: ${String(e.text).substring(0, 90)}`);
    return [...n, ...a, ...o].join("\n");
}
function buildSocialContinuityBlock(e, t = !1) {
    const n = buildSocialRecentLife(e, t),
        a = buildSocialLifeNow(e);
    return `${a ? `\nYour life right now: ${a}` : ""}\nYour voice (ALWAYS write in this exact style — it OVERRIDES the tone, punctuation, and emoji density of any examples shown later): ${getSocialVoiceCard(e)}${
            n
                ? `\n\n=== YOUR RECENT LIFE (be consistent with this — reference specifics when natural, follow up on open threads) ===\n${n}\n→ NEVER invent new major life facts (new partner, new pet, moving, quitting) — those come from the game\n→ Grounded beats generic: name the specific thing, don't gesture vaguely at it`
                : ""
        }`;
}
function getEmployeeAwarenessForPost(e) {
    "object" == typeof e && e.id && (e = e.id);
    const t = gameState.employees.find((t) => t.id === e);
    if (!t) return null;
    initializeEmployeeSocialData(t);
    const n = gameState.employees.filter((t) => "active" === t.employmentStatus && t.id !== e),
        a = n.filter((e) => e.locationId === t.locationId),
        o = n.filter((e) => e.locationId !== t.locationId),
        i = { bestFriends: [], friends: [], crushes: [], romantic: [], rivals: [], enemies: [], neutral: [] },
        s = [];
    Object.entries(t.relationships || {}).forEach(([e, t]) => {
        const a = n.find((t) => t.id === e);
        if (!a) return;
        const o = {
            id: a.id,
            name: a.name,
            position: a.position,
            location: a.locationId,
            strength: t.strength,
            sameLocation: t.sharedLocation,
            sharedInterests: t.sharedInterests,
        };
        "best_friend" === t.type
            ? i.bestFriends.push(o)
            : "friend" === t.type
              ? i.friends.push(o)
              : "crush" === t.type
                ? i.crushes.push(o)
                : "romantic" === t.type
                  ? i.romantic.push(o)
                  : "rival" === t.type
                    ? i.rivals.push(o)
                    : "enemy" === t.type
                      ? i.enemies.push(o)
                      : i.neutral.push(o),
            s.push({
                coworkerId: a.id,
                coworkerName: a.name,
                relationship: t.type || "neutral",
                knownFor: a.position,
                strength: t.strength,
            });
    });
    const r = getRelevantEvents(e, 5),
        l = [t.locationId || "headquarters"],
        c = gameState.chatHistory[t.id] || [],
        nowMs = gameState.time?.currentTime || Date.now(),
        d = nowMs - 72e5,
        p = c.filter((e) => (e.timestamp || 0) > d).slice(-5);
    let m = null;
    if (p.length >= 2) {
        const e = p.map((e) => e.content).join(" "),
            t = [],
            isExplicit =
                /\b(nude|naked|undress|stripped|stripping|sex|fuck|cock|dick|pussy|tits|boobs|cum|orgasm|horny|aroused|moan|blowjob|riding|nipple|clit|panties|lingerie|take it all off|show me your body|bend over)\b/i.test(
                    e
                );
        // Explicit/intimate content takes precedence: an intimate exchange that happens to mention
        // "meeting" or "lunch" must not be mislabeled "work-related" or "food/social".
        isExplicit
            ? t.push("explicit/intimate")
            : /\b(flirt|sexy|hot|beautiful|cute|attractive|date|kiss|touch|tease|seduce)\b/i.test(e) &&
              t.push("flirty/romantic"),
            !isExplicit &&
                /\b(project|deadline|work|meeting|report|task|client)\b/i.test(e) &&
                t.push("work-related"),
            /\b(tired|busy|stressed|excited|happy|sad|frustrated)\b/i.test(e) && t.push("emotional/personal"),
            !isExplicit && /\b(lunch|dinner|coffee|drink|food|eat)\b/i.test(e) && t.push("food/social"),
            (m = {
                hasRecentChat: !0,
                messageCount: p.length,
                themes: t,
                lastMessages: p.slice(-3).map((e) => ({ sender: e.sender, preview: e.content.slice(0, 100) })),
                timeAgo: Math.max(0, Math.round((nowMs - (p[p.length - 1]?.timestamp || nowMs)) / 6e4)),
            });
    }
    return {
        employee: {
            id: t.id,
            name: t.name,
            position: t.position,
            location: t.locationId,
            gender: t.gender || "Female",
            age: t.age,
            physicalDescription: getPhysicalDescriptionForPrompt(t),
            personality: t.personalityTraits || t.personality,
            hobbies: t.hobbies || [],
            stats: t.stats,
        },
        workplace: {
            totalEmployees: gameState.companyContext.totalEmployees,
            locationCoworkers: a.length,
            sameLocationNames: a.map((e) => e.name),
            otherLocationEmployees: o.length,
            locations: Object.keys(gameState.companyContext.locationEmployeeCounts),
        },
        relationships: i,
        coworkers: s,
        knownLocations: l,
        recentEvents: r,
        chatContext: m,
        socialProfile: t.social,
    };
}
function getRandomCoworkerByRelation(e, t = null) {
    const n = gameState.employees.find((t) => t.id === e);
    if (!n) return null;
    initializeEmployeeSocialData(n);
    const a = Object.entries(n.relationships || {})
        .filter(([e, n]) => {
            if (t && n.type !== t) return !1;
            return !!gameState.employees.find((t) => t.id === e && "active" === t.employmentStatus);
        })
        .map(([e]) => gameState.employees.find((t) => t.id === e));
    return 0 === a.length ? null : a[Math.floor(Math.random() * a.length)];
}
function getLocationCoworkers(e) {
    const t = gameState.employees.find((t) => t.id === e);
    return t
        ? gameState.employees.filter(
              (n) => "active" === n.employmentStatus && n.id !== e && n.locationId === t.locationId
          )
        : [];
}
function getKnownLocations(e) {
    const t = gameState.employees.find((t) => t.id === e);
    return t
        ? (initializeEmployeeSocialData(t),
          gameState.locations
              .filter((e) => t.awareness.knowsLocations.includes(e.id))
              .map((e) => ({
                  id: e.id,
                  name: e.name,
                  employeeCount: gameState.companyContext.locationEmployeeCounts[e.id] || 0,
              })))
        : [];
}
function knowsEmployee(e, t) {
    const n = gameState.employees.find((t) => t.id === e);
    return !!n && (initializeEmployeeSocialData(n), n.awareness.knowsCoworkers.includes(t));
}
function initializeGossipSystem(e) {
    return (
        e.gossip ||
            (e.gossip = {
                knownGossip: [],
                lastGossipTime: 0,
                gossipTendency: 30 + 50 * Math.random(),
                trustworthiness: 20 + 60 * Math.random(),
            }),
        e.recentSimulatedEvents || (e.recentSimulatedEvents = []),
        e
    );
}
function createGossipItem({
    id: e = `gossip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: t,
    subjectId: n,
    targetId: a = null,
    content: o,
    truthLevel: i = 100,
    juiciness: s = 50,
    spreadCount: r = 0,
    originatorId: l,
    timestamp: c = Date.now(),
    expiresAt: d = Date.now() + 6048e5,
    tags: p = [],
} = {}) {
    return {
        id: e,
        type: t,
        subjectId: n,
        targetId: a,
        content: o,
        truthLevel: i,
        juiciness: s,
        spreadCount: r,
        originatorId: l,
        timestamp: c,
        expiresAt: d,
        tags: p,
    };
}
function addToCompanyWideContext(e) {
    gameState.companyWideContext ||
        (gameState.companyWideContext = {
            currentBuzz: [],
            lastUpdate: Date.now(),
            maxItems: 40,
            decayTime: 6048e5,
        });
    const t = gameState.companyWideContext,
        n = Date.now(),
        a = {
            id: `context_${n}_${Math.random().toString(36).substr(2, 9)}`,
            content: e.content,
            type: e.type,
            subjectIds: e.subjectIds || [],
            juiciness: e.juiciness || 50,
            timestamp: n,
            source: e.source || "unknown",
        };
    console.log(`[CompanyContext] 📢 Adding to public knowledge: "${e.content}"`), t.currentBuzz.unshift(a);
    const o = n - t.decayTime;
    return (
        (t.currentBuzz = t.currentBuzz.filter((e) => e.timestamp > o)),
        t.currentBuzz.length > t.maxItems &&
            (t.currentBuzz.sort((e, t) => {
                const a = (n - e.timestamp) / 864e5,
                    o = (n - t.timestamp) / 864e5,
                    i = e.juiciness * (1 / (1 + 0.5 * a));
                return t.juiciness * (1 / (1 + 0.5 * o)) - i;
            }),
            (t.currentBuzz = t.currentBuzz.slice(0, t.maxItems))),
        (t.lastUpdate = n),
        console.log(`[CompanyContext] Current buzz has ${t.currentBuzz.length} items`),
        a
    );
}
function getCompanyWideContextString() {
    if (!gameState.companyWideContext || 0 === gameState.companyWideContext.currentBuzz.length)
        return "The office is relatively quiet right now - no major drama or gossip.";
    return `CURRENT OFFICE BUZZ (Public Knowledge):\n${gameState.companyWideContext.currentBuzz
            .slice(0, 10)
            .map((e, t) => `${t + 1}. ${e.content}`)
            .join("\n")}`;
}
function analyzePostForPublicKnowledge(e) {
    const t = (e.content || "").toLowerCase(),
        n = e.referencedEmployees || [],
        a = e.explicitLevel >= 2;
    let o = 30,
        i = null,
        s = "post";
    if (
        [
            "dating",
            "together",
            "couple",
            "boyfriend",
            "girlfriend",
            "relationship",
            "hooked up",
            "kissed",
            "makeout",
            "sleeping with",
        ].some((e) => t.includes(e)) &&
        n.length >= 1
    ) {
        o = 85;
        const t = n.map((e) => {
            const t = gameState.employees.find((t) => t.id === e);
            return t ? t.name : "someone";
        });
        (i = e.isPlayerPost
            ? `Boss revealed something about ${t.join(" and ")} on social media`
            : `${e.authorName} posted about ${t.join(" and ")} - relationship drama!`),
            (s = "hookup");
    }
    if (a && n.length >= 1) {
        o = Math.max(o, 75);
        const t = n.map((e) => {
            const t = gameState.employees.find((t) => t.id === e);
            return t ? t.name : "someone";
        });
        i ||
            ((i = e.isPlayerPost
                ? `Boss posted explicit content featuring ${t.join(" and ")}`
                : `${e.authorName} shared explicit content about ${t.join(" and ")}`),
            (s = "scandal"));
    }
    if (
        ["drama", "fight", "angry", "hate", "betrayed", "liar", "cheat", "exposed", "caught"].some((e) =>
            t.includes(e)
        ) &&
        n.length >= 1
    ) {
        o = Math.max(o, 70);
        const t = n.map((e) => {
            const t = gameState.employees.find((t) => t.id === e);
            return t ? t.name : "someone";
        });
        i || ((i = `${e.authorName} called out ${t.join(" and ")} - office drama!`), (s = "fight"));
    }
    e.likes && e.likes.length > 5 && (o += 15),
        e.comments && e.comments.length > 3 && (o += 20),
        i &&
            o >= 60 &&
            (addToCompanyWideContext({
                content: i,
                type: s,
                subjectIds: [e.authorId || "player", ...n],
                juiciness: o,
                source: "social_post",
            }),
            console.log(`[CompanyContext] Extracted public knowledge from post (juiciness: ${o})`),
            feedContextToGossipEngine({
                content: i,
                type: s,
                subjectIds: [e.authorId || "player", ...n],
                juiciness: o,
            }));
}
function feedContextToGossipEngine(e) {
    gameState.activeGossip || (gameState.activeGossip = []);
    const t = gameState.employees.filter((e) => "active" === e.employmentStatus),
        n = [];
    for (const a of e.subjectIds) "player" !== a && t.find((e) => e.id === a) && n.push(a);
    const a = Math.min(0.8, (e.juiciness / 100) * 0.6);
    for (const o of t)
        if (!n.includes(o.id) && Math.random() < a) {
            n.push(o.id), o.gossip || initializeGossipSystem(o);
            const t = createGossipItem({
                type: e.type,
                subjectId: e.subjectIds[0] || "player",
                targetId: e.subjectIds[1] || null,
                content: e.content,
                truthLevel: 100,
                juiciness: e.juiciness,
                spreadCount: n.length,
                originatorId: "public",
            });
            o.gossip.knownGossip.find((e) => e.content === t.content) ||
                (o.gossip.knownGossip.push(t),
                o.gossip.knownGossip.length > 20 &&
                    (o.gossip.knownGossip.sort((e, t) => t.timestamp - e.timestamp),
                    (o.gossip.knownGossip = o.gossip.knownGossip.slice(0, 20))));
        }
    gameState.activeGossip.push({
        id: `gossip_${Date.now()}_${Math.random()}`,
        subjectId: e.subjectIds[0] || "player",
        targetId: e.subjectIds[1] || null,
        content: e.content,
        juiciness: e.juiciness,
        timestamp: gameState.time?.currentTime || Date.now(),
        accuracy: 100,
        knownBy: n,
    }),
        gameState.activeGossip.length > 50 && (gameState.activeGossip = gameState.activeGossip.slice(-50)),
        console.log(`[GossipEngine] Fed context to ${n.length} NPCs: "${e.content}"`);
}
function createSimulatedEvent({
    id: e = `simevent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: t,
    participants: n,
    location: a,
    description: o,
    outcome: i,
    relationshipImpacts: s = [],
    generatesGossip: r = !0,
    timestamp: l = Date.now(),
    witnessed: c = [],
} = {}) {
    return {
        id: e,
        type: t,
        participants: n,
        location: a,
        description: o,
        outcome: i,
        relationshipImpacts: s,
        generatesGossip: r,
        timestamp: l,
        witnessed: c,
    };
}
function simulateOfficeEvents() {
    const e = gameState.employees.filter((e) => "active" === e.employmentStatus);
    if (e.length < 2) return;
    if (Math.random() > 0.15) return;
    const t = Math.random() < 0.7 ? 2 : 3,
        n = [];
    for (; n.length < t && n.length < e.length; ) {
        const t = e[Math.floor(Math.random() * e.length)];
        n.find((e) => e.id === t.id) || n.push(t);
    }
    if (n.length < 2) return;
    const a = n[0],
        o = n[1],
        i = a.relationships?.[o.id],
        s = i?.type || "neutral";
    let r,
        l,
        c,
        d = [];
    if ("romantic" === s && Math.random() < 0.3) {
        r = "date";
        const e = ["coffee shop", "nice restaurant", "the park", "downtown"],
            t = e[Math.floor(Math.random() * e.length)];
        (l = `${a.name} and ${o.name} went on a date to ${t}`),
            (c = Math.random() < 0.8 ? "positive" : "neutral"),
            (d = [
                {
                    employeeId1: a.id,
                    employeeId2: o.id,
                    change: Math.random() < 0.8 ? 5 + Math.floor(10 * Math.random()) : -5,
                },
            ]);
    } else if ("crush" === s && Math.random() < 0.4) {
        r = "hookup";
        const e = ["supply closet", "empty office", "their apartment", "parking garage"],
            t = e[Math.floor(Math.random() * e.length)];
        (l = `${a.name} and ${o.name} hooked up in ${t}`),
            (c = "dramatic"),
            (d = [{ employeeId1: a.id, employeeId2: o.id, change: 15 + Math.floor(20 * Math.random()) }]),
            i &&
                ((i.type = Math.random() < 0.6 ? "romantic" : "friends_with_benefits"),
                (i.strength = Math.min(100, i.strength + 20)));
    } else if (("rival" === s || "enemy" === s) && Math.random() < 0.5) {
        r = "argument";
        const e = ["work project", "personal issue", "office gossip", "petty disagreement"],
            t = e[Math.floor(Math.random() * e.length)];
        (l = `${a.name} and ${o.name} had a heated argument about ${t}`),
            (c = "negative"),
            (d = [{ employeeId1: a.id, employeeId2: o.id, change: -10 - Math.floor(15 * Math.random()) }]);
    } else {
        const e = [
                { type: "lunch", desc: "had lunch together at", outcome: "positive", impact: 3 },
                { type: "drinks", desc: "grabbed drinks after work at", outcome: "positive", impact: 5 },
                { type: "project", desc: "worked together on a project", outcome: "neutral", impact: 2 },
                {
                    type: "gossip_session",
                    desc: "had a long gossip session about the office",
                    outcome: "neutral",
                    impact: 4,
                },
                { type: "coffee", desc: "got coffee together", outcome: "positive", impact: 2 },
            ],
            t = e[Math.floor(Math.random() * e.length)];
        if (((r = t.type), (c = t.outcome), "gossip_session" === t.type)) l = `${a.name} and ${o.name} ${t.desc}`;
        else {
            const e = ["the local café", "Murphy's Bar", "that new place downtown"];
            l = `${a.name} and ${o.name} ${t.desc} ${"project" === t.type ? "" : e[Math.floor(Math.random() * e.length)]}`;
        }
        d = [{ employeeId1: a.id, employeeId2: o.id, change: t.impact + Math.floor(3 * Math.random()) }];
    }
    const p = a.locationId || "headquarters",
        m = e.filter((e) => e.locationId === p && !n.find((t) => t.id === e.id)),
        u = Math.floor(Math.random() * Math.min(4, m.length + 1)),
        g = [];
    for (let e = 0; e < u; e++) {
        const e = m[Math.floor(Math.random() * m.length)];
        e && !g.includes(e.id) && g.push(e.id);
    }
    const h = createSimulatedEvent({
        type: r,
        participants: n.map((e) => e.id),
        location: p,
        description: l,
        outcome: c,
        relationshipImpacts: d,
        witnessed: g,
    });
    if (
        (d.forEach((e) => {
            updateRelationship(e.employeeId1, e.employeeId2, { event: r, impact: e.change });
        }),
        n.forEach((e) => {
            initializeGossipSystem(e),
                e.recentSimulatedEvents.push(h),
                e.recentSimulatedEvents.length > 10 &&
                    (e.recentSimulatedEvents = e.recentSimulatedEvents.slice(-10));
        }),
        h.generatesGossip && ("hookup" === r || "argument" === r || "date" === r))
    ) {
        const t = "hookup" === r ? 80 : "argument" === r ? 60 : 50,
            n = l,
            i = createGossipItem({
                type: r,
                subjectId: a.id,
                targetId: o.id,
                content: n,
                juiciness: t,
                originatorId: g.length > 0 ? g[0] : a.id,
                tags: [c, "simulated"],
            });
        g.forEach((t) => {
            const n = e.find((e) => e.id === t);
            n &&
                (initializeGossipSystem(n),
                n.gossip.knownGossip.push({
                    gossipId: i.id,
                    learnedAt: Date.now(),
                    source: "witnessed",
                    accuracy: 100,
                }));
        }),
            gameState.socialNetwork.activeGossip || (gameState.socialNetwork.activeGossip = []),
            gameState.socialNetwork.activeGossip.push(i),
            setTimeout(() => spreadGossip(i.id), 5e3 + 1e4 * Math.random());
    }
    console.log(`[GossipEngine] Simulated event: ${l}`);
}
function spreadGossip(e) {
    const t = gameState.socialNetwork.activeGossip?.find((t) => t.id === e);
    if (!t) return;
    const n = gameState.employees.filter((e) => "active" === e.employmentStatus),
        a = n.filter((t) => (initializeGossipSystem(t), t.gossip.knownGossip.some((t) => t.gossipId === e)));
    0 !== a.length &&
        a.forEach((a) => {
            if ((initializeGossipSystem(a), 100 * Math.random() > a.gossip.gossipTendency)) return;
            const o = n.filter((t) => {
                if (t.id === a.id) return !1;
                if ((initializeGossipSystem(t), t.gossip.knownGossip.some((t) => t.gossipId === e))) return !1;
                const n = a.relationships?.[t.id];
                return a.locationId === t.locationId || (n && ["friend", "best_friend"].includes(n.type));
            });
            if (0 === o.length) return;
            const i = o[Math.floor(Math.random() * o.length)],
                s = a.gossip.knownGossip.find((t) => t.gossipId === e)?.accuracy || 100,
                r = a.gossip.trustworthiness / 100,
                l = Math.max(0, Math.floor(s * r * (0.85 + 0.15 * Math.random())));
            i.gossip.knownGossip.push({ gossipId: t.id, learnedAt: Date.now(), source: a.id, accuracy: l }),
                t.spreadCount++,
                console.log(`[GossipEngine] ${a.name} told ${i.name} about: ${t.content} (accuracy: ${l}%)`);
        });
}
function getKnownGossip(e, t = 5) {
    const n = gameState.employees.find((t) => t.id === e);
    if (!n) return [];
    initializeGossipSystem(n);
    const a = Date.now(),
        o = gameState.socialNetwork.activeGossip || [];
    return n.gossip.knownGossip
        .map((e) => {
            const t = o.find((t) => t.id === e.gossipId);
            return !t || t.expiresAt < a
                ? null
                : { ...t, learnedAt: e.learnedAt, accuracy: e.accuracy, source: e.source };
        })
        .filter(Boolean)
        .sort((e, t) => t.juiciness - e.juiciness)
        .slice(0, t);
}
function createPlayerGossip({ type: e, npcId: t, description: n, juiciness: a = 50 }) {
    const o = gameState.employees.find((e) => e.id === t);
    if (!o) return;
    initializeGossipSystem(o);
    const i = createGossipItem({
        type: e,
        subjectId: "player",
        targetId: t,
        content: n,
        juiciness: a,
        originatorId: t,
        tags: ["player_action"],
    });
    o.gossip.knownGossip.push({
        gossipId: i.id,
        learnedAt: Date.now(),
        source: "personal_experience",
        accuracy: 100,
    }),
        gameState.socialNetwork.activeGossip || (gameState.socialNetwork.activeGossip = []),
        gameState.socialNetwork.activeGossip.push(i),
        (o.gossip.gossipTendency > 40 || a > 70) && setTimeout(() => spreadGossip(i.id), 3e3 + 7e3 * Math.random()),
        console.log(`[GossipEngine] Created player gossip: ${n}`);
}
function getGossipContext(e, t = !0) {
    const n = getKnownGossip(e, 3);
    if (0 === n.length) return "";
    let a = "\n\nRECENT GOSSIP YOU KNOW ABOUT:\n";
    return (
        n.forEach((e) => {
            if (!t && "player" === e.subjectId) return;
            "player" === e.subjectId || gameState.employees.find((t) => t.id === e.subjectId),
                e.targetId && ("player" === e.targetId || gameState.employees.find((t) => t.id === e.targetId));
            const n =
                e.accuracy < 50
                    ? " (but this might be a rumor)"
                    : e.accuracy < 80
                      ? " (heard through the grapevine)"
                      : "";
            a += `- ${e.content}${n}\n`;
        }),
        (a += "\nYou can reference this gossip naturally in conversation if relevant!\n"),
        a
    );
}
function cleanupExpiredGossip() {
    if (!gameState.socialNetwork.activeGossip) return;
    const e = Date.now(),
        t = gameState.socialNetwork.activeGossip.length;
    gameState.socialNetwork.activeGossip = gameState.socialNetwork.activeGossip.filter((t) => t.expiresAt > e);
    const n = t - gameState.socialNetwork.activeGossip.length;
    n > 0 && console.log(`[GossipEngine] Cleaned up ${n} expired gossip items`);
}
function tokenize(e) {
    return (e || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}
function extractTopics(e, t) {
    const n = [],
        a = e.toLowerCase();
    return (
        t.productManaged && a.includes(t.productManaged.toLowerCase()) && n.push("job_specific"),
        t.position && a.includes(t.position.toLowerCase()) && n.push("job_title"),
        /\b(work|job|task|project|deadline)\b/.test(a) && n.push("work_general"),
        (t.hobbies || []).forEach((e) => {
            a.includes(e.toLowerCase()) && n.push(`hobby_${e}`);
        }),
        /\b(date|dinner|coffee|drinks|hang out)\b/.test(a) && n.push("social_invite"),
        /\b(flirt|cute|hot|sexy|attractive)\b/.test(a) && n.push("flirting"),
        /\b(kiss|touch|intimate|physical)\b/.test(a) && n.push("physical"),
        /\b(love|feel|emotion|heart)\b/.test(a) && n.push("emotional"),
        n
    );
}
function ensureEmployeeMemory(e) {
    if (e) {
        if (!e.memory || Array.isArray(e.memory)) {
            const t = Array.isArray(e.memory) ? e.memory : [];
            e.memory = {
                items: [],
                cap: 300,
                styleCounters: {
                    total: 0,
                    sincePersonal: 99,
                    recentTopics: [],
                    jobMentions: 0,
                    hobbyMentions: 0,
                    lastJobMention: 0,
                    lastHobbyMention: 0,
                },
                conversationPhase: "early",
                intimacyLevel: 0,
                eventMemories: [],
            };
            for (const n of t) remember(e, n, "note", 0.5);
        } else
            e.memory.styleCounters ||
                (e.memory.styleCounters = {
                    total: 0,
                    sincePersonal: 99,
                    recentTopics: [],
                    jobMentions: 0,
                    hobbyMentions: 0,
                    lastJobMention: 0,
                    lastHobbyMention: 0,
                });
        e.memory.eventMemories || (e.memory.eventMemories = []),
            e.memory.cap && e.memory.cap < 300 && (e.memory.cap = 300),
            e.memory.conversationPhase || (e.memory.conversationPhase = "early"),
            void 0 === e.memory.intimacyLevel && (e.memory.intimacyLevel = 0),
            ensureEmployeePersonality(e),
            ensureEmployeeStats(e),
            ensureEmployeeStateSurface(e);
    }
}
function ensureEmployeePersonality(e) {
    if (e) {
        if ("string" == typeof e.personality) {
            const t = e.personality;
            (e.personalityTraits = [t]), (e.personality = {});
        }
        (e.personality && "object" == typeof e.personality) || (e.personality = {}),
            void 0 === e.personality.confidence && (e.personality.confidence = 30 + Math.floor(50 * Math.random())),
            void 0 === e.personality.outgoing && (e.personality.outgoing = 20 + Math.floor(60 * Math.random())),
            void 0 === e.personality.flirty && (e.personality.flirty = 10 + Math.floor(70 * Math.random())),
            void 0 === e.personality.professional &&
                (e.personality.professional = 30 + Math.floor(50 * Math.random())),
            void 0 === e.personality.humor && (e.personality.humor = 20 + Math.floor(60 * Math.random()));
    }
}
