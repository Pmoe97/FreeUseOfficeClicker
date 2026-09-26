// ============================================================================
// 08-scheduler — Scheduled events & NPC event triggers: auto-reply regexes, date math, NPC scheduled event queue (processNpcScheduledEvents..debugScheduledEvents).
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

const SCHEDULE_PATTERNS = [
    {
        regex: /\b(see you|talk to you|text you|message you|i'll text|i'll message|let's talk|catch up|meet|meeting)\b.*?\b(tomorrow)\s*(morning|afternoon|evening|night)?\b/i,
        type: "future_contact",
        timeResolver: (e, t) => getNextTimeOfDay(t, "tomorrow", (e[3] || "morning").toLowerCase()),
    },
    {
        regex: /\btomorrow\s*(morning|afternoon|evening|night)?\b.*?\b(see you|talk|text|message|meet|catch up)\b/i,
        type: "future_contact",
        timeResolver: (e, t) => getNextTimeOfDay(t, "tomorrow", (e[1] || "morning").toLowerCase()),
    },
    {
        regex: /\b(see you|meet you|come by|stop by|visit|swing by)\b.*?\b(end of (?:the )?day|after work|this evening|tonight|later today)\b/i,
        type: "same_day_meet",
        timeResolver: (e, t) => {
            const n = e[2].toLowerCase();
            return n.includes("end of") || n.includes("after work")
                ? getNextTimeOfDay(t, "today", "end_of_day")
                : n.includes("evening") || n.includes("tonight")
                  ? getNextTimeOfDay(t, "today", "evening")
                  : getNextTimeOfDay(t, "today", "afternoon");
        },
    },
    {
        regex: /\b(end of (?:the )?day|after work|this evening|tonight|later today)\b.*?\b(see you|meet|come by|stop by)\b/i,
        type: "same_day_meet",
        timeResolver: (e, t) => {
            const n = e[1].toLowerCase();
            return n.includes("end of") || n.includes("after work")
                ? getNextTimeOfDay(t, "today", "end_of_day")
                : n.includes("evening") || n.includes("tonight")
                  ? getNextTimeOfDay(t, "today", "evening")
                  : getNextTimeOfDay(t, "today", "afternoon");
        },
    },
    {
        regex: /\b(lunch|lunchtime)\b.*?\b(today|tomorrow)?\b.*?\b(see you|meet|join|grab|get)\b|\b(see you|meet|join|grab|get)\b.*?\b(lunch|lunchtime)\b.*?\b(today|tomorrow)?\b/i,
        type: "lunch_meet",
        timeResolver: (e, t) =>
            getNextTimeOfDay(
                t,
                "tomorrow" === (e[2] || e[6] || "today").toLowerCase() ? "tomorrow" : "today",
                "lunch"
            ),
    },
    {
        regex: /\bwe\s*(?:still\s*)?on\s*for\s*(lunch|coffee|dinner|drinks|breakfast)\b/i,
        type: "confirm_plans",
        timeResolver: (e, t) => getMealTime(t, e[1].toLowerCase()),
    },
    {
        regex: /\b(come to|stop by|visit|swing by|drop by|head to)\s*(my|the)?\s*(office|desk|cubicle|place)\b.*?\bat\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|o'clock)?\b/i,
        type: "scheduled_visit",
        timeResolver: (e, t) => {
            let n = parseInt(e[4]);
            const a = parseInt(e[5]) || 0,
                o = (e[6] || "").toLowerCase();
            return (
                "pm" === o && n < 12 && (n += 12),
                "am" === o && 12 === n && (n = 0),
                !o && n < 7 && (n += 12),
                getNextSpecificTime(t, n, a)
            );
        },
    },
    {
        regex: /\bat\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|o'clock)?\b.*?\b(come to|stop by|visit|meet)\b/i,
        type: "scheduled_visit",
        timeResolver: (e, t) => {
            let n = parseInt(e[1]);
            const a = parseInt(e[2]) || 0,
                o = (e[3] || "").toLowerCase();
            return (
                "pm" === o && n < 12 && (n += 12),
                "am" === o && 12 === n && (n = 0),
                !o && n < 7 && (n += 12),
                getNextSpecificTime(t, n, a)
            );
        },
    },
    {
        regex: /\b(text|message|call|ping|hit me up|let me know)\s*(me)?\s*(when|if|once)\s*(you('re|'ve| are| have)?|the)\s*(.{5,50})/i,
        type: "conditional_contact",
        timeResolver: (e, t) => ({ time: t + 72e5, isConditional: !0, condition: e[0] }),
    },
    {
        regex: /\bin\s*(?:about\s*)?(\d+)\s*(hour|minute|min|hr)s?\b/i,
        type: "relative_time",
        timeResolver: (e, t) => {
            const n = parseInt(e[1]),
                a = e[2].toLowerCase();
            return { time: t + n * (a.startsWith("hour") || "hr" === a ? 36e5 : 6e4) };
        },
    },
    {
        regex: /\b(this weekend|on saturday|on sunday|the weekend)\b.*?\b(let's|we should|want to|wanna|meet|hang out|get together)\b/i,
        type: "weekend_plans",
        timeResolver: (e, t) => getNextWeekend(t),
    },
    {
        regex: /\b(next week|on monday|on tuesday|on wednesday|on thursday|on friday)\b.*?\b(let's|we should|meet|talk|discuss|schedule)\b/i,
        type: "next_week",
        timeResolver: (e, t) => getNextWeekday(t, e[1].toLowerCase()),
    },
];
function getNextTimeOfDay(e, t, n) {
    const a = new Date(e);
    "tomorrow" === t && a.setDate(a.getDate() + 1);
    const o = { morning: 9, lunch: 12, afternoon: 14, end_of_day: 17, evening: 19, night: 21 }[n] || 9;
    return (
        a.setHours(o, 0, 0, 0),
        a.getTime() <= e && "today" === t && a.setDate(a.getDate() + 1),
        { time: a.getTime() }
    );
}
function getMealTime(e, t) {
    const n = new Date(e),
        a = { breakfast: 8, coffee: 10, lunch: 12, dinner: 19, drinks: 18 }[t] || 12;
    return n.setHours(a, 0, 0, 0), n.getTime() <= e && n.setDate(n.getDate() + 1), { time: n.getTime() };
}
function getNextSpecificTime(e, t, n = 0) {
    const a = new Date(e);
    return a.setHours(t, n, 0, 0), a.getTime() <= e && a.setDate(a.getDate() + 1), { time: a.getTime() };
}
function getNextWeekend(e) {
    const t = new Date(e),
        n = (6 - t.getDay() + 7) % 7 || 7;
    return t.setDate(t.getDate() + n), t.setHours(12, 0, 0, 0), { time: t.getTime() };
}
function getNextWeekday(e, t) {
    const n = new Date(e),
        a = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 };
    let o = null;
    for (const [e, n] of Object.entries(a))
        if (t.includes(e)) {
            o = n;
            break;
        }
    null === o && (o = 1);
    let i = (o - n.getDay() + 7) % 7;
    return 0 === i && (i = 7), n.setDate(n.getDate() + i), n.setHours(10, 0, 0, 0), { time: n.getTime() };
}
function detectScheduleCommitments(e, t, n = !1) {
    if (!e || !t) return [];
    const a = gameState.time?.currentTime || Date.now(),
        o = [];
    for (const i of SCHEDULE_PATTERNS) {
        const s = e.match(i.regex);
        if (s) {
            const r = i.timeResolver(s, a);
            r &&
                r.time > a &&
                (o.push({
                    id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    npcId: t.id,
                    npcName: t.name,
                    type: i.type,
                    triggerTime: r.time,
                    triggerWindow: 18e5,
                    context: extractScheduleContext(e, s),
                    originalPhrase: s[0],
                    source: n ? "player" : "npc",
                    actionType: determineActionType(i.type, n),
                    actionData: { condition: r.isConditional ? r.condition : null, fullMessage: e.slice(0, 200) },
                    status: "pending",
                    createdAt: a,
                    reminderSent: !1,
                }),
                console.log(
                    `[Schedule] Detected ${i.type} commitment from ${n ? "player" : t.name}: "${s[0]}" → ${new Date(r.time).toLocaleString()}`
                ));
        }
    }
    return o;
}
function extractScheduleContext(e, t) {
    const n = e.toLowerCase().indexOf(t[0].toLowerCase()),
        a = Math.max(0, n - 50),
        o = Math.min(e.length, n + t[0].length + 50);
    return e.slice(a, o).trim();
}
function determineActionType(e, t) {
    return (
        {
            future_contact: t ? "wait_for_player" : "send_message",
            same_day_meet: t ? "reminder" : "send_message",
            lunch_meet: "send_message",
            confirm_plans: "confirm_or_remind",
            scheduled_visit: t ? "reminder" : "send_message",
            conditional_contact: "check_condition",
            relative_time: "send_message",
            weekend_plans: "send_message",
            next_week: "send_message",
        }[e] || "send_message"
    );
}
function addNpcScheduledEvent(e) {
    gameState.npcScheduledEvents || (gameState.npcScheduledEvents = []);
    return gameState.npcScheduledEvents.some(
        (t) =>
            t.npcId === e.npcId &&
            t.type === e.type &&
            Math.abs(t.triggerTime - e.triggerTime) < 72e5 &&
            "pending" === t.status
    )
        ? (console.log(`[Schedule] Skipped duplicate event for ${e.npcName}`), !1)
        : (gameState.npcScheduledEvents.push(e),
          console.log(
              `[Schedule] Added event: ${e.npcName} - ${e.type} at ${new Date(e.triggerTime).toLocaleString()}`
          ),
          !0);
}
async function processNpcScheduledEvents() {
    if (!gameState.npcScheduledEvents || 0 === gameState.npcScheduledEvents.length) return;
    const e = gameState.time?.currentTime || Date.now(),
        t = [];
    for (const n of gameState.npcScheduledEvents) {
        if ("pending" !== n.status) continue;
        const a = e - n.triggerTime,
            o = Math.abs(a) <= n.triggerWindow,
            i = a > n.triggerWindow;
        o
            ? t.push(n)
            : i && ((n.status = "missed"), console.log(`[Schedule] Missed event: ${n.npcName} - ${n.type}`));
    }
    for (const e of t) await executeScheduledEvent(e);
    const n = gameState.npcScheduledEvents.filter(
        (e) => "completed" === e.status || "missed" === e.status || "cancelled" === e.status
    );
    if (n.length > 50) {
        const e = n.slice(0, n.length - 50);
        gameState.npcScheduledEvents = gameState.npcScheduledEvents.filter((t) => !e.includes(t));
    }
}
async function executeScheduledEvent(e) {
    const t = gameState.employees.find((t) => t.id === e.npcId);
    if (t) {
        console.log(`[Schedule] Executing event: ${t.name} - ${e.type} (${e.actionType})`),
            (e.status = "triggered");
        try {
            switch (e.actionType) {
                case "send_message":
                default:
                    await sendScheduledMessage(t, e);
                    break;
                case "reminder":
                    await sendScheduledReminder(t, e);
                    break;
                case "confirm_or_remind":
                    await sendConfirmationMessage(t, e);
                    break;
                case "wait_for_player":
                    e.reminderSent || (await sendSubtleReminder(t, e), (e.reminderSent = !0));
                    break;
                case "check_condition":
                    await sendConditionalFollowUp(t, e);
            }
            e.status = "completed";
        } catch (t) {
            console.error("[Schedule] Error executing event:", t), (e.status = "missed");
        }
    } else e.status = "cancelled";
}
async function sendScheduledMessage(e, t) {
    const n = buildScheduledMessagePrompt(e, t, getTimeDescription(t.triggerTime));
    try {
        const a = sanitizeNpcResponse(await queuedGenerateText(n, {}, `Scheduled message from ${e.name}`), 5);
        gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
        const o = gameState.time?.currentTime || Date.now();
        if (
            (gameState.chatHistory[e.id].push({
                sender: e.name,
                content: a,
                isPlayer: !1,
                timestamp: o,
                isScheduledMessage: !0,
                scheduleType: t.type,
            }),
            e.unreadMessages || (e.unreadMessages = 0),
            e.unreadMessages++,
            showNotification(`💬 ${e.name} sent you a message`, "info"),
            gameState.activeChat?.id === e.id && chatMessages)
        ) {
            const t = gameState.chatHistory[e.id].length - 1;
            addChatMessage(e.name, a, !1, null, t, null, o), (chatMessages.scrollTop = chatMessages.scrollHeight);
        }
        saveGame(!1), console.log(`[Schedule] Sent scheduled message from ${e.name}: "${a.slice(0, 50)}..."`);
    } catch (e) {
        throw (console.error("[Schedule] Failed to generate message:", e), e);
    }
}
function buildScheduledMessagePrompt(e, t, n) {
    const a = getRelationshipSummary(e),
        o = getRecentChatContext(e.id, 5);
    let i = "";
    switch (t.type) {
        case "future_contact":
            i = `You promised to message or talk to the player ${n}. Now is that time. Send a friendly message following up on that commitment.`;
            break;
        case "same_day_meet":
            i = `You mentioned meeting up or seeing the player ${n}. Now is the time. Send a message about meeting up or checking if they're available.`;
            break;
        case "lunch_meet":
            i =
                "You have lunch plans with the player. It's around that time now. Send a message about meeting up for lunch.";
            break;
        case "confirm_plans":
            i =
                "The player asked to confirm plans. Respond enthusiastically confirming you're still on for the activity.";
            break;
        case "scheduled_visit":
            i = "There was a scheduled time to meet/visit. Now is that time. Send a brief message about it.";
            break;
        case "weekend_plans":
            i = "You made weekend plans with the player. It's the weekend now. Send a message about those plans.";
            break;
        case "next_week":
            i = "You scheduled something for this day. Send a reminder or follow-up message.";
            break;
        default:
            i = `Follow up on previous conversation about: "${t.context}"`;
    }
    return `You are ${e.name}, ${e.position || "employee"} at ${e.companyName || "the company"}.\n\n${a}\n\nRECENT CONVERSATION:\n${o}\n\nORIGINAL COMMITMENT: "${t.originalPhrase}"\nCONTEXT: ${t.context}\n\nINSTRUCTION: ${i}\n\nWrite a SHORT, natural message (1-3 sentences) following up on this. Be casual and in-character. Don't be overly formal. Reference the previous conversation naturally.`;
}
async function sendScheduledReminder(e, t) {
    const n = `You are ${e.name}. You had plans or a commitment with the player about: "${t.context}"\n\nIt's now the scheduled time. Send a very brief (1-2 sentences) reminder or check-in message. Be casual and friendly.`;
    try {
        const t = sanitizeNpcResponse(await queuedGenerateText(n, {}, `Reminder from ${e.name}`), 3);
        gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
        const a = gameState.time?.currentTime || Date.now();
        gameState.chatHistory[e.id].push({
            sender: e.name,
            content: t,
            isPlayer: !1,
            timestamp: a,
            isScheduledMessage: !0,
        }),
            e.unreadMessages || (e.unreadMessages = 0),
            e.unreadMessages++,
            showNotification(`📅 ${e.name} sent a reminder`, "info"),
            saveGame(!1);
    } catch (e) {
        console.error("[Schedule] Reminder failed:", e);
    }
}
async function sendConfirmationMessage(e, t) {
    const n = `You are ${e.name}. The player asked if you're "still on" for plans: "${t.context}"\n\nSend a brief, enthusiastic confirmation (1-2 sentences). Be friendly and confirm the plans.`;
    try {
        const t = sanitizeNpcResponse(await queuedGenerateText(n, {}, `Confirmation from ${e.name}`), 3);
        gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
        const a = gameState.time?.currentTime || Date.now();
        gameState.chatHistory[e.id].push({
            sender: e.name,
            content: t,
            isPlayer: !1,
            timestamp: a,
            isScheduledMessage: !0,
        }),
            e.unreadMessages || (e.unreadMessages = 0),
            e.unreadMessages++,
            showNotification(`✅ ${e.name} confirmed plans`, "info"),
            saveGame(!1);
    } catch (e) {
        console.error("[Schedule] Confirmation failed:", e);
    }
}
async function sendSubtleReminder(e, t) {
    const n = `You are ${e.name}. The player said they would "${t.context}" but it's now the scheduled time and they haven't followed through.\n\nSend a casual, non-pushy message (1-2 sentences) gently reminding them or asking if they're still available. Don't be passive-aggressive.`;
    try {
        const t = sanitizeNpcResponse(await queuedGenerateText(n, {}, `Subtle reminder from ${e.name}`), 3);
        gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
        const a = gameState.time?.currentTime || Date.now();
        gameState.chatHistory[e.id].push({
            sender: e.name,
            content: t,
            isPlayer: !1,
            timestamp: a,
            isScheduledMessage: !0,
        }),
            e.unreadMessages || (e.unreadMessages = 0),
            e.unreadMessages++,
            showNotification(`💭 ${e.name} is checking in`, "info"),
            saveGame(!1);
    } catch (e) {
        console.error("[Schedule] Subtle reminder failed:", e);
    }
}
async function sendConditionalFollowUp(e, t) {
    const n = t.actionData?.condition || t.context,
        a = `You are ${e.name}. The conversation mentioned: "${n}"\n\nSend a brief follow-up message (1-2 sentences) checking in about this. Be casual and natural.`;
    try {
        const t = sanitizeNpcResponse(await queuedGenerateText(a, {}, `Conditional follow-up from ${e.name}`), 3);
        gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
        const n = gameState.time?.currentTime || Date.now();
        gameState.chatHistory[e.id].push({
            sender: e.name,
            content: t,
            isPlayer: !1,
            timestamp: n,
            isScheduledMessage: !0,
        }),
            e.unreadMessages || (e.unreadMessages = 0),
            e.unreadMessages++,
            saveGame(!1);
    } catch (e) {
        console.error("[Schedule] Conditional follow-up failed:", e);
    }
}
function getTimeDescription(e) {
    const t = new Date(e),
        n = new Date(gameState.time?.currentTime || Date.now()),
        a = t.toDateString() === n.toDateString(),
        o = new Date(n);
    o.setDate(o.getDate() + 1);
    const i = t.toDateString() === o.toDateString(),
        s = t.getHours();
    let r = "morning";
    if ((s >= 12 && s < 17 ? (r = "afternoon") : s >= 17 && s < 21 ? (r = "evening") : s >= 21 && (r = "night"), a))
        return `today (${r})`;
    if (i) return `tomorrow ${r}`;
    return `${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][t.getDay()]} ${r}`;
}
function getRelationshipSummary(e) {
    const t = e.relationships?.player || { level: 0, type: "professional" },
        n = e.stats?.affection || 0,
        a = e.stats?.trust || 0;
    let o = `Your relationship with the player: ${t.type} (level ${t.level}/100)\n`;
    return (
        (o += `Affection: ${n}/100, Trust: ${a}/100\n`),
        n > 70
            ? (o += "You have strong feelings for the player.\n")
            : n > 40 && (o += "You like the player quite a bit.\n"),
        o
    );
}
function isStoryEnabled() {
    return !gameState?.settings?.disableStoryEvents;
}
function getStoryContextForNPC(e) {
    if (!e) return null;
    const t = [];
    if (e.memory?.eventMemories && e.memory.eventMemories.length > 0) {
        [...e.memory.eventMemories]
            .sort((e, t) => (t.emotionalWeight || 3) - (e.emotionalWeight || 3))
            .slice(0, 7)
            .forEach((e) => {
                const n = getRelativeTimeString(e.timestamp),
                    a =
                        "positive" === e.sentiment
                            ? "(positive memory)"
                            : "negative" === e.sentiment
                              ? "(still bothers me)"
                              : "",
                    o = (e.emotionalWeight || 3) >= 5 ? "⭐" : "";
                t.push(`- ${n}: "${e.title}" - ${e.outcome || e.description} ${o}${a}`);
            });
    }
    if (gameState.story?.journal) {
        gameState.story.journal
            .filter(
                (t) =>
                    !!t.involvedCharacters?.includes(e.name) ||
                    !!t.content?.toLowerCase().includes(e.name.toLowerCase())
            )
            .slice(0, 5)
            .forEach((e) => {
                const n = getRelativeTimeString(e.timestamp);
                if (!t.some((t) => t.includes(e.title))) {
                    const a = e.memorable ? "⭐" : "";
                    t.push(`- ${n}: "${e.title}" (${e.type || "event"}) ${a}`);
                }
            });
    }
    if (gameState.story?.emergentNarratives?.activeArcs) {
        gameState.story.emergentNarratives.activeArcs
            .filter((t) => t.participants?.includes(e.id) || t.participants?.includes(e.name))
            .forEach((e) => {
                t.push(`- ONGOING: "${e.name}" storyline (${e.stage || "in progress"})`);
            });
    }
    if (e.relationships?.player?.history && e.relationships.player.history.length > 0) {
        e.relationships.player.history
            .filter((e) => e.significant || e.change > 10)
            .slice(-3)
            .forEach((e) => {
                t.push(`- Our history: ${e.event}`);
            });
    }
    if (void 0 !== StoryEngine && gameState.story?.spineProgress) {
        Object.values(gameState.story.spineProgress)
            .filter(Boolean)
            .forEach((n) => {
                (gameState.story?.actData?.[gameState.story.currentAct]?.spineEventsTriggered || []).some(
                    (t) => t.involvedEmployees?.includes(e.id) || t.involvedEmployees?.includes(e.name)
                ) && t.push(`- Part of major story event: ${n}`);
            });
    }
    const n = getSpontaneousMemoryReference(e);
    return (
        n &&
            t.push(
                "",
                `💭 SPONTANEOUS: You're reminded of "${n.title}" and might naturally bring it up if the conversation allows.`
            ),
        0 === t.length
            ? null
            : `These are events/stories I was personally involved in with the boss (player). I remember these and can reference them:\n${t.join("\n")}`
    );
}
function getSpontaneousMemoryReference(e) {
    if (!e?.memory?.eventMemories || 0 === e.memory.eventMemories.length) return null;
    if (Math.random() > 0.15) return null;
    const t = e.memory.eventMemories.filter(
        (e) => (e.emotionalWeight || 3) >= 5 && (e.referenced || 0) < 3 && !1 !== e.canReference
    );
    if (0 === t.length) return null;
    const n = t.flatMap((e) => Array((e.emotionalWeight || 3) - 3).fill(e)),
        a = n[Math.floor(Math.random() * n.length)] || t[0];
    return a && (a.referenced = (a.referenced || 0) + 1), a;
}
function getRelativeTimeString(e) {
    if (!e) return "recently";
    const t = (gameState.time?.currentTime || Date.now()) - e,
        n = Math.floor(t / 864e5);
    return n < 1
        ? "today"
        : 1 === n
          ? "yesterday"
          : n < 7
            ? `${n} days ago`
            : n < 14
              ? "last week"
              : n < 30
                ? `${Math.floor(n / 7)} weeks ago`
                : `${Math.floor(n / 30)} month(s) ago`;
}
function getRecentChatContext(e, t = 5) {
    const n = (gameState.chatHistory[e] || []).slice(-t);
    return 0 === n.length ? "(No recent messages)" : n.map((e) => `${e.sender}: ${e.content}`).join("\n");
}
function getNpcUpcomingSchedule(e) {
    return gameState.npcScheduledEvents
        ? gameState.npcScheduledEvents
              .filter((t) => t.npcId === e && "pending" === t.status)
              .sort((e, t) => e.triggerTime - t.triggerTime)
        : [];
}
function cancelScheduledEvent(e) {
    if (!gameState.npcScheduledEvents) return !1;
    const t = gameState.npcScheduledEvents.find((t) => t.id === e);
    return (
        !(!t || "pending" !== t.status) &&
        ((t.status = "cancelled"), console.log(`[Schedule] Cancelled event: ${t.npcName} - ${t.type}`), !0)
    );
}
function detectAndScheduleCommitments(e, t, n) {
    if (e) {
        if (t) {
            const n = detectScheduleCommitments(t, e, !0);
            for (const t of n)
                addNpcScheduledEvent(t) && console.log(`[Schedule] Player made commitment to ${e.name}: ${t.type}`);
        }
        if (n) {
            const t = detectScheduleCommitments(n, e, !1);
            for (const n of t)
                if (addNpcScheduledEvent(n)) {
                    new Date(n.triggerTime);
                    const t = getTimeDescription(n.triggerTime);
                    showNotification(`📅 ${e.name} scheduled: ${n.type.replace(/_/g, " ")} (${t})`, "info", 4e3);
                }
        }
    }
}
function getAllPendingScheduledEvents() {
    return gameState.npcScheduledEvents
        ? gameState.npcScheduledEvents
              .filter((e) => "pending" === e.status)
              .sort((e, t) => e.triggerTime - t.triggerTime)
        : [];
}
function debugScheduledEvents() {
    const e = gameState.npcScheduledEvents || [];
    console.log("=== NPC Scheduled Events ==="),
        console.log(`Total: ${e.length}, Pending: ${e.filter((e) => "pending" === e.status).length}`);
    const t = e.filter((e) => "pending" === e.status).sort((e, t) => e.triggerTime - t.triggerTime);
    for (const e of t) {
        const t = new Date(e.triggerTime);
        console.log(`- ${e.npcName}: ${e.type} at ${t.toLocaleString()} | "${e.originalPhrase}"`);
    }
}
