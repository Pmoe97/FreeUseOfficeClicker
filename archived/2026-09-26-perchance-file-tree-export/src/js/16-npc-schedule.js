// ============================================================================
// 16-npc-schedule — NPC performance metrics, schedules, status messages, morning/evening posts, activity system, createSocialPost.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function calculateEmployeePerformance(e) {
  let t = 0;
  const n = {}, a = e.stats?.productivity || 50;
  n.productivity = Math.floor(0.3 * a), t += n.productivity;
  const o = e.hireDate || Date.now(), i = Math.floor((Date.now() - o) / 864e5);
  n.tenure = Math.min(15, Math.floor(i / 7)), t += n.tenure;
  const s = e.career?.level || 1;
  n.careerLevel = 3 * s, t += n.careerLevel;
  const r = gameState.products.find((t2) => t2.name === e.productManaged && t2.managerHired);
  if (r) {
    const e2 = currentValue(r) / (parseFloat(calculateCashPerSecond()) || 1) * 100;
    n.management = Math.min(20, Math.floor(e2 / 5)), t += n.management;
  } else n.management = 0;
  const l = e.stats?.affection || 50, c = e.stats?.trust || 50;
  n.relationship = Math.floor((l + c) / 2 * 0.15), t += n.relationship;
  let d = 0;
  e.skills && (d = Object.values(e.skills).reduce((e2, t2) => e2 + (t2.level || 0), 0)), n.skills = Math.min(10, d), t += n.skills;
  const p = e.lastActivityTime || e.hireDate || Date.now(), m = Math.floor((Date.now() - p) / 864e5);
  return m > 7 ? (n.activityPenalty = -Math.min(10, m - 7), t += n.activityPenalty) : n.activityPenalty = 0, e.performanceBreakdown = n, e.performanceScore = Math.max(0, t), e.performanceLastUpdated = Date.now(), { score: Math.max(0, t), breakdown: n, grade: getPerformanceGrade(t) };
}
function getPerformanceGrade(e) {
  return e >= 90 ? { letter: "S", color: "var(--z)", label: "Outstanding" } : e >= 80 ? { letter: "A", color: "var(--n)", label: "Excellent" } : e >= 70 ? { letter: "B", color: "var(--u)", label: "Good" } : e >= 55 ? { letter: "C", color: "#ffcc00", label: "Average" } : e >= 40 ? { letter: "D", color: "var(--db)", label: "Below Average" } : { letter: "F", color: "var(--l)", label: "Poor" };
}
function updateEmployeePerformanceMetrics() {
  gameState.performanceTracking || (gameState.performanceTracking = { enabled: true, lastUpdate: Date.now(), weeklyReviews: [], topPerformersHistory: [] });
  const e = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus), t = e.map((e2) => ({ id: e2.id, name: e2.name, ...calculateEmployeePerformance(e2) }));
  t.sort((e2, t2) => t2.score - e2.score), gameState.performanceTracking.weeklyReviews.unshift({ date: gameState.time?.currentTime || Date.now(), topThree: t.slice(0, 3).map((e2) => ({ id: e2.id, name: e2.name, score: e2.score, grade: e2.grade })), averageScore: t.length > 0 ? Math.floor(t.reduce((e2, t2) => e2 + t2.score, 0) / t.length) : 0 }), gameState.performanceTracking.weeklyReviews.length > 12 && gameState.performanceTracking.weeklyReviews.pop(), gameState.performanceTracking.lastUpdate = Date.now(), document.getElementById("dashTopPerformers") && rd(), console.log(`[Performance] Updated metrics for ${e.length} employees`);
}
function _o() {
  let e = 0;
  gameState.employees.forEach((t) => {
    t.schedule && Oo(t) && (t.schedule.isCurrentlyWorking = true, t.schedule.lastClockIn = gameState.time.currentTime, e++);
  }), e > 0 && (console.log(`\u23F0 9 AM: ${e} employees clocked in`), updatePeopleTab());
}
function Ro() {
  let e = 0;
  gameState.employees.forEach((t) => {
    t.schedule && t.schedule.isCurrentlyWorking && (t.schedule.isCurrentlyWorking = false, t.schedule.lastClockOut = gameState.time.currentTime, e++);
  }), e > 0 && (console.log(`\u23F0 5 PM: ${e} employees clocked out`), updatePeopleTab());
}
function Oo(e) {
  if (!e.schedule) return false;
  if (e.schedule.isOnLeave) {
    if (!(e.schedule.leaveEndDate && gameState.time.currentTime >= e.schedule.leaveEndDate)) return false;
    e.schedule.isOnLeave = false, e.schedule.leaveType = null, e.schedule.leaveEndDate = null;
  }
  if (e.flags && e.flags.systemFlags.some((e2) => "sick" === e2.key && e2.value.severity > 50) && Math.random() < 0.7) return false;
  const t = pe.getDay();
  return e.schedule.workDays.includes(t);
}
function Fo() {
  const e = gameState.socialNetwork?.posts;
  !e || e.length <= CAPS.SOCIAL_POSTS || e.slice(CAPS.SOCIAL_POSTS).forEach((e2) => {
    if (e2.isPlayerPost || !e2.authorId) return;
    const n = gameState.employees.find((t2) => t2.id === e2.authorId);
    if (n && e2.content && (e2.likes?.length || 0) + (e2.comments?.length || 0) >= 5 && Hr(n, `you once posted: "${e2.content.substring(0, 80)}"`, "pruned"), !e2.imageUrl) return;
    const t = n;
    t && (t.photos || (t.photos = []), t.photos.some((t2) => ("string" == typeof t2 ? t2 : t2.url) === e2.imageUrl) || t.photos.push({ url: e2.imageUrl, source: "social_pruned", caption: e2.content || "", timestamp: e2.timestamp || Date.now() }));
  });
}
function jo(e) {
  if (!e) return;
  const t = gameState.socialNetwork?.posts;
  if (!Array.isArray(t)) return;
  const n = t.filter((t2) => t2 && t2.authorId === e.id);
  if (!n.length) return;
  e.photos || (e.photos = []), n.forEach((t2) => {
    t2.imageUrl && (e.photos.some((e2) => ("string" == typeof e2 ? e2 : e2.url) === t2.imageUrl) || e.photos.push({ url: t2.imageUrl, source: "social_prestige", caption: t2.content || "", timestamp: t2.timestamp || Date.now() }));
  });
  const a = n.filter((e2) => e2.content).slice(0, 6).map((e2) => e2.content.substring(0, 120));
  a.length && (e.memory || (e.memory = {}), e.memory.priorSocialPosts = a);
}
function qo(e = gameState.socialNetwork) {
  const t = e?.posts;
  t && (t.forEach((e2) => {
    if (e2.comments && e2.comments.length > 40) {
      const t2 = e2.comments.filter((e3) => e3.isPlayerComment || "player" === e3.authorId), n = e2.comments.filter((e3) => !(e3.isPlayerComment || "player" === e3.authorId)), a = Math.max(0, 40 - t2.length);
      e2.comments = [...n.slice(-a), ...t2].sort((e3, t3) => (e3.timestamp || 0) - (t3.timestamp || 0));
    }
  }), t.slice(150).forEach((e2) => {
    (e2.comments || []).forEach((e3) => {
      e3.imageUrl && (e3.imageUrl = null, e3.imagePrompt = null);
    });
  }));
}
function zo(e) {
  if (e.isPlayerPost) return null;
  if ((e.referencedEmployees || []).includes("player") || /@TheBoss\b/i.test(e.content || "")) return "mentioned you";
  if ((e.upvotes || 0) - (e.downvotes || 0) + (e.likes?.length || 0) + 2 * (e.comments?.length || 0) >= 10) return "blowing up";
  const t = gameState.employees.find((t2) => t2.id === e.authorId);
  return t && ((t.stats?.affection || 0) > 70 || (t.memory?.intimacyLevel || 0) > 50) ? "close to you" : Date.now() - (e.timestamp || 0) < 36e5 ? "just now" : null;
}
function Uo(e) {
  if (!e || "string" != typeof e) return false;
  const t = e.trim().toLowerCase();
  return ["experiencing some technical difficulties", "please try again in a moment", "having some difficulty with my words", "could you try asking again", "positive energy to any workplace", "some technical details need to be worked out"].some((e2) => t.includes(e2));
}
function createSocialPost(e) {
  if (!e || !e.authorId || !e.content) return void console.warn("Invalid post data:", e);
  if (Uo(e.content)) return void console.warn("[Social] Refusing to persist AI-fallback text as a post:", e.content);
  const t = { id: `post_${++gameState.socialNetwork.postIdCounter}_${Date.now()}`, authorId: e.authorId, authorName: e.authorName, type: e.type || "life_update", content: e.content, timestamp: e.timestamp || gameState.time.currentTime, likes: e.likes || [], comments: e.comments || [], mentions: e.mentions || [], media: e.media || null, location: e.location || null, mood: e.mood || null, tags: e.tags || [], imageUrl: e.imageUrl || null, imagePrompt: e.imagePrompt || null, altText: e.altText || null, explicitLevel: e.explicitLevel || 0, nsfwLevel: e.nsfwLevel || 0 };
  return gameState.socialNetwork.posts.unshift(t), Fo(), gameState.socialNetwork.posts.length > CAPS.SOCIAL_POSTS && (gameState.socialNetwork.posts = gameState.socialNetwork.posts.slice(0, CAPS.SOCIAL_POSTS)), "social" === gameState.activeTab && "function" == typeof wg && wg(), t;
}
function generateMorningPost(e) {
  const t = ["Coffee is life \u2615", "Monday blues \u{1F634}", "Traffic was brutal this morning \u{1F697}", "Actually excited for today! \u{1F31E}", "Another day, another dollar \u{1F4BC}", "Who else needs caffeine to function? \u2615\u{1F605}", "Made it to work somehow \u{1F3E2}"], n = t[Math.floor(Math.random() * t.length)];
  createSocialPost({ authorId: e.id, authorName: e.name, type: "life_update", content: n, timestamp: gameState.time.currentTime, likes: [], comments: [], mentions: [] });
}
function generateEveningPost(e) {
  const t = ["Finally done for the day! \u{1F389}", "Happy hour anyone? \u{1F37B}", "Time to unwind \u{1F60C}", "Made it through another week! \u{1F4AA}", "Weekend vibes loading... \u{1F334}", "Exhausted but accomplished \u{1F634}\u2705", "Who's ready for the weekend?"], n = t[Math.floor(Math.random() * t.length)];
  createSocialPost({ authorId: e.id, authorName: e.name, type: "life_update", content: n, timestamp: gameState.time.currentTime, likes: [], comments: [], mentions: [] });
}
async function Yo(e, t, n = "bonus_pool") {
  if (!e || 0 === e.length) return;
  const a = t >= 5e3 ? 3 : t >= 1e3 ? 2 : 1, o = [...e].sort(() => Math.random() - 0.5).slice(0, Math.min(a, e.length)), i = t >= 5e3 ? "huge" : t >= 1e3 ? "nice" : "small", s = "payday_bonus" === n ? "payday bonus with their salary" : "company bonus pool distribution";
  for (let e2 = 0; e2 < o.length; e2++) {
    const n2 = o[e2];
    setTimeout(async () => {
      try {
        const a2 = await Wo(n2, t, i, s);
        a2 && (createSocialPost({ authorId: n2.id, authorName: n2.name, type: a2.explicitLevel > 0 ? "lewd" : "appreciation", content: a2.content, timestamp: gameState.time.currentTime, likes: [], comments: [], mentions: a2.mentionsBoss ? ["TheBoss"] : [], mood: "excited", tags: ["bonus", "grateful", "worklife"], imageUrl: a2.imageUrl || null, imagePrompt: a2.imagePrompt || null, explicitLevel: a2.explicitLevel || 0, nsfwLevel: a2.explicitLevel || 0 }), debugLog("Social", `${n2.name} posted AI-generated bonus reaction${a2.imageUrl ? " with image" : ""}`));
      } catch (u2) {
        console.error(`[Social] Failed to generate bonus post for ${n2.name}:`, u2);
      }
    }, 1e3 * e2);
  }
}
async function Wo(e, t, n, a) {
  const o = e.personality || {}, i = e.social || {}, s = e.stats?.affection || 50, r = e.intimacy || 0, l = [dv(o.outgoing || 50, "outgoing"), dv(o.professional || 50, "professional"), dv(o.flirty || 50, "flirty"), dv(o.confidence || 50, "confident")].join(", "), c = Math.random(), u2 = ("function" != typeof Ue || !Ue()) && (o.flirty || 50) > 55 && s > 55 && r > 40;
  let d, p;
  c < 0.25 ? (d = "text_only", p = null) : c < 0.45 ? (d = "spending_plans", p = Math.random() < 0.4 ? "wishlist" : null) : c < 0.6 ? (d = "selfie_reaction", p = "selfie") : c < 0.75 ? (d = "celebration", p = Math.random() < 0.5 ? "celebration" : null) : c < 0.85 ? (d = "grateful", p = null) : c < 0.92 && (u2 || o.flirty > 50 && s > 60) ? u2 && Math.random() < 0.55 ? (d = "nsfw_thanks", p = null) : (d = "flirty_thanks", p = Math.random() < 0.5 ? "flirty_selfie" : null) : (d = "creative", p = null);
  const m = { text_only: `Write a spontaneous reaction to getting a ${n} bonus. Be authentic - excited, grateful, surprised, whatever fits your personality. Could thank the boss, brag a little, or just express your feelings. 1-2 sentences.`, spending_plans: `Write about what you're going to do with your ${n} bonus! Ideas: treating yourself to something specific, finally buying that thing you wanted, vacation fund, savings goals, splurging on food/drinks, shopping spree, paying off something. Be specific and personal! 1-2 sentences. Examples: "This bonus is going straight to that bag I've been eyeing \u{1F45C}\u{1F4B8}", "Vacation fund just got a serious boost \u2708\uFE0F\u{1F3D6}\uFE0F", "Sushi for dinner because I DESERVE IT \u{1F363}\u{1F4B0}"`, selfie_reaction: `Write a SHORT caption for an excited selfie you're taking because you just got a ${n} bonus! Show your personality - could be smug, giddy, grateful, or just vibing. 5-15 words max. Examples: "Bonus face activated \u{1F4B0}\u{1F60F}", "When the direct deposit hits \u{1F60D}\u{1F4B8}", "This is my grateful face \u2728", "Secure the bag, literally \u{1F485}\u{1F4B0}"`, celebration: `Write about how you're celebrating your ${n} bonus! Treating yourself to food, drinks, or something fun. Be specific! 1-2 sentences. Examples: "Bonus means fancy coffee all week \u2615\u2728", "Taking myself out to dinner because I'm worth it \u{1F35D}\u{1F495}", "This calls for champagne \u{1F942}\u{1F4B0}", "Ordered dessert AND an appetizer, feeling rich \u{1F389}"`, grateful: `Write a genuinely grateful post about receiving a ${n} bonus. Could be emotional, appreciative, or touching. Maybe mention what it means to you personally. 1-2 sentences. ${s > 70 ? "You have a great relationship with your boss, so feel free to express genuine warmth." : ""} Examples: "Not gonna lie, I teared up a little \u{1F979}\u{1F495}", "This job really does appreciate us and it shows \u{1F62D}\u2764\uFE0F", "Feeling so valued right now, thank you @TheBoss \u{1F64F}"`, flirty_thanks: `Write a playful, flirty thank you for your ${n} bonus. You have a close relationship with @TheBoss so you can be a bit suggestive or teasing about how you'll "thank them properly" later \u{1F60F}. Keep it fun and cheeky! 1-2 sentences. Examples: "Might have to thank @TheBoss properly later \u{1F60F}\u{1F48B}", "@TheBoss spoiling me again... might have to return the favor \u{1F495}\u{1F525}", "Best boss ever, I'll make it up to you \u{1F618}"`, nsfw_thanks: `Write an explicit, sexually suggestive thank you for your ${n} bonus. You and @TheBoss are intimate, so be bold and adult about exactly how you intend to repay them \u2014 innuendo, desire, what you want to do to/for them. Steamy and confident, in YOUR voice. 1-2 sentences. Examples: "@TheBoss is getting thanked on their knees... I mean, mine \u{1F60F}\u{1F525}", "Already thinking about how I'm gonna work this bonus off, and it's not at my desk \u{1F48B}\u{1F4A6}", "Boss spoils me, I spoil boss... privately \u{1F608}"`, creative: `Write a unique, creative reaction to getting a ${n} bonus. Could be: meme-style humor, chaotic energy, unexpected angle, or just a really creative take. Be original! 1-2 sentences. Examples: "Plot twist: I'm still broke but slightly less broke \u{1F480}\u{1F4B8}", "My bank account seeing a positive number: \u{1F441}\uFE0F\u{1F444}\u{1F441}\uFE0F", "Me pretending I won't spend this immediately \u{1F921}\u{1F4B0}", "Capitalism is bad but these vibes? Immaculate \u2728"` }, G2 = "flirty_thanks" === d || "grateful" === d || Math.random() < 0.4 + s / 200 ? "\n\u{1F4A1} Mention @TheBoss in your post to thank them or reference them!" : "\n\u{1F4A1} You can mention @TheBoss or keep the post general - your choice!", g = getPhysicalDescriptionForPrompt(e), h = `You are ${e.name}, a ${e.age || 25}-year-old ${"Male" === e.gender ? "man" : "woman"} posting on social media.

YOUR APPEARANCE: ${g}

Your personality: ${l}
Content style: ${"casual" === i.contentStyle ? "casual, uses slang" : "balanced, friendly"}
Your affection toward your boss: ${s}/100 ${s > 70 ? "(you really like them!)" : s > 50 ? "(good relationship)" : "(professional)"}
${r > 30 ? `Your intimacy level with boss: ${r}/100 (you have a close/flirty relationship)` : ""}

\u{1F4B0} SITUATION: You just received a ${n.toUpperCase()} bonus of $${wu(t)} from your job (${a})!

${m[d]}${G2}

RULES:
- Write ONLY the post text, nothing else
- Be authentic to YOUR personality
- 1-2 emojis max
- NO hashtags
- NO meta-commentary or explanations
- Sound like a real person on social media

Write ONLY the post:`;
  try {
    if ("function" != typeof generateText) throw new Error("AI not available");
    let n2 = await queuedGenerateText(h, { temperature: 0.95, max_tokens: 100, stopSequences: ["\n\n", "---", "Rating:", "(Note:"] }, `Generating bonus reaction post for ${e.name}`);
    n2 = extractText(n2), n2 = n2.replace(/\{[A-Z]+:[^}]*\}\s*/g, ""), n2 = n2.replace(/^\*\*[^*]+\*\*\s*/g, ""), n2 = n2.split(/\n\s*\(/)[0], n2 = n2.trim(), n2 = n2.replace(/\b(the\s+)?([Mm]y\s+)?([Oo]ur\s+)?[Bb]oss\b/g, "@TheBoss"), n2 = n2.replace(/@@TheBoss/g, "@TheBoss"), n2 = n2.replace(/@[Bb]oss\b/g, "@TheBoss"), "function" == typeof cleanWithLearning && (n2 = cleanWithLearning(n2));
    const a2 = n2.includes("@TheBoss");
    let o2 = null, i2 = null;
    if (p && "function" == typeof queuedGenerateImage) try {
      i2 = await Ko(e, p, n2, t), i2 && (o2 = await queuedGenerateImage(applyImageStyle(i2), `Bonus post image for ${e.name}`));
    } catch (e2) {
      console.warn("[Social] Image generation failed for bonus post:", e2);
    }
    return { content: n2, mentionsBoss: a2, imageUrl: o2, imagePrompt: i2, explicitLevel: "nsfw_thanks" === d ? 2 : 0 };
  } catch (e2) {
    return console.error("[AI] Bonus post generation failed:", e2), null;
  }
}
async function Ko(e, t, n, a) {
  const o = getPhysicalDescriptionForPrompt(e);
  return { selfie: `Selfie photo of ${o}, looking excited and happy, maybe holding phone up for selfie, genuine smile or excited expression, natural lighting, social media selfie style`, flirty_selfie: `Flirtatious selfie of ${o}, playful confident expression, maybe winking or biting lip slightly, ${(e.personality || {}).flirty > 70 ? "revealing outfit showing cleavage" : "cute outfit"}, bedroom eyes, social media thirst trap style`, wishlist: `Photo of ${n.includes("bag") ? "a luxury handbag" : n.includes("shoe") ? "designer shoes" : n.includes("vacation") || n.includes("trip") ? "a beautiful beach resort" : n.includes("food") || n.includes("dinner") || n.includes("sushi") ? "an elegant restaurant meal" : "shopping bags and luxury items"}, aesthetic product photography, aspirational wishlist style`, celebration: `${o} celebrating, ${n.includes("coffee") ? "holding a fancy coffee drink" : n.includes("champagne") || n.includes("wine") ? "toasting with champagne glass" : n.includes("dinner") || n.includes("food") ? "at a nice restaurant with food" : "celebrating with a drink or treat"}, happy expression, warm lighting, lifestyle photography` }[t] || null;
}
function Jo(e) {
  const t = e.schedule && e.schedule.isCurrentlyWorking, n = pe.isWorkHours();
  if (n && t) return { available: true, context: "at_work" };
  if (!n) {
    const t2 = pe.getHour();
    return t2 >= 23 || t2 < 6 ? e.stats && e.stats.affection < 80 ? { available: false, reason: "It's very late..." } : { available: true, context: "late_night" } : e.stats && (e.stats.affection > 40 || e.stats.trust > 50) ? { available: true, context: "after_hours" } : Math.random() < 0.3 ? { available: false, reason: "I'm off the clock..." } : { available: true, context: "after_hours" };
  }
  return pe.isWeekend() ? e.stats && e.stats.affection > 60 ? { available: true, context: "weekend" } : { available: false, reason: "It's my day off..." } : { available: true, context: "general" };
}
function Qo(e) {
  const t = Jo(e), n = pe.getFormattedTime();
  let a = `
\u{1F4C5} CURRENT DATE & TIME: ${pe.getFormattedDate()}, ${n}`;
  const o = Xo(e);
  if ("after_hours" === t.context ? (a += "\n\u23F0 TIME CONTEXT: It's after work hours. You're OFF THE CLOCK - at home, relaxed, living your personal life.", a += "\n\u{1F6AB} WORK TOPIC RULE: Do NOT bring up work projects, reports, meetings, deadlines, or any work tasks unless the player specifically asks about work. You are done for the day. If the player mentions work, you can respond briefly but steer back to personal topics. Think about what a real person talks about after hours: hobbies, food, TV shows, plans, how they're feeling, personal life - NOT the Henderson report.", o ? a += `
${o}` : e.personalLife && e.personalLife.currentActivity && (a += `
CURRENT ACTIVITY: ${e.personalLife.currentActivity.description}`)) : "late_night" === t.context ? (a += "\n\u{1F319} TIME CONTEXT: It's very late at night. You're tired, maybe in bed. Keep responses brief unless it's important or intimate.", a += "\n\u{1F6AB} WORK TOPIC RULE: Do NOT mention work at all. It's the middle of the night. Nobody thinks about spreadsheets at 2 AM. Talk about personal things, being tired, what you're doing, or just be sleepy and casual.") : "weekend" === t.context ? (a += "\n\u{1F4C5} TIME CONTEXT: It's the weekend. You're off work, doing personal activities.", a += "\n\u{1F6AB} WORK TOPIC RULE: Do NOT bring up work projects or tasks unprompted. It's your day off. Only discuss work if the player specifically asks. Focus on your weekend activities, plans, hobbies, or personal life. Mention what you're up to!", o ? a += `
${o}` : e.personalLife && e.personalLife.currentActivity && (a += `
CURRENT ACTIVITY: ${e.personalLife.currentActivity.description}`)) : "at_work" === t.context && (a += "\n\u{1F4BC} TIME CONTEXT: You're at work right now. Work topics are natural but you can also chat during breaks.", o && (a += `
${o}`)), e.personalLife && e.personalLife.livingSituation && e.personalLife.livingSituation.hasRoommate && t.context && !t.context.includes("work") && (a += "\n(You live with a roommate)"), e.npcStatus && !["chatting_player", "in_person_player"].includes(e.npcStatus.current)) {
    const t2 = e.npcStatus, n2 = t2.richLabel || t2.label, o2 = { sleeping: "\u{1F319} You are asleep right now. If you respond at all, be extremely groggy, confused, and very brief.", vampire_rest: "\u26B0\uFE0F You are in daytime rest. The daylight feels oppressive. You are extremely sluggish and slow.", elf_trance: "\u{1F33F} You are in a meditative trance \u2014 dreamy, slightly detached, slower to engage.", angel_meditation: "\u2728 You are in deep meditation \u2014 serene, measured, unhurried in your response.", waking_up: "\u2600\uFE0F You just woke up. Groggy, still half-asleep, responses are slow and hazy.", at_gym: "\u{1F3CB}\uFE0F You are at the gym right now. Sweaty, catching a breath between sets. Keep it brief.", on_date: "\u{1F495} You are on a date. Be very brief \u2014 you're with someone and trying to be present.", in_meeting: "\u{1F4CA} You are in a meeting. Extremely brief responses only \u2014 quick texts between slides.", cooking: "\u{1F373} You're in the middle of cooking. Distracted, arms probably busy, keep it short.", socializing: "\u{1F389} You're out with friends. Background noise, casual energy, slightly distracted.", at_bar: "\u{1F37B} You're at a bar. Relaxed, social, maybe a drink in hand.", commuting: "\u{1F6B6} You're commuting. Moving, keep responses brief \u2014 you're on your way somewhere.", night_shift: "\u26A1 You're on the night shift. Alert but the office is quiet and a little eerie.", sick: "\u{1F912} You're sick today. Low energy, worn out, brief responses.", traveling: "\u2708\uFE0F You're traveling. Sporadic access, possibly jet-lagged or distracted.", on_vacation: "\u{1F3D6}\uFE0F You're on vacation. Relaxed, checked out from work, enjoying yourself.", working_late: "\u{1F319} You're staying late at work. Tired but grinding through it.", walking_dog: "\u{1F415} You're outside walking your dog right now.", vampire_hunt: "\u{1F9DB} You're out in the night \u2014 what you're doing is your business. Mysterious, alert." }[t2.current];
    o2 && (a += `
${o2}`), a += `
\u{1F4CD} YOUR STATUS RIGHT NOW: ${n2}`, a += "\nYou are fully aware of what you're doing. You can reference it naturally \u2014 mention it if asked, bring it up organically, or respond to questions about it directly.";
    const i = pe.getHour(), s = e.personality?.outgoing ?? 50, r = s > 65 ? 0 : s < 35 ? 22 : 23, l = e.schedule?.workEndHour ?? 17, c = gameState.time?.currentTime || Date.now(), d = t2.lastUpdated && c - t2.lastUpdated < 37e5;
    "at_work" === t2.current && i >= l - 1 && (a += "\nYou're almost done for the day \u2014 starting to wrap up and thinking about leaving."), ["relaxing", "reading", "gaming", "having_dinner", "hobbies"].includes(t2.current) && i === (r - 1 + 24) % 24 && (a += "\nYou're starting to feel tired and winding down \u2014 you might mention getting sleepy or heading to bed soon."), d && !["at_work", "relaxing", "sleeping"].includes(t2.current) && (a += "\nYou just transitioned to this activity recently \u2014 you can naturally mention what you just finished or just started.");
  }
  return a;
}
function Xo(e) {
  if (!e.personalLife) return null;
  const t = gameState.time?.currentTime || Date.now(), n = pe.getHour(), a = pe.getMinute ? pe.getMinute() : new Date(t).getMinutes(), o = e.personalLife.previousActivity, i = e.personalLife.currentActivity, s = e.personalLife.transitionStartTime || 0;
  if (s && t - s < 18e5) {
    const e2 = o?.description || "your previous activity", n2 = i?.description || "something else";
    return Math.floor((t - s) / 6e4) < 10 ? `\u{1F504} TRANSITION: You're finishing up / wrapping up from: ${e2}. You haven't started your next thing yet. You might be packing up, saying goodbye, heading out, or commuting. Don't suddenly act like you're already doing something new.` : `\u{1F504} TRANSITION: You're heading to / getting ready for: ${n2}. You just finished: ${e2}. You're in transit, settling in, or just arriving. Ease into the new activity naturally - don't act like you've been doing it for hours.`;
  }
  if (!pe.isWeekend() && 16 === n && a >= 30) return "\u{1F504} TRANSITION: The work day is winding down. You're wrapping up tasks, thinking about what you'll do after work. Don't suddenly switch to a personal activity - you're still at work but mentally transitioning.";
  if (!pe.isWeekend() && 17 === n && a <= 15) {
    const e2 = i?.description;
    return "\u{1F504} TRANSITION: " + (e2 ? `You just left work. Maybe heading home, maybe heading to: ${e2}. You're commuting or just arriving - ease into it.` : "You just left work and are heading home or out. You're in commute/transition mode.");
  }
  return null;
}
window.resolveCompanyEvent = function(e, t) {
  const n = gameState.companyEvents.active.findIndex((t2) => t2.id === e && !t2.resolved);
  if (-1 === n) return;
  const a = gameState.companyEvents.active[n], o = a.eventData.choices[t];
  if (gameState.cash < o.cost) return void showNotification("\u274C Not enough cash!", "error");
  o.cost > 0 && (gameState.cash -= o.cost);
  const i = o.outcome;
  if (i.effects && Po(i.effects), i.employeeEffect) {
    const e2 = a.involvedEmployees[0] ? gameState.employees.find((e3) => e3.id === a.involvedEmployees[0]) : null;
    e2 && Co(e2, i.employeeEffect);
  }
  i.employeeEffects && i.employeeEffects.forEach((e2) => {
    const t2 = e2.employee || gameState.employees.find((t3) => t3.id === e2.employeeId);
    t2 && Co(t2, e2);
  }), i.delayedEffects && Eo(i.delayedEffects), i.delayedCost && Io(i.delayedCost, a.name), i.special && Mo(i.special, a), a.resolved = true, a.chosenOption = t, a.outcomeText = i.text, gameState.companyEvents.history.unshift(a), gameState.companyEvents.active.splice(n, 1), gameState.companyEvents.history.length > 30 && gameState.companyEvents.history.pop();
  const s = document.getElementById("companyEventModal");
  s && s.remove(), $o(a, i), saveGame(false);
};
let Zo = "";
function ea() {
  const e = document.getElementById("game-time-display");
  if (e && gameState.time) {
    const t = pe.getFormattedDate(), n = pe.getFormattedTime(), a = pe.getTimeOfDay(), o = { morning: "\u{1F305}", afternoon: "\u2600\uFE0F", evening: "\u{1F306}", night: "\u{1F319}" }, i = gameState.time.activeContext || "idle", s = "function" == typeof yt ? yt() : gameState.time.timeScale, r = { conversation: { icon: "\u{1F4AC}", label: "Chatting", color: "var(--n)" }, group: { icon: "\u{1F465}", label: "Group", color: "var(--j)" }, social: { icon: "\u{1F4F1}", label: "Browsing", color: "var(--u)" }, idle: { icon: "", label: "", color: "" } }, l = r[i] || r.idle, c = gameState.time.baseTimeScale || gameState.time.timeScale || 20, d = s < c && "idle" !== i ? `<span style="margin-left:8px; background:${l.color}; color:var(--q); padding:2px 6px; border-radius:10px; font-size:0.7rem; font-weight:600;">${l.icon} ${s}x <span style="text-decoration:line-through; opacity:0.6;">${c}x</span></span>` : `<span style="margin-left:8px; background:var(--ag); color:var(--a); padding:2px 6px; border-radius:10px; font-size:0.7rem; font-weight:600;">${s}x</span>`, p = `${o[a]} ${t} ${n} ${i}`;
    if (p !== Zo) {
      Zo = p, e.innerHTML = ` <span>${o[a]} ${t}</span> <span style="margin-left: 10px;">${n}</span> ${d}
        `;
      const i2 = document.getElementById("chatGameClock");
      i2 && (i2.textContent = `${o[a]} ${t} ${n}`);
    }
  }
}
function ta(e) {
  if (!e.personalLife) return null;
  const t = e.personalLife.eveningPreferences;
  if (!t) return null;
  const n = pe.getHour();
  if (n < 17 || n >= 23) return null;
  const a = [];
  if (Math.random() < t.gym && a.push({ type: "gym", weight: t.gym }), Math.random() < t.cooking && a.push({ type: "cooking", weight: t.cooking }), Math.random() < t.socializing && a.push({ type: "socializing", weight: t.socializing }), Math.random() < t.relaxing && a.push({ type: "relaxing", weight: t.relaxing }), Math.random() < t.hobbies && e.personalLife.activeHobbies.length > 0 && a.push({ type: "hobby", weight: t.hobbies }), Math.random() < t.dating && e.personalLife.outsideContacts.inRelationship && a.push({ type: "date", weight: t.dating }), 0 === a.length) return { type: "relaxing", details: "Chilling at home" };
  const o = a.reduce((e2, t2) => e2 + t2.weight, 0);
  let i = Math.random() * o;
  for (const t2 of a) if (i -= t2.weight, i <= 0) return oa(e, t2.type);
  return { type: "relaxing", details: "Chilling at home" };
}
function oa(e, t) {
  const n = { type: t, description: "", skillGain: null };
  switch (t) {
    case "gym":
      const t2 = ["Hitting the gym \u{1F4AA}", "Cardio day at the gym", "Leg day (kill me now) \u{1F9B5}", "Upper body workout", "Quick gym session", "Getting those gains \u{1F3CB}\uFE0F"];
      n.description = t2[Math.floor(Math.random() * t2.length)], n.skillGain = { skill: "fitness", xp: 5 };
      break;
    case "cooking":
      const a = ["Trying a new recipe tonight \u{1F468}\u200D\u{1F373}", "Cooking dinner from scratch", "Meal prepping for the week", "Experimenting in the kitchen", "Making my favorite dish", "Cooking up something special \u{1F373}"];
      n.description = a[Math.floor(Math.random() * a.length)], n.skillGain = { skill: "cooking", xp: 5 };
      break;
    case "socializing":
      const o = ["Meeting friends for drinks \u{1F37B}", "Game night with the crew \u{1F3AE}", "Dinner with friends", "Bar hopping tonight", "Catching up with old friends", "Girls night out! \u{1F483}"];
      n.description = o[Math.floor(Math.random() * o.length)], n.skillGain = { skill: "social", xp: 3 };
      break;
    case "relaxing":
      const i = ["Netflix and chill tonight \u{1F4FA}", "Just relaxing at home", "Reading a good book \u{1F4DA}", "Taking it easy tonight", "Couch potato mode activated", "Self-care evening \u{1F6C1}"];
      n.description = i[Math.floor(Math.random() * i.length)];
      break;
    case "hobby":
      if (e.personalLife.activeHobbies.length > 0) {
        const t3 = e.personalLife.activeHobbies[0];
        n.description = `Doing my ${t3.name} hobby tonight`;
        const a2 = { Gaming: "technical", Photography: "creative", Painting: "creative", Writing: "creative", Music: "creative", Sports: "fitness", Yoga: "fitness", Dancing: "fitness" }[t3.name];
        a2 && (n.skillGain = { skill: a2, xp: 4 });
      }
      break;
    case "date":
      const s = ["Date night! \u{1F60A}", "Dinner and a movie date", "Romantic evening planned", "Going out with bae \u{1F495}", "Date night vibes"];
      n.description = s[Math.floor(Math.random() * s.length)], n.skillGain = { skill: "intimate", xp: 3 };
  }
  return n;
}
function ia() {
  const e = pe.getDay();
  5 !== e && 6 !== e || (gameState.employees.forEach((e2) => {
    if (e2.personalLife && e2.personalLife.upcomingPlans) {
      if (e2.personalLife.upcomingPlans = [], Math.random() < 0.8) {
        const t = sa(e2), n = oa(e2, t);
        e2.personalLife.upcomingPlans.push({ day: "Saturday", activity: t, details: n.description, time: Math.random() < 0.5 ? "morning" : "afternoon" });
      }
      if (Math.random() < 0.7) {
        const t = ["relaxing", "hobby", "cooking"], n = t[Math.floor(Math.random() * t.length)], a = oa(e2, n);
        e2.personalLife.upcomingPlans.push({ day: "Sunday", activity: n, details: a.description, time: "afternoon" });
      }
    }
  }), console.log("\u{1F4C5} Weekend plans generated for all employees"));
}
function sa(e) {
  const t = ["relaxing", "hobby", "socializing", "gym", "cooking"];
  return e && e.personalLife ? e.personalLife.activeHobbies && e.personalLife.activeHobbies.length > 0 && Math.random() < 0.4 ? "hobby" : e.personalLife.outsideContacts && e.personalLife.outsideContacts.inRelationship && Math.random() < 0.3 ? "date" : e.skills?.fitness?.level > 3 && Math.random() < 0.35 ? "gym" : e.skills?.cooking?.level > 3 && Math.random() < 0.3 ? "cooking" : t[Math.floor(Math.random() * t.length)] : t[Math.floor(Math.random() * t.length)];
}
const da = { sleeping: ["\u{1F319} Sleeping", "\u{1F319} Asleep", "\u{1F319} Dead to the World", "\u{1F319} Out Cold", "\u{1F319} Fast Asleep"], vampire_rest: ["\u26B0\uFE0F Resting", "\u26B0\uFE0F In Daytime Rest", "\u26B0\uFE0F Dormant"], elf_trance: ["\u{1F33F} In Trance", "\u{1F33F} Meditating", "\u{1F33F} In Deep Trance"], angel_meditation: ["\u2728 In Contemplation", "\u2728 Meditating", "\u2728 At Peace"], waking_up: ["\u2600\uFE0F Just Woke Up", "\u2600\uFE0F Waking Up", "\u{1F634} Barely Awake", "\u2600\uFE0F Morning Grogginess"], morning_routine: ["\u{1F6BF} Getting Ready", "\u2615 Morning Coffee", "\u{1F9D8} Morning Routine", "\u{1F6BF} Starting the Day"], commuting: ["\u{1F6B6} Commuting", "\u{1F68C} On the Bus", "\u{1F697} Driving", "\u{1F6B6} Heading In"], at_work: ["\u{1F4BC} At the Office", "\u{1F4BC} In the Building", "\u{1F3E2} Working", "\u{1F4BC} On the Clock"], in_meeting: ["\u{1F4CA} In a Meeting", "\u{1F5E3}\uFE0F In a Meeting", "\u{1F92B} In a Meeting", "\u{1F4CA} Busy"], lunch_break: ["\u{1F957} Lunch Break", "\u2615 Coffee Break", "\u{1F37D}\uFE0F Grabbing Lunch", "\u{1F957} On Lunch"], working_late: ["\u{1F319} Working Late", "\u{1F4BC} Burning Midnight Oil", "\u{1F319} Still at the Office"], work_from_home: ["\u{1F4BB} Working from Home", "\u{1F3E0} WFH Today", "\u{1F4BB} Remote Day"], night_shift: ["\u26A1 Night Shift", "\u{1F319} On the Clock (Night)", "\u26A1 Working Nights"], heading_home: ["\u{1F6B6} Heading Home", "\u{1F697} Driving Home", "\u{1F6B6} Done for the Day"], at_gym: ["\u{1F3CB}\uFE0F At the Gym", "\u{1F4AA} Working Out", "\u{1F3CB}\uFE0F Hitting the Gym", "\u{1F3C3} At the Gym"], yoga: ["\u{1F9D8} At Yoga", "\u{1F9D8} Yoga Class", "\u{1F9D8} Stretching"], walking_dog: ["\u{1F415} Walking the Dog", "\u{1F43E} Dog Walk", "\u{1F415} Out with the Dog"], cooking: ["\u{1F373} Cooking", "\u{1F468}\u200D\u{1F373} Making Dinner", "\u{1F373} In the Kitchen", "\u{1F35D} Cooking Dinner"], having_dinner: ["\u{1F37D}\uFE0F Having Dinner", "\u{1F958} Dinner Time", "\u{1F37D}\uFE0F Eating"], relaxing: ["\u{1F4FA} Relaxing", "\u{1F3E0} Chilling", "\u{1F6CB}\uFE0F Vegging Out", "\u{1F3E0} Unwinding", "\u{1F4FA} Taking It Easy"], reading: ["\u{1F4DA} Reading", "\u{1F4D6} Bookworm Mode", "\u{1F4DA} Lost in a Book"], gaming: ["\u{1F3AE} Gaming", "\u{1F579}\uFE0F Playing Games", "\u{1F3AE} Gaming Session"], hobbies: ["\u{1F3A8} Creative Time", "\u{1F3B5} Hobby Time", "\u{1F3A8} Doing Art", "\u{1F3AD} Working on a Project"], socializing: ["\u{1F389} Out with Friends", "\u{1F389} Socializing", "\u{1F38A} Out Tonight"], at_bar: ["\u{1F37B} At the Bar", "\u{1F942} Happy Hour", "\u{1F37B} Drinks with Friends"], on_date: ["\u{1F495} On a Date", "\u2764\uFE0F Date Night", "\u{1F339} On a Date", "\u{1F495} Out Tonight"], at_event: ["\u{1F3AD} At an Event", "\u{1F38A} At a Party", "\u{1F3AC} At a Show"], running_errands: ["\u{1F6D2} Running Errands", "\u{1F3EA} Out Shopping", "\u{1F6D2} Errands"], traveling: ["\u2708\uFE0F Traveling", "\u{1F9F3} On a Trip", "\u2708\uFE0F Away"], on_vacation: ["\u{1F3D6}\uFE0F On Vacation", "\u{1F334} Vacation Mode", "\u{1F3D6}\uFE0F Away on Vacation"], sick: ["\u{1F912} Feeling Sick", "\u{1F927} Under the Weather", "\u{1F912} Sick Day", "\u{1F637} Not Feeling Well"], vampire_hunt: ["\u{1F9DB} Out for the Night", "\u{1F319} Out Hunting", "\u{1F9DB} Active"], chatting_player: ["\u{1F4AC} Chatting with You", "\u{1F4AC} Here with You"], in_person_player: ["\u{1F525} With You Right Now", "\u{1F525} Here in Person"] }, pa = { vampire: { sleepStatus: "vampire_rest", sleepWindow: [6, 18], wakeHour: 18, canWorkDaytime: false, nightActivityBoost: { socializing: 0.3, at_bar: 0.3, vampire_hunt: 0.4 } }, angel: { sleepStatus: "angel_meditation", sleepWindow: [23, 5], responsivenessDuringRest: 40, noSleepThrough: true }, elf: { sleepStatus: "elf_trance", sleepWindow: [1, 5], wakeHour: 5, responsivenessDuringRest: 25, noSleepThrough: true }, demon: { sleepWindow: [4, 11], wakeHour: 11, nightActivityBoost: { socializing: 0.2, at_event: 0.2, at_bar: 0.2 } } };
function ma(e) {
  const t = da[e];
  return t && 0 !== t.length ? t[Math.floor(Math.random() * t.length)] : e;
}
function ga(e, t, n, a, o) {
  const i = e.personalLife?.eveningPreferences || {}, s = "dog" === e.personalLife?.livingSituation?.petType, r = e.personalLife?.outsideContacts?.inRelationship, l = e.personality?.outgoing ?? 50;
  if (n && t >= 6 && t < 10) return { current: "relaxing", label: "\u2615 Lazy Morning", responsiveness: 50 };
  if (n && t >= 10 && t < 14 && Math.random() < 0.35) return { current: "running_errands", label: ma("running_errands"), responsiveness: 50 };
  const c = [], d = (e2, t2) => {
    for (let n2 = 0; n2 < Math.round(t2); n2++) c.push(e2);
  };
  if (d("relaxing", 10 * (i.relaxing ?? 0.5)), d("hobbies", 10 * (i.hobbies ?? 0.3)), d("cooking", 10 * (i.cooking ?? 0.4)), d("having_dinner", 5 * (i.cooking ?? 0.4)), t >= 17 && t < 21 && (d("at_gym", 10 * (i.gym ?? 0.2)), s && d("walking_dog", 4), (e.hobbies || []).some((e2) => /yoga|pilates/i.test(e2)) && d("yoga", 3)), (l > 50 || n) && (d("socializing", 10 * (i.socializing ?? 0.3)), d("at_bar", 5 * (i.socializing ?? 0.2)), d("at_event", 3 * (i.socializing ?? 0.3))), r && Math.random() < 0.25 && d("on_date", 4), a?.nightActivityBoost && Object.entries(a.nightActivityBoost).forEach(([e2, t2]) => d(e2, 10 * t2)), t >= o - 2 && t < o && (d("reading", 3), d("gaming", 2)), 0 === c.length) return { current: "relaxing", label: ma("relaxing"), responsiveness: 80 };
  const p = c[Math.floor(Math.random() * c.length)];
  return { current: p, label: ma(p), responsiveness: { at_gym: 40, yoga: 50, walking_dog: 60, cooking: 65, having_dinner: 70, relaxing: 80, reading: 75, gaming: 60, hobbies: 65, socializing: 55, at_bar: 50, on_date: 30, at_event: 45, running_errands: 50, vampire_hunt: 70 }[p] ?? 60 };
}
function ha(e) {
  const t = pe.getHour(), n = pe.getDay(), a = 0 === n || 6 === n, o = (e.race || "human").toLowerCase(), i = e.personality?.outgoing ?? 50;
  if (gameState.activeChat?.id === e.id && e.chatSettings?.scenarioContext) return { current: "in_person_player", label: ma("in_person_player"), responsiveness: 100 };
  if (gameState.activeChat?.id === e.id) return { current: "chatting_player", label: ma("chatting_player"), responsiveness: 100 };
  const s = (gameState.npcScheduledEvents || []).find((t2) => t2.npcId === e.id && "triggered" === t2.status && ["meet", "date", "call"].includes(t2.type));
  if (s) {
    const e2 = "date" === s.type ? "on_date" : "in_meeting";
    return { current: e2, label: ma(e2), responsiveness: 30 };
  }
  if ((e.flags?.systemFlags || []).some((e2) => /sick|sickness/i.test(e2.type)) || (e.flags?.customFlags || []).some((e2) => /sick/i.test(e2.type))) return { current: "sick", label: ma("sick"), responsiveness: 20 };
  if (e.schedule?.isOnLeave) return { current: "on_vacation", label: ma("on_vacation"), responsiveness: 25 };
  const r = pa[o] || {};
  if (r.sleepWindow) {
    const [e2, n2] = r.sleepWindow;
    if (e2 < n2 ? t >= e2 && t < n2 : t >= e2 || t < n2) {
      const e3 = r.sleepStatus || "sleeping";
      return { current: e3, label: ma(e3), responsiveness: r.responsivenessDuringRest ?? 5 };
    }
  }
  const l = e.schedule?.shiftType || "day";
  if ("night" === l) {
    const n2 = e.schedule.workStartHour ?? 22, a2 = e.schedule.workEndHour ?? 6;
    if ((n2 > a2 ? t >= n2 || t < a2 : t >= n2 && t < a2) && e.schedule.isCurrentlyWorking) return { current: "night_shift", label: ma("night_shift"), responsiveness: 65 };
    if (t >= a2 && t < a2 + 8) return { current: "sleeping", label: ma("sleeping"), responsiveness: 5 };
  }
  let c = i > 65 ? 0 : i < 35 ? 22 : 23, d = i > 65 ? 8 : i < 35 ? 6 : 7;
  if (null != r.wakeHour && (d = r.wakeHour), r.sleepWindow && (c = r.sleepWindow[0]), !r.sleepWindow) {
    if (c < d ? t >= c && t < d : t >= c || t < d) return { current: "sleeping", label: ma("sleeping"), responsiveness: 5 };
    if (t === d) return { current: "waking_up", label: ma("waking_up"), responsiveness: 30 };
  }
  const p = e.schedule?.workStartHour ?? 9, m = e.schedule?.workEndHour ?? 17, u2 = (e.schedule?.workDays || [1, 2, 3, 4, 5]).includes(n);
  if ("remote" === l && u2 && t >= p && t < m) return { current: "work_from_home", label: ma("work_from_home"), responsiveness: 70 };
  if (u2 && "day" === l && t >= d + 1 && t < p) return t === p - 1 ? { current: "commuting", label: ma("commuting"), responsiveness: 40 } : { current: "morning_routine", label: ma("morning_routine"), responsiveness: 45 };
  if (u2 && "remote" !== l && t >= p && t < m) return t === Math.floor((p + m) / 2) ? { current: "lunch_break", label: ma("lunch_break"), responsiveness: 80 } : { current: "at_work", label: ma("at_work"), responsiveness: 75 };
  const g = e.career?.level || 1;
  return u2 && g >= 3 && t >= m && t < m + 2 && t < c && Math.random() < 0.15 * (g - 2) ? { current: "working_late", label: ma("working_late"), responsiveness: 55 } : u2 && t === m ? { current: "heading_home", label: ma("heading_home"), responsiveness: 55 } : ga(e, t, a, r, c);
}
function fa(e) {
  const t = gameState.chatHistory?.[e.id] || [], n = Date.now(), a = t.filter((e2) => e2.timestamp && n - e2.timestamp < 12e5);
  return Math.min(100, 8 * a.length + Math.floor(a.reduce((e2, t2) => e2 + (t2.content?.length || 0), 0) / 40));
}
function va(e, t) {
  if (!e || !e.npcStatus) return "";
  t = t || {};
  const { label: n, responsiveness: a } = e.npcStatus, o = a < 20 ? "var(--af)" : a < 50 ? "var(--aw)" : "var(--n)", u2 = a < 20 ? "var(--e)" : a < 50 ? "var(--a)" : "var(--g)";
  return "sm" === t.size ? `<span class="rost-status" style="color:${u2};">${n}</span>` : `<span style="display:inline-block; padding:2px 9px; border-radius:999px; font-size:0.78rem; background:${o}18; color:${o}; border:1px solid ${o}30;">${n}</span>`;
}
function ba() {
  const e = gameState.time?.currentTime || Date.now(), t = pe.getHour();
  (gameState.employees || []).forEach((n) => {
    if ("active" !== n.employmentStatus) return;
    n.npcStatus || initializeEmployeeSocialData(n);
    const a = n.personality?.outgoing ?? 50, o = (n.race || "human").toLowerCase(), i = pa[o] || {}, s = i.sleepWindow?.[0] ?? (a > 65 ? 0 : a < 35 ? 22 : 23), r = (e - (n.npcStatus.sleepThroughDecidedAt || 0)) / 36e5;
    t === s && r > 20 && (n.npcStatus.sleepThrough = !i.noSleepThrough && Math.random() < Math.max(0.05, 0.35 - 4e-3 * (a - 50)), n.npcStatus.sleepThroughDecidedAt = e);
    const l = fa(n), c = ha(n);
    if (l >= 25 && ["sleeping", "heading_home", "vampire_rest", "waking_up"].includes(c.current)) return void (gameState.activeChat?.id === n.id && (n.npcStatus.current = "chatting_player", n.npcStatus.label = ma("chatting_player"), n.npcStatus.responsiveness = 90));
    const d = n.npcStatus.current !== c.current;
    if (d && (n.npcStatus.richLabel = null, n.npcStatus.richLabelStatus = null), n.npcStatus.current = c.current, n.npcStatus.label = c.label, n.npcStatus.responsiveness = c.responsiveness, n.npcStatus.lastUpdated = e, d && gameState.activeChat?.id === n.id) {
      const e2 = document.getElementById("chatStatus");
      e2 && !n.chatSettings?.scenarioContext && (e2.innerHTML = va(n), e2.title = n.npcStatus.label);
    }
  });
}
function wa(e, t) {
  e?.npcStatus && (e.npcStatus.pendingWakeUpResponses || (e.npcStatus.pendingWakeUpResponses = []), e.npcStatus.pendingWakeUpResponses.push({ message: t, queuedAt: gameState.time?.currentTime || Date.now() }));
}
function xa() {
  (gameState.employees || []).forEach((e) => {
    if ("active" !== e.employmentStatus) return;
    const t = e.npcStatus?.pendingWakeUpResponses;
    if (!t || 0 === t.length) return;
    const n = t[t.length - 1];
    e.npcStatus.pendingWakeUpResponses = [];
    const a = `You were asleep when the player messaged you last night: "${n.message}". You just woke up and noticed it. Respond like someone groggy but warm, just saw their notifications.`;
    setTimeout(async () => {
      try {
        await mh(e, "morning_response", a);
      } catch (u2) {
      }
    }, 3e3 + 8e3 * Math.random());
  });
}
function ka(e) {
  if (!e?.npcStatus) return;
  if (e.npcStatus.richLabel && e.npcStatus.richLabelStatus === e.npcStatus.current) return;
  if (["chatting_player", "in_person_player", "at_work", "relaxing", "sleeping", "vampire_rest"].includes(e.npcStatus.current)) return;
  const t = e.npcStatus.label, n = e.npcStatus.current, a = `You are ${e.name}. Your current status is "${t}". In 6-10 words describe what you're specifically doing right now in a casual personal way. No quotes no emojis just the description. Example: leg day completely dying right now`;
  generateText(a, { maxTokens: 30 }).then((a2) => {
    if (a2 && e.npcStatus?.current === n) {
      const o = t.match(/^[\u{1F000}-\u{1FFFF}☀️🌙💼📚🎮🍳🍽️🚶🐕🧘🏋️💪🛒✈️🏖️🤒😷🧛⚰️🌿✨😴☕🚿🚌🚗💻⚡💕❤️🌹🎉🎊🎭🎬🍻🥂📊🗣️🥗☕🌙]+/u), i = o ? o[0].trim() : "", s = a2.trim().replace(/^["']|["']$/g, "");
      if (e.npcStatus.richLabel = i ? `${i} ${s}` : s, e.npcStatus.richLabelStatus = n, gameState.activeChat?.id === e.id) {
        const t2 = document.getElementById("chatStatus");
        t2 && !e.chatSettings?.scenarioContext && (t2.innerHTML = va(e), t2.title = e.npcStatus.richLabel);
      }
    }
  }).catch(() => {
  });
}
function Sa() {
  const e = pe.getHour(), t = pe.isWeekend();
  gameState.employees.forEach((n) => {
    if (n.personalLife) {
      if (!t && e >= 17 && e < 23 && (!n.personalLife.currentActivity || n.personalLife.activityStartTime < Date.now() - 36e5)) {
        const t2 = ta(n);
        t2 && (n.personalLife.currentActivity ? (n.personalLife.previousActivity = { ...n.personalLife.currentActivity }, n.personalLife.transitionStartTime = gameState.time?.currentTime || Date.now()) : 17 === e && (n.personalLife.previousActivity = { type: "work", description: "Working at the office" }, n.personalLife.transitionStartTime = gameState.time?.currentTime || Date.now()), n.personalLife.currentActivity = t2, n.personalLife.activityStartTime = gameState.time.currentTime, t2.skillGain && gainSkillXP(n, t2.skillGain.skill, t2.skillGain.xp, "evening activity"));
      }
      if (t && e >= 10 && e < 20) {
        const e2 = 0 === pe.getDay() ? "Sunday" : "Saturday", t2 = (n.personalLife.upcomingPlans || []).find((t3) => t3.day === e2);
        if (t2 && !n.personalLife.currentActivity && (n.personalLife.currentActivity && (n.personalLife.previousActivity = { ...n.personalLife.currentActivity }, n.personalLife.transitionStartTime = gameState.time?.currentTime || Date.now()), n.personalLife.currentActivity = { type: t2.activity, description: t2.details, skillGain: oa(n, t2.activity).skillGain }, n.personalLife.activityStartTime = gameState.time.currentTime, n.personalLife.currentActivity.skillGain)) {
          const e3 = n.personalLife.currentActivity.skillGain;
          gainSkillXP(n, e3.skill, e3.xp, "weekend activity");
        }
      }
      (e >= 23 || e < 6) && (n.personalLife.currentActivity = null);
    }
  });
}
function createActivityPost(e, t) {
  createSocialPost({ authorId: e.id, authorName: e.name, type: "life_update", content: t.description, timestamp: gameState.time.currentTime, likes: [], comments: [], mentions: [] });
}
function Ta(e, t) {
  if (!e || !t || e.id === t.id) return "";
  let n = "\n=== WHAT YOU KNOW ABOUT " + t.name.toUpperCase() + " ===\n";
  const a = e.relationships?.[t.id];
  if (a && (n += `Your relationship: ${a.type || "coworker"} (strength: ${a.strength || 0})
`), a && a.strength > 40 && t.personalLife?.currentActivity && (n += `Current activity: ${t.personalLife.currentActivity.description}
`), a && a.strength > 60 && t.personalLife?.upcomingPlans) {
    const e2 = t.personalLife.upcomingPlans;
    e2.length > 0 && (n += `Weekend plans: ${e2.map((e3) => `${e3.day} - ${e3.details}`).join(", ")}
`);
  }
  if (void 0 !== t.schedule?.isCurrentlyWorking && (n += `Work status: ${t.schedule.isCurrentlyWorking ? "Currently working" : "Off duty"}
`), a && a.strength > 50 && t.skills) {
    const e2 = Object.entries(t.skills).filter(([e3, t2]) => t2.level >= 5).sort((e3, t2) => t2[1].level - e3[1].level).slice(0, 2);
    e2.length > 0 && (n += `Known skills: ${e2.map(([e3, t2]) => `${e3} (Lv ${t2.level})`).join(", ")}
`);
  }
  if (a && a.strength > 70 && t.flags) {
    const e2 = t.flags.systemFlags.filter((e3) => "high" === e3.priority || "public" === e3.category).slice(0, 2);
    e2.length > 0 && (n += `You know: ${e2.map((e3) => e3.playerDescription || e3.key).join(", ")}
`);
  }
  const o = gameState.gossip?.filter((e2) => e2.involvedEmployees?.includes(t.id) && Date.now() - e2.timestamp < 6048e5).slice(0, 2) || [];
  o.length > 0 && (n += `Recent gossip: ${o.map((e2) => e2.description).join("; ")}
`);
  const i = ["socializing", "at_bar", "at_event", "on_date"], s = e.npcStatus?.current, r = t.npcStatus?.current;
  return i.includes(s) && i.includes(r) && a && a.strength > 60 && Math.random() < 0.25 && (n += `You are both currently out at the same time (you: ${e.npcStatus.label}, them: ${t.npcStatus.label}). You might reference running into them or being at the same place.
`), n;
}
function $a(e, t = 5) {
  if (!gameState.socialFeed || 0 === gameState.socialFeed.length) return "";
  let n = "\n=== RECENT OFFICE SOCIAL POSTS ===\n";
  const a = gameState.socialFeed.filter((e2) => gameState.time.currentTime - e2.timestamp < 864e5).slice(0, t);
  return 0 === a.length ? "" : (a.forEach((e2) => {
    const t2 = gameState.employees.find((t3) => t3.id === e2.authorId), a2 = t2?.name || e2.authorName || "Unknown";
    n += `${a2}: "${e2.content.substring(0, 100)}${e2.content.length > 100 ? "..." : ""}"
`, e2.likes?.length > 0 && (n += `  (${e2.likes.length} likes`, e2.comments?.length > 0 && (n += `, ${e2.comments.length} comments`), n += ")\n");
  }), n);
}
function Ca(e, t, n) {
  if (!e || !t || !n) return false;
  if (e.id === n.id || t.id === n.id) return false;
  const a = e.relationships?.[n.id];
  return !(!a || a.strength < 40) && (!!n.personalLife?.currentActivity && (0 !== (gameState.socialFeed?.filter((e2) => e2.authorId === n.id && gameState.time.currentTime - e2.timestamp < 36e5) || []).length && Math.random() < 0.1));
}
function Ea() {
  const e = gameState.employees.filter((e2) => e2.schedule?.isCurrentlyWorking);
  if (0 === e.length) return "\n=== OFFICE DYNAMICS ===\nNobody else is in the office right now.\n";
  let t = "\n=== OFFICE DYNAMICS ===\n";
  t += `${e.length} people currently working in the office.
`;
  const n = e.filter((e2) => e2.personalLife?.currentActivity).map((e2) => ({ name: e2.name, activity: e2.personalLife.currentActivity.type }));
  if (n.length > 2) {
    const e2 = {};
    n.forEach((t2) => {
      e2[t2.activity] = (e2[t2.activity] || 0) + 1;
    });
    const a2 = Object.entries(e2).filter(([e3, t2]) => t2 >= 2).map(([e3]) => e3);
    a2.length > 0 && (t += `Common theme: Several people are doing ${a2[0]} activities.
`);
  }
  const a = gameState.socialFeed?.slice(0, 10) || [], o = a.filter((e2) => "achievement" === e2.type || "celebration" === e2.type || e2.content.includes("\u{1F60A}") || e2.content.includes("\u{1F389}")).length, i = a.filter((e2) => "complaint" === e2.type || "tea_spilling" === e2.type || e2.content.includes("\u{1F624}") || e2.content.includes("\u{1F622}")).length;
  return o > 2 * i ? t += "Office mood: Generally positive and upbeat.\n" : i > 2 * o && (t += "Office mood: Some tension or complaints recently.\n"), t;
}
