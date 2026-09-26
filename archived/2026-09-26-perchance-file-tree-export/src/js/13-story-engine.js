// ============================================================================
// 13-story-engine — StoryEngine + StoryMinigames (multi-step events, minigame framework).
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

const StoryEngine = { calculateScaledCost(e, t = "medium") {
  if (!e || e <= 0) return 0;
  const a = { trivial: 5, low: 30, medium: 120, high: 300, extreme: 600, catastrophic: 1800 };
  let o = "medium";
  o = e <= 1e3 ? "low" : e <= 1e4 ? "medium" : e <= 1e5 ? "high" : "extreme";
  let i = ("function" == typeof calculateCashPerSecond && parseFloat(calculateCashPerSecond()) || 1) * (a[o] || a.medium);
  const s = 0.01 * gameState.cash, r = 0.25 * gameState.cash;
  return i = Math.max(i, s, 100), i = Math.min(i, r), i = i >= 1e6 ? 1e5 * Math.round(i / 1e5) : i >= 1e4 ? 1e3 * Math.round(i / 1e3) : i >= 1e3 ? 100 * Math.round(i / 100) : 10 * Math.round(i / 10), i;
}, getChoiceCost(e) {
  return !e.cost || e.cost <= 0 ? 0 : this.calculateScaledCost(e.cost);
}, ACT_CONFIG: { 1: { name: "GARAGE DREAMS", title: "ACT I: GARAGE DREAMS", description: "Every empire starts somewhere. Yours begins in a cramped garage with nothing but ambition and a dream.", tone: "hopeful, underdog, learning", themes: ["humble beginnings", "first victories", "building trust"], triggerConditions: { cash: 0, employees: 0, locations: [] }, spineEvents: ["prologue", "first_hire", "first_crisis", "garage_boss"] }, 2: { name: "CORPORATE CLIMBER", title: "ACT II: CORPORATE CLIMBER", description: "Success breeds ambition. But ambition breeds enemies. Someone is watching your rise... and they don't like what they see.", tone: "ambitious, competitive, moral choices", themes: ["growing pains", "office politics", "first rival"], triggerConditions: { cash: 15e3, employees: 3, locations: ["home_office"] }, spineEvents: ["expansion_decision", "the_whistleblower", "victoria_intro", "inner_circle"] }, 3: { name: "EMPIRE BUILDER", title: "ACT III: EMPIRE BUILDER", description: "You've built something real. But empires attract vultures, and the bigger you grow, the more you have to lose.", tone: "powerful, consequential, hubris", themes: ["power corrupts", "loyalty tested", "hard choices"], triggerConditions: { cash: 5e5, employees: 10, locations: ["office_suite"] }, spineEvents: ["factory_incident", "the_consortium", "betrayal_arc", "point_of_no_return", "victoria_returns", "victoria_joins"] }, 4: { name: "SHADOWS & SECRETS", title: "ACT IV: SHADOWS & SECRETS", description: "Behind every fortune lies a darker truth. How deep are you willing to go?", tone: "dark, mature, consequences", themes: ["hidden worlds", "moral gray", "transformation"], triggerConditions: { cash: 5e9, employees: 20, locations: ["creative_studio"], prestiges: 1 }, spineEvents: ["hidden_world", "price_of_entry", "family_secrets", "judgment_day"] }, 5: { name: "THE RECKONING", title: "ACT V: THE RECKONING", description: "All paths lead here. What kind of legacy will you leave? What kind of person have you become?", tone: "climactic, cosmic, transcendent", themes: ["legacy", "ultimate power", "final choice"], triggerConditions: { cash: 5e11, employees: 35, locations: ["private_club"], prestiges: 2 }, spineEvents: ["velvet_invitation", "ultimate_choice", "endings"] } }, ALIGNMENTS: { 0: { name: "Ruthless Tyrant", emoji: "\u{1F47F}", color: "var(--dk)", title: "The Iron Fist", description: "Your rule through fear is legendary. Employees tremble.", npcReaction: "terrified", unlockedChoices: ["intimidate", "threaten", "exploit"], perks: ["Fear Compliance: +20% productivity from scared employees", "No one dares quit"] }, 25: { name: "Pragmatic Shark", emoji: "\u{1F988}", color: "var(--l)", title: "The Calculator", description: "You do what needs to be done. Sentiment is for the weak.", npcReaction: "wary", unlockedChoices: ["manipulate", "leverage", "hardball"], perks: ["Cutthroat Deals: Better business outcomes", "Ruthless Efficiency"] }, 50: { name: "Balanced Leader", emoji: "\u2696\uFE0F", color: "var(--z)", title: "The Diplomat", description: "You walk the line between profit and people.", npcReaction: "neutral", unlockedChoices: ["negotiate", "compromise", "defer"], perks: ["Flexible Approach: All options available", "Neutral Reputation"] }, 75: { name: "Ethical Pioneer", emoji: "\u{1F31F}", color: "var(--n)", title: "The Mentor", description: "You lead with principle. People want to follow you.", npcReaction: "respectful", unlockedChoices: ["inspire", "support", "protect"], perks: ["Loyal Following: +15% trust baseline", "Talent Magnet"] }, 100: { name: "Benevolent Visionary", emoji: "\u{1F47C}", color: "var(--u)", title: "The Beloved", description: "Your employees would follow you anywhere. You are loved.", npcReaction: "devoted", unlockedChoices: ["unite", "sacrifice", "transform"], perks: ["Undying Loyalty: Employees never quit", "Inspirational Aura"] } }, MANAGEMENT_ARCHETYPES: { benevolent_leader: { condition: (e) => e.moralScore >= 75 && e.charismaScore >= 60, title: "Beloved Leader", traits: ["Inspiring", "Trustworthy", "Nurturing"], color: "var(--n)" }, ruthless_tyrant: { condition: (e) => e.moralScore <= 25 && e.ruthlessnessScore >= 60, title: "Feared Tyrant", traits: ["Intimidating", "Unforgiving", "Powerful"], color: "var(--dk)" }, charismatic_manipulator: { condition: (e) => e.charismaScore >= 70 && e.moralScore < 50, title: "Silver Tongue", traits: ["Persuasive", "Charming", "Deceptive"], color: "var(--ap)" }, pragmatic_executive: { condition: (e) => e.moralScore >= 35 && e.moralScore <= 65 && e.ruthlessnessScore < 40, title: "The Professional", traits: ["Practical", "Efficient", "Fair"], color: "var(--j)" }, chaotic_wildcard: { condition: (e) => Math.abs(e.moralScore - 50) > 30 && e.charismaScore < 40, title: "Unpredictable Force", traits: ["Volatile", "Surprising", "Bold"], color: "var(--au)" } }, updateManagementStyle() {
  if (!gameState.story) return;
  const e = { moralScore: gameState.story.moralScore, charismaScore: gameState.story.charismaScore, ruthlessnessScore: gameState.story.ruthlessnessScore };
  for (const [t, n] of Object.entries(this.MANAGEMENT_ARCHETYPES)) if (n.condition(e)) return void (gameState.story.managementStyle = { archetype: t, title: n.title, traits: n.traits, color: n.color, unlockedChoices: this.getAlignmentInfo(e.moralScore).unlockedChoices || [], npcReactionModifier: this.calculateNPCReactionModifier(e) });
  gameState.story.managementStyle = { archetype: "neutral", title: "Rising Manager", traits: ["Developing"], color: "var(--aw)", unlockedChoices: [], npcReactionModifier: 0 };
}, calculateNPCReactionModifier(e) {
  let t = 0;
  return e.moralScore >= 75 ? t += 15 : e.moralScore <= 25 && (t -= 10), e.charismaScore >= 70 && (t += 10), e.ruthlessnessScore >= 60 && (t -= 5), t;
}, isChoiceUnlockedByAlignment(e) {
  const t = this.getAlignmentInfo(gameState.story.moralScore);
  return t.unlockedChoices?.includes(e) || false;
}, ACTION_WEIGHTS: { hired_employee: { moral: 2, desc: "gave someone a chance" }, fired_employee_fairly: { moral: -3, desc: "let someone go" }, fired_employee_cruelly: { moral: -10, desc: "fired someone harshly" }, rehired_former_employee: { moral: 5, desc: "gave someone a second chance" }, gave_gift: { moral: 3, desc: "showed appreciation" }, gave_expensive_gift: { moral: 5, desc: "gave a generous gift" }, ignored_low_comfort: { moral: -2, desc: "ignored an uncomfortable employee" }, ignored_low_trust: { moral: -1, desc: "let trust erode" }, helped_struggling_employee: { moral: 4, desc: "supported someone in need" }, promoted_employee: { moral: 2, desc: "recognized good work" }, demoted_employee: { moral: -4, desc: "demoted someone" }, raised_salary: { moral: 3, desc: "increased pay" }, cut_salary: { moral: -5, desc: "cut someone's pay" }, fair_promotion: { moral: 3, desc: "promoted based on merit" }, unfair_promotion: { moral: -4, desc: "promoted a favorite unfairly" }, romantic_advance_welcome: { moral: 0, desc: "pursued mutual attraction" }, romantic_advance_unwelcome: { moral: -8, desc: "made unwanted advances" }, respected_boundaries: { moral: 3, desc: "respected someone's boundaries" }, intimate_encounter: { moral: 0, desc: "shared an intimate moment", nsfw: true }, first_intimate_encounter: { moral: 0, desc: "crossed an intimate threshold", nsfw: true }, seduced_employee: { moral: -2, desc: "seduced someone under your authority", nsfw: true }, mutual_attraction_consummated: { moral: 1, desc: "acted on mutual desire", nsfw: true }, coerced_intimacy: { moral: -10, desc: "pressured someone into intimacy", nsfw: true }, office_romance_discovered: { moral: 0, desc: "had a relationship exposed", nsfw: true }, passionate_affair: { moral: -1, desc: "began a passionate affair", nsfw: true }, broke_heart: { moral: -4, desc: "ended an intimate relationship badly", nsfw: true }, rewarded_loyalty_intimately: { moral: -1, desc: "mixed pleasure with business", nsfw: true }, exploited_worker: { moral: -6, desc: "pushed someone too hard" }, overworked_team: { moral: -3, desc: "demanded excessive hours" }, work_life_balance: { moral: 4, desc: "respected work-life balance" }, defeated_boss: { moral: 0, desc: "defeated a rival" }, recruited_boss: { moral: 2, desc: "turned a rival into an ally" }, showed_mercy: { moral: 5, desc: "showed mercy to a defeated foe" }, showed_no_mercy: { moral: -5, desc: "crushed an enemy completely" }, protected_whistleblower: { moral: 8, desc: "protected someone speaking truth" }, silenced_whistleblower: { moral: -10, desc: "silenced dissent" }, shared_profits: { moral: 6, desc: "shared success with the team" }, hoarded_profits: { moral: -4, desc: "kept all the rewards" } }, isAdultContentEnabled: () => "function" != typeof Ue || !Ue(), getContentVariant(e) {
  return e ? "string" == typeof e ? e : this.isAdultContentEnabled() && e.nsfw ? e.nsfw : e.sfw || e.nsfw || "" : "";
}, addSpice(e, t) {
  return t && this.isAdultContentEnabled() ? `${e}

${t}` : e;
}, trackAction(e, t = {}) {
  if (!gameState.story?.settings?.storyEnabled) return;
  const n = this.ACTION_WEIGHTS[e];
  if (!n) return void console.warn(`[StoryEngine] Unknown action type: ${e}`);
  if (n.nsfw && !this.isAdultContentEnabled()) return void console.log(`[StoryEngine] Skipping NSFW action in SFW mode: ${e}`);
  gameState.story.actionLog || (gameState.story.actionLog = []);
  const a = { type: e, timestamp: Date.now(), gameTime: gameState.time?.currentTime || Date.now(), context: t, moralImpact: n.moral, description: n.desc };
  gameState.story.actionLog.unshift(a), gameState.story.actionLog.length > 100 && (gameState.story.actionLog = gameState.story.actionLog.slice(0, 100));
  const u2 = gameState.story.moralScore;
  if (gameState.story.moralScore = Math.max(0, Math.min(100, gameState.story.moralScore + n.moral)), gameState.story.actionStats || (gameState.story.actionStats = { totalActions: 0, positiveActions: 0, negativeActions: 0, employeesFired: 0, employeesHired: 0, giftsGiven: 0, promotionsGiven: 0, demotionsGiven: 0 }), gameState.story.actionStats.totalActions++, n.moral > 0 && gameState.story.actionStats.positiveActions++, n.moral < 0 && gameState.story.actionStats.negativeActions++, e.includes("fired") && gameState.story.actionStats.employeesFired++, e.includes("hired") && gameState.story.actionStats.employeesHired++, e.includes("gift") && gameState.story.actionStats.giftsGiven++, e.includes("promoted") && gameState.story.actionStats.promotionsGiven++, e.includes("demoted") && gameState.story.actionStats.demotionsGiven++, Math.abs(n.moral) >= 5) {
    const e2 = this.getAlignmentInfo(gameState.story.moralScore);
    console.log(`[StoryEngine] \u{1F4CA} Significant action: ${n.desc} (${n.moral > 0 ? "+" : ""}${n.moral}) \u2192 Now: ${e2.name}`);
  }
  this.checkActionConsequences(a), this.checkEmergentTriggers(a), this.checkPlayerArc(u2, a);
}, checkPlayerArc(u2, action) {
  const s = gameState.story;
  if (!s) return;
  s.narrativeFlags || (s.narrativeFlags = {});
  const before = this.getAlignmentInfo(u2), after = this.getAlignmentInfo(s.moralScore);
  if (before.name !== after.name) {
    const rising = s.moralScore > u2, G2 = action?.description ? `After you ${action.description}, the` : "The";
    this.addJournalEntry({ title: `${after.emoji} You're becoming: ${after.name}`, content: `${G2} way people read you has shifted. ${rising ? "You're drifting toward the light" : "You're drifting somewhere darker"} \u2014 they see a ${after.name.toLowerCase()} now.`, type: "player", memorable: true });
  }
  action && action.moralImpact <= -5 && !s.narrativeFlags.firstDarkDeed && (s.narrativeFlags.firstDarkDeed = true, this.addJournalEntry({ title: "\u{1F311} A Line Crossed", content: `The first time it felt easy: you ${action.description}. It won't be the last.`, type: "player", memorable: true })), action && action.moralImpact >= 5 && !s.narrativeFlags.firstGoodDeed && (s.narrativeFlags.firstGoodDeed = true, this.addJournalEntry({ title: "\u{1F305} The Better Angel", content: `You didn't have to, but you did: you ${action.description}. People noticed.`, type: "player", memorable: true }));
}, checkActionConsequences(e) {
  const t = gameState.story.actionStats, n = e.context || {};
  if (e.type.includes("fired") && gameState.story.actionLog.filter((e2) => e2.type.includes("fired") && Date.now() - e2.timestamp < 3e5).length >= 3 && !gameState.story.narrativeFlags.firing_spree_detected && (gameState.story.narrativeFlags.firing_spree_detected = true, this.addJournalEntry({ title: "\u{1F630} Whispers in the Office", content: "Three people gone in rapid succession. The remaining employees exchange nervous glances. No one feels safe anymore.", type: "consequence", memorable: true })), e.type.includes("gift") && t.giftsGiven >= 10 && !gameState.story.narrativeFlags.generous_boss && (gameState.story.narrativeFlags.generous_boss = true, this.addJournalEntry({ title: "\u{1F49D} A Reputation Forms", content: "Word spreads: you're the kind of boss who notices. Who appreciates. The little things add up to loyalty.", type: "consequence", memorable: true })), n.employeeId) {
    gameState.story.employeeTreatment || (gameState.story.employeeTreatment = {}), gameState.story.employeeTreatment[n.employeeId] || (gameState.story.employeeTreatment[n.employeeId] = { positiveActions: 0, negativeActions: 0, history: [] });
    const t2 = gameState.story.employeeTreatment[n.employeeId];
    e.moralImpact > 0 && t2.positiveActions++, e.moralImpact < 0 && t2.negativeActions++, t2.history.push({ type: e.type, timestamp: e.timestamp, impact: e.moralImpact });
  }
}, checkEmergentTriggers(e) {
  const t = gameState.story.actionStats, n = gameState.story.moralScore, a = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus);
  if (n < 20 && t.negativeActions > 10 && !gameState.story.narrativeFlags.tyranny_warning) return gameState.story.narrativeFlags.tyranny_warning = true, void this.triggerEmergentEvent("tyranny_brewing");
  if (n > 80 && t.positiveActions > 15 && !gameState.story.narrativeFlags.beloved_leader) return gameState.story.narrativeFlags.beloved_leader = true, void this.triggerEmergentEvent("beloved_leader");
  if ("promoted_employee" === e.type) {
    const e2 = a.some((e3) => (e3.stats?.trust || 50) < 40 && e3.career?.level < 3);
    if (t.promotionsGiven >= 3 && e2 && !gameState.story.narrativeFlags.promotion_jealousy_shown) return gameState.story.narrativeFlags.promotion_jealousy_shown = true, void setTimeout(() => this.triggerEmergentEvent("promotion_jealousy"), 3e3);
  }
  if (e.type.includes("gift") && e.context?.employeeName && (gameState.story.actionLog || []).filter((t2) => t2.type.includes("gift") && t2.context?.employeeName === e.context.employeeName).length >= 5 && !gameState.story.narrativeFlags.favoritism_accusation_shown) return gameState.story.narrativeFlags.favoritism_accusation_shown = true, void setTimeout(() => this.triggerEmergentEvent("favoritism_accusation"), 5e3);
  if (a.length >= 3 && a.find((e2) => (e2.stats?.productivity || 0) >= 90) && !gameState.story.narrativeFlags.rising_star_shown && Math.random() < 0.2) return gameState.story.narrativeFlags.rising_star_shown = true, void this.triggerEmergentEvent("rising_star");
  if (e.type.includes("fired") || e.type.includes("demoted")) {
    const t2 = e.context || {};
    t2.employeeLevel >= 3 && t2.employeeTrust < 40 && (gameState.story.pendingBetrayal = { employeeId: t2.employeeId, employeeName: t2.employeeName, reason: e.type, timestamp: Date.now() });
  }
  if (this.isAdultContentEnabled()) {
    const e2 = gameState.story.eventTypeCooldowns?.lastNsfwEvent || 0, t2 = 18e4;
    if (!(Date.now() - e2 < t2)) {
      const e3 = a.find((e4) => (e4.stats?.desire || 0) > 65 && (e4.stats?.affection || 0) > 55 && !gameState.story.narrativeFlags[`tension_${e4.id}`]);
      if (e3 && Math.random() < 0.15) return gameState.story.narrativeFlags[`tension_${e3.id}`] = true, gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}), gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now(), void setTimeout(() => this.triggerEmergentEvent("simmering_tension"), 2e3);
      if ((gameState.story.actionLog || []).filter((e4) => e4.type.includes("intimate")).length >= 3 && !gameState.story.narrativeFlags.office_whispers_shown && Math.random() < 0.25) return gameState.story.narrativeFlags.office_whispers_shown = true, gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}), gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now(), void setTimeout(() => this.triggerEmergentEvent("office_whispers"), 3e3);
      const t3 = a.find((e4) => (e4.memory?.intimacyLevel || 0) > 65 && (e4.stats?.affection || 0) > 75 && !gameState.story.narrativeFlags[`feelings_${e4.id}`]);
      if (t3 && Math.random() < 0.1) return gameState.story.narrativeFlags[`feelings_${t3.id}`] = true, gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}), gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now(), void setTimeout(() => this.triggerEmergentEvent("catching_feelings"), 4e3);
      const n2 = a.find((e4) => (e4.stats?.desire || 0) > 70 && (e4.stats?.trust || 0) > 65 && !gameState.story.narrativeFlags[`late_night_${e4.id}`]);
      if (n2 && Math.random() < 0.08) return gameState.story.narrativeFlags[`late_night_${n2.id}`] = true, gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}), gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now(), void setTimeout(() => this.triggerEmergentEvent("late_night"), 2e3);
      const o = a.find((e4) => (e4.stats?.trust || 0) > 75 && (e4.stats?.desire || 0) > 50 && (e4.memory?.intimacyLevel || 0) > 30 && !gameState.story.narrativeFlags[`power_play_${e4.id}`]);
      if (o && Math.random() < 0.06) return gameState.story.narrativeFlags[`power_play_${o.id}`] = true, gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}), gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now(), void setTimeout(() => this.triggerEmergentEvent("power_play"), 3e3);
      if (a.filter((e4) => e4.memory?.hasHadIntimateEncounter).length >= 2 && !gameState.story.narrativeFlags.jealousy_shown && Math.random() < 0.2) return gameState.story.narrativeFlags.jealousy_shown = true, gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}), gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now(), void setTimeout(() => this.triggerEmergentEvent("green_eyed"), 3500);
      if (a.find((e4) => (e4.stats?.affection || 0) > 45 && (e4.stats?.desire || 0) > 40 && !gameState.story.narrativeFlags.business_trip_shown && gameState.day > 30) && Math.random() < 0.04) return gameState.story.narrativeFlags.business_trip_shown = true, gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}), gameState.story.eventTypeCooldowns.lastNsfwEvent = Date.now(), void setTimeout(() => this.triggerEmergentEvent("business_trip"), 2500);
    }
  }
}, async triggerEmergentEvent(e) {
  console.log(`[StoryEngine] \u{1F31F} Emergent event triggered: ${e}`);
  const t = (gameState.story.eventTypeCooldowns || {})[e] || 0;
  if (Date.now() - t < 3e5) return void console.log(`[StoryEngine] Event type '${e}' is on cooldown, skipping`);
  if (document.getElementById("storyEventModal") || document.getElementById("actTransitionCinematic") || document.getElementById("multiStepEventModal")) return void console.log(`[StoryEngine] Modal already open, deferring event: ${e}`);
  gameState.story.eventTypeCooldowns || (gameState.story.eventTypeCooldowns = {}), gameState.story.eventTypeCooldowns[e] = Date.now();
  const n = await this.generateEmergentEvent(e);
  n && (document.getElementById("storyEventModal") || document.getElementById("actTransitionCinematic") || document.getElementById("multiStepEventModal") || gameState.story.activeSpineEvent ? (console.log(`[StoryEngine] Queueing event '${e}' - another event is active`), gameState.story.pendingEvents || (gameState.story.pendingEvents = []), gameState.story.pendingEvents.push(n), this.showStoryNotification()) : (gameState.story.activeSpineEvent = n, this.showStoryEventModal(n)), saveGame());
}, async generateEmergentEvent(e) {
  const t = gameState.story.actionStats, n = gameState.story.moralScore, a = (this.getAlignmentInfo(n), (gameState.story.actionLog || []).slice(0, 10)), o = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus), i = o.sort((e2, t2) => (t2.stats?.trust || 0) - (e2.stats?.trust || 0))[0], s = o.sort((e2, t2) => (e2.stats?.trust || 0) - (t2.stats?.trust || 0))[0], r = { tyranny_brewing: { title: "\u26A0\uFE0F Unrest", generateContent: () => {
    const e2 = t.employeesFired || 0, n2 = a.filter((e3) => e3.type.includes("fired")).map((e3) => e3.context?.employeeName).filter(Boolean);
    return { cinematicText: `The atmosphere has changed. You can feel it in the silence when you walk through the office. In the way conversations stop mid-sentence.

${e2 > 0 ? `${e2} people have been let go. ` : ""}${n2.length > 0 ? `Names like ${n2.slice(0, 2).join(" and ")} are whispered in break rooms.` : ""}

${s ? `${s.name} watches you with barely concealed hostility.` : "Eyes follow you everywhere."}

They're afraid. But fear turns to resentment. And resentment...

*Something is brewing. Your next move matters.*`, choices: [{ id: "address", text: "\u{1F4E2} Call a meeting. Clear the air.", consequence: "You decide to face this head-on.", gameplayEffect: { type: "boost_all_trust", amount: 5 } }, { id: "bonus", text: "\u{1F4B0} Surprise bonuses for everyone.", consequence: "Money talks. Maybe it can drown out the whispers.", gameplayEffect: { type: "spend_cash", amount: 5e3, boostMorale: true } }, { id: "ignore", text: "\u{1F937} They'll get over it.", consequence: "Some things fester when left alone.", gameplayEffect: { type: "decrease_all_trust", amount: 3 } }, { id: "double_down", text: "\u{1F44A} Fire anyone who complains.", consequence: "Rule through fear. It's worked for others.", gameplayEffect: { type: "mark_complainers", triggerFearMode: true } }] };
  } }, beloved_leader: { title: "\u{1F496} Something Beautiful", generateContent: () => {
    const e2 = t.giftsGiven || 0, n2 = t.promotionsGiven || 0;
    return { cinematicText: `${i ? i.name + " finds you" : "An employee finds you"} after hours, holding something behind their back.

"We, um... we all chipped in." They reveal a card, signed by everyone. And a gift\u2014nothing expensive, but clearly chosen with care.

"You didn't have to be kind to us. But you were. ${e2 > 0 ? "The gifts. " : ""}${n2 > 0 ? "The promotions that actually made sense. " : ""}The way you actually *listen*."

They look embarrassed but determined. "We just wanted you to know: we'd follow you anywhere."

*Your kindness has built something rare: genuine loyalty.*`, choices: [{ id: "humble", text: '\u{1F64F} "You all built this together. Thank you."', consequence: "Humility strengthens the bond.", gameplayEffect: { type: "boost_all_trust", amount: 10 } }, { id: "promise", text: `\u{1F31F} "This is just the beginning. We're going to do great things."`, consequence: "Your vision inspires them further.", gameplayEffect: { type: "boost_all_productivity", amount: 5 } }, { id: "party", text: `\u{1F389} "Let's celebrate! Dinner's on me!"`, consequence: "The team bonds over good food and laughter.", gameplayEffect: { type: "spend_cash", amount: 2e3, boostAffection: true } }] };
  } }, promotion_jealousy: { title: "\u{1F494} Green-Eyed Monster", generateContent: () => {
    const e2 = a.filter((e3) => "promoted_employee" === e3.type), t2 = e2[0]?.context?.employeeName || "someone", n2 = o.find((e3) => e3.name !== t2 && (e3.stats?.trust || 50) < 50);
    return { cinematicText: `${n2 ? n2.name : "An employee"} corners you in the hallway. Their voice is tight with barely-controlled emotion.

"${t2} got promoted. Again." They laugh, but there's no humor in it. "I've been here longer. I work just as hard. What does ${t2} have that I don't?"

Their eyes search your face for an answer. For validation. For *something*.

*Jealousy is a poison. How you handle this will echo through the office.*`, choices: [{ id: "validate", text: '\u{1F4AC} "Your time is coming. I see your work."', consequence: "Empty promises or genuine recognition?", gameplayEffect: { type: "boost_employee", employeeId: n2?.id, stat: "trust", amount: 15 } }, { id: "opportunity", text: `\u{1F4CB} "Actually, there's an opening I've been considering you for..."`, consequence: "You dangle a carrot. Now you'll have to deliver.", minigame: { type: "recall", title: "Read the Room", description: "Remember their strengths and pitch the right opportunity!", difficulty: "medium", perfectOutcome: { consequence: "You know exactly what they want to hear. Their eyes light up.", gameplayEffect: { type: "boost_employee", employeeId: n2?.id, stat: "trust", amount: 25 } }, successOutcome: { consequence: "You dangle a carrot. They're intrigued. Now you'll have to deliver.", gameplayEffect: { type: "unlock_ability", ability: "pending_promotion_promise" } }, partialOutcome: { consequence: "The opportunity lands, but they're skeptical. Prove it.", gameplayEffect: { type: "boost_employee", employeeId: n2?.id, stat: "trust", amount: 5 } }, failureOutcome: { consequence: "You fumble the pitch. They see right through it.", gameplayEffect: { type: "boost_employee", employeeId: n2?.id, stat: "trust", amount: -10 } } } }, { id: "honest", text: `\u{1F4CA} "Let's look at the metrics together."`, consequence: "Honesty can heal or wound. The data will decide.", gameplayEffect: { type: "boost_employee", employeeId: n2?.id, stat: "trust", amount: 5 } }, { id: "dismiss", text: `\u{1F6AA} "This isn't the time or place."`, consequence: "You shut them down. The conversation, at least.", gameplayEffect: { type: "boost_employee", employeeId: n2?.id, stat: "trust", amount: -10 } }] };
  } }, favoritism_accusation: { title: "\u2696\uFE0F The Accusation", generateContent: () => {
    const e2 = (gameState.story.actionLog || []).filter((e3) => e3.type.includes("gift")), t2 = {};
    e2.forEach((e3) => {
      const n3 = e3.context?.employeeName;
      n3 && (t2[n3] = (t2[n3] || 0) + 1);
    });
    const n2 = Object.entries(t2).sort((e3, t3) => t3[1] - e3[1])[0];
    return { cinematicText: `The email arrives anonymously, but the sentiment is clear:

*"Everyone sees it. ${n2 ? n2[0] : "someone"} gets ${n2 ? n2[1] : "several"} gifts while the rest of us get nothing. Is this company based on merit or favoritism? Are we employees or are we just... extras?"*

The message has been forwarded. People are reading it. Some are nodding along. Others are watching to see what you'll do.

*A private matter has become very public. Your response will define the culture.*`, choices: [{ id: "transparency", text: "\u{1F4E7} Send a company-wide email explaining your gift philosophy.", consequence: "Sunlight is the best disinfectant. Or is it?", minigame: { type: "precision", title: "Choose Your Words", description: "Time your response carefully. Too defensive? Too dismissive?", difficulty: "medium", perfectOutcome: { consequence: "Your message strikes the perfect balance. Honest, fair, final.", gameplayEffect: { type: "boost_all_trust", amount: 8 } }, successOutcome: { consequence: "Sunlight is the best disinfectant. The air clears.", gameplayEffect: { type: "boost_all_trust", amount: 3 } }, partialOutcome: { consequence: "Your message is received... mixed reviews.", gameplayEffect: { type: "boost_all_trust", amount: 0 } }, failureOutcome: { consequence: "Your email comes across wrong. The situation worsens.", gameplayEffect: { type: "decrease_all_trust", amount: 5 } } } }, { id: "equal_gifts", text: '\u{1F381} "Everyone gets something this month. On me."', consequence: "Equality through generosity. Your wallet feels it.", gameplayEffect: { type: "spend_cash", amount: 200 * o.length, boostMorale: true } }, { id: "private", text: "\u{1F512} Try to identify and address the sender privately.", consequence: "Some fires need to be put out quietly.", gameplayEffect: { type: "decrease_all_trust", amount: -2 } }, { id: "ignore_email", text: "\u{1F5D1}\uFE0F Ignore it. Anonymous complaints don't deserve responses.", consequence: "Silence can be interpreted many ways.", gameplayEffect: { type: "decrease_all_trust", amount: 5 } }] };
  } }, rising_star: { title: "\u2B50 The Prodigy", generateContent: () => {
    const e2 = o.sort((e3, t2) => (t2.stats?.productivity || 0) - (e3.stats?.productivity || 0))[0];
    return { cinematicText: `${e2 ? e2.name : "One of your employees"} has been producing exceptional work. Numbers that don't lie. Innovation that catches your eye.

Word reaches you: a competitor has noticed too. They're circling. Making quiet inquiries. A headhunter's business card was spotted on ${e2 ? e2.name + "'s" : "their"} desk.

*You built something valuable here. Someone wants to take it.*`, choices: [{ id: "counter_offer", text: "\u{1F4B0} Make a preemptive counter-offer. Match whatever they're thinking.", consequence: "Money can buy loyalty. For a while.", gameplayEffect: { type: "spend_cash", amount: 1e4, boostAffection: true } }, { id: "vision", text: '\u{1F5E3}\uFE0F "Let me show you where this company is going. And your role in it."', consequence: "You share your vision. They see themselves in the future.", minigame: { type: "intensity", title: "Sell the Vision", description: "Pour your passion into this pitch! Make them believe!", difficulty: "medium", perfectOutcome: { consequence: "Your passion is infectious. They're not just staying\u2014they're inspired.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "trust", amount: 30 } }, successOutcome: { consequence: "You share your vision. They see themselves in the future.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "trust", amount: 20 } }, partialOutcome: { consequence: "Your pitch lands partially. They're considering it, at least.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "trust", amount: 10 } }, failureOutcome: { consequence: "Your words fall flat. The vision doesn't connect.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "trust", amount: -5 } } } }, { id: "freedom", text: `\u{1F513} "If you want to explore other opportunities, I won't stop you."`, consequence: "Respect breeds respect. Or goodbye.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "affection", amount: 10 } }, { id: "guilt", text: `\u{1F622} "After everything we've built together? Really?"`, consequence: "Guilt is a weapon. Use it carefully.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "trust", amount: -5 } }] };
  } }, simmering_tension: { title: "\u{1F525} Simmering Tension", nsfwOnly: true, generateContent: () => {
    const e2 = o.filter((e3) => (e3.stats?.desire || 0) > 60 && (e3.stats?.affection || 0) > 50).sort((e3, t3) => (t3.stats?.desire || 0) - (e3.stats?.desire || 0))[0];
    if (!e2) return null;
    const t2 = (e2.memory?.intimacyLevel || 0) > 50;
    return { cinematicText: `You notice ${e2.name} lingering after a meeting. Everyone else has filed out, but they remain, pretending to organize papers.

${t2 ? `There's history between you. The kind that makes eye contact feel like a conversation. The kind that makes "staying late" mean something else entirely.` : "Something has shifted lately. The way they look at you has changed. Lingering glances across the office. Finding excuses to be near you."}

They finally look up, and there's no mistaking that expression. Want. Barely contained.

"I was wondering..." they start, then pause. "If you're not busy tonight..."

*The air feels charged. This is a line\u2014one you can cross, or draw.*`, choices: [{ id: "accept", text: `\u{1F525} "I'm free. Let's get out of here."`, consequence: t2 ? "You both know exactly where this is going." : "Tonight changes everything.", minigame: { type: "tension", title: "Build the Moment", description: "Hold the tension... release at the perfect moment.", difficulty: "medium", perfectOutcome: { consequence: "The timing is perfect. Electric. Unforgettable.", gameplayEffect: { type: "intimate_encounter", employeeId: e2?.id, intimacyGain: 25, affectionGain: 15 } }, successOutcome: { consequence: t2 ? "You both know exactly where this is going." : "Tonight changes everything.", gameplayEffect: { type: "intimate_encounter", employeeId: e2?.id, trackAction: t2 ? "intimate_encounter" : "first_intimate_encounter" } }, partialOutcome: { consequence: "A bit awkward, but you work through it. The chemistry is still there.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "affection", amount: 8 } }, failureOutcome: { consequence: "The moment passes. Maybe the timing wasn't right after all.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "desire", amount: 5 } } } }, { id: "tease", text: '\u{1F60F} "Depends on what you had in mind..."', consequence: "You let the tension build. Anticipation is its own reward.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "desire", amount: 15 } }, { id: "rain_check", text: '\u{1F4C5} "Not tonight. But soon."', consequence: "A promise. They'll hold you to it.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "affection", amount: 5 } }, { id: "boundary", text: '\u270B "I think we should keep things professional."', consequence: "Disappointment flickers across their face. But they nod.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "desire", amount: -20, trackAction: "respected_boundaries" } }] };
  } }, office_whispers: { title: "\u{1F440} Office Whispers", nsfwOnly: true, generateContent: () => {
    const e2 = (gameState.story.actionLog || []).filter((e3) => e3.type.includes("intimate") || e3.type.includes("seduced")), t2 = [...new Set(e2.map((e3) => e3.context?.employeeName).filter(Boolean))];
    return { cinematicText: `You overhear it in the break room. Hushed voices that go quiet when you appear.

"...saw them leave together three times this week..."
"...door was locked for an hour..."
"...${t2.length > 1 ? "wonder who else" : "everyone knows"}..."

The office has noticed your... extracurricular activities. ${t2.length > 1 ? `Multiple names are being whispered. ${t2.slice(0, 2).join(" and ")} among them.` : 1 === t2.length ? `${t2[0]}'s name keeps coming up.` : "They're speculating, even if they don't have specifics."}

*Secrets have a way of becoming currency in an office. How do you handle yours?*`, choices: [{ id: "own_it", text: '\u{1F937} "My personal life is my business."', consequence: "Confidence or arrogance? They'll decide.", gameplayEffect: { type: "boost_all_trust", amount: -2 } }, { id: "discretion", text: "\u{1F92B} Start being more... discreet.", consequence: "What they don't see, they can't gossip about.", gameplayEffect: { type: "unlock_ability", ability: "discreet_mode" } }, { id: "embrace", text: `\u{1F48B} "Life's too short to hide who you are."`, consequence: "Bold. Some admire it. Some judge it.", gameplayEffect: { type: "boost_all_productivity", amount: -3 } }, { id: "hr_meeting", text: "\u{1F4CB} Call a meeting about professionalism and boundaries.", consequence: "The irony isn't lost on anyone. But it stops the chatter.", gameplayEffect: { type: "boost_all_trust", amount: 3 } }] };
  } }, catching_feelings: { title: "\u{1F495} Catching Feelings", nsfwOnly: true, generateContent: () => {
    const e2 = o.filter((e3) => (e3.memory?.intimacyLevel || 0) > 60 && (e3.stats?.affection || 0) > 70).sort((e3, t2) => (t2.stats?.affection || 0) - (e3.stats?.affection || 0))[0];
    return e2 ? { cinematicText: `${e2.name} asks to speak with you privately. There's something different about them today. Nervous. Vulnerable.

"I need to say something before I lose my nerve." They take a breath. "What we have... I know how it started. I know what it is. But..."

Their eyes meet yours. Raw. Unguarded.

"I think I'm falling for you. Really falling. And I need to know if this is just... *fun* for you, or if there's something more."

*This is the moment where casual becomes complicated. Or ends.*`, choices: [{ id: "reciprocate", text: '\u2764\uFE0F "I feel it too. This is real for me."', consequence: "You step off the edge together.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "affection", amount: 25, trackAction: "mutual_attraction_consummated" } }, { id: "slow_down", text: '\u{1F914} "I care about you. But I need time to figure out what this is."', consequence: "Honest but uncertain. They accept it. For now.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "trust", amount: 10 } }, { id: "just_physical", text: `\u{1F614} "I'm not looking for anything serious right now."`, consequence: "The light dims in their eyes. Something breaks.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "affection", amount: -15, trackAction: "broke_heart" } }, { id: "end_it", text: '\u{1F6AA} "Maybe we should stop. Before someone gets hurt."', consequence: "You walk away. It's the kind thing to do. Doesn't make it easy.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "desire", amount: -30, trackAction: "broke_heart" } }] } : null;
  } }, late_night: { title: "\u{1F319} Late Night", nsfwOnly: true, generateContent: () => {
    const e2 = o.filter((e3) => (e3.stats?.desire || 0) > 70 && (e3.stats?.trust || 0) > 60).sort((e3, t2) => (t2.stats?.desire || 0) - (e3.stats?.desire || 0))[0];
    return e2 ? { cinematicText: `The office is empty. Just you and the glow of computer screens.

Then you hear footsteps. ${e2.name} appears at your door, jacket half-off, a bottle of wine in hand.

"I was going to leave this on your desk with a note," they say. "But then I saw your light was still on."

They step inside. Close the door. Lock it.

"We could open it now. Celebrate another successful quarter." Their voice drops. "Or we could celebrate... differently."

*It's late. No one would know. The question is what YOU want.*`, choices: [{ id: "wine", text: `\u{1F377} "Let's start with the wine and see where the night takes us."`, consequence: "Some of the best nights start with patience.", minigame: { type: "composure", title: "Savor the Moment", description: "Keep your composure... let the anticipation build naturally.", difficulty: "easy", perfectOutcome: { consequence: "The perfect balance of patience and presence. The night unfolds beautifully.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "desire", amount: 20 } }, successOutcome: { consequence: "Some of the best nights start with patience.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "desire", amount: 10 } }, partialOutcome: { consequence: "A bit awkward at first, but the wine helps.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "desire", amount: 5 } }, failureOutcome: { consequence: "You spill the wine. The moment recovers... mostly.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "affection", amount: 3 } } } }, { id: "direct", text: '\u{1F525} Pull them close. "I know exactly where this night is going."', consequence: "No pretense. No games. Just heat.", minigame: { type: "reflex", title: "Read the Signals", description: "Catch every cue. Every signal. Every invitation.", difficulty: "medium", perfectOutcome: { consequence: "Every move, perfectly timed. The chemistry is undeniable.", gameplayEffect: { type: "intimate_encounter", employeeId: e2?.id, intimacyGain: 25, affectionGain: 10 } }, successOutcome: { consequence: "No pretense. No games. Just heat.", gameplayEffect: { type: "intimate_encounter", employeeId: e2?.id, trackAction: "intimate_encounter" } }, partialOutcome: { consequence: "A bit rushed, but the passion is real.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "desire", amount: 8 } }, failureOutcome: { consequence: "The mood shifts. Maybe another time.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "affection", amount: 3 } } } }, { id: "rain_check", text: '\u{1F4C5} "Tonight I really do need to finish this. But hold that thought."', consequence: "Anticipation is a powerful thing. They leave with a promise.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "affection", amount: 5 } }, { id: "decline", text: '\u270B "I appreciate the offer, but I should probably just go home."', consequence: 'They mask disappointment with a smile. "Maybe next time."', gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "desire", amount: -10 } }] } : null;
  } }, power_play: { title: "\u26A1 Power Play", nsfwOnly: true, generateContent: () => {
    const e2 = o.filter((e3) => (e3.stats?.desire || 0) > 50 && (e3.stats?.trust || 0) > 70).sort((e3, t3) => (t3.stats?.trust || 0) - (e3.stats?.trust || 0))[0];
    if (!e2) return null;
    const t2 = e2.memory?.intimacyLevel || 0;
    return { cinematicText: `${e2.name} closes your office door and takes a deep breath.

"I've been thinking about... us. The dynamic." They're choosing their words carefully. "You're my boss. You hold power over my career, my livelihood."

A pause. They meet your eyes.

"And I find that... ${t2 > 40 ? "exciting. More than I should." : "intriguing. In ways I\\'m still figuring out."}"

They move closer. "I'm not saying I *want* you to use that power. But knowing you *could*..." Their voice trails off.

*This is complicated territory. Consent, power, desire\u2014all tangled together.*`, choices: [{ id: "reassure", text: '\u{1F49D} "I would never use my position to pressure you. What happens between us is separate."', consequence: "You draw a clear line. Power at work, equals in private.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "trust", amount: 15 } }, { id: "acknowledge", text: '\u{1F60F} "That dynamic goes both ways. You have power over me too."', consequence: "They hadn't considered that. Something shifts.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "affection", amount: 10 } }, { id: "explore", text: '\u{1F525} "If that dynamic excites you... we could explore that. Safely."', consequence: "A door opens. What lies beyond is up to both of you.", gameplayEffect: { type: "intimate_encounter", employeeId: e2?.id, context: "power_dynamic_exploration", intimacyGain: 20 } }, { id: "step_back", text: `\u26A0\uFE0F "That's exactly why maybe we shouldn't do this."`, consequence: "You prioritize ethics over desire. They respect it. Mostly.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "desire", amount: -15 } }] };
  } }, green_eyed: { title: "\u{1F49A} Green-Eyed", nsfwOnly: true, generateContent: () => {
    const e2 = (gameState.story.actionLog || []).filter((e3) => e3.type.includes("intimate")), t2 = o.filter((t3) => e2.some((e3) => e3.context?.employeeId === t3.id));
    if (t2.length < 2) return null;
    const n2 = t2.sort((e3, t3) => (t3.stats?.affection || 0) - (e3.stats?.affection || 0))[0], a2 = t2.find((e3) => e3.id !== n2?.id);
    return n2 && a2 ? { cinematicText: `${n2.name} catches you in the hallway, voice low but intense.

"I saw you with ${a2.name} yesterday. Coming out of your office. Hair messed up. Shirt untucked."

Their eyes are hurt but burning. "I thought we had something. Was I wrong? Or am I just... *one of many*?"

*This was bound to happen. Hearts get complicated when bodies don't.*`, choices: [{ id: "choose_them", text: `\u2764\uFE0F "You're right. It's been unfair to you. You're who I want."`, consequence: "You commit. But what about the others?", gameplayEffect: { type: "boost_employee", employeeId: n2?.id, stat: "affection", amount: 25 } }, { id: "honest_poly", text: `\u{1F504} "I care about you. I care about them too. I won't lie about that."`, consequence: "Radical honesty. They either accept it or they don't.", gameplayEffect: { type: "boost_employee", employeeId: n2?.id, stat: "trust", amount: 5 } }, { id: "deflect", text: '\u{1F937} "My personal life is complicated. I never promised exclusivity."', consequence: "Cold but true. Something hardens in their expression.", gameplayEffect: { type: "boost_employee", employeeId: n2?.id, stat: "affection", amount: -20 } }, { id: "end_all", text: `\u{1F6AA} "Maybe this is a sign I shouldn't be doing this with *anyone* at work."`, consequence: "The safest choice. The loneliest one too.", gameplayEffect: { type: "spread_rumors" } }] } : null;
  } }, business_trip: { title: "\u2708\uFE0F Business Trip", nsfwOnly: true, generateContent: () => {
    const e2 = o.filter((e3) => (e3.stats?.desire || 0) > 40 && (e3.stats?.affection || 0) > 40).sort((e3, t2) => (t2.stats?.desire || 0) + (t2.stats?.affection || 0) - ((e3.stats?.desire || 0) + (e3.stats?.affection || 0)))[0];
    return e2 ? { cinematicText: `An important conference is coming up. You need to send someone.

${e2.name} appears in your doorway. "I heard about the trip. I'd like to go. *With you*."

There's something in the way they say it. The conference is in a nice city. Two nights. Hotel rooms. 

Away from the office. Away from prying eyes. Away from the daily rhythms that keep things... appropriate.

"It could be good for my professional development," they add with a slight smile. "Among other things."

*A trip like this could change everything. Or nothing. Depends on what happens in those hotel hallways.*`, choices: [{ id: "together", text: '\u2708\uFE0F "Pack your bags. We leave Thursday."', consequence: "What happens on business trips stays on business trips. Usually.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "desire", amount: 20 } }, { id: "adjoining", text: `\u{1F3E8} "I'll book adjoining rooms. No promises, but... no closed doors either."`, consequence: "The implication hangs in the air. They smile knowingly.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "affection", amount: 10 } }, { id: "professional", text: '\u{1F4CB} "This trip is strictly business. Separate floors."', consequence: "Clear boundaries. Disappointed but respectful nod.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "trust", amount: 5 } }, { id: "send_else", text: `\u{1F465} "Actually, I'm sending someone else. Less... complicated."`, consequence: "You remove the temptation entirely.", gameplayEffect: { type: "boost_employee", employeeId: e2?.id, stat: "desire", amount: -10 } }] } : null;
  } } }[e];
  if (!r) return null;
  if (r.nsfwOnly && !this.isAdultContentEnabled()) return console.log(`[StoryEngine] Skipping NSFW event in SFW mode: ${e}`), null;
  const l = r.generateContent();
  return { id: `emergent_${e}_${Date.now()}`, eventKey: e, title: r.title, cinematicText: l.cinematicText, choices: l.choices, actNumber: gameState.story.currentAct, type: "emergent", timestamp: Date.now() };
}, initialize() {
  gameState.story || (gameState.story = this.getDefaultStoryState()), this.emergentCooldowns || (this.emergentCooldowns = /* @__PURE__ */ new Map());
  const e = this.getDefaultStoryState();
  for (const t2 of Object.keys(e)) void 0 === gameState.story[t2] && (gameState.story[t2] = e[t2]);
  gameState.story.settings && (gameState.story.settings.storyEnabled = Ht());
  const t = gameState.cash > 1e3 || gameState.employees.filter((e2) => e2.hired).length > 0, n = gameState.story.choicesMade > 0 || gameState.story.actData[1].spineEventsTriggered.length > 0;
  if (t && !n) {
    const e2 = this.performStoryCatchUp();
    e2.actAdvanced && console.log(`[StoryEngine] Catch-up: Advanced existing save to Act ${e2.newAct}`);
  }
  gameState.story.actData[1].startedAt || (gameState.story.actData[1].startedAt = Date.now()), console.log("[StoryEngine] Initialized. Current Act:", gameState.story.currentAct), gameState.story.activeSpineEvent ? (console.log("[StoryEngine] Found incomplete event, re-showing:", gameState.story.activeSpineEvent.eventKey), setTimeout(() => {
    gameState.story.settings.storyEnabled && gameState.story.activeSpineEvent && this.showStoryEventModal(gameState.story.activeSpineEvent);
  }, 1500)) : gameState.story.pendingEvents && gameState.story.pendingEvents.length > 0 ? (console.log("[StoryEngine] Found pending events:", gameState.story.pendingEvents.length), this.showStoryNotification()) : gameState.story.actData[1].spineEventsTriggered.includes("prologue") || 0 !== gameState.story.choicesMade || setTimeout(() => {
    gameState.story.settings.storyEnabled && Ht() && (gameState.story.currentAct > 1 ? this.showCatchUpIntro() : this.triggerSpineEvent("prologue"));
  }, 2e3);
}, performStoryCatchUp() {
  const e = { actAdvanced: false, newAct: 1, skippedEvents: [] };
  let t = 1;
  for (let e2 = 5; e2 >= 1; e2--) if (this.meetsActRequirements(e2)) {
    t = e2;
    break;
  }
  if (t > 1) {
    gameState.story.currentAct = t, e.actAdvanced = true, e.newAct = t;
    for (let n = 1; n < t; n++) {
      gameState.story.actData[n].startedAt = Date.now() - 864e5 * (t - n), gameState.story.actData[n].completedAt = Date.now() - 864e5 * (t - n - 1);
      const a = this.ACT_CONFIG[n];
      a && a.spineEvents && a.spineEvents.forEach((t2) => {
        gameState.story.actData[n].spineEventsTriggered.includes(t2) || (gameState.story.actData[n].spineEventsTriggered.push(t2), e.skippedEvents.push(t2));
      });
    }
    t >= 2 && (gameState.story.narrativeFlags.firstHireComplete = true), t >= 3 && (gameState.story.narrativeFlags.victoriaIntroduced = true, gameState.story.narrativeFlags.innerCircleFormed = true), t >= 4 && (gameState.story.narrativeFlags.betrayalDetected = true, gameState.story.narrativeFlags.actThreeClimaxed = true), gameState.story.actData[t].startedAt = Date.now(), this.estimateMoralScoreFromHistory(), this.addJournalEntry({ title: "\u{1F4DC} The Story So Far...", content: `Your journey began long before these records. Through ${t - 1} chapters of growth, challenge, and choice, you've risen to where you stand now. The past shapes you, but the future is unwritten.`, type: "act_transition", memorable: true });
  }
  return e;
}, meetsActRequirements(e) {
  const t = this.ACT_CONFIG[e];
  if (!t) return false;
  const n = t.triggerConditions;
  if (n.cash && gameState.cash < n.cash) return false;
  const a = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus).length;
  if (n.employees && a < n.employees) return false;
  if (n.locations) for (const e2 of n.locations) {
    const t2 = gameState.locations.find((t3) => t3.id === e2);
    if (!t2 || !t2.owned) return false;
  }
  return !(n.prestiges && (gameState.prestigeLevel || 0) < n.prestiges);
}, estimateMoralScoreFromHistory() {
  let e = 50;
  const t = gameState.employees.filter((e2) => "fired" === e2.employmentStatus).length, n = gameState.employees.filter((e2) => e2.hired).length;
  if (n > 0) {
    const a2 = t / n;
    a2 > 0.5 ? e -= 20 : a2 < 0.1 && (e += 10);
  }
  const a = gameState.employees.reduce((e2, t2) => e2 + (t2.giftsReceived || 0), 0);
  a > 50 ? e += 15 : a > 20 && (e += 8);
  const o = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus);
  if (o.length > 0) {
    const t2 = o.reduce((e2, t3) => e2 + (t3.stats?.trust || 50), 0) / o.length;
    t2 > 70 && (e += 10), o.reduce((e2, t3) => e2 + (t3.stats?.affection || 50), 0) / o.length > 70 && (e += 10), t2 < 30 && (e -= 15);
  }
  gameState.story.moralScore = Math.max(0, Math.min(100, e));
}, showCatchUpIntro() {
  const e = gameState.story.currentAct, t = this.ACT_CONFIG[e], n = this.getAlignmentInfo(gameState.story.moralScore), a = { id: `catch_up_intro_${Date.now()}`, title: `\u{1F4D6} ${t.title}`, cinematicText: `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
\u{1F3AC} YOUR STORY CONTINUES
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

The records speak of your rise. From humble beginnings to... this.

${t.description}

Your reputation precedes you: **${n.title}** - ${n.description}

The choices you've made have shaped your empire. The employees you've hired, fired, and inspired all tell a story\u2014even if you weren't paying attention to the narrative.

But now? Now the story gets interesting.

*Welcome to the narrative. Your actions have always mattered. Now you'll see how.*

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550`, choices: [{ id: "embrace", text: `\u{1F4DC} "Show me what I've built."`, alignment: "proud", consequence: "You embrace your legacy, whatever it may be." }, { id: "curious", text: '\u{1F50D} "What happens next?"', alignment: "curious", consequence: "The future is unwritten. That's the exciting part." }, { id: "change", text: `\u{1F504} "Maybe it's time for a change..."`, alignment: "reflective", consequence: "The past doesn't define the future. You can still choose who to become." }], imagePrompt: `corporate empire, ${t.tone}, dramatic lighting, cinematic moment, professional atmosphere`, allowAI: true, isCatchUp: true };
  gameState.story.activeSpineEvent = a, this.showStoryEventModal(a), gameState.story.actData[1].spineEventsTriggered.includes("prologue") || gameState.story.actData[1].spineEventsTriggered.push("prologue");
}, getDefaultStoryState: () => ({ currentAct: 1, actProgress: 0, totalStoryProgress: 0, activeSpineEvent: null, activeMultiStepEvent: null, generatingSpineEvent: null, activeRibEvents: [], pendingEvents: [], moralScore: 50, charismaScore: 50, ruthlessnessScore: 0, choicesMade: 0, choiceHistory: [], narrativeFlags: { firstHireComplete: false, firstBossDefeated: false, firstPrestigeComplete: false, victoriaIntroduced: false, victoriaDefeated: false, victoriaRecruited: false, betrayalDetected: false, darkPathStarted: false, whistleblowerChosen: null, innerCircleFormed: false, secretsRevealed: 0 }, keyCharacters: [], antagonists: [], allies: [], factions: { loyalists: { members: [], strength: 0, events: [] }, opportunists: { members: [], strength: 0, events: [] }, reformers: { members: [], strength: 0, events: [] }, underground: { members: [], strength: 0, events: [] } }, journal: [], persistentMemories: [], currentTimeline: 1, actData: { 1: { startedAt: null, completedAt: null, spineEventsTriggered: [], majorChoices: [] }, 2: { startedAt: null, completedAt: null, spineEventsTriggered: [], majorChoices: [] }, 3: { startedAt: null, completedAt: null, spineEventsTriggered: [], majorChoices: [] }, 4: { startedAt: null, completedAt: null, spineEventsTriggered: [], majorChoices: [] }, 5: { startedAt: null, completedAt: null, spineEventsTriggered: [], majorChoices: [] } }, emergentNarratives: { activeArcs: [], completedArcs: [], pendingMilestones: [] }, recentThemes: [], recentEmotions: [], generatedEventCount: 0, lastStoryCheck: 0, settings: { storyEnabled: true, autoShowEvents: true, dramaticPauses: true, showSubtleHints: true } }), tick() {
  if (!gameState.story?.settings?.storyEnabled || !Ht()) return;
  if (document.getElementById("storyEventModal") || document.getElementById("actTransitionCinematic") || gameState.story.activeSpineEvent || gameState.story.generatingSpineEvent) return;
  const e = Date.now();
  e - (gameState.story.lastStoryCheck || 0) < 3e4 || (gameState.story.lastStoryCheck = e, this.checkActProgression(), this.checkSpineEventTriggers(), this.checkEmergentNarratives(), this.checkMemorableMoments(), this.updateFactions(), this.updateStoryUI());
}, checkActProgression() {
  const e = gameState.story.currentAct;
  if (e >= 5) return;
  if (document.getElementById("storyEventModal") || document.getElementById("actTransitionCinematic")) return;
  const t = e + 1, n = this.ACT_CONFIG[t];
  if (!n) return;
  const a = n.triggerConditions;
  let o = true;
  a.cash && gameState.cash < a.cash && (o = false);
  const i = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus).length;
  if (a.employees && i < a.employees && (o = false), a.locations) for (const e2 of a.locations) {
    const t2 = gameState.locations.find((t3) => t3.id === e2);
    if (!t2 || !t2.owned) {
      o = false;
      break;
    }
  }
  a.prestiges && gameState.prestigeLevel < a.prestiges && (o = false), this.calculateActProgress(e), o && this.advanceToAct(t);
}, calculateActProgress(e) {
  const t = this.ACT_CONFIG[e], n = this.ACT_CONFIG[e + 1];
  if (!n) {
    const n2 = gameState.story.actData[e].spineEventsTriggered, a2 = t.spineEvents.length;
    return void (gameState.story.actProgress = Math.min(100, Math.round(n2.length / a2 * 100)));
  }
  const a = n.triggerConditions;
  let o = [];
  if (a.cash) {
    const e2 = Math.min(1, gameState.cash / a.cash);
    o.push(e2);
  }
  if (a.employees) {
    const e2 = gameState.employees.filter((e3) => e3.hired && "active" === e3.employmentStatus).length, t2 = Math.min(1, e2 / a.employees);
    o.push(t2);
  }
  if (a.locations && a.locations.length > 0) {
    const e2 = a.locations.filter((e3) => {
      const t2 = gameState.locations.find((t3) => t3.id === e3);
      return t2 && t2.owned;
    }).length / a.locations.length;
    o.push(e2);
  }
  const i = gameState.story.actData[e].spineEventsTriggered, s = t.spineEvents.length;
  s > 0 && o.push(i.length / s);
  const r = o.length > 0 ? o.reduce((e2, t2) => e2 + t2, 0) / o.length : 0;
  gameState.story.actProgress = Math.round(100 * r);
}, advanceToAct(e) {
  const t = gameState.story.currentAct;
  t !== e && (document.getElementById("actTransitionCinematic") ? console.log("[StoryEngine] Act transition already in progress, skipping") : (gameState.story.actData[t] && (gameState.story.actData[t].completedAt = Date.now()), gameState.story.currentAct = e, gameState.story.actProgress = 0, gameState.story.actData[e] && (gameState.story.actData[e].startedAt = Date.now()), console.log(`[StoryEngine] \u2728 Advanced to Act ${e}: ${this.ACT_CONFIG[e].name}`), this.generateActTransitionEvent(t, e), this.addJournalEntry({ title: `Chapter ${e}: ${this.ACT_CONFIG[e].name}`, content: this.ACT_CONFIG[e].description, type: "act_transition", memorable: true }), this.updateStoryUI(), this.showStoryNotification()));
}, checkSpineEventTriggers() {
  if (document.getElementById("storyEventModal") || document.getElementById("actTransitionCinematic") || gameState.story.activeSpineEvent || gameState.story.generatingSpineEvent) return;
  const e = gameState.story.currentAct, t = this.ACT_CONFIG[e];
  if (!t) return;
  const n = gameState.story.actData[e].spineEventsTriggered;
  for (const e2 of t.spineEvents) if (!n.includes(e2) && this.shouldTriggerSpineEvent(e2)) {
    this.triggerSpineEvent(e2);
    break;
  }
  Math.random() < 0.1 && this.checkFactionEvent(), gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus).forEach((e2) => {
    !e2.characterArc && Math.random() < 0.2 && this.generateCharacterArc(e2), e2.characterArc && !e2.characterArc.discovered && Math.random() < 0.1 && this.checkCharacterArcDiscovery(e2);
  });
}, shouldTriggerSpineEvent(e) {
  const t = gameState.story.narrativeFlags, n = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus).length;
  switch (e) {
    case "prologue":
      return true;
    case "first_hire":
      return n >= 1 && !t.firstHireComplete;
    case "first_crisis":
      return n >= 2 && gameState.cash < 500 && gameState.story.actData[1].spineEventsTriggered.includes("first_hire");
    case "garage_boss":
      return gameState.cash >= 5e3 && t.firstHireComplete;
    case "expansion_decision":
      const e2 = gameState.locations.find((e3) => "home_office" === e3.id);
      return e2 && e2.owned;
    case "victoria_intro":
      return gameState.story.actData[2].spineEventsTriggered.includes("expansion_decision") && !t.victoriaIntroduced;
    case "the_whistleblower":
      return n >= 5 && t.victoriaIntroduced;
    case "inner_circle":
      return gameState.employees.filter((e3) => e3.hired && "active" === e3.employmentStatus && (e3.stats?.affection || 0) + (e3.stats?.trust || 0) > 140).length >= 3 && !t.innerCircleFormed;
    case "factory_incident":
      const a = gameState.locations.find((e3) => "factory" === e3.id);
      return a && a.owned;
    case "the_consortium":
      return gameState.story.actData[3].spineEventsTriggered.includes("factory_incident");
    case "betrayal_arc":
      return gameState.employees.filter((e3) => e3.hired && "active" === e3.employmentStatus && (e3.stats?.trust || 50) < 40 && (e3.career?.level || 0) >= 3).length > 0 && !t.betrayalDetected;
    case "point_of_no_return":
      return gameState.story.actData[3].spineEventsTriggered.length >= 3;
    case "hidden_world":
      const o = gameState.locations.find((e3) => "headquarters" === e3.id);
      return o && o.owned && !t.hiddenWorldRevealed;
    case "price_of_entry":
      return t.hiddenWorldRevealed && !t.eliteMembershipDecided;
    case "family_secrets":
      return t.victoriaIntroduced && gameState.story.actData[4].spineEventsTriggered.length >= 1 && !t.familySecretsRevealed;
    case "judgment_day":
      return gameState.story.actData[4].spineEventsTriggered.length >= 3 && !t.actFourClimaxed;
    case "velvet_invitation":
      return 5 === gameState.story.currentAct && !t.velvetInvitationReceived;
    case "ultimate_choice":
      return t.velvetInvitationReceived && Math.abs(gameState.story.moralScore) >= 50;
    case "endings":
      return t.ultimateChoiceMade && !t.endingTriggered;
    case "victoria_returns":
      return t.victoriaIntroduced && gameState.story.currentAct >= 3 && !t.victoriaReturned && Math.random() < 0.3;
    case "victoria_joins":
      return t.victoriaReturned && !t.victoriaJoined && (gameState.story.moralScore > 20 || t.victoriaRomancePath);
    default:
      return false;
  }
}, async triggerSpineEvent(e) {
  if (!Ht()) return;
  if (console.log(`[StoryEngine] \u{1F3AD} Triggering spine event: ${e}`), gameState.story.generatingSpineEvent) return void console.log(`[StoryEngine] \u26A0\uFE0F Already generating a spine event, skipping: ${e}`);
  gameState.story.generatingSpineEvent = e;
  const t = gameState.story.currentAct;
  gameState.story.actData[t].spineEventsTriggered.includes(e) || gameState.story.actData[t].spineEventsTriggered.push(e);
  const n = await this.generateSpineEventContent(e);
  if (gameState.story.generatingSpineEvent = null, n) {
    if (gameState.story.activeSpineEvent = n, n.imagePrompt && "function" == typeof queuedGenerateImage && !n.imageUrl) {
      const t2 = n;
      (async () => {
        try {
          const a = "function" == typeof applyImageStyle ? applyImageStyle(n.imagePrompt) : n.imagePrompt, o = await queuedGenerateImage(a, `Story event: ${n.title}`);
          if (o) {
            t2.imageUrl = o, debugLog("StoryEngine", `Image generated for spine event: ${e}`);
            const n2 = document.getElementById("storyEventModal");
            if (n2) {
              const e2 = n2.querySelector("#storyEventImageSlot");
              e2 && (e2.innerHTML = `<img src="${o}" style="width:100%; max-height:300px; object-fit:cover; border-radius:12px; margin:10px 0; box-shadow:0 4px 20px var(--ab);">`);
            }
            const a2 = (gameState.story?.journal || []).find((t3) => t3.eventKey === e && t3.pending);
            a2 && (a2.imageUrl = o);
          }
        } catch (u2) {
          console.warn("[StoryEngine] Spine event image generation failed:", u2);
        }
      })();
    }
    this.addJournalEntry({ title: n.title, content: n.cinematicText.substring(0, 300) + (n.cinematicText.length > 300 ? "..." : ""), type: "spine", eventKey: e, memorable: true, pending: true, fullCinematicText: n.cinematicText, imageUrl: n.imageUrl || null }), gameState.story.settings.autoShowEvents ? this.showStoryEventModal(n) : (gameState.story.pendingEvents.push(n), this.showStoryNotification());
  }
  saveGame();
}, async generateSpineEventContent(e) {
  const t = gameState.story.currentAct, n = this.ACT_CONFIG[t], a = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus).slice(0, 5).map((e2) => ({ name: e2.name, role: e2.career?.title || "Employee", trust: e2.stats?.trust || 50, affection: e2.stats?.affection || 50 })), o = this.getEventTemplate(e);
  let i = null;
  try {
    "function" == typeof queuedGenerateText && o.allowAI && (i = await this.generateEventWithAI(e, n, a, o));
  } catch (e2) {
    console.warn("[StoryEngine] AI generation failed, using template:", e2);
  }
  return i || (i = this.createEventFromTemplate(e, o, a)), this.applySpineCasting(i), i.id = `spine_${e}_${Date.now()}`, i.eventKey = e, i.actNumber = t, i.timestamp = Date.now(), i.type = "spine", i;
}, castSpineRoles() {
  const pool = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus), u2 = { whistleblower: "a trusted colleague", loyalist: "a loyal employee", rival: "an ambitious rival", confidant: "someone close to you", employee: "an employee", employee2: "another employee" };
  if (!pool.length) return u2;
  const v = (e, k, d = 50) => e.stats?.[k] ?? d, top = (u3, from = pool) => from.slice().sort((a, b) => u3(b) - u3(a))[0], G2 = pool.filter((e) => v(e, "trust") < 50);
  return { whistleblower: top((e) => 0.6 * v(e, "trust") + 0.4 * v(e, "productivity"))?.name || u2.whistleblower, loyalist: top((e) => v(e, "trust") + v(e, "affection"))?.name || u2.loyalist, rival: top((e) => v(e, "productivity"), G2.length ? G2 : pool)?.name || u2.rival, confidant: top((e) => v(e, "affection") + v(e, "desire", 0))?.name || u2.confidant, employee: pool[0]?.name || u2.employee, employee2: pool[1]?.name || pool[0]?.name || u2.employee2 };
}, fillSpineRoles: (text, map) => text ? text.replace(/\{(whistleblower|loyalist|rival|confidant|employee2|employee)\}/g, (m, k) => map[k] || m) : text, applySpineCasting(u2) {
  if (!u2) return u2;
  const map = this.castSpineRoles();
  return u2.cinematicText && (u2.cinematicText = this.fillSpineRoles(u2.cinematicText, map)), u2.title && (u2.title = this.fillSpineRoles(u2.title, map)), (u2.choices || []).forEach((c) => {
    c.text && (c.text = this.fillSpineRoles(c.text, map)), c.consequence && (c.consequence = this.fillSpineRoles(c.consequence, map));
  }), u2;
}, getEventTemplate: (e) => ({ prologue: { title: "\u{1F305} A New Beginning", cinematicText: `The garage door creaks open, letting in a sliver of morning light. This cramped space\u2014cluttered with old boxes and forgotten dreams\u2014is about to become the birthplace of something extraordinary.

You take a deep breath. No fancy office. No investors. No safety net. Just you, a laptop, and an idea that keeps you awake at night.

*"Everyone starts somewhere,"* you think, fingers hovering over the keyboard. *"Let's see where this goes."*

The world doesn't know your name yet. But it will.`, choices: [{ id: "ambitious", text: `\u{1F4AB} "I'm going to build an empire."`, alignment: "ambitious", consequence: "Your ambition burns bright. +Charisma, but you may push too hard." }, { id: "humble", text: '\u{1F64F} "One step at a time. Stay humble."', alignment: "lawful", consequence: "Patience and humility will serve you well. +Trust with future employees." }, { id: "hungry", text: '\u{1F525} "Whatever it takes. No excuses."', alignment: "ruthless", consequence: "Your determination is unshakeable. But at what cost?" }], imagePrompt: "A cramped garage workspace at dawn, morning light streaming through dusty windows, a single laptop glowing on a makeshift desk, boxes stacked in corners, hopeful atmosphere, cinematic lighting, the beginning of a journey", allowAI: true, setFlags: [], followUpEvent: "first_hire" }, first_hire: { title: "\u{1F91D} The First Believer", cinematicText: `They stand in your garage, looking around at the "office" with an expression you can't quite read. Is it doubt? Amusement? Or... is that hope?

"So this is it, huh?" they say, taking in the folding table, the extension cords, the motivational poster you stuck on the wall (slightly crooked, you notice now).

You open your mouth to apologize, to explain, to promise that this is temporary\u2014

But they smile. Actually smile.

"I've worked in glass towers with people who had no soul. At least here..." they gesture at your modest setup, "...there's something real. Something that could actually matter."

Your first employee. Your first believer.

This changes everything.`, cinematicTextAI: "Generate an emotional scene where the player's first employee arrives at the humble garage office. Include:\n- Their reaction to the modest workspace\n- A moment where they see potential instead of poverty\n- The weight of this moment - the first person to believe in your dream\n- End with hope and determination", choices: [{ id: "partner", text: `\u{1F91D} "We're partners in this. Equals."`, alignment: "light", consequence: "They beam. This person will remember you treated them as an equal from day one." }, { id: "professional", text: `\u{1F4BC} "Welcome aboard. Let's get to work."`, alignment: "neutral", consequence: "Professional and focused. Sets clear expectations from the start." }, { id: "honest", text: `\u{1F605} "I'll be honest\u2014I have no idea what I'm doing."`, alignment: "humble", consequence: "Your vulnerability builds trust. They appreciate your honesty." }, { id: "promise", text: `\u{1F31F} "Stick with me. I'll make us both rich."`, alignment: "ambitious", consequence: "Bold promise. Now you have to deliver." }], imagePrompt: "A job interview in a garage startup, new employee looking around a humble workspace with a slight smile, morning light, folding table desk, motivational poster on wall, hopeful atmosphere, realistic, emotional moment", allowAI: true, setFlags: ["firstHireComplete"], effectOnEmployee: true }, first_crisis: { title: "\u26A0\uFE0F Sink or Swim", cinematicText: `The numbers don't lie. They never do.

You stare at your bank balance, then at the stack of bills, then back at the balance. Even with creative accounting, there's no way to make this work. You're about to miss your first payment.

Your employee looks up from their laptop. "Everything okay, boss?"

*No,* you want to say. *We might be done before we even started.*

But something in you refuses to give up. Not yet. Not like this.

This is the moment. The one that separates the dreamers from the builders. What are you willing to do to survive?`, choices: [{ id: "hustle", text: "\u{1F4AA} Double down. Work twice as hard.", alignment: "determined", consequence: "You work around the clock. Exhausting, but you might pull through." }, { id: "pivot", text: "\u{1F504} Pivot. Find a new angle.", alignment: "adaptive", consequence: "Flexibility is strength. You find an unexpected opportunity." }, { id: "risk", text: "\u{1F3B2} Take a big risk for a big reward.", alignment: "risky", consequence: "High stakes, high reward. This could make or break you." }, { id: "help", text: "\u{1F932} Ask for help. Swallow your pride.", alignment: "humble", consequence: "Reaching out takes courage. You might be surprised who believes in you." }], imagePrompt: "A stressed entrepreneur in a garage office looking at bills and a laptop with concerning numbers, dim lighting, late night, scattered papers, empty coffee cups, tense atmosphere but with determination in their eyes", allowAI: true, setFlags: [] }, garage_boss: { title: "\u{1F9B9} The Gatekeeper", cinematicText: `Word travels fast in the business world. Too fast.

You've heard the rumors\u2014someone's been watching your little operation. Someone who doesn't like newcomers on their turf. Someone who thinks they can crush you before you even get started.

And now they're here. Standing in the doorway of your garage like they own the place. Designer suit. Predator's smile. Eyes that have seen a thousand startups rise and fall.

"Cute setup," they say, voice dripping with condescension. "Very... *scrappy*."

They step closer. "Let me make this simple. This neighborhood? These clients? They're mine. Have been for years. You can walk away now with your dignity intact..."

They lean in close. "...or I can teach you why that's a mistake."

Your first real challenge. Your first real enemy.

What do you do?`, choices: [{ id: "fight", text: `\u2694\uFE0F "Bring it. I'm not going anywhere."`, alignment: "defiant", consequence: "You stare them down. This means war\u2014but you'll fight for what's yours." }, { id: "negotiate", text: `\u{1F91D} "Let's talk. Maybe we can both win."`, alignment: "diplomatic", consequence: "Looking for common ground. Risky, but could avoid a costly battle." }, { id: "outsmart", text: '\u{1F9E0} "Go ahead. Underestimate me."', alignment: "cunning", consequence: "Let them think they've won. Then strike when they least expect it." }, { id: "comply", text: '\u{1F614} "Fine. What do you want?"', alignment: "submissive", consequence: "Bowing to pressure now may haunt you later. But you survive another day." }], imagePrompt: "A tense confrontation in a garage office, an intimidating business person in an expensive suit confronting the protagonist, dramatic lighting, power dynamics, David vs Goliath scene, corporate thriller atmosphere", allowAI: true, setFlags: [], triggersBossFight: true }, expansion_decision: { title: "\u{1F3E2} Growing Pains", cinematicText: `The garage has become too small. Literally.

Your team trips over each other. Clients raise eyebrows at the "unconventional" workspace. Your biggest monitor is balanced on a stack of old textbooks.

But moving means risk. Real rent. Real commitment. Real consequences if things go wrong.

Your most trusted employee catches you staring at office listings. "What're you thinking, boss?"

You look around at the garage\u2014at every coffee stain, every late night, every small victory etched into these walls.

"I'm thinking," you say slowly, "that it's time to level up."

But how?`, choices: [{ id: "big", text: '\u{1F3E2} "Go big. Get the nicest office we can afford."', alignment: "ambitious", consequence: "First impressions matter. But can you fill those shoes?" }, { id: "smart", text: '\u{1F4CA} "Stay lean. Grow into our space."', alignment: "pragmatic", consequence: "Sustainable growth. Less flashy, but less risky." }, { id: "hybrid", text: '\u{1F4A1} "Remote-first. Spend on talent, not real estate."', alignment: "innovative", consequence: "Modern approach. Your team gains flexibility, but loses togetherness." }, { id: "wait", text: `\u23F3 "Not yet. We're not ready."`, alignment: "cautious", consequence: "Playing it safe. Sometimes the best move is no move. But will opportunity wait?" }], imagePrompt: "A crowded but successful garage startup overflowing with equipment and happy employees, contrasted with an empty modern office space visible through a window or brochure, crossroads moment, decision time", allowAI: true, setFlags: [] }, victoria_intro: { title: "\u{1F460} The Shadow Steps Forward", cinematicText: `You've heard the name whispered in board rooms and feared in break rooms. Victoria Steele. The woman who turned a small consulting firm into a corporate empire\u2014and crushed anyone who got in her way.

Now she's standing in your new office, uninvited, looking at you like a cat studying a particularly interesting mouse.

"I've been watching you," she says, circling your desk slowly. "You've got potential. Raw, unpolished potential."

She picks up a framed photo from your desk, examines it, sets it down with a dismissive flick.

"You remind me of someone. Me, actually. Twenty years ago. Before I learned that this world has no room for idealists."

She stops in front of you, and for a moment, you see something almost like respect in her eyes.

"Here's the deal. I could destroy you. Easily. But that would be boring." She smiles\u2014a sharp, dangerous thing. "Instead, I'm going to give you a choice. Join me... or become my greatest project."

"Which will it be?"`, choices: [{ id: "defy", text: `\u{1F525} "I'm not anyone's project. Bring it."`, alignment: "defiant", consequence: "You've made a powerful enemy. But you've also earned her attention." }, { id: "intrigue", text: '\u{1F914} "Tell me more about this... partnership."', alignment: "calculating", consequence: "Keep your enemies close. Very close. But can you trust her?" }, { id: "dismiss", text: `\u{1F44B} "I don't have time for games. Door's that way."`, alignment: "independent", consequence: "She laughs. Actually laughs. This isn't over." }, { id: "admire", text: `\u{1F60F} "I've heard about you. Impressive resume."`, alignment: "charismatic", consequence: "Flattery might get you everywhere. Or nowhere. With Victoria, it's hard to tell." }], imagePrompt: "A powerful intimidating businesswoman in designer clothing standing in a modern office, confident predatory stance, expensive jewelry, sharp intelligent eyes, office with city skyline behind, corporate thriller atmosphere, dramatic lighting", allowAI: true, setFlags: ["victoriaIntroduced"], introducesCharacter: "victoria_steele" }, the_whistleblower: { title: "\u2696\uFE0F The Weight of Truth", cinematicText: `The manila folder sits on your desk like a bomb.

{whistleblower}\u2014your most meticulous employee\u2014found it. Financial inconsistencies. Falsified records. The kind of evidence that could bring down people far more powerful than you.

And now they're in your office, looking at you with eyes that are equal parts scared and determined.

"I don't know how deep this goes," they whisper, glancing at the door. "But if this is real... people need to know."

You pick up the folder. The papers inside are damning. Careers would end. Empires would crumble. Maybe even yours, if you're implicated by association.

"What we do with this," {whistleblower} says quietly, "says everything about who we are."

They're right. This moment will define you.

What do you do with the truth?`, choices: [{ id: "expose", text: '\u{1F4E2} "Go public. The truth matters more than anything."', alignment: "lawful", consequence: "Reputation boost, but major political fallout. You've made dangerous enemies. {whistleblower}'s trust soars." }, { id: "bury", text: `\u{1F512} "Bury it. This isn't our fight."`, alignment: "dark", consequence: "Business continues, but {whistleblower} loses trust. Some secrets have a way of surfacing." }, { id: "investigate", text: '\u{1F50D} "Investigate privately. We need the full picture."', alignment: "neutral", consequence: "A careful approach. More information, more control\u2014but more time for things to go wrong." }, { id: "leverage", text: '\u{1F4B0} "This is leverage. Information is power."', alignment: "ruthless", consequence: "Blackmail material. Very profitable, very dangerous. {whistleblower} may never forgive you." }], imagePrompt: "A tense office scene, a worried female employee showing documents to her boss, manila folder with papers, concerned expressions, modern office with blinds partially closed, dramatic shadows, corporate thriller atmosphere", allowAI: true, setFlags: [], affectsFlag: "whistleblowerChosen" }, inner_circle: { title: "\u{1F451} The Inner Circle", cinematicText: `Something has changed. You feel it in the way certain people look at you now.

Three of your most trusted employees have started... talking. About you. About the future. About what this company could become with the right leadership.

They approach you after hours, a united front.

"We've been watching how you lead," the spokesperson says. "The decisions you make. The way you treat people. And we've decided: we believe in you."

They exchange glances, then look back at you with determination.

"We want to form your inner circle. Your advisors. Your confidants. People who will tell you the hard truths and stand with you when things get difficult."

This is a milestone moment. Having trusted advisors can change everything\u2014but it also means sharing power.

*Three people offering their complete loyalty. What does that mean to you?*`, choices: [{ id: "accept_council", text: `\u{1F91D} "I'd be honored. Let's make this official."`, alignment: "diplomatic", consequence: "You gain a council of advisors. Their combined wisdom will serve you well." }, { id: "accept_humble", text: `\u{1F64F} "I don't deserve this... but I accept."`, alignment: "humble", consequence: "Your humility touches them. The bond deepens." }, { id: "define_roles", text: `\u{1F4CB} "I accept, but let's define clear roles and boundaries."`, alignment: "pragmatic", consequence: "Structure provides clarity. The inner circle becomes a formal institution." }, { id: "decline_gently", text: '\u270B "I appreciate this, but I prefer to stand alone."', alignment: "independent", consequence: "They nod, disappointed but respectful. Some doors, once closed, stay closed." }], imagePrompt: "Three loyal employees standing together in an office, serious determined expressions, sense of unity and purpose, dramatic lighting suggesting a pivotal moment, corporate setting with warm undertones", allowAI: true, setFlags: ["innerCircleFormed"] }, factory_incident: { title: "\u26A0\uFE0F The Factory Incident", cinematicText: `The call comes at 3 AM.

"There's been an accident at the factory. Equipment malfunction. Three workers injured."

Your heart sinks as you drive through the empty streets. The factory floor is chaos\u2014paramedics, managers shouting, the acrid smell of burnt machinery.

Your lead foreman approaches, face ashen. "Boss, the equipment was due for maintenance. We flagged it six months ago. The purchase order for parts got... deprioritized."

Eyes turn to you. Everyone knows who approves the budgets.

The injured workers are being loaded into ambulances. One of them\u2014an employee you hired personally\u2014meets your gaze. No anger. Just... disappointment.

*This is on you. What happens next matters.*`, choices: [{ id: "full_responsibility", text: '\u{1F64F} "This is my fault. Full compensation, best care, whatever they need."', alignment: "lawful", consequence: "Taking responsibility costs money but earns respect. The workers appreciate your honesty." }, { id: "blame_management", text: `\u{1F449} "Who let this slip through? Someone's getting fired."`, alignment: "ruthless", consequence: "You deflect blame downward. It works, but people notice how you handle crisis." }, { id: "investigate_first", text: `\u{1F50D} "Let's understand exactly what happened before we assign blame."`, alignment: "calculating", consequence: "A measured response. The investigation will reveal uncomfortable truths." }, { id: "cover_up", text: '\u{1F512} "Keep this quiet. Settle privately with the workers."', alignment: "dark", consequence: "Secrets have a way of surfacing. But for now, the company image is preserved." }], imagePrompt: "A factory floor at night, emergency lights, workers and paramedics, damaged machinery, tense atmosphere, industrial setting with dramatic shadows, sense of crisis", allowAI: true, setFlags: ["factoryIncidentOccurred"], gameplayEffects: { full_responsibility: { type: "spend_cash", amount: 5e4 }, cover_up: { type: "add_flag", flag: "hiding_incident" } } }, the_consortium: { title: "\u{1F40D} The Consortium", cinematicText: `They call themselves "The Consortium"\u2014the five most powerful business leaders in the industry. And they've requested a meeting.

The invitation arrives on expensive paper, hand-delivered by a man in a tailored suit who waits for your response.

You've heard whispers about this group. How they've made and broken careers. How they control market forces like chess pieces. How crossing them means war.

At the meeting location\u2014a private club you didn't know existed\u2014you're shown to a oak-paneled room where five figures sit in shadow.

"We've been watching your rise," one says, voice like silk over steel. "Impressive. Perhaps too impressive. You're disrupting our... arrangements."

Another leans forward. "You have a choice. Join us\u2014accept our guidance, share in our power, follow our rules. Or..."

The pause stretches.

"...or we'll show you what happens to those who fly too close to the sun."

*This is the big leagues. Play ball, or prepare for war?*`, choices: [{ id: "join_them", text: `\u{1F91D} "I'm listening. What are your terms?"`, alignment: "calculating", consequence: "You negotiate entry into the elite. Power comes with strings attached." }, { id: "defy_openly", text: `\u{1F525} "I built this without you. I don't need you now."`, alignment: "defiant", consequence: "You declare war on the establishment. Bold. Possibly foolish." }, { id: "play_both_sides", text: `\u{1F3AD} "I'll consider it... while exploring my options."`, alignment: "cunning", consequence: "You buy time. But they're watching now." }, { id: "gather_allies", text: `\u{1F6E1}\uFE0F "I'll need to consult my people before deciding."`, alignment: "diplomatic", consequence: "You refuse to be bullied. Your inner circle's advice will be crucial." }], imagePrompt: "A shadowy boardroom in an exclusive club, five silhouettes sitting around an ornate table, dramatic lighting, sense of power and menace, corporate thriller atmosphere", allowAI: true, setFlags: ["consortiumIntroduced"] }, betrayal_arc: { title: "\u{1F5E1}\uFE0F The Betrayal", cinematicText: `The evidence is undeniable.

Someone in your inner circle\u2014someone you trusted\u2014has been feeding information to your competitors. Trade secrets. Strategic plans. Your calendar and contacts.

Your security consultant lays it out: encrypted emails, suspicious money transfers, meetings that don't appear on any schedule.

"We've narrowed it down to three possibilities," she says, sliding three dossiers across the desk. "One of them is your traitor."

You stare at the photos. People you've promoted. People you've confided in. One of them betrayed you.

The consultant waits. "How do you want to handle this? We can confront them publicly, investigate quietly, or... there are other options."

*Someone you trusted sold you out. How do you respond?*`, choices: [{ id: "public_confrontation", text: `\u{1F4E2} "Bring all three in. We'll get the truth out in the open."`, alignment: "lawful", consequence: "A dramatic confrontation. The truth will emerge, but the innocent will suffer alongside the guilty." }, { id: "quiet_investigation", text: '\u{1F50D} "Continue surveillance. I want proof before I act."', alignment: "calculating", consequence: "Patience may reveal the truth, but every day the betrayal continues." }, { id: "set_a_trap", text: '\u{1F3AD} "Feed each suspect different false information. See which leak appears."', alignment: "cunning", consequence: "A clever strategy. The traitor will reveal themselves." }, { id: "forgive_all", text: `\u{1F494} "Maybe I drove them to this. Let's talk before we accuse."`, alignment: "humble", consequence: "Compassion even for traitors? Bold\u2014or naive." }], imagePrompt: "Three employee dossiers spread on a desk, shadows and dramatic lighting, corporate thriller atmosphere, sense of suspicion and betrayal", allowAI: true, setFlags: ["betrayalDetected"] }, point_of_no_return: { title: "\u26A1 Point of No Return", cinematicText: `Everything has led to this moment.

The consortium's ultimatum expires at midnight. Your rivals are circling. The board is demanding answers. Three different crises require your attention simultaneously.

Your most trusted advisor finds you alone, staring out the window at the city lights.

"You know," they say quietly, "you could still walk away. Sell the company. Take the money. Live quietly."

They pause. "But that's not who you are, is it?"

You've fought too hard. Sacrificed too much. The person you were when you started\u2014would they recognize who you've become?

The phone rings. It's time to decide.

*This is the moment everything changes. What kind of leader will you be?*`, choices: [{ id: "fight", text: '\u2694\uFE0F "No retreat. No surrender. We fight."', alignment: "defiant", consequence: "You commit to war. Whatever comes, you'll face it head-on." }, { id: "negotiate", text: `\u{1F91D} "There's always a deal to be made. Find common ground."`, alignment: "diplomatic", consequence: "You seek peace through negotiation. Will your enemies respect it?" }, { id: "reinvent", text: `\u{1F98B} "Maybe it's time to become something new entirely."`, alignment: "innovative", consequence: "Transformation. Rebirth. Something unexpected." }, { id: "reflect", text: '\u{1FA9E} "Who have I become? Is this what I wanted?"', alignment: "humble", consequence: "A moment of introspection before the storm. Clarity can be powerful." }], imagePrompt: "A person silhouetted against a night cityscape, contemplative mood, pivotal moment, dramatic lighting, corporate drama atmosphere", allowAI: true, setFlags: ["actThreeClimaxed"] }, hidden_world: { title: "\u{1F319} The Hidden World", cinematicText: `The invitation arrives in a black envelope, sealed with wax.

Inside: coordinates. A time. And a single line: "For those who have proven their worth."

Your research reveals nothing\u2014no business, no organization, nothing tied to these coordinates. Just an abandoned warehouse on the edge of the city.

But when you arrive at the appointed time, the warehouse transforms. Hidden doors reveal an elevator that descends far deeper than should be possible.

When the doors open, you step into another world.

Crystal chandeliers. People in masks and elegant attire. Laughter and whispered secrets. The air itself feels charged with possibility and danger.

A host approaches, face hidden behind an ornate mask. "Welcome, newcomer. You've been watching us from the outside for long enough. Tonight, you see what lies beneath."

*A hidden society of power. The question is: what are you willing to do to belong?*`, choices: [{ id: "embrace_it", text: `\u{1F3AD} "Show me everything. I'm ready."`, alignment: "ambitious", consequence: "You dive into the deep end. Some doors, once opened, cannot be closed." }, { id: "observe_first", text: `\u{1F441}\uFE0F "I'll watch tonight. Learn the rules before playing."`, alignment: "calculating", consequence: "Patience is power. You gather information before committing." }, { id: "question_motives", text: '\u{1F914} "Why me? Why now?"', alignment: "pragmatic", consequence: "Good questions. The answers may not be what you expect." }, { id: "leave", text: `\u{1F6AA} "This isn't my world. I don't belong here."`, alignment: "lawful", consequence: "You walk away from temptation. But will they let you go so easily?" }], imagePrompt: "A secret underground club, masked figures in elegant attire, chandeliers, mysterious and luxurious atmosphere, hints of danger and power", allowAI: true, setFlags: ["hiddenWorldDiscovered", "darkPathStarted"] }, price_of_entry: { title: "\u{1F48E} The Price of Entry", cinematicText: `They want you to join. Officially. Permanently.

But membership requires... proof of commitment.

The masked figure slides a folder across the table. Inside: details of a task. Something morally ambiguous at best. Potentially ruinous if it becomes public.

"Everyone here has paid a price," they explain. "It binds us together. Ensures loyalty. Guarantees that secrets stay secret."

You look around the room. Powerful people\u2014politicians, executives, celebrities\u2014all watching. All having paid their own prices.

"You have one week to decide. Complete the task, join us forever. Refuse..." The figure shrugs elegantly. "Well. Let's hope you have no skeletons we might... discover."

*They're asking you to cross a line. Is power worth your soul?*`, choices: [{ id: "accept_task", text: `\u270D\uFE0F "I'll do it. Whatever it takes."`, alignment: "ruthless", consequence: "You commit to darkness. The price of power has been named and paid." }, { id: "negotiate_terms", text: `\u{1F91D} "I'll join, but I choose my own test."`, alignment: "calculating", consequence: "You bargain for better terms. Impressive, if risky." }, { id: "stall", text: '\u23F3 "I need time to consider the implications."', alignment: "cautious", consequence: "You buy time, but patience is limited here." }, { id: "refuse", text: `\u270B "No. I won't compromise who I am for membership."`, alignment: "lawful", consequence: "You refuse corruption. Noble\u2014but what happens to those who say no?" }], imagePrompt: "A folder with a mysterious task document, candlelit private room, hands in shadow, sense of Faustian bargain, elegant yet menacing", allowAI: true, setFlags: [], affectsFlag: "priceOfEntryChoice" }, family_secrets: { title: "\u{1F441}\uFE0F Family Secrets", cinematicText: `The documents arrive anonymously. But the contents shake you to your core.

Victoria Steele. Your rival. Your enemy. Your... sister?

Adoption records. Birth certificates. DNA test results. The paper trail is extensive and verified.

You share a father\u2014a man neither of you ever knew. A man who built an empire in the shadows and seeded rivals throughout the industry. Rivals who were, unknowingly, family.

Victoria's face appears on your phone. She's seen the same documents.

"Well," she says, voice unreadable. "This changes things."

Does it? You've fought her for years. She's tried to destroy you. But blood...

"We should talk," she continues. "In person. Neutral ground. Sister to... sibling."

*Your greatest rival shares your blood. What now?*`, choices: [{ id: "meet_her", text: `\u{1F91D} "Yes. We should talk. Let's finally understand each other."`, alignment: "diplomatic", consequence: "Family is family. Even when it's complicated." }, { id: "reject_revelation", text: `\u{1F512} "Blood doesn't change anything. We're still rivals."`, alignment: "defiant", consequence: "You refuse to let this change the game. But can you really ignore it?" }, { id: "investigate_further", text: '\u{1F50D} "Before we talk, I need to know everything about our father."', alignment: "calculating", consequence: "Knowledge first. There's more to this story." }, { id: "forge_alliance", text: `\u{1F451} "If we're family... imagine what we could build together."`, alignment: "ambitious", consequence: "Rivals becoming allies. The industry would tremble." }], imagePrompt: "Scattered documents revealing family secrets, photographs of two people who share features, dramatic lighting, sense of revelation and destiny", allowAI: true, setFlags: ["familySecretRevealed"], affectsFlag: "victoriaRelationship" }, judgment_day: { title: "\u2696\uFE0F Judgment Day", cinematicText: `They come for you in the morning.

Not police. Worse. A consortium of everyone you've ever wronged, united under a single banner. Investors you disappointed. Competitors you crushed. Employees you fired. Lovers you left.

They have lawyers. They have evidence. They have the ear of regulatory bodies.

"You thought you were untouchable," their leader says. "You thought your money and your power made you immune. But today, everyone you've hurt gets their say."

The charges are extensive. Some true. Some exaggerated. Some completely fabricated.

Your legal team looks grim. "We can fight this, but it will take everything. Every dollar. Every favor. And the truth about your empire will come out."

*The past has come to collect. How do you face judgment?*`, choices: [{ id: "fight_in_court", text: `\u2694\uFE0F "We fight every charge. I've built too much to lose it now."`, alignment: "defiant", consequence: "Total war. The truth will emerge\u2014all of it." }, { id: "settle_privately", text: '\u{1F4B0} "Find out what they want. Everyone has a price."', alignment: "calculating", consequence: "You negotiate peace. Expensive, but quiet." }, { id: "accept_responsibility", text: `\u{1F64F} "Where they're right, I'll own it. I've made mistakes."`, alignment: "humble", consequence: "Admitting fault shows strength. Some will forgive. Others won't." }, { id: "go_nuclear", text: '\u{1F4A3} "They want war? I have secrets about THEM too."', alignment: "ruthless", consequence: "Mutually assured destruction. If you're going down, everyone burns." }], imagePrompt: "A boardroom confrontation, angry accusers on one side, defendant on the other, legal documents, tense atmosphere, sense of reckoning", allowAI: true, setFlags: ["judgmentDayOccurred"] }, velvet_invitation: { title: "\u{1F31F} The Velvet Invitation", cinematicText: `The message appears not on paper, but woven into reality itself.

You wake to find a single line of text floating in the air above your bed, written in light: "You have been chosen."

When you reach for it, the words dissolve and reform into an address\u2014a place that shouldn't exist, in a part of the city no map shows.

Your research reveals mentions in ancient texts. Conspiracy theories. Whispers of an inner sanctum where the true masters of the world convene.

Not money masters. Not political masters. Something older. Something that has guided human civilization from shadows older than history.

The invitation is clear: come alone, at the appointed time, ready to leave everything you know behind.

*This is either the greatest opportunity of your existence\u2014or its end. There's only one way to find out.*`, choices: [{ id: "go_alone", text: `\u{1F6B6} "I've come too far to stop now. I go alone."`, alignment: "determined", consequence: "You step beyond the veil. What lies beyond... changes everything." }, { id: "bring_ally", text: `\u{1F465} "I bring my most trusted ally. Some doors shouldn't be opened alone."`, alignment: "diplomatic", consequence: "You bring backup. Will they thank you\u2014or curse you?" }, { id: "investigate_first", text: `\u{1F50D} "I need to understand what I'm walking into."`, alignment: "calculating", consequence: "Research reveals disturbing truths. Do you still go?" }, { id: "refuse_call", text: `\u{1F6AB} "Some power isn't worth having. I refuse the call."`, alignment: "humble", consequence: "You turn away from transcendence. Peace\u2014or regret?" }], imagePrompt: "Ethereal glowing text floating in a dark room, mysterious invitation, dreamlike quality, sense of cosmic significance, liminal atmosphere", allowAI: true, setFlags: ["velvetInvitationReceived"] }, ultimate_choice: { title: "\u26A1 The Ultimate Choice", cinematicText: 'You stand in a chamber that defies geometry.\n\nAround you, the accumulated weight of your choices manifests as something visible\u2014threads of light and shadow, woven into a tapestry that tells your story.\n\nA voice speaks from everywhere and nowhere: "You have shaped your fate with every decision. Now, one final choice remains."\n\nThree paths materialize before you:\n\nThe first glows with golden light\u2014ascension, power, immortality. But it requires abandoning everything human about yourself.\n\nThe second pulses with warm earth tones\u2014return to the mortal world, take your winnings, live out your days in comfort and peace.\n\nThe third shimmers with rainbow uncertainty\u2014transformation into something entirely new, neither human nor immortal, but something unprecedented.\n\n*Every choice has led here. What do you choose?*', choices: [{ id: "ascend", text: '\u{1F31F} "I choose ascension. I will become more than human."', alignment: "ambitious", consequence: "You transcend mortality. But what have you lost?" }, { id: "return", text: '\u{1F3E0} "I choose to return. Humanity is enough."', alignment: "humble", consequence: "You walk away from ultimate power. Some would call that wisdom." }, { id: "transform", text: '\u{1F98B} "I choose the third path. Something new."', alignment: "innovative", consequence: "You become unprecedented. The universe has never seen your like." }, { id: "refuse_all", text: '\u270B "I reject all choices. I forge my own path."', alignment: "defiant", consequence: "You reject destiny itself. Bold\u2014or foolish?" }], imagePrompt: "A cosmic chamber with three glowing paths, tapestry of light showing a life story, transcendent atmosphere, sense of ultimate destiny", allowAI: true, setFlags: ["ultimateChoiceMade"], affectsFlag: "endingPath" }, endings: { title: "\u{1F4D6} The End of the Beginning", cinematicText: "The story reaches its conclusion.\n\nEverything you built. Everyone you touched. Every choice that brought you here\u2014it all crystallizes into this moment.\n\nYour legacy is written. But what does it say?\n\nThe accountants will measure success in dollars. The historians in impact. But you know the true measure: the lives changed, the relationships forged, the person you became.\n\nLooking back at the journey\u2014from a cramped garage to... wherever you now stand\u2014you can finally see the pattern.\n\nWas it worth it?\n\n*There will be time for new stories. But first, honor this one. How do you reflect on your journey?*", choices: [{ id: "proud", text: '\u{1F3C6} "I have no regrets. I built something meaningful."', alignment: "determined", consequence: "Pride in accomplishment. Your legacy will inspire." }, { id: "humble_end", text: '\u{1F64F} "I made mistakes. But I tried to do right."', alignment: "humble", consequence: "Humility at the end. Perhaps the greatest wisdom." }, { id: "hungry", text: `\u{1F525} "This was just the beginning. There's more to build."`, alignment: "ambitious", consequence: "The fire still burns. New stories await." }, { id: "peaceful", text: `\u262E\uFE0F "I'm ready to rest now. It's been enough."`, alignment: "pragmatic", consequence: "Peace at last. Sometimes the greatest victory is knowing when to stop." }], imagePrompt: "A reflective scene, person looking out at vast landscape, sunset or sunrise, sense of completion and new beginning, emotional and contemplative", allowAI: true, setFlags: ["storyCompleted"], triggersEnding: true }, victoria_returns: { title: "\u{1F460} Victoria's Return", cinematicText: `You thought you'd seen the last of her.

Victoria Steele appears in your lobby, flanked by new lawyers and a predator's smile. Her empire was supposed to crumble after your last encounter. Instead, she's rebuilt\u2014stronger, leaner, angrier.

"Did you really think one defeat would stop me?" She laughs, and it's not pleasant. "I've been waiting for this moment. Planning it."

She slides a folder across your security desk. Inside: documents that could end your company. Evidence she's been collecting. Weapons she's been forging.

"But I'm not here to destroy you today," she continues. "I'm here to offer you something better. A partnership. Together, we could rule this industry. Apart..." She shrugs elegantly. "Well. You've seen what I can do."

*Victoria offers an alliance\u2014but can you trust your greatest enemy?*`, choices: [{ id: "alliance", text: `\u{1F91D} "Maybe we've been fighting the wrong war. Talk to me."`, alignment: "diplomatic", consequence: "You consider alliance with your nemesis. The enemy of my enemy..." }, { id: "defiance", text: `\u{1F525} "You want war? You'll get it. Again."`, alignment: "defiant", consequence: "Round two begins. This time, only one of you walks away." }, { id: "negotiate", text: '\u{1F4BC} "What exactly are you proposing? Details."', alignment: "calculating", consequence: "You negotiate from strength. What does she really want?" }, { id: "expose", text: `\u{1F4E2} "I'm done with threats. Let's let the public decide."`, alignment: "lawful", consequence: "You take the fight public. Transparency as weapon." }], imagePrompt: "Victoria Steele in a corporate lobby, confident and dangerous, lawyers behind her, dramatic lighting, corporate thriller atmosphere, power dynamics", allowAI: true, setFlags: [], requiresFlag: "victoriaDefeated" }, victoria_joins: { title: "\u{1F451} An Unlikely Alliance", cinematicText: `Victoria Steele stands in YOUR office now\u2014as an employee.

The irony isn't lost on either of you. She signs the contract with a wry smile.

"Don't think this makes us friends," she says, pen moving with practiced elegance. "You won. Fair and square. I respect that. And I'd rather help you build something than watch from the sidelines."

But having Victoria Steele in your organization is like having a tiger on a leash. Beautiful. Powerful. Always one wrong move from chaos.

Your other employees watch nervously. Some whisper about favoritism. Others about security risks. A few look excited\u2014having Victoria Steele on your team is a statement.

She catches your eye. "So, boss. What's my first assignment?"

*Your greatest rival is now your subordinate. How do you handle this?*`, choices: [{ id: "test_her", text: `\u{1F4AA} "The hardest challenge I have. Let's see what you're made of."`, alignment: "ambitious", consequence: "You throw her into the deep end. She either proves herself or drowns." }, { id: "integrate_slowly", text: `\u{1F4CB} "Start small. Earn the team's trust."`, alignment: "pragmatic", consequence: "A measured approach. Let her prove herself gradually." }, { id: "make_partner", text: `\u{1F91D} "Forget employee. Let's talk partnership."`, alignment: "diplomatic", consequence: "You elevate her immediately. A bold statement." }, { id: "keep_close", text: `\u{1F441}\uFE0F "You'll work directly with me. Where I can watch you."`, alignment: "calculating", consequence: "Keep your enemies closer. Trust but verify." }], imagePrompt: "Victoria Steele signing a contract in a modern office, complex expression mixing pride and acceptance, dramatic moment of alliance", allowAI: true, setFlags: ["victoriaJoined"], requiresFlag: "victoriaRecruited" } })[e] || { title: "\u{1F4DC} Untold Chapter", cinematicText: "A new chapter of your story unfolds...", choices: [{ id: "continue", text: "Continue...", alignment: "neutral", consequence: "The story continues." }], allowAI: true }, async generateEventWithAI(e, t, n, a) {
  if (!a.allowAI || "function" != typeof queuedGenerateText) return null;
  const o = gameState.story.narrativeFlags, i = `You are the MASTER STORYTELLER for an office management game. Your writing should be:
- Emotionally resonant and engaging
- Cinematic with vivid imagery
- Appropriate to the tone: ${t.tone}
- Grounded in the player's actual employees and situation

CURRENT STATE:
- Act: ${t.name}
- Company Cash: ${xu(gameState.cash)}
- Employees: ${n.map((e2) => `${e2.name} (${e2.role}, trust:${e2.trust}, affection:${e2.affection})`).join(", ")}
- Moral Score: ${gameState.story.moralScore}/100
- Story Flags: ${JSON.stringify(o)}

EVENT: "${e}"
BASE TEMPLATE TITLE: "${a.title}"
TEMPLATE MOOD/THEMES: ${a.cinematicTextAI || a.cinematicText.substring(0, 200)}

Generate a personalized version of this story moment that:
1. References actual employee names if relevant
2. Reflects the player's moral alignment so far
3. Adds unique details that make this feel fresh
4. Maintains emotional impact

RESPOND IN STRICT JSON (no markdown):
{
  "title": "Event title with emoji",
  "cinematicText": "2-4 paragraphs of evocative narrative text. Use *italics* for internal thoughts. Be vivid and emotional.",
  "choices": [
    {"id": "choice_a", "text": "Choice text with emoji", "alignment": "lawful/chaotic/light/dark/neutral/ambitious", "consequence": "Brief hint at consequences"}
  ],
  "imagePrompt": "Detailed visual description for image generation"
}`;
  try {
    const t2 = await queuedGenerateText(i, {}, `Story Event: ${e}`);
    let n2 = t2;
    const o2 = t2.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (o2) n2 = o2[1].trim();
    else {
      const e2 = t2.match(/\{[\s\S]*\}/);
      e2 && (n2 = e2[0]);
    }
    const s = JSON.parse(n2);
    return { ...a, ...s, choices: s.choices || a.choices };
  } catch (e2) {
    return console.warn("[StoryEngine] AI parsing failed:", e2), null;
  }
}, createEventFromTemplate(e, t, n) {
  let a = t.cinematicText;
  return n.length > 0 && a.includes("{employee}") && (a = a.replace(/{employee}/g, n[0].name)), { title: t.title, cinematicText: a, choices: t.choices, imagePrompt: t.imagePrompt, setFlags: t.setFlags || [], affectsFlag: t.affectsFlag };
}, ARC_TYPES: { loyalist: { name: "The Loyalist", emoji: "\u{1F6E1}\uFE0F", stages: [{ name: "Devoted", test: (e) => (e.stats?.trust || 50) >= 70 && (e.stats?.affection || 50) >= 60, beat: (e) => `${e.name} has your back without being asked. Whatever you're building, they're in.` }, { name: "Confidant", test: (e) => (e.stats?.trust || 50) >= 85 && (e.stats?.affection || 50) >= 75 && (e.stats?.friendship || 50) >= 60, beat: (e) => `${e.name} is the one you'd tell things you wouldn't put in an email. A genuine confidant now.` }, { name: "Right Hand", memorable: true, test: (e) => (e.stats?.trust || 50) >= 92 && (e.stats?.affection || 50) >= 85, beat: (e) => `${e.name} would follow you out the door if you left tomorrow. Your right hand \u2014 earned, not bought.` }] }, climber: { name: "The Climber", emoji: "\u{1F4C8}", stages: [{ name: "Ambitious", test: (e) => (e.stats?.productivity || 50) >= 75 && (e.stats?.trust || 50) < 70, beat: (e) => `${e.name} is putting in the numbers \u2014 and making sure you notice. There's an angle here.` }, { name: "Hungry", test: (e) => (e.stats?.productivity || 50) >= 85 && (e.career?.level || 1) >= 2 && (e.stats?.trust || 50) < 60, beat: (e) => `${e.name} wants more, faster. The ambition is useful \u2014 right up until it isn't.` }, { name: "Eyeing Your Chair", memorable: true, test: (e) => (e.stats?.productivity || 50) >= 90 && (e.stats?.trust || 50) < 45, beat: (e) => `${e.name} doesn't want a promotion anymore. They want your seat. Keep an eye on this one.` }] }, disillusioned: { name: "The Disillusioned", emoji: "\u{1F4A2}", stages: [{ name: "Frustrated", test: (e) => (e.stats?.trust || 50) < 45 && (e.stats?.comfort || 60) < 50, beat: (e) => `${e.name} has stopped pretending everything's fine. The frustration is showing.` }, { name: "Resentful", test: (e, c) => (e.stats?.trust || 50) < 30 && ((e.stats?.comfort || 60) < 35 || c.arrears > 0), beat: (e) => `${e.name} keeps a private ledger of every slight now. Resentment has set in.` }, { name: "Flight Risk", memorable: true, test: (e) => (e.stats?.trust || 50) < 18, beat: (e) => `${e.name} is one bad day from walking. If you want to keep them, it's now or never.` }] }, burnout: { name: "Burning Out", emoji: "\u{1F56F}\uFE0F", stages: [{ name: "Strained", test: (e) => (e.stats?.comfort || 60) < 40 && (e.stats?.productivity || 50) >= 60, beat: (e) => `${e.name} is running hot \u2014 still delivering, but the strain is visible.` }, { name: "Exhausted", test: (e) => (e.stats?.comfort || 60) < 28 && (e.stats?.productivity || 50) >= 55, beat: (e) => `${e.name} is running on fumes. The output is holding; the person underneath isn't.` }, { name: "At the Breaking Point", memorable: true, test: (e) => (e.stats?.comfort || 60) < 18, beat: (e) => `${e.name} has nothing left to give. Something's about to break \u2014 them, or their work.` }] }, rival: { name: "The Rival", emoji: "\u2694\uFE0F", stages: [{ name: "Competitive", test: (e) => (e.career?.level || 1) >= 3 && (e.stats?.productivity || 50) >= 75 && (e.stats?.trust || 50) < 55, beat: (e) => `${e.name} treats every meeting like a scoreboard. Talented, and not on your side.` }, { name: "Scheming", test: (e) => (e.career?.level || 1) >= 4 && (e.stats?.trust || 50) < 40, beat: (e) => `${e.name} is building something of their own inside your walls. Allies, leverage, options.` }, { name: "Open Challenge", memorable: true, test: (e) => (e.career?.level || 1) >= 5 && (e.stats?.trust || 50) < 30, beat: (e) => `${e.name} isn't hiding it anymore. This is a rivalry now, out in the open.` }] }, confidant: { name: "The Spark", emoji: "\u{1F497}", requiresAdult: true, stages: [{ name: "A Spark", test: (e) => (e.stats?.affection || 50) >= 65 && (e.stats?.desire || 0) >= 55, beat: (e) => `There's something between you and ${e.name} that isn't on any org chart.` }, { name: "Entangled", test: (e) => (e.stats?.affection || 50) >= 80 && (e.stats?.desire || 0) >= 70, beat: (e) => `Whatever this is with ${e.name}, it's past deniable now.` }, { name: "Devoted to You", memorable: true, test: (e) => (e.stats?.affection || 50) >= 90 && (e.stats?.desire || 0) >= 80, beat: (e) => `${e.name} is yours, completely \u2014 and everyone in the building can feel it.` }] } }, emitArcBeat(e, t, n) {
  this.addJournalEntry({ title: `${t.emoji} ${e.name}: ${n.name}`, content: n.beat(e), type: "arc", memorable: !!n.memorable });
}, getActiveArcsForEmployee: (e) => (gameState.story?.emergentNarratives?.activeArcs || []).filter((t) => t.employeeId === e), checkEmergentNarratives() {
  const en = gameState.story.emergentNarratives;
  if (!en) return;
  en.activeArcs || (en.activeArcs = []), en.completedArcs || (en.completedArcs = []);
  const u2 = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus), G2 = { arrears: gameState.payroll?.arrears?.missedCount || 0 }, adult = this.isAdultContentEnabled();
  for (const emp2 of u2) for (const u3 of Object.keys(this.ARC_TYPES)) {
    const U3 = this.ARC_TYPES[u3];
    if (U3.requiresAdult && !adult) continue;
    const existing = en.activeArcs.find((a) => a.employeeId === emp2.id && a.arcType === u3);
    if (existing) {
      const next = existing.stage + 1;
      U3.stages[next] && U3.stages[next].test(emp2, G2) && (existing.stage = next, existing.stageName = U3.stages[next].name, existing.lastAdvancedAt = gameState.time?.currentTime || Date.now(), this.emitArcBeat(emp2, U3, U3.stages[next]));
      continue;
    }
    if (!(en.activeArcs.length >= 10) && (!(en.activeArcs.filter((a) => a.employeeId === emp2.id).length >= 2) && U3.stages[0].test(emp2, G2))) {
      const t = gameState.time?.currentTime || Date.now();
      en.activeArcs.push({ id: `arc_${emp2.id}_${u3}`, arcType: u3, name: U3.name, emoji: U3.emoji, employeeId: emp2.id, employeeName: emp2.name, participants: [emp2.id, emp2.name], stage: 0, stageName: U3.stages[0].name, startedAt: t, lastAdvancedAt: t }), this.emitArcBeat(emp2, U3, U3.stages[0]);
    }
  }
  const U2 = new Set(u2.map((e) => e.id));
  en.activeArcs.some((a) => !U2.has(a.employeeId)) && (en.completedArcs.push(...en.activeArcs.filter((a) => !U2.has(a.employeeId))), en.activeArcs = en.activeArcs.filter((a) => U2.has(a.employeeId)), en.completedArcs.length > 50 && (en.completedArcs = en.completedArcs.slice(-50)));
}, momentReady(sig, days = 30) {
  gameState.story.momentCooldowns || (gameState.story.momentCooldowns = {});
  const now = gameState.time?.currentTime || Date.now(), last = gameState.story.momentCooldowns[sig];
  return !(last && now - last < 864e5 * days) && (gameState.story.momentCooldowns[sig] = now, true);
}, checkMemorableMoments() {
  if (!Ht() || !gameState.story) return;
  const pool = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus);
  if (!pool.length) return;
  const arcs = gameState.story.emergentNarratives?.activeArcs || [], u2 = (id) => pool.find((e) => e.id === id), v = (e, k, d = 50) => e?.stats?.[k] ?? d, G2 = (sig, title, content) => this.momentReady(sig) && this.addJournalEntry({ title, content, type: "moment", memorable: true }), romance = arcs.find((a) => "confidant" === a.arcType), U2 = arcs.find((a) => "loyalist" === a.arcType && (!romance || a.employeeId !== romance.employeeId));
  if (romance && U2) {
    const J3 = u2(romance.employeeId), ee3 = u2(U2.employeeId);
    J3 && ee3 && (J3.career?.level || 1) > (ee3.career?.level || 1) && G2(`fav_${J3.id}_${ee3.id}`, "\u{1F4AB} The Office Knows", `You've moved ${J3.name} up the ladder fast. ${ee3.name}\u2014loyal to you long before there was anything to be loyal to\u2014says nothing. But everyone sees it.`);
  }
  if (U2 && pool.length >= 3) {
    const J3 = u2(U2.employeeId), ee3 = pool.map((e) => e.career?.salary || 0), te3 = Math.min(...ee3);
    J3 && te3 > 0 && (J3.career?.salary || 0) === te3 && G2(`underpaid_${J3.id}`, "\u{1F4AB} Cheapest Devotion", `${J3.name} is the most loyal person in the building and the lowest paid. They've never brought it up. That's the part that should keep you awake.`);
  }
  const J2 = arcs.find((a) => "rival" === a.arcType);
  if (J2) {
    const U3 = u2(J2.employeeId), ee3 = pool.slice().sort((a, b) => v(b, "productivity") - v(a, "productivity"))[0];
    U3 && ee3 && ee3.id === U3.id && G2(`rival_top_${U3.id}`, "\u{1F4AB} The Crown Slips", `${U3.name} now out-produces everyone\u2014including the people you actually trust. The numbers are undeniable, and they know you know.`);
  }
  const ee2 = arcs.filter((a) => "disillusioned" === a.arcType && a.stage >= 1);
  ee2.length >= 3 && G2("exodus_risk", "\u{1F4AB} The Floor Tilts", `${ee2.slice(0, 3).map((a) => a.employeeName).join(", ")} are all quietly done. You can feel the ground shifting under the whole company.`);
  const te2 = arcs.find((a) => "burnout" === a.arcType);
  if (te2 && pool.length >= 4) {
    const U3 = u2(te2.employeeId), J3 = pool.slice().sort((a, b) => v(b, "productivity") - v(a, "productivity"))[0];
    U3 && J3 && J3.id === U3.id && G2(`burnout_star_${U3.id}`, "\u{1F4AB} Burning the Brightest", `${U3.name} is your best worker and your most exhausted. You're burning your brightest candle at both ends\u2014and someone's going to be left in the dark.`);
  }
  if (pool.length >= 5) {
    const u3 = pool.reduce((s, e) => s + v(e, "affection"), 0) / pool.length, U3 = pool.reduce((s, e) => s + v(e, "trust"), 0) / pool.length;
    u3 >= 80 && G2("beloved", "\u{1F4AB} They Actually Like It Here", "Walk the floor and you can feel it\u2014people genuinely want to be here, working for you. That's rare air. Don't take it for granted."), U3 <= 30 && (gameState.story.moralScore || 50) <= 25 && G2("feared", "\u{1F4AB} No One Meets Your Eyes", "The hallways have gone quiet around you. They work harder than ever. They also lie to you more than ever. Fear is a tool with a short handle.");
  }
  const ne2 = gameState.story.factions;
  if (ne2) {
    const strong = Object.keys(ne2).filter((k) => ne2[k].strength >= 3 && ne2[k].strength / pool.length >= 0.3);
    if (strong.length >= 2) {
      const two = strong.slice().sort((a, b) => ne2[b].strength - ne2[a].strength).slice(0, 2), names = two.map((k) => ne2[k].figureheadName || k);
      G2(`clash_${two.slice().sort().join("_")}`, "\u{1F4AB} Lines Are Drawn", `The ${two[0]} and the ${two[1]} are both ascendant, and the building can feel the pull. ${names[0]} and ${names[1]} have stopped pretending to get along.`);
    }
  }
}, updateFactions() {
  const u2 = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus), F = gameState.story.factions;
  for (const k of Object.keys(F)) F[k].members = [], F[k].figureheadId = null, F[k].figureheadName = null;
  const v = (e, k, d = 50) => e.stats?.[k] ?? d, G2 = (e) => "function" == typeof this.getActiveArcsForEmployee ? this.getActiveArcsForEmployee(e.id).map((a) => a.arcType) : [], arrears = gameState.payroll?.arrears?.missedCount || 0, pick = {};
  for (const e of u2) {
    const trust = v(e, "trust"), u3 = v(e, "affection"), prod = v(e, "productivity"), U3 = v(e, "comfort", 60), arcs = G2(e), has = (t) => arcs.includes(t), grey = ["private_club", "velvet_room", "inner_sanctum"].includes(e.locationId), J3 = tt && (tt(e, "questions_ethics") || tt(e, "idealist")), scores = { loyalists: 0.7 * (trust - 50) + 0.7 * (u3 - 50) + (has("loyalist") ? 30 : 0) + (has("confidant") ? 20 : 0), opportunists: 0.8 * (prod - 55) + 0.5 * (55 - trust) + (has("climber") ? 28 : 0) + (has("rival") ? 28 : 0), reformers: 0.6 * (55 - U3) + (J3 ? 35 : 0) + (has("disillusioned") ? 30 : 0) + (has("burnout") ? 18 : 0) + (arrears > 0 ? 15 : 0), underground: (grey ? 45 : 0) + (trust < 30 && prod > 70 ? 25 : 0) + (has("rival") && trust < 35 ? 15 : 0) };
    let best = null, ee2 = -1 / 0;
    for (const k of Object.keys(scores)) scores[k] > ee2 && (ee2 = scores[k], best = k);
    best && ee2 >= 35 && (F[best].members.push(e.id), (!pick[best] || ee2 > pick[best].score) && (pick[best] = { id: e.id, name: e.name, score: ee2 }));
  }
  for (const k of Object.keys(F)) F[k].strength = F[k].members.length, pick[k] && (F[k].figureheadId = pick[k].id, F[k].figureheadName = pick[k].name);
  const total = u2.length, U2 = (k) => total > 0 && F[k].strength >= 3 && F[k].strength / total >= 0.3, J2 = { incomeMult: 1, attritionMult: 1, ascendant: { loyalists: U2("loyalists"), opportunists: U2("opportunists"), reformers: U2("reformers"), underground: U2("underground") }, reformerDemand: { active: false, met: false }, underground: { active: false } };
  J2.ascendant.loyalists && (J2.attritionMult *= 0.6), J2.ascendant.opportunists && (J2.incomeMult *= 1.05, J2.attritionMult *= 1.4), J2.ascendant.reformers && (J2.reformerDemand.active = true, J2.reformerDemand.met = 0 === (gameState.payroll?.arrears?.missedCount || 0)), J2.ascendant.underground && (J2.underground.active = true), J2.incomeMult = Math.max(0.9, Math.min(1.1, J2.incomeMult)), J2.attritionMult = Math.max(0.4, Math.min(2, J2.attritionMult)), gameState.story.factionEffects = J2;
}, showStoryEventModal(e) {
  const t = document.getElementById("storyEventModal");
  if (t && t.remove(), !e || !e.choices || !Array.isArray(e.choices) || 0 === e.choices.length) return console.error("[StoryEngine] Cannot show story modal - invalid event or missing choices:", e), gameState.story.activeSpineEvent = null, void ("function" == typeof showNotification && showNotification("Story event failed to load properly. Skipping...", "warning"));
  gameState.story.activeSpineEvent && gameState.story.activeSpineEvent.id === e.id || (console.log(`[StoryEngine] Setting activeSpineEvent for modal: ${e.id} (was: ${gameState.story.activeSpineEvent?.id || "null"})`), gameState.story.activeSpineEvent = e);
  const n = document.createElement("div");
  n.id = "storyEventModal", n.className = "story-modal-overlay", n.style.cssText = "\n        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n        background: var(--bc); z-index: 100001;\n        display: flex; justify-content: center; align-items: center;\n        animation: storyFadeIn 0.8s ease-out;\n        padding: 20px; box-sizing: border-box;\n      ";
  let a = "";
  e.characters && e.characters.length > 0 && (a = ` <div style="display:flex; justify-content:center; gap:20px; margin:20px 0;"> ${e.characters.map((e2) => ` <div style="text-align:center;"> <div style="width:60px; height:60px; background:var(--f); border-radius:50%; border:2px solid var(--j); margin:0 auto 8px; display:flex; align-items:center; justify-content:center; font-size:1.5rem;">\u{1F464}</div> <div style="color:var(--b); font-size:0.85rem; font-weight:600;">${e2.name}</div> <div style="color:var(--a); font-size:0.75rem;">${e2.role || ""}</div> </div> `).join("")} </div> `);
  const o = e.choices.map((t2) => {
    const n2 = { lawful: "var(--n)", light: "var(--u)", neutral: "var(--z)", dark: "var(--l)", ruthless: "var(--dk)", ambitious: "var(--eh)", defiant: "var(--au)", humble: "#a0c4ff", charismatic: "var(--z)", calculating: "var(--bt)", pragmatic: "var(--da)", cautious: "var(--a)", independent: "var(--do)", determined: "var(--au)", adaptive: "#4cc9f0", risky: "var(--al)", submissive: "#b8b8d1", diplomatic: "var(--da)", cunning: "var(--bt)", innovative: "var(--u)" }[t2.alignment] || "var(--j)", a2 = t2.minigame && void 0 !== StoryMinigames, o2 = a2 ? StoryMinigames.GAME_TYPES[t2.minigame.type]?.icon || "\u{1F3AE}" : "", i2 = a2 ? ` <span style=" display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #667eea33, #764ba233); padding: 3px 8px; border-radius: 12px; font-size: 0.7rem; color: var(--s); margin-left: 8px; ">${o2} Skill Check</span> ` : "", s = this.getChoiceCost(t2), r = s > 0, l = !r || gameState.cash >= s, c = r ? ` <span style=" display: inline-flex; align-items: center; gap: 4px; background: ${l ? "rgba(255,107,157,0.2)" : "rgba(255,0,0,0.2)"};
            padding: 3px 8px; border-radius: 12px;
            font-size: 0.7rem; color: ${l ? "var(--v)" : "var(--ei)"};
            margin-left: 8px;
          ">\u{1F4B0} ${"function" == typeof xu ? xu(s) : "$" + s.toLocaleString()}</span> ` : "";
    return ` <button class="story-choice-btn" onclick="StoryEngine.resolveChoice('${e.id}', '${t2.id}')"
                  data-scaled-cost="${s}"
                  style="width:100%; padding:18px 20px; margin:8px 0; 
                         background:linear-gradient(135deg, rgba(15,52,96,0.9) 0%, rgba(22,33,62,0.9) 100%);
                         border:2px solid ${l ? n2 : "var(--av)"}; border-radius:12px; 
                         color:${l ? "var(--b)" : "var(--as)"}; cursor:${l ? "pointer" : "not-allowed"}; text-align:left;
                         transition:all 0.3s ease; position:relative; overflow:hidden;
                         ${l ? "" : "opacity:0.6;"}"
                  ${l ? "" : "disabled"}> <div style="position:relative; z-index:1;"> <div style="font-size:1rem; font-weight:600; margin-bottom:6px; display:flex; align-items:center; flex-wrap:wrap;"> ${t2.text}${i2}${c} </div> <div style="font-size:0.8rem; color:${l ? n2 : "var(--af)"}; opacity:0.9; font-style:italic;">${t2.consequence || ""}</div> </div> <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(90deg, ${fuocAlpha(n2, "22")} 0%, transparent 100%); opacity:0; transition:opacity 0.3s;" class="choice-hover-bg"></div> </button> `;
  }).join("");
  n.innerHTML = ` <div class="story-modal-content" style=" background:linear-gradient(180deg, var(--ae) 0%, var(--dc) 50%, var(--ae) 100%); border-radius:20px; max-width:700px; width:100%; max-height:90vh; overflow-y:auto; border:2px solid var(--j); box-shadow:0 0 100px rgba(102,126,234,0.3), 0 0 40px rgba(102,126,234,0.2); animation:storySlideUp 0.6s ease-out; "> <!-- Top bar with act indicator and close button --> <div style="padding:15px 25px; background:linear-gradient(90deg, #667eea22 0%, transparent 50%, #764ba222 100%); border-bottom:1px solid #667eea33;"> <div style="display:flex; justify-content:space-between; align-items:center;"> <div style="display:flex; align-items:center; gap:10px;"> <span style="color:var(--j); font-size:0.8rem; text-transform:uppercase; letter-spacing:2px;">ACT ${e.actNumber || gameState.story.currentAct}</span> <span style="color:var(--q);">\u2022</span> <span style="color:var(--a); font-size:0.8rem;">${this.ACT_CONFIG[e.actNumber || gameState.story.currentAct]?.name || ""}</span> </div> <div style="display:flex; align-items:center; gap:15px;"> <div style="color:var(--m); font-size:0.8rem;">\u{1F4D6} ${"spine" === e.type ? "Major Story Event" : "minor" === e.type ? "Minor Event" : "Event"}</div> <button id="closeStoryEventBtn" title="Close (you can continue later)" style=" background: var(--ba); border: 1px solid var(--r); border-radius: 50%; width: 32px; height: 32px; color: var(--e); font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; " onmouseenter="this.style.background='rgba(233,69,96,0.3)';this.style.borderColor='var(--l)';this.style.color='var(--l)';" onmouseleave="this.style.background='var(--ba)';this.style.borderColor='var(--af)';this.style.color='var(--q)';">\u2715</button> </div> </div> </div> <!-- Title --> <div style="padding:25px 30px 15px; text-align:center;"> <h1 style="margin:0; font-size:2rem; color:var(--b); text-shadow:0 2px 20px rgba(102,126,234,0.5); letter-spacing:1px;">${e.title}</h1> </div> ${a} <!-- Event image (populated async or from template) --> <div id="storyEventImageSlot" style="padding:0 30px;"> ${e.imageUrl ? `<img src="${e.imageUrl}" style="width:100%; max-height:300px; object-fit:cover; border-radius:12px; margin:10px 0; box-shadow:0 4px 20px var(--ab);">` : ""}
          </div>
          
          <!-- Cinematic text -->
          <div id="storyTextContainer" style="padding:10px 30px 25px;">
            <div id="storyText" style="color:var(--cu); font-size:1.05rem; line-height:1.8; white-space:pre-wrap; font-family:Georgia, serif;">
              ${gameState.story.settings.dramaticPauses ? "" : e.cinematicText} </div> </div> <!-- Choices --> <div id="storyChoicesContainer" style="padding:0 30px 30px; ${gameState.story.settings.dramaticPauses ? "opacity:0;" : ""}">
            ${o} <!-- Open-ended response option (unified with meta events) --> <div style="margin-top:20px; padding-top:15px; border-top:1px dashed var(--ag);"> <div style="color:var(--a); font-size:0.8rem; margin-bottom:10px; display:flex; align-items:center; gap:8px;"> <span style="color:var(--j);">\u2728</span> Or take a different approach: </div> <div style="display:flex; gap:8px;"> <input type="text" id="storyCustomResponseInput" placeholder="Type your own action..." style="flex:1; padding:14px 16px; background:var(--ae); border:2px solid var(--o); border-radius:10px; color:var(--b); font-size:0.95rem; transition: all 0.3s ease;" onfocus="this.style.borderColor='var(--j)'" onblur="this.style.borderColor='var(--ag)'" onkeypress="if(event.key==='Enter' && this.value.trim()) StoryEngine.resolveCustomResponse('${e.id}', this.value)"> <button onclick="const input = document.getElementById('storyCustomResponseInput'); if(input.value.trim()) StoryEngine.resolveCustomResponse('${e.id}', input.value);" style="padding:14px 24px; background:linear-gradient(135deg, var(--j), var(--ak)); border:none; border-radius:10px; color:var(--s); cursor:pointer; font-weight:600; transition: all 0.3s ease;" onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'"> Do it </button> </div> </div> </div> </div> `, document.body.appendChild(n);
  const i = n.querySelector("#closeStoryEventBtn");
  i && i.addEventListener("click", (e2) => {
    e2.stopPropagation(), n.style.animation = "storyFadeOut 0.3s ease-out", setTimeout(() => n.remove(), 300), "function" == typeof showNotification && showNotification("\u{1F4D6} Story event minimized - click the bell to resume", "info");
  }), n.addEventListener("click", (e2) => {
    e2.target === n && (n.style.animation = "storyFadeOut 0.3s ease-out", setTimeout(() => n.remove(), 300), "function" == typeof showNotification && showNotification("\u{1F4D6} Story event minimized - click the bell to resume", "info"));
  }), n.querySelectorAll(".story-choice-btn").forEach((e2) => {
    e2.addEventListener("mouseenter", () => {
      e2.style.transform = "translateX(5px)";
      const t2 = e2.querySelector(".choice-hover-bg");
      t2 && (t2.style.opacity = "1");
    }), e2.addEventListener("mouseleave", () => {
      e2.style.transform = "translateX(0)";
      const t2 = e2.querySelector(".choice-hover-bg");
      t2 && (t2.style.opacity = "0");
    });
  }), gameState.story.settings.dramaticPauses && this.typewriterEffect(e.cinematicText, "storyText", () => {
    const e2 = document.getElementById("storyChoicesContainer");
    e2 && (e2.style.transition = "opacity 0.5s ease", e2.style.opacity = "1");
  });
}, typewriterEffect(e, t, n) {
  const a = document.getElementById(t);
  if (!a) return;
  const o = e.replace(/\*([^*]+)\*/g, '<em style="color:var(--br);">$1</em>');
  let i = false, s = null;
  const r = () => {
    i || (i = true, s && cancelAnimationFrame(s), a.innerHTML = o, a.style.cursor = "", a.title = "", n && n());
  }, l = [];
  let c = 0;
  for (; c < o.length; ) {
    if ("<" === o[c]) {
      const e2 = o.indexOf(">", c);
      if (-1 !== e2) {
        l.push(o.substring(c, e2 + 1)), c = e2 + 1;
        continue;
      }
    }
    l.push(o[c]), c++;
  }
  let d = 0, p = "", m = 0;
  const u2 = a.closest(".story-modal-overlay, #actTransitionCinematic, #storyEventModal"), g = u2 && u2.querySelector('.story-modal-content, [style*="text-align: center"]') || a.parentElement, h = (e2) => {
    e2.target.closest("button, input, .story-choice-btn") || (g.removeEventListener("click", h), r());
  };
  setTimeout(() => {
    !i && g && (g.addEventListener("click", h), a.style.cursor = "pointer", a.title = "Click to skip text animation");
  }, 500), s = requestAnimationFrame(function e2(t2) {
    if (i) return;
    if (t2 - m < 16) return void (s = requestAnimationFrame(e2));
    m = t2;
    const n2 = Math.min(d + 4, l.length);
    for (let e3 = d; e3 < n2; e3++) p += l[e3];
    d = n2, a.innerHTML = p, d < l.length ? s = requestAnimationFrame(e2) : r();
  });
}, resolveChoice(e, t) {
  const n = gameState.story.activeSpineEvent;
  if (!n || n.id !== e) return void console.warn(`[StoryEngine] resolveChoice failed: activeSpineEvent=${n?.id || "null"}, expected=${e}`);
  const a = n.choices.find((e2) => e2.id === t);
  a ? a.minigame && void 0 !== StoryMinigames ? this.launchChoiceMinigame(n, a) : this.finalizeChoice(n, a) : console.warn(`[StoryEngine] resolveChoice failed: choice '${t}' not found in event '${e}'`);
}, async resolveCustomResponse(e, t) {
  const n = gameState.story.activeSpineEvent;
  if (!n || n.id !== e) return void console.warn(`[StoryEngine] resolveCustomResponse failed: activeSpineEvent=${n?.id || "null"}, expected=${e}`);
  if (!t || !t.trim()) return void showNotification("Please type an action first!", "warning");
  const a = document.getElementById("storyEventModal"), o = a?.querySelector('button[onclick*="resolveCustomResponse"]'), i = document.getElementById("storyCustomResponseInput");
  o && (o.disabled = true, o.innerHTML = '<span style="animation: spin 1s linear infinite; display:inline-block;">\u231B</span> Thinking...'), i && (i.disabled = true);
  try {
    const e2 = await this.generateStoryCustomOutcome(n, t.trim()), a2 = { id: "custom_" + Date.now(), text: t.trim(), consequence: e2.text, alignment: e2.alignment || "adaptive", gameplayEffect: e2.gameplayEffect || null, wasCustomResponse: true };
    if (gameState.story.customResponseHistory || (gameState.story.customResponseHistory = []), gameState.story.customResponseHistory.push({ response: t.trim(), eventTitle: n.title, outcome: e2.text, wasClever: e2.wasClever || false, timestamp: Date.now() }), gameState.story.customResponseHistory.length > 50 && (gameState.story.customResponseHistory = gameState.story.customResponseHistory.slice(-50)), e2.wasClever ? (gameState.story.cleverStreak = (gameState.story.cleverStreak || 0) + 1, gameState.story.totalCleverResponses = (gameState.story.totalCleverResponses || 0) + 1, this.checkCleverStreakMilestones()) : gameState.story.cleverStreak = 0, this.finalizeChoice(n, a2, e2), e2.wasClever) {
      const e3 = gameState.story.cleverStreak;
      setTimeout(() => {
        showNotification(e3 >= 3 ? `\u{1F525} Clever streak x${e3}! Bonus rewards unlocked!` : "\u2728 Clever approach!", "success");
      }, 1500);
    }
  } catch (e2) {
    console.error("[StoryEngine] Custom response generation failed:", e2), showNotification("Something went wrong. Try a preset choice instead.", "error"), o && (o.disabled = false, o.textContent = "Do it"), i && (i.disabled = false);
  }
}, async generateStoryCustomOutcome(e, t) {
  const n = [];
  e.involvedEmployees && e.involvedEmployees.forEach((e2) => {
    const t2 = gameState.employees.find((t3) => t3.id === e2);
    t2 && n.push(t2);
  }), e.involvedCharacters && e.involvedCharacters.forEach((e2) => {
    const t2 = gameState.employees.find((t3) => t3.name.toLowerCase() === e2.toLowerCase());
    t2 && !n.includes(t2) && n.push(t2);
  });
  const a = `In an office management game with story events, the player has chosen to take a custom action instead of the provided choices.

STORY EVENT: "${e.title}"
EVENT DESCRIPTION: ${e.cinematicText?.substring(0, 400) || e.description || "An important moment in the office..."}
EVENT TYPE: ${"spine" === e.type ? "Major Story Event" : "minor" === e.type ? "Minor Event" : "Emergent Event"}
INVOLVED CHARACTERS: ${n.map((e2) => e2.name).join(", ") || "Various employees"}

PLAYER'S CUSTOM ACTION: "${t}"

Generate a realistic, dramatic outcome for this action that fits the story tone. Consider:
- Is this action reasonable or wildly inappropriate for the situation?
- What would the realistic consequences be?
- How would the involved characters react emotionally?
- Does this show leadership, creativity, cowardice, cruelty, or something else?

AVAILABLE GAMEPLAY EFFECT TYPES (pick the most appropriate):
CONSEQUENCES (negative):
- "fine" with amount (forced cash loss, 5000-100000)
- "decrease_all_trust" with amount (5-20)
- "decrease_all_productivity" with amount (5-20)
- "disable_product" with duration in days (1-7) - shuts down production
- "employee_quits" - if action is cruel enough, someone may resign
- "random_employee_quits" - unhappy employee leaves
- "reputation_hit" with amount (5-20)
- "investigation" with duration (7-30) - regulatory scrutiny
- "temporary_debuff" with stat, multiplier (0.5-0.9), duration (3-14)

BENEFITS (positive):
- "bonus_cash" with amount (1000-50000)
- "boost_all_trust" with amount (5-20)
- "boost_all_productivity" with amount (5-20)
- "boost_all_comfort" with amount (5-15)
- "reputation_boost" with amount (5-20)
- "loyalty_boost" with duration (7-30) - prevents quitting
- "temporary_buff" with stat, multiplier (1.1-1.5), duration (3-14)
- "unlock_perk" with perkId, name, description - permanent benefit

RESPOND IN JSON:
{
  "text": "2-3 sentences describing what happens as a result of the player's action. Be dramatic and engaging.",
  "alignment": "one of: lawful, light, neutral, dark, ruthless, ambitious, defiant, humble, charismatic, calculating, pragmatic, cautious, adaptive, risky, diplomatic, cunning, innovative",
  "gameplayEffect": {"type": "effect_type_from_list", "amount": number, "duration": days_if_applicable, "reason": "brief reason"} or null for minor actions,
  "wasClever": true/false (was the response creative or smart?),
  "employeeReactions": [{"name": "Name", "reaction": "brief emotional reaction"}]
}`, o = await queuedGenerateText(a);
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
    return console.error("[StoryEngine] Failed to parse custom outcome:", e2), { text: "Your unconventional approach yields unexpected results...", alignment: "adaptive", gameplayEffect: null, wasClever: false };
  }
}, launchChoiceMinigame(e, t) {
  const n = t.minigame, a = document.getElementById("storyEventModal");
  a && (a.style.opacity = "0", a.style.pointerEvents = "none"), StoryMinigames.launchMinigame(n.type, { title: n.title || t.text, themeText: n.description || "Prove your skill!", difficulty: n.difficulty || "medium" }, (n2) => {
    this.resolveMinigameChoice(e, t, n2);
  });
}, resolveMinigameChoice(e, t, n) {
  const a = t.minigame;
  let o = { ...t };
  "perfect" === n.result && a.perfectOutcome ? (o.consequence = a.perfectOutcome.consequence || t.consequence, o.gameplayEffect = a.perfectOutcome.gameplayEffect || t.gameplayEffect, o.text = t.text + " (Perfect!)") : "success" !== n.result && "perfect" !== n.result || !a.successOutcome ? "partial" === n.result && a.partialOutcome ? (o.consequence = a.partialOutcome.consequence || "Partial success. Could have gone better.", o.gameplayEffect = a.partialOutcome.gameplayEffect || null, o.alignment = a.partialOutcome.alignment || t.alignment) : "failure" === n.result && a.failureOutcome && (o.consequence = a.failureOutcome.consequence || "That didn't go as planned...", o.gameplayEffect = a.failureOutcome.gameplayEffect || null, o.alignment = a.failureOutcome.alignment || "cautious") : (o.consequence = a.successOutcome.consequence || t.consequence, o.gameplayEffect = a.successOutcome.gameplayEffect || t.gameplayEffect), o.minigameResult = n;
  const i = document.getElementById("storyEventModal");
  i && i.remove(), this.finalizeChoice(e, o);
}, finalizeChoice(e, t) {
  console.log(`[StoryEngine] Player chose: ${t.id} (${t.alignment})`);
  const n = this.getChoiceCost(t);
  if (n > 0) {
    if (gameState.cash < n) return void ("function" == typeof showNotification && showNotification("\u274C Not enough cash!", "error"));
    gameState.cash -= n, "function" == typeof showNotification && showNotification(`\u{1F4B0} Spent ${xu ? xu(n) : "$" + n.toLocaleString()}`, "info");
  }
  if (gameState.story.choicesMade++, gameState.story.choiceHistory.push({ eventId: e.id, eventKey: e.eventKey, choiceId: t.id, alignment: t.alignment, timestamp: Date.now(), actNumber: e.actNumber, minigameResult: t.minigameResult || null }), this.applyAlignmentEffect(t.alignment), e.setFlags) for (const t2 of e.setFlags) gameState.story.narrativeFlags[t2] = true;
  e.affectsFlag && (gameState.story.narrativeFlags[e.affectsFlag] = t.id);
  const a = gameState.story.journal.find((t2) => t2.eventKey === e.eventKey && t2.pending);
  if (a) {
    const n2 = t.minigameResult ? ` [${t.minigameResult.result.toUpperCase()}]` : "";
    a.content = `${e.cinematicText.substring(0, 200)}...

\u2728 You chose: "${t.text}"${n2}

${t.consequence || ""}`, a.pending = false, a.fullCinematicText = e.cinematicText, a.choiceMade = t.text, a.choiceConsequence = t.consequence || null, a.choiceAlignment = t.alignment || null, a.imageUrl = e.imageUrl || null;
  } else this.addJournalEntry({ title: e.title, content: `You chose: "${t.text}"

${t.consequence || ""}`, type: "minor" === e.type ? "minor" : "choice", memorable: "spine" === e.type, fullCinematicText: e.cinematicText, choiceMade: t.text, choiceConsequence: t.consequence || null, choiceAlignment: t.alignment || null, imageUrl: e.imageUrl || null });
  if (e.involvedEmployees || e.involvedCharacters) {
    const n2 = e.involvedEmployees || [], a2 = e.involvedCharacters || [], o2 = gameState.employees.filter((e2) => n2.includes(e2.id) || a2.some((t2) => e2.name.toLowerCase() === t2.toLowerCase())), i = (e2, t2) => {
      let n3 = 3;
      return "spine" === t2 && (n3 += 2), "compassionate" !== e2.alignment && "kind" !== e2.alignment || (n3 += 1), "ruthless" !== e2.alignment && "cruel" !== e2.alignment || (n3 += 1), "perfect" === e2.minigameResult?.result && (n3 += 1), Math.min(n3, 7);
    }, s = i(t, e.type), r = ["compassionate", "kind", "generous", "supportive"].includes(t.alignment) ? "positive" : ["ruthless", "cruel", "cold", "manipulative"].includes(t.alignment) ? "negative" : "neutral";
    o2.forEach((n3) => {
      if ("function" == typeof ensureEmployeeMemory && ensureEmployeeMemory(n3), n3.memory || (n3.memory = {}), n3.memory.eventMemories || (n3.memory.eventMemories = []), n3.memory.eventMemories.push({ eventId: e.id, eventKey: e.eventKey, title: e.title, description: e.cinematicText?.substring(0, 200) || "", outcome: t.consequence, playerChoice: t.text, timestamp: Date.now(), type: e.type || "story", wasSpine: "spine" === e.type, emotionalWeight: s, sentiment: r, referenced: 0, canReference: true }), "spine" === e.type && gameState.story.recurringCharacters) {
        const t2 = gameState.story.recurringCharacters.find((e2) => e2.id === n3.id);
        t2 ? (t2.eventCount++, t2.lastEvent = e.eventKey) : gameState.story.recurringCharacters.push({ id: n3.id, name: n3.name, eventCount: 1, lastEvent: e.eventKey, relationship: r });
      }
      n3.memory.eventMemories.length > CAPS.EVENT_MEMORIES_PER_EMP && (n3.memory.eventMemories.sort((e2, t2) => t2.emotionalWeight - e2.emotionalWeight), n3.memory.eventMemories = n3.memory.eventMemories.slice(0, CAPS.EVENT_MEMORIES_PER_EMP), n3.memory.eventMemories.sort((e2, t2) => e2.timestamp - t2.timestamp)), this.addStoryRecapToChat(n3, e, t, r);
    });
  }
  if ("minor" === e.type) {
    const n2 = this.initializeMinorEvents(), a2 = n2.queue.findIndex((t2) => t2.id === e.id);
    -1 !== a2 && (e.resolved = true, e.chosenOption = t.id, e.outcomeText = t.consequence, n2.history.unshift(e), n2.queue.splice(a2, 1), n2.history.length > 30 && n2.history.pop()), this.trackAction(`minor_event_${e.category || "general"}`, { eventTitle: e.title, choiceId: t.id, alignment: t.alignment });
  }
  gameState.story.activeSpineEvent = null;
  const o = document.getElementById("storyEventModal");
  o && (o.style.animation = "storyFadeOut 0.5s ease-out", setTimeout(() => o.remove(), 500)), t.gameplayEffect && this.executeGameplayEffect(t.gameplayEffect), setTimeout(() => {
    this.showConsequenceToast(t);
  }, 600), this.updateStoryUI(), saveGame();
}, executeGameplayEffect(e) {
  if (!e || !e.type) return;
  console.log(`[StoryEngine] \u{1F3AE} Executing gameplay effect: ${e.type}`, e);
  const t = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus);
  switch (e.type) {
    case "boost_all_trust":
      t.forEach((t2) => {
        t2.stats && (t2.stats.trust = Math.min(100, (t2.stats.trust || 50) + e.amount));
      }), showNotification(`\u{1F4C8} Trust improved across the team (+${e.amount})`, "success");
      break;
    case "decrease_all_trust":
      t.forEach((t2) => {
        t2.stats && (t2.stats.trust = Math.max(0, (t2.stats.trust || 50) - e.amount));
      }), showNotification(`\u{1F4C9} Team trust declined (-${e.amount})`, "warning");
      break;
    case "boost_all_productivity":
      t.forEach((t2) => {
        t2.stats && (t2.stats.productivity = Math.min(100, (t2.stats.productivity || 70) + e.amount));
      }), showNotification(`\u{1F4C8} Team productivity improved (+${e.amount}%)`, "success");
      break;
    case "decrease_all_productivity":
      t.forEach((t2) => {
        t2.stats && (t2.stats.productivity = Math.max(0, (t2.stats.productivity || 70) - e.amount));
      }), showNotification(`\u{1F4C9} Team productivity declined (-${e.amount}%)`, "warning");
      break;
    case "boost_all_comfort":
      t.forEach((t2) => {
        t2.stats && (t2.stats.comfort = Math.min(100, (t2.stats.comfort || 60) + e.amount));
      }), showNotification(`\u2600\uFE0F Workplace comfort improved (+${e.amount})`, "success");
      break;
    case "decrease_all_comfort":
      t.forEach((t2) => {
        t2.stats && (t2.stats.comfort = Math.max(0, (t2.stats.comfort || 60) - e.amount));
      }), showNotification(`\u{1F327}\uFE0F Workplace comfort declined (-${e.amount})`, "warning");
      break;
    case "boost_all_affection":
      t.forEach((t2) => {
        t2.stats && (t2.stats.affection = Math.min(100, (t2.stats.affection || 20) + e.amount));
      }), showNotification(`\u{1F495} Team bonds strengthened (+${e.amount})`, "success");
      break;
    case "boost_employee":
      if (e.employeeId) {
        const t2 = gameState.employees.find((t3) => t3.id === e.employeeId);
        t2 && t2.stats && e.stat && e.amount && (t2.stats[e.stat] = Math.min(100, (t2.stats[e.stat] || 50) + e.amount), showNotification(`\u{1F4C8} ${t2.name}'s ${e.stat} increased!`, "success"));
      }
      break;
    case "decrease_employee":
      if (e.employeeId) {
        const t2 = gameState.employees.find((t3) => t3.id === e.employeeId);
        t2 && t2.stats && e.stat && e.amount && (t2.stats[e.stat] = Math.max(0, (t2.stats[e.stat] || 50) - e.amount), showNotification(`\u{1F4C9} ${t2.name}'s ${e.stat} decreased`, "warning"));
      }
      break;
    case "faction_standing": {
      const f = gameState.story?.factions?.[e.faction];
      f && f.members && (f.members.forEach((id) => {
        const m = gameState.employees.find((x) => x.id === id);
        m && m.stats && (e.trust && (m.stats.trust = Math.max(0, Math.min(100, (m.stats.trust || 50) + e.trust))), e.affection && (m.stats.affection = Math.max(0, Math.min(100, (m.stats.affection || 50) + e.affection))), e.productivity && (m.stats.productivity = Math.max(0, Math.min(100, (m.stats.productivity || 50) + e.productivity))));
      }), showNotification(`${e.trust < 0 || e.affection < 0 ? "\u{1F4C9}" : "\u{1F4C8}"} Standing shifted with the ${e.faction}.`, e.trust < 0 || e.affection < 0 ? "warning" : "success"));
      break;
    }
    case "spend_cash":
      gameState.cash >= e.amount ? (gameState.cash -= e.amount, e.boostMorale ? (t.forEach((e2) => {
        e2.stats && (e2.stats.comfort = Math.min(100, (e2.stats.comfort || 60) + 15), e2.stats.trust = Math.min(100, (e2.stats.trust || 50) + 8));
      }), showNotification(`\u{1F4B0} Spent ${xu(e.amount)} - Team morale boosted!`, "success")) : e.boostAffection ? (t.forEach((e2) => {
        e2.stats && (e2.stats.affection = Math.min(100, (e2.stats.affection || 20) + 10));
      }), showNotification(`\u{1F4B0} Spent ${xu(e.amount)} - Team bonds strengthened!`, "success")) : showNotification(`\u{1F4B0} Spent ${xu(e.amount)}`, "info")) : (showNotification(`\u274C Couldn't afford ${xu(e.amount)}!`, "error"), this.trackAction("broke_promise", { type: e.type, amount: e.amount }));
      break;
    case "fine":
    case "penalty":
      const n = e.amount || 1e4;
      gameState.cash -= n, showNotification(`\u26A0\uFE0F FINE: -${xu(n)}`, "error"), this.addJournalEntry({ title: "\u{1F4B8} Financial Penalty", content: e.reason || `The company was fined ${xu(n)}.`, type: "consequence", memorable: n >= 5e4 });
      break;
    case "bonus_cash":
    case "reward_cash":
      const a = e.amount || 5e3;
      gameState.cash += a, showNotification(`\u{1F4B5} Received ${xu(a)}!`, "success"), e.reason && this.addJournalEntry({ title: "\u{1F4B0} Financial Reward", content: e.reason, type: "benefit", memorable: a >= 25e3 });
      break;
    case "ongoing_cost":
      gameState.story.ongoingEffects || (gameState.story.ongoingEffects = []), gameState.story.ongoingEffects.push({ id: `cost_${Date.now()}`, type: "recurring_cost", amount: e.amount || 1e3, frequency: e.frequency || "daily", duration: e.duration || 7, startDay: gameState.currentDay, reason: e.reason || "Ongoing expense" }), showNotification(`\u{1F4C5} Ongoing cost: ${xu(e.amount)}/day for ${e.duration} days`, "warning");
      break;
    case "ongoing_income":
      gameState.story.ongoingEffects || (gameState.story.ongoingEffects = []), gameState.story.ongoingEffects.push({ id: `income_${Date.now()}`, type: "recurring_income", amount: e.amount || 1e3, frequency: e.frequency || "daily", duration: e.duration || 7, startDay: gameState.currentDay, reason: e.reason || "Bonus income" }), showNotification(`\u{1F4C5} Bonus income: +${xu(e.amount)}/day for ${e.duration} days!`, "success");
      break;
    case "disable_product":
      const o = e.productId ? gameState.products.find((t2) => t2.id === e.productId) : gameState.products.find((e2) => e2.running && e2.unlocked);
      o && (o.disabled = true, o.disabledUntil = gameState.currentDay + (e.duration || 3), o.disabledReason = e.reason || "Temporarily unavailable", o.running = false, showNotification(`\u{1F6AB} ${o.name} disabled for ${e.duration || 3} days!`, "error"), this.addJournalEntry({ title: `\u{1F6AB} ${o.name} Shut Down`, content: e.reason || `${o.name} has been temporarily disabled and cannot generate revenue.`, type: "consequence", memorable: true }));
      break;
    case "disable_random_product":
      const i = gameState.products.filter((e2) => e2.running && e2.unlocked && !e2.disabled);
      if (i.length > 0) {
        const t2 = i[Math.floor(Math.random() * i.length)];
        t2.disabled = true, t2.disabledUntil = gameState.currentDay + (e.duration || 3), t2.disabledReason = e.reason || "Technical issues", t2.running = false, showNotification(`\u{1F6AB} ${t2.name} disabled for ${e.duration || 3} days!`, "error");
      }
      break;
    case "boost_product":
      const s = e.productId ? gameState.products.find((t2) => t2.id === e.productId) : gameState.products.find((e2) => e2.running && e2.unlocked);
      s && (s.temporaryBoosts || (s.temporaryBoosts = []), s.temporaryBoosts.push({ multiplier: e.multiplier || 1.5, expiresDay: gameState.currentDay + (e.duration || 7), reason: e.reason || "Production boost" }), showNotification(`\u{1F680} ${s.name} production boosted ${Math.round(100 * (e.multiplier || 1.5))}% for ${e.duration || 7} days!`, "success"));
      break;
    case "production_halt":
      gameState.products.forEach((t2) => {
        t2.running && (t2.disabled = true, t2.disabledUntil = gameState.currentDay + (e.duration || 1), t2.disabledReason = e.reason || "Production halted", t2.running = false);
      }), showNotification(`\u26D4 ALL PRODUCTION HALTED for ${e.duration || 1} day(s)!`, "error"), this.addJournalEntry({ title: "\u26D4 Company-Wide Production Halt", content: e.reason || "All production has been temporarily stopped.", type: "consequence", memorable: true });
      break;
    case "employee_quits":
      const r = e.employeeId ? gameState.employees.find((t2) => t2.id === e.employeeId) : null;
      r && r.hired && "active" === r.employmentStatus && (r.employmentStatus = "resigned", r.hired = false, r.resignReason = e.reason || "Personal reasons", showNotification(`\u{1F622} ${r.name} has resigned!`, "error"), this.addJournalEntry({ title: `\u{1F44B} ${r.name} Resigned`, content: e.reason || `${r.name} has left the company.`, type: "consequence", memorable: true, involvedCharacters: [r.name] }));
      break;
    case "random_employee_quits":
      const l = t.filter((e2) => (e2.stats?.trust || 50) < 40 || (e2.stats?.comfort || 60) < 30);
      if (l.length > 0) {
        const t2 = l[Math.floor(Math.random() * l.length)];
        t2.employmentStatus = "resigned", t2.hired = false, t2.resignReason = e.reason || "Couldn't take it anymore", showNotification(`\u{1F622} ${t2.name} has quit!`, "error"), this.addJournalEntry({ title: `\u{1F44B} ${t2.name} Quit`, content: `${t2.name} couldn't take it anymore and has left the company.`, type: "consequence", memorable: true, involvedCharacters: [t2.name] });
      }
      break;
    case "mass_resignation_risk":
      const c = t.filter((e2) => (e2.stats?.trust || 50) < 30);
      let d = 0;
      c.forEach((t2) => {
        Math.random() < (e.chance || 0.3) && (t2.employmentStatus = "resigned", t2.hired = false, d++);
      }), d > 0 && (showNotification(`\u{1F631} ${d} employee(s) resigned in protest!`, "error"), this.addJournalEntry({ title: "\u{1F6A8} Mass Resignation", content: `${d} employees have resigned due to poor working conditions.`, type: "consequence", memorable: true }));
      break;
    case "employee_unavailable":
      const p = e.employeeId ? gameState.employees.find((t2) => t2.id === e.employeeId) : null;
      p && (p.unavailable = true, p.unavailableUntil = gameState.currentDay + (e.duration || 3), p.unavailableReason = e.reason || "Temporarily unavailable", showNotification(`\u{1F6AB} ${p.name} unavailable for ${e.duration || 3} days`, "warning"));
      break;
    case "bonus_hire":
      gameState.story.bonusHires || (gameState.story.bonusHires = []), gameState.story.bonusHires.push({ discount: e.discount || 1, level: e.level || 1, expires: gameState.currentDay + (e.duration || 30), reason: e.reason || "Special recruitment opportunity" }), showNotification("\u{1F381} Free hire available! Check the job market.", "success");
      break;
    case "loyalty_boost":
      gameState.story.ongoingEffects || (gameState.story.ongoingEffects = []), gameState.story.ongoingEffects.push({ id: `loyalty_${Date.now()}`, type: "quit_prevention", duration: e.duration || 14, startDay: gameState.currentDay, reason: e.reason || "High morale" }), showNotification(`\u{1F4AA} Team loyalty maxed! No one will quit for ${e.duration || 14} days.`, "success");
      break;
    case "mark_complainers":
      t.filter((e2) => e2.stats?.trust < 40).forEach((e2) => {
        e2.narrativeFlags || (e2.narrativeFlags = {}), e2.narrativeFlags.marked_complainer = true;
      }), e.triggerFearMode && (gameState.story.narrativeFlags.fear_mode = true, this.addJournalEntry({ title: "\u2620\uFE0F Rule of Fear", content: "You've chosen to lead through intimidation. Dissent will be punished.", type: "consequence", memorable: true }));
      break;
    case "reputation_hit":
      gameState.story.reputationScore = Math.max(0, (gameState.story.reputationScore || 50) - (e.amount || 10)), showNotification(`\u{1F4C9} Company reputation damaged (-${e.amount || 10})`, "warning");
      break;
    case "reputation_boost":
      gameState.story.reputationScore = Math.min(100, (gameState.story.reputationScore || 50) + (e.amount || 10)), showNotification(`\u{1F4C8} Company reputation improved (+${e.amount || 10})!`, "success");
      break;
    case "media_attention":
      gameState.story.narrativeFlags.media_watching = true, gameState.story.mediaAttentionLevel = (gameState.story.mediaAttentionLevel || 0) + 1, showNotification("\u{1F4F0} The media is paying attention to your company...", "warning");
      break;
    case "investigation":
      gameState.story.ongoingEffects || (gameState.story.ongoingEffects = []), gameState.story.ongoingEffects.push({ id: `investigation_${Date.now()}`, type: "investigation", severity: e.severity || "minor", duration: e.duration || 14, startDay: gameState.currentDay, potentialFine: e.potentialFine || 5e4, reason: e.reason || "Regulatory investigation" }), gameState.story.narrativeFlags.under_investigation = true, showNotification("\u{1F50D} Your company is under investigation!", "error"), this.addJournalEntry({ title: "\u{1F50D} Investigation Launched", content: e.reason || "Regulatory authorities have launched an investigation into the company.", type: "consequence", memorable: true });
      break;
    case "investigation_cleared":
      gameState.story.narrativeFlags.under_investigation = false, gameState.story.ongoingEffects = (gameState.story.ongoingEffects || []).filter((e2) => "investigation" !== e2.type), showNotification("\u2705 Investigation cleared! No charges filed.", "success"), this.addJournalEntry({ title: "\u2705 Investigation Cleared", content: "The investigation has concluded with no findings against the company.", type: "benefit", memorable: true });
      break;
    case "unlock_ability":
      gameState.story.unlockedAbilities || (gameState.story.unlockedAbilities = []), gameState.story.unlockedAbilities.includes(e.ability) || (gameState.story.unlockedAbilities.push(e.ability), showNotification(`\u{1F513} New ability: ${e.ability}`, "success"));
      break;
    case "unlock_perk":
      gameState.story.companyPerks || (gameState.story.companyPerks = []), gameState.story.companyPerks.find((t2) => t2.id === e.perkId) || (gameState.story.companyPerks.push({ id: e.perkId, name: e.name || "Special Perk", description: e.description || "A special company benefit", effect: e.perkEffect || {} }), showNotification(`\u{1F31F} New perk unlocked: ${e.name}!`, "success"), this.addJournalEntry({ title: `\u{1F31F} Perk Unlocked: ${e.name}`, content: e.description || "A new permanent benefit for the company.", type: "benefit", memorable: true }));
      break;
    case "temporary_buff":
      gameState.story.ongoingEffects || (gameState.story.ongoingEffects = []), gameState.story.ongoingEffects.push({ id: `buff_${Date.now()}`, type: "buff", stat: e.stat || "productivity", multiplier: e.multiplier || 1.2, duration: e.duration || 7, startDay: gameState.currentDay, reason: e.reason || "Temporary boost" }), showNotification(`\u2B06\uFE0F ${e.stat || "Productivity"} boosted ${Math.round(100 * (e.multiplier || 1.2))}% for ${e.duration || 7} days!`, "success");
      break;
    case "temporary_debuff":
      gameState.story.ongoingEffects || (gameState.story.ongoingEffects = []), gameState.story.ongoingEffects.push({ id: `debuff_${Date.now()}`, type: "debuff", stat: e.stat || "productivity", multiplier: e.multiplier || 0.8, duration: e.duration || 7, startDay: gameState.currentDay, reason: e.reason || "Temporary penalty" }), showNotification(`\u2B07\uFE0F ${e.stat || "Productivity"} reduced to ${Math.round(100 * (e.multiplier || 0.8))}% for ${e.duration || 7} days`, "warning");
      break;
    case "intimate_encounter":
      if (this.isAdultContentEnabled() && e.employeeId) {
        const t2 = gameState.employees.find((t3) => t3.id === e.employeeId);
        if (t2) {
          t2.memory || (t2.memory = {}), t2.memory.intimacyLevel = Math.min(100, (t2.memory.intimacyLevel || 0) + (e.intimacyGain || 15));
          const n2 = !t2.memory.hasHadIntimateEncounter;
          t2.memory.hasHadIntimateEncounter = true, this.trackAction(n2 ? "first_intimate_encounter" : "intimate_encounter", { employeeId: t2.id, employeeName: t2.name, intimacyLevel: t2.memory.intimacyLevel, context: e.context || "private_moment" }), t2.stats && (t2.stats.affection = Math.min(100, (t2.stats.affection || 20) + (e.affectionGain || 8)), t2.stats.desire = Math.max(0, (t2.stats.desire || 50) - 15), false !== e.wasConsensual ? t2.stats.trust = Math.min(100, (t2.stats.trust || 50) + 5) : (t2.stats.trust = Math.max(0, (t2.stats.trust || 50) - 20), this.trackAction("coerced_intimacy", { employeeId: t2.id, employeeName: t2.name }))), this.addJournalEntry({ title: this.getContentVariant({ nsfw: `\u{1F48B} Private Moment with ${t2.name}`, sfw: `\u{1F49D} Special Connection with ${t2.name}` }), content: this.getContentVariant({ nsfw: e.nsfwJournalText || `You and ${t2.name} shared an intimate moment.`, sfw: `You and ${t2.name} have grown much closer.` }), type: "relationship", memorable: n2 });
        }
      }
      break;
    case "boost_desire":
      if (this.isAdultContentEnabled() && e.employeeId) {
        const t2 = gameState.employees.find((t3) => t3.id === e.employeeId);
        t2 && t2.stats && (t2.stats.desire = Math.min(100, (t2.stats.desire || 30) + (e.amount || 10)));
      }
      break;
    case "spread_rumors":
      this.isAdultContentEnabled() && (t.forEach((e2) => {
        if (e2.stats) {
          const t2 = Math.random();
          t2 < 0.4 ? e2.stats.desire = Math.min(100, (e2.stats.desire || 30) + 8) : t2 >= 0.7 && (e2.stats.trust = Math.max(0, (e2.stats.trust || 50) - 5));
        }
      }), gameState.story.narrativeFlags.rumors_spreading = true);
      break;
    default:
      console.warn(`[StoryEngine] Unknown gameplay effect type: ${e.type}`);
  }
  saveGame(false);
}, processOngoingEffects() {
  if (!gameState.story?.ongoingEffects) return;
  const e = gameState.currentDay, t = [];
  gameState.story.ongoingEffects.forEach((n) => {
    if (e - n.startDay >= n.duration) t.push(n);
    else switch (n.type) {
      case "recurring_cost":
        gameState.cash -= n.amount;
        break;
      case "recurring_income":
        gameState.cash += n.amount;
        break;
      case "investigation":
        Math.random() < 0.05 && (gameState.cash -= n.potentialFine, showNotification(`\u2696\uFE0F Investigation concluded: Fined ${xu(n.potentialFine)}`, "error"), t.push(n), gameState.story.narrativeFlags.under_investigation = false);
    }
  }), t.forEach((e2) => {
    const t2 = gameState.story.ongoingEffects.indexOf(e2);
    -1 !== t2 && (gameState.story.ongoingEffects.splice(t2, 1), "buff" !== e2.type && "debuff" !== e2.type || showNotification(`\u23F0 ${e2.reason || "Temporary effect"} has ended`, "info"));
  }), gameState.products.forEach((t2) => {
    t2.disabled && t2.disabledUntil <= e && (t2.disabled = false, delete t2.disabledUntil, delete t2.disabledReason, showNotification(`\u2705 ${t2.name} is operational again!`, "success")), t2.temporaryBoosts && (t2.temporaryBoosts = t2.temporaryBoosts.filter((t3) => t3.expiresDay > e));
  }), gameState.employees.forEach((t2) => {
    t2.unavailable && t2.unavailableUntil <= e && (t2.unavailable = false, delete t2.unavailableUntil, delete t2.unavailableReason, showNotification(`\u2705 ${t2.name} is back!`, "success"));
  }), "function" == typeof invalidateCashPerSecond && invalidateCashPerSecond();
}, getProductMultiplier(e) {
  let t = 1;
  return e.disabled ? 0 : (e.temporaryBoosts && e.temporaryBoosts.forEach((e2) => {
    t *= e2.multiplier;
  }), t);
}, CLEVER_STREAK_MILESTONES: { 3: { perk: "quick_thinker", name: "Quick Thinker", bonus: "Suggested actions now appear in events", reward: { type: "boost_all_trust", amount: 5 } }, 5: { perk: "silver_tongue", name: "Silver Tongue", bonus: "+10% chance of favorable outcomes", reward: { type: "bonus_cash", amount: 5e3 } }, 7: { perk: "master_improviser", name: "Master Improviser", bonus: "Custom responses have greater impact", reward: { type: "reputation_boost", amount: 10 } }, 10: { perk: "legendary_wit", name: "Legendary Wit", bonus: "Unlock special dialogue options everywhere", reward: { type: "unlock_perk", perkId: "legendary_wit", name: "Legendary Wit", description: "Your reputation for cleverness precedes you" } } }, checkCleverStreakMilestones() {
  const e = gameState.story.cleverStreak || 0;
  gameState.story.unlockedResponsePerks || (gameState.story.unlockedResponsePerks = []);
  for (const [t, n] of Object.entries(this.CLEVER_STREAK_MILESTONES)) e >= parseInt(t) && !gameState.story.unlockedResponsePerks.includes(n.perk) && (gameState.story.unlockedResponsePerks.push(n.perk), this.executeGameplayEffect(n.reward), setTimeout(() => {
    this.showMilestoneAchievement(n);
  }, 2e3), this.addJournalEntry({ title: `\u{1F3C6} ${n.name}`, content: `Your clever thinking has earned you a new perk: ${n.bonus}`, type: "achievement", memorable: true }));
}, MULTI_STEP_EVENTS: { company_retreat: { id: "company_retreat", title: "\u{1F3D6}\uFE0F The Company Retreat", description: "A multi-day getaway with your team. Your choices throughout will shape team dynamics.", theme: "team_building", mood: "adventure", totalSteps: 5, requiredEmployees: 3, unlockConditions: { minEmployees: 5, minCash: 5e4, minAct: 2 }, themeColor: "var(--da)", steps: [{ id: "beach_volleyball", stepNumber: 1, title: "\u{1F3D0} Beach Volleyball", cinematicText: `The resort beach stretches before you, golden sand meeting crystal waves. Your team has split into two groups, eyeing each other competitively.

"Boss, you're the tiebreaker!" someone calls out. The employees watch expectantly\u2014will you show off, play fair, or sit this one out?`, choices: [{ id: "play_competitively", text: "Play to win - show them how it's done", consequence: "You spike the ball like your bonus depends on it", alignment: "ambitious", minigame: { type: "precision", difficulty: "medium", label: "Athletic Prowess" }, stepScore: { success: 3, failure: 1 } }, { id: "play_for_fun", text: "Play for fun - let others shine", consequence: "You make everyone look good, especially yourself", alignment: "humble", stepScore: 2 }, { id: "coach_from_sidelines", text: "Coach from the sidelines with drinks", consequence: "Strategic delegation is still leadership, right?", alignment: "calculating", stepScore: 1 }, { id: "make_it_interesting", text: 'Make it "interesting" with a wager', consequence: "The stakes just got higher...", alignment: "risky", stepScore: { betting: true, range: [0, 4] } }] }, { id: "team_brunch", stepNumber: 2, title: "\u{1F373} Team Brunch Drama", cinematicText: "Morning light streams into the resort restaurant. Your team is gathered around a long table when suddenly {employee1} and {employee2} start arguing about a work incident.\n\nThe tension is palpable. Other diners are starting to look. What do you do?", choices: [{ id: "mediate_calmly", text: "Mediate calmly - this is a team-building exercise", consequence: "You channel your inner diplomat", alignment: "diplomatic", minigame: { type: "composure", difficulty: "medium", label: "Diplomatic Touch" }, stepScore: { success: 3, failure: 1 } }, { id: "side_with_one", text: "Take {employee1}'s side decisively", consequence: "Sometimes leaders need to pick sides", alignment: "calculating", stepScore: 2, consequence_flag: "sided_with_employee1" }, { id: "make_them_hug", text: "Force them to hug it out right now", consequence: "Mandatory friendship achieved?", alignment: "charismatic", stepScore: 1 }, { id: "order_shots", text: "Order a round of shots to defuse tension", consequence: "Alcohol: the universal workplace lubricant", alignment: "risky", stepScore: 2, cost: 500 }] }, { id: "sauna_secrets", stepNumber: 3, title: "\u{1F9D6} Sauna Confessions", cinematicText: `The steam is thick in the private sauna. It's just you and a few key employees when {employee3} starts opening up about something serious\u2014they've been offered a job at a competitor.

"I haven't decided yet," they admit, looking at you through the steam. "But I wanted you to know first."`, choices: [{ id: "counter_offer", text: "Make an immediate counter-offer", consequence: "Money talks, especially in a sauna", alignment: "pragmatic", stepScore: 3, cost: 5e3 }, { id: "appeal_to_loyalty", text: "Appeal to their sense of loyalty and belonging", consequence: "You speak from the heart about what they mean to the team", alignment: "charismatic", minigame: { type: "intensity", difficulty: "hard", label: "Emotional Appeal" }, stepScore: { success: 4, failure: 0 } }, { id: "respect_their_choice", text: "Respect their journey - wish them well if they go", consequence: "Genuine leadership means letting go sometimes", alignment: "humble", stepScore: 2 }, { id: "subtle_threat", text: "Remind them of their non-compete clause...", consequence: "The temperature in the sauna drops suddenly", alignment: "ruthless", stepScore: 1 }] }, { id: "boat_adventure", stepNumber: 4, title: "\u26F5 The Boat Incident", cinematicText: "The chartered yacht cuts through blue waters. Everyone's having a great time until the captain announces the engine is having trouble.\n\nYou're stranded about a mile from shore. Some employees are panicking, others are eyeing the inflatable dinghy. Your signal has no bars.\n\nThis is your moment.", choices: [{ id: "take_charge", text: "Take charge - organize the team and figure this out", consequence: "This is what you were born for", alignment: "determined", minigame: { type: "reflex", difficulty: "hard", label: "Crisis Management" }, stepScore: { success: 5, failure: 2 } }, { id: "delegate_to_expert", text: "Find whoever has actual boat knowledge", consequence: "Smart leaders know their limitations", alignment: "pragmatic", stepScore: 3 }, { id: "keep_morale_up", text: "Start a singalong to keep spirits high", consequence: "When in doubt, add music", alignment: "charismatic", stepScore: 2 }, { id: "first_to_dinghy", text: "Quietly secure yourself a spot on the dinghy", consequence: "Self-preservation is a valid strategy", alignment: "ruthless", stepScore: -1 }] }, { id: "plane_reflection", stepNumber: 5, title: "\u2708\uFE0F Flight Home", cinematicText: 'The plane hums steadily as your team flies home. {employee1} approaches your first-class seat (the only one company policy allows for).\n\n"Boss, this retreat... it changed things." They pause. "We all see you differently now."\n\nBased on everything that happened, they share their honest assessment...', isFinalStep: true, choices: [{ id: "accept_gracefully", text: "Accept the feedback gracefully", consequence: "You listen, truly listen, to what they have to say", alignment: "humble", stepScore: 2 }, { id: "promise_changes", text: "Promise to do even better", consequence: "Growth is a continuous journey", alignment: "ambitious", stepScore: 2 }, { id: "deflect_to_team", text: 'Deflect - "It was a team effort"', consequence: "Shared credit, shared success", alignment: "diplomatic", stepScore: 1 }, { id: "back_to_business", text: `"Now, about Monday's deliverables..."`, consequence: "The retreat is over. Time to work.", alignment: "calculating", stepScore: 0 }] }], finalOutcomes: { legendary: { threshold: 15, title: "\u{1F3C6} Legendary Leader", text: "The retreat will be talked about for YEARS. You've become a legend.", effects: { boost_all_trust: 25, boost_all_productivity: 15, reputation_boost: 20 } }, excellent: { threshold: 11, title: "\u2B50 Team Transformed", text: "Your team returns energized and unified. This was money well spent.", effects: { boost_all_trust: 15, boost_all_productivity: 10, bonus_cash: 1e4 } }, good: { threshold: 7, title: "\u{1F44D} Solid Bonding", text: "Good memories were made. The team feels closer.", effects: { boost_all_trust: 10, boost_all_comfort: 10 } }, neutral: { threshold: 3, title: "\u{1F610} Mixed Results", text: "Some good moments, some awkward ones. Par for the course.", effects: { boost_all_trust: 5 } }, poor: { threshold: -100, title: "\u{1F494} Retreat from Reality", text: "That... could have gone better. Several resignation letters await on Monday.", effects: { decrease_all_trust: 10, random_employee_quits: true } } } }, corporate_heist: { id: "corporate_heist", title: "\u{1F3AD} The Corporate Heist", description: "A rival company has something you need. How far will you go to get it?", theme: "espionage", mood: "thriller", totalSteps: 4, requiredEmployees: 2, unlockConditions: { minEmployees: 8, minCash: 1e5, minAct: 3 }, themeColor: "var(--bt)", steps: [{ id: "the_intel", stepNumber: 1, title: "\u{1F50D} The Intelligence", cinematicText: `A manila envelope lands on your desk. Inside: proof that Nexus Corp has been stealing YOUR proprietary methods. They're about to launch a product using your team's innovations.

Your lawyer shrugs. "Legal battle will take years. They'll profit while we fight."

{employee1} leans in. "I know someone who works there. We could... retrieve what's ours."`, choices: [{ id: "go_legal", text: "Take the high road - pursue legal channels", consequence: "Justice moves slowly but righteously", alignment: "lawful", stepScore: 1 }, { id: "approve_operation", text: 'Approve the "retrieval" operation', consequence: "Sometimes you have to fight fire with fire", alignment: "ruthless", stepScore: 3 }, { id: "gather_more_intel", text: "First, let's know exactly what we're dealing with", consequence: "Knowledge is power", alignment: "calculating", minigame: { type: "recall", difficulty: "medium", label: "Strategic Planning" }, stepScore: { success: 2, failure: 1 } }, { id: "public_callout", text: "Go public - expose them on social media", consequence: "Transparency as a weapon", alignment: "defiant", stepScore: 2 }] }, { id: "the_inside_person", stepNumber: 2, title: "\u{1F575}\uFE0F The Inside Contact", cinematicText: `{employee2} has arranged a clandestine meeting with their contact at Nexus: a disgruntled project manager named Alex.

In a dimly lit caf\xE9, Alex slides a USB drive across the table. "Everything's on here. Client lists, internal comms, the stolen specs."

They want $50,000. And a job.`, choices: [{ id: "pay_and_hire", text: "Pay and offer them a position", consequence: "A new asset joins your team", alignment: "pragmatic", stepScore: 3, cost: 5e4 }, { id: "negotiate_down", text: "Negotiate - they came to us, they need this", consequence: "Never pay asking price", alignment: "calculating", minigame: { type: "tension", difficulty: "hard", label: "High-Stakes Negotiation" }, stepScore: { success: 4, failure: 1 } }, { id: "just_data", text: "Take the data, but no job offer", consequence: "You need the intel, not another mouth to feed", alignment: "ruthless", stepScore: 2, cost: 5e4 }, { id: "walk_away", text: "This feels wrong. Walk away.", consequence: "Some lines shouldn't be crossed", alignment: "lawful", stepScore: 0 }] }, { id: "the_discovery", stepNumber: 3, title: "\u{1F4BB} The Discovery", cinematicText: `The USB drive contains more than you expected. Yes, there's proof of theft\u2014but there's also evidence of something darker. Nexus has been cooking their books. Millions in fraud.

This information could destroy them completely. Or it could be your bargaining chip.

{employee1} whistles. "Boss, this is nuclear."`, choices: [{ id: "report_to_authorities", text: "Report the fraud to authorities", consequence: "Let the system handle justice", alignment: "lawful", stepScore: 2 }, { id: "leverage_for_settlement", text: "Use it as leverage for a massive settlement", consequence: "They'll pay to keep this quiet", alignment: "calculating", minigame: { type: "composure", difficulty: "hard", label: "Power Play" }, stepScore: { success: 4, failure: 2 } }, { id: "destroy_them", text: "Leak everything. Watch them burn.", consequence: "Total annihilation", alignment: "ruthless", stepScore: 3 }, { id: "focus_on_original_goal", text: "Ignore the fraud - just pursue our stolen IP", consequence: "Stay focused on what matters", alignment: "pragmatic", stepScore: 1 }] }, { id: "the_aftermath", stepNumber: 4, title: "\u2696\uFE0F The Aftermath", cinematicText: `The dust is settling. Based on your choices, the situation has resolved one way or another.

Your team gathers in the conference room. Some look at you with new respect. Others seem... uncertain about who you've become.

{employee2} finally speaks: "Was it worth it, boss?"`, isFinalStep: true, choices: [{ id: "absolutely", text: `"Absolutely. We protected what's ours."`, consequence: "You stand by every decision", alignment: "determined", stepScore: 2 }, { id: "means_to_end", text: '"The ends justified the means."', consequence: "Pragmatism in its purest form", alignment: "calculating", stepScore: 1 }, { id: "some_regrets", text: `"I have some regrets... but I'd do it again."`, consequence: "Honesty about moral complexity", alignment: "humble", stepScore: 1 }, { id: "never_speak_of_this", text: '"We never speak of this again."', consequence: "Some things are best buried", alignment: "cautious", stepScore: 0 }] }], finalOutcomes: { legendary: { threshold: 12, title: "\u{1F451} Corporate Kingpin", text: "You didn't just win\u2014you dominated. Nexus is finished, and everyone knows you did it.", effects: { bonus_cash: 2e5, reputation_boost: 30, boost_all_productivity: 20 } }, excellent: { threshold: 9, title: "\u{1F3AF} Mission Accomplished", text: "Your IP is protected, and you came out stronger. Clean or dirty, victory is victory.", effects: { bonus_cash: 1e5, reputation_boost: 15, boost_all_trust: 10 } }, good: { threshold: 6, title: "\u2705 Justice Served", text: "The situation is resolved favorably. Your team respects your choices.", effects: { bonus_cash: 5e4, boost_all_trust: 10 } }, neutral: { threshold: 3, title: "\u{1F610} Complicated Victory", text: "You got some of what you wanted, but at what cost?", effects: { bonus_cash: 2e4 } }, poor: { threshold: -100, title: "\u{1F480} Pyrrhic Victory", text: "The operation went sideways. You might face legal consequences yourself...", effects: { fine: 1e5, decrease_all_trust: 15, investigation: 30 } } } }, office_romance: { id: "office_romance", title: "\u{1F495} The Office Romance", description: "Love blooms between two of your employees. Your handling will affect the whole office.", theme: "relationships", mood: "drama", totalSteps: 3, requiredEmployees: 4, unlockConditions: { minEmployees: 6, minAct: 1 }, themeColor: "var(--v)", nsfwEnhanced: true, steps: [{ id: "the_discovery", stepNumber: 1, title: "\u{1F48B} The Discovery", cinematicText: `You walk into the supply closet for printer paper and freeze. {employee1} and {employee2} spring apart, faces flushed.

"This isn't... we were just..." {employee1} stammers.

The whole office will hear about this by lunch. How you handle it now will set the tone.`, choices: [{ id: "professional_boundary", text: '"Company policy requires you disclose this to HR"', consequence: "By the book, as always", alignment: "lawful", stepScore: 2 }, { id: "wink_and_leave", text: "Wink and back out slowly", consequence: "You saw nothing. NOTHING.", alignment: "charismatic", stepScore: 2 }, { id: "stern_warning", text: '"Not on company time. My office. One hour."', consequence: "This needs addressing", alignment: "calculating", stepScore: 1 }, { id: "supportive_reaction", text: `"I'm happy for you two! Just... maybe lock the door?"`, consequence: "Love wins (with practical advice)", alignment: "light", stepScore: 3 }] }, { id: "the_complication", stepNumber: 2, title: "\u{1F494} The Complication", cinematicText: `It's been a few weeks. The lovebirds have been professional, but now there's a problem.

{employee3} storms into your office. "I was supposed to get that promotion! But you gave it to {employee2} because they're sleeping with {employee1}!"

Whether it's true or not, the perception is there. This is a powder keg.`, choices: [{ id: "review_decision", text: "Review the promotion decision with full transparency", consequence: "Let the evidence speak", alignment: "lawful", minigame: { type: "recall", difficulty: "medium", label: "Documentation Review" }, stepScore: { success: 3, failure: 1 } }, { id: "stand_firm", text: "Stand by your decision - the promotion was earned", consequence: "Leadership means making unpopular calls", alignment: "determined", stepScore: 2 }, { id: "compromise_offer", text: "Offer {employee3} a different opportunity", consequence: "There's more than one path to success", alignment: "diplomatic", stepScore: 2, cost: 2e3 }, { id: "separate_the_lovers", text: "Transfer one of the couple to a different team", consequence: "The nuclear option", alignment: "ruthless", stepScore: 0 }] }, { id: "the_resolution", stepNumber: 3, title: "\u{1F49D} Love's Conclusion", cinematicText: 'Months have passed. {employee1} and {employee2} are now engaged.\n\nThey approach you together. "We wanted to thank you for how you handled everything. Not every boss would have..." they trail off, emotional.\n\nThe office is watching. This moment will define the culture.', isFinalStep: true, choices: [{ id: "celebrate_publicly", text: "Announce a celebration - love should be celebrated!", consequence: "You throw them an engagement party", alignment: "light", stepScore: 3, cost: 1e3 }, { id: "private_congratulations", text: "Congratulate them privately, maintain professionalism", consequence: "Warm but appropriate", alignment: "pragmatic", stepScore: 2 }, { id: "warn_about_breakups", text: '"Happy for you. But if this goes south, we need a plan..."', consequence: "Always planning for contingencies", alignment: "calculating", stepScore: 1 }, { id: "policy_update", text: "Use this as a chance to update office relationship policies", consequence: "Turn this into a teaching moment", alignment: "lawful", stepScore: 1 }] }], finalOutcomes: { legendary: { threshold: 8, title: "\u{1F496} Cupid CEO", text: "You've created an office where love can flourish AND work gets done. The couple names their first child after you (middle name).", effects: { boost_all_comfort: 20, boost_all_trust: 15, reputation_boost: 10 } }, excellent: { threshold: 6, title: "\u{1F495} Relationship Goals", text: "The office sees you as understanding and human. Morale is at an all-time high.", effects: { boost_all_comfort: 15, boost_all_trust: 10 } }, good: { threshold: 4, title: "\u{1F44D} Handled Well", text: "Not perfect, but you navigated a tricky situation with grace.", effects: { boost_all_comfort: 10 } }, neutral: { threshold: 2, title: "\u{1F610} Bureaucratic Romance", text: "The paperwork is in order. The romance survived. Barely.", effects: { boost_all_trust: 5 } }, poor: { threshold: -100, title: "\u{1F494} HR Nightmare", text: "Your handling made everything worse. One of them quit. The other is talking to lawyers.", effects: { employee_quits: true, decrease_all_trust: 10, reputation_hit: 15 } } } }, investor_pitch: { id: "investor_pitch", title: "\u{1F4BC} The Investor Pitch", description: "A legendary venture capitalist wants to hear your pitch. This could change everything.", theme: "business", mood: "high_stakes", totalSteps: 4, requiredEmployees: 2, unlockConditions: { minEmployees: 4, minCash: 25e3, minAct: 2 }, themeColor: "var(--z)", steps: [{ id: "the_call", stepNumber: 1, title: "\u{1F4DE} The Unexpected Call", cinematicText: `Your phone buzzes. Unknown number. You almost ignore it.

"This is Marcus Chen from Titan Ventures. I've been watching your company. I think you're onto something."

Your heart races. Titan Ventures has made millionaires out of startups. They want a pitch meeting. Tomorrow.

{employee1} looks up from their desk. "Boss? You look like you've seen a ghost."`, choices: [{ id: "accept_confidently", text: `"Tomorrow works. Let's make history."`, consequence: "Confidence is key in this game", alignment: "ambitious", stepScore: 3 }, { id: "negotiate_time", text: "Ask for more time to prepare", consequence: "Better to be prepared than lucky", alignment: "cautious", stepScore: 2 }, { id: "play_hard_to_get", text: `"I'm quite busy... but I suppose I could fit you in"`, consequence: "Power dynamics matter", alignment: "cunning", minigame: { type: "composure", difficulty: "medium", label: "Power Play" }, stepScore: { success: 4, failure: 1 } }, { id: "honest_excitement", text: '"Are you serious?! YES! Absolutely!"', consequence: "Authentic enthusiasm has its charms", alignment: "humble", stepScore: 2 }] }, { id: "the_prep", stepNumber: 2, title: "\u{1F4CA} Preparation Night", cinematicText: `It's midnight. Your team has been working on the pitch deck for hours.

{employee1} is running on their fifth coffee. {employee2} just caught a critical error in the financial projections.

"Boss, the numbers don't quite add up," {employee2} says quietly. "We could fudge them slightly, or present the honest picture which is... less impressive."`, choices: [{ id: "honest_numbers", text: "Keep the numbers honest - integrity first", consequence: "The truth will set you free (or tank your valuation)", alignment: "lawful", stepScore: 2 }, { id: "creative_accounting", text: `"Creative projections" aren't lies, right?`, consequence: "Every startup stretches the truth a little", alignment: "cunning", stepScore: 3 }, { id: "pivot_narrative", text: "Pivot to a different narrative that fits the real numbers", consequence: "Find the angle that makes reality look good", alignment: "innovative", minigame: { type: "recall", difficulty: "hard", label: "Strategic Pivot" }, stepScore: { success: 4, failure: 1 } }, { id: "delay_to_fix", text: "Postpone the meeting - we need this right", consequence: "Second chances are rare in venture capital", alignment: "cautious", stepScore: 0 }] }, { id: "the_pitch", stepNumber: 3, title: "\u{1F3A4} The Big Moment", cinematicText: 'The conference room at Titan Ventures gleams with success. Marcus Chen sits across from you, flanked by two analysts.\n\n"You have fifteen minutes," Marcus says, tapping his watch. "Impress me."\n\nYour team is watching through the glass. Everything leads to this moment.', choices: [{ id: "vision_pitch", text: "Lead with the grand vision - paint the future", consequence: "Dreams can be contagious", alignment: "charismatic", minigame: { type: "intensity", difficulty: "hard", label: "Visionary Pitch" }, stepScore: { success: 5, failure: 2 } }, { id: "numbers_first", text: "Let the numbers speak - cold, hard ROI", consequence: "Investors love returns", alignment: "pragmatic", minigame: { type: "precision", difficulty: "medium", label: "Financial Precision" }, stepScore: { success: 4, failure: 2 } }, { id: "emotional_story", text: "Tell the human story - why this matters", consequence: "Even investors have hearts... supposedly", alignment: "light", stepScore: 3 }, { id: "aggressive_close", text: 'Challenge them - "You need US more than we need you"', consequence: "Bold. Very bold.", alignment: "risky", stepScore: { betting: true, range: [-1, 5] } }] }, { id: "the_verdict", stepNumber: 4, title: "\u2696\uFE0F The Verdict", cinematicText: 'Marcus sets down his pen. The silence stretches for an eternity.\n\n"Interesting," he finally says. His poker face reveals nothing.\n\nHis analysts exchange glances. One shrugs slightly. The other nods almost imperceptibly.\n\n"I have one question," Marcus leans forward. "Why should I bet on YOU, specifically?"', isFinalStep: true, choices: [{ id: "promise_results", text: '"Because I will make you money. Full stop."', consequence: "The investor's favorite promise", alignment: "ambitious", stepScore: 2 }, { id: "team_strength", text: `"You're not betting on me - you're betting on this team"`, consequence: "Humility and strength combined", alignment: "humble", stepScore: 2 }, { id: "track_record", text: `"Look at what we've already built with nothing"`, consequence: "Past performance is the best predictor", alignment: "determined", stepScore: 2 }, { id: "counter_question", text: '"Why not? What do you see that makes you hesitate?"', consequence: "Turn the tables", alignment: "cunning", minigame: { type: "composure", difficulty: "hard", label: "Negotiation Mastery" }, stepScore: { success: 3, failure: 0 } }] }], finalOutcomes: { legendary: { threshold: 14, title: "\u{1F984} Unicorn Potential", text: `Marcus writes a check on the spot. "I knew it the moment you walked in." You've secured Series A funding that will change everything.`, effects: { bonus_cash: 5e5, reputation_boost: 30, boost_all_productivity: 25 } }, excellent: { threshold: 10, title: "\u{1F4B0} Deal Closed", text: `"We're in," Marcus says with a rare smile. The terms are fair, the future is bright.`, effects: { bonus_cash: 25e4, reputation_boost: 20, boost_all_trust: 15 } }, good: { threshold: 7, title: "\u{1F91D} Term Sheet Incoming", text: `"Send me your deck. Let's continue this conversation." Not a yes, but not a no.`, effects: { bonus_cash: 5e4, reputation_boost: 10 } }, neutral: { threshold: 4, title: `\u23F3 "We'll Be in Touch"`, text: "The dreaded non-answer. Maybe they'll call. Maybe they won't.", effects: { reputation_boost: 5 } }, poor: { threshold: -100, title: "\u274C Hard Pass", text: `"I don't see it," Marcus says, already checking his phone. The meeting is over. Your team saw everything through that glass.`, effects: { decrease_all_trust: 10, reputation_hit: 10 } } } }, crisis_management: { id: "crisis_management", title: "\u{1F6A8} Crisis Management", description: "Everything is on fire. Sometimes literally. Can you hold it together?", theme: "survival", mood: "tense", totalSteps: 4, requiredEmployees: 4, unlockConditions: { minEmployees: 6, minCash: 1e4, minAct: 2 }, themeColor: "var(--l)", steps: [{ id: "the_disaster", stepNumber: 1, title: "\u{1F4A5} Everything Falls Apart", cinematicText: "You arrive at work to find chaos.\n\nThe main server is down. A major client is threatening to sue. {employee1} is in tears. {employee2} is screaming at {employee3}. Someone burned popcorn so bad the fire alarm is going off.\n\nEveryone turns to you. The clock is ticking.", choices: [{ id: "triage_mode", text: "Triage - identify the most critical issue first", consequence: "Prioritization under pressure", alignment: "calculating", minigame: { type: "reflex", difficulty: "medium", label: "Crisis Assessment" }, stepScore: { success: 3, failure: 1 } }, { id: "delegate_everything", text: "Delegate - assign each crisis to someone capable", consequence: "Trust your people", alignment: "pragmatic", stepScore: 2 }, { id: "calm_everyone_first", text: "Stop. Everyone take a breath. We'll figure this out together.", consequence: "Calm is contagious", alignment: "diplomatic", stepScore: 2 }, { id: "panic", text: "Panic internally while appearing calm externally", consequence: "Fake it till you make it?", alignment: "cautious", stepScore: 1 }] }, { id: "the_client", stepNumber: 2, title: "\u{1F4F1} The Angry Client", cinematicText: 'The client, Meridian Corp, is on the line. Their CEO sounds ready to commit murder.\n\n"This breach has cost us MILLIONS. We trusted you! I want answers, I want heads to roll, and I want them NOW!"\n\n{employee4} mouths "sorry" from across the room. This was their account.', choices: [{ id: "take_responsibility", text: "Fall on your sword - take full responsibility", consequence: "The buck stops with you", alignment: "humble", stepScore: 3 }, { id: "deflect_to_employee", text: "Point out that {employee4} was the account lead", consequence: "Honesty or betrayal?", alignment: "ruthless", stepScore: 0 }, { id: "solution_focused", text: "Skip the blame game - focus only on solutions", consequence: "Forward momentum", alignment: "pragmatic", minigame: { type: "composure", difficulty: "hard", label: "De-escalation" }, stepScore: { success: 4, failure: 1 } }, { id: "offer_compensation", text: "Offer significant compensation immediately", consequence: "Money heals many wounds", alignment: "diplomatic", stepScore: 2, cost: 1e4 }] }, { id: "the_team", stepNumber: 3, title: "\u{1F465} Team Breakdown", cinematicText: `The immediate fires are controlled, but now {employee2} and {employee3} are at each other's throats.

"This is YOUR fault!" {employee2} shouts. "If you'd done your job\u2014"

"MY fault?! You're the one who\u2014"

{employee1} is still crying quietly in the corner. The team is fracturing.`, choices: [{ id: "mandatory_meeting", text: "Mandatory all-hands meeting - air everything out", consequence: "Radical transparency", alignment: "lawful", stepScore: 2 }, { id: "separate_and_talk", text: "Separate them and talk to each privately", consequence: "Individual attention matters", alignment: "diplomatic", minigame: { type: "intensity", difficulty: "medium", label: "Emotional Intelligence" }, stepScore: { success: 3, failure: 1 } }, { id: "tough_love", text: `"I don't care who's at fault. Fix it or you're ALL fired."`, consequence: "Fear can motivate... or destroy", alignment: "ruthless", stepScore: 1 }, { id: "comfort_the_crying", text: "Prioritize {employee1} - they're clearly struggling most", consequence: "Compassion for the vulnerable", alignment: "light", stepScore: 2 }] }, { id: "the_aftermath", stepNumber: 4, title: "\u{1F305} After the Storm", cinematicText: `It's 11 PM. The office is quiet. The servers are back up. The client has been... managed. The team is exhausted.

{employee1} approaches you, looking like they haven't slept in days. "Boss... was today... are we going to be okay?"

Everyone still here is watching for your answer.`, isFinalStep: true, choices: [{ id: "honest_assessment", text: '"Today was bad. But we survived. That means something."', consequence: "Honest hope", alignment: "humble", stepScore: 2 }, { id: "inspiring_speech", text: "Give a rallying speech about resilience", consequence: "Leaders inspire", alignment: "charismatic", stepScore: 2 }, { id: "order_food", text: "Order everyone dinner and just sit together", consequence: "Sometimes presence is enough", alignment: "light", stepScore: 3, cost: 500 }, { id: "back_to_work", text: '"Okay, time to figure out how this never happens again"', consequence: "Always forward", alignment: "determined", stepScore: 1 }] }], finalOutcomes: { legendary: { threshold: 11, title: "\u{1F9B8} Crisis Champion", text: "Against all odds, you didn't just survive\u2014you unified your team. They'll follow you into any fire now.", effects: { boost_all_trust: 25, boost_all_comfort: 20, reputation_boost: 15 } }, excellent: { threshold: 8, title: "\u2728 Grace Under Pressure", text: "You held it together when everything was falling apart. Respect earned.", effects: { boost_all_trust: 15, boost_all_comfort: 10 } }, good: { threshold: 5, title: "\u{1F44D} Damage Controlled", text: "It wasn't pretty, but you stopped the bleeding. That counts.", effects: { boost_all_trust: 10 } }, neutral: { threshold: 2, title: "\u{1F630} Barely Surviving", text: "The company lives another day. Barely. Morale is... not great.", effects: { boost_all_comfort: -5 } }, poor: { threshold: -100, title: "\u{1F480} Total Meltdown", text: "The crisis exposed cracks that can't be fixed. Multiple resignations incoming.", effects: { decrease_all_trust: 20, employee_quits: true, reputation_hit: 15 } } } }, after_hours_party: { id: "after_hours_party", title: "\u{1F319} After Hours", description: "The office party takes an unexpected turn. Lines between professional and personal blur.", theme: "nightlife", mood: "intimate", totalSteps: 4, requiredEmployees: 3, unlockConditions: { minEmployees: 5, minCash: 2e4, minAct: 2 }, themeColor: "var(--l)", nsfwEnhanced: true, steps: [{ id: "party_begins", stepNumber: 1, title: "\u{1F389} The Celebration", cinematicText: `The office has transformed. Fairy lights, music, and the scent of catering fill the air. You've hit a major milestone and everyone's ready to celebrate.

{employee1} approaches you, drink in hand. "Boss, you've been working so hard. Tonight, you should actually relax."

The party is in full swing. How do you set the tone?`, choices: [{ id: "professional_host", text: "Be the gracious host - mingle professionally", consequence: "Keep it classy, as always", alignment: "lawful", stepScore: 2 }, { id: "join_the_fun", text: "Let loose! You deserve to enjoy this too", consequence: "Tonight you're not just the boss", alignment: "charismatic", stepScore: 3 }, { id: "observe_from_corner", text: "Watch from the sidelines - learn about your people", consequence: "Sometimes observation reveals truth", alignment: "calculating", stepScore: 2 }, { id: "speech_time", text: "Make an inspiring speech about the team", consequence: "Words have power", alignment: "ambitious", minigame: { type: "intensity", difficulty: "medium", label: "Inspirational Toast" }, stepScore: { success: 4, failure: 1 } }] }, { id: "unexpected_moment", stepNumber: 2, title: "\u2728 The Moment", cinematicText: `Hours pass. The party has thinned out, but a core group remains. {employee2} is telling ridiculous stories. {employee3} is showing off dance moves.

Then, unexpectedly, {employee1} finds you alone by the window. The city lights sparkle below.

"You know," they say softly, "I've always wanted to tell you something..."`, choices: [{ id: "listen_intently", text: "Listen - give them your full attention", consequence: "Sometimes the best response is silence", alignment: "humble", stepScore: 3 }, { id: "redirect_conversation", text: "Steer toward safer topics", consequence: "Boundaries matter", alignment: "cautious", stepScore: 2 }, { id: "lean_in", text: 'Lean in... "Tell me everything"', consequence: "The line between boss and confidant blurs", alignment: "risky", minigame: { type: "composure", difficulty: "hard", label: "Emotional Navigation" }, stepScore: { success: 4, failure: 0 } }, { id: "share_first", text: "Open up first - vulnerability invites vulnerability", consequence: "You show them your human side", alignment: "light", stepScore: 2 }] }, { id: "complications", stepNumber: 3, title: "\u{1F32A}\uFE0F Complications", cinematicText: 'The conversation with {employee1} has shifted something. The air between you is different now.\n\nBut {employee2} has noticed. They pull you aside. "Boss, I saw you two talking. Be careful. Office relationships are..." they trail off.\n\nMeanwhile, {employee3} is getting a bit too drunk and might need intervention.', choices: [{ id: "handle_drunk", text: "Prioritize {employee3} - they need help now", consequence: "Responsibility comes first", alignment: "lawful", stepScore: 2 }, { id: "deflect_to_employee2", text: '"Mind your own business" to {employee2}', consequence: "Your personal life is your own", alignment: "defiant", stepScore: 1 }, { id: "honest_with_employee2", text: "Be honest with {employee2} about your feelings", consequence: "Transparency, even when uncomfortable", alignment: "humble", stepScore: 3 }, { id: "deny_everything", text: "Deny any romantic tension - you're just colleagues", consequence: "Protect the professional facade", alignment: "cautious", stepScore: 1 }] }, { id: "dawn_decision", stepNumber: 4, title: "\u{1F305} As Dawn Breaks", cinematicText: "The party is over. It's nearly sunrise. The office is quiet except for a few stragglers.\n\n{employee1} catches your eye across the room. The question hangs unspoken between you.\n\nYou're the boss. Whatever happens next will define more than just tonight.", isFinalStep: true, choices: [{ id: "professional_goodbye", text: "Bid everyone a professional goodnight", consequence: "Protect what matters: the team, the work", alignment: "lawful", stepScore: 1 }, { id: "offer_ride", text: "Offer {employee1} a ride home", consequence: "A simple gesture, with complex implications", alignment: "risky", stepScore: 2 }, { id: "continue_conversation", text: "Suggest grabbing breakfast to continue talking", consequence: "The night doesn't have to end", alignment: "charismatic", stepScore: 3 }, { id: "leave_alone", text: "Slip out quietly alone - you need to think", consequence: "Some decisions need time", alignment: "cautious", stepScore: 1 }] }], finalOutcomes: { legendary: { threshold: 11, title: "\u{1F4AB} Unforgettable Night", text: "Something genuine blossomed tonight. The office will never feel quite the same\u2014in the best possible way.", effects: { boost_all_trust: 20, boost_all_comfort: 25, reputation_boost: 10 } }, excellent: { threshold: 8, title: "\u2728 Meaningful Connection", text: "You navigated complexity with grace. New bonds were forged, and old ones deepened.", effects: { boost_all_trust: 15, boost_all_comfort: 15 } }, good: { threshold: 5, title: "\u{1F3AD} Memorable Evening", text: "A good party with some interesting moments. People will remember this one.", effects: { boost_all_comfort: 15 } }, neutral: { threshold: 2, title: "\u{1F319} Just Another Party", text: "Fun was had. Boundaries were maintained. Life goes on.", effects: { boost_all_comfort: 5 } }, poor: { threshold: -100, title: "\u{1F494} Awkward Morning After", text: "Some things can't be unsaid, and some boundaries shouldn't be crossed. HR may need to get involved.", effects: { decrease_all_trust: 15, decrease_all_comfort: 10 } } } }, the_merger: { id: "the_merger", title: "\u{1F3E2} The Merger", description: "A larger company wants to acquire yours. The next few days will determine your future.", theme: "corporate", mood: "tense", totalSteps: 5, requiredEmployees: 4, unlockConditions: { minEmployees: 8, minCash: 2e5, minAct: 3 }, themeColor: "var(--bl)", steps: [{ id: "the_offer", stepNumber: 1, title: "\u{1F4CB} The Offer", cinematicText: `A black town car pulls up outside your office. Two executives in expensive suits step out.

"We're from Apex Industries," the taller one says. "We'd like to discuss... an acquisition."

They slide a folder across your desk. The number inside makes your heart skip. It's more money than you ever imagined.

{employee1} peeks in. "Boss? Everything okay?"`, choices: [{ id: "consider_seriously", text: "Take the meeting seriously - hear them out fully", consequence: "Knowledge is leverage", alignment: "calculating", stepScore: 2 }, { id: "reject_immediately", text: `"We're not for sale. Thank you for your interest."`, consequence: "Pride has its price", alignment: "defiant", stepScore: 1 }, { id: "play_hardball", text: `"This number? That's insulting. Triple it."`, consequence: "Go big or go home", alignment: "ambitious", minigame: { type: "composure", difficulty: "hard", label: "Power Negotiation" }, stepScore: { success: 4, failure: 0 } }, { id: "stall_for_time", text: "Ask for a week to consider", consequence: "Time creates options", alignment: "cautious", stepScore: 2 }] }, { id: "team_reaction", stepNumber: 2, title: "\u{1F465} The Team Finds Out", cinematicText: `Word has leaked. {employee2} confronts you in the hallway.

"Is it true? You're selling us out?"

The break room has gone silent. Everyone is listening. Some look hopeful\u2014maybe they'll get a payout. Others look betrayed.

{employee3} just stares at you, arms crossed.`, choices: [{ id: "full_transparency", text: "Call an all-hands meeting - full transparency", consequence: "Trust is built on truth", alignment: "lawful", stepScore: 3 }, { id: "deny_everything", text: '"Just exploratory talks. Nothing to worry about."', consequence: "A convenient half-truth", alignment: "cunning", stepScore: 1 }, { id: "promise_protection", text: "Promise their jobs are safe no matter what", consequence: "A promise you may not be able to keep", alignment: "light", stepScore: 2 }, { id: "appeal_to_opportunity", text: '"This could be GOOD for all of us. Think bigger."', consequence: "Reframe the narrative", alignment: "charismatic", minigame: { type: "intensity", difficulty: "medium", label: "Inspiring Vision" }, stepScore: { success: 3, failure: 1 } }] }, { id: "due_diligence", stepNumber: 3, title: "\u{1F50D} Due Diligence", cinematicText: `Apex's auditors are crawling through everything. Every spreadsheet, every email, every contract.

One of them pulls you aside. "We found some... irregularities in your Q3 reports."

Your stomach drops. {employee1} made those reports. Were they hiding something? Or is this a negotiation tactic?`, choices: [{ id: "investigate_internally", text: "Investigate before responding", consequence: "Know thy own house", alignment: "calculating", minigame: { type: "recall", difficulty: "hard", label: "Financial Analysis" }, stepScore: { success: 4, failure: 1 } }, { id: "confront_employee", text: "Confront {employee1} immediately", consequence: "Direct action, potential consequences", alignment: "determined", stepScore: 2 }, { id: "dismiss_concerns", text: '"Standard accounting variance. Not material."', consequence: "Confidence can mask many sins", alignment: "risky", stepScore: { betting: true, range: [-1, 3] } }, { id: "offer_explanation", text: "Provide detailed context for the numbers", consequence: "Transparency as defense", alignment: "lawful", stepScore: 2 }] }, { id: "counter_offer", stepNumber: 4, title: "\u2694\uFE0F The Counter-Move", cinematicText: `Just when you thought Apex had all the leverage, your phone rings. It's a rival company\u2014Zenith Corp.

"We heard Apex is sniffing around. We'd hate to see you absorbed by them. Perhaps we could... counter-offer?"

A bidding war could make you rich. Or it could blow up in your face.`, choices: [{ id: "play_them_off", text: "Play both companies against each other", consequence: "Maximum leverage, maximum risk", alignment: "cunning", minigame: { type: "tension", difficulty: "hard", label: "High-Stakes Poker" }, stepScore: { success: 5, failure: -1 } }, { id: "stay_loyal_apex", text: "Honor your discussions with Apex", consequence: "Your word means something", alignment: "lawful", stepScore: 2 }, { id: "use_as_leverage", text: "Use Zenith to negotiate better Apex terms", consequence: "Business is business", alignment: "calculating", stepScore: 3 }, { id: "reject_both", text: `"Thank you both, but we're staying independent."`, consequence: "Independence has its value", alignment: "defiant", stepScore: 2 }] }, { id: "final_decision", stepNumber: 5, title: "\u{1F58A}\uFE0F The Signing", cinematicText: "The contracts are on your desk. Lawyers on both sides. Your team watches through the glass.\n\n{employee1}, {employee2}, and {employee3} have their futures in your hands. This signature will change everything.\n\nThe pen feels impossibly heavy.", isFinalStep: true, choices: [{ id: "sign_deal", text: "Sign the deal - secure everyone's future", consequence: "A new chapter begins", alignment: "pragmatic", stepScore: 2 }, { id: "negotiate_last_minute", text: "Push for one final concession", consequence: "Never leave money on the table", alignment: "ambitious", stepScore: 2 }, { id: "walk_away", text: "Walk away from the table", consequence: "Sometimes the best deal is no deal", alignment: "defiant", stepScore: 3 }, { id: "employee_ownership", text: "Counter-propose: employee ownership stake instead", consequence: "Share the wealth, share the risk", alignment: "light", stepScore: 3 }] }], finalOutcomes: { legendary: { threshold: 14, title: "\u{1F451} Master Negotiator", text: "You played every angle perfectly. Whether you sold or stayed independent, you got everything you wanted and more.", effects: { bonus_cash: 5e5, boost_all_trust: 25, reputation_boost: 30 } }, excellent: { threshold: 10, title: "\u{1F4BC} Shrewd Executive", text: "You navigated treacherous waters with skill. Your team respects your decisions.", effects: { bonus_cash: 2e5, boost_all_trust: 15, reputation_boost: 15 } }, good: { threshold: 6, title: "\u2705 Deal Done", text: "The outcome was favorable, if not perfect. Business continues.", effects: { bonus_cash: 1e5, boost_all_trust: 10 } }, neutral: { threshold: 3, title: "\u{1F610} Complicated Exit", text: "Some won, some lost. The dust will take time to settle.", effects: { bonus_cash: 5e4 } }, poor: { threshold: -100, title: "\u{1F480} Hostile Takeover", text: "You lost control of the situation. The terms were... not favorable.", effects: { decrease_all_trust: 20, fine: 1e5, random_employee_quits: true } } } }, the_whistleblower: { id: "the_whistleblower", title: "\u{1F4E2} The Whistleblower", description: "Someone in your company knows something they shouldn't. How you handle this will define you.", theme: "ethics", mood: "thriller", totalSteps: 4, requiredEmployees: 3, unlockConditions: { minEmployees: 6, minCash: 5e4, minAct: 2 }, themeColor: "var(--dj)", steps: [{ id: "anonymous_tip", stepNumber: 1, title: "\u{1F4E7} The Anonymous Tip", cinematicText: `An envelope with no return address sits on your desk. Inside: documents showing that someone in your company has been embezzling. Not a lot\u2014but consistently, for months.

The trail leads to someone you trust. {employee1}'s signature is on several of the questionable invoices.

There's a note: "I thought you should know. - A Friend"`, choices: [{ id: "confront_directly", text: "Confront {employee1} directly", consequence: "Face-to-face reveals truth", alignment: "determined", stepScore: 2 }, { id: "investigate_quietly", text: "Investigate quietly before acting", consequence: "Gather evidence first", alignment: "calculating", minigame: { type: "recall", difficulty: "medium", label: "Financial Investigation" }, stepScore: { success: 3, failure: 1 } }, { id: "call_police", text: "Report to authorities immediately", consequence: "Let the law handle it", alignment: "lawful", stepScore: 2 }, { id: "destroy_evidence", text: "Destroy the envelope and pretend you never saw it", consequence: "What you don't know can't hurt you... right?", alignment: "dark", stepScore: -1 }] }, { id: "the_confession", stepNumber: 2, title: "\u{1F494} The Confession", cinematicText: `{employee1} sits across from you, pale and trembling.

"I can explain," they whisper. "My mother... she's sick. The medical bills... I was going to pay it all back. I swear."

Tears stream down their face. "Please. I have kids. If I lose this job..."

{employee2} walks past the door. They see {employee1} crying. Great. Now others will ask questions.`, choices: [{ id: "show_mercy", text: "Show mercy - offer a repayment plan instead of firing", consequence: "Compassion in the face of betrayal", alignment: "light", stepScore: 3 }, { id: "terminate_quietly", text: "Terminate them quietly - no police, just gone", consequence: "Problem solved, reputation preserved", alignment: "calculating", stepScore: 2 }, { id: "full_prosecution", text: "Follow procedure - termination and criminal charges", consequence: "The law is the law", alignment: "lawful", stepScore: 1 }, { id: "cover_it_up", text: "Cover it up - fix the books, keep them employed", consequence: "Now you're complicit too", alignment: "dark", stepScore: 0 }] }, { id: "the_leak", stepNumber: 3, title: "\u{1F4F0} The Story Spreads", cinematicText: `Somehow, it got out. A local business blogger has the story. Your phone is ringing off the hook.

"Sources say embezzlement... company culture questioned... management aware?"

{employee2} shows you their phone. It's everywhere. Your team is watching to see how you handle this.`, choices: [{ id: "get_ahead", text: "Get ahead of it - full press release, total transparency", consequence: "Control the narrative", alignment: "lawful", minigame: { type: "composure", difficulty: "hard", label: "Crisis Communications" }, stepScore: { success: 4, failure: 1 } }, { id: "no_comment", text: '"No comment" on all inquiries', consequence: "Silence can be golden... or damning", alignment: "cautious", stepScore: 1 }, { id: "blame_individual", text: "Publicly blame the individual - distance the company", consequence: "Throw them under the bus", alignment: "ruthless", stepScore: 2 }, { id: "spin_positive", text: 'Spin it: "We discovered and addressed the issue ourselves"', consequence: "Turn weakness into strength", alignment: "cunning", stepScore: 2 }] }, { id: "the_aftermath", stepNumber: 4, title: "\u2696\uFE0F The Reckoning", cinematicText: 'Weeks later. The story has died down. But the scars remain.\n\n{employee2} and {employee3} approach you together.\n\n"We wanted to say... the way you handled everything..." they exchange glances. "It made us think about what kind of company this really is."', isFinalStep: true, choices: [{ id: "acknowledge_difficulty", text: `"It was the hardest decision I've ever made."`, consequence: "Honesty about struggle", alignment: "humble", stepScore: 2 }, { id: "set_new_standards", text: "Announce new ethics policies and oversight", consequence: "Turn crisis into improvement", alignment: "lawful", stepScore: 2 }, { id: "move_on", text: `"What's done is done. Let's focus on the future."`, consequence: "Forward, always forward", alignment: "pragmatic", stepScore: 1 }, { id: "thank_team", text: "Thank the team for their trust and discretion", consequence: "Gratitude builds loyalty", alignment: "charismatic", stepScore: 2 }] }], finalOutcomes: { legendary: { threshold: 10, title: "\u2B50 Ethical Leader", text: "You handled an impossible situation with grace. Your team trusts you more than ever.", effects: { boost_all_trust: 30, reputation_boost: 25, unlock_perk: { perkId: "ethical_reputation", name: "Ethical Reputation", description: "+10% trust for new hires" } } }, excellent: { threshold: 7, title: "\u{1F44D} Tough but Fair", text: "You made hard choices but stood by your principles. Respect earned.", effects: { boost_all_trust: 20, reputation_boost: 15 } }, good: { threshold: 4, title: "\u2705 Crisis Managed", text: "Not perfect, but you got through it. The company survives.", effects: { boost_all_trust: 10, reputation_boost: 5 } }, neutral: { threshold: 1, title: "\u{1F610} Mixed Messages", text: "Your handling raised as many questions as it answered.", effects: { reputation_boost: -5 } }, poor: { threshold: -100, title: "\u{1F480} Trust Shattered", text: "Your response damaged more than the original crime. People wonder what you'd do to them.", effects: { decrease_all_trust: 25, reputation_hit: 20, random_employee_quits: true } } } }, product_launch: { id: "product_launch", title: "\u{1F680} The Product Launch", description: "Your biggest product ever goes live. Everything rides on the next 48 hours.", theme: "innovation", mood: "exciting", totalSteps: 4, requiredEmployees: 4, unlockConditions: { minEmployees: 5, minCash: 75e3, minAct: 2 }, themeColor: "var(--dm)", steps: [{ id: "launch_prep", stepNumber: 1, title: "\u23F0 T-Minus 24 Hours", cinematicText: `The office is chaos. Energy drinks everywhere. {employee1} hasn't slept in two days.

"Boss, we found a bug," {employee2} says, panic in their eyes. "Nothing critical but... do we delay?"

The marketing campaign is already live. Press embargoes lift in 24 hours. Your biggest client is watching.`, choices: [{ id: "fix_and_ship", text: "All hands on deck - fix it and ship on time", consequence: "Sleep is for the weak", alignment: "determined", minigame: { type: "reflex", difficulty: "hard", label: "Crunch Time" }, stepScore: { success: 4, failure: 1 } }, { id: "ship_with_bug", text: "Ship it with the bug - patch it post-launch", consequence: "Perfect is the enemy of done", alignment: "risky", stepScore: { betting: true, range: [-2, 3] } }, { id: "delay_launch", text: "Delay the launch 48 hours", consequence: "Quality over deadlines", alignment: "cautious", stepScore: 1 }, { id: "outsource_fix", text: "Hire emergency contractors to fix it", consequence: "Money solves problems", alignment: "pragmatic", stepScore: 2, cost: 15e3 }] }, { id: "launch_moment", stepNumber: 2, title: "\u{1F386} Go Live", cinematicText: "3... 2... 1...\n\nThe button is pressed. Your product is live. Everyone holds their breath.\n\n{employee3} refreshes the dashboard obsessively. {employee1} is stress-eating chips.\n\nThe first reviews start coming in. The first bug reports. The first... praise?", choices: [{ id: "monitor_closely", text: "War room mode - monitor everything in real-time", consequence: "Knowledge is power", alignment: "calculating", stepScore: 2 }, { id: "celebrate_early", text: "Pop the champagne - we made it this far!", consequence: "Morale matters", alignment: "charismatic", stepScore: 2 }, { id: "engage_users", text: "Jump into forums and social - engage directly with users", consequence: "Show you care", alignment: "humble", minigame: { type: "intensity", difficulty: "medium", label: "Community Engagement" }, stepScore: { success: 3, failure: 1 } }, { id: "prepare_for_worst", text: "Prepare rollback procedures just in case", consequence: "Hope for the best, plan for the worst", alignment: "cautious", stepScore: 2 }] }, { id: "the_crisis", stepNumber: 3, title: "\u{1F525} The 3 AM Crisis", cinematicText: `Your phone screams at 3 AM. The servers are on fire. Not literally, but basically.

Usage is 10x projections. The product is too successful. Infrastructure is buckling.

{employee2} is already at the office. "Boss, if we don't scale RIGHT NOW, we lose everyone."`, choices: [{ id: "throw_money", text: "Throw money at cloud resources immediately", consequence: "Scale or die", alignment: "determined", stepScore: 3, cost: 25e3 }, { id: "queue_system", text: "Implement a waiting queue - manage expectations", consequence: "Controlled chaos", alignment: "pragmatic", stepScore: 2 }, { id: "limit_access", text: "Temporarily limit new signups", consequence: "Artificial scarcity... works sometimes", alignment: "calculating", stepScore: 2 }, { id: "all_nighter", text: "Rally the team for an all-night optimization sprint", consequence: "We fix it together", alignment: "charismatic", minigame: { type: "composure", difficulty: "hard", label: "Team Rally" }, stepScore: { success: 4, failure: 1 } }] }, { id: "the_reviews", stepNumber: 4, title: "\u{1F4CA} The Verdict", cinematicText: '48 hours post-launch. The dust is settling.\n\nTech blogs have published their reviews. Users have spoken. Your team is exhausted but watching the numbers.\n\n{employee1} pulls up the final dashboard. "Boss... you should see this."', isFinalStep: true, choices: [{ id: "team_celebration", text: "Throw an epic team celebration", consequence: "Victory deserves recognition", alignment: "charismatic", stepScore: 2, cost: 5e3 }, { id: "plan_next_version", text: "Immediately start planning version 2.0", consequence: "Never stop improving", alignment: "ambitious", stepScore: 1 }, { id: "thank_users", text: "Public thank you to early adopters", consequence: "Community is everything", alignment: "humble", stepScore: 2 }, { id: "analyze_data", text: "Deep dive into the data - what worked, what didn't", consequence: "Learn from everything", alignment: "calculating", stepScore: 2 }] }], finalOutcomes: { legendary: { threshold: 12, title: "\u{1F31F} Breakout Success", text: "Your product is the talk of the industry. Downloads are through the roof. This changes everything.", effects: { bonus_cash: 3e5, boost_all_productivity: 30, reputation_boost: 35, boost_product: { multiplier: 2, duration: 30 } } }, excellent: { threshold: 9, title: "\u{1F3AF} Solid Launch", text: "Strong reviews, good adoption. You've got something here.", effects: { bonus_cash: 15e4, boost_all_productivity: 20, reputation_boost: 20 } }, good: { threshold: 6, title: "\u2705 Successful Release", text: "It works, people like it. Time to iterate.", effects: { bonus_cash: 75e3, boost_all_productivity: 10, reputation_boost: 10 } }, neutral: { threshold: 3, title: "\u{1F610} Mixed Reception", text: "Some love it, some hate it. The usual.", effects: { bonus_cash: 25e3 } }, poor: { threshold: -100, title: "\u{1F4A5} Launch Disaster", text: "Bugs, crashes, and angry users. The press is brutal. Back to the drawing board.", effects: { reputation_hit: 25, decrease_all_productivity: 15, decrease_all_trust: 10 } } } }, the_conference: { id: "the_conference", title: "\u{1F3AA} The Conference", description: "The biggest industry event of the year. Network, learn, and compete.", theme: "networking", mood: "opportunity", totalSteps: 4, requiredEmployees: 2, unlockConditions: { minEmployees: 4, minCash: 3e4, minAct: 2 }, themeColor: "var(--ap)", steps: [{ id: "arrival", stepNumber: 1, title: "\u2708\uFE0F Arrival", cinematicText: `The conference center buzzes with energy. Name badges, corporate banners, and the smell of opportunity.

{employee1} nudges you. "There's the CEO of Quantum Dynamics. And isn't that the editor from TechDaily?"

Your schedule is packed but flexible. Where do you focus your energy?`, choices: [{ id: "keynote_focus", text: "Attend the marquee keynotes - learn from the best", consequence: "Knowledge is the best networking", alignment: "humble", stepScore: 2 }, { id: "vip_lounge", text: "Head straight for the VIP networking lounge", consequence: "Rub elbows with power players", alignment: "ambitious", minigame: { type: "composure", difficulty: "medium", label: "Schmoozing" }, stepScore: { success: 3, failure: 1 } }, { id: "booth_crawl", text: "Walk the expo floor - see what competitors are showing", consequence: "Know thy enemy", alignment: "calculating", stepScore: 2 }, { id: "find_press", text: "Track down journalists and bloggers", consequence: "Free publicity awaits", alignment: "charismatic", stepScore: 2 }] }, { id: "the_encounter", stepNumber: 2, title: "\u{1F91D} The Connection", cinematicText: `You bump into someone at the coffee bar. Literally bump into them, spilling your drink on their jacket.

"Oh god, I'm so\u2014" you start. Then you recognize them. It's Alex Rivera, legendary angel investor with a billion-dollar portfolio.

They laugh it off. "Worst pitch I've ever received. But I admire the approach."`, choices: [{ id: "smooth_recovery", text: "Smooth recovery - turn accident into elevator pitch", consequence: "Fortune favors the bold", alignment: "charismatic", minigame: { type: "intensity", difficulty: "hard", label: "Impromptu Pitch" }, stepScore: { success: 4, failure: 1 } }, { id: "apologize_leave", text: "Apologize profusely and flee", consequence: "Some opportunities aren't meant to be", alignment: "cautious", stepScore: 0 }, { id: "offer_to_pay", text: "Offer to pay for dry cleaning, exchange cards", consequence: "Professional and classy", alignment: "pragmatic", stepScore: 2, cost: 500 }, { id: "joke_about_it", text: `"Well, you'll never forget meeting me now!"`, consequence: "Memorable, one way or another", alignment: "risky", stepScore: { betting: true, range: [-1, 3] } }] }, { id: "competitor_drama", stepNumber: 3, title: "\u2694\uFE0F The Rival", cinematicText: 'At the evening reception, you spot your biggest competitor across the room. Their CEO locks eyes with you and walks over.\n\n"Well, well. Look who showed up." They smirk. "I heard about your little product launch. Cute."\n\n{employee1} tenses up beside you. Others are watching.', choices: [{ id: "kill_with_kindness", text: '"Congratulations on your recent funding round!"', consequence: "Kill them with kindness", alignment: "diplomatic", stepScore: 3 }, { id: "confident_response", text: '"Cute sells. Check our numbers."', consequence: "Confidence backed by results", alignment: "ambitious", stepScore: 2 }, { id: "ignore_them", text: "Politely excuse yourself and walk away", consequence: "Not worth your energy", alignment: "cautious", stepScore: 1 }, { id: "challenge_publicly", text: `"Let's settle this on stage tomorrow. Public debate."`, consequence: "High risk, high reward", alignment: "defiant", minigame: { type: "tension", difficulty: "hard", label: "Public Challenge" }, stepScore: { success: 5, failure: -1 } }] }, { id: "final_night", stepNumber: 4, title: "\u{1F303} The After-Party", cinematicText: `The official conference is over, but the real networking happens at the unofficial after-party.

You've collected a stack of business cards, made some connections, maybe some enemies. {employee1} looks exhausted but exhilarated.

"So boss, was it worth the trip?"`, isFinalStep: true, choices: [{ id: "stay_late", text: "Stay until the bitter end - maximize networking", consequence: "Every handshake counts", alignment: "ambitious", stepScore: 2 }, { id: "quality_conversations", text: "Focus on three deep conversations with key contacts", consequence: "Quality over quantity", alignment: "calculating", stepScore: 2 }, { id: "leave_early", text: "Call it a night - you've got what you came for", consequence: "Know when to fold", alignment: "pragmatic", stepScore: 1 }, { id: "throw_own_party", text: "Invite select people to your own impromptu gathering", consequence: "Create your own playing field", alignment: "charismatic", stepScore: 3, cost: 3e3 }] }], finalOutcomes: { legendary: { threshold: 12, title: "\u{1F31F} Conference Legend", text: "You made connections that will define your next decade. Your name is buzzing in all the right circles.", effects: { bonus_cash: 1e5, reputation_boost: 40, boost_all_trust: 15, bonus_hire: { discount: 50, duration: 30 } } }, excellent: { threshold: 9, title: "\u{1F91D} Master Networker", text: "Excellent connections made. Follow-up meetings already scheduled.", effects: { bonus_cash: 5e4, reputation_boost: 25, boost_all_trust: 10 } }, good: { threshold: 6, title: "\u2705 Productive Trip", text: "Good contacts, useful insights. Money well spent.", effects: { bonus_cash: 25e3, reputation_boost: 15 } }, neutral: { threshold: 3, title: "\u{1F610} Standard Conference", text: "Some cards exchanged, some talks attended. The usual.", effects: { reputation_boost: 5 } }, poor: { threshold: -100, title: "\u{1F480} Networking Disaster", text: "Spilled drinks, burned bridges, and one very public embarrassment. Maybe skip next year.", effects: { reputation_hit: 15, decrease_all_trust: 10 } } } }, the_mentorship: { id: "the_mentorship", title: "\u{1F393} The Mentorship", description: "A struggling employee needs guidance. Your investment in them could pay dividends\u2014or cost you.", theme: "development", mood: "heartfelt", totalSteps: 3, requiredEmployees: 2, unlockConditions: { minEmployees: 4, minCash: 1e4, minAct: 1 }, themeColor: "#1abc9c", steps: [{ id: "struggling_employee", stepNumber: 1, title: "\u{1F4C9} The Struggle", cinematicText: `{employee1}'s numbers have been slipping. Missed deadlines, distracted in meetings, quality dropping.

You pull them aside. Their eyes are red. "I'm sorry, boss. I've been going through some stuff. I know I'm not performing."

They look terrified. Like they're expecting to be fired on the spot.`, choices: [{ id: "offer_support", text: `"Tell me what's going on. Maybe I can help."`, consequence: "Leaders support their people", alignment: "light", stepScore: 3 }, { id: "set_expectations", text: '"I need you back on track in two weeks."', consequence: "Clear boundaries, clear expectations", alignment: "pragmatic", stepScore: 2 }, { id: "pip", text: "Put them on a Performance Improvement Plan", consequence: "By the book", alignment: "lawful", stepScore: 1 }, { id: "immediate_termination", text: `"I'm sorry, but this isn't working out."`, consequence: "Business is business", alignment: "ruthless", stepScore: -1 }] }, { id: "investment", stepNumber: 2, title: "\u{1F4AA} The Investment", cinematicText: `You've decided to invest in {employee1}. Weekly check-ins, skills training, maybe even some mentoring sessions.

{employee2} pulls you aside. "Boss, are you sure about this? That's a lot of your time for someone who might not make it."

It's a fair point. Your time is valuable. But so is loyalty.`, choices: [{ id: "personal_mentoring", text: "Commit to personal mentoring sessions", consequence: "The best investment is in people", alignment: "light", minigame: { type: "intensity", difficulty: "medium", label: "Mentoring Session" }, stepScore: { success: 4, failure: 1 } }, { id: "hire_coach", text: "Hire an external coach for them", consequence: "Professional development matters", alignment: "pragmatic", stepScore: 2, cost: 5e3 }, { id: "peer_buddy", text: "Pair them with {employee2} as a mentor", consequence: "Peer support can be powerful", alignment: "calculating", stepScore: 2 }, { id: "sink_or_swim", text: `"I'll check in, but they need to figure this out themselves"`, consequence: "Self-reliance is a skill", alignment: "cautious", stepScore: 1 }] }, { id: "the_turnaround", stepNumber: 3, title: "\u{1F331} The Growth", cinematicText: `Weeks later. {employee1} knocks on your door.

"Boss? I wanted to show you something." They pull up a dashboard. Their numbers aren't just recovered\u2014they're the best on the team.

"I couldn't have done this without you believing in me," they say, voice thick with emotion.`, isFinalStep: true, choices: [{ id: "celebrate_growth", text: "Publicly recognize their turnaround", consequence: "Success deserves celebration", alignment: "light", stepScore: 3 }, { id: "new_responsibilities", text: "Offer them new challenges and responsibilities", consequence: "Growth should lead to growth", alignment: "ambitious", stepScore: 2 }, { id: "stay_humble", text: '"You did this. I just gave you a chance."', consequence: "Credit where credit is due", alignment: "humble", stepScore: 2 }, { id: "pay_it_forward", text: `"Now it's your turn to mentor someone else."`, consequence: "The cycle continues", alignment: "charismatic", stepScore: 3 }] }], finalOutcomes: { legendary: { threshold: 9, title: "\u{1F31F} Transformative Leader", text: "Your mentorship changed a life. {employee1} will never forget what you did. Neither will the rest of the team.", effects: { boost_all_trust: 25, boost_all_productivity: 15, unlock_perk: { perkId: "mentorship_culture", name: "Mentorship Culture", description: "New hires ramp up 25% faster" } } }, excellent: { threshold: 6, title: "\u{1F393} Great Mentor", text: "You turned a struggling employee into a star. Your team sees what kind of leader you are.", effects: { boost_all_trust: 20, boost_all_productivity: 10 } }, good: { threshold: 3, title: "\u2705 Successful Development", text: "They made it. Your patience paid off.", effects: { boost_all_trust: 10 } }, neutral: { threshold: 0, title: "\u{1F610} Uncertain Outcome", text: "Results are mixed. Time will tell if this was worth it.", effects: { boost_all_trust: 5 } }, poor: { threshold: -100, title: "\u{1F494} Failed Investment", text: "Despite everything, they couldn't turn it around. Or they left anyway. Was it worth it?", effects: { decrease_all_trust: 10, random_employee_quits: true } } } }, the_inspection: { id: "the_inspection", title: "\u{1F50E} The Inspection", description: "Government inspectors are coming. Everything needs to be perfect\u2014or appear to be.", theme: "compliance", mood: "nerve-wracking", totalSteps: 4, requiredEmployees: 3, unlockConditions: { minEmployees: 6, minCash: 4e4, minAct: 2 }, themeColor: "#c0392b", steps: [{ id: "the_notice", stepNumber: 1, title: "\u{1F4CB} The Notice", cinematicText: `The letter arrives with an official government seal. "Pursuant to regulations... inspection scheduled... compliance review..."

{employee1} reads over your shoulder. "Boss, we're not exactly... fully compliant. Those safety updates we've been putting off..."

You have one week to prepare.`, choices: [{ id: "full_compliance_push", text: "Emergency compliance push - fix everything legitimately", consequence: "Do it right, do it fast", alignment: "lawful", stepScore: 3, cost: 2e4 }, { id: "selective_fixes", text: "Fix only the most visible issues", consequence: "Triage mode", alignment: "calculating", stepScore: 2 }, { id: "document_cover", text: "Focus on paperwork - make sure documentation is perfect", consequence: "Inspectors love paperwork", alignment: "cunning", minigame: { type: "recall", difficulty: "medium", label: "Documentation Review" }, stepScore: { success: 3, failure: 1 } }, { id: "hire_consultant", text: "Hire a compliance consultant immediately", consequence: "Expert help for expert problems", alignment: "pragmatic", stepScore: 2, cost: 1e4 }] }, { id: "inspection_day", stepNumber: 2, title: "\u{1F4DD} The Day Arrives", cinematicText: `Two inspectors walk in with clipboards. They're thorough. Too thorough.

{employee2} is sweating bullets as they examine the fire exits. {employee3} is trying to distract them with coffee.

One inspector pauses at something. "Hmm. This is... interesting."`, choices: [{ id: "transparency_approach", text: "Be completely transparent - show them everything", consequence: "Nothing to hide means nothing to find", alignment: "lawful", stepScore: 2 }, { id: "charm_offensive", text: "Turn on the charm - make them like you", consequence: "Likeable people get favorable reviews", alignment: "charismatic", minigame: { type: "composure", difficulty: "hard", label: "Charm the Inspectors" }, stepScore: { success: 4, failure: 0 } }, { id: "technical_details", text: "Overwhelm them with technical details", consequence: "Confusion can be a strategy", alignment: "cunning", stepScore: 1 }, { id: "escort_closely", text: "Personally escort them - control what they see", consequence: "Guided tours reveal what you choose", alignment: "calculating", stepScore: 2 }] }, { id: "the_finding", stepNumber: 3, title: "\u26A0\uFE0F The Finding", cinematicText: `"We've found some violations," the lead inspector announces.

Your heart sinks. {employee1} looks like they might pass out.

"Nothing catastrophic, but there will need to be remediation. The question is how quickly you can address these."`, choices: [{ id: "immediate_action", text: `"We'll start today. Walk me through each item."`, consequence: "Proactive response", alignment: "determined", stepScore: 3 }, { id: "negotiate_timeline", text: "Negotiate for a longer remediation timeline", consequence: "Buy time to do it right", alignment: "diplomatic", minigame: { type: "tension", difficulty: "medium", label: "Timeline Negotiation" }, stepScore: { success: 3, failure: 1 } }, { id: "contest_findings", text: "Contest some of the findings", consequence: "Not everything they say is gospel", alignment: "defiant", stepScore: 1 }, { id: "accept_penalties", text: "Accept any penalties, commit to full compliance", consequence: "Take the hit, move forward", alignment: "lawful", stepScore: 2 }] }, { id: "the_verdict", stepNumber: 4, title: "\u{1F4CA} The Final Report", cinematicText: "The official report arrives. {employee1}, {employee2}, and {employee3} gather around as you open it.\n\nYour compliance rating, your violations, your required actions\u2014everything that determines whether you stay in business.\n\nThe team holds their breath.", isFinalStep: true, choices: [{ id: "share_openly", text: "Share the full report with the team", consequence: "Transparency builds trust", alignment: "lawful", stepScore: 2 }, { id: "action_plan", text: "Create a detailed action plan for compliance", consequence: "Turn weakness into strength", alignment: "pragmatic", stepScore: 2 }, { id: "celebrate_survival", text: "Celebrate surviving the inspection", consequence: "We made it through!", alignment: "charismatic", stepScore: 1 }, { id: "prevention_focus", text: "Focus on preventing future issues", consequence: "Learn from this experience", alignment: "calculating", stepScore: 2 }] }], finalOutcomes: { legendary: { threshold: 11, title: "\u2728 Exemplary Compliance", text: "Not only did you pass\u2014you impressed them. Your company is now cited as a model for the industry.", effects: { reputation_boost: 35, boost_all_trust: 20, investigation_cleared: true } }, excellent: { threshold: 8, title: "\u2705 Clean Bill", text: "Minor issues, quickly resolved. You're in good standing.", effects: { reputation_boost: 20, boost_all_trust: 10 } }, good: { threshold: 5, title: "\u{1F44D} Passed with Notes", text: "Some violations, reasonable timeline. Could be worse.", effects: { reputation_boost: 10 } }, neutral: { threshold: 2, title: "\u{1F610} Conditional Pass", text: "You passed, barely. Expect a follow-up inspection.", effects: { fine: 1e4 } }, poor: { threshold: -100, title: "\u274C Failed Inspection", text: "Significant violations. Heavy fines, possible shutdown. This is bad.", effects: { fine: 5e4, reputation_hit: 25, disable_product: { duration: 14 } } } } }, natural_disaster: { id: "natural_disaster", title: "\u{1F32A}\uFE0F The Storm", description: "A major storm is heading your way. Protect your people, your assets, and your future.", theme: "survival", mood: "urgent", totalSteps: 4, requiredEmployees: 4, unlockConditions: { minEmployees: 5, minCash: 25e3, minAct: 2 }, themeColor: "var(--av)", steps: [{ id: "warning", stepNumber: 1, title: "\u26A0\uFE0F The Warning", cinematicText: `The weather alert screams across every phone in the office. Category 4 storm, tracking directly toward you. 48 hours until landfall.

{employee1} looks up from their desk, face pale. "Boss, my family is in the evacuation zone."

{employee2} is already packing their bag. "What's the plan?"`, choices: [{ id: "immediate_closure", text: "Close the office immediately - everyone go home and prepare", consequence: "Safety first, always", alignment: "light", stepScore: 3 }, { id: "secure_then_leave", text: "Quick team effort to secure equipment, then everyone leaves", consequence: "Protect assets AND people", alignment: "pragmatic", stepScore: 2 }, { id: "essential_only", text: "Non-essential staff can leave, essential staff stays", consequence: "The work must continue", alignment: "calculating", stepScore: 1 }, { id: "coordinate_help", text: "Organize evacuation help for employees with families in danger", consequence: "We take care of our own", alignment: "charismatic", stepScore: 3, cost: 5e3 }] }, { id: "the_storm", stepNumber: 2, title: "\u{1F30A} The Storm Hits", cinematicText: `The wind howls. Power flickers. Your phone buzzes with texts from employees.

{employee3}: "Lost power. Kids are scared."
{employee2}: "Roof is leaking. Might need to evacuate."
{employee1}: "Mom's okay. Thank you for letting me go."

You're hunkered down, watching the radar, wondering about the office.`, choices: [{ id: "check_on_everyone", text: "Start a group chat - check on everyone systematically", consequence: "Connection matters in crisis", alignment: "light", stepScore: 2 }, { id: "offer_shelter", text: "Offer your place as shelter for anyone who needs it", consequence: "Open home, open heart", alignment: "charismatic", stepScore: 3 }, { id: "focus_on_business", text: "Monitor business systems - keep servers running if possible", consequence: "Someone has to think about tomorrow", alignment: "calculating", stepScore: 1 }, { id: "emergency_fund", text: "Set up emergency assistance fund for affected employees", consequence: "Put your money where your heart is", alignment: "light", stepScore: 3, cost: 15e3 }] }, { id: "aftermath", stepNumber: 3, title: "\u{1F3DA}\uFE0F The Aftermath", cinematicText: `The storm has passed. The sun feels wrong after so much darkness.

You drive to the office. A tree has gone through the conference room window. Water damage everywhere.

{employee1} calls. "Boss, my house..." they can't finish the sentence. {employee2}'s car was destroyed. {employee3} is helping neighbors dig out.`, choices: [{ id: "employee_first", text: "Prioritize employee assistance over business recovery", consequence: "People over profit", alignment: "light", minigame: { type: "intensity", difficulty: "medium", label: "Crisis Coordination" }, stepScore: { success: 4, failure: 2 } }, { id: "balance_both", text: "Split focus - help employees AND start business recovery", consequence: "We can do both", alignment: "pragmatic", stepScore: 2 }, { id: "remote_work", text: "Transition to remote work immediately - keep business running", consequence: "Adapt and survive", alignment: "calculating", stepScore: 2 }, { id: "community_effort", text: "Turn office recovery into a team building volunteer day", consequence: "Shared struggle builds bonds", alignment: "charismatic", stepScore: 3 }] }, { id: "rebuilding", stepNumber: 4, title: "\u{1F528} Rebuilding", cinematicText: `Weeks later. The office is repaired, but the experience has changed everyone.

{employee1}, {employee2}, and {employee3} stand together, looking at the new conference room window.

"We made it through," {employee1} says quietly. "I'll never forget how you handled this, boss."`, isFinalStep: true, choices: [{ id: "memorial_moment", text: "Create a small memorial for what was lost", consequence: "Honor the struggle", alignment: "humble", stepScore: 2 }, { id: "prepare_better", text: "Invest in better disaster preparedness for next time", consequence: "Learn and improve", alignment: "pragmatic", stepScore: 2 }, { id: "celebrate_resilience", text: 'Throw a "We Survived" celebration', consequence: "Celebrate victories, even hard-won ones", alignment: "charismatic", stepScore: 2, cost: 3e3 }, { id: "quiet_gratitude", text: "Express personal gratitude to each team member", consequence: "Sometimes quiet words mean the most", alignment: "light", stepScore: 3 }] }], finalOutcomes: { legendary: { threshold: 12, title: "\u{1F3C6} Unbreakable Team", text: "You didn't just survive\u2014you became a family. This experience forged bonds that will never break.", effects: { boost_all_trust: 35, boost_all_comfort: 30, loyalty_boost: 60, reputation_boost: 25 } }, excellent: { threshold: 9, title: "\u{1F4AA} Resilient Company", text: "You put people first and they'll remember that forever. The team is stronger than ever.", effects: { boost_all_trust: 25, boost_all_comfort: 20, reputation_boost: 15 } }, good: { threshold: 6, title: "\u2705 Recovery Complete", text: "You got through it. Not perfectly, but together.", effects: { boost_all_trust: 15, boost_all_comfort: 10 } }, neutral: { threshold: 3, title: "\u{1F610} Survived", text: "The business continues. The emotional scars remain.", effects: { boost_all_trust: 5 } }, poor: { threshold: -100, title: "\u{1F494} Broken Trust", text: "Your priorities during the crisis revealed something. Not everyone is coming back.", effects: { decrease_all_trust: 20, random_employee_quits: true, reputation_hit: 15 } } } }, sabbatical_request: { id: "sabbatical_request", title: "\u{1F334} The Sabbatical", description: "Your star employee wants an extended leave. Their reasons will surprise you.", theme: "work_life_balance", mood: "reflective", totalSteps: 3, requiredEmployees: 2, unlockConditions: { minEmployees: 4, minCash: 2e4, minAct: 2 }, themeColor: "#16a085", steps: [{ id: "the_request", stepNumber: 1, title: "\u2709\uFE0F The Request", cinematicText: `{employee1}\u2014your most reliable employee\u2014closes your office door.

"Boss, I need to ask you something big." They take a deep breath. "I want to take three months off. Unpaid is fine. I just... I need to do something."

They explain: A sick relative overseas. A dream they've been putting off. A personal project that could change their life.`, choices: [{ id: "approve_immediately", text: "Approve it on the spot - they've earned it", consequence: "Trust begets trust", alignment: "light", stepScore: 3 }, { id: "ask_for_details", text: "Ask for more details before deciding", consequence: "Due diligence", alignment: "calculating", stepScore: 2 }, { id: "negotiate_shorter", text: "Negotiate a shorter leave period", consequence: "Find the middle ground", alignment: "pragmatic", stepScore: 2 }, { id: "deny_request", text: `"I'm sorry, but we really need you here."`, consequence: "Business needs come first", alignment: "ruthless", stepScore: 0 }] }, { id: "the_gap", stepNumber: 2, title: "\u{1F4CA} Filling the Gap", cinematicText: `{employee1} is gone. Their absence is immediately felt.

{employee2} is drowning in extra work. Clients are asking where their favorite contact went. Projects are slipping.

"Boss," {employee2} says, exhausted, "I can't do both our jobs. Something has to give."`, choices: [{ id: "hire_temp", text: "Hire temporary help to cover", consequence: "Spend money to solve problems", alignment: "pragmatic", stepScore: 2, cost: 1e4 }, { id: "redistribute", text: "Redistribute work across the team with bonuses", consequence: "Share the burden fairly", alignment: "diplomatic", stepScore: 2, cost: 5e3 }, { id: "reduce_scope", text: "Temporarily reduce projects and commitments", consequence: "Accept limitations", alignment: "cautious", stepScore: 1 }, { id: "step_in_personally", text: "Step in personally to fill the gap", consequence: "Lead by example", alignment: "determined", minigame: { type: "composure", difficulty: "hard", label: "Extra Workload" }, stepScore: { success: 4, failure: 1 } }] }, { id: "the_return", stepNumber: 3, title: "\u{1F504} The Return", cinematicText: `Three months later. {employee1} walks back through the door, somehow different. More present. More alive.

"I can't thank you enough," they say, eyes glistening. "That time... it changed everything."

They're back. But the question remains: was it worth it?`, isFinalStep: true, choices: [{ id: "welcome_warmly", text: "Throw a welcome-back celebration", consequence: "Celebrate returns", alignment: "charismatic", stepScore: 2, cost: 1e3 }, { id: "debrief_meeting", text: "Have a one-on-one to discuss what they learned", consequence: "Growth deserves attention", alignment: "humble", stepScore: 3 }, { id: "back_to_work", text: `"Glad you're back. Here's what piled up."`, consequence: "Business as usual", alignment: "pragmatic", stepScore: 1 }, { id: "formalize_policy", text: "Create an official sabbatical policy for everyone", consequence: "Turn exception into opportunity", alignment: "lawful", stepScore: 3 }] }], finalOutcomes: { legendary: { threshold: 9, title: "\u{1F31F} Enlightened Workplace", text: "Your handling of this created a culture where people can be human. Productivity AND loyalty have never been higher.", effects: { boost_all_trust: 30, boost_all_comfort: 25, boost_all_productivity: 15, unlock_perk: { perkId: "sabbatical_policy", name: "Sabbatical Policy", description: "Employees never quit from burnout" } } }, excellent: { threshold: 6, title: "\u{1F49A} Supportive Leader", text: "You showed that you care about your people as people. That matters.", effects: { boost_all_trust: 20, boost_all_comfort: 15 } }, good: { threshold: 3, title: "\u2705 Handled Well", text: "You made it work. Not easy, but worth it.", effects: { boost_all_trust: 10, boost_all_comfort: 10 } }, neutral: { threshold: 0, title: "\u{1F610} Survived the Gap", text: "They left, they came back. Life goes on.", effects: { boost_all_trust: 5 } }, poor: { threshold: -100, title: "\u{1F494} Resentment", text: "Your handling created frustration on all sides. Some bridges were burned.", effects: { decrease_all_trust: 15, decrease_all_comfort: 10 } } } }, the_intern: { id: "the_intern", title: "\u{1F392} The Intern", description: "A well-connected intern joins your team. They could be an asset... or a liability.", theme: "mentorship", mood: "coming-of-age", totalSteps: 3, requiredEmployees: 2, unlockConditions: { minEmployees: 3, minCash: 15e3, minAct: 1 }, themeColor: "var(--bl)", steps: [{ id: "arrival", stepNumber: 1, title: "\u{1F44B} First Day", cinematicText: `A nervous college student stands in your lobby. Jordan Chen\u2014their family owns a major client company.

"I'm really excited to learn from you all," they say, clutching a brand-new notebook.

{employee1} leans over. "Boss, that's Senator Chen's kid. No pressure, right?"`, choices: [{ id: "personal_attention", text: "Take them under your wing personally", consequence: "Your time is valuable, but so are connections", alignment: "light", stepScore: 3 }, { id: "assign_mentor", text: "Assign {employee1} as their mentor", consequence: "Delegate the responsibility", alignment: "pragmatic", stepScore: 2 }, { id: "trial_by_fire", text: "Throw them into a real project immediately", consequence: "Sink or swim", alignment: "ruthless", stepScore: 1 }, { id: "coffee_runs", text: "Start them on basic tasks - coffee runs, filing", consequence: "Everyone starts somewhere", alignment: "cautious", stepScore: 1 }] }, { id: "the_mistake", stepNumber: 2, title: "\u{1F4A5} The Disaster", cinematicText: `Jordan deleted the client presentation. The one due in three hours. To the client who happens to be their family's company.

"I... I thought I was saving it," they stammer, face white as a sheet.

{employee2} is rebuilding what they can. "Boss, we might be able to recover some of it, but..."`, choices: [{ id: "take_blame", text: "Take the blame yourself to protect the intern", consequence: "Fall on your sword", alignment: "light", stepScore: 3 }, { id: "learning_moment", text: "Use this as a teaching moment - mistakes happen", consequence: "Growth through failure", alignment: "humble", stepScore: 2 }, { id: "damage_control", text: "Focus on fixing it, deal with blame later", consequence: "Priorities first", alignment: "pragmatic", minigame: { type: "reflex", difficulty: "hard", label: "Crisis Recovery" }, stepScore: { success: 4, failure: 1 } }, { id: "call_family", text: "Call their family and explain the situation", consequence: "Transparency, even if awkward", alignment: "lawful", stepScore: 1 }] }, { id: "the_offer", stepNumber: 3, title: "\u{1F393} Graduation", cinematicText: `The internship is ending. Jordan has grown\u2014they're actually competent now.

Senator Chen calls. "My kid can't stop talking about your company. They want to work there full-time after graduation."

{employee1} and {employee2} exchange looks. Jordan watches you nervously.`, isFinalStep: true, choices: [{ id: "hire_them", text: "Offer them a full-time position", consequence: "Invest in their growth", alignment: "light", stepScore: 3 }, { id: "recommend_elsewhere", text: "Recommend them to a better-suited company", consequence: "Honest about fit", alignment: "pragmatic", stepScore: 2 }, { id: "keep_options_open", text: `"Let's see how your final semester goes"`, consequence: "Don't commit yet", alignment: "cautious", stepScore: 1 }, { id: "leverage_connection", text: "Hire them AND leverage the family connection", consequence: "Play the long game", alignment: "ambitious", stepScore: 2 }] }], finalOutcomes: { legendary: { threshold: 9, title: "\u{1F31F} Mentor of the Year", text: "Jordan thrives, and their family becomes your biggest advocate. Sometimes kindness is the best strategy.", effects: { bonus_cash: 1e5, reputation_boost: 30, boost_all_trust: 15 } }, excellent: { threshold: 6, title: "\u{1F468}\u200D\u{1F393} Good Investment", text: "The internship was a success. New connections opened, lessons learned.", effects: { bonus_cash: 5e4, reputation_boost: 20, boost_all_trust: 10 } }, good: { threshold: 3, title: "\u2705 Adequate Experience", text: "They learned something. You didn't make enemies.", effects: { reputation_boost: 10 } }, neutral: { threshold: 0, title: "\u{1F610} Forgettable Stint", text: "Just another intern. Came, learned a little, left.", effects: {} }, poor: { threshold: -100, title: "\u{1F480} Bridge Burned", text: "The Chen family is NOT happy. That connection? Gone.", effects: { reputation_hit: 25, decrease_all_trust: 10 } } } }, celebrity_visit: { id: "celebrity_visit", title: "\u2B50 The Celebrity Visit", description: "A famous influencer wants to feature your company. Fame is a double-edged sword.", theme: "publicity", mood: "exciting", totalSteps: 4, requiredEmployees: 3, unlockConditions: { minEmployees: 6, minCash: 5e4, minAct: 2 }, themeColor: "#e91e63", steps: [{ id: "the_dm", stepNumber: 1, title: "\u{1F4F1} The DM", cinematicText: '"OMG @YourCompany is giving MAJOR vibes. Can we collab?"\n\nThe message is from @SkylarStorm\u201410 million followers, massive influence. Their team wants to film a "day in the life" at your office.\n\n{employee1} is already freaking out. "Boss, do you know who that IS?"', choices: [{ id: "enthusiastic_yes", text: "Respond immediately with an enthusiastic yes", consequence: "Strike while the iron is hot", alignment: "ambitious", stepScore: 2 }, { id: "negotiate_terms", text: "Negotiate terms and editorial control", consequence: "Protect your brand", alignment: "calculating", stepScore: 2 }, { id: "research_first", text: "Research their content and audience first", consequence: "Due diligence", alignment: "cautious", minigame: { type: "recall", difficulty: "medium", label: "Social Media Analysis" }, stepScore: { success: 3, failure: 1 } }, { id: "polite_decline", text: "Politely decline - too risky", consequence: "Some press isn't worth it", alignment: "cautious", stepScore: 0 }] }, { id: "filming_day", stepNumber: 2, title: "\u{1F3AC} Lights, Camera...", cinematicText: `Skylar arrives with a full production crew. Drones, lights, the works.

They're charming, energetic... and asking increasingly personal questions about your employees.

{employee2} pulls you aside. "They're asking about salaries and workplace gossip. Is that okay?"`, choices: [{ id: "full_access", text: "Give them full access - authenticity sells", consequence: "What could go wrong?", alignment: "risky", stepScore: { betting: true, range: [-2, 4] } }, { id: "guided_tour", text: "Provide a curated, guided experience", consequence: "Control the narrative", alignment: "calculating", stepScore: 2 }, { id: "set_boundaries", text: "Firmly set boundaries - no personal questions", consequence: "Protect your people", alignment: "light", stepScore: 2 }, { id: "distract_with_spectacle", text: "Distract them with an impressive demo/event", consequence: "Give them something better to film", alignment: "charismatic", minigame: { type: "intensity", difficulty: "hard", label: "Showmanship" }, stepScore: { success: 4, failure: 1 } }] }, { id: "the_edit", stepNumber: 3, title: "\u2702\uFE0F The Edit", cinematicText: `Days later, Skylar's team sends a preview of the video.

It's... not what you expected. Some moments are great. Others are taken completely out of context. {employee3}'s joke sounds mean. Your response to a question sounds dismissive.

"This goes live in 24 hours," their manager says. "Any feedback?"`, choices: [{ id: "request_changes", text: "Request specific changes to the edit", consequence: "Fight for accuracy", alignment: "diplomatic", minigame: { type: "composure", difficulty: "hard", label: "Editorial Negotiation" }, stepScore: { success: 4, failure: 0 } }, { id: "offer_money", text: "Offer payment for a more favorable edit", consequence: "Money talks", alignment: "cunning", stepScore: 2, cost: 2e4 }, { id: "trust_the_process", text: "Accept it - their audience knows their style", consequence: "Let it go", alignment: "humble", stepScore: 1 }, { id: "prepare_counter", text: "Prepare your own response video just in case", consequence: "Have a backup plan", alignment: "calculating", stepScore: 2 }] }, { id: "viral", stepNumber: 4, title: "\u{1F4C8} Going Viral", cinematicText: "The video drops. Notifications explode. Your website traffic spikes 5000%.\n\nComments are... mixed. Some people love it. Some are roasting you. {employee1}'s face became a meme.\n\n{employee2} shows you a trending hashtag. Your company name. Is that good or bad?", isFinalStep: true, choices: [{ id: "lean_in", text: "Lean into it - engage with the memes", consequence: "If you can't beat them...", alignment: "charismatic", stepScore: 3 }, { id: "professional_statement", text: "Release a professional statement", consequence: "Maintain dignity", alignment: "lawful", stepScore: 2 }, { id: "wait_it_out", text: "Say nothing - it'll blow over", consequence: "Patience is a virtue", alignment: "cautious", stepScore: 1 }, { id: "capitalize", text: "Launch a flash sale/promotion to capitalize", consequence: "Strike while trending", alignment: "ambitious", stepScore: 2 }] }], finalOutcomes: { legendary: { threshold: 12, title: "\u{1F4AB} Viral Sensation", text: "You didn't just survive the spotlight\u2014you owned it. Your brand is now synonymous with cool.", effects: { bonus_cash: 2e5, reputation_boost: 50, boost_all_productivity: 20 } }, excellent: { threshold: 8, title: "\u{1F4F8} Good Press", text: "More people know your name, and mostly in a good way.", effects: { bonus_cash: 1e5, reputation_boost: 25, boost_all_productivity: 10 } }, good: { threshold: 5, title: "\u2705 Survived Fame", text: "The video came and went. You're still standing.", effects: { bonus_cash: 5e4, reputation_boost: 10 } }, neutral: { threshold: 2, title: "\u{1F610} Fifteen Minutes", text: "A brief moment in the spotlight. Already forgotten.", effects: { reputation_boost: 5 } }, poor: { threshold: -100, title: "\u{1F480} PR Nightmare", text: "The video went viral for all the wrong reasons. The memes are brutal.", effects: { reputation_hit: 30, decrease_all_comfort: 15, decrease_all_trust: 10 } } } }, the_lawsuit: { id: "the_lawsuit", title: "\u2696\uFE0F The Lawsuit", description: "A former employee is suing. The truth will come out\u2014one way or another.", theme: "legal", mood: "tense", totalSteps: 4, requiredEmployees: 3, unlockConditions: { minEmployees: 5, minCash: 75e3, minAct: 2 }, themeColor: "#795548", steps: [{ id: "the_summons", stepNumber: 1, title: "\u{1F4DC} The Summons", cinematicText: `A process server hands you papers. "You've been served."

It's from Marcus Webb\u2014a former employee terminated six months ago. Wrongful termination. Hostile work environment. The works.

{employee1} goes pale. "Boss, I worked with Marcus. This could get ugly."`, choices: [{ id: "hire_lawyer", text: "Hire the best employment lawyer immediately", consequence: "Don't bring a knife to a gunfight", alignment: "pragmatic", stepScore: 3, cost: 25e3 }, { id: "investigate_first", text: "Investigate internally before responding", consequence: "Know your weaknesses", alignment: "calculating", minigame: { type: "recall", difficulty: "hard", label: "Internal Investigation" }, stepScore: { success: 4, failure: 1 } }, { id: "reach_out", text: "Try to reach Marcus directly", consequence: "Maybe this can be resolved quietly", alignment: "diplomatic", stepScore: 2 }, { id: "dismiss_it", text: "It's probably nothing - handle it later", consequence: "Ignore at your peril", alignment: "risky", stepScore: 0 }] }, { id: "discovery", stepNumber: 2, title: "\u{1F50D} Discovery", cinematicText: 'The discovery process begins. Lawyers are requesting emails, Slack messages, performance reviews\u2014everything.\n\n{employee2} approaches you nervously. "Boss, some of my messages might look bad out of context. I was joking, but..."\n\nYou remember some of your own communications. Are they pristine?', choices: [{ id: "full_transparency", text: "Provide everything - complete transparency", consequence: "Nothing to hide", alignment: "lawful", stepScore: 2 }, { id: "narrow_scope", text: "Provide only what's legally required", consequence: "Play by the rules, but narrowly", alignment: "calculating", stepScore: 2 }, { id: "coach_team", text: "Coach the team on what to say", consequence: "Coordinate the message", alignment: "cunning", stepScore: 1 }, { id: "settle_now", text: "Try to settle before discovery reveals more", consequence: "Cut your losses", alignment: "pragmatic", stepScore: 2, cost: 5e4 }] }, { id: "deposition", stepNumber: 3, title: "\u{1F3A4} The Deposition", cinematicText: `You're under oath. Marcus's lawyer is across the table, asking pointed questions.

"Did you ever make comments about Marcus's personal life in the workplace?"

Your lawyer squeezes your arm. This is the moment that could make or break the case.`, choices: [{ id: "honest_answer", text: "Answer honestly, even if it hurts", consequence: "The truth will set you free... or not", alignment: "lawful", minigame: { type: "composure", difficulty: "hard", label: "Deposition Composure" }, stepScore: { success: 4, failure: 1 } }, { id: "careful_wording", text: "Answer carefully with lawyer-approved phrasing", consequence: "Technical truths", alignment: "calculating", stepScore: 2 }, { id: "memory_lapses", text: `"I don't recall" as much as possible`, consequence: "The politician's playbook", alignment: "cunning", stepScore: 1 }, { id: "own_mistakes", text: "Own your mistakes but defend your intentions", consequence: "Humble but firm", alignment: "humble", stepScore: 3 }] }, { id: "the_verdict", stepNumber: 4, title: "\u{1F3DB}\uFE0F Resolution", cinematicText: `After months of stress, it's finally ending. Your lawyer presents options.

"We can settle for $75,000 and an NDA. Or we go to trial\u2014risky but you might win outright."

{employee1}, {employee2}, and {employee3} are watching. This will define your company's values.`, isFinalStep: true, choices: [{ id: "settle_quietly", text: "Settle and make this go away", consequence: "End it now", alignment: "pragmatic", stepScore: 2, cost: 75e3 }, { id: "fight_to_win", text: "Go to trial - fight for vindication", consequence: "All or nothing", alignment: "defiant", stepScore: { betting: true, range: [-2, 5] } }, { id: "apologize_publicly", text: "Settle AND publicly apologize, change policies", consequence: "Growth through accountability", alignment: "light", stepScore: 3, cost: 1e5 }, { id: "mediation", text: "Propose mediation with a neutral third party", consequence: "Find middle ground", alignment: "diplomatic", stepScore: 2 }] }], finalOutcomes: { legendary: { threshold: 11, title: "\u2696\uFE0F Justice Served", text: "The case resolved in a way that made everyone better. Your handling became a model for workplace disputes.", effects: { reputation_boost: 30, boost_all_trust: 25, unlock_perk: { perkId: "employment_standards", name: "Gold Standard HR", description: "Legal disputes 50% less likely" } } }, excellent: { threshold: 8, title: "\u2705 Clean Resolution", text: "It's over, and you came out relatively unscathed. Lessons learned.", effects: { reputation_boost: 15, boost_all_trust: 15 } }, good: { threshold: 5, title: "\u{1F44D} Survived", text: "It cost you, but the company is still standing.", effects: { reputation_boost: 5 } }, neutral: { threshold: 2, title: "\u{1F610} Pyrrhic Victory", text: "Technically won, but at what cost?", effects: { decrease_all_trust: 10 } }, poor: { threshold: -100, title: "\u{1F480} Legal Disaster", text: "The verdict or settlement was devastating. Your reputation in the industry is severely damaged.", effects: { fine: 15e4, reputation_hit: 40, decrease_all_trust: 25 } } } }, office_renovation: { id: "office_renovation", title: "\u{1F3D7}\uFE0F The Renovation", description: "Time to upgrade the office. But construction never goes as planned.", theme: "growth", mood: "chaotic", totalSteps: 4, requiredEmployees: 4, unlockConditions: { minEmployees: 6, minCash: 1e5, minAct: 2 }, themeColor: "var(--bs)", steps: [{ id: "the_plan", stepNumber: 1, title: "\u{1F4D0} The Blueprint", cinematicText: `The architect spreads blueprints across your desk. "Open floor plan, standing desks, meditation room, or private offices? Your call."

{employee1} loves the open concept. {employee2} is horrified by it. {employee3} just wants a bigger break room.

The budget is tight. You can't please everyone.`, choices: [{ id: "modern_open", text: "Go modern - open floor plan with collaboration spaces", consequence: "Trendy but divisive", alignment: "ambitious", stepScore: 2 }, { id: "traditional", text: "Traditional - private offices and quiet spaces", consequence: "Classic for a reason", alignment: "cautious", stepScore: 2 }, { id: "survey_team", text: "Survey the team and design around their needs", consequence: "Democracy in design", alignment: "light", minigame: { type: "intensity", difficulty: "medium", label: "Team Survey" }, stepScore: { success: 4, failure: 2 } }, { id: "hybrid", text: "Hybrid approach - something for everyone", consequence: "Compromise is expensive", alignment: "diplomatic", stepScore: 2, cost: 3e4 }] }, { id: "construction", stepNumber: 2, title: "\u{1F528} Construction Chaos", cinematicText: 'Week two of construction. The noise is unbearable. Dust is everywhere.\n\n{employee2} is having video calls from their car. {employee3} found a mouse.\n\nThe contractor approaches. "We found some... issues. Gonna need another two weeks. Maybe three."', choices: [{ id: "pay_expedite", text: "Pay extra to expedite", consequence: "Money solves problems", alignment: "pragmatic", stepScore: 2, cost: 25e3 }, { id: "remote_week", text: "Send everyone home - remote work week", consequence: "Escape the chaos", alignment: "light", stepScore: 2 }, { id: "push_through", text: "We push through - business as usual", consequence: "Tough it out together", alignment: "determined", minigame: { type: "composure", difficulty: "hard", label: "Construction Resilience" }, stepScore: { success: 4, failure: 0 } }, { id: "temporary_space", text: "Rent temporary office space", consequence: "Professional but pricey", alignment: "pragmatic", stepScore: 2, cost: 15e3 }] }, { id: "the_discovery", stepNumber: 3, title: "\u{1F573}\uFE0F The Discovery", cinematicText: `The construction crew found something behind the old wall. A time capsule from the previous company? No\u2014it's evidence of corner-cutting. Asbestos. Not a lot, but enough to require proper removal.

"This is gonna cost ya," the contractor says. "But legally, you gotta handle it."

{employee1} is panicking about health concerns.`, choices: [{ id: "full_remediation", text: "Full professional remediation - safety first", consequence: "The only real option", alignment: "lawful", stepScore: 3, cost: 4e4 }, { id: "minimal_approach", text: "Minimum required removal only", consequence: "Meet the letter of the law", alignment: "calculating", stepScore: 2, cost: 2e4 }, { id: "transparent_communication", text: "Full transparency with team about the situation", consequence: "Trust through honesty", alignment: "light", stepScore: 2 }, { id: "use_as_opportunity", text: "Use this as leverage to negotiate better lease terms", consequence: "Every problem is an opportunity", alignment: "cunning", minigame: { type: "tension", difficulty: "hard", label: "Lease Negotiation" }, stepScore: { success: 4, failure: 1 } }] }, { id: "grand_opening", stepNumber: 4, title: "\u{1F389} The Reveal", cinematicText: `It's done. The dust has settled\u2014literally. The new office gleams.

{employee1}, {employee2}, and {employee3} walk through, touching new desks, trying chairs.

"So... what do you think?" you ask nervously.`, isFinalStep: true, choices: [{ id: "celebration_party", text: "Throw an office warming party", consequence: "Celebrate the new chapter", alignment: "charismatic", stepScore: 2, cost: 5e3 }, { id: "feedback_session", text: "Hold feedback sessions - what works, what doesn't", consequence: "Always be improving", alignment: "humble", stepScore: 2 }, { id: "press_coverage", text: "Invite press for coverage of the new space", consequence: "Free publicity", alignment: "ambitious", stepScore: 2 }, { id: "get_back_to_work", text: "Enough celebration - back to work!", consequence: "The space isn't the point", alignment: "pragmatic", stepScore: 1 }] }], finalOutcomes: { legendary: { threshold: 12, title: "\u{1F3E2} Dream Office", text: "The renovation exceeded all expectations. Productivity is up, morale is higher, and other companies are asking for your designer's number.", effects: { boost_all_comfort: 35, boost_all_productivity: 25, reputation_boost: 20 } }, excellent: { threshold: 9, title: "\u2728 Beautiful Space", text: "The office is a huge upgrade. People actually want to come to work.", effects: { boost_all_comfort: 25, boost_all_productivity: 15, reputation_boost: 10 } }, good: { threshold: 6, title: "\u2705 Functional Upgrade", text: "It's nicer. Not perfect, but nicer.", effects: { boost_all_comfort: 15, boost_all_productivity: 10 } }, neutral: { threshold: 3, title: "\u{1F610} Different", text: "It's... different. Opinions are mixed.", effects: { boost_all_comfort: 5 } }, poor: { threshold: -100, title: "\u{1F480} Renovation Nightmare", text: "Massive cost overruns, angry employees, and the new break room already has a leak.", effects: { fine: 5e4, decrease_all_comfort: 10, decrease_all_productivity: 10 } } } }, company_hackathon: { id: "company_hackathon", title: "\u{1F4BB} The Hackathon", description: "A 48-hour innovation sprint. Great ideas\u2014and sleep deprivation\u2014await.", theme: "innovation", mood: "energetic", totalSteps: 3, requiredEmployees: 4, unlockConditions: { minEmployees: 5, minCash: 2e4, minAct: 1 }, themeColor: "#00bcd4", steps: [{ id: "kickoff", stepNumber: 1, title: "\u{1F680} Kickoff", cinematicText: "The hackathon begins at midnight. Energy drinks everywhere. Whiteboards filling with wild ideas.\n\n{employee1} has partnered with {employee2}\u2014they're working on something ambitious. {employee3} is going solo on a mystery project.\n\nYou're judging, but also... tempted to participate.", choices: [{ id: "join_team", text: "Join a team as a collaborator", consequence: "Lead by doing", alignment: "humble", stepScore: 2 }, { id: "observe_encourage", text: "Roam and encourage - be the cheerleader", consequence: "Morale matters", alignment: "charismatic", stepScore: 2 }, { id: "provide_resources", text: "Provide premium resources for the best ideas", consequence: "Reward promise", alignment: "ambitious", stepScore: 2, cost: 5e3 }, { id: "step_back", text: "Step back completely - let them own it", consequence: "Not everything needs a boss", alignment: "light", stepScore: 2 }] }, { id: "hour_24", stepNumber: 2, title: "\u{1F634} The Wall", cinematicText: 'Hour 24. The energy drinks have stopped working. {employee1} is asleep under a desk. {employee2} is having a breakthrough\u2014or a breakdown.\n\n{employee3} comes to you. "Boss, my project is failing. Should I scrap it or push through?"', choices: [{ id: "encourage_pivot", text: "Help them pivot to something achievable", consequence: "Failure is data", alignment: "pragmatic", minigame: { type: "intensity", difficulty: "medium", label: "Rapid Ideation" }, stepScore: { success: 4, failure: 1 } }, { id: "push_through", text: "Encourage them to push through", consequence: "Finish what you start", alignment: "determined", stepScore: 2 }, { id: "strategic_rest", text: "Mandate a team-wide rest break", consequence: "Rest is productive", alignment: "light", stepScore: 2 }, { id: "competitive_reveal", text: "Let teams peek at each other's progress", consequence: "A little competition helps", alignment: "cunning", stepScore: 1 }] }, { id: "presentations", stepNumber: 3, title: "\u{1F3A4} Demo Day", cinematicText: "Hour 48. Red-eyed developers present their creations.\n\n{employee1} and {employee2}'s project is impressive but unfinished. {employee3}'s solo work is polished but small.\n\nAs the judge, your decision will matter\u2014not just for the prize, but for what it says about what you value.", isFinalStep: true, choices: [{ id: "reward_ambition", text: "Award the most ambitious project, even unfinished", consequence: "Dream big", alignment: "ambitious", stepScore: 2 }, { id: "reward_completion", text: "Award the most polished, complete project", consequence: "Execution matters", alignment: "pragmatic", stepScore: 2 }, { id: "multiple_awards", text: "Create multiple award categories", consequence: "Everyone can win something", alignment: "light", stepScore: 2, cost: 3e3 }, { id: "implement_winner", text: "Commit to actually implementing the winning project", consequence: "Make it real", alignment: "determined", stepScore: 3 }] }], finalOutcomes: { legendary: { threshold: 9, title: "\u{1F4A1} Innovation Culture", text: "The hackathon sparked something. New ideas, new energy, and one project that might actually change everything.", effects: { boost_all_productivity: 25, boost_all_trust: 20, unlock_perk: { perkId: "innovation_culture", name: "Innovation Culture", description: "+15% chance of breakthroughs" } } }, excellent: { threshold: 6, title: "\u{1F680} Great Ideas", text: "Several promising concepts emerged. The team is energized.", effects: { boost_all_productivity: 15, boost_all_trust: 15 } }, good: { threshold: 3, title: "\u2705 Productive Sprint", text: "It was fun. Some useful ideas came out of it.", effects: { boost_all_productivity: 10, boost_all_trust: 10 } }, neutral: { threshold: 0, title: "\u{1F610} Just a Hackathon", text: "Sleep-deprived employees, a few half-baked ideas. Normal hackathon stuff.", effects: { boost_all_trust: 5 } }, poor: { threshold: -100, title: "\u{1F4A4} Exhausted & Empty", text: "Everyone is exhausted and nothing useful came of it. Maybe next year.", effects: { decrease_all_productivity: 10, decrease_all_comfort: 10 } } } }, competitor_poach: { id: "competitor_poach", title: "\u{1F3AF} The Poaching", description: "A competitor wants your star employee. How far will you go to keep them?", theme: "loyalty", mood: "tense", totalSteps: 3, requiredEmployees: 2, unlockConditions: { minEmployees: 4, minCash: 4e4, minAct: 2 }, themeColor: "#f44336", steps: [{ id: "the_rumor", stepNumber: 1, title: "\u{1F442} The Rumor", cinematicText: `{employee1} has been quiet lately. Distracted. Taking mysterious phone calls.

{employee2} pulls you aside. "Boss, I heard a rumor. {employee1} has been talking to Nexus Corp. They're offering... a lot."`, choices: [{ id: "direct_conversation", text: "Have a direct, honest conversation with {employee1}", consequence: "Transparency goes both ways", alignment: "light", stepScore: 3 }, { id: "preemptive_raise", text: "Offer a preemptive raise before they ask", consequence: "Money talks", alignment: "pragmatic", stepScore: 2, cost: 15e3 }, { id: "investigate", text: "Investigate the rumor further first", consequence: "Information is power", alignment: "calculating", minigame: { type: "recall", difficulty: "medium", label: "Intelligence Gathering" }, stepScore: { success: 3, failure: 1 } }, { id: "ignore_it", text: "Ignore it - rumors are just rumors", consequence: "Don't micromanage", alignment: "cautious", stepScore: 0 }] }, { id: "the_confession", stepNumber: 2, title: "\u{1F4AD} The Truth", cinematicText: `{employee1} finally comes to you. "Boss, I need to talk. Nexus offered me a director position. 40% raise. I... I don't know what to do."

Their eyes are conflicted. "I love it here. But it's a lot of money. And a title."`, choices: [{ id: "match_offer", text: "Match the offer completely", consequence: "Whatever it takes", alignment: "determined", stepScore: 2, cost: 3e4 }, { id: "counter_with_growth", text: "Counter with growth opportunities, not just money", consequence: "Invest in their future", alignment: "charismatic", minigame: { type: "intensity", difficulty: "hard", label: "Vision Casting" }, stepScore: { success: 5, failure: 1 } }, { id: "let_them_go", text: "Gracefully let them go if that's what they want", consequence: "Don't cage people", alignment: "humble", stepScore: 2 }, { id: "remind_of_loyalty", text: "Remind them of everything you've done for them", consequence: "Guilt is a strategy", alignment: "dark", stepScore: 1 }] }, { id: "the_decision", stepNumber: 3, title: "\u{1F6AA} The Choice", cinematicText: `Days later. {employee1} stands at your door, resignation letter in hand\u2014or maybe not.

"I've made my decision," they say.

The room is silent. {employee2} watches from across the office.`, isFinalStep: true, choices: [{ id: "accept_gracefully", text: "Whatever they chose, accept it gracefully", consequence: "Dignity in all things", alignment: "humble", stepScore: 2 }, { id: "last_minute_offer", text: "Make one final, everything-on-the-table offer", consequence: "Leave nothing unsaid", alignment: "determined", stepScore: 2, cost: 2e4 }, { id: "celebrate_either_way", text: "Celebrate their time here regardless of choice", consequence: "Honor the relationship", alignment: "light", stepScore: 3 }, { id: "non_compete", text: "If they leave, enforce the non-compete clause", consequence: "Protect your interests", alignment: "ruthless", stepScore: 0 }] }], finalOutcomes: { legendary: { threshold: 9, title: "\u2764\uFE0F Unshakeable Loyalty", text: "They stayed\u2014not for the money, but because of how you handled this. Their loyalty is now absolute.", effects: { boost_all_trust: 30, loyalty_boost: 90, reputation_boost: 15 } }, excellent: { threshold: 6, title: "\u{1F91D} Mutual Respect", text: "Whether they stayed or left, the relationship remains strong. That's a win.", effects: { boost_all_trust: 20, reputation_boost: 10 } }, good: { threshold: 3, title: "\u2705 Handled Professionally", text: "The situation was managed. Life goes on.", effects: { boost_all_trust: 10 } }, neutral: { threshold: 0, title: "\u{1F610} Awkward Transition", text: "Things are tense. It'll take time to recover.", effects: { decrease_all_comfort: 10 } }, poor: { threshold: -100, title: "\u{1F494} Burned Bridge", text: "They left angry, and they're telling everyone why. The damage to morale and reputation is significant.", effects: { random_employee_quits: true, reputation_hit: 20, decrease_all_trust: 20 } } } }, data_breach: { id: "data_breach", title: "\u{1F513} The Data Breach", description: "Your systems have been compromised. Everything you do now matters.", theme: "crisis", mood: "urgent", totalSteps: 4, requiredEmployees: 3, unlockConditions: { minEmployees: 5, minCash: 5e4, minAct: 2 }, themeColor: "#d32f2f", steps: [{ id: "discovery", stepNumber: 1, title: "\u{1F6A8} Breach Detected", cinematicText: `The alert screams across your dashboard at 2 AM. Unauthorized access. Data exfiltration detected.

{employee1}, your IT lead, calls immediately. "Boss, it's bad. Customer data. Financial records. Someone got in."

Your phone starts buzzing. How did the press find out already?`, choices: [{ id: "lockdown", text: "Immediate full system lockdown", consequence: "Stop the bleeding", alignment: "determined", stepScore: 3 }, { id: "trace_first", text: "Keep systems running to trace the attacker", consequence: "Catch them in the act", alignment: "calculating", minigame: { type: "reflex", difficulty: "hard", label: "Active Threat Hunting" }, stepScore: { success: 4, failure: 0 } }, { id: "call_experts", text: "Immediately call cybersecurity experts", consequence: "Get help fast", alignment: "pragmatic", stepScore: 3, cost: 25e3 }, { id: "assess_damage", text: "Assess the full scope before acting", consequence: "Know what you're dealing with", alignment: "cautious", stepScore: 2 }] }, { id: "notification", stepNumber: 2, title: "\u{1F4E2} Telling the World", cinematicText: 'The law requires notification. Customers need to know their data may be compromised.\n\n{employee2} drafts a statement. "Boss, how honest do we want to be? We could minimize this or... tell everything."\n\nThe lawyers say minimize. Your gut says...', choices: [{ id: "full_disclosure", text: "Full, transparent disclosure", consequence: "The truth, all of it", alignment: "lawful", stepScore: 4 }, { id: "legal_minimum", text: "Disclose the legal minimum only", consequence: "Protect the brand", alignment: "calculating", stepScore: 1 }, { id: "proactive_help", text: "Disclose and offer proactive help to affected users", consequence: "Turn crisis into service", alignment: "light", stepScore: 3, cost: 2e4 }, { id: "blame_vendor", text: "Shift blame to a third-party vendor", consequence: "Deflect responsibility", alignment: "cunning", stepScore: 0 }] }, { id: "investigation", stepNumber: 3, title: "\u{1F50D} The Investigation", cinematicText: `Forensics reveals the entry point. A phishing email. Someone on your team clicked a bad link.

{employee3} approaches you, pale. "Boss... I think it was me. That email from 'HR' last week. I'm so sorry."

The team is watching how you handle this.`, choices: [{ id: "no_blame", text: "No individual blame - this is a systemic issue", consequence: "We failed together", alignment: "light", stepScore: 3 }, { id: "training_not_punishment", text: "Mandatory security training, not punishment", consequence: "Learn from mistakes", alignment: "pragmatic", stepScore: 2 }, { id: "accountability", text: "There must be some accountability", consequence: "Actions have consequences", alignment: "lawful", stepScore: 1 }, { id: "protect_employee", text: "Protect {employee3} from external blame", consequence: "Shield your people", alignment: "loyal", stepScore: 2 }] }, { id: "aftermath", stepNumber: 4, title: "\u{1F6E1}\uFE0F Rebuilding Trust", cinematicText: `Weeks later. New security systems are in place. Customer complaints are slowing.

{employee1}, {employee2}, and {employee3} gather for a postmortem.

"We survived," {employee1} says. "But some customers aren't coming back. How do we rebuild?"`, isFinalStep: true, choices: [{ id: "invest_heavily", text: "Invest heavily in security and communicate it", consequence: "Never again", alignment: "determined", stepScore: 3, cost: 4e4 }, { id: "customer_outreach", text: "Personal outreach to affected customers", consequence: "One relationship at a time", alignment: "humble", stepScore: 2 }, { id: "third_party_audit", text: "Commission a third-party security audit", consequence: "Prove your commitment", alignment: "lawful", stepScore: 2, cost: 15e3 }, { id: "move_forward", text: "Focus on the future, not the past", consequence: "Don't dwell", alignment: "pragmatic", stepScore: 1 }] }], finalOutcomes: { legendary: { threshold: 12, title: "\u{1F6E1}\uFE0F Security Champion", text: "Your handling of the breach became a case study in crisis management. Customers actually trust you MORE now.", effects: { reputation_boost: 25, boost_all_trust: 30, investigation_cleared: true, unlock_perk: { perkId: "security_excellence", name: "Security Excellence", description: "Future breaches 75% less likely" } } }, excellent: { threshold: 9, title: "\u2705 Crisis Managed", text: "You handled a nightmare scenario with grace. Trust is recovering.", effects: { reputation_boost: 10, boost_all_trust: 20 } }, good: { threshold: 6, title: "\u{1F44D} Survived the Storm", text: "Damage done, but you're still standing.", effects: { boost_all_trust: 10 } }, neutral: { threshold: 3, title: "\u{1F610} Lingering Damage", text: "The breach will define you for a while. Recovery is slow.", effects: { reputation_hit: 10 } }, poor: { threshold: -100, title: "\u{1F480} Catastrophic Failure", text: "The breach response was as bad as the breach itself. Lawsuits pending, customers fleeing.", effects: { fine: 1e5, reputation_hit: 40, decrease_all_trust: 30, random_employee_quits: true } } } }, culture_clash: { id: "culture_clash", title: "\u{1F310} The Culture Clash", description: "Generational and cultural differences threaten to divide your team.", theme: "diversity", mood: "challenging", totalSteps: 3, requiredEmployees: 3, unlockConditions: { minEmployees: 5, minCash: 2e4, minAct: 1 }, themeColor: "#9c27b0", steps: [{ id: "the_incident", stepNumber: 1, title: "\u{1F4A5} The Comment", cinematicText: `The meeting just ended. Badly.

{employee1}, your veteran, made a joke about "young people and their phones." {employee2}, newest hire, called them "out of touch."

Now they're not speaking. Half the office is taking sides.`, choices: [{ id: "mediate_immediately", text: "Call both into your office for mediation", consequence: "Deal with it now", alignment: "determined", stepScore: 3 }, { id: "let_cool_down", text: "Give everyone time to cool down", consequence: "Time heals", alignment: "cautious", stepScore: 1 }, { id: "team_meeting", text: "Address it openly in a team meeting", consequence: "Sunshine is the best disinfectant", alignment: "light", minigame: { type: "composure", difficulty: "medium", label: "Team Facilitation" }, stepScore: { success: 4, failure: 0 } }, { id: "ignore_it", text: "Stay out of personal conflicts", consequence: "Not your job to parent adults", alignment: "detached", stepScore: 0 }] }, { id: "deeper_issues", stepNumber: 2, title: "\u{1F9CA} The Freeze", cinematicText: `It's been a week. {employee1} and {employee2} are professional but frozen. Projects are suffering from lack of collaboration.

{employee3} comes to you. "Boss, it's not just them. There are real cultural differences on this team that we've been ignoring."`, choices: [{ id: "dei_workshop", text: "Bring in a DEI facilitator for workshops", consequence: "Professional help for professional problems", alignment: "pragmatic", stepScore: 2, cost: 8e3 }, { id: "bridge_building", text: "Create cross-generational project pairs", consequence: "Understanding through collaboration", alignment: "light", stepScore: 3 }, { id: "one_on_ones", text: "Individual conversations with everyone", consequence: "Understand each perspective", alignment: "humble", minigame: { type: "intensity", difficulty: "hard", label: "Deep Listening" }, stepScore: { success: 4, failure: 1 } }, { id: "set_rules", text: "Establish clear professional conduct rules", consequence: "Boundaries matter", alignment: "lawful", stepScore: 2 }] }, { id: "resolution", stepNumber: 3, title: "\u{1F91D} The Bridge", cinematicText: `{employee1} and {employee2} are in your office together. The air is still tense, but something has shifted.

"I didn't mean to dismiss you," {employee1} says quietly.

"I overreacted," {employee2} admits.

They look to you. What kind of workplace culture do you want to build?`, isFinalStep: true, choices: [{ id: "celebrate_difference", text: "Create a culture that celebrates differences", consequence: "Diversity is strength", alignment: "light", stepScore: 3 }, { id: "focus_on_mission", text: "Unite around shared mission, minimize personal differences", consequence: "We're here to work", alignment: "pragmatic", stepScore: 2 }, { id: "ongoing_dialogue", text: "Establish ongoing dialogue about culture", consequence: "Keep the conversation going", alignment: "humble", stepScore: 2 }, { id: "performance_focus", text: "Judge only by results, not personality", consequence: "Meritocracy above all", alignment: "calculating", stepScore: 1 }] }], finalOutcomes: { legendary: { threshold: 9, title: "\u{1F308} Unified Team", text: "The conflict became a catalyst for real understanding. Your team is stronger and more cohesive than ever.", effects: { boost_all_trust: 30, boost_all_comfort: 25, boost_all_productivity: 15, unlock_perk: { perkId: "inclusive_culture", name: "Inclusive Culture", description: "+20% effectiveness of diverse teams" } } }, excellent: { threshold: 6, title: "\u{1F91D} Mutual Respect", text: "Differences remain, but respect prevails. The team functions well.", effects: { boost_all_trust: 20, boost_all_comfort: 15 } }, good: { threshold: 3, title: "\u2705 Functional Truce", text: "They work together professionally. The warmth will come later.", effects: { boost_all_trust: 10, boost_all_comfort: 10 } }, neutral: { threshold: 0, title: "\u{1F610} Uneasy Peace", text: "The conflict is suppressed, not resolved. Watch for flare-ups.", effects: {} }, poor: { threshold: -100, title: "\u{1F494} Divided House", text: "The team is fractured. Cliques have formed. Productivity suffers.", effects: { decrease_all_trust: 20, decrease_all_comfort: 15, decrease_all_productivity: 15, random_employee_quits: true } } } }, unexpected_windfall: { id: "unexpected_windfall", title: "\u{1F4B0} The Windfall", description: "A massive unexpected payment arrives. What you do with it defines you.", theme: "opportunity", mood: "exciting", totalSteps: 3, requiredEmployees: 3, unlockConditions: { minEmployees: 4, minCash: 1e4, minAct: 1 }, themeColor: "var(--ew)", steps: [{ id: "the_payment", stepNumber: 1, title: "\u{1F3B0} The Arrival", cinematicText: `The bank calls. A wire transfer just hit your account. $500,000.

It's from an old client\u2014apparently a contract clause you forgot about triggered. It's legitimate. It's yours.

{employee1} sees the balance. "Boss... what are you going to do with that?"`, choices: [{ id: "share_news", text: "Share the news with the whole team", consequence: "Transparency, even in good times", alignment: "light", stepScore: 2 }, { id: "keep_quiet", text: "Keep it quiet for now while you plan", consequence: "Manage expectations", alignment: "calculating", stepScore: 2 }, { id: "immediate_celebration", text: "Immediate team celebration", consequence: "Share the joy", alignment: "charismatic", stepScore: 2, cost: 5e3 }, { id: "verify_first", text: "Verify it's not an error before getting excited", consequence: "Caution is warranted", alignment: "cautious", stepScore: 2 }] }, { id: "the_ask", stepNumber: 2, title: "\u{1F64B} The Requests", cinematicText: "Word got out. Now everyone has ideas.\n\n{employee1} wants equipment upgrades. {employee2} thinks raises are overdue. {employee3} has pitched an expansion plan.\n\nThe money is finite. The dreams are not.", choices: [{ id: "democratic_vote", text: "Let the team vote on allocation", consequence: "Democracy in action", alignment: "light", minigame: { type: "composure", difficulty: "medium", label: "Facilitate Decision" }, stepScore: { success: 4, failure: 1 } }, { id: "executive_decision", text: "Make the call yourself - it's your company", consequence: "Leadership means deciding", alignment: "determined", stepScore: 2 }, { id: "split_evenly", text: "Split it: bonuses, equipment, AND expansion", consequence: "Something for everyone", alignment: "diplomatic", stepScore: 2 }, { id: "save_it", text: "Bank most of it for future emergencies", consequence: "Think long-term", alignment: "cautious", stepScore: 2 }] }, { id: "the_allocation", stepNumber: 3, title: "\u{1F4B8} The Decision", cinematicText: "Time to decide. The money sits there, full of potential.\n\n{employee1}, {employee2}, and {employee3} wait for your announcement. This isn't just about money\u2014it's about what kind of company you're building.", isFinalStep: true, choices: [{ id: "invest_in_people", text: "Major bonuses for everyone - invest in people", consequence: "People first", alignment: "light", stepScore: 3, cost: -2e5 }, { id: "invest_in_growth", text: "Invest in growth - new equipment, expansion", consequence: "Build the future", alignment: "ambitious", stepScore: 2 }, { id: "strategic_reserve", text: "Keep a strategic reserve, use rest wisely", consequence: "Balance growth and security", alignment: "pragmatic", stepScore: 2 }, { id: "charitable_donation", text: "Donate a significant portion to charity", consequence: "Give back", alignment: "humanitarian", stepScore: 3, cost: -15e4 }] }], finalOutcomes: { legendary: { threshold: 9, title: "\u{1F451} Wise Steward", text: "You turned unexpected fortune into lasting value. The team feels valued, and the company is stronger.", effects: { bonus_cash: 3e5, boost_all_trust: 25, boost_all_comfort: 20, reputation_boost: 20 } }, excellent: { threshold: 6, title: "\u{1F48E} Good Use", text: "The money was well spent. Everyone feels like they got something.", effects: { bonus_cash: 25e4, boost_all_trust: 15, boost_all_comfort: 15 } }, good: { threshold: 3, title: "\u2705 Reasonable Choices", text: "Not everyone's thrilled, but the decisions were sound.", effects: { bonus_cash: 25e4, boost_all_trust: 10 } }, neutral: { threshold: 0, title: "\u{1F610} Mixed Feelings", text: "Some winners, some losers. The windfall created as many problems as it solved.", effects: { bonus_cash: 25e4, decrease_all_comfort: 10 } }, poor: { threshold: -100, title: "\u{1F4B8} Squandered Fortune", text: "The money's gone and no one's happy. How did you manage that?", effects: { bonus_cash: 1e5, decrease_all_trust: 20, decrease_all_comfort: 15 } } } } }, startMultiStepEvent(e, t = []) {
  const n = this.MULTI_STEP_EVENTS[e];
  if (n) {
    if (n.unlockConditions) {
      const t2 = n.unlockConditions, a = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus);
      if (t2.minEmployees && a.length < t2.minEmployees) return void console.log(`[StoryEngine] Not enough employees for ${e}`);
      if (t2.minCash && gameState.cash < t2.minCash) return void console.log(`[StoryEngine] Not enough cash for ${e}`);
      if (t2.minAct && gameState.story.currentAct < t2.minAct) return void console.log(`[StoryEngine] Act requirement not met for ${e}`);
    }
    if (!t.length) {
      const e2 = [...gameState.employees.filter((e3) => e3.hired && "active" === e3.employmentStatus)].sort(() => Math.random() - 0.5);
      t = e2.slice(0, Math.min(n.requiredEmployees || 3, e2.length)).map((e3) => e3.id);
    }
    gameState.story.activeMultiStepEvent = { id: e, title: n.title, description: n.description, theme: n.theme, mood: n.mood, themeColor: n.themeColor, totalSteps: n.totalSteps, currentStep: 0, stepOutcomes: [], involvedEmployees: t, cumulativeScore: 0, stepFlags: {}, startedAt: Date.now() }, this.addJournalEntry({ title: `\u{1F3AC} ${n.title} Begins`, content: n.description, type: "multistep_start", memorable: true }), this.showMultiStepEventStep(0), console.log(`[StoryEngine] \u{1F3AC} Started multi-step event: ${n.title}`);
  } else console.error(`[StoryEngine] Unknown multi-step event: ${e}`);
}, showMultiStepEventStep(e) {
  const t = gameState.story.activeMultiStepEvent;
  if (!t) return void console.error("[StoryEngine] No active multi-step event");
  const n = this.MULTI_STEP_EVENTS[t.id];
  if (!n || !n.steps[e]) return void console.error(`[StoryEngine] Invalid step index: ${e}`);
  const a = n.steps[e];
  t.currentStep = e + 1;
  const o = t.involvedEmployees.map((e2, t2) => {
    const n2 = gameState.employees.find((t3) => t3.id === e2);
    return n2 ? n2.name : `Employee ${t2 + 1}`;
  });
  let i = a.cinematicText;
  o.forEach((e2, t2) => {
    i = i.replace(new RegExp(`\\{employee${t2 + 1}\\}`, "g"), e2);
  });
  const s = a.choices.map((e2) => {
    let t2 = e2.consequence || "";
    return o.forEach((e3, n2) => {
      t2 = t2.replace(new RegExp(`\\{employee${n2 + 1}\\}`, "g"), e3);
    }), { ...e2, consequence: t2 };
  });
  this.showMultiStepEventModal(a, i, s, n);
}, showMultiStepEventModal(e, t, n, a) {
  const o = gameState.story.activeMultiStepEvent, i = document.getElementById("storyEventModal");
  i && i.remove();
  const s = document.createElement("div");
  s.id = "storyEventModal", s.className = "story-modal-overlay", s.style.cssText = "\n        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n        background: var(--bc); z-index: 100001;\n        display: flex; justify-content: center; align-items: center;\n        animation: storyFadeIn 0.8s ease-out;\n        padding: 20px; box-sizing: border-box;\n      ";
  const r = o.themeColor || "var(--j)", l = Array.from({ length: a.totalSteps }, (e2, t2) => {
    const n2 = t2 < o.currentStep - 1, i2 = t2 === o.currentStep - 1, s2 = o.stepOutcomes[t2]?.score || 0;
    return ` <div style=" display: flex; flex-direction: column; align-items: center; opacity: ${i2 ? 1 : n2 ? 0.8 : 0.4}; "> <div style=" width: 36px; height: 36px; background: ${n2 ? r : i2 ? "linear-gradient(135deg, " + r + ", " + r + "88)" : "var(--ad)"};
              border: 2px solid ${i2 || n2 ? r : "var(--ag)"};
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              font-size: 1rem; color: ${n2 || i2 ? "var(--b)" : "var(--af)"};
              ${i2 ? "box-shadow: 0 0 20px " + r + "66;" : ""}
              transition: all 0.3s ease;
            ">
              ${n2 ? "\u2713" : t2 + 1} </div> ${n2 && 0 !== s2 ? ` <div style="font-size: 0.7rem; color: ${s2 > 0 ? "var(--n)" : "var(--l)"}; margin-top: 4px;">
                ${s2 > 0 ? "+" + s2 : s2} </div> ` : ""} </div> ${t2 < a.totalSteps - 1 ? ` <div style=" flex: 1; height: 2px; background: ${n2 ? r : "var(--ag)"}; margin: 0 8px; align-self: center; transition: background 0.5s ease; "></div> ` : ""}
        `;
  }).join(""), c = n.map((e2) => {
    const t2 = { lawful: "var(--n)", light: "var(--u)", neutral: "var(--z)", dark: "var(--l)", ruthless: "var(--dk)", ambitious: "var(--eh)", defiant: "var(--au)", humble: "#a0c4ff", charismatic: "var(--z)", calculating: "var(--bt)", pragmatic: "var(--da)", cautious: "var(--a)", independent: "var(--do)", determined: "var(--au)", adaptive: "#4cc9f0", risky: "var(--al)", diplomatic: "var(--da)" }[e2.alignment] || "var(--j)", n2 = e2.minigame && void 0 !== StoryMinigames, a2 = n2 ? StoryMinigames.GAME_TYPES[e2.minigame.type]?.icon || "\u{1F3AE}" : "", o2 = n2 ? ` <span style=" display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #667eea33, #764ba233); padding: 3px 8px; border-radius: 12px; font-size: 0.7rem; color: var(--s); margin-left: 8px; ">${a2} ${e2.minigame.label || "Skill Check"}</span> ` : "", i2 = this.getChoiceCost(e2), s2 = i2 > 0, r2 = !s2 || gameState.cash >= i2, l2 = s2 ? ` <span style=" display: inline-flex; align-items: center; gap: 4px; background: ${r2 ? "rgba(255,107,157,0.2)" : "rgba(255,0,0,0.2)"};
            padding: 3px 8px; border-radius: 12px;
            font-size: 0.7rem; color: ${r2 ? "var(--v)" : "var(--ei)"};
            margin-left: 8px;
          ">\u{1F4B0} ${"function" == typeof xu ? xu(i2) : "$" + i2.toLocaleString()}</span> ` : "";
    return ` <button class="story-choice-btn" onclick="StoryEngine.resolveMultiStepChoice('${e2.id}')"
                  data-scaled-cost="${i2}"
                  style="width:100%; padding:16px 18px; margin:6px 0; 
                         background:linear-gradient(135deg, rgba(15,52,96,0.9) 0%, rgba(22,33,62,0.9) 100%);
                         border:2px solid ${r2 ? t2 : "var(--av)"}; border-radius:12px; 
                         color:${r2 ? "var(--b)" : "var(--as)"}; cursor:${r2 ? "pointer" : "not-allowed"}; text-align:left;
                         transition:all 0.3s ease; position:relative; overflow:hidden;
                         ${r2 ? "" : "opacity:0.6;"}"
                  ${r2 ? "" : "disabled"}> <div style="position:relative; z-index:1;"> <div style="font-size:0.95rem; font-weight:600; margin-bottom:4px; display:flex; align-items:center; flex-wrap:wrap;"> ${e2.text}${o2}${l2} </div> <div style="font-size:0.75rem; color:${r2 ? t2 : "var(--af)"}; opacity:0.9; font-style:italic;">${e2.consequence || ""}</div> </div> <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(90deg, ${fuocAlpha(t2, "22")} 0%, transparent 100%); opacity:0; transition:opacity 0.3s;" class="choice-hover-bg"></div> </button> `;
  }).join("");
  s.innerHTML = ` <div class="story-modal-content" style=" background:linear-gradient(180deg, var(--ae) 0%, var(--dc) 50%, var(--ae) 100%); border-radius:20px; max-width:750px; width:100%; max-height:90vh; overflow-y:auto; border:2px solid ${r};
          box-shadow:0 0 100px ${fuocAlpha(r, "44")}, 0 0 40px ${fuocAlpha(r, "22")}; animation:storySlideUp 0.6s ease-out; "> <!-- Top bar with event title and theme --> <div style="padding:15px 25px; background:linear-gradient(90deg, ${fuocAlpha(r, "33")} 0%, transparent 50%, ${fuocAlpha(r, "33")} 100%); border-bottom:1px solid ${fuocAlpha(r, "55")};"> <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 10px;"> <div style="display:flex; align-items:center; gap:10px;"> <span style="font-size:1.5rem;">${a.title.match(/^[^\s]+/)[0] || "\u{1F4D6}"}</span> <span style="color:${r}; font-size:0.9rem; font-weight:600;">${o.title}</span> </div> <div style="display:flex; align-items:center; gap:12px;"> <div style="display:flex; align-items:center; gap:8px;"> <span style="color:var(--a); font-size:0.8rem;">Score:</span> <span style="color:${o.cumulativeScore >= 0 ? "var(--n)" : "var(--l)"}; font-weight:bold;">
                    ${o.cumulativeScore >= 0 ? "+" : ""}${o.cumulativeScore} </span> </div> <button id="closeStoryEventBtn" title="Close (progress will be saved)" style=" background: var(--ba); border: 1px solid var(--r); border-radius: 50%; width: 32px; height: 32px; color: var(--e); font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; " onmouseenter="this.style.background='rgba(233,69,96,0.3)';this.style.borderColor='var(--l)';this.style.color='var(--l)';" onmouseleave="this.style.background='var(--ba)';this.style.borderColor='var(--af)';this.style.color='var(--q)';">\u2715</button> </div> </div> </div> <!-- Progress bar --> <div style="padding:20px 30px; background:var(--am);"> <div style="display:flex; align-items:center; justify-content:center; gap:0;"> ${l} </div> </div> <!-- Step title --> <div style="padding:20px 30px 10px; text-align:center;"> <h2 style="margin:0; font-size:1.6rem; color:var(--b); text-shadow:0 2px 15px ${fuocAlpha(r, "66")};">${e.title}</h2> <div style="color:var(--e); font-size:0.8rem; margin-top:5px;"> Step ${o.currentStep} of ${a.totalSteps}${e.isFinalStep ? " \u2022 Final Step" : ""}
            </div>
          </div>
          
          <!-- Cinematic text -->
          <div id="storyTextContainer" style="padding:10px 30px 20px;">
            <div id="storyText" style="color:var(--cu); font-size:1rem; line-height:1.75; white-space:pre-wrap; font-family:Georgia, serif;">
              ${gameState.story.settings.dramaticPauses ? "" : t} </div> </div> <!-- Choices --> <div id="storyChoicesContainer" style="padding:0 30px 25px; ${gameState.story.settings.dramaticPauses ? "opacity:0;" : ""}">
            ${c} </div> </div> `, document.body.appendChild(s);
  const d = s.querySelector("#closeStoryEventBtn");
  d && d.addEventListener("click", (e2) => {
    e2.stopPropagation(), s.style.animation = "storyFadeOut 0.3s ease-out", setTimeout(() => s.remove(), 300), "function" == typeof showNotification && showNotification("\u{1F4D6} Multi-step event minimized - click the bell to resume", "info");
  }), s.addEventListener("click", (e2) => {
    e2.target === s && (s.style.animation = "storyFadeOut 0.3s ease-out", setTimeout(() => s.remove(), 300), "function" == typeof showNotification && showNotification("\u{1F4D6} Multi-step event minimized - click the bell to resume", "info"));
  }), s.querySelectorAll(".story-choice-btn").forEach((e2) => {
    e2.addEventListener("mouseenter", () => {
      if (!e2.disabled) {
        e2.style.transform = "translateX(5px)";
        const t2 = e2.querySelector(".choice-hover-bg");
        t2 && (t2.style.opacity = "1");
      }
    }), e2.addEventListener("mouseleave", () => {
      e2.style.transform = "translateX(0)";
      const t2 = e2.querySelector(".choice-hover-bg");
      t2 && (t2.style.opacity = "0");
    });
  }), gameState.story.settings.dramaticPauses && this.typewriterEffect(t, "storyText", () => {
    const e2 = document.getElementById("storyChoicesContainer");
    e2 && (e2.style.transition = "opacity 0.5s ease", e2.style.opacity = "1");
  });
}, resolveMultiStepChoice(e) {
  const t = gameState.story.activeMultiStepEvent;
  if (!t) return;
  const n = this.MULTI_STEP_EVENTS[t.id].steps[t.currentStep - 1], a = n.choices.find((t2) => t2.id === e);
  if (!a) return;
  if (a.minigame && void 0 !== StoryMinigames) return void this.launchMultiStepMinigame(n, a);
  const o = this.getChoiceCost(a);
  if (o > 0) {
    if (gameState.cash < o) return void showNotification("\u274C Not enough cash!", "error");
    gameState.cash -= o, showNotification(`\u{1F4B0} Spent ${"function" == typeof xu ? xu(o) : "$" + o.toLocaleString()}`, "info");
  }
  let i = 0;
  "number" == typeof a.stepScore ? i = a.stepScore : a.stepScore?.betting && (i = Math.floor(Math.random() * (a.stepScore.range[1] - a.stepScore.range[0] + 1)) + a.stepScore.range[0]), this.finalizeMultiStepChoice(n, a, i);
}, launchMultiStepMinigame(e, t) {
  const n = { ...t.minigame, onComplete: (n2) => {
    let a2 = 0;
    "perfect" === n2.result ? (a2 = t.stepScore?.success || t.stepScore || 3, a2 += 1) : a2 = "success" === n2.result ? t.stepScore?.success || t.stepScore || 2 : t.stepScore?.failure ?? 1;
    const o = { ...t, minigameResult: n2 }, i = this.getChoiceCost(t);
    i > 0 && gameState.cash >= i && (gameState.cash -= i), this.finalizeMultiStepChoice(e, o, a2);
  } }, a = document.getElementById("storyEventModal");
  a && a.remove(), StoryMinigames.launchMinigame(n.type, n, n.onComplete);
}, finalizeMultiStepChoice(e, t, n) {
  const a = gameState.story.activeMultiStepEvent, o = this.MULTI_STEP_EVENTS[a.id];
  a.stepOutcomes.push({ stepId: e.id, stepNumber: e.stepNumber, choiceId: t.id, choiceText: t.text, alignment: t.alignment, score: n, minigameResult: t.minigameResult || null, timestamp: Date.now() }), a.cumulativeScore += n, t.consequence_flag && (a.stepFlags[t.consequence_flag] = true), this.applyAlignmentEffect(t.alignment), gameState.story.choiceHistory.push({ eventId: a.id, eventKey: `multistep_${a.id}_step${e.stepNumber}`, choiceId: t.id, alignment: t.alignment, timestamp: Date.now(), actNumber: gameState.story.currentAct, minigameResult: t.minigameResult || null });
  const i = document.getElementById("storyEventModal");
  i && (i.style.animation = "storyFadeOut 0.5s ease-out", setTimeout(() => i.remove(), 500)), e.isFinalStep || a.currentStep >= o.totalSteps ? setTimeout(() => {
    this.concludeMultiStepEvent();
  }, 700) : setTimeout(() => {
    this.showMultiStepEventStep(a.currentStep);
  }, 700);
}, concludeMultiStepEvent() {
  const e = gameState.story.activeMultiStepEvent;
  if (!e) return;
  const t = this.MULTI_STEP_EVENTS[e.id];
  let n = null;
  const a = t.finalOutcomes, o = Object.keys(a).sort((e2, t2) => a[t2].threshold - a[e2].threshold);
  for (const t2 of o) if (e.cumulativeScore >= a[t2].threshold) {
    n = { key: t2, ...a[t2] };
    break;
  }
  if (n || (n = { key: o[o.length - 1], ...a[o[o.length - 1]] }), this.showMultiStepConclusion(e, t, n), n.effects) for (const [t2, a2] of Object.entries(n.effects)) "object" == typeof a2 && null !== a2 ? this.executeGameplayEffect({ type: t2, ...a2, reason: `${e.title} outcome` }) : this.executeGameplayEffect({ type: t2, amount: a2, duration: a2, reason: `${e.title} outcome` });
  const i = e.stepOutcomes.map((e2) => `\u2022 Step ${e2.stepNumber}: "${e2.choiceText}"${e2.minigameResult ? ` [${e2.minigameResult.result.toUpperCase()}]` : ""} (${e2.score >= 0 ? "+" : ""}${e2.score})`).join("\n");
  this.addJournalEntry({ title: `\u{1F3AC} ${e.title} - ${n.title}`, content: `${t.description}

YOUR JOURNEY:
${i}

FINAL SCORE: ${e.cumulativeScore >= 0 ? "+" : ""}${e.cumulativeScore}

OUTCOME: ${n.text}`, type: "multistep_complete", memorable: true }), gameState.story.completedMultiStepEvents || (gameState.story.completedMultiStepEvents = []), gameState.story.completedMultiStepEvents.push({ ...e, completedAt: Date.now(), finalOutcome: n.key, finalScore: e.cumulativeScore });
}, showMultiStepConclusion(e, t, n) {
  let a = n.text || "";
  e.actors && Object.entries(e.actors).forEach(([e2, t2]) => {
    const n2 = "string" == typeof t2 ? t2 : t2?.name || e2;
    a = a.replace(new RegExp(`\\{${e2}\\}`, "g"), n2);
  });
  const o = document.createElement("div");
  o.id = "storyEventModal", o.className = "story-modal-overlay", o.style.cssText = "\n        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n        background: var(--bc); z-index: 100001;\n        display: flex; justify-content: center; align-items: center;\n        animation: storyFadeIn 0.8s ease-out;\n        padding: 20px; box-sizing: border-box;\n      ", e.themeColor;
  const i = e.cumulativeScore >= 10 ? "var(--z)" : e.cumulativeScore >= 5 ? "var(--n)" : e.cumulativeScore >= 0 ? "var(--j)" : "var(--l)", s = e.stepOutcomes.map((e2) => {
    const t2 = e2.score > 0 ? "var(--n)" : e2.score < 0 ? "var(--l)" : "var(--aw)";
    return ` <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--bb); border-radius:8px; margin:4px 0;"> <div> <span style="color:var(--e); font-size:0.75rem;">Step ${e2.stepNumber}:</span> <span style="color:var(--b); margin-left:8px; font-size:0.85rem;">${e2.choiceText}</span> ${e2.minigameResult ? `<span style="color:${"perfect" === e2.minigameResult.result ? "var(--z)" : "success" === e2.minigameResult.result ? "var(--n)" : "var(--l)"}; font-size:0.7rem; margin-left:5px;">[${e2.minigameResult.result.toUpperCase()}]</span>` : ""} </div> <span style="color:${t2}; font-weight:bold; font-size:0.9rem;">
              ${e2.score >= 0 ? "+" : ""}${e2.score} </span> </div> `;
  }).join("");
  let r = "";
  n.effects && (r = ` <div style="margin-top:20px; padding:15px; background:var(--am); border-radius:12px;"> <div style="color:var(--e); font-size:0.8rem; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">Effects Applied</div> <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;"> ${Object.entries(n.effects).map(([e2, t2]) => {
    const n2 = { boost_all_trust: "\u{1F49A}", decrease_all_trust: "\u{1F494}", boost_all_productivity: "\u{1F4C8}", decrease_all_productivity: "\u{1F4C9}", boost_all_comfort: "\u{1F60A}", bonus_cash: "\u{1F4B0}", reputation_boost: "\u2B50", reputation_hit: "\u{1F4C9}", fine: "\u{1F4B8}", employee_quits: "\u{1F44B}", random_employee_quits: "\u{1F44B}", investigation: "\u{1F50D}", unlock_perk: "\u{1F381}" }[e2] || "\u2728";
    return e2.includes("boost") || e2.includes("bonus") || "reputation_boost" === e2 ? `<span style="color:var(--g);">${n2} +${t2}${e2.includes("cash") ? "" : "%"} ${e2.replace(/_/g, " ").replace("boost all ", "").replace("bonus ", "")}</span>` : e2.includes("decrease") || "fine" === e2 || "reputation_hit" === e2 ? `<span style="color:var(--k);">${n2} -${t2}${e2.includes("cash") || "fine" === e2 ? "" : "%"} ${e2.replace(/_/g, " ").replace("decrease all ", "")}</span>` : e2.includes("quits") ? `<span style="color:var(--k);">${n2} An employee may leave</span>` : "unlock_perk" === e2 && "object" == typeof t2 ? `<span style="color:var(--m);">${n2} unlock perk: ${t2.name || "Special Perk"}</span>` : `<span style="color:var(--br);">${n2} ${e2.replace(/_/g, " ")}</span>`;
  }).join("")} </div> </div> `), o.innerHTML = ` <div class="story-modal-content" style=" background:linear-gradient(180deg, var(--ae) 0%, var(--dc) 50%, var(--ae) 100%); border-radius:20px; max-width:700px; width:100%; max-height:90vh; overflow-y:auto; border:2px solid ${i};
          box-shadow:0 0 100px ${fuocAlpha(i, "44")}, 0 0 40px ${fuocAlpha(i, "22")}; animation:storySlideUp 0.6s ease-out; position:relative; "> <!-- Close Button (prevents softlock) --> <button onclick=" gameState.story.activeMultiStepEvent = null; document.getElementById('storyEventModal').remove(); if (typeof saveGame === 'function') saveGame(); " style=" position:absolute; top:15px; right:15px; z-index:10; background:var(--ba); border:none; color:var(--e); width:36px; height:36px; border-radius:50%; cursor:pointer; font-size:1.3rem; display:flex; align-items:center; justify-content:center; transition:all 0.2s; " onmouseenter="this.style.background='var(--dt)'; this.style.color='var(--b)'" onmouseleave="this.style.background='var(--ba)'; this.style.color='var(--q)'">\u2715</button> <!-- Header --> <div style="padding:30px 30px 20px; text-align:center; background:linear-gradient(180deg, ${fuocAlpha(i, "22")} 0%, transparent 100%);"> <div style="font-size:4rem; margin-bottom:15px;"> ${e.cumulativeScore >= 10 ? "\u{1F3C6}" : e.cumulativeScore >= 5 ? "\u2B50" : e.cumulativeScore >= 0 ? "\u2728" : "\u{1F4AB}"} </div> <h1 style="margin:0; font-size:1.8rem; color:${i}; text-shadow:0 2px 20px ${fuocAlpha(i, "88")};">
              ${n.title} </h1> <div style="color:var(--e); font-size:0.9rem; margin-top:10px;">${e.title} Complete</div> </div> <!-- Score display --> <div style="text-align:center; padding:0 30px 20px;"> <div style=" display:inline-block; padding:15px 40px; background:linear-gradient(135deg, ${fuocAlpha(i, "33")} 0%, transparent 100%);
              border:2px solid ${fuocAlpha(i, "55")}; border-radius:50px; "> <span style="color:var(--e); font-size:0.9rem;">Final Score:</span> <span style="color:${i}; font-size:2rem; font-weight:bold; margin-left:10px;">
                ${e.cumulativeScore >= 0 ? "+" : ""}${e.cumulativeScore} </span> </div> </div> <!-- Outcome text --> <div style="padding:0 30px 20px;"> <div style=" color:var(--cu); font-size:1.1rem; line-height:1.7; text-align:center; font-family:Georgia, serif; padding:20px; background:var(--bb); border-radius:15px; border-left:3px solid ${i};
            ">
              ${a} </div> </div> <!-- Journey summary --> <div style="padding:0 30px 20px;"> <div style="color:var(--e); font-size:0.8rem; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;">Your Journey</div> ${s} </div> ${r} <!-- Continue button --> <div style="padding:20px 30px 30px; text-align:center;"> <button onclick=" gameState.story.activeMultiStepEvent = null; document.getElementById('storyEventModal').remove(); if (typeof saveGame === 'function') saveGame(); " style=" padding:16px 50px; background:linear-gradient(135deg, ${i}, ${fuocAlpha(i, "88")});
              border:none; border-radius:12px; color:var(--q); 
              font-size:1.1rem; font-weight:bold; cursor:pointer;
              transition:all 0.3s ease;
              box-shadow:0 5px 20px ${fuocAlpha(i, "44")}; " onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'"> Continue </button> </div> </div> `, document.body.appendChild(o), o.addEventListener("click", (e2) => {
    e2.target === o && (gameState.story.activeMultiStepEvent = null, o.remove(), "function" == typeof saveGame && saveGame());
  });
}, canStartMultiStepEvent(e) {
  if (gameState.story.activeMultiStepEvent) return false;
  if (gameState.story.completedMultiStepEvents?.some((t2) => t2.id === e)) return false;
  const t = this.MULTI_STEP_EVENTS[e];
  if (!t) return false;
  const n = t.unlockConditions || {}, a = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus);
  return !(n.minEmployees && a.length < n.minEmployees || n.minCash && gameState.cash < n.minCash || n.minAct && gameState.story.currentAct < n.minAct);
}, getAvailableMultiStepEvents() {
  return Object.keys(this.MULTI_STEP_EVENTS).filter((e) => this.canStartMultiStepEvent(e));
}, showMilestoneAchievement(e) {
  const t = document.createElement("div");
  t.style.cssText = "\n        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);\n        background: linear-gradient(135deg, var(--ad) 0%, var(--w) 100%);\n        border: 3px solid var(--m); border-radius: 20px;\n        padding: 30px 50px; text-align: center;\n        z-index: 100005; animation: storySlideUp 0.5s ease-out;\n        box-shadow: 0 0 50px rgba(255,215,0,0.3);\n      ", t.innerHTML = ` <div style="font-size: 4rem; margin-bottom: 15px;">\u{1F3C6}</div> <div style="color: var(--m); font-size: 1.5rem; font-weight: bold; margin-bottom: 10px;"> ${e.name} Unlocked! </div> <div style="color: var(--a); font-size: 1rem; margin-bottom: 20px;"> ${e.bonus} </div> <button onclick="this.parentElement.remove()" style=" padding: 10px 30px; background: var(--z); border: none; border-radius: 8px; color: var(--q); font-weight: bold; cursor: pointer; ">Awesome!</button> `, document.body.appendChild(t), setTimeout(() => {
    t.parentElement && t.remove();
  }, 5e3);
}, applyAlignmentEffect(e) {
  const t = { lawful: { moral: 3, charisma: 1, ruthless: -1 }, light: { moral: 5, charisma: 2, ruthless: -2 }, neutral: { moral: 0, charisma: 0, ruthless: 0 }, dark: { moral: -5, charisma: -1, ruthless: 3 }, ruthless: { moral: -8, charisma: -2, ruthless: 5 }, ambitious: { moral: -1, charisma: 3, ruthless: 1 }, defiant: { moral: 2, charisma: 2, ruthless: 0 }, humble: { moral: 4, charisma: 0, ruthless: -2 }, charismatic: { moral: 0, charisma: 4, ruthless: 0 }, calculating: { moral: -2, charisma: 1, ruthless: 2 }, pragmatic: { moral: 0, charisma: 1, ruthless: 0 }, cautious: { moral: 1, charisma: -1, ruthless: -1 }, independent: { moral: 1, charisma: 2, ruthless: 0 }, determined: { moral: 1, charisma: 2, ruthless: 1 }, adaptive: { moral: 0, charisma: 2, ruthless: 0 }, risky: { moral: -1, charisma: 1, ruthless: 2 }, submissive: { moral: -1, charisma: -2, ruthless: -2 }, diplomatic: { moral: 2, charisma: 3, ruthless: -1 }, cunning: { moral: -2, charisma: 2, ruthless: 2 }, innovative: { moral: 1, charisma: 2, ruthless: 0 } }, n = t[e] || t.neutral;
  gameState.story.moralScore = Math.max(0, Math.min(100, gameState.story.moralScore + n.moral)), gameState.story.charismaScore = Math.max(0, Math.min(100, gameState.story.charismaScore + n.charisma)), gameState.story.ruthlessnessScore = Math.max(0, Math.min(100, gameState.story.ruthlessnessScore + n.ruthless)), this.updateManagementStyle();
}, showConsequenceToast(e) {
  const t = document.createElement("div");
  t.style.cssText = "\n        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);\n        background: linear-gradient(135deg, var(--dc) 0%, var(--ae) 100%);\n        border: 2px solid var(--j); border-radius: 12px;\n        padding: 15px 25px; max-width: 400px;\n        z-index: 100002; animation: storySlideUp 0.5s ease-out;\n        box-shadow: 0 10px 40px rgba(102,126,234,0.3);\n      ", t.innerHTML = ` <div style="color:var(--j); font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Consequence</div> <div style="color:var(--b); font-size:0.95rem; line-height:1.5;">${e.consequence}</div> `, document.body.appendChild(t), setTimeout(() => {
    t.style.animation = "storyFadeOut 0.5s ease-out", setTimeout(() => t.remove(), 500);
  }, 4e3);
}, addJournalEntry(e) {
  const t = { id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, title: e.title, content: e.content, type: e.type || "event", actNumber: e.actNumber || gameState.story.currentAct, timestamp: Date.now(), memorable: e.memorable || false, eventKey: e.eventKey || null, fullCinematicText: e.fullCinematicText || null, choiceMade: e.choiceMade || null, choiceConsequence: e.choiceConsequence || null, choiceAlignment: e.choiceAlignment || null, imageUrl: e.imageUrl || null };
  gameState.story.journal.unshift(t), gameState.story.journal.length > 100 && (gameState.story.journal = gameState.story.journal.slice(0, 100)), this.updateJournalUI();
}, addStoryRecapToChat(e, t, n, a) {
  if (!e || !t) return;
  gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
  const o = "positive" === a ? "\u{1F49A}" : "negative" === a ? "\u{1F494}" : "\u{1F4AD}", i = "spine" === t.type ? "\u2B50" : "\u{1F4DC}", s = t.cinematicText ? t.cinematicText.split(".").slice(0, 2).join(".").substring(0, 150) + "..." : t.title, r = `${i} **Story Event: ${t.title}**

${s}

${o} *Your choice: "${n.text}"*
${n.consequence ? `
\u2192 ${n.consequence.substring(0, 150)}${n.consequence.length > 150 ? "..." : ""}` : ""}

*${e.name} will remember this moment and how it affected your relationship.*`, l = gameState.time?.currentTime || Date.now();
  gameState.chatHistory[e.id].push({ sender: "\u{1F4D6} Story", content: r, isPlayer: false, timestamp: l, isStoryRecap: true, eventTitle: t.title, eventKey: t.eventKey, choiceMade: n.text, sentiment: a }), gameState.activeChat?.id === e.id && "function" == typeof addChatMessage && addChatMessage("\u{1F4D6} Story", r, false, null, gameState.chatHistory[e.id].length - 1, null, l, false, true), console.log(`[StoryEngine] Added story recap to ${e.name}'s chat: ${t.title}`);
}, showJournalEntryDetails(e) {
  const t = gameState.story.journal.find((t2) => t2.id === e);
  if (!t) return;
  const n = document.getElementById("journalDetailModal");
  n && n.remove();
  const a = new Date(t.timestamp).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }), o = { spine: "\u2B50", rib: "\u{1F4DC}", choice: "\u{1F3AF}", act_transition: "\u{1F3DB}\uFE0F", event: "\u{1F4CB}", minor: "\u{1F4DD}", consequence: "\u26A0\uFE0F", benefit: "\u{1F381}", achievement: "\u{1F3C6}", relationship: "\u{1F495}" }[t.type] || "\u{1F4CB}";
  let i = "";
  if (t.choiceMade) {
    const e2 = { lawful: "var(--n)", light: "var(--u)", neutral: "var(--z)", dark: "var(--l)", ruthless: "var(--dk)", ambitious: "var(--eh)", defiant: "var(--au)", humble: "#a0c4ff", charismatic: "var(--z)", calculating: "var(--bt)", pragmatic: "var(--da)", cautious: "var(--a)", independent: "var(--do)", determined: "var(--au)", adaptive: "#4cc9f0", risky: "var(--al)", submissive: "#b8b8d1", diplomatic: "var(--da)", cunning: "var(--bt)", innovative: "var(--u)", compassionate: "var(--n)" }[t.choiceAlignment] || "var(--j)";
    i = ` <div style="margin-top:20px; padding:15px; background:linear-gradient(135deg, ${fuocAlpha(e2, "22")}, transparent); border-radius:10px; border-left:3px solid ${e2};"> <div style="font-size:0.85rem; color:var(--e); margin-bottom:8px;">YOUR CHOICE:</div> <div style="font-size:1rem; color:var(--b); font-weight:600; margin-bottom:10px;">"${t.choiceMade}"</div> ${t.choiceAlignment ? `<div style="font-size:0.75rem; color:${e2}; text-transform:uppercase; margin-bottom:10px;">${t.choiceAlignment}</div>` : ""}
            ${t.choiceConsequence ? ` <div style="font-size:0.85rem; color:var(--a); font-style:italic; border-top:1px solid var(--o); padding-top:10px; margin-top:10px;"> ${t.choiceConsequence} </div> ` : ""} </div> `;
  }
  let s = "";
  t.imageUrl && (s = ` <div style="margin:20px 0; text-align:center;"> <img src="${t.imageUrl}" alt="Event image" style="max-width:100%; max-height:300px; border-radius:10px; box-shadow:0 4px 20px var(--am);" onerror="this.style.display='none'"> </div> `);
  const r = document.createElement("div");
  r.id = "journalDetailModal", r.style.cssText = "\n        position:fixed; top:0; left:0; width:100%; height:100%; z-index:10000;\n        background:var(--an); display:flex; align-items:center; justify-content:center;\n        animation:fadeIn 0.3s ease;\n      ", r.innerHTML = ` <div style=" background:linear-gradient(135deg, var(--w) 0%, var(--ae) 100%); border-radius:20px; max-width:700px; width:90%; max-height:85vh; box-shadow:0 20px 60px var(--ab); overflow:hidden; display:flex; flex-direction:column; "> <!-- Header --> <div style=" padding:20px 25px; background:linear-gradient(135deg, var(--w) 0%, var(--w) 100%); border-bottom:1px solid var(--o); display:flex; justify-content:space-between; align-items:center; "> <div style="display:flex; align-items:center; gap:12px;"> <span style="font-size:1.8rem;">${o}</span> <div> <h2 style="margin:0; color:var(--b); font-size:1.3rem;">${t.title}</h2> <div style="color:var(--e); font-size:0.8rem; margin-top:4px;">Act ${t.actNumber} \u2022 ${a}</div> </div> </div> <button onclick="document.getElementById('journalDetailModal').remove()" style=" background:none; border:none; color:var(--e); font-size:1.8rem; cursor:pointer; padding:5px 10px; line-height:1; " onmouseover="this.style.color='var(--b)'" onmouseout="this.style.color='var(--q)'">\xD7</button> </div> <!-- Content --> <div style="padding:25px; overflow-y:auto; flex:1;"> ${t.memorable ? '<div style="display:inline-block; background:#ffd70033; color:var(--m); padding:4px 12px; border-radius:20px; font-size:0.75rem; margin-bottom:15px;">\u2605 MEMORABLE MOMENT</div>' : ""}
            
            ${s}
            
            <div style="
              color:var(--fx); font-size:1rem; line-height:1.8;
              white-space:pre-wrap;
            ">${t.fullCinematicText || t.content}</div> ${i} </div> <!-- Footer --> <div style="padding:15px 25px; border-top:1px solid var(--o); text-align:right;"> <button onclick="document.getElementById('journalDetailModal').remove()" style=" padding:10px 25px; background:linear-gradient(135deg, var(--j) 0%, var(--ak) 100%); border:none; border-radius:10px; color:var(--s); font-size:0.9rem; cursor:pointer; font-weight:600; ">Close</button> </div> </div> `, r.addEventListener("click", (e2) => {
    e2.target === r && r.remove();
  });
  const l = (e2) => {
    "Escape" === e2.key && (r.remove(), document.removeEventListener("keydown", l));
  };
  document.addEventListener("keydown", l), document.body.appendChild(r);
}, updateStoryUI() {
  if (!gameState.story) return;
  const e = gameState.story.currentAct, t = this.ACT_CONFIG[e], n = document.getElementById("currentActTitle"), a = document.getElementById("currentActDescription");
  n && (n.textContent = t.title), a && (a.textContent = t.description);
  const o = document.getElementById("actProgressPath"), i = document.getElementById("actProgressPercent");
  if (o && i) {
    const e2 = gameState.story.actProgress;
    o.setAttribute("stroke-dasharray", `${e2}, 100`), i.textContent = `${e2}%`;
  }
  const s = document.getElementById("storyMoralAlignment");
  if (s) {
    const e2 = this.getAlignmentInfo(gameState.story.moralScore);
    s.textContent = e2.emoji, s.title = e2.name, s.style.color = e2.color;
  }
  this.updateActionStatsUI(), this.updateTimelineUI(), this.updateFactionsUI(), this.updateJournalUI(), this.updateChronicleUI(), this.updateActiveArcsUI(), this.updateExtendedEventsUI();
}, updateActiveArcsUI() {
  const host = document.getElementById("activeArcsList");
  if (!host) return;
  const arcs = (gameState.story?.emergentNarratives?.activeArcs || []).slice().sort((a, b) => (b.lastAdvancedAt || 0) - (a.lastAdvancedAt || 0));
  Ht() && 0 !== arcs.length ? host.innerHTML = arcs.map((a) => {
    const total = (this.ARC_TYPES[a.arcType]?.stages || []).length || 3, dots = Array.from({ length: total }, (e, i) => i <= a.stage ? "\u25CF" : "\u25CB").join("");
    return `<div class="row row-between" style="padding:8px 0; border-bottom:1px solid var(--o);"> <div class="row" style="gap:8px; min-width:0;"> <span style="font-size:1.05rem;">${a.emoji || "\u{1F3AD}"}</span> <div style="min-width:0;"> <div class="fs-sm text-body fw-600" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${Qg(a.employeeName)}</div> <div class="text-dim fs-xs">${Qg(a.name)} \xB7 ${Qg(a.stageName || "")}</div> </div> </div> <span class="text-accent fs-xs" title="Stage ${a.stage + 1} of ${total}" style="letter-spacing:2px;">${dots}</span> </div>`;
  }).join("") : host.innerHTML = '<div class="empty-note">Storylines emerge from how your people actually feel about you...</div>';
}, buildChronicle(limit = 50) {
  const out = [], s = gameState.story, now = gameState.time?.currentTime || Date.now(), u2 = {};
  (gameState.employees || []).forEach((e) => u2[e.id] = e), (gameState.employees || []).forEach((emp2) => {
    (emp2.memory?.eventMemories || []).forEach((m) => {
      (m.emotionalWeight || 3) < 4 || out.push({ timestamp: m.timestamp || now, kind: "people", icon: "negative" === m.sentiment ? "\u{1F494}" : "positive" === m.sentiment ? "\u{1F496}" : "\u{1F5E3}\uFE0F", memorable: (m.emotionalWeight || 3) >= 6, text: `<b>${Qg(emp2.name)}</b> ${"negative" === m.sentiment ? "still hasn't forgotten" : "remembers"} \u201C${Qg(m.title || "something")}\u201D${m.outcome ? ` \u2014 ${Qg(m.outcome)}` : ""}` });
    });
  }), (s.actionLog || []).forEach((a) => {
    const name = a.context?.employeeName || u2[a.context?.employeeId]?.name;
    name && out.push({ timestamp: a.timestamp || now, kind: "people", icon: a.moralImpact > 0 ? "\u2728" : a.moralImpact < 0 ? "\u26A1" : "\u{1F4CB}", text: `You ${Qg(a.description || "acted")} \u2014 <b>${Qg(name)}</b>` });
  }), (gameState.socialNetwork?.posts || []).slice(0, 30).forEach((post) => {
    const emp2 = u2[post.authorId];
    emp2 && post.content && out.push({ timestamp: post.timestamp || now, kind: "people", icon: "\u{1F4F1}", text: `<b>${Qg(emp2.name)}</b> posted: \u201C${Qg(post.content.slice(0, 140))}${post.content.length > 140 ? "\u2026" : ""}\u201D` });
  }), (gameState.payroll?.weeklyPayrollHistory || []).forEach((p) => {
    const short = false === p.hadEnough;
    out.push({ timestamp: p.date || now, kind: "money", icon: short ? "\u{1FA78}" : p.wasEarlyBonus ? "\u{1F381}" : "\u{1F4B5}", memorable: short, text: short ? `Payroll came up short \u2014 only ${p.proRatedCount ?? p.employeeCount} of ${p.employeeCount} got paid (${xu(p.amount)}).` : `${p.wasEarlyBonus ? "Early bonus paid out" : "Payroll ran clean"}: ${xu(p.amount)} to ${p.employeeCount} ${1 === p.employeeCount ? "person" : "people"}.` });
  });
  const G2 = gameState.payroll?.arrears;
  return G2 && G2.missedCount > 0 && out.push({ timestamp: Number(G2.sinceWeekId) || now, kind: "money", icon: "\u26D3\uFE0F", memorable: G2.missedCount >= 3, text: `Wages overdue: <b>${G2.missedCount}</b> week${G2.missedCount > 1 ? "s" : ""} behind${G2.amount ? ` (${xu(G2.amount)})` : ""}. The roster is noticing.` }), (gameState.bossFights?.history || []).forEach((b) => {
    const won = "victory" === b.result || b.victorious;
    out.push({ timestamp: b.timestamp || now, kind: "milestone", icon: won ? "\u{1F3C6}" : "\u{1F480}", memorable: true, text: won ? `You came out on top against <b>${Qg(b.bossId || b.bossKey || "a rival")}</b>.` : `<b>${Qg(b.bossId || b.bossKey || "A rival")}</b> got the better of you.` });
  }), (gameState.companyEvents?.history || []).forEach((c) => {
    out.push({ timestamp: c.timestamp || c.generatedAt || c.triggerAt || now, kind: "milestone", icon: "\u{1F5C2}\uFE0F", text: `<b>${Qg(c.name || c.title || "A company event")}</b> resolved${c.outcomeText ? ` \u2014 ${Qg(c.outcomeText.slice(0, 120))}` : ""}.` });
  }), (s.journal || []).forEach((j) => {
    "arc" === j.type && out.push({ timestamp: j.timestamp || now, kind: "people", icon: "\u{1F3AD}", memorable: j.memorable, journalId: j.id, text: Qg(j.content || j.title || "") });
  }), (s.journal || []).forEach((j) => {
    if (!["spine", "act_transition", "achievement", "choice", "player", "moment", "faction"].includes(j.type)) return;
    const u3 = "player" === j.type || "moment" === j.type;
    out.push({ timestamp: j.timestamp || now, kind: "milestone", icon: "moment" === j.type ? "\u{1F4AB}" : "faction" === j.type ? "\u{1F3F4}" : "player" === j.type ? "\u{1F451}" : "act_transition" === j.type ? "\u{1F3DB}\uFE0F" : "achievement" === j.type ? "\u{1F947}" : "choice" === j.type ? "\u{1F3AF}" : "\u2B50", memorable: j.memorable, journalId: j.id, text: u3 ? Qg(j.content || j.title || "") : `<b>${Qg(j.title || "A turning point")}</b>` });
  }), out.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, limit);
}, setChronicleFilter(e) {
  gameState.story && (gameState.story.chronicleFilter = e, this.updateChronicleUI());
}, updateChronicleUI() {
  const feed = document.getElementById("storyChronicleFeed");
  if (!feed || !gameState.story) return;
  if (!Ht()) return void (feed.innerHTML = '<div class="text-dim italic fs-md" style="padding:30px 10px; text-align:center;">Story is disabled. Enable it in Settings to see your Chronicle.</div>');
  const filter = gameState.story.chronicleFilter || "all", all = this.buildChronicle(50), counts = { all: all.length, people: 0, money: 0, milestone: 0 };
  all.forEach((e) => counts[e.kind] = (counts[e.kind] || 0) + 1);
  const shown = "all" === filter ? all : all.filter((e) => e.kind === filter), chip = (key, label, active) => `<button onclick="StoryEngine.setChronicleFilter('${key}')" style="padding:6px 12px; border-radius:15px; font-size:0.75rem; cursor:pointer; border:none; background:${active ? "var(--d)" : "var(--ag)"}; color:${active ? "var(--s)" : "var(--aw)"};">${label}</button>`, filters = `<div style="display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap;">${chip("all", `All (${counts.all})`, "all" === filter)}${chip("people", `\u{1F465} People (${counts.people || 0})`, "people" === filter)}${chip("money", `\u{1F4B5} Money (${counts.money || 0})`, "money" === filter)}${chip("milestone", `\u{1F3DB}\uFE0F Milestones (${counts.milestone || 0})`, "milestone" === filter)}</div>`;
  if (0 === shown.length) return void (feed.innerHTML = filters + '<div class="text-dim italic fs-md" style="padding:30px 10px; text-align:center;">Nothing here yet. Keep playing \u2014 your Chronicle writes itself from what actually happens.</div>');
  const rows = shown.map((e) => {
    const click = e.journalId ? ` onclick="StoryEngine.showJournalEntryDetails('${e.journalId}')"` : "";
    return `<div class="row row-top" data-kind="${e.kind}"${click} style="gap:10px; padding:10px 4px; border-bottom:1px solid var(--o);${e.journalId ? "cursor:pointer;" : ""}"> <span style="font-size:1.1rem; line-height:1.4;">${e.icon}</span> <div style="flex:1; min-width:0;"> <div class="fs-sm text-body" style="line-height:1.45;${e.memorable ? "color:var(--m);" : ""}">${e.text}</div> <div class="text-mute fs-xs mt-1">${Wt(e.timestamp)}${e.memorable ? " \u2022 \u2605" : ""}</div> </div> </div>`;
  }).join("");
  feed.innerHTML = filters + rows;
}, updateExtendedEventsUI() {
  const e = document.getElementById("activeMultiStepStatus");
  if (!e) return;
  const t = gameState.story.activeMultiStepEvent, n = gameState.story.completedMultiStepEvents || [], a = this.getAvailableMultiStepEvents();
  if (t) {
    const n2 = this.MULTI_STEP_EVENTS[t.id];
    e.style.display = "block", e.innerHTML = ` <div style="background:linear-gradient(135deg, ${fuocAlpha(t.themeColor || "var(--j)", "22")}, transparent); padding:12px; border-radius:10px; border-left:3px solid ${t.themeColor || "var(--j)"};"> <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;"> <span style="font-size:1.2rem;">${n2.title.match(/^[^\s]+/)[0] || "\u{1F3AC}"}</span> <span style="color:var(--b); font-weight:600; font-size:0.9rem;">In Progress</span> </div> <div style="color:var(--a); font-size:0.8rem;"> Step ${t.currentStep} of ${t.totalSteps} \u2022 Score: <span style="color:${t.cumulativeScore >= 0 ? "var(--n)" : "var(--l)"}">${t.cumulativeScore >= 0 ? "+" : ""}${t.cumulativeScore}</span> </div> <button onclick="StoryEngine.showMultiStepEventStep(${t.currentStep - 1})" style=" margin-top:10px; padding:8px 15px; width:100%; background:var(--j); border:none; border-radius:8px; color:var(--s); font-size:0.85rem; cursor:pointer; ">Continue Event</button> </div> `;
  } else a.length > 0 ? (e.style.display = "block", e.innerHTML = ` <div style="color:var(--g); font-size:0.85rem; display:flex; align-items:center; gap:6px;"> <span>\u2728</span> ${a.length} event${a.length > 1 ? "s" : ""} available </div> ${n.length > 0 ? ` <div style="color:var(--e); font-size:0.75rem; margin-top:6px;"> ${n.length} completed </div> ` : ""}
        `) : n.length > 0 ? (e.style.display = "block", e.innerHTML = ` <div style="color:var(--e); font-size:0.85rem;"> ${n.length} event${n.length > 1 ? "s" : ""} completed </div> `) : e.style.display = "none";
}, updateActionStatsUI() {
  const e = gameState.story.actionStats || { totalActions: 0 }, t = document.getElementById("storyTotalActions");
  t && (t.textContent = e.totalActions || 0);
  const n = document.getElementById("moralAlignmentBar");
  if (n) {
    const e2 = 100 - gameState.story.moralScore;
    n.style.left = `${e2}%`;
  }
  const a = document.getElementById("latestActionText");
  if (a && gameState.story.actionLog?.length > 0) {
    const e2 = gameState.story.actionLog[0], t2 = e2.moralImpact > 0 ? "\u2728" : e2.moralImpact < 0 ? "\u26A1" : "\u{1F4CB}";
    a.innerHTML = `${t2} You ${e2.description}`, a.style.color = e2.moralImpact > 0 ? "var(--n)" : e2.moralImpact < 0 ? "var(--l)" : "var(--ar)";
  }
  const b = document.getElementById("becomingText");
  if (b) {
    const info = this.getAlignmentInfo(gameState.story.moralScore || 50), recent = (gameState.story.actionLog || []).slice(0, 8).reduce((s, e2) => s + (e2.moralImpact || 0), 0), drift = recent > 2 ? " \u2014 and softening lately" : recent < -2 ? " \u2014 and hardening lately" : "";
    b.innerHTML = `${info.emoji} a ${Qg(info.name.toLowerCase())}${drift}`, b.style.color = info.color || "var(--ar)";
  }
}, getAlignmentInfo(e) {
  const t = [0, 25, 50, 75, 100];
  for (let n = t.length - 1; n >= 0; n--) if (e >= t[n]) return this.ALIGNMENTS[t[n]];
  return this.ALIGNMENTS[0];
}, updateTimelineUI() {
  const e = gameState.story.currentAct;
  document.querySelectorAll(".timeline-act").forEach((t) => {
    if (!t) return;
    const n = parseInt(t.dataset.act);
    t.classList.remove("active", "completed", "locked");
    const a = t.querySelector('div[style*="position:absolute"]');
    n < e ? (t.classList.add("completed"), t.style.opacity = "0.7", a && (a.style.background = "var(--n)")) : n === e ? (t.classList.add("active"), t.style.opacity = "1", a && (a.style.background = "var(--j)", a.style.boxShadow = "0 0 10px rgba(102,126,234,0.5)")) : (t.classList.add("locked"), t.style.opacity = "0.5", a && (a.style.background = "var(--av)", a.style.boxShadow = "none"));
  });
}, updateFactionsUI() {
  const e = document.getElementById("factionsList");
  if (!e) return;
  const t = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus).length;
  if (t < 5) return void (e.innerHTML = '<div class="empty-note">Factions emerge as your empire grows...</div>');
  const n = { loyalists: { name: "Loyalists", emoji: "\u{1F451}", color: "var(--z)", desc: "Devoted to you completely" }, opportunists: { name: "Opportunists", emoji: "\u{1F4B0}", color: "var(--n)", desc: "Following the money" }, reformers: { name: "Reformers", emoji: "\u2696\uFE0F", color: "var(--u)", desc: "Want change and ethics" }, underground: { name: "Underground", emoji: "\u{1F319}", color: "var(--bt)", desc: "Embrace the shadows" } };
  let a = "", assigned = 0;
  for (const [e2, o] of Object.entries(n)) {
    const f = gameState.story.factions[e2], n2 = f.members.length, i = t > 0 ? Math.round(n2 / t * 100) : 0, u3 = f.figureheadName;
    assigned += n2, n2 > 0 && (a += ` <div class="subpanel mb-1" style="border-left:3px solid ${o.color};"> <div class="row-between mb-1"> <div class="row"> <span style="font-size:1.2rem;">${o.emoji}</span> <span class="fw-600" style="color:${o.color};">${o.name}</span> </div> <span class="text-body fw-600">${n2} \xB7 ${i}%</span> </div> <div class="text-dim fs-xs mb-1">${o.desc}</div> ${u3 ? `<div class="text-dim fs-xs mb-1">\u{1F399}\uFE0F led by ${Qg(u3)}</div>` : ""} <div class="bar"> <div class="bar-fill" style="width:${i}%; background:${o.color};"></div> </div> </div> `);
  }
  const u2 = Math.max(0, t - assigned);
  u2 > 0 && (a += ` <div class="subpanel mb-0" style="border-left:3px solid var(--o);"> <div class="row-between"> <div class="row"><span style="font-size:1.2rem;">\u{1F90D}</span><span class="fw-600 text-dim">Unaligned</span></div> <span class="text-dim fw-600">${u2} \xB7 ${Math.round(u2 / t * 100)}%</span> </div> </div> `), e.innerHTML = a || '<div class="empty-note">No clear factions have emerged yet.</div>';
}, updateJournalUI() {
  const e = document.getElementById("storyJournal"), t = document.getElementById("journalEmpty");
  if (!e) return;
  const n = gameState.story.journal, a = gameState.story.journalFilter || "all";
  if (0 === n.length) return void (t && (t.style.display = "block"));
  t && (t.style.display = "none");
  let o = n;
  "all" !== a && (o = "memorable" === a ? n.filter((e2) => e2.memorable) : n.filter((e2) => e2.type === a));
  const i = { spine: "\u2B50", rib: "\u{1F4DC}", choice: "\u{1F3AF}", act_transition: "\u{1F3DB}\uFE0F", event: "\u{1F4CB}", minor: "\u{1F4DD}", consequence: "\u26A0\uFE0F", benefit: "\u{1F381}", achievement: "\u{1F3C6}", relationship: "\u{1F495}" }, s = n.filter((e2) => e2.memorable).length, r = n.filter((e2) => "choice" === e2.type).length, l = n.filter((e2) => "spine" === e2.type).length, c = ` <div style="display:flex; gap:8px; margin-bottom:15px; flex-wrap:wrap;"> <button onclick="StoryEngine.setJournalFilter('all')" style=" padding:6px 12px; border-radius:15px; font-size:0.75rem; cursor:pointer; background:${"all" === a ? "var(--j)" : "var(--ag)"}; 
            border:none; color:${"all" === a ? "var(--s)" : "var(--aw)"};
          ">All (${n.length})</button> <button onclick="StoryEngine.setJournalFilter('memorable')" style=" padding:6px 12px; border-radius:15px; font-size:0.75rem; cursor:pointer; background:${"memorable" === a ? "var(--z)" : "var(--ag)"}; 
            border:none; color:${"memorable" === a ? "var(--bj)" : "var(--aw)"};
          ">\u2B50 Memorable (${s})</button> <button onclick="StoryEngine.setJournalFilter('spine')" style=" padding:6px 12px; border-radius:15px; font-size:0.75rem; cursor:pointer; background:${"spine" === a ? "var(--l)" : "var(--ag)"}; 
            border:none; color:${"spine" === a ? "var(--s)" : "var(--aw)"};
          ">\u{1F4D6} Story (${l})</button> <button onclick="StoryEngine.setJournalFilter('choice')" style=" padding:6px 12px; border-radius:15px; font-size:0.75rem; cursor:pointer; background:${"choice" === a ? "var(--n)" : "var(--ag)"}; 
            border:none; color:${"choice" === a ? "var(--bj)" : "var(--aw)"};
          ">\u{1F3AF} Choices (${r})</button> </div> <!-- Quick Stats Panel --> <div class="subpanel mb-2" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:var(--s3);"> <div class="text-center"> <div class="fs-xl fw-700 text-accent">${gameState.story.choicesMade || 0}</div> <div class="text-mute" style="font-size:0.7rem;">Choices Made</div> </div> <div class="text-center"> <div class="fs-xl fw-700 text-gold">${gameState.story.totalCleverResponses || 0}</div> <div class="text-mute" style="font-size:0.7rem;">Clever Moves</div> </div> <div class="text-center"> <div class="fs-xl fw-700 text-pos">${gameState.story.currentAct}</div> <div class="text-mute" style="font-size:0.7rem;">Current Act</div> </div> </div> `;
  let d = o.slice(0, 30).map((e2) => {
    const t2 = i[e2.type] || "\u{1F4CB}", n2 = new Date(e2.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }), a2 = e2.pending && gameState.story.activeSpineEvent, o2 = a2 ? '<button onclick="event.stopPropagation(); StoryEngine.showStoryEventModal(gameState.story.activeSpineEvent)" class="btn btn--be mt-1">\u25B6\uFE0F Continue Event</button>' : "", s2 = a2 ? '<span class="text-gold fs-xs" style="margin-left:8px;">\u23F3 Awaiting Choice</span>' : "", r2 = e2.memorable && !a2 ? '<span class="text-gold" style="font-size:0.7rem;">\u2605 MEMORABLE</span>' : "", l2 = (e2.fullCinematicText && e2.fullCinematicText.length > 200 || e2.content && e2.content.length > 200 || e2.choiceMade) && !a2 ? '<div class="text-accent fs-xs mt-1 row" style="gap:4px;"><span>\u{1F4D6}</span> Click to read full story</div>' : "";
    return ` <div class="journal-entry" data-type="${e2.type}" data-eventkey="${e2.eventKey || ""}" 
               onclick="${a2 ? "" : `StoryEngine.showJournalEntryDetails('${e2.id}')`}" 
               style="
            margin-bottom:15px; padding:15px; 
            background:${e2.memorable ? "linear-gradient(135deg, var(--w) 0%, var(--ae) 100%)" : "var(--h)"}; 
            border-radius:var(--r3); 
            border-left:3px solid ${a2 || e2.memorable ? "var(--m)" : "var(--o)"};
            ${e2.memorable || a2 ? "box-shadow:0 2px 10px rgba(245,197,66,0.1);" : ""}
            ${a2 ? "" : "cursor:pointer;"} "> <div class="row-between row-top mb-1"> <div class="row wrap"> <span style="font-size:1.2rem;">${t2}</span> <span class="text-body fw-600 fs-md">${e2.title}</span> ${s2}
                ${r2} </div> <span class="text-mute fs-xs">Act ${e2.actNumber} \u2022 ${n2}</span>
            </div>
            <div class="text-dim fs-sm" style="line-height:1.5; white-space:pre-wrap;">${e2.content.substring(0, 200)}${e2.content.length > 200 ? "..." : ""}</div> ${l2}
            ${o2} </div> `;
  }).join("");
  e.innerHTML = c + d;
}, setJournalFilter(e) {
  gameState.story && (gameState.story.journalFilter = e, this.updateJournalUI());
}, showStoryNotification() {
  const e = document.getElementById("storyNotificationDot");
  e && (e.style.display = "block");
}, hideStoryNotification() {
  const e = document.getElementById("storyNotificationDot");
  e && (e.style.display = "none");
}, generateActTransitionEvent(e, t) {
  const n = this.ACT_CONFIG[t], a = this.ACT_CONFIG[e], o = { 2: { title: "Expansion Tools Unlocked", desc: "New hiring options and product lines available!", mechanic: "hiring_expanded" }, 3: { title: "Advanced Management", desc: "Employee relationships and politics matter more.", mechanic: "relationships_deeper" }, 4: { title: "Crisis Management", desc: "Expect more dramatic events and higher stakes.", mechanic: "high_stakes" }, 5: { title: "Legacy Mode", desc: "Your decisions have lasting consequences.", mechanic: "legacy_tracking" } }[t] || { title: "New Chapter", desc: "New possibilities await.", mechanic: "general" }, i = this.generateActSummary(e), s = { id: `act_transition_${t}_${Date.now()}`, title: `\u2728 ${n.title}`, cinematicText: `\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
\u{1F3AC} A NEW CHAPTER BEGINS
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

${a ? `\u{1F4DC} Reflecting on Act ${e}: "${a.title}"...
${i}

` : ""}The story shifts...

${n.description}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F3AD} THE TONE SHIFTS: ${n.tone.toUpperCase()}
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

New themes emerge:
${n.themes.map((e2) => `  \u2022 ${e2}`).join("\n")}

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
\u{1F513} ${o.title}
${o.desc}
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550`, choices: [{ id: "confident", text: `\u{1F4AA} "I'm ready to face whatever comes."`, alignment: "determined", consequence: "Your confidence inspires the team. +5% company morale.", effects: { productivity: 5 } }, { id: "cautious", text: `\u{1F914} "Let's proceed carefully."`, alignment: "pragmatic", consequence: "Your caution is noted. Stability preserved.", effects: { stability: 5 } }, { id: "ambitious", text: '\u{1F680} "Time to aim higher!"', alignment: "ambitious", consequence: "Your ambition sets new expectations. Risk and reward both increase.", effects: { risk: 10, reward: 10 } }], actNumber: t, type: "act_transition", isActTransition: true, unlockMechanic: o.mechanic };
  this.showActTransitionCinematic(s);
}, generateActSummary(e) {
  const t = gameState.story.actData?.[e];
  if (!t) return "Your journey continues...";
  const n = [];
  t.spineEventsTriggered?.length > 0 && n.push(`\u{1F4D6} ${t.spineEventsTriggered.length} major story events experienced`), t.choicesMade > 0 && n.push(`\u{1F3AF} ${t.choicesMade} key decisions made`), t.ribEventsTriggered?.length > 0 && n.push(`\u{1F4DC} ${t.ribEventsTriggered.length} supporting events witnessed`);
  const a = gameState.story.alignmentScore || 50;
  return a >= 70 ? n.push("\u{1F49D} Your leadership was compassionate and kind") : a <= 30 ? n.push("\u{1F44A} Your leadership was decisive and ruthless") : n.push("\u2696\uFE0F Your leadership balanced pragmatism and heart"), n.length > 0 ? n.join("\n") : "Your journey continues...";
}, showActTransitionCinematic(e) {
  const t = this.ACT_CONFIG[e.actNumber], n = document.createElement("div");
  n.id = "actTransitionCinematic", n.style.cssText = "\n        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n        background: var(--bj); z-index: 100005;\n        display: flex; flex-direction: column; justify-content: center; align-items: center;\n        animation: actCinematicFadeIn 1.5s ease-out;\n      ", n.innerHTML = ` <style> @keyframes actCinematicFadeIn { 0% { opacity: 0; } 100% { opacity: 1; } } @keyframes actTitleGlow { 0%, 100% { text-shadow: 0 0 20px ${t?.color || "var(--j)"}; }
            50% { text-shadow: 0 0 40px ${t?.color || "var(--j)"}, 0 0 60px ${t?.color || "var(--j)"}; } } @keyframes actLineReveal { 0% { width: 0; } 100% { width: 100%; } } </style> <div style="text-align: center; max-width: 800px; padding: 40px;"> <!-- Act Number --> <div style=" font-size: 1.2rem; color: var(--e); letter-spacing: 8px; margin-bottom: 20px; opacity: 0; animation: storyFadeIn 1s ease-out 0.5s forwards; ">ACT ${e.actNumber}</div> <!-- Title --> <h1 style=" font-size: 3rem; color: ${t?.color || "var(--j)"}; margin: 0;
            font-weight: 700; letter-spacing: 3px;
            animation: actTitleGlow 3s ease-in-out infinite;
            opacity: 0; animation: storyFadeIn 1s ease-out 1s forwards, actTitleGlow 3s ease-in-out infinite 1s;
          ">${t?.title || "New Chapter"}</h1> <!-- Decorative line --> <div style=" height: 2px; background: linear-gradient(90deg, transparent, ${t?.color || "var(--j)"}, transparent); margin: 30px auto; max-width: 400px; animation: actLineReveal 2s ease-out 1.5s forwards; "></div> <!-- Tone --> <div style=" font-size: 1.1rem; color: var(--e); font-style: italic; margin-bottom: 30px; opacity: 0; animation: storyFadeIn 1s ease-out 2s forwards; ">"${t?.tone || "A new beginning"}"</div> <!-- Continue button --> <button onclick="gameState.story.activeSpineEvent = StoryEngine.pendingActEvent; StoryEngine.showStoryEventModal(StoryEngine.pendingActEvent); document.getElementById('actTransitionCinematic').remove();" style=" padding: 15px 40px; font-size: 1.1rem; background: linear-gradient(135deg, ${t?.color || "var(--j)"} 0%, ${fuocAlpha(t?.color || "var(--ak)", "88")} 100%); border: none; border-radius: 12px; color: var(--b); cursor: pointer; font-weight: 600; opacity: 0; animation: storyFadeIn 1s ease-out 3s forwards; transition: transform 0.2s, box-shadow 0.2s; " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"> Continue Your Story </button> </div> `, document.body.appendChild(n), this.pendingActEvent = e;
}, MINOR_EVENT_CATEGORIES: ["office incident", "interpersonal drama", "business opportunity", "employee personal issue", "tech/IT problem", "HR situation", "celebration", "crisis", "romantic situation", "mysterious occurrence", "family dynamics"], MINOR_EVENT_TONES: ["serious", "humorous", "dramatic", "heartwarming", "spicy", "mysterious", "urgent"], initializeMinorEvents: () => (gameState.story || (gameState.story = StoryEngine.getDefaultStoryState()), gameState.story.minorEvents || (gameState.story.minorEvents = { queue: [], generating: false, history: [], nextGenerationTime: Date.now() + 12e4, generationCooldown: 3e5, lastNotificationTime: 0 }), gameState.story.minorEvents), checkMinorEvents() {
  if (!gameState.story?.settings?.storyEnabled || !Ht()) return;
  if (gameState.story.activeSpineEvent) return;
  if (gameState.time?.paused) return;
  if (document.getElementById("storyEventModal") || document.getElementById("actTransitionCinematic")) return;
  const e = this.initializeMinorEvents(), t = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus).length;
  if (gameState.cash < 3e4 || t < 5) return;
  const n = gameState.time?.startTime || gameState.time?.currentTime || Date.now();
  if ((gameState.time?.currentTime || Date.now()) - n < 432e6 / (gameState.time?.gameSpeed || 1)) return;
  if (e.queue.length >= 3) return;
  if (Date.now() < e.nextGenerationTime) return;
  if (e.generating) return;
  const a = Math.min(0.4, 0.15 + 0.01 * t);
  Math.random() > a ? e.nextGenerationTime = Date.now() + 6e4 : this.generateMinorEvent().catch((t2) => {
    console.error("[StoryEngine] Minor event generation failed:", t2), e.generating = false;
  });
}, MODE_EXCLUSIVE_EVENTS: { sfw: ["team_building_exercise", "charity_drive", "mentorship_moment", "professional_development", "office_competition", "leadership_challenge", "industry_recognition", "community_outreach", "career_milestone"], nsfw: ["after_hours_tension", "workplace_attraction", "secret_affair", "office_romance", "jealousy_drama", "forbidden_temptation", "power_dynamic", "romantic_confession", "intimate_encounter"] }, buildMinorEventContext() {
  const e = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus), t = this.initializeMinorEvents().history.slice(0, 5), n = "function" != typeof Ue || Ue(), a = this.isAdultContentEnabled(), o = [...e].sort(() => Math.random() - 0.5).slice(0, Math.min(4, e.length)).map((t2) => {
    const a2 = [];
    (t2.stats?.affection || 50) > 70 && a2.push("very affectionate"), (t2.stats?.trust || 50) < 30 && a2.push("distrustful"), (t2.stats?.productivity || 50) > 80 && a2.push("high performer"), (t2.stats?.comfort || 50) < 30 && a2.push("uncomfortable at work"), t2.career?.level >= 4 && a2.push("senior employee"), t2.inRelationshipWithPlayer && a2.push("in relationship with boss"), !n && t2.stats?.desire > 60 && a2.push("attracted to boss");
    let o2 = null;
    if (t2.familyRelations && Object.keys(t2.familyRelations).length > 0) {
      const n2 = [];
      for (const [o3, i2] of Object.entries(t2.familyRelations)) {
        const t3 = e.find((e2) => e2.id === o3);
        t3 && (n2.push({ name: t3.name, relation: i2 }), a2.push(`has ${i2} (${t3.name}) at company`));
      }
      n2.length > 0 && (o2 = n2);
    }
    return { id: t2.id, name: t2.name, role: t2.career?.title || "Employee", personality: t2.personality || "professional", traits: a2, backstory: t2.backstory ? t2.backstory.substring(0, 150) : null, familyAtWork: o2 };
  }), i = [], s = /* @__PURE__ */ new Set();
  e.forEach((t2) => {
    for (const [n2, a2] of Object.entries(t2.familyRelations || {})) {
      const o2 = e.find((e2) => e2.id === n2);
      if (o2) {
        const e2 = [t2.id, o2.id].sort().join("-");
        if (!s.has(e2)) {
          s.add(e2);
          let n3 = null, r2 = null, l2 = a2;
          const c2 = t2.age || 30, d2 = o2.age || 30;
          ["mother", "father", "parent"].includes(a2.toLowerCase()) ? (n3 = o2, r2 = t2, l2 = "male" === o2.gender ? "father" : "mother") : ["daughter", "son", "child"].includes(a2.toLowerCase()) ? (n3 = t2, r2 = o2, l2 = "male" === o2.gender ? "son" : "daughter") : c2 > d2 + 15 ? (n3 = t2, r2 = o2) : d2 > c2 + 15 && (n3 = o2, r2 = t2), i.push({ emp1: { id: t2.id, name: t2.name, age: c2, role: t2.career?.title || "Employee" }, emp2: { id: o2.id, name: o2.name, age: d2, role: o2.career?.title || "Employee" }, relationship: a2, parentChildContext: n3 && r2 ? { parent: { name: n3.name, age: n3.age || 30, role: n3.career?.title || "Employee" }, child: { name: r2.name, age: r2.age || 30, role: r2.career?.title || "Employee" }, roleReversal: (r2.career?.level || 0) > (n3.career?.level || 0), roleReversalNote: (r2.career?.level || 0) > (n3.career?.level || 0) ? `NOTE: ${r2.name} (the ${"son" === l2 || "daughter" === l2 ? "child" : "younger one"}) outranks ${n3.name} (the parent) at work!` : null } : null });
        }
      }
    }
  });
  const r = gameState.story.moralScore || 50, l = this.getAlignmentInfo(r), c = { cash: gameState.cash, cashFormatted: "function" == typeof xu ? xu(gameState.cash) : `$${gameState.cash.toLocaleString()}`, employeeCount: e.length, isStruggling: gameState.cash < 1e4, isThriving: gameState.cash > 5e5, bossAlignment: l.name, recentEventTypes: t.map((e2) => e2.category).filter(Boolean), hasFamilyMembers: i.length > 0 };
  let d, p = null;
  const m = gameState.story?.familyEventCooldown || 18e5, u2 = gameState.story?.lastFamilyEventTime || 0, g = gameState.story?.consecutiveFamilyEvents || 0, h = Date.now() - u2 < m, y = g >= 2, f = 2 * i.length, b = 0.08 * Math.min(1, f / e.length);
  if (i.length > 0 && !h && !y && Math.random() < b) d = "family dynamics";
  else if (Math.random() < 0.3) {
    const e2 = n ? this.MODE_EXCLUSIVE_EVENTS.sfw : this.MODE_EXCLUSIVE_EVENTS.nsfw;
    d = e2[Math.floor(Math.random() * e2.length)], p = n ? "sfw" : "nsfw";
  } else d = this.MINOR_EVENT_CATEGORIES[Math.floor(Math.random() * this.MINOR_EVENT_CATEGORIES.length)];
  return { employees: o, company: c, suggestedCategory: d, suggestedTone: this.MINOR_EVENT_TONES[Math.floor(Math.random() * this.MINOR_EVENT_TONES.length)], allowSpicy: a, recentEvents: t.map((e2) => e2.title).slice(0, 3), familyPairs: i, hasFamilyAtCompany: i.length > 0, contentMode: n ? "sfw" : "nsfw", modeExclusive: p, modeGuidelines: n ? "Keep all content workplace-appropriate. Focus on professional growth, teamwork, and career themes." : "Can include romantic tension, attraction, and mature workplace dynamics. Relationships between consenting adults." };
}, async generateMinorEvent() {
  const e = this.initializeMinorEvents();
  if (e.generating || e.queue.length >= 3) return null;
  const t = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus).length;
  if (gameState.cash < 3e4 || t < 5) return null;
  e.generating = true;
  try {
    const t2 = this.buildMinorEventContext();
    if (0 === t2.employees.length) return e.generating = false, null;
    const n = t2.modeExclusive ? `\u26A0\uFE0F This is a MODE-EXCLUSIVE event type (${t2.modeExclusive.toUpperCase()} only). Make it unique to this mode!` : "", a = `You are creating a minor company event for an office management game. These are small, flavor events - not major plot points.

CONTENT MODE: ${t2.contentMode.toUpperCase()}
${t2.modeGuidelines}
${n}

COMPANY STATE:
- Cash: ${t2.company.cashFormatted}
- Employees: ${t2.company.employeeCount}
- Boss's reputation: ${t2.company.bossAlignment}
- Status: ${t2.company.isStruggling ? "Struggling financially" : t2.company.isThriving ? "Very successful" : "Stable"}
${t2.company.hasFamilyMembers ? "- Has family members working together" : ""}

FEATURED EMPLOYEES (use 1-2 of these):
${t2.employees.map((e2) => `- ${e2.name} (${e2.role}${e2.traits.length > 0 ? ", " + e2.traits.join(", ") : ""})`).join("\n")}
${t2.hasFamilyAtCompany ? `
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
${"family dynamics" === t2.suggestedCategory ? "\u26A0\uFE0F CREATE AN EVENT FEATURING THIS FAMILY DYNAMIC!\nCRITICAL: Respect the parent/child roles listed above. The PARENT is the older one. The CHILD is the younger one.\nIf the child outranks the parent at work, that's an interesting dynamic to explore!\nIdeas: sibling rivalry at work, parent giving child career advice, family member covering for another, awkward family moment at the office, navigating when your kid is your boss, etc." : ""}` : ""}

AVOID REPEATING THESE RECENT EVENTS: ${t2.recentEvents.length > 0 ? t2.recentEvents.join(", ") : "None yet"}

CREATE A MINOR EVENT:
- Category hint: ${t2.suggestedCategory}
- Tone hint: ${t2.suggestedTone}
${t2.allowSpicy ? "- Can include romantic tension, attraction, flirty elements" : "- Keep it workplace appropriate, no romantic content"}
- Keep it brief and punchy
- 2-3 choices with different costs/outcomes

RESPOND IN EXACT JSON:
{
  "title": "Short catchy title with emoji (max 40 chars)",
  "description": "1-2 vivid sentences. Reference specific employees by name.",
  "category": "one of: incident, interpersonal, business, personal, tech, celebration, crisis, romantic, mystery, family",
  "tone": "one of: serious, humorous, dramatic, heartwarming, spicy, mysterious, urgent",
  "involvedEmployeeNames": ["name1"],
  "modeExclusive": ${t2.modeExclusive ? `"${t2.modeExclusive}"` : "null"},
  "choices": [
    {"id": "a", "text": "Option text", "costPercent": 0, "alignment": "neutral"},
    {"id": "b", "text": "Second option", "costPercent": 0.02, "alignment": "light"},
    {"id": "c", "text": "Third option", "costPercent": 0, "alignment": "dark"}
  ]
}

costPercent: 0 to 0.1 (0=free, 0.01=1% of cash). alignment: light/dark/neutral/ambitious/cautious.`, o = await ("function" == typeof queuedGenerateText ? queuedGenerateText(a) : Promise.resolve(null));
    if (!o) return e.generating = false, null;
    let i;
    try {
      let e2 = o;
      const t3 = o.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (t3) e2 = t3[1].trim();
      else {
        const t4 = o.match(/\{[\s\S]*\}/);
        t4 && (e2 = t4[0]);
      }
      i = JSON.parse(e2);
    } catch (t3) {
      return console.error("[StoryEngine] Failed to parse minor event AI response:", t3), e.generating = false, null;
    }
    const s = gameState.cash;
    i.choices = (i.choices || []).map((e2, t3) => ({ ...e2, cost: Math.floor(s * (e2.costPercent || 0)), consequence: e2.consequence || "The situation resolves.", gameplayEffect: this.generateMinorEffectFromChoice(e2, i) }));
    const r = (i.involvedEmployeeNames || []).map((e2) => {
      const t3 = gameState.employees.find((t4) => t4.name.toLowerCase() === e2.toLowerCase());
      return t3?.id;
    }).filter(Boolean), l = { id: `minor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, eventKey: `minor_${i.category}`, title: i.title || "\u{1F4CB} Office Matter", cinematicText: i.description, category: i.category, tone: i.tone, involvedEmployeeIds: r, choices: i.choices, actNumber: gameState.story.currentAct, type: "minor", timestamp: Date.now(), resolved: false };
    return e.queue.push(l), e.generating = false, e.nextGenerationTime = Date.now() + e.generationCooldown, this.showMinorEventNotification(l), console.log("[StoryEngine] Minor event generated:", l.title), l;
  } catch (t2) {
    return console.error("[StoryEngine] Minor event generation failed:", t2), e.generating = false, null;
  }
}, generateMinorEffectFromChoice(e, t) {
  const n = e.alignment || "neutral";
  return t.category, e.costPercent > 0 ? { type: "spend_cash", amount: Math.floor(gameState.cash * e.costPercent), boostMorale: "light" === n || "ambitious" === n } : { light: { type: "boost_all_trust", amount: 3 }, dark: { type: "decrease_all_trust", amount: 2 }, ambitious: { type: "boost_all_productivity", amount: 2 }, cautious: { type: "boost_all_trust", amount: 1 }, neutral: null }[n] || null;
}, showMinorEventNotification(e) {
  let t = document.getElementById("minorEventNotification");
  if (t && t.remove(), t = document.createElement("div"), t.id = "minorEventNotification", t.style.cssText = "\n        position: fixed;\n        bottom: 100px;\n        right: 20px;\n        max-width: 320px;\n        background: linear-gradient(135deg, var(--ad) 0%, var(--w) 100%);\n        border: 2px solid var(--j);\n        border-radius: 12px;\n        padding: 15px;\n        z-index: 10000;\n        animation: slideInRight 0.3s ease-out;\n        box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);\n        cursor: pointer;\n      ", t.innerHTML = ` <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"> <span style="font-size:1.5rem;">\u{1F4CB}</span> <div> <div style="color:var(--j); font-weight:bold; font-size:0.85rem;">MINOR EVENT</div> <div style="color:var(--b); font-size:1rem;">${e.title}</div> </div> </div> <div style="color:var(--br); font-size:0.85rem; margin-bottom:12px;">${e.cinematicText.substring(0, 80)}...</div> <div style="display:flex; gap:10px;"> <button onclick="StoryEngine.showMinorEventModal()" style=" flex:1; padding:8px 12px; background:var(--j); border:none; border-radius:6px; color:var(--s); font-size:0.85rem; cursor:pointer; ">View</button> <button onclick="document.getElementById('minorEventNotification').remove()" style=" padding:8px 12px; background:transparent; border:1px solid var(--o); border-radius:6px; color:var(--e); font-size:0.85rem; cursor:pointer; ">Later</button> </div> `, t.onclick = (e2) => {
    "BUTTON" !== e2.target.tagName && this.showMinorEventModal();
  }, document.body.appendChild(t), setTimeout(() => {
    document.getElementById("minorEventNotification") && (t.style.animation = "slideInRight 0.3s ease-out reverse", setTimeout(() => t.remove(), 300));
  }, 15e3), !document.getElementById("minorEventStyles")) {
    const e2 = document.createElement("style");
    e2.id = "minorEventStyles", e2.textContent = "\n          @keyframes slideInRight {\n            from { transform: translateX(100%); opacity: 0; }\n            to { transform: translateX(0); opacity: 1; }\n          }\n        ", document.head.appendChild(e2);
  }
}, showMinorEventModal() {
  const e = this.initializeMinorEvents().queue[0];
  if (!e) return;
  const t = document.getElementById("minorEventNotification");
  t && t.remove(), gameState.story.activeSpineEvent = e, this.showStoryEventModal(e);
}, resolveMinorEventChoice(e, t) {
  const n = this.initializeMinorEvents(), a = n.queue.findIndex((t2) => t2.id === e);
  if (-1 === a) return;
  const o = n.queue[a], i = o.choices.find((e2) => e2.id === t);
  if (!i) return;
  if (i.cost > 0 && gameState.cash < i.cost) return void ("function" == typeof showNotification && showNotification("\u274C Not enough cash!", "error"));
  i.cost > 0 && (gameState.cash -= i.cost), i.gameplayEffect && this.executeGameplayEffect(i.gameplayEffect), i.alignment && this.applyAlignmentEffect(i.alignment), this.trackAction(`minor_event_${o.category}`, { eventTitle: o.title, choiceId: i.id, alignment: i.alignment }), "family" === o.category || "family dynamics" === o.category ? (gameState.story.lastFamilyEventTime = Date.now(), gameState.story.consecutiveFamilyEvents = (gameState.story.consecutiveFamilyEvents || 0) + 1) : gameState.story.consecutiveFamilyEvents = 0, o.resolved = true, o.chosenOption = t, o.outcomeText = i.consequence, n.history.unshift(o), n.queue.splice(a, 1), n.history.length > 30 && n.history.pop(), gameState.story.activeSpineEvent = null;
  const s = document.getElementById("storyEventModal");
  s && s.remove(), this.addJournalEntry({ title: o.title, content: `${o.cinematicText}

You chose: "${i.text}"

${i.consequence}`, type: "minor", memorable: false }), "function" == typeof saveGame && saveGame(false);
}, getMinorEventCount() {
  return this.initializeMinorEvents().queue.length;
}, openMinorEventsPanel() {
  0 !== this.initializeMinorEvents().queue.length ? this.showMinorEventModal() : "function" == typeof showNotification && showNotification("No pending events right now!", "info");
}, showMultiStepEventSelector() {
  const e = this.getAvailableMultiStepEvents();
  if (0 === e.length) return void showNotification("\u{1F4DC} No extended events available yet. Build your company!", "info");
  const t = document.getElementById("multiStepSelectorModal");
  t && t.remove();
  const n = document.createElement("div");
  n.id = "multiStepSelectorModal", n.style.cssText = "\n        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n        background: var(--bn); z-index: 100001;\n        display: flex; justify-content: center; align-items: center;\n        animation: storyFadeIn 0.5s ease-out;\n        padding: 20px; box-sizing: border-box;\n      ";
  const a = e.map((e2) => {
    const t2 = this.MULTI_STEP_EVENTS[e2];
    return ` <button onclick="document.getElementById('multiStepSelectorModal').remove(); StoryEngine.startMultiStepEvent('${e2}');"
                  style="
                    width: 100%; padding: 20px; margin: 10px 0;
                    background: linear-gradient(135deg, var(--ad) 0%, var(--w) 100%);
                    border: 2px solid ${t2.themeColor || "var(--j)"};
                    border-radius: 15px; cursor: pointer; text-align: left;
                    transition: all 0.3s ease;
                  "
                  onmouseenter="this.style.transform='translateX(10px)'; this.style.borderColor='${t2.themeColor || "var(--j)"}'" onmouseleave="this.style.transform='translateX(0)'"> <div style="display: flex; align-items: center; gap: 15px;"> <div style="font-size: 2.5rem;">${t2.title.match(/^[^\s]+/)[0] || "\u{1F4D6}"}</div> <div> <div style="color: var(--b); font-size: 1.2rem; font-weight: bold; margin-bottom: 5px;"> ${t2.title.replace(/^[^\s]+\s*/, "")} </div> <div style="color: var(--a); font-size: 0.9rem; margin-bottom: 5px;">${t2.description}</div> <div style="display: flex; gap: 10px; flex-wrap: wrap;"> <span style="background: ${fuocAlpha(t2.themeColor || "var(--j)", "44")}; color: ${t2.themeColor || "var(--j)"}; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem;">
                    ${t2.totalSteps} Steps </span> <span style="background: #33333388; color: var(--a); padding: 3px 10px; border-radius: 12px; font-size: 0.75rem;"> ${t2.theme?.replace(/_/g, " ") || "Story"} </span> </div> </div> </div> </button> `;
  }).join("");
  n.innerHTML = ` <div style=" background: linear-gradient(180deg, var(--ae) 0%, var(--dc) 50%, var(--ae) 100%); border-radius: 20px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; border: 2px solid var(--j); box-shadow: 0 0 100px rgba(102,126,234,0.3); "> <div style="padding: 25px 30px; border-bottom: 1px solid var(--o);"> <div style="display: flex; justify-content: space-between; align-items: center;"> <div> <h2 style="margin: 0; color: var(--b); font-size: 1.5rem;">\u{1F3AC} Extended Events</h2> <p style="margin: 8px 0 0; color: var(--a); font-size: 0.9rem;">Multi-step scenarios that unfold across multiple scenes</p> </div> <button onclick="document.getElementById('multiStepSelectorModal').remove()" style="background: none; border: none; color: var(--e); font-size: 1.5rem; cursor: pointer;">\u2715</button> </div> </div> <div style="padding: 20px 30px 30px;"> ${a} </div> </div> `, document.body.appendChild(n);
}, checkFactionEvent() {
  if (!Ht() || !gameState.story?.factions) return null;
  const F = gameState.story.factions, total = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus).length;
  if (total < 5) return null;
  const e = {};
  for (const k of Object.keys(F)) e[k] = Math.round((F[k].strength || 0) / total * 100);
  const t = gameState.story.narrativeFlags || (gameState.story.narrativeFlags = {});
  if (Object.values(e).reduce((s, x) => s + x, 0) < 50) return null;
  const n = Object.entries(e).reduce((p, q) => p[1] > q[1] ? p : q), a = n[0], o = n[1], i = { loyalists: { threshold: 60, eventKey: "loyalist_celebration", flag: "loyalistEventTriggered", title: "\u{1F451} The Loyalists Gather", description: "Your most devoted employees want to honor your leadership..." }, opportunists: { threshold: 60, eventKey: "opportunist_scheme", flag: "opportunistEventTriggered", title: "\u{1F4B0} A Profitable Proposal", description: "The opportunists have identified a very lucrative, morally grey opportunity..." }, reformers: { threshold: 60, eventKey: "reformer_petition", flag: "reformerEventTriggered", title: "\u2696\uFE0F The Reform Movement", description: "The reformers present a petition for workplace changes..." }, underground: { threshold: 40, eventKey: "underground_contact", flag: "undergroundEventTriggered", title: "\u{1F311} Shadows in the Office", description: "The underground faction makes contact with an unusual proposal..." } }[a];
  return i && o >= i.threshold && !t[i.flag] ? (i.faction = a, i.figurehead = F[a]?.figureheadName || null, this.triggerFactionEvent(i), i) : null;
}, triggerFactionEvent(e) {
  const body = e.figurehead ? `${e.figurehead} steps forward, speaking for the group.

${e.description}` : e.description;
  gameState.story.narrativeFlags[e.flag] = true, this.addJournalEntry({ title: e.title, content: body, type: "faction", memorable: true });
  const t = { id: `faction_${e.eventKey}_${Date.now()}`, title: e.title, cinematicText: body, choices: this.generateFactionChoices(e.eventKey), imagePrompt: `corporate office scene, ${e.eventKey.replace(/_/g, " ")}, dramatic lighting, professional atmosphere`, allowAI: true };
  gameState.story.pendingEvents.push(t), this.showStoryNotification();
}, generateFactionChoices: (e) => ({ loyalist_celebration: [{ id: "embrace", text: "\u{1F451} Embrace their loyalty fully", alignment: "charismatic", consequence: "Your inner circle grows stronger, but others feel excluded.", gameplayEffect: { type: "faction_standing", faction: "loyalists", trust: 8, affection: 6 } }, { id: "modest", text: "\u{1F91D} Accept graciously but stay grounded", alignment: "diplomatic", consequence: "You maintain balance while acknowledging their devotion.", gameplayEffect: { type: "boost_all_affection", amount: 3 } }, { id: "redirect", text: "\u{1F4C8} Redirect their energy toward work goals", alignment: "pragmatic", consequence: "Their loyalty becomes productive ambition.", gameplayEffect: { type: "boost_all_productivity", amount: 4 } }], opportunist_scheme: [{ id: "join", text: "\u{1F4B0} Join the scheme - money talks", alignment: "ruthless", consequence: "Profit comes, but at what cost to your integrity?", gameplayEffect: { type: "boost_all_productivity", amount: 5 } }, { id: "modify", text: "\u2696\uFE0F Modify it to be more ethical", alignment: "diplomatic", consequence: "You find middle ground, satisfying some but not all.", gameplayEffect: { type: "boost_all_comfort", amount: 3 } }, { id: "reject", text: "\u{1F6AB} Reject it firmly", alignment: "ethical", consequence: "The opportunists lose faith in you, but your conscience is clear.", gameplayEffect: { type: "faction_standing", faction: "opportunists", trust: -6 } }], reformer_petition: [{ id: "implement", text: "\u2705 Implement their suggestions", alignment: "ethical", consequence: "Workplace improves, but some see you as weak to pressure.", gameplayEffect: { type: "boost_all_comfort", amount: 6 } }, { id: "compromise", text: "\u{1F91D} Negotiate a compromise", alignment: "diplomatic", consequence: "Some changes happen, keeping both sides partially satisfied.", gameplayEffect: { type: "boost_all_comfort", amount: 3 } }, { id: "dismiss", text: "\u274C Dismiss their concerns", alignment: "ruthless", consequence: "You maintain control, but resentment builds.", gameplayEffect: { type: "faction_standing", faction: "reformers", trust: -6, affection: -4 } }], underground_contact: [{ id: "engage", text: "\u{1F311} Hear them out in secret", alignment: "cunning", consequence: "You learn of hidden opportunities... and dangers.", gameplayEffect: { type: "faction_standing", faction: "underground", trust: 6 } }, { id: "expose", text: "\u2600\uFE0F Expose their activities", alignment: "ethical", consequence: "Trust is restored, but you've made enemies.", gameplayEffect: { type: "boost_all_trust", amount: 4 } }, { id: "ignore", text: "\u{1F648} Pretend you saw nothing", alignment: "passive", consequence: "The underground grows stronger in the shadows." }] })[e] || [{ id: "default", text: "\u{1F914} Consider carefully...", alignment: "neutral", consequence: "You take time to think." }], generateCharacterArc(e) {
  if (!e || e.characterArc) return null;
  const t = [{ type: "hidden_talent", secrets: ["Was once a professional musician", "Has a published novel under a pen name", "Holds patents from a previous career"], discovery: "high_trust", storyPotential: "Their hidden skills could save the company in a crisis." }, { type: "dark_past", secrets: ["Fled a scandal at their old company", "Changed their name years ago", "Has powerful enemies"], discovery: "investigation", storyPotential: "Their past may catch up with them\u2014and you." }, { type: "secret_connection", secrets: ["Related to a major competitor's CEO", "Former roommate of a famous tech figure", "Has ties to Victoria Steele's family"], discovery: "random_event", storyPotential: "Their connections could open doors\u2014or bring danger." }, { type: "hidden_agenda", secrets: ["Planted by a rival company", "Working toward their own startup", "Secretly documenting workplace issues"], discovery: "low_trust", storyPotential: "Their true motives will eventually be revealed." }, { type: "personal_struggle", secrets: ["Caring for a sick family member", "Dealing with a major financial burden", "Fighting a personal battle"], discovery: "high_affection", storyPotential: "Supporting them could earn lifelong loyalty." }], n = t[Math.floor(Math.random() * t.length)], a = n.secrets[Math.floor(Math.random() * n.secrets.length)];
  return e.characterArc = { type: n.type, secret: a, discoveryMethod: n.discovery, storyPotential: n.storyPotential, discovered: false, discoveredAt: null, arcProgress: 0 }, e.characterArc;
}, checkCharacterArcDiscovery(e) {
  if (!e.characterArc || e.characterArc.discovered) return false;
  const t = e.characterArc, n = e.stats?.trust || 50, a = e.stats?.affection || 50;
  let o = false;
  switch (t.discoveryMethod) {
    case "high_trust":
      o = n >= 85;
      break;
    case "high_affection":
      o = a >= 85;
      break;
    case "low_trust":
      o = n <= 20;
      break;
    case "investigation":
      o = Math.random() < 0.1 && gameState.story.currentAct >= 3;
      break;
    case "random_event":
      o = Math.random() < 0.05;
  }
  return !!o && (t.discovered = true, t.discoveredAt = Date.now(), this.addJournalEntry({ title: `\u{1F50D} Secret Revealed: ${e.name}`, content: `You've discovered something about ${e.name}: ${t.secret}. ${t.storyPotential}`, type: "character_arc", memorable: true, employeeId: e.id }), this.queueCharacterArcEvent(e), true);
}, queueCharacterArcEvent(e) {
  const t = { id: `character_arc_${e.id}_${Date.now()}`, title: `\u{1F4D6} ${e.name}'s Story`, cinematicText: `The truth about ${e.name} has come to light: ${e.characterArc.secret}

${e.characterArc.storyPotential}

This knowledge gives you power over their fate. What will you do with it?`, choices: [{ id: "support", text: "\u{1F91D} Support them through this", alignment: "kind", consequence: "Your support earns deep loyalty." }, { id: "leverage", text: "\u{1F4BC} Use this knowledge strategically", alignment: "cunning", consequence: "You gain an advantage, but trust may suffer." }, { id: "ignore", text: "\u{1F910} Keep it to yourself, change nothing", alignment: "neutral", consequence: "Life continues as before, for now." }], imagePrompt: "portrait of a professional employee with a mysterious expression, dramatic lighting, corporate setting, emotional moment", allowAI: true };
  gameState.story.pendingEvents.push(t), this.showStoryNotification();
}, getTimelineEchoes() {
  const e = gameState.story.persistentMemories || [];
  if (0 === e.length) return [];
  const t = [], n = gameState.story.currentAct, a = gameState.story.moralScore;
  return e.forEach((e2, o) => {
    const i = e2.timeline || o + 1;
    if (e2.moralScore && Math.abs(e2.moralScore - a) > 40) {
      const n2 = e2.moralScore > 50 ? "virtuous" : "ruthless";
      n2 !== (a > 50 ? "virtuous" : "ruthless") && t.push({ type: "path_contrast", timeline: i, message: `In Timeline ${i}, you walked a ${n2} path. Now, you've chosen differently. The echoes of who you were remind you of who you could have been...`, effect: { insight: true } });
    }
    if (e2.keyEvents && e2.keyEvents.length > 0) {
      const a2 = e2.keyEvents.find((e3) => "spine" === e3.type && e3.title && n >= 2);
      a2 && Math.random() < 0.3 && t.push({ type: "memory_flash", timeline: i, message: `A strange d\xE9j\xE0 vu washes over you. In another time, another version of you faced "${a2.title}". The outcome was different then...`, effect: { moralBonus: 5 } });
    }
    e2.ending && n >= 4 && t.push({ type: "ending_whisper", timeline: i, message: `Whispers of Timeline ${i} echo in your mind. There, you became known as "${e2.ending}". Will this timeline end the same way?`, effect: { foreshadowing: true } });
  }), t.slice(0, 3);
}, applyTimelineEchoEffects(e) {
  e && e.effect && (e.effect.moralBonus && (gameState.story.moralScore += e.effect.moralBonus), e.effect.insight && (gameState.story.narrativeFlags.timelineInsight = true), e.effect.foreshadowing && (gameState.story.narrativeFlags.endingForeshadowed = true));
} };
window.startMultiStepEvent = function(e, t = false) {
  if (!StoryEngine || !StoryEngine.MULTI_STEP_EVENTS) return void console.error("StoryEngine not loaded");
  if (gameState.story.activeMultiStepEvent && !t) return void console.warn("A multi-step event is already active. Use force=true to override.");
  t && (gameState.story.activeMultiStepEvent = null);
  const n = Object.keys(StoryEngine.MULTI_STEP_EVENTS);
  if (!e) return console.log("Available multi-step events:"), void n.forEach((e2) => {
    const t2 = StoryEngine.MULTI_STEP_EVENTS[e2], n2 = StoryEngine.canStartMultiStepEvent(e2);
    console.log(`  ${n2 ? "\u2705" : "\u274C"} ${e2}: "${t2.title}" (${t2.totalSteps} steps)`);
  });
  n.includes(e) ? (StoryEngine.startMultiStepEvent(e), console.log(`Started multi-step event: ${e}`)) : console.error(`Unknown event: ${e}. Use startMultiStepEvent() with no args to see available events.`);
}, window.showMultiStepEvents = function() {
  StoryEngine.showMultiStepEventSelector();
}, window.getMultiStepStatus = function() {
  const e = gameState.story.activeMultiStepEvent, t = gameState.story.completedMultiStepEvents || [], n = StoryEngine.getAvailableMultiStepEvents();
  return console.log("=== Multi-Step Event Status ==="), e ? (console.log(`\u{1F3AC} ACTIVE: ${e.title}`), console.log(`   Step: ${e.currentStep}/${e.totalSteps}`), console.log(`   Score: ${e.cumulativeScore}`)) : console.log("\u{1F3AC} No active multi-step event"), console.log(`
\u2705 Completed (${t.length}):`), t.forEach((e2) => {
    console.log(`   ${e2.title} - Score: ${e2.finalScore} (${e2.finalOutcome})`);
  }), console.log(`
\u{1F4CB} Available (${n.length}):`), n.forEach((e2) => {
    const t2 = StoryEngine.MULTI_STEP_EVENTS[e2];
    console.log(`   ${t2.title} (${t2.totalSteps} steps)`);
  }), { active: e, completed: t, available: n };
};
const StoryMinigames = { activeGame: null, gameResult: null, GAME_TYPES: { precision: { name: "Precision Timing", icon: "\u{1F3AF}", description: "Stop the marker in the green zone!", themes: ["negotiation", "delicate_moment", "risky_move", "seduction"], mobileHint: "Tap when the marker is in the green zone" }, intensity: { name: "Intensity", icon: "\u26A1", description: "Tap rapidly to build intensity!", themes: ["persuasion", "passion", "effort", "urgency", "desire"], mobileHint: "Tap as fast as you can!" }, recall: { name: "Read the Room", icon: "\u{1F9E0}", description: "Remember and repeat the pattern!", themes: ["social_reading", "memory", "observation", "understanding"], mobileHint: "Watch the pattern, then tap to repeat" }, reflex: { name: "Quick Reflexes", icon: "\u{1F446}", description: "Catch the targets before they disappear!", themes: ["opportunity", "timing", "catching_signals", "reading_cues"], mobileHint: "Tap targets as they appear" }, composure: { name: "Keep Composure", icon: "\u2696\uFE0F", description: "Keep your composure balanced!", themes: ["self_control", "hiding_feelings", "poker_face", "professionalism"], mobileHint: "Tap left/right to stay balanced" }, tension: { name: "Hold the Tension", icon: "\u{1F4AB}", description: "Hold... hold... and release at the right moment!", themes: ["anticipation", "buildup", "dramatic_pause", "power_play"], mobileHint: "Hold down, release in the sweet spot" } }, launchMinigame(e, t, n) {
  const a = this.GAME_TYPES[e];
  if (!a) return console.error("[StoryMinigames] Unknown game type:", e), void n({ success: true, score: 100 });
  this.activeGame = { type: e, config: { ...t, ...a }, onComplete: n, startTime: Date.now(), score: 0 }, this.createGameOverlay(e, t);
}, createGameOverlay(e, t) {
  const n = document.getElementById("minigameOverlay");
  n && n.remove();
  const a = document.createElement("div");
  a.id = "minigameOverlay", a.style.cssText = "\n        position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n        background: var(--fu); z-index: 100002;\n        display: flex; flex-direction: column; justify-content: center; align-items: center;\n        padding: 20px; box-sizing: border-box;\n        animation: storyFadeIn 0.4s ease-out;\n        touch-action: manipulation;\n        user-select: none;\n        -webkit-user-select: none;\n      ";
  const o = this.GAME_TYPES[e], i = t.themeText || o.description;
  a.innerHTML = ` <div id="minigameContainer" style=" width: 100%; max-width: 500px; text-align: center; "> <!-- Header --> <div style="margin-bottom: 20px;"> <div style="font-size: 3rem; margin-bottom: 10px;">${o.icon}</div> <h2 style="color: var(--b); margin: 0 0 8px 0; font-size: 1.5rem;">${t.title || o.name}</h2> <p style="color: var(--br); margin: 0; font-size: 0.95rem;">${i}</p> </div> <!-- Game Area --> <div id="minigameArea" style=" background: linear-gradient(135deg, var(--t) 0%, var(--w) 100%); border: 2px solid var(--j); border-radius: 16px; padding: 30px 20px; margin-bottom: 20px; min-height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center; "> <!-- Game content injected here --> </div> <!-- Mobile hint --> <p style="color: var(--j); font-size: 0.85rem; margin: 0;"> \u{1F4F1} ${o.mobileHint} </p> <!-- Skip option (always available) --> <button id="skipMinigame" style=" margin-top: 20px; padding: 10px 20px; background: transparent; border: 1px solid var(--o); border-radius: 8px; color: var(--e); cursor: pointer; font-size: 0.85rem; transition: all 0.2s; ">Skip (auto-resolve)</button> </div> `, document.body.appendChild(a), document.getElementById("skipMinigame").onclick = () => this.skipGame(), setTimeout(() => this.startGame(e, t), 300);
}, startGame(e, t) {
  const n = document.getElementById("minigameArea");
  if (n) switch (e) {
    case "precision":
      this.startPrecisionGame(n, t);
      break;
    case "intensity":
      this.startIntensityGame(n, t);
      break;
    case "recall":
      this.startRecallGame(n, t);
      break;
    case "reflex":
      this.startReflexGame(n, t);
      break;
    case "composure":
      this.startComposureGame(n, t);
      break;
    case "tension":
      this.startTensionGame(n, t);
  }
}, startPrecisionGame(e, t) {
  const n = { easy: { totalRounds: 3, allowedMisses: 2, speeds: [2800, 2500, 2200], zones: [40, 35, 30] }, medium: { totalRounds: 4, allowedMisses: 2, speeds: [2200, 1900, 1600, 1400], zones: [30, 25, 22, 18] }, hard: { totalRounds: 5, allowedMisses: 1, speeds: [1800, 1500, 1300, 1100, 900], zones: [25, 20, 16, 14, 12] } }[t.difficulty || "medium"];
  let a = 1, o = 0, i = 0, s = 0, r = 1, l = true, c = true, d = true;
  const p = () => n.zones[Math.min(a - 1, n.zones.length - 1)], m = () => {
    const t2 = p(), s2 = 50 - t2 / 2, r2 = Array(n.totalRounds).fill("\u25CB").map((e2, t3) => t3 < o ? '<span style="color:var(--g);">\u25CF</span>' : t3 < o + i ? '<span style="color:var(--al);">\u2715</span>' : '<span style="color:var(--q);">\u25CB</span>').join(" ");
    if (e.innerHTML = `
          ${d ? ` <div id="precisionInstructions" style=" position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bc); border: 2px solid var(--j); border-radius: 16px; padding: 25px; max-width: 320px; text-align: center; z-index: 10; "> <div style="font-size: 2.5rem; margin-bottom: 10px;">\u{1F3AF}</div> <div style="color: var(--b); font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">Precision Timing</div> <div style="color: var(--br); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;"> A marker moves back and forth across the bar.<br><br> <span style="color: var(--g);">Tap when it's in the GREEN zone!</span><br><br> The zone gets smaller each round. </div> <button id="startPrecisionBtn" style=" padding: 12px 30px; background: linear-gradient(135deg, var(--j), var(--ak)); border: none; border-radius: 8px; color: var(--s); font-size: 1rem; font-weight: bold; cursor: pointer; ">Got it!</button> </div> ` : ""} <div style="margin-bottom: 10px; ${d ? "opacity: 0.3;" : ""}"> <div style="font-size: 0.9rem; color: var(--br);"> Round <span style="color:var(--b); font-weight:bold;">${a}</span> of ${n.totalRounds} <span style="margin-left: 15px;">Misses left: <span style="color:${n.allowedMisses - i > 0 ? "var(--n)" : "var(--al)"}; font-weight:bold;">${n.allowedMisses - i}</span></span> </div> </div> <!-- Progress indicator --> <div style="margin-bottom: 15px; font-size: 1.3rem; letter-spacing: 4px; ${d ? "opacity: 0.3;" : ""}">
            ${r2} </div> <div style="width: 100%; margin-bottom: 25px; ${d ? "opacity: 0.3;" : ""}"> <!-- The bar track --> <div style=" position: relative; height: 60px; background: linear-gradient(90deg, #f7258544 0%, #f7258544 ${s2}%, 
                var(--n) ${s2}%, var(--n) ${s2 + t2}%, 
                #f7258544 ${s2 + t2}%, #f7258544 100%); border-radius: 30px; overflow: hidden; border: 3px solid var(--o); "> <!-- Zone size label --> <div style=" position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--et); font-size: 0.8rem; font-weight: bold; ">${t2}%</div> <!-- Moving marker --> <div id="precisionMarker" style=" position: absolute; left: 0%; top: 8px; width: 10px; height: 44px; background: linear-gradient(180deg, var(--b) 0%, var(--z) 100%); border-radius: 5px; box-shadow: 0 0 20px rgba(255,215,0,0.9); transition: none; "></div> </div> <!-- Zone indicators --> <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.75rem; color: var(--e);"> <span>\u274C Too early</span> <span style="color: var(--g);">\u2713 Perfect zone</span> <span>Too late \u274C</span> </div> </div> <!-- Big tap button --> <button id="precisionTapBtn" style=" width: 140px; height: 140px; border-radius: 50%; background: ${c ? "linear-gradient(145deg, var(--j) 0%, var(--ak) 100%)" : "var(--ag)"};
            border: 4px solid var(--b);
            color: var(--b);
            font-size: 1.3rem;
            font-weight: bold;
            cursor: ${c ? "pointer" : "default"};
            box-shadow: 0 0 30px rgba(102,126,234,0.5);
            transition: transform 0.1s, box-shadow 0.1s;
            touch-action: manipulation;
            ${d ? "opacity: 0.3;" : ""}
          ">
            ${c ? "TAP!" : "WAIT..."} </button> `, d && (document.getElementById("startPrecisionBtn").onclick = () => {
      d = false, m(), u2();
    }), !d && c) {
      const e2 = document.getElementById("precisionTapBtn");
      e2.onclick = g, e2.ontouchstart = (e3) => {
        e3.preventDefault(), g();
      };
    }
  }, u2 = () => {
    s = 0, r = 1, l = true;
    const e2 = () => {
      if (!l) return;
      const t2 = n.speeds[Math.min(a - 1, n.speeds.length - 1)];
      s += r * (100 / (t2 / 16.67)), s >= 100 ? (s = 100, r = -1) : s <= 0 && (s = 0, r = 1);
      const o2 = document.getElementById("precisionMarker");
      o2 && (o2.style.left = `calc(${s}% - 5px)`), requestAnimationFrame(e2);
    };
    e2();
  }, g = () => {
    if (!c || d) return;
    l = false, c = false;
    const e2 = document.getElementById("precisionTapBtn");
    e2 && (e2.style.transform = "scale(0.9)");
    const t2 = p(), r2 = 50 - t2 / 2;
    s >= r2 && s <= r2 + t2 ? (o++, e2 && (e2.textContent = "\u2713", e2.style.background = "linear-gradient(145deg, var(--n) 0%, var(--cp) 100%)")) : (i++, e2 && (e2.textContent = "\u2717", e2.style.background = "linear-gradient(145deg, var(--al) 0%, var(--dr) 100%)")), setTimeout(() => {
      if (i > n.allowedMisses) {
        const e3 = Math.round(o / n.totalRounds * 50);
        this.showGameResult("failure", e3);
      } else if (a >= n.totalRounds) {
        const e3 = o / n.totalRounds;
        let t3, a2;
        1 === e3 ? (t3 = "perfect", a2 = 100) : e3 >= 0.75 ? (t3 = "success", a2 = Math.round(70 + 25 * e3)) : e3 >= 0.5 ? (t3 = "partial", a2 = Math.round(40 + 30 * e3)) : (t3 = "failure", a2 = Math.round(40 * e3)), this.showGameResult(t3, a2);
      } else a++, c = true, m(), setTimeout(u2, 500);
    }, 600);
  };
  m(), this.activeGame.cleanup = () => {
    l = false;
  };
}, startIntensityGame(e, t) {
  const n = t.difficulty || "medium", a = { easy: 15, medium: 25, hard: 40 }[n], o = { easy: 6e3, medium: 5e3, hard: 4e3 }[n];
  let i = 0, s = false, r = true, l = null, c = 0, d = null;
  const p = () => {
    if (e.innerHTML = `
          ${r ? ` <div id="intensityInstructions" style=" position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bc); border: 2px solid var(--al); border-radius: 16px; padding: 25px; max-width: 320px; text-align: center; z-index: 10; "> <div style="font-size: 2.5rem; margin-bottom: 10px;">\u26A1</div> <div style="color: var(--b); font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">Intensity Rush</div> <div style="color: var(--br); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;"> Tap the button as <span style="color: var(--al); font-weight: bold;">FAST</span> as you can!<br><br> Fill the meter to <span style="color: var(--g);">${a} taps</span><br> before time runs out.<br><br> <span style="color: var(--m);">\u23F1\uFE0F ${(o / 1e3).toFixed(0)} seconds</span> </div> <button id="startIntensityBtn" style=" padding: 12px 30px; background: linear-gradient(135deg, var(--al), var(--dr)); border: none; border-radius: 8px; color: var(--s); font-size: 1rem; font-weight: bold; cursor: pointer; ">Let's Go!</button> </div> ` : ""} <div style="width: 100%; margin-bottom: 20px; ${r ? "opacity: 0.3;" : ""}"> <!-- Progress bar --> <div style=" position: relative; height: 40px; background: var(--ad); border-radius: 20px; overflow: hidden; border: 3px solid var(--o); "> <div id="intensityBar" style=" height: 100%; width: 0%; background: linear-gradient(90deg, var(--al) 0%, var(--z) 50%, var(--n) 100%); transition: width 0.05s; border-radius: 17px; "></div> <div style=" position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--b); font-weight: bold; font-size: 1.1rem; text-shadow: 0 2px 4px var(--ax); "> <span id="tapCountDisplay">${i}</span> / ${a} </div> </div> <!-- Timer --> <div style="margin-top: 15px; text-align: center;"> <span style="color: var(--al); font-size: 2rem; font-weight: bold;" id="intensityTimer">${(o / 1e3).toFixed(1)}</span> <span style="color: var(--e); font-size: 1rem;">s remaining</span> </div> </div> <!-- Feedback text --> <div id="intensityFeedback" style=" height: 30px; margin-bottom: 10px; font-size: 1.2rem; font-weight: bold; ${r ? "opacity: 0.3;" : ""} "></div> <!-- Big tap button --> <button id="intensityTapBtn" style=" width: 180px; height: 180px; border-radius: 50%; background: ${s ? "linear-gradient(145deg, var(--al) 0%, var(--dr) 100%)" : "var(--av)"};
            border: 5px solid var(--b);
            color: var(--b);
            font-size: 2rem;
            font-weight: bold;
            cursor: ${s ? "pointer" : "default"};
            box-shadow: ${s ? "0 0 40px rgba(247,37,133,0.6)" : "none"};
            transition: transform 0.05s;
            touch-action: manipulation;
            ${r ? "opacity: 0.3;" : ""}
          ">
            ${s ? "\u26A1 TAP!" : "READY"} </button> `, r && (document.getElementById("startIntensityBtn").onclick = () => {
      r = false, s = true, d = Date.now(), p(), m();
    }), s) {
      const e2 = document.getElementById("intensityTapBtn");
      e2.onclick = u2, e2.ontouchstart = (e3) => {
        e3.preventDefault(), u2();
      };
    }
  }, m = () => {
    l = setInterval(() => {
      if (!s) return;
      const e2 = Date.now() - d, t2 = Math.max(0, o - e2) / 1e3, n2 = document.getElementById("intensityTimer");
      n2 && (n2.textContent = t2.toFixed(1));
      const r2 = e2 / o * a, c2 = document.getElementById("intensityFeedback");
      c2 && (i >= 1.2 * r2 ? (c2.textContent = "\u{1F525} On Fire!", c2.style.color = "var(--n)") : i >= 0.8 * r2 ? (c2.textContent = "\u{1F44D} Good pace!", c2.style.color = "var(--z)") : (c2.textContent = "\u26A0\uFE0F Speed up!", c2.style.color = "var(--al)")), t2 <= 0 && (clearInterval(l), this.endIntensityGame(i, a));
    }, 50);
  }, u2 = () => {
    if (!s) return;
    const e2 = Date.now();
    if (e2 - c < 50) return;
    c = e2, i++;
    const t2 = document.getElementById("tapCountDisplay"), n2 = document.getElementById("intensityBar");
    t2 && (t2.textContent = i), n2 && (n2.style.width = Math.min(100, i / a * 100) + "%");
    const o2 = document.getElementById("intensityTapBtn");
    o2 && (o2.style.transform = "scale(0.93)", o2.style.boxShadow = "0 0 60px rgba(247,37,133,0.9)", setTimeout(() => {
      o2 && (o2.style.transform = "scale(1)", o2.style.boxShadow = "0 0 40px rgba(247,37,133,0.6)");
    }, 50)), i >= a && (s = false, clearInterval(l), this.endIntensityGame(i, a));
  };
  p(), this.activeGame.cleanup = () => {
    s = false, l && clearInterval(l);
  };
}, endIntensityGame(e, t) {
  const n = e / t * 100;
  let a, o;
  n >= 100 ? (a = "perfect", o = 100) : n >= 80 ? (a = "success", o = Math.round(n - 80 + 70)) : n >= 50 ? (a = "partial", o = Math.round(n - 50 + 30)) : (a = "failure", o = Math.round(n / 2)), this.showGameResult(a, o);
}, startRecallGame(e, t) {
  const n = { easy: 3, medium: 4, hard: 6 }[t.difficulty || "medium"], a = [], o = [];
  let i = true, s = true;
  for (let e2 = 0; e2 < n; e2++) a.push(Math.floor(4 * Math.random()));
  const r = ["var(--al)", "var(--n)", "var(--z)", "var(--j)"], l = ["\u2665", "\u2660", "\u2666", "\u2663"], c = () => {
    e.innerHTML = `
          ${s ? ` <div id="recallInstructions" style=" position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bc); border: 2px solid var(--g); border-radius: 16px; padding: 25px; max-width: 320px; text-align: center; z-index: 10; "> <div style="font-size: 2.5rem; margin-bottom: 10px;">\u{1F9E0}</div> <div style="color: var(--b); font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">Read the Room</div> <div style="color: var(--br); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;"> Watch the buttons light up in sequence.<br><br> Then <span style="color: var(--g); font-weight: bold;">repeat the pattern</span> by tapping them in the same order!<br><br> <span style="color: var(--m);">Pattern length: ${n}</span> </div> <button id="startRecallBtn" style=" padding: 12px 30px; background: linear-gradient(135deg, var(--n), var(--dq)); border: none; border-radius: 8px; color: var(--q); font-size: 1rem; font-weight: bold; cursor: pointer; ">Show Pattern!</button> </div> ` : ""} <div style="margin-bottom: 20px; ${s ? "opacity: 0.3;" : ""}"> <div id="recallStatus" style="color: var(--m); font-size: 1.2rem; font-weight: bold; min-height: 30px;"> ${s ? "Ready..." : "Watch the pattern..."} </div> </div> <!-- Pattern buttons in 2x2 grid --> <div style=" display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; max-width: 280px; ${s ? "opacity: 0.3;" : ""}
          ">
            ${[0, 1, 2, 3].map((e2) => ` <button id="recallBtn${e2}" class="recall-btn" data-index="${e2}" style="
                width: 100%; aspect-ratio: 1;
                border-radius: 16px;
                background: ${fuocAlpha(r[e2], "33")};
                border: 3px solid ${r[e2]};
                color: ${r[e2]};
                font-size: 2.5rem;
                cursor: pointer;
                transition: all 0.15s;
                opacity: 0.6;
                touch-action: manipulation;
              ">${l[e2]}</button> `).join("")} </div> <!-- Progress dots --> <div id="recallProgress" style="margin-top: 20px; display: flex; gap: 8px; justify-content: center; ${s ? "opacity: 0.3;" : ""}">
            ${a.map(() => '<div style="width: 12px; height: 12px; border-radius: 50%; background: var(--ag); border: 1px solid var(--r);"></div>').join("")} </div> <!-- Legend --> <div style="margin-top: 15px; font-size: 0.8rem; color: var(--e); ${s ? "opacity: 0.3;" : ""}"> <span style="color: var(--g);">\u25CF</span> Correct <span style="margin-left: 15px; color: var(--al);">\u25CF</span> Wrong </div> `, s && (document.getElementById("startRecallBtn").onclick = () => {
      s = false, c(), u2(), h();
    });
  }, d = () => e.querySelectorAll(".recall-btn"), p = () => document.getElementById("recallStatus"), m = (e2, t2 = 400) => {
    const n2 = document.getElementById(`recallBtn${e2}`);
    n2 && (n2.style.opacity = "1", n2.style.transform = "scale(1.1)", n2.style.boxShadow = `0 0 30px ${r[e2]}`, setTimeout(() => {
      n2.style.opacity = "0.6", n2.style.transform = "scale(1)", n2.style.boxShadow = "none";
    }, t2));
  }, u2 = () => {
    d().forEach((e2) => {
      e2.style.pointerEvents = "none";
      const t2 = parseInt(e2.dataset.index);
      e2.onclick = () => g(t2), e2.ontouchstart = (e3) => {
        e3.preventDefault(), g(t2);
      };
    });
  }, g = (e2) => {
    if (i) return;
    m(e2, 200), o.push(e2);
    const t2 = o.length - 1, n2 = document.getElementById("recallProgress")?.children || [], s2 = p();
    if (o[t2] === a[t2]) n2[t2] && (n2[t2].style.background = "var(--n)"), o.length === a.length && (s2 && (s2.textContent = "Perfect! \u{1F389}", s2.style.color = "var(--n)"), d().forEach((e3) => e3.style.pointerEvents = "none"), setTimeout(() => this.showGameResult("perfect", 100), 500));
    else {
      n2[t2] && (n2[t2].style.background = "var(--al)"), s2 && (s2.textContent = "Wrong! \u{1F614}", s2.style.color = "var(--al)"), d().forEach((e4) => e4.style.pointerEvents = "none");
      const e3 = Math.round(t2 / a.length * 60), o2 = e3 >= 30 ? "partial" : "failure";
      setTimeout(() => this.showGameResult(o2, e3), 500);
    }
  }, h = async () => {
    await new Promise((e3) => setTimeout(e3, 500));
    for (let e3 = 0; e3 < a.length; e3++) m(a[e3], 500), await new Promise((e4) => setTimeout(e4, 700));
    i = false;
    const e2 = p();
    e2 && (e2.textContent = "Your turn! Repeat the pattern", e2.style.color = "var(--n)"), d().forEach((e3) => e3.style.pointerEvents = "auto");
  };
  c();
}, startReflexGame(e, t) {
  const n = t.difficulty || "medium", a = { easy: 8, medium: 12, hard: 18 }[n], o = { easy: 1400, medium: 1e3, hard: 700 }[n];
  let i = 0, s = 0, r = 0, l = false, c = true;
  const d = () => {
    e.innerHTML = `
          ${c ? ` <div id="reflexInstructions" style=" position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bc); border: 2px solid var(--m); border-radius: 16px; padding: 25px; max-width: 320px; text-align: center; z-index: 10; "> <div style="font-size: 2.5rem; margin-bottom: 10px;">\u2B50</div> <div style="color: var(--b); font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">Quick Reflexes</div> <div style="color: var(--br); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;"> Stars will appear in the play area.<br><br> <span style="color: var(--m); font-weight: bold;">Tap them before they disappear!</span><br><br> <span style="color: var(--g);">Targets: ${a}</span> <span style="margin-left: 10px; color: var(--al);">Speed: ${n}</span> </div> <button id="startReflexBtn" style=" padding: 12px 30px; background: linear-gradient(135deg, var(--z), #f7a800); border: none; border-radius: 8px; color: var(--q); font-size: 1rem; font-weight: bold; cursor: pointer; ">Ready!</button> </div> ` : ""} <div style="width: 100%; margin-bottom: 15px; display: flex; justify-content: space-between; ${c ? "opacity: 0.3;" : ""}"> <div style="color: var(--g);">\u2713 Caught: <span id="reflexCaught">${i}</span></div> <div style="color: var(--al);">\u2717 Missed: <span id="reflexMissed">${s}</span></div> </div> <!-- Game field --> <div id="reflexField" style=" position: relative; width: 100%; height: 260px; background: radial-gradient(circle at center, var(--w) 0%, var(--ae) 100%); border-radius: 16px; border: 2px solid ${l ? "var(--z)" : "var(--ag)"};
            overflow: hidden;
            touch-action: manipulation;
            ${c ? "opacity: 0.3;" : ""}
          ">
            ${l || c ? "" : ' <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--m); font-size: 1.5rem; font-weight: bold;">Get Ready...</div> '} </div> <!-- Progress --> <div style="margin-top: 15px; color: var(--e); ${c ? "opacity: 0.3;" : ""}"> Progress: <span id="reflexProgress">${r}</span> / ${a} targets </div> `, c && (document.getElementById("startReflexBtn").onclick = () => {
      c = false, d(), setTimeout(() => {
        l = true, d(), setTimeout(p, 300);
      }, 800);
    });
  }, p = () => {
    if (!l || r >= a) return void (r >= a && l && (l = false, setTimeout(() => this.endReflexGame(i, s, a), 500)));
    const e2 = document.getElementById("reflexField"), t2 = document.getElementById("reflexCaught"), n2 = (document.getElementById("reflexMissed"), document.getElementById("reflexProgress"));
    if (!e2) return;
    r++, n2 && (n2.textContent = r);
    const c2 = document.createElement("div"), d2 = 55 + 20 * Math.random(), m = Math.random() * (e2.offsetWidth - d2), u2 = Math.random() * (e2.offsetHeight - d2);
    c2.className = "reflex-target", c2.style.cssText = `
          position: absolute;
          left: ${m}px;
          top: ${u2}px;
          width: ${d2}px;
          height: ${d2}px;
          background: radial-gradient(circle, var(--z) 0%, var(--al) 100%);
          border-radius: 50%;
          cursor: pointer;
          animation: reflexPop 0.2s ease-out;
          box-shadow: 0 0 25px rgba(255,215,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        `, c2.innerHTML = "\u2B50";
    const g = (e3) => {
      e3.preventDefault(), e3.stopPropagation(), c2.parentNode && (i++, t2 && (t2.textContent = i), c2.style.transform = "scale(1.3)", c2.style.opacity = "0", setTimeout(() => c2.remove(), 150));
    };
    c2.onclick = g, c2.ontouchstart = g, e2.appendChild(c2), setTimeout(() => {
      if (c2.parentNode) {
        s++;
        const e3 = document.getElementById("reflexMissed");
        e3 && (e3.textContent = s), c2.style.opacity = "0", setTimeout(() => c2.remove(), 150);
      }
    }, o);
    const h = 350 + 450 * Math.random();
    setTimeout(p, h);
  };
  d(), this.activeGame.cleanup = () => {
    l = false;
  };
}, endReflexGame(e, t, n) {
  const a = e / n;
  let o, i;
  a >= 0.9 ? (o = "perfect", i = 100) : a >= 0.7 ? (o = "success", i = Math.round(70 + 100 * (a - 0.7))) : a >= 0.4 ? (o = "partial", i = Math.round(30 + 100 * (a - 0.4))) : (o = "failure", i = Math.round(75 * a)), this.showGameResult(o, i);
}, startComposureGame(e, t) {
  const n = t.difficulty || "medium", a = { easy: 5e3, medium: 7e3, hard: 1e4 }[n], o = { easy: 0.35, medium: 0.55, hard: 0.85 }[n];
  let i = 50, s = 0, r = false, l = true, c = 0, d = null, p = false, m = false;
  const u2 = () => {
    e.innerHTML = `
          ${l ? ` <div id="composureInstructions" style=" position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bc); border: 2px solid var(--j); border-radius: 16px; padding: 25px; max-width: 340px; text-align: center; z-index: 10; "> <div style="font-size: 2.5rem; margin-bottom: 10px;">\u2696\uFE0F</div> <div style="color: var(--b); font-size: 1.2rem; font-weight: bold; margin-bottom: 15px;">Keep Composure</div> <div style="color: var(--br); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;"> The marker drifts randomly left and right.<br><br> <span style="color: var(--g);">Keep it in the GREEN zone</span><br> using the <b>\u25C0</b> and <b>\u25B6</b> buttons!<br><br> <span style="color: var(--m);">Hold ${(a / 1e3).toFixed(0)} seconds to fill the bar.</span> </div> <button id="startComposureBtn" style=" padding: 12px 30px; background: linear-gradient(135deg, var(--j), var(--ak)); border: none; border-radius: 8px; color: var(--s); font-size: 1rem; font-weight: bold; cursor: pointer; ">Begin!</button> </div> ` : ""} <div style="margin-bottom: 15px; ${l ? "opacity: 0.3;" : ""}"> <div id="composureStatus" style="color: ${i >= 25 && i <= 75 ? "var(--n)" : "var(--al)"}; font-size: 1.1rem; font-weight: bold;">
              ${r ? i >= 25 && i <= 75 ? "\u2713 Balanced!" : "\u26A0\uFE0F Drifting!" : "Get Ready..."} </div> </div> <!-- Balance bar --> <div style=" position: relative; width: 100%; height: 65px; background: linear-gradient(90deg, var(--al) 0%, #f7258555 25%, var(--n) 25%, var(--n) 75%, #f7258555 75%, var(--al) 100% ); border-radius: 32px; border: 3px solid var(--o); overflow: hidden; ${l ? "opacity: 0.3;" : ""} "> <!-- Zone labels --> <div style="position: absolute; top: 50%; left: 8%; transform: translateY(-50%); color: var(--dl); font-size: 0.7rem;">DANGER</div> <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--et); font-size: 0.8rem; font-weight: bold;">SAFE</div> <div style="position: absolute; top: 50%; right: 8%; transform: translateY(-50%); color: var(--dl); font-size: 0.7rem;">DANGER</div> <!-- Balance indicator --> <div id="composureMarker" style=" position: absolute; left: ${i}%; top: 7px; width: 14px; height: 51px; background: var(--b); border-radius: 7px; transform: translateX(-50%); box-shadow: 0 0 20px var(--fs); transition: left 0.05s; "></div> </div> <!-- Time bar (progress) --> <div style="margin-top: 20px; width: 100%; ${l ? "opacity: 0.3;" : ""}"> <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"> <span style="color: var(--e); font-size: 0.85rem;">Progress</span> <span id="composurePercent" style="color: var(--g); font-size: 0.85rem; font-weight: bold;">0%</span> </div> <div style=" height: 12px; background: var(--ad); border-radius: 6px; overflow: hidden; border: 1px solid var(--o); "> <div id="composureTimer" style=" height: 100%; width: 0%; background: linear-gradient(90deg, var(--j), var(--n)); transition: width 0.1s; "></div> </div> </div> <!-- Control buttons --> <div style="display: flex; gap: 30px; margin-top: 25px; justify-content: center; ${l ? "opacity: 0.3;" : ""}"> <button id="composureLeft" style=" width: 110px; height: 90px; border-radius: 16px; background: ${p ? "linear-gradient(145deg, var(--n) 0%, var(--dq) 100%)" : "linear-gradient(145deg, var(--j) 0%, var(--ak) 100%)"}; border: 3px solid var(--b); color: var(--b); font-size: 2.5rem; cursor: pointer; touch-action: manipulation; user-select: none; ">\u25C0</button> <button id="composureRight" style=" width: 110px; height: 90px; border-radius: 16px; background: ${m ? "linear-gradient(145deg, var(--n) 0%, var(--dq) 100%)" : "linear-gradient(145deg, var(--j) 0%, var(--ak) 100%)"}; border: 3px solid var(--b); color: var(--b); font-size: 2.5rem; cursor: pointer; touch-action: manipulation; user-select: none; ">\u25B6</button> </div> <!-- Instruction reminder --> <div style="margin-top: 15px; color: var(--e); font-size: 0.8rem; ${l ? "opacity: 0.3;" : ""}"> Hold the buttons to move the marker </div> `, l && (document.getElementById("startComposureBtn").onclick = () => {
      l = false, r = true, c = (Math.random() - 0.5) * o, d = Date.now(), u2(), g(), y();
    });
  }, g = () => {
    const e2 = document.getElementById("composureLeft"), t2 = document.getElementById("composureRight");
    if (!e2 || !t2) return;
    const n2 = () => {
      p = true, h();
    }, a2 = () => {
      p = false, h();
    }, o2 = () => {
      m = true, h();
    }, i2 = () => {
      m = false, h();
    };
    e2.onmousedown = n2, e2.onmouseup = a2, e2.onmouseleave = a2, e2.ontouchstart = (e3) => {
      e3.preventDefault(), n2();
    }, e2.ontouchend = a2, e2.ontouchcancel = a2, t2.onmousedown = o2, t2.onmouseup = i2, t2.onmouseleave = i2, t2.ontouchstart = (e3) => {
      e3.preventDefault(), o2();
    }, t2.ontouchend = i2, t2.ontouchcancel = i2;
  }, h = () => {
    const e2 = document.getElementById("composureLeft"), t2 = document.getElementById("composureRight");
    e2 && (e2.style.background = p ? "linear-gradient(145deg, var(--n) 0%, var(--dq) 100%)" : "linear-gradient(145deg, var(--j) 0%, var(--ak) 100%)"), t2 && (t2.style.background = m ? "linear-gradient(145deg, var(--n) 0%, var(--dq) 100%)" : "linear-gradient(145deg, var(--j) 0%, var(--ak) 100%)");
  }, y = () => {
    if (!r) return;
    const e2 = Date.now() - d;
    i += c, Math.random() < 0.025 && (c = (Math.random() - 0.5) * o * 2), p && (i -= 1.8), m && (i += 1.8), i = Math.max(5, Math.min(95, i));
    const t2 = document.getElementById("composureMarker");
    t2 && (t2.style.left = i + "%");
    const n2 = i >= 25 && i <= 75;
    n2 && (s += 16.67);
    const l2 = document.getElementById("composureStatus");
    l2 && (l2.textContent = n2 ? "\u2713 Balanced!" : "\u26A0\uFE0F Drifting!", l2.style.color = n2 ? "var(--n)" : "var(--al)");
    const u3 = e2 / a * 100, g2 = document.getElementById("composureTimer"), h2 = document.getElementById("composurePercent");
    if (g2 && (g2.style.width = Math.min(100, u3) + "%"), h2 && (h2.textContent = Math.round(u3) + "%"), e2 >= a) return r = false, void this.endComposureGame(s, a);
    requestAnimationFrame(y);
  };
  u2(), this.activeGame.cleanup = () => {
    r = false;
  };
}, endComposureGame(e, t) {
  const n = e / t * 100;
  let a, o;
  n >= 80 ? (a = "perfect", o = 100) : n >= 60 ? (a = "success", o = Math.round(n - 60 + 70)) : n >= 35 ? (a = "partial", o = Math.round(n - 35 + 30)) : (a = "failure", o = Math.round(n)), this.showGameResult(a, o);
}, startTensionGame(e, t) {
  const n = t.difficulty || "medium", a = { easy: { totalRounds: 4, allowedMisses: 2, startSweetSpot: [55, 85], endSweetSpot: [65, 80], fillSpeed: 12, sweetSpotShift: 10 }, medium: { totalRounds: 5, allowedMisses: 2, startSweetSpot: [60, 85], endSweetSpot: [70, 82], fillSpeed: 16, sweetSpotShift: 15 }, hard: { totalRounds: 6, allowedMisses: 1, startSweetSpot: [65, 85], endSweetSpot: [75, 85], fillSpeed: 22, sweetSpotShift: 20 } }[n];
  let o = 1, i = 0, s = 0, r = 0, l = false, c = true, d = false, p = true;
  const m = (e2) => {
    const t2 = (e2 - 1) / Math.max(1, a.totalRounds - 1), n2 = a.startSweetSpot[0] + (a.endSweetSpot[0] - a.startSweetSpot[0]) * t2, o2 = a.startSweetSpot[1] + (a.endSweetSpot[1] - a.startSweetSpot[1]) * t2, i2 = (Math.random() - 0.5) * a.sweetSpotShift * t2;
    let s2 = Math.max(20, Math.min(75, n2 + i2)), r2 = Math.max(s2 + 8, Math.min(95, o2 + i2));
    return [Math.round(s2), Math.round(r2)];
  };
  let [u2, g] = m(1);
  const h = () => {
    const t2 = g - u2, r2 = Array(a.totalRounds).fill("\u25CB").map((e2, t3) => t3 < i ? '<span style="color:var(--g);">\u25CF</span>' : t3 < i + s ? '<span style="color:var(--al);">\u2715</span>' : '<span style="color:var(--q);">\u25CB</span>').join(" ");
    e.innerHTML = ` <div style="margin-bottom: 10px;"> <div style="color: var(--m); font-size: 1rem; margin-bottom: 5px;"> Hold to build tension... release in the green zone! </div> <div style="font-size: 0.9rem; color: var(--br);"> Round <span style="color:var(--b); font-weight:bold;">${o}</span> of ${a.totalRounds} <span style="margin-left: 15px;">Misses allowed: <span style="color:${a.allowedMisses - s > 0 ? "var(--n)" : "var(--al)"}; font-weight:bold;">${a.allowedMisses - s}</span></span> </div> </div> <!-- Progress indicator --> <div style="margin-bottom: 15px; font-size: 1.3rem; letter-spacing: 4px;"> ${r2} </div> <!-- Tension meter with animated sweet spot --> <div style=" position: relative; width: 70px; height: 220px; background: linear-gradient(180deg, var(--al) 0%, var(--al) ${100 - g}%,
              var(--n) ${100 - g}%, var(--n) ${100 - u2}%,
              var(--dz) ${100 - u2}%, var(--dz) 100% ); border-radius: 35px; border: 4px solid var(--o); margin: 0 auto; overflow: hidden; box-shadow: 0 0 20px rgba(78, 204, 163, 0.3); transition: background 0.5s ease; "> <!-- Fill level (inverted - fills from bottom) --> <div id="tensionFill" style=" position: absolute; bottom: 0; width: 100%; height: 0%; background: linear-gradient(180deg, var(--ba) 0%, rgba(100,100,100,0.8) 100%); transition: height 0.03s linear; "></div> <!-- Current position marker --> <div id="tensionMarker" style=" position: absolute; left: 50%; transform: translateX(-50%); bottom: 0%; width: 50px; height: 6px; background: var(--b); border-radius: 3px; box-shadow: 0 0 10px var(--b), 0 0 20px var(--b); transition: bottom 0.03s linear; "></div> <!-- Sweet spot bracket indicators --> <div style=" position: absolute; left: -25px; bottom: ${u2}%;
              height: ${t2}%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; "> <div style="width:20px; height:3px; background:var(--n); border-radius:2px;"></div> <div style="font-size:0.7rem; color:var(--g); writing-mode:vertical-rl; transform:rotate(180deg);">ZONE</div> <div style="width:20px; height:3px; background:var(--n); border-radius:2px;"></div> </div> <div style=" position: absolute; right: -25px; bottom: ${u2}%;
              height: ${t2}%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; "> <div style="width:20px; height:3px; background:var(--n); border-radius:2px;"></div> <div style="font-size:0.7rem; color:var(--g); writing-mode:vertical-rl;">${t2}%</div> <div style="width:20px; height:3px; background:var(--n); border-radius:2px;"></div> </div> </div> <!-- Tension value --> <div style="margin-top: 12px; font-size: 1.8rem; color: var(--b); font-weight: bold;"> <span id="tensionValue">0</span>% </div> <!-- Hold button --> <button id="tensionBtn" style=" margin-top: 15px; width: 140px; height: 140px; border-radius: 50%; background: linear-gradient(145deg, var(--bt) 0%, #7b2cbf 100%); border: 5px solid var(--b); color: var(--s); font-size: 1.2rem; font-weight: bold; cursor: pointer; box-shadow: 0 0 30px rgba(157,78,221,0.5); touch-action: manipulation; transition: transform 0.1s, box-shadow 0.1s; "> ${p ? "HOLD" : "WAIT..."} </button> <div style="margin-top: 10px; font-size: 0.8rem; color: var(--e);"> ${"hard" === n ? "\u26A0\uFE0F Hard: Zone shifts more!" : "Tap/click and hold, release in green"} </div> `;
    const c2 = document.getElementById("tensionBtn");
    c2 && p && (c2.onmousedown = f, c2.onmouseup = b, c2.onmouseleave = () => {
      l && b();
    }, c2.ontouchstart = (e2) => {
      e2.preventDefault(), f();
    }, c2.ontouchend = b);
  }, y = () => {
    if (c) {
      if (l && p && (r = Math.min(100, r + a.fillSpeed / 60), (() => {
        const e2 = document.getElementById("tensionFill"), t2 = document.getElementById("tensionMarker"), n2 = document.getElementById("tensionValue");
        e2 && n2 && t2 && (e2.style.height = r + "%", t2.style.bottom = r + "%", n2.textContent = Math.round(r), r >= u2 && r <= g ? (n2.style.color = "var(--n)", n2.style.textShadow = "0 0 10px var(--n)", t2.style.background = "var(--n)") : r > g ? (n2.style.color = "var(--al)", n2.style.textShadow = "0 0 10px var(--al)", t2.style.background = "var(--al)") : (n2.style.color = "var(--dz)", n2.style.textShadow = "none", t2.style.background = "var(--b)"));
      })(), r >= 100)) {
        p = false, l = false, s++;
        const e2 = document.getElementById("tensionBtn");
        return e2 && (e2.textContent = "\u{1F4A5}", e2.style.background = "linear-gradient(145deg, var(--al) 0%, var(--dr) 100%)"), void setTimeout(() => {
          if (s > a.allowedMisses) {
            c = false;
            const e3 = Math.round(i / a.totalRounds * 50);
            this.showGameResult("failure", e3);
          } else v();
        }, 800);
      }
      requestAnimationFrame(y);
    }
  }, f = () => {
    if (!c || !p) return;
    l = true, d = true;
    const e2 = document.getElementById("tensionBtn");
    e2 && (e2.textContent = "...", e2.style.transform = "scale(0.95)", e2.style.boxShadow = "0 0 50px rgba(157,78,221,0.8)");
  }, b = () => {
    if (!c || !d || !p) return;
    l = false, p = false;
    const e2 = document.getElementById("tensionBtn");
    r >= u2 && r <= g ? (i++, e2 && (e2.textContent = "\u2713", e2.style.background = "linear-gradient(145deg, var(--n) 0%, var(--cp) 100%)")) : (s++, e2 && (e2.textContent = "\u2717", e2.style.background = "linear-gradient(145deg, var(--al) 0%, var(--dr) 100%)")), e2.style.transform = "scale(1)", setTimeout(() => {
      if (s > a.allowedMisses) {
        c = false;
        const e3 = Math.round(i / a.totalRounds * 50);
        this.showGameResult("failure", e3);
      } else if (o >= a.totalRounds) {
        c = false;
        const e3 = i / a.totalRounds;
        let t2, n2;
        1 === e3 ? (t2 = "perfect", n2 = 100) : e3 >= 0.8 ? (t2 = "success", n2 = Math.round(75 + 20 * e3)) : e3 >= 0.5 ? (t2 = "partial", n2 = Math.round(40 + 30 * e3)) : (t2 = "failure", n2 = Math.round(40 * e3)), this.showGameResult(t2, n2);
      } else v();
    }, 600);
  }, v = () => {
    o++, r = 0, d = false, p = true, [u2, g] = m(o), h();
    const e2 = document.getElementById("tensionValue");
    e2 && (e2.innerHTML = `<span style="font-size:0.8rem; color:var(--g);">Zone: ${u2}-${g}%</span>`, setTimeout(() => {
      document.getElementById("tensionValue") && (document.getElementById("tensionValue").textContent = "0");
    }, 1e3));
  };
  h(), y(), this.activeGame.cleanup = () => {
    c = false;
  };
}, showGameResult(e, t) {
  const n = document.getElementById("minigameArea");
  if (!n) return;
  const a = { perfect: { emoji: "\u{1F31F}", text: "PERFECT!", color: "var(--z)", desc: "Flawless execution!" }, success: { emoji: "\u2705", text: "SUCCESS!", color: "var(--n)", desc: "Well done!" }, partial: { emoji: "\u{1F610}", text: "PARTIAL", color: "var(--dz)", desc: "Could be better..." }, failure: { emoji: "\u274C", text: "FAILED", color: "var(--al)", desc: "That didn't go well." } }[e];
  n.innerHTML = ` <div style="animation: storySlideUp 0.4s ease-out;"> <div style="font-size: 4rem; margin-bottom: 10px;">${a.emoji}</div> <div style="font-size: 2rem; font-weight: bold; color: ${a.color}; margin-bottom: 10px;">${a.text}</div> <div style="font-size: 1.1rem; color: var(--br); margin-bottom: 20px;">${a.desc}</div> <div style="font-size: 1.5rem; color: var(--b);">Score: <span style="color: ${a.color}; font-weight: bold;">${t}</span>/100</div> </div> `, this.gameResult = { result: e, score: t };
  const o = document.getElementById("skipMinigame");
  o && (o.style.display = "none");
  const i = document.getElementById("minigameContainer");
  if (i) {
    const e2 = document.createElement("button");
    e2.style.cssText = `
          margin-top: 25px; padding: 15px 40px;
          background: linear-gradient(135deg, ${a.color} 0%, ${fuocAlpha(a.color, "88")} 100%);
          border: none; border-radius: 12px;
          color: var(--b); font-size: 1.1rem; font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 20px ${fuocAlpha(a.color, "44")};
        `, e2.textContent = "Continue", e2.onclick = () => this.completeGame(), i.appendChild(e2);
  }
}, completeGame() {
  const e = document.getElementById("minigameOverlay");
  e && (e.style.animation = "storyFadeIn 0.3s ease-out reverse", setTimeout(() => e.remove(), 300)), this.activeGame && this.gameResult && !this.gameResult.skipped && this.trackMinigameMastery(this.activeGame.type, this.gameResult), this.activeGame?.cleanup && this.activeGame.cleanup(), this.activeGame?.onComplete && this.activeGame.onComplete(this.gameResult), this.activeGame = null, this.gameResult = null;
}, skipGame() {
  this.activeGame?.cleanup && this.activeGame.cleanup(), this.gameResult = { result: "partial", score: 50, skipped: true }, this.completeGame();
}, trackMinigameMastery(e, t) {
  if (!gameState?.story?.minigameMastery) return;
  const n = gameState.story.minigameMastery;
  n[e] || (n[e] = { played: 0, perfect: 0, wins: 0, level: 0 });
  const a = n[e];
  a.played++, "success" !== t.result && "perfect" !== t.result || a.wins++, ("perfect" === t.result || t.score >= 95) && a.perfect++;
  const o = a.level;
  if (a.perfect >= 10 ? a.level = 5 : a.perfect >= 7 ? a.level = 4 : a.perfect >= 4 ? a.level = 3 : a.wins >= 5 ? a.level = 2 : a.wins >= 2 && (a.level = 1), a.level > o && a.level >= 2) {
    const t2 = this.GAME_TYPES[e];
    this.showMasteryLevelUp(t2, a.level);
  }
}, showMasteryLevelUp(e, t) {
  const [n, a] = { 2: ["Apprentice", "\u{1F31F}"], 3: ["Skilled", "\u2B50"], 4: ["Expert", "\u{1F31F}\u{1F31F}"], 5: ["Master", "\u{1F451}"] }[t] || ["Improving", "\u2728"], o = document.createElement("div");
  o.style.cssText = "\n        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);\n        background: linear-gradient(135deg, var(--ad) 0%, var(--w) 100%);\n        border: 2px solid var(--m); border-radius: 20px;\n        padding: 30px 50px; z-index: 100003; text-align: center;\n        animation: storyFadeIn 0.5s ease-out;\n      ", o.innerHTML = ` <div style="font-size: 3rem; margin-bottom: 15px;">${a}</div> <div style="color: var(--m); font-size: 1.5rem; font-weight: bold; margin-bottom: 10px;"> ${n} ${e.name}! </div> <div style="color: var(--br); font-size: 0.95rem; margin-bottom: 20px;"> Mastery Level ${t} Achieved!<br> <span style="color: var(--g);">Future ${e.name} checks are slightly easier.</span> </div> <button onclick="this.parentElement.remove()" style=" padding: 10px 25px; background: linear-gradient(135deg, var(--j), var(--ak)); border: none; border-radius: 8px; color: var(--s); cursor: pointer; font-weight: bold; ">Nice!</button> `, document.body.appendChild(o), setTimeout(() => o.remove(), 8e3);
}, getMasteryAdjustedDifficulty(e, t) {
  const n = gameState?.story?.minigameMastery?.[e];
  if (!n) return t;
  let a = { easy: 0, medium: 1, hard: 2 }[t] ?? 1;
  return n.level >= 3 || n.level >= 1 && (a = Math.max(0, a - 0.5)), ["easy", "medium", "hard"][Math.round(a)];
}, selectContextualMinigame(e = []) {
  const t = { negotiation: ["precision", "composure"], confrontation: ["composure", "tension"], seduction: ["tension", "intensity"], persuasion: ["intensity", "precision"], observation: ["recall", "reflex"], social: ["recall", "composure"], timing: ["precision", "reflex"], urgency: ["reflex", "intensity"], power_play: ["tension", "composure"], romance: ["tension", "precision"], risk: ["precision", "tension"], memory: ["recall"], opportunity: ["reflex"], patience: ["tension", "composure"] }, n = [];
  if (e.forEach((e2) => {
    const a2 = t[e2.toLowerCase()];
    a2 && n.push(...a2);
  }), 0 === n.length) {
    const e2 = Object.keys(this.GAME_TYPES);
    return e2[Math.floor(Math.random() * e2.length)];
  }
  const a = {};
  n.forEach((e2) => a[e2] = (a[e2] || 0) + 1);
  const o = Object.entries(a).sort((e2, t2) => t2[1] - e2[1]), i = o.filter(([e2, t2]) => t2 >= o[0][1] - 1).map(([e2]) => e2);
  return i[Math.floor(Math.random() * i.length)];
} };
window.StoryMinigames = StoryMinigames;
