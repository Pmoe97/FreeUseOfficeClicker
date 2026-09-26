// ============================================================================
// 40-stories — Stories bar: autonomous stories, story viewer, reactions, for-you scoring, polls, feed sorting.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

const STORY_TEMPLATES = {
    morning: [
        { text: "Coffee time ☕", emoji: "☕", bg: "linear-gradient(135deg, #6b4226, #8B6914)" },
        { text: "Barely alive 😴", emoji: "😴", bg: "linear-gradient(135deg, var(--l-slate), var(--l-ink-slate))" },
        { text: "Monday mood", emoji: "😩", bg: "linear-gradient(135deg, var(--l-line), var(--l-panel-2))" },
        { text: "Rise and grind 💪", emoji: "💪", bg: "linear-gradient(135deg, var(--l-red), var(--l-pink))" },
        { text: "Morning traffic 🚗", emoji: "🚗", bg: "linear-gradient(135deg, var(--l-ink-slate), var(--l-slate))" },
        { text: "Need caffeine stat", emoji: "☕", bg: "linear-gradient(135deg, var(--l-indigo-dark), #5f27cd)" },
        { text: "Beautiful sunrise today 🌅", emoji: "🌅", bg: "linear-gradient(135deg, var(--l-yellow), var(--l-red))" },
        { text: "Woke up late again 😅", emoji: "⏰", bg: "linear-gradient(135deg, var(--l-red), var(--l-pink))" },
        { text: "Breakfast of champions 🥞", emoji: "🥞", bg: "linear-gradient(135deg, var(--l-orange-4), var(--l-amber))" },
        { text: "Early bird gets the worm", emoji: "🐦", bg: "linear-gradient(135deg, var(--l-green-2), var(--l-green-lt-2))" },
        { text: "Alarm didn't go off 🙃", emoji: "🙃", bg: "linear-gradient(135deg, var(--l-red-2), #e17055)" },
        { text: "Smooth jazz & morning tea", emoji: "🍵", bg: "linear-gradient(135deg, var(--l-violet-deep), var(--l-violet-lt))" },
        { text: "Gym before work 💪", emoji: "🏃", bg: "linear-gradient(135deg, var(--l-red), var(--l-red-2))" },
        { text: "Dog walk at dawn 🐕", emoji: "🐕", bg: "linear-gradient(135deg, var(--l-green-2), var(--l-teal-2))" },
        { text: "Forgot my lunch 😭", emoji: "😭", bg: "linear-gradient(135deg, var(--l-ink-slate), var(--l-ink-cool-2))" },
        { text: "Perfect hair day ✨", emoji: "💇", bg: "linear-gradient(135deg, var(--l-pink-lt), var(--l-pink-2))" },
    ],
    work: [
        { text: "Another meeting 📊", emoji: "📊", bg: "linear-gradient(135deg, #0c3483, #a2b6df)" },
        { text: "Desk selfie 🤳", emoji: "🤳", bg: "linear-gradient(135deg, var(--l-indigo), var(--l-indigo-deep))" },
        { text: "Lunch break!", emoji: "🍱", bg: "linear-gradient(135deg, var(--l-yellow), var(--l-orange-4))" },
        { text: "Boss vibes today 😎", emoji: "😎", bg: "linear-gradient(135deg, var(--l-line), var(--l-purple-deep))" },
        { text: "Productivity: 📈", emoji: "📈", bg: "linear-gradient(135deg, var(--l-green), var(--l-green-2))" },
        { text: "Office drama already??", emoji: "🍿", bg: "linear-gradient(135deg, var(--l-red), var(--l-pink))" },
        { text: "Just got a raise!! 🤑", emoji: "🤑", bg: "linear-gradient(135deg, var(--l-green-2), var(--l-green-lt-2))" },
        { text: "Work friends > everything", emoji: "💼", bg: "linear-gradient(135deg, var(--l-violet-deep), var(--l-violet-lt))" },
        { text: "Free donuts in the kitchen", emoji: "🍩", bg: "linear-gradient(135deg, var(--l-orange-4), var(--l-yellow))" },
        { text: "This email could've been a text", emoji: "📧", bg: "linear-gradient(135deg, var(--l-ink-slate), var(--l-slate))" },
        { text: "Printer jammed again 🖨️", emoji: "🖨️", bg: "linear-gradient(135deg, var(--l-red-2), var(--l-ink-slate))" },
        { text: "New desk setup ✨", emoji: "🖥️", bg: "linear-gradient(135deg, var(--l-teal-2), var(--l-blue-2))" },
        { text: "Power nap in the break room", emoji: "😴", bg: "linear-gradient(135deg, var(--l-slate), var(--l-ink-slate))" },
        { text: "Happy hour countdown ⏰", emoji: "🍻", bg: "linear-gradient(135deg, var(--l-yellow), var(--l-red))" },
        { text: "Crushed my presentation!", emoji: "🎤", bg: "linear-gradient(135deg, var(--l-green-2), var(--l-green-lt-2))" },
        { text: "Overtime again 😮‍💨", emoji: "😮‍💨", bg: "linear-gradient(135deg, var(--l-slate), var(--l-line))" },
    ],
    mood: [
        { text: "Feeling great 😊", emoji: "😊", bg: "linear-gradient(135deg, var(--l-green-2), var(--l-green-lt-2))" },
        { text: "Vibing ✨", emoji: "✨", bg: "linear-gradient(135deg, var(--l-violet-lt), var(--l-violet-deep))" },
        { text: "Not today 😤", emoji: "😤", bg: "linear-gradient(135deg, var(--l-red), var(--l-red-2))" },
        { text: "Feeling myself 💅", emoji: "💅", bg: "linear-gradient(135deg, var(--l-pink-lt), var(--l-pink-2))" },
        { text: "Sleepy hours 💤", emoji: "💤", bg: "linear-gradient(135deg, var(--l-slate), var(--l-ink-slate))" },
        { text: "Bored", emoji: "😐", bg: "linear-gradient(135deg, var(--l-ink-slate), var(--l-ink-cool-2))" },
        { text: "Grateful today 🙏", emoji: "🙏", bg: "linear-gradient(135deg, var(--l-yellow), #fdcb6e)" },
        { text: "Living my best life", emoji: "🌟", bg: "linear-gradient(135deg, var(--l-red), var(--l-yellow))" },
        { text: "Main character energy", emoji: "👑", bg: "linear-gradient(135deg, var(--l-yellow), var(--l-orange-4))" },
        { text: "Stressed but blessed", emoji: "🫠", bg: "linear-gradient(135deg, var(--l-ink-slate), var(--l-green-2))" },
        { text: "Serotonin boost 🌈", emoji: "🌈", bg: "linear-gradient(135deg, var(--l-pink-2), var(--l-yellow))" },
        { text: "Feeling unstoppable 🔥", emoji: "🔥", bg: "linear-gradient(135deg, var(--l-red), var(--l-red-2))" },
        { text: "Peaceful evening 🌆", emoji: "🌆", bg: "linear-gradient(135deg, var(--l-line), var(--l-red))" },
        { text: "Missing someone 💭", emoji: "💭", bg: "linear-gradient(135deg, var(--l-ink-slate), var(--l-violet-lt))" },
        { text: "Chaotic energy today", emoji: "🤪", bg: "linear-gradient(135deg, var(--l-violet-deep), var(--l-red))" },
        { text: "No thoughts, head empty", emoji: "🧠", bg: "linear-gradient(135deg, var(--l-ink-cool-2), var(--l-ink-slate))" },
    ],
    activity: [
        { text: "Gym time! 🏋️", emoji: "🏋️", bg: "linear-gradient(135deg, var(--l-red), var(--l-red-2))" },
        { text: "Cooking something yummy 🍳", emoji: "🍳", bg: "linear-gradient(135deg, var(--l-orange-4), var(--l-yellow))" },
        { text: "Movie night 🎬", emoji: "🎬", bg: "linear-gradient(135deg, var(--l-slate), var(--l-ink-slate))" },
        { text: "Gaming session 🎮", emoji: "🎮", bg: "linear-gradient(135deg, var(--l-violet-deep), var(--l-violet-lt))" },
        { text: "Shopping haul incoming! 🛍️", emoji: "🛍️", bg: "linear-gradient(135deg, var(--l-pink-lt), var(--l-pink-2))" },
        { text: "Reading vibes 📚", emoji: "📚", bg: "linear-gradient(135deg, var(--l-indigo-dark), #5f27cd)" },
        { text: "Wine o'clock 🍷", emoji: "🍷", bg: "linear-gradient(135deg, var(--l-plum), #b83280)" },
        { text: "Beach day! 🏖️", emoji: "🏖️", bg: "linear-gradient(135deg, var(--l-green-2), var(--l-teal-2))" },
        { text: "Yoga & chill 🧘", emoji: "🧘", bg: "linear-gradient(135deg, var(--l-violet-lt), #dfe6e9)" },
        { text: "Late night walk 🌙", emoji: "🌙", bg: "linear-gradient(135deg, #0c3483, var(--l-slate))" },
        { text: "Trying a new recipe 👩‍🍳", emoji: "👩‍🍳", bg: "linear-gradient(135deg, var(--l-orange-4), var(--l-green-2))" },
        { text: "Karaoke night! 🎤", emoji: "🎤", bg: "linear-gradient(135deg, var(--l-pink-2), var(--l-violet-deep))" },
        { text: "Road trip vibes 🛣️", emoji: "🛣️", bg: "linear-gradient(135deg, var(--l-blue-2), var(--l-teal-2))" },
        { text: "Painting something 🎨", emoji: "🎨", bg: "linear-gradient(135deg, var(--l-pink-2), var(--l-yellow))" },
        { text: "Sunday brunch 🥂", emoji: "🥂", bg: "linear-gradient(135deg, var(--l-yellow), var(--l-pink-lt))" },
        { text: "Cleaning spree 🧹", emoji: "🧹", bg: "linear-gradient(135deg, var(--l-teal-2), var(--l-blue-2))" },
    ],
    nsfw: [
        { text: "Feeling bold tonight 🔥", emoji: "🔥", bg: "linear-gradient(135deg, var(--l-red), var(--l-red-2))" },
        { text: "Can't sleep 😏", emoji: "😏", bg: "linear-gradient(135deg, var(--l-plum), var(--l-red))" },
        { text: "Bath time 🛁", emoji: "🛁", bg: "linear-gradient(135deg, var(--l-pink-lt), var(--l-pink-2))" },
        { text: "New lingerie 👙", emoji: "👙", bg: "linear-gradient(135deg, var(--l-red), var(--l-pink))" },
        { text: "Spicy night 🌶️", emoji: "🌶️", bg: "linear-gradient(135deg, var(--l-red-2), var(--l-red))" },
        { text: "DM me 💋", emoji: "💋", bg: "linear-gradient(135deg, var(--l-red), var(--l-pink-lt))" },
        { text: "After midnight vibes 🌙", emoji: "🌙", bg: "linear-gradient(135deg, var(--l-slate), var(--l-red))" },
        { text: "Just got out of the shower 💦", emoji: "💦", bg: "linear-gradient(135deg, var(--l-green-2), var(--l-teal-2))" },
        { text: "Bedroom eyes 👀", emoji: "👀", bg: "linear-gradient(135deg, var(--l-plum), var(--l-indigo-dark))" },
        { text: "Mirror selfie 🪞", emoji: "🪞", bg: "linear-gradient(135deg, var(--l-pink-2), var(--l-pink-lt))" },
        { text: "Silk sheets kinda night", emoji: "🛏️", bg: "linear-gradient(135deg, var(--l-indigo-dark), var(--l-red))" },
        { text: "Mood: 🔥🔥🔥", emoji: "🔥", bg: "linear-gradient(135deg, var(--l-red-2), var(--l-plum))" },
        { text: "Wine + candles = ♥️", emoji: "🕯️", bg: "linear-gradient(135deg, var(--l-plum), var(--l-red))" },
        { text: "Thinking about you...", emoji: "💭", bg: "linear-gradient(135deg, var(--l-red), var(--l-indigo-dark))" },
        { text: "Late night confession", emoji: "🤫", bg: "linear-gradient(135deg, var(--l-slate), var(--l-red))" },
        { text: "Red lips tonight 💄", emoji: "💄", bg: "linear-gradient(135deg, var(--l-red-2), var(--l-pink-2))" },
    ],
    reaction: [
        { text: "WHAT just happened 😱", emoji: "😱", bg: "linear-gradient(135deg, var(--l-red), var(--l-pink))" },
        { text: "I'm screaming 😂", emoji: "😂", bg: "linear-gradient(135deg, var(--l-yellow), var(--l-orange-4))" },
        { text: "No way...", emoji: "😳", bg: "linear-gradient(135deg, var(--l-ink-slate), var(--l-slate))" },
        { text: "Obsessed rn", emoji: "🥰", bg: "linear-gradient(135deg, var(--l-pink-lt), var(--l-pink-2))" },
        { text: "This is NOT okay", emoji: "😡", bg: "linear-gradient(135deg, var(--l-red-2), var(--l-red))" },
        { text: "Best day ever!! 🎉", emoji: "🎉", bg: "linear-gradient(135deg, var(--l-green-2), var(--l-yellow))" },
        { text: "Plot twist 🤯", emoji: "🤯", bg: "linear-gradient(135deg, var(--l-violet-deep), var(--l-red))" },
        { text: "I can't even 💀", emoji: "💀", bg: "linear-gradient(135deg, var(--l-slate), var(--l-ink-slate))" },
        { text: "OMG you guys...", emoji: "🙊", bg: "linear-gradient(135deg, var(--l-pink-2), var(--l-pink-lt))" },
        { text: "Did that just happen??", emoji: "😲", bg: "linear-gradient(135deg, var(--l-blue-2), var(--l-teal-2))" },
        { text: "Bruh.", emoji: "🗿", bg: "linear-gradient(135deg, var(--l-ink-slate), var(--l-ink-cool-2))" },
        { text: "Crying happy tears 🥹", emoji: "🥹", bg: "linear-gradient(135deg, var(--l-green-2), var(--l-violet-lt))" },
    ],
    ama: [
        { text: "Ask me anything! 🤔", emoji: "❓", bg: "linear-gradient(135deg, var(--l-indigo), var(--l-indigo-deep))" },
        { text: "Bored, send questions", emoji: "💬", bg: "linear-gradient(135deg, #0c3483, #a2b6df)" },
        { text: "Truth or dare? 😈", emoji: "😈", bg: "linear-gradient(135deg, var(--l-red), var(--l-plum))" },
        { text: "Rate my fit? 👗", emoji: "👗", bg: "linear-gradient(135deg, var(--l-pink-lt), var(--l-pink-2))" },
        { text: "Hot takes only 🌡️", emoji: "🌡️", bg: "linear-gradient(135deg, var(--l-red-2), var(--l-red))" },
        { text: "Spill the tea ☕", emoji: "☕", bg: "linear-gradient(135deg, #6b4226, var(--l-red))" },
        { text: "Confessions? 🫣", emoji: "🫣", bg: "linear-gradient(135deg, var(--l-indigo-dark), var(--l-pink-2))" },
        { text: "Would you rather...?", emoji: "🤷", bg: "linear-gradient(135deg, var(--l-blue-2), var(--l-violet-deep))" },
    ],
};
function generateAutonomousStories() {
    initStories();
    const e = Date.now();
    if (e - (gameState.socialNetwork.lastStoryGen || 0) < 12e4 + 12e4 * Math.random()) return;
    (gameState.socialNetwork.lastStoryGen = e),
        (gameState.socialNetwork.stories = gameState.socialNetwork.stories.filter((t) => e - t.createdAt < 36e5));
    const t = gameState.employees.filter((e) => "active" === e.employmentStatus);
    if (0 !== t.length) {
        for (const n of t) {
            if (gameState.socialNetwork.stories.some((e) => e.authorId === n.id)) continue;
            const t = 0.08 * (n.social?.postFrequency || 0.5) * (0.5 + (n.personality?.outgoing || 50) / 100);
            if (Math.random() > t) continue;
            const a = ["morning", "work", "mood", "activity", "reaction"],
                o = n.stats?.desire || 0,
                i = n.memory?.intimacyLevel || 0,
                s = n.personality?.flirty || 50;
            let r;
            !isSFWMode() && (o > 60 || i > 50 || s > 70) && (a.push("nsfw"), (o > 80 || i > 70) && a.push("nsfw")),
                Math.random() < 0.15 && a.push("ama");
            const l = n.personalLife?.currentActivity;
            r = l && Math.random() < 0.6 ? "activity" : a[Math.floor(Math.random() * a.length)];
            const c = STORY_TEMPLATES[r] || STORY_TEMPLATES.mood,
                d = "_usedStoryTemplates";
            gameState.socialNetwork[d] || (gameState.socialNetwork[d] = {}),
                gameState.socialNetwork[d][r] || (gameState.socialNetwork[d][r] = []);
            const p = gameState.socialNetwork[d][r];
            let m = c.filter((e) => !p.includes(e.text));
            0 === m.length && ((gameState.socialNetwork[d][r] = []), (m = c));
            let u = m[Math.floor(Math.random() * m.length)];
            p.push(u.text);
            const g = Math.floor(0.6 * c.length);
            p.length > g && p.shift();
            let h = u.text;
            if (l && "activity" === r) {
                const e = l.description || l.name || "";
                e && (h = e.substring(0, 40));
            }
            const y = {
                id: "story_" + ++gameState.socialNetwork.storyIdCounter,
                authorId: n.id,
                authorName: n.name,
                authorImage: n.profileImage || null,
                text: h,
                emoji: u.emoji,
                bg: u.bg,
                category: r,
                createdAt: e,
                expiresAt: e + 36e5,
                viewedByPlayer: !1,
                reactions: [],
            };
            gameState.socialNetwork.stories.push(y), debugLog("Stories", `${n.name} posted a story: "${h}"`);
            ("nsfw" === r ||
                ("mood" === r && Math.random() < 0.4) ||
                ("activity" === r && Math.random() < 0.35) ||
                ("work" === r && Math.random() < 0.25) ||
                ("morning" === r && Math.random() < 0.2) ||
                (i > 40 && Math.random() < 0.5) ||
                (o > 50 && Math.random() < 0.5)) &&
                ((y._imageRequested = !0),
                generateStoryImage(y, n, r).catch((e) => {
                    console.warn(`[Stories] Image generation failed for ${n.name}'s story:`, e);
                })),
                (i > 50 || o > 60) &&
                    addSocialNotification({
                        type: "story",
                        fromId: n.id,
                        fromName: n.name,
                        postId: null,
                        preview: h,
                        targetAuthorId: "player",
                    });
        }
        "social" === gameState.activeTab && renderStoriesBar();
    }
}
async function generateStoryImage(e, t, n) {
    try {
        const a =
                "function" == typeof getPhysicalDescriptionForPrompt
                    ? getPhysicalDescriptionForPrompt(t)
                    : `${t.name}, ${t.gender || "woman"}, ${t.age || 25} years old`,
            o = (t.name, (t.personalityTraits || []).slice(0, 3).join(", "), t.physical?.fashion || "casual");
        t.stats?.affection > 70 || t.stats;
        let i = "",
            s = "",
            r = "smartphone selfie, vertical 9:16 portrait, candid social media story";
        switch (n) {
            case "nsfw":
                isSFWMode()
                    ? ((i =
                          "Flirty selfie, stylish outfit showing personality. Confident pose with a coy smile, warm lighting."),
                      (s = "flirty, confident, attractive"))
                    : ((i =
                          "Intimate selfie in a private setting (bedroom, bathroom mirror, dim lighting). Wearing revealing or minimal clothing. Provocative but tasteful pose, seductive expression, warm ambient lighting."),
                      (s = "sultry, confident, playful"));
                break;
            case "morning":
                (i =
                    "Morning scene — natural golden-hour sunlight streaming through a window. Casual morning look: messy hair, cozy pajamas or oversized shirt. Holding a coffee mug or stretching. Bedroom or kitchen background with soft warm tones."),
                    (s = "sleepy, cozy, natural, warm");
                break;
            case "work":
                (i = `Modern office selfie — sitting at a desk or standing in a bright open-plan office. Professional-casual ${o} outfit. Computer screens, plants, or whiteboards visible in the background.`),
                    (s = "professional, focused, approachable");
                break;
            case "mood":
                (i = `Expressive selfie that captures the mood "${e.text}". Face fills most of the frame, dramatic expression. Background is slightly blurred.`),
                    (s =
                        e.text.includes("great") || e.text.includes("best")
                            ? "joyful, radiant"
                            : e.text.includes("Not") || e.text.includes("😤")
                              ? "annoyed, intense"
                              : e.text.includes("Sleepy") || e.text.includes("💤")
                                ? "drowsy, peaceful"
                                : "expressive, authentic");
                break;
            case "activity":
                const t = {
                        Gym: "at a gym, athletic wear, exercise equipment visible, energetic pose",
                        Cook: "in a kitchen, colorful ingredients on counter, apron, warm lighting",
                        Movie: "cozy couch setup with a TV glow, blanket, snacks, dim room",
                        Gaming: "at a gaming setup with RGB lighting, headset around neck, screen glow",
                        Shopping: "in a bright store or mall, holding shopping bags, mirror selfie",
                        Reading: "curled up with a book, cozy chair, warm lamp light, glasses",
                    },
                    n = Object.keys(t).find((t) => e.text.includes(t));
                (i = n ? t[n] : `Doing an activity: ${e.text}. Candid photo in an appropriate setting.`),
                    (s = "energetic, engaged, having fun");
                break;
            case "reaction":
                (i = `Close-up reaction face matching "${e.text}". Wide eyes or exaggerated expression, slightly blurred background.`),
                    (s = "dramatic, surprised, animated");
                break;
            case "ama":
                (i =
                    "Casual selfie for a Q&A story. Relaxed pose, looking directly at camera with an inviting expression. Simple clean background."),
                    (s = "approachable, relaxed, open");
                break;
            default:
                (i = `Casual social media selfie, authentic and candid. ${o} style outfit, natural setting.`),
                    (s = "casual, genuine");
        }
        const l = `${a.substring(0, 600)}. ${i} Mood: ${s}. ${r}, natural phone-camera depth of field, high quality, sharp focus, detailed face`;
        gameState.settings?.debugMode && console.log(`[Stories] Generating image for ${t.name}'s story...`);
        const c = await queuedGenerateImage(
            "function" == typeof applyImageStyle ? applyImageStyle(l) : l,
            `Story image - ${t.name}: ${e.text}`
        );
        if (c) {
            const n = gameState.socialNetwork?.stories?.find((t) => t.id === e.id);
            if (n) {
                (n.imageUrl = c),
                    console.log(`[Stories] ✅ Image generated for ${t.name}'s story`),
                    "social" === gameState.activeTab && renderStoriesBar();
                const a = $("storyViewer");
                if (a && a.dataset.storyId === e.id) {
                    const e = a.querySelector(".story-blur-bg");
                    e && (e.style.backgroundImage = `url(${c})`);
                    const t = a.querySelector(".story-sharp-img");
                    t && ((t.src = c), (t.style.display = "block"));
                    const n = a.querySelector(".story-loading-indicator");
                    n && (n.style.display = "none");
                }
            }
        }
    } catch (t) {
        console.warn(`[Stories] Image generation error for story ${e.id}:`, t);
    }
}
let _lastStoriesFingerprint = "";
function renderStoriesBar() {
    initStories();
    const e = $("storiesBar");
    if (!e) return;
    const t = gameState.socialNetwork.stories || [];
    if (0 === t.length) return (_lastStoriesFingerprint = ""), void (e.style.display = "none");
    const n = t.map((e) => e.id + (e.viewedByPlayer ? "v" : "") + (e.imageUrl ? "i" : "")).join("|");
    if (n === _lastStoriesFingerprint) return;
    (_lastStoriesFingerprint = n), (e.style.display = "block");
    const a = [...t].sort((e, t) =>
        e.viewedByPlayer !== t.viewedByPlayer ? (e.viewedByPlayer ? 1 : -1) : t.createdAt - e.createdAt
    );
    e.innerHTML = a
        .map((e) => {
            const t = gameState.employees.find((t) => t.id === e.authorId),
                n =
                    e.authorImage ||
                    t?.profileImage ||
                    placeholderImage(56, 56, (e.authorName || "?")[0]),
                a = e.viewedByPlayer,
                o = e.authorName?.split(" ")[0] || "NPC";
            return `\n        <div class="story-avatar" onclick="openStoryViewer('${e.id}')">\n          <div class="story-avatar-ring ${a ? "viewed" : ""}">\n            <img src="${n}" alt="${e.authorName}">\n          </div>\n          <span class="story-avatar-name">${o}</span>\n        </div>\n      `;
        })
        .join("");
}
function openStoryViewer(e) {
    initStories();
    const t = gameState.socialNetwork.stories.find((t) => t.id === e);
    if (!t) return;
    t.viewedByPlayer = !0;
    const n = gameState.employees.find((e) => e.id === t.authorId),
        a = t.authorImage || n?.profileImage || placeholderImage(56, 56, (t.authorName || "?")[0]),
        o = window.innerWidth <= 768,
        i = document.createElement("div");
    (i.id = "storyViewer"),
        (i.dataset.storyId = e),
        (i.style.cssText =
            "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-95); z-index:99999; display:flex; align-items:center; justify-content:center;");
    const s = !!t.imageUrl,
        r = !s && t._imageRequested,
        l = !(!n?.profileImage && !t.authorImage),
        c = t.authorImage || n?.profileImage || "";
    let d = t.bg,
        p = "";
    s
        ? ((d = "background-color: var(--l-bg-black);"),
          (p =
              "background: linear-gradient(to bottom, var(--l-veil-30) 0%, var(--l-veil-05) 30%, var(--l-veil-05) 60%, var(--l-veil-60) 100%);"))
        : l &&
          ((d = `background-image: url(${c}); background-size: cover; background-position: center top;`),
          (p =
              "background: linear-gradient(to bottom, var(--l-veil-40) 0%, var(--l-veil-15) 30%, var(--l-veil-15) 60%, var(--l-veil-70) 100%); backdrop-filter: blur(8px);")),
        (i.innerHTML = `\n      <div class="story-image-bg" style="width:${o ? "100%" : "400px"}; max-width:100%; height:${o ? "100%" : "700px"}; max-height:${o ? "100%" : "90vh"}; border-radius:${o ? "0" : "16px"}; overflow:hidden; position:relative; ${d}; display:flex; flex-direction:column;">\n        ${s ? `\n        \x3c!-- Blurred fill layer (prevents black bars) --\x3e\n        <div style="position:absolute; top:0; left:0; right:0; bottom:0; background-image:url(${t.imageUrl}); background-size:cover; background-position:center; filter:blur(25px) brightness(0.5); transform:scale(1.1); z-index:0;"></div>\n        \x3c!-- Sharp contained image layer --\x3e\n        <img src="${t.imageUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:contain; z-index:0; image-rendering:-webkit-optimize-contrast;">\n        ` : ""}\n        \x3c!-- Dark overlay for text readability --\x3e\n        <div style="position:absolute; top:0; left:0; right:0; bottom:0; ${p || t.bg + ";"} z-index:1;"></div>\n        ${r ? '\n        \x3c!-- Loading indicator for pending image --\x3e\n        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:1; text-align:center;">\n          <div style="font-size:2rem; animation:spin 1.5s linear infinite;">🎨</div>\n          <div style="color:var(--l-sheen-60); font-size:0.8rem; margin-top:8px;">Generating image...</div>\n        </div>\n        ' : ""}\n        \n        \x3c!-- Progress bar --\x3e\n        <div style="position:absolute; top:0; left:0; right:0; height:3px; background:var(--l-sheen-20); z-index:3;">\n          <div id="storyProgress" style="height:100%; background:var(--l-ink); width:0%; transition:width linear;"></div>\n        </div>\n        \n        \x3c!-- Header --\x3e\n        <div style="padding:16px; display:flex; align-items:center; gap:12px; z-index:2;">\n          <img src="${a}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid var(--l-ink);">\n          <div style="flex:1;">\n            <div style="color:var(--l-ink); font-weight:600; font-size:0.9rem; text-shadow:0 1px 4px var(--l-veil-50);">${t.authorName}</div>\n            <div style="color:var(--l-sheen-80); font-size:0.75rem; text-shadow:0 1px 4px var(--l-veil-50);">${formatTimeAgo(t.createdAt)}</div>\n          </div>\n          <button onclick="closeStoryViewer()" style="background:transparent; border:none; color:var(--l-ink); font-size:1.5rem; cursor:pointer; padding:8px; text-shadow:0 1px 4px var(--l-veil-50);">✕</button>\n        </div>\n        \n        \x3c!-- Content --\x3e\n        <div style="flex:1; display:flex; align-items:${s ? "flex-end" : "center"}; justify-content:center; text-align:center; padding:${s ? "20px 20px 30px" : "40px 20px"}; z-index:2;">\n          <div>\n            ${s ? "" : `<div style="font-size:${o ? "4rem" : "5rem"}; margin-bottom:20px; text-shadow:0 2px 10px var(--l-veil-30);">${t.emoji}</div>`}\n            <div style="color:var(--l-ink); font-size:${o ? "1.3rem" : "1.5rem"}; font-weight:600; text-shadow:0 2px 10px var(--l-veil-70); line-height:1.4;">${s ? t.emoji + " " : ""}${t.text}</div>\n          </div>\n        </div>\n        \n        \x3c!-- Footer actions --\x3e\n        <div style="padding:16px; display:flex; align-items:center; gap:10px; z-index:2;">\n          ${"ama" === t.category ? `\n            <button onclick="closeStoryViewer(); ${n ? `openUnifiedProfile('${n.id}', 'chat')` : ""}" style="flex:1; padding:12px; background:var(--l-sheen-20); border:1px solid var(--l-sheen-30); border-radius:20px; color:var(--l-ink); cursor:pointer; font-size:0.9rem;">Send a message...</button>\n          ` : `\n            <div style="display:flex; gap:8px;">\n              ${["❤️", "🔥", "😂", "😍", "👀"].map((e) => `<button onclick="reactToStory('${t.id}', '${e}')" style="background:var(--l-sheen-15); border:none; border-radius:50%; width:40px; height:40px; font-size:1.2rem; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.transform='scale(1.2)'" onmouseleave="this.style.transform='scale(1)'">${e}</button>`).join("")}\n            </div>\n          `}\n          ${n ? `<button onclick="closeStoryViewer(); openUnifiedProfile('${n.id}', 'chat')" style="background:var(--l-sheen-20); border:1px solid var(--l-sheen-30); color:var(--l-ink); padding:10px 16px; border-radius:20px; cursor:pointer; font-size:0.85rem;">💬 Chat</button>` : ""}\n        </div>\n      </div>\n    `),
        i.addEventListener("click", (e) => {
            e.target === i && closeStoryViewer();
        }),
        document.body.appendChild(i);
    const m = s ? 8e3 : 5e3;
    setTimeout(() => {
        const e = $("storyProgress");
        e && ((e.style.transitionDuration = `${m}ms`), (e.style.width = "100%"));
    }, 50);
    let u = !1,
        g = m,
        h = Date.now();
    function y() {
        if (u) return;
        (u = !0),
            (g = Math.max(0, g - (Date.now() - h))),
            window.__storyAutoCloseTimer__ &&
                (clearTimeout(window.__storyAutoCloseTimer__), (window.__storyAutoCloseTimer__ = null));
        const e = $("storyProgress");
        if (e) {
            const t = window.getComputedStyle(e).width;
            (e.style.transitionDuration = "0ms"), (e.style.width = t);
        }
    }
    function f() {
        if (!u) return;
        (u = !1),
            (h = Date.now()),
            (window.__storyAutoCloseTimer__ = setTimeout(() => {
                (window.__storyAutoCloseTimer__ = null), closeStoryViewer();
            }, g));
        const e = $("storyProgress");
        e && ((e.style.transitionDuration = `${g}ms`), (e.style.width = "100%"));
    }
    const b = i.querySelector(".story-image-bg");
    function v(t) {
        if ("Escape" === t.key) closeStoryViewer();
        else if ("ArrowRight" === t.key || "ArrowDown" === t.key) {
            const t = gameState.socialNetwork?.stories || [],
                n = t.findIndex((t) => t.id === e);
            n >= 0 && n < t.length - 1 ? (closeStoryViewer(), openStoryViewer(t[n + 1].id)) : closeStoryViewer();
        } else if ("ArrowLeft" === t.key || "ArrowUp" === t.key) {
            const t = gameState.socialNetwork?.stories || [],
                n = t.findIndex((t) => t.id === e);
            n > 0 && (closeStoryViewer(), openStoryViewer(t[n - 1].id));
        }
    }
    b &&
        (b.addEventListener("mouseenter", y),
        b.addEventListener("mouseleave", f),
        b.addEventListener("touchstart", y, { passive: !0 }),
        b.addEventListener("touchend", f, { passive: !0 })),
        window.addEventListener("keydown", v),
        (i._storyKeyHandler = v),
        window.__storyAutoCloseTimer__ && clearTimeout(window.__storyAutoCloseTimer__),
        (h = Date.now()),
        (window.__storyAutoCloseTimer__ = setTimeout(() => {
            (window.__storyAutoCloseTimer__ = null), closeStoryViewer();
        }, m)),
        renderStoriesBar();
}
function closeStoryViewer() {
    const e = $("storyViewer");
    e &&
        (window.__storyAutoCloseTimer__ &&
            (clearTimeout(window.__storyAutoCloseTimer__), (window.__storyAutoCloseTimer__ = null)),
        e._storyKeyHandler && window.removeEventListener("keydown", e._storyKeyHandler),
        e.remove());
}
function reactToStory(e, t) {
    initStories();
    const n = gameState.socialNetwork.stories.find((t) => t.id === e);
    if (!n) return;
    n.reactions.push({ emoji: t, fromId: "player", timestamp: Date.now() });
    const a = gameState.employees.find((e) => e.id === n.authorId);
    a &&
        ("function" == typeof remember &&
            remember(a, `Boss reacted ${t} to my story: "${n.text}"`, "interaction", 1),
        a.stats && (a.stats.affection = Math.min(100, (a.stats.affection || 0) + 1)));
    document.querySelectorAll("#storyViewer button").forEach((e) => {
        e.textContent === t &&
            ((e.style.background = "var(--l-sheen-40)"),
            (e.style.transform = "scale(1.3)"),
            setTimeout(() => {
                (e.style.background = "var(--l-sheen-15)"), (e.style.transform = "scale(1)");
            }, 300));
    });
}
function calculateForYouScore(e, t) {
    let n = 0;
    const a = gameState.employees.find((t) => t.id === e.authorId);
    if (a) {
        (n += 0.5 * (a.stats?.affection || 0)),
            (n += 0.3 * (a.stats?.trust || 0)),
            (n += 0.4 * (a.stats?.desire || 0)),
            (n += 0.6 * (a.memory?.intimacyLevel || 0));
    }
    if ((e.imageUrl && (n += 15), e.explicitLevel >= 2 && (n += 10), "poll" === e.type && (n += 20), a)) {
        const e = gameState.chatHistory?.[a.id];
        if (e && e.length > 0) {
            const a = (t - (e[e.length - 1].timestamp || 0)) / 36e5;
            a < 1 ? (n += 40) : a < 4 ? (n += 20) : a < 24 && (n += 10);
        }
    }
    const o = (e.upvotes || 0) - (e.downvotes || 0) + (e.likes?.length || 0) + 2 * (e.comments?.length || 0);
    n += Math.min(30, 2 * o);
    const i = Math.max(0, t - e.timestamp) / 36e5;
    return (n /= Math.pow(i + 1, 0.8)), (n += 10 * Math.random()), n;
}
function renderPollHTML(e, t = !1) {
    if (!e.poll) return "";
    const n = e.poll,
        a = n.options.reduce((e, t) => e + (t.votes || 0), 0),
        o = void 0 !== n.playerVote && null !== n.playerVote;
    return `\n      <div class="poll-container" style="${t ? "margin:14px 0;" : "margin:10px 0;"}">\n        ${n.options
            .map((t, i) => {
                const s = a > 0 ? Math.round((t.votes / a) * 100) : 0,
                    r = n.playerVote === i,
                    l = o;
                return `\n            <div class="poll-option ${o ? "voted" : ""}" \n                 ${o ? "" : `onclick="voteOnPoll('${e.id}', ${i})"`}\n                 style="${r ? "border-color:var(--accent); background:rgba(0,212,255,0.08);" : ""}">\n              ${l ? `<div class="poll-bar" style="width:${s}%;"></div>` : ""}\n              <div class="poll-label">\n                <span>${r ? "✓ " : ""}${t.text}</span>\n                ${l ? `<span class="poll-percent">${s}%</span>` : ""}\n              </div>\n            </div>\n          `;
            })
            .join("")}\n        <div class="poll-total-votes">${a} vote${1 !== a ? "s" : ""}</div>\n      </div>\n    `;
}
function voteOnPoll(e, t) {
    const n = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!n?.poll || void 0 !== n.poll.playerVote) return;
    (n.poll.playerVote = t),
        (n.poll.options[t].votes = (n.poll.options[t].votes || 0) + 1),
        addSocialNotification({
            type: "poll_vote",
            fromId: "player",
            fromName: "You",
            postId: n.id,
            preview: n.poll.options[t].text,
            targetAuthorId: n.authorId,
        }),
        "social" === gameState.activeTab && renderSocialFeed();
    postModalState.activePostId === e && (closePostModal(), openPostModal(e));
}
function generateAutonomousPollVotes() {
    const e = gameState.socialNetwork.posts.filter((e) => e.poll && !e.poll.closed);
    if (0 === e.length) return;
    const t = gameState.employees.filter((e) => "active" === e.employmentStatus);
    for (const n of e)
        for (const e of t) {
            if (n.poll.voterIds?.includes(e.id)) continue;
            if (Math.random() > 0.15) continue;
            const t = e.personality || {};
            let a = n.poll.options.map((e, a) => {
                let o = 1 + Math.random();
                return (
                    0 === a && (o += 0.02 * (t.confidence || 50)),
                    a === n.poll.options.length - 1 && (o += 0.02 * (t.humor || 50)),
                    o
                );
            });
            const o = a.reduce((e, t) => e + t, 0);
            let i = Math.random() * o,
                s = 0;
            for (let e = 0; e < a.length; e++)
                if (((i -= a[e]), i <= 0)) {
                    s = e;
                    break;
                }
            (n.poll.options[s].votes = (n.poll.options[s].votes || 0) + 1),
                n.poll.voterIds || (n.poll.voterIds = []),
                n.poll.voterIds.push(e.id);
        }
}
function generatePollPost(e) {
    const t = (e.personality || {}).flirty || 50,
        n = [
            { q: "Best office snack?", opts: ["🍕 Pizza", "🌮 Tacos", "🍣 Sushi", "🥗 Salad"] },
            { q: "Monday mood?", opts: ["☕ Coffee zombie", "💪 Let's go!", "😴 Still sleeping", "🏠 WFH please"] },
            { q: "Friday plans?", opts: ["🎉 Going out", "🛋️ Netflix", "🏋️ Gym", "🍻 Happy hour"] },
            { q: "Coffee order?", opts: ["☕ Black", "🥛 Latte", "🧊 Iced", "🚫 No coffee"] },
            { q: "Work playlist?", opts: ["🎵 Pop", "🎸 Rock", "🎹 Lo-fi", "🔇 Silence"] },
            { q: "Lunch spot today?", opts: ["🍔 Fast food", "🥗 Healthy", "🍱 Brought lunch", "⏰ Skipping"] },
            { q: "Pet preference?", opts: ["🐱 Cat", "🐶 Dog", "🐹 Small pet", "🚫 None"] },
            { q: "Ideal vacation?", opts: ["🏖️ Beach", "🏔️ Mountain", "🏙️ City trip", "🏠 Staycation"] },
            {
                q: "Superpower you'd want?",
                opts: ["🦅 Flight", "👻 Invisibility", "🧠 Mind reading", "⏰ Time travel"],
            },
            { q: "Morning routine?", opts: ["🏃 Exercise", "📱 Scroll phone", "☕ Coffee first", "💤 Snooze 5x"] },
        ];
    !isSFWMode() &&
        t > 60 &&
        n.push(
            { q: "What's your type?", opts: ["💪 Athletic", "🧠 Smart", "😂 Funny", "😈 Bold"] },
            { q: "Ideal date night?", opts: ["🍷 Wine & dine", "🎬 Movie night", "💃 Dancing", "🏠 Stay in 😏"] },
            { q: "Your love language?", opts: ["🤗 Touch", "💬 Words", "🎁 Gifts", "⏰ Quality time"] }
        );
    const a = n[Math.floor(Math.random() * n.length)];
    return {
        content: a.q,
        type: "poll",
        poll: { options: a.opts.map((e) => ({ text: e, votes: 0 })), playerVote: void 0, voterIds: [], closed: !1 },
    };
}
function toggleSocialSidebar() {
    const e = $("socialFeedSidebar"),
        t = $("sidebarOverlay");
    if (!e) return;
    const n = e.classList.contains("mobile-open");
    e.classList.toggle("mobile-open", !n), t && t.classList.toggle("mobile-open", !n);
}
function filterAndSortPosts() {
    let e = [...gameState.socialNetwork.posts];
    const t = gameState.socialNetwork.algorithm || {},
        n = (gameState.time && gameState.time.currentTime) || Date.now();
    console.log("[Algorithm] Starting with", e.length, "posts"), console.log("[Algorithm] Settings:", t);
    const a = gameState.employees.map((e) => e.id),
        o = e.length;
    e = e.filter(
        (e) =>
            !("player" !== e.authorId && !e.isPlayerPost) || "system" === e.authorId || a.includes(e.authorId)
    );
    console.log(`[Algorithm] Filtered out ${o - e.length} posts from fired employees`);
    if (0 === e.length && o > 0) {
        console.warn(
            `[Algorithm] Author filter removed ALL ${o} posts — likely an author-id mismatch (e.g. after load/prestige). Showing all non-player posts instead of an empty feed.`
        );
        e = [...gameState.socialNetwork.posts];
    }
    if (isSFWMode()) {
        const t = e.length;
        (e = e.filter(
            (e) =>
                !(e.explicitLevel > 0) &&
                !(e.nsfwLevel > 0) &&
                !["explicit", "thirsttrap", "nude", "lewd"].includes(e.type)
        )),
            console.log(`[Algorithm] SFW Mode: Filtered out ${t - e.length} NSFW posts`);
    }
    const i = t.contentRating || "all";
    "sfw" === i
        ? (e = e.filter((e) => 0 === e.explicitLevel))
        : "nsfw" === i
          ? (e = e.filter((e) => e.explicitLevel >= 1 && e.explicitLevel <= 2))
          : "explicit" === i && (e = e.filter((e) => e.explicitLevel >= 3)),
        console.log("[Algorithm] After content rating filter:", e.length, "posts");
    const s = t.postType || "all";
    "text" === s
        ? (e = e.filter((e) => !e.imageUrl))
        : "image" === s
          ? (e = e.filter((e) => e.imageUrl))
          : "selfie" === s
            ? (e = e.filter((e) => "selfie" === e.type))
            : "work" === s && (e = e.filter((e) => "work" === e.type)),
        console.log("[Algorithm] After post type filter:", e.length, "posts");
    const r = t.author || "all";
    "player" === r
        ? (e = e.filter((e) => "player" === e.authorId || e.isPlayerPost))
        : "all" !== r && (e = e.filter((e) => e.authorId === r)),
        console.log("[Algorithm] After author filter:", e.length, "posts");
    const l = t.engagement || "all";
    "popular" === l
        ? (e = e.filter((e) => (e.likes?.length || 0) + (e.upvotes || 0) - (e.downvotes || 0) >= 5))
        : "viral" === l
          ? (e = e.filter((e) => (e.likes?.length || 0) + (e.upvotes || 0) - (e.downvotes || 0) >= 20))
          : "active" === l && (e = e.filter((e) => (e.comments?.length || 0) >= 5)),
        console.log("[Algorithm] After engagement filter:", e.length, "posts");
    const c = t.searchQuery || "";
    if (c && c.trim()) {
        const t = c.toLowerCase();
        e = e.filter((e) => {
            if (e.content && e.content.toLowerCase().includes(t)) return !0;
            const n = e.isPlayerPost
                ? "you"
                : gameState.employees.find((t) => t.id === e.authorId)?.name?.toLowerCase();
            return (
                !(!n || !n.includes(t)) ||
                !(!e.tags || !e.tags.some((e) => e.toLowerCase().includes(t))) ||
                !(!e.mentions || !e.mentions.some((e) => e.toLowerCase().includes(t)))
            );
        });
    }
    console.log("[Algorithm] After search filter:", e.length, "posts");
    const d = t.sort || "hot";
    if ("hot" === d)
        e.sort((e, t) => {
            const a = calculateHotScore(e, n);
            return calculateHotScore(t, n) - a;
        });
    else if ("best" === d) {
        const a = t.bestTimeFrame || "all",
            o = getTimeFrameLimit(a, n);
        "all" !== a && (e = e.filter((e) => e.timestamp >= o)),
            e.sort((e, t) => {
                const n =
                    (e.upvotes || 0) - (e.downvotes || 0) + (e.likes?.length || 0) + (e.comments?.length || 0);
                return (
                    (t.upvotes || 0) - (t.downvotes || 0) + (t.likes?.length || 0) + (t.comments?.length || 0) - n
                );
            });
    } else
        "recent" === d
            ? e.sort((e, t) => t.timestamp - e.timestamp)
            : "controversial" === d
              ? e.sort((e, t) => {
                    const n = calculateControversialScore(e);
                    return calculateControversialScore(t) - n;
                })
              : "foryou" === d &&
                e.sort((e, t) => {
                    const a = calculateForYouScore(e, n);
                    return calculateForYouScore(t, n) - a;
                });
    return console.log("[Algorithm] Final sorted posts:", e.length), e;
}
