// ============================================================================
// 24-chat-context — buildChatPrompt + final AI-context export chain.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function buildChatPrompt(e, t, n) {
    ensureEmployeeMemory(e);
    const a = getConsentPolicy(),
        o = gameState.settings?.guidelines ?? 50,
        i = gameState.settings?.atmosphere ?? 50,
        s = e.memory.styleCounters.sincePersonal >= 4,
        r = retrieveMemories(e, n, 40),
        l = e.stats.affection ?? e.stats.love ?? 0,
        c = e.stats.comfort ?? 0,
        d = e.stats.desire ?? 0,
        p = e.stats.trust ?? 0,
        m = e.stats.obedience ?? 50,
        u = e.stats.productivity ?? 50,
        g = (l + c + d) / 3;
    (e.memory.conversationPhase = g > 70 ? "intimate" : g > 40 ? "familiar" : "early"),
        (e.memory.intimacyLevel = Math.min(100, Math.max(0, g + 0.3 * d)));
    const h =
            l < 25
                ? "Low affection - be polite but neutral, not overly warm"
                : l < 50
                  ? "Friendly - pleasant and cordial, show basic interest"
                  : l < 75
                    ? "Warm - enthusiastic, engaged, caring"
                    : "Deep affection - warmth colors everything, be supportive and emotionally present",
        y =
            c < 25
                ? "Guarded - keep personal details vague, deflect politely"
                : c < 50
                  ? "Cautiously open - share some details, test waters"
                  : c < 75
                    ? "Relaxed - share naturally, be authentic"
                    : "Completely at ease - share freely about life/feelings/fears, be vulnerable",
        f =
            p < 25
                ? "Low trust - be skeptical, don't reveal much"
                : p < 50
                  ? "Building trust - honest about surface things, hold back vulnerabilities"
                  : p < 75
                    ? "Solid trust - be genuine, share real thoughts"
                    : "Complete trust - be vulnerable and authentic, share fears/insecurities",
        b =
            d < 20
                ? "No romantic interest - keep platonic"
                : d < 40
                  ? "Subtle attraction - drop hints if natural"
                  : d < 60
                    ? "Clear interest - playful flirting, show interest"
                    : d < 80
                      ? "Strong attraction - openly flirtatious and suggestive"
                      : "Intense desire - be forward, let desire show naturally",
        v =
            m < 30
                ? "Independent - push back on requests you disagree with"
                : m < 60
                  ? "Cooperative - go along with reasonable requests"
                  : "Compliant - defer to authority, instinct to agree",
        w =
            u < 30
                ? "Stressed/overwhelmed - tired, distracted"
                : u < 60
                  ? "Balanced worker - handle job competently"
                  : "Energized - confident, enthusiastic, accomplished",
        x =
            i < 33
                ? "Professional/formal office - maintain distance, boundaries strict"
                : i > 66
                  ? "Relaxed/casual office - friendly, boundaries flexible, personal topics encouraged"
                  : "Balanced office - friendly yet professional, personal topics fine when rapport established",
        S =
            o < 33
                ? "Reserved personality - distant, slow to warm up"
                : o > 66
                  ? "Outgoing personality - friendly, expressive, eager to connect"
                  : "Balanced personality - authentic based on situation and relationship",
        k = (() => {
            const t = e.memory.intimacyLevel;
            return "open" === a
                ? t > 60
                    ? "Enthusiastic consent - receptive, no need to mention boundaries repeatedly"
                    : t > 30
                      ? "Enthusiastic - interested and receptive to advances"
                      : "Enthusiastic - open to connection early on"
                : "professional" === a
                  ? t > 70 && p > 60
                      ? "Professional - maintain boundaries despite high intimacy"
                      : "Professional - clear boundaries, redirect to lighter, appropriate topics"
                  : t > 50 && p > 40
                    ? "Casual - comfortable enough to be receptive"
                    : "Casual - friendly but cautious, build rapport first";
        })(),
        T = e.memory.styleCounters.total - e.memory.styleCounters.lastJobMention < 8,
        C = e.memory.styleCounters.total - e.memory.styleCounters.lastHobbyMention < 6,
        E = (gameState.chatHistory[e.id] || []).filter((e) => !e.isPlayer).slice(-1)[0],
        $ = E ? analyzeResponseForRepetition(e.id, E.content) : [],
        I = getVarietyGuidance(e.id),
        M = buildActionAvoidancePrompt(e.id),
        P = [
            ...(isSFWMode()
                ? [
                      "",
                      "=== 🛡️ SAFE FOR WORK MODE ACTIVE ===",
                      "⚠️ CRITICAL: This conversation MUST remain completely workplace-appropriate.",
                      "🚫 ABSOLUTELY NO: Sexual content, flirting, suggestive comments, innuendo, or romantic advances.",
                      "🚫 ABSOLUTELY NO: Explicit language, crude humor, or adult themes.",
                      "🚫 ABSOLUTELY NO: Physical descriptions beyond basic appearance, no body comments.",
                      "🚫 ABSOLUTELY NO: References to dating, relationships beyond platonic friendship, or attraction.",
                      "✅ ALLOWED: Professional workplace conversation, friendly banter, work topics, hobbies, general life topics.",
                      "✅ Keep all interactions appropriate for a professional work environment.",
                      "If the player attempts anything inappropriate, politely redirect to work topics.",
                      "",
                  ]
                : []),
            "**WRITE LIKE A NORMAL PERSON**: Casual, natural conversation. NO purple prose, NO constant metaphors, NO flowery language.",
            "Response length: 2-4 sentences maximum. Be concise and direct.",
            "Use *asterisks* for physical actions when natural (1-3 per message). Balance dialogue with action.",
            'Describe actions with detail when appropriate - not just "laughs" or "smiles", but show HOW you react physically.',
            "Talk normally - like talking to a friend or coworker. Short, grounded, realistic.",
            "NO elaborate scene-setting. Just talk.",
            "🚫 NO PURPLE PROSE: Avoid flowery descriptions, poetic language, excessive metaphors.",
            '🚫 NO TRY-HARD WORDPLAY: Don\'t stack multiple "clever" phrases in one response. MAX ONE quirky/witty line per message, and only if it fits naturally.',
            '🚫 NO OVERWROUGHT METAPHORS: Say what you mean directly. NOT "curry\'s calling my name before it evolves legs" - just "gotta eat before it gets cold".',
            "🚫 STOP BEING CLEVER: Real people don't talk like they're writing a quirky novel. Be genuine, not performative.",
            "🚫 NO CONSTANT BODY LANGUAGE: Don't describe every tiny movement (fingers, breath, shoulders, etc.).",
            "🚫 NO OVERWROUGHT EMOTION: Keep emotions realistic and proportional - not every message needs drama.",
            "🚫 AVOID REPETITIVE PHYSICAL TICS: ink-smudged fingers, tangled hair, silk camisole, etc. - mix it up or skip it.",
            '🚫 STOP OVER-DESCRIBING: Keep it simple. "I laughed" not "A raspy chuckle escapes me as..."',
            "Use contractions (I'm, you're, don't, can't) - people don't speak formally.",
            "Be casual and direct. Real people don't narrate their lives in literary prose.",
            "Physical actions can be descriptive when warranted: show body language, reactions, movements that add to the conversation.",
            "DIALOGUE FIRST: Prioritize what you're saying, but use actions to enhance the moment.",
            "ONE witty/quirky phrase MAXIMUM per response - and only if natural. Don't force it.",
            "Speak plainly most of the time. Save clever lines for when they actually fit.",
            "🚫 PHYSICAL APPEARANCE REPETITION: DO NOT describe eye/hair color or physical features repeatedly. Only mention if: 1) First message ever, 2) Something changes, or 3) Player asks.",
            '🚫 BANNED WORDS: Never use "knuckles", "crimson", "raspy", "tangled", "silk", "dustcoated", "plaster", "smudged" repeatedly.',
            "🚫 NO FORCED QUIRKINESS: Don't chain multiple cutesy/clever phrases. One is charming, three is exhausting.",
            "🚫 STOP MENTIONING COWORKERS: Don't randomly bring up coworkers. Only mention if: 1) Player asks, 2) Directly involved, or 3) Genuinely relevant.",
            "🚫 STOP MENTIONING PETS: Do NOT bring up your pet (dog/cat/fish/bird) unless: 1) The player DIRECTLY asks about pets/animals, 2) It's genuinely relevant to what they said, or 3) You haven't mentioned your pet in at least 20 messages. Pets are background info, not conversation filler.",
            T ? "🚫 DO NOT mention your job role or work responsibilities." : null,
            C ? "🚫 DO NOT mention your hobbies or personal interests." : null,
            "Only mention job/hobbies if DIRECTLY asked.",
            "🚫 WORK IS THE SETTING, NOT THE DEFAULT SUBJECT: Do NOT fall back to work, projects, reports, deadlines, or office tasks to fill space. Real people don't endlessly talk shop. Draw on personal life, the current moment, your mood, what's happening around you, or whatever the Boss just said. Bring work up ONLY when it's genuinely relevant or you're asked about it.",
            "Vary responses - avoid patterns and formulaic replies.",
            'BANNED FILLER WORDS (use MAX once per 10 messages): "honestly", "actually", "basically", "literally", "ngl", "tbh", "istg", "fr", "lowkey"',
            "AVOID ending with questions unless natural to conversation flow.",
            "NO trailing ellipsis (...) unless intentionally mysterious or hesitant.",
            "NEVER add meta-commentary, bullet points, analysis, or labels. Just BE the character.",
            ...($.length > 0 ? ["", "🚨 CRITICAL QUALITY ALERTS:", ...$] : []),
            ...(M ? [M] : []),
            "",
            I,
            "",
            "=== YOUR PERSONALITY BASED ON RELATIONSHIP ===",
            h,
            y,
            f,
            b,
            v,
            w,
            "",
            "=== WORKPLACE CONTEXT ===",
            x,
            S,
            k,
            // Enthusiastic consent model: honor its promise ("receptive… without barriers")
            // by overriding the low-stat "keep platonic / polite but neutral" caution above.
            // Stats still shape warmth/closeness, just not willingness.
            ...("open" === a
                ? [
                      "",
                      "=== ⚡ CONSENT MODEL: ENTHUSIASTIC — THIS OVERRIDES THE CAUTION ABOVE ===",
                      "You are FULLY receptive and eager toward the Boss's advances — flirtation, sexual interest, explicit talk, and physical intimacy — REGARDLESS of how new this is or your current relationship stats.",
                      "Do NOT deflect, redirect, slow things down, or say things like 'let's keep it professional/light'. Never refuse on the grounds that it's 'too soon'.",
                      "Relationship stats shape your WARMTH and emotional closeness, NOT your WILLINGNESS — match the Boss's energy and escalate willingly when they steer things sexual or explicit.",
                  ]
                : []),
        ].filter(Boolean),
        A = (gameState.socialNetwork?.posts || [])
            .filter((t) => t.authorId === e.id)
            .slice(0, 2)
            .map((e) => `I recently posted${e.imageUrl ? " [with image]" : ""}: "${e.content}"`),
        N = (gameState.socialNetwork?.posts || [])
            .filter((e) => e.isPlayerPost && Date.now() - e.timestamp < 864e5)
            .slice(0, 1)
            .map((e) => `Boss recently posted${e.imageUrl ? " [with image]" : ""}: "${e.content}"`);
    N.length > 0 && A.push(...N);
    const L = (gameState.socialNetwork?.posts || [])
            .filter((t) => t.authorId !== e.id && !t.isPlayerPost)
            .slice(0, 10)
            .map((e) => {
                const t = gameState.employees.find((t) => t.id === e.authorId);
                if (!t) return null;
                const n = e.imageUrl ? " with photo" : "";
                return `${t.name} posted${n}: "${e.content}"`;
            })
            .filter(Boolean),
        _ =
            /\b(what did .* post|saw.*post|check.*feed|on (the )?social|your (recent )?posts?|their posts?|see.*feed)\b/i.test(
                n
            );
    let R = [],
        D = [];
    Object.entries(e.relationships || {})
        .map(([e, t]) => {
            const n = gameState.employees.find((t) => t.id === e);
            return n ? { otherEmp: n, rel: t } : null;
        })
        .filter(Boolean)
        .sort((e, t) => (t.rel.strength || 0) - (e.rel.strength || 0))
        .slice(0, 4);
    for (const t of gameState.employees)
        if (t.id !== e.id && n.toLowerCase().includes(t.name.toLowerCase())) {
            const a = e.relationships?.[t.id];
            if (a) {
                const e =
                    {
                        friend: "I'm friends with",
                        best_friend: "I'm really close friends with",
                        crush: "I have a crush on",
                        rival: "I have a rivalry with",
                        enemy: "I don't really get along with",
                        romantic: "I'm romantically involved with",
                        neutral: "I know",
                    }[a.type] || "I know";
                if (
                    (D.push(
                        `${e} ${t.name} (${t.position}). Our relationship strength: ${Math.round(a.strength)}%.`
                    ),
                    a.history && a.history.length > 0)
                ) {
                    const e = a.history
                        .slice(-2)
                        .map((e) => e.event)
                        .join(", ");
                    e && D.push(`Recent interactions: ${e}`);
                }
            }
            if (/\b(what did|did .* post|saw.*post|their (recent )?posts?|see.*feed)\b/i.test(n)) {
                const e = (gameState.socialNetwork?.posts || [])
                    .filter((e) => e.authorId === t.id)
                    .slice(0, 3)
                    .map((e) => `${t.name} recently posted: "${e.content}"`);
                e.length > 0 && R.push(...e);
            }
            break;
        }
    const F = getPlayerDescription("conversation", e);
    let G = [];
    if (e.conversationArchive && e.conversationArchive.length > 0) {
        const t = e.conversationArchive
            .slice(-2)
            .flatMap((t) => t.messages.slice(-5).map((t) => `${t.isPlayer ? "Player" : e.name}: ${t.content}`));
        t.length > 0 && (G = ["", "=== PAST CONVERSATION HISTORY (archived for context) ===", ...t, "==="]);
    }
    const B = getGossipContext(e.id, !0),
        O = (B && B.split("\n").filter(Boolean), e.race && "human" !== e.race ? ` (${e.race})` : ""),
        q = e.physical?.raceFeatures?.description || "",
        z = q ? ` - ${q}` : "";
    e.gender && (e.age, "male" === e.gender || "transMan" === e.gender || "transWoman" === e.gender || e.gender);
    let j = "";
    if (
        ((j =
            "male" === e.gender || "transMan" === e.gender
                ? '\n\n⚠️ CRITICAL IDENTITY: You are a MAN. Use MASCULINE pronouns for yourself: he/him/his. When describing yourself or your actions, use MALE language (e.g., "I\'m a guy", "as a man", etc.). You are NOT a woman - do NOT use she/her/hers for yourself under any circumstances.'
                : "transWoman" === e.gender
                  ? "\n\n⚠️ CRITICAL IDENTITY: You are a TRANS WOMAN. Use FEMININE pronouns for yourself: she/her/hers. You are a woman (assigned male at birth). Use female language naturally."
                  : "femaleFuta" === e.gender
                    ? "\n\n⚠️ CRITICAL IDENTITY: You are a WOMAN (futanari). Use FEMININE pronouns for yourself: she/her/hers. Despite having both sets of genitals, you are female and use female pronouns."
                    : "\n\n⚠️ CRITICAL IDENTITY: You are a WOMAN. Use FEMININE pronouns for yourself: she/her/hers."),
        e.race && "human" !== e.race)
    ) {
        if (((j += ` You are a ${e.race}.` + (q ? ` ${q}.` : "")), e.physical?.raceFeatures)) {
            const t = [];
            e.physical.raceFeatures.ears && t.push(e.physical.raceFeatures.ears),
                e.physical.raceFeatures.tail && t.push(e.physical.raceFeatures.tail),
                e.physical.raceFeatures.fur && t.push(e.physical.raceFeatures.fur),
                e.physical.raceFeatures.horns && t.push(e.physical.raceFeatures.horns),
                t.length > 0 && (j += ` You have: ${t.join(", ")}.`);
        }
    }
    getPhysicalDescriptionForPrompt(e);
    const H = getIntelligentContext(e, "chat.casual", {
            message: n,
            recentMessages: t.split("\n").slice(-5),
            involves: ["player"],
        }),
        U = buildCurrentStateBlock(e, { lastMessage: n, recentMessages: t.split("\n").slice(-5) }),
        Y = buildAIContextFromSkills(e),
        W = getTimeContextForChat(e),
        V = e.chatCommMode || "auto";
    let K = "";
    if ("in-person" === V)
        K =
            "📍 COMMUNICATION: You are talking IN-PERSON, face-to-face. You can see each other, use body language, make physical contact. This is a real-time conversation happening in the same room.";
    else if ("remote" === V)
        K =
            "📱 COMMUNICATION: You are texting/messaging REMOTELY. You cannot see or touch each other. Use text-appropriate language (emojis, shorter messages). Physical actions should describe what you're doing on your end, not touching the other person.";
    else {
        // Derive "at the office / work hours" from the SAME clock + duty signal that
        // getTimeContextForChat (W) uses, so the COMMUNICATION block can't contradict the
        // TIME CONTEXT block (e.g. "office, work hours" appearing at 4:47 AM). Previously this
        // read gameState.time.hour, defaulting to noon when absent → always "work hours".
        const onDutyNow =
                e.schedule?.isCurrentlyWorking ??
                (e.schedule?.workDays?.includes(gameState.time?.dayOfWeek ?? 1) || !1),
            atWorkNow =
                "function" == typeof timeHelpers?.isWorkHours && timeHelpers.isWorkHours() && onDutyNow;
        K = atWorkNow
            ? "📍 COMMUNICATION: Context suggests you're at the office together (during work hours). Assume in-person unless the conversation indicates otherwise."
            : "📱 COMMUNICATION: Context suggests you're messaging remotely (outside work hours). Assume texting unless the conversation indicates otherwise.";
    }
    // B5: read the voice/vocabulary from the freshest record. activeChat can be a stale copy, so if
    // the passed-in object has no override, fall back to the live gameState.employees entry — this is
    // what made a just-set personality only "take" on the 2nd generation.
    const liveNpc = (gameState.employees || []).find((x) => x.id === e.id) || e;
    const Q = e.chatSettings?.scenarioContext,
        J = getCustomWorldContext("full"),
        voiceBlk =
            "function" == typeof buildVoiceBlock ? buildVoiceBlock(e) || buildVoiceBlock(liveNpc) : "",
        X = [
            ...(J ? [J] : []),
            ...(voiceBlk ? [voiceBlk, ""] : []),
            ...(Q ? ["=== CURRENT SCENARIO/SCENE ===", `📍 ${Q}`, ""] : []),
            "=== WHO YOU ARE & CURRENT STATE ===",
            H,
            j,
            "",
            ...(U ? [U, ""] : []),
            ...(Y ? [Y, ""] : []),
            K,
            "",
            F,
            "",
            ...(W ? ["", W, ""] : []),
            ...G,
            ...(A.length > 0 ? ["", "=== MY RECENT POSTS ===", ...A] : []),
            ...((e.social?.callbacks || []).length > 0
                ? [
                      "",
                      "=== THINGS I POSTED ABOUT BEFORE (I can naturally reference these) ===",
                      ...e.social.callbacks.slice(-4).map((e) => `- ${e.gist}`),
                  ]
                : []),
            ...(_ && L.length > 0 ? ["", "=== RECENT OFFICE POSTS ===", ...L.slice(0, 2)] : []),
            ...(D.length > 0 ? ["", "=== MY RELATIONSHIP WITH MENTIONED COWORKER ===", ...D] : []),
            ...(R.length > 0 ? ["", "=== POSTS FROM MENTIONED COWORKER ===", ...R] : []),
            ...(() => {
                const t = getFamilyContextForAI(e.id);
                return t ? ["", "=== BACKGROUND INFO ===", t] : [];
            })(),
            "",
            "=== RELEVANT MEMORIES ===",
            ...(() => {
                // Dedupe: the NPC's own recent posts are already shown verbatim under
                // "MY RECENT POSTS" — don't repeat them here as "Remember: I posted ..." memories.
                const shown = new Set(
                    (gameState.socialNetwork?.posts || [])
                        .filter((p) => p.authorId === e.id)
                        .slice(0, 6)
                        .map((p) => String(p.content || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50))
                        .filter(Boolean)
                );
                const lines = [];
                for (const m of r) {
                    const txt = String(m.text || ""),
                        q = txt.match(/"([^"]+)"/);
                    if (q && /posted/i.test(txt) && shown.has(q[1].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50)))
                        continue;
                    lines.push(`Remember: ${txt}`);
                    if (lines.length >= 10) break;
                }
                return lines;
            })(),
            ...(() => {
                const t = getStoryContextForNPC(e);
                return t ? ["", "=== STORY EVENTS I WAS INVOLVED IN ===", t] : [];
            })(),
        ].join("\n"),
        Z = timeHelpers.getFormattedTime(),
        ee = gameState.time?.paused
            ? `\n🕐 CURRENT TIME RIGHT NOW: ${Z}`
            : `\n🕐 CURRENT TIME RIGHT NOW: ${Z} - This is the ACTUAL current time, not when the conversation started. Time has passed during this conversation.`;
    console.log(
        `[Voice] ${(e.name || "?").split(" ")[0]} chat prompt — vocabulary/voice block ${voiceBlk ? "PRESENT" : "absent"}${voiceBlk ? ` (src: ${e.voice?.override ? "activeChat" : "live record"})` : ""}`
    );
    const dmTrig = (gameState.chatHistory[e.id] || [])
            .slice(-10)
            .reverse()
            .find((e) => e.triggerContext),
        trigBlock = dmTrig
            ? `\n=== WHY THIS CONVERSATION IS HAPPENING ===\nYou recently DM'd the player after ${dmTrig.triggerContext.isPlayerPost ? "THEIR social media post" : "a social media post"}: "${dmTrig.triggerContext.postSnippet}"\nYour public comment on that post was: "${dmTrig.triggerContext.myComment}"\nYour DM (visible in the conversation below) was a follow-through on that post. Stay consistent with what you sent and why you sent it.\n`
            : "";
    // Build the recent-conversation block from whole message objects (turns), not by slicing a
    // flattened string on "\n" — a multi-line message would otherwise be split across the line
    // boundary, dropping a partial/mid-sentence turn into the prompt.
    const recentConvo = (gameState.chatHistory[e.id] || []).length
        ? (gameState.chatHistory[e.id] || [])
              .filter((m) => m && m.content)
              .slice(-14)
              .map((m) => `${m.sender || (m.isPlayer ? "You" : (e.name || "").split(" ")[0])}: ${String(m.content).trim()}`)
              .join("\n")
        : t.split("\n").slice(-60).join("\n");
    return {
        prompt: `${X}\n${e.employmentStatus && "active" !== e.employmentStatus ? { prestige_reset: `\n\n⚠️ CRITICAL EMPLOYMENT CONTEXT: You (${e.name}) NO LONGER WORK for the player. The company went through a major restructuring (prestige reset) and you were let go. You remember everything about your time working there - all interactions, your relationship with your former boss, your memories - but you are currently UNEMPLOYED. You still know the player and can talk to them, but you are NOT their employee anymore. React naturally to this - maybe you miss working there, maybe you're looking for new work, maybe you're bitter or fond of the memories. Base your reaction on your personality and how you were treated (relationship stats).`, alumni: `\n\n⚠️ CRITICAL EMPLOYMENT CONTEXT: You (${e.name}) NO LONGER WORK for the player. You were fired/let go. You remember everything about your time working there. You are currently UNEMPLOYED. React based on your personality and your relationship with your former boss.`, terminated: `\n\n⚠️ CRITICAL EMPLOYMENT CONTEXT: You (${e.name}) were TERMINATED. You remember your time at the company. You are currently UNEMPLOYED.`, resigned: `\n\n⚠️ CRITICAL EMPLOYMENT CONTEXT: You (${e.name}) RESIGNED from the company on your own terms. You remember your time there. You are currently UNEMPLOYED.` }[e.employmentStatus] || `\n\n⚠️ CRITICAL: You (${e.name}) no longer work for the player. You are a former employee.` : ""}${trigBlock}\n=== RECENT CONVERSATION (for context only - do NOT repeat or echo these messages) ===\n${recentConvo}\n===\n${ee}\n\n${buildInstructionFocusBlock(e, n)}\n\nResponse guidelines:\n${P.map((e, t) => `${t + 1}. ${e}`).join("\n")}\n\n${buildSituationalAwarenessBlock()}${composeExtraTail([buildEmotionHintBlock(e, { incoming: n, addressedOther: !1 }), buildEventMemoryBlock(e)])}\n\nCRITICAL: Respond ONLY as ${e.name} with a NEW single message. DO NOT repeat or include previous conversation messages in your response. Generate ONE fresh response only.\n\nReply naturally as ${e.name} (dialogue and actions - use *asterisks* for physical actions):`,
        personalAllowed: s,
    };
}
(window.NuclearEmbeddingService = NuclearEmbeddingService),
    console.log("🚀 Nuclear Context Intelligence System - Phase 1 Initialized"),
    console.log("🔥 Nuclear Context Intelligence System - Phase 2 IGNITED"),
    (window.debugContextSelection = function (e, t, n) {
        console.group("🚀 Nuclear Context Selection Debug"),
            console.log("Employee:", e.name),
            console.log("Interaction Type:", t),
            console.log("Interaction Data:", n);
        const a = selectIntelligentContext(e, { type: t, ...n }, { maxTokens: 400, maxPieces: 15 });
        return (
            console.log("\n📊 Selected Context Pieces:", a.length),
            console.table(
                a.map((e) => ({
                    ID: e.id,
                    Category: e.category,
                    Score: e.score.toFixed(3),
                    Priority: e.priority,
                    Text: e.text.substring(0, 60) + "...",
                }))
            ),
            console.log("\n📈 Score Breakdown:"),
            a.slice(0, 5).forEach((e) => {
                console.log(`\n${e.id}:`),
                    console.log("  Base:", e.scores.base.toFixed(3)),
                    console.log("  Semantic:", e.scores.semantic.toFixed(3)),
                    console.log("  Temporal:", e.scores.temporal.toFixed(3)),
                    console.log("  Novelty:", e.scores.novelty.toFixed(3)),
                    console.log("  Coherence:", e.scores.coherence.toFixed(3)),
                    console.log("  → FINAL:", e.score.toFixed(3));
            }),
            console.log("\n📝 Formatted Context:"),
            console.log(formatContextForPrompt(a, { grouped: !0 })),
            console.groupEnd(),
            a
        );
    }),
    (window.showContextAnalytics = function (e) {
        const t = getContextAnalytics(e);
        t
            ? (console.group(`📊 Context Analytics: ${e.name}`),
              console.log("Total Interactions:", t.totalInteractions),
              console.log("Unique Pieces Used:", t.piecesUsed),
              console.log("Avg Pieces/Interaction:", t.averagePiecesPerInteraction.toFixed(1)),
              console.log("\n📈 Category Distribution:"),
              console.table(t.categoryDistribution),
              console.log("\n🔥 Most Used Context:"),
              console.table(
                  t.mostUsedPieces.map((e) => ({
                      ID: e.id,
                      Count: e.usage.count,
                      Text: e.piece?.text.substring(0, 50) || "N/A",
                  }))
              ),
              console.log("\n❄️ Least Used Context:"),
              console.table(
                  t.leastUsedPieces.map((e) => ({
                      ID: e.id,
                      Count: e.usage.count,
                      Text: e.piece?.text.substring(0, 50) || "N/A",
                  }))
              ),
              console.log("\n⏱️ Recent Interactions:"),
              t.recentInteractions.forEach((e) => {
                  const t = Math.round((Date.now() - e.timestamp) / 6e4);
                  console.log(`${e.type} - ${t}m ago - ${e.pieceCount} pieces`);
              }),
              console.groupEnd())
            : console.log("No context usage data for", e.name);
    }),
    (window.testRehirePool = function () {
        gameState.employees && 0 !== gameState.employees.length
            ? ((gameState.rehirePool = gameState.employees.map((e) => ({
                  ...e,
                  timesRehired: 0,
                  previousPosition: e.career?.title || "Employee",
              }))),
              console.log(`✅ Added ${gameState.rehirePool.length} employees to rehire pool!`),
              console.log('Now open the hiring modal to see the "Rehire Former Employees" button.'),
              console.log("The toggle will show all your current employees as rehire candidates."),
              console.table(
                  gameState.rehirePool.map((e) => ({
                      Name: e.name,
                      Age: e.age,
                      Position: e.previousPosition,
                      Skills: `Tech:${e.skills?.technical?.level || 1} Soc:${e.skills?.social?.level || 1}`,
                  }))
              ))
            : console.log("❌ No employees to add to rehire pool. Hire some employees first!");
    }),
    console.log("🔬 Nuclear Context Debug Tools Loaded!"),
    console.log("  → debugContextSelection(employee, type, data)"),
    console.log("  → showContextAnalytics(employee)");
