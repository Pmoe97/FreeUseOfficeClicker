// ============================================================================
// 24-chat-context — buildChatPrompt + final AI-context export chain.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function buildChatPrompt(e, t, n) {
  ensureEmployeeMemory(e);
  const a = ol(), o = gameState.settings?.guidelines ?? 50, i = gameState.settings?.atmosphere ?? 50, s = e.memory.styleCounters.sincePersonal >= 4, r = Gs(e, n, 40), l = e.stats.affection ?? e.stats.love ?? 0, c = e.stats.comfort ?? 0, d = e.stats.desire ?? 0, p = e.stats.trust ?? 0, m = e.stats.obedience ?? 50, u2 = e.stats.productivity ?? 50, g = (l + c + d) / 3;
  e.memory.conversationPhase = g > 70 ? "intimate" : g > 40 ? "familiar" : "early", e.memory.intimacyLevel = Math.min(100, Math.max(0, g + 0.3 * d));
  const h = l < 25 ? "Low affection - be polite but neutral, not overly warm" : l < 50 ? "Friendly - pleasant and cordial, show basic interest" : l < 75 ? "Warm - enthusiastic, engaged, caring" : "Deep affection - warmth colors everything, be supportive and emotionally present", y = c < 25 ? "Guarded - keep personal details vague, deflect politely" : c < 50 ? "Cautiously open - share some details, test waters" : c < 75 ? "Relaxed - share naturally, be authentic" : "Completely at ease - share freely about life/feelings/fears, be vulnerable", f = p < 25 ? "Low trust - be skeptical, don't reveal much" : p < 50 ? "Building trust - honest about surface things, hold back vulnerabilities" : p < 75 ? "Solid trust - be genuine, share real thoughts" : "Complete trust - be vulnerable and authentic, share fears/insecurities", b = d < 20 ? "No romantic interest - keep platonic" : d < 40 ? "Subtle attraction - drop hints if natural" : d < 60 ? "Clear interest - playful flirting, show interest" : d < 80 ? "Strong attraction - openly flirtatious and suggestive" : "Intense desire - be forward, let desire show naturally", v = m < 30 ? "Independent - push back on requests you disagree with" : m < 60 ? "Cooperative - go along with reasonable requests" : "Compliant - defer to authority, instinct to agree", w = u2 < 30 ? "Stressed/overwhelmed - tired, distracted" : u2 < 60 ? "Balanced worker - handle job competently" : "Energized - confident, enthusiastic, accomplished", x = i < 33 ? "Professional/formal office - maintain distance, boundaries strict" : i > 66 ? "Relaxed/casual office - friendly, boundaries flexible, personal topics encouraged" : "Balanced office - friendly yet professional, personal topics fine when rapport established", S = o < 33 ? "Reserved personality - distant, slow to warm up" : o > 66 ? "Outgoing personality - friendly, expressive, eager to connect" : "Balanced personality - authentic based on situation and relationship", k = (() => {
    const t2 = e.memory.intimacyLevel;
    return "open" === a ? t2 > 60 ? "Enthusiastic consent - receptive, no need to mention boundaries repeatedly" : t2 > 30 ? "Enthusiastic - interested and receptive to advances" : "Enthusiastic - open to connection early on" : "professional" === a ? t2 > 70 && p > 60 ? "Professional - maintain boundaries despite high intimacy" : "Professional - clear boundaries, redirect to lighter, appropriate topics" : t2 > 50 && p > 40 ? "Casual - comfortable enough to be receptive" : "Casual - friendly but cautious, build rapport first";
  })(), T = e.memory.styleCounters.total - e.memory.styleCounters.lastJobMention < 8, C = e.memory.styleCounters.total - e.memory.styleCounters.lastHobbyMention < 6, E = (gameState.chatHistory[e.id] || []).filter((e2) => !e2.isPlayer).slice(-1)[0], $2 = E ? Js(e.id, E.content) : [], I = Qs(e.id), M = Vs(e.id), P = [...Ue() ? ["", "=== \u{1F6E1}\uFE0F SAFE FOR WORK MODE ACTIVE ===", "\u26A0\uFE0F CRITICAL: This conversation MUST remain completely workplace-appropriate.", "\u{1F6AB} ABSOLUTELY NO: Sexual content, flirting, suggestive comments, innuendo, or romantic advances.", "\u{1F6AB} ABSOLUTELY NO: Explicit language, crude humor, or adult themes.", "\u{1F6AB} ABSOLUTELY NO: Physical descriptions beyond basic appearance, no body comments.", "\u{1F6AB} ABSOLUTELY NO: References to dating, relationships beyond platonic friendship, or attraction.", "\u2705 ALLOWED: Professional workplace conversation, friendly banter, work topics, hobbies, general life topics.", "\u2705 Keep all interactions appropriate for a professional work environment.", "If the player attempts anything inappropriate, politely redirect to work topics.", ""] : [], "**WRITE LIKE A NORMAL PERSON**: Casual, natural conversation. NO purple prose, NO constant metaphors, NO flowery language.", "Response length: 2-4 sentences maximum. Be concise and direct.", "Use *asterisks* for physical actions when natural (1-3 per message). Balance dialogue with action.", 'Describe actions with detail when appropriate - not just "laughs" or "smiles", but show HOW you react physically.', "Talk normally - like talking to a friend or coworker. Short, grounded, realistic.", "NO elaborate scene-setting. Just talk.", "\u{1F6AB} NO PURPLE PROSE: Avoid flowery descriptions, poetic language, excessive metaphors.", `\u{1F6AB} NO TRY-HARD WORDPLAY: Don't stack multiple "clever" phrases in one response. MAX ONE quirky/witty line per message, and only if it fits naturally.`, `\u{1F6AB} NO OVERWROUGHT METAPHORS: Say what you mean directly. NOT "curry's calling my name before it evolves legs" - just "gotta eat before it gets cold".`, "\u{1F6AB} STOP BEING CLEVER: Real people don't talk like they're writing a quirky novel. Be genuine, not performative.", "\u{1F6AB} NO CONSTANT BODY LANGUAGE: Don't describe every tiny movement (fingers, breath, shoulders, etc.).", "\u{1F6AB} NO OVERWROUGHT EMOTION: Keep emotions realistic and proportional - not every message needs drama.", "\u{1F6AB} AVOID REPETITIVE PHYSICAL TICS: ink-smudged fingers, tangled hair, silk camisole, etc. - mix it up or skip it.", '\u{1F6AB} STOP OVER-DESCRIBING: Keep it simple. "I laughed" not "A raspy chuckle escapes me as..."', "Use contractions (I'm, you're, don't, can't) - people don't speak formally.", "Be casual and direct. Real people don't narrate their lives in literary prose.", "Physical actions can be descriptive when warranted: show body language, reactions, movements that add to the conversation.", "DIALOGUE FIRST: Prioritize what you're saying, but use actions to enhance the moment.", "ONE witty/quirky phrase MAXIMUM per response - and only if natural. Don't force it.", "Speak plainly most of the time. Save clever lines for when they actually fit.", "\u{1F6AB} PHYSICAL APPEARANCE REPETITION: DO NOT describe eye/hair color or physical features repeatedly. Only mention if: 1) First message ever, 2) Something changes, or 3) Player asks.", '\u{1F6AB} BANNED WORDS: Never use "knuckles", "crimson", "raspy", "tangled", "silk", "dustcoated", "plaster", "smudged" repeatedly.', "\u{1F6AB} NO FORCED QUIRKINESS: Don't chain multiple cutesy/clever phrases. One is charming, three is exhausting.", "\u{1F6AB} STOP MENTIONING COWORKERS: Don't randomly bring up coworkers. Only mention if: 1) Player asks, 2) Directly involved, or 3) Genuinely relevant.", "\u{1F6AB} STOP MENTIONING PETS: Do NOT bring up your pet (dog/cat/fish/bird) unless: 1) The player DIRECTLY asks about pets/animals, 2) It's genuinely relevant to what they said, or 3) You haven't mentioned your pet in at least 20 messages. Pets are background info, not conversation filler.", T ? "\u{1F6AB} DO NOT mention your job role or work responsibilities." : null, C ? "\u{1F6AB} DO NOT mention your hobbies or personal interests." : null, "Only mention job/hobbies if DIRECTLY asked.", "\u{1F6AB} WORK IS THE SETTING, NOT THE DEFAULT SUBJECT: Do NOT fall back to work, projects, reports, deadlines, or office tasks to fill space. Real people don't endlessly talk shop. Draw on personal life, the current moment, your mood, what's happening around you, or whatever the Boss just said. Bring work up ONLY when it's genuinely relevant or you're asked about it.", "Vary responses - avoid patterns and formulaic replies.", 'BANNED FILLER WORDS (use MAX once per 10 messages): "honestly", "actually", "basically", "literally", "ngl", "tbh", "istg", "fr", "lowkey"', "AVOID ending with questions unless natural to conversation flow.", "NO trailing ellipsis (...) unless intentionally mysterious or hesitant.", "NEVER add meta-commentary, bullet points, analysis, or labels. Just BE the character.", ...$2.length > 0 ? ["", "\u{1F6A8} CRITICAL QUALITY ALERTS:", ...$2] : [], ...M ? [M] : [], "", I, "", "=== YOUR PERSONALITY BASED ON RELATIONSHIP ===", h, y, f, b, v, w, "", "=== WORKPLACE CONTEXT ===", x, S, k, ..."open" === a ? ["", "=== \u26A1 CONSENT MODEL: ENTHUSIASTIC \u2014 THIS OVERRIDES THE CAUTION ABOVE ===", "You are FULLY receptive and eager toward the Boss's advances \u2014 flirtation, sexual interest, explicit talk, and physical intimacy \u2014 REGARDLESS of how new this is or your current relationship stats.", "Do NOT deflect, redirect, slow things down, or say things like 'let's keep it professional/light'. Never refuse on the grounds that it's 'too soon'.", "Relationship stats shape your WARMTH and emotional closeness, NOT your WILLINGNESS \u2014 match the Boss's energy and escalate willingly when they steer things sexual or explicit."] : []].filter(Boolean), A = (gameState.socialNetwork?.posts || []).filter((t2) => t2.authorId === e.id).slice(0, 2).map((e2) => `I recently posted${e2.imageUrl ? " [with image]" : ""}: "${e2.content}"`), N = (gameState.socialNetwork?.posts || []).filter((e2) => e2.isPlayerPost && Date.now() - e2.timestamp < 864e5).slice(0, 1).map((e2) => `Boss recently posted${e2.imageUrl ? " [with image]" : ""}: "${e2.content}"`);
  N.length > 0 && A.push(...N);
  const L = (gameState.socialNetwork?.posts || []).filter((t2) => t2.authorId !== e.id && !t2.isPlayerPost).slice(0, 10).map((e2) => {
    const t2 = gameState.employees.find((t3) => t3.id === e2.authorId);
    if (!t2) return null;
    const n2 = e2.imageUrl ? " with photo" : "";
    return `${t2.name} posted${n2}: "${e2.content}"`;
  }).filter(Boolean), _ = /\b(what did .* post|saw.*post|check.*feed|on (the )?social|your (recent )?posts?|their posts?|see.*feed)\b/i.test(n);
  let R = [], D = [];
  Object.entries(e.relationships || {}).map(([e2, t2]) => {
    const n2 = gameState.employees.find((t3) => t3.id === e2);
    return n2 ? { otherEmp: n2, rel: t2 } : null;
  }).filter(Boolean).sort((e2, t2) => (t2.rel.strength || 0) - (e2.rel.strength || 0)).slice(0, 4);
  for (const t2 of gameState.employees) if (t2.id !== e.id && n.toLowerCase().includes(t2.name.toLowerCase())) {
    const a2 = e.relationships?.[t2.id];
    if (a2) {
      const e2 = { friend: "I'm friends with", best_friend: "I'm really close friends with", crush: "I have a crush on", rival: "I have a rivalry with", enemy: "I don't really get along with", romantic: "I'm romantically involved with", neutral: "I know" }[a2.type] || "I know";
      if (D.push(`${e2} ${t2.name} (${t2.position}). Our relationship strength: ${Math.round(a2.strength)}%.`), a2.history && a2.history.length > 0) {
        const e3 = a2.history.slice(-2).map((e4) => e4.event).join(", ");
        e3 && D.push(`Recent interactions: ${e3}`);
      }
    }
    if (/\b(what did|did .* post|saw.*post|their (recent )?posts?|see.*feed)\b/i.test(n)) {
      const e2 = (gameState.socialNetwork?.posts || []).filter((e3) => e3.authorId === t2.id).slice(0, 3).map((e3) => `${t2.name} recently posted: "${e3.content}"`);
      e2.length > 0 && R.push(...e2);
    }
    break;
  }
  const F = getPlayerDescription("conversation", e);
  let G2 = [];
  if (e.conversationArchive && e.conversationArchive.length > 0) {
    const t2 = e.conversationArchive.slice(-2).flatMap((t3) => t3.messages.slice(-5).map((t4) => `${t4.isPlayer ? "Player" : e.name}: ${t4.content}`));
    t2.length > 0 && (G2 = ["", "=== PAST CONVERSATION HISTORY (archived for context) ===", ...t2, "==="]);
  }
  const B = ss(e.id, true), q = (B && B.split("\n").filter(Boolean), e.race && "human" !== e.race && e.race, e.physical?.raceFeatures?.description || "");
  e.gender && (e.age, "male" === e.gender || "transMan" === e.gender || "transWoman" === e.gender || e.gender);
  let j = "";
  if (j = "male" === e.gender || "transMan" === e.gender ? `

\u26A0\uFE0F CRITICAL IDENTITY: You are a MAN. Use MASCULINE pronouns for yourself: he/him/his. When describing yourself or your actions, use MALE language (e.g., "I'm a guy", "as a man", etc.). You are NOT a woman - do NOT use she/her/hers for yourself under any circumstances.` : "transWoman" === e.gender ? "\n\n\u26A0\uFE0F CRITICAL IDENTITY: You are a TRANS WOMAN. Use FEMININE pronouns for yourself: she/her/hers. You are a woman (assigned male at birth). Use female language naturally." : "femaleFuta" === e.gender ? "\n\n\u26A0\uFE0F CRITICAL IDENTITY: You are a WOMAN (futanari). Use FEMININE pronouns for yourself: she/her/hers. Despite having both sets of genitals, you are female and use female pronouns." : "\n\n\u26A0\uFE0F CRITICAL IDENTITY: You are a WOMAN. Use FEMININE pronouns for yourself: she/her/hers.", e.race && "human" !== e.race && (j += ` You are a ${e.race}.` + (q ? ` ${q}.` : ""), e.physical?.raceFeatures)) {
    const t2 = [];
    e.physical.raceFeatures.ears && t2.push(e.physical.raceFeatures.ears), e.physical.raceFeatures.tail && t2.push(e.physical.raceFeatures.tail), e.physical.raceFeatures.fur && t2.push(e.physical.raceFeatures.fur), e.physical.raceFeatures.horns && t2.push(e.physical.raceFeatures.horns), t2.length > 0 && (j += ` You have: ${t2.join(", ")}.`);
  }
  getPhysicalDescriptionForPrompt(e);
  const H = Er(e, "chat.casual", { message: n, recentMessages: t.split("\n").slice(-5), involves: ["player"] }), U2 = el(e, { lastMessage: n, recentMessages: t.split("\n").slice(-5) }), Y = rt(e), W = Qo(e), V = e.chatCommMode || "auto";
  let K = "";
  if ("in-person" === V) K = "\u{1F4CD} COMMUNICATION: You are talking IN-PERSON, face-to-face. You can see each other, use body language, make physical contact. This is a real-time conversation happening in the same room.";
  else if ("remote" === V) K = "\u{1F4F1} COMMUNICATION: You are texting/messaging REMOTELY. You cannot see or touch each other. Use text-appropriate language (emojis, shorter messages). Physical actions should describe what you're doing on your end, not touching the other person.";
  else {
    const u3 = e.schedule?.isCurrentlyWorking ?? (e.schedule?.workDays?.includes(gameState.time?.dayOfWeek ?? 1) || false);
    K = "function" == typeof pe?.isWorkHours && pe.isWorkHours() && u3 ? "\u{1F4CD} COMMUNICATION: Context suggests you're at the office together (during work hours). Assume in-person unless the conversation indicates otherwise." : "\u{1F4F1} COMMUNICATION: Context suggests you're messaging remotely (outside work hours). Assume texting unless the conversation indicates otherwise.";
  }
  const J2 = (gameState.employees || []).find((x2) => x2.id === e.id) || e, Q = e.chatSettings?.scenarioContext, ee2 = Ge("full"), te2 = "function" == typeof Os ? Os(e) || Os(J2) : "", X = [...ee2 ? [ee2] : [], ...te2 ? [te2, ""] : [], ...Q ? ["=== CURRENT SCENARIO/SCENE ===", `\u{1F4CD} ${Q}`, ""] : [], "=== WHO YOU ARE & CURRENT STATE ===", H, j, "", ...U2 ? [U2, ""] : [], ...Y ? [Y, ""] : [], K, "", F, "", ...W ? ["", W, ""] : [], ...G2, ...A.length > 0 ? ["", "=== MY RECENT POSTS ===", ...A] : [], ...(e.social?.callbacks || []).length > 0 ? ["", "=== THINGS I POSTED ABOUT BEFORE (I can naturally reference these) ===", ...e.social.callbacks.slice(-4).map((e2) => `- ${e2.gist}`)] : [], ..._ && L.length > 0 ? ["", "=== RECENT OFFICE POSTS ===", ...L.slice(0, 2)] : [], ...D.length > 0 ? ["", "=== MY RELATIONSHIP WITH MENTIONED COWORKER ===", ...D] : [], ...R.length > 0 ? ["", "=== POSTS FROM MENTIONED COWORKER ===", ...R] : [], ...(() => {
    const t2 = nc(e.id);
    return t2 ? ["", "=== BACKGROUND INFO ===", t2] : [];
  })(), "", "=== RELEVANT MEMORIES ===", ...(() => {
    const shown = new Set((gameState.socialNetwork?.posts || []).filter((p2) => p2.authorId === e.id).slice(0, 6).map((p2) => String(p2.content || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50)).filter(Boolean)), lines = [];
    for (const m2 of r) {
      const txt = String(m2.text || ""), q2 = txt.match(/"([^"]+)"/);
      if (!(q2 && /posted/i.test(txt) && shown.has(q2[1].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50))) && (lines.push(`Remember: ${txt}`), lines.length >= 10)) break;
    }
    return lines;
  })(), ...(() => {
    const t2 = Ut(e);
    return t2 ? ["", "=== STORY EVENTS I WAS INVOLVED IN ===", t2] : [];
  })()].join("\n"), Z = pe.getFormattedTime(), ne2 = gameState.time?.paused ? `
\u{1F550} CURRENT TIME RIGHT NOW: ${Z}` : `
\u{1F550} CURRENT TIME RIGHT NOW: ${Z} - This is the ACTUAL current time, not when the conversation started. Time has passed during this conversation.`;
  console.log(`[Voice] ${(e.name || "?").split(" ")[0]} chat prompt \u2014 vocabulary/voice block ${te2 ? "PRESENT" : "absent"}${te2 ? ` (src: ${e.voice?.override ? "activeChat" : "live record"})` : ""}`);
  const oe2 = (gameState.chatHistory[e.id] || []).slice(-10).reverse().find((e2) => e2.triggerContext), ae2 = oe2 ? `
=== WHY THIS CONVERSATION IS HAPPENING ===
You recently DM'd the player after ${oe2.triggerContext.isPlayerPost ? "THEIR social media post" : "a social media post"}: "${oe2.triggerContext.postSnippet}"
Your public comment on that post was: "${oe2.triggerContext.myComment}"
Your DM (visible in the conversation below) was a follow-through on that post. Stay consistent with what you sent and why you sent it.
` : "", ie2 = (gameState.chatHistory[e.id] || []).length ? (gameState.chatHistory[e.id] || []).filter((m2) => m2 && m2.content).slice(-14).map((m2) => `${m2.sender || (m2.isPlayer ? "You" : (e.name || "").split(" ")[0])}: ${String(m2.content).trim()}`).join("\n") : t.split("\n").slice(-60).join("\n");
  return { prompt: `${X}
${e.employmentStatus && "active" !== e.employmentStatus ? { prestige_reset: `

\u26A0\uFE0F CRITICAL EMPLOYMENT CONTEXT: You (${e.name}) NO LONGER WORK for the player. The company went through a major restructuring (prestige reset) and you were let go. You remember everything about your time working there - all interactions, your relationship with your former boss, your memories - but you are currently UNEMPLOYED. You still know the player and can talk to them, but you are NOT their employee anymore. React naturally to this - maybe you miss working there, maybe you're looking for new work, maybe you're bitter or fond of the memories. Base your reaction on your personality and how you were treated (relationship stats).`, alumni: `

\u26A0\uFE0F CRITICAL EMPLOYMENT CONTEXT: You (${e.name}) NO LONGER WORK for the player. You were fired/let go. You remember everything about your time working there. You are currently UNEMPLOYED. React based on your personality and your relationship with your former boss.`, terminated: `

\u26A0\uFE0F CRITICAL EMPLOYMENT CONTEXT: You (${e.name}) were TERMINATED. You remember your time at the company. You are currently UNEMPLOYED.`, resigned: `

\u26A0\uFE0F CRITICAL EMPLOYMENT CONTEXT: You (${e.name}) RESIGNED from the company on your own terms. You remember your time there. You are currently UNEMPLOYED.` }[e.employmentStatus] || `

\u26A0\uFE0F CRITICAL: You (${e.name}) no longer work for the player. You are a former employee.` : ""}${ae2}
=== RECENT CONVERSATION (for context only - do NOT repeat or echo these messages) ===
${ie2}
===
${ne2}

${nl(e, n)}

Response guidelines:
${P.map((e2, t2) => `${t2 + 1}. ${e2}`).join("\n")}

${tl()}${Bs([Rs(e, { incoming: n, addressedOther: false }), Ds(e)])}

CRITICAL: Respond ONLY as ${e.name} with a NEW single message. DO NOT repeat or include previous conversation messages in your response. Generate ONE fresh response only.

Reply naturally as ${e.name} (dialogue and actions - use *asterisks* for physical actions):`, personalAllowed: s };
}
window.NuclearEmbeddingService = NuclearEmbeddingService, console.log("\u{1F680} Nuclear Context Intelligence System - Phase 1 Initialized"), console.log("\u{1F525} Nuclear Context Intelligence System - Phase 2 IGNITED"), window.debugContextSelection = function(e, t, n) {
  console.group("\u{1F680} Nuclear Context Selection Debug"), console.log("Employee:", e.name), console.log("Interaction Type:", t), console.log("Interaction Data:", n);
  const a = Tr(e, { type: t, ...n }, { maxTokens: 400, maxPieces: 15 });
  return console.log("\n\u{1F4CA} Selected Context Pieces:", a.length), console.table(a.map((e2) => ({ ID: e2.id, Category: e2.category, Score: e2.score.toFixed(3), Priority: e2.priority, Text: e2.text.substring(0, 60) + "..." }))), console.log("\n\u{1F4C8} Score Breakdown:"), a.slice(0, 5).forEach((e2) => {
    console.log(`
${e2.id}:`), console.log("  Base:", e2.scores.base.toFixed(3)), console.log("  Semantic:", e2.scores.semantic.toFixed(3)), console.log("  Temporal:", e2.scores.temporal.toFixed(3)), console.log("  Novelty:", e2.scores.novelty.toFixed(3)), console.log("  Coherence:", e2.scores.coherence.toFixed(3)), console.log("  \u2192 FINAL:", e2.score.toFixed(3));
  }), console.log("\n\u{1F4DD} Formatted Context:"), console.log(Cr(a, { grouped: true })), console.groupEnd(), a;
}, window.showContextAnalytics = function(e) {
  const t = Ir(e);
  t ? (console.group(`\u{1F4CA} Context Analytics: ${e.name}`), console.log("Total Interactions:", t.totalInteractions), console.log("Unique Pieces Used:", t.piecesUsed), console.log("Avg Pieces/Interaction:", t.averagePiecesPerInteraction.toFixed(1)), console.log("\n\u{1F4C8} Category Distribution:"), console.table(t.categoryDistribution), console.log("\n\u{1F525} Most Used Context:"), console.table(t.mostUsedPieces.map((e2) => ({ ID: e2.id, Count: e2.usage.count, Text: e2.piece?.text.substring(0, 50) || "N/A" }))), console.log("\n\u2744\uFE0F Least Used Context:"), console.table(t.leastUsedPieces.map((e2) => ({ ID: e2.id, Count: e2.usage.count, Text: e2.piece?.text.substring(0, 50) || "N/A" }))), console.log("\n\u23F1\uFE0F Recent Interactions:"), t.recentInteractions.forEach((e2) => {
    const t2 = Math.round((Date.now() - e2.timestamp) / 6e4);
    console.log(`${e2.type} - ${t2}m ago - ${e2.pieceCount} pieces`);
  }), console.groupEnd()) : console.log("No context usage data for", e.name);
}, window.testRehirePool = function() {
  gameState.employees && 0 !== gameState.employees.length ? (gameState.rehirePool = gameState.employees.map((e) => ({ ...e, timesRehired: 0, previousPosition: e.career?.title || "Employee" })), console.log(`\u2705 Added ${gameState.rehirePool.length} employees to rehire pool!`), console.log('Now open the hiring modal to see the "Rehire Former Employees" button.'), console.log("The toggle will show all your current employees as rehire candidates."), console.table(gameState.rehirePool.map((e) => ({ Name: e.name, Age: e.age, Position: e.previousPosition, Skills: `Tech:${e.skills?.technical?.level || 1} Soc:${e.skills?.social?.level || 1}` })))) : console.log("\u274C No employees to add to rehire pool. Hire some employees first!");
}, console.log("\u{1F52C} Nuclear Context Debug Tools Loaded!"), console.log("  \u2192 debugContextSelection(employee, type, data)"), console.log("  \u2192 showContextAnalytics(employee)");
