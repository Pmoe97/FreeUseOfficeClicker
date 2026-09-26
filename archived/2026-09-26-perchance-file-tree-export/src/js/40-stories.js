// ============================================================================
// 40-stories — Stories bar: autonomous stories, story viewer, reactions, for-you scoring, polls, feed sorting.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

const Gg = { morning: [{ text: "Coffee time \u2615", emoji: "\u2615", bg: "linear-gradient(135deg, #6b4226, #8B6914)" }, { text: "Barely alive \u{1F634}", emoji: "\u{1F634}", bg: "linear-gradient(135deg, var(--cc), var(--bo))" }, { text: "Monday mood", emoji: "\u{1F629}", bg: "linear-gradient(135deg, var(--t), var(--w))" }, { text: "Rise and grind \u{1F4AA}", emoji: "\u{1F4AA}", bg: "linear-gradient(135deg, var(--l), var(--v))" }, { text: "Morning traffic \u{1F697}", emoji: "\u{1F697}", bg: "linear-gradient(135deg, var(--bo), var(--cc))" }, { text: "Need caffeine stat", emoji: "\u2615", bg: "linear-gradient(135deg, var(--dh), #5f27cd)" }, { text: "Beautiful sunrise today \u{1F305}", emoji: "\u{1F305}", bg: "linear-gradient(135deg, var(--bu), var(--l))" }, { text: "Woke up late again \u{1F605}", emoji: "\u23F0", bg: "linear-gradient(135deg, var(--l), var(--v))" }, { text: "Breakfast of champions \u{1F95E}", emoji: "\u{1F95E}", bg: "linear-gradient(135deg, var(--cq), var(--dm))" }, { text: "Early bird gets the worm", emoji: "\u{1F426}", bg: "linear-gradient(135deg, var(--by), var(--ef))" }, { text: "Alarm didn't go off \u{1F643}", emoji: "\u{1F643}", bg: "linear-gradient(135deg, var(--cb), #e17055)" }, { text: "Smooth jazz & morning tea", emoji: "\u{1F375}", bg: "linear-gradient(135deg, var(--cv), var(--cw))" }, { text: "Gym before work \u{1F4AA}", emoji: "\u{1F3C3}", bg: "linear-gradient(135deg, var(--l), var(--cb))" }, { text: "Dog walk at dawn \u{1F415}", emoji: "\u{1F415}", bg: "linear-gradient(135deg, var(--by), var(--df))" }, { text: "Forgot my lunch \u{1F62D}", emoji: "\u{1F62D}", bg: "linear-gradient(135deg, var(--bo), var(--ct))" }, { text: "Perfect hair day \u2728", emoji: "\u{1F487}", bg: "linear-gradient(135deg, var(--ci), var(--bw))" }], work: [{ text: "Another meeting \u{1F4CA}", emoji: "\u{1F4CA}", bg: "linear-gradient(135deg, #0c3483, #a2b6df)" }, { text: "Desk selfie \u{1F933}", emoji: "\u{1F933}", bg: "linear-gradient(135deg, var(--j), var(--ak))" }, { text: "Lunch break!", emoji: "\u{1F371}", bg: "linear-gradient(135deg, var(--bu), var(--cq))" }, { text: "Boss vibes today \u{1F60E}", emoji: "\u{1F60E}", bg: "linear-gradient(135deg, var(--t), var(--at))" }, { text: "Productivity: \u{1F4C8}", emoji: "\u{1F4C8}", bg: "linear-gradient(135deg, var(--n), var(--by))" }, { text: "Office drama already??", emoji: "\u{1F37F}", bg: "linear-gradient(135deg, var(--l), var(--v))" }, { text: "Just got a raise!! \u{1F911}", emoji: "\u{1F911}", bg: "linear-gradient(135deg, var(--by), var(--ef))" }, { text: "Work friends > everything", emoji: "\u{1F4BC}", bg: "linear-gradient(135deg, var(--cv), var(--cw))" }, { text: "Free donuts in the kitchen", emoji: "\u{1F369}", bg: "linear-gradient(135deg, var(--cq), var(--bu))" }, { text: "This email could've been a text", emoji: "\u{1F4E7}", bg: "linear-gradient(135deg, var(--bo), var(--cc))" }, { text: "Printer jammed again \u{1F5A8}\uFE0F", emoji: "\u{1F5A8}\uFE0F", bg: "linear-gradient(135deg, var(--cb), var(--bo))" }, { text: "New desk setup \u2728", emoji: "\u{1F5A5}\uFE0F", bg: "linear-gradient(135deg, var(--df), var(--dp))" }, { text: "Power nap in the break room", emoji: "\u{1F634}", bg: "linear-gradient(135deg, var(--cc), var(--bo))" }, { text: "Happy hour countdown \u23F0", emoji: "\u{1F37B}", bg: "linear-gradient(135deg, var(--bu), var(--l))" }, { text: "Crushed my presentation!", emoji: "\u{1F3A4}", bg: "linear-gradient(135deg, var(--by), var(--ef))" }, { text: "Overtime again \u{1F62E}\u200D\u{1F4A8}", emoji: "\u{1F62E}\u200D\u{1F4A8}", bg: "linear-gradient(135deg, var(--cc), var(--t))" }], mood: [{ text: "Feeling great \u{1F60A}", emoji: "\u{1F60A}", bg: "linear-gradient(135deg, var(--by), var(--ef))" }, { text: "Vibing \u2728", emoji: "\u2728", bg: "linear-gradient(135deg, var(--cw), var(--cv))" }, { text: "Not today \u{1F624}", emoji: "\u{1F624}", bg: "linear-gradient(135deg, var(--l), var(--cb))" }, { text: "Feeling myself \u{1F485}", emoji: "\u{1F485}", bg: "linear-gradient(135deg, var(--ci), var(--bw))" }, { text: "Sleepy hours \u{1F4A4}", emoji: "\u{1F4A4}", bg: "linear-gradient(135deg, var(--cc), var(--bo))" }, { text: "Bored", emoji: "\u{1F610}", bg: "linear-gradient(135deg, var(--bo), var(--ct))" }, { text: "Grateful today \u{1F64F}", emoji: "\u{1F64F}", bg: "linear-gradient(135deg, var(--bu), #fdcb6e)" }, { text: "Living my best life", emoji: "\u{1F31F}", bg: "linear-gradient(135deg, var(--l), var(--bu))" }, { text: "Main character energy", emoji: "\u{1F451}", bg: "linear-gradient(135deg, var(--bu), var(--cq))" }, { text: "Stressed but blessed", emoji: "\u{1FAE0}", bg: "linear-gradient(135deg, var(--bo), var(--by))" }, { text: "Serotonin boost \u{1F308}", emoji: "\u{1F308}", bg: "linear-gradient(135deg, var(--bw), var(--bu))" }, { text: "Feeling unstoppable \u{1F525}", emoji: "\u{1F525}", bg: "linear-gradient(135deg, var(--l), var(--cb))" }, { text: "Peaceful evening \u{1F306}", emoji: "\u{1F306}", bg: "linear-gradient(135deg, var(--t), var(--l))" }, { text: "Missing someone \u{1F4AD}", emoji: "\u{1F4AD}", bg: "linear-gradient(135deg, var(--bo), var(--cw))" }, { text: "Chaotic energy today", emoji: "\u{1F92A}", bg: "linear-gradient(135deg, var(--cv), var(--l))" }, { text: "No thoughts, head empty", emoji: "\u{1F9E0}", bg: "linear-gradient(135deg, var(--ct), var(--bo))" }], activity: [{ text: "Gym time! \u{1F3CB}\uFE0F", emoji: "\u{1F3CB}\uFE0F", bg: "linear-gradient(135deg, var(--l), var(--cb))" }, { text: "Cooking something yummy \u{1F373}", emoji: "\u{1F373}", bg: "linear-gradient(135deg, var(--cq), var(--bu))" }, { text: "Movie night \u{1F3AC}", emoji: "\u{1F3AC}", bg: "linear-gradient(135deg, var(--cc), var(--bo))" }, { text: "Gaming session \u{1F3AE}", emoji: "\u{1F3AE}", bg: "linear-gradient(135deg, var(--cv), var(--cw))" }, { text: "Shopping haul incoming! \u{1F6CD}\uFE0F", emoji: "\u{1F6CD}\uFE0F", bg: "linear-gradient(135deg, var(--ci), var(--bw))" }, { text: "Reading vibes \u{1F4DA}", emoji: "\u{1F4DA}", bg: "linear-gradient(135deg, var(--dh), #5f27cd)" }, { text: "Wine o'clock \u{1F377}", emoji: "\u{1F377}", bg: "linear-gradient(135deg, var(--di), #b83280)" }, { text: "Beach day! \u{1F3D6}\uFE0F", emoji: "\u{1F3D6}\uFE0F", bg: "linear-gradient(135deg, var(--by), var(--df))" }, { text: "Yoga & chill \u{1F9D8}", emoji: "\u{1F9D8}", bg: "linear-gradient(135deg, var(--cw), #dfe6e9)" }, { text: "Late night walk \u{1F319}", emoji: "\u{1F319}", bg: "linear-gradient(135deg, #0c3483, var(--cc))" }, { text: "Trying a new recipe \u{1F469}\u200D\u{1F373}", emoji: "\u{1F469}\u200D\u{1F373}", bg: "linear-gradient(135deg, var(--cq), var(--by))" }, { text: "Karaoke night! \u{1F3A4}", emoji: "\u{1F3A4}", bg: "linear-gradient(135deg, var(--bw), var(--cv))" }, { text: "Road trip vibes \u{1F6E3}\uFE0F", emoji: "\u{1F6E3}\uFE0F", bg: "linear-gradient(135deg, var(--dp), var(--df))" }, { text: "Painting something \u{1F3A8}", emoji: "\u{1F3A8}", bg: "linear-gradient(135deg, var(--bw), var(--bu))" }, { text: "Sunday brunch \u{1F942}", emoji: "\u{1F942}", bg: "linear-gradient(135deg, var(--bu), var(--ci))" }, { text: "Cleaning spree \u{1F9F9}", emoji: "\u{1F9F9}", bg: "linear-gradient(135deg, var(--df), var(--dp))" }], nsfw: [{ text: "Feeling bold tonight \u{1F525}", emoji: "\u{1F525}", bg: "linear-gradient(135deg, var(--l), var(--cb))" }, { text: "Can't sleep \u{1F60F}", emoji: "\u{1F60F}", bg: "linear-gradient(135deg, var(--di), var(--l))" }, { text: "Bath time \u{1F6C1}", emoji: "\u{1F6C1}", bg: "linear-gradient(135deg, var(--ci), var(--bw))" }, { text: "New lingerie \u{1F459}", emoji: "\u{1F459}", bg: "linear-gradient(135deg, var(--l), var(--v))" }, { text: "Spicy night \u{1F336}\uFE0F", emoji: "\u{1F336}\uFE0F", bg: "linear-gradient(135deg, var(--cb), var(--l))" }, { text: "DM me \u{1F48B}", emoji: "\u{1F48B}", bg: "linear-gradient(135deg, var(--l), var(--ci))" }, { text: "After midnight vibes \u{1F319}", emoji: "\u{1F319}", bg: "linear-gradient(135deg, var(--cc), var(--l))" }, { text: "Just got out of the shower \u{1F4A6}", emoji: "\u{1F4A6}", bg: "linear-gradient(135deg, var(--by), var(--df))" }, { text: "Bedroom eyes \u{1F440}", emoji: "\u{1F440}", bg: "linear-gradient(135deg, var(--di), var(--dh))" }, { text: "Mirror selfie \u{1FA9E}", emoji: "\u{1FA9E}", bg: "linear-gradient(135deg, var(--bw), var(--ci))" }, { text: "Silk sheets kinda night", emoji: "\u{1F6CF}\uFE0F", bg: "linear-gradient(135deg, var(--dh), var(--l))" }, { text: "Mood: \u{1F525}\u{1F525}\u{1F525}", emoji: "\u{1F525}", bg: "linear-gradient(135deg, var(--cb), var(--di))" }, { text: "Wine + candles = \u2665\uFE0F", emoji: "\u{1F56F}\uFE0F", bg: "linear-gradient(135deg, var(--di), var(--l))" }, { text: "Thinking about you...", emoji: "\u{1F4AD}", bg: "linear-gradient(135deg, var(--l), var(--dh))" }, { text: "Late night confession", emoji: "\u{1F92B}", bg: "linear-gradient(135deg, var(--cc), var(--l))" }, { text: "Red lips tonight \u{1F484}", emoji: "\u{1F484}", bg: "linear-gradient(135deg, var(--cb), var(--bw))" }], reaction: [{ text: "WHAT just happened \u{1F631}", emoji: "\u{1F631}", bg: "linear-gradient(135deg, var(--l), var(--v))" }, { text: "I'm screaming \u{1F602}", emoji: "\u{1F602}", bg: "linear-gradient(135deg, var(--bu), var(--cq))" }, { text: "No way...", emoji: "\u{1F633}", bg: "linear-gradient(135deg, var(--bo), var(--cc))" }, { text: "Obsessed rn", emoji: "\u{1F970}", bg: "linear-gradient(135deg, var(--ci), var(--bw))" }, { text: "This is NOT okay", emoji: "\u{1F621}", bg: "linear-gradient(135deg, var(--cb), var(--l))" }, { text: "Best day ever!! \u{1F389}", emoji: "\u{1F389}", bg: "linear-gradient(135deg, var(--by), var(--bu))" }, { text: "Plot twist \u{1F92F}", emoji: "\u{1F92F}", bg: "linear-gradient(135deg, var(--cv), var(--l))" }, { text: "I can't even \u{1F480}", emoji: "\u{1F480}", bg: "linear-gradient(135deg, var(--cc), var(--bo))" }, { text: "OMG you guys...", emoji: "\u{1F64A}", bg: "linear-gradient(135deg, var(--bw), var(--ci))" }, { text: "Did that just happen??", emoji: "\u{1F632}", bg: "linear-gradient(135deg, var(--dp), var(--df))" }, { text: "Bruh.", emoji: "\u{1F5FF}", bg: "linear-gradient(135deg, var(--bo), var(--ct))" }, { text: "Crying happy tears \u{1F979}", emoji: "\u{1F979}", bg: "linear-gradient(135deg, var(--by), var(--cw))" }], ama: [{ text: "Ask me anything! \u{1F914}", emoji: "\u2753", bg: "linear-gradient(135deg, var(--j), var(--ak))" }, { text: "Bored, send questions", emoji: "\u{1F4AC}", bg: "linear-gradient(135deg, #0c3483, #a2b6df)" }, { text: "Truth or dare? \u{1F608}", emoji: "\u{1F608}", bg: "linear-gradient(135deg, var(--l), var(--di))" }, { text: "Rate my fit? \u{1F457}", emoji: "\u{1F457}", bg: "linear-gradient(135deg, var(--ci), var(--bw))" }, { text: "Hot takes only \u{1F321}\uFE0F", emoji: "\u{1F321}\uFE0F", bg: "linear-gradient(135deg, var(--cb), var(--l))" }, { text: "Spill the tea \u2615", emoji: "\u2615", bg: "linear-gradient(135deg, #6b4226, var(--l))" }, { text: "Confessions? \u{1FAE3}", emoji: "\u{1FAE3}", bg: "linear-gradient(135deg, var(--dh), var(--bw))" }, { text: "Would you rather...?", emoji: "\u{1F937}", bg: "linear-gradient(135deg, var(--dp), var(--cv))" }] };
function generateAutonomousStories() {
  zg();
  const e = Date.now();
  if (e - (gameState.socialNetwork.lastStoryGen || 0) < 12e4 + 12e4 * Math.random()) return;
  gameState.socialNetwork.lastStoryGen = e, gameState.socialNetwork.stories = gameState.socialNetwork.stories.filter((t2) => e - t2.createdAt < 36e5);
  const t = gameState.employees.filter((e2) => "active" === e2.employmentStatus);
  if (0 !== t.length) {
    for (const n of t) {
      if (gameState.socialNetwork.stories.some((e2) => e2.authorId === n.id)) continue;
      const t2 = 0.08 * (n.social?.postFrequency || 0.5) * (0.5 + (n.personality?.outgoing || 50) / 100);
      if (Math.random() > t2) continue;
      const a = ["morning", "work", "mood", "activity", "reaction"], o = n.stats?.desire || 0, i = n.memory?.intimacyLevel || 0, s = n.personality?.flirty || 50;
      let r;
      !Ue() && (o > 60 || i > 50 || s > 70) && (a.push("nsfw"), (o > 80 || i > 70) && a.push("nsfw")), Math.random() < 0.15 && a.push("ama");
      const l = n.personalLife?.currentActivity;
      r = l && Math.random() < 0.6 ? "activity" : a[Math.floor(Math.random() * a.length)];
      const c = Gg[r] || Gg.mood, d = "_usedStoryTemplates";
      gameState.socialNetwork[d] || (gameState.socialNetwork[d] = {}), gameState.socialNetwork[d][r] || (gameState.socialNetwork[d][r] = []);
      const p = gameState.socialNetwork[d][r];
      let m = c.filter((e2) => !p.includes(e2.text));
      0 === m.length && (gameState.socialNetwork[d][r] = [], m = c);
      let u2 = m[Math.floor(Math.random() * m.length)];
      p.push(u2.text);
      const g = Math.floor(0.6 * c.length);
      p.length > g && p.shift();
      let h = u2.text;
      if (l && "activity" === r) {
        const e2 = l.description || l.name || "";
        e2 && (h = e2.substring(0, 40));
      }
      const y = { id: "story_" + ++gameState.socialNetwork.storyIdCounter, authorId: n.id, authorName: n.name, authorImage: n.profileImage || null, text: h, emoji: u2.emoji, bg: u2.bg, category: r, createdAt: e, expiresAt: e + 36e5, viewedByPlayer: false, reactions: [] };
      gameState.socialNetwork.stories.push(y), debugLog("Stories", `${n.name} posted a story: "${h}"`), ("nsfw" === r || "mood" === r && Math.random() < 0.4 || "activity" === r && Math.random() < 0.35 || "work" === r && Math.random() < 0.25 || "morning" === r && Math.random() < 0.2 || i > 40 && Math.random() < 0.5 || o > 50 && Math.random() < 0.5) && (y._imageRequested = true, generateStoryImage(y, n, r).catch((e2) => {
        console.warn(`[Stories] Image generation failed for ${n.name}'s story:`, e2);
      })), (i > 50 || o > 60) && addSocialNotification({ type: "story", fromId: n.id, fromName: n.name, postId: null, preview: h, targetAuthorId: "player" });
    }
    "social" === gameState.activeTab && renderStoriesBar();
  }
}
async function generateStoryImage(e, t, n) {
  try {
    const a = "function" == typeof getPhysicalDescriptionForPrompt ? getPhysicalDescriptionForPrompt(t) : `${t.name}, ${t.gender || "woman"}, ${t.age || 25} years old`, o = (t.name, (t.personalityTraits || []).slice(0, 3).join(", "), t.physical?.fashion || "casual");
    t.stats?.affection > 70 || t.stats;
    let i = "", s = "", r = "smartphone selfie, vertical 9:16 portrait, candid social media story";
    switch (n) {
      case "nsfw":
        Ue() ? (i = "Flirty selfie, stylish outfit showing personality. Confident pose with a coy smile, warm lighting.", s = "flirty, confident, attractive") : (i = "Intimate selfie in a private setting (bedroom, bathroom mirror, dim lighting). Wearing revealing or minimal clothing. Provocative but tasteful pose, seductive expression, warm ambient lighting.", s = "sultry, confident, playful");
        break;
      case "morning":
        i = "Morning scene \u2014 natural golden-hour sunlight streaming through a window. Casual morning look: messy hair, cozy pajamas or oversized shirt. Holding a coffee mug or stretching. Bedroom or kitchen background with soft warm tones.", s = "sleepy, cozy, natural, warm";
        break;
      case "work":
        i = `Modern office selfie \u2014 sitting at a desk or standing in a bright open-plan office. Professional-casual ${o} outfit. Computer screens, plants, or whiteboards visible in the background.`, s = "professional, focused, approachable";
        break;
      case "mood":
        i = `Expressive selfie that captures the mood "${e.text}". Face fills most of the frame, dramatic expression. Background is slightly blurred.`, s = e.text.includes("great") || e.text.includes("best") ? "joyful, radiant" : e.text.includes("Not") || e.text.includes("\u{1F624}") ? "annoyed, intense" : e.text.includes("Sleepy") || e.text.includes("\u{1F4A4}") ? "drowsy, peaceful" : "expressive, authentic";
        break;
      case "activity":
        const t2 = { Gym: "at a gym, athletic wear, exercise equipment visible, energetic pose", Cook: "in a kitchen, colorful ingredients on counter, apron, warm lighting", Movie: "cozy couch setup with a TV glow, blanket, snacks, dim room", Gaming: "at a gaming setup with RGB lighting, headset around neck, screen glow", Shopping: "in a bright store or mall, holding shopping bags, mirror selfie", Reading: "curled up with a book, cozy chair, warm lamp light, glasses" }, n2 = Object.keys(t2).find((t3) => e.text.includes(t3));
        i = n2 ? t2[n2] : `Doing an activity: ${e.text}. Candid photo in an appropriate setting.`, s = "energetic, engaged, having fun";
        break;
      case "reaction":
        i = `Close-up reaction face matching "${e.text}". Wide eyes or exaggerated expression, slightly blurred background.`, s = "dramatic, surprised, animated";
        break;
      case "ama":
        i = "Casual selfie for a Q&A story. Relaxed pose, looking directly at camera with an inviting expression. Simple clean background.", s = "approachable, relaxed, open";
        break;
      default:
        i = `Casual social media selfie, authentic and candid. ${o} style outfit, natural setting.`, s = "casual, genuine";
    }
    const l = `${a.substring(0, 600)}. ${i} Mood: ${s}. ${r}, natural phone-camera depth of field, high quality, sharp focus, detailed face`;
    gameState.settings?.debugMode && console.log(`[Stories] Generating image for ${t.name}'s story...`);
    const c = await queuedGenerateImage("function" == typeof applyImageStyle ? applyImageStyle(l) : l, `Story image - ${t.name}: ${e.text}`);
    if (c) {
      const n2 = gameState.socialNetwork?.stories?.find((t2) => t2.id === e.id);
      if (n2) {
        n2.imageUrl = c, console.log(`[Stories] \u2705 Image generated for ${t.name}'s story`), "social" === gameState.activeTab && renderStoriesBar();
        const a2 = $("storyViewer");
        if (a2 && a2.dataset.storyId === e.id) {
          const e2 = a2.querySelector(".story-blur-bg");
          e2 && (e2.style.backgroundImage = `url(${c})`);
          const t2 = a2.querySelector(".story-sharp-img");
          t2 && (t2.src = c, t2.style.display = "block");
          const n3 = a2.querySelector(".story-loading-indicator");
          n3 && (n3.style.display = "none");
        }
      }
    }
  } catch (t2) {
    console.warn(`[Stories] Image generation error for story ${e.id}:`, t2);
  }
}
let Hg = "";
function renderStoriesBar() {
  zg();
  const e = $("storiesBar");
  if (!e) return;
  const t = gameState.socialNetwork.stories || [];
  if (0 === t.length) return Hg = "", void (e.style.display = "none");
  const n = t.map((e2) => e2.id + (e2.viewedByPlayer ? "v" : "") + (e2.imageUrl ? "i" : "")).join("|");
  if (n === Hg) return;
  Hg = n, e.style.display = "block";
  const a = [...t].sort((e2, t2) => e2.viewedByPlayer !== t2.viewedByPlayer ? e2.viewedByPlayer ? 1 : -1 : t2.createdAt - e2.createdAt);
  e.innerHTML = a.map((e2) => {
    const t2 = gameState.employees.find((t3) => t3.id === e2.authorId), n2 = e2.authorImage || t2?.profileImage || `https://placehold.co/56x56?text=${(e2.authorName || "?")[0]}`, a2 = e2.viewedByPlayer, o = e2.authorName?.split(" ")[0] || "NPC";
    return ` <div class="story-avatar" onclick="openStoryViewer('${e2.id}')"> <div class="story-avatar-ring ${a2 ? "viewed" : ""}"> <img src="${n2}" alt="${e2.authorName}"> </div> <span class="story-avatar-name">${o}</span> </div> `;
  }).join("");
}
function openStoryViewer(e) {
  zg();
  const t = gameState.socialNetwork.stories.find((t2) => t2.id === e);
  if (!t) return;
  t.viewedByPlayer = true;
  const n = gameState.employees.find((e2) => e2.id === t.authorId), a = t.authorImage || n?.profileImage || `https://placehold.co/56x56?text=${(t.authorName || "?")[0]}`, o = window.innerWidth <= 768, i = document.createElement("div");
  i.id = "storyViewer", i.dataset.storyId = e, i.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bc); z-index:99999; display:flex; align-items:center; justify-content:center;";
  const s = !!t.imageUrl, r = !s && t._imageRequested, l = !(!n?.profileImage && !t.authorImage), c = t.authorImage || n?.profileImage || "";
  let d = t.bg, p = "";
  s ? (d = "background-color: var(--bi);", p = "background: linear-gradient(to bottom, var(--am) 0%, var(--ey) 30%, var(--ey) 60%, var(--el) 100%);") : l && (d = `background-image: url(${c}); background-size: cover; background-position: center top;`, p = "background: linear-gradient(to bottom, var(--dv) 0%, var(--ez) 30%, var(--ez) 60%, var(--bp) 100%); backdrop-filter: blur(8px);"), i.innerHTML = ` <div class="story-image-bg" style="width:${o ? "100%" : "400px"}; max-width:100%; height:${o ? "100%" : "700px"}; max-height:${o ? "100%" : "90vh"}; border-radius:${o ? "0" : "16px"}; overflow:hidden; position:relative; ${d}; display:flex; flex-direction:column;">
        ${s ? ` <!-- Blurred fill layer (prevents black bars) --> <div style="position:absolute; top:0; left:0; right:0; bottom:0; background-image:url(${t.imageUrl}); background-size:cover; background-position:center; filter:blur(25px) brightness(0.5); transform:scale(1.1); z-index:0;"></div> <!-- Sharp contained image layer --> <img src="${t.imageUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:contain; z-index:0; image-rendering:-webkit-optimize-contrast;">
        ` : ""} <!-- Dark overlay for text readability --> <div style="position:absolute; top:0; left:0; right:0; bottom:0; ${p || t.bg + ";"} z-index:1;"></div> ${r ? ' <!-- Loading indicator for pending image --> <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:1; text-align:center;"> <div style="font-size:2rem; animation:spin 1.5s linear infinite;">\u{1F3A8}</div> <div style="color:var(--fq); font-size:0.8rem; margin-top:8px;">Generating image...</div> </div> ' : ""} <!-- Progress bar --> <div style="position:absolute; top:0; left:0; right:0; height:3px; background:var(--dt); z-index:3;"> <div id="storyProgress" style="height:100%; background:var(--b); width:0%; transition:width linear;"></div> </div> <!-- Header --> <div style="padding:16px; display:flex; align-items:center; gap:12px; z-index:2;"> <img src="${a}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid var(--b);"> <div style="flex:1;"> <div style="color:var(--b); font-weight:600; font-size:0.9rem; text-shadow:0 1px 4px var(--ab);">${t.authorName}</div> <div style="color:var(--ej); font-size:0.75rem; text-shadow:0 1px 4px var(--ab);">${Jg(t.createdAt)}</div> </div> <button onclick="closeStoryViewer()" style="background:transparent; border:none; color:var(--b); font-size:1.5rem; cursor:pointer; padding:8px; text-shadow:0 1px 4px var(--ab);">\u2715</button> </div> <!-- Content --> <div style="flex:1; display:flex; align-items:${s ? "flex-end" : "center"}; justify-content:center; text-align:center; padding:${s ? "20px 20px 30px" : "40px 20px"}; z-index:2;"> <div> ${s ? "" : `<div style="font-size:${o ? "4rem" : "5rem"}; margin-bottom:20px; text-shadow:0 2px 10px var(--am);">${t.emoji}</div>`} <div style="color:var(--b); font-size:${o ? "1.3rem" : "1.5rem"}; font-weight:600; text-shadow:0 2px 10px var(--bp); line-height:1.4;">${s ? t.emoji + " " : ""}${t.text}</div> </div> </div> <!-- Footer actions --> <div style="padding:16px; display:flex; align-items:center; gap:10px; z-index:2;"> ${"ama" === t.category ? ` <button onclick="closeStoryViewer(); ${n ? `openUnifiedProfile('${n.id}', 'chat')` : ""}" style="flex:1; padding:12px; background:var(--dt); border:1px solid var(--du); border-radius:20px; color:var(--b); cursor:pointer; font-size:0.9rem;">Send a message...</button> ` : ` <div style="display:flex; gap:8px;"> ${["\u2764\uFE0F", "\u{1F525}", "\u{1F602}", "\u{1F60D}", "\u{1F440}"].map((e2) => `<button onclick="reactToStory('${t.id}', '${e2}')" style="background:var(--es); border:none; border-radius:50%; width:40px; height:40px; font-size:1.2rem; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.transform='scale(1.2)'" onmouseleave="this.style.transform='scale(1)'">${e2}</button>`).join("")} </div> `}
          ${n ? `<button onclick="closeStoryViewer(); openUnifiedProfile('${n.id}', 'chat')" style="background:var(--dt); border:1px solid var(--du); color:var(--b); padding:10px 16px; border-radius:20px; cursor:pointer; font-size:0.85rem;">\u{1F4AC} Chat</button>` : ""} </div> </div> `, i.addEventListener("click", (e2) => {
    e2.target === i && closeStoryViewer();
  }), document.body.appendChild(i);
  const m = s ? 8e3 : 5e3;
  setTimeout(() => {
    const e2 = $("storyProgress");
    e2 && (e2.style.transitionDuration = `${m}ms`, e2.style.width = "100%");
  }, 50);
  let u2 = false, g = m, h = Date.now();
  function y() {
    if (u2) return;
    u2 = true, g = Math.max(0, g - (Date.now() - h)), window.__storyAutoCloseTimer__ && (clearTimeout(window.__storyAutoCloseTimer__), window.__storyAutoCloseTimer__ = null);
    const e2 = $("storyProgress");
    if (e2) {
      const t2 = window.getComputedStyle(e2).width;
      e2.style.transitionDuration = "0ms", e2.style.width = t2;
    }
  }
  function f() {
    if (!u2) return;
    u2 = false, h = Date.now(), window.__storyAutoCloseTimer__ = setTimeout(() => {
      window.__storyAutoCloseTimer__ = null, closeStoryViewer();
    }, g);
    const e2 = $("storyProgress");
    e2 && (e2.style.transitionDuration = `${g}ms`, e2.style.width = "100%");
  }
  const b = i.querySelector(".story-image-bg");
  function v(t2) {
    if ("Escape" === t2.key) closeStoryViewer();
    else if ("ArrowRight" === t2.key || "ArrowDown" === t2.key) {
      const t3 = gameState.socialNetwork?.stories || [], n2 = t3.findIndex((t4) => t4.id === e);
      n2 >= 0 && n2 < t3.length - 1 ? (closeStoryViewer(), openStoryViewer(t3[n2 + 1].id)) : closeStoryViewer();
    } else if ("ArrowLeft" === t2.key || "ArrowUp" === t2.key) {
      const t3 = gameState.socialNetwork?.stories || [], n2 = t3.findIndex((t4) => t4.id === e);
      n2 > 0 && (closeStoryViewer(), openStoryViewer(t3[n2 - 1].id));
    }
  }
  b && (b.addEventListener("mouseenter", y), b.addEventListener("mouseleave", f), b.addEventListener("touchstart", y, { passive: true }), b.addEventListener("touchend", f, { passive: true })), window.addEventListener("keydown", v), i._storyKeyHandler = v, window.__storyAutoCloseTimer__ && clearTimeout(window.__storyAutoCloseTimer__), h = Date.now(), window.__storyAutoCloseTimer__ = setTimeout(() => {
    window.__storyAutoCloseTimer__ = null, closeStoryViewer();
  }, m), renderStoriesBar();
}
function closeStoryViewer() {
  const e = $("storyViewer");
  e && (window.__storyAutoCloseTimer__ && (clearTimeout(window.__storyAutoCloseTimer__), window.__storyAutoCloseTimer__ = null), e._storyKeyHandler && window.removeEventListener("keydown", e._storyKeyHandler), e.remove());
}
function reactToStory(e, t) {
  zg();
  const n = gameState.socialNetwork.stories.find((t2) => t2.id === e);
  if (!n) return;
  n.reactions.push({ emoji: t, fromId: "player", timestamp: Date.now() });
  const a = gameState.employees.find((e2) => e2.id === n.authorId);
  a && ("function" == typeof remember && remember(a, `Boss reacted ${t} to my story: "${n.text}"`, "interaction", 1), a.stats && (a.stats.affection = Math.min(100, (a.stats.affection || 0) + 1))), document.querySelectorAll("#storyViewer button").forEach((e2) => {
    e2.textContent === t && (e2.style.background = "var(--dl)", e2.style.transform = "scale(1.3)", setTimeout(() => {
      e2.style.background = "var(--es)", e2.style.transform = "scale(1)";
    }, 300));
  });
}
function calculateForYouScore(e, t) {
  let n = 0;
  const a = gameState.employees.find((t2) => t2.id === e.authorId);
  if (a && (n += 0.5 * (a.stats?.affection || 0), n += 0.3 * (a.stats?.trust || 0), n += 0.4 * (a.stats?.desire || 0), n += 0.6 * (a.memory?.intimacyLevel || 0)), e.imageUrl && (n += 15), e.explicitLevel >= 2 && (n += 10), "poll" === e.type && (n += 20), a) {
    const e2 = gameState.chatHistory?.[a.id];
    if (e2 && e2.length > 0) {
      const a2 = (t - (e2[e2.length - 1].timestamp || 0)) / 36e5;
      a2 < 1 ? n += 40 : a2 < 4 ? n += 20 : a2 < 24 && (n += 10);
    }
  }
  const o = (e.upvotes || 0) - (e.downvotes || 0) + (e.likes?.length || 0) + 2 * (e.comments?.length || 0);
  n += Math.min(30, 2 * o);
  const i = Math.max(0, t - e.timestamp) / 36e5;
  return n /= Math.pow(i + 1, 0.8), n += 10 * Math.random(), n;
}
function renderPollHTML(e, t = false) {
  if (!e.poll) return "";
  const n = e.poll, a = n.options.reduce((e2, t2) => e2 + (t2.votes || 0), 0), o = void 0 !== n.playerVote && null !== n.playerVote;
  return ` <div class="poll-container" style="${t ? "margin:14px 0;" : "margin:10px 0;"}">
        ${n.options.map((t2, i) => {
    const s = a > 0 ? Math.round(t2.votes / a * 100) : 0, r = n.playerVote === i, l = o;
    return ` <div class="poll-option ${o ? "voted" : ""}" 
                 ${o ? "" : `onclick="voteOnPoll('${e.id}', ${i})"`}
                 style="${r ? "border-color:var(--d); background:rgba(0,212,255,0.08);" : ""}">
              ${l ? `<div class="poll-bar" style="width:${s}%;"></div>` : ""} <div class="poll-label"> <span>${r ? "\u2713 " : ""}${t2.text}</span> ${l ? `<span class="poll-percent">${s}%</span>` : ""} </div> </div> `;
  }).join("")} <div class="poll-total-votes">${a} vote${1 !== a ? "s" : ""}</div> </div> `;
}
function voteOnPoll(e, t) {
  const n = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  n?.poll && void 0 === n.poll.playerVote && (n.poll.playerVote = t, n.poll.options[t].votes = (n.poll.options[t].votes || 0) + 1, addSocialNotification({ type: "poll_vote", fromId: "player", fromName: "You", postId: n.id, preview: n.poll.options[t].text, targetAuthorId: n.authorId }), "social" === gameState.activeTab && renderSocialFeed(), fg.activePostId === e && (closePostModal(), openPostModal(e)));
}
function generateAutonomousPollVotes() {
  const e = gameState.socialNetwork.posts.filter((e2) => e2.poll && !e2.poll.closed);
  if (0 === e.length) return;
  const t = gameState.employees.filter((e2) => "active" === e2.employmentStatus);
  for (const n of e) for (const e2 of t) {
    if (n.poll.voterIds?.includes(e2.id)) continue;
    if (Math.random() > 0.15) continue;
    const t2 = e2.personality || {};
    let a = n.poll.options.map((e3, a2) => {
      let o2 = 1 + Math.random();
      return 0 === a2 && (o2 += 0.02 * (t2.confidence || 50)), a2 === n.poll.options.length - 1 && (o2 += 0.02 * (t2.humor || 50)), o2;
    });
    const o = a.reduce((e3, t3) => e3 + t3, 0);
    let i = Math.random() * o, s = 0;
    for (let e3 = 0; e3 < a.length; e3++) if (i -= a[e3], i <= 0) {
      s = e3;
      break;
    }
    n.poll.options[s].votes = (n.poll.options[s].votes || 0) + 1, n.poll.voterIds || (n.poll.voterIds = []), n.poll.voterIds.push(e2.id);
  }
}
function Ug(e) {
  const t = (e.personality || {}).flirty || 50, n = [{ q: "Best office snack?", opts: ["\u{1F355} Pizza", "\u{1F32E} Tacos", "\u{1F363} Sushi", "\u{1F957} Salad"] }, { q: "Monday mood?", opts: ["\u2615 Coffee zombie", "\u{1F4AA} Let's go!", "\u{1F634} Still sleeping", "\u{1F3E0} WFH please"] }, { q: "Friday plans?", opts: ["\u{1F389} Going out", "\u{1F6CB}\uFE0F Netflix", "\u{1F3CB}\uFE0F Gym", "\u{1F37B} Happy hour"] }, { q: "Coffee order?", opts: ["\u2615 Black", "\u{1F95B} Latte", "\u{1F9CA} Iced", "\u{1F6AB} No coffee"] }, { q: "Work playlist?", opts: ["\u{1F3B5} Pop", "\u{1F3B8} Rock", "\u{1F3B9} Lo-fi", "\u{1F507} Silence"] }, { q: "Lunch spot today?", opts: ["\u{1F354} Fast food", "\u{1F957} Healthy", "\u{1F371} Brought lunch", "\u23F0 Skipping"] }, { q: "Pet preference?", opts: ["\u{1F431} Cat", "\u{1F436} Dog", "\u{1F439} Small pet", "\u{1F6AB} None"] }, { q: "Ideal vacation?", opts: ["\u{1F3D6}\uFE0F Beach", "\u{1F3D4}\uFE0F Mountain", "\u{1F3D9}\uFE0F City trip", "\u{1F3E0} Staycation"] }, { q: "Superpower you'd want?", opts: ["\u{1F985} Flight", "\u{1F47B} Invisibility", "\u{1F9E0} Mind reading", "\u23F0 Time travel"] }, { q: "Morning routine?", opts: ["\u{1F3C3} Exercise", "\u{1F4F1} Scroll phone", "\u2615 Coffee first", "\u{1F4A4} Snooze 5x"] }];
  !Ue() && t > 60 && n.push({ q: "What's your type?", opts: ["\u{1F4AA} Athletic", "\u{1F9E0} Smart", "\u{1F602} Funny", "\u{1F608} Bold"] }, { q: "Ideal date night?", opts: ["\u{1F377} Wine & dine", "\u{1F3AC} Movie night", "\u{1F483} Dancing", "\u{1F3E0} Stay in \u{1F60F}"] }, { q: "Your love language?", opts: ["\u{1F917} Touch", "\u{1F4AC} Words", "\u{1F381} Gifts", "\u23F0 Quality time"] });
  const a = n[Math.floor(Math.random() * n.length)];
  return { content: a.q, type: "poll", poll: { options: a.opts.map((e2) => ({ text: e2, votes: 0 })), playerVote: void 0, voterIds: [], closed: false } };
}
function toggleSocialSidebar() {
  const e = $("socialFeedSidebar"), t = $("sidebarOverlay");
  if (!e) return;
  const n = e.classList.contains("mobile-open");
  e.classList.toggle("mobile-open", !n), t && t.classList.toggle("mobile-open", !n);
}
function filterAndSortPosts() {
  let e = [...gameState.socialNetwork.posts];
  const t = gameState.socialNetwork.algorithm || {}, n = gameState.time && gameState.time.currentTime || Date.now();
  console.log("[Algorithm] Starting with", e.length, "posts"), console.log("[Algorithm] Settings:", t);
  const a = gameState.employees.map((e2) => e2.id), o = e.length;
  if (e = e.filter((e2) => !("player" !== e2.authorId && !e2.isPlayerPost) || "system" === e2.authorId || a.includes(e2.authorId)), console.log(`[Algorithm] Filtered out ${o - e.length} posts from fired employees`), 0 === e.length && o > 0 && (console.warn(`[Algorithm] Author filter removed ALL ${o} posts \u2014 likely an author-id mismatch (e.g. after load/prestige). Showing all non-player posts instead of an empty feed.`), e = [...gameState.socialNetwork.posts]), Ue()) {
    const t2 = e.length;
    e = e.filter((e2) => !(e2.explicitLevel > 0 || e2.nsfwLevel > 0 || ["explicit", "thirsttrap", "nude", "lewd"].includes(e2.type))), console.log(`[Algorithm] SFW Mode: Filtered out ${t2 - e.length} NSFW posts`);
  }
  const i = t.contentRating || "all";
  "sfw" === i ? e = e.filter((e2) => 0 === e2.explicitLevel) : "nsfw" === i ? e = e.filter((e2) => e2.explicitLevel >= 1 && e2.explicitLevel <= 2) : "explicit" === i && (e = e.filter((e2) => e2.explicitLevel >= 3)), console.log("[Algorithm] After content rating filter:", e.length, "posts");
  const s = t.postType || "all";
  "text" === s ? e = e.filter((e2) => !e2.imageUrl) : "image" === s ? e = e.filter((e2) => e2.imageUrl) : "selfie" === s ? e = e.filter((e2) => "selfie" === e2.type) : "work" === s && (e = e.filter((e2) => "work" === e2.type)), console.log("[Algorithm] After post type filter:", e.length, "posts");
  const r = t.author || "all";
  "player" === r ? e = e.filter((e2) => "player" === e2.authorId || e2.isPlayerPost) : "all" !== r && (e = e.filter((e2) => e2.authorId === r)), console.log("[Algorithm] After author filter:", e.length, "posts");
  const l = t.engagement || "all";
  "popular" === l ? e = e.filter((e2) => (e2.likes?.length || 0) + (e2.upvotes || 0) - (e2.downvotes || 0) >= 5) : "viral" === l ? e = e.filter((e2) => (e2.likes?.length || 0) + (e2.upvotes || 0) - (e2.downvotes || 0) >= 20) : "active" === l && (e = e.filter((e2) => (e2.comments?.length || 0) >= 5)), console.log("[Algorithm] After engagement filter:", e.length, "posts");
  const c = t.searchQuery || "";
  if (c && c.trim()) {
    const t2 = c.toLowerCase();
    e = e.filter((e2) => {
      if (e2.content && e2.content.toLowerCase().includes(t2)) return true;
      const n2 = e2.isPlayerPost ? "you" : gameState.employees.find((t3) => t3.id === e2.authorId)?.name?.toLowerCase();
      return !(!n2 || !n2.includes(t2)) || !(!e2.tags || !e2.tags.some((e3) => e3.toLowerCase().includes(t2))) || !(!e2.mentions || !e2.mentions.some((e3) => e3.toLowerCase().includes(t2)));
    });
  }
  console.log("[Algorithm] After search filter:", e.length, "posts");
  const d = t.sort || "hot";
  if ("hot" === d) e.sort((e2, t2) => {
    const a2 = Yg(e2, n);
    return Yg(t2, n) - a2;
  });
  else if ("best" === d) {
    const a2 = t.bestTimeFrame || "all", o2 = Vg(a2, n);
    "all" !== a2 && (e = e.filter((e2) => e2.timestamp >= o2)), e.sort((e2, t2) => {
      const n2 = (e2.upvotes || 0) - (e2.downvotes || 0) + (e2.likes?.length || 0) + (e2.comments?.length || 0);
      return (t2.upvotes || 0) - (t2.downvotes || 0) + (t2.likes?.length || 0) + (t2.comments?.length || 0) - n2;
    });
  } else "recent" === d ? e.sort((e2, t2) => t2.timestamp - e2.timestamp) : "controversial" === d ? e.sort((e2, t2) => {
    const n2 = Wg(e2);
    return Wg(t2) - n2;
  }) : "foryou" === d && e.sort((e2, t2) => {
    const a2 = calculateForYouScore(e2, n);
    return calculateForYouScore(t2, n) - a2;
  });
  return console.log("[Algorithm] Final sorted posts:", e.length), e;
}
