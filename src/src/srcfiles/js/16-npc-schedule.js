// ============================================================================
// 16-npc-schedule — NPC performance metrics, schedules, status messages, morning/evening posts, activity system, createSocialPost.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function calculateEmployeePerformance(e) {
    let t = 0;
    const n = {},
        a = e.stats?.productivity || 50;
    (n.productivity = Math.floor(0.3 * a)), (t += n.productivity);
    const o = e.hireDate || gameNow(),
        i = Math.floor((gameNow() - o) / 864e5);
    (n.tenure = Math.min(15, Math.floor(i / 7))), (t += n.tenure);
    const s = e.career?.level || 1;
    (n.careerLevel = 3 * s), (t += n.careerLevel);
    const r = gameState.products.find((t) => t.name === e.productManaged && t.managerHired);
    if (r) {
        const e = (currentValue(r) / (parseFloat(calculateCashPerSecond()) || 1)) * 100;
        (n.management = Math.min(20, Math.floor(e / 5))), (t += n.management);
    } else n.management = 0;
    const l = e.stats?.affection || 50,
        c = e.stats?.trust || 50;
    (n.relationship = Math.floor(((l + c) / 2) * 0.15)), (t += n.relationship);
    let d = 0;
    e.skills && (d = Object.values(e.skills).reduce((e, t) => e + (t.level || 0), 0)),
        (n.skills = Math.min(10, d)),
        (t += n.skills);
    const p = e.lastActivityTime || e.hireDate || Date.now(),
        m = Math.floor((Date.now() - p) / 864e5);
    return (
        m > 7 ? ((n.activityPenalty = -Math.min(10, m - 7)), (t += n.activityPenalty)) : (n.activityPenalty = 0),
        (e.performanceBreakdown = n),
        (e.performanceScore = Math.max(0, t)),
        (e.performanceLastUpdated = Date.now()),
        { score: Math.max(0, t), breakdown: n, grade: getPerformanceGrade(t) }
    );
}
function getPerformanceGrade(e) {
    return e >= 90
        ? { letter: "S", color: "var(--l-gold)", label: "Outstanding" }
        : e >= 80
          ? { letter: "A", color: "var(--l-green)", label: "Excellent" }
          : e >= 70
            ? { letter: "B", color: "var(--l-cyan)", label: "Good" }
            : e >= 55
              ? { letter: "C", color: "#ffcc00", label: "Average" }
              : e >= 40
                ? { letter: "D", color: "var(--l-orange-3)", label: "Below Average" }
                : { letter: "F", color: "var(--l-red)", label: "Poor" };
}
function updateEmployeePerformanceMetrics() {
    gameState.performanceTracking ||
        (gameState.performanceTracking = {
            enabled: !0,
            lastUpdate: Date.now(),
            weeklyReviews: [],
            topPerformersHistory: [],
        });
    const e = gameState.employees.filter((e) => e.hired && "active" === e.employmentStatus),
        t = e.map((e) => ({ id: e.id, name: e.name, ...calculateEmployeePerformance(e) }));
    t.sort((e, t) => t.score - e.score),
        gameState.performanceTracking.weeklyReviews.unshift({
            date: gameState.time?.currentTime || Date.now(),
            topThree: t.slice(0, 3).map((e) => ({ id: e.id, name: e.name, score: e.score, grade: e.grade })),
            averageScore: t.length > 0 ? Math.floor(t.reduce((e, t) => e + t.score, 0) / t.length) : 0,
        }),
        gameState.performanceTracking.weeklyReviews.length > 12 &&
            gameState.performanceTracking.weeklyReviews.pop(),
        (gameState.performanceTracking.lastUpdate = Date.now()),
        document.getElementById("dashTopPerformers") && renderDashboardTopPerformers(),
        console.log(`[Performance] Updated metrics for ${e.length} employees`);
}
function clockInEmployees() {
    let e = 0;
    gameState.employees.forEach((t) => {
        t.schedule &&
            shouldEmployeeWorkToday(t) &&
            ((t.schedule.isCurrentlyWorking = !0),
            (t.schedule.lastClockIn = gameState.time.currentTime),
            e++);
    }),
        e > 0 && (console.log(`⏰ 9 AM: ${e} employees clocked in`), updatePeopleTab());
}
function clockOutEmployees() {
    let e = 0;
    gameState.employees.forEach((t) => {
        t.schedule &&
            t.schedule.isCurrentlyWorking &&
            ((t.schedule.isCurrentlyWorking = !1),
            (t.schedule.lastClockOut = gameState.time.currentTime),
            e++);
    }),
        e > 0 && (console.log(`⏰ 5 PM: ${e} employees clocked out`), updatePeopleTab());
}
function shouldEmployeeWorkToday(e) {
    if (!e.schedule) return !1;
    if (e.schedule.isOnLeave) {
        if (!(e.schedule.leaveEndDate && gameState.time.currentTime >= e.schedule.leaveEndDate)) return !1;
        (e.schedule.isOnLeave = !1), (e.schedule.leaveType = null), (e.schedule.leaveEndDate = null);
    }
    if (
        e.flags &&
        e.flags.systemFlags.some((e) => "sick" === e.key && e.value.severity > 50) &&
        Math.random() < 0.7
    )
        return !1;
    const t = timeHelpers.getDay();
    return e.schedule.workDays.includes(t);
}
function salvagePrunedPostImages() {
    const e = gameState.socialNetwork?.posts;
    !e ||
        e.length <= CAPS.SOCIAL_POSTS ||
        e.slice(CAPS.SOCIAL_POSTS).forEach((e) => {
            if (e.isPlayerPost || !e.authorId) return;
            const n = gameState.employees.find((t) => t.id === e.authorId);
            if (
                (n &&
                    e.content &&
                    (e.likes?.length || 0) + (e.comments?.length || 0) >= 5 &&
                    addSocialCallback(n, `you once posted: "${e.content.substring(0, 80)}"`, "pruned"),
                !e.imageUrl)
            )
                return;
            const t = n;
            t &&
                (t.photos || (t.photos = []),
                t.photos.some((t) => ("string" == typeof t ? t : t.url) === e.imageUrl) ||
                    t.photos.push({
                        url: e.imageUrl,
                        source: "social_pruned",
                        caption: e.content || "",
                        timestamp: e.timestamp || Date.now(),
                    }));
        });
}
function salvageSocialForEmployee(e) {
    if (!e) return;
    const t = gameState.socialNetwork?.posts;
    if (!Array.isArray(t)) return;
    const n = t.filter((t) => t && t.authorId === e.id);
    if (!n.length) return;
    e.photos || (e.photos = []),
        n.forEach((t) => {
            t.imageUrl &&
                (e.photos.some((e) => ("string" == typeof e ? e : e.url) === t.imageUrl) ||
                    e.photos.push({
                        url: t.imageUrl,
                        source: "social_prestige",
                        caption: t.content || "",
                        timestamp: t.timestamp || Date.now(),
                    }));
        });
    const a = n
        .filter((e) => e.content)
        .slice(0, 6)
        .map((e) => e.content.substring(0, 120));
    a.length && (e.memory || (e.memory = {}), (e.memory.priorSocialPosts = a));
}
function enforceSocialCommentCaps(e = gameState.socialNetwork) {
    const t = e?.posts;
    t &&
        (t.forEach((e) => {
            if (e.comments && e.comments.length > 40) {
                const t = e.comments.filter((e) => e.isPlayerComment || "player" === e.authorId),
                    n = e.comments.filter((e) => !(e.isPlayerComment || "player" === e.authorId)),
                    a = Math.max(0, 40 - t.length);
                e.comments = [...n.slice(-a), ...t].sort((e, t) => (e.timestamp || 0) - (t.timestamp || 0));
            }
        }),
        t.slice(150).forEach((e) => {
            (e.comments || []).forEach((e) => {
                e.imageUrl && ((e.imageUrl = null), (e.imagePrompt = null));
            });
        }));
}
function getPostSignal(e) {
    if (e.isPlayerPost) return null;
    if ((e.referencedEmployees || []).includes("player") || /@TheBoss\b/i.test(e.content || ""))
        return "mentioned you";
    if ((e.upvotes || 0) - (e.downvotes || 0) + (e.likes?.length || 0) + 2 * (e.comments?.length || 0) >= 10)
        return "blowing up";
    const t = gameState.employees.find((t) => t.id === e.authorId);
    return t && ((t.stats?.affection || 0) > 70 || (t.memory?.intimacyLevel || 0) > 50)
        ? "close to you"
        : Date.now() - (e.timestamp || 0) < 36e5
          ? "just now"
          : null;
}
function isAiFallback(e) {
    if (!e || "string" != typeof e) return !1;
    const t = e.trim().toLowerCase();
    return [
        "experiencing some technical difficulties",
        "please try again in a moment",
        "having some difficulty with my words",
        "could you try asking again",
        "positive energy to any workplace",
        "some technical details need to be worked out",
    ].some((e) => t.includes(e));
}
function createSocialPost(e) {
    if (!e || !e.authorId || !e.content) return void console.warn("Invalid post data:", e);
    if (isAiFallback(e.content))
        return void console.warn("[Social] Refusing to persist AI-fallback text as a post:", e.content);
    const t = {
        id: `post_${++gameState.socialNetwork.postIdCounter}_${Date.now()}`,
        authorId: e.authorId,
        authorName: e.authorName,
        type: e.type || "life_update",
        content: e.content,
        timestamp: e.timestamp || gameState.time.currentTime,
        likes: e.likes || [],
        comments: e.comments || [],
        mentions: e.mentions || [],
        media: e.media || null,
        location: e.location || null,
        mood: e.mood || null,
        tags: e.tags || [],
        imageUrl: e.imageUrl || null,
        imagePrompt: e.imagePrompt || null,
        altText: e.altText || null,
        explicitLevel: e.explicitLevel || 0,
        nsfwLevel: e.nsfwLevel || 0,
    };
    return (
        gameState.socialNetwork.posts.unshift(t),
        salvagePrunedPostImages(),
        gameState.socialNetwork.posts.length > CAPS.SOCIAL_POSTS &&
            (gameState.socialNetwork.posts = gameState.socialNetwork.posts.slice(0, CAPS.SOCIAL_POSTS)),
        "social" === gameState.activeTab && "function" == typeof requestSmartFeedUpdate && requestSmartFeedUpdate(),
        t
    );
}
function generateMorningPost(e) {
    const t = [
            "Coffee is life ☕",
            "Monday blues 😴",
            "Traffic was brutal this morning 🚗",
            "Actually excited for today! 🌞",
            "Another day, another dollar 💼",
            "Who else needs caffeine to function? ☕😅",
            "Made it to work somehow 🏢",
        ],
        n = t[Math.floor(Math.random() * t.length)];
    createSocialPost({
        authorId: e.id,
        authorName: e.name,
        type: "life_update",
        content: n,
        timestamp: gameState.time.currentTime,
        likes: [],
        comments: [],
        mentions: [],
    });
}
function generateEveningPost(e) {
    const t = [
            "Finally done for the day! 🎉",
            "Happy hour anyone? 🍻",
            "Time to unwind 😌",
            "Made it through another week! 💪",
            "Weekend vibes loading... 🌴",
            "Exhausted but accomplished 😴✅",
            "Who's ready for the weekend?",
        ],
        n = t[Math.floor(Math.random() * t.length)];
    createSocialPost({
        authorId: e.id,
        authorName: e.name,
        type: "life_update",
        content: n,
        timestamp: gameState.time.currentTime,
        likes: [],
        comments: [],
        mentions: [],
    });
}
async function generateBonusSocialPosts(e, t, n = "bonus_pool") {
    if (!e || 0 === e.length) return;
    const a = t >= 5e3 ? 3 : t >= 1e3 ? 2 : 1,
        o = [...e].sort(() => Math.random() - 0.5).slice(0, Math.min(a, e.length)),
        i = t >= 5e3 ? "huge" : t >= 1e3 ? "nice" : "small",
        s = "payday_bonus" === n ? "payday bonus with their salary" : "company bonus pool distribution";
    for (let e = 0; e < o.length; e++) {
        const n = o[e];
        setTimeout(async () => {
            try {
                const a = await generateAIBonusPost(n, t, i, s);
                if (a) {
                    createSocialPost({
                        authorId: n.id,
                        authorName: n.name,
                        type: a.explicitLevel > 0 ? "lewd" : "appreciation",
                        content: a.content,
                        timestamp: gameState.time.currentTime,
                        likes: [],
                        comments: [],
                        mentions: a.mentionsBoss ? ["TheBoss"] : [],
                        mood: "excited",
                        tags: ["bonus", "grateful", "worklife"],
                        imageUrl: a.imageUrl || null,
                        imagePrompt: a.imagePrompt || null,
                        explicitLevel: a.explicitLevel || 0,
                        nsfwLevel: a.explicitLevel || 0,
                    }),
                        debugLog(
                            "Social",
                            `${n.name} posted AI-generated bonus reaction${a.imageUrl ? " with image" : ""}`
                        );
                }
            } catch (t) {
                console.error(`[Social] Failed to generate bonus post for ${n.name}:`, t);
            }
        }, 1e3 * e);
    }
}
async function generateAIBonusPost(e, t, n, a) {
    const o = e.personality || {},
        i = e.social || {},
        s = e.stats?.affection || 50,
        r = e.intimacy || 0,
        l = [
            personalityToText(o.outgoing || 50, "outgoing"),
            personalityToText(o.professional || 50, "professional"),
            personalityToText(o.flirty || 50, "flirty"),
            personalityToText(o.confidence || 50, "confident"),
        ].join(", "),
        c = Math.random();
    const canSpicy =
        ("function" != typeof isSFWMode || !isSFWMode()) &&
        (o.flirty || 50) > 55 &&
        s > 55 &&
        r > 40;
    let d, p;
    c < 0.25
        ? ((d = "text_only"), (p = null))
        : c < 0.45
          ? ((d = "spending_plans"), (p = Math.random() < 0.4 ? "wishlist" : null))
          : c < 0.6
            ? ((d = "selfie_reaction"), (p = "selfie"))
            : c < 0.75
              ? ((d = "celebration"), (p = Math.random() < 0.5 ? "celebration" : null))
              : c < 0.85
                ? ((d = "grateful"), (p = null))
                : c < 0.92 && (canSpicy || (o.flirty > 50 && s > 60))
                  ? canSpicy && Math.random() < 0.55
                      ? ((d = "nsfw_thanks"), (p = null))
                      : ((d = "flirty_thanks"), (p = Math.random() < 0.5 ? "flirty_selfie" : null))
                  : ((d = "creative"), (p = null));
    const m = {
            text_only: `Write a spontaneous reaction to getting a ${n} bonus. Be authentic - excited, grateful, surprised, whatever fits your personality. Could thank the boss, brag a little, or just express your feelings. 1-2 sentences.`,
            spending_plans: `Write about what you're going to do with your ${n} bonus! Ideas: treating yourself to something specific, finally buying that thing you wanted, vacation fund, savings goals, splurging on food/drinks, shopping spree, paying off something. Be specific and personal! 1-2 sentences. Examples: "This bonus is going straight to that bag I've been eyeing 👜💸", "Vacation fund just got a serious boost ✈️🏖️", "Sushi for dinner because I DESERVE IT 🍣💰"`,
            selfie_reaction: `Write a SHORT caption for an excited selfie you're taking because you just got a ${n} bonus! Show your personality - could be smug, giddy, grateful, or just vibing. 5-15 words max. Examples: "Bonus face activated 💰😏", "When the direct deposit hits 😍💸", "This is my grateful face ✨", "Secure the bag, literally 💅💰"`,
            celebration: `Write about how you're celebrating your ${n} bonus! Treating yourself to food, drinks, or something fun. Be specific! 1-2 sentences. Examples: "Bonus means fancy coffee all week ☕✨", "Taking myself out to dinner because I'm worth it 🍝💕", "This calls for champagne 🥂💰", "Ordered dessert AND an appetizer, feeling rich 🎉"`,
            grateful: `Write a genuinely grateful post about receiving a ${n} bonus. Could be emotional, appreciative, or touching. Maybe mention what it means to you personally. 1-2 sentences. ${s > 70 ? "You have a great relationship with your boss, so feel free to express genuine warmth." : ""} Examples: "Not gonna lie, I teared up a little 🥹💕", "This job really does appreciate us and it shows 😭❤️", "Feeling so valued right now, thank you @TheBoss 🙏"`,
            flirty_thanks: `Write a playful, flirty thank you for your ${n} bonus. You have a close relationship with @TheBoss so you can be a bit suggestive or teasing about how you'll "thank them properly" later 😏. Keep it fun and cheeky! 1-2 sentences. Examples: "Might have to thank @TheBoss properly later 😏💋", "@TheBoss spoiling me again... might have to return the favor 💕🔥", "Best boss ever, I'll make it up to you 😘"`,
            nsfw_thanks: `Write an explicit, sexually suggestive thank you for your ${n} bonus. You and @TheBoss are intimate, so be bold and adult about exactly how you intend to repay them — innuendo, desire, what you want to do to/for them. Steamy and confident, in YOUR voice. 1-2 sentences. Examples: "@TheBoss is getting thanked on their knees... I mean, mine 😏🔥", "Already thinking about how I'm gonna work this bonus off, and it's not at my desk 💋💦", "Boss spoils me, I spoil boss... privately 😈"`,
            creative: `Write a unique, creative reaction to getting a ${n} bonus. Could be: meme-style humor, chaotic energy, unexpected angle, or just a really creative take. Be original! 1-2 sentences. Examples: "Plot twist: I'm still broke but slightly less broke 💀💸", "My bank account seeing a positive number: 👁️👄👁️", "Me pretending I won't spend this immediately 🤡💰", "Capitalism is bad but these vibes? Immaculate ✨"`,
        },
        u =
            "flirty_thanks" === d || "grateful" === d || Math.random() < 0.4 + s / 200
                ? "\n💡 Mention @TheBoss in your post to thank them or reference them!"
                : "\n💡 You can mention @TheBoss or keep the post general - your choice!",
        g = getPhysicalDescriptionForPrompt(e),
        h = `You are ${e.name}, a ${e.age || 25}-year-old ${"Male" === e.gender ? "man" : "woman"} posting on social media.\n\nYOUR APPEARANCE: ${g}\n\nYour personality: ${l}\nContent style: ${"casual" === i.contentStyle ? "casual, uses slang" : "balanced, friendly"}\nYour affection toward your boss: ${s}/100 ${s > 70 ? "(you really like them!)" : s > 50 ? "(good relationship)" : "(professional)"}\n${r > 30 ? `Your intimacy level with boss: ${r}/100 (you have a close/flirty relationship)` : ""}\n\n💰 SITUATION: You just received a ${n.toUpperCase()} bonus of $${formatNumber(t)} from your job (${a})!\n\n${m[d]}${u}\n\nRULES:\n- Write ONLY the post text, nothing else\n- Be authentic to YOUR personality\n- 1-2 emojis max\n- NO hashtags\n- NO meta-commentary or explanations\n- Sound like a real person on social media\n\nWrite ONLY the post:`;
    try {
        if ("function" != typeof generateText) throw new Error("AI not available");
        let n = await queuedGenerateText(
            h,
            { temperature: 0.95, max_tokens: 100, stopSequences: ["\n\n", "---", "Rating:", "(Note:"] },
            `Generating bonus reaction post for ${e.name}`
        );
        (n = extractText(n)),
            (n = n.replace(/\{[A-Z]+:[^}]*\}\s*/g, "")),
            (n = n.replace(/^\*\*[^*]+\*\*\s*/g, "")),
            (n = n.split(/\n\s*\(/)[0]),
            (n = n.trim()),
            (n = n.replace(/\b(the\s+)?([Mm]y\s+)?([Oo]ur\s+)?[Bb]oss\b/g, "@TheBoss")),
            (n = n.replace(/@@TheBoss/g, "@TheBoss")),
            (n = n.replace(/@[Bb]oss\b/g, "@TheBoss")),
            "function" == typeof cleanWithLearning && (n = cleanWithLearning(n));
        const a = n.includes("@TheBoss");
        let o = null,
            i = null;
        if (p && "function" == typeof queuedGenerateImage)
            try {
                (i = await generateBonusPostImagePrompt(e, p, n, t)),
                    i && (o = await queuedGenerateImage(applyImageStyle(i), `Bonus post image for ${e.name}`));
            } catch (e) {
                console.warn("[Social] Image generation failed for bonus post:", e);
            }
        return {
            content: n,
            mentionsBoss: a,
            imageUrl: o,
            imagePrompt: i,
            explicitLevel: "nsfw_thanks" === d ? 2 : 0,
        };
    } catch (e) {
        return console.error("[AI] Bonus post generation failed:", e), null;
    }
}
async function generateBonusPostImagePrompt(e, t, n, a) {
    const o = getPhysicalDescriptionForPrompt(e);
    return (
        {
            selfie: `Selfie photo of ${o}, looking excited and happy, maybe holding phone up for selfie, genuine smile or excited expression, natural lighting, social media selfie style`,
            flirty_selfie: `Flirtatious selfie of ${o}, playful confident expression, maybe winking or biting lip slightly, ${(e.personality || {}).flirty > 70 ? "revealing outfit showing cleavage" : "cute outfit"}, bedroom eyes, social media thirst trap style`,
            wishlist: `Photo of ${n.includes("bag") ? "a luxury handbag" : n.includes("shoe") ? "designer shoes" : n.includes("vacation") || n.includes("trip") ? "a beautiful beach resort" : n.includes("food") || n.includes("dinner") || n.includes("sushi") ? "an elegant restaurant meal" : "shopping bags and luxury items"}, aesthetic product photography, aspirational wishlist style`,
            celebration: `${o} celebrating, ${n.includes("coffee") ? "holding a fancy coffee drink" : n.includes("champagne") || n.includes("wine") ? "toasting with champagne glass" : n.includes("dinner") || n.includes("food") ? "at a nice restaurant with food" : "celebrating with a drink or treat"}, happy expression, warm lighting, lifestyle photography`,
        }[t] || null
    );
}
function canChatWithEmployee(e) {
    const t = e.schedule && e.schedule.isCurrentlyWorking,
        n = timeHelpers.isWorkHours();
    if (n && t) return { available: !0, context: "at_work" };
    if (!n) {
        const t = timeHelpers.getHour();
        return t >= 23 || t < 6
            ? e.stats && e.stats.affection < 80
                ? { available: !1, reason: "It's very late..." }
                : { available: !0, context: "late_night" }
            : e.stats && (e.stats.affection > 40 || e.stats.trust > 50)
              ? { available: !0, context: "after_hours" }
              : Math.random() < 0.3
                ? { available: !1, reason: "I'm off the clock..." }
                : { available: !0, context: "after_hours" };
    }
    return timeHelpers.isWeekend()
        ? e.stats && e.stats.affection > 60
            ? { available: !0, context: "weekend" }
            : { available: !1, reason: "It's my day off..." }
        : { available: !0, context: "general" };
}
function getTimeContextForChat(e) {
    const t = canChatWithEmployee(e),
        n = timeHelpers.getFormattedTime();
    let a = `\n📅 CURRENT DATE & TIME: ${timeHelpers.getFormattedDate()}, ${n}`;
    const o = getActivityTransitionContext(e);
    if (
        ("after_hours" === t.context
            ? ((a +=
                  "\n⏰ TIME CONTEXT: It's after work hours. You're OFF THE CLOCK - at home, relaxed, living your personal life."),
              (a +=
                  "\n🚫 WORK TOPIC RULE: Do NOT bring up work projects, reports, meetings, deadlines, or any work tasks unless the player specifically asks about work. You are done for the day. If the player mentions work, you can respond briefly but steer back to personal topics. Think about what a real person talks about after hours: hobbies, food, TV shows, plans, how they're feeling, personal life - NOT the Henderson report."),
              o
                  ? (a += `\n${o}`)
                  : e.personalLife &&
                    e.personalLife.currentActivity &&
                    (a += `\nCURRENT ACTIVITY: ${e.personalLife.currentActivity.description}`))
            : "late_night" === t.context
              ? ((a +=
                    "\n🌙 TIME CONTEXT: It's very late at night. You're tired, maybe in bed. Keep responses brief unless it's important or intimate."),
                (a +=
                    "\n🚫 WORK TOPIC RULE: Do NOT mention work at all. It's the middle of the night. Nobody thinks about spreadsheets at 2 AM. Talk about personal things, being tired, what you're doing, or just be sleepy and casual."))
              : "weekend" === t.context
                ? ((a += "\n📅 TIME CONTEXT: It's the weekend. You're off work, doing personal activities."),
                  (a +=
                      "\n🚫 WORK TOPIC RULE: Do NOT bring up work projects or tasks unprompted. It's your day off. Only discuss work if the player specifically asks. Focus on your weekend activities, plans, hobbies, or personal life. Mention what you're up to!"),
                  o
                      ? (a += `\n${o}`)
                      : e.personalLife &&
                        e.personalLife.currentActivity &&
                        (a += `\nCURRENT ACTIVITY: ${e.personalLife.currentActivity.description}`))
                : "at_work" === t.context &&
                  ((a +=
                      "\n💼 TIME CONTEXT: You're at work right now. Work topics are natural but you can also chat during breaks."),
                  o && (a += `\n${o}`)),
        e.personalLife && e.personalLife.livingSituation)
    ) {
        e.personalLife.livingSituation.hasRoommate &&
            t.context &&
            !t.context.includes("work") &&
            (a += "\n(You live with a roommate)");
    }
    if (e.npcStatus && !["chatting_player", "in_person_player"].includes(e.npcStatus.current)) {
        const t = e.npcStatus,
            n = t.richLabel || t.label,
            o = {
                sleeping:
                    "🌙 You are asleep right now. If you respond at all, be extremely groggy, confused, and very brief.",
                vampire_rest:
                    "⚰️ You are in daytime rest. The daylight feels oppressive. You are extremely sluggish and slow.",
                elf_trance: "🌿 You are in a meditative trance — dreamy, slightly detached, slower to engage.",
                angel_meditation: "✨ You are in deep meditation — serene, measured, unhurried in your response.",
                waking_up: "☀️ You just woke up. Groggy, still half-asleep, responses are slow and hazy.",
                at_gym: "🏋️ You are at the gym right now. Sweaty, catching a breath between sets. Keep it brief.",
                on_date: "💕 You are on a date. Be very brief — you're with someone and trying to be present.",
                in_meeting: "📊 You are in a meeting. Extremely brief responses only — quick texts between slides.",
                cooking: "🍳 You're in the middle of cooking. Distracted, arms probably busy, keep it short.",
                socializing: "🎉 You're out with friends. Background noise, casual energy, slightly distracted.",
                at_bar: "🍻 You're at a bar. Relaxed, social, maybe a drink in hand.",
                commuting: "🚶 You're commuting. Moving, keep responses brief — you're on your way somewhere.",
                night_shift: "⚡ You're on the night shift. Alert but the office is quiet and a little eerie.",
                sick: "🤒 You're sick today. Low energy, worn out, brief responses.",
                traveling: "✈️ You're traveling. Sporadic access, possibly jet-lagged or distracted.",
                on_vacation: "🏖️ You're on vacation. Relaxed, checked out from work, enjoying yourself.",
                working_late: "🌙 You're staying late at work. Tired but grinding through it.",
                walking_dog: "🐕 You're outside walking your dog right now.",
                vampire_hunt: "🧛 You're out in the night — what you're doing is your business. Mysterious, alert.",
            }[t.current];
        o && (a += `\n${o}`),
            (a += `\n📍 YOUR STATUS RIGHT NOW: ${n}`),
            (a +=
                "\nYou are fully aware of what you're doing. You can reference it naturally — mention it if asked, bring it up organically, or respond to questions about it directly.");
        const i = timeHelpers.getHour(),
            s = e.personality?.outgoing ?? 50,
            r = s > 65 ? 0 : s < 35 ? 22 : 23,
            l = e.schedule?.workEndHour ?? 17,
            c = gameState.time?.currentTime || Date.now(),
            d = t.lastUpdated && c - t.lastUpdated < 37e5;
        "at_work" === t.current &&
            i >= l - 1 &&
            (a += "\nYou're almost done for the day — starting to wrap up and thinking about leaving.");
        ["relaxing", "reading", "gaming", "having_dinner", "hobbies"].includes(t.current) &&
            i === (r - 1 + 24) % 24 &&
            (a +=
                "\nYou're starting to feel tired and winding down — you might mention getting sleepy or heading to bed soon."),
            d &&
                !["at_work", "relaxing", "sleeping"].includes(t.current) &&
                (a +=
                    "\nYou just transitioned to this activity recently — you can naturally mention what you just finished or just started.");
    }
    return a;
}
function getActivityTransitionContext(e) {
    if (!e.personalLife) return null;
    const t = gameState.time?.currentTime || Date.now(),
        n = timeHelpers.getHour(),
        a = timeHelpers.getMinute ? timeHelpers.getMinute() : new Date(t).getMinutes(),
        o = e.personalLife.previousActivity,
        i = e.personalLife.currentActivity,
        s = e.personalLife.transitionStartTime || 0;
    if (s && t - s < 18e5) {
        const e = o?.description || "your previous activity",
            n = i?.description || "something else";
        return Math.floor((t - s) / 6e4) < 10
            ? `🔄 TRANSITION: You're finishing up / wrapping up from: ${e}. You haven't started your next thing yet. You might be packing up, saying goodbye, heading out, or commuting. Don't suddenly act like you're already doing something new.`
            : `🔄 TRANSITION: You're heading to / getting ready for: ${n}. You just finished: ${e}. You're in transit, settling in, or just arriving. Ease into the new activity naturally - don't act like you've been doing it for hours.`;
    }
    if (!timeHelpers.isWeekend() && 16 === n && a >= 30)
        return "🔄 TRANSITION: The work day is winding down. You're wrapping up tasks, thinking about what you'll do after work. Don't suddenly switch to a personal activity - you're still at work but mentally transitioning.";
    if (!timeHelpers.isWeekend() && 17 === n && a <= 15) {
        const e = i?.description;
        return `🔄 TRANSITION: ${e ? `You just left work. Maybe heading home, maybe heading to: ${e}. You're commuting or just arriving - ease into it.` : "You just left work and are heading home or out. You're in commute/transition mode."}`;
    }
    return null;
}
window.resolveCompanyEvent = function (e, t) {
    const n = gameState.companyEvents.active.findIndex((t) => t.id === e && !t.resolved);
    if (-1 === n) return;
    const a = gameState.companyEvents.active[n],
        o = a.eventData.choices[t];
    if (gameState.cash < o.cost) return void showNotification("❌ Not enough cash!", "error");
    o.cost > 0 && (gameState.cash -= o.cost);
    const i = o.outcome;
    if ((i.effects && applyCompanyEventEffect(i.effects), i.employeeEffect)) {
        const e = a.involvedEmployees[0] ? gameState.employees.find((e) => e.id === a.involvedEmployees[0]) : null;
        e && applyEmployeeEventEffect(e, i.employeeEffect);
    }
    i.employeeEffects &&
        i.employeeEffects.forEach((e) => {
            const t = e.employee || gameState.employees.find((t) => t.id === e.employeeId);
            t && applyEmployeeEventEffect(t, e);
        }),
        i.delayedEffects && scheduleDelayedEffect(i.delayedEffects),
        i.delayedCost && scheduleDelayedCost(i.delayedCost, a.name),
        i.special && handleSpecialOutcome(i.special, a),
        (a.resolved = !0),
        (a.chosenOption = t),
        (a.outcomeText = i.text),
        gameState.companyEvents.history.unshift(a),
        gameState.companyEvents.active.splice(n, 1),
        gameState.companyEvents.history.length > 30 && gameState.companyEvents.history.pop();
    const s = document.getElementById("companyEventModal");
    s && s.remove(), showEventOutcomeModal(a, i), saveGame(!1);
};
let lastTimeDisplayValue = "";
function updateTimeDisplay() {
    const e = document.getElementById("game-time-display");
    if (e && gameState.time) {
        const t = timeHelpers.getFormattedDate(),
            n = timeHelpers.getFormattedTime(),
            a = timeHelpers.getTimeOfDay(),
            o = { morning: "🌅", afternoon: "☀️", evening: "🌆", night: "🌙" },
            i = gameState.time.activeContext || "idle",
            s = "function" == typeof getEffectiveTimeScale ? getEffectiveTimeScale() : gameState.time.timeScale,
            r = {
                conversation: { icon: "💬", label: "Chatting", color: "var(--l-green)" },
                group: { icon: "👥", label: "Group", color: "var(--l-indigo)" },
                social: { icon: "📱", label: "Browsing", color: "var(--l-cyan)" },
                idle: { icon: "", label: "", color: "" },
            },
            l = r[i] || r.idle,
            c = gameState.time.baseTimeScale || gameState.time.timeScale || 20,
            d =
                s < c && "idle" !== i
                    ? `<span style="margin-left:8px; background:${l.color}; color:var(--l-on-accent); padding:2px 6px; border-radius:10px; font-size:0.7rem; font-weight:600;">${l.icon} ${s}x <span style="text-decoration:line-through; opacity:0.6;">${c}x</span></span>`
                    : `<span style="margin-left:8px; background:var(--l-neutral-3); color:var(--text-dim); padding:2px 6px; border-radius:10px; font-size:0.7rem; font-weight:600;">${s}x</span>`,
            p = `${o[a]} ${t} ${n} ${i}`;
        if (p !== lastTimeDisplayValue) {
            (lastTimeDisplayValue = p),
                (e.innerHTML = `\n          <span>${o[a]} ${t}</span>\n          <span style="margin-left: 10px;">${n}</span>\n          ${d}\n        `);
            const i = document.getElementById("chatGameClock");
            i && (i.textContent = `${o[a]} ${t} ${n}`);
        }
    }
}
function generateEveningActivity(e) {
    if (!e.personalLife) return null;
    const t = e.personalLife.eveningPreferences;
    if (!t) return null;
    const n = timeHelpers.getHour();
    if (n < 17 || n >= 23) return null;
    const a = [];
    if (
        (Math.random() < t.gym && a.push({ type: "gym", weight: t.gym }),
        Math.random() < t.cooking && a.push({ type: "cooking", weight: t.cooking }),
        Math.random() < t.socializing && a.push({ type: "socializing", weight: t.socializing }),
        Math.random() < t.relaxing && a.push({ type: "relaxing", weight: t.relaxing }),
        Math.random() < t.hobbies &&
            e.personalLife.activeHobbies.length > 0 &&
            a.push({ type: "hobby", weight: t.hobbies }),
        Math.random() < t.dating &&
            e.personalLife.outsideContacts.inRelationship &&
            a.push({ type: "date", weight: t.dating }),
        0 === a.length)
    )
        return { type: "relaxing", details: "Chilling at home" };
    const o = a.reduce((e, t) => e + t.weight, 0);
    let i = Math.random() * o;
    for (const t of a) if (((i -= t.weight), i <= 0)) return generateActivityDetails(e, t.type);
    return { type: "relaxing", details: "Chilling at home" };
}
// Hobby name -> the skill an evening of it builds. First match wins; quiet solo hobbies
// (gardening, fishing, meditation...) build none.
const HOBBY_SKILLS = [
    [/chess|board game|strateg|debate|invest|reading|book/i, "management"],
    [/gam(e|ing)|puzzle|cod(e|ing)|tech|electronics/i, "technical"],
    [/sport|yoga|danc|climb|hik|run|cycl|swim|fitness|martial|ski|snowboard|surf|gym|sail/i, "fitness"],
    [/photo|paint|art|writ|music|craft|knit|theat|movie|film|design|draw|sing/i, "creative"],
    [/cook|bak/i, "cooking"],
    [/volunteer|travel|karaoke|club|party/i, "social"],
];
function generateActivityDetails(e, t) {
    const n = { type: t, description: "", skillGain: null };
    switch (t) {
        case "gym":
            const t = [
                "Hitting the gym 💪",
                "Cardio day at the gym",
                "Leg day (kill me now) 🦵",
                "Upper body workout",
                "Quick gym session",
                "Getting those gains 🏋️",
            ];
            (n.description = t[Math.floor(Math.random() * t.length)]), (n.skillGain = { skill: "fitness", xp: 5 });
            break;
        case "cooking":
            const a = [
                "Trying a new recipe tonight 👨‍🍳",
                "Cooking dinner from scratch",
                "Meal prepping for the week",
                "Experimenting in the kitchen",
                "Making my favorite dish",
                "Cooking up something special 🍳",
            ];
            (n.description = a[Math.floor(Math.random() * a.length)]), (n.skillGain = { skill: "cooking", xp: 5 });
            break;
        case "socializing":
            const o = [
                "Meeting friends for drinks 🍻",
                "Game night with the crew 🎮",
                "Dinner with friends",
                "Bar hopping tonight",
                "Catching up with old friends",
                "Girls night out! 💃",
            ];
            (n.description = o[Math.floor(Math.random() * o.length)]), (n.skillGain = { skill: "social", xp: 3 });
            break;
        case "relaxing":
            const i = [
                "Netflix and chill tonight 📺",
                "Just relaxing at home",
                "Reading a good book 📚",
                "Taking it easy tonight",
                "Couch potato mode activated",
                "Self-care evening 🛁",
            ];
            n.description = i[Math.floor(Math.random() * i.length)];
            break;
        case "hobby":
            if (e.personalLife.activeHobbies.length > 0) {
                const h = e.personalLife.activeHobbies,
                    t = h[Math.floor(Math.random() * h.length)];
                n.description = `Doing my ${t.name} hobby tonight`;
                // Most hobbies teach something now (only eight of the ~35 used to).
                const a = HOBBY_SKILLS.find(([re]) => re.test(t.name || ""))?.[1];
                a && (n.skillGain = { skill: a, xp: 4 });
            }
            break;
        case "date":
            const s = [
                "Date night! 😊",
                "Dinner and a movie date",
                "Romantic evening planned",
                "Going out with bae 💕",
                "Date night vibes",
            ];
            (n.description = s[Math.floor(Math.random() * s.length)]), (n.skillGain = { skill: "intimate", xp: 3 });
    }
    return n;
}
function generateWeekendPlans() {
    const e = timeHelpers.getDay();
    (5 !== e && 6 !== e) ||
        (gameState.employees.forEach((e) => {
            if (e.personalLife && e.personalLife.upcomingPlans) {
                if (((e.personalLife.upcomingPlans = []), Math.random() < 0.8)) {
                    const t = generateWeekendActivityType(e),
                        n = generateActivityDetails(e, t);
                    e.personalLife.upcomingPlans.push({
                        day: "Saturday",
                        activity: t,
                        details: n.description,
                        time: Math.random() < 0.5 ? "morning" : "afternoon",
                    });
                }
                if (Math.random() < 0.7) {
                    const t = ["relaxing", "hobby", "cooking"],
                        n = t[Math.floor(Math.random() * t.length)],
                        a = generateActivityDetails(e, n);
                    e.personalLife.upcomingPlans.push({
                        day: "Sunday",
                        activity: n,
                        details: a.description,
                        time: "afternoon",
                    });
                }
            }
        }),
        console.log("📅 Weekend plans generated for all employees"));
}
function generateWeekendActivityType(e) {
    const t = ["relaxing", "hobby", "socializing", "gym", "cooking"];
    return e && e.personalLife
        ? e.personalLife.activeHobbies && e.personalLife.activeHobbies.length > 0 && Math.random() < 0.4
            ? "hobby"
            : e.personalLife.outsideContacts && e.personalLife.outsideContacts.inRelationship && Math.random() < 0.3
              ? "date"
              : e.skills?.fitness?.level > 3 && Math.random() < 0.35
                ? "gym"
                : e.skills?.cooking?.level > 3 && Math.random() < 0.3
                  ? "cooking"
                  : t[Math.floor(Math.random() * t.length)]
        : t[Math.floor(Math.random() * t.length)];
}
const STATUS_LABEL_POOLS = {
        sleeping: ["🌙 Sleeping", "🌙 Asleep", "🌙 Dead to the World", "🌙 Out Cold", "🌙 Fast Asleep"],
        vampire_rest: ["⚰️ Resting", "⚰️ In Daytime Rest", "⚰️ Dormant"],
        elf_trance: ["🌿 In Trance", "🌿 Meditating", "🌿 In Deep Trance"],
        angel_meditation: ["✨ In Contemplation", "✨ Meditating", "✨ At Peace"],
        waking_up: ["☀️ Just Woke Up", "☀️ Waking Up", "😴 Barely Awake", "☀️ Morning Grogginess"],
        morning_routine: ["🚿 Getting Ready", "☕ Morning Coffee", "🧘 Morning Routine", "🚿 Starting the Day"],
        commuting: ["🚶 Commuting", "🚌 On the Bus", "🚗 Driving", "🚶 Heading In"],
        at_work: ["💼 At the Office", "💼 In the Building", "🏢 Working", "💼 On the Clock"],
        in_meeting: ["📊 In a Meeting", "🗣️ In a Meeting", "🤫 In a Meeting", "📊 Busy"],
        lunch_break: ["🥗 Lunch Break", "☕ Coffee Break", "🍽️ Grabbing Lunch", "🥗 On Lunch"],
        working_late: ["🌙 Working Late", "💼 Burning Midnight Oil", "🌙 Still at the Office"],
        work_from_home: ["💻 Working from Home", "🏠 WFH Today", "💻 Remote Day"],
        night_shift: ["⚡ Night Shift", "🌙 On the Clock (Night)", "⚡ Working Nights"],
        heading_home: ["🚶 Heading Home", "🚗 Driving Home", "🚶 Done for the Day"],
        at_gym: ["🏋️ At the Gym", "💪 Working Out", "🏋️ Hitting the Gym", "🏃 At the Gym"],
        yoga: ["🧘 At Yoga", "🧘 Yoga Class", "🧘 Stretching"],
        walking_dog: ["🐕 Walking the Dog", "🐾 Dog Walk", "🐕 Out with the Dog"],
        cooking: ["🍳 Cooking", "👨‍🍳 Making Dinner", "🍳 In the Kitchen", "🍝 Cooking Dinner"],
        having_dinner: ["🍽️ Having Dinner", "🥘 Dinner Time", "🍽️ Eating"],
        relaxing: ["📺 Relaxing", "🏠 Chilling", "🛋️ Vegging Out", "🏠 Unwinding", "📺 Taking It Easy"],
        reading: ["📚 Reading", "📖 Bookworm Mode", "📚 Lost in a Book"],
        gaming: ["🎮 Gaming", "🕹️ Playing Games", "🎮 Gaming Session"],
        hobbies: ["🎨 Creative Time", "🎵 Hobby Time", "🎨 Doing Art", "🎭 Working on a Project"],
        socializing: ["🎉 Out with Friends", "🎉 Socializing", "🎊 Out Tonight"],
        at_bar: ["🍻 At the Bar", "🥂 Happy Hour", "🍻 Drinks with Friends"],
        on_date: ["💕 On a Date", "❤️ Date Night", "🌹 On a Date", "💕 Out Tonight"],
        at_event: ["🎭 At an Event", "🎊 At a Party", "🎬 At a Show"],
        running_errands: ["🛒 Running Errands", "🏪 Out Shopping", "🛒 Errands"],
        traveling: ["✈️ Traveling", "🧳 On a Trip", "✈️ Away"],
        on_vacation: ["🏖️ On Vacation", "🌴 Vacation Mode", "🏖️ Away on Vacation"],
        sick: ["🤒 Feeling Sick", "🤧 Under the Weather", "🤒 Sick Day", "😷 Not Feeling Well"],
        vampire_hunt: ["🧛 Out for the Night", "🌙 Out Hunting", "🧛 Active"],
        chatting_player: ["💬 Chatting with You", "💬 Here with You"],
        in_person_player: ["🔥 With You Right Now", "🔥 Here in Person"],
    },
    RACE_SCHEDULE_OVERRIDES = {
        vampire: {
            sleepStatus: "vampire_rest",
            sleepWindow: [6, 18],
            wakeHour: 18,
            canWorkDaytime: !1,
            nightActivityBoost: { socializing: 0.3, at_bar: 0.3, vampire_hunt: 0.4 },
        },
        angel: {
            sleepStatus: "angel_meditation",
            sleepWindow: [23, 5],
            responsivenessDuringRest: 40,
            noSleepThrough: !0,
        },
        elf: {
            sleepStatus: "elf_trance",
            sleepWindow: [1, 5],
            wakeHour: 5,
            responsivenessDuringRest: 25,
            noSleepThrough: !0,
        },
        demon: {
            sleepWindow: [4, 11],
            wakeHour: 11,
            nightActivityBoost: { socializing: 0.2, at_event: 0.2, at_bar: 0.2 },
        },
    };
function pickStatusLabel(e) {
    const t = STATUS_LABEL_POOLS[e];
    return t && 0 !== t.length ? t[Math.floor(Math.random() * t.length)] : e;
}
function deriveEveningStatus(e, t, n, a, o) {
    const i = e.personalLife?.eveningPreferences || {},
        s = "dog" === e.personalLife?.livingSituation?.petType,
        r = e.personalLife?.outsideContacts?.inRelationship,
        l = e.personality?.outgoing ?? 50;
    if (n && t >= 6 && t < 10) return { current: "relaxing", label: "☕ Lazy Morning", responsiveness: 50 };
    if (n && t >= 10 && t < 14 && Math.random() < 0.35)
        return { current: "running_errands", label: pickStatusLabel("running_errands"), responsiveness: 50 };
    const c = [],
        d = (e, t) => {
            for (let n = 0; n < Math.round(t); n++) c.push(e);
        };
    if (
        (d("relaxing", 10 * (i.relaxing ?? 0.5)),
        d("hobbies", 10 * (i.hobbies ?? 0.3)),
        d("cooking", 10 * (i.cooking ?? 0.4)),
        d("having_dinner", 5 * (i.cooking ?? 0.4)),
        t >= 17 &&
            t < 21 &&
            (d("at_gym", 10 * (i.gym ?? 0.2)),
            s && d("walking_dog", 4),
            (e.hobbies || []).some((e) => /yoga|pilates/i.test(e)) && d("yoga", 3)),
        (l > 50 || n) &&
            (d("socializing", 10 * (i.socializing ?? 0.3)),
            d("at_bar", 5 * (i.socializing ?? 0.2)),
            d("at_event", 3 * (i.socializing ?? 0.3))),
        r && Math.random() < 0.25 && d("on_date", 4),
        a?.nightActivityBoost && Object.entries(a.nightActivityBoost).forEach(([e, t]) => d(e, 10 * t)),
        t >= o - 2 && t < o && (d("reading", 3), d("gaming", 2)),
        0 === c.length)
    )
        return { current: "relaxing", label: pickStatusLabel("relaxing"), responsiveness: 80 };
    const p = c[Math.floor(Math.random() * c.length)];
    return {
        current: p,
        label: pickStatusLabel(p),
        responsiveness:
            {
                at_gym: 40,
                yoga: 50,
                walking_dog: 60,
                cooking: 65,
                having_dinner: 70,
                relaxing: 80,
                reading: 75,
                gaming: 60,
                hobbies: 65,
                socializing: 55,
                at_bar: 50,
                on_date: 30,
                at_event: 45,
                running_errands: 50,
                vampire_hunt: 70,
            }[p] ?? 60,
    };
}
function computeNPCStatus(e) {
    const t = timeHelpers.getHour(),
        n = timeHelpers.getDay(),
        a = 0 === n || 6 === n,
        o = (e.race || "human").toLowerCase(),
        i = e.personality?.outgoing ?? 50;
    if (gameState.activeChat?.id === e.id && e.chatSettings?.scenarioContext)
        return { current: "in_person_player", label: pickStatusLabel("in_person_player"), responsiveness: 100 };
    if (gameState.activeChat?.id === e.id)
        return { current: "chatting_player", label: pickStatusLabel("chatting_player"), responsiveness: 100 };
    const s = (gameState.npcScheduledEvents || []).find(
        (t) => t.npcId === e.id && "triggered" === t.status && ["meet", "date", "call"].includes(t.type)
    );
    if (s) {
        const e = "date" === s.type ? "on_date" : "in_meeting";
        return { current: e, label: pickStatusLabel(e), responsiveness: 30 };
    }
    if (
        (e.flags?.systemFlags || []).some((e) => /sick|sickness/i.test(e.type)) ||
        (e.flags?.customFlags || []).some((e) => /sick/i.test(e.type))
    )
        return { current: "sick", label: pickStatusLabel("sick"), responsiveness: 20 };
    if (e.schedule?.isOnLeave)
        return { current: "on_vacation", label: pickStatusLabel("on_vacation"), responsiveness: 25 };
    const r = RACE_SCHEDULE_OVERRIDES[o] || {};
    if (r.sleepWindow) {
        const [e, n] = r.sleepWindow;
        if (e < n ? t >= e && t < n : t >= e || t < n) {
            const e = r.sleepStatus || "sleeping";
            return { current: e, label: pickStatusLabel(e), responsiveness: r.responsivenessDuringRest ?? 5 };
        }
    }
    const l = e.schedule?.shiftType || "day";
    if ("night" === l) {
        const n = e.schedule.workStartHour ?? 22,
            a = e.schedule.workEndHour ?? 6;
        if ((n > a ? t >= n || t < a : t >= n && t < a) && e.schedule.isCurrentlyWorking)
            return { current: "night_shift", label: pickStatusLabel("night_shift"), responsiveness: 65 };
        if (t >= a && t < a + 8)
            return { current: "sleeping", label: pickStatusLabel("sleeping"), responsiveness: 5 };
    }
    let c = i > 65 ? 0 : i < 35 ? 22 : 23,
        d = i > 65 ? 8 : i < 35 ? 6 : 7;
    if ((null != r.wakeHour && (d = r.wakeHour), r.sleepWindow && (c = r.sleepWindow[0]), !r.sleepWindow)) {
        if (c < d ? t >= c && t < d : t >= c || t < d)
            return { current: "sleeping", label: pickStatusLabel("sleeping"), responsiveness: 5 };
        if (t === d) return { current: "waking_up", label: pickStatusLabel("waking_up"), responsiveness: 30 };
    }
    const p = e.schedule?.workStartHour ?? 9,
        m = e.schedule?.workEndHour ?? 17,
        u = (e.schedule?.workDays || [1, 2, 3, 4, 5]).includes(n);
    if ("remote" === l && u && t >= p && t < m)
        return { current: "work_from_home", label: pickStatusLabel("work_from_home"), responsiveness: 70 };
    if (u && "day" === l && t >= d + 1 && t < p)
        return t === p - 1
            ? { current: "commuting", label: pickStatusLabel("commuting"), responsiveness: 40 }
            : { current: "morning_routine", label: pickStatusLabel("morning_routine"), responsiveness: 45 };
    if (u && "remote" !== l && t >= p && t < m) {
        return t === Math.floor((p + m) / 2)
            ? { current: "lunch_break", label: pickStatusLabel("lunch_break"), responsiveness: 80 }
            : { current: "at_work", label: pickStatusLabel("at_work"), responsiveness: 75 };
    }
    const g = e.career?.level || 1;
    return u && g >= 3 && t >= m && t < m + 2 && t < c && Math.random() < 0.15 * (g - 2)
        ? { current: "working_late", label: pickStatusLabel("working_late"), responsiveness: 55 }
        : u && t === m
          ? { current: "heading_home", label: pickStatusLabel("heading_home"), responsiveness: 55 }
          : deriveEveningStatus(e, t, a, r, c);
}
function getConversationActivityScore(e) {
    const t = gameState.chatHistory?.[e.id] || [],
        n = Date.now(),
        a = t.filter((e) => e.timestamp && n - e.timestamp < 12e5);
    return Math.min(100, 8 * a.length + Math.floor(a.reduce((e, t) => e + (t.content?.length || 0), 0) / 40));
}
function getNPCStatusBadgeHTML(e, t) {
    if (!e || !e.npcStatus) return "";
    t = t || {};
    const { label: n, responsiveness: a } = e.npcStatus,
        o = a < 20 ? "var(--l-neutral-5)" : a < 50 ? "var(--l-neutral-8)" : "var(--l-green)",
        // Token color by availability: active → positive, idle → dim, dormant/asleep → mute.
        tok = a < 20 ? "var(--text-mute)" : a < 50 ? "var(--text-dim)" : "var(--positive)";
    return "sm" === t.size
        ? `<span class="rost-status" style="color:${tok};">${n}</span>`
        : `<span style="display:inline-block; padding:2px 9px; border-radius:999px; font-size:0.78rem; background:${o}18; color:${o}; border:1px solid ${o}30;">${n}</span>`;
}
function updateAllNPCStatuses() {
    const e = gameState.time?.currentTime || Date.now(),
        t = timeHelpers.getHour();
    (gameState.employees || []).forEach((n) => {
        if ("active" !== n.employmentStatus) return;
        n.npcStatus || initializeEmployeeSocialData(n);
        const a = n.personality?.outgoing ?? 50,
            o = (n.race || "human").toLowerCase(),
            i = RACE_SCHEDULE_OVERRIDES[o] || {},
            s = i.sleepWindow?.[0] ?? (a > 65 ? 0 : a < 35 ? 22 : 23),
            r = (e - (n.npcStatus.sleepThroughDecidedAt || 0)) / 36e5;
        t === s &&
            r > 20 &&
            ((n.npcStatus.sleepThrough =
                !i.noSleepThrough && Math.random() < Math.max(0.05, 0.35 - 0.004 * (a - 50))),
            (n.npcStatus.sleepThroughDecidedAt = e));
        const l = getConversationActivityScore(n),
            c = computeNPCStatus(n);
        if (l >= 25 && ["sleeping", "heading_home", "vampire_rest", "waking_up"].includes(c.current))
            return void (
                gameState.activeChat?.id === n.id &&
                ((n.npcStatus.current = "chatting_player"),
                (n.npcStatus.label = pickStatusLabel("chatting_player")),
                (n.npcStatus.responsiveness = 90))
            );
        const d = n.npcStatus.current !== c.current;
        if (
            (d && ((n.npcStatus.richLabel = null), (n.npcStatus.richLabelStatus = null)),
            (n.npcStatus.current = c.current),
            (n.npcStatus.label = c.label),
            (n.npcStatus.responsiveness = c.responsiveness),
            (n.npcStatus.lastUpdated = e),
            d && gameState.activeChat?.id === n.id)
        ) {
            const e = document.getElementById("chatStatus");
            e &&
                !n.chatSettings?.scenarioContext &&
                ((e.innerHTML = getNPCStatusBadgeHTML(n)), (e.title = n.npcStatus.label));
        }
    });
}
function scheduleWakeUpResponse(e, t) {
    e?.npcStatus &&
        (e.npcStatus.pendingWakeUpResponses || (e.npcStatus.pendingWakeUpResponses = []),
        e.npcStatus.pendingWakeUpResponses.push({
            message: t,
            queuedAt: gameState.time?.currentTime || Date.now(),
        }));
}
function processMorningWakeUpResponses() {
    (gameState.employees || []).forEach((e) => {
        if ("active" !== e.employmentStatus) return;
        const t = e.npcStatus?.pendingWakeUpResponses;
        if (!t || 0 === t.length) return;
        const n = t[t.length - 1];
        e.npcStatus.pendingWakeUpResponses = [];
        const a = `You were asleep when the player messaged you last night: "${n.message}". You just woke up and noticed it. Respond like someone groggy but warm, just saw their notifications.`;
        setTimeout(
            async () => {
                try {
                    await sendProactiveNPCMessage(e, "morning_response", a);
                } catch (e) {}
            },
            3e3 + 8e3 * Math.random()
        );
    });
}
function tryEnrichStatusLabel(e) {
    if (!e?.npcStatus) return;
    if (e.npcStatus.richLabel && e.npcStatus.richLabelStatus === e.npcStatus.current) return;
    if (
        ["chatting_player", "in_person_player", "at_work", "relaxing", "sleeping", "vampire_rest"].includes(
            e.npcStatus.current
        )
    )
        return;
    const t = e.npcStatus.label,
        n = e.npcStatus.current,
        a = `You are ${e.name}. Your current status is "${t}". In 6-10 words describe what you're specifically doing right now in a casual personal way. No quotes no emojis just the description. Example: leg day completely dying right now`;
    generateText(a, { maxTokens: 30 })
        .then((a) => {
            if (a && e.npcStatus?.current === n) {
                // Leading emoji(s), whole: variation selectors, skin tones and ZWJ sequences
                // (🏋️‍♀️) included, so no stray U+FE0F/U+200D is left on the text.
                const o = t.match(
                        /^(?:\p{Extended_Pictographic}[\uFE0F\u{1F3FB}-\u{1F3FF}]*(?:\u200D\p{Extended_Pictographic}[\uFE0F\u{1F3FB}-\u{1F3FF}]*)*\s*)+/u
                    ),
                    i = o ? o[0].trim() : "",
                    s = a.trim().replace(/^["']|["']$/g, "");
                if (
                    ((e.npcStatus.richLabel = i ? `${i} ${s}` : s),
                    (e.npcStatus.richLabelStatus = n),
                    gameState.activeChat?.id === e.id)
                ) {
                    const t = document.getElementById("chatStatus");
                    t &&
                        !e.chatSettings?.scenarioContext &&
                        ((t.innerHTML = getNPCStatusBadgeHTML(e)), (t.title = e.npcStatus.richLabel));
                }
            }
        })
        .catch(() => {});
}
function updateEmployeeActivities() {
    const e = timeHelpers.getHour(),
        t = timeHelpers.isWeekend();
    gameState.employees.forEach((n) => {
        if (n.personalLife) {
            if (
                !t &&
                e >= 17 &&
                e < 23 &&
                (!n.personalLife.currentActivity || n.personalLife.activityStartTime < Date.now() - 36e5)
            ) {
                const t = generateEveningActivity(n);
                t &&
                    (n.personalLife.currentActivity
                        ? ((n.personalLife.previousActivity = { ...n.personalLife.currentActivity }),
                          (n.personalLife.transitionStartTime = gameState.time?.currentTime || Date.now()))
                        : 17 === e &&
                          ((n.personalLife.previousActivity = {
                              type: "work",
                              description: "Working at the office",
                          }),
                          (n.personalLife.transitionStartTime = gameState.time?.currentTime || Date.now())),
                    (n.personalLife.currentActivity = t),
                    (n.personalLife.activityStartTime = gameState.time.currentTime),
                    t.skillGain && gainSkillXP(n, t.skillGain.skill, t.skillGain.xp, "evening activity"));
            }
            if (t && e >= 10 && e < 20) {
                const e = 0 === timeHelpers.getDay() ? "Sunday" : "Saturday",
                    t = (n.personalLife.upcomingPlans || []).find((t) => t.day === e);
                if (t && !n.personalLife.currentActivity) {
                    if (
                        (n.personalLife.currentActivity &&
                            ((n.personalLife.previousActivity = { ...n.personalLife.currentActivity }),
                            (n.personalLife.transitionStartTime = gameState.time?.currentTime || Date.now())),
                        (n.personalLife.currentActivity = {
                            type: t.activity,
                            description: t.details,
                            skillGain: generateActivityDetails(n, t.activity).skillGain,
                        }),
                        (n.personalLife.activityStartTime = gameState.time.currentTime),
                        n.personalLife.currentActivity.skillGain)
                    ) {
                        const e = n.personalLife.currentActivity.skillGain;
                        gainSkillXP(n, e.skill, e.xp, "weekend activity");
                    }
                }
            }
            (e >= 23 || e < 6) && (n.personalLife.currentActivity = null);
        }
    });
}
function createActivityPost(e, t) {
    createSocialPost({
        authorId: e.id,
        authorName: e.name,
        type: "life_update",
        content: t.description,
        timestamp: gameState.time.currentTime,
        likes: [],
        comments: [],
        mentions: [],
    });
}
function buildCoworkerAwarenessContext(e, t) {
    if (!e || !t || e.id === t.id) return "";
    let n = "\n=== WHAT YOU KNOW ABOUT " + t.name.toUpperCase() + " ===\n";
    const a = e.relationships?.[t.id];
    if (
        (a && (n += `Your relationship: ${a.type || "coworker"} (strength: ${a.strength || 0})\n`),
        a &&
            a.strength > 40 &&
            t.personalLife?.currentActivity &&
            (n += `Current activity: ${t.personalLife.currentActivity.description}\n`),
        a && a.strength > 60 && t.personalLife?.upcomingPlans)
    ) {
        const e = t.personalLife.upcomingPlans;
        e.length > 0 && (n += `Weekend plans: ${e.map((e) => `${e.day} - ${e.details}`).join(", ")}\n`);
    }
    if (
        (void 0 !== t.schedule?.isCurrentlyWorking &&
            (n += `Work status: ${t.schedule.isCurrentlyWorking ? "Currently working" : "Off duty"}\n`),
        a && a.strength > 50 && t.skills)
    ) {
        const e = Object.entries(t.skills)
            .filter(([e, t]) => t.level >= 5)
            .sort((e, t) => t[1].level - e[1].level)
            .slice(0, 2);
        e.length > 0 && (n += `Known skills: ${e.map(([e, t]) => `${e} (Lv ${t.level})`).join(", ")}\n`);
    }
    if (a && a.strength > 70 && t.flags) {
        const e = t.flags.systemFlags.filter((e) => "high" === e.priority || "public" === e.category).slice(0, 2);
        e.length > 0 && (n += `You know: ${e.map((e) => e.playerDescription || e.key).join(", ")}\n`);
    }
    const o =
        gameState.gossip
            ?.filter((e) => e.involvedEmployees?.includes(t.id) && Date.now() - e.timestamp < 6048e5)
            .slice(0, 2) || [];
    o.length > 0 && (n += `Recent gossip: ${o.map((e) => e.description).join("; ")}\n`);
    const i = ["socializing", "at_bar", "at_event", "on_date"],
        s = e.npcStatus?.current,
        r = t.npcStatus?.current;
    return (
        i.includes(s) &&
            i.includes(r) &&
            a &&
            a.strength > 60 &&
            Math.random() < 0.25 &&
            (n += `You are both currently out at the same time (you: ${e.npcStatus.label}, them: ${t.npcStatus.label}). You might reference running into them or being at the same place.\n`),
        n
    );
}
function getRecentSocialContext(e, t = 5) {
    if (!gameState.socialFeed || 0 === gameState.socialFeed.length) return "";
    let n = "\n=== RECENT OFFICE SOCIAL POSTS ===\n";
    const a = gameState.socialFeed.filter((e) => gameState.time.currentTime - e.timestamp < 864e5).slice(0, t);
    return 0 === a.length
        ? ""
        : (a.forEach((e) => {
              const t = gameState.employees.find((t) => t.id === e.authorId),
                  a = t?.name || e.authorName || "Unknown";
              (n += `${a}: "${e.content.substring(0, 100)}${e.content.length > 100 ? "..." : ""}"\n`),
                  e.likes?.length > 0 &&
                      ((n += `  (${e.likes.length} likes`),
                      e.comments?.length > 0 && (n += `, ${e.comments.length} comments`),
                      (n += ")\n"));
          }),
          n);
}
function shouldMentionCoworkerActivity(e, t, n) {
    if (!e || !t || !n) return !1;
    if (e.id === n.id || t.id === n.id) return !1;
    const a = e.relationships?.[n.id];
    if (!a || a.strength < 40) return !1;
    if (!n.personalLife?.currentActivity) return !1;
    return (
        0 !==
            (
                gameState.socialFeed?.filter(
                    (e) => e.authorId === n.id && gameState.time.currentTime - e.timestamp < 36e5
                ) || []
            ).length && Math.random() < 0.1
    );
}
function getOfficeDynamicsSummary() {
    const e = gameState.employees.filter((e) => e.schedule?.isCurrentlyWorking);
    if (0 === e.length) return "\n=== OFFICE DYNAMICS ===\nNobody else is in the office right now.\n";
    let t = "\n=== OFFICE DYNAMICS ===\n";
    t += `${e.length} people currently working in the office.\n`;
    const n = e
        .filter((e) => e.personalLife?.currentActivity)
        .map((e) => ({ name: e.name, activity: e.personalLife.currentActivity.type }));
    if (n.length > 2) {
        const e = {};
        n.forEach((t) => {
            e[t.activity] = (e[t.activity] || 0) + 1;
        });
        const a = Object.entries(e)
            .filter(([e, t]) => t >= 2)
            .map(([e]) => e);
        a.length > 0 && (t += `Common theme: Several people are doing ${a[0]} activities.\n`);
    }
    const a = gameState.socialFeed?.slice(0, 10) || [],
        o = a.filter(
            (e) =>
                "achievement" === e.type ||
                "celebration" === e.type ||
                e.content.includes("😊") ||
                e.content.includes("🎉")
        ).length,
        i = a.filter(
            (e) =>
                "complaint" === e.type ||
                "tea_spilling" === e.type ||
                e.content.includes("😤") ||
                e.content.includes("😢")
        ).length;
    return (
        o > 2 * i
            ? (t += "Office mood: Generally positive and upbeat.\n")
            : i > 2 * o && (t += "Office mood: Some tension or complaints recently.\n"),
        t
    );
}
