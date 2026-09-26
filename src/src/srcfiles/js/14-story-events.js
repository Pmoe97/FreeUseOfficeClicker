// ============================================================================
// 14-story-events — Story event runner: style injection, dynamic event generation, AI judge, event panel UI + openEventPanel exports.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

const minigameStyles = document.createElement("style");
function storyPeriodicTick() {
    if (!gameState.story?.settings?.storyEnabled || !isStoryEnabled()) return;
    if (gameState.story.activeSpineEvent) return;
    const e = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus);
    if (e.length < 1) return;
    gameState.story.actionStats, gameState.story.moralScore;
    const t = e.find((e) => (e.stats?.comfort || 60) < 30);
    if (t) {
        (gameState.story.actionLog || []).find(
            (e) =>
                "ignored_low_comfort" === e.type && e.context?.employeeId === t.id && Date.now() - e.timestamp < 6e5
        ) ||
            StoryEngine.trackAction("ignored_low_comfort", {
                employeeId: t.id,
                employeeName: t.name,
                comfortLevel: t.stats?.comfort || 30,
            });
    }
    const n = e.find((e) => (e.stats?.trust || 50) < 25);
    if (n) {
        (gameState.story.actionLog || []).find(
            (e) =>
                "ignored_low_trust" === e.type && e.context?.employeeId === n.id && Date.now() - e.timestamp < 6e5
        ) ||
            StoryEngine.trackAction("ignored_low_trust", {
                employeeId: n.id,
                employeeName: n.name,
                trustLevel: n.stats?.trust || 25,
            });
    }
    if ((StoryEngine.updateStoryUI(), Math.random() < 0.05 && e.length >= 3)) {
        const t = e.reduce((e, t) => e + (t.stats?.trust || 50), 0) / e.length,
            n = e.reduce((e, t) => e + (t.stats?.productivity || 70), 0) / e.length;
        n > 85 &&
            !gameState.story.narrativeFlags.high_performance_noted &&
            Math.random() < 0.3 &&
            ((gameState.story.narrativeFlags.high_performance_noted = !0),
            StoryEngine.addJournalEntry({
                title: "🚀 Peak Performance",
                content: `Your team is operating at exceptional levels. Average productivity: ${n.toFixed(0)}%. They move with purpose and precision. This is what success looks like.`,
                type: "consequence",
                memorable: !0,
            })),
            t < 35 &&
                !gameState.story.narrativeFlags.trust_crisis_noted &&
                Math.random() < 0.3 &&
                ((gameState.story.narrativeFlags.trust_crisis_noted = !0),
                StoryEngine.addJournalEntry({
                    title: "🥶 Cold Shoulders",
                    content:
                        "The office feels different. Conversations stop when you enter rooms. Eye contact is avoided. Trust is fragile - once broken, it's hard to rebuild.",
                    type: "consequence",
                    memorable: !0,
                }));
    }
}
function onStoryEmployeeHired(e) {
    if (!gameState.story?.settings?.storyEnabled) return;
    const t = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus).length,
        n = e.firedDate || "alumni" === e.employmentStatus;
    StoryEngine.trackAction(n ? "rehired_former_employee" : "hired_employee", {
        employeeId: e.id,
        employeeName: e.name,
        totalEmployees: t,
        isRehire: n,
    }),
        1 !== t || gameState.story.narrativeFlags.firstHireComplete || StoryEngine.triggerSpineEvent("first_hire"),
        t <= 5 &&
            (gameState.story.keyCharacters.find((t) => t.id === e.id) ||
                gameState.story.keyCharacters.push({
                    id: e.id,
                    name: e.name,
                    role: "Early Believer",
                    introduced: Date.now(),
                    relationship: "employee",
                }));
}
function onStoryBossDefeated(e, t) {
    gameState.story?.settings?.storyEnabled &&
        (StoryEngine.trackAction("defeated_boss", { bossId: e, recruited: t }),
        t
            ? (StoryEngine.trackAction("recruited_boss", { bossId: e }),
              StoryEngine.trackAction("showed_mercy", { bossId: e }))
            : StoryEngine.trackAction("showed_no_mercy", { bossId: e }),
        gameState.story.narrativeFlags.firstBossDefeated ||
            ((gameState.story.narrativeFlags.firstBossDefeated = !0),
            StoryEngine.addJournalEntry({
                title: "⚔️ First Victory",
                content: "You've defeated your first major adversary. The business world is taking notice.",
                type: "event",
                memorable: !0,
            })),
        ("victoria_steele" !== e && "office_suite" !== e) ||
            ((gameState.story.narrativeFlags.victoriaDefeated = !0),
            t && (gameState.story.narrativeFlags.victoriaRecruited = !0)));
}
function onStoryPrestige(e) {
    if (!gameState.story?.settings?.storyEnabled) return;
    gameState.story.persistentMemories.push({
        timeline: gameState.story.currentTimeline,
        keyEvents: gameState.story.journal.filter((e) => e.memorable),
        ending: StoryEngine.getAlignmentInfo(gameState.story.moralScore).name,
        moralScore: gameState.story.moralScore,
        timestamp: Date.now(),
    }),
        gameState.story.currentTimeline++;
    const t = gameState.story.persistentMemories,
        n = gameState.story.currentTimeline;
    (gameState.story = StoryEngine.getDefaultStoryState()),
        (gameState.story.persistentMemories = t),
        (gameState.story.currentTimeline = n),
        (gameState.story.narrativeFlags.firstPrestigeComplete = !0),
        StoryEngine.emergentCooldowns && StoryEngine.emergentCooldowns.clear();
    const a = ["firstPrestigeComplete"];
    Object.keys(gameState.story.narrativeFlags).forEach((e) => {
        a.includes(e) || delete gameState.story.narrativeFlags[e];
    });
    const o = document.getElementById("memoriesSection");
    o && (o.style.display = "block"),
        StoryEngine.addJournalEntry({
            title: "🌀 New Timeline",
            content: `Timeline ${n} begins. Echoes of past choices ripple through time...`,
            type: "act_transition",
            memorable: !0,
        });
    const i = StoryEngine.getTimelineEchoes();
    i.length > 0 &&
        setTimeout(() => {
            StoryEngine.addJournalEntry({
                title: "👻 Echoes of the Past",
                content: i[0].message,
                type: "spine",
                memorable: !0,
            });
        }, 5e3);
}
function initializeDynamicEventSystem() {
    return (
        gameState.dynamicEvents ||
            (gameState.dynamicEvents = {
                queue: [],
                generating: null,
                history: [],
                nextGenerationTime: Date.now() + 6e4,
                generationCooldown: 3e5,
                dismissedCount: 0,
                viewedTotal: 0,
                lastNotificationTime: 0,
            }),
        gameState.dynamicEvents
    );
}
(minigameStyles.textContent =
    "\n    @keyframes reflexPop {\n      0% { transform: scale(0); opacity: 0; }\n      50% { transform: scale(1.2); }\n      100% { transform: scale(1); opacity: 1; }\n    }\n  "),
    document.head.appendChild(minigameStyles),
    (window.StoryEngine = StoryEngine),
    (window.filterJournal = function (e) {
        document.querySelectorAll(".journal-filter-btn").forEach((e) => {
            e.classList.remove("active");
        });
        const t = document.querySelector(`.journal-filter-btn[data-filter="${e}"]`);
        t && t.classList.add("active"),
            document.querySelectorAll(".journal-entry").forEach((t) => {
                t.style.display = "all" === e || t.dataset.type === e ? "block" : "none";
            });
    }),
    (window.showActDetails = function (e) {
        const t = StoryEngine.ACT_CONFIG[e];
        if (!t) return;
        const n = (gameState.story.actData[e] || {}).spineEventsTriggered || [],
            a = gameState.story.currentAct === e,
            o = e > gameState.story.currentAct,
            i = e < gameState.story.currentAct;
        let s = "";
        if (o)
            s = '<p style="color: var(--text-mute); font-style: italic;">🔒 Story events locked until you reach this act.</p>';
        else {
            StoryEngine.ACT_CONFIG[e];
            s =
                n.length > 0
                    ? n
                          .map(
                              (e) =>
                                  `<div style="padding: 4px 0; border-bottom: 1px solid var(--border);">✅ ${e.replace(/_/g, " ").replace(/\\b\\w/g, (e) => e.toUpperCase())}</div>`
                          )
                          .join("")
                    : '<p style="color: var(--text-mute);">No major events triggered yet.</p>';
        }
        const r = document.createElement("div");
        (r.id = "actDetailsModal"),
            (r.style.cssText =
                "\n      position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: var(--l-veil-85); z-index: 10000; display: flex;\n      justify-content: center; align-items: center; animation: fadeIn 0.3s ease;\n    "),
            (r.innerHTML = `\n      <div style="background: linear-gradient(135deg, var(--l-panel), var(--l-panel-2)); border: 2px solid ${i ? "var(--l-teal)" : a ? "var(--l-indigo)" : "var(--l-neutral-4)"}; \n                  border-radius: 16px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;\n                  box-shadow: 0 20px 60px var(--l-veil-50);">\n        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">\n          <h2 style="margin: 0; color: ${i ? "var(--l-teal)" : a ? "var(--l-indigo)" : "var(--l-neutral-8)"};">\n            ${i ? "✓" : a ? "▶️" : "🔒"} Act ${e}: ${t.name}\n          </h2>\n          <button onclick="document.getElementById('actDetailsModal').remove()" \n                  style="background: none; border: none; color: var(--text-mute); font-size: 24px; cursor: pointer;">&times;</button>\n        </div>\n        \n        <p style="color: var(--text-dim); margin-bottom: 16px; line-height: 1.6;">${t.description}</p>\n        \n        <div style="background: var(--l-veil-30); border-radius: 8px; padding: 12px; margin-bottom: 16px;">\n          <div style="color: var(--text-mute); font-size: 12px; margin-bottom: 8px;">STATUS</div>\n          <div style="color: ${i ? "var(--l-teal)" : a ? "var(--l-gold)" : "var(--l-neutral-6)"}; font-weight: bold;">\n            ${i ? "✅ Completed" : a ? "🎭 In Progress" : "🔒 Locked"}\n          </div>\n        </div>\n        \n        <div style="background: var(--l-veil-30); border-radius: 8px; padding: 12px; margin-bottom: 16px;">\n          <div style="color: var(--text-mute); font-size: 12px; margin-bottom: 8px;">THEMES</div>\n          <div style="display: flex; flex-wrap: wrap; gap: 6px;">\n            ${(t.themes || []).map((e) => `<span style="background: rgba(102,126,234,0.2); color: var(--l-indigo); padding: 4px 8px; border-radius: 12px; font-size: 11px;">${e}</span>`).join("")}\n          </div>\n        </div>\n        \n        <div style="background: var(--l-veil-30); border-radius: 8px; padding: 12px;">\n          <div style="color: var(--text-mute); font-size: 12px; margin-bottom: 8px;">STORY EVENTS</div>\n          ${s}\n        </div>\n      </div>\n    `),
            r.addEventListener("click", (e) => {
                e.target === r && r.remove();
            }),
            document.body.appendChild(r);
    });
const EVENT_CATEGORIES = [
        "office incident",
        "interpersonal drama",
        "business opportunity",
        "employee personal issue",
        "tech/IT problem",
        "HR situation",
        "celebration",
        "crisis",
        "romantic/spicy situation",
        "legal matter",
        "community/charity",
        "workplace prank",
        "mysterious occurrence",
        "family dynamics",
    ],
    EVENT_TONES = ["serious", "humorous", "dramatic", "heartwarming", "spicy", "mysterious", "urgent"];
function buildEventGenerationContext() {
    const e = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus),
        t = (gameState.dynamicEvents?.history || []).slice(0, 5);
    let n = null;
    const a = (gameState.story?.eventChains || []).filter(
        (e) => "open" === e.status && Date.now() - e.lastEventTime > 18e4 && e.sequelsPending > 0
    );
    if (a.length > 0 && Math.random() < 0.25) {
        const e = a[Math.floor(Math.random() * a.length)];
        n = {
            chainId: e.id,
            originalEvent: e.originalEvent,
            lastEvent: e.lastEvent,
            theme: e.theme,
            involvedCharacters: e.involvedCharacters,
            playerStance: e.playerStance,
            sequelNumber: e.sequelCount + 1,
        };
    }
    const o = (gameState.story?.recurringCharacters || []).filter((e) => e.eventCount >= 2).slice(0, 3),
        i = [...e].sort(() => Math.random() - 0.5);
    let s;
    if (n && n.involvedCharacters?.length > 0) {
        const t = n.involvedCharacters,
            a = e.filter((e) => t.includes(e.id) || t.includes(e.name));
        s = [...a, ...i.filter((e) => !a.includes(e))].slice(0, 4);
    } else if (o.length > 0 && Math.random() < 0.4) {
        const t = e.filter((e) => o.some((t) => t.id === e.id));
        s = [...t, ...i.filter((e) => !t.includes(e))].slice(0, 4);
    } else s = i.slice(0, Math.min(4, e.length));
    const r = s.map((t) => {
            t.performanceScore;
            const n = [];
            (t.stats?.affection || 50) > 70 && n.push("very affectionate"),
                (t.stats?.trust || 50) < 30 && n.push("distrustful"),
                (t.stats?.productivity || 50) > 80 && n.push("high performer"),
                (t.stats?.comfort || 50) < 30 && n.push("uncomfortable at work"),
                t.career?.level >= 4 && n.push("senior employee"),
                t.inRelationshipWithPlayer && n.push("in relationship with player");
            const a = o.find((e) => e.id === t.id);
            a && n.push(`appeared in ${a.eventCount} previous events`);
            let i = null;
            if (t.familyRelations && Object.keys(t.familyRelations).length > 0) {
                const a = [];
                for (const [o, i] of Object.entries(t.familyRelations)) {
                    const t = e.find((e) => e.id === o);
                    t && (a.push({ name: t.name, relation: i }), n.push(`has ${i} (${t.name}) at company`));
                }
                a.length > 0 && (i = a);
            }
            return {
                id: t.id,
                name: t.name,
                role: t.career?.title || "Employee",
                department: t.productManaged || "General",
                personality: t.personality || "professional",
                traits: n,
                backstory: t.backstory ? t.backstory.substring(0, 150) : null,
                familyAtWork: i,
            };
        }),
        l = e.filter(
            (t) => t.familyRelations && Object.keys(t.familyRelations).some((t) => e.some((e) => e.id === t))
        ),
        c = [],
        d = new Set();
    l.forEach((t) => {
        for (const [n, a] of Object.entries(t.familyRelations || {})) {
            const o = e.find((e) => e.id === n);
            if (o) {
                const e = [t.id, o.id].sort().join("-");
                if (!d.has(e)) {
                    d.add(e);
                    let n = null,
                        i = null,
                        s = a;
                    const r = t.age || 30,
                        l = o.age || 30;
                    ["mother", "father", "parent"].includes(a.toLowerCase())
                        ? ((n = o), (i = t), (s = "male" === o.gender ? "father" : "mother"))
                        : ["daughter", "son", "child"].includes(a.toLowerCase())
                          ? ((n = t), (i = o), (s = "male" === o.gender ? "son" : "daughter"))
                          : r > l + 15
                            ? ((n = t), (i = o))
                            : l > r + 15 && ((n = o), (i = t)),
                        c.push({
                            emp1: { id: t.id, name: t.name, age: r, role: t.career?.title || "Employee" },
                            emp2: { id: o.id, name: o.name, age: l, role: o.career?.title || "Employee" },
                            relationship: a,
                            parentChildContext:
                                n && i
                                    ? {
                                          parent: {
                                              name: n.name,
                                              age: n.age || 30,
                                              role: n.career?.title || "Employee",
                                          },
                                          child: {
                                              name: i.name,
                                              age: i.age || 30,
                                              role: i.career?.title || "Employee",
                                          },
                                          roleReversal: (i.career?.level || 0) > (n.career?.level || 0),
                                          roleReversalNote:
                                              (i.career?.level || 0) > (n.career?.level || 0)
                                                  ? `NOTE: ${i.name} (the child) outranks ${n.name} (the parent) at work!`
                                                  : null,
                                      }
                                    : null,
                        });
                }
            }
        }
    });
    const p = {
        cash: gameState.cash,
        cashFormatted: formatCash(gameState.cash),
        employeeCount: e.length,
        isStruggling: gameState.cash < 1e4,
        isThriving: gameState.cash > 5e5,
        hasOfficeCat: gameState.dynamicEvents?.officeCat || !1,
        recentEventTypes: t.map((e) => e.category).filter(Boolean),
        hasFamilyMembers: c.length > 0,
    };
    let m;
    const u = gameState.story?.familyEventCooldown || 18e5,
        g = gameState.story?.lastFamilyEventTime || 0,
        h = gameState.story?.consecutiveFamilyEvents || 0,
        y = Date.now() - g < u,
        f = h >= 2,
        b = 2 * c.length,
        v = 0.1 * Math.min(1, b / e.length);
    m =
        c.length > 0 && !y && !f && Math.random() < v
            ? "family dynamics"
            : EVENT_CATEGORIES[Math.floor(Math.random() * EVENT_CATEGORIES.length)];
    const w = EVENT_TONES[Math.floor(Math.random() * EVENT_TONES.length)],
        x = !1 !== gameState.settings?.adultContent;
    return {
        employees: r,
        company: p,
        suggestedCategory: n ? n.theme : m,
        suggestedTone: w,
        allowSpicy: x,
        recentEvents: t.map((e) => e.title).slice(0, 3),
        sequelContext: n,
        recurringCharacters: o.map((e) => e.name),
        familyPairs: c,
        hasFamilyAtCompany: c.length > 0,
    };
}
function registerEventChain(e, t = {}) {
    if (!gameState.story) return;
    gameState.story.eventChains || (gameState.story.eventChains = []);
    const n = t.existingChainId || "chain_" + Date.now(),
        a = gameState.story.eventChains.find((e) => e.id === n);
    a
        ? ((a.lastEvent = { title: e.title, id: e.id }),
          (a.lastEventTime = Date.now()),
          a.sequelCount++,
          (a.sequelsPending = Math.max(0, a.sequelsPending - 1)),
          (a.sequelsPending <= 0 || a.sequelCount >= 3) && (a.status = "complete"))
        : gameState.story.eventChains.push({
              id: n,
              originalEvent: { title: e.title, id: e.id },
              lastEvent: { title: e.title, id: e.id },
              theme: e.category || "general",
              involvedCharacters: e.involvedEmployeeIds || [],
              playerStance: t.playerStance || "neutral",
              startTime: Date.now(),
              lastEventTime: Date.now(),
              sequelCount: 0,
              sequelsPending: t.sequelsPending || Math.floor(2 * Math.random()) + 1,
              status: "open",
          }),
        (gameState.story.eventChains = gameState.story.eventChains.filter(
            (e) => "open" === e.status || Date.now() - e.lastEventTime < 6048e5
        ));
}
async function generateDynamicEvent() {
    if (gameState.settings?.disableStoryEvents) return null;
    const e = initializeDynamicEventSystem();
    if (e.generating || e.queue.length >= 3) return null;
    const t = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus).length;
    if (gameState.cash < 3e4 || t < 5) return null;
    e.generating = { startTime: Date.now(), status: "building_context" };
    try {
        const t = buildEventGenerationContext();
        if (0 === t.employees.length) return (e.generating = null), null;
        e.generating.status = "generating_event";
        const n = t.sequelContext
                ? `\n⚠️ THIS IS A SEQUEL EVENT - Continue an existing storyline!\n═══════════════════════════════════════════════════════════\nOriginal Event: "${t.sequelContext.originalEvent.title}"\nLast Event: "${t.sequelContext.lastEvent.title}"\nTheme: ${t.sequelContext.theme}\nCharacters to feature: ${t.sequelContext.involvedCharacters.join(", ")}\nPlayer's previous stance: ${t.sequelContext.playerStance}\nThis is sequel #${t.sequelContext.sequelNumber}\n\n🔗 NARRATIVE COHERENCE REQUIREMENTS:\n1. The event MUST be a DIRECT continuation of "${t.sequelContext.lastEvent.title}"\n2. Reference SPECIFIC details/consequences from the previous event\n3. The same core conflict/situation should drive this event\n4. Characters should acknowledge and react to what happened before\n5. ${t.sequelContext.sequelNumber >= 2 ? "This is the CLIMAX/RESOLUTION - bring the storyline to a meaningful conclusion!" : "ESCALATE the situation - raise the stakes, deepen the conflict!"}\n\n❌ DON'T: Create a tangentially related "meanwhile" event\n❌ DON'T: Just name-drop the previous event without real connection\n❌ DON'T: Introduce completely new unrelated plot threads\n✅ DO: Show cause and effect from previous choices\n✅ DO: Have characters reference specific past events by detail\n✅ DO: Make this feel like Chapter 2 (or 3) of the SAME story\n═══════════════════════════════════════════════════════════\n`
                : "",
            a =
                t.recurringCharacters?.length > 0
                    ? `\nRECURRING CHARACTERS (appeared in multiple events, players know them well):\n${t.recurringCharacters.join(", ")}\nConsider featuring them for narrative continuity.\n`
                    : "",
            o = t.hasFamilyAtCompany
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
                          )}\n${"family dynamics" === t.suggestedCategory ? "⚠️ CREATE AN EVENT FEATURING THIS FAMILY DYNAMIC!\nCRITICAL: Respect the PARENT/CHILD roles listed above. The PARENT is the older one. The CHILD is the younger one.\nIf the child outranks the parent at work, explore that interesting power dynamic!\nConsider: parent-child workplace boundaries, family loyalty vs professional duty, favoritism accusations, protecting family members, or generational workplace differences." : "You may incorporate family dynamics if it fits naturally."}\n`
                : "",
            i = getCustomWorldContext("full"),
            s = (gameState.employees || [])
                .filter(
                    (e) =>
                        "active" === e.employmentStatus &&
                        e.npcStatus &&
                        "sleeping" !== e.npcStatus.current &&
                        "vampire_rest" !== e.npcStatus.current
                )
                .slice(0, 8)
                .map((e) => `${e.name}: ${e.npcStatus.label}`),
            r =
                s.length > 0
                    ? `\nCURRENT NPC ACTIVITIES (use for realistic event grounding):\n${s.join("; ")}\nA story event can reference or be triggered by these activities — e.g., two NPCs both listed as "Out with Friends" could have a chance encounter.\n`
                    : "",
            l = `You are creating a dynamic company event for an office management game.\n${i ? `\n${i}` : ""}\nCOMPANY STATE:\n- Cash: ${t.company.cashFormatted}\n- Employees: ${t.company.employeeCount}\n- Status: ${t.company.isStruggling ? "Struggling financially" : t.company.isThriving ? "Very successful" : "Stable"}\n${t.company.hasOfficeCat ? "- Has an office cat named Mr. Whiskers" : ""}\n${t.company.hasFamilyMembers ? "- Has family members working together" : ""}\n\nFEATURED EMPLOYEES (use 1-3 of these):\n${t.employees.map((e) => `- ${e.name} (${e.role}${e.traits.length > 0 ? ", " + e.traits.join(", ") : ""})`).join("\n")}\n${a}${o}\nRECENT EVENTS TO AVOID REPEATING: ${t.recentEvents.length > 0 ? t.recentEvents.join(", ") : "None yet"}\n${r}${n}\nGENERATE AN EVENT with these guidelines:\n- Category hint: ${t.suggestedCategory}\n- Tone hint: ${t.suggestedTone}\n${t.allowSpicy ? "- Can include mild romantic/spicy elements if appropriate" : "- Keep it workplace appropriate"}\n- Be creative and engaging\n- Ground it in the employees and company state provided\n- Make it feel personal and memorable\n${t.sequelContext ? "- IMPORTANT: This MUST reference and continue from the previous event!" : ""}\n\nRESPOND IN THIS EXACT JSON FORMAT:\n{\n  "title": "Short catchy title with emoji",\n  "description": "2-3 sentences describing what's happening. Be vivid and engaging. Reference specific employees by name.",\n  "category": "one of: incident, interpersonal, business, personal, tech, legal, celebration, crisis, romantic, mystery",\n  "tone": "one of: serious, humorous, dramatic, heartwarming, spicy, mysterious, urgent",\n  "involvedEmployeeNames": ["name1", "name2"],\n  "isSequel": ${t.sequelContext ? "true" : "false"},\n  "canHaveSequel": true,\n  "choices": [\n    {"id": "a", "text": "First option with cost if any (e.g., 💰 Fix it properly ($5000))", "costPercent": 0},\n    {"id": "b", "text": "Second option - different approach", "costPercent": 0.5},\n    {"id": "c", "text": "Third option - perhaps risky or cheap", "costPercent": 0}\n  ],\n  "imagePrompt": "A detailed prompt to generate an image for this event, describe the scene visually"\n}\n\ncostPercent is a decimal from 0 to 2 representing what % of current company cash this option might cost (0 = free, 0.01 = 1%, etc).\nMake costs realistic - minor things should be cheap, major decisions expensive.`,
            c = await queuedGenerateText(l);
        if (!c) return (e.generating = null), null;
        let d;
        try {
            let e = c;
            const t = c.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (t) e = t[1].trim();
            else {
                const t = c.match(/\{[\s\S]*\}/);
                t && (e = t[0]);
            }
            d = JSON.parse(e);
        } catch (t) {
            return console.error("[DynamicEvents] Failed to parse AI response:", t), (e.generating = null), null;
        }
        e.generating.status = "generating_image";
        let p = null;
        try {
            if (d.imagePrompt) {
                const e = `Office scene: ${d.imagePrompt}. Professional modern office setting.`;
                p = await queuedGenerateImage(
                    "function" == typeof applyImageStyle ? applyImageStyle(e) : e,
                    `Event Image: ${d.title}`
                );
            }
        } catch (e) {
            console.error("[DynamicEvents] Image generation failed:", e);
        }
        e.generating.status = "judging_event";
        const m = await judgeEventQuality(d);
        if (m.total < 20)
            return (
                console.log("[DynamicEvents] Event rejected by judge (score too low):", m),
                (e.generating = null),
                null
            );
        e.generating.status = "generating_outcomes";
        const u = `For this office event, generate the outcomes for each choice.\n\nEVENT: ${d.title}\nDESCRIPTION: ${d.description}\nINVOLVED EMPLOYEES: ${d.involvedEmployeeNames.join(", ")}\n\nCHOICES:\n${d.choices.map((e, t) => `${t + 1}. ${e.text}`).join("\n")}\n\nFor each choice, generate:\n1. A 1-2 sentence outcome description (what happens as a result)\n2. Effects on company morale (productivity, comfort, affection, trust) as numbers from -20 to +20\n3. Effects on the involved employees specifically\n\nRESPOND IN JSON:\n{\n  "outcomes": [\n    {\n      "choiceId": "a",\n      "text": "What happens when they choose this option...",\n      "companyEffects": {"productivity": 5, "comfort": 0, "affection": 10, "trust": 0},\n      "employeeEffects": [{"name": "EmployeeName", "stat": "affection", "change": 15, "reason": "brief reason"}],\n      "duration": 7\n    },\n    ...for each choice\n  ]\n}`,
            g = await queuedGenerateText(u);
        let h = [];
        try {
            let e = g;
            const t = g.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (t) e = t[1].trim();
            else {
                const t = g.match(/\{[\s\S]*\}/);
                t && (e = t[0]);
            }
            const n = JSON.parse(e);
            h = n.outcomes || [];
        } catch (e) {
            console.error("[DynamicEvents] Failed to parse outcomes:", e),
                (h = d.choices.map((e) => ({
                    choiceId: e.id,
                    text: "The situation resolved.",
                    companyEffects: {},
                    employeeEffects: [],
                    duration: 7,
                })));
        }
        const y = gameState.cash;
        d.choices = d.choices.map((e, t) => ({
            ...e,
            cost: Math.floor(y * (e.costPercent || 0)),
            outcome: h.find((t) => t.choiceId === e.id) ||
                h[t] || {
                    text: "The situation was handled.",
                    companyEffects: {},
                    employeeEffects: [],
                    duration: 7,
                },
        }));
        const f = d.involvedEmployeeNames
                .map((e) => {
                    const t = gameState.employees.find((t) => t.name.toLowerCase() === e.toLowerCase());
                    return t?.id;
                })
                .filter(Boolean),
            b = {
                id: "dyn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
                title: d.title,
                description: d.description,
                category: d.category,
                tone: d.tone,
                imageUrl: p,
                involvedEmployeeIds: f,
                choices: d.choices,
                judgeScore: m,
                generatedAt: Date.now(),
                status: "pending",
                resolved: !1,
                isSequel: d.isSequel || !1,
                canHaveSequel: !1 !== d.canHaveSequel,
                chainId: t.sequelContext?.chainId || null,
            };
        return (
            b.canHaveSequel && !b.isSequel
                ? Math.random() < 0.35 &&
                  registerEventChain(b, { sequelsPending: Math.floor(2 * Math.random()) + 1 })
                : b.isSequel &&
                  t.sequelContext &&
                  registerEventChain(b, { existingChainId: t.sequelContext.chainId }),
            e.queue.push(b),
            (e.generating = null),
            (e.nextGenerationTime = Date.now() + e.generationCooldown),
            updateEventBellNotification(),
            showEventCornerNotification(b),
            console.log(
                "[DynamicEvents] New event generated:",
                b.title,
                "Score:",
                m.total,
                b.isSequel ? "(SEQUEL)" : ""
            ),
            b
        );
    } catch (t) {
        return console.error("[DynamicEvents] Generation failed:", t), (e.generating = null), null;
    }
}
async function judgeEventQuality(e) {
    const t = `You are an AI Judge evaluating a generated office event for a game.\n\nEVENT:\nTitle: ${e.title}\nDescription: ${e.description}\nCategory: ${e.category}\nChoices offered: ${e.choices.map((e) => e.text).join(" | ")}\n\nRate this event on each criterion from 1-10:\n- Creativity: How original and unexpected is this event?\n- Impact: Does this feel like it matters to the player?\n- Fun: Would a player enjoy this event?\n- Quality: Is the writing good? Does it make sense?\n\nRESPOND IN JSON ONLY:\n{"creativity": 7, "impact": 6, "fun": 8, "quality": 7, "notes": "brief comment"}`;
    try {
        const e = await queuedGenerateText(t);
        let n = e;
        const a = e.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (a) n = a[1].trim();
        else {
            const t = e.match(/\{[\s\S]*\}/);
            t && (n = t[0]);
        }
        const o = JSON.parse(n);
        return {
            creativity: Math.min(10, Math.max(1, o.creativity || 5)),
            impact: Math.min(10, Math.max(1, o.impact || 5)),
            fun: Math.min(10, Math.max(1, o.fun || 5)),
            quality: Math.min(10, Math.max(1, o.quality || 5)),
            total: (o.creativity || 5) + (o.impact || 5) + (o.fun || 5) + (o.quality || 5),
            notes: o.notes || "",
        };
    } catch (e) {
        return (
            console.error("[DynamicEvents] Judge failed:", e),
            { creativity: 5, impact: 5, fun: 5, quality: 5, total: 20, notes: "Auto-scored" }
        );
    }
}
function updateEventBellNotification() {
    if (gameState.settings?.disableStoryEvents) {
        const e = document.getElementById("eventBellDot"),
            t = document.getElementById("eventBellCount"),
            n = document.getElementById("eventBellBtn");
        return (
            e && (e.style.display = "none"),
            t && (t.style.display = "none"),
            void (n && (n.style.animation = "none"))
        );
    }
    let e = 0;
    void 0 !== StoryEngine && StoryEngine.getMinorEventCount && (e += StoryEngine.getMinorEventCount());
    e += initializeDynamicEventSystem().queue.filter((e) => "pending" === e.status).length;
    const t = document.getElementById("eventBellBtn"),
        n = document.getElementById("eventBellDot"),
        a = document.getElementById("eventBellCount");
    t &&
        (e > 0
            ? (n && (n.style.display = "block"),
              a && ((a.textContent = e), (a.style.display = "flex")),
              (t.style.animation = "bellGlow 2s infinite"),
              (t.title = `${e} new event${e > 1 ? "s" : ""} waiting!`))
            : (n && (n.style.display = "none"),
              a && (a.style.display = "none"),
              (t.style.animation = "none"),
              (t.title = "Company Events")));
}
function showEventCornerNotification(e) {
    if (gameState.settings?.disableStoryEvents) return;
    const t = initializeDynamicEventSystem();
    if (Date.now() - t.lastNotificationTime < 1e4) return;
    t.lastNotificationTime = Date.now();
    const n = document.createElement("div");
    (n.className = "event-corner-notification"),
        (n.style.cssText =
            "\n      position: fixed;\n      bottom: 20px;\n      right: 20px;\n      background: linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%);\n      border: 2px solid var(--l-indigo);\n      border-radius: 12px;\n      padding: 15px 20px;\n      max-width: 350px;\n      z-index: 99999;\n      cursor: pointer;\n      animation: slideInRight 0.4s ease-out, fadeOut 0.5s ease-in 8s forwards;\n      box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);\n    "),
        (n.innerHTML = `\n      <div style="display:flex; align-items:center; gap:12px;">\n        <div style="font-size:2rem;">🔔</div>\n        <div style="flex:1;">\n          <div style="color:var(--l-indigo); font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">New Event</div>\n          <div style="color:var(--l-ink); font-size:0.95rem; font-weight:600; margin-top:3px;">${e.title}</div>\n          <div style="color:var(--text-dim); font-size:0.8rem; margin-top:4px;">Click to view</div>\n        </div>\n        <button onclick="event.stopPropagation(); this.parentElement.parentElement.remove();" \n                style="background:transparent; border:none; color:var(--text-mute); font-size:1.2rem; cursor:pointer; padding:5px;">×</button>\n      </div>\n    `),
        (n.onclick = () => {
            n.remove(), openEventPanel();
        }),
        document.body.appendChild(n),
        setTimeout(() => {
            n.parentElement && n.remove();
        }, 9e3);
}
function showDynamicEventModal(e, t) {
    const n = document.getElementById("eventPanelModal");
    n && n.remove();
    const a = (e.involvedEmployeeIds || []).map((e) => gameState.employees.find((t) => t.id === e)).filter(Boolean),
        o = document.createElement("div");
    (o.id = "eventPanelModal"),
        (o.style.cssText =
            "\n      position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: var(--l-veil-90); z-index: 100000;\n      display: flex; justify-content: center; align-items: center;\n      animation: fadeIn 0.3s ease-out;\n      padding: 20px;\n      box-sizing: border-box;\n    ");
    let i = "";
    a.length > 0 &&
        (i = `\n        <div style="display:flex; justify-content:center; gap:15px; margin:15px 0;">\n          ${a.map((e) => `\n            <div style="text-align:center;">\n              <img src="${e.profileImage || e.generatedPortrait || placeholderImage(70, 70)}" \n                   style="width:60px; height:60px; border-radius:50%; border:3px solid var(--l-indigo); object-fit:cover;">\n              <div style="font-size:0.75rem; color:var(--l-ink); margin-top:5px;">${e.name}</div>\n              <div style="font-size:0.65rem; color:var(--text-dim);">${e.career?.title || "Employee"}</div>\n            </div>\n          `).join("")}\n        </div>\n      `);
    let s = "";
    e.imageUrl &&
        (s = `\n        <div style="margin:15px 0; border-radius:10px; overflow:hidden;">\n          <img src="${e.imageUrl}" style="width:100%; max-height:200px; object-fit:cover;">\n        </div>\n      `);
    const r = e.choices
            .map((t, n) => {
                const a = gameState.cash >= (t.cost || 0),
                    o = t.cost > 0 ? formatCash(t.cost) : "",
                    i = t.minigame && void 0 !== StoryMinigames,
                    s = i ? StoryMinigames.GAME_TYPES[t.minigame.type]?.icon || "🎮" : "",
                    r = i
                        ? `\n        <span style="\n          display: inline-flex; align-items: center; gap: 4px;\n          background: linear-gradient(135deg, #667eea33, #764ba233);\n          padding: 3px 8px; border-radius: 12px;\n          font-size: 0.7rem; color: var(--l-ink-on-fill);\n          margin-left: 8px;\n        ">${s} Skill Check</span>\n      `
                        : "";
                return `\n        <button onclick="resolveDynamicEvent('${e.id}', ${n}, null)"\n                style="width:100%; padding:14px 16px; margin:6px 0; \n                       background:${a ? "var(--l-panel-2)" : "var(--l-panel)"}; \n                       border:2px solid ${a ? "var(--l-indigo)" : "var(--l-neutral-4)"}; \n                       border-radius:10px; color:${a ? "var(--l-ink)" : "var(--l-neutral-6)"}; \n                       cursor:${a ? "pointer" : "not-allowed"}; \n                       font-size:0.9rem; text-align:left;\n                       transition: all 0.2s ease;\n                       display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;\n                       ${a ? "" : "opacity:0.6;"}"\n                ${a ? "" : "disabled"}\n                onmouseenter="if(!this.disabled){this.style.borderColor='var(--l-red)'; this.style.transform='translateX(5px)';}"\n                onmouseleave="if(!this.disabled){this.style.borderColor='var(--l-indigo)'; this.style.transform='translateX(0)';}">\n          <span style="display:flex; align-items:center;">${t.text}${r}</span>\n          ${o ? `<span style="color:var(--l-pink); font-size:0.8rem; margin-left:10px;">${o}</span>` : ""}\n        </button>\n      `;
            })
            .join(""),
        l = e.judgeScore
            ? `\n      <div style="position:absolute; top:15px; right:15px; background:var(--l-veil-50); padding:6px 10px; border-radius:8px; font-size:0.7rem;">\n        <span style="color:var(--accent-gold);">★</span> <span style="color:var(--text-dim);">${e.judgeScore.total}/40</span>\n      </div>\n    `
            : "",
        c =
            {
                incident: "var(--l-orange-3)",
                interpersonal: "var(--l-red)",
                business: "var(--l-green)",
                personal: "var(--l-indigo)",
                tech: "var(--l-cyan)",
                legal: "var(--l-red-4)",
                celebration: "var(--l-gold)",
                crisis: "#ff0000",
                romantic: "var(--l-pink)",
                mystery: "var(--l-violet-2)",
            }[e.category] || "var(--l-indigo)",
        d = document.createElement("div");
    (d.style.cssText = `\n      background: linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%);\n      border-radius: 15px; max-width: 550px; width: 100%;\n      padding: 25px; position: relative;\n      border: 2px solid ${c};\n      box-shadow: 0 20px 60px var(--l-veil-50);\n      max-height: 90vh; overflow-y: auto;\n    `),
        (d.innerHTML = `\n      ${l}\n      \n      <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">\n        <span style="background:${c}; color:var(--l-ink); padding:4px 10px; border-radius:20px; font-size:0.7rem; text-transform:uppercase;">\n          ${e.category || "Event"}\n        </span>\n        ${t > 1 ? `<span style="color:var(--text-dim); font-size:0.75rem;">+${t - 1} more</span>` : ""}\n        <button onclick="dismissDynamicEvent('${e.id}')" \n                style="margin-left:auto; background:transparent; border:none; color:var(--text-mute); cursor:pointer; font-size:0.8rem;"\n                title="Dismiss this event">\n          Skip →\n        </button>\n      </div>\n      \n      <h2 style="margin:0 0 10px 0; color:var(--l-ink); font-size:1.4rem;">\n        ${e.title}\n      </h2>\n      \n      ${s}\n      ${i}\n      \n      <p style="color:var(--l-ink-dim); font-size:0.9rem; line-height:1.6; margin-bottom:20px;">\n        ${e.description}\n      </p>\n      \n      <div style="border-top:1px solid var(--border); padding-top:15px;">\n        <div style="color:var(--text-dim); font-size:0.75rem; margin-bottom:8px;">Choose your response:</div>\n        ${r}\n        \n        \x3c!-- Open-ended response option --\x3e\n        <div style="margin-top:15px; padding-top:15px; border-top:1px dashed var(--l-neutral-3);">\n          <div style="color:var(--text-dim); font-size:0.75rem; margin-bottom:8px;">Or take a different approach:</div>\n          <div style="display:flex; gap:8px;">\n            <input type="text" id="customResponseInput" placeholder="Type your own action..." \n                   style="flex:1; padding:12px; background:var(--l-bg); border:2px solid var(--border); border-radius:8px; \n                          color:var(--l-ink); font-size:0.9rem;"\n                   onkeypress="if(event.key==='Enter') resolveDynamicEvent('${e.id}', -1, this.value)">\n            <button onclick="resolveDynamicEvent('${e.id}', -1, document.getElementById('customResponseInput').value)"\n                    style="padding:12px 20px; background:var(--l-indigo); border:none; border-radius:8px; color:var(--l-ink-on-fill); cursor:pointer;">\n              Do it\n            </button>\n          </div>\n        </div>\n      </div>\n      \n      <div style="text-align:center; margin-top:15px; color:var(--text-mute); font-size:0.75rem;">\n        💰 ${formatCash(gameState.cash)} available\n      </div>\n    `),
        o.appendChild(d),
        document.body.appendChild(o),
        (e.status = "viewed");
}
async function generateCustomOutcome(e, t) {
    const n = (e.involvedEmployeeIds || []).map((e) => gameState.employees.find((t) => t.id === e)).filter(Boolean),
        a = `In an office management game, the player chose a custom response to an event.\n\nEVENT: ${e.title}\nDESCRIPTION: ${e.description}\nCATEGORY: ${e.category || "general"}\nINVOLVED EMPLOYEES: ${n.map((e) => e.name).join(", ") || "None specifically"}\n\nPLAYER'S CUSTOM ACTION: "${t}"\n\nGenerate a realistic outcome for this action. Consider:\n- Is this action reasonable/possible?\n- What would the consequences be (good OR bad)?\n- How would the employees react?\n\nAVAILABLE CONSEQUENCE TYPES (use for serious negative outcomes):\n- Fine/penalty: Set "specialEffect": {"type": "fine", "amount": 5000-100000, "reason": "why"}\n- Product shutdown: Set "specialEffect": {"type": "disable_product", "duration": 1-7, "reason": "why"}\n- Employee quits: Set "specialEffect": {"type": "employee_quits", "reason": "why they left"}\n- Investigation: Set "specialEffect": {"type": "investigation", "duration": 7-30, "reason": "what triggered it"}\n\nAVAILABLE BENEFIT TYPES (use for good outcomes):\n- Cash bonus: Set "specialEffect": {"type": "bonus_cash", "amount": 1000-25000, "reason": "source"}\n- Loyalty boost: Set "specialEffect": {"type": "loyalty_boost", "duration": 7-14}\n- Reputation boost: Set "specialEffect": {"type": "reputation_boost", "amount": 5-15}\n- Productivity boost: Set "specialEffect": {"type": "temporary_buff", "stat": "productivity", "multiplier": 1.2, "duration": 7}\n\nRESPOND IN JSON:\n{\n  "text": "1-2 sentences describing what happens as a result of the player's action",\n  "companyEffects": {"productivity": 0, "comfort": 0, "affection": 0, "trust": 0},\n  "employeeEffects": [{"name": "EmployeeName", "stat": "trust", "change": 5, "reason": "brief reason"}],\n  "specialEffect": null or {"type": "effect_type", ...params},\n  "duration": 7,\n  "wasClever": true\n}\n\ncompanyEffects range from -20 to +20. wasClever is true if the player's response was creative or smart.`,
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
            console.error("[DynamicEvents] Failed to parse custom outcome:", e),
            {
                text: "Your approach had unexpected results...",
                companyEffects: {},
                employeeEffects: [],
                duration: 7,
            }
        );
    }
}
function showDynamicEventOutcome(e, t, n = null) {
    const a = document.createElement("div");
    (a.id = "eventOutcomeModal"),
        (a.style.cssText =
            "\n      position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: var(--l-veil-85); z-index: 100000;\n      display: flex; justify-content: center; align-items: center;\n      animation: fadeIn 0.3s ease-out;\n    ");
    let o = "";
    if (n) {
        const e = {
                perfect: { bg: "var(--l-gold)", text: "var(--l-black)", icon: "⭐" },
                success: { bg: "var(--l-green)", text: "var(--l-black)", icon: "✓" },
                partial: { bg: "var(--l-orange-3)", text: "var(--l-black)", icon: "~" },
                failure: { bg: "var(--l-red)", text: "var(--l-ink)", icon: "✗" },
            },
            t = e[n.result] || e.partial;
        o = `\n        <div style="margin-bottom:15px;">\n          <span style="display:inline-block; background:${t.bg}; color:${t.text}; padding:6px 16px; border-radius:20px; font-size:0.85rem; font-weight:bold;">\n            ${t.icon} Skill Check: ${n.result.toUpperCase()}\n          </span>\n        </div>\n      `;
    }
    let i = "";
    if (t.companyEffects && Object.keys(t.companyEffects).length > 0) {
        const e = [];
        for (const [n, a] of Object.entries(t.companyEffects)) {
            if ("duration" === n || 0 === a) continue;
            const t = a > 0 ? "+" : "",
                o = a > 0 ? "var(--l-green)" : "var(--l-red)";
            e.push(`<span style="color:${o}">${t}${a} ${n}</span>`);
        }
        e.length > 0 &&
            (i = `\n          <div style="margin-top:15px; padding:12px; background:var(--l-veil-30); border-radius:8px; font-size:0.85rem;">\n            <div style="color:var(--text-dim); font-size:0.7rem; margin-bottom:5px;">Company Effects:</div>\n            ${e.join(" • ")}\n            <div style="color:var(--text-mute); font-size:0.7rem; margin-top:5px;">Duration: ${t.duration || 7} days</div>\n          </div>\n        `);
    }
    let s = "";
    t.employeeEffects &&
        t.employeeEffects.length > 0 &&
        (s = `\n        <div style="margin-top:10px; font-size:0.8rem;">\n          ${t.employeeEffects
                .map((e) => {
                    const t = e.change > 0 ? "+" : "",
                        n = e.change > 0 ? "var(--l-green)" : "var(--l-red)";
                    return `<div style="color:var(--text-dim);">• ${e.name}: <span style="color:${n}">${t}${e.change} ${e.stat}</span></div>`;
                })
                .join("")}\n        </div>\n      `);
    const r =
            (t.companyEffects?.productivity || 0) +
                (t.companyEffects?.affection || 0) +
                (t.companyEffects?.trust || 0) >
            0,
        l = document.createElement("div");
    (l.style.cssText = `\n      background: linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%);\n      border-radius: 15px; max-width: 480px; width: 90%;\n      padding: 30px; text-align: center;\n      border: 2px solid ${r ? "var(--l-green)" : "var(--l-indigo)"};\n      box-shadow: 0 20px 60px var(--l-veil-50);\n    `),
        (l.innerHTML = `\n      ${o}\n      <div style="font-size:3rem; margin-bottom:15px;">${r ? "✨" : "📋"}</div>\n      <h2 style="margin:0 0 15px 0; color:var(--l-ink); font-size:1.2rem;">Outcome</h2>\n      <p style="color:var(--l-ink-dim); font-size:0.95rem; line-height:1.6; margin-bottom:15px;">\n        ${t.text}\n      </p>\n      ${i}\n      ${s}\n      ${t.wasClever ? '<div style="color:var(--accent-gold); margin-top:10px; font-size:0.85rem;">✨ Clever approach!</div>' : ""}\n      <button onclick="document.getElementById('eventOutcomeModal').remove(); checkForMoreEvents();"\n              style="margin-top:25px; padding:12px 40px; background:var(--l-indigo); border:none; \n                     border-radius:8px; color:var(--l-ink-on-fill); font-size:1rem; cursor:pointer;\n                     transition: all 0.2s ease;"\n              onmouseenter="this.style.background='#7c8dea'"\n              onmouseleave="this.style.background='var(--l-indigo)'">\n        Continue\n      </button>\n    `),
        a.appendChild(l),
        document.body.appendChild(a);
}
function dynamicEventTick() {
    if (gameState.settings?.disableStoryEvents) return;
    const e = initializeDynamicEventSystem();
    if (!gameState.story?.activeMultiStepEvent) {
        if (Math.random() < 0.005) {
            const e = StoryEngine.getAvailableMultiStepEvents();
            if (e.length > 0) {
                const t = e[Math.floor(Math.random() * e.length)];
                return (
                    console.log("[DynamicEvents] 🎬 Triggering multi-step event:", t),
                    void StoryEngine.startMultiStepEvent(t)
                );
            }
        }
        Date.now() >= e.nextGenerationTime &&
            !e.generating &&
            (Math.random() < 0.3
                ? generateDynamicEvent().catch((e) => console.error("[DynamicEvents] Generation error:", e))
                : (e.nextGenerationTime = Date.now() + 6e4));
    }
}
(window.openEventPanel = function () {
    if (gameState.settings?.disableStoryEvents)
        return void showNotification(
            "📖 Story Mode & Events are disabled. Enable them in Settings > Content to view events.",
            "info"
        );
    if (void 0 !== StoryEngine && StoryEngine.openMinorEventsPanel) {
        if (StoryEngine.getMinorEventCount() > 0) return void StoryEngine.openMinorEventsPanel();
        const e = initializeDynamicEventSystem();
        if (0 === e.queue.filter((e) => "pending" === e.status).length) {
            const t = document.createElement("div");
            (t.id = "eventPanelModal"),
                (t.style.cssText =
                    "\n          position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n          background: var(--l-veil-90); z-index: 100000;\n          display: flex; justify-content: center; align-items: center;\n          animation: fadeIn 0.3s ease-out;\n        ");
            const n = StoryEngine.initializeMinorEvents().generating || e.generating;
            return (
                (t.innerHTML = `\n          <div style="background: linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%);\n                      border-radius: 15px; max-width: 450px; width: 90%; padding: 40px; text-align: center;\n                      border: 2px solid var(--border);">\n            <div style="font-size:4rem; margin-bottom:20px; opacity:0.5;">🔔</div>\n            <h2 style="margin:0 0 10px 0; color:var(--l-ink);">No Pending Events</h2>\n            <p style="color:var(--text-dim); margin-bottom:25px;">New events will appear here when something happens at your company.</p>\n            ${n ? '\n              <div style="color:var(--l-indigo); font-size:0.9rem;">\n                <div class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid var(--l-indigo); border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite; vertical-align:middle; margin-right:8px;"></div>\n                Generating new event...\n              </div>\n            ' : ""}\n            <button onclick="document.getElementById('eventPanelModal').remove()"\n                    style="margin-top:20px; padding:12px 40px; background:var(--l-neutral-3); border:none; \n                           border-radius:8px; color:var(--l-ink); font-size:1rem; cursor:pointer;">\n              Close\n            </button>\n          </div>\n        `),
                void document.body.appendChild(t)
            );
        }
    }
    const e = initializeDynamicEventSystem(),
        t = e.queue.filter((e) => "pending" === e.status),
        n = document.createElement("div");
    if (
        ((n.id = "eventPanelModal"),
        (n.style.cssText =
            "\n      position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: var(--l-veil-90); z-index: 100000;\n      display: flex; justify-content: center; align-items: center;\n      animation: fadeIn 0.3s ease-out;\n    "),
        0 === t.length)
    )
        return (
            (n.innerHTML = `\n        <div style="background: linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%);\n                    border-radius: 15px; max-width: 450px; width: 90%; padding: 40px; text-align: center;\n                    border: 2px solid var(--border);">\n          <div style="font-size:4rem; margin-bottom:20px; opacity:0.5;">🔔</div>\n          <h2 style="margin:0 0 10px 0; color:var(--l-ink);">No Pending Events</h2>\n          <p style="color:var(--text-dim); margin-bottom:25px;">New events will appear here when something happens at your company.</p>\n          ${e.generating ? '\n            <div style="color:var(--l-indigo); font-size:0.9rem;">\n              <div class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid var(--l-indigo); border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite; vertical-align:middle; margin-right:8px;"></div>\n              Generating new event...\n            </div>\n          ' : ""}\n          <button onclick="document.getElementById('eventPanelModal').remove()"\n                  style="margin-top:20px; padding:12px 40px; background:var(--l-neutral-3); border:none; \n                         border-radius:8px; color:var(--l-ink); font-size:1rem; cursor:pointer;">\n            Close\n          </button>\n        </div>\n      `),
            void document.body.appendChild(n)
        );
    showDynamicEventModal(t[0], t.length);
}),
    (window.dismissDynamicEvent = function (e) {
        const t = initializeDynamicEventSystem(),
            n = t.queue.findIndex((t) => t.id === e);
        if (-1 !== n) {
            const e = t.queue[n];
            (e.status = "dismissed"),
                (e.resolved = !0),
                t.history.unshift(e),
                t.queue.splice(n, 1),
                t.dismissedCount++,
                t.history.length > 50 && t.history.pop(),
                void 0 !== StoryEngine &&
                    StoryEngine.addJournalEntry &&
                    StoryEngine.addJournalEntry({
                        title: e.title,
                        content: `${e.description}\n\n[Event was dismissed without a decision]`,
                        type: "minor",
                        category: e.category || "company",
                        memorable: !1,
                    }),
                updateEventBellNotification();
            const a = t.queue.filter((e) => "pending" === e.status || "viewed" === e.status);
            if (a.length > 0) showDynamicEventModal(a[0], a.length);
            else {
                const e = document.getElementById("eventPanelModal");
                e && e.remove();
            }
        }
    }),
    (window.resolveDynamicEvent = async function (e, t, n) {
        const a = initializeDynamicEventSystem(),
            o = a.queue.findIndex((t) => t.id === e);
        if (-1 === o) return;
        const i = a.queue[o];
        let s, r;
        if (t >= 0 && t < i.choices.length) {
            if (((s = i.choices[t]), s.cost > 0 && gameState.cash < s.cost))
                return void showNotification("❌ Not enough cash!", "error");
            if (s.minigame && void 0 !== StoryMinigames) {
                const n = document.getElementById("eventPanelModal");
                n && ((n.style.opacity = "0"), (n.style.pointerEvents = "none"));
                const a = s.minigame;
                return void StoryMinigames.launchMinigame(
                    a.type,
                    {
                        title: a.title || s.text,
                        themeText: a.description || "Complete the skill check!",
                        difficulty: a.difficulty || "medium",
                    },
                    (n) => {
                        resolveDynamicEventAfterMinigame(e, t, n);
                    }
                );
            }
            (r = s.outcome), s.cost > 0 && (gameState.cash -= s.cost);
        } else {
            if (!n || !n.trim()) return;
            {
                const e = document.getElementById("eventPanelModal");
                if (e) {
                    const t = e.querySelector('button[onclick*="resolveDynamicEvent"]');
                    t && ((t.disabled = !0), (t.textContent = "Thinking..."));
                }
                try {
                    r = await generateCustomOutcome(i, n.trim());
                } catch (e) {
                    console.error("[DynamicEvents] Custom outcome generation failed:", e),
                        (r = {
                            text: "Your unconventional approach had mixed results.",
                            companyEffects: {},
                            employeeEffects: [],
                            duration: 7,
                        });
                }
                s = { text: n.trim(), cost: 0 };
            }
        }
        if (
            (r.companyEffects && applyCompanyEventEffect(r.companyEffects),
            r.employeeEffects &&
                r.employeeEffects.length > 0 &&
                r.employeeEffects.forEach((e) => {
                    const t = gameState.employees.find(
                        (t) => t.name.toLowerCase() === e.name?.toLowerCase() || t.id === e.employeeId
                    );
                    t && applyEmployeeEventEffect(t, e);
                }),
            r.specialEffect && void 0 !== StoryEngine && StoryEngine.executeGameplayEffect(r.specialEffect),
            (i.resolved = !0),
            (i.status = "resolved"),
            (i.chosenOption = t),
            (i.customResponse = n),
            (i.outcomeText = r.text),
            (i.resolvedAt = Date.now()),
            "family" === i.category || "family dynamics" === i.category
                ? gameState.story &&
                  ((gameState.story.lastFamilyEventTime = Date.now()),
                  (gameState.story.consecutiveFamilyEvents = (gameState.story.consecutiveFamilyEvents || 0) + 1))
                : gameState.story && (gameState.story.consecutiveFamilyEvents = 0),
            a.history.unshift(i),
            a.queue.splice(o, 1),
            a.viewedTotal++,
            a.history.length > 50 && a.history.pop(),
            void 0 !== StoryEngine && StoryEngine.addJournalEntry)
        ) {
            const e = (i.involvedEmployeeIds || [])
                .map((e) => gameState.employees.find((t) => t.id === e))
                .filter(Boolean);
            StoryEngine.addJournalEntry({
                title: i.title,
                content: `${i.description}\n\nChoice: ${s?.text || n || "Dismissed"}\n\nOutcome: ${r.text}`,
                type: "minor",
                category: i.category || "company",
                memorable: i.judgeScore?.total >= 30,
                involvedCharacters: e.map((e) => e.name),
            }),
                e.forEach((e) => {
                    e.memory?.eventMemories &&
                        (e.memory.eventMemories.push({
                            eventId: i.id,
                            title: i.title,
                            description: i.description,
                            outcome: r.text,
                            playerChoice: s?.text || n,
                            timestamp: Date.now(),
                            type: "meta_event",
                        }),
                        e.memory.eventMemories.length > CAPS.EVENT_MEMORIES_PER_EMP &&
                            (e.memory.eventMemories = e.memory.eventMemories.slice(-CAPS.EVENT_MEMORIES_PER_EMP)));
                });
        }
        const l = document.getElementById("eventPanelModal");
        l && l.remove(), showDynamicEventOutcome(i, r), updateEventBellNotification(), saveGame(!1);
    }),
    (window.resolveDynamicEventAfterMinigame = function (e, t, n) {
        const a = initializeDynamicEventSystem(),
            o = a.queue.findIndex((t) => t.id === e);
        if (-1 === o) return;
        const i = a.queue[o],
            s = i.choices[t];
        if (!s) return;
        const r = s.minigame;
        let l = s.outcome || {};
        "perfect" === n.result && r.perfectOutcome
            ? ((l = { ...l, ...r.perfectOutcome }),
              showNotification("⭐ Perfect! Your skill impressed everyone!", "success"))
            : ("success" !== n.result && "perfect" !== n.result) || !r.successOutcome
              ? "partial" === n.result && r.partialOutcome
                  ? ((l = { ...l, ...r.partialOutcome }),
                    showNotification("⚠️ Partial success - could have gone better.", "warning"))
                  : "failure" === n.result &&
                    r.failureOutcome &&
                    ((l = { ...l, ...r.failureOutcome }),
                    showNotification("❌ That didn't go as planned...", "error"))
              : (l = { ...l, ...r.successOutcome }),
            l.text ||
                (l.text =
                    "success" === n.result || "perfect" === n.result
                        ? "Your skilled handling of the situation produced good results."
                        : "Despite your best efforts, things didn't go smoothly."),
            s.cost > 0 && (gameState.cash -= s.cost),
            l.companyEffects && applyCompanyEventEffect(l.companyEffects),
            l.employeeEffects &&
                l.employeeEffects.length > 0 &&
                l.employeeEffects.forEach((e) => {
                    const t = gameState.employees.find(
                        (t) => t.name.toLowerCase() === e.name?.toLowerCase() || t.id === e.employeeId
                    );
                    t && applyEmployeeEventEffect(t, e);
                }),
            l.specialEffect && void 0 !== StoryEngine && StoryEngine.executeGameplayEffect(l.specialEffect),
            (i.resolved = !0),
            (i.status = "resolved"),
            (i.chosenOption = t),
            (i.outcomeText = l.text),
            (i.resolvedAt = Date.now()),
            (i.minigameResult = n),
            a.history.unshift(i),
            a.queue.splice(o, 1),
            a.viewedTotal++,
            a.history.length > 50 && a.history.pop();
        const c =
            "perfect" === n.result
                ? " [PERFECT]"
                : "success" === n.result
                  ? " [SUCCESS]"
                  : "partial" === n.result
                    ? " [PARTIAL]"
                    : " [FAILED]";
        if (void 0 !== StoryEngine && StoryEngine.addJournalEntry) {
            const e = (i.involvedEmployeeIds || [])
                .map((e) => gameState.employees.find((t) => t.id === e))
                .filter(Boolean);
            StoryEngine.addJournalEntry({
                title: i.title,
                content: `${i.description}\n\nChoice: ${s.text}${c}\n\nOutcome: ${l.text}`,
                type: "minor",
                category: i.category || "company",
                memorable: "perfect" === n.result,
                involvedCharacters: e.map((e) => e.name),
            }),
                e.forEach((e) => {
                    e.memory?.eventMemories &&
                        (e.memory.eventMemories.push({
                            eventId: i.id,
                            title: i.title,
                            description: i.description,
                            outcome: l.text,
                            playerChoice: s.text,
                            minigameResult: n.result,
                            timestamp: Date.now(),
                            type: "meta_event",
                        }),
                        e.memory.eventMemories.length > CAPS.EVENT_MEMORIES_PER_EMP &&
                            (e.memory.eventMemories = e.memory.eventMemories.slice(-CAPS.EVENT_MEMORIES_PER_EMP)));
                });
        }
        const d = document.getElementById("eventPanelModal");
        d && d.remove(), showDynamicEventOutcome(i, l, n), updateEventBellNotification(), saveGame(!1);
    }),
    (window.checkForMoreEvents = function () {
        const e = initializeDynamicEventSystem().queue.filter((e) => "pending" === e.status);
        e.length > 0 && showDynamicEventModal(e[0], e.length);
    }),
    (function () {
        if (document.getElementById("dynamicEventStyles")) return;
        const e = document.createElement("style");
        (e.id = "dynamicEventStyles"),
            (e.textContent =
                "\n      @keyframes bellGlow {\n        0%, 100% { filter: drop-shadow(0 0 5px var(--l-indigo)); }\n        50% { filter: drop-shadow(0 0 15px var(--l-red)); }\n      }\n      @keyframes bellPulse {\n        0%, 100% { transform: scale(1); }\n        50% { transform: scale(1.2); }\n      }\n      @keyframes slideInRight {\n        from { transform: translateX(100%); opacity: 0; }\n        to { transform: translateX(0); opacity: 1; }\n      }\n      @keyframes fadeOut {\n        from { opacity: 1; }\n        to { opacity: 0; }\n      }\n      @keyframes spin {\n        to { transform: rotate(360deg); }\n      }\n      .event-corner-notification:hover {\n        transform: translateY(-3px);\n        box-shadow: 0 15px 50px rgba(102, 126, 234, 0.4);\n      }\n    "),
            document.head.appendChild(e);
    })();
