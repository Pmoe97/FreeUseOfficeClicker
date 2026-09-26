// ============================================================================
// 42-social-comments-ai — AI comments: comment generation pipeline, autonomous comments/likes, mention responses, image detection, news feed.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function ah(e) {
  const t = [], n = e.match(/\*\([^)]{0,50}/g);
  n && t.push(...n);
  const a = e.match(/\*\*\([^)]{0,50}/g);
  a && t.push(...a);
  const o = e.match(/\{(SEEDS|BAN|BOOST):[^}]+\}/g);
  return o && t.push(...o), ["Balanced authenticity", "Expresses excitement", "Fits outgoing", "conveys professionalism", "Emojis reinforce", "reinforces determined", "Balances professionalism", "hints at role", "subtly conveys", "(Note:", "(Approach:", "(Style:", "(Character count:", "(Emojis used:"].forEach((n2) => {
    e.includes(n2) && t.push(n2);
  }), t;
}
function ih(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  return t ? { outgoing: t.personality?.outgoing || 50, professional: t.personality?.professional || 50, flirty: t.personality?.flirty || 50, confidence: t.personality?.confidence || 50 } : null;
}
function cleanWithLearning(e) {
  if (!e) return e;
  let t = e;
  return [/\*\([^)]*\)\*/g, /\*\*\([^)]*\)\*\*/g, /\{SEEDS:[^\}]*\}/gi, /\{BAN:[^\}]*\}/gi, /\{BOOST:[^\}]*\}/gi, /\{META:[^\}]*\}/gi, /\(Note:[^\)]*\)/gi, /\(This [^\)]*\)/gi, /\(Balanced [^\)]*\)/gi, /\(Expresses [^\)]*\)/gi, /\(Fits [^\)]*\)/gi, /\(Captures [^\)]*\)/gi, /\(Shows [^\)]*\)/gi, /\(Hints at [^\)]*\)/gi, /\(Reflects [^\)]*\)/gi, /\(Personality:[^\)]*\)/gi, /\(Analysis:[^\)]*\)/gi, /\(Context:[^\)]*\)/gi, /\*\*\*[^\*]*\*\*\*/g, /\[meta[^\]]*\]/gi, /\[Note:[^\]]*\]/gi, /\[This [^\]]*\]/gi, /caught in mid[- ]\w+/gi, /\bmid[- ](laugh|sip|bite|smile|stretch|yawn|thought|action|conversation|stride|gesture)/gi].forEach((e2) => {
    t = t.replace(e2, "");
  }), (gameState.aiQuality?.bannedPatterns || []).forEach((e2) => {
    try {
      const n = e2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), a = new RegExp(n, "gi");
      t = t.replace(a, "");
    } catch (u2) {
      console.warn("Invalid banned pattern:", e2, u2);
    }
  }), t = t.replace(/\n{3,}/g, "\n\n"), t = t.replace(/  +/g, " "), t = t.trim(), t;
}
function rh() {
  gameState.aiQuality.tutorialShown = true;
  const e = document.createElement("div");
  e.id = "aiTrainingTutorial", e.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--an); display:flex; align-items:center; justify-content:center; z-index:10001; padding:20px;", e.innerHTML = ` <div style="background:linear-gradient(135deg, var(--w) 0%, var(--ae) 100%); border:2px solid var(--d); border-radius:20px; max-width:600px; width:100%; padding:40px; box-shadow:0 8px 32px rgba(0,212,255,0.3); position:relative;"> <div style="text-align:center; margin-bottom:30px;"> <div style="font-size:4rem; margin-bottom:15px;">\u{1F916}\u2728</div> <h2 style="color:var(--b); margin:0; font-size:1.8rem; margin-bottom:10px;">Train Your AI!</h2> <div style="color:var(--d); font-size:1.1rem; font-weight:600;">Reinforcement Learning from Human Feedback</div> </div> <div style="background:rgba(0,212,255,0.1); padding:20px; border-radius:12px; border-left:4px solid var(--d); margin-bottom:25px;"> <p style="color:var(--y); line-height:1.8; margin:0; font-size:0.95rem;"> Help improve AI-generated content quality by voting on posts, comments, and chat messages! </p> </div> <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:25px;"> <div style="background:rgba(78,204,163,0.15); padding:20px; border-radius:12px; border:1px solid var(--g);"> <div style="font-size:2rem; margin-bottom:10px;">\u{1F44D}</div> <h3 style="color:var(--g); margin:0 0 10px 0; font-size:1.1rem;">Upvote</h3> <p style="color:var(--y); font-size:0.85rem; margin:0; line-height:1.6;"> Quality content, coherent writing, good formatting, immersive text </p> </div> <div style="background:rgba(233,69,96,0.15); padding:20px; border-radius:12px; border:1px solid var(--k);"> <div style="font-size:2rem; margin-bottom:10px;">\u{1F44E}</div> <h3 style="color:var(--k); margin:0 0 10px 0; font-size:1.1rem;">Downvote</h3> <p style="color:var(--y); font-size:0.85rem; margin:0; line-height:1.6;"> Meta-commentary *(like this)*, {SEEDS:tokens}, analysis, broken formatting </p> </div> </div> <div style="background:var(--bb); padding:20px; border-radius:12px; margin-bottom:25px;"> <h3 style="color:var(--b); margin:0 0 15px 0; font-size:1rem;">\u{1F4CA} Training Progress</h3> <div style="display:flex; flex-direction:column; gap:10px;"> <div style="display:flex; justify-content:space-between; align-items:center;"> <span style="color:var(--a); font-size:0.9rem;">30 votes</span> <span style="color:var(--g); font-size:0.9rem;">\u2192 Noticeable improvement</span> </div> <div style="display:flex; justify-content:space-between; align-items:center;"> <span style="color:var(--a); font-size:0.9rem;">100 votes</span> <span style="color:var(--d); font-size:0.9rem;">\u2192 Significant quality boost</span> </div> <div style="display:flex; justify-content:space-between; align-items:center;"> <span style="color:var(--a); font-size:0.9rem;">1000+ votes</span> <span style="color:var(--m); font-size:0.9rem;">\u2192 Excellent AI behavior</span> </div> </div> </div> <button onclick="this.closest('#aiTrainingTutorial').remove()" style="width:100%; padding:15px; background:linear-gradient(135deg, var(--u), var(--dg)); border:none; border-radius:12px; color:var(--q); font-size:1.1rem; font-weight:600; cursor:pointer; transition:all 0.3s; box-shadow:0 4px 12px rgba(0,212,255,0.3);" onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,212,255,0.4)'" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,212,255,0.3)'"> Got it! Let's train some AI \u{1F680} </button> </div> `, document.body.appendChild(e), saveGame();
}
async function addCommentToPost(e, t, n = null) {
  if (!t.trim()) return;
  const a = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!a) return;
  const o = Zf(t), i = o.map((e2) => e2.employeeId);
  debugLog("Social", `Comment mentions: ${JSON.stringify(o)}`);
  const s = createComment({ postId: e, authorId: "player", authorName: "You", content: t.trim(), replyToCommentId: n, mentionedEmployees: i });
  if (a.comments.push(s), console.log(`[Comments] Player added comment to post ${e}. Total comments: ${a.comments.length}`), a.isPlayerPost || "player" === a.authorId || addSocialNotification({ type: "comment", fromId: "player", fromName: "The Boss", postId: a.id, preview: t.substring(0, 60), targetAuthorId: a.authorId }), i.forEach((e2) => {
    trackPlayerMention(e2);
  }), i.length > 0 && (debugLog("Social", `Scheduling mention responses for: ${i.join(", ")}`), setTimeout(async () => {
    await triggerCommentMentionResponse(s, a);
  }, 2e3 + 3e3 * Math.random())), !a.isPlayerPost && a.authorId && 0 === i.length && setTimeout(async () => {
    await sh(a, s);
  }, 2e3 + 3e3 * Math.random()), a.comments.length >= 3) {
    const e2 = Math.min(0.6, 0.25 + 0.05 * a.comments.length);
    Math.random() < e2 && setTimeout(async () => {
      await dh(a);
    }, 3e3 + 5e3 * Math.random());
  }
}
async function detectAndGenerateCommentImage(e, t, n) {
  console.log(`[Social Image Detection] Checking comment from ${t.name}: "${e}"`);
  const a = /\b(upload(ed)?|post(ed)!?|here('s| is)|check (it )?out|attached|sent|added|send(ing)?|ping(ing)?|dm(ing|ed)?|shar(e|ed|ing)|showing|brought|slid|slide)\b.*\b(proof|pic(ture)?s?|photo(s)?|image(s)?|it|that|selfie|mine|peek|this|DMs?|direct\s*message)\b/i.test(e) || /\b(proof|pic(ture)?s?|photo(s)?|image(s)?|selfie|mine|peek|shot|snap)\b.*\b(upload(ed)?|post(ed)!?|here|attached|sent|added|send(ing)?|ping(ing)?|dm(ing|ed)?|shar(e|ed|ing)|directly|slide|slid)\b/i.test(e) || /\b(will|gonna|going to|can|could|let me|'ll)\s+(send|ping|dm|share|upload|post|show|slide)\b.*\b(you|boss|@\w+)\b.*\b(proof|pic(ture)?s?|photo(s)?|image(s)?|it|that|selfie|mine|shot)\b/i.test(e) || /\b(my|here'?s?\s+(my|a|the)?)\s+(selfie|pic|photo|image|shot|snap|kitty|cat|dog|pet|garden|proof)\b/i.test(e) || /\b(in|into|to)\s+(your|the)?\s*DMs?\b/i.test(e) || /\b(private(ly)?|exclusive(ly)?)\s+(stream(ing|ed)?|content|shot|photo)\b/i.test(e) || /^(posted|sent|sharing|here'?s)!?\s*[😉🐱🐕🌿🔥💕📸🐈‍⬛]/i.test(e.trim());
  console.log(`[Social Image Detection] Claims image upload: ${a}`);
  const o = (n?.content || n?.caption || "").toLowerCase(), i = /\b(send|post|show|share|upload|pic(s|ture)?|photo|image|proof|selfie|snap|nudes?|tits?|upskirt|panties|flash|reveal)\b/i.test(o);
  let s = false;
  if (!a && i) {
    const e2 = t.memory?.intimacyLevel || 0, n2 = t.stats?.affection || 0, a2 = t.stats?.desire || 0, o2 = 0.45 + Math.min(35, 0.15 * e2 + 0.1 * n2 + 0.08 * a2) / 100;
    Math.random() < o2 ? (s = true, console.log(`[Social Image Detection] Override triggered! Post asks for images, probability ${(100 * o2).toFixed(0)}% passed. Generating image despite no explicit claim in comment.`)) : console.log(`[Social Image Detection] Override roll failed (${(100 * o2).toFixed(0)}% chance). No image this time.`);
  }
  if (!a && !s) return { imageUrl: null, imageAlt: null };
  if (console.log(`[Social Image Detection] Image ${s ? "override" : "claim"} detected! Checking generateImage function...`), console.log(`[Social Image Detection] generateImage available: ${"function" == typeof generateImage}`), "function" != typeof generateImage) return console.warn("[Social Image Detection] generateImage function not available - skipping image generation"), { imageUrl: null, imageAlt: null };
  try {
    const a2 = n.content || n.caption || "", o2 = getPhysicalDescriptionForPrompt(t), i2 = t.memory?.intimacyLevel || 0, s2 = t.stats?.affection || 0, r = t.stats?.desire || 0, l = t.personality?.flirty > 65, c = `You are an expert at creating image prompts for AI image generation. You must analyze what the original post REQUESTED and what the comment CLAIMS to provide, then create a prompt that fulfills that request.

=== ORIGINAL POST ===
"${a2}"

=== NPC'S COMMENT ===
"${e}"

=== PERSON DETAILS ===
${t.name}: ${o2.substring(0, 300)}

=== RELATIONSHIP CONTEXT ===
- Intimacy: ${i2}/100 (${i2 < 30 ? "casual acquaintances" : i2 < 60 ? "friends/comfortable" : "intimate/very close"})
- Affection: ${s2}/100
- Desire: ${r}/100
${l ? "- Flirty/playful personality" : ""}

=== YOUR TASK ===
Create a detailed image prompt that shows what ${t.name} is sharing/uploading in their comment.

\u26A0\uFE0F IMPORTANT: The NPC has ALREADY AGREED to post this content by commenting. Your job is to fulfill their promise, NOT to second-guess whether they should post it based on intimacy level.

CRITICAL RULES:
1. READ THE POST CAREFULLY - What did the player ASK for? (upskirt? nudes? tits? explicit? cat photo? etc.)
2. READ THE COMMENT - What did ${t.name} CLAIM to share? (if vague like "here's mine", refer back to post request)
3. FULFILL THE REQUEST EXACTLY - If post says "upskirt panty shots", the image MUST show upskirt view with panties visible
4. MATCH THE REQUEST EXPLICITNESS:
   - Post asks for "upskirt" \u2192 LOW camera angle looking UP, panties/underwear visible between legs
   - Post asks for "nudes" \u2192 Show full nudity, body exposed
   - Post asks for "tits" \u2192 Show exposed breasts, nipples visible
   - Post asks for "pussy" \u2192 Show explicit genital focus, legs spread showing genitals clearly
   - Post asks for "masturbating" \u2192 Show explicit sexual activity, hand on genitals
   - Post asks for "cat photo" \u2192 Show an actual cat/pet, NOT the person
5. DO NOT CENSOR - The NPC already agreed to post, so show what was requested regardless of intimacy level
6. BE SPECIFIC about clothing state: "wearing nothing", "topless", "completely nude", "panties pulled aside", etc.
7. DESCRIBE camera angles: "low angle looking up", "POV from below", "close-up", "full body view"
8. If comment mentions "kitty pic" in response to sexual request \u2192 It's likely a tease/deflection, generate actual cat
9. Include ${t.name}'s physical appearance when they're in the image

Generate ONLY the image prompt, no explanation:`;
    let d = (await queuedGenerateText(c, { temperature: 0.8, max_tokens: 150, stopSequences: ["\n\n", "\n---", "Note:", "Example:", "CONTEXT:", "Rationale:", "Based on"] }, `Social Image Prompt - ${t.name}`)).trim().replace(/^["']|["']$/g, "").replace(/^\*+|\*+$/g, "").replace(/^(Image prompt:|DETAILED PROMPT:|Final prompt:|Prompt:|Here is|Here's|Based on.*?:)\s*/i, "").replace(/^(the|a|an)\s+(specific\s+)?image\s+prompt\s+(for|of|showing).*?:\s*/i, "").replace(/\s*\([^)]*Note:.*\)$/i, "").split("\n")[0].trim();
    if (/^(based on|context|the prompt|this prompt|according to)/i.test(d)) {
      const e2 = d.match(/:\s*(.+)$/);
      e2 && (d = e2[1].trim());
    }
    console.log(`[Social Image] Generated prompt for ${t.name}: "${d.substring(0, 100)}..."`);
    const p = await queuedGenerateImage(applyImageStyle(d), `Social reply image for ${t.name}`);
    return console.log("[Social Image] Image generated successfully!"), t.photos || (t.photos = []), t.photos.push({ url: p, prompt: d, type: "social_comment", timestamp: gameState.time?.currentTime || Date.now() }), console.log(`[Social Image] Added comment image to ${t.name}'s gallery`), { imageUrl: p, imageAlt: d, imagePrompt: d };
  } catch (e2) {
    return console.error("[Social] Failed to generate claimed image:", e2), { imageUrl: null, imageAlt: null };
  }
}
async function sh(e, t) {
  const n = gameState.employees.find((t2) => t2.id === e.authorId);
  if (n && !(n.employmentStatus && "active" !== n.employmentStatus || Math.random() > 0.7)) try {
    const a = /\b(send|post|show|share|upload|give|let me see|wanna see|want to see|pic(s|ture)?|photo|image|proof|snap)\b/i.test(t.content) && /\b(pic(s|ture)?|photo|image|proof|selfie|that|it)\b/i.test(t.content) || /\b(pics? or it didn'?t happen|proof or (it )?didn'?t happen|I('ll| will) believe it when I see it)\b/i.test(t.content);
    console.log(`[Social Image Request] Player comment requesting image: ${a}`);
    const o = Er(n, "social.comment", { message: t.content, involves: ["player"], keywords: t.content.toLowerCase().split(/\s+/).filter((e2) => e2.length > 3).slice(0, 10), postContext: e.content || e.caption }), i = n.relationships?.player || { level: 0, type: "professional" }, s = n.memory?.intimacyLevel || 0, r = n.personality || {}, l = r.flirty || 50;
    r.confidence, r.humor;
    let c = "friendly";
    const d = (t.content || "").toLowerCase();
    (s > 60 || i.level > 60) && (c = "warm"), s > 80 && (c = "flirty"), (d.includes("love") || d.includes("beautiful") || d.includes("gorgeous")) && (c = l > 60 ? "flirty" : "appreciative"), (d.includes("lol") || d.includes("haha") || d.includes("\u{1F602}")) && (c = "playful");
    const p = ol();
    let m = "";
    m = "open" === p ? '\u{1F51E} WORKPLACE CULTURE: This is an open, sex-positive workplace where explicit content is NORMAL and accepted. DO NOT act shocked, suggest keeping things "PG", or moralize about sexual content. Everyone is comfortable with adult topics - respond naturally and match the energy without judgment.' : "professional" === p ? "WORKPLACE CULTURE: Maintain professional boundaries even when responding to explicit content." : "WORKPLACE CULTURE: Relaxed office - adult content is acceptable, respond naturally based on your comfort level.";
    const u2 = /\b(fuck|cock|pussy|dick|cum|sex|explicit|nude|naked|ass|tits|nipple)\b/i.test(t.content), g = `${m}

${o}

SITUATION:
Your post: "${e.content || e.caption || ""}"
${e.imageAlt ? `(with image: ${e.imageAlt})` : ""}

@TheBoss just commented: "${t.content}"
${u2 ? "(This is explicit/sexual content - respond naturally without acting shocked or prudish)" : ""}
${a ? `
\u{1F3AF} IMAGE REQUEST DETECTED: The boss is asking you to send/share/post a picture/photo/proof!
- If comfortable/willing, AGREE and say you'll post/share/send it (use phrases like "here's", "posted", "sending", "uploaded")
- Or playfully tease/decline based on relationship and what they're asking for
- Consider what they're requesting and your comfort level (Intimacy: ${n.memory?.intimacyLevel || 0}/100)
` : ""}

Your voice (write in this style): ${Gr(n)}

Reply to their comment briefly (max 100 characters).

TONE: ${c}
${"flirty" === c ? "- Be subtly flirty and playful" : ""}
${"warm" === c ? "- Be warm and friendly, show closeness" : ""}
${"appreciative" === c ? "- Show appreciation for the compliment" : ""}
${"playful" === c ? "- Match their playful energy" : ""}
${s > 50 ? "- Use emojis, be casual" : "- Professional but friendly"}

Just write the reply directly (no quotes, no meta-commentary):`;
    let h = (await queuedGenerateText(g, { temperature: 0.9, max_tokens: 40, stopSequences: ["\n\n", "(Word count", "(personality", "I would", "Rating:"] }, `Social Reply - ${n.name}`)).trim().replace(/^["']|["']$/g, "").replace(/\s*\([^)]*personality[^)]*\)\.?$/i, "").replace(/^(I would (say|reply|comment):|My comment would be:)\s*/i, "").replace(/\n\n\(Word count:.*?\)$/i, "").replace(/\s*\*\(\d+\s*characters?\)\*\s*$/i, "").replace(/\s*\(\d+\s*words?\)\s*$/i, "");
    if (!h || 0 === h.length) return;
    const { imageUrl: y, imageAlt: f, imagePrompt: b } = await detectAndGenerateCommentImage(h, n, e), v = createComment({ postId: e.id, authorId: n.id, authorName: n.name, content: h.trim(), imageUrl: y, imageAlt: f, imagePrompt: b });
    e.comments.push(v), console.log(`[Comments] ${n.name} replied to player comment on post ${e.id}. Total comments: ${e.comments.length}`), Hf(n, gameState.player, e, h), remember(n, `Boss commented "${t.content}" on my post, I replied "${h}"`, "interaction", 2);
    const w = document.querySelector(`[data-post-id="${e.id}"]`), x = document.querySelector(`.post-comments[data-post-id="${e.id}"]`);
    w && x && (console.log("[Comments] Immediately updating comments section after NPC reply"), x.style.display = "block", $g(w, e), delete x.dataset.needsRefresh), wg(e.id);
  } catch (e2) {
    console.error("Error generating NPC comment reply:", e2);
  }
}
async function triggerCommentMentionResponse(e, t) {
  if (!e || !t) return void console.log("[Social] triggerCommentMentionResponse called with missing comment or post");
  const n = e.mentionedEmployees || [];
  if (0 !== n.length) {
    console.log(`[Social] Comment mentions ${n.length} NPCs - triggering responses`), console.log("[Social] Mentioned IDs:", n);
    for (const a of n) {
      debugLog("Social", `Processing mention for employee ID: ${a}`);
      const n2 = gameState.employees.find((e2) => e2.id === a);
      if (!n2) {
        console.log(`[Social] \u2717 Employee ${a} not found`);
        continue;
      }
      if ("active" !== n2.employmentStatus) {
        console.log(`[Social] \u2717 ${n2.name} not active (status: ${n2.employmentStatus})`);
        continue;
      }
      console.log(`[Social] \u2713 Found active employee: ${n2.name}`);
      const o = 0.9 + 0.05 * Math.random(), i = Math.random();
      if (debugLog("Social", `${n2.name} roll: ${i.toFixed(3)} vs ${o.toFixed(3)}`), i > o) debugLog("Social", `${n2.name} chose not to respond (${(100 * (1 - o)).toFixed(1)}% chance)`);
      else {
        console.log(`[Social] \u2713 ${n2.name} will respond to mention!`);
        try {
          const a2 = n2.memory?.intimacyLevel || 0, o2 = n2.relationships?.player || { level: 0, type: "professional" }, i2 = n2.personalityTraits || {}, s = i2.flirty || 50, r = i2.confidence || 50, l = i2.humor || 50;
          let c = "";
          const d = t.comments.filter((e2) => !e2.replyToCommentId), p = {};
          t.comments.forEach((e2) => {
            e2.replyToCommentId && (p[e2.replyToCommentId] || (p[e2.replyToCommentId] = []), p[e2.replyToCommentId].push(e2));
          });
          const m = (e2, t2 = 0) => {
            let n3 = `${"  ".repeat(t2)}${e2.authorName}: "${e2.content}"
`;
            return (p[e2.id] || []).forEach((e3) => {
              n3 += m(e3, t2 + 1);
            }), n3;
          };
          let u2 = "";
          u2 = ((e2) => {
            if (!t.comments.find((t2) => t2.id === e2)?.replyToCommentId) {
              const n4 = t.comments.find((t2) => t2.id === e2);
              return m(n4);
            }
            let n3 = t.comments.find((t2) => t2.id === e2);
            for (; n3 && n3.replyToCommentId; ) n3 = t.comments.find((e3) => e3.id === n3.replyToCommentId);
            return n3 ? m(n3) : "";
          })(e.id);
          const g = d.length - (u2 ? 1 : 0);
          c = `${g > 0 ? `(There are ${g} other conversation(s) on this post, but you were mentioned in THIS thread)

` : ""}CONVERSATION THREAD WHERE YOU WERE MENTIONED:
${u2}`;
          let h = "friendly";
          const y = (e.content || "").toLowerCase();
          (a2 > 60 || o2.level > 60) && (h = "warm"), a2 > 80 && (h = "flirty"), (y.includes("love") || y.includes("beautiful") || y.includes("gorgeous")) && (h = s > 60 ? "flirty" : "appreciative"), (y.includes("lol") || y.includes("haha") || y.includes("\u{1F602}")) && (h = "playful");
          const f = [];
          t.comments.forEach((e2) => {
            e2.content.toLowerCase(), /\?\s*(girl|dude|bro|man)/i.test(e2.content) && f.push("question + nickname"), /still\s+(love|like|here|blooming)/i.test(e2.content) && f.push('"still" continuation'), /you\s+(forgot|watered|planted|remember)/i.test(e2.content) && f.push('direct "you" callback'), /😂|😅|💀/i.test(e2.content) && f.push("multiple laughing emojis"), /tho|though$/i.test(e2.content) && f.push('ending with "tho/though"');
          });
          const b = f.length > 0 ? `

\u26A0\uFE0F OTHER COMMENTS USED THESE PATTERNS - BE DIFFERENT:
${[...new Set(f)].map((e2) => `- ${e2}`).join("\n")}
Use a completely DIFFERENT approach/structure!` : "", v = ol();
          let w = "";
          w = "open" === v ? '\u{1F51E} WORKPLACE CULTURE: This is an open, sex-positive workplace where explicit content is NORMAL and accepted. DO NOT act shocked, suggest keeping things "PG", or moralize about sexual content. Everyone is comfortable with adult topics - respond naturally and match the energy without judgment.' : "professional" === v ? "WORKPLACE CULTURE: Maintain professional boundaries even when responding to explicit content." : "WORKPLACE CULTURE: Relaxed office - adult content is acceptable, respond naturally based on your comfort level.";
          const x = /\b(fuck|cock|pussy|dick|cum|sex|explicit|nude|naked|ass|tits|nipple|leak|girl-cock)\b/i.test(e.content + " " + t.content), S = `${w}

You are ${n2.name}, an employee viewing a social media post where @TheBoss (your boss) mentioned YOU in a comment.

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4F1} ORIGINAL POST
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
Author: ${t.authorName}
Type: ${t.type}
Content: "${t.content || "(image only)"}"
${t.imageAlt ? `Image: ${t.imageAlt}` : ""}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4AC} ${c}
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

\u{1F3AF} BOSS MENTIONED YOU: "${e.content}"
${x ? "(Contains explicit content - respond naturally, don't act shocked)" : ""}

\u{1F9E0} YOUR CONTEXT:
- Intimacy with Boss: ${a2}/100
- Relationship: ${o2.type || "professional"} (${o2.level || 0}/100)
- Confidence: ${r}/100, Flirty: ${s}/100, Humor: ${l}/100
- Tone: ${h}

\u{1F4CB} CRITICAL RULES:
1. Read the ENTIRE thread above to understand the conversation
2. Your reply must be RELEVANT to what the boss said when mentioning you
3. If they asked a question, answer it
4. If they made a joke involving you, react to THAT specific joke
5. If they referenced something specific about you, address that thing
6. Stay on the same topic as the conversation thread
7. Keep under 120 characters, use 1-2 emojis max
${b}

\u274C DON'T: Change topics, make unrelated jokes, or ignore context
\u2705 DO: Respond directly and coherently to what was said about you

Write your brief reply (no quotes, no meta-text):`;
          console.log(`[Social] Calling queuedGenerateText for ${n2.name}'s mention response...`), console.log(`[Social] Prompt length: ${S.length} characters`);
          const k = await queuedGenerateText(S, { temperature: 0.8, max_tokens: 50, stopSequences: ["\n\n", "I would", "(", "Rating:", "**(", "---", "\u2501\u2501\u2501"] }, `Social Mention Response - ${n2.name}`);
          console.log(`[Social] Raw AI response for ${n2.name}: "${k}"`);
          let T = k.trim();
          if (T = T.replace(/^["']|["']$/g, ""), T = T.replace(/\s*\([^)]*personality[^)]*\)\.?$/i, ""), T = T.replace(/\s*\([^)]*\d+\/100[^)]*\)\.?$/i, ""), T = T.replace(/^(I would (say|reply|respond|comment):|My response would be:)\s*/i, ""), T = T.replace(/\n\n\(Word count:.*?\)$/i, ""), T = T.replace(/\s*\*\(\d+\s*characters?\)\*\s*$/i, ""), T = T.replace(/\s*\(\d+\s*words?\)\s*$/i, ""), T = T.trim(), console.log(`[Social] Sanitized response for ${n2.name}: "${T}"`), T && T.length > 0) {
            console.log(`[Social] Creating comment object for ${n2.name}...`);
            const a3 = createComment({ postId: t.id, authorId: n2.id, authorName: n2.name, content: T, replyToCommentId: e.id });
            if (console.log("[Social] Comment object created:", a3), console.log(`[Social] Adding comment to post (current comment count: ${t.comments.length})`), t.comments.push(a3), console.log(`[Social] \u2713 ${n2.name} responded to mention: "${T}"`), console.log(`[Social] New comment count: ${t.comments.length}`), /\b(check (your |my )?(dm|inbox|messages?)|sent.*(you |one |it )*(your )?way|dm(ing|'d|ed)? (you|it)|private message|slid(ing|e)? into|message(d)? you|in (your |my )?(inbox|messages|dms)|already (sent|in)|overflowing with)\b/i.test(T) || /\b(deal|okay|alright|sure|fine|bet)\b.*\b(boss|you|@\w+)\b/i.test(T) || /\b(only if|but only|promise|hands-on|supervision)\b/i.test(T) || /\b(sending|upload(ing)?|post(ing)?|share|show(ing)?)\b.*\b(now|tonight|soon|later|tomorrow)\b/i.test(T) || /\b(I'?ll|gonna|going to|will|can)\s+(send|share|show|post|upload|dm)\b/i.test(T) || /\b(let me|lemme)\s+(send|grab|get|find|pull up)\b/i.test(T) || /\b(coming (right |your )?(up|way)|on (its|their) way)\b/i.test(T) || /\b(give me (a )?(sec|second|minute|moment)|wait|hold on)\b.*\b(send|share|post)\b/i.test(T)) {
              console.log(`[Social DM] \u{1F514} ${n2.name} mentioned sending DM in mention response - sending now!`), console.log(`[Social DM] Detection matched on: "${T}"`), console.log("[Social DM] \u23F0 Will send DM in 2-5 seconds...");
              const o4 = 2e3 + 3e3 * Math.random();
              console.log(`[Social DM] \u23F1\uFE0F Exact delay: ${Math.round(o4)}ms`), setTimeout(async () => {
                console.log(`[Social DM] \u26A1 TIMEOUT TRIGGERED - Starting DM generation for ${n2.name}...`);
                try {
                  const o5 = t.content || t.caption || "", i4 = e.content || "", s3 = getPhysicalDescriptionForPrompt(n2), r2 = n2.memory?.intimacyLevel || 0, l2 = (() => {
                    const a4 = [];
                    let o6 = e;
                    const i5 = /* @__PURE__ */ new Set();
                    for (; o6 && !i5.has(o6.id) && (i5.add(o6.id), a4.unshift(o6), o6.replyToCommentId); ) o6 = t.comments.find((e2) => e2.id === o6.replyToCommentId);
                    const s4 = t.comments.find((t2) => t2.authorId === n2.id && t2.replyToCommentId === e.id);
                    return s4 && !i5.has(s4.id) && a4.push(s4), a4.map((e2) => `${e2.authorName}: "${e2.content}"`).join("\n");
                  })();
                  console.log(`[Social DM] Generating personalized DM from ${n2.name}...`), console.log(`[Social DM] Relevant thread context (NOT full post): ${l2.substring(0, 200)}...`);
                  const c2 = `You are ${n2.name} sending a private DM after commenting "${T}" in response to being mentioned.

CONTEXT:
Original post: "${o5}"
Player's comment that mentioned you: "${i4}"
Your reply: "${T}"

You mentioned sending a DM/private message. Write a short, natural DM (5-15 words) that delivers what was requested or teased.

Match your personality (intimacy: ${r2}/100).

Write ONLY the message:`;
                  let d2 = "";
                  try {
                    d2 = (await queuedGenerateText(c2, { temperature: 0.85, max_tokens: 30, stopSequences: ["\n\n", "\n---", "Note:", "Context:"] }, `Social DM Message - ${n2.name}`)).trim().replace(/^["']|["']$/g, "").split("\n")[0].trim(), (!d2 || d2.length < 3) && (d2 = "Here's what you asked for \u{1F609}");
                  } catch (u4) {
                    console.warn("[Social DM] Message generation failed, using fallback"), d2 = "As promised \u{1F60F}";
                  }
                  console.log(`[Social DM] Generated message: "${d2}"`);
                  const p2 = `You are an expert photographer/image generator. Analyze this conversation and create a PRECISE visual description.

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4F1} ORIGINAL POST:
"${o5}"

\u{1F4AC} RELEVANT CONVERSATION THREAD:
${l2}

\u{1F3AF} CURRENT REQUEST (MOST RECENT):
Player asked: "${i4}"
${n2.name} replied: "${T}"
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

\u{1F464} ${n2.name}:
${s3.substring(0, 300)}

\u{1F4CB} CRITICAL ANALYSIS TASK:

\u26A0\uFE0F IMPORTANT: If the conversation contains MULTIPLE requests, respond ONLY to the MOST RECENT request ("${i4}"). IGNORE any older/previous requests in the thread.

STEP 1 - IDENTIFY THE SPECIFIC REQUEST:
Look for EXACT keywords in the MOST RECENT player request ("${i4}"):
- "upskirt" / "up your skirt" / "under your skirt" = LOW ANGLE shot looking UP from below showing underwear/genitals
- "riding me" / "on top" / "straddling" = VIEW FROM BELOW showing them on top during sex
- "from behind" / "ass" / "bent over" = REAR VIEW showing buttocks prominently
- "pussy" / "spread" = EXPLICIT genital close-up, legs spread
- "tits" / "breasts" / "topless" = CHEST focus, breasts exposed
- "masturbating" / "touching yourself" = EXPLICIT sexual self-stimulation visible
- "nude" / "naked" = FULL BODY nudity, all clothes removed
- "POV" = First-person perspective shot
- Custom requests (Vespa, specific position, location, etc.) = MATCH EXACTLY

STEP 2 - CAMERA ANGLE & PERSPECTIVE:
Based on request type:
- Upskirt = Camera positioned LOW, looking UP between legs from floor level
- POV sex = Camera at person's eye level looking down at partner on top, or looking up if partner is standing
- Ass/behind = Camera positioned BEHIND the subject, rear view dominant
- General nude = Standard eye-level or slightly elevated angle

STEP 3 - WHAT'S VISIBLE:
Be EXPLICIT about:
- Body parts shown: "exposed breasts", "erect penis visible", "vagina visible between spread legs", "anus visible"
- Clothing state: "completely nude", "skirt hiked up revealing", "panties pulled aside", "topless with"
- Activity: "masturbating with hand on", "penetrating with dildo", "legs spread showing"
- Position: "squatting over camera", "lying on back with legs up", "bent forward with ass toward camera"

STEP 4 - WRITE THE VISUAL DESCRIPTION:
Format: "${n2.name}, [physical appearance brief], [camera angle], [what's visible explicitly], [pose/activity], [expression], [setting], [lighting]"

EXAMPLES:
Request: "upskirt photo" \u2192 "Constance Kane, athletic woman with short blonde bob, camera positioned on floor looking up between legs, squatting over camera, lace panties pulled aside revealing erect penis and testicles, teasing smile looking down, bedroom setting, natural window light"

Request: "picture of you riding me" \u2192 "Constance Kane, platinum blonde athletic woman, POV shot from below, straddling camera with thighs spread, nude, erect penis visible between legs, hands on chest, intense eye contact, bedroom, soft ambient lighting"

Request: "send me nudes" \u2192 "Constance Kane, athletic build short blonde bob, standing pose, completely nude, medium breasts exposed with erect nipples, large flaccid penis and testicles visible, confident expression, mirror selfie, bathroom setting, bright lighting"

NOW GENERATE - Match the request EXACTLY, use proper camera angle, be explicit about visible anatomy:`;
                  let m2 = null, u3 = null;
                  if ("function" == typeof generateImage) try {
                    const e2 = await queuedGenerateText(p2, { temperature: 0.7, max_tokens: 300, stopSequences: ["\n\n", "\n---", "Note:", "Explanation:", "Based on", "Context:", "[", "Rationale:"] }, `Social DM Image Prompt - ${n2.name}`);
                    console.log(`[Social DM] \u{1F50D} RAW AI Response (before processing):
"${e2}"`), console.log(`[Social DM] \u{1F50D} Raw response length: ${e2.length} chars`);
                    let t2 = e2.trim().replace(/^["']|["']$/g, "").replace(/\[.*?\]/g, "").replace(/^(Image prompt:|Here is|Here's|Based on.*?:|The prompt is:|Visual description:)\s*/i, "").replace(/^(the|a|an)\s+(specific\s+)?image\s+prompt.*?:\s*/i, "").split("\n")[0].trim();
                    if (console.log(`[Social DM] \u{1F50D} After initial processing:
"${t2}"`), console.log(`[Social DM] \u{1F50D} Processed length: ${t2.length} chars`), /^(based on|context|according to|this shows|description)/i.test(t2)) {
                      console.log("[Social DM] \u{1F50D} Detected meta-text prefix, extracting after colon...");
                      const e3 = t2.match(/:\s*(.+)$/);
                      e3 && (t2 = e3[1].trim(), console.log(`[Social DM] \u{1F50D} Extracted: "${t2}"`));
                    }
                    t2 = t2.replace(/[\[\]]/g, "");
                    const a4 = t2.length < 20, o6 = /generating|requested|content|description|prompt/i.test(t2.substring(0, 50));
                    if (a4 || o6) {
                      console.warn("[Social DM] \u26A0\uFE0F Using fallback - Reason: " + (a4 ? "Too short (" + t2.length + " chars)" : "Has meta-text")), console.warn(`[Social DM] \u26A0\uFE0F Rejected prompt was: "${t2}"`);
                      const o7 = (l2.toLowerCase() + " " + i4.toLowerCase()).toLowerCase();
                      /\b(upskirt|up.*skirt|under.*skirt|crotch.*shot)\b/i.test(o7) ? (t2 = `${n2.name}, ${s3.substring(0, 150)}, camera positioned on floor looking up between legs from low angle, squatting over camera, skirt hiked up, panties visible or pulled aside revealing genitals, teasing expression looking down at camera, elevator or private setting, intimate lighting`, console.log("[Social DM] \u26A0\uFE0F Detected UPSKIRT request in fallback")) : t2 = /\b(riding|vespa|bike|motorcycle)\b/i.test(o7) && /\b(nude|naked|sex)\b/i.test(o7) ? `${n2.name} ${s3.substring(0, 100)}, nude, straddling motorcycle, seductive pose, intimate photo` : /\b(nude|naked|tits|breasts|pussy|topless|bare)\b/i.test(o7) ? `${n2.name} ${s3.substring(0, 100)}, completely nude, full body visible, seductive expression, private photo` : /\b(ass|bent over|from behind|rear)\b/i.test(o7) ? `${n2.name} ${s3.substring(0, 100)}, bent forward, rear view, buttocks prominent, looking back over shoulder, intimate setting` : `${n2.name} ${s3.substring(0, 100)}, provocative pose, intimate setting`, console.log(`[Social DM] \u26A0\uFE0F Fallback prompt: "${t2}"`);
                    }
                    console.log(`[Social DM] \u2705 FULL Image Prompt:
"${t2}"`), m2 = await queuedGenerateImage(applyImageStyle(t2), `Social DM image for ${n2.name}`), u3 = t2, console.log("[Social DM] \u2705 Generated image for DM");
                  } catch (u4) {
                    console.error("[Social DM] Failed to generate image:", u4);
                  }
                  gameState.chatHistory[n2.id] || (gameState.chatHistory[n2.id] = []);
                  const g2 = m2 ? `${n2.name} sent a photo: ${u3 ? Zs(u3) : "a private photo"}` : null, h2 = gameState.time?.currentTime || Date.now(), y2 = { sender: n2.name, content: d2, isPlayer: false, timestamp: h2, imageUrl: m2, imageAlt: g2, imagePrompt: u3, triggerContext: { postId: t.id, postSnippet: (t.content || t.caption || "").substring(0, 140), myComment: (a3.content || "").substring(0, 100), isPlayerPost: !!t.isPlayerPost } };
                  gameState.chatHistory[n2.id].push(y2), saveGame(false), n2.unreadMessages || (n2.unreadMessages = 0), n2.unreadMessages++, "messages" === gameState.activeTab && renderMessagesList(), showNotification(`\u{1F4AC} ${n2.name} sent you a private message${m2 ? " with a photo" : ""}!`, "info"), console.log(`[Social DM] \u2705 ${n2.name} sent DM as promised!${m2 ? " [WITH IMAGE]" : ""}`), console.log(`[Social DM] \u2705 COMPLETE - DM successfully delivered from ${n2.name}`), a3.dmSent = true, a3.dmMessageTimestamp = h2;
                  const f2 = document.querySelector(`[data-post-id="${t.id}"]`);
                  f2 && $g(f2, t);
                } catch (u3) {
                  console.error(`[Social DM] \u274C ERROR in setTimeout callback for ${n2.name}:`, u3), console.error("[Social DM] \u274C Error stack:", u3.stack);
                }
              }, o4), console.log(`[Social DM] \u2713 setTimeout scheduled successfully for ${n2.name}`);
            }
            const o3 = gameState.employees.find((t2) => t2.id === e.authorId);
            o3 && o3.id !== n2.id && Hf(n2, o3, t, T);
            const i3 = document.querySelector(`[data-post-id="${t.id}"]`), s2 = document.querySelector(`.post-comments[data-post-id="${t.id}"]`);
            i3 && s2 && (console.log("[Social] Immediately updating comments section after mention response"), s2.style.display = "block", $g(i3, t), delete s2.dataset.needsRefresh), console.log(`[Social] Requesting smart update for post ${t.id}...`), wg(t.id), setTimeout(async () => {
              await lh(a3, t);
            }, 3e3 + 4e3 * Math.random());
          } else console.log(`[Social] \u2717 ${n2.name} got empty response after sanitization`);
        } catch (e2) {
          console.error(`[Social] \u2717 Error generating mention response for ${n2.name}:`, e2);
        }
        await new Promise((e2) => setTimeout(e2, 1e3 + 2e3 * Math.random()));
      }
    }
  } else console.log("[Social] No mentioned employees in comment");
}
async function lh(e, t) {
  if (!e || !t) return;
  if ("player" === e.authorId) return;
  const n = gameState.employees.find((t2) => t2.id === e.authorId);
  if (!n) return;
  console.log(`[Chain] \u{1F517} Checking for chain reactions to ${n.name}'s comment...`);
  const a = gameState.employees.filter((t2) => "active" === t2.employmentStatus && t2.id !== e.authorId);
  if (0 === a.length) return;
  let o = [];
  if (t.authorId && "player" !== t.authorId && t.authorId !== e.authorId) {
    const e2 = a.find((e3) => e3.id === t.authorId);
    e2 && Math.random() < 0.6 && (o.push({ npc: e2, reason: "post author", priority: 1 }), console.log(`[Chain] \u{1F4DD} Post author ${e2.name} might respond (60% chance)`));
  }
  if (e.mentionedEmployees && e.mentionedEmployees.length > 0) for (const t2 of e.mentionedEmployees) {
    const e2 = a.find((e3) => e3.id === t2);
    e2 && Math.random() < 0.7 && (o.push({ npc: e2, reason: "mentioned", priority: 1 }), console.log(`[Chain] \u{1F44B} ${e2.name} was mentioned - might respond (70% chance)`));
  }
  const i = n.relationships || {};
  for (const [e2, t2] of Object.entries(i)) {
    if (o.length >= 2) break;
    const i2 = a.find((t3) => t3.id === e2);
    if (i2 && !o.find((t3) => t3.npc.id === e2)) {
      const e3 = t2.strength || 0;
      if ((e3 > 60 || e3 < 30) && Math.random() < 0.3) {
        const t3 = e3 > 60 ? "friend" : "rival";
        o.push({ npc: i2, reason: t3, priority: 2 }), console.log(`[Chain] ${e3 > 60 ? "\u{1F495}" : "\u{1F624}"} ${i2.name} is ${n.name}'s ${t3} - might chime in`);
      }
    }
  }
  const s = a.filter((e2) => !o.find((t2) => t2.npc.id === e2.id) && (e2.personality?.outgoing || 50) > 60);
  if (s.length > 0 && Math.random() < 0.15 && o.length < 2) {
    const e2 = s[Math.floor(Math.random() * s.length)];
    o.push({ npc: e2, reason: "jumping in", priority: 3 }), console.log(`[Chain] \u{1F4AC} ${e2.name} wants to add their two cents`);
  }
  if (o.sort((e2, t2) => e2.priority - t2.priority), o = o.slice(0, 2), 0 !== o.length) {
    console.log(`[Chain] \u2713 ${o.length} NPC(s) will respond`);
    for (const { npc: a2, reason: i2 } of o) {
      try {
        console.log(`[Chain] \u{1F4AC} ${a2.name} responding (${i2})...`);
        let o2 = "";
        const s2 = t.comments.filter((e2) => !e2.replyToCommentId), r = {};
        t.comments.forEach((e2) => {
          e2.replyToCommentId && (r[e2.replyToCommentId] || (r[e2.replyToCommentId] = []), r[e2.replyToCommentId].push(e2));
        });
        const l = (e2, t2 = 0) => {
          let n2 = `${"  ".repeat(t2)}${e2.authorName}: "${e2.content}"
`;
          return (r[e2.id] || []).forEach((e3) => {
            n2 += l(e3, t2 + 1);
          }), n2;
        };
        let c = "";
        c = ((e2) => {
          if (!t.comments.find((t2) => t2.id === e2)?.replyToCommentId) {
            const n3 = t.comments.find((t2) => t2.id === e2);
            return l(n3);
          }
          let n2 = t.comments.find((t2) => t2.id === e2);
          for (; n2 && n2.replyToCommentId; ) n2 = t.comments.find((e3) => e3.id === n2.replyToCommentId);
          return n2 ? l(n2) : "";
        })(e.id);
        const d = s2.length - (c ? 1 : 0);
        o2 = `${d > 0 ? `(Note: There are ${d} other conversation thread(s) on this post, but you're responding to THIS specific thread)

` : ""}CONVERSATION THREAD YOU'RE JOINING:
${c}`, a2.personality;
        const p = a2.relationships?.[e.authorId] || { strength: 50, type: "colleague" };
        let m = "casual";
        const u2 = e.content.toLowerCase();
        p.strength > 70 && (m = "friendly"), p.strength < 30 && (m = "disagreeing/snarky"), "post author" === i2 && (m = "engaged (it's your post!)"), "friend" === i2 && (m = "supportive of your friend"), "rival" === i2 && (m = "challenging/competitive"), (u2.includes("lol") || u2.includes("\u{1F602}")) && (m = "playful"), u2.includes("?") && (m = "answering their question");
        const g = a2.personality || {}, h = [];
        (g.humor || 50) > 65 && h.push("witty"), (g.confidence || 50) > 65 && h.push("bold opinions"), (g.confidence || 50) < 35 && h.push("tentative"), (g.flirty || 50) > 65 && h.push("playfully teasing"), (g.professional || 50) > 70 && h.push("measured");
        const y = h.length > 0 ? h.join(", ") : "balanced", f = [];
        t.comments.forEach((e2) => {
          e2.content.toLowerCase(), /\?\s*(girl|dude|bro|man)/i.test(e2.content) && f.push("question + nickname"), /😂|😅|💀|lol|lmao/i.test(e2.content) && f.push("laughing emoji"), /same|agree|this|right\?$/i.test(e2.content) && f.push("agreement one-word"), /check.*dm|dm.*you|inbox/i.test(e2.content) && f.push("DM redirect");
        });
        const b = f.length > 0 ? `
\u26A0\uFE0F DON'T USE: ${[...new Set(f)].join(", ")}` : "", v = Ge("brief"), w = `You are ${a2.name} (${a2.gender}, ${a2.age}) replying in a workplace social media thread.
${v ? `
${v}
` : ""}
\u2550\u2550\u2550 THE POST \u2550\u2550\u2550
${t.authorName}: "${(t.content || "").substring(0, 150)}"

\u2550\u2550\u2550 THE COMMENT YOU'RE REPLYING TO \u2550\u2550\u2550
${n.name}: "${e.content}"

\u2550\u2550\u2550 YOUR RESPONSE CONTEXT \u2550\u2550\u2550
Why you're replying: ${i2}
Your relationship with ${n.name}: ${p.strength}/100
Your personality: ${y}
Your tone: ${m}
${b}

\u2550\u2550\u2550 WRITE A REAL REPLY \u2550\u2550\u2550
Respond DIRECTLY to what ${n.name} said. Options:
\u2022 Agree/disagree with their SPECIFIC point
\u2022 Add your own perspective on the same topic  
\u2022 Ask them a follow-up question
\u2022 Make a joke that builds on what THEY said
\u2022 Share a related thought or experience

\u274C DON'T: Generic praise, redirect to DMs, change the subject, ignore what they said
\u2713 DO: Engage with their actual words, show your personality, be specific

Your reply (10-40 words):`, x = await queuedGenerateText(w, { temperature: 0.8, max_tokens: 40, stopSequences: ["\n\n", "I would", "(", "Rating:", "**(", "---", "\u2501\u2501\u2501"] }, `Social Chain Comment - ${a2.name}`);
        console.log(`[Chain] Raw response from ${a2.name}: "${x}"`);
        let S = x.trim().replace(/^["']|["']$/g, "").replace(/\s*\([^)]*personality[^)]*\)\.?$/i, "").replace(/^(I would (say|reply|comment):|My comment would be:)\s*/i, "").replace(/\n\n\(Word count:.*?\)$/i, "").replace(/\s*\*\(\d+\s*characters?\)\*\s*$/i, "").replace(/\s*\(\d+\s*words?\)\s*$/i, "");
        if (S = S.trim(), console.log(`[Chain] Sanitized: "${S}"`), S && S.length > 0) {
          const o3 = createComment({ postId: t.id, authorId: a2.id, authorName: a2.name, content: S, replyToCommentId: e.id });
          t.comments.push(o3), console.log(`[Chain] \u2713 ${a2.name} added to thread: "${S}"`), n && n.id !== a2.id && Vf(a2, n, t, e.content, S);
          const i3 = gameState.employees.find((e2) => e2.id === t.authorId);
          i3 && i3.id !== a2.id && Hf(a2, i3, t, S);
          const s3 = document.querySelector(`[data-post-id="${t.id}"]`), r2 = document.querySelector(`.post-comments[data-post-id="${t.id}"]`);
          s3 && r2 && (console.log("[Chain] Immediately updating comments section after chain reaction"), r2.style.display = "block", $g(s3, t), delete r2.dataset.needsRefresh), wg(t.id);
          const l2 = Math.max(0.05, 0.25 - 0.03 * t.comments.length);
          Math.random() < l2 && t.comments.length < 8 && (console.log(`[Chain] \u{1F504} Conversation might continue (${Math.round(100 * l2)}% chance)...`), setTimeout(async () => {
            await lh(o3, t);
          }, 5e3 + 7e3 * Math.random()));
        }
      } catch (e2) {
        console.error(`[Chain] \u2717 Error generating chain response for ${a2.name}:`, e2);
      }
      await new Promise((e2) => setTimeout(e2, 2e3 + 3e3 * Math.random()));
    }
  } else console.log("[Chain] \u{1F6AB} No chain reactions triggered");
}
async function ch(e) {
  if (!e || !e.isPlayerPost) return;
  const t = gameState.employees.filter((e2) => "active" === e2.employmentStatus);
  if (0 === t.length) return;
  const n = e.referencedEmployees || [], a = t.filter((e2) => n.includes(e2.id)), o = t.filter((e2) => !n.includes(e2.id));
  console.log(`[Social] Post has ${a.length} mentions`), console.log("[Social] Mentioned employee IDs:", n), console.log("[Social] Active employee IDs:", t.map((e2) => e2.id)), a.length > 0 && console.log("[Social] Matched employees:", a.map((e2) => `${e2.name} (${e2.id})`));
  const i = 0.6 + 0.2 * Math.random(), s = 0.85 + 0.1 * Math.random(), r = [];
  for (const e2 of a) {
    const t2 = s, n2 = ((e2.stats?.affection || 0) + (e2.stats?.desire || 0) + (e2.memory?.intimacyLevel || 0) + (e2.relationships?.player?.level || 0)) / 400, a2 = Math.min(0.98, t2 + n2);
    Math.random() < a2 && r.push({ emp: e2, mentioned: true });
  }
  for (const e2 of o) {
    const t2 = i, n2 = ((e2.stats?.affection || 0) + (e2.stats?.desire || 0) + (e2.memory?.intimacyLevel || 0) + (e2.relationships?.player?.level || 0)) / 400, a2 = Math.min(0.95, t2 + n2);
    Math.random() < a2 && r.push({ emp: e2, mentioned: false });
  }
  const l = [], c = [];
  for (const e2 of r) {
    const t2 = e2.mentioned ? 0.7 + 0.15 * Math.random() : 0.4 + 0.2 * Math.random();
    Math.random() < t2 ? l.push(e2.emp) : c.push(e2.emp);
  }
  console.log(`[Social] Player post triggering ${r.length} reactions (${l.length} comments, ${c.length} likes)`);
  for (let t2 = 0; t2 < c.length; t2++) {
    const n2 = c[t2], a2 = (1 + t2) * (1e3 + 2e3 * Math.random());
    setTimeout(() => {
      e.likes.includes(n2.id) || (e.likes.push(n2.id), remember(n2, `I liked the boss's post: "${e.content || "image post"}"`, "interaction", 0.5), "social" === gameState.activeTab && renderSocialFeed());
    }, a2);
  }
  const d = ["enthusiastic and excited - use energy words", "chill and laid-back - be casual", "flirty and teasing - be playful", "supportive and wholesome - be encouraging", "funny and sarcastic - make a joke", "curious and questioning - ask something", "dramatic and theatrical - be extra", "direct and to-the-point - keep it brief", "nostalgic or referencing shared memories", "competitive or challenging - playful rivalry"].sort(() => Math.random() - 0.5);
  !async function() {
    for (let t2 = 0; t2 < l.length; t2++) {
      const n2 = l[t2], a2 = d[t2 % d.length];
      await new Promise((e2) => setTimeout(e2, 2e3 + 3e3 * Math.random()));
      const o2 = await generateContextAwareComment(n2, e, a2), { imageUrl: i2, imageAlt: s2, imagePrompt: r2 } = await detectAndGenerateCommentImage(o2, n2, e), c2 = createComment({ postId: e.id, authorId: n2.id, authorName: n2.name, content: o2, imageUrl: i2, imageAlt: s2, imagePrompt: r2 });
      if (e.comments.push(c2), console.log(`[Social] ${n2.name} commented on player post: "${o2}"${i2 ? " [WITH IMAGE]" : ""}`), /\b(check (your |my )?(dm|inbox|messages?)|sent.*(you |one |it )*(your )?way|dm(ing|'d|ed)? (you|it)|private message|slid(ing|e)? into|message(d)? you|in (your |my )?(inbox|messages|dms)|already (sent|in)|overflowing with)\b/i.test(o2) || /\b(deal|okay|alright|sure|fine|bet)\b.*\b(boss|you|@\w+)\b/i.test(o2) || /\b(only if|but only|promise|hands-on|supervision)\b/i.test(o2) || /\b(sending|upload(ing)?|post(ing)?|share|show(ing)?)\b.*\b(now|tonight|soon|later|tomorrow)\b/i.test(o2) || /\b(I'?ll|gonna|going to|will|can)\s+(send|share|show|post|upload|dm)\b/i.test(o2) || /\b(let me|lemme)\s+(send|grab|get|find|pull up)\b/i.test(o2) || /\b(coming (right |your )?(up|way)|on (its|their) way)\b/i.test(o2) || /\b(give me (a )?(sec|second|minute|moment)|wait|hold on)\b.*\b(send|share|post)\b/i.test(o2)) {
        console.log(`[Social] \u{1F514} ${n2.name} mentioned sending DM - actually sending one now!`), console.log(`[Social] Comment text: "${o2}"`), console.log("[Social] Detection matched - will send DM"), console.log(`[Social] Post content: "${e.content || e.caption || ""}"`), console.log("[Social DM] \u23F0 Will send DM in 2-5 seconds...");
        const t3 = 2e3 + 3e3 * Math.random();
        console.log(`[Social DM] \u23F1\uFE0F Exact delay: ${Math.round(t3)}ms`), setTimeout(async () => {
          console.log(`[Social DM] \u26A1 TIMEOUT TRIGGERED - Starting DM generation for ${n2.name}...`);
          try {
            const t4 = e.content || e.caption || "", a3 = getPhysicalDescriptionForPrompt(n2), i3 = n2.memory?.intimacyLevel || 0;
            console.log(`[Social DM] Analyzing request to generate personalized DM from ${n2.name}...`);
            const s3 = `You are ${n2.name} sending a private DM after commenting on a post.

CONTEXT:
Original post: "${t4}"
Your comment: "${o2}"

You mentioned checking DMs, so now you're sending the actual private message with the content they requested.

Write a short, flirty DM message (5-15 words) that:
- Acknowledges what you're sending them
- References what was specifically requested in the original post
- Matches your personality (intimacy level: ${i3}/100)
- Is playful/teasing but natural

Write ONLY the message text:`;
            let r3 = "";
            try {
              r3 = (await queuedGenerateText(s3, { temperature: 0.85, max_tokens: 30, stopSequences: ["\n\n", "\n---", "Note:", "Context:"] }, `Social Post Message - ${n2.name}`)).trim().replace(/^["']|["']$/g, "").split("\n")[0].trim(), (!r3 || r3.length < 3) && (r3 = "Here's what you asked for \u{1F609}");
            } catch (u3) {
              console.warn("[Social DM] Message generation failed, using fallback"), r3 = "As promised \uFFFD";
            }
            console.log(`[Social DM] Generated message: "${r3}"`);
            const l2 = `Analyze this social media interaction and create an image prompt.

POST REQUEST: "${t4}"
NPC'S COMMENT: "${o2}"

The NPC (${n2.name}) is sending a private photo. What should it show?

PERSON: ${a3.substring(0, 300)}

Create a detailed, explicit image prompt showing ${n2.name} doing/showing EXACTLY what was requested in the post.

CRITICAL RULES:
1. Show ONLY what was actually requested in the post - read it carefully
2. Be EXPLICIT - describe nudity, body parts, sexual acts clearly if requested
3. If request is explicit, image must be explicit (full nudity, visible genitals, etc.)
4. Describe the specific activity mentioned in the post
5. Include pose, expression, setting, lighting
6. Include ${n2.name}'s physical appearance from the description above

Generate ONLY the image prompt, no explanation:`;
            let d2 = null, p = null, m = null;
            if ("function" == typeof generateImage) try {
              let e2 = (await queuedGenerateText(l2, { temperature: 0.8, max_tokens: 200, stopSequences: ["\n\n", "\n---", "Note:", "Explanation:", "Based on", "Context:"] }, `Social Post Image Analysis - ${n2.name}`)).trim().replace(/^["']|["']$/g, "").replace(/^(Image prompt:|Here is|Here's|Based on.*?:)\s*/i, "").replace(/^(the|a|an)\s+(specific\s+)?image\s+prompt.*?:\s*/i, "").split("\n")[0].trim();
              if (/^(based on|context|the prompt)/i.test(e2)) {
                const t5 = e2.match(/:\s*(.+)$/);
                t5 && (e2 = t5[1].trim());
              }
              console.log(`[Social DM] \u2705 FULL Image Prompt:
"${e2}"`), m = e2, d2 = await queuedGenerateImage(applyImageStyle(e2), `Social chain image for ${n2.name}`), p = `Private photo from ${n2.name}`, console.log(`[Social DM] \u2705 Generated personalized image for DM from ${n2.name}`);
            } catch (u3) {
              console.error("[Social DM] Failed to generate image:", u3);
            }
            gameState.chatHistory[n2.id] || (gameState.chatHistory[n2.id] = []);
            const u2 = gameState.time?.currentTime || Date.now(), g = { sender: n2.name, content: r3, isPlayer: false, timestamp: u2, imageUrl: d2, imageAlt: d2 ? `${n2.name} sent a photo: ${m ? Zs(m) : "a private photo"}` : p, imagePrompt: m, triggerContext: { postId: e.id, postSnippet: (e.content || "").substring(0, 140), myComment: (o2 || "").substring(0, 100), isPlayerPost: !!e.isPlayerPost } };
            gameState.chatHistory[n2.id].push(g), saveGame(false), n2.unreadMessages || (n2.unreadMessages = 0), n2.unreadMessages++, "messages" === gameState.activeTab && renderMessagesList(), showNotification(`\u{1F4AC} ${n2.name} sent you a private message${d2 ? " with a photo" : ""}!`, "info"), console.log(`[Social DM] \u2705 ${n2.name} sent actual DM as promised in comment!${d2 ? " [WITH IMAGE]" : ""}`), console.log(`[Social DM] \u2705 COMPLETE - DM successfully delivered from ${n2.name}`), c2.dmSent = true, c2.dmMessageTimestamp = u2;
            const h = document.querySelector(`[data-post-id="${e.id}"]`);
            h && $g(h, e);
          } catch (u2) {
            console.error(`[Social DM] \u274C ERROR in setTimeout callback for ${n2.name}:`, u2), console.error("[Social DM] \u274C Error stack:", u2.stack);
          }
        }, t3), console.log(`[Social DM] \u2713 setTimeout scheduled successfully for ${n2.name}`);
      }
      !/\b(dm|inbox|message|private|check your)\b/i.test(o2) && /\b(just posted|posted (it|mine|this)|already posted|made a post|shared (it|this)|uploaded (it|this))\b/i.test(o2) && (console.log(`[Social] \u{1F4DD} ${n2.name} claims to have made a new post - creating it now!`), console.log(`[Social] Comment text: "${o2}"`), setTimeout(async () => {
        try {
          const t3 = ((e.content || e.caption || "") + " " + o2).toLowerCase(), a3 = /\b(cat|kitty|kitten|pussy|feline)\b/i.test(t3) && !/\b(nude|naked|explicit|spread|wet)\b/i.test(t3), i3 = /\b(dog|pet|puppy|animal)\b/i.test(t3), s3 = /\b(nude|naked|bare|nothing on)\b/i.test(t3), r3 = /\b(sexy|hot|spicy|sultry|juicy|treat|peek)\b/i.test(t3) && !a3, l2 = /\b(selfie|pic|photo)\b/i.test(t3);
          let c3 = "selfie", d2 = "", p = "";
          a3 ? (c3 = "selfie", d2 = ["Here she is! \u{1F431}", "My beautiful kitty \u{1F63B}", "She's camera-ready \u{1F4F8}", "Cat tax paid! \u{1F408}"][Math.floor(4 * Math.random())], p = "Cute cat photo, adorable kitten, wholesome pet photography") : i3 ? (c3 = "selfie", d2 = ["Doggo selfie time! \u{1F415}", "Best friend photo \u{1F43E}", "Puppy love \u{1F495}"][Math.floor(3 * Math.random())], p = "Cute dog photo, adorable puppy, wholesome pet photography") : s3 ? (c3 = "nude", d2 = ["As requested \u{1F60F}", "Just for you \u{1F48B}", "Hope you enjoy \u{1F525}"][Math.floor(3 * Math.random())], p = `Artistic nude photograph of ${n2.name}, ${getPhysicalDescriptionForPrompt(n2, { nude: true })}, tasteful lighting, beautiful composition, intimate`) : r3 ? (c3 = "thirst_trap", d2 = ["Feeling myself \u{1F618}", "Here's that peek \u{1F440}", "Enjoy the view \u{1F525}"][Math.floor(3 * Math.random())], p = `Sexy photo of ${n2.name}, ${getPhysicalDescriptionForPrompt(n2)}, alluring pose, confident expression, sultry`) : l2 && (c3 = "selfie", d2 = ["Fresh selfie \u{1F4F8}", "How do I look? \u{1F60A}", "Felt cute \u{1F495}"][Math.floor(3 * Math.random())], p = `Selfie photo of ${n2.name}, ${getPhysicalDescriptionForPrompt(n2)}, friendly smile, natural lighting`);
          let m = null;
          if ("function" == typeof generateImage) try {
            m = await queuedGenerateImage(applyImageStyle(p), `Social follow-up post image for ${n2.name}`), console.log(`[Social Follow-up Post] Generated ${c3} image for ${n2.name}'s post`);
          } catch (u3) {
            console.warn("[Social Follow-up Post] Failed to generate image:", u3);
          }
          const u2 = createPost({ authorId: n2.id, authorName: n2.name, content: d2, caption: d2, type: m ? c3 : "text", imageUrl: m, imagePrompt: p, timestamp: gameState.time?.currentTime || Date.now() });
          gameState.socialNetwork.posts.unshift(u2), remember(n2, `I posted on social media: "${d2}"${m ? " with image" : ""}`, "social", 0.6), "social" === gameState.activeTab && renderSocialFeed(), console.log(`[Social Follow-up Post] \u2705 ${n2.name} actually posted as claimed: "${d2}"${m ? " [WITH IMAGE]" : ""}`), showNotification(`\u{1F4F1} ${n2.name} just posted${m ? " a new photo" : ""}!`, "info");
        } catch (u2) {
          console.error(`[Social Follow-up Post] Error creating post for ${n2.name}:`, u2);
        }
      }, 3e3 + 5e3 * Math.random())), e.comments.length >= 3 && Math.random() < 0.1 && (console.log(`[Social] \u{1F525} ${n2.name}'s comment sparked more discussion!`), setTimeout(async () => {
        await dh(e);
      }, 5e3 + 6e3 * Math.random())), n2.stats && (n2.stats.affection = Math.min(100, (n2.stats.affection || 0) + 1)), remember(n2, `I commented on boss's post: "${o2}"`, "interaction", 0.8), "social" === gameState.activeTab && renderSocialFeed();
    }
  }();
}
async function dh(e) {
  const t = gameState.employees.filter((e2) => "active" === e2.employmentStatus);
  if (0 === t.length) return;
  const n = new Set(e.comments.filter((e2) => "player" !== e2.authorId).map((e2) => e2.authorId)), a = t.filter((e2) => !n.has(e2.id));
  if (0 === a.length) return;
  console.log(`[Social] \u{1F504} Building conversation on post ${e.id} (${e.comments.length} comments)`);
  let o = 0;
  const i = Math.min(3, Math.ceil(a.length / 3)), s = a.map((e2) => {
    let t2 = 30 * Math.random();
    const n2 = e2.personality || {};
    t2 += 0.3 * (n2.outgoing || 50), t2 += 0.2 * (n2.confidence || 50);
    const a2 = e2.stats?.affection || 50;
    return (a2 > 70 || a2 < 30) && (t2 += 20), { npc: e2, score: t2 };
  }).sort((e2, t2) => t2.score - e2.score);
  for (const { npc: t2 } of s) {
    if (o >= i) break;
    let n2 = 0.35 + 5e-3 * (((t2.personality || {}).outgoing || 50) - 50);
    if (Math.random() < n2) {
      console.log(`[Social] ${t2.name} joining active conversation (${Math.round(100 * n2)}% chance)`);
      try {
        const n3 = await generateContextAwareComment(t2, e);
        if (n3) {
          const { imageUrl: a2, imageAlt: i2, imagePrompt: s2 } = await detectAndGenerateCommentImage(n3, t2, e), r = createComment({ postId: e.id, authorId: t2.id, authorName: t2.name, content: n3, imageUrl: a2, imageAlt: i2, imagePrompt: s2 });
          e.comments.push(r), o++, console.log(`[Social] \u2713 ${t2.name} added to conversation: "${n3}"${a2 ? " [WITH IMAGE]" : ""}`), t2.stats && (t2.stats.affection = Math.min(100, (t2.stats.affection || 0) + 1)), remember(t2, `I joined a conversation on ${e.isPlayerPost ? "boss's" : "a coworker's"} post: "${n3}"`, "interaction", 0.7), wg(e.id);
        }
      } catch (e2) {
        console.error(`Error generating reinvigoration comment from ${t2.name}:`, e2);
      }
    }
  }
  o > 0 && console.log(`[Social] \u{1F389} Added ${o} new voice(s) to the conversation`);
}
async function generateContextAwareComment(e, t, n = null) {
  const a = e.stats?.affection || 0, o = (e.stats, e.memory?.intimacyLevel || 0), i = e.personality || {}, s = o > 70 ? "very intimate" : o > 40 ? "romantically involved" : a > 70 ? "very close friends" : a > 40 ? "friendly" : a > 20 ? "cordial" : "professional", r = t.content || "", l = !!t.imageUrl, c = t.imageAlt || "", u2 = t.isPlayerPost || "player" === t.authorId, G2 = u2 ? null : gameState.employees.find((n2) => n2.id === t.authorId), U2 = u2 ? "your boss (@TheBoss)" : G2?.name || t.authorName || "a coworker", J2 = u2 ? s : e.relationships?.[t.authorId]?.type || "coworker", d = (t.explicitLevel, `flirty: ${i.flirty || 50}/100, outgoing: ${i.outgoing || 50}/100, confidence: ${i.confidence || 50}/100, professional: ${i.professional || 50}/100`);
  let p = [];
  const m = gameState.employees.filter((t2) => "active" === t2.employmentStatus && t2.id !== e.id && "player" !== t2.id);
  if (m.length > 0) {
    const n2 = e.relationships || {}, a2 = m.filter((e2) => {
      const t2 = n2[e2.id];
      return t2 && t2.strength > 60;
    }).slice(0, 2), o2 = m.find((e2) => e2.id === t.authorId);
    o2 && !a2.find((e2) => e2.id === o2.id) && p.push({ employee: o2, reason: "post author" }), a2.forEach((e2) => p.push({ employee: e2, reason: "friend" })), p.length < 2 && m.filter((e2) => !p.find((t2) => t2.employee.id === e2.id)).sort(() => Math.random() - 0.5).slice(0, 2 - p.length).forEach((e2) => p.push({ employee: e2, reason: "coworker" }));
  }
  const ee2 = e.race && "human" !== e.race ? ` (${e.race})` : "", g = e.gender ? `, a ${e.age || "young"}-year-old ${"male" === e.gender ? "man" : "transMan" === e.gender ? "trans man" : "transWoman" === e.gender ? "trans woman" : (e.gender, "woman")}${ee2}` : "", h = /\b(send|post|share|show|upload|pic|photo|image|selfie)\b/i.test(r), y = /\b(nude|naked|tits|boobs|breasts|pussy|ass|masturbat|explicit|lewd|sex|dick|cock|cum)\b/i.test(r);
  /\b(cat|kitty|dog|pet|selfie)\b/i.test(r);
  let f = "";
  if (t.comments && t.comments.length > 0) {
    const e2 = t.comments.slice(-6).filter((e3) => e3.content && e3.content.length > 0).map((e3) => `${"player" === e3.authorId ? "Boss" : gameState.employees.find((t2) => t2.id === e3.authorId)?.name || "Someone"}: "${e3.content.substring(0, 50)}"`);
    e2.length > 0 && (f = `

\u2550\u2550\u2550 OTHER COMMENTS on this post (these are OTHER COMMENTERS \u2014 none of them is the poster) \u2550\u2550\u2550
${e2.join("\n")}

\u2192 The poster is ${U2} \u2014 do NOT confuse commenters' names with the poster
\u2192 Add a NEW perspective, don't repeat what's been said
\u2192 You CAN respond to another comment if you have something specific to add
\u2192 Don't use generic phrases others already used`);
  }
  let b = "";
  n && (b = `

\u{1F3AF} YOUR UNIQUE ANGLE: Be ${n}. Take this specific approach - don't overlap with others!`);
  const v = [];
  i.flirty > 65 && v.push("flirtatious/teasing"), i.humor > 65 && v.push("make a joke or witty observation"), i.professional > 70 && v.push("thoughtful/measured response"), i.confidence > 70 && v.push("bold opinion"), i.confidence < 35 && v.push("shy/hesitant but genuine"), i.outgoing > 70 && v.push("enthusiastic and chatty"), i.outgoing < 35 && v.push("brief but meaningful"), a > 75 && v.push("supportive/warm"), a < 25 && v.push("skeptical/snarky");
  const w = v.length > 0 ? v[Math.floor(Math.random() * v.length)] : "casual observation", x = Ge("brief"), S = `You are ${e.name}${g} commenting on a post by ${U2} on the office's personal social platform.
${x ? `
${x}
` : ""}
POST by ${U2}: "${r.substring(0, 200)}"
${l ? `[Post includes an image: ${c}]` : ""}

\u2550\u2550\u2550 YOUR CHARACTER \u2550\u2550\u2550
Personality: ${d}
The poster: ${U2}${u2 ? ` \u2014 your boss. If you address them, say "boss" or @TheBoss. NEVER address the poster by a coworker's name.` : ""}
Relationship with poster: ${J2}
Your angle for THIS comment: ${w}${Wr(e, true)}

\u2550\u2550\u2550 COMMENT STYLE GUIDE \u2550\u2550\u2550
Write like a REAL PERSON having a genuine reaction:
\u2022 Share your actual OPINION or THOUGHT about the post content
\u2022 Ask a follow-up QUESTION if curious about something
\u2022 Make a RELEVANT joke if you're funny
\u2022 Share a brief RELATED experience ("This reminds me of...")
\u2022 Agree or DISAGREE with something specific
\u2022 React to the IMAGE if there is one - describe what you notice

\u2550\u2550\u2550 ABSOLUTELY DO NOT \u2550\u2550\u2550
\u274C Generic praise ("Love this!", "Amazing!", "So good!")
\u274C Hype phrases ("Main character energy", "The confidence!", "I'm here for it")
\u274C Empty reactions (just emojis with no substance)
\u274C Meta-commentary about your personality
\u274C Tag or mention other coworkers (@name, "back me up", "tell them")
\u274C Ask others to support/agree with you ("Am I right?", "@[name] back me up")
${f}${b}

${h ? `
\u2550\u2550\u2550 IMAGE REQUEST CONTEXT \u2550\u2550\u2550
The post is SPECIFICALLY asking people to share images/photos. You MUST participate!

${y ? `This is explicit/NSFW content. Your response depends on your relationship:
${o > 60 ? `\u2192 You're very comfortable with the poster. ENTHUSIASTICALLY share! Use a phrase like "Here's mine! \u{1F4F8}", "Posted! \u{1F60F}", "Sharing mine now \u{1F525}", or "Here's my entry!" \u2014 be playful and confident.` : o > 30 ? `\u2192 You know the poster decently. You'll participate but maybe dial back the explicitness \u2014 share a teasing/suggestive version. Use phrases like "Here's my take \u{1F60F}", "Posted mine! Not QUITE what you asked for \u{1F609}", "Sharing! Kept it a little classy \u{1F48B}"` : a > 50 ? `\u2192 You're friendly but not intimate. Still participate! Share something cheeky/suggestive but not explicit. Use "Here's my version \u{1F604}", "Posted! Kept it PG-13 \u{1F609}", "My entry! I kept some mystery \u{1F60F}"` : a < 25 ? `\u2192 You're not close to the poster. STILL PARTICIPATE but with sarcastic or malicious compliance! Examples: "Here, you asked for it \u{1F644}\u{1F4F8}" (share something deliberately bad/unflattering/ironic), "Posted. Happy now? \u{1F612}", "Fine, here's your 'content' \u{1F643}" (share something technically matching but humorous/sarcastic), "My 'best' entry \u{1F60F}" (deliberately mocking compliance)` : `\u2192 Participate with mild enthusiasm or a playful deflection that still includes a photo. "Here's something \u{1F4F8}", "Posted mine!", "My submission \u{1F60A}"`}
\u2192 ALWAYS use image-claiming language (posted, here's, sharing, uploaded, my pic/photo/entry, etc.)
\u2192 DO NOT redirect to DMs for image request posts \u2014 post INLINE` : `This is casual/SFW content (pets, selfies, etc).
\u2192 ALWAYS participate with an image claim! Use phrases like "Here's my [pet/selfie/photo]! \u{1F4F8}", "Posted mine!", "My entry! [brief comment]"
\u2192 Everyone should share \u2014 this is fun workplace engagement`}

CRITICAL: You are responding to an IMAGE REQUEST. Your comment MUST contain a claim that you're sharing/posting/uploading an image. Use one of these phrases naturally:
\u2022 "Here's mine!", "Here's my [thing]!", "Posted! [reaction]"
\u2022 "Sharing mine now \u{1F4F8}", "My entry!", "Uploaded!", "Here you go!"
\u2022 Do NOT just react with text \u2014 you ARE sharing a photo` : "\n\u274C Redirect to DMs unless explicitly asked for something private"}



Write a 5-25 word comment with genuine personality:`;
  try {
    let n2 = (await queuedGenerateText(S, { temperature: 0.9, top_p: 0.95, max_tokens: 50, stopSequences: ["\n\n", "\n---", "Personality", "Comment:", "Based on", "Analysis:", "{SEEDS", "{BAN", "{BOOST", "Word count", "\u2550\u2550\u2550"] }, `Generating social post comment for ${e.name}`)).trim();
    if (n2 = n2.split("\n")[0].trim(), n2 = n2.replace(/^["']|["']$/g, ""), n2 = n2.replace(/\{[A-Z_]+:[^}]*\}/g, ""), n2 = n2.replace(/@[\w]+\s+(back me up|tell them|right\?|agree|help me out)/gi, ""), n2 = n2.replace(/\b(back me up|back us up|right[\s,]+@?\w+\??|tell them|am i right\??)\s*(here)?/gi, ""), n2 = h ? n2.replace(/^(Based on |My comment is:? |I would (say|comment|reply):? |Comment:? )/i, "") : n2.replace(/^(Here's |Based on |My comment is:? |I would (say|comment|reply):? |Comment:? )/i, ""), n2 = n2.replace(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:'s\s+(?:comment|reply)?|:\s*["']?|\s+(?:comment|reply)s?:?\s*["']?)/i, ""), n2 = n2.replace(/^\*.*?\*\s*/g, ""), n2 = n2.replace(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(raised|lifted|smiled|grinned|chuckled|laughed|sighed|looked|glanced|scanned|typed|tapped|smirked|winked).*?\.\s*/i, ""), n2 = n2.replace(/^The .*? (lit up|flashes|shows|displays):?\s*["']?/i, ""), h || (n2 = n2.replace(/\b(already|just) (sent|DM'?d|shared|posted|slid into)\b/gi, "Sending to"), n2 = n2.replace(/\bslid into (your|my) (dms?|inbox)\b/gi, "Check your DMs")), /^(\*|The screen |The phone |Based on|Here's my comment|Boss said|Personality traits|Brainstorm|\([A-Z]|[A-Z][a-z]+\s+[A-Z][a-z]+'s comment)/i.test(n2)) {
      if (console.warn(`[Context Comment] Meta-text/narration detected: "${n2.substring(0, 60)}"`), h) {
        const e2 = ["Here's mine! \u{1F431}", "Posted! \u{1F4F8}", "Hope this helps! \u{1F495}", "My kitty! \u{1F63B}", "Sharing now! \u2728"];
        return e2[Math.floor(Math.random() * e2.length)];
      }
      return uh(e, t);
    }
    return !n2 || n2.length < 3 ? uh(e, t) : n2;
  } catch (n2) {
    return console.error("AI comment generation failed:", n2), uh(e, t);
  }
}
function uh(e, t) {
  const n = e.stats?.affection || 0, a = e.stats?.desire || 0, o = e.memory?.intimacyLevel || 0, i = e.personality || {}, s = t.explicitLevel >= 2, r = (t.imageUrl, (t.content || "").toLowerCase()), l = (i.humor || 50) > 60, c = (i.confidence || 50) > 60, d = (i.confidence || 50) < 40, p = (i.flirty || 50) > 60, m = (i.outgoing || 50) > 60, u2 = (i.professional || 50) > 65, g = /\b(cat|dog|pet|kitty|puppy|bird|fish)\b/i.test(r), h = /\b(food|eat|lunch|dinner|cook|bake|recipe)\b/i.test(r), y = /\b(work|project|meeting|deadline|office)\b/i.test(r), f = r.includes("?");
  if (/\b(weekend|saturday|sunday|friday night)\b/i.test(r), /\b(travel|trip|vacation|flight|hotel)\b/i.test(r), g) return l ? ['That face says "I know exactly what I did" \u{1F602}', "Plotting world domination, clearly", "The audacity of this creature"][Math.floor(3 * Math.random())] : m ? ["OH MY GOD I NEED TO PET THEM", "Can I come over just to meet them??", "This made my whole day!!"][Math.floor(3 * Math.random())] : d ? ["So cute...", "What a sweetheart", "\u{1F97A}"][Math.floor(3 * Math.random())] : ["What breed is that?", "How old?", "Those eyes! \u{1F495}", "Precious baby"][Math.floor(4 * Math.random())];
  if (h) return l ? ["I'm sending you my address for delivery", "This is food harassment and I'm reporting it", "My sad desk salad is crying rn"][Math.floor(3 * Math.random())] : m ? ["WHERE did you get this?? I need it immediately", "Okay but the presentation though! \u{1F468}\u200D\u{1F373}", "We need a group lunch trip!!"][Math.floor(3 * Math.random())] : u2 ? ["That looks well-prepared", "Nice plating", "Where is this restaurant?"][Math.floor(3 * Math.random())] : ["Looks good! Recipe?", "Making me hungry...", "I should try cooking more"][Math.floor(3 * Math.random())];
  if (y) return l ? ["Thoughts and prayers to your sanity", "The spreadsheets are spreading", "Work: the thing we do between snacks"][Math.floor(3 * Math.random())] : u2 ? ["Let me know if you need a second pair of eyes", "Happy to help review", "Good progress on that"][Math.floor(3 * Math.random())] : n > 60 ? ["You've got this!", "Don't forget to take breaks", "Proud of how hard you work"][Math.floor(3 * Math.random())] : ["Hang in there", "Almost Friday...", "Coffee helps"][Math.floor(3 * Math.random())];
  if (f) return c ? ["I'd say go for it", "Here's my take...", "Honestly? Yes."][Math.floor(3 * Math.random())] : d ? ["Not sure but interested to hear others", "Good question actually", "Hmm..."][Math.floor(3 * Math.random())] : l ? ["The answer is always tacos", 'My magic 8-ball says "ask again later"', "Bold of you to assume I know things"][Math.floor(3 * Math.random())] : ["Depends on the situation", "What does everyone else think?", "I've wondered this too"][Math.floor(3 * Math.random())];
  if (o > 60 && s && p) {
    const e2 = ["\u{1F633}", "Well then...", "You're trouble", "I\u2014", "Saving this"];
    return e2[Math.floor(Math.random() * e2.length)];
  }
  if (o > 50) {
    const e2 = ["\u{1F60A}", "This made me smile", "Of course you did", "Classic you", "Why am I not surprised"];
    return e2[Math.floor(Math.random() * e2.length)];
  }
  if (n > 60 && i.flirty > 60 && a > 40) {
    const e2 = ["Noted \u{1F440}", "Interesting...", "Okay okay \u{1F60F}", "I see you", "Well well"];
    return e2[Math.floor(Math.random() * e2.length)];
  }
  if (n > 50) {
    const e2 = ["Nice!", "Ha! \u{1F604}", "This is great", "Love it", "\u{1F44D}"];
    return e2[Math.floor(Math.random() * e2.length)];
  }
  if (n > 30) {
    const e2 = ["Cool!", "Nice one", "\u{1F60A}", "Haha", "\u{1F44C}"];
    return e2[Math.floor(Math.random() * e2.length)];
  }
  const b = ["\u{1F44D}", "Nice", "\u{1F60A}", "Cool", "\u2728"];
  return b[Math.floor(Math.random() * b.length)];
}
async function ph() {
  if (!gameState.lastProactiveMessageCheck) return void (gameState.lastProactiveMessageCheck = Date.now());
  if (Date.now() - gameState.lastProactiveMessageCheck < 6e4) return;
  gameState.lastProactiveMessageCheck = Date.now();
  const e = gameState.employees.filter((e2) => "active" === e2.employmentStatus);
  if (0 === e.length) return;
  let t = 0;
  const n = Math.random() > 0.7 ? 2 : 1;
  for (const a of e) {
    if (t >= n) break;
    const e2 = await evaluateProactiveMessageTriggers(a);
    e2 && (await mh(a, e2.reason, e2.context), t++);
  }
}
async function evaluateProactiveMessageTriggers(e) {
  if (e.proactiveMessages || (e.proactiveMessages = { lastSentTime: 0, lastSentRealTime: 0, consecutiveUnreplied: 0, lastMoneyRequestTime: 0, hasUnrepliedMoneyRequest: false }), ge.blockedProactiveMessages.has(e.id)) return false;
  if (e.npcStatus) {
    if (["sleeping", "vampire_rest"].includes(e.npcStatus.current)) return false;
    if ("on_date" === e.npcStatus.current) return false;
    if ("in_meeting" === e.npcStatus.current) return false;
    if ("traveling" === e.npcStatus.current && e.npcStatus.responsiveness < 30) return false;
    if (e.npcStatus.responsiveness < 15) return false;
  }
  const t = Date.now(), n = gameState.time?.currentTime || t, a = gameState.chatHistory[e.id] || [], o = a[a.length - 1], i = o?.timestamp || 0, s = (t - i) / 36e5;
  if ((t - i) / 6e4 < 60) return ge.blockedProactiveMessages.add(e.id), false;
  const r = [...a].reverse().find((e2) => e2.isPlayer);
  if ((r?.timestamp ? t - r.timestamp : 1 / 0) / 6e4 < 120) return ge.blockedProactiveMessages.add(e.id), false;
  let l = 0;
  for (let e2 = a.length - 1; e2 >= 0 && !a[e2].isPlayer; e2--) a[e2].isPlayer || l++;
  if (e.proactiveMessages.consecutiveUnreplied = l, e.proactiveMessages.consecutiveUnreplied >= 3) return false;
  if ((n - e.proactiveMessages.lastSentTime) / 36e5 < 24) return false;
  if ((t - e.proactiveMessages.lastSentRealTime) / 6e4 < 30) return false;
  const c = e.relationships?.player || { level: 0, type: "professional" }, d = e.intimacy || 0, p = e.stats?.affection || 0, m = e.stats?.trust || 0, u2 = 0.05 + c.level / 100 * 0.15 + d / 100 * 0.2 + Math.min(s / 24, 0.1);
  if (Math.random() > u2) return false;
  const g = [], h = (gameState.chatHistory[e.id] || []).length, y = h > 20, f = h > 10, b = y ? 1 : f ? 2 : 3;
  if (g.push({ reason: "work_question", weight: b, context: "work" }), g.push({ reason: "work_update", weight: b, context: "work" }), p > 30) {
    const e2 = y ? 5 : f ? 3 : 2;
    g.push({ reason: "casual_chat", weight: e2, context: "casual" });
  }
  if (p > 50) {
    const e2 = y ? 4 : 2;
    g.push({ reason: "sharing_news", weight: e2, context: "personal" });
  }
  if (m > 60) {
    const e2 = y ? 3 : 1;
    g.push({ reason: "asking_advice", weight: e2, context: "personal" });
  }
  const v = gameState.socialNetwork.posts.filter((n2) => n2.authorId === e.id && t - n2.timestamp < 864e5).slice(0, 3);
  v.length > 0 && g.push({ reason: "post_followup", weight: 2, context: { type: "social", post: v[0] } }), d > 40 && g.push({ reason: "flirty_message", weight: 1, context: "flirty" }), d > 70 && g.push({ reason: "booty_call", weight: 1, context: "intimate" }), !((n - (e.lastUnpromptedImageTime || 0)) / 36e5 < 24) && y && d > 50 && (p > 40 && g.push({ reason: "unprompted_selfie", weight: 1, context: "image_casual" }), d > 60 && p > 50 && g.push({ reason: "unprompted_flirty_pic", weight: 1, context: "image_flirty" }), d > 75 && p > 60 && g.push({ reason: "unprompted_lewd_pic", weight: 1, context: "image_lewd" }), d > 85 && p > 70 && g.push({ reason: "unprompted_nude_pic", weight: 1, context: "image_nude" }));
  const w = (n - e.proactiveMessages.lastMoneyRequestTime) / 36e5 / 24;
  e.bankBalance || (e.bankBalance = 0), e.spendingRate || (e.spendingRate = 50 + 150 * Math.random());
  const x = e.bankBalance < 14 * e.spendingRate, S = e.bankBalance < 7 * e.spendingRate, k = S ? 3 : 7, T = h >= 30;
  if (!e.proactiveMessages.hasUnrepliedMoneyRequest && w >= k && T) {
    let e2 = 2;
    S ? e2 = 8 : x && (e2 = 5), p > 50 && m > 50 ? g.push({ reason: "money_request", weight: e2, context: "money" }) : p > 40 && S && g.push({ reason: "money_request", weight: Math.max(2, e2 - 3), context: "money" });
  }
  const C = (Array.isArray(gameState.companyEvents) ? gameState.companyEvents : []).filter((n2) => n2 && n2.involvedEmployees?.includes(e.id) && t - n2.timestamp < 864e5).slice(0, 2);
  C.length > 0 && g.push({ reason: "event_reaction", weight: 2, context: { type: "event", event: C[0] } });
  const E = g.reduce((e2, t2) => e2 + t2.weight, 0);
  let $2 = Math.random() * E;
  for (const e2 of g) if ($2 -= e2.weight, $2 <= 0) return e2;
  return g[0];
}
async function mh(e, t, n) {
  try {
    if ("money_request" === t) {
      const t2 = e.spendingRate || calculateScaledSpendingRate(), n2 = e.bankBalance || 0, a2 = (Date.now(), e.lastMoneyRequest, n2 < 7 * t2), o2 = n2 < 2 * t2;
      let i2;
      if (o2) {
        const e2 = 1 + Math.random();
        i2 = Math.floor(7 * t2 * e2);
      } else if (a2) i2 = Math.floor(7 * t2);
      else {
        const e2 = Math.log10(gameState.cash + 1e3), t3 = Math.pow(10, e2 - 2), n3 = 0.5 + 2 * Math.random();
        i2 = Math.floor(t3 * n3);
      }
      const s2 = Math.max(500, Math.min(i2, 0.15 * gameState.cash)), r2 = 50 * Math.round(s2 / 50);
      let l2;
      l2 = o2 ? "desperate_need" : a2 ? "financial_trouble" : n2 > 30 * t2 ? "luxury_want" : "specific_purchase";
      const c2 = e.personality || {}, d2 = e.stats?.affection || 0, p2 = e.stats?.desire || 0, m2 = e.stats?.trust || 50, u3 = e.stats?.obedience || 50, g2 = `${e.name} wants to ask their boss for $${xu(r2)}.

PERSONALITY & STATS:
- Personality: Confidence ${c2.confidence || 50}/100, Flirty ${c2.flirty || 50}/100, Professional ${c2.professional || 50}/100
- Relationship: Affection ${d2}/100, Desire ${p2}/100, Trust ${m2}/100, Obedience ${u3}/100

FINANCIAL CONTEXT:
- Current balance: $${xu(n2)}
- Daily spending: $${xu(t2)}/day
- Category: ${l2}
${o2 ? "- STATUS: Nearly broke! Urgent need." : ""}
${a2 ? "- STATUS: Running low, getting worried." : ""}

Request categories guide:
- desperate_need: Bills overdue, can't afford rent/food, emergency, very apologetic
- financial_trouble: Running low, stressed about money, expenses piling up
- specific_purchase: Want something specific (gadget, clothes, experience, date, hobby item)
- luxury_want: Not needed but would love to have, indulgent, aspirational

Write a natural, in-character message asking for this money (2-3 sentences). Be specific with details (brand names, stores, items, real reasons). Match their personality and relationship level.

EXAMPLES:
- Desperate: "Boss... I'm so sorry but I'm really struggling. Rent is due and I'm short $X. Could you help me out? \u{1F97A}"
- Financial trouble: "Hey, so my car died and I need $X to fix it. Kind of in a bind here... any chance you could help? \u{1F605}"
- Specific purchase: "OMG there's this amazing [item] at [store] for $X and I NEED it... could you maybe help? \u{1F495}"
- Luxury want: "Saw the cutest designer bag for $X... I know it's indulgent but pretty please? I'll make it worth your while \u{1F618}"

${e.name}'s message:`;
      try {
        const u4 = await queuedGenerateText(g2, { temperature: 0.9, max_tokens: 100, stopSequences: ["\n\n", "Note:", "---", "Amount:"] }, `Generating money request message for ${e.name}`);
        console.log(`[Proactive DM] Money-request raw (${(u4 || "").length} chars) from ${e.name}: ${JSON.stringify(u4)}`);
        const t3 = sanitizeNpcResponse(u4, 3);
        console.log(`[Proactive DM] Money-request after sanitize (${(t3 || "").length} chars): ${JSON.stringify(t3)}`), gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
        const n3 = gameState.time?.currentTime || Date.now(), a3 = gameState.chatHistory[e.id].length;
        gameState.chatHistory[e.id].push({ sender: e.name, content: t3, isPlayer: false, timestamp: n3, proactive: true, isMoneyRequest: true, amount: r2, reason: t3 }), saveGame(false);
        const o3 = gameState.time?.currentTime || Date.now();
        e.proactiveMessages.lastSentTime = o3, e.proactiveMessages.lastSentRealTime = Date.now(), e.proactiveMessages.consecutiveUnreplied++, e.proactiveMessages.lastMoneyRequestTime = o3, e.proactiveMessages.hasUnrepliedMoneyRequest = true, e.lastMoneyRequest = Date.now(), e.unreadMessages || (e.unreadMessages = 0), e.unreadMessages++, console.log(`[Proactive Money Request] ${e.name} requested $${xu(r2)}: "${t3.substring(0, 50)}..."`), remember(e, `I asked the boss for $${xu(r2)}: ${t3}`, "interaction", 1), "people" === gameState.activeTab && updatePeopleTab(), gameState.activeChat?.id === e.id && chatMessages && (Cy(e, r2, t3, a3), chatMessages.scrollTop = chatMessages.scrollHeight, e.unreadMessages = 0);
      } catch (t3) {
        console.error("[Proactive Money Request] Error generating message:", t3);
        const n3 = $y(e, "bills", r2);
        gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
        const a3 = gameState.time?.currentTime || Date.now(), o3 = gameState.chatHistory[e.id].length;
        gameState.chatHistory[e.id].push({ sender: e.name, content: n3, isPlayer: false, timestamp: a3, proactive: true, isMoneyRequest: true, amount: r2, reason: n3 }), saveGame(false), e.proactiveMessages.lastSentTime = gameState.time?.currentTime || Date.now(), e.proactiveMessages.lastSentRealTime = Date.now(), e.proactiveMessages.consecutiveUnreplied++, e.proactiveMessages.lastMoneyRequestTime = gameState.time?.currentTime || Date.now(), e.proactiveMessages.hasUnrepliedMoneyRequest = true, e.lastMoneyRequest = Date.now(), e.unreadMessages || (e.unreadMessages = 0), e.unreadMessages++, "people" === gameState.activeTab && updatePeopleTab(), gameState.activeChat?.id === e.id && chatMessages && (Cy(e, r2, n3, o3), chatMessages.scrollTop = chatMessages.scrollHeight, e.unreadMessages = 0);
      }
      return;
    }
    if (t.startsWith("unprompted_") && t.includes("pic") || "unprompted_selfie" === t) return void await gh(e, t, n);
    const a = e.personality || {}, o = e.relationships?.player || { level: 0, type: "professional" }, i = e.intimacy || 0, s = e.stats?.affection || 0;
    let r = "";
    "string" == typeof n ? r = n : "social" === n.type && n.post ? r = `Recent post: "${n.post.content || ""}"` : "event" === n.type && n.event && (r = `Recent event: ${n.event.description}`);
    const l = gameState.chatHistory[e.id] || [], c = l.length;
    let d = 3;
    s > 60 && c > 20 ? d = 8 : s > 30 && c > 10 && (d = 5);
    const p = l.slice(-d), m = [...l].reverse().find((e2) => e2.isPlayer), u2 = [...l].reverse().find((e2) => !e2.isPlayer);
    let g = "";
    if (m && u2) {
      const e2 = /\?|what|how|why|when|where|who|should|would|could/i.test(m.content), t2 = m.content.length > 50 && !e2;
      g = e2 && u2.timestamp < m.timestamp ? "\u26A0\uFE0F CONVERSATION STATE: Last player message asked something. You can follow up on that topic or acknowledge it naturally." : t2 ? "\u26A0\uFE0F CONVERSATION STATE: Last player message was substantial. You can respond to it, expand on it, or naturally continue that thread." : "\u26A0\uFE0F CONVERSATION STATE: Conversation ended naturally. You're starting a new topic - make it interesting!";
    }
    let h = "";
    p.length > 0 && (h = p.map((t2) => `${t2.isPlayer ? "Boss" : e.name}: ${t2.content}`).join("\n")), e.recentMessageTypes || (e.recentMessageTypes = []);
    const y = e.recentMessageTypes.slice(0, 5).join(", "), f = getPlayerDescription("conversation", e), b = "the boss" !== f ? `

\u{1F464} BOSS INFO:
${f}` : "", v = ss(e.id, true), w = v ? `

${v}` : "", x = (/* @__PURE__ */ new Date()).getHours();
    let S = "";
    S = x >= 6 && x < 12 ? "It's morning. Messages can be about starting the day, morning mood, coffee, etc." : x >= 12 && x < 17 ? "It's afternoon. Messages can be about work progress, lunch, midday thoughts." : x >= 17 && x < 22 ? "It's evening. Messages can be about wrapping up work, evening plans, relaxing." : "It's late night. Messages can be casual, personal, or about being up late.";
    const k = `You are ${e.name}, initiating a conversation with your boss (@TheBoss).

YOUR PERSONALITY:
- Confidence: ${a.confidence || 50}/100
- Flirtiness: ${a.flirty || 50}/100
- Outgoing: ${a.outgoing || 50}/100
- Professional: ${a.professional || 50}/100
- Humor: ${a.humor || 50}/100
${e.hobbies ? `- Hobbies: ${e.hobbies.join(", ")}` : ""}
${e.position ? `- Job: ${e.position}` : ""}

YOUR RELATIONSHIP:
- Affection: ${s}/100 ${s > 70 ? "(very close)" : s > 40 ? "(friendly)" : "(professional)"}
- Intimacy: ${i}/100 ${i > 60 ? "(intimate/romantic)" : i > 30 ? "(comfortable)" : "(reserved)"}
- Type: ${o.type || "professional"}
- Messages exchanged: ${c} ${c > 20 ? "(well-developed relationship)" : c > 10 ? "(getting to know each other)" : "(still new)"}${b}${w}

CONTEXT:
- Reason for messaging: ${t}
- ${r || "No specific context"}
- ${S}
${h ? `
RECENT CONVERSATION:
${h}

${g}` : "\nNo recent conversation - you're starting fresh"}
${y ? `

\u26A0\uFE0F VARIETY: Your recent message types: ${y}
Write something DIFFERENT this time - new angle, different tone, fresh approach!` : ""}

\u{1F4DD} MESSAGE STRATEGY FOR DEVELOPED RELATIONSHIPS (${c}+ messages):

${s > 70 && c > 20 ? `\u2728 YOU'RE VERY CLOSE - BE AUTHENTIC AND PERSONAL:
- Reference earlier conversations naturally ("Remember when we talked about...")  
- Pick up threads that were left hanging from your last chat
- Show you've been thinking about them/previous topics
- Be genuinely personal - you know each other well
- Can bring up inside jokes, shared experiences, ongoing situations
- If last conversation was intimate/personal, acknowledge it naturally
- Don't randomly shift to generic work talk unless there's a reason

\u{1F3AF} PRIORITY: Personal > Work unless reason specifically work-related

AVOID:
- \u274C Generic "quick update" or "quick q" without substance
- \u274C Random work questions when your relationship is personal
- \u274C Ignoring what you last talked about
- \u274C Acting like strangers when you've had ${c} meaningful exchanges

INSTEAD:
- \u2713 "Hey! Been thinking about [earlier topic]..."
- \u2713 "So about what we discussed last time..."
- \u2713 "Random but remember when [callback]?"
- \u2713 Continue natural threads from your last conversation
- \u2713 Reference specific moments or topics you've shared
- \u2713 Match the intimacy level of your relationship
` : s > 40 && c > 10 ? `\u{1F331} YOU'RE FRIENDLY - BE MORE PERSONAL:
- You can reference earlier topics naturally  
- Show progression - you're getting more comfortable
- Mix personal and professional topics (lean more personal)
- Less formal than when you first met
- Can bring up non-work stuff you've discussed before
- Acknowledge previous conversations casually

\u{1F3AF} PRIORITY: Balance Personal & Work (slightly favor personal)

EXAMPLES:
- \u2713 "Hey! So I've been thinking about [topic from before]..."
- \u2713 "Quick q but also curious about [personal thing]..."
- \u2713 Reference hobbies or interests you've discussed
` : s > 20 && c > 5 ? `\u{1F454} YOU'RE PROFESSIONAL BUT WARMING UP:
- Mostly professional topics but can be friendly
- Reference past work conversations
- Can ask personal questions to build connection
- Keep it respectful but show personality

\u{1F3AF} PRIORITY: Work-focused with friendly personal touches

EXAMPLES:
- \u2713 "Hey boss, quick work thing + how's your day?"
- \u2713 Professional questions with warm tone
- \u2713 Can mention non-work topics casually
` : "\u{1F195} RELATIONSHIP IS NEW - BUILD CONNECTION:\n- Keep it professional but friendly\n- Work topics are natural starters\n- Can ask getting-to-know-you questions\n- Show your personality without being too personal yet\n\n\u{1F3AF} PRIORITY: Professional with friendly openness\n"}

\u{1F4DD} MESSAGE STYLE GUIDE BY REASON:

**work_question**: ${s > 60 && c > 15 ? "CLOSE RELATIONSHIP - Work questions should connect to your history:" : "Ask genuine questions that show personality:"}
${s > 60 && c > 15 ? `- "Hey, remember [earlier topic]? Had a thought about it..."
- "Quick q but it relates to [something we discussed]..."
- "Been thinking about what you said about [X]..."
- ONLY use generic work q's if they're genuinely time-sensitive
- Better to connect work stuff to your existing conversations` : `- "Quick q - what's your take on [specific thing]?"
- "Need your input when you have a sec"
- "Random work thought - [specific question]?"
- Show your personality in how you ask`}
${a.humor > 60 ? "- Add humor if it fits your personality!" : ""}

**work_update**: ${s > 60 && c > 15 ? "CLOSE RELATIONSHIP - Make updates relevant to your connection:" : "Share updates like a real person:"}
${s > 60 && c > 15 ? `- "That thing we talked about? Just wrapped it up \u{1F4AA}"
- "Update on [something you know they care about based on history]..."
- "Remember when you asked about [X]? Got news..."
- Connect updates to previous conversations when possible
- AVOID: Generic project updates to someone you're close with` : '- "Just crushed that deadline \u{1F4AA}"\n- "Update: thing you asked about is done!"\n- "FYI - wrapped up early on [project]"\n- "Quick win today \u{1F389}"'}
${s > 50 ? "- Show enthusiasm if you like the boss!" : ""}

**casual_chat**: ${s > 60 && c > 15 ? "CLOSE RELATIONSHIP - Be genuinely personal and connected:" : "Be genuinely casual and varied:"}
${s > 60 && c > 15 ? `- "Been thinking about you lately \u{1F4AD}"
- "So I was remembering [specific earlier conversation topic]..."
- "You know what? [personal share that connects to your history]"
- "Miss talking to you - got a minute?"
- "Random but [callback to inside joke or shared moment]..."
- Reference specific things you've discussed before
- Can acknowledge your closeness naturally
- AVOID: Generic "how's your day" when you have real history` : `- "Hey! How's your day going?"
- "Random thought: [something interesting]"
- "Saw something that made me think of you"
- "Quick break from work - what are you up to?"`}
- Time-appropriate: morning coffee, afternoon check-in, evening plans
${a.humor > 70 ? "- Share funny observations!" : ""}
${i > 50 ? "- Can be more personal and warm" : ""}

**sharing_news**: ${c > 20 ? "Share in a way that acknowledges your relationship:" : "Share something interesting:"}
${c > 20 ? `- "Okay so remember [earlier topic]? Update on that..."
- "You'll appreciate this - [news related to shared context]"
- "Had to tell you - [something that connects to your conversations]"
- Reference your relationship naturally in how you share` : `- "Dude, you won't believe what just happened \u{1F605}"
- "Okay so [specific thing] just went down"
- "Fun fact I just learned: [something relevant]"
- "This is wild - [share actual news/event]"`}
${e.hobbies ? "- Reference your hobbies naturally" : ""}

**asking_advice**: NOT "Could I get your advice?" - Too formal!
INSTEAD: Ask naturally and specifically:
- "Quick dilemma - [specific situation]?"
- "Need a second opinion on something"
- "What would you do if [specific scenario]?"
- "Honest question: [actual question]"
${s > 60 ? "- Can ask personal advice, not just work" : ""}

**post_followup**: Reference YOUR OWN post naturally:
- "Did you see my post about [topic]? \u{1F4F1}"
- "Posted something earlier that made me think of you"
- "That post got more attention than I expected lol"
- NOT: "I saw you liked my post" (unless context specifically says boss liked it!)

**flirty_message**: ${i > 40 ? "You can be subtly flirty" : "Keep it light and playful"}:
- "Hey you \u{1F60A}"
- "Been thinking about you"
- "Miss talking to you"
- ${i > 60 ? "Be playful with what they are doing" : "Light compliments work well"}
${a.flirty > 70 ? "- Be bolder based on your personality" : "- Keep it subtle and tasteful"}

**booty_call**: ${i > 60 ? "Be direct but playful" : "Suggest hanging out casually"}:
- ${i > 70 ? "Can be direct about tonight" : "Suggest drinks or hanging out"}
- ${i > 80 ? "Be flirty and suggestive" : "Keep it casual"}
- ${i > 60 ? "Show interest romantically" : "Friendly hangout vibes"}

**event_reaction**: React naturally to what happened:
- "So about [event] \u{1F605}"
- "That was [emotion]!"
- "Can we talk about what just happened?"
- Be specific to the actual event

\u{1F3AF} TONE GUIDELINES:
${a.confidence > 70 ? "\u2713 Be direct and bold" : "\u2713 Be thoughtful and considerate"}
${a.outgoing > 70 ? "\u2713 Be enthusiastic and expressive" : "\u2713 Be calm and measured"}
${a.professional > 70 ? "\u2713 Keep it polished but warm" : "\u2713 Be casual and relaxed"}
${a.humor > 70 ? "\u2713 Add wit and humor" : "\u2713 Keep it sincere"}
${i > 60 ? "\u2713 Can be personal and intimate" : i > 30 ? "\u2713 Friendly and comfortable" : "\u2713 Professional but friendly"}
${s > 70 ? "\u2713 Show warmth and care" : s > 40 ? "\u2713 Be friendly" : "\u2713 Keep it respectful"}

RULES:
- Max 300 characters
- Use 0-2 emojis (use naturally, not forced)
- NO quotation marks
- NO "I would say" or meta-commentary
- NO formal business-speak
- BE SPECIFIC not generic
- SHOW personality
- DON'T invent boss actions not in context
- Sound like an actual person texting

Write ONLY the message:`, G2 = await queuedGenerateText(k, { temperature: 0.9, max_tokens: 80, stopSequences: ["\n\n", "(Character", "(Emojis", "(Approach", "Note:", "**Note", "---", "Rating:"] }, `Generating DM message for ${e.name}`);
    console.log(`[Proactive DM] Raw (${(G2 || "").length} chars) from ${e.name} [${t}]: ${JSON.stringify(G2)}`);
    let T = sanitizeNpcResponse(G2, 2).trim();
    console.log(`[Proactive DM] After sanitize (${T.length} chars): ${JSON.stringify(T)}`);
    let U2 = T;
    T = T.split(/\(Character count:/)[0], T !== U2 && console.log(`[Proactive DM] Split '(Character count:' trimmed ${U2.length}\u2192${T.length} chars`), U2 = T, T = T.split(/\(Emojis used:/)[0], T !== U2 && console.log(`[Proactive DM] Split '(Emojis used:' trimmed ${U2.length}\u2192${T.length} chars`), U2 = T, T = T.split(/\(Approach:/)[0], T !== U2 && console.log(`[Proactive DM] Split '(Approach:' trimmed ${U2.length}\u2192${T.length} chars`), T = T.trim();
    const J2 = T ? T.length < 5 ? `too short (${T.length} chars < 5)` : T.length > 300 ? `too long (${T.length} chars > 300)` : /^[a-zA-Z]$/.test(T) ? "single letter" : /^[^a-zA-Z]*$/.test(T) ? "no letters" : /^(b|ok|k|lol|hi|hey|yo|sup|hm|hmm|um|uh|ah)$/i.test(T) ? "filler word" : null : "empty";
    if (J2) {
      console.warn(`[Proactive DM] Rejected (${J2}) from ${e.name}: ${JSON.stringify(T)} \u2192 using stale fallback`);
      const n2 = { work_question: ["Hey, got a quick question when you have a sec", "Quick work thing - need your input on something", "Got a minute? Need to run something by you"], work_update: ["Just wanted to give you a quick update on things", "Hey! Made some progress today, thought you should know", "Quick update from my end"], casual_chat: ["Hey! How's your day going?", "Random thought - what are you up to?", "Just checking in, hope your day's going well"], sharing_news: ["Okay you're not gonna believe what just happened", "Had to tell you about something real quick", "Something interesting happened today"], asking_advice: ["Need your opinion on something when you get a chance", "Quick question - what would you do in this situation?", "Hey, got a minute? Could use some advice"], flirty_message: ["Hey you", "Been thinking about you", "Miss talking to you"], booty_call: ["Hey... you busy tonight?", "What are you up to later?", "Thinking about you tonight"], post_followup: ["Did you see what I posted earlier?", "Posted something earlier, curious what you think", "Check out my latest post when you get a chance"], event_reaction: ["Can we talk about what just happened?", "So that was something, right?", "Did you hear about what happened?"] }, a2 = n2[t] || n2.casual_chat;
      T = a2[Math.floor(Math.random() * a2.length)], console.log(`[Proactive DM] Using stale fallback for ${e.name}: ${JSON.stringify(T)}`);
    } else console.log(`[Proactive DM] \u2705 Accepted (${T.length} chars) from ${e.name}: ${JSON.stringify(T)}`);
    e.recentMessageTypes.unshift(t), e.recentMessageTypes.length > 10 && (e.recentMessageTypes = e.recentMessageTypes.slice(0, 10)), gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
    const C = gameState.time?.currentTime || Date.now();
    gameState.chatHistory[e.id].push({ sender: e.name, content: T, isPlayer: false, timestamp: C, proactive: true }), saveGame(false);
    const E = gameState.time?.currentTime || Date.now();
    if (e.proactiveMessages.lastSentTime = E, e.proactiveMessages.lastSentRealTime = Date.now(), e.proactiveMessages.consecutiveUnreplied++, "money_request" === t && (e.proactiveMessages.lastMoneyRequestTime = E, e.proactiveMessages.hasUnrepliedMoneyRequest = true), console.log(`[Proactive Message] ${e.name} sent message (${e.proactiveMessages.consecutiveUnreplied}/3 unreplied)`), e.unreadMessages || (e.unreadMessages = 0), e.unreadMessages++, remember(e, `I messaged the boss: "${T}"`, "interaction", 1), "people" === gameState.activeTab && updatePeopleTab(), gameState.activeChat?.id === e.id && chatMessages) {
      const t2 = gameState.chatHistory[e.id].length - 1;
      addChatMessage(e.name, T, false, null, t2), chatMessages.scrollTop = chatMessages.scrollHeight, e.unreadMessages = 0;
    }
  } catch (e2) {
    console.error("Error sending proactive NPC message:", e2);
  }
}
async function gh(e, t, n) {
  try {
    console.log(`[Unprompted Image] ${e.name} sending ${t}`);
    let n2 = "casual", a = "";
    switch (t) {
      case "unprompted_selfie":
        n2 = "casual", a = "A cute selfie to share with someone they like - could be at work, home, out and about, or doing a hobby";
        break;
      case "unprompted_flirty_pic":
        n2 = "lewd", a = "A flirty, suggestive photo to tease someone they're attracted to - showing off, being playful";
        break;
      case "unprompted_lewd_pic":
        n2 = "lewd", a = "A revealing, sexy photo - underwear, lingerie, suggestive poses, showing skin";
        break;
      case "unprompted_nude_pic":
        n2 = "nude", a = "An intimate nude photo for someone they trust and desire";
    }
    const o = e.personality || {}, i = e.intimacy || 0, s = e.stats?.affection || 0, r = getPhysicalDescriptionForPrompt(e), l = e.race && "human" !== e.race ? e.race : "human", c = e.physical?.raceFeatures?.description || "", d = pe ? pe.getHour() : (/* @__PURE__ */ new Date()).getHours();
    let p = "";
    p = d >= 6 && d < 12 ? "morning - just woke up, getting ready, morning light" : d >= 12 && d < 17 ? "afternoon - at work, on break, daytime activities" : d >= 17 && d < 22 ? "evening - after work, relaxing, evening mood" : "late night - in bed, intimate setting, dim lighting";
    const m = `Generate an image prompt for ${e.name} sending an unprompted ${n2} photo.

CHARACTER: ${e.name}
- ${r}
- Species: ${l}${c ? ` (${c})` : ""}
- Personality: Confidence ${o.confidence || 50}/100, Flirty ${o.flirty || 50}/100

CONTEXT: ${a}
TIME: ${p}
INTIMACY LEVEL: ${i}/100
AFFECTION: ${s}/100

Create a detailed image prompt (40-80 words) for this spontaneous photo. Include:
- Setting/location appropriate for the time of day
- Pose and expression matching their personality
- Clothing/state appropriate for the image type
- Mood and lighting
${"human" !== l ? `- Include ${l} features prominently!` : ""}

Write ONLY the image description:`;
    let u2 = await queuedGenerateText(m, { temperature: 0.9, max_tokens: 150 }, `Generating unprompted image prompt for ${e.name}`);
    u2 = extractText(u2).trim(), u2.toLowerCase().includes(e.name.toLowerCase().split(" ")[0]) || (u2 = `${e.name}, ${r}. ${u2}`), console.log("[Unprompted Image] Prompt:", u2.substring(0, 100) + "...");
    const g = await queuedGenerateImage(applyImageStyle(u2), `Unprompted ${n2} image from ${e.name}`);
    if (!g) return void console.error("[Unprompted Image] Failed to generate image");
    const h = `${e.name} is spontaneously sending a ${n2} photo to their boss, who they ${s > 70 ? "really like" : s > 40 ? "are fond of" : "respect"}.

Relationship: Affection ${s}/100, Intimacy ${i}/100
Personality: Confidence ${o.confidence || 50}/100, Flirty ${o.flirty || 50}/100, Playful ${o.humor || 50}/100
Time: ${p}

Photo type being sent: ${n2}
${"casual" === n2 ? "This is a cute/friendly selfie" : ""}
${"lewd" === n2 ? "This is a flirty/revealing photo" : ""}
${"nude" === n2 ? "This is an intimate nude photo" : ""}

Write a SHORT message (1-2 sentences, max 100 chars) to accompany this spontaneous photo. Be natural and match their personality:
- Casual: Friendly, maybe a bit playful
- Flirty: Teasing, confident, coy
- Lewd: Bold, seductive, wanting attention
- Nude: Intimate, bold, trusting, possibly aroused

Examples:
- "Thought you might like this \u{1F60F}"
- "Thinking of you \u{1F495}"  
- "Just for you..."
- "Miss you \u{1F970}"
- "Bored at home... entertain me? \u{1F618}"

${e.name}'s message:`;
    let y = await queuedGenerateText(h, { temperature: 0.9, max_tokens: 30, stopSequences: ["\n\n", "(", "---"] }, `Generating unprompted image message for ${e.name}`);
    if (y = sanitizeNpcResponse(y, 1).trim(), !y || y.length > 100) {
      const e2 = { casual: ["Just thinking of you \u{1F60A}", "Hey there \u{1F4F8}", "For you \u{1F495}"], lewd: ["Like what you see? \u{1F60F}", "Thought you might appreciate this...", "Miss you \u{1F618}"], nude: ["Just for you \u{1F495}", "Thinking of you...", "Want to see more? \u{1F60F}"] };
      y = e2[n2]?.[Math.floor(3 * Math.random())] || "For you \u{1F495}";
    }
    gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
    const f = gameState.time?.currentTime || Date.now(), b = gameState.chatHistory[e.id].length;
    gameState.chatHistory[e.id].push({ sender: e.name, content: y, isPlayer: false, imageUrl: g, imagePrompt: u2, imageType: "received", timestamp: f, proactive: true, isUnpromptedImage: true }), saveGame(false);
    const v = gameState.time?.currentTime || Date.now();
    e.proactiveMessages.lastSentTime = v, e.proactiveMessages.lastSentRealTime = Date.now(), e.proactiveMessages.consecutiveUnreplied++, e.lastUnpromptedImageTime = v, e.unreadMessages || (e.unreadMessages = 0), e.unreadMessages++, remember(e, `Sent spontaneous ${n2} photo to the boss`, "event", 1.5), e.photos || (e.photos = []), e.photos.push({ url: g, prompt: u2, type: n2, timestamp: f, unprompted: true }), console.log(`[Unprompted Image] ${e.name} sent ${n2} image: "${y}"`), showNotification(`\u{1F4F8} ${e.name} sent you a photo!`, "info"), "people" === gameState.activeTab && updatePeopleTab(), gameState.activeChat?.id === e.id && chatMessages && (addChatMessage(e.name, y, false, g, b, u2, f), chatMessages.scrollTop = chatMessages.scrollHeight, e.unreadMessages = 0);
  } catch (e2) {
    console.error("[Unprompted Image] Error:", e2);
  }
}
function updateNewsFeed() {
  newsFeed && (gameState.news && Array.isArray(gameState.news) || (gameState.news = ["Tech startup raises $1M in seed funding", "New productivity app trends in office spaces", "Remote work policies reshape company cultures", "AI integration boosts efficiency across industries"]), newsFeed.innerHTML = "", gameState.news.forEach((e, t) => {
    const n = document.createElement("div");
    n.className = "news-item", n.style.cssText = "background:var(--h); border-radius:8px; padding:12px; margin-bottom:10px;", n.innerHTML = ` <p style="margin:0;">${e}</p> <p style="margin:5px 0 0 0; font-size:0.8rem; color:var(--a);">${(/* @__PURE__ */ new Date()).toLocaleDateString()}</p> `, newsFeed.appendChild(n);
  }));
}
function adjustEmployeeLifestyles() {
  const e = 50 + 100 * Math.random(), t = calculateScaledSpendingRate(e) / e;
  gameState.employees.forEach((e2) => {
    if (!e2.spendingRate) return void (e2.spendingRate = calculateScaledSpendingRate());
    const n = 0.05 * (calculateScaledSpendingRate(e2.spendingRate / Math.max(1, t / 1.5)) - e2.spendingRate);
    Math.abs(n) > 1 && (e2.spendingRate += n, e2.spendingRate = Math.max(50, Math.min(5e4, e2.spendingRate)));
  });
}
