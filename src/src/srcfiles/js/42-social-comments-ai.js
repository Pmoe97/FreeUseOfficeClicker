// ============================================================================
// 42-social-comments-ai — AI comments: comment generation pipeline, autonomous comments/likes, mention responses, image detection, news feed.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function extractMetaPatterns(e) {
    const t = [],
        n = e.match(/\*\([^)]{0,50}/g);
    n && t.push(...n);
    const a = e.match(/\*\*\([^)]{0,50}/g);
    a && t.push(...a);
    const o = e.match(/\{(SEEDS|BAN|BOOST):[^}]+\}/g);
    o && t.push(...o);
    return (
        [
            "Balanced authenticity",
            "Expresses excitement",
            "Fits outgoing",
            "conveys professionalism",
            "Emojis reinforce",
            "reinforces determined",
            "Balances professionalism",
            "hints at role",
            "subtly conveys",
            "(Note:",
            "(Approach:",
            "(Style:",
            "(Character count:",
            "(Emojis used:",
        ].forEach((n) => {
            e.includes(n) && t.push(n);
        }),
        t
    );
}
function getEmployeePersonality(e) {
    const t = gameState.employees.find((t) => t.id === e);
    return t
        ? {
              outgoing: t.personality?.outgoing || 50,
              professional: t.personality?.professional || 50,
              flirty: t.personality?.flirty || 50,
              confidence: t.personality?.confidence || 50,
          }
        : null;
}
function cleanWithLearning(e) {
    if (!e) return e;
    let t = e;
    [
        /\*\([^)]*\)\*/g,
        /\*\*\([^)]*\)\*\*/g,
        /\{SEEDS:[^\}]*\}/gi,
        /\{BAN:[^\}]*\}/gi,
        /\{BOOST:[^\}]*\}/gi,
        /\{META:[^\}]*\}/gi,
        /\(Note:[^\)]*\)/gi,
        /\(This [^\)]*\)/gi,
        /\(Balanced [^\)]*\)/gi,
        /\(Expresses [^\)]*\)/gi,
        /\(Fits [^\)]*\)/gi,
        /\(Captures [^\)]*\)/gi,
        /\(Shows [^\)]*\)/gi,
        /\(Hints at [^\)]*\)/gi,
        /\(Reflects [^\)]*\)/gi,
        /\(Personality:[^\)]*\)/gi,
        /\(Analysis:[^\)]*\)/gi,
        /\(Context:[^\)]*\)/gi,
        /\*\*\*[^\*]*\*\*\*/g,
        /\[meta[^\]]*\]/gi,
        /\[Note:[^\]]*\]/gi,
        /\[This [^\]]*\]/gi,
        /caught in mid[- ]\w+/gi,
        /\bmid[- ](laugh|sip|bite|smile|stretch|yawn|thought|action|conversation|stride|gesture)/gi,
    ].forEach((e) => {
        t = t.replace(e, "");
    });
    return (
        (gameState.aiQuality?.bannedPatterns || []).forEach((e) => {
            try {
                const n = e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                    a = new RegExp(n, "gi");
                t = t.replace(a, "");
            } catch (t) {
                console.warn("Invalid banned pattern:", e, t);
            }
        }),
        (t = t.replace(/\n{3,}/g, "\n\n")),
        (t = t.replace(/  +/g, " ")),
        (t = t.trim()),
        t
    );
}
function showAITrainingTutorial() {
    gameState.aiQuality.tutorialShown = !0;
    const e = document.createElement("div");
    (e.id = "aiTrainingTutorial"),
        (e.style.cssText =
            "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-85); display:flex; align-items:center; justify-content:center; z-index:10001; padding:20px;"),
        (e.innerHTML =
            '\n      <div style="background:linear-gradient(135deg, var(--l-panel-2) 0%, var(--l-bg) 100%); border:2px solid var(--accent); border-radius:20px; max-width:600px; width:100%; padding:40px; box-shadow:0 8px 32px rgba(0,212,255,0.3); position:relative;">\n        <div style="text-align:center; margin-bottom:30px;">\n          <div style="font-size:4rem; margin-bottom:15px;">🤖✨</div>\n          <h2 style="color:var(--l-ink); margin:0; font-size:1.8rem; margin-bottom:10px;">Train Your AI!</h2>\n          <div style="color:var(--accent); font-size:1.1rem; font-weight:600;">Reinforcement Learning from Human Feedback</div>\n        </div>\n        \n        <div style="background:rgba(0,212,255,0.1); padding:20px; border-radius:12px; border-left:4px solid var(--accent); margin-bottom:25px;">\n          <p style="color:var(--text); line-height:1.8; margin:0; font-size:0.95rem;">\n            Help improve AI-generated content quality by voting on posts, comments, and chat messages!\n          </p>\n        </div>\n        \n        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:25px;">\n          <div style="background:rgba(78,204,163,0.15); padding:20px; border-radius:12px; border:1px solid var(--positive);">\n            <div style="font-size:2rem; margin-bottom:10px;">👍</div>\n            <h3 style="color:var(--positive); margin:0 0 10px 0; font-size:1.1rem;">Upvote</h3>\n            <p style="color:var(--text); font-size:0.85rem; margin:0; line-height:1.6;">\n              Quality content, coherent writing, good formatting, immersive text\n            </p>\n          </div>\n          \n          <div style="background:rgba(233,69,96,0.15); padding:20px; border-radius:12px; border:1px solid var(--danger);">\n            <div style="font-size:2rem; margin-bottom:10px;">👎</div>\n            <h3 style="color:var(--danger); margin:0 0 10px 0; font-size:1.1rem;">Downvote</h3>\n            <p style="color:var(--text); font-size:0.85rem; margin:0; line-height:1.6;">\n              Meta-commentary *(like this)*, {SEEDS:tokens}, analysis, broken formatting\n            </p>\n          </div>\n        </div>\n        \n        <div style="background:var(--l-sheen-05); padding:20px; border-radius:12px; margin-bottom:25px;">\n          <h3 style="color:var(--l-ink); margin:0 0 15px 0; font-size:1rem;">📊 Training Progress</h3>\n          <div style="display:flex; flex-direction:column; gap:10px;">\n            <div style="display:flex; justify-content:space-between; align-items:center;">\n              <span style="color:var(--text-dim); font-size:0.9rem;">30 votes</span>\n              <span style="color:var(--positive); font-size:0.9rem;">→ Noticeable improvement</span>\n            </div>\n            <div style="display:flex; justify-content:space-between; align-items:center;">\n              <span style="color:var(--text-dim); font-size:0.9rem;">100 votes</span>\n              <span style="color:var(--accent); font-size:0.9rem;">→ Significant quality boost</span>\n            </div>\n            <div style="display:flex; justify-content:space-between; align-items:center;">\n              <span style="color:var(--text-dim); font-size:0.9rem;">1000+ votes</span>\n              <span style="color:var(--accent-gold); font-size:0.9rem;">→ Excellent AI behavior</span>\n            </div>\n          </div>\n        </div>\n        \n        <button onclick="this.closest(\'#aiTrainingTutorial\').remove()" style="width:100%; padding:15px; background:linear-gradient(135deg, var(--l-cyan), var(--l-cyan-dark)); border:none; border-radius:12px; color:var(--l-on-accent); font-size:1.1rem; font-weight:600; cursor:pointer; transition:all 0.3s; box-shadow:0 4px 12px rgba(0,212,255,0.3);" onmouseenter="this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 6px 16px rgba(0,212,255,0.4)\'" onmouseleave="this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'0 4px 12px rgba(0,212,255,0.3)\'">\n          Got it! Let\'s train some AI 🚀\n        </button>\n      </div>\n    '),
        document.body.appendChild(e),
        saveGame();
}
async function addCommentToPost(e, t, n = null) {
    if (!t.trim()) return;
    const a = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!a) return;
    const o = extractMentions(t),
        i = o.map((e) => e.employeeId);
    debugLog("Social", `Comment mentions: ${JSON.stringify(o)}`);
    const s = createComment({
        postId: e,
        authorId: "player",
        authorName: "You",
        content: t.trim(),
        replyToCommentId: n,
        mentionedEmployees: i,
    });
    if (
        (a.comments.push(s),
        console.log(`[Comments] Player added comment to post ${e}. Total comments: ${a.comments.length}`),
        a.isPlayerPost ||
            "player" === a.authorId ||
            addSocialNotification({
                type: "comment",
                fromId: "player",
                fromName: "The Boss",
                postId: a.id,
                preview: t.substring(0, 60),
                targetAuthorId: a.authorId,
            }),
        i.forEach((e) => {
            trackPlayerMention(e);
        }),
        i.length > 0 &&
            (debugLog("Social", `Scheduling mention responses for: ${i.join(", ")}`),
            setTimeout(
                async () => {
                    await triggerCommentMentionResponse(s, a);
                },
                2e3 + 3e3 * Math.random()
            )),
        !a.isPlayerPost &&
            a.authorId &&
            0 === i.length &&
            setTimeout(
                async () => {
                    await generateNPCCommentReply(a, s);
                },
                2e3 + 3e3 * Math.random()
            ),
        a.comments.length >= 3)
    ) {
        const e = Math.min(0.6, 0.25 + 0.05 * a.comments.length);
        Math.random() < e &&
            setTimeout(
                async () => {
                    await triggerAdditionalNPCComments(a);
                },
                3e3 + 5e3 * Math.random()
            );
    }
}
async function detectAndGenerateCommentImage(e, t, n) {
    console.log(`[Social Image Detection] Checking comment from ${t.name}: "${e}"`);
    const a =
        /\b(upload(ed)?|post(ed)!?|here('s| is)|check (it )?out|attached|sent|added|send(ing)?|ping(ing)?|dm(ing|ed)?|shar(e|ed|ing)|showing|brought|slid|slide)\b.*\b(proof|pic(ture)?s?|photo(s)?|image(s)?|it|that|selfie|mine|peek|this|DMs?|direct\s*message)\b/i.test(
            e
        ) ||
        /\b(proof|pic(ture)?s?|photo(s)?|image(s)?|selfie|mine|peek|shot|snap)\b.*\b(upload(ed)?|post(ed)!?|here|attached|sent|added|send(ing)?|ping(ing)?|dm(ing|ed)?|shar(e|ed|ing)|directly|slide|slid)\b/i.test(
            e
        ) ||
        /\b(will|gonna|going to|can|could|let me|'ll)\s+(send|ping|dm|share|upload|post|show|slide)\b.*\b(you|boss|@\w+)\b.*\b(proof|pic(ture)?s?|photo(s)?|image(s)?|it|that|selfie|mine|shot)\b/i.test(
            e
        ) ||
        /\b(my|here'?s?\s+(my|a|the)?)\s+(selfie|pic|photo|image|shot|snap|kitty|cat|dog|pet|garden|proof)\b/i.test(
            e
        ) ||
        /\b(in|into|to)\s+(your|the)?\s*DMs?\b/i.test(e) ||
        /\b(private(ly)?|exclusive(ly)?)\s+(stream(ing|ed)?|content|shot|photo)\b/i.test(e) ||
        /^(posted|sent|sharing|here'?s)!?\s*[😉🐱🐕🌿🔥💕📸🐈‍⬛]/i.test(e.trim());
    console.log(`[Social Image Detection] Claims image upload: ${a}`);
    const o = (n?.content || n?.caption || "").toLowerCase(),
        i =
            /\b(send|post|show|share|upload|pic(s|ture)?|photo|image|proof|selfie|snap|nudes?|tits?|upskirt|panties|flash|reveal)\b/i.test(
                o
            );
    let s = !1;
    if (!a && i) {
        const e = t.memory?.intimacyLevel || 0,
            n = t.stats?.affection || 0,
            a = t.stats?.desire || 0,
            o = 0.45 + Math.min(35, 0.15 * e + 0.1 * n + 0.08 * a) / 100;
        Math.random() < o
            ? ((s = !0),
              console.log(
                  `[Social Image Detection] Override triggered! Post asks for images, probability ${(100 * o).toFixed(0)}% passed. Generating image despite no explicit claim in comment.`
              ))
            : console.log(
                  `[Social Image Detection] Override roll failed (${(100 * o).toFixed(0)}% chance). No image this time.`
              );
    }
    if (!a && !s) return { imageUrl: null, imageAlt: null };
    if (
        (console.log(
            `[Social Image Detection] Image ${s ? "override" : "claim"} detected! Checking generateImage function...`
        ),
        console.log(`[Social Image Detection] generateImage available: ${"function" == typeof generateImage}`),
        "function" != typeof generateImage)
    )
        return (
            console.warn(
                "[Social Image Detection] generateImage function not available - skipping image generation"
            ),
            { imageUrl: null, imageAlt: null }
        );
    try {
        const a = n.content || n.caption || "",
            o = getPhysicalDescriptionForPrompt(t),
            i = t.memory?.intimacyLevel || 0,
            s = t.stats?.affection || 0,
            r = t.stats?.desire || 0,
            l = t.personality?.flirty > 65,
            c = `You are an expert at creating image prompts for AI image generation. You must analyze what the original post REQUESTED and what the comment CLAIMS to provide, then create a prompt that fulfills that request.\n\n=== ORIGINAL POST ===\n"${a}"\n\n=== NPC'S COMMENT ===\n"${e}"\n\n=== PERSON DETAILS ===\n${t.name}: ${o.substring(0, 300)}\n\n=== RELATIONSHIP CONTEXT ===\n- Intimacy: ${i}/100 (${i < 30 ? "casual acquaintances" : i < 60 ? "friends/comfortable" : "intimate/very close"})\n- Affection: ${s}/100\n- Desire: ${r}/100\n${l ? "- Flirty/playful personality" : ""}\n\n=== YOUR TASK ===\nCreate a detailed image prompt that shows what ${t.name} is sharing/uploading in their comment.\n\n⚠️ IMPORTANT: The NPC has ALREADY AGREED to post this content by commenting. Your job is to fulfill their promise, NOT to second-guess whether they should post it based on intimacy level.\n\nCRITICAL RULES:\n1. READ THE POST CAREFULLY - What did the player ASK for? (upskirt? nudes? tits? explicit? cat photo? etc.)\n2. READ THE COMMENT - What did ${t.name} CLAIM to share? (if vague like "here's mine", refer back to post request)\n3. FULFILL THE REQUEST EXACTLY - If post says "upskirt panty shots", the image MUST show upskirt view with panties visible\n4. MATCH THE REQUEST EXPLICITNESS:\n   - Post asks for "upskirt" → LOW camera angle looking UP, panties/underwear visible between legs\n   - Post asks for "nudes" → Show full nudity, body exposed\n   - Post asks for "tits" → Show exposed breasts, nipples visible\n   - Post asks for "pussy" → Show explicit genital focus, legs spread showing genitals clearly\n   - Post asks for "masturbating" → Show explicit sexual activity, hand on genitals\n   - Post asks for "cat photo" → Show an actual cat/pet, NOT the person\n5. DO NOT CENSOR - The NPC already agreed to post, so show what was requested regardless of intimacy level\n6. BE SPECIFIC about clothing state: "wearing nothing", "topless", "completely nude", "panties pulled aside", etc.\n7. DESCRIBE camera angles: "low angle looking up", "POV from below", "close-up", "full body view"\n8. If comment mentions "kitty pic" in response to sexual request → It's likely a tease/deflection, generate actual cat\n9. Include ${t.name}'s physical appearance when they're in the image\n\nGenerate ONLY the image prompt, no explanation:`;
        let d = (
            await queuedGenerateText(
                c,
                {
                    temperature: 0.8,
                    max_tokens: 150,
                    stopSequences: ["\n\n", "\n---", "Note:", "Example:", "CONTEXT:", "Rationale:", "Based on"],
                },
                `Social Image Prompt - ${t.name}`
            )
        )
            .trim()
            .replace(/^["']|["']$/g, "")
            .replace(/^\*+|\*+$/g, "")
            .replace(/^(Image prompt:|DETAILED PROMPT:|Final prompt:|Prompt:|Here is|Here's|Based on.*?:)\s*/i, "")
            .replace(/^(the|a|an)\s+(specific\s+)?image\s+prompt\s+(for|of|showing).*?:\s*/i, "")
            .replace(/\s*\([^)]*Note:.*\)$/i, "")
            .split("\n")[0]
            .trim();
        if (/^(based on|context|the prompt|this prompt|according to)/i.test(d)) {
            const e = d.match(/:\s*(.+)$/);
            e && (d = e[1].trim());
        }
        console.log(`[Social Image] Generated prompt for ${t.name}: "${d.substring(0, 100)}..."`);
        const p = await queuedGenerateImage(applyImageStyle(d), `Social reply image for ${t.name}`);
        return (
            console.log("[Social Image] Image generated successfully!"),
            t.photos || (t.photos = []),
            t.photos.push({
                url: p,
                prompt: d,
                type: "social_comment",
                timestamp: gameState.time?.currentTime || Date.now(),
            }),
            console.log(`[Social Image] Added comment image to ${t.name}'s gallery`),
            { imageUrl: p, imageAlt: d, imagePrompt: d }
        );
    } catch (e) {
        return console.error("[Social] Failed to generate claimed image:", e), { imageUrl: null, imageAlt: null };
    }
}
async function generateNPCCommentReply(e, t) {
    const n = gameState.employees.find((t) => t.id === e.authorId);
    if (n && !((n.employmentStatus && "active" !== n.employmentStatus) || Math.random() > 0.7))
        try {
            const a =
                (/\b(send|post|show|share|upload|give|let me see|wanna see|want to see|pic(s|ture)?|photo|image|proof|snap)\b/i.test(
                    t.content
                ) &&
                    /\b(pic(s|ture)?|photo|image|proof|selfie|that|it)\b/i.test(t.content)) ||
                /\b(pics? or it didn'?t happen|proof or (it )?didn'?t happen|I('ll| will) believe it when I see it)\b/i.test(
                    t.content
                );
            console.log(`[Social Image Request] Player comment requesting image: ${a}`);
            const o = getIntelligentContext(n, "social.comment", {
                    message: t.content,
                    involves: ["player"],
                    keywords: t.content
                        .toLowerCase()
                        .split(/\s+/)
                        .filter((e) => e.length > 3)
                        .slice(0, 10),
                    postContext: e.content || e.caption,
                }),
                i = n.relationships?.player || { level: 0, type: "professional" },
                s = n.memory?.intimacyLevel || 0,
                r = n.personality || {},
                l = r.flirty || 50;
            r.confidence, r.humor;
            let c = "friendly";
            const d = (t.content || "").toLowerCase();
            (s > 60 || i.level > 60) && (c = "warm"),
                s > 80 && (c = "flirty"),
                (d.includes("love") || d.includes("beautiful") || d.includes("gorgeous")) &&
                    (c = l > 60 ? "flirty" : "appreciative"),
                (d.includes("lol") || d.includes("haha") || d.includes("😂")) && (c = "playful");
            const p = getConsentPolicy();
            let m = "";
            m =
                "open" === p
                    ? '🔞 WORKPLACE CULTURE: This is an open, sex-positive workplace where explicit content is NORMAL and accepted. DO NOT act shocked, suggest keeping things "PG", or moralize about sexual content. Everyone is comfortable with adult topics - respond naturally and match the energy without judgment.'
                    : "professional" === p
                      ? "WORKPLACE CULTURE: Maintain professional boundaries even when responding to explicit content."
                      : "WORKPLACE CULTURE: Relaxed office - adult content is acceptable, respond naturally based on your comfort level.";
            const u = /\b(fuck|cock|pussy|dick|cum|sex|explicit|nude|naked|ass|tits|nipple)\b/i.test(t.content),
                g = `${m}\n\n${o}\n\nSITUATION:\nYour post: "${e.content || e.caption || ""}"\n${e.imageAlt ? `(with image: ${e.imageAlt})` : ""}\n\n@TheBoss just commented: "${t.content}"\n${u ? "(This is explicit/sexual content - respond naturally without acting shocked or prudish)" : ""}\n${a ? `\n🎯 IMAGE REQUEST DETECTED: The boss is asking you to send/share/post a picture/photo/proof!\n- If comfortable/willing, AGREE and say you'll post/share/send it (use phrases like "here's", "posted", "sending", "uploaded")\n- Or playfully tease/decline based on relationship and what they're asking for\n- Consider what they're requesting and your comfort level (Intimacy: ${n.memory?.intimacyLevel || 0}/100)\n` : ""}\n\nYour voice (write in this style): ${getSocialVoiceCard(n)}\n\nReply to their comment briefly (max 100 characters).\n\nTONE: ${c}\n${"flirty" === c ? "- Be subtly flirty and playful" : ""}\n${"warm" === c ? "- Be warm and friendly, show closeness" : ""}\n${"appreciative" === c ? "- Show appreciation for the compliment" : ""}\n${"playful" === c ? "- Match their playful energy" : ""}\n${s > 50 ? "- Use emojis, be casual" : "- Professional but friendly"}\n\nJust write the reply directly (no quotes, no meta-commentary):`;
            let h = (
                await queuedGenerateText(
                    g,
                    {
                        temperature: 0.9,
                        max_tokens: 40,
                        stopSequences: ["\n\n", "(Word count", "(personality", "I would", "Rating:"],
                    },
                    `Social Reply - ${n.name}`
                )
            )
                .trim()
                .replace(/^["']|["']$/g, "")
                .replace(/\s*\([^)]*personality[^)]*\)\.?$/i, "")
                .replace(/^(I would (say|reply|comment):|My comment would be:)\s*/i, "")
                .replace(/\n\n\(Word count:.*?\)$/i, "")
                .replace(/\s*\*\(\d+\s*characters?\)\*\s*$/i, "")
                .replace(/\s*\(\d+\s*words?\)\s*$/i, "");
            if (!h || 0 === h.length) return;
            const { imageUrl: y, imageAlt: f, imagePrompt: b } = await detectAndGenerateCommentImage(h, n, e),
                v = createComment({
                    postId: e.id,
                    authorId: n.id,
                    authorName: n.name,
                    content: h.trim(),
                    imageUrl: y,
                    imageAlt: f,
                    imagePrompt: b,
                });
            e.comments.push(v),
                console.log(
                    `[Comments] ${n.name} replied to player comment on post ${e.id}. Total comments: ${e.comments.length}`
                ),
                evaluateNPCReactionToPost(n, gameState.player, e, h),
                remember(n, `Boss commented "${t.content}" on my post, I replied "${h}"`, "interaction", 2);
            const w = document.querySelector(`[data-post-id="${e.id}"]`),
                x = document.querySelector(`.post-comments[data-post-id="${e.id}"]`);
            w &&
                x &&
                (console.log("[Comments] Immediately updating comments section after NPC reply"),
                (x.style.display = "block"),
                updateCommentsSection(w, e),
                delete x.dataset.needsRefresh),
                requestSmartFeedUpdate(e.id);
        } catch (e) {
            console.error("Error generating NPC comment reply:", e);
        }
}
async function triggerCommentMentionResponse(e, t) {
    if (!e || !t)
        return void console.log("[Social] triggerCommentMentionResponse called with missing comment or post");
    const n = e.mentionedEmployees || [];
    if (0 !== n.length) {
        console.log(`[Social] Comment mentions ${n.length} NPCs - triggering responses`),
            console.log("[Social] Mentioned IDs:", n);
        for (const a of n) {
            debugLog("Social", `Processing mention for employee ID: ${a}`);
            const n = gameState.employees.find((e) => e.id === a);
            if (!n) {
                console.log(`[Social] ✗ Employee ${a} not found`);
                continue;
            }
            if ("active" !== n.employmentStatus) {
                console.log(`[Social] ✗ ${n.name} not active (status: ${n.employmentStatus})`);
                continue;
            }
            console.log(`[Social] ✓ Found active employee: ${n.name}`);
            const o = 0.9 + 0.05 * Math.random(),
                i = Math.random();
            if ((debugLog("Social", `${n.name} roll: ${i.toFixed(3)} vs ${o.toFixed(3)}`), i > o))
                debugLog("Social", `${n.name} chose not to respond (${(100 * (1 - o)).toFixed(1)}% chance)`);
            else {
                console.log(`[Social] ✓ ${n.name} will respond to mention!`);
                try {
                    const a = n.memory?.intimacyLevel || 0,
                        o = n.relationships?.player || { level: 0, type: "professional" },
                        i = n.personalityTraits || {},
                        s = i.flirty || 50,
                        r = i.confidence || 50,
                        l = i.humor || 50;
                    let c = "";
                    const d = t.comments.filter((e) => !e.replyToCommentId),
                        p = {};
                    t.comments.forEach((e) => {
                        e.replyToCommentId &&
                            (p[e.replyToCommentId] || (p[e.replyToCommentId] = []), p[e.replyToCommentId].push(e));
                    });
                    const m = (e, t = 0) => {
                        let n = `${"  ".repeat(t)}${e.authorName}: "${e.content}"\n`;
                        return (
                            (p[e.id] || []).forEach((e) => {
                                n += m(e, t + 1);
                            }),
                            n
                        );
                    };
                    let u = "";
                    u = ((e) => {
                        if (!t.comments.find((t) => t.id === e)?.replyToCommentId) {
                            const n = t.comments.find((t) => t.id === e);
                            return m(n);
                        }
                        let n = t.comments.find((t) => t.id === e);
                        for (; n && n.replyToCommentId; ) n = t.comments.find((e) => e.id === n.replyToCommentId);
                        return n ? m(n) : "";
                    })(e.id);
                    const g = d.length - (u ? 1 : 0);
                    c = `${g > 0 ? `(There are ${g} other conversation(s) on this post, but you were mentioned in THIS thread)\n\n` : ""}CONVERSATION THREAD WHERE YOU WERE MENTIONED:\n${u}`;
                    let h = "friendly";
                    const y = (e.content || "").toLowerCase();
                    (a > 60 || o.level > 60) && (h = "warm"),
                        a > 80 && (h = "flirty"),
                        (y.includes("love") || y.includes("beautiful") || y.includes("gorgeous")) &&
                            (h = s > 60 ? "flirty" : "appreciative"),
                        (y.includes("lol") || y.includes("haha") || y.includes("😂")) && (h = "playful");
                    const f = [];
                    t.comments.forEach((e) => {
                        e.content.toLowerCase();
                        /\?\s*(girl|dude|bro|man)/i.test(e.content) && f.push("question + nickname"),
                            /still\s+(love|like|here|blooming)/i.test(e.content) && f.push('"still" continuation'),
                            /you\s+(forgot|watered|planted|remember)/i.test(e.content) &&
                                f.push('direct "you" callback'),
                            /😂|😅|💀/i.test(e.content) && f.push("multiple laughing emojis"),
                            /tho|though$/i.test(e.content) && f.push('ending with "tho/though"');
                    });
                    const b =
                            f.length > 0
                                ? `\n\n⚠️ OTHER COMMENTS USED THESE PATTERNS - BE DIFFERENT:\n${[...new Set(f)].map((e) => `- ${e}`).join("\n")}\nUse a completely DIFFERENT approach/structure!`
                                : "",
                        v = getConsentPolicy();
                    let w = "";
                    w =
                        "open" === v
                            ? '🔞 WORKPLACE CULTURE: This is an open, sex-positive workplace where explicit content is NORMAL and accepted. DO NOT act shocked, suggest keeping things "PG", or moralize about sexual content. Everyone is comfortable with adult topics - respond naturally and match the energy without judgment.'
                            : "professional" === v
                              ? "WORKPLACE CULTURE: Maintain professional boundaries even when responding to explicit content."
                              : "WORKPLACE CULTURE: Relaxed office - adult content is acceptable, respond naturally based on your comfort level.";
                    const x =
                            /\b(fuck|cock|pussy|dick|cum|sex|explicit|nude|naked|ass|tits|nipple|leak|girl-cock)\b/i.test(
                                e.content + " " + t.content
                            ),
                        S = `${w}\n\nYou are ${n.name}, an employee viewing a social media post where @TheBoss (your boss) mentioned YOU in a comment.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📱 ORIGINAL POST\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nAuthor: ${t.authorName}\nType: ${t.type}\nContent: "${t.content || "(image only)"}"\n${t.imageAlt ? `Image: ${t.imageAlt}` : ""}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💬 ${c}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🎯 BOSS MENTIONED YOU: "${e.content}"\n${x ? "(Contains explicit content - respond naturally, don't act shocked)" : ""}\n\n🧠 YOUR CONTEXT:\n- Intimacy with Boss: ${a}/100\n- Relationship: ${o.type || "professional"} (${o.level || 0}/100)\n- Confidence: ${r}/100, Flirty: ${s}/100, Humor: ${l}/100\n- Tone: ${h}\n\n📋 CRITICAL RULES:\n1. Read the ENTIRE thread above to understand the conversation\n2. Your reply must be RELEVANT to what the boss said when mentioning you\n3. If they asked a question, answer it\n4. If they made a joke involving you, react to THAT specific joke\n5. If they referenced something specific about you, address that thing\n6. Stay on the same topic as the conversation thread\n7. Keep under 120 characters, use 1-2 emojis max\n${b}\n\n❌ DON'T: Change topics, make unrelated jokes, or ignore context\n✅ DO: Respond directly and coherently to what was said about you\n\nWrite your brief reply (no quotes, no meta-text):`;
                    console.log(`[Social] Calling queuedGenerateText for ${n.name}'s mention response...`),
                        console.log(`[Social] Prompt length: ${S.length} characters`);
                    const k = await queuedGenerateText(
                        S,
                        {
                            temperature: 0.8,
                            max_tokens: 50,
                            stopSequences: ["\n\n", "I would", "(", "Rating:", "**(", "---", "━━━"],
                        },
                        `Social Mention Response - ${n.name}`
                    );
                    console.log(`[Social] Raw AI response for ${n.name}: "${k}"`);
                    let T = k.trim();
                    if (
                        ((T = T.replace(/^["']|["']$/g, "")),
                        (T = T.replace(/\s*\([^)]*personality[^)]*\)\.?$/i, "")),
                        (T = T.replace(/\s*\([^)]*\d+\/100[^)]*\)\.?$/i, "")),
                        (T = T.replace(/^(I would (say|reply|respond|comment):|My response would be:)\s*/i, "")),
                        (T = T.replace(/\n\n\(Word count:.*?\)$/i, "")),
                        (T = T.replace(/\s*\*\(\d+\s*characters?\)\*\s*$/i, "")),
                        (T = T.replace(/\s*\(\d+\s*words?\)\s*$/i, "")),
                        (T = T.trim()),
                        console.log(`[Social] Sanitized response for ${n.name}: "${T}"`),
                        T && T.length > 0)
                    ) {
                        console.log(`[Social] Creating comment object for ${n.name}...`);
                        const a = createComment({
                            postId: t.id,
                            authorId: n.id,
                            authorName: n.name,
                            content: T,
                            replyToCommentId: e.id,
                        });
                        console.log("[Social] Comment object created:", a),
                            console.log(
                                `[Social] Adding comment to post (current comment count: ${t.comments.length})`
                            ),
                            t.comments.push(a),
                            console.log(`[Social] ✓ ${n.name} responded to mention: "${T}"`),
                            console.log(`[Social] New comment count: ${t.comments.length}`);
                        if (
                            /\b(check (your |my )?(dm|inbox|messages?)|sent.*(you |one |it )*(your )?way|dm(ing|'d|ed)? (you|it)|private message|slid(ing|e)? into|message(d)? you|in (your |my )?(inbox|messages|dms)|already (sent|in)|overflowing with)\b/i.test(
                                T
                            ) ||
                            /\b(deal|okay|alright|sure|fine|bet)\b.*\b(boss|you|@\w+)\b/i.test(T) ||
                            /\b(only if|but only|promise|hands-on|supervision)\b/i.test(T) ||
                            /\b(sending|upload(ing)?|post(ing)?|share|show(ing)?)\b.*\b(now|tonight|soon|later|tomorrow)\b/i.test(
                                T
                            ) ||
                            /\b(I'?ll|gonna|going to|will|can)\s+(send|share|show|post|upload|dm)\b/i.test(T) ||
                            /\b(let me|lemme)\s+(send|grab|get|find|pull up)\b/i.test(T) ||
                            /\b(coming (right |your )?(up|way)|on (its|their) way)\b/i.test(T) ||
                            /\b(give me (a )?(sec|second|minute|moment)|wait|hold on)\b.*\b(send|share|post)\b/i.test(
                                T
                            )
                        ) {
                            console.log(
                                `[Social DM] 🔔 ${n.name} mentioned sending DM in mention response - sending now!`
                            ),
                                console.log(`[Social DM] Detection matched on: "${T}"`),
                                console.log("[Social DM] ⏰ Will send DM in 2-5 seconds...");
                            const o = 2e3 + 3e3 * Math.random();
                            console.log(`[Social DM] ⏱️ Exact delay: ${Math.round(o)}ms`),
                                setTimeout(async () => {
                                    console.log(
                                        `[Social DM] ⚡ TIMEOUT TRIGGERED - Starting DM generation for ${n.name}...`
                                    );
                                    try {
                                        const o = t.content || t.caption || "",
                                            i = e.content || "",
                                            s = getPhysicalDescriptionForPrompt(n),
                                            r = n.memory?.intimacyLevel || 0,
                                            l = (() => {
                                                const a = [];
                                                let o = e;
                                                const i = new Set();
                                                for (
                                                    ;
                                                    o &&
                                                    !i.has(o.id) &&
                                                    (i.add(o.id), a.unshift(o), o.replyToCommentId);

                                                )
                                                    o = t.comments.find((e) => e.id === o.replyToCommentId);
                                                const s = t.comments.find(
                                                    (t) => t.authorId === n.id && t.replyToCommentId === e.id
                                                );
                                                return (
                                                    s && !i.has(s.id) && a.push(s),
                                                    a.map((e) => `${e.authorName}: "${e.content}"`).join("\n")
                                                );
                                            })();
                                        console.log(`[Social DM] Generating personalized DM from ${n.name}...`),
                                            console.log(
                                                `[Social DM] Relevant thread context (NOT full post): ${l.substring(0, 200)}...`
                                            );
                                        const c = `You are ${n.name} sending a private DM after commenting "${T}" in response to being mentioned.\n\nCONTEXT:\nOriginal post: "${o}"\nPlayer's comment that mentioned you: "${i}"\nYour reply: "${T}"\n\nYou mentioned sending a DM/private message. Write a short, natural DM (5-15 words) that delivers what was requested or teased.\n\nMatch your personality (intimacy: ${r}/100).\n\nWrite ONLY the message:`;
                                        let d = "";
                                        try {
                                            (d = (
                                                await queuedGenerateText(
                                                    c,
                                                    {
                                                        temperature: 0.85,
                                                        max_tokens: 30,
                                                        stopSequences: ["\n\n", "\n---", "Note:", "Context:"],
                                                    },
                                                    `Social DM Message - ${n.name}`
                                                )
                                            )
                                                .trim()
                                                .replace(/^["']|["']$/g, "")
                                                .split("\n")[0]
                                                .trim()),
                                                (!d || d.length < 3) && (d = "Here's what you asked for 😉");
                                        } catch (e) {
                                            console.warn("[Social DM] Message generation failed, using fallback"),
                                                (d = "As promised 😏");
                                        }
                                        console.log(`[Social DM] Generated message: "${d}"`);
                                        const p = `You are an expert photographer/image generator. Analyze this conversation and create a PRECISE visual description.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📱 ORIGINAL POST:\n"${o}"\n\n💬 RELEVANT CONVERSATION THREAD:\n${l}\n\n🎯 CURRENT REQUEST (MOST RECENT):\nPlayer asked: "${i}"\n${n.name} replied: "${T}"\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n👤 ${n.name}:\n${s.substring(0, 300)}\n\n📋 CRITICAL ANALYSIS TASK:\n\n⚠️ IMPORTANT: If the conversation contains MULTIPLE requests, respond ONLY to the MOST RECENT request ("${i}"). IGNORE any older/previous requests in the thread.\n\nSTEP 1 - IDENTIFY THE SPECIFIC REQUEST:\nLook for EXACT keywords in the MOST RECENT player request ("${i}"):\n- "upskirt" / "up your skirt" / "under your skirt" = LOW ANGLE shot looking UP from below showing underwear/genitals\n- "riding me" / "on top" / "straddling" = VIEW FROM BELOW showing them on top during sex\n- "from behind" / "ass" / "bent over" = REAR VIEW showing buttocks prominently\n- "pussy" / "spread" = EXPLICIT genital close-up, legs spread\n- "tits" / "breasts" / "topless" = CHEST focus, breasts exposed\n- "masturbating" / "touching yourself" = EXPLICIT sexual self-stimulation visible\n- "nude" / "naked" = FULL BODY nudity, all clothes removed\n- "POV" = First-person perspective shot\n- Custom requests (Vespa, specific position, location, etc.) = MATCH EXACTLY\n\nSTEP 2 - CAMERA ANGLE & PERSPECTIVE:\nBased on request type:\n- Upskirt = Camera positioned LOW, looking UP between legs from floor level\n- POV sex = Camera at person's eye level looking down at partner on top, or looking up if partner is standing\n- Ass/behind = Camera positioned BEHIND the subject, rear view dominant\n- General nude = Standard eye-level or slightly elevated angle\n\nSTEP 3 - WHAT'S VISIBLE:\nBe EXPLICIT about:\n- Body parts shown: "exposed breasts", "erect penis visible", "vagina visible between spread legs", "anus visible"\n- Clothing state: "completely nude", "skirt hiked up revealing", "panties pulled aside", "topless with"\n- Activity: "masturbating with hand on", "penetrating with dildo", "legs spread showing"\n- Position: "squatting over camera", "lying on back with legs up", "bent forward with ass toward camera"\n\nSTEP 4 - WRITE THE VISUAL DESCRIPTION:\nFormat: "${n.name}, [physical appearance brief], [camera angle], [what's visible explicitly], [pose/activity], [expression], [setting], [lighting]"\n\nEXAMPLES:\nRequest: "upskirt photo" → "Constance Kane, athletic woman with short blonde bob, camera positioned on floor looking up between legs, squatting over camera, lace panties pulled aside revealing erect penis and testicles, teasing smile looking down, bedroom setting, natural window light"\n\nRequest: "picture of you riding me" → "Constance Kane, platinum blonde athletic woman, POV shot from below, straddling camera with thighs spread, nude, erect penis visible between legs, hands on chest, intense eye contact, bedroom, soft ambient lighting"\n\nRequest: "send me nudes" → "Constance Kane, athletic build short blonde bob, standing pose, completely nude, medium breasts exposed with erect nipples, large flaccid penis and testicles visible, confident expression, mirror selfie, bathroom setting, bright lighting"\n\nNOW GENERATE - Match the request EXACTLY, use proper camera angle, be explicit about visible anatomy:`;
                                        let m = null,
                                            u = null;
                                        if ("function" == typeof generateImage)
                                            try {
                                                const e = await queuedGenerateText(
                                                    p,
                                                    {
                                                        temperature: 0.7,
                                                        max_tokens: 300,
                                                        stopSequences: [
                                                            "\n\n",
                                                            "\n---",
                                                            "Note:",
                                                            "Explanation:",
                                                            "Based on",
                                                            "Context:",
                                                            "[",
                                                            "Rationale:",
                                                        ],
                                                    },
                                                    `Social DM Image Prompt - ${n.name}`
                                                );
                                                console.log(
                                                    `[Social DM] 🔍 RAW AI Response (before processing):\n"${e}"`
                                                ),
                                                    console.log(
                                                        `[Social DM] 🔍 Raw response length: ${e.length} chars`
                                                    );
                                                let t = e
                                                    .trim()
                                                    .replace(/^["']|["']$/g, "")
                                                    .replace(/\[.*?\]/g, "")
                                                    .replace(
                                                        /^(Image prompt:|Here is|Here's|Based on.*?:|The prompt is:|Visual description:)\s*/i,
                                                        ""
                                                    )
                                                    .replace(
                                                        /^(the|a|an)\s+(specific\s+)?image\s+prompt.*?:\s*/i,
                                                        ""
                                                    )
                                                    .split("\n")[0]
                                                    .trim();
                                                if (
                                                    (console.log(
                                                        `[Social DM] 🔍 After initial processing:\n"${t}"`
                                                    ),
                                                    console.log(
                                                        `[Social DM] 🔍 Processed length: ${t.length} chars`
                                                    ),
                                                    /^(based on|context|according to|this shows|description)/i.test(
                                                        t
                                                    ))
                                                ) {
                                                    console.log(
                                                        "[Social DM] 🔍 Detected meta-text prefix, extracting after colon..."
                                                    );
                                                    const e = t.match(/:\s*(.+)$/);
                                                    e &&
                                                        ((t = e[1].trim()),
                                                        console.log(`[Social DM] 🔍 Extracted: "${t}"`));
                                                }
                                                t = t.replace(/[\[\]]/g, "");
                                                const a = t.length < 20,
                                                    o = /generating|requested|content|description|prompt/i.test(
                                                        t.substring(0, 50)
                                                    );
                                                if (a || o) {
                                                    console.warn(
                                                        "[Social DM] ⚠️ Using fallback - Reason: " +
                                                            (a
                                                                ? "Too short (" + t.length + " chars)"
                                                                : "Has meta-text")
                                                    ),
                                                        console.warn(`[Social DM] ⚠️ Rejected prompt was: "${t}"`);
                                                    const e = l.toLowerCase(),
                                                        o = (e + " " + i.toLowerCase()).toLowerCase();
                                                    /\b(upskirt|up.*skirt|under.*skirt|crotch.*shot)\b/i.test(o)
                                                        ? ((t = `${n.name}, ${s.substring(0, 150)}, camera positioned on floor looking up between legs from low angle, squatting over camera, skirt hiked up, panties visible or pulled aside revealing genitals, teasing expression looking down at camera, elevator or private setting, intimate lighting`),
                                                          console.log(
                                                              "[Social DM] ⚠️ Detected UPSKIRT request in fallback"
                                                          ))
                                                        : (t =
                                                              /\b(riding|vespa|bike|motorcycle)\b/i.test(o) &&
                                                              /\b(nude|naked|sex)\b/i.test(o)
                                                                  ? `${n.name} ${s.substring(0, 100)}, nude, straddling motorcycle, seductive pose, intimate photo`
                                                                  : /\b(nude|naked|tits|breasts|pussy|topless|bare)\b/i.test(
                                                                          o
                                                                      )
                                                                    ? `${n.name} ${s.substring(0, 100)}, completely nude, full body visible, seductive expression, private photo`
                                                                    : /\b(ass|bent over|from behind|rear)\b/i.test(
                                                                            o
                                                                        )
                                                                      ? `${n.name} ${s.substring(0, 100)}, bent forward, rear view, buttocks prominent, looking back over shoulder, intimate setting`
                                                                      : `${n.name} ${s.substring(0, 100)}, provocative pose, intimate setting`),
                                                        console.log(`[Social DM] ⚠️ Fallback prompt: "${t}"`);
                                                }
                                                console.log(`[Social DM] ✅ FULL Image Prompt:\n"${t}"`),
                                                    (m = await queuedGenerateImage(
                                                        applyImageStyle(t),
                                                        `Social DM image for ${n.name}`
                                                    )),
                                                    (u = t),
                                                    console.log("[Social DM] ✅ Generated image for DM");
                                            } catch (e) {
                                                console.error("[Social DM] Failed to generate image:", e);
                                            }
                                        gameState.chatHistory[n.id] || (gameState.chatHistory[n.id] = []);
                                        const g = m
                                                ? `${n.name} sent a photo: ${u ? summarizeImagePrompt(u) : "a private photo"}`
                                                : null,
                                            h = gameState.time?.currentTime || Date.now(),
                                            y = {
                                                sender: n.name,
                                                content: d,
                                                isPlayer: !1,
                                                timestamp: h,
                                                imageUrl: m,
                                                imageAlt: g,
                                                imagePrompt: u,
                                                triggerContext: {
                                                    postId: t.id,
                                                    postSnippet: (t.content || t.caption || "").substring(0, 140),
                                                    myComment: (a.content || "").substring(0, 100),
                                                    isPlayerPost: !!t.isPlayerPost,
                                                },
                                            };
                                        gameState.chatHistory[n.id].push(y),
                                            saveGame(!1),
                                            n.unreadMessages || (n.unreadMessages = 0),
                                            n.unreadMessages++,
                                            showNotification(
                                                `💬 ${n.name} sent you a private message${m ? " with a photo" : ""}!`,
                                                "info"
                                            ),
                                            console.log(
                                                `[Social DM] ✅ ${n.name} sent DM as promised!${m ? " [WITH IMAGE]" : ""}`
                                            ),
                                            console.log(
                                                `[Social DM] ✅ COMPLETE - DM successfully delivered from ${n.name}`
                                            ),
                                            (a.dmSent = !0),
                                            (a.dmMessageTimestamp = h);
                                        const f = document.querySelector(`[data-post-id="${t.id}"]`);
                                        f && updateCommentsSection(f, t);
                                    } catch (e) {
                                        console.error(
                                            `[Social DM] ❌ ERROR in setTimeout callback for ${n.name}:`,
                                            e
                                        ),
                                            console.error("[Social DM] ❌ Error stack:", e.stack);
                                    }
                                }, o),
                                console.log(`[Social DM] ✓ setTimeout scheduled successfully for ${n.name}`);
                        }
                        const o = gameState.employees.find((t) => t.id === e.authorId);
                        o && o.id !== n.id && evaluateNPCReactionToPost(n, o, t, T);
                        const i = document.querySelector(`[data-post-id="${t.id}"]`),
                            s = document.querySelector(`.post-comments[data-post-id="${t.id}"]`);
                        i &&
                            s &&
                            (console.log("[Social] Immediately updating comments section after mention response"),
                            (s.style.display = "block"),
                            updateCommentsSection(i, t),
                            delete s.dataset.needsRefresh),
                            console.log(`[Social] Requesting smart update for post ${t.id}...`),
                            requestSmartFeedUpdate(t.id),
                            setTimeout(
                                async () => {
                                    await triggerCommentChainReaction(a, t);
                                },
                                3e3 + 4e3 * Math.random()
                            );
                    } else console.log(`[Social] ✗ ${n.name} got empty response after sanitization`);
                } catch (e) {
                    console.error(`[Social] ✗ Error generating mention response for ${n.name}:`, e);
                }
                await new Promise((e) => setTimeout(e, 1e3 + 2e3 * Math.random()));
            }
        }
    } else console.log("[Social] No mentioned employees in comment");
}
async function triggerCommentChainReaction(e, t) {
    if (!e || !t) return;
    if ("player" === e.authorId) return;
    const n = gameState.employees.find((t) => t.id === e.authorId);
    if (!n) return;
    console.log(`[Chain] 🔗 Checking for chain reactions to ${n.name}'s comment...`);
    const a = gameState.employees.filter((t) => "active" === t.employmentStatus && t.id !== e.authorId);
    if (0 === a.length) return;
    let o = [];
    if (t.authorId && "player" !== t.authorId && t.authorId !== e.authorId) {
        const e = a.find((e) => e.id === t.authorId);
        e &&
            Math.random() < 0.6 &&
            (o.push({ npc: e, reason: "post author", priority: 1 }),
            console.log(`[Chain] 📝 Post author ${e.name} might respond (60% chance)`));
    }
    if (e.mentionedEmployees && e.mentionedEmployees.length > 0)
        for (const t of e.mentionedEmployees) {
            const e = a.find((e) => e.id === t);
            e &&
                Math.random() < 0.7 &&
                (o.push({ npc: e, reason: "mentioned", priority: 1 }),
                console.log(`[Chain] 👋 ${e.name} was mentioned - might respond (70% chance)`));
        }
    const i = n.relationships || {};
    for (const [e, t] of Object.entries(i)) {
        if (o.length >= 2) break;
        const i = a.find((t) => t.id === e);
        if (i && !o.find((t) => t.npc.id === e)) {
            const e = t.strength || 0;
            if ((e > 60 || e < 30) && Math.random() < 0.3) {
                const t = e > 60 ? "friend" : "rival";
                o.push({ npc: i, reason: t, priority: 2 }),
                    console.log(`[Chain] ${e > 60 ? "💕" : "😤"} ${i.name} is ${n.name}'s ${t} - might chime in`);
            }
        }
    }
    const s = a.filter((e) => !o.find((t) => t.npc.id === e.id) && (e.personality?.outgoing || 50) > 60);
    if (s.length > 0 && Math.random() < 0.15 && o.length < 2) {
        const e = s[Math.floor(Math.random() * s.length)];
        o.push({ npc: e, reason: "jumping in", priority: 3 }),
            console.log(`[Chain] 💬 ${e.name} wants to add their two cents`);
    }
    if ((o.sort((e, t) => e.priority - t.priority), (o = o.slice(0, 2)), 0 !== o.length)) {
        console.log(`[Chain] ✓ ${o.length} NPC(s) will respond`);
        for (const { npc: a, reason: i } of o) {
            try {
                console.log(`[Chain] 💬 ${a.name} responding (${i})...`);
                let o = "";
                const s = t.comments.filter((e) => !e.replyToCommentId),
                    r = {};
                t.comments.forEach((e) => {
                    e.replyToCommentId &&
                        (r[e.replyToCommentId] || (r[e.replyToCommentId] = []), r[e.replyToCommentId].push(e));
                });
                const l = (e, t = 0) => {
                    let n = `${"  ".repeat(t)}${e.authorName}: "${e.content}"\n`;
                    return (
                        (r[e.id] || []).forEach((e) => {
                            n += l(e, t + 1);
                        }),
                        n
                    );
                };
                let c = "";
                c = ((e) => {
                    if (!t.comments.find((t) => t.id === e)?.replyToCommentId) {
                        const n = t.comments.find((t) => t.id === e);
                        return l(n);
                    }
                    let n = t.comments.find((t) => t.id === e);
                    for (; n && n.replyToCommentId; ) n = t.comments.find((e) => e.id === n.replyToCommentId);
                    return n ? l(n) : "";
                })(e.id);
                const d = s.length - (c ? 1 : 0);
                o = `${d > 0 ? `(Note: There are ${d} other conversation thread(s) on this post, but you're responding to THIS specific thread)\n\n` : ""}CONVERSATION THREAD YOU'RE JOINING:\n${c}`;
                a.personality;
                const p = a.relationships?.[e.authorId] || { strength: 50, type: "colleague" };
                let m = "casual";
                const u = e.content.toLowerCase();
                p.strength > 70 && (m = "friendly"),
                    p.strength < 30 && (m = "disagreeing/snarky"),
                    "post author" === i && (m = "engaged (it's your post!)"),
                    "friend" === i && (m = "supportive of your friend"),
                    "rival" === i && (m = "challenging/competitive"),
                    (u.includes("lol") || u.includes("😂")) && (m = "playful"),
                    u.includes("?") && (m = "answering their question");
                const g = a.personality || {},
                    h = [];
                (g.humor || 50) > 65 && h.push("witty"),
                    (g.confidence || 50) > 65 && h.push("bold opinions"),
                    (g.confidence || 50) < 35 && h.push("tentative"),
                    (g.flirty || 50) > 65 && h.push("playfully teasing"),
                    (g.professional || 50) > 70 && h.push("measured");
                const y = h.length > 0 ? h.join(", ") : "balanced",
                    f = [];
                t.comments.forEach((e) => {
                    e.content.toLowerCase();
                    /\?\s*(girl|dude|bro|man)/i.test(e.content) && f.push("question + nickname"),
                        /😂|😅|💀|lol|lmao/i.test(e.content) && f.push("laughing emoji"),
                        /same|agree|this|right\?$/i.test(e.content) && f.push("agreement one-word"),
                        /check.*dm|dm.*you|inbox/i.test(e.content) && f.push("DM redirect");
                });
                const b = f.length > 0 ? `\n⚠️ DON'T USE: ${[...new Set(f)].join(", ")}` : "",
                    v = getCustomWorldContext("brief"),
                    w = `You are ${a.name} (${a.gender}, ${a.age}) replying in a workplace social media thread.\n${v ? `\n${v}\n` : ""}\n═══ THE POST ═══\n${t.authorName}: "${(t.content || "").substring(0, 150)}"\n\n═══ THE COMMENT YOU'RE REPLYING TO ═══\n${n.name}: "${e.content}"\n\n═══ YOUR RESPONSE CONTEXT ═══\nWhy you're replying: ${i}\nYour relationship with ${n.name}: ${p.strength}/100\nYour personality: ${y}\nYour tone: ${m}\n${b}\n\n═══ WRITE A REAL REPLY ═══\nRespond DIRECTLY to what ${n.name} said. Options:\n• Agree/disagree with their SPECIFIC point\n• Add your own perspective on the same topic  \n• Ask them a follow-up question\n• Make a joke that builds on what THEY said\n• Share a related thought or experience\n\n❌ DON'T: Generic praise, redirect to DMs, change the subject, ignore what they said\n✓ DO: Engage with their actual words, show your personality, be specific\n\nYour reply (10-40 words):`,
                    x = await queuedGenerateText(
                        w,
                        {
                            temperature: 0.8,
                            max_tokens: 40,
                            stopSequences: ["\n\n", "I would", "(", "Rating:", "**(", "---", "━━━"],
                        },
                        `Social Chain Comment - ${a.name}`
                    );
                console.log(`[Chain] Raw response from ${a.name}: "${x}"`);
                let S = x
                    .trim()
                    .replace(/^["']|["']$/g, "")
                    .replace(/\s*\([^)]*personality[^)]*\)\.?$/i, "")
                    .replace(/^(I would (say|reply|comment):|My comment would be:)\s*/i, "")
                    .replace(/\n\n\(Word count:.*?\)$/i, "")
                    .replace(/\s*\*\(\d+\s*characters?\)\*\s*$/i, "")
                    .replace(/\s*\(\d+\s*words?\)\s*$/i, "");
                if (((S = S.trim()), console.log(`[Chain] Sanitized: "${S}"`), S && S.length > 0)) {
                    const o = createComment({
                        postId: t.id,
                        authorId: a.id,
                        authorName: a.name,
                        content: S,
                        replyToCommentId: e.id,
                    });
                    t.comments.push(o),
                        console.log(`[Chain] ✓ ${a.name} added to thread: "${S}"`),
                        n && n.id !== a.id && evaluateNPCCommentInteraction(a, n, t, e.content, S);
                    const i = gameState.employees.find((e) => e.id === t.authorId);
                    i && i.id !== a.id && evaluateNPCReactionToPost(a, i, t, S);
                    const s = document.querySelector(`[data-post-id="${t.id}"]`),
                        r = document.querySelector(`.post-comments[data-post-id="${t.id}"]`);
                    s &&
                        r &&
                        (console.log("[Chain] Immediately updating comments section after chain reaction"),
                        (r.style.display = "block"),
                        updateCommentsSection(s, t),
                        delete r.dataset.needsRefresh),
                        requestSmartFeedUpdate(t.id);
                    const l = Math.max(0.05, 0.25 - 0.03 * t.comments.length);
                    Math.random() < l &&
                        t.comments.length < 8 &&
                        (console.log(`[Chain] 🔄 Conversation might continue (${Math.round(100 * l)}% chance)...`),
                        setTimeout(
                            async () => {
                                await triggerCommentChainReaction(o, t);
                            },
                            5e3 + 7e3 * Math.random()
                        ));
                }
            } catch (e) {
                console.error(`[Chain] ✗ Error generating chain response for ${a.name}:`, e);
            }
            await new Promise((e) => setTimeout(e, 2e3 + 3e3 * Math.random()));
        }
    } else console.log("[Chain] 🚫 No chain reactions triggered");
}
async function triggerAutomaticNPCReactions(e) {
    if (!e || !e.isPlayerPost) return;
    const t = gameState.employees.filter((e) => "active" === e.employmentStatus);
    if (0 === t.length) return;
    const n = e.referencedEmployees || [],
        a = t.filter((e) => n.includes(e.id)),
        o = t.filter((e) => !n.includes(e.id));
    console.log(`[Social] Post has ${a.length} mentions`),
        console.log("[Social] Mentioned employee IDs:", n),
        console.log(
            "[Social] Active employee IDs:",
            t.map((e) => e.id)
        ),
        a.length > 0 &&
            console.log(
                "[Social] Matched employees:",
                a.map((e) => `${e.name} (${e.id})`)
            );
    const i = 0.6 + 0.2 * Math.random(),
        s = 0.85 + 0.1 * Math.random(),
        r = [];
    for (const e of a) {
        const t = s,
            n =
                ((e.stats?.affection || 0) +
                    (e.stats?.desire || 0) +
                    (e.memory?.intimacyLevel || 0) +
                    (e.relationships?.player?.level || 0)) /
                400,
            a = Math.min(0.98, t + n);
        Math.random() < a && r.push({ emp: e, mentioned: !0 });
    }
    for (const e of o) {
        const t = i,
            n =
                ((e.stats?.affection || 0) +
                    (e.stats?.desire || 0) +
                    (e.memory?.intimacyLevel || 0) +
                    (e.relationships?.player?.level || 0)) /
                400,
            a = Math.min(0.95, t + n);
        Math.random() < a && r.push({ emp: e, mentioned: !1 });
    }
    const l = [],
        c = [];
    for (const e of r) {
        const t = e.mentioned ? 0.7 + 0.15 * Math.random() : 0.4 + 0.2 * Math.random();
        Math.random() < t ? l.push(e.emp) : c.push(e.emp);
    }
    console.log(`[Social] Player post triggering ${r.length} reactions (${l.length} comments, ${c.length} likes)`);
    for (let t = 0; t < c.length; t++) {
        const n = c[t],
            a = (1 + t) * (1e3 + 2e3 * Math.random());
        setTimeout(() => {
            e.likes.includes(n.id) ||
                (e.likes.push(n.id),
                remember(n, `I liked the boss's post: "${e.content || "image post"}"`, "interaction", 0.5),
                "social" === gameState.activeTab && renderSocialFeed());
        }, a);
    }
    const d = [
        "enthusiastic and excited - use energy words",
        "chill and laid-back - be casual",
        "flirty and teasing - be playful",
        "supportive and wholesome - be encouraging",
        "funny and sarcastic - make a joke",
        "curious and questioning - ask something",
        "dramatic and theatrical - be extra",
        "direct and to-the-point - keep it brief",
        "nostalgic or referencing shared memories",
        "competitive or challenging - playful rivalry",
    ].sort(() => Math.random() - 0.5);
    !(async function () {
        for (let t = 0; t < l.length; t++) {
            const n = l[t],
                a = d[t % d.length];
            await new Promise((e) => setTimeout(e, 2e3 + 3e3 * Math.random()));
            const o = await generateContextAwareComment(n, e, a),
                { imageUrl: i, imageAlt: s, imagePrompt: r } = await detectAndGenerateCommentImage(o, n, e),
                c = createComment({
                    postId: e.id,
                    authorId: n.id,
                    authorName: n.name,
                    content: o,
                    imageUrl: i,
                    imageAlt: s,
                    imagePrompt: r,
                });
            e.comments.push(c),
                console.log(`[Social] ${n.name} commented on player post: "${o}"${i ? " [WITH IMAGE]" : ""}`);
            if (
                /\b(check (your |my )?(dm|inbox|messages?)|sent.*(you |one |it )*(your )?way|dm(ing|'d|ed)? (you|it)|private message|slid(ing|e)? into|message(d)? you|in (your |my )?(inbox|messages|dms)|already (sent|in)|overflowing with)\b/i.test(
                    o
                ) ||
                /\b(deal|okay|alright|sure|fine|bet)\b.*\b(boss|you|@\w+)\b/i.test(o) ||
                /\b(only if|but only|promise|hands-on|supervision)\b/i.test(o) ||
                /\b(sending|upload(ing)?|post(ing)?|share|show(ing)?)\b.*\b(now|tonight|soon|later|tomorrow)\b/i.test(
                    o
                ) ||
                /\b(I'?ll|gonna|going to|will|can)\s+(send|share|show|post|upload|dm)\b/i.test(o) ||
                /\b(let me|lemme)\s+(send|grab|get|find|pull up)\b/i.test(o) ||
                /\b(coming (right |your )?(up|way)|on (its|their) way)\b/i.test(o) ||
                /\b(give me (a )?(sec|second|minute|moment)|wait|hold on)\b.*\b(send|share|post)\b/i.test(o)
            ) {
                console.log(`[Social] 🔔 ${n.name} mentioned sending DM - actually sending one now!`),
                    console.log(`[Social] Comment text: "${o}"`),
                    console.log("[Social] Detection matched - will send DM"),
                    console.log(`[Social] Post content: "${e.content || e.caption || ""}"`),
                    console.log("[Social DM] ⏰ Will send DM in 2-5 seconds...");
                const t = 2e3 + 3e3 * Math.random();
                console.log(`[Social DM] ⏱️ Exact delay: ${Math.round(t)}ms`),
                    setTimeout(async () => {
                        console.log(`[Social DM] ⚡ TIMEOUT TRIGGERED - Starting DM generation for ${n.name}...`);
                        try {
                            const t = e.content || e.caption || "",
                                a = getPhysicalDescriptionForPrompt(n),
                                i = n.memory?.intimacyLevel || 0;
                            console.log(
                                `[Social DM] Analyzing request to generate personalized DM from ${n.name}...`
                            );
                            const s = `You are ${n.name} sending a private DM after commenting on a post.\n\nCONTEXT:\nOriginal post: "${t}"\nYour comment: "${o}"\n\nYou mentioned checking DMs, so now you're sending the actual private message with the content they requested.\n\nWrite a short, flirty DM message (5-15 words) that:\n- Acknowledges what you're sending them\n- References what was specifically requested in the original post\n- Matches your personality (intimacy level: ${i}/100)\n- Is playful/teasing but natural\n\nWrite ONLY the message text:`;
                            let r = "";
                            try {
                                (r = (
                                    await queuedGenerateText(
                                        s,
                                        {
                                            temperature: 0.85,
                                            max_tokens: 30,
                                            stopSequences: ["\n\n", "\n---", "Note:", "Context:"],
                                        },
                                        `Social Post Message - ${n.name}`
                                    )
                                )
                                    .trim()
                                    .replace(/^["']|["']$/g, "")
                                    .split("\n")[0]
                                    .trim()),
                                    (!r || r.length < 3) && (r = "Here's what you asked for 😉");
                            } catch (e) {
                                console.warn("[Social DM] Message generation failed, using fallback"),
                                    (r = "As promised 😏");
                            }
                            console.log(`[Social DM] Generated message: "${r}"`);
                            const l = `Analyze this social media interaction and create an image prompt.\n\nPOST REQUEST: "${t}"\nNPC'S COMMENT: "${o}"\n\nThe NPC (${n.name}) is sending a private photo. What should it show?\n\nPERSON: ${a.substring(0, 300)}\n\nCreate a detailed, explicit image prompt showing ${n.name} doing/showing EXACTLY what was requested in the post.\n\nCRITICAL RULES:\n1. Show ONLY what was actually requested in the post - read it carefully\n2. Be EXPLICIT - describe nudity, body parts, sexual acts clearly if requested\n3. If request is explicit, image must be explicit (full nudity, visible genitals, etc.)\n4. Describe the specific activity mentioned in the post\n5. Include pose, expression, setting, lighting\n6. Include ${n.name}'s physical appearance from the description above\n\nGenerate ONLY the image prompt, no explanation:`;
                            let d = null,
                                p = null,
                                m = null;
                            if ("function" == typeof generateImage)
                                try {
                                    let e = (
                                        await queuedGenerateText(
                                            l,
                                            {
                                                temperature: 0.8,
                                                max_tokens: 200,
                                                stopSequences: [
                                                    "\n\n",
                                                    "\n---",
                                                    "Note:",
                                                    "Explanation:",
                                                    "Based on",
                                                    "Context:",
                                                ],
                                            },
                                            `Social Post Image Analysis - ${n.name}`
                                        )
                                    )
                                        .trim()
                                        .replace(/^["']|["']$/g, "")
                                        .replace(/^(Image prompt:|Here is|Here's|Based on.*?:)\s*/i, "")
                                        .replace(/^(the|a|an)\s+(specific\s+)?image\s+prompt.*?:\s*/i, "")
                                        .split("\n")[0]
                                        .trim();
                                    if (/^(based on|context|the prompt)/i.test(e)) {
                                        const t = e.match(/:\s*(.+)$/);
                                        t && (e = t[1].trim());
                                    }
                                    console.log(`[Social DM] ✅ FULL Image Prompt:\n"${e}"`),
                                        (m = e),
                                        (d = await queuedGenerateImage(
                                            applyImageStyle(e),
                                            `Social chain image for ${n.name}`
                                        )),
                                        (p = `Private photo from ${n.name}`),
                                        console.log(
                                            `[Social DM] ✅ Generated personalized image for DM from ${n.name}`
                                        );
                                } catch (e) {
                                    console.error("[Social DM] Failed to generate image:", e);
                                }
                            gameState.chatHistory[n.id] || (gameState.chatHistory[n.id] = []);
                            const u = gameState.time?.currentTime || Date.now(),
                                g = {
                                    sender: n.name,
                                    content: r,
                                    isPlayer: !1,
                                    timestamp: u,
                                    imageUrl: d,
                                    imageAlt: d
                                        ? `${n.name} sent a photo: ${m ? summarizeImagePrompt(m) : "a private photo"}`
                                        : p,
                                    imagePrompt: m,
                                    triggerContext: {
                                        postId: e.id,
                                        postSnippet: (e.content || "").substring(0, 140),
                                        myComment: (o || "").substring(0, 100),
                                        isPlayerPost: !!e.isPlayerPost,
                                    },
                                };
                            gameState.chatHistory[n.id].push(g),
                                saveGame(!1),
                                n.unreadMessages || (n.unreadMessages = 0),
                                n.unreadMessages++,
                                showNotification(
                                    `💬 ${n.name} sent you a private message${d ? " with a photo" : ""}!`,
                                    "info"
                                ),
                                console.log(
                                    `[Social DM] ✅ ${n.name} sent actual DM as promised in comment!${d ? " [WITH IMAGE]" : ""}`
                                ),
                                console.log(`[Social DM] ✅ COMPLETE - DM successfully delivered from ${n.name}`),
                                (c.dmSent = !0),
                                (c.dmMessageTimestamp = u);
                            const h = document.querySelector(`[data-post-id="${e.id}"]`);
                            h && updateCommentsSection(h, e);
                        } catch (e) {
                            console.error(`[Social DM] ❌ ERROR in setTimeout callback for ${n.name}:`, e),
                                console.error("[Social DM] ❌ Error stack:", e.stack);
                        }
                    }, t),
                    console.log(`[Social DM] ✓ setTimeout scheduled successfully for ${n.name}`);
            }
            !/\b(dm|inbox|message|private|check your)\b/i.test(o) &&
                /\b(just posted|posted (it|mine|this)|already posted|made a post|shared (it|this)|uploaded (it|this))\b/i.test(
                    o
                ) &&
                (console.log(`[Social] 📝 ${n.name} claims to have made a new post - creating it now!`),
                console.log(`[Social] Comment text: "${o}"`),
                setTimeout(
                    async () => {
                        try {
                            const t = ((e.content || e.caption || "") + " " + o).toLowerCase(),
                                a =
                                    /\b(cat|kitty|kitten|pussy|feline)\b/i.test(t) &&
                                    !/\b(nude|naked|explicit|spread|wet)\b/i.test(t),
                                i = /\b(dog|pet|puppy|animal)\b/i.test(t),
                                s = /\b(nude|naked|bare|nothing on)\b/i.test(t),
                                r = /\b(sexy|hot|spicy|sultry|juicy|treat|peek)\b/i.test(t) && !a,
                                l = /\b(selfie|pic|photo)\b/i.test(t);
                            let c = "selfie",
                                d = "",
                                p = "";
                            a
                                ? ((c = "selfie"),
                                  (d = [
                                      "Here she is! 🐱",
                                      "My beautiful kitty 😻",
                                      "She's camera-ready 📸",
                                      "Cat tax paid! 🐈",
                                  ][Math.floor(4 * Math.random())]),
                                  (p = "Cute cat photo, adorable kitten, wholesome pet photography"))
                                : i
                                  ? ((c = "selfie"),
                                    (d = ["Doggo selfie time! 🐕", "Best friend photo 🐾", "Puppy love 💕"][
                                        Math.floor(3 * Math.random())
                                    ]),
                                    (p = "Cute dog photo, adorable puppy, wholesome pet photography"))
                                  : s
                                    ? ((c = "nude"),
                                      (d = ["As requested 😏", "Just for you 💋", "Hope you enjoy 🔥"][
                                          Math.floor(3 * Math.random())
                                      ]),
                                      (p = `Artistic nude photograph of ${n.name}, ${getPhysicalDescriptionForPrompt(n, { nude: !0 })}, tasteful lighting, beautiful composition, intimate`))
                                    : r
                                      ? ((c = "thirst_trap"),
                                        (d = ["Feeling myself 😘", "Here's that peek 👀", "Enjoy the view 🔥"][
                                            Math.floor(3 * Math.random())
                                        ]),
                                        (p = `Sexy photo of ${n.name}, ${getPhysicalDescriptionForPrompt(n)}, alluring pose, confident expression, sultry`))
                                      : l &&
                                        ((c = "selfie"),
                                        (d = ["Fresh selfie 📸", "How do I look? 😊", "Felt cute 💕"][
                                            Math.floor(3 * Math.random())
                                        ]),
                                        (p = `Selfie photo of ${n.name}, ${getPhysicalDescriptionForPrompt(n)}, friendly smile, natural lighting`));
                            let m = null;
                            if ("function" == typeof generateImage)
                                try {
                                    (m = await queuedGenerateImage(
                                        applyImageStyle(p),
                                        `Social follow-up post image for ${n.name}`
                                    )),
                                        console.log(
                                            `[Social Follow-up Post] Generated ${c} image for ${n.name}'s post`
                                        );
                                } catch (e) {
                                    console.warn("[Social Follow-up Post] Failed to generate image:", e);
                                }
                            const u = createPost({
                                authorId: n.id,
                                authorName: n.name,
                                content: d,
                                caption: d,
                                type: m ? c : "text",
                                imageUrl: m,
                                imagePrompt: p,
                                timestamp: gameState.time?.currentTime || Date.now(),
                            });
                            gameState.socialNetwork.posts.unshift(u),
                                remember(
                                    n,
                                    `I posted on social media: "${d}"${m ? " with image" : ""}`,
                                    "social",
                                    0.6
                                ),
                                "social" === gameState.activeTab && renderSocialFeed(),
                                console.log(
                                    `[Social Follow-up Post] ✅ ${n.name} actually posted as claimed: "${d}"${m ? " [WITH IMAGE]" : ""}`
                                ),
                                showNotification(`📱 ${n.name} just posted${m ? " a new photo" : ""}!`, "info");
                        } catch (e) {
                            console.error(`[Social Follow-up Post] Error creating post for ${n.name}:`, e);
                        }
                    },
                    3e3 + 5e3 * Math.random()
                )),
                e.comments.length >= 3 &&
                    Math.random() < 0.1 &&
                    (console.log(`[Social] 🔥 ${n.name}'s comment sparked more discussion!`),
                    setTimeout(
                        async () => {
                            await triggerAdditionalNPCComments(e);
                        },
                        5e3 + 6e3 * Math.random()
                    )),
                n.stats && (n.stats.affection = Math.min(100, (n.stats.affection || 0) + 1)),
                remember(n, `I commented on boss's post: "${o}"`, "interaction", 0.8),
                "social" === gameState.activeTab && renderSocialFeed();
        }
    })();
}
async function triggerAdditionalNPCComments(e) {
    const t = gameState.employees.filter((e) => "active" === e.employmentStatus);
    if (0 === t.length) return;
    const n = new Set(e.comments.filter((e) => "player" !== e.authorId).map((e) => e.authorId)),
        a = t.filter((e) => !n.has(e.id));
    if (0 === a.length) return;
    console.log(`[Social] 🔄 Building conversation on post ${e.id} (${e.comments.length} comments)`);
    let o = 0;
    const i = Math.min(3, Math.ceil(a.length / 3)),
        s = a
            .map((e) => {
                let t = 30 * Math.random();
                const n = e.personality || {};
                (t += 0.3 * (n.outgoing || 50)), (t += 0.2 * (n.confidence || 50));
                const a = e.stats?.affection || 50;
                return (a > 70 || a < 30) && (t += 20), { npc: e, score: t };
            })
            .sort((e, t) => t.score - e.score);
    for (const { npc: t } of s) {
        if (o >= i) break;
        let n = 0.35 + 0.005 * (((t.personality || {}).outgoing || 50) - 50);
        if (Math.random() < n) {
            console.log(`[Social] ${t.name} joining active conversation (${Math.round(100 * n)}% chance)`);
            try {
                const n = await generateContextAwareComment(t, e);
                if (n) {
                    const {
                            imageUrl: a,
                            imageAlt: i,
                            imagePrompt: s,
                        } = await detectAndGenerateCommentImage(n, t, e),
                        r = createComment({
                            postId: e.id,
                            authorId: t.id,
                            authorName: t.name,
                            content: n,
                            imageUrl: a,
                            imageAlt: i,
                            imagePrompt: s,
                        });
                    e.comments.push(r),
                        o++,
                        console.log(
                            `[Social] ✓ ${t.name} added to conversation: "${n}"${a ? " [WITH IMAGE]" : ""}`
                        ),
                        t.stats && (t.stats.affection = Math.min(100, (t.stats.affection || 0) + 1)),
                        remember(
                            t,
                            `I joined a conversation on ${e.isPlayerPost ? "boss's" : "a coworker's"} post: "${n}"`,
                            "interaction",
                            0.7
                        ),
                        requestSmartFeedUpdate(e.id);
                }
            } catch (e) {
                console.error(`Error generating reinvigoration comment from ${t.name}:`, e);
            }
        }
    }
    o > 0 && console.log(`[Social] 🎉 Added ${o} new voice(s) to the conversation`);
}
async function generateContextAwareComment(e, t, n = null) {
    const a = e.stats?.affection || 0,
        o = (e.stats, e.memory?.intimacyLevel || 0),
        i = e.personality || {},
        s =
            o > 70
                ? "very intimate"
                : o > 40
                  ? "romantically involved"
                  : a > 70
                    ? "very close friends"
                    : a > 40
                      ? "friendly"
                      : a > 20
                        ? "cordial"
                        : "professional",
        r = t.content || "",
        l = !!t.imageUrl,
        c = t.imageAlt || "",
        isPlayerAuthor = t.isPlayerPost || "player" === t.authorId,
        postAuthorNpc = isPlayerAuthor ? null : gameState.employees.find((n) => n.id === t.authorId),
        authorLabel = isPlayerAuthor
            ? "your boss (@TheBoss)"
            : postAuthorNpc?.name || t.authorName || "a coworker",
        posterRel = isPlayerAuthor ? s : e.relationships?.[t.authorId]?.type || "coworker",
        d =
            (t.explicitLevel,
            `flirty: ${i.flirty || 50}/100, outgoing: ${i.outgoing || 50}/100, confidence: ${i.confidence || 50}/100, professional: ${i.professional || 50}/100`);
    let p = [];
    const m = gameState.employees.filter(
        (t) => "active" === t.employmentStatus && t.id !== e.id && "player" !== t.id
    );
    if (m.length > 0) {
        const n = e.relationships || {},
            a = m
                .filter((e) => {
                    const t = n[e.id];
                    return t && t.strength > 60;
                })
                .slice(0, 2),
            o = m.find((e) => e.id === t.authorId);
        if (
            (o && !a.find((e) => e.id === o.id) && p.push({ employee: o, reason: "post author" }),
            a.forEach((e) => p.push({ employee: e, reason: "friend" })),
            p.length < 2)
        ) {
            m.filter((e) => !p.find((t) => t.employee.id === e.id))
                .sort(() => Math.random() - 0.5)
                .slice(0, 2 - p.length)
                .forEach((e) => p.push({ employee: e, reason: "coworker" }));
        }
    }
    const u = e.race && "human" !== e.race ? ` (${e.race})` : "",
        g = e.gender
            ? `, a ${e.age || "young"}-year-old ${"male" === e.gender ? "man" : "transMan" === e.gender ? "trans man" : "transWoman" === e.gender ? "trans woman" : (e.gender, "woman")}${u}`
            : "",
        h = /\b(send|post|share|show|upload|pic|photo|image|selfie)\b/i.test(r),
        y = /\b(nude|naked|tits|boobs|breasts|pussy|ass|masturbat|explicit|lewd|sex|dick|cock|cum)\b/i.test(r);
    /\b(cat|kitty|dog|pet|selfie)\b/i.test(r);
    let f = "";
    if (t.comments && t.comments.length > 0) {
        const e = t.comments
            .slice(-6)
            .filter((e) => e.content && e.content.length > 0)
            .map(
                (e) =>
                    `${"player" === e.authorId ? "Boss" : gameState.employees.find((t) => t.id === e.authorId)?.name || "Someone"}: "${e.content.substring(0, 50)}"`
            );
        e.length > 0 &&
            (f = `\n\n═══ OTHER COMMENTS on this post (these are OTHER COMMENTERS — none of them is the poster) ═══\n${e.join("\n")}\n\n→ The poster is ${authorLabel} — do NOT confuse commenters' names with the poster\n→ Add a NEW perspective, don't repeat what's been said\n→ You CAN respond to another comment if you have something specific to add\n→ Don't use generic phrases others already used`);
    }
    let b = "";
    n && (b = `\n\n🎯 YOUR UNIQUE ANGLE: Be ${n}. Take this specific approach - don't overlap with others!`);
    const v = [];
    i.flirty > 65 && v.push("flirtatious/teasing"),
        i.humor > 65 && v.push("make a joke or witty observation"),
        i.professional > 70 && v.push("thoughtful/measured response"),
        i.confidence > 70 && v.push("bold opinion"),
        i.confidence < 35 && v.push("shy/hesitant but genuine"),
        i.outgoing > 70 && v.push("enthusiastic and chatty"),
        i.outgoing < 35 && v.push("brief but meaningful"),
        a > 75 && v.push("supportive/warm"),
        a < 25 && v.push("skeptical/snarky");
    const w = v.length > 0 ? v[Math.floor(Math.random() * v.length)] : "casual observation",
        x = getCustomWorldContext("brief"),
        S = `You are ${e.name}${g} commenting on a post by ${authorLabel} on the office's personal social platform.\n${x ? `\n${x}\n` : ""}\nPOST by ${authorLabel}: "${r.substring(0, 200)}"\n${l ? `[Post includes an image: ${c}]` : ""}\n\n═══ YOUR CHARACTER ═══\nPersonality: ${d}\nThe poster: ${authorLabel}${isPlayerAuthor ? ' — your boss. If you address them, say "boss" or @TheBoss. NEVER address the poster by a coworker\'s name.' : ""}\nRelationship with poster: ${posterRel}\nYour angle for THIS comment: ${w}${buildSocialContinuityBlock(e, !0)}\n\n═══ COMMENT STYLE GUIDE ═══\nWrite like a REAL PERSON having a genuine reaction:\n• Share your actual OPINION or THOUGHT about the post content\n• Ask a follow-up QUESTION if curious about something\n• Make a RELEVANT joke if you're funny\n• Share a brief RELATED experience ("This reminds me of...")\n• Agree or DISAGREE with something specific\n• React to the IMAGE if there is one - describe what you notice\n\n═══ ABSOLUTELY DO NOT ═══\n❌ Generic praise ("Love this!", "Amazing!", "So good!")\n❌ Hype phrases ("Main character energy", "The confidence!", "I'm here for it")\n❌ Empty reactions (just emojis with no substance)\n❌ Meta-commentary about your personality\n❌ Tag or mention other coworkers (@name, "back me up", "tell them")\n❌ Ask others to support/agree with you ("Am I right?", "@[name] back me up")\n${f}${b}\n\n${h ? `\n═══ IMAGE REQUEST CONTEXT ═══\nThe post is SPECIFICALLY asking people to share images/photos. You MUST participate!\n\n${y ? `This is explicit/NSFW content. Your response depends on your relationship:\n${o > 60 ? '→ You\'re very comfortable with the poster. ENTHUSIASTICALLY share! Use a phrase like "Here\'s mine! 📸", "Posted! 😏", "Sharing mine now 🔥", or "Here\'s my entry!" — be playful and confident.' : o > 30 ? '→ You know the poster decently. You\'ll participate but maybe dial back the explicitness — share a teasing/suggestive version. Use phrases like "Here\'s my take 😏", "Posted mine! Not QUITE what you asked for 😉", "Sharing! Kept it a little classy 💋"' : a > 50 ? '→ You\'re friendly but not intimate. Still participate! Share something cheeky/suggestive but not explicit. Use "Here\'s my version 😄", "Posted! Kept it PG-13 😉", "My entry! I kept some mystery 😏"' : a < 25 ? '→ You\'re not close to the poster. STILL PARTICIPATE but with sarcastic or malicious compliance! Examples: "Here, you asked for it 🙄📸" (share something deliberately bad/unflattering/ironic), "Posted. Happy now? 😒", "Fine, here\'s your \'content\' 🙃" (share something technically matching but humorous/sarcastic), "My \'best\' entry 😏" (deliberately mocking compliance)' : '→ Participate with mild enthusiasm or a playful deflection that still includes a photo. "Here\'s something 📸", "Posted mine!", "My submission 😊"'}\n→ ALWAYS use image-claiming language (posted, here's, sharing, uploaded, my pic/photo/entry, etc.)\n→ DO NOT redirect to DMs for image request posts — post INLINE` : 'This is casual/SFW content (pets, selfies, etc).\n→ ALWAYS participate with an image claim! Use phrases like "Here\'s my [pet/selfie/photo]! 📸", "Posted mine!", "My entry! [brief comment]"\n→ Everyone should share — this is fun workplace engagement'}\n\nCRITICAL: You are responding to an IMAGE REQUEST. Your comment MUST contain a claim that you're sharing/posting/uploading an image. Use one of these phrases naturally:\n• "Here's mine!", "Here's my [thing]!", "Posted! [reaction]"\n• "Sharing mine now 📸", "My entry!", "Uploaded!", "Here you go!"\n• Do NOT just react with text — you ARE sharing a photo` : "\n❌ Redirect to DMs unless explicitly asked for something private"}\n\n\n\nWrite a 5-25 word comment with genuine personality:`;
    try {
        let n = (
            await queuedGenerateText(
                S,
                {
                    temperature: 0.9,
                    top_p: 0.95,
                    max_tokens: 50,
                    stopSequences: [
                        "\n\n",
                        "\n---",
                        "Personality",
                        "Comment:",
                        "Based on",
                        "Analysis:",
                        "{SEEDS",
                        "{BAN",
                        "{BOOST",
                        "Word count",
                        "═══",
                    ],
                },
                `Generating social post comment for ${e.name}`
            )
        ).trim();
        (n = n.split("\n")[0].trim()),
            (n = n.replace(/^["']|["']$/g, "")),
            (n = n.replace(/\{[A-Z_]+:[^}]*\}/g, ""));
        if (
            ((n = n.replace(/@[\w]+\s+(back me up|tell them|right\?|agree|help me out)/gi, "")),
            (n = n.replace(
                /\b(back me up|back us up|right[\s,]+@?\w+\??|tell them|am i right\??)\s*(here)?/gi,
                ""
            )),
            (n = h
                ? n.replace(/^(Based on |My comment is:? |I would (say|comment|reply):? |Comment:? )/i, "")
                : n.replace(
                      /^(Here's |Based on |My comment is:? |I would (say|comment|reply):? |Comment:? )/i,
                      ""
                  )),
            (n = n.replace(
                /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:'s\s+(?:comment|reply)?|:\s*["']?|\s+(?:comment|reply)s?:?\s*["']?)/i,
                ""
            )),
            (n = n.replace(/^\*.*?\*\s*/g, "")),
            (n = n.replace(
                /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(raised|lifted|smiled|grinned|chuckled|laughed|sighed|looked|glanced|scanned|typed|tapped|smirked|winked).*?\.\s*/i,
                ""
            )),
            (n = n.replace(/^The .*? (lit up|flashes|shows|displays):?\s*["']?/i, "")),
            h ||
                ((n = n.replace(/\b(already|just) (sent|DM'?d|shared|posted|slid into)\b/gi, "Sending to")),
                (n = n.replace(/\bslid into (your|my) (dms?|inbox)\b/gi, "Check your DMs"))),
            /^(\*|The screen |The phone |Based on|Here's my comment|Boss said|Personality traits|Brainstorm|\([A-Z]|[A-Z][a-z]+\s+[A-Z][a-z]+'s comment)/i.test(
                n
            ))
        ) {
            if ((console.warn(`[Context Comment] Meta-text/narration detected: "${n.substring(0, 60)}"`), h)) {
                const e = [
                    "Here's mine! 🐱",
                    "Posted! 📸",
                    "Hope this helps! 💕",
                    "My kitty! 😻",
                    "Sharing now! ✨",
                ];
                return e[Math.floor(Math.random() * e.length)];
            }
            return generateTemplateComment(e, t);
        }
        return !n || n.length < 3 ? generateTemplateComment(e, t) : n;
    } catch (n) {
        return console.error("AI comment generation failed:", n), generateTemplateComment(e, t);
    }
}
function generateTemplateComment(e, t) {
    const n = e.stats?.affection || 0,
        a = e.stats?.desire || 0,
        o = e.memory?.intimacyLevel || 0,
        i = e.personality || {},
        s = t.explicitLevel >= 2,
        r = (t.imageUrl, (t.content || "").toLowerCase()),
        l = (i.humor || 50) > 60,
        c = (i.confidence || 50) > 60,
        d = (i.confidence || 50) < 40,
        p = (i.flirty || 50) > 60,
        m = (i.outgoing || 50) > 60,
        u = (i.professional || 50) > 65,
        g = /\b(cat|dog|pet|kitty|puppy|bird|fish)\b/i.test(r),
        h = /\b(food|eat|lunch|dinner|cook|bake|recipe)\b/i.test(r),
        y = /\b(work|project|meeting|deadline|office)\b/i.test(r),
        f = r.includes("?");
    /\b(weekend|saturday|sunday|friday night)\b/i.test(r), /\b(travel|trip|vacation|flight|hotel)\b/i.test(r);
    if (g)
        return l
            ? [
                  'That face says "I know exactly what I did" 😂',
                  "Plotting world domination, clearly",
                  "The audacity of this creature",
              ][Math.floor(3 * Math.random())]
            : m
              ? ["OH MY GOD I NEED TO PET THEM", "Can I come over just to meet them??", "This made my whole day!!"][
                    Math.floor(3 * Math.random())
                ]
              : d
                ? ["So cute...", "What a sweetheart", "🥺"][Math.floor(3 * Math.random())]
                : ["What breed is that?", "How old?", "Those eyes! 💕", "Precious baby"][
                      Math.floor(4 * Math.random())
                  ];
    if (h)
        return l
            ? [
                  "I'm sending you my address for delivery",
                  "This is food harassment and I'm reporting it",
                  "My sad desk salad is crying rn",
              ][Math.floor(3 * Math.random())]
            : m
              ? [
                    "WHERE did you get this?? I need it immediately",
                    "Okay but the presentation though! 👨‍🍳",
                    "We need a group lunch trip!!",
                ][Math.floor(3 * Math.random())]
              : u
                ? ["That looks well-prepared", "Nice plating", "Where is this restaurant?"][
                      Math.floor(3 * Math.random())
                  ]
                : ["Looks good! Recipe?", "Making me hungry...", "I should try cooking more"][
                      Math.floor(3 * Math.random())
                  ];
    if (y)
        return l
            ? [
                  "Thoughts and prayers to your sanity",
                  "The spreadsheets are spreading",
                  "Work: the thing we do between snacks",
              ][Math.floor(3 * Math.random())]
            : u
              ? ["Let me know if you need a second pair of eyes", "Happy to help review", "Good progress on that"][
                    Math.floor(3 * Math.random())
                ]
              : n > 60
                ? ["You've got this!", "Don't forget to take breaks", "Proud of how hard you work"][
                      Math.floor(3 * Math.random())
                  ]
                : ["Hang in there", "Almost Friday...", "Coffee helps"][Math.floor(3 * Math.random())];
    if (f)
        return c
            ? ["I'd say go for it", "Here's my take...", "Honestly? Yes."][Math.floor(3 * Math.random())]
            : d
              ? ["Not sure but interested to hear others", "Good question actually", "Hmm..."][
                    Math.floor(3 * Math.random())
                ]
              : l
                ? [
                      "The answer is always tacos",
                      'My magic 8-ball says "ask again later"',
                      "Bold of you to assume I know things",
                  ][Math.floor(3 * Math.random())]
                : ["Depends on the situation", "What does everyone else think?", "I've wondered this too"][
                      Math.floor(3 * Math.random())
                  ];
    if (o > 60 && s && p) {
        const e = ["😳", "Well then...", "You're trouble", "I—", "Saving this"];
        return e[Math.floor(Math.random() * e.length)];
    }
    if (o > 50) {
        const e = ["😊", "This made me smile", "Of course you did", "Classic you", "Why am I not surprised"];
        return e[Math.floor(Math.random() * e.length)];
    }
    if (n > 60 && i.flirty > 60 && a > 40) {
        const e = ["Noted 👀", "Interesting...", "Okay okay 😏", "I see you", "Well well"];
        return e[Math.floor(Math.random() * e.length)];
    }
    if (n > 50) {
        const e = ["Nice!", "Ha! 😄", "This is great", "Love it", "👍"];
        return e[Math.floor(Math.random() * e.length)];
    }
    if (n > 30) {
        const e = ["Cool!", "Nice one", "😊", "Haha", "👌"];
        return e[Math.floor(Math.random() * e.length)];
    }
    const b = ["👍", "Nice", "😊", "Cool", "✨"];
    return b[Math.floor(Math.random() * b.length)];
}
async function checkForProactiveMessages() {
    if (!gameState.lastProactiveMessageCheck) return void (gameState.lastProactiveMessageCheck = Date.now());
    if (Date.now() - gameState.lastProactiveMessageCheck < 6e4) return;
    gameState.lastProactiveMessageCheck = Date.now();
    const e = gameState.employees.filter((e) => "active" === e.employmentStatus);
    if (0 === e.length) return;
    let t = 0;
    const n = Math.random() > 0.7 ? 2 : 1;
    for (const a of e) {
        if (t >= n) break;
        const e = await evaluateProactiveMessageTriggers(a);
        e && (await sendProactiveNPCMessage(a, e.reason, e.context), t++);
    }
}
async function evaluateProactiveMessageTriggers(e) {
    if (
        (e.proactiveMessages ||
            (e.proactiveMessages = {
                lastSentTime: 0,
                lastSentRealTime: 0,
                consecutiveUnreplied: 0,
                lastMoneyRequestTime: 0,
                hasUnrepliedMoneyRequest: !1,
            }),
        aiOptimization.blockedProactiveMessages.has(e.id))
    )
        return !1;
    if (e.npcStatus) {
        if (["sleeping", "vampire_rest"].includes(e.npcStatus.current)) return !1;
        if ("on_date" === e.npcStatus.current) return !1;
        if ("in_meeting" === e.npcStatus.current) return !1;
        if ("traveling" === e.npcStatus.current && e.npcStatus.responsiveness < 30) return !1;
        if (e.npcStatus.responsiveness < 15) return !1;
    }
    const t = Date.now(),
        n = gameState.time?.currentTime || t,
        a = gameState.chatHistory[e.id] || [],
        o = a[a.length - 1],
        i = o?.timestamp || 0,
        s = (t - i) / 36e5;
    if ((t - i) / 6e4 < 60) return aiOptimization.blockedProactiveMessages.add(e.id), !1;
    const r = [...a].reverse().find((e) => e.isPlayer);
    if ((r?.timestamp ? t - r.timestamp : 1 / 0) / 6e4 < 120)
        return aiOptimization.blockedProactiveMessages.add(e.id), !1;
    let l = 0;
    for (let e = a.length - 1; e >= 0 && !a[e].isPlayer; e--) a[e].isPlayer || l++;
    if (((e.proactiveMessages.consecutiveUnreplied = l), e.proactiveMessages.consecutiveUnreplied >= 3)) return !1;
    if ((n - e.proactiveMessages.lastSentTime) / 36e5 < 24) return !1;
    if ((t - e.proactiveMessages.lastSentRealTime) / 6e4 < 30) return !1;
    const c = e.relationships?.player || { level: 0, type: "professional" },
        d = e.intimacy || 0,
        p = e.stats?.affection || 0,
        m = e.stats?.trust || 0,
        u = 0.05 + (c.level / 100) * 0.15 + (d / 100) * 0.2 + Math.min(s / 24, 0.1);
    if (Math.random() > u) return !1;
    const g = [],
        h = (gameState.chatHistory[e.id] || []).length,
        y = h > 20,
        f = h > 10,
        b = y ? 1 : f ? 2 : 3;
    if (
        (g.push({ reason: "work_question", weight: b, context: "work" }),
        g.push({ reason: "work_update", weight: b, context: "work" }),
        p > 30)
    ) {
        const e = y ? 5 : f ? 3 : 2;
        g.push({ reason: "casual_chat", weight: e, context: "casual" });
    }
    if (p > 50) {
        const e = y ? 4 : 2;
        g.push({ reason: "sharing_news", weight: e, context: "personal" });
    }
    if (m > 60) {
        const e = y ? 3 : 1;
        g.push({ reason: "asking_advice", weight: e, context: "personal" });
    }
    const v = gameState.socialNetwork.posts
        .filter((n) => n.authorId === e.id && t - n.timestamp < 864e5)
        .slice(0, 3);
    v.length > 0 && g.push({ reason: "post_followup", weight: 2, context: { type: "social", post: v[0] } }),
        d > 40 && g.push({ reason: "flirty_message", weight: 1, context: "flirty" }),
        d > 70 && g.push({ reason: "booty_call", weight: 1, context: "intimate" });
    !((n - (e.lastUnpromptedImageTime || 0)) / 36e5 < 24) &&
        y &&
        d > 50 &&
        (p > 40 && g.push({ reason: "unprompted_selfie", weight: 1, context: "image_casual" }),
        d > 60 && p > 50 && g.push({ reason: "unprompted_flirty_pic", weight: 1, context: "image_flirty" }),
        d > 75 && p > 60 && g.push({ reason: "unprompted_lewd_pic", weight: 1, context: "image_lewd" }),
        d > 85 && p > 70 && g.push({ reason: "unprompted_nude_pic", weight: 1, context: "image_nude" }));
    const w = (n - e.proactiveMessages.lastMoneyRequestTime) / 36e5 / 24;
    e.bankBalance || (e.bankBalance = 0), e.spendingRate || (e.spendingRate = 50 + 150 * Math.random());
    const x = e.bankBalance < 14 * e.spendingRate,
        S = e.bankBalance < 7 * e.spendingRate,
        k = S ? 3 : 7,
        T = h >= 30;
    if (!e.proactiveMessages.hasUnrepliedMoneyRequest && w >= k && T) {
        let e = 2;
        S ? (e = 8) : x && (e = 5),
            p > 50 && m > 50
                ? g.push({ reason: "money_request", weight: e, context: "money" })
                : p > 40 && S && g.push({ reason: "money_request", weight: Math.max(2, e - 3), context: "money" });
    }
    const C = (Array.isArray(gameState.companyEvents) ? gameState.companyEvents : [])
        .filter((n) => n && n.involvedEmployees?.includes(e.id) && t - n.timestamp < 864e5)
        .slice(0, 2);
    C.length > 0 && g.push({ reason: "event_reaction", weight: 2, context: { type: "event", event: C[0] } });
    const E = g.reduce((e, t) => e + t.weight, 0);
    let $ = Math.random() * E;
    for (const e of g) if ((($ -= e.weight), $ <= 0)) return e;
    return g[0];
}
async function sendProactiveNPCMessage(e, t, n) {
    try {
        if ("money_request" === t) {
            const t = e.spendingRate || calculateScaledSpendingRate(),
                n = e.bankBalance || 0,
                a = (Date.now(), e.lastMoneyRequest, n < 7 * t),
                o = n < 2 * t;
            let i;
            if (o) {
                const e = 1 + Math.random();
                i = Math.floor(7 * t * e);
            } else if (a) i = Math.floor(7 * t);
            else {
                const e = Math.log10(gameState.cash + 1e3),
                    t = Math.pow(10, e - 2),
                    n = 0.5 + 2 * Math.random();
                i = Math.floor(t * n);
            }
            const s = Math.max(500, Math.min(i, 0.15 * gameState.cash)),
                r = 50 * Math.round(s / 50);
            let l;
            l = o ? "desperate_need" : a ? "financial_trouble" : n > 30 * t ? "luxury_want" : "specific_purchase";
            const c = e.personality || {},
                d = e.stats?.affection || 0,
                p = e.stats?.desire || 0,
                m = e.stats?.trust || 50,
                u = e.stats?.obedience || 50,
                g = `${e.name} wants to ask their boss for $${formatCash(r)}.\n\nPERSONALITY & STATS:\n- Personality: Confidence ${c.confidence || 50}/100, Flirty ${c.flirty || 50}/100, Professional ${c.professional || 50}/100\n- Relationship: Affection ${d}/100, Desire ${p}/100, Trust ${m}/100, Obedience ${u}/100\n\nFINANCIAL CONTEXT:\n- Current balance: $${formatCash(n)}\n- Daily spending: $${formatCash(t)}/day\n- Category: ${l}\n${o ? "- STATUS: Nearly broke! Urgent need." : ""}\n${a ? "- STATUS: Running low, getting worried." : ""}\n\nRequest categories guide:\n- desperate_need: Bills overdue, can't afford rent/food, emergency, very apologetic\n- financial_trouble: Running low, stressed about money, expenses piling up\n- specific_purchase: Want something specific (gadget, clothes, experience, date, hobby item)\n- luxury_want: Not needed but would love to have, indulgent, aspirational\n\nWrite a natural, in-character message asking for this money (2-3 sentences). Be specific with details (brand names, stores, items, real reasons). Match their personality and relationship level.\n\nEXAMPLES:\n- Desperate: "Boss... I'm so sorry but I'm really struggling. Rent is due and I'm short $X. Could you help me out? 🥺"\n- Financial trouble: "Hey, so my car died and I need $X to fix it. Kind of in a bind here... any chance you could help? 😅"\n- Specific purchase: "OMG there's this amazing [item] at [store] for $X and I NEED it... could you maybe help? 💕"\n- Luxury want: "Saw the cutest designer bag for $X... I know it's indulgent but pretty please? I'll make it worth your while 😘"\n\n${e.name}'s message:`;
            try {
                const _rawMoney = await queuedGenerateText(
                    g,
                    { temperature: 0.9, max_tokens: 100, stopSequences: ["\n\n", "Note:", "---", "Amount:"] },
                    `Generating money request message for ${e.name}`
                );
                console.log(
                    `[Proactive DM] Money-request raw (${(_rawMoney || "").length} chars) from ${e.name}: ${JSON.stringify(_rawMoney)}`
                );
                const t = sanitizeNpcResponse(_rawMoney, 3);
                console.log(
                    `[Proactive DM] Money-request after sanitize (${(t || "").length} chars): ${JSON.stringify(t)}`
                );
                gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
                const n = gameState.time?.currentTime || Date.now(),
                    a = gameState.chatHistory[e.id].length;
                gameState.chatHistory[e.id].push({
                    sender: e.name,
                    content: t,
                    isPlayer: !1,
                    timestamp: n,
                    proactive: !0,
                    isMoneyRequest: !0,
                    amount: r,
                    reason: t,
                }),
                    saveGame(!1);
                const o = gameState.time?.currentTime || Date.now();
                (e.proactiveMessages.lastSentTime = o),
                    (e.proactiveMessages.lastSentRealTime = Date.now()),
                    e.proactiveMessages.consecutiveUnreplied++,
                    (e.proactiveMessages.lastMoneyRequestTime = o),
                    (e.proactiveMessages.hasUnrepliedMoneyRequest = !0),
                    (e.lastMoneyRequest = Date.now()),
                    e.unreadMessages || (e.unreadMessages = 0),
                    e.unreadMessages++,
                    console.log(
                        `[Proactive Money Request] ${e.name} requested $${formatCash(r)}: "${t.substring(0, 50)}..."`
                    ),
                    remember(e, `I asked the boss for $${formatCash(r)}: ${t}`, "interaction", 1),
                    "people" === gameState.activeTab && updatePeopleTab(),
                    gameState.activeChat?.id === e.id &&
                        chatMessages &&
                        (addMoneyRequestMessage(e, r, t, a),
                        (chatMessages.scrollTop = chatMessages.scrollHeight),
                        (e.unreadMessages = 0));
            } catch (t) {
                console.error("[Proactive Money Request] Error generating message:", t);
                const n = getMoneyRequestMessage(e, "bills", r);
                gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
                const a = gameState.time?.currentTime || Date.now(),
                    o = gameState.chatHistory[e.id].length;
                gameState.chatHistory[e.id].push({
                    sender: e.name,
                    content: n,
                    isPlayer: !1,
                    timestamp: a,
                    proactive: !0,
                    isMoneyRequest: !0,
                    amount: r,
                    reason: n,
                }),
                    saveGame(!1),
                    (e.proactiveMessages.lastSentTime = gameState.time?.currentTime || Date.now()),
                    (e.proactiveMessages.lastSentRealTime = Date.now()),
                    e.proactiveMessages.consecutiveUnreplied++,
                    (e.proactiveMessages.lastMoneyRequestTime = gameState.time?.currentTime || Date.now()),
                    (e.proactiveMessages.hasUnrepliedMoneyRequest = !0),
                    (e.lastMoneyRequest = Date.now()),
                    e.unreadMessages || (e.unreadMessages = 0),
                    e.unreadMessages++,
                    "people" === gameState.activeTab && updatePeopleTab(),
                    gameState.activeChat?.id === e.id &&
                        chatMessages &&
                        (addMoneyRequestMessage(e, r, n, o),
                        (chatMessages.scrollTop = chatMessages.scrollHeight),
                        (e.unreadMessages = 0));
            }
            return;
        }
        if ((t.startsWith("unprompted_") && t.includes("pic")) || "unprompted_selfie" === t)
            return void (await sendUnpromptedImage(e, t, n));
        const a = e.personality || {},
            o = e.relationships?.player || { level: 0, type: "professional" },
            i = e.intimacy || 0,
            s = e.stats?.affection || 0;
        let r = "";
        "string" == typeof n
            ? (r = n)
            : "social" === n.type && n.post
              ? (r = `Recent post: "${n.post.content || ""}"`)
              : "event" === n.type && n.event && (r = `Recent event: ${n.event.description}`);
        const l = gameState.chatHistory[e.id] || [],
            c = l.length;
        let d = 3;
        s > 60 && c > 20 ? (d = 8) : s > 30 && c > 10 && (d = 5);
        const p = l.slice(-d),
            m = [...l].reverse().find((e) => e.isPlayer),
            u = [...l].reverse().find((e) => !e.isPlayer);
        let g = "";
        if (m && u) {
            const e = /\?|what|how|why|when|where|who|should|would|could/i.test(m.content),
                t = m.content.length > 50 && !e;
            g =
                e && u.timestamp < m.timestamp
                    ? "⚠️ CONVERSATION STATE: Last player message asked something. You can follow up on that topic or acknowledge it naturally."
                    : t
                      ? "⚠️ CONVERSATION STATE: Last player message was substantial. You can respond to it, expand on it, or naturally continue that thread."
                      : "⚠️ CONVERSATION STATE: Conversation ended naturally. You're starting a new topic - make it interesting!";
        }
        let h = "";
        p.length > 0 && (h = p.map((t) => `${t.isPlayer ? "Boss" : e.name}: ${t.content}`).join("\n")),
            e.recentMessageTypes || (e.recentMessageTypes = []);
        const y = e.recentMessageTypes.slice(0, 5).join(", "),
            f = getPlayerDescription("conversation", e),
            b = "the boss" !== f ? `\n\n👤 BOSS INFO:\n${f}` : "",
            v = getGossipContext(e.id, !0),
            w = v ? `\n\n${v}` : "",
            x = new Date().getHours();
        let S = "";
        S =
            x >= 6 && x < 12
                ? "It's morning. Messages can be about starting the day, morning mood, coffee, etc."
                : x >= 12 && x < 17
                  ? "It's afternoon. Messages can be about work progress, lunch, midday thoughts."
                  : x >= 17 && x < 22
                    ? "It's evening. Messages can be about wrapping up work, evening plans, relaxing."
                    : "It's late night. Messages can be casual, personal, or about being up late.";
        const k = `You are ${e.name}, initiating a conversation with your boss (@TheBoss).\n\nYOUR PERSONALITY:\n- Confidence: ${a.confidence || 50}/100\n- Flirtiness: ${a.flirty || 50}/100\n- Outgoing: ${a.outgoing || 50}/100\n- Professional: ${a.professional || 50}/100\n- Humor: ${a.humor || 50}/100\n${e.hobbies ? `- Hobbies: ${e.hobbies.join(", ")}` : ""}\n${e.position ? `- Job: ${e.position}` : ""}\n\nYOUR RELATIONSHIP:\n- Affection: ${s}/100 ${s > 70 ? "(very close)" : s > 40 ? "(friendly)" : "(professional)"}\n- Intimacy: ${i}/100 ${i > 60 ? "(intimate/romantic)" : i > 30 ? "(comfortable)" : "(reserved)"}\n- Type: ${o.type || "professional"}\n- Messages exchanged: ${c} ${c > 20 ? "(well-developed relationship)" : c > 10 ? "(getting to know each other)" : "(still new)"}${b}${w}\n\nCONTEXT:\n- Reason for messaging: ${t}\n- ${r || "No specific context"}\n- ${S}\n${h ? `\nRECENT CONVERSATION:\n${h}\n\n${g}` : "\nNo recent conversation - you're starting fresh"}\n${y ? `\n\n⚠️ VARIETY: Your recent message types: ${y}\nWrite something DIFFERENT this time - new angle, different tone, fresh approach!` : ""}\n\n📝 MESSAGE STRATEGY FOR DEVELOPED RELATIONSHIPS (${c}+ messages):\n\n${s > 70 && c > 20 ? `✨ YOU'RE VERY CLOSE - BE AUTHENTIC AND PERSONAL:\n- Reference earlier conversations naturally ("Remember when we talked about...")  \n- Pick up threads that were left hanging from your last chat\n- Show you've been thinking about them/previous topics\n- Be genuinely personal - you know each other well\n- Can bring up inside jokes, shared experiences, ongoing situations\n- If last conversation was intimate/personal, acknowledge it naturally\n- Don't randomly shift to generic work talk unless there's a reason\n\n🎯 PRIORITY: Personal > Work unless reason specifically work-related\n\nAVOID:\n- ❌ Generic "quick update" or "quick q" without substance\n- ❌ Random work questions when your relationship is personal\n- ❌ Ignoring what you last talked about\n- ❌ Acting like strangers when you've had ${c} meaningful exchanges\n\nINSTEAD:\n- ✓ "Hey! Been thinking about [earlier topic]..."\n- ✓ "So about what we discussed last time..."\n- ✓ "Random but remember when [callback]?"\n- ✓ Continue natural threads from your last conversation\n- ✓ Reference specific moments or topics you've shared\n- ✓ Match the intimacy level of your relationship\n` : s > 40 && c > 10 ? "🌱 YOU'RE FRIENDLY - BE MORE PERSONAL:\n- You can reference earlier topics naturally  \n- Show progression - you're getting more comfortable\n- Mix personal and professional topics (lean more personal)\n- Less formal than when you first met\n- Can bring up non-work stuff you've discussed before\n- Acknowledge previous conversations casually\n\n🎯 PRIORITY: Balance Personal & Work (slightly favor personal)\n\nEXAMPLES:\n- ✓ \"Hey! So I've been thinking about [topic from before]...\"\n- ✓ \"Quick q but also curious about [personal thing]...\"\n- ✓ Reference hobbies or interests you've discussed\n" : s > 20 && c > 5 ? "👔 YOU'RE PROFESSIONAL BUT WARMING UP:\n- Mostly professional topics but can be friendly\n- Reference past work conversations\n- Can ask personal questions to build connection\n- Keep it respectful but show personality\n\n🎯 PRIORITY: Work-focused with friendly personal touches\n\nEXAMPLES:\n- ✓ \"Hey boss, quick work thing + how's your day?\"\n- ✓ Professional questions with warm tone\n- ✓ Can mention non-work topics casually\n" : "🆕 RELATIONSHIP IS NEW - BUILD CONNECTION:\n- Keep it professional but friendly\n- Work topics are natural starters\n- Can ask getting-to-know-you questions\n- Show your personality without being too personal yet\n\n🎯 PRIORITY: Professional with friendly openness\n"}\n\n📝 MESSAGE STYLE GUIDE BY REASON:\n\n**work_question**: ${s > 60 && c > 15 ? "CLOSE RELATIONSHIP - Work questions should connect to your history:" : "Ask genuine questions that show personality:"}\n${s > 60 && c > 15 ? '- "Hey, remember [earlier topic]? Had a thought about it..."\n- "Quick q but it relates to [something we discussed]..."\n- "Been thinking about what you said about [X]..."\n- ONLY use generic work q\'s if they\'re genuinely time-sensitive\n- Better to connect work stuff to your existing conversations' : '- "Quick q - what\'s your take on [specific thing]?"\n- "Need your input when you have a sec"\n- "Random work thought - [specific question]?"\n- Show your personality in how you ask'}\n${a.humor > 60 ? "- Add humor if it fits your personality!" : ""}\n\n**work_update**: ${s > 60 && c > 15 ? "CLOSE RELATIONSHIP - Make updates relevant to your connection:" : "Share updates like a real person:"}\n${s > 60 && c > 15 ? '- "That thing we talked about? Just wrapped it up 💪"\n- "Update on [something you know they care about based on history]..."\n- "Remember when you asked about [X]? Got news..."\n- Connect updates to previous conversations when possible\n- AVOID: Generic project updates to someone you\'re close with' : '- "Just crushed that deadline 💪"\n- "Update: thing you asked about is done!"\n- "FYI - wrapped up early on [project]"\n- "Quick win today 🎉"'}\n${s > 50 ? "- Show enthusiasm if you like the boss!" : ""}\n\n**casual_chat**: ${s > 60 && c > 15 ? "CLOSE RELATIONSHIP - Be genuinely personal and connected:" : "Be genuinely casual and varied:"}\n${s > 60 && c > 15 ? '- "Been thinking about you lately 💭"\n- "So I was remembering [specific earlier conversation topic]..."\n- "You know what? [personal share that connects to your history]"\n- "Miss talking to you - got a minute?"\n- "Random but [callback to inside joke or shared moment]..."\n- Reference specific things you\'ve discussed before\n- Can acknowledge your closeness naturally\n- AVOID: Generic "how\'s your day" when you have real history' : '- "Hey! How\'s your day going?"\n- "Random thought: [something interesting]"\n- "Saw something that made me think of you"\n- "Quick break from work - what are you up to?"'}\n- Time-appropriate: morning coffee, afternoon check-in, evening plans\n${a.humor > 70 ? "- Share funny observations!" : ""}\n${i > 50 ? "- Can be more personal and warm" : ""}\n\n**sharing_news**: ${c > 20 ? "Share in a way that acknowledges your relationship:" : "Share something interesting:"}\n${c > 20 ? '- "Okay so remember [earlier topic]? Update on that..."\n- "You\'ll appreciate this - [news related to shared context]"\n- "Had to tell you - [something that connects to your conversations]"\n- Reference your relationship naturally in how you share' : '- "Dude, you won\'t believe what just happened 😅"\n- "Okay so [specific thing] just went down"\n- "Fun fact I just learned: [something relevant]"\n- "This is wild - [share actual news/event]"'}\n${e.hobbies ? "- Reference your hobbies naturally" : ""}\n\n**asking_advice**: NOT "Could I get your advice?" - Too formal!\nINSTEAD: Ask naturally and specifically:\n- "Quick dilemma - [specific situation]?"\n- "Need a second opinion on something"\n- "What would you do if [specific scenario]?"\n- "Honest question: [actual question]"\n${s > 60 ? "- Can ask personal advice, not just work" : ""}\n\n**post_followup**: Reference YOUR OWN post naturally:\n- "Did you see my post about [topic]? 📱"\n- "Posted something earlier that made me think of you"\n- "That post got more attention than I expected lol"\n- NOT: "I saw you liked my post" (unless context specifically says boss liked it!)\n\n**flirty_message**: ${i > 40 ? "You can be subtly flirty" : "Keep it light and playful"}:\n- "Hey you 😊"\n- "Been thinking about you"\n- "Miss talking to you"\n- ${i > 60 ? "Be playful with what they are doing" : "Light compliments work well"}\n${a.flirty > 70 ? "- Be bolder based on your personality" : "- Keep it subtle and tasteful"}\n\n**booty_call**: ${i > 60 ? "Be direct but playful" : "Suggest hanging out casually"}:\n- ${i > 70 ? "Can be direct about tonight" : "Suggest drinks or hanging out"}\n- ${i > 80 ? "Be flirty and suggestive" : "Keep it casual"}\n- ${i > 60 ? "Show interest romantically" : "Friendly hangout vibes"}\n\n**event_reaction**: React naturally to what happened:\n- "So about [event] 😅"\n- "That was [emotion]!"\n- "Can we talk about what just happened?"\n- Be specific to the actual event\n\n🎯 TONE GUIDELINES:\n${a.confidence > 70 ? "✓ Be direct and bold" : "✓ Be thoughtful and considerate"}\n${a.outgoing > 70 ? "✓ Be enthusiastic and expressive" : "✓ Be calm and measured"}\n${a.professional > 70 ? "✓ Keep it polished but warm" : "✓ Be casual and relaxed"}\n${a.humor > 70 ? "✓ Add wit and humor" : "✓ Keep it sincere"}\n${i > 60 ? "✓ Can be personal and intimate" : i > 30 ? "✓ Friendly and comfortable" : "✓ Professional but friendly"}\n${s > 70 ? "✓ Show warmth and care" : s > 40 ? "✓ Be friendly" : "✓ Keep it respectful"}\n\nRULES:\n- Max 300 characters\n- Use 0-2 emojis (use naturally, not forced)\n- NO quotation marks\n- NO "I would say" or meta-commentary\n- NO formal business-speak\n- BE SPECIFIC not generic\n- SHOW personality\n- DON'T invent boss actions not in context\n- Sound like an actual person texting\n\nWrite ONLY the message:`;
        const _rawDM = await queuedGenerateText(
            k,
            {
                temperature: 0.9,
                max_tokens: 80,
                stopSequences: [
                    "\n\n",
                    "(Character",
                    "(Emojis",
                    "(Approach",
                    "Note:",
                    "**Note",
                    "---",
                    "Rating:",
                ],
            },
            `Generating DM message for ${e.name}`
        );
        console.log(`[Proactive DM] Raw (${(_rawDM || "").length} chars) from ${e.name} [${t}]: ${JSON.stringify(_rawDM)}`);
        let T = sanitizeNpcResponse(_rawDM, 2).trim();
        console.log(`[Proactive DM] After sanitize (${T.length} chars): ${JSON.stringify(T)}`);
        // 3 ad-hoc split truncations — log only when a marker actually fires.
        let _preSplit = T;
        (T = T.split(/\(Character count:/)[0]),
            T !== _preSplit &&
                console.log(`[Proactive DM] Split '(Character count:' trimmed ${_preSplit.length}→${T.length} chars`),
            (_preSplit = T),
            (T = T.split(/\(Emojis used:/)[0]),
            T !== _preSplit &&
                console.log(`[Proactive DM] Split '(Emojis used:' trimmed ${_preSplit.length}→${T.length} chars`),
            (_preSplit = T),
            (T = T.split(/\(Approach:/)[0]),
            T !== _preSplit &&
                console.log(`[Proactive DM] Split '(Approach:' trimmed ${_preSplit.length}→${T.length} chars`),
            (T = T.trim());
        const _rejectReason = !T
            ? "empty"
            : T.length < 5
              ? `too short (${T.length} chars < 5)`
              : T.length > 300
                ? `too long (${T.length} chars > 300)`
                : /^[a-zA-Z]$/.test(T)
                  ? "single letter"
                  : /^[^a-zA-Z]*$/.test(T)
                    ? "no letters"
                    : /^(b|ok|k|lol|hi|hey|yo|sup|hm|hmm|um|uh|ah)$/i.test(T)
                      ? "filler word"
                      : null;
        if (_rejectReason) {
            console.warn(
                `[Proactive DM] Rejected (${_rejectReason}) from ${e.name}: ${JSON.stringify(T)} → using stale fallback`
            );
            const n = {
                    work_question: [
                        "Hey, got a quick question when you have a sec",
                        "Quick work thing - need your input on something",
                        "Got a minute? Need to run something by you",
                    ],
                    work_update: [
                        "Just wanted to give you a quick update on things",
                        "Hey! Made some progress today, thought you should know",
                        "Quick update from my end",
                    ],
                    casual_chat: [
                        "Hey! How's your day going?",
                        "Random thought - what are you up to?",
                        "Just checking in, hope your day's going well",
                    ],
                    sharing_news: [
                        "Okay you're not gonna believe what just happened",
                        "Had to tell you about something real quick",
                        "Something interesting happened today",
                    ],
                    asking_advice: [
                        "Need your opinion on something when you get a chance",
                        "Quick question - what would you do in this situation?",
                        "Hey, got a minute? Could use some advice",
                    ],
                    flirty_message: ["Hey you", "Been thinking about you", "Miss talking to you"],
                    booty_call: [
                        "Hey... you busy tonight?",
                        "What are you up to later?",
                        "Thinking about you tonight",
                    ],
                    post_followup: [
                        "Did you see what I posted earlier?",
                        "Posted something earlier, curious what you think",
                        "Check out my latest post when you get a chance",
                    ],
                    event_reaction: [
                        "Can we talk about what just happened?",
                        "So that was something, right?",
                        "Did you hear about what happened?",
                    ],
                },
                a = n[t] || n.casual_chat;
            (T = a[Math.floor(Math.random() * a.length)]),
                console.log(`[Proactive DM] Using stale fallback for ${e.name}: ${JSON.stringify(T)}`);
        } else console.log(`[Proactive DM] ✅ Accepted (${T.length} chars) from ${e.name}: ${JSON.stringify(T)}`);
        e.recentMessageTypes.unshift(t),
            e.recentMessageTypes.length > 10 && (e.recentMessageTypes = e.recentMessageTypes.slice(0, 10)),
            gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
        const C = gameState.time?.currentTime || Date.now();
        gameState.chatHistory[e.id].push({ sender: e.name, content: T, isPlayer: !1, timestamp: C, proactive: !0 }),
            saveGame(!1);
        const E = gameState.time?.currentTime || Date.now();
        if (
            ((e.proactiveMessages.lastSentTime = E),
            (e.proactiveMessages.lastSentRealTime = Date.now()),
            e.proactiveMessages.consecutiveUnreplied++,
            "money_request" === t &&
                ((e.proactiveMessages.lastMoneyRequestTime = E),
                (e.proactiveMessages.hasUnrepliedMoneyRequest = !0)),
            console.log(
                `[Proactive Message] ${e.name} sent message (${e.proactiveMessages.consecutiveUnreplied}/3 unreplied)`
            ),
            e.unreadMessages || (e.unreadMessages = 0),
            e.unreadMessages++,
            remember(e, `I messaged the boss: "${T}"`, "interaction", 1),
            "people" === gameState.activeTab && updatePeopleTab(),
            gameState.activeChat?.id === e.id && chatMessages)
        ) {
            const t = gameState.chatHistory[e.id].length - 1;
            addChatMessage(e.name, T, !1, null, t),
                (chatMessages.scrollTop = chatMessages.scrollHeight),
                (e.unreadMessages = 0);
        }
    } catch (e) {
        console.error("Error sending proactive NPC message:", e);
    }
}
async function sendUnpromptedImage(e, t, n) {
    try {
        console.log(`[Unprompted Image] ${e.name} sending ${t}`);
        let n = "casual",
            a = "";
        switch (t) {
            case "unprompted_selfie":
                (n = "casual"),
                    (a =
                        "A cute selfie to share with someone they like - could be at work, home, out and about, or doing a hobby");
                break;
            case "unprompted_flirty_pic":
                (n = "lewd"),
                    (a =
                        "A flirty, suggestive photo to tease someone they're attracted to - showing off, being playful");
                break;
            case "unprompted_lewd_pic":
                (n = "lewd"), (a = "A revealing, sexy photo - underwear, lingerie, suggestive poses, showing skin");
                break;
            case "unprompted_nude_pic":
                (n = "nude"), (a = "An intimate nude photo for someone they trust and desire");
        }
        const o = e.personality || {},
            i = e.intimacy || 0,
            s = e.stats?.affection || 0,
            r = getPhysicalDescriptionForPrompt(e),
            l = e.race && "human" !== e.race ? e.race : "human",
            c = e.physical?.raceFeatures?.description || "",
            d = timeHelpers ? timeHelpers.getHour() : new Date().getHours();
        let p = "";
        p =
            d >= 6 && d < 12
                ? "morning - just woke up, getting ready, morning light"
                : d >= 12 && d < 17
                  ? "afternoon - at work, on break, daytime activities"
                  : d >= 17 && d < 22
                    ? "evening - after work, relaxing, evening mood"
                    : "late night - in bed, intimate setting, dim lighting";
        const m = `Generate an image prompt for ${e.name} sending an unprompted ${n} photo.\n\nCHARACTER: ${e.name}\n- ${r}\n- Species: ${l}${c ? ` (${c})` : ""}\n- Personality: Confidence ${o.confidence || 50}/100, Flirty ${o.flirty || 50}/100\n\nCONTEXT: ${a}\nTIME: ${p}\nINTIMACY LEVEL: ${i}/100\nAFFECTION: ${s}/100\n\nCreate a detailed image prompt (40-80 words) for this spontaneous photo. Include:\n- Setting/location appropriate for the time of day\n- Pose and expression matching their personality\n- Clothing/state appropriate for the image type\n- Mood and lighting\n${"human" !== l ? `- Include ${l} features prominently!` : ""}\n\nWrite ONLY the image description:`;
        let u = await queuedGenerateText(
            m,
            { temperature: 0.9, max_tokens: 150 },
            `Generating unprompted image prompt for ${e.name}`
        );
        (u = extractText(u).trim()),
            u.toLowerCase().includes(e.name.toLowerCase().split(" ")[0]) || (u = `${e.name}, ${r}. ${u}`),
            console.log("[Unprompted Image] Prompt:", u.substring(0, 100) + "...");
        const g = await queuedGenerateImage(applyImageStyle(u), `Unprompted ${n} image from ${e.name}`);
        if (!g) return void console.error("[Unprompted Image] Failed to generate image");
        const h = `${e.name} is spontaneously sending a ${n} photo to their boss, who they ${s > 70 ? "really like" : s > 40 ? "are fond of" : "respect"}.\n\nRelationship: Affection ${s}/100, Intimacy ${i}/100\nPersonality: Confidence ${o.confidence || 50}/100, Flirty ${o.flirty || 50}/100, Playful ${o.humor || 50}/100\nTime: ${p}\n\nPhoto type being sent: ${n}\n${"casual" === n ? "This is a cute/friendly selfie" : ""}\n${"lewd" === n ? "This is a flirty/revealing photo" : ""}\n${"nude" === n ? "This is an intimate nude photo" : ""}\n\nWrite a SHORT message (1-2 sentences, max 100 chars) to accompany this spontaneous photo. Be natural and match their personality:\n- Casual: Friendly, maybe a bit playful\n- Flirty: Teasing, confident, coy\n- Lewd: Bold, seductive, wanting attention\n- Nude: Intimate, bold, trusting, possibly aroused\n\nExamples:\n- "Thought you might like this 😏"\n- "Thinking of you 💕"  \n- "Just for you..."\n- "Miss you 🥰"\n- "Bored at home... entertain me? 😘"\n\n${e.name}'s message:`;
        let y = await queuedGenerateText(
            h,
            { temperature: 0.9, max_tokens: 30, stopSequences: ["\n\n", "(", "---"] },
            `Generating unprompted image message for ${e.name}`
        );
        if (((y = sanitizeNpcResponse(y, 1).trim()), !y || y.length > 100)) {
            const e = {
                casual: ["Just thinking of you 😊", "Hey there 📸", "For you 💕"],
                lewd: ["Like what you see? 😏", "Thought you might appreciate this...", "Miss you 😘"],
                nude: ["Just for you 💕", "Thinking of you...", "Want to see more? 😏"],
            };
            y = e[n]?.[Math.floor(3 * Math.random())] || "For you 💕";
        }
        gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []);
        const f = gameState.time?.currentTime || Date.now(),
            b = gameState.chatHistory[e.id].length;
        gameState.chatHistory[e.id].push({
            sender: e.name,
            content: y,
            isPlayer: !1,
            imageUrl: g,
            imagePrompt: u,
            imageType: "received",
            timestamp: f,
            proactive: !0,
            isUnpromptedImage: !0,
        }),
            saveGame(!1);
        const v = gameState.time?.currentTime || Date.now();
        (e.proactiveMessages.lastSentTime = v),
            (e.proactiveMessages.lastSentRealTime = Date.now()),
            e.proactiveMessages.consecutiveUnreplied++,
            (e.lastUnpromptedImageTime = v),
            e.unreadMessages || (e.unreadMessages = 0),
            e.unreadMessages++,
            remember(e, `Sent spontaneous ${n} photo to the boss`, "event", 1.5),
            e.photos || (e.photos = []),
            e.photos.push({ url: g, prompt: u, type: n, timestamp: f, unprompted: !0 }),
            console.log(`[Unprompted Image] ${e.name} sent ${n} image: "${y}"`),
            showNotification(`📸 ${e.name} sent you a photo!`, "info"),
            "people" === gameState.activeTab && updatePeopleTab(),
            gameState.activeChat?.id === e.id &&
                chatMessages &&
                (addChatMessage(e.name, y, !1, g, b, u, f),
                (chatMessages.scrollTop = chatMessages.scrollHeight),
                (e.unreadMessages = 0));
    } catch (e) {
        console.error("[Unprompted Image] Error:", e);
    }
}
function updateNewsFeed() {
    newsFeed &&
        ((gameState.news && Array.isArray(gameState.news)) ||
            (gameState.news = [
                "Tech startup raises $1M in seed funding",
                "New productivity app trends in office spaces",
                "Remote work policies reshape company cultures",
                "AI integration boosts efficiency across industries",
            ]),
        (newsFeed.innerHTML = ""),
        gameState.news.forEach((e, t) => {
            const n = document.createElement("div");
            (n.className = "news-item"),
                (n.style.cssText = "background:var(--surface); border-radius:8px; padding:12px; margin-bottom:10px;"),
                (n.innerHTML = `\n        <p style="margin:0;">${e}</p>\n        <p style="margin:5px 0 0 0; font-size:0.8rem; color:var(--text-dim);">${new Date().toLocaleDateString()}</p>\n      `),
                newsFeed.appendChild(n);
        }));
}
function adjustEmployeeLifestyles() {
    const e = 50 + 100 * Math.random(),
        t = calculateScaledSpendingRate(e) / e;
    gameState.employees.forEach((e) => {
        if (!e.spendingRate) return void (e.spendingRate = calculateScaledSpendingRate());
        const n = 0.05 * (calculateScaledSpendingRate(e.spendingRate / Math.max(1, t / 1.5)) - e.spendingRate);
        Math.abs(n) > 1 && ((e.spendingRate += n), (e.spendingRate = Math.max(50, Math.min(5e4, e.spendingRate))));
    });
}
