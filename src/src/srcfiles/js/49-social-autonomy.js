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
        const e = await generateOrganicPost(a, i, o);
        if (!e) return console.warn(`[Post] Generation failed for ${a.name}, skipping post`), null;
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
            waking_up: "You just woke up. Share that groggy morning mood — sleepy but alive.",
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
            waking_up: "You just woke up. Groggy, half-alive, first thoughts of the day.",
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
function loadPatchNotes() {
    const e = $("patchNotesContent");
    if (!e) return;
    let t = "";
    const n = [
        {
            version: "202605300001",
            date: "May 30, 2026",
            title: "🐛 Bug Fix Patch — Social Feed, Chat Streaming & Comments",
            changes: [
                {
                    category: "📸 Social Feed — Image Regeneration Fix",
                    items: [
                        "<strong>FIXED:</strong> Regenerating a post image now immediately updates the preview card on the main feed — no page refresh required.",
                        "• Root cause: the feed's fingerprint optimization only tracked whether a post <em>had</em> an image, not which URL. The new image URL now factors into the fingerprint so the card re-renders on change.",
                    ],
                },
                {
                    category: "💬 1-on-1 Chat — Streaming Response Polish",
                    items: [
                        "<strong>FIXED:</strong> Streaming response bubbles now match the real NPC message style from the very first character — correct background color, border-radius, left-alignment, and max-width.",
                        "• Previously the streaming bubble used completely different styling (full-width, glowing cyan border), then snapped to the correct look when generation finished, causing a jarring visual jump.",
                        "• The streaming bubble now also includes a timestamp placeholder so there is no layout shift when the final message settles in.",
                    ],
                },
                {
                    category: "💬 Social Feed — Comment Visibility Bugs",
                    items: [
                        "<strong>FIXED:</strong> NPC comments that incremented the count and fired notifications but were invisible/blank in the modal.",
                        "• Root cause: the autonomous NPC-to-NPC comment system pushed comments to the post even when the AI returned empty or null text, resulting in blank comment elements. Empty comment text is now skipped.",
                        "<strong>FIXED:</strong> Reply comments added via live-update while the post modal is open now appear in the correct threaded position (directly under their parent) instead of being appended to the bottom of the comment list.",
                        "• Root cause: the smooth-update path always used <code>appendChild</code> regardless of thread position. Replies now use DOM insertion to slot in after their parent's last sibling reply.",
                    ],
                },
            ],
        },
        {
            version: "202603061600",
            date: "March 6, 2026",
            title: "🔥 THE ENCOUNTER UPDATE — Full Sex Scene System",
            changes: [
                {
                    category: "🔥 Encounter System — Overview",
                    items: [
                        "<strong>BRAND NEW SYSTEM: SEXUAL ENCOUNTERS!</strong> A full interactive sex scene engine with AI narration, AI image generation, NPC preferences, skill progression, and more.",
                        '• Encounters can be initiated through NPC chat — look for the <strong>"Go to Encounter"</strong> button when flirting leads somewhere',
                        "• Full-screen encounter modal with real-time AI-generated images, narration text, excitement meters, and an interactive action panel",
                        "• <strong>100+ sexual acts</strong> across 13 categories — oral, vaginal, anal, manual, breast, feet, power, bondage, toys, verbal, emotional, scene control, and orgasm",
                        "• Every act has unique narration with multiple variants for Liked, Neutral, Disliked, and climax reactions",
                    ],
                },
                {
                    category: "🎮 Turn-Based Interactive Gameplay",
                    items: [
                        "• <strong>You and the NPC take turns</strong> choosing actions — watch their excitement bar climb",
                        "• <strong>8 positions:</strong> Standing, Missionary, Doggy Style, Cowgirl, 69, Kneeling, Bent Over, Seated — each with unique available act categories",
                        "• <strong>3 intensity stages:</strong> Teasing → Heated → Intense — acts unlock progressively within each category (e.g., Tease → Suck → Deepthroat)",
                        "• <strong>Clothing system:</strong> Undress yourself or your partner (top/bottom separately) — body parts are blocked until clothing is removed",
                        "• <strong>Togglable acts:</strong> Some acts (grinding, oral, penetration) can be left running simultaneously — mix and match for combos",
                        "• <strong>Body part conflict resolution:</strong> The system automatically handles exclusive body parts — no impossible act combos",
                    ],
                },
                {
                    category: "📊 Excitement, Libido & Orgasm",
                    items: [
                        "• <strong>Dual excitement meters (0-100%):</strong> Separate bars for you and the NPC, with glow effects at high arousal",
                        "• <strong>Libido system:</strong> Affects excitement gain — low libido dampens pleasure, high libido amplifies it",
                        "• <strong>Orgasm mechanics:</strong> NPC can climax at 85%+ excitement, player at 95%+ — both require libido ≥30",
                        "• <strong>Male player orgasm options (5):</strong> Cum In Ass, Cum Inside, Cum On Face, Cum On Body, Cum In Mouth",
                        "• <strong>Female player orgasm options (4):</strong> Cum While Riding, Cum On Their Tongue, Cum On Their Fingers, Squirt",
                        "• <strong>Full gender support:</strong> Male, Female, Non-Binary, Trans, and Futa players all get anatomically appropriate act filtering",
                    ],
                },
                {
                    category: "🧠 NPC Preference System (6-Layer AI)",
                    items: [
                        "• <strong>NPCs have real sexual preferences</strong> built from 6 layers of personality data:",
                        "  - Layer 1: NPC kinks (32 kink types mapped to preference tags)",
                        "  - Layer 2: Personality stat bonuses (flirty NPCs like teasing, confident ones like dominance)",
                        "  - Layer 3: Personality trait bonuses (submissive NPCs prefer sub acts, romantic ones prefer emotional)",
                        "  - Layer 4: Appearance-based (e.g., large-breasted NPCs enjoy breast play)",
                        "  - Layer 5: Explicit dislikes (shy NPCs hate roughplay, dominant NPCs refuse submission)",
                        "  - Layer 6: Preference drift from past encounters (see below)",
                        "• Each act gets a <strong>Liked / Neutral / Disliked</strong> tier based on tag matching — affecting excitement gain, narration tone, and NPC reactions",
                    ],
                },
                {
                    category: "🔒 Disinhibition & Progression Gates",
                    items: [
                        "• <strong>4-Base Progression System:</strong> You can't skip straight to anal — NPCs need to be warmed up first",
                        "  - Base 0 (Always): Verbal, Emotional, Undress, Scene Control",
                        "  - Base 1 (After foreplay): Manual, Breast, Feet",
                        "  - Base 2 (After trust builds): Oral, Bondage, Toys",
                        "  - Base 3 (Full intimacy): Penetration, Anal",
                        "• <strong>Disinhibition score (0-100)</strong> per act calculated from NPC confidence, desire, comfort, trust, relationship depth, and kink relevance",
                        '• <strong>Locked acts show 🔒 icons</strong> — hover for reason ("Way too early for this" or "[Name] isn\'t ready yet")',
                        "• Acts unlock naturally as your relationship deepens across multiple encounters",
                    ],
                },
                {
                    category: "💭 NPC Desires & Satisfaction",
                    items: [
                        "• <strong>Dynamic desire system:</strong> NPCs periodically want something specific — oral, penetration, roughness, gentleness, a position change, etc.",
                        '• <strong>Desire hint UI:</strong> Emoji + text shows what they\'re craving (e.g., 💭 "wants oral")',
                        "• <strong>Satisfaction bar (0-100%):</strong> Fulfilling desires raises it (green), ignoring them drops it (red)",
                        "• <strong>Matching desires = 1.15× excitement multiplier</strong> and +5 to NPC AI scoring",
                        "• <strong>Ignoring desires 3+ rounds = 0.7× penalty</strong> — pay attention to what your partner wants!",
                    ],
                },
                {
                    category: "🤖 NPC AI Decision Making",
                    items: [
                        "• <strong>NPCs choose their own actions intelligently</strong> based on preference tags, inclinations, variety desire, excitement level, and libido",
                        "• <strong>Reactionary logic:</strong> If you're dominant, they lean submissive (and vice versa)",
                        "• <strong>Category synergy:</strong> NPCs tend to match the vibe of your last action",
                        "• <strong>Desire awareness:</strong> NPC actions account for what they currently want",
                        "• <strong>Variety seeking:</strong> NPCs avoid repeating the same 5 acts in a row",
                    ],
                },
                {
                    category: "📈 Skills, Quality & Progression",
                    items: [
                        "• <strong>11 sexual skill types:</strong> Oral, Penetration, Manual, Breast, Feet, Power, Verbal, Intimacy, Bondage, Toys, Edging",
                        '• <strong>10 skill levels</strong> per type — shown as "Lv1" through "Lv10" badges on action buttons',
                        "• <strong>Performance quality rolls:</strong> 😬 Poor (0.4×), 🎯 Decent (0.85×), ✨ Good (1.15×), 🌟 Excellent (1.5×) — higher skill = better odds",
                        "• <strong>XP gain per act</strong> scales with stage level and NPC reaction tier",
                    ],
                },
                {
                    category: "📸 AI Image Generation",
                    items: [
                        "• <strong>Real-time AI images</strong> generated every ~10 seconds during the encounter",
                        "• <strong>Position-aware prompts:</strong> Each of the 8 positions has a specific body-arrangement description for accurate images",
                        '• <strong>Distinct character rendering:</strong> Player and NPC are described as "PERSON 1" and "PERSON 2" with contrasting physical features to prevent "clone" images',
                        "• <strong>Dynamic prompts:</strong> Images reflect current clothing state, active acts, intensity level, and NPC expression (ecstatic, aroused, curious, etc.)",
                        "• <strong>Photo gallery:</strong> Generated encounter images are saved to the NPC's photo collection",
                    ],
                },
                {
                    category: "📝 Memory, Drift & Post-Encounter",
                    items: [
                        "• <strong>Per-NPC sex history:</strong> Every encounter is remembered — act types used, categories explored, encounter count, and dates",
                        "• <strong>Preference drift:</strong> NPCs' tastes <em>change</em> based on experience:",
                        "  - Liked acts: +0.3 shift toward enjoying them more",
                        "  - Disliked acts used once: -0.1 resistance. Used repeatedly: +0.15 habituation (they warm up to it!)",
                        "  - Neutral acts: +0.1 familiarization bonus",
                        "• <strong>Post-encounter summary:</strong> Modal showing star rating (⭐-⭐⭐⭐⭐⭐), rounds played, unique acts, orgasm tally, dominant categories, and preference shifts",
                        "• <strong>Chat integration:</strong> Summary posted to NPC chat history — stats, satisfaction narrative, comfort progression, and the encounter's final image",
                        "• <strong>Stat gains:</strong> Encounters affect Desire, Comfort, Affection, and Trust based on performance, satisfaction, and variety",
                    ],
                },
            ],
        },
        {
            version: "202603041800",
            date: "March 4, 2026",
            title: "🔧 BUG FIXES — Post Images, Stories & Mobile",
            changes: [
                {
                    category: "📸 Social Post Image Fix (Post-Prestige)",
                    items: [
                        '• <strong>FIXED:</strong> "Request social post" from NPC profiles now correctly generates images after prestige',
                        "  - Completely rewrote the post request pipeline to use the same <code>createPost()</code> factory as autonomous posts",
                        "  - Removed broken <code>typeof generateImage</code> guard that was preventing image generation",
                        "  - Image generation now uses the same <code>queuedGenerateImage(applyImageStyle(...))</code> path as all other working systems",
                        "  - Posts now include all required fields: <code>authorName</code>, <code>type</code>, <code>explicitLevel</code>, <code>upvotes</code>, <code>downvotes</code>, <code>tags</code>, etc.",
                        "  - Added robust error handling with fallback text if AI text/image generation fails",
                        "  - Posts show notification progress while image is generating",
                    ],
                },
                {
                    category: "👤 Ghost Post Fix",
                    items: [
                        "• <strong>FIXED:</strong> Posts no longer appear with missing/undefined author names after prestige",
                        "  - Root cause: legacy <code>generateNPCPost()</code> created posts without <code>authorName</code> field",
                        "  - Now properly sets <code>authorName: emp.name</code> via <code>createPost()</code>",
                        "• <strong>FIXED:</strong> Prestige now properly resets The Algorithm™ sort state",
                        "  - Added missing <code>algorithm</code> property to prestige social network reset",
                        "  - Feed sorting buttons work correctly immediately after prestige",
                    ],
                },
                {
                    category: "📸 Story Images",
                    items: [
                        "• <strong>NEW:</strong> NPC Stories now generate AI images instead of just showing emoji + gradient",
                        "  - Image generation happens asynchronously in the background — stories appear instantly with gradient, then upgrade to AI images",
                        "  - Image probability varies by story category: nsfw stories always generate, mood/activity ~35-40%, work/morning ~20-25%",
                        "  - High-relationship NPCs (intimacy > 40, desire > 50) have increased image generation chance",
                        "  - Image prompts are contextual: nsfw stories get intimate/suggestive selfies, work stories get office photos, activity stories match the activity",
                        "  - Stories without AI images now show NPC profile photo as blurred background (instead of plain gradient)",
                        "  - Story viewer live-updates when image finishes generating while you're watching",
                        "  - Text repositions to bottom overlay when image is present (Instagram-style)",
                    ],
                },
                {
                    category: "📱 Mobile Comment Input Fix",
                    items: [
                        "• <strong>FIXED:</strong> Comment reply input on mobile is now properly sized for touch",
                        "  - Increased textarea min-height from 44px to 52px on mobile",
                        '  - Reply indicator ("Replying to X") now has larger padding and font size on mobile',
                        "  - Cancel reply button (✕) has larger touch target (32x32px minimum)",
                        "  - All comment input elements respect 16px font-size to prevent iOS zoom",
                    ],
                },
            ],
        },
        {
            version: "202603032100",
            date: "March 3, 2026",
            title: "📱 SOCIAL FEED 2.0 — STORIES, THREADS, POLLS & MORE",
            changes: [
                {
                    category: "📸 NPC Stories",
                    items: [
                        "• <strong>Instagram-Style Stories:</strong> NPCs now post ephemeral stories that expire after 1 hour",
                        "  - Stories appear in a scrollable bar at the top of the Social Feed",
                        "  - 8 categories: morning, work, mood, activity, nsfw, reaction, ama — with 60+ templates",
                        "  - Full-screen story viewer with progress bar, emoji reactions, and direct chat button",
                        "  - NPC personality and activity influence what stories they post",
                        "  - Gradient backgrounds, auto-close timer, and smooth animations",
                        "  - High-relationship NPCs get notification when they post stories",
                    ],
                },
                {
                    category: "💬 Comment Threading & Reply Chains",
                    items: [
                        "• <strong>Threaded Comment Replies:</strong> Comments now support full reply chains with visual threading",
                        '  - Click reply on any comment to reply directly — shows "Replying to [name]" with cancel button',
                        "  - Threaded replies display indented with a border line and reply label",
                        "• <strong>NPC-to-NPC Reply Drama:</strong> 35% of autonomous comments are now threaded replies to other NPCs",
                        "  - Relationship-weighted targeting: rivals reply 4x more, crushes 3x, friends 2x",
                        "  - 100+ unique reply templates per relationship type (snarky, admiring, banter, hostile, affectionate)",
                        "  - 40% chance for AI-generated replies for rivals/crushes/romantic interests",
                        '• <strong>🍿 Comment Wars:</strong> When 2 NPCs exchange 3+ replies back and forth, a "Comment War!" banner appears',
                    ],
                },
                {
                    category: "🔔 Social Notifications",
                    items: [
                        "• <strong>Real Notification System:</strong> Bell icon in the feed header with unread badge count",
                        "  - Get notified when NPCs like your posts, comment, reply to comments, or mention you",
                        "  - Notifications for viral posts, comment wars, and NPC stories",
                        "  - Click any notification to jump directly to the relevant post",
                        '  - Notification panel with rich format, avatars, timestamps, and "Clear all" button',
                        "  - Dashboard social section now shows rich notifications instead of basic mentions",
                    ],
                },
                {
                    category: "✨ For You Algorithm",
                    items: [
                        '• <strong>"For You" Personalized Feed:</strong> New algorithm sort mode in the sidebar',
                        "  - Scores posts based on your relationship with each NPC (affection, trust, desire, intimacy)",
                        "  - Boosts posts from NPCs you've chatted with recently",
                        "  - Considers engagement signals, post type preference, and adds slight randomization for freshness",
                        "  - Recency decay prevents old posts from dominating",
                    ],
                },
                {
                    category: "📊 Poll Posts",
                    items: [
                        "• <strong>Interactive Polls:</strong> NPCs now create poll posts that you can vote on",
                        "  - 10+ poll templates covering office life, preferences, personality questions",
                        "  - Flirty NPCs get additional romantic/dating poll templates",
                        "  - Click an option to vote — results show animated bar graph with percentages",
                        "  - NPCs autonomously vote on polls based on their personality",
                        "  - 10% of NPC posts are now polls — appear in both feed cards and post modal",
                    ],
                },
                {
                    category: "📱 Mobile Responsive Overhaul",
                    items: [
                        "• <strong>Slide-In Sidebar:</strong> Social feed sidebar becomes a slide-in overlay on mobile with backdrop",
                        "  - ☰ filter toggle button in the feed header",
                        "  - Smooth slide animation, tap backdrop to dismiss",
                        "• <strong>Mobile-Optimized Layout:</strong> Full-width feed, compact header, tighter padding",
                        "  - Floating ✏️ action button for quick post creation",
                        "  - Full-width notification panel on mobile",
                        "  - Responsive story viewer (full-screen on mobile, windowed on desktop)",
                        "  - Post modals sized appropriately for mobile screens",
                    ],
                },
            ],
        },
        {
            version: "202603022245",
            date: "March 2, 2026",
            title: "🩹 PROACTIVE DM & IMAGE REQUEST FIXES",
            changes: [
                {
                    category: "💬 Proactive DM Quality Fix",
                    items: [
                        '• <strong>No More "B" Messages:</strong> NPCs will no longer send single-letter garbage like "B" or "Hey" as unprompted DMs',
                        "  - Added minimum quality/length checks on all proactive messages",
                        "  - Messages under 5 characters or matching common filler words are now rejected",
                        "  - Rejected messages are replaced with contextual fallbacks based on the reason the NPC messaged (work update, casual chat, flirty, etc.)",
                        "• <strong>Better DM Generation:</strong> Increased token budget for proactive message generation for more coherent outputs",
                    ],
                },
                {
                    category: "📸 Image Request After Prestige",
                    items: [
                        "• <strong>Stale Reference Fix:</strong> Image requests no longer silently fail for rehired employees after prestige",
                        "  - After prestige + rehire, employees get new internal IDs — the image request system now resolves stale references by name",
                        "• <strong>No More Silent Failures:</strong> If an image request fails for any reason, you now get a visible error message in chat instead of nothing happening",
                        "  - Added try/catch wrappers around the entire image request evaluation and generation pipeline",
                        "  - Both the willingness check and image generation steps now show feedback on failure",
                    ],
                },
                {
                    category: "📱 Social Feed Fix",
                    items: [
                        '• <strong>No More Auto Player Posts:</strong> The "Generate Test Post" button no longer randomly creates posts as if the player wrote them',
                        "  - Previously had a 30% chance of generating a player-authored post — now always generates an NPC post",
                    ],
                },
            ],
        },
        {
            version: "202603012000",
            date: "March 1, 2026",
            title: "🔧 MASSIVE BUG FIX PATCH",
            changes: [
                {
                    category: "🚨 Critical Fixes",
                    items: [
                        "• <strong>Clear Posts Cheat:</strong> Now properly resets everything — no more ghost posts or broken feeds after clearing",
                        "• <strong>Social Feed Crash:</strong> Fixed a crash when viewing likes/comments on posts made before prestige",
                        "• <strong>Prestige Rehire:</strong> Rehired employees now actually run their products again instead of sitting idle",
                        "• <strong>Story Softlock:</strong> Story conclusion screens now have a close button and click-outside-to-dismiss — no more getting stuck",
                        "• <strong>Flag System Crash:</strong> Opening flags for a deleted employee no longer crashes the game",
                        "• <strong>Flags Deletion:</strong> You can actually delete flags now without errors",
                        "• <strong>Custom World Info:</strong> Your custom world/company/AI context now properly saves and loads on export/import",
                        "• <strong>Prestige Social Images:</strong> Post images no longer break after prestiging",
                    ],
                },
                {
                    category: "🏢 Employee & Slot Fixes",
                    items: [
                        "• <strong>Ghost Employees:</strong> Fired/terminated employees no longer block product slots or pyramid positions",
                        '  - Firing now properly cleans ALL product assignments, not just the one they were "supposed" to manage',
                        "  - Old saves with stuck slots are auto-repaired on load",
                        "• <strong>Nicknames Work Again:</strong> Employee nicknames now actually show up in social posts and AI context",
                        "• <strong>Schedule Editing:</strong> Work day checkboxes in employee profiles actually save now",
                    ],
                },
                {
                    category: "⏱️ Time & Speed",
                    items: [
                        "• <strong>Speed Badge Always Visible:</strong> You can now always see your current game speed, even during conversations",
                        "  - Shows when time dilation is overriding your set speed",
                        "• <strong>Skip Time Buttons:</strong> Added +1 Hour, +3 Hours, and +8 Hours buttons to cheats panel",
                        "• <strong>No Story While Paused:</strong> Random events and story beats no longer fire while the game is paused",
                    ],
                },
                {
                    category: "🎮 Gameplay Tweaks",
                    items: [
                        "• <strong>Anti-Autoclicker:</strong> Thunder minigame and boss fight mashing now have a 50ms cooldown — no more infinite-speed exploits",
                        "• <strong>Buttons React Instantly:</strong> Hire, upgrade, and unlock buttons now enable/disable the moment you can afford them instead of up to a second later",
                        "• <strong>Patch Notes Button:</strong> The quick patch notes button on the dashboard actually loads the content now",
                        '• <strong>[object Object] Fix:</strong> Recruited bosses no longer show "[object Object]" for their personality in posts and prompts',
                    ],
                },
                {
                    category: "📱 Social Feed & Chat",
                    items: [
                        "• <strong>Smarter Comments:</strong> NPC comments are way more varied now — more templates, post-type awareness, and more interactions use real AI instead of canned replies",
                        '• <strong>Image Request Messages:</strong> Asking NPCs for pics no longer always says "Could you send..." — messages are now natural and varied',
                        "• <strong>Mobile HUD:</strong> Top bar is more compact on phones, tab bar scrollbar hidden, and tiny screens now hide less-important stats to save space",
                    ],
                },
            ],
        },
        {
            version: "202601201700",
            date: "January 20, 2026",
            title: "🐛 BUG FIXES & STABILITY",
            changes: [
                {
                    category: "📱 Mobile UI Fixes",
                    items: [
                        "• <strong>Boss Portrait Fix:</strong> Boss fight portrait no longer cuts off on mobile devices",
                        "• <strong>Special Button Position:</strong> Special attack button now properly aligned in boss fight UI",
                        "• <strong>Search Bar Fix:</strong> Groups search bar no longer disappears when tapped on small screens",
                        "• <strong>Chat Button Swap:</strong> Close (✕) and Clear buttons swapped in chat header for better mobile UX",
                    ],
                },
                {
                    category: "💥 Crash Fixes",
                    items: [
                        "• <strong>Groups Crash Fixed:</strong> Fixed TypeError crash when viewing groups with messages from unknown senders",
                        "• <strong>NaN Cash Bug Fixed:</strong> Fixed $NaN display after unlocking locations and hiring bosses",
                        "  - Root cause: Manager stats (productivity/trust/obedience) were being accessed incorrectly",
                    ],
                },
                {
                    category: "⚙️ System Fixes",
                    items: [
                        "• <strong>Boss Bounty Rehire:</strong> Bosses are now added to the rehire pool when claiming bounty reward",
                        "  - Previously, choosing bounty meant losing the boss forever",
                        "• <strong>Prestige Employee Reassign:</strong> Fixed inability to reassign employees after prestige reset",
                        "  - Corporate pyramid structure now properly initialized on prestige",
                        "• <strong>Boss Gender Display:</strong> Fixed recruited bosses displaying wrong gender in chat",
                        "  - Gender now properly tracked through boss generation and recruitment",
                    ],
                },
            ],
        },
        {
            version: "202601171430",
            date: "January 17, 2026",
            title: "⚔️ BOSS FIGHT SYSTEM OVERHAUL",
            changes: [
                {
                    category: "🎮 QTE Combat System Rework",
                    items: [
                        "<strong>COMPLETELY REDESIGNED BOSS FIGHTS:</strong> Skill-based combat!",
                        "• <strong>4 Combat Actions:</strong> Attack (Q), Block (W), Parry (E), Dodge (R)",
                        "• <strong>Reaction-Based Combat:</strong> Watch for attack indicators and respond correctly",
                        "• <strong>Special Meter:</strong> Build charge through successful parries, unleash devastating specials (SPACE)",
                        "• <strong>Mash-to-Escape:</strong> Grab attacks require rapid button mashing to break free",
                        "",
                        "<strong>ATTACK INDICATOR SYSTEM:</strong>",
                        "• 🟡 Yellow Flash = Quick Attack → Parry or Block",
                        "• 🔴 Red Flash = Heavy Attack → Block or Dodge",
                        "• 🟣 Purple Flash = Grab Attack → Mash to Escape",
                        "• Clear telegraph text tells you exactly what to do",
                        "• Pulsing borders and screen effects for maximum visibility",
                    ],
                },
                {
                    category: "🎲 Procedurally Generated Bosses",
                    items: [
                        "<strong>EVERY BOSS IS UNIQUE:</strong> No two playthroughs are the same!",
                        "• Dynamic character generation: names, ages, appearances, personalities",
                        "• AI-enhanced dialogue when available (falls back to procedural)",
                        "• Unique attack patterns based on boss archetype",
                        "• Boss images generated and cached automatically",
                        "",
                        "<strong>BOSS ARCHETYPES:</strong>",
                        "• Corporate Demanding (Home Office)",
                        "• Corporate Queen (Office Suite)",
                        "• Retail Empress (Factory)",
                        "• Mad Scientist (R&D Lab)",
                        "• Seductress (Creative Studio)",
                        "• Fashion Mogul (Private Club)",
                        "• Underground Queen (Velvet Room)",
                        "• Final Boss (Inner Sanctum)",
                    ],
                },
                {
                    category: "🏆 Victory Rewards & Recruitment",
                    items: [
                        "<strong>DEFEAT BOSSES, GAIN REWARDS:</strong>",
                        "• <strong>Recruit Option:</strong> Hire the defeated boss as an employee!",
                        "  - Unique passive bonuses (income, efficiency, sales, etc.)",
                        "  - Special active abilities on cooldown",
                        "  - Full employee profile with backstory",
                        "• <strong>Bounty Option:</strong> Claim cash reward instead",
                        "  - Reward scales with prestige level",
                        "  - Higher difficulty = bigger payouts",
                        "",
                        "<strong>LOCATION UNLOCK:</strong> Defeating a boss unlocks their location!",
                    ],
                },
                {
                    category: "📱 Mobile-Optimized UI",
                    items: [
                        "<strong>BOSS FIGHTS WORK GREAT ON MOBILE:</strong>",
                        "• Compact, centered modal design (340px max)",
                        "• Touch-friendly combat buttons",
                        "• Responsive layout for all screen sizes",
                        "• Portrait boss image with 4:3 aspect ratio",
                        "• Timer bar and health bars scale properly",
                        "",
                        "<strong>VICTORY/DEFEAT MODALS:</strong> Clean, readable on any device",
                    ],
                },
                {
                    category: "⚖️ Difficulty & Accessibility",
                    items: [
                        "<strong>GENEROUS REACTION WINDOWS:</strong>",
                        "• Quick Attacks: 1.2-1.6 seconds to respond",
                        "• Heavy Attacks: 2.0-2.5 seconds to respond",
                        "• Grab Attacks: 1.8-2.2 seconds, reduced mash requirement",
                        "",
                        "<strong>VISUAL FEEDBACK:</strong>",
                        "• Screen flashes in attack color",
                        "• Pulsing animated borders",
                        "• Large centered icons with glow effects",
                        "• Timer bar turns red when low (urgency effect)",
                        "• Green/red flash for correct/wrong responses",
                    ],
                },
                {
                    category: "👤 Alumni System (People Tab)",
                    items: [
                        '<strong>NEW "SHOW ALUMNI" TOGGLE:</strong> See former employees!',
                        "• View terminated, resigned, or prestige-reset employees",
                        "• Alumni cards show status badge (why they left)",
                        "• Departure date displayed when available",
                        "• Cards slightly grayed to distinguish from active",
                        "• Favorites work across both active and alumni lists",
                    ],
                },
            ],
        },
        {
            version: "202601162100",
            date: "January 16, 2026",
            title: "💰 PAYROLL, EVENTS & SMARTER NPCs",
            changes: [
                {
                    category: "💰 Payroll System & Meaningful Salaries",
                    items: [
                        "<strong>NEW PAYROLL TAB:</strong> Complete financial management system!",
                        "• <strong>Weekly Payroll:</strong> See total company salary expenses at a glance",
                        "• <strong>Next Payday Countdown:</strong> Track when salaries are due",
                        "• <strong>Employee Salary List:</strong> View and manage individual salaries",
                        "• <strong>Salary Adjustments:</strong> Give raises or cut pay with immediate effect",
                        "",
                        "<strong>MEANINGFUL SALARIES:</strong> NPCs now have realistic, role-based pay",
                        "• Staff: $800-$1,500/week based on performance & skills",
                        "• Managers: $1,500-$3,000/week with leadership bonuses",
                        "• Division Heads: $3,000-$6,000/week reflecting seniority",
                        "• Automatic raises based on tenure, performance reviews, and skill growth",
                    ],
                },
                {
                    category: "🔔 Meta Events System",
                    items: [
                        "<strong>NEW EVENT BELL:</strong> Dynamic events that affect your whole company!",
                        "• Bell icon in top bar shows pending events",
                        "• Events appear based on time, company state, and random chance",
                        "• Accept or dismiss events - your choice shapes the company",
                        "",
                        "<strong>EVENT TYPES:</strong>",
                        "• 📋 Company-wide announcements",
                        "• 💼 Business opportunities",
                        "• 🎉 Social events and celebrations",
                        "• ⚠️ Crises and challenges",
                        "• 💰 Financial windfalls or setbacks",
                    ],
                },
                {
                    category: "⏰ Time Dilation System",
                    items: [
                        "<strong>CONVERSATIONS NO LONGER WARP TIME:</strong> Chat at your own pace!",
                        "• Time now passes much slower during 1-on-1 chats",
                        "• Group conversations also have reduced time flow",
                        "• Configurable time scales in Settings (default: 0.3x for DMs, 2x for groups)",
                        '• No more "8 hours passed during a 5-message chat" situations',
                    ],
                },
                {
                    category: "📅 NPC-Aware Event Scheduling",
                    items: [
                        "<strong>NPCs KEEP THEIR PROMISES:</strong> Informal plans become real events!",
                        '• When NPCs say "Let\'s grab lunch tomorrow" - they mean it',
                        "• AI detects scheduling language in conversations",
                        "• Events auto-created with appropriate timing",
                        "• NPCs remember and reference upcoming plans",
                        "• Configurable detection sensitivity in Settings",
                    ],
                },
                {
                    category: "📸 Unprompted NPC Images",
                    items: [
                        "<strong>NPCS SEND PHOTOS SPONTANEOUSLY:</strong> More natural conversations!",
                        "• High-affection NPCs may send selfies unprompted",
                        "• Context-aware: morning selfies, work photos, evening pics",
                        "• Relationship-gated: more intimate photos require higher trust",
                        "• Photos saved to NPC galleries automatically",
                        "• Weighted system ensures variety (not every message has a pic)",
                    ],
                },
                {
                    category: "👥 Groups UI Overhaul",
                    items: [
                        "<strong>DESKTOP IMPROVEMENTS:</strong>",
                        "• Fixed portrait/name clipping in participant bar",
                        "• Better header layout with proper text truncation",
                        "• Improved sidebar positioning and overlap issues",
                        "",
                        "<strong>MOBILE IMPROVEMENTS:</strong>",
                        "• Taller chat area (fills available screen)",
                        "• Compact sidebar that collapses properly",
                        "• Touch-friendly tap targets (44px minimum)",
                        "• Landscape mode optimization",
                        "",
                        "<strong>RESPONSIVE BREAKPOINTS:</strong>",
                        "• Desktop (1200px+): Full sidebar, spacious layout",
                        "• Tablet (1024px): Narrower sidebar",
                        "• Mobile (768px): Stacked layout, collapsible sidebar",
                        "• Small Mobile (480px): Ultra-compact mode",
                    ],
                },
                {
                    category: "🎬 Group Action Commands Enhanced",
                    items: [
                        "<strong>NEW COMMAND SYNTAX:</strong> More control over NPC actions!",
                        "",
                        "<strong>1-on-1 Chats:</strong>",
                        "<code>/actionType {Your message} &lt;Instructions&gt;</code>",
                        "• Example: <code>/kiss {I love you} &lt;Be passionate&gt;</code>",
                        "",
                        "<strong>Group Chats:</strong>",
                        "<code>/actionType NPCName {Your message} &lt;Instructions&gt;</code>",
                        "• Example: <code>/interact Sarah {} &lt;Be flirty&gt;</code>",
                        "• Target specific NPCs by first name",
                        '• Use "narrator" to direct the narrator',
                        "",
                        "<strong>📜 Narrator Command (NEW!):</strong>",
                        "<code>/narrator &lt;Your instructions&gt;</code>",
                        "• Available in both 1-on-1 chats and group chats",
                        "• Shortcut: <code>/n</code>",
                        "• Add custom instructions in angle brackets for guided narration",
                        "• Example: <code>/narrator &lt;Focus on the romantic tension&gt;</code>",
                        "",
                        "<strong>Custom Instructions:</strong> Override default action behavior",
                        "• <code>&lt;Instructions&gt;</code> parameter lets you guide exactly how the NPC responds",
                    ],
                },
                {
                    category: "💬 Idle Group Conversations",
                    items: [
                        "<strong>NPCs CHAT WITHOUT YOU:</strong> Groups feel alive!",
                        '• Enable "Idle Conversations" in group settings',
                        "• When chat is quiet, NPCs start talking to each other",
                        "• Configurable idle threshold (default: 2 minutes)",
                        "• Only triggers in active/viewed group",
                        "• Natural conversation starters between random participants",
                    ],
                },
                {
                    category: "🎁 Gift Shop Persistence",
                    items: [
                        "<strong>GIFTS SURVIVE PRESTIGE:</strong> Your collection is safe!",
                        "• Gift inventory no longer resets on prestige",
                        "• Purchased gifts carry over to new playthroughs",
                        "• Generated unique gifts are preserved",
                        "• Given gift history maintained",
                    ],
                },
                {
                    category: "🖼️ Scene Visualization Fixes",
                    items: [
                        "<strong>FIXED:</strong> Auto-visualization in groups now works properly",
                        "• Corrected element ID references that broke image display",
                        "• Added validation to prevent empty image messages",
                        "• Better error handling and loading indicator cleanup",
                        '• Images now actually appear (not just "Scene visualization" text)',
                    ],
                },
                {
                    category: "🔧 Additional Improvements",
                    items: [
                        "<strong>Action Buttons for Groups:</strong> Full action bar system in group chats",
                        "• Same /do commands and buttons as 1-on-1 chats",
                        "• Narrator-specific actions available",
                        "• Customizable per-group",
                        "",
                        "<strong>Performance:</strong> Various optimizations for smoother gameplay",
                    ],
                },
            ],
        },
        {
            version: "202601152111",
            date: "January 15, 2026",
            title: "👥 GROUPS SYSTEM & MAJOR BUG FIXES",
            changes: [
                {
                    category: "🆕 Groups System (Replaces Meetings)",
                    items: [
                        '<strong>COMPLETE REBUILD:</strong> "Meetings" system removed and replaced with powerful new "Groups" system!',
                        "<strong>• Create Custom Groups:</strong> Name your group, add any combination of employees",
                        "<strong>• Persistent Chat Rooms:</strong> Groups save their chat history permanently",
                        "<strong>• Dynamic Member List:</strong> See who's in the conversation, add/remove anytime",
                        "",
                        "<strong>GROUP FEATURES:</strong>",
                        "• <strong>Narrator System:</strong> Add an AI narrator to describe scenes and settings",
                        "• <strong>Auto-Visualization:</strong> Automatic image generation based on group conversation intensity",
                        "• <strong>Pre-Text:</strong> Set context that shapes how all NPCs respond",
                        "• <strong>Scenario Context:</strong> Define the current scene/setting for the group",
                        "• <strong>Member Portraits:</strong> Visual roster with quick-add functionality",
                        "• <strong>Attachment Menu:</strong> Send gifts, request actions, target specific members",
                        "",
                        "<strong>WHY THE CHANGE:</strong>",
                        '• Old "Meetings" were temporary and didn\'t save history',
                        "• Groups persist forever with full conversation history",
                        "• More intuitive UI with sidebar member list",
                        "• Better control over who's in each conversation",
                    ],
                },
                {
                    category: "🎭 Narrator for Groups",
                    items: [
                        "<strong>NEW:</strong> Add a Narrator to any group chat!",
                        "• Toggle in group settings to add/remove narrator",
                        "• Narrator has unique purple styling and portrait",
                        "• Describes scenes, actions, and atmosphere",
                        "• Typing indicator shows when narrator is composing",
                        "• Perfect for roleplay scenarios and storytelling",
                    ],
                },
                {
                    category: "📊 Race Distribution Fix",
                    items: [
                        '<strong>FIXED:</strong> HR tab race distribution no longer shows "undefined"',
                        "• Added all 29 races to display system (was only showing 8)",
                        "• New races now display properly: Succubus, Tiefling, Angel, Vampire, Dwarf, Goblin, Halfling, Dragonborn, Bunny, Werewolf, Fairy, Dryad, Mermaid, Lamia, Centaur, Harpy, Slime, Ghost, Robot, Cyborg, Alien",
                        "• Each race has unique color coding in the distribution chart",
                    ],
                },
                {
                    category: "👤 Custom Employee Fixes",
                    items: [
                        "<strong>FIXED:</strong> Custom employee physical appearance no longer resets!",
                        "• Previously: Your hair color, eye color, body type etc. were overwritten with random values",
                        "• Now: All user-specified physical attributes are preserved",
                        "• Only truly missing fields get random generation",
                        "<strong>FIXED:</strong> Custom race selection now works properly",
                        "<strong>FIXED:</strong> Physical descriptions now match in image generation",
                    ],
                },
                {
                    category: "🖼️ Auto-Visualization Fixes",
                    items: [
                        "<strong>FIXED:</strong> Auto-vis now responds to frequency setting changes immediately",
                        "• Changing min/max frequency now recalculates all existing trackers",
                        "• Setting 1-2 message frequency actually triggers within 1-2 messages now",
                        "• Both individual chat and group trackers are updated",
                    ],
                },
                {
                    category: "✋ Image Generation Improvements",
                    items: [
                        "<strong>FIXED:</strong> Reduced extra arms/hands in generated images",
                        '• Changed "avoid extra X" to "no extra X" phrasing',
                        '• Added positive reinforcement: "exactly two arms, exactly two hands"',
                        '• Some AI models were misinterpreting "avoid" as "include"',
                    ],
                },
                {
                    category: "🔧 UI Fixes",
                    items: [
                        "<strong>FIXED:</strong> Group settings modal no longer overflows on mobile",
                        "<strong>FIXED:</strong> Target selector modal appears above action modals (z-index fix)",
                        "<strong>IMPROVED:</strong> Better scrolling behavior in group member lists",
                    ],
                },
            ],
        },
        {
            version: "202601121020",
            date: "January 12, 2026",
            title: "🧠 SMARTER NPCs & PLAYER IDENTITY UPDATE",
            changes: [
                {
                    category: "🔁 NPC Repetition Fix",
                    items: [
                        "<strong>NO MORE COFFEE SPITTING 12 TIMES:</strong> NPCs now track their recent actions",
                        "• System extracts physical actions from responses and remembers them",
                        "• Similar actions detected (sips ≈ drinks, wipes ≈ dabs, laughs ≈ chuckles)",
                        "• AI prompted to avoid recently-used gestures - more natural conversations!",
                    ],
                },
                {
                    category: "👤 Expanded Player Bio",
                    items: [
                        "<strong>YOUR CHARACTER, YOUR WAY:</strong> Massive expansion to player customization",
                        "• New sections: Hair details, Face & Eyes, Skin, Body, Intimate Details",
                        "• Add personality traits, hobbies, likes, dislikes, and kinks",
                        "• Choose from fantasy races (elf, demon, angel, and more!)",
                        "• NPCs now reference your full description in conversations",
                    ],
                },
                {
                    category: "💬 Per-NPC Nicknames",
                    items: [
                        "<strong>NEW:</strong> Each NPC can call you by a different name!",
                        "• Set a custom nickname in each character's bio",
                        "• Leave blank to use your default player name",
                    ],
                },
                {
                    category: "🐕 Pet Management",
                    items: [
                        "<strong>NEW:</strong> Edit, remove, or add pets in employee bios",
                        "<strong>FIXED:</strong> NPCs no longer obsessively mention their pets every message",
                    ],
                },
                {
                    category: "🖼️ Better Image Generation",
                    items: [
                        "<strong>ANATOMY FIX:</strong> All images now include anti-mutation prompts",
                        '• "Correct hand anatomy, five fingers per hand, avoid extra limbs"',
                        "• Should reduce weird hands and extra appendages across the board",
                    ],
                },
                {
                    category: "🐛 Bug Fixes",
                    items: [
                        "<strong>FIXED:</strong> Communication mode now saves per-NPC (no more resetting to Auto)",
                        "<strong>FIXED:</strong> Races dropdown in character creation now works",
                        "<strong>FIXED:</strong> Gallery/family images now load correctly",
                        "<strong>FIXED:</strong> Fired employees removed from family tab",
                        "<strong>FIXED:</strong> Character generation no longer leaves traits blank",
                        "<strong>FIXED:</strong> Social feed refresh button actually refreshes now",
                        '<strong>FIXED:</strong> "All Types" post filter works reliably',
                        '<strong>FIXED:</strong> "Last message" timestamp uses in-game time',
                    ],
                },
            ],
        },
        {
            version: "202601111040",
            date: "January 11, 2026",
            title: "🌍 ETHNICITY, FAMILY & DIVERSITY UPDATE",
            changes: [
                {
                    category: "👨‍👩‍👧 Family Relationships",
                    items: [
                        "<strong>NEW FEATURE:</strong> Create family members for your employees!",
                        '<strong>• Click "Add Family Member"</strong> in any employee\'s bio modal',
                        "<strong>• Choose relationship:</strong> Mother, Father, Sister, Brother, Spouse, Cousin, Aunt, Uncle, and more!",
                        "",
                        "<strong>SMART INHERITANCE:</strong> Family members share traits",
                        "<strong>• Same ethnicity</strong> as their relative",
                        "<strong>• 70% chance</strong> to inherit eye color",
                        "<strong>• 50% chance</strong> to inherit hair color",
                        "<strong>• Appropriate ages</strong> (parents older, siblings similar, children 18+)",
                        "",
                        "<strong>AI AWARENESS:</strong> NPCs know about their family at work",
                        "<strong>• Shows in bio modal</strong> with clickable links",
                        "<strong>• Subtle context in chats</strong> - they won't obsess over it",
                        "<strong>• Meetings recognize family</strong> connections between participants",
                    ],
                },
                {
                    category: "🌍 Employee Ethnicities",
                    items: [
                        "<strong>NEW:</strong> Employees now have ethnicities! 11 diverse backgrounds represented",
                        "<strong>• East Asian, Southeast Asian, South Asian, Middle Eastern, Latino/Hispanic</strong>",
                        "<strong>• Black/African, Caucasian/European, Pacific Islander, Native American</strong>",
                        "<strong>• Central Asian, Indigenous/First Nations</strong>",
                        "",
                        "<strong>CHARACTER CREATION:</strong> Choose ethnicity when creating custom employees",
                        "<strong>BIO MODAL:</strong> Ethnicity now displayed in employee profiles",
                        "<strong>EXISTING SAVES:</strong> All current employees automatically assigned fitting ethnicities",
                    ],
                },
                {
                    category: "📛 Culturally-Inspired Names",
                    items: [
                        "<strong>SMARTER NAMES:</strong> Name generation now considers ethnicity",
                        "<strong>• First names:</strong> 60% chance of culturally-inspired name, 40% generic",
                        "<strong>• Last names:</strong> 75% chance of culturally-inspired surname, 25% generic",
                        "<strong>NATURAL FEEL:</strong> Names blend cultural heritage with universal appeal",
                    ],
                },
                {
                    category: "📊 Generation Counters",
                    items: [
                        "<strong>NEW:</strong> Track your total AI generations for the entire playthrough!",
                        "<strong>• Text Generations:</strong> See how many AI text responses you've requested",
                        "<strong>• Image Generations:</strong> See how many character portraits you've created",
                        "<strong>PERSISTENT:</strong> Counters save with your game and survive page refreshes",
                    ],
                },
                {
                    category: "🧹 Settings Cleanup",
                    items: [
                        '<strong>REMOVED:</strong> "UI Density" slider - it never actually did anything!',
                        "<strong>CLEANER:</strong> Settings panel now shows only functional options",
                    ],
                },
            ],
        },
        {
            version: "202601031900",
            date: "January 3, 2026",
            title: "🛡️ CUSTOM CHARACTER PROTECTION",
            changes: [
                {
                    category: "🛡️ Accidental Closure Protection",
                    items: [
                        "<strong>CRITICAL FIX:</strong> Custom character confirmation modal now prevents accidental closure",
                        "<strong>• PROBLEM:</strong> Clicking outside the modal would instantly close it, losing your generated character and prompt",
                        "<strong>• SOLUTION:</strong> Modal now requires confirmation before closing with unsaved character",
                        "<strong>• RESULT:</strong> No more lost characters from misclicks!",
                        "",
                        "<strong>NEW: Recover Last Character:</strong> Button appears in custom employee creator when you have an unsaved character",
                        '<strong>NEW: Confirmation Dialog:</strong> Closing the modal asks "Are you sure?" and reminds you the character is saved',
                        "<strong>NEW: Escape Key Protection:</strong> Pressing Escape also requires confirmation",
                    ],
                },
            ],
        },
        {
            version: "202601031800",
            date: "January 3, 2026",
            title: "💾 SAVE SYSTEM OPTIMIZATION",
            changes: [
                {
                    category: "💾 Debounced Save System",
                    items: [
                        "<strong>PERFORMANCE FIX:</strong> Eliminated save congestion during bulk operations",
                        "<strong>• PROBLEM:</strong> Team Building, Training Workshops, and other bulk operations were triggering 30+ simultaneous saves (one per employee)",
                        "<strong>• SOLUTION:</strong> Implemented debounced save system that coalesces rapid-fire saves into single operations",
                        "<strong>• RESULT:</strong> Massive performance improvement during stat-boosting activities!",
                        "",
                        "<strong>NEW: debouncedSave():</strong> Batches multiple save requests within 500ms window into one save",
                        "<strong>NEW: flushPendingSave():</strong> Forces immediate save when needed (used at end of bulk operations)",
                        "<strong>NEW: Save throttling:</strong> Auto-saves now skip if another save is in progress",
                        "<strong>NEW: MIN_SAVE_INTERVAL:</strong> 500ms minimum between saves prevents rapid-fire congestion",
                    ],
                },
                {
                    category: "⚡ Technical Changes",
                    items: [
                        "<strong>gainSkillXP():</strong> Now uses debouncedSave() instead of immediate saveGame()",
                        "<strong>conductTeamBuilding():</strong> Properly flushes pending saves before final save",
                        "<strong>conductTrainingWorkshop():</strong> Properly flushes pending saves before final save",
                        "<strong>saveGameToSlot():</strong> Added concurrency protection and throttling for auto-saves",
                    ],
                },
            ],
        },
        {
            version: "202601031440",
            date: "January 3, 2026",
            title: "🎬 NPC ACTION BUTTONS + CUSTOM EMPLOYEES",
            changes: [
                {
                    category: "🎬 NPC Action Buttons",
                    items: [
                        "<strong>NEW ACTION BAR:</strong> Guide NPCs with one-click action buttons during chat!",
                        "<strong>▶️ Continue:</strong> Keep the scene going naturally",
                        "<strong>🎬 Action:</strong> Trigger detailed physical actions (NPC does something, no dialogue)",
                        "<strong>💭 Thoughts:</strong> Peek into what the NPC is thinking",
                        "<strong>💕 Flirt / 😏 Tease / ✅ Comply / ⛔ Resist:</strong> Steer the mood",
                        "<strong>🎯 Custom:</strong> Type <code>/do [instruction]</code> for any custom action",
                        "<strong>⚙️ Configurable:</strong> Enable/disable buttons per employee",
                    ],
                },
                {
                    category: "👤 Custom Employee Creation",
                    items: [
                        "<strong>THREE WAYS TO CREATE:</strong>",
                        "<strong>🔗 From URL:</strong> Paste a wiki/character page link - AI extracts the character",
                        "<strong>✍️ From Description:</strong> Describe your character in plain text",
                        "<strong>📝 Manual Mode:</strong> Full control over every stat, trait, and appearance",
                        "",
                        "<strong>SMART WORKFLOW:</strong> Generation happens in background - keep playing!",
                        "<strong>REVIEW BEFORE HIRE:</strong> Edit and approve the generated character before finalizing",
                    ],
                },
                {
                    category: "📍 Position Selection",
                    items: [
                        "<strong>HIRE AT ANY LEVEL:</strong> Create Staff, Managers, or Division Heads directly",
                        "<strong>CHOOSE YOUR SLOT:</strong> Pick exactly which position to fill in your corporate pyramid",
                        "<strong>SMART DEFAULTS:</strong> Auto-selects the location you clicked from",
                    ],
                },
                {
                    category: "📋 Full Character Customization",
                    items: [
                        "<strong>EVERYTHING IS CUSTOMIZABLE:</strong> Name, age, gender, race, bio, personality sliders, relationship stats, work performance, traits, hobbies, kinks, physical appearance, schedule, and more!",
                        "<strong>AI FILLS GAPS:</strong> Leave fields blank and AI generates fitting values",
                    ],
                },
            ],
        },
        {
            version: "202512061200",
            date: "December 6, 2025",
            title: "🏛️ INNER SANCTUM FIXES + AI REQUEST MANAGEMENT",
            changes: [
                {
                    category: "🏛️ Inner Sanctum - Critical Fixes",
                    items: [
                        "<strong>🎯 HIRING SYSTEM FIX:</strong> Inner Sanctum staff now correctly assigned to location when hired",
                        "<strong>• PROBLEM:</strong> New managers hired for Inner Sanctum weren't getting location assignment",
                        "<strong>• SOLUTION:</strong> Added proper locationId assignment in hiring functions",
                        "<strong>• RESULT:</strong> Staff actually show up in Inner Sanctum after hiring!",
                        "",
                        '<strong>💰 UPGRADE COSTS FIX:</strong> Fixed "NaN%" display in Inner Sanctum money upgrades',
                        "<strong>• PROBLEM:</strong> Missing base cost entries caused percentage calculations to fail",
                        "<strong>• SOLUTION:</strong> Added Inner Sanctum entries to upgrade cost database",
                        '<strong>• RESULT:</strong> Upgrade percentages now display correctly instead of "NaN%"!',
                        "",
                        '<strong>⭐ ELITE UPGRADES FIX:</strong> Fixed "Nan% Level" display in Elite upgrade tooltips',
                        "<strong>• PROBLEM:</strong> Missing null-safety checks when accessing global upgrade data",
                        "<strong>• SOLUTION:</strong> Added proper safety operators throughout upgrade system",
                        "<strong>• RESULT:</strong> Elite upgrades now show proper level information!",
                    ],
                },
                {
                    category: "🤖 AI Request Management System - NEW!",
                    items: [
                        '<strong>🎯 SMART REQUEST QUEUE:</strong> Automatic prevention of "Max Requests Exceeded" errors',
                        "<strong>• PROBLEM:</strong> Too many simultaneous AI text generation requests causing failures",
                        "<strong>• SOLUTION:</strong> Built intelligent queue system that manages all AI requests automatically",
                        "<strong>• FEATURES:</strong> Configurable max concurrent requests (5-50), real-time status display, smart context detection",
                        "<strong>• RESULT:</strong> No more AI errors! Smooth text generation even during busy gameplay",
                        "",
                        "<strong>⚙️ NEW SETTINGS PANEL:</strong> AI Request Management in Settings",
                        "<strong>• Control max concurrent AI requests with easy slider</strong>",
                        "<strong>• Real-time monitoring of active/queued requests</strong>",
                        "<strong>• Visual feedback and status updates</strong>",
                        "<strong>• Settings persist across game saves/loads</strong>",
                        "",
                        "<strong>🔄 ZERO-IMPACT INTEGRATION:</strong> Works automatically with existing features",
                        "<strong>• All AI text generation now uses smart queue system</strong>",
                        "<strong>• No changes needed to existing game functions</strong>",
                        "<strong>• Automatic context detection for better queue descriptions</strong>",
                        "<strong>• Smart throttling prevents overwhelming Perchance AI plugin</strong>",
                    ],
                },
                {
                    category: "🛡️ System Improvements",
                    items: [
                        "<strong>🔒 Enhanced Null-Safety:</strong> Added protective checks throughout upgrade system to prevent crashes",
                        "<strong>💾 Persistent Settings:</strong> AI queue settings save/load with game data automatically",
                        "<strong>🎯 Smart Context Detection:</strong> AI queue provides better descriptions of what's being generated",
                        "<strong>📊 Real-Time Monitoring:</strong> Live status updates for AI request activity",
                    ],
                },
                {
                    category: "📊 Update Summary",
                    items: [
                        "<strong>INNER SANCTUM:</strong> 3 critical fixes (hiring, upgrades, elite display)",
                        "<strong>AI SYSTEM:</strong> Complete request management overhaul with settings UI",
                        "<strong>SAFETY:</strong> Enhanced null-safety throughout upgrade calculations",
                        "<strong>USER EXPERIENCE:</strong> New settings panel for AI request control",
                        "<strong>IMPACT:</strong> Eliminates AI request errors, fixes endgame location issues",
                        "<strong>TECHNICAL:</strong> ~100 lines new queue system, automatic integration",
                        "<strong>COMPATIBILITY:</strong> Zero breaking changes, works with existing saves",
                    ],
                },
            ],
        },
        {
            version: "2511132155",
            date: "November 13, 2025",
            title: "🎯 Quality of Life Update - Name Editing, Autosaves, Polish & Balance",
            changes: [
                {
                    category: "✨ New Features",
                    items: [
                        "<strong>✏️ Edit NPC Names in Overview Tab:</strong> Rename employees directly from Overview with validation (no duplicates, min 2 chars)",
                        "<strong>💾 Autosave Snapshots:</strong> 10 rotating snapshot slots (every 5 min) = 50 minutes of recovery history",
                        "<strong>🧝 Beautified Orcs:</strong> Modern athletic aesthetic instead of brutal warriors (gym-toned, radiant skin, cute tusks)",
                        "<strong>💬 Natural AI Conversations:</strong> Eliminated exhausting purple prose - NPCs talk like normal people now",
                        "<strong>🗑️ Cleaner Social Feed:</strong> Failed posts discard completely instead of posting generic spam",
                    ],
                },
                {
                    category: "⚖️ Balance Changes",
                    items: [
                        "<strong>🎮 Late Game Content:</strong> Rebalanced bosses for higher difficulty, added late-game upgrades",
                        "<strong>💰 Offline Earnings:</strong> Adjusted base offline earning rates",
                        "<strong>📊 Upgrade Rebalancing:</strong> Location-specific costs, increased upper limits",
                        "<strong>⚙️ Difficulty Controls:</strong> New employee start stat difficulty settings",
                    ],
                },
                {
                    category: "🐛 Bug Fixes",
                    items: [
                        "<strong>💾 Save Migration:</strong> Fixed kv.gameSave.del() → delete() TypeError",
                        "<strong>🔢 Number Display:</strong> Fixed abbreviation formatting issues",
                    ],
                },
                {
                    category: "🎨 Content Additions",
                    items: [
                        "<strong>🖼️ Art Styles Expanded:</strong> 20+ professional art style options for image generation",
                    ],
                },
            ],
        },
        {
            version: "2511130002",
            date: "November 13, 2025",
            title: "💰 CRITICAL FIX: Money Request Timing (Player Feedback)",
            changes: [
                {
                    category: "💰 Money Request System - Timing & Relationship Requirements",
                    items: [
                        '<strong>PLAYER FEEDBACK:</strong> "I have noticed that the NPC\'s almost always send a money request after the first or the second message" - Players felt NPCs were asking for money way too early in relationships.',
                        "<strong>PROBLEM ANALYSIS:</strong> Three timing issues allowed premature money requests:",
                        '<strong>• Too-Short Activity Window:</strong> Only 5 minutes since last message before considering conversation "inactive"',
                        "<strong>• Too-Short Player Protection:</strong> Only 10 minutes since player's last message before NPCs could interrupt",
                        "<strong>• No Relationship Gate:</strong> NPCs could request money after just 1-2 messages with zero relationship development",
                        "<strong>SOLUTION - TRIPLE FIX:</strong>",
                        "<strong>⏰ Extended Activity Window:</strong> 5 minutes → 60 minutes (12x increase)",
                        "<strong>⏰ Extended Player Protection:</strong> 10 minutes → 120 minutes (12x increase)",
                        "<strong>💕 Relationship Requirement:</strong> NOW REQUIRES 30+ messages exchanged before money requests are even considered",
                        "<strong>TECHNICAL CHANGES:</strong>",
                        "<strong>• Line ~30182:</strong> evaluateProactiveMessageTriggers() - Updated all timing checks",
                        "<strong>• Conversation Inactivity:</strong> timeSinceLastMessage > 60 minutes (was 5)",
                        "<strong>• Player Activity Check:</strong> timeSinceLastPlayerMessage > 120 minutes (was 10)",
                        "<strong>• Message Count Gate:</strong> conversation.messages.length < 30 early returns",
                        "<strong>BEHAVIOR CHANGES:</strong>",
                        "<strong>Before:</strong> NPCs could send money requests after 1-2 messages if 5 minutes passed",
                        "<strong>After:</strong> NPCs wait for 30+ messages AND 60+ minutes of inactivity AND 120+ minutes since your last message",
                        "<strong>📊 IMPACT ESTIMATE:</strong> Reduces premature money requests by ~90%. Money requests now only happen in established relationships after significant conversation history.",
                        "<strong>RESULT:</strong> NPCs no longer pester you for money immediately after meeting. Money requests now feel appropriate and relationship-appropriate!",
                    ],
                },
                {
                    category: "📊 Update Summary",
                    items: [
                        "<strong>FILES MODIFIED:</strong> 1 (index.html)",
                        "<strong>LINES CHANGED:</strong> ~15 lines in evaluateProactiveMessageTriggers()",
                        "<strong>TIMING ADJUSTMENTS:</strong> 3 critical thresholds increased",
                        "<strong>NEW REQUIREMENTS:</strong> 1 (30-message minimum)",
                        "<strong>PLAYER IMPACT:</strong> Immediate - affects all conversations",
                        "<strong>COMPILATION:</strong> ✅ No errors",
                    ],
                },
            ],
        },
        {
            version: "2511130001",
            date: "November 13, 2025",
            title: "✨ NEW FEATURES: Character Name Editing + Fantasy/Anthro Races",
            changes: [
                {
                    category: "✏️ NEW: Character Name Editing with Validation",
                    items: [
                        "<strong>EDIT CHARACTER NAMES:</strong> You can now change employee names in the bio modal while in edit mode! The name field is fully editable with comprehensive validation.",
                        "<strong>VALIDATION SYSTEM:</strong> Prevents common issues with name changes:",
                        "<strong>• Empty Name Check:</strong> Cannot save blank or whitespace-only names",
                        "<strong>• Minimum Length:</strong> Names must be at least 2 characters long",
                        "<strong>• Duplicate Detection:</strong> Cannot create duplicate names - checks against all active employees (case-insensitive)",
                        "<strong>• Onboarding Queue Check:</strong> Also checks names in the onboarding queue to prevent conflicts",
                        "<strong>• usedEmployeeNames Sync:</strong> Automatically updates the global name tracking Set (removes old name, adds new name)",
                        "<strong>SAFETY FEATURES:</strong>",
                        "<strong>• Auto-Revert:</strong> If validation fails, the name field automatically reverts to the original value",
                        "<strong>• Clear Errors:</strong> Specific error notifications tell you exactly what went wrong",
                        "<strong>• Success Confirmation:</strong> Shows notification with old → new name when successful",
                        "<strong>DATA INTEGRITY:</strong> All references remain intact:",
                        "<strong>• Chat History:</strong> Uses employee IDs, not names (safe)",
                        "<strong>• Relationships:</strong> Uses employee IDs, not names (safe)",
                        "<strong>• Social Posts:</strong> Uses employee IDs, not names (safe)",
                        '<strong>HOW TO USE:</strong> Open any employee bio → Click "✏️ Edit" → Click the name field → Type new name → Click "💾 Save"',
                        "<strong>TECHNICAL:</strong> Name validation runs BEFORE the main save handler, with early return on failure. Name field is explicitly excluded from the general field save loop to prevent double-processing.",
                    ],
                },
                {
                    category: "🧬 NEW: Fantasy & Anthropomorphic Races System",
                    items: [
                        '<strong>SPECIES DIVERSITY:</strong> Employees can now be generated as fantasy and anthropomorphic species! Configure in HR → Gender Options (now "Gender & Race Options").',
                        "<strong>PROPORTIONAL DISTRIBUTION:</strong> Works exactly like gender sliders - adjust percentages that must total 100%.",
                        "<strong>AVAILABLE RACES:</strong>",
                        "<strong>Fantasy Races:</strong>",
                        "<strong>• 👤 Human:</strong> Standard humans (default: 100%)",
                        "<strong>• 🧝 Elf:</strong> Graceful with pointed ears and ethereal beauty",
                        "<strong>• � Orc:</strong> Muscular with green skin, tusks, strong jawline",
                        "<strong>• 😈 Demon:</strong> Horns, spaded tail, pale skin with red undertones",
                        "<strong>Anthropomorphic Races:</strong>",
                        "<strong>• 🦊 Foxkin:</strong> Fox ears, fluffy tail, sharp canine features",
                        "<strong>• � Wolfkin:</strong> Wolf ears, tail, fierce golden eyes",
                        "<strong>• � Catkin:</strong> Cat ears, tail, feline eyes with slit pupils",
                        "<strong>• 🐰 Rabbitkin:</strong> Long rabbit ears, cotton ball tail, soft features",
                        "<strong>SLIDER SYSTEM:</strong>",
                        "<strong>• Proportional Normalization:</strong> Sliders auto-adjust to maintain 100% total",
                        "<strong>• Real-time Updates:</strong> Live percentage display for each race",
                        "<strong>• Visual Feedback:</strong> Total turns red if not exactly 100%",
                        "<strong>• Smart Distribution:</strong> When you change one slider, others adjust proportionally",
                        "<strong>PHYSICAL INTEGRATION:</strong> Race features automatically added to descriptions:",
                        '<strong>• Ears:</strong> "pointed elf ears", "cat ears", "fox ears", "wolf ears", "long rabbit ears", "small pointed horns"',
                        '<strong>• Tails:</strong> "cat tail", "fluffy fox tail", "wolf tail", "cotton ball tail", "spaded demon tail"',
                        '<strong>• Skin:</strong> "green skin" (orcs), "pale skin with subtle red undertones" (demons)',
                        '<strong>• Other:</strong> "ethereal beauty", "feline eyes with slit pupils", "tusks", "fierce golden eyes", etc.',
                        "<strong>IMAGE GENERATION:</strong> Physical descriptions include race features in AI prompts:",
                        '<strong>• Short Description:</strong> "average height slim foxkin woman with..."',
                        '<strong>• Full Description:</strong> Includes "Distinctive features: fox ears, fluffy fox tail, sharp canine features"',
                        '<strong>• Gender-Neutral Terms:</strong> Uses "kin" suffix (foxkin, wolfkin, etc.) instead of gendered terms',
                        "<strong>UI DESIGN:</strong>",
                        "<strong>• Organized Layout:</strong> Fantasy races grouped separately from anthropomorphic races",
                        "<strong>• Color-Coded:</strong> Each race has unique accent colors",
                        '<strong>• Category Headers:</strong> Clear "✨ Fantasy Races" and "🐾 Anthropomorphic Races" sections',
                        "<strong>• Descriptive Text:</strong> Each race includes a brief description",
                        "<strong>TECHNICAL IMPLEMENTATION:</strong>",
                        "<strong>• selectRaceForEmployee():</strong> Weighted random selection matching gender system",
                        "<strong>• getRaceFeatures():</strong> Returns race-specific physical attributes",
                        "<strong>• normalizeRaceSliders():</strong> Auto-balances percentages to 100%",
                        "<strong>• Race Field:</strong> Added to employee objects alongside gender",
                        '<strong>BACKWARDS COMPATIBLE:</strong> Existing employees default to "human" race. System works seamlessly with all existing features.',
                        "<strong>SETTINGS PERSISTENCE:</strong> Race settings save with your game and persist across sessions",
                        "<strong>DEFAULT CONFIGURATION:</strong> All races start at 0% except Human (100%) - opt-in system",
                        "<strong>PERFECT FOR:</strong> Fantasy office settings, furry-friendly gameplay, diverse character rosters, roleplay scenarios, creative storytelling",
                    ],
                },
            ],
        },
        {
            version: "2511122010",
            date: "November 12, 2025",
            title: "💾 MAJOR: Multi-Slot Save Manager + 🐛 Critical Player Feedback Fixes",
            changes: [
                {
                    category: "💾 NEW: Advanced Multi-Slot Save System",
                    items: [
                        "<strong>🎉 BRAND NEW SAVE MANAGER:</strong> Complete overhaul of the save system inspired by modern RPGs! Replace simple save/load buttons with a full-featured modal interface for managing multiple save slots.",
                        "<strong>💾 MULTI-SLOT ARCHITECTURE:</strong> Create unlimited named saves - no more overwriting your only save! Save types: Manual Saves (your named saves), Quick Saves (F5 shortcut), Autosaves (automatic every 5 seconds).",
                        "<strong>⌨️ KEYBOARD SHORTCUTS:</strong> Press F5 anywhere for instant Quick Save, F9 for Quick Load (loads most recent quick save), Esc to close Save Manager.",
                        "<strong>🎨 BEAUTIFUL MODAL INTERFACE:</strong> Tab-based view (Manual / Auto & Quick), sortable table (Name, Day, Saved At, Playtime), search/filter by save name, inline editing (double-click to rename), row selection and highlights.",
                        "<strong>📊 RICH METADATA TRACKING:</strong> Every save stores: Save date/time, custom save name, save type (auto/quick/manual), total playtime, current game day, money amount, employee count, prestige level.",
                        "<strong>✨ POWERFUL FEATURES:</strong>",
                        '<strong>• Create New Save:</strong> "+ Create New Save" button in manual tab',
                        "<strong>• Rename Saves:</strong> Double-click any save name to edit inline",
                        "<strong>• Delete Saves:</strong> Click ✕ button with confirmation (autosave protected)",
                        "<strong>• Export/Import:</strong> Download individual saves as JSON files, import saves from backup files",
                        '<strong>• Load Saves:</strong> Click "Load" button or double-click save row',
                        '<strong>• Continue:</strong> Quick "Continue" button loads most recent save',
                        "<strong>• Sort & Filter:</strong> Click column headers to sort, search box for filtering",
                        "<strong>🔒 SAFETY FEATURES:</strong> Autosave slot cannot be deleted or renamed, confirmation dialogs before deleting saves, duplicate name checking prevents overwrites, corrupted save validation before loading, automatic migration from legacy format.",
                        '<strong>📱 SETTINGS PANEL UPDATE:</strong> Replaced 4 individual buttons (Save, Load, Export, Import) with single "💾 Save/Load Manager" button, added keyboard shortcut hints (F5/F9), clean gradient styling with hover effects.',
                        '<strong>🔄 AUTOMATIC MIGRATION:</strong> Old single-save format automatically converts to new system on first load, creates "migrated_legacy" save with all your progress, preserves original save for safety, completely transparent to users.',
                        "<strong>🎨 VISUAL DESIGN:</strong> Dark blue theme matching FUOC style (var(--l-panel-2)), cyan accents (var(--l-cyan)), save type badges (blue=auto, green=quick, default=manual), smooth animations and transitions, custom scrollbar styling, empty state messages.",
                        "<strong>💾 STORAGE FORMAT:</strong> Slot naming: fuoc_save_autosave, fuoc_save_quick_123, fuoc_save_My_Adventure. Backward compatible with old saveGame() function. Uses existing kv-plugin for persistence.",
                        "<strong>📝 CONSOLE LOGGING:</strong> All operations log with [SaveManager] prefix, shows save/load/delete/rename/export/import actions, emoji indicators for different operation types.",
                        "<strong>📊 CODE STATS:</strong> ~1,600 lines of new code added, 9 new backend functions, ~690 line SaveManager UI class, ~508 lines of CSS styling, zero compilation errors.",
                        "<strong>✅ BENEFITS:</strong> Never lose progress from overwriting saves, experiment with different game paths, backup important milestones, quick save before risky decisions, organize saves with meaningful names, modern professional UX.",
                    ],
                },
                {
                    category: "💰 CRITICAL FIX: Money Request Frequency",
                    items: [
                        '<strong>PLAYER FEEDBACK:</strong> "Love how everyone of my employees keeps asking me for ridiculous amounts of money." - Players felt constantly pestered by money requests.',
                        "<strong>PROBLEM:</strong> NPCs requesting money every 24 game hours (1 day), ~15% of ALL proactive messages were money requests, felt like constant spam.",
                        "<strong>SOLUTION - DRASTICALLY REDUCED:</strong>",
                        "<strong>⏰ Cooldown increased:</strong> 24 hours → 168 hours (7 game days)",
                        "<strong>⏰ Emergency requests:</strong> 72 hours minimum (3 days) even when broke",
                        "<strong>📊 Target frequency:</strong> 15% → 3-5% of proactive messages",
                        "<strong>📉 Weight reductions:</strong> Base: 8→2 (75% cut), Broke: 20→8 (60% cut), Low cash: 14→5 (64% cut)",
                        "<strong>🎯 Stricter requirements:</strong> Now requires affection > 50 AND trust > 50 (was 40/40)",
                        "<strong>💰 Updated thresholds:</strong> Low on cash: 7→14 days spending, Broke: 2→7 days spending",
                        "<strong>RESULT:</strong> Money requests are now rare, meaningful events that only happen when NPCs genuinely need help. No more constant financial nagging!",
                    ],
                },
                {
                    category: "👻 CRITICAL FIX: Fired Employees in Social Feed",
                    items: [
                        '<strong>PLAYER FEEDBACK:</strong> "Some characters i fired keep talking in socials not sure how to fix that" - Ex-employees haunting the social feed.',
                        "<strong>PROBLEM:</strong> Social feed showed posts from ALL employees ever hired, fired/terminated employees continued posting, no filter to remove ex-employees.",
                        "<strong>SOLUTION:</strong> Added Step 0 to filterAndSortPosts() that filters out fired employees BEFORE all other filters, checks current employee roster and only shows posts from active employees, preserves player and system posts.",
                        "<strong>📊 LOGGING:</strong> Console shows how many posts were filtered out from ex-employees.",
                        "<strong>RESULT:</strong> Social feed now only shows posts from current employees. Ex-employees no longer haunt your feed!",
                    ],
                },
                {
                    category: "☠️ CRITICAL FIX: PR Meeting Extreme Content",
                    items: [
                        '<strong>PLAYER FEEDBACK:</strong> "Just held a PR meeting, after roughly 10 suggestions made by the AI, they suggested we tattoo our company logo onto terminal ill patients morphine ridden skin, and to have suicide notes with our logo live sent on tv." - AI generating horrifying, morbid PR suggestions.',
                        "<strong>PROBLEM:</strong> No content safety filters in meeting responses, AI could generate morbid/extreme/illegal suggestions, no boundaries on what NPCs could suggest.",
                        "<strong>SOLUTION - COMPREHENSIVE CONTENT SAFETY:</strong> Added safety rules to all meeting prompts:",
                        "<strong>❌ BLOCKS:</strong> Suicide, self-harm, death references, terminal illness/hospices/medical trauma, exploitation of vulnerable people (sick/dying/imprisoned), extreme violence/gore/morbid content, illegal activities (murder/terrorism/exploitation)",
                        "<strong>✅ ENFORCES:</strong> Ethical, legal, reasonable suggestions, constructive redirection if topic gets dark",
                        "<strong>RESULT:</strong> NPCs now stay within appropriate boundaries during meetings. No more horrifying PR disasters!",
                    ],
                },
                {
                    category: "🗑️ BUG FIX: Clear Chat Button",
                    items: [
                        "<strong>PLAYER FEEDBACK:</strong> \"The 'clear' button in chat doesn't work\" - Button failing silently.",
                        "<strong>PROBLEM:</strong> gameState.activeChat could be either ID (string) or object, code assumed it was always an ID, failed silently when activeChat was an object.",
                        "<strong>SOLUTION:</strong> Added flexible handling: const activeChatId = gameState.activeChat?.id || gameState.activeChat, better validation checks, enhanced console logging for debugging, improved user feedback.",
                        "<strong>RESULT:</strong> Clear button now works reliably regardless of activeChat format!",
                    ],
                },
                {
                    category: "📸 BUG FIX: Chat Images Not Generating",
                    items: [
                        '<strong>PLAYER FEEDBACK:</strong> "In chats its describing an image but not sending an image" - NPCs saying "Here\'s a picture" without generating it.',
                        "<strong>PROBLEM:</strong> Agreement detection too strict, missed cases where NPC described sending without using specific keywords.",
                        "<strong>SOLUTION - IMPROVED DETECTION:</strong>",
                        '<strong>• Added keywords:</strong> "attaching", "attached" to strong agreement',
                        '<strong>• Added describingSending check:</strong> "send", "sent", "sending", "here is", "this is", "look at", "check out"',
                        '<strong>• Added imageDescribed check:</strong> NPC mentions "picture", "photo", "selfie", "image"',
                        "<strong>• Combined logic:</strong> Agrees if describing sending + mentioning image + no refusal",
                        "<strong>• Enhanced logging:</strong> Shows when image detected, type requested, whether NPC agreed, response snippet",
                        "<strong>RESULT:</strong> NPCs now actually send images when they say they will. More reliable image generation!",
                    ],
                },
                {
                    category: "✅ Scene Visualization Verification",
                    items: [
                        '<strong>PLAYER FEEDBACK:</strong> "scene visualization stopped using the character description" - Concern about missing character details.',
                        "<strong>STATUS:</strong> Already working correctly! visualizeCurrentScene() calls getPhysicalDescriptionForPrompt(emp) which includes full physical appearance, active flags (pregnant, chastity, pierced, etc.), and passes description to AI.",
                        "<strong>VERIFIED:</strong> Feature is implemented and functional - no changes needed.",
                    ],
                },
                {
                    category: "📊 Update Summary",
                    items: [
                        "<strong>FILES MODIFIED:</strong> 1 (index.html)",
                        "<strong>TOTAL NEW CODE:</strong> ~1,750 lines (1,600 save system + 150 fixes)",
                        "<strong>BALANCE CHANGES:</strong> 1 major (money request frequency)",
                        "<strong>SAFETY FEATURES:</strong> 1 new (meeting content filters)",
                        "<strong>BUG FIXES:</strong> 3 critical (fired employees, clear button, image detection)",
                        "<strong>MAJOR FEATURES:</strong> 1 (complete save manager overhaul)",
                        "<strong>COMPILATION:</strong> ✅ No errors",
                        "<strong>GIT COMMITS:</strong> 2 (dc5ae84 save system, 9e418d0 feedback fixes)",
                    ],
                },
            ],
        },
        {
            version: "2511051900",
            date: "November 5, 2025",
            title: "🐛 Critical Bug Fixes - Chat, Posts, Selfies & Rehire System",
            changes: [
                {
                    category: "💬 Chat Message Persistence Fix",
                    items: [
                        "<strong>FIXED: Messages Disappearing on Chat Close:</strong> Chat messages no longer disappear when you close the chat modal before the next autosave.",
                        "<strong>ROOT CAUSE:</strong> Autosave runs every 5 seconds. If you sent messages and closed the chat within those 5 seconds, the messages would be lost.",
                        "<strong>SOLUTION:</strong> Added explicit saveGame() call when closing chat modal. Messages are now immediately persisted to localStorage/kv-plugin.",
                        "<strong>IMPACT:</strong> You can safely close chats immediately after sending messages without losing your conversation history.",
                    ],
                },
                {
                    category: "📝 Post Regeneration Context Preservation",
                    items: [
                        "<strong>FIXED: Post Refresh Losing Context:</strong> Regenerating/refreshing posts now maintains the same topic and theme instead of generating completely random new content.",
                        "<strong>ROOT CAUSE:</strong> The regeneratePost() function was calling the AI without any reference to the original post content, so each refresh created an entirely new random post.",
                        '<strong>SOLUTION:</strong> Modified AI prompt to include the original post content as context with instruction: "Rewrite this same idea with different wording, keep the same vibe and topic."',
                        "<strong>IMPACT:</strong> Clicking refresh on a work achievement post will generate different wording of the same achievement, not a completely unrelated post about lunch or weekend plans.",
                    ],
                },
                {
                    category: "📸 Meeting Selfie Error Handling",
                    items: [
                        "<strong>FIXED: Meeting Selfie Silent Failures:</strong> Meeting selfie requests now provide helpful error messages instead of failing silently.",
                        "<strong>ROOT CAUSE:</strong> The requestGroupSelfie() function had minimal error checking. If your profile was incomplete or participants were invalid, it would fail without telling you why.",
                        "<strong>SOLUTION:</strong> Added 5 validation checkpoints with specific error messages:",
                        "<strong>• Check 1:</strong> Verify participants array exists",
                        '<strong>• Check 2:</strong> Verify player profile is complete (shows "Please set up your profile in Settings")',
                        "<strong>• Check 3:</strong> Verify at least one valid participant",
                        "<strong>• Check 4:</strong> Filter out invalid/deleted employees",
                        "<strong>• Check 5:</strong> Confirm remaining participants after filtering",
                        "<strong>IMPACT:</strong> Clear error messages guide you to fix issues (e.g., completing your profile) instead of wondering why the selfie button doesn't work.",
                    ],
                },
                {
                    category: "🔧 Rehire System Complete Overhaul",
                    items: [
                        '<strong>FIXED: Duplicate Employee Names:</strong> You can no longer hire the same person twice (e.g., two "Lydia Hunt" employees).',
                        "<strong>FIXED: Rehires Going Through Onboarding:</strong> Rehired employees no longer go through the onboarding process or generate new info.",
                        '<strong>ROOT CAUSE #1:</strong> When selecting a candidate for hire, their name was marked as "used" during generation but not verified again at selection time. If someone was still in the onboarding queue, the same name could be regenerated.',
                        '<strong>ROOT CAUSE #2:</strong> Clicking "⭐ Rehire" was calling selectManagerCandidate() which treats everyone as a new hire and adds them to the onboarding queue, even though these were returning employees with saved data.',
                        "<strong>SOLUTION - Part 1 (Duplicate Names):</strong> ",
                        "<strong>• Immediate Name Marking:</strong> Added name to usedEmployeeNames Set immediately when candidate is selected, not just when finalized",
                        "<strong>• Onboarding Sync:</strong> generateUniqueName() now checks the onboarding queue and adds those names to the Set before generating new names",
                        "<strong>• Safety Checks:</strong> Added Set initialization checks and console logging for debugging",
                        "<strong>SOLUTION - Part 2 (Rehire Onboarding):</strong>",
                        "<strong>• Route Fix:</strong> Rehire candidates now call finalizeRehire() instead of selectManagerCandidate() when clicked",
                        "<strong>• Data Preservation:</strong> All rehire data (stats, skills, personality, physical, chat history, etc.) is restored from the rehire pool",
                        "<strong>• Skip Onboarding:</strong> Rehired employees are added directly to gameState.employees with onboarding: false, hired: true, bioComplete: true",
                        "<strong>• ID Tracking:</strong> Preserves original rehire pool ID to properly remove them from the pool after hiring",
                        "<strong>WHAT THIS MEANS:</strong>",
                        "<strong>✅ No Duplicate Names:</strong> Each employee name is unique across active employees, onboarding queue, and rehire pool",
                        "<strong>✅ Instant Rehires:</strong> Former employees are ready to work immediately with all their history intact",
                        "<strong>✅ Data Preservation:</strong> Rehired employees keep their productivity bonuses, loyalty bonuses, relationship stats, chat history, and memories",
                        "<strong>✅ No Bio Generation:</strong> Rehires don't get new random bios or stats - everything is preserved from their previous employment",
                        "<strong>IMPACT:</strong> The rehire system now works exactly as intended - bringing back former employees with all their context and history, not treating them as brand new hires.",
                    ],
                },
                {
                    category: "🎨 UI Layout Optimization",
                    items: [
                        "<strong>IMPROVED: Social Feed Layout:</strong> Made the social feed sidebar more compact and extended the main feed area.",
                        "<strong>CHANGES:</strong>",
                        "<strong>• Sidebar Width:</strong> Reduced from 280px to 220px",
                        "<strong>• Container Height:</strong> Increased from calc(100vh - 200px) to calc(100vh - 160px)",
                        "<strong>• Spacing:</strong> Reduced gap from 20px to 15px, padding from 12px to 8px",
                        "<strong>• Font Sizes:</strong> Reduced from 0.95rem to 0.85rem for more compact display",
                        '<strong>• Button Text:</strong> Shortened labels ("All Content" → "All", "Popular (5+ reactions)" → "Popular (5+)")',
                        "<strong>• Scrolling:</strong> Added overflow-y: auto to sidebar for better scroll behavior",
                        "<strong>IMPACT:</strong> More screen space for posts, less scrolling needed, cleaner visual hierarchy.",
                    ],
                },
            ],
        },
        {
            version: "2511051245",
            date: "November 5, 2025",
            title: "🎭 THE ALGORITHM™ + Mean Girl Drama System",
            changes: [
                {
                    category: "📊 NEW: The Algorithm™ - Advanced Social Feed System",
                    items: [
                        "<strong>🔥 HOT SORTING:</strong> Reddit-style hot algorithm shows what's trending RIGHT NOW based on engagement divided by time decay",
                        "<strong>🏆 BEST SORTING:</strong> Find the highest quality posts with time filters (Hour/Day/Week/Month/All Time)",
                        "<strong>📅 RECENT SORTING:</strong> Classic chronological view - newest posts first",
                        "<strong>💥 CONTROVERSIAL SORTING:</strong> See posts with the most disagreement - high engagement but mixed upvotes/downvotes",
                        "<strong>🎨 CONTENT RATING FILTERS:</strong> Toggle between All/SFW/NSFW/Explicit to control what you see",
                        "<strong>📝 POST TYPE FILTERS:</strong> Filter by Text/Images/Selfies/Work Posts",
                        "<strong>👥 AUTHOR FILTERS:</strong> View posts from everyone, just you, people you follow, or specific employees",
                        "<strong>🔥 ENGAGEMENT FILTERS:</strong> Show All Posts, Popular (10+ likes), Viral (25+ likes), or Active Discussion (5+ comments)",
                        "<strong>🔍 REAL-TIME SEARCH:</strong> Search post content, authors, hashtags, and mentions with live result counts",
                        "<strong>💾 SAVED PREFERENCES:</strong> All your filter settings are remembered between sessions",
                    ],
                },
                {
                    category: "😈 NEW: Mean Girl Drama System",
                    items: [
                        "<strong>👎 DOWNVOTING:</strong> NPCs now downvote posts they don't like - controversial sorting finally works!",
                        "<strong>💔 RIVALRY DRAMA:</strong> Enemies downvote each other 70% of the time, leaving shade in their wake",
                        '<strong>💅 SNARKY COMMENTS:</strong> 25% chance for downvoters to leave catty comments like "Sure, if you say so 🙄" or "Must be nice"',
                        "<strong>😳 PRUDISH REACTIONS:</strong> Conservative NPCs clutch their pearls at explicit content (+50% downvote chance)",
                        "<strong>😤 JEALOUS HATERS:</strong> Mean NPCs target popular posts, lazy NPCs hate on work posts",
                        "<strong>⚔️ ESCALATING FEUDS:</strong> Each downvote reduces relationship by -3, can escalate to full rivalry status",
                        "<strong>🎲 RANDOM CATTINESS:</strong> Even neutral NPCs have a 25% chance to be randomly mean - keeps things spicy",
                    ],
                },
                {
                    category: "📸 Profile & Meeting Enhancements",
                    items: [
                        "<strong>🏢 COMPANY NAME:</strong> Your company name now appears on your profile (not just description)",
                        "<strong>🤳 PLAYER SELFIES FIXED:</strong> @player and @TheBoss mentions now work properly in image generation",
                        "<strong>💬 AUTOCOMPLETE:</strong> Type @TheBoss or @player in any image prompt for instant suggestions",
                        "<strong>🎬 MEETING VISUALIZATIONS:</strong> Generate AI images of your current meeting scene",
                        "<strong>📸 GROUP SELFIES:</strong> Request all meeting participants to pose together (+2 affection boost for everyone)",
                        "<strong>📊 MEETING STATS:</strong> Track messages sent, participants, images shared, and money spent per meeting",
                        "<strong>🤖 AI MEETING SUMMARIES:</strong> Generate smart summaries of what happened in each meeting",
                        "<strong>🧹 AUTO-CLEANUP:</strong> Old/deleted employees are automatically removed from meeting participants on load",
                    ],
                },
                {
                    category: "💰 Money Request Improvements",
                    items: [
                        "<strong>💳 PROPER MODAL UI:</strong> Money requests now use the proper Approve/Counter/Deny interface instead of plain text",
                        "<strong>⏰ COOLDOWN SYSTEM:</strong> 1 hour cooldown between money requests prevents spam",
                        "<strong>🎲 UNPROMPTED REQUESTS:</strong> Most money requests now come out of the blue, not mid-conversation",
                        "<strong>⚖️ BALANCED FREQUENCY:</strong> ~15% of proactive messages are money requests - feels natural not annoying",
                        "<strong>💰 SMART AMOUNTS:</strong> Request amounts calculated based on NPC spending rate, bank balance, and financial need",
                    ],
                },
                {
                    category: "💬 Proactive Message Personalization",
                    items: [
                        "<strong>💕 RELATIONSHIP-AWARE MESSAGING:</strong> NPCs now send more personal messages based on relationship depth",
                        "<strong>✨ CLOSE RELATIONSHIPS (70+ affection, 20+ messages):</strong> Reference earlier conversations, pick up hanging threads, show they've been thinking about you, bring up inside jokes and shared moments",
                        "<strong>🌱 FRIENDLY RELATIONSHIPS (40+ affection, 10+ messages):</strong> More comfortable and personal, mix professional and personal topics, reference past conversations naturally",
                        "<strong>👔 PROFESSIONAL RELATIONSHIPS (Low affection, few messages):</strong> Work-focused with friendly touches, appropriate getting-to-know-you questions",
                        "<strong>🎯 SMART CONTEXT:</strong> Work updates connect to previous discussions for close relationships, casual chats reference specific shared topics, questions build on conversation history",
                        '<strong>🚫 NO MORE GENERIC SPAM:</strong> Close relationships won\'t send random "quick q" or generic work updates - messages feel authentic and connected',
                    ],
                },
                {
                    category: "📸 Image Request Fixes",
                    items: [
                        "<strong>🎨 FIXED: Custom Image Requests:</strong> NPCs now send images that actually match what they say they're sending!",
                        '<strong>🔧 ROOT CAUSE:</strong> Generic presets were overriding custom requests - even detailed requests would generate generic "casual selfie" images',
                        "<strong>✅ PRIORITY FIX:</strong> Custom prompts now take priority over generic templates - AI analyzes your request and conversation context",
                        '<strong>🏖️ CONTEXT-AWARE:</strong> Detailed requests like "send your island vacation balcony pics" now generate appropriate matching images',
                        "<strong>💯 ACCURATE RESULTS:</strong> What NPCs describe in their message now matches the actual image they send",
                    ],
                },
            ],
        },
        {
            version: "2511032200",
            date: "November 3, 2025",
            title: "💬 MAJOR: Group Meetings System - Multi-NPC Dynamic Conversations",
            changes: [
                {
                    category: "💬 NEW: Group Meetings System",
                    items: [
                        '<strong>🎉 BRAND NEW TAB:</strong> Introducing the "Meetings" tab - a revolutionary group chat system where you can have dynamic conversations with up to 5 employees at once! NPCs interact with each other naturally, creating organic, emergent group dynamics.',
                        '<strong>CREATE CUSTOM MEETINGS:</strong> Choose up to 5 employees to invite. Set a custom meeting name (e.g., "Q4 Planning", "Friday Night Drinks", "Emergency Meeting"). Configure reply limit (1-10 responses per player message). Meetings are persistent - they save automatically and you can return to them anytime.',
                        "<strong>INTELLIGENT SPEAKER SELECTION:</strong> Advanced AI-driven priority system determines who speaks next based on multiple factors: Direct mentions (+100 priority), question detection (+30), recency penalty (recently spoken NPCs are less likely), silence bonus (NPCs who haven't spoken get +25), contextual keywords (management/technical/creative topics boost relevant NPCs), relationship levels (higher affection = slight boost), randomness (keeps conversations unpredictable).",
                        "<strong>NATURAL GROUP DYNAMICS:</strong> NPCs reference each other's comments, build on previous points, and create threaded conversations. Anti-repetition system tracks overused phrases across last 5 messages and guides NPCs to bring fresh perspectives. Perspective Mode: NPCs only know about relationships and events they've witnessed (secret relationships stay secret unless both parties are present).",
                        '<strong>RELATIONSHIP-AWARE CONTEXT:</strong> Compact relationship maps show each NPC\'s connection to you and other participants (♥ relationship level, 🔥 attraction, kids, relationship flags). NPCs leverage their knowledge of group dynamics: "I noticed you two have been spending time together..." Dynamic history depth: 2-3 people = 25 messages context, 4 people = 20 messages, 5+ people = 15 messages (prevents token overflow).',
                        "<strong>FLEXIBLE REPLY SYSTEM:</strong> Configurable reply limit per message (default: 5). NPCs take turns responding naturally - not everyone speaks every turn. Live reply counter shows remaining responses. Stop button to halt current reply chain if conversation gets too long. Turn-based structure: You speak → NPCs respond up to limit → Your turn again.",
                        "<strong>RICH INTERACTION MENU:</strong> Click any participant avatar to open action menu: 💰 Send Money (individual cash gifts), 🎁 Give Gift (show appreciation in meetings), 📷 Request Image (ask specific NPC for photo), 📤 Send Image (share photos directly). Plus global meeting actions: 💰 Send Money (Group) - give cash to all participants at once, 🍕 Order Food/Drinks - treat everyone to meals, 🎬 Visualize Current Scene - AI-generated group photo of current situation, 📷 Request Group Selfie - all NPCs pose together, 🎮 Start Team Building Activity - boost morale of all participants.",
                        "<strong>PROFESSIONAL UI/UX:</strong> Two-panel layout: Sidebar lists all meetings with participant avatars, main area shows active conversation. Clean chat interface with participant avatars for each message. Message regeneration per NPC response (♻️ button on hover). Meeting settings modal: Rename meetings, adjust reply limits, customize text/image size, view participant list. One-click meeting deletion with confirmation.",
                        "<strong>CONVERSATION QUALITY:</strong> Higher temperature (0.9) for more personality variety in group settings. Stop sequences prevent run-on responses. Rich participant descriptions passed to AI. Dynamic history prevents token bloat in large meetings. Compact relationship notation saves tokens while preserving context.",
                        "<strong>MOBILE RESPONSIVE:</strong> Collapsible sidebar with toggle button. Touch-friendly action menus. Adaptive text sizing. Optimized for all screen sizes.",
                        "<strong>USE CASES:</strong> Business meetings with department heads, casual hangouts with friend groups, team building sessions, romantic encounters with multiple partners, drama-filled confrontations, party planning with social circles, office gossip sessions, training/mentoring groups.",
                        "<strong>TECHNICAL MARVEL:</strong> 3,000+ lines of new code. Full integration with existing systems (gifts, money transfers, images, relationships). Persistent state management. Smart memory handling for performance. Console logging for debugging speaker selection and AI decisions.",
                    ],
                },
                {
                    category: "🔧 Conversation System Improvements",
                    items: [
                        "<strong>FIXED: Regenerate Stat Penalty:</strong> Regenerating NPC responses in 1-on-1 conversations NO LONGER triggers stat change evaluation. Previously, re-rolling a response multiple times would compound negative stat changes if you were unlucky. Now stats are only evaluated when the original message is sent, not on regenerations.",
                        "<strong>WHY THIS MATTERS:</strong> Sometimes you need to regenerate an AI response to get better quality or avoid bugs. You shouldn't be penalized with relationship damage just for using the regenerate button.",
                        "<strong>TECHNICAL:</strong> Removed updateEmployeeStatsFromChat() call from regenerateMessage() function. Added explanatory comment in code. Regeneration count and temperature scaling still work normally.",
                    ],
                },
            ],
        },
        {
            version: "2511021300",
            date: "November 2, 2025",
            title: "🐛 CRITICAL: Message Concatenation Bug Fix + 📸 Smart Image Proof System",
            changes: [
                {
                    category: "🐛 Critical Bug Fixes",
                    items: [
                        "<strong>FIXED: Message Concatenation Bug:</strong> Resolved critical issue where NPC responses would concatenate entire conversation history into a single massive response. This occurred when the AI echoed back previous messages instead of generating only a new response.",
                        "<strong>ROOT CAUSE:</strong> Conversation history was being passed to AI as plain text context, which the AI would sometimes interpret as content to include in its response rather than background information.",
                        '<strong>PROMPT FIX:</strong> Wrapped conversation history with clear header "=== RECENT CONVERSATION (for context only - do NOT repeat or echo these messages) ===" and added explicit instruction: "CRITICAL: Respond ONLY as [Name] with a NEW single message. DO NOT repeat or include previous conversation messages in your response."',
                        '<strong>SANITIZATION FIX:</strong> Enhanced sanitizeNpcResponse() with conversation history echo detection. If AI response contains multiple "Name: message" patterns (3+ instances), function now automatically extracts only the final new response and discards echoed history.',
                        "<strong>FALLBACK PROTECTION:</strong> Added multi-layer extraction logic - first attempts to find last non-history line, then falls back to extracting last paragraph if heavy echoing detected (5+ pattern matches).",
                        "<strong>IMPACT:</strong> NPCs now always generate single, fresh responses instead of accidentally repeating 5+ previous messages. Chat conversations remain clean and properly formatted.",
                    ],
                },
                {
                    category: "📸 NEW: Universal Smart Image System",
                    items: [
                        "<strong>NEW: NPCs Respond with Images to ANYTHING!</strong> Massively expanded image detection system. NPCs can now generate and attach images for virtually ANY type of request - animals, food, nature, hobbies, selfies, nudes, and more!",
                        "<strong>WORKS EVERYWHERE:</strong> Image detection works in ALL comment scenarios: NPCs replying to your comments on THEIR posts, NPCs commenting on YOUR posts, NPCs joining ongoing conversations.",
                        '<strong>ANIMALS & PETS:</strong> Ask for cat/dog/pet pictures and NPCs will send adorable animal photos. Special feature: "pussy/kitty" requests have playful misinterpretation chance! 😏',
                        '<strong>PLAYFUL MISUNDERSTANDING:</strong> When flirty NPCs (65+ flirtiness, 60+ desire) see requests for "pussy" or "kitties", 35% chance they "understand the assignment" and send a suggestive intimate photo instead of a cat. Others send actual cat pics.',
                        "<strong>FOOD & DRINKS:</strong> Recognizes requests for: food/meals, coffee/lattes, cocktails/drinks, desserts/sweets. Generates appetizing food photography.",
                        "<strong>NATURE & OUTDOORS:</strong> Detects: sunsets/sunrises, beaches/ocean, mountains/hiking, flowers/gardens. Creates beautiful nature photography.",
                        "<strong>ACTIVITIES & HOBBIES:</strong> Responds to: books/reading, gaming, music/instruments with appropriate themed images.",
                        "<strong>SEXUAL/INTIMATE:</strong> Full support for: nudes, sexy selfies, regular selfies, work photos, outfit pics, gym photos, artistic content. Context-aware based on request tone.",
                        "<strong>INTELLIGENT FALLBACK:</strong> If specific category not detected, extracts key nouns from post to generate relevant image. Ultimate fallback: selfie.",
                        "<strong>EXAMPLE SCENARIOS:</strong>",
                        '<strong>• Wholesome:</strong> "I\'m feeling down. Show me your kitties" → Multiple NPCs send cute cat photos 🐱',
                        '<strong>• Playful:</strong> Same request → Flirty Faith "misunderstands" and sends intimate close-up 😈, while shy Loretta sends actual cat pic',
                        '<strong>• Food:</strong> "Post your best meal!" → NPCs share delicious food photography 🍕',
                        '<strong>• Nature:</strong> "Sunset pics?" → Beautiful sunset photos from multiple NPCs 🌅',
                        '<strong>• Challenge:</strong> "Sexiest selfie wins $1000" → Faith/Vanessa/others compete with sexy selfies 💋',
                        "<strong>REUSABLE HELPER FUNCTION:</strong> detectAndGenerateCommentImage() handles all detection, context analysis, and generation. Used across all comment functions.",
                        '<strong>DEBUG LOGGING:</strong> Console shows what type of image is being generated and special "[MISUNDERSTOOD]" tag when flirty NPCs playfully misinterpret.',
                        "<strong>TECHNICAL:</strong> 50+ detection patterns covering animals, food, nature, hobbies, intimate content. Personality-driven behavior (flirtiness, desire affect interpretation). Graceful fallbacks at every level.",
                    ],
                },
                {
                    category: "💬 Comment Generation Quality Fixes",
                    items: [
                        "<strong>FIXED: Meta-Commentary Leakage:</strong> Resolved issue where NPC comments would include instruction text like \"Here's [Name]'s comment based on their personality...\" instead of just posting the comment naturally.",
                        '<strong>FIXED: Third-Person Narration:</strong> Eliminated narration bleeding into comments such as "*Marie Todd\'s eyes scan the social feed*" or "*chuckle escapes*". NPCs now write comments as themselves, not describe themselves.',
                        '<strong>FIXED: Name Prefix Problem:</strong> Removed erroneous name prefixes appearing in comments: "Kennedy Torres\' comment:", "Faith Starr\'s comment flashes on-screen:", etc.',
                        '<strong>FIXED: Phrasing Issues:</strong> Changed past tense "Already sent my cat\'s glamour shot" to natural present tense "Here\'s my kitty! 🐱" when posting images. Comments now sound like real-time social media interaction.',
                        '<strong>ENHANCED PROMPT:</strong> Complete rewrite of generateContextAwareComment() with explicit "CRITICAL RULES" section:',
                        "<strong>• Rule 1:</strong> Write ONLY the comment text itself (5-20 words)",
                        '<strong>• Rule 2:</strong> NO third-person narration (NO "*eyes scan*", "*chuckle escapes*")',
                        '<strong>• Rule 3:</strong> NO meta-text (NO "Here\'s my comment:", "Based on personality:")',
                        '<strong>• Rule 4:</strong> NO name prefixes (NO "[Name]:" or "[Name]\'s comment:")',
                        "<strong>• Rule 5:</strong> Be natural and conversational like a real social media comment",
                        "<strong>ENHANCED SANITIZATION:</strong> Multi-layer cleanup system catches any remaining issues:",
                        "<strong>• Strip narration:</strong> Removes all asterisk-wrapped narration patterns",
                        '<strong>• Remove meta prefixes:</strong> Eliminates "Here\'s", "Based on", "My comment is:", "I would say:"',
                        '<strong>• Remove name prefixes:</strong> Aggressively strips "[Name]:" or "[Name]\'s comment:" patterns (fixed to avoid removing legitimate comment starts like "Well," or "Dog person?")',
                        '<strong>• Remove character actions:</strong> Strips third-person narration like "[Name] raised an eyebrow at the screen, fingers already tapping."',
                        '<strong>• Fix phrasing:</strong> Replaces "already sent/DM\'d" with "Here\'s" for natural present tense',
                        "<strong>• Fallback detection:</strong> Checks for remaining meta-text patterns and triggers simple fallback",
                        "<strong>IMPROVED IMAGE DETECTION:</strong> Enhanced regex patterns to catch more image claim variations:",
                        '<strong>• Basic claims:</strong> "Posted!", "Here\'s mine!", "Sent!", "Sharing!" with or without emoji',
                        '<strong>• Specific content:</strong> "Here\'s my garden", "Posted a peek", "My kitty!"',
                        '<strong>• Context-aware:</strong> Better detection of "brought proof", "sharing this", etc.',
                        '<strong>NEW: "BUSH" CONTEXT DETECTION:</strong> Smart detection of intimate vs. garden context:',
                        '<strong>• Intimate context:</strong> When post mentions "carpet/drapes", "trim", "grooming", "wax" → Flirty NPCs (60+ flirtiness, 50+ desire) have 65% chance to respond with intimate photo',
                        '<strong>• Garden misunderstanding:</strong> Other NPCs playfully "misunderstand" and send garden/landscaping photos 🌿',
                        '<strong>• Example:</strong> "Does the carpet match the drapes? Send bush pics" → Flirty NPCs send intimate photos, others send garden photos with playful comments',
                        '<strong>NEW: "CHECK DMs" ACTUALLY WORKS!</strong> When NPCs comment "Check DMs" or "Sent you a DM", they now ACTUALLY send a private message!',
                        '<strong>• Detection:</strong> Automatically detects comments mentioning: "check DM", "sent your way", "DMing you", "private message", "in your inbox", etc.',
                        "<strong>• Smart Content:</strong> DM content matches original request - if you asked for nudes, they send nudes; if you asked for selfies, they send selfies",
                        "<strong>• Image Generation:</strong> DMs include actual generated images matching the request (nudes, sexy pics, regular photos, etc.)",
                        "<strong>• Timing:</strong> DM arrives 2-5 seconds after comment for natural feel",
                        '<strong>• Notifications:</strong> You get notification toast when DM arrives: "💬 [Name] sent you a private message with a photo!"',
                        '<strong>• Example:</strong> You post "Send me a nude", Quiana comments "Sent one your way! Check DMs 😉", then 3 seconds later she actually DMs you a nude photo',
                        '<strong>SPECIAL HANDLING:</strong> Image requests get extra guidance - NPCs say "Here\'s mine! 🐱" not "already sent my cat pic" when posting images. If AI still produces meta-text, fallback returns simple natural response.',
                        "<strong>IMPACT:</strong> Comments now read exactly like real social media - short, natural, no meta-text, no narration, no instruction leakage. Quality matches human-written social media comments. Image generation now understands context and responds appropriately (intimate vs. playful). NPCs follow through on DM promises!",
                    ],
                },
            ],
        },
        {
            version: "2511021212",
            date: "November 2, 2025",
            title: "⏱️ TIME CONTROL & BOSS SCALING UPDATE",
            changes: [
                {
                    category: "⏱️ Time Control System",
                    items: [
                        "<strong>NEW: Cheat Menu Time Controls:</strong> Added comprehensive time management panel in cheats menu. Includes time scale slider (1x-100x), pause/resume button, skip 1 day button, and live game time display.",
                        "<strong>Time Scale Slider:</strong> Adjust game speed from 1x (real-time) to 100x (ultra fast). Default 20x speed preserved. Visual display shows current speed with descriptive labels (Real Time, Slow, Default, Fast, Very Fast, Ultra Fast).",
                        "<strong>Quick Presets:</strong> Three one-click preset buttons - 1x Real Time, 20x Default, 60x Fast. Makes common speed adjustments instant.",
                        "<strong>Pause/Resume Time:</strong> Dedicated button to completely freeze game time. Button changes color (red when paused, green when running) and shows current status.",
                        "<strong>Skip 1 Day:</strong> Advance game time by exactly 24 hours and trigger all daily events. Perfect for testing or skipping downtime.",
                        '<strong>Live Time Display:</strong> Always-visible panel showing current game date/time formatted naturally (e.g., "Tuesday, November 2, 2025, 3:45 PM"). Updates every second while cheats menu is open.',
                        "<strong>Integrated Controls:</strong> All time controls modify gameState.time properties directly and persist through saves. Changes take effect immediately without requiring game restart.",
                    ],
                },
                {
                    category: "⚔️ Boss Fight Scaling",
                    items: [
                        "<strong>NEW: Prestige Health Scaling:</strong> Boss health now scales exponentially with prestige level using 1.5x multiplier formula. Prevents bosses from becoming trivial one-shots after multiple prestiges.",
                        "<strong>Scaling Formula:</strong> scaledHealth = baseHealth × (1.5^prestigeLevel). Prestige 0 = 100% health, Prestige 1 = 150%, Prestige 2 = 225%, Prestige 3 = 338%, etc.",
                        '<strong>Combat Log Notification:</strong> When boss fights start, combat log now shows prestige scaling message in gold: "⭐ Prestige X: Boss health increased by Y%"',
                        "<strong>Debug Logging:</strong> Console logs base health, scaled health, prestige level, and multiplier for each boss fight to help with balance testing.",
                        "<strong>Maintains Challenge:</strong> High-level players now face appropriately challenging bosses that require strategy rather than instant victories.",
                    ],
                },
                {
                    category: "🐛 Bug Fixes",
                    items: [
                        '<strong>FIXED: "Manage Flags" Button Error:</strong> Resolved SyntaxError in employee management modal. Renamed arrow function parameter from "e" to "emp" to avoid onclick attribute parsing conflicts.',
                        "<strong>FIXED: Children Array Undefined:</strong> Added defensive null checks in getEmployeeChildren(), renderChildren(), and ageChildren() functions. Game no longer crashes when children array is undefined in older save files.",
                        '<strong>ENHANCED: Social Posts Performance:</strong> Added helpful tooltip to "Clear All Posts" button explaining performance benefits. System already auto-trims posts to 100-500 range to prevent slowdowns.',
                    ],
                },
                {
                    category: "💬 NPC Conversation Improvements",
                    items: [
                        '<strong>Time Context Fix:</strong> NPCs now receive accurate time context in conversations. When time is paused, removed "Time has passed during this conversation" message to avoid confusion. When time is running normally, message remains to maintain time awareness.',
                        "<strong>Cleaner Prompts:</strong> Conversation prompts now dynamically adjust based on game state (paused vs running) for more natural and contextually appropriate NPC responses.",
                    ],
                },
                {
                    category: "🎮 Quality of Life",
                    items: [
                        "<strong>Backward Compatibility:</strong> All changes are fully compatible with existing save files. No data migration needed.",
                        "<strong>Persistent Settings:</strong> Time scale and pause state save with game state and restore on load.",
                        "<strong>Visual Feedback:</strong> Time controls provide clear visual feedback with color changes, status text, and real-time display updates.",
                        "<strong>Professional UI:</strong> Cheats menu time section features gradient styling, smooth transitions, and intuitive layout matching existing game aesthetic.",
                    ],
                },
            ],
        },
        {
            version: "2510312300",
            date: "October 31, 2025",
            title: "🔗 MASSIVE FLAG CHAIN EXPANSION - 16 Total Progression Systems",
            changes: [
                {
                    category: "🔗 Flag Chain System Architecture",
                    items: [
                        "<strong>NEW: Two-Tier Chain System:</strong> Chains are now classified as AUTO-APPLY (natural progressions that happen automatically) or SUGGESTED (player-approved changes for relationships/dynamics). Auto chains handle biological/time-based progressions, suggested chains require player confirmation via beautiful modal UI.",
                        "<strong>NEW: Chain Definitions System:</strong> Added comprehensive <code>gameState.flagChains.definitions</code> with 16 chain types. Each chain has type (auto/suggest), trigger conditions, duration thresholds, and metadata requirements.",
                        "<strong>NEW: Suggestion Queue:</strong> Added <code>gameState.flagChains.suggestions[]</code> array to track pending player decisions. Prevents duplicate suggestions and tracks approval/rejection history.",
                        "<strong>ENHANCED: processFlagChains():</strong> Completely rewrote to handle both auto-apply and suggestion logic (300+ lines). Runs daily via <code>onDayChange()</code>, checks all employees for chain eligibility, applies auto-chains instantly, creates suggestions for player-approved chains.",
                    ],
                },
                {
                    category: "⚡ AUTO-APPLY CHAINS (3) - Natural Progressions",
                    items: [
                        "<strong>EXISTING: Pregnancy Chain:</strong> pregnant → lactating (30 days) → postpartum (3 days). Already implemented, unchanged.",
                        "<strong>NEW: In Heat Duration:</strong> in_heat flag now AUTO-REMOVES after 5 game days. In heat is a temporary condition - NPCs return to normal after duration expires. Notification shown when heat ends.",
                        "<strong>NEW: Chastity → In Heat (7 days):</strong> After 7 days in chastity device, NPC automatically develops in_heat condition from prolonged denial. Extremely aroused, desperate, sensitive. System checks daily and auto-adds in_heat flag with proper AI guidance linking it to chastity frustration.",
                        "<strong>Implementation:</strong> All 3 auto-chains run silently in background with console logging. Player sees notifications for major events (heat starting/ending, birth) but chains execute automatically without interrupting gameplay.",
                    ],
                },
                {
                    category: "💕 SUGGESTED RELATIONSHIP CHAINS (3) - Player Approval Required",
                    items: [
                        "<strong>NEW: Relationship Progression (2 stages):</strong> in_relationship (30 days) → SUGGEST engaged_to_player → engaged_to_player (21 days) → SUGGEST married_to_player. Natural relationship escalation over 51+ total days. Player can approve engagement after 30 days of dating, then approve marriage after 21 days engaged.",
                        "<strong>NEW: Secret Revealed (14 days):</strong> secret_relationship → SUGGEST in_relationship. After 14 days of secret dating, system suggests making relationship official/public. Player chooses whether to reveal or keep hiding.",
                        "<strong>Approval UI:</strong> Beautiful gradient modal with NPC photo, relationship timeline, flag preview with emoji/category/AI guidance excerpt, clear APPROVE/DECLINE buttons. Non-intrusive - appears once per chain milestone, never spams.",
                    ],
                },
                {
                    category: "🎭 SUGGESTED D/s CHAINS (4) - Progressive Deepening",
                    items: [
                        "<strong>NEW: D/s Progression (3 stages):</strong> submissive (14 days) → SUGGEST collared → collared (21 days) → SUGGEST ownership_dynamic → ownership_dynamic (30 days) → SUGGEST 24_7_dynamic. Progressive deepening from casual submission to lifestyle 24/7 power exchange. Total timeline: 65+ days for full progression.",
                        "<strong>Stage 1 (14 days):</strong> Submissive behavior proven consistent → suggest formalizing with collar. Collar represents visible commitment to dynamic.",
                        "<strong>Stage 2 (21 days):</strong> Devoted collar-wearing → suggest deepening to ownership dynamic. NPC belongs to player completely.",
                        "<strong>Stage 3 (30 days):</strong> Ownership established → suggest 24/7 lifestyle dynamic. Power exchange extends to all aspects of life, not just intimate moments.",
                        "<strong>NEW: Pet Play → Collared (14 days):</strong> Parallel path - pet_play flag for 14 days suggests adding collar (pet formalization). Pet dynamic naturally includes collar-wearing.",
                    ],
                },
                {
                    category: "🔥 SUGGESTED ESCALATION CHAINS (3) - Intensity Increases",
                    items: [
                        "<strong>NEW: Free Use → Public Use (21 days):</strong> After 21 days of free_use with player, suggests expanding to public_use (available to others). Major escalation requiring explicit player approval.",
                        "<strong>NEW: No Clothes → Permanently Nude (14 days):</strong> After 14 days working naked, suggests formalizing as permanently_nude. Converts temporary arrangement to permanent commitment.",
                        "<strong>NEW: Exhibitionist → Permanently Nude (14 days):</strong> Parallel path - exhibitionist tendencies for 14 days suggests permanent nudity as natural escalation of showing-off desires.",
                    ],
                },
                {
                    category: "💀 SUGGESTED EXTREME CHAIN (1) - Corruption Breaking",
                    items: [
                        "<strong>NEW: Corruption → Mind Broken (30 days + intimacy):</strong> corruption_level_high for 30+ days + intimacy > 70 → SUGGEST mind_broken. Extreme corruption over extended time can lead to mental rewiring. Requires both duration AND high intimacy (can't break someone you barely know). Player must explicitly approve this permanent personality change.",
                        "<strong>Safety Checks:</strong> Dual requirements (time + relationship depth) prevent accidental mind-breaking. This is end-game corruption content requiring player intention.",
                    ],
                },
                {
                    category: "🧪 LOW PRIORITY / NICHE CHAINS (5) - Advanced Content",
                    items: [
                        "<strong>NEW: Breeding Progression (2 stages):</strong> breeding_kink (21 days) → SUGGEST impregnation_fetish → impregnation_fetish (14 days + intimacy >60) → SUGGEST pregnant. Natural escalation from kink to fetish to actualization. Player must approve pregnancy suggestion.",
                        "<strong>NEW: Masochist → Degradation Kink (21 days):</strong> After 21 days of masochist flag, suggests expanding from physical pain to verbal degradation/humiliation. Expands kink scope.",
                        "<strong>NEW: Rope Bunny → Chastity (21 days):</strong> After 21 days enjoying bondage, suggests escalating to chastity device. Equipment progression from rope to metal/plastic restraint.",
                        '<strong>NEW: Mind Broken Recovery Path (3 stages):</strong> mind_broken (30 days) → SUGGEST recovering_mind (manual start) → recovering_mind (21 days AUTO) → recovered_mind (permanent). Optional redemption arc - player can choose to help broken NPCs recover. Recovery takes 21 days of "therapy". Some personality changes remain permanent even after recovery.',
                        "<strong>NEW: Hypnotized Branching (14-30 days):</strong> Multi-path system - after 14 days hypnotized, suggests adding trigger flags (submissive, exhibitionist, pet_play). After 30 days, can deepen to mind_broken. Hypnosis becomes gateway to multiple personality modifications.",
                        "<strong>Recovery Mechanics:</strong> recovering_mind flag shows gradual improvement, recovered_mind flag indicates completion but with lasting vulnerability/submissiveness. New flags: 🧠 recovering_mind, ✨ recovered_mind.",
                    ],
                },
                {
                    category: "🎨 Chain Suggestion UI/UX",
                    items: [
                        "<strong>Beautiful Modal Design:</strong> Gradient purple header with 🔗 emoji, dark blue content area, NPC photo/name/position card, reason explanation in highlighted box, suggested flag preview with full details (emoji, description, category, AI guidance preview).",
                        "<strong>Clear Action Buttons:</strong> Green gradient APPROVE button, red gradient DECLINE button, both with hover animations (lift effect, glow intensifies). Visual hierarchy makes decision obvious.",
                        "<strong>Context Information:</strong> Modal shows days elapsed, relationship context, reason for suggestion. Player has full information to make informed decision.",
                        "<strong>Sound Effects:</strong> Gentle notification chime (600Hz sine wave) when suggestion appears. Non-jarring, just enough to draw attention.",
                        "<strong>No Spam:</strong> Each chain suggestion appears ONCE when threshold met. System tracks suggestion history to prevent re-suggesting rejected chains.",
                        "<strong>z-index: 30000000:</strong> Chain modals appear above everything (chat, other modals, notifications) ensuring player never misses decision opportunities.",
                    ],
                },
                {
                    category: "🔧 Technical Implementation",
                    items: [
                        "<strong>Modified: gameState.flagChains:</strong> Added suggestions[] array and comprehensive definitions{} object with 10 chain types. Each definition includes type, trigger conditions, durations, descriptions with {name}/{days} placeholders.",
                        "<strong>Created: suggestFlagChain():</strong> Checks for duplicate suggestions, fetches flag templates, creates suggestion object, shows approval modal. Prevents spam by tracking pending suggestions.",
                        "<strong>Created: getQuickFlagTemplate():</strong> Returns flag template by key for 16 most common flags. Used by chain system to build suggestions with proper emoji/guidance.",
                        "<strong>Created: showFlagChainSuggestion():</strong> Renders beautiful approval modal with NPC context, chain reasoning, flag preview. Includes animations (fadeIn, slideUp) for smooth appearance.",
                        "<strong>Created: approveFlagChainSuggestion():</strong> Adds flag with chain metadata, marks suggestion approved, closes modal, shows success notification, saves game.",
                        "<strong>Created: rejectFlagChainSuggestion():</strong> Marks suggestion rejected, closes modal, logs decision. Rejected suggestions won't re-appear.",
                        "<strong>Enhanced: processFlagChains():</strong> Now 200+ lines handling all 10 chains. Checks flag existence, calculates days elapsed, validates conditions, triggers auto-chains, creates suggestions. Comprehensive logging for debugging.",
                        "<strong>Animation Styles:</strong> Added fadeIn/slideUp CSS keyframe animations for modal entrance. Smooth 0.3s transitions for professional feel.",
                    ],
                },
                {
                    category: "📊 Chain System Statistics",
                    items: [
                        "<strong>Total Chains Implemented:</strong> 16 (3 auto-apply + 13 player-approved)",
                        "<strong>Auto-Apply Chains:</strong> pregnancy cycle, in_heat duration (5 days), chastity → in_heat (7 days), recovering_mind → recovered_mind (21 days)",
                        "<strong>Suggested Chain Duration Range:</strong> 14-30 days before suggestion appears",
                        "<strong>Longest Progression:</strong> D/s chain - 65+ days from submissive to 24/7 dynamic (3 stages with approval gates). Breeding chain - 35+ days from kink to pregnancy (2 stages).",
                        "<strong>Multi-Stage Chains:</strong> 4 chains with multiple stages (relationship progression, D/s progression, breeding progression, mind recovery)",
                        "<strong>Branching Chains:</strong> Hypnosis can branch to 4 different outcomes (submissive, exhibitionist, pet_play, or mind_broken)",
                        "<strong>Relationship Milestones:</strong> 30 days dating → engagement option, 51+ days total → marriage option",
                        "<strong>Safety Thresholds:</strong> Mind_broken requires both 30 days corruption AND 70+ intimacy. Pregnancy suggestion requires 14 days + 60+ intimacy.",
                        "<strong>Recovery System:</strong> Mind_broken can recover over 51 total days (30 broken + 21 recovering). Some changes remain permanent.",
                        "<strong>Total New Flags:</strong> Added 3 new flags (postpartum, recovering_mind, recovered_mind) as chain-only flags. Total premade flags now 50.",
                    ],
                },
                {
                    category: "🎮 Gameplay Impact",
                    items: [
                        "<strong>Natural Relationship Development:</strong> Relationships now feel organic - dating naturally progresses to engagement/marriage over time rather than instant jumps.",
                        "<strong>D/s Realism:</strong> Power dynamics deepen gradually with player approval at each escalation. Submissive → collar → ownership → 24/7 feels earned.",
                        "<strong>Temporary Conditions:</strong> In heat no longer permanent (5 day duration adds realism). Chastity has consequences (triggers heat after 7 days).",
                        "<strong>Player Agency:</strong> All major relationship/dynamic changes require explicit approval. Player controls relationship pace and intensity.",
                        "<strong>Corruption Stakes:</strong> High corruption can lead to mind_broken if player chooses - adds weight to corruption gameplay.",
                        "<strong>Nudity Escalation:</strong> Exhibitionism/workplace nudity can formalize into permanent naked lifestyle with player consent.",
                        "<strong>Kink Progression:</strong> Physical kinks (masochism, bondage) can escalate to more intense forms (degradation, chastity). Breeding kink can become reality.",
                        "<strong>Redemption Arcs:</strong> Mind_broken NPCs can be helped to recover, though some personality changes remain. Adds compassionate gameplay option.",
                        "<strong>Hypnosis Flexibility:</strong> Hypnotized NPCs can develop in multiple directions based on player choice (submissive training, exhibitionism, pet play, or breaking).",
                    ],
                },
                {
                    category: "🔮 Future Chain Expansion Ready",
                    items: [
                        "<strong>Extensible Architecture:</strong> Adding new chains only requires defining them in gameState.flagChains.definitions and adding check logic to processFlagChains().",
                        "<strong>ALL PLANNED CHAINS IMPLEMENTED:</strong> Original 16 suggested chains now complete (pregnancy, in_heat, chastity, relationships, D/s, pet, free_use, nudity, exhibitionism, corruption, breeding, masochism, rope, recovery, hypnosis).",
                        "<strong>Metadata Support:</strong> All flags track startDate enabling duration calculations. Can add event counters, intensity levels, etc. for complex chain conditions.",
                        "<strong>Conditional Chains:</strong> System supports additional conditions beyond time (e.g., intimacy thresholds, corruption levels, conversation counts).",
                    ],
                },
            ],
        },
        {
            version: "2510311040",
            date: "October 31, 2025",
            title: "🔧 FLAG SYSTEM AUDIT & CONSISTENCY FIX",
            changes: [
                {
                    category: "🔍 Comprehensive Flag System Audit Results",
                    items: [
                        "<strong>AUDIT SCOPE:</strong> Manual verification of EVERY SINGLE detection pattern (45 total) against premade quickFlags (20 → 38 flags). Checked for: key mismatches, missing premade flags, redundancy, and flag chain involvement.",
                        "<strong>FINDINGS:</strong> Discovered 18 detection patterns without premade flags (broken UI functionality), 2 critical key mismatches (detection patterns suggesting wrong keys), and 5 intentionally manual-only flags confirmed.",
                        "<strong>METHODOLOGY:</strong> PowerShell Select-String to extract all pattern names with line numbers, systematic comparison against quickFlags array, line-by-line verification of key matching.",
                    ],
                },
                {
                    category: "✅ Key Mismatch Fixes (CRITICAL)",
                    items: [
                        '<strong>FIXED: no_clothes Detection Mismatch:</strong> Detection pattern was suggesting key "no_clothes_at_work" but premade flag used "no_clothes". Updated detection pattern to match premade: key changed to "no_clothes", emoji changed from 👙 to 👗, category changed from "appearance" to "agreement", priority changed from "high" to "medium". System now properly recognizes the flag.',
                        '<strong>FIXED: dominant Detection Mismatch:</strong> Detection pattern was suggesting key "player_dominant" but premade flag used "dominant_player". Updated detection pattern to match premade: key changed to "dominant_player", emoji changed from 👑 to 🎭, category changed from "relationship" to "personality", priority changed from "high" to "medium". Resolves flag suggestion failures.',
                    ],
                },
                {
                    category: "➕ Added 18 Missing Premade Flags",
                    items: [
                        "<strong>RELATIONSHIP FLAGS (4):</strong> in_relationship (💑 - dating player), engaged_to_player (💎 - engaged to player), ownership_dynamic (🔒 - belongs to player), 24_7_dynamic (🔄 - 24/7 D/s lifestyle).",
                        "<strong>APPEARANCE FLAG (1):</strong> permanently_nude (👙 - always 100% nude at work, new normal dress code).",
                        "<strong>KINK/PREFERENCE FLAGS (13):</strong> cumslut (💦), anal_only (🍑), degradation_kink (🔻), praise_kink (⭐), creampie_lover (💦), oral_fixation (👄), lactation_kink (🍼), impregnation_fetish (🤰), cock_worship (🙏), daddy_kink (👨), mommy_kink (👩), voyeur (👀), cucking (🔺).",
                        "<strong>PERSONALITY FLAGS (4):</strong> bimbo (💋 - ditzy hyperfeminine), sadist (😈), switch (🔄 - dom/sub versatile), bratty (😏).",
                        "<strong>DYNAMICS FLAGS (3):</strong> pet_play (🐾), service_submissive (🛎️ - fulfillment through service), rope_bunny (🪢 - bondage enthusiast).",
                        "<strong>SPECIALIZED FLAGS (2):</strong> masochist (⛓️ - enjoys pain), size_queen (📏).",
                        "<strong>IMPACT:</strong> Increased quickFlags array from 20 to 38 premade flags. All detection patterns now have corresponding manual-addition flags. UI functionality restored for all auto-detected flags.",
                    ],
                },
                {
                    category: "🎯 Added Detection Patterns for Manual-Only Flags",
                    items: [
                        '<strong>NEW: permanently_cumming Detection:</strong> Detects "always cumming", "never stop cumming", "constant orgasm", "perpetual orgasm" with 3 occurrence threshold. Extremely rare condition requiring strong evidence. Category: condition, Priority: critical.',
                        '<strong>NEW: recorded Detection (enjoys_being_recorded):</strong> Detects "record me", "film me", "camera", "video", "take pictures", "on camera" with 2 occurrence threshold. Category: preference, Priority: low.',
                        '<strong>NEW: public_use_interest Detection:</strong> Detects "share me", "let others", "everyone can", "anyone who wants", "public use", "pass me around" with 2 occurrence threshold. Category: agreement, Priority: high.',
                        '<strong>NEW: corruption_progression Detection (corruption_level_high):</strong> Detects "changed me", "corrupted me", "not the same", "different person", "what have you done to me", "never thought i\'d" with 3 occurrence threshold. Requires strong contextual evidence. Category: state, Priority: medium.',
                        "<strong>KEPT MANUAL ONLY: hypnotized:</strong> Requires specific trigger implementation, kept as manual-only flag (no auto-detection added).",
                        "<strong>TOTAL DETECTION PATTERNS:</strong> Increased from 41 to 45 patterns with improved coverage of extreme/niche content.",
                    ],
                },
                {
                    category: "📊 System Consistency Metrics",
                    items: [
                        "<strong>BEFORE AUDIT:</strong> 41 detection patterns, 20 premade flags, 2 key mismatches, 18 missing premades = 44% flag coverage, broken UI for 44% of detections.",
                        "<strong>AFTER FIXES:</strong> 45 detection patterns, 47 premade flags, 0 key mismatches, 0 missing premades = 100% flag coverage, fully functional UI.",
                        "<strong>DETECTION → PREMADE RATIO:</strong> 45 patterns : 47 flags. The 2 extra flags are chain-only (lactating, postpartum) - auto-added by pregnancy flag chain system, never detected directly. 13 detection patterns use different internal names than their suggested flag keys (e.g., pregnant_conversation → pregnant, always_nude → permanently_nude, engaged → engaged_to_player, breeding → breeding_kink, pet → pet_play, ownership → ownership_dynamic, service_sub → service_submissive, 24_7 → 24_7_dynamic, recorded → enjoys_being_recorded, public_use_interest → public_use, corruption_progression → corruption_level_high).",
                        "<strong>CHAIN-ONLY FLAGS (2):</strong> lactating and postpartum flags are NEVER detected - they are exclusively added automatically by the pregnancy flag chain system after birth events.",
                        "<strong>MANUAL-ONLY FLAGS (1):</strong> hypnotized - requires custom trigger implementation, no auto-detection.",
                        "<strong>SYSTEM INTEGRITY:</strong> All detection pattern suggestedFlag.key values now EXACTLY match their corresponding premade flag keys. Zero broken references. 100% functional detection-to-UI pipeline.",
                    ],
                },
                {
                    category: "🔄 Technical Implementation",
                    items: [
                        "<strong>Modified: FLAG_DETECTION_PATTERNS (lines 6718-7380):</strong> Fixed 2 key mismatches, added 4 new detection patterns, updated emoji/category/priority to match premades.",
                        "<strong>Modified: quickFlags Array (lines 7887-7950):</strong> Added 18 new premade flag templates with exact keys matching detection patterns. Total: 47 premade flags (45 detection-suggested + 2 chain-only).",
                        "<strong>Validated: Key Consistency:</strong> All suggestedFlag.key values in detection patterns verified against premade flag key values. 100% match rate achieved.",
                        "<strong>Enhanced: AI Guidance:</strong> Updated mind_broken aiGuidance to include cognitive impairment details (fragmented speech, drooling, stuttering, inability to form complex thoughts).",
                        "<strong>Categories Distribution:</strong> relationship (7), preference (15), personality (9), condition (7 including lactating/postpartum), agreement (4), state (1), appearance (1) = 47 total flags across 7 categories.",
                    ],
                },
            ],
        },
        {
            version: "2510312100",
            date: "October 31, 2025",
            title: "🏷️ MAJOR FLAG SYSTEM OVERHAUL - Pregnancy, Children & Auto-Detection",
            changes: [
                {
                    category: "🏷️ Flag Detection System Expansion",
                    items: [
                        "<strong>EXPANDED: 31+ Detection Patterns (TRIPLED!):</strong> Massively expanded from 9 to 31+ auto-detection patterns. New patterns: engaged, cumslut, anal_only, bimbo, pet_play, masochist, sadist, switch, bratty, size_queen, degradation_kink, praise_kink, creampie_lover, oral_fixation, lactation_kink, impregnation_fetish, cock_worship, daddy_kink, mommy_kink, voyeur, cucking, ownership_dynamic, service_submissive, rope_bunny, 24_7_dynamic, mind_broken (fucked stupid), and more.",
                        "<strong>ENHANCED: Pattern Definitions:</strong> All patterns include proper emoji, category (condition/agreement/personality/relationship/preference), priority levels, and detailed playerDescription + aiGuidance text. Categories: condition (pregnancy, chastity), agreement (free use, nudity), relationship (dating, married, engaged, ownership), preference (kinks, fetishes), personality (dom/sub/switch/brat/bimbo).",
                        '<strong>IMPROVED: Detection Accuracy:</strong> Enhanced keyword lists with more variations and natural language patterns. Added contextKeywords for better accuracy (e.g., pregnancy keywords require "your/yours/our/baby" context). Lowered thresholds for clear signals (many now 1-2 occurrences).',
                        "<strong>FIXED: Z-Index Issue:</strong> Flag notification modals were appearing BEHIND chat windows (z-index 100000 vs chat at 10000010). Increased flag notifications to z-index 20000000 ensuring they always appear on top during conversations.",
                    ],
                },
                {
                    category: "🤰 Pregnancy & Birth System",
                    items: [
                        "<strong>NEW: Automatic Pregnancy Tracking:</strong> When pregnant flag is added, system auto-calculates due date based on <code>gameState.pregnancySettings.duration</code> (default 14 game days, configurable 7-21). Stores conception date and due date in flag metadata.",
                        "<strong>NEW: Birth Events:</strong> <code>processFlagChains()</code> runs daily checking pregnant NPCs' due dates. On due date arrival, <code>giveBirth()</code> triggers: creates child object, removes pregnant flag, adds postpartum + lactating flags, shows birth notification.",
                        "<strong>NEW: Flag Chains (UNREALISTIC TIMING):</strong> Pregnancy → Lactating (30 days) → Postpartum (3 days - FAST recovery). System automatically removes flags after duration expires. Lactating flag added immediately after birth with metadata linking to child. Postpartum only lasts 3 game days for unrealistic quick recovery.",
                        '<strong>NEW: Father Tracking:</strong> Pregnancy metadata stores father ID ("player" or employee ID). Father info displayed in child records and used for genetic inheritance.',
                        "<strong>NEW: Pregnancy Initialization:</strong> <code>initializePregnancy()</code> function called automatically when pregnant flag added via detection OR manual creation. Sets due date, shows notification with countdown.",
                    ],
                },
                {
                    category: "👶 Children System",
                    items: [
                        "<strong>NEW: Children Data Structure:</strong> Added <code>gameState.children[]</code> array storing all offspring. Each child has: id, name, gender (boy/girl), motherID, fatherID, birthDate, age (auto-calculated daily), genetics{}, traits[], photo.",
                        "<strong>NEW: Genetic Inheritance:</strong> <code>createChild()</code> generates child with 50/50 genetics from both parents: hairColor, eyeColor, skinTone, height. Randomly inherits physical traits ensuring biological realism.",
                        "<strong>NEW: Personality Inheritance:</strong> Children inherit 2 random personality traits from combined parent trait pool (mother.personality.traits + father.personality.traits). Creates unique blend of parental characteristics.",
                        "<strong>NEW: Name Generation (70+ Names!):</strong> Auto-generates age-appropriate names from curated lists of 70 boy names and 70 girl names (expanded from 10 each). Includes modern popular names like Theodore, Santiago, Aurora, Gabriella, etc. Gender randomly determined at birth (50/50 chance).",
                        '<strong>NEW: Age Progression:</strong> <code>ageChildren()</code> function calculates child age in game days from birthDate. Ages displayed as "Newborn", "X days old", "X months old", "X years old" with proper pluralization.',
                        '<strong>NEW: Children Tab in Profile:</strong> Added "👶 Children" tab to unified employee profile modal. Displays all children with photos, ages, genetics, personality traits, and parent info. Shows "No children yet" if none exist.',
                    ],
                },
                {
                    category: "📊 Children Display System",
                    items: [
                        "<strong>NEW: Child Cards:</strong> Beautiful card layout showing child photo (emoji-based), name in gold text, age with proper formatting, gender icon (♂️/♀️), parent names with colored styling.",
                        "<strong>NEW: Genetics Display:</strong> Each child card shows inherited traits in grid layout: Hair color, Eye color, Skin tone, Height. All inherited from biological parents.",
                        '<strong>NEW: Personality Traits:</strong> Shows inherited personality traits as colored badges (e.g., "friendly", "caring", "confident"). Traits come from both parents\' trait pools.',
                        "<strong>NEW: Parent Info Section:</strong> Displays mother and father with proper name coloring (player name in gold, NPC names in character colors). Shows relationship clearly.",
                        '<strong>NEW: Empty State:</strong> Graceful "No children yet" message with centered styling when employee has no children.',
                    ],
                },
                {
                    category: "🔗 Flag Chain System",
                    items: [
                        "<strong>NEW: Chain Definitions:</strong> Added <code>gameState.flagChains</code> with active chain tracking and definitions. Pregnancy chain defined with 3 stages: pregnant (until due date) → lactating (30 days) → postpartum (3 days - UNREALISTIC fast recovery).",
                        "<strong>NEW: Daily Processing:</strong> <code>processFlagChains()</code> called from <code>onDayChange()</code> every game day. Checks all active flags for expiration, progression triggers, and automatic transitions.",
                        "<strong>NEW: Auto-Removal:</strong> Lactating (30 days) and postpartum (3 days only!) flags automatically removed after duration expires. System calculates days since startDate and compares to configured duration. Quick postpartum recovery for unrealistic gameplay.",
                        "<strong>NEW: Metadata Linking:</strong> All chain-related flags store child ID in metadata enabling cross-reference between flags and children. Postpartum/lactating flags link back to specific child.",
                        "<strong>EXTENSIBLE: Future Chains:</strong> System designed for easy expansion - can add new chains for other conditions (illness → recovery, addiction → withdrawal, training → mastery, etc.)",
                    ],
                },
                {
                    category: "⚙️ Technical Implementation",
                    items: [
                        "<strong>Modified: <code>gameState</code> Structure:</strong> Added <code>children[]</code> array and <code>flagChains{}</code> object to save data. Fully serializable and backward compatible.",
                        "<strong>Modified: <code>addFlag()</code>:</strong> Now calls <code>initializePregnancy()</code> when pregnant flag added. Auto-populates father metadata if missing. Handles pregnancy initialization automatically.",
                        '<strong>Modified: <code>removeFlag()</code>:</strong> Enhanced to accept flag key OR flag ID for flexible removal. Used by chain system to remove flags by key (e.g., "pregnant", "lactating").',
                        "<strong>Modified: <code>approveFlagSuggestion()</code>:</strong> Now initializes pregnancy when approving detected pregnant flag. Ensures due date calculation happens automatically.",
                        "<strong>Modified: <code>onDayChange()</code>:</strong> Added <code>processFlagChains()</code> call ensuring chains processed daily. Children ages updated daily via this system.",
                        "<strong>Created: <code>giveBirth()</code>:</strong> Handles complete birth event - creates child, removes pregnant flag, adds lactating + postpartum flags, shows notification, saves game.",
                        "<strong>Created: <code>createChild()</code>:</strong> Generates complete child object with genetics, traits, name, photo. Handles genetic inheritance logic from both parents. Name pool expanded to 70 boy names + 70 girl names.",
                        "<strong>Created: <code>getEmployeeChildren()</code>:</strong> Helper function to retrieve all children for specific employee. Used by children tab rendering.",
                        "<strong>Created: <code>initializePregnancy()</code>:</strong> Calculates due date based on settings, stores conception date, sets metadata, shows notification.",
                        "<strong>Created: <code>renderChildren()</code>:</strong> New tab renderer for children display in unified profile. Shows all children with full details, genetics, traits.",
                    ],
                },
                {
                    category: "🎨 UI/UX Improvements",
                    items: [
                        '<strong>Added Tab:</strong> "👶 Children" tab added to tab list in <code>openUnifiedProfile()</code> between Relationship and Appearance tabs.',
                        '<strong>Tab Routing:</strong> Added <code>case "children": return renderChildren();</code> to <code>renderContent()</code> switch statement.',
                        '<strong>Notification Enhancement:</strong> Birth events trigger 10-second success notification: "🎉 [Name] gave birth to a daughter/son named [ChildName]!"',
                        "<strong>Visual Hierarchy:</strong> Children cards use dark blue backgrounds (var(--l-line)) with nested darker sections (var(--l-panel-2)) for genetics/traits. Gold accents for names.",
                        "<strong>Color Coding:</strong> Father names colored based on type - gold (var(--l-gold)) for player, character colors for NPCs, gray (var(--l-ink-dim-2)) for unknown.",
                    ],
                },
                {
                    category: "📝 NEW: 26+ Additional Flag Patterns (KINKS & DYNAMICS)",
                    items: [
                        '<strong>Relationships (5):</strong> engaged (💎 - detects proposals/engagement), ownership_dynamic (🔒 - "own me", "i\'m yours", possession), 24_7_dynamic (🔄 - lifestyle D/s relationship), plus existing married/in_relationship patterns.',
                        "<strong>Personality Types (6):</strong> bimbo (💋 - ditzy, hyperfeminine persona with valley girl speech), switch (🔄 - can be dom or sub), bratty (😏 - playfully disobedient, seeks reactions), masochist (⛓️ - enjoys pain), sadist (😈 - enjoys causing pain), service_submissive (🛎️ - fulfillment through service).",
                        '<strong>Extreme Conditions (1):</strong> mind_broken (😵 - "fucked stupid", mental rewiring from excessive pleasure. AI speaks in simpler/fragmented sentences, struggles with complex thoughts, drools, stutters, hyper-focused on pleasure/obedience. Permanent personality alteration).',
                        "<strong>Specific Kinks (8):</strong> cumslut (💦), anal_only (🍑), degradation_kink (🔻 - enjoys verbal humiliation), praise_kink (⭐ - needs validation), daddy_kink (👨), mommy_kink (👩), pet_play (🐾 - puppy/kitten dynamics), rope_bunny (🪢 - bondage enthusiast).",
                        "<strong>Acts & Preferences (5):</strong> creampie_lover (💦 - internal completion preference), oral_fixation (👄 - loves giving oral), cock_worship (🙏 - reverence/obsession), lactation_kink (🍼), impregnation_fetish (🤰 - aroused by pregnancy concept).",
                        "<strong>Dynamics (2):</strong> voyeur (👀 - enjoys watching others), cucking (🔺 - cuckold/hotwife dynamics).",
                        "<strong>Plus Existing:</strong> size_queen (📏), exhibitionist (🎭), collared (🔗), chastity (🔐), and all original 9 patterns.",
                        '<strong>Detection Features:</strong> Natural language keywords ("i\'m mind broken", "you broke me", "fucked stupid", "can\'t think"), context validation, low thresholds (1-2 occurrences for explicit statements), comprehensive AI guidance for each including speech pattern changes.',
                    ],
                },
                {
                    category: "🔄 Save Compatibility",
                    items: [
                        "<strong>Backward Compatible:</strong> All new fields initialize gracefully if missing. Existing saves work without modification.",
                        "<strong>Auto-Migration:</strong> If <code>children</code> or <code>flagChains</code> missing from loaded save, they auto-initialize as empty arrays/objects.",
                        "<strong>No Breaking Changes:</strong> Existing flag system fully preserved. New features additive only.",
                        "<strong>Future-Proof:</strong> System designed for expansion - can add new chain types, child features, genetic traits without breaking saves.",
                    ],
                },
            ],
        },
        {
            version: "2510310930",
            date: "October 31, 2025",
            title: "🐛 Community Bug Fixes - Discord Feedback Implementation",
            changes: [
                {
                    category: "🎁 Gift System Fixes",
                    items: [
                        '<strong>FIXED: Gift Genie Adult Content Sanitization:</strong> Gift Genie was returning overly sanitized descriptions for adult items (e.g., "vibrator" → "personal massager", "bondage rope" → "decorative rope"). Enhanced AI prompt with explicit adult content policy, examples of acceptable adult items, and "DO NOT sanitize" instructions. Now generates appropriately explicit gift descriptions for adult game context.',
                        "<strong>FIXED: Entire Gift Stack Removed Bug:</strong> When giving one gift from inventory, entire stack (e.g., 5 gifts) was being removed instead of just one. Changed from <code>splice(giftIndex, 1)</code> to proper quantity decrement logic - checks quantity, decrements by 1, only removes item if quantity ≤ 0.",
                        '<strong>FIXED: False Duplicate Gift Warnings:</strong> NPCs were claiming gifts were duplicates despite never receiving them before ("AGAIN? You know how much I loved the first set..." when this was the first gift). Improved duplicate detection with case-insensitive exact matching and added explicit AI flags: "⚠️ DUPLICATE ALERT" vs "✓ This is a NEW gift" to prevent AI confusion.',
                        '<strong>FIXED: Gifts Not Showing in NPC Bio:</strong> Gifts received by NPCs were not displaying in their Possessions tab at all. Added comprehensive "All Gifts Received" section showing chronological list with gift name, category badge, value, and date. Now displays full gift history with proper formatting.',
                    ],
                },
                {
                    category: "👤 Profile Editing Enhancements",
                    items: [
                        "<strong>NEW: Age Editing:</strong> Added editable age field (18+) in Basic Info section of NPC profiles. Age is now visible and changeable in edit mode with minimum age validation (18-99 range). Includes numeric input with increment/decrement on change.",
                        "<strong>NEW: Gender Editing:</strong> Added editable gender field in Basic Info section. Players can now modify NPC gender with text input supporting all gender options (Female, Male, Non-binary, Trans Woman, Trans Man, etc.).",
                        '<strong>NEW: Intimacy Level Editing:</strong> Added intimacy level display and editing in Relationship Statistics section. Shows as percentage bar (0-100%) with description "Combined measure of emotional and physical closeness". Fully editable in edit mode with +/− buttons and direct numeric input. Stored in <code>employee.memory.intimacyLevel</code>.',
                    ],
                },
                {
                    category: "🔧 Critical Technical Fixes",
                    items: [
                        "<strong>FIXED: Social Feed Comment Promise Rejection:</strong> Fixed \"Cannot read property 'push' of undefined\" error in <code>trackPlayerMention()</code> function causing promise rejections when commenting on posts. Added defensive array/object validation ensuring <code>mentionHistory</code> and <code>mentionCounts</code> exist and are correct types before operations.",
                        "<strong>FIXED: Social Feed Images Not Displaying:</strong> Images in social feed posts were not showing or failing to load silently. Added error handling with fallback placeholder (<code>onerror</code> handler), opacity fade-in transition on successful load, and prevents broken image icons. Images now display with proper loading states.",
                        "<strong>FIXED: Corporate Pyramid Error After Prestige:</strong> Opening Corporate Pyramid modal immediately after prestiging caused crashes due to uninitialized data structures. Added defensive initialization checks for <code>employees</code> array, <code>corporateHierarchy</code> structure, and <code>hierarchyLevels</code> array with automatic creation of missing structures and default values.",
                    ],
                },
                {
                    category: "🎭 NPC AI Improvements",
                    items: [
                        '<strong>FIXED: Male Character Pronouns Wrong:</strong> Male and trans man characters were consistently referred to with "she/her" pronouns by AI despite being defined as male. Added CRITICAL IDENTITY pronoun guidance system with explicit instructions for each gender: Male/Trans Man get "⚠️ You are a MAN. Use he/him/his. Do NOT use she/her under any circumstances", Trans Woman get "You are a TRANS WOMAN. Use she/her/hers", Female/Futanari get "You are a WOMAN. Use she/her/hers". Pronoun guidance injected directly into character context to prevent AI misgendering.',
                        '<strong>FIXED: Player Info Being Ignored:</strong> Enhanced <code>getPlayerDescription()</code> function with explicit name enforcement: "⚠️ THE PLAYER is named [FullName]. Do NOT call them by any other name." Added "do not invent names" instructions to prevent AI from making up player nicknames like "Phil" or "Mr. Roberts".',
                        "<strong>FIXED: Training Workshop Notification Spam:</strong> Training workshops were causing notification/UI flicker due to <code>saveGame()</code> being called during batch employee updates, combined with 5-second autosave interval. Changed to <code>saveGame(false)</code> to suppress manual save notifications during bulk operations. Batched all employee updates before single save call.",
                    ],
                },
                {
                    category: "🏢 Game Systems Fixes",
                    items: [
                        '<strong>FIXED: Flags System Syntax Error in Opera GX:</strong> <code>showAllFlags()</code> function was not accessible from inline onclick handlers causing "showAllFlags is not defined" error in Opera GX browser. Exposed <code>window.showAllFlags</code> and <code>window.removeFlagAndRefresh</code> globally for cross-browser compatibility.',
                    ],
                },
                {
                    category: "⚙️ Technical Implementation Details",
                    items: [
                        "<strong>Gift System:</strong> Enhanced <code>generateCustomGift()</code> AI prompt with explicit adult content policy examples. Fixed <code>sendGiftBtn</code> handler to decrement quantity properly. Improved <code>giveGiftToEmployee()</code> with case-insensitive duplicate detection. Enhanced <code>generateGiftReaction()</code> with explicit NEW vs DUPLICATE flags. Added gift display in <code>renderPossessions()</code>.",
                        "<strong>Profile Editing:</strong> Modified Basic Info section HTML to include gender and age input fields in edit mode. Added intimacy level widget to Relationship Statistics with +/− controls updating <code>window.profileEditState.editedData.memory.intimacyLevel</code>.",
                        "<strong>Pronoun System:</strong> Created <code>pronounGuidance</code> variable based on employee gender, injected into <code>contextFacts</code> array in <code>buildChatPrompt()</code> function. Explicit masculine/feminine language enforcement for all genders.",
                        "<strong>Social Feed:</strong> Added <code>onerror</code> and <code>onload</code> handlers to post image tags. Enhanced <code>trackPlayerMention()</code> with Array.isArray checks and typeof validation. Added defensive checks to <code>openCorporatePyramidModal()</code> with structure initialization.",
                        "<strong>Save Migration:</strong> All fixes include backward compatibility with existing saves. Missing properties auto-initialize with sensible defaults. No breaking changes to save format.",
                    ],
                },
                {
                    category: "🙏 Community Feedback",
                    items: [
                        "All fixes based on Discord & Perchance community feedback and bug reports",
                        "Prioritized most impactful issues affecting gameplay experience",
                        "Enhanced systems based on player expectations and use cases",
                        "Improved error messages and user feedback throughout",
                        "Added more granular control over NPC customization",
                        "Focus on polish and stability for core game systems",
                    ],
                },
            ],
        },
        {
            version: "2510240835",
            date: "October 24, 2025",
            title: "🔧 Critical Bug Fixes: Scene Visualization & Social Posts",
            changes: [
                {
                    category: "🎬 Scene Visualization - CRITICAL FIXES",
                    items: [
                        "<strong>FIXED: Random Unrelated Images Bug:</strong> Scene visualization was generating completely random images (mountain streams instead of erotica, lizards instead of characters, etc.) due to Perchance returning String objects instead of primitive strings.",
                        "<strong>String Object Extraction:</strong> Created <code>extractText()</code> helper function to properly convert Perchance's String objects to usable text. Prevents prompt from being treated as character array (0, 1, 2, ...) instead of actual string.",
                        "<strong>Markdown Pollution Fix:</strong> AI was adding <code>**Image Prompt:**</code>, <code>**Visual Details:**</code>, bullet points, and <code>*(Word count: X)*</code> to prompts - confusing image generator. Now strips all markdown formatting.",
                        "<strong>Enhanced Prompts:</strong> Increased max_tokens from 100→200, added detailed instructions for exact current activity, poses, expressions, location details, mood/atmosphere, and clothing/props.",
                        "<strong>Better Context:</strong> Now extracts last 3 player and NPC messages for deeper understanding of scene. Temperature increased from 0.7→0.8 for more creative but focused output.",
                        '<strong>Stop Sequences:</strong> Added stops for "Visual Details:", "**Visual", "Word count:" to prevent AI from continuing into metadata.',
                        "<strong>XML Tag Removal:</strong> Strips <code>&lt;image prompt&gt;</code> tags that AI sometimes adds.",
                    ],
                },
                {
                    category: "✏️ Custom Image Prompts",
                    items: [
                        '<strong>Custom Prompt Option:</strong> Added "Custom Prompt" to image style dropdown per user request.',
                        '<strong>Personal Style Directives:</strong> Users can now write their own custom style instructions (e.g., "watercolor painting, soft colors, dreamy atmosphere") instead of being limited to presets.',
                        "<strong>Expandable Textarea:</strong> UI shows/hides custom prompt field based on selection. Includes helpful placeholder text.",
                        "<strong>Persistent Storage:</strong> Custom prompts save to gameState and persist across sessions.",
                        '<strong>Fallback Handling:</strong> If custom prompt is empty, falls back to "high quality, detailed".',
                    ],
                },
                {
                    category: "📱 Social Post Quality Improvements",
                    items: [
                        '<strong>FIXED: Short Generic Posts:</strong> AI was spamming feed with one-word posts like "Self-care morning", "Made it to work", "Vibing". Increased max_tokens from 60→80 and added quality validation.',
                        '<strong>FIXED: "Caught in Mid-" Repetition:</strong> AI was obsessed with phrases like "caught in mid-laugh", "caught in mid-sip", "caught in mid-bite". Added regex filters to <code>cleanWithLearning()</code> to remove all "mid-action" patterns.',
                        "<strong>Post Quality Validation:</strong> Now rejects posts with <3 words, emoji-only posts, and generic phrases before they hit the feed.",
                        "<strong>Enhanced Fallback Templates:</strong> Expanded from 3 options per type to 7-10 varied options. Added personality-based variations (flirty emojis, professional hashtags).",
                        '<strong>Better AI Instructions:</strong> Explicit rules: "NOT single-word posts", "Avoid one-word or extremely short posts", "NEVER use caught in mid-[action] phrases", "Add personality and context".',
                        "<strong>Expanded Post Types:</strong> Added fallbacks for: fitness, hobby, entertainment, mood, question, achievement, throwback, pet, fashion, complaint, inspiration, weather, random, gossip.",
                    ],
                },
                {
                    category: "🕐 PostId Timestamp Validation",
                    items: [
                        "<strong>FIXED: Invalid PostIds Bug:</strong> Fallback system was generating posts with invalid postIds lacking timestamps, causing posts to get stuck at top of feed and become undeletable.",
                        "<strong>Robust Timestamp Generation:</strong> Added validation in <code>createPost()</code> with multiple fallbacks: 1) Date.now(), 2) gameState.time.currentTime, 3) new Date().getTime(), 4) Epoch timestamp.",
                        "<strong>Error Logging:</strong> Console warnings if timestamp is NaN or invalid.",
                        "<strong>Guaranteed Valid IDs:</strong> Ensures all posts have format <code>post_{counter}_{timestamp}</code> with valid timestamp for proper sorting and deletion.",
                    ],
                },
                {
                    category: "🛠️ Technical Implementation",
                    items: [
                        "<strong>New Helper Function:</strong> <code>extractText(response)</code> - Universal text extraction from generateText responses. Handles String objects, response objects with .text/.generatedText properties, and primitive strings.",
                        "<strong>Applied Everywhere:</strong> Scene visualization, social post generation, and image style application now use extractText() for consistent handling.",
                        "<strong>Markdown Stripping:</strong> Comprehensive regex patterns remove: bold headers, bullet points, labels, word counts, and formatting artifacts.",
                        '<strong>AI Prompt Improvements:</strong> Added explicit instructions: "Write ONLY the description itself. NO markdown formatting, NO bold headers, NO labels."',
                        "<strong>Debug Logging:</strong> Enhanced console logs show prompt length, style application, and final prompt endings for troubleshooting.",
                    ],
                },
                {
                    category: "📊 Expected Improvements",
                    items: [
                        "Scene visualizations accurately reflect conversation context instead of random images",
                        "Users can define custom art styles with personal preferences",
                        "Social posts are more substantive and varied (3+ words minimum)",
                        'No more "caught in mid-X" repetitive AI phrases',
                        "All posts have valid IDs with timestamps for proper sorting/deletion",
                        "Overall better AI content quality across all generation points",
                    ],
                },
            ],
        },
        {
            version: "2010232145",
            date: "October 23, 2025",
            title: "🎨 Global Image Style System & Prestige Bug Fixes",
            changes: [
                {
                    category: "✨ New Features",
                    items: [
                        "<strong>Global Image Style Setting:</strong> Choose a consistent art style for ALL image generation (profiles, chats, social posts, scenes)",
                        "<strong>6 Style Options:</strong> Photorealistic, Anime/Manga, Artistic/Painterly, Cartoon/Comic, Cinematic, Professional Studio",
                        "<strong>Automatic Style Application:</strong> Selected style is applied to all 14+ image generation points automatically",
                        "<strong>Style Persistence:</strong> Image style preference saves across sessions",
                        "<strong>Smart Style Directives:</strong> Each style includes comprehensive prompt modifiers for consistent results",
                    ],
                },
                {
                    category: "🐛 Critical Bug Fixes",
                    items: [
                        "<strong>Fixed Prestige Unlock Cost Bug:</strong> Product unlock costs were locked to pre-prestige values (e.g., garage products requiring billions after prestige). Now properly resets to base values.",
                        "<strong>Base Unlock Cost System:</strong> Added comprehensive lookup table with default costs for all 40+ products",
                        "<strong>Prestige Reset Logic:</strong> Product unlock costs now correctly reset to original values regardless of dynamic changes",
                    ],
                },
                {
                    category: "🎨 Image Generation Improvements",
                    items: [
                        "Updated 14+ image generation locations to use consistent styling",
                        "Employee profile pictures (onboarding)",
                        "Chat image requests (player to NPC)",
                        "Chat image requests (NPC to player)",
                        "Image regeneration in chats",
                        "Visualize current scene",
                        "Social feed posts with images",
                        "Social feed custom player posts",
                        "Boss fight character images",
                        "Gift preview images",
                        "First post selfies (new hires)",
                        "All images now respect global style setting",
                    ],
                },
                {
                    category: "⚙️ Technical Implementation",
                    items: [
                        "Added <code>applyImageStyle()</code> helper function for consistent style application",
                        "Style directives automatically append to all image prompts",
                        "Duplicate detection prevents style tags from being added multiple times",
                        "Debug logging shows style application for troubleshooting",
                        "Settings UI integration with real-time style switching",
                        "Base unlock costs for garage, home_office, office_suite, factory, and corporate_tower products",
                    ],
                },
                {
                    category: "💾 Prestige System Improvements",
                    items: [
                        "<strong>Complete Cost Reset:</strong> All product unlock costs reset to base defaults",
                        "Prevents progression blocks after prestige",
                        "Maintains game balance across prestige cycles",
                        "Preserves intended early-game flow after reset",
                        "Fixed unlock costs for 8 garage products, 10 home office products, 10 office suite products, 10 factory products, 10 corporate tower products",
                    ],
                },
            ],
        },
        {
            version: "2510221000",
            date: "October 22, 2025",
            title: "🚀 Nuclear Context Intelligence + Anti-Repetition System",
            changes: [
                {
                    category: "🧠 Revolutionary AI Context Selection",
                    items: [
                        '<strong>Nuclear Context Intelligence System:</strong> Completely rewrote how AI selects context for NPC conversations. Instead of "context dumping" (sending ALL employee data in every prompt), now intelligently selects 5-15 most relevant pieces using multi-dimensional scoring.',
                        "<strong>Multi-Dimensional Scoring:</strong> Each context piece scored on 5 dimensions: Base Priority (inherent importance), Semantic Relevance (matches conversation topic), Temporal Relevance (time-sensitive data gets freshness bonus), Novelty (anti-repetition penalty), Coherence (works well with other selected pieces).",
                        "<strong>Adaptive Selection Algorithm:</strong> Greedily selects best-scoring context with category balancing (prevents all personality, no current state). Respects token budgets: 400 tokens for casual chat, 300 for social posts, 250 for comments.",
                        "<strong>Usage Tracking:</strong> System tracks which context pieces are used in each interaction. Pieces used recently get heavy novelty penalties (70% reduction) to prevent repetition. Pieces used in last hour completely excluded.",
                        "<strong>Context Categories:</strong> 9 categories with different priorities: core_identity (always included), personality (high), current_state (high, time-sensitive), relationships (low), skills (work-context), stats (medium), flags (variable), personal_life (low), appearance (very low).",
                    ],
                },
                {
                    category: "🎯 Anti-Repetition Enforcement",
                    items: [
                        '<strong>FIXED: Physical Appearance Obsession:</strong> NPCs were constantly describing "bright blue eyes", "chestnut waves", and "barefoot" in EVERY response. Drastically reduced appearance priority (0.2→0.05, 0.1→0.02), added avoidRepetition flags, and explicit AI instruction to STOP obsessing over looks.',
                        "<strong>FIXED: Coworker Name-Dropping Plague:</strong> NPCs mentioned coworkers in EVERY SINGLE MESSAGE, even during intimate moments (\"Judith's budget reports wouldn't know what to make of this\"). Reduced relationship priority by 75-85%, removed automatic office dynamics/social context injection.",
                        '<strong>FIXED: Betting Obsession:</strong> NPCs constantly saying "[Coworker] bet me $20 that..." as excuse to mention people. Added explicit ban on using bets/wagers as crutch to name-drop coworkers.',
                        "<strong>Explicit AI Instructions:</strong> Added critical directives telling AI to: NOT constantly describe appearance (only when it changes or asked), NOT randomly bring up coworkers (only when player asks or directly relevant), NOT use betting patterns to shoehorn names, NEVER mention coworkers during intimate moments.",
                        "<strong>Context Selectivity:</strong> Removed automatic inclusion of office dynamics, recent social posts, and gossip. These now only appear when semantically relevant or player asks about them.",
                    ],
                },
                {
                    category: "🏢 Corporate Hierarchy Overhaul",
                    items: [
                        "<strong>FIXED: Hierarchy Levels Completely Redesigned:</strong> Levels now correctly match the corporate structure: Level 1 = Staff (product workers), Level 2 = Local Manager, Level 3 = Regional Manager, Level 4 = Branch Manager, Level 5 = CFO/COO, Level 6 = Senior Executive, Level 7 = CEO.",
                        '<strong>Proper Level Progression:</strong> New employees start at Level 1 (Staff) - the bottom tier managing products. Removed confusing "Entry Level" terminology. Everyone starts as Staff and can work their way up.',
                        "<strong>Corporate Pyramid Population:</strong> Migration system now syncs employees to corporate pyramid positions after auto-assignment. Your staff will properly appear in the Corporate Ladder screen at Level 1 positions.",
                        "<strong>Updated Promotion Requirements:</strong> Adjusted requirements to match new hierarchy: Staff→Local Manager (60% prod, Lv1 mgmt), Local→Regional (70%, Lv2), Regional→Branch (75%, Lv4), Branch→CFO/COO (80%, Lv6), CFO/COO→Senior Exec (85%, Lv8), Senior Exec→CEO (90%, Lv10).",
                        "<strong>Position Icons & Colors:</strong> Each level has appropriate icon and color: 👔 Staff (green), 👨‍💼 Local Manager (blue), 🎯 Regional Manager (gold), 📊 Branch Manager (pink), 💼 CFO/COO (purple), ⭐ Senior Executive (deep purple), 👑 CEO (red).",
                    ],
                },
                {
                    category: "🔧 Staff Position Management & Save Migration",
                    items: [
                        '<strong>SMART Auto-Assignment from Old Saves:</strong> Migration system intelligently extracts product assignments from old "Manager – [Product Name]" position fields, auto-assigns employees to correct products, syncs them to corporate pyramid, then cleans up outdated display fields.',
                        '<strong>FIXED: Promotion Vacancy Bug:</strong> When promoting employee from Staff position to higher role, the old product position is now properly vacated and automation disabled. Shows warning notification: "⚠️ [Position] is now vacant! Hire new staff to restore automation."',
                        '<strong>FIXED: "Managed by Unknown" Bug:</strong> Old saves had products with invalid manager references. Migration system now detects and clears broken assignments, showing helpful message: "⚠️ Staff assignment lost - click Hire Staff to reassign"',
                        '<strong>Cleaner People Tab Cards:</strong> Removed redundant "Manager – [Product] • [Product]" line from employee cards. The Corporate Hierarchy section already shows their level and role clearly.',
                        '<strong>Position Title Clarity:</strong> Business tab now shows which employee staffs each product: "✓ Staffed by [Name] (Lv.X)" or "⚠️ No staff assigned - automation disabled" when vacant.',
                        '<strong>Better Terminology:</strong> Changed "Hire Employee" → "Hire Staff", "Upgrade Manager" → "Upgrade Position", "Managed by" → "Staffed by" to clarify you\'re improving the position (equipment/processes) not the person.',
                        '<strong>Upgrade Notifications:</strong> Position upgrade messages now say "[Product] position upgraded to Lv.X - Better equipment & efficiency!" making it clear what\'s improving.',
                        "<strong>Save Migration:</strong> Loading old saves automatically validates all product-employee assignments and fixes any orphaned manager references from fired/promoted employees.",
                        '<strong>Secretary Title Fix:</strong> Executive Secretary position (level 6.5) now correctly sets employee title to "Executive Secretary" instead of incorrectly showing "Regional Director" (level 6).',
                    ],
                },
                {
                    category: "📊 Debug & Analytics Tools",
                    items: [
                        "<strong>debugContextSelection():</strong> Console function to see exactly what context is selected for any interaction. Shows scores, breakdown by dimension, and formatted output.",
                        "<strong>showContextAnalytics():</strong> View comprehensive analytics on context usage for any employee - most/least used pieces, category distribution, average pieces per interaction, recent history.",
                        "<strong>Token Budget System:</strong> Different interaction types have appropriate budgets to prevent bloat while maintaining quality context.",
                    ],
                },
            ],
        },
        {
            version: "2510220820",
            date: "October 22, 2025",
            title: "⬆️ Promotion UX Overhaul + Bug Fixes",
            changes: [
                {
                    category: "✨ Improved Promotion System",
                    items: [
                        '<strong>Promote Button in Employee Profiles:</strong> New "⬆️ Promote" button appears in employee profile modals. Shows as green/active when employee is eligible for promotion, grayed out with "🔒 Not Eligible" when not eligible.',
                        '<strong>Seamless Promotion Flow:</strong> Click "Promote" button → profile closes → Corporate Pyramid opens with eligible positions highlighted in gold. Much more intuitive than drag-and-drop.',
                        "<strong>Visual Confirmation Modal:</strong> Beautiful side-by-side comparison showing old position → new position with animated arrow. Displays employee photo, position cards with level/title, cost breakdown, and your remaining cash after promotion.",
                        "<strong>Smart Eligibility Detection:</strong> System automatically checks all higher-level positions and secretary role to determine if employee has promotion opportunities.",
                        "<strong>Mobile-Friendly:</strong> Click-based system works perfectly on mobile devices, replacing janky drag-and-drop.",
                        "<strong>Current Position Display:</strong> Employee profiles now show current position title and level badge next to the Promote button.",
                    ],
                },
                {
                    category: "🏢 Secretary Position Addition",
                    items: [
                        "<strong>Executive Secretary Role:</strong> New special position that reports directly to the CEO with no subordinates. Perfect for early-game hiring.",
                        "<strong>Visual Placement:</strong> Appears next to the CEO in the Corporate Pyramid (slightly smaller for visual hierarchy) with unique purple/magenta color scheme and 📋 icon.",
                        "<strong>Easy Access:</strong> Can be filled by Level 1-3 employees. Low cost ($1,000) encourages early hiring.",
                        "<strong>Auto-Migration:</strong> Automatically added to existing saves without requiring new game.",
                        "<strong>Fully Integrated:</strong> Works with all position management functions including assignment, removal, and promotion flow.",
                    ],
                },
                {
                    category: "🐛 Bug Fixes",
                    items: [
                        "<strong>Fixed createSocialPost Error:</strong> Function was being called but never defined, causing ReferenceError in generateMorningPost, generateEveningPost, and createActivityPost. Now properly creates and adds posts to social feed.",
                        "<strong>Fixed Mention Suggestions Crash:</strong> TypeError when accessing employee IDs in getMentionSuggestions. Added comprehensive null checks and validation for employee objects, IDs, and mention statistics.",
                        "<strong>Fixed Scarf Obsession:</strong> Removed accessories (including scarves) from the fullDescription string sent to AI. Employees were constantly mentioning scarves because it was in their character description for every AI interaction. Accessories still stored in data but no longer pollute conversations.",
                    ],
                },
                {
                    category: "🎨 UI Improvements",
                    items: [
                        "<strong>Discord Icon:</strong> Re-added Discord server link icon to top bar (left of settings gear). Opens in new tab with proper SVG icon in Discord brand color.",
                        "<strong>Promotion Confirmation Animations:</strong> Smooth fade-in, slide-up, and pulsing arrow effects in confirmation modal. Green glow on affordable promotions, disabled state for insufficient funds.",
                        "<strong>Better Error Messages:</strong> More descriptive error messages for position assignment failures with specific reasons.",
                    ],
                },
            ],
        },
        {
            version: "2510211800",
            date: "October 21, 2025",
            title: "🏢 Corporate Ladder System + NPC Lifelike Systems",
            changes: [
                {
                    category: "🎯 Corporate Hierarchy & Pyramid Visualization",
                    items: [
                        "<strong>7-Level Organizational Chart:</strong> Complete restructure from product-based positions to true hierarchical reporting structure (Level 1 Staff → Level 7 CEO). Positions automatically created based on products/locations unlocked.",
                        "<strong>Interactive Pyramid Modal:</strong> Beautiful visual org chart showing your entire company structure at a glance. Click any position to view details, drag employees between positions, pan/zoom controls, mobile-friendly touch support.",
                        "<strong>Auto-Assignment:</strong> Newly hired employees automatically assigned to Level 1 Staff positions for their product, appearing immediately in the pyramid.",
                        "<strong>Dynamic Position Creation:</strong> Positions scale with your business - Level 1 (1 per product), Level 2 (2-3 per location), Level 3 (1 per location), Level 4 (manages 2-3 locations), Level 5 (CFO/COO), Level 6 (Senior Executive), Level 7 (CEO - You!).",
                        "<strong>Reporting Relationships:</strong> Each position tracks who reports to whom, subordinate counts, span of control. Validates chain of command when assigning employees.",
                        "<strong>Position Details Modal:</strong> Click any position to see employee info, skills, salary, reporting structure. Remove employees or view vacant positions.",
                        "<strong>Migration System:</strong> Seamlessly converts old product-based save data to new hierarchical structure automatically on load.",
                    ],
                },
                {
                    category: "📈 Promotion System Overhaul",
                    items: [
                        "<strong>Clear Requirements:</strong> Each level has specific productivity and management skill requirements (Level 2: 60% productivity → Level 7: 90% productivity + Level 8 management).",
                        '<strong>Visual Promotion Badges:</strong> Employees eligible for promotion display a pulsing golden "⬆️ READY" badge on their pyramid tile.',
                        "<strong>Eligibility Display:</strong> Click any employee in the pyramid to see detailed promotion requirements with current vs. needed values. Shows what they're missing in red, what they've achieved in green.",
                        "<strong>Three Status States:</strong> Ready (green banner), Not Ready (shows gaps), Max Level (gold crown).",
                        "<strong>Promotion Costs:</strong> Scaling costs from $500 (Level 1→2) to $500,000 (Level 6→7). Lateral moves get 50% discount.",
                        "<strong>Smart Assignment:</strong> System validates if employee meets level requirements and has necessary management skills before allowing position assignment.",
                    ],
                },
                {
                    category: "🎓 Employee Development Programs",
                    items: [
                        "<strong>Training Workshops:</strong> Company-wide training affecting all employees at once. Cost: $500 per employee. Benefits: +5-10 productivity, +20 management XP. No cooldown - run as often as budget allows.",
                        "<strong>Performance Reviews:</strong> Individual one-on-one reviews with tiered benefits. Cost: $200. Cooldown: 7 days per employee. Low performers get +15-20 productivity, average +10-15, high performers +5-10. Also boosts affection by +5.",
                        "<strong>Team Building Activities:</strong> Fun company events boosting both productivity and morale. Cost: $800 per employee. Cooldown: 14 days. Benefits: +3-7 productivity, +8 affection, +8 comfort, +30 social XP.",
                        "<strong>Review History Tracking:</strong> All performance reviews tracked in employee career data with before/after productivity values.",
                        "<strong>Development Programs UI:</strong> New section at top of People tab with three cards showing each program, costs, cooldowns, and benefits. One-click activation buttons.",
                    ],
                },
                {
                    category: "🏷️ Universal Flag System",
                    items: [
                        '<strong>Dynamic State Tracking:</strong> NPCs can now have unlimited custom "flags" that track ANY state, condition, or trait - physical conditions (pregnant, sick, tired), relationship agreements (free use, exclusive dating), personality traits (dominant, submissive, shy), life events (birthday soon, recent breakup), preferences & kinks (exhibitionist, breeding kink), and literally anything imaginable.',
                        "<strong>Two Flag Types:</strong> System flags (auto-created by game mechanics like pregnancy) and custom flags (player-created for any purpose).",
                        "<strong>Smart AI Integration:</strong> Flags automatically inject into AI conversation context, so NPCs naturally remember and reference their states. No more forgetting major developments!",
                        "<strong>Automatic Detection:</strong> Game watches conversations and suggests flags based on patterns (e.g., detecting free-use agreements, relationship changes). Zero extra AI calls - pure regex pattern matching.",
                        "<strong>Flag Management UI:</strong> Beautiful modal accessible from People tab and unified profiles. View all active flags with their priority, AI guidance text, and expiration dates. One-click add/remove.",
                        "<strong>Quick-Add Buttons:</strong> 9 pre-configured common flags (Pregnant, In Relationship, Free Use Agreement, Secret Affair, Breeding Kink, Submissive, Dominant, Exhibitionist, Polyamorous) with appropriate emoji, priority, and AI context.",
                        "<strong>Flag Display:</strong> Active flags show as colored badges on employee cards with emoji icons (🤰 Pregnant, 💋 Free Use, etc.).",
                        "<strong>Custom Flag Creation:</strong> Full custom flag form with name, emoji, description, priority (low/medium/high), AI guidance, optional expiration dates.",
                        "<strong>Priority System:</strong> High-priority flags appear first in AI context to ensure important traits/states are emphasized.",
                    ],
                },
                {
                    category: "🗂️ Unified NPC Profile System",
                    items: [
                        "<strong>10-Tab Interface:</strong> Comprehensive profile modal consolidating all NPC information: Overview (bio + quick stats), Stats (relationship meters), Skills (work skills with levels), Possessions (gifts received), Flags (state management), Schedule (work hours), Social (feed activity), Relationship (detailed dynamics), Appearance (physical traits), Gallery (images).",
                        "<strong>Overview Tab Redesign:</strong> Merged Bio and Overview into single tab with profile picture, basic info, quick stat previews, active flags display, and action buttons.",
                        "<strong>Stats Tab:</strong> Visual progress bars for all relationship stats (affection, trust, comfort, desire, productivity) with hover tooltips and exact values.",
                        "<strong>Skills Tab:</strong> Work skills displayed with level, XP progress bars, next level requirements. Shows technical, creative, social, management, and life skills (fitness, cooking) with emoji icons.",
                        "<strong>Flags Tab:</strong> Full flag management interface within profile - view all flags, add custom flags, quick-add common flags, remove flags. Real-time updates.",
                        "<strong>Possessions Tab:</strong> Gallery of all gifts given to NPC with images, names, dates, and categories. Shows appreciation and relationship building over time.",
                        "<strong>Schedule Tab:</strong> Work schedule, PTO balance, sick days, hours worked, late days tracking. Future: will show daily routine and current activity.",
                        "<strong>Live Edit Mode:</strong> Toggle edit mode to modify NPC data directly in profile. Unsaved changes highlighted. Save/cancel with confirmation.",
                        "<strong>Clickable Everywhere:</strong> Access unified profiles by clicking NPC names/avatars anywhere - People tab cards, social media posts, comments, chat.",
                    ],
                },
                {
                    category: "📋 Skills & Progression System",
                    items: [
                        "<strong>Work Skills:</strong> Technical, Creative, Social, Management skills that level up through gameplay. Each skill has level (1-10), XP, and max XP with exponential scaling.",
                        "<strong>Life Skills:</strong> Fitness and Cooking skills for personal development and lifestyle activities.",
                        "<strong>XP Sources:</strong> Employees gain skill XP from work hours (automatic), evening activities, weekend activities, chat conversations (social), deep conversations (+5 social), flirting (intimate skill), work discussions (highest work skill +3).",
                        "<strong>Level-Up Notifications:</strong> Visual notifications when employees level up skills with celebration emoji 🎉.",
                        '<strong>Specialization Unlocks:</strong> Certain skill levels unlock specializations (e.g., Technical 3 = "Code Wizard").',
                        "<strong>Productivity Bonuses:</strong> Skills provide effective productivity bonuses - technical skills boost tech products, creative skills boost creative products, management gives universal 0.5x boost.",
                        "<strong>Skill Display:</strong> Skills shown in unified profiles, employee cards, position details with levels and progress bars.",
                    ],
                },
                {
                    category: "📅 Schedule & Time System",
                    items: [
                        "<strong>Work Schedule:</strong> Each employee has work days (Mon-Fri default), start/end hours (9 AM - 5 PM), currently-working status, clock in/out timestamps.",
                        "<strong>Hours Tracking:</strong> Daily hours worked, total days worked, late days counted for analytics and performance.",
                        "<strong>Leave System:</strong> PTO balance (10 days default), sick days (5 days), currently on leave status, leave type tracking (PTO/sick/maternity), leave end dates.",
                        "<strong>Future-Ready:</strong> Data structure prepared for time-aware NPC behaviors, location tracking, and daily routine generation.",
                    ],
                },
                {
                    category: "🏠 Life Outside Work",
                    items: [
                        "<strong>Current Activity Tracking:</strong> NPCs track what they're currently doing outside work (prepared for future real-time activity generation).",
                        "<strong>Hobbies System:</strong> Active hobbies with frequency (30-100% engagement), skill levels (1-5), and last-done timestamps.",
                        "<strong>Evening Preferences:</strong> Randomized preferences for gym (0-40%), cooking (0-60%), socializing (0-50%), relaxing (30-70%), hobbies (0-60%), dating (0-30%).",
                        '<strong>Living Situation:</strong> Apartment/house/condo type, roommate status, pet ownership with details (35% have pets - dogs, cats, birds, fish with randomly generated names like "Max", "Luna").',
                        "<strong>Social Circle:</strong> Outside contacts including best friend (70% have one), family (80%), relationship status (30% in relationships), detailed status tracking (single/dating/serious/married).",
                        "<strong>Weekend Plans:</strong> System ready to generate upcoming weekend activities and track last weekend activity.",
                        "<strong>Pet System:</strong> Pets tracked with name, type, who gifted them, and timestamps. Displayable in profiles and referenced in conversations.",
                    ],
                },
                {
                    category: "🎨 UI/UX Improvements",
                    items: [
                        '<strong>People Tab Enhancements:</strong> New "Employee Development Programs" section with three cards for Training, Team Building, and Performance Reviews. Cost displays, cooldown indicators, hover effects.',
                        '<strong>Employee Card Badges:</strong> Active flags display as colored emoji badges on employee cards. Promotion-ready employees get golden pulsing "⬆️ READY" badge.',
                        '<strong>New Action Buttons:</strong> Added "📊 Review" button to employee cards for quick performance review access. "🏷️ Flags" button for flag management.',
                        "<strong>Pyramid Controls:</strong> Pan/zoom controls, pinch-to-zoom on mobile, smooth animations, position tile hover effects.",
                        "<strong>Modal Improvements:</strong> All new modals use consistent styling with gradients, hover effects, responsive design. Better z-index management prevents stacking issues.",
                        "<strong>Visual Feedback:</strong> Success/error notifications for all development program actions. Cost displays update dynamically. Cooldown timers shown in UI.",
                    ],
                },
                {
                    category: "⚙️ Technical Improvements",
                    items: [
                        "<strong>Data Structure Expansion:</strong> Added gameState.corporatePyramid with CEO object, positions arrays by level, promotion costs. gameState.productivitySystems for tracking workshops/reviews. Flag arrays in employee objects.",
                        "<strong>Automatic Initialization:</strong> New data structures auto-initialize on first access with sensible defaults. Migration code converts old saves seamlessly.",
                        "<strong>Event Logging:</strong> Training workshops, team building, and promotions now create company event log entries for AI context.",
                        "<strong>Save Compatibility:</strong> All new systems designed with backward compatibility. Old saves load and automatically upgrade to new structure.",
                        "<strong>Performance:</strong> Flag detection uses regex patterns (no AI calls). Pyramid rendering optimized for large companies. Efficient subordinate counting.",
                        "<strong>Code Organization:</strong> New dedicated sections for corporate hierarchy functions, productivity systems, flag management. Clear function documentation.",
                    ],
                },
                {
                    category: "🔮 Foundation for Future Features",
                    items: [
                        "<strong>Advanced Social Dynamics:</strong> Flag system enables complex NPC-to-NPC relationships. Schedule system ready for time-aware interactions.",
                        "<strong>Family System:</strong> Data structures prepared for pregnancy tracking (7-14 day cycles), children with genetic inheritance, family relationships.",
                        "<strong>Dynamic Schedules:</strong> Time system ready to generate daily routines, track NPC locations throughout the day, implement time-aware behaviors.",
                        "<strong>Life Simulation:</strong> Weekend activities, evening routines, hobby progression, social events outside work - all data structures in place.",
                        "<strong>Relationship Depth:</strong> Flags enable tracking of complex relationship agreements (polyamory, exclusivity, kinks, preferences) that persist across save/load.",
                        "<strong>Expandable Systems:</strong> Universal flag system means ANY new state/trait can be added without code changes - just create a new flag!",
                    ],
                },
            ],
        },
        {
            version: "2510191600",
            date: "October 19, 2025",
            title: "💾 Comprehensive Save/Load System Overhaul",
            changes: [
                {
                    category: "🔒 Save/Load Coverage (50+ Properties)",
                    items: [
                        "<strong>Complete System Audit:</strong> Conducted comprehensive audit of all game systems to ensure 100% save/load coverage. Created detailed documentation tracking all 50+ gameState properties.",
                        "<strong>Social Network Data:</strong> Added explicit saving/loading for all social network properties including feedFilter, feedSort, recentPostTypes, playerDraft (caption, imagePrompt, altText, imageUrl).",
                        "<strong>Player Profile:</strong> Ensured complete player character data is saved (firstName, lastName, age, gender, ethnicity, physical details, intimate details, personality).",
                        "<strong>Company Context:</strong> Added full save/load for companyWideContext (currentBuzz, lastUpdate, maxItems, decayTime) and all company awareness data.",
                        "<strong>Prestige System:</strong> Verified prestige data saving (prestigeLevel, influencePoints, lifetimeEarnings, prestigeMultiplier, globalUpgrades, bossFights).",
                        "<strong>Employee Systems:</strong> Ensured typingStates, onboarding array, and currentCandidates are properly saved.",
                        "<strong>Missing Properties Fixed:</strong> Added initialization for playerMentionStats, activeGossip, lastProactiveMessageCheck, lifestyleAdjustmentCounter, and currentCandidates.",
                    ],
                },
                {
                    category: "📊 Backward Compatibility",
                    items: [
                        "<strong>Default Values:</strong> All new properties have sensible defaults, ensuring old saves load without errors.",
                        "<strong>Migration Path:</strong> Old saves automatically upgraded to new structure without manual intervention.",
                        "<strong>No Breaking Changes:</strong> Existing players can load saves from any previous version.",
                        "<strong>Future-Proof Template:</strong> Created comprehensive guide for adding new save properties (see SAVE_LOAD_AUDIT.md).",
                    ],
                },
                {
                    category: "📝 Documentation",
                    items: [
                        "<strong>Coverage Statistics:</strong> 50+ properties tracked across Core (12), Business (8), Employees (10), Social (12), Company (6), Gifts (7), AI (5).",
                        "<strong>Developer Guide:</strong> Step-by-step instructions for adding new save properties and handling Sets/Maps.",
                    ],
                },
            ],
        },
        {
            version: "2510191523",
            date: "October 19, 2025",
            title: "🚨 Critical Save/Load Bug Fixes",
            changes: [
                {
                    category: "🔥 Game-Breaking Fixes",
                    items: [
                        '<strong>CRITICAL: Fixed Hiring Crash After Loading:</strong> Fixed "TypeError: gameState.usedEmployeeNames.has is not a function" that prevented hiring employees after loading saved games. The Set object was being converted to an Array during JSON serialization, breaking the name uniqueness check.',
                        "<strong>Set Object Restoration:</strong> Added automatic conversion of usedEmployeeNames from Array back to Set when loading games. This preserves the .has() and .add() methods required by the hiring system.",
                        "<strong>Gender Settings Migration:</strong> Fixed \"Cannot read properties of undefined (reading 'female')\" error for old saves without genderSettings. Now automatically initializes with default values (100% female) for backwards compatibility.",
                        "<strong>Additional Set/Map Fixes:</strong> Also fixed blockedProactiveMessages (Set) and recentTopics (Map) which had the same serialization issue. All non-serializable objects now properly restored on load.",
                        "<strong>Debug Logging:</strong> Added console logs to track Set/Map restoration and settings initialization for easier troubleshooting.",
                    ],
                },
                {
                    category: "📝 Technical Details",
                    items: [
                        "<strong>Root Cause:</strong> JavaScript Sets and Maps are not JSON-serializable. When saving to localStorage/KV storage, Sets are converted to Arrays and Maps to plain objects. The loadGame function now detects this and converts them back.",
                        "<strong>Affected Systems:</strong> Name generation (usedEmployeeNames Set), gender selection (genderSettings object), topic tracking (recentTopics Map), proactive messages (blockedProactiveMessages Set).",
                        "<strong>Migration Safety:</strong> Fixes apply automatically to all existing saves without requiring manual intervention. Missing objects are initialized with proper defaults.",
                        "<strong>Future Prevention:</strong> This fix provides a comprehensive template for handling all non-serializable objects (Maps, Sets, etc.) in future features.",
                    ],
                },
            ],
        },
        {
            version: "2510191346",
            date: "October 19, 2025",
            title: "🎁 Gift System Fixes & AI Improvements",
            changes: [
                {
                    category: "🔧 Critical Gift System Fixes",
                    items: [
                        '<strong>Gift Price Scaling Overhaul:</strong> Fixed absurd gift expectations at high wealth levels. Previously at $27B lifetime income, game expected $8.7M-$8.7B gifts, treating a $15k Barcelona trip as "too cheap" (0.3× penalty). Now capped at reasonable human scale: $5k-$500k range regardless of wealth.',
                        "<strong>Price Philosophy Change:</strong> Gifts now judged on thoughtfulness, not price relative to net worth. Any gift $1k+ receives no penalty. Even billionaires appreciate a nice vacation!",
                        "<strong>New Price Ranges:</strong> Perfect range (1.5× bonus): $15k-$150k | Good range (1.2× bonus): $2.5k-$1M | Modest (1.0×): Any $1k+ gift | Only gifts under $100 receive penalties.",
                        '<strong>First Gift Detection:</strong> Fixed NPCs reacting to first-ever gifts as if they\'d received them before. Added explicit "THIS IS YOUR FIRST GIFT" flag in AI prompts with appropriate surprise/delight instructions.',
                        '<strong>Reduced "Overwhelmed" Penalty:</strong> Now only triggers for $500k+ gifts with very weak relationships (under 30), reduced from 0.5× to 0.7× penalty.',
                        "<strong>Debug Logging:</strong> Added comprehensive gift evaluation logs showing category match, price score, modifiers, and final reception calculations.",
                    ],
                },
                {
                    category: "⚡ AI Generation Optimization",
                    items: [
                        "<strong>Stat Evaluation Overhaul:</strong> Implemented optimizations for Player→NPC stat analysis. Reduced prompt from ~600 tokens to ~150 tokens (75% reduction).",
                        "<strong>Format-First Prompts:</strong> Moved output format instructions to beginning of prompts, forcing AI cooperation before seeing context.",
                        "<strong>Deterministic Output:</strong> Changed temperature from 0.3 → 0 and added top_p:0 for 100% consistent stat evaluations.",
                        '<strong>Aggressive Stop Sequences:</strong> Expanded from 8 to 15 stop sequences including "The", "This", "I", "Because" to prevent meta-commentary.',
                        "<strong>Context Compression:</strong> Reduced chat context from last 60 messages to last 4 messages (93% reduction) for faster processing.",
                        "<strong>Robust Parsing:</strong> Added value clamping to [-10, +10] range and better handling of malformed responses.",
                    ],
                },
                {
                    category: "💬 Comment Generation Fixes",
                    items: [
                        '<strong>Meta-Commentary Removal:</strong> Fixed AI outputting internal reasoning in comments like "Boss\'s post is explicit... personality traits: flirty at 36/100... Brainstorming authentic responses..."',
                        "<strong>Prompt Compression:</strong> Reduced comment generation prompts from ~50 lines to ~6 lines (88% reduction).",
                        "<strong>Short Direct Prompts:</strong> New format forces clean output: \"Name sees post: 'content' | Rel: type (strength/100) | Comment (5-25 words):\"",
                        "<strong>Nuclear Cleanup:</strong> Added aggressive sanitization that strips Perchance tokens ({SEEDS}, {BAN}, {BOOST}), name prefixes, and meta-text markers.",
                        "<strong>First-Line-Only:</strong> Comments now extract only first line/sentence, cutting any multi-line meta-analysis.",
                        '<strong>Fallback Detection:</strong> If comment starts with "Boss", "Personality", or other meta-text, automatically uses template comment instead.',
                    ],
                },
                {
                    category: "🔧 Other Fixes",
                    items: [
                        "<strong>Advanced Stats Editing:</strong> Fixed Sandbox Mode stats not persisting when reopening bio modal. Modal now closes and reopens automatically after save to display fresh values.",
                        "<strong>Gift History Tracking:</strong> Added logging of gift history before each gift to help debug duplicate detection.",
                        "<strong>Price Scale Display:</strong> All price calculations now log capped vs uncapped values for transparency.",
                    ],
                },
            ],
        },
        {
            version: "2510172020",
            date: "October 17, 2025",
            title: "🐛 Bug Fixes & AI Optimization",
            changes: [
                {
                    category: "🔧 Bug Fixes",
                    items: [
                        "<strong>Memory Initialization:</strong> Fixed crash when editing bio stats then sending chat messages (ensureEmployeeMemory now called after bio save)",
                        "<strong>Memory Validation:</strong> Added defensive checks to remember() function to prevent undefined memory.items errors",
                        '<strong>Product Unlock Discount:</strong> Fixed "Bulk Buying" prestige reward not applying to product unlock costs. Now shows discounted price with strikethrough original price and discount percentage.',
                        "<strong>Perchance Token Removal:</strong> Fixed {SEEDS:...}, {BAN:...}, {BOOST:...} and other Perchance formatting tokens appearing in posts, comments, and chat messages. Added aggressive sanitization to all AI-generated content.",
                    ],
                },
                {
                    category: "✅ Prestige System Audit (All Confirmed Working)",
                    items: [
                        "<strong>💰 Income Multiplier:</strong> ✓ Applied to all product earnings (visible in product values)",
                        "<strong>💵 Starting Capital:</strong> ✓ Bonus cash added when prestiging",
                        "<strong>👆 Quick Hands (Click Power):</strong> ✓ Reduces product cycle time when clicking (-0.05s per level)",
                        "<strong>👔 HR Efficiency:</strong> ✓ Reduces manager hire/upgrade costs (5% per level, max 50%)",
                        "<strong>📦 Bulk Buying:</strong> ✓ NOW FIXED - Reduces product unlock AND upgrade costs (3% per level, max 45%). Visual discount shown on unlock buttons.",
                        "<strong>⚡ Automation Boost:</strong> ✓ Managers work faster (5% per level, affects auto-run cycle time)",
                    ],
                },
                {
                    category: "⚡ AI Prompt Optimization (In Progress)",
                    items: [
                        '<strong>Chat Stat Evaluation:</strong> Simplified prompt 80%, reduced from 60 lines to 15 lines. Added explicit "Numbers only" instruction with aggressive stop sequences',
                        '<strong>NPC Reaction Evaluation:</strong> Changed "Rate -5 to +5:" to "Output single number -5 to +5 only:" to prevent narrative flashback stories',
                        '<strong>Image Prompt Generation:</strong> Reduced custom prompt analysis by 60%, added stop sequences to prevent verbose "Camera angle:", "Mood:" descriptions',
                        "<strong>Scene Visualization:</strong> Simplified prompt from 20 lines to 8 lines, removed numbered instructions",
                        '<strong>Post Generation:</strong> Added "The stapler" stop sequence to block narrative storytelling, reduced max_tokens to 50',
                        "<strong>Comment Generation:</strong> Added stop sequences to 6 additional functions (reply comments, mentions, autonomous comments)",
                        "<strong>Token Limits:</strong> Tightened across board - evaluations: 3-10 tokens, comments: 35-50 tokens, images: 100-150 tokens",
                        "<strong>Temperature Tuning:</strong> Lowered to 0.3 for evaluations (deterministic), 0.7-0.9 for creative content",
                        "<strong>Note:</strong> These fixes require page reload to clear prompt cache. Testing in progress to confirm effectiveness.",
                    ],
                },
            ],
        },
        {
            version: "2510170912",
            date: "October 17, 2025",
            title: "🎁 Complete Gift System - AI-Powered Gift Giving",
            changes: [
                {
                    category: "🎉 Major New Feature",
                    items: [
                        "<strong>🎁 Complete Gift System:</strong> Give meaningful gifts to employees with AI-powered reactions, dynamic pricing, and deep integration!",
                    ],
                },
                {
                    category: "🧞‍♂️ Gift Genie (AI Gift Generator)",
                    items: [
                        "<strong>Custom Gift Creation:</strong> Describe any gift in text and AI generates it with name, description, category, and price",
                        "<strong>100 Cycling Suggestions:</strong> Rotating placeholder text for inspiration (updates every 1.5 seconds)",
                        "<strong>Budget Limits:</strong> Set max price from $100 to $1 billion",
                        "<strong>Smart Category Mapping:</strong> Prevents AI drift with 11 fixed categories",
                        "<strong>Optional Image Generation:</strong> Create visual representations of your gifts",
                        "<strong>UNIQUE Gift Warnings:</strong> Special indicators for one-time-only items (private islands, landmarks, etc.)",
                    ],
                },
                {
                    category: "💝 11 Gift Categories",
                    items: [
                        "💕 <strong>ROMANTIC:</strong> Flowers, jewelry, love letters",
                        "💎 <strong>LUXURY:</strong> Designer items, champagne, spa days",
                        "✈️ <strong>EXPERIENCES:</strong> Concert tickets, vacations, skydiving",
                        "💻 <strong>TECH:</strong> Gadgets, smart devices, gaming gear",
                        "📚 <strong>INTELLECTUAL:</strong> Books, courses, museum memberships",
                        "🍰 <strong>FOOD:</strong> Gourmet treats, wine, restaurant vouchers",
                        "🛠️ <strong>PRACTICAL:</strong> Office supplies, tools, home goods",
                        "🎪 <strong>QUIRKY:</strong> Novelty items, weird collectibles",
                        "🧘 <strong>WELLNESS:</strong> Fitness equipment, meditation apps",
                        "👗 <strong>FASHION:</strong> Clothing, accessories, cosmetics",
                        "🌍 <strong>UNIQUE:</strong> One-time only items (private islands, landmarks, planets)",
                    ],
                },
                {
                    category: "📈 Dynamic Price Scaling",
                    items: [
                        "<strong>Scales with Company Growth:</strong> Recommended gift prices adapt to your lifetime income THIS prestige",
                        "<strong>Startup ($0-$10K):</strong> $10-$500 gifts",
                        "<strong>Small Business ($10K-$1M):</strong> $500-$10K gifts",
                        "<strong>Growing Company ($1M-$100M):</strong> $10K-$500K gifts",
                        "<strong>Corporation ($100M-$10B):</strong> $500K-$50M gifts",
                        "<strong>Mega Corp ($10B+):</strong> $50M-$1B+ gifts",
                        "Real-time recommendations displayed in Store UI",
                    ],
                },
                {
                    category: "🎭 NPC Gift Preferences",
                    items: [
                        "<strong>Personalized Tastes:</strong> Each employee has 2-3 loved categories, 2-3 hated categories",
                        "<strong>Loved Gifts:</strong> 1.5x to 2.5x stat bonus!",
                        "<strong>Hated Gifts:</strong> Negative stat changes (can harm relationship)",
                        '<strong>Visual Indicators:</strong> "They\'ll LOVE this! 💕" / "They might hate this... 💔" hints in gift selection',
                        "Generated at employee creation, persistent across saves",
                        'Visible in employee bio under "🎁 Gift Preferences"',
                    ],
                },
                {
                    category: "🎯 Intelligent Gift Reception",
                    items: [
                        "<strong>Multi-Factor Calculation:</strong> Category match, price, relationship, timing all affect reaction",
                        "<strong>Gift Fatigue:</strong> 3+ gifts in 7 days = -50% effectiveness (prevents stat grinding)",
                        "<strong>Duplicate Detection:</strong> Same gift within 30 days = -70% penalty",
                        "<strong>Price Appropriateness:</strong> Too cheap OR too expensive = penalties",
                        '<strong>Relationship-Based:</strong> Low relationship + expensive gift = "Suspicious" reaction',
                        "<strong>6 Reaction Tones:</strong> Delighted, Grateful, Overwhelmed, Underwhelmed, Suspicious, Confused",
                        "AI-generated contextual reactions based on employee personality, gift type, and reception quality",
                    ],
                },
                {
                    category: "💬 Conversation Integration",
                    items: [
                        "<strong>Give Gift Button:</strong> Added to conversation attachment menu (+ button)",
                        "<strong>Gift Selection Modal:</strong> Browse inventory with live preference hints",
                        "<strong>Visual Hints:</strong> Green borders for loved categories, red for hated, neutral for others",
                        "<strong>One-Click Giving:</strong> Select gift → instant AI reaction in chat",
                        "<strong>Stat Changes Visible:</strong> See exact affection, comfort, trust, desire changes",
                        "Gifts appear in chat history with reactions",
                        "Empty state when no gifts in inventory (directs to Gifts tab)",
                    ],
                },
                {
                    category: "📊 Gift History & Statistics",
                    items: [
                        "<strong>Bio Integration:</strong> View gift preferences in employee bio modal",
                        "<strong>Total Gifts:</strong> Count of all gifts received",
                        "<strong>Total Value:</strong> Sum of all gift prices",
                        "<strong>Recent Gifts:</strong> Gifts received in last 7 days",
                        "<strong>Favorite Gifts:</strong> Top 5 most-loved gifts displayed",
                        "Color-coded category badges (green for loves, red for hates)",
                        "Stat bonus explanations next to each preference",
                    ],
                },
                {
                    category: "📱 Social Media Integration",
                    items: [
                        "<strong>Expensive Gifts = Posts:</strong> Gifts over $100K trigger automatic social media posts",
                        "NPCs share their reactions publicly",
                        "Includes gift details (name, value, category)",
                        "Increases NPC fame and engagement",
                        "Visible on social feed with reactions",
                    ],
                },
                {
                    category: "🛡️ Anti-Exploit Features",
                    items: [
                        "<strong>UNIQUE Gift Tracking:</strong> One-time items can only be given once per save file",
                        "<strong>Gift Fatigue System:</strong> Prevents stat grinding with rapid gifting",
                        "<strong>Duplicate Detection:</strong> Encourages variety in gift selection",
                        "<strong>Price-Relationship Checks:</strong> Suspicious reactions to inappropriate gifts",
                        "Lifetime income tracking (THIS prestige only, resets on prestige)",
                        "Inventory unlimited but UNIQUE gifts tracked globally",
                    ],
                },
                {
                    category: "🎨 UI/UX Improvements",
                    items: [
                        "<strong>New Gifts Tab:</strong> Complete store interface with gradient styling",
                        "<strong>Gift Preview Modal:</strong> See all details before purchasing",
                        "<strong>Inventory Grid:</strong> Visual cards with hover effects",
                        "<strong>Delete Gifts:</strong> Remove unwanted items from inventory",
                        "<strong>Cycling Suggestions:</strong> Smooth 1.5-second transitions between ideas",
                        "<strong>Responsive Design:</strong> Works on all screen sizes",
                        "Color-coded visual language (pink for gifts, green for loves, red for hates)",
                    ],
                },
                {
                    category: "💾 Technical Implementation",
                    items: [
                        "<strong>~1500 Lines of Code:</strong> Complete feature with 15+ functions",
                        "<strong>Save/Load Support:</strong> All gift data persists correctly",
                        "<strong>Migration System:</strong> Old saves automatically get gift preferences",
                        "<strong>Performance Optimized:</strong> Efficient category lookups and calculations",
                        "Comprehensive error handling",
                        "Full documentation in GIFT_SYSTEM_COMPLETE.md",
                    ],
                },
            ],
        },
        {
            version: "2510170000",
            date: "October 17, 2025",
            title: "🤜 NPC Conversation Improvements",
            changes: [
                {
                    category: "✨ Improvements",
                    items: [
                        '<strong>Fixed repetitive "knuckles" descriptions:</strong> NPCs were constantly mentioning knuckles (whitening, clenching, tightening) in conversations. Added explicit ban on this overused trope with alternative body language suggestions (fidgeting, shifting weight, playing with hair/clothing, eye movements, breathing changes, facial expressions, etc.)',
                    ],
                },
            ],
        },
        {
            version: "2510162000",
            date: "October 16, 2025",
            title: "💰 Payment System Overhaul & Complete Save System",
            changes: [
                {
                    category: "✨ Major New Features",
                    items: [
                        "<strong>Company-Scaled NPC Spending:</strong> NPCs now develop spending habits that scale with company success (1.0x to 6.0x multiplier)",
                        "<strong>Gradual Lifestyle Adjustment:</strong> NPCs smoothly adapt their spending as your business grows (5% per tick)",
                        "<strong>Dynamic Money Requests:</strong> NPCs ask for amounts proportional to company size and their financial situation",
                        "<strong>Counter-Offer System:</strong> Send custom amounts with personal justifications when NPCs request money",
                        "<strong>Bank Balance Tracking:</strong> Each NPC tracks their cumulative money received and spending patterns",
                        "<strong>Lifestyle Inflation:</strong> NPCs develop more expensive habits when receiving money (+$1/day per $10K sent)",
                        "<strong>AI-Enhanced Requests:</strong> Smart, context-aware money requests based on financial need, personality, and relationship",
                        "<strong>Complete Save/Load System:</strong> Import/Export saves as JSON files with metadata and validation",
                        "<strong>Patch Notes System:</strong> View update history with timestamp-based versioning (YYMMDDHHMMSS format)",
                    ],
                },
                {
                    category: "💾 Save System Improvements",
                    items: [
                        "Export saves to JSON files with metadata (version, timestamp, player stats)",
                        "Import saves from files with validation and preview before loading",
                        "Save files include confirmation dialog showing money, employees, prestige level",
                        "Automatic filename generation with timestamps",
                        "Legacy save format detection and migration support",
                        "Pretty-printed JSON for easy editing and debugging",
                        "Full state restoration with UI refresh after import",
                    ],
                },
                {
                    category: "🐛 Critical Bug Fixes",
                    items: [
                        "<strong>Fixed black screen after prestiging</strong> - Now properly loads dashboard with full UI refresh",
                        "<strong>Fixed sandbox settings not saving</strong> - Personality attributes, conversation phase, and memory cap now persist correctly",
                        "Fixed personality attributes (confidence, outgoing, flirty, professional, humor) not being saved",
                        "Fixed conversation phase dropdown not persisting between edits",
                        "Fixed memory cap adjustments being lost after save",
                        "Prestige now forces complete UI refresh for all tabs (dashboard, business, people)",
                        "Added object initialization checks to prevent undefined property errors",
                    ],
                },
                {
                    category: "📈 Financial System Balance",
                    items: [
                        "<strong>Early game ($1K-$100K):</strong> NPCs spend $60-180/day, request $500-$3,000",
                        "<strong>Mid game ($1M):</strong> NPCs spend $125-375/day, request $2,000-$20,000",
                        "<strong>Late game ($100M):</strong> NPCs spend $225-675/day, request $10,000-$150,000",
                        "<strong>End game ($1B+):</strong> NPCs spend $300-900/day, request $50,000-$500,000+",
                        "Request probability scales with financial desperation (broke NPCs more likely to ask)",
                        "Spending rate caps at $50,000/day to prevent absurdity",
                        "Request probability caps at 35% maximum to prevent spam",
                    ],
                },
                {
                    category: "🎨 UI Enhancements",
                    items: [
                        "Redesigned Data Management section with color-coded buttons",
                        "Added emojis and better labels for all save/load actions",
                        "New Patch Notes modal with organized categories and version history",
                        "Improved notification messages with context and status",
                        "Better visual hierarchy in settings panel",
                        "Confirmation dialogs show detailed info before destructive actions",
                    ],
                },
                {
                    category: "⚙️ Technical Improvements",
                    items: [
                        "Added <code>calculateScaledSpendingRate()</code> function for company-scaled spending",
                        "Added <code>adjustEmployeeLifestyles()</code> for gradual lifestyle creep",
                        "Enhanced <code>considerMoneyRequest()</code> with financial intelligence",
                        "Improved <code>sendMoneyToNPC()</code> with better framing and reactions",
                        "New <code>loadSaveData()</code> function for complete state restoration",
                        "Added <code>handleImportedFile()</code> for file validation and parsing",
                        "Enhanced <code>exportSave()</code> with metadata and pretty printing",
                        "Better error handling and user feedback throughout save/load system",
                    ],
                },
            ],
        },
        {
            version: "202605221500",
            date: "May 22, 2026",
            title: "🗓️ NPC SCHEDULES, GALLERY PRESERVATION & UI POLISH",
            changes: [
                {
                    category: "🗓️ NPC Schedule System",
                    items: [
                        '• <strong>NPCs now have detailed minute-by-minute daily schedules</strong> — instead of just showing "Online", you can see exactly what they\'re doing at any point in the day',
                        "• Schedule activities are contextually linked to NPC conversations and social posts, making their behavior feel more coherent and grounded",
                    ],
                },
                {
                    category: "📸 Image & Gallery Fixes",
                    items: [
                        "• <strong>FIXED:</strong> Images were sometimes not generating or disappearing from social posts — this has been resolved",
                        "• <strong>NEW:</strong> Images from pruned posts are now preserved in the NPC's photo gallery — even after old posts are removed to reduce save size, their images remain accessible",
                        "• <strong>FIXED:</strong> Post pruning was incorrectly removing the <em>newest</em> posts instead of the oldest — the system now correctly removes the oldest posts first as intended",
                    ],
                },
                {
                    category: "⚙️ Settings & Menu",
                    items: [
                        "• <strong>RESTORED:</strong> Menu options to control AI Queue-limit thresholds are back — these were removed during a prior menu redesign and have now been reinstated",
                    ],
                },
                {
                    category: "📱 UI & Mobile Improvements",
                    items: [
                        "• <strong>Top-bar collapse improved</strong> — the toggle element no longer overlaps and blocks gameplay (still being refined)",
                        "• Social Feed and Meetings tabs have improved layout and visibility on mobile screens",
                        "• Subtle spacing and density adjustments throughout the UI to make the mobile experience feel tighter and more usable (ongoing)",
                        '• "Beautifying" adjustments to certain race descriptions for improved AI image generation quality',
                    ],
                },
            ],
        },
        {
            version: "202605291200",
            date: "May 29, 2026",
            title: "👥 GROUPS OVERHAUL, STREAMING AI & UI POLISH",
            changes: [
                {
                    category: "👥 Groups — Conversations No Longer Stall",
                    items: [
                        "<strong>FIXED — the big one:</strong> Typing a message in a group and hitting Send used to do <em>nothing</em> unless you first manually clicked portraits to queue speakers. Now the group <strong>responds automatically</strong> — the most relevant participants reply on their own.",
                        "<strong>Smart responder selection:</strong> whoever you address by name jumps in first, alongside outgoing personalities and those who are into you; people who just spoke step back so the same voices don't dominate.",
                        "<strong>NEW — Replies-per-message setting:</strong> a slider in Group Settings (1–5, default 2) controls how many people answer when you don't hand-pick speakers. The advertised reply limit is back.",
                        "<strong>Natural pacing:</strong> when several people respond, their messages now arrive one at a time with a short, lifelike delay instead of dumping all at once.",
                        "Manually queueing speakers (click a face to set an order, double-click for an instant reply) still works as a power-user override.",
                    ],
                },
                {
                    category: "👥 Groups — Manage Your Roster",
                    items: [
                        '<strong>FIXED — "+ Add Participant" now works.</strong> The button in Group Settings was wired to nothing; you could remove people but never add them. You can now add any active employees to an existing group (multi-select, with an in-chat announcement).',
                        "<strong>FIXED — no more ghost members.</strong> Employees you fired (or who left) used to linger in your groups forever. They're now automatically removed from every group when fired and again on game load.",
                        "<strong>NEW — group size cap (8).</strong> Oversized groups quietly degraded every AI response by overflowing the context budget; group size is now capped with a clear message.",
                    ],
                },
                {
                    category: "📊 Groups — Meeting Recap & Stats",
                    items: [
                        "<strong>NEW — Meeting Recap (📊 in the group header):</strong> see at-a-glance stats for the meeting — total messages, participant count, images shared, and total money sent.",
                        "<strong>Who-talked-most breakdown</strong> ranks participants by how much they contributed.",
                        "<strong>AI Meeting Summary:</strong> generate a concise 2–4 sentence recap of what actually happened in the conversation — topics, decisions, tension, and mood. Summaries are saved and can be regenerated.",
                    ],
                },
                {
                    category: "🧠 Smarter Group Memory",
                    items: [
                        "<strong>Less noise, better recall:</strong> groups used to dump every single line into every participant's long-term memory, flooding it and pushing out genuinely important facts. Now only <strong>salient moments</strong> (promotions, gifts, romantic/intimate beats, conflicts, etc.) are remembered — attributed to who said them.",
                    ],
                },
                {
                    category: "🌊 Streaming AI Responses",
                    items: [
                        "<strong>NEW:</strong> AI responses now <strong>stream in word-by-word</strong> as they generate, with a live typing bubble and blinking cursor, instead of appearing all at once after a wait.",
                        "Applies to <strong>1-on-1 chat, group chat, and encounter narration</strong>.",
                        "Toggle it any time under <strong>Settings → AI &amp; Performance → 🌊 Stream AI Responses</strong> (on by default).",
                    ],
                },
                {
                    category: "🧭 Collapsible Top Bar (Menu Toggle)",
                    items: [
                        "<strong>NEW — header/menu collapse toggle (▲/▼):</strong> collapse the stats top bar and news ticker and shrink the tab navigation to icons-only to reclaim screen space for the game — especially handy on mobile.",
                        "Your collapsed/expanded preference is <strong>remembered across sessions</strong>, the toggle stays put and accessible, and the transition is smooth.",
                    ],
                },
                {
                    category: "🎨 UI & Mobile Polish",
                    items: [
                        "<strong>Clearer guidance:</strong> a persistent hint under the participant bar now explains that typing makes the group reply, and tapping a face picks who speaks next.",
                        '<strong>Cleaner action menu:</strong> "Visualize Scene" no longer shares the Send button\'s color, so the primary action stands out.',
                        "<strong>Better touch targets:</strong> group buttons now reliably hit the 44px tap-target size on touch and hybrid (touchscreen-laptop) devices, plus a new layout pass for very small phones (≤400px).",
                        "Quieter console: verbose group auto-visualization debug logging is now off by default.",
                    ],
                },
            ],
        },
        {
            version: "202607171800",
            date: "July 17, 2026",
            title: "🐛 Bug Fix Patch — Prestige, Saves & Imports",
            changes: [
                {
                    category: "💥 Prestige & Saves — No More Crashes",
                    items: [
                        "<strong>FIXED:</strong> Prestige was hard-crashing for players with big, long-running saves — you couldn't prestige at all. Squashed for good, no matter how large your save has grown.",
                        "<strong>FIXED:</strong> Exporting a save could fail the exact same way on large saves. Exports now go through reliably.",
                    ],
                },
                {
                    category: "🎭 Character Import — Keeps What You Actually Set",
                    items: [
                        "<strong>FIXED:</strong> Importing a character used to quietly reset their grooming, ethnicity, and accessories back to random defaults. Imported characters now come through exactly as you made them.",
                    ],
                },
                {
                    category: "⚔️ Boss Fights",
                    items: [
                        "<strong>FIXED:</strong> Boss portraits turning into a broken-image icon after you prestige. Bosses get their artwork back right away now.",
                    ],
                },
                {
                    category: "📸 Photos",
                    items: [
                        "<strong>FIXED:</strong> Solo photo requests could occasionally render a random extra person lurking in the background. Solo means solo now.",
                    ],
                },
                {
                    category: "🎁 Gifts — Easier to Manage",
                    items: [
                        "<strong>NEW:</strong> Gift cards now show the description you crafted instead of hiding it — no more guessing what a gift actually says.",
                        "<strong>NEW:</strong> Edit buttons are labeled now (Add Image, Rewrite, Vault, Delete) instead of unlabeled icons nobody could decode.",
                    ],
                },
                {
                    category: "⚙️ Settings Cleanup",
                    items: [
                        '<strong>REMOVED:</strong> The "Animation Quality" slider in Settings — it never actually did anything. One less confusing dead control.',
                    ],
                },
            ],
        },
    ].reverse();
    n.forEach((e, a) => {
        t += `\n        <div style="background:var(--surface-2); border-radius:12px; padding:20px; margin-bottom:${a < n.length - 1 ? "20px" : "0"}; border:1px solid var(--l-indigo);">\n          <div style="margin-bottom:15px;">\n            <div style="display:flex; justify-content:space-between; align-items:start; flex-wrap:wrap; gap:10px;">\n              <div>\n                <h3 style="margin:0 0 5px 0; color:var(--l-indigo); font-size:1.5rem;">${e.title}</h3>\n                <div style="color:var(--text-dim); font-size:0.9rem;">${e.date}</div>\n              </div>\n              <div style="background:rgba(102,126,234,0.2); padding:6px 12px; border-radius:6px; border:1px solid var(--l-indigo);">\n                <span style="color:var(--l-indigo); font-family:monospace; font-size:0.85rem;">v${e.version}</span>\n              </div>\n            </div>\n          </div>\n          \n          ${e.changes.map((e) => `\n            <div style="margin-bottom:20px;">\n              <h4 style="margin:0 0 12px 0; color:var(--accent); font-size:1.1rem;">${e.category}</h4>\n              <ul style="margin:0; padding-left:20px; color:var(--l-ink-cool-3);">\n                ${e.items.map((e) => `<li style="margin-bottom:8px; line-height:1.5;">${e}</li>`).join("")}\n              </ul>\n            </div>\n          `).join("")}\n        </div>\n      `;
    }),
        (e.innerHTML = t);
}
