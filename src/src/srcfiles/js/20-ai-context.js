// ============================================================================
// 20-ai-context — AI context: player profile/company helpers, context-usage tracking, NuclearEmbeddingService, token estimation, selectIntelligentContext context builder.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function getPlayerPhysicalDescription() {
    const e = gameState.playerProfile;
    if (!e) return "";
    const t = [];
    return (
        e.age && t.push(`${e.age}-year-old`),
        e.gender && t.push(e.gender),
        e.ethnicity && t.push(e.ethnicity),
        e.skinTone && t.push(`${e.skinTone} skin`),
        e.height && t.push(e.height),
        e.bodyType && t.push(e.bodyType),
        e.hairColor && e.hairStyle
            ? t.push(`${e.hairStyle} ${e.hairColor} hair`)
            : e.hairColor
              ? t.push(`${e.hairColor} hair`)
              : e.hairStyle && t.push(`${e.hairStyle} hair`),
        e.eyeColor && t.push(`${e.eyeColor} eyes`),
        e.facialHair &&
            "none" !== e.facialHair.toLowerCase() &&
            "clean shaven" !== e.facialHair.toLowerCase() &&
            t.push(e.facialHair),
        e.buildDetails && t.push(e.buildDetails),
        e.chestSize && t.push(e.chestSize),
        e.genitalType && e.genitalDetails
            ? t.push(`${e.genitalDetails} ${e.genitalType}`)
            : e.genitalType && t.push(e.genitalType),
        e.additionalDetails && t.push(e.additionalDetails),
        t.join(", ")
    );
}
function getCompanyName() {
    return gameState.playerProfile?.companyName || "the company";
}
function formatPersonality(e) {
    if (!e) return "";
    if ("string" == typeof e) return e;
    if ("object" == typeof e) {
        const t = [];
        return (
            e.confidence > 60 && t.push("confident"),
            e.outgoing > 60 && t.push("outgoing"),
            e.flirty > 40 && t.push("flirty"),
            e.professional > 60 && t.push("professional"),
            e.humor > 60 && t.push("humorous"),
            t.length > 0
                ? t.join(", ")
                : Object.entries(e)
                      .map(([e, t]) => `${e}: ${t}`)
                      .join(", ")
        );
    }
    return String(e);
}
function buildContextRegistry(e) {
    if (!e) return [];
    const t = [],
        n = Date.now();
    if (
        (e.name &&
            t.push({
                id: "core.name",
                category: "core_identity",
                text: `Name: ${e.name}`,
                priority: 1,
                alwaysInclude: !0,
            }),
        e.career?.title &&
            t.push({
                id: "core.role",
                category: "core_identity",
                text: `Role: ${e.career.title} (Level ${e.career.level || 1})`,
                priority: 1,
                alwaysInclude: !0,
            }),
        e.employmentStatus && "active" !== e.employmentStatus)
    ) {
        const n = {
            prestige_reset:
                "I no longer work at this company - I was let go when the company restructured (prestige reset). I remember my time there and my relationship with my former boss. I am currently unemployed/between jobs unless rehired.",
            alumni: "I no longer work at this company - I was fired/let go. I remember my time there. I am currently unemployed unless rehired.",
            terminated: "I was terminated from this company. I remember my time there and how it ended.",
            resigned: "I resigned from this company on my own terms. I remember my time there.",
        };
        t.push({
            id: "core.employmentStatus",
            category: "core_identity",
            text:
                n[e.employmentStatus] ||
                `Employment status: ${e.employmentStatus} - I no longer work at this company.`,
            priority: 1,
            alwaysInclude: !0,
        });
    }
    e.gender &&
        t.push({
            id: "core.gender",
            category: "core_identity",
            text: `Gender: ${e.gender}`,
            priority: 0.9,
            alwaysInclude: !0,
        }),
        e.nicknameForPlayer &&
            t.push({
                id: "core.bossNickname",
                category: "core_identity",
                text: `I call my boss "${e.nicknameForPlayer}" instead of "Boss" - this is my special name for them. Use it OCCASIONALLY (1 in 4-5 times) to be natural and affectionate.`,
                priority: 0.95,
                alwaysInclude: !0,
                keywords: ["boss", "player", "nickname", e.nicknameForPlayer.toLowerCase()],
            }),
        e.personality?.traits &&
            e.personality.traits.forEach((e, n) => {
                t.push({
                    id: `personality.trait.${n}`,
                    category: "personality",
                    text: `Personality: ${e}`,
                    priority: 0.8 - 0.05 * n,
                    keywords: e.toLowerCase().split(/\s+/),
                });
            }),
        e.stats?.mood &&
            t.push({
                id: "state.mood",
                category: "current_state",
                text: `Current mood: ${e.stats.mood}`,
                priority: 0.85,
                freshness: !0,
                lastUpdated: n,
            }),
        e.personalLife?.currentActivity?.description &&
            t.push({
                id: "state.activity",
                category: "current_state",
                text: `Currently: ${e.personalLife.currentActivity.description}`,
                priority: 0.9,
                freshness: !0,
                lastUpdated: e.personalLife.currentActivity.startTime || n,
            }),
        void 0 !== e.schedule?.isCurrentlyWorking &&
            t.push({
                id: "state.working",
                category: "current_state",
                text: "Work status: " + (e.schedule.isCurrentlyWorking ? "Currently working" : "Off duty"),
                priority: 0.7,
                freshness: !0,
            }),
        e.physical &&
            (e.physical.shortDescription &&
                t.push({
                    id: "physical.short",
                    category: "appearance",
                    text: `Appearance: ${e.physical.shortDescription}`,
                    priority: 0.05,
                    avoidRepetition: !0,
                }),
            e.physical.fashion &&
                t.push({
                    id: "physical.fashion",
                    category: "appearance",
                    text: `Style: ${e.physical.fashion}`,
                    priority: 0.02,
                    avoidRepetition: !0,
                })),
        e.relationships &&
            Object.entries(e.relationships)
                .filter(([e, t]) => t.type && t.strength > 30)
                .sort(([e, t], [n, a]) => (a.strength || 0) - (t.strength || 0))
                .slice(0, 4)
                .forEach(([e, n]) => {
                    const a = gameState.employees.find((t) => t.id === e);
                    if (a) {
                        const o = n.strength || 0;
                        t.push({
                            id: `relationship.${e}`,
                            category: "relationships",
                            text: `Relationship with ${a.name}: ${n.type} (${o}/100)`,
                            relatedTo: e,
                            priority: 0.05 + o / 500,
                            keywords: [a.name.toLowerCase(), n.type],
                            avoidRepetition: !0,
                        });
                    }
                }),
        e.skills &&
            "object" == typeof e.skills &&
            Object.entries(e.skills).forEach(([e, n]) => {
                n &&
                    n.level &&
                    t.push({
                        id: `skill.${e}`,
                        category: "skills",
                        text: `Skill: ${e} (Level ${n.level})`,
                        priority: 0.4,
                        keywords: [e.toLowerCase()],
                    });
            });
    const a = getActiveFlags(e);
    a &&
        a.length > 0 &&
        a.forEach((e, n) => {
            const a = e.icon || "🚩",
                o = e.playerDescription || e.aiDescription || e.key || "Unknown flag",
                i = "high" === e.priority || "pregnant" === e.key || "lactating" === e.key;
            t.push({
                id: `flag.${e.key || n}`,
                category: "flags",
                text: `${a} ${o}`,
                priority: i ? 0.95 : 0.65,
                freshness: !0,
                keywords: o.toLowerCase().split(/\s+/),
            });
        });
    const o = getEmployeeChildren(e.id);
    if (
        (o &&
            o.length > 0 &&
            o.forEach((e, n) => {
                const a = void 0 !== e.age ? ` (${e.age} days old)` : "",
                    o = "player" === e.fatherID ? "with you" : "from previous relationship";
                t.push({
                    id: `child.${e.id || n}`,
                    category: "children",
                    text: `Has a ${e.gender} named ${e.name}${a} ${o}`,
                    priority: 0.9,
                    freshness: !0,
                    relatedTo: "player",
                    keywords: ["child", "baby", e.name.toLowerCase(), e.gender],
                });
            }),
        e.stats &&
            (void 0 !== e.stats.affection &&
                t.push({
                    id: "stats.affection",
                    category: "stats",
                    text: `Affection for you: ${e.stats.affection}/100`,
                    priority: 0.6,
                    relatedTo: "player",
                }),
            void 0 !== e.stats.productivity &&
                t.push({
                    id: "stats.productivity",
                    category: "stats",
                    text: `Productivity: ${e.stats.productivity}%`,
                    priority: 0.5,
                })),
        e.personalLife?.livingSituation?.hasPet)
    ) {
        const n = e.personalLife.livingSituation;
        t.push({
            id: "personal.pet",
            category: "personal_life",
            text: `Has a ${n.petType} named ${n.petName}`,
            priority: 0.001,
            avoidRepetition: !0,
            excludeUnlessRelevant: !0,
            keywords: ["pet", "pets", "animal", "animals", "dog", "cat", "fish", "bird", n.petType, n.petName]
                .map((e) => e?.toLowerCase())
                .filter(Boolean),
        });
    }
    if (e.personalLife?.sexualOrientation) {
        const n = e.personalLife.sexualOrientation,
            a =
                {
                    straight: "attracted to the opposite gender",
                    bisexual: "attracted to both men and women",
                    gay: "attracted to men (homosexual)",
                    lesbian: "attracted to women (homosexual)",
                    pansexual: "attracted to people regardless of gender",
                    asexual: "experiences little to no sexual attraction",
                    demisexual: "only experiences sexual attraction after emotional connection",
                    queer: "identifies as queer",
                }[n] || n;
        t.push({
            id: "personal.orientation",
            category: "core_identity",
            text: `Sexual orientation: ${n} (${a}). This is a core part of who I am and influences my romantic interests.`,
            priority: 0.75,
            keywords: [
                "sexuality",
                "orientation",
                "gay",
                "lesbian",
                "bisexual",
                "straight",
                "dating",
                "relationship",
                "attracted",
                "attraction",
                "romantic",
                "love",
                "partner",
                "type",
                "preference",
            ],
        });
    }
    if (e.personalLife?.significantOther) {
        const n = e.personalLife.significantOther,
            a =
                "married" === n.relationshipType
                    ? `married to ${n.name}`
                    : "engaged" === n.relationshipType
                      ? `engaged to ${n.name}`
                      : "serious" === n.relationshipType
                        ? `in a serious relationship with ${n.name}`
                        : `dating ${n.name}`;
        t.push({
            id: "personal.significantOther",
            category: "personal_life",
            text: `Is ${a} (${n.gender}, ${n.occupation})${n.hasKids ? " - has kids together" : ""}. This relationship is part of my life outside work.`,
            priority: 0.7,
            keywords: [
                "boyfriend",
                "girlfriend",
                "husband",
                "wife",
                "partner",
                "married",
                "engaged",
                "dating",
                "relationship",
                "cheating",
                "affair",
                n.name.toLowerCase(),
            ],
        });
    } else if (e.personalLife?.outsideContacts) {
        const n = e.personalLife.outsideContacts.relationshipStatus;
        if ("single" === n)
            t.push({
                id: "personal.relationshipStatus",
                category: "personal_life",
                text: "Currently single and not in a romantic relationship. Unattached and potentially available for dating.",
                priority: 0.55,
                keywords: [
                    "single",
                    "available",
                    "dating",
                    "relationship",
                    "partner",
                    "boyfriend",
                    "girlfriend",
                    "married",
                ],
            });
        else if ("separated" === n) {
            const n = e.personalLife.significantOther;
            t.push({
                id: "personal.relationshipStatus",
                category: "personal_life",
                text: `Currently separated from ${n?.name ? n.name : "their partner"} — in a painful in-between state, not officially divorced but no longer living together as a couple.`,
                priority: 0.65,
                keywords: [
                    "separated",
                    "relationship",
                    "partner",
                    "divorce",
                    "apart",
                    "breakup",
                    "difficult",
                    "complicated",
                    n?.name?.toLowerCase(),
                ].filter(Boolean),
            });
        } else
            "divorced" === n &&
                t.push({
                    id: "personal.relationshipStatus",
                    category: "personal_life",
                    text: "Recently divorced — went through a significant life change and is navigating single life again after a marriage ended.",
                    priority: 0.6,
                    keywords: [
                        "divorced",
                        "ex",
                        "marriage",
                        "single",
                        "moving on",
                        "relationship",
                        "starting over",
                        "healing",
                    ],
                });
    }
    (e.personalLife?.outsideContacts?.infidelityTendency || 0) > 0.55 &&
        t.push({
            id: "personal.infidelityTendency",
            category: "personal_life",
            text: "Has a tendency toward straying — finds it difficult to fully commit emotionally or physically to one person, and may pursue connections outside a primary relationship.",
            priority: 0.6,
            keywords: [
                "cheating",
                "affair",
                "flirting",
                "relationship",
                "faithful",
                "loyalty",
                "commitment",
                "hookup",
                "temptation",
                "complicated",
            ],
        }),
        e.personalLife?.outsideContacts?.polyamorous &&
            t.push({
                id: "personal.polyamorous",
                category: "personal_life",
                text: "Practices polyamory — comfortable with multiple romantic or emotional connections simultaneously, not bound by monogamy norms. This is a deliberate lifestyle, not infidelity.",
                priority: 0.65,
                keywords: [
                    "polyamory",
                    "open relationship",
                    "multiple partners",
                    "jealousy",
                    "monogamy",
                    "relationship",
                    "dating",
                    "love",
                    "open",
                ],
            });
    const i = e.personalLife?.outsideContacts?.relationshipHistory || [];
    if (i.length > 0) {
        const e = i[i.length - 1],
            n =
                "divorce" === e.endReason
                    ? "went through a divorce"
                    : "breakup" === e.endReason || "called_it_off" === e.endReason
                      ? "recently went through a breakup"
                      : "recently ended a relationship";
        t.push({
            id: "personal.relationshipHistory",
            category: "personal_life",
            text: `${n}${e.partnerName ? ` with ${e.partnerName}` : ""}. This colors how they talk about relationships, love, and moving on.`,
            priority: 0.5,
            keywords: [
                "ex",
                "breakup",
                "divorce",
                "healing",
                "moving on",
                "relationship",
                "past",
                e.partnerName?.toLowerCase(),
            ].filter(Boolean),
        });
    }
    return t.filter((e) => e.text);
}
function initializeContextTracking(e) {
    e.contextUsage || (e.contextUsage = { pieces: {}, interactions: [], performance: {} });
}
function trackContextUsage(e, t, n, a) {
    initializeContextTracking(e),
        t.forEach((t) => {
            e.contextUsage.pieces[t.id] || (e.contextUsage.pieces[t.id] = { count: 0, lastUsed: 0, totalScore: 0 });
            const n = e.contextUsage.pieces[t.id];
            n.count++, (n.lastUsed = Date.now()), (n.totalScore += t.score || 0);
        }),
        e.contextUsage.interactions.push({
            id: n,
            timestamp: gameState.time?.currentTime || Date.now(),
            type: a,
            pieces: t.map((e) => e.id),
            pieceCount: t.length,
        }),
        e.contextUsage.interactions.length > 100 &&
            (e.contextUsage.interactions = e.contextUsage.interactions.slice(-100));
}
(style.textContent =
    "\n    @keyframes pulse-highlight {\n      0%, 100% { box-shadow: 0 0 0 0 rgba(199, 125, 255, 0); }\n      50% { box-shadow: 0 0 0 8px rgba(199, 125, 255, 0.4); }\n    }\n  "),
    document.head.appendChild(style),
    (window.showAllFlags = showAllFlags),
    (window.removeFlagAndRefresh = removeFlagAndRefresh),
    (window.openFlagManagementModal = openFlagManagementModal),
    (window.loadFlagTemplate = loadFlagTemplate),
    (window.startEditFlag = startEditFlag),
    (window.aiScanFlagsForEmployee = aiScanFlagsForEmployee);
const NuclearEmbeddingService = {
    getInteractionEmbedding(e) {
        return { keywords: this.extractKeywords(e), type: e.type, involves: e.involves || [] };
    },
    scoreSemanticRelevance(e, t) {
        let n = 0;
        if (e.keywords && t.keywords) {
            n += 0.2 * e.keywords.filter((e) => t.keywords.some((t) => t.includes(e) || e.includes(t))).length;
        }
        e.relatedTo && t.involves && t.involves.includes(e.relatedTo) && (n += 0.5);
        return (
            (n +=
                0.6 *
                ({
                    "chat.casual": {
                        personality: 1,
                        current_state: 0.9,
                        relationships: 0.7,
                        personal_life: 0.6,
                        appearance: 0.2,
                        skills: 0.3,
                        stats: 0.4,
                    },
                    "chat.work": {
                        skills: 1,
                        core_identity: 0.9,
                        current_state: 0.7,
                        stats: 0.8,
                        personality: 0.5,
                        relationships: 0.4,
                        appearance: 0.1,
                    },
                    "social.post": {
                        personality: 0.9,
                        current_state: 0.8,
                        relationships: 0.7,
                        personal_life: 0.6,
                        flags: 0.7,
                        appearance: 0.4,
                    },
                    "social.comment": {
                        relationships: 0.8,
                        personality: 0.7,
                        current_state: 0.6,
                        core_identity: 0.5,
                    },
                }[t.type]?.[e.category] || 0.5)),
            Math.min(n, 1)
        );
    },
    extractKeywords(e) {
        return [e.message, e.prompt, ...(e.recentMessages || []).map((e) => e.content)]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .split(/\W+/)
            .filter((e) => e.length > 3)
            .filter((e) => !this.stopWords.has(e))
            .slice(0, 30);
    },
    stopWords: new Set(["that", "this", "with", "from", "have", "been", "were", "your", "them", "they"]),
};
function selectIntelligentContext(e, t, n = {}) {
    const {
            maxTokens: a = 500,
            minPieces: o = 5,
            maxPieces: i = 20,
            diversityWeight: s = 0.3,
            antiRepetitionWeight: r = 0.4,
        } = n,
        l = buildContextRegistry(e);
    if (0 === l.length) return [];
    initializeContextTracking(e);
    const c = NuclearEmbeddingService.getInteractionEmbedding(t),
        d = (t.message || "").toLowerCase(),
        p = l
            .map((t) => {
                if (t.excludeUnlessRelevant) {
                    const e = t.keywords?.some((e) => d.includes(e));
                    if (!e) return null;
                }
                const n = { base: t.priority || 0.5, semantic: 0, temporal: 0, novelty: 0, coherence: 0 };
                if (
                    ((n.semantic = NuclearEmbeddingService.scoreSemanticRelevance(t, c)),
                    t.freshness && t.lastUpdated)
                ) {
                    const e = (Date.now() - t.lastUpdated) / 36e5;
                    n.temporal = Math.max(0, 1 - e / 24);
                } else n.temporal = 0.3;
                const a = e.contextUsage.pieces[t.id];
                if (a) {
                    const o = (Date.now() - a.lastUsed) / 36e5,
                        i = a.count / Math.max(1, e.contextUsage.interactions.length);
                    let s = Math.min(1, o / 48) * (1 - i);
                    t.avoidRepetition && ((s *= 0.3), o < 1 && (s = 0)), (n.novelty = s);
                } else n.novelty = 1;
                n.coherence = 0.5;
                const o = 0.25 * n.base + 0.35 * n.semantic + 0.15 * n.temporal + n.novelty * r + 0.1 * n.coherence;
                return { ...t, scores: n, score: t.alwaysInclude ? 999 : o };
            })
            .filter(Boolean);
    p.sort((e, t) => t.score - e.score);
    const m = [],
        u = {};
    let g = 0;
    p.filter((e) => e.alwaysInclude).forEach((e) => {
        m.push(e), (u[e.category] = (u[e.category] || 0) + 1), (g += estimateTokens(e.text));
    });
    for (const e of p) {
        if (e.alwaysInclude) continue;
        if (m.length >= i) break;
        if (g >= a && m.length >= o) break;
        const t = (u[e.category] || 0) / Math.max(1, m.length) < 0.3 ? s : 0,
            n = e.score + t;
        let r = 0;
        for (const t of m)
            if (
                (t.category === e.category && (r += 0.05),
                e.relatedTo && t.relatedTo === e.relatedTo && (r += 0.1),
                e.keywords && t.keywords)
            ) {
                r += 0.03 * e.keywords.filter((e) => t.keywords.includes(e)).length;
            }
        const l = n + r;
        (l > 0.3 || m.length < o) &&
            (m.push({ ...e, score: l }), (u[e.category] = (u[e.category] || 0) + 1), (g += estimateTokens(e.text)));
    }
    return m;
}
function estimateTokens(e) {
    return e ? Math.ceil(e.length / 4) : 0;
}
function formatContextForPrompt(e, t = {}) {
    const { grouped: n = !0, includeScores: a = !1, categoryLabels: o = !0 } = t;
    if (!n)
        return e
            .map((e) => {
                const t = a ? ` [score: ${e.score.toFixed(2)}]` : "";
                return `- ${e.text}${t}`;
            })
            .join("\n");
    const i = {};
    e.forEach((e) => {
        i[e.category] || (i[e.category] = []), i[e.category].push(e);
    });
    const s = [];
    return (
        [
            "core_identity",
            "personality",
            "current_state",
            "relationships",
            "skills",
            "stats",
            "flags",
            "personal_life",
            "appearance",
        ].forEach((e) => {
            if (i[e] && i[e].length > 0) {
                if (o) {
                    const t = e.replace(/_/g, " ").toUpperCase();
                    s.push(`\n${t}:`);
                }
                i[e].forEach((e) => {
                    const t = a ? ` [${e.score.toFixed(2)}]` : "";
                    s.push(`- ${e.text}${t}`);
                });
            }
        }),
        s.join("\n").trim()
    );
}
function getIntelligentContext(e, t, n = {}) {
    if (!e) return "";
    const a = selectIntelligentContext(
        e,
        { type: t, ...n },
        {
            "chat.casual": { maxTokens: 400, maxPieces: 15 },
            "chat.work": { maxTokens: 350, maxPieces: 12 },
            "social.post": { maxTokens: 300, maxPieces: 10 },
            "social.comment": { maxTokens: 250, maxPieces: 8 },
            "profile.description": { maxTokens: 500, maxPieces: 20 },
        }[t] || { maxTokens: 400, maxPieces: 15 }
    );
    return (
        trackContextUsage(e, a, `${t}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, t),
        formatContextForPrompt(a, { grouped: !0 })
    );
}
function getContextAnalytics(e) {
    if (!e.contextUsage) return null;
    const t = {
            totalInteractions: e.contextUsage.interactions.length,
            piecesUsed: Object.keys(e.contextUsage.pieces).length,
            mostUsedPieces: [],
            leastUsedPieces: [],
            categoryDistribution: {},
            averagePiecesPerInteraction: 0,
            recentInteractions: e.contextUsage.interactions.slice(-5),
        },
        n = buildContextRegistry(e);
    n.forEach((e) => {
        t.categoryDistribution[e.category] = (t.categoryDistribution[e.category] || 0) + 1;
    });
    const a = Object.entries(e.contextUsage.pieces)
        .map(([e, t]) => {
            const a = n.find((t) => t.id === e);
            return { id: e, usage: t, piece: a };
        })
        .sort((e, t) => t.usage.count - e.usage.count);
    (t.mostUsedPieces = a.slice(0, 5)), (t.leastUsedPieces = a.slice(-5).reverse());
    const o = e.contextUsage.interactions.reduce((e, t) => e + t.pieceCount, 0);
    return (t.averagePiecesPerInteraction = o / Math.max(1, e.contextUsage.interactions.length)), t;
}
function calculateGiftPriceScale() {
    const e = gameState.currentLifetimeIncome || 0,
        t = Math.log10(Math.max(1e3, e)) - 3;
    return {
        tier: Math.floor(t),
        minRecommended: Math.pow(10, 1 + 0.8 * t),
        maxRecommended: Math.pow(10, 4 + 0.8 * t),
        sweetSpot: Math.pow(10, 2.5 + 0.8 * t),
    };
}
function mapToValidCategory(e) {
    const t = e.toLowerCase();
    return t.includes("roman") || t.includes("love")
        ? "ROMANTIC"
        : t.includes("lux") || t.includes("expensive")
          ? "LUXURY"
          : t.includes("trip") || t.includes("travel") || t.includes("exper")
            ? "EXPERIENCES"
            : t.includes("tech") || t.includes("electron") || t.includes("gadget")
              ? "TECH"
              : t.includes("book") || t.includes("art") || t.includes("intel")
                ? "INTELLECTUAL"
                : t.includes("food") || t.includes("wine") || t.includes("drink")
                  ? "FOOD"
                  : t.includes("practical") || t.includes("useful") || t.includes("tool")
                    ? "PRACTICAL"
                    : t.includes("quirk") || t.includes("unusual")
                      ? "QUIRKY"
                      : t.includes("fit") || t.includes("health") || t.includes("wellness")
                        ? "WELLNESS"
                        : t.includes("fashion") || t.includes("cloth") || t.includes("beauty")
                          ? "FASHION"
                          : t.includes("unique") || t.includes("one") || t.includes("rare")
                            ? "UNIQUE"
                            : "QUIRKY";
}
