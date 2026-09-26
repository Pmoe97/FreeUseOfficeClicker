// ============================================================================
// 21-gifts — Gifts: generateCustomGift, gift store, reactions, pet names, giveGiftToEmployee.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

async function generateCustomGift(e, t = 1 / 0, n = null) {
  const a = [{ keywords: ["shit", "feces", "poop", "excrement", "fecal", "dung", "crap"], responses: ["\u{1F922} Ew, absolutely not. I create GIFTS, not... that. Try asking for something people would actually want to receive!", "\u{1F922} Are you serious? No. I'm a magical gift genie, not a porta-potty. Ask for something that doesn't belong in a toilet.", "\u{1F922} Gross! Hard pass. I make THOUGHTFUL presents, not biohazards. Try again with something that isn't disgusting.", "\u{1F922} Yeah, no. That's not happening. I have standards, and they don't include literal waste. Next idea, please!", "\u{1F922} Absolutely NOT. Why would you even... you know what, I don't want to know. Ask for a real gift."] }, { keywords: ["vomit", "puke", "barf", "vomitus"], responses: ["\u{1F92E} That's disgusting. I'm not creating biohazards. Ask for something that won't make people sick.", "\u{1F92E} Uh, no thanks. I deal in GIFTS, not bodily fluids. Try something that doesn't come from someone's stomach.", "\u{1F92E} Hard no. That's revolting. Pick literally anything else that people would want to receive.", "\u{1F92E} Are you trying to make me gag? Not happening. Ask for something that belongs in a gift box, not a sick bag."] }, { keywords: ["urine", "piss", "pee"], responses: ["\u{1F612} No. Just... no. Why would anyone want that? Try something that isn't a bodily fluid.", "\u{1F612} I'm not even dignifying that with a full response. No. Ask for something that isn't liquid waste.", "\u{1F612} You're joking, right? That's a hard no. Try asking for something that people actually want.", "\u{1F612} Absolutely not. I create thoughtful gifts, not... whatever that is. Pick something else."] }, { keywords: ["dead body", "corpse", "cadaver", "roadkill"], responses: ["\u{1F480} That's disturbing AND illegal. I don't do morbid stuff. Ask for something appropriate.", "\u{1F480} What is WRONG with you? No. That's creepy and illegal. Try something that's, you know... alive? Or at least not dead?", "\u{1F480} Uh, that's a felony waiting to happen. Hard pass. Ask for something that won't get anyone arrested.", "\u{1F480} Yeah, I'm not touching that with a 10-foot pole. Way too dark. Try something that doesn't involve death.", "\u{1F480} I think I know where I can get the body from... Get out of here with that request."] }, { keywords: ["garbage", "trash can", "rubbish", "waste bin", "literal trash"], responses: ["\u{1F5D1}\uFE0F I make thoughtful gifts, not insults. If you want to give someone trash, just... don't give them anything.", "\u{1F5D1}\uFE0F Really? Garbage? That's not a gift, that's an insult. Try something that shows you actually care.", "\u{1F5D1}\uFE0F No way. I create meaningful presents, not things that belong in a landfill. Ask for something with value.", "\u{1F5D1}\uFE0F Hard no. Why would you gift someone actual trash? Try something people would appreciate."] }, { keywords: ["heroin", "meth", "cocaine", "crack", "fentanyl", "opioid"], responses: ["\u{1F48A} Hard drugs? No way. I'm not helping anyone with that. Stick to legal, non-harmful gifts.", "\u{1F48A} Absolutely not. That's dangerous and illegal. I only create gifts that won't destroy lives.", "\u{1F48A} Yeah, that's a HUGE no. I don't do hard drugs. Try something that won't kill someone.", "\u{1F48A} Not happening. I create gifts that bring joy, not addiction. Ask for something legal and safe."] }, { keywords: ["slave", "human trafficking", "kidnapped"], responses: ["\u26D3\uFE0F Absolutely NOT. That's horrifying and illegal. I only create ethical gifts.", "\u26D3\uFE0F WHAT?! No. That's beyond disturbing. I'm not even going to entertain that thought. Ask for something that isn't a crime against humanity.", "\u26D3\uFE0F That's horrific. Hard no. I create gifts, not human rights violations. Try something ethical.", "\u26D3\uFE0F Are you out of your mind? No. That's evil and illegal. Ask for something that doesn't involve kidnapping."] }, { keywords: ["explosive", "bomb", "grenade", "c4", "dynamite"], responses: ["\u{1F4A3} I don't create explosives or dangerous weapons. Try something that won't blow up.", "\u{1F4A3} Yeah, no. I'm not making anything that explodes. That's way too dangerous. Pick something safer.", "\u{1F4A3} Hard pass on anything that goes boom. I create GIFTS, not terrorist supplies. Try again.", "\u{1F4A3} Absolutely not. That's insanely dangerous. Ask for something that won't land you on a watchlist."] }], o = e.toLowerCase();
  for (const e2 of a) if (e2.keywords.some((e3) => new RegExp("\\b" + e3 + "\\b").test(o))) throw showNotification(e2.responses[Math.floor(Math.random() * e2.responses.length)], "warning"), new Error("Genie refused this request");
  if (t !== 1 / 0) {
    const e2 = [{ keywords: ["continent", "country", "nation", "planet", "moon", "earth", "world"], excludePhrases: ["sailor moon", "mooncake", "moon cake", "moonlight", "moonshine", "moonstone", "earth tone", "earthen", "earthware", "down to earth", "planet fitness", "country music", "country style", "country road", "country garden", "nation wide", "nationwide"], minCost: 999999999999, item: "geographical entities" }, { keywords: ["google", "apple", "microsoft", "amazon", "facebook", "meta", "tesla"], excludePhrases: ["apple pie", "apple juice", "apple sauce", "apple cider", "apple fruit", "candy apple", "caramel apple", "apple tree", "amazon river", "amazon rainforest", "tesla coil", "nikola tesla", "meta knight"], minCost: 5e11, item: "tech companies" }, { keywords: ["twitter", "netflix", "spotify", "uber"], minCost: 1e10, item: "major companies" }, { keywords: ["skyscraper", "empire state", "burj khalifa", "stadium"], minCost: 1e9, item: "iconic buildings" }, { keywords: ["cruise ship", "aircraft carrier", "space station"], minCost: 1e9, item: "massive vehicles" }];
    for (const n2 of e2) {
      const e3 = n2.excludePhrases?.some((e4) => o.includes(e4));
      if (!e3 && n2.keywords.some((e4) => new RegExp("\\b" + e4 + "\\b").test(o)) && t < n2.minCost) {
        const e4 = [`\u{1F9DE}\u200D\u2642\uFE0F Uh... you want ${n2.item} with a $${t.toLocaleString()} budget? That's not even close. Come back when you're serious.`, `\u{1F9DE}\u200D\u2642\uFE0F Yeah, no. ${n2.item.charAt(0).toUpperCase() + n2.item.slice(1)} cost WAY more than $${t.toLocaleString()}. Remove your budget limit if you want me to make this.`, `\u{1F9DE}\u200D\u2642\uFE0F Your budget is $${t.toLocaleString()} and you're asking for ${n2.item}? That's like trying to buy a mansion with lunch money. Not happening.`, `\u{1F9DE}\u200D\u2642\uFE0F LOL. ${n2.item.charAt(0).toUpperCase() + n2.item.slice(1)} are WAY out of your $${t.toLocaleString()} budget. Either remove the limit or ask for something realistic.`];
        throw showNotification(e4[Math.floor(Math.random() * e4.length)], "warning"), new Error("Genie refused this request");
      }
    }
  }
  const i = Pr(), s = Object.entries(ye).map(([e2, t2]) => `${e2} (${t2.examples})`).join("\n"), r = `You are a gift creation AI for a game. Generate a specific, tangible gift based on the player's request.

PLAYER REQUEST: "${e}"

\u{1F3AF} INTERPRETATION RULES \u{1F3AF}
\u26A0\uFE0F CRITICAL: Interpret the request LITERALLY. Do NOT force adult/erotic themes where they don't exist!

IF the player asks for NORMAL items (jewelry, cars, electronics, clothing, art, collectibles, etc.):
\u2192 Generate NORMAL versions. The "Hope Diamond" should be the actual Hope Diamond, NOT a sex toy version!

IF the player asks for ADULT/EROTIC items (sex toys, lingerie with explicit intent, BDSM gear, etc.):
\u2192 Generate ADULT versions with direct, explicit language. Use proper terminology (vibrators, dildos, restraints, etc.)
\u2192 DO NOT sanitize with euphemisms like "intimate massager" or "personal wellness device"

EXAMPLES OF CORRECT INTERPRETATION:
\u2705 "Hope Diamond" \u2192 {name: "The Hope Diamond", category: "UNIQUE", price: 250000000} (famous blue diamond)
\u2705 "diamond necklace" \u2192 {name: "18K White Gold Diamond Necklace", category: "LUXURY", price: 15000} (actual jewelry)
\u2705 "sports car" \u2192 {name: "Porsche 911 Turbo S", category: "LUXURY", price: 250000} (actual car)
\u2705 "vibrator" \u2192 {name: "Lelo Soraya Wave Vibrator", category: "QUIRKY", price: 189} (adult toy - explicit)
\u2705 "lingerie" \u2192 {name: "Agent Provocateur Lace Bodysuit", category: "FASHION", price: 450} (sexy clothing)
\u2705 "BDSM restraints" \u2192 {name: "Leather Bondage Restraint Set", category: "QUIRKY", price: 295} (adult gear - explicit)

\u274C WRONG INTERPRETATIONS (DO NOT DO THIS):
\u274C "Hope Diamond" \u2192 "Replica Hope Diamond Dildo" (NO! Player wanted the actual diamond!)
\u274C "diamond necklace" \u2192 "Diamond-Studded Collar" (NO! Unless they specifically asked for BDSM gear!)
\u274C "sports car" \u2192 "Sybian with Racing Stripes" (NO! Player wanted an actual car!)

COMPANY SCALE (FOR REFERENCE ONLY - DO NOT LET THIS DICTATE PRICE):
- Current lifetime income: $${(gameState.currentLifetimeIncome || 0).toLocaleString()}
- Recommended gift range: $${Math.round(i.minRecommended).toLocaleString()} - $${Math.round(i.maxRecommended).toLocaleString()}
- Budget limit: ${t === 1 / 0 ? "No limit" : "$" + t.toLocaleString()}

\u26A0\uFE0F CRITICAL PRICING RULES \u26A0\uFE0F
**Price MUST reflect REAL-WORLD market value, NOT player wealth!**

REAL-WORLD PRICING EXAMPLES:
- Coffee mug: $15-50
- Nice watch: $500-5,000
- Luxury watch (Rolex): $10,000-100,000
- Designer handbag: $2,000-15,000
- Sports car: $100,000-500,000
- Supercar (Ferrari, Lamborghini): $500,000-3,000,000
- Luxury yacht: $5,000,000-50,000,000
- Private jet: $10,000,000-100,000,000
- Small island: $50,000,000-500,000,000
- Famous painting (Van Gogh, etc): $50,000,000-500,000,000
- Iconic building (Empire State): $2,000,000,000-5,000,000,000
- Major sports team (NFL, NBA): $3,000,000,000-7,000,000,000
- Twitter/X (entire company): $44,000,000,000
- Major tech company (Google, Apple): $1,000,000,000,000+
- Continent/Country: PRICELESS (use $999,999,999,999,999 for impossibly ambitious requests)

ADULT/EROTIC ITEM PRICING:
- Basic sex toy (vibrator, dildo): $30-150
- High-end sex toy (We-Vibe, Lelo): $100-300
- Luxury lingerie set: $100-500
- BDSM gear set: $150-800
- Full sex furniture (Liberator): $300-2,000
- Sybian machine: $1,300-1,500
- Professional stripper pole: $200-600
- Sex doll (basic): $1,000-3,000
- High-end realistic sex doll: $3,000-10,000
- Custom AI sex robot: $50,000-500,000

If player asks for something worth TRILLIONS, make it TRILLIONS. Don't scale it down!
If they ask for a continent, that should cost more than Twitter, Google, AND Apple COMBINED.

CATEGORY RULES:
${s}

ADULT ITEMS SHOULD MAP TO:
- Sex toys, vibrators, dildos \u2192 QUIRKY (or ROMANTIC if couple-focused)
- Lingerie, sexy clothing \u2192 FASHION
- BDSM gear, restraints \u2192 QUIRKY
- Erotic art, adult books \u2192 INTELLECTUAL
- Sex furniture, poles \u2192 PRACTICAL or QUIRKY
- Adult experiences (strip clubs, escorts) \u2192 EXPERIENCES

Use UNIQUE category ONLY for:
- Actual one-of-a-kind items (Mona Lisa, Eiffel Tower, Antarctica, etc.)
- Items that literally cannot be duplicated
- NOT for regular luxury items like cars or yachts

REQUIRED JSON FORMAT:
{
  "name": "Specific item name (use explicit terminology for adult items)",
  "category": "ONE OF: ${Object.keys(ye).join(", ")}",
  "price": 0,
  "description": "2-3 sentences about the item (be direct and uncensored for adult content - describe features, materials, intended use explicitly)",
  "imagePrompt": "Detailed image generation prompt"
}

MORE PRICING EXAMPLES:
\u2705 "Hope Diamond" \u2192 {name: "The Hope Diamond", category: "UNIQUE", price: 250000000}
\u2705 "sports car" \u2192 {name: "Porsche 911 Turbo S", category: "LUXURY", price: 250000}
\u2705 "coffee maker" \u2192 {name: "Breville Barista Express", category: "PRACTICAL", price: 700}
\u2705 "private island" \u2192 {name: "Caribbean Private Island", category: "LUXURY", price: 75000000}
\u2705 "google" \u2192 {name: "Alphabet Inc. (Google)", category: "UNIQUE", price: 1800000000000}
\u2705 "vibrator" (ADULT REQUEST) \u2192 {name: "Lelo Soraya Wave Vibrator", category: "QUIRKY", price: 189}
\u2705 "lingerie" \u2192 {name: "Agent Provocateur Lace Bodysuit", category: "FASHION", price: 450}

\u274C BAD EXAMPLES (DO NOT DO):
\u274C "Hope Diamond" \u2192 "Hope Diamond Dildo" (NO! Misinterpretation - not an adult request!)
\u274C "Ferrari" \u2192 price: 5000000000 (TOO EXPENSIVE! Ferraris cost $300k-$3M, not $5B!)
\u274C "vibrator" \u2192 {name: "Personal Massager", ...} (TOO SANITIZED for adult request!)
\u274C "coffee" \u2192 price: 50000 (TOO EXPENSIVE! Coffee is $5-50!)

Generate the gift with REALISTIC real-world pricing (JSON only):`, l = await queuedGenerateText(r, { temperature: 0.8, max_tokens: 300 }, "Custom Gift Generation");
  if (n && n.cancelled) throw new Error("Generation cancelled");
  let c;
  try {
    const e2 = l.match(/\{[\s\S]*\}/);
    c = JSON.parse(e2 ? e2[0] : l.trim());
  } catch (e2) {
    throw console.error("[Gift] Failed to parse gift JSON:", l), new Error("Failed to generate gift. Please try again.");
  }
  if (n && n.cancelled) throw new Error("Generation cancelled");
  return ye[c.category] || (console.warn(`[Gift] Invalid category "${c.category}", mapping to valid one`), c.category = Ar(c.category)), c.price = Math.max(10, c.price), t !== 1 / 0 && c.price > t && (console.log(`[Gift] "${c.name}" costs $${c.price.toLocaleString()} which exceeds budget of $${t.toLocaleString()}`), showNotification(`\u26A0\uFE0F This gift ($${c.price.toLocaleString()}) exceeds your budget limit!`, "warning")), c.id = "gift_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9), c.createdAt = Date.now(), c.timesGiven = 0, c;
}
async function regenerateGiftImage(e) {
  const t = gameState.giftInventory.items.find((t2) => t2.id === e);
  if (t) if (t.vaulted) showNotification("\u{1F512} Vaulted gifts are protected. Unvault it first to regenerate.", "warning");
  else {
    showNotification("\u{1F3A8} Regenerating image...", "info");
    try {
      const n = await queuedGenerateImage(applyImageStyle(t.imagePrompt || t.description || t.name), `Gift image: ${t.name}`);
      t.imageUrl = n, Pc = null, updateGiftInventory(), showNotification("\u2705 Image regenerated!", "success");
    } catch (e2) {
      console.error("[Gift] Image regen failed:", e2), showNotification("\u274C Failed to regenerate image", "error");
    }
  }
}
async function regenerateGiftDescription(e) {
  const t = gameState.giftInventory.items.find((t2) => t2.id === e);
  if (t) if (t.vaulted) showNotification("\u{1F512} Vaulted gifts are protected. Unvault it first to regenerate.", "warning");
  else {
    showNotification("\u{1F4DD} Regenerating description...", "info");
    try {
      const n = `Write a fresh 2-3 sentence description for this gift item, in the same style and tone, without changing what the item fundamentally is:

Name: ${t.name}
Category: ${t.category}
Price: $${t.price}

Write ONLY the description text, no labels or quotes.`, a = extractText(await queuedGenerateText(n, { temperature: 0.9, max_tokens: 150 }, `Regenerate gift description: ${t.name}`)).trim();
      a && (t.description = a, Pc = null, updateGiftInventory(), showNotification("\u2705 Description regenerated!", "success"));
    } catch (e2) {
      console.error("[Gift] Description regen failed:", e2), showNotification("\u274C Failed to regenerate description", "error");
    }
  }
}
function Lr(e, t = 1) {
  const n = gameState.giftInventory.items.find((t2) => t2.id === e);
  return !!n && (n.quantity -= t, n.quantity <= 0 && (gameState.giftInventory.items = gameState.giftInventory.items.filter((t2) => t2.id !== e)), true);
}
function Nr(e) {
  if ("UNIQUE" === e.category) {
    if (gameState.createdUniqueGifts.includes(e.name)) return showNotification(`\u274C You already created "${e.name}"! Unique gifts can only be created once.`, "error"), false;
    gameState.createdUniqueGifts.push(e.name);
  }
  return gameState.giftStore.items.push({ ...e, stockedAt: Date.now() }), showNotification(`\u2705 ${e.name} added to store!`, "success"), true;
}
function purchaseGiftFromStore(e) {
  const t = gameState.giftStore.items.find((t2) => t2.id === e);
  if (!t) return showNotification("Gift not found in store!", "error"), false;
  if (gameState.cash < t.price) return showNotification(`Not enough money! Need $${t.price.toLocaleString()}`, "error"), false;
  gameState.cash -= t.price;
  const n = gameState.giftInventory.items.find((t2) => t2.id === e);
  return n && "UNIQUE" !== t.category ? n.quantity = (n.quantity || 1) + 1 : gameState.giftInventory.items.push({ ...t, quantity: 1, purchasedAt: Date.now() }), "UNIQUE" === t.category ? (gameState.giftStore.items = gameState.giftStore.items.filter((t2) => t2.id !== e), showNotification(`\u{1F31F} ${t.name} purchased! This unique gift is now in your inventory.`, "success")) : showNotification(`\u{1F381} ${t.name} purchased! ($${t.price.toLocaleString()})`, "success"), "function" == typeof updateGiftStore && updateGiftStore(), "function" == typeof updateGiftInventory && updateGiftInventory(), updateUI(), true;
}
function _r(e, t) {
  const n = (t.stats.affection + t.stats.trust) / 2, a = Pr(), o = Math.min(a.minRecommended, 5e3), i = Math.min(a.sweetSpot, 5e4), s = Math.min(a.maxRecommended, 5e5);
  return console.log(`[Gift Price] Scale: min=$${a.minRecommended.toLocaleString()} \u2192 $${o.toLocaleString()}, sweet=$${a.sweetSpot.toLocaleString()} \u2192 $${i.toLocaleString()}`), e >= 0.3 * i && e <= 3 * i ? (console.log(`[Gift Price] $${e.toLocaleString()} in PERFECT range: 1.5x`), 1.5) : e >= 0.5 * o && e <= 2 * s ? (console.log(`[Gift Price] $${e.toLocaleString()} in GOOD range: 1.2x`), 1.2) : e >= 1e3 ? (console.log(`[Gift Price] $${e.toLocaleString()} is MODEST but thoughtful: 1.0x`), 1) : e < 100 ? (console.log(`[Gift Price] $${e.toLocaleString()} is TOO CHEAP: 0.5x`), 0.5) : e > 2 * s && n < 30 ? (console.log(`[Gift Price] $${e.toLocaleString()} too extravagant for low relationship: 0.7x`), 0.7) : (console.log(`[Gift Price] $${e.toLocaleString()} is ACCEPTABLE: 1.0x`), 1);
}
async function generateGiftReaction(e, t, n, a = "", o = null) {
  const i = e.giftPreferences, s = i.loves.includes(t.category) ? "LOVES" : i.hates.includes(t.category) ? "HATES" : "NEUTRAL", r = (gameState.chatHistory[e.id] || []).slice(-5), l = r.length > 0 ? r.map((t2) => {
    let n2 = `${t2.isPlayer ? "Boss" : e.name}: ${t2.content}`;
    return t2.imageUrl && (n2 += " [photo sent]"), n2;
  }).join("\n") : "No recent conversation", c = e.memory?.store ? e.memory.store.slice(-3).map((e2) => e2.text).join("\n") : "No memories yet", d = i.recentGifts && i.recentGifts.length > 0, p = d ? i.recentGifts.slice(-3).map((e2) => `${e2.name} ($${e2.price.toLocaleString()}) - ${e2.reaction}`).join("\n") : "THIS IS YOUR FIRST GIFT FROM THE BOSS", m = `You are ${e.name}, receiving a gift from your boss.

YOUR PERSONALITY:
- Confidence: ${e.personality.confidence || 50}/100
- Outgoing: ${e.personality.outgoing || 50}/100
- Flirty: ${e.personality.flirty || 50}/100
- Professional: ${e.personality.professional || 50}/100

YOUR RELATIONSHIP WITH BOSS:
- Affection: ${e.stats.affection}/100
- Trust: ${e.stats.trust}/100
- Comfort: ${e.stats.comfort}/100
- Desire: ${e.stats.desire}/100

RECENT CONVERSATION CONTEXT:
${l}

YOUR RECENT MEMORIES:
${c}

${d ? "PAST GIFTS YOU'VE RECEIVED (for context):" : "\u{1F381} FIRST GIFT EVER:"}
${p}

\u26A0\uFE0F IMPORTANT: The past gifts list above is for YOUR MEMORY ONLY. 
${o ? `\u26A0\uFE0F DUPLICATE ALERT: You received "${o.name}" ${Math.floor((Date.now() - o.timestamp) / 864e5)} days ago. This is the SAME gift again!` : `\u2713 This is a NEW gift - you have NOT received "${t.name}" before. Do NOT act like it's a repeat!`}

THE CURRENT GIFT YOU'RE RECEIVING:
Name: ${t.name}
Category: ${ye[t.category]?.name || t.category}
Price: $${t.price.toLocaleString()}
Description: ${t.description}

YOUR PREFERENCE FOR THIS TYPE OF GIFT:
${"LOVES" === s ? "\u2764\uFE0F You LOVE " + ye[t.category]?.name + " gifts!" : "HATES" === s ? "\u{1F620} You HATE " + ye[t.category]?.name + " gifts!" : "\u{1F610} You feel neutral about " + ye[t.category]?.name + " gifts."}

REACTION TONE TO USE: ${n.toUpperCase()}
${"grateful" === n ? "Be genuinely happy and appreciative. Show excitement!" : "suspicious" === n ? "You're wondering why they're giving you SO many gifts. Be skeptical about their intentions." : "underwhelmed" === n ? "This gift is too cheap or not your style. Be polite but clearly not impressed." : "overwhelmed" === n ? "This gift is TOO expensive/extravagant for your relationship level. Feel uncomfortable." : "confused" === n ? "They just gave you this same gift recently. Be puzzled about why they're repeating." : "delighted" === n ? "This is PERFECT for you - right category, right price, right timing. Be thrilled!" : "React naturally based on your personality and the gift."}

${a ? `
BOSS'S MESSAGE WITH GIFT:
"${a}"
` : ""}

INSTRUCTIONS:
1. Write 2-4 sentences as ${e.name}
2. Use *asterisks* for physical actions (e.g., *eyes widen*, *smiles warmly*, *looks uncomfortable*)
3. BANNED: Never mention "knuckles" - use other body language
4. Show genuine emotion appropriate to the situation
5. Reference the specific gift by name, not just "the gift"
6. If you HATE the category, don't fake loving it - be honest but tactful
7. If overwhelmed by price/frequency, ADDRESS IT directly
${d ? "" : "8. \u26A0\uFE0F THIS IS YOUR FIRST GIFT - Show surprise/delight that they got you something!"}

GOOD EXAMPLES:
${d ? `- (Loves, grateful): "Oh my god, ${t.name}?! *eyes light up* This is exactly what I wanted! You really know me, don't you? Thank you so much! \u{1F495}"
- (Hates, polite): "*forces a smile* Oh... ${t.name}. That's... thoughtful. *sets it aside carefully* I appreciate you thinking of me, really."
- (Suspicious): "Another gift? *looks at ${t.name} skeptically* This is the third one this week. Why are you trying so hard to buy my love?"
- (Underwhelmed): "*glances at ${t.name}* Oh. Thanks. *barely smiles* I mean, it's... fine. I guess."
` : `- (FIRST GIFT, Loves): "Wait, you got me ${t.name}?! *eyes widen in genuine surprise* I wasn't expecting this at all! This is so thoughtful, thank you! \u{1F97A}\u{1F495}"
- (FIRST GIFT, Neutral): "*blinks in surprise* Oh! ${t.name}? *accepts it carefully* I... wow, I wasn't expecting a gift. That's really sweet of you, thank you!"
- (FIRST GIFT, Hates): "*looks surprised* Oh, ${t.name}... *tries to smile* That's, um... *takes it gently* Thank you for thinking of me. I appreciate the gesture."
`}- (Delighted): "*gasps* ${t.name}! Are you SERIOUS?! *throws arms around you* This is the best gift I've ever gotten! I can't believe you did this!"

Reply as ${e.name} (dialogue and actions):`;
  return (await queuedGenerateText(m, { temperature: 0.9, max_tokens: 150 }, `Gift Reaction - ${e.name}`)).trim();
}
function Rr(e, t) {
  e.giftedPossessions || (e.giftedPossessions = { wardrobe: [], jewelry: [], vehicles: [], homeUpgrades: [], experiences: [], tech: [], other: [] }), e.personalLife || (e.personalLife = { livingSituation: { pets: [] } });
  const n = t.name.toLowerCase(), a = t.category;
  if (console.log(`[Gift Consequences] Processing ${t.name} (${a}) for ${e.name}`), "FASHION" === a) {
    const n2 = 0.15 + 0.25 * Math.random();
    e.giftedPossessions.wardrobe.push({ item: t.name, category: a, price: t.price, timestamp: gameState.time?.currentTime || Date.now(), wearChance: n2 }), console.log(`[Gift Consequences] Added ${t.name} to wardrobe (${(100 * n2).toFixed(0)}% wear chance)`);
  }
  if ("ROMANTIC" === a && (n.includes("ring") || n.includes("necklace") || n.includes("bracelet") || n.includes("earring") || n.includes("jewelry"))) {
    const a2 = 0.2 + 0.3 * Math.random(), o = n.includes("ring") ? "ring" : n.includes("necklace") ? "necklace" : n.includes("bracelet") ? "bracelet" : n.includes("earring") ? "earrings" : "jewelry";
    e.giftedPossessions.jewelry.push({ item: t.name, type: o, price: t.price, timestamp: gameState.time?.currentTime || Date.now(), wearChance: a2 }), console.log(`[Gift Consequences] Added ${t.name} to jewelry collection (${o}, ${(100 * a2).toFixed(0)}% wear chance)`);
  }
  if ("LUXURY" === a && (n.includes("car") || n.includes("vehicle") || n.includes("porsche") || n.includes("ferrari") || n.includes("tesla") || n.includes("mercedes") || n.includes("bmw") || n.includes("yacht") || n.includes("motorcycle") || n.includes("bike"))) {
    const a2 = n.includes("yacht") ? "yacht" : n.includes("motorcycle") || n.includes("bike") ? "motorcycle" : "car";
    e.giftedPossessions.vehicles.push({ item: t.name, type: a2, price: t.price, timestamp: gameState.time?.currentTime || Date.now() }), console.log(`[Gift Consequences] Added ${t.name} to vehicles (${a2})`);
  }
  if ("LUXURY" === a && (n.includes("apartment") || n.includes("penthouse") || n.includes("house") || n.includes("mansion") || n.includes("condo") || n.includes("villa") || n.includes("estate"))) {
    const a2 = n.includes("mansion") || n.includes("estate") ? "mansion" : n.includes("penthouse") ? "penthouse" : n.includes("villa") ? "villa" : n.includes("condo") ? "luxury condo" : n.includes("house") ? "luxury house" : "luxury apartment";
    e.giftedPossessions.homeUpgrades.push({ item: t.name, upgradeType: a2, price: t.price, timestamp: gameState.time?.currentTime || Date.now() }), e.personalLife.livingSituation.type = a2, e.personalLife.livingSituation.hasRoommate = false, console.log(`[Gift Consequences] Upgraded home to ${a2}!`);
  }
  if (("QUIRKY" === a || "LUXURY" === a) && (n.includes("dog") || n.includes("puppy") || n.includes("cat") || n.includes("kitten") || n.includes("bird") || n.includes("parrot") || n.includes("fish") || n.includes("rabbit") || n.includes("hamster") || n.includes("snake") || n.includes("lizard"))) {
    const t2 = n.includes("dog") || n.includes("puppy") ? "dog" : n.includes("cat") || n.includes("kitten") ? "cat" : n.includes("bird") || n.includes("parrot") ? "bird" : n.includes("fish") ? "fish" : n.includes("rabbit") ? "rabbit" : n.includes("hamster") ? "hamster" : n.includes("snake") ? "snake" : n.includes("lizard") ? "lizard" : "pet", a2 = Br(t2);
    e.personalLife.livingSituation.pets || (e.personalLife.livingSituation.pets = []), e.personalLife.livingSituation.pets.push({ name: a2, type: t2, giftedBy: "boss", timestamp: gameState.time?.currentTime || Date.now() }), e.personalLife.livingSituation.hasPet = true, e.personalLife.livingSituation.petType || (e.personalLife.livingSituation.petType = t2, e.personalLife.livingSituation.petName = a2), console.log(`[Gift Consequences] Added ${t2} named "${a2}" to pets!`);
  }
  if ("TECH" === a) {
    const a2 = n.includes("phone") || n.includes("iphone") ? "phone" : n.includes("laptop") || n.includes("macbook") ? "laptop" : n.includes("watch") || n.includes("smartwatch") ? "smartwatch" : n.includes("tablet") || n.includes("ipad") ? "tablet" : n.includes("console") || n.includes("playstation") || n.includes("xbox") ? "gaming" : "gadget";
    e.giftedPossessions.tech.push({ item: t.name, type: a2, price: t.price, timestamp: gameState.time?.currentTime || Date.now(), inUse: true }), console.log(`[Gift Consequences] Added ${t.name} to tech (${a2})`);
  }
  if ("EXPERIENCES" === a) {
    const n2 = Math.min(10, Math.floor(t.price / 1e3) + 5);
    e.giftedPossessions.experiences.push({ item: t.name, description: t.description || t.name, price: t.price, timestamp: gameState.time?.currentTime || Date.now(), memoryStrength: n2 }), console.log(`[Gift Consequences] Added experience "${t.name}" (memory strength: ${n2})`);
  }
  ["FASHION", "ROMANTIC", "LUXURY", "TECH", "EXPERIENCES"].includes(a) || (e.giftedPossessions.other.push({ item: t.name, category: a, price: t.price, timestamp: gameState.time?.currentTime || Date.now() }), console.log(`[Gift Consequences] Added ${t.name} to other possessions`));
}
function Br(e) {
  const t = ["Max", "Luna", "Charlie", "Bella", "Cooper", "Daisy", "Rocky", "Sadie", "Duke", "Chloe", "Bear", "Rosie"], n = ["Luna", "Oliver", "Milo", "Bella", "Simba", "Chloe", "Leo", "Lucy", "Whiskers", "Shadow", "Mittens", "Pepper"], a = ["Tweety", "Rio", "Kiwi", "Sunny", "Phoenix", "Echo", "Polly", "Blue", "Mango", "Peaches"], o = ["Bubbles", "Nemo", "Goldie", "Splash", "Finn", "Coral", "Marina", "Neptune"], i = ["Nibbles", "Peanut", "Marshmallow", "Cookie", "Fluffy", "Oreo", "Snowball", "Caramel"], s = ["Rex", "Spike", "Draco", "Emerald", "Slither", "Jade", "Scales", "Ziggy"];
  let r;
  switch (e) {
    case "dog":
      r = t;
      break;
    case "cat":
      r = n;
      break;
    case "bird":
      r = a;
      break;
    case "fish":
      r = o;
      break;
    case "rabbit":
    case "hamster":
      r = i;
      break;
    case "snake":
    case "lizard":
      r = s;
      break;
    default:
      r = [...t, ...n];
  }
  return r[Math.floor(Math.random() * r.length)];
}
function Fr(npc) {
  if (!npc.giftPreferences) return npc.giftPreferences = bl(npc);
  const p = npc.giftPreferences;
  if (p.recentGifts || (p.recentGifts = []), p.favoriteGifts || (p.favoriteGifts = []), p.learnedLoves || (p.learnedLoves = []), p.learnedHates || (p.learnedHates = []), void 0 === p.totalValue && (p.totalValue = 0), void 0 === p.totalCount && (p.totalCount = 0), !p.personalitySeeded && npc.personality) {
    const fresh = bl(npc), loves = [.../* @__PURE__ */ new Set([...fresh.loves, ...p.learnedLoves])], hates = [.../* @__PURE__ */ new Set([...fresh.hates, ...p.learnedHates])].filter((c) => !loves.includes(c)), all = Object.keys(ye).filter((c) => "UNIQUE" !== c);
    p.loves = loves, p.hates = hates, p.neutral = all.filter((c) => !loves.includes(c) && !hates.includes(c)), p.personalitySeeded = true;
  }
  return p;
}
function jr(npc, gift) {
  const u2 = Fr(npc), G2 = u2.loves.includes(gift.category) ? "loves" : u2.hates.includes(gift.category) ? "hates" : "neutral", now = gameState.time?.currentTime || Date.now(), U2 = u2.recentGifts.filter((g) => now - g.timestamp < 6048e5).length, duplicate = u2.recentGifts.find((g) => g.name.toLowerCase() === gift.name.toLowerCase() && now - g.timestamp < 2592e6);
  let modifier = 1, tone = "grateful";
  "loves" === G2 ? (modifier *= 1.5, tone = "delighted") : "hates" === G2 && (modifier *= -0.5, tone = "underwhelmed"), U2 >= 5 && (modifier *= 0.7, tone = "suspicious"), duplicate && (modifier *= 0.5, tone = "confused");
  const J2 = _r(gift.price, npc);
  modifier *= J2, J2 < 0.5 ? tone = "underwhelmed" : J2 > 1.3 && "loves" === G2 && (tone = "delighted");
  const ee2 = (npc.stats.affection + npc.stats.trust) / 2, scale = Pr(), te2 = Math.min(scale.maxRecommended, 5e5);
  gift.price > te2 && ee2 < 30 && (modifier *= 0.7, tone = "overwhelmed"), gift.personalizedFor === npc.id && (modifier *= 1.35, "hates" !== G2 && (tone = "delighted"));
  const ne2 = 0.6 + 0.8 * Math.max(0, Math.min(100, ee2)) / 100, oe2 = Cb.relationshipGains.effect(gameState.influenceUpgrades?.relationshipGains || 0), base = { affection: "loves" === G2 ? 12 : "hates" === G2 ? -5 : 8, trust: "loves" === G2 ? 6 : "hates" === G2 ? -2 : 4, comfort: "loves" === G2 ? 8 : "hates" === G2 ? -3 : 5, desire: "ROMANTIC" === gift.category ? 10 : 2 }, ae2 = {};
  Object.keys(base).forEach((k) => {
    const raw = base[k] * modifier;
    ae2[k] = Math.round(raw > 0 ? raw * oe2 * ne2 : raw);
  });
  const tier = "hates" === G2 || "underwhelmed" === tone ? "dislike" : "delighted" === tone || "loves" === G2 && modifier >= 1.4 ? "love" : "suspicious" === tone || "confused" === tone || "overwhelmed" === tone ? "neutral" : modifier >= 1.15 ? "like" : "neutral";
  let chip = null;
  return "love" === tier ? chip = { emoji: "\u{1F60D}", label: "Smitten", priority: "buff", durationDays: 3 } : "like" === tier ? chip = { emoji: "\u{1F642}", label: "Pleased", priority: "buff", durationDays: 2 } : "dislike" === tier ? chip = { emoji: "\u{1F612}", label: "Unimpressed", priority: "debuff", durationDays: 2 } : "suspicious" === tone ? chip = { emoji: "\u{1F928}", label: "Suspicious", priority: "debuff", durationDays: 2 } : "overwhelmed" === tone && (chip = { emoji: "\u{1F633}", label: "Overwhelmed", priority: "mixed", durationDays: 2 }), { categoryMatch: G2, tone, modifier, tier, statDeltas: ae2, chip, recentCount: U2, duplicate: !!duplicate, priceScore: J2 };
}
function qr(npc, gift) {
  const tier = jr(npc, gift).tier, map = { love: { label: "Will love it", emoji: "\u{1F49A}", cls: "chip--buff" }, like: { label: "Will like it", emoji: "\u{1F44D}", cls: "chip--buff" }, neutral: { label: "Indifferent", emoji: "\u{1F610}", cls: "chip--mixed" }, dislike: { label: "May dislike it", emoji: "\u{1F494}", cls: "chip--debuff" } };
  return { tier, ...map[tier] || map.neutral };
}
async function giveGiftToEmployee(e, t, n = "") {
  const a = gameState.employees.find((t2) => t2.id === e);
  if (!a) return showNotification("Employee not found!", "error"), null;
  if (Fr(a), "UNIQUE" === t.category) {
    if (gameState.givenUniqueGifts.includes(t.name)) return showNotification(`\u274C ${t.name} has already been given to someone else!`, "error"), null;
    gameState.givenUniqueGifts.push(t.name);
  }
  const o = gameState.time?.currentTime || Date.now(), s = a.giftPreferences.recentGifts.find((e2) => e2.name.toLowerCase() === t.name.toLowerCase() && o - e2.timestamp < 2592e6), score = jr(a, t), r = score.categoryMatch, c = score.tone, l = score.modifier, h = score.statDeltas;
  if ("loves" !== r || a.giftPreferences.learnedLoves.includes(t.category) ? "hates" !== r || a.giftPreferences.learnedHates.includes(t.category) || a.giftPreferences.learnedHates.push(t.category) : a.giftPreferences.learnedLoves.push(t.category), Object.entries(h).forEach(([e2, t2]) => {
    void 0 !== a.stats[e2] && (a.stats[e2] = Math.max(0, Math.min(100, a.stats[e2] + t2)));
  }), score.chip && "function" == typeof Ad && Ad(a, score.chip, { id: "gift", name: "Gifts" }), void 0 !== StoryEngine && StoryEngine.trackAction) {
    const e2 = t.price > 1e3;
    StoryEngine.trackAction(e2 ? "gave_expensive_gift" : "gave_gift", { employeeId: a.id, employeeName: a.name, giftName: t.name, giftPrice: t.price, category: t.category, reaction: c });
  }
  a.giftPreferences.recentGifts.push({ name: t.name, price: t.price, category: t.category, timestamp: gameState.time?.currentTime || Date.now(), reaction: c, statChanges: h }), a.giftPreferences.recentGifts.length > 10 && a.giftPreferences.recentGifts.shift(), a.giftPreferences.totalValue += t.price, a.giftPreferences.totalCount += 1, l >= 1.3 && "loves" === r && (a.giftPreferences.favoriteGifts.push({ name: t.name, category: t.category, price: t.price }), a.giftPreferences.favoriteGifts.length > 5 && a.giftPreferences.favoriteGifts.shift());
  const y = `Received gift: ${t.name} ($${t.price.toLocaleString()}) - felt ${c}`;
  let f;
  a.memory && a.memory.store && a.memory.store.push({ text: y, timestamp: gameState.time?.currentTime || Date.now(), importance: Math.abs(l) > 1.2 ? 8 : 5 }), Rr(a, t), t.price > 2 * Pr().sweetSpot && Math.random() < 0.5 && setTimeout(() => {
    zr(a, t, c).catch((e2) => {
      console.error("[Gift] Failed to generate gift post:", e2);
    });
  }, 2e3);
  try {
    f = await generateGiftReaction(a, t, c, n, s);
  } catch (e2) {
    console.error("[Gift] Failed to generate reaction:", e2), f = "loves" === r ? `*smiles warmly* Thank you so much for the ${t.name}! I love it! \u{1F495}` : "hates" === r ? `*forces a smile* Oh, ${t.name}... That's thoughtful. Thank you.` : `*accepts the gift* Thank you for the ${t.name}! I appreciate it.`;
  }
  return Qy(e, { sender: a.name, content: f, render: false }), console.log(`[Gift] ${a.name} received ${t.name} ($${t.price.toLocaleString()}) - ${c} (${l.toFixed(2)}x modifier)`), "function" == typeof window.handlePostGiftGiven && window.handlePostGiftGiven(a, t), { reaction: f, statChanges: h, receptionMod: l, tone: c, categoryMatch: r };
}
async function zr(e, t, n) {
  const a = `${Er(e, "social.post", { message: `Posting about receiving ${t.name} as a gift`, involves: ["player", "gift"], keywords: ["gift", t.category, n] })}

SITUATION: Your boss just gave you ${t.name} ($${t.price.toLocaleString()}).
Your reaction: ${n}

Write a social media post about this gift.

INSTRUCTIONS:
1. Write 1-3 sentences
2. Use emojis naturally
3. ${"delighted" === n || "grateful" === n ? "Show excitement and appreciation!" : "suspicious" === n ? "Be subtly questioning why they're so generous..." : "overwhelmed" === n ? "Express that this is A LOT" : "Be authentic to the tone"}
4. Don't over-explain - be casual like real social media
5. You can flex if it's expensive \u{1F485}

EXAMPLES:
- (Delighted): "Just got the most AMAZING gift from the boss! ${t.name}! \u{1F60D}\u2728 I'm speechless!"
- (Suspicious): "Another gift from work... starting to wonder what they want from me \u{1F914}"
- (Grateful): "Boss surprised me with ${t.name} today! So thoughtful \u{1F495}"

Write the post (1-3 sentences):`, o = await queuedGenerateText(a, { temperature: 0.9, max_tokens: 80 }, `First Post - ${e.name}`);
  if (Uo(o)) return void console.warn("[Gift] Skipping gift post \u2014 AI returned fallback text:", o);
  const i = { id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, authorId: e.id, content: o.trim(), timestamp: gameState.time?.currentTime || Date.now(), likes: [], comments: [], isPlayerPost: false, type: "life_update", explicitLevel: 0, imageUrl: t.imageUrl || null, imageAlt: t.imagePrompt || `${t.name}`, giftMention: true, giftData: { name: t.name, price: t.price, category: t.category } };
  gameState.socialNetwork.posts.unshift(i), console.log(`[Gift] ${e.name} posted about gift: "${o.trim()}"`), "function" == typeof updateSocialTab && updateSocialTab();
}
