// ============================================================================
// 22-social-networking — Social networking: relationships, company awareness, event log, gossip engine, coworker context, memory.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function updateRelationship(e, t, n) {
  const a = gameState.employees.find((t2) => t2.id === e), o = gameState.employees.find((e2) => e2.id === t);
  if (!a || !o) return;
  initializeEmployeeSocialData(a), initializeEmployeeSocialData(o), a.relationships[t] || (a.relationships[t] = createRelationship({ targetId: t }));
  const i = a.relationships[t];
  i.strength = Math.max(0, Math.min(100, i.strength + (n.impact || 0))), i.lastInteraction = Date.now(), i.history.push({ timestamp: gameState.time?.currentTime || Date.now(), event: n.event || "interaction", impact: n.impact || 0 }), i.history.length > 50 && (i.history = i.history.slice(-50)), n.impact > 0 && i.positiveInteractions++, n.impact < 0 && i.conflicts++, i.strength > 80 ? i.type = "crush" === i.type ? "romantic" : "best_friend" : i.strength > 60 ? i.type = "crush" === i.type || "romantic" === i.type ? i.type : "friend" : i.strength < 20 ? i.type = "enemy" : i.strength < 30 && (i.type = "rival"), o.relationships[e] || (o.relationships[e] = createRelationship({ targetId: e }));
  const s = o.relationships[e], r = n.impact * (0.8 + 0.4 * Math.random());
  s.strength = Math.max(0, Math.min(100, s.strength + r)), s.lastInteraction = Date.now(), s.history.push({ timestamp: gameState.time?.currentTime || Date.now(), event: n.event || "interaction", impact: r }), s.history.length > 50 && (s.history = s.history.slice(-50)), r > 0 && s.positiveInteractions++, r < 0 && s.conflicts++, s.strength > 80 ? s.type = "crush" === s.type ? "romantic" : "best_friend" : s.strength > 60 ? s.type = "crush" === s.type || "romantic" === s.type ? s.type : "friend" : s.strength < 20 ? s.type = "enemy" : s.strength < 30 && (s.type = "rival");
}
function generateRandomRelationships(e = null) {
  const t = gameState.employees.filter((e2) => "active" === e2.employmentStatus);
  if (!(t.length < 2)) if (e) {
    const n = t.find((t2) => t2.id === e);
    if (!n) return;
    t.forEach((t2) => {
      if (t2.id === e) return;
      const a = Math.random();
      let o, i = "neutral";
      a < 0.08 ? o = 5 + 12 * Math.random() : a < 0.2 ? o = 12 + 13 * Math.random() : (o = 40 + 20 * Math.random(), t2.locationId === n.locationId && (o += 10), o += 5 * (t2.hobbies || []).filter((e2) => (n.hobbies || []).includes(e2)).length, t2.personality === n.personality && (o += 10 * Math.random()), Math.random() < 0.05 && (i = "crush", o += 15)), updateRelationship(e, t2.id, { event: "initial_meeting", impact: o - 50 }), "crush" === i && (n.relationships[t2.id].type = "crush");
    });
  } else for (let e2 = 0; e2 < t.length - 1; e2++) for (let n = e2 + 1; n < t.length; n++) {
    if (Math.random() > 0.3) continue;
    const a = t[e2], o = t[n], i = 10 * (Math.random() - 0.5);
    updateRelationship(a.id, o.id, { event: "background_interaction", impact: i });
  }
}
function updateCompanyAwareness() {
  const e = gameState.employees.filter((e2) => "active" === e2.employmentStatus);
  gameState.companyContext.totalEmployees = e.length, gameState.companyContext.locationEmployeeCounts = {}, e.forEach((e2) => {
    const t = e2.locationId || "garage";
    gameState.companyContext.locationEmployeeCounts[t] = (gameState.companyContext.locationEmployeeCounts[t] || 0) + 1;
  }), e.forEach((t) => {
    initializeEmployeeSocialData(t), t.awareness.knowsCoworkers = e.filter((e2) => e2.id !== t.id).map((e2) => e2.id), t.awareness.knowsLocations = gameState.locations.filter((e2) => e2.unlocked).map((e2) => e2.id), t.awareness.companyKnowledge = { totalEmployees: e.length, lastUpdated: Date.now() }, e.forEach((e2) => {
      if (e2.id === t.id) return;
      t.relationships[e2.id] || (t.relationships[e2.id] = createRelationship({ targetId: e2.id })), t.relationships[e2.id].sharedLocation = t.locationId === e2.locationId;
      const n = (t.hobbies || []).filter((t2) => (e2.hobbies || []).includes(t2));
      t.relationships[e2.id].sharedInterests = n;
    });
  });
}
function logCompanyEvent(e) {
  const t = createEvent(e);
  return gameState.socialNetwork.globalEvents.push(t), gameState.socialNetwork.globalEvents.length > 100 && (gameState.socialNetwork.globalEvents = gameState.socialNetwork.globalEvents.slice(-100)), t;
}
function getRelevantEvents(e, t = 10) {
  return gameState.socialNetwork.globalEvents.filter((t2) => t2.involvedEmployees.includes(e) || t2.importance >= 7).sort((e2, t2) => t2.timestamp - e2.timestamp).slice(0, t);
}
function getCoworkerContext(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  if (!t) return "";
  initializeEmployeeSocialData(t);
  const n = gameState.employees.filter((t2) => "active" === t2.employmentStatus && t2.id !== e), a = n.filter((e2) => e2.locationId === t.locationId);
  let o = `${t.name} works at ${t.locationId || "garage"} with ${a.length} coworkers. `;
  o += `The company has ${gameState.companyContext.totalEmployees} total employees. `;
  const i = Object.entries(t.relationships || {}).map(([e2, t2]) => {
    const a2 = n.find((t3) => t3.id === e2);
    return a2 ? "best_friend" === t2.type ? `Best friend: ${a2.name}` : "crush" === t2.type ? `Has a crush on: ${a2.name}` : "romantic" === t2.type ? `In a relationship with: ${a2.name}` : "rival" === t2.type ? `Rival: ${a2.name}` : null : null;
  }).filter(Boolean);
  return i.length > 0 && (o += `Relationships: ${i.join(", ")}. `), o;
}
function Gr(e) {
  if (e.social?.voice) {
    const c = String(e.social.voice).split(";").map((s2) => s2.trim()).map((s2) => /^uses abbreviations \(ngl,\s*fr,\s*tbh,\s*istg\)$/i.test(s2) ? "occasionally drops a slang abbreviation (ngl, fr, tbh, istg, lowkey) \u2014 rarely, never twice in a row, not every message" : s2).filter((s2) => s2 && !/mid-?thought|continuation|starts?\s+posts?/i.test(s2)).join("; ");
    return c && c !== e.social.voice && (e.social.voice = c), e.social.voice;
  }
  const t = e.personality || {}, n = String(e.id || "x").split("").reduce((e2, t2) => e2 + t2.charCodeAt(0), 0), a = ["lowercase rambler \u2014 run-on sentences, rarely capitalizes, chatty", "clipped \u2014 short fragments. No filler. Periods.", "emoji-forward \u2014 emoji carry half the tone", "dry deadpan \u2014 minimal punctuation, never exclaims, understates everything", "expressive \u2014 CAPS for emphasis, dramatic punctuation"], o = ["occasionally drops a slang abbreviation (ngl, fr, tbh, istg, lowkey) \u2014 rarely, never twice in a row, not every message", "trails off with ellipses...", "asks rhetorical questions", "makes self-deprecating asides", "uses one. word. sentences. for emphasis"], s = `${(t.professional || 50) > 70 ? a[1] : (t.outgoing || 50) > 70 ? a[n % 2 == 0 ? 4 : 2] : (t.humor || 50) > 65 ? a[3] : a[n % a.length]}; ${o[n % o.length]}; emoji budget ${(t.outgoing || 50) > 60 ? "1-2" : "0-1"} (vary which emoji \u2014 don't reuse the same one every message)`;
  return e.social = e.social || {}, e.social.voice = s, s;
}
function Hr(e, t, n = "post") {
  e && t && !Uo(t) && (e.social = e.social || {}, e.social.callbacks = e.social.callbacks || [], e.social.callbacks.push({ t: gameState.time?.currentTime || Date.now(), gist: String(t).replace(/\s+/g, " ").substring(0, 100), tag: n }), e.social.callbacks.length > 10 && (e.social.callbacks = e.social.callbacks.slice(-10)));
}
function Ur(e) {
  const t = [], n = Object.entries(e.relationships || {}).find(([, e2]) => "romantic" === e2?.type);
  if (n) {
    const e2 = gameState.employees.find((e3) => e3.id === n[0]);
    e2 && t.push(`dating ${e2.name}`);
  }
  const a = e.personalLife?.livingSituation;
  a?.pets?.length > 0 && t.push(`has pet${a.pets.length > 1 ? "s" : ""}: ${a.pets.slice(0, 2).map((e2) => "string" == typeof e2 ? e2 : e2.name || e2.type || "a pet").join(", ")}`), "string" == typeof a?.type && t.push(`lives in ${a.type}`);
  const o = e.giftedPossessions, i = o ? [...o.vehicles || [], ...o.jewelry || [], ...o.tech || []].slice(-2).map((e2) => e2.item).filter(Boolean) : [];
  return i.length > 0 && t.push(`prized gifts from the boss: ${i.join(", ")}`), t.join("; ");
}
function Yr(e, t = false) {
  const n = (gameState.socialNetwork?.posts || []).filter((t2) => t2.authorId === e.id).slice(0, t ? 2 : 4).map((e2) => `- ${ld(e2.timestamp)}, you posted: "${(e2.content || "").replace(/\s+/g, " ").substring(0, 90)}"`);
  if (t) return n.join("\n");
  const a = (e.social?.callbacks || []).slice(-3).map((e2) => `- a while back: ${e2.gist}`), o = (e.memory?.items || []).filter((e2) => "event" === e2.type || "interaction" === e2.type).slice(-2).map((e2) => `- you remember: ${String(e2.text).substring(0, 90)}`);
  return [...n, ...a, ...o].join("\n");
}
function Wr(e, t = false) {
  const n = Yr(e, t), a = Ur(e);
  return `${a ? `
Your life right now: ${a}` : ""}
Your voice (ALWAYS write in this exact style \u2014 it OVERRIDES the tone, punctuation, and emoji density of any examples shown later): ${Gr(e)}${n ? `

=== YOUR RECENT LIFE (be consistent with this \u2014 reference specifics when natural, follow up on open threads) ===
${n}
\u2192 NEVER invent new major life facts (new partner, new pet, moving, quitting) \u2014 those come from the game
\u2192 Grounded beats generic: name the specific thing, don't gesture vaguely at it` : ""}`;
}
function getEmployeeAwarenessForPost(e) {
  "object" == typeof e && e.id && (e = e.id);
  const t = gameState.employees.find((t2) => t2.id === e);
  if (!t) return null;
  initializeEmployeeSocialData(t);
  const n = gameState.employees.filter((t2) => "active" === t2.employmentStatus && t2.id !== e), a = n.filter((e2) => e2.locationId === t.locationId), o = n.filter((e2) => e2.locationId !== t.locationId), i = { bestFriends: [], friends: [], crushes: [], romantic: [], rivals: [], enemies: [], neutral: [] }, s = [];
  Object.entries(t.relationships || {}).forEach(([e2, t2]) => {
    const a2 = n.find((t3) => t3.id === e2);
    if (!a2) return;
    const o2 = { id: a2.id, name: a2.name, position: a2.position, location: a2.locationId, strength: t2.strength, sameLocation: t2.sharedLocation, sharedInterests: t2.sharedInterests };
    "best_friend" === t2.type ? i.bestFriends.push(o2) : "friend" === t2.type ? i.friends.push(o2) : "crush" === t2.type ? i.crushes.push(o2) : "romantic" === t2.type ? i.romantic.push(o2) : "rival" === t2.type ? i.rivals.push(o2) : "enemy" === t2.type ? i.enemies.push(o2) : i.neutral.push(o2), s.push({ coworkerId: a2.id, coworkerName: a2.name, relationship: t2.type || "neutral", knownFor: a2.position, strength: t2.strength });
  });
  const r = getRelevantEvents(e, 5), l = [t.locationId || "headquarters"], c = gameState.chatHistory[t.id] || [], u2 = gameState.time?.currentTime || Date.now(), d = u2 - 72e5, p = c.filter((e2) => (e2.timestamp || 0) > d).slice(-5);
  let m = null;
  if (p.length >= 2) {
    const e2 = p.map((e3) => e3.content).join(" "), t2 = [], G2 = /\b(nude|naked|undress|stripped|stripping|sex|fuck|cock|dick|pussy|tits|boobs|cum|orgasm|horny|aroused|moan|blowjob|riding|nipple|clit|panties|lingerie|take it all off|show me your body|bend over)\b/i.test(e2);
    G2 ? t2.push("explicit/intimate") : /\b(flirt|sexy|hot|beautiful|cute|attractive|date|kiss|touch|tease|seduce)\b/i.test(e2) && t2.push("flirty/romantic"), !G2 && /\b(project|deadline|work|meeting|report|task|client)\b/i.test(e2) && t2.push("work-related"), /\b(tired|busy|stressed|excited|happy|sad|frustrated)\b/i.test(e2) && t2.push("emotional/personal"), !G2 && /\b(lunch|dinner|coffee|drink|food|eat)\b/i.test(e2) && t2.push("food/social"), m = { hasRecentChat: true, messageCount: p.length, themes: t2, lastMessages: p.slice(-3).map((e3) => ({ sender: e3.sender, preview: e3.content.slice(0, 100) })), timeAgo: Math.max(0, Math.round((u2 - (p[p.length - 1]?.timestamp || u2)) / 6e4)) };
  }
  return { employee: { id: t.id, name: t.name, position: t.position, location: t.locationId, gender: t.gender || "Female", age: t.age, physicalDescription: getPhysicalDescriptionForPrompt(t), personality: t.personalityTraits || t.personality, hobbies: t.hobbies || [], stats: t.stats }, workplace: { totalEmployees: gameState.companyContext.totalEmployees, locationCoworkers: a.length, sameLocationNames: a.map((e2) => e2.name), otherLocationEmployees: o.length, locations: Object.keys(gameState.companyContext.locationEmployeeCounts) }, relationships: i, coworkers: s, knownLocations: l, recentEvents: r, chatContext: m, socialProfile: t.social };
}
function getRandomCoworkerByRelation(e, t = null) {
  const n = gameState.employees.find((t2) => t2.id === e);
  if (!n) return null;
  initializeEmployeeSocialData(n);
  const a = Object.entries(n.relationships || {}).filter(([e2, n2]) => (!t || n2.type === t) && !!gameState.employees.find((t2) => t2.id === e2 && "active" === t2.employmentStatus)).map(([e2]) => gameState.employees.find((t2) => t2.id === e2));
  return 0 === a.length ? null : a[Math.floor(Math.random() * a.length)];
}
function getLocationCoworkers(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  return t ? gameState.employees.filter((n) => "active" === n.employmentStatus && n.id !== e && n.locationId === t.locationId) : [];
}
function getKnownLocations(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  return t ? (initializeEmployeeSocialData(t), gameState.locations.filter((e2) => t.awareness.knowsLocations.includes(e2.id)).map((e2) => ({ id: e2.id, name: e2.name, employeeCount: gameState.companyContext.locationEmployeeCounts[e2.id] || 0 }))) : [];
}
function knowsEmployee(e, t) {
  const n = gameState.employees.find((t2) => t2.id === e);
  return !!n && (initializeEmployeeSocialData(n), n.awareness.knowsCoworkers.includes(t));
}
function Vr(e) {
  return e.gossip || (e.gossip = { knownGossip: [], lastGossipTime: 0, gossipTendency: 30 + 50 * Math.random(), trustworthiness: 20 + 60 * Math.random() }), e.recentSimulatedEvents || (e.recentSimulatedEvents = []), e;
}
function Kr({ id: e = `gossip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, type: t, subjectId: n, targetId: a = null, content: o, truthLevel: i = 100, juiciness: s = 50, spreadCount: r = 0, originatorId: l, timestamp: c = Date.now(), expiresAt: d = Date.now() + 6048e5, tags: p = [] } = {}) {
  return { id: e, type: t, subjectId: n, targetId: a, content: o, truthLevel: i, juiciness: s, spreadCount: r, originatorId: l, timestamp: c, expiresAt: d, tags: p };
}
function Jr(e) {
  gameState.companyWideContext || (gameState.companyWideContext = { currentBuzz: [], lastUpdate: Date.now(), maxItems: 40, decayTime: 6048e5 });
  const t = gameState.companyWideContext, n = Date.now(), a = { id: `context_${n}_${Math.random().toString(36).substr(2, 9)}`, content: e.content, type: e.type, subjectIds: e.subjectIds || [], juiciness: e.juiciness || 50, timestamp: n, source: e.source || "unknown" };
  console.log(`[CompanyContext] \u{1F4E2} Adding to public knowledge: "${e.content}"`), t.currentBuzz.unshift(a);
  const o = n - t.decayTime;
  return t.currentBuzz = t.currentBuzz.filter((e2) => e2.timestamp > o), t.currentBuzz.length > t.maxItems && (t.currentBuzz.sort((e2, t2) => {
    const a2 = (n - e2.timestamp) / 864e5, o2 = (n - t2.timestamp) / 864e5, i = e2.juiciness * (1 / (1 + 0.5 * a2));
    return t2.juiciness * (1 / (1 + 0.5 * o2)) - i;
  }), t.currentBuzz = t.currentBuzz.slice(0, t.maxItems)), t.lastUpdate = n, console.log(`[CompanyContext] Current buzz has ${t.currentBuzz.length} items`), a;
}
function Qr() {
  return gameState.companyWideContext && 0 !== gameState.companyWideContext.currentBuzz.length ? `CURRENT OFFICE BUZZ (Public Knowledge):
${gameState.companyWideContext.currentBuzz.slice(0, 10).map((e, t) => `${t + 1}. ${e.content}`).join("\n")}` : "The office is relatively quiet right now - no major drama or gossip.";
}
function Xr(e) {
  const t = (e.content || "").toLowerCase(), n = e.referencedEmployees || [], a = e.explicitLevel >= 2;
  let o = 30, i = null, s = "post";
  if (["dating", "together", "couple", "boyfriend", "girlfriend", "relationship", "hooked up", "kissed", "makeout", "sleeping with"].some((e2) => t.includes(e2)) && n.length >= 1) {
    o = 85;
    const t2 = n.map((e2) => {
      const t3 = gameState.employees.find((t4) => t4.id === e2);
      return t3 ? t3.name : "someone";
    });
    i = e.isPlayerPost ? `Boss revealed something about ${t2.join(" and ")} on social media` : `${e.authorName} posted about ${t2.join(" and ")} - relationship drama!`, s = "hookup";
  }
  if (a && n.length >= 1) {
    o = Math.max(o, 75);
    const t2 = n.map((e2) => {
      const t3 = gameState.employees.find((t4) => t4.id === e2);
      return t3 ? t3.name : "someone";
    });
    i || (i = e.isPlayerPost ? `Boss posted explicit content featuring ${t2.join(" and ")}` : `${e.authorName} shared explicit content about ${t2.join(" and ")}`, s = "scandal");
  }
  if (["drama", "fight", "angry", "hate", "betrayed", "liar", "cheat", "exposed", "caught"].some((e2) => t.includes(e2)) && n.length >= 1) {
    o = Math.max(o, 70);
    const t2 = n.map((e2) => {
      const t3 = gameState.employees.find((t4) => t4.id === e2);
      return t3 ? t3.name : "someone";
    });
    i || (i = `${e.authorName} called out ${t2.join(" and ")} - office drama!`, s = "fight");
  }
  e.likes && e.likes.length > 5 && (o += 15), e.comments && e.comments.length > 3 && (o += 20), i && o >= 60 && (Jr({ content: i, type: s, subjectIds: [e.authorId || "player", ...n], juiciness: o, source: "social_post" }), console.log(`[CompanyContext] Extracted public knowledge from post (juiciness: ${o})`), Zr({ content: i, type: s, subjectIds: [e.authorId || "player", ...n], juiciness: o }));
}
function Zr(e) {
  gameState.activeGossip || (gameState.activeGossip = []);
  const t = gameState.employees.filter((e2) => "active" === e2.employmentStatus), n = [];
  for (const a2 of e.subjectIds) "player" !== a2 && t.find((e2) => e2.id === a2) && n.push(a2);
  const a = Math.min(0.8, e.juiciness / 100 * 0.6);
  for (const o of t) if (!n.includes(o.id) && Math.random() < a) {
    n.push(o.id), o.gossip || Vr(o);
    const t2 = Kr({ type: e.type, subjectId: e.subjectIds[0] || "player", targetId: e.subjectIds[1] || null, content: e.content, truthLevel: 100, juiciness: e.juiciness, spreadCount: n.length, originatorId: "public" });
    o.gossip.knownGossip.find((e2) => e2.content === t2.content) || (o.gossip.knownGossip.push(t2), o.gossip.knownGossip.length > 20 && (o.gossip.knownGossip.sort((e2, t3) => t3.timestamp - e2.timestamp), o.gossip.knownGossip = o.gossip.knownGossip.slice(0, 20)));
  }
  gameState.activeGossip.push({ id: `gossip_${Date.now()}_${Math.random()}`, subjectId: e.subjectIds[0] || "player", targetId: e.subjectIds[1] || null, content: e.content, juiciness: e.juiciness, timestamp: gameState.time?.currentTime || Date.now(), accuracy: 100, knownBy: n }), gameState.activeGossip.length > 50 && (gameState.activeGossip = gameState.activeGossip.slice(-50)), console.log(`[GossipEngine] Fed context to ${n.length} NPCs: "${e.content}"`);
}
function es({ id: e = `simevent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, type: t, participants: n, location: a, description: o, outcome: i, relationshipImpacts: s = [], generatesGossip: r = true, timestamp: l = Date.now(), witnessed: c = [] } = {}) {
  return { id: e, type: t, participants: n, location: a, description: o, outcome: i, relationshipImpacts: s, generatesGossip: r, timestamp: l, witnessed: c };
}
function ts() {
  const e = gameState.employees.filter((e2) => "active" === e2.employmentStatus);
  if (e.length < 2) return;
  if (Math.random() > 0.15) return;
  const t = Math.random() < 0.7 ? 2 : 3, n = [];
  for (; n.length < t && n.length < e.length; ) {
    const t2 = e[Math.floor(Math.random() * e.length)];
    n.find((e2) => e2.id === t2.id) || n.push(t2);
  }
  if (n.length < 2) return;
  const a = n[0], o = n[1], i = a.relationships?.[o.id], s = i?.type || "neutral";
  let r, l, c, d = [];
  if ("romantic" === s && Math.random() < 0.3) {
    r = "date";
    const e2 = ["coffee shop", "nice restaurant", "the park", "downtown"], t2 = e2[Math.floor(Math.random() * e2.length)];
    l = `${a.name} and ${o.name} went on a date to ${t2}`, c = Math.random() < 0.8 ? "positive" : "neutral", d = [{ employeeId1: a.id, employeeId2: o.id, change: Math.random() < 0.8 ? 5 + Math.floor(10 * Math.random()) : -5 }];
  } else if ("crush" === s && Math.random() < 0.4) {
    r = "hookup";
    const e2 = ["supply closet", "empty office", "their apartment", "parking garage"], t2 = e2[Math.floor(Math.random() * e2.length)];
    l = `${a.name} and ${o.name} hooked up in ${t2}`, c = "dramatic", d = [{ employeeId1: a.id, employeeId2: o.id, change: 15 + Math.floor(20 * Math.random()) }], i && (i.type = Math.random() < 0.6 ? "romantic" : "friends_with_benefits", i.strength = Math.min(100, i.strength + 20));
  } else if (("rival" === s || "enemy" === s) && Math.random() < 0.5) {
    r = "argument";
    const e2 = ["work project", "personal issue", "office gossip", "petty disagreement"], t2 = e2[Math.floor(Math.random() * e2.length)];
    l = `${a.name} and ${o.name} had a heated argument about ${t2}`, c = "negative", d = [{ employeeId1: a.id, employeeId2: o.id, change: -10 - Math.floor(15 * Math.random()) }];
  } else {
    const e2 = [{ type: "lunch", desc: "had lunch together at", outcome: "positive", impact: 3 }, { type: "drinks", desc: "grabbed drinks after work at", outcome: "positive", impact: 5 }, { type: "project", desc: "worked together on a project", outcome: "neutral", impact: 2 }, { type: "gossip_session", desc: "had a long gossip session about the office", outcome: "neutral", impact: 4 }, { type: "coffee", desc: "got coffee together", outcome: "positive", impact: 2 }], t2 = e2[Math.floor(Math.random() * e2.length)];
    if (r = t2.type, c = t2.outcome, "gossip_session" === t2.type) l = `${a.name} and ${o.name} ${t2.desc}`;
    else {
      const e3 = ["the local caf\xE9", "Murphy's Bar", "that new place downtown"];
      l = `${a.name} and ${o.name} ${t2.desc} ${"project" === t2.type ? "" : e3[Math.floor(Math.random() * e3.length)]}`;
    }
    d = [{ employeeId1: a.id, employeeId2: o.id, change: t2.impact + Math.floor(3 * Math.random()) }];
  }
  const p = a.locationId || "headquarters", m = e.filter((e2) => e2.locationId === p && !n.find((t2) => t2.id === e2.id)), u2 = Math.floor(Math.random() * Math.min(4, m.length + 1)), g = [];
  for (let e2 = 0; e2 < u2; e2++) {
    const e3 = m[Math.floor(Math.random() * m.length)];
    e3 && !g.includes(e3.id) && g.push(e3.id);
  }
  const h = es({ type: r, participants: n.map((e2) => e2.id), location: p, description: l, outcome: c, relationshipImpacts: d, witnessed: g });
  if (d.forEach((e2) => {
    updateRelationship(e2.employeeId1, e2.employeeId2, { event: r, impact: e2.change });
  }), n.forEach((e2) => {
    Vr(e2), e2.recentSimulatedEvents.push(h), e2.recentSimulatedEvents.length > 10 && (e2.recentSimulatedEvents = e2.recentSimulatedEvents.slice(-10));
  }), h.generatesGossip && ("hookup" === r || "argument" === r || "date" === r)) {
    const t2 = "hookup" === r ? 80 : "argument" === r ? 60 : 50, n2 = l, i2 = Kr({ type: r, subjectId: a.id, targetId: o.id, content: n2, juiciness: t2, originatorId: g.length > 0 ? g[0] : a.id, tags: [c, "simulated"] });
    g.forEach((t3) => {
      const n3 = e.find((e2) => e2.id === t3);
      n3 && (Vr(n3), n3.gossip.knownGossip.push({ gossipId: i2.id, learnedAt: Date.now(), source: "witnessed", accuracy: 100 }));
    }), gameState.socialNetwork.activeGossip || (gameState.socialNetwork.activeGossip = []), gameState.socialNetwork.activeGossip.push(i2), setTimeout(() => ns(i2.id), 5e3 + 1e4 * Math.random());
  }
  console.log(`[GossipEngine] Simulated event: ${l}`);
}
function ns(e) {
  const t = gameState.socialNetwork.activeGossip?.find((t2) => t2.id === e);
  if (!t) return;
  const n = gameState.employees.filter((e2) => "active" === e2.employmentStatus), a = n.filter((t2) => (Vr(t2), t2.gossip.knownGossip.some((t3) => t3.gossipId === e)));
  0 !== a.length && a.forEach((a2) => {
    if (Vr(a2), 100 * Math.random() > a2.gossip.gossipTendency) return;
    const o = n.filter((t2) => {
      if (t2.id === a2.id) return false;
      if (Vr(t2), t2.gossip.knownGossip.some((t3) => t3.gossipId === e)) return false;
      const n2 = a2.relationships?.[t2.id];
      return a2.locationId === t2.locationId || n2 && ["friend", "best_friend"].includes(n2.type);
    });
    if (0 === o.length) return;
    const i = o[Math.floor(Math.random() * o.length)], s = a2.gossip.knownGossip.find((t2) => t2.gossipId === e)?.accuracy || 100, r = a2.gossip.trustworthiness / 100, l = Math.max(0, Math.floor(s * r * (0.85 + 0.15 * Math.random())));
    i.gossip.knownGossip.push({ gossipId: t.id, learnedAt: Date.now(), source: a2.id, accuracy: l }), t.spreadCount++, console.log(`[GossipEngine] ${a2.name} told ${i.name} about: ${t.content} (accuracy: ${l}%)`);
  });
}
function os(e, t = 5) {
  const n = gameState.employees.find((t2) => t2.id === e);
  if (!n) return [];
  Vr(n);
  const a = Date.now(), o = gameState.socialNetwork.activeGossip || [];
  return n.gossip.knownGossip.map((e2) => {
    const t2 = o.find((t3) => t3.id === e2.gossipId);
    return !t2 || t2.expiresAt < a ? null : { ...t2, learnedAt: e2.learnedAt, accuracy: e2.accuracy, source: e2.source };
  }).filter(Boolean).sort((e2, t2) => t2.juiciness - e2.juiciness).slice(0, t);
}
function rs({ type: e, npcId: t, description: n, juiciness: a = 50 }) {
  const o = gameState.employees.find((e2) => e2.id === t);
  if (!o) return;
  Vr(o);
  const i = Kr({ type: e, subjectId: "player", targetId: t, content: n, juiciness: a, originatorId: t, tags: ["player_action"] });
  o.gossip.knownGossip.push({ gossipId: i.id, learnedAt: Date.now(), source: "personal_experience", accuracy: 100 }), gameState.socialNetwork.activeGossip || (gameState.socialNetwork.activeGossip = []), gameState.socialNetwork.activeGossip.push(i), (o.gossip.gossipTendency > 40 || a > 70) && setTimeout(() => ns(i.id), 3e3 + 7e3 * Math.random()), console.log(`[GossipEngine] Created player gossip: ${n}`);
}
function ss(e, t = true) {
  const n = os(e, 3);
  if (0 === n.length) return "";
  let a = "\n\nRECENT GOSSIP YOU KNOW ABOUT:\n";
  return n.forEach((e2) => {
    if (!t && "player" === e2.subjectId) return;
    "player" === e2.subjectId || gameState.employees.find((t2) => t2.id === e2.subjectId), e2.targetId && ("player" === e2.targetId || gameState.employees.find((t2) => t2.id === e2.targetId));
    const n2 = e2.accuracy < 50 ? " (but this might be a rumor)" : e2.accuracy < 80 ? " (heard through the grapevine)" : "";
    a += `- ${e2.content}${n2}
`;
  }), a += "\nYou can reference this gossip naturally in conversation if relevant!\n", a;
}
function ls() {
  if (!gameState.socialNetwork.activeGossip) return;
  const e = Date.now(), t = gameState.socialNetwork.activeGossip.length;
  gameState.socialNetwork.activeGossip = gameState.socialNetwork.activeGossip.filter((t2) => t2.expiresAt > e);
  const n = t - gameState.socialNetwork.activeGossip.length;
  n > 0 && console.log(`[GossipEngine] Cleaned up ${n} expired gossip items`);
}
function cs(e) {
  return (e || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}
function ds(e, t) {
  const n = [], a = e.toLowerCase();
  return t.productManaged && a.includes(t.productManaged.toLowerCase()) && n.push("job_specific"), t.position && a.includes(t.position.toLowerCase()) && n.push("job_title"), /\b(work|job|task|project|deadline)\b/.test(a) && n.push("work_general"), (t.hobbies || []).forEach((e2) => {
    a.includes(e2.toLowerCase()) && n.push(`hobby_${e2}`);
  }), /\b(date|dinner|coffee|drinks|hang out)\b/.test(a) && n.push("social_invite"), /\b(flirt|cute|hot|sexy|attractive)\b/.test(a) && n.push("flirting"), /\b(kiss|touch|intimate|physical)\b/.test(a) && n.push("physical"), /\b(love|feel|emotion|heart)\b/.test(a) && n.push("emotional"), n;
}
function ensureEmployeeMemory(e) {
  if (e) {
    if (!e.memory || Array.isArray(e.memory)) {
      const t = Array.isArray(e.memory) ? e.memory : [];
      e.memory = { items: [], cap: 300, styleCounters: { total: 0, sincePersonal: 99, recentTopics: [], jobMentions: 0, hobbyMentions: 0, lastJobMention: 0, lastHobbyMention: 0 }, conversationPhase: "early", intimacyLevel: 0, eventMemories: [] };
      for (const n of t) remember(e, n, "note", 0.5);
    } else e.memory.styleCounters || (e.memory.styleCounters = { total: 0, sincePersonal: 99, recentTopics: [], jobMentions: 0, hobbyMentions: 0, lastJobMention: 0, lastHobbyMention: 0 });
    e.memory.eventMemories || (e.memory.eventMemories = []), e.memory.cap && e.memory.cap < 300 && (e.memory.cap = 300), e.memory.conversationPhase || (e.memory.conversationPhase = "early"), void 0 === e.memory.intimacyLevel && (e.memory.intimacyLevel = 0), ps(e), Fs(e), ws(e);
  }
}
function ps(e) {
  if (e) {
    if ("string" == typeof e.personality) {
      const t = e.personality;
      e.personalityTraits = [t], e.personality = {};
    }
    e.personality && "object" == typeof e.personality || (e.personality = {}), void 0 === e.personality.confidence && (e.personality.confidence = 30 + Math.floor(50 * Math.random())), void 0 === e.personality.outgoing && (e.personality.outgoing = 20 + Math.floor(60 * Math.random())), void 0 === e.personality.flirty && (e.personality.flirty = 10 + Math.floor(70 * Math.random())), void 0 === e.personality.professional && (e.personality.professional = 30 + Math.floor(50 * Math.random())), void 0 === e.personality.humor && (e.personality.humor = 20 + Math.floor(60 * Math.random()));
  }
}
window.regenerateGiftImage = regenerateGiftImage, window.regenerateGiftDescription = regenerateGiftDescription;
