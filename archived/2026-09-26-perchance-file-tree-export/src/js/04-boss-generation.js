// ============================================================================
// 04-boss-generation — Boss generation (generateUniqueBoss, config proxy Fe, character/appearance builder je, recruitment data).
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

async function generateUniqueBoss(e, t = false) {
  const n = ke[e];
  if (!n) return console.error(`[Boss Gen] No archetype for location: ${e}`), null;
  if (!t && gameState.bossFights.generatedBosses?.[e]) return console.log(`[Boss Gen] Using cached boss for ${e}`), gameState.bossFights.generatedBosses[e];
  console.log(`[Boss Gen] Generating unique boss for ${e}...`), gameState.bossFights.generatedBosses || (gameState.bossFights.generatedBosses = {});
  const a = Se(n), o = $e(n), i = Ce(n);
  let s = Ie(n, a);
  const r = { id: n.id, locationId: n.locationId, generatedAt: Date.now(), seed: Math.random().toString(36).substr(2, 9), character: a, appearance: o, combat: i, dialogue: s, rewards: { cashBase: 50 * i.baseHealth, cashMultiplier: 2 + i.timeLimit / 30, bountyMultiplier: 2 }, images: { portrait: { generated: false, url: null, priority: "high" }, idle: { generated: false, url: null, priority: "high" }, confident: { generated: false, url: null, priority: "medium" }, attack_quick: { generated: false, url: null, priority: "medium" }, attack_heavy: { generated: false, url: null, priority: "medium" }, attack_special: { generated: false, url: null, priority: "low" }, attack_grab: { generated: false, url: null, priority: "low" }, damaged_light: { generated: false, url: null, priority: "medium" }, damaged_heavy: { generated: false, url: null, priority: "low" }, blocking: { generated: false, url: null, priority: "low" }, defeated: { generated: false, url: null, priority: "high" }, recruited: { generated: false, url: null, priority: "low" } }, recruitment: Pe(n, a) };
  return gameState.bossFights.generatedBosses[e] = r, saveGame(), console.log(`[Boss Gen] Generated unique boss: ${a.firstName} ${a.lastName} "${a.title}"`), "function" == typeof $h && $h(r.id), "function" == typeof generateText && Math.random() < 0.7 && Ee(n, a, o).then((t2) => {
    if (t2) {
      const n2 = gameState.bossFights.generatedBosses[e];
      n2 && (n2.dialogue = t2, console.log(`[Boss Gen] Upgraded dialogue for ${a.firstName} with AI`));
    }
  }).catch((e2) => {
    console.warn(`[Boss Gen] AI dialogue failed for ${a.firstName}, using procedural:`, e2);
  }), r;
}
function Se(e) {
  const t = xe, n = e.namePool, a = t.names[n] || t.names.western, o = Ae(a.first), i = Ae(a.last), s = Ae(e.titleOptions), r = Ne(e.ageRange[0], e.ageRange[1]), l = e.personalityTheme.coreTrait, c = e.personalityTheme.hiddenTrait, d = [l, Ae(t.personalities.dominant), Ae(t.personalities.ambitious)], p = [Ae(t.personalities.quirks), Ae(t.personalities.quirks)], m = `${o} ${Ae(t.backstories.origins)}. ${Ae(t.backstories.motivations)}. Those who know her well say she ${Ae(t.backstories.secrets)}.`;
  return { firstName: o, lastName: i, title: s, age: r, personality: { traits: d, hiddenTrait: c, quirks: p, likes: _e(e.theme), dislikes: Oe(e.theme) }, backstory: m, speechStyle: e.personalityTheme.speechStyle };
}
function $e(e) {
  const t = xe, n = e.appearanceTheme, a = e.gender || "female", o = Ae(t.bodies.types), i = Ae(t.bodies.heights), s = Ae(t.bodies.busts), r = Ae(t.bodies.defining), l = Math.random() < 0.7 ? Ae(n.preferredColors) : Ae(t.hair.colors), c = Math.random() < 0.7 ? Ae(n.preferredStyles) : Ae(t.hair.styles), d = Math.random() < 0.7 ? Ae(n.preferredEyes) : Ae(t.eyes.colors), p = Ae(t.eyes.shapes), m = Ae(t.eyes.expressions), u2 = Ae(t.skin.tones), g = Ae(t.skin.features), h = Ae(t.outfits.colors), y = Ae(t.outfits.corporate);
  return { body: { type: o, height: i, bust: s, defining: r }, hair: { color: l, style: c }, eyes: { color: d, shape: p, expression: m }, skin: { tone: u2, feature: g }, outfit: { battle: { style: y, color: h, accessories: [Ae(t.outfits.accessories), Ae(t.outfits.accessories)], shoes: Ae(t.outfits.shoes) }, damaged: { description: `${y} disheveled and askew, hair mussed with strands falling across face` }, defeated: { description: `${y} torn and ruined, hair completely disheveled, breathing heavily, flushed skin, defeated expression` }, recruited: { description: `Smart casual version of ${y}, more relaxed, genuine small smile, softer expression` } }, gender: a };
}
function Ce(e) {
  const t = e.combatTheme, n = t.attackStyle, a = [...xe.attackNames[n] || xe.attackNames.corporate].sort(() => Math.random() - 0.5), o = a[0] || "Quick Strike", i = a[1] || a[0] || "Heavy Strike", s = a[2] || a[0] || "Grab", r = [{ id: "attack_quick", name: o, type: "quick", damage: 10 + Math.floor(0.5 * t.baseAttackDamage), indicator: "yellow", reactionWindow: 1200 + Math.floor(400 * Math.random()), correctResponse: ["parry", "block"], animation: "attack_quick", telegraph: "A quick strike! \u26A1 PARRY or BLOCK!" }, { id: "attack_heavy", name: i, type: "heavy", damage: 25 + t.baseAttackDamage, indicator: "red", reactionWindow: 2e3 + Math.floor(500 * Math.random()), correctResponse: ["block", "dodge"], animation: "attack_heavy", telegraph: "HEAVY ATTACK! \u{1F4A5} BLOCK or DODGE!" }, { id: "attack_grab", name: s, type: "grab", damage: 20 + Math.floor(0.8 * t.baseAttackDamage), indicator: "purple", reactionWindow: 1800 + Math.floor(400 * Math.random()), correctResponse: ["mash"], mashRequired: 6 + Math.floor(4 * Math.random()), animation: "attack_grab", telegraph: "GRAB ATTACK! \u{1F517} MASH TO ESCAPE!" }];
  return { baseHealth: t.baseHealth, baseAttackDamage: t.baseAttackDamage, attackInterval: t.attackInterval, timeLimit: t.timeLimit, attacks: r, specialMove: { name: t.specialName, trigger: { type: "health_percent", value: 50 }, effect: t.specialTheme, duration: 5e3 + Math.floor(5e3 * Math.random()), damage: 0 }, enrage: { trigger: { type: "health_percent", value: 25 }, speedMultiplier: 1.2 + 0.3 * Math.random(), damageMultiplier: 1.3 + 0.4 * Math.random() } };
}
async function Ee(e, t, n) {
  if ("function" != typeof generateText) return null;
  try {
    const e2 = `Generate unique combat dialogue for a boss character in a game.
      
Character: ${t.firstName} ${t.lastName}, "${t.title}"
Age: ${t.age}
Personality: ${t.personality.traits.join(", ")}
Hidden trait: ${t.personality.hiddenTrait}
Speech style: ${t.speechStyle.formal ? "Formal, sophisticated" : "Casual, direct"}
Backstory: ${t.backstory}

Generate JSON with these dialogue arrays (3-4 lines each, short and punchy):
- intro: Opening lines when fight starts
- combat: Generic taunts during battle
- playerHit: When boss hits the player
- playerDodge: When player dodges
- playerParry: When player parries (surprised reaction)
- midFight: When boss reaches 50% health
- lowHealth: When boss reaches 25% health (desperate)
- defeated: When player wins (grudging respect)
- playerLoss: When player loses (dismissive)

Return ONLY valid JSON, no other text.`, n2 = await generateText(e2);
    if (n2) {
      let e3;
      try {
        e3 = JSON.parse(n2);
      } catch (e4) {
        return console.warn("[Boss Gen] AI returned invalid JSON, falling back to procedural:", e4.message), null;
      }
      return e3.recruitment = { offer: `You want me to work FOR you? *${t.speechStyle.formal ? "raises eyebrow" : "laughs"}* ...You're serious?`, accept: "Fine. But this is business, nothing more... for now.", decline: "Your loss. Don't expect this offer again." }, e3.rematch = { intro: ["Rematch? Oh, I've been waiting for this.", "Think you can beat me twice?", "Let's see if that was luck."], playerWins: ["You've improved. " + (t.speechStyle.formal ? "I'm impressed." : "Not bad."), "Fine, you win again."], playerLoses: ["Ha! Knew you'd slip up.", "That's what happens when you get cocky."] }, e3;
    }
  } catch (e2) {
    console.log("[Boss Gen] AI dialogue generation failed, using procedural:", e2);
  }
  return null;
}
function Ie(e, t) {
  const n = t.speechStyle.formal;
  return t.firstName, { intro: n ? ["So, you are the one attempting to enter my domain. Let us see if you are worthy.", "I do not tolerate incompetence. Prove yourself or leave.", "Interesting. You have more courage than sense."] : ["So you're the one everyone's talking about. Let's see what you've got.", "Ha! You think you can take ME on? This'll be fun.", "Finally, someone worth my time. Maybe."], combat: n ? ["Disappointing.", "Is that the best you can manage?", "Pathetic attempt.", "You bore me."] : ["That all you got?", "Come on, try harder!", "Boring!", "Wake me when you're serious."], playerHit: n ? ["Too slow.", "Predictable.", "Amateur.", "Expected."] : ["Gotcha!", "Too easy!", "Should've dodged!", "Ouch, that had to hurt!"], playerDodge: n ? ["Acceptable reflexes.", "You can move. Good.", "Hmph. Lucky."] : ["Quick! But not quick enough.", "Nice dodge!", "Getting warmer!"], playerParry: n ? ["What?!", "Impossible!", "You... anticipated that?", "Inconceivable!"] : ["Whoa!", "How did you\u2014?!", "Lucky shot!", "Okay, that was good."], midFight: n ? ["Perhaps you are not entirely incompetent.", "Interesting. You have some fight in you."] : ["Okay, NOW it's getting interesting.", "Hah! You're tougher than you look!"], lowHealth: n ? ["This is... unexpected. I will not lose!", "Enough games. Time to end this!"] : ["No way! I'm NOT losing to you!", "That's IT! Gloves are OFF!"], defeated: n ? ["*breathing heavily* You have... earned my respect.", "I... concede. You are worthy."] : ["*panting* Okay... okay, you got me. Fair fight.", "Damn... you're actually good."], playerLoss: n ? ["As expected. Return when you have improved.", "Disappointing. Do not waste my time again."] : ["Better luck next time, kid.", "Come back when you're ready to play for real."], recruitment: { offer: `You want me to work FOR you? ${n ? "*raises eyebrow*" : "*laughs*"} ...You're serious?`, accept: "Fine. But this is business, nothing more... for now.", decline: "Your loss. Don't expect this offer again." }, rematch: { intro: ["Rematch? Oh, I've been waiting for this.", "Think you can beat me twice?"], playerWins: ["You've improved. " + (n ? "I'm impressed." : "Not bad."), "Fine, you win again."], playerLoses: ["Ha! Knew you'd slip up.", "That's what happens when you get cocky."] } };
}
function Pe(e, t) {
  const n = e.recruitmentData, a = { income_bonus: `+${Math.round(100 * n.passiveValue)}% income from all sources`, efficiency_bonus: `+${Math.round(100 * n.passiveValue)}% production efficiency`, sales_bonus: `+${Math.round(100 * n.passiveValue)}% product sales`, innovation_bonus: `+${Math.round(100 * n.passiveValue)}% research speed`, charm_bonus: `+${Math.round(100 * n.passiveValue)}% relationship gains`, prestige_bonus: `+${Math.round(100 * n.passiveValue)}% prestige point gains`, protection_bonus: `-${Math.round(100 * n.passiveValue)}% negative events`, ultimate_bonus: `+${Math.round(100 * n.passiveValue)}% to ALL stats` };
  return { available: true, corporateLadderSlot: Math.ceil(e.combatTheme.baseHealth / 1e5) + 1, employeeStats: { role: n.role, baseSalary: n.baseSalary, productivity: n.productivity, skills: { sales: 2 + Math.floor(4 * Math.random()), leadership: 2 + Math.floor(4 * Math.random()), creativity: 2 + Math.floor(4 * Math.random()), technical: 2 + Math.floor(4 * Math.random()) } }, passiveBonus: { type: n.passiveType, value: n.passiveValue, description: a[n.passiveType] }, activeAbility: { name: `${t.firstName}'s Authority`, description: `Temporarily boosts a random stat by ${Math.round(200 * n.passiveValue)}%`, cooldown: 864e5, duration: 36e5 } };
}
function Ae(e) {
  return e[Math.floor(Math.random() * e.length)];
}
function Ne(e, t) {
  return Math.floor(Math.random() * (t - e + 1)) + e;
}
function _e(e) {
  const t = { corporate_demanding: ["efficiency", "fine wine", "classical music", "power", "precision", "luxury"], corporate_queen: ["strategy", "control", "expensive tastes", "winning", "respect", "authority"], retail_empress: ["fashion", "customer loyalty", "sales records", "recognition", "success stories"], mad_scientist: ["experiments", "innovation", "chaos", "discovery", "breaking rules", "the unexpected"], seductress: ["attention", "admiration", "games", "mystery", "beautiful things", "conquest"], fashion_mogul: ["aesthetics", "trends", "creativity", "recognition", "perfection", "art"], underground_queen: ["secrets", "loyalty", "shadows", "power", "respect", "freedom"], final_boss: ["excellence", "legacy", "power", "worthy opponents", "perfection", "dominance"] };
  return (t[e] || t.corporate_demanding).slice().sort(() => Math.random() - 0.5).slice(0, 4);
}
function Oe(e) {
  const t = { corporate_demanding: ["incompetence", "excuses", "tardiness", "mediocrity", "small talk"], corporate_queen: ["weakness", "disloyalty", "failure", "insubordination", "wasted time"], retail_empress: ["bad service", "complaints", "laziness", "disrespect", "failure"], mad_scientist: ["boredom", "routine", "limitations", "safety protocols", "the ordinary"], seductress: ["being ignored", "ugliness", "boredom", "rejection", "predictability"], fashion_mogul: ["poor taste", "last season", "copies", "mediocrity", "cheapness"], underground_queen: ["betrayal", "weakness", "authority", "exposure", "cowardice"], final_boss: ["weakness", "mediocrity", "disloyalty", "failure", "being challenged"] };
  return (t[e] || t.corporate_demanding).slice().sort(() => Math.random() - 0.5).slice(0, 4);
}
async function getBossConfig(e) {
  return gameState.bossFights.generatedBosses?.[e] ? gameState.bossFights.generatedBosses[e] : ke[e] ? await generateUniqueBoss(e) : (console.error(`[Boss] No archetype for location: ${e}`), null);
}
function getBossConfigSync(e) {
  return gameState.bossFights.generatedBosses?.[e] || null;
}
const Fe = new Proxy({}, { get: function(e, t) {
  return gameState.bossFights?.generatedBosses?.[t] || ke[t] || void 0;
}, has: function(e, t) {
  return !!ke[t];
} });
function je(e, t) {
  const n = e.appearance, a = e.character;
  let o, i, s, r, l;
  o = "object" == typeof n.body ? `${n.body.type || "athletic"}, ${n.body.height || "tall"}` : n.body || "athletic build", i = "object" == typeof n.hair ? `${n.hair.color || "dark"} ${n.hair.style || "styled"} hair` : n.hair || "styled hair", s = "object" == typeof n.eyes ? `${n.eyes.color || "dark"} ${n.eyes.shape || "almond-shaped"} eyes, ${n.eyes.expression || "intense gaze"}` : n.eyes || "striking eyes", r = "object" == typeof n.skin ? `${n.skin.tone || "fair"} skin, ${n.skin.feature || "flawless complexion"}` : n.skin || "flawless skin", l = n.face || "beautiful face";
  let c = `beautiful ${a?.age || 30} year old woman, ${o}, ${i}, ${s}, ${r}, ${l}`, d = "", p = "", m = "";
  const u2 = n.outfit?.battle || n.outfit || {};
  switch (t) {
    case "portrait":
      d = u2.top || u2.style || "professional attire", p = "professional headshot, shoulders visible", m = "confident expression";
      break;
    case "idle":
      d = u2.style ? `${u2.style} in ${u2.color}` : `${u2.top || "blazer"}, ${u2.bottom || "skirt"}, ${u2.shoes || "heels"}`, p = "standing in ready battle stance", m = "confident, challenging expression";
      break;
    case "confident":
      d = u2.style || `${u2.top || "professional attire"}`, p = "arms crossed, powerful stance", m = "smirking, superior expression";
      break;
    case "attack_quick":
      d = u2.style || u2.top || "professional attire", p = "lunging forward with quick strike, dynamic pose", m = "focused, determined expression";
      break;
    case "attack_heavy":
      d = u2.style || u2.top || "professional attire", p = "winding up powerful attack, dramatic pose", m = "fierce, intense expression";
      break;
    case "attack_special":
      d = u2.style || u2.top || "professional attire", p = "channeling special ability, glowing effects", m = "powerful, commanding expression";
      break;
    case "attack_grab":
      d = u2.style || u2.top || "professional attire", p = "reaching forward to grab, predatory pose", m = "hungry, determined expression";
      break;
    case "damaged_light":
      d = n.outfit?.damaged?.description || "disheveled attire", p = "recoiling from hit, off-balance", m = "surprised, slightly pained expression";
      break;
    case "damaged_heavy":
      d = n.outfit?.damaged?.description || "torn, disheveled attire", p = "staggered, one knee down", m = "shocked, breathing hard";
      break;
    case "blocking":
      d = u2.style || u2.top || "professional attire", p = "arms raised in defensive block", m = "focused, bracing for impact";
      break;
    case "defeated":
      d = n.outfit?.defeated?.description || "torn clothing, disheveled", p = "on knees, looking up at victor", m = "exhausted, mix of defeat and respect, breathing heavily, flushed";
      break;
    case "recruited":
      d = n.outfit?.recruited?.description || "smart casual, relaxed professional", p = "professional standing pose", m = "genuine smile, softer expression";
      break;
    default:
      d = u2.style || u2.top || "professional attire", p = "standing", m = "neutral expression";
  }
  return `${c}, ${d}, ${p}, ${m}, photorealistic, detailed, high quality, dramatic lighting`;
}
