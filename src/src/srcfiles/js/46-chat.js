// ============================================================================
// 46-chat — Chat UI: chat history, addChatMessage, sendChatMessage, npc action bar, counter-offer flow, image/photo requests.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function showCreateFamilyMemberModal(e) {
    const t = document.createElement("div");
    (t.id = "createFamilyModal"),
        (t.style.cssText =
            "\n      position: fixed; top: 0; left: 0; right: 0; bottom: 0;\n      background: var(--l-veil-90); z-index: 100002;\n      display: flex; align-items: center; justify-content: center;\n      padding: 20px; box-sizing: border-box;\n    "),
        (t.innerHTML = `\n      <div style="background:linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%); border-radius:16px; max-width:500px; width:100%; border:2px solid var(--l-pink); box-shadow:0 20px 60px var(--l-veil-50);">\n        <div style="padding:20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">\n          <h2 style="margin:0; color:var(--l-pink);">👨‍👩‍👧 Create Family Member</h2>\n          <button id="closeFamilyModal" style="background:none; border:none; color:var(--text-mute); font-size:24px; cursor:pointer;">&times;</button>\n        </div>\n        \n        <div style="padding:20px;">\n          <p style="color:var(--text-dim); margin-bottom:20px;">\n            Create a family member for <strong style="color:var(--l-ink);">${e.name}</strong>. \n            They'll inherit ethnicity and some physical features.\n          </p>\n          \n          <div style="margin-bottom:20px;">\n            <label style="display:block; color:var(--l-pink); font-size:0.9rem; margin-bottom:8px; font-weight:600;">Relationship Type</label>\n            <select id="familyRelationType" style="width:100%; padding:12px; background:var(--bg); border:1px solid var(--l-pink); border-radius:8px; color:var(--l-ink); font-size:1rem;">\n              <optgroup label="Parents">\n                <option value="mother">Mother</option>\n                <option value="father">Father</option>\n                <option value="stepmother">Stepmother</option>\n                <option value="stepfather">Stepfather</option>\n              </optgroup>\n              <optgroup label="Siblings">\n                <option value="sister">Sister</option>\n                <option value="brother">Brother</option>\n                <option value="stepsister">Stepsister</option>\n                <option value="stepbrother">Stepbrother</option>\n              </optgroup>\n              <optgroup label="Children (18+)">\n                <option value="daughter">Daughter</option>\n                <option value="son">Son</option>\n              </optgroup>\n              <optgroup label="Extended Family">\n                <option value="aunt">Aunt</option>\n                <option value="uncle">Uncle</option>\n                <option value="cousin">Cousin</option>\n              </optgroup>\n              <optgroup label="Partners">\n                <option value="spouse">Spouse</option>\n                <option value="exSpouse">Ex-Spouse</option>\n              </optgroup>\n            </select>\n          </div>\n          \n          <div id="familyPreview" style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:20px;">\n            <div style="color:var(--text-dim); font-size:0.85rem; margin-bottom:10px;">Preview:</div>\n            <div id="familyPreviewContent" style="color:var(--l-ink);">\n              <span style="color:var(--l-pink);">Mother</span> of ${e.name}\n              <div style="color:var(--text-dim); font-size:0.8rem; margin-top:5px;">Will be ${e.age + 25}-${e.age + 35} years old</div>\n            </div>\n          </div>\n          \n          <div style="display:flex; gap:10px;">\n            <button id="cancelFamilyBtn" style="flex:1; padding:12px; background:var(--l-neutral-3); border:none; border-radius:8px; color:var(--text-dim); cursor:pointer; font-weight:600;">\n              Cancel\n            </button>\n            <button id="createFamilyBtn" style="flex:1; padding:12px; background:linear-gradient(135deg, var(--l-pink) 0%, var(--l-violet) 100%); border:none; border-radius:8px; color:var(--l-on-accent); cursor:pointer; font-weight:600;">\n              ✨ Create & Hire\n            </button>\n          </div>\n        </div>\n      </div>\n    `),
        document.body.appendChild(t);
    const n = t.querySelector("#familyRelationType"),
        a = t.querySelector("#familyPreviewContent");
    (n.onchange = () => {
        const t = FAMILY_RELATIONSHIP_TYPES[n.value];
        if (t) {
            let n = "";
            const o = e.age || 28;
            if ("older" === t.ageDirection) {
                n = `Will be ${o + t.ageAdjust[0]}-${o + t.ageAdjust[1]} years old`;
            } else if ("younger" === t.ageDirection) n = "Will be 18-34 years old (adult children only)";
            else {
                n = `Will be ${Math.max(18, o + t.ageAdjust[0])}-${o + t.ageAdjust[1]} years old`;
            }
            a.innerHTML = `\n          <span style="color:var(--l-pink);">${t.label}</span> of ${e.name}\n          <div style="color:var(--text-dim); font-size:0.8rem; margin-top:5px;">${n}</div>\n          ${t.genderLock ? `<div style="color:var(--l-violet); font-size:0.8rem;">Gender: ${"male" === t.genderLock ? "Male" : "Female"}</div>` : ""}\n        `;
        }
    }),
        (t.querySelector("#closeFamilyModal").onclick = () => t.remove()),
        (t.querySelector("#cancelFamilyBtn").onclick = () => t.remove()),
        (t.onclick = (e) => {
            e.target === t && t.remove();
        }),
        (t.querySelector("#createFamilyBtn").onclick = async () => {
            const a = n.value,
                o = FAMILY_RELATIONSHIP_TYPES[a],
                i = generateFamilyMemberData(e, a);
            if (!i) return void showNotification("❌ Failed to generate family member", "error");
            t.remove();
            const s = document.getElementById("unifiedProfileModal");
            s && s.remove(),
                showNotification(
                    `🤖 Generating ${o.label.toLowerCase()} for ${e.name}... This may take a moment.`,
                    "info",
                    1e4
                ),
                (async () => {
                    try {
                        const t = `\nSource Employee: ${e.name}\nAge: ${e.age}\nGender: ${e.gender}\nEthnicity: ${e.ethnicity || "not specified"}\nPersonality: ${e.personalityTraits?.join(", ") || "various"}\nKey Trait: ${e.keyTrait || "unknown"}\nBio: ${e.bio || "A company employee"}`,
                            partnerCtx = i.existingPartnerInfo
                                ? `\n\nIMPORTANT: ${e.name} already has an established ${i.existingPartnerInfo.relationshipType || "relationship"} with this exact person (${i.name})${i.existingPartnerInfo.occupation ? `, who works as a(n) ${i.existingPartnerInfo.occupation}` : ""}${i.existingPartnerInfo.yearsTogether ? `. They have been together ${i.existingPartnerInfo.yearsTogether} year(s)` : ""}${i.existingPartnerInfo.hasKids ? " and have kids together" : ""}${i.existingPartnerInfo.endReason ? ` (the relationship ended due to ${i.existingPartnerInfo.endReason})` : ""}. The bio you write MUST be consistent with this existing history, not a fresh unrelated backstory.`
                                : "",
                            n = `Create a detailed character profile for someone who is the ${o.label.toUpperCase()} of this person:\n${t}${partnerCtx}\n\nThe new family member's basic info:\n- Name: ${i.name}\n- Age: ${i.age}\n- Gender: ${i.gender}\n- Race: ${i.race}\n- Ethnicity: ${i.ethnicity || "same as source"}\n\nCreate a complete profile that makes sense for this family relationship. The ${o.label.toLowerCase()} should have their own distinct personality while sharing some family traits.\n\nReturn ONLY a JSON object (no markdown, no explanation) with these fields:\n{\n  "bio": "<2-3 sentence background mentioning their relationship to ${e.name} and their own life/career path>",\n  "personalityTraits": ["trait1", "trait2", "trait3"],\n  "keyTrait": "<single defining characteristic>",\n  "hobbies": ["hobby1", "hobby2"],\n  "kinks": ["preference1", "preference2", "preference3"],\n  "personality": {\n    "confidence": <10-90>,\n    "outgoing": <10-90>,\n    "flirty": <10-90>,\n    "professional": <10-90>,\n    "humor": <10-90>\n  },\n  "physical": {\n    "hairColor": "<color>",\n    "hairStyle": "<style>",\n    "hairLength": "<length>",\n    "hairTexture": "<texture>",\n    "eyeColor": "<color>",\n    "eyeShape": "<shape>",\n    "skinTone": "<tone>",\n    "bodyShape": "<body type>",\n    "heightBuild": "<height and build>",\n    "breastSize": "<size description>",\n    "buttSize": "<size description>",\n    "fashion": "<clothing style>",\n    "accessories": "<any accessories or none>",\n    "notableFeatures": "<distinguishing features>"\n  }\n}`;
                        let s = null;
                        if ("function" == typeof queuedGenerateText) {
                            const t = await queuedGenerateText(n, {}, `Family Member - ${o.label} of ${e.name}`);
                            try {
                                const e = t.match(/\{[\s\S]*\}/);
                                e && (s = JSON.parse(e[0]));
                            } catch (e) {
                                console.warn("Failed to parse AI response for family member, using defaults:", e);
                            }
                        }
                        s
                            ? ((i.bio =
                                  s.bio || `${e.name}'s ${o.label.toLowerCase()}, recently joined the company.`),
                              (i.personalityTraits = s.personalityTraits || i.personalityTraits),
                              (i.keyTrait = s.keyTrait || i.keyTrait),
                              (i.hobbies = s.hobbies || i.hobbies),
                              (i.kinks = s.kinks || i.kinks),
                              s.personality && (i.personality = s.personality))
                            : (i.bio = `${e.name}'s ${o.label.toLowerCase()}. Recently joined the company to work alongside family.`),
                            (i.physical = generateDetailedPhysicalAppearance(i.gender, i.race, i.ethnicity)),
                            i.inheritedFeatures &&
                                (i.inheritedFeatures.eyeColor &&
                                    i.physical.eyes &&
                                    (i.physical.eyes.color = i.inheritedFeatures.eyeColor),
                                i.inheritedFeatures.hairColor &&
                                    i.physical.hair &&
                                    (i.physical.hair.color = i.inheritedFeatures.hairColor),
                                i.inheritedFeatures.skinTone &&
                                    i.physical.skin &&
                                    (i.physical.skin.tone = i.inheritedFeatures.skinTone)),
                            s?.physical &&
                                (s.physical.hairColor &&
                                    i.physical.hair &&
                                    (i.physical.hair.color = s.physical.hairColor),
                                s.physical.hairStyle &&
                                    i.physical.hair &&
                                    (i.physical.hair.style = s.physical.hairStyle),
                                s.physical.hairLength &&
                                    i.physical.hair &&
                                    (i.physical.hair.length = s.physical.hairLength),
                                s.physical.hairTexture &&
                                    i.physical.hair &&
                                    (i.physical.hair.texture = s.physical.hairTexture),
                                s.physical.eyeColor &&
                                    i.physical.eyes &&
                                    (i.physical.eyes.color = s.physical.eyeColor),
                                s.physical.eyeShape &&
                                    i.physical.eyes &&
                                    (i.physical.eyes.shape = s.physical.eyeShape),
                                s.physical.skinTone &&
                                    i.physical.skin &&
                                    (i.physical.skin.tone = s.physical.skinTone),
                                s.physical.bodyShape &&
                                    ((i.physical.bodyShape = s.physical.bodyShape),
                                    i.physical.body && (i.physical.body.shape = s.physical.bodyShape)),
                                s.physical.heightBuild && (i.physical.heightBuild = s.physical.heightBuild),
                                s.physical.breastSize &&
                                    ((i.physical.breastSize = s.physical.breastSize),
                                    i.physical.body && (i.physical.body.chestSize = s.physical.breastSize)),
                                s.physical.buttSize &&
                                    ((i.physical.buttSize = s.physical.buttSize),
                                    i.physical.body && (i.physical.body.buttSize = s.physical.buttSize)),
                                s.physical.fashion && (i.physical.fashion = s.physical.fashion),
                                s.physical.accessories && (i.physical.accessories = s.physical.accessories),
                                s.physical.notableFeatures &&
                                    (i.physical.notableFeatures = s.physical.notableFeatures));
                        const r = i.physical.hair?.length || i.physical.hair?.style || "styled",
                            l = i.physical.hair?.color || "dark",
                            c = i.physical.eyes?.color || "brown",
                            d = i.physical.skin?.tone || "fair",
                            p = i.physical.body?.shape || i.physical.bodyShape || "average",
                            m = i.physical.heightBuild || "average height",
                            u = "male" === i.gender ? "man" : "femaleFuta" === i.gender ? "futa" : "woman";
                        i.physical.shortDescription = `${m} ${p} ${u} with ${r} ${l} hair, ${c} eyes, ${d} skin`;
                        const g = {
                            ...i,
                            physical: {
                                hairColor: i.physical.hair?.color,
                                hairStyle: i.physical.hair?.style,
                                hairLength: i.physical.hair?.length,
                                hairTexture: i.physical.hair?.texture,
                                eyeColor: i.physical.eyes?.color,
                                eyeShape: i.physical.eyes?.shape,
                                skinTone: i.physical.skin?.tone,
                                bodyShape: i.physical.body?.shape || i.physical.bodyShape,
                                heightBuild: i.physical.heightBuild,
                                breastSize: i.physical.body?.chestSize || i.physical.breastSize,
                                buttSize: i.physical.body?.buttSize || i.physical.buttSize,
                                fashion: i.physical.fashion,
                                accessories: i.physical.accessories,
                                notableFeatures: i.physical.notableFeatures,
                            },
                            pendingFamilyLink: { relatedTo: e.id, relationship: a },
                        };
                        delete g.inheritedFeatures, delete g.pendingFamilyRelation;
                        const h = gameState.products.find((e) => e.unlocked && !e.managerHired),
                            y = h?.id || gameState.products.find((e) => e.unlocked)?.id || "coffee";
                        showNotification(
                            `✨ ${o.label} character generated! Review and confirm to hire.`,
                            "success"
                        ),
                            showCharacterConfirmationModal(g, y, `${o.label} of ${e.name}`);
                    } catch (e) {
                        console.error("Error during AI generation for family member:", e),
                            showNotification("❌ Failed to generate family member. Please try again.", "error");
                    }
                })();
        });
}
function loadChatHistory(e) {
    if (!chatMessages) return;
    chatMessages.innerHTML = "";
    (gameState.chatHistory[e] || []).forEach((t, n) => {
        if (t.isMoneyRequest && !t.isPlayer) {
            const a = gameState.employees.find((t) => t.id === e);
            if (a) {
                addMoneyRequestMessage(a, t.amount || 100, t.reason, n, t.settled);
            }
        } else if ("scene" === t.imageType) {
            const e = document.createElement("div");
            e.style.cssText =
                "max-width:80%; padding:10px; margin:10px auto; text-align:center; position:relative;";
            const a = document.createElement("div");
            a.style.cssText = "position:relative; display:inline-block; max-width:400px; width:100%;";
            const o = document.createElement("img");
            if (
                ((o.src = t.imageUrl),
                (o.style.cssText =
                    "width:100%; border-radius:10px; cursor:pointer; box-shadow:0 2px 10px var(--l-veil-30); display:block;"),
                (o.onclick = () => {
                    const e = document.createElement("div");
                    (e.style.cssText =
                        "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-90); z-index:99999; display:flex; justify-content:center; align-items:center; cursor:pointer;"),
                        (e.innerHTML = `<img src="${t.imageUrl}" style="max-width:90%; max-height:90%; border-radius:10px;">`),
                        (e.onclick = () => e.remove()),
                        document.body.appendChild(e);
                }),
                a.appendChild(o),
                t.imagePrompt)
            ) {
                const e = document.createElement("button");
                (e.innerHTML = "🔄"),
                    (e.style.cssText =
                        "position:absolute; top:5px; right:5px; background:var(--l-veil-60); border:none; border-radius:50%; width:28px; height:28px; color:var(--l-ink); cursor:pointer; font-size:1rem; opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center;"),
                    (e.title = "Regenerate image"),
                    a.appendChild(e),
                    a.addEventListener("mouseenter", () => {
                        e.style.opacity = "1";
                    }),
                    a.addEventListener("mouseleave", () => {
                        e.style.opacity = "0";
                    }),
                    e.addEventListener("click", async (e) => {
                        e.stopPropagation(), await regenerateImage(n, t.imagePrompt);
                    });
            }
            const i = document.createElement("p");
            (i.style.cssText = "margin:8px 0 0 0; color:var(--text-dim); font-size:0.85rem; font-style:italic;"),
                (i.textContent = t.content),
                e.appendChild(a),
                e.appendChild(i),
                chatMessages.appendChild(e);
        } else if ("auto-scene" === t.imageType) {
            const a = document.createElement("div");
            (a.style.cssText =
                "max-width:85%; padding:10px; margin:10px auto; text-align:center; background:rgba(233,69,96,0.1); border-radius:12px; border:1px solid rgba(233,69,96,0.3);"),
                (a.dataset.messageIndex = n);
            const o = document.createElement("img");
            (o.src = t.imageUrl),
                (o.style.cssText =
                    "width:100%; max-width:450px; border-radius:10px; cursor:pointer; box-shadow:0 4px 15px var(--l-veil-40);"),
                (o.onclick = () => {
                    const e = document.createElement("div");
                    (e.style.cssText =
                        "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-90); z-index:99999; display:flex; justify-content:center; align-items:center; cursor:pointer;"),
                        (e.innerHTML = `<img src="${t.imageUrl}" style="max-width:90%; max-height:90%; border-radius:10px;">`),
                        (e.onclick = () => e.remove()),
                        document.body.appendChild(e);
                });
            const i = document.createElement("p");
            i.style.cssText = "margin:8px 0 0 0; color:var(--l-pink); font-size:0.8rem; font-style:italic;";
            const s =
                {
                    "first-person": "👤 First-Person POV",
                    "third-person": "🎥 Third-Person View",
                    cinematic: "🎬 Cinematic Shot",
                    intimate: "💕 Intimate Close-Up",
                    voyeur: "🔭 Voyeur Perspective",
                    dynamic: "🎲 Dynamic View",
                }[t.perspective] || "🎬 Auto Scene";
            i.textContent = `${s} • Auto-Generated${t.regenerationCount ? ` (${t.regenerationCount}x)` : ""}`;
            const r = document.createElement("button");
            (r.className = "auto-vis-regen-btn"),
                (r.innerHTML = "🔄 Regenerate" + (t.regenerationCount ? ` (${t.regenerationCount}x)` : "")),
                (r.style.cssText =
                    "margin-top:8px; padding:6px 14px; background:rgba(233,69,96,0.3); border:1px solid var(--danger); border-radius:6px; color:var(--l-pink); cursor:pointer; font-size:0.8rem; transition:all 0.2s;"),
                (r.onmouseenter = () => {
                    (r.style.background = "rgba(233,69,96,0.5)"), (r.style.color = "var(--l-ink)");
                }),
                (r.onmouseleave = () => {
                    (r.style.background = "rgba(233,69,96,0.3)"), (r.style.color = "var(--l-pink)");
                });
            const l = n,
                c = a;
            (r.onclick = async (t) => {
                t.stopPropagation(), await regenerateAutoVisualization(e, l, c);
            }),
                a.appendChild(o),
                a.appendChild(i),
                a.appendChild(r),
                chatMessages.appendChild(a);
        } else
            t.giftData
                ? addGiftMessage(t.sender, t.content, t.giftData, t.isPlayer)
                : addChatMessage(
                      t.sender,
                      t.content,
                      t.isPlayer,
                      t.imageUrl,
                      n,
                      t.imagePrompt,
                      t.timestamp,
                      t.isNarrator,
                      t.isStoryRecap
                  );
    }),
        (chatMessages.scrollTop = chatMessages.scrollHeight);
}
function styleActionText(e) {
    if (!e) return "";
    let t = e
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\*\*([^*]+)\*\*/g, (e, t) => `<span style="color:var(--l-ink); font-weight:600;">${t}</span>`);
    return (
        (t = t.replace(
            /\*([^*]+)\*/g,
            (e, t) => `<span style="color:var(--text-mute); font-style:italic; opacity:0.85;">${t}</span>`
        )),
        (t = t.replace(/→/g, '<span style="color:var(--l-indigo);">→</span>')),
        t
    );
}
function getContextAwareTimestamp(e = null) {
    const t = e || gameState.time?.currentTime || Date.now(),
        n = new Date(t),
        a = n.getHours(),
        o = n.getMinutes(),
        i = a >= 12 ? "PM" : "AM";
    let s = "";
    return (
        (s =
            a >= 5 && a < 12
                ? "Morning"
                : a >= 12 && a < 17
                  ? "Afternoon"
                  : a >= 17 && a < 21
                    ? "Evening"
                    : "Night"),
        `${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][n.getDay()]} ${s}, ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][n.getMonth()]} ${n.getDate()} • ${`${a % 12 || 12}:${o.toString().padStart(2, "0")} ${i}`}`
    );
}
function addChatMessage(e, t, n, a = null, o = null, i = null, s = null, r = !1, l = !1) {
    if (!chatMessages) return;
    const c = gameState.settings.imagePreviewSize || 300,
        d = a ? `${c + 40}px` : "80%",
        p = document.createElement("div");
    s && (p.dataset.timestamp = s),
        (p.className =
            "chat-bubble " +
            (l ? "chat-bubble--memory" : r ? "chat-bubble--narrator" : n ? "chat-bubble--self" : "chat-bubble--other")),
        (p.style.cssText = l
            ? "max-width:95%; padding:15px 20px; margin:20px 0; word-wrap:break-word; position:relative; border-radius:12px; align-self:center;"
            : r
              ? "max-width:90%; padding:12px 20px; margin:15px 0; word-wrap:break-word; position:relative; border-radius:12px; align-self:center;"
              : `max-width:${d}; padding:10px 15px; border-radius:18px; margin-bottom:10px; word-wrap:break-word; position:relative; ${n ? "align-self:flex-end;" : "align-self:flex-start;"}`);
    const m = document.createElement("div");
    if (
        ((m.style.cssText = "font-size:0.7rem; opacity:0.6; margin-bottom:6px; font-style:italic;"),
        (m.textContent = s ? getContextAwareTimestamp(s) : getContextAwareTimestamp()),
        p.appendChild(m),
        l)
    ) {
        const e = document.createElement("div");
        (e.style.cssText =
            "display:flex; align-items:center; gap:8px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(102,126,234,0.2);"),
            (e.innerHTML =
                '<span style="font-size:1.2rem;">📖</span><span style="color:var(--l-indigo); font-weight:600; font-size:0.9rem;">Story Memory</span><span style="color:var(--text-mute); font-size:0.75rem; margin-left:auto;">This character remembers...</span>'),
            p.appendChild(e);
    } else if (r) {
        const e = document.createElement("div");
        (e.style.cssText = "display:flex; align-items:center; gap:8px; margin-bottom:8px;"),
            (e.innerHTML =
                '<span style="font-size:1rem;">📜</span><span style="color:var(--l-violet); font-weight:600; font-size:0.85rem;">Narrator</span>'),
            p.appendChild(e);
    }
    if (n && null !== o) {
        const e = document.createElement("div");
        (e.style.cssText =
            "position:absolute; top:5px; right:5px; display:flex; gap:4px; opacity:0.01; transition:opacity 0.2s;"),
            (e.className = "message-action-buttons");
        const t = document.createElement("button");
        (t.innerHTML = "✏️"),
            (t.className = "edit-msg-btn"),
            (t.style.cssText =
                "background:rgba(255,152,0,0.8); border:none; border-radius:50%; width:24px; height:24px; color:var(--l-ink); cursor:pointer; font-size:0.8rem; display:flex; align-items:center; justify-content:center; padding:0;"),
            t.setAttribute("data-message-index", o),
            (t.title = "Edit message"),
            t.addEventListener("click", (e) => {
                e.stopPropagation(), editPlayerMessage(o);
            });
        const n = document.createElement("button");
        (n.innerHTML = "🔄"),
            (n.className = "resend-msg-btn"),
            (n.style.cssText =
                "background:rgba(76,175,80,0.8); border:none; border-radius:50%; width:24px; height:24px; color:var(--l-ink); cursor:pointer; font-size:0.8rem; display:flex; align-items:center; justify-content:center; padding:0;"),
            n.setAttribute("data-message-index", o),
            (n.title = "Resend message"),
            n.addEventListener("click", (e) => {
                e.stopPropagation(), resendPlayerMessage(o);
            }),
            e.appendChild(t),
            e.appendChild(n),
            p.appendChild(e),
            p.addEventListener("mouseenter", () => {
                e.style.opacity = "1";
            }),
            p.addEventListener("mouseleave", () => {
                e.style.opacity = "0.01";
            });
    }
    if (!n && null !== o) {
        const e = document.createElement("button");
        (e.innerHTML = "♻️"),
            (e.className = "regenerate-btn"),
            (e.style.cssText =
                "position:absolute; top:5px; right:5px; background:rgba(33,150,243,0.8); border:none; border-radius:50%; width:24px; height:24px; color:var(--l-ink); cursor:pointer; font-size:0.9rem; opacity:0.01; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; padding:0;"),
            e.setAttribute("data-message-index", o),
            (e.title = "Regenerate response (click for new variation)"),
            p.appendChild(e),
            p.addEventListener("mouseenter", () => {
                e.style.opacity = "1";
            }),
            p.addEventListener("mouseleave", () => {
                e.style.opacity = "0.01";
            }),
            e.addEventListener("click", async (e) => {
                e.stopPropagation(), await regenerateMessage(o);
            });
    }
    if (a) {
        const e = document.createElement("div"),
            t = gameState.settings.imagePreviewSize || 300;
        e.style.cssText = `position:relative; display:inline-block; width:100%; max-width:${t}px;`;
        const n = document.createElement("img");
        if (
            ((n.src = a),
            (n.style.cssText = "width:100%; border-radius:10px; margin-bottom:8px; cursor:pointer; display:block;"),
            (n.onclick = () => {
                const e = document.createElement("div");
                (e.style.cssText =
                    "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-90); z-index:99999; display:flex; justify-content:center; align-items:center; cursor:pointer;"),
                    (e.innerHTML = `<img src="${a}" style="max-width:90%; max-height:90%; border-radius:10px;">`),
                    (e.onclick = () => e.remove()),
                    document.body.appendChild(e);
            }),
            e.appendChild(n),
            i && null !== o)
        ) {
            const t = document.createElement("button");
            (t.innerHTML = "🔄"),
                (t.style.cssText =
                    "position:absolute; top:5px; right:5px; background:var(--l-veil-60); border:none; border-radius:50%; width:28px; height:28px; color:var(--l-ink); cursor:pointer; font-size:1rem; opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center;"),
                (t.title = "Regenerate image"),
                e.appendChild(t),
                e.addEventListener("mouseenter", () => {
                    t.style.opacity = "1";
                }),
                e.addEventListener("mouseleave", () => {
                    t.style.opacity = "0";
                }),
                t.addEventListener("click", async (e) => {
                    e.stopPropagation(), await regenerateImage(o, i);
                });
        }
        p.appendChild(e);
    }
    const u = document.createElement("p");
    (u.style.margin = "0"), (u.style.marginBottom = n ? "0" : "8px");
    const g = styleActionText(t);
    if (((u.innerHTML = g), p.appendChild(u), !n && null !== o)) {
        const e = document.createElement("div");
        e.style.cssText =
            "display:flex; align-items:center; gap:4px; background:var(--bg); border-radius:12px; padding:2px 4px; width:fit-content; margin-top:6px;";
        const t = "string" == typeof gameState.activeChat ? gameState.activeChat : gameState.activeChat?.id,
            n = (gameState.chatHistory[t] || [])[o],
            a = document.createElement("button");
        (a.style.cssText = `background:${"up" === n?.playerVote ? "rgba(255, 69, 0, 0.2)" : "transparent"}; border:${"up" === n?.playerVote ? "1px solid var(--l-orange-red)" : "1px solid transparent"}; padding:4px 6px; border-radius:6px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;`),
            (a.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="${"up" === n?.playerVote ? "var(--l-orange-red)" : "var(--text-dim)"}"><path d="M12 4l8 8h-6v8h-4v-8H4z"/></svg>`),
            a.addEventListener("mouseenter", () => (a.style.transform = "scale(1.15)")),
            a.addEventListener("mouseleave", () => (a.style.transform = "scale(1)")),
            a.addEventListener("click", () => voteOnChatMessage(t, o, "up"));
        const i = document.createElement("button");
        (i.style.cssText = `background:${"down" === n?.playerVote ? "rgba(113, 147, 255, 0.2)" : "transparent"}; border:${"down" === n?.playerVote ? "1px solid var(--l-indigo-lt)" : "1px solid transparent"}; padding:4px 6px; border-radius:6px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;`),
            (i.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="${"down" === n?.playerVote ? "var(--l-indigo-lt)" : "var(--text-dim)"}"><path d="M12 20l-8-8h6V4h4v8h6z"/></svg>`),
            i.addEventListener("mouseenter", () => (i.style.transform = "scale(1.15)")),
            i.addEventListener("mouseleave", () => (i.style.transform = "scale(1)")),
            i.addEventListener("click", () => voteOnChatMessage(t, o, "down")),
            e.appendChild(a),
            e.appendChild(i),
            p.appendChild(e);
    }
    chatMessages.appendChild(p);
}
function addGiftMessage(e, t, n, a) {
    if (!chatMessages) return;
    const o = document.createElement("div");
    o.style.cssText =
        "max-width:80%; padding:12px; border-radius:15px; margin-bottom:10px; " +
        (a
            ? "background:var(--surface); align-self:flex-end; border:2px solid var(--danger);"
            : "background:var(--surface-2); align-self:flex-start;");
    const i = document.createElement("div");
    (i.style.cssText = "font-size:0.7rem; opacity:0.6; margin-bottom:6px; font-style:italic;"),
        (i.textContent = getContextAwareTimestamp()),
        o.appendChild(i);
    const s = document.createElement("div");
    (s.style.cssText = "display:flex; align-items:center; gap:8px; margin-bottom:10px;"),
        (s.innerHTML = `<span style="font-size:1.5rem;">${n.categoryEmoji || "🎁"}</span><strong style="color:var(--positive);">Gift Given</strong>`),
        o.appendChild(s);
    const r = document.createElement("div");
    r.style.cssText = "background:var(--l-veil-30); padding:10px; border-radius:10px; margin-bottom:10px;";
    const l = document.createElement("div");
    (l.style.cssText = "font-size:1.1rem; font-weight:600; color:var(--l-ink); margin-bottom:5px;"),
        (l.textContent = n.name),
        r.appendChild(l);
    const c = document.createElement("div");
    if (
        ((c.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"),
        (c.innerHTML = `\n      <span style="color:var(--text-dim); font-size:0.9rem;">${n.categoryEmoji} ${n.categoryName}</span>\n      <span style="color:var(--positive); font-weight:600; font-size:1.1rem;">$${formatCash(n.price)}</span>\n    `),
        r.appendChild(c),
        n.description)
    ) {
        const e = document.createElement("div");
        (e.style.cssText =
            "color:var(--l-ink-dim); font-size:0.85rem; line-height:1.4; margin-top:8px; padding-top:8px; border-top:1px solid var(--l-sheen-10);"),
            (e.textContent = n.description),
            r.appendChild(e);
    }
    if ((o.appendChild(r), t && "🎁 Gave a gift" !== t)) {
        const e = document.createElement("div");
        e.style.cssText =
            "\n        margin-top: 12px;\n        padding: 10px 12px;\n        background: linear-gradient(135deg, rgba(255,105,180,0.15), rgba(147,112,219,0.15));\n        border-left: 3px solid var(--l-pink-3);\n        border-radius: 8px;\n        position: relative;\n      ";
        const n = document.createElement("span");
        (n.textContent = "💌"),
            (n.style.cssText = "font-size:1.2rem; margin-right:6px; vertical-align:middle;"),
            e.appendChild(n);
        const a = document.createElement("span");
        (a.style.cssText = "color:var(--l-ink); font-size:0.95rem; line-height:1.5; font-style:italic;"),
            (a.innerHTML = `"${styleActionText(t)}"`),
            e.appendChild(a),
            o.appendChild(e);
    }
    chatMessages.appendChild(o);
}
function getMoneyRequestMessage(e, t, n) {
    e.name.split(" ")[0];
    const a = {
            rent: [
                "Hey boss, rent's due and I'm a bit short this month... Could really use some help 🏠",
                "Rent is coming up and I'm not quite there yet. Any chance you could help me out? 🏢",
                "My landlord's not gonna be happy if I'm late again... Could you spot me for rent? 🙏",
                "Struggling to make rent this month. Would really appreciate the help! 🏠",
            ],
            bills: [
                "Bills are piling up and I'm getting stressed... Could you help me out? 💳",
                "Got hit with some unexpected bills this month. Any way you could help? 📄",
                "My utilities are overdue and I'm worried they'll cut service... Help? 💡",
                "Credit card bill is brutal this month. Could really use some assistance 💳",
            ],
            emergency: [
                "Boss, I have an emergency situation and really need your help 🚨",
                "Something urgent came up and I need money ASAP. Can you help? 😰",
                "I'm in a bit of an emergency here... Could really use your support 🆘",
                "This is urgent - I really need financial help right now 🚨",
            ],
            car_repair: [
                "My car broke down and the repair is expensive... Could you help me out? 🚗",
                "Mechanic quoted me way more than expected for the repair. Any chance you could help? 🔧",
                "Car's in the shop and I can't afford to get it out. Help? 🚙",
                "Need to fix my car or I can't get to work... Could you spot me? 🚗💨",
            ],
            medical: [
                "Medical bills are killing me... Could you help cover some of it? 🏥",
                "Had to see the doctor and the bill is brutal. Any way you could help? 💊",
                "Health insurance didn't cover everything... Could really use help with medical costs 🏥",
                "These medical expenses are way more than I expected. Help? 💉",
            ],
            help_family: [
                "My family needs help and I'm trying to support them... Could you spare something? 👨‍👩‍👧",
                "Family emergency - need to send money home. Can you help me out? ❤️",
                "My parents need financial help and I want to be there for them... 🙏",
                "Trying to help my family through a tough time. Could you contribute? 👪",
            ],
            special_occasion: [
                "There's a special event coming up and I want to make it memorable... Help? 🎉",
                "Got something important to celebrate but I'm broke... Could you help? 🎊",
                "Want to do something nice for [occasion] but need financial help 🎁",
                "Special occasion coming up and I'm short on cash... Any chance you could help? 🥳",
            ],
            treat_myself: [
                "I've been working so hard lately... Think I could get a little something to treat myself? 🛍️",
                "Been feeling stressed and want to do something nice for myself... Help me out? 💆",
                "I deserve a little treat after everything, right? Could you help? ✨",
                "Want to pamper myself a bit but money's tight... Could you spare some? 💅",
                "Thinking of treating myself to something nice... Would you help make that happen? 🎁",
            ],
        },
        o = a[t] || a.bills;
    return o[Math.floor(Math.random() * o.length)];
}
function addMoneyRequestMessage(e, t, n, a, o = !1) {
    if (!chatMessages) return;
    t = "number" != typeof t || isNaN(t) ? 100 : t;
    const i = document.createElement("div");
    i.style.cssText =
        "max-width:80%; padding:10px 15px; border-radius:18px; margin-bottom:10px; word-wrap:break-word; position:relative; background:var(--surface-2); align-self:flex-start; border:2px solid var(--positive);";
    const s = document.createElement("p");
    let r;
    s.style.margin = "0 0 10px 0";
    (r = [
        "rent",
        "bills",
        "emergency",
        "car_repair",
        "medical",
        "help_family",
        "special_occasion",
        "treat_myself",
    ].includes(n)
        ? getMoneyRequestMessage(e, n, t)
        : n),
        (s.innerHTML = styleActionText(r)),
        i.appendChild(s);
    const l = document.createElement("div");
    if (
        ((l.style.cssText =
            "display:inline-block; background:var(--l-green); color:var(--l-on-accent); padding:5px 10px; border-radius:8px; font-weight:600; margin-bottom:10px;"),
        (l.textContent = `💰 $${formatCash(t)}`),
        i.appendChild(l),
        !o)
    ) {
        const o = document.createElement("div");
        (o.style.cssText = "display:flex; gap:8px; margin-top:10px;"), (o.id = `money-request-${a}`);
        const s = document.createElement("button");
        (s.style.cssText =
            "flex:1; padding:8px 12px; background:var(--l-green); border:none; border-radius:6px; color:var(--l-on-accent); cursor:pointer; font-weight:600; transition:all 0.2s;"),
            (s.textContent = "✓ Accept"),
            s.addEventListener("mouseenter", () => {
                s.style.background = "#5efcb3";
            }),
            s.addEventListener("mouseleave", () => {
                s.style.background = "var(--l-green)";
            }),
            s.addEventListener("click", async () => {
                await handleMoneyRequestResponse(e, t, n, a, "accept");
            });
        const r = document.createElement("button");
        (r.style.cssText =
            "flex:1; padding:8px 12px; background:var(--l-orange-2); border:none; border-radius:6px; color:var(--l-on-accent); cursor:pointer; font-weight:600; transition:all 0.2s;"),
            (r.textContent = "↔️ Counter"),
            r.addEventListener("mouseenter", () => {
                r.style.background = "var(--l-amber-4)";
            }),
            r.addEventListener("mouseleave", () => {
                r.style.background = "var(--l-orange-2)";
            }),
            r.addEventListener("click", () => {
                openCounterOfferModal(e, t, n, a);
            });
        const l = document.createElement("button");
        (l.style.cssText =
            "flex:1; padding:8px 12px; background:var(--l-red); border:none; border-radius:6px; color:var(--l-ink-on-fill); cursor:pointer; font-weight:600; transition:all 0.2s;"),
            (l.textContent = "✗ Deny"),
            l.addEventListener("mouseenter", () => {
                l.style.background = "#ff5570";
            }),
            l.addEventListener("mouseleave", () => {
                l.style.background = "var(--l-red)";
            }),
            l.addEventListener("click", async () => {
                await handleMoneyRequestResponse(e, t, n, a, "deny");
            }),
            o.appendChild(s),
            o.appendChild(r),
            o.appendChild(l),
            i.appendChild(o);
    }
    chatMessages.appendChild(i);
}
async function handleMoneyRequestResponse(e, t, n, a, o) {
    const i = document.getElementById(`money-request-${a}`);
    if (
        (i && i.remove(),
        gameState.chatHistory[e.id] &&
            gameState.chatHistory[e.id][a] &&
            ((gameState.chatHistory[e.id][a].settled = !0),
            (gameState.chatHistory[e.id][a].settlementAction = o),
            (gameState.chatHistory[e.id][a].settlementTimestamp = gameState.time?.currentTime || Date.now()),
            saveGame(!1)),
        "accept" === o)
    ) {
        if (gameState.cash < t) {
            addChatMessage("You", `[Insufficient funds - need $${formatCash(t)}]`, !0);
            const n = sanitizeNpcResponse(
                await queuedGenerateText(
                    `${e.name} (${formatPersonality(e.personality)}) asked you for $${formatCash(t)} but you don't have enough money. Respond to being told you can't afford it (2-3 sentences, conversational).`,
                    {},
                    `Generating insufficient funds response for ${e.name}`
                ),
                3
            );
            gameState.chatHistory[e.id].push({
                sender: e.name,
                content: n,
                isPlayer: !1,
                timestamp: gameState.time?.currentTime || Date.now(),
            });
            const a = gameState.chatHistory[e.id].length - 1;
            return void addChatMessage(e.name, n, !1, null, a);
        }
        gameState.typingStates || (gameState.typingStates = {}),
            (gameState.typingStates[e.id] = !0),
            chatTypingIndicator &&
                chatTypingName &&
                gameState.activeChat?.id === e.id &&
                ((chatTypingIndicator.style.display = "block"), (chatTypingName.textContent = e.name)),
            e.bankBalance || (e.bankBalance = 0),
            (e.bankBalance += t),
            e.proactiveMessages &&
                ((e.proactiveMessages.hasUnrepliedMoneyRequest = !1),
                console.log(`[Money Request] ${e.name}: Request accepted - flag cleared`)),
            (gameState.cash = Math.max(0, gameState.cash - t)),
            updateUI(),
            addChatMessage("You", `✓ Accepted - Sent $${formatCash(t)}`, !0),
            gameState.chatHistory[e.id].push({
                sender: "You",
                content: `✓ Accepted money request - Sent $${formatCash(t)}`,
                isPlayer: !0,
                isMoneyRequest: !0,
                accepted: !0,
                amount: t,
                timestamp: gameState.time?.currentTime || Date.now(),
            }),
            (e.lastPlayerMessageTime = gameState.time?.currentTime || Date.now());
        const a = `${buildChatPrompt(e, buildConversationHistoryWithImages(e.id, 10), "").prompt}\n\nYou just asked the player for $${formatCash(t)} (reason: "${n}") and they ACCEPTED and sent you the money!\n\nRespond with gratitude and acknowledgment (3-8 sentences). Consider:\n- Your personality (${formatPersonality(e.personality)})\n- Your relationship with them (Affection: ${e.stats?.affection || 0}, Obedience: ${e.obedience}, Desire: ${e.desire}, Trust: ${e.trust})\n- What you asked the money for\n- How this makes you feel about them\n\n${e.name}'s response:`,
            o = sanitizeNpcResponse(
                await queuedGenerateText(a, {}, `Generating money grant response for ${e.name}`),
                10
            );
        if (
            ((gameState.typingStates[e.id] = !1),
            chatTypingIndicator &&
                gameState.activeChat?.id === e.id &&
                (chatTypingIndicator.style.display = "none"),
            gameState.chatHistory[e.id].push({
                sender: e.name,
                content: o,
                isPlayer: !1,
                timestamp: gameState.time?.currentTime || Date.now(),
            }),
            gameState.activeChat?.id === e.id && chatMessages)
        ) {
            const t = gameState.chatHistory[e.id].length - 1;
            addChatMessage(e.name, o, !1, null, t), (chatMessages.scrollTop = chatMessages.scrollHeight);
        }
        e.stats || (e.stats = {}),
            (e.stats.affection = Math.min(100, (e.stats.affection || 0) + 8)),
            (e.stats.trust = Math.min(100, (e.stats.trust || 0) + 8)),
            (e.stats.obedience = Math.min(100, (e.stats.obedience || 0) + 5)),
            (e.stats.desire = Math.min(100, (e.stats.desire || 0) + 3)),
            showNotification(
                `💰 Gave ${e.name} $${formatCash(t)}\n+8 Affection, +8 Trust, +5 Obedience, +3 Desire`,
                "success"
            ),
            remember(e, `Boss accepted my request for $${formatCash(t)} (${n})`, "event", 2),
            updateUI();
    } else if ("deny" === o) {
        addChatMessage("You", "✗ Denied money request", !0),
            gameState.chatHistory[e.id].push({
                sender: "You",
                content: `✗ Denied money request for $${formatCash(t)}`,
                isPlayer: !0,
                isMoneyRequest: !0,
                accepted: !1,
                amount: t,
                timestamp: gameState.time?.currentTime || Date.now(),
            }),
            (e.lastPlayerMessageTime = gameState.time?.currentTime || Date.now()),
            e.proactiveMessages &&
                ((e.proactiveMessages.hasUnrepliedMoneyRequest = !1),
                console.log(`[Money Request] ${e.name}: Request denied - flag cleared`)),
            gameState.typingStates || (gameState.typingStates = {}),
            (gameState.typingStates[e.id] = !0),
            chatTypingIndicator &&
                chatTypingName &&
                gameState.activeChat?.id === e.id &&
                ((chatTypingIndicator.style.display = "block"), (chatTypingName.textContent = e.name));
        const a = `${buildChatPrompt(e, buildConversationHistoryWithImages(e.id, 10), "").prompt}\n\nYou just asked the player for $${formatCash(t)} (reason: "${n}") and they DENIED your request.\n\nRespond with disappointment but stay in character (3-6 sentences). Consider:\n- Your personality (${formatPersonality(e.personality)})\n- Your relationship with them (Affection: ${e.stats?.affection || 0}, Obedience: ${e.obedience}, Desire: ${e.desire}, Trust: ${e.trust})\n- What you asked the money for\n- How this rejection makes you feel\n\n${e.name}'s response:`,
            o = sanitizeNpcResponse(
                await queuedGenerateText(a, {}, `Generating money rejection response for ${e.name}`),
                8
            );
        if (
            ((gameState.typingStates[e.id] = !1),
            chatTypingIndicator &&
                gameState.activeChat?.id === e.id &&
                (chatTypingIndicator.style.display = "none"),
            gameState.chatHistory[e.id].push({
                sender: e.name,
                content: o,
                isPlayer: !1,
                timestamp: gameState.time?.currentTime || Date.now(),
            }),
            gameState.activeChat?.id === e.id && chatMessages)
        ) {
            const t = gameState.chatHistory[e.id].length - 1;
            addChatMessage(e.name, o, !1, null, t), (chatMessages.scrollTop = chatMessages.scrollHeight);
        }
        e.stats || (e.stats = {}),
            (e.stats.affection = Math.max(0, (e.stats.affection || 0) - 3)),
            (e.stats.trust = Math.max(0, (e.stats.trust || 0) - 3)),
            (e.stats.desire = Math.max(0, (e.stats.desire || 0) - 2)),
            showNotification(`${e.name} was denied\n-3 Affection, -3 Trust, -2 Desire`, "warning"),
            remember(e, `Boss denied my request for $${formatCash(t)} (${n})`, "event", 1.5),
            updateUI();
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
function openCounterOfferModal(e, t, n, a) {
    (window.counterOfferContext = { emp: e, requestedAmount: t, reason: n, messageIndex: a }),
        (document.getElementById("counterOriginalAmount").textContent = "$" + formatCash(t)),
        (document.getElementById("counterYourBalance").textContent = "$" + formatCash(gameState.cash)),
        (document.getElementById("counterAmount").value = ""),
        (document.getElementById("counterJustification").value = ""),
        (document.getElementById("counterOfferModal").style.display = "flex");
}
async function submitCounterOffer() {
    const e = window.counterOfferContext;
    if (!e) return;
    const { emp: t, requestedAmount: n, reason: a, messageIndex: o } = e,
        i = parseInt(document.getElementById("counterAmount").value) || 0,
        s = document.getElementById("counterJustification").value.trim();
    if (i <= 0) return void showNotification("❌ Please enter a valid amount", "error");
    if (i > gameState.cash) return void showNotification("❌ Insufficient funds!", "error");
    document.getElementById("counterOfferModal").style.display = "none";
    const r = document.getElementById(`money-request-${o}`);
    r && r.remove(),
        gameState.chatHistory[t.id] &&
            gameState.chatHistory[t.id][o] &&
            ((gameState.chatHistory[t.id][o].settled = !0),
            (gameState.chatHistory[t.id][o].settlementAction = "counter"),
            (gameState.chatHistory[t.id][o].counterAmount = i),
            (gameState.chatHistory[t.id][o].settlementTimestamp = gameState.time?.currentTime || Date.now()),
            saveGame(!1)),
        chatTypingIndicator &&
            chatTypingName &&
            ((chatTypingIndicator.style.display = "block"), (chatTypingName.textContent = t.name)),
        t.bankBalance || (t.bankBalance = 0),
        (t.bankBalance += i),
        t.proactiveMessages &&
            ((t.proactiveMessages.hasUnrepliedMoneyRequest = !1),
            console.log(`[Money Request] ${t.name}: Counter offer sent - flag cleared`)),
        (gameState.cash = Math.max(0, gameState.cash - i)),
        updateUI();
    const l = s
        ? `💰 Counter: Sending $${formatCash(i)} instead\n"${s}"`
        : `💰 Counter: Sending $${formatCash(i)} instead of requested $${formatCash(n)}`;
    addChatMessage("You", l, !0),
        gameState.chatHistory[t.id].push({
            sender: "You",
            content: l,
            isPlayer: !0,
            isCounterOffer: !0,
            requestedAmount: n,
            counterAmount: i,
            justification: s,
            timestamp: gameState.time?.currentTime || Date.now(),
        });
    const c = buildConversationHistoryWithImages(t.id, 10),
        d = i - n,
        p = Math.round((d / n) * 100),
        m = d > 0,
        u = d < 0,
        g = 0 === d,
        h = `${buildChatPrompt(t, c, "").prompt}\n\nYou asked the boss for $${formatCash(n)} (reason: "${a}").\nInstead of accepting or denying, they made a COUNTER OFFER: $${formatCash(i)} (${p > 0 ? "+" : ""}${p}% ${m ? "MORE" : u ? "LESS" : "same"}!)\n${s ? `\nTheir justification: "${s}"` : ""}\n\nRespond to this counter offer naturally (3-8 sentences). Consider:\n- Your personality (${formatPersonality(t.personality)})\n- The difference: ${m ? "They're giving you MORE than you asked for!" : u ? "They're offering LESS than you need" : "They agreed to the exact amount"}\n- Your relationship with them (Affection: ${t.stats?.affection || 0}, Trust: ${t.trust}, Desire: ${t.desire})\n- What you asked the money for originally\n${s ? "- Their explanation for the amount" : ""}\n\nPossible reactions:\n${m ? '- Surprised, grateful, maybe a bit suspicious or excited\n- "Wait, you\'re giving me MORE? Seriously? Thank you so much!"' : ""}\n${u ? '- Disappointed but understanding, or frustrated depending on your personality\n- "I appreciate it but... I really needed the full amount"\n- Or: "That helps, thanks. I\'ll make it work"' : ""}\n${g ? "- A bit confused why they didn't just accept, but grateful\n- \"Okay... so that's the same as I asked? Thanks I guess!\"" : ""}\n\n${t.name}'s response:`,
        y = sanitizeNpcResponse(
            await queuedGenerateText(h, {}, `Generating custom amount response for ${t.name}`),
            10
        );
    if (
        (chatTypingIndicator && (chatTypingIndicator.style.display = "none"),
        gameState.chatHistory[t.id].push({
            sender: t.name,
            content: y,
            isPlayer: !1,
            timestamp: gameState.time?.currentTime || Date.now(),
        }),
        gameState.activeChat?.id === t.id && chatMessages)
    ) {
        const e = gameState.chatHistory[t.id].length - 1;
        addChatMessage(t.name, y, !1, null, e), (chatMessages.scrollTop = chatMessages.scrollHeight);
    }
    let f = 0,
        b = 0,
        v = 0;
    if (m) (f = 12), (b = 10), (v = 6);
    else if (g) (f = 8), (b = 8), (v = 3);
    else {
        const e = Math.min(5, Math.abs(p) / 20);
        (f = Math.max(2, 8 - e)), (b = Math.max(2, 8 - e)), (v = Math.max(1, 3 - e / 2));
    }
    t.stats || (t.stats = {}),
        (t.stats.affection = Math.min(100, (t.stats.affection || 0) + f)),
        (t.stats.trust = Math.min(100, (t.stats.trust || 0) + b)),
        (t.stats.desire = Math.min(100, (t.stats.desire || 0) + v)),
        (t.stats.obedience = Math.min(100, (t.stats.obedience || 0) + Math.floor(f / 2))),
        showNotification(
            `💰 Counter sent: $${formatCash(i)}\n+${f} Affection, +${b} Trust, +${v} Desire`,
            "success"
        ),
        remember(
            t,
            `Boss countered my $${formatCash(n)} request with $${formatCash(i)}${s ? ` - "${s}"` : ""}`,
            "event",
            2
        ),
        updateUI(),
        (chatMessages.scrollTop = chatMessages.scrollHeight);
}
window.profileEditState = { isEditMode: !1, hasUnsavedChanges: !1, editedData: null };
const DEFAULT_NPC_ACTION_BUTTONS = [
    {
        id: "continue",
        name: "▶️ Continue",
        instruction: "Continue the conversation naturally. Add more detail or action to the scene.",
        autoSend: !0,
        emoji: "▶️",
        enabled: !0,
    },
    {
        id: "action",
        name: "🎬 Action",
        instruction:
            "{{char}} does NOT speak or say anything. Output ONLY a highly-detailed physical action. Describe what {{char}} does with their body - movement, gestures, positioning, physical interaction with the environment or other characters. Focus purely on showing, not telling.",
        autoSend: !0,
        emoji: "🎬",
        enabled: !0,
    },
    {
        id: "thoughts",
        name: "💭 Thoughts",
        instruction: "Write internal thoughts. What is {{char}} thinking right now? Show inner monologue.",
        autoSend: !0,
        emoji: "💭",
        enabled: !1,
    },
    {
        id: "flirt",
        name: "💕 Flirt",
        instruction: "{{char}} flirts or shows romantic/sexual interest. Be playful and suggestive.",
        autoSend: !0,
        emoji: "💕",
        enabled: !1,
        minDesire: 20,
    },
    {
        id: "react",
        name: "😮 React",
        instruction:
            "Show emotional reaction to the current situation. Express feelings through words and actions.",
        autoSend: !0,
        emoji: "😮",
        enabled: !1,
    },
    {
        id: "tease",
        name: "😏 Tease",
        instruction: "{{char}} teases or playfully challenges. Be cheeky and mischievous.",
        autoSend: !0,
        emoji: "😏",
        enabled: !1,
        minFlirty: 30,
    },
    {
        id: "comply",
        name: "✅ Comply",
        instruction: "{{char}} agrees and complies with what was just said or requested.",
        autoSend: !0,
        emoji: "✅",
        enabled: !1,
    },
    {
        id: "resist",
        name: "⛔ Resist",
        instruction: "{{char}} pushes back, resists, or expresses reluctance. Stay in character.",
        autoSend: !0,
        emoji: "⛔",
        enabled: !1,
    },
    {
        id: "change_subject",
        name: "🔄 Topic",
        instruction: "{{char}} smoothly changes the subject to something else.",
        autoSend: !0,
        emoji: "🔄",
        enabled: !1,
    },
    { id: "custom", name: "✏️ Custom", instruction: "", autoSend: !1, emoji: "✏️", enabled: !1 },
];
let npcActionBarCollapsed = !1;
const COMMAND_TOOLTIPS = {
    do: {
        emoji: "🎭",
        name: "Direct Command",
        desc: "NPC performs this action (no player message shown)",
        syntax: "/do instruction here",
        example: "/do walks over and sits next to you",
        category: "special",
    },
    narrator: {
        emoji: "📖",
        name: "Narrator",
        desc: "Third-person scene narration (1-1 chats)",
        syntax: "/narrator &lt;instructions&gt;",
        example: "/narrator <describe the romantic tension>",
        category: "special",
        aliases: ["n"],
    },
    c: {
        emoji: "⏩",
        name: "Quick Continue",
        desc: "Shortcut for /continue",
        syntax: "/c",
        example: "/c",
        category: "special",
        aliasOf: "continue",
    },
    continue: {
        emoji: "▶️",
        name: "Continue",
        desc: "Continue the conversation or scene naturally",
        syntax: "/continue or /continue {message}",
        example: "/continue {That sounds interesting}",
        category: "action",
    },
    action: {
        emoji: "🎬",
        name: "Action",
        desc: "NPC performs physical action (no dialogue)",
        syntax: "/action or /action &lt;instructions&gt;",
        example: "/action <lean in closer>",
        category: "action",
    },
    thoughts: {
        emoji: "💭",
        name: "Thoughts",
        desc: "Show NPC's internal monologue and feelings",
        syntax: "/thoughts or /thoughts {message}",
        example: "/thoughts {What do you think about that?}",
        category: "action",
    },
    flirt: {
        emoji: "💕",
        name: "Flirt",
        desc: "NPC responds flirtatiously or suggestively",
        syntax: "/flirt {message}",
        example: "/flirt {You look nice today}",
        category: "action",
    },
    react: {
        emoji: "😮",
        name: "React",
        desc: "Show emotional reaction to current situation",
        syntax: "/react or /react {message}",
        example: "/react",
        category: "action",
    },
    tease: {
        emoji: "😏",
        name: "Tease",
        desc: "NPC teases or playfully challenges you",
        syntax: "/tease {message}",
        example: "/tease {Think you can beat me?}",
        category: "action",
    },
    comply: {
        emoji: "✅",
        name: "Comply",
        desc: "NPC agrees and goes along with request",
        syntax: "/comply {message}",
        example: "/comply {Follow me}",
        category: "action",
    },
    resist: {
        emoji: "⛔",
        name: "Resist",
        desc: "NPC pushes back or shows reluctance",
        syntax: "/resist {message}",
        example: "/resist {Come with me}",
        category: "action",
    },
    change_subject: {
        emoji: "🔄",
        name: "Topic",
        desc: "NPC smoothly changes the subject",
        syntax: "/change_subject or /change_subject {message}",
        example: "/change_subject {Anyway...}",
        category: "action",
    },
    custom: {
        emoji: "✏️",
        name: "Custom",
        desc: "Provide your own instruction for NPC",
        syntax: "/custom {message} &lt;instruction&gt;",
        example: "/custom {Hi} <respond nervously>",
        category: "action",
    },
    interact: {
        emoji: "💬",
        name: "Interact",
        desc: "NPCs interact with each other (not player)",
        syntax: "/interact or /interact &lt;instructions&gt;",
        example: "/interact",
        category: "action",
        groupOnly: !0,
    },
    narrate: {
        emoji: "📜",
        name: "Narrate",
        desc: "Third-person scene description",
        syntax: "/narrate or /narrate &lt;instructions&gt;",
        example: "/narrate <describe the tension>",
        category: "action",
        groupOnly: !0,
    },
    tension: {
        emoji: "⚡",
        name: "Tension",
        desc: "Increase drama or conflict between characters",
        syntax: "/tension or /tension &lt;instructions&gt;",
        example: "/tension",
        category: "action",
        groupOnly: !0,
    },
};
function showCommandHintPopup(e, t = !1) {
    const n = e.value,
        a = document.getElementById("commandHintPopup");
    if ((a && a.remove(), !n.startsWith("/") || n.includes("{") || n.includes("<"))) return;
    const o = n.slice(1).toLowerCase();
    let i;
    if (t) {
        const e = gameState.activeGroup;
        i = e?.actionButtons || DEFAULT_GROUP_ACTION_BUTTONS;
    } else {
        const e = gameState.activeChat ? gameState.employees.find((e) => e.id === gameState.activeChat.id) : null;
        i = e?.actionButtons || DEFAULT_NPC_ACTION_BUTTONS;
    }
    const s = [];
    t
        ? (s.push({ ...COMMAND_TOOLTIPS.do, id: "do" }), s.push({ ...COMMAND_TOOLTIPS.c, id: "c" }))
        : (s.push({ ...COMMAND_TOOLTIPS.do, id: "do" }),
          s.push({ ...COMMAND_TOOLTIPS.narrator, id: "narrator" }),
          s.push({ ...COMMAND_TOOLTIPS.c, id: "c" })),
        i.forEach((e) => {
            const t = COMMAND_TOOLTIPS[e.id] || {
                emoji: e.emoji,
                name: e.name.replace(e.emoji + " ", ""),
                desc: e.instruction.substring(0, 60) + "...",
                syntax: `/${e.id} {Your message}`,
                example: `/${e.id} {Hello}`,
                category: "action",
            };
            s.push({
                id: e.id,
                emoji: e.emoji || t.emoji,
                name: t.name,
                desc: t.desc,
                syntax: t.syntax,
                example: t.example,
                category: "action",
                enabled: !1 !== e.enabled,
                instruction: e.instruction,
            });
        });
    const r = s.filter((e) => {
            const t = e.id.startsWith(o) || "" === o;
            return e.aliases ? t || e.aliases.some((e) => e.startsWith(o)) : t;
        }),
        l = new Set(),
        c = r.filter((e) => !l.has(e.id) && (l.add(e.id), !0));
    if (0 === c.length) return;
    const d = document.createElement("div");
    (d.id = "commandHintPopup"),
        (d.style.cssText =
            "\n      position: absolute;\n      bottom: 100%;\n      left: 0;\n      right: 0;\n      background: var(--surface);\n      border: 1px solid var(--positive);\n      border-radius: 8px;\n      padding: 8px;\n      margin-bottom: 5px;\n      max-height: 350px;\n      overflow-y: auto;\n      z-index: 100;\n      box-shadow: 0 -4px 15px var(--l-veil-30);\n    ");
    const p = document.createElement("div");
    p.style.cssText =
        "color:var(--text-mute); font-size:0.7rem; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid var(--l-line);";
    let m = "";
    if ("" === o) m = '<span style="color:var(--text-mute);">Type a command name to see its syntax</span>';
    else if (1 === c.length) {
        const e = c[0];
        m = `<code style="color:var(--positive);">${e.syntax || `/${e.id}`}</code>`;
    } else {
        const e = c[0];
        m = `<code style="color:var(--positive);">${e.syntax || `/${e.id}`}</code> <span style="color:var(--text-mute);">(${c.length} matches)</span>`;
    }
    (p.innerHTML = `\n      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">\n        <span>⌨️ Commands - Click to insert or keep typing</span>\n      </div>\n      <div style="font-size:0.65rem; font-family:monospace;">\n        ${m}\n      </div>\n    `),
        d.appendChild(p);
    const u = c.filter((e) => "special" === e.category),
        g = c.filter((e) => "action" === e.category);
    if (u.length > 0) {
        const t = document.createElement("div");
        (t.style.cssText =
            "color:var(--l-orange); font-size:0.65rem; font-weight:bold; margin: 6px 0 4px 0; text-transform:uppercase;"),
            (t.textContent = "✨ Special Commands"),
            d.appendChild(t),
            u.forEach((t) => h(t, d, e, !0));
    }
    if (g.length > 0) {
        const t = document.createElement("div");
        (t.style.cssText =
            "color:var(--positive); font-size:0.65rem; font-weight:bold; margin: 10px 0 4px 0; text-transform:uppercase;"),
            (t.textContent = "🎬 Response Styles"),
            d.appendChild(t),
            g.forEach((t) => h(t, d, e, !1));
    }
    function h(e, t, n, a) {
        const o = document.createElement("div"),
            i = !1 === e.enabled;
        o.style.cssText = `\n        padding: 8px 10px;\n        border-radius: 6px;\n        cursor: pointer;\n        margin: 2px 0;\n        transition: all 0.15s;\n        position: relative;\n        ${a ? "background: rgba(255,165,0,0.08); border-left: 3px solid var(--l-orange);" : ""}\n        ${i ? "opacity: 0.5;" : ""}\n      `;
        const s = document.createElement("div");
        (s.style.cssText = "display:flex; align-items:center; gap:8px;"),
            (s.innerHTML = `\n        <span style="font-size:1rem; width:24px; text-align:center;">${e.emoji}</span>\n        <code style="color:${a ? "var(--l-orange)" : "var(--l-green)"}; font-size:0.85rem; font-weight:bold; min-width:80px;">/${e.id}</code>\n        <span style="color:var(--text-dim); font-size:0.75rem; flex:1;">${e.desc}</span>\n        ${i ? '<span style="color:var(--text-mute); font-size:0.6rem; background:var(--l-neutral-3); padding:2px 6px; border-radius:3px;">OFF</span>' : ""}\n      `),
            o.appendChild(s);
        const r = document.createElement("div");
        (r.className = "command-tooltip-row"),
            (r.style.cssText =
                "\n        display: none;\n        margin-top: 6px;\n        padding-top: 6px;\n        border-top: 1px solid var(--l-sheen-10);\n        font-size: 0.7rem;\n      "),
            (r.innerHTML = `\n        <div style="color:var(--text-mute); margin-bottom:3px;">\n          <span style="color:var(--text-mute);">Syntax:</span> \n          <code style="color:var(--l-x-teal);">${e.syntax || `/${e.id} {message}`}</code>\n        </div>\n        <div style="color:var(--text-mute);">\n          <span style="color:var(--text-mute);">Example:</span> \n          <code style="color:var(--l-x-blue);">${e.example || `/${e.id} {Hello}`}</code>\n        </div>\n        ${e.aliases ? `<div style="color:var(--text-mute); margin-top:3px;"><span style="color:var(--text-mute);">Aliases:</span> <code style="color:var(--l-x-pink);">/${e.aliases.join(", /")}</code></div>` : ""}\n      `),
            o.appendChild(r),
            o.addEventListener("mouseenter", () => {
                (o.style.background = a ? "rgba(255,165,0,0.15)" : "rgba(78,204,163,0.12)"),
                    (r.style.display = "block");
            }),
            o.addEventListener("mouseleave", () => {
                (o.style.background = a ? "rgba(255,165,0,0.08)" : "transparent"), (r.style.display = "none");
            }),
            o.addEventListener("click", () => {
                insertCommandIntoInput(e, n), d.remove();
            }),
            t.appendChild(o);
    }
    const y = e.parentElement;
    y && ((y.style.position = "relative"), y.appendChild(d));
    const f = (t) => {
        d.contains(t.target) || t.target === e || (d.remove(), document.removeEventListener("click", f));
    };
    setTimeout(() => document.addEventListener("click", f), 10);
}
function insertCommandIntoInput(e, t) {
    if ("do" === e.id) (t.value = "/do "), t.focus();
    else if ("narrator" === e.id || "n" === e.id) {
        (t.value = "/narrator <instructions>"), t.focus();
        const e = t.value.indexOf("<") + 1,
            n = t.value.indexOf(">");
        t.setSelectionRange(e, n);
    } else if ("c" === e.id) (t.value = "/c"), t.focus();
    else if ("continue" === e.id) {
        (t.value = "/continue {Optional}"), t.focus();
        const e = t.value.indexOf("{") + 1,
            n = t.value.indexOf("}");
        t.setSelectionRange(e, n);
    } else if ("custom" === e.id) {
        (t.value = "/custom {Your message} <your instruction>"), t.focus();
        const e = t.value.indexOf("{") + 1,
            n = t.value.indexOf("}");
        t.setSelectionRange(e, n);
    } else {
        (t.value = `/${e.id} {Your message}`), t.focus();
        const n = t.value.indexOf("{") + 1,
            a = t.value.indexOf("}");
        t.setSelectionRange(n, a);
    }
}
function toggleNpcActionBar() {
    npcActionBarCollapsed = !npcActionBarCollapsed;
    const e = document.getElementById("npcActionButtonsContainer"),
        t = document.getElementById("npcActionToggleIcon");
    e &&
        (npcActionBarCollapsed
            ? ((e.style.maxHeight = "0"),
              (e.style.padding = "0 15px"),
              (e.style.opacity = "0"),
              (e.style.overflow = "hidden"))
            : ((e.style.maxHeight = "200px"),
              (e.style.padding = "4px 15px 10px 15px"),
              (e.style.opacity = "1"),
              (e.style.overflow = "auto"))),
        t && (t.style.transform = npcActionBarCollapsed ? "rotate(-90deg)" : "rotate(0deg)"),
        gameState.settings && (gameState.settings.npcActionBarCollapsed = npcActionBarCollapsed);
}
function renderNpcActionButtons(e) {
    const t = document.getElementById("npcActionButtonsContainer");
    if (!t) return;
    if (((t.innerHTML = ""), gameState.settings?.npcActionBarCollapsed)) {
        (npcActionBarCollapsed = !0),
            (t.style.maxHeight = "0"),
            (t.style.padding = "0 15px"),
            (t.style.opacity = "0"),
            (t.style.overflow = "hidden");
        const e = document.getElementById("npcActionToggleIcon");
        e && (e.style.transform = "rotate(-90deg)");
    }
    const n = getAvailableActionButtons(e),
        a = document.createElement("div");
    (a.style.cssText =
        "\n      display:flex;\n      gap:6px;\n      flex-wrap:wrap;\n      align-items:center;\n      width:100%;\n    "),
        n.forEach((t) => {
            const n = document.createElement("button");
            (n.className = "npc-action-btn"),
                (n.dataset.actionId = t.id),
                (n.style.cssText = `\n        padding:6px 10px;\n        background:${"custom" === t.id ? "var(--l-neutral-5)" : "var(--l-line)"};\n        border:1px solid ${"custom" === t.id ? "var(--l-neutral-7)" : "var(--l-green)"};\n        border-radius:16px;\n        color:var(--l-ink);\n        cursor:pointer;\n        font-size:0.75rem;\n        font-weight:500;\n        transition:all 0.2s;\n        display:inline-flex;\n        align-items:center;\n        gap:3px;\n        white-space:nowrap;\n        flex-shrink:0;\n        min-height:28px;\n        touch-action:manipulation;\n      `),
                (n.innerHTML = `${t.emoji} <span class="action-btn-text">${t.name.replace(t.emoji + " ", "")}</span>`),
                (n.title = t.instruction || "Custom action"),
                n.addEventListener("mouseenter", () => {
                    (n.style.background = "custom" === t.id ? "var(--l-neutral-6)" : "var(--l-green)"),
                        (n.style.color = "custom" === t.id ? "white" : "var(--l-bg)");
                }),
                n.addEventListener("mouseleave", () => {
                    (n.style.background = "custom" === t.id ? "var(--l-neutral-5)" : "var(--l-line)"), (n.style.color = "var(--l-ink)");
                }),
                n.addEventListener("click", (n) => {
                    n.stopPropagation(), handleNpcActionButtonClick(e, t);
                }),
                a.appendChild(n);
        });
    const o = document.createElement("button");
    (o.style.cssText =
        "\n      padding:6px 10px;\n      background:transparent;\n      border:1px dashed var(--l-neutral-5);\n      border-radius:16px;\n      color:var(--l-on-accent);\n      cursor:pointer;\n      font-size:0.7rem;\n      min-height:28px;\n      touch-action:manipulation;\n    "),
        (o.textContent = "⚙️"),
        (o.title = "Configure action buttons"),
        o.addEventListener("click", (t) => {
            t.stopPropagation(), showActionButtonConfigModal(e);
        }),
        a.appendChild(o),
        t.appendChild(a);
}
function getAvailableActionButtons(e) {
    return (e.actionButtons || DEFAULT_NPC_ACTION_BUTTONS).filter((t) => {
        if (!1 === t.enabled) return !1;
        if (void 0 !== t.minDesire) {
            if ((e.stats?.desire || 0) < t.minDesire) return !1;
        }
        if (void 0 !== t.minFlirty) {
            if ((e.personality?.flirty || 0) < t.minFlirty) return !1;
        }
        if (void 0 !== t.minAffection) {
            if ((e.stats?.affection || 0) < t.minAffection) return !1;
        }
        return !0;
    });
}
async function handleNpcActionButtonClick(e, t) {
    const n = document.getElementById("chatInput");
    if (!n) return;
    const a = t.id,
        o = n.value.trim();
    if (!o || o.startsWith("/")) {
        (n.value = `/${a} {Optional}`), n.focus();
        const e = n.value.indexOf("{") + 1,
            t = n.value.indexOf("}");
        return void n.setSelectionRange(e, t);
    }
    (n.value = `/${a} {${o}}`), n.focus(), n.setSelectionRange(n.value.length, n.value.length);
}
async function triggerNpcAction(e, t) {
    const n = e.id,
        a = e.name,
        o = $("chatTypingIndicator"),
        i = $("chatTypingName");
    o && i && ((o.style.display = "block"), (i.textContent = a)),
        gameState.typingStates || (gameState.typingStates = {}),
        (gameState.typingStates[n] = !0);
    try {
        const i = buildConversationHistoryWithImages(n, 10);
        ensureEmployeeMemory(e);
        const s = buildActionPrompt(e, i, t),
            r = sanitizeNpcResponse(await queuedGenerateText(s, {}, `NPC Action for ${a}`), 10),
            l = gameState.time?.currentTime || Date.now();
        if (
            (gameState.chatHistory[n].push({
                sender: a,
                content: r,
                isPlayer: !1,
                timestamp: l,
                isActionTriggered: !0,
            }),
            saveGame(!1),
            (gameState.typingStates[n] = !1),
            o && (o.style.display = "none"),
            gameState.activeChat?.id === n)
        ) {
            const e = document.getElementById("chatMessages");
            if (e) {
                addChatMessage(a, r, !1, null, gameState.chatHistory[n].length - 1, null, l),
                    (e.scrollTop = e.scrollHeight);
            }
        } else e.unreadMessages || (e.unreadMessages = 0), e.unreadMessages++;
        await updateEmployeeStatsFromChat(e, "", r), analyzeConversationForFlags(e, r);
    } catch (e) {
        console.error("Error triggering NPC action:", e),
            (gameState.typingStates[n] = !1),
            o && (o.style.display = "none"),
            showNotification("Failed to generate action. Please try again.", "error");
    }
}
function buildActionPrompt(e, t, n) {
    const { prompt: a } = buildChatPrompt(e, t, "");
    return `${a}\n\n[SYSTEM INSTRUCTION - UNPROMPTED ACTION]\nThe player has triggered an action button. You should now respond with the following:\n${n.replace(/\{\{char\}\}/gi, e.name)}\n\nThis is NOT a message from the player. You are performing this action/thought unprompted.\nWrite ONLY as ${e.name}. Do not write for the player.\nKeep the response natural and in-character.`;
}
async function generateChatNarratorResponse(e, t) {
    const n = e.id,
        a = $("chatTypingIndicator"),
        o = $("chatTypingName");
    a && o && ((a.style.display = "block"), (o.innerHTML = '<span style="color:var(--l-violet);">📜 Narrator</span>'));
    try {
        buildConversationHistoryWithImages(n, 10);
        let o = "";
        e.chatSettings?.scenarioContext && (o += `[Current Scenario/Scene]\n${e.chatSettings.scenarioContext}\n\n`),
            (o += "[Characters Present]\n"),
            (o += `- ${e.name} (${e.role || e.position || "Employee"})`),
            e.physicalDescription
                ? (o += `: ${e.physicalDescription}`)
                : e.appearance && (o += `: ${"string" == typeof e.appearance ? e.appearance : "N/A"}`),
            e.personality && (o += `. Personality: ${formatPersonality(e.personality)}`),
            (o += "\n"),
            (o += "- The Boss (player character): The authority figure in this conversation\n\n");
        const i = e.chatCommMode || "auto";
        "in-person" === i
            ? (o += "[Setting]: This is an in-person conversation.\n\n")
            : "remote" === i && (o += "[Setting]: This conversation is happening remotely (text/messaging).\n\n");
        const s = (gameState.chatHistory[n] || []).slice(-10);
        s.length > 0 &&
            ((o += "[Recent Conversation]\n"),
            s.forEach((e) => {
                if (e.isNarrator) o += `[Previous narration]: ${e.content.substring(0, 100)}...\n`;
                else {
                    const t = e.isPlayer ? "The Boss" : e.sender;
                    o += `${t}: ${e.content}\n`;
                }
            }));
        const r = `You are a third-person narrator describing events in an interactive story.\n\n${o}\n\nYour role:\n- Describe the scene, atmosphere, and subtle details the characters might not notice\n- Narrate physical actions, body language, and unspoken tension\n- Add sensory details (sights, sounds, atmosphere)\n- DO NOT speak for any character - only describe what is observable\n- Write in third person, past tense, like a novel\n- Keep narration atmospheric and engaging (2-4 sentences typically)\n- Focus on recent events and the current moment\n- You may hint at emotions through physical cues but don't state what characters are thinking\n\n[ADDITIONAL INSTRUCTION: ${t}]\n\nWrite a brief narration describing the current moment in this private conversation:`,
            l = sanitizeNpcResponse(await queuedGenerateText(r, {}, `Narrator for ${e.name} chat`), 8),
            c = gameState.time?.currentTime || Date.now();
        if (
            (gameState.chatHistory[n] || (gameState.chatHistory[n] = []),
            gameState.chatHistory[n].push({
                sender: "Narrator",
                content: l,
                isPlayer: !1,
                isNarrator: !0,
                timestamp: c,
            }),
            saveGame(!1),
            a && (a.style.display = "none"),
            gameState.activeChat?.id === n)
        ) {
            const e = document.getElementById("chatMessages");
            if (e) {
                addChatMessage("Narrator", l, !1, null, gameState.chatHistory[n].length - 1, null, c, !0),
                    (e.scrollTop = e.scrollHeight);
            }
        }
    } catch (e) {
        console.error("Error generating narrator response:", e),
            a && (a.style.display = "none"),
            showNotification("Failed to generate narration. Please try again.", "error");
    }
}
async function triggerNpcActionWithModifier(e, t) {
    const n = e.id,
        a = e.name,
        o = $("chatTypingIndicator"),
        i = $("chatTypingName");
    o && i && ((o.style.display = "block"), (i.textContent = a)),
        gameState.typingStates || (gameState.typingStates = {}),
        (gameState.typingStates[n] = !0);
    try {
        const i = buildConversationHistoryWithImages(n, 10);
        ensureEmployeeMemory(e);
        const { prompt: s } = buildChatPrompt(e, i, ""),
            r = t.instruction.replace(/\{\{char\}\}/gi, e.name),
            l = getPhysicalDescriptionForPrompt(e),
            c = `${s}\n\n[RESPONSE STYLE MODIFIER - UNPROMPTED]\nThe player has requested you perform an action/response in a specific style without saying anything to you.\nYour response MUST follow this instruction:\n${r}\n\nCHARACTER REMINDER: You are ${a}${e.race && "human" !== e.race ? ` (${e.race})` : ""}. ${l}. Your personality: ${e.personality || "professional"}.\nStay in character - your physical actions, mannerisms, and voice should reflect who you are.\n\nThis is an unprompted action - continue naturally from where the conversation left off.\nWrite ONLY as ${a}. Do not write for the player.\nKeep the response natural and in-character.`,
            d = sanitizeNpcResponse(await queuedGenerateText(c, {}, `NPC Action (${t.type}) for ${a}`), 10),
            p = gameState.time?.currentTime || Date.now();
        if (
            (gameState.chatHistory[n] || (gameState.chatHistory[n] = []),
            gameState.chatHistory[n].push({
                sender: a,
                content: d,
                isPlayer: !1,
                timestamp: p,
                isActionTriggered: !0,
                actionType: t.type,
            }),
            saveGame(!1),
            (gameState.typingStates[n] = !1),
            o && (o.style.display = "none"),
            gameState.activeChat?.id === n)
        ) {
            const e = document.getElementById("chatMessages");
            if (e) {
                addChatMessage(a, d, !1, null, gameState.chatHistory[n].length - 1, null, p),
                    (e.scrollTop = e.scrollHeight);
            }
        } else e.unreadMessages || (e.unreadMessages = 0), e.unreadMessages++;
        await updateEmployeeStatsFromChat(e, "", d), analyzeConversationForFlags(e, d);
    } catch (e) {
        console.error("Error triggering NPC action with modifier:", e),
            (gameState.typingStates[n] = !1),
            o && (o.style.display = "none"),
            showNotification("Failed to generate action. Please try again.", "error");
    }
}
function showCustomActionInputModal(e) {
    const t = document.createElement("div");
    (t.style.cssText =
        "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-80); z-index:999999; display:flex; justify-content:center; align-items:center;"),
        (t.innerHTML = `\n      <div style="background:var(--surface); padding:25px; border-radius:12px; max-width:500px; width:90%;">\n        <h3 style="margin:0 0 15px 0; color:var(--positive);">✏️ Custom Action for ${e.name}</h3>\n        <p style="color:var(--text-dim); margin:0 0 15px 0; font-size:0.9rem;">\n          Describe what ${e.name} should do or say. This won't show as a player message.\n        </p>\n        <textarea id="customActionInput" placeholder="e.g., 'Lean in closer and whisper something suggestive' or 'Express worry about the upcoming deadline'" \n          style="width:100%; min-height:100px; padding:12px; background:var(--surface-2); border:1px solid var(--positive); border-radius:8px; color:var(--l-ink); font-size:0.95rem; resize:vertical; font-family:inherit;"></textarea>\n        <div style="display:flex; gap:10px; margin-top:15px; justify-content:flex-end;">\n          <button id="cancelCustomAction" style="padding:10px 20px; background:var(--l-neutral-5); border:none; border-radius:6px; color:var(--l-ink); cursor:pointer;">Cancel</button>\n          <button id="triggerCustomAction" style="padding:10px 20px; background:linear-gradient(135deg, var(--l-green) 0%, var(--l-cyan) 100%); border:none; border-radius:6px; color:var(--l-on-accent); cursor:pointer; font-weight:600;">\n            ✨ Trigger Action\n          </button>\n        </div>\n      </div>\n    `),
        document.body.appendChild(t);
    const n = t.querySelector("#customActionInput");
    n.focus(),
        t.querySelector("#cancelCustomAction").addEventListener("click", () => {
            t.remove();
        }),
        t.addEventListener("click", (e) => {
            e.target === t && t.remove();
        }),
        t.querySelector("#triggerCustomAction").addEventListener("click", async () => {
            const a = n.value.trim();
            a
                ? (t.remove(), await triggerNpcAction(e, a))
                : showNotification("Please enter an action instruction", "error");
        }),
        n.addEventListener("keydown", async (a) => {
            if ("Enter" === a.key && !a.shiftKey) {
                a.preventDefault();
                const o = n.value.trim();
                o && (t.remove(), await triggerNpcAction(e, o));
            }
        });
}
function showActionButtonConfigModal(e) {
    const t = document.createElement("div");
    t.style.cssText =
        "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-80); z-index:999999; display:flex; justify-content:center; align-items:center; overflow-y:auto;";
    const n = (e.actionButtons || DEFAULT_NPC_ACTION_BUTTONS).map((e) => ({ ...e })),
        a = (e) =>
            e
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "")
                .slice(0, 15) || "cmd",
        o = (t, n) => {
            const o = t.id.startsWith("custom_") || !DEFAULT_NPC_ACTION_BUTTONS.some((e) => e.id === t.id),
                i = a(t.name.replace(t.emoji + " ", ""));
            return `\n        <div class="action-btn-config" data-index="${n}" data-original-id="${t.id}" style="background:var(--surface-2); padding:12px; border-radius:8px; border-left:3px solid ${!1 !== t.enabled ? "var(--l-green)" : "var(--l-neutral-5)"};">\n          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">\n            <input type="checkbox" ${!1 !== t.enabled ? "checked" : ""} data-field="enabled" style="width:18px; height:18px; cursor:pointer; flex-shrink:0;">\n            <input type="text" value="${t.emoji}" data-field="emoji" maxlength="2" \n              style="width:36px; padding:4px; background:var(--surface); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); text-align:center; font-size:1.1rem; flex-shrink:0;">\n            <code class="command-display" style="color:var(--positive); font-size:0.8rem; background:var(--surface); padding:2px 6px; border-radius:3px; white-space:nowrap;">/${i}</code>\n            <input type="text" value="${t.name.replace(t.emoji + " ", "").replace(/"/g, "&quot;")}" data-field="name" placeholder="Button name..."\n              style="flex:1; padding:4px 8px; background:var(--surface); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-weight:600; font-size:0.85rem; min-width:80px;">\n            <button class="delete-action-btn" data-index="${n}" style="padding:4px 8px; background:${o ? "var(--l-red)" : "var(--l-neutral-3)"}; border:none; border-radius:4px; color:${o ? "white" : "var(--l-neutral-6)"}; cursor:${o ? "pointer" : "not-allowed"}; font-size:0.8rem; flex-shrink:0;" ${o ? "" : 'disabled title="Cannot delete default actions"'}>🗑️</button>\n          </div>\n          <div class="validation-warning" style="display:none; color:var(--l-red-lt); font-size:0.75rem; margin:4px 0 8px 28px; padding:4px 8px; background:rgba(255,107,107,0.1); border-radius:4px;">\n            ⚠️ Name cannot be empty\n          </div>\n          <div style="margin-left:28px;">\n            <div style="color:var(--text-mute); font-size:0.7rem; margin-bottom:4px;">AI INSTRUCTION (what ${e.name} will do):</div>\n            <textarea data-field="instruction" placeholder="Describe how the NPC should respond..."\n              style="width:100%; padding:6px 8px; background:var(--surface); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink-dim); font-size:0.8rem; resize:vertical; min-height:40px; font-family:inherit;">${(t.instruction || "").replace(/"/g, "&quot;")}</textarea>\n            <div class="instruction-warning" style="display:none; color:var(--l-red-lt); font-size:0.75rem; margin-top:4px;">\n              ⚠️ Instruction cannot be empty\n            </div>\n          </div>\n        </div>\n      `;
        };
    (t.innerHTML = `\n      <div style="background:var(--surface); padding:25px; border-radius:12px; max-width:650px; width:90%; max-height:90vh; overflow-y:auto; margin:20px;">\n        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">\n          <h3 style="margin:0; color:var(--positive);">⚙️ Response Style Buttons</h3>\n          <button id="closeActionConfig" style="background:transparent; border:none; color:var(--l-ink); font-size:1.5rem; cursor:pointer;">✕</button>\n        </div>\n        \n        \x3c!-- How It Works Section --\x3e\n        <div style="background:linear-gradient(135deg, rgba(78,204,163,0.15) 0%, rgba(0,212,255,0.1) 100%); border:1px solid rgba(78,204,163,0.3); border-radius:10px; padding:15px; margin-bottom:20px;">\n          <h4 style="margin:0 0 10px 0; color:var(--positive); font-size:0.95rem;">💡 How Response Styles Work</h4>\n          <p style="color:var(--l-ink-dim); margin:0 0 12px 0; font-size:0.85rem; line-height:1.5;">\n            These buttons let you <strong>control HOW ${e.name} responds</strong> to you. The command (e.g., <code style="color:var(--positive);">/action</code>) is auto-generated from the button name.\n          </p>\n          \n          <div style="background:var(--l-veil-30); border-radius:6px; padding:10px; margin-bottom:10px;">\n            <div style="color:var(--accent-gold); font-size:0.8rem; margin-bottom:5px;">📝 Example Usage:</div>\n            <code style="color:var(--positive); font-size:0.85rem; display:block; margin-bottom:6px;">/action {I step closer and tilt your chin up}</code>\n            <span style="color:var(--text-mute); font-size:0.75rem;">→ Your message appears, then ${e.name} responds with <em>only physical actions</em></span>\n          </div>\n          \n          <div style="display:flex; gap:15px; flex-wrap:wrap; font-size:0.8rem; color:var(--text-dim); margin-bottom:12px;">\n            <div><strong style="color:var(--positive);">With message:</strong> You say something, they respond in that style</div>\n            <div><strong style="color:var(--positive);">Without message:</strong> They do an unprompted action in that style</div>\n          </div>\n          \n          \x3c!-- /do Command Explanation --\x3e\n          <div style="background:rgba(255,165,0,0.1); border:1px solid rgba(255,165,0,0.3); border-radius:6px; padding:10px; margin-bottom:10px;">\n            <div style="color:var(--l-orange); font-size:0.8rem; font-weight:600; margin-bottom:6px;">🎭 Special Command: <code style="background:var(--surface); padding:2px 6px; border-radius:3px;">/do</code></div>\n            <p style="color:var(--l-ink-dim); font-size:0.8rem; margin:0 0 6px 0;">\n              Unlike response styles, <code style="color:var(--l-orange);">/do</code> is a <strong>direct command</strong> — it tells the NPC exactly what to do without showing your message.\n            </p>\n            <code style="color:var(--l-orange); font-size:0.8rem; display:block; margin-bottom:4px;">/do lean in and whisper something flirty</code>\n            <span style="color:var(--text-mute); font-size:0.75rem;">→ No player message shown. ${e.name} just does it.</span>\n          </div>\n          \n          \x3c!-- /narrator Command Explanation --\x3e\n          <div style="background:rgba(199,125,255,0.1); border:1px solid rgba(199,125,255,0.3); border-radius:6px; padding:10px;">\n            <div style="color:var(--l-violet); font-size:0.8rem; font-weight:600; margin-bottom:6px;">📜 Special Command: <code style="background:var(--surface); padding:2px 6px; border-radius:3px;">/narrator</code></div>\n            <p style="color:var(--l-ink-dim); font-size:0.8rem; margin:0 0 6px 0;">\n              Adds third-person narration to describe the scene. Use <code style="color:var(--l-violet);">/n</code> as a shortcut.\n            </p>\n            <code style="color:var(--l-violet); font-size:0.8rem; display:block; margin-bottom:4px;">/narrator &lt;Focus on the romantic tension&gt;</code>\n            <span style="color:var(--text-mute); font-size:0.75rem;">→ Narrator describes the scene with your guidance.</span>\n          </div>\n        </div>\n        \n        \x3c!-- Quick Reference - will update dynamically --\x3e\n        <div id="quickCommandRef" style="background:var(--surface-2); border-radius:8px; padding:12px; margin-bottom:20px;">\n          <div style="color:var(--text-mute); font-size:0.75rem; margin-bottom:8px;">⌨️ QUICK COMMAND REFERENCE (updates as you type)</div>\n          <div id="commandRefList" style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">\n            <span style="background:rgba(255,165,0,0.2); border:1px solid rgba(255,165,0,0.4); padding:3px 8px; border-radius:4px; font-family:monospace; font-size:0.75rem; color:var(--l-orange);" title="Direct command - NPC does exactly this">/do</span>\n            <span style="background:rgba(199,125,255,0.2); border:1px solid rgba(199,125,255,0.4); padding:3px 8px; border-radius:4px; font-family:monospace; font-size:0.75rem; color:var(--l-violet);" title="Add narrator description">/narrator</span>\n          </div>\n        </div>\n        \n        <h4 style="margin:0 0 15px 0; color:var(--l-ink); font-size:0.9rem;">📋 Available Response Styles <span style="color:var(--text-mute); font-size:0.75rem;">(command auto-updates from name)</span></h4>\n        \n        <div id="actionButtonsList" style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px;">\n          ${n.map((e, t) => o(e, t)).join("")}\n        </div>\n        \n        \x3c!-- Add Custom Section --\x3e\n        <div style="background:linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.05) 100%); border:1px solid rgba(255,215,0,0.3); padding:15px; border-radius:8px; margin-bottom:20px;">\n          <h4 style="margin:0 0 12px 0; color:var(--accent-gold); font-size:0.9rem;">➕ Create Custom Response Style</h4>\n          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:8px; align-items:center;">\n            <input type="text" id="newActionEmoji" placeholder="😊" maxlength="2" style="width:50px; padding:8px; background:var(--surface); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); text-align:center; font-size:1.2rem;">\n            <input type="text" id="newActionName" placeholder="Button Label" style="flex:1; min-width:120px; padding:8px; background:var(--surface); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink);">\n            <code id="newCommandPreview" style="color:var(--positive); font-size:0.85rem; background:var(--surface); padding:6px 10px; border-radius:4px; min-width:60px;">/...</code>\n          </div>\n          <textarea id="newActionInstruction" placeholder="Describe how ${e.name} should respond when this style is used...&#10;Example: {{char}} speaks seductively, using double meanings and suggestive body language." \n            style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); min-height:60px; resize:vertical; font-family:inherit; font-size:0.85rem;"></textarea>\n          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">\n            <span style="color:var(--text-mute); font-size:0.75rem;">💡 Use <code style="color:var(--positive);">{{char}}</code> to reference the NPC's name</span>\n            <button id="addNewActionBtn" style="padding:8px 16px; background:var(--l-gold); border:none; border-radius:6px; color:var(--l-on-accent); cursor:pointer; font-weight:600;">\n              + Add Style\n            </button>\n          </div>\n        </div>\n        \n        <div style="display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap;">\n          <button id="resetToDefaultActions" style="padding:10px 20px; background:var(--l-neutral-5); border:none; border-radius:6px; color:var(--l-ink); cursor:pointer;">\n            Reset to Defaults\n          </button>\n          <button id="saveActionConfig" style="padding:10px 20px; background:linear-gradient(135deg, var(--l-green) 0%, var(--l-cyan) 100%); border:none; border-radius:6px; color:var(--l-on-accent); cursor:pointer; font-weight:600;">\n            💾 Save Changes\n          </button>\n        </div>\n      </div>\n    `),
        document.body.appendChild(t);
    const i = () => {
        const e = t.querySelector("#commandRefList");
        if (!e) return;
        const n = t.querySelectorAll(".action-btn-config");
        let o =
            '<span style="background:rgba(255,165,0,0.2); border:1px solid rgba(255,165,0,0.4); padding:3px 8px; border-radius:4px; font-family:monospace; font-size:0.75rem; color:var(--l-orange);" title="Direct command - NPC does exactly this">/do</span>';
        (o +=
            '<span style="background:rgba(199,125,255,0.2); border:1px solid rgba(199,125,255,0.4); padding:3px 8px; border-radius:4px; font-family:monospace; font-size:0.75rem; color:var(--l-violet);" title="Add narrator description">/narrator</span>'),
            n.forEach((e) => {
                const t = e.querySelector('[data-field="enabled"]')?.checked,
                    n = e.querySelector('[data-field="name"]')?.value?.trim() || "";
                if (t && n) {
                    const e = a(n);
                    o += `<span style="background:var(--surface); padding:3px 8px; border-radius:4px; font-family:monospace; font-size:0.75rem; color:var(--positive);">/${e}</span>`;
                }
            }),
            (e.innerHTML = o);
    };
    i(),
        t.querySelector("#closeActionConfig").addEventListener("click", () => {
            t.remove();
        }),
        t.addEventListener("click", (e) => {
            e.target === t && t.remove();
        });
    const s = (e) => {
        const o = e.querySelector('[data-field="enabled"]'),
            s = e.querySelector('[data-field="name"]'),
            r = (e.querySelector('[data-field="emoji"]'), e.querySelector('[data-field="instruction"]')),
            l = e.querySelector(".command-display"),
            c = e.querySelector(".validation-warning"),
            d = e.querySelector(".instruction-warning"),
            p = e.querySelector(".delete-action-btn");
        o &&
            o.addEventListener("change", () => {
                (e.style.borderLeftColor = o.checked ? "var(--l-green)" : "var(--l-neutral-5)"), i();
            }),
            s &&
                l &&
                s.addEventListener("input", () => {
                    const e = s.value.trim(),
                        t = a(e);
                    (l.textContent = e ? `/${t}` : "/..."),
                        (l.style.color = e ? "var(--l-green)" : "var(--l-red-lt)"),
                        c &&
                            ((c.style.display = e ? "none" : "block"),
                            (s.style.borderColor = e ? "var(--l-neutral-5)" : "var(--l-red-lt)")),
                        i();
                }),
            r &&
                d &&
                r.addEventListener("input", () => {
                    const e = r.value.trim();
                    (d.style.display = e ? "none" : "block"), (r.style.borderColor = e ? "var(--l-neutral-5)" : "var(--l-red-lt)");
                }),
            p &&
                !p.disabled &&
                p.addEventListener("click", async () => {
                    const a = parseInt(e.dataset.index);
                    (await showConfirm("Delete this response style?", "Delete Style", {
                        type: "danger",
                        confirmText: "Delete",
                    })) &&
                        (n.splice(a, 1),
                        e.remove(),
                        t.querySelectorAll(".action-btn-config").forEach((e, t) => {
                            e.dataset.index = t;
                            const n = e.querySelector(".delete-action-btn");
                            n && (n.dataset.index = t);
                        }),
                        i(),
                        showNotification("Response style deleted", "success"));
                });
    };
    t.querySelectorAll(".action-btn-config").forEach(s);
    const r = t.querySelector("#newActionName"),
        l = t.querySelector("#newCommandPreview");
    r &&
        l &&
        r.addEventListener("input", () => {
            const e = r.value.trim(),
                t = a(e);
            (l.textContent = e ? `/${t}` : "/..."), (l.style.color = e ? "var(--l-green)" : "var(--l-neutral-8)");
        }),
        t.querySelector("#addNewActionBtn").addEventListener("click", () => {
            const e = t.querySelector("#newActionEmoji").value.trim() || "🎯",
                r = t.querySelector("#newActionName").value.trim(),
                c = t.querySelector("#newActionInstruction").value.trim();
            if (!r) return void showNotification("Please enter a button label", "error");
            if (!c) return void showNotification("Please enter an instruction", "error");
            const d = { id: `custom_${Date.now()}`, name: `${e} ${r}`, instruction: c, emoji: e, enabled: !0 };
            n.push(d);
            const p = t.querySelector("#actionButtonsList"),
                m = document.createElement("div");
            m.innerHTML = o(d, n.length - 1);
            const u = m.firstElementChild;
            p.appendChild(u),
                s(u),
                (t.querySelector("#newActionEmoji").value = ""),
                (t.querySelector("#newActionName").value = ""),
                (t.querySelector("#newActionInstruction").value = ""),
                (l.textContent = "/..."),
                (l.style.color = "var(--l-on-accent)"),
                i(),
                showNotification(`Added /${a(r)} command!`, "success");
        }),
        t.querySelector("#resetToDefaultActions").addEventListener("click", () => {
            (e.actionButtons = void 0),
                t.remove(),
                renderNpcActionButtons(e),
                showNotification("Reset to default actions", "success");
        }),
        t.querySelector("#saveActionConfig").addEventListener("click", () => {
            const n = t.querySelectorAll(".action-btn-config"),
                o = [];
            let i = !1;
            n.forEach((e, t) => {
                const n = e.querySelector('[data-field="enabled"]')?.checked ?? !0,
                    s = e.querySelector('[data-field="emoji"]')?.value?.trim() || "🎯",
                    r = e.querySelector('[data-field="name"]')?.value?.trim() || "",
                    l = e.querySelector('[data-field="instruction"]')?.value?.trim() || "",
                    c = e.dataset.originalId;
                if (
                    (n &&
                        !r &&
                        ((e.querySelector(".validation-warning").style.display = "block"),
                        (e.querySelector('[data-field="name"]').style.borderColor = "var(--l-red-lt)"),
                        (i = !0)),
                    n &&
                        !l &&
                        ((e.querySelector(".instruction-warning").style.display = "block"),
                        (e.querySelector('[data-field="instruction"]').style.borderColor = "var(--l-red-lt)"),
                        (i = !0)),
                    r || !n)
                ) {
                    const e = a(r) || c;
                    o.push({ id: e, name: `${s} ${r}`, instruction: l, emoji: s, enabled: n });
                }
            }),
                i
                    ? showNotification("Please fill in all required fields for enabled styles", "error")
                    : ((e.actionButtons = o),
                      t.remove(),
                      renderNpcActionButtons(e),
                      saveGame(),
                      showNotification("Response styles saved!", "success"));
        });
}
async function sendChatMessage() {
    if (!chatInput || !chatMessages) return;
    let e = chatInput.value.trim();
    if (!e || !gameState.activeChat) return;
    const t = gameState.activeChat.id,
        n = gameState.activeChat.name,
        a = e.match(/^\/([a-z_]+)\s*(?:\{([^}]*)\})?\s*(?:<([^>]*)>)?$/i);
    let o = null;
    if (a) {
        const n = a[1].toLowerCase(),
            i = (a[2] || "").trim(),
            s = (a[3] || "").trim(),
            r = gameState.employees.find((e) => e.id === t),
            l = (r?.actionButtons || DEFAULT_NPC_ACTION_BUTTONS).find((e) => e.id === n);
        l
            ? ((o = {
                  type: n,
                  instruction: s || l.instruction,
                  emoji: l.emoji || "🎬",
                  hasCustomInstructions: !!s,
              }),
              (e = i && "optional" !== i.toLowerCase() && "" !== i ? i : ""))
            : (o = null);
    }
    if (e.toLowerCase().startsWith("/do ")) {
        const n = e.slice(4).trim();
        if (n) {
            chatInput.value = "";
            const e = gameState.employees.find((e) => e.id === t);
            e && (await triggerNpcAction(e, n));
        }
        return;
    }
    const i = e.match(/^\/(narrator|n)(?:\s+<([^>]*)>)?$/i);
    if (i) {
        chatInput.value = "";
        const e = gameState.employees.find((e) => e.id === t);
        if (e) {
            const t = (i[2] || "").trim() || "Describe the current scene and atmosphere between the characters.";
            await generateChatNarratorResponse(e, t);
        }
        return;
    }
    const s = gameState.time?.currentTime || Date.now(),
        r = gameState.employees.find((e) => e.id === t);
    if ((r && (r.lastPlayerMessageTime = s), o && !e)) {
        if (!r) return;
        const e = document.createElement("div");
        return (
            (e.className = "action-indicator"),
            (e.style.cssText = "text-align:center; opacity:0.5; font-size:0.75rem; margin:4px 0; color:var(--text-mute);"),
            (e.textContent = `${o.emoji} ${o.type}`),
            chatMessages.appendChild(e),
            (chatMessages.scrollTop = chatMessages.scrollHeight),
            (chatInput.value = ""),
            void (await triggerNpcActionWithModifier(r, o))
        );
    }
    if (!e) return void (chatInput.value = "");
    addChatMessage("You", e, !0, null, null, null, s),
        pushChatMessage(t, { sender: "You", content: e, isPlayer: !0, timestamp: s, actionModifier: o }),
        saveGame(!1),
        aiOptimization.blockedProactiveMessages.delete(t),
        r &&
            r.proactiveMessages &&
            ((r.proactiveMessages.consecutiveUnreplied = 0),
            console.log(`[Proactive Message] ${r.name}: Counter reset - Player responded`));
    const l = extractSalientFacts(e, gameState.activeChat);
    for (const e of l) remember(gameState.activeChat, `Player ${e.text}`, e.type, e.importance);
    if (
        ((chatInput.value = ""),
        r && ("sleeping" === r.npcStatus?.current || "vampire_rest" === r.npcStatus?.current))
    ) {
        const t = (r.race || "").toLowerCase(),
            n = ["angel", "elf"].includes(t),
            a = r.npcStatus.sleepThrough;
        if (!n && a && Math.random() < 0.75)
            return scheduleWakeUpResponse(r, e), void showNotification(`${r.name} is asleep 😴`, "info");
        (r.npcStatus.current = "waking_up"),
            (r.npcStatus.label = "😴 Just Woke Up"),
            (r.npcStatus.responsiveness = 30),
            (r.npcStatus.richLabel = null);
        const o = document.getElementById("chatStatus");
        o && ((o.innerHTML = getNPCStatusBadgeHTML(r)), (o.title = r.npcStatus.label));
    }
    gameState.typingStates || (gameState.typingStates = {}),
        (gameState.typingStates[t] = !0),
        chatTypingIndicator &&
            chatTypingName &&
            gameState.activeChat?.id === t &&
            ((chatTypingIndicator.style.display = "block"), (chatTypingName.textContent = n));
    try {
        const a = buildConversationHistoryWithImages(t),
            i = gameState.employees.find((e) => e.id === t);
        if (!i) return void (gameState.typingStates[t] = !1);
        ensureEmployeeMemory(i);
        let { prompt: s, personalAllowed: r } = buildChatPrompt(i, a, e);
        if (o) {
            s += `\n\n[RESPONSE STYLE MODIFIER]\nThe player has requested a specific response style. Your response MUST follow this instruction:\n${o.instruction.replace(/\{\{char\}\}/gi, i.name)}\n\nStill respond to their message naturally, but in this specific style/manner.`;
        }
        const l = !1 !== gameState.settings?.enableStreamingResponses;
        chatTypingIndicator && (chatTypingIndicator.style.display = "none");
        let c = null;
        if (l && chatMessages && gameState.activeChat?.id === t) {
            (c = document.createElement("div")),
                (c.style.cssText =
                    "max-width:80%; padding:10px 15px; border-radius:18px; margin-bottom:10px; word-wrap:break-word; position:relative; background:var(--surface-2); align-self:flex-start; color:var(--l-ink-cool-3);");
            const e = document.createElement("div");
            (e.style.cssText = "font-size:0.7rem; opacity:0.6; margin-bottom:6px; font-style:italic;"),
                (e.textContent = getContextAwareTimestamp()),
                c.appendChild(e);
            const t = document.createElement("div");
            (t.className = "stream-text"),
                (t.textContent = "▍"),
                c.appendChild(t),
                chatMessages.appendChild(c),
                (chatMessages.scrollTop = chatMessages.scrollHeight);
        }
        const d = await queuedGenerateText(
            s,
            {
                ...(c
                    ? {
                          onChunk: function (e) {
                              if (!e) return;
                              if (c && gameState.activeChat?.id === t) {
                                  const t = c.querySelector(".stream-text");
                                  t && (t.textContent = e.fullTextSoFar + "▍"),
                                      (chatMessages.scrollTop = chatMessages.scrollHeight);
                              }
                          },
                      }
                    : {}),
            },
            `Generating chat response for ${i.name}`
        );
        c && (c.remove(), (c = null));
        const p = sanitizeNpcResponse(d, 10),
            m = gameState.time?.currentTime || Date.now();
        if (
            (pushChatMessage(t, { sender: n, content: p, isPlayer: !1, timestamp: m }),
            saveGame(!1),
            (gameState.typingStates[t] = !1),
            (gameState.activeChat && gameState.activeChat.id === t) ||
                (i.unreadMessages || (i.unreadMessages = 0), i.unreadMessages++),
            chatTypingIndicator && gameState.activeChat?.id === t && (chatTypingIndicator.style.display = "none"),
            gameState.activeChat?.id === t && chatMessages)
        ) {
            const e = gameState.chatHistory[t].length - 1;
            addChatMessage(n, p, !1, null, e, null, m), (chatMessages.scrollTop = chatMessages.scrollHeight);
        }
        const u = extractSalientFacts(p, i);
        for (const e of u) remember(i, `${i.name} ${e.text}`, e.type, e.importance);
        const g = (i.hobbies || []).some((e) => new RegExp(`\\b${e}\\b`, "i").test(p)),
            h = i.productManaged && new RegExp(`\\b${i.productManaged}\\b`, "i").test(p),
            y = i.position && new RegExp(`\\b${i.position}\\b`, "i").test(p);
        (i.memory.styleCounters.total += 1),
            (i.memory.styleCounters.sincePersonal =
                g || h || y ? 0 : Math.min(10, (i.memory.styleCounters.sincePersonal || 0) + 1)),
            (h || y) &&
                ((i.memory.styleCounters.jobMentions += 1),
                (i.memory.styleCounters.lastJobMention = i.memory.styleCounters.total)),
            g &&
                ((i.memory.styleCounters.hobbyMentions += 1),
                (i.memory.styleCounters.lastHobbyMention = i.memory.styleCounters.total)),
            applySceneStateFromNarration(i, p),
            detectEventSignals(i, p, {}),
            await detectPostRequest(i, e, p),
            await detectImageRequest(i, e, p),
            await considerMoneyRequest(i, e, p),
            await updateEmployeeStatsFromChat(i, e, p),
            analyzeConversationForFlags(i, p, e),
            maybeRunAIFlagScan(i),
            detectAndScheduleCommitments(i, e, p),
            processSkillGainsFromChat(i, e, p);
        (/\b(date|dinner|coffee|love|cute|beautiful|sexy|promotion|raise|fire|bonus)\b/i.test(e) ||
            /\b(date|dinner|coffee|love|cute|beautiful|sexy|thank|appreciate)\b/i.test(p)) &&
            logCompanyEvent({
                type: "boss_interaction",
                involvedEmployees: [t],
                location: i.locationId,
                description: `Boss chat with ${n}: "${e.slice(0, 50)}${e.length > 50 ? "..." : ""}"`,
                sentiment: "neutral",
                importance: 5,
            }),
            await checkAutoVisualization(i),
            "people" === gameState.activeTab && updatePeopleTab(),
            "dashboard" === gameState.activeTab && refreshDashboardSections();
    } catch (e) {
        console.error("Error generating chat response:", e),
            gameState.typingStates && (gameState.typingStates[t] = !1),
            chatTypingIndicator && gameState.activeChat?.id === t && (chatTypingIndicator.style.display = "none"),
            gameState.activeChat?.id === t &&
                chatMessages &&
                addChatMessage(n, "Sorry, I'm having trouble responding right now.", !1);
    }
}
function editPlayerMessage(e) {
    if (!gameState.activeChat) return;
    const t = gameState.activeChat,
        n = gameState.chatHistory[t.id];
    if (!n || e < 0 || e >= n.length) return;
    const a = n[e];
    if (a.isPlayer && chatInput) {
        (chatInput.value = a.content), chatInput.focus(), (chatInput.dataset.editingIndex = e);
        const t = document.getElementById("chatSendBtn");
        t && ((t.textContent = "✏️ Update"), (t.style.backgroundColor = "var(--l-orange-2)")),
            showNotification("💬 Editing message. Press Update to replace it and regenerate response.", 3e3);
    }
}
async function resendPlayerMessage(e) {
    if (!gameState.activeChat) return;
    const t = gameState.activeChat,
        n = gameState.chatHistory[t.id];
    if (!n || e < 0 || e >= n.length) return;
    const a = n[e];
    if (a.isPlayer) {
        (n[e].timestamp = Date.now()),
            (gameState.chatHistory[t.id] = n.slice(0, e + 1)),
            loadChatHistory(t.id),
            chatTypingIndicator &&
                chatTypingName &&
                ((chatTypingIndicator.style.display = "block"), (chatTypingName.textContent = t.name)),
            showNotification("🔄 Resending message and generating new response...", 2e3);
        try {
            const e = buildConversationHistoryWithImages(t.id);
            ensureEmployeeMemory(t);
            const { prompt: n } = buildChatPrompt(t, e, a.content),
                o = sanitizeNpcResponse(
                    await queuedGenerateText(n, {}, `Generating auto chat response for ${t.name}`),
                    5
                );
            gameState.chatHistory[t.id].push({
                sender: t.name,
                content: o,
                isPlayer: !1,
                timestamp: gameState.time?.currentTime || Date.now(),
            }),
                chatTypingIndicator && (chatTypingIndicator.style.display = "none"),
                loadChatHistory(t.id),
                await updateEmployeeStatsFromChat(t, a.content, o),
                (chatMessages.scrollTop = chatMessages.scrollHeight),
                showNotification("✅ Message resent and new response generated!", 2e3);
            // Re-run the request-detection funnel so a resent reply to a natural-language
            // image/post/money request still triggers the NPC's image/post (mirrors sendChatMessage
            // and regenerateMessage's identical fix). Without this, resending after an AFK image
            // timeout regenerates the affirmative text but silently drops the image.
            detectPostRequest(t, a.content, o),
                detectImageRequest(t, a.content, o),
                considerMoneyRequest(t, a.content, o);
        } catch (e) {
            console.error("Error generating response after resend:", e),
                chatTypingIndicator && (chatTypingIndicator.style.display = "none"),
                showNotification("Failed to generate new response. Please try again.");
        }
    }
}
async function sendOrUpdateChatMessage() {
    if (!chatInput || !chatMessages) return;
    const e = chatInput.value.trim();
    if (!e || !gameState.activeChat) return;
    const t = chatInput.dataset.editingIndex;
    if (null != t) {
        const n = parseInt(t),
            a = gameState.activeChat,
            o = gameState.chatHistory[a.id];
        if (o && n >= 0 && n < o.length) {
            (o[n].content = e),
                (o[n].timestamp = gameState.time?.currentTime || Date.now()),
                (gameState.chatHistory[a.id] = o.slice(0, n + 1)),
                saveGame(!1),
                delete chatInput.dataset.editingIndex;
            const t = document.getElementById("chatSendBtn");
            t && ((t.textContent = "Send"), (t.style.backgroundColor = "#4CAF50")),
                loadChatHistory(a.id),
                (chatInput.value = ""),
                chatTypingIndicator &&
                    chatTypingName &&
                    ((chatTypingIndicator.style.display = "block"), (chatTypingName.textContent = a.name));
            try {
                const t = buildConversationHistoryWithImages(a.id);
                ensureEmployeeMemory(a);
                const { prompt: n } = buildChatPrompt(a, t, e),
                    o = sanitizeNpcResponse(
                        await queuedGenerateText(n, {}, `Generating regenerated response for ${a.name}`),
                        5
                    );
                gameState.chatHistory[a.id].push({
                    sender: a.name,
                    content: o,
                    isPlayer: !1,
                    timestamp: gameState.time?.currentTime || Date.now(),
                }),
                    saveGame(!1),
                    chatTypingIndicator && (chatTypingIndicator.style.display = "none"),
                    loadChatHistory(a.id),
                    await updateEmployeeStatsFromChat(a, e, o),
                    (chatMessages.scrollTop = chatMessages.scrollHeight),
                    showNotification("✅ Message updated and response regenerated!", 2e3);
            } catch (e) {
                console.error("Error generating response after edit:", e),
                    chatTypingIndicator && (chatTypingIndicator.style.display = "none"),
                    showNotification("Failed to generate new response. Please try again.");
            }
            return;
        }
    }
    await sendChatMessage();
}
// Single funnel for every async NPC chat beat. Always persists to chatHistory + saves,
// renders live if that chat is open, otherwise bumps the unread badge + notifies so the
// player knows something arrived and the full sequence shows on reopen.
function deliverNpcChatEvent(npcId, msg = {}) {
    if (!npcId) return -1;
    const emp = gameState.employees.find((e) => e.id === npcId),
        name = msg.sender || emp?.name || "",
        ts = msg.timestamp || gameState.time?.currentTime || Date.now();
    gameState.chatHistory[npcId] || (gameState.chatHistory[npcId] = []);
    const entry = { sender: name, content: msg.content ?? "", isPlayer: !1, timestamp: ts };
    ["imageUrl", "imagePrompt", "imageType", "isMoneyRequest", "amount", "reason", "settled"].forEach((k) => {
        void 0 !== msg[k] && (entry[k] = msg[k]);
    });
    msg.extra && "object" == typeof msg.extra && Object.assign(entry, msg.extra);
    gameState.chatHistory[npcId].push(entry);
    const idx = gameState.chatHistory[npcId].length - 1;
    try {
        saveGame(!1);
    } catch (_) {}
    const isLive = gameState.activeChat?.id === npcId && chatMessages;
    if (isLive)
        // Some callers re-render the whole transcript themselves (refreshChatDisplay);
        // pass render:false so we don't append a duplicate here.
        !1 !== msg.render &&
            (addChatMessage(name, entry.content, !1, entry.imageUrl || null, idx, entry.imagePrompt || null, ts),
            (chatMessages.scrollTop = chatMessages.scrollHeight));
    else
        emp && (emp.unreadMessages = (emp.unreadMessages || 0) + 1),
            !1 !== msg.notify && name && showNotification(`💬 ${name} sent you a message`, "info");
    return idx;
}
// Heuristic fallback: assume agreement UNLESS the reply contains an explicit refusal.
// (Fixes the old bug where a stray "no"/"not" in a flirty reply cancelled the image.)
function heuristicAgreement(npcResponse) {
    return !/\b(i\s+(won'?t|will not|can'?t|cannot|am not going to|am not gonna|don'?t think|do not think)|not comfortable|no way|i refuse|i'?d rather not|absolutely not|i don'?t want|maybe later|not right now|not ready|please stop)\b/i.test(
        String(npcResponse || "")
    );
}
// LLM one-word YES/NO classifier for whether the NPC agreed; falls back to the regex
// heuristic on failure / hallucination / ambiguous output.
async function classifyNpcAgreement(playerMsg, npcResponse, kind) {
    const action = "post" === kind ? "make or share a social media post" : "send a photo of themselves",
        prompt = `A character in a chat was asked by the player to ${action}.\n\nPlayer's request: "${String(
                playerMsg || ""
            ).slice(0, 300)}"\nCharacter's reply: "${String(npcResponse || "").slice(
                0,
                500
            )}"\n\nDid the character AGREE to do it? Treat playful, reluctant, or teasing agreement as YES. Answer NO only if they clearly refused or declined.\nAnswer with exactly one word: YES or NO.`;
    try {
        const raw = String(
            (await queuedGenerateText(prompt, { temperature: 0, max_tokens: 3 }, `Classifying ${kind} agreement`)) ||
                ""
        );
        if (/\byes\b/i.test(raw)) return console.log(`[Agreement] ✅ classifier YES (${kind})`), !0;
        if (/\bno\b/i.test(raw)) return console.log(`[Agreement] ❌ classifier NO (${kind})`), !1;
        return (
            console.warn(`[Agreement] Ambiguous classifier output "${raw.slice(0, 30)}" - heuristic fallback`),
            heuristicAgreement(npcResponse)
        );
    } catch (e) {
        return console.warn("[Agreement] Classifier failed - heuristic fallback:", e), heuristicAgreement(npcResponse);
    }
}
async function detectPostRequest(e, t, n) {
    if (
        !(
            /\b(post|share|put.*on.*feed|upload|publish|make.*post|dare.*you.*to.*post)\b/i.test(t) &&
            (/\b(social|feed|instagram|twitter|snap)\b/i.test(t) ||
                /\b(picture|photo|selfie|video|nude|naked|masturbat|explicit|sexy|hot|revealing)\b/i.test(t))
        )
    )
        return;
    let a = "text",
        o = t;
    /\b(masturbat|dildo|vibrator|toy|finger.*yourself|play.*with.*yourself|touch.*yourself|spread|cum|orgasm|penetrat|squirt)\b/i.test(
        t
    )
        ? (a = "explicit")
        : /\b(nude|naked|full.*nude|nothing.*on|completely.*nude)\b/i.test(t)
          ? (a = /\b(masturbat|touching|playing|spreading)\b/i.test(t) ? "explicit" : "nude")
          : /\b(thirst.*trap|sexy|hot.*pic|revealing|underwear|lingerie)\b/i.test(t)
            ? (a = "thirst_trap")
            : /\b(selfie|picture.*of.*you|photo.*of.*you)\b/i.test(t) && (a = "selfie");
    if (!(await classifyNpcAgreement(t, n, "post")))
        return void console.log("[Post Detection] ❌ NPC did not agree to post:", e.name);
    console.log("[Post Detection] ✅ NPC agreed to post:", e.name);
    const npcId = e.id;
    setTimeout(
        () => {
            const msgs = ["Give me a sec...", "Working on it", "One moment...", "Let me set this up..."];
            deliverNpcChatEvent(npcId, {
                content: msgs[Math.floor(Math.random() * msgs.length)],
                notify: !1,
            });
        },
        1e3 + 1e3 * Math.random()
    ),
        setTimeout(
            async () => {
                await generateRequestedPost(e, a, o);
            },
            3e3 + 4e3 * Math.random()
        );
}
async function detectImageRequest(e, t, n) {
    if (
        /\b(post|share|put.*on.*feed|upload|publish|make.*post)\b/i.test(t) ||
        /\b(social|feed|instagram|twitter|snap.*chat)\b/i.test(t)
    )
        return void console.log("[Image Detection] Skipping - looks like post request");
    // Tightened image-request gate. A genuine photo ask needs an actual photo NOUN, or an
    // explicit "let me see your <body>" / "send me your <body>" phrasing — NOT just a common
    // verb next to a weak word. Previously "send" + "yourself"/"body" (e.g. "I could SEND you
    // money so you could treat YOURSELF") tripped the detector and the NPC fired a photo.
    const _photoNoun = /\b(pic|pics|picture|pictures|photo|photos|selfie|selfies|nude|nudes|snap|snapshot)\b/i.test(t),
        _nsfwView = /\b(nude|nudes|naked|topless|bottomless|lingerie|underwear|tits|boobs|breasts|ass|butt|booty|pussy|cock|dick|cleavage|thong|body|figure|curves)\b/i.test(t),
        _sendVerb = /\b(send|show|snap|share|gimme|take)\b/i.test(t) || /\bgive\s+me\b/i.test(t),
        _seeVerb = /\b(see|show|view|watch)\b/i.test(t) || /\blook\s+at\b/i.test(t),
        _desire = /\b(want|wanna|need|lemme|gimme|please)\b/i.test(t) || /\b(let\s+me|can\s+i|could\s+i|may\s+i|would\s+you)\b/i.test(t),
        _hasPronoun = /\b(you|your|yourself)\b/i.test(t);
    if (
        !(
            (_photoNoun && (_sendVerb || _seeVerb || _desire)) ||
            (_nsfwView && _seeVerb && _hasPronoun) ||
            (_nsfwView && _sendVerb && /\b(me|us|to\s+me)\b/i.test(t))
        )
    )
        return void console.log("[Image Detection] No image request detected");
    console.log("[Image Detection] Image request detected in:", t.substring(0, 60));
    let a = "casual",
        o = t;
    /\b(masturbat|dildo|vibrator|toy|finger.*yourself|play.*with.*yourself|spread|touch.*yourself|cum|orgasm|penetrat|squirt|body.*writing|degradation)\b/i.test(
        t
    )
        ? (a = "explicit")
        : /\b(nude|naked|nothing.*on|completely.*nude|full.*nude|fully.*nude|bare|uncovered)\b/i.test(t)
          ? (a = "nude")
          : /\b(lewd|sexy|revealing|underwear|lingerie|bra|panties|topless|partially.*clothed|see.*through)\b/i.test(
                  t
              )
            ? (a = "lewd")
            : /\b(work|office|professional)\b/i.test(t)
              ? (a = "work")
              : /\b(selfie|picture|photo)\b/i.test(t) && (a = "casual"),
        console.log("[Image Detection] Requested type:", a);
    if (!(await classifyNpcAgreement(t, n, "image")))
        return (
            console.log("[Image Detection] ❌ NPC did not agree to send image"),
            void console.log("[Image Detection] Response:", n.substring(0, 100))
        );
    console.log("[Image Detection] ✅ NPC agreed to send image:", e.name);
    const npcId = e.id;
    setTimeout(
        async () => {
            await generateAndSendRequestedImage(npcId, a, o);
        },
        2e3 + 4e3 * Math.random()
    );
}
async function considerMoneyRequest(e, t, n) {}
// The post type a free-text request is asking for (shared by 1-on-1 and group requests).
function inferPostRequestType(text, fallback = "text") {
    return /\b(masturbat|dildo|toy|vibrator|orgasm|cum|ejaculat|finger.*yourself|play.*with.*yourself|spread.*legs|degradation|body.*writing|explicit.*act)\b/i.test(
        text
    )
        ? "explicit"
        : /\b(nude|naked|full.*nude|completely.*nude|nothing.*on)\b/i.test(text)
          ? "nude"
          : /\b(thirst.*trap|sexy|revealing|underwear|lingerie|hot)\b/i.test(text)
            ? "thirst_trap"
            : /\b(selfie|picture)\b/i.test(text)
              ? "selfie"
              : fallback;
}
async function requestPostFromNPC(e = null, t = null) {
    if (!gameState.activeChat) return;
    const n = gameState.activeChat;
    let a = e || "text",
        o = "";
    if (t) (o = t), (a = inferPostRequestType(t, a));
    else {
        o =
            {
                text: "post a status update",
                selfie: "post a selfie",
                thirst_trap: "post a thirst trap (sexy/revealing photo)",
                nude: "post a nude photo",
                explicit: "post explicit sexual content (masturbation, toys, etc.)",
            }[a] || "make a post";
    }
    const i = t || `Could you ${o}?`;
    chatInput && (chatInput.value = i),
        await sendChatMessage(),
        setTimeout(async () => {
            await evaluateAndExecutePostRequest(n, a, o);
        }, 3e3);
}
// How willing an NPC is to make a requested social post of type t (text/selfie/
// thirst_trap/nude/explicit), from intimacy, affection, comfort, desire and flirtiness.
// Shared by 1-on-1 chat and group chat requests. n is the request text, for the log.
function postRequestWillingness(e, t, n = "") {
    const a = e.memory?.intimacyLevel || 0,
        o = e.stats?.affection || 0,
        i = e.stats?.comfort || 0,
        s = e.stats?.desire || 0,
        r = e.personality || {};
    let l = 0;
    switch (t) {
        case "text":
            l = 10;
            break;
        case "selfie":
            l = 20;
            break;
        case "thirst_trap":
            l = 50;
            break;
        case "nude":
            l = 72;
            break;
        case "explicit":
            l = 88;
    }
    const c = "explicit" === t || "nude" === t ? 0.3 : 0.1,
        d = 0.1 * (r.flirty || 50),
        p = 0.35 * a + 0.25 * o + i * (0.3 - c) + s * c + d,
        m = p >= l || (p >= 0.85 * l && Math.random() < 0.25);
    (console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
        console.log(`📱 SOCIAL POST REQUEST EVALUATION: ${e.name}`),
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
        console.log(`Post Type: ${t.toUpperCase()}`),
        console.log(`Description: "${n}"`),
        console.log("\n📊 Stats:"),
        console.log(`  • Intimacy: ${a.toFixed(1)}`),
        console.log(`  • Affection: ${o.toFixed(1)}`),
        console.log(`  • Comfort: ${i.toFixed(1)}`),
        console.log(`  • Desire: ${s.toFixed(1)}`),
        console.log(`  • Flirty Personality: ${(r.flirty || 50).toFixed(1)}`),
        console.log("\n🧮 Calculation:"),
        console.log(`  • Intimacy × 0.35 = ${(0.35 * a).toFixed(2)}`),
        console.log(`  • Affection × 0.25 = ${(0.25 * o).toFixed(2)}`),
        console.log(`  • Comfort × ${(0.3 - c).toFixed(2)} = ${(i * (0.3 - c)).toFixed(2)}`),
        console.log(`  • Desire × ${c} = ${(s * c).toFixed(2)}`),
        console.log(`  • Flirty × 0.1 = ${d.toFixed(2)}`),
        console.log("  ────────────────────────"),
        console.log(`  • Willingness Score: ${p.toFixed(2)}`),
        console.log(`  • Required Threshold: ${l}`),
        console.log(`  • Grace Threshold (85%): ${(0.85 * l).toFixed(2)}`),
        console.log("\n🎲 Decision:"),
        p >= l
            ? console.log("  ✅ ACCEPTED - Score meets threshold")
            : p >= 0.85 * l
              ? console.log(`  🎲 GRACE ZONE - 25% chance (rolled: ${m ? "SUCCESS" : "FAIL"})`)
              : console.log(`  ❌ REJECTED - Score too low (${(l - p).toFixed(2)} points short)`),
        console.log("\n📝 Final Result: " + (m ? "✅ WILL POST" : "❌ WILL REFUSE")),
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"));
    return m;
}
async function evaluateAndExecutePostRequest(e, t, n) {
    if (postRequestWillingness(e, t, n))
        setTimeout(
            () => {
                if (gameState.activeChat?.id === e.id && chatMessages) {
                    const n = {
                            text: ["Sure, I can post something", "Okay, I'll write something"],
                            selfie: ["Okay! Let me take a selfie", "Sure, give me a sec", "Fine, one sec..."],
                            thirst_trap: [
                                "Alright... let me find something sexy 😏",
                                "Okay okay... give me a minute",
                                "Fine... but only because it's you 😘",
                            ],
                            nude: [
                                "Omg... okay. Give me a moment 😳",
                                "I can't believe I'm doing this... one sec",
                                "Fuck it, why not 😏",
                            ],
                            explicit: [
                                "Holy shit... okay. This is so fucking hot 🥵",
                                "God, you make me so fucking wet... gimme a minute",
                                "Fuck yes... this is so dirty 😈",
                                "Can't believe you're making me do this... one sec 💦",
                            ],
                        }[t] || ["Okay"],
                        a = n[Math.floor(Math.random() * n.length)];
                    gameState.chatHistory[e.id].push({
                        sender: e.name,
                        content: a,
                        isPlayer: !1,
                        timestamp: gameState.time?.currentTime || Date.now(),
                    });
                    const o = gameState.chatHistory[e.id].length - 1;
                    addChatMessage(e.name, a, !1, null, o), (chatMessages.scrollTop = chatMessages.scrollHeight);
                }
            },
            1500 + 1500 * Math.random()
        ),
            setTimeout(
                async () => {
                    await generateRequestedPost(e, t, n);
                },
                4e3 + 6e3 * Math.random()
            );
    else {
        const n = {
                explicit: [
                    "That's way too much for me",
                    "I'm not comfortable posting that",
                    "That's too explicit, sorry",
                ],
                nude: [
                    "I'm not ready to post nudes yet",
                    "That's a bit too much for social media",
                    "Maybe in private, but not on the feed",
                ],
                thirst_trap: [
                    "I don't think I'm comfortable with that",
                    "That's a bit much for me",
                    "Not really my style",
                ],
                selfie: ["Not really feeling it right now", "Maybe later"],
                text: ["I don't really have anything to say", "Not in the mood to post"],
            }[t] || ["I don't think so"],
            a = n[Math.floor(Math.random() * n.length)];
        setTimeout(
            () => {
                if (gameState.activeChat?.id === e.id && chatMessages) {
                    gameState.chatHistory[e.id].push({
                        sender: e.name,
                        content: a,
                        isPlayer: !1,
                        timestamp: gameState.time?.currentTime || Date.now(),
                    });
                    const t = gameState.chatHistory[e.id].length - 1;
                    addChatMessage(e.name, a, !1, null, t), (chatMessages.scrollTop = chatMessages.scrollHeight);
                }
            },
            1500 + 1500 * Math.random()
        );
    }
}
async function generateRequestedPost(e, t, n) {
    isSFWMode() && ["explicit", "thirst_trap", "lewd", "nude"].includes(t) && (t = "selfie"); // SFW: never produce an explicit post
    try {
        const a = getEmployeeAwarenessForPost(e.id);
        if (!a) return;
        (a.requestedByBoss = !0), (a.requestContext = n), (a.mustIncludeImage = !0);
        const o = await generateOrganicPost(e, t, a);
        if (!o || !o.content) return;
        let i = null;
        if ("text" !== t) {
            if (!o.imagePrompt) {
                const a = [];
                a.push(getPhysicalDescriptionForPrompt(e)),
                    "explicit" === t
                        ? a.push(`${n || "explicit sexual content, masturbation"}`)
                        : "nude" === t
                          ? a.push(`${n || "full nude photo, completely naked, revealing everything"}`)
                          : "thirst_trap" === t
                            ? a.push(`${n || "sexy revealing photo, seductive pose, thirst trap"}`)
                            : "selfie" === t && a.push(`${n || "selfie photo"}`),
                    (o.imagePrompt = a.join(", "));
            }
            try {
                (i = await queuedGenerateImage(
                    applyImageStyle(o.imagePrompt),
                    `Requested post image for ${e.name}`
                )),
                    console.log(`[Request Post] Generated image for ${e.name}'s ${t} post`);
            } catch (t) {
                console.error("Image generation failed for requested post:", t);
                try {
                    i = await queuedGenerateImage(
                        applyImageStyle(o.imagePrompt),
                        `Requested post image retry for ${e.name}`
                    );
                } catch (e) {
                    console.error("Image retry failed:", e);
                }
            }
        }
        const s = createPost({
            authorId: e.id,
            content: o.content,
            type: t,
            imageUrl: i,
            imagePrompt: o.imagePrompt,
            explicitLevel: o.explicitLevel || 0,
            tags: o.tags || [],
            location: e.locationId || "headquarters",
        });
        gameState.socialNetwork.posts.unshift(s),
            "dashboard" === gameState.activeTab && refreshDashboardSections(),
            gameState.socialNetwork.recentPostTypes || (gameState.socialNetwork.recentPostTypes = []),
            gameState.socialNetwork.recentPostTypes.unshift(t),
            gameState.socialNetwork.recentPostTypes.length > 50 &&
                (gameState.socialNetwork.recentPostTypes = gameState.socialNetwork.recentPostTypes.slice(0, 50)),
            remember(e, `I posted on social media: "${o.content}"`, "action", 2),
            remember(e, "The boss requested I make this post", "interaction", 2);
        const confirms = [
            "Done! Check the feed 😊",
            "Posted! Hope you like it 😏",
            "There you go... posted",
            "Okay, it's up now",
            "Posted as requested 😳",
        ];
        deliverNpcChatEvent(e.id, { content: confirms[Math.floor(Math.random() * confirms.length)] });
        "social" === gameState.activeTab && renderSocialFeed();
    } catch (e) {
        console.error("Error generating requested post:", e);
    }
}
async function regenerateMessage(e) {
    if (!gameState.activeChat) return;
    const t = gameState.activeChat,
        n = gameState.chatHistory[t.id];
    if (!n || e < 1 || e >= n.length) return;
    const a = n[e - 1]?.content;
    if (a) {
        chatTypingIndicator &&
            chatTypingName &&
            ((chatTypingIndicator.style.display = "block"), (chatTypingName.textContent = t.name));
        try {
            const o = n
                    .slice(0, e)
                    .map((e) => `${e.sender}: ${e.content}`)
                    .join("\n"),
                i = [
                    "\n\nIMPORTANT: Use a completely new tone and approach. Include details you didn't mention before. Take this in a fresh direction.",
                    "\n\nIMPORTANT: If you were formal before, be casual now. If you were brief, elaborate more. If you were serious, add personality. Show another side of yourself.",
                    "\n\nIMPORTANT: Focus on aspects you haven't explored yet. Use new examples and emotions. Structure your sentences in a new way.",
                    "\n\nIMPORTANT: Shift your emotional tone. If you were playful before, be thoughtful now. If you were enthusiastic, try subtle. Reveal a new facet of your personality.",
                    "\n\nIMPORTANT: Include information or reactions you haven't shared yet. Use significantly varied word choices. Take this conversation somewhere new.",
                ],
                s = i[Math.floor(Math.random() * i.length)];
            n[e].regenerationCount || (n[e].regenerationCount = 0), n[e].regenerationCount++;
            const { prompt: r } = buildChatPrompt(t, o, a),
                l = r + s,
                c = Math.min(1.2, 0.7 + 0.1 * n[e].regenerationCount),
                d = sanitizeNpcResponse(
                    await queuedGenerateText(
                        l,
                        { temperature: c, top_p: 0.95, frequency_penalty: 0.3 },
                        `Regenerating chat message with variation for ${t.name}`
                    ),
                    5
                );
            chatTypingIndicator && (chatTypingIndicator.style.display = "none"),
                (n[e].content = d),
                (gameState.chatHistory[t.id] = n.slice(0, e + 1)),
                loadChatHistory(t.id),
                (chatMessages.scrollTop = chatMessages.scrollHeight),
                showNotification(`♻️ Response regenerated with new variation (${n[e].regenerationCount}x)`, 2e3);
            // Re-run the request-detection funnel so a regenerated reply to a natural-language
            // image/post/money request still triggers the NPC's image/post (mirrors sendChatMessage).
            // Without this, regenerating an NPC response drops the image the original reply would have sent.
            const prev = n[e - 1];
            if (prev?.isPlayer && prev.content) {
                const emp = gameState.employees.find((x) => x.id === t.id) || t;
                detectPostRequest(emp, prev.content, d),
                    detectImageRequest(emp, prev.content, d),
                    considerMoneyRequest(emp, prev.content, d);
            }
        } catch (e) {
            console.error("Error regenerating message:", e),
                chatTypingIndicator && (chatTypingIndicator.style.display = "none"),
                showNotification("Failed to regenerate message. Please try again.");
        }
    }
}
async function regenerateImage(e, t) {
    if (!gameState.activeChat) return;
    const n = gameState.activeChat,
        a = gameState.chatHistory[n.id];
    if (!a || e < 0 || e >= a.length) return;
    const o = a[e];
    if (o.imageUrl)
        try {
            const e = document.createElement("div");
            (e.textContent = "🎨 Regenerating image..."),
                (e.style.cssText = "text-align:center; padding:10px; opacity:0.7; font-style:italic;"),
                chatMessages && (chatMessages.appendChild(e), (chatMessages.scrollTop = chatMessages.scrollHeight));
            const a = await queuedGenerateImage(applyImageStyle(t), "Regenerating player image");
            e && e.parentElement && e.remove(),
                (o.imageUrl = a),
                loadChatHistory(n.id),
                (chatMessages.scrollTop = chatMessages.scrollHeight);
        } catch (e) {
            console.error("Error regenerating image:", e), showNotification("Failed to regenerate image");
        }
}
// Deterministic image-prompt templates — used as the never-worse-than-before fallback
// when the LLM refinement pass fails or returns empty. Mirrors the original presets.
function deterministicImagePrompt(e, t, n, a, s) {
    if (n && n.trim()) return `${a}, ${n.trim()}`;
    if ("work" === t)
        return `professional workplace selfie, ${a}, ${e.position || "office worker"}, office environment, professional attire, confident expression`;
    if ("lewd" === t)
        return s < 40
            ? `suggestive selfie, ${a}, flirty expression, casual clothing, teasing pose, playful atmosphere`
            : `seductive selfie, ${a}, alluring expression, revealing clothing, intimate pose, bedroom or private setting`;
    if ("nude" === t)
        return s < 60
            ? `artistic nude selfie, ${a}, tasteful pose, soft lighting, partial nudity, intimate setting`
            : `explicit nude selfie, ${a}, seductive pose, full nudity, intimate bedroom setting, aroused expression`;
    if ("explicit" === t) {
        const o = [
            `explicit sexual content, ${a}, masturbating with hand, intense pleasure expression, legs spread, intimate bedroom setting, aroused and exposed`,
            `explicit sexual content, ${a}, using sex toy, dildo or vibrator, eyes closed in ecstasy, intimate bedroom setting, very aroused`,
            `explicit sexual content, ${a}, self-pleasure, fingers inside, intense orgasm expression, intimate bedroom setting, completely exposed`,
            `explicit sexual content, ${a}, degrading body writing, marked with text, submissive expression, intimate setting, fully nude`,
            `explicit sexual content, ${a}, masturbating, very aroused expression, touching self intimately, bedroom setting, explicit pose`,
            `explicit sexual content, ${a}, anal play with toy, intense pleasure face, intimate bedroom setting, very exposed and aroused`,
            `explicit sexual content, ${a}, using multiple toys, overwhelmed with pleasure, intimate bedroom setting, extremely explicit`,
            `explicit sexual content, ${a}, squirting orgasm, intense climax expression, legs spread wide, intimate bedroom setting, very wet`,
        ];
        return o[Math.floor(Math.random() * o.length)];
    }
    return `casual selfie, ${a}, friendly smile, relaxed setting, natural lighting, smartphone photo quality`;
}
// Seed intents for preset photo buttons — fed to the LLM refiner so even presets are
// context-aware and rendered into professional, descriptive image prompts.
const PRESET_IMAGE_SEEDS = {
    casual: "casual selfie, friendly smile, relaxed setting, natural lighting",
    work: "professional workplace selfie, office environment, professional attire, confident expression",
    lewd: "suggestive, flirty selfie, teasing alluring pose",
    nude: "tasteful nude selfie, intimate setting, soft lighting",
    explicit: "explicit sexual selfie, very aroused, intimate bedroom setting",
};
// Shared image-prompt refiner — single source of truth for BOTH 1-on-1 chat and Group
// requests. Turns a custom free-text request OR a preset intent (plus appearance and
// recent conversation/scene context) into a professional, descriptive image prompt via
// one LLM pass, with a deterministic fallback. Callers supply their own recentHistory.
async function buildRefinedImagePrompt({
    employee: e,
    type: t = "custom",
    customRequest: n = null,
    recentHistory: i = "",
    sceneContext = "",
    mode = "1on1",
    includePlayer = !1,
    previousState = "",
} = {}) {
    // Multi-character group photo / scene: when handed an array of NPCs, build a grounded
    // multi-character prompt (every participant described) rather than the single-NPC path.
    if (Array.isArray(e))
        return await buildMultiCharacterImagePrompt({
            employees: e,
            type: t,
            customRequest: n,
            recentHistory: i,
            sceneContext,
            includePlayer,
            previousState,
        });
    const o = getPlayerDescription("image"),
        a = getPhysicalDescriptionForPrompt(e, {
            nude:
                ["nude", "explicit", "lewd"].includes(t) ||
                /\b(nude|naked|undressed|topless|bottomless|stripped|no clothes|clothes off)\b/i.test((n || "") + " " + i),
        }),
        s = ((e.stats?.affection || 0) + (e.stats?.desire || 0)) / 2,
        hasCustom = !!(n && n.trim()),
        request = hasCustom ? n.replace(/\[PLAYER\]/gi, o).trim() : PRESET_IMAGE_SEEDS[t] || PRESET_IMAGE_SEEDS.casual,
        playerWrap = "the player" !== o ? `Player: Player description: ${o}` : "",
        groupFraming =
            "group" === mode
                ? "\nThis is a selfie the character is sending in a GROUP chat with their boss and colleagues; frame it as a believable self-taken photo."
                : "",
        sceneBlock = sceneContext ? `\nSCENE / SETTING: ${sceneContext}` : "",
        histBlock = i
            ? `\n\nRECENT CONVERSATION:\n${i}\n(The image request is related to this conversation. Pay close attention to details like clothing, costumes, location, activities, or specific descriptions mentioned.)`
            : "",
        prevBlock = previousState
            ? `\n\n📌 PREVIOUS IMAGE STATE (continuity): ${previousState}\nMaintain this pose/position, location, and clothing UNLESS the conversation above explicitly indicates a change (e.g. standing up, moving, repositioning, undressing). Do NOT reset to a default standing pose if a different pose was already established.`
            : "",
        requestLabel = hasCustom ? "PLAYER'S IMAGE REQUEST" : "REQUESTED PHOTO",
        _canonR = canonicalRace(e.race || e.physical?.race || "human"),
        speciesBlock =
            "slime" === _canonR
                ? "\n\n🧬 SPECIES (CRITICAL): This character is a SLIME. EVERY feature — face, hair, skin, body — is translucent colored gel. Do NOT give a normal human face, human hair, or opaque human skin; render the hair as gel-formed strands of the same gel, the eyes as large glossy gel, and the face as a smooth simple gel face. The whole figure is one cohesive slime girl made of gel."
                : "cyborg" === _canonR
                  ? "\n\n🧬 SPECIES (CRITICAL): This character is an augmented HUMAN+ cyborg (advanced chrome, Cyberpunk 2077 style). Keep a human face and a human body silhouette, with sleek chrome cybernetics integrated INTO that human body and subtle cyber detailing on the face — NOT a non-descript robot body with a human face pasted on."
                  : "",
        c = `Character: ${e.name}\nAppearance: ${a}${speciesBlock}\n${playerWrap}${groupFraming}${sceneBlock}\n${histBlock}${prevBlock}\n\n${requestLabel}: "${request}"\n\nTASK:\nGenerate a detailed image prompt that EXACTLY matches what the player is asking for. Consider:\n1. What is the player's request asking for? (Be specific about "how you are right now", "exactly as described", etc.)\n2. What was just discussed in the conversation? (Costumes, clothing, activities, locations, poses)\n3. What details were explicitly mentioned? (Use EXACT descriptions from conversation)\n4. Is this explicit/NSFW? (Don't shy away from explicit details if contextually appropriate)\n\nCRITICAL RULES:\n- This is a SOLO photo of ONLY ${e.name} — do NOT include any other person, coworker, or bystander in the scene, even if the recent conversation above mentions someone else by name or discusses other people. Only ${e.name} appears in the image.\n- The character's NAME is only a label — NEVER depict its literal meaning. A name like "Rose", "Lily", "Crystal", "Brandy", or "Amber" must NOT add a flower, gem, drink, or color to the image. Describe ONLY the appearance given above.\n- Do NOT include the character's name in the output prompt. Anchor the SUBJECT using the appearance details above (hair, eyes, body, skin) so the correct person is rendered.\n- Begin the prompt with this character's key physical features so the subject is unmistakable, then ACTION/POSE, then setting, then lighting and camera angle.\n- Convert any conversational phrasing ("show me…", "I want to see…") into concrete VISUAL descriptors. Do NOT echo the request's wording verbatim.\n- If request says "exactly how you are right now" or "as you are" → use conversation context for current state\n- If costume/clothing was just described → include EXACT costume details\n- If location was mentioned → use that location\n- If activity was described → show that activity\n- Include: pose, expression, clothing (or lack thereof), setting, lighting, camera angle\n- Use technical/specific tags for image generation\n- For explicit content: use anatomical descriptions\n\nGenerate ONLY the detailed image prompt - no explanations:`;
    let r = "";
    try {
        (r = await queuedGenerateText(
            c,
            {
                temperature: 0.7,
                max_tokens: 200,
                stopSequences: ["\n\n\n", "Note:", "Example:", "Camera angle:", "Mood:", "---", "IMAGE PROMPT:", "Explanation:"],
            },
            `Refining ${mode} image prompt for ${e.name}`
        )),
            (r = r.replace(/^["']|["']$/g, "").trim()),
            (r = r.split(/\n\s*\n/)[0]),
            (r = r.split(/\(Note:/i)[0].trim()),
            (r = scrubImagePromptMeta(r));
    } catch (err) {
        console.error("[Image Prompt] LLM refinement failed, using fallback:", err), (r = "");
    }
    if (!r) {
        r = deterministicImagePrompt(e, t, hasCustom ? request : null, a, s);
        console.log(`[Image Prompt] 🧱 Fallback (${mode}/${t}) for ${e.name}: ${r}`);
    } else {
        console.log(`[Image Prompt] 🧠 Refined (${mode}/${t}) for ${e.name}\n  intent: ${request}\n  → ${r}`);
    }
    // Consent honored downstream: if the player asked for (and the NPC agreed to) nude/explicit
    // content but the text refiner quietly sanitized it back to a clothed prompt, the NPC would
    // "send a nude" in chat while the image came back tame. Detect that and force the explicit
    // deterministic prompt so the rendered image matches what was consented to.
    if (
        ["nude", "explicit"].includes(t) &&
        r &&
        !/\b(nude|naked|topless|bottomless|bare|breasts?|nipples?|exposed|genital|pussy|vagina|cock|penis|cum|explicit|nsfw)\b/i.test(
            r
        )
    ) {
        console.warn(
            `[Image Prompt] ⚠️ Refiner sanitized a consented ${t} request for ${e.name} — substituting explicit fallback so the image matches consent.`
        );
        r = deterministicImagePrompt(e, t, null, a, s);
    }
    return r;
}
// Multi-character refiner — grounds a GROUP PHOTO / scene in every participant's real
// appearance + the scene + recent conversation, then runs one LLM pass to produce a
// faithful, descriptive prompt that honors the requested activity instead of sanitizing it.
// Deterministic fallback concatenates each participant so output is never empty or ungrounded.
async function buildMultiCharacterImagePrompt({
    employees,
    type = "group-photo",
    customRequest = null,
    recentHistory = "",
    sceneContext = "",
    includePlayer = !1,
    previousState = "",
} = {}) {
    const people = (employees || []).filter(Boolean);
    if (!people.length) return "";
    const playerDesc = getPlayerDescription("image"),
        nude =
            ["nude", "explicit", "lewd"].includes(type) ||
            /\b(nude|naked|undressed|topless|bottomless|stripped|no clothes|clothes off)\b/i.test((customRequest || "") + " " + recentHistory),
        charBlocks = people
            .map((e) => {
                const phys = getPhysicalDescriptionForPrompt(e, { nude }),
                    species = e.race && "human" !== e.race ? e.race : "",
                    rf = e.physical?.raceFeatures?.description || "";
                return `CHARACTER: ${e.name} (${e.role || e.position || "Employee"})\nPhysical: ${phys}\n${species ? `Species: ${species}${rf ? ` - ${rf}` : ""}\n` : ""}Gender: ${e.gender || "female"}`;
            })
            .join("\n\n"),
        playerBlock = includePlayer
            ? `\n\nCHARACTER: The Boss/Player\nGender: ${(gameState.playerProfile || {}).gender || gameState.settings?.playerGender || "unspecified"}\n${gameState.settings?.playerBio || "The boss, a commanding presence in the office"}`
            : "",
        total = people.length + (includePlayer ? 1 : 0),
        intent = customRequest && customRequest.trim() ? customRequest.replace(/\[PLAYER\]/gi, playerDesc).trim() : "",
        scene = sceneContext || "Office/workplace setting",
        histBlock = recentHistory ? `\n\n💬 RECENT CONVERSATION (current actions/mood):\n${recentHistory}` : "",
        prevBlock = previousState
            ? `\n\n📌 PREVIOUS IMAGE STATE (continuity): ${previousState}\nKeep the same poses/positions, location, and clothing UNLESS the conversation explicitly indicates a change (movement, standing up, repositioning, undressing). Do NOT reset everyone to a default standing line-up if other poses were already established.`
            : "",
        rubric = `You are creating ONE image-generation prompt for a GROUP SCENE with MULTIPLE CHARACTERS.\n\n📊 PARTICIPANTS: ${total} total — every one MUST be clearly visible and identifiable.\n\n🎭 CHARACTER DESCRIPTIONS (must be accurate):\n${charBlocks}${playerBlock}\n\n📍 SCENE: ${scene}${histBlock}${prevBlock}\n\n🎬 REQUESTED PHOTO: "${intent || "a natural candid group photo together"}"\n\nTASK:\nWrite ONE detailed image prompt (comma-separated visual tags, 50-200 words) that depicts the REQUESTED PHOTO with all ${total} characters together.\n\nCRITICAL RULES:\n- Lead with the GROUP ACTION/POSE from the request, then the characters, then setting, lighting, camera angle.\n- Convert any conversational phrasing ("I want to see you make out", "show me…") into concrete VISUAL descriptors of what the bodies are actually doing.\n- EVERY character must be visible with their DISTINCTIVE features (hair, body type, race/species features like wings, horns, tails).\n- Natural interaction and positioning — NOT a line-up of people standing side by side unless that is what was asked.\n- Honor the requested activity faithfully; do NOT sanitize, soften, or replace it with generic posing.\n- For explicit or intimate content: use clear anatomical and action descriptions.\n\nGenerate ONLY the image prompt — no labels, headers, markdown, or explanation:`;
    let r = "";
    try {
        (r = await queuedGenerateText(
            rubric,
            { temperature: 0.8, max_tokens: 320, stopSequences: ["\n\n\n", "Note:", "Example:", "---", "IMAGE PROMPT:", "Explanation:"] },
            `Refining group-photo prompt (${total} people)`
        )),
            (r = extractText(r).trim().replace(/^["']|["']$/g, "").replace(/\*\*[^*]*\*\*/g, "").trim()),
            (r = r.split(/\n\s*\n/)[0].split(/\(Note:/i)[0].trim()),
            (r = scrubImagePromptMeta(r));
    } catch (err) {
        console.error("[Image Prompt] Multi-char LLM refinement failed, using fallback:", err), (r = "");
    }
    if (!r) {
        const parts = people.map((e) => `${e.name} (${getPhysicalDescriptionForPrompt(e, { nude })})`);
        r = `group photo of ${total} people${intent ? `, ${intent}` : ""}, ${parts.join("; ")}${includePlayer ? "; with the boss/player" : ""}, ${scene}, natural group composition, everyone clearly visible`;
        console.log(`[Image Prompt] 🧱 Group-photo fallback (${total} people): ${r}`);
    } else {
        console.log(`[Image Prompt] 🧠 Refined group-photo (${total} people) | intent: ${intent || "(none)"}\n  → ${r}`);
    }
    return r;
}
// Strips self-referential / instruction-echo phrasing that LLM refiners sometimes emit
// ("as described above", "same location as previous image", "desired look for ...") — these
// are meaningless to a text-to-image engine (it can't see a previous image) and must never
// reach the engine or be reused as a continuity anchor.
function scrubImagePromptMeta(s) {
    if (!s || "string" != typeof s) return "";
    let t = s;
    t = t.replace(
        /\bsame\s+(location|setting|place|background|scene|pose|position|outfit|clothing)\s+as\s+(the\s+)?(previous|prior|last)\s+image\b/gi,
        "$1 consistent with the scene"
    );
    t = t.replace(/\b(as|like)\s+(in\s+)?(the\s+)?(previous|prior|last)\s+image\b/gi, "");
    t = t.replace(/\b(previous|prior|last)\s+image\b/gi, "");
    t = t.replace(/\bas\s+described\s+above\b/gi, "");
    t = t.replace(/\b(the\s+)?desired\s+look\s+(for|of)\s+[^,.]*/gi, "");
    t = t.replace(/\b(as\s+)?(per|from)\s+the\s+(conversation|request|description)\s+above\b/gi, "");
    return t
        .replace(/\(\s*\)/g, "")
        .replace(/([,;:])\s*([,.;:])/g, "$2")
        .replace(/\s+([,.;:])/g, "$1")
        .replace(/\s{2,}/g, " ")
        .replace(/^[\s,;:.]+|[\s,;:.]+$/g, "")
        .trim();
}
// Pulls the most recent image's prompt from a message list so the next image can keep pose/position
// continuity (B4). Returns "" when there's no prior image to anchor to.
function lastImageStateFromMessages(e) {
    const t = (e || []).filter((m) => m && m.imagePrompt);
    return t.length ? scrubImagePromptMeta(String(t[t.length - 1].imagePrompt).slice(0, 240)) : "";
}
async function buildImagePrompt(e, t, n = null) {
    const i =
        gameState.chatHistory[e.id]
            ?.slice(-10)
            .map((e) => `${e.sender}: ${e.content}`)
            .join("\n") || "";
    return await buildRefinedImagePrompt({
        employee: e,
        type: t,
        customRequest: n,
        recentHistory: i,
        mode: "1on1",
        previousState: lastImageStateFromMessages(gameState.chatHistory[e.id]),
    });
}
async function sendImageToNPC(e) {
    if (!gameState.activeChat || !e.trim()) return;
    const t = gameState.activeChat,
        n = expandImageMentions(e);
    n !== e &&
        (console.log("[Send Image] 🔄 Expanded @mentions in image prompt"),
        console.log("[Send Image] Original:", e),
        console.log("[Send Image] Expanded:", n)),
        chatTypingIndicator &&
            chatTypingName &&
            ((chatTypingIndicator.style.display = "block"), (chatTypingName.textContent = t.name));
    try {
        const a = addChatMessage("You", "🎨 Generating image...", !0),
            o = await queuedGenerateImage(applyImageStyle(n), "Player custom image request");
        a && a.parentElement && a.remove(),
            gameState.chatHistory[t.id] || (gameState.chatHistory[t.id] = []),
            gameState.chatHistory[t.id].push({
                sender: "You",
                content: e,
                isPlayer: !0,
                imageUrl: o,
                imagePrompt: e,
                imageType: "sent",
                timestamp: gameState.time?.currentTime || Date.now(),
            });
        addChatMessage("You", e, !0, o, gameState.chatHistory[t.id].length - 1, e);
        const i = buildConversationHistoryWithImages(t.id),
            s = gameState.settings?.playerBio || "",
            r = s ? `\nPlayer description: ${s}` : "",
            l = `${buildChatPrompt(t, i, "").prompt}${r}\n\nThe player just sent you an image. Based on this description: "${e}", respond naturally to what they sent. Consider:\n- What the image shows (understand the CONTEXT and meaning, not just literal technical tags)\n- Your relationship with the player\n- The context of your conversation\n- Your personality and current mood\n\nRespond as if you actually saw the image. Keep it conversational (3-5 sentences, completing your thought).\n\n${t.name}'s response:`,
            c = sanitizeNpcResponse(await queuedGenerateText(l, {}, `Generating image response for ${t.name}`), 5) || "😊";
        if (
            (chatTypingIndicator && (chatTypingIndicator.style.display = "none"),
            gameState.chatHistory[t.id].push({
                sender: t.name,
                content: c,
                isPlayer: !1,
                timestamp: gameState.time?.currentTime || Date.now(),
            }),
            gameState.activeChat?.id === t.id && chatMessages)
        ) {
            const e = gameState.chatHistory[t.id].length - 1;
            addChatMessage(t.name, c, !1, null, e), (chatMessages.scrollTop = chatMessages.scrollHeight);
        }
        remember(t, `Player sent image: ${e}`, "event", 1.5),
            await updateEmployeeStatsFromChat(t, `[Sent image: ${e}]`, c);
    } catch (e) {
        console.error("Error handling sent image:", e),
            chatTypingIndicator && (chatTypingIndicator.style.display = "none"),
            gameState.activeChat?.id === t.id &&
                chatMessages &&
                addChatMessage(t.name, "Sorry, I couldn't process that image.", !1);
    }
}
async function sendMoneyToNPC(e, t = "", n = null) {
    if (e <= 0) return;
    const a = n || gameState.activeChat?.id;
    if (!a) return;
    const o = gameState.employees.find((e) => e.id === a);
    if (o) {
        o.bankBalance || (o.bankBalance = 0),
            (o.bankBalance += e),
            o.spendingRate || (o.spendingRate = calculateScaledSpendingRate()),
            (gameState.cash = Math.max(0, gameState.cash - e)),
            updateUI(),
            chatTypingIndicator &&
                chatTypingName &&
                ((chatTypingIndicator.style.display = "block"), (chatTypingName.textContent = o.name));
        try {
            const n = t ? `💰 Sent $${formatCash(e)}\n"${t}"` : `💰 Sent $${formatCash(e)}`;
            gameState.chatHistory[o.id] || (gameState.chatHistory[o.id] = []),
                gameState.chatHistory[o.id].push({
                    sender: "You",
                    content: n,
                    isPlayer: !0,
                    isMoney: !0,
                    amount: e,
                    message: t,
                    timestamp: gameState.time?.currentTime || Date.now(),
                }),
                gameState.activeChat?.id === o.id && addChatMessage("You", n, !0);
            const a = (e / 1e5) * 12;
            let i = "gift",
                s = "small";
            e < 100
                ? ((s = "tiny"), (i = "tip"))
                : e < 1e3
                  ? ((s = "small"), (i = "gift"))
                  : e < 1e4
                    ? ((s = "nice"), (i = t ? "gift with meaning" : "generous gift"))
                    : e < 5e4
                      ? ((s = "substantial"), (i = "bonus"))
                      : e < 2e5
                        ? ((s = "major"), (i = "windfall"))
                        : ((s = "life-changing"), (i = "fortune"));
            const r = buildConversationHistoryWithImages(o.id, 10),
                l = getPlayerDescription("conversation", o),
                c = "the boss" !== l ? `\n👤 BOSS INFO: ${l}` : "",
                d = t
                    ? `\n\n💬 YOUR BOSS'S MESSAGE WITH THE MONEY:\n"${t}"\n**IMPORTANT**: Acknowledge this message in your response!`
                    : "",
                p = `${buildChatPrompt(o, r, "").prompt}${c}\n\n💰 SITUATION: Your boss just sent you $${formatCash(e)} (a ${s} ${i})!${d}\n\n📊 CONTEXT FOR YOUR REACTION:\n- Amount: $${formatCash(e)} (equivalent to ${a.toFixed(1)} months of average salary)\n- Your current bank balance: $${formatCash(o.bankBalance)}\n- Your personality: ${formatPersonality(o.personality)}\n- Your relationship: Affection ${o.stats?.affection || 0}, Trust ${o.stats?.trust || 0}, Obedience ${o.stats?.obedience || 0}, Desire ${o.stats?.desire || 0}\n\n💭 HOW TO REACT:\n1. **BE GENUINE**: Show real emotion appropriate to the amount (surprise, gratitude, excitement, suspicion, etc.)\n2. **FRAME POSITIVELY**: Unless you have serious trust issues or the amount is suspicious, treat this as a nice gesture\n3. **AVOID HR COMPLAINTS**: Don't immediately jump to "this feels wrong" unless amount is truly absurd\n4. **ACKNOWLEDGE THE GESTURE**: Recognize why they might be sending money (help, appreciation, flirting, etc.)\n5. **BE IN CHARACTER**: Respond based on YOUR personality and relationship with them\n${t ? "6. **ADDRESS THEIR MESSAGE**: Make sure to respond to what they said!" : ""}\n\n📝 SUGGESTED REACTIONS BY AMOUNT:\n- Tiny ($1-99): Casual thanks, maybe confused why so small\n- Small ($100-999): Sweet gesture, appreciated\n- Nice ($1K-9K): Really grateful, touched by the thoughtfulness  \n- Substantial ($10K-49K): Wow, this is amazing! What's the occasion?\n- Major ($50K-199K): Holy shit, this is incredible! You're changing my life!\n- Life-changing ($200K+): I... I don't know what to say. This is unreal. Are you serious?!\n\n🎭 RESPOND NOW (3-8 sentences, natural conversation):`,
                m = sanitizeNpcResponse(
                    await queuedGenerateText(p, {}, `Generating gift money response for ${o.name}`),
                    10
                );
            chatTypingIndicator && (chatTypingIndicator.style.display = "none");
            deliverNpcChatEvent(o.id, { sender: o.name, content: m });
            // Re-run the request-detection funnel so a natural-language image/post/money
            // request tucked into the money note still triggers the NPC's image/post
            // (mirrors sendChatMessage/regenerateMessage/resendPlayerMessage's identical
            // fix). Skipped when there's no note since there's nothing to detect.
            t &&
                (detectPostRequest(o, t, m),
                detectImageRequest(o, t, m),
                considerMoneyRequest(o, t, m));
            remember(
                o,
                t
                    ? `Received $${formatCash(e)} from boss (${i}) - "${t}"`
                    : `Received $${formatCash(e)} from boss (${i})`,
                "event",
                2
            );
            let u = 0,
                g = 0,
                h = 0;
            e < 1e3
                ? ((u = 2 + Math.floor(e / 200)), (g = 1), (h = 1))
                : e < 1e4
                  ? ((u = 5 + Math.floor(e / 1e3)), (g = 2), (h = 2))
                  : e < 1e5
                    ? ((u = 10 + Math.floor(e / 5e3)), (g = 3), (h = 4))
                    : ((u = 20), (g = 5), (h = 8)),
                (u = Math.min(25, u)),
                (g = Math.min(10, g)),
                (h = Math.min(12, h)),
                o.stats || (o.stats = {}),
                (o.stats.affection = Math.min(100, (o.stats.affection || 0) + u)),
                (o.stats.trust = Math.min(100, (o.stats.trust || 0) + g)),
                (o.stats.desire = Math.min(100, (o.stats.desire || 0) + h)),
                (o.stats.obedience = Math.min(100, (o.stats.obedience || 0) + Math.floor(u / 2)));
            const y = e / 1e4,
                f = 50;
            (o.spendingRate += Math.min(f, y)),
                showNotification(
                    `💰 ${o.name}: +$${formatCash(e)} to bank\n+${u} Affection, +${g} Trust, +${h} Desire`,
                    "success"
                ),
                updateUI(),
                (chatMessages.scrollTop = chatMessages.scrollHeight);
        } catch (e) {
            console.error("Error handling money transfer:", e),
                chatTypingIndicator && (chatTypingIndicator.style.display = "none"),
                gameState.activeChat?.id === o.id &&
                    chatMessages &&
                    (addChatMessage(o.name, "Wow, thank you so much! This is amazing! 💕", !1),
                    (chatMessages.scrollTop = chatMessages.scrollHeight)),
                o.stats || (o.stats = {}),
                (o.stats.affection = Math.min(100, (o.stats.affection || 0) + 5)),
                (o.stats.trust = Math.min(100, (o.stats.trust || 0) + 2)),
                (o.stats.desire = Math.min(100, (o.stats.desire || 0) + 3)),
                updateUI();
        }
    }
}
