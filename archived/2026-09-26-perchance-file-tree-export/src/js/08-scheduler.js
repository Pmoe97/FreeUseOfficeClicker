// ============================================================================
// 08-scheduler — Scheduled events & NPC event triggers: auto-reply regexes, date math, NPC scheduled event queue (Nt..debugScheduledEvents).
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

const xt = [{ regex: /\b(see you|talk to you|text you|message you|i'll text|i'll message|let's talk|catch up|meet|meeting)\b.*?\b(tomorrow)\s*(morning|afternoon|evening|night)?\b/i, type: "future_contact", timeResolver: (e, t) => kt(t, "tomorrow", (e[3] || "morning").toLowerCase()) }, { regex: /\btomorrow\s*(morning|afternoon|evening|night)?\b.*?\b(see you|talk|text|message|meet|catch up)\b/i, type: "future_contact", timeResolver: (e, t) => kt(t, "tomorrow", (e[1] || "morning").toLowerCase()) }, { regex: /\b(see you|meet you|come by|stop by|visit|swing by)\b.*?\b(end of (?:the )?day|after work|this evening|tonight|later today)\b/i, type: "same_day_meet", timeResolver: (e, t) => {
  const n = e[2].toLowerCase();
  return n.includes("end of") || n.includes("after work") ? kt(t, "today", "end_of_day") : n.includes("evening") || n.includes("tonight") ? kt(t, "today", "evening") : kt(t, "today", "afternoon");
} }, { regex: /\b(end of (?:the )?day|after work|this evening|tonight|later today)\b.*?\b(see you|meet|come by|stop by)\b/i, type: "same_day_meet", timeResolver: (e, t) => {
  const n = e[1].toLowerCase();
  return n.includes("end of") || n.includes("after work") ? kt(t, "today", "end_of_day") : n.includes("evening") || n.includes("tonight") ? kt(t, "today", "evening") : kt(t, "today", "afternoon");
} }, { regex: /\b(lunch|lunchtime)\b.*?\b(today|tomorrow)?\b.*?\b(see you|meet|join|grab|get)\b|\b(see you|meet|join|grab|get)\b.*?\b(lunch|lunchtime)\b.*?\b(today|tomorrow)?\b/i, type: "lunch_meet", timeResolver: (e, t) => kt(t, "tomorrow" === (e[2] || e[6] || "today").toLowerCase() ? "tomorrow" : "today", "lunch") }, { regex: /\bwe\s*(?:still\s*)?on\s*for\s*(lunch|coffee|dinner|drinks|breakfast)\b/i, type: "confirm_plans", timeResolver: (e, t) => St(t, e[1].toLowerCase()) }, { regex: /\b(come to|stop by|visit|swing by|drop by|head to)\s*(my|the)?\s*(office|desk|cubicle|place)\b.*?\bat\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|o'clock)?\b/i, type: "scheduled_visit", timeResolver: (e, t) => {
  let n = parseInt(e[4]);
  const a = parseInt(e[5]) || 0, o = (e[6] || "").toLowerCase();
  return "pm" === o && n < 12 && (n += 12), "am" === o && 12 === n && (n = 0), !o && n < 7 && (n += 12), Tt(t, n, a);
} }, { regex: /\bat\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|o'clock)?\b.*?\b(come to|stop by|visit|meet)\b/i, type: "scheduled_visit", timeResolver: (e, t) => {
  let n = parseInt(e[1]);
  const a = parseInt(e[2]) || 0, o = (e[3] || "").toLowerCase();
  return "pm" === o && n < 12 && (n += 12), "am" === o && 12 === n && (n = 0), !o && n < 7 && (n += 12), Tt(t, n, a);
} }, { regex: /\b(text|message|call|ping|hit me up|let me know)\s*(me)?\s*(when|if|once)\s*(you('re|'ve| are| have)?|the)\s*(.{5,50})/i, type: "conditional_contact", timeResolver: (e, t) => ({ time: t + 72e5, isConditional: true, condition: e[0] }) }, { regex: /\bin\s*(?:about\s*)?(\d+)\s*(hour|minute|min|hr)s?\b/i, type: "relative_time", timeResolver: (e, t) => {
  const n = parseInt(e[1]), a = e[2].toLowerCase();
  return { time: t + n * (a.startsWith("hour") || "hr" === a ? 36e5 : 6e4) };
} }, { regex: /\b(this weekend|on saturday|on sunday|the weekend)\b.*?\b(let's|we should|want to|wanna|meet|hang out|get together)\b/i, type: "weekend_plans", timeResolver: (e, t) => $t(t) }, { regex: /\b(next week|on monday|on tuesday|on wednesday|on thursday|on friday)\b.*?\b(let's|we should|meet|talk|discuss|schedule)\b/i, type: "next_week", timeResolver: (e, t) => Ct(t, e[1].toLowerCase()) }];
function kt(e, t, n) {
  const a = new Date(e);
  "tomorrow" === t && a.setDate(a.getDate() + 1);
  const o = { morning: 9, lunch: 12, afternoon: 14, end_of_day: 17, evening: 19, night: 21 }[n] || 9;
  return a.setHours(o, 0, 0, 0), a.getTime() <= e && "today" === t && a.setDate(a.getDate() + 1), { time: a.getTime() };
}
function St(e, t) {
  const n = new Date(e), a = { breakfast: 8, coffee: 10, lunch: 12, dinner: 19, drinks: 18 }[t] || 12;
  return n.setHours(a, 0, 0, 0), n.getTime() <= e && n.setDate(n.getDate() + 1), { time: n.getTime() };
}
function Tt(e, t, n = 0) {
  const a = new Date(e);
  return a.setHours(t, n, 0, 0), a.getTime() <= e && a.setDate(a.getDate() + 1), { time: a.getTime() };
}
function $t(e) {
  const t = new Date(e), n = (6 - t.getDay() + 7) % 7 || 7;
  return t.setDate(t.getDate() + n), t.setHours(12, 0, 0, 0), { time: t.getTime() };
}
function Ct(e, t) {
  const n = new Date(e), a = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 };
  let o = null;
  for (const [e2, n2] of Object.entries(a)) if (t.includes(e2)) {
    o = n2;
    break;
  }
  null === o && (o = 1);
  let i = (o - n.getDay() + 7) % 7;
  return 0 === i && (i = 7), n.setDate(n.getDate() + i), n.setHours(10, 0, 0, 0), { time: n.getTime() };
}
function Et(e, t, n = false) {
  if (!e || !t) return [];
  const a = gameState.time?.currentTime || Date.now(), o = [];
  for (const i of xt) {
    const s = e.match(i.regex);
    if (s) {
      const r = i.timeResolver(s, a);
      r && r.time > a && (o.push({ id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, npcId: t.id, npcName: t.name, type: i.type, triggerTime: r.time, triggerWindow: 18e5, context: Mt(e, s), originalPhrase: s[0], source: n ? "player" : "npc", actionType: Pt(i.type, n), actionData: { condition: r.isConditional ? r.condition : null, fullMessage: e.slice(0, 200) }, status: "pending", createdAt: a, reminderSent: false }), console.log(`[Schedule] Detected ${i.type} commitment from ${n ? "player" : t.name}: "${s[0]}" \u2192 ${new Date(r.time).toLocaleString()}`));
    }
  }
  return o;
}
function Mt(e, t) {
  const n = e.toLowerCase().indexOf(t[0].toLowerCase()), a = Math.max(0, n - 50), o = Math.min(e.length, n + t[0].length + 50);
  return e.slice(a, o).trim();
}
function Pt(e, t) {
  return { future_contact: t ? "wait_for_player" : "send_message", same_day_meet: t ? "reminder" : "send_message", lunch_meet: "send_message", confirm_plans: "confirm_or_remind", scheduled_visit: t ? "reminder" : "send_message", conditional_contact: "check_condition", relative_time: "send_message", weekend_plans: "send_message", next_week: "send_message" }[e] || "send_message";
}
function Lt(e) {
  return gameState.npcScheduledEvents || (gameState.npcScheduledEvents = []), gameState.npcScheduledEvents.some((t) => t.npcId === e.npcId && t.type === e.type && Math.abs(t.triggerTime - e.triggerTime) < 72e5 && "pending" === t.status) ? (console.log(`[Schedule] Skipped duplicate event for ${e.npcName}`), false) : (gameState.npcScheduledEvents.push(e), console.log(`[Schedule] Added event: ${e.npcName} - ${e.type} at ${new Date(e.triggerTime).toLocaleString()}`), true);
}
async function Nt() {
  if (!gameState.npcScheduledEvents || 0 === gameState.npcScheduledEvents.length) return;
  const e = gameState.time?.currentTime || Date.now(), t = [];
  for (const n2 of gameState.npcScheduledEvents) {
    if ("pending" !== n2.status) continue;
    const a = e - n2.triggerTime, o = Math.abs(a) <= n2.triggerWindow, i = a > n2.triggerWindow;
    o ? t.push(n2) : i && (n2.status = "missed", console.log(`[Schedule] Missed event: ${n2.npcName} - ${n2.type}`));
  }
  for (const e2 of t) await _t(e2);
  const n = gameState.npcScheduledEvents.filter((e2) => "completed" === e2.status || "missed" === e2.status || "cancelled" === e2.status);
  if (n.length > 50) {
    const e2 = n.slice(0, n.length - 50);
    gameState.npcScheduledEvents = gameState.npcScheduledEvents.filter((t2) => !e2.includes(t2));
  }
}
async function _t(e) {
  const t = gameState.employees.find((t2) => t2.id === e.npcId);
  if (t) {
    console.log(`[Schedule] Executing event: ${t.name} - ${e.type} (${e.actionType})`), e.status = "triggered";
    try {
      switch (e.actionType) {
        case "send_message":
        default:
          await Rt(t, e);
          break;
        case "reminder":
          await Ot(t, e);
          break;
        case "confirm_or_remind":
          await Bt(t, e);
          break;
        case "wait_for_player":
          e.reminderSent || (await Ft(t, e), e.reminderSent = true);
          break;
        case "check_condition":
          await jt(t, e);
      }
      e.status = "completed";
    } catch (t2) {
      console.error("[Schedule] Error executing event:", t2), e.status = "missed";
    }
  } else e.status = "cancelled";
}
async function Rt(e, t) {
  const n = Dt(e, t, zt(t.triggerTime));
  try {
    const a = sanitizeNpcResponse(await queuedGenerateText(n, {}, `Scheduled message from ${e.name}`), 5);
    gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
    const o = gameState.time?.currentTime || Date.now();
    if (gameState.chatHistory[e.id].push({ sender: e.name, content: a, isPlayer: false, timestamp: o, isScheduledMessage: true, scheduleType: t.type }), e.unreadMessages || (e.unreadMessages = 0), e.unreadMessages++, showNotification(`\u{1F4AC} ${e.name} sent you a message`, "info"), gameState.activeChat?.id === e.id && chatMessages) {
      const t2 = gameState.chatHistory[e.id].length - 1;
      addChatMessage(e.name, a, false, null, t2, null, o), chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    saveGame(false), console.log(`[Schedule] Sent scheduled message from ${e.name}: "${a.slice(0, 50)}..."`);
  } catch (e2) {
    throw console.error("[Schedule] Failed to generate message:", e2), e2;
  }
}
function Dt(e, t, n) {
  const a = Gt(e), o = Vt(e.id, 5);
  let i = "";
  switch (t.type) {
    case "future_contact":
      i = `You promised to message or talk to the player ${n}. Now is that time. Send a friendly message following up on that commitment.`;
      break;
    case "same_day_meet":
      i = `You mentioned meeting up or seeing the player ${n}. Now is the time. Send a message about meeting up or checking if they're available.`;
      break;
    case "lunch_meet":
      i = "You have lunch plans with the player. It's around that time now. Send a message about meeting up for lunch.";
      break;
    case "confirm_plans":
      i = "The player asked to confirm plans. Respond enthusiastically confirming you're still on for the activity.";
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
  return `You are ${e.name}, ${e.position || "employee"} at ${e.companyName || "the company"}.

${a}

RECENT CONVERSATION:
${o}

ORIGINAL COMMITMENT: "${t.originalPhrase}"
CONTEXT: ${t.context}

INSTRUCTION: ${i}

Write a SHORT, natural message (1-3 sentences) following up on this. Be casual and in-character. Don't be overly formal. Reference the previous conversation naturally.`;
}
async function Ot(e, t) {
  const n = `You are ${e.name}. You had plans or a commitment with the player about: "${t.context}"

It's now the scheduled time. Send a very brief (1-2 sentences) reminder or check-in message. Be casual and friendly.`;
  try {
    const t2 = sanitizeNpcResponse(await queuedGenerateText(n, {}, `Reminder from ${e.name}`), 3);
    gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
    const a = gameState.time?.currentTime || Date.now();
    gameState.chatHistory[e.id].push({ sender: e.name, content: t2, isPlayer: false, timestamp: a, isScheduledMessage: true }), e.unreadMessages || (e.unreadMessages = 0), e.unreadMessages++, showNotification(`\u{1F4C5} ${e.name} sent a reminder`, "info"), saveGame(false);
  } catch (e2) {
    console.error("[Schedule] Reminder failed:", e2);
  }
}
async function Bt(e, t) {
  const n = `You are ${e.name}. The player asked if you're "still on" for plans: "${t.context}"

Send a brief, enthusiastic confirmation (1-2 sentences). Be friendly and confirm the plans.`;
  try {
    const t2 = sanitizeNpcResponse(await queuedGenerateText(n, {}, `Confirmation from ${e.name}`), 3);
    gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
    const a = gameState.time?.currentTime || Date.now();
    gameState.chatHistory[e.id].push({ sender: e.name, content: t2, isPlayer: false, timestamp: a, isScheduledMessage: true }), e.unreadMessages || (e.unreadMessages = 0), e.unreadMessages++, showNotification(`\u2705 ${e.name} confirmed plans`, "info"), saveGame(false);
  } catch (e2) {
    console.error("[Schedule] Confirmation failed:", e2);
  }
}
async function Ft(e, t) {
  const n = `You are ${e.name}. The player said they would "${t.context}" but it's now the scheduled time and they haven't followed through.

Send a casual, non-pushy message (1-2 sentences) gently reminding them or asking if they're still available. Don't be passive-aggressive.`;
  try {
    const t2 = sanitizeNpcResponse(await queuedGenerateText(n, {}, `Subtle reminder from ${e.name}`), 3);
    gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
    const a = gameState.time?.currentTime || Date.now();
    gameState.chatHistory[e.id].push({ sender: e.name, content: t2, isPlayer: false, timestamp: a, isScheduledMessage: true }), e.unreadMessages || (e.unreadMessages = 0), e.unreadMessages++, showNotification(`\u{1F4AD} ${e.name} is checking in`, "info"), saveGame(false);
  } catch (e2) {
    console.error("[Schedule] Subtle reminder failed:", e2);
  }
}
async function jt(e, t) {
  const n = t.actionData?.condition || t.context, a = `You are ${e.name}. The conversation mentioned: "${n}"

Send a brief follow-up message (1-2 sentences) checking in about this. Be casual and natural.`;
  try {
    const t2 = sanitizeNpcResponse(await queuedGenerateText(a, {}, `Conditional follow-up from ${e.name}`), 3);
    gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
    const n2 = gameState.time?.currentTime || Date.now();
    gameState.chatHistory[e.id].push({ sender: e.name, content: t2, isPlayer: false, timestamp: n2, isScheduledMessage: true }), e.unreadMessages || (e.unreadMessages = 0), e.unreadMessages++, saveGame(false);
  } catch (e2) {
    console.error("[Schedule] Conditional follow-up failed:", e2);
  }
}
function zt(e) {
  const t = new Date(e), n = new Date(gameState.time?.currentTime || Date.now()), a = t.toDateString() === n.toDateString(), o = new Date(n);
  o.setDate(o.getDate() + 1);
  const i = t.toDateString() === o.toDateString(), s = t.getHours();
  let r = "morning";
  return s >= 12 && s < 17 ? r = "afternoon" : s >= 17 && s < 21 ? r = "evening" : s >= 21 && (r = "night"), a ? `today (${r})` : i ? `tomorrow ${r}` : `${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][t.getDay()]} ${r}`;
}
function Gt(e) {
  const t = e.relationships?.player || { level: 0, type: "professional" }, n = e.stats?.affection || 0, a = e.stats?.trust || 0;
  let o = `Your relationship with the player: ${t.type} (level ${t.level}/100)
`;
  return o += `Affection: ${n}/100, Trust: ${a}/100
`, n > 70 ? o += "You have strong feelings for the player.\n" : n > 40 && (o += "You like the player quite a bit.\n"), o;
}
function Ht() {
  return !gameState?.settings?.disableStoryEvents;
}
function Ut(e) {
  if (!e) return null;
  const t = [];
  e.memory?.eventMemories && e.memory.eventMemories.length > 0 && [...e.memory.eventMemories].sort((e2, t2) => (t2.emotionalWeight || 3) - (e2.emotionalWeight || 3)).slice(0, 7).forEach((e2) => {
    const n2 = Wt(e2.timestamp), a = "positive" === e2.sentiment ? "(positive memory)" : "negative" === e2.sentiment ? "(still bothers me)" : "", o = (e2.emotionalWeight || 3) >= 5 ? "\u2B50" : "";
    t.push(`- ${n2}: "${e2.title}" - ${e2.outcome || e2.description} ${o}${a}`);
  }), gameState.story?.journal && gameState.story.journal.filter((t2) => !!t2.involvedCharacters?.includes(e.name) || !!t2.content?.toLowerCase().includes(e.name.toLowerCase())).slice(0, 5).forEach((e2) => {
    const n2 = Wt(e2.timestamp);
    if (!t.some((t2) => t2.includes(e2.title))) {
      const a = e2.memorable ? "\u2B50" : "";
      t.push(`- ${n2}: "${e2.title}" (${e2.type || "event"}) ${a}`);
    }
  }), gameState.story?.emergentNarratives?.activeArcs && gameState.story.emergentNarratives.activeArcs.filter((t2) => t2.participants?.includes(e.id) || t2.participants?.includes(e.name)).forEach((e2) => {
    t.push(`- ONGOING: "${e2.name}" storyline (${e2.stage || "in progress"})`);
  }), e.relationships?.player?.history && e.relationships.player.history.length > 0 && e.relationships.player.history.filter((e2) => e2.significant || e2.change > 10).slice(-3).forEach((e2) => {
    t.push(`- Our history: ${e2.event}`);
  }), void 0 !== StoryEngine && gameState.story?.spineProgress && Object.values(gameState.story.spineProgress).filter(Boolean).forEach((n2) => {
    (gameState.story?.actData?.[gameState.story.currentAct]?.spineEventsTriggered || []).some((t2) => t2.involvedEmployees?.includes(e.id) || t2.involvedEmployees?.includes(e.name)) && t.push(`- Part of major story event: ${n2}`);
  });
  const n = Yt(e);
  return n && t.push("", `\u{1F4AD} SPONTANEOUS: You're reminded of "${n.title}" and might naturally bring it up if the conversation allows.`), 0 === t.length ? null : `These are events/stories I was personally involved in with the boss (player). I remember these and can reference them:
${t.join("\n")}`;
}
function Yt(e) {
  if (!e?.memory?.eventMemories || 0 === e.memory.eventMemories.length) return null;
  if (Math.random() > 0.15) return null;
  const t = e.memory.eventMemories.filter((e2) => (e2.emotionalWeight || 3) >= 5 && (e2.referenced || 0) < 3 && false !== e2.canReference);
  if (0 === t.length) return null;
  const n = t.flatMap((e2) => Array((e2.emotionalWeight || 3) - 3).fill(e2)), a = n[Math.floor(Math.random() * n.length)] || t[0];
  return a && (a.referenced = (a.referenced || 0) + 1), a;
}
function Wt(e) {
  if (!e) return "recently";
  const t = (gameState.time?.currentTime || Date.now()) - e, n = Math.floor(t / 864e5);
  return n < 1 ? "today" : 1 === n ? "yesterday" : n < 7 ? `${n} days ago` : n < 14 ? "last week" : n < 30 ? `${Math.floor(n / 7)} weeks ago` : `${Math.floor(n / 30)} month(s) ago`;
}
function Vt(e, t = 5) {
  const n = (gameState.chatHistory[e] || []).slice(-t);
  return 0 === n.length ? "(No recent messages)" : n.map((e2) => `${e2.sender}: ${e2.content}`).join("\n");
}
function Kt(e) {
  return gameState.npcScheduledEvents ? gameState.npcScheduledEvents.filter((t) => t.npcId === e && "pending" === t.status).sort((e2, t) => e2.triggerTime - t.triggerTime) : [];
}
function cancelScheduledEvent(e) {
  if (!gameState.npcScheduledEvents) return false;
  const t = gameState.npcScheduledEvents.find((t2) => t2.id === e);
  return !(!t || "pending" !== t.status || (t.status = "cancelled", console.log(`[Schedule] Cancelled event: ${t.npcName} - ${t.type}`), 0));
}
function Jt(e, t, n) {
  if (e) {
    if (t) {
      const n2 = Et(t, e, true);
      for (const t2 of n2) Lt(t2) && console.log(`[Schedule] Player made commitment to ${e.name}: ${t2.type}`);
    }
    if (n) {
      const t2 = Et(n, e, false);
      for (const n2 of t2) if (Lt(n2)) {
        new Date(n2.triggerTime);
        const t3 = zt(n2.triggerTime);
        showNotification(`\u{1F4C5} ${e.name} scheduled: ${n2.type.replace(/_/g, " ")} (${t3})`, "info", 4e3);
      }
    }
  }
}
function Qt() {
  return gameState.npcScheduledEvents ? gameState.npcScheduledEvents.filter((e) => "pending" === e.status).sort((e, t) => e.triggerTime - t.triggerTime) : [];
}
function debugScheduledEvents() {
  const e = gameState.npcScheduledEvents || [];
  console.log("=== NPC Scheduled Events ==="), console.log(`Total: ${e.length}, Pending: ${e.filter((e2) => "pending" === e2.status).length}`);
  const t = e.filter((e2) => "pending" === e2.status).sort((e2, t2) => e2.triggerTime - t2.triggerTime);
  for (const e2 of t) {
    const t2 = new Date(e2.triggerTime);
    console.log(`- ${e2.npcName}: ${e2.type} at ${t2.toLocaleString()} | "${e2.originalPhrase}"`);
  }
}
