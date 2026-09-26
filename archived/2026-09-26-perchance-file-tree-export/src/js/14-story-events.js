// ============================================================================
// 14-story-events — Story event runner: style injection, dynamic event generation, AI judge, event panel UI + openEventPanel exports.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

const Kn = document.createElement("style");
function Jn() {
  if (!gameState.story?.settings?.storyEnabled || !Ht()) return;
  if (gameState.story.activeSpineEvent) return;
  const e = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus);
  if (e.length < 1) return;
  gameState.story.actionStats, gameState.story.moralScore;
  const t = e.find((e2) => (e2.stats?.comfort || 60) < 30);
  t && ((gameState.story.actionLog || []).find((e2) => "ignored_low_comfort" === e2.type && e2.context?.employeeId === t.id && Date.now() - e2.timestamp < 6e5) || StoryEngine.trackAction("ignored_low_comfort", { employeeId: t.id, employeeName: t.name, comfortLevel: t.stats?.comfort || 30 }));
  const n = e.find((e2) => (e2.stats?.trust || 50) < 25);
  if (n && ((gameState.story.actionLog || []).find((e2) => "ignored_low_trust" === e2.type && e2.context?.employeeId === n.id && Date.now() - e2.timestamp < 6e5) || StoryEngine.trackAction("ignored_low_trust", { employeeId: n.id, employeeName: n.name, trustLevel: n.stats?.trust || 25 })), StoryEngine.updateStoryUI(), Math.random() < 0.05 && e.length >= 3) {
    const t2 = e.reduce((e2, t3) => e2 + (t3.stats?.trust || 50), 0) / e.length, n2 = e.reduce((e2, t3) => e2 + (t3.stats?.productivity || 70), 0) / e.length;
    n2 > 85 && !gameState.story.narrativeFlags.high_performance_noted && Math.random() < 0.3 && (gameState.story.narrativeFlags.high_performance_noted = true, StoryEngine.addJournalEntry({ title: "\u{1F680} Peak Performance", content: `Your team is operating at exceptional levels. Average productivity: ${n2.toFixed(0)}%. They move with purpose and precision. This is what success looks like.`, type: "consequence", memorable: true })), t2 < 35 && !gameState.story.narrativeFlags.trust_crisis_noted && Math.random() < 0.3 && (gameState.story.narrativeFlags.trust_crisis_noted = true, StoryEngine.addJournalEntry({ title: "\u{1F976} Cold Shoulders", content: "The office feels different. Conversations stop when you enter rooms. Eye contact is avoided. Trust is fragile - once broken, it's hard to rebuild.", type: "consequence", memorable: true }));
  }
}
function Qn(e) {
  if (!gameState.story?.settings?.storyEnabled) return;
  const t = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus).length, n = e.firedDate || "alumni" === e.employmentStatus;
  StoryEngine.trackAction(n ? "rehired_former_employee" : "hired_employee", { employeeId: e.id, employeeName: e.name, totalEmployees: t, isRehire: n }), 1 !== t || gameState.story.narrativeFlags.firstHireComplete || StoryEngine.triggerSpineEvent("first_hire"), t <= 5 && (gameState.story.keyCharacters.find((t2) => t2.id === e.id) || gameState.story.keyCharacters.push({ id: e.id, name: e.name, role: "Early Believer", introduced: Date.now(), relationship: "employee" }));
}
function Xn(e, t) {
  gameState.story?.settings?.storyEnabled && (StoryEngine.trackAction("defeated_boss", { bossId: e, recruited: t }), t ? (StoryEngine.trackAction("recruited_boss", { bossId: e }), StoryEngine.trackAction("showed_mercy", { bossId: e })) : StoryEngine.trackAction("showed_no_mercy", { bossId: e }), gameState.story.narrativeFlags.firstBossDefeated || (gameState.story.narrativeFlags.firstBossDefeated = true, StoryEngine.addJournalEntry({ title: "\u2694\uFE0F First Victory", content: "You've defeated your first major adversary. The business world is taking notice.", type: "event", memorable: true })), "victoria_steele" !== e && "office_suite" !== e || (gameState.story.narrativeFlags.victoriaDefeated = true, t && (gameState.story.narrativeFlags.victoriaRecruited = true)));
}
function Zn(e) {
  if (!gameState.story?.settings?.storyEnabled) return;
  gameState.story.persistentMemories.push({ timeline: gameState.story.currentTimeline, keyEvents: gameState.story.journal.filter((e2) => e2.memorable), ending: StoryEngine.getAlignmentInfo(gameState.story.moralScore).name, moralScore: gameState.story.moralScore, timestamp: Date.now() }), gameState.story.currentTimeline++;
  const t = gameState.story.persistentMemories, n = gameState.story.currentTimeline;
  gameState.story = StoryEngine.getDefaultStoryState(), gameState.story.persistentMemories = t, gameState.story.currentTimeline = n, gameState.story.narrativeFlags.firstPrestigeComplete = true, StoryEngine.emergentCooldowns && StoryEngine.emergentCooldowns.clear();
  const a = ["firstPrestigeComplete"];
  Object.keys(gameState.story.narrativeFlags).forEach((e2) => {
    a.includes(e2) || delete gameState.story.narrativeFlags[e2];
  });
  const o = document.getElementById("memoriesSection");
  o && (o.style.display = "block"), StoryEngine.addJournalEntry({ title: "\u{1F300} New Timeline", content: `Timeline ${n} begins. Echoes of past choices ripple through time...`, type: "act_transition", memorable: true });
  const i = StoryEngine.getTimelineEchoes();
  i.length > 0 && setTimeout(() => {
    StoryEngine.addJournalEntry({ title: "\u{1F47B} Echoes of the Past", content: i[0].message, type: "spine", memorable: true });
  }, 5e3);
}
function eo() {
  return gameState.dynamicEvents || (gameState.dynamicEvents = { queue: [], generating: null, history: [], nextGenerationTime: Date.now() + 6e4, generationCooldown: 3e5, dismissedCount: 0, viewedTotal: 0, lastNotificationTime: 0 }), gameState.dynamicEvents;
}
Kn.textContent = "\n    @keyframes reflexPop {\n      0% { transform: scale(0); opacity: 0; }\n      50% { transform: scale(1.2); }\n      100% { transform: scale(1); opacity: 1; }\n    }\n  ", document.head.appendChild(Kn), window.StoryEngine = StoryEngine, window.filterJournal = function(e) {
  document.querySelectorAll(".journal-filter-btn").forEach((e2) => {
    e2.classList.remove("active");
  });
  const t = document.querySelector(`.journal-filter-btn[data-filter="${e}"]`);
  t && t.classList.add("active"), document.querySelectorAll(".journal-entry").forEach((t2) => {
    t2.style.display = "all" === e || t2.dataset.type === e ? "block" : "none";
  });
}, window.showActDetails = function(e) {
  const t = StoryEngine.ACT_CONFIG[e];
  if (!t) return;
  const n = (gameState.story.actData[e] || {}).spineEventsTriggered || [], a = gameState.story.currentAct === e, o = e > gameState.story.currentAct, i = e < gameState.story.currentAct;
  let s = "";
  o ? s = '<p style="color: var(--e); font-style: italic;">\u{1F512} Story events locked until you reach this act.</p>' : (StoryEngine.ACT_CONFIG[e], s = n.length > 0 ? n.map((e2) => `<div style="padding: 4px 0; border-bottom: 1px solid var(--o);">\u2705 ${e2.replace(/_/g, " ").replace(/\\b\\w/g, (e3) => e3.toUpperCase())}</div>`).join("") : '<p style="color: var(--e);">No major events triggered yet.</p>');
  const r = document.createElement("div");
  r.id = "actDetailsModal", r.style.cssText = "\n      position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: var(--an); z-index: 10000; display: flex;\n      justify-content: center; align-items: center; animation: fadeIn 0.3s ease;\n    ", r.innerHTML = ` <div style="background: linear-gradient(135deg, var(--ad), var(--w)); border: 2px solid ${i ? "var(--ek)" : a ? "var(--j)" : "var(--av)"}; border-radius: 16px; padding: 24px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px var(--ab);"> <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;"> <h2 style="margin: 0; color: ${i ? "var(--ek)" : a ? "var(--j)" : "var(--aw)"};">
            ${i ? "\u2713" : a ? "\u25B6\uFE0F" : "\u{1F512}"} Act ${e}: ${t.name} </h2> <button onclick="document.getElementById('actDetailsModal').remove()" style="background: none; border: none; color: var(--e); font-size: 24px; cursor: pointer;">&times;</button> </div> <p style="color: var(--a); margin-bottom: 16px; line-height: 1.6;">${t.description}</p> <div style="background: var(--am); border-radius: 8px; padding: 12px; margin-bottom: 16px;"> <div style="color: var(--e); font-size: 12px; margin-bottom: 8px;">STATUS</div> <div style="color: ${i ? "var(--ek)" : a ? "var(--z)" : "var(--as)"}; font-weight: bold;">
            ${i ? "\u2705 Completed" : a ? "\u{1F3AD} In Progress" : "\u{1F512} Locked"} </div> </div> <div style="background: var(--am); border-radius: 8px; padding: 12px; margin-bottom: 16px;"> <div style="color: var(--e); font-size: 12px; margin-bottom: 8px;">THEMES</div> <div style="display: flex; flex-wrap: wrap; gap: 6px;"> ${(t.themes || []).map((e2) => `<span style="background: rgba(102,126,234,0.2); color: var(--j); padding: 4px 8px; border-radius: 12px; font-size: 11px;">${e2}</span>`).join("")} </div> </div> <div style="background: var(--am); border-radius: 8px; padding: 12px;"> <div style="color: var(--e); font-size: 12px; margin-bottom: 8px;">STORY EVENTS</div> ${s} </div> </div> `, r.addEventListener("click", (e2) => {
    e2.target === r && r.remove();
  }), document.body.appendChild(r);
};
const oo = ["office incident", "interpersonal drama", "business opportunity", "employee personal issue", "tech/IT problem", "HR situation", "celebration", "crisis", "romantic/spicy situation", "legal matter", "community/charity", "workplace prank", "mysterious occurrence", "family dynamics"], ao = ["serious", "humorous", "dramatic", "heartwarming", "spicy", "mysterious", "urgent"];
function io() {
  const e = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus), t = (gameState.dynamicEvents?.history || []).slice(0, 5);
  let n = null;
  const a = (gameState.story?.eventChains || []).filter((e2) => "open" === e2.status && Date.now() - e2.lastEventTime > 18e4 && e2.sequelsPending > 0);
  if (a.length > 0 && Math.random() < 0.25) {
    const e2 = a[Math.floor(Math.random() * a.length)];
    n = { chainId: e2.id, originalEvent: e2.originalEvent, lastEvent: e2.lastEvent, theme: e2.theme, involvedCharacters: e2.involvedCharacters, playerStance: e2.playerStance, sequelNumber: e2.sequelCount + 1 };
  }
  const o = (gameState.story?.recurringCharacters || []).filter((e2) => e2.eventCount >= 2).slice(0, 3), i = [...e].sort(() => Math.random() - 0.5);
  let s;
  if (n && n.involvedCharacters?.length > 0) {
    const t2 = n.involvedCharacters, a2 = e.filter((e2) => t2.includes(e2.id) || t2.includes(e2.name));
    s = [...a2, ...i.filter((e2) => !a2.includes(e2))].slice(0, 4);
  } else if (o.length > 0 && Math.random() < 0.4) {
    const t2 = e.filter((e2) => o.some((t3) => t3.id === e2.id));
    s = [...t2, ...i.filter((e2) => !t2.includes(e2))].slice(0, 4);
  } else s = i.slice(0, Math.min(4, e.length));
  const r = s.map((t2) => {
    t2.performanceScore;
    const n2 = [];
    (t2.stats?.affection || 50) > 70 && n2.push("very affectionate"), (t2.stats?.trust || 50) < 30 && n2.push("distrustful"), (t2.stats?.productivity || 50) > 80 && n2.push("high performer"), (t2.stats?.comfort || 50) < 30 && n2.push("uncomfortable at work"), t2.career?.level >= 4 && n2.push("senior employee"), t2.inRelationshipWithPlayer && n2.push("in relationship with player");
    const a2 = o.find((e2) => e2.id === t2.id);
    a2 && n2.push(`appeared in ${a2.eventCount} previous events`);
    let i2 = null;
    if (t2.familyRelations && Object.keys(t2.familyRelations).length > 0) {
      const a3 = [];
      for (const [o2, i3] of Object.entries(t2.familyRelations)) {
        const t3 = e.find((e2) => e2.id === o2);
        t3 && (a3.push({ name: t3.name, relation: i3 }), n2.push(`has ${i3} (${t3.name}) at company`));
      }
      a3.length > 0 && (i2 = a3);
    }
    return { id: t2.id, name: t2.name, role: t2.career?.title || "Employee", department: t2.productManaged || "General", personality: t2.personality || "professional", traits: n2, backstory: t2.backstory ? t2.backstory.substring(0, 150) : null, familyAtWork: i2 };
  }), l = e.filter((t2) => t2.familyRelations && Object.keys(t2.familyRelations).some((t3) => e.some((e2) => e2.id === t3))), c = [], d = /* @__PURE__ */ new Set();
  l.forEach((t2) => {
    for (const [n2, a2] of Object.entries(t2.familyRelations || {})) {
      const o2 = e.find((e2) => e2.id === n2);
      if (o2) {
        const e2 = [t2.id, o2.id].sort().join("-");
        if (!d.has(e2)) {
          d.add(e2);
          let n3 = null, i2 = null, s2 = a2;
          const r2 = t2.age || 30, l2 = o2.age || 30;
          ["mother", "father", "parent"].includes(a2.toLowerCase()) ? (n3 = o2, i2 = t2, s2 = "male" === o2.gender ? "father" : "mother") : ["daughter", "son", "child"].includes(a2.toLowerCase()) ? (n3 = t2, i2 = o2, s2 = "male" === o2.gender ? "son" : "daughter") : r2 > l2 + 15 ? (n3 = t2, i2 = o2) : l2 > r2 + 15 && (n3 = o2, i2 = t2), c.push({ emp1: { id: t2.id, name: t2.name, age: r2, role: t2.career?.title || "Employee" }, emp2: { id: o2.id, name: o2.name, age: l2, role: o2.career?.title || "Employee" }, relationship: a2, parentChildContext: n3 && i2 ? { parent: { name: n3.name, age: n3.age || 30, role: n3.career?.title || "Employee" }, child: { name: i2.name, age: i2.age || 30, role: i2.career?.title || "Employee" }, roleReversal: (i2.career?.level || 0) > (n3.career?.level || 0), roleReversalNote: (i2.career?.level || 0) > (n3.career?.level || 0) ? `NOTE: ${i2.name} (the child) outranks ${n3.name} (the parent) at work!` : null } : null });
        }
      }
    }
  });
  const p = { cash: gameState.cash, cashFormatted: xu(gameState.cash), employeeCount: e.length, isStruggling: gameState.cash < 1e4, isThriving: gameState.cash > 5e5, hasOfficeCat: gameState.dynamicEvents?.officeCat || false, recentEventTypes: t.map((e2) => e2.category).filter(Boolean), hasFamilyMembers: c.length > 0 };
  let m;
  const u2 = gameState.story?.familyEventCooldown || 18e5, g = gameState.story?.lastFamilyEventTime || 0, h = gameState.story?.consecutiveFamilyEvents || 0, y = Date.now() - g < u2, f = h >= 2, b = 2 * c.length, v = 0.1 * Math.min(1, b / e.length);
  m = c.length > 0 && !y && !f && Math.random() < v ? "family dynamics" : oo[Math.floor(Math.random() * oo.length)];
  const w = ao[Math.floor(Math.random() * ao.length)], x = false !== gameState.settings?.adultContent;
  return { employees: r, company: p, suggestedCategory: n ? n.theme : m, suggestedTone: w, allowSpicy: x, recentEvents: t.map((e2) => e2.title).slice(0, 3), sequelContext: n, recurringCharacters: o.map((e2) => e2.name), familyPairs: c, hasFamilyAtCompany: c.length > 0 };
}
function ro(e, t = {}) {
  if (!gameState.story) return;
  gameState.story.eventChains || (gameState.story.eventChains = []);
  const n = t.existingChainId || "chain_" + Date.now(), a = gameState.story.eventChains.find((e2) => e2.id === n);
  a ? (a.lastEvent = { title: e.title, id: e.id }, a.lastEventTime = Date.now(), a.sequelCount++, a.sequelsPending = Math.max(0, a.sequelsPending - 1), (a.sequelsPending <= 0 || a.sequelCount >= 3) && (a.status = "complete")) : gameState.story.eventChains.push({ id: n, originalEvent: { title: e.title, id: e.id }, lastEvent: { title: e.title, id: e.id }, theme: e.category || "general", involvedCharacters: e.involvedEmployeeIds || [], playerStance: t.playerStance || "neutral", startTime: Date.now(), lastEventTime: Date.now(), sequelCount: 0, sequelsPending: t.sequelsPending || Math.floor(2 * Math.random()) + 1, status: "open" }), gameState.story.eventChains = gameState.story.eventChains.filter((e2) => "open" === e2.status || Date.now() - e2.lastEventTime < 6048e5);
}
async function lo() {
  if (gameState.settings?.disableStoryEvents) return null;
  const e = eo();
  if (e.generating || e.queue.length >= 3) return null;
  const t = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus).length;
  if (gameState.cash < 3e4 || t < 5) return null;
  e.generating = { startTime: Date.now(), status: "building_context" };
  try {
    const t2 = io();
    if (0 === t2.employees.length) return e.generating = null, null;
    e.generating.status = "generating_event";
    const n = t2.sequelContext ? `
\u26A0\uFE0F THIS IS A SEQUEL EVENT - Continue an existing storyline!
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
Original Event: "${t2.sequelContext.originalEvent.title}"
Last Event: "${t2.sequelContext.lastEvent.title}"
Theme: ${t2.sequelContext.theme}
Characters to feature: ${t2.sequelContext.involvedCharacters.join(", ")}
Player's previous stance: ${t2.sequelContext.playerStance}
This is sequel #${t2.sequelContext.sequelNumber}

\u{1F517} NARRATIVE COHERENCE REQUIREMENTS:
1. The event MUST be a DIRECT continuation of "${t2.sequelContext.lastEvent.title}"
2. Reference SPECIFIC details/consequences from the previous event
3. The same core conflict/situation should drive this event
4. Characters should acknowledge and react to what happened before
5. ${t2.sequelContext.sequelNumber >= 2 ? "This is the CLIMAX/RESOLUTION - bring the storyline to a meaningful conclusion!" : "ESCALATE the situation - raise the stakes, deepen the conflict!"}

\u274C DON'T: Create a tangentially related "meanwhile" event
\u274C DON'T: Just name-drop the previous event without real connection
\u274C DON'T: Introduce completely new unrelated plot threads
\u2705 DO: Show cause and effect from previous choices
\u2705 DO: Have characters reference specific past events by detail
\u2705 DO: Make this feel like Chapter 2 (or 3) of the SAME story
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
` : "", a = t2.recurringCharacters?.length > 0 ? `
RECURRING CHARACTERS (appeared in multiple events, players know them well):
${t2.recurringCharacters.join(", ")}
Consider featuring them for narrative continuity.
` : "", o = t2.hasFamilyAtCompany ? `
\u{1F468}\u200D\u{1F469}\u200D\u{1F467} FAMILY MEMBERS WORKING TOGETHER:
${t2.familyPairs.map((e2) => {
      let t3 = `- ${e2.emp1.name} is ${e2.relationship} of ${e2.emp2.name}`;
      if (e2.parentChildContext) {
        const n2 = e2.parentChildContext;
        t3 = `- PARENT: ${n2.parent.name} (age ${n2.parent.age}, ${n2.parent.role}) | CHILD: ${n2.child.name} (age ${n2.child.age}, ${n2.child.role})`, n2.roleReversalNote && (t3 += `
  \u26A0\uFE0F ${n2.roleReversalNote}`);
      }
      return t3;
    }).join("\n")}
${"family dynamics" === t2.suggestedCategory ? "\u26A0\uFE0F CREATE AN EVENT FEATURING THIS FAMILY DYNAMIC!\nCRITICAL: Respect the PARENT/CHILD roles listed above. The PARENT is the older one. The CHILD is the younger one.\nIf the child outranks the parent at work, explore that interesting power dynamic!\nConsider: parent-child workplace boundaries, family loyalty vs professional duty, favoritism accusations, protecting family members, or generational workplace differences." : "You may incorporate family dynamics if it fits naturally."}
` : "", i = Ge("full"), s = (gameState.employees || []).filter((e2) => "active" === e2.employmentStatus && e2.npcStatus && "sleeping" !== e2.npcStatus.current && "vampire_rest" !== e2.npcStatus.current).slice(0, 8).map((e2) => `${e2.name}: ${e2.npcStatus.label}`), r = s.length > 0 ? `
CURRENT NPC ACTIVITIES (use for realistic event grounding):
${s.join("; ")}
A story event can reference or be triggered by these activities \u2014 e.g., two NPCs both listed as "Out with Friends" could have a chance encounter.
` : "", l = `You are creating a dynamic company event for an office management game.
${i ? `
${i}` : ""}
COMPANY STATE:
- Cash: ${t2.company.cashFormatted}
- Employees: ${t2.company.employeeCount}
- Status: ${t2.company.isStruggling ? "Struggling financially" : t2.company.isThriving ? "Very successful" : "Stable"}
${t2.company.hasOfficeCat ? "- Has an office cat named Mr. Whiskers" : ""}
${t2.company.hasFamilyMembers ? "- Has family members working together" : ""}

FEATURED EMPLOYEES (use 1-3 of these):
${t2.employees.map((e2) => `- ${e2.name} (${e2.role}${e2.traits.length > 0 ? ", " + e2.traits.join(", ") : ""})`).join("\n")}
${a}${o}
RECENT EVENTS TO AVOID REPEATING: ${t2.recentEvents.length > 0 ? t2.recentEvents.join(", ") : "None yet"}
${r}${n}
GENERATE AN EVENT with these guidelines:
- Category hint: ${t2.suggestedCategory}
- Tone hint: ${t2.suggestedTone}
${t2.allowSpicy ? "- Can include mild romantic/spicy elements if appropriate" : "- Keep it workplace appropriate"}
- Be creative and engaging
- Ground it in the employees and company state provided
- Make it feel personal and memorable
${t2.sequelContext ? "- IMPORTANT: This MUST reference and continue from the previous event!" : ""}

RESPOND IN THIS EXACT JSON FORMAT:
{
  "title": "Short catchy title with emoji",
  "description": "2-3 sentences describing what's happening. Be vivid and engaging. Reference specific employees by name.",
  "category": "one of: incident, interpersonal, business, personal, tech, legal, celebration, crisis, romantic, mystery",
  "tone": "one of: serious, humorous, dramatic, heartwarming, spicy, mysterious, urgent",
  "involvedEmployeeNames": ["name1", "name2"],
  "isSequel": ${t2.sequelContext ? "true" : "false"},
  "canHaveSequel": true,
  "choices": [
    {"id": "a", "text": "First option with cost if any (e.g., \u{1F4B0} Fix it properly ($5000))", "costPercent": 0},
    {"id": "b", "text": "Second option - different approach", "costPercent": 0.5},
    {"id": "c", "text": "Third option - perhaps risky or cheap", "costPercent": 0}
  ],
  "imagePrompt": "A detailed prompt to generate an image for this event, describe the scene visually"
}

costPercent is a decimal from 0 to 2 representing what % of current company cash this option might cost (0 = free, 0.01 = 1%, etc).
Make costs realistic - minor things should be cheap, major decisions expensive.`, c = await queuedGenerateText(l);
    if (!c) return e.generating = null, null;
    let d;
    try {
      let e2 = c;
      const t3 = c.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (t3) e2 = t3[1].trim();
      else {
        const t4 = c.match(/\{[\s\S]*\}/);
        t4 && (e2 = t4[0]);
      }
      d = JSON.parse(e2);
    } catch (t3) {
      return console.error("[DynamicEvents] Failed to parse AI response:", t3), e.generating = null, null;
    }
    e.generating.status = "generating_image";
    let p = null;
    try {
      if (d.imagePrompt) {
        const e2 = `Office scene: ${d.imagePrompt}. Professional modern office setting.`;
        p = await queuedGenerateImage("function" == typeof applyImageStyle ? applyImageStyle(e2) : e2, `Event Image: ${d.title}`);
      }
    } catch (e2) {
      console.error("[DynamicEvents] Image generation failed:", e2);
    }
    e.generating.status = "judging_event";
    const m = await uo(d);
    if (m.total < 20) return console.log("[DynamicEvents] Event rejected by judge (score too low):", m), e.generating = null, null;
    e.generating.status = "generating_outcomes";
    const u2 = `For this office event, generate the outcomes for each choice.

EVENT: ${d.title}
DESCRIPTION: ${d.description}
INVOLVED EMPLOYEES: ${d.involvedEmployeeNames.join(", ")}

CHOICES:
${d.choices.map((e2, t3) => `${t3 + 1}. ${e2.text}`).join("\n")}

For each choice, generate:
1. A 1-2 sentence outcome description (what happens as a result)
2. Effects on company morale (productivity, comfort, affection, trust) as numbers from -20 to +20
3. Effects on the involved employees specifically

RESPOND IN JSON:
{
  "outcomes": [
    {
      "choiceId": "a",
      "text": "What happens when they choose this option...",
      "companyEffects": {"productivity": 5, "comfort": 0, "affection": 10, "trust": 0},
      "employeeEffects": [{"name": "EmployeeName", "stat": "affection", "change": 15, "reason": "brief reason"}],
      "duration": 7
    },
    ...for each choice
  ]
}`, g = await queuedGenerateText(u2);
    let h = [];
    try {
      let e2 = g;
      const t3 = g.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (t3) e2 = t3[1].trim();
      else {
        const t4 = g.match(/\{[\s\S]*\}/);
        t4 && (e2 = t4[0]);
      }
      const n2 = JSON.parse(e2);
      h = n2.outcomes || [];
    } catch (e2) {
      console.error("[DynamicEvents] Failed to parse outcomes:", e2), h = d.choices.map((e3) => ({ choiceId: e3.id, text: "The situation resolved.", companyEffects: {}, employeeEffects: [], duration: 7 }));
    }
    const y = gameState.cash;
    d.choices = d.choices.map((e2, t3) => ({ ...e2, cost: Math.floor(y * (e2.costPercent || 0)), outcome: h.find((t4) => t4.choiceId === e2.id) || h[t3] || { text: "The situation was handled.", companyEffects: {}, employeeEffects: [], duration: 7 } }));
    const f = d.involvedEmployeeNames.map((e2) => {
      const t3 = gameState.employees.find((t4) => t4.name.toLowerCase() === e2.toLowerCase());
      return t3?.id;
    }).filter(Boolean), b = { id: "dyn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9), title: d.title, description: d.description, category: d.category, tone: d.tone, imageUrl: p, involvedEmployeeIds: f, choices: d.choices, judgeScore: m, generatedAt: Date.now(), status: "pending", resolved: false, isSequel: d.isSequel || false, canHaveSequel: false !== d.canHaveSequel, chainId: t2.sequelContext?.chainId || null };
    return b.canHaveSequel && !b.isSequel ? Math.random() < 0.35 && ro(b, { sequelsPending: Math.floor(2 * Math.random()) + 1 }) : b.isSequel && t2.sequelContext && ro(b, { existingChainId: t2.sequelContext.chainId }), e.queue.push(b), e.generating = null, e.nextGenerationTime = Date.now() + e.generationCooldown, po(), yo(b), console.log("[DynamicEvents] New event generated:", b.title, "Score:", m.total, b.isSequel ? "(SEQUEL)" : ""), b;
  } catch (t2) {
    return console.error("[DynamicEvents] Generation failed:", t2), e.generating = null, null;
  }
}
async function uo(e) {
  const t = `You are an AI Judge evaluating a generated office event for a game.

EVENT:
Title: ${e.title}
Description: ${e.description}
Category: ${e.category}
Choices offered: ${e.choices.map((e2) => e2.text).join(" | ")}

Rate this event on each criterion from 1-10:
- Creativity: How original and unexpected is this event?
- Impact: Does this feel like it matters to the player?
- Fun: Would a player enjoy this event?
- Quality: Is the writing good? Does it make sense?

RESPOND IN JSON ONLY:
{"creativity": 7, "impact": 6, "fun": 8, "quality": 7, "notes": "brief comment"}`;
  try {
    const e2 = await queuedGenerateText(t);
    let n = e2;
    const a = e2.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (a) n = a[1].trim();
    else {
      const t2 = e2.match(/\{[\s\S]*\}/);
      t2 && (n = t2[0]);
    }
    const o = JSON.parse(n);
    return { creativity: Math.min(10, Math.max(1, o.creativity || 5)), impact: Math.min(10, Math.max(1, o.impact || 5)), fun: Math.min(10, Math.max(1, o.fun || 5)), quality: Math.min(10, Math.max(1, o.quality || 5)), total: (o.creativity || 5) + (o.impact || 5) + (o.fun || 5) + (o.quality || 5), notes: o.notes || "" };
  } catch (e2) {
    return console.error("[DynamicEvents] Judge failed:", e2), { creativity: 5, impact: 5, fun: 5, quality: 5, total: 20, notes: "Auto-scored" };
  }
}
function po() {
  if (gameState.settings?.disableStoryEvents) {
    const e2 = document.getElementById("eventBellDot"), t2 = document.getElementById("eventBellCount"), n2 = document.getElementById("eventBellBtn");
    return e2 && (e2.style.display = "none"), t2 && (t2.style.display = "none"), void (n2 && (n2.style.animation = "none"));
  }
  let e = 0;
  void 0 !== StoryEngine && StoryEngine.getMinorEventCount && (e += StoryEngine.getMinorEventCount()), e += eo().queue.filter((e2) => "pending" === e2.status).length;
  const t = document.getElementById("eventBellBtn"), n = document.getElementById("eventBellDot"), a = document.getElementById("eventBellCount");
  t && (e > 0 ? (n && (n.style.display = "block"), a && (a.textContent = e, a.style.display = "flex"), t.style.animation = "bellGlow 2s infinite", t.title = `${e} new event${e > 1 ? "s" : ""} waiting!`) : (n && (n.style.display = "none"), a && (a.style.display = "none"), t.style.animation = "none", t.title = "Company Events"));
}
function yo(e) {
  if (gameState.settings?.disableStoryEvents) return;
  const t = eo();
  if (Date.now() - t.lastNotificationTime < 1e4) return;
  t.lastNotificationTime = Date.now();
  const n = document.createElement("div");
  n.className = "event-corner-notification", n.style.cssText = "\n      position: fixed;\n      bottom: 20px;\n      right: 20px;\n      background: linear-gradient(135deg, var(--ad) 0%, var(--w) 100%);\n      border: 2px solid var(--j);\n      border-radius: 12px;\n      padding: 15px 20px;\n      max-width: 350px;\n      z-index: 99999;\n      cursor: pointer;\n      animation: slideInRight 0.4s ease-out, fadeOut 0.5s ease-in 8s forwards;\n      box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);\n    ", n.innerHTML = ` <div style="display:flex; align-items:center; gap:12px;"> <div style="font-size:2rem;">\u{1F514}</div> <div style="flex:1;"> <div style="color:var(--j); font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">New Event</div> <div style="color:var(--b); font-size:0.95rem; font-weight:600; margin-top:3px;">${e.title}</div> <div style="color:var(--a); font-size:0.8rem; margin-top:4px;">Click to view</div> </div> <button onclick="event.stopPropagation(); this.parentElement.parentElement.remove();" style="background:transparent; border:none; color:var(--e); font-size:1.2rem; cursor:pointer; padding:5px;">\xD7</button> </div> `, n.onclick = () => {
    n.remove(), openEventPanel();
  }, document.body.appendChild(n), setTimeout(() => {
    n.parentElement && n.remove();
  }, 9e3);
}
function fo(e, t) {
  const n = document.getElementById("eventPanelModal");
  n && n.remove();
  const a = (e.involvedEmployeeIds || []).map((e2) => gameState.employees.find((t2) => t2.id === e2)).filter(Boolean), o = document.createElement("div");
  o.id = "eventPanelModal", o.style.cssText = "\n      position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: var(--bn); z-index: 100000;\n      display: flex; justify-content: center; align-items: center;\n      animation: fadeIn 0.3s ease-out;\n      padding: 20px;\n      box-sizing: border-box;\n    ";
  let i = "";
  a.length > 0 && (i = ` <div style="display:flex; justify-content:center; gap:15px; margin:15px 0;"> ${a.map((e2) => ` <div style="text-align:center;"> <img src="${e2.profileImage || e2.generatedPortrait || "https://placehold.co/70x70"}" style="width:60px; height:60px; border-radius:50%; border:3px solid var(--j); object-fit:cover;"> <div style="font-size:0.75rem; color:var(--b); margin-top:5px;">${e2.name}</div> <div style="font-size:0.65rem; color:var(--a);">${e2.career?.title || "Employee"}</div> </div> `).join("")} </div> `);
  let s = "";
  e.imageUrl && (s = ` <div style="margin:15px 0; border-radius:10px; overflow:hidden;"> <img src="${e.imageUrl}" style="width:100%; max-height:200px; object-fit:cover;"> </div> `);
  const r = e.choices.map((t2, n2) => {
    const a2 = gameState.cash >= (t2.cost || 0), o2 = t2.cost > 0 ? xu(t2.cost) : "", i2 = t2.minigame && void 0 !== StoryMinigames, s2 = i2 ? StoryMinigames.GAME_TYPES[t2.minigame.type]?.icon || "\u{1F3AE}" : "", r2 = i2 ? ` <span style=" display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #667eea33, #764ba233); padding: 3px 8px; border-radius: 12px; font-size: 0.7rem; color: var(--s); margin-left: 8px; ">${s2} Skill Check</span> ` : "";
    return ` <button onclick="resolveDynamicEvent('${e.id}', ${n2}, null)"
                style="width:100%; padding:14px 16px; margin:6px 0; 
                       background:${a2 ? "var(--w)" : "var(--ad)"}; 
                       border:2px solid ${a2 ? "var(--j)" : "var(--av)"}; 
                       border-radius:10px; color:${a2 ? "var(--b)" : "var(--as)"}; 
                       cursor:${a2 ? "pointer" : "not-allowed"}; 
                       font-size:0.9rem; text-align:left;
                       transition: all 0.2s ease;
                       display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;
                       ${a2 ? "" : "opacity:0.6;"}"
                ${a2 ? "" : "disabled"} onmouseenter="if(!this.disabled){this.style.borderColor='var(--l)'; this.style.transform='translateX(5px)';}" onmouseleave="if(!this.disabled){this.style.borderColor='var(--j)'; this.style.transform='translateX(0)';}"> <span style="display:flex; align-items:center;">${t2.text}${r2}</span> ${o2 ? `<span style="color:var(--v); font-size:0.8rem; margin-left:10px;">${o2}</span>` : ""} </button> `;
  }).join(""), l = e.judgeScore ? ` <div style="position:absolute; top:15px; right:15px; background:var(--ab); padding:6px 10px; border-radius:8px; font-size:0.7rem;"> <span style="color:var(--m);">\u2605</span> <span style="color:var(--a);">${e.judgeScore.total}/40</span> </div> ` : "", c = { incident: "var(--db)", interpersonal: "var(--l)", business: "var(--n)", personal: "var(--j)", tech: "var(--u)", legal: "var(--ei)", celebration: "var(--z)", crisis: "#ff0000", romantic: "var(--v)", mystery: "var(--ap)" }[e.category] || "var(--j)", d = document.createElement("div");
  d.style.cssText = `
      background: linear-gradient(135deg, var(--ad) 0%, var(--w) 100%);
      border-radius: 15px; max-width: 550px; width: 100%;
      padding: 25px; position: relative;
      border: 2px solid ${c};
      box-shadow: 0 20px 60px var(--ab);
      max-height: 90vh; overflow-y: auto;
    `, d.innerHTML = `
      ${l} <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"> <span style="background:${c}; color:var(--b); padding:4px 10px; border-radius:20px; font-size:0.7rem; text-transform:uppercase;">
          ${e.category || "Event"} </span> ${t > 1 ? `<span style="color:var(--a); font-size:0.75rem;">+${t - 1} more</span>` : ""} <button onclick="dismissDynamicEvent('${e.id}')" style="margin-left:auto; background:transparent; border:none; color:var(--e); cursor:pointer; font-size:0.8rem;" title="Dismiss this event"> Skip \u2192 </button> </div> <h2 style="margin:0 0 10px 0; color:var(--b); font-size:1.4rem;"> ${e.title} </h2> ${s}
      ${i} <p style="color:var(--ao); font-size:0.9rem; line-height:1.6; margin-bottom:20px;"> ${e.description} </p> <div style="border-top:1px solid var(--o); padding-top:15px;"> <div style="color:var(--a); font-size:0.75rem; margin-bottom:8px;">Choose your response:</div> ${r} <!-- Open-ended response option --> <div style="margin-top:15px; padding-top:15px; border-top:1px dashed var(--ag);"> <div style="color:var(--a); font-size:0.75rem; margin-bottom:8px;">Or take a different approach:</div> <div style="display:flex; gap:8px;"> <input type="text" id="customResponseInput" placeholder="Type your own action..." style="flex:1; padding:12px; background:var(--ae); border:2px solid var(--o); border-radius:8px; color:var(--b); font-size:0.9rem;" onkeypress="if(event.key==='Enter') resolveDynamicEvent('${e.id}', -1, this.value)"> <button onclick="resolveDynamicEvent('${e.id}', -1, document.getElementById('customResponseInput').value)" style="padding:12px 20px; background:var(--j); border:none; border-radius:8px; color:var(--s); cursor:pointer;"> Do it </button> </div> </div> </div> <div style="text-align:center; margin-top:15px; color:var(--e); font-size:0.75rem;"> \u{1F4B0} ${xu(gameState.cash)} available </div> `, o.appendChild(d), document.body.appendChild(o), e.status = "viewed";
}
async function vo(e, t) {
  const n = (e.involvedEmployeeIds || []).map((e2) => gameState.employees.find((t2) => t2.id === e2)).filter(Boolean), a = `In an office management game, the player chose a custom response to an event.

EVENT: ${e.title}
DESCRIPTION: ${e.description}
CATEGORY: ${e.category || "general"}
INVOLVED EMPLOYEES: ${n.map((e2) => e2.name).join(", ") || "None specifically"}

PLAYER'S CUSTOM ACTION: "${t}"

Generate a realistic outcome for this action. Consider:
- Is this action reasonable/possible?
- What would the consequences be (good OR bad)?
- How would the employees react?

AVAILABLE CONSEQUENCE TYPES (use for serious negative outcomes):
- Fine/penalty: Set "specialEffect": {"type": "fine", "amount": 5000-100000, "reason": "why"}
- Product shutdown: Set "specialEffect": {"type": "disable_product", "duration": 1-7, "reason": "why"}
- Employee quits: Set "specialEffect": {"type": "employee_quits", "reason": "why they left"}
- Investigation: Set "specialEffect": {"type": "investigation", "duration": 7-30, "reason": "what triggered it"}

AVAILABLE BENEFIT TYPES (use for good outcomes):
- Cash bonus: Set "specialEffect": {"type": "bonus_cash", "amount": 1000-25000, "reason": "source"}
- Loyalty boost: Set "specialEffect": {"type": "loyalty_boost", "duration": 7-14}
- Reputation boost: Set "specialEffect": {"type": "reputation_boost", "amount": 5-15}
- Productivity boost: Set "specialEffect": {"type": "temporary_buff", "stat": "productivity", "multiplier": 1.2, "duration": 7}

RESPOND IN JSON:
{
  "text": "1-2 sentences describing what happens as a result of the player's action",
  "companyEffects": {"productivity": 0, "comfort": 0, "affection": 0, "trust": 0},
  "employeeEffects": [{"name": "EmployeeName", "stat": "trust", "change": 5, "reason": "brief reason"}],
  "specialEffect": null or {"type": "effect_type", ...params},
  "duration": 7,
  "wasClever": true
}

companyEffects range from -20 to +20. wasClever is true if the player's response was creative or smart.`, o = await queuedGenerateText(a);
  try {
    let e2 = o;
    const t2 = o.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (t2) e2 = t2[1].trim();
    else {
      const t3 = o.match(/\{[\s\S]*\}/);
      t3 && (e2 = t3[0]);
    }
    return JSON.parse(e2);
  } catch (e2) {
    return console.error("[DynamicEvents] Failed to parse custom outcome:", e2), { text: "Your approach had unexpected results...", companyEffects: {}, employeeEffects: [], duration: 7 };
  }
}
function bo(e, t, n = null) {
  const a = document.createElement("div");
  a.id = "eventOutcomeModal", a.style.cssText = "\n      position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: var(--an); z-index: 100000;\n      display: flex; justify-content: center; align-items: center;\n      animation: fadeIn 0.3s ease-out;\n    ";
  let o = "";
  if (n) {
    const e2 = { perfect: { bg: "var(--z)", text: "var(--bj)", icon: "\u2B50" }, success: { bg: "var(--n)", text: "var(--bj)", icon: "\u2713" }, partial: { bg: "var(--db)", text: "var(--bj)", icon: "~" }, failure: { bg: "var(--l)", text: "var(--b)", icon: "\u2717" } }, t2 = e2[n.result] || e2.partial;
    o = ` <div style="margin-bottom:15px;"> <span style="display:inline-block; background:${t2.bg}; color:${t2.text}; padding:6px 16px; border-radius:20px; font-size:0.85rem; font-weight:bold;">
            ${t2.icon} Skill Check: ${n.result.toUpperCase()} </span> </div> `;
  }
  let i = "";
  if (t.companyEffects && Object.keys(t.companyEffects).length > 0) {
    const e2 = [];
    for (const [n2, a2] of Object.entries(t.companyEffects)) {
      if ("duration" === n2 || 0 === a2) continue;
      const t2 = a2 > 0 ? "+" : "", o2 = a2 > 0 ? "var(--n)" : "var(--l)";
      e2.push(`<span style="color:${o2}">${t2}${a2} ${n2}</span>`);
    }
    e2.length > 0 && (i = ` <div style="margin-top:15px; padding:12px; background:var(--am); border-radius:8px; font-size:0.85rem;"> <div style="color:var(--a); font-size:0.7rem; margin-bottom:5px;">Company Effects:</div> ${e2.join(" \u2022 ")} <div style="color:var(--e); font-size:0.7rem; margin-top:5px;">Duration: ${t.duration || 7} days</div> </div> `);
  }
  let s = "";
  t.employeeEffects && t.employeeEffects.length > 0 && (s = ` <div style="margin-top:10px; font-size:0.8rem;"> ${t.employeeEffects.map((e2) => {
    const t2 = e2.change > 0 ? "+" : "", n2 = e2.change > 0 ? "var(--n)" : "var(--l)";
    return `<div style="color:var(--a);">\u2022 ${e2.name}: <span style="color:${n2}">${t2}${e2.change} ${e2.stat}</span></div>`;
  }).join("")} </div> `);
  const r = (t.companyEffects?.productivity || 0) + (t.companyEffects?.affection || 0) + (t.companyEffects?.trust || 0) > 0, l = document.createElement("div");
  l.style.cssText = `
      background: linear-gradient(135deg, var(--ad) 0%, var(--w) 100%);
      border-radius: 15px; max-width: 480px; width: 90%;
      padding: 30px; text-align: center;
      border: 2px solid ${r ? "var(--n)" : "var(--j)"};
      box-shadow: 0 20px 60px var(--ab);
    `, l.innerHTML = `
      ${o} <div style="font-size:3rem; margin-bottom:15px;">${r ? "\u2728" : "\u{1F4CB}"}</div> <h2 style="margin:0 0 15px 0; color:var(--b); font-size:1.2rem;">Outcome</h2> <p style="color:var(--ao); font-size:0.95rem; line-height:1.6; margin-bottom:15px;"> ${t.text} </p> ${i}
      ${s}
      ${t.wasClever ? '<div style="color:var(--m); margin-top:10px; font-size:0.85rem;">\u2728 Clever approach!</div>' : ""} <button onclick="document.getElementById('eventOutcomeModal').remove(); checkForMoreEvents();" style="margin-top:25px; padding:12px 40px; background:var(--j); border:none; border-radius:8px; color:var(--s); font-size:1rem; cursor:pointer; transition: all 0.2s ease;" onmouseenter="this.style.background='#7c8dea'" onmouseleave="this.style.background='var(--j)'"> Continue </button> `, a.appendChild(l), document.body.appendChild(a);
}
function wo() {
  if (gameState.settings?.disableStoryEvents) return;
  const e = eo();
  if (!gameState.story?.activeMultiStepEvent) {
    if (Math.random() < 5e-3) {
      const e2 = StoryEngine.getAvailableMultiStepEvents();
      if (e2.length > 0) {
        const t = e2[Math.floor(Math.random() * e2.length)];
        return console.log("[DynamicEvents] \u{1F3AC} Triggering multi-step event:", t), void StoryEngine.startMultiStepEvent(t);
      }
    }
    Date.now() >= e.nextGenerationTime && !e.generating && (Math.random() < 0.3 ? lo().catch((e2) => console.error("[DynamicEvents] Generation error:", e2)) : e.nextGenerationTime = Date.now() + 6e4);
  }
}
window.openEventPanel = function() {
  if (gameState.settings?.disableStoryEvents) return void showNotification("\u{1F4D6} Story Mode & Events are disabled. Enable them in Settings > Content to view events.", "info");
  if (void 0 !== StoryEngine && StoryEngine.openMinorEventsPanel) {
    if (StoryEngine.getMinorEventCount() > 0) return void StoryEngine.openMinorEventsPanel();
    const e2 = eo();
    if (0 === e2.queue.filter((e3) => "pending" === e3.status).length) {
      const t2 = document.createElement("div");
      t2.id = "eventPanelModal", t2.style.cssText = "\n          position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n          background: var(--bn); z-index: 100000;\n          display: flex; justify-content: center; align-items: center;\n          animation: fadeIn 0.3s ease-out;\n        ";
      const n2 = StoryEngine.initializeMinorEvents().generating || e2.generating;
      return t2.innerHTML = ` <div style="background: linear-gradient(135deg, var(--ad) 0%, var(--w) 100%); border-radius: 15px; max-width: 450px; width: 90%; padding: 40px; text-align: center; border: 2px solid var(--o);"> <div style="font-size:4rem; margin-bottom:20px; opacity:0.5;">\u{1F514}</div> <h2 style="margin:0 0 10px 0; color:var(--b);">No Pending Events</h2> <p style="color:var(--a); margin-bottom:25px;">New events will appear here when something happens at your company.</p> ${n2 ? ' <div style="color:var(--j); font-size:0.9rem;"> <div class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid var(--j); border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite; vertical-align:middle; margin-right:8px;"></div> Generating new event... </div> ' : ""} <button onclick="document.getElementById('eventPanelModal').remove()" style="margin-top:20px; padding:12px 40px; background:var(--ag); border:none; border-radius:8px; color:var(--b); font-size:1rem; cursor:pointer;"> Close </button> </div> `, void document.body.appendChild(t2);
    }
  }
  const e = eo(), t = e.queue.filter((e2) => "pending" === e2.status), n = document.createElement("div");
  if (n.id = "eventPanelModal", n.style.cssText = "\n      position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: var(--bn); z-index: 100000;\n      display: flex; justify-content: center; align-items: center;\n      animation: fadeIn 0.3s ease-out;\n    ", 0 === t.length) return n.innerHTML = ` <div style="background: linear-gradient(135deg, var(--ad) 0%, var(--w) 100%); border-radius: 15px; max-width: 450px; width: 90%; padding: 40px; text-align: center; border: 2px solid var(--o);"> <div style="font-size:4rem; margin-bottom:20px; opacity:0.5;">\u{1F514}</div> <h2 style="margin:0 0 10px 0; color:var(--b);">No Pending Events</h2> <p style="color:var(--a); margin-bottom:25px;">New events will appear here when something happens at your company.</p> ${e.generating ? ' <div style="color:var(--j); font-size:0.9rem;"> <div class="spinner" style="display:inline-block; width:16px; height:16px; border:2px solid var(--j); border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite; vertical-align:middle; margin-right:8px;"></div> Generating new event... </div> ' : ""} <button onclick="document.getElementById('eventPanelModal').remove()" style="margin-top:20px; padding:12px 40px; background:var(--ag); border:none; border-radius:8px; color:var(--b); font-size:1rem; cursor:pointer;"> Close </button> </div> `, void document.body.appendChild(n);
  fo(t[0], t.length);
}, window.dismissDynamicEvent = function(e) {
  const t = eo(), n = t.queue.findIndex((t2) => t2.id === e);
  if (-1 !== n) {
    const e2 = t.queue[n];
    e2.status = "dismissed", e2.resolved = true, t.history.unshift(e2), t.queue.splice(n, 1), t.dismissedCount++, t.history.length > 50 && t.history.pop(), void 0 !== StoryEngine && StoryEngine.addJournalEntry && StoryEngine.addJournalEntry({ title: e2.title, content: `${e2.description}

[Event was dismissed without a decision]`, type: "minor", category: e2.category || "company", memorable: false }), po();
    const a = t.queue.filter((e3) => "pending" === e3.status || "viewed" === e3.status);
    if (a.length > 0) fo(a[0], a.length);
    else {
      const e3 = document.getElementById("eventPanelModal");
      e3 && e3.remove();
    }
  }
}, window.resolveDynamicEvent = async function(e, t, n) {
  const a = eo(), o = a.queue.findIndex((t2) => t2.id === e);
  if (-1 === o) return;
  const i = a.queue[o];
  let s, r;
  if (t >= 0 && t < i.choices.length) {
    if (s = i.choices[t], s.cost > 0 && gameState.cash < s.cost) return void showNotification("\u274C Not enough cash!", "error");
    if (s.minigame && void 0 !== StoryMinigames) {
      const n2 = document.getElementById("eventPanelModal");
      n2 && (n2.style.opacity = "0", n2.style.pointerEvents = "none");
      const a2 = s.minigame;
      return void StoryMinigames.launchMinigame(a2.type, { title: a2.title || s.text, themeText: a2.description || "Complete the skill check!", difficulty: a2.difficulty || "medium" }, (n3) => {
        resolveDynamicEventAfterMinigame(e, t, n3);
      });
    }
    r = s.outcome, s.cost > 0 && (gameState.cash -= s.cost);
  } else {
    if (!n || !n.trim()) return;
    {
      const e2 = document.getElementById("eventPanelModal");
      if (e2) {
        const t2 = e2.querySelector('button[onclick*="resolveDynamicEvent"]');
        t2 && (t2.disabled = true, t2.textContent = "Thinking...");
      }
      try {
        r = await vo(i, n.trim());
      } catch (e3) {
        console.error("[DynamicEvents] Custom outcome generation failed:", e3), r = { text: "Your unconventional approach had mixed results.", companyEffects: {}, employeeEffects: [], duration: 7 };
      }
      s = { text: n.trim(), cost: 0 };
    }
  }
  if (r.companyEffects && Po(r.companyEffects), r.employeeEffects && r.employeeEffects.length > 0 && r.employeeEffects.forEach((e2) => {
    const t2 = gameState.employees.find((t3) => t3.name.toLowerCase() === e2.name?.toLowerCase() || t3.id === e2.employeeId);
    t2 && Co(t2, e2);
  }), r.specialEffect && void 0 !== StoryEngine && StoryEngine.executeGameplayEffect(r.specialEffect), i.resolved = true, i.status = "resolved", i.chosenOption = t, i.customResponse = n, i.outcomeText = r.text, i.resolvedAt = Date.now(), "family" === i.category || "family dynamics" === i.category ? gameState.story && (gameState.story.lastFamilyEventTime = Date.now(), gameState.story.consecutiveFamilyEvents = (gameState.story.consecutiveFamilyEvents || 0) + 1) : gameState.story && (gameState.story.consecutiveFamilyEvents = 0), a.history.unshift(i), a.queue.splice(o, 1), a.viewedTotal++, a.history.length > 50 && a.history.pop(), void 0 !== StoryEngine && StoryEngine.addJournalEntry) {
    const e2 = (i.involvedEmployeeIds || []).map((e3) => gameState.employees.find((t2) => t2.id === e3)).filter(Boolean);
    StoryEngine.addJournalEntry({ title: i.title, content: `${i.description}

Choice: ${s?.text || n || "Dismissed"}

Outcome: ${r.text}`, type: "minor", category: i.category || "company", memorable: i.judgeScore?.total >= 30, involvedCharacters: e2.map((e3) => e3.name) }), e2.forEach((e3) => {
      e3.memory?.eventMemories && (e3.memory.eventMemories.push({ eventId: i.id, title: i.title, description: i.description, outcome: r.text, playerChoice: s?.text || n, timestamp: Date.now(), type: "meta_event" }), e3.memory.eventMemories.length > CAPS.EVENT_MEMORIES_PER_EMP && (e3.memory.eventMemories = e3.memory.eventMemories.slice(-CAPS.EVENT_MEMORIES_PER_EMP)));
    });
  }
  const l = document.getElementById("eventPanelModal");
  l && l.remove(), bo(i, r), po(), saveGame(false);
}, window.resolveDynamicEventAfterMinigame = function(e, t, n) {
  const a = eo(), o = a.queue.findIndex((t2) => t2.id === e);
  if (-1 === o) return;
  const i = a.queue[o], s = i.choices[t];
  if (!s) return;
  const r = s.minigame;
  let l = s.outcome || {};
  "perfect" === n.result && r.perfectOutcome ? (l = { ...l, ...r.perfectOutcome }, showNotification("\u2B50 Perfect! Your skill impressed everyone!", "success")) : "success" !== n.result && "perfect" !== n.result || !r.successOutcome ? "partial" === n.result && r.partialOutcome ? (l = { ...l, ...r.partialOutcome }, showNotification("\u26A0\uFE0F Partial success - could have gone better.", "warning")) : "failure" === n.result && r.failureOutcome && (l = { ...l, ...r.failureOutcome }, showNotification("\u274C That didn't go as planned...", "error")) : l = { ...l, ...r.successOutcome }, l.text || (l.text = "success" === n.result || "perfect" === n.result ? "Your skilled handling of the situation produced good results." : "Despite your best efforts, things didn't go smoothly."), s.cost > 0 && (gameState.cash -= s.cost), l.companyEffects && Po(l.companyEffects), l.employeeEffects && l.employeeEffects.length > 0 && l.employeeEffects.forEach((e2) => {
    const t2 = gameState.employees.find((t3) => t3.name.toLowerCase() === e2.name?.toLowerCase() || t3.id === e2.employeeId);
    t2 && Co(t2, e2);
  }), l.specialEffect && void 0 !== StoryEngine && StoryEngine.executeGameplayEffect(l.specialEffect), i.resolved = true, i.status = "resolved", i.chosenOption = t, i.outcomeText = l.text, i.resolvedAt = Date.now(), i.minigameResult = n, a.history.unshift(i), a.queue.splice(o, 1), a.viewedTotal++, a.history.length > 50 && a.history.pop();
  const c = "perfect" === n.result ? " [PERFECT]" : "success" === n.result ? " [SUCCESS]" : "partial" === n.result ? " [PARTIAL]" : " [FAILED]";
  if (void 0 !== StoryEngine && StoryEngine.addJournalEntry) {
    const e2 = (i.involvedEmployeeIds || []).map((e3) => gameState.employees.find((t2) => t2.id === e3)).filter(Boolean);
    StoryEngine.addJournalEntry({ title: i.title, content: `${i.description}

Choice: ${s.text}${c}

Outcome: ${l.text}`, type: "minor", category: i.category || "company", memorable: "perfect" === n.result, involvedCharacters: e2.map((e3) => e3.name) }), e2.forEach((e3) => {
      e3.memory?.eventMemories && (e3.memory.eventMemories.push({ eventId: i.id, title: i.title, description: i.description, outcome: l.text, playerChoice: s.text, minigameResult: n.result, timestamp: Date.now(), type: "meta_event" }), e3.memory.eventMemories.length > CAPS.EVENT_MEMORIES_PER_EMP && (e3.memory.eventMemories = e3.memory.eventMemories.slice(-CAPS.EVENT_MEMORIES_PER_EMP)));
    });
  }
  const d = document.getElementById("eventPanelModal");
  d && d.remove(), bo(i, l, n), po(), saveGame(false);
}, window.checkForMoreEvents = function() {
  const e = eo().queue.filter((e2) => "pending" === e2.status);
  e.length > 0 && fo(e[0], e.length);
}, function() {
  if (document.getElementById("dynamicEventStyles")) return;
  const e = document.createElement("style");
  e.id = "dynamicEventStyles", e.textContent = "\n      @keyframes bellGlow {\n        0%, 100% { filter: drop-shadow(0 0 5px var(--j)); }\n        50% { filter: drop-shadow(0 0 15px var(--l)); }\n      }\n      @keyframes bellPulse {\n        0%, 100% { transform: scale(1); }\n        50% { transform: scale(1.2); }\n      }\n      @keyframes slideInRight {\n        from { transform: translateX(100%); opacity: 0; }\n        to { transform: translateX(0); opacity: 1; }\n      }\n      @keyframes fadeOut {\n        from { opacity: 1; }\n        to { opacity: 0; }\n      }\n      @keyframes spin {\n        to { transform: rotate(360deg); }\n      }\n      .event-corner-notification:hover {\n        transform: translateY(-3px);\n        box-shadow: 0 15px 50px rgba(102, 126, 234, 0.4);\n      }\n    ", document.head.appendChild(e);
}();
