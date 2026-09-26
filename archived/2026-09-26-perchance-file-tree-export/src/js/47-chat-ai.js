// ============================================================================
// 47-chat-ai — Chat AI: response generation, proactive DMs, money requests, image generation, scene visualization, stats updates.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

async function xf(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  if (!t) return void showNotification("\u274C Employee not found!", "error");
  const n = await Iv("How much do you want to send?", `\u{1F4B5} Send Money to ${t.name}`, { defaultValue: "1000", type: "number", placeholder: "Enter amount..." });
  if (!n) return;
  const a = parseInt(n);
  if (isNaN(a) || a <= 0) return void showNotification("\u274C Invalid amount!", "error");
  if (gameState.cash < a) return void showNotification(`\u274C Not enough cash! You have $${xu(gameState.cash)}`, "error");
  gameState.cash -= a, t.bankBalance || (t.bankBalance = 0), t.bankBalance += a;
  const o = Math.min(20, Math.floor(a / 1e3)), i = Math.min(10, Math.floor(a / 2e3)), s = Math.min(12, Math.floor(a / 1500));
  t.stats.affection = Math.min(100, (t.stats.affection || 0) + o), t.stats.trust = Math.min(100, (t.stats.trust || 0) + i), t.stats.desire = Math.min(100, (t.stats.desire || 0) + s), updateUI(), showNotification(`\u{1F4B0} Sent $${xu(a)} to ${t.name}
+${o} Affection, +${i} Trust`, "success");
}
function kf(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  t ? (gameState.activeChat = t, "function" == typeof window.openGiftSelectionModal ? window.openGiftSelectionModal() : showNotification("\u274C Gift system not available!", "error")) : showNotification("\u274C Employee not found!", "error");
}
let Sf = null;
function togglePostActionsMenu(e) {
  const t = document.getElementById(`postActionsMenu_${e}`);
  t && (Sf !== e ? (closePostActionsMenu(), t.style.display = "block", Sf = e, setTimeout(() => {
    document.addEventListener("click", Tf);
  }, 10)) : closePostActionsMenu());
}
function closePostActionsMenu() {
  if (Sf) {
    const e = document.getElementById(`postActionsMenu_${Sf}`);
    e && (e.style.display = "none"), Sf = null;
  }
  document.removeEventListener("click", Tf);
}
function Tf(e) {
  if (Sf) {
    const t = document.getElementById(`postActionsMenu_${Sf}`), n = document.getElementById(`postActionsBtn_${Sf}`);
    t && n && !t.contains(e.target) && !n.contains(e.target) && closePostActionsMenu();
  }
}
async function tipOnPost(e) {
  const t = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!t) return void showNotification("\u274C Post not found!", "error");
  const n = gameState.employees.find((e2) => e2.id === t.authorId);
  if (!n) return void showNotification("\u274C Author not found!", "error");
  const a = await Iv("How much do you want to tip?", `\u{1F4B5} Tip ${n.name}`, { defaultValue: "500", type: "number", placeholder: "Enter tip amount..." });
  if (!a) return;
  const o = parseInt(a);
  if (isNaN(o) || o <= 0) return void showNotification("\u274C Invalid amount!", "error");
  if (gameState.cash < o) return void showNotification(`\u274C Not enough cash! You have $${xu(gameState.cash)}`, "error");
  gameState.cash -= o, n.bankBalance || (n.bankBalance = 0), n.bankBalance += o;
  const i = Math.min(25, Math.floor(o / 500)), s = Math.min(15, Math.floor(o / 1e3)), r = Math.min(15, Math.floor(o / 800));
  n.stats.affection = Math.min(100, (n.stats.affection || 0) + i), n.stats.trust = Math.min(100, (n.stats.trust || 0) + s), n.stats.desire = Math.min(100, (n.stats.desire || 0) + r);
  const l = createComment({ postId: t.id, authorId: "player", authorName: "You", content: `\u{1F4B5} Tipped $${xu(o)}`, isPlayerComment: true });
  l.isTipAction = true, l.tipAmount = o, t.comments.push(l), remember(n, `Boss tipped me $${xu(o)} on my social post!`, "interaction", 3), updateUI(), showNotification(`\u{1F4B5} Tipped $${xu(o)} to ${n.name}!`, "success"), await $f(t, n, "tip", o, null), "social" === gameState.activeTab && renderSocialFeed(), fg.activePostId === e && Rg(e, false);
}
async function giftOnPost(e) {
  const t = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!t) return void showNotification("\u274C Post not found!", "error");
  const n = gameState.employees.find((e2) => e2.id === t.authorId);
  n ? (window.pendingPostGift = { postId: e, employeeId: n.id }, gameState.activeChat = n, "function" == typeof window.openGiftSelectionModal ? window.openGiftSelectionModal() : (showNotification("\u274C Gift system not available!", "error"), delete window.pendingPostGift)) : showNotification("\u274C Author not found!", "error");
}
async function handlePostGiftGiven(e, t) {
  const n = window.pendingPostGift;
  if (!n) return;
  const a = gameState.socialNetwork.posts.find((e2) => e2.id === n.postId);
  if (!a) return void delete window.pendingPostGift;
  const o = createComment({ postId: a.id, authorId: "player", authorName: "You", content: `\u{1F381} Sent a gift: ${t.emoji} ${t.name}`, isPlayerComment: true });
  o.isGiftAction = true, o.giftName = t.name, o.giftEmoji = t.emoji, o.giftValue = t.price, a.comments.push(o), remember(e, `Boss gifted me a ${t.name} on my social post!`, "interaction", 3), await $f(a, e, "gift", t.price, t), "social" === gameState.activeTab && renderSocialFeed(), fg.activePostId === n.postId && Rg(n.postId, false), delete window.pendingPostGift;
}
async function $f(e, t, n, a, o = null) {
  console.log(`[Social Reactions] Generating reactions to ${n} of $${a} on post by ${t.name}`);
  const i = 1500 + 2e3 * Math.random();
  setTimeout(async () => {
    await Cf(e, t, n, a, o);
  }, i);
  const s = gameState.employees.filter((e2) => e2.id !== t.id && "active" === e2.employmentStatus && Math.random() < 0.35).slice(0, 3);
  for (let i2 = 0; i2 < s.length; i2++) {
    const r = s[i2], l = 3e3 + 2e3 * i2 + 3e3 * Math.random();
    setTimeout(async () => {
      await Ef(e, r, t, n, a, o);
    }, l);
  }
}
async function Cf(e, t, n, a, o = null) {
  const i = t.memory?.intimacyLevel || 0, s = t.stats?.affection || 50, r = t.personality || {}, l = a >= 2e3, c = a >= 5e3, d = [];
  let p;
  r.flirty > 70 && d.push("flirty"), r.shy > 70 && d.push("shy"), r.confident > 70 && d.push("confident"), r.playful > 70 && d.push("playful"), r.professional > 70 && d.push("professional"), p = "tip" === n ? `You are ${t.name}, an employee who just received a $${a} tip from your boss (@TheBoss) on your social media post.

Your personality traits: ${d.length > 0 ? d.join(", ") : "balanced"}
- Intimacy with boss: ${i}/100 (${i < 30 ? "professional distance" : i < 60 ? "friendly" : "close/intimate"})
- Affection: ${s}/100
- Flirty tendency: ${r.flirty || 50}/100

The tip was ${c ? "EXTREMELY generous ($5000+!)" : l ? "very generous ($2000+)" : a >= 1e3 ? "generous" : "nice"}.

Write a UNIQUE, personalized reply (1-2 sentences) thanking them. Your tone should be ${i > 60 ? "flirty, personal, maybe suggestive" : i > 30 ? "warm, friendly, appreciative" : "professional but genuinely grateful"}.
${c ? "Express genuine excitement - this is a LOT of money!" : ""}
${r.shy > 60 ? "Be a bit bashful/flustered about the attention." : ""}
${r.flirty > 70 ? "Add some playful flirtation." : ""}

Be creative and natural - avoid generic phrases like "thank you so much" by itself. Add personality!

Write ONLY the reply text:` : `You are ${t.name}, an employee who just received a gift (${o.emoji} ${o.name}, worth $${a}) from your boss (@TheBoss) on your social media post.

Your personality traits: ${d.length > 0 ? d.join(", ") : "balanced"}
- Intimacy with boss: ${i}/100 (${i < 30 ? "professional distance" : i < 60 ? "friendly" : "close/intimate"})
- Affection: ${s}/100
- Flirty tendency: ${r.flirty || 50}/100

Gift details:
- Item: ${o.name} ${o.emoji}
- Category: ${o.category || "general"}
- Value: $${a}

Write a UNIQUE, personalized reply (1-2 sentences) thanking them for the ${o.name}. Your tone should be ${i > 60 ? "flirty, personal, maybe suggestive" : i > 30 ? "warm, friendly, appreciative" : "professional but genuinely grateful"}.
${"romantic" === o.category ? "This is a romantic gift - be touched/flattered!" : ""}
${"luxury" === o.category ? "This is a luxury item - express how impressed you are!" : ""}
${"funny" === o.category ? "React with humor!" : ""}
${r.shy > 60 ? "Be a bit bashful about receiving such attention publicly." : ""}

Be creative and natural - mention the specific gift, add emojis that fit your personality!

Write ONLY the reply text:`;
  let m = null;
  for (let e2 = 0; e2 < 2 && !m; e2++) try {
    let a2 = (await queuedGenerateText(p, { temperature: 0.9 + 0.05 * e2, max_tokens: 80 }, `${n} reaction from ${t.name}${e2 > 0 ? " (retry)" : ""}`)).trim().replace(/^["']|["']$/g, "").replace(/^(Reply:|Response:|Comment:)\s*/i, "").split("\n")[0].trim();
    a2 && a2.length >= 10 && (m = a2);
  } catch (t2) {
    console.warn(`[Social Reactions] Attempt ${e2 + 1} failed:`, t2);
  }
  if (m) {
    const n2 = createComment({ postId: e.id, authorId: t.id, authorName: t.name, content: m });
    e.comments.push(n2), console.log(`[Social Reactions] ${t.name} reacted: "${m}"`), wg(e.id), fg.activePostId === e.id && Rg(e.id, true);
  } else console.error("[Social Reactions] Failed to generate recipient reaction after retries");
}
async function Ef(e, t, n, a, o, i = null) {
  const s = t.relationships?.find((e2) => e2.targetId === n.id), r = t.personality?.envy > 60 || "rival" === s?.type, l = "friend" === s?.type || "best_friend" === s?.type, c = t.personality || {}, d = [];
  c.flirty > 70 && d.push("flirty"), c.sarcastic > 70 && d.push("sarcastic"), c.playful > 70 && d.push("playful"), c.envy > 70 && d.push("envious"), c.supportive > 70 && d.push("supportive");
  const p = `You are ${t.name}, an employee seeing your boss (@TheBoss) ${"tip" === a ? `tip $${o} to` : `gift a ${i.emoji} ${i.name} to`} your coworker ${n.name} on social media.

Your personality: ${d.length > 0 ? d.join(", ") : "neutral"}
${r ? `You're jealous of ${n.name} - you wish the boss noticed YOU like that!` : ""}
${l ? `You're friends with ${n.name} - you're happy for them!` : ""}
${r || l ? "" : "You have a neutral relationship with them."}

Write a SHORT, UNIQUE comment (5-20 words max) reacting to this public display. Ideas:
${r ? `- Express playful jealousy ("Ugh, some people get all the luck!" "When's my turn?")` : ""}
${l ? '- Hype up your friend ("Yesss get it!" "You deserve it!")' : ""}
- React to the boss's generosity
- Make a joke or witty observation
- Express something that fits YOUR unique personality

Be creative! NO generic responses. Add emojis that fit your vibe.

Write ONLY the comment:`;
  let m = null;
  for (let e2 = 0; e2 < 2 && !m; e2++) try {
    let n2 = (await queuedGenerateText(p, { temperature: 0.95 + 0.03 * e2, max_tokens: 50 }, `Bystander reaction from ${t.name}${e2 > 0 ? " (retry)" : ""}`)).trim().replace(/^["']|["']$/g, "").replace(/^(Comment:|Reply:)\s*/i, "").split("\n")[0].trim();
    n2 && n2.length >= 5 && (m = n2);
  } catch (t2) {
    console.warn(`[Social Reactions] Bystander attempt ${e2 + 1} failed:`, t2);
  }
  if (m) {
    const n2 = createComment({ postId: e.id, authorId: t.id, authorName: t.name, content: m });
    e.comments.push(n2), console.log(`[Social Reactions] Bystander ${t.name} reacted: "${m}"`), wg(e.id), fg.activePostId === e.id && Rg(e.id, true);
  } else console.error(`[Social Reactions] Failed to generate bystander reaction from ${t.name}`);
}
async function Mf(e = null, t = null) {
  if (!gameState.activeChat) return;
  const n = gameState.activeChat;
  let a = e || "casual", o = "";
  if (Ue()) {
    if (["lewd", "nude", "explicit"].includes(a)) return void showNotification("\u{1F6E1}\uFE0F SFW Mode is enabled - NSFW image requests are blocked", "warning");
    if (t && /\b(nude|naked|lewd|sexy|explicit|sexual|nsfw|topless|underwear|lingerie|masturbat|dildo|toy|vibrator|orgasm)\b/i.test(t)) return void showNotification("\u{1F6E1}\uFE0F SFW Mode is enabled - NSFW content requests are blocked", "warning");
  }
  if (t) o = t, /\b(masturbat|dildo|toy|vibrator|orgasm|degradation|body.*writing|explicit.*act)\b/i.test(t) ? a = "explicit" : /\b(nude|naked|full.*nude)\b/i.test(t) ? a = "nude" : /\b(lewd|sexy|revealing|underwear|lingerie|topless)\b/i.test(t) ? a = "lewd" : /\b(work|office|professional)\b/i.test(t) ? a = "work" : /\b(selfie|picture|photo)\b/i.test(t) && (a = "casual");
  else {
    const e2 = { casual: ["Send me a selfie \u{1F60A}", "Let me see a pic of you", "Show me what you look like rn", "Selfie? \u{1F4F8}", "I wanna see you, send a pic"], work: ["Show me your workspace setup", "Send me a work selfie", "Let me see you at the office \u{1F4F8}", "What do you look like at work?", "Pic from your desk?"], lewd: ["Send me something sexy \u{1F60F}", "Show me something spicy", "I wanna see something lewd from you", "Got anything sexy for me? \u{1F618}", "Send me a hot pic"], nude: ["Send nudes \u{1F608}", "I wanna see you naked", "Show me everything", "Take it all off for me", "Let me see you with nothing on"], explicit: ["Send me something really dirty \u{1F975}", "Show me what you do when you're alone", "I want to see you touch yourself", "Get explicit for me", "Show me something filthy \u{1F4A6}"] }[a] || ["Send me a photo"];
    o = e2[Math.floor(Math.random() * e2.length)];
  }
  const i = t || o;
  gameState.chatHistory[n.id] || (gameState.chatHistory[n.id] = []), gameState.chatHistory[n.id].push({ sender: "You", content: i, isPlayer: true, timestamp: gameState.time?.currentTime || Date.now() }), addChatMessage("You", i, true), chatMessages && (chatMessages.scrollTop = chatMessages.scrollHeight), chatInput && (chatInput.value = ""), setTimeout(async () => {
    try {
      await evaluateAndExecuteImageRequest(n, a, o, t);
    } catch (u2) {
      console.error("[Image Request] evaluateAndExecuteImageRequest failed:", u2), gameState.activeChat?.id === n.id && chatMessages && (addChatMessage(n.name, "*phone buzzes but nothing happens* ...Sorry, something went wrong. Try again?", false), chatMessages.scrollTop = chatMessages.scrollHeight);
    }
  }, 1500);
}
async function evaluateAndExecuteImageRequest(e, t, n, a = null) {
  const o = e.memory?.intimacyLevel || 0, i = e.stats?.affection || 0, s = e.stats?.comfort || 0, r = e.stats?.desire || 0;
  e.personality;
  let l = 0;
  switch (t) {
    case "casual":
      l = 5;
      break;
    case "work":
      l = 10;
      break;
    case "lewd":
      l = 48;
      break;
    case "nude":
      l = 73;
      break;
    case "explicit":
      l = 88;
  }
  const c = "explicit" === t || "nude" === t ? 0.3 : 0.15, d = 0.35 * o + 0.2 * i + r * c + s * (0.3 - (c - 0.15)), p = d >= l || d >= 0.85 * l && Math.random() < 0.2;
  if (console.log("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), console.log(`\u{1F4F8} IMAGE REQUEST EVALUATION: ${e.name}`), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), console.log(`Request Type: ${t.toUpperCase()}`), console.log(`Description: "${n}"`), console.log("\n\u{1F4CA} Stats:"), console.log(`  \u2022 Intimacy: ${o.toFixed(1)}`), console.log(`  \u2022 Affection: ${i.toFixed(1)}`), console.log(`  \u2022 Comfort: ${s.toFixed(1)}`), console.log(`  \u2022 Desire: ${r.toFixed(1)}`), console.log("\n\u{1F9EE} Calculation:"), console.log(`  \u2022 Intimacy \xD7 0.35 = ${(0.35 * o).toFixed(2)}`), console.log(`  \u2022 Affection \xD7 0.2 = ${(0.2 * i).toFixed(2)}`), console.log(`  \u2022 Desire \xD7 ${c} = ${(r * c).toFixed(2)}`), console.log(`  \u2022 Comfort \xD7 ${(0.3 - (c - 0.15)).toFixed(2)} = ${(s * (0.3 - (c - 0.15))).toFixed(2)}`), console.log("  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"), console.log(`  \u2022 Willingness Score: ${d.toFixed(2)}`), console.log(`  \u2022 Required Threshold: ${l}`), console.log(`  \u2022 Grace Threshold (85%): ${(0.85 * l).toFixed(2)}`), console.log("\n\u{1F3B2} Decision:"), d >= l ? console.log("  \u2705 ACCEPTED - Score meets threshold") : d >= 0.85 * l ? console.log(`  \u{1F3B2} GRACE ZONE - 20% chance (rolled: ${p ? "SUCCESS" : "FAIL"})`) : console.log(`  \u274C REJECTED - Score too low (${(l - d).toFixed(2)} points short)`), console.log("\n\u{1F4DD} Final Result: " + (p ? "\u2705 WILL COMPLY" : "\u274C WILL REFUSE")), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"), p) setTimeout(() => {
    if (gameState.activeChat?.id === e.id && chatMessages) {
      const n2 = { casual: ["Sure!", "Okay, one sec", "Alright"], work: ["Sure thing", "Okay", "No problem"], lewd: ["Okay... give me a sec \u{1F60F}", "Fine, but only for you \u{1F618}", "Alright... one moment"], nude: ["Omg... okay \u{1F633}", "I can't believe I'm doing this...", "Fuck it, why not"], explicit: ["Holy shit... okay \u{1F975}", "God, this is so hot...", "Fuck yes... one sec \u{1F4A6}", "You're making me so wet... gimme a minute \u{1F608}"] }[t] || ["Okay"], a2 = n2[Math.floor(Math.random() * n2.length)];
      gameState.chatHistory[e.id].push({ sender: e.name, content: a2, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() });
      const o2 = gameState.chatHistory[e.id].length - 1;
      addChatMessage(e.name, a2, false, null, o2), chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, 1e3 + 1500 * Math.random()), setTimeout(async () => {
    try {
      await generateAndSendRequestedImage(e, t, a);
    } catch (u2) {
      console.error("[Image Request] generateAndSendRequestedImage failed:", u2), gameState.activeChat?.id === e.id && chatMessages && (addChatMessage(e.name, "Sorry, I couldn't get the photo to work. Try asking again?", false), chatMessages.scrollTop = chatMessages.scrollHeight), chatTypingIndicator && (chatTypingIndicator.style.display = "none");
    }
  }, 3e3 + 5e3 * Math.random());
  else {
    const n2 = { explicit: ["That's way too much for me", "I'm not comfortable with that", "That's crossing a line", "Absolutely not"], nude: ["I'm not ready for that", "That's a bit too much", "Maybe when we're closer", "I don't think so"], lewd: ["I'm not really comfortable with that", "That's a bit much for me", "Maybe another time"], work: ["Not really in the mood", "Maybe later"], casual: ["Not really feeling it right now", "Maybe later"] }[t] || ["I'm not really comfortable with that"], a2 = n2[Math.floor(Math.random() * n2.length)];
    setTimeout(() => {
      if (gameState.activeChat?.id === e.id && chatMessages) {
        gameState.chatHistory[e.id].push({ sender: e.name, content: a2, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() });
        const t2 = gameState.chatHistory[e.id].length - 1;
        addChatMessage(e.name, a2, false, null, t2), chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 2e3 + 2e3 * Math.random());
  }
}
async function generateAndSendRequestedImage(e, t, n = null) {
  const a = "object" == typeof e ? e : gameState.employees.find((x) => x.id === e);
  if (!a) return void console.warn("[Image Request] Employee not found for image request:", e);
  const u2 = a.id, live = () => gameState.activeChat?.id === u2 && chatMessages;
  live() && chatTypingIndicator && chatTypingName && (chatTypingIndicator.style.display = "block", chatTypingName.textContent = a.name);
  try {
    let prompt;
    if (n) {
      const o = Xf(n);
      o !== n ? (console.log("[Request Image] \u{1F504} Expanded @mentions in request"), console.log("[Request Image] Original:", n), console.log("[Request Image] Expanded:", o), prompt = o) : prompt = await vf(a, t, n);
    } else prompt = await vf(a, t, n);
    let placeholder = null;
    live() && (placeholder = document.createElement("div"), placeholder.textContent = "\u{1F3A8} Generating image...", placeholder.style.cssText = "text-align:center; padding:10px; opacity:0.7; font-style:italic;", chatMessages.appendChild(placeholder), chatMessages.scrollTop = chatMessages.scrollHeight);
    const styled = applyImageStyle(fu(prompt));
    console.log(`[Image Request] \u{1F680} Final prompt to engine (${styled.prompt.length} chars): ${styled.prompt}`);
    const s = await queuedGenerateImage(styled, `Chat scene image for ${a.name}`);
    placeholder && placeholder.parentElement && placeholder.remove();
    const r = `${buildChatPrompt(a, Xs(a.id), "").prompt}

The player has requested a ${t || "custom"} photo from you. You've agreed and are sending them an image that shows: ${prompt}

Write a brief, natural message (1 sentence) to accompany the photo you're sending. Match your tone to the image type and your relationship:
- Casual/Work: Friendly, maybe playful
- Lewd: Flirty, teasing, confident  
- Nude: Bold, seductive, intimate
- Explicit: Intensely sexual, uninhibited, aroused, raw

${a.name}'s message:`;
    let l = "";
    try {
      l = sanitizeNpcResponse(await queuedGenerateText(r, {}, `Generating image sharing message for ${a.name}`), 1);
    } catch (e2) {
      console.error("Failed to generate image caption:", e2);
    }
    l || (l = { explicit: "\u{1F975}", nude: "\u{1F633}", lewd: "\u{1F60F}" }[t] || "\u{1F4F8}"), live() && chatTypingIndicator && (chatTypingIndicator.style.display = "none"), Qy(u2, { sender: a.name, content: l, imageUrl: s, imagePrompt: prompt, imageType: "received" }), remember(a, `Sent ${t || "custom"} photo to player`, "event", 1.5), remember(a, "The boss requested this photo", "interaction", 1.5), a.photos || (a.photos = []), a.photos.push({ url: s, prompt, type: t || "custom", timestamp: gameState.time?.currentTime || Date.now() }), "explicit" === t ? (a.stats.desire = Math.min(100, (a.stats.desire || 0) + 8), a.stats.affection = Math.min(100, (a.stats.affection || 0) + 4), a.memory.intimacyLevel = Math.min(100, (a.memory.intimacyLevel || 0) + 5), a.stats.comfort = Math.min(100, (a.stats.comfort || 0) + 3)) : "nude" === t ? (a.stats.desire = Math.min(100, (a.stats.desire || 0) + 5), a.stats.affection = Math.min(100, (a.stats.affection || 0) + 3), a.memory.intimacyLevel = Math.min(100, (a.memory.intimacyLevel || 0) + 3)) : "lewd" === t ? (a.stats.desire = Math.min(100, (a.stats.desire || 0) + 3), a.stats.affection = Math.min(100, (a.stats.affection || 0) + 2), a.memory.intimacyLevel = Math.min(100, (a.memory.intimacyLevel || 0) + 2)) : a.stats.affection = Math.min(100, (a.stats.affection || 0) + 1);
  } catch (e2) {
    console.error("Error handling image request:", e2), live() && chatTypingIndicator && (chatTypingIndicator.style.display = "none"), Qy(u2, { sender: a.name, content: "Sorry, I can't send that right now." });
  }
}
async function visualizeCurrentScene() {
  if (!gameState.activeChat) return;
  const e = gameState.activeChat, t = e.id, n = e.name;
  try {
    const a = gameState.chatHistory[t]?.slice(-15).map((e2) => `${e2.sender}: ${e2.content}`).join("\n") || "", o = getPhysicalDescriptionForPrompt(e, { nude: /\b(nude|naked|undressed|topless|bottomless|stripped|clothes off|no clothes)\b/i.test(a) }), i = (gameState.playerProfile || {}).gender || "", s = gameState.settings?.playerBio || "", r = i ? s ? `${i} player: ${s}` : `${i} player/boss` : s || "the player", l = e.race && "human" !== e.race ? e.race : "human", c = e.physical?.raceFeatures?.description || "", d = "human" !== l ? `
\u26A0\uFE0F CRITICAL: ${n} is a ${l}${c ? ` with ${c}` : ""}. Include these non-human features!` : "", p = (gameState.chatHistory[t]?.filter((e2) => e2.isPlayer)?.slice(-3).map((e2) => e2.content).join(" "), gameState.chatHistory[t]?.filter((e2) => !e2.isPlayer)?.slice(-3).map((e2) => e2.content).join(" "), `You are generating an image prompt for the CURRENT MOMENT in this conversation.

Recent conversation between player and ${n}:
${a}

\u26A0\uFE0F CHARACTER ACCURACY - MUST FOLLOW:
${n}: ${o}
- Species/Race: ${l}${c ? ` (${c})` : ""}
- Gender: ${e.gender || "female"}${d}

Player: ${r}

\u{1F4CA} SCENE PARTICIPANTS: This scene involves EXACTLY 2 people - ${n} and the player. Do NOT add extra people unless the conversation explicitly mentions others being present.

Based on the conversation context, create a DETAILED, SPECIFIC image generation prompt showing:
1. The exact current activity or scene (what are they doing RIGHT NOW based on the last messages?)
2. BOTH characters (${n} and the player) - their poses, expressions, body language
3. ${n}'s distinctive features (${"human" !== l ? `their ${l} features, ` : ""}hair color, eye color, body type)
4. The specific location/setting details (where are they?)
5. Current mood/atmosphere from the conversation

\u26A0\uFE0F ACCURACY RULES:
- Include ${n}'s EXACT physical traits from the description above
- ${"human" !== l ? `Show ${n} as a ${l} with appropriate non-human features!` : ""}
- Only 2 people in the image unless the conversation mentions others

CRITICAL: Write ONLY the image description itself. NO markdown, NO headers, NO labels. Just the raw visual description.

Image prompt (50-150 words):`);
    let m = await queuedGenerateText(p, { temperature: 0.8, max_tokens: 200, stopSequences: ["---", "Note:", "Remember:", "Visual Details:", "**Visual", "Word count:"] }, `Generating scene image prompt for ${e.name}`);
    m = extractText(m), m = m.replace(/<image prompt>/gi, "").replace(/<\/image prompt>/gi, "").trim(), m = m.replace(/^\*\*Image Prompt:\*\*\s*/gi, ""), m = m.replace(/\*\*Visual Details:\*\*[\s\S]*/gi, ""), m = m.replace(/\*\(Word count:.*?\)\*/gi, ""), m = m.replace(/\n\*\*.*?\*\*/g, ""), m = m.replace(/\n\s*-\s+\*\*.*?:\*\*/g, ""), m = m.trim(), console.log("[Scene Visualization] Generated prompt:", m), console.log("[Scene Visualization] Prompt length:", m.length, "chars");
    const u2 = document.createElement("div");
    u2.textContent = "\u{1F3A8} Visualizing current scene...", u2.style.cssText = "text-align:center; padding:10px; opacity:0.7; font-style:italic;", gameState.activeChat?.id === t && chatMessages && (chatMessages.appendChild(u2), chatMessages.scrollTop = chatMessages.scrollHeight);
    const g = await queuedGenerateImage(applyImageStyle(fu(m)), "Scene visualization");
    if (u2 && u2.parentElement && u2.remove(), false !== gameState.settings?.autoVisualization?.cooldownAfterManual) {
      const e2 = gameState.employees.find((e3) => e3.id === t);
      e2 && e2.autoVisTracker && (e2.autoVisTracker.messagesSinceLastVis = 0, console.log(`[Auto-Vis] Reset counter for ${e2.name} after manual visualization`));
    }
    Qy(t, { sender: "System", content: "\u{1F3AC} Scene visualization", imageUrl: g, imagePrompt: m, imageType: "scene", notify: false });
  } catch (e2) {
    console.error("Error visualizing scene:", e2), Qy(t, { sender: "System", content: "Could not generate scene visualization.", notify: false });
  }
}
function Pf(e, t) {
  const n = gameState.chatHistory[e] || [];
  if (n.length < 2) return 0;
  const a = n.slice(-4), o = a[a.length - 1], i = (o?.content || "").toLowerCase(), s = a.map((e2) => e2.content || "").join(" ").toLowerCase();
  let r = 0;
  const l = [], c = [{ pattern: /\b(kiss(es|ed|ing)?|kissed)\b/i, score: 25, label: "kiss" }, { pattern: /\b(hug(s|ged|ging)?|embrace[sd]?)\b/i, score: 20, label: "embrace" }, { pattern: /\b(touch(es|ed|ing)?|caress(es|ed|ing)?|stroke[sd]?)\b/i, score: 22, label: "touch" }, { pattern: /\b(grab(s|bed|bing)?|pull(s|ed|ing)?|push(es|ed|ing)?)\b/i, score: 18, label: "physical" }, { pattern: /\b(slap(s|ped|ping)?|hit(s|ting)?|punch(es|ed|ing)?)\b/i, score: 25, label: "violence" }, { pattern: /\b(undress(es|ed|ing)?|strip(s|ped|ping)?|remov(e|es|ed|ing)\s+(clothes|shirt|pants|dress|bra|panties))\b/i, score: 30, label: "undress" }, { pattern: /\b(naked|nude|bare|topless|bottomless)\b/i, score: 28, label: "nudity" }, { pattern: /\b(bend(s|ing)?\s*over|kneel(s|ing)?|on\s+(all\s+fours|hands\s+and\s+knees))\b/i, score: 25, label: "pose" }, { pattern: /\b(straddle[sd]?|mount(s|ed|ing)?|climb(s|ed|ing)?\s+on)\b/i, score: 25, label: "position" }, { pattern: /\b(thrust(s|ing)?|pound(s|ing)?|ride(s|ing)?)\b/i, score: 30, label: "intimate" }, { pattern: /\b(moan(s|ed|ing)?|groan(s|ed|ing)?|gasp(s|ed|ing)?|scream(s|ed|ing)?|cry\s+out)\b/i, score: 22, label: "vocal" }, { pattern: /\b(orgasm(s|ed|ing)?|climax(es|ed|ing)?|cum(s|ming)?|come(s|ing)?)\b/i, score: 30, label: "climax" }, { pattern: /\b(spank(s|ed|ing)?|whip(s|ped|ping)?|tie[sd]?\s+(up|down)|bound)\b/i, score: 25, label: "bdsm" }, { pattern: /\b(furious|enraged|livid|seething)\b/i, score: 20, label: "rage" }, { pattern: /\b(terrified|horrified|panicked|scared)\b/i, score: 18, label: "fear" }, { pattern: /\b(ecstatic|overjoyed|thrilled|elated)\b/i, score: 15, label: "joy" }, { pattern: /\b(heartbroken|devastated|crushed|sobbing)\b/i, score: 20, label: "grief" }, { pattern: /\b(shocked|stunned|speechless|frozen)\b/i, score: 18, label: "shock" }, { pattern: /\b(aroused|turned\s+on|horny|wet|hard|throbbing)\b/i, score: 25, label: "arousal" }, { pattern: /\b(blush(es|ed|ing)?|flush(es|ed|ing)?|red\s+(faced?|cheeks?))\b/i, score: 12, label: "blush" }, { pattern: /\b(trembl(e|es|ed|ing)|shiver(s|ed|ing)?|shak(e|es|ing))\b/i, score: 15, label: "trembling" }, { pattern: /\b(enter(s|ed|ing)?|walk(s|ed|ing)?\s+into|step(s|ped|ping)?\s+into)\s+(the\s+)?(room|office|bedroom|bathroom)\b/i, score: 15, label: "enter" }, { pattern: /\b(lock(s|ed|ing)?\s+the\s+door|close(s|d)?\s+the\s+door|shut(s)?\s+the\s+door)\b/i, score: 18, label: "privacy" }, { pattern: /\b(push(es|ed)?\s+(against|onto)\s+(the\s+)?(wall|desk|bed|couch))\b/i, score: 22, label: "against surface" }, { pattern: /\b(on\s+(the\s+)?(desk|bed|couch|floor|table|chair))\b/i, score: 15, label: "on furniture" }, { pattern: /\b(corner(s|ed|ing)?|trap(s|ped|ping)?|pin(s|ned|ning)?)\b/i, score: 18, label: "cornered" }, { pattern: /\b(confess(es|ed|ing)?|admit(s|ted|ting)?|reveal(s|ed|ing)?)\b/i, score: 15, label: "confession" }, { pattern: /\b(i\s+love\s+you|love\s+you|marry\s+me)\b/i, score: 20, label: "declaration" }, { pattern: /\b(break(s|ing)?\s+up|it'?s\s+over|we'?re\s+done)\b/i, score: 20, label: "breakup" }, { pattern: /\b(proposal|propose[sd]?|engagement)\b/i, score: 20, label: "proposal" }, { pattern: /\b(caught|discover(s|ed)?|walk(s|ed)?\s+in\s+on)\b/i, score: 20, label: "caught" }, { pattern: /\b(secret|hidden|private|forbidden)\b/i, score: 10, label: "secret" }, { pattern: /\*[^*]+\*/g, score: 8, label: "action text" }, { pattern: /\b(look(s|ed|ing)?\s+(at|into|up|down)|stare[sd]?|gaze[sd]?)\b/i, score: 8, label: "gaze" }, { pattern: /\b(eye(s)?\s+(meet|lock|widen)|pupils?\s+dilat)/i, score: 12, label: "eye contact" }, { pattern: /\b(smile[sd]?|grin(s|ned)?|smirk(s|ed)?|frown(s|ed)?)\b/i, score: 6, label: "expression" }, { pattern: /\b(lean(s|ed|ing)?\s+(in|closer|forward|back))\b/i, score: 10, label: "lean" }, { pattern: /\b(stand(s|ing)?\s+up|sit(s|ting)?\s+down|lie(s)?\s+down|lay(s|ing)?\s+down)\b/i, score: 8, label: "posture change" }];
  for (const e2 of c) e2.pattern.test(i) ? (r += e2.score, l.push(e2.label)) : e2.pattern.test(s) && (r += Math.floor(0.5 * e2.score), l.push(e2.label + " (context)"));
  const d = (i.match(/\*[^*]+\*/g) || []).length;
  d >= 2 && (r += 5 * d, l.push(`${d} RP actions`)), i.length > 300 && (r += 10, l.push("long description"));
  const p = t.memory?.intimacyLevel || 0, m = t.stats?.desire || 0;
  return (p > 50 || m > 60) && (r += 5), r = Math.min(100, r), console.log(`[Intensity] Score: ${r}/100 | Triggers: ${l.join(", ") || "none"}`), { score: r, triggers: l };
}
async function checkAutoVisualization(e) {
  console.log(`[Auto-Vis] checkAutoVisualization called for ${e?.name || "unknown"}`);
  const t = gameState.settings?.autoVisualization;
  if (console.log("[Auto-Vis] Settings check:", { hasSettings: !!t, enabled: t?.enabled, minFreq: t?.minFrequency, maxFreq: t?.maxFrequency }), !t || !t.enabled) return void console.log("[Auto-Vis] Feature disabled or no settings - skipping");
  const n = e.id;
  if (e.autoVisTracker || (e.autoVisTracker = { messagesSinceLastVis: 0, nextTriggerAt: Af(t) }), e.autoVisTracker.messagesSinceLastVis++, console.log(`[Auto-Vis] ${e.name}: ${e.autoVisTracker.messagesSinceLastVis}/${e.autoVisTracker.nextTriggerAt} messages`), e.autoVisTracker.messagesSinceLastVis >= e.autoVisTracker.nextTriggerAt) {
    if (t.intensityDetection) {
      const { score: a, triggers: o } = Pf(n, e), i = t.intensityThreshold || 50;
      if (a < i) {
        if (console.log(`[Auto-Vis] Intensity ${a} below threshold ${i} - skipping (triggers: ${o.join(", ")})`), !(e.autoVisTracker.messagesSinceLastVis > e.autoVisTracker.nextTriggerAt + 10)) return;
        console.log(`[Auto-Vis] Force triggering after extended wait (${e.autoVisTracker.messagesSinceLastVis} messages)`);
      } else console.log(`[Auto-Vis] \u{1F525} Intensity ${a} >= threshold ${i} - TRIGGERING!`);
    }
    console.log(`[Auto-Vis] \u{1F3AC} Triggering auto-visualization for ${e.name}`), e.autoVisTracker.messagesSinceLastVis = 0, e.autoVisTracker.nextTriggerAt = Af(t), await Nf(e);
  }
}
function Af(e) {
  const t = e.minFrequency || 5, n = e.maxFrequency || 10, a = (t + n) / 2, o = (n - t) / 2, i = Math.random(), s = Math.random();
  let r = a + Math.sqrt(-2 * Math.log(i)) * Math.cos(2 * Math.PI * s) * (o / 2.5);
  return r = Math.max(t, Math.min(n, Math.round(r))), console.log(`[Auto-Vis] Next trigger at ${r} messages (range: ${t}-${n})`), r;
}
function Lf() {
  const e = gameState.settings?.autoVisualization;
  if (!e) return;
  let t = 0;
  if (gameState.employees) {
    for (const n of gameState.employees) if (n.autoVisTracker) {
      const a = n.autoVisTracker.nextTriggerAt, o = Af(e);
      n.autoVisTracker.messagesSinceLastVis >= o ? n.autoVisTracker.nextTriggerAt = n.autoVisTracker.messagesSinceLastVis + 1 : n.autoVisTracker.nextTriggerAt = o, t++, console.log(`[Auto-Vis] Updated ${n.name}: ${a} \u2192 ${n.autoVisTracker.nextTriggerAt}`);
    }
  }
  if (gameState.groups) {
    for (const n of gameState.groups) if (n.autoVisTracker) {
      const a = n.autoVisTracker.nextTriggerAt, o = Af(n.settings?.autoVisualization || e);
      n.autoVisTracker.messagesSinceLastVis >= o ? n.autoVisTracker.nextTriggerAt = n.autoVisTracker.messagesSinceLastVis + 1 : n.autoVisTracker.nextTriggerAt = o, console.log(`[Auto-Vis] Updated group ${n.name}: ${a} \u2192 ${n.autoVisTracker.nextTriggerAt}`), t++;
    }
  }
  t > 0 && showNotification(`\u{1F4CA} Updated ${t} auto-vis trackers with new frequency`, "info", 2e3);
}
async function Nf(e) {
  const t = gameState.settings?.autoVisualization;
  if (!t) return;
  const n = Ue() ? "sfw" : t.nsfwLevel, a = e.id, o = e.name, i = Date.now();
  window.activeAutoVisGeneration = { id: i, empId: a, cancelled: false };
  try {
    const s = gameState.chatHistory[a]?.slice(-15).map((e2) => `${e2.sender}: ${e2.content}`).join("\n") || "", r = getPhysicalDescriptionForPrompt(e, { nude: /\b(nude|naked|undressed|topless|bottomless|stripped|no clothes|clothes off)\b/i.test(s) }), l = gameState.settings?.playerBio || "the player", c = e.race && "human" !== e.race ? e.race : null, d = e.physical?.raceFeatures?.description || null, p = Rf(n, e, s), m = t.perspective || "dynamic";
    let u2 = Df(m, o, r, l, s, p, c, d);
    t.customPrompt && t.customPrompt.trim() && (u2 += `

ADDITIONAL USER INSTRUCTIONS: ${t.customPrompt.trim()}`), console.log(`[Auto-Vis] Perspective: ${m}, NSFW: ${n}${Ue() ? " (SFW mode forced)" : ""}`);
    let g = await queuedGenerateText(u2, { temperature: 0.85, max_tokens: 250, stopSequences: ["---", "Note:", "Remember:", "Visual Details:", "**Visual", "Word count:", "ASSISTANT:", "Human:"] }, `Auto-visualization prompt for ${e.name}`);
    if (window.activeAutoVisGeneration?.id === i && window.activeAutoVisGeneration?.cancelled) return console.log("[Auto-Vis] Generation cancelled by user"), void (window.activeAutoVisGeneration = null);
    g = extractText(g), g = g.replace(/<image prompt>/gi, "").replace(/<\/image prompt>/gi, "").trim(), g = g.replace(/^\*\*Image Prompt:\*\*\s*/gi, ""), g = g.replace(/\*\*Visual Details:\*\*[\s\S]*/gi, ""), g = g.replace(/\*\(Word count:.*?\)\*/gi, ""), g = g.replace(/\n\*\*.*?\*\*/g, ""), g = g.replace(/\n\s*-\s+\*\*.*?:\*\*/g, ""), g = g.trim(), t.customPrompt && t.customPrompt.trim() && (g += ", " + t.customPrompt.trim()), console.log("[Auto-Vis] Generated prompt:", g.substring(0, 100) + "...");
    const h = fu(g);
    console.log("[Auto-Vis] Applying style:", t.style || "global", "(global style:", gameState.settings?.imageStyle, ")");
    const y = Bf(h, t.style), f = "object" == typeof y && y?.prompt ? y.prompt : String(y);
    console.log("[Auto-Vis] Styled prompt suffix:", f.substring(f.length - 200));
    const b = document.createElement("div");
    b.className = "auto-vis-loading", b.style.cssText = "text-align:center; padding:10px; margin:8px auto; max-width:300px; background:rgba(233,69,96,0.1); border-radius:8px; border:1px dashed rgba(233,69,96,0.3);";
    const v = document.createElement("div");
    v.textContent = "\u{1F3AC} Auto-generating scene...", v.style.cssText = "opacity:0.7; font-style:italic; font-size:0.85rem; margin-bottom:6px;";
    const w = document.createElement("button");
    w.textContent = "\u2715 Skip", w.style.cssText = "padding:4px 12px; background:transparent; border:1px solid rgba(233,69,96,0.5); border-radius:4px; color:var(--v); cursor:pointer; font-size:0.75rem; opacity:0.7; transition:all 0.2s;", w.onmouseenter = () => {
      w.style.opacity = "1", w.style.background = "rgba(233,69,96,0.2)";
    }, w.onmouseleave = () => {
      w.style.opacity = "0.7", w.style.background = "transparent";
    }, w.onclick = () => {
      window.activeAutoVisGeneration?.id === i && (window.activeAutoVisGeneration.cancelled = true, b.remove(), showNotification("\u23ED\uFE0F Auto-visualization skipped", 2e3));
    }, b.appendChild(v), b.appendChild(w), gameState.activeChat?.id === a && chatMessages && (chatMessages.appendChild(b), chatMessages.scrollTop = chatMessages.scrollHeight);
    const x = await queuedGenerateImage(f, `Auto-visualization for ${o}`);
    if (b && b.parentElement && b.remove(), window.activeAutoVisGeneration?.id === i && window.activeAutoVisGeneration?.cancelled) return console.log("[Auto-Vis] Generation cancelled by user (after image)"), void (window.activeAutoVisGeneration = null);
    window.activeAutoVisGeneration = null, gameState.settings.autoVisualization.totalGenerated || (gameState.settings.autoVisualization.totalGenerated = 0), gameState.settings.autoVisualization.totalGenerated++;
    const S = document.getElementById("autoVisualizeCount");
    S && (S.textContent = gameState.settings.autoVisualization.totalGenerated), gameState.chatHistory[a] || (gameState.chatHistory[a] = []);
    const k = gameState.chatHistory[a].length;
    if (gameState.chatHistory[a].push({ sender: "System", content: "\u{1F3AC} Auto-generated scene", isPlayer: false, imageUrl: x, imagePrompt: g, imageType: "auto-scene", perspective: m, timestamp: gameState.time?.currentTime || Date.now() }), false !== t.addToGallery) {
      const e2 = gameState.employees.find((e3) => e3.id === a);
      e2 && (e2.photos || (e2.photos = []), e2.photos.push({ url: x, source: "auto-vis", caption: `\u{1F3AC} Auto-visualization (${m})`, timestamp: gameState.time?.currentTime || Date.now(), prompt: g }), console.log(`[Auto-Vis] Added image to ${e2.name}'s gallery (${e2.photos.length} total)`));
    }
    if (gameState.activeChat?.id === a && chatMessages) {
      const e2 = document.createElement("div");
      e2.style.cssText = "max-width:85%; padding:10px; margin:10px auto; text-align:center; background:rgba(233,69,96,0.1); border-radius:12px; border:1px solid rgba(233,69,96,0.3);", e2.dataset.messageIndex = k;
      const t2 = document.createElement("img");
      t2.src = x, t2.style.cssText = "width:100%; max-width:450px; border-radius:10px; cursor:pointer; box-shadow:0 4px 15px var(--dv);", t2.onclick = () => {
        const e3 = document.createElement("div");
        e3.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bn); z-index:99999; display:flex; justify-content:center; align-items:center; cursor:pointer;", e3.innerHTML = `<img src="${x}" style="max-width:90%; max-height:90%; border-radius:10px;">`, e3.onclick = () => e3.remove(), document.body.appendChild(e3);
      };
      const n2 = document.createElement("p");
      n2.style.cssText = "margin:8px 0 0 0; color:var(--v); font-size:0.8rem; font-style:italic;";
      const o2 = { "first-person": "\u{1F464} First-Person POV", "third-person": "\u{1F3A5} Third-Person View", cinematic: "\u{1F3AC} Cinematic Shot", intimate: "\u{1F495} Intimate Close-Up", voyeur: "\u{1F52D} Voyeur Perspective", dynamic: "\u{1F3B2} Dynamic View" }[m] || "\u{1F3AC} Auto Scene";
      n2.textContent = `${o2} \u2022 Auto-Generated`;
      const i2 = document.createElement("button");
      i2.className = "auto-vis-regen-btn", i2.innerHTML = "\u{1F504} Regenerate", i2.style.cssText = "margin-top:8px; padding:6px 14px; background:rgba(233,69,96,0.3); border:1px solid var(--k); border-radius:6px; color:var(--v); cursor:pointer; font-size:0.8rem; transition:all 0.2s;", i2.onmouseenter = () => {
        i2.style.background = "rgba(233,69,96,0.5)", i2.style.color = "var(--b)";
      }, i2.onmouseleave = () => {
        i2.style.background = "rgba(233,69,96,0.3)", i2.style.color = "var(--v)";
      }, i2.onclick = async (t3) => {
        t3.stopPropagation(), await _f(a, k, e2);
      }, e2.appendChild(t2), e2.appendChild(n2), e2.appendChild(i2), chatMessages.appendChild(e2), chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    showNotification(`\u{1F3AC} Auto-visualization generated for ${o}`, 2e3);
  } catch (e2) {
    console.error("[Auto-Vis] Error generating visualization:", e2);
  }
}
async function _f(e, t, n) {
  const a = gameState.settings?.autoVisualization;
  if (!a) return;
  const o = gameState.chatHistory[e];
  if (!o || t < 0 || t >= o.length) return void showNotification("\u274C Cannot regenerate: Message not found", "error");
  const i = o[t];
  if ("auto-scene" !== i.imageType) return void showNotification("\u274C Cannot regenerate: Not an auto-visualization", "error");
  const s = gameState.employees.find((t2) => t2.id === e);
  if (!s) return void showNotification("\u274C Cannot regenerate: Employee not found", "error");
  const r = n?.querySelector(".auto-vis-regen-btn");
  r && (r.disabled = true, r.innerHTML = "\u23F3 Generating...", r.style.opacity = "0.6");
  try {
    const e2 = s.name, l = o.slice(0, t).slice(-15).filter((e3) => "auto-scene" !== e3.imageType).map((e3) => `${e3.sender}: ${e3.content}`).join("\n") || "", c = getPhysicalDescriptionForPrompt(s), d = gameState.settings?.playerBio || "the player", p = s.race && "human" !== s.race ? s.race : null, m = s.physical?.raceFeatures?.description || null, u2 = i.perspective || a.perspective || "dynamic", g = Rf(a.nsfwLevel, s, l), h = ["\n\nIMPORTANT: Create a DIFFERENT COMPOSITION of this scene. Keep the same visual style/medium, but use a fresh angle, new poses, different expressions, alternative lighting.", "\n\nIMPORTANT: Reimagine this moment with different emphasis. Keep the same art style, but if the previous image was close-up, go wider. If it was intimate, add more environmental detail. Show a NEW angle.", "\n\nIMPORTANT: Generate a UNIQUE variation. Keep the same visual medium/style, but focus on different body language, altered composition, new camera positioning. Make this feel fresh and distinct.", "\n\nIMPORTANT: Take a different creative direction for COMPOSITION ONLY. Same art style, but new mood, new atmosphere, different focus. Show what the previous image didn't capture.", "\n\nIMPORTANT: Create an alternate version with different pose/framing. Keep the same visual style, but vary the pose, expression, framing, and emotional tone significantly."], y = h[Math.floor(Math.random() * h.length)], f = Df(u2, e2, c, d, l, g, p, m) + y;
    console.log(`[Auto-Vis Regen] Regenerating for ${e2} at index ${t}`);
    let b = await queuedGenerateText(f, { temperature: 0.95, max_tokens: 250, stopSequences: ["---", "Note:", "Remember:", "Visual Details:", "**Visual", "Word count:", "ASSISTANT:", "Human:"] }, `Regenerating auto-visualization for ${e2}`);
    b = extractText(b), b = b.replace(/<image prompt>/gi, "").replace(/<\/image prompt>/gi, "").trim(), b = b.replace(/^\*\*Image Prompt:\*\*\s*/gi, ""), b = b.replace(/\*\*Visual Details:\*\*[\s\S]*/gi, ""), b = b.replace(/\*\(Word count:.*?\)\*/gi, ""), b = b.replace(/\n\*\*.*?\*\*/g, ""), b = b.replace(/\n\s*-\s+\*\*.*?:\*\*/g, ""), b = b.trim(), console.log("[Auto-Vis Regen] New prompt:", b.substring(0, 100) + "...");
    const v = fu(b);
    console.log("[Auto-Vis Regen] Applying style:", a.style || "global", "(global style:", gameState.settings?.imageStyle, ")");
    const w = Bf(v, a.style), x = "object" == typeof w && w?.prompt ? w.prompt : String(w);
    console.log("[Auto-Vis Regen] Styled prompt:", x.substring(x.length - 200));
    const S = await queuedGenerateImage(x, `Regenerating auto-visualization for ${e2}`);
    if (i.imageUrl = S, i.imagePrompt = b, i.regenerationCount = (i.regenerationCount || 0) + 1, n) {
      const e3 = n.querySelector("img");
      e3 && (e3.src = S, e3.onclick = () => {
        const e4 = document.createElement("div");
        e4.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bn); z-index:99999; display:flex; justify-content:center; align-items:center; cursor:pointer;", e4.innerHTML = `<img src="${S}" style="max-width:90%; max-height:90%; border-radius:10px;">`, e4.onclick = () => e4.remove(), document.body.appendChild(e4);
      });
    }
    r && (r.disabled = false, r.innerHTML = "\u{1F504} Regenerate" + (i.regenerationCount > 1 ? ` (${i.regenerationCount}x)` : ""), r.style.opacity = "1"), showNotification(`\u267B\uFE0F Auto-visualization regenerated! (${i.regenerationCount}x)`, 2e3);
  } catch (e2) {
    console.error("[Auto-Vis Regen] Error:", e2), r && (r.disabled = false, r.innerHTML = "\u{1F504} Regenerate", r.style.opacity = "1"), showNotification("\u274C Failed to regenerate image", "error");
  }
}
function Rf(e, t, n) {
  const a = /\b(kiss|touch|caress|naked|nude|undress|sex|moan|aroused|pleasure|intimate|bed|bedroom)\b/i.test(n), o = /\b(flirt|tease|wink|blush|attractive|beautiful|sexy|cute|hot)\b/i.test(n), i = t.memory?.intimacyLevel || 0, s = t.stats?.desire || 0;
  switch (t.stats, e) {
    case "sfw":
      return "IMPORTANT: Keep the image SAFE FOR WORK. No nudity, no sexual content, no suggestive poses. Focus on wholesome, professional, or casual scenes only. All clothing must be appropriate and non-revealing.";
    case "suggestive":
      return "ALLOWED: Suggestive but not explicit content. Flirty poses, revealing (but not nude) clothing, romantic tension. No full nudity or explicit sexual acts. Think: lingerie, swimwear, romantic moments, teasing poses.";
    case "explicit":
      return a && (i > 40 || s > 50) ? "EXPLICIT CONTENT ALLOWED: The conversation has intimate/sexual content and the relationship supports it. Generate appropriately explicit imagery matching the conversation's tone. Include anatomical details, arousal indicators, and explicit poses if the context calls for it. Don't hold back - match the energy of the conversation." : o ? "SUGGESTIVE TO MILDLY EXPLICIT: The conversation has flirty undertones. Generate appropriately sensual content - can include partial nudity, suggestive poses, intimate moments. Match the tone without going beyond what the conversation implies." : "CONTEXT-APPROPRIATE: Generate content matching the conversation's actual tone. If it's professional, keep it professional. If it's intimate, reflect that appropriately.";
    default:
      return a && (i > 30 || s > 40) ? `MATCH CONVERSATION TONE: The conversation contains intimate/sexual content (intimacy: ${i}, desire: ${s}). Generate imagery that matches this intimate tone. Explicit content is appropriate and expected. Show the scene as it would actually look based on what's being discussed.` : o || s > 30 ? "MATCH CONVERSATION TONE: The conversation has flirtatious/suggestive elements. Generate appropriately sensual or romantic imagery. Suggestive poses and partial reveals are appropriate." : "MATCH CONVERSATION TONE: The conversation appears to be casual/professional. Generate appropriate imagery without unnecessary sexualization. Keep it natural and contextually fitting.";
  }
}
function Df(e, t, n, a, o, i, s = null, r = null) {
  const l = `Based on the conversation context, create a DETAILED, SPECIFIC image generation prompt.
Focus on VISUAL DETAILS: poses, expressions, body language, clothing state, setting, lighting, mood.
${i}${s ? `
\u26A0\uFE0F CRITICAL: ${t} is a ${s}${r ? ` with ${r}` : ""}. Show these non-human features accurately!` : ""}
\u{1F4CA} PARTICIPANTS: This scene has EXACTLY 2 people (${t} and the player) unless conversation mentions others.
Write ONLY the raw image prompt. NO markdown, NO headers, NO labels. 100-200 words.`;
  switch (e) {
    case "first-person":
      return `You are generating a DETAILED **POV FIRST-PERSON IMAGE PROMPT** for the CURRENT MOMENT in this conversation.

Recent conversation between player and ${t}:
${o}

Character descriptions:
${t}: ${n} (focus on her appearance from player's POV)
Player: Invisible POV camera/first-person view representing ${a}

CRITICAL POV REQUIREMENTS:
1. FIRST-PERSON CLOSE-UP VIEW - From the player's eye level, as if you ARE the player looking at the scene
2. Player's hands/body may be visible if interacting (reaching out, touching, etc.)
3. Show ${t}'s full appearance from this intimate vantage point
4. Her expressions, eyes looking at camera (at YOU), body language directed at viewer
5. Include environmental details visible from player's position
6. Camera angle should feel immersive - you're IN the scene, not watching it

${i}

Start the prompt with "POV first-person photo of ${t}..." or "First-person view of ${t}..."
Write ONLY the raw POV image prompt. NO extras, NO markdown. 100-200 words.`;
    case "third-person":
      return `You are generating a DETAILED **THIRD-PERSON IMAGE PROMPT** showing BOTH characters in the scene.

Recent conversation between player and ${t}:
${o}

Character descriptions:
${t}: ${n}
Player: ${a}

THIRD-PERSON REQUIREMENTS:
1. OBSERVER VIEW - Camera positioned to show both the player and ${t}
2. Show the interaction between both characters
3. Include both characters' poses, expressions, and body language
4. Medium to wide shot capturing the full scene
5. Environmental context and setting details
6. Natural lighting and composition showing the relationship dynamic

${l}`;
    case "cinematic":
      return `You are generating a DETAILED **CINEMATIC IMAGE PROMPT** for a dramatic wide shot of this scene.

Recent conversation between player and ${t}:
${o}

Character descriptions:
${t}: ${n}
Player: ${a}

CINEMATIC REQUIREMENTS:
1. WIDE CINEMATIC SHOT - Film-quality composition
2. Dramatic lighting (rim lighting, volumetric, atmospheric)
3. Show the full environment and setting
4. Characters positioned dramatically within the frame
5. Movie poster quality composition
6. Depth of field and professional cinematography feel

${l}`;
    case "intimate":
      return `You are generating a DETAILED **INTIMATE CLOSE-UP IMAGE PROMPT** focusing on emotional connection.

Recent conversation between player and ${t}:
${o}

Character descriptions:
${t}: ${n}
Player: ${a}

INTIMATE CLOSE-UP REQUIREMENTS:
1. TIGHT FRAMING - Close-up on faces, expressions, points of contact
2. Emphasize emotional connection and body language details
3. Soft, romantic or intense lighting depending on mood
4. Focus on eyes, lips, hands, and intimate details
5. Shallow depth of field for dreamy quality
6. Capture the emotional intensity of the moment

${l}`;
    case "voyeur":
      return `You are generating a DETAILED **VOYEUR PERSPECTIVE IMAGE PROMPT** as if observing from a hidden position.

Recent conversation between player and ${t}:
${o}

Character descriptions:
${t}: ${n}
Player: ${a}

VOYEUR REQUIREMENTS:
1. HIDDEN OBSERVER VIEW - As if watching through a doorway, window, or from hiding
2. Partial obstruction or framing elements (door frame, curtain, etc.)
3. Characters unaware of being watched
4. Candid, natural poses and interactions
5. Slightly distant or obscured view adding tension
6. Atmospheric lighting suggesting secrecy

${l}`;
    default:
      return `You are generating a DETAILED IMAGE PROMPT for the CURRENT MOMENT in this conversation.
Choose the BEST camera angle and perspective to capture this specific moment dramatically.

Recent conversation between player and ${t}:
${o}

Character descriptions:
${t}: ${n}
Player: ${a}

DYNAMIC PERSPECTIVE - Choose the most impactful angle:
- If intimate moment: close-up or first-person
- If action/drama: cinematic wide shot
- If conversation: medium two-shot
- If revealing/teasing: suggestive angle
- Match the energy of what's actually happening

${l}`;
  }
}
function Bf(e, t) {
  if ("global" === t || !t) return applyImageStyle(e);
  const n = gameState.settings?.imageStyle;
  gameState.settings.imageStyle = t;
  const a = applyImageStyle(e);
  return gameState.settings.imageStyle = n, a;
}
async function updateEmployeeStatsFromChat(e, t, n) {
  if (!e || !e.stats) return;
  const a = ol(), o = gameState.settings?.guidelines ?? 50, i = gameState.settings?.atmosphere ?? 50, s = i < 33 ? "PROFESSIONAL office: Formal behavior expected. Personal topics, flirting, or casual banter may DECREASE comfort/affection unless trust is already very high. Work-focused conversations are valued." : i > 66 ? "RELAXED office: Casual, friendly environment. Personal topics, humor, and informal chat INCREASE comfort/affection easily. Formality might seem stiff or awkward." : "BALANCED office: Friendly professionalism. Personal topics are fine when rapport exists. Both formal and casual approaches can work depending on relationship level.", r = o < 33 ? "NPC has RESERVED personality: Slow to warm up, guarded. Compliments and friendliness may DECREASE comfort initially (seems too forward). Trust builds slowly. Pushback and sarcasm are normal. Rate harshly on pushy/forward behavior." : o > 66 ? "NPC has OUTGOING personality: Warm and open. Friendly behavior and compliments INCREASE affection easily. Coldness or distance DECREASES stats. Be lenient - they want to connect." : "NPC has STANDARD personality: Balanced responses. Rate authentically based on the message quality. Not overly harsh or lenient.", l = "open" === a ? "ENTHUSIASTIC consent model: NPCs are receptive to romantic/intimate advances. Flirting and personal interest INCREASE desire and affection. Be lenient with advances - they're welcome. Only decrease stats for genuinely disrespectful behavior." : "professional" === a ? "PROFESSIONAL consent model: Boundaries are important. Romantic/intimate advances may DECREASE comfort/trust unless relationship stats are already very high (70+). Respect for boundaries is valued." : "CASUAL consent model: NPCs need moderate trust/comfort before being receptive. Advances when stats are low (below 40) may decrease comfort. When stats are good (50+), advances are welcome.", c = (gameState.chatHistory[e.id]?.slice(-4).map((e2) => `${e2.sender}: ${e2.content}`).join("\n"), `FORMAT: Output EXACTLY five SMALL integers, each between -10 and +10, separated by single spaces. These are per-message CHANGES (deltas), NOT 0-100 scores. Example: "5 3 2 4 1" or "-2 0 1 -1 3". NEVER output values like 50, 80, or 100 \u2014 those are out of range and wrong. Do not add rationale or explanation, even silently.

RULES: Judge exchange; NPC consent/enthusiasm=increase; high stats(70+)=tolerant; gossip=bond
Stats: Aff:${e.stats.affection ?? 0} Com:${e.stats.comfort ?? 0} Tru:${e.stats.trust ?? 0} Des:${e.stats.desire ?? 0} Obe:${e.stats.obedience ?? 0}
Culture: ${s} ${r} ${l}

Player: "${t}"
NPC: "${n}"

Output (Affection Comfort Trust Desire Obedience):`);
  try {
    const a2 = await queuedGenerateText(c, { temperature: 0, top_p: 0, max_tokens: 14, stopSequences: ["\n", ".", ",", "Affection", "Rationale", "Why", "Because", "(", "[", "The", "This", "I", "A", "Rating"] }, `Evaluating chat interaction stats for ${e.name}`), u2 = a2.trim().replace(/[^\d\s\-+]/g, "").split(/\s+/).map((e2) => parseFloat(e2)).filter((e2) => !isNaN(e2)), o2 = u2.map((e2) => Math.max(-10, Math.min(10, e2)));
    if (u2.slice(0, 5).filter((e2) => Math.abs(e2) > 10).length >= 2) return console.warn(`[Stat Eval] scale-mismatch \u2014 model returned out-of-range values [${u2.slice(0, 5).join(", ")}] (expected [-10,+10]); discarding AI eval, using keyword fallback`), void Ff(e, t, n);
    if (console.log(`[Stat Eval] Raw: "${a2.substring(0, 50)}" \u2192 Parsed: [${o2.join(", ")}]`), o2.length >= 5) {
      const t2 = (n || "").toLowerCase(), a3 = /\b(yes|okay|sure|love|want|enjoy|feel.*good|amazing|please|more|don't.*stop|keep.*going|feels.*so|like.*that|mm+|ah+|oh+.*god|fuck.*yes)\b/.test(t2), i2 = /\b(love|amazing|incredible|perfect|yes+|god.*yes|so.*good|feels.*amazing|want.*more|don't.*stop)\b/.test(t2), s2 = /\b(no|stop|don't|uncomfortable|not.*ready|too.*much|can't|won't|shouldn't|wait|slow.*down)\b/.test(t2), r2 = ((e.stats.affection ?? 50) + (e.stats.comfort ?? 50) + (e.stats.trust ?? 50) + (e.stats.desire ?? 20)) / 4 >= 70, l2 = (t3, n2, o3, l3 = 100, c2 = 0) => {
        n2 < -3 && a3 && !s2 && (console.log(`[Stat Protection] ${e.name}'s ${o3}: Capping drop from ${n2} to -2 (NPC showed consent)`), n2 = Math.max(n2, -2)), n2 < -5 && r2 && !s2 && (console.log(`[Stat Protection] ${e.name}'s ${o3}: Capping drop from ${n2} to -3 (strong relationship)`), n2 = Math.max(n2, -3)), n2 > 0 && i2 && (n2 *= 1.5, console.log(`[Stat Bonus] ${e.name}'s ${o3}: Amplifying gain to ${n2.toFixed(1)} (NPC enthusiastic)`));
        const d = gameState.cheatMultipliers?.[o3.toLowerCase()] || 1;
        1 !== d && (n2 *= d, console.log(`[Cheat Multiplier] ${e.name}'s ${o3}: ${d.toFixed(1)}x multiplier applied`));
        let p = t3 + n2;
        return n2 > 0 && t3 > 80 ? p = t3 + 0.5 * n2 : n2 > 0 && t3 > 90 && (p = t3 + 0.25 * n2), Math.max(c2, Math.min(l3, p));
      };
      e.stats.affection = l2(e.stats.affection ?? 50, o2[0], "Affection"), e.stats.comfort = l2(e.stats.comfort ?? 50, o2[1], "Comfort"), e.stats.trust = l2(e.stats.trust ?? 50, o2[2], "Trust"), e.stats.desire = l2(e.stats.desire ?? 20, o2[3], "Desire"), e.stats.obedience = l2(e.stats.obedience ?? 50, o2[4], "Obedience"), console.log(`[Stat Update] ${e.name}: Aff${o2[0] > 0 ? "+" : ""}${o2[0]} Com${o2[1] > 0 ? "+" : ""}${o2[1]} Tru${o2[2] > 0 ? "+" : ""}${o2[2]} Des${o2[3] > 0 ? "+" : ""}${o2[3]} Obe${o2[4] > 0 ? "+" : ""}${o2[4]}${a3 ? " [CONSENT]" : ""}${i2 ? " [ENTHUSIASTIC]" : ""}${s2 ? " [DISCOMFORT]" : ""}`), "people" === gameState.activeTab && updatePeopleTab();
    } else console.warn("[Stat Update] AI evaluation failed, using fallback"), Ff(e, t, n);
  } catch (a2) {
    console.error("[Stat Update] Error:", a2), Ff(e, t, n);
  }
}
function Ff(e, t, n) {
  const a = (t || "").toLowerCase(), o = (n || "").toLowerCase();
  /\b(thank|appreciate|grateful|wonderful|amazing|great job)\b/.test(a) && (e.stats.affection = Math.min(100, (e.stats.affection ?? 50) + 3)), /\b(stupid|idiot|useless|hate)\b/.test(a) && (e.stats.affection = Math.max(0, (e.stats.affection ?? 50) - 5)), /\b(comfortable|relaxed|casual|easy|chill)\b/.test(a) && (e.stats.comfort = Math.min(100, (e.stats.comfort ?? 50) + 2)), /\b(nervous|anxious|worried|uncomfortable)\b/.test(o) && (e.stats.comfort = Math.max(0, (e.stats.comfort ?? 50) - 3)), /\b(honest|truth|trust|believe|promise)\b/.test(a) && (e.stats.trust = Math.min(100, (e.stats.trust ?? 50) + 2)), /\b(lie|lied|dishonest|deceive)\b/.test(a) && (e.stats.trust = Math.max(0, (e.stats.trust ?? 50) - 4)), /\b(beautiful|gorgeous|sexy|hot|attractive|cute)\b/.test(a) && (e.stats.desire = Math.min(100, (e.stats.desire ?? 20) + 4)), /\b(date|dinner|kiss|touch|want you)\b/.test(a) && (e.stats.desire = Math.min(100, (e.stats.desire ?? 20) + 3)), /\b(good job|well done|excellent|perfect)\b/.test(a) && (e.stats.obedience = Math.min(100, (e.stats.obedience ?? 50) + 2)), /\b(no|won't|refuse|can't make me)\b/.test(o) && (e.stats.obedience = Math.max(0, (e.stats.obedience ?? 50) - 2)), /\b(work|project|task|deadline)\b/.test(a) && (e.stats.productivity = Math.min(100, (e.stats.productivity ?? 50) + 1)), Qf(e, t, n);
}
function jf(e) {
  if (!e) return;
  const t = e.toLowerCase(), n = ["meeting", "deadline", "project", "presentation", "report", "work", "coffee", "lunch", "drinks", "party", "dinner", "hangout", "keys", "phone", "laptop", "car", "desk", "folder", "lost", "found", "looking for", "searching", "organize", "clean", "garage", "parking", "office", "break room", "kitchen", "monday", "tuesday", "wednesday", "thursday", "friday", "weekend", "tired", "stressed", "excited", "happy", "frustrated"].filter((e2) => t.includes(e2));
  if (n.length > 0) {
    const e2 = n.join("_");
    ge.recentTopics.set(e2, Date.now());
    const t2 = Date.now() - 3e5;
    for (const [e3, n2] of ge.recentTopics.entries()) n2 < t2 && ge.recentTopics.delete(e3);
  }
}
function qf(e) {
  if (!e) return false;
  const t = e.toLowerCase(), n = Date.now() - 18e4;
  for (const [e2, a] of ge.recentTopics.entries()) if (a > n) {
    const n2 = e2.split("_");
    if (n2.filter((e3) => t.includes(e3)).length >= Math.ceil(n2.length / 2)) return true;
  }
  return false;
}
