// ============================================================================
// 49-social-autonomy — Social autonomy: news, mentions, player post composer, autonomous posts/comments/likes, test post generation.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function updateNews() {
    const e = [
            `${gameState.employees.length > 0 ? gameState.employees[0].name : "Your company"} makes headlines with innovative approach`,
            `Industry experts praise ${gameState.employees.length > 0 ? gameState.employees[0].name : "your team"}'s performance`,
            "New workplace policies at your company set industry standards",
            "Your business growth outpaces competitors this quarter",
            "Employee satisfaction at your company reaches all-time high",
            "Tech community buzzing about your latest product launch",
        ],
        t = e[Math.floor(Math.random() * e.length)];
    gameState.news.unshift(t),
        gameState.news.length > 5 && (gameState.news = gameState.news.slice(0, 5)),
        newsContent && (newsContent.textContent = t),
        "dashboard" === gameState.activeTab && updateNewsFeed();
}
function getMentionSuggestions(e = "") {
    const t = gameState.employees.filter((e) => e && "active" === e.employmentStatus && e.id),
        n = Date.now(),
        a = gameState.playerMentionStats || { mentionHistory: [], mentionCounts: {} };
    a.mentionCounts || (a.mentionCounts = {}), a.mentionHistory || (a.mentionHistory = []);
    const o = [],
        i = (e || "").toLowerCase();
    if (
        ((!i || "theboss".includes(i) || "boss".includes(i)) &&
            o.push({
                employee: { id: "player", name: "You (TheBoss)" },
                username: "TheBoss",
                name: "You (TheBoss)",
                affection: 100,
                mentionCount: 0,
                score: 5e3,
            }),
        (!i || "player".includes(i) || "me".includes(i)) &&
            o.push({
                employee: { id: "player", name: "You (player)" },
                username: "player",
                name: "You (player)",
                affection: 100,
                mentionCount: 0,
                score: 4900,
            }),
        0 === t.length)
    )
        return o;
    const s = t
            .map((t) => {
                if (!t || !t.id) return null;
                let o = 0;
                const i = a.mentionCounts[t.id] || 0;
                o += 50 * i;
                const s = a.mentionHistory.filter((e) => e && e.employeeId === t.id && n - e.timestamp < 6048e5);
                if (s.length > 0) {
                    const e = Math.max(...s.map((e) => e.timestamp)),
                        t = (n - e) / 864e5;
                    o += Math.max(0, 100 - 10 * t);
                }
                const r = t.stats?.affection || 0;
                o += ((r + (t.intimacy || 0)) / 2) * 0.3;
                const l = t.social?.username || t.name.toLowerCase().replace(/\s+/g, ""),
                    c = t.name.toLowerCase(),
                    d = e.toLowerCase();
                return (
                    d && (l.startsWith(d) || c.startsWith(d))
                        ? (o += 1e3)
                        : d && (l.includes(d) || c.includes(d)) && (o += 500),
                    {
                        employee: t,
                        username: t.social?.username || l,
                        name: t.name,
                        affection: r,
                        mentionCount: i,
                        score: o,
                    }
                );
            })
            .filter((e) => null !== e),
        r = [...o, ...s];
    if ((r.sort((e, t) => t.score - e.score), e)) {
        const t = e.toLowerCase();
        return r.filter((e) => e.username.toLowerCase().includes(t) || e.name.toLowerCase().includes(t));
    }
    return r;
}
function trackPlayerMention(e) {
    gameState.playerMentionStats || (gameState.playerMentionStats = { mentionHistory: [], mentionCounts: {} });
    const t = gameState.playerMentionStats;
    (t.mentionHistory && Array.isArray(t.mentionHistory)) || (t.mentionHistory = []),
        (t.mentionCounts && "object" == typeof t.mentionCounts) || (t.mentionCounts = {}),
        t.mentionHistory.push({ employeeId: e, timestamp: gameState.time?.currentTime || Date.now() }),
        t.mentionCounts[e] || (t.mentionCounts[e] = 0),
        t.mentionCounts[e]++,
        t.mentionHistory.length > 100 && t.mentionHistory.shift(),
        console.log(`[Mentions] Tracked mention of ${e}, total: ${t.mentionCounts[e]}`);
}
function expandImageMentions(e) {
    if (!e) return e;
    let t = e;
    const n = [...e.matchAll(/@([\w.]+)/g)];
    if (0 === n.length) return e;
    console.log(`[Image Mentions] Found ${n.length} @mention(s) in image prompt`);
    for (const e of n) {
        const n = e[1],
            a = e[0];
        if (
            "player" === n.toLowerCase() ||
            "theboss" === n.toLowerCase() ||
            "boss" === n.toLowerCase() ||
            "me" === n.toLowerCase()
        ) {
            console.log(`[Image Mentions] Processing self-mention: @${n}`);
            const e = getPlayerPhysicalDescription();
            if (e) {
                const o = `the player (${e})`;
                (t = t.replace(a, o)),
                    console.log(`[Image Mentions] Expanded @${n} to player description: ${o.substring(0, 100)}...`);
            } else {
                const e = "the player";
                (t = t.replace(a, e)),
                    console.log("[Image Mentions] No player description set, using generic reference");
            }
            continue;
        }
        const o = gameState.employees.find((e) => {
            const t = e.social?.username || "",
                a = e.name || "",
                o = a.split(" ")[0] || "",
                i = a.split(" ").slice(1).join(" ") || "",
                s = a.toLowerCase().replace(/\s+/g, ""),
                r = a.toLowerCase().replace(/\s+/g, "_"),
                l = a.toLowerCase().replace(/\s+/g, "."),
                c = n.toLowerCase(),
                d = t.toLowerCase();
            return d === c
                ? (console.log(`[Image Mentions] ✓ Matched @${n} to ${a} (exact username)`), !0)
                : o.toLowerCase() === c
                  ? (console.log(`[Image Mentions] ✓ Matched @${n} to ${a} (first name)`), !0)
                  : s === c
                    ? (console.log(`[Image Mentions] ✓ Matched @${n} to ${a} (name no spaces)`), !0)
                    : r === c
                      ? (console.log(`[Image Mentions] ✓ Matched @${n} to ${a} (name with underscore)`), !0)
                      : l === c
                        ? (console.log(`[Image Mentions] ✓ Matched @${n} to ${a} (name with dot)`), !0)
                        : d.includes(c) || c.includes(d.replace(/^(the_|real_|official_)|(_official)$/g, ""))
                          ? (console.log(`[Image Mentions] ✓ Matched @${n} to ${a} (partial username match)`), !0)
                          : !(!i || i.toLowerCase() !== c) &&
                            (console.log(`[Image Mentions] ✓ Matched @${n} to ${a} (last name)`), !0);
        });
        if (o) {
            let e = getPhysicalDescriptionForPrompt(o);
            if (!e || e.length < 20)
                if (o.appearance?.prompt) {
                    e = o.appearance.prompt
                        .replace(
                            /,?\s*(photorealistic|high detail|professional photography|realistic lighting|anime style|manga art|cel-shaded|vibrant colors|artistic painting|painterly style|fine art|cartoon style|comic book art|cinematic lighting|movie scene|dramatic|film quality|professional studio|clean lighting|corporate setting|polished|high quality|detailed)/gi,
                            ""
                        )
                        .replace(/,\s*,/g, ",")
                        .trim();
                } else if (o.appearance?.description) e = o.appearance.description;
                else {
                    const t = [];
                    o.gender && t.push(o.gender),
                        o.ethnicity && t.push(o.ethnicity),
                        o.appearance?.hair && t.push(`${o.appearance.hair} hair`),
                        o.appearance?.eyes && t.push(`${o.appearance.eyes} eyes`),
                        o.appearance?.body && t.push(o.appearance.body),
                        (e = t.join(", ") || "employee");
                }
            const i = `${o.name} (${e})`;
            (t = t.replace(a, i)), console.log(`[Image Mentions] Expanded @${n} to: ${i.substring(0, 100)}...`);
        } else {
            console.log(`[Image Mentions] Could not find employee for @${n}`);
            const e = gameState.employees
                .slice(0, 5)
                .map((e) => e.name)
                .join(", ");
            console.log(`[Image Mentions] Available employees (first 5): ${e}`);
        }
    }
    return t;
}
function extractMentions(e) {
    const t = [],
        n = /@([\w.]+)/g;
    let a;
    for (; null !== (a = n.exec(e)); ) {
        const e = a[1].toLowerCase();
        if ("theboss" === e || "boss" === e) {
            t.push({ username: a[1], employeeId: "player", fullMention: a[0] }),
                console.log(`[Mention] Found @${a[1]} -> The Boss (player)`);
            continue;
        }
        const n = gameState.employees.find((t) => {
            if (!t.social?.username) return !1;
            const n = t.social.username.toLowerCase();
            if (n === e) return !0;
            const a = (e) => e.replace(/[_.\-\d]/g, "").replace(/^(the|real)|official$/g, "");
            if (a(n) === a(e)) return !0;
            const o = t.name.split(" ")[0].toLowerCase();
            if (e === o) return !0;
            const i = t.name.toLowerCase().replace(/\s+/g, "");
            return e === i || !(!n.includes(e) && !e.includes(n.replace(/^(the_|real_)|_official$/g, "")));
        });
        n
            ? (t.push({ username: a[1], employeeId: n.id, fullMention: a[0] }),
              console.log(`[Mention] Found @${a[1]} -> ${n.name} (username: ${n.social.username}, ID: ${n.id})`))
            : console.warn(`[Mention] Could not find employee for @${a[1]}`);
    }
    return console.log(`[Mention] Extracted ${t.length} mentions:`, t), t;
}
function showMentionSuggestions(e, t = "") {
    const n = $("mentionSuggestions");
    if (!n) return;
    const a = getMentionSuggestions(t);
    if (0 === a.length) return void (n.style.display = "none");
    const o = a.slice(0, 8);
    (n.innerHTML = o
        .map((e, t) => {
            const n = e.affection > 70 ? "💕" : e.affection > 40 ? "😊" : "👤",
                a =
                    e.mentionCount > 0
                        ? `<span style="background:var(--surface-2); padding:2px 6px; border-radius:4px; font-size:0.75rem; color:var(--accent);">${e.mentionCount}x</span>`
                        : "";
            return `\n        <div class="mention-suggestion-item" data-index="${t}" data-username="${e.username}" data-employee-id="${e.employee.id}" style="padding:10px 15px; cursor:pointer; border-bottom:1px solid var(--l-line); display:flex; align-items:center; justify-content:space-between; transition:background 0.2s;">\n          <div style="display:flex; align-items:center; gap:10px; flex:1;">\n            <span style="font-size:1.2rem;">${n}</span>\n            <div style="flex:1;">\n              <div style="color:var(--l-ink); font-weight:600;">@${e.username}</div>\n              <div style="color:var(--text-dim); font-size:0.85rem;">${e.name}</div>\n            </div>\n          </div>\n          ${a}\n        </div>\n      `;
        })
        .join("")),
        n.querySelectorAll(".mention-suggestion-item").forEach((t) => {
            t.addEventListener("mouseenter", () => {
                t.style.background = "var(--l-line)";
            }),
                t.addEventListener("mouseleave", () => {
                    t.style.background = "transparent";
                }),
                t.addEventListener("click", () => {
                    const n = t.dataset.username,
                        a = t.dataset.employeeId;
                    insertMention(e, n, a);
                });
        }),
        (n.style.display = "block");
}
function insertMention(e, t, n, a = "mentionSuggestions") {
    if (!e) return;
    const o = e.value,
        i = e.selectionStart;
    let s = i - 1;
    for (; s >= 0 && "@" !== o[s]; ) s--;
    if (s >= 0) {
        const a = o.substring(0, s),
            r = o.substring(i);
        e.value = a + "@" + t + " " + r;
        const l = s + t.length + 2;
        (e.selectionStart = l), (e.selectionEnd = l), trackPlayerMention(n), e.dispatchEvent(new Event("input"));
    }
    const r =
        "mentionSuggestions" === a ||
        "modalMentionSuggestions" === a ||
        "sendImageMentionSuggestions" === a ||
        "postImageMentionSuggestions" === a ||
        "requestImageMentionSuggestions" === a
            ? $(a)
            : document.querySelector(`.comment-mention-suggestions[data-post-id="${a}"]`);
    r && (r.style.display = "none"), e.focus();
}
function setupMentionAutocomplete(e, t = "mentionSuggestions") {
    if (!e) return;
    let n = !1,
        a = -1,
        o = 0;
    const i = () =>
            "mentionSuggestions" === t ||
            "modalMentionSuggestions" === t ||
            "sendImageMentionSuggestions" === t ||
            "postImageMentionSuggestions" === t ||
            "requestImageMentionSuggestions" === t
                ? $(t)
                : document.querySelector(`.comment-mention-suggestions[data-post-id="${t}"]`),
        s = () => {
            const e = i();
            if (!e) return;
            e.querySelectorAll(".mention-suggestion-item").forEach((e, t) => {
                t === o
                    ? ((e.style.background = "var(--l-line)"), e.setAttribute("data-highlighted", "true"))
                    : ((e.style.background = "transparent"), e.removeAttribute("data-highlighted"));
            });
        },
        r = (a) => {
            const r = getMentionSuggestions(a).slice(0, 6);
            if (0 === r.length) {
                const e = i();
                return void (e && (e.style.display = "none"));
            }
            const l = i();
            l &&
                ((l.innerHTML = r
                    .map((e, t) => {
                        const n = e.affection > 70 ? "💕" : e.affection > 40 ? "😊" : "👤",
                            a =
                                e.mentionCount > 0
                                    ? `<span style="background:var(--surface-2); padding:2px 6px; border-radius:4px; font-size:0.75rem; color:var(--accent);">${e.mentionCount}x</span>`
                                    : "";
                        return `\n          <div class="mention-suggestion-item" data-index="${t}" data-username="${e.username}" data-employee-id="${e.employee.id}" style="padding:10px 15px; cursor:pointer; border-bottom:1px solid var(--l-line); display:flex; align-items:center; justify-content:space-between; transition:background 0.2s;">\n            <div style="display:flex; align-items:center; gap:10px; flex:1;">\n              <span style="font-size:1.2rem;">${n}</span>\n              <div style="flex:1;">\n                <div style="color:var(--l-ink); font-weight:600;">@${e.username}</div>\n                <div style="color:var(--text-dim); font-size:0.85rem;">${e.name}</div>\n              </div>\n            </div>\n            ${a}\n          </div>\n        `;
                    })
                    .join("")),
                l.querySelectorAll(".mention-suggestion-item").forEach((a, i) => {
                    a.addEventListener("mouseenter", () => {
                        (o = i), s();
                    }),
                        a.addEventListener("click", () => {
                            const o = a.dataset.username,
                                i = a.dataset.employeeId;
                            insertMention(e, o, i, t), (n = !1);
                        });
                }),
                (o = 0),
                s(),
                (l.style.display = "block"));
        };
    e.addEventListener("input", (t) => {
        const o = e.value,
            s = e.selectionStart,
            l = s > 0 ? o[s - 1] : "",
            c = s > 1 ? o[s - 2] : "";
        if ("@" !== l || (1 !== s && " " !== c && "\n" !== c)) {
            if (n) {
                const e = o.substring(a + 1, s);
                if (e.includes(" ") || e.includes("\n")) {
                    n = !1;
                    const e = i();
                    e && (e.style.display = "none");
                } else r(e);
            }
        } else (n = !0), (a = s - 1), r("");
    }),
        e.addEventListener("keydown", (a) => {
            const r = i();
            if (!r || "none" === r.style.display) return;
            const l = r.querySelectorAll(".mention-suggestion-item");
            if (0 !== l.length)
                if ("Escape" === a.key) (r.style.display = "none"), (n = !1);
                else if ("ArrowDown" === a.key) a.preventDefault(), (o = (o + 1) % l.length), s();
                else if ("ArrowUp" === a.key) a.preventDefault(), (o = (o - 1 + l.length) % l.length), s();
                else if ("Tab" === a.key || "Enter" === a.key) {
                    a.preventDefault();
                    const i = l[o];
                    if (i) {
                        const a = i.dataset.username,
                            o = i.dataset.employeeId;
                        insertMention(e, a, o, t), (n = !1);
                    }
                }
        });
    document.addEventListener("click", (t) => {
        const a = i();
        !a || e.contains(t.target) || a.contains(t.target) || ((a.style.display = "none"), (n = !1));
    });
}
function openPlayerPostComposer() {
    const e = $("playerPostModal");
    if (!e) return;
    const t = $("playerPostCaption"),
        n = $("playerPostImagePrompt"),
        a = $("playerPostAltText"),
        o = $("playerPostExplicit"),
        i = $("captionCharCount"),
        s = $("playerPostImagePreview");
    t && (t.value = ""),
        n && (n.value = ""),
        a && (a.value = ""),
        o && (o.checked = !1),
        i && (i.textContent = "0"),
        s && (s.style.display = "none"),
        document.querySelectorAll(".post-type-btn").forEach((e) => {
            e.classList.remove("active"), (e.style.borderColor = "var(--l-line)"), (e.style.color = "var(--l-ink-dim-2)");
        });
    const r = document.querySelector('.post-type-btn[data-type="text"]');
    r && (r.classList.add("active"), (r.style.borderColor = "var(--l-cyan)"), (r.style.color = "var(--l-ink)"));
    const l = $("playerPostImageSection"),
        c = $("generatePlayerPostImage");
    l && (l.style.display = "none"),
        c && (c.style.display = "none"),
        delete gameState.tempPostImage,
        t && setupMentionAutocomplete(t),
        (e.style.display = "flex");
}
function closePlayerPostModal() {
    const e = $("playerPostModal");
    e && (e.style.display = "none"), delete gameState.tempPostImage;
}
async function generatePlayerPostImage_handler() {
    console.log("═══════════════════════════════════════════════════════"),
        console.log("🎨 [IMAGE GENERATION PIPELINE] Starting..."),
        console.log("═══════════════════════════════════════════════════════");
    const e = $("playerPostImagePrompt"),
        t = $("playerPostAltText"),
        n = $("generatePlayerPostImage"),
        a = $("playerPostImagePreview"),
        o = $("playerPostPreviewImg");
    if (!e || !n) return void console.error("[IMAGE GEN] ❌ Required DOM elements not found");
    const i = e.value.trim();
    if (
        (console.log("[IMAGE GEN] STEP 1: Validate Input"),
        console.log("[IMAGE GEN] User Prompt:", i || "(empty)"),
        !i)
    )
        return (
            console.warn("[IMAGE GEN] ❌ Validation failed: Empty prompt"),
            void showAlert("Please enter an image description first!", "Missing Description", "warning")
        );
    console.log("[IMAGE GEN] ✅ Validation passed"),
        console.log("[IMAGE GEN] Prompt length:", i.length, "characters");
    const s = expandImageMentions(i);
    s !== i &&
        (console.log("[IMAGE GEN] 🔄 Expanded @mentions in prompt"),
        console.log("[IMAGE GEN] Expanded Prompt:", s)),
        console.log("───────────────────────────────────────────────────────"),
        console.log("[IMAGE GEN] STEP 2: Analyze Prompt Context"),
        console.log("───────────────────────────────────────────────────────");
    const r = s.toLowerCase(),
        l = {
            mentions: {
                person: /\b(person|people|man|woman|guy|girl|employee|worker)\b/i.test(i),
                location: /\b(office|desk|room|outside|park|beach|home|building)\b/i.test(i),
                object: /\b(desk|chair|computer|phone|coffee|car|food)\b/i.test(i),
                clothing: /\b(dress|suit|shirt|pants|outfit|uniform|casual|formal)\b/i.test(i),
                action: /\b(sitting|standing|walking|working|smiling|looking|holding)\b/i.test(i),
            },
            style: {
                selfie: /\b(selfie|self portrait)\b/i.test(i),
                professional: /\b(professional|business|work|formal|corporate)\b/i.test(i),
                casual: /\b(casual|relaxed|informal|candid)\b/i.test(i),
                artistic: /\b(artistic|creative|stylized|aesthetic)\b/i.test(i),
            },
            suggestiveKeywords: [
                "sexy",
                "hot",
                "revealing",
                "attractive",
                "seductive",
                "provocative",
                "intimate",
                "sensual",
            ].filter((e) => r.includes(e)),
        };
    console.log("[IMAGE GEN] Content Analysis:", {
        hasPerson: l.mentions.person,
        hasLocation: l.mentions.location,
        hasAction: l.mentions.action,
        style: Object.keys(l.style).filter((e) => l.style[e]),
        suggestiveWords: l.suggestiveKeywords.length > 0 ? l.suggestiveKeywords : "none",
    }),
        console.log("───────────────────────────────────────────────────────"),
        console.log("[IMAGE GEN] STEP 3: Prepare Generation"),
        console.log("───────────────────────────────────────────────────────"),
        (n.textContent = "⏳ Generating..."),
        (n.disabled = !0),
        (n.style.opacity = "0.6"),
        console.log("[IMAGE GEN] UI State: Loading"),
        console.log("[IMAGE GEN] Calling generateImage API...");
    const c = Date.now();
    try {
        console.log("───────────────────────────────────────────────────────"),
            console.log("[IMAGE GEN] STEP 4: Generate Image (AI Processing)"),
            console.log("───────────────────────────────────────────────────────"),
            console.log("[IMAGE GEN] Prompt sent to AI:", s);
        const e = await queuedGenerateImage(applyImageStyle(s), "Player social post image"),
            r = ((Date.now() - c) / 1e3).toFixed(2);
        console.log(`[IMAGE GEN] ✅ Image generated successfully in ${r}s`),
            console.log("[IMAGE GEN] Image URL:", e.substring(0, 100) + "..."),
            console.log("───────────────────────────────────────────────────────"),
            console.log("[IMAGE GEN] STEP 5: Store & Display Image"),
            console.log("───────────────────────────────────────────────────────"),
            (gameState.tempPostImage = e),
            console.log("[IMAGE GEN] ✅ Image stored in gameState.tempPostImage"),
            a && o
                ? ((o.src = e), (a.style.display = "block"), console.log("[IMAGE GEN] ✅ Preview displayed"))
                : console.warn("[IMAGE GEN] ⚠️ Preview container not found"),
            t && !t.value.trim()
                ? ((t.value = i), console.log("[IMAGE GEN] ✅ Alt text auto-filled with prompt"))
                : console.log("[IMAGE GEN] Alt text already present, not overwriting"),
            console.log("───────────────────────────────────────────────────────"),
            console.log("[IMAGE GEN] STEP 6: Update UI State"),
            console.log("───────────────────────────────────────────────────────"),
            (n.textContent = "✓ Image Generated!"),
            (n.style.background = "var(--l-cyan)"),
            console.log("[IMAGE GEN] UI State: Success"),
            setTimeout(() => {
                (n.textContent = "🎨 Generate Image"),
                    (n.style.background = "var(--l-purple-deep)"),
                    (n.disabled = !1),
                    (n.style.opacity = "1"),
                    console.log("[IMAGE GEN] UI State: Reset to ready");
            }, 2e3),
            console.log("═══════════════════════════════════════════════════════"),
            console.log("✅ [IMAGE GENERATION PIPELINE] COMPLETE"),
            console.log(`   Total time: ${r}s`),
            console.log("═══════════════════════════════════════════════════════\n");
    } catch (e) {
        const t = ((Date.now() - c) / 1e3).toFixed(2);
        console.log("═══════════════════════════════════════════════════════"),
            console.error("❌ [IMAGE GENERATION PIPELINE] FAILED"),
            console.error(`   Time to failure: ${t}s`),
            console.error("   Error:", e),
            console.log("═══════════════════════════════════════════════════════\n"),
            showAlert("Failed to generate image. Please try again.", "Generation Failed", "error"),
            (n.textContent = "🎨 Generate Image"),
            (n.disabled = !1),
            (n.style.opacity = "1");
    }
}
async function regeneratePlayerPostImage() {
    await generatePlayerPostImage_handler();
}
function submitPlayerPostToFeed() {
    console.log("═══════════════════════════════════════════════════════"),
        console.log("🚀 [POST CREATION PIPELINE] STEP 1: Initialize Post"),
        console.log("═══════════════════════════════════════════════════════");
    const e = $("playerPostCaption"),
        t = $("playerPostAltText"),
        n = $("playerPostExplicit"),
        a = $("playerPostImagePrompt"),
        o = e?.value.trim() || "",
        i = gameState.tempPostImage || null,
        s = t?.value.trim() || "",
        r = n?.checked || !1,
        l = a?.value.trim() || null;
    if (isSFWMode() && r)
        return void showNotification("🛡️ SFW Mode is enabled - Explicit posts are blocked", "warning");
    if (
        (console.log("[POST CREATION] Input Data:", {
            caption: o || "(none)",
            imageUrl: i ? "Present" : "None",
            imageAlt: s || "(none)",
            isExplicitMarked: r,
            imagePrompt: l || "(none)",
        }),
        !o && !i)
    )
        return (
            console.warn("[POST CREATION] ❌ Validation failed: No caption or image"),
            void showAlert("Please add either a caption or an image!", "Missing Content", "warning")
        );
    if (i && !s)
        return (
            console.warn("[POST CREATION] ❌ Validation failed: Image without alt text"),
            void showAlert(
                "Please add alt text for your image (helps NPCs understand it)!",
                "Missing Alt Text",
                "warning"
            )
        );
    if (o.length > 500)
        return (
            console.warn("[POST CREATION] ❌ Validation failed: Caption too long"),
            void showAlert("Caption is too long! Maximum 500 characters.", "Caption Too Long", "warning")
        );
    console.log("[POST CREATION] ✅ Validation passed"),
        console.log("───────────────────────────────────────────────────────"),
        console.log("📋 [POST CREATION PIPELINE] STEP 2: Determine Content/Type"),
        console.log("───────────────────────────────────────────────────────");
    let c = "text";
    const d = document.querySelector(".post-type-btn.active");
    d && (c = d.dataset.type), console.log("[POST CREATION] Post Type:", c);
    let p = 0;
    if (r) (p = 3), console.log("[POST CREATION] Explicit Level: 3 (player marked as explicit)");
    else if (i) {
        ["sexy", "hot", "revealing", "underwear", "lingerie", "bikini"].some(
            (e) => s.toLowerCase().includes(e) || o.toLowerCase().includes(e)
        )
            ? ((p = 1), console.log("[POST CREATION] Explicit Level: 1 (suggestive keywords detected)"))
            : console.log("[POST CREATION] Explicit Level: 0 (safe content)");
    } else console.log("[POST CREATION] Explicit Level: 0 (text-only post)");
    console.log("───────────────────────────────────────────────────────"),
        console.log("🔍 [POST CREATION PIPELINE] STEP 3: Extract Context"),
        console.log("───────────────────────────────────────────────────────");
    const m = extractMentions(o) || [],
        u = m.map((e) => e.employeeId);
    console.log("[POST CREATION] Mention Analysis:"),
        console.log(`  - Found ${m.length} @mentions`),
        m.length > 0 &&
            m.forEach((e) => {
                const t = gameState.employees.find((t) => t.id === e.employeeId);
                console.log(`  - @${e.username} → ${t?.name} (ID: ${e.employeeId})`);
            });
    const g = {
        hasQuestion: o.toLowerCase().includes("?"),
        hasEmoji:
            /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/u.test(
                o
            ),
        wordCount: o.split(/\s+/).length,
        hasHashtag: o.includes("#"),
        hasMention: o.includes("@"),
        hasExclamation: o.includes("!"),
    };
    console.log("[POST CREATION] Caption Context:", g),
        console.log("───────────────────────────────────────────────────────"),
        console.log("📝 [POST CREATION PIPELINE] STEP 4: Create Post Object"),
        console.log("───────────────────────────────────────────────────────");
    const h = createPost({
        authorId: "player",
        authorName: "You",
        type: c,
        content: o,
        imageUrl: i,
        imageAlt: s,
        imagePrompt: l,
        explicitLevel: p,
        tags: [],
        location: gameState.activeLocationId || "headquarters",
        isPlayerPost: !0,
        referencedEmployees: u,
    });
    console.log("[POST CREATION] Post Object Created:", {
        id: h.id,
        type: h.type,
        explicitLevel: h.explicitLevel,
        hasImage: !!h.imageUrl,
        mentions: (h.referencedEmployees || []).length,
        location: h.location,
        timestamp: new Date(h.timestamp).toLocaleTimeString(),
    }),
        console.log("───────────────────────────────────────────────────────"),
        console.log("📤 [POST CREATION PIPELINE] STEP 5: Publish to Feed"),
        console.log("───────────────────────────────────────────────────────"),
        gameState.socialNetwork.posts.unshift(h),
        console.log("[POST CREATION] ✅ Post added to feed (position: 0)"),
        console.log(`[POST CREATION] Total posts in feed: ${gameState.socialNetwork.posts.length}`),
        setTimeout(() => {
            analyzePostForPublicKnowledge(h);
        }, 2e3),
        "dashboard" === gameState.activeTab &&
            (refreshDashboardSections(), console.log("[POST CREATION] Dashboard refreshed")),
        console.log("───────────────────────────────────────────────────────"),
        console.log("🧠 [POST CREATION PIPELINE] STEP 6: Update NPC Awareness"),
        console.log("───────────────────────────────────────────────────────");
    const y = `The boss posted${i ? " with image" : ""}: "${o}"`;
    let f = 0;
    for (const e of gameState.employees) "active" === e.employmentStatus && (remember(e, y, "event", 1.5), f++);
    console.log(`[POST CREATION] Updated memory for ${f} active employees`),
        console.log("───────────────────────────────────────────────────────"),
        console.log("💬 [POST CREATION PIPELINE] STEP 7: Trigger NPC Reactions"),
        console.log("───────────────────────────────────────────────────────");
    const b = 3e3 + 5e3 * Math.random();
    console.log(`[POST CREATION] NPC reactions will trigger in ${(b / 1e3).toFixed(1)}s`),
        setTimeout(() => {
            console.log("[POST CREATION] 🎬 Triggering NPC reactions now..."), triggerAutomaticNPCReactions(h);
        }, b),
        console.log("═══════════════════════════════════════════════════════"),
        console.log("✅ [POST CREATION PIPELINE] COMPLETE"),
        console.log("═══════════════════════════════════════════════════════\n"),
        closePlayerPostModal(),
        "social" !== gameState.activeTab ? switchTab("social") : renderSocialFeed();
    if (document.querySelector("#socialTab h2")) {
        const e = document.createElement("div");
        (e.style.cssText =
            "position:fixed; top:80px; right:20px; background:var(--l-cyan); color:var(--l-on-accent); padding:12px 20px; border-radius:8px; font-weight:600; box-shadow:0 4px 12px rgba(0,212,255,0.4); z-index:9999;"),
            (e.textContent = "✓ Post published!"),
            document.body.appendChild(e),
            setTimeout(() => e.remove(), 3e3);
    }
}
function generateTestPost() {
    const e = gameState.employees.filter((e) => "active" === e.employmentStatus);
    if (0 === e.length) return void showAlert("No employees to post! Hire someone first.", "No Employees", "info");
    const t = e[Math.floor(Math.random() * e.length)],
        n = t.id,
        a = t.name,
        o = ["text", "work", "selfie", "meme", "life_update"],
        i = o[Math.floor(Math.random() * o.length)],
        s = [
            "Just finished a great meeting! 💼",
            "Coffee break vibes ☕✨",
            "Feeling productive today! 🚀",
            "Anyone else excited for the weekend? 🎉",
            "New project, who dis? 👀",
            "Office life got me like... 😅",
            "Team lunch was amazing! 🍕",
            "Crushing these deadlines! 💪",
            "Best coworkers ever! ❤️",
            "Friday feeling! 🎊",
        ],
        r = s[Math.floor(Math.random() * s.length)],
        l = isSFWMode() || Math.random() < 0.8 ? 0 : Math.random() < 0.7 ? 1 : 2,
        c = createPost({
            authorId: n,
            authorName: a,
            type: i,
            content: r,
            imageUrl: null,
            imageAlt: "",
            explicitLevel: l,
            tags: [],
            location: gameState.activeLocationId || "headquarters",
            isPlayerPost: !1,
        }),
        d = gameState.employees.filter((e) => "active" === e.employmentStatus);
    d.forEach((e) => {
        Math.random() < 0.4 && e.id !== n && c.likes.push(e.id);
    });
    const p = [
        "Love this! 😍",
        "So true!",
        "Haha same here!",
        "Amazing! 🔥",
        "Can't wait!",
        "You're the best!",
        "This made my day!",
        "Absolutely!",
        "👍👍👍",
        "Facts! 💯",
    ];
    d.forEach((e) => {
        if (Math.random() < 0.15 && e.id !== n) {
            const t = p[Math.floor(Math.random() * p.length)],
                n = createComment({ postId: c.id, authorId: e.id, authorName: e.name, content: t });
            c.comments.push(n);
        }
    }),
        gameState.socialNetwork.posts.unshift(c),
        "dashboard" === gameState.activeTab && refreshDashboardSections(),
        renderSocialFeed();
}
function pickWeightedPosters(e, t) {
    const n = Date.now(),
        a = e.map((e) => {
            const t = e.personality || {},
                a = (gameState.socialNetwork?.posts || []).find((t) => t.authorId === e.id),
                o = a ? Math.min(24, Math.max(0, (n - a.timestamp) / 36e5)) : 24;
            let i = 0;
            try {
                i = (getRelevantEvents(e.id, 1) || []).length > 0 ? 25 : 0;
            } catch (e) {}
            return {
                emp: e,
                w: Math.max(
                    5,
                    0.4 * (t.outgoing || 50) +
                        0.3 * (t.confidence || 50) +
                        ((t.flirty || 50) > 65 ? 10 : 0) +
                        i +
                        1.5 * o
                ),
            };
        }),
        o = [];
    for (let e = 0; e < t && a.length > 0; e++) {
        const t = a.reduce((e, t) => e + t.w, 0);
        let n = Math.random() * t,
            i = 0;
        for (; i < a.length - 1; i++) if (((n -= a[i].w), n <= 0)) break;
        o.push(a[i].emp), a.splice(i, 1);
    }
    return o;
}
async function autonomousPostGeneration() {
    if (!gameState.socialNetwork || !gameState.employees) return;
    const e = Date.now();
    if (e - (gameState.socialNetwork.lastPostGeneration || 0) < 9e4 + 15e4 * Math.random()) return;
    const t = gameState.employees.filter(
        (e) => "active" === e.employmentStatus && !["sleeping", "vampire_rest"].includes(e.npcStatus?.current)
    );
    if (0 === t.length) return;
    gameState.socialNetwork.lastPostGeneration = e;
    const n = Math.min(3, Math.floor(1 + t.length / 6)),
        a = pickWeightedPosters(t, n);
    for (const e of a) {
        try {
            await generateEmployeePost(e);
        } catch (e) {
            console.error("Error generating employee post:", e);
        }
        await new Promise((e) => setTimeout(e, 500));
    }
    try {
        await generateAutonomousComments(),
            await generateAutonomousLikes(),
            await generateAutonomousDownvotes(),
            generateAutonomousPollVotes();
    } catch (e) {
        console.error("Error generating autonomous interactions:", e);
    }
    try {
        generateAutonomousStories();
    } catch (e) {
        console.error("Error generating stories:", e);
    }
    enforceSocialCommentCaps();
    "social" === gameState.activeTab && renderSocialFeed();
}
function isContentTooSimilar(e, t, n = 5) {
    if (!e) return !1;
    const a = gameState.socialNetwork.posts
        .filter((e) => e.authorId === t)
        .sort((e, t) => t.timestamp - e.timestamp)
        .slice(0, n);
    if (0 === a.length) return !1;
    const o = (e) =>
            e && "string" == typeof e
                ? e
                      .toLowerCase()
                      .replace(/[^\w\s]/g, "")
                      .split(/\s+/)
                      .filter((e) => e.length > 3)
                : [],
        i = o(e);
    for (const t of a) {
        if (!t.content || "string" != typeof t.content) continue;
        const n = o(t.content),
            a = i.filter((e) => n.includes(e)).length / Math.min(i.length, n.length);
        if (a > 0.7)
            return console.log(`Content similarity detected: ${Math.round(100 * a)}% overlap with recent post`), !0;
        e.toLowerCase();
        const s = t.content.toLowerCase();
        for (let e = 0; e < i.length - 4; e++) {
            const t = i.slice(e, e + 5).join(" ");
            if (t.length > 25 && s.includes(t)) return console.log(`Duplicate phrase detected: "${t}"`), !0;
        }
    }
    return !1;
}
async function generateRelationshipLifeEventPost(e, t, n) {
    setTimeout(
        async () => {
            if (!e || "active" !== e.employmentStatus) return;
            if (!gameState.socialNetwork) return;
            const a = n || null,
                o = {
                    breakup: {
                        postType: "life_update",
                        hint: `You just went through a breakup. Post something vague, raw, or emotional — let people read between the lines. ${a ? `(You and ${a} ended things.)` : ""} Keep it real, not dramatic.`,
                    },
                    called_it_off: {
                        postType: "life_update",
                        hint:
                            "You called off your engagement. Post something short and brave about moving on. Don't overshare. " +
                            (a ? `(You and ${a} called off the engagement.)` : ""),
                    },
                    became_serious: {
                        postType: "life_update",
                        hint: "Things are getting serious with someone you're dating. Post something happy but subtle — genuine contentment, not an announcement. No names needed.",
                    },
                    got_engaged: {
                        postType: "life_update",
                        hint: `YOU JUST GOT ENGAGED! Post about it — excited, gushing, joyful. ${a ? `You can mention your partner ${a} and the ring.` : ""} This is major news.`,
                    },
                    got_married: {
                        postType: "life_update",
                        hint: `You just got married! Post about it — blissful, grateful, in love. ${a ? `Mention your spouse ${a} if you want.` : ""} This is a big deal.`,
                    },
                    separated: {
                        postType: "mood",
                        hint: 'You and your partner are going through a serious rough patch and have separated. Post something vague and heavy — clearly going through something. Don\'t use the word "separated".',
                    },
                    divorced: {
                        postType: "life_update",
                        hint: "Your divorce is finalized. Post about closing a chapter and starting fresh. Can be sad, can be relieved, can be both. Keep it dignified.",
                    },
                    reconciled: {
                        postType: "mood",
                        hint: "You and your partner reconciled after a rough patch. Post something quiet and hopeful — not a big announcement, just genuine relief and warmth.",
                    },
                    new_relationship: {
                        postType: "life_update",
                        hint: 'You\'ve met someone new and started dating. Post a subtle, happy hint — "met someone", "good things happening" — without naming them. Keep it low-key.',
                    },
                }[t];
            if (!o) return;
            const i = getEmployeeAwarenessForPost(e.id);
            i &&
                ((i._relationshipEventHint = o.hint),
                (i._isRelationshipEvent = !0),
                await generateEmployeePost(e, o.postType, i));
        },
        500 + 2e3 * Math.random()
    );
}
async function generateEmployeePost(e = null, t = null, n = null) {
    let a = e;
    if (!a) {
        const e = gameState.employees.filter(
            (e) => "active" === e.employmentStatus && !["sleeping", "vampire_rest"].includes(e.npcStatus?.current)
        );
        if (0 === e.length) return;
        a = e[Math.floor(Math.random() * e.length)];
    }
    const o = n || getEmployeeAwarenessForPost(a.id);
    if (!o) return void console.error("Failed to get context for employee:", a.name);
    // `let`: SFW mode swaps an explicit requested type for a selfie — before any text is
    // written, so the content matches (this used to throw on a const reassignment).
    let i = t || selectPostType(a, o);
    isSFWMode() && ["explicit", "thirst_trap", "lewd", "nude"].includes(i) && (i = "selfie");
    const s = n?._isRelationshipEvent || !1;
    if (!s && !n) {
        const e = Date.now(),
            t = (gameState.socialNetwork?.posts || []).filter(
                (t) =>
                    t.authorId === a.id &&
                    e - t.timestamp > 864e5 &&
                    e - t.timestamp < 3 * 864e5 &&
                    (t.content || "").length > 20
            );
        if (t.length > 0 && Math.random() < 0.2)
            o._topicHint = `Write a FOLLOW-UP to your earlier post: "${t[0].content.substring(0, 120)}" — give an update, a development, or a conclusion to that thread.`;
        else if (Math.random() < 0.1) {
            const e = (gameState.socialNetwork?.posts || [])
                .filter(
                    (e) =>
                        e.authorId !== a.id &&
                        !e.isPlayerPost &&
                        "system" !== e.authorId &&
                        (e.content || "").length > 20
                )
                .slice(0, 8);
            if (e.length > 0) {
                const t = e[Math.floor(Math.random() * e.length)],
                    n = a.relationships?.[t.authorId]?.type || "coworker",
                    i =
                        "rival" === n || "enemy" === n
                            ? "Be subtly shady about it (subtweet energy)."
                            : "crush" === n || "romantic" === n || "best_friend" === n || "friend" === n
                              ? "Be supportive or playfully amplify it."
                              : "React with your own take.";
                o._topicHint = `React to ${t.authorName}'s recent post: "${t.content.substring(0, 100)}". ${i} Reference it naturally — quote-post energy, not a reply.`;
            }
        }
    }
    if (!s && Math.random() < 0.1) {
        const e = generatePollPost(a);
        if (e) {
            const t = createPost({
                authorId: a.id,
                authorName: a.name,
                content: e.content,
                type: "poll",
                poll: e.poll,
                explicitLevel: 0,
                tags: ["poll"],
            });
            return (
                gameState.socialNetwork.posts.unshift(t),
                console.log(`[Social] 📊 ${a.name} posted a poll: "${e.content}"`),
                t
            );
        }
    }
    const r = s ? [] : getRelevantEvents(a.id, 3);
    let l, c, d, p, m;
    if (r.length > 0 && Math.random() < 0.4) {
        const e = r[0],
            t = await generateEventReaction(a, e, o);
        if (t) (l = t.content), (c = t.imagePrompt), (p = t.explicitLevel), (m = t.tags || []);
        else {
            console.warn("Event reaction generation failed, falling back to organic post");
            const e = await generateOrganicPost(a, i, o);
            if (!e) return console.warn(`[Post] Organic fallback failed for ${a.name}, skipping post`), null;
            (l = e.content), (c = e.imagePrompt), (p = e.explicitLevel), (m = e.tags || []);
        }
    } else {
        let e = await generateOrganicPost(a, i, o);
        if (!e) return console.warn(`[Post] Generation failed for ${a.name}, skipping post`), null;
        // Same topic as a post from the last few minutes (see trackPostTopic)? One retry
        // steered elsewhere; keep whichever we end up with rather than lose the post.
        if (!o?._topicHint && wasTopicRecentlyUsed(e.content)) {
            const t = await generateOrganicPost(a, i, {
                ...(o || {}),
                _topicHint: `anything EXCEPT the subject of this post, which was just made: "${String(e.content).slice(0, 100)}" — pick a different part of your day or life`,
            });
            t?.content && (console.log(`[Post] ${a.name}: re-rolled a repeated topic`), (e = t));
        }
        (l = e.content), (c = e.imagePrompt), (p = e.explicitLevel), (m = e.tags || []);
    }
    if (!l || "string" != typeof l)
        return console.warn(`Invalid post content generated for ${a.name}, skipping post`), null;
    if (
        (isSFWMode() && ((p = 0), ["explicit", "thirst_trap", "lewd", "nude"].includes(i) && (i = "selfie")),
        isContentTooSimilar(l, a.id))
    )
        return console.log(`Skipping similar post from ${a.name}, will try again later`), null;
    if (
        c &&
        [
            "selfie",
            "meme",
            "thirst_trap",
            "explicit",
            "food",
            "travel",
            "life_update",
            "hookup",
            "masturbation",
            "nudes",
            "moneyshot",
            "morning_after",
        ].includes(i)
    )
        try {
            d = await queuedGenerateImage(applyImageStyle(c), `Organic social post image for ${a.name}`);
        } catch (e) {
            console.error("Image generation failed:", e), (d = null);
        }
    const u = createPost({
        authorId: a.id,
        authorName: a.name,
        type: i,
        content: l,
        imageUrl: d || null,
        imageAlt: c || "",
        imagePrompt: c || null,
        explicitLevel: p,
        tags: m,
        location: a.location || "headquarters",
        isPlayerPost: !1,
        activityStatus: a.npcStatus?.current || null,
        activityLabel: a.npcStatus?.label || null,
    });
    gameState.socialNetwork.posts.unshift(u),
        "function" == typeof requestSmartFeedUpdate && requestSmartFeedUpdate(),
        trackPostTopic(l),
        "dashboard" === gameState.activeTab && refreshDashboardSections();
    if (
        p >= 2 ||
        [
            "hookup",
            "masturbation",
            "nudes",
            "sexting",
            "moneyshot",
            "morning_after",
            "explicit",
            "thirst_trap",
            "tea_spilling",
            "gossip",
        ].includes(i) ||
        l.includes("@TheBoss") ||
        l.includes("@")
    ) {
        remember(a, `I posted${d ? " with image" : ""}: "${l}"`, "event", 2);
    }
    return (
        gameState.socialNetwork.recentPostTypes.push(i),
        gameState.socialNetwork.recentPostTypes.length > 50 && gameState.socialNetwork.recentPostTypes.shift(),
        "tea_spilling" === i &&
            setTimeout(
                () => {
                    triggerTeaSpillingComments(u, a);
                },
                3e3 + 5e3 * Math.random()
            ),
        logCompanyEvent("post_created", { authorId: a.id, authorName: a.name, postType: i, explicitLevel: p }),
        u
    );
}
function selectPostType(e, t) {
    const n = e.social;
    if (!n) return "text";
    const a = gameState.socialNetwork.recentPostTypes || [];
    if (isSFWMode()) {
        const e = {
                text: 15,
                work: 10,
                selfie: 18,
                life_update: 12,
                food: 8,
                travel: 6,
                fitness: 8,
                hobby: 8,
                entertainment: 10,
                mood: 15,
                question: 8,
                achievement: 7,
                throwback: 4,
                pet: 5,
                fashion: 10,
                complaint: 5,
                inspiration: 6,
                weather: 3,
                meme: 8,
                random: 6,
            },
            t = Object.values(e).reduce((e, t) => e + t, 0);
        let n = Math.random() * t;
        for (const [t, a] of Object.entries(e)) if (((n -= a), n <= 0)) return t;
        return "text";
    }
    const o = n.contentPreferences || {},
        i = {
            selfie: o.selfies ? Math.round(60 * o.selfies) : 50,
            thirst_trap: o.thirstTraps ? Math.round(60 * o.thirstTraps) : 60,
            explicit: o.explicitContent ? Math.round(60 * o.explicitContent) : 55,
            fashion: 35,
            hookup: 50,
            masturbation: 45,
            nudes: 48,
            sexting: 40,
            moneyshot: 35,
            morning_after: 38,
            mood: 18,
            life_update: 12,
            random: 10,
            inspiration: 6,
            text: 10,
            question: 8,
            gossip: 10,
            tea_spilling: 10,
            entertainment: 8,
            work: o.workPosts ? Math.round(30 * o.workPosts) : 4,
            achievement: 4,
            fitness: 5,
            hobby: 5,
            food: 2,
            travel: 3,
            pet: 2,
            throwback: 2,
            complaint: 3,
            weather: 1,
            meme: 3,
        };
    if (t.chatContext?.hasRecentChat) {
        const n = t.chatContext.themes || [];
        n.includes("flirty/romantic") &&
            ((i.text += 8),
            (i.selfie += 10),
            (i.thirst_trap += 12),
            (i.mood += 5),
            (i.sexting += 10),
            (i.nudes += 8),
            e.intimacy > 40 &&
                ((i.explicit += 10), (i.hookup += 12), (i.masturbation += 9), (i.morning_after += 8)),
            e.intimacy > 70 && (i.moneyshot += 10)),
            n.includes("work-related") && ((i.work += 10), (i.text += 5), (i.achievement += 8)),
            n.includes("emotional/personal") &&
                ((i.text += 15),
                (i.life_update += 10),
                (i.mood += 12),
                (i.inspiration += 8),
                (i.morning_after += 5)),
            n.includes("food/social") && ((i.food += 15), (i.life_update += 10));
    }
    Object.keys(i).forEach((e) => {
        const t = a.filter((t) => t === e).length,
            n = [
                "selfie",
                "thirst_trap",
                "explicit",
                "hookup",
                "masturbation",
                "nudes",
                "sexting",
                "moneyshot",
                "morning_after",
                "fashion",
            ].includes(e)
                ? 3
                : 8;
        i[e] = Math.max(1, i[e] - t * n);
    });
    const s = e.personality || {};
    s.outgoing > 70 &&
        ((i.selfie += 15), (i.life_update += 10), (i.question += 10), (i.hookup += 12), (i.morning_after += 10)),
        s.professional > 70 &&
            ((i.work += 20),
            (i.achievement += 10),
            (i.inspiration += 8),
            (i.explicit -= 10),
            (i.hookup -= 15),
            (i.masturbation -= 12),
            (i.nudes -= 10),
            (i.sexting -= 8),
            (i.moneyshot -= 20)),
        s.flirty > 70 &&
            ((i.thirst_trap += 20),
            (i.selfie += 10),
            (i.mood += 5),
            (i.fashion += 8),
            (i.sexting += 15),
            (i.nudes += 12),
            (i.explicit += 10),
            (i.hookup += 10),
            (i.masturbation += 8)),
        s.confidence > 70
            ? ((i.selfie += 10),
              (i.achievement += 12),
              (i.question += 5),
              (i.nudes += 15),
              (i.thirst_trap += 12),
              (i.explicit += 10),
              (i.masturbation += 10),
              (i.hookup += 8))
            : s.confidence < 40 &&
              ((i.mood += 10),
              (i.random += 8),
              (i.complaint += 5),
              (i.nudes -= 10),
              (i.hookup -= 8),
              (i.moneyshot -= 15)),
        initializeGossipSystem(e);
    const r = getKnownGossip(e.id, 1);
    if (r.length > 0) {
        const t = r[0].juiciness || 50,
            n = Math.floor(t / 5);
        (i.gossip += n),
            (i.tea_spilling += n),
            t >= 80 && (i.tea_spilling += 20),
            e.gossip.gossipTendency > 60 && ((i.gossip += 15), (i.tea_spilling += 10)),
            s.confidence > 65 && (i.tea_spilling += 15);
    } else (i.gossip = 1), (i.tea_spilling = 1);
    const l = e.stats || {},
        c = l.desire ?? 50,
        d = l.obedience ?? 50,
        p = l.comfort ?? 50,
        m = l.affection ?? 50;
    if (!(c >= 25 || m >= 25))
        for (const e of [
            "explicit",
            "thirst_trap",
            "hookup",
            "masturbation",
            "nudes",
            "sexting",
            "moneyshot",
            "morning_after",
        ])
            i[e] = 0;
    c >= 80 && p >= 80 && m >= 80
        ? ((i.explicit += 80),
          (i.thirst_trap += 70),
          (i.hookup += 85),
          (i.sexting += 65),
          (i.masturbation += 75),
          (i.nudes += 80),
          (i.morning_after += 60),
          (i.moneyshot += 70),
          (i.selfie += 50),
          (i.fashion += 40),
          (i.work = Math.max(2, i.work - 30)),
          (i.complaint = Math.max(1, i.complaint - 20)),
          (i.weather = Math.max(1, i.weather - 15)),
          (i.food = Math.max(3, i.food - 15)),
          (i.pet = Math.max(1, i.pet - 10)))
        : c > 70 || m > 70 || p > 70
          ? ((i.explicit += 30),
            (i.thirst_trap += 25),
            (i.hookup += 35),
            (i.sexting += 25),
            (i.masturbation += 30),
            (i.nudes += 28),
            (i.morning_after += 20),
            c > 75 && (i.moneyshot += 25))
          : (c > 50 || m > 50) &&
            ((i.explicit += 12),
            (i.thirst_trap += 10),
            (i.hookup += 15),
            (i.sexting += 10),
            (i.masturbation += 12)),
        d > 70 && c > 70 && ((i.moneyshot += 25), (i.nudes += 18), (i.hookup += 15)),
        p > 70 && ((i.hookup += 12), (i.morning_after += 15), (i.explicit += 10));
    const u = new Date().getHours();
    u >= 6 && u < 9
        ? ((i.mood += 8), (i.fitness += 10), (i.food += 5), (i.morning_after += 12))
        : u >= 9 && u < 17
          ? ((i.work += 12), (i.complaint += 5), (i.food += 5), (i.sexting += 8))
          : u >= 17 && u < 22
            ? ((i.life_update += 10),
              (i.entertainment += 10),
              (i.food += 8),
              (i.hookup += 15),
              (i.thirst_trap += 10))
            : ((i.mood += 10),
              (i.random += 8),
              (i.throwback += 8),
              (i.explicit += 15),
              (i.masturbation += 20),
              (i.sexting += 12),
              (i.nudes += 15));
    ["thirst_trap", "explicit", "hookup", "masturbation", "nudes", "sexting", "moneyshot", "morning_after"].forEach(
        (e) => {
            i[e] && (i[e] = Math.max(1, Math.round(0.75 * i[e])));
        }
    );
    const g = getConsentPolicy();
    switch (
        ("professional" === g
            ? ((i.explicit = Math.max(1, i.explicit - 15)),
              (i.thirst_trap = Math.max(5, i.thirst_trap - 8)),
              (i.hookup = Math.max(1, i.hookup - 20)),
              (i.masturbation = Math.max(1, i.masturbation - 18)),
              (i.nudes = Math.max(1, i.nudes - 15)),
              (i.sexting = Math.max(1, i.sexting - 12)),
              (i.moneyshot = Math.max(1, i.moneyshot - 25)),
              (i.morning_after = Math.max(1, i.morning_after - 10)))
            : "open" === g &&
              ((i.thirst_trap += 15),
              (i.explicit += 15),
              (i.hookup += 20),
              (i.masturbation += 15),
              (i.nudes += 18),
              (i.sexting += 12),
              (i.moneyshot += 10),
              (i.morning_after += 12)),
        e.npcStatus?.current)
    ) {
        case "at_gym":
            (i.fitness = (i.fitness || 5) + 30),
                (i.selfie = (i.selfie || 50) + 15),
                (i.life_update = (i.life_update || 12) + 10);
            break;
        case "yoga":
            (i.fitness = (i.fitness || 5) + 20),
                (i.life_update = (i.life_update || 12) + 15),
                (i.inspiration = (i.inspiration || 6) + 10);
            break;
        case "walking_dog":
            (i.pet = (i.pet || 2) + 30),
                (i.life_update = (i.life_update || 12) + 15),
                (i.selfie = (i.selfie || 50) + 10);
            break;
        case "on_date":
            (i.life_update = (i.life_update || 12) + 20),
                (i.hookup = (i.hookup || 50) + 15),
                (i.selfie = (i.selfie || 50) + 10),
                (i.morning_after = (i.morning_after || 38) + 8);
            break;
        case "socializing":
        case "at_bar":
        case "at_event":
            (i.selfie = (i.selfie || 50) + 20),
                (i.life_update = (i.life_update || 12) + 15),
                (i.mood = (i.mood || 18) + 10);
            break;
        case "cooking":
        case "having_dinner":
            (i.food = (i.food || 2) + 30), (i.life_update = (i.life_update || 12) + 10);
            break;
        case "waking_up":
        case "morning_routine":
            (i.mood = (i.mood || 18) + 20),
                (i.selfie = (i.selfie || 50) + 15),
                (i.morning_after = (i.morning_after || 38) + 10);
            break;
        case "at_work":
        case "working_late":
            (i.work = (i.work || 4) + 20), (i.achievement = (i.achievement || 4) + 10);
            break;
        case "night_shift":
            (i.work = (i.work || 4) + 15), (i.complaint = (i.complaint || 3) + 10), (i.mood = (i.mood || 18) + 8);
            break;
        case "hobbies":
        case "reading":
        case "gaming":
            (i.hobby = (i.hobby || 5) + 30), (i.life_update = (i.life_update || 12) + 10);
            break;
        case "commuting":
            (i.complaint = (i.complaint || 3) + 15),
                (i.mood = (i.mood || 18) + 10),
                (i.random = (i.random || 10) + 10);
            break;
        case "traveling":
        case "on_vacation":
            (i.travel = (i.travel || 3) + 40),
                (i.selfie = (i.selfie || 50) + 20),
                (i.life_update = (i.life_update || 12) + 15);
            break;
        case "sick":
            (i.complaint = (i.complaint || 3) + 20), (i.mood = (i.mood || 18) + 15);
            break;
        case "vampire_hunt":
            (i.life_update = (i.life_update || 12) + 20),
                (i.mood = (i.mood || 18) + 20),
                (i.random = (i.random || 10) + 10);
    }
    initializeEmployeeSocialData(e);
    const h = Object.values(e.relationships || {}).filter((e) => "enemy" === e.type || "rival" === e.type).length;
    h >= 1 &&
        ((i.gossip = (i.gossip || 10) + 25),
        (i.tea_spilling = (i.tea_spilling || 10) + 20),
        (i.shade = (i.shade || 0) + 15 * Math.min(h, 3)));
    const y = e?.personalLife?.outsideContacts?.inRelationship,
        f = e?.personalLife?.outsideContacts?.infidelityTendency || 0,
        b = e?.personalLife?.outsideContacts?.polyamorous || !1;
    y &&
        f > 0.55 &&
        !b &&
        ((i.thirst_trap = (i.thirst_trap || 50) + 12), (i.tea_spilling = (i.tea_spilling || 10) + 8)),
        b && y && (i.life_update = (i.life_update || 12) + 10);
    // Personality gate: scale the explicit/sexual tier by how flirty + confident the NPC is,
    // across the WHOLE range (not just the >70 extremes handled above). Keeps a reserved or
    // "not very flirty" character from defaulting into graphic hookup/nudes posts even when
    // their relationship stats are high. flirty dominates; confidence nudges.
    const _fl = s.flirty ?? 50,
        _cf = s.confidence ?? 50,
        _xMult = Math.max(0.12, Math.min(1.25, (_fl / 55) * (0.6 + 0.4 * (_cf / 100))));
    ["thirst_trap", "explicit", "hookup", "masturbation", "nudes", "sexting", "moneyshot", "morning_after"].forEach(
        (e) => {
            i[e] && (i[e] = Math.max(1, Math.round(i[e] * _xMult)));
        }
    );
    const v = Object.values(i).reduce((e, t) => e + Math.max(0, t), 0);
    let w = Math.random() * v;
    for (const [e, t] of Object.entries(i)) if (((w -= Math.max(0, t)), w <= 0)) return e;
    return "text";
}
async function generateEventReaction(e, t, n) {
    const a = e.personality || {},
        o = e.social || {};
    if (!t || !t.type) return console.warn("Invalid event structure in generateEventReaction:", t), null;
    const i = (() => {
            switch (t.type) {
                case "hire":
                    return `${t.description ? t.description.split(" ")[0] : "someone"} just joined the company`;
                case "fire":
                    return `${t.description ? t.description.split(" ")[0] : "someone"} left the company`;
                case "promotion":
                    return `${t.description ? t.description.split(" ")[0] : "someone"} got promoted to ${(t.description && t.description.match(/as (.+)/)?.[1]) || "a new role"}`;
                case "chat":
                    return `Had a ${t.sentiment || "interesting"} chat with a coworker`;
                case "gift":
                    return "Received a gift";
                case "achievement":
                    return `Reached a milestone: ${t.description || "an achievement"}`;
                default:
                    return t.description || "Something happened at work";
            }
        })(),
        s = [
            personalityToText(a.outgoing || 50, "outgoing"),
            personalityToText(a.professional || 50, "professional"),
            personalityToText(a.flirty || 50, "flirty"),
        ],
        r = `${e.name} is ${s.join(", ")}`,
        l = (n.coworkers || [])
            .slice(0, 3)
            .map((e) => `${e.coworkerName} (${e.relationship})`)
            .join(", "),
        c = getPlayerDescription("post", e),
        d =
            ("chat" !== t.type && "gift" !== t.type && "promotion" !== t.type) || "the boss" === c
                ? ""
                : `\nYour boss: ${c}`,
        p = e.gender
            ? `, a ${e.age || "young"}-year-old ${"male" === e.gender ? "man" : "transMan" === e.gender ? "trans man" : "transWoman" === e.gender ? "trans woman" : (e.gender, "woman")}`
            : "",
        m = `You are ${e.name}${p}, an employee posting on an uncensored social media about a recent event.\n\nEvent: ${i}\nYour personality: ${r}${buildSocialContinuityBlock(e)}\nYour coworkers: ${l}\nLocation: ${e.location || "office"}${d}\n\nWrite a SHORT (1-3 sentences) social media post reacting to this event. Make it YOURS — how does this event touch YOUR life specifically? Be authentic to the personality. Use emojis sparingly (0-2). Be conversational and natural.\n\n${"casual" === o.contentStyle ? "Style: Casual and relaxed" : "professional" === o.contentStyle ? "Style: Professional but friendly" : "Style: Balanced between casual and professional"}\n\nPost only:`;
    try {
        let n = await queuedGenerateText(
            m,
            {
                temperature: 0.9,
                max_tokens: 50,
                stopSequences: [
                    "\n\n",
                    "Rating:",
                    "**Rating",
                    "---",
                    "Why:",
                    "The stapler",
                    "The ",
                    "{SEEDS",
                    "{BAN",
                    "{BOOST",
                ],
            },
            "Generating company social post content"
        );
        (n = n.replace(/\{SEEDS:[^}]*\}\s*/gi, "")),
            (n = n.replace(/\{BAN:[^}]*\}\s*/gi, "")),
            (n = n.replace(/\{BOOST:[^}]*\}\s*/gi, "")),
            (n = n.replace(/\{[A-Z]+:[^}]*\}\s*/g, "")),
            (n = n.trim());
        let o = 0;
        isSFWMode() ||
            "chat" !== t.type ||
            "flirty" !== t.sentiment ||
            (o = Math.min(2, Math.floor(a.flirty / 40)));
        let i = null;
        if ("promotion" === t.type && Math.random() < 0.6) {
            i = `Professional celebration selfie: ${e.physical?.shortDescription || `${e.age || "young"}-year-old ${"male" === e.gender ? "man" : "transMan" === e.gender ? "trans man" : "woman"}`} smiling, office setting, happy expression, high quality`;
        } else if ("achievement" === t.type && Math.random() < 0.5) {
            i = `Excited celebration photo: ${e.physical?.shortDescription || `${e.age || "young"}-year-old ${"male" === e.gender ? "man" : "transMan" === e.gender ? "trans man" : "woman"}`} celebrating achievement, office environment, triumphant pose, high quality`;
        }
        return { content: n, imagePrompt: i, explicitLevel: o, tags: [t.type] };
    } catch (e) {
        return (
            console.error("AI generation failed:", e),
            { content: `${i}! 🎉`, imagePrompt: null, explicitLevel: 0, tags: [t.type] }
        );
    }
}
function personalityToText(e, t) {
    return e >= 85
        ? `extremely ${t}`
        : e >= 70
          ? `very ${t}`
          : e >= 55
            ? `quite ${t}`
            : e >= 40
              ? `moderately ${t}`
              : e >= 25
                ? `somewhat ${t}`
                : `not very ${t}`;
}
async function generateOrganicPost(e, t, n) {
    const a = e.personality || {},
        o = e.social || {},
        i = [
            personalityToText(a.outgoing || 50, "outgoing"),
            personalityToText(a.professional || 50, "professional"),
            personalityToText(a.flirty || 50, "flirty"),
            personalityToText(a.confidence || 50, "confident"),
            personalityToText(a.humor || 50, "humorous"),
        ].join(", "),
        s = (n.coworkers || []).slice(0, 5).map((e) => {
            const t = gameState.employees.find((t) => t.id === e.coworkerId),
                n = t?.social?.username || null;
            return {
                coworkerId: e.coworkerId,
                name: e.coworkerName,
                username: n,
                relationship: e.relationship,
                knownFor: e.knownFor || "friend",
            };
        }),
        r =
            s
                .map((e) =>
                    e.username
                        ? `${e.name} (@${e.username}) - ${e.relationship}, ${e.knownFor}`
                        : `${e.name} - ${e.relationship}, ${e.knownFor}`
                )
                .join(", ") || "new to the network",
        l = ((n.knownLocations || []).join(", "), e.relationships, e.intimacy || 0),
        c = e.stats?.affection || 0,
        d = gameState.socialNetwork.postIdCounter || 0;
    gameState.socialNetwork.recentMentions || (gameState.socialNetwork.recentMentions = {});
    const p = gameState.socialNetwork.recentMentions;
    function m(e) {
        const t = p[e];
        return void 0 !== t && d - t < 8;
    }
    function u(e) {
        gameState.socialNetwork.recentMentions[e] = d;
    }
    const g =
            Math.random() < 0.3 &&
            ["text", "work", "life_update", "food"].includes(t) &&
            s.length > 0 &&
            s.some((e) => e.username),
        h = Math.random() < 0.05 + (c / 100) * 0.15 && ["text", "work", "food", "life_update"].includes(t),
        y = s.filter((e) => e.username && !m(e.coworkerId));
    let f = "";
    if (("gossip" === t || "tea_spilling" === t) && !f) {
        const e = s.filter(
            (e) => e.username && ("enemy" === e.relationship || "rival" === e.relationship) && !m(e.coworkerId)
        );
        if (e.length > 0) {
            const n = e[Math.floor(Math.random() * e.length)];
            "tea_spilling" === t
                ? (u(n.coworkerId),
                  (f = `\n🎯 DRAMA CONTEXT: You have real beef with @${n.username} (${n.name}) — they are your ${n.relationship}. If you're spilling tea, they are the natural target. Use their @username directly.`))
                : (f = `\n🎯 DRAMA CONTEXT: You have beef with ${n.name} (your ${n.relationship}). If you're hinting at drama, they're who you're thinking of — but DON'T name them directly in gossip posts, keep it cryptic.`);
        }
    }
    if (!f && h) {
        f = `\n💡 Consider naturally mentioning @TheBoss if relevant. Be ${l > 60 ? "warmly and casually" : c > 50 ? "appreciatively" : "casually"}. Examples: "Hanging with @TheBoss was fun!", "Thanks @TheBoss", "@TheBoss really came through". Only mention if it feels natural!`;
    } else if (!f && g && y.length > 0) {
        const e = y[Math.floor(Math.random() * y.length)];
        u(e.coworkerId),
            (f = `\n💡 Consider naturally mentioning @${e.username} (${e.name}) if relevant to your post. Examples: "Coffee with @${e.username} hit different today", "Thanks @${e.username}!", "Hanging with @${e.username}". Only mention if it feels natural - don't force it!`);
    } else
        !f &&
            g &&
            0 === y.length &&
            (f =
                "\n⚠️ Your close coworkers have all been featured in recent posts. Please write a post that doesn't tag any specific coworker this time.");
    const b = s.filter((t) => {
        if (!t.username || m(t.coworkerId)) return !1;
        const n = gameState.employees.find((e) => e.id === t.coworkerId);
        return (
            n &&
            (function (e, t) {
                const n = e.personalLife?.sexualOrientation || "straight",
                    a = "female" === (e.gender || "").toLowerCase(),
                    o = "male" === (t.gender || "").toLowerCase(),
                    i = "female" === (t.gender || "").toLowerCase(),
                    s =
                        (["straight", "bisexual", "pansexual"].includes(n) && a) ||
                        (["gay", "bisexual", "pansexual"].includes(n) && !a),
                    r =
                        (["lesbian", "bisexual", "pansexual"].includes(n) && a) ||
                        (["straight", "bisexual", "pansexual"].includes(n) && !a);
                return o ? s : !i || r;
            })(e, n)
        );
    });
    let v;
    if (b.length > 0) {
        const e = b[Math.floor(Math.random() * b.length)];
        u(e.coworkerId),
            (v = `You can mention @${e.username} (${e.name}) as someone involved — they're a coworker you're attracted to.`);
    } else
        v =
            "Write this as a personal experience without tagging any specific coworker — keep it anonymous or vague about who was involved.";
    const w = {
            text: 'Write a casual status update about your day, thoughts, or feelings. Be authentic and varied. Topics: how you\'re feeling, observations, random thoughts, what you\'re doing, hot takes, mild rants, something funny that happened, stream of consciousness. 1-2 sentences. Examples: "Why does Monday exist 😩", "Feeling like a main character today ✨", "That moment when you realize it\'s only Tuesday", "Honestly just vibing", "Send coffee or leave me alone ☕", "Accidentally made eye contact with a stranger three times and now we\'re basically married", "Thinking about that embarrassing thing I said 5 years ago at 2am again 💀", "I don\'t have a hot take I just have lukewarm confusion", "Living proof that you can function on spite and caffeine alone", "Today\'s mood: chaotic neutral"',
            work: 'Write about your job/projects BUT make it relatable and interesting. NOT just "meetings". Topics: cool project wins, funny moments, learning something new, frustrations, accomplishments, office dynamics, that one annoying thing, small victories. 1-2 sentences. Examples: "Actually proud of what I made today 🚀", "When everything works on the first try 🎉", "Been at this since 9am send help 💀", "That feeling when you solve a tough problem", "Living my best productive life", "My code worked and I don\'t know why and that\'s somehow worse", "Accidentally replied-all and now I\'m moving to another country 📧💀", "The printer and I are in a toxic relationship at this point", "Just automated a task that took 3 hours... it only took me 2 days to figure out 🤡", "That feeling when your presentation actually goes well and you feel like a god"',
            selfie: 'Write a SHORT caption for a selfie. Show personality - NOT generic "feeling cute". Topics: your mood, confidence, what you\'re doing, where you are, or just pure vibe. Max 15 words. Examples: "Main character energy 💫", "No thoughts, just vibes", "Serving looks and chaos", "That post-workout glow though", "Unapologetically me", "Caught in the act of existing", "This lighting was personally sent by god", "Proof I left the house today", "Unfiltered and unbothered", "Face card never declines 💳", "Documented proof that I\'m cute", "This angle is doing god\'s work"',
            meme: 'Write a humorous, relatable caption. Reference real life, pop culture, common experiences. Be funny and current. 1 sentence. Examples: "Me: *buys coffee* / My bank account: 👁️👄👁️", "POV: You said you\'d be productive today 💀", "Everyone else: weekend plans / Me:", "Not me stress eating again 😅", "When they ask if I\'m okay: *insert image of everything on fire*", "Google searching things that are definitely not normal at 3am", "Me promising to sleep early vs me at 4am watching conspiracy theories", "Nobody: / My brain at 3am: what if chairs have feelings", "Internal screaming but make it professional"',
            life_update:
                'Share a genuine personal life update - hobbies, weekend, personal news, life moments, small wins, changes, adventures. Be specific and interesting. 1-2 sentences. Examples: "Finally finished that book I\'ve been reading for 6 months 📚", "Learned a new recipe and didn\'t burn the kitchen down 🎉", "Adopting a plant parent lifestyle, wish me luck 🌱", "Started binging a new show and can\'t stop 📺", "Redecorated my room and honestly I\'m obsessed with how it turned out", "Joined a gym... we\'ll see how long this lasts 🏋️", "Got carded at the store and my ego has never been higher", "Started journaling and it turns out I have FEELINGS", "Tried a new coffee shop and I think I\'m in love with a latte ☕✨"',
            thirst_trap: `Write a CONFIDENT, FLIRTY caption for a revealing/attractive photo. Be bold, suggestive, playful. ${a.flirty > 60 ? "Be explicitly flirtatious and sexual" : "Be subtly seductive"}. Reference confidence, your look, your body, or the energy you're giving off. Max 12 words. Examples: "Confidence looks good on me 😏", "You're welcome 💋", "Just thinking out loud 🤔🔥", "Felt cute, felt powerful", "No caption needed 👀", "Making Monday better", "Dangerous mood today", "This outfit is barely holding on and so am I", "Body by genetics, confidence by audacity 😈", "Eat your heart out", "The things I'd let you do... 🤫", "Less is more... especially clothing 🔥"`,
            explicit: `Write a SEXUALLY BOLD caption for explicit content. Be provocative, raw, and unapologetic. ${a.flirty > 70 ? "Be filthy and direct — describe what you're showing or doing" : "Use suggestive but powerful language"}. Reference your body, what you're doing, or what you want. Max 15 words. Examples: "After hours 🔥", "Private show 💦", "What you don't usually see 😈", "Special delivery", "No rules tonight", "Taking requests 👀", "Feeling dangerous", "Handle with care", "Legs open, DMs open, come find out 😈", "This is what I look like when nobody's watching 💦", "Serving body and zero shame 🔥", "Wet, willing, and posting about it ✨", "On display because I want to be 😏", "The view from below 👅"`,
            travel: 'Post about travel, places, or wanting to travel. Show excitement or wanderlust. 1 sentence. Examples: "Daydreaming about beaches and zero responsibilities 🏖️", "Next vacation can\'t come soon enough", "That travel bug hitting different lately ✈️", "Exploring local spots hits different 🗺️"',
            food: 'Post about food, drinks, or cravings with enthusiasm. Be specific or playful. 1 sentence. Examples: "This coffee is single-handedly keeping me alive ☕", "Taco Tuesday is the only thing I believe in 🌮", "Why does food taste better when someone else makes it 🍕", "Currently accepting dinner recommendations", "That post-meal satisfaction 😌"',
            fitness:
                'Post about workout, gym, health, or physical activity. Show effort, results, or motivation. 1-2 sentences. Examples: "That post-workout high hits different 💪", "Gym session: crushed / My legs: destroyed", "Actually showed up today, proud of myself 🏋️", "Running on endorphins and stubbornness", "Started my fitness journey, we\'ll see how this goes 🏃"',
            hobby: `Post about a specific hobby or interest. Be passionate and specific - reference what you DO. Include details. 1-2 sentences. ${e.hobbies && e.hobbies.length > 0 ? `Your hobbies: ${e.hobbies.join(", ")}. Reference one of these!` : ""} Examples: "Finally beat that level I've been stuck on 🎮", "New vinyl just dropped and it's 🔥", "Spent the afternoon painting and lost track of time 🎨", "Photography walk was exactly what I needed 📸"`,
            entertainment:
                'Post about movies, shows, music, books, or pop culture. Share opinions, recommendations, or what you\'re into. 1-2 sentences. Examples: "Just finished that show everyone\'s talking about and WOW 🎬", "This song is living rent-free in my head 🎵", "Reading a book that\'s actually making me think 📖", "Can we talk about that plot twist though 😱", "New album on repeat, absolute fire 🔥"',
            mood: 'Pure vibe/feeling post. Express current mood, energy, or emotional state. Be authentic and relatable. 1 sentence. Examples: "Big chaotic energy today 🌪️", "Soft girl hours 🌸", "Feeling myself a little too much today ✨", "Main character syndrome activated", "That unexplainable good mood", "Tired but make it aesthetic 😴", "Existing and thriving", "No thoughts, head empty, vibes immaculate"',
            question:
                'Ask followers something - opinion, recommendation, this-or-that. Be engaging. 1 sentence with question mark. Examples: "Coffee or tea, and why is coffee the only right answer? ☕", "What\'s a show I NEED to watch right now? 📺", "Hot take: pineapple on pizza is valid. Fight me or agree? 🍕", "Weekend plans or just winging it? 🎉", "What\'s your go-to comfort food when life gets weird? 🍜"',
            achievement:
                'Share a personal win - small or big. NOT always work (can be life, personal growth, random wins). Show pride. 1-2 sentences. Examples: "Didn\'t hit snooze once this week, I\'m basically unstoppable", "Finally organized my closet and found clothes I forgot existed 🎉", "Made it through the week without a breakdown, new personal record 💪", "Hit a goal I didn\'t think I could reach 🎯", "Small win but it feels big ✨"',
            throwback:
                'Nostalgic post about a memory, past experience, or "remember when". Be specific and reflective. 1-2 sentences. Examples: "Remember when we all thought 2020 would be our year 💀", "Thinking about that summer where everything just hit different ☀️", "Found old photos and the nostalgia is hitting hard 📸", "Miss the days when my biggest worry was what to eat 🥺", "Throwback to when life was simpler"',
            pet: 'Post about pets, animals, or wanting a pet. Show affection or humor. 1 sentence. Examples: "My cat judges every life decision I make and she\'s not wrong 🐱", "Dogs really are too pure for this world 🐕", "That moment when your pet becomes your therapist 💕", "Saw the cutest dog today and it made my whole week", "Considering adopting a pet just for the emotional support"',
            fashion:
                'Post about outfit, style, clothing, or fashion choices. Show confidence in your look. 1 sentence. Examples: "Serving looks and confidence today 💃", "This outfit said main character and I listened ✨", "When your outfit matches your energy >>", "Feeling this style lately 👗", "Comfortable AND cute, we love to see it"',
            complaint:
                'Vent about something annoying, frustrating, or relatable. Keep it real and funny. 1-2 sentences. Examples: "Why does everything decide to break at the same time 😩", "Being an adult is just constantly asking wait do I have plans 💀", "My back hurts and I didn\'t even do anything this is 25", "Can life give me a break or is that too much to ask", "Monday can take several seats 💺"',
            inspiration:
                'Share something motivational, philosophical, or reflective. Be genuine not corporate-cheesy. 1-2 sentences. Examples: "Growth is uncomfortable but staying the same is worse 🌱", "Normalize doing what\'s best for you even if others don\'t get it ✨", "You don\'t have to be perfect just keep showing up 💪", "Small steps still count as progress 🚶", "Be the energy you want to attract"',
            weather:
                'Comment on weather and how it affects mood or plans. Be relatable. 1 sentence. Examples: "This weather is giving main character energy ☀️", "Rain + cozy vibes = perfect day for doing nothing 🌧️", "Why is it so hot I\'m literally melting 🥵", "Cold weather = excuse to stay in bed all day ❄️", "Perfect weather for absolutely nothing productive"',
            random: 'Completely random thought observation or chaotic energy. Be spontaneous and unexpected. 1 sentence. Examples: "Thinking about how penguins have knees and now I can\'t unthink it 🐧", "What if plants are actually farming us 🌱🤔", "The word bed looks like a bed", "Why do we say heads up when we actually mean duck 💀", "Random urge to completely change my life at 2am", "Not all thoughts need to be said but here we are"',
            gossip: `Post about gossip/drama you know about. Be VAGUE and MYSTERIOUS but juicy. Use cryptic language or emojis. DON'T name names. 1-2 sentences. ${e.gossip?.knownGossip?.length > 0 ? "Reference the gossip you know but DON'T name names directly - keep it mysterious!" : ""} Examples: "Someone is MESSY and I'm here for it 👀☕", "The tea is piping hot today and I'm observing from a safe distance 🍿", "Not me knowing things I probably shouldn't know 🤐", "Drama >>> any reality TV show 📺", "Just heard something WILD but my lips are sealed... for now 🤫", "Y'all I can't even—things are SPICY lately 🌶️"`,
            tea_spilling: `SPILL THE TEA! Post about gossip/drama you know with SPECIFIC NAMES using @mentions. Be DIRECT and call people out, but keep it playful/dramatic not mean. ${e.gossip?.knownGossip?.length > 0 ? "Reference the gossip you know and USE NAMES with @ mentions!" : ""} 1-2 sentences max. Examples: "Sooo @sarah and @mike definitely hooked up last night, I'm just saying 👀", "Wait @jessica has been wearing @kevin's hoodie all week? TEA 🍵", "Not @emma posting thirst traps right after her breakup with @alex... we see you queen 💅", "@chris really thought nobody would notice him sneaking out with @amber 😏", "The way @madison looked at @tyler... PLEASE 💕"`,
            hookup: `Write a BOLD, GRAPHIC caption about a sexual encounter you just had or are having. Be EXPLICIT and detailed — describe the act, the person, where, how it felt. This is an UNCENSORED platform. ${a.flirty > 60 ? "Be proudly slutty and shameless about it" : "Be breathlessly excited about what happened"}. Reference your physical experience — bodies, sensations, positions. ${v} 1-3 sentences. Examples: "Just got absolutely RAILED in the supply closet and I can barely walk 😩💦", "Third round and he still won't let me leave the bed... not complaining 🥵", "She rode me until my legs went numb and I think I saw god 💀🔥", "Still shaking from what just happened in the bathroom stall... who knew quickies could hit that hard", "Got bent over the desk after everyone left and I'm still dripping 💦💦", "Woke up sore in places I didn't know existed... best night ever 😈", "His tongue should be registered as a weapon I swear to god 👅🫠", "POV: Getting your back blown out while trying to stay quiet because your roommate is home 🤫🥵", "The way she grabbed my hair and told me I wasn't done yet... 🫠", "Came so hard I literally blacked out for a second, what is this man doing to me 💀"`,
            masturbation: `Write a SHAMELESS, EXPLICIT caption about touching yourself / masturbating. Be GRAPHIC — describe what you're doing to yourself, what you're using, how it feels. This is your personal feed on an uncensored platform, be HONEST and raw. ${a.confidence > 60 ? "Be proud and exhibitionist about it" : "Be vulnerable and confessional"}. 1-2 sentences. Examples: "Three orgasms deep and I'm still going... someone stop me 🫠💦", "Found a new vibrator and I haven't left my bed in hours oops 😈", "the way I just came thinking about that conversation earlier... 👀🥵", "Self-care Sunday means edging myself until I can't think straight 💦", "Playing with myself at my desk because that meeting got me way too worked up 😳🤫", "Riding my pillow at 2am because sleep is overrated 🫠", "My fingers + that one fantasy = I'm literally trembling rn 💀💦", "Just made myself cum twice watching my own thirst traps... is that narcissistic? 😏", "Cannot stop touching myself today and honestly I don't even want to 🥵", "Bought a new toy and I think I'm in love??? Multiple times over??? 😩"`,
            nudes: `Write a PROVOCATIVE caption for posting nude photos of yourself. Be BOLD and body-confident. Reference specific body parts, your pose, what you're showing. This is you choosing to share your body on an uncensored platform. ${a.confidence > 70 ? "Be cocky and exhibitionist" : a.flirty > 60 ? "Be teasing and seductive" : "Be vulnerable but empowered"}. Max 12 words. Examples: "Full frontal because why not 🔥", "Everything off, nothing left to imagine 😈", "My tits look too good not to share rn", "Ass pic because I've been squatting and it shows 🍑💪", "Dick pic energy but make it classy 📸", "Spreading for the timeline... you're welcome 💦", "Fresh out the shower, no filter needed 💧", "This body deserves to be seen... all of it 🫠", "On all fours because someone asked nicely 😈📸", "Titty drop Tuesday is a thing right? Making it one 🍒"`,
            sexting: `Write a FLIRTY/SEXUAL caption about exchanging explicit messages or photos with someone. ${v} Reference the thrill, what was said/sent, how turned on you are. Be specific about the sexting — what pics were exchanged, what dirty talk happened. 1-2 sentences. Examples: "The pics they just sent me have me SWEATING at my desk rn 🥵📱", "We've been sexting for 3 hours and I'm literally drenched, someone help 💦", "Just sent something I probably shouldn't have... no regrets though 😈📸", "Their dirty talk game is so good I came just from reading messages 💀🫠", "Trading nudes at work and pretending everything is normal is a skill 🤫📱", "They described exactly what they'd do to me and now I can't function 😩", "Sent them a video of me touching myself and they went FERAL in the replies 🥵🔥", "When the sext hits so good you have to excuse yourself to the bathroom... 💦", "The way they keep asking for more and I keep delivering... we're both insatiable 📸😈", "Phone sex at 3am because neither of us could wait until tomorrow 🫠🔥"`,
            moneyshot: `Write an EXTREMELY EXPLICIT caption about climaxing / cumming / finishing during sex or solo play. Be GRAPHIC about the orgasm — where it went, how much, how intense, the mess. This is the most explicit tier. Hold nothing back. ${a.confidence > 60 ? "Be proudly filthy" : "Be overwhelmed by how intense it was"}. 1-2 sentences. Examples: "He came all over my face and I literally LICKED it off, no shame 💦😈", "Just squirted so hard it hit the wall... new personal record? 💀💦💦", "Came inside me THREE times and I could feel it dripping down my thighs all day 🫠", "Swallowed every drop and asked for seconds... the look on his face 😏💦", "My orgasm was so intense I literally screamed and I think the neighbors heard 😳🔥", "Covered in cum and feeling absolutely divine about it 💦✨", "Creampied and happy about it, don't judge me 😈💦", "The way it dripped out of me... wish I took a pic 📸🫠", "Made him finish with just my mouth and the sounds he made... chef's kiss 👅💦", "Left a wet spot the size of a dinner plate... oops 💀💦"`,
            morning_after: `Write a CANDID post about the aftermath of sex — waking up next to someone, being sore/satisfied, post-sex glow, the evidence left behind. Be HONEST about the physical aftermath. ${a.outgoing > 60 ? "Be proudly satisfied and sharing the details" : "Be blissfully dazed and reflective"}. ${v} 1-2 sentences. Examples: "Woke up with hickeys EVERYWHERE and honestly? Proud of them 💋🫠", "Walked into work bowlegged and everyone noticed... worth it though 😏", "Still finding marks on my body from last night... they're like souvenirs 💀💋", "Hair still messy, sheets still ruined, and I'd do it all over again 🔥", "The bruises on my thighs tell a better story than I ever could 😈", "Post-sex pancakes hit different when you're still sore everywhere 🥞💕", "Woke up to find my underwear on the ceiling fan... how??? 💀😂", "Can still feel them inside me hours later and I keep getting distracted at work 🫠", "Three rounds last night and my body is writing an angry letter to my brain 😩💦", "That post-orgasm sleep was the best I've had in MONTHS, thank you whoever you are 😴✨"`,
            shade: 'Write a PASSIVE-AGGRESSIVE, cryptic subtweet aimed at someone you dislike. Be indirect but obviously petty — anyone who knows the situation will understand. DON\'T name them directly. Use vague "someone" / "people" / "certain coworkers". Reference their behavior, attitude, or something they did without spelling it out. Let the bitterness show. 1-2 sentences. Examples: "Some people really need to learn what professionalism looks like, but okay 😊", "Friendly reminder that confidence and competence are two very different things 🙂", "Idk who needs to hear this but minding your own business is free", "The entitlement some people have... truly wild 🫠", "Must be nice to coast through life on vibes and zero accountability", "Not everyone who smiles at you is your friend, just a reminder 👀", "Some coworkers are just... a lesson you have to learn the hard way", "Weird how some people can look themselves in the mirror tbh", "Choosing to unbother myself today. Some people aren\'t worth the energy 🙂", "The audacity is UNMATCHED and I am APPALLED"',
        },
        x =
            "casual" === o.contentStyle
                ? "Use casual, conversational language and contractions (slang ONLY if it genuinely fits your personality and age)"
                : "professional" === o.contentStyle
                  ? "Use professional but friendly tone"
                  : "Use balanced conversational tone",
        S = gameState.socialNetwork.posts
            .filter((t) => t.authorId === e.id)
            .slice(0, 3)
            .map((e) => e.content)
            .join(" | "),
        k = gameState.socialNetwork.posts.slice(0, 20).map((e) => (e.content || "").toLowerCase()),
        T = [];
    [
        { keywords: ["garage", "park", "parking"], theme: "garage/parking" },
        { keywords: ["keys", "lost", "looking for", "hunting for", "found"], theme: "lost items" },
        { keywords: ["reorganiz", "organiz", "clean", "tidy"], theme: "organization" },
        { keywords: ["server", "rack", "cable", "wifi"], theme: "IT equipment" },
        { keywords: ["coffee", "caffeine", "espresso", "latte"], theme: "coffee" },
        { keywords: ["monday", "mondays"], theme: "Monday complaints" },
        { keywords: ["weekend", "friday", "tgif"], theme: "weekend vibes" },
        { keywords: ["meeting", "meetings", "zoom", "conference"], theme: "meetings" },
        { keywords: ["deadline", "due date", "crunch"], theme: "deadlines" },
        { keywords: ["tired", "exhausted", "sleep", "nap"], theme: "being tired" },
        { keywords: ["vibe", "vibing", "vibes"], theme: "vibe posts" },
        { keywords: ["main character", "mc energy"], theme: "main character" },
        { keywords: ["chaos", "chaotic"], theme: "chaos energy" },
        { keywords: ["broke", "money", "paycheck", "bank account"], theme: "money struggles" },
    ].forEach((e) => {
        k.filter((t) => e.keywords.some((e) => t.includes(e))).length >= 2 && T.push(e.theme);
    });
    const C =
            T.length > 0
                ? `\n⚠️ AVOID these overused themes: ${T.join(", ")} - pick something completely different!`
                : "",
        E = S
            ? `\nYour recent posts: "${S}"\n⚠️ Write something DIFFERENT - new topic, different angle, fresh perspective!${C}`
            : C;
    let $ = "";
    if (n.chatContext?.hasRecentChat) {
        const e = n.chatContext;
        $ = `\n\n💬 RECENT CHAT WITH BOSS (${e.timeAgo < 60 ? `${e.timeAgo} minutes ago` : `${Math.round(e.timeAgo / 60)} hours ago`}):\nConversation themes: ${e.themes.length > 0 ? e.themes.join(", ") : "casual conversation"}\nLast messages:\n${e.lastMessages.map((e) => `${e.sender}: "${e.preview}${e.preview.length >= 100 ? " [truncated]" : ""}"`).join("\n")}\n\n⚠️ NOTE: If you see "..." (ellipses) in messages above, that's just typing style for dramatic effect - NOT the person trailing off incomplete. Don't make posts about "mysterious unfinished sentences" or "what were they going to say?"\n\n${l > 60 ? "🔥 IMPORTANT: You have a very intimate, consensual relationship with your boss. You genuinely enjoy this dynamic! If posting about intimate conversations or requests, be positive, excited, teasing, or playful." : l > 30 ? "💕 You have a developing close relationship with your boss. Frame flirty or intimate content positively and teasingly." : c > 60 ? "😊 You have good rapport with your boss. Keep posts about interactions positive or playful." : ""}\n\n💡 OPTIONAL: You could make a post inspired by this conversation! Examples:\n- If it was flirty: "Still thinking about that conversation... 😏" or "Feeling some type of way today 🔥"\n- If it was about projects: "Excited about this new thing I'm working on!" or "Time to crush it 💪"\n- If it was personal: "Good talks hit different" or "Grateful for good listeners"\n- Or post about something COMPLETELY DIFFERENT - you don't have to reference the chat!\n\n${e.themes.includes("flirty/romantic") && ["text", "selfie", "thirst_trap"].includes(t) ? "🔥 Since you had a flirty chat recently, feel free to make a suggestive/spicy post if it feels natural!" : ""}`;
    }
    let I = "";
    n.requestedByBoss &&
        (I = `\n\n🎯 BOSS REQUESTED THIS POST:\nThe boss specifically asked you to make this post${n.requestContext ? `: "${n.requestContext}"` : ""}.\nYou've already agreed to do it, so make the post they requested!\nBe confident and match the tone they were asking for.\n${"explicit" === t || "thirst_trap" === t ? "They want something bold and provocative - don't hold back!" : ""}`);
    const M = getPlayerDescription("post", e),
        P = "the boss" !== M ? `\n\n👤 ABOUT YOUR BOSS:\n${M}` : "";
    let A = "";
    if ("gossip" === t || "tea_spilling" === t) {
        const n = getKnownGossip(e.id, 3);
        if (n.length > 0) {
            const e = n
                .map((e) => {
                    const n =
                            "player" === e.subjectId
                                ? "the boss"
                                : gameState.employees.find((t) => t.id === e.subjectId)?.name || "someone",
                        a =
                            "player" === e.subjectId
                                ? "@boss"
                                : gameState.employees.find((t) => t.id === e.subjectId)?.social?.username || null,
                        o = e.targetId
                            ? "player" === e.targetId
                                ? "the boss"
                                : gameState.employees.find((t) => t.id === e.targetId)?.name || "someone"
                            : "",
                        i = e.targetId
                            ? "player" === e.targetId
                                ? "@boss"
                                : gameState.employees.find((t) => t.id === e.targetId)?.social?.username || null
                            : "",
                        s =
                            e.accuracy < 50
                                ? " (might be a rumor)"
                                : e.accuracy < 80
                                  ? " (heard through grapevine)"
                                  : "";
                    return "tea_spilling" === t && a
                        ? `- ${n} (${a})${o ? ` and ${o} (${i})` : ""}: ${e.content}${s}`
                        : `- ${e.content}${s}`;
                })
                .join("\n");
            A =
                "tea_spilling" === t
                    ? `\n\n🍵 TEA TO SPILL:\n${e}\n\n🎯 SPILL IT! Use @usernames to call people out directly! Be dramatic and juicy but playful. Examples:\n- "Not @sarah hooking up with @mike in the supply closet 👀"\n- "@kevin has been acting SUS around @jessica lately... just saying 🫖"\n- "Everyone pretending they don't see @alex and @emma sneaking around 😏"`
                    : `\n\n🫖 GOSSIP YOU KNOW:\n${e}\n\n⚠️ DON'T name names directly! Keep it mysterious and vague. Hint at the drama without being too specific. Use "someone", "people", "coworkers", etc.`;
        } else
            A =
                "tea_spilling" === t
                    ? "\n\n⚠️ You don't have specific tea right now, so make a teasing post about ALMOST spilling tea or hinting that you know something without details."
                    : "\n\n⚠️ You don't actually know any specific gossip right now, so make a generic \"something's happening\" type post or pretend you heard something vague.";
    }
    const N = e.gender
            ? `, a ${e.age || "young"}-year-old ${"male" === normalizeGender(e.gender) ? "man" : "transMan" === normalizeGender(e.gender) ? "trans man" : "transWoman" === normalizeGender(e.gender) ? "trans woman" : "femaleFuta" === normalizeGender(e.gender) ? "woman with unique anatomy" : "woman"}`
            : "",
        L = n.employee?.physicalDescription || getPhysicalDescriptionForPrompt(e);
    let _ = "";
    const R = getActiveFlags(e);
    if (R.length > 0) {
        const e = R.filter(
            (e) =>
                "high" === e.priority ||
                "pregnant" === e.key ||
                "chastity" === e.key ||
                "in_relationship" === e.key ||
                "engaged" === e.key ||
                "married" === e.key ||
                e.affectsContext
        );
        e.length > 0 &&
            ((_ = "\n\n🏷️ YOUR CURRENT STATUS/FLAGS:"),
            e.forEach((e) => {
                (_ += `\n- ${e.key}: ${e.playerDescription || e.value}`),
                    e.aiGuidance && (_ += `\n  💡 ${e.aiGuidance}`);
            }),
            (_ +=
                "\n\n⚠️ Consider these when making your post! They affect your current life situation and what you might share on social media."));
    }
    let D = "";
    if (
        e.npcStatus &&
        !["at_work", "relaxing", "chatting_player", "in_person_player"].includes(e.npcStatus.current)
    ) {
        const t = {
            at_gym: "You just finished or are taking a break at the gym. Fitness energy, sweat, that post-workout feeling.",
            yoga: "You just finished yoga or are mid-session. Calm, centered, zen energy.",
            walking_dog: "You're outside walking your dog or just got back. Fresh air, dog antics.",
            on_date:
                "You're on a date or just got back. Be coy, happy, or reflective — without giving too much away.",
            cooking:
                "You're cooking or just finished. Food content is natural. Share what you made or how it turned out.",
            having_dinner: "You're having dinner or just ate. Food, wine, the whole vibe.",
            waking_up: "You just woke up. Groggy, half-alive, first thoughts of the day.",
            morning_routine: "You're in your morning routine. Coffee, getting ready, easing into the day.",
            socializing: "You're out with friends. Capture the vibe — fun, laughter, the energy.",
            at_bar: "You're at a bar. Drinks with friends, that happy-hour energy.",
            at_event: "You're at an event — party, concert, show. Share the experience.",
            traveling: "You're traveling! Share where you are or what you're seeing.",
            on_vacation: "You're on vacation. Relaxed, sun-soaked, checked out from real life.",
            sick: "You're sick today. Low energy, staying in, relatable sick-day vibes.",
            night_shift: "You're working the night shift. The office is quiet, it's eerie, you're grinding.",
            working_late: "You're staying late at the office. Tired but powering through.",
            hobbies: "You're deep in one of your hobbies. Share what you're creating or doing.",
            reading: "You're reading a book. Share your thoughts, a quote, or what you're into.",
            gaming: "You're gaming. Share a win, a frustration, or just the mood.",
            commuting: "You're commuting — relatable struggle or just people-watching.",
            running_errands: "You're out running errands. Real life, adulting, getting things done.",
            vampire_hunt: "You're out in the night. Mysterious. You don't have to say what you're doing.",
            vampire_rest: "You just woke from daytime rest. That disoriented but alive feeling.",
        }[e.npcStatus.current];
        t &&
            (D = `\n\n📍 WHAT YOU'RE DOING RIGHT NOW: ${e.npcStatus.richLabel || e.npcStatus.label}\n${t}\nLet this naturally influence your post content — it doesn't have to be literally about this activity, but the energy should fit.`);
    }
    let F = "";
    const G = gameState.aiQuality?.goodExamples?.posts || [];
    if (G.length > 0) {
        F = `\n\n✅ QUALITY EXAMPLES (player-approved posts that work well):\n${G.slice(0, 3)
                .map((e) => `"${e.content}"`)
                .join(
                    ", "
                )}\n\nUse these as inspiration for quality and style. Match this level of authenticity and readability.`;
    }
    const B =
            n._isRelationshipEvent && n._relationshipEventHint
                ? `\n🔑 LIFE EVENT CONTEXT (HIGHEST PRIORITY — write about THIS, not generic content): ${n._relationshipEventHint}\n`
                : "",
        O = `You are ${e.name}${N}, posting on an uncensored PERSONAL social media platform (like Instagram/Twitter).\n\n🌐 PLATFORM CONTEXT: This is a PERSONAL social network separate from work - NOT a work chat or Slack channel. While you work together, this is for PERSONAL sharing, fun, and connecting outside of professional boundaries. Think Instagram vibes - casual, personal, sometimes spicy!\n\nYOUR PHYSICAL APPEARANCE: ${L}\n(You are fully aware of your body, gender, and physical characteristics. Reference them naturally if relevant to your post, especially in selfies or intimate content.)\n${_}\n\nYour personality: You are ${i}.\n${buildAIContextFromSkills(e)}${buildSocialContinuityBlock(e)}\nPost type: ${t}\nPeople you know: ${r}\nStyle: ${x}${E}${f}${$}${I}${P}${A}${F}${D}\n\n${w[t] || w.text}\n${B}${n._topicHint ? `\n🧵 TOPIC FOR THIS POST (write about THIS): ${n._topicHint}\n` : ""}\nCRITICAL RULES:\n- Write ONLY the post itself - NO explanations, notes, or meta-commentary\n- NO parenthetical notes like "(Note: ...)" or style explanations\n- VOICE: Write in YOUR OWN voice as described in your personality and age above. Do NOT default to generic Gen-Z slang ("the tea", "it's giving", "bestie", "no cap", "rent free", "main character energy") unless that genuinely matches who you are. The example posts show FORMAT and spice level, NOT your voice — re-word them in your own way.\n- Be SHORT and authentic (1-2 sentences MAX, but NOT single-word posts)\n- This is a PERSONAL social network - NOT professional, NOT work chat\n- Feel free to be casual, flirty, fun, and expressive\n- Hashtags: Use 0-1 hashtags, make them natural and varied (avoid #Garage unless truly relevant)\n- Emojis: 0-2 max, use sparingly\n- Don't always mention location - posts can be about ANYTHING\n- Vary your topics - avoid repetitive scenarios (keys, parking, garage organization)\n- Sound like a real person, not AI\n- When mentioning people, use their @username format naturally\n- NEVER use "caught in mid-[action]" phrases or similar incomplete action descriptions\n- Avoid one-word or extremely short posts like "Made it to work" or "Self-care morning"\n- Add personality and context - give readers something interesting\n\nWrite ONLY the social media post text:`;
    try {
        if ("function" != typeof generateText) throw new Error("AI text plugin not available");
        let o = await queuedGenerateText(
            O,
            {
                temperature: 0.9,
                max_tokens: 80,
                stopSequences: [
                    "\n\n",
                    "{SEEDS",
                    "{BAN",
                    "{BOOST",
                    "---",
                    "Rating:",
                    "**Rating",
                    "Rationale:",
                    "Analysis:",
                    "(Note:",
                    "**(Note",
                    "Physical description:",
                    "Selfie Caption:",
                    "**Why",
                ],
            },
            `Generating organic social post (${t}) for ${e.name}`
        );
        (o = extractText(o)),
            (o = o.replace(/\{SEEDS:[^}]*\}\s*/gi, "")),
            (o = o.replace(/\{BAN:[^}]*\}\s*/gi, "")),
            (o = o.replace(/\{BOOST:[^}]*\}\s*/gi, "")),
            (o = o.replace(/\{[A-Z]+:[^}]*\}\s*/g, "")),
            (o = o.replace(/^\*\*[^*]+\*\*\s*/g, "")),
            (o = o.replace(/^Posted:\s*[^\n]+\n\s*/i, "")),
            (o = o.split(/\n\s*\(/)[0]),
            (o = o.split(/\n\s*\*/)[0]),
            (o = o.split(/\(Note:/)[0]),
            (o = o.split(/\(Character count:/)[0]),
            (o = o.split(/\(Emojis used:/)[0]),
            (o = o.split(/\(Approach:/)[0]),
            (o = o.split(/\(Style note:/)[0]),
            (o = o.split(/\*\(Balanced/)[0]),
            (o = o.split(/\*\(Casual/)[0]),
            (o = o.split(/\*\(Keeps/)[0]),
            (o = o.split(/\*\(Style/)[0]),
            (o = o.replace(/\s*\(Tagged coworkers.*?\)$/i, "")),
            (o = o.replace(/\s*\*\s*$/g, "")),
            (o = o.trim()),
            (o = o.replace(/\b(the\s+)?([Mm]y\s+)?([Oo]ur\s+)?[Bb]oss\b/g, "@TheBoss")),
            (o = o.replace(/@@TheBoss/g, "@TheBoss")),
            (o = o.replace(/@[Bb]oss\b/g, "@TheBoss")),
            (o = cleanWithLearning(o));
        const i = o.split(/\s+/).filter((e) => e.length > 0).length,
            s = /^[\s\p{Emoji}]+$/u.test(o),
            r = [
                /^made it to work\.?$/i,
                /^self-care morning\.?$/i,
                /^vibing\.?$/i,
                /^mood\.?$/i,
                /^feeling good\.?$/i,
                /^just chilling\.?$/i,
                /^another day\.?$/i,
                /^here we go\.?$/i,
                /^ready for this\.?$/i,
            ].some((e) => e.test(o.replace(/[✨💭🤔💫⚡☕📅✓😌]/g, "").trim()));
        if (i < 3 || s || r || isAiFallback(o))
            throw (
                (console.warn("[AI Quality] Post rejected: too short, generic, or AI-fallback text:", o),
                new Error("Generated content too short or generic, using fallback"))
            );
        const l = [],
            c = /@([\w.]+)/g;
        let d;
        for (; null !== (d = c.exec(o)); ) l.push(d[1]);
        l.forEach((e) => {
            const t = gameState.employees.find((t) => {
                if (!t.social?.username) return !1;
                const n = t.social.username.toLowerCase(),
                    a = e.toLowerCase();
                if (n === a) return !0;
                const o = (e) => e.replace(/[_.\-\d]/g, "").replace(/^(the|real)|official$/g, "");
                return o(n) === o(a);
            });
            t && t.social && (t.social.totalMentions = (t.social.totalMentions || 0) + 1);
        });
        let p = 0;
        "thirst_trap" === t
            ? (p = a.flirty > 70 ? 3 : 2)
            : "explicit" === t || "hookup" === t || "masturbation" === t
              ? (p = 4)
              : "nudes" === t
                ? (p = a.confidence > 70 ? 4 : 3)
                : "sexting" === t
                  ? (p = 3)
                  : "moneyshot" === t
                    ? (p = 4)
                    : "morning_after" === t
                      ? (p = a.flirty > 60 ? 3 : 2)
                      : "selfie" === t && a.flirty > 65 && (p = Math.random() < 0.3 ? 1 : 0);
        let m = null;
        return (
            (n?.mustIncludeImage ||
                [
                    "selfie",
                    "thirst_trap",
                    "explicit",
                    "nude",
                    "meme",
                    "food",
                    "travel",
                    "life_update",
                    "hookup",
                    "masturbation",
                    "nudes",
                    "moneyshot",
                    "morning_after",
                ].includes(t)) &&
                "text" !== t &&
                ((m = await generateImagePrompt(e, t, o, n)),
                console.log(
                    `[Post Generation] ${n?.mustIncludeImage ? "🎯 FORCED" : "📸 Standard"} image prompt for ${e.name}'s ${t} post`
                )),
            { content: o.trim(), imagePrompt: m, explicitLevel: p, tags: [t] }
        );
    } catch (n) {
        return (
            console.error("[AI] Generation failed for employee post:", n),
            console.error("[AI] Post type:", t),
            console.error("[AI] Employee:", e.name),
            console.warn("[AI] Post generation failed - discarding post instead of using fallback"),
            null
        );
    }
}
function analyzeCaption(e) {
    const t = e.toLowerCase(),
        n = {
            coffee: [
                "coffee",
                "latte",
                "espresso",
                "cappuccino",
                "mocha",
                "americano",
                "cold brew",
                "iced coffee",
                "frappe",
                "macchiato",
            ],
            burger: ["burger", "hamburger", "cheeseburger", "whopper", "big mac"],
            pizza: ["pizza", "slice", "pie", "pepperoni", "margherita", "deep dish"],
            sushi: ["sushi", "sashimi", "roll", "maki", "nigiri", "california roll", "spicy tuna"],
            ramen: ["ramen", "noodle soup", "tonkotsu", "miso ramen", "shoyu"],
            taco: ["taco", "tacos", "burrito", "quesadilla", "enchilada", "nachos"],
            sandwich: ["sandwich", "sub", "hoagie", "panini", "grilled cheese", "blt", "club sandwich"],
            salad: ["salad", "greens", "lettuce", "caesar", "cobb salad", "greek salad"],
            pasta: [
                "pasta",
                "spaghetti",
                "fettuccine",
                "ravioli",
                "linguine",
                "penne",
                "carbonara",
                "alfredo",
                "bolognese",
            ],
            cake: ["cake", "birthday cake", "cheesecake", "chocolate cake", "vanilla cake", "red velvet"],
            cookie: ["cookie", "cookies", "chocolate chip", "oatmeal cookie", "sugar cookie"],
            "ice cream": ["ice cream", "gelato", "sundae", "cone", "scoop"],
            donut: ["donut", "doughnut", "glazed", "jelly donut", "cruller"],
            brownie: ["brownie", "brownies", "fudge brownie"],
            "lemon bars": ["lemon bar", "lemon bars", "lemon square", "lemon dessert"],
            boba: ["boba", "bubble tea", "milk tea", "pearl tea", "tapioca"],
            smoothie: ["smoothie", "smoothie bowl", "acai bowl", "protein shake"],
            breakfast: ["breakfast", "brunch"],
            pancakes: ["pancake", "pancakes", "flapjack", "stack"],
            waffles: ["waffle", "waffles", "belgian waffle"],
            eggs: ["eggs", "scrambled", "fried egg", "omelet", "omelette", "poached egg"],
            bacon: ["bacon", "strips", "crispy bacon"],
            toast: ["toast", "buttered toast"],
            "avocado toast": ["avocado toast", "avo toast", "smashed avo"],
            cereal: ["cereal", "cheerios", "corn flakes", "granola"],
            cocktail: ["cocktail", "martini", "mojito", "margarita", "whiskey", "vodka", "gin", "tequila", "rum"],
            beer: ["beer", "brew", "ale", "lager", "ipa", "pint"],
            wine: ["wine", "red wine", "white wine", "rosé", "champagne", "prosecco"],
            tea: ["tea", "green tea", "black tea", "chai", "herbal tea", "iced tea"],
            wings: ["wing", "wings", "buffalo wings", "chicken wings", "hot wings"],
            fries: ["fries", "french fries", "chips", "waffle fries", "curly fries"],
            soup: ["soup", "stew", "chowder", "bisque", "pho", "gumbo"],
            steak: ["steak", "ribeye", "sirloin", "filet", "beef", "t-bone"],
            chicken: ["chicken", "poultry", "fried chicken", "grilled chicken", "chicken breast"],
            seafood: ["seafood", "fish", "salmon", "tuna", "shrimp", "lobster", "crab", "oyster"],
            bbq: ["bbq", "barbecue", "ribs", "brisket", "pulled pork", "smoked"],
            hotdog: ["hot dog", "hotdog", "frank", "corn dog"],
            popcorn: ["popcorn", "kettle corn"],
            chips: ["chips", "potato chips", "tortilla chips", "pretzels", "crisps"],
            cheese: ["cheese", "cheddar", "mozzarella", "brie", "gouda", "parmesan", "cheese board", "charcuterie"],
            "poke bowl": ["poke", "poke bowl", "ahi"],
            curry: ["curry", "indian food", "tikka masala", "vindaloo"],
            "dim sum": ["dim sum", "dumpling", "dumplings", "bao", "steamed bun"],
            bagel: ["bagel", "bagels", "cream cheese"],
            muffin: ["muffin", "muffins", "blueberry muffin"],
            croissant: ["croissant", "pastry", "danish"],
            fruit: ["fruit", "apple", "banana", "orange", "berry", "berries", "strawberry", "mango", "watermelon"],
            vegetables: ["veggie", "vegetables", "carrot", "broccoli", "spinach"],
            snack: ["snack", "snacking", "munchies"],
        };
    let a = null;
    for (const [e, o] of Object.entries(n))
        if (o.some((e) => t.includes(e))) {
            a = e;
            break;
        }
    const o = {
        tired: [
            "tired",
            "exhausted",
            "sleepy",
            "dead",
            "drained",
            "worn out",
            "beat",
            "fatigue",
            "zombie",
            "need sleep",
            "can't even",
        ],
        happy: [
            "happy",
            "excited",
            "great",
            "amazing",
            "wonderful",
            "fantastic",
            "vibing",
            "blessed",
            "grateful",
            "joyful",
            "thrilled",
            "elated",
            "stoked",
        ],
        confident: [
            "confident",
            "feeling myself",
            "good vibes",
            "powerful",
            "unstoppable",
            "boss",
            "killing it",
            "on top",
            "got this",
            "crushing",
        ],
        flirty: [
            "flirt",
            "mood",
            "you know",
            "wink",
            "after hours",
            "naughty",
            "cheeky",
            "tease",
            "playful",
            "spicy",
            "wild",
            "devil",
        ],
        stressed: [
            "stress",
            "busy",
            "hectic",
            "overwhelm",
            "deadline",
            "crazy",
            "panic",
            "anxiety",
            "nervous",
            "worried",
            "pressure",
        ],
        relaxed: [
            "chill",
            "relax",
            "calm",
            "peaceful",
            "zen",
            "cozy",
            "serene",
            "tranquil",
            "ease",
            "unwind",
            "mellow",
        ],
        sad: ["sad", "down", "depressed", "blue", "melancholy", "heartbroken", "crying", "tears", "upset", "hurt"],
        angry: ["angry", "mad", "furious", "pissed", "annoyed", "irritated", "rage", "frustrated", "livid"],
        silly: ["silly", "goofy", "funny", "derp", "weird", "quirky", "random", "chaos", "unhinged"],
        proud: ["proud", "accomplished", "achievement", "success", "win", "nailed it", "crushed it"],
        bored: ["bored", "boring", "meh", "whatever", "yawn", "nothing to do"],
        hungover: ["hungover", "hangover", "regret", "last night", "never again", "why did i"],
        motivated: ["motivated", "motivated", "inspired", "determined", "focused", "driven", "hustle", "grind"],
        romantic: ["romantic", "love", "date night", "valentine", "crush", "heart", "swooning"],
        mysterious: ["mysterious", "secret", "cryptic", "enigma", "wonder", "curious"],
        sassy: ["sassy", "attitude", "unbothered", "petty", "shade", "savage"],
    };
    let i = "neutral";
    for (const [e, n] of Object.entries(o))
        if (n.some((e) => t.includes(e))) {
            i = e;
            break;
        }
    const s = {
        workout: [
            "workout",
            "gym",
            "exercise",
            "fitness",
            "lift",
            "lifting",
            "cardio",
            "run",
            "running",
            "jog",
            "jogging",
            "weights",
            "training",
            "sweat",
            "gains",
            "leg day",
            "arm day",
        ],
        yoga: ["yoga", "meditation", "meditate", "stretch", "stretching", "pilates"],
        travel: ["travel", "trip", "vacation", "holiday", "getaway", "adventure", "explore", "wanderlust"],
        work: ["work", "working", "meeting", "project", "deadline", "presentation", "client", "boss", "coworker"],
        cooking: ["cook", "cooking", "baking", "bake", "recipe", "homemade", "chef", "kitchen", "meal prep"],
        reading: ["read", "reading", "book", "novel", "page", "chapter", "library", "literature"],
        gaming: [
            "game",
            "gaming",
            "play",
            "playing",
            "controller",
            "stream",
            "streaming",
            "twitch",
            "console",
            "pc gaming",
            "esports",
        ],
        art: [
            "paint",
            "painting",
            "draw",
            "drawing",
            "art",
            "sketch",
            "sketching",
            "canvas",
            "illustration",
            "digital art",
        ],
        music: [
            "music",
            "song",
            "singing",
            "guitar",
            "piano",
            "drums",
            "concert",
            "band",
            "playlist",
            "jam",
            "practice",
        ],
        dancing: ["dance", "dancing", "moves", "choreography", "ballet", "salsa", "club", "party"],
        shopping: ["shopping", "shop", "store", "mall", "bought", "purchase", "retail therapy", "haul"],
        cleaning: ["clean", "cleaning", "organize", "organizing", "tidy", "laundry", "dishes", "vacuum"],
        studying: ["study", "studying", "homework", "exam", "test", "cramming", "research", "learning"],
        driving: ["drive", "driving", "commute", "traffic", "road trip", "cruise"],
        walking: ["walk", "walking", "stroll", "strolling", "hike", "hiking"],
        swimming: ["swim", "swimming", "pool", "lap", "dive", "diving"],
        biking: ["bike", "biking", "cycle", "cycling", "bicycle", "ride", "riding"],
        photography: ["photo", "photography", "camera", "shoot", "shooting", "pictures", "snap", "capture"],
        movie: ["movie", "film", "cinema", "theater", "watching", "binge", "netflix", "tv show", "series"],
        socializing: ["friends", "hanging out", "hangout", "party", "gathering", "social", "meet up", "catch up"],
        sleeping: ["sleep", "sleeping", "nap", "napping", "bed", "rest", "snooze"],
        drinking: ["drinking", "drinks", "bar", "pub", "tipsy", "drunk", "shots", "cheers"],
        selfcare: ["self care", "spa", "facial", "massage", "manicure", "pedicure", "pamper", "treat myself"],
        grooming: ["shower", "bath", "shave", "hair", "makeup", "skincare", "getting ready"],
        diy: ["diy", "build", "building", "craft", "crafting", "project", "handmade", "woodwork"],
        gardening: ["garden", "gardening", "plant", "plants", "flower", "flowers", "grow", "growing"],
        pets: ["pet", "dog", "cat", "puppy", "kitten", "fur baby", "doggo", "pupper", "kitty"],
        celebration: [
            "celebrate",
            "celebrating",
            "birthday",
            "anniversary",
            "promotion",
            "milestone",
            "achievement",
        ],
    };
    let r = null;
    for (const [e, n] of Object.entries(s))
        if (n.some((e) => t.includes(e))) {
            r = e;
            break;
        }
    const l = {
        home: ["home", "house", "apartment", "room", "living room", "couch", "sofa", "staying in"],
        bedroom: ["bedroom", "bed", "bedroom vibes"],
        bathroom: ["bathroom", "mirror", "restroom"],
        kitchen: ["kitchen", "counter", "stove", "oven"],
        office: ["office", "desk", "cubicle", "workspace", "conference room", "meeting room", "work"],
        gym: ["gym", "fitness center", "weight room", "locker room"],
        outdoor: ["outside", "outdoor", "outdoors", "fresh air"],
        park: ["park", "playground", "green space"],
        beach: ["beach", "shore", "sand", "ocean", "sea", "waves", "coastline"],
        mountains: ["mountain", "mountains", "peak", "summit", "trail", "hike"],
        car: ["car", "vehicle", "driving", "front seat", "back seat"],
        restaurant: ["restaurant", "diner", "eatery", "bistro"],
        cafe: ["cafe", "coffee shop", "café", "coffeehouse", "starbucks"],
        bar: ["bar", "pub", "tavern", "lounge", "club", "nightclub"],
        airport: ["airport", "terminal", "gate", "flight", "plane", "airplane"],
        hotel: ["hotel", "resort", "motel", "inn", "room service"],
        mall: ["mall", "shopping center", "store", "retail"],
        library: ["library", "bookstore", "book shop"],
        hospital: ["hospital", "clinic", "doctor", "medical"],
        school: ["school", "university", "college", "campus", "class", "classroom"],
        pool: ["pool", "swimming pool", "poolside"],
        elevator: ["elevator", "lift"],
        parking: ["parking lot", "parking garage", "garage"],
        subway: ["subway", "train", "metro", "station"],
        rooftop: ["rooftop", "roof", "terrace"],
        balcony: ["balcony", "patio", "deck"],
        garden: ["garden", "backyard", "yard"],
        forest: ["forest", "woods", "trees", "nature"],
        city: ["city", "downtown", "urban", "skyline", "street"],
        countryside: ["countryside", "rural", "farm", "field"],
    };
    let c = null;
    for (const [e, n] of Object.entries(l))
        if (n.some((e) => t.includes(e))) {
            c = e;
            break;
        }
    const d = {
        morning: ["morning", "breakfast", "sunrise", "dawn", "am", "woke up", "wake up"],
        afternoon: ["afternoon", "lunch", "midday", "noon"],
        evening: ["evening", "dinner", "sunset", "dusk", "pm"],
        night: ["night", "nighttime", "late night", "midnight", "dark"],
        latenight: ["late", "2am", "3am", "4am", "can't sleep", "insomnia"],
    };
    let p = null;
    for (const [e, n] of Object.entries(d))
        if (n.some((e) => t.includes(e))) {
            p = e;
            break;
        }
    const m = {
        sunny: ["sunny", "sun", "sunshine", "bright", "clear", "beautiful day"],
        rainy: ["rain", "raining", "rainy", "wet", "umbrella", "drizzle", "storm", "stormy"],
        snowy: ["snow", "snowing", "snowy", "winter", "cold", "freezing", "ice"],
        cloudy: ["cloudy", "overcast", "gray", "grey", "gloomy"],
        hot: ["hot", "heat", "sweat", "humid", "melting"],
        windy: ["windy", "wind", "breezy", "breeze"],
    };
    let u = null;
    for (const [e, n] of Object.entries(m))
        if (n.some((e) => t.includes(e))) {
            u = e;
            break;
        }
    const g = {
        casual: ["casual", "comfy", "comfortable", "sweats", "hoodie", "jeans", "t-shirt", "tshirt"],
        formal: ["formal", "dress", "suit", "tie", "heels", "blazer", "professional"],
        athletic: ["athletic", "workout clothes", "gym clothes", "activewear", "leggings", "sports bra", "tank"],
        pajamas: ["pajamas", "pjs", "pj", "sleepwear", "nightgown"],
        swimwear: ["swimsuit", "bikini", "swimwear", "bathing suit", "trunks"],
        cozy: ["cozy", "cosy", "fuzzy", "blanket", "warm"],
    };
    let h = null;
    for (const [e, n] of Object.entries(g))
        if (n.some((e) => t.includes(e))) {
            h = e;
            break;
        }
    const y = {
        golden_hour: ["golden hour", "sunset", "sunrise", "magic hour"],
        natural: ["natural light", "daylight", "sunlight"],
        dark: ["dark", "darkness", "dim", "shadow", "shadows"],
        bright: ["bright", "well lit", "flash"],
        moody: ["moody", "dramatic", "noir", "cinematic"],
        soft: ["soft", "gentle", "warm", "ambient"],
    };
    let f = null;
    for (const [e, n] of Object.entries(y))
        if (n.some((e) => t.includes(e))) {
            f = e;
            break;
        }
    const b = {
        alone: ["alone", "solo", "by myself", "me time", "solo"],
        with_friends: ["friends", "squad", "crew", "gang", "besties", "bff"],
        with_partner: ["boyfriend", "girlfriend", "partner", "bae", "boo", "date"],
        with_coworkers: ["coworker", "colleague", "team", "work friend"],
        with_family: ["family", "mom", "dad", "sister", "brother", "parents"],
    };
    let v = null;
    for (const [e, n] of Object.entries(b))
        if (n.some((e) => t.includes(e))) {
            v = e;
            break;
        }
    const w = {
        phone: ["phone", "iphone", "android", "mobile", "cell"],
        laptop: ["laptop", "computer", "macbook", "pc"],
        book: ["book", "novel", "reading"],
        headphones: ["headphones", "earbuds", "airpods", "music"],
        sunglasses: ["sunglasses", "shades"],
        hat: ["hat", "cap", "beanie"],
        bag: ["bag", "purse", "backpack", "tote"],
    };
    let x = null;
    for (const [e, n] of Object.entries(w))
        if (n.some((e) => t.includes(e))) {
            x = e;
            break;
        }
    const S = {
        spring: ["spring", "springtime", "bloom", "flowers"],
        summer: ["summer", "summertime", "hot", "beach season"],
        fall: ["fall", "autumn", "leaves", "pumpkin", "halloween"],
        winter: ["winter", "wintertime", "snow", "cold", "holiday", "christmas"],
    };
    let k = null;
    for (const [e, n] of Object.entries(S))
        if (n.some((e) => t.includes(e))) {
            k = e;
            break;
        }
    const T = {
        sitting: ["sitting", "sit", "seated", "chair"],
        standing: ["standing", "stand"],
        lying: ["lying", "laying", "lay down", "horizontal"],
        leaning: ["lean", "leaning"],
        walking: ["walking", "walk"],
        looking_back: ["looking back", "over shoulder", "glance back"],
    };
    let C = null;
    for (const [e, n] of Object.entries(T))
        if (n.some((e) => t.includes(e))) {
            C = e;
            break;
        }
    const E = [];
    [
        "tokyo",
        "kyoto",
        "paris",
        "london",
        "rome",
        "barcelona",
        "amsterdam",
        "berlin",
        "prague",
        "vienna",
        "venice",
        "florence",
        "milan",
        "athens",
        "santorini",
        "mykonos",
        "bali",
        "phuket",
        "bangkok",
        "singapore",
        "hong kong",
        "seoul",
        "beijing",
        "shanghai",
        "dubai",
        "istanbul",
        "cairo",
        "marrakech",
        "cape town",
        "sydney",
        "melbourne",
        "auckland",
        "fiji",
        "hawaii",
        "maui",
        "oahu",
        "tahiti",
        "bora bora",
        "maldives",
        "seychelles",
        "mauritius",
        "bali",
        "cancun",
        "cabo",
        "tulum",
        "playa del carmen",
        "costa rica",
        "jamaica",
        "bahamas",
        "aruba",
        "new york",
        "nyc",
        "manhattan",
        "brooklyn",
        "los angeles",
        "la",
        "hollywood",
        "malibu",
        "san francisco",
        "miami",
        "vegas",
        "las vegas",
        "chicago",
        "boston",
        "seattle",
        "portland",
        "austin",
        "nashville",
        "new orleans",
        "montreal",
        "toronto",
        "vancouver",
        "whistler",
        "mexico city",
        "buenos aires",
        "rio",
        "sao paulo",
        "lima",
        "santiago",
        "bogota",
        "cartagena",
        "havana",
        "lisboa",
        "lisbon",
        "porto",
        "madrid",
        "seville",
        "ibiza",
        "mallorca",
        "valencia",
        "geneva",
        "zurich",
        "lucerne",
        "copenhagen",
        "stockholm",
        "oslo",
        "helsinki",
        "reykjavik",
        "iceland",
        "dublin",
        "edinburgh",
        "glasgow",
        "belfast",
        "budapest",
        "krakow",
        "warsaw",
        "dubrovnik",
        "split",
        "zagreb",
        "bucharest",
        "sofia",
        "belgrade",
        "tel aviv",
        "jerusalem",
        "petra",
        "dubai",
        "abu dhabi",
        "doha",
        "muscat",
        "mumbai",
        "delhi",
        "jaipur",
        "agra",
        "goa",
        "kathmandu",
        "pokhara",
        "colombo",
        "manila",
        "hanoi",
        "ho chi minh",
        "siem reap",
        "angkor",
        "luang prabang",
        "yangon",
        "bagan",
        "kuala lumpur",
        "penang",
        "langkawi",
        "jakarta",
        "ubud",
        "queenstown",
        "rotorua",
        "perth",
        "brisbane",
        "gold coast",
        "cairns",
        "great barrier reef",
    ].forEach((e) => {
        t.includes(e) && E.push(e);
    });
    [
        "bamboo",
        "cherry blossom",
        "cherry blossoms",
        "sakura",
        "palm tree",
        "palm trees",
        "coconut tree",
        "pine tree",
        "redwood",
        "sequoia",
        "cactus",
        "desert",
        "dunes",
        "sand dunes",
        "waterfall",
        "volcano",
        "geyser",
        "hot springs",
        "aurora",
        "northern lights",
        "southern lights",
        "milky way",
        "stars",
        "starry sky",
        "full moon",
        "sunset",
        "sunrise",
        "rainbow",
        "double rainbow",
        "lighthouse",
        "windmill",
        "windmills",
        "castle",
        "temple",
        "shrine",
        "pagoda",
        "mosque",
        "cathedral",
        "church",
        "monastery",
        "ruins",
        "ancient",
        "colosseum",
        "eiffel tower",
        "big ben",
        "statue of liberty",
        "golden gate",
        "brooklyn bridge",
        "times square",
        "central park",
        "taj mahal",
        "great wall",
        "pyramids",
        "sphinx",
        "acropolis",
        "parthenon",
        "stonehenge",
        "machu picchu",
        "christ the redeemer",
        "sugarloaf mountain",
        "mount fuji",
        "mount everest",
        "kilimanjaro",
        "matterhorn",
        "swiss alps",
        "rocky mountains",
        "andes",
        "himalayas",
        "grand canyon",
        "yosemite",
        "yellowstone",
        "zion",
        "bryce canyon",
        "glacier",
        "fjord",
        "fjords",
        "iceberg",
        "ice cave",
        "blue lagoon",
        "cenote",
        "cave",
        "cavern",
        "grotto",
        "canyon",
        "valley",
        "meadow",
        "prairie",
        "savanna",
        "jungle",
        "rainforest",
        "mangrove",
        "coral reef",
        "kelp forest",
        "vineyard",
        "winery",
        "lavender field",
        "tulip field",
        "sunflower field",
        "rice paddy",
        "terraces",
        "rice terraces",
        "tea plantation",
        "coffee farm",
        "olive grove",
        "orchard",
        "botanical garden",
        "japanese garden",
        "zen garden",
        "rooftop",
        "skyline",
        "skyscraper",
        "penthouse",
        "balcony",
        "terrace",
        "patio",
        "deck",
        "pier",
        "dock",
        "marina",
        "harbor",
        "port",
        "boardwalk",
        "promenade",
        "cobblestone",
        "alley",
        "alleyway",
        "street art",
        "mural",
        "graffiti",
        "neon lights",
        "neon signs",
        "lanterns",
        "fairy lights",
        "string lights",
        "christmas lights",
        "fireworks",
        "bonfire",
        "campfire",
        "fire pit",
    ].forEach((e) => {
        t.includes(e) && E.push(e);
    });
    return (
        [
            "dance party",
            "dancing party",
            "coding session",
            "coding marathon",
            "coding",
            "hackathon",
            "photoshoot",
            "photo shoot",
            "wine tasting",
            "beer tasting",
            "brunch",
            "dinner party",
            "house party",
            "rooftop party",
            "pool party",
            "beach party",
            "bbq party",
            "birthday party",
            "karaoke",
            "trivia night",
            "game night",
            "movie night",
            "girls night",
            "boys night",
            "date night",
            "spa day",
            "beach day",
            "snow day",
            "road trip",
            "camping trip",
            "backpacking",
            "glamping",
            "safari",
            "cruise",
            "boat trip",
            "yacht",
            "sailing",
            "snorkeling",
            "scuba diving",
            "surfing",
            "paddleboarding",
            "kayaking",
            "rafting",
            "zip lining",
            "rock climbing",
            "bouldering",
            "skiing",
            "snowboarding",
            "ice skating",
            "sledding",
            "tubing",
            "parasailing",
            "skydiving",
            "bungee jumping",
            "hot air balloon",
            "helicopter ride",
            "scenic flight",
        ].forEach((e) => {
            t.includes(e) && E.push(e);
        }),
        {
            food: a,
            mood: i,
            activity: r,
            location: c,
            timeOfDay: p,
            weather: u,
            clothing: h,
            lighting: f,
            socialContext: v,
            object: x,
            season: k,
            pose: C,
            specificDetails: E.length > 0 ? E : null,
            rawCaption: e,
        }
    );
}
async function generateImagePrompt(e, t, n, a = null) {
    const o = e.personality || {},
        isExplicitPost =
            [
                "explicit",
                "thirst_trap",
                "hookup",
                "masturbation",
                "nudes",
                "sexting",
                "moneyshot",
                "morning_after",
            ].includes(t) || !!a?.requestedByBoss,
        i = getPhysicalDescriptionForPrompt(e, { nude: "explicit" === t, noGenitals: !isExplicitPost });
    let s = "",
        r = "";
    if ("explicit" === t || "thirst_trap" === t || a?.requestedByBoss) {
        const t = gameState.chatHistory[e.id] || [],
            n = Date.now() - 72e5,
            o = t.filter((e) => (e.timestamp || 0) > n).slice(-5);
        if (o.length >= 2) {
            s = `\n\nRECENT CONVERSATION WITH BOSS:\n${o
                    .slice(-3)
                    .map((e) => `${e.sender}: "${e.content}"`)
                    .join("\n")}\n(Consider if the post is responding to or related to this conversation)`;
        }
        a?.requestedByBoss &&
            (r = `\n\nBOSS REQUESTED THIS POST: The boss specifically asked for this type of post${a.requestContext ? `: "${a.requestContext}"` : ""}. The image should fulfill their request.`);
    }
    const l = `You are creating an image prompt for a social media post.\n\nEMPLOYEE PHYSICAL DESCRIPTION:\n${i}\n\nPOST TYPE: ${t}\nPOST CAPTION: "${n}"\n${s}${r}\n\nCRITICAL INSTRUCTIONS:\n1. Generate a DETAILED image prompt that EXACTLY matches what the caption describes or implies\n2. Use the employee's EXACT physical description (copy it verbatim - don't summarize)\n3. If caption mentions specific clothing, pose, location, mood - include ALL of it\n4. If caption implies nudity/explicit content, describe it explicitly (this is for adult content)\n5. If caption references a conversation (like "your request"), consider recent chat context\n6. Be HIGHLY SPECIFIC about pose, clothing, expression, setting, camera angle\n7. For explicit posts: describe anatomy visibility in detail (use anatomical terms from physical description)\n8. For Female Futa: explicitly mention BOTH penis and vagina if nude/explicit\n9. For Trans characters: use their appropriate anatomy from physical description\n10. Make the image and caption tell ONE COHESIVE STORY\n\nEXAMPLES OF GOOD IMAGE PROMPTS:\n\nCaption: "Locked door, unlocked desires... your special request delivered fresh 😈"\nType: explicit\nContext: Boss requested nude photo\nImage Prompt: "(Physical description) stands in front of a locked wooden door in bedroom. She is completely nude, full frontal nudity. Her (specific breast description from profile) are fully exposed, nipples visible. Her (specific genital description - both penis and vagina for futa) are on full display in an erotic showcase. Face shows passionate, teasing expression looking directly at camera. Hands on hips, confident pose. Soft bedroom lighting. NSFW explicit content for boss's private request."\n\nCaption: "That post-workout glow though 💪"\nType: selfie\nImage Prompt: "(Physical description) taking gym mirror selfie. Wearing sports bra and leggings, slightly sweaty from workout. Face shows accomplished smile with flushed cheeks from exercise. Gym equipment visible in background. Phone in hand. Natural gym lighting. Athletic, healthy vibe."\n\nCaption: "Coffee and chaos, the Monday mood ☕😩"\nType: text/food\nImage Prompt: "Close-up of artisan coffee cup on messy office desk. Laptop visible, papers scattered. Morning natural lighting through window. Cozy but slightly overwhelmed atmosphere. No person visible, focus on coffee and workspace chaos."\n\nNOW GENERATE THE IMAGE PROMPT:\nWrite ONLY the detailed image prompt - no explanations, no meta-commentary:`;
    try {
        let t = await queuedGenerateText(
            l,
            {
                temperature: 0.8,
                max_tokens: 150,
                stopSequences: [
                    "\n\n\n",
                    "Caption:",
                    "Example:",
                    "Note:",
                    "Remember:",
                    "**Note",
                    "Type:",
                    "Context:",
                    "---",
                ],
            },
            "Generating image prompt for social post"
        );
        if (
            ((t = t.replace(/^\*\*[^*]+\*\*\s*/g, "")),
            (t = t.split(/\n\s*\(/)[0]),
            (t = t.split(/\(Note:/)[0]),
            (t = t.trim()),
            // The LLM can hit max_tokens mid-sentence, leaving a dangling fragment like
            // "...capturing the essence: a" — the style directive then concatenates onto it.
            // Trim a trailing incomplete clause (dangling article/preposition/colon) so the
            // base prompt ends cleanly before style tags are appended.
            (t = t.replace(/[\s,:;–-]+$/g, "")),
            (t = t.replace(
                /[\s,]+\b(a|an|the|and|but|or|with|of|in|on|at|to|for|from|her|his|their|its|as|is|are|was|were|that|which|who)\b\s*$/i,
                ""
            )),
            (t = t.replace(/[\s,:;–-]+$/g, "").trim()),
            t && t.length > 20)
        )
            return console.log(`AI-generated image prompt for ${e.name}:`, t.substring(0, 100) + "..."), t;
        console.warn("AI image prompt too short, falling back to template");
    } catch (e) {
        console.error("AI image prompt generation failed:", e);
    }
    const c = analyzeCaption(n),
        d = {
            selfie: [
                `${i} taking a casual selfie, natural lighting, friendly smile, office setting`,
                `Close-up selfie of ${i}, relaxed expression, neutral background, good lighting`,
                `${i} taking selfie with soft smile, professional casual look, modern aesthetic`,
                `Mirror selfie of ${i}, casual outfit, phone in hand, clean background`,
                `${i} bathroom mirror selfie, good lighting, casual pose, modern style`,
                `Car selfie of ${i}, golden hour lighting, windshield reflection, relaxed vibe`,
                `${i} desk selfie, workspace visible, laptop in background, professional casual`,
                `Outdoor selfie of ${i}, natural daylight, blurred background, genuine smile`,
                `${i} elevator selfie, mirror reflection, going to work vibes, morning energy`,
                `Coffee shop selfie of ${i}, drink in frame, cozy atmosphere, casual Monday mood`,
                `${i} post-workout selfie, gym mirror, athletic wear, accomplishment glow`,
                `${i} bedroom selfie, soft morning light, messy hair, authentic moment`,
                `${i} lunch break selfie, restaurant background, food nearby, happy expression`,
                `Late night work selfie of ${i}, desk lamp lighting, tired but determined look`,
                `Weekend selfie of ${i}, casual home setting, relaxed vibe, natural smile`,
            ],
            thirst_trap: [
                `Provocative photo of ${i} in form-fitting gym attire, sports bra and leggings, toned body visible, gym mirror selfie, showing off physique, confident sexy pose`,
                `${i} in tight dress, curves emphasized, low neckline, showing cleavage, mirror selfie, bedroom setting, seductive expression, body on display`,
                `${i} in lingerie, lace bra and panties, bedroom mirror selfie, sensual pose, showing off body, intimate setting, confident and sexy`,
                `${i} in bikini, beach or poolside, wet from water, body glistening, revealing swimwear, showing skin, attractive pose, summer vibes`,
                `${i} wearing unbuttoned shirt, cleavage visible, messy hair, bedroom eyes, seductive morning look, showing skin suggestively`,
                `${i} in tight yoga pants and crop top, cameltoe visible, toned stomach showing, gym setting, athletic but sexy, mirror selfie`,
                `${i} in short skirt and crop top, midriff exposed, legs on display, confident pose, urban setting, showing off body`,
                `${i} in silk robe barely covering body, cleavage visible, bare legs showing, bedroom setting, morning after vibe, sultry expression`,
                `${i} in wet white shirt, see-through fabric, outline visible, water droplets, provocative accidental reveal aesthetic`,
                `${i} from behind, tight pants emphasizing butt, looking over shoulder, flirty expression, showing off curves, confident pose`,
                `${i} in sports bra only, bare midriff, athletic shorts low on hips, post-workout selfie, toned body on display, sweaty and sexy`,
                `${i} in backless dress, bare back visible, side curves showing, elegant but provocative, looking over shoulder seductively`,
                `${i} in low-cut top, deep cleavage visible, leaning forward, close-up angle, showing assets, bedroom eyes, flirty vibe`,
                `${i} lying on bed in underwear, body stretched out, intimate angle, showing curves, messy bedroom hair, come-hither expression`,
                `${i} sitting with legs spread in short skirt, inner thighs visible, provocative pose, confident expression, daring photo`,
            ],
            explicit: [
                `NSFW photo of ${i} topless, breasts exposed, hands covering nipples, bedroom setting, nude from waist up, sensual lighting, explicit content`,
                `${i} completely nude, full frontal nudity, strategic hand placement, bedroom or bathroom, soft lighting, artistic nude photography, explicit NSFW`,
                `${i} in transparent lingerie, nipples visible through fabric, see-through panties, body fully on display, bedroom, explicit intimate wear`,
                `${i} topless from behind, bare back and butt visible, looking over shoulder, nude photography, sensual pose, NSFW explicit content`,
                `${i} nude in shower, water running over naked body, wet skin glistening, intimate bathroom setting, full nudity, explicit content`,
                `${i} on bed completely naked, lying seductively, intimate bedroom angle, full body nudity visible, explicit NSFW photography`,
                `${i} wearing only unbuttoned shirt open exposing breasts, bare pussy visible, sitting pose, bedroom, explicit nude content`,
                `${i} topless mirror selfie, breasts fully exposed, nipples visible, confident pose, bathroom or bedroom, explicit NSFW content`,
                `${i} in spread eagle pose wearing nothing, full frontal nudity, lying on bed, intimate explicit angle, NSFW adult content`,
                `${i} nude from side angle, breast and butt visible, artistic nude pose, bedroom setting, sensual lighting, explicit photography`,
                `${i} wearing collar and nothing else, submissive kneeling pose, bedroom floor, fetish content, explicit NSFW`,
                `${i} in bed sheets barely covering, breast peeking out, implied full nudity underneath, intimate morning scene, explicit suggestion`,
                `${i} bent over showing bare ass, topless, looking back at camera, bedroom, explicit provocative pose, NSFW adult content`,
                `${i} with legs spread wide in lingerie, crotch area visible, extremely revealing, bedroom, explicit sexual pose, NSFW`,
                `${i} masturbating, hand between legs, topless, bedroom, explicit sexual content, NSFW adult photography, orgasmic expression`,
            ],
            meme: [
                "Funny relatable meme image, office humor, modern internet meme style, text overlay space",
                "Humorous workplace situation image, meme format, relatable content, funny expression",
                "Comic-style meme about office life, funny scenario, internet humor aesthetic",
                "Distracted boyfriend meme style, office edition, three people, dramatic pointing",
                "Drake yes/no meme template, office scenarios, contrasting situations, clear panels",
                "Expanding brain meme style, office productivity levels, ascending intelligence joke",
                "This is fine dog meme, office on fire metaphor, coffee drinking, everything burning",
                "Woman yelling at cat meme, office meeting drama, pointing and confused expressions",
                "Two buttons sweating choice meme, work-life balance dilemma, person struggling to decide",
                "Surprised Pikachu face, office edition, shocked reaction, yellow character, meme format",
                "Galaxy brain meme style, office hacks, ascending ideas, space background evolution",
                "Batman slapping Robin meme, office suggestion rejected, dramatic slap action",
                "Change my mind meme, controversial office opinion, person at table, debate setup",
                "Always has been meme, astronauts in space, office realization, gun pointing revelation",
                "Is this a butterfly meme, confused person, office task misidentification, pointing gesture",
                "Vince McMahon reaction meme, increasing excitement, office scenarios, four panel progression",
                "Bernie Sanders sitting meme, office edition, folded arms, chair sitting, waiting mood",
                "Roll Safe thinking meme, office life hack, pointing at head, can't fail logic",
            ],
            food: [
                "Delicious artisan coffee in ceramic mug, latte art, wooden table, morning light, cafe aesthetic",
                "Gourmet lunch plate, colorful ingredients, restaurant presentation, overhead shot, Instagram-worthy",
                "Mouth-watering burger and fries, golden crispy, food truck setting, casual dining vibe",
                "Fresh sushi platter, colorful rolls, elegant presentation, Japanese restaurant, chopsticks",
                "Steaming bowl of ramen, soft-boiled egg, green onions, noodles lifted, authentic Asian cuisine",
                "Decadent dessert plate, chocolate cake, drizzle, fork ready, cafe setting, indulgent",
                "Healthy breakfast bowl, acai berries, granola, fruits, colorful presentation, morning energy",
                "Pizza slice with cheese pull, wood-fired crust, melty goodness, casual dining, shareable",
                "Fancy cocktail with garnish, colorful drink, ice cubes, bar setting, evening vibes",
                "Street taco plate, three tacos, authentic Mexican, lime wedge, casual food truck aesthetic",
                "Starbucks cup on desk, laptop nearby, work setup, coffee shop vibes, productivity mood",
                "Homemade pasta dish, fork twirling, fresh basil, rustic Italian, warm lighting",
                "Smoothie bowl, tropical fruits, granola topping, bright colors, healthy lifestyle aesthetic",
                "Takeout containers on desk, late night work, Chinese food, chopsticks, office grind",
                "Avocado toast, poached egg, artisan bread, brunch aesthetic, millennial food culture",
                "Boba tea with straw, colorful drink, pearls visible, trendy cafe, aesthetic background",
                "Charcuterie board, cheese, meats, grapes, crackers, sharing platter, sophisticated snacking",
            ],
            travel: [
                "Beautiful beach sunset, palm trees silhouette, orange sky, vacation vibes, peaceful scene",
                `${i} at mountain summit, arms raised, scenic overlook, adventure achievement`,
                "Stunning city skyline at night, lights reflecting, urban exploration, travel photography",
                "Tropical beach scene, turquoise water, white sand, paradise destination, vacation mode",
                `${i} at famous landmark, tourist pose, iconic background, travel memories`,
                "Airport terminal view, planes visible, travel excitement, departure board, wanderlust",
                "Hotel room view, city skyline through window, morning coffee, business travel aesthetic",
                "Hiking trail panorama, mountains in distance, nature path, outdoor adventure, scenic beauty",
                "Beach footprints in sand, ocean waves, sunset lighting, peaceful moment, coastal vibes",
                `${i} on airplane, window seat, clouds outside, travel mood, flying high`,
                "European cobblestone street, historic buildings, charming alley, cultural exploration",
                "Desert landscape, vast horizon, golden hour, road trip adventure, American Southwest",
                "Ski resort view, snowy mountains, winter sports, cold weather travel, alpine scenery",
                "Tropical poolside, resort view, palm trees, lounging, luxury vacation aesthetic",
                `${i} backpack on, train station, solo travel, adventure beginning, wanderlust mood`,
                "National park vista, natural wonder, dramatic landscape, outdoor exploration, bucket list",
                "Cruise ship deck view, ocean horizon, maritime travel, luxurious journey, sea adventure",
            ],
            life_update: [
                `${i} reading book in cozy chair, home setting, warm lighting, relaxation time`,
                `${i} with new pet, happy cuddle, home environment, life milestone moment`,
                "Yoga mat and water bottle, fitness journey, home workout setup, healthy lifestyle",
                `${i} painting on canvas, art supplies, creative hobby, focused expression`,
                "New apartment empty room, moving boxes, fresh start, life transition, excited energy",
                `${i} playing guitar, music hobby, casual home setting, creative pursuit`,
                "Garden with growing plants, dirt hands, outdoor hobby, nature connection, satisfying growth",
                `${i} at graduation, cap and gown, achievement moment, proud expression`,
                "Cozy reading nook, books stacked, coffee nearby, personal space, intellectual hobby",
                `${i} running on trail, athletic gear, fitness goal, outdoor exercise`,
                "Home office setup, organized desk, plants, productivity space, work-from-home life",
                `${i} cooking in kitchen, ingredients visible, culinary hobby, domestic scene`,
                "Meditation space, cushions, candles, zen atmosphere, wellness practice, self-care",
                `${i} with baked goods, oven mitt, proud baker, kitchen accomplishment`,
                "Bicycle leaned against wall, outdoor adventure gear, active lifestyle, weekend plans",
                `${i} at pottery wheel, clay hands, craft hobby, artistic concentration`,
                "Home gym equipment, weights visible, fitness dedication, personal space, health journey",
            ],
        };
    let p = "";
    if ("food" === t && c.food) {
        (p =
            {
                coffee: "Delicious artisan coffee in ceramic mug, latte art, wooden table, morning light, cafe aesthetic",
                burger: "Mouth-watering burger and fries, golden crispy, sesame bun, melted cheese, casual dining vibe",
                pizza: "Pizza slice with cheese pull, wood-fired crust, melty goodness, toppings visible, shareable",
                sushi: "Fresh sushi platter, colorful rolls, elegant presentation, Japanese restaurant, chopsticks, soy sauce",
                ramen: "Steaming bowl of ramen, soft-boiled egg, green onions, noodles lifted, authentic Asian cuisine",
                taco: "Street taco plate, three tacos, authentic Mexican, lime wedge, cilantro, casual food truck aesthetic",
                sandwich: "Delicious sandwich, layers visible, fresh ingredients, deli presentation, toasted bread",
                salad: "Fresh colorful salad bowl, mixed greens, vegetables, healthy presentation, fork ready",
                pasta: "Homemade pasta dish, fork twirling, fresh basil, parmesan cheese, rustic Italian, warm lighting",
                cake: "Decadent layered cake, frosting, slice cut, celebratory dessert, bakery quality",
                cookie: "Fresh baked cookies on plate, chocolate chips, homemade, warm and delicious",
                "ice cream":
                    "Ice cream scoops in bowl or cone, colorful, melting slightly, sweet treat, dessert vibes",
                donut: "Glazed donuts on plate, sprinkles or icing, bakery fresh, sweet breakfast treat",
                brownie: "Fudgy brownie squares, chocolate richness, dessert plate, indulgent treat",
                "lemon bars":
                    "Fresh lemon bars on a plate, powdered sugar dusted, bright yellow filling, dessert presentation",
                boba: "Boba tea with thick straw, colorful drink, tapioca pearls visible, trendy cafe, aesthetic background",
                smoothie:
                    "Smoothie bowl, tropical fruits, granola topping, bright colors, healthy lifestyle aesthetic",
                breakfast: "Healthy breakfast plate, eggs, toast, bacon, morning meal, colorful presentation",
                pancakes:
                    "Stack of fluffy pancakes, syrup drizzle, butter pat, breakfast perfection, morning vibes",
                waffles: "Belgian waffles with toppings, syrup, whipped cream, breakfast indulgence",
                eggs: "Perfectly cooked eggs, breakfast plate, toast, morning meal, protein-rich",
                bacon: "Crispy bacon strips, breakfast side, sizzling, delicious protein",
                toast: "Toasted bread, butter spreading, golden brown, breakfast staple",
                "avocado toast":
                    "Avocado toast, poached egg, artisan bread, microgreens, brunch aesthetic, millennial food culture",
                cereal: "Cereal bowl with milk, spoon, breakfast table, morning meal, nostalgic",
                cocktail: "Fancy cocktail with garnish, colorful drink, ice cubes, bar setting, evening vibes",
                beer: "Cold beer in glass or bottle, foam head, bar setting, relaxation drink, social vibes",
                wine: "Wine glass with red or white wine, elegant presentation, sophisticated drink, evening mood",
                tea: "Hot tea in cup, tea bag or loose leaf, steam rising, cozy drink, calming",
                wings: "Chicken wings plate, buffalo sauce, celery sticks, ranch dip, sports bar vibe",
                fries: "Golden crispy french fries, sea salt, ketchup, casual dining, shareable basket",
                soup: "Steaming bowl of soup, spoon ready, bread on side, comfort food, cozy presentation",
                steak: "Perfectly cooked steak, grill marks, sides visible, upscale dinner, meat lover's dream",
                chicken: "Delicious chicken dish, cooked to perfection, protein main course, satisfying meal",
                seafood: "Fresh seafood platter, ocean-to-table, elegant presentation, coastal cuisine",
                bbq: "BBQ plate with ribs or brisket, smoky char, barbecue sauce, Southern comfort food",
                hotdog: "Hot dog with toppings, classic American, stadium food, casual dining",
                popcorn: "Bowl of popcorn, movie snack, butter or seasoning, entertainment food",
                chips: "Bag or bowl of chips, snack food, crunchy, casual munchies",
                cheese: "Cheese board or charcuterie, variety of cheeses, crackers, grapes, sophisticated snacking",
                "poke bowl": "Colorful poke bowl, fresh fish, rice, vegetables, Hawaiian cuisine, healthy bowl",
                curry: "Aromatic curry dish, rice, Indian spices, warm comfort food, flavorful",
                "dim sum": "Dim sum basket, steamed dumplings, Asian cuisine, variety platter, chopsticks",
                bagel: "Fresh bagel with cream cheese, toasted, breakfast favorite, New York style",
                muffin: "Freshly baked muffins, bakery quality, breakfast pastry, warm and fluffy",
                croissant: "Flaky croissant, buttery pastry, French bakery, coffee companion",
                fruit: "Fresh fruit plate or bowl, colorful, healthy, natural sweetness, vibrant",
                vegetables: "Fresh vegetable plate, healthy eating, colorful produce, nutritious meal",
                snack: "Snack plate with variety, munchies, casual eating, satisfying treats",
            }[c.food] ||
            `Appetizing ${c.food}, restaurant presentation, overhead shot, Instagram-worthy, delicious`),
            "home" === c.location || "kitchen" === c.location
                ? (p += ", homemade, cozy kitchen setting")
                : "office" === c.location
                  ? (p += ", on office desk, work lunch vibes")
                  : "restaurant" === c.location || "cafe" === c.location
                    ? (p += ", restaurant setting, dining out atmosphere")
                    : ("outdoor" !== c.location && "park" !== c.location) ||
                      (p += ", outdoor eating, picnic vibes, al fresco"),
            "morning" === c.timeOfDay
                ? (p += ", morning breakfast vibes, fresh start")
                : "afternoon" === c.timeOfDay
                  ? (p += ", lunch time, midday meal")
                  : "evening" === c.timeOfDay || "night" === c.timeOfDay
                    ? (p += ", dinner setting, evening meal")
                    : "latenight" === c.timeOfDay && (p += ", late night snack, midnight munchies"),
            "happy" === c.mood || "excited" === c.mood
                ? (p += ", joyful eating moment, satisfying")
                : "stressed" === c.mood
                  ? (p += ", comfort food, stress eating, needed this")
                  : "hungover" === c.mood && (p += ", hangover cure, recovery food"),
            "with_friends" === c.socialContext
                ? (p += ", shared meal, group dining, social eating")
                : "alone" === c.socialContext && (p += ", solo meal, treating myself");
    } else if ("selfie" === t) {
        const e = {
                tired: "tired expression, dark circles, exhausted but authentic",
                happy: "genuine big smile, happy eyes, joyful energy",
                confident: "confident expression, direct eye contact, powerful presence",
                flirty: "playful smile, flirtatious gaze, knowing look",
                stressed: "stressed expression, messy hair, overwhelmed but coping",
                relaxed: "relaxed expression, peaceful vibe, calm energy",
                sad: "sad expression, vulnerable moment, emotional",
                angry: "frustrated expression, intense gaze, strong emotion",
                silly: "goofy expression, funny face, playful energy",
                proud: "proud smile, accomplished look, confident stance",
                bored: "bored expression, unamused face, whatever mood",
                hungover: "hungover look, messy hair, regretful expression, sunglasses indoors",
                motivated: "determined expression, focused energy, driven look",
                romantic: "soft romantic expression, dreamy eyes, gentle smile",
                mysterious: "mysterious gaze, enigmatic expression, subtle smile",
                sassy: "sassy expression, attitude, side-eye, confident smirk",
            },
            t = {
                home: "casual home setting, relaxed vibe",
                bedroom: "bedroom setting, soft morning light, authentic moment",
                bathroom: "bathroom mirror selfie, good lighting, casual pose",
                kitchen: "kitchen background, casual home vibe",
                office: "office setting, professional casual, desk visible",
                gym: "gym mirror, athletic wear, post-workout glow",
                car: "car selfie, windshield reflection, driving vibes",
                outdoor: "outdoor setting, natural daylight, fresh air",
                park: "park background, nature setting, green scenery",
                beach: "beach setting, ocean background, vacation vibes",
                cafe: "coffee shop background, cozy atmosphere, casual vibe",
                bar: "bar or club setting, nightlife energy, dim lighting",
                airport: "airport terminal, travel mode, wanderlust energy",
                hotel: "hotel room, travel vibes, away from home",
                mall: "shopping mall background, retail therapy mood",
                elevator: "elevator mirror selfie, going to work vibes",
                parking: "parking lot background, casual outdoor setting",
                rooftop: "rooftop view, city background, elevated perspective",
                balcony: "balcony background, outdoor home space",
            },
            n = {
                workout: "post-workout selfie, gym mirror, athletic wear, accomplishment glow, sweaty",
                yoga: "post-yoga selfie, zen energy, workout mat visible, peaceful",
                work: "desk selfie, workspace visible, laptop in background, professional casual",
                dancing: "mid-dance energy, movement blur, party vibes",
                shopping: "shopping bags visible, retail therapy energy, store background",
                grooming: "fresh after shower, clean look, getting ready vibes",
                selfcare: "spa day vibes, face mask, pampered look, relaxation mode",
                pets: "selfie with pet, cuddles, animal in frame, wholesome",
                celebration: "celebration energy, party mode, festive atmosphere",
            },
            a = {
                morning: "morning light, sunrise glow, fresh day energy",
                afternoon: "midday lighting, bright natural light",
                evening: "golden hour lighting, warm sunset tones",
                night: "evening lighting, night vibes, darker atmosphere",
                latenight: "late night lighting, desk lamp or dim light, tired but awake",
            },
            o = {
                sunny: "bright sunny day, clear skies, natural sunlight",
                rainy: "rainy day vibes, window droplets visible, cozy indoors",
                snowy: "snowy weather, winter vibes, cold weather gear",
                hot: "hot weather, summer vibes, dealing with heat",
            },
            s = {
                casual: "casual comfy outfit, relaxed style",
                formal: "formal dressed up outfit, professional look",
                athletic: "athletic wear, gym clothes, sporty style",
                pajamas: "pajamas or sleepwear, cozy home mode",
                swimwear: "swimsuit or beach wear, vacation mode",
                cozy: "cozy outfit, blanket visible, warm and comfortable",
            },
            r = {
                alone: "solo selfie, personal moment",
                with_friends: "with friends in background, group vibes",
                with_partner: "couple selfie, romantic moment",
                with_coworkers: "with coworkers, team moment",
                with_family: "family in frame, wholesome moment",
            };
        if (
            ((p = `${i} taking a selfie`),
            c.activity && n[c.activity]
                ? (p = `${i} ${n[c.activity]}`)
                : c.location && t[c.location]
                  ? (p += `, ${t[c.location]}`)
                  : (p += ", natural lighting"),
            c.timeOfDay && a[c.timeOfDay] && (p += `, ${a[c.timeOfDay]}`),
            c.weather && o[c.weather] && (p += `, ${o[c.weather]}`),
            c.clothing && s[c.clothing] && (p += `, ${s[c.clothing]}`),
            c.socialContext && r[c.socialContext] && (p += `, ${r[c.socialContext]}`),
            "neutral" !== c.mood && e[c.mood]
                ? (p += `, ${e[c.mood]}`)
                : (p += ", friendly smile, genuine expression"),
            c.lighting)
        ) {
            const e = {
                golden_hour: "golden hour lighting, warm sunset glow",
                natural: "natural lighting, soft daylight",
                dark: "dark moody lighting, dramatic shadows",
                bright: "bright well-lit, clear visibility",
                moody: "moody dramatic lighting, cinematic feel",
                soft: "soft ambient lighting, gentle glow",
            };
            e[c.lighting] && (p += `, ${e[c.lighting]}`);
        }
        if (c.pose) {
            const e = {
                sitting: "sitting pose, seated position",
                standing: "standing pose",
                lying: "lying down, horizontal position",
                leaning: "leaning pose, casual lean",
                looking_back: "looking over shoulder, glance back",
            };
            e[c.pose] && (p += `, ${e[c.pose]}`);
        }
    } else if ("thirst_trap" === t) {
        let e =
            (o.flirty || 50) > 70
                ? `${i} in stylish form-fitting outfit, seductive pose, confident allure`
                : `${i} in fashionable outfit, attractive pose, subtle confidence`;
        "gym" === c.location
            ? (e = `${i} in gym clothes, athletic build, form-fitting activewear, mirror selfie, confident pose`)
            : "office" === c.location
              ? (e = `${i} in fitted business attire, powerful stance, office setting, professional sexy`)
              : "bedroom" === c.location
                ? (e = `${i} in bedroom setting, intimate casual outfit, soft lighting, confident allure`)
                : "bathroom" === c.location
                  ? (e = `${i} bathroom mirror shot, form-fitting outfit, confident expression, modern aesthetic`)
                  : "car" === c.location
                    ? (e = `${i} in car, hand on steering wheel or door, confident cool pose, attractive lighting`)
                    : ("outdoor" !== c.location && "beach" !== c.location) ||
                      (e = `${i} outdoor setting, natural background, attractive casual pose, golden hour vibes`),
            "athletic" === c.clothing
                ? (e = `${i} in athletic wear, fit body showcase, gym aesthetic, sporty confidence`)
                : "formal" === c.clothing
                  ? (e = `${i} in elegant formal outfit, sophisticated sexy, dressed to impress, stylish`)
                  : "swimwear" === c.clothing &&
                    (e = `${i} in swimwear, beach body confidence, summer vibes, attractive pose`);
        (p =
            e +
            ("confident" === c.mood
                ? ", powerful stance, direct gaze, commanding presence"
                : "flirty" === c.mood
                  ? ", playful seductive expression, knowing smile"
                  : "sassy" === c.mood
                    ? ", attitude, side glance, confident smirk"
                    : ", flattering lighting, stylish aesthetic")),
            "evening" === c.timeOfDay || "golden_hour" === c.lighting
                ? (p += ", golden hour lighting, warm sunset tones")
                : "night" === c.timeOfDay && (p += ", evening lighting, sultry night vibes");
    } else if ("explicit" === t) {
        let e = [
            `Suggestive photo of ${i}, intimate lighting, alluring expression, tasteful composition`,
            `${i} in revealing outfit, seductive pose, dim romantic lighting, artistic sensuality`,
            `Sultry portrait of ${i}, provocative pose, sensual atmosphere, artistic`,
            `${i} in silk robe, intimate moment, soft lighting, artistic boudoir style`,
            `Artistic intimate shot of ${i}, dramatic shadows, alluring gaze, sensual mood`,
            `${i} in lace outfit, romantic lighting, seductive expression, classy provocation`,
        ];
        (p =
            "bedroom" === c.location || "home" === c.location
                ? `${i} bedroom setting, intimate outfit, soft lighting, seductive pose, private moment`
                : "bathroom" === c.location
                  ? `${i} bathroom setting, steam or soft lighting, intimate moment, artistic sensuality`
                  : "office" === c.location
                    ? `${i} in after-hours office, loosened professional clothing, suggestive pose, dramatic lighting`
                    : e[Math.floor(Math.random() * e.length)]),
            "flirty" === c.mood
                ? (p += ", extra seductive energy, provocative gaze")
                : "confident" === c.mood && (p += ", bold confident sexuality, powerful allure"),
            "night" === c.timeOfDay || "latenight" === c.timeOfDay
                ? (p += ", night time intimacy, dim ambient lighting")
                : "moody" === c.lighting && (p += ", moody dramatic lighting, artistic shadows");
    } else if ("meme" === t) {
        const e = d.meme;
        p = e[Math.floor(Math.random() * e.length)];
    } else if ("travel" === t)
        if (c.specificDetails && c.specificDetails.length > 0) {
            const e = c.specificDetails[0];
            [
                "tokyo",
                "kyoto",
                "paris",
                "london",
                "rome",
                "barcelona",
                "amsterdam",
                "berlin",
                "dubai",
                "bali",
                "santorini",
                "venice",
                "new york",
                "nyc",
                "manhattan",
                "los angeles",
                "miami",
                "vegas",
                "hawaii",
                "iceland",
                "maldives",
            ].includes(e)
                ? ((p = `Beautiful scenic view of ${e}, iconic travel destination, stunning photography`),
                  c.specificDetails.includes("bamboo")
                      ? (p = `Bamboo forest in ${e}, tall bamboo trees, serene green path, asian travel aesthetic`)
                      : c.specificDetails.includes("cherry blossom")
                        ? (p = `Cherry blossoms in ${e}, pink sakura trees, springtime beauty, japanese aesthetic`)
                        : c.specificDetails.includes("temple")
                          ? (p = `Ancient temple in ${e}, cultural landmark, travel photography, architectural beauty`)
                          : c.specificDetails.includes("beach")
                            ? (p = `Beach paradise in ${e}, turquoise water, tropical vacation, stunning coastal view`)
                            : c.specificDetails.includes("mountains")
                              ? (p = `Mountain view in ${e}, scenic peaks, alpine landscape, adventure travel`)
                              : c.specificDetails.includes("skyline")
                                ? (p = `City skyline of ${e}, urban landscape, metropolitan beauty, travel photography`)
                                : "night" === c.timeOfDay
                                  ? (p += ", nighttime city lights, illuminated beauty")
                                  : "sunny" === c.weather && (p += ", bright sunny day, clear blue skies"))
                : [
                        "bamboo",
                        "cherry blossom",
                        "waterfall",
                        "volcano",
                        "aurora",
                        "northern lights",
                        "castle",
                        "temple",
                        "shrine",
                        "pagoda",
                        "lighthouse",
                        "windmill",
                        "ruins",
                        "pyramids",
                        "taj mahal",
                        "eiffel tower",
                        "colosseum",
                        "mount fuji",
                        "grand canyon",
                    ].includes(e)
                  ? ((p = `Stunning ${e} view, travel destination, breathtaking scenery, wanderlust photography`),
                    "bamboo" === e
                        ? (p =
                              "Bamboo forest, tall green bamboo trees lining path, serene peaceful atmosphere, asian travel aesthetic, natural beauty")
                        : "cherry blossom" === e
                          ? (p =
                                "Cherry blossom trees in full bloom, pink sakura petals, springtime beauty, japanese aesthetic, magical scene")
                          : "waterfall" === e
                            ? (p =
                                  "Majestic waterfall, cascading water, lush greenery, nature paradise, adventure travel")
                            : "aurora" === e || "northern lights" === e
                              ? (p =
                                    "Aurora borealis dancing in night sky, northern lights, colorful sky phenomenon, arctic beauty")
                              : "castle" === e
                                ? (p =
                                      "Ancient castle, medieval architecture, historical landmark, european travel, fairytale aesthetic")
                                : "temple" === e || "shrine" === e
                                  ? (p =
                                        "Sacred temple, ornate architecture, cultural heritage, spiritual destination, travel photography")
                                  : "lighthouse" === e
                                    ? (p =
                                          "Coastal lighthouse, ocean view, maritime charm, seaside travel, scenic beauty")
                                    : "volcano" === e
                                      ? (p =
                                            "Active volcano, dramatic landscape, adventure travel, powerful nature, unique destination")
                                      : "ruins" === e &&
                                        (p =
                                            "Ancient ruins, historical site, archaeological wonder, travel exploration, timeless beauty"))
                  : [
                        "safari",
                        "cruise",
                        "yacht",
                        "snorkeling",
                        "scuba diving",
                        "skiing",
                        "snowboarding",
                        "hot air balloon",
                        "helicopter ride",
                    ].includes(e) &&
                    ("safari" === e
                        ? (p =
                              "Safari adventure, wildlife viewing, african landscape, jeep tour, nature exploration")
                        : "cruise" === e || "yacht" === e
                          ? (p =
                                "Luxury cruise/yacht, ocean view, deck relaxation, maritime travel, vacation vibes")
                          : "snorkeling" === e || "scuba diving" === e
                            ? (p =
                                  "Underwater adventure, tropical reef, marine life, diving/snorkeling, aquatic beauty")
                            : "skiing" === e || "snowboarding" === e
                              ? (p = "Ski resort, snowy slopes, winter sports, mountain adventure, alpine scenery")
                              : "hot air balloon" === e
                                ? (p =
                                      "Hot air balloon ride, aerial view, floating above landscape, sunrise/sunset adventure")
                                : "helicopter ride" === e &&
                                  (p =
                                      "Helicopter tour, aerial photography, bird's eye view, scenic flight, adventure travel"));
        } else if ("workout" === c.activity || "hiking" === c.activity)
            p = `${i} on hiking trail, athletic gear, nature adventure, scenic mountain vista`;
        else if ("swimming" === c.activity) p = `${i} at pool or beach, swimming, tropical water, vacation mode`;
        else if ("beach" === c.location)
            (p =
                "Beautiful beach scene, turquoise water, white sand, palm trees, paradise destination, vacation vibes"),
                "sunny" === c.weather && (p += ", bright sunny day, clear blue skies");
        else if ("mountains" === c.location)
            (p = `${i} at mountain summit, scenic overlook, dramatic peaks, adventure achievement`),
                "snowy" === c.weather && (p += ", snow-covered peaks, winter wonderland");
        else if ("airport" === c.location)
            p = "Airport terminal view, planes visible, departure board, travel excitement, wanderlust";
        else if ("hotel" === c.location)
            p = "Hotel room view, city skyline through window, travel vibes, vacation accommodation";
        else if ("city" === c.location)
            (p = "Stunning city skyline, urban exploration, city lights, travel photography, metropolitan vibes"),
                "night" === c.timeOfDay && (p += ", nighttime city lights, illuminated buildings");
        else if ("forest" === c.location)
            p =
                c.rawCaption && c.rawCaption.toLowerCase().includes("bamboo")
                    ? "Bamboo forest, tall green bamboo trees lining path, serene peaceful atmosphere, asian travel aesthetic, natural beauty"
                    : "Forest trail scene, nature path, trees, outdoor adventure, peaceful wilderness";
        else if ("countryside" === c.location)
            p = "Countryside landscape, rural scenery, fields, peaceful nature, escape from city";
        else if ("snowy" === c.weather)
            p = "Snowy mountain scene, winter sports, ski resort view, alpine scenery, cold weather travel";
        else if ("sunny" === c.weather && "summer" === c.season)
            p = "Tropical beach paradise, bright sunshine, summer vacation, turquoise water, relaxation";
        else if ("fall" === c.season)
            p = "Autumn landscape, fall foliage, colorful leaves, scenic beauty, seasonal travel";
        else if ("spring" === c.season)
            p = "Spring scenery, blooming flowers, fresh greenery, beautiful season, nature awakening";
        else if ("relaxed" === c.mood)
            p = "Peaceful vacation scene, relaxation vibes, tranquil destination, stress-free moment";
        else if ("excited" === c.mood) p = `${i} excited at destination, arms raised, adventure energy, travel joy`;
        else {
            const e = d.travel;
            p = e[Math.floor(Math.random() * e.length)];
        }
    else if ("life_update" === t) {
        if (c.specificDetails && c.specificDetails.length > 0) {
            const e = c.specificDetails[0];
            "dance party" === e || "dancing party" === e
                ? ((p = `${i} at dance party, dancing with friends, party lights, music vibes, energetic celebration, fun social gathering`),
                  "night" === c.timeOfDay && (p += ", nighttime party energy, colorful lights"))
                : "coding session" === e || "coding marathon" === e || "coding" === e
                  ? ((p = `${i} at desk coding, laptop screen glow, programmer aesthetic, focused developer, code on screen visible, tech workspace`),
                    ("night" === c.timeOfDay || e.includes("midnight")) &&
                        (p += ", late night coding, dark room with screen glow, night owl developer energy"))
                  : "hackathon" === e
                    ? (p = `${i} at hackathon event, intense coding, tech competition, developer energy, multiple screens, programming marathon`)
                    : "photoshoot" === e || "photo shoot" === e
                      ? (p = `${i} during photoshoot, camera equipment visible, professional lighting, model pose, photography session`)
                      : "wine tasting" === e || "beer tasting" === e
                        ? (p = `${i} at tasting event, wine/beer glasses, elegant setting, sophisticated social gathering, sampling drinks`)
                        : "brunch" === e
                          ? (p = `${i} at brunch, restaurant table with food and mimosas, social dining, weekend vibes, friends gathering`)
                          : "karaoke" === e
                            ? (p = `${i} singing karaoke, microphone in hand, stage lights, music performance, fun social activity`)
                            : "game night" === e
                              ? (p =
                                    "Game night setup, board games or video games visible, friends gathered, snacks and drinks, fun social evening")
                              : "movie night" === e
                                ? (p = `${i} watching movie, cozy couch setting, popcorn and drinks, screen glow, relaxation entertainment`)
                                : "spa day" === e
                                  ? (p = `${i} at spa, relaxation vibes, face mask or robe, pampering session, self-care luxury, wellness treatment`)
                                  : "road trip" === e
                                    ? (p = `${i} on road trip, car interior view, scenic highway, adventure travel, open road vibes`)
                                    : "camping trip" === e || "glamping" === e
                                      ? (p =
                                            "Camping scene, tent or glamping setup, nature outdoor, campfire visible, wilderness adventure, outdoor lifestyle")
                                      : ("yacht" !== e && "sailing" !== e) ||
                                        (p = `${i} on yacht/sailboat, ocean water, luxury boating, nautical lifestyle, maritime adventure`);
        }
        const e = {
            workout: `${i} in athletic gear, fitness journey, exercise setting, healthy lifestyle`,
            yoga: `${i} on yoga mat, meditation space, zen energy, wellness practice`,
            cooking: `${i} in kitchen, cooking ingredients visible, culinary hobby, proud chef moment`,
            reading: `${i} with book in cozy chair, reading nook, warm lighting, intellectual moment`,
            gaming: "Gaming setup, controller or keyboard, screen glow, colorful RGB lights, gamer lifestyle, focused play",
            art: `${i} with art supplies, creative project, painting or drawing, artistic focus, canvas visible`,
            music: `${i} with instrument, music practice, creative hobby, passionate musician`,
            dancing: `${i} dancing, movement energy, music vibes, expressive moment`,
            shopping: `${i} with shopping bags, retail therapy, new purchases, happy consumer`,
            cleaning: `${i} organizing space, cleaning supplies, tidy home, productive vibes`,
            studying: `${i} with books and laptop, studying hard, focused learning, academic dedication`,
            diy: `${i} with tools, DIY project, building something, hands-on creativity`,
            gardening: `${i} in garden, plants and flowers, dirt hands, outdoor hobby, nature connection`,
            pets: `${i} with pet, cuddles and love, animal companion, wholesome moment`,
            selfcare: `${i} spa day vibes, face mask or pampering, relaxation mode, treating self`,
            celebration: `${i} celebrating, party decorations, achievement moment, festive energy`,
        };
        if (c.activity && e[c.activity]) p = e[c.activity];
        else if ("home" === c.location || "bedroom" === c.location)
            (p = `${i} cozy at home, relaxed setting, personal space, comfortable vibes`),
                "relaxed" === c.mood && (p += ", peaceful calm energy");
        else if ("kitchen" === c.location)
            p = `${i} in kitchen, cooking or baking, domestic scene, home chef energy`;
        else if ("gym" === c.location)
            p = `${i} at gym, workout equipment visible, fitness dedication, health journey`;
        else if ("book" === c.object)
            p = `${i} reading book in cozy chair, home setting, warm lighting, relaxation time`;
        else if ("laptop" === c.object)
            p = "Home office setup, organized desk, laptop, productivity space, work-from-home life";
        else if ("headphones" === c.object)
            p = `${i} with headphones, music listening, relaxed vibes, audio enjoyment`;
        else if ("proud" === c.mood)
            p = `${i} showing off accomplishment, proud moment, achievement display, satisfied expression`;
        else if ("motivated" === c.mood) p = `${i} motivated energy, goal-focused, determined look, hustle mode`;
        else if ("relaxed" === c.mood) p = `${i} in relaxation mode, cozy space, calm energy, self-care moment`;
        else {
            const e = d.life_update;
            p = e[Math.floor(Math.random() * e.length)];
        }
    } else {
        const e = d[t] || d.selfie;
        p = e[Math.floor(Math.random() * e.length)];
    }
    return (
        o.confidence > 70 && ["selfie", "thirst_trap"].includes(t) && (p += ", bold confident expression"),
        o.flirty > 70 && ["thirst_trap", "explicit", "selfie"].includes(t) && (p += ", flirtatious energy"),
        p
    );
}
async function generateAutonomousComments() {
    const e = gameState.socialNetwork.posts.slice(0, 10);
    if (0 === e.length) return;
    const t = gameState.employees.filter((e) => "active" === e.employmentStatus);
    for (const n of t) {
        if (Math.random() > 0.1) continue;
        const t = e.filter((e) => e.authorId !== n.id && !e.comments.some((e) => e.authorId === n.id));
        if (0 === t.length) continue;
        const a = t[Math.floor(Math.random() * t.length)];
        let o = null,
            i = null;
        if (a.comments.length > 0 && Math.random() < 0.35) {
            const e = a.comments.filter((e) => e.authorId !== n.id && !e.isPlayerComment);
            if (e.length > 0) {
                const t = e.map((e) => {
                        const t = n.relationships?.[e.authorId];
                        let a = 1;
                        return (
                            "rival" === t?.type || "enemy" === t?.type
                                ? (a = 4)
                                : "crush" === t?.type || "romantic" === t?.type
                                  ? (a = 3)
                                  : ("friend" !== t?.type && "best_friend" !== t?.type) || (a = 2),
                            { comment: e, weight: a }
                        );
                    }),
                    a = t.reduce((e, t) => e + t.weight, 0);
                let s = Math.random() * a;
                for (const e of t)
                    if (((s -= e.weight), s <= 0)) {
                        i = e.comment;
                        break;
                    }
                i && (o = i.id);
            }
        }
        const s = n.relationships?.[a.authorId],
            r = s?.type || "neutral";
        let l;
        if (((l = i ? await generateNPCToNPCReply(n, a, i) : await generateComment(n, a, r)), !l || !l.trim())) {
            console.log(`[Autonomous] ${n.name}: empty comment text, skipping`);
            continue;
        }
        const c = createComment({
            postId: a.id,
            authorId: n.id,
            authorName: n.name,
            content: l,
            replyToCommentId: o,
        });
        a.comments.push(c),
            i &&
                "function" == typeof addSocialNotification &&
                addSocialNotification({
                    type: "reply",
                    fromId: n.id,
                    fromName: n.name,
                    postId: a.id,
                    commentId: c.id,
                    preview: l.substring(0, 60),
                    targetAuthorId: i.authorId,
                }),
            a.comments.length >= 3 &&
                Math.random() < 0.15 &&
                (console.log(`[Autonomous] 🔥 ${n.name}'s comment sparked viral engagement!`),
                setTimeout(
                    async () => {
                        await triggerAdditionalNPCComments(a);
                    },
                    6e3 + 8e3 * Math.random()
                ));
        if (i && !a._warCooldown) {
            const e = n.relationships?.[i.authorId]?.type;
            if (("rival" === e || "enemy" === e) && Math.random() < 0.6 && !detectCommentWar(a.comments)) {
                const e = gameState.employees.find((e) => e.id === i.authorId);
                e &&
                    "active" === e.employmentStatus &&
                    setTimeout(
                        async () => {
                            try {
                                const t = await generateNPCToNPCReply(e, a, c);
                                if (!t || !t.trim()) return;
                                const n = createComment({
                                    postId: a.id,
                                    authorId: e.id,
                                    authorName: e.name,
                                    content: t,
                                    replyToCommentId: c.id,
                                });
                                a.comments.push(n);
                                const o = document.querySelector(`[data-post-id="${a.id}"]`);
                                o && updateCommentsSection(o, a), requestSmartFeedUpdate(a.id);
                            } catch (e) {
                                console.error("[Autonomous] Counter-reply failed:", e);
                            }
                        },
                        4e3 + 5e3 * Math.random()
                    );
            }
        }
        !a._calledBack &&
            a.comments.length >= 5 &&
            !a.isPlayerPost &&
            (() => {
                const e = gameState.employees.find((e) => e.id === a.authorId);
                e &&
                    "function" == typeof addSocialCallback &&
                    (addSocialCallback(e, `your post "${(a.content || "").substring(0, 60)}" got a lot of attention`, "viral"),
                    (a._calledBack = !0));
            })();
        const d = gameState.employees.find((e) => e.id === a.authorId);
        console.log(
            `[Autonomous] ${n.name} ${i ? "replied to " + i.authorName + " on" : "commented on"} ${a.isPlayerPost ? "player" : d?.name}'s post`
        ),
            d && d.id !== n.id && (await evaluateNPCReactionToPost(n, d, a, l));
        const p = document.querySelector(`[data-post-id="${a.id}"]`),
            m = document.querySelector(`.post-comments[data-post-id="${a.id}"]`);
        p &&
            m &&
            (console.log(`[Autonomous] FORCE updating comments for post ${a.id}`), updateCommentsSection(p, a)),
            requestSmartFeedUpdate(a.id);
    }
    const solidarityPosts = gameState.socialNetwork.posts
        .slice(0, 10)
        .filter((e) => ["complaint", "rant", "life_update"].includes(e.type) && !e.isPlayerPost && e.authorId);
    for (const e of solidarityPosts) {
        const t = gameState.employees.filter((t) => {
            if ("active" !== t.employmentStatus || t.id === e.authorId) return !1;
            if (e.comments.some((e) => e.authorId === t.id)) return !1;
            const n = t.relationships?.[e.authorId]?.type;
            return "friend" === n || "best_friend" === n || "romantic" === n;
        });
        for (const n of t)
            if (Math.random() < 0.25) {
                try {
                    const t = await generateContextAwareComment(n, e, "supportive and warm - have their back");
                    if (!t || !t.trim()) continue;
                    const a = createComment({ postId: e.id, authorId: n.id, authorName: n.name, content: t });
                    e.comments.push(a), requestSmartFeedUpdate(e.id);
                } catch (e) {
                    console.error("[Autonomous] Solidarity comment failed:", e);
                }
                break;
            }
    }
}
async function generateNPCToNPCReply(e, t, n) {
    gameState.employees.find((e) => e.id === n.authorId);
    const a = e.relationships?.[n.authorId],
        o = a?.type || "neutral",
        i = e.personality || {},
        s = {
            rival: [
                "lol okay sure 🙄",
                "that's rich coming from you",
                "disagree but go off",
                "not this again 💀",
                "you always say that though",
                "I-... nevermind 😤",
                "the audacity 😂",
                "sure jan",
                "respectfully, no",
                "girl bye 💅",
            ],
            crush: [
                "omg yes!! 😊",
                "couldn't agree more tbh",
                "this!! ^^ 💕",
                "you always have the best takes",
                "EXACTLY what I was thinking",
                "see this is why you're my favorite 🥰",
                "say it louder!! 👏",
                "so true bestie",
            ],
            friend: [
                "LMAOOO true",
                "big facts 😂",
                "this is so us",
                "I'm dead 💀",
                "okay but fr tho",
                "real talk",
                "bruh WHAT 😭",
                "no lie detected",
                "adding this to my personality",
                "literally me",
            ],
            enemy: [
                "...interesting take",
                "hard pass",
                "didn't ask",
                "this ain't it",
                "and I thought MY takes were bad",
                "delusional tbh",
                "the math ain't mathing 🤭",
            ],
            romantic: [
                "you're so right babe 💕",
                "10/10 agree",
                "this is why I 💗 you",
                "always with the good takes",
                "we're literally the same person lol",
                "screenshotting this 😍",
                "you understand me fr",
            ],
            neutral: [
                "fair point!",
                "hmm interesting",
                "agree to disagree lol",
                "true true",
                "hadn't thought of it that way",
                "pretty much yeah",
                "valid 👍",
                "real",
            ],
        },
        r = s[o] || s.neutral;
    if (Math.random() < 0.75)
        try {
            const t = `You are ${e.name}. You're replying to ${n.authorName}'s comment on social media.\n\nTheir comment: "${n.content}"\nYour relationship: ${o} (${"rival" === o ? "you two butt heads" : "enemy" === o ? "you genuinely dislike them" : "crush" === o ? "you secretly like them" : "romantic" === o ? "you're dating" : "best_friend" === o || "friend" === o ? "you're close" : "regular coworkers"})\nYour personality: confidence ${i.confidence || 50}/100, flirty ${i.flirty || 50}/100, humor ${i.humor || 50}/100\nYour voice (write in this style): ${getSocialVoiceCard(e)}\n\nWrite a SHORT reply (5-15 words). ${"rival" === o ? "Be snarky/sassy." : "enemy" === o ? "Be dismissive or pointed." : "crush" === o ? "Be subtly admiring." : "romantic" === o ? "Be affectionate." : "best_friend" === o || "friend" === o ? "Be playful and warm." : "Be casual and real."}\n\nReply ONLY:`,
                a = (await queuedGenerateText(t, { temperature: 1, max_tokens: 30 }, `NPC Reply - ${e.name}`))
                    .trim()
                    .replace(/^["']|["']$/g, "");
            if (a.length > 3 && a.length < 120) return a;
        } catch (e) {}
    return r[Math.floor(Math.random() * r.length)];
}
async function triggerTeaSpillingComments(e, t) {
    const n = extractMentions(e.content);
    if (0 === n.length) return;
    console.log(`[Social] Tea-spilling post has ${n.length} mentions, triggering targeted comments`);
    const a = n
        .map((e) => gameState.employees.find((t) => t.id === e.employeeId))
        .filter((e) => e && e.id !== t.id);
    for (let n = 0; n < a.length; n++) {
        const o = a[n];
        if (!(Math.random() < 0.7 + 0.2 * Math.random())) continue;
        const i = (n + 1) * (2e3 + 4e3 * Math.random());
        setTimeout(async () => {
            const n = await generateTeaSpillingResponse(o, e, t),
                a = createComment({ postId: e.id, authorId: o.id, authorName: o.name, content: n });
            e.comments.push(a),
                remember(o, `${t.name} called me out in a post about: "${e.content}"`, "event", 2.5),
                remember(t, `${o.name} responded to my tea-spilling post`, "interaction", 1.5);
            const i = o.relationships?.[t.id];
            if (i) {
                const e = Math.random() < 0.3;
                i.strength += e ? -3 : 1;
            }
            "social" === gameState.activeTab && renderSocialFeed();
        }, i);
    }
    const o = gameState.employees.filter(
            (e) => "active" === e.employmentStatus && e.id !== t.id && !a.find((t) => t.id === e.id)
        ),
        i = Math.min(2, Math.floor(0.2 * o.length));
    for (let t = 0; t < i; t++) {
        const n = o[Math.floor(Math.random() * o.length)],
            i = (a.length + t + 1) * (2e3 + 4e3 * Math.random());
        setTimeout(async () => {
            const t = [
                    "👀🍿",
                    "The TEA is hot today",
                    "I'm just here for the comments 🍿",
                    "This is MESSY 💀",
                    "Drama!! 🫖",
                    "Oh wow 😳",
                    "Spicy 🌶️",
                    "Not this on my feed 😂",
                    "The audacity lol",
                    "💀💀💀",
                ],
                a = t[Math.floor(Math.random() * t.length)],
                o = createComment({ postId: e.id, authorId: n.id, authorName: n.name, content: a });
            e.comments.push(o), "social" === gameState.activeTab && renderSocialFeed();
        }, i);
    }
}
async function generateTeaSpillingResponse(e, t, n) {
    e.stats;
    const a = e.personality || {},
        o = e.relationships?.[n.id],
        i = a.confidence < 50,
        s = a.confidence > 70,
        r = "friend" === o?.type || "best_friend" === o?.type,
        l = e.intimacy || 0,
        c = `You are ${e.name}. ${n.name} just called you out in a social media post that says: "${t.content}"\n\nYOUR PERSONALITY: confidence: ${a.confidence}/100, outgoing: ${a.outgoing}/100, flirty: ${a.flirty}/100\nYOUR RELATIONSHIP WITH ${n.name}: ${o?.type || "coworker"}\n\nWrite a SHORT comment response (5-15 words) that reacts to being called out. Options:\n${i ? "- Play it off embarrassed/shy" : ""}\n${s ? "- Own it confidently" : ""}\n${r ? "- Playfully banter back" : ""}\n${l > 40 ? "- Flirt back" : ""}\n- Deny it playfully\n- Make a joke about it\n- Call them out back\n\nExamples:\n- "WHO TOLD YOU 😭"\n- "And what about it? 💅"\n- "Says the one who... 👀"\n- "EXCUSE ME this is slander"\n- "You're one to talk 😏"\n- "Mind your business lol"\n- "Okay but you're not wrong 💀"\n\nWrite ONLY the comment:`;
    try {
        return (
            await queuedGenerateText(
                c,
                { temperature: 1, max_tokens: 40 },
                `Generating tea/gossip response for ${e.name}`
            )
        )
            .trim()
            .replace(/^["']|["']$/g, "");
    } catch (e) {
        return (
            console.error("Tea response generation failed:", e),
            s
                ? ["And what about it? 💅", "You're one to talk 😏", "Mind your business lol"][
                      Math.floor(3 * Math.random())
                  ]
                : i
                  ? ["WHO TOLD YOU 😭", "This is NOT true 💀", "EXCUSE ME"][Math.floor(3 * Math.random())]
                  : ["Okay but you're not wrong", "Says you 👀", "The audacity lol"][Math.floor(3 * Math.random())]
        );
    }
}
async function generateComment(e, t, n) {
    const a = gameState.employees.find((e) => e.id === t.authorId),
        o = e.relationships?.[t.authorId],
        i = e.stats?.affection || 0,
        s = e.stats?.desire || 0,
        r = e.intimacy || 0,
        l = (e.personality, a && !t.isPlayerPost),
        c = o?.strength || 0;
    if (
        t.isPlayerPost ||
        t.explicitLevel >= 2 ||
        "tea_spilling" === t.type ||
        "life_update" === t.type ||
        "achievement" === t.type ||
        "thirst_trap" === t.type ||
        "gossip" === t.type ||
        "complaint" === t.type ||
        "rant" === t.type ||
        t.imageUrl ||
        c > 40 ||
        i > 40 ||
        s > 40 ||
        r > 30 ||
        (l && ("best_friend" === n || "romantic" === n || "rival" === n || "enemy" === n || "crush" === n)) ||
        Math.random() < 0.25
    ) {
        console.log(
            `[Social] ${e.name} using AI comment for ${t.isPlayerPost ? "PLAYER" : a?.name}'s post (type: ${t.type}, explicit: ${t.explicitLevel})`
        );
        try {
            return await generateAIComment(e, t, a, o, n);
        } catch (o) {
            return (
                console.error("AI comment failed, using enhanced templates:", o),
                generateEnhancedTemplateComment(e, t, a, n)
            );
        }
    }
    return (
        console.log(`[Social] ${e.name} using casual comment for ${t.isPlayerPost ? "PLAYER" : a?.name}'s post`),
        generateCasualComment(e, t, n)
    );
}
async function generateAIComment(e, t, n, a, o) {
    const i = e.personality || {},
        s = a?.strength || 0,
        r =
            ((a?.history || [])
                .slice(-3)
                .map((e) => e.description)
                .join("; "),
            t.isPlayerPost),
        l = r ? "the boss" : n?.name || t.authorName || "a former coworker";
    let c = "";
    if (r) {
        const t = (gameState.chatHistory[e.id] || []).slice(-10);
        if (t.length > 0) {
            const dmLines = t
                .filter((e) => e.content && e.content.length > 10)
                .slice(-5)
                .map((t) => `${"player" === t.sender ? "Boss" : e.name}: "${t.content.substring(0, 100)}"`)
                .join("\n");
            dmLines &&
                (c = `\n\nRECENT DM CONVERSATION WITH BOSS:\n${dmLines}\n\nYou can reference things from your DMs if relevant! Examples:\n- "Well you told me you were working late tonight 👀"\n- "That's funny because you said something totally different to me earlier"\n- "Didn't you just say you hated this? 😂"\n- "Interesting... remember what we talked about?"\n- "This contradicts what you told me but ok"`);
        }
    }
    if (!r && n) {
        const t = (gameState.chatHistory[e.id] || [])
            .slice(-20)
            .filter(
                (e) =>
                    e.content &&
                    (e.content.toLowerCase().includes(n.name.toLowerCase()) ||
                        e.content.toLowerCase().includes(n.name.split(" ")[0].toLowerCase()))
            );
        if (t.length > 0) {
            const e = t
                .slice(-3)
                .map((e) => `${"player" === e.sender ? "Boss" : "You"}: "${e.content.substring(0, 100)}"`)
                .join("\n");
            c = `\n\nYOU'VE DISCUSSED ${n.name.toUpperCase()} WITH THE BOSS:\n${e}\n\nYou can call them out based on what you know! Examples:\n- "That's not what I heard 👀"\n- "Interesting... the boss told me something different about you"\n- "Funny timing after what happened"\n- "Everyone's talking about you btw"\n- "The boss was just telling me about this actually"`;
        }
    }
    if (!r && n) {
        let t = "";
        for (const a of gameState.employees) {
            if (a.id === e.id || a.id === n.id) continue;
            const o = (gameState.chatHistory[a.id] || [])
                .filter(
                    (e) =>
                        e.content &&
                        (e.content.toLowerCase().includes(n.name.toLowerCase()) ||
                            e.content.toLowerCase().includes(n.name.split(" ")[0].toLowerCase()))
                )
                .slice(-2);
            if (o.length > 0 && Math.random() < 0.3) {
                t = `\n\nGOSSIP YOU'VE HEARD:\n${a.name} was talking about ${n.name}: "${o[0].content.substring(0, 80)}"\n\nYou heard through the grapevine! Examples:\n- "Is it true what everyone's saying?"\n- "I heard some interesting things about you"\n- "People are talking 👀"\n- "The whole office has been discussing this"`;
                break;
            }
        }
        t && (c += t);
    }
    let d = "";
    d =
        "romantic" === o
            ? `You're romantically involved with ${l}. Your comments should show affection and intimacy.`
            : "crush" === o
              ? `You have a crush on ${l}. You're trying to flirt subtly but also play it cool.`
              : "best_friend" === o
                ? `${l} is your best friend. You can be playful, supportive, or tease them.`
                : "friend" === o
                  ? `You're friends with ${l}. Keep it friendly and supportive.`
                  : "rival" === o
                    ? `You and ${l} are rivals. There's competitive tension. Be subtly shady or backhanded.`
                    : "enemy" === o
                      ? `You don't like ${l}. Your comment can be dismissive, sarcastic, or pointedly critical.`
                      : `You're coworkers with ${l}. This is a PERSONAL social network (like Instagram), not work chat - be casual, real, and fun.`;
    let p = "";
    "tea_spilling" === t.type
        ? (p =
              "This is DRAMA. They're spilling tea about someone. React with appropriate shock, support, or defense of the person being called out.")
        : "thirst_trap" === t.type || t.explicitLevel >= 2
          ? (p =
                "This is suggestive/explicit content. React appropriately based on your relationship and personality. Could be supportive, flirty, shocked, or disapproving.")
          : "life_update" === t.type
            ? (p = "This is an important life update. Show genuine interest or concern.")
            : "achievement" === t.type
              ? (p =
                    "They're celebrating an achievement. React with congratulations (genuine or backhanded based on relationship).")
              : "complaint" === t.type
                ? (p =
                      "They're venting or complaining. Commiserate, offer advice, or dismiss them based on your relationship.")
                : "gossip" === t.type &&
                  (p =
                      "They're being cryptic/mysterious about drama. Either ask for details, play along with the mystery, or act concerned.");
    const m = getConsentPolicy();
    let u = "";
    u =
        "open" === m
            ? '🔞 WORKPLACE CULTURE: This is an open, sex-positive workplace. Explicit content, sexual references, and adult humor are NORMAL and accepted by everyone. DO NOT act shocked, prudish, or suggest keeping things "PG" or "family-friendly" - that\'s NOT how this workplace operates. Be natural, comfortable, and match the energy of explicit content without moralizing.'
            : "professional" === m
              ? "WORKPLACE CULTURE: Maintain professional boundaries. Sexual content should be addressed tactfully with appropriate workplace discretion."
              : "WORKPLACE CULTURE: Relaxed office culture. Adult content is acceptable but address it naturally based on your comfort level and relationship.";
    let g = "";
    if (t.comments && t.comments.length > 0) {
        const e = t.comments
            .slice(-6)
            .filter((e) => e.content && e.content.length > 0)
            .map(
                (e) =>
                    `${"player" === e.authorId ? "Boss" : gameState.employees.find((t) => t.id === e.authorId)?.name || "Someone"}: "${e.content.substring(0, 50)}"`
            );
        e.length > 0 &&
            (g = `\n\nOTHERS ALREADY SAID:\n${e.join("\n")}\n⚠️ DO NOT repeat these jokes/themes! Be DIFFERENT and ORIGINAL.`);
    }
    const h = `${u}\n\n${e.name} sees ${l}'s post: "${t.content.substring(0, 100)}"\nRel: ${o} (${s}/100)\nPersonality: Conf${i.confidence || 50} Out${i.outgoing || 50} Flirt${i.flirty || 50} Pro${i.professional || 50}\nYour voice: ${getSocialVoiceCard(e)}\n${t.explicitLevel >= 2 ? "EXPLICIT POST - respond naturally without moralizing" : ""}${c ? "\nHAS INSIDER INFO FROM DMS" : ""}${g}\n\nComment (5-25 words, reference post specifics, show personality, BE UNIQUE - don't copy others):`;
    let y = (
        await queuedGenerateText(
            h,
            {
                temperature: 0.95,
                top_p: 0.92,
                max_tokens: 40,
                stopSequences: [
                    "\n",
                    "\n\n",
                    ".)",
                    '".',
                    "Rating",
                    "Rationale",
                    "Why",
                    "Because",
                    "{SEEDS",
                    "{BAN",
                    "{BOOST",
                    "---",
                    "(Relationship",
                    "Physical",
                    "Brainstorm",
                    "Good approach",
                    "Bad approach",
                    "Final",
                    "personality traits",
                ],
            },
            `Generating comment for ${e.name} on ${l}'s post`
        )
    ).trim();
    y = y.split("\n")[0].trim();
    const f = [
        "Boss",
        "personality traits:",
        "Brainstorm",
        "Good approach",
        "Bad approach",
        "Final",
        "Word count",
        "matches",
        "References",
        "Playful",
        "Emoji use",
    ];
    for (const e of f) {
        const t = y.indexOf(e);
        if (t > 10) {
            y = y.substring(0, t).trim();
            break;
        }
    }
    if (
        ((y = y.replace(/\{SEEDS:[^}]*\}/gi, "")),
        (y = y.replace(/\{BAN:[^}]*\}/gi, "")),
        (y = y.replace(/\{BOOST:[^}]*\}/gi, "")),
        (y = y.replace(/\{[A-Z_]+:[^}]*\}/g, "")),
        (y = y.replace(/\s*---\s*/g, " ")),
        (y = y.replace(/^["']|["']$/g, "")),
        (y = y.replace(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*'?s?\s*(?:Comment)?:\s*/g, "")),
        (y = y.replace(/^\*\*\([^)]+\)\*\*\s*/g, "")),
        (y = y.replace(/^\*\*[^*]+\*\*:\s*/g, "")),
        (y = y.replace(/\s*\([^)]{15,}\)\s*$/i, "")),
        (y = y.replace(/\s*\(Relationship[^)]*\)\s*$/i, "")),
        (y = y.replace(/\s*\(Word count[^)]*\)\s*$/i, "")),
        (y = y.replace(/\s*\(\d+\s*(?:words?|characters?)[^)]*\)\s*$/i, "")),
        /^(Boss|Personality|Brainstorm|Good|Bad|Final|Physical|The comment)/i.test(y))
    )
        return (
            console.warn(`[Comment] Meta-text detected, using fallback: "${y.substring(0, 50)}"`),
            generateEnhancedTemplateComment(e, t, n, o)
        );
    if (
        ((y = y.replace(/\s*\*\s*$/g, "")),
        (y = y.trim()),
        y.length > 150 && (y = y.substring(0, 147) + "..."),
        t.comments && t.comments.length > 0)
    ) {
        const a = y.toLowerCase(),
            i = a.split(/\s+/).filter((e) => e.length > 3);
        for (const s of t.comments) {
            if (!s.content) continue;
            const r = s.content.toLowerCase(),
                l = r.split(/\s+/).filter((e) => e.length > 3),
                c = i.filter((e) => l.includes(e)),
                d = l.length > 0 ? c.length / Math.max(i.length, l.length) : 0,
                p =
                    i.length >= 3 &&
                    l.length >= 3 &&
                    (a.includes(r.substring(0, 20)) || r.includes(a.substring(0, 20)));
            if (d > 0.6 || p)
                return (
                    console.warn(
                        `[Comment] Too similar to existing comment (${Math.round(100 * d)}% overlap), using fallback`
                    ),
                    generateEnhancedTemplateComment(e, t, n, o)
                );
        }
    }
    const b =
        c &&
        (y.toLowerCase().includes("told me") ||
            y.toLowerCase().includes("said") ||
            y.toLowerCase().includes("dm") ||
            y.toLowerCase().includes("conversation") ||
            y.toLowerCase().includes("earlier") ||
            y.toLowerCase().includes("different") ||
            y.toLowerCase().includes("heard") ||
            y.toLowerCase().includes("everyone knows"));
    if (a && !r) {
        const t = {
            timestamp: gameState.time?.currentTime || Date.now(),
            description: `Commented on their post: "${y}"${b ? " [EXPOSED PRIVATE INFO!]" : ""}`,
            impact: "enemy" === o ? -2 : "rival" === o ? -1 : 1,
            causedDrama: b,
        };
        a.history || (a.history = []),
            a.history.push(t),
            a.history.length > 10 && a.history.shift(),
            (a.strength =
                "enemy" === o || "rival" === o ? Math.max(0, a.strength - 1) : Math.min(100, a.strength + 1)),
            b &&
                "enemy" !== o &&
                ((a.strength = Math.max(0, a.strength - 3)),
                console.log(`[Drama] ${e.name} exposed private info about ${n.name}! Trust -3`));
    }
    return (
        r &&
            b &&
            (e.recentBehavior || (e.recentBehavior = []),
            e.recentBehavior.push({
                type: "revealed_dm_info",
                timestamp: gameState.time?.currentTime || Date.now(),
                comment: y,
            }),
            e.recentBehavior.length > 5 && e.recentBehavior.shift(),
            console.log(`[Drama] ${e.name} publicly referenced private DMs with boss!`)),
        console.log(`[Social${b ? " 🫖" : ""}] ${e.name} → ${l}: "${y}"`),
        y
    );
}
function generateEnhancedTemplateComment(e, t, n, a) {
    const o = e.personality || {},
        i = (o.confidence, o.flirty > 60),
        s =
            (o.outgoing,
            (e) => {
                if (!t.comments || 0 === t.comments.length) return e[Math.floor(Math.random() * e.length)];
                const n = t.comments.map((e) => (e.content || "").toLowerCase()),
                    a = e.filter((e) => {
                        const t = e.toLowerCase();
                        return !n.some((e) => {
                            if (e === t) return !0;
                            const n = t.split(/\s+/).filter((e) => e.length > 2),
                                a = e.split(/\s+/).filter((e) => e.length > 2);
                            return n.filter((e) => a.includes(e)).length >= 0.5 * Math.min(n.length, a.length);
                        });
                    });
                return 0 === a.length
                    ? e[Math.floor(Math.random() * e.length)]
                    : a[Math.floor(Math.random() * a.length)];
            });
    if ("tea_spilling" === t.type) {
        return s([
            "WAIT what?! I need the full story rn 😱",
            "The TEA is piping hot today ☕",
            "This is MESSY and I'm here for it 🍿",
            "SAY IT LOUDER FOR THE PEOPLE IN THE BACK",
            "Not this on my feed 💀",
            "The way I gasped at this",
            "Oop- somebody said it finally",
            "This is the content I signed up for 🫖",
            "DRAG THEM 🔥",
            "Finally someone speaks the truth",
            "The receipts are being pulled 📋",
            "My jaw literally dropped",
        ]);
    }
    if (t.explicitLevel >= 2 || "thirst_trap" === t.type)
        return s(
            "romantic" === a || "crush" === a
                ? [
                      "🥵🥵🥵",
                      "Stop it you're killing me",
                      "How are you even REAL",
                      "Not fair 😭🔥",
                      "This should be illegal",
                      "You're a menace and I'm obsessed",
                      "EXCUSE ME???",
                      "I need a moment 🫠",
                  ]
                : i
                  ? [
                        "Okay WOW 👀",
                        "The AUDACITY 😳",
                        "You really did that huh",
                        "Damn 🔥",
                        "Not me screenshotting this",
                        "Respectfully: 👀👀👀",
                        "This is a lot and I'm here for it",
                        "Felt that in my soul",
                    ]
                  : [
                        "Looking good! 🔥",
                        "Confidence! ✨",
                        "Serving looks!",
                        "Get it! 💯",
                        "Main character energy",
                        "The glow up is REAL",
                        "Okay I see you!",
                        "Literally goals",
                    ]
        );
    if ("complaint" === t.type) {
        return s(
            "enemy" === a || "rival" === a
                ? [
                      "It's really not that deep",
                      "Sure Jan 🙄",
                      "Okay but like... why tho",
                      "Interesting take",
                      "If you say so",
                      "That's certainly... a perspective",
                      "Not everything needs a post",
                      "Anyway moving on",
                  ]
                : [
                      "Ugh I felt that in my SOUL",
                      "No literally why is it like this",
                      "This is so valid honestly",
                      "The way this is my daily struggle",
                      "Someone needed to say it",
                      "Big mood honestly",
                      "Why is this so relatable 😭",
                      "I'm in this post and I don't like it",
                      "The accuracy hurts",
                  ]
        );
    }
    if ("best_friend" === a)
        return s([
            "BESTIE!! This is everything 💕",
            "Why are you like this I love you 😂",
            "The way you always serve content",
            "This is why you're my favorite person",
            "Not you coming for my whole existence",
            "Okay this made my entire day",
            "We need to talk about this ASAP",
            "I SCREAMED when I saw this",
            "Living for this energy bestie",
            "You never miss honestly",
        ]);
    if ("romantic" === a)
        return s([
            "You're stunning I can't 😍",
            "Miss you already ❤️",
            "How did I get this lucky",
            "Beautiful inside and out 💕",
            "Come over? 👀",
            "Still thinking about this hours later",
            "Heart eyes forever 😍",
            "My whole world right here",
            "Obsessed with you always",
        ]);
    if ("crush" === a)
        return s([
            "Wow 😳",
            "This look though 👀",
            "Okay I see you 🔥",
            "Um hello?? 😍",
            "Not me blushing at this",
            "Casual heart attack 🫠",
            "This is unfair honestly",
            "Why do you do this to me",
            "SCREAMING into my pillow rn",
        ]);
    if ("rival" === a)
        return s([
            "Interesting choice",
            "Sure that's one way to do it",
            "Bold of you 🙄",
            "Okay and?",
            "If you say so",
            "Meh I've seen better",
            "That's certainly... something",
            "Choices were made here",
            "The confidence is something I guess",
        ]);
    if ("enemy" === a)
        return s([
            "🙄",
            "Whatever",
            "Seriously?",
            "Okay cool story",
            "Not interested",
            "Pass",
            "Hard pass",
            "Sure Jan",
            "Could not care less",
        ]);
    if ("friend" === a)
        return s([
            "Haha love this energy!",
            "You always have the best posts ✨",
            "This is so YOU I love it",
            "Main character moment!",
            "Living for this vibe",
            "The way you just understood the assignment",
            "This is genuinely so good",
            "Needed this energy today",
            "You get it you really get it",
        ]);
    return s([
        "This hits different",
        "Okay this is actually great",
        "Valid honestly",
        "Needed to see this today",
        "The vibe is immaculate",
        "This energy >>>",
        "No notes this is perfect",
        "Honestly same",
        "Felt this in my soul",
        "Underrated take honestly",
        "The range!",
        "This made me smile ngl",
    ]);
}
function generateCasualComment(e, t, n) {
    const a = (e) => {
        if (!t.comments || 0 === t.comments.length) return e[Math.floor(Math.random() * e.length)];
        const n = new Set(t.comments.map((e) => (e.content || "").toLowerCase())),
            a = e.filter((e) => !n.has(e.toLowerCase())),
            o = a.length > 0 ? a : e;
        return o[Math.floor(Math.random() * o.length)];
    };
    if (t.isPlayerPost) {
        const t = e.stats?.affection || 0,
            n = e.stats?.desire || 0;
        return a(
            (e.intimacy || 0) > 60 || (t > 60 && n > 50)
                ? [
                      "Love this boss! 😍",
                      "You look amazing! 🔥",
                      "Boss energy ✨",
                      "Stunning! 💕",
                      "Okay boss I see you 👀",
                      "This is everything!",
                      "Literally obsessed 🥵",
                      "Main character behavior right here",
                      "The way you just DID that",
                      "Serving per usual 💅",
                  ]
                : t > 40
                  ? [
                        "Nice post boss!",
                        "Love it! 😊",
                        "Great stuff! 👏",
                        "Looking good boss! ✨",
                        "Always setting the standard 💼",
                        "Big boss energy right here",
                        "Love the vibe boss",
                        "W post ngl",
                        "This is why you're the boss 🫡",
                        "Getting it done as always",
                    ]
                  : [
                        "Nice one 👍",
                        "Solid post",
                        "Respect boss ✊",
                        "Cool!",
                        "Not bad!",
                        "Interesting boss",
                        "Noted 📝",
                        "Good stuff",
                    ]
        );
    }
    if ("selfie" === t.type || "thirst_trap" === t.type)
        return a([
            "🔥",
            "Looking good!",
            "Okay I see you 👀",
            "Serving!",
            "Wow 😍",
            "The LOOK",
            "Literally how",
            "Slaying!",
            "Goals honestly",
            "Cute! ✨",
        ]);
    if ("complaint" === t.type || "rant" === t.type)
        return a([
            "Felt that 😩",
            "Mood honestly",
            "Big mood",
            "This is so real",
            "Why is this relatable",
            "Same tbh",
            "No literally 🙃",
            "The way this hit",
            "Valid",
        ]);
    if ("achievement" === t.type || "milestone" === t.type)
        return a([
            "Congrats!! 🎉",
            "Deserved!!",
            "So proud! 🥳",
            "W!",
            "Let's gooo 🙌",
            "Amazing! ✨",
            "Huge W!",
            "You earned this!",
            "About time honestly 💪",
        ]);
    if ("food" === t.type)
        return a([
            "Looks delicious! 🤤",
            "Where is this??",
            "I'm hungry now",
            "Need the recipe!",
            "Making me crave rn 😭",
            "Okay chef 👨‍🍳",
            "Save me some!",
            "This looks unreal",
        ]);
    const o = {
        best_friend: [
            "Yessss! 🔥",
            "Love this!",
            "You always slay",
            "This! 💯",
            "Iconic behavior",
            "SCREAMING",
            "Bestie ate 💅",
            "Literally us",
            "No one does it better",
            "The way I love you 😭",
        ],
        friend: [
            "Haha love it!",
            "So good!",
            "Amazing! ✨",
            "This made my day",
            "Yesss 🙌",
            "The vibe!",
            "Always on point",
            "Get it!",
            "This is great",
            "Love the energy",
            "Vibes 🤙",
            "Nailing it",
        ],
        crush: [
            "😍",
            "Wow 🔥",
            "Um hello",
            "👀💕",
            "Okay then",
            "This is unfair",
            "Stop it 😳",
            "Casually screaming",
            "My heart 🫠",
            "How are you real",
        ],
        romantic: [
            "Beautiful ❤️",
            "Miss you",
            "😘",
            "Love this babe",
            "Gorgeous",
            "My person 💕",
            "Come here rn",
            "Always stunning",
            "Heart is full",
            "Everything 🥰",
        ],
        rival: [
            "Interesting...",
            "Sure",
            "Ok 🙄",
            "Meh",
            "If you say so",
            "Cool I guess",
            "Choices",
            "That happened",
            "Right",
            "Neat",
        ],
        enemy: ["🙄", "Whatever", "Seriously?", "Pass", "😒", "K", "Sure", "No", "Hard pass", "Lol ok"],
        neutral: [
            "Nice!",
            "Cool vibes",
            "This hits",
            "Love the energy",
            "Valid",
            "✨",
            "Okay I see this",
            "Not bad!",
            "This is great tbh",
            "Loved this",
            "Good stuff",
            "Pretty cool ngl",
            "The range",
            "This >>>",
        ],
    };
    return a(o[n] || o.neutral);
}
async function generateFirstEmployeePost(e) {
    if ((e.social || initializeEmployeeSocialData(e), e.social.hasFirstPost)) return;
    e.social.hasFirstPost = !0;
    const t = e.personality || {},
        n = e.social || {},
        a = `outgoing: ${t.outgoing || 50}/100, professional: ${t.professional || 50}/100, confidence: ${t.confidence || 50}/100`,
        o = e.gender
            ? `, a ${e.age || "young"}-year-old ${"male" === e.gender ? "man" : "transMan" === e.gender ? "trans man" : "transWoman" === e.gender ? "trans woman" : (e.gender, "woman")}`
            : "",
        i = getCompanyName(),
        s = `You are ${e.name}${o}, posting on an uncensored social media for the FIRST TIME after just getting hired at ${i}.\n\nYour personality: ${a}\nYour role: ${e.position || "Employee"}\nLocation: ${e.location || "headquarters"}\n\nWrite a SHORT (1-2 sentences) first post announcing you just joined ${i}. Be authentic to your personality. Express excitement about starting. Use 0-2 emojis. IMPORTANT: Mention "${i}" specifically in your post.\n\n${"casual" === n.contentStyle ? "Style: Casual and friendly" : "professional" === n.contentStyle ? "Style: Professional but warm" : "Style: Balanced and personable"}\n\nExamples:\n- High outgoing: "Just joined the team at ${i} and already loving the energy! Can't wait to meet everyone! 🎉✨"\n- High professional: "Excited to start my new role at ${i}. Looking forward to contributing to the team's success. 💼"\n- Balanced: "First day at ${i}! Feeling great about this opportunity. 😊"\n\nPost:`;
    let r;
    try {
        (r = await queuedGenerateText(s, {}, `Generating first social post for new employee ${e.name}`)),
            (r = r.trim());
    } catch (e) {
        console.error("AI generation failed for first post:", e);
        const n = {
            high_outgoing: [
                `Just joined the team at ${i}! So excited to be here! 🎉`,
                `New job at ${i}, new adventures! Let's do this! ✨`,
                `First day at ${i}! Already loving the energy here! 🚀`,
                `Officially part of the ${i} team! Can't wait to meet everyone! 😊`,
            ],
            high_professional: [
                `Excited to join ${i} and contribute to our success. 💼`,
                `Looking forward to starting this new chapter at ${i}. Happy to be here.`,
                `Grateful for this opportunity at ${i}. Ready to make an impact. 🎯`,
                `Pleased to announce I've joined ${i}. Let's build something great.`,
            ],
            balanced: [
                `Just started at ${i} today! Excited for what's ahead. 😊`,
                `New team member at ${i} here! Looking forward to working with everyone. 👋`,
                `Day one at ${i} complete! Great first impression. ✨`,
                `Happy to be part of the ${i} team! Excited to get started. 🎉`,
            ],
        };
        let a = "balanced";
        t.outgoing > 70 ? (a = "high_outgoing") : t.professional > 70 && (a = "high_professional");
        const o = n[a];
        r = o[Math.floor(Math.random() * o.length)];
    }
    let l = null,
        c = null;
    if (t.outgoing > 60 && Math.random() < 0.3) {
        l = `Professional first-day selfie: ${getPhysicalDescriptionForPrompt(e)}, smiling confidently, office setting, welcoming expression, good lighting, business casual attire, friendly and approachable`;
        try {
            c = await queuedGenerateImage(applyImageStyle(l), `First post selfie for new employee ${e.name}`);
        } catch (e) {
            console.error("Image generation failed for first post:", e), (c = null);
        }
    }
    const d = createPost({
        authorId: e.id,
        authorName: e.name,
        type: c ? "selfie" : "text",
        content: r,
        imageUrl: c,
        imageAlt: l || "First day at work",
        imagePrompt: l || null,
        explicitLevel: 0,
        tags: ["first_post", "new_hire"],
        location: e.location || "headquarters",
        isPlayerPost: !1,
    });
    return (
        gameState.socialNetwork.posts.unshift(d),
        "dashboard" === gameState.activeTab && refreshDashboardSections(),
        logCompanyEvent("first_post", { authorId: e.id, authorName: e.name, postType: d.type }),
        "social" === gameState.activeTab && renderSocialFeed(),
        console.log(`✅ ${e.name} made their first post!`),
        d
    );
}
async function generateAutonomousLikes() {
    const e = gameState.socialNetwork.posts.slice(0, 15);
    if (0 === e.length) return;
    const t = gameState.employees.filter((e) => "active" === e.employmentStatus);
    for (const n of t)
        for (const t of e) {
            if (t.authorId === n.id) continue;
            if ((Array.isArray(t.likes) || (t.likes = []), t.likes.includes(n.id))) continue;
            const e = n.relationships?.[t.authorId];
            let a = 0.3;
            switch (e?.type || "neutral") {
                case "best_friend":
                    a = 0.9;
                    break;
                case "friend":
                    a = 0.7;
                    break;
                case "crush":
                    a = 0.85;
                    break;
                case "romantic":
                    a = 0.95;
                    break;
                case "rival":
                    a = 0.1;
                    break;
                case "enemy":
                    a = 0.05;
            }
            if ((t.explicitLevel >= 2 && n.personality?.flirty > 60 && (a += 0.2), Math.random() < a)) {
                t.likes.push(n.id),
                    (t.isPlayerPost || "player" === t.authorId) &&
                        addSocialNotification({
                            type: "like",
                            fromId: n.id,
                            fromName: n.name,
                            postId: t.id,
                            preview: t.content?.substring(0, 60),
                            targetAuthorId: "player",
                        });
                const e = gameState.employees.find((e) => e.id === t.authorId);
                e && e.id !== n.id && (await evaluateNPCReactionToPost(n, e, t, null));
            }
        }
}
async function generateAutonomousDownvotes() {
    const e = gameState.socialNetwork.posts.slice(0, 15);
    if (0 === e.length) return;
    const t = gameState.employees.filter((e) => "active" === e.employmentStatus);
    for (const n of t) {
        const t =
                n.traits?.includes("bitchy") ||
                n.traits?.includes("competitive") ||
                n.traits?.includes("catty") ||
                n.personality?.dominant > 70,
            a = n.traits?.includes("prudish") || n.traits?.includes("conservative") || n.personality?.flirty < 30;
        for (const o of e) {
            if (o.authorId === n.id) continue;
            if (
                (o.upvotes || (o.upvotes = 0),
                o.downvotes || (o.downvotes = 0),
                o.downvoters || (o.downvoters = []),
                o.downvoters.includes(n.id))
            )
                continue;
            const e = gameState.employees.find((e) => e.id === o.authorId);
            if (!e && !o.isPlayerPost) continue;
            let i = 0,
                s = "";
            const r = n.relationships?.[o.authorId],
                l = r?.type || "neutral";
            ("rival" !== l && "enemy" !== l) || ((i = 0.7), (s = "rivalry")),
                e && (r?.affection || 50) < 30 && ((i += 0.3), (s = "dislike")),
                a && o.explicitLevel >= 2 && ((i += 0.5), (s = "prudish")),
                t && (o.likes?.length || 0) > 10 && ((i += 0.4), (s = "jealous")),
                "work" === o.type && n.traits?.includes("lazy") && ((i += 0.3), (s = "lazy")),
                t && Math.random() < 0.15 && ((i += 0.25), (s = "catty")),
                i > 0 &&
                    Math.random() < Math.min(i, 0.85) &&
                    (o.downvotes++,
                    o.downvoters.push(n.id),
                    console.log(
                        `[Drama] 😈 ${n.name} downvoted ${o.isPlayerPost ? "player" : e?.name}'s post (${s}, ${Math.round(100 * i)}% chance)`
                    ),
                    e &&
                        !o.isPlayerPost &&
                        (n.relationships || (n.relationships = {}),
                        n.relationships[e.id] || (n.relationships[e.id] = { affection: 50, type: "neutral" }),
                        (n.relationships[e.id].affection = Math.max(
                            0,
                            (n.relationships[e.id].affection || 50) - 3
                        )),
                        n.relationships[e.id].affection < 25 &&
                            Math.random() < 0.3 &&
                            ((n.relationships[e.id].type = "rival"),
                            console.log(`[Drama] 🔥 ${n.name} and ${e.name} are now RIVALS!`))),
                    t && Math.random() < 0.25 && (await generateSnarkyComment(n, o, s)));
        }
    }
}
async function generateSnarkyComment(e, t, n) {
    if (t.comments.some((t) => t.authorId === e.id)) return;
    t.isPlayerPost || gameState.employees.find((e) => e.id === t.authorId);
    const a = {
            rivalry: [
                "Interesting take...",
                "Sure, if you say so 🙄",
                "Not everyone can be right all the time",
                "Well THAT'S one way to do it",
                "Hmm. Okay then.",
                "Bold choice",
            ],
            jealous: [
                "Some people get all the attention...",
                "Must be nice",
                "Not that impressive tbh",
                "I've seen better",
                "Congratulations I guess 🙄",
            ],
            prudish: [
                "Really? Here? Now?",
                "Some of us have standards...",
                "Not appropriate for work",
                "Yikes",
                "Seriously?",
            ],
            dislike: ["...", "K", "Sure", "If you say so", "Whatever works for you I guess"],
            catty: [
                "Interesting choice 💅",
                "That's... certainly something",
                "Bless your heart",
                "You do you hun",
                "Different strokes I suppose",
            ],
        },
        o = a[n] || a.catty,
        i = o[Math.floor(Math.random() * o.length)],
        s = {
            id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            postId: t.id,
            authorId: e.id,
            authorName: e.name,
            content: i,
            timestamp: Date.now(),
            likes: [],
            isPlayerComment: !1,
        };
    t.comments || (t.comments = []),
        t.comments.push(s),
        console.log(`[Drama] 💬 ${e.name} left snarky comment: "${i}"`);
    const r = gameState.socialNetwork.posts.findIndex((e) => e.id === t.id);
    r >= 0 && (gameState.socialNetwork.posts[r] = t);
}
