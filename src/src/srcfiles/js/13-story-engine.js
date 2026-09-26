// ============================================================================
// 13-story-engine — StoryEngine + StoryMinigames (multi-step events, minigame framework).
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

const StoryEngine = {
    calculateScaledCost(e, t = "medium") {
        if (!e || e <= 0) return 0;
        const n = ("function" == typeof calculateCashPerSecond && parseFloat(calculateCashPerSecond())) || 1,
            a = { trivial: 5, low: 30, medium: 120, high: 300, extreme: 600, catastrophic: 1800 };
        let o = "medium";
        o = e <= 1e3 ? "low" : e <= 1e4 ? "medium" : e <= 1e5 ? "high" : "extreme";
        let i = n * (a[o] || a.medium);
        const s = 0.01 * gameState.cash,
            r = 0.25 * gameState.cash;
        return (
            (i = Math.max(i, s, 100)),
            (i = Math.min(i, r)),
            (i =
                i >= 1e6
                    ? 1e5 * Math.round(i / 1e5)
                    : i >= 1e4
                      ? 1e3 * Math.round(i / 1e3)
                      : i >= 1e3
                        ? 100 * Math.round(i / 100)
                        : 10 * Math.round(i / 10)),
            i
        );
    },
    getChoiceCost(e) {
        return !e.cost || e.cost <= 0 ? 0 : this.calculateScaledCost(e.cost);
    },
    ACT_CONFIG: {
        1: {
            name: "GARAGE DREAMS",
            title: "ACT I: GARAGE DREAMS",
            description:
                "Every empire starts somewhere. Yours begins in a cramped garage with nothing but ambition and a dream.",
            tone: "hopeful, underdog, learning",
            themes: ["humble beginnings", "first victories", "building trust"],
            triggerConditions: { cash: 0, employees: 0, locations: [] },
            spineEvents: ["prologue", "first_hire", "first_crisis", "garage_boss"],
        },
        2: {
            name: "CORPORATE CLIMBER",
            title: "ACT II: CORPORATE CLIMBER",
            description:
                "Success breeds ambition. But ambition breeds enemies. Someone is watching your rise... and they don't like what they see.",
            tone: "ambitious, competitive, moral choices",
            themes: ["growing pains", "office politics", "first rival"],
            triggerConditions: { cash: 15e3, employees: 3, locations: ["home_office"] },
            spineEvents: ["expansion_decision", "the_whistleblower", "victoria_intro", "inner_circle"],
        },
        3: {
            name: "EMPIRE BUILDER",
            title: "ACT III: EMPIRE BUILDER",
            description:
                "You've built something real. But empires attract vultures, and the bigger you grow, the more you have to lose.",
            tone: "powerful, consequential, hubris",
            themes: ["power corrupts", "loyalty tested", "hard choices"],
            triggerConditions: { cash: 5e5, employees: 10, locations: ["office_suite"] },
            spineEvents: [
                "factory_incident",
                "the_consortium",
                "betrayal_arc",
                "point_of_no_return",
                "victoria_returns",
                "victoria_joins",
            ],
        },
        4: {
            name: "SHADOWS & SECRETS",
            title: "ACT IV: SHADOWS & SECRETS",
            description: "Behind every fortune lies a darker truth. How deep are you willing to go?",
            tone: "dark, mature, consequences",
            themes: ["hidden worlds", "moral gray", "transformation"],
            triggerConditions: { cash: 5e9, employees: 20, locations: ["creative_studio"], prestiges: 1 },
            spineEvents: ["hidden_world", "price_of_entry", "family_secrets", "judgment_day"],
        },
        5: {
            name: "THE RECKONING",
            title: "ACT V: THE RECKONING",
            description:
                "All paths lead here. What kind of legacy will you leave? What kind of person have you become?",
            tone: "climactic, cosmic, transcendent",
            themes: ["legacy", "ultimate power", "final choice"],
            triggerConditions: { cash: 5e11, employees: 35, locations: ["private_club"], prestiges: 2 },
            spineEvents: ["velvet_invitation", "ultimate_choice", "endings"],
        },
    },
    ALIGNMENTS: {
        0: {
            name: "Ruthless Tyrant",
            emoji: "👿",
            color: "var(--l-red-dark)",
            title: "The Iron Fist",
            description: "Your rule through fear is legendary. Employees tremble.",
            npcReaction: "terrified",
            unlockedChoices: ["intimidate", "threaten", "exploit"],
            perks: ["Fear Compliance: +20% productivity from scared employees", "No one dares quit"],
        },
        25: {
            name: "Pragmatic Shark",
            emoji: "🦈",
            color: "var(--l-red)",
            title: "The Calculator",
            description: "You do what needs to be done. Sentiment is for the weak.",
            npcReaction: "wary",
            unlockedChoices: ["manipulate", "leverage", "hardball"],
            perks: ["Cutthroat Deals: Better business outcomes", "Ruthless Efficiency"],
        },
        50: {
            name: "Balanced Leader",
            emoji: "⚖️",
            color: "var(--l-gold)",
            title: "The Diplomat",
            description: "You walk the line between profit and people.",
            npcReaction: "neutral",
            unlockedChoices: ["negotiate", "compromise", "defer"],
            perks: ["Flexible Approach: All options available", "Neutral Reputation"],
        },
        75: {
            name: "Ethical Pioneer",
            emoji: "🌟",
            color: "var(--l-green)",
            title: "The Mentor",
            description: "You lead with principle. People want to follow you.",
            npcReaction: "respectful",
            unlockedChoices: ["inspire", "support", "protect"],
            perks: ["Loyal Following: +15% trust baseline", "Talent Magnet"],
        },
        100: {
            name: "Benevolent Visionary",
            emoji: "👼",
            color: "var(--l-cyan)",
            title: "The Beloved",
            description: "Your employees would follow you anywhere. You are loved.",
            npcReaction: "devoted",
            unlockedChoices: ["unite", "sacrifice", "transform"],
            perks: ["Undying Loyalty: Employees never quit", "Inspirational Aura"],
        },
    },
    MANAGEMENT_ARCHETYPES: {
        benevolent_leader: {
            condition: (e) => e.moralScore >= 75 && e.charismaScore >= 60,
            title: "Beloved Leader",
            traits: ["Inspiring", "Trustworthy", "Nurturing"],
            color: "var(--l-green)",
        },
        ruthless_tyrant: {
            condition: (e) => e.moralScore <= 25 && e.ruthlessnessScore >= 60,
            title: "Feared Tyrant",
            traits: ["Intimidating", "Unforgiving", "Powerful"],
            color: "var(--l-red-dark)",
        },
        charismatic_manipulator: {
            condition: (e) => e.charismaScore >= 70 && e.moralScore < 50,
            title: "Silver Tongue",
            traits: ["Persuasive", "Charming", "Deceptive"],
            color: "var(--l-violet-2)",
        },
        pragmatic_executive: {
            condition: (e) => e.moralScore >= 35 && e.moralScore <= 65 && e.ruthlessnessScore < 40,
            title: "The Professional",
            traits: ["Practical", "Efficient", "Fair"],
            color: "var(--l-indigo)",
        },
        chaotic_wildcard: {
            condition: (e) => Math.abs(e.moralScore - 50) > 30 && e.charismaScore < 40,
            title: "Unpredictable Force",
            traits: ["Volatile", "Surprising", "Bold"],
            color: "var(--l-red-lt)",
        },
    },
    updateManagementStyle() {
        if (!gameState.story) return;
        const e = {
            moralScore: gameState.story.moralScore,
            charismaScore: gameState.story.charismaScore,
            ruthlessnessScore: gameState.story.ruthlessnessScore,
        };
        for (const [t, n] of Object.entries(this.MANAGEMENT_ARCHETYPES))
            if (n.condition(e))
                return void (gameState.story.managementStyle = {
                    archetype: t,
                    title: n.title,
                    traits: n.traits,
                    color: n.color,
                    unlockedChoices: this.getAlignmentInfo(e.moralScore).unlockedChoices || [],
                    npcReactionModifier: this.calculateNPCReactionModifier(e),
                });
        gameState.story.managementStyle = {
            archetype: "neutral",
            title: "Rising Manager",
            traits: ["Developing"],
            color: "var(--l-neutral-8)",
            unlockedChoices: [],
            npcReactionModifier: 0,
        };
    },
    calculateNPCReactionModifier(e) {
        let t = 0;
        return (
            e.moralScore >= 75 ? (t += 15) : e.moralScore <= 25 && (t -= 10),
            e.charismaScore >= 70 && (t += 10),
            e.ruthlessnessScore >= 60 && (t -= 5),
            t
        );
    },
    isChoiceUnlockedByAlignment(e) {
        const t = this.getAlignmentInfo(gameState.story.moralScore);
        return t.unlockedChoices?.includes(e) || !1;
    },
    ACTION_WEIGHTS: {
        hired_employee: { moral: 2, desc: "gave someone a chance" },
        fired_employee_fairly: { moral: -3, desc: "let someone go" },
        fired_employee_cruelly: { moral: -10, desc: "fired someone harshly" },
        rehired_former_employee: { moral: 5, desc: "gave someone a second chance" },
        gave_gift: { moral: 3, desc: "showed appreciation" },
        gave_expensive_gift: { moral: 5, desc: "gave a generous gift" },
        ignored_low_comfort: { moral: -2, desc: "ignored an uncomfortable employee" },
        ignored_low_trust: { moral: -1, desc: "let trust erode" },
        helped_struggling_employee: { moral: 4, desc: "supported someone in need" },
        promoted_employee: { moral: 2, desc: "recognized good work" },
        demoted_employee: { moral: -4, desc: "demoted someone" },
        raised_salary: { moral: 3, desc: "increased pay" },
        cut_salary: { moral: -5, desc: "cut someone's pay" },
        fair_promotion: { moral: 3, desc: "promoted based on merit" },
        unfair_promotion: { moral: -4, desc: "promoted a favorite unfairly" },
        romantic_advance_welcome: { moral: 0, desc: "pursued mutual attraction" },
        romantic_advance_unwelcome: { moral: -8, desc: "made unwanted advances" },
        respected_boundaries: { moral: 3, desc: "respected someone's boundaries" },
        intimate_encounter: { moral: 0, desc: "shared an intimate moment", nsfw: !0 },
        first_intimate_encounter: { moral: 0, desc: "crossed an intimate threshold", nsfw: !0 },
        seduced_employee: { moral: -2, desc: "seduced someone under your authority", nsfw: !0 },
        mutual_attraction_consummated: { moral: 1, desc: "acted on mutual desire", nsfw: !0 },
        coerced_intimacy: { moral: -10, desc: "pressured someone into intimacy", nsfw: !0 },
        office_romance_discovered: { moral: 0, desc: "had a relationship exposed", nsfw: !0 },
        passionate_affair: { moral: -1, desc: "began a passionate affair", nsfw: !0 },
        broke_heart: { moral: -4, desc: "ended an intimate relationship badly", nsfw: !0 },
        rewarded_loyalty_intimately: { moral: -1, desc: "mixed pleasure with business", nsfw: !0 },
        exploited_worker: { moral: -6, desc: "pushed someone too hard" },
        overworked_team: { moral: -3, desc: "demanded excessive hours" },
        work_life_balance: { moral: 4, desc: "respected work-life balance" },
        defeated_boss: { moral: 0, desc: "defeated a rival" },
        recruited_boss: { moral: 2, desc: "turned a rival into an ally" },
        showed_mercy: { moral: 5, desc: "showed mercy to a defeated foe" },
        showed_no_mercy: { moral: -5, desc: "crushed an enemy completely" },
        protected_whistleblower: { moral: 8, desc: "protected someone speaking truth" },
        silenced_whistleblower: { moral: -10, desc: "silenced dissent" },
        shared_profits: { moral: 6, desc: "shared success with the team" },
        hoarded_profits: { moral: -4, desc: "kept all the rewards" },
    },
    isAdultContentEnabled: () => "function" != typeof isSFWMode || !isSFWMode(),
    getContentVariant(e) {
        return e
            ? "string" == typeof e
                ? e
                : this.isAdultContentEnabled() && e.nsfw
                  ? e.nsfw
                  : e.sfw || e.nsfw || ""
            : "";
    },
    addSpice(e, t) {
        return t && this.isAdultContentEnabled() ? `${e}\n\n${t}` : e;
    },
    trackAction(e, t = {}) {
        if (!gameState.story?.settings?.storyEnabled) return;
        const n = this.ACTION_WEIGHTS[e];
        if (!n) return void console.warn(`[StoryEngine] Unknown action type: ${e}`);
        if (n.nsfw && !this.isAdultContentEnabled())
            return void console.log(`[StoryEngine] Skipping NSFW action in SFW mode: ${e}`);
        gameState.story.actionLog || (gameState.story.actionLog = []);
        const a = {
            type: e,
            timestamp: Date.now(),
            gameTime: gameState.time?.currentTime || Date.now(),
            context: t,
            moralImpact: n.moral,
            description: n.desc,
        };
        gameState.story.actionLog.unshift(a),
            gameState.story.actionLog.length > 100 &&
                (gameState.story.actionLog = gameState.story.actionLog.slice(0, 100));
        const prevMoral = gameState.story.moralScore;
        if (
            ((gameState.story.moralScore = Math.max(0, Math.min(100, gameState.story.moralScore + n.moral))),
            gameState.story.actionStats ||
                (gameState.story.actionStats = {
                    totalActions: 0,
                    positiveActions: 0,
                    negativeActions: 0,
                    employeesFired: 0,
                    employeesHired: 0,
                    giftsGiven: 0,
                    promotionsGiven: 0,
                    demotionsGiven: 0,
                }),
            gameState.story.actionStats.totalActions++,
            n.moral > 0 && gameState.story.actionStats.positiveActions++,
            n.moral < 0 && gameState.story.actionStats.negativeActions++,
            e.includes("fired") && gameState.story.actionStats.employeesFired++,
            e.includes("hired") && gameState.story.actionStats.employeesHired++,
            e.includes("gift") && gameState.story.actionStats.giftsGiven++,
            e.includes("promoted") && gameState.story.actionStats.promotionsGiven++,
            e.includes("demoted") && gameState.story.actionStats.demotionsGiven++,
            Math.abs(n.moral) >= 5)
        ) {
            const e = this.getAlignmentInfo(gameState.story.moralScore);
            console.log(
                `[StoryEngine] 📊 Significant action: ${n.desc} (${n.moral > 0 ? "+" : ""}${n.moral}) → Now: ${e.name}`
            );
        }
        this.checkActionConsequences(a), this.checkEmergentTriggers(a), this.checkPlayerArc(prevMoral, a);
    },
    // The player's own arc: narrate who the boss is becoming as their moral
    // alignment shifts, quoting the action that tipped them over.
    checkPlayerArc(prevMoral, action) {
        const s = gameState.story;
        if (!s) return;
        s.narrativeFlags || (s.narrativeFlags = {});
        const before = this.getAlignmentInfo(prevMoral),
            after = this.getAlignmentInfo(s.moralScore);
        if (before.name !== after.name) {
            const rising = s.moralScore > prevMoral,
                deed = action?.description ? `After you ${action.description}, the` : "The";
            this.addJournalEntry({
                title: `${after.emoji} You're becoming: ${after.name}`,
                content: `${deed} way people read you has shifted. ${rising ? "You're drifting toward the light" : "You're drifting somewhere darker"} — they see a ${after.name.toLowerCase()} now.`,
                type: "player",
                memorable: !0,
            });
        }
        if (action && action.moralImpact <= -5 && !s.narrativeFlags.firstDarkDeed)
            (s.narrativeFlags.firstDarkDeed = !0),
                this.addJournalEntry({
                    title: "🌑 A Line Crossed",
                    content: `The first time it felt easy: you ${action.description}. It won't be the last.`,
                    type: "player",
                    memorable: !0,
                });
        if (action && action.moralImpact >= 5 && !s.narrativeFlags.firstGoodDeed)
            (s.narrativeFlags.firstGoodDeed = !0),
                this.addJournalEntry({
                    title: "🌅 The Better Angel",
                    content: `You didn't have to, but you did: you ${action.description}. People noticed.`,
                    type: "player",
                    memorable: !0,
                });
    },
    checkActionConsequences(e) {
        const t = gameState.story.actionStats,
            n = e.context || {};
        if (e.type.includes("fired")) {
            gameState.story.actionLog.filter((e) => e.type.includes("fired") && Date.now() - e.timestamp < 3e5)
                .length >= 3 &&
                !gameState.story.narrativeFlags.firing_spree_detected &&
                ((gameState.story.narrativeFlags.firing_spree_detected = !0),
                this.addJournalEntry({
                    title: "😰 Whispers in the Office",
                    content:
                        "Three people gone in rapid succession. The remaining employees exchange nervous glances. No one feels safe anymore.",
                    type: "consequence",
                    memorable: !0,
                }));
        }
        if (
            (e.type.includes("gift") &&
                t.giftsGiven >= 10 &&
                !gameState.story.narrativeFlags.generous_boss &&
                ((gameState.story.narrativeFlags.generous_boss = !0),
                this.addJournalEntry({
                    title: "💝 A Reputation Forms",
                    content:
                        "Word spreads: you're the kind of boss who notices. Who appreciates. The little things add up to loyalty.",
                    type: "consequence",
                    memorable: !0,
                })),
            n.employeeId)
        ) {
            gameState.story.employeeTreatment || (gameState.story.employeeTreatment = {}),
                gameState.story.employeeTreatment[n.employeeId] ||
                    (gameState.story.employeeTreatment[n.employeeId] = {
                        positiveActions: 0,
                        negativeActions: 0,
                        history: [],
                    });
            const t = gameState.story.employeeTreatment[n.employeeId];
            e.moralImpact > 0 && t.positiveActions++,
                e.moralImpact < 0 && t.negativeActions++,
                t.history.push({ type: e.type, timestamp: e.timestamp, impact: e.moralImpact });
        }
    },
    checkEmergentTriggers(e) {
        const t = gameState.story.actionStats,
            n = gameState.story.moralScore,
            a = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus);
        if (n < 20 && t.negativeActions > 10 && !gameState.story.narrativeFlags.tyranny_warning)
            return (
                (gameState.story.narrativeFlags.tyranny_warning = !0),
                void this.triggerEmergentEvent("tyranny_brewing")
            );
        if (n > 80 && t.positiveActions > 15 && !gameState.story.narrativeFlags.beloved_leader)
            return (
                (gameState.story.narrativeFlags.beloved_leader = !0),
                void this.triggerEmergentEvent("beloved_leader")
            );
        if ("promoted_employee" === e.type) {
            const e = a.some((e) => (e.stats?.trust || 50) < 40 && e.career?.level < 3);
            if (t.promotionsGiven >= 3 && e && !gameState.story.narrativeFlags.promotion_jealousy_shown)
                return (
                    (gameState.story.narrativeFlags.promotion_jealousy_shown = !0),
                    void setTimeout(() => this.triggerEmergentEvent("promotion_jealousy"), 3e3)
                );
        }
        if (e.type.includes("gift") && e.context?.employeeName) {
            if (
                (gameState.story.actionLog || []).filter(
                    (t) => t.type.includes("gift") && t.context?.employeeName === e.context.employeeName
                ).length >= 5 &&
                !gameState.story.narrativeFlags.favoritism_accusation_shown
            )
                return (
                    (gameState.story.narrativeFlags.favoritism_accusation_shown = !0),
                    void setTimeout(() => this.triggerEmergentEvent("favoritism_accusation"), 5e3)
                );
        }
        if (a.length >= 3) {
            if (
                a.find((e) => (e.stats?.productivity || 0) >= 90) &&
                !gameState.story.narrativeFlags.rising_star_shown &&
                Math.random() < 0.2
            )
                return (
                    (gameState.story.narrativeFlags.rising_star_shown = !0),
                    void this.triggerEmergentEvent("rising_star")
                );
        }
        if (e.type.includes("fired") || e.type.includes("demoted")) {
            const t = e.context || {};
            t.employeeLevel >= 3 &&
                t.employeeTrust < 40 &&
                (gameState.story.pendingBetrayal = {
                    employeeId: t.employeeId,
                    employeeName: t.employeeName,
                    reason: e.type,
                    timestamp: Date.now(),
                });
        }
        if (this.isAdultContentEnabled()) {
            const e = gameState.story.eventTypeCooldowns?.lastNsfwEvent || 0,
                t = 18e4;
            if (!(Date.now() - e < t)) {
                const e = a.find(
                    (e) =>
                        (e.stats?.desire || 0) > 65 &&
                        (e.stats?.affection || 0) > 55 &&
                        !gameState.story.narrativeFlags[`tension_${e.id}`]
                );
                if (e && Math.random() < 0.15)
                    return (
                        (gameState.story.narrativeFlags[`tension_${e.id}`] = !0),
                        gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}),
                        (gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now()),
                        void setTimeout(() => this.triggerEmergentEvent("simmering_tension"), 2e3)
                    );
                if (
                    (gameState.story.actionLog || []).filter((e) => e.type.includes("intimate")).length >= 3 &&
                    !gameState.story.narrativeFlags.office_whispers_shown &&
                    Math.random() < 0.25
                )
                    return (
                        (gameState.story.narrativeFlags.office_whispers_shown = !0),
                        gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}),
                        (gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now()),
                        void setTimeout(() => this.triggerEmergentEvent("office_whispers"), 3e3)
                    );
                const t = a.find(
                    (e) =>
                        (e.memory?.intimacyLevel || 0) > 65 &&
                        (e.stats?.affection || 0) > 75 &&
                        !gameState.story.narrativeFlags[`feelings_${e.id}`]
                );
                if (t && Math.random() < 0.1)
                    return (
                        (gameState.story.narrativeFlags[`feelings_${t.id}`] = !0),
                        gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}),
                        (gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now()),
                        void setTimeout(() => this.triggerEmergentEvent("catching_feelings"), 4e3)
                    );
                const n = a.find(
                    (e) =>
                        (e.stats?.desire || 0) > 70 &&
                        (e.stats?.trust || 0) > 65 &&
                        !gameState.story.narrativeFlags[`late_night_${e.id}`]
                );
                if (n && Math.random() < 0.08)
                    return (
                        (gameState.story.narrativeFlags[`late_night_${n.id}`] = !0),
                        gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}),
                        (gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now()),
                        void setTimeout(() => this.triggerEmergentEvent("late_night"), 2e3)
                    );
                const o = a.find(
                    (e) =>
                        (e.stats?.trust || 0) > 75 &&
                        (e.stats?.desire || 0) > 50 &&
                        (e.memory?.intimacyLevel || 0) > 30 &&
                        !gameState.story.narrativeFlags[`power_play_${e.id}`]
                );
                if (o && Math.random() < 0.06)
                    return (
                        (gameState.story.narrativeFlags[`power_play_${o.id}`] = !0),
                        gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}),
                        (gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now()),
                        void setTimeout(() => this.triggerEmergentEvent("power_play"), 3e3)
                    );
                if (
                    a.filter((e) => e.memory?.hasHadIntimateEncounter).length >= 2 &&
                    !gameState.story.narrativeFlags.jealousy_shown &&
                    Math.random() < 0.2
                )
                    return (
                        (gameState.story.narrativeFlags.jealousy_shown = !0),
                        gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}),
                        (gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now()),
                        void setTimeout(() => this.triggerEmergentEvent("green_eyed"), 3500)
                    );
                if (
                    a.find(
                        (e) =>
                            (e.stats?.affection || 0) > 45 &&
                            (e.stats?.desire || 0) > 40 &&
                            !gameState.story.narrativeFlags.business_trip_shown &&
                            gameState.day > 30
                    ) &&
                    Math.random() < 0.04
                )
                    return (
                        (gameState.story.narrativeFlags.business_trip_shown = !0),
                        gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}),
                        (gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now()),
                        void setTimeout(() => this.triggerEmergentEvent("business_trip"), 2500)
                    );
            }
        }
    },
    async triggerEmergentEvent(e) {
        console.log(`[StoryEngine] 🌟 Emergent event triggered: ${e}`);
        const t = (gameState.story.eventTypeCooldowns || {})[e] || 0;
        if (Date.now() - t < 3e5)
            return void console.log(`[StoryEngine] Event type '${e}' is on cooldown, skipping`);
        if (
            document.getElementById("storyEventModal") ||
            document.getElementById("actTransitionCinematic") ||
            document.getElementById("multiStepEventModal")
        )
            return void console.log(`[StoryEngine] Modal already open, deferring event: ${e}`);
        gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}),
            (gameState.story.eventTypeCooldowns[e] = Date.now());
        const n = await this.generateEmergentEvent(e);
        if (n) {
            !document.getElementById("storyEventModal") &&
            !document.getElementById("actTransitionCinematic") &&
            !document.getElementById("multiStepEventModal") &&
            !gameState.story.activeSpineEvent
                ? ((gameState.story.activeSpineEvent = n), this.showStoryEventModal(n))
                : (console.log(`[StoryEngine] Queueing event '${e}' - another event is active`),
                  gameState.story.pendingEvents || (gameState.story.pendingEvents = []),
                  gameState.story.pendingEvents.push(n),
                  this.showStoryNotification()),
                saveGame();
        }
    },
    async generateEmergentEvent(e) {
        const t = gameState.story.actionStats,
            n = gameState.story.moralScore,
            a = (this.getAlignmentInfo(n), (gameState.story.actionLog || []).slice(0, 10)),
            o = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus),
            i = o.sort((e, t) => (t.stats?.trust || 0) - (e.stats?.trust || 0))[0],
            s = o.sort((e, t) => (e.stats?.trust || 0) - (t.stats?.trust || 0))[0],
            r = {
                tyranny_brewing: {
                    title: "⚠️ Unrest",
                    generateContent: () => {
                        const e = t.employeesFired || 0,
                            n = a
                                .filter((e) => e.type.includes("fired"))
                                .map((e) => e.context?.employeeName)
                                .filter(Boolean);
                        return {
                            cinematicText: `The atmosphere has changed. You can feel it in the silence when you walk through the office. In the way conversations stop mid-sentence.\n\n${e > 0 ? `${e} people have been let go. ` : ""}${n.length > 0 ? `Names like ${n.slice(0, 2).join(" and ")} are whispered in break rooms.` : ""}\n\n${s ? `${s.name} watches you with barely concealed hostility.` : "Eyes follow you everywhere."}\n\nThey're afraid. But fear turns to resentment. And resentment...\n\n*Something is brewing. Your next move matters.*`,
                            choices: [
                                {
                                    id: "address",
                                    text: "📢 Call a meeting. Clear the air.",
                                    consequence: "You decide to face this head-on.",
                                    gameplayEffect: { type: "boost_all_trust", amount: 5 },
                                },
                                {
                                    id: "bonus",
                                    text: "💰 Surprise bonuses for everyone.",
                                    consequence: "Money talks. Maybe it can drown out the whispers.",
                                    gameplayEffect: { type: "spend_cash", amount: 5e3, boostMorale: !0 },
                                },
                                {
                                    id: "ignore",
                                    text: "🤷 They'll get over it.",
                                    consequence: "Some things fester when left alone.",
                                    gameplayEffect: { type: "decrease_all_trust", amount: 3 },
                                },
                                {
                                    id: "double_down",
                                    text: "👊 Fire anyone who complains.",
                                    consequence: "Rule through fear. It's worked for others.",
                                    gameplayEffect: { type: "mark_complainers", triggerFearMode: !0 },
                                },
                            ],
                        };
                    },
                },
                beloved_leader: {
                    title: "💖 Something Beautiful",
                    generateContent: () => {
                        const e = t.giftsGiven || 0,
                            n = t.promotionsGiven || 0;
                        return {
                            cinematicText: `${i ? i.name + " finds you" : "An employee finds you"} after hours, holding something behind their back.\n\n"We, um... we all chipped in." They reveal a card, signed by everyone. And a gift—nothing expensive, but clearly chosen with care.\n\n"You didn't have to be kind to us. But you were. ${e > 0 ? "The gifts. " : ""}${n > 0 ? "The promotions that actually made sense. " : ""}The way you actually *listen*."\n\nThey look embarrassed but determined. "We just wanted you to know: we'd follow you anywhere."\n\n*Your kindness has built something rare: genuine loyalty.*`,
                            choices: [
                                {
                                    id: "humble",
                                    text: '🙏 "You all built this together. Thank you."',
                                    consequence: "Humility strengthens the bond.",
                                    gameplayEffect: { type: "boost_all_trust", amount: 10 },
                                },
                                {
                                    id: "promise",
                                    text: '🌟 "This is just the beginning. We\'re going to do great things."',
                                    consequence: "Your vision inspires them further.",
                                    gameplayEffect: { type: "boost_all_productivity", amount: 5 },
                                },
                                {
                                    id: "party",
                                    text: "🎉 \"Let's celebrate! Dinner's on me!\"",
                                    consequence: "The team bonds over good food and laughter.",
                                    gameplayEffect: { type: "spend_cash", amount: 2e3, boostAffection: !0 },
                                },
                            ],
                        };
                    },
                },
                promotion_jealousy: {
                    title: "💔 Green-Eyed Monster",
                    generateContent: () => {
                        const e = a.filter((e) => "promoted_employee" === e.type),
                            t = e[0]?.context?.employeeName || "someone",
                            n = o.find((e) => e.name !== t && (e.stats?.trust || 50) < 50);
                        return {
                            cinematicText: `${n ? n.name : "An employee"} corners you in the hallway. Their voice is tight with barely-controlled emotion.\n\n"${t} got promoted. Again." They laugh, but there's no humor in it. "I've been here longer. I work just as hard. What does ${t} have that I don't?"\n\nTheir eyes search your face for an answer. For validation. For *something*.\n\n*Jealousy is a poison. How you handle this will echo through the office.*`,
                            choices: [
                                {
                                    id: "validate",
                                    text: '💬 "Your time is coming. I see your work."',
                                    consequence: "Empty promises or genuine recognition?",
                                    gameplayEffect: {
                                        type: "boost_employee",
                                        employeeId: n?.id,
                                        stat: "trust",
                                        amount: 15,
                                    },
                                },
                                {
                                    id: "opportunity",
                                    text: "📋 \"Actually, there's an opening I've been considering you for...\"",
                                    consequence: "You dangle a carrot. Now you'll have to deliver.",
                                    minigame: {
                                        type: "recall",
                                        title: "Read the Room",
                                        description: "Remember their strengths and pitch the right opportunity!",
                                        difficulty: "medium",
                                        perfectOutcome: {
                                            consequence:
                                                "You know exactly what they want to hear. Their eyes light up.",
                                            gameplayEffect: {
                                                type: "boost_employee",
                                                employeeId: n?.id,
                                                stat: "trust",
                                                amount: 25,
                                            },
                                        },
                                        successOutcome: {
                                            consequence:
                                                "You dangle a carrot. They're intrigued. Now you'll have to deliver.",
                                            gameplayEffect: {
                                                type: "unlock_ability",
                                                ability: "pending_promotion_promise",
                                            },
                                        },
                                        partialOutcome: {
                                            consequence: "The opportunity lands, but they're skeptical. Prove it.",
                                            gameplayEffect: {
                                                type: "boost_employee",
                                                employeeId: n?.id,
                                                stat: "trust",
                                                amount: 5,
                                            },
                                        },
                                        failureOutcome: {
                                            consequence: "You fumble the pitch. They see right through it.",
                                            gameplayEffect: {
                                                type: "boost_employee",
                                                employeeId: n?.id,
                                                stat: "trust",
                                                amount: -10,
                                            },
                                        },
                                    },
                                },
                                {
                                    id: "honest",
                                    text: '📊 "Let\'s look at the metrics together."',
                                    consequence: "Honesty can heal or wound. The data will decide.",
                                    gameplayEffect: {
                                        type: "boost_employee",
                                        employeeId: n?.id,
                                        stat: "trust",
                                        amount: 5,
                                    },
                                },
                                {
                                    id: "dismiss",
                                    text: '🚪 "This isn\'t the time or place."',
                                    consequence: "You shut them down. The conversation, at least.",
                                    gameplayEffect: {
                                        type: "boost_employee",
                                        employeeId: n?.id,
                                        stat: "trust",
                                        amount: -10,
                                    },
                                },
                            ],
                        };
                    },
                },
                favoritism_accusation: {
                    title: "⚖️ The Accusation",
                    generateContent: () => {
                        const e = (gameState.story.actionLog || []).filter((e) => e.type.includes("gift")),
                            t = {};
                        e.forEach((e) => {
                            const n = e.context?.employeeName;
                            n && (t[n] = (t[n] || 0) + 1);
                        });
                        const n = Object.entries(t).sort((e, t) => t[1] - e[1])[0];
                        return {
                            cinematicText: `The email arrives anonymously, but the sentiment is clear:\n\n*"Everyone sees it. ${n ? n[0] : "someone"} gets ${n ? n[1] : "several"} gifts while the rest of us get nothing. Is this company based on merit or favoritism? Are we employees or are we just... extras?"*\n\nThe message has been forwarded. People are reading it. Some are nodding along. Others are watching to see what you'll do.\n\n*A private matter has become very public. Your response will define the culture.*`,
                            choices: [
                                {
                                    id: "transparency",
                                    text: "📧 Send a company-wide email explaining your gift philosophy.",
                                    consequence: "Sunlight is the best disinfectant. Or is it?",
                                    minigame: {
                                        type: "precision",
                                        title: "Choose Your Words",
                                        description: "Time your response carefully. Too defensive? Too dismissive?",
                                        difficulty: "medium",
                                        perfectOutcome: {
                                            consequence:
                                                "Your message strikes the perfect balance. Honest, fair, final.",
                                            gameplayEffect: { type: "boost_all_trust", amount: 8 },
                                        },
                                        successOutcome: {
                                            consequence: "Sunlight is the best disinfectant. The air clears.",
                                            gameplayEffect: { type: "boost_all_trust", amount: 3 },
                                        },
                                        partialOutcome: {
                                            consequence: "Your message is received... mixed reviews.",
                                            gameplayEffect: { type: "boost_all_trust", amount: 0 },
                                        },
                                        failureOutcome: {
                                            consequence: "Your email comes across wrong. The situation worsens.",
                                            gameplayEffect: { type: "decrease_all_trust", amount: 5 },
                                        },
                                    },
                                },
                                {
                                    id: "equal_gifts",
                                    text: '🎁 "Everyone gets something this month. On me."',
                                    consequence: "Equality through generosity. Your wallet feels it.",
                                    gameplayEffect: { type: "spend_cash", amount: 200 * o.length, boostMorale: !0 },
                                },
                                {
                                    id: "private",
                                    text: "🔒 Try to identify and address the sender privately.",
                                    consequence: "Some fires need to be put out quietly.",
                                    gameplayEffect: { type: "decrease_all_trust", amount: -2 },
                                },
                                {
                                    id: "ignore_email",
                                    text: "🗑️ Ignore it. Anonymous complaints don't deserve responses.",
                                    consequence: "Silence can be interpreted many ways.",
                                    gameplayEffect: { type: "decrease_all_trust", amount: 5 },
                                },
                            ],
                        };
                    },
                },
                rising_star: {
                    title: "⭐ The Prodigy",
                    generateContent: () => {
                        const e = o.sort((e, t) => (t.stats?.productivity || 0) - (e.stats?.productivity || 0))[0];
                        return {
                            cinematicText: `${e ? e.name : "One of your employees"} has been producing exceptional work. Numbers that don't lie. Innovation that catches your eye.\n\nWord reaches you: a competitor has noticed too. They're circling. Making quiet inquiries. A headhunter's business card was spotted on ${e ? e.name + "'s" : "their"} desk.\n\n*You built something valuable here. Someone wants to take it.*`,
                            choices: [
                                {
                                    id: "counter_offer",
                                    text: "💰 Make a preemptive counter-offer. Match whatever they're thinking.",
                                    consequence: "Money can buy loyalty. For a while.",
                                    gameplayEffect: { type: "spend_cash", amount: 1e4, boostAffection: !0 },
                                },
                                {
                                    id: "vision",
                                    text: '🗣️ "Let me show you where this company is going. And your role in it."',
                                    consequence: "You share your vision. They see themselves in the future.",
                                    minigame: {
                                        type: "intensity",
                                        title: "Sell the Vision",
                                        description: "Pour your passion into this pitch! Make them believe!",
                                        difficulty: "medium",
                                        perfectOutcome: {
                                            consequence:
                                                "Your passion is infectious. They're not just staying—they're inspired.",
                                            gameplayEffect: {
                                                type: "boost_employee",
                                                employeeId: e?.id,
                                                stat: "trust",
                                                amount: 30,
                                            },
                                        },
                                        successOutcome: {
                                            consequence:
                                                "You share your vision. They see themselves in the future.",
                                            gameplayEffect: {
                                                type: "boost_employee",
                                                employeeId: e?.id,
                                                stat: "trust",
                                                amount: 20,
                                            },
                                        },
                                        partialOutcome: {
                                            consequence:
                                                "Your pitch lands partially. They're considering it, at least.",
                                            gameplayEffect: {
                                                type: "boost_employee",
                                                employeeId: e?.id,
                                                stat: "trust",
                                                amount: 10,
                                            },
                                        },
                                        failureOutcome: {
                                            consequence: "Your words fall flat. The vision doesn't connect.",
                                            gameplayEffect: {
                                                type: "boost_employee",
                                                employeeId: e?.id,
                                                stat: "trust",
                                                amount: -5,
                                            },
                                        },
                                    },
                                },
                                {
                                    id: "freedom",
                                    text: '🔓 "If you want to explore other opportunities, I won\'t stop you."',
                                    consequence: "Respect breeds respect. Or goodbye.",
                                    gameplayEffect: {
                                        type: "boost_employee",
                                        employeeId: e?.id,
                                        stat: "affection",
                                        amount: 10,
                                    },
                                },
                                {
                                    id: "guilt",
                                    text: '😢 "After everything we\'ve built together? Really?"',
                                    consequence: "Guilt is a weapon. Use it carefully.",
                                    gameplayEffect: {
                                        type: "boost_employee",
                                        employeeId: e?.id,
                                        stat: "trust",
                                        amount: -5,
                                    },
                                },
                            ],
                        };
                    },
                },
                simmering_tension: {
                    title: "🔥 Simmering Tension",
                    nsfwOnly: !0,
                    generateContent: () => {
                        const e = o
                            .filter((e) => (e.stats?.desire || 0) > 60 && (e.stats?.affection || 0) > 50)
                            .sort((e, t) => (t.stats?.desire || 0) - (e.stats?.desire || 0))[0];
                        if (!e) return null;
                        const t = (e.memory?.intimacyLevel || 0) > 50;
                        return {
                            cinematicText: `You notice ${e.name} lingering after a meeting. Everyone else has filed out, but they remain, pretending to organize papers.\n\n${t ? 'There\'s history between you. The kind that makes eye contact feel like a conversation. The kind that makes "staying late" mean something else entirely.' : "Something has shifted lately. The way they look at you has changed. Lingering glances across the office. Finding excuses to be near you."}\n\nThey finally look up, and there's no mistaking that expression. Want. Barely contained.\n\n"I was wondering..." they start, then pause. "If you're not busy tonight..."\n\n*The air feels charged. This is a line—one you can cross, or draw.*`,
                            choices: [
                                {
                                    id: "accept",
                                    text: "🔥 \"I'm free. Let's get out of here.\"",
                                    consequence: t
                                        ? "You both know exactly where this is going."
                                        : "Tonight changes everything.",
                                    minigame: {
                                        type: "tension",
                                        title: "Build the Moment",
                                        description: "Hold the tension... release at the perfect moment.",
                                        difficulty: "medium",
                                        perfectOutcome: {
                                            consequence: "The timing is perfect. Electric. Unforgettable.",
                                            gameplayEffect: {
                                                type: "intimate_encounter",
                                                employeeId: e?.id,
                                                intimacyGain: 25,
                                                affectionGain: 15,
                                            },
                                        },
                                        successOutcome: {
                                            consequence: t
                                                ? "You both know exactly where this is going."
                                                : "Tonight changes everything.",
                                            gameplayEffect: {
                                                type: "intimate_encounter",
                                                employeeId: e?.id,
                                                trackAction: t ? "intimate_encounter" : "first_intimate_encounter",
                                            },
                                        },
                                        partialOutcome: {
                                            consequence:
                                                "A bit awkward, but you work through it. The chemistry is still there.",
                                            gameplayEffect: {
                                                type: "boost_employee",
                                                employeeId: e?.id,
                                                stat: "affection",
                                                amount: 8,
                                            },
                                        },
                                        failureOutcome: {
                                            consequence:
                                                "The moment passes. Maybe the timing wasn't right after all.",
                                            gameplayEffect: {
                                                type: "boost_employee",
                                                employeeId: e?.id,
                                                stat: "desire",
                                                amount: 5,
                                            },
                                        },
                                    },
                                },
                                {
                                    id: "tease",
                                    text: '😏 "Depends on what you had in mind..."',
                                    consequence: "You let the tension build. Anticipation is its own reward.",
                                    gameplayEffect: {
                                        type: "boost_employee",
                                        employeeId: e?.id,
                                        stat: "desire",
                                        amount: 15,
                                    },
                                },
                                {
                                    id: "rain_check",
                                    text: '📅 "Not tonight. But soon."',
                                    consequence: "A promise. They'll hold you to it.",
                                    gameplayEffect: {
                                        type: "boost_employee",
                                        employeeId: e?.id,
                                        stat: "affection",
                                        amount: 5,
                                    },
                                },
                                {
                                    id: "boundary",
                                    text: '✋ "I think we should keep things professional."',
                                    consequence: "Disappointment flickers across their face. But they nod.",
                                    gameplayEffect: {
                                        type: "boost_employee",
                                        employeeId: e?.id,
                                        stat: "desire",
                                        amount: -20,
                                        trackAction: "respected_boundaries",
                                    },
                                },
                            ],
                        };
                    },
                },
                office_whispers: {
                    title: "👀 Office Whispers",
                    nsfwOnly: !0,
                    generateContent: () => {
                        const e = (gameState.story.actionLog || []).filter(
                                (e) => e.type.includes("intimate") || e.type.includes("seduced")
                            ),
                            t = [...new Set(e.map((e) => e.context?.employeeName).filter(Boolean))];
                        return {
                            cinematicText: `You overhear it in the break room. Hushed voices that go quiet when you appear.\n\n"...saw them leave together three times this week..."\n"...door was locked for an hour..."\n"...${t.length > 1 ? "wonder who else" : "everyone knows"}..."\n\nThe office has noticed your... extracurricular activities. ${t.length > 1 ? `Multiple names are being whispered. ${t.slice(0, 2).join(" and ")} among them.` : 1 === t.length ? `${t[0]}'s name keeps coming up.` : "They're speculating, even if they don't have specifics."}\n\n*Secrets have a way of becoming currency in an office. How do you handle yours?*`,
                            choices: [
                                {
                                    id: "own_it",
                                    text: '🤷 "My personal life is my business."',
                                    consequence: "Confidence or arrogance? They'll decide.",
                                    gameplayEffect: { type: "boost_all_trust", amount: -2 },
                                },
                                {
                                    id: "discretion",
                                    text: "🤫 Start being more... discreet.",
                                    consequence: "What they don't see, they can't gossip about.",
                                    gameplayEffect: { type: "unlock_ability", ability: "discreet_mode" },
                                },
                                {
                                    id: "embrace",
                                    text: '💋 "Life\'s too short to hide who you are."',
                                    consequence: "Bold. Some admire it. Some judge it.",
                                    gameplayEffect: { type: "boost_all_productivity", amount: -3 },
                                },
                                {
                                    id: "hr_meeting",
                                    text: "📋 Call a meeting about professionalism and boundaries.",
                                    consequence: "The irony isn't lost on anyone. But it stops the chatter.",
                                    gameplayEffect: { type: "boost_all_trust", amount: 3 },
                                },
                            ],
                        };
                    },
                },
                catching_feelings: {
                    title: "💕 Catching Feelings",
                    nsfwOnly: !0,
                    generateContent: () => {
                        const e = o
                            .filter((e) => (e.memory?.intimacyLevel || 0) > 60 && (e.stats?.affection || 0) > 70)
                            .sort((e, t) => (t.stats?.affection || 0) - (e.stats?.affection || 0))[0];
                        return e
                            ? {
                                  cinematicText: `${e.name} asks to speak with you privately. There's something different about them today. Nervous. Vulnerable.\n\n"I need to say something before I lose my nerve." They take a breath. "What we have... I know how it started. I know what it is. But..."\n\nTheir eyes meet yours. Raw. Unguarded.\n\n"I think I'm falling for you. Really falling. And I need to know if this is just... *fun* for you, or if there's something more."\n\n*This is the moment where casual becomes complicated. Or ends.*`,
                                  choices: [
                                      {
                                          id: "reciprocate",
                                          text: '❤️ "I feel it too. This is real for me."',
                                          consequence: "You step off the edge together.",
                                          gameplayEffect: {
                                              type: "boost_employee",
                                              employeeId: e?.id,
                                              stat: "affection",
                                              amount: 25,
                                              trackAction: "mutual_attraction_consummated",
                                          },
                                      },
                                      {
                                          id: "slow_down",
                                          text: '🤔 "I care about you. But I need time to figure out what this is."',
                                          consequence: "Honest but uncertain. They accept it. For now.",
                                          gameplayEffect: {
                                              type: "boost_employee",
                                              employeeId: e?.id,
                                              stat: "trust",
                                              amount: 10,
                                          },
                                      },
                                      {
                                          id: "just_physical",
                                          text: '😔 "I\'m not looking for anything serious right now."',
                                          consequence: "The light dims in their eyes. Something breaks.",
                                          gameplayEffect: {
                                              type: "boost_employee",
                                              employeeId: e?.id,
                                              stat: "affection",
                                              amount: -15,
                                              trackAction: "broke_heart",
                                          },
                                      },
                                      {
                                          id: "end_it",
                                          text: '🚪 "Maybe we should stop. Before someone gets hurt."',
                                          consequence:
                                              "You walk away. It's the kind thing to do. Doesn't make it easy.",
                                          gameplayEffect: {
                                              type: "boost_employee",
                                              employeeId: e?.id,
                                              stat: "desire",
                                              amount: -30,
                                              trackAction: "broke_heart",
                                          },
                                      },
                                  ],
                              }
                            : null;
                    },
                },
                late_night: {
                    title: "🌙 Late Night",
                    nsfwOnly: !0,
                    generateContent: () => {
                        const e = o
                            .filter((e) => (e.stats?.desire || 0) > 70 && (e.stats?.trust || 0) > 60)
                            .sort((e, t) => (t.stats?.desire || 0) - (e.stats?.desire || 0))[0];
                        return e
                            ? {
                                  cinematicText: `The office is empty. Just you and the glow of computer screens.\n\nThen you hear footsteps. ${e.name} appears at your door, jacket half-off, a bottle of wine in hand.\n\n"I was going to leave this on your desk with a note," they say. "But then I saw your light was still on."\n\nThey step inside. Close the door. Lock it.\n\n"We could open it now. Celebrate another successful quarter." Their voice drops. "Or we could celebrate... differently."\n\n*It's late. No one would know. The question is what YOU want.*`,
                                  choices: [
                                      {
                                          id: "wine",
                                          text: '🍷 "Let\'s start with the wine and see where the night takes us."',
                                          consequence: "Some of the best nights start with patience.",
                                          minigame: {
                                              type: "composure",
                                              title: "Savor the Moment",
                                              description:
                                                  "Keep your composure... let the anticipation build naturally.",
                                              difficulty: "easy",
                                              perfectOutcome: {
                                                  consequence:
                                                      "The perfect balance of patience and presence. The night unfolds beautifully.",
                                                  gameplayEffect: {
                                                      type: "boost_employee",
                                                      employeeId: e?.id,
                                                      stat: "desire",
                                                      amount: 20,
                                                  },
                                              },
                                              successOutcome: {
                                                  consequence: "Some of the best nights start with patience.",
                                                  gameplayEffect: {
                                                      type: "boost_employee",
                                                      employeeId: e?.id,
                                                      stat: "desire",
                                                      amount: 10,
                                                  },
                                              },
                                              partialOutcome: {
                                                  consequence: "A bit awkward at first, but the wine helps.",
                                                  gameplayEffect: {
                                                      type: "boost_employee",
                                                      employeeId: e?.id,
                                                      stat: "desire",
                                                      amount: 5,
                                                  },
                                              },
                                              failureOutcome: {
                                                  consequence: "You spill the wine. The moment recovers... mostly.",
                                                  gameplayEffect: {
                                                      type: "boost_employee",
                                                      employeeId: e?.id,
                                                      stat: "affection",
                                                      amount: 3,
                                                  },
                                              },
                                          },
                                      },
                                      {
                                          id: "direct",
                                          text: '🔥 Pull them close. "I know exactly where this night is going."',
                                          consequence: "No pretense. No games. Just heat.",
                                          minigame: {
                                              type: "reflex",
                                              title: "Read the Signals",
                                              description: "Catch every cue. Every signal. Every invitation.",
                                              difficulty: "medium",
                                              perfectOutcome: {
                                                  consequence:
                                                      "Every move, perfectly timed. The chemistry is undeniable.",
                                                  gameplayEffect: {
                                                      type: "intimate_encounter",
                                                      employeeId: e?.id,
                                                      intimacyGain: 25,
                                                      affectionGain: 10,
                                                  },
                                              },
                                              successOutcome: {
                                                  consequence: "No pretense. No games. Just heat.",
                                                  gameplayEffect: {
                                                      type: "intimate_encounter",
                                                      employeeId: e?.id,
                                                      trackAction: "intimate_encounter",
                                                  },
                                              },
                                              partialOutcome: {
                                                  consequence: "A bit rushed, but the passion is real.",
                                                  gameplayEffect: {
                                                      type: "boost_employee",
                                                      employeeId: e?.id,
                                                      stat: "desire",
                                                      amount: 8,
                                                  },
                                              },
                                              failureOutcome: {
                                                  consequence: "The mood shifts. Maybe another time.",
                                                  gameplayEffect: {
                                                      type: "boost_employee",
                                                      employeeId: e?.id,
                                                      stat: "affection",
                                                      amount: 3,
                                                  },
                                              },
                                          },
                                      },
                                      {
                                          id: "rain_check",
                                          text: '📅 "Tonight I really do need to finish this. But hold that thought."',
                                          consequence:
                                              "Anticipation is a powerful thing. They leave with a promise.",
                                          gameplayEffect: {
                                              type: "boost_employee",
                                              employeeId: e?.id,
                                              stat: "affection",
                                              amount: 5,
                                          },
                                      },
                                      {
                                          id: "decline",
                                          text: '✋ "I appreciate the offer, but I should probably just go home."',
                                          consequence: 'They mask disappointment with a smile. "Maybe next time."',
                                          gameplayEffect: {
                                              type: "boost_employee",
                                              employeeId: e?.id,
                                              stat: "desire",
                                              amount: -10,
                                          },
                                      },
                                  ],
                              }
                            : null;
                    },
                },
                power_play: {
                    title: "⚡ Power Play",
                    nsfwOnly: !0,
                    generateContent: () => {
                        const e = o
                            .filter((e) => (e.stats?.desire || 0) > 50 && (e.stats?.trust || 0) > 70)
                            .sort((e, t) => (t.stats?.trust || 0) - (e.stats?.trust || 0))[0];
                        if (!e) return null;
                        const t = e.memory?.intimacyLevel || 0;
                        return {
                            cinematicText: `${e.name} closes your office door and takes a deep breath.\n\n"I've been thinking about... us. The dynamic." They're choosing their words carefully. "You're my boss. You hold power over my career, my livelihood."\n\nA pause. They meet your eyes.\n\n"And I find that... ${t > 40 ? "exciting. More than I should." : "intriguing. In ways I\\'m still figuring out."}"\n\nThey move closer. "I'm not saying I *want* you to use that power. But knowing you *could*..." Their voice trails off.\n\n*This is complicated territory. Consent, power, desire—all tangled together.*`,
                            choices: [
                                {
                                    id: "reassure",
                                    text: '💝 "I would never use my position to pressure you. What happens between us is separate."',
                                    consequence: "You draw a clear line. Power at work, equals in private.",
                                    gameplayEffect: {
                                        type: "boost_employee",
                                        employeeId: e?.id,
                                        stat: "trust",
                                        amount: 15,
                                    },
                                },
                                {
                                    id: "acknowledge",
                                    text: '😏 "That dynamic goes both ways. You have power over me too."',
                                    consequence: "They hadn't considered that. Something shifts.",
                                    gameplayEffect: {
                                        type: "boost_employee",
                                        employeeId: e?.id,
                                        stat: "affection",
                                        amount: 10,
                                    },
                                },
                                {
                                    id: "explore",
                                    text: '🔥 "If that dynamic excites you... we could explore that. Safely."',
                                    consequence: "A door opens. What lies beyond is up to both of you.",
                                    gameplayEffect: {
                                        type: "intimate_encounter",
                                        employeeId: e?.id,
                                        context: "power_dynamic_exploration",
                                        intimacyGain: 20,
                                    },
                                },
                                {
                                    id: "step_back",
                                    text: "⚠️ \"That's exactly why maybe we shouldn't do this.\"",
                                    consequence: "You prioritize ethics over desire. They respect it. Mostly.",
                                    gameplayEffect: {
                                        type: "boost_employee",
                                        employeeId: e?.id,
                                        stat: "desire",
                                        amount: -15,
                                    },
                                },
                            ],
                        };
                    },
                },
                green_eyed: {
                    title: "💚 Green-Eyed",
                    nsfwOnly: !0,
                    generateContent: () => {
                        const e = (gameState.story.actionLog || []).filter((e) => e.type.includes("intimate")),
                            t = o.filter((t) => e.some((e) => e.context?.employeeId === t.id));
                        if (t.length < 2) return null;
                        const n = t.sort((e, t) => (t.stats?.affection || 0) - (e.stats?.affection || 0))[0],
                            a = t.find((e) => e.id !== n?.id);
                        return n && a
                            ? {
                                  cinematicText: `${n.name} catches you in the hallway, voice low but intense.\n\n"I saw you with ${a.name} yesterday. Coming out of your office. Hair messed up. Shirt untucked."\n\nTheir eyes are hurt but burning. "I thought we had something. Was I wrong? Or am I just... *one of many*?"\n\n*This was bound to happen. Hearts get complicated when bodies don't.*`,
                                  choices: [
                                      {
                                          id: "choose_them",
                                          text: "❤️ \"You're right. It's been unfair to you. You're who I want.\"",
                                          consequence: "You commit. But what about the others?",
                                          gameplayEffect: {
                                              type: "boost_employee",
                                              employeeId: n?.id,
                                              stat: "affection",
                                              amount: 25,
                                          },
                                      },
                                      {
                                          id: "honest_poly",
                                          text: '🔄 "I care about you. I care about them too. I won\'t lie about that."',
                                          consequence: "Radical honesty. They either accept it or they don't.",
                                          gameplayEffect: {
                                              type: "boost_employee",
                                              employeeId: n?.id,
                                              stat: "trust",
                                              amount: 5,
                                          },
                                      },
                                      {
                                          id: "deflect",
                                          text: '🤷 "My personal life is complicated. I never promised exclusivity."',
                                          consequence: "Cold but true. Something hardens in their expression.",
                                          gameplayEffect: {
                                              type: "boost_employee",
                                              employeeId: n?.id,
                                              stat: "affection",
                                              amount: -20,
                                          },
                                      },
                                      {
                                          id: "end_all",
                                          text: '🚪 "Maybe this is a sign I shouldn\'t be doing this with *anyone* at work."',
                                          consequence: "The safest choice. The loneliest one too.",
                                          gameplayEffect: { type: "spread_rumors" },
                                      },
                                  ],
                              }
                            : null;
                    },
                },
                business_trip: {
                    title: "✈️ Business Trip",
                    nsfwOnly: !0,
                    generateContent: () => {
                        const e = o
                            .filter((e) => (e.stats?.desire || 0) > 40 && (e.stats?.affection || 0) > 40)
                            .sort(
                                (e, t) =>
                                    (t.stats?.desire || 0) +
                                    (t.stats?.affection || 0) -
                                    ((e.stats?.desire || 0) + (e.stats?.affection || 0))
                            )[0];
                        return e
                            ? {
                                  cinematicText: `An important conference is coming up. You need to send someone.\n\n${e.name} appears in your doorway. "I heard about the trip. I'd like to go. *With you*."\n\nThere's something in the way they say it. The conference is in a nice city. Two nights. Hotel rooms. \n\nAway from the office. Away from prying eyes. Away from the daily rhythms that keep things... appropriate.\n\n"It could be good for my professional development," they add with a slight smile. "Among other things."\n\n*A trip like this could change everything. Or nothing. Depends on what happens in those hotel hallways.*`,
                                  choices: [
                                      {
                                          id: "together",
                                          text: '✈️ "Pack your bags. We leave Thursday."',
                                          consequence:
                                              "What happens on business trips stays on business trips. Usually.",
                                          gameplayEffect: {
                                              type: "boost_employee",
                                              employeeId: e?.id,
                                              stat: "desire",
                                              amount: 20,
                                          },
                                      },
                                      {
                                          id: "adjoining",
                                          text: '🏨 "I\'ll book adjoining rooms. No promises, but... no closed doors either."',
                                          consequence: "The implication hangs in the air. They smile knowingly.",
                                          gameplayEffect: {
                                              type: "boost_employee",
                                              employeeId: e?.id,
                                              stat: "affection",
                                              amount: 10,
                                          },
                                      },
                                      {
                                          id: "professional",
                                          text: '📋 "This trip is strictly business. Separate floors."',
                                          consequence: "Clear boundaries. Disappointed but respectful nod.",
                                          gameplayEffect: {
                                              type: "boost_employee",
                                              employeeId: e?.id,
                                              stat: "trust",
                                              amount: 5,
                                          },
                                      },
                                      {
                                          id: "send_else",
                                          text: '👥 "Actually, I\'m sending someone else. Less... complicated."',
                                          consequence: "You remove the temptation entirely.",
                                          gameplayEffect: {
                                              type: "boost_employee",
                                              employeeId: e?.id,
                                              stat: "desire",
                                              amount: -10,
                                          },
                                      },
                                  ],
                              }
                            : null;
                    },
                },
            }[e];
        if (!r) return null;
        if (r.nsfwOnly && !this.isAdultContentEnabled())
            return console.log(`[StoryEngine] Skipping NSFW event in SFW mode: ${e}`), null;
        const l = r.generateContent();
        return {
            id: `emergent_${e}_${Date.now()}`,
            eventKey: e,
            title: r.title,
            cinematicText: l.cinematicText,
            choices: l.choices,
            actNumber: gameState.story.currentAct,
            type: "emergent",
            timestamp: Date.now(),
        };
    },
    initialize() {
        gameState.story || (gameState.story = this.getDefaultStoryState()),
            this.emergentCooldowns || (this.emergentCooldowns = new Map());
        const e = this.getDefaultStoryState();
        for (const t of Object.keys(e)) void 0 === gameState.story[t] && (gameState.story[t] = e[t]);
        gameState.story.settings && (gameState.story.settings.storyEnabled = isStoryEnabled());
        const t = gameState.cash > 1e3 || gameState.employees.filter((e) => e.hired).length > 0,
            n = gameState.story.choicesMade > 0 || gameState.story.actData[1].spineEventsTriggered.length > 0;
        if (t && !n) {
            const e = this.performStoryCatchUp();
            e.actAdvanced && console.log(`[StoryEngine] Catch-up: Advanced existing save to Act ${e.newAct}`);
        }
        if (
            (gameState.story.actData[1].startedAt || (gameState.story.actData[1].startedAt = Date.now()),
            console.log("[StoryEngine] Initialized. Current Act:", gameState.story.currentAct),
            gameState.story.activeSpineEvent)
        )
            console.log(
                "[StoryEngine] Found incomplete event, re-showing:",
                gameState.story.activeSpineEvent.eventKey
            ),
                setTimeout(() => {
                    gameState.story.settings.storyEnabled &&
                        gameState.story.activeSpineEvent &&
                        this.showStoryEventModal(gameState.story.activeSpineEvent);
                }, 1500);
        else if (gameState.story.pendingEvents && gameState.story.pendingEvents.length > 0)
            console.log("[StoryEngine] Found pending events:", gameState.story.pendingEvents.length),
                this.showStoryNotification();
        else {
            gameState.story.actData[1].spineEventsTriggered.includes("prologue") ||
                0 !== gameState.story.choicesMade ||
                setTimeout(() => {
                    gameState.story.settings.storyEnabled &&
                        isStoryEnabled() &&
                        (gameState.story.currentAct > 1
                            ? this.showCatchUpIntro()
                            : this.triggerSpineEvent("prologue"));
                }, 2e3);
        }
    },
    performStoryCatchUp() {
        const e = { actAdvanced: !1, newAct: 1, skippedEvents: [] };
        let t = 1;
        for (let e = 5; e >= 1; e--)
            if (this.meetsActRequirements(e)) {
                t = e;
                break;
            }
        if (t > 1) {
            (gameState.story.currentAct = t), (e.actAdvanced = !0), (e.newAct = t);
            for (let n = 1; n < t; n++) {
                (gameState.story.actData[n].startedAt = Date.now() - 864e5 * (t - n)),
                    (gameState.story.actData[n].completedAt = Date.now() - 864e5 * (t - n - 1));
                const a = this.ACT_CONFIG[n];
                a &&
                    a.spineEvents &&
                    a.spineEvents.forEach((t) => {
                        gameState.story.actData[n].spineEventsTriggered.includes(t) ||
                            (gameState.story.actData[n].spineEventsTriggered.push(t), e.skippedEvents.push(t));
                    });
            }
            t >= 2 && (gameState.story.narrativeFlags.firstHireComplete = !0),
                t >= 3 &&
                    ((gameState.story.narrativeFlags.victoriaIntroduced = !0),
                    (gameState.story.narrativeFlags.innerCircleFormed = !0)),
                t >= 4 &&
                    ((gameState.story.narrativeFlags.betrayalDetected = !0),
                    (gameState.story.narrativeFlags.actThreeClimaxed = !0)),
                (gameState.story.actData[t].startedAt = Date.now()),
                this.estimateMoralScoreFromHistory(),
                this.addJournalEntry({
                    title: "📜 The Story So Far...",
                    content: `Your journey began long before these records. Through ${t - 1} chapters of growth, challenge, and choice, you've risen to where you stand now. The past shapes you, but the future is unwritten.`,
                    type: "act_transition",
                    memorable: !0,
                });
        }
        return e;
    },
    meetsActRequirements(e) {
        const t = this.ACT_CONFIG[e];
        if (!t) return !1;
        const n = t.triggerConditions;
        if (n.cash && gameState.cash < n.cash) return !1;
        const a = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus).length;
        if (n.employees && a < n.employees) return !1;
        if (n.locations)
            for (const e of n.locations) {
                const t = gameState.locations.find((t) => t.id === e);
                if (!t || !t.owned) return !1;
            }
        return !(n.prestiges && (gameState.prestigeLevel || 0) < n.prestiges);
    },
    estimateMoralScoreFromHistory() {
        let e = 50;
        const t = gameState.employees.filter((e) => "fired" === e.employmentStatus).length,
            n = gameState.employees.filter((e) => e.hired).length;
        if (n > 0) {
            const a = t / n;
            a > 0.5 ? (e -= 20) : a < 0.1 && (e += 10);
        }
        const a = gameState.employees.reduce((e, t) => e + (t.giftsReceived || 0), 0);
        a > 50 ? (e += 15) : a > 20 && (e += 8);
        const o = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus);
        if (o.length > 0) {
            const t = o.reduce((e, t) => e + (t.stats?.trust || 50), 0) / o.length;
            t > 70 && (e += 10),
                o.reduce((e, t) => e + (t.stats?.affection || 50), 0) / o.length > 70 && (e += 10),
                t < 30 && (e -= 15);
        }
        gameState.story.moralScore = Math.max(0, Math.min(100, e));
    },
    showCatchUpIntro() {
        const e = gameState.story.currentAct,
            t = this.ACT_CONFIG[e],
            n = this.getAlignmentInfo(gameState.story.moralScore),
            a = {
                id: `catch_up_intro_${Date.now()}`,
                title: `📖 ${t.title}`,
                cinematicText: `═══════════════════════════════════════\n🎬 YOUR STORY CONTINUES\n═══════════════════════════════════════\n\nThe records speak of your rise. From humble beginnings to... this.\n\n${t.description}\n\nYour reputation precedes you: **${n.title}** - ${n.description}\n\nThe choices you've made have shaped your empire. The employees you've hired, fired, and inspired all tell a story—even if you weren't paying attention to the narrative.\n\nBut now? Now the story gets interesting.\n\n*Welcome to the narrative. Your actions have always mattered. Now you'll see how.*\n\n═══════════════════════════════════════`,
                choices: [
                    {
                        id: "embrace",
                        text: '📜 "Show me what I\'ve built."',
                        alignment: "proud",
                        consequence: "You embrace your legacy, whatever it may be.",
                    },
                    {
                        id: "curious",
                        text: '🔍 "What happens next?"',
                        alignment: "curious",
                        consequence: "The future is unwritten. That's the exciting part.",
                    },
                    {
                        id: "change",
                        text: '🔄 "Maybe it\'s time for a change..."',
                        alignment: "reflective",
                        consequence: "The past doesn't define the future. You can still choose who to become.",
                    },
                ],
                imagePrompt: `corporate empire, ${t.tone}, dramatic lighting, cinematic moment, professional atmosphere`,
                allowAI: !0,
                isCatchUp: !0,
            };
        (gameState.story.activeSpineEvent = a),
            this.showStoryEventModal(a),
            gameState.story.actData[1].spineEventsTriggered.includes("prologue") ||
                gameState.story.actData[1].spineEventsTriggered.push("prologue");
    },
    getDefaultStoryState: () => ({
        currentAct: 1,
        actProgress: 0,
        totalStoryProgress: 0,
        activeSpineEvent: null,
        activeMultiStepEvent: null,
        generatingSpineEvent: null,
        activeRibEvents: [],
        pendingEvents: [],
        moralScore: 50,
        charismaScore: 50,
        ruthlessnessScore: 0,
        choicesMade: 0,
        choiceHistory: [],
        narrativeFlags: {
            firstHireComplete: !1,
            firstBossDefeated: !1,
            firstPrestigeComplete: !1,
            victoriaIntroduced: !1,
            victoriaDefeated: !1,
            victoriaRecruited: !1,
            betrayalDetected: !1,
            darkPathStarted: !1,
            whistleblowerChosen: null,
            innerCircleFormed: !1,
            secretsRevealed: 0,
        },
        keyCharacters: [],
        antagonists: [],
        allies: [],
        factions: {
            loyalists: { members: [], strength: 0, events: [] },
            opportunists: { members: [], strength: 0, events: [] },
            reformers: { members: [], strength: 0, events: [] },
            underground: { members: [], strength: 0, events: [] },
        },
        journal: [],
        persistentMemories: [],
        currentTimeline: 1,
        actData: {
            1: { startedAt: null, completedAt: null, spineEventsTriggered: [], majorChoices: [] },
            2: { startedAt: null, completedAt: null, spineEventsTriggered: [], majorChoices: [] },
            3: { startedAt: null, completedAt: null, spineEventsTriggered: [], majorChoices: [] },
            4: { startedAt: null, completedAt: null, spineEventsTriggered: [], majorChoices: [] },
            5: { startedAt: null, completedAt: null, spineEventsTriggered: [], majorChoices: [] },
        },
        emergentNarratives: { activeArcs: [], completedArcs: [], pendingMilestones: [] },
        recentThemes: [],
        recentEmotions: [],
        generatedEventCount: 0,
        lastStoryCheck: 0,
        settings: { storyEnabled: !0, autoShowEvents: !0, dramaticPauses: !0, showSubtleHints: !0 },
    }),
    tick() {
        if (!gameState.story?.settings?.storyEnabled || !isStoryEnabled()) return;
        if (
            document.getElementById("storyEventModal") ||
            document.getElementById("actTransitionCinematic") ||
            gameState.story.activeSpineEvent ||
            gameState.story.generatingSpineEvent
        )
            return;
        const e = Date.now();
        e - (gameState.story.lastStoryCheck || 0) < 3e4 ||
            ((gameState.story.lastStoryCheck = e),
            this.checkActProgression(),
            this.checkSpineEventTriggers(),
            this.checkEmergentNarratives(),
            this.checkMemorableMoments(),
            this.updateFactions(),
            this.updateStoryUI());
    },
    checkActProgression() {
        const e = gameState.story.currentAct;
        if (e >= 5) return;
        if (document.getElementById("storyEventModal") || document.getElementById("actTransitionCinematic")) return;
        const t = e + 1,
            n = this.ACT_CONFIG[t];
        if (!n) return;
        const a = n.triggerConditions;
        let o = !0;
        a.cash && gameState.cash < a.cash && (o = !1);
        const i = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus).length;
        if ((a.employees && i < a.employees && (o = !1), a.locations))
            for (const e of a.locations) {
                const t = gameState.locations.find((t) => t.id === e);
                if (!t || !t.owned) {
                    o = !1;
                    break;
                }
            }
        a.prestiges && gameState.prestigeLevel < a.prestiges && (o = !1),
            this.calculateActProgress(e),
            o && this.advanceToAct(t);
    },
    calculateActProgress(e) {
        const t = this.ACT_CONFIG[e],
            n = this.ACT_CONFIG[e + 1];
        if (!n) {
            const n = gameState.story.actData[e].spineEventsTriggered,
                a = t.spineEvents.length;
            return void (gameState.story.actProgress = Math.min(100, Math.round((n.length / a) * 100)));
        }
        const a = n.triggerConditions;
        let o = [];
        if (a.cash) {
            const e = Math.min(1, gameState.cash / a.cash);
            o.push(e);
        }
        if (a.employees) {
            const e = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus).length,
                t = Math.min(1, e / a.employees);
            o.push(t);
        }
        if (a.locations && a.locations.length > 0) {
            const e =
                a.locations.filter((e) => {
                    const t = gameState.locations.find((t) => t.id === e);
                    return t && t.owned;
                }).length / a.locations.length;
            o.push(e);
        }
        const i = gameState.story.actData[e].spineEventsTriggered,
            s = t.spineEvents.length;
        s > 0 && o.push(i.length / s);
        const r = o.length > 0 ? o.reduce((e, t) => e + t, 0) / o.length : 0;
        gameState.story.actProgress = Math.round(100 * r);
    },
    advanceToAct(e) {
        const t = gameState.story.currentAct;
        t !== e &&
            (document.getElementById("actTransitionCinematic")
                ? console.log("[StoryEngine] Act transition already in progress, skipping")
                : (gameState.story.actData[t] && (gameState.story.actData[t].completedAt = Date.now()),
                  (gameState.story.currentAct = e),
                  (gameState.story.actProgress = 0),
                  gameState.story.actData[e] && (gameState.story.actData[e].startedAt = Date.now()),
                  console.log(`[StoryEngine] ✨ Advanced to Act ${e}: ${this.ACT_CONFIG[e].name}`),
                  this.generateActTransitionEvent(t, e),
                  this.addJournalEntry({
                      title: `Chapter ${e}: ${this.ACT_CONFIG[e].name}`,
                      content: this.ACT_CONFIG[e].description,
                      type: "act_transition",
                      memorable: !0,
                  }),
                  this.updateStoryUI(),
                  this.showStoryNotification()));
    },
    checkSpineEventTriggers() {
        if (
            document.getElementById("storyEventModal") ||
            document.getElementById("actTransitionCinematic") ||
            gameState.story.activeSpineEvent ||
            gameState.story.generatingSpineEvent
        )
            return;
        const e = gameState.story.currentAct,
            t = this.ACT_CONFIG[e];
        if (!t) return;
        const n = gameState.story.actData[e].spineEventsTriggered;
        for (const e of t.spineEvents)
            if (!n.includes(e) && this.shouldTriggerSpineEvent(e)) {
                this.triggerSpineEvent(e);
                break;
            }
        Math.random() < 0.1 && this.checkFactionEvent();
        gameState.employees
            .filter((e) => e.hired && "active" === e.employmentStatus)
            .forEach((e) => {
                !e.characterArc && Math.random() < 0.2 && this.generateCharacterArc(e),
                    e.characterArc &&
                        !e.characterArc.discovered &&
                        Math.random() < 0.1 &&
                        this.checkCharacterArcDiscovery(e);
            });
    },
    shouldTriggerSpineEvent(e) {
        const t = gameState.story.narrativeFlags,
            n = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus).length;
        switch (e) {
            case "prologue":
                return !0;
            case "first_hire":
                return n >= 1 && !t.firstHireComplete;
            case "first_crisis":
                return (
                    n >= 2 &&
                    gameState.cash < 500 &&
                    gameState.story.actData[1].spineEventsTriggered.includes("first_hire")
                );
            case "garage_boss":
                return gameState.cash >= 5e3 && t.firstHireComplete;
            case "expansion_decision":
                const e = gameState.locations.find((e) => "home_office" === e.id);
                return e && e.owned;
            case "victoria_intro":
                return (
                    gameState.story.actData[2].spineEventsTriggered.includes("expansion_decision") &&
                    !t.victoriaIntroduced
                );
            case "the_whistleblower":
                return n >= 5 && t.victoriaIntroduced;
            case "inner_circle":
                return (
                    gameState.employees.filter(
                        (e) =>
                            e.hired &&
                            "active" === e.employmentStatus &&
                            (e.stats?.affection || 0) + (e.stats?.trust || 0) > 140
                    ).length >= 3 && !t.innerCircleFormed
                );
            case "factory_incident":
                const a = gameState.locations.find((e) => "factory" === e.id);
                return a && a.owned;
            case "the_consortium":
                return gameState.story.actData[3].spineEventsTriggered.includes("factory_incident");
            case "betrayal_arc":
                return (
                    gameState.employees.filter(
                        (e) =>
                            e.hired &&
                            "active" === e.employmentStatus &&
                            (e.stats?.trust || 50) < 40 &&
                            (e.career?.level || 0) >= 3
                    ).length > 0 && !t.betrayalDetected
                );
            case "point_of_no_return":
                return gameState.story.actData[3].spineEventsTriggered.length >= 3;
            case "hidden_world":
                const o = gameState.locations.find((e) => "headquarters" === e.id);
                return o && o.owned && !t.hiddenWorldRevealed;
            case "price_of_entry":
                return t.hiddenWorldRevealed && !t.eliteMembershipDecided;
            case "family_secrets":
                return (
                    t.victoriaIntroduced &&
                    gameState.story.actData[4].spineEventsTriggered.length >= 1 &&
                    !t.familySecretsRevealed
                );
            case "judgment_day":
                return gameState.story.actData[4].spineEventsTriggered.length >= 3 && !t.actFourClimaxed;
            case "velvet_invitation":
                return 5 === gameState.story.currentAct && !t.velvetInvitationReceived;
            case "ultimate_choice":
                return t.velvetInvitationReceived && Math.abs(gameState.story.moralScore) >= 50;
            case "endings":
                return t.ultimateChoiceMade && !t.endingTriggered;
            case "victoria_returns":
                return (
                    t.victoriaIntroduced &&
                    gameState.story.currentAct >= 3 &&
                    !t.victoriaReturned &&
                    Math.random() < 0.3
                );
            case "victoria_joins":
                return (
                    t.victoriaReturned &&
                    !t.victoriaJoined &&
                    (gameState.story.moralScore > 20 || t.victoriaRomancePath)
                );
            default:
                return !1;
        }
    },
    async triggerSpineEvent(e) {
        if (!isStoryEnabled()) return;
        if ((console.log(`[StoryEngine] 🎭 Triggering spine event: ${e}`), gameState.story.generatingSpineEvent))
            return void console.log(`[StoryEngine] ⚠️ Already generating a spine event, skipping: ${e}`);
        gameState.story.generatingSpineEvent = e;
        const t = gameState.story.currentAct;
        gameState.story.actData[t].spineEventsTriggered.includes(e) ||
            gameState.story.actData[t].spineEventsTriggered.push(e);
        const n = await this.generateSpineEventContent(e);
        if (((gameState.story.generatingSpineEvent = null), n)) {
            if (
                ((gameState.story.activeSpineEvent = n),
                n.imagePrompt && "function" == typeof queuedGenerateImage && !n.imageUrl)
            ) {
                const t = n;
                (async () => {
                    try {
                        const a =
                                "function" == typeof applyImageStyle
                                    ? applyImageStyle(n.imagePrompt)
                                    : n.imagePrompt,
                            o = await queuedGenerateImage(a, `Story event: ${n.title}`);
                        if (o) {
                            (t.imageUrl = o), debugLog("StoryEngine", `Image generated for spine event: ${e}`);
                            const n = document.getElementById("storyEventModal");
                            if (n) {
                                const e = n.querySelector("#storyEventImageSlot");
                                e &&
                                    (e.innerHTML = `<img src="${o}" style="width:100%; max-height:300px; object-fit:cover; border-radius:12px; margin:10px 0; box-shadow:0 4px 20px var(--l-veil-50);">`);
                            }
                            const a = (gameState.story?.journal || []).find((t) => t.eventKey === e && t.pending);
                            a && (a.imageUrl = o);
                        }
                    } catch (e) {
                        console.warn("[StoryEngine] Spine event image generation failed:", e);
                    }
                })();
            }
            this.addJournalEntry({
                title: n.title,
                content: n.cinematicText.substring(0, 300) + (n.cinematicText.length > 300 ? "..." : ""),
                type: "spine",
                eventKey: e,
                memorable: !0,
                pending: !0,
                fullCinematicText: n.cinematicText,
                imageUrl: n.imageUrl || null,
            }),
                gameState.story.settings.autoShowEvents
                    ? this.showStoryEventModal(n)
                    : (gameState.story.pendingEvents.push(n), this.showStoryNotification());
        }
        saveGame();
    },
    async generateSpineEventContent(e) {
        const t = gameState.story.currentAct,
            n = this.ACT_CONFIG[t],
            a = gameState.employees
                .filter((e) => e.hired && "active" === e.employmentStatus)
                .slice(0, 5)
                .map((e) => ({
                    name: e.name,
                    role: e.career?.title || "Employee",
                    trust: e.stats?.trust || 50,
                    affection: e.stats?.affection || 50,
                })),
            o = this.getEventTemplate(e);
        let i = null;
        try {
            "function" == typeof queuedGenerateText &&
                o.allowAI &&
                (i = await this.generateEventWithAI(e, n, a, o));
        } catch (e) {
            console.warn("[StoryEngine] AI generation failed, using template:", e);
        }
        return (
            i || (i = this.createEventFromTemplate(e, o, a)),
            this.applySpineCasting(i),
            (i.id = `spine_${e}_${Date.now()}`),
            (i.eventKey = e),
            (i.actNumber = t),
            (i.timestamp = Date.now()),
            (i.type = "spine"),
            i
        );
    },
    // Cast the player's real employees into authored spine roles (best-fit by
    // current stats). Victoria stays authored; internal roles are filled from the roster.
    castSpineRoles() {
        const pool = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus),
            fb = {
                whistleblower: "a trusted colleague",
                loyalist: "a loyal employee",
                rival: "an ambitious rival",
                confidant: "someone close to you",
                employee: "an employee",
                employee2: "another employee",
            };
        if (!pool.length) return fb;
        const v = (e, k, d = 50) => e.stats?.[k] ?? d,
            top = (fn, from = pool) => from.slice().sort((a, b) => fn(b) - fn(a))[0],
            rivalPool = pool.filter((e) => v(e, "trust") < 50);
        return {
            whistleblower: top((e) => 0.6 * v(e, "trust") + 0.4 * v(e, "productivity"))?.name || fb.whistleblower,
            loyalist: top((e) => v(e, "trust") + v(e, "affection"))?.name || fb.loyalist,
            rival: top((e) => v(e, "productivity"), rivalPool.length ? rivalPool : pool)?.name || fb.rival,
            confidant: top((e) => v(e, "affection") + v(e, "desire", 0))?.name || fb.confidant,
            employee: pool[0]?.name || fb.employee,
            employee2: pool[1]?.name || pool[0]?.name || fb.employee2,
        };
    },
    fillSpineRoles(text, map) {
        return text
            ? text.replace(/\{(whistleblower|loyalist|rival|confidant|employee2|employee)\}/g, (m, k) => map[k] || m)
            : text;
    },
    applySpineCasting(ev) {
        if (!ev) return ev;
        const map = this.castSpineRoles();
        ev.cinematicText && (ev.cinematicText = this.fillSpineRoles(ev.cinematicText, map)),
            ev.title && (ev.title = this.fillSpineRoles(ev.title, map)),
            (ev.choices || []).forEach((c) => {
                c.text && (c.text = this.fillSpineRoles(c.text, map)),
                    c.consequence && (c.consequence = this.fillSpineRoles(c.consequence, map));
            });
        return ev;
    },
    getEventTemplate: (e) =>
        ({
            prologue: {
                title: "🌅 A New Beginning",
                cinematicText:
                    'The garage door creaks open, letting in a sliver of morning light. This cramped space—cluttered with old boxes and forgotten dreams—is about to become the birthplace of something extraordinary.\n\nYou take a deep breath. No fancy office. No investors. No safety net. Just you, a laptop, and an idea that keeps you awake at night.\n\n*"Everyone starts somewhere,"* you think, fingers hovering over the keyboard. *"Let\'s see where this goes."*\n\nThe world doesn\'t know your name yet. But it will.',
                choices: [
                    {
                        id: "ambitious",
                        text: '💫 "I\'m going to build an empire."',
                        alignment: "ambitious",
                        consequence: "Your ambition burns bright. +Charisma, but you may push too hard.",
                    },
                    {
                        id: "humble",
                        text: '🙏 "One step at a time. Stay humble."',
                        alignment: "lawful",
                        consequence: "Patience and humility will serve you well. +Trust with future employees.",
                    },
                    {
                        id: "hungry",
                        text: '🔥 "Whatever it takes. No excuses."',
                        alignment: "ruthless",
                        consequence: "Your determination is unshakeable. But at what cost?",
                    },
                ],
                imagePrompt:
                    "A cramped garage workspace at dawn, morning light streaming through dusty windows, a single laptop glowing on a makeshift desk, boxes stacked in corners, hopeful atmosphere, cinematic lighting, the beginning of a journey",
                allowAI: !0,
                setFlags: [],
                followUpEvent: "first_hire",
            },
            first_hire: {
                title: "🤝 The First Believer",
                cinematicText:
                    'They stand in your garage, looking around at the "office" with an expression you can\'t quite read. Is it doubt? Amusement? Or... is that hope?\n\n"So this is it, huh?" they say, taking in the folding table, the extension cords, the motivational poster you stuck on the wall (slightly crooked, you notice now).\n\nYou open your mouth to apologize, to explain, to promise that this is temporary—\n\nBut they smile. Actually smile.\n\n"I\'ve worked in glass towers with people who had no soul. At least here..." they gesture at your modest setup, "...there\'s something real. Something that could actually matter."\n\nYour first employee. Your first believer.\n\nThis changes everything.',
                cinematicTextAI:
                    "Generate an emotional scene where the player's first employee arrives at the humble garage office. Include:\n- Their reaction to the modest workspace\n- A moment where they see potential instead of poverty\n- The weight of this moment - the first person to believe in your dream\n- End with hope and determination",
                choices: [
                    {
                        id: "partner",
                        text: '🤝 "We\'re partners in this. Equals."',
                        alignment: "light",
                        consequence:
                            "They beam. This person will remember you treated them as an equal from day one.",
                    },
                    {
                        id: "professional",
                        text: '💼 "Welcome aboard. Let\'s get to work."',
                        alignment: "neutral",
                        consequence: "Professional and focused. Sets clear expectations from the start.",
                    },
                    {
                        id: "honest",
                        text: "😅 \"I'll be honest—I have no idea what I'm doing.\"",
                        alignment: "humble",
                        consequence: "Your vulnerability builds trust. They appreciate your honesty.",
                    },
                    {
                        id: "promise",
                        text: '🌟 "Stick with me. I\'ll make us both rich."',
                        alignment: "ambitious",
                        consequence: "Bold promise. Now you have to deliver.",
                    },
                ],
                imagePrompt:
                    "A job interview in a garage startup, new employee looking around a humble workspace with a slight smile, morning light, folding table desk, motivational poster on wall, hopeful atmosphere, realistic, emotional moment",
                allowAI: !0,
                setFlags: ["firstHireComplete"],
                effectOnEmployee: !0,
            },
            first_crisis: {
                title: "⚠️ Sink or Swim",
                cinematicText:
                    "The numbers don't lie. They never do.\n\nYou stare at your bank balance, then at the stack of bills, then back at the balance. Even with creative accounting, there's no way to make this work. You're about to miss your first payment.\n\nYour employee looks up from their laptop. \"Everything okay, boss?\"\n\n*No,* you want to say. *We might be done before we even started.*\n\nBut something in you refuses to give up. Not yet. Not like this.\n\nThis is the moment. The one that separates the dreamers from the builders. What are you willing to do to survive?",
                choices: [
                    {
                        id: "hustle",
                        text: "💪 Double down. Work twice as hard.",
                        alignment: "determined",
                        consequence: "You work around the clock. Exhausting, but you might pull through.",
                    },
                    {
                        id: "pivot",
                        text: "🔄 Pivot. Find a new angle.",
                        alignment: "adaptive",
                        consequence: "Flexibility is strength. You find an unexpected opportunity.",
                    },
                    {
                        id: "risk",
                        text: "🎲 Take a big risk for a big reward.",
                        alignment: "risky",
                        consequence: "High stakes, high reward. This could make or break you.",
                    },
                    {
                        id: "help",
                        text: "🤲 Ask for help. Swallow your pride.",
                        alignment: "humble",
                        consequence: "Reaching out takes courage. You might be surprised who believes in you.",
                    },
                ],
                imagePrompt:
                    "A stressed entrepreneur in a garage office looking at bills and a laptop with concerning numbers, dim lighting, late night, scattered papers, empty coffee cups, tense atmosphere but with determination in their eyes",
                allowAI: !0,
                setFlags: [],
            },
            garage_boss: {
                title: "🦹 The Gatekeeper",
                cinematicText:
                    'Word travels fast in the business world. Too fast.\n\nYou\'ve heard the rumors—someone\'s been watching your little operation. Someone who doesn\'t like newcomers on their turf. Someone who thinks they can crush you before you even get started.\n\nAnd now they\'re here. Standing in the doorway of your garage like they own the place. Designer suit. Predator\'s smile. Eyes that have seen a thousand startups rise and fall.\n\n"Cute setup," they say, voice dripping with condescension. "Very... *scrappy*."\n\nThey step closer. "Let me make this simple. This neighborhood? These clients? They\'re mine. Have been for years. You can walk away now with your dignity intact..."\n\nThey lean in close. "...or I can teach you why that\'s a mistake."\n\nYour first real challenge. Your first real enemy.\n\nWhat do you do?',
                choices: [
                    {
                        id: "fight",
                        text: '⚔️ "Bring it. I\'m not going anywhere."',
                        alignment: "defiant",
                        consequence: "You stare them down. This means war—but you'll fight for what's yours.",
                    },
                    {
                        id: "negotiate",
                        text: '🤝 "Let\'s talk. Maybe we can both win."',
                        alignment: "diplomatic",
                        consequence: "Looking for common ground. Risky, but could avoid a costly battle.",
                    },
                    {
                        id: "outsmart",
                        text: '🧠 "Go ahead. Underestimate me."',
                        alignment: "cunning",
                        consequence: "Let them think they've won. Then strike when they least expect it.",
                    },
                    {
                        id: "comply",
                        text: '😔 "Fine. What do you want?"',
                        alignment: "submissive",
                        consequence: "Bowing to pressure now may haunt you later. But you survive another day.",
                    },
                ],
                imagePrompt:
                    "A tense confrontation in a garage office, an intimidating business person in an expensive suit confronting the protagonist, dramatic lighting, power dynamics, David vs Goliath scene, corporate thriller atmosphere",
                allowAI: !0,
                setFlags: [],
                triggersBossFight: !0,
            },
            expansion_decision: {
                title: "🏢 Growing Pains",
                cinematicText:
                    'The garage has become too small. Literally.\n\nYour team trips over each other. Clients raise eyebrows at the "unconventional" workspace. Your biggest monitor is balanced on a stack of old textbooks.\n\nBut moving means risk. Real rent. Real commitment. Real consequences if things go wrong.\n\nYour most trusted employee catches you staring at office listings. "What\'re you thinking, boss?"\n\nYou look around at the garage—at every coffee stain, every late night, every small victory etched into these walls.\n\n"I\'m thinking," you say slowly, "that it\'s time to level up."\n\nBut how?',
                choices: [
                    {
                        id: "big",
                        text: '🏢 "Go big. Get the nicest office we can afford."',
                        alignment: "ambitious",
                        consequence: "First impressions matter. But can you fill those shoes?",
                    },
                    {
                        id: "smart",
                        text: '📊 "Stay lean. Grow into our space."',
                        alignment: "pragmatic",
                        consequence: "Sustainable growth. Less flashy, but less risky.",
                    },
                    {
                        id: "hybrid",
                        text: '💡 "Remote-first. Spend on talent, not real estate."',
                        alignment: "innovative",
                        consequence: "Modern approach. Your team gains flexibility, but loses togetherness.",
                    },
                    {
                        id: "wait",
                        text: '⏳ "Not yet. We\'re not ready."',
                        alignment: "cautious",
                        consequence:
                            "Playing it safe. Sometimes the best move is no move. But will opportunity wait?",
                    },
                ],
                imagePrompt:
                    "A crowded but successful garage startup overflowing with equipment and happy employees, contrasted with an empty modern office space visible through a window or brochure, crossroads moment, decision time",
                allowAI: !0,
                setFlags: [],
            },
            victoria_intro: {
                title: "👠 The Shadow Steps Forward",
                cinematicText:
                    'You\'ve heard the name whispered in board rooms and feared in break rooms. Victoria Steele. The woman who turned a small consulting firm into a corporate empire—and crushed anyone who got in her way.\n\nNow she\'s standing in your new office, uninvited, looking at you like a cat studying a particularly interesting mouse.\n\n"I\'ve been watching you," she says, circling your desk slowly. "You\'ve got potential. Raw, unpolished potential."\n\nShe picks up a framed photo from your desk, examines it, sets it down with a dismissive flick.\n\n"You remind me of someone. Me, actually. Twenty years ago. Before I learned that this world has no room for idealists."\n\nShe stops in front of you, and for a moment, you see something almost like respect in her eyes.\n\n"Here\'s the deal. I could destroy you. Easily. But that would be boring." She smiles—a sharp, dangerous thing. "Instead, I\'m going to give you a choice. Join me... or become my greatest project."\n\n"Which will it be?"',
                choices: [
                    {
                        id: "defy",
                        text: "🔥 \"I'm not anyone's project. Bring it.\"",
                        alignment: "defiant",
                        consequence: "You've made a powerful enemy. But you've also earned her attention.",
                    },
                    {
                        id: "intrigue",
                        text: '🤔 "Tell me more about this... partnership."',
                        alignment: "calculating",
                        consequence: "Keep your enemies close. Very close. But can you trust her?",
                    },
                    {
                        id: "dismiss",
                        text: "👋 \"I don't have time for games. Door's that way.\"",
                        alignment: "independent",
                        consequence: "She laughs. Actually laughs. This isn't over.",
                    },
                    {
                        id: "admire",
                        text: '😏 "I\'ve heard about you. Impressive resume."',
                        alignment: "charismatic",
                        consequence:
                            "Flattery might get you everywhere. Or nowhere. With Victoria, it's hard to tell.",
                    },
                ],
                imagePrompt:
                    "A powerful intimidating businesswoman in designer clothing standing in a modern office, confident predatory stance, expensive jewelry, sharp intelligent eyes, office with city skyline behind, corporate thriller atmosphere, dramatic lighting",
                allowAI: !0,
                setFlags: ["victoriaIntroduced"],
                introducesCharacter: "victoria_steele",
            },
            the_whistleblower: {
                title: "⚖️ The Weight of Truth",
                cinematicText:
                    'The manila folder sits on your desk like a bomb.\n\n{whistleblower}—your most meticulous employee—found it. Financial inconsistencies. Falsified records. The kind of evidence that could bring down people far more powerful than you.\n\nAnd now they\'re in your office, looking at you with eyes that are equal parts scared and determined.\n\n"I don\'t know how deep this goes," they whisper, glancing at the door. "But if this is real... people need to know."\n\nYou pick up the folder. The papers inside are damning. Careers would end. Empires would crumble. Maybe even yours, if you\'re implicated by association.\n\n"What we do with this," {whistleblower} says quietly, "says everything about who we are."\n\nThey\'re right. This moment will define you.\n\nWhat do you do with the truth?',
                choices: [
                    {
                        id: "expose",
                        text: '📢 "Go public. The truth matters more than anything."',
                        alignment: "lawful",
                        consequence:
                            "Reputation boost, but major political fallout. You've made dangerous enemies. {whistleblower}'s trust soars.",
                    },
                    {
                        id: "bury",
                        text: '🔒 "Bury it. This isn\'t our fight."',
                        alignment: "dark",
                        consequence:
                            "Business continues, but {whistleblower} loses trust. Some secrets have a way of surfacing.",
                    },
                    {
                        id: "investigate",
                        text: '🔍 "Investigate privately. We need the full picture."',
                        alignment: "neutral",
                        consequence:
                            "A careful approach. More information, more control—but more time for things to go wrong.",
                    },
                    {
                        id: "leverage",
                        text: '💰 "This is leverage. Information is power."',
                        alignment: "ruthless",
                        consequence:
                            "Blackmail material. Very profitable, very dangerous. {whistleblower} may never forgive you.",
                    },
                ],
                imagePrompt:
                    "A tense office scene, a worried female employee showing documents to her boss, manila folder with papers, concerned expressions, modern office with blinds partially closed, dramatic shadows, corporate thriller atmosphere",
                allowAI: !0,
                setFlags: [],
                affectsFlag: "whistleblowerChosen",
            },
            inner_circle: {
                title: "👑 The Inner Circle",
                cinematicText:
                    'Something has changed. You feel it in the way certain people look at you now.\n\nThree of your most trusted employees have started... talking. About you. About the future. About what this company could become with the right leadership.\n\nThey approach you after hours, a united front.\n\n"We\'ve been watching how you lead," the spokesperson says. "The decisions you make. The way you treat people. And we\'ve decided: we believe in you."\n\nThey exchange glances, then look back at you with determination.\n\n"We want to form your inner circle. Your advisors. Your confidants. People who will tell you the hard truths and stand with you when things get difficult."\n\nThis is a milestone moment. Having trusted advisors can change everything—but it also means sharing power.\n\n*Three people offering their complete loyalty. What does that mean to you?*',
                choices: [
                    {
                        id: "accept_council",
                        text: "🤝 \"I'd be honored. Let's make this official.\"",
                        alignment: "diplomatic",
                        consequence: "You gain a council of advisors. Their combined wisdom will serve you well.",
                    },
                    {
                        id: "accept_humble",
                        text: '🙏 "I don\'t deserve this... but I accept."',
                        alignment: "humble",
                        consequence: "Your humility touches them. The bond deepens.",
                    },
                    {
                        id: "define_roles",
                        text: '📋 "I accept, but let\'s define clear roles and boundaries."',
                        alignment: "pragmatic",
                        consequence: "Structure provides clarity. The inner circle becomes a formal institution.",
                    },
                    {
                        id: "decline_gently",
                        text: '✋ "I appreciate this, but I prefer to stand alone."',
                        alignment: "independent",
                        consequence: "They nod, disappointed but respectful. Some doors, once closed, stay closed.",
                    },
                ],
                imagePrompt:
                    "Three loyal employees standing together in an office, serious determined expressions, sense of unity and purpose, dramatic lighting suggesting a pivotal moment, corporate setting with warm undertones",
                allowAI: !0,
                setFlags: ["innerCircleFormed"],
            },
            factory_incident: {
                title: "⚠️ The Factory Incident",
                cinematicText:
                    'The call comes at 3 AM.\n\n"There\'s been an accident at the factory. Equipment malfunction. Three workers injured."\n\nYour heart sinks as you drive through the empty streets. The factory floor is chaos—paramedics, managers shouting, the acrid smell of burnt machinery.\n\nYour lead foreman approaches, face ashen. "Boss, the equipment was due for maintenance. We flagged it six months ago. The purchase order for parts got... deprioritized."\n\nEyes turn to you. Everyone knows who approves the budgets.\n\nThe injured workers are being loaded into ambulances. One of them—an employee you hired personally—meets your gaze. No anger. Just... disappointment.\n\n*This is on you. What happens next matters.*',
                choices: [
                    {
                        id: "full_responsibility",
                        text: '🙏 "This is my fault. Full compensation, best care, whatever they need."',
                        alignment: "lawful",
                        consequence:
                            "Taking responsibility costs money but earns respect. The workers appreciate your honesty.",
                    },
                    {
                        id: "blame_management",
                        text: '👉 "Who let this slip through? Someone\'s getting fired."',
                        alignment: "ruthless",
                        consequence:
                            "You deflect blame downward. It works, but people notice how you handle crisis.",
                    },
                    {
                        id: "investigate_first",
                        text: '🔍 "Let\'s understand exactly what happened before we assign blame."',
                        alignment: "calculating",
                        consequence: "A measured response. The investigation will reveal uncomfortable truths.",
                    },
                    {
                        id: "cover_up",
                        text: '🔒 "Keep this quiet. Settle privately with the workers."',
                        alignment: "dark",
                        consequence:
                            "Secrets have a way of surfacing. But for now, the company image is preserved.",
                    },
                ],
                imagePrompt:
                    "A factory floor at night, emergency lights, workers and paramedics, damaged machinery, tense atmosphere, industrial setting with dramatic shadows, sense of crisis",
                allowAI: !0,
                setFlags: ["factoryIncidentOccurred"],
                gameplayEffects: {
                    full_responsibility: { type: "spend_cash", amount: 5e4 },
                    cover_up: { type: "add_flag", flag: "hiding_incident" },
                },
            },
            the_consortium: {
                title: "🐍 The Consortium",
                cinematicText:
                    'They call themselves "The Consortium"—the five most powerful business leaders in the industry. And they\'ve requested a meeting.\n\nThe invitation arrives on expensive paper, hand-delivered by a man in a tailored suit who waits for your response.\n\nYou\'ve heard whispers about this group. How they\'ve made and broken careers. How they control market forces like chess pieces. How crossing them means war.\n\nAt the meeting location—a private club you didn\'t know existed—you\'re shown to a oak-paneled room where five figures sit in shadow.\n\n"We\'ve been watching your rise," one says, voice like silk over steel. "Impressive. Perhaps too impressive. You\'re disrupting our... arrangements."\n\nAnother leans forward. "You have a choice. Join us—accept our guidance, share in our power, follow our rules. Or..."\n\nThe pause stretches.\n\n"...or we\'ll show you what happens to those who fly too close to the sun."\n\n*This is the big leagues. Play ball, or prepare for war?*',
                choices: [
                    {
                        id: "join_them",
                        text: '🤝 "I\'m listening. What are your terms?"',
                        alignment: "calculating",
                        consequence: "You negotiate entry into the elite. Power comes with strings attached.",
                    },
                    {
                        id: "defy_openly",
                        text: '🔥 "I built this without you. I don\'t need you now."',
                        alignment: "defiant",
                        consequence: "You declare war on the establishment. Bold. Possibly foolish.",
                    },
                    {
                        id: "play_both_sides",
                        text: '🎭 "I\'ll consider it... while exploring my options."',
                        alignment: "cunning",
                        consequence: "You buy time. But they're watching now.",
                    },
                    {
                        id: "gather_allies",
                        text: '🛡️ "I\'ll need to consult my people before deciding."',
                        alignment: "diplomatic",
                        consequence: "You refuse to be bullied. Your inner circle's advice will be crucial.",
                    },
                ],
                imagePrompt:
                    "A shadowy boardroom in an exclusive club, five silhouettes sitting around an ornate table, dramatic lighting, sense of power and menace, corporate thriller atmosphere",
                allowAI: !0,
                setFlags: ["consortiumIntroduced"],
            },
            betrayal_arc: {
                title: "🗡️ The Betrayal",
                cinematicText:
                    'The evidence is undeniable.\n\nSomeone in your inner circle—someone you trusted—has been feeding information to your competitors. Trade secrets. Strategic plans. Your calendar and contacts.\n\nYour security consultant lays it out: encrypted emails, suspicious money transfers, meetings that don\'t appear on any schedule.\n\n"We\'ve narrowed it down to three possibilities," she says, sliding three dossiers across the desk. "One of them is your traitor."\n\nYou stare at the photos. People you\'ve promoted. People you\'ve confided in. One of them betrayed you.\n\nThe consultant waits. "How do you want to handle this? We can confront them publicly, investigate quietly, or... there are other options."\n\n*Someone you trusted sold you out. How do you respond?*',
                choices: [
                    {
                        id: "public_confrontation",
                        text: '📢 "Bring all three in. We\'ll get the truth out in the open."',
                        alignment: "lawful",
                        consequence:
                            "A dramatic confrontation. The truth will emerge, but the innocent will suffer alongside the guilty.",
                    },
                    {
                        id: "quiet_investigation",
                        text: '🔍 "Continue surveillance. I want proof before I act."',
                        alignment: "calculating",
                        consequence: "Patience may reveal the truth, but every day the betrayal continues.",
                    },
                    {
                        id: "set_a_trap",
                        text: '🎭 "Feed each suspect different false information. See which leak appears."',
                        alignment: "cunning",
                        consequence: "A clever strategy. The traitor will reveal themselves.",
                    },
                    {
                        id: "forgive_all",
                        text: '💔 "Maybe I drove them to this. Let\'s talk before we accuse."',
                        alignment: "humble",
                        consequence: "Compassion even for traitors? Bold—or naive.",
                    },
                ],
                imagePrompt:
                    "Three employee dossiers spread on a desk, shadows and dramatic lighting, corporate thriller atmosphere, sense of suspicion and betrayal",
                allowAI: !0,
                setFlags: ["betrayalDetected"],
            },
            point_of_no_return: {
                title: "⚡ Point of No Return",
                cinematicText:
                    'Everything has led to this moment.\n\nThe consortium\'s ultimatum expires at midnight. Your rivals are circling. The board is demanding answers. Three different crises require your attention simultaneously.\n\nYour most trusted advisor finds you alone, staring out the window at the city lights.\n\n"You know," they say quietly, "you could still walk away. Sell the company. Take the money. Live quietly."\n\nThey pause. "But that\'s not who you are, is it?"\n\nYou\'ve fought too hard. Sacrificed too much. The person you were when you started—would they recognize who you\'ve become?\n\nThe phone rings. It\'s time to decide.\n\n*This is the moment everything changes. What kind of leader will you be?*',
                choices: [
                    {
                        id: "fight",
                        text: '⚔️ "No retreat. No surrender. We fight."',
                        alignment: "defiant",
                        consequence: "You commit to war. Whatever comes, you'll face it head-on.",
                    },
                    {
                        id: "negotiate",
                        text: '🤝 "There\'s always a deal to be made. Find common ground."',
                        alignment: "diplomatic",
                        consequence: "You seek peace through negotiation. Will your enemies respect it?",
                    },
                    {
                        id: "reinvent",
                        text: '🦋 "Maybe it\'s time to become something new entirely."',
                        alignment: "innovative",
                        consequence: "Transformation. Rebirth. Something unexpected.",
                    },
                    {
                        id: "reflect",
                        text: '🪞 "Who have I become? Is this what I wanted?"',
                        alignment: "humble",
                        consequence: "A moment of introspection before the storm. Clarity can be powerful.",
                    },
                ],
                imagePrompt:
                    "A person silhouetted against a night cityscape, contemplative mood, pivotal moment, dramatic lighting, corporate drama atmosphere",
                allowAI: !0,
                setFlags: ["actThreeClimaxed"],
            },
            hidden_world: {
                title: "🌙 The Hidden World",
                cinematicText:
                    'The invitation arrives in a black envelope, sealed with wax.\n\nInside: coordinates. A time. And a single line: "For those who have proven their worth."\n\nYour research reveals nothing—no business, no organization, nothing tied to these coordinates. Just an abandoned warehouse on the edge of the city.\n\nBut when you arrive at the appointed time, the warehouse transforms. Hidden doors reveal an elevator that descends far deeper than should be possible.\n\nWhen the doors open, you step into another world.\n\nCrystal chandeliers. People in masks and elegant attire. Laughter and whispered secrets. The air itself feels charged with possibility and danger.\n\nA host approaches, face hidden behind an ornate mask. "Welcome, newcomer. You\'ve been watching us from the outside for long enough. Tonight, you see what lies beneath."\n\n*A hidden society of power. The question is: what are you willing to do to belong?*',
                choices: [
                    {
                        id: "embrace_it",
                        text: '🎭 "Show me everything. I\'m ready."',
                        alignment: "ambitious",
                        consequence: "You dive into the deep end. Some doors, once opened, cannot be closed.",
                    },
                    {
                        id: "observe_first",
                        text: '👁️ "I\'ll watch tonight. Learn the rules before playing."',
                        alignment: "calculating",
                        consequence: "Patience is power. You gather information before committing.",
                    },
                    {
                        id: "question_motives",
                        text: '🤔 "Why me? Why now?"',
                        alignment: "pragmatic",
                        consequence: "Good questions. The answers may not be what you expect.",
                    },
                    {
                        id: "leave",
                        text: "🚪 \"This isn't my world. I don't belong here.\"",
                        alignment: "lawful",
                        consequence: "You walk away from temptation. But will they let you go so easily?",
                    },
                ],
                imagePrompt:
                    "A secret underground club, masked figures in elegant attire, chandeliers, mysterious and luxurious atmosphere, hints of danger and power",
                allowAI: !0,
                setFlags: ["hiddenWorldDiscovered", "darkPathStarted"],
            },
            price_of_entry: {
                title: "💎 The Price of Entry",
                cinematicText:
                    'They want you to join. Officially. Permanently.\n\nBut membership requires... proof of commitment.\n\nThe masked figure slides a folder across the table. Inside: details of a task. Something morally ambiguous at best. Potentially ruinous if it becomes public.\n\n"Everyone here has paid a price," they explain. "It binds us together. Ensures loyalty. Guarantees that secrets stay secret."\n\nYou look around the room. Powerful people—politicians, executives, celebrities—all watching. All having paid their own prices.\n\n"You have one week to decide. Complete the task, join us forever. Refuse..." The figure shrugs elegantly. "Well. Let\'s hope you have no skeletons we might... discover."\n\n*They\'re asking you to cross a line. Is power worth your soul?*',
                choices: [
                    {
                        id: "accept_task",
                        text: '✍️ "I\'ll do it. Whatever it takes."',
                        alignment: "ruthless",
                        consequence: "You commit to darkness. The price of power has been named and paid.",
                    },
                    {
                        id: "negotiate_terms",
                        text: '🤝 "I\'ll join, but I choose my own test."',
                        alignment: "calculating",
                        consequence: "You bargain for better terms. Impressive, if risky.",
                    },
                    {
                        id: "stall",
                        text: '⏳ "I need time to consider the implications."',
                        alignment: "cautious",
                        consequence: "You buy time, but patience is limited here.",
                    },
                    {
                        id: "refuse",
                        text: '✋ "No. I won\'t compromise who I am for membership."',
                        alignment: "lawful",
                        consequence: "You refuse corruption. Noble—but what happens to those who say no?",
                    },
                ],
                imagePrompt:
                    "A folder with a mysterious task document, candlelit private room, hands in shadow, sense of Faustian bargain, elegant yet menacing",
                allowAI: !0,
                setFlags: [],
                affectsFlag: "priceOfEntryChoice",
            },
            family_secrets: {
                title: "👁️ Family Secrets",
                cinematicText:
                    'The documents arrive anonymously. But the contents shake you to your core.\n\nVictoria Steele. Your rival. Your enemy. Your... sister?\n\nAdoption records. Birth certificates. DNA test results. The paper trail is extensive and verified.\n\nYou share a father—a man neither of you ever knew. A man who built an empire in the shadows and seeded rivals throughout the industry. Rivals who were, unknowingly, family.\n\nVictoria\'s face appears on your phone. She\'s seen the same documents.\n\n"Well," she says, voice unreadable. "This changes things."\n\nDoes it? You\'ve fought her for years. She\'s tried to destroy you. But blood...\n\n"We should talk," she continues. "In person. Neutral ground. Sister to... sibling."\n\n*Your greatest rival shares your blood. What now?*',
                choices: [
                    {
                        id: "meet_her",
                        text: '🤝 "Yes. We should talk. Let\'s finally understand each other."',
                        alignment: "diplomatic",
                        consequence: "Family is family. Even when it's complicated.",
                    },
                    {
                        id: "reject_revelation",
                        text: "🔒 \"Blood doesn't change anything. We're still rivals.\"",
                        alignment: "defiant",
                        consequence: "You refuse to let this change the game. But can you really ignore it?",
                    },
                    {
                        id: "investigate_further",
                        text: '🔍 "Before we talk, I need to know everything about our father."',
                        alignment: "calculating",
                        consequence: "Knowledge first. There's more to this story.",
                    },
                    {
                        id: "forge_alliance",
                        text: '👑 "If we\'re family... imagine what we could build together."',
                        alignment: "ambitious",
                        consequence: "Rivals becoming allies. The industry would tremble.",
                    },
                ],
                imagePrompt:
                    "Scattered documents revealing family secrets, photographs of two people who share features, dramatic lighting, sense of revelation and destiny",
                allowAI: !0,
                setFlags: ["familySecretRevealed"],
                affectsFlag: "victoriaRelationship",
            },
            judgment_day: {
                title: "⚖️ Judgment Day",
                cinematicText:
                    'They come for you in the morning.\n\nNot police. Worse. A consortium of everyone you\'ve ever wronged, united under a single banner. Investors you disappointed. Competitors you crushed. Employees you fired. Lovers you left.\n\nThey have lawyers. They have evidence. They have the ear of regulatory bodies.\n\n"You thought you were untouchable," their leader says. "You thought your money and your power made you immune. But today, everyone you\'ve hurt gets their say."\n\nThe charges are extensive. Some true. Some exaggerated. Some completely fabricated.\n\nYour legal team looks grim. "We can fight this, but it will take everything. Every dollar. Every favor. And the truth about your empire will come out."\n\n*The past has come to collect. How do you face judgment?*',
                choices: [
                    {
                        id: "fight_in_court",
                        text: '⚔️ "We fight every charge. I\'ve built too much to lose it now."',
                        alignment: "defiant",
                        consequence: "Total war. The truth will emerge—all of it.",
                    },
                    {
                        id: "settle_privately",
                        text: '💰 "Find out what they want. Everyone has a price."',
                        alignment: "calculating",
                        consequence: "You negotiate peace. Expensive, but quiet.",
                    },
                    {
                        id: "accept_responsibility",
                        text: "🙏 \"Where they're right, I'll own it. I've made mistakes.\"",
                        alignment: "humble",
                        consequence: "Admitting fault shows strength. Some will forgive. Others won't.",
                    },
                    {
                        id: "go_nuclear",
                        text: '💣 "They want war? I have secrets about THEM too."',
                        alignment: "ruthless",
                        consequence: "Mutually assured destruction. If you're going down, everyone burns.",
                    },
                ],
                imagePrompt:
                    "A boardroom confrontation, angry accusers on one side, defendant on the other, legal documents, tense atmosphere, sense of reckoning",
                allowAI: !0,
                setFlags: ["judgmentDayOccurred"],
            },
            velvet_invitation: {
                title: "🌟 The Velvet Invitation",
                cinematicText:
                    "The message appears not on paper, but woven into reality itself.\n\nYou wake to find a single line of text floating in the air above your bed, written in light: \"You have been chosen.\"\n\nWhen you reach for it, the words dissolve and reform into an address—a place that shouldn't exist, in a part of the city no map shows.\n\nYour research reveals mentions in ancient texts. Conspiracy theories. Whispers of an inner sanctum where the true masters of the world convene.\n\nNot money masters. Not political masters. Something older. Something that has guided human civilization from shadows older than history.\n\nThe invitation is clear: come alone, at the appointed time, ready to leave everything you know behind.\n\n*This is either the greatest opportunity of your existence—or its end. There's only one way to find out.*",
                choices: [
                    {
                        id: "go_alone",
                        text: '🚶 "I\'ve come too far to stop now. I go alone."',
                        alignment: "determined",
                        consequence: "You step beyond the veil. What lies beyond... changes everything.",
                    },
                    {
                        id: "bring_ally",
                        text: '👥 "I bring my most trusted ally. Some doors shouldn\'t be opened alone."',
                        alignment: "diplomatic",
                        consequence: "You bring backup. Will they thank you—or curse you?",
                    },
                    {
                        id: "investigate_first",
                        text: '🔍 "I need to understand what I\'m walking into."',
                        alignment: "calculating",
                        consequence: "Research reveals disturbing truths. Do you still go?",
                    },
                    {
                        id: "refuse_call",
                        text: '🚫 "Some power isn\'t worth having. I refuse the call."',
                        alignment: "humble",
                        consequence: "You turn away from transcendence. Peace—or regret?",
                    },
                ],
                imagePrompt:
                    "Ethereal glowing text floating in a dark room, mysterious invitation, dreamlike quality, sense of cosmic significance, liminal atmosphere",
                allowAI: !0,
                setFlags: ["velvetInvitationReceived"],
            },
            ultimate_choice: {
                title: "⚡ The Ultimate Choice",
                cinematicText:
                    'You stand in a chamber that defies geometry.\n\nAround you, the accumulated weight of your choices manifests as something visible—threads of light and shadow, woven into a tapestry that tells your story.\n\nA voice speaks from everywhere and nowhere: "You have shaped your fate with every decision. Now, one final choice remains."\n\nThree paths materialize before you:\n\nThe first glows with golden light—ascension, power, immortality. But it requires abandoning everything human about yourself.\n\nThe second pulses with warm earth tones—return to the mortal world, take your winnings, live out your days in comfort and peace.\n\nThe third shimmers with rainbow uncertainty—transformation into something entirely new, neither human nor immortal, but something unprecedented.\n\n*Every choice has led here. What do you choose?*',
                choices: [
                    {
                        id: "ascend",
                        text: '🌟 "I choose ascension. I will become more than human."',
                        alignment: "ambitious",
                        consequence: "You transcend mortality. But what have you lost?",
                    },
                    {
                        id: "return",
                        text: '🏠 "I choose to return. Humanity is enough."',
                        alignment: "humble",
                        consequence: "You walk away from ultimate power. Some would call that wisdom.",
                    },
                    {
                        id: "transform",
                        text: '🦋 "I choose the third path. Something new."',
                        alignment: "innovative",
                        consequence: "You become unprecedented. The universe has never seen your like.",
                    },
                    {
                        id: "refuse_all",
                        text: '✋ "I reject all choices. I forge my own path."',
                        alignment: "defiant",
                        consequence: "You reject destiny itself. Bold—or foolish?",
                    },
                ],
                imagePrompt:
                    "A cosmic chamber with three glowing paths, tapestry of light showing a life story, transcendent atmosphere, sense of ultimate destiny",
                allowAI: !0,
                setFlags: ["ultimateChoiceMade"],
                affectsFlag: "endingPath",
            },
            endings: {
                title: "📖 The End of the Beginning",
                cinematicText:
                    "The story reaches its conclusion.\n\nEverything you built. Everyone you touched. Every choice that brought you here—it all crystallizes into this moment.\n\nYour legacy is written. But what does it say?\n\nThe accountants will measure success in dollars. The historians in impact. But you know the true measure: the lives changed, the relationships forged, the person you became.\n\nLooking back at the journey—from a cramped garage to... wherever you now stand—you can finally see the pattern.\n\nWas it worth it?\n\n*There will be time for new stories. But first, honor this one. How do you reflect on your journey?*",
                choices: [
                    {
                        id: "proud",
                        text: '🏆 "I have no regrets. I built something meaningful."',
                        alignment: "determined",
                        consequence: "Pride in accomplishment. Your legacy will inspire.",
                    },
                    {
                        id: "humble_end",
                        text: '🙏 "I made mistakes. But I tried to do right."',
                        alignment: "humble",
                        consequence: "Humility at the end. Perhaps the greatest wisdom.",
                    },
                    {
                        id: "hungry",
                        text: '🔥 "This was just the beginning. There\'s more to build."',
                        alignment: "ambitious",
                        consequence: "The fire still burns. New stories await.",
                    },
                    {
                        id: "peaceful",
                        text: "☮️ \"I'm ready to rest now. It's been enough.\"",
                        alignment: "pragmatic",
                        consequence: "Peace at last. Sometimes the greatest victory is knowing when to stop.",
                    },
                ],
                imagePrompt:
                    "A reflective scene, person looking out at vast landscape, sunset or sunrise, sense of completion and new beginning, emotional and contemplative",
                allowAI: !0,
                setFlags: ["storyCompleted"],
                triggersEnding: !0,
            },
            victoria_returns: {
                title: "👠 Victoria's Return",
                cinematicText:
                    "You thought you'd seen the last of her.\n\nVictoria Steele appears in your lobby, flanked by new lawyers and a predator's smile. Her empire was supposed to crumble after your last encounter. Instead, she's rebuilt—stronger, leaner, angrier.\n\n\"Did you really think one defeat would stop me?\" She laughs, and it's not pleasant. \"I've been waiting for this moment. Planning it.\"\n\nShe slides a folder across your security desk. Inside: documents that could end your company. Evidence she's been collecting. Weapons she's been forging.\n\n\"But I'm not here to destroy you today,\" she continues. \"I'm here to offer you something better. A partnership. Together, we could rule this industry. Apart...\" She shrugs elegantly. \"Well. You've seen what I can do.\"\n\n*Victoria offers an alliance—but can you trust your greatest enemy?*",
                choices: [
                    {
                        id: "alliance",
                        text: '🤝 "Maybe we\'ve been fighting the wrong war. Talk to me."',
                        alignment: "diplomatic",
                        consequence: "You consider alliance with your nemesis. The enemy of my enemy...",
                    },
                    {
                        id: "defiance",
                        text: '🔥 "You want war? You\'ll get it. Again."',
                        alignment: "defiant",
                        consequence: "Round two begins. This time, only one of you walks away.",
                    },
                    {
                        id: "negotiate",
                        text: '💼 "What exactly are you proposing? Details."',
                        alignment: "calculating",
                        consequence: "You negotiate from strength. What does she really want?",
                    },
                    {
                        id: "expose",
                        text: "📢 \"I'm done with threats. Let's let the public decide.\"",
                        alignment: "lawful",
                        consequence: "You take the fight public. Transparency as weapon.",
                    },
                ],
                imagePrompt:
                    "Victoria Steele in a corporate lobby, confident and dangerous, lawyers behind her, dramatic lighting, corporate thriller atmosphere, power dynamics",
                allowAI: !0,
                setFlags: [],
                requiresFlag: "victoriaDefeated",
            },
            victoria_joins: {
                title: "👑 An Unlikely Alliance",
                cinematicText:
                    'Victoria Steele stands in YOUR office now—as an employee.\n\nThe irony isn\'t lost on either of you. She signs the contract with a wry smile.\n\n"Don\'t think this makes us friends," she says, pen moving with practiced elegance. "You won. Fair and square. I respect that. And I\'d rather help you build something than watch from the sidelines."\n\nBut having Victoria Steele in your organization is like having a tiger on a leash. Beautiful. Powerful. Always one wrong move from chaos.\n\nYour other employees watch nervously. Some whisper about favoritism. Others about security risks. A few look excited—having Victoria Steele on your team is a statement.\n\nShe catches your eye. "So, boss. What\'s my first assignment?"\n\n*Your greatest rival is now your subordinate. How do you handle this?*',
                choices: [
                    {
                        id: "test_her",
                        text: "💪 \"The hardest challenge I have. Let's see what you're made of.\"",
                        alignment: "ambitious",
                        consequence: "You throw her into the deep end. She either proves herself or drowns.",
                    },
                    {
                        id: "integrate_slowly",
                        text: '📋 "Start small. Earn the team\'s trust."',
                        alignment: "pragmatic",
                        consequence: "A measured approach. Let her prove herself gradually.",
                    },
                    {
                        id: "make_partner",
                        text: '🤝 "Forget employee. Let\'s talk partnership."',
                        alignment: "diplomatic",
                        consequence: "You elevate her immediately. A bold statement.",
                    },
                    {
                        id: "keep_close",
                        text: '👁️ "You\'ll work directly with me. Where I can watch you."',
                        alignment: "calculating",
                        consequence: "Keep your enemies closer. Trust but verify.",
                    },
                ],
                imagePrompt:
                    "Victoria Steele signing a contract in a modern office, complex expression mixing pride and acceptance, dramatic moment of alliance",
                allowAI: !0,
                setFlags: ["victoriaJoined"],
                requiresFlag: "victoriaRecruited",
            },
        })[e] || {
            title: "📜 Untold Chapter",
            cinematicText: "A new chapter of your story unfolds...",
            choices: [
                { id: "continue", text: "Continue...", alignment: "neutral", consequence: "The story continues." },
            ],
            allowAI: !0,
        },
    async generateEventWithAI(e, t, n, a) {
        if (!a.allowAI || "function" != typeof queuedGenerateText) return null;
        const o = gameState.story.narrativeFlags,
            i = `You are the MASTER STORYTELLER for an office management game. Your writing should be:\n- Emotionally resonant and engaging\n- Cinematic with vivid imagery\n- Appropriate to the tone: ${t.tone}\n- Grounded in the player's actual employees and situation\n\nCURRENT STATE:\n- Act: ${t.name}\n- Company Cash: ${formatCash(gameState.cash)}\n- Employees: ${n.map((e) => `${e.name} (${e.role}, trust:${e.trust}, affection:${e.affection})`).join(", ")}\n- Moral Score: ${gameState.story.moralScore}/100\n- Story Flags: ${JSON.stringify(o)}\n\nEVENT: "${e}"\nBASE TEMPLATE TITLE: "${a.title}"\nTEMPLATE MOOD/THEMES: ${a.cinematicTextAI || a.cinematicText.substring(0, 200)}\n\nGenerate a personalized version of this story moment that:\n1. References actual employee names if relevant\n2. Reflects the player's moral alignment so far\n3. Adds unique details that make this feel fresh\n4. Maintains emotional impact\n\nRESPOND IN STRICT JSON (no markdown):\n{\n  "title": "Event title with emoji",\n  "cinematicText": "2-4 paragraphs of evocative narrative text. Use *italics* for internal thoughts. Be vivid and emotional.",\n  "choices": [\n    {"id": "choice_a", "text": "Choice text with emoji", "alignment": "lawful/chaotic/light/dark/neutral/ambitious", "consequence": "Brief hint at consequences"}\n  ],\n  "imagePrompt": "Detailed visual description for image generation"\n}`;
        try {
            const t = await queuedGenerateText(i, {}, `Story Event: ${e}`);
            let n = t;
            const o = t.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (o) n = o[1].trim();
            else {
                const e = t.match(/\{[\s\S]*\}/);
                e && (n = e[0]);
            }
            const s = JSON.parse(n);
            return { ...a, ...s, choices: s.choices || a.choices };
        } catch (e) {
            return console.warn("[StoryEngine] AI parsing failed:", e), null;
        }
    },
    createEventFromTemplate(e, t, n) {
        let a = t.cinematicText;
        return (
            n.length > 0 && a.includes("{employee}") && (a = a.replace(/{employee}/g, n[0].name)),
            {
                title: t.title,
                cinematicText: a,
                choices: t.choices,
                imagePrompt: t.imagePrompt,
                setFlags: t.setFlags || [],
                affectsFlag: t.affectsFlag,
            }
        );
    },
    // Authored arc skeletons cast onto the player's real employees. Each stage tests
    // real stat thresholds; advancing emits a journal beat (surfaced in the Chronicle).
    ARC_TYPES: {
        loyalist: {
            name: "The Loyalist",
            emoji: "🛡️",
            stages: [
                {
                    name: "Devoted",
                    test: (e) => (e.stats?.trust || 50) >= 70 && (e.stats?.affection || 50) >= 60,
                    beat: (e) => `${e.name} has your back without being asked. Whatever you're building, they're in.`,
                },
                {
                    name: "Confidant",
                    test: (e) => (e.stats?.trust || 50) >= 85 && (e.stats?.affection || 50) >= 75 && (e.stats?.friendship || 50) >= 60,
                    beat: (e) => `${e.name} is the one you'd tell things you wouldn't put in an email. A genuine confidant now.`,
                },
                {
                    name: "Right Hand",
                    memorable: !0,
                    test: (e) => (e.stats?.trust || 50) >= 92 && (e.stats?.affection || 50) >= 85,
                    beat: (e) => `${e.name} would follow you out the door if you left tomorrow. Your right hand — earned, not bought.`,
                },
            ],
        },
        climber: {
            name: "The Climber",
            emoji: "📈",
            stages: [
                {
                    name: "Ambitious",
                    test: (e) => (e.stats?.productivity || 50) >= 75 && (e.stats?.trust || 50) < 70,
                    beat: (e) => `${e.name} is putting in the numbers — and making sure you notice. There's an angle here.`,
                },
                {
                    name: "Hungry",
                    test: (e) => (e.stats?.productivity || 50) >= 85 && (e.career?.level || 1) >= 2 && (e.stats?.trust || 50) < 60,
                    beat: (e) => `${e.name} wants more, faster. The ambition is useful — right up until it isn't.`,
                },
                {
                    name: "Eyeing Your Chair",
                    memorable: !0,
                    test: (e) => (e.stats?.productivity || 50) >= 90 && (e.stats?.trust || 50) < 45,
                    beat: (e) => `${e.name} doesn't want a promotion anymore. They want your seat. Keep an eye on this one.`,
                },
            ],
        },
        disillusioned: {
            name: "The Disillusioned",
            emoji: "💢",
            stages: [
                {
                    name: "Frustrated",
                    test: (e) => (e.stats?.trust || 50) < 45 && (e.stats?.comfort || 60) < 50,
                    beat: (e) => `${e.name} has stopped pretending everything's fine. The frustration is showing.`,
                },
                {
                    name: "Resentful",
                    test: (e, c) => (e.stats?.trust || 50) < 30 && ((e.stats?.comfort || 60) < 35 || c.arrears > 0),
                    beat: (e) => `${e.name} keeps a private ledger of every slight now. Resentment has set in.`,
                },
                {
                    name: "Flight Risk",
                    memorable: !0,
                    test: (e) => (e.stats?.trust || 50) < 18,
                    beat: (e) => `${e.name} is one bad day from walking. If you want to keep them, it's now or never.`,
                },
            ],
        },
        burnout: {
            name: "Burning Out",
            emoji: "🕯️",
            stages: [
                {
                    name: "Strained",
                    test: (e) => (e.stats?.comfort || 60) < 40 && (e.stats?.productivity || 50) >= 60,
                    beat: (e) => `${e.name} is running hot — still delivering, but the strain is visible.`,
                },
                {
                    name: "Exhausted",
                    test: (e) => (e.stats?.comfort || 60) < 28 && (e.stats?.productivity || 50) >= 55,
                    beat: (e) => `${e.name} is running on fumes. The output is holding; the person underneath isn't.`,
                },
                {
                    name: "At the Breaking Point",
                    memorable: !0,
                    test: (e) => (e.stats?.comfort || 60) < 18,
                    beat: (e) => `${e.name} has nothing left to give. Something's about to break — them, or their work.`,
                },
            ],
        },
        rival: {
            name: "The Rival",
            emoji: "⚔️",
            stages: [
                {
                    name: "Competitive",
                    test: (e) => (e.career?.level || 1) >= 3 && (e.stats?.productivity || 50) >= 75 && (e.stats?.trust || 50) < 55,
                    beat: (e) => `${e.name} treats every meeting like a scoreboard. Talented, and not on your side.`,
                },
                {
                    name: "Scheming",
                    test: (e) => (e.career?.level || 1) >= 4 && (e.stats?.trust || 50) < 40,
                    beat: (e) => `${e.name} is building something of their own inside your walls. Allies, leverage, options.`,
                },
                {
                    name: "Open Challenge",
                    memorable: !0,
                    test: (e) => (e.career?.level || 1) >= 5 && (e.stats?.trust || 50) < 30,
                    beat: (e) => `${e.name} isn't hiding it anymore. This is a rivalry now, out in the open.`,
                },
            ],
        },
        confidant: {
            name: "The Spark",
            emoji: "💗",
            requiresAdult: !0,
            stages: [
                {
                    name: "A Spark",
                    test: (e) => (e.stats?.affection || 50) >= 65 && (e.stats?.desire || 0) >= 55,
                    beat: (e) => `There's something between you and ${e.name} that isn't on any org chart.`,
                },
                {
                    name: "Entangled",
                    test: (e) => (e.stats?.affection || 50) >= 80 && (e.stats?.desire || 0) >= 70,
                    beat: (e) => `Whatever this is with ${e.name}, it's past deniable now.`,
                },
                {
                    name: "Devoted to You",
                    memorable: !0,
                    test: (e) => (e.stats?.affection || 50) >= 90 && (e.stats?.desire || 0) >= 80,
                    beat: (e) => `${e.name} is yours, completely — and everyone in the building can feel it.`,
                },
            ],
        },
    },
    emitArcBeat(e, t, n) {
        this.addJournalEntry({
            title: `${t.emoji} ${e.name}: ${n.name}`,
            content: n.beat(e),
            type: "arc",
            memorable: !!n.memorable,
        });
    },
    getActiveArcsForEmployee(e) {
        return (gameState.story?.emergentNarratives?.activeArcs || []).filter((t) => t.employeeId === e);
    },
    checkEmergentNarratives() {
        const en = gameState.story.emergentNarratives;
        if (!en) return;
        en.activeArcs || (en.activeArcs = []);
        en.completedArcs || (en.completedArcs = []);
        const emps = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus),
            ctx = { arrears: gameState.payroll?.arrears?.missedCount || 0 },
            MAX_ACTIVE = 10,
            MAX_PER_EMP = 2,
            adult = this.isAdultContentEnabled();
        for (const emp of emps)
            for (const arcType of Object.keys(this.ARC_TYPES)) {
                const def = this.ARC_TYPES[arcType];
                if (def.requiresAdult && !adult) continue;
                const existing = en.activeArcs.find((a) => a.employeeId === emp.id && a.arcType === arcType);
                if (existing) {
                    const next = existing.stage + 1;
                    def.stages[next] &&
                        def.stages[next].test(emp, ctx) &&
                        ((existing.stage = next),
                        (existing.stageName = def.stages[next].name),
                        (existing.lastAdvancedAt = gameState.time?.currentTime || Date.now()),
                        this.emitArcBeat(emp, def, def.stages[next]));
                    continue;
                }
                if (en.activeArcs.length >= MAX_ACTIVE) continue;
                if (en.activeArcs.filter((a) => a.employeeId === emp.id).length >= MAX_PER_EMP) continue;
                if (def.stages[0].test(emp, ctx)) {
                    const t = gameState.time?.currentTime || Date.now();
                    en.activeArcs.push({
                        id: `arc_${emp.id}_${arcType}`,
                        arcType,
                        name: def.name,
                        emoji: def.emoji,
                        employeeId: emp.id,
                        employeeName: emp.name,
                        participants: [emp.id, emp.name],
                        stage: 0,
                        stageName: def.stages[0].name,
                        startedAt: t,
                        lastAdvancedAt: t,
                    }),
                        this.emitArcBeat(emp, def, def.stages[0]);
                }
            }
        // Retire arcs for employees who have left the company.
        const activeIds = new Set(emps.map((e) => e.id));
        if (en.activeArcs.some((a) => !activeIds.has(a.employeeId))) {
            en.completedArcs.push(...en.activeArcs.filter((a) => !activeIds.has(a.employeeId)));
            en.activeArcs = en.activeArcs.filter((a) => activeIds.has(a.employeeId));
            en.completedArcs.length > 50 && (en.completedArcs = en.completedArcs.slice(-50));
        }
    },
    // Fires a journal "moment" once per signature, then suppresses it for `days`
    // of game-time so rare beats stay rare. Returns true if it's allowed to fire now.
    momentReady(sig, days = 30) {
        gameState.story.momentCooldowns || (gameState.story.momentCooldowns = {});
        const now = gameState.time?.currentTime || Date.now(),
            last = gameState.story.momentCooldowns[sig];
        return last && now - last < days * 864e5 ? !1 : ((gameState.story.momentCooldowns[sig] = now), !0);
    },
    // Screenshot-worthy one-offs born from rare confluences of REAL game state.
    checkMemorableMoments() {
        if (!isStoryEnabled() || !gameState.story) return;
        const pool = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus);
        if (!pool.length) return;
        const arcs = gameState.story.emergentNarratives?.activeArcs || [],
            byId = (id) => pool.find((e) => e.id === id),
            v = (e, k, d = 50) => e?.stats?.[k] ?? d,
            emit = (sig, title, content) =>
                this.momentReady(sig) && this.addJournalEntry({ title, content, type: "moment", memorable: !0 });
        // Favoritism: a romance you've ranked above a longer-loyal employee.
        const romance = arcs.find((a) => "confidant" === a.arcType),
            loyalArc = arcs.find((a) => "loyalist" === a.arcType && (!romance || a.employeeId !== romance.employeeId));
        if (romance && loyalArc) {
            const rE = byId(romance.employeeId),
                lE = byId(loyalArc.employeeId);
            rE && lE && (rE.career?.level || 1) > (lE.career?.level || 1) &&
                emit(
                    `fav_${rE.id}_${lE.id}`,
                    "💫 The Office Knows",
                    `You've moved ${rE.name} up the ladder fast. ${lE.name}—loyal to you long before there was anything to be loyal to—says nothing. But everyone sees it.`
                );
        }
        // The most loyal person is also the worst paid.
        if (loyalArc && pool.length >= 3) {
            const lE = byId(loyalArc.employeeId),
                sal = pool.map((e) => e.career?.salary || 0),
                minSal = Math.min(...sal);
            lE && minSal > 0 && (lE.career?.salary || 0) === minSal &&
                emit(
                    `underpaid_${lE.id}`,
                    "💫 Cheapest Devotion",
                    `${lE.name} is the most loyal person in the building and the lowest paid. They've never brought it up. That's the part that should keep you awake.`
                );
        }
        // A rival who now out-produces everyone you trust.
        const rivalArc = arcs.find((a) => "rival" === a.arcType);
        if (rivalArc) {
            const rE = byId(rivalArc.employeeId),
                topProd = pool.slice().sort((a, b) => v(b, "productivity") - v(a, "productivity"))[0];
            rE && topProd && topProd.id === rE.id &&
                emit(
                    `rival_top_${rE.id}`,
                    "💫 The Crown Slips",
                    `${rE.name} now out-produces everyone—including the people you actually trust. The numbers are undeniable, and they know you know.`
                );
        }
        // Quiet exodus: three or more people souring at once.
        const souring = arcs.filter((a) => "disillusioned" === a.arcType && a.stage >= 1);
        souring.length >= 3 &&
            emit(
                "exodus_risk",
                "💫 The Floor Tilts",
                `${souring
                        .slice(0, 3)
                        .map((a) => a.employeeName)
                        .join(", ")} are all quietly done. You can feel the ground shifting under the whole company.`
            );
        // Your brightest candle, burning out.
        const burnArc = arcs.find((a) => "burnout" === a.arcType);
        if (burnArc && pool.length >= 4) {
            const bE = byId(burnArc.employeeId),
                topProd = pool.slice().sort((a, b) => v(b, "productivity") - v(a, "productivity"))[0];
            bE && topProd && topProd.id === bE.id &&
                emit(
                    `burnout_star_${bE.id}`,
                    "💫 Burning the Brightest",
                    `${bE.name} is your best worker and your most exhausted. You're burning your brightest candle at both ends—and someone's going to be left in the dark.`
                );
        }
        // The mood of the whole room.
        if (pool.length >= 5) {
            const avgAff = pool.reduce((s, e) => s + v(e, "affection"), 0) / pool.length,
                avgTrust = pool.reduce((s, e) => s + v(e, "trust"), 0) / pool.length;
            avgAff >= 80 &&
                emit(
                    "beloved",
                    "💫 They Actually Like It Here",
                    "Walk the floor and you can feel it—people genuinely want to be here, working for you. That's rare air. Don't take it for granted."
                );
            avgTrust <= 30 && (gameState.story.moralScore || 50) <= 25 &&
                emit(
                    "feared",
                    "💫 No One Meets Your Eyes",
                    "The hallways have gone quiet around you. They work harder than ever. They also lie to you more than ever. Fear is a tool with a short handle."
                );
        }
        // Factional clash: two blocs both strong at once.
        const FA = gameState.story.factions;
        if (FA) {
            const strong = Object.keys(FA).filter((k) => FA[k].strength >= 3 && FA[k].strength / pool.length >= 0.3);
            if (strong.length >= 2) {
                const two = strong.slice().sort((a, b) => FA[b].strength - FA[a].strength).slice(0, 2),
                    names = two.map((k) => FA[k].figureheadName || k);
                emit(
                    `clash_${two.slice().sort().join("_")}`,
                    "💫 Lines Are Drawn",
                    `The ${two[0]} and the ${two[1]} are both ascendant, and the building can feel the pull. ${names[0]} and ${names[1]} have stopped pretending to get along.`
                );
            }
        }
    },
    // Classification 2.0: score each employee's lean toward each bloc from stats
    // AND their active arcs. Assign only if the strongest lean clears MIN_LEAN —
    // otherwise the employee is Unaligned (left out of every bloc). Each non-empty
    // bloc gets a figurehead (its most strongly-aligned real member).
    updateFactions() {
        const emps = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus),
            F = gameState.story.factions;
        for (const k of Object.keys(F)) ((F[k].members = []), (F[k].figureheadId = null), (F[k].figureheadName = null));
        const v = (e, k, d = 50) => e.stats?.[k] ?? d,
            arcsOf = (e) =>
                "function" == typeof this.getActiveArcsForEmployee ? this.getActiveArcsForEmployee(e.id).map((a) => a.arcType) : [],
            arrears = gameState.payroll?.arrears?.missedCount || 0,
            MIN_LEAN = 35,
            pick = {};
        for (const e of emps) {
            const trust = v(e, "trust"),
                aff = v(e, "affection"),
                prod = v(e, "productivity"),
                comf = v(e, "comfort", 60),
                arcs = arcsOf(e),
                has = (t) => arcs.includes(t),
                grey = ["private_club", "velvet_room", "inner_sanctum"].includes(e.locationId),
                reformerFlag = hasFlag && (hasFlag(e, "questions_ethics") || hasFlag(e, "idealist")),
                scores = {
                    loyalists: 0.7 * (trust - 50) + 0.7 * (aff - 50) + (has("loyalist") ? 30 : 0) + (has("confidant") ? 20 : 0),
                    opportunists: 0.8 * (prod - 55) + 0.5 * (55 - trust) + (has("climber") ? 28 : 0) + (has("rival") ? 28 : 0),
                    reformers: 0.6 * (55 - comf) + (reformerFlag ? 35 : 0) + (has("disillusioned") ? 30 : 0) + (has("burnout") ? 18 : 0) + (arrears > 0 ? 15 : 0),
                    underground: (grey ? 45 : 0) + (trust < 30 && prod > 70 ? 25 : 0) + (has("rival") && trust < 35 ? 15 : 0),
                };
            let best = null,
                bestScore = -Infinity;
            for (const k of Object.keys(scores)) scores[k] > bestScore && ((bestScore = scores[k]), (best = k));
            best &&
                bestScore >= MIN_LEAN &&
                (F[best].members.push(e.id),
                (!pick[best] || bestScore > pick[best].score) && (pick[best] = { id: e.id, name: e.name, score: bestScore }));
        }
        for (const k of Object.keys(F))
            ((F[k].strength = F[k].members.length),
            pick[k] && ((F[k].figureheadId = pick[k].id), (F[k].figureheadName = pick[k].name)));
        // F2: derive light, bounded passive effects from ascendant blocs (≥30% & ≥3).
        const total = emps.length,
            ASCEND_SHARE = 0.3,
            ASCEND_MIN = 3,
            isAsc = (k) => total > 0 && F[k].strength >= ASCEND_MIN && F[k].strength / total >= ASCEND_SHARE,
            fe = {
                incomeMult: 1,
                attritionMult: 1,
                ascendant: {
                    loyalists: isAsc("loyalists"),
                    opportunists: isAsc("opportunists"),
                    reformers: isAsc("reformers"),
                    underground: isAsc("underground"),
                },
                reformerDemand: { active: !1, met: !1 },
                underground: { active: !1 },
            };
        fe.ascendant.loyalists && (fe.attritionMult *= 0.6);
        fe.ascendant.opportunists && ((fe.incomeMult *= 1.05), (fe.attritionMult *= 1.4));
        fe.ascendant.reformers &&
            ((fe.reformerDemand.active = !0), (fe.reformerDemand.met = 0 === (gameState.payroll?.arrears?.missedCount || 0)));
        fe.ascendant.underground && (fe.underground.active = !0);
        (fe.incomeMult = Math.max(0.9, Math.min(1.1, fe.incomeMult))),
            (fe.attritionMult = Math.max(0.4, Math.min(2, fe.attritionMult))),
            (gameState.story.factionEffects = fe);
    },
    showStoryEventModal(e) {
        const t = document.getElementById("storyEventModal");
        if ((t && t.remove(), !e || !e.choices || !Array.isArray(e.choices) || 0 === e.choices.length))
            return (
                console.error("[StoryEngine] Cannot show story modal - invalid event or missing choices:", e),
                (gameState.story.activeSpineEvent = null),
                void (
                    "function" == typeof showNotification &&
                    showNotification("Story event failed to load properly. Skipping...", "warning")
                )
            );
        (gameState.story.activeSpineEvent && gameState.story.activeSpineEvent.id === e.id) ||
            (console.log(
                `[StoryEngine] Setting activeSpineEvent for modal: ${e.id} (was: ${gameState.story.activeSpineEvent?.id || "null"})`
            ),
            (gameState.story.activeSpineEvent = e));
        const n = document.createElement("div");
        (n.id = "storyEventModal"),
            (n.className = "story-modal-overlay"),
            (n.style.cssText =
                "\n        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n        background: var(--l-veil-95); z-index: 100001;\n        display: flex; justify-content: center; align-items: center;\n        animation: storyFadeIn 0.8s ease-out;\n        padding: 20px; box-sizing: border-box;\n      ");
        let a = "";
        e.characters &&
            e.characters.length > 0 &&
            (a = `\n          <div style="display:flex; justify-content:center; gap:20px; margin:20px 0;">\n            ${e.characters.map((e) => `\n              <div style="text-align:center;">\n                <div style="width:60px; height:60px; background:var(--surface-2); border-radius:50%; border:2px solid var(--l-indigo); margin:0 auto 8px; display:flex; align-items:center; justify-content:center; font-size:1.5rem;">👤</div>\n                <div style="color:var(--l-ink); font-size:0.85rem; font-weight:600;">${e.name}</div>\n                <div style="color:var(--text-dim); font-size:0.75rem;">${e.role || ""}</div>\n              </div>\n            `).join("")}\n          </div>\n        `);
        const o = e.choices
            .map((t) => {
                const n =
                        {
                            lawful: "var(--l-green)",
                            light: "var(--l-cyan)",
                            neutral: "var(--l-gold)",
                            dark: "var(--l-red)",
                            ruthless: "var(--l-red-dark)",
                            ambitious: "var(--l-pink-pale)",
                            defiant: "var(--l-red-lt)",
                            humble: "#a0c4ff",
                            charismatic: "var(--l-gold)",
                            calculating: "var(--l-violet-3)",
                            pragmatic: "var(--l-green-4)",
                            cautious: "var(--text-dim)",
                            independent: "var(--l-amber-5)",
                            determined: "var(--l-red-lt)",
                            adaptive: "#4cc9f0",
                            risky: "var(--l-magenta)",
                            submissive: "#b8b8d1",
                            diplomatic: "var(--l-green-4)",
                            cunning: "var(--l-violet-3)",
                            innovative: "var(--l-cyan)",
                        }[t.alignment] || "var(--l-indigo)",
                    a = t.minigame && void 0 !== StoryMinigames,
                    o = a ? StoryMinigames.GAME_TYPES[t.minigame.type]?.icon || "🎮" : "",
                    i = a
                        ? `\n          <span style="\n            display: inline-flex; align-items: center; gap: 4px;\n            background: linear-gradient(135deg, #667eea33, #764ba233);\n            padding: 3px 8px; border-radius: 12px;\n            font-size: 0.7rem; color: var(--l-ink-on-fill);\n            margin-left: 8px;\n          ">${o} Skill Check</span>\n        `
                        : "",
                    s = this.getChoiceCost(t),
                    r = s > 0,
                    l = !r || gameState.cash >= s,
                    c = r
                        ? `\n          <span style="\n            display: inline-flex; align-items: center; gap: 4px;\n            background: ${l ? "rgba(255,107,157,0.2)" : "rgba(255,0,0,0.2)"};\n            padding: 3px 8px; border-radius: 12px;\n            font-size: 0.7rem; color: ${l ? "var(--l-pink)" : "var(--l-red-4)"};\n            margin-left: 8px;\n          ">💰 ${"function" == typeof formatCash ? formatCash(s) : "$" + s.toLocaleString()}</span>\n        `
                        : "";
                return `\n          <button class="story-choice-btn" onclick="StoryEngine.resolveChoice('${e.id}', '${t.id}')"\n                  data-scaled-cost="${s}"\n                  style="width:100%; padding:18px 20px; margin:8px 0; \n                         background:linear-gradient(135deg, rgba(15,52,96,0.9) 0%, rgba(22,33,62,0.9) 100%);\n                         border:2px solid ${l ? n : "var(--l-neutral-4)"}; border-radius:12px; \n                         color:${l ? "var(--l-ink)" : "var(--l-neutral-6)"}; cursor:${l ? "pointer" : "not-allowed"}; text-align:left;\n                         transition:all 0.3s ease; position:relative; overflow:hidden;\n                         ${l ? "" : "opacity:0.6;"}"\n                  ${l ? "" : "disabled"}>\n            <div style="position:relative; z-index:1;">\n              <div style="font-size:1rem; font-weight:600; margin-bottom:6px; display:flex; align-items:center; flex-wrap:wrap;">\n                ${t.text}${i}${c}\n              </div>\n              <div style="font-size:0.8rem; color:${l ? n : "var(--l-neutral-5)"}; opacity:0.9; font-style:italic;">${t.consequence || ""}</div>\n            </div>\n            <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(90deg, ${fuocAlpha(n, "22")} 0%, transparent 100%); opacity:0; transition:opacity 0.3s;" class="choice-hover-bg"></div>\n          </button>\n        `;
            })
            .join("");
        (n.innerHTML = `\n        <div class="story-modal-content" style="\n          background:linear-gradient(180deg, var(--l-bg) 0%, var(--l-panel-alt) 50%, var(--l-bg) 100%);\n          border-radius:20px; max-width:700px; width:100%; max-height:90vh;\n          overflow-y:auto; border:2px solid var(--l-indigo);\n          box-shadow:0 0 100px rgba(102,126,234,0.3), 0 0 40px rgba(102,126,234,0.2);\n          animation:storySlideUp 0.6s ease-out;\n        ">\n          \x3c!-- Top bar with act indicator and close button --\x3e\n          <div style="padding:15px 25px; background:linear-gradient(90deg, #667eea22 0%, transparent 50%, #764ba222 100%); border-bottom:1px solid #667eea33;">\n            <div style="display:flex; justify-content:space-between; align-items:center;">\n              <div style="display:flex; align-items:center; gap:10px;">\n                <span style="color:var(--l-indigo); font-size:0.8rem; text-transform:uppercase; letter-spacing:2px;">ACT ${e.actNumber || gameState.story.currentAct}</span>\n                <span style="color:var(--l-on-accent);">•</span>\n                <span style="color:var(--text-dim); font-size:0.8rem;">${this.ACT_CONFIG[e.actNumber || gameState.story.currentAct]?.name || ""}</span>\n              </div>\n              <div style="display:flex; align-items:center; gap:15px;">\n                <div style="color:var(--accent-gold); font-size:0.8rem;">📖 ${"spine" === e.type ? "Major Story Event" : "minor" === e.type ? "Minor Event" : "Event"}</div>\n                <button id="closeStoryEventBtn" title="Close (you can continue later)" style="\n                  background: var(--l-sheen-10); border: 1px solid var(--border-strong); border-radius: 50%;\n                  width: 32px; height: 32px; color: var(--text-mute); font-size: 1.2rem; cursor: pointer;\n                  display: flex; align-items: center; justify-content: center;\n                  transition: all 0.2s ease;\n                " onmouseenter="this.style.background='rgba(233,69,96,0.3)';this.style.borderColor='var(--l-red)';this.style.color='var(--l-red)';"\n                   onmouseleave="this.style.background='var(--l-sheen-10)';this.style.borderColor='var(--l-neutral-5)';this.style.color='var(--l-on-accent)';">✕</button>\n              </div>\n            </div>\n          </div>\n          \n          \x3c!-- Title --\x3e\n          <div style="padding:25px 30px 15px; text-align:center;">\n            <h1 style="margin:0; font-size:2rem; color:var(--l-ink); text-shadow:0 2px 20px rgba(102,126,234,0.5); letter-spacing:1px;">${e.title}</h1>\n          </div>\n          \n          ${a}\n          \n          \x3c!-- Event image (populated async or from template) --\x3e\n          <div id="storyEventImageSlot" style="padding:0 30px;">\n            ${e.imageUrl ? `<img src="${e.imageUrl}" style="width:100%; max-height:300px; object-fit:cover; border-radius:12px; margin:10px 0; box-shadow:0 4px 20px var(--l-veil-50);">` : ""}\n          </div>\n          \n          \x3c!-- Cinematic text --\x3e\n          <div id="storyTextContainer" style="padding:10px 30px 25px;">\n            <div id="storyText" style="color:var(--l-ink-cool-3); font-size:1.05rem; line-height:1.8; white-space:pre-wrap; font-family:Georgia, serif;">\n              ${gameState.story.settings.dramaticPauses ? "" : e.cinematicText}\n            </div>\n          </div>\n          \n          \x3c!-- Choices --\x3e\n          <div id="storyChoicesContainer" style="padding:0 30px 30px; ${gameState.story.settings.dramaticPauses ? "opacity:0;" : ""}">\n            ${o}\n            \n            \x3c!-- Open-ended response option (unified with meta events) --\x3e\n            <div style="margin-top:20px; padding-top:15px; border-top:1px dashed var(--l-neutral-3);">\n              <div style="color:var(--text-dim); font-size:0.8rem; margin-bottom:10px; display:flex; align-items:center; gap:8px;">\n                <span style="color:var(--l-indigo);">✨</span> Or take a different approach:\n              </div>\n              <div style="display:flex; gap:8px;">\n                <input type="text" id="storyCustomResponseInput" placeholder="Type your own action..." \n                       style="flex:1; padding:14px 16px; background:var(--l-bg); border:2px solid var(--border); border-radius:10px; \n                              color:var(--l-ink); font-size:0.95rem; transition: all 0.3s ease;"\n                       onfocus="this.style.borderColor='var(--l-indigo)'"\n                       onblur="this.style.borderColor='var(--l-neutral-3)'"\n                       onkeypress="if(event.key==='Enter' && this.value.trim()) StoryEngine.resolveCustomResponse('${e.id}', this.value)">\n                <button onclick="const input = document.getElementById('storyCustomResponseInput'); if(input.value.trim()) StoryEngine.resolveCustomResponse('${e.id}', input.value);"\n                        style="padding:14px 24px; background:linear-gradient(135deg, var(--l-indigo), var(--l-indigo-deep)); border:none; border-radius:10px; color:var(--l-ink-on-fill); cursor:pointer; font-weight:600; transition: all 0.3s ease;"\n                        onmouseenter="this.style.transform='scale(1.05)'"\n                        onmouseleave="this.style.transform='scale(1)'">\n                  Do it\n                </button>\n              </div>\n            </div>\n          </div>\n        </div>\n      `),
            document.body.appendChild(n);
        const i = n.querySelector("#closeStoryEventBtn");
        i &&
            i.addEventListener("click", (e) => {
                e.stopPropagation(),
                    (n.style.animation = "storyFadeOut 0.3s ease-out"),
                    setTimeout(() => n.remove(), 300),
                    "function" == typeof showNotification &&
                        showNotification("📖 Story event minimized - click the bell to resume", "info");
            }),
            n.addEventListener("click", (e) => {
                e.target === n &&
                    ((n.style.animation = "storyFadeOut 0.3s ease-out"),
                    setTimeout(() => n.remove(), 300),
                    "function" == typeof showNotification &&
                        showNotification("📖 Story event minimized - click the bell to resume", "info"));
            }),
            n.querySelectorAll(".story-choice-btn").forEach((e) => {
                e.addEventListener("mouseenter", () => {
                    e.style.transform = "translateX(5px)";
                    const t = e.querySelector(".choice-hover-bg");
                    t && (t.style.opacity = "1");
                }),
                    e.addEventListener("mouseleave", () => {
                        e.style.transform = "translateX(0)";
                        const t = e.querySelector(".choice-hover-bg");
                        t && (t.style.opacity = "0");
                    });
            }),
            gameState.story.settings.dramaticPauses &&
                this.typewriterEffect(e.cinematicText, "storyText", () => {
                    const e = document.getElementById("storyChoicesContainer");
                    e && ((e.style.transition = "opacity 0.5s ease"), (e.style.opacity = "1"));
                });
    },
    typewriterEffect(e, t, n) {
        const a = document.getElementById(t);
        if (!a) return;
        const o = e.replace(/\*([^*]+)\*/g, '<em style="color:var(--l-ink-cool);">$1</em>');
        let i = !1,
            s = null;
        const r = () => {
                i ||
                    ((i = !0),
                    s && cancelAnimationFrame(s),
                    (a.innerHTML = o),
                    (a.style.cursor = ""),
                    (a.title = ""),
                    n && n());
            },
            l = [];
        let c = 0;
        for (; c < o.length; ) {
            if ("<" === o[c]) {
                const e = o.indexOf(">", c);
                if (-1 !== e) {
                    l.push(o.substring(c, e + 1)), (c = e + 1);
                    continue;
                }
            }
            l.push(o[c]), c++;
        }
        let d = 0,
            p = "",
            m = 0;
        const u = a.closest(".story-modal-overlay, #actTransitionCinematic, #storyEventModal"),
            g = (u && u.querySelector('.story-modal-content, [style*="text-align: center"]')) || a.parentElement,
            h = (e) => {
                e.target.closest("button, input, .story-choice-btn") || (g.removeEventListener("click", h), r());
            };
        setTimeout(() => {
            !i &&
                g &&
                (g.addEventListener("click", h),
                (a.style.cursor = "pointer"),
                (a.title = "Click to skip text animation"));
        }, 500),
            (s = requestAnimationFrame(function e(t) {
                if (i) return;
                if (t - m < 16) return void (s = requestAnimationFrame(e));
                m = t;
                const n = Math.min(d + 4, l.length);
                for (let e = d; e < n; e++) p += l[e];
                (d = n), (a.innerHTML = p), d < l.length ? (s = requestAnimationFrame(e)) : r();
            }));
    },
    resolveChoice(e, t) {
        const n = gameState.story.activeSpineEvent;
        if (!n || n.id !== e)
            return void console.warn(
                `[StoryEngine] resolveChoice failed: activeSpineEvent=${n?.id || "null"}, expected=${e}`
            );
        const a = n.choices.find((e) => e.id === t);
        a
            ? a.minigame && void 0 !== StoryMinigames
                ? this.launchChoiceMinigame(n, a)
                : this.finalizeChoice(n, a)
            : console.warn(`[StoryEngine] resolveChoice failed: choice '${t}' not found in event '${e}'`);
    },
    async resolveCustomResponse(e, t) {
        const n = gameState.story.activeSpineEvent;
        if (!n || n.id !== e)
            return void console.warn(
                `[StoryEngine] resolveCustomResponse failed: activeSpineEvent=${n?.id || "null"}, expected=${e}`
            );
        if (!t || !t.trim()) return void showNotification("Please type an action first!", "warning");
        const a = document.getElementById("storyEventModal"),
            o = a?.querySelector('button[onclick*="resolveCustomResponse"]'),
            i = document.getElementById("storyCustomResponseInput");
        o &&
            ((o.disabled = !0),
            (o.innerHTML =
                '<span style="animation: spin 1s linear infinite; display:inline-block;">⌛</span> Thinking...')),
            i && (i.disabled = !0);
        try {
            const e = await this.generateStoryCustomOutcome(n, t.trim()),
                a = {
                    id: "custom_" + Date.now(),
                    text: t.trim(),
                    consequence: e.text,
                    alignment: e.alignment || "adaptive",
                    gameplayEffect: e.gameplayEffect || null,
                    wasCustomResponse: !0,
                };
            if (
                (gameState.story.customResponseHistory || (gameState.story.customResponseHistory = []),
                gameState.story.customResponseHistory.push({
                    response: t.trim(),
                    eventTitle: n.title,
                    outcome: e.text,
                    wasClever: e.wasClever || !1,
                    timestamp: Date.now(),
                }),
                gameState.story.customResponseHistory.length > 50 &&
                    (gameState.story.customResponseHistory = gameState.story.customResponseHistory.slice(-50)),
                e.wasClever
                    ? ((gameState.story.cleverStreak = (gameState.story.cleverStreak || 0) + 1),
                      (gameState.story.totalCleverResponses = (gameState.story.totalCleverResponses || 0) + 1),
                      this.checkCleverStreakMilestones())
                    : (gameState.story.cleverStreak = 0),
                this.finalizeChoice(n, a, e),
                e.wasClever)
            ) {
                const e = gameState.story.cleverStreak;
                setTimeout(() => {
                    showNotification(
                        e >= 3 ? `🔥 Clever streak x${e}! Bonus rewards unlocked!` : "✨ Clever approach!",
                        "success"
                    );
                }, 1500);
            }
        } catch (e) {
            console.error("[StoryEngine] Custom response generation failed:", e),
                showNotification("Something went wrong. Try a preset choice instead.", "error"),
                o && ((o.disabled = !1), (o.textContent = "Do it")),
                i && (i.disabled = !1);
        }
    },
    async generateStoryCustomOutcome(e, t) {
        const n = [];
        e.involvedEmployees &&
            e.involvedEmployees.forEach((e) => {
                const t = gameState.employees.find((t) => t.id === e);
                t && n.push(t);
            }),
            e.involvedCharacters &&
                e.involvedCharacters.forEach((e) => {
                    const t = gameState.employees.find((t) => t.name.toLowerCase() === e.toLowerCase());
                    t && !n.includes(t) && n.push(t);
                });
        const a = `In an office management game with story events, the player has chosen to take a custom action instead of the provided choices.\n\nSTORY EVENT: "${e.title}"\nEVENT DESCRIPTION: ${e.cinematicText?.substring(0, 400) || e.description || "An important moment in the office..."}\nEVENT TYPE: ${"spine" === e.type ? "Major Story Event" : "minor" === e.type ? "Minor Event" : "Emergent Event"}\nINVOLVED CHARACTERS: ${n.map((e) => e.name).join(", ") || "Various employees"}\n\nPLAYER'S CUSTOM ACTION: "${t}"\n\nGenerate a realistic, dramatic outcome for this action that fits the story tone. Consider:\n- Is this action reasonable or wildly inappropriate for the situation?\n- What would the realistic consequences be?\n- How would the involved characters react emotionally?\n- Does this show leadership, creativity, cowardice, cruelty, or something else?\n\nAVAILABLE GAMEPLAY EFFECT TYPES (pick the most appropriate):\nCONSEQUENCES (negative):\n- "fine" with amount (forced cash loss, 5000-100000)\n- "decrease_all_trust" with amount (5-20)\n- "decrease_all_productivity" with amount (5-20)\n- "disable_product" with duration in days (1-7) - shuts down production\n- "employee_quits" - if action is cruel enough, someone may resign\n- "random_employee_quits" - unhappy employee leaves\n- "reputation_hit" with amount (5-20)\n- "investigation" with duration (7-30) - regulatory scrutiny\n- "temporary_debuff" with stat, multiplier (0.5-0.9), duration (3-14)\n\nBENEFITS (positive):\n- "bonus_cash" with amount (1000-50000)\n- "boost_all_trust" with amount (5-20)\n- "boost_all_productivity" with amount (5-20)\n- "boost_all_comfort" with amount (5-15)\n- "reputation_boost" with amount (5-20)\n- "loyalty_boost" with duration (7-30) - prevents quitting\n- "temporary_buff" with stat, multiplier (1.1-1.5), duration (3-14)\n- "unlock_perk" with perkId, name, description - permanent benefit\n\nRESPOND IN JSON:\n{\n  "text": "2-3 sentences describing what happens as a result of the player's action. Be dramatic and engaging.",\n  "alignment": "one of: lawful, light, neutral, dark, ruthless, ambitious, defiant, humble, charismatic, calculating, pragmatic, cautious, adaptive, risky, diplomatic, cunning, innovative",\n  "gameplayEffect": {"type": "effect_type_from_list", "amount": number, "duration": days_if_applicable, "reason": "brief reason"} or null for minor actions,\n  "wasClever": true/false (was the response creative or smart?),\n  "employeeReactions": [{"name": "Name", "reaction": "brief emotional reaction"}]\n}`,
            o = await queuedGenerateText(a);
        try {
            let e = o;
            const t = o.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (t) e = t[1].trim();
            else {
                const t = o.match(/\{[\s\S]*\}/);
                t && (e = t[0]);
            }
            return JSON.parse(e);
        } catch (e) {
            return (
                console.error("[StoryEngine] Failed to parse custom outcome:", e),
                {
                    text: "Your unconventional approach yields unexpected results...",
                    alignment: "adaptive",
                    gameplayEffect: null,
                    wasClever: !1,
                }
            );
        }
    },
    launchChoiceMinigame(e, t) {
        const n = t.minigame,
            a = document.getElementById("storyEventModal");
        a && ((a.style.opacity = "0"), (a.style.pointerEvents = "none")),
            StoryMinigames.launchMinigame(
                n.type,
                {
                    title: n.title || t.text,
                    themeText: n.description || "Prove your skill!",
                    difficulty: n.difficulty || "medium",
                },
                (n) => {
                    this.resolveMinigameChoice(e, t, n);
                }
            );
    },
    resolveMinigameChoice(e, t, n) {
        const a = t.minigame;
        let o = { ...t };
        "perfect" === n.result && a.perfectOutcome
            ? ((o.consequence = a.perfectOutcome.consequence || t.consequence),
              (o.gameplayEffect = a.perfectOutcome.gameplayEffect || t.gameplayEffect),
              (o.text = t.text + " (Perfect!)"))
            : ("success" !== n.result && "perfect" !== n.result) || !a.successOutcome
              ? "partial" === n.result && a.partialOutcome
                  ? ((o.consequence = a.partialOutcome.consequence || "Partial success. Could have gone better."),
                    (o.gameplayEffect = a.partialOutcome.gameplayEffect || null),
                    (o.alignment = a.partialOutcome.alignment || t.alignment))
                  : "failure" === n.result &&
                    a.failureOutcome &&
                    ((o.consequence = a.failureOutcome.consequence || "That didn't go as planned..."),
                    (o.gameplayEffect = a.failureOutcome.gameplayEffect || null),
                    (o.alignment = a.failureOutcome.alignment || "cautious"))
              : ((o.consequence = a.successOutcome.consequence || t.consequence),
                (o.gameplayEffect = a.successOutcome.gameplayEffect || t.gameplayEffect)),
            (o.minigameResult = n);
        const i = document.getElementById("storyEventModal");
        i && i.remove(), this.finalizeChoice(e, o);
    },
    finalizeChoice(e, t) {
        console.log(`[StoryEngine] Player chose: ${t.id} (${t.alignment})`);
        const n = this.getChoiceCost(t);
        if (n > 0) {
            if (gameState.cash < n)
                return void (
                    "function" == typeof showNotification && showNotification("❌ Not enough cash!", "error")
                );
            (gameState.cash -= n),
                "function" == typeof showNotification &&
                    showNotification(`💰 Spent ${formatCash ? formatCash(n) : "$" + n.toLocaleString()}`, "info");
        }
        if (
            (gameState.story.choicesMade++,
            gameState.story.choiceHistory.push({
                eventId: e.id,
                eventKey: e.eventKey,
                choiceId: t.id,
                alignment: t.alignment,
                timestamp: Date.now(),
                actNumber: e.actNumber,
                minigameResult: t.minigameResult || null,
            }),
            this.applyAlignmentEffect(t.alignment),
            e.setFlags)
        )
            for (const t of e.setFlags) gameState.story.narrativeFlags[t] = !0;
        e.affectsFlag && (gameState.story.narrativeFlags[e.affectsFlag] = t.id);
        const a = gameState.story.journal.find((t) => t.eventKey === e.eventKey && t.pending);
        if (a) {
            const n = t.minigameResult ? ` [${t.minigameResult.result.toUpperCase()}]` : "";
            (a.content = `${e.cinematicText.substring(0, 200)}...\n\n✨ You chose: "${t.text}"${n}\n\n${t.consequence || ""}`),
                (a.pending = !1),
                (a.fullCinematicText = e.cinematicText),
                (a.choiceMade = t.text),
                (a.choiceConsequence = t.consequence || null),
                (a.choiceAlignment = t.alignment || null),
                (a.imageUrl = e.imageUrl || null);
        } else
            this.addJournalEntry({
                title: e.title,
                content: `You chose: "${t.text}"\n\n${t.consequence || ""}`,
                type: "minor" === e.type ? "minor" : "choice",
                memorable: "spine" === e.type,
                fullCinematicText: e.cinematicText,
                choiceMade: t.text,
                choiceConsequence: t.consequence || null,
                choiceAlignment: t.alignment || null,
                imageUrl: e.imageUrl || null,
            });
        if (e.involvedEmployees || e.involvedCharacters) {
            const n = e.involvedEmployees || [],
                a = e.involvedCharacters || [],
                o = gameState.employees.filter(
                    (e) => n.includes(e.id) || a.some((t) => e.name.toLowerCase() === t.toLowerCase())
                ),
                i = (e, t) => {
                    let n = 3;
                    return (
                        "spine" === t && (n += 2),
                        ("compassionate" !== e.alignment && "kind" !== e.alignment) || (n += 1),
                        ("ruthless" !== e.alignment && "cruel" !== e.alignment) || (n += 1),
                        "perfect" === e.minigameResult?.result && (n += 1),
                        Math.min(n, 7)
                    );
                },
                s = i(t, e.type),
                r = ["compassionate", "kind", "generous", "supportive"].includes(t.alignment)
                    ? "positive"
                    : ["ruthless", "cruel", "cold", "manipulative"].includes(t.alignment)
                      ? "negative"
                      : "neutral";
            o.forEach((n) => {
                if (
                    ("function" == typeof ensureEmployeeMemory && ensureEmployeeMemory(n),
                    n.memory || (n.memory = {}),
                    n.memory.eventMemories || (n.memory.eventMemories = []),
                    n.memory.eventMemories.push({
                        eventId: e.id,
                        eventKey: e.eventKey,
                        title: e.title,
                        description: e.cinematicText?.substring(0, 200) || "",
                        outcome: t.consequence,
                        playerChoice: t.text,
                        timestamp: Date.now(),
                        type: e.type || "story",
                        wasSpine: "spine" === e.type,
                        emotionalWeight: s,
                        sentiment: r,
                        referenced: 0,
                        canReference: !0,
                    }),
                    "spine" === e.type && gameState.story.recurringCharacters)
                ) {
                    const t = gameState.story.recurringCharacters.find((e) => e.id === n.id);
                    t
                        ? (t.eventCount++, (t.lastEvent = e.eventKey))
                        : gameState.story.recurringCharacters.push({
                              id: n.id,
                              name: n.name,
                              eventCount: 1,
                              lastEvent: e.eventKey,
                              relationship: r,
                          });
                }
                n.memory.eventMemories.length > CAPS.EVENT_MEMORIES_PER_EMP &&
                    (n.memory.eventMemories.sort((e, t) => t.emotionalWeight - e.emotionalWeight),
                    (n.memory.eventMemories = n.memory.eventMemories.slice(0, CAPS.EVENT_MEMORIES_PER_EMP)),
                    n.memory.eventMemories.sort((e, t) => e.timestamp - t.timestamp)),
                    this.addStoryRecapToChat(n, e, t, r);
            });
        }
        if ("minor" === e.type) {
            const n = this.initializeMinorEvents(),
                a = n.queue.findIndex((t) => t.id === e.id);
            -1 !== a &&
                ((e.resolved = !0),
                (e.chosenOption = t.id),
                (e.outcomeText = t.consequence),
                n.history.unshift(e),
                n.queue.splice(a, 1),
                n.history.length > 30 && n.history.pop()),
                this.trackAction(`minor_event_${e.category || "general"}`, {
                    eventTitle: e.title,
                    choiceId: t.id,
                    alignment: t.alignment,
                });
        }
        gameState.story.activeSpineEvent = null;
        const o = document.getElementById("storyEventModal");
        o && ((o.style.animation = "storyFadeOut 0.5s ease-out"), setTimeout(() => o.remove(), 500)),
            t.gameplayEffect && this.executeGameplayEffect(t.gameplayEffect),
            setTimeout(() => {
                this.showConsequenceToast(t);
            }, 600),
            this.updateStoryUI(),
            saveGame();
    },
    executeGameplayEffect(e) {
        if (!e || !e.type) return;
        console.log(`[StoryEngine] 🎮 Executing gameplay effect: ${e.type}`, e);
        const t = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus);
        switch (e.type) {
            case "boost_all_trust":
                t.forEach((t) => {
                    t.stats && (t.stats.trust = Math.min(100, (t.stats.trust || 50) + e.amount));
                }),
                    showNotification(`📈 Trust improved across the team (+${e.amount})`, "success");
                break;
            case "decrease_all_trust":
                t.forEach((t) => {
                    t.stats && (t.stats.trust = Math.max(0, (t.stats.trust || 50) - e.amount));
                }),
                    showNotification(`📉 Team trust declined (-${e.amount})`, "warning");
                break;
            case "boost_all_productivity":
                t.forEach((t) => {
                    t.stats && (t.stats.productivity = Math.min(100, (t.stats.productivity || 70) + e.amount));
                }),
                    showNotification(`📈 Team productivity improved (+${e.amount}%)`, "success");
                break;
            case "decrease_all_productivity":
                t.forEach((t) => {
                    t.stats && (t.stats.productivity = Math.max(0, (t.stats.productivity || 70) - e.amount));
                }),
                    showNotification(`📉 Team productivity declined (-${e.amount}%)`, "warning");
                break;
            case "boost_all_comfort":
                t.forEach((t) => {
                    t.stats && (t.stats.comfort = Math.min(100, (t.stats.comfort || 60) + e.amount));
                }),
                    showNotification(`☀️ Workplace comfort improved (+${e.amount})`, "success");
                break;
            case "decrease_all_comfort":
                t.forEach((t) => {
                    t.stats && (t.stats.comfort = Math.max(0, (t.stats.comfort || 60) - e.amount));
                }),
                    showNotification(`🌧️ Workplace comfort declined (-${e.amount})`, "warning");
                break;
            case "boost_all_affection":
                t.forEach((t) => {
                    t.stats && (t.stats.affection = Math.min(100, (t.stats.affection || 20) + e.amount));
                }),
                    showNotification(`💕 Team bonds strengthened (+${e.amount})`, "success");
                break;
            case "boost_employee":
                if (e.employeeId) {
                    const t = gameState.employees.find((t) => t.id === e.employeeId);
                    t &&
                        t.stats &&
                        e.stat &&
                        e.amount &&
                        ((t.stats[e.stat] = Math.min(100, (t.stats[e.stat] || 50) + e.amount)),
                        showNotification(`📈 ${t.name}'s ${e.stat} increased!`, "success"));
                }
                break;
            case "decrease_employee":
                if (e.employeeId) {
                    const t = gameState.employees.find((t) => t.id === e.employeeId);
                    t &&
                        t.stats &&
                        e.stat &&
                        e.amount &&
                        ((t.stats[e.stat] = Math.max(0, (t.stats[e.stat] || 50) - e.amount)),
                        showNotification(`📉 ${t.name}'s ${e.stat} decreased`, "warning"));
                }
                break;
            case "faction_standing": {
                const f = gameState.story?.factions?.[e.faction];
                f &&
                    f.members &&
                    (f.members.forEach((id) => {
                        const m = gameState.employees.find((x) => x.id === id);
                        m &&
                            m.stats &&
                            (e.trust && (m.stats.trust = Math.max(0, Math.min(100, (m.stats.trust || 50) + e.trust))),
                            e.affection && (m.stats.affection = Math.max(0, Math.min(100, (m.stats.affection || 50) + e.affection))),
                            e.productivity && (m.stats.productivity = Math.max(0, Math.min(100, (m.stats.productivity || 50) + e.productivity))));
                    }),
                    showNotification(
                        `${e.trust < 0 || e.affection < 0 ? "📉" : "📈"} Standing shifted with the ${e.faction}.`,
                        e.trust < 0 || e.affection < 0 ? "warning" : "success"
                    ));
                break;
            }
            case "spend_cash":
                gameState.cash >= e.amount
                    ? ((gameState.cash -= e.amount),
                      e.boostMorale
                          ? (t.forEach((e) => {
                                e.stats &&
                                    ((e.stats.comfort = Math.min(100, (e.stats.comfort || 60) + 15)),
                                    (e.stats.trust = Math.min(100, (e.stats.trust || 50) + 8)));
                            }),
                            showNotification(`💰 Spent ${formatCash(e.amount)} - Team morale boosted!`, "success"))
                          : e.boostAffection
                            ? (t.forEach((e) => {
                                  e.stats && (e.stats.affection = Math.min(100, (e.stats.affection || 20) + 10));
                              }),
                              showNotification(
                                  `💰 Spent ${formatCash(e.amount)} - Team bonds strengthened!`,
                                  "success"
                              ))
                            : showNotification(`💰 Spent ${formatCash(e.amount)}`, "info"))
                    : (showNotification(`❌ Couldn't afford ${formatCash(e.amount)}!`, "error"),
                      this.trackAction("broke_promise", { type: e.type, amount: e.amount }));
                break;
            case "fine":
            case "penalty":
                const n = e.amount || 1e4;
                (gameState.cash -= n),
                    showNotification(`⚠️ FINE: -${formatCash(n)}`, "error"),
                    this.addJournalEntry({
                        title: "💸 Financial Penalty",
                        content: e.reason || `The company was fined ${formatCash(n)}.`,
                        type: "consequence",
                        memorable: n >= 5e4,
                    });
                break;
            case "bonus_cash":
            case "reward_cash":
                const a = e.amount || 5e3;
                (gameState.cash += a),
                    showNotification(`💵 Received ${formatCash(a)}!`, "success"),
                    e.reason &&
                        this.addJournalEntry({
                            title: "💰 Financial Reward",
                            content: e.reason,
                            type: "benefit",
                            memorable: a >= 25e3,
                        });
                break;
            case "ongoing_cost":
                gameState.story.ongoingEffects || (gameState.story.ongoingEffects = []),
                    gameState.story.ongoingEffects.push({
                        id: `cost_${Date.now()}`,
                        type: "recurring_cost",
                        amount: e.amount || 1e3,
                        frequency: e.frequency || "daily",
                        duration: e.duration || 7,
                        startDay: gameState.currentDay,
                        reason: e.reason || "Ongoing expense",
                    }),
                    showNotification(
                        `📅 Ongoing cost: ${formatCash(e.amount)}/day for ${e.duration} days`,
                        "warning"
                    );
                break;
            case "ongoing_income":
                gameState.story.ongoingEffects || (gameState.story.ongoingEffects = []),
                    gameState.story.ongoingEffects.push({
                        id: `income_${Date.now()}`,
                        type: "recurring_income",
                        amount: e.amount || 1e3,
                        frequency: e.frequency || "daily",
                        duration: e.duration || 7,
                        startDay: gameState.currentDay,
                        reason: e.reason || "Bonus income",
                    }),
                    showNotification(
                        `📅 Bonus income: +${formatCash(e.amount)}/day for ${e.duration} days!`,
                        "success"
                    );
                break;
            case "disable_product":
                const o = e.productId
                    ? gameState.products.find((t) => t.id === e.productId)
                    : gameState.products.find((e) => e.running && e.unlocked);
                o &&
                    ((o.disabled = !0),
                    (o.disabledUntil = gameState.currentDay + (e.duration || 3)),
                    (o.disabledReason = e.reason || "Temporarily unavailable"),
                    (o.running = !1),
                    showNotification(`🚫 ${o.name} disabled for ${e.duration || 3} days!`, "error"),
                    this.addJournalEntry({
                        title: `🚫 ${o.name} Shut Down`,
                        content: e.reason || `${o.name} has been temporarily disabled and cannot generate revenue.`,
                        type: "consequence",
                        memorable: !0,
                    }));
                break;
            case "disable_random_product":
                const i = gameState.products.filter((e) => e.running && e.unlocked && !e.disabled);
                if (i.length > 0) {
                    const t = i[Math.floor(Math.random() * i.length)];
                    (t.disabled = !0),
                        (t.disabledUntil = gameState.currentDay + (e.duration || 3)),
                        (t.disabledReason = e.reason || "Technical issues"),
                        (t.running = !1),
                        showNotification(`🚫 ${t.name} disabled for ${e.duration || 3} days!`, "error");
                }
                break;
            case "boost_product":
                const s = e.productId
                    ? gameState.products.find((t) => t.id === e.productId)
                    : gameState.products.find((e) => e.running && e.unlocked);
                s &&
                    (s.temporaryBoosts || (s.temporaryBoosts = []),
                    s.temporaryBoosts.push({
                        multiplier: e.multiplier || 1.5,
                        expiresDay: gameState.currentDay + (e.duration || 7),
                        reason: e.reason || "Production boost",
                    }),
                    showNotification(
                        `🚀 ${s.name} production boosted ${Math.round(100 * (e.multiplier || 1.5))}% for ${e.duration || 7} days!`,
                        "success"
                    ));
                break;
            case "production_halt":
                gameState.products.forEach((t) => {
                    t.running &&
                        ((t.disabled = !0),
                        (t.disabledUntil = gameState.currentDay + (e.duration || 1)),
                        (t.disabledReason = e.reason || "Production halted"),
                        (t.running = !1));
                }),
                    showNotification(`⛔ ALL PRODUCTION HALTED for ${e.duration || 1} day(s)!`, "error"),
                    this.addJournalEntry({
                        title: "⛔ Company-Wide Production Halt",
                        content: e.reason || "All production has been temporarily stopped.",
                        type: "consequence",
                        memorable: !0,
                    });
                break;
            case "employee_quits":
                const r = e.employeeId ? gameState.employees.find((t) => t.id === e.employeeId) : null;
                r &&
                    r.hired &&
                    "active" === r.employmentStatus &&
                    ((r.employmentStatus = "resigned"),
                    (r.hired = !1),
                    (r.resignReason = e.reason || "Personal reasons"),
                    showNotification(`😢 ${r.name} has resigned!`, "error"),
                    this.addJournalEntry({
                        title: `👋 ${r.name} Resigned`,
                        content: e.reason || `${r.name} has left the company.`,
                        type: "consequence",
                        memorable: !0,
                        involvedCharacters: [r.name],
                    }));
                break;
            case "random_employee_quits":
                const l = t.filter((e) => (e.stats?.trust || 50) < 40 || (e.stats?.comfort || 60) < 30);
                if (l.length > 0) {
                    const t = l[Math.floor(Math.random() * l.length)];
                    (t.employmentStatus = "resigned"),
                        (t.hired = !1),
                        (t.resignReason = e.reason || "Couldn't take it anymore"),
                        showNotification(`😢 ${t.name} has quit!`, "error"),
                        this.addJournalEntry({
                            title: `👋 ${t.name} Quit`,
                            content: `${t.name} couldn't take it anymore and has left the company.`,
                            type: "consequence",
                            memorable: !0,
                            involvedCharacters: [t.name],
                        });
                }
                break;
            case "mass_resignation_risk":
                const c = t.filter((e) => (e.stats?.trust || 50) < 30);
                let d = 0;
                c.forEach((t) => {
                    Math.random() < (e.chance || 0.3) && ((t.employmentStatus = "resigned"), (t.hired = !1), d++);
                }),
                    d > 0 &&
                        (showNotification(`😱 ${d} employee(s) resigned in protest!`, "error"),
                        this.addJournalEntry({
                            title: "🚨 Mass Resignation",
                            content: `${d} employees have resigned due to poor working conditions.`,
                            type: "consequence",
                            memorable: !0,
                        }));
                break;
            case "employee_unavailable":
                const p = e.employeeId ? gameState.employees.find((t) => t.id === e.employeeId) : null;
                p &&
                    ((p.unavailable = !0),
                    (p.unavailableUntil = gameState.currentDay + (e.duration || 3)),
                    (p.unavailableReason = e.reason || "Temporarily unavailable"),
                    showNotification(`🚫 ${p.name} unavailable for ${e.duration || 3} days`, "warning"));
                break;
            case "bonus_hire":
                gameState.story.bonusHires || (gameState.story.bonusHires = []),
                    gameState.story.bonusHires.push({
                        discount: e.discount || 1,
                        level: e.level || 1,
                        expires: gameState.currentDay + (e.duration || 30),
                        reason: e.reason || "Special recruitment opportunity",
                    }),
                    showNotification("🎁 Free hire available! Check the job market.", "success");
                break;
            case "loyalty_boost":
                gameState.story.ongoingEffects || (gameState.story.ongoingEffects = []),
                    gameState.story.ongoingEffects.push({
                        id: `loyalty_${Date.now()}`,
                        type: "quit_prevention",
                        duration: e.duration || 14,
                        startDay: gameState.currentDay,
                        reason: e.reason || "High morale",
                    }),
                    showNotification(
                        `💪 Team loyalty maxed! No one will quit for ${e.duration || 14} days.`,
                        "success"
                    );
                break;
            case "mark_complainers":
                t
                    .filter((e) => e.stats?.trust < 40)
                    .forEach((e) => {
                        e.narrativeFlags || (e.narrativeFlags = {}), (e.narrativeFlags.marked_complainer = !0);
                    }),
                    e.triggerFearMode &&
                        ((gameState.story.narrativeFlags.fear_mode = !0),
                        this.addJournalEntry({
                            title: "☠️ Rule of Fear",
                            content: "You've chosen to lead through intimidation. Dissent will be punished.",
                            type: "consequence",
                            memorable: !0,
                        }));
                break;
            case "reputation_hit":
                (gameState.story.reputationScore = Math.max(
                    0,
                    (gameState.story.reputationScore || 50) - (e.amount || 10)
                )),
                    showNotification(`📉 Company reputation damaged (-${e.amount || 10})`, "warning");
                break;
            case "reputation_boost":
                (gameState.story.reputationScore = Math.min(
                    100,
                    (gameState.story.reputationScore || 50) + (e.amount || 10)
                )),
                    showNotification(`📈 Company reputation improved (+${e.amount || 10})!`, "success");
                break;
            case "media_attention":
                (gameState.story.narrativeFlags.media_watching = !0),
                    (gameState.story.mediaAttentionLevel = (gameState.story.mediaAttentionLevel || 0) + 1),
                    showNotification("📰 The media is paying attention to your company...", "warning");
                break;
            case "investigation":
                gameState.story.ongoingEffects || (gameState.story.ongoingEffects = []),
                    gameState.story.ongoingEffects.push({
                        id: `investigation_${Date.now()}`,
                        type: "investigation",
                        severity: e.severity || "minor",
                        duration: e.duration || 14,
                        startDay: gameState.currentDay,
                        potentialFine: e.potentialFine || 5e4,
                        reason: e.reason || "Regulatory investigation",
                    }),
                    (gameState.story.narrativeFlags.under_investigation = !0),
                    showNotification("🔍 Your company is under investigation!", "error"),
                    this.addJournalEntry({
                        title: "🔍 Investigation Launched",
                        content:
                            e.reason || "Regulatory authorities have launched an investigation into the company.",
                        type: "consequence",
                        memorable: !0,
                    });
                break;
            case "investigation_cleared":
                (gameState.story.narrativeFlags.under_investigation = !1),
                    (gameState.story.ongoingEffects = (gameState.story.ongoingEffects || []).filter(
                        (e) => "investigation" !== e.type
                    )),
                    showNotification("✅ Investigation cleared! No charges filed.", "success"),
                    this.addJournalEntry({
                        title: "✅ Investigation Cleared",
                        content: "The investigation has concluded with no findings against the company.",
                        type: "benefit",
                        memorable: !0,
                    });
                break;
            case "unlock_ability":
                gameState.story.unlockedAbilities || (gameState.story.unlockedAbilities = []),
                    gameState.story.unlockedAbilities.includes(e.ability) ||
                        (gameState.story.unlockedAbilities.push(e.ability),
                        showNotification(`🔓 New ability: ${e.ability}`, "success"));
                break;
            case "unlock_perk":
                gameState.story.companyPerks || (gameState.story.companyPerks = []),
                    gameState.story.companyPerks.find((t) => t.id === e.perkId) ||
                        (gameState.story.companyPerks.push({
                            id: e.perkId,
                            name: e.name || "Special Perk",
                            description: e.description || "A special company benefit",
                            effect: e.perkEffect || {},
                        }),
                        showNotification(`🌟 New perk unlocked: ${e.name}!`, "success"),
                        this.addJournalEntry({
                            title: `🌟 Perk Unlocked: ${e.name}`,
                            content: e.description || "A new permanent benefit for the company.",
                            type: "benefit",
                            memorable: !0,
                        }));
                break;
            case "temporary_buff":
                gameState.story.ongoingEffects || (gameState.story.ongoingEffects = []),
                    gameState.story.ongoingEffects.push({
                        id: `buff_${Date.now()}`,
                        type: "buff",
                        stat: e.stat || "productivity",
                        multiplier: e.multiplier || 1.2,
                        duration: e.duration || 7,
                        startDay: gameState.currentDay,
                        reason: e.reason || "Temporary boost",
                    }),
                    showNotification(
                        `⬆️ ${e.stat || "Productivity"} boosted ${Math.round(100 * (e.multiplier || 1.2))}% for ${e.duration || 7} days!`,
                        "success"
                    );
                break;
            case "temporary_debuff":
                gameState.story.ongoingEffects || (gameState.story.ongoingEffects = []),
                    gameState.story.ongoingEffects.push({
                        id: `debuff_${Date.now()}`,
                        type: "debuff",
                        stat: e.stat || "productivity",
                        multiplier: e.multiplier || 0.8,
                        duration: e.duration || 7,
                        startDay: gameState.currentDay,
                        reason: e.reason || "Temporary penalty",
                    }),
                    showNotification(
                        `⬇️ ${e.stat || "Productivity"} reduced to ${Math.round(100 * (e.multiplier || 0.8))}% for ${e.duration || 7} days`,
                        "warning"
                    );
                break;
            case "intimate_encounter":
                if (this.isAdultContentEnabled() && e.employeeId) {
                    const t = gameState.employees.find((t) => t.id === e.employeeId);
                    if (t) {
                        t.memory || (t.memory = {}),
                            (t.memory.intimacyLevel = Math.min(
                                100,
                                (t.memory.intimacyLevel || 0) + (e.intimacyGain || 15)
                            ));
                        const n = !t.memory.hasHadIntimateEncounter;
                        (t.memory.hasHadIntimateEncounter = !0),
                            this.trackAction(n ? "first_intimate_encounter" : "intimate_encounter", {
                                employeeId: t.id,
                                employeeName: t.name,
                                intimacyLevel: t.memory.intimacyLevel,
                                context: e.context || "private_moment",
                            }),
                            t.stats &&
                                ((t.stats.affection = Math.min(
                                    100,
                                    (t.stats.affection || 20) + (e.affectionGain || 8)
                                )),
                                (t.stats.desire = Math.max(0, (t.stats.desire || 50) - 15)),
                                !1 !== e.wasConsensual
                                    ? (t.stats.trust = Math.min(100, (t.stats.trust || 50) + 5))
                                    : ((t.stats.trust = Math.max(0, (t.stats.trust || 50) - 20)),
                                      this.trackAction("coerced_intimacy", {
                                          employeeId: t.id,
                                          employeeName: t.name,
                                      }))),
                            this.addJournalEntry({
                                title: this.getContentVariant({
                                    nsfw: `💋 Private Moment with ${t.name}`,
                                    sfw: `💝 Special Connection with ${t.name}`,
                                }),
                                content: this.getContentVariant({
                                    nsfw: e.nsfwJournalText || `You and ${t.name} shared an intimate moment.`,
                                    sfw: `You and ${t.name} have grown much closer.`,
                                }),
                                type: "relationship",
                                memorable: n,
                            });
                    }
                }
                break;
            case "boost_desire":
                if (this.isAdultContentEnabled() && e.employeeId) {
                    const t = gameState.employees.find((t) => t.id === e.employeeId);
                    t && t.stats && (t.stats.desire = Math.min(100, (t.stats.desire || 30) + (e.amount || 10)));
                }
                break;
            case "spread_rumors":
                this.isAdultContentEnabled() &&
                    (t.forEach((e) => {
                        if (e.stats) {
                            const t = Math.random();
                            t < 0.4
                                ? (e.stats.desire = Math.min(100, (e.stats.desire || 30) + 8))
                                : t >= 0.7 && (e.stats.trust = Math.max(0, (e.stats.trust || 50) - 5));
                        }
                    }),
                    (gameState.story.narrativeFlags.rumors_spreading = !0));
                break;
            default:
                console.warn(`[StoryEngine] Unknown gameplay effect type: ${e.type}`);
        }
        saveGame(!1);
    },
    processOngoingEffects() {
        if (!gameState.story?.ongoingEffects) return;
        const e = gameState.currentDay,
            t = [];
        gameState.story.ongoingEffects.forEach((n) => {
            if (e - n.startDay >= n.duration) t.push(n);
            else
                switch (n.type) {
                    case "recurring_cost":
                        gameState.cash -= n.amount;
                        break;
                    case "recurring_income":
                        gameState.cash += n.amount;
                        break;
                    case "investigation":
                        Math.random() < 0.05 &&
                            ((gameState.cash -= n.potentialFine),
                            showNotification(
                                `⚖️ Investigation concluded: Fined ${formatCash(n.potentialFine)}`,
                                "error"
                            ),
                            t.push(n),
                            (gameState.story.narrativeFlags.under_investigation = !1));
                }
        }),
            t.forEach((e) => {
                const t = gameState.story.ongoingEffects.indexOf(e);
                -1 !== t &&
                    (gameState.story.ongoingEffects.splice(t, 1),
                    ("buff" !== e.type && "debuff" !== e.type) ||
                        showNotification(`⏰ ${e.reason || "Temporary effect"} has ended`, "info"));
            }),
            gameState.products.forEach((t) => {
                t.disabled &&
                    t.disabledUntil <= e &&
                    ((t.disabled = !1),
                    delete t.disabledUntil,
                    delete t.disabledReason,
                    showNotification(`✅ ${t.name} is operational again!`, "success")),
                    t.temporaryBoosts && (t.temporaryBoosts = t.temporaryBoosts.filter((t) => t.expiresDay > e));
            }),
            gameState.employees.forEach((t) => {
                t.unavailable &&
                    t.unavailableUntil <= e &&
                    ((t.unavailable = !1),
                    delete t.unavailableUntil,
                    delete t.unavailableReason,
                    showNotification(`✅ ${t.name} is back!`, "success"));
            }),
            "function" == typeof invalidateCashPerSecond && invalidateCashPerSecond();
    },
    getProductMultiplier(e) {
        let t = 1;
        return e.disabled
            ? 0
            : (e.temporaryBoosts &&
                  e.temporaryBoosts.forEach((e) => {
                      t *= e.multiplier;
                  }),
              t);
    },
    CLEVER_STREAK_MILESTONES: {
        3: {
            perk: "quick_thinker",
            name: "Quick Thinker",
            bonus: "Suggested actions now appear in events",
            reward: { type: "boost_all_trust", amount: 5 },
        },
        5: {
            perk: "silver_tongue",
            name: "Silver Tongue",
            bonus: "+10% chance of favorable outcomes",
            reward: { type: "bonus_cash", amount: 5e3 },
        },
        7: {
            perk: "master_improviser",
            name: "Master Improviser",
            bonus: "Custom responses have greater impact",
            reward: { type: "reputation_boost", amount: 10 },
        },
        10: {
            perk: "legendary_wit",
            name: "Legendary Wit",
            bonus: "Unlock special dialogue options everywhere",
            reward: {
                type: "unlock_perk",
                perkId: "legendary_wit",
                name: "Legendary Wit",
                description: "Your reputation for cleverness precedes you",
            },
        },
    },
    checkCleverStreakMilestones() {
        const e = gameState.story.cleverStreak || 0;
        gameState.story.unlockedResponsePerks || (gameState.story.unlockedResponsePerks = []);
        for (const [t, n] of Object.entries(this.CLEVER_STREAK_MILESTONES))
            e >= parseInt(t) &&
                !gameState.story.unlockedResponsePerks.includes(n.perk) &&
                (gameState.story.unlockedResponsePerks.push(n.perk),
                this.executeGameplayEffect(n.reward),
                setTimeout(() => {
                    this.showMilestoneAchievement(n);
                }, 2e3),
                this.addJournalEntry({
                    title: `🏆 ${n.name}`,
                    content: `Your clever thinking has earned you a new perk: ${n.bonus}`,
                    type: "achievement",
                    memorable: !0,
                }));
    },
    MULTI_STEP_EVENTS: {
        company_retreat: {
            id: "company_retreat",
            title: "🏖️ The Company Retreat",
            description: "A multi-day getaway with your team. Your choices throughout will shape team dynamics.",
            theme: "team_building",
            mood: "adventure",
            totalSteps: 5,
            requiredEmployees: 3,
            unlockConditions: { minEmployees: 5, minCash: 5e4, minAct: 2 },
            themeColor: "var(--l-green-4)",
            steps: [
                {
                    id: "beach_volleyball",
                    stepNumber: 1,
                    title: "🏐 Beach Volleyball",
                    cinematicText:
                        'The resort beach stretches before you, golden sand meeting crystal waves. Your team has split into two groups, eyeing each other competitively.\n\n"Boss, you\'re the tiebreaker!" someone calls out. The employees watch expectantly—will you show off, play fair, or sit this one out?',
                    choices: [
                        {
                            id: "play_competitively",
                            text: "Play to win - show them how it's done",
                            consequence: "You spike the ball like your bonus depends on it",
                            alignment: "ambitious",
                            minigame: { type: "precision", difficulty: "medium", label: "Athletic Prowess" },
                            stepScore: { success: 3, failure: 1 },
                        },
                        {
                            id: "play_for_fun",
                            text: "Play for fun - let others shine",
                            consequence: "You make everyone look good, especially yourself",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "coach_from_sidelines",
                            text: "Coach from the sidelines with drinks",
                            consequence: "Strategic delegation is still leadership, right?",
                            alignment: "calculating",
                            stepScore: 1,
                        },
                        {
                            id: "make_it_interesting",
                            text: 'Make it "interesting" with a wager',
                            consequence: "The stakes just got higher...",
                            alignment: "risky",
                            stepScore: { betting: !0, range: [0, 4] },
                        },
                    ],
                },
                {
                    id: "team_brunch",
                    stepNumber: 2,
                    title: "🍳 Team Brunch Drama",
                    cinematicText:
                        "Morning light streams into the resort restaurant. Your team is gathered around a long table when suddenly {employee1} and {employee2} start arguing about a work incident.\n\nThe tension is palpable. Other diners are starting to look. What do you do?",
                    choices: [
                        {
                            id: "mediate_calmly",
                            text: "Mediate calmly - this is a team-building exercise",
                            consequence: "You channel your inner diplomat",
                            alignment: "diplomatic",
                            minigame: { type: "composure", difficulty: "medium", label: "Diplomatic Touch" },
                            stepScore: { success: 3, failure: 1 },
                        },
                        {
                            id: "side_with_one",
                            text: "Take {employee1}'s side decisively",
                            consequence: "Sometimes leaders need to pick sides",
                            alignment: "calculating",
                            stepScore: 2,
                            consequence_flag: "sided_with_employee1",
                        },
                        {
                            id: "make_them_hug",
                            text: "Force them to hug it out right now",
                            consequence: "Mandatory friendship achieved?",
                            alignment: "charismatic",
                            stepScore: 1,
                        },
                        {
                            id: "order_shots",
                            text: "Order a round of shots to defuse tension",
                            consequence: "Alcohol: the universal workplace lubricant",
                            alignment: "risky",
                            stepScore: 2,
                            cost: 500,
                        },
                    ],
                },
                {
                    id: "sauna_secrets",
                    stepNumber: 3,
                    title: "🧖 Sauna Confessions",
                    cinematicText:
                        'The steam is thick in the private sauna. It\'s just you and a few key employees when {employee3} starts opening up about something serious—they\'ve been offered a job at a competitor.\n\n"I haven\'t decided yet," they admit, looking at you through the steam. "But I wanted you to know first."',
                    choices: [
                        {
                            id: "counter_offer",
                            text: "Make an immediate counter-offer",
                            consequence: "Money talks, especially in a sauna",
                            alignment: "pragmatic",
                            stepScore: 3,
                            cost: 5e3,
                        },
                        {
                            id: "appeal_to_loyalty",
                            text: "Appeal to their sense of loyalty and belonging",
                            consequence: "You speak from the heart about what they mean to the team",
                            alignment: "charismatic",
                            minigame: { type: "intensity", difficulty: "hard", label: "Emotional Appeal" },
                            stepScore: { success: 4, failure: 0 },
                        },
                        {
                            id: "respect_their_choice",
                            text: "Respect their journey - wish them well if they go",
                            consequence: "Genuine leadership means letting go sometimes",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "subtle_threat",
                            text: "Remind them of their non-compete clause...",
                            consequence: "The temperature in the sauna drops suddenly",
                            alignment: "ruthless",
                            stepScore: 1,
                        },
                    ],
                },
                {
                    id: "boat_adventure",
                    stepNumber: 4,
                    title: "⛵ The Boat Incident",
                    cinematicText:
                        "The chartered yacht cuts through blue waters. Everyone's having a great time until the captain announces the engine is having trouble.\n\nYou're stranded about a mile from shore. Some employees are panicking, others are eyeing the inflatable dinghy. Your signal has no bars.\n\nThis is your moment.",
                    choices: [
                        {
                            id: "take_charge",
                            text: "Take charge - organize the team and figure this out",
                            consequence: "This is what you were born for",
                            alignment: "determined",
                            minigame: { type: "reflex", difficulty: "hard", label: "Crisis Management" },
                            stepScore: { success: 5, failure: 2 },
                        },
                        {
                            id: "delegate_to_expert",
                            text: "Find whoever has actual boat knowledge",
                            consequence: "Smart leaders know their limitations",
                            alignment: "pragmatic",
                            stepScore: 3,
                        },
                        {
                            id: "keep_morale_up",
                            text: "Start a singalong to keep spirits high",
                            consequence: "When in doubt, add music",
                            alignment: "charismatic",
                            stepScore: 2,
                        },
                        {
                            id: "first_to_dinghy",
                            text: "Quietly secure yourself a spot on the dinghy",
                            consequence: "Self-preservation is a valid strategy",
                            alignment: "ruthless",
                            stepScore: -1,
                        },
                    ],
                },
                {
                    id: "plane_reflection",
                    stepNumber: 5,
                    title: "✈️ Flight Home",
                    cinematicText:
                        'The plane hums steadily as your team flies home. {employee1} approaches your first-class seat (the only one company policy allows for).\n\n"Boss, this retreat... it changed things." They pause. "We all see you differently now."\n\nBased on everything that happened, they share their honest assessment...',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "accept_gracefully",
                            text: "Accept the feedback gracefully",
                            consequence: "You listen, truly listen, to what they have to say",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "promise_changes",
                            text: "Promise to do even better",
                            consequence: "Growth is a continuous journey",
                            alignment: "ambitious",
                            stepScore: 2,
                        },
                        {
                            id: "deflect_to_team",
                            text: 'Deflect - "It was a team effort"',
                            consequence: "Shared credit, shared success",
                            alignment: "diplomatic",
                            stepScore: 1,
                        },
                        {
                            id: "back_to_business",
                            text: '"Now, about Monday\'s deliverables..."',
                            consequence: "The retreat is over. Time to work.",
                            alignment: "calculating",
                            stepScore: 0,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 15,
                    title: "🏆 Legendary Leader",
                    text: "The retreat will be talked about for YEARS. You've become a legend.",
                    effects: { boost_all_trust: 25, boost_all_productivity: 15, reputation_boost: 20 },
                },
                excellent: {
                    threshold: 11,
                    title: "⭐ Team Transformed",
                    text: "Your team returns energized and unified. This was money well spent.",
                    effects: { boost_all_trust: 15, boost_all_productivity: 10, bonus_cash: 1e4 },
                },
                good: {
                    threshold: 7,
                    title: "👍 Solid Bonding",
                    text: "Good memories were made. The team feels closer.",
                    effects: { boost_all_trust: 10, boost_all_comfort: 10 },
                },
                neutral: {
                    threshold: 3,
                    title: "😐 Mixed Results",
                    text: "Some good moments, some awkward ones. Par for the course.",
                    effects: { boost_all_trust: 5 },
                },
                poor: {
                    threshold: -100,
                    title: "💔 Retreat from Reality",
                    text: "That... could have gone better. Several resignation letters await on Monday.",
                    effects: { decrease_all_trust: 10, random_employee_quits: !0 },
                },
            },
        },
        corporate_heist: {
            id: "corporate_heist",
            title: "🎭 The Corporate Heist",
            description: "A rival company has something you need. How far will you go to get it?",
            theme: "espionage",
            mood: "thriller",
            totalSteps: 4,
            requiredEmployees: 2,
            unlockConditions: { minEmployees: 8, minCash: 1e5, minAct: 3 },
            themeColor: "var(--l-violet-3)",
            steps: [
                {
                    id: "the_intel",
                    stepNumber: 1,
                    title: "🔍 The Intelligence",
                    cinematicText:
                        "A manila envelope lands on your desk. Inside: proof that Nexus Corp has been stealing YOUR proprietary methods. They're about to launch a product using your team's innovations.\n\nYour lawyer shrugs. \"Legal battle will take years. They'll profit while we fight.\"\n\n{employee1} leans in. \"I know someone who works there. We could... retrieve what's ours.\"",
                    choices: [
                        {
                            id: "go_legal",
                            text: "Take the high road - pursue legal channels",
                            consequence: "Justice moves slowly but righteously",
                            alignment: "lawful",
                            stepScore: 1,
                        },
                        {
                            id: "approve_operation",
                            text: 'Approve the "retrieval" operation',
                            consequence: "Sometimes you have to fight fire with fire",
                            alignment: "ruthless",
                            stepScore: 3,
                        },
                        {
                            id: "gather_more_intel",
                            text: "First, let's know exactly what we're dealing with",
                            consequence: "Knowledge is power",
                            alignment: "calculating",
                            minigame: { type: "recall", difficulty: "medium", label: "Strategic Planning" },
                            stepScore: { success: 2, failure: 1 },
                        },
                        {
                            id: "public_callout",
                            text: "Go public - expose them on social media",
                            consequence: "Transparency as a weapon",
                            alignment: "defiant",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "the_inside_person",
                    stepNumber: 2,
                    title: "🕵️ The Inside Contact",
                    cinematicText:
                        '{employee2} has arranged a clandestine meeting with their contact at Nexus: a disgruntled project manager named Alex.\n\nIn a dimly lit café, Alex slides a USB drive across the table. "Everything\'s on here. Client lists, internal comms, the stolen specs."\n\nThey want $50,000. And a job.',
                    choices: [
                        {
                            id: "pay_and_hire",
                            text: "Pay and offer them a position",
                            consequence: "A new asset joins your team",
                            alignment: "pragmatic",
                            stepScore: 3,
                            cost: 5e4,
                        },
                        {
                            id: "negotiate_down",
                            text: "Negotiate - they came to us, they need this",
                            consequence: "Never pay asking price",
                            alignment: "calculating",
                            minigame: { type: "tension", difficulty: "hard", label: "High-Stakes Negotiation" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "just_data",
                            text: "Take the data, but no job offer",
                            consequence: "You need the intel, not another mouth to feed",
                            alignment: "ruthless",
                            stepScore: 2,
                            cost: 5e4,
                        },
                        {
                            id: "walk_away",
                            text: "This feels wrong. Walk away.",
                            consequence: "Some lines shouldn't be crossed",
                            alignment: "lawful",
                            stepScore: 0,
                        },
                    ],
                },
                {
                    id: "the_discovery",
                    stepNumber: 3,
                    title: "💻 The Discovery",
                    cinematicText:
                        "The USB drive contains more than you expected. Yes, there's proof of theft—but there's also evidence of something darker. Nexus has been cooking their books. Millions in fraud.\n\nThis information could destroy them completely. Or it could be your bargaining chip.\n\n{employee1} whistles. \"Boss, this is nuclear.\"",
                    choices: [
                        {
                            id: "report_to_authorities",
                            text: "Report the fraud to authorities",
                            consequence: "Let the system handle justice",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                        {
                            id: "leverage_for_settlement",
                            text: "Use it as leverage for a massive settlement",
                            consequence: "They'll pay to keep this quiet",
                            alignment: "calculating",
                            minigame: { type: "composure", difficulty: "hard", label: "Power Play" },
                            stepScore: { success: 4, failure: 2 },
                        },
                        {
                            id: "destroy_them",
                            text: "Leak everything. Watch them burn.",
                            consequence: "Total annihilation",
                            alignment: "ruthless",
                            stepScore: 3,
                        },
                        {
                            id: "focus_on_original_goal",
                            text: "Ignore the fraud - just pursue our stolen IP",
                            consequence: "Stay focused on what matters",
                            alignment: "pragmatic",
                            stepScore: 1,
                        },
                    ],
                },
                {
                    id: "the_aftermath",
                    stepNumber: 4,
                    title: "⚖️ The Aftermath",
                    cinematicText:
                        'The dust is settling. Based on your choices, the situation has resolved one way or another.\n\nYour team gathers in the conference room. Some look at you with new respect. Others seem... uncertain about who you\'ve become.\n\n{employee2} finally speaks: "Was it worth it, boss?"',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "absolutely",
                            text: '"Absolutely. We protected what\'s ours."',
                            consequence: "You stand by every decision",
                            alignment: "determined",
                            stepScore: 2,
                        },
                        {
                            id: "means_to_end",
                            text: '"The ends justified the means."',
                            consequence: "Pragmatism in its purest form",
                            alignment: "calculating",
                            stepScore: 1,
                        },
                        {
                            id: "some_regrets",
                            text: '"I have some regrets... but I\'d do it again."',
                            consequence: "Honesty about moral complexity",
                            alignment: "humble",
                            stepScore: 1,
                        },
                        {
                            id: "never_speak_of_this",
                            text: '"We never speak of this again."',
                            consequence: "Some things are best buried",
                            alignment: "cautious",
                            stepScore: 0,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 12,
                    title: "👑 Corporate Kingpin",
                    text: "You didn't just win—you dominated. Nexus is finished, and everyone knows you did it.",
                    effects: { bonus_cash: 2e5, reputation_boost: 30, boost_all_productivity: 20 },
                },
                excellent: {
                    threshold: 9,
                    title: "🎯 Mission Accomplished",
                    text: "Your IP is protected, and you came out stronger. Clean or dirty, victory is victory.",
                    effects: { bonus_cash: 1e5, reputation_boost: 15, boost_all_trust: 10 },
                },
                good: {
                    threshold: 6,
                    title: "✅ Justice Served",
                    text: "The situation is resolved favorably. Your team respects your choices.",
                    effects: { bonus_cash: 5e4, boost_all_trust: 10 },
                },
                neutral: {
                    threshold: 3,
                    title: "😐 Complicated Victory",
                    text: "You got some of what you wanted, but at what cost?",
                    effects: { bonus_cash: 2e4 },
                },
                poor: {
                    threshold: -100,
                    title: "💀 Pyrrhic Victory",
                    text: "The operation went sideways. You might face legal consequences yourself...",
                    effects: { fine: 1e5, decrease_all_trust: 15, investigation: 30 },
                },
            },
        },
        office_romance: {
            id: "office_romance",
            title: "💕 The Office Romance",
            description: "Love blooms between two of your employees. Your handling will affect the whole office.",
            theme: "relationships",
            mood: "drama",
            totalSteps: 3,
            requiredEmployees: 4,
            unlockConditions: { minEmployees: 6, minAct: 1 },
            themeColor: "var(--l-pink)",
            nsfwEnhanced: !0,
            steps: [
                {
                    id: "the_discovery",
                    stepNumber: 1,
                    title: "💋 The Discovery",
                    cinematicText:
                        'You walk into the supply closet for printer paper and freeze. {employee1} and {employee2} spring apart, faces flushed.\n\n"This isn\'t... we were just..." {employee1} stammers.\n\nThe whole office will hear about this by lunch. How you handle it now will set the tone.',
                    choices: [
                        {
                            id: "professional_boundary",
                            text: '"Company policy requires you disclose this to HR"',
                            consequence: "By the book, as always",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                        {
                            id: "wink_and_leave",
                            text: "Wink and back out slowly",
                            consequence: "You saw nothing. NOTHING.",
                            alignment: "charismatic",
                            stepScore: 2,
                        },
                        {
                            id: "stern_warning",
                            text: '"Not on company time. My office. One hour."',
                            consequence: "This needs addressing",
                            alignment: "calculating",
                            stepScore: 1,
                        },
                        {
                            id: "supportive_reaction",
                            text: '"I\'m happy for you two! Just... maybe lock the door?"',
                            consequence: "Love wins (with practical advice)",
                            alignment: "light",
                            stepScore: 3,
                        },
                    ],
                },
                {
                    id: "the_complication",
                    stepNumber: 2,
                    title: "💔 The Complication",
                    cinematicText:
                        "It's been a few weeks. The lovebirds have been professional, but now there's a problem.\n\n{employee3} storms into your office. \"I was supposed to get that promotion! But you gave it to {employee2} because they're sleeping with {employee1}!\"\n\nWhether it's true or not, the perception is there. This is a powder keg.",
                    choices: [
                        {
                            id: "review_decision",
                            text: "Review the promotion decision with full transparency",
                            consequence: "Let the evidence speak",
                            alignment: "lawful",
                            minigame: { type: "recall", difficulty: "medium", label: "Documentation Review" },
                            stepScore: { success: 3, failure: 1 },
                        },
                        {
                            id: "stand_firm",
                            text: "Stand by your decision - the promotion was earned",
                            consequence: "Leadership means making unpopular calls",
                            alignment: "determined",
                            stepScore: 2,
                        },
                        {
                            id: "compromise_offer",
                            text: "Offer {employee3} a different opportunity",
                            consequence: "There's more than one path to success",
                            alignment: "diplomatic",
                            stepScore: 2,
                            cost: 2e3,
                        },
                        {
                            id: "separate_the_lovers",
                            text: "Transfer one of the couple to a different team",
                            consequence: "The nuclear option",
                            alignment: "ruthless",
                            stepScore: 0,
                        },
                    ],
                },
                {
                    id: "the_resolution",
                    stepNumber: 3,
                    title: "💝 Love's Conclusion",
                    cinematicText:
                        'Months have passed. {employee1} and {employee2} are now engaged.\n\nThey approach you together. "We wanted to thank you for how you handled everything. Not every boss would have..." they trail off, emotional.\n\nThe office is watching. This moment will define the culture.',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "celebrate_publicly",
                            text: "Announce a celebration - love should be celebrated!",
                            consequence: "You throw them an engagement party",
                            alignment: "light",
                            stepScore: 3,
                            cost: 1e3,
                        },
                        {
                            id: "private_congratulations",
                            text: "Congratulate them privately, maintain professionalism",
                            consequence: "Warm but appropriate",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "warn_about_breakups",
                            text: '"Happy for you. But if this goes south, we need a plan..."',
                            consequence: "Always planning for contingencies",
                            alignment: "calculating",
                            stepScore: 1,
                        },
                        {
                            id: "policy_update",
                            text: "Use this as a chance to update office relationship policies",
                            consequence: "Turn this into a teaching moment",
                            alignment: "lawful",
                            stepScore: 1,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 8,
                    title: "💖 Cupid CEO",
                    text: "You've created an office where love can flourish AND work gets done. The couple names their first child after you (middle name).",
                    effects: { boost_all_comfort: 20, boost_all_trust: 15, reputation_boost: 10 },
                },
                excellent: {
                    threshold: 6,
                    title: "💕 Relationship Goals",
                    text: "The office sees you as understanding and human. Morale is at an all-time high.",
                    effects: { boost_all_comfort: 15, boost_all_trust: 10 },
                },
                good: {
                    threshold: 4,
                    title: "👍 Handled Well",
                    text: "Not perfect, but you navigated a tricky situation with grace.",
                    effects: { boost_all_comfort: 10 },
                },
                neutral: {
                    threshold: 2,
                    title: "😐 Bureaucratic Romance",
                    text: "The paperwork is in order. The romance survived. Barely.",
                    effects: { boost_all_trust: 5 },
                },
                poor: {
                    threshold: -100,
                    title: "💔 HR Nightmare",
                    text: "Your handling made everything worse. One of them quit. The other is talking to lawyers.",
                    effects: { employee_quits: !0, decrease_all_trust: 10, reputation_hit: 15 },
                },
            },
        },
        investor_pitch: {
            id: "investor_pitch",
            title: "💼 The Investor Pitch",
            description: "A legendary venture capitalist wants to hear your pitch. This could change everything.",
            theme: "business",
            mood: "high_stakes",
            totalSteps: 4,
            requiredEmployees: 2,
            unlockConditions: { minEmployees: 4, minCash: 25e3, minAct: 2 },
            themeColor: "var(--l-gold)",
            steps: [
                {
                    id: "the_call",
                    stepNumber: 1,
                    title: "📞 The Unexpected Call",
                    cinematicText:
                        'Your phone buzzes. Unknown number. You almost ignore it.\n\n"This is Marcus Chen from Titan Ventures. I\'ve been watching your company. I think you\'re onto something."\n\nYour heart races. Titan Ventures has made millionaires out of startups. They want a pitch meeting. Tomorrow.\n\n{employee1} looks up from their desk. "Boss? You look like you\'ve seen a ghost."',
                    choices: [
                        {
                            id: "accept_confidently",
                            text: '"Tomorrow works. Let\'s make history."',
                            consequence: "Confidence is key in this game",
                            alignment: "ambitious",
                            stepScore: 3,
                        },
                        {
                            id: "negotiate_time",
                            text: "Ask for more time to prepare",
                            consequence: "Better to be prepared than lucky",
                            alignment: "cautious",
                            stepScore: 2,
                        },
                        {
                            id: "play_hard_to_get",
                            text: '"I\'m quite busy... but I suppose I could fit you in"',
                            consequence: "Power dynamics matter",
                            alignment: "cunning",
                            minigame: { type: "composure", difficulty: "medium", label: "Power Play" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "honest_excitement",
                            text: '"Are you serious?! YES! Absolutely!"',
                            consequence: "Authentic enthusiasm has its charms",
                            alignment: "humble",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "the_prep",
                    stepNumber: 2,
                    title: "📊 Preparation Night",
                    cinematicText:
                        'It\'s midnight. Your team has been working on the pitch deck for hours.\n\n{employee1} is running on their fifth coffee. {employee2} just caught a critical error in the financial projections.\n\n"Boss, the numbers don\'t quite add up," {employee2} says quietly. "We could fudge them slightly, or present the honest picture which is... less impressive."',
                    choices: [
                        {
                            id: "honest_numbers",
                            text: "Keep the numbers honest - integrity first",
                            consequence: "The truth will set you free (or tank your valuation)",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                        {
                            id: "creative_accounting",
                            text: '"Creative projections" aren\'t lies, right?',
                            consequence: "Every startup stretches the truth a little",
                            alignment: "cunning",
                            stepScore: 3,
                        },
                        {
                            id: "pivot_narrative",
                            text: "Pivot to a different narrative that fits the real numbers",
                            consequence: "Find the angle that makes reality look good",
                            alignment: "innovative",
                            minigame: { type: "recall", difficulty: "hard", label: "Strategic Pivot" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "delay_to_fix",
                            text: "Postpone the meeting - we need this right",
                            consequence: "Second chances are rare in venture capital",
                            alignment: "cautious",
                            stepScore: 0,
                        },
                    ],
                },
                {
                    id: "the_pitch",
                    stepNumber: 3,
                    title: "🎤 The Big Moment",
                    cinematicText:
                        'The conference room at Titan Ventures gleams with success. Marcus Chen sits across from you, flanked by two analysts.\n\n"You have fifteen minutes," Marcus says, tapping his watch. "Impress me."\n\nYour team is watching through the glass. Everything leads to this moment.',
                    choices: [
                        {
                            id: "vision_pitch",
                            text: "Lead with the grand vision - paint the future",
                            consequence: "Dreams can be contagious",
                            alignment: "charismatic",
                            minigame: { type: "intensity", difficulty: "hard", label: "Visionary Pitch" },
                            stepScore: { success: 5, failure: 2 },
                        },
                        {
                            id: "numbers_first",
                            text: "Let the numbers speak - cold, hard ROI",
                            consequence: "Investors love returns",
                            alignment: "pragmatic",
                            minigame: { type: "precision", difficulty: "medium", label: "Financial Precision" },
                            stepScore: { success: 4, failure: 2 },
                        },
                        {
                            id: "emotional_story",
                            text: "Tell the human story - why this matters",
                            consequence: "Even investors have hearts... supposedly",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "aggressive_close",
                            text: 'Challenge them - "You need US more than we need you"',
                            consequence: "Bold. Very bold.",
                            alignment: "risky",
                            stepScore: { betting: !0, range: [-1, 5] },
                        },
                    ],
                },
                {
                    id: "the_verdict",
                    stepNumber: 4,
                    title: "⚖️ The Verdict",
                    cinematicText:
                        'Marcus sets down his pen. The silence stretches for an eternity.\n\n"Interesting," he finally says. His poker face reveals nothing.\n\nHis analysts exchange glances. One shrugs slightly. The other nods almost imperceptibly.\n\n"I have one question," Marcus leans forward. "Why should I bet on YOU, specifically?"',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "promise_results",
                            text: '"Because I will make you money. Full stop."',
                            consequence: "The investor's favorite promise",
                            alignment: "ambitious",
                            stepScore: 2,
                        },
                        {
                            id: "team_strength",
                            text: "\"You're not betting on me - you're betting on this team\"",
                            consequence: "Humility and strength combined",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "track_record",
                            text: '"Look at what we\'ve already built with nothing"',
                            consequence: "Past performance is the best predictor",
                            alignment: "determined",
                            stepScore: 2,
                        },
                        {
                            id: "counter_question",
                            text: '"Why not? What do you see that makes you hesitate?"',
                            consequence: "Turn the tables",
                            alignment: "cunning",
                            minigame: { type: "composure", difficulty: "hard", label: "Negotiation Mastery" },
                            stepScore: { success: 3, failure: 0 },
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 14,
                    title: "🦄 Unicorn Potential",
                    text: 'Marcus writes a check on the spot. "I knew it the moment you walked in." You\'ve secured Series A funding that will change everything.',
                    effects: { bonus_cash: 5e5, reputation_boost: 30, boost_all_productivity: 25 },
                },
                excellent: {
                    threshold: 10,
                    title: "💰 Deal Closed",
                    text: '"We\'re in," Marcus says with a rare smile. The terms are fair, the future is bright.',
                    effects: { bonus_cash: 25e4, reputation_boost: 20, boost_all_trust: 15 },
                },
                good: {
                    threshold: 7,
                    title: "🤝 Term Sheet Incoming",
                    text: '"Send me your deck. Let\'s continue this conversation." Not a yes, but not a no.',
                    effects: { bonus_cash: 5e4, reputation_boost: 10 },
                },
                neutral: {
                    threshold: 4,
                    title: '⏳ "We\'ll Be in Touch"',
                    text: "The dreaded non-answer. Maybe they'll call. Maybe they won't.",
                    effects: { reputation_boost: 5 },
                },
                poor: {
                    threshold: -100,
                    title: "❌ Hard Pass",
                    text: '"I don\'t see it," Marcus says, already checking his phone. The meeting is over. Your team saw everything through that glass.',
                    effects: { decrease_all_trust: 10, reputation_hit: 10 },
                },
            },
        },
        crisis_management: {
            id: "crisis_management",
            title: "🚨 Crisis Management",
            description: "Everything is on fire. Sometimes literally. Can you hold it together?",
            theme: "survival",
            mood: "tense",
            totalSteps: 4,
            requiredEmployees: 4,
            unlockConditions: { minEmployees: 6, minCash: 1e4, minAct: 2 },
            themeColor: "var(--l-red)",
            steps: [
                {
                    id: "the_disaster",
                    stepNumber: 1,
                    title: "💥 Everything Falls Apart",
                    cinematicText:
                        "You arrive at work to find chaos.\n\nThe main server is down. A major client is threatening to sue. {employee1} is in tears. {employee2} is screaming at {employee3}. Someone burned popcorn so bad the fire alarm is going off.\n\nEveryone turns to you. The clock is ticking.",
                    choices: [
                        {
                            id: "triage_mode",
                            text: "Triage - identify the most critical issue first",
                            consequence: "Prioritization under pressure",
                            alignment: "calculating",
                            minigame: { type: "reflex", difficulty: "medium", label: "Crisis Assessment" },
                            stepScore: { success: 3, failure: 1 },
                        },
                        {
                            id: "delegate_everything",
                            text: "Delegate - assign each crisis to someone capable",
                            consequence: "Trust your people",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "calm_everyone_first",
                            text: "Stop. Everyone take a breath. We'll figure this out together.",
                            consequence: "Calm is contagious",
                            alignment: "diplomatic",
                            stepScore: 2,
                        },
                        {
                            id: "panic",
                            text: "Panic internally while appearing calm externally",
                            consequence: "Fake it till you make it?",
                            alignment: "cautious",
                            stepScore: 1,
                        },
                    ],
                },
                {
                    id: "the_client",
                    stepNumber: 2,
                    title: "📱 The Angry Client",
                    cinematicText:
                        'The client, Meridian Corp, is on the line. Their CEO sounds ready to commit murder.\n\n"This breach has cost us MILLIONS. We trusted you! I want answers, I want heads to roll, and I want them NOW!"\n\n{employee4} mouths "sorry" from across the room. This was their account.',
                    choices: [
                        {
                            id: "take_responsibility",
                            text: "Fall on your sword - take full responsibility",
                            consequence: "The buck stops with you",
                            alignment: "humble",
                            stepScore: 3,
                        },
                        {
                            id: "deflect_to_employee",
                            text: "Point out that {employee4} was the account lead",
                            consequence: "Honesty or betrayal?",
                            alignment: "ruthless",
                            stepScore: 0,
                        },
                        {
                            id: "solution_focused",
                            text: "Skip the blame game - focus only on solutions",
                            consequence: "Forward momentum",
                            alignment: "pragmatic",
                            minigame: { type: "composure", difficulty: "hard", label: "De-escalation" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "offer_compensation",
                            text: "Offer significant compensation immediately",
                            consequence: "Money heals many wounds",
                            alignment: "diplomatic",
                            stepScore: 2,
                            cost: 1e4,
                        },
                    ],
                },
                {
                    id: "the_team",
                    stepNumber: 3,
                    title: "👥 Team Breakdown",
                    cinematicText:
                        'The immediate fires are controlled, but now {employee2} and {employee3} are at each other\'s throats.\n\n"This is YOUR fault!" {employee2} shouts. "If you\'d done your job—"\n\n"MY fault?! You\'re the one who—"\n\n{employee1} is still crying quietly in the corner. The team is fracturing.',
                    choices: [
                        {
                            id: "mandatory_meeting",
                            text: "Mandatory all-hands meeting - air everything out",
                            consequence: "Radical transparency",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                        {
                            id: "separate_and_talk",
                            text: "Separate them and talk to each privately",
                            consequence: "Individual attention matters",
                            alignment: "diplomatic",
                            minigame: { type: "intensity", difficulty: "medium", label: "Emotional Intelligence" },
                            stepScore: { success: 3, failure: 1 },
                        },
                        {
                            id: "tough_love",
                            text: "\"I don't care who's at fault. Fix it or you're ALL fired.\"",
                            consequence: "Fear can motivate... or destroy",
                            alignment: "ruthless",
                            stepScore: 1,
                        },
                        {
                            id: "comfort_the_crying",
                            text: "Prioritize {employee1} - they're clearly struggling most",
                            consequence: "Compassion for the vulnerable",
                            alignment: "light",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "the_aftermath",
                    stepNumber: 4,
                    title: "🌅 After the Storm",
                    cinematicText:
                        "It's 11 PM. The office is quiet. The servers are back up. The client has been... managed. The team is exhausted.\n\n{employee1} approaches you, looking like they haven't slept in days. \"Boss... was today... are we going to be okay?\"\n\nEveryone still here is watching for your answer.",
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "honest_assessment",
                            text: '"Today was bad. But we survived. That means something."',
                            consequence: "Honest hope",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "inspiring_speech",
                            text: "Give a rallying speech about resilience",
                            consequence: "Leaders inspire",
                            alignment: "charismatic",
                            stepScore: 2,
                        },
                        {
                            id: "order_food",
                            text: "Order everyone dinner and just sit together",
                            consequence: "Sometimes presence is enough",
                            alignment: "light",
                            stepScore: 3,
                            cost: 500,
                        },
                        {
                            id: "back_to_work",
                            text: '"Okay, time to figure out how this never happens again"',
                            consequence: "Always forward",
                            alignment: "determined",
                            stepScore: 1,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 11,
                    title: "🦸 Crisis Champion",
                    text: "Against all odds, you didn't just survive—you unified your team. They'll follow you into any fire now.",
                    effects: { boost_all_trust: 25, boost_all_comfort: 20, reputation_boost: 15 },
                },
                excellent: {
                    threshold: 8,
                    title: "✨ Grace Under Pressure",
                    text: "You held it together when everything was falling apart. Respect earned.",
                    effects: { boost_all_trust: 15, boost_all_comfort: 10 },
                },
                good: {
                    threshold: 5,
                    title: "👍 Damage Controlled",
                    text: "It wasn't pretty, but you stopped the bleeding. That counts.",
                    effects: { boost_all_trust: 10 },
                },
                neutral: {
                    threshold: 2,
                    title: "😰 Barely Surviving",
                    text: "The company lives another day. Barely. Morale is... not great.",
                    effects: { boost_all_comfort: -5 },
                },
                poor: {
                    threshold: -100,
                    title: "💀 Total Meltdown",
                    text: "The crisis exposed cracks that can't be fixed. Multiple resignations incoming.",
                    effects: { decrease_all_trust: 20, employee_quits: !0, reputation_hit: 15 },
                },
            },
        },
        after_hours_party: {
            id: "after_hours_party",
            title: "🌙 After Hours",
            description: "The office party takes an unexpected turn. Lines between professional and personal blur.",
            theme: "nightlife",
            mood: "intimate",
            totalSteps: 4,
            requiredEmployees: 3,
            unlockConditions: { minEmployees: 5, minCash: 2e4, minAct: 2 },
            themeColor: "var(--l-red)",
            nsfwEnhanced: !0,
            steps: [
                {
                    id: "party_begins",
                    stepNumber: 1,
                    title: "🎉 The Celebration",
                    cinematicText:
                        "The office has transformed. Fairy lights, music, and the scent of catering fill the air. You've hit a major milestone and everyone's ready to celebrate.\n\n{employee1} approaches you, drink in hand. \"Boss, you've been working so hard. Tonight, you should actually relax.\"\n\nThe party is in full swing. How do you set the tone?",
                    choices: [
                        {
                            id: "professional_host",
                            text: "Be the gracious host - mingle professionally",
                            consequence: "Keep it classy, as always",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                        {
                            id: "join_the_fun",
                            text: "Let loose! You deserve to enjoy this too",
                            consequence: "Tonight you're not just the boss",
                            alignment: "charismatic",
                            stepScore: 3,
                        },
                        {
                            id: "observe_from_corner",
                            text: "Watch from the sidelines - learn about your people",
                            consequence: "Sometimes observation reveals truth",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "speech_time",
                            text: "Make an inspiring speech about the team",
                            consequence: "Words have power",
                            alignment: "ambitious",
                            minigame: { type: "intensity", difficulty: "medium", label: "Inspirational Toast" },
                            stepScore: { success: 4, failure: 1 },
                        },
                    ],
                },
                {
                    id: "unexpected_moment",
                    stepNumber: 2,
                    title: "✨ The Moment",
                    cinematicText:
                        'Hours pass. The party has thinned out, but a core group remains. {employee2} is telling ridiculous stories. {employee3} is showing off dance moves.\n\nThen, unexpectedly, {employee1} finds you alone by the window. The city lights sparkle below.\n\n"You know," they say softly, "I\'ve always wanted to tell you something..."',
                    choices: [
                        {
                            id: "listen_intently",
                            text: "Listen - give them your full attention",
                            consequence: "Sometimes the best response is silence",
                            alignment: "humble",
                            stepScore: 3,
                        },
                        {
                            id: "redirect_conversation",
                            text: "Steer toward safer topics",
                            consequence: "Boundaries matter",
                            alignment: "cautious",
                            stepScore: 2,
                        },
                        {
                            id: "lean_in",
                            text: 'Lean in... "Tell me everything"',
                            consequence: "The line between boss and confidant blurs",
                            alignment: "risky",
                            minigame: { type: "composure", difficulty: "hard", label: "Emotional Navigation" },
                            stepScore: { success: 4, failure: 0 },
                        },
                        {
                            id: "share_first",
                            text: "Open up first - vulnerability invites vulnerability",
                            consequence: "You show them your human side",
                            alignment: "light",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "complications",
                    stepNumber: 3,
                    title: "🌪️ Complications",
                    cinematicText:
                        'The conversation with {employee1} has shifted something. The air between you is different now.\n\nBut {employee2} has noticed. They pull you aside. "Boss, I saw you two talking. Be careful. Office relationships are..." they trail off.\n\nMeanwhile, {employee3} is getting a bit too drunk and might need intervention.',
                    choices: [
                        {
                            id: "handle_drunk",
                            text: "Prioritize {employee3} - they need help now",
                            consequence: "Responsibility comes first",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                        {
                            id: "deflect_to_employee2",
                            text: '"Mind your own business" to {employee2}',
                            consequence: "Your personal life is your own",
                            alignment: "defiant",
                            stepScore: 1,
                        },
                        {
                            id: "honest_with_employee2",
                            text: "Be honest with {employee2} about your feelings",
                            consequence: "Transparency, even when uncomfortable",
                            alignment: "humble",
                            stepScore: 3,
                        },
                        {
                            id: "deny_everything",
                            text: "Deny any romantic tension - you're just colleagues",
                            consequence: "Protect the professional facade",
                            alignment: "cautious",
                            stepScore: 1,
                        },
                    ],
                },
                {
                    id: "dawn_decision",
                    stepNumber: 4,
                    title: "🌅 As Dawn Breaks",
                    cinematicText:
                        "The party is over. It's nearly sunrise. The office is quiet except for a few stragglers.\n\n{employee1} catches your eye across the room. The question hangs unspoken between you.\n\nYou're the boss. Whatever happens next will define more than just tonight.",
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "professional_goodbye",
                            text: "Bid everyone a professional goodnight",
                            consequence: "Protect what matters: the team, the work",
                            alignment: "lawful",
                            stepScore: 1,
                        },
                        {
                            id: "offer_ride",
                            text: "Offer {employee1} a ride home",
                            consequence: "A simple gesture, with complex implications",
                            alignment: "risky",
                            stepScore: 2,
                        },
                        {
                            id: "continue_conversation",
                            text: "Suggest grabbing breakfast to continue talking",
                            consequence: "The night doesn't have to end",
                            alignment: "charismatic",
                            stepScore: 3,
                        },
                        {
                            id: "leave_alone",
                            text: "Slip out quietly alone - you need to think",
                            consequence: "Some decisions need time",
                            alignment: "cautious",
                            stepScore: 1,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 11,
                    title: "💫 Unforgettable Night",
                    text: "Something genuine blossomed tonight. The office will never feel quite the same—in the best possible way.",
                    effects: { boost_all_trust: 20, boost_all_comfort: 25, reputation_boost: 10 },
                },
                excellent: {
                    threshold: 8,
                    title: "✨ Meaningful Connection",
                    text: "You navigated complexity with grace. New bonds were forged, and old ones deepened.",
                    effects: { boost_all_trust: 15, boost_all_comfort: 15 },
                },
                good: {
                    threshold: 5,
                    title: "🎭 Memorable Evening",
                    text: "A good party with some interesting moments. People will remember this one.",
                    effects: { boost_all_comfort: 15 },
                },
                neutral: {
                    threshold: 2,
                    title: "🌙 Just Another Party",
                    text: "Fun was had. Boundaries were maintained. Life goes on.",
                    effects: { boost_all_comfort: 5 },
                },
                poor: {
                    threshold: -100,
                    title: "💔 Awkward Morning After",
                    text: "Some things can't be unsaid, and some boundaries shouldn't be crossed. HR may need to get involved.",
                    effects: { decrease_all_trust: 15, decrease_all_comfort: 10 },
                },
            },
        },
        the_merger: {
            id: "the_merger",
            title: "🏢 The Merger",
            description: "A larger company wants to acquire yours. The next few days will determine your future.",
            theme: "corporate",
            mood: "tense",
            totalSteps: 5,
            requiredEmployees: 4,
            unlockConditions: { minEmployees: 8, minCash: 2e5, minAct: 3 },
            themeColor: "var(--l-blue)",
            steps: [
                {
                    id: "the_offer",
                    stepNumber: 1,
                    title: "📋 The Offer",
                    cinematicText:
                        'A black town car pulls up outside your office. Two executives in expensive suits step out.\n\n"We\'re from Apex Industries," the taller one says. "We\'d like to discuss... an acquisition."\n\nThey slide a folder across your desk. The number inside makes your heart skip. It\'s more money than you ever imagined.\n\n{employee1} peeks in. "Boss? Everything okay?"',
                    choices: [
                        {
                            id: "consider_seriously",
                            text: "Take the meeting seriously - hear them out fully",
                            consequence: "Knowledge is leverage",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "reject_immediately",
                            text: '"We\'re not for sale. Thank you for your interest."',
                            consequence: "Pride has its price",
                            alignment: "defiant",
                            stepScore: 1,
                        },
                        {
                            id: "play_hardball",
                            text: '"This number? That\'s insulting. Triple it."',
                            consequence: "Go big or go home",
                            alignment: "ambitious",
                            minigame: { type: "composure", difficulty: "hard", label: "Power Negotiation" },
                            stepScore: { success: 4, failure: 0 },
                        },
                        {
                            id: "stall_for_time",
                            text: "Ask for a week to consider",
                            consequence: "Time creates options",
                            alignment: "cautious",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "team_reaction",
                    stepNumber: 2,
                    title: "👥 The Team Finds Out",
                    cinematicText:
                        "Word has leaked. {employee2} confronts you in the hallway.\n\n\"Is it true? You're selling us out?\"\n\nThe break room has gone silent. Everyone is listening. Some look hopeful—maybe they'll get a payout. Others look betrayed.\n\n{employee3} just stares at you, arms crossed.",
                    choices: [
                        {
                            id: "full_transparency",
                            text: "Call an all-hands meeting - full transparency",
                            consequence: "Trust is built on truth",
                            alignment: "lawful",
                            stepScore: 3,
                        },
                        {
                            id: "deny_everything",
                            text: '"Just exploratory talks. Nothing to worry about."',
                            consequence: "A convenient half-truth",
                            alignment: "cunning",
                            stepScore: 1,
                        },
                        {
                            id: "promise_protection",
                            text: "Promise their jobs are safe no matter what",
                            consequence: "A promise you may not be able to keep",
                            alignment: "light",
                            stepScore: 2,
                        },
                        {
                            id: "appeal_to_opportunity",
                            text: '"This could be GOOD for all of us. Think bigger."',
                            consequence: "Reframe the narrative",
                            alignment: "charismatic",
                            minigame: { type: "intensity", difficulty: "medium", label: "Inspiring Vision" },
                            stepScore: { success: 3, failure: 1 },
                        },
                    ],
                },
                {
                    id: "due_diligence",
                    stepNumber: 3,
                    title: "🔍 Due Diligence",
                    cinematicText:
                        'Apex\'s auditors are crawling through everything. Every spreadsheet, every email, every contract.\n\nOne of them pulls you aside. "We found some... irregularities in your Q3 reports."\n\nYour stomach drops. {employee1} made those reports. Were they hiding something? Or is this a negotiation tactic?',
                    choices: [
                        {
                            id: "investigate_internally",
                            text: "Investigate before responding",
                            consequence: "Know thy own house",
                            alignment: "calculating",
                            minigame: { type: "recall", difficulty: "hard", label: "Financial Analysis" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "confront_employee",
                            text: "Confront {employee1} immediately",
                            consequence: "Direct action, potential consequences",
                            alignment: "determined",
                            stepScore: 2,
                        },
                        {
                            id: "dismiss_concerns",
                            text: '"Standard accounting variance. Not material."',
                            consequence: "Confidence can mask many sins",
                            alignment: "risky",
                            stepScore: { betting: !0, range: [-1, 3] },
                        },
                        {
                            id: "offer_explanation",
                            text: "Provide detailed context for the numbers",
                            consequence: "Transparency as defense",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "counter_offer",
                    stepNumber: 4,
                    title: "⚔️ The Counter-Move",
                    cinematicText:
                        "Just when you thought Apex had all the leverage, your phone rings. It's a rival company—Zenith Corp.\n\n\"We heard Apex is sniffing around. We'd hate to see you absorbed by them. Perhaps we could... counter-offer?\"\n\nA bidding war could make you rich. Or it could blow up in your face.",
                    choices: [
                        {
                            id: "play_them_off",
                            text: "Play both companies against each other",
                            consequence: "Maximum leverage, maximum risk",
                            alignment: "cunning",
                            minigame: { type: "tension", difficulty: "hard", label: "High-Stakes Poker" },
                            stepScore: { success: 5, failure: -1 },
                        },
                        {
                            id: "stay_loyal_apex",
                            text: "Honor your discussions with Apex",
                            consequence: "Your word means something",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                        {
                            id: "use_as_leverage",
                            text: "Use Zenith to negotiate better Apex terms",
                            consequence: "Business is business",
                            alignment: "calculating",
                            stepScore: 3,
                        },
                        {
                            id: "reject_both",
                            text: '"Thank you both, but we\'re staying independent."',
                            consequence: "Independence has its value",
                            alignment: "defiant",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "final_decision",
                    stepNumber: 5,
                    title: "🖊️ The Signing",
                    cinematicText:
                        "The contracts are on your desk. Lawyers on both sides. Your team watches through the glass.\n\n{employee1}, {employee2}, and {employee3} have their futures in your hands. This signature will change everything.\n\nThe pen feels impossibly heavy.",
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "sign_deal",
                            text: "Sign the deal - secure everyone's future",
                            consequence: "A new chapter begins",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "negotiate_last_minute",
                            text: "Push for one final concession",
                            consequence: "Never leave money on the table",
                            alignment: "ambitious",
                            stepScore: 2,
                        },
                        {
                            id: "walk_away",
                            text: "Walk away from the table",
                            consequence: "Sometimes the best deal is no deal",
                            alignment: "defiant",
                            stepScore: 3,
                        },
                        {
                            id: "employee_ownership",
                            text: "Counter-propose: employee ownership stake instead",
                            consequence: "Share the wealth, share the risk",
                            alignment: "light",
                            stepScore: 3,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 14,
                    title: "👑 Master Negotiator",
                    text: "You played every angle perfectly. Whether you sold or stayed independent, you got everything you wanted and more.",
                    effects: { bonus_cash: 5e5, boost_all_trust: 25, reputation_boost: 30 },
                },
                excellent: {
                    threshold: 10,
                    title: "💼 Shrewd Executive",
                    text: "You navigated treacherous waters with skill. Your team respects your decisions.",
                    effects: { bonus_cash: 2e5, boost_all_trust: 15, reputation_boost: 15 },
                },
                good: {
                    threshold: 6,
                    title: "✅ Deal Done",
                    text: "The outcome was favorable, if not perfect. Business continues.",
                    effects: { bonus_cash: 1e5, boost_all_trust: 10 },
                },
                neutral: {
                    threshold: 3,
                    title: "😐 Complicated Exit",
                    text: "Some won, some lost. The dust will take time to settle.",
                    effects: { bonus_cash: 5e4 },
                },
                poor: {
                    threshold: -100,
                    title: "💀 Hostile Takeover",
                    text: "You lost control of the situation. The terms were... not favorable.",
                    effects: { decrease_all_trust: 20, fine: 1e5, random_employee_quits: !0 },
                },
            },
        },
        the_whistleblower: {
            id: "the_whistleblower",
            title: "📢 The Whistleblower",
            description:
                "Someone in your company knows something they shouldn't. How you handle this will define you.",
            theme: "ethics",
            mood: "thriller",
            totalSteps: 4,
            requiredEmployees: 3,
            unlockConditions: { minEmployees: 6, minCash: 5e4, minAct: 2 },
            themeColor: "var(--l-red-3)",
            steps: [
                {
                    id: "anonymous_tip",
                    stepNumber: 1,
                    title: "📧 The Anonymous Tip",
                    cinematicText:
                        "An envelope with no return address sits on your desk. Inside: documents showing that someone in your company has been embezzling. Not a lot—but consistently, for months.\n\nThe trail leads to someone you trust. {employee1}'s signature is on several of the questionable invoices.\n\nThere's a note: \"I thought you should know. - A Friend\"",
                    choices: [
                        {
                            id: "confront_directly",
                            text: "Confront {employee1} directly",
                            consequence: "Face-to-face reveals truth",
                            alignment: "determined",
                            stepScore: 2,
                        },
                        {
                            id: "investigate_quietly",
                            text: "Investigate quietly before acting",
                            consequence: "Gather evidence first",
                            alignment: "calculating",
                            minigame: { type: "recall", difficulty: "medium", label: "Financial Investigation" },
                            stepScore: { success: 3, failure: 1 },
                        },
                        {
                            id: "call_police",
                            text: "Report to authorities immediately",
                            consequence: "Let the law handle it",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                        {
                            id: "destroy_evidence",
                            text: "Destroy the envelope and pretend you never saw it",
                            consequence: "What you don't know can't hurt you... right?",
                            alignment: "dark",
                            stepScore: -1,
                        },
                    ],
                },
                {
                    id: "the_confession",
                    stepNumber: 2,
                    title: "💔 The Confession",
                    cinematicText:
                        '{employee1} sits across from you, pale and trembling.\n\n"I can explain," they whisper. "My mother... she\'s sick. The medical bills... I was going to pay it all back. I swear."\n\nTears stream down their face. "Please. I have kids. If I lose this job..."\n\n{employee2} walks past the door. They see {employee1} crying. Great. Now others will ask questions.',
                    choices: [
                        {
                            id: "show_mercy",
                            text: "Show mercy - offer a repayment plan instead of firing",
                            consequence: "Compassion in the face of betrayal",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "terminate_quietly",
                            text: "Terminate them quietly - no police, just gone",
                            consequence: "Problem solved, reputation preserved",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "full_prosecution",
                            text: "Follow procedure - termination and criminal charges",
                            consequence: "The law is the law",
                            alignment: "lawful",
                            stepScore: 1,
                        },
                        {
                            id: "cover_it_up",
                            text: "Cover it up - fix the books, keep them employed",
                            consequence: "Now you're complicit too",
                            alignment: "dark",
                            stepScore: 0,
                        },
                    ],
                },
                {
                    id: "the_leak",
                    stepNumber: 3,
                    title: "📰 The Story Spreads",
                    cinematicText:
                        'Somehow, it got out. A local business blogger has the story. Your phone is ringing off the hook.\n\n"Sources say embezzlement... company culture questioned... management aware?"\n\n{employee2} shows you their phone. It\'s everywhere. Your team is watching to see how you handle this.',
                    choices: [
                        {
                            id: "get_ahead",
                            text: "Get ahead of it - full press release, total transparency",
                            consequence: "Control the narrative",
                            alignment: "lawful",
                            minigame: { type: "composure", difficulty: "hard", label: "Crisis Communications" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "no_comment",
                            text: '"No comment" on all inquiries',
                            consequence: "Silence can be golden... or damning",
                            alignment: "cautious",
                            stepScore: 1,
                        },
                        {
                            id: "blame_individual",
                            text: "Publicly blame the individual - distance the company",
                            consequence: "Throw them under the bus",
                            alignment: "ruthless",
                            stepScore: 2,
                        },
                        {
                            id: "spin_positive",
                            text: 'Spin it: "We discovered and addressed the issue ourselves"',
                            consequence: "Turn weakness into strength",
                            alignment: "cunning",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "the_aftermath",
                    stepNumber: 4,
                    title: "⚖️ The Reckoning",
                    cinematicText:
                        'Weeks later. The story has died down. But the scars remain.\n\n{employee2} and {employee3} approach you together.\n\n"We wanted to say... the way you handled everything..." they exchange glances. "It made us think about what kind of company this really is."',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "acknowledge_difficulty",
                            text: '"It was the hardest decision I\'ve ever made."',
                            consequence: "Honesty about struggle",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "set_new_standards",
                            text: "Announce new ethics policies and oversight",
                            consequence: "Turn crisis into improvement",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                        {
                            id: "move_on",
                            text: "\"What's done is done. Let's focus on the future.\"",
                            consequence: "Forward, always forward",
                            alignment: "pragmatic",
                            stepScore: 1,
                        },
                        {
                            id: "thank_team",
                            text: "Thank the team for their trust and discretion",
                            consequence: "Gratitude builds loyalty",
                            alignment: "charismatic",
                            stepScore: 2,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 10,
                    title: "⭐ Ethical Leader",
                    text: "You handled an impossible situation with grace. Your team trusts you more than ever.",
                    effects: {
                        boost_all_trust: 30,
                        reputation_boost: 25,
                        unlock_perk: {
                            perkId: "ethical_reputation",
                            name: "Ethical Reputation",
                            description: "+10% trust for new hires",
                        },
                    },
                },
                excellent: {
                    threshold: 7,
                    title: "👍 Tough but Fair",
                    text: "You made hard choices but stood by your principles. Respect earned.",
                    effects: { boost_all_trust: 20, reputation_boost: 15 },
                },
                good: {
                    threshold: 4,
                    title: "✅ Crisis Managed",
                    text: "Not perfect, but you got through it. The company survives.",
                    effects: { boost_all_trust: 10, reputation_boost: 5 },
                },
                neutral: {
                    threshold: 1,
                    title: "😐 Mixed Messages",
                    text: "Your handling raised as many questions as it answered.",
                    effects: { reputation_boost: -5 },
                },
                poor: {
                    threshold: -100,
                    title: "💀 Trust Shattered",
                    text: "Your response damaged more than the original crime. People wonder what you'd do to them.",
                    effects: { decrease_all_trust: 25, reputation_hit: 20, random_employee_quits: !0 },
                },
            },
        },
        product_launch: {
            id: "product_launch",
            title: "🚀 The Product Launch",
            description: "Your biggest product ever goes live. Everything rides on the next 48 hours.",
            theme: "innovation",
            mood: "exciting",
            totalSteps: 4,
            requiredEmployees: 4,
            unlockConditions: { minEmployees: 5, minCash: 75e3, minAct: 2 },
            themeColor: "var(--l-amber)",
            steps: [
                {
                    id: "launch_prep",
                    stepNumber: 1,
                    title: "⏰ T-Minus 24 Hours",
                    cinematicText:
                        'The office is chaos. Energy drinks everywhere. {employee1} hasn\'t slept in two days.\n\n"Boss, we found a bug," {employee2} says, panic in their eyes. "Nothing critical but... do we delay?"\n\nThe marketing campaign is already live. Press embargoes lift in 24 hours. Your biggest client is watching.',
                    choices: [
                        {
                            id: "fix_and_ship",
                            text: "All hands on deck - fix it and ship on time",
                            consequence: "Sleep is for the weak",
                            alignment: "determined",
                            minigame: { type: "reflex", difficulty: "hard", label: "Crunch Time" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "ship_with_bug",
                            text: "Ship it with the bug - patch it post-launch",
                            consequence: "Perfect is the enemy of done",
                            alignment: "risky",
                            stepScore: { betting: !0, range: [-2, 3] },
                        },
                        {
                            id: "delay_launch",
                            text: "Delay the launch 48 hours",
                            consequence: "Quality over deadlines",
                            alignment: "cautious",
                            stepScore: 1,
                        },
                        {
                            id: "outsource_fix",
                            text: "Hire emergency contractors to fix it",
                            consequence: "Money solves problems",
                            alignment: "pragmatic",
                            stepScore: 2,
                            cost: 15e3,
                        },
                    ],
                },
                {
                    id: "launch_moment",
                    stepNumber: 2,
                    title: "🎆 Go Live",
                    cinematicText:
                        "3... 2... 1...\n\nThe button is pressed. Your product is live. Everyone holds their breath.\n\n{employee3} refreshes the dashboard obsessively. {employee1} is stress-eating chips.\n\nThe first reviews start coming in. The first bug reports. The first... praise?",
                    choices: [
                        {
                            id: "monitor_closely",
                            text: "War room mode - monitor everything in real-time",
                            consequence: "Knowledge is power",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "celebrate_early",
                            text: "Pop the champagne - we made it this far!",
                            consequence: "Morale matters",
                            alignment: "charismatic",
                            stepScore: 2,
                        },
                        {
                            id: "engage_users",
                            text: "Jump into forums and social - engage directly with users",
                            consequence: "Show you care",
                            alignment: "humble",
                            minigame: { type: "intensity", difficulty: "medium", label: "Community Engagement" },
                            stepScore: { success: 3, failure: 1 },
                        },
                        {
                            id: "prepare_for_worst",
                            text: "Prepare rollback procedures just in case",
                            consequence: "Hope for the best, plan for the worst",
                            alignment: "cautious",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "the_crisis",
                    stepNumber: 3,
                    title: "🔥 The 3 AM Crisis",
                    cinematicText:
                        'Your phone screams at 3 AM. The servers are on fire. Not literally, but basically.\n\nUsage is 10x projections. The product is too successful. Infrastructure is buckling.\n\n{employee2} is already at the office. "Boss, if we don\'t scale RIGHT NOW, we lose everyone."',
                    choices: [
                        {
                            id: "throw_money",
                            text: "Throw money at cloud resources immediately",
                            consequence: "Scale or die",
                            alignment: "determined",
                            stepScore: 3,
                            cost: 25e3,
                        },
                        {
                            id: "queue_system",
                            text: "Implement a waiting queue - manage expectations",
                            consequence: "Controlled chaos",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "limit_access",
                            text: "Temporarily limit new signups",
                            consequence: "Artificial scarcity... works sometimes",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "all_nighter",
                            text: "Rally the team for an all-night optimization sprint",
                            consequence: "We fix it together",
                            alignment: "charismatic",
                            minigame: { type: "composure", difficulty: "hard", label: "Team Rally" },
                            stepScore: { success: 4, failure: 1 },
                        },
                    ],
                },
                {
                    id: "the_reviews",
                    stepNumber: 4,
                    title: "📊 The Verdict",
                    cinematicText:
                        '48 hours post-launch. The dust is settling.\n\nTech blogs have published their reviews. Users have spoken. Your team is exhausted but watching the numbers.\n\n{employee1} pulls up the final dashboard. "Boss... you should see this."',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "team_celebration",
                            text: "Throw an epic team celebration",
                            consequence: "Victory deserves recognition",
                            alignment: "charismatic",
                            stepScore: 2,
                            cost: 5e3,
                        },
                        {
                            id: "plan_next_version",
                            text: "Immediately start planning version 2.0",
                            consequence: "Never stop improving",
                            alignment: "ambitious",
                            stepScore: 1,
                        },
                        {
                            id: "thank_users",
                            text: "Public thank you to early adopters",
                            consequence: "Community is everything",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "analyze_data",
                            text: "Deep dive into the data - what worked, what didn't",
                            consequence: "Learn from everything",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 12,
                    title: "🌟 Breakout Success",
                    text: "Your product is the talk of the industry. Downloads are through the roof. This changes everything.",
                    effects: {
                        bonus_cash: 3e5,
                        boost_all_productivity: 30,
                        reputation_boost: 35,
                        boost_product: { multiplier: 2, duration: 30 },
                    },
                },
                excellent: {
                    threshold: 9,
                    title: "🎯 Solid Launch",
                    text: "Strong reviews, good adoption. You've got something here.",
                    effects: { bonus_cash: 15e4, boost_all_productivity: 20, reputation_boost: 20 },
                },
                good: {
                    threshold: 6,
                    title: "✅ Successful Release",
                    text: "It works, people like it. Time to iterate.",
                    effects: { bonus_cash: 75e3, boost_all_productivity: 10, reputation_boost: 10 },
                },
                neutral: {
                    threshold: 3,
                    title: "😐 Mixed Reception",
                    text: "Some love it, some hate it. The usual.",
                    effects: { bonus_cash: 25e3 },
                },
                poor: {
                    threshold: -100,
                    title: "💥 Launch Disaster",
                    text: "Bugs, crashes, and angry users. The press is brutal. Back to the drawing board.",
                    effects: { reputation_hit: 25, decrease_all_productivity: 15, decrease_all_trust: 10 },
                },
            },
        },
        the_conference: {
            id: "the_conference",
            title: "🎪 The Conference",
            description: "The biggest industry event of the year. Network, learn, and compete.",
            theme: "networking",
            mood: "opportunity",
            totalSteps: 4,
            requiredEmployees: 2,
            unlockConditions: { minEmployees: 4, minCash: 3e4, minAct: 2 },
            themeColor: "var(--l-violet-2)",
            steps: [
                {
                    id: "arrival",
                    stepNumber: 1,
                    title: "✈️ Arrival",
                    cinematicText:
                        "The conference center buzzes with energy. Name badges, corporate banners, and the smell of opportunity.\n\n{employee1} nudges you. \"There's the CEO of Quantum Dynamics. And isn't that the editor from TechDaily?\"\n\nYour schedule is packed but flexible. Where do you focus your energy?",
                    choices: [
                        {
                            id: "keynote_focus",
                            text: "Attend the marquee keynotes - learn from the best",
                            consequence: "Knowledge is the best networking",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "vip_lounge",
                            text: "Head straight for the VIP networking lounge",
                            consequence: "Rub elbows with power players",
                            alignment: "ambitious",
                            minigame: { type: "composure", difficulty: "medium", label: "Schmoozing" },
                            stepScore: { success: 3, failure: 1 },
                        },
                        {
                            id: "booth_crawl",
                            text: "Walk the expo floor - see what competitors are showing",
                            consequence: "Know thy enemy",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "find_press",
                            text: "Track down journalists and bloggers",
                            consequence: "Free publicity awaits",
                            alignment: "charismatic",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "the_encounter",
                    stepNumber: 2,
                    title: "🤝 The Connection",
                    cinematicText:
                        'You bump into someone at the coffee bar. Literally bump into them, spilling your drink on their jacket.\n\n"Oh god, I\'m so—" you start. Then you recognize them. It\'s Alex Rivera, legendary angel investor with a billion-dollar portfolio.\n\nThey laugh it off. "Worst pitch I\'ve ever received. But I admire the approach."',
                    choices: [
                        {
                            id: "smooth_recovery",
                            text: "Smooth recovery - turn accident into elevator pitch",
                            consequence: "Fortune favors the bold",
                            alignment: "charismatic",
                            minigame: { type: "intensity", difficulty: "hard", label: "Impromptu Pitch" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "apologize_leave",
                            text: "Apologize profusely and flee",
                            consequence: "Some opportunities aren't meant to be",
                            alignment: "cautious",
                            stepScore: 0,
                        },
                        {
                            id: "offer_to_pay",
                            text: "Offer to pay for dry cleaning, exchange cards",
                            consequence: "Professional and classy",
                            alignment: "pragmatic",
                            stepScore: 2,
                            cost: 500,
                        },
                        {
                            id: "joke_about_it",
                            text: '"Well, you\'ll never forget meeting me now!"',
                            consequence: "Memorable, one way or another",
                            alignment: "risky",
                            stepScore: { betting: !0, range: [-1, 3] },
                        },
                    ],
                },
                {
                    id: "competitor_drama",
                    stepNumber: 3,
                    title: "⚔️ The Rival",
                    cinematicText:
                        'At the evening reception, you spot your biggest competitor across the room. Their CEO locks eyes with you and walks over.\n\n"Well, well. Look who showed up." They smirk. "I heard about your little product launch. Cute."\n\n{employee1} tenses up beside you. Others are watching.',
                    choices: [
                        {
                            id: "kill_with_kindness",
                            text: '"Congratulations on your recent funding round!"',
                            consequence: "Kill them with kindness",
                            alignment: "diplomatic",
                            stepScore: 3,
                        },
                        {
                            id: "confident_response",
                            text: '"Cute sells. Check our numbers."',
                            consequence: "Confidence backed by results",
                            alignment: "ambitious",
                            stepScore: 2,
                        },
                        {
                            id: "ignore_them",
                            text: "Politely excuse yourself and walk away",
                            consequence: "Not worth your energy",
                            alignment: "cautious",
                            stepScore: 1,
                        },
                        {
                            id: "challenge_publicly",
                            text: '"Let\'s settle this on stage tomorrow. Public debate."',
                            consequence: "High risk, high reward",
                            alignment: "defiant",
                            minigame: { type: "tension", difficulty: "hard", label: "Public Challenge" },
                            stepScore: { success: 5, failure: -1 },
                        },
                    ],
                },
                {
                    id: "final_night",
                    stepNumber: 4,
                    title: "🌃 The After-Party",
                    cinematicText:
                        'The official conference is over, but the real networking happens at the unofficial after-party.\n\nYou\'ve collected a stack of business cards, made some connections, maybe some enemies. {employee1} looks exhausted but exhilarated.\n\n"So boss, was it worth the trip?"',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "stay_late",
                            text: "Stay until the bitter end - maximize networking",
                            consequence: "Every handshake counts",
                            alignment: "ambitious",
                            stepScore: 2,
                        },
                        {
                            id: "quality_conversations",
                            text: "Focus on three deep conversations with key contacts",
                            consequence: "Quality over quantity",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "leave_early",
                            text: "Call it a night - you've got what you came for",
                            consequence: "Know when to fold",
                            alignment: "pragmatic",
                            stepScore: 1,
                        },
                        {
                            id: "throw_own_party",
                            text: "Invite select people to your own impromptu gathering",
                            consequence: "Create your own playing field",
                            alignment: "charismatic",
                            stepScore: 3,
                            cost: 3e3,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 12,
                    title: "🌟 Conference Legend",
                    text: "You made connections that will define your next decade. Your name is buzzing in all the right circles.",
                    effects: {
                        bonus_cash: 1e5,
                        reputation_boost: 40,
                        boost_all_trust: 15,
                        bonus_hire: { discount: 50, duration: 30 },
                    },
                },
                excellent: {
                    threshold: 9,
                    title: "🤝 Master Networker",
                    text: "Excellent connections made. Follow-up meetings already scheduled.",
                    effects: { bonus_cash: 5e4, reputation_boost: 25, boost_all_trust: 10 },
                },
                good: {
                    threshold: 6,
                    title: "✅ Productive Trip",
                    text: "Good contacts, useful insights. Money well spent.",
                    effects: { bonus_cash: 25e3, reputation_boost: 15 },
                },
                neutral: {
                    threshold: 3,
                    title: "😐 Standard Conference",
                    text: "Some cards exchanged, some talks attended. The usual.",
                    effects: { reputation_boost: 5 },
                },
                poor: {
                    threshold: -100,
                    title: "💀 Networking Disaster",
                    text: "Spilled drinks, burned bridges, and one very public embarrassment. Maybe skip next year.",
                    effects: { reputation_hit: 15, decrease_all_trust: 10 },
                },
            },
        },
        the_mentorship: {
            id: "the_mentorship",
            title: "🎓 The Mentorship",
            description:
                "A struggling employee needs guidance. Your investment in them could pay dividends—or cost you.",
            theme: "development",
            mood: "heartfelt",
            totalSteps: 3,
            requiredEmployees: 2,
            unlockConditions: { minEmployees: 4, minCash: 1e4, minAct: 1 },
            themeColor: "#1abc9c",
            steps: [
                {
                    id: "struggling_employee",
                    stepNumber: 1,
                    title: "📉 The Struggle",
                    cinematicText:
                        "{employee1}'s numbers have been slipping. Missed deadlines, distracted in meetings, quality dropping.\n\nYou pull them aside. Their eyes are red. \"I'm sorry, boss. I've been going through some stuff. I know I'm not performing.\"\n\nThey look terrified. Like they're expecting to be fired on the spot.",
                    choices: [
                        {
                            id: "offer_support",
                            text: '"Tell me what\'s going on. Maybe I can help."',
                            consequence: "Leaders support their people",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "set_expectations",
                            text: '"I need you back on track in two weeks."',
                            consequence: "Clear boundaries, clear expectations",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "pip",
                            text: "Put them on a Performance Improvement Plan",
                            consequence: "By the book",
                            alignment: "lawful",
                            stepScore: 1,
                        },
                        {
                            id: "immediate_termination",
                            text: "\"I'm sorry, but this isn't working out.\"",
                            consequence: "Business is business",
                            alignment: "ruthless",
                            stepScore: -1,
                        },
                    ],
                },
                {
                    id: "investment",
                    stepNumber: 2,
                    title: "💪 The Investment",
                    cinematicText:
                        "You've decided to invest in {employee1}. Weekly check-ins, skills training, maybe even some mentoring sessions.\n\n{employee2} pulls you aside. \"Boss, are you sure about this? That's a lot of your time for someone who might not make it.\"\n\nIt's a fair point. Your time is valuable. But so is loyalty.",
                    choices: [
                        {
                            id: "personal_mentoring",
                            text: "Commit to personal mentoring sessions",
                            consequence: "The best investment is in people",
                            alignment: "light",
                            minigame: { type: "intensity", difficulty: "medium", label: "Mentoring Session" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "hire_coach",
                            text: "Hire an external coach for them",
                            consequence: "Professional development matters",
                            alignment: "pragmatic",
                            stepScore: 2,
                            cost: 5e3,
                        },
                        {
                            id: "peer_buddy",
                            text: "Pair them with {employee2} as a mentor",
                            consequence: "Peer support can be powerful",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "sink_or_swim",
                            text: '"I\'ll check in, but they need to figure this out themselves"',
                            consequence: "Self-reliance is a skill",
                            alignment: "cautious",
                            stepScore: 1,
                        },
                    ],
                },
                {
                    id: "the_turnaround",
                    stepNumber: 3,
                    title: "🌱 The Growth",
                    cinematicText:
                        'Weeks later. {employee1} knocks on your door.\n\n"Boss? I wanted to show you something." They pull up a dashboard. Their numbers aren\'t just recovered—they\'re the best on the team.\n\n"I couldn\'t have done this without you believing in me," they say, voice thick with emotion.',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "celebrate_growth",
                            text: "Publicly recognize their turnaround",
                            consequence: "Success deserves celebration",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "new_responsibilities",
                            text: "Offer them new challenges and responsibilities",
                            consequence: "Growth should lead to growth",
                            alignment: "ambitious",
                            stepScore: 2,
                        },
                        {
                            id: "stay_humble",
                            text: '"You did this. I just gave you a chance."',
                            consequence: "Credit where credit is due",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "pay_it_forward",
                            text: '"Now it\'s your turn to mentor someone else."',
                            consequence: "The cycle continues",
                            alignment: "charismatic",
                            stepScore: 3,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 9,
                    title: "🌟 Transformative Leader",
                    text: "Your mentorship changed a life. {employee1} will never forget what you did. Neither will the rest of the team.",
                    effects: {
                        boost_all_trust: 25,
                        boost_all_productivity: 15,
                        unlock_perk: {
                            perkId: "mentorship_culture",
                            name: "Mentorship Culture",
                            description: "New hires ramp up 25% faster",
                        },
                    },
                },
                excellent: {
                    threshold: 6,
                    title: "🎓 Great Mentor",
                    text: "You turned a struggling employee into a star. Your team sees what kind of leader you are.",
                    effects: { boost_all_trust: 20, boost_all_productivity: 10 },
                },
                good: {
                    threshold: 3,
                    title: "✅ Successful Development",
                    text: "They made it. Your patience paid off.",
                    effects: { boost_all_trust: 10 },
                },
                neutral: {
                    threshold: 0,
                    title: "😐 Uncertain Outcome",
                    text: "Results are mixed. Time will tell if this was worth it.",
                    effects: { boost_all_trust: 5 },
                },
                poor: {
                    threshold: -100,
                    title: "💔 Failed Investment",
                    text: "Despite everything, they couldn't turn it around. Or they left anyway. Was it worth it?",
                    effects: { decrease_all_trust: 10, random_employee_quits: !0 },
                },
            },
        },
        the_inspection: {
            id: "the_inspection",
            title: "🔎 The Inspection",
            description: "Government inspectors are coming. Everything needs to be perfect—or appear to be.",
            theme: "compliance",
            mood: "nerve-wracking",
            totalSteps: 4,
            requiredEmployees: 3,
            unlockConditions: { minEmployees: 6, minCash: 4e4, minAct: 2 },
            themeColor: "#c0392b",
            steps: [
                {
                    id: "the_notice",
                    stepNumber: 1,
                    title: "📋 The Notice",
                    cinematicText:
                        'The letter arrives with an official government seal. "Pursuant to regulations... inspection scheduled... compliance review..."\n\n{employee1} reads over your shoulder. "Boss, we\'re not exactly... fully compliant. Those safety updates we\'ve been putting off..."\n\nYou have one week to prepare.',
                    choices: [
                        {
                            id: "full_compliance_push",
                            text: "Emergency compliance push - fix everything legitimately",
                            consequence: "Do it right, do it fast",
                            alignment: "lawful",
                            stepScore: 3,
                            cost: 2e4,
                        },
                        {
                            id: "selective_fixes",
                            text: "Fix only the most visible issues",
                            consequence: "Triage mode",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "document_cover",
                            text: "Focus on paperwork - make sure documentation is perfect",
                            consequence: "Inspectors love paperwork",
                            alignment: "cunning",
                            minigame: { type: "recall", difficulty: "medium", label: "Documentation Review" },
                            stepScore: { success: 3, failure: 1 },
                        },
                        {
                            id: "hire_consultant",
                            text: "Hire a compliance consultant immediately",
                            consequence: "Expert help for expert problems",
                            alignment: "pragmatic",
                            stepScore: 2,
                            cost: 1e4,
                        },
                    ],
                },
                {
                    id: "inspection_day",
                    stepNumber: 2,
                    title: "📝 The Day Arrives",
                    cinematicText:
                        'Two inspectors walk in with clipboards. They\'re thorough. Too thorough.\n\n{employee2} is sweating bullets as they examine the fire exits. {employee3} is trying to distract them with coffee.\n\nOne inspector pauses at something. "Hmm. This is... interesting."',
                    choices: [
                        {
                            id: "transparency_approach",
                            text: "Be completely transparent - show them everything",
                            consequence: "Nothing to hide means nothing to find",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                        {
                            id: "charm_offensive",
                            text: "Turn on the charm - make them like you",
                            consequence: "Likeable people get favorable reviews",
                            alignment: "charismatic",
                            minigame: { type: "composure", difficulty: "hard", label: "Charm the Inspectors" },
                            stepScore: { success: 4, failure: 0 },
                        },
                        {
                            id: "technical_details",
                            text: "Overwhelm them with technical details",
                            consequence: "Confusion can be a strategy",
                            alignment: "cunning",
                            stepScore: 1,
                        },
                        {
                            id: "escort_closely",
                            text: "Personally escort them - control what they see",
                            consequence: "Guided tours reveal what you choose",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "the_finding",
                    stepNumber: 3,
                    title: "⚠️ The Finding",
                    cinematicText:
                        '"We\'ve found some violations," the lead inspector announces.\n\nYour heart sinks. {employee1} looks like they might pass out.\n\n"Nothing catastrophic, but there will need to be remediation. The question is how quickly you can address these."',
                    choices: [
                        {
                            id: "immediate_action",
                            text: '"We\'ll start today. Walk me through each item."',
                            consequence: "Proactive response",
                            alignment: "determined",
                            stepScore: 3,
                        },
                        {
                            id: "negotiate_timeline",
                            text: "Negotiate for a longer remediation timeline",
                            consequence: "Buy time to do it right",
                            alignment: "diplomatic",
                            minigame: { type: "tension", difficulty: "medium", label: "Timeline Negotiation" },
                            stepScore: { success: 3, failure: 1 },
                        },
                        {
                            id: "contest_findings",
                            text: "Contest some of the findings",
                            consequence: "Not everything they say is gospel",
                            alignment: "defiant",
                            stepScore: 1,
                        },
                        {
                            id: "accept_penalties",
                            text: "Accept any penalties, commit to full compliance",
                            consequence: "Take the hit, move forward",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "the_verdict",
                    stepNumber: 4,
                    title: "📊 The Final Report",
                    cinematicText:
                        "The official report arrives. {employee1}, {employee2}, and {employee3} gather around as you open it.\n\nYour compliance rating, your violations, your required actions—everything that determines whether you stay in business.\n\nThe team holds their breath.",
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "share_openly",
                            text: "Share the full report with the team",
                            consequence: "Transparency builds trust",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                        {
                            id: "action_plan",
                            text: "Create a detailed action plan for compliance",
                            consequence: "Turn weakness into strength",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "celebrate_survival",
                            text: "Celebrate surviving the inspection",
                            consequence: "We made it through!",
                            alignment: "charismatic",
                            stepScore: 1,
                        },
                        {
                            id: "prevention_focus",
                            text: "Focus on preventing future issues",
                            consequence: "Learn from this experience",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 11,
                    title: "✨ Exemplary Compliance",
                    text: "Not only did you pass—you impressed them. Your company is now cited as a model for the industry.",
                    effects: { reputation_boost: 35, boost_all_trust: 20, investigation_cleared: !0 },
                },
                excellent: {
                    threshold: 8,
                    title: "✅ Clean Bill",
                    text: "Minor issues, quickly resolved. You're in good standing.",
                    effects: { reputation_boost: 20, boost_all_trust: 10 },
                },
                good: {
                    threshold: 5,
                    title: "👍 Passed with Notes",
                    text: "Some violations, reasonable timeline. Could be worse.",
                    effects: { reputation_boost: 10 },
                },
                neutral: {
                    threshold: 2,
                    title: "😐 Conditional Pass",
                    text: "You passed, barely. Expect a follow-up inspection.",
                    effects: { fine: 1e4 },
                },
                poor: {
                    threshold: -100,
                    title: "❌ Failed Inspection",
                    text: "Significant violations. Heavy fines, possible shutdown. This is bad.",
                    effects: { fine: 5e4, reputation_hit: 25, disable_product: { duration: 14 } },
                },
            },
        },
        natural_disaster: {
            id: "natural_disaster",
            title: "🌪️ The Storm",
            description: "A major storm is heading your way. Protect your people, your assets, and your future.",
            theme: "survival",
            mood: "urgent",
            totalSteps: 4,
            requiredEmployees: 4,
            unlockConditions: { minEmployees: 5, minCash: 25e3, minAct: 2 },
            themeColor: "var(--l-neutral-4)",
            steps: [
                {
                    id: "warning",
                    stepNumber: 1,
                    title: "⚠️ The Warning",
                    cinematicText:
                        'The weather alert screams across every phone in the office. Category 4 storm, tracking directly toward you. 48 hours until landfall.\n\n{employee1} looks up from their desk, face pale. "Boss, my family is in the evacuation zone."\n\n{employee2} is already packing their bag. "What\'s the plan?"',
                    choices: [
                        {
                            id: "immediate_closure",
                            text: "Close the office immediately - everyone go home and prepare",
                            consequence: "Safety first, always",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "secure_then_leave",
                            text: "Quick team effort to secure equipment, then everyone leaves",
                            consequence: "Protect assets AND people",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "essential_only",
                            text: "Non-essential staff can leave, essential staff stays",
                            consequence: "The work must continue",
                            alignment: "calculating",
                            stepScore: 1,
                        },
                        {
                            id: "coordinate_help",
                            text: "Organize evacuation help for employees with families in danger",
                            consequence: "We take care of our own",
                            alignment: "charismatic",
                            stepScore: 3,
                            cost: 5e3,
                        },
                    ],
                },
                {
                    id: "the_storm",
                    stepNumber: 2,
                    title: "🌊 The Storm Hits",
                    cinematicText:
                        'The wind howls. Power flickers. Your phone buzzes with texts from employees.\n\n{employee3}: "Lost power. Kids are scared."\n{employee2}: "Roof is leaking. Might need to evacuate."\n{employee1}: "Mom\'s okay. Thank you for letting me go."\n\nYou\'re hunkered down, watching the radar, wondering about the office.',
                    choices: [
                        {
                            id: "check_on_everyone",
                            text: "Start a group chat - check on everyone systematically",
                            consequence: "Connection matters in crisis",
                            alignment: "light",
                            stepScore: 2,
                        },
                        {
                            id: "offer_shelter",
                            text: "Offer your place as shelter for anyone who needs it",
                            consequence: "Open home, open heart",
                            alignment: "charismatic",
                            stepScore: 3,
                        },
                        {
                            id: "focus_on_business",
                            text: "Monitor business systems - keep servers running if possible",
                            consequence: "Someone has to think about tomorrow",
                            alignment: "calculating",
                            stepScore: 1,
                        },
                        {
                            id: "emergency_fund",
                            text: "Set up emergency assistance fund for affected employees",
                            consequence: "Put your money where your heart is",
                            alignment: "light",
                            stepScore: 3,
                            cost: 15e3,
                        },
                    ],
                },
                {
                    id: "aftermath",
                    stepNumber: 3,
                    title: "🏚️ The Aftermath",
                    cinematicText:
                        "The storm has passed. The sun feels wrong after so much darkness.\n\nYou drive to the office. A tree has gone through the conference room window. Water damage everywhere.\n\n{employee1} calls. \"Boss, my house...\" they can't finish the sentence. {employee2}'s car was destroyed. {employee3} is helping neighbors dig out.",
                    choices: [
                        {
                            id: "employee_first",
                            text: "Prioritize employee assistance over business recovery",
                            consequence: "People over profit",
                            alignment: "light",
                            minigame: { type: "intensity", difficulty: "medium", label: "Crisis Coordination" },
                            stepScore: { success: 4, failure: 2 },
                        },
                        {
                            id: "balance_both",
                            text: "Split focus - help employees AND start business recovery",
                            consequence: "We can do both",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "remote_work",
                            text: "Transition to remote work immediately - keep business running",
                            consequence: "Adapt and survive",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "community_effort",
                            text: "Turn office recovery into a team building volunteer day",
                            consequence: "Shared struggle builds bonds",
                            alignment: "charismatic",
                            stepScore: 3,
                        },
                    ],
                },
                {
                    id: "rebuilding",
                    stepNumber: 4,
                    title: "🔨 Rebuilding",
                    cinematicText:
                        'Weeks later. The office is repaired, but the experience has changed everyone.\n\n{employee1}, {employee2}, and {employee3} stand together, looking at the new conference room window.\n\n"We made it through," {employee1} says quietly. "I\'ll never forget how you handled this, boss."',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "memorial_moment",
                            text: "Create a small memorial for what was lost",
                            consequence: "Honor the struggle",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "prepare_better",
                            text: "Invest in better disaster preparedness for next time",
                            consequence: "Learn and improve",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "celebrate_resilience",
                            text: 'Throw a "We Survived" celebration',
                            consequence: "Celebrate victories, even hard-won ones",
                            alignment: "charismatic",
                            stepScore: 2,
                            cost: 3e3,
                        },
                        {
                            id: "quiet_gratitude",
                            text: "Express personal gratitude to each team member",
                            consequence: "Sometimes quiet words mean the most",
                            alignment: "light",
                            stepScore: 3,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 12,
                    title: "🏆 Unbreakable Team",
                    text: "You didn't just survive—you became a family. This experience forged bonds that will never break.",
                    effects: {
                        boost_all_trust: 35,
                        boost_all_comfort: 30,
                        loyalty_boost: 60,
                        reputation_boost: 25,
                    },
                },
                excellent: {
                    threshold: 9,
                    title: "💪 Resilient Company",
                    text: "You put people first and they'll remember that forever. The team is stronger than ever.",
                    effects: { boost_all_trust: 25, boost_all_comfort: 20, reputation_boost: 15 },
                },
                good: {
                    threshold: 6,
                    title: "✅ Recovery Complete",
                    text: "You got through it. Not perfectly, but together.",
                    effects: { boost_all_trust: 15, boost_all_comfort: 10 },
                },
                neutral: {
                    threshold: 3,
                    title: "😐 Survived",
                    text: "The business continues. The emotional scars remain.",
                    effects: { boost_all_trust: 5 },
                },
                poor: {
                    threshold: -100,
                    title: "💔 Broken Trust",
                    text: "Your priorities during the crisis revealed something. Not everyone is coming back.",
                    effects: { decrease_all_trust: 20, random_employee_quits: !0, reputation_hit: 15 },
                },
            },
        },
        sabbatical_request: {
            id: "sabbatical_request",
            title: "🌴 The Sabbatical",
            description: "Your star employee wants an extended leave. Their reasons will surprise you.",
            theme: "work_life_balance",
            mood: "reflective",
            totalSteps: 3,
            requiredEmployees: 2,
            unlockConditions: { minEmployees: 4, minCash: 2e4, minAct: 2 },
            themeColor: "#16a085",
            steps: [
                {
                    id: "the_request",
                    stepNumber: 1,
                    title: "✉️ The Request",
                    cinematicText:
                        '{employee1}—your most reliable employee—closes your office door.\n\n"Boss, I need to ask you something big." They take a deep breath. "I want to take three months off. Unpaid is fine. I just... I need to do something."\n\nThey explain: A sick relative overseas. A dream they\'ve been putting off. A personal project that could change their life.',
                    choices: [
                        {
                            id: "approve_immediately",
                            text: "Approve it on the spot - they've earned it",
                            consequence: "Trust begets trust",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "ask_for_details",
                            text: "Ask for more details before deciding",
                            consequence: "Due diligence",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "negotiate_shorter",
                            text: "Negotiate a shorter leave period",
                            consequence: "Find the middle ground",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "deny_request",
                            text: '"I\'m sorry, but we really need you here."',
                            consequence: "Business needs come first",
                            alignment: "ruthless",
                            stepScore: 0,
                        },
                    ],
                },
                {
                    id: "the_gap",
                    stepNumber: 2,
                    title: "📊 Filling the Gap",
                    cinematicText:
                        '{employee1} is gone. Their absence is immediately felt.\n\n{employee2} is drowning in extra work. Clients are asking where their favorite contact went. Projects are slipping.\n\n"Boss," {employee2} says, exhausted, "I can\'t do both our jobs. Something has to give."',
                    choices: [
                        {
                            id: "hire_temp",
                            text: "Hire temporary help to cover",
                            consequence: "Spend money to solve problems",
                            alignment: "pragmatic",
                            stepScore: 2,
                            cost: 1e4,
                        },
                        {
                            id: "redistribute",
                            text: "Redistribute work across the team with bonuses",
                            consequence: "Share the burden fairly",
                            alignment: "diplomatic",
                            stepScore: 2,
                            cost: 5e3,
                        },
                        {
                            id: "reduce_scope",
                            text: "Temporarily reduce projects and commitments",
                            consequence: "Accept limitations",
                            alignment: "cautious",
                            stepScore: 1,
                        },
                        {
                            id: "step_in_personally",
                            text: "Step in personally to fill the gap",
                            consequence: "Lead by example",
                            alignment: "determined",
                            minigame: { type: "composure", difficulty: "hard", label: "Extra Workload" },
                            stepScore: { success: 4, failure: 1 },
                        },
                    ],
                },
                {
                    id: "the_return",
                    stepNumber: 3,
                    title: "🔄 The Return",
                    cinematicText:
                        'Three months later. {employee1} walks back through the door, somehow different. More present. More alive.\n\n"I can\'t thank you enough," they say, eyes glistening. "That time... it changed everything."\n\nThey\'re back. But the question remains: was it worth it?',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "welcome_warmly",
                            text: "Throw a welcome-back celebration",
                            consequence: "Celebrate returns",
                            alignment: "charismatic",
                            stepScore: 2,
                            cost: 1e3,
                        },
                        {
                            id: "debrief_meeting",
                            text: "Have a one-on-one to discuss what they learned",
                            consequence: "Growth deserves attention",
                            alignment: "humble",
                            stepScore: 3,
                        },
                        {
                            id: "back_to_work",
                            text: "\"Glad you're back. Here's what piled up.\"",
                            consequence: "Business as usual",
                            alignment: "pragmatic",
                            stepScore: 1,
                        },
                        {
                            id: "formalize_policy",
                            text: "Create an official sabbatical policy for everyone",
                            consequence: "Turn exception into opportunity",
                            alignment: "lawful",
                            stepScore: 3,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 9,
                    title: "🌟 Enlightened Workplace",
                    text: "Your handling of this created a culture where people can be human. Productivity AND loyalty have never been higher.",
                    effects: {
                        boost_all_trust: 30,
                        boost_all_comfort: 25,
                        boost_all_productivity: 15,
                        unlock_perk: {
                            perkId: "sabbatical_policy",
                            name: "Sabbatical Policy",
                            description: "Employees never quit from burnout",
                        },
                    },
                },
                excellent: {
                    threshold: 6,
                    title: "💚 Supportive Leader",
                    text: "You showed that you care about your people as people. That matters.",
                    effects: { boost_all_trust: 20, boost_all_comfort: 15 },
                },
                good: {
                    threshold: 3,
                    title: "✅ Handled Well",
                    text: "You made it work. Not easy, but worth it.",
                    effects: { boost_all_trust: 10, boost_all_comfort: 10 },
                },
                neutral: {
                    threshold: 0,
                    title: "😐 Survived the Gap",
                    text: "They left, they came back. Life goes on.",
                    effects: { boost_all_trust: 5 },
                },
                poor: {
                    threshold: -100,
                    title: "💔 Resentment",
                    text: "Your handling created frustration on all sides. Some bridges were burned.",
                    effects: { decrease_all_trust: 15, decrease_all_comfort: 10 },
                },
            },
        },
        the_intern: {
            id: "the_intern",
            title: "🎒 The Intern",
            description: "A well-connected intern joins your team. They could be an asset... or a liability.",
            theme: "mentorship",
            mood: "coming-of-age",
            totalSteps: 3,
            requiredEmployees: 2,
            unlockConditions: { minEmployees: 3, minCash: 15e3, minAct: 1 },
            themeColor: "var(--l-blue)",
            steps: [
                {
                    id: "arrival",
                    stepNumber: 1,
                    title: "👋 First Day",
                    cinematicText:
                        'A nervous college student stands in your lobby. Jordan Chen—their family owns a major client company.\n\n"I\'m really excited to learn from you all," they say, clutching a brand-new notebook.\n\n{employee1} leans over. "Boss, that\'s Senator Chen\'s kid. No pressure, right?"',
                    choices: [
                        {
                            id: "personal_attention",
                            text: "Take them under your wing personally",
                            consequence: "Your time is valuable, but so are connections",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "assign_mentor",
                            text: "Assign {employee1} as their mentor",
                            consequence: "Delegate the responsibility",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "trial_by_fire",
                            text: "Throw them into a real project immediately",
                            consequence: "Sink or swim",
                            alignment: "ruthless",
                            stepScore: 1,
                        },
                        {
                            id: "coffee_runs",
                            text: "Start them on basic tasks - coffee runs, filing",
                            consequence: "Everyone starts somewhere",
                            alignment: "cautious",
                            stepScore: 1,
                        },
                    ],
                },
                {
                    id: "the_mistake",
                    stepNumber: 2,
                    title: "💥 The Disaster",
                    cinematicText:
                        'Jordan deleted the client presentation. The one due in three hours. To the client who happens to be their family\'s company.\n\n"I... I thought I was saving it," they stammer, face white as a sheet.\n\n{employee2} is rebuilding what they can. "Boss, we might be able to recover some of it, but..."',
                    choices: [
                        {
                            id: "take_blame",
                            text: "Take the blame yourself to protect the intern",
                            consequence: "Fall on your sword",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "learning_moment",
                            text: "Use this as a teaching moment - mistakes happen",
                            consequence: "Growth through failure",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "damage_control",
                            text: "Focus on fixing it, deal with blame later",
                            consequence: "Priorities first",
                            alignment: "pragmatic",
                            minigame: { type: "reflex", difficulty: "hard", label: "Crisis Recovery" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "call_family",
                            text: "Call their family and explain the situation",
                            consequence: "Transparency, even if awkward",
                            alignment: "lawful",
                            stepScore: 1,
                        },
                    ],
                },
                {
                    id: "the_offer",
                    stepNumber: 3,
                    title: "🎓 Graduation",
                    cinematicText:
                        "The internship is ending. Jordan has grown—they're actually competent now.\n\nSenator Chen calls. \"My kid can't stop talking about your company. They want to work there full-time after graduation.\"\n\n{employee1} and {employee2} exchange looks. Jordan watches you nervously.",
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "hire_them",
                            text: "Offer them a full-time position",
                            consequence: "Invest in their growth",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "recommend_elsewhere",
                            text: "Recommend them to a better-suited company",
                            consequence: "Honest about fit",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "keep_options_open",
                            text: '"Let\'s see how your final semester goes"',
                            consequence: "Don't commit yet",
                            alignment: "cautious",
                            stepScore: 1,
                        },
                        {
                            id: "leverage_connection",
                            text: "Hire them AND leverage the family connection",
                            consequence: "Play the long game",
                            alignment: "ambitious",
                            stepScore: 2,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 9,
                    title: "🌟 Mentor of the Year",
                    text: "Jordan thrives, and their family becomes your biggest advocate. Sometimes kindness is the best strategy.",
                    effects: { bonus_cash: 1e5, reputation_boost: 30, boost_all_trust: 15 },
                },
                excellent: {
                    threshold: 6,
                    title: "👨‍🎓 Good Investment",
                    text: "The internship was a success. New connections opened, lessons learned.",
                    effects: { bonus_cash: 5e4, reputation_boost: 20, boost_all_trust: 10 },
                },
                good: {
                    threshold: 3,
                    title: "✅ Adequate Experience",
                    text: "They learned something. You didn't make enemies.",
                    effects: { reputation_boost: 10 },
                },
                neutral: {
                    threshold: 0,
                    title: "😐 Forgettable Stint",
                    text: "Just another intern. Came, learned a little, left.",
                    effects: {},
                },
                poor: {
                    threshold: -100,
                    title: "💀 Bridge Burned",
                    text: "The Chen family is NOT happy. That connection? Gone.",
                    effects: { reputation_hit: 25, decrease_all_trust: 10 },
                },
            },
        },
        celebrity_visit: {
            id: "celebrity_visit",
            title: "⭐ The Celebrity Visit",
            description: "A famous influencer wants to feature your company. Fame is a double-edged sword.",
            theme: "publicity",
            mood: "exciting",
            totalSteps: 4,
            requiredEmployees: 3,
            unlockConditions: { minEmployees: 6, minCash: 5e4, minAct: 2 },
            themeColor: "#e91e63",
            steps: [
                {
                    id: "the_dm",
                    stepNumber: 1,
                    title: "📱 The DM",
                    cinematicText:
                        '"OMG @YourCompany is giving MAJOR vibes. Can we collab?"\n\nThe message is from @SkylarStorm—10 million followers, massive influence. Their team wants to film a "day in the life" at your office.\n\n{employee1} is already freaking out. "Boss, do you know who that IS?"',
                    choices: [
                        {
                            id: "enthusiastic_yes",
                            text: "Respond immediately with an enthusiastic yes",
                            consequence: "Strike while the iron is hot",
                            alignment: "ambitious",
                            stepScore: 2,
                        },
                        {
                            id: "negotiate_terms",
                            text: "Negotiate terms and editorial control",
                            consequence: "Protect your brand",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "research_first",
                            text: "Research their content and audience first",
                            consequence: "Due diligence",
                            alignment: "cautious",
                            minigame: { type: "recall", difficulty: "medium", label: "Social Media Analysis" },
                            stepScore: { success: 3, failure: 1 },
                        },
                        {
                            id: "polite_decline",
                            text: "Politely decline - too risky",
                            consequence: "Some press isn't worth it",
                            alignment: "cautious",
                            stepScore: 0,
                        },
                    ],
                },
                {
                    id: "filming_day",
                    stepNumber: 2,
                    title: "🎬 Lights, Camera...",
                    cinematicText:
                        "Skylar arrives with a full production crew. Drones, lights, the works.\n\nThey're charming, energetic... and asking increasingly personal questions about your employees.\n\n{employee2} pulls you aside. \"They're asking about salaries and workplace gossip. Is that okay?\"",
                    choices: [
                        {
                            id: "full_access",
                            text: "Give them full access - authenticity sells",
                            consequence: "What could go wrong?",
                            alignment: "risky",
                            stepScore: { betting: !0, range: [-2, 4] },
                        },
                        {
                            id: "guided_tour",
                            text: "Provide a curated, guided experience",
                            consequence: "Control the narrative",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "set_boundaries",
                            text: "Firmly set boundaries - no personal questions",
                            consequence: "Protect your people",
                            alignment: "light",
                            stepScore: 2,
                        },
                        {
                            id: "distract_with_spectacle",
                            text: "Distract them with an impressive demo/event",
                            consequence: "Give them something better to film",
                            alignment: "charismatic",
                            minigame: { type: "intensity", difficulty: "hard", label: "Showmanship" },
                            stepScore: { success: 4, failure: 1 },
                        },
                    ],
                },
                {
                    id: "the_edit",
                    stepNumber: 3,
                    title: "✂️ The Edit",
                    cinematicText:
                        'Days later, Skylar\'s team sends a preview of the video.\n\nIt\'s... not what you expected. Some moments are great. Others are taken completely out of context. {employee3}\'s joke sounds mean. Your response to a question sounds dismissive.\n\n"This goes live in 24 hours," their manager says. "Any feedback?"',
                    choices: [
                        {
                            id: "request_changes",
                            text: "Request specific changes to the edit",
                            consequence: "Fight for accuracy",
                            alignment: "diplomatic",
                            minigame: { type: "composure", difficulty: "hard", label: "Editorial Negotiation" },
                            stepScore: { success: 4, failure: 0 },
                        },
                        {
                            id: "offer_money",
                            text: "Offer payment for a more favorable edit",
                            consequence: "Money talks",
                            alignment: "cunning",
                            stepScore: 2,
                            cost: 2e4,
                        },
                        {
                            id: "trust_the_process",
                            text: "Accept it - their audience knows their style",
                            consequence: "Let it go",
                            alignment: "humble",
                            stepScore: 1,
                        },
                        {
                            id: "prepare_counter",
                            text: "Prepare your own response video just in case",
                            consequence: "Have a backup plan",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "viral",
                    stepNumber: 4,
                    title: "📈 Going Viral",
                    cinematicText:
                        "The video drops. Notifications explode. Your website traffic spikes 5000%.\n\nComments are... mixed. Some people love it. Some are roasting you. {employee1}'s face became a meme.\n\n{employee2} shows you a trending hashtag. Your company name. Is that good or bad?",
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "lean_in",
                            text: "Lean into it - engage with the memes",
                            consequence: "If you can't beat them...",
                            alignment: "charismatic",
                            stepScore: 3,
                        },
                        {
                            id: "professional_statement",
                            text: "Release a professional statement",
                            consequence: "Maintain dignity",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                        {
                            id: "wait_it_out",
                            text: "Say nothing - it'll blow over",
                            consequence: "Patience is a virtue",
                            alignment: "cautious",
                            stepScore: 1,
                        },
                        {
                            id: "capitalize",
                            text: "Launch a flash sale/promotion to capitalize",
                            consequence: "Strike while trending",
                            alignment: "ambitious",
                            stepScore: 2,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 12,
                    title: "💫 Viral Sensation",
                    text: "You didn't just survive the spotlight—you owned it. Your brand is now synonymous with cool.",
                    effects: { bonus_cash: 2e5, reputation_boost: 50, boost_all_productivity: 20 },
                },
                excellent: {
                    threshold: 8,
                    title: "📸 Good Press",
                    text: "More people know your name, and mostly in a good way.",
                    effects: { bonus_cash: 1e5, reputation_boost: 25, boost_all_productivity: 10 },
                },
                good: {
                    threshold: 5,
                    title: "✅ Survived Fame",
                    text: "The video came and went. You're still standing.",
                    effects: { bonus_cash: 5e4, reputation_boost: 10 },
                },
                neutral: {
                    threshold: 2,
                    title: "😐 Fifteen Minutes",
                    text: "A brief moment in the spotlight. Already forgotten.",
                    effects: { reputation_boost: 5 },
                },
                poor: {
                    threshold: -100,
                    title: "💀 PR Nightmare",
                    text: "The video went viral for all the wrong reasons. The memes are brutal.",
                    effects: { reputation_hit: 30, decrease_all_comfort: 15, decrease_all_trust: 10 },
                },
            },
        },
        the_lawsuit: {
            id: "the_lawsuit",
            title: "⚖️ The Lawsuit",
            description: "A former employee is suing. The truth will come out—one way or another.",
            theme: "legal",
            mood: "tense",
            totalSteps: 4,
            requiredEmployees: 3,
            unlockConditions: { minEmployees: 5, minCash: 75e3, minAct: 2 },
            themeColor: "#795548",
            steps: [
                {
                    id: "the_summons",
                    stepNumber: 1,
                    title: "📜 The Summons",
                    cinematicText:
                        'A process server hands you papers. "You\'ve been served."\n\nIt\'s from Marcus Webb—a former employee terminated six months ago. Wrongful termination. Hostile work environment. The works.\n\n{employee1} goes pale. "Boss, I worked with Marcus. This could get ugly."',
                    choices: [
                        {
                            id: "hire_lawyer",
                            text: "Hire the best employment lawyer immediately",
                            consequence: "Don't bring a knife to a gunfight",
                            alignment: "pragmatic",
                            stepScore: 3,
                            cost: 25e3,
                        },
                        {
                            id: "investigate_first",
                            text: "Investigate internally before responding",
                            consequence: "Know your weaknesses",
                            alignment: "calculating",
                            minigame: { type: "recall", difficulty: "hard", label: "Internal Investigation" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "reach_out",
                            text: "Try to reach Marcus directly",
                            consequence: "Maybe this can be resolved quietly",
                            alignment: "diplomatic",
                            stepScore: 2,
                        },
                        {
                            id: "dismiss_it",
                            text: "It's probably nothing - handle it later",
                            consequence: "Ignore at your peril",
                            alignment: "risky",
                            stepScore: 0,
                        },
                    ],
                },
                {
                    id: "discovery",
                    stepNumber: 2,
                    title: "🔍 Discovery",
                    cinematicText:
                        'The discovery process begins. Lawyers are requesting emails, Slack messages, performance reviews—everything.\n\n{employee2} approaches you nervously. "Boss, some of my messages might look bad out of context. I was joking, but..."\n\nYou remember some of your own communications. Are they pristine?',
                    choices: [
                        {
                            id: "full_transparency",
                            text: "Provide everything - complete transparency",
                            consequence: "Nothing to hide",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                        {
                            id: "narrow_scope",
                            text: "Provide only what's legally required",
                            consequence: "Play by the rules, but narrowly",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "coach_team",
                            text: "Coach the team on what to say",
                            consequence: "Coordinate the message",
                            alignment: "cunning",
                            stepScore: 1,
                        },
                        {
                            id: "settle_now",
                            text: "Try to settle before discovery reveals more",
                            consequence: "Cut your losses",
                            alignment: "pragmatic",
                            stepScore: 2,
                            cost: 5e4,
                        },
                    ],
                },
                {
                    id: "deposition",
                    stepNumber: 3,
                    title: "🎤 The Deposition",
                    cinematicText:
                        "You're under oath. Marcus's lawyer is across the table, asking pointed questions.\n\n\"Did you ever make comments about Marcus's personal life in the workplace?\"\n\nYour lawyer squeezes your arm. This is the moment that could make or break the case.",
                    choices: [
                        {
                            id: "honest_answer",
                            text: "Answer honestly, even if it hurts",
                            consequence: "The truth will set you free... or not",
                            alignment: "lawful",
                            minigame: { type: "composure", difficulty: "hard", label: "Deposition Composure" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "careful_wording",
                            text: "Answer carefully with lawyer-approved phrasing",
                            consequence: "Technical truths",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "memory_lapses",
                            text: '"I don\'t recall" as much as possible',
                            consequence: "The politician's playbook",
                            alignment: "cunning",
                            stepScore: 1,
                        },
                        {
                            id: "own_mistakes",
                            text: "Own your mistakes but defend your intentions",
                            consequence: "Humble but firm",
                            alignment: "humble",
                            stepScore: 3,
                        },
                    ],
                },
                {
                    id: "the_verdict",
                    stepNumber: 4,
                    title: "🏛️ Resolution",
                    cinematicText:
                        "After months of stress, it's finally ending. Your lawyer presents options.\n\n\"We can settle for $75,000 and an NDA. Or we go to trial—risky but you might win outright.\"\n\n{employee1}, {employee2}, and {employee3} are watching. This will define your company's values.",
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "settle_quietly",
                            text: "Settle and make this go away",
                            consequence: "End it now",
                            alignment: "pragmatic",
                            stepScore: 2,
                            cost: 75e3,
                        },
                        {
                            id: "fight_to_win",
                            text: "Go to trial - fight for vindication",
                            consequence: "All or nothing",
                            alignment: "defiant",
                            stepScore: { betting: !0, range: [-2, 5] },
                        },
                        {
                            id: "apologize_publicly",
                            text: "Settle AND publicly apologize, change policies",
                            consequence: "Growth through accountability",
                            alignment: "light",
                            stepScore: 3,
                            cost: 1e5,
                        },
                        {
                            id: "mediation",
                            text: "Propose mediation with a neutral third party",
                            consequence: "Find middle ground",
                            alignment: "diplomatic",
                            stepScore: 2,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 11,
                    title: "⚖️ Justice Served",
                    text: "The case resolved in a way that made everyone better. Your handling became a model for workplace disputes.",
                    effects: {
                        reputation_boost: 30,
                        boost_all_trust: 25,
                        unlock_perk: {
                            perkId: "employment_standards",
                            name: "Gold Standard HR",
                            description: "Legal disputes 50% less likely",
                        },
                    },
                },
                excellent: {
                    threshold: 8,
                    title: "✅ Clean Resolution",
                    text: "It's over, and you came out relatively unscathed. Lessons learned.",
                    effects: { reputation_boost: 15, boost_all_trust: 15 },
                },
                good: {
                    threshold: 5,
                    title: "👍 Survived",
                    text: "It cost you, but the company is still standing.",
                    effects: { reputation_boost: 5 },
                },
                neutral: {
                    threshold: 2,
                    title: "😐 Pyrrhic Victory",
                    text: "Technically won, but at what cost?",
                    effects: { decrease_all_trust: 10 },
                },
                poor: {
                    threshold: -100,
                    title: "💀 Legal Disaster",
                    text: "The verdict or settlement was devastating. Your reputation in the industry is severely damaged.",
                    effects: { fine: 15e4, reputation_hit: 40, decrease_all_trust: 25 },
                },
            },
        },
        office_renovation: {
            id: "office_renovation",
            title: "🏗️ The Renovation",
            description: "Time to upgrade the office. But construction never goes as planned.",
            theme: "growth",
            mood: "chaotic",
            totalSteps: 4,
            requiredEmployees: 4,
            unlockConditions: { minEmployees: 6, minCash: 1e5, minAct: 2 },
            themeColor: "var(--l-orange-2)",
            steps: [
                {
                    id: "the_plan",
                    stepNumber: 1,
                    title: "📐 The Blueprint",
                    cinematicText:
                        'The architect spreads blueprints across your desk. "Open floor plan, standing desks, meditation room, or private offices? Your call."\n\n{employee1} loves the open concept. {employee2} is horrified by it. {employee3} just wants a bigger break room.\n\nThe budget is tight. You can\'t please everyone.',
                    choices: [
                        {
                            id: "modern_open",
                            text: "Go modern - open floor plan with collaboration spaces",
                            consequence: "Trendy but divisive",
                            alignment: "ambitious",
                            stepScore: 2,
                        },
                        {
                            id: "traditional",
                            text: "Traditional - private offices and quiet spaces",
                            consequence: "Classic for a reason",
                            alignment: "cautious",
                            stepScore: 2,
                        },
                        {
                            id: "survey_team",
                            text: "Survey the team and design around their needs",
                            consequence: "Democracy in design",
                            alignment: "light",
                            minigame: { type: "intensity", difficulty: "medium", label: "Team Survey" },
                            stepScore: { success: 4, failure: 2 },
                        },
                        {
                            id: "hybrid",
                            text: "Hybrid approach - something for everyone",
                            consequence: "Compromise is expensive",
                            alignment: "diplomatic",
                            stepScore: 2,
                            cost: 3e4,
                        },
                    ],
                },
                {
                    id: "construction",
                    stepNumber: 2,
                    title: "🔨 Construction Chaos",
                    cinematicText:
                        'Week two of construction. The noise is unbearable. Dust is everywhere.\n\n{employee2} is having video calls from their car. {employee3} found a mouse.\n\nThe contractor approaches. "We found some... issues. Gonna need another two weeks. Maybe three."',
                    choices: [
                        {
                            id: "pay_expedite",
                            text: "Pay extra to expedite",
                            consequence: "Money solves problems",
                            alignment: "pragmatic",
                            stepScore: 2,
                            cost: 25e3,
                        },
                        {
                            id: "remote_week",
                            text: "Send everyone home - remote work week",
                            consequence: "Escape the chaos",
                            alignment: "light",
                            stepScore: 2,
                        },
                        {
                            id: "push_through",
                            text: "We push through - business as usual",
                            consequence: "Tough it out together",
                            alignment: "determined",
                            minigame: { type: "composure", difficulty: "hard", label: "Construction Resilience" },
                            stepScore: { success: 4, failure: 0 },
                        },
                        {
                            id: "temporary_space",
                            text: "Rent temporary office space",
                            consequence: "Professional but pricey",
                            alignment: "pragmatic",
                            stepScore: 2,
                            cost: 15e3,
                        },
                    ],
                },
                {
                    id: "the_discovery",
                    stepNumber: 3,
                    title: "🕳️ The Discovery",
                    cinematicText:
                        'The construction crew found something behind the old wall. A time capsule from the previous company? No—it\'s evidence of corner-cutting. Asbestos. Not a lot, but enough to require proper removal.\n\n"This is gonna cost ya," the contractor says. "But legally, you gotta handle it."\n\n{employee1} is panicking about health concerns.',
                    choices: [
                        {
                            id: "full_remediation",
                            text: "Full professional remediation - safety first",
                            consequence: "The only real option",
                            alignment: "lawful",
                            stepScore: 3,
                            cost: 4e4,
                        },
                        {
                            id: "minimal_approach",
                            text: "Minimum required removal only",
                            consequence: "Meet the letter of the law",
                            alignment: "calculating",
                            stepScore: 2,
                            cost: 2e4,
                        },
                        {
                            id: "transparent_communication",
                            text: "Full transparency with team about the situation",
                            consequence: "Trust through honesty",
                            alignment: "light",
                            stepScore: 2,
                        },
                        {
                            id: "use_as_opportunity",
                            text: "Use this as leverage to negotiate better lease terms",
                            consequence: "Every problem is an opportunity",
                            alignment: "cunning",
                            minigame: { type: "tension", difficulty: "hard", label: "Lease Negotiation" },
                            stepScore: { success: 4, failure: 1 },
                        },
                    ],
                },
                {
                    id: "grand_opening",
                    stepNumber: 4,
                    title: "🎉 The Reveal",
                    cinematicText:
                        'It\'s done. The dust has settled—literally. The new office gleams.\n\n{employee1}, {employee2}, and {employee3} walk through, touching new desks, trying chairs.\n\n"So... what do you think?" you ask nervously.',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "celebration_party",
                            text: "Throw an office warming party",
                            consequence: "Celebrate the new chapter",
                            alignment: "charismatic",
                            stepScore: 2,
                            cost: 5e3,
                        },
                        {
                            id: "feedback_session",
                            text: "Hold feedback sessions - what works, what doesn't",
                            consequence: "Always be improving",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "press_coverage",
                            text: "Invite press for coverage of the new space",
                            consequence: "Free publicity",
                            alignment: "ambitious",
                            stepScore: 2,
                        },
                        {
                            id: "get_back_to_work",
                            text: "Enough celebration - back to work!",
                            consequence: "The space isn't the point",
                            alignment: "pragmatic",
                            stepScore: 1,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 12,
                    title: "🏢 Dream Office",
                    text: "The renovation exceeded all expectations. Productivity is up, morale is higher, and other companies are asking for your designer's number.",
                    effects: { boost_all_comfort: 35, boost_all_productivity: 25, reputation_boost: 20 },
                },
                excellent: {
                    threshold: 9,
                    title: "✨ Beautiful Space",
                    text: "The office is a huge upgrade. People actually want to come to work.",
                    effects: { boost_all_comfort: 25, boost_all_productivity: 15, reputation_boost: 10 },
                },
                good: {
                    threshold: 6,
                    title: "✅ Functional Upgrade",
                    text: "It's nicer. Not perfect, but nicer.",
                    effects: { boost_all_comfort: 15, boost_all_productivity: 10 },
                },
                neutral: {
                    threshold: 3,
                    title: "😐 Different",
                    text: "It's... different. Opinions are mixed.",
                    effects: { boost_all_comfort: 5 },
                },
                poor: {
                    threshold: -100,
                    title: "💀 Renovation Nightmare",
                    text: "Massive cost overruns, angry employees, and the new break room already has a leak.",
                    effects: { fine: 5e4, decrease_all_comfort: 10, decrease_all_productivity: 10 },
                },
            },
        },
        company_hackathon: {
            id: "company_hackathon",
            title: "💻 The Hackathon",
            description: "A 48-hour innovation sprint. Great ideas—and sleep deprivation—await.",
            theme: "innovation",
            mood: "energetic",
            totalSteps: 3,
            requiredEmployees: 4,
            unlockConditions: { minEmployees: 5, minCash: 2e4, minAct: 1 },
            themeColor: "#00bcd4",
            steps: [
                {
                    id: "kickoff",
                    stepNumber: 1,
                    title: "🚀 Kickoff",
                    cinematicText:
                        "The hackathon begins at midnight. Energy drinks everywhere. Whiteboards filling with wild ideas.\n\n{employee1} has partnered with {employee2}—they're working on something ambitious. {employee3} is going solo on a mystery project.\n\nYou're judging, but also... tempted to participate.",
                    choices: [
                        {
                            id: "join_team",
                            text: "Join a team as a collaborator",
                            consequence: "Lead by doing",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "observe_encourage",
                            text: "Roam and encourage - be the cheerleader",
                            consequence: "Morale matters",
                            alignment: "charismatic",
                            stepScore: 2,
                        },
                        {
                            id: "provide_resources",
                            text: "Provide premium resources for the best ideas",
                            consequence: "Reward promise",
                            alignment: "ambitious",
                            stepScore: 2,
                            cost: 5e3,
                        },
                        {
                            id: "step_back",
                            text: "Step back completely - let them own it",
                            consequence: "Not everything needs a boss",
                            alignment: "light",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "hour_24",
                    stepNumber: 2,
                    title: "😴 The Wall",
                    cinematicText:
                        'Hour 24. The energy drinks have stopped working. {employee1} is asleep under a desk. {employee2} is having a breakthrough—or a breakdown.\n\n{employee3} comes to you. "Boss, my project is failing. Should I scrap it or push through?"',
                    choices: [
                        {
                            id: "encourage_pivot",
                            text: "Help them pivot to something achievable",
                            consequence: "Failure is data",
                            alignment: "pragmatic",
                            minigame: { type: "intensity", difficulty: "medium", label: "Rapid Ideation" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "push_through",
                            text: "Encourage them to push through",
                            consequence: "Finish what you start",
                            alignment: "determined",
                            stepScore: 2,
                        },
                        {
                            id: "strategic_rest",
                            text: "Mandate a team-wide rest break",
                            consequence: "Rest is productive",
                            alignment: "light",
                            stepScore: 2,
                        },
                        {
                            id: "competitive_reveal",
                            text: "Let teams peek at each other's progress",
                            consequence: "A little competition helps",
                            alignment: "cunning",
                            stepScore: 1,
                        },
                    ],
                },
                {
                    id: "presentations",
                    stepNumber: 3,
                    title: "🎤 Demo Day",
                    cinematicText:
                        "Hour 48. Red-eyed developers present their creations.\n\n{employee1} and {employee2}'s project is impressive but unfinished. {employee3}'s solo work is polished but small.\n\nAs the judge, your decision will matter—not just for the prize, but for what it says about what you value.",
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "reward_ambition",
                            text: "Award the most ambitious project, even unfinished",
                            consequence: "Dream big",
                            alignment: "ambitious",
                            stepScore: 2,
                        },
                        {
                            id: "reward_completion",
                            text: "Award the most polished, complete project",
                            consequence: "Execution matters",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "multiple_awards",
                            text: "Create multiple award categories",
                            consequence: "Everyone can win something",
                            alignment: "light",
                            stepScore: 2,
                            cost: 3e3,
                        },
                        {
                            id: "implement_winner",
                            text: "Commit to actually implementing the winning project",
                            consequence: "Make it real",
                            alignment: "determined",
                            stepScore: 3,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 9,
                    title: "💡 Innovation Culture",
                    text: "The hackathon sparked something. New ideas, new energy, and one project that might actually change everything.",
                    effects: {
                        boost_all_productivity: 25,
                        boost_all_trust: 20,
                        unlock_perk: {
                            perkId: "innovation_culture",
                            name: "Innovation Culture",
                            description: "+15% chance of breakthroughs",
                        },
                    },
                },
                excellent: {
                    threshold: 6,
                    title: "🚀 Great Ideas",
                    text: "Several promising concepts emerged. The team is energized.",
                    effects: { boost_all_productivity: 15, boost_all_trust: 15 },
                },
                good: {
                    threshold: 3,
                    title: "✅ Productive Sprint",
                    text: "It was fun. Some useful ideas came out of it.",
                    effects: { boost_all_productivity: 10, boost_all_trust: 10 },
                },
                neutral: {
                    threshold: 0,
                    title: "😐 Just a Hackathon",
                    text: "Sleep-deprived employees, a few half-baked ideas. Normal hackathon stuff.",
                    effects: { boost_all_trust: 5 },
                },
                poor: {
                    threshold: -100,
                    title: "💤 Exhausted & Empty",
                    text: "Everyone is exhausted and nothing useful came of it. Maybe next year.",
                    effects: { decrease_all_productivity: 10, decrease_all_comfort: 10 },
                },
            },
        },
        competitor_poach: {
            id: "competitor_poach",
            title: "🎯 The Poaching",
            description: "A competitor wants your star employee. How far will you go to keep them?",
            theme: "loyalty",
            mood: "tense",
            totalSteps: 3,
            requiredEmployees: 2,
            unlockConditions: { minEmployees: 4, minCash: 4e4, minAct: 2 },
            themeColor: "#f44336",
            steps: [
                {
                    id: "the_rumor",
                    stepNumber: 1,
                    title: "👂 The Rumor",
                    cinematicText:
                        '{employee1} has been quiet lately. Distracted. Taking mysterious phone calls.\n\n{employee2} pulls you aside. "Boss, I heard a rumor. {employee1} has been talking to Nexus Corp. They\'re offering... a lot."',
                    choices: [
                        {
                            id: "direct_conversation",
                            text: "Have a direct, honest conversation with {employee1}",
                            consequence: "Transparency goes both ways",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "preemptive_raise",
                            text: "Offer a preemptive raise before they ask",
                            consequence: "Money talks",
                            alignment: "pragmatic",
                            stepScore: 2,
                            cost: 15e3,
                        },
                        {
                            id: "investigate",
                            text: "Investigate the rumor further first",
                            consequence: "Information is power",
                            alignment: "calculating",
                            minigame: { type: "recall", difficulty: "medium", label: "Intelligence Gathering" },
                            stepScore: { success: 3, failure: 1 },
                        },
                        {
                            id: "ignore_it",
                            text: "Ignore it - rumors are just rumors",
                            consequence: "Don't micromanage",
                            alignment: "cautious",
                            stepScore: 0,
                        },
                    ],
                },
                {
                    id: "the_confession",
                    stepNumber: 2,
                    title: "💭 The Truth",
                    cinematicText:
                        '{employee1} finally comes to you. "Boss, I need to talk. Nexus offered me a director position. 40% raise. I... I don\'t know what to do."\n\nTheir eyes are conflicted. "I love it here. But it\'s a lot of money. And a title."',
                    choices: [
                        {
                            id: "match_offer",
                            text: "Match the offer completely",
                            consequence: "Whatever it takes",
                            alignment: "determined",
                            stepScore: 2,
                            cost: 3e4,
                        },
                        {
                            id: "counter_with_growth",
                            text: "Counter with growth opportunities, not just money",
                            consequence: "Invest in their future",
                            alignment: "charismatic",
                            minigame: { type: "intensity", difficulty: "hard", label: "Vision Casting" },
                            stepScore: { success: 5, failure: 1 },
                        },
                        {
                            id: "let_them_go",
                            text: "Gracefully let them go if that's what they want",
                            consequence: "Don't cage people",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "remind_of_loyalty",
                            text: "Remind them of everything you've done for them",
                            consequence: "Guilt is a strategy",
                            alignment: "dark",
                            stepScore: 1,
                        },
                    ],
                },
                {
                    id: "the_decision",
                    stepNumber: 3,
                    title: "🚪 The Choice",
                    cinematicText:
                        'Days later. {employee1} stands at your door, resignation letter in hand—or maybe not.\n\n"I\'ve made my decision," they say.\n\nThe room is silent. {employee2} watches from across the office.',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "accept_gracefully",
                            text: "Whatever they chose, accept it gracefully",
                            consequence: "Dignity in all things",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "last_minute_offer",
                            text: "Make one final, everything-on-the-table offer",
                            consequence: "Leave nothing unsaid",
                            alignment: "determined",
                            stepScore: 2,
                            cost: 2e4,
                        },
                        {
                            id: "celebrate_either_way",
                            text: "Celebrate their time here regardless of choice",
                            consequence: "Honor the relationship",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "non_compete",
                            text: "If they leave, enforce the non-compete clause",
                            consequence: "Protect your interests",
                            alignment: "ruthless",
                            stepScore: 0,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 9,
                    title: "❤️ Unshakeable Loyalty",
                    text: "They stayed—not for the money, but because of how you handled this. Their loyalty is now absolute.",
                    effects: { boost_all_trust: 30, loyalty_boost: 90, reputation_boost: 15 },
                },
                excellent: {
                    threshold: 6,
                    title: "🤝 Mutual Respect",
                    text: "Whether they stayed or left, the relationship remains strong. That's a win.",
                    effects: { boost_all_trust: 20, reputation_boost: 10 },
                },
                good: {
                    threshold: 3,
                    title: "✅ Handled Professionally",
                    text: "The situation was managed. Life goes on.",
                    effects: { boost_all_trust: 10 },
                },
                neutral: {
                    threshold: 0,
                    title: "😐 Awkward Transition",
                    text: "Things are tense. It'll take time to recover.",
                    effects: { decrease_all_comfort: 10 },
                },
                poor: {
                    threshold: -100,
                    title: "💔 Burned Bridge",
                    text: "They left angry, and they're telling everyone why. The damage to morale and reputation is significant.",
                    effects: { random_employee_quits: !0, reputation_hit: 20, decrease_all_trust: 20 },
                },
            },
        },
        data_breach: {
            id: "data_breach",
            title: "🔓 The Data Breach",
            description: "Your systems have been compromised. Everything you do now matters.",
            theme: "crisis",
            mood: "urgent",
            totalSteps: 4,
            requiredEmployees: 3,
            unlockConditions: { minEmployees: 5, minCash: 5e4, minAct: 2 },
            themeColor: "#d32f2f",
            steps: [
                {
                    id: "discovery",
                    stepNumber: 1,
                    title: "🚨 Breach Detected",
                    cinematicText:
                        'The alert screams across your dashboard at 2 AM. Unauthorized access. Data exfiltration detected.\n\n{employee1}, your IT lead, calls immediately. "Boss, it\'s bad. Customer data. Financial records. Someone got in."\n\nYour phone starts buzzing. How did the press find out already?',
                    choices: [
                        {
                            id: "lockdown",
                            text: "Immediate full system lockdown",
                            consequence: "Stop the bleeding",
                            alignment: "determined",
                            stepScore: 3,
                        },
                        {
                            id: "trace_first",
                            text: "Keep systems running to trace the attacker",
                            consequence: "Catch them in the act",
                            alignment: "calculating",
                            minigame: { type: "reflex", difficulty: "hard", label: "Active Threat Hunting" },
                            stepScore: { success: 4, failure: 0 },
                        },
                        {
                            id: "call_experts",
                            text: "Immediately call cybersecurity experts",
                            consequence: "Get help fast",
                            alignment: "pragmatic",
                            stepScore: 3,
                            cost: 25e3,
                        },
                        {
                            id: "assess_damage",
                            text: "Assess the full scope before acting",
                            consequence: "Know what you're dealing with",
                            alignment: "cautious",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "notification",
                    stepNumber: 2,
                    title: "📢 Telling the World",
                    cinematicText:
                        'The law requires notification. Customers need to know their data may be compromised.\n\n{employee2} drafts a statement. "Boss, how honest do we want to be? We could minimize this or... tell everything."\n\nThe lawyers say minimize. Your gut says...',
                    choices: [
                        {
                            id: "full_disclosure",
                            text: "Full, transparent disclosure",
                            consequence: "The truth, all of it",
                            alignment: "lawful",
                            stepScore: 4,
                        },
                        {
                            id: "legal_minimum",
                            text: "Disclose the legal minimum only",
                            consequence: "Protect the brand",
                            alignment: "calculating",
                            stepScore: 1,
                        },
                        {
                            id: "proactive_help",
                            text: "Disclose and offer proactive help to affected users",
                            consequence: "Turn crisis into service",
                            alignment: "light",
                            stepScore: 3,
                            cost: 2e4,
                        },
                        {
                            id: "blame_vendor",
                            text: "Shift blame to a third-party vendor",
                            consequence: "Deflect responsibility",
                            alignment: "cunning",
                            stepScore: 0,
                        },
                    ],
                },
                {
                    id: "investigation",
                    stepNumber: 3,
                    title: "🔍 The Investigation",
                    cinematicText:
                        "Forensics reveals the entry point. A phishing email. Someone on your team clicked a bad link.\n\n{employee3} approaches you, pale. \"Boss... I think it was me. That email from 'HR' last week. I'm so sorry.\"\n\nThe team is watching how you handle this.",
                    choices: [
                        {
                            id: "no_blame",
                            text: "No individual blame - this is a systemic issue",
                            consequence: "We failed together",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "training_not_punishment",
                            text: "Mandatory security training, not punishment",
                            consequence: "Learn from mistakes",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "accountability",
                            text: "There must be some accountability",
                            consequence: "Actions have consequences",
                            alignment: "lawful",
                            stepScore: 1,
                        },
                        {
                            id: "protect_employee",
                            text: "Protect {employee3} from external blame",
                            consequence: "Shield your people",
                            alignment: "loyal",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "aftermath",
                    stepNumber: 4,
                    title: "🛡️ Rebuilding Trust",
                    cinematicText:
                        'Weeks later. New security systems are in place. Customer complaints are slowing.\n\n{employee1}, {employee2}, and {employee3} gather for a postmortem.\n\n"We survived," {employee1} says. "But some customers aren\'t coming back. How do we rebuild?"',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "invest_heavily",
                            text: "Invest heavily in security and communicate it",
                            consequence: "Never again",
                            alignment: "determined",
                            stepScore: 3,
                            cost: 4e4,
                        },
                        {
                            id: "customer_outreach",
                            text: "Personal outreach to affected customers",
                            consequence: "One relationship at a time",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "third_party_audit",
                            text: "Commission a third-party security audit",
                            consequence: "Prove your commitment",
                            alignment: "lawful",
                            stepScore: 2,
                            cost: 15e3,
                        },
                        {
                            id: "move_forward",
                            text: "Focus on the future, not the past",
                            consequence: "Don't dwell",
                            alignment: "pragmatic",
                            stepScore: 1,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 12,
                    title: "🛡️ Security Champion",
                    text: "Your handling of the breach became a case study in crisis management. Customers actually trust you MORE now.",
                    effects: {
                        reputation_boost: 25,
                        boost_all_trust: 30,
                        investigation_cleared: !0,
                        unlock_perk: {
                            perkId: "security_excellence",
                            name: "Security Excellence",
                            description: "Future breaches 75% less likely",
                        },
                    },
                },
                excellent: {
                    threshold: 9,
                    title: "✅ Crisis Managed",
                    text: "You handled a nightmare scenario with grace. Trust is recovering.",
                    effects: { reputation_boost: 10, boost_all_trust: 20 },
                },
                good: {
                    threshold: 6,
                    title: "👍 Survived the Storm",
                    text: "Damage done, but you're still standing.",
                    effects: { boost_all_trust: 10 },
                },
                neutral: {
                    threshold: 3,
                    title: "😐 Lingering Damage",
                    text: "The breach will define you for a while. Recovery is slow.",
                    effects: { reputation_hit: 10 },
                },
                poor: {
                    threshold: -100,
                    title: "💀 Catastrophic Failure",
                    text: "The breach response was as bad as the breach itself. Lawsuits pending, customers fleeing.",
                    effects: { fine: 1e5, reputation_hit: 40, decrease_all_trust: 30, random_employee_quits: !0 },
                },
            },
        },
        culture_clash: {
            id: "culture_clash",
            title: "🌐 The Culture Clash",
            description: "Generational and cultural differences threaten to divide your team.",
            theme: "diversity",
            mood: "challenging",
            totalSteps: 3,
            requiredEmployees: 3,
            unlockConditions: { minEmployees: 5, minCash: 2e4, minAct: 1 },
            themeColor: "#9c27b0",
            steps: [
                {
                    id: "the_incident",
                    stepNumber: 1,
                    title: "💥 The Comment",
                    cinematicText:
                        'The meeting just ended. Badly.\n\n{employee1}, your veteran, made a joke about "young people and their phones." {employee2}, newest hire, called them "out of touch."\n\nNow they\'re not speaking. Half the office is taking sides.',
                    choices: [
                        {
                            id: "mediate_immediately",
                            text: "Call both into your office for mediation",
                            consequence: "Deal with it now",
                            alignment: "determined",
                            stepScore: 3,
                        },
                        {
                            id: "let_cool_down",
                            text: "Give everyone time to cool down",
                            consequence: "Time heals",
                            alignment: "cautious",
                            stepScore: 1,
                        },
                        {
                            id: "team_meeting",
                            text: "Address it openly in a team meeting",
                            consequence: "Sunshine is the best disinfectant",
                            alignment: "light",
                            minigame: { type: "composure", difficulty: "medium", label: "Team Facilitation" },
                            stepScore: { success: 4, failure: 0 },
                        },
                        {
                            id: "ignore_it",
                            text: "Stay out of personal conflicts",
                            consequence: "Not your job to parent adults",
                            alignment: "detached",
                            stepScore: 0,
                        },
                    ],
                },
                {
                    id: "deeper_issues",
                    stepNumber: 2,
                    title: "🧊 The Freeze",
                    cinematicText:
                        "It's been a week. {employee1} and {employee2} are professional but frozen. Projects are suffering from lack of collaboration.\n\n{employee3} comes to you. \"Boss, it's not just them. There are real cultural differences on this team that we've been ignoring.\"",
                    choices: [
                        {
                            id: "dei_workshop",
                            text: "Bring in a DEI facilitator for workshops",
                            consequence: "Professional help for professional problems",
                            alignment: "pragmatic",
                            stepScore: 2,
                            cost: 8e3,
                        },
                        {
                            id: "bridge_building",
                            text: "Create cross-generational project pairs",
                            consequence: "Understanding through collaboration",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "one_on_ones",
                            text: "Individual conversations with everyone",
                            consequence: "Understand each perspective",
                            alignment: "humble",
                            minigame: { type: "intensity", difficulty: "hard", label: "Deep Listening" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "set_rules",
                            text: "Establish clear professional conduct rules",
                            consequence: "Boundaries matter",
                            alignment: "lawful",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "resolution",
                    stepNumber: 3,
                    title: "🤝 The Bridge",
                    cinematicText:
                        '{employee1} and {employee2} are in your office together. The air is still tense, but something has shifted.\n\n"I didn\'t mean to dismiss you," {employee1} says quietly.\n\n"I overreacted," {employee2} admits.\n\nThey look to you. What kind of workplace culture do you want to build?',
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "celebrate_difference",
                            text: "Create a culture that celebrates differences",
                            consequence: "Diversity is strength",
                            alignment: "light",
                            stepScore: 3,
                        },
                        {
                            id: "focus_on_mission",
                            text: "Unite around shared mission, minimize personal differences",
                            consequence: "We're here to work",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "ongoing_dialogue",
                            text: "Establish ongoing dialogue about culture",
                            consequence: "Keep the conversation going",
                            alignment: "humble",
                            stepScore: 2,
                        },
                        {
                            id: "performance_focus",
                            text: "Judge only by results, not personality",
                            consequence: "Meritocracy above all",
                            alignment: "calculating",
                            stepScore: 1,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 9,
                    title: "🌈 Unified Team",
                    text: "The conflict became a catalyst for real understanding. Your team is stronger and more cohesive than ever.",
                    effects: {
                        boost_all_trust: 30,
                        boost_all_comfort: 25,
                        boost_all_productivity: 15,
                        unlock_perk: {
                            perkId: "inclusive_culture",
                            name: "Inclusive Culture",
                            description: "+20% effectiveness of diverse teams",
                        },
                    },
                },
                excellent: {
                    threshold: 6,
                    title: "🤝 Mutual Respect",
                    text: "Differences remain, but respect prevails. The team functions well.",
                    effects: { boost_all_trust: 20, boost_all_comfort: 15 },
                },
                good: {
                    threshold: 3,
                    title: "✅ Functional Truce",
                    text: "They work together professionally. The warmth will come later.",
                    effects: { boost_all_trust: 10, boost_all_comfort: 10 },
                },
                neutral: {
                    threshold: 0,
                    title: "😐 Uneasy Peace",
                    text: "The conflict is suppressed, not resolved. Watch for flare-ups.",
                    effects: {},
                },
                poor: {
                    threshold: -100,
                    title: "💔 Divided House",
                    text: "The team is fractured. Cliques have formed. Productivity suffers.",
                    effects: {
                        decrease_all_trust: 20,
                        decrease_all_comfort: 15,
                        decrease_all_productivity: 15,
                        random_employee_quits: !0,
                    },
                },
            },
        },
        unexpected_windfall: {
            id: "unexpected_windfall",
            title: "💰 The Windfall",
            description: "A massive unexpected payment arrives. What you do with it defines you.",
            theme: "opportunity",
            mood: "exciting",
            totalSteps: 3,
            requiredEmployees: 3,
            unlockConditions: { minEmployees: 4, minCash: 1e4, minAct: 1 },
            themeColor: "var(--l-x-yellow)",
            steps: [
                {
                    id: "the_payment",
                    stepNumber: 1,
                    title: "🎰 The Arrival",
                    cinematicText:
                        "The bank calls. A wire transfer just hit your account. $500,000.\n\nIt's from an old client—apparently a contract clause you forgot about triggered. It's legitimate. It's yours.\n\n{employee1} sees the balance. \"Boss... what are you going to do with that?\"",
                    choices: [
                        {
                            id: "share_news",
                            text: "Share the news with the whole team",
                            consequence: "Transparency, even in good times",
                            alignment: "light",
                            stepScore: 2,
                        },
                        {
                            id: "keep_quiet",
                            text: "Keep it quiet for now while you plan",
                            consequence: "Manage expectations",
                            alignment: "calculating",
                            stepScore: 2,
                        },
                        {
                            id: "immediate_celebration",
                            text: "Immediate team celebration",
                            consequence: "Share the joy",
                            alignment: "charismatic",
                            stepScore: 2,
                            cost: 5e3,
                        },
                        {
                            id: "verify_first",
                            text: "Verify it's not an error before getting excited",
                            consequence: "Caution is warranted",
                            alignment: "cautious",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "the_ask",
                    stepNumber: 2,
                    title: "🙋 The Requests",
                    cinematicText:
                        "Word got out. Now everyone has ideas.\n\n{employee1} wants equipment upgrades. {employee2} thinks raises are overdue. {employee3} has pitched an expansion plan.\n\nThe money is finite. The dreams are not.",
                    choices: [
                        {
                            id: "democratic_vote",
                            text: "Let the team vote on allocation",
                            consequence: "Democracy in action",
                            alignment: "light",
                            minigame: { type: "composure", difficulty: "medium", label: "Facilitate Decision" },
                            stepScore: { success: 4, failure: 1 },
                        },
                        {
                            id: "executive_decision",
                            text: "Make the call yourself - it's your company",
                            consequence: "Leadership means deciding",
                            alignment: "determined",
                            stepScore: 2,
                        },
                        {
                            id: "split_evenly",
                            text: "Split it: bonuses, equipment, AND expansion",
                            consequence: "Something for everyone",
                            alignment: "diplomatic",
                            stepScore: 2,
                        },
                        {
                            id: "save_it",
                            text: "Bank most of it for future emergencies",
                            consequence: "Think long-term",
                            alignment: "cautious",
                            stepScore: 2,
                        },
                    ],
                },
                {
                    id: "the_allocation",
                    stepNumber: 3,
                    title: "💸 The Decision",
                    cinematicText:
                        "Time to decide. The money sits there, full of potential.\n\n{employee1}, {employee2}, and {employee3} wait for your announcement. This isn't just about money—it's about what kind of company you're building.",
                    isFinalStep: !0,
                    choices: [
                        {
                            id: "invest_in_people",
                            text: "Major bonuses for everyone - invest in people",
                            consequence: "People first",
                            alignment: "light",
                            stepScore: 3,
                            cost: -2e5,
                        },
                        {
                            id: "invest_in_growth",
                            text: "Invest in growth - new equipment, expansion",
                            consequence: "Build the future",
                            alignment: "ambitious",
                            stepScore: 2,
                        },
                        {
                            id: "strategic_reserve",
                            text: "Keep a strategic reserve, use rest wisely",
                            consequence: "Balance growth and security",
                            alignment: "pragmatic",
                            stepScore: 2,
                        },
                        {
                            id: "charitable_donation",
                            text: "Donate a significant portion to charity",
                            consequence: "Give back",
                            alignment: "humanitarian",
                            stepScore: 3,
                            cost: -15e4,
                        },
                    ],
                },
            ],
            finalOutcomes: {
                legendary: {
                    threshold: 9,
                    title: "👑 Wise Steward",
                    text: "You turned unexpected fortune into lasting value. The team feels valued, and the company is stronger.",
                    effects: { bonus_cash: 3e5, boost_all_trust: 25, boost_all_comfort: 20, reputation_boost: 20 },
                },
                excellent: {
                    threshold: 6,
                    title: "💎 Good Use",
                    text: "The money was well spent. Everyone feels like they got something.",
                    effects: { bonus_cash: 25e4, boost_all_trust: 15, boost_all_comfort: 15 },
                },
                good: {
                    threshold: 3,
                    title: "✅ Reasonable Choices",
                    text: "Not everyone's thrilled, but the decisions were sound.",
                    effects: { bonus_cash: 25e4, boost_all_trust: 10 },
                },
                neutral: {
                    threshold: 0,
                    title: "😐 Mixed Feelings",
                    text: "Some winners, some losers. The windfall created as many problems as it solved.",
                    effects: { bonus_cash: 25e4, decrease_all_comfort: 10 },
                },
                poor: {
                    threshold: -100,
                    title: "💸 Squandered Fortune",
                    text: "The money's gone and no one's happy. How did you manage that?",
                    effects: { bonus_cash: 1e5, decrease_all_trust: 20, decrease_all_comfort: 15 },
                },
            },
        },
    },
    startMultiStepEvent(e, t = []) {
        const n = this.MULTI_STEP_EVENTS[e];
        if (n) {
            if (n.unlockConditions) {
                const t = n.unlockConditions,
                    a = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus);
                if (t.minEmployees && a.length < t.minEmployees)
                    return void console.log(`[StoryEngine] Not enough employees for ${e}`);
                if (t.minCash && gameState.cash < t.minCash)
                    return void console.log(`[StoryEngine] Not enough cash for ${e}`);
                if (t.minAct && gameState.story.currentAct < t.minAct)
                    return void console.log(`[StoryEngine] Act requirement not met for ${e}`);
            }
            if (!t.length) {
                const e = [...gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus)].sort(
                    () => Math.random() - 0.5
                );
                t = e.slice(0, Math.min(n.requiredEmployees || 3, e.length)).map((e) => e.id);
            }
            (gameState.story.activeMultiStepEvent = {
                id: e,
                title: n.title,
                description: n.description,
                theme: n.theme,
                mood: n.mood,
                themeColor: n.themeColor,
                totalSteps: n.totalSteps,
                currentStep: 0,
                stepOutcomes: [],
                involvedEmployees: t,
                cumulativeScore: 0,
                stepFlags: {},
                startedAt: Date.now(),
            }),
                this.addJournalEntry({
                    title: `🎬 ${n.title} Begins`,
                    content: n.description,
                    type: "multistep_start",
                    memorable: !0,
                }),
                this.showMultiStepEventStep(0),
                console.log(`[StoryEngine] 🎬 Started multi-step event: ${n.title}`);
        } else console.error(`[StoryEngine] Unknown multi-step event: ${e}`);
    },
    showMultiStepEventStep(e) {
        const t = gameState.story.activeMultiStepEvent;
        if (!t) return void console.error("[StoryEngine] No active multi-step event");
        const n = this.MULTI_STEP_EVENTS[t.id];
        if (!n || !n.steps[e]) return void console.error(`[StoryEngine] Invalid step index: ${e}`);
        const a = n.steps[e];
        t.currentStep = e + 1;
        const o = t.involvedEmployees.map((e, t) => {
            const n = gameState.employees.find((t) => t.id === e);
            return n ? n.name : `Employee ${t + 1}`;
        });
        let i = a.cinematicText;
        o.forEach((e, t) => {
            i = i.replace(new RegExp(`\\{employee${t + 1}\\}`, "g"), e);
        });
        const s = a.choices.map((e) => {
            let t = e.consequence || "";
            return (
                o.forEach((e, n) => {
                    t = t.replace(new RegExp(`\\{employee${n + 1}\\}`, "g"), e);
                }),
                { ...e, consequence: t }
            );
        });
        this.showMultiStepEventModal(a, i, s, n);
    },
    showMultiStepEventModal(e, t, n, a) {
        const o = gameState.story.activeMultiStepEvent,
            i = document.getElementById("storyEventModal");
        i && i.remove();
        const s = document.createElement("div");
        (s.id = "storyEventModal"),
            (s.className = "story-modal-overlay"),
            (s.style.cssText =
                "\n        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n        background: var(--l-veil-95); z-index: 100001;\n        display: flex; justify-content: center; align-items: center;\n        animation: storyFadeIn 0.8s ease-out;\n        padding: 20px; box-sizing: border-box;\n      ");
        const r = o.themeColor || "var(--l-indigo)",
            l = Array.from({ length: a.totalSteps }, (e, t) => {
                const n = t < o.currentStep - 1,
                    i = t === o.currentStep - 1,
                    s = o.stepOutcomes[t]?.score || 0;
                return `\n          <div style="\n            display: flex; flex-direction: column; align-items: center;\n            opacity: ${i ? 1 : n ? 0.8 : 0.4};\n          ">\n            <div style="\n              width: 36px; height: 36px;\n              background: ${n ? r : i ? "linear-gradient(135deg, " + r + ", " + r + "88)" : "var(--l-panel)"};\n              border: 2px solid ${i || n ? r : "var(--l-neutral-3)"};\n              border-radius: 50%;\n              display: flex; align-items: center; justify-content: center;\n              font-size: 1rem; color: ${n || i ? "var(--l-ink)" : "var(--l-neutral-5)"};\n              ${i ? "box-shadow: 0 0 20px " + r + "66;" : ""}\n              transition: all 0.3s ease;\n            ">\n              ${n ? "✓" : t + 1}\n            </div>\n            ${n && 0 !== s ? `\n              <div style="font-size: 0.7rem; color: ${s > 0 ? "var(--l-green)" : "var(--l-red)"}; margin-top: 4px;">\n                ${s > 0 ? "+" + s : s}\n              </div>\n            ` : ""}\n          </div>\n          ${t < a.totalSteps - 1 ? `\n            <div style="\n              flex: 1; height: 2px; \n              background: ${n ? r : "var(--l-neutral-3)"};\n              margin: 0 8px; align-self: center;\n              transition: background 0.5s ease;\n            "></div>\n          ` : ""}\n        `;
            }).join(""),
            c = n
                .map((e) => {
                    const t =
                            {
                                lawful: "var(--l-green)",
                                light: "var(--l-cyan)",
                                neutral: "var(--l-gold)",
                                dark: "var(--l-red)",
                                ruthless: "var(--l-red-dark)",
                                ambitious: "var(--l-pink-pale)",
                                defiant: "var(--l-red-lt)",
                                humble: "#a0c4ff",
                                charismatic: "var(--l-gold)",
                                calculating: "var(--l-violet-3)",
                                pragmatic: "var(--l-green-4)",
                                cautious: "var(--text-dim)",
                                independent: "var(--l-amber-5)",
                                determined: "var(--l-red-lt)",
                                adaptive: "#4cc9f0",
                                risky: "var(--l-magenta)",
                                diplomatic: "var(--l-green-4)",
                            }[e.alignment] || "var(--l-indigo)",
                        n = e.minigame && void 0 !== StoryMinigames,
                        a = n ? StoryMinigames.GAME_TYPES[e.minigame.type]?.icon || "🎮" : "",
                        o = n
                            ? `\n          <span style="\n            display: inline-flex; align-items: center; gap: 4px;\n            background: linear-gradient(135deg, #667eea33, #764ba233);\n            padding: 3px 8px; border-radius: 12px;\n            font-size: 0.7rem; color: var(--l-ink-on-fill);\n            margin-left: 8px;\n          ">${a} ${e.minigame.label || "Skill Check"}</span>\n        `
                            : "",
                        i = this.getChoiceCost(e),
                        s = i > 0,
                        r = !s || gameState.cash >= i,
                        l = s
                            ? `\n          <span style="\n            display: inline-flex; align-items: center; gap: 4px;\n            background: ${r ? "rgba(255,107,157,0.2)" : "rgba(255,0,0,0.2)"};\n            padding: 3px 8px; border-radius: 12px;\n            font-size: 0.7rem; color: ${r ? "var(--l-pink)" : "var(--l-red-4)"};\n            margin-left: 8px;\n          ">💰 ${"function" == typeof formatCash ? formatCash(i) : "$" + i.toLocaleString()}</span>\n        `
                            : "";
                    return `\n          <button class="story-choice-btn" \n                  onclick="StoryEngine.resolveMultiStepChoice('${e.id}')"\n                  data-scaled-cost="${i}"\n                  style="width:100%; padding:16px 18px; margin:6px 0; \n                         background:linear-gradient(135deg, rgba(15,52,96,0.9) 0%, rgba(22,33,62,0.9) 100%);\n                         border:2px solid ${r ? t : "var(--l-neutral-4)"}; border-radius:12px; \n                         color:${r ? "var(--l-ink)" : "var(--l-neutral-6)"}; cursor:${r ? "pointer" : "not-allowed"}; text-align:left;\n                         transition:all 0.3s ease; position:relative; overflow:hidden;\n                         ${r ? "" : "opacity:0.6;"}"\n                  ${r ? "" : "disabled"}>\n            <div style="position:relative; z-index:1;">\n              <div style="font-size:0.95rem; font-weight:600; margin-bottom:4px; display:flex; align-items:center; flex-wrap:wrap;">\n                ${e.text}${o}${l}\n              </div>\n              <div style="font-size:0.75rem; color:${r ? t : "var(--l-neutral-5)"}; opacity:0.9; font-style:italic;">${e.consequence || ""}</div>\n            </div>\n            <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(90deg, ${fuocAlpha(t, "22")} 0%, transparent 100%); opacity:0; transition:opacity 0.3s;" class="choice-hover-bg"></div>\n          </button>\n        `;
                })
                .join("");
        (s.innerHTML = `\n        <div class="story-modal-content" style="\n          background:linear-gradient(180deg, var(--l-bg) 0%, var(--l-panel-alt) 50%, var(--l-bg) 100%);\n          border-radius:20px; max-width:750px; width:100%; max-height:90vh;\n          overflow-y:auto; border:2px solid ${r};\n          box-shadow:0 0 100px ${fuocAlpha(r, "44")}, 0 0 40px ${fuocAlpha(r, "22")};\n          animation:storySlideUp 0.6s ease-out;\n        ">\n          \x3c!-- Top bar with event title and theme --\x3e\n          <div style="padding:15px 25px; background:linear-gradient(90deg, ${fuocAlpha(r, "33")} 0%, transparent 50%, ${fuocAlpha(r, "33")} 100%); border-bottom:1px solid ${fuocAlpha(r, "55")};">\n            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 10px;">\n              <div style="display:flex; align-items:center; gap:10px;">\n                <span style="font-size:1.5rem;">${a.title.match(/^[^\s]+/)[0] || "📖"}</span>\n                <span style="color:${r}; font-size:0.9rem; font-weight:600;">${o.title}</span>\n              </div>\n              <div style="display:flex; align-items:center; gap:12px;">\n                <div style="display:flex; align-items:center; gap:8px;">\n                  <span style="color:var(--text-dim); font-size:0.8rem;">Score:</span>\n                  <span style="color:${o.cumulativeScore >= 0 ? "var(--l-green)" : "var(--l-red)"}; font-weight:bold;">\n                    ${o.cumulativeScore >= 0 ? "+" : ""}${o.cumulativeScore}\n                  </span>\n                </div>\n                <button id="closeStoryEventBtn" title="Close (progress will be saved)" style="\n                  background: var(--l-sheen-10); border: 1px solid var(--border-strong); border-radius: 50%;\n                  width: 32px; height: 32px; color: var(--text-mute); font-size: 1.2rem; cursor: pointer;\n                  display: flex; align-items: center; justify-content: center;\n                  transition: all 0.2s ease;\n                " onmouseenter="this.style.background='rgba(233,69,96,0.3)';this.style.borderColor='var(--l-red)';this.style.color='var(--l-red)';"\n                   onmouseleave="this.style.background='var(--l-sheen-10)';this.style.borderColor='var(--l-neutral-5)';this.style.color='var(--l-on-accent)';">✕</button>\n              </div>\n            </div>\n          </div>\n          \n          \x3c!-- Progress bar --\x3e\n          <div style="padding:20px 30px; background:var(--l-veil-30);">\n            <div style="display:flex; align-items:center; justify-content:center; gap:0;">\n              ${l}\n            </div>\n          </div>\n          \n          \x3c!-- Step title --\x3e\n          <div style="padding:20px 30px 10px; text-align:center;">\n            <h2 style="margin:0; font-size:1.6rem; color:var(--l-ink); text-shadow:0 2px 15px ${fuocAlpha(r, "66")};">${e.title}</h2>\n            <div style="color:var(--text-mute); font-size:0.8rem; margin-top:5px;">\n              Step ${o.currentStep} of ${a.totalSteps}${e.isFinalStep ? " • Final Step" : ""}\n            </div>\n          </div>\n          \n          \x3c!-- Cinematic text --\x3e\n          <div id="storyTextContainer" style="padding:10px 30px 20px;">\n            <div id="storyText" style="color:var(--l-ink-cool-3); font-size:1rem; line-height:1.75; white-space:pre-wrap; font-family:Georgia, serif;">\n              ${gameState.story.settings.dramaticPauses ? "" : t}\n            </div>\n          </div>\n          \n          \x3c!-- Choices --\x3e\n          <div id="storyChoicesContainer" style="padding:0 30px 25px; ${gameState.story.settings.dramaticPauses ? "opacity:0;" : ""}">\n            ${c}\n          </div>\n        </div>\n      `),
            document.body.appendChild(s);
        const d = s.querySelector("#closeStoryEventBtn");
        d &&
            d.addEventListener("click", (e) => {
                e.stopPropagation(),
                    (s.style.animation = "storyFadeOut 0.3s ease-out"),
                    setTimeout(() => s.remove(), 300),
                    "function" == typeof showNotification &&
                        showNotification("📖 Multi-step event minimized - click the bell to resume", "info");
            }),
            s.addEventListener("click", (e) => {
                e.target === s &&
                    ((s.style.animation = "storyFadeOut 0.3s ease-out"),
                    setTimeout(() => s.remove(), 300),
                    "function" == typeof showNotification &&
                        showNotification("📖 Multi-step event minimized - click the bell to resume", "info"));
            }),
            s.querySelectorAll(".story-choice-btn").forEach((e) => {
                e.addEventListener("mouseenter", () => {
                    if (!e.disabled) {
                        e.style.transform = "translateX(5px)";
                        const t = e.querySelector(".choice-hover-bg");
                        t && (t.style.opacity = "1");
                    }
                }),
                    e.addEventListener("mouseleave", () => {
                        e.style.transform = "translateX(0)";
                        const t = e.querySelector(".choice-hover-bg");
                        t && (t.style.opacity = "0");
                    });
            }),
            gameState.story.settings.dramaticPauses &&
                this.typewriterEffect(t, "storyText", () => {
                    const e = document.getElementById("storyChoicesContainer");
                    e && ((e.style.transition = "opacity 0.5s ease"), (e.style.opacity = "1"));
                });
    },
    resolveMultiStepChoice(e) {
        const t = gameState.story.activeMultiStepEvent;
        if (!t) return;
        const n = this.MULTI_STEP_EVENTS[t.id].steps[t.currentStep - 1],
            a = n.choices.find((t) => t.id === e);
        if (!a) return;
        if (a.minigame && void 0 !== StoryMinigames) return void this.launchMultiStepMinigame(n, a);
        const o = this.getChoiceCost(a);
        if (o > 0) {
            if (gameState.cash < o) return void showNotification("❌ Not enough cash!", "error");
            (gameState.cash -= o),
                showNotification(
                    `💰 Spent ${"function" == typeof formatCash ? formatCash(o) : "$" + o.toLocaleString()}`,
                    "info"
                );
        }
        let i = 0;
        "number" == typeof a.stepScore
            ? (i = a.stepScore)
            : a.stepScore?.betting &&
              (i =
                  Math.floor(Math.random() * (a.stepScore.range[1] - a.stepScore.range[0] + 1)) +
                  a.stepScore.range[0]),
            this.finalizeMultiStepChoice(n, a, i);
    },
    launchMultiStepMinigame(e, t) {
        const n = {
                ...t.minigame,
                onComplete: (n) => {
                    let a = 0;
                    "perfect" === n.result
                        ? ((a = t.stepScore?.success || t.stepScore || 3), (a += 1))
                        : (a =
                              "success" === n.result
                                  ? t.stepScore?.success || t.stepScore || 2
                                  : (t.stepScore?.failure ?? 1));
                    const o = { ...t, minigameResult: n },
                        i = this.getChoiceCost(t);
                    i > 0 && gameState.cash >= i && (gameState.cash -= i), this.finalizeMultiStepChoice(e, o, a);
                },
            },
            a = document.getElementById("storyEventModal");
        a && a.remove(), StoryMinigames.launchMinigame(n.type, n, n.onComplete);
    },
    finalizeMultiStepChoice(e, t, n) {
        const a = gameState.story.activeMultiStepEvent,
            o = this.MULTI_STEP_EVENTS[a.id];
        a.stepOutcomes.push({
            stepId: e.id,
            stepNumber: e.stepNumber,
            choiceId: t.id,
            choiceText: t.text,
            alignment: t.alignment,
            score: n,
            minigameResult: t.minigameResult || null,
            timestamp: Date.now(),
        }),
            (a.cumulativeScore += n),
            t.consequence_flag && (a.stepFlags[t.consequence_flag] = !0),
            this.applyAlignmentEffect(t.alignment),
            gameState.story.choiceHistory.push({
                eventId: a.id,
                eventKey: `multistep_${a.id}_step${e.stepNumber}`,
                choiceId: t.id,
                alignment: t.alignment,
                timestamp: Date.now(),
                actNumber: gameState.story.currentAct,
                minigameResult: t.minigameResult || null,
            });
        const i = document.getElementById("storyEventModal");
        i && ((i.style.animation = "storyFadeOut 0.5s ease-out"), setTimeout(() => i.remove(), 500)),
            e.isFinalStep || a.currentStep >= o.totalSteps
                ? setTimeout(() => {
                      this.concludeMultiStepEvent();
                  }, 700)
                : setTimeout(() => {
                      this.showMultiStepEventStep(a.currentStep);
                  }, 700);
    },
    concludeMultiStepEvent() {
        const e = gameState.story.activeMultiStepEvent;
        if (!e) return;
        const t = this.MULTI_STEP_EVENTS[e.id];
        let n = null;
        const a = t.finalOutcomes,
            o = Object.keys(a).sort((e, t) => a[t].threshold - a[e].threshold);
        for (const t of o)
            if (e.cumulativeScore >= a[t].threshold) {
                n = { key: t, ...a[t] };
                break;
            }
        if (
            (n || (n = { key: o[o.length - 1], ...a[o[o.length - 1]] }),
            this.showMultiStepConclusion(e, t, n),
            n.effects)
        )
            for (const [t, a] of Object.entries(n.effects))
                "object" == typeof a && null !== a
                    ? this.executeGameplayEffect({ type: t, ...a, reason: `${e.title} outcome` })
                    : this.executeGameplayEffect({ type: t, amount: a, duration: a, reason: `${e.title} outcome` });
        const i = e.stepOutcomes
            .map(
                (e) =>
                    `• Step ${e.stepNumber}: "${e.choiceText}"${e.minigameResult ? ` [${e.minigameResult.result.toUpperCase()}]` : ""} (${e.score >= 0 ? "+" : ""}${e.score})`
            )
            .join("\n");
        this.addJournalEntry({
            title: `🎬 ${e.title} - ${n.title}`,
            content: `${t.description}\n\nYOUR JOURNEY:\n${i}\n\nFINAL SCORE: ${e.cumulativeScore >= 0 ? "+" : ""}${e.cumulativeScore}\n\nOUTCOME: ${n.text}`,
            type: "multistep_complete",
            memorable: !0,
        }),
            gameState.story.completedMultiStepEvents || (gameState.story.completedMultiStepEvents = []),
            gameState.story.completedMultiStepEvents.push({
                ...e,
                completedAt: Date.now(),
                finalOutcome: n.key,
                finalScore: e.cumulativeScore,
            });
    },
    showMultiStepConclusion(e, t, n) {
        let a = n.text || "";
        e.actors &&
            Object.entries(e.actors).forEach(([e, t]) => {
                const n = "string" == typeof t ? t : t?.name || e;
                a = a.replace(new RegExp(`\\{${e}\\}`, "g"), n);
            });
        const o = document.createElement("div");
        (o.id = "storyEventModal"),
            (o.className = "story-modal-overlay"),
            (o.style.cssText =
                "\n        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n        background: var(--l-veil-95); z-index: 100001;\n        display: flex; justify-content: center; align-items: center;\n        animation: storyFadeIn 0.8s ease-out;\n        padding: 20px; box-sizing: border-box;\n      ");
        e.themeColor;
        const i =
                e.cumulativeScore >= 10
                    ? "var(--l-gold)"
                    : e.cumulativeScore >= 5
                      ? "var(--l-green)"
                      : e.cumulativeScore >= 0
                        ? "var(--l-indigo)"
                        : "var(--l-red)",
            s = e.stepOutcomes
                .map((e) => {
                    const t = e.score > 0 ? "var(--l-green)" : e.score < 0 ? "var(--l-red)" : "var(--l-neutral-8)";
                    return `\n          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--l-sheen-05); border-radius:8px; margin:4px 0;">\n            <div>\n              <span style="color:var(--text-mute); font-size:0.75rem;">Step ${e.stepNumber}:</span>\n              <span style="color:var(--l-ink); margin-left:8px; font-size:0.85rem;">${e.choiceText}</span>\n              ${e.minigameResult ? `<span style="color:${"perfect" === e.minigameResult.result ? "var(--l-gold)" : "success" === e.minigameResult.result ? "var(--l-green)" : "var(--l-red)"}; font-size:0.7rem; margin-left:5px;">[${e.minigameResult.result.toUpperCase()}]</span>` : ""}\n            </div>\n            <span style="color:${t}; font-weight:bold; font-size:0.9rem;">\n              ${e.score >= 0 ? "+" : ""}${e.score}\n            </span>\n          </div>\n        `;
                })
                .join("");
        let r = "";
        if (n.effects) {
            r = `\n          <div style="margin-top:20px; padding:15px; background:var(--l-veil-30); border-radius:12px;">\n            <div style="color:var(--text-mute); font-size:0.8rem; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">Effects Applied</div>\n            <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">\n              ${Object.entries(
                    n.effects
                )
                    .map(([e, t]) => {
                        const n =
                            {
                                boost_all_trust: "💚",
                                decrease_all_trust: "💔",
                                boost_all_productivity: "📈",
                                decrease_all_productivity: "📉",
                                boost_all_comfort: "😊",
                                bonus_cash: "💰",
                                reputation_boost: "⭐",
                                reputation_hit: "📉",
                                fine: "💸",
                                employee_quits: "👋",
                                random_employee_quits: "👋",
                                investigation: "🔍",
                                unlock_perk: "🎁",
                            }[e] || "✨";
                        return e.includes("boost") || e.includes("bonus") || "reputation_boost" === e
                            ? `<span style="color:var(--positive);">${n} +${t}${e.includes("cash") ? "" : "%"} ${e.replace(/_/g, " ").replace("boost all ", "").replace("bonus ", "")}</span>`
                            : e.includes("decrease") || "fine" === e || "reputation_hit" === e
                              ? `<span style="color:var(--danger);">${n} -${t}${e.includes("cash") || "fine" === e ? "" : "%"} ${e.replace(/_/g, " ").replace("decrease all ", "")}</span>`
                              : e.includes("quits")
                                ? `<span style="color:var(--danger);">${n} An employee may leave</span>`
                                : "unlock_perk" === e && "object" == typeof t
                                  ? `<span style="color:var(--accent-gold);">${n} unlock perk: ${t.name || "Special Perk"}</span>`
                                  : `<span style="color:var(--l-ink-cool);">${n} ${e.replace(/_/g, " ")}</span>`;
                    })
                    .join("")}\n            </div>\n          </div>\n        `;
        }
        (o.innerHTML = `\n        <div class="story-modal-content" style="\n          background:linear-gradient(180deg, var(--l-bg) 0%, var(--l-panel-alt) 50%, var(--l-bg) 100%);\n          border-radius:20px; max-width:700px; width:100%; max-height:90vh;\n          overflow-y:auto; border:2px solid ${i};\n          box-shadow:0 0 100px ${fuocAlpha(i, "44")}, 0 0 40px ${fuocAlpha(i, "22")};\n          animation:storySlideUp 0.6s ease-out;\n          position:relative;\n        ">\n          \x3c!-- Close Button (prevents softlock) --\x3e\n          <button onclick="\n            gameState.story.activeMultiStepEvent = null;\n            document.getElementById('storyEventModal').remove();\n            if (typeof saveGame === 'function') saveGame();\n          " style="\n            position:absolute; top:15px; right:15px; z-index:10;\n            background:var(--l-sheen-10); border:none; color:var(--text-mute);\n            width:36px; height:36px; border-radius:50%; cursor:pointer;\n            font-size:1.3rem; display:flex; align-items:center; justify-content:center;\n            transition:all 0.2s;\n          " onmouseenter="this.style.background='var(--l-sheen-20)'; this.style.color='var(--l-ink)'"\n             onmouseleave="this.style.background='var(--l-sheen-10)'; this.style.color='var(--l-on-accent)'">✕</button>\n\n          \x3c!-- Header --\x3e\n          <div style="padding:30px 30px 20px; text-align:center; background:linear-gradient(180deg, ${fuocAlpha(i, "22")} 0%, transparent 100%);">\n            <div style="font-size:4rem; margin-bottom:15px;">\n              ${e.cumulativeScore >= 10 ? "🏆" : e.cumulativeScore >= 5 ? "⭐" : e.cumulativeScore >= 0 ? "✨" : "💫"}\n            </div>\n            <h1 style="margin:0; font-size:1.8rem; color:${i}; text-shadow:0 2px 20px ${fuocAlpha(i, "88")};">\n              ${n.title}\n            </h1>\n            <div style="color:var(--text-mute); font-size:0.9rem; margin-top:10px;">${e.title} Complete</div>\n          </div>\n          \n          \x3c!-- Score display --\x3e\n          <div style="text-align:center; padding:0 30px 20px;">\n            <div style="\n              display:inline-block; padding:15px 40px;\n              background:linear-gradient(135deg, ${fuocAlpha(i, "33")} 0%, transparent 100%);\n              border:2px solid ${fuocAlpha(i, "55")}; border-radius:50px;\n            ">\n              <span style="color:var(--text-mute); font-size:0.9rem;">Final Score:</span>\n              <span style="color:${i}; font-size:2rem; font-weight:bold; margin-left:10px;">\n                ${e.cumulativeScore >= 0 ? "+" : ""}${e.cumulativeScore}\n              </span>\n            </div>\n          </div>\n          \n          \x3c!-- Outcome text --\x3e\n          <div style="padding:0 30px 20px;">\n            <div style="\n              color:var(--l-ink-cool-3); font-size:1.1rem; line-height:1.7;\n              text-align:center; font-family:Georgia, serif;\n              padding:20px; background:var(--l-sheen-05);\n              border-radius:15px; border-left:3px solid ${i};\n            ">\n              ${a}\n            </div>\n          </div>\n          \n          \x3c!-- Journey summary --\x3e\n          <div style="padding:0 30px 20px;">\n            <div style="color:var(--text-mute); font-size:0.8rem; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">Your Journey</div>\n            ${s}\n          </div>\n          \n          ${r}\n          \n          \x3c!-- Continue button --\x3e\n          <div style="padding:20px 30px 30px; text-align:center;">\n            <button onclick="\n              gameState.story.activeMultiStepEvent = null;\n              document.getElementById('storyEventModal').remove();\n              if (typeof saveGame === 'function') saveGame();\n            " style="\n              padding:16px 50px; \n              background:linear-gradient(135deg, ${i}, ${fuocAlpha(i, "88")});\n              border:none; border-radius:12px; color:var(--l-on-accent); \n              font-size:1.1rem; font-weight:bold; cursor:pointer;\n              transition:all 0.3s ease;\n              box-shadow:0 5px 20px ${fuocAlpha(i, "44")};\n            "\n            onmouseenter="this.style.transform='scale(1.05)'"\n            onmouseleave="this.style.transform='scale(1)'">\n              Continue\n            </button>\n          </div>\n        </div>\n      `),
            document.body.appendChild(o),
            o.addEventListener("click", (e) => {
                e.target === o &&
                    ((gameState.story.activeMultiStepEvent = null),
                    o.remove(),
                    "function" == typeof saveGame && saveGame());
            });
    },
    canStartMultiStepEvent(e) {
        if (gameState.story.activeMultiStepEvent) return !1;
        if (gameState.story.completedMultiStepEvents?.some((t) => t.id === e)) return !1;
        const t = this.MULTI_STEP_EVENTS[e];
        if (!t) return !1;
        const n = t.unlockConditions || {},
            a = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus);
        return (
            !(n.minEmployees && a.length < n.minEmployees) &&
            !(n.minCash && gameState.cash < n.minCash) &&
            !(n.minAct && gameState.story.currentAct < n.minAct)
        );
    },
    getAvailableMultiStepEvents() {
        return Object.keys(this.MULTI_STEP_EVENTS).filter((e) => this.canStartMultiStepEvent(e));
    },
    showMilestoneAchievement(e) {
        const t = document.createElement("div");
        (t.style.cssText =
            "\n        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);\n        background: linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%);\n        border: 3px solid var(--accent-gold); border-radius: 20px;\n        padding: 30px 50px; text-align: center;\n        z-index: 100005; animation: storySlideUp 0.5s ease-out;\n        box-shadow: 0 0 50px rgba(255,215,0,0.3);\n      "),
            (t.innerHTML = `\n        <div style="font-size: 4rem; margin-bottom: 15px;">🏆</div>\n        <div style="color: var(--accent-gold); font-size: 1.5rem; font-weight: bold; margin-bottom: 10px;">\n          ${e.name} Unlocked!\n        </div>\n        <div style="color: var(--text-dim); font-size: 1rem; margin-bottom: 20px;">\n          ${e.bonus}\n        </div>\n        <button onclick="this.parentElement.remove()" style="\n          padding: 10px 30px; background: var(--l-gold); border: none;\n          border-radius: 8px; color: var(--l-on-accent); font-weight: bold; cursor: pointer;\n        ">Awesome!</button>\n      `),
            document.body.appendChild(t),
            setTimeout(() => {
                t.parentElement && t.remove();
            }, 5e3);
    },
    applyAlignmentEffect(e) {
        const t = {
                lawful: { moral: 3, charisma: 1, ruthless: -1 },
                light: { moral: 5, charisma: 2, ruthless: -2 },
                neutral: { moral: 0, charisma: 0, ruthless: 0 },
                dark: { moral: -5, charisma: -1, ruthless: 3 },
                ruthless: { moral: -8, charisma: -2, ruthless: 5 },
                ambitious: { moral: -1, charisma: 3, ruthless: 1 },
                defiant: { moral: 2, charisma: 2, ruthless: 0 },
                humble: { moral: 4, charisma: 0, ruthless: -2 },
                charismatic: { moral: 0, charisma: 4, ruthless: 0 },
                calculating: { moral: -2, charisma: 1, ruthless: 2 },
                pragmatic: { moral: 0, charisma: 1, ruthless: 0 },
                cautious: { moral: 1, charisma: -1, ruthless: -1 },
                independent: { moral: 1, charisma: 2, ruthless: 0 },
                determined: { moral: 1, charisma: 2, ruthless: 1 },
                adaptive: { moral: 0, charisma: 2, ruthless: 0 },
                risky: { moral: -1, charisma: 1, ruthless: 2 },
                submissive: { moral: -1, charisma: -2, ruthless: -2 },
                diplomatic: { moral: 2, charisma: 3, ruthless: -1 },
                cunning: { moral: -2, charisma: 2, ruthless: 2 },
                innovative: { moral: 1, charisma: 2, ruthless: 0 },
            },
            n = t[e] || t.neutral;
        (gameState.story.moralScore = Math.max(0, Math.min(100, gameState.story.moralScore + n.moral))),
            (gameState.story.charismaScore = Math.max(
                0,
                Math.min(100, gameState.story.charismaScore + n.charisma)
            )),
            (gameState.story.ruthlessnessScore = Math.max(
                0,
                Math.min(100, gameState.story.ruthlessnessScore + n.ruthless)
            )),
            this.updateManagementStyle();
    },
    showConsequenceToast(e) {
        const t = document.createElement("div");
        (t.style.cssText =
            "\n        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);\n        background: linear-gradient(135deg, var(--l-panel-alt) 0%, var(--l-bg) 100%);\n        border: 2px solid var(--l-indigo); border-radius: 12px;\n        padding: 15px 25px; max-width: 400px;\n        z-index: 100002; animation: storySlideUp 0.5s ease-out;\n        box-shadow: 0 10px 40px rgba(102,126,234,0.3);\n      "),
            (t.innerHTML = `\n        <div style="color:var(--l-indigo); font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Consequence</div>\n        <div style="color:var(--l-ink); font-size:0.95rem; line-height:1.5;">${e.consequence}</div>\n      `),
            document.body.appendChild(t),
            setTimeout(() => {
                (t.style.animation = "storyFadeOut 0.5s ease-out"), setTimeout(() => t.remove(), 500);
            }, 4e3);
    },
    addJournalEntry(e) {
        const t = {
            id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: e.title,
            content: e.content,
            type: e.type || "event",
            actNumber: e.actNumber || gameState.story.currentAct,
            timestamp: Date.now(),
            memorable: e.memorable || !1,
            eventKey: e.eventKey || null,
            fullCinematicText: e.fullCinematicText || null,
            choiceMade: e.choiceMade || null,
            choiceConsequence: e.choiceConsequence || null,
            choiceAlignment: e.choiceAlignment || null,
            imageUrl: e.imageUrl || null,
        };
        gameState.story.journal.unshift(t),
            gameState.story.journal.length > 100 &&
                (gameState.story.journal = gameState.story.journal.slice(0, 100)),
            this.updateJournalUI();
    },
    addStoryRecapToChat(e, t, n, a) {
        if (!e || !t) return;
        gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
        const o = "positive" === a ? "💚" : "negative" === a ? "💔" : "💭",
            i = "spine" === t.type ? "⭐" : "📜",
            s = t.cinematicText
                ? t.cinematicText.split(".").slice(0, 2).join(".").substring(0, 150) + "..."
                : t.title,
            r = `${i} **Story Event: ${t.title}**\n\n${s}\n\n${o} *Your choice: "${n.text}"*\n${n.consequence ? `\n→ ${n.consequence.substring(0, 150)}${n.consequence.length > 150 ? "..." : ""}` : ""}\n\n*${e.name} will remember this moment and how it affected your relationship.*`,
            l = gameState.time?.currentTime || Date.now();
        if (
            (gameState.chatHistory[e.id].push({
                sender: "📖 Story",
                content: r,
                isPlayer: !1,
                timestamp: l,
                isStoryRecap: !0,
                eventTitle: t.title,
                eventKey: t.eventKey,
                choiceMade: n.text,
                sentiment: a,
            }),
            gameState.activeChat?.id === e.id && "function" == typeof addChatMessage)
        ) {
            addChatMessage("📖 Story", r, !1, null, gameState.chatHistory[e.id].length - 1, null, l, !1, !0);
        }
        console.log(`[StoryEngine] Added story recap to ${e.name}'s chat: ${t.title}`);
    },
    showJournalEntryDetails(e) {
        const t = gameState.story.journal.find((t) => t.id === e);
        if (!t) return;
        const n = document.getElementById("journalDetailModal");
        n && n.remove();
        const a = new Date(t.timestamp).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }),
            o =
                {
                    spine: "⭐",
                    rib: "📜",
                    choice: "🎯",
                    act_transition: "🏛️",
                    event: "📋",
                    minor: "📝",
                    consequence: "⚠️",
                    benefit: "🎁",
                    achievement: "🏆",
                    relationship: "💕",
                }[t.type] || "📋";
        let i = "";
        if (t.choiceMade) {
            const e =
                {
                    lawful: "var(--l-green)",
                    light: "var(--l-cyan)",
                    neutral: "var(--l-gold)",
                    dark: "var(--l-red)",
                    ruthless: "var(--l-red-dark)",
                    ambitious: "var(--l-pink-pale)",
                    defiant: "var(--l-red-lt)",
                    humble: "#a0c4ff",
                    charismatic: "var(--l-gold)",
                    calculating: "var(--l-violet-3)",
                    pragmatic: "var(--l-green-4)",
                    cautious: "var(--text-dim)",
                    independent: "var(--l-amber-5)",
                    determined: "var(--l-red-lt)",
                    adaptive: "#4cc9f0",
                    risky: "var(--l-magenta)",
                    submissive: "#b8b8d1",
                    diplomatic: "var(--l-green-4)",
                    cunning: "var(--l-violet-3)",
                    innovative: "var(--l-cyan)",
                    compassionate: "var(--l-green)",
                }[t.choiceAlignment] || "var(--l-indigo)";
            i = `\n          <div style="margin-top:20px; padding:15px; background:linear-gradient(135deg, ${fuocAlpha(e, "22")}, transparent); border-radius:10px; border-left:3px solid ${e};">\n            <div style="font-size:0.85rem; color:var(--text-mute); margin-bottom:8px;">YOUR CHOICE:</div>\n            <div style="font-size:1rem; color:var(--l-ink); font-weight:600; margin-bottom:10px;">"${t.choiceMade}"</div>\n            ${t.choiceAlignment ? `<div style="font-size:0.75rem; color:${e}; text-transform:uppercase; margin-bottom:10px;">${t.choiceAlignment}</div>` : ""}\n            ${t.choiceConsequence ? `\n              <div style="font-size:0.85rem; color:var(--text-dim); font-style:italic; border-top:1px solid var(--border); padding-top:10px; margin-top:10px;">\n                ${t.choiceConsequence}\n              </div>\n            ` : ""}\n          </div>\n        `;
        }
        let s = "";
        t.imageUrl &&
            (s = `\n          <div style="margin:20px 0; text-align:center;">\n            <img src="${t.imageUrl}" alt="Event image" style="max-width:100%; max-height:300px; border-radius:10px; box-shadow:0 4px 20px var(--l-veil-30);" onerror="this.style.display='none'">\n          </div>\n        `);
        const r = document.createElement("div");
        (r.id = "journalDetailModal"),
            (r.style.cssText =
                "\n        position:fixed; top:0; left:0; width:100%; height:100%; z-index:10000;\n        background:var(--l-veil-85); display:flex; align-items:center; justify-content:center;\n        animation:fadeIn 0.3s ease;\n      "),
            (r.innerHTML = `\n        <div style="\n          background:linear-gradient(135deg, var(--l-panel-2) 0%, var(--l-bg) 100%);\n          border-radius:20px; max-width:700px; width:90%; max-height:85vh;\n          box-shadow:0 20px 60px var(--l-veil-50); overflow:hidden;\n          display:flex; flex-direction:column;\n        ">\n          \x3c!-- Header --\x3e\n          <div style="\n            padding:20px 25px; \n            background:linear-gradient(135deg, var(--l-panel-2) 0%, var(--l-panel-2) 100%);\n            border-bottom:1px solid var(--border);\n            display:flex; justify-content:space-between; align-items:center;\n          ">\n            <div style="display:flex; align-items:center; gap:12px;">\n              <span style="font-size:1.8rem;">${o}</span>\n              <div>\n                <h2 style="margin:0; color:var(--l-ink); font-size:1.3rem;">${t.title}</h2>\n                <div style="color:var(--text-mute); font-size:0.8rem; margin-top:4px;">Act ${t.actNumber} • ${a}</div>\n              </div>\n            </div>\n            <button onclick="document.getElementById('journalDetailModal').remove()" style="\n              background:none; border:none; color:var(--text-mute); font-size:1.8rem;\n              cursor:pointer; padding:5px 10px; line-height:1;\n            " onmouseover="this.style.color='var(--l-ink)'" onmouseout="this.style.color='var(--l-on-accent)'">×</button>\n          </div>\n          \n          \x3c!-- Content --\x3e\n          <div style="padding:25px; overflow-y:auto; flex:1;">\n            ${t.memorable ? '<div style="display:inline-block; background:#ffd70033; color:var(--accent-gold); padding:4px 12px; border-radius:20px; font-size:0.75rem; margin-bottom:15px;">★ MEMORABLE MOMENT</div>' : ""}\n            \n            ${s}\n            \n            <div style="\n              color:var(--l-x-blue-pale-3); font-size:1rem; line-height:1.8;\n              white-space:pre-wrap;\n            ">${t.fullCinematicText || t.content}</div>\n            \n            ${i}\n          </div>\n          \n          \x3c!-- Footer --\x3e\n          <div style="padding:15px 25px; border-top:1px solid var(--border); text-align:right;">\n            <button onclick="document.getElementById('journalDetailModal').remove()" style="\n              padding:10px 25px; background:linear-gradient(135deg, var(--l-indigo) 0%, var(--l-indigo-deep) 100%);\n              border:none; border-radius:10px; color:var(--l-ink-on-fill); font-size:0.9rem;\n              cursor:pointer; font-weight:600;\n            ">Close</button>\n          </div>\n        </div>\n      `),
            r.addEventListener("click", (e) => {
                e.target === r && r.remove();
            });
        const l = (e) => {
            "Escape" === e.key && (r.remove(), document.removeEventListener("keydown", l));
        };
        document.addEventListener("keydown", l), document.body.appendChild(r);
    },
    updateStoryUI() {
        if (!gameState.story) return;
        const e = gameState.story.currentAct,
            t = this.ACT_CONFIG[e],
            n = document.getElementById("currentActTitle"),
            a = document.getElementById("currentActDescription");
        n && (n.textContent = t.title), a && (a.textContent = t.description);
        const o = document.getElementById("actProgressPath"),
            i = document.getElementById("actProgressPercent");
        if (o && i) {
            const e = gameState.story.actProgress;
            o.setAttribute("stroke-dasharray", `${e}, 100`), (i.textContent = `${e}%`);
        }
        const s = document.getElementById("storyMoralAlignment");
        if (s) {
            const e = this.getAlignmentInfo(gameState.story.moralScore);
            (s.textContent = e.emoji), (s.title = e.name), (s.style.color = e.color);
        }
        this.updateActionStatsUI(),
            this.updateTimelineUI(),
            this.updateFactionsUI(),
            this.updateJournalUI(),
            this.updateChronicleUI(),
            this.updateActiveArcsUI(),
            this.updateExtendedEventsUI();
    },
    updateActiveArcsUI() {
        const host = document.getElementById("activeArcsList");
        if (!host) return;
        const arcs = (gameState.story?.emergentNarratives?.activeArcs || [])
            .slice()
            .sort((a, b) => (b.lastAdvancedAt || 0) - (a.lastAdvancedAt || 0));
        if (!isStoryEnabled() || 0 === arcs.length) {
            host.innerHTML = '<div class="empty-note">Storylines emerge from how your people actually feel about you...</div>';
            return;
        }
        host.innerHTML = arcs
            .map((a) => {
                const total = (this.ARC_TYPES[a.arcType]?.stages || []).length || 3,
                    dots = Array.from({ length: total }, (e, i) => (i <= a.stage ? "●" : "○")).join("");
                return `<div class="row row-between" style="padding:8px 0; border-bottom:1px solid var(--border);">
                        <div class="row" style="gap:8px; min-width:0;">
                            <span style="font-size:1.05rem;">${a.emoji || "🎭"}</span>
                            <div style="min-width:0;">
                                <div class="fs-sm text-body fw-600" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(a.employeeName)}</div>
                                <div class="text-dim fs-xs">${escapeHtml(a.name)} · ${escapeHtml(a.stageName || "")}</div>
                            </div>
                        </div>
                        <span class="text-accent fs-xs" title="Stage ${a.stage + 1} of ${total}" style="letter-spacing:2px;">${dots}</span>
                    </div>`;
            })
            .join("");
    },
    buildChronicle(limit = 50) {
        const out = [],
            s = gameState.story,
            now = gameState.time?.currentTime || Date.now(),
            empById = {};
        (gameState.employees || []).forEach((e) => (empById[e.id] = e));
        // PEOPLE — resonant NPC memories
        (gameState.employees || []).forEach((emp) => {
            (emp.memory?.eventMemories || []).forEach((m) => {
                if ((m.emotionalWeight || 3) < 4) return;
                out.push({
                    timestamp: m.timestamp || now,
                    kind: "people",
                    icon: "negative" === m.sentiment ? "💔" : "positive" === m.sentiment ? "💖" : "🗣️",
                    memorable: (m.emotionalWeight || 3) >= 6,
                    text: `<b>${escapeHtml(emp.name)}</b> ${"negative" === m.sentiment ? "still hasn't forgotten" : "remembers"} “${escapeHtml(m.title || "something")}”${m.outcome ? ` — ${escapeHtml(m.outcome)}` : ""}`,
                });
            });
        });
        // PEOPLE — moral actions involving a named employee
        (s.actionLog || []).forEach((a) => {
            const name = a.context?.employeeName || empById[a.context?.employeeId]?.name;
            if (!name) return;
            out.push({
                timestamp: a.timestamp || now,
                kind: "people",
                icon: a.moralImpact > 0 ? "✨" : a.moralImpact < 0 ? "⚡" : "📋",
                text: `You ${escapeHtml(a.description || "acted")} — <b>${escapeHtml(name)}</b>`,
            });
        });
        // PEOPLE — recent social posts by real employees
        (gameState.socialNetwork?.posts || []).slice(0, 30).forEach((post) => {
            const emp = empById[post.authorId];
            if (!emp || !post.content) return;
            out.push({
                timestamp: post.timestamp || now,
                kind: "people",
                icon: "📱",
                text: `<b>${escapeHtml(emp.name)}</b> posted: “${escapeHtml(post.content.slice(0, 140))}${post.content.length > 140 ? "…" : ""}”`,
            });
        });
        // MONEY — payroll runs
        (gameState.payroll?.weeklyPayrollHistory || []).forEach((p) => {
            const short = !1 === p.hadEnough;
            out.push({
                timestamp: p.date || now,
                kind: "money",
                icon: short ? "🩸" : p.wasEarlyBonus ? "🎁" : "💵",
                memorable: short,
                text: short
                    ? `Payroll came up short — only ${p.proRatedCount ?? p.employeeCount} of ${p.employeeCount} got paid (${formatCash(p.amount)}).`
                    : `${p.wasEarlyBonus ? "Early bonus paid out" : "Payroll ran clean"}: ${formatCash(p.amount)} to ${p.employeeCount} ${1 === p.employeeCount ? "person" : "people"}.`,
            });
        });
        // MONEY — standing arrears
        const arr = gameState.payroll?.arrears;
        if (arr && arr.missedCount > 0)
            out.push({
                timestamp: Number(arr.sinceWeekId) || now,
                kind: "money",
                icon: "⛓️",
                memorable: arr.missedCount >= 3,
                text: `Wages overdue: <b>${arr.missedCount}</b> week${arr.missedCount > 1 ? "s" : ""} behind${arr.amount ? ` (${formatCash(arr.amount)})` : ""}. The roster is noticing.`,
            });
        // MILESTONES — boss fights
        (gameState.bossFights?.history || []).forEach((b) => {
            const won = "victory" === b.result || b.victorious;
            out.push({
                timestamp: b.timestamp || now,
                kind: "milestone",
                icon: won ? "🏆" : "💀",
                memorable: !0,
                text: won
                    ? `You came out on top against <b>${escapeHtml(b.bossId || b.bossKey || "a rival")}</b>.`
                    : `<b>${escapeHtml(b.bossId || b.bossKey || "A rival")}</b> got the better of you.`,
            });
        });
        // MILESTONES — resolved company events
        (gameState.companyEvents?.history || []).forEach((c) => {
            out.push({
                timestamp: c.timestamp || c.generatedAt || c.triggerAt || now,
                kind: "milestone",
                icon: "🗂️",
                text: `<b>${escapeHtml(c.name || c.title || "A company event")}</b> resolved${c.outcomeText ? ` — ${escapeHtml(c.outcomeText.slice(0, 120))}` : ""}.`,
            });
        });
        // PEOPLE — emergent NPC arc beats
        (s.journal || []).forEach((j) => {
            if ("arc" !== j.type) return;
            out.push({
                timestamp: j.timestamp || now,
                kind: "people",
                icon: "🎭",
                memorable: j.memorable,
                journalId: j.id,
                text: escapeHtml(j.content || j.title || ""),
            });
        });
        // MILESTONES — authored beats, the player's own arc, and rare moments
        (s.journal || []).forEach((j) => {
            if (!["spine", "act_transition", "achievement", "choice", "player", "moment", "faction"].includes(j.type)) return;
            const narrated = "player" === j.type || "moment" === j.type;
            out.push({
                timestamp: j.timestamp || now,
                kind: "milestone",
                icon: "moment" === j.type ? "💫" : "faction" === j.type ? "🏴" : "player" === j.type ? "👑" : "act_transition" === j.type ? "🏛️" : "achievement" === j.type ? "🥇" : "choice" === j.type ? "🎯" : "⭐",
                memorable: j.memorable,
                journalId: j.id,
                text: narrated ? escapeHtml(j.content || j.title || "") : `<b>${escapeHtml(j.title || "A turning point")}</b>`,
            });
        });
        return out.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, limit);
    },
    setChronicleFilter(e) {
        gameState.story && ((gameState.story.chronicleFilter = e), this.updateChronicleUI());
    },
    updateChronicleUI() {
        const feed = document.getElementById("storyChronicleFeed");
        if (!feed || !gameState.story) return;
        if (!isStoryEnabled()) {
            feed.innerHTML = '<div class="text-dim italic fs-md" style="padding:30px 10px; text-align:center;">Story is disabled. Enable it in Settings to see your Chronicle.</div>';
            return;
        }
        const filter = gameState.story.chronicleFilter || "all",
            all = this.buildChronicle(50),
            counts = { all: all.length, people: 0, money: 0, milestone: 0 };
        all.forEach((e) => (counts[e.kind] = (counts[e.kind] || 0) + 1));
        const shown = "all" === filter ? all : all.filter((e) => e.kind === filter),
            chip = (key, label, active) =>
                `<button onclick="StoryEngine.setChronicleFilter('${key}')" style="padding:6px 12px; border-radius:15px; font-size:0.75rem; cursor:pointer; border:none; background:${active ? "var(--accent)" : "var(--l-neutral-3)"}; color:${active ? "var(--l-ink-on-fill)" : "var(--l-neutral-8)"};">${label}</button>`,
            filters = `<div style="display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap;">${chip("all", `All (${counts.all})`, "all" === filter)}${chip("people", `👥 People (${counts.people || 0})`, "people" === filter)}${chip("money", `💵 Money (${counts.money || 0})`, "money" === filter)}${chip("milestone", `🏛️ Milestones (${counts.milestone || 0})`, "milestone" === filter)}</div>`;
        if (0 === shown.length) {
            feed.innerHTML =
                filters +
                '<div class="text-dim italic fs-md" style="padding:30px 10px; text-align:center;">Nothing here yet. Keep playing — your Chronicle writes itself from what actually happens.</div>';
            return;
        }
        const rows = shown
            .map((e) => {
                const click = e.journalId ? ` onclick="StoryEngine.showJournalEntryDetails('${e.journalId}')"` : "";
                return `<div class="row row-top" data-kind="${e.kind}"${click} style="gap:10px; padding:10px 4px; border-bottom:1px solid var(--border);${e.journalId ? "cursor:pointer;" : ""}">
                        <span style="font-size:1.1rem; line-height:1.4;">${e.icon}</span>
                        <div style="flex:1; min-width:0;">
                            <div class="fs-sm text-body" style="line-height:1.45;${e.memorable ? "color:var(--accent-gold);" : ""}">${e.text}</div>
                            <div class="text-mute fs-xs mt-1">${getRelativeTimeString(e.timestamp)}${e.memorable ? " • ★" : ""}</div>
                        </div>
                    </div>`;
            })
            .join("");
        feed.innerHTML = filters + rows;
    },
    updateExtendedEventsUI() {
        const e = document.getElementById("activeMultiStepStatus");
        if (!e) return;
        const t = gameState.story.activeMultiStepEvent,
            n = gameState.story.completedMultiStepEvents || [],
            a = this.getAvailableMultiStepEvents();
        if (t) {
            const n = this.MULTI_STEP_EVENTS[t.id];
            (e.style.display = "block"),
                (e.innerHTML = `\n          <div style="background:linear-gradient(135deg, ${fuocAlpha(t.themeColor || "var(--l-indigo)", "22")}, transparent); padding:12px; border-radius:10px; border-left:3px solid ${t.themeColor || "var(--l-indigo)"};">\n            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">\n              <span style="font-size:1.2rem;">${n.title.match(/^[^\s]+/)[0] || "🎬"}</span>\n              <span style="color:var(--l-ink); font-weight:600; font-size:0.9rem;">In Progress</span>\n            </div>\n            <div style="color:var(--text-dim); font-size:0.8rem;">\n              Step ${t.currentStep} of ${t.totalSteps} • Score: <span style="color:${t.cumulativeScore >= 0 ? "var(--l-green)" : "var(--l-red)"}">${t.cumulativeScore >= 0 ? "+" : ""}${t.cumulativeScore}</span>\n            </div>\n            <button onclick="StoryEngine.showMultiStepEventStep(${t.currentStep - 1})" style="\n              margin-top:10px; padding:8px 15px; width:100%;\n              background:var(--l-indigo); border:none; border-radius:8px;\n              color:var(--l-ink-on-fill); font-size:0.85rem; cursor:pointer;\n            ">Continue Event</button>\n          </div>\n        `);
        } else
            a.length > 0
                ? ((e.style.display = "block"),
                  (e.innerHTML = `\n          <div style="color:var(--positive); font-size:0.85rem; display:flex; align-items:center; gap:6px;">\n            <span>✨</span> ${a.length} event${a.length > 1 ? "s" : ""} available\n          </div>\n          ${n.length > 0 ? `\n            <div style="color:var(--text-mute); font-size:0.75rem; margin-top:6px;">\n              ${n.length} completed\n            </div>\n          ` : ""}\n        `))
                : n.length > 0
                  ? ((e.style.display = "block"),
                    (e.innerHTML = `\n          <div style="color:var(--text-mute); font-size:0.85rem;">\n            ${n.length} event${n.length > 1 ? "s" : ""} completed\n          </div>\n        `))
                  : (e.style.display = "none");
    },
    updateActionStatsUI() {
        const e = gameState.story.actionStats || { totalActions: 0 },
            t = document.getElementById("storyTotalActions");
        t && (t.textContent = e.totalActions || 0);
        const n = document.getElementById("moralAlignmentBar");
        if (n) {
            const e = 100 - gameState.story.moralScore;
            n.style.left = `${e}%`;
        }
        const a = document.getElementById("latestActionText");
        if (a && gameState.story.actionLog?.length > 0) {
            const e = gameState.story.actionLog[0],
                t = e.moralImpact > 0 ? "✨" : e.moralImpact < 0 ? "⚡" : "📋";
            (a.innerHTML = `${t} You ${e.description}`),
                (a.style.color = e.moralImpact > 0 ? "var(--l-green)" : e.moralImpact < 0 ? "var(--l-red)" : "var(--l-ink-dim-2)");
        }
        const b = document.getElementById("becomingText");
        if (b) {
            const info = this.getAlignmentInfo(gameState.story.moralScore || 50),
                recent = (gameState.story.actionLog || []).slice(0, 8).reduce((s, e) => s + (e.moralImpact || 0), 0),
                drift = recent > 2 ? " — and softening lately" : recent < -2 ? " — and hardening lately" : "";
            (b.innerHTML = `${info.emoji} a ${escapeHtml(info.name.toLowerCase())}${drift}`),
                (b.style.color = info.color || "var(--l-ink-dim-2)");
        }
    },
    getAlignmentInfo(e) {
        const t = [0, 25, 50, 75, 100];
        for (let n = t.length - 1; n >= 0; n--) if (e >= t[n]) return this.ALIGNMENTS[t[n]];
        return this.ALIGNMENTS[0];
    },
    updateTimelineUI() {
        const e = gameState.story.currentAct;
        document.querySelectorAll(".timeline-act").forEach((t) => {
            if (!t) return;
            const n = parseInt(t.dataset.act);
            t.classList.remove("active", "completed", "locked");
            const a = t.querySelector('div[style*="position:absolute"]');
            n < e
                ? (t.classList.add("completed"), (t.style.opacity = "0.7"), a && (a.style.background = "var(--l-green)"))
                : n === e
                  ? (t.classList.add("active"),
                    (t.style.opacity = "1"),
                    a && ((a.style.background = "var(--l-indigo)"), (a.style.boxShadow = "0 0 10px rgba(102,126,234,0.5)")))
                  : (t.classList.add("locked"),
                    (t.style.opacity = "0.5"),
                    a && ((a.style.background = "var(--l-neutral-4)"), (a.style.boxShadow = "none")));
        });
    },
    updateFactionsUI() {
        const e = document.getElementById("factionsList");
        if (!e) return;
        const t = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus).length;
        if (t < 5)
            return void (e.innerHTML =
                '<div class="empty-note">Factions emerge as your empire grows...</div>');
        const n = {
            loyalists: { name: "Loyalists", emoji: "👑", color: "var(--l-gold)", desc: "Devoted to you completely" },
            opportunists: { name: "Opportunists", emoji: "💰", color: "var(--l-green)", desc: "Following the money" },
            reformers: { name: "Reformers", emoji: "⚖️", color: "var(--l-cyan)", desc: "Want change and ethics" },
            underground: { name: "Underground", emoji: "🌙", color: "var(--l-violet-3)", desc: "Embrace the shadows" },
        };
        let a = "",
            assigned = 0;
        for (const [e, o] of Object.entries(n)) {
            const f = gameState.story.factions[e],
                n = f.members.length,
                i = t > 0 ? Math.round((n / t) * 100) : 0,
                fh = f.figureheadName;
            (assigned += n),
                n > 0 &&
                    (a += `\n            <div class="subpanel mb-1" style="border-left:3px solid ${o.color};">\n              <div class="row-between mb-1">\n                <div class="row">\n                  <span style="font-size:1.2rem;">${o.emoji}</span>\n                  <span class="fw-600" style="color:${o.color};">${o.name}</span>\n                </div>\n                <span class="text-body fw-600">${n} · ${i}%</span>\n              </div>\n              <div class="text-dim fs-xs mb-1">${o.desc}</div>\n              ${fh ? `<div class="text-dim fs-xs mb-1">🎙️ led by ${escapeHtml(fh)}</div>` : ""}\n              <div class="bar">\n                <div class="bar-fill" style="width:${i}%; background:${o.color};"></div>\n              </div>\n            </div>\n          `);
        }
        const unaligned = Math.max(0, t - assigned);
        unaligned > 0 &&
            (a += `\n            <div class="subpanel mb-0" style="border-left:3px solid var(--border);">\n              <div class="row-between">\n                <div class="row"><span style="font-size:1.2rem;">🤍</span><span class="fw-600 text-dim">Unaligned</span></div>\n                <span class="text-dim fw-600">${unaligned} · ${Math.round((unaligned / t) * 100)}%</span>\n              </div>\n            </div>\n          `);
        e.innerHTML = a || '<div class="empty-note">No clear factions have emerged yet.</div>';
    },
    updateJournalUI() {
        const e = document.getElementById("storyJournal"),
            t = document.getElementById("journalEmpty");
        if (!e) return;
        const n = gameState.story.journal,
            a = gameState.story.journalFilter || "all";
        if (0 === n.length) return void (t && (t.style.display = "block"));
        t && (t.style.display = "none");
        let o = n;
        "all" !== a && (o = "memorable" === a ? n.filter((e) => e.memorable) : n.filter((e) => e.type === a));
        const i = {
                spine: "⭐",
                rib: "📜",
                choice: "🎯",
                act_transition: "🏛️",
                event: "📋",
                minor: "📝",
                consequence: "⚠️",
                benefit: "🎁",
                achievement: "🏆",
                relationship: "💕",
            },
            s = n.filter((e) => e.memorable).length,
            r = n.filter((e) => "choice" === e.type).length,
            l = n.filter((e) => "spine" === e.type).length,
            c = `\n        <div style="display:flex; gap:8px; margin-bottom:15px; flex-wrap:wrap;">\n          <button onclick="StoryEngine.setJournalFilter('all')" style="\n            padding:6px 12px; border-radius:15px; font-size:0.75rem; cursor:pointer;\n            background:${"all" === a ? "var(--l-indigo)" : "var(--l-neutral-3)"}; \n            border:none; color:${"all" === a ? "var(--l-ink-on-fill)" : "var(--l-neutral-8)"};\n          ">All (${n.length})</button>\n          <button onclick="StoryEngine.setJournalFilter('memorable')" style="\n            padding:6px 12px; border-radius:15px; font-size:0.75rem; cursor:pointer;\n            background:${"memorable" === a ? "var(--l-gold)" : "var(--l-neutral-3)"}; \n            border:none; color:${"memorable" === a ? "var(--l-black)" : "var(--l-neutral-8)"};\n          ">⭐ Memorable (${s})</button>\n          <button onclick="StoryEngine.setJournalFilter('spine')" style="\n            padding:6px 12px; border-radius:15px; font-size:0.75rem; cursor:pointer;\n            background:${"spine" === a ? "var(--l-red)" : "var(--l-neutral-3)"}; \n            border:none; color:${"spine" === a ? "var(--l-ink-on-fill)" : "var(--l-neutral-8)"};\n          ">📖 Story (${l})</button>\n          <button onclick="StoryEngine.setJournalFilter('choice')" style="\n            padding:6px 12px; border-radius:15px; font-size:0.75rem; cursor:pointer;\n            background:${"choice" === a ? "var(--l-green)" : "var(--l-neutral-3)"}; \n            border:none; color:${"choice" === a ? "var(--l-black)" : "var(--l-neutral-8)"};\n          ">🎯 Choices (${r})</button>\n        </div>\n        \n        \x3c!-- Quick Stats Panel --\x3e\n        <div class="subpanel mb-2" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:var(--s3);">\n          <div class="text-center">\n            <div class="fs-xl fw-700 text-accent">${gameState.story.choicesMade || 0}</div>\n            <div class="text-mute" style="font-size:0.7rem;">Choices Made</div>\n          </div>\n          <div class="text-center">\n            <div class="fs-xl fw-700 text-gold">${gameState.story.totalCleverResponses || 0}</div>\n            <div class="text-mute" style="font-size:0.7rem;">Clever Moves</div>\n          </div>\n          <div class="text-center">\n            <div class="fs-xl fw-700 text-pos">${gameState.story.currentAct}</div>\n            <div class="text-mute" style="font-size:0.7rem;">Current Act</div>\n          </div>\n        </div>\n      `;
        let d = o
            .slice(0, 30)
            .map((e) => {
                const t = i[e.type] || "📋",
                    n = new Date(e.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    a = e.pending && gameState.story.activeSpineEvent,
                    o = a
                        ? '<button onclick="event.stopPropagation(); StoryEngine.showStoryEventModal(gameState.story.activeSpineEvent)" class="btn btn--primary mt-1">▶️ Continue Event</button>'
                        : "",
                    s = a
                        ? '<span class="text-gold fs-xs" style="margin-left:8px;">⏳ Awaiting Choice</span>'
                        : "",
                    r =
                        e.memorable && !a
                            ? '<span class="text-gold" style="font-size:0.7rem;">★ MEMORABLE</span>'
                            : "",
                    l =
                        ((e.fullCinematicText && e.fullCinematicText.length > 200) ||
                            (e.content && e.content.length > 200) ||
                            e.choiceMade) &&
                        !a
                            ? '<div class="text-accent fs-xs mt-1 row" style="gap:4px;"><span>📖</span> Click to read full story</div>'
                            : "";
                return `\n          <div class="journal-entry" data-type="${e.type}" data-eventkey="${e.eventKey || ""}" \n               onclick="${a ? "" : `StoryEngine.showJournalEntryDetails('${e.id}')`}" \n               style="\n            margin-bottom:15px; padding:15px; \n            background:${e.memorable ? "linear-gradient(135deg, var(--l-panel-2) 0%, var(--l-bg) 100%)" : "var(--surface)"}; \n            border-radius:var(--r3); \n            border-left:3px solid ${a || e.memorable ? "var(--accent-gold)" : "var(--border)"};\n            ${e.memorable || a ? "box-shadow:0 2px 10px rgba(245,197,66,0.1);" : ""}\n            ${a ? "" : "cursor:pointer;"}\n          ">\n            <div class="row-between row-top mb-1">\n              <div class="row wrap">\n                <span style="font-size:1.2rem;">${t}</span>\n                <span class="text-body fw-600 fs-md">${e.title}</span>\n                ${s}\n                ${r}\n              </div>\n              <span class="text-mute fs-xs">Act ${e.actNumber} • ${n}</span>\n            </div>\n            <div class="text-dim fs-sm" style="line-height:1.5; white-space:pre-wrap;">${e.content.substring(0, 200)}${e.content.length > 200 ? "..." : ""}</div>\n            ${l}\n            ${o}\n          </div>\n        `;
            })
            .join("");
        e.innerHTML = c + d;
    },
    setJournalFilter(e) {
        gameState.story && ((gameState.story.journalFilter = e), this.updateJournalUI());
    },
    showStoryNotification() {
        const e = document.getElementById("storyNotificationDot");
        e && (e.style.display = "block");
    },
    hideStoryNotification() {
        const e = document.getElementById("storyNotificationDot");
        e && (e.style.display = "none");
    },
    generateActTransitionEvent(e, t) {
        const n = this.ACT_CONFIG[t],
            a = this.ACT_CONFIG[e],
            o = {
                2: {
                    title: "Expansion Tools Unlocked",
                    desc: "New hiring options and product lines available!",
                    mechanic: "hiring_expanded",
                },
                3: {
                    title: "Advanced Management",
                    desc: "Employee relationships and politics matter more.",
                    mechanic: "relationships_deeper",
                },
                4: {
                    title: "Crisis Management",
                    desc: "Expect more dramatic events and higher stakes.",
                    mechanic: "high_stakes",
                },
                5: {
                    title: "Legacy Mode",
                    desc: "Your decisions have lasting consequences.",
                    mechanic: "legacy_tracking",
                },
            }[t] || { title: "New Chapter", desc: "New possibilities await.", mechanic: "general" },
            i = this.generateActSummary(e),
            s = {
                id: `act_transition_${t}_${Date.now()}`,
                title: `✨ ${n.title}`,
                cinematicText: `═══════════════════════════════════════\n🎬 A NEW CHAPTER BEGINS\n═══════════════════════════════════════\n\n${a ? `📜 Reflecting on Act ${e}: "${a.title}"...\n${i}\n\n` : ""}The story shifts...\n\n${n.description}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎭 THE TONE SHIFTS: ${n.tone.toUpperCase()}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nNew themes emerge:\n${n.themes.map((e) => `  • ${e}`).join("\n")}\n\n═══════════════════════════════════════\n🔓 ${o.title}\n${o.desc}\n═══════════════════════════════════════`,
                choices: [
                    {
                        id: "confident",
                        text: '💪 "I\'m ready to face whatever comes."',
                        alignment: "determined",
                        consequence: "Your confidence inspires the team. +5% company morale.",
                        effects: { productivity: 5 },
                    },
                    {
                        id: "cautious",
                        text: '🤔 "Let\'s proceed carefully."',
                        alignment: "pragmatic",
                        consequence: "Your caution is noted. Stability preserved.",
                        effects: { stability: 5 },
                    },
                    {
                        id: "ambitious",
                        text: '🚀 "Time to aim higher!"',
                        alignment: "ambitious",
                        consequence: "Your ambition sets new expectations. Risk and reward both increase.",
                        effects: { risk: 10, reward: 10 },
                    },
                ],
                actNumber: t,
                type: "act_transition",
                isActTransition: !0,
                unlockMechanic: o.mechanic,
            };
        this.showActTransitionCinematic(s);
    },
    generateActSummary(e) {
        const t = gameState.story.actData?.[e];
        if (!t) return "Your journey continues...";
        const n = [];
        t.spineEventsTriggered?.length > 0 &&
            n.push(`📖 ${t.spineEventsTriggered.length} major story events experienced`),
            t.choicesMade > 0 && n.push(`🎯 ${t.choicesMade} key decisions made`),
            t.ribEventsTriggered?.length > 0 &&
                n.push(`📜 ${t.ribEventsTriggered.length} supporting events witnessed`);
        const a = gameState.story.alignmentScore || 50;
        return (
            a >= 70
                ? n.push("💝 Your leadership was compassionate and kind")
                : a <= 30
                  ? n.push("👊 Your leadership was decisive and ruthless")
                  : n.push("⚖️ Your leadership balanced pragmatism and heart"),
            n.length > 0 ? n.join("\n") : "Your journey continues..."
        );
    },
    showActTransitionCinematic(e) {
        const t = this.ACT_CONFIG[e.actNumber],
            n = document.createElement("div");
        (n.id = "actTransitionCinematic"),
            (n.style.cssText =
                "\n        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n        background: var(--l-black); z-index: 100005;\n        display: flex; flex-direction: column; justify-content: center; align-items: center;\n        animation: actCinematicFadeIn 1.5s ease-out;\n      "),
            (n.innerHTML = `\n        <style>\n          @keyframes actCinematicFadeIn {\n            0% { opacity: 0; }\n            100% { opacity: 1; }\n          }\n          @keyframes actTitleGlow {\n            0%, 100% { text-shadow: 0 0 20px ${t?.color || "var(--l-indigo)"}; }\n            50% { text-shadow: 0 0 40px ${t?.color || "var(--l-indigo)"}, 0 0 60px ${t?.color || "var(--l-indigo)"}; }\n          }\n          @keyframes actLineReveal {\n            0% { width: 0; }\n            100% { width: 100%; }\n          }\n        </style>\n        \n        <div style="text-align: center; max-width: 800px; padding: 40px;">\n          \x3c!-- Act Number --\x3e\n          <div style="\n            font-size: 1.2rem; color: var(--text-mute); letter-spacing: 8px;\n            margin-bottom: 20px; opacity: 0;\n            animation: storyFadeIn 1s ease-out 0.5s forwards;\n          ">ACT ${e.actNumber}</div>\n          \n          \x3c!-- Title --\x3e\n          <h1 style="\n            font-size: 3rem; color: ${t?.color || "var(--l-indigo)"}; margin: 0;\n            font-weight: 700; letter-spacing: 3px;\n            animation: actTitleGlow 3s ease-in-out infinite;\n            opacity: 0; animation: storyFadeIn 1s ease-out 1s forwards, actTitleGlow 3s ease-in-out infinite 1s;\n          ">${t?.title || "New Chapter"}</h1>\n          \n          \x3c!-- Decorative line --\x3e\n          <div style="\n            height: 2px; background: linear-gradient(90deg, transparent, ${t?.color || "var(--l-indigo)"}, transparent);\n            margin: 30px auto; max-width: 400px;\n            animation: actLineReveal 2s ease-out 1.5s forwards;\n          "></div>\n          \n          \x3c!-- Tone --\x3e\n          <div style="\n            font-size: 1.1rem; color: var(--text-mute); font-style: italic;\n            margin-bottom: 30px; opacity: 0;\n            animation: storyFadeIn 1s ease-out 2s forwards;\n          ">"${t?.tone || "A new beginning"}"</div>\n          \n          \x3c!-- Continue button --\x3e\n          <button onclick="gameState.story.activeSpineEvent = StoryEngine.pendingActEvent; StoryEngine.showStoryEventModal(StoryEngine.pendingActEvent); document.getElementById('actTransitionCinematic').remove();" style="\n            padding: 15px 40px; font-size: 1.1rem;\n            background: linear-gradient(135deg, ${t?.color || "var(--l-indigo)"} 0%, ${fuocAlpha(t?.color || "var(--l-indigo-deep)", "88")} 100%);\n            border: none; border-radius: 12px; color: var(--l-ink);\n            cursor: pointer; font-weight: 600;\n            opacity: 0; animation: storyFadeIn 1s ease-out 3s forwards;\n            transition: transform 0.2s, box-shadow 0.2s;\n          " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">\n            Continue Your Story\n          </button>\n        </div>\n      `),
            document.body.appendChild(n),
            (this.pendingActEvent = e);
    },
    MINOR_EVENT_CATEGORIES: [
        "office incident",
        "interpersonal drama",
        "business opportunity",
        "employee personal issue",
        "tech/IT problem",
        "HR situation",
        "celebration",
        "crisis",
        "romantic situation",
        "mysterious occurrence",
        "family dynamics",
    ],
    MINOR_EVENT_TONES: ["serious", "humorous", "dramatic", "heartwarming", "spicy", "mysterious", "urgent"],
    initializeMinorEvents: () => (
        gameState.story || (gameState.story = StoryEngine.getDefaultStoryState()),
        gameState.story.minorEvents ||
            (gameState.story.minorEvents = {
                queue: [],
                generating: !1,
                history: [],
                nextGenerationTime: Date.now() + 12e4,
                generationCooldown: 3e5,
                lastNotificationTime: 0,
            }),
        gameState.story.minorEvents
    ),
    checkMinorEvents() {
        if (!gameState.story?.settings?.storyEnabled || !isStoryEnabled()) return;
        if (gameState.story.activeSpineEvent) return;
        if (gameState.time?.paused) return;
        if (document.getElementById("storyEventModal") || document.getElementById("actTransitionCinematic")) return;
        const e = this.initializeMinorEvents(),
            t = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus).length;
        if (gameState.cash < 3e4 || t < 5) return;
        const n = gameState.time?.startTime || gameState.time?.currentTime || Date.now();
        if ((gameState.time?.currentTime || Date.now()) - n < 432e6 / (gameState.time?.gameSpeed || 1)) return;
        if (e.queue.length >= 3) return;
        if (Date.now() < e.nextGenerationTime) return;
        if (e.generating) return;
        const a = Math.min(0.4, 0.15 + 0.01 * t);
        Math.random() > a
            ? (e.nextGenerationTime = Date.now() + 6e4)
            : this.generateMinorEvent().catch((t) => {
                  console.error("[StoryEngine] Minor event generation failed:", t), (e.generating = !1);
              });
    },
    MODE_EXCLUSIVE_EVENTS: {
        sfw: [
            "team_building_exercise",
            "charity_drive",
            "mentorship_moment",
            "professional_development",
            "office_competition",
            "leadership_challenge",
            "industry_recognition",
            "community_outreach",
            "career_milestone",
        ],
        nsfw: [
            "after_hours_tension",
            "workplace_attraction",
            "secret_affair",
            "office_romance",
            "jealousy_drama",
            "forbidden_temptation",
            "power_dynamic",
            "romantic_confession",
            "intimate_encounter",
        ],
    },
    buildMinorEventContext() {
        const e = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus),
            t = this.initializeMinorEvents().history.slice(0, 5),
            n = "function" != typeof isSFWMode || isSFWMode(),
            a = this.isAdultContentEnabled(),
            o = [...e]
                .sort(() => Math.random() - 0.5)
                .slice(0, Math.min(4, e.length))
                .map((t) => {
                    const a = [];
                    (t.stats?.affection || 50) > 70 && a.push("very affectionate"),
                        (t.stats?.trust || 50) < 30 && a.push("distrustful"),
                        (t.stats?.productivity || 50) > 80 && a.push("high performer"),
                        (t.stats?.comfort || 50) < 30 && a.push("uncomfortable at work"),
                        t.career?.level >= 4 && a.push("senior employee"),
                        t.inRelationshipWithPlayer && a.push("in relationship with boss"),
                        !n && t.stats?.desire > 60 && a.push("attracted to boss");
                    let o = null;
                    if (t.familyRelations && Object.keys(t.familyRelations).length > 0) {
                        const n = [];
                        for (const [o, i] of Object.entries(t.familyRelations)) {
                            const t = e.find((e) => e.id === o);
                            t && (n.push({ name: t.name, relation: i }), a.push(`has ${i} (${t.name}) at company`));
                        }
                        n.length > 0 && (o = n);
                    }
                    return {
                        id: t.id,
                        name: t.name,
                        role: t.career?.title || "Employee",
                        personality: t.personality || "professional",
                        traits: a,
                        backstory: t.backstory ? t.backstory.substring(0, 150) : null,
                        familyAtWork: o,
                    };
                }),
            i = [],
            s = new Set();
        e.forEach((t) => {
            for (const [n, a] of Object.entries(t.familyRelations || {})) {
                const o = e.find((e) => e.id === n);
                if (o) {
                    const e = [t.id, o.id].sort().join("-");
                    if (!s.has(e)) {
                        s.add(e);
                        let n = null,
                            r = null,
                            l = a;
                        const c = t.age || 30,
                            d = o.age || 30;
                        ["mother", "father", "parent"].includes(a.toLowerCase())
                            ? ((n = o), (r = t), (l = "male" === o.gender ? "father" : "mother"))
                            : ["daughter", "son", "child"].includes(a.toLowerCase())
                              ? ((n = t), (r = o), (l = "male" === o.gender ? "son" : "daughter"))
                              : c > d + 15
                                ? ((n = t), (r = o))
                                : d > c + 15 && ((n = o), (r = t)),
                            i.push({
                                emp1: { id: t.id, name: t.name, age: c, role: t.career?.title || "Employee" },
                                emp2: { id: o.id, name: o.name, age: d, role: o.career?.title || "Employee" },
                                relationship: a,
                                parentChildContext:
                                    n && r
                                        ? {
                                              parent: {
                                                  name: n.name,
                                                  age: n.age || 30,
                                                  role: n.career?.title || "Employee",
                                              },
                                              child: {
                                                  name: r.name,
                                                  age: r.age || 30,
                                                  role: r.career?.title || "Employee",
                                              },
                                              roleReversal: (r.career?.level || 0) > (n.career?.level || 0),
                                              roleReversalNote:
                                                  (r.career?.level || 0) > (n.career?.level || 0)
                                                      ? `NOTE: ${r.name} (the ${"son" === l || "daughter" === l ? "child" : "younger one"}) outranks ${n.name} (the parent) at work!`
                                                      : null,
                                          }
                                        : null,
                            });
                    }
                }
            }
        });
        const r = gameState.story.moralScore || 50,
            l = this.getAlignmentInfo(r),
            c = {
                cash: gameState.cash,
                cashFormatted:
                    "function" == typeof formatCash
                        ? formatCash(gameState.cash)
                        : `$${gameState.cash.toLocaleString()}`,
                employeeCount: e.length,
                isStruggling: gameState.cash < 1e4,
                isThriving: gameState.cash > 5e5,
                bossAlignment: l.name,
                recentEventTypes: t.map((e) => e.category).filter(Boolean),
                hasFamilyMembers: i.length > 0,
            };
        let d,
            p = null;
        const m = gameState.story?.familyEventCooldown || 18e5,
            u = gameState.story?.lastFamilyEventTime || 0,
            g = gameState.story?.consecutiveFamilyEvents || 0,
            h = Date.now() - u < m,
            y = g >= 2,
            f = 2 * i.length,
            b = 0.08 * Math.min(1, f / e.length);
        if (i.length > 0 && !h && !y && Math.random() < b) d = "family dynamics";
        else if (Math.random() < 0.3) {
            const e = n ? this.MODE_EXCLUSIVE_EVENTS.sfw : this.MODE_EXCLUSIVE_EVENTS.nsfw;
            (d = e[Math.floor(Math.random() * e.length)]), (p = n ? "sfw" : "nsfw");
        } else d = this.MINOR_EVENT_CATEGORIES[Math.floor(Math.random() * this.MINOR_EVENT_CATEGORIES.length)];
        return {
            employees: o,
            company: c,
            suggestedCategory: d,
            suggestedTone: this.MINOR_EVENT_TONES[Math.floor(Math.random() * this.MINOR_EVENT_TONES.length)],
            allowSpicy: a,
            recentEvents: t.map((e) => e.title).slice(0, 3),
            familyPairs: i,
            hasFamilyAtCompany: i.length > 0,
            contentMode: n ? "sfw" : "nsfw",
            modeExclusive: p,
            modeGuidelines: n
                ? "Keep all content workplace-appropriate. Focus on professional growth, teamwork, and career themes."
                : "Can include romantic tension, attraction, and mature workplace dynamics. Relationships between consenting adults.",
        };
    },
    async generateMinorEvent() {
        const e = this.initializeMinorEvents();
        if (e.generating || e.queue.length >= 3) return null;
        const t = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus).length;
        if (gameState.cash < 3e4 || t < 5) return null;
        e.generating = !0;
        try {
            const t = this.buildMinorEventContext();
            if (0 === t.employees.length) return (e.generating = !1), null;
            const n = t.modeExclusive
                    ? `⚠️ This is a MODE-EXCLUSIVE event type (${t.modeExclusive.toUpperCase()} only). Make it unique to this mode!`
                    : "",
                a = `You are creating a minor company event for an office management game. These are small, flavor events - not major plot points.\n\nCONTENT MODE: ${t.contentMode.toUpperCase()}\n${t.modeGuidelines}\n${n}\n\nCOMPANY STATE:\n- Cash: ${t.company.cashFormatted}\n- Employees: ${t.company.employeeCount}\n- Boss's reputation: ${t.company.bossAlignment}\n- Status: ${t.company.isStruggling ? "Struggling financially" : t.company.isThriving ? "Very successful" : "Stable"}\n${t.company.hasFamilyMembers ? "- Has family members working together" : ""}\n\nFEATURED EMPLOYEES (use 1-2 of these):\n${t.employees.map((e) => `- ${e.name} (${e.role}${e.traits.length > 0 ? ", " + e.traits.join(", ") : ""})`).join("\n")}\n${
                        t.hasFamilyAtCompany
                            ? `\n👨‍👩‍👧 FAMILY MEMBERS WORKING TOGETHER:\n${t.familyPairs
                                  .map((e) => {
                                      let t = `- ${e.emp1.name} is ${e.relationship} of ${e.emp2.name}`;
                                      if (e.parentChildContext) {
                                          const n = e.parentChildContext;
                                          (t = `- PARENT: ${n.parent.name} (age ${n.parent.age}, ${n.parent.role}) | CHILD: ${n.child.name} (age ${n.child.age}, ${n.child.role})`),
                                              n.roleReversalNote && (t += `\n  ⚠️ ${n.roleReversalNote}`);
                                      }
                                      return t;
                                  })
                                  .join(
                                      "\n"
                                  )}\n${"family dynamics" === t.suggestedCategory ? "⚠️ CREATE AN EVENT FEATURING THIS FAMILY DYNAMIC!\nCRITICAL: Respect the parent/child roles listed above. The PARENT is the older one. The CHILD is the younger one.\nIf the child outranks the parent at work, that's an interesting dynamic to explore!\nIdeas: sibling rivalry at work, parent giving child career advice, family member covering for another, awkward family moment at the office, navigating when your kid is your boss, etc." : ""}`
                            : ""
                    }\n\nAVOID REPEATING THESE RECENT EVENTS: ${t.recentEvents.length > 0 ? t.recentEvents.join(", ") : "None yet"}\n\nCREATE A MINOR EVENT:\n- Category hint: ${t.suggestedCategory}\n- Tone hint: ${t.suggestedTone}\n${t.allowSpicy ? "- Can include romantic tension, attraction, flirty elements" : "- Keep it workplace appropriate, no romantic content"}\n- Keep it brief and punchy\n- 2-3 choices with different costs/outcomes\n\nRESPOND IN EXACT JSON:\n{\n  "title": "Short catchy title with emoji (max 40 chars)",\n  "description": "1-2 vivid sentences. Reference specific employees by name.",\n  "category": "one of: incident, interpersonal, business, personal, tech, celebration, crisis, romantic, mystery, family",\n  "tone": "one of: serious, humorous, dramatic, heartwarming, spicy, mysterious, urgent",\n  "involvedEmployeeNames": ["name1"],\n  "modeExclusive": ${t.modeExclusive ? `"${t.modeExclusive}"` : "null"},\n  "choices": [\n    {"id": "a", "text": "Option text", "costPercent": 0, "alignment": "neutral"},\n    {"id": "b", "text": "Second option", "costPercent": 0.02, "alignment": "light"},\n    {"id": "c", "text": "Third option", "costPercent": 0, "alignment": "dark"}\n  ]\n}\n\ncostPercent: 0 to 0.1 (0=free, 0.01=1% of cash). alignment: light/dark/neutral/ambitious/cautious.`,
                o = await ("function" == typeof queuedGenerateText ? queuedGenerateText(a) : Promise.resolve(null));
            if (!o) return (e.generating = !1), null;
            let i;
            try {
                let e = o;
                const t = o.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (t) e = t[1].trim();
                else {
                    const t = o.match(/\{[\s\S]*\}/);
                    t && (e = t[0]);
                }
                i = JSON.parse(e);
            } catch (t) {
                return (
                    console.error("[StoryEngine] Failed to parse minor event AI response:", t),
                    (e.generating = !1),
                    null
                );
            }
            const s = gameState.cash;
            i.choices = (i.choices || []).map((e, t) => ({
                ...e,
                cost: Math.floor(s * (e.costPercent || 0)),
                consequence: e.consequence || "The situation resolves.",
                gameplayEffect: this.generateMinorEffectFromChoice(e, i),
            }));
            const r = (i.involvedEmployeeNames || [])
                    .map((e) => {
                        const t = gameState.employees.find((t) => t.name.toLowerCase() === e.toLowerCase());
                        return t?.id;
                    })
                    .filter(Boolean),
                l = {
                    id: `minor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    eventKey: `minor_${i.category}`,
                    title: i.title || "📋 Office Matter",
                    cinematicText: i.description,
                    category: i.category,
                    tone: i.tone,
                    involvedEmployeeIds: r,
                    choices: i.choices,
                    actNumber: gameState.story.currentAct,
                    type: "minor",
                    timestamp: Date.now(),
                    resolved: !1,
                };
            return (
                e.queue.push(l),
                (e.generating = !1),
                (e.nextGenerationTime = Date.now() + e.generationCooldown),
                this.showMinorEventNotification(l),
                console.log("[StoryEngine] Minor event generated:", l.title),
                l
            );
        } catch (t) {
            return console.error("[StoryEngine] Minor event generation failed:", t), (e.generating = !1), null;
        }
    },
    generateMinorEffectFromChoice(e, t) {
        const n = e.alignment || "neutral";
        t.category;
        return e.costPercent > 0
            ? {
                  type: "spend_cash",
                  amount: Math.floor(gameState.cash * e.costPercent),
                  boostMorale: "light" === n || "ambitious" === n,
              }
            : {
                  light: { type: "boost_all_trust", amount: 3 },
                  dark: { type: "decrease_all_trust", amount: 2 },
                  ambitious: { type: "boost_all_productivity", amount: 2 },
                  cautious: { type: "boost_all_trust", amount: 1 },
                  neutral: null,
              }[n] || null;
    },
    showMinorEventNotification(e) {
        let t = document.getElementById("minorEventNotification");
        if (
            (t && t.remove(),
            (t = document.createElement("div")),
            (t.id = "minorEventNotification"),
            (t.style.cssText =
                "\n        position: fixed;\n        bottom: 100px;\n        right: 20px;\n        max-width: 320px;\n        background: linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%);\n        border: 2px solid var(--l-indigo);\n        border-radius: 12px;\n        padding: 15px;\n        z-index: 10000;\n        animation: slideInRight 0.3s ease-out;\n        box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);\n        cursor: pointer;\n      "),
            (t.innerHTML = `\n        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">\n          <span style="font-size:1.5rem;">📋</span>\n          <div>\n            <div style="color:var(--l-indigo); font-weight:bold; font-size:0.85rem;">MINOR EVENT</div>\n            <div style="color:var(--l-ink); font-size:1rem;">${e.title}</div>\n          </div>\n        </div>\n        <div style="color:var(--l-ink-cool); font-size:0.85rem; margin-bottom:12px;">${e.cinematicText.substring(0, 80)}...</div>\n        <div style="display:flex; gap:10px;">\n          <button onclick="StoryEngine.showMinorEventModal()" style="\n            flex:1; padding:8px 12px; background:var(--l-indigo); border:none; border-radius:6px;\n            color:var(--l-ink-on-fill); font-size:0.85rem; cursor:pointer;\n          ">View</button>\n          <button onclick="document.getElementById('minorEventNotification').remove()" style="\n            padding:8px 12px; background:transparent; border:1px solid var(--border); border-radius:6px;\n            color:var(--text-mute); font-size:0.85rem; cursor:pointer;\n          ">Later</button>\n        </div>\n      `),
            (t.onclick = (e) => {
                "BUTTON" !== e.target.tagName && this.showMinorEventModal();
            }),
            document.body.appendChild(t),
            setTimeout(() => {
                document.getElementById("minorEventNotification") &&
                    ((t.style.animation = "slideInRight 0.3s ease-out reverse"), setTimeout(() => t.remove(), 300));
            }, 15e3),
            !document.getElementById("minorEventStyles"))
        ) {
            const e = document.createElement("style");
            (e.id = "minorEventStyles"),
                (e.textContent =
                    "\n          @keyframes slideInRight {\n            from { transform: translateX(100%); opacity: 0; }\n            to { transform: translateX(0); opacity: 1; }\n          }\n        "),
                document.head.appendChild(e);
        }
    },
    showMinorEventModal() {
        const e = this.initializeMinorEvents().queue[0];
        if (!e) return;
        const t = document.getElementById("minorEventNotification");
        t && t.remove(), (gameState.story.activeSpineEvent = e), this.showStoryEventModal(e);
    },
    resolveMinorEventChoice(e, t) {
        const n = this.initializeMinorEvents(),
            a = n.queue.findIndex((t) => t.id === e);
        if (-1 === a) return;
        const o = n.queue[a],
            i = o.choices.find((e) => e.id === t);
        if (!i) return;
        if (i.cost > 0 && gameState.cash < i.cost)
            return void ("function" == typeof showNotification && showNotification("❌ Not enough cash!", "error"));
        i.cost > 0 && (gameState.cash -= i.cost),
            i.gameplayEffect && this.executeGameplayEffect(i.gameplayEffect),
            i.alignment && this.applyAlignmentEffect(i.alignment),
            this.trackAction(`minor_event_${o.category}`, {
                eventTitle: o.title,
                choiceId: i.id,
                alignment: i.alignment,
            }),
            "family" === o.category || "family dynamics" === o.category
                ? ((gameState.story.lastFamilyEventTime = Date.now()),
                  (gameState.story.consecutiveFamilyEvents = (gameState.story.consecutiveFamilyEvents || 0) + 1))
                : (gameState.story.consecutiveFamilyEvents = 0),
            (o.resolved = !0),
            (o.chosenOption = t),
            (o.outcomeText = i.consequence),
            n.history.unshift(o),
            n.queue.splice(a, 1),
            n.history.length > 30 && n.history.pop(),
            (gameState.story.activeSpineEvent = null);
        const s = document.getElementById("storyEventModal");
        s && s.remove(),
            this.addJournalEntry({
                title: o.title,
                content: `${o.cinematicText}\n\nYou chose: "${i.text}"\n\n${i.consequence}`,
                type: "minor",
                memorable: !1,
            }),
            "function" == typeof saveGame && saveGame(!1);
    },
    getMinorEventCount() {
        return this.initializeMinorEvents().queue.length;
    },
    openMinorEventsPanel() {
        0 !== this.initializeMinorEvents().queue.length
            ? this.showMinorEventModal()
            : "function" == typeof showNotification && showNotification("No pending events right now!", "info");
    },
    showMultiStepEventSelector() {
        const e = this.getAvailableMultiStepEvents();
        if (0 === e.length)
            return void showNotification("📜 No extended events available yet. Build your company!", "info");
        const t = document.getElementById("multiStepSelectorModal");
        t && t.remove();
        const n = document.createElement("div");
        (n.id = "multiStepSelectorModal"),
            (n.style.cssText =
                "\n        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n        background: var(--l-veil-90); z-index: 100001;\n        display: flex; justify-content: center; align-items: center;\n        animation: storyFadeIn 0.5s ease-out;\n        padding: 20px; box-sizing: border-box;\n      ");
        const a = e
            .map((e) => {
                const t = this.MULTI_STEP_EVENTS[e];
                return `\n          <button onclick="document.getElementById('multiStepSelectorModal').remove(); StoryEngine.startMultiStepEvent('${e}');"\n                  style="\n                    width: 100%; padding: 20px; margin: 10px 0;\n                    background: linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%);\n                    border: 2px solid ${t.themeColor || "var(--l-indigo)"};\n                    border-radius: 15px; cursor: pointer; text-align: left;\n                    transition: all 0.3s ease;\n                  "\n                  onmouseenter="this.style.transform='translateX(10px)'; this.style.borderColor='${t.themeColor || "var(--l-indigo)"}'"\n                  onmouseleave="this.style.transform='translateX(0)'">\n            <div style="display: flex; align-items: center; gap: 15px;">\n              <div style="font-size: 2.5rem;">${t.title.match(/^[^\s]+/)[0] || "📖"}</div>\n              <div>\n                <div style="color: var(--l-ink); font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;">\n                  ${t.title.replace(/^[^\s]+\s*/, "")}\n                </div>\n                <div style="color: var(--text-dim); font-size: 0.9rem; margin-bottom: 5px;">${t.description}</div>\n                <div style="display: flex; gap: 10px; flex-wrap: wrap;">\n                  <span style="background: ${fuocAlpha(t.themeColor || "var(--l-indigo)", "44")}; color: ${t.themeColor || "var(--l-indigo)"}; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem;">\n                    ${t.totalSteps} Steps\n                  </span>\n                  <span style="background: #33333388; color: var(--text-dim); padding: 3px 10px; border-radius: 12px; font-size: 0.75rem;">\n                    ${t.theme?.replace(/_/g, " ") || "Story"}\n                  </span>\n                </div>\n              </div>\n            </div>\n          </button>\n        `;
            })
            .join("");
        (n.innerHTML = `\n        <div style="\n          background: linear-gradient(180deg, var(--l-bg) 0%, var(--l-panel-alt) 50%, var(--l-bg) 100%);\n          border-radius: 20px; max-width: 600px; width: 100%; max-height: 90vh;\n          overflow-y: auto; border: 2px solid var(--l-indigo);\n          box-shadow: 0 0 100px rgba(102,126,234,0.3);\n        ">\n          <div style="padding: 25px 30px; border-bottom: 1px solid var(--border);">\n            <div style="display: flex; justify-content: space-between; align-items: center;">\n              <div>\n                <h2 style="margin: 0; color: var(--l-ink); font-size: 1.5rem;">🎬 Extended Events</h2>\n                <p style="margin: 8px 0 0; color: var(--text-dim); font-size: 0.9rem;">Multi-step scenarios that unfold across multiple scenes</p>\n              </div>\n              <button onclick="document.getElementById('multiStepSelectorModal').remove()"\n                      style="background: none; border: none; color: var(--text-mute); font-size: 1.5rem; cursor: pointer;">✕</button>\n            </div>\n          </div>\n          <div style="padding: 20px 30px 30px;">\n            ${a}\n          </div>\n        </div>\n      `),
            document.body.appendChild(n);
    },
    checkFactionEvent() {
        if (!isStoryEnabled() || !gameState.story?.factions) return null;
        const F = gameState.story.factions,
            total = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus).length;
        if (total < 5) return null;
        const e = {};
        for (const k of Object.keys(F)) e[k] = Math.round(((F[k].strength || 0) / total) * 100);
        const t = gameState.story.narrativeFlags || (gameState.story.narrativeFlags = {});
        if (Object.values(e).reduce((s, x) => s + x, 0) < 50) return null;
        const n = Object.entries(e).reduce((p, q) => (p[1] > q[1] ? p : q)),
            a = n[0],
            o = n[1],
            i = {
                loyalists: {
                    threshold: 60,
                    eventKey: "loyalist_celebration",
                    flag: "loyalistEventTriggered",
                    title: "👑 The Loyalists Gather",
                    description: "Your most devoted employees want to honor your leadership...",
                },
                opportunists: {
                    threshold: 60,
                    eventKey: "opportunist_scheme",
                    flag: "opportunistEventTriggered",
                    title: "💰 A Profitable Proposal",
                    description: "The opportunists have identified a very lucrative, morally grey opportunity...",
                },
                reformers: {
                    threshold: 60,
                    eventKey: "reformer_petition",
                    flag: "reformerEventTriggered",
                    title: "⚖️ The Reform Movement",
                    description: "The reformers present a petition for workplace changes...",
                },
                underground: {
                    threshold: 40,
                    eventKey: "underground_contact",
                    flag: "undergroundEventTriggered",
                    title: "🌑 Shadows in the Office",
                    description: "The underground faction makes contact with an unusual proposal...",
                },
            }[a];
        return i && o >= i.threshold && !t[i.flag]
            ? ((i.faction = a), (i.figurehead = F[a]?.figureheadName || null), this.triggerFactionEvent(i), i)
            : null;
    },
    triggerFactionEvent(e) {
        const body = e.figurehead ? `${e.figurehead} steps forward, speaking for the group.\n\n${e.description}` : e.description;
        (gameState.story.narrativeFlags[e.flag] = !0),
            this.addJournalEntry({ title: e.title, content: body, type: "faction", memorable: !0 });
        const t = {
            id: `faction_${e.eventKey}_${Date.now()}`,
            title: e.title,
            cinematicText: body,
            choices: this.generateFactionChoices(e.eventKey),
            imagePrompt: `corporate office scene, ${e.eventKey.replace(/_/g, " ")}, dramatic lighting, professional atmosphere`,
            allowAI: !0,
        };
        gameState.story.pendingEvents.push(t), this.showStoryNotification();
    },
    generateFactionChoices: (e) =>
        ({
            loyalist_celebration: [
                {
                    id: "embrace",
                    text: "👑 Embrace their loyalty fully",
                    alignment: "charismatic",
                    consequence: "Your inner circle grows stronger, but others feel excluded.",
                    gameplayEffect: { type: "faction_standing", faction: "loyalists", trust: 8, affection: 6 },
                },
                {
                    id: "modest",
                    text: "🤝 Accept graciously but stay grounded",
                    alignment: "diplomatic",
                    consequence: "You maintain balance while acknowledging their devotion.",
                    gameplayEffect: { type: "boost_all_affection", amount: 3 },
                },
                {
                    id: "redirect",
                    text: "📈 Redirect their energy toward work goals",
                    alignment: "pragmatic",
                    consequence: "Their loyalty becomes productive ambition.",
                    gameplayEffect: { type: "boost_all_productivity", amount: 4 },
                },
            ],
            opportunist_scheme: [
                {
                    id: "join",
                    text: "💰 Join the scheme - money talks",
                    alignment: "ruthless",
                    consequence: "Profit comes, but at what cost to your integrity?",
                    gameplayEffect: { type: "boost_all_productivity", amount: 5 },
                },
                {
                    id: "modify",
                    text: "⚖️ Modify it to be more ethical",
                    alignment: "diplomatic",
                    consequence: "You find middle ground, satisfying some but not all.",
                    gameplayEffect: { type: "boost_all_comfort", amount: 3 },
                },
                {
                    id: "reject",
                    text: "🚫 Reject it firmly",
                    alignment: "ethical",
                    consequence: "The opportunists lose faith in you, but your conscience is clear.",
                    gameplayEffect: { type: "faction_standing", faction: "opportunists", trust: -6 },
                },
            ],
            reformer_petition: [
                {
                    id: "implement",
                    text: "✅ Implement their suggestions",
                    alignment: "ethical",
                    consequence: "Workplace improves, but some see you as weak to pressure.",
                    gameplayEffect: { type: "boost_all_comfort", amount: 6 },
                },
                {
                    id: "compromise",
                    text: "🤝 Negotiate a compromise",
                    alignment: "diplomatic",
                    consequence: "Some changes happen, keeping both sides partially satisfied.",
                    gameplayEffect: { type: "boost_all_comfort", amount: 3 },
                },
                {
                    id: "dismiss",
                    text: "❌ Dismiss their concerns",
                    alignment: "ruthless",
                    consequence: "You maintain control, but resentment builds.",
                    gameplayEffect: { type: "faction_standing", faction: "reformers", trust: -6, affection: -4 },
                },
            ],
            underground_contact: [
                {
                    id: "engage",
                    text: "🌑 Hear them out in secret",
                    alignment: "cunning",
                    consequence: "You learn of hidden opportunities... and dangers.",
                    gameplayEffect: { type: "faction_standing", faction: "underground", trust: 6 },
                },
                {
                    id: "expose",
                    text: "☀️ Expose their activities",
                    alignment: "ethical",
                    consequence: "Trust is restored, but you've made enemies.",
                    gameplayEffect: { type: "boost_all_trust", amount: 4 },
                },
                {
                    id: "ignore",
                    text: "🙈 Pretend you saw nothing",
                    alignment: "passive",
                    consequence: "The underground grows stronger in the shadows.",
                },
            ],
        })[e] || [
            {
                id: "default",
                text: "🤔 Consider carefully...",
                alignment: "neutral",
                consequence: "You take time to think.",
            },
        ],
    generateCharacterArc(e) {
        if (!e || e.characterArc) return null;
        const t = [
                {
                    type: "hidden_talent",
                    secrets: [
                        "Was once a professional musician",
                        "Has a published novel under a pen name",
                        "Holds patents from a previous career",
                    ],
                    discovery: "high_trust",
                    storyPotential: "Their hidden skills could save the company in a crisis.",
                },
                {
                    type: "dark_past",
                    secrets: [
                        "Fled a scandal at their old company",
                        "Changed their name years ago",
                        "Has powerful enemies",
                    ],
                    discovery: "investigation",
                    storyPotential: "Their past may catch up with them—and you.",
                },
                {
                    type: "secret_connection",
                    secrets: [
                        "Related to a major competitor's CEO",
                        "Former roommate of a famous tech figure",
                        "Has ties to Victoria Steele's family",
                    ],
                    discovery: "random_event",
                    storyPotential: "Their connections could open doors—or bring danger.",
                },
                {
                    type: "hidden_agenda",
                    secrets: [
                        "Planted by a rival company",
                        "Working toward their own startup",
                        "Secretly documenting workplace issues",
                    ],
                    discovery: "low_trust",
                    storyPotential: "Their true motives will eventually be revealed.",
                },
                {
                    type: "personal_struggle",
                    secrets: [
                        "Caring for a sick family member",
                        "Dealing with a major financial burden",
                        "Fighting a personal battle",
                    ],
                    discovery: "high_affection",
                    storyPotential: "Supporting them could earn lifelong loyalty.",
                },
            ],
            n = t[Math.floor(Math.random() * t.length)],
            a = n.secrets[Math.floor(Math.random() * n.secrets.length)];
        return (
            (e.characterArc = {
                type: n.type,
                secret: a,
                discoveryMethod: n.discovery,
                storyPotential: n.storyPotential,
                discovered: !1,
                discoveredAt: null,
                arcProgress: 0,
            }),
            e.characterArc
        );
    },
    checkCharacterArcDiscovery(e) {
        if (!e.characterArc || e.characterArc.discovered) return !1;
        const t = e.characterArc,
            n = e.stats?.trust || 50,
            a = e.stats?.affection || 50;
        let o = !1;
        switch (t.discoveryMethod) {
            case "high_trust":
                o = n >= 85;
                break;
            case "high_affection":
                o = a >= 85;
                break;
            case "low_trust":
                o = n <= 20;
                break;
            case "investigation":
                o = Math.random() < 0.1 && gameState.story.currentAct >= 3;
                break;
            case "random_event":
                o = Math.random() < 0.05;
        }
        return (
            !!o &&
            ((t.discovered = !0),
            (t.discoveredAt = Date.now()),
            this.addJournalEntry({
                title: `🔍 Secret Revealed: ${e.name}`,
                content: `You've discovered something about ${e.name}: ${t.secret}. ${t.storyPotential}`,
                type: "character_arc",
                memorable: !0,
                employeeId: e.id,
            }),
            this.queueCharacterArcEvent(e),
            !0)
        );
    },
    queueCharacterArcEvent(e) {
        const t = {
            id: `character_arc_${e.id}_${Date.now()}`,
            title: `📖 ${e.name}'s Story`,
            cinematicText: `The truth about ${e.name} has come to light: ${e.characterArc.secret}\n\n${e.characterArc.storyPotential}\n\nThis knowledge gives you power over their fate. What will you do with it?`,
            choices: [
                {
                    id: "support",
                    text: "🤝 Support them through this",
                    alignment: "kind",
                    consequence: "Your support earns deep loyalty.",
                },
                {
                    id: "leverage",
                    text: "💼 Use this knowledge strategically",
                    alignment: "cunning",
                    consequence: "You gain an advantage, but trust may suffer.",
                },
                {
                    id: "ignore",
                    text: "🤐 Keep it to yourself, change nothing",
                    alignment: "neutral",
                    consequence: "Life continues as before, for now.",
                },
            ],
            imagePrompt:
                "portrait of a professional employee with a mysterious expression, dramatic lighting, corporate setting, emotional moment",
            allowAI: !0,
        };
        gameState.story.pendingEvents.push(t), this.showStoryNotification();
    },
    getTimelineEchoes() {
        const e = gameState.story.persistentMemories || [];
        if (0 === e.length) return [];
        const t = [],
            n = gameState.story.currentAct,
            a = gameState.story.moralScore;
        return (
            e.forEach((e, o) => {
                const i = e.timeline || o + 1;
                if (e.moralScore && Math.abs(e.moralScore - a) > 40) {
                    const n = e.moralScore > 50 ? "virtuous" : "ruthless";
                    n !== (a > 50 ? "virtuous" : "ruthless") &&
                        t.push({
                            type: "path_contrast",
                            timeline: i,
                            message: `In Timeline ${i}, you walked a ${n} path. Now, you've chosen differently. The echoes of who you were remind you of who you could have been...`,
                            effect: { insight: !0 },
                        });
                }
                if (e.keyEvents && e.keyEvents.length > 0) {
                    const a = e.keyEvents.find((e) => "spine" === e.type && e.title && n >= 2);
                    a &&
                        Math.random() < 0.3 &&
                        t.push({
                            type: "memory_flash",
                            timeline: i,
                            message: `A strange déjà vu washes over you. In another time, another version of you faced "${a.title}". The outcome was different then...`,
                            effect: { moralBonus: 5 },
                        });
                }
                e.ending &&
                    n >= 4 &&
                    t.push({
                        type: "ending_whisper",
                        timeline: i,
                        message: `Whispers of Timeline ${i} echo in your mind. There, you became known as "${e.ending}". Will this timeline end the same way?`,
                        effect: { foreshadowing: !0 },
                    });
            }),
            t.slice(0, 3)
        );
    },
    applyTimelineEchoEffects(e) {
        e &&
            e.effect &&
            (e.effect.moralBonus && (gameState.story.moralScore += e.effect.moralBonus),
            e.effect.insight && (gameState.story.narrativeFlags.timelineInsight = !0),
            e.effect.foreshadowing && (gameState.story.narrativeFlags.endingForeshadowed = !0));
    },
};
(window.startMultiStepEvent = function (e, t = !1) {
    if (!StoryEngine || !StoryEngine.MULTI_STEP_EVENTS) return void console.error("StoryEngine not loaded");
    if (gameState.story.activeMultiStepEvent && !t)
        return void console.warn("A multi-step event is already active. Use force=true to override.");
    t && (gameState.story.activeMultiStepEvent = null);
    const n = Object.keys(StoryEngine.MULTI_STEP_EVENTS);
    if (!e)
        return (
            console.log("Available multi-step events:"),
            void n.forEach((e) => {
                const t = StoryEngine.MULTI_STEP_EVENTS[e],
                    n = StoryEngine.canStartMultiStepEvent(e);
                console.log(`  ${n ? "✅" : "❌"} ${e}: "${t.title}" (${t.totalSteps} steps)`);
            })
        );
    n.includes(e)
        ? (StoryEngine.startMultiStepEvent(e), console.log(`Started multi-step event: ${e}`))
        : console.error(`Unknown event: ${e}. Use startMultiStepEvent() with no args to see available events.`);
}),
    (window.showMultiStepEvents = function () {
        StoryEngine.showMultiStepEventSelector();
    }),
    (window.getMultiStepStatus = function () {
        const e = gameState.story.activeMultiStepEvent,
            t = gameState.story.completedMultiStepEvents || [],
            n = StoryEngine.getAvailableMultiStepEvents();
        return (
            console.log("=== Multi-Step Event Status ==="),
            e
                ? (console.log(`🎬 ACTIVE: ${e.title}`),
                  console.log(`   Step: ${e.currentStep}/${e.totalSteps}`),
                  console.log(`   Score: ${e.cumulativeScore}`))
                : console.log("🎬 No active multi-step event"),
            console.log(`\n✅ Completed (${t.length}):`),
            t.forEach((e) => {
                console.log(`   ${e.title} - Score: ${e.finalScore} (${e.finalOutcome})`);
            }),
            console.log(`\n📋 Available (${n.length}):`),
            n.forEach((e) => {
                const t = StoryEngine.MULTI_STEP_EVENTS[e];
                console.log(`   ${t.title} (${t.totalSteps} steps)`);
            }),
            { active: e, completed: t, available: n }
        );
    });
const StoryMinigames = {
    activeGame: null,
    gameResult: null,
    GAME_TYPES: {
        precision: {
            name: "Precision Timing",
            icon: "🎯",
            description: "Stop the marker in the green zone!",
            themes: ["negotiation", "delicate_moment", "risky_move", "seduction"],
            mobileHint: "Tap when the marker is in the green zone",
        },
        intensity: {
            name: "Intensity",
            icon: "⚡",
            description: "Tap rapidly to build intensity!",
            themes: ["persuasion", "passion", "effort", "urgency", "desire"],
            mobileHint: "Tap as fast as you can!",
        },
        recall: {
            name: "Read the Room",
            icon: "🧠",
            description: "Remember and repeat the pattern!",
            themes: ["social_reading", "memory", "observation", "understanding"],
            mobileHint: "Watch the pattern, then tap to repeat",
        },
        reflex: {
            name: "Quick Reflexes",
            icon: "👆",
            description: "Catch the targets before they disappear!",
            themes: ["opportunity", "timing", "catching_signals", "reading_cues"],
            mobileHint: "Tap targets as they appear",
        },
        composure: {
            name: "Keep Composure",
            icon: "⚖️",
            description: "Keep your composure balanced!",
            themes: ["self_control", "hiding_feelings", "poker_face", "professionalism"],
            mobileHint: "Tap left/right to stay balanced",
        },
        tension: {
            name: "Hold the Tension",
            icon: "💫",
            description: "Hold... hold... and release at the right moment!",
            themes: ["anticipation", "buildup", "dramatic_pause", "power_play"],
            mobileHint: "Hold down, release in the sweet spot",
        },
    },
    launchMinigame(e, t, n) {
        const a = this.GAME_TYPES[e];
        if (!a) return console.error("[StoryMinigames] Unknown game type:", e), void n({ success: !0, score: 100 });
        (this.activeGame = { type: e, config: { ...t, ...a }, onComplete: n, startTime: Date.now(), score: 0 }),
            this.createGameOverlay(e, t);
    },
    createGameOverlay(e, t) {
        const n = document.getElementById("minigameOverlay");
        n && n.remove();
        const a = document.createElement("div");
        (a.id = "minigameOverlay"),
            (a.style.cssText =
                "\n        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n        background: var(--l-veil-98); z-index: 100002;\n        display: flex; flex-direction: column; justify-content: center; align-items: center;\n        padding: 20px; box-sizing: border-box;\n        animation: storyFadeIn 0.4s ease-out;\n        touch-action: manipulation;\n        user-select: none;\n        -webkit-user-select: none;\n      ");
        const o = this.GAME_TYPES[e],
            i = t.themeText || o.description;
        (a.innerHTML = `\n        <div id="minigameContainer" style="\n          width: 100%; max-width: 500px; \n          text-align: center;\n        ">\n          \x3c!-- Header --\x3e\n          <div style="margin-bottom: 20px;">\n            <div style="font-size: 3rem; margin-bottom: 10px;">${o.icon}</div>\n            <h2 style="color: var(--l-ink); margin: 0 0 8px 0; font-size: 1.5rem;">${t.title || o.name}</h2>\n            <p style="color: var(--l-ink-cool); margin: 0; font-size: 0.95rem;">${i}</p>\n          </div>\n          \n          \x3c!-- Game Area --\x3e\n          <div id="minigameArea" style="\n            background: linear-gradient(135deg, var(--l-line) 0%, var(--l-panel-2) 100%);\n            border: 2px solid var(--l-indigo);\n            border-radius: 16px;\n            padding: 30px 20px;\n            margin-bottom: 20px;\n            min-height: 200px;\n            display: flex;\n            flex-direction: column;\n            justify-content: center;\n            align-items: center;\n          ">\n            \x3c!-- Game content injected here --\x3e\n          </div>\n          \n          \x3c!-- Mobile hint --\x3e\n          <p style="color: var(--l-indigo); font-size: 0.85rem; margin: 0;">\n            📱 ${o.mobileHint}\n          </p>\n          \n          \x3c!-- Skip option (always available) --\x3e\n          <button id="skipMinigame" style="\n            margin-top: 20px; padding: 10px 20px;\n            background: transparent; border: 1px solid var(--border);\n            border-radius: 8px; color: var(--text-mute); cursor: pointer;\n            font-size: 0.85rem;\n            transition: all 0.2s;\n          ">Skip (auto-resolve)</button>\n        </div>\n      `),
            document.body.appendChild(a),
            (document.getElementById("skipMinigame").onclick = () => this.skipGame()),
            setTimeout(() => this.startGame(e, t), 300);
    },
    startGame(e, t) {
        const n = document.getElementById("minigameArea");
        if (n)
            switch (e) {
                case "precision":
                    this.startPrecisionGame(n, t);
                    break;
                case "intensity":
                    this.startIntensityGame(n, t);
                    break;
                case "recall":
                    this.startRecallGame(n, t);
                    break;
                case "reflex":
                    this.startReflexGame(n, t);
                    break;
                case "composure":
                    this.startComposureGame(n, t);
                    break;
                case "tension":
                    this.startTensionGame(n, t);
            }
    },
    startPrecisionGame(e, t) {
        const n = {
            easy: { totalRounds: 3, allowedMisses: 2, speeds: [2800, 2500, 2200], zones: [40, 35, 30] },
            medium: { totalRounds: 4, allowedMisses: 2, speeds: [2200, 1900, 1600, 1400], zones: [30, 25, 22, 18] },
            hard: {
                totalRounds: 5,
                allowedMisses: 1,
                speeds: [1800, 1500, 1300, 1100, 900],
                zones: [25, 20, 16, 14, 12],
            },
        }[t.difficulty || "medium"];
        let a = 1,
            o = 0,
            i = 0,
            s = 0,
            r = 1,
            l = !0,
            c = !0,
            d = !0;
        const p = () => n.zones[Math.min(a - 1, n.zones.length - 1)],
            m = () => {
                const t = p(),
                    s = 50 - t / 2,
                    r = Array(n.totalRounds)
                        .fill("○")
                        .map((e, t) =>
                            t < o
                                ? '<span style="color:var(--positive);">●</span>'
                                : t < o + i
                                  ? '<span style="color:var(--l-magenta);">✕</span>'
                                  : '<span style="color:var(--l-on-accent);">○</span>'
                        )
                        .join(" ");
                if (
                    ((e.innerHTML = `\n          ${d ? '\n            <div id="precisionInstructions" style="\n              position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\n              background: var(--l-veil-95); border: 2px solid var(--l-indigo); border-radius: 16px;\n              padding: 25px; max-width: 320px; text-align: center; z-index: 10;\n            ">\n              <div style="font-size: 2.5rem; margin-bottom: 10px;">🎯</div>\n              <div style="color: var(--l-ink); font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">Precision Timing</div>\n              <div style="color: var(--l-ink-cool); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;">\n                A marker moves back and forth across the bar.<br><br>\n                <span style="color: var(--positive);">Tap when it\'s in the GREEN zone!</span><br><br>\n                The zone gets smaller each round.\n              </div>\n              <button id="startPrecisionBtn" style="\n                padding: 12px 30px; background: linear-gradient(135deg, var(--l-indigo), var(--l-indigo-deep));\n                border: none; border-radius: 8px; color: var(--l-ink-on-fill); font-size: 1rem;\n                font-weight: bold; cursor: pointer;\n              ">Got it!</button>\n            </div>\n          ' : ""}\n          \n          <div style="margin-bottom: 10px; ${d ? "opacity: 0.3;" : ""}">\n            <div style="font-size: 0.9rem; color: var(--l-ink-cool);">\n              Round <span style="color:var(--l-ink); font-weight:bold;">${a}</span> of ${n.totalRounds}\n              <span style="margin-left: 15px;">Misses left: <span style="color:${n.allowedMisses - i > 0 ? "var(--l-green)" : "var(--l-magenta)"}; font-weight:bold;">${n.allowedMisses - i}</span></span>\n            </div>\n          </div>\n          \n          \x3c!-- Progress indicator --\x3e\n          <div style="margin-bottom: 15px; font-size: 1.3rem; letter-spacing: 4px; ${d ? "opacity: 0.3;" : ""}">\n            ${r}\n          </div>\n          \n          <div style="width: 100%; margin-bottom: 25px; ${d ? "opacity: 0.3;" : ""}">\n            \x3c!-- The bar track --\x3e\n            <div style="\n              position: relative; \n              height: 60px; \n              background: linear-gradient(90deg, #f7258544 0%, #f7258544 ${s}%, \n                var(--l-green) ${s}%, var(--l-green) ${s + t}%, \n                #f7258544 ${s + t}%, #f7258544 100%);\n              border-radius: 30px;\n              overflow: hidden;\n              border: 3px solid var(--border);\n            ">\n              \x3c!-- Zone size label --\x3e\n              <div style="\n                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\n                color: var(--l-sheen-50); font-size: 0.8rem; font-weight: bold;\n              ">${t}%</div>\n              \n              \x3c!-- Moving marker --\x3e\n              <div id="precisionMarker" style="\n                position: absolute;\n                left: 0%;\n                top: 8px;\n                width: 10px;\n                height: 44px;\n                background: linear-gradient(180deg, var(--l-ink) 0%, var(--l-gold) 100%);\n                border-radius: 5px;\n                box-shadow: 0 0 20px rgba(255,215,0,0.9);\n                transition: none;\n              "></div>\n            </div>\n            \n            \x3c!-- Zone indicators --\x3e\n            <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.75rem; color: var(--text-mute);">\n              <span>❌ Too early</span>\n              <span style="color: var(--positive);">✓ Perfect zone</span>\n              <span>Too late ❌</span>\n            </div>\n          </div>\n          \n          \x3c!-- Big tap button --\x3e\n          <button id="precisionTapBtn" style="\n            width: 140px; height: 140px;\n            border-radius: 50%;\n            background: ${c ? "linear-gradient(145deg, var(--l-indigo) 0%, var(--l-indigo-deep) 100%)" : "var(--l-neutral-3)"};\n            border: 4px solid var(--l-ink);\n            color: var(--l-ink);\n            font-size: 1.3rem;\n            font-weight: bold;\n            cursor: ${c ? "pointer" : "default"};\n            box-shadow: 0 0 30px rgba(102,126,234,0.5);\n            transition: transform 0.1s, box-shadow 0.1s;\n            touch-action: manipulation;\n            ${d ? "opacity: 0.3;" : ""}\n          ">\n            ${c ? "TAP!" : "WAIT..."}\n          </button>\n        `),
                    d &&
                        (document.getElementById("startPrecisionBtn").onclick = () => {
                            (d = !1), m(), u();
                        }),
                    !d && c)
                ) {
                    const e = document.getElementById("precisionTapBtn");
                    (e.onclick = g),
                        (e.ontouchstart = (e) => {
                            e.preventDefault(), g();
                        });
                }
            },
            u = () => {
                (s = 0), (r = 1), (l = !0);
                const e = () => {
                    if (!l) return;
                    const t = n.speeds[Math.min(a - 1, n.speeds.length - 1)];
                    (s += r * (100 / (t / 16.67))), s >= 100 ? ((s = 100), (r = -1)) : s <= 0 && ((s = 0), (r = 1));
                    const o = document.getElementById("precisionMarker");
                    o && (o.style.left = `calc(${s}% - 5px)`), requestAnimationFrame(e);
                };
                e();
            },
            g = () => {
                if (!c || d) return;
                (l = !1), (c = !1);
                const e = document.getElementById("precisionTapBtn");
                e && (e.style.transform = "scale(0.9)");
                const t = p(),
                    r = 50 - t / 2;
                s >= r && s <= r + t
                    ? (o++,
                      e &&
                          ((e.textContent = "✓"),
                          (e.style.background = "linear-gradient(145deg, var(--l-green) 0%, var(--l-green-3) 100%)")))
                    : (i++,
                      e &&
                          ((e.textContent = "✗"),
                          (e.style.background = "linear-gradient(145deg, var(--l-magenta) 0%, var(--l-magenta-2) 100%)"))),
                    setTimeout(() => {
                        if (i > n.allowedMisses) {
                            const e = Math.round((o / n.totalRounds) * 50);
                            this.showGameResult("failure", e);
                        } else if (a >= n.totalRounds) {
                            const e = o / n.totalRounds;
                            let t, a;
                            1 === e
                                ? ((t = "perfect"), (a = 100))
                                : e >= 0.75
                                  ? ((t = "success"), (a = Math.round(70 + 25 * e)))
                                  : e >= 0.5
                                    ? ((t = "partial"), (a = Math.round(40 + 30 * e)))
                                    : ((t = "failure"), (a = Math.round(40 * e))),
                                this.showGameResult(t, a);
                        } else a++, (c = !0), m(), setTimeout(u, 500);
                    }, 600);
            };
        m(),
            (this.activeGame.cleanup = () => {
                l = !1;
            });
    },
    startIntensityGame(e, t) {
        const n = t.difficulty || "medium",
            a = { easy: 15, medium: 25, hard: 40 }[n],
            o = { easy: 6e3, medium: 5e3, hard: 4e3 }[n];
        let i = 0,
            s = !1,
            r = !0,
            l = null,
            c = 0;
        let d = null;
        const p = () => {
                if (
                    ((e.innerHTML = `\n          ${r ? `\n            <div id="intensityInstructions" style="\n              position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\n              background: var(--l-veil-95); border: 2px solid var(--l-magenta); border-radius: 16px;\n              padding: 25px; max-width: 320px; text-align: center; z-index: 10;\n            ">\n              <div style="font-size: 2.5rem; margin-bottom: 10px;">⚡</div>\n              <div style="color: var(--l-ink); font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">Intensity Rush</div>\n              <div style="color: var(--l-ink-cool); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;">\n                Tap the button as <span style="color: var(--l-magenta); font-weight: bold;">FAST</span> as you can!<br><br>\n                Fill the meter to <span style="color: var(--positive);">${a} taps</span><br>\n                before time runs out.<br><br>\n                <span style="color: var(--accent-gold);">⏱️ ${(o / 1e3).toFixed(0)} seconds</span>\n              </div>\n              <button id="startIntensityBtn" style="\n                padding: 12px 30px; background: linear-gradient(135deg, var(--l-magenta), var(--l-magenta-2));\n                border: none; border-radius: 8px; color: var(--l-ink-on-fill); font-size: 1rem;\n                font-weight: bold; cursor: pointer;\n              ">Let's Go!</button>\n            </div>\n          ` : ""}\n          \n          <div style="width: 100%; margin-bottom: 20px; ${r ? "opacity: 0.3;" : ""}">\n            \x3c!-- Progress bar --\x3e\n            <div style="\n              position: relative;\n              height: 40px;\n              background: var(--l-panel);\n              border-radius: 20px;\n              overflow: hidden;\n              border: 3px solid var(--border);\n            ">\n              <div id="intensityBar" style="\n                height: 100%;\n                width: 0%;\n                background: linear-gradient(90deg, var(--l-magenta) 0%, var(--l-gold) 50%, var(--l-green) 100%);\n                transition: width 0.05s;\n                border-radius: 17px;\n              "></div>\n              <div style="\n                position: absolute; top: 50%; left: 50%;\n                transform: translate(-50%, -50%);\n                color: var(--l-ink); font-weight: bold; font-size: 1.1rem;\n                text-shadow: 0 2px 4px var(--l-veil-80);\n              ">\n                <span id="tapCountDisplay">${i}</span> / ${a}\n              </div>\n            </div>\n            \n            \x3c!-- Timer --\x3e\n            <div style="margin-top: 15px; text-align: center;">\n              <span style="color: var(--l-magenta); font-size: 2rem; font-weight: bold;" id="intensityTimer">${(o / 1e3).toFixed(1)}</span>\n              <span style="color: var(--text-mute); font-size: 1rem;">s remaining</span>\n            </div>\n          </div>\n          \n          \x3c!-- Feedback text --\x3e\n          <div id="intensityFeedback" style="\n            height: 30px; margin-bottom: 10px; font-size: 1.2rem; font-weight: bold;\n            ${r ? "opacity: 0.3;" : ""}\n          "></div>\n          \n          \x3c!-- Big tap button --\x3e\n          <button id="intensityTapBtn" style="\n            width: 180px; height: 180px;\n            border-radius: 50%;\n            background: ${s ? "linear-gradient(145deg, var(--l-magenta) 0%, var(--l-magenta-2) 100%)" : "var(--l-neutral-4)"};\n            border: 5px solid var(--l-ink);\n            color: var(--l-ink);\n            font-size: 2rem;\n            font-weight: bold;\n            cursor: ${s ? "pointer" : "default"};\n            box-shadow: ${s ? "0 0 40px rgba(247,37,133,0.6)" : "none"};\n            transition: transform 0.05s;\n            touch-action: manipulation;\n            ${r ? "opacity: 0.3;" : ""}\n          ">\n            ${s ? "⚡ TAP!" : "READY"}\n          </button>\n        `),
                    r &&
                        (document.getElementById("startIntensityBtn").onclick = () => {
                            (r = !1), (s = !0), (d = Date.now()), p(), m();
                        }),
                    s)
                ) {
                    const e = document.getElementById("intensityTapBtn");
                    (e.onclick = u),
                        (e.ontouchstart = (e) => {
                            e.preventDefault(), u();
                        });
                }
            },
            m = () => {
                l = setInterval(() => {
                    if (!s) return;
                    const e = Date.now() - d,
                        t = Math.max(0, o - e) / 1e3,
                        n = document.getElementById("intensityTimer");
                    n && (n.textContent = t.toFixed(1));
                    const r = (e / o) * a,
                        c = document.getElementById("intensityFeedback");
                    c &&
                        (i >= 1.2 * r
                            ? ((c.textContent = "🔥 On Fire!"), (c.style.color = "var(--l-green)"))
                            : i >= 0.8 * r
                              ? ((c.textContent = "👍 Good pace!"), (c.style.color = "var(--l-gold)"))
                              : ((c.textContent = "⚠️ Speed up!"), (c.style.color = "var(--l-magenta)"))),
                        t <= 0 && (clearInterval(l), this.endIntensityGame(i, a));
                }, 50);
            },
            u = () => {
                if (!s) return;
                const e = Date.now();
                if (e - c < 50) return;
                (c = e), i++;
                const t = document.getElementById("tapCountDisplay"),
                    n = document.getElementById("intensityBar");
                t && (t.textContent = i), n && (n.style.width = Math.min(100, (i / a) * 100) + "%");
                const o = document.getElementById("intensityTapBtn");
                o &&
                    ((o.style.transform = "scale(0.93)"),
                    (o.style.boxShadow = "0 0 60px rgba(247,37,133,0.9)"),
                    setTimeout(() => {
                        o &&
                            ((o.style.transform = "scale(1)"),
                            (o.style.boxShadow = "0 0 40px rgba(247,37,133,0.6)"));
                    }, 50)),
                    i >= a && ((s = !1), clearInterval(l), this.endIntensityGame(i, a));
            };
        p(),
            (this.activeGame.cleanup = () => {
                (s = !1), l && clearInterval(l);
            });
    },
    endIntensityGame(e, t) {
        const n = (e / t) * 100;
        let a, o;
        n >= 100
            ? ((a = "perfect"), (o = 100))
            : n >= 80
              ? ((a = "success"), (o = Math.round(n - 80 + 70)))
              : n >= 50
                ? ((a = "partial"), (o = Math.round(n - 50 + 30)))
                : ((a = "failure"), (o = Math.round(n / 2))),
            this.showGameResult(a, o);
    },
    startRecallGame(e, t) {
        const n = { easy: 3, medium: 4, hard: 6 }[t.difficulty || "medium"],
            a = [],
            o = [];
        let i = !0,
            s = !0;
        for (let e = 0; e < n; e++) a.push(Math.floor(4 * Math.random()));
        const r = ["var(--l-magenta)", "var(--l-green)", "var(--l-gold)", "var(--l-indigo)"],
            l = ["♥", "♠", "♦", "♣"],
            c = () => {
                (e.innerHTML = `\n          ${s ? `\n            <div id="recallInstructions" style="\n              position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\n              background: var(--l-veil-95); border: 2px solid var(--positive); border-radius: 16px;\n              padding: 25px; max-width: 320px; text-align: center; z-index: 10;\n            ">\n              <div style="font-size: 2.5rem; margin-bottom: 10px;">🧠</div>\n              <div style="color: var(--l-ink); font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">Read the Room</div>\n              <div style="color: var(--l-ink-cool); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;">\n                Watch the buttons light up in sequence.<br><br>\n                Then <span style="color: var(--positive); font-weight: bold;">repeat the pattern</span> by tapping them in the same order!<br><br>\n                <span style="color: var(--accent-gold);">Pattern length: ${n}</span>\n              </div>\n              <button id="startRecallBtn" style="\n                padding: 12px 30px; background: linear-gradient(135deg, var(--l-green), var(--l-green-dark));\n                border: none; border-radius: 8px; color: var(--l-on-accent); font-size: 1rem;\n                font-weight: bold; cursor: pointer;\n              ">Show Pattern!</button>\n            </div>\n          ` : ""}\n          \n          <div style="margin-bottom: 20px; ${s ? "opacity: 0.3;" : ""}">\n            <div id="recallStatus" style="color: var(--accent-gold); font-size: 1.2rem; font-weight: bold; min-height: 30px;">\n              ${s ? "Ready..." : "Watch the pattern..."}\n            </div>\n          </div>\n          \n          \x3c!-- Pattern buttons in 2x2 grid --\x3e\n          <div style="\n            display: grid;\n            grid-template-columns: repeat(2, 1fr);\n            gap: 15px;\n            max-width: 280px;\n            ${s ? "opacity: 0.3;" : ""}\n          ">\n            ${[0, 1, 2, 3].map((e) => `\n              <button id="recallBtn${e}" class="recall-btn" data-index="${e}" style="\n                width: 100%; aspect-ratio: 1;\n                border-radius: 16px;\n                background: ${fuocAlpha(r[e], "33")};\n                border: 3px solid ${r[e]};\n                color: ${r[e]};\n                font-size: 2.5rem;\n                cursor: pointer;\n                transition: all 0.15s;\n                opacity: 0.6;\n                touch-action: manipulation;\n              ">${l[e]}</button>\n            `).join("")}\n          </div>\n          \n          \x3c!-- Progress dots --\x3e\n          <div id="recallProgress" style="margin-top: 20px; display: flex; gap: 8px; justify-content: center; ${s ? "opacity: 0.3;" : ""}">\n            ${a.map(() => '<div style="width: 12px; height: 12px; border-radius: 50%; background: var(--l-neutral-3); border: 1px solid var(--border-strong);"></div>').join("")}\n          </div>\n          \n          \x3c!-- Legend --\x3e\n          <div style="margin-top: 15px; font-size: 0.8rem; color: var(--text-mute); ${s ? "opacity: 0.3;" : ""}">\n            <span style="color: var(--positive);">●</span> Correct <span style="margin-left: 15px; color: var(--l-magenta);">●</span> Wrong\n          </div>\n        `),
                    s &&
                        (document.getElementById("startRecallBtn").onclick = () => {
                            (s = !1), c(), u(), h();
                        });
            },
            d = () => e.querySelectorAll(".recall-btn"),
            p = () => document.getElementById("recallStatus"),
            m = (e, t = 400) => {
                const n = document.getElementById(`recallBtn${e}`);
                n &&
                    ((n.style.opacity = "1"),
                    (n.style.transform = "scale(1.1)"),
                    (n.style.boxShadow = `0 0 30px ${r[e]}`),
                    setTimeout(() => {
                        (n.style.opacity = "0.6"), (n.style.transform = "scale(1)"), (n.style.boxShadow = "none");
                    }, t));
            },
            u = () => {
                d().forEach((e) => {
                    e.style.pointerEvents = "none";
                    const t = parseInt(e.dataset.index);
                    (e.onclick = () => g(t)),
                        (e.ontouchstart = (e) => {
                            e.preventDefault(), g(t);
                        });
                });
            },
            g = (e) => {
                if (i) return;
                m(e, 200), o.push(e);
                const t = o.length - 1,
                    n = document.getElementById("recallProgress")?.children || [],
                    s = p();
                if (o[t] === a[t])
                    n[t] && (n[t].style.background = "var(--l-green)"),
                        o.length === a.length &&
                            (s && ((s.textContent = "Perfect! 🎉"), (s.style.color = "var(--l-green)")),
                            d().forEach((e) => (e.style.pointerEvents = "none")),
                            setTimeout(() => this.showGameResult("perfect", 100), 500));
                else {
                    n[t] && (n[t].style.background = "var(--l-magenta)"),
                        s && ((s.textContent = "Wrong! 😔"), (s.style.color = "var(--l-magenta)")),
                        d().forEach((e) => (e.style.pointerEvents = "none"));
                    const e = Math.round((t / a.length) * 60),
                        o = e >= 30 ? "partial" : "failure";
                    setTimeout(() => this.showGameResult(o, e), 500);
                }
            },
            h = async () => {
                await new Promise((e) => setTimeout(e, 500));
                for (let e = 0; e < a.length; e++) m(a[e], 500), await new Promise((e) => setTimeout(e, 700));
                i = !1;
                const e = p();
                e && ((e.textContent = "Your turn! Repeat the pattern"), (e.style.color = "var(--l-green)")),
                    d().forEach((e) => (e.style.pointerEvents = "auto"));
            };
        c();
    },
    startReflexGame(e, t) {
        const n = t.difficulty || "medium",
            a = { easy: 8, medium: 12, hard: 18 }[n],
            o = { easy: 1400, medium: 1e3, hard: 700 }[n];
        let i = 0,
            s = 0,
            r = 0,
            l = !1,
            c = !0;
        const d = () => {
                (e.innerHTML = `\n          ${c ? `\n            <div id="reflexInstructions" style="\n              position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\n              background: var(--l-veil-95); border: 2px solid var(--accent-gold); border-radius: 16px;\n              padding: 25px; max-width: 320px; text-align: center; z-index: 10;\n            ">\n              <div style="font-size: 2.5rem; margin-bottom: 10px;">⭐</div>\n              <div style="color: var(--l-ink); font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">Quick Reflexes</div>\n              <div style="color: var(--l-ink-cool); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;">\n                Stars will appear in the play area.<br><br>\n                <span style="color: var(--accent-gold); font-weight: bold;">Tap them before they disappear!</span><br><br>\n                <span style="color: var(--positive);">Targets: ${a}</span>\n                <span style="margin-left: 10px; color: var(--l-magenta);">Speed: ${n}</span>\n              </div>\n              <button id="startReflexBtn" style="\n                padding: 12px 30px; background: linear-gradient(135deg, var(--l-gold), #f7a800);\n                border: none; border-radius: 8px; color: var(--l-on-accent); font-size: 1rem;\n                font-weight: bold; cursor: pointer;\n              ">Ready!</button>\n            </div>\n          ` : ""}\n          \n          <div style="width: 100%; margin-bottom: 15px; display: flex; justify-content: space-between; ${c ? "opacity: 0.3;" : ""}">\n            <div style="color: var(--positive);">✓ Caught: <span id="reflexCaught">${i}</span></div>\n            <div style="color: var(--l-magenta);">✗ Missed: <span id="reflexMissed">${s}</span></div>\n          </div>\n          \n          \x3c!-- Game field --\x3e\n          <div id="reflexField" style="\n            position: relative;\n            width: 100%;\n            height: 260px;\n            background: radial-gradient(circle at center, var(--l-panel-2) 0%, var(--l-bg) 100%);\n            border-radius: 16px;\n            border: 2px solid ${l ? "var(--l-gold)" : "var(--l-neutral-3)"};\n            overflow: hidden;\n            touch-action: manipulation;\n            ${c ? "opacity: 0.3;" : ""}\n          ">\n            ${l || c ? "" : '\n              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\n                color: var(--accent-gold); font-size: 1.5rem; font-weight: bold;">Get Ready...</div>\n            '}\n          </div>\n          \n          \x3c!-- Progress --\x3e\n          <div style="margin-top: 15px; color: var(--text-mute); ${c ? "opacity: 0.3;" : ""}">\n            Progress: <span id="reflexProgress">${r}</span> / ${a} targets\n          </div>\n        `),
                    c &&
                        (document.getElementById("startReflexBtn").onclick = () => {
                            (c = !1),
                                d(),
                                setTimeout(() => {
                                    (l = !0), d(), setTimeout(p, 300);
                                }, 800);
                        });
            },
            p = () => {
                if (!l || r >= a)
                    return void (r >= a && l && ((l = !1), setTimeout(() => this.endReflexGame(i, s, a), 500)));
                const e = document.getElementById("reflexField"),
                    t = document.getElementById("reflexCaught"),
                    n = (document.getElementById("reflexMissed"), document.getElementById("reflexProgress"));
                if (!e) return;
                r++, n && (n.textContent = r);
                const c = document.createElement("div"),
                    d = 55 + 20 * Math.random(),
                    m = Math.random() * (e.offsetWidth - d),
                    u = Math.random() * (e.offsetHeight - d);
                (c.className = "reflex-target"),
                    (c.style.cssText = `\n          position: absolute;\n          left: ${m}px;\n          top: ${u}px;\n          width: ${d}px;\n          height: ${d}px;\n          background: radial-gradient(circle, var(--l-gold) 0%, var(--l-magenta) 100%);\n          border-radius: 50%;\n          cursor: pointer;\n          animation: reflexPop 0.2s ease-out;\n          box-shadow: 0 0 25px rgba(255,215,0,0.7);\n          display: flex;\n          align-items: center;\n          justify-content: center;\n          font-size: 1.5rem;\n        `),
                    (c.innerHTML = "⭐");
                const g = (e) => {
                    e.preventDefault(),
                        e.stopPropagation(),
                        c.parentNode &&
                            (i++,
                            t && (t.textContent = i),
                            (c.style.transform = "scale(1.3)"),
                            (c.style.opacity = "0"),
                            setTimeout(() => c.remove(), 150));
                };
                (c.onclick = g),
                    (c.ontouchstart = g),
                    e.appendChild(c),
                    setTimeout(() => {
                        if (c.parentNode) {
                            s++;
                            const e = document.getElementById("reflexMissed");
                            e && (e.textContent = s), (c.style.opacity = "0"), setTimeout(() => c.remove(), 150);
                        }
                    }, o);
                const h = 350 + 450 * Math.random();
                setTimeout(p, h);
            };
        d(),
            (this.activeGame.cleanup = () => {
                l = !1;
            });
    },
    endReflexGame(e, t, n) {
        const a = e / n;
        let o, i;
        a >= 0.9
            ? ((o = "perfect"), (i = 100))
            : a >= 0.7
              ? ((o = "success"), (i = Math.round(70 + 100 * (a - 0.7))))
              : a >= 0.4
                ? ((o = "partial"), (i = Math.round(30 + 100 * (a - 0.4))))
                : ((o = "failure"), (i = Math.round(75 * a))),
            this.showGameResult(o, i);
    },
    startComposureGame(e, t) {
        const n = t.difficulty || "medium",
            a = { easy: 5e3, medium: 7e3, hard: 1e4 }[n],
            o = { easy: 0.35, medium: 0.55, hard: 0.85 }[n];
        let i = 50,
            s = 0,
            r = !1,
            l = !0,
            c = 0,
            d = null,
            p = !1,
            m = !1;
        const u = () => {
                (e.innerHTML = `\n          ${l ? `\n            <div id="composureInstructions" style="\n              position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\n              background: var(--l-veil-95); border: 2px solid var(--l-indigo); border-radius: 16px;\n              padding: 25px; max-width: 340px; text-align: center; z-index: 10;\n            ">\n              <div style="font-size: 2.5rem; margin-bottom: 10px;">⚖️</div>\n              <div style="color: var(--l-ink); font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">Keep Composure</div>\n              <div style="color: var(--l-ink-cool); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;">\n                The marker drifts randomly left and right.<br><br>\n                <span style="color: var(--positive);">Keep it in the GREEN zone</span><br>\n                using the <b>◀</b> and <b>▶</b> buttons!<br><br>\n                <span style="color: var(--accent-gold);">Hold ${(a / 1e3).toFixed(0)} seconds to fill the bar.</span>\n              </div>\n              <button id="startComposureBtn" style="\n                padding: 12px 30px; background: linear-gradient(135deg, var(--l-indigo), var(--l-indigo-deep));\n                border: none; border-radius: 8px; color: var(--l-ink-on-fill); font-size: 1rem;\n                font-weight: bold; cursor: pointer;\n              ">Begin!</button>\n            </div>\n          ` : ""}\n          \n          <div style="margin-bottom: 15px; ${l ? "opacity: 0.3;" : ""}">\n            <div id="composureStatus" style="color: ${i >= 25 && i <= 75 ? "var(--l-green)" : "var(--l-magenta)"}; font-size: 1.1rem; font-weight: bold;">\n              ${r ? (i >= 25 && i <= 75 ? "✓ Balanced!" : "⚠️ Drifting!") : "Get Ready..."}\n            </div>\n          </div>\n          \n          \x3c!-- Balance bar --\x3e\n          <div style="\n            position: relative;\n            width: 100%;\n            height: 65px;\n            background: linear-gradient(90deg, \n              var(--l-magenta) 0%, #f7258555 25%, \n              var(--l-green) 25%, var(--l-green) 75%, \n              #f7258555 75%, var(--l-magenta) 100%\n            );\n            border-radius: 32px;\n            border: 3px solid var(--border);\n            overflow: hidden;\n            ${l ? "opacity: 0.3;" : ""}\n          ">\n            \x3c!-- Zone labels --\x3e\n            <div style="position: absolute; top: 50%; left: 8%; transform: translateY(-50%); color: var(--l-sheen-40); font-size: 0.7rem;">DANGER</div>\n            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--l-sheen-50); font-size: 0.8rem; font-weight: bold;">SAFE</div>\n            <div style="position: absolute; top: 50%; right: 8%; transform: translateY(-50%); color: var(--l-sheen-40); font-size: 0.7rem;">DANGER</div>\n            \n            \x3c!-- Balance indicator --\x3e\n            <div id="composureMarker" style="\n              position: absolute;\n              left: ${i}%;\n              top: 7px;\n              width: 14px;\n              height: 51px;\n              background: var(--l-ink);\n              border-radius: 7px;\n              transform: translateX(-50%);\n              box-shadow: 0 0 20px var(--l-sheen-90);\n              transition: left 0.05s;\n            "></div>\n          </div>\n          \n          \x3c!-- Time bar (progress) --\x3e\n          <div style="margin-top: 20px; width: 100%; ${l ? "opacity: 0.3;" : ""}">\n            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">\n              <span style="color: var(--text-mute); font-size: 0.85rem;">Progress</span>\n              <span id="composurePercent" style="color: var(--positive); font-size: 0.85rem; font-weight: bold;">0%</span>\n            </div>\n            <div style="\n              height: 12px;\n              background: var(--l-panel);\n              border-radius: 6px;\n              overflow: hidden;\n              border: 1px solid var(--border);\n            ">\n              <div id="composureTimer" style="\n                height: 100%;\n                width: 0%;\n                background: linear-gradient(90deg, var(--l-indigo), var(--l-green));\n                transition: width 0.1s;\n              "></div>\n            </div>\n          </div>\n          \n          \x3c!-- Control buttons --\x3e\n          <div style="display: flex; gap: 30px; margin-top: 25px; justify-content: center; ${l ? "opacity: 0.3;" : ""}">\n            <button id="composureLeft" style="\n              width: 110px; height: 90px;\n              border-radius: 16px;\n              background: ${p ? "linear-gradient(145deg, var(--l-green) 0%, var(--l-green-dark) 100%)" : "linear-gradient(145deg, var(--l-indigo) 0%, var(--l-indigo-deep) 100%)"};\n              border: 3px solid var(--l-ink);\n              color: var(--l-ink);\n              font-size: 2.5rem;\n              cursor: pointer;\n              touch-action: manipulation;\n              user-select: none;\n            ">◀</button>\n            <button id="composureRight" style="\n              width: 110px; height: 90px;\n              border-radius: 16px;\n              background: ${m ? "linear-gradient(145deg, var(--l-green) 0%, var(--l-green-dark) 100%)" : "linear-gradient(145deg, var(--l-indigo) 0%, var(--l-indigo-deep) 100%)"};\n              border: 3px solid var(--l-ink);\n              color: var(--l-ink);\n              font-size: 2.5rem;\n              cursor: pointer;\n              touch-action: manipulation;\n              user-select: none;\n            ">▶</button>\n          </div>\n          \n          \x3c!-- Instruction reminder --\x3e\n          <div style="margin-top: 15px; color: var(--text-mute); font-size: 0.8rem; ${l ? "opacity: 0.3;" : ""}">\n            Hold the buttons to move the marker\n          </div>\n        `),
                    l &&
                        (document.getElementById("startComposureBtn").onclick = () => {
                            (l = !1), (r = !0), (c = (Math.random() - 0.5) * o), (d = Date.now()), u(), g(), y();
                        });
            },
            g = () => {
                const e = document.getElementById("composureLeft"),
                    t = document.getElementById("composureRight");
                if (!e || !t) return;
                const n = () => {
                        (p = !0), h();
                    },
                    a = () => {
                        (p = !1), h();
                    },
                    o = () => {
                        (m = !0), h();
                    },
                    i = () => {
                        (m = !1), h();
                    };
                (e.onmousedown = n),
                    (e.onmouseup = a),
                    (e.onmouseleave = a),
                    (e.ontouchstart = (e) => {
                        e.preventDefault(), n();
                    }),
                    (e.ontouchend = a),
                    (e.ontouchcancel = a),
                    (t.onmousedown = o),
                    (t.onmouseup = i),
                    (t.onmouseleave = i),
                    (t.ontouchstart = (e) => {
                        e.preventDefault(), o();
                    }),
                    (t.ontouchend = i),
                    (t.ontouchcancel = i);
            },
            h = () => {
                const e = document.getElementById("composureLeft"),
                    t = document.getElementById("composureRight");
                e &&
                    (e.style.background = p
                        ? "linear-gradient(145deg, var(--l-green) 0%, var(--l-green-dark) 100%)"
                        : "linear-gradient(145deg, var(--l-indigo) 0%, var(--l-indigo-deep) 100%)"),
                    t &&
                        (t.style.background = m
                            ? "linear-gradient(145deg, var(--l-green) 0%, var(--l-green-dark) 100%)"
                            : "linear-gradient(145deg, var(--l-indigo) 0%, var(--l-indigo-deep) 100%)");
            },
            y = () => {
                if (!r) return;
                const e = Date.now() - d;
                (i += c),
                    Math.random() < 0.025 && (c = (Math.random() - 0.5) * o * 2),
                    p && (i -= 1.8),
                    m && (i += 1.8),
                    (i = Math.max(5, Math.min(95, i)));
                const t = document.getElementById("composureMarker");
                t && (t.style.left = i + "%");
                const n = i >= 25 && i <= 75;
                n && (s += 16.67);
                const l = document.getElementById("composureStatus");
                l &&
                    ((l.textContent = n ? "✓ Balanced!" : "⚠️ Drifting!"),
                    (l.style.color = n ? "var(--l-green)" : "var(--l-magenta)"));
                const u = (e / a) * 100,
                    g = document.getElementById("composureTimer"),
                    h = document.getElementById("composurePercent");
                if (
                    (g && (g.style.width = Math.min(100, u) + "%"),
                    h && (h.textContent = Math.round(u) + "%"),
                    e >= a)
                )
                    return (r = !1), void this.endComposureGame(s, a);
                requestAnimationFrame(y);
            };
        u(),
            (this.activeGame.cleanup = () => {
                r = !1;
            });
    },
    endComposureGame(e, t) {
        const n = (e / t) * 100;
        let a, o;
        n >= 80
            ? ((a = "perfect"), (o = 100))
            : n >= 60
              ? ((a = "success"), (o = Math.round(n - 60 + 70)))
              : n >= 35
                ? ((a = "partial"), (o = Math.round(n - 35 + 30)))
                : ((a = "failure"), (o = Math.round(n))),
            this.showGameResult(a, o);
    },
    startTensionGame(e, t) {
        const n = t.difficulty || "medium",
            a = {
                easy: {
                    totalRounds: 4,
                    allowedMisses: 2,
                    startSweetSpot: [55, 85],
                    endSweetSpot: [65, 80],
                    fillSpeed: 12,
                    sweetSpotShift: 10,
                },
                medium: {
                    totalRounds: 5,
                    allowedMisses: 2,
                    startSweetSpot: [60, 85],
                    endSweetSpot: [70, 82],
                    fillSpeed: 16,
                    sweetSpotShift: 15,
                },
                hard: {
                    totalRounds: 6,
                    allowedMisses: 1,
                    startSweetSpot: [65, 85],
                    endSweetSpot: [75, 85],
                    fillSpeed: 22,
                    sweetSpotShift: 20,
                },
            }[n];
        let o = 1,
            i = 0,
            s = 0,
            r = 0,
            l = !1,
            c = !0,
            d = !1,
            p = !0;
        const m = (e) => {
            const t = (e - 1) / Math.max(1, a.totalRounds - 1),
                n = a.startSweetSpot[0] + (a.endSweetSpot[0] - a.startSweetSpot[0]) * t,
                o = a.startSweetSpot[1] + (a.endSweetSpot[1] - a.startSweetSpot[1]) * t,
                i = (Math.random() - 0.5) * a.sweetSpotShift * t;
            let s = Math.max(20, Math.min(75, n + i)),
                r = Math.max(s + 8, Math.min(95, o + i));
            return [Math.round(s), Math.round(r)];
        };
        let [u, g] = m(1);
        const h = () => {
                const t = g - u,
                    r = Array(a.totalRounds)
                        .fill("○")
                        .map((e, t) =>
                            t < i
                                ? '<span style="color:var(--positive);">●</span>'
                                : t < i + s
                                  ? '<span style="color:var(--l-magenta);">✕</span>'
                                  : '<span style="color:var(--l-on-accent);">○</span>'
                        )
                        .join(" ");
                e.innerHTML = `\n          <div style="margin-bottom: 10px;">\n            <div style="color: var(--accent-gold); font-size: 1rem; margin-bottom: 5px;">\n              Hold to build tension... release in the green zone!\n            </div>\n            <div style="font-size: 0.9rem; color: var(--l-ink-cool);">\n              Round <span style="color:var(--l-ink); font-weight:bold;">${o}</span> of ${a.totalRounds}\n              <span style="margin-left: 15px;">Misses allowed: <span style="color:${a.allowedMisses - s > 0 ? "var(--l-green)" : "var(--l-magenta)"}; font-weight:bold;">${a.allowedMisses - s}</span></span>\n            </div>\n          </div>\n          \n          \x3c!-- Progress indicator --\x3e\n          <div style="margin-bottom: 15px; font-size: 1.3rem; letter-spacing: 4px;">\n            ${r}\n          </div>\n          \n          \x3c!-- Tension meter with animated sweet spot --\x3e\n          <div style="\n            position: relative;\n            width: 70px;\n            height: 220px;\n            background: linear-gradient(180deg, \n              var(--l-magenta) 0%, var(--l-magenta) ${100 - g}%,\n              var(--l-green) ${100 - g}%, var(--l-green) ${100 - u}%,\n              var(--l-amber-3) ${100 - u}%, var(--l-amber-3) 100%\n            );\n            border-radius: 35px;\n            border: 4px solid var(--border);\n            margin: 0 auto;\n            overflow: hidden;\n            box-shadow: 0 0 20px rgba(78, 204, 163, 0.3);\n            transition: background 0.5s ease;\n          ">\n            \x3c!-- Fill level (inverted - fills from bottom) --\x3e\n            <div id="tensionFill" style="\n              position: absolute;\n              bottom: 0;\n              width: 100%;\n              height: 0%;\n              background: linear-gradient(180deg, var(--l-sheen-10) 0%, rgba(100,100,100,0.8) 100%);\n              transition: height 0.03s linear;\n            "></div>\n            \n            \x3c!-- Current position marker --\x3e\n            <div id="tensionMarker" style="\n              position: absolute;\n              left: 50%;\n              transform: translateX(-50%);\n              bottom: 0%;\n              width: 50px;\n              height: 6px;\n              background: var(--l-ink);\n              border-radius: 3px;\n              box-shadow: 0 0 10px var(--l-ink), 0 0 20px var(--l-ink);\n              transition: bottom 0.03s linear;\n            "></div>\n            \n            \x3c!-- Sweet spot bracket indicators --\x3e\n            <div style="\n              position: absolute;\n              left: -25px;\n              bottom: ${u}%;\n              height: ${t}%;\n              display: flex;\n              flex-direction: column;\n              justify-content: space-between;\n              align-items: center;\n            ">\n              <div style="width:20px; height:3px; background:var(--l-green); border-radius:2px;"></div>\n              <div style="font-size:0.7rem; color:var(--positive); writing-mode:vertical-rl; transform:rotate(180deg);">ZONE</div>\n              <div style="width:20px; height:3px; background:var(--l-green); border-radius:2px;"></div>\n            </div>\n            <div style="\n              position: absolute;\n              right: -25px;\n              bottom: ${u}%;\n              height: ${t}%;\n              display: flex;\n              flex-direction: column;\n              justify-content: space-between;\n              align-items: center;\n            ">\n              <div style="width:20px; height:3px; background:var(--l-green); border-radius:2px;"></div>\n              <div style="font-size:0.7rem; color:var(--positive); writing-mode:vertical-rl;">${t}%</div>\n              <div style="width:20px; height:3px; background:var(--l-green); border-radius:2px;"></div>\n            </div>\n          </div>\n          \n          \x3c!-- Tension value --\x3e\n          <div style="margin-top: 12px; font-size: 1.8rem; color: var(--l-ink); font-weight: bold;">\n            <span id="tensionValue">0</span>%\n          </div>\n          \n          \x3c!-- Hold button --\x3e\n          <button id="tensionBtn" style="\n            margin-top: 15px;\n            width: 140px; height: 140px;\n            border-radius: 50%;\n            background: linear-gradient(145deg, var(--l-violet-3) 0%, #7b2cbf 100%);\n            border: 5px solid var(--l-ink);\n            color: var(--l-ink-on-fill);\n            font-size: 1.2rem;\n            font-weight: bold;\n            cursor: pointer;\n            box-shadow: 0 0 30px rgba(157,78,221,0.5);\n            touch-action: manipulation;\n            transition: transform 0.1s, box-shadow 0.1s;\n          ">\n            ${p ? "HOLD" : "WAIT..."}\n          </button>\n          \n          <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-mute);">\n            ${"hard" === n ? "⚠️ Hard: Zone shifts more!" : "Tap/click and hold, release in green"}\n          </div>\n        `;
                const c = document.getElementById("tensionBtn");
                c &&
                    p &&
                    ((c.onmousedown = f),
                    (c.onmouseup = b),
                    (c.onmouseleave = () => {
                        l && b();
                    }),
                    (c.ontouchstart = (e) => {
                        e.preventDefault(), f();
                    }),
                    (c.ontouchend = b));
            },
            y = () => {
                if (c) {
                    if (
                        l &&
                        p &&
                        ((r = Math.min(100, r + a.fillSpeed / 60)),
                        (() => {
                            const e = document.getElementById("tensionFill"),
                                t = document.getElementById("tensionMarker"),
                                n = document.getElementById("tensionValue");
                            e &&
                                n &&
                                t &&
                                ((e.style.height = r + "%"),
                                (t.style.bottom = r + "%"),
                                (n.textContent = Math.round(r)),
                                r >= u && r <= g
                                    ? ((n.style.color = "var(--l-green)"),
                                      (n.style.textShadow = "0 0 10px var(--l-green)"),
                                      (t.style.background = "var(--l-green)"))
                                    : r > g
                                      ? ((n.style.color = "var(--l-magenta)"),
                                        (n.style.textShadow = "0 0 10px var(--l-magenta)"),
                                        (t.style.background = "var(--l-magenta)"))
                                      : ((n.style.color = "var(--l-amber-3)"),
                                        (n.style.textShadow = "none"),
                                        (t.style.background = "var(--l-ink)")));
                        })(),
                        r >= 100)
                    ) {
                        (p = !1), (l = !1), s++;
                        const e = document.getElementById("tensionBtn");
                        return (
                            e &&
                                ((e.textContent = "💥"),
                                (e.style.background = "linear-gradient(145deg, var(--l-magenta) 0%, var(--l-magenta-2) 100%)")),
                            void setTimeout(() => {
                                if (s > a.allowedMisses) {
                                    c = !1;
                                    const e = Math.round((i / a.totalRounds) * 50);
                                    this.showGameResult("failure", e);
                                } else v();
                            }, 800)
                        );
                    }
                    requestAnimationFrame(y);
                }
            },
            f = () => {
                if (!c || !p) return;
                (l = !0), (d = !0);
                const e = document.getElementById("tensionBtn");
                e &&
                    ((e.textContent = "..."),
                    (e.style.transform = "scale(0.95)"),
                    (e.style.boxShadow = "0 0 50px rgba(157,78,221,0.8)"));
            },
            b = () => {
                if (!c || !d || !p) return;
                (l = !1), (p = !1);
                const e = document.getElementById("tensionBtn");
                r >= u && r <= g
                    ? (i++,
                      e &&
                          ((e.textContent = "✓"),
                          (e.style.background = "linear-gradient(145deg, var(--l-green) 0%, var(--l-green-3) 100%)")))
                    : (s++,
                      e &&
                          ((e.textContent = "✗"),
                          (e.style.background = "linear-gradient(145deg, var(--l-magenta) 0%, var(--l-magenta-2) 100%)"))),
                    (e.style.transform = "scale(1)"),
                    setTimeout(() => {
                        if (s > a.allowedMisses) {
                            c = !1;
                            const e = Math.round((i / a.totalRounds) * 50);
                            this.showGameResult("failure", e);
                        } else if (o >= a.totalRounds) {
                            c = !1;
                            const e = i / a.totalRounds;
                            let t, n;
                            1 === e
                                ? ((t = "perfect"), (n = 100))
                                : e >= 0.8
                                  ? ((t = "success"), (n = Math.round(75 + 20 * e)))
                                  : e >= 0.5
                                    ? ((t = "partial"), (n = Math.round(40 + 30 * e)))
                                    : ((t = "failure"), (n = Math.round(40 * e))),
                                this.showGameResult(t, n);
                        } else v();
                    }, 600);
            },
            v = () => {
                o++, (r = 0), (d = !1), (p = !0), ([u, g] = m(o)), h();
                const e = document.getElementById("tensionValue");
                e &&
                    ((e.innerHTML = `<span style="font-size:0.8rem; color:var(--positive);">Zone: ${u}-${g}%</span>`),
                    setTimeout(() => {
                        document.getElementById("tensionValue") &&
                            (document.getElementById("tensionValue").textContent = "0");
                    }, 1e3));
            };
        h(),
            y(),
            (this.activeGame.cleanup = () => {
                c = !1;
            });
    },
    showGameResult(e, t) {
        const n = document.getElementById("minigameArea");
        if (!n) return;
        const a = {
            perfect: { emoji: "🌟", text: "PERFECT!", color: "var(--l-gold)", desc: "Flawless execution!" },
            success: { emoji: "✅", text: "SUCCESS!", color: "var(--l-green)", desc: "Well done!" },
            partial: { emoji: "😐", text: "PARTIAL", color: "var(--l-amber-3)", desc: "Could be better..." },
            failure: { emoji: "❌", text: "FAILED", color: "var(--l-magenta)", desc: "That didn't go well." },
        }[e];
        (n.innerHTML = `\n        <div style="animation: storySlideUp 0.4s ease-out;">\n          <div style="font-size: 4rem; margin-bottom: 10px;">${a.emoji}</div>\n          <div style="font-size: 2rem; font-weight: bold; color: ${a.color}; margin-bottom: 10px;">${a.text}</div>\n          <div style="font-size: 1.1rem; color: var(--l-ink-cool); margin-bottom: 20px;">${a.desc}</div>\n          <div style="font-size: 1.5rem; color: var(--l-ink);">Score: <span style="color: ${a.color}; font-weight: bold;">${t}</span>/100</div>\n        </div>\n      `),
            (this.gameResult = { result: e, score: t });
        const o = document.getElementById("skipMinigame");
        o && (o.style.display = "none");
        const i = document.getElementById("minigameContainer");
        if (i) {
            const e = document.createElement("button");
            (e.style.cssText = `\n          margin-top: 25px; padding: 15px 40px;\n          background: linear-gradient(135deg, ${a.color} 0%, ${fuocAlpha(a.color, "88")} 100%);\n          border: none; border-radius: 12px;\n          color: var(--l-ink); font-size: 1.1rem; font-weight: bold;\n          cursor: pointer;\n          box-shadow: 0 4px 20px ${fuocAlpha(a.color, "44")};\n        `),
                (e.textContent = "Continue"),
                (e.onclick = () => this.completeGame()),
                i.appendChild(e);
        }
    },
    completeGame() {
        const e = document.getElementById("minigameOverlay");
        e && ((e.style.animation = "storyFadeIn 0.3s ease-out reverse"), setTimeout(() => e.remove(), 300)),
            this.activeGame &&
                this.gameResult &&
                !this.gameResult.skipped &&
                this.trackMinigameMastery(this.activeGame.type, this.gameResult),
            this.activeGame?.cleanup && this.activeGame.cleanup(),
            this.activeGame?.onComplete && this.activeGame.onComplete(this.gameResult),
            (this.activeGame = null),
            (this.gameResult = null);
    },
    skipGame() {
        this.activeGame?.cleanup && this.activeGame.cleanup(),
            (this.gameResult = { result: "partial", score: 50, skipped: !0 }),
            this.completeGame();
    },
    trackMinigameMastery(e, t) {
        if (!gameState?.story?.minigameMastery) return;
        const n = gameState.story.minigameMastery;
        n[e] || (n[e] = { played: 0, perfect: 0, wins: 0, level: 0 });
        const a = n[e];
        a.played++,
            ("success" !== t.result && "perfect" !== t.result) || a.wins++,
            ("perfect" === t.result || t.score >= 95) && a.perfect++;
        const o = a.level;
        if (
            (a.perfect >= 10
                ? (a.level = 5)
                : a.perfect >= 7
                  ? (a.level = 4)
                  : a.perfect >= 4
                    ? (a.level = 3)
                    : a.wins >= 5
                      ? (a.level = 2)
                      : a.wins >= 2 && (a.level = 1),
            a.level > o && a.level >= 2)
        ) {
            const t = this.GAME_TYPES[e];
            this.showMasteryLevelUp(t, a.level);
        }
    },
    showMasteryLevelUp(e, t) {
        const [n, a] = {
                2: ["Apprentice", "🌟"],
                3: ["Skilled", "⭐"],
                4: ["Expert", "🌟🌟"],
                5: ["Master", "👑"],
            }[t] || ["Improving", "✨"],
            o = document.createElement("div");
        (o.style.cssText =
            "\n        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);\n        background: linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%);\n        border: 2px solid var(--accent-gold); border-radius: 20px;\n        padding: 30px 50px; z-index: 100003; text-align: center;\n        animation: storyFadeIn 0.5s ease-out;\n      "),
            (o.innerHTML = `\n        <div style="font-size: 3rem; margin-bottom: 15px;">${a}</div>\n        <div style="color: var(--accent-gold); font-size: 1.5rem; font-weight: bold; margin-bottom: 10px;">\n          ${n} ${e.name}!\n        </div>\n        <div style="color: var(--l-ink-cool); font-size: 0.95rem; margin-bottom: 20px;">\n          Mastery Level ${t} Achieved!<br>\n          <span style="color: var(--positive);">Future ${e.name} checks are slightly easier.</span>\n        </div>\n        <button onclick="this.parentElement.remove()" style="\n          padding: 10px 25px; background: linear-gradient(135deg, var(--l-indigo), var(--l-indigo-deep));\n          border: none; border-radius: 8px; color: var(--l-ink-on-fill); cursor: pointer; font-weight: bold;\n        ">Nice!</button>\n      `),
            document.body.appendChild(o),
            setTimeout(() => o.remove(), 8e3);
    },
    getMasteryAdjustedDifficulty(e, t) {
        const n = gameState?.story?.minigameMastery?.[e];
        if (!n) return t;
        let a = { easy: 0, medium: 1, hard: 2 }[t] ?? 1;
        return (
            n.level >= 3 || (n.level >= 1 && (a = Math.max(0, a - 0.5))), ["easy", "medium", "hard"][Math.round(a)]
        );
    },
    selectContextualMinigame(e = []) {
        const t = {
                negotiation: ["precision", "composure"],
                confrontation: ["composure", "tension"],
                seduction: ["tension", "intensity"],
                persuasion: ["intensity", "precision"],
                observation: ["recall", "reflex"],
                social: ["recall", "composure"],
                timing: ["precision", "reflex"],
                urgency: ["reflex", "intensity"],
                power_play: ["tension", "composure"],
                romance: ["tension", "precision"],
                risk: ["precision", "tension"],
                memory: ["recall"],
                opportunity: ["reflex"],
                patience: ["tension", "composure"],
            },
            n = [];
        if (
            (e.forEach((e) => {
                const a = t[e.toLowerCase()];
                a && n.push(...a);
            }),
            0 === n.length)
        ) {
            const e = Object.keys(this.GAME_TYPES);
            return e[Math.floor(Math.random() * e.length)];
        }
        const a = {};
        n.forEach((e) => (a[e] = (a[e] || 0) + 1));
        const o = Object.entries(a).sort((e, t) => t[1] - e[1]),
            i = o.filter(([e, t]) => t >= o[0][1] - 1).map(([e]) => e);
        return i[Math.floor(Math.random() * i.length)];
    },
};
window.StoryMinigames = StoryMinigames;
