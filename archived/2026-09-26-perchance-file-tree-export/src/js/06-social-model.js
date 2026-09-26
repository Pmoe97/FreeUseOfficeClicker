// ============================================================================
// 06-social-model — Social data model: createPost/createComment/createRelationship/createEvent, user ids, social data init + flag utilities (addFlag/removeFlag/updateFlag/getFlags, context builders).
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function createPost({ authorId: e, authorName: t, authorImage: n = null, type: a = "text", content: o = "", imageUrl: i = null, imagePrompt: s = null, altText: r = null, mood: l = "neutral", tags: c = [], referencedEmployees: d = [], referencedEvent: p = null, referencedChat: m = null, explicitLevel: u2 = 0, isPlayerPost: g = false, poll: h = null } = {}) {
  let y = Date.now();
  if (!g && e && o && "system" !== e && ["life_update", "achievement", "tea_spilling", "complaint", "rant", "gossip"].includes(a)) {
    const t2 = gameState.employees.find((t3) => t3.id === e);
    t2 && "function" == typeof Hr && Hr(t2, `you posted (${a}): "${o.substring(0, 80)}"`, a);
  }
  return y && !isNaN(y) || (console.error("[PostId] Invalid timestamp detected, using fallback"), y = gameState.time?.currentTime || (/* @__PURE__ */ new Date()).getTime() || 17298e8), { id: `post_${++gameState.socialNetwork.postIdCounter}_${y}`, authorId: e, authorName: t, authorImage: n, type: a, content: o || "", imageUrl: i, imagePrompt: s, altText: r, mood: l, tags: c, referencedEmployees: d, referencedEvent: p, referencedChat: m, explicitLevel: u2, isPlayerPost: g, poll: h, timestamp: y, likes: [], dislikes: [], comments: [], views: 0, shareCount: 0 };
}
function createComment({ postId: e, authorId: t, authorName: n, authorImage: a = null, content: o = "", replyToCommentId: i = null, mentionedEmployees: s = [], imageUrl: r = null, imageAlt: l = null, imagePrompt: c = null } = {}) {
  return { id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, postId: e, authorId: t, authorName: n, authorImage: a, content: o, replyToCommentId: i, mentionedEmployees: s, timestamp: gameState.time?.currentTime || Date.now(), likes: [], imageUrl: r, imageAlt: l, imagePrompt: c };
}
function createRelationship({ targetId: e, type: t = "neutral", strength: n = 50, history: a = [] } = {}) {
  return { targetId: e, type: t, strength: n, lastInteraction: Date.now(), history: a, sharedInterests: [], sharedLocation: false, conflicts: 0, positiveInteractions: 0 };
}
function createEvent({ type: e = "general", involvedEmployees: t = [], location: n = null, description: a = "", sentiment: o = "neutral", importance: i = 5 } = {}) {
  return { id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, type: e, involvedEmployees: t, location: n, description: a, sentiment: o, importance: i, timestamp: gameState.time?.currentTime || Date.now(), relatedPosts: [], hasBeenPostedAbout: false };
}
function Je(e) {
  if (!e?.name) return `user_${Math.floor(1e4 * Math.random())}`;
  const t = (e.name.split(" ")[0] || "user").toLowerCase(), n = (e.name.split(" ")[1] || "x").toLowerCase(), a = [`${t}_${n}`, `${t}.${n}`, `${t}${n}`, `${t}_${n.charAt(0)}`, `${t.charAt(0)}_${n}`, `${n}_${t}`, `the_${t}`, `real_${t}`, `${t}_official`, `${t}_${Math.floor(100 * Math.random())}`, `${n}_${Math.floor(100 * Math.random())}`, `${t}_${n}_${Math.floor(10 * Math.random())}`];
  let o = a[Math.floor(Math.random() * a.length)];
  const i = gameState.employees.filter((t2) => t2.social?.username && t2.id !== e.id).map((e2) => e2.social.username);
  let s = 0;
  for (; i.includes(o) && s < 10; ) o = `${t}_${Math.floor(1e3 * Math.random())}`, s++;
  return o;
}
function initializeEmployeeSocialData(e) {
  if (e) {
    if (e.flags || (e.flags = { systemFlags: [], customFlags: [] }), e.schedule || (e.schedule = { workDays: [1, 2, 3, 4, 5], workStartHour: 9, workEndHour: 17, isCurrentlyWorking: false, lastClockIn: null, lastClockOut: null, hoursWorkedToday: 0, daysWorked: 0, lateDays: 0, ptoBalance: 10, sickDays: 5, isOnLeave: false, leaveType: null, leaveEndDate: null, shiftType: null }), !e.schedule.shiftType) {
      const t = (e.role || e.position || e.career?.title || "").toLowerCase();
      if (/security|guard|night/.test(t)) e.schedule.shiftType = Math.random() < 0.6 ? "night" : "evening", "night" === e.schedule.shiftType ? (e.schedule.workStartHour = 22, e.schedule.workEndHour = 6, e.schedule.workDays = [0, 1, 2, 3, 4, 5, 6]) : (e.schedule.workStartHour = 14, e.schedule.workEndHour = 22);
      else if (/remote|freelance|contractor/.test(t)) e.schedule.shiftType = "remote";
      else if (/analyst|researcher|creative|designer/.test(t) && Math.random() < 0.2) e.schedule.shiftType = "evening", e.schedule.workStartHour = 12, e.schedule.workEndHour = 20;
      else {
        e.schedule.shiftType = "day";
        const t2 = e.career?.level || 1, n = { 1: { s: 9, e: 17 }, 2: { s: 9, e: 17 }, 3: { s: 8, e: 18 }, 4: { s: 8, e: 18 }, 5: { s: 7, e: 19 }, 6: { s: 7, e: 20 }, 7: { s: 6, e: 21 } }, a = n[Math.min(t2, 7)] || n[1];
        e.schedule.workStartHour = a.s, e.schedule.workEndHour = a.e;
      }
    }
    if (!e.personalLife) {
      e.personalLife = { currentActivity: null, activityStartTime: null, lastActivityUpdate: Date.now(), activeHobbies: [], upcomingPlans: [], lastWeekendActivity: null, eveningPreferences: { gym: 0.4 * Math.random(), cooking: 0.6 * Math.random(), socializing: 0.5 * Math.random(), relaxing: 0.3 + 0.4 * Math.random(), hobbies: 0.6 * Math.random(), dating: 0.3 * Math.random() }, livingSituation: { type: Math.random() < 0.3 ? "apartment" : Math.random() < 0.7 ? "house" : "condo", hasRoommate: Math.random() < 0.25, hasPet: Math.random() < 0.35, petType: null, petName: null, pets: [] }, outsideContacts: { hasBestFriend: Math.random() < 0.7, hasFamily: Math.random() < 0.8, inRelationship: Math.random() < 0.3, relationshipStatus: "single", infidelityTendency: Math.random() < 0.15 ? 0.5 + 0.5 * Math.random() : Math.random() < 0.35 ? 0.1 + 0.2 * Math.random() : 0.2 + 0.3 * Math.random(), polyamorous: Math.random() < 0.07, lastRelationshipCheck: null, relationshipHistory: [] }, sexualOrientation: null, significantOther: null };
      const t = "female" === e.gender?.toLowerCase(), n = Math.random();
      if (e.personalLife.sexualOrientation = n < 0.75 ? "straight" : n < 0.85 ? "bisexual" : n < 0.92 ? t ? "lesbian" : "gay" : n < 0.99 ? "pansexual" : "asexual", e.personalLife.outsideContacts.inRelationship) {
        const t2 = ["dating", "dating", "dating", "serious", "serious", "engaged", "married", "married"], n2 = t2[Math.floor(Math.random() * t2.length)];
        e.personalLife.outsideContacts.relationshipStatus = n2;
        const a2 = ja(e);
        a2.relationshipType = n2, a2.yearsTogther = "married" === n2 ? 1 + Math.floor(10 * Math.random()) : "engaged" === n2 ? 1 + Math.floor(3 * Math.random()) : parseFloat((2 * Math.random()).toFixed(1)), a2.hasKids = "married" === n2 && Math.random() < 0.4, e.personalLife.significantOther = a2;
      }
      const a = Math.random();
      if (a < 0.05) {
        const t2 = e.personalLife.significantOther?.name || null;
        e.personalLife.outsideContacts.relationshipStatus = "divorced", e.personalLife.outsideContacts.inRelationship = false, t2 && e.personalLife.outsideContacts.relationshipHistory.push({ status: "married", partnerName: t2, endedAt: null, endReason: "divorce" }), e.personalLife.significantOther = null;
      } else a < 0.08 && (e.personalLife.outsideContacts.relationshipStatus = "separated");
      if (e.personalLife.livingSituation.hasPet) {
        const t2 = ["dog", "cat", "bird", "fish"];
        e.personalLife.livingSituation.petType = t2[Math.floor(Math.random() * t2.length)];
        const n2 = ["Max", "Luna", "Charlie", "Bella", "Cooper", "Daisy", "Milo", "Sadie", "Buddy", "Chloe"];
        e.personalLife.livingSituation.petName = n2[Math.floor(Math.random() * n2.length)];
      }
      e.hobbies && e.hobbies.length > 0 && (e.personalLife.activeHobbies = e.hobbies.map((e2) => ({ name: e2, frequency: 0.7 * Math.random() + 0.3, skillLevel: Math.floor(5 * Math.random()) + 1, lastDone: Date.now() - Math.floor(6048e5 * Math.random()) })));
    }
    if (!e.skills && (e.skills = { technical: { level: 1, xp: 0, maxXp: 500 }, creative: { level: 1, xp: 0, maxXp: 500 }, social: { level: 1, xp: 0, maxXp: 500 }, management: { level: 1, xp: 0, maxXp: 500 }, intimate: { level: 0, xp: 0, maxXp: 500 }, cooking: { level: 0, xp: 0, maxXp: 500 }, fitness: { level: 0, xp: 0, maxXp: 500 } }, e.position)) {
      const t = e.position.toLowerCase();
      (t.includes("engineer") || t.includes("developer")) && (e.skills.technical.level = 2 + Math.floor(3 * Math.random()), e.skills.technical.xp = Math.floor(Math.random() * e.skills.technical.maxXp)), (t.includes("designer") || t.includes("creative")) && (e.skills.creative.level = 2 + Math.floor(3 * Math.random()), e.skills.creative.xp = Math.floor(Math.random() * e.skills.creative.maxXp)), (t.includes("manager") || t.includes("director")) && (e.skills.management.level = 3 + Math.floor(2 * Math.random()), e.skills.management.xp = Math.floor(Math.random() * e.skills.management.maxXp), e.skills.social.level = 2 + Math.floor(2 * Math.random())), (t.includes("sales") || t.includes("marketing")) && (e.skills.social.level = 2 + Math.floor(3 * Math.random()), e.skills.social.xp = Math.floor(Math.random() * e.skills.social.maxXp));
    }
    if (e.specializations || (e.specializations = []), e.social || (e.social = { username: Je(e), bio: "", joinDate: Date.now(), postFrequency: 0.3 + 0.7 * Math.random(), lastPostTime: 0, postCount: 0, likeCount: 0, commentCount: 0, totalLikesReceived: 0, totalCommentsReceived: 0, totalMentions: 0, contentPreferences: { selfies: 0.2 + 0.5 * Math.random(), workPosts: 0.1 + 0.4 * Math.random(), memes: 0.6 * Math.random(), lifeUpdates: 0.2 + 0.5 * Math.random(), thirstTraps: 0.4 * Math.random(), explicitContent: 0.3 * Math.random(), travelPosts: 0.4 * Math.random() }, likesProbability: 0.3 + 0.6 * Math.random(), commentsProbability: 0.1 + 0.4 * Math.random(), willingnessToPostExplicit: Math.random(), recentPostTypes: [], postsAboutBoss: 0, mentionHistory: [] }), e.giftedPossessions || (e.giftedPossessions = { wardrobe: [], jewelry: [], vehicles: [], homeUpgrades: [], experiences: [], tech: [], other: [] }), gameState.playerMentionStats || (gameState.playerMentionStats = { mentionHistory: [], mentionCounts: {} }), e.relationships || (e.relationships = {}), !e.locationId && e.productManaged) {
      const t = gameState.products.find((t2) => t2.name === e.productManaged);
      t && (e.locationId = t.locationId);
    }
    return e.locationId || (e.locationId = "garage"), e.awareness || (e.awareness = { knowsCoworkers: [], knowsLocations: [], companyKnowledge: { totalEmployees: 0, lastUpdated: 0 } }), e.npcStatus || (e.npcStatus = { current: "relaxing", label: "\u{1F3E0} Relaxing", richLabel: null, richLabelStatus: null, responsiveness: 60, sleepThrough: false, sleepThroughDecidedAt: 0, lastUpdated: 0, pendingWakeUpResponses: [] }), e.employmentStatus || (e.employmentStatus = e.hired ? "active" : "alumni"), e;
  }
}
function Qe() {
  return "flag_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}
function addFlag(e, t) {
  if (!e || !t) return null;
  e.flags || (e.flags = { systemFlags: [], customFlags: [] });
  const n = { id: Qe(), key: t.key, value: t.value, category: t.category || "custom", setBy: t.setBy || "player", source: t.source || t.setBy || "player", setDate: t.setDate || t.startDate || gameState.time?.currentTime || Date.now(), timestamp: t.timestamp || t.startDate || gameState.time?.currentTime || Date.now(), autoRemove: t.autoRemove || null, duration: t.duration || null, expirationDate: t.expirationDate || null, affectsContext: false !== t.affectsContext, priority: t.priority || "medium", playerDescription: t.playerDescription || "", aiGuidance: t.aiGuidance || "", emoji: t.emoji || null, metadata: t.metadata || {} };
  return "pregnant" !== t.key || n.metadata.father || (n.metadata.father = t.father || "unknown"), "in_relationship" !== t.key || n.metadata.partner || (n.metadata.partner = t.partner || "unknown"), "engaged" !== t.key || n.metadata.fiance || (n.metadata.fiance = t.fiance || "unknown"), "married" !== t.key || n.metadata.spouse || (n.metadata.spouse = t.spouse || "unknown", n.metadata.marriageDate = t.marriageDate || n.setDate), "system" === n.setBy ? e.flags.systemFlags.push(n) : e.flags.customFlags.push(n), console.log(`[Flags] Added "${n.key}" to ${e.name}`), "pregnant" !== n.key || n.metadata.dueDate || initializePregnancy(e, n), saveGame(), n;
}
function removeFlag(e, t) {
  e && e.flags && (e.flags.systemFlags = e.flags.systemFlags.filter((e2) => e2.id !== t && e2.key !== t), e.flags.customFlags = e.flags.customFlags.filter((e2) => e2.id !== t && e2.key !== t), console.log(`[Flags] Removed flag ${t} from ${e.name}`), saveGame());
}
function updateFlag(e, t, n) {
  if (!(e && e.flags && t && n)) return null;
  const a = [...e.flags.systemFlags || [], ...e.flags.customFlags || []], o = a.find((e2) => e2.id === t || e2.key === t);
  if (!o) return console.warn(`[Flags] updateFlag: no flag matching "${t}" on ${e.name}`), null;
  if (n.key && n.key !== o.key && a.find((e2) => e2 !== o && e2.key === n.key)) return console.warn(`[Flags] updateFlag: key "${n.key}" already used by another flag on ${e.name}`), null;
  const { id: i, ...s } = n;
  return Object.assign(o, s), null != s.setDate && (o.timestamp = s.setDate), console.log(`[Flags] Updated "${o.key}" on ${e.name}`), saveGame(), o;
}
function Xe(e) {
  if (!e || !e.flags) return [];
  const t = gameState.time?.currentTime ?? Date.now(), n = (e2) => {
    const n2 = e2.expirationDate || e2.autoRemove;
    return !n2 || n2 > t;
  };
  return [...(e.flags.systemFlags || []).filter(n), ...(e.flags.customFlags || []).filter(n)];
}
function Ze(e) {
  if (!e || !e.flags) return;
  const t = gameState.time?.currentTime ?? Date.now(), n = (e2) => {
    const n2 = e2.expirationDate || e2.autoRemove;
    return !n2 || n2 > t;
  };
  e.flags.systemFlags = (e.flags.systemFlags || []).filter(n), e.flags.customFlags = (e.flags.customFlags || []).filter(n);
}
function et(e, t) {
  return e && e.flags && [...e.flags.systemFlags, ...e.flags.customFlags].find((e2) => e2.key === t) || null;
}
function tt(e, t) {
  return !!et(e, t);
}
function nt(e, t) {
  const n = et(e, t);
  return n ? n.value : null;
}
function ot(e, t = {}) {
  const n = Xe(e);
  if (0 === n.length) return "";
  const a = { critical: 0, high: 1, medium: 2, low: 3 }, o = [...n].sort((e2, t2) => (a[e2.priority] ?? 2) - (a[t2.priority] ?? 2)), i = (e2) => e2.playerDescription || e2.description || (e2.key ? e2.key.replace(/_/g, " ") : "flag"), s = (e2) => e2.emoji || "\u{1F3F7}\uFE0F", r = o.map((e2) => `${s(e2)} ${i(e2)}`).join(" \xB7 "), l = [t.lastMessage || "", ...Array.isArray(t.recentMessages) ? t.recentMessages : []].join(" ").toLowerCase(), c = (e2) => "critical" === e2.priority || "high" === e2.priority || !!l && `${i(e2)} ${e2.key || ""}`.toLowerCase().split(/[^a-z0-9]+/).filter((e3) => e3.length >= 4).some((e3) => new RegExp(`\\b${e3}\\b`).test(l)), d = [];
  let p = 0;
  for (const e2 of o) {
    if (!e2.aiGuidance || !c(e2)) continue;
    const t2 = `${s(e2)} ${i(e2)}: ${e2.aiGuidance}`;
    if (p + t2.length > 1200 && d.length > 0) break;
    d.push(t2), p += t2.length;
  }
  let m = "\n\n=== ACTIVE STATUS (these are always true \u2014 honor them) ===\n" + r + "\n";
  return d.length > 0 && (m += "\n=== GUIDANCE RELEVANT RIGHT NOW ===\n" + d.join("\n") + "\n"), m;
}
function rt(e) {
  if (!e.skills) return "";
  let t = "\n=== YOUR SKILLS & ABILITIES ===\n";
  const n = Object.entries(e.skills).filter(([e2, t2]) => t2.level > 0).sort((e2, t2) => t2[1].level - e2[1].level);
  if (0 === n.length) return "";
  const a = { technical: { 1: "You have basic technical knowledge.", 3: "You're technically skilled and confident with technology.", 5: "You're a technical expert. You speak about tech topics naturally and intelligently.", 7: "You're a technical master. Your expertise is well-known and you mentor others.", 10: "You're a legendary technical genius. Technology is second nature to you." }, creative: { 1: "You have some creative ideas.", 3: "You're quite creative and artistic in your thinking.", 5: "You're highly creative. You see the world through an artistic lens.", 7: "You're a creative visionary. Your ideas are innovative and inspiring.", 10: "You're a creative genius. Your imagination knows no bounds." }, social: { 1: "You can hold a basic conversation.", 3: "You're naturally charming and good with people.", 5: "You're highly charismatic. People are drawn to you.", 7: "You're a master communicator. You read people effortlessly.", 10: "You have legendary charisma. You can convince anyone of anything." }, management: { 1: "You can delegate simple tasks.", 3: "You're a capable leader and organizer.", 5: "You're an excellent manager. People trust your leadership.", 7: "You're a strategic mastermind. Your leadership is inspiring.", 10: "You're a legendary leader. Your management skills are unmatched." }, intimate: { 1: "You're somewhat inexperienced in intimate situations.", 3: "You're moderately experienced and confident in romantic contexts.", 5: "You're very experienced and skilled in intimate situations.", 7: "You're an expert lover. You know exactly what you're doing.", 10: "You're a master of seduction and intimacy. You're irresistible." }, cooking: { 1: "You can make basic meals (usually just ordering takeout).", 3: "You're a decent cook. You enjoy making homemade meals.", 5: "You're an excellent cook. Food is one of your passions.", 7: "You're a culinary expert. You could work in a restaurant.", 10: "You're a master chef. Your cooking is legendary." }, fitness: { 1: "You're not very athletic.", 3: "You're in good shape and work out regularly.", 5: "You're very fit and athletic. Fitness is part of your lifestyle.", 7: "You're in exceptional shape. You could compete professionally.", 10: "You're a peak human specimen. Your fitness is legendary." } };
  return n.slice(0, 3).forEach(([e2, n2]) => {
    const o = n2.level, i = a[e2];
    if (i) {
      let n3;
      n3 = o >= 10 ? i[10] : o >= 7 ? i[7] : o >= 5 ? i[5] : o >= 3 ? i[3] : i[1], t += `\u2022 ${e2.toUpperCase()} (Lv ${o}): ${n3}
`;
    }
  }), e.specializations && e.specializations.length > 0 && (t += `
Your titles: ${e.specializations.join(", ")}
`, t += "Mention these accomplishments naturally if relevant.\n"), t;
}
