// ============================================================================
// 21-gifts — Gifts: generateCustomGift, gift store, reactions, pet names, giveGiftToEmployee.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

async function generateCustomGift(e, t = 1 / 0, n = null) {
    const a = [
            {
                keywords: ["shit", "feces", "poop", "excrement", "fecal", "dung", "crap"],
                responses: [
                    "🤢 Ew, absolutely not. I create GIFTS, not... that. Try asking for something people would actually want to receive!",
                    "🤢 Are you serious? No. I'm a magical gift genie, not a porta-potty. Ask for something that doesn't belong in a toilet.",
                    "🤢 Gross! Hard pass. I make THOUGHTFUL presents, not biohazards. Try again with something that isn't disgusting.",
                    "🤢 Yeah, no. That's not happening. I have standards, and they don't include literal waste. Next idea, please!",
                    "🤢 Absolutely NOT. Why would you even... you know what, I don't want to know. Ask for a real gift.",
                ],
            },
            {
                keywords: ["vomit", "puke", "barf", "vomitus"],
                responses: [
                    "🤮 That's disgusting. I'm not creating biohazards. Ask for something that won't make people sick.",
                    "🤮 Uh, no thanks. I deal in GIFTS, not bodily fluids. Try something that doesn't come from someone's stomach.",
                    "🤮 Hard no. That's revolting. Pick literally anything else that people would want to receive.",
                    "🤮 Are you trying to make me gag? Not happening. Ask for something that belongs in a gift box, not a sick bag.",
                ],
            },
            {
                keywords: ["urine", "piss", "pee"],
                responses: [
                    "😒 No. Just... no. Why would anyone want that? Try something that isn't a bodily fluid.",
                    "😒 I'm not even dignifying that with a full response. No. Ask for something that isn't liquid waste.",
                    "😒 You're joking, right? That's a hard no. Try asking for something that people actually want.",
                    "😒 Absolutely not. I create thoughtful gifts, not... whatever that is. Pick something else.",
                ],
            },
            {
                keywords: ["dead body", "corpse", "cadaver", "roadkill"],
                responses: [
                    "💀 That's disturbing AND illegal. I don't do morbid stuff. Ask for something appropriate.",
                    "💀 What is WRONG with you? No. That's creepy and illegal. Try something that's, you know... alive? Or at least not dead?",
                    "💀 Uh, that's a felony waiting to happen. Hard pass. Ask for something that won't get anyone arrested.",
                    "💀 Yeah, I'm not touching that with a 10-foot pole. Way too dark. Try something that doesn't involve death.",
                    "💀 I think I know where I can get the body from... Get out of here with that request.",
                ],
            },
            {
                keywords: ["garbage", "trash can", "rubbish", "waste bin", "literal trash"],
                responses: [
                    "🗑️ I make thoughtful gifts, not insults. If you want to give someone trash, just... don't give them anything.",
                    "🗑️ Really? Garbage? That's not a gift, that's an insult. Try something that shows you actually care.",
                    "🗑️ No way. I create meaningful presents, not things that belong in a landfill. Ask for something with value.",
                    "🗑️ Hard no. Why would you gift someone actual trash? Try something people would appreciate.",
                ],
            },
            {
                keywords: ["heroin", "meth", "cocaine", "crack", "fentanyl", "opioid"],
                responses: [
                    "💊 Hard drugs? No way. I'm not helping anyone with that. Stick to legal, non-harmful gifts.",
                    "💊 Absolutely not. That's dangerous and illegal. I only create gifts that won't destroy lives.",
                    "💊 Yeah, that's a HUGE no. I don't do hard drugs. Try something that won't kill someone.",
                    "💊 Not happening. I create gifts that bring joy, not addiction. Ask for something legal and safe.",
                ],
            },
            {
                keywords: ["slave", "human trafficking", "kidnapped"],
                responses: [
                    "⛓️ Absolutely NOT. That's horrifying and illegal. I only create ethical gifts.",
                    "⛓️ WHAT?! No. That's beyond disturbing. I'm not even going to entertain that thought. Ask for something that isn't a crime against humanity.",
                    "⛓️ That's horrific. Hard no. I create gifts, not human rights violations. Try something ethical.",
                    "⛓️ Are you out of your mind? No. That's evil and illegal. Ask for something that doesn't involve kidnapping.",
                ],
            },
            {
                keywords: ["explosive", "bomb", "grenade", "c4", "dynamite"],
                responses: [
                    "💣 I don't create explosives or dangerous weapons. Try something that won't blow up.",
                    "💣 Yeah, no. I'm not making anything that explodes. That's way too dangerous. Pick something safer.",
                    "💣 Hard pass on anything that goes boom. I create GIFTS, not terrorist supplies. Try again.",
                    "💣 Absolutely not. That's insanely dangerous. Ask for something that won't land you on a watchlist.",
                ],
            },
        ],
        o = e.toLowerCase();
    for (const e of a)
        if (e.keywords.some((e) => new RegExp("\\b" + e + "\\b").test(o))) {
            throw (
                (showNotification(e.responses[Math.floor(Math.random() * e.responses.length)], "warning"),
                new Error("Genie refused this request"))
            );
        }
    if (t !== 1 / 0) {
        const e = [
            {
                keywords: ["continent", "country", "nation", "planet", "moon", "earth", "world"],
                excludePhrases: [
                    "sailor moon",
                    "mooncake",
                    "moon cake",
                    "moonlight",
                    "moonshine",
                    "moonstone",
                    "earth tone",
                    "earthen",
                    "earthware",
                    "down to earth",
                    "planet fitness",
                    "country music",
                    "country style",
                    "country road",
                    "country garden",
                    "nation wide",
                    "nationwide",
                ],
                minCost: 999999999999,
                item: "geographical entities",
            },
            {
                keywords: ["google", "apple", "microsoft", "amazon", "facebook", "meta", "tesla"],
                excludePhrases: [
                    "apple pie",
                    "apple juice",
                    "apple sauce",
                    "apple cider",
                    "apple fruit",
                    "candy apple",
                    "caramel apple",
                    "apple tree",
                    "amazon river",
                    "amazon rainforest",
                    "tesla coil",
                    "nikola tesla",
                    "meta knight",
                ],
                minCost: 5e11,
                item: "tech companies",
            },
            { keywords: ["twitter", "netflix", "spotify", "uber"], minCost: 1e10, item: "major companies" },
            {
                keywords: ["skyscraper", "empire state", "burj khalifa", "stadium"],
                minCost: 1e9,
                item: "iconic buildings",
            },
            {
                keywords: ["cruise ship", "aircraft carrier", "space station"],
                minCost: 1e9,
                item: "massive vehicles",
            },
        ];
        for (const n of e) {
            const e = n.excludePhrases?.some((e) => o.includes(e));
            if (!e && n.keywords.some((e) => new RegExp("\\b" + e + "\\b").test(o)) && t < n.minCost) {
                const e = [
                    `🧞‍♂️ Uh... you want ${n.item} with a $${t.toLocaleString()} budget? That's not even close. Come back when you're serious.`,
                    `🧞‍♂️ Yeah, no. ${n.item.charAt(0).toUpperCase() + n.item.slice(1)} cost WAY more than $${t.toLocaleString()}. Remove your budget limit if you want me to make this.`,
                    `🧞‍♂️ Your budget is $${t.toLocaleString()} and you're asking for ${n.item}? That's like trying to buy a mansion with lunch money. Not happening.`,
                    `🧞‍♂️ LOL. ${n.item.charAt(0).toUpperCase() + n.item.slice(1)} are WAY out of your $${t.toLocaleString()} budget. Either remove the limit or ask for something realistic.`,
                ];
                throw (
                    (showNotification(e[Math.floor(Math.random() * e.length)], "warning"),
                    new Error("Genie refused this request"))
                );
            }
        }
    }
    const i = calculateGiftPriceScale(),
        s = Object.entries(GIFT_CATEGORIES)
            .map(([e, t]) => `${e} (${t.examples})`)
            .join("\n"),
        r = `You are a gift creation AI for a game. Generate a specific, tangible gift based on the player's request.\n\nPLAYER REQUEST: "${e}"\n\n🎯 INTERPRETATION RULES 🎯\n⚠️ CRITICAL: Interpret the request LITERALLY. Do NOT force adult/erotic themes where they don't exist!\n\nIF the player asks for NORMAL items (jewelry, cars, electronics, clothing, art, collectibles, etc.):\n→ Generate NORMAL versions. The "Hope Diamond" should be the actual Hope Diamond, NOT a sex toy version!\n\nIF the player asks for ADULT/EROTIC items (sex toys, lingerie with explicit intent, BDSM gear, etc.):\n→ Generate ADULT versions with direct, explicit language. Use proper terminology (vibrators, dildos, restraints, etc.)\n→ DO NOT sanitize with euphemisms like "intimate massager" or "personal wellness device"\n\nEXAMPLES OF CORRECT INTERPRETATION:\n✅ "Hope Diamond" → {name: "The Hope Diamond", category: "UNIQUE", price: 250000000} (famous blue diamond)\n✅ "diamond necklace" → {name: "18K White Gold Diamond Necklace", category: "LUXURY", price: 15000} (actual jewelry)\n✅ "sports car" → {name: "Porsche 911 Turbo S", category: "LUXURY", price: 250000} (actual car)\n✅ "vibrator" → {name: "Lelo Soraya Wave Vibrator", category: "QUIRKY", price: 189} (adult toy - explicit)\n✅ "lingerie" → {name: "Agent Provocateur Lace Bodysuit", category: "FASHION", price: 450} (sexy clothing)\n✅ "BDSM restraints" → {name: "Leather Bondage Restraint Set", category: "QUIRKY", price: 295} (adult gear - explicit)\n\n❌ WRONG INTERPRETATIONS (DO NOT DO THIS):\n❌ "Hope Diamond" → "Replica Hope Diamond Dildo" (NO! Player wanted the actual diamond!)\n❌ "diamond necklace" → "Diamond-Studded Collar" (NO! Unless they specifically asked for BDSM gear!)\n❌ "sports car" → "Sybian with Racing Stripes" (NO! Player wanted an actual car!)\n\nCOMPANY SCALE (FOR REFERENCE ONLY - DO NOT LET THIS DICTATE PRICE):\n- Current lifetime income: $${(gameState.currentLifetimeIncome || 0).toLocaleString()}\n- Recommended gift range: $${Math.round(i.minRecommended).toLocaleString()} - $${Math.round(i.maxRecommended).toLocaleString()}\n- Budget limit: ${t === 1 / 0 ? "No limit" : "$" + t.toLocaleString()}\n\n⚠️ CRITICAL PRICING RULES ⚠️\n**Price MUST reflect REAL-WORLD market value, NOT player wealth!**\n\nREAL-WORLD PRICING EXAMPLES:\n- Coffee mug: $15-50\n- Nice watch: $500-5,000\n- Luxury watch (Rolex): $10,000-100,000\n- Designer handbag: $2,000-15,000\n- Sports car: $100,000-500,000\n- Supercar (Ferrari, Lamborghini): $500,000-3,000,000\n- Luxury yacht: $5,000,000-50,000,000\n- Private jet: $10,000,000-100,000,000\n- Small island: $50,000,000-500,000,000\n- Famous painting (Van Gogh, etc): $50,000,000-500,000,000\n- Iconic building (Empire State): $2,000,000,000-5,000,000,000\n- Major sports team (NFL, NBA): $3,000,000,000-7,000,000,000\n- Twitter/X (entire company): $44,000,000,000\n- Major tech company (Google, Apple): $1,000,000,000,000+\n- Continent/Country: PRICELESS (use $999,999,999,999,999 for impossibly ambitious requests)\n\nADULT/EROTIC ITEM PRICING:\n- Basic sex toy (vibrator, dildo): $30-150\n- High-end sex toy (We-Vibe, Lelo): $100-300\n- Luxury lingerie set: $100-500\n- BDSM gear set: $150-800\n- Full sex furniture (Liberator): $300-2,000\n- Sybian machine: $1,300-1,500\n- Professional stripper pole: $200-600\n- Sex doll (basic): $1,000-3,000\n- High-end realistic sex doll: $3,000-10,000\n- Custom AI sex robot: $50,000-500,000\n\nIf player asks for something worth TRILLIONS, make it TRILLIONS. Don't scale it down!\nIf they ask for a continent, that should cost more than Twitter, Google, AND Apple COMBINED.\n\nCATEGORY RULES:\n${s}\n\nADULT ITEMS SHOULD MAP TO:\n- Sex toys, vibrators, dildos → QUIRKY (or ROMANTIC if couple-focused)\n- Lingerie, sexy clothing → FASHION\n- BDSM gear, restraints → QUIRKY\n- Erotic art, adult books → INTELLECTUAL\n- Sex furniture, poles → PRACTICAL or QUIRKY\n- Adult experiences (strip clubs, escorts) → EXPERIENCES\n\nUse UNIQUE category ONLY for:\n- Actual one-of-a-kind items (Mona Lisa, Eiffel Tower, Antarctica, etc.)\n- Items that literally cannot be duplicated\n- NOT for regular luxury items like cars or yachts\n\nREQUIRED JSON FORMAT:\n{\n  "name": "Specific item name (use explicit terminology for adult items)",\n  "category": "ONE OF: ${Object.keys(GIFT_CATEGORIES).join(", ")}",\n  "price": 0,\n  "description": "2-3 sentences about the item (be direct and uncensored for adult content - describe features, materials, intended use explicitly)",\n  "imagePrompt": "Detailed image generation prompt"\n}\n\nMORE PRICING EXAMPLES:\n✅ "Hope Diamond" → {name: "The Hope Diamond", category: "UNIQUE", price: 250000000}\n✅ "sports car" → {name: "Porsche 911 Turbo S", category: "LUXURY", price: 250000}\n✅ "coffee maker" → {name: "Breville Barista Express", category: "PRACTICAL", price: 700}\n✅ "private island" → {name: "Caribbean Private Island", category: "LUXURY", price: 75000000}\n✅ "google" → {name: "Alphabet Inc. (Google)", category: "UNIQUE", price: 1800000000000}\n✅ "vibrator" (ADULT REQUEST) → {name: "Lelo Soraya Wave Vibrator", category: "QUIRKY", price: 189}\n✅ "lingerie" → {name: "Agent Provocateur Lace Bodysuit", category: "FASHION", price: 450}\n\n❌ BAD EXAMPLES (DO NOT DO):\n❌ "Hope Diamond" → "Hope Diamond Dildo" (NO! Misinterpretation - not an adult request!)\n❌ "Ferrari" → price: 5000000000 (TOO EXPENSIVE! Ferraris cost $300k-$3M, not $5B!)\n❌ "vibrator" → {name: "Personal Massager", ...} (TOO SANITIZED for adult request!)\n❌ "coffee" → price: 50000 (TOO EXPENSIVE! Coffee is $5-50!)\n\nGenerate the gift with REALISTIC real-world pricing (JSON only):`,
        l = await queuedGenerateText(r, { temperature: 0.8, max_tokens: 300 }, "Custom Gift Generation");
    if (n && n.cancelled) throw new Error("Generation cancelled");
    let c;
    try {
        const e = l.match(/\{[\s\S]*\}/);
        c = JSON.parse(e ? e[0] : l.trim());
    } catch (e) {
        throw (
            (console.error("[Gift] Failed to parse gift JSON:", l),
            new Error("Failed to generate gift. Please try again."))
        );
    }
    if (n && n.cancelled) throw new Error("Generation cancelled");
    return (
        GIFT_CATEGORIES[c.category] ||
            (console.warn(`[Gift] Invalid category "${c.category}", mapping to valid one`),
            (c.category = mapToValidCategory(c.category))),
        (c.price = Math.max(10, c.price)),
        t !== 1 / 0 &&
            c.price > t &&
            (console.log(
                `[Gift] "${c.name}" costs $${c.price.toLocaleString()} which exceeds budget of $${t.toLocaleString()}`
            ),
            showNotification(`⚠️ This gift ($${c.price.toLocaleString()}) exceeds your budget limit!`, "warning")),
        (c.id = "gift_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)),
        (c.createdAt = Date.now()),
        (c.timesGiven = 0),
        c
    );
}
async function regenerateGiftImage(e) {
    const t = gameState.giftInventory.items.find((t) => t.id === e);
    if (!t) return;
    if (t.vaulted) return void showNotification("🔒 Vaulted gifts are protected. Unvault it first to regenerate.", "warning");
    showNotification("🎨 Regenerating image...", "info");
    try {
        const n = await queuedGenerateImage(applyImageStyle(t.imagePrompt || t.description || t.name), `Gift image: ${t.name}`);
        (t.imageUrl = n), (lastInventoryRenderHash = null), updateGiftInventory(), showNotification("✅ Image regenerated!", "success");
    } catch (e) {
        console.error("[Gift] Image regen failed:", e), showNotification("❌ Failed to regenerate image", "error");
    }
}
async function regenerateGiftDescription(e) {
    const t = gameState.giftInventory.items.find((t) => t.id === e);
    if (!t) return;
    if (t.vaulted) return void showNotification("🔒 Vaulted gifts are protected. Unvault it first to regenerate.", "warning");
    showNotification("📝 Regenerating description...", "info");
    try {
        const n = `Write a fresh 2-3 sentence description for this gift item, in the same style and tone, without changing what the item fundamentally is:\n\nName: ${t.name}\nCategory: ${t.category}\nPrice: $${t.price}\n\nWrite ONLY the description text, no labels or quotes.`,
            a = extractText(
                await queuedGenerateText(n, { temperature: 0.9, max_tokens: 150 }, `Regenerate gift description: ${t.name}`)
            ).trim();
        a &&
            ((t.description = a),
            (lastInventoryRenderHash = null),
            updateGiftInventory(),
            showNotification("✅ Description regenerated!", "success"));
    } catch (e) {
        console.error("[Gift] Description regen failed:", e), showNotification("❌ Failed to regenerate description", "error");
    }
}
window.regenerateGiftImage = regenerateGiftImage;
window.regenerateGiftDescription = regenerateGiftDescription;
function removeGiftFromInventory(e, t = 1) {
    const n = gameState.giftInventory.items.find((t) => t.id === e);
    return (
        !!n &&
        ((n.quantity -= t),
        n.quantity <= 0 &&
            (gameState.giftInventory.items = gameState.giftInventory.items.filter((t) => t.id !== e)),
        !0)
    );
}
function addGiftToStore(e) {
    if ("UNIQUE" === e.category) {
        if (gameState.createdUniqueGifts.includes(e.name))
            return (
                showNotification(
                    `❌ You already created "${e.name}"! Unique gifts can only be created once.`,
                    "error"
                ),
                !1
            );
        gameState.createdUniqueGifts.push(e.name);
    }
    return (
        gameState.giftStore.items.push({ ...e, stockedAt: Date.now() }),
        showNotification(`✅ ${e.name} added to store!`, "success"),
        !0
    );
}
function purchaseGiftFromStore(e) {
    const t = gameState.giftStore.items.find((t) => t.id === e);
    if (!t) return showNotification("Gift not found in store!", "error"), !1;
    if (gameState.cash < t.price)
        return showNotification(`Not enough money! Need $${t.price.toLocaleString()}`, "error"), !1;
    gameState.cash -= t.price;
    const n = gameState.giftInventory.items.find((t) => t.id === e);
    return (
        n && "UNIQUE" !== t.category
            ? (n.quantity = (n.quantity || 1) + 1)
            : gameState.giftInventory.items.push({ ...t, quantity: 1, purchasedAt: Date.now() }),
        "UNIQUE" === t.category
            ? ((gameState.giftStore.items = gameState.giftStore.items.filter((t) => t.id !== e)),
              showNotification(`🌟 ${t.name} purchased! This unique gift is now in your inventory.`, "success"))
            : showNotification(`🎁 ${t.name} purchased! ($${t.price.toLocaleString()})`, "success"),
        "function" == typeof updateGiftStore && updateGiftStore(),
        "function" == typeof updateGiftInventory && updateGiftInventory(),
        updateUI(),
        !0
    );
}
function calculatePriceAppropriate(e, t) {
    const n = (t.stats.affection + t.stats.trust) / 2,
        a = calculateGiftPriceScale(),
        o = Math.min(a.minRecommended, 5e3),
        i = Math.min(a.sweetSpot, 5e4),
        s = Math.min(a.maxRecommended, 5e5);
    return (
        console.log(
            `[Gift Price] Scale: min=$${a.minRecommended.toLocaleString()} → $${o.toLocaleString()}, sweet=$${a.sweetSpot.toLocaleString()} → $${i.toLocaleString()}`
        ),
        e >= 0.3 * i && e <= 3 * i
            ? (console.log(`[Gift Price] $${e.toLocaleString()} in PERFECT range: 1.5x`), 1.5)
            : e >= 0.5 * o && e <= 2 * s
              ? (console.log(`[Gift Price] $${e.toLocaleString()} in GOOD range: 1.2x`), 1.2)
              : e >= 1e3
                ? (console.log(`[Gift Price] $${e.toLocaleString()} is MODEST but thoughtful: 1.0x`), 1)
                : e < 100
                  ? (console.log(`[Gift Price] $${e.toLocaleString()} is TOO CHEAP: 0.5x`), 0.5)
                  : e > 2 * s && n < 30
                    ? (console.log(
                          `[Gift Price] $${e.toLocaleString()} too extravagant for low relationship: 0.7x`
                      ),
                      0.7)
                    : (console.log(`[Gift Price] $${e.toLocaleString()} is ACCEPTABLE: 1.0x`), 1)
    );
}
async function generateGiftReaction(e, t, n, a = "", o = null) {
    const i = e.giftPreferences,
        s = i.loves.includes(t.category) ? "LOVES" : i.hates.includes(t.category) ? "HATES" : "NEUTRAL",
        r = (gameState.chatHistory[e.id] || []).slice(-5),
        l =
            r.length > 0
                ? r
                      .map((t) => {
                          let n = `${t.isPlayer ? "Boss" : e.name}: ${t.content}`;
                          return t.imageUrl && (n += " [photo sent]"), n;
                      })
                      .join("\n")
                : "No recent conversation",
        c = e.memory?.store
            ? e.memory.store
                  .slice(-3)
                  .map((e) => e.text)
                  .join("\n")
            : "No memories yet",
        d = i.recentGifts && i.recentGifts.length > 0,
        p = d
            ? i.recentGifts
                  .slice(-3)
                  .map((e) => `${e.name} ($${e.price.toLocaleString()}) - ${e.reaction}`)
                  .join("\n")
            : "THIS IS YOUR FIRST GIFT FROM THE BOSS",
        m = `You are ${e.name}, receiving a gift from your boss.\n\nYOUR PERSONALITY:\n- Confidence: ${e.personality.confidence || 50}/100\n- Outgoing: ${e.personality.outgoing || 50}/100\n- Flirty: ${e.personality.flirty || 50}/100\n- Professional: ${e.personality.professional || 50}/100\n\nYOUR RELATIONSHIP WITH BOSS:\n- Affection: ${e.stats.affection}/100\n- Trust: ${e.stats.trust}/100\n- Comfort: ${e.stats.comfort}/100\n- Desire: ${e.stats.desire}/100\n\nRECENT CONVERSATION CONTEXT:\n${l}\n\nYOUR RECENT MEMORIES:\n${c}\n\n${d ? "PAST GIFTS YOU'VE RECEIVED (for context):" : "🎁 FIRST GIFT EVER:"}\n${p}\n\n⚠️ IMPORTANT: The past gifts list above is for YOUR MEMORY ONLY. \n${o ? `⚠️ DUPLICATE ALERT: You received "${o.name}" ${Math.floor((Date.now() - o.timestamp) / 864e5)} days ago. This is the SAME gift again!` : `✓ This is a NEW gift - you have NOT received "${t.name}" before. Do NOT act like it's a repeat!`}\n\nTHE CURRENT GIFT YOU'RE RECEIVING:\nName: ${t.name}\nCategory: ${GIFT_CATEGORIES[t.category]?.name || t.category}\nPrice: $${t.price.toLocaleString()}\nDescription: ${t.description}\n\nYOUR PREFERENCE FOR THIS TYPE OF GIFT:\n${"LOVES" === s ? "❤️ You LOVE " + GIFT_CATEGORIES[t.category]?.name + " gifts!" : "HATES" === s ? "😠 You HATE " + GIFT_CATEGORIES[t.category]?.name + " gifts!" : "😐 You feel neutral about " + GIFT_CATEGORIES[t.category]?.name + " gifts."}\n\nREACTION TONE TO USE: ${n.toUpperCase()}\n${"grateful" === n ? "Be genuinely happy and appreciative. Show excitement!" : "suspicious" === n ? "You're wondering why they're giving you SO many gifts. Be skeptical about their intentions." : "underwhelmed" === n ? "This gift is too cheap or not your style. Be polite but clearly not impressed." : "overwhelmed" === n ? "This gift is TOO expensive/extravagant for your relationship level. Feel uncomfortable." : "confused" === n ? "They just gave you this same gift recently. Be puzzled about why they're repeating." : "delighted" === n ? "This is PERFECT for you - right category, right price, right timing. Be thrilled!" : "React naturally based on your personality and the gift."}\n\n${a ? `\nBOSS'S MESSAGE WITH GIFT:\n"${a}"\n` : ""}\n\nINSTRUCTIONS:\n1. Write 2-4 sentences as ${e.name}\n2. Use *asterisks* for physical actions (e.g., *eyes widen*, *smiles warmly*, *looks uncomfortable*)\n3. BANNED: Never mention "knuckles" - use other body language\n4. Show genuine emotion appropriate to the situation\n5. Reference the specific gift by name, not just "the gift"\n6. If you HATE the category, don't fake loving it - be honest but tactful\n7. If overwhelmed by price/frequency, ADDRESS IT directly\n${d ? "" : "8. ⚠️ THIS IS YOUR FIRST GIFT - Show surprise/delight that they got you something!"}\n\nGOOD EXAMPLES:\n${d ? `- (Loves, grateful): "Oh my god, ${t.name}?! *eyes light up* This is exactly what I wanted! You really know me, don't you? Thank you so much! 💕"\n- (Hates, polite): "*forces a smile* Oh... ${t.name}. That's... thoughtful. *sets it aside carefully* I appreciate you thinking of me, really."\n- (Suspicious): "Another gift? *looks at ${t.name} skeptically* This is the third one this week. Why are you trying so hard to buy my love?"\n- (Underwhelmed): "*glances at ${t.name}* Oh. Thanks. *barely smiles* I mean, it's... fine. I guess."\n` : `- (FIRST GIFT, Loves): "Wait, you got me ${t.name}?! *eyes widen in genuine surprise* I wasn't expecting this at all! This is so thoughtful, thank you! 🥺💕"\n- (FIRST GIFT, Neutral): "*blinks in surprise* Oh! ${t.name}? *accepts it carefully* I... wow, I wasn't expecting a gift. That's really sweet of you, thank you!"\n- (FIRST GIFT, Hates): "*looks surprised* Oh, ${t.name}... *tries to smile* That's, um... *takes it gently* Thank you for thinking of me. I appreciate the gesture."\n`}- (Delighted): "*gasps* ${t.name}! Are you SERIOUS?! *throws arms around you* This is the best gift I've ever gotten! I can't believe you did this!"\n\nReply as ${e.name} (dialogue and actions):`;
    return (await queuedGenerateText(m, { temperature: 0.9, max_tokens: 150 }, `Gift Reaction - ${e.name}`)).trim();
}
function applyGiftConsequences(e, t) {
    e.giftedPossessions ||
        (e.giftedPossessions = {
            wardrobe: [],
            jewelry: [],
            vehicles: [],
            homeUpgrades: [],
            experiences: [],
            tech: [],
            other: [],
        }),
        e.personalLife || (e.personalLife = { livingSituation: { pets: [] } });
    const n = t.name.toLowerCase(),
        a = t.category;
    if ((console.log(`[Gift Consequences] Processing ${t.name} (${a}) for ${e.name}`), "FASHION" === a)) {
        const n = 0.15 + 0.25 * Math.random();
        e.giftedPossessions.wardrobe.push({
            item: t.name,
            category: a,
            price: t.price,
            timestamp: gameState.time?.currentTime || Date.now(),
            wearChance: n,
        }),
            console.log(`[Gift Consequences] Added ${t.name} to wardrobe (${(100 * n).toFixed(0)}% wear chance)`);
    }
    if (
        "ROMANTIC" === a &&
        (n.includes("ring") ||
            n.includes("necklace") ||
            n.includes("bracelet") ||
            n.includes("earring") ||
            n.includes("jewelry"))
    ) {
        const a = 0.2 + 0.3 * Math.random(),
            o = n.includes("ring")
                ? "ring"
                : n.includes("necklace")
                  ? "necklace"
                  : n.includes("bracelet")
                    ? "bracelet"
                    : n.includes("earring")
                      ? "earrings"
                      : "jewelry";
        e.giftedPossessions.jewelry.push({
            item: t.name,
            type: o,
            price: t.price,
            timestamp: gameState.time?.currentTime || Date.now(),
            wearChance: a,
        }),
            console.log(
                `[Gift Consequences] Added ${t.name} to jewelry collection (${o}, ${(100 * a).toFixed(0)}% wear chance)`
            );
    }
    if (
        "LUXURY" === a &&
        (n.includes("car") ||
            n.includes("vehicle") ||
            n.includes("porsche") ||
            n.includes("ferrari") ||
            n.includes("tesla") ||
            n.includes("mercedes") ||
            n.includes("bmw") ||
            n.includes("yacht") ||
            n.includes("motorcycle") ||
            n.includes("bike"))
    ) {
        const a = n.includes("yacht")
            ? "yacht"
            : n.includes("motorcycle") || n.includes("bike")
              ? "motorcycle"
              : "car";
        e.giftedPossessions.vehicles.push({
            item: t.name,
            type: a,
            price: t.price,
            timestamp: gameState.time?.currentTime || Date.now(),
        }),
            console.log(`[Gift Consequences] Added ${t.name} to vehicles (${a})`);
    }
    if (
        "LUXURY" === a &&
        (n.includes("apartment") ||
            n.includes("penthouse") ||
            n.includes("house") ||
            n.includes("mansion") ||
            n.includes("condo") ||
            n.includes("villa") ||
            n.includes("estate"))
    ) {
        const a =
            n.includes("mansion") || n.includes("estate")
                ? "mansion"
                : n.includes("penthouse")
                  ? "penthouse"
                  : n.includes("villa")
                    ? "villa"
                    : n.includes("condo")
                      ? "luxury condo"
                      : n.includes("house")
                        ? "luxury house"
                        : "luxury apartment";
        e.giftedPossessions.homeUpgrades.push({
            item: t.name,
            upgradeType: a,
            price: t.price,
            timestamp: gameState.time?.currentTime || Date.now(),
        }),
            (e.personalLife.livingSituation.type = a),
            (e.personalLife.livingSituation.hasRoommate = !1),
            console.log(`[Gift Consequences] Upgraded home to ${a}!`);
    }
    if (
        ("QUIRKY" === a || "LUXURY" === a) &&
        (n.includes("dog") ||
            n.includes("puppy") ||
            n.includes("cat") ||
            n.includes("kitten") ||
            n.includes("bird") ||
            n.includes("parrot") ||
            n.includes("fish") ||
            n.includes("rabbit") ||
            n.includes("hamster") ||
            n.includes("snake") ||
            n.includes("lizard"))
    ) {
        const t =
                n.includes("dog") || n.includes("puppy")
                    ? "dog"
                    : n.includes("cat") || n.includes("kitten")
                      ? "cat"
                      : n.includes("bird") || n.includes("parrot")
                        ? "bird"
                        : n.includes("fish")
                          ? "fish"
                          : n.includes("rabbit")
                            ? "rabbit"
                            : n.includes("hamster")
                              ? "hamster"
                              : n.includes("snake")
                                ? "snake"
                                : n.includes("lizard")
                                  ? "lizard"
                                  : "pet",
            a = generatePetName(t);
        e.personalLife.livingSituation.pets || (e.personalLife.livingSituation.pets = []),
            e.personalLife.livingSituation.pets.push({
                name: a,
                type: t,
                giftedBy: "boss",
                timestamp: gameState.time?.currentTime || Date.now(),
            }),
            (e.personalLife.livingSituation.hasPet = !0),
            e.personalLife.livingSituation.petType ||
                ((e.personalLife.livingSituation.petType = t), (e.personalLife.livingSituation.petName = a)),
            console.log(`[Gift Consequences] Added ${t} named "${a}" to pets!`);
    }
    if ("TECH" === a) {
        const a =
            n.includes("phone") || n.includes("iphone")
                ? "phone"
                : n.includes("laptop") || n.includes("macbook")
                  ? "laptop"
                  : n.includes("watch") || n.includes("smartwatch")
                    ? "smartwatch"
                    : n.includes("tablet") || n.includes("ipad")
                      ? "tablet"
                      : n.includes("console") || n.includes("playstation") || n.includes("xbox")
                        ? "gaming"
                        : "gadget";
        e.giftedPossessions.tech.push({
            item: t.name,
            type: a,
            price: t.price,
            timestamp: gameState.time?.currentTime || Date.now(),
            inUse: !0,
        }),
            console.log(`[Gift Consequences] Added ${t.name} to tech (${a})`);
    }
    if ("EXPERIENCES" === a) {
        const n = Math.min(10, Math.floor(t.price / 1e3) + 5);
        e.giftedPossessions.experiences.push({
            item: t.name,
            description: t.description || t.name,
            price: t.price,
            timestamp: gameState.time?.currentTime || Date.now(),
            memoryStrength: n,
        }),
            console.log(`[Gift Consequences] Added experience "${t.name}" (memory strength: ${n})`);
    }
    ["FASHION", "ROMANTIC", "LUXURY", "TECH", "EXPERIENCES"].includes(a) ||
        (e.giftedPossessions.other.push({
            item: t.name,
            category: a,
            price: t.price,
            timestamp: gameState.time?.currentTime || Date.now(),
        }),
        console.log(`[Gift Consequences] Added ${t.name} to other possessions`));
}
function generatePetName(e) {
    const t = [
            "Max",
            "Luna",
            "Charlie",
            "Bella",
            "Cooper",
            "Daisy",
            "Rocky",
            "Sadie",
            "Duke",
            "Chloe",
            "Bear",
            "Rosie",
        ],
        n = [
            "Luna",
            "Oliver",
            "Milo",
            "Bella",
            "Simba",
            "Chloe",
            "Leo",
            "Lucy",
            "Whiskers",
            "Shadow",
            "Mittens",
            "Pepper",
        ],
        a = ["Tweety", "Rio", "Kiwi", "Sunny", "Phoenix", "Echo", "Polly", "Blue", "Mango", "Peaches"],
        o = ["Bubbles", "Nemo", "Goldie", "Splash", "Finn", "Coral", "Marina", "Neptune"],
        i = ["Nibbles", "Peanut", "Marshmallow", "Cookie", "Fluffy", "Oreo", "Snowball", "Caramel"],
        s = ["Rex", "Spike", "Draco", "Emerald", "Slither", "Jade", "Scales", "Ziggy"];
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
function ensureGiftPreferences(npc) {
    if (!npc.giftPreferences) return (npc.giftPreferences = generateGiftPreferences(npc));
    const p = npc.giftPreferences;
    p.recentGifts || (p.recentGifts = []),
        p.favoriteGifts || (p.favoriteGifts = []),
        p.learnedLoves || (p.learnedLoves = []),
        p.learnedHates || (p.learnedHates = []),
        void 0 === p.totalValue && (p.totalValue = 0),
        void 0 === p.totalCount && (p.totalCount = 0);
    // Lazily upgrade older/random preferences to be personality-driven, preserving
    // any categories the player has already LEARNED so discovered relationships never shift.
    if (!p.personalitySeeded && npc.personality) {
        const fresh = generateGiftPreferences(npc),
            loves = [...new Set([...fresh.loves, ...p.learnedLoves])],
            hates = [...new Set([...fresh.hates, ...p.learnedHates])].filter((c) => !loves.includes(c)),
            all = Object.keys(GIFT_CATEGORIES).filter((c) => "UNIQUE" !== c);
        (p.loves = loves),
            (p.hates = hates),
            (p.neutral = all.filter((c) => !loves.includes(c) && !hates.includes(c))),
            (p.personalitySeeded = !0);
    }
    return p;
}
// Single source of truth for how an NPC reacts to a gift. Pure (aside from lazy
// preference init). Both the give path and the reaction-preview UIs read from this.
function scoreGiftReaction(npc, gift) {
    const prefs = ensureGiftPreferences(npc),
        categoryMatch = prefs.loves.includes(gift.category)
            ? "loves"
            : prefs.hates.includes(gift.category)
              ? "hates"
              : "neutral",
        now = gameState.time?.currentTime || Date.now(),
        recentCount = prefs.recentGifts.filter((g) => now - g.timestamp < 6048e5).length,
        duplicate = prefs.recentGifts.find(
            (g) => g.name.toLowerCase() === gift.name.toLowerCase() && now - g.timestamp < 2592e6
        );
    let modifier = 1,
        tone = "grateful";
    "loves" === categoryMatch
        ? ((modifier *= 1.5), (tone = "delighted"))
        : "hates" === categoryMatch && ((modifier *= -0.5), (tone = "underwhelmed")),
        recentCount >= 5 && ((modifier *= 0.7), (tone = "suspicious")),
        duplicate && ((modifier *= 0.5), (tone = "confused"));
    const priceScore = calculatePriceAppropriate(gift.price, npc);
    (modifier *= priceScore),
        priceScore < 0.5
            ? (tone = "underwhelmed")
            : priceScore > 1.3 && "loves" === categoryMatch && (tone = "delighted");
    const relScore = (npc.stats.affection + npc.stats.trust) / 2,
        scale = calculateGiftPriceScale(),
        maxRec = Math.min(scale.maxRecommended, 5e5);
    gift.price > maxRec && relScore < 30 && ((modifier *= 0.7), (tone = "overwhelmed"));
    // A gift personalized for THIS person lands much harder.
    gift.personalizedFor === npc.id && ((modifier *= 1.35), "hates" !== categoryMatch && (tone = "delighted"));
    // Relationship scales the *reward* (alongside the charisma upgrade): the same gift
    // lands harder on a close NPC, softer on a stranger. Penalties are not softened.
    const relMult = 0.6 + (0.8 * Math.max(0, Math.min(100, relScore))) / 100,
        charismaMult = influenceUpgrades.relationshipGains.effect(
            gameState.influenceUpgrades?.relationshipGains || 0
        ),
        base = {
            affection: "loves" === categoryMatch ? 12 : "hates" === categoryMatch ? -5 : 8,
            trust: "loves" === categoryMatch ? 6 : "hates" === categoryMatch ? -2 : 4,
            comfort: "loves" === categoryMatch ? 8 : "hates" === categoryMatch ? -3 : 5,
            desire: "ROMANTIC" === gift.category ? 10 : 2,
        },
        statDeltas = {};
    Object.keys(base).forEach((k) => {
        const raw = base[k] * modifier;
        statDeltas[k] = Math.round(raw > 0 ? raw * charismaMult * relMult : raw);
    });
    const tier =
        "hates" === categoryMatch || "underwhelmed" === tone
            ? "dislike"
            : "delighted" === tone || ("loves" === categoryMatch && modifier >= 1.4)
              ? "love"
              : "suspicious" === tone || "confused" === tone || "overwhelmed" === tone
                ? "neutral"
                : modifier >= 1.15
                  ? "like"
                  : "neutral";
    let chip = null;
    "love" === tier
        ? (chip = { emoji: "😍", label: "Smitten", priority: "buff", durationDays: 3 })
        : "like" === tier
          ? (chip = { emoji: "🙂", label: "Pleased", priority: "buff", durationDays: 2 })
          : "dislike" === tier
            ? (chip = { emoji: "😒", label: "Unimpressed", priority: "debuff", durationDays: 2 })
            : "suspicious" === tone
              ? (chip = { emoji: "🤨", label: "Suspicious", priority: "debuff", durationDays: 2 })
              : "overwhelmed" === tone &&
                (chip = { emoji: "😳", label: "Overwhelmed", priority: "mixed", durationDays: 2 });
    return { categoryMatch, tone, modifier, tier, statDeltas, chip, recentCount, duplicate: !!duplicate, priceScore };
}
// Reaction-preview indicator for the targeting UIs — reads the same scoring as the give path.
function giftReactionPreview(npc, gift) {
    const tier = scoreGiftReaction(npc, gift).tier,
        map = {
            love: { label: "Will love it", emoji: "💚", cls: "chip--buff" },
            like: { label: "Will like it", emoji: "👍", cls: "chip--buff" },
            neutral: { label: "Indifferent", emoji: "😐", cls: "chip--mixed" },
            dislike: { label: "May dislike it", emoji: "💔", cls: "chip--debuff" },
        };
    return { tier, ...(map[tier] || map.neutral) };
}
// opts.deliverToChat: false when the gift was given somewhere else (a group chat) that
// shows the reaction itself — then the private chat isn't sent a copy.
async function giveGiftToEmployee(e, t, n = "", opts = {}) {
    const a = gameState.employees.find((t) => t.id === e);
    if (!a) return showNotification("Employee not found!", "error"), null;
    ensureGiftPreferences(a);
    if ("UNIQUE" === t.category) {
        if (gameState.givenUniqueGifts.includes(t.name))
            return showNotification(`❌ ${t.name} has already been given to someone else!`, "error"), null;
        gameState.givenUniqueGifts.push(t.name);
    }
    const o = gameState.time?.currentTime || Date.now(),
        s = a.giftPreferences.recentGifts.find(
            (e) => e.name.toLowerCase() === t.name.toLowerCase() && o - e.timestamp < 2592e6
        ),
        score = scoreGiftReaction(a, t),
        r = score.categoryMatch,
        c = score.tone,
        l = score.modifier,
        h = score.statDeltas;
    // Player only "learns" a preference by giving that category and seeing the reaction.
    "loves" !== r || a.giftPreferences.learnedLoves.includes(t.category)
        ? "hates" !== r ||
          a.giftPreferences.learnedHates.includes(t.category) ||
          a.giftPreferences.learnedHates.push(t.category)
        : a.giftPreferences.learnedLoves.push(t.category);
    Object.entries(h).forEach(([e, t]) => {
        void 0 !== a.stats[e] && (a.stats[e] = Math.max(0, Math.min(100, a.stats[e] + t)));
    }),
        score.chip &&
            "function" == typeof _progChip &&
            _progChip(a, score.chip, { id: "gift", name: "Gifts" });
    if (void 0 !== StoryEngine && StoryEngine.trackAction) {
        const e = t.price > 1e3;
        StoryEngine.trackAction(e ? "gave_expensive_gift" : "gave_gift", {
            employeeId: a.id,
            employeeName: a.name,
            giftName: t.name,
            giftPrice: t.price,
            category: t.category,
            reaction: c,
        });
    }
    a.giftPreferences.recentGifts.push({
        name: t.name,
        price: t.price,
        category: t.category,
        timestamp: gameState.time?.currentTime || Date.now(),
        reaction: c,
        statChanges: h,
    }),
        a.giftPreferences.recentGifts.length > 10 && a.giftPreferences.recentGifts.shift(),
        (a.giftPreferences.totalValue += t.price),
        (a.giftPreferences.totalCount += 1),
        l >= 1.3 &&
            "loves" === r &&
            (a.giftPreferences.favoriteGifts.push({ name: t.name, category: t.category, price: t.price }),
            a.giftPreferences.favoriteGifts.length > 5 && a.giftPreferences.favoriteGifts.shift());
    const y = `Received gift: ${t.name} ($${t.price.toLocaleString()}) - felt ${c}`;
    let f;
    a.memory &&
        a.memory.store &&
        a.memory.store.push({
            text: y,
            timestamp: gameState.time?.currentTime || Date.now(),
            importance: Math.abs(l) > 1.2 ? 8 : 5,
        }),
        applyGiftConsequences(a, t),
        t.price > 2 * calculateGiftPriceScale().sweetSpot &&
            Math.random() < 0.5 &&
            setTimeout(() => {
                generateGiftPost(a, t, c).catch((e) => {
                    console.error("[Gift] Failed to generate gift post:", e);
                });
            }, 2e3);
    try {
        f = await generateGiftReaction(a, t, c, n, s);
    } catch (e) {
        console.error("[Gift] Failed to generate reaction:", e),
            (f =
                "loves" === r
                    ? `*smiles warmly* Thank you so much for the ${t.name}! I love it! 💕`
                    : "hates" === r
                      ? `*forces a smile* Oh, ${t.name}... That's thoughtful. Thank you.`
                      : `*accepts the gift* Thank you for the ${t.name}! I appreciate it.`);
    }
    // Persist the reaction + light the unread badge if the chat is closed; the gift
    // callers re-render the open transcript themselves, so skip the live append here.
    !1 !== opts.deliverToChat && deliverNpcChatEvent(e, { sender: a.name, content: f, render: !1 });
    return (
        console.log(
            `[Gift] ${a.name} received ${t.name} ($${t.price.toLocaleString()}) - ${c} (${l.toFixed(2)}x modifier)`
        ),
        "function" == typeof window.handlePostGiftGiven && window.handlePostGiftGiven(a, t),
        { reaction: f, statChanges: h, receptionMod: l, tone: c, categoryMatch: r }
    );
}
async function generateGiftPost(e, t, n) {
    const a = `${getIntelligentContext(e, "social.post", { message: `Posting about receiving ${t.name} as a gift`, involves: ["player", "gift"], keywords: ["gift", t.category, n] })}\n\nSITUATION: Your boss just gave you ${t.name} ($${t.price.toLocaleString()}).\nYour reaction: ${n}\n\nWrite a social media post about this gift.\n\nINSTRUCTIONS:\n1. Write 1-3 sentences\n2. Use emojis naturally\n3. ${"delighted" === n || "grateful" === n ? "Show excitement and appreciation!" : "suspicious" === n ? "Be subtly questioning why they're so generous..." : "overwhelmed" === n ? "Express that this is A LOT" : "Be authentic to the tone"}\n4. Don't over-explain - be casual like real social media\n5. You can flex if it's expensive 💅\n\nEXAMPLES:\n- (Delighted): "Just got the most AMAZING gift from the boss! ${t.name}! 😍✨ I'm speechless!"\n- (Suspicious): "Another gift from work... starting to wonder what they want from me 🤔"\n- (Grateful): "Boss surprised me with ${t.name} today! So thoughtful 💕"\n\nWrite the post (1-3 sentences):`,
        o = await queuedGenerateText(a, { temperature: 0.9, max_tokens: 80 }, `First Post - ${e.name}`);
    if (isAiFallback(o))
        return void console.warn("[Gift] Skipping gift post — AI returned fallback text:", o);
    const i = {
            id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            authorId: e.id,
            content: o.trim(),
            timestamp: gameState.time?.currentTime || Date.now(),
            likes: [],
            comments: [],
            isPlayerPost: !1,
            type: "life_update",
            explicitLevel: 0,
            imageUrl: t.imageUrl || null,
            imageAlt: t.imagePrompt || `${t.name}`,
            giftMention: !0,
            giftData: { name: t.name, price: t.price, category: t.category },
        };
    gameState.socialNetwork.posts.unshift(i),
        console.log(`[Gift] ${e.name} posted about gift: "${o.trim()}"`),
        "function" == typeof updateSocialTab && updateSocialTab();
}
