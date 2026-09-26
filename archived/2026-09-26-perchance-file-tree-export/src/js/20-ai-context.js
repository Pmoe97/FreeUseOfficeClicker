// ============================================================================
// 20-ai-context — AI context: player profile/company helpers, context-usage tracking, NuclearEmbeddingService, token estimation, Tr context builder.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function gr() {
  const e = gameState.playerProfile;
  if (!e) return "";
  const t = [];
  return e.age && t.push(`${e.age}-year-old`), e.gender && t.push(e.gender), e.ethnicity && t.push(e.ethnicity), e.skinTone && t.push(`${e.skinTone} skin`), e.height && t.push(e.height), e.bodyType && t.push(e.bodyType), e.hairColor && e.hairStyle ? t.push(`${e.hairStyle} ${e.hairColor} hair`) : e.hairColor ? t.push(`${e.hairColor} hair`) : e.hairStyle && t.push(`${e.hairStyle} hair`), e.eyeColor && t.push(`${e.eyeColor} eyes`), e.facialHair && "none" !== e.facialHair.toLowerCase() && "clean shaven" !== e.facialHair.toLowerCase() && t.push(e.facialHair), e.buildDetails && t.push(e.buildDetails), e.chestSize && t.push(e.chestSize), e.genitalType && e.genitalDetails ? t.push(`${e.genitalDetails} ${e.genitalType}`) : e.genitalType && t.push(e.genitalType), e.additionalDetails && t.push(e.additionalDetails), t.join(", ");
}
function vr() {
  return gameState.playerProfile?.companyName || "the company";
}
function wr(e) {
  if (!e) return "";
  if ("string" == typeof e) return e;
  if ("object" == typeof e) {
    const t = [];
    return e.confidence > 60 && t.push("confident"), e.outgoing > 60 && t.push("outgoing"), e.flirty > 40 && t.push("flirty"), e.professional > 60 && t.push("professional"), e.humor > 60 && t.push("humorous"), t.length > 0 ? t.join(", ") : Object.entries(e).map(([e2, t2]) => `${e2}: ${t2}`).join(", ");
  }
  return String(e);
}
function xr(e) {
  if (!e) return [];
  const t = [], n = Date.now();
  if (e.name && t.push({ id: "core.name", category: "core_identity", text: `Name: ${e.name}`, priority: 1, alwaysInclude: true }), e.career?.title && t.push({ id: "core.role", category: "core_identity", text: `Role: ${e.career.title} (Level ${e.career.level || 1})`, priority: 1, alwaysInclude: true }), e.employmentStatus && "active" !== e.employmentStatus) {
    const n2 = { prestige_reset: "I no longer work at this company - I was let go when the company restructured (prestige reset). I remember my time there and my relationship with my former boss. I am currently unemployed/between jobs unless rehired.", alumni: "I no longer work at this company - I was fired/let go. I remember my time there. I am currently unemployed unless rehired.", terminated: "I was terminated from this company. I remember my time there and how it ended.", resigned: "I resigned from this company on my own terms. I remember my time there." };
    t.push({ id: "core.employmentStatus", category: "core_identity", text: n2[e.employmentStatus] || `Employment status: ${e.employmentStatus} - I no longer work at this company.`, priority: 1, alwaysInclude: true });
  }
  e.gender && t.push({ id: "core.gender", category: "core_identity", text: `Gender: ${e.gender}`, priority: 0.9, alwaysInclude: true }), e.nicknameForPlayer && t.push({ id: "core.bossNickname", category: "core_identity", text: `I call my boss "${e.nicknameForPlayer}" instead of "Boss" - this is my special name for them. Use it OCCASIONALLY (1 in 4-5 times) to be natural and affectionate.`, priority: 0.95, alwaysInclude: true, keywords: ["boss", "player", "nickname", e.nicknameForPlayer.toLowerCase()] }), e.personality?.traits && e.personality.traits.forEach((e2, n2) => {
    t.push({ id: `personality.trait.${n2}`, category: "personality", text: `Personality: ${e2}`, priority: 0.8 - 0.05 * n2, keywords: e2.toLowerCase().split(/\s+/) });
  }), e.stats?.mood && t.push({ id: "state.mood", category: "current_state", text: `Current mood: ${e.stats.mood}`, priority: 0.85, freshness: true, lastUpdated: n }), e.personalLife?.currentActivity?.description && t.push({ id: "state.activity", category: "current_state", text: `Currently: ${e.personalLife.currentActivity.description}`, priority: 0.9, freshness: true, lastUpdated: e.personalLife.currentActivity.startTime || n }), void 0 !== e.schedule?.isCurrentlyWorking && t.push({ id: "state.working", category: "current_state", text: "Work status: " + (e.schedule.isCurrentlyWorking ? "Currently working" : "Off duty"), priority: 0.7, freshness: true }), e.physical && (e.physical.shortDescription && t.push({ id: "physical.short", category: "appearance", text: `Appearance: ${e.physical.shortDescription}`, priority: 0.05, avoidRepetition: true }), e.physical.fashion && t.push({ id: "physical.fashion", category: "appearance", text: `Style: ${e.physical.fashion}`, priority: 0.02, avoidRepetition: true })), e.relationships && Object.entries(e.relationships).filter(([e2, t2]) => t2.type && t2.strength > 30).sort(([e2, t2], [n2, a2]) => (a2.strength || 0) - (t2.strength || 0)).slice(0, 4).forEach(([e2, n2]) => {
    const a2 = gameState.employees.find((t2) => t2.id === e2);
    if (a2) {
      const o2 = n2.strength || 0;
      t.push({ id: `relationship.${e2}`, category: "relationships", text: `Relationship with ${a2.name}: ${n2.type} (${o2}/100)`, relatedTo: e2, priority: 0.05 + o2 / 500, keywords: [a2.name.toLowerCase(), n2.type], avoidRepetition: true });
    }
  }), e.skills && "object" == typeof e.skills && Object.entries(e.skills).forEach(([e2, n2]) => {
    n2 && n2.level && t.push({ id: `skill.${e2}`, category: "skills", text: `Skill: ${e2} (Level ${n2.level})`, priority: 0.4, keywords: [e2.toLowerCase()] });
  });
  const a = Xe(e);
  a && a.length > 0 && a.forEach((e2, n2) => {
    const a2 = e2.icon || "\u{1F6A9}", o2 = e2.playerDescription || e2.aiDescription || e2.key || "Unknown flag", i2 = "high" === e2.priority || "pregnant" === e2.key || "lactating" === e2.key;
    t.push({ id: `flag.${e2.key || n2}`, category: "flags", text: `${a2} ${o2}`, priority: i2 ? 0.95 : 0.65, freshness: true, keywords: o2.toLowerCase().split(/\s+/) });
  });
  const o = getEmployeeChildren(e.id);
  if (o && o.length > 0 && o.forEach((e2, n2) => {
    const a2 = void 0 !== e2.age ? ` (${e2.age} days old)` : "", o2 = "player" === e2.fatherID ? "with you" : "from previous relationship";
    t.push({ id: `child.${e2.id || n2}`, category: "children", text: `Has a ${e2.gender} named ${e2.name}${a2} ${o2}`, priority: 0.9, freshness: true, relatedTo: "player", keywords: ["child", "baby", e2.name.toLowerCase(), e2.gender] });
  }), e.stats && (void 0 !== e.stats.affection && t.push({ id: "stats.affection", category: "stats", text: `Affection for you: ${e.stats.affection}/100`, priority: 0.6, relatedTo: "player" }), void 0 !== e.stats.productivity && t.push({ id: "stats.productivity", category: "stats", text: `Productivity: ${e.stats.productivity}%`, priority: 0.5 })), e.personalLife?.livingSituation?.hasPet) {
    const n2 = e.personalLife.livingSituation;
    t.push({ id: "personal.pet", category: "personal_life", text: `Has a ${n2.petType} named ${n2.petName}`, priority: 1e-3, avoidRepetition: true, excludeUnlessRelevant: true, keywords: ["pet", "pets", "animal", "animals", "dog", "cat", "fish", "bird", n2.petType, n2.petName].map((e2) => e2?.toLowerCase()).filter(Boolean) });
  }
  if (e.personalLife?.sexualOrientation) {
    const n2 = e.personalLife.sexualOrientation, a2 = { straight: "attracted to the opposite gender", bisexual: "attracted to both men and women", gay: "attracted to men (homosexual)", lesbian: "attracted to women (homosexual)", pansexual: "attracted to people regardless of gender", asexual: "experiences little to no sexual attraction", demisexual: "only experiences sexual attraction after emotional connection", queer: "identifies as queer" }[n2] || n2;
    t.push({ id: "personal.orientation", category: "core_identity", text: `Sexual orientation: ${n2} (${a2}). This is a core part of who I am and influences my romantic interests.`, priority: 0.75, keywords: ["sexuality", "orientation", "gay", "lesbian", "bisexual", "straight", "dating", "relationship", "attracted", "attraction", "romantic", "love", "partner", "type", "preference"] });
  }
  if (e.personalLife?.significantOther) {
    const n2 = e.personalLife.significantOther, a2 = "married" === n2.relationshipType ? `married to ${n2.name}` : "engaged" === n2.relationshipType ? `engaged to ${n2.name}` : "serious" === n2.relationshipType ? `in a serious relationship with ${n2.name}` : `dating ${n2.name}`;
    t.push({ id: "personal.significantOther", category: "personal_life", text: `Is ${a2} (${n2.gender}, ${n2.occupation})${n2.hasKids ? " - has kids together" : ""}. This relationship is part of my life outside work.`, priority: 0.7, keywords: ["boyfriend", "girlfriend", "husband", "wife", "partner", "married", "engaged", "dating", "relationship", "cheating", "affair", n2.name.toLowerCase()] });
  } else if (e.personalLife?.outsideContacts) {
    const n2 = e.personalLife.outsideContacts.relationshipStatus;
    if ("single" === n2) t.push({ id: "personal.relationshipStatus", category: "personal_life", text: "Currently single and not in a romantic relationship. Unattached and potentially available for dating.", priority: 0.55, keywords: ["single", "available", "dating", "relationship", "partner", "boyfriend", "girlfriend", "married"] });
    else if ("separated" === n2) {
      const n3 = e.personalLife.significantOther;
      t.push({ id: "personal.relationshipStatus", category: "personal_life", text: `Currently separated from ${n3?.name ? n3.name : "their partner"} \u2014 in a painful in-between state, not officially divorced but no longer living together as a couple.`, priority: 0.65, keywords: ["separated", "relationship", "partner", "divorce", "apart", "breakup", "difficult", "complicated", n3?.name?.toLowerCase()].filter(Boolean) });
    } else "divorced" === n2 && t.push({ id: "personal.relationshipStatus", category: "personal_life", text: "Recently divorced \u2014 went through a significant life change and is navigating single life again after a marriage ended.", priority: 0.6, keywords: ["divorced", "ex", "marriage", "single", "moving on", "relationship", "starting over", "healing"] });
  }
  (e.personalLife?.outsideContacts?.infidelityTendency || 0) > 0.55 && t.push({ id: "personal.infidelityTendency", category: "personal_life", text: "Has a tendency toward straying \u2014 finds it difficult to fully commit emotionally or physically to one person, and may pursue connections outside a primary relationship.", priority: 0.6, keywords: ["cheating", "affair", "flirting", "relationship", "faithful", "loyalty", "commitment", "hookup", "temptation", "complicated"] }), e.personalLife?.outsideContacts?.polyamorous && t.push({ id: "personal.polyamorous", category: "personal_life", text: "Practices polyamory \u2014 comfortable with multiple romantic or emotional connections simultaneously, not bound by monogamy norms. This is a deliberate lifestyle, not infidelity.", priority: 0.65, keywords: ["polyamory", "open relationship", "multiple partners", "jealousy", "monogamy", "relationship", "dating", "love", "open"] });
  const i = e.personalLife?.outsideContacts?.relationshipHistory || [];
  if (i.length > 0) {
    const e2 = i[i.length - 1], n2 = "divorce" === e2.endReason ? "went through a divorce" : "breakup" === e2.endReason || "called_it_off" === e2.endReason ? "recently went through a breakup" : "recently ended a relationship";
    t.push({ id: "personal.relationshipHistory", category: "personal_life", text: `${n2}${e2.partnerName ? ` with ${e2.partnerName}` : ""}. This colors how they talk about relationships, love, and moving on.`, priority: 0.5, keywords: ["ex", "breakup", "divorce", "healing", "moving on", "relationship", "past", e2.partnerName?.toLowerCase()].filter(Boolean) });
  }
  return t.filter((e2) => e2.text);
}
function kr(e) {
  e.contextUsage || (e.contextUsage = { pieces: {}, interactions: [], performance: {} });
}
function Sr(e, t, n, a) {
  kr(e), t.forEach((t2) => {
    e.contextUsage.pieces[t2.id] || (e.contextUsage.pieces[t2.id] = { count: 0, lastUsed: 0, totalScore: 0 });
    const n2 = e.contextUsage.pieces[t2.id];
    n2.count++, n2.lastUsed = Date.now(), n2.totalScore += t2.score || 0;
  }), e.contextUsage.interactions.push({ id: n, timestamp: gameState.time?.currentTime || Date.now(), type: a, pieces: t.map((e2) => e2.id), pieceCount: t.length }), e.contextUsage.interactions.length > 100 && (e.contextUsage.interactions = e.contextUsage.interactions.slice(-100));
}
style.textContent = "\n    @keyframes pulse-highlight {\n      0%, 100% { box-shadow: 0 0 0 0 rgba(199, 125, 255, 0); }\n      50% { box-shadow: 0 0 0 8px rgba(199, 125, 255, 0.4); }\n    }\n  ", document.head.appendChild(style), window.showAllFlags = showAllFlags, window.removeFlagAndRefresh = removeFlagAndRefresh, window.openFlagManagementModal = openFlagManagementModal, window.loadFlagTemplate = loadFlagTemplate, window.startEditFlag = startEditFlag, window.aiScanFlagsForEmployee = aiScanFlagsForEmployee;
const NuclearEmbeddingService = { getInteractionEmbedding(e) {
  return { keywords: this.extractKeywords(e), type: e.type, involves: e.involves || [] };
}, scoreSemanticRelevance(e, t) {
  let n = 0;
  return e.keywords && t.keywords && (n += 0.2 * e.keywords.filter((e2) => t.keywords.some((t2) => t2.includes(e2) || e2.includes(t2))).length), e.relatedTo && t.involves && t.involves.includes(e.relatedTo) && (n += 0.5), n += 0.6 * ({ "chat.casual": { personality: 1, current_state: 0.9, relationships: 0.7, personal_life: 0.6, appearance: 0.2, skills: 0.3, stats: 0.4 }, "chat.work": { skills: 1, core_identity: 0.9, current_state: 0.7, stats: 0.8, personality: 0.5, relationships: 0.4, appearance: 0.1 }, "social.post": { personality: 0.9, current_state: 0.8, relationships: 0.7, personal_life: 0.6, flags: 0.7, appearance: 0.4 }, "social.comment": { relationships: 0.8, personality: 0.7, current_state: 0.6, core_identity: 0.5 } }[t.type]?.[e.category] || 0.5), Math.min(n, 1);
}, extractKeywords(e) {
  return [e.message, e.prompt, ...(e.recentMessages || []).map((e2) => e2.content)].filter(Boolean).join(" ").toLowerCase().split(/\W+/).filter((e2) => e2.length > 3).filter((e2) => !this.stopWords.has(e2)).slice(0, 30);
}, stopWords: /* @__PURE__ */ new Set(["that", "this", "with", "from", "have", "been", "were", "your", "them", "they"]) };
function Tr(e, t, n = {}) {
  const { maxTokens: a = 500, minPieces: o = 5, maxPieces: i = 20, diversityWeight: s = 0.3, antiRepetitionWeight: r = 0.4 } = n, l = xr(e);
  if (0 === l.length) return [];
  kr(e);
  const c = NuclearEmbeddingService.getInteractionEmbedding(t), d = (t.message || "").toLowerCase(), p = l.map((t2) => {
    if (t2.excludeUnlessRelevant) {
      const e2 = t2.keywords?.some((e3) => d.includes(e3));
      if (!e2) return null;
    }
    const n2 = { base: t2.priority || 0.5, semantic: 0, temporal: 0, novelty: 0, coherence: 0 };
    if (n2.semantic = NuclearEmbeddingService.scoreSemanticRelevance(t2, c), t2.freshness && t2.lastUpdated) {
      const e2 = (Date.now() - t2.lastUpdated) / 36e5;
      n2.temporal = Math.max(0, 1 - e2 / 24);
    } else n2.temporal = 0.3;
    const a2 = e.contextUsage.pieces[t2.id];
    if (a2) {
      const o3 = (Date.now() - a2.lastUsed) / 36e5, i2 = a2.count / Math.max(1, e.contextUsage.interactions.length);
      let s2 = Math.min(1, o3 / 48) * (1 - i2);
      t2.avoidRepetition && (s2 *= 0.3, o3 < 1 && (s2 = 0)), n2.novelty = s2;
    } else n2.novelty = 1;
    n2.coherence = 0.5;
    const o2 = 0.25 * n2.base + 0.35 * n2.semantic + 0.15 * n2.temporal + n2.novelty * r + 0.1 * n2.coherence;
    return { ...t2, scores: n2, score: t2.alwaysInclude ? 999 : o2 };
  }).filter(Boolean);
  p.sort((e2, t2) => t2.score - e2.score);
  const m = [], u2 = {};
  let g = 0;
  p.filter((e2) => e2.alwaysInclude).forEach((e2) => {
    m.push(e2), u2[e2.category] = (u2[e2.category] || 0) + 1, g += $r(e2.text);
  });
  for (const e2 of p) {
    if (e2.alwaysInclude) continue;
    if (m.length >= i) break;
    if (g >= a && m.length >= o) break;
    const t2 = (u2[e2.category] || 0) / Math.max(1, m.length) < 0.3 ? s : 0, n2 = e2.score + t2;
    let r2 = 0;
    for (const t3 of m) t3.category === e2.category && (r2 += 0.05), e2.relatedTo && t3.relatedTo === e2.relatedTo && (r2 += 0.1), e2.keywords && t3.keywords && (r2 += 0.03 * e2.keywords.filter((e3) => t3.keywords.includes(e3)).length);
    const l2 = n2 + r2;
    (l2 > 0.3 || m.length < o) && (m.push({ ...e2, score: l2 }), u2[e2.category] = (u2[e2.category] || 0) + 1, g += $r(e2.text));
  }
  return m;
}
function $r(e) {
  return e ? Math.ceil(e.length / 4) : 0;
}
function Cr(e, t = {}) {
  const { grouped: n = true, includeScores: a = false, categoryLabels: o = true } = t;
  if (!n) return e.map((e2) => {
    const t2 = a ? ` [score: ${e2.score.toFixed(2)}]` : "";
    return `- ${e2.text}${t2}`;
  }).join("\n");
  const i = {};
  e.forEach((e2) => {
    i[e2.category] || (i[e2.category] = []), i[e2.category].push(e2);
  });
  const s = [];
  return ["core_identity", "personality", "current_state", "relationships", "skills", "stats", "flags", "personal_life", "appearance"].forEach((e2) => {
    if (i[e2] && i[e2].length > 0) {
      if (o) {
        const t2 = e2.replace(/_/g, " ").toUpperCase();
        s.push(`
${t2}:`);
      }
      i[e2].forEach((e3) => {
        const t2 = a ? ` [${e3.score.toFixed(2)}]` : "";
        s.push(`- ${e3.text}${t2}`);
      });
    }
  }), s.join("\n").trim();
}
function Er(e, t, n = {}) {
  if (!e) return "";
  const a = Tr(e, { type: t, ...n }, { "chat.casual": { maxTokens: 400, maxPieces: 15 }, "chat.work": { maxTokens: 350, maxPieces: 12 }, "social.post": { maxTokens: 300, maxPieces: 10 }, "social.comment": { maxTokens: 250, maxPieces: 8 }, "profile.description": { maxTokens: 500, maxPieces: 20 } }[t] || { maxTokens: 400, maxPieces: 15 });
  return Sr(e, a, `${t}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, t), Cr(a, { grouped: true });
}
function Ir(e) {
  if (!e.contextUsage) return null;
  const t = { totalInteractions: e.contextUsage.interactions.length, piecesUsed: Object.keys(e.contextUsage.pieces).length, mostUsedPieces: [], leastUsedPieces: [], categoryDistribution: {}, averagePiecesPerInteraction: 0, recentInteractions: e.contextUsage.interactions.slice(-5) }, n = xr(e);
  n.forEach((e2) => {
    t.categoryDistribution[e2.category] = (t.categoryDistribution[e2.category] || 0) + 1;
  });
  const a = Object.entries(e.contextUsage.pieces).map(([e2, t2]) => {
    const a2 = n.find((t3) => t3.id === e2);
    return { id: e2, usage: t2, piece: a2 };
  }).sort((e2, t2) => t2.usage.count - e2.usage.count);
  t.mostUsedPieces = a.slice(0, 5), t.leastUsedPieces = a.slice(-5).reverse();
  const o = e.contextUsage.interactions.reduce((e2, t2) => e2 + t2.pieceCount, 0);
  return t.averagePiecesPerInteraction = o / Math.max(1, e.contextUsage.interactions.length), t;
}
function Pr() {
  const e = gameState.currentLifetimeIncome || 0, t = Math.log10(Math.max(1e3, e)) - 3;
  return { tier: Math.floor(t), minRecommended: Math.pow(10, 1 + 0.8 * t), maxRecommended: Math.pow(10, 4 + 0.8 * t), sweetSpot: Math.pow(10, 2.5 + 0.8 * t) };
}
function Ar(e) {
  const t = e.toLowerCase();
  return t.includes("roman") || t.includes("love") ? "ROMANTIC" : t.includes("lux") || t.includes("expensive") ? "LUXURY" : t.includes("trip") || t.includes("travel") || t.includes("exper") ? "EXPERIENCES" : t.includes("tech") || t.includes("electron") || t.includes("gadget") ? "TECH" : t.includes("book") || t.includes("art") || t.includes("intel") ? "INTELLECTUAL" : t.includes("food") || t.includes("wine") || t.includes("drink") ? "FOOD" : t.includes("practical") || t.includes("useful") || t.includes("tool") ? "PRACTICAL" : t.includes("quirk") || t.includes("unusual") ? "QUIRKY" : t.includes("fit") || t.includes("health") || t.includes("wellness") ? "WELLNESS" : t.includes("fashion") || t.includes("cloth") || t.includes("beauty") ? "FASHION" : t.includes("unique") || t.includes("one") || t.includes("rare") ? "UNIQUE" : "QUIRKY";
}
