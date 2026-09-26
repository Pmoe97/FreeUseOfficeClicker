// ============================================================================
// 46-chat — Chat UI: chat history, addChatMessage, sendChatMessage, npc action bar, counter-offer flow, image/photo requests.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function showCreateFamilyMemberModal(e) {
  const t = document.createElement("div");
  t.id = "createFamilyModal", t.style.cssText = "\n      position: fixed; top: 0; left: 0; right: 0; bottom: 0;\n      background: var(--bn); z-index: 100002;\n      display: flex; align-items: center; justify-content: center;\n      padding: 20px; box-sizing: border-box;\n    ", t.innerHTML = ` <div style="background:linear-gradient(135deg, var(--ad) 0%, var(--w) 100%); border-radius:16px; max-width:500px; width:100%; border:2px solid var(--v); box-shadow:0 20px 60px var(--ab);"> <div style="padding:20px; border-bottom:1px solid var(--o); display:flex; justify-content:space-between; align-items:center;"> <h2 style="margin:0; color:var(--v);">\u{1F468}\u200D\u{1F469}\u200D\u{1F467} Create Family Member</h2> <button id="closeFamilyModal" style="background:none; border:none; color:var(--e); font-size:24px; cursor:pointer;">&times;</button> </div> <div style="padding:20px;"> <p style="color:var(--a); margin-bottom:20px;"> Create a family member for <strong style="color:var(--b);">${e.name}</strong>. They'll inherit ethnicity and some physical features. </p> <div style="margin-bottom:20px;"> <label style="display:block; color:var(--v); font-size:0.9rem; margin-bottom:8px; font-weight:600;">Relationship Type</label> <select id="familyRelationType" style="width:100%; padding:12px; background:var(--i); border:1px solid var(--v); border-radius:8px; color:var(--b); font-size:1rem;"> <optgroup label="Parents"> <option value="mother">Mother</option> <option value="father">Father</option> <option value="stepmother">Stepmother</option> <option value="stepfather">Stepfather</option> </optgroup> <optgroup label="Siblings"> <option value="sister">Sister</option> <option value="brother">Brother</option> <option value="stepsister">Stepsister</option> <option value="stepbrother">Stepbrother</option> </optgroup> <optgroup label="Children (18+)"> <option value="daughter">Daughter</option> <option value="son">Son</option> </optgroup> <optgroup label="Extended Family"> <option value="aunt">Aunt</option> <option value="uncle">Uncle</option> <option value="cousin">Cousin</option> </optgroup> <optgroup label="Partners"> <option value="spouse">Spouse</option> <option value="exSpouse">Ex-Spouse</option> </optgroup> </select> </div> <div id="familyPreview" style="background:var(--f); padding:15px; border-radius:8px; margin-bottom:20px;"> <div style="color:var(--a); font-size:0.85rem; margin-bottom:10px;">Preview:</div> <div id="familyPreviewContent" style="color:var(--b);"> <span style="color:var(--v);">Mother</span> of ${e.name} <div style="color:var(--a); font-size:0.8rem; margin-top:5px;">Will be ${e.age + 25}-${e.age + 35} years old</div> </div> </div> <div style="display:flex; gap:10px;"> <button id="cancelFamilyBtn" style="flex:1; padding:12px; background:var(--ag); border:none; border-radius:8px; color:var(--a); cursor:pointer; font-weight:600;"> Cancel </button> <button id="createFamilyBtn" style="flex:1; padding:12px; background:linear-gradient(135deg, var(--v) 0%, var(--x) 100%); border:none; border-radius:8px; color:var(--q); cursor:pointer; font-weight:600;"> \u2728 Create & Hire </button> </div> </div> </div> `, document.body.appendChild(t);
  const n = t.querySelector("#familyRelationType"), a = t.querySelector("#familyPreviewContent");
  n.onchange = () => {
    const t2 = Jl[n.value];
    if (t2) {
      let n2 = "";
      const o = e.age || 28;
      n2 = "older" === t2.ageDirection ? `Will be ${o + t2.ageAdjust[0]}-${o + t2.ageAdjust[1]} years old` : "younger" === t2.ageDirection ? "Will be 18-34 years old (adult children only)" : `Will be ${Math.max(18, o + t2.ageAdjust[0])}-${o + t2.ageAdjust[1]} years old`, a.innerHTML = ` <span style="color:var(--v);">${t2.label}</span> of ${e.name} <div style="color:var(--a); font-size:0.8rem; margin-top:5px;">${n2}</div> ${t2.genderLock ? `<div style="color:var(--x); font-size:0.8rem;">Gender: ${"male" === t2.genderLock ? "Male" : "Female"}</div>` : ""}
        `;
    }
  }, t.querySelector("#closeFamilyModal").onclick = () => t.remove(), t.querySelector("#cancelFamilyBtn").onclick = () => t.remove(), t.onclick = (e2) => {
    e2.target === t && t.remove();
  }, t.querySelector("#createFamilyBtn").onclick = async () => {
    const a2 = n.value, o = Jl[a2], i = Zl(e, a2);
    if (!i) return void showNotification("\u274C Failed to generate family member", "error");
    t.remove();
    const s = document.getElementById("unifiedProfileModal");
    s && s.remove(), showNotification(`\u{1F916} Generating ${o.label.toLowerCase()} for ${e.name}... This may take a moment.`, "info", 1e4), (async () => {
      try {
        const t2 = `
Source Employee: ${e.name}
Age: ${e.age}
Gender: ${e.gender}
Ethnicity: ${e.ethnicity || "not specified"}
Personality: ${e.personalityTraits?.join(", ") || "various"}
Key Trait: ${e.keyTrait || "unknown"}
Bio: ${e.bio || "A company employee"}`, u2 = i.existingPartnerInfo ? `

IMPORTANT: ${e.name} already has an established ${i.existingPartnerInfo.relationshipType || "relationship"} with this exact person (${i.name})${i.existingPartnerInfo.occupation ? `, who works as a(n) ${i.existingPartnerInfo.occupation}` : ""}${i.existingPartnerInfo.yearsTogether ? `. They have been together ${i.existingPartnerInfo.yearsTogether} year(s)` : ""}${i.existingPartnerInfo.hasKids ? " and have kids together" : ""}${i.existingPartnerInfo.endReason ? ` (the relationship ended due to ${i.existingPartnerInfo.endReason})` : ""}. The bio you write MUST be consistent with this existing history, not a fresh unrelated backstory.` : "", n2 = `Create a detailed character profile for someone who is the ${o.label.toUpperCase()} of this person:
${t2}${u2}

The new family member's basic info:
- Name: ${i.name}
- Age: ${i.age}
- Gender: ${i.gender}
- Race: ${i.race}
- Ethnicity: ${i.ethnicity || "same as source"}

Create a complete profile that makes sense for this family relationship. The ${o.label.toLowerCase()} should have their own distinct personality while sharing some family traits.

Return ONLY a JSON object (no markdown, no explanation) with these fields:
{
  "bio": "<2-3 sentence background mentioning their relationship to ${e.name} and their own life/career path>", "personalityTraits": ["trait1", "trait2", "trait3"], "keyTrait": "<single defining characteristic>", "hobbies": ["hobby1", "hobby2"], "kinks": ["preference1", "preference2", "preference3"], "personality": { "confidence": <10-90>, "outgoing": <10-90>, "flirty": <10-90>, "professional": <10-90>, "humor": <10-90> }, "physical": { "hairColor": "<color>", "hairStyle": "<style>", "hairLength": "<length>", "hairTexture": "<texture>", "eyeColor": "<color>", "eyeShape": "<shape>", "skinTone": "<tone>", "bodyShape": "<body type>", "heightBuild": "<height and build>", "breastSize": "<size description>", "buttSize": "<size description>", "fashion": "<clothing style>", "accessories": "<any accessories or none>", "notableFeatures": "<distinguishing features>" } }`;
        let s2 = null;
        if ("function" == typeof queuedGenerateText) {
          const t3 = await queuedGenerateText(n2, {}, `Family Member - ${o.label} of ${e.name}`);
          try {
            const e2 = t3.match(/\{[\s\S]*\}/);
            e2 && (s2 = JSON.parse(e2[0]));
          } catch (u3) {
            console.warn("Failed to parse AI response for family member, using defaults:", u3);
          }
        }
        s2 ? (i.bio = s2.bio || `${e.name}'s ${o.label.toLowerCase()}, recently joined the company.`, i.personalityTraits = s2.personalityTraits || i.personalityTraits, i.keyTrait = s2.keyTrait || i.keyTrait, i.hobbies = s2.hobbies || i.hobbies, i.kinks = s2.kinks || i.kinks, s2.personality && (i.personality = s2.personality)) : i.bio = `${e.name}'s ${o.label.toLowerCase()}. Recently joined the company to work alongside family.`, i.physical = ni(i.gender, i.race, i.ethnicity), i.inheritedFeatures && (i.inheritedFeatures.eyeColor && i.physical.eyes && (i.physical.eyes.color = i.inheritedFeatures.eyeColor), i.inheritedFeatures.hairColor && i.physical.hair && (i.physical.hair.color = i.inheritedFeatures.hairColor), i.inheritedFeatures.skinTone && i.physical.skin && (i.physical.skin.tone = i.inheritedFeatures.skinTone)), s2?.physical && (s2.physical.hairColor && i.physical.hair && (i.physical.hair.color = s2.physical.hairColor), s2.physical.hairStyle && i.physical.hair && (i.physical.hair.style = s2.physical.hairStyle), s2.physical.hairLength && i.physical.hair && (i.physical.hair.length = s2.physical.hairLength), s2.physical.hairTexture && i.physical.hair && (i.physical.hair.texture = s2.physical.hairTexture), s2.physical.eyeColor && i.physical.eyes && (i.physical.eyes.color = s2.physical.eyeColor), s2.physical.eyeShape && i.physical.eyes && (i.physical.eyes.shape = s2.physical.eyeShape), s2.physical.skinTone && i.physical.skin && (i.physical.skin.tone = s2.physical.skinTone), s2.physical.bodyShape && (i.physical.bodyShape = s2.physical.bodyShape, i.physical.body && (i.physical.body.shape = s2.physical.bodyShape)), s2.physical.heightBuild && (i.physical.heightBuild = s2.physical.heightBuild), s2.physical.breastSize && (i.physical.breastSize = s2.physical.breastSize, i.physical.body && (i.physical.body.chestSize = s2.physical.breastSize)), s2.physical.buttSize && (i.physical.buttSize = s2.physical.buttSize, i.physical.body && (i.physical.body.buttSize = s2.physical.buttSize)), s2.physical.fashion && (i.physical.fashion = s2.physical.fashion), s2.physical.accessories && (i.physical.accessories = s2.physical.accessories), s2.physical.notableFeatures && (i.physical.notableFeatures = s2.physical.notableFeatures));
        const r = i.physical.hair?.length || i.physical.hair?.style || "styled", l = i.physical.hair?.color || "dark", c = i.physical.eyes?.color || "brown", d = i.physical.skin?.tone || "fair", p = i.physical.body?.shape || i.physical.bodyShape || "average", m = i.physical.heightBuild || "average height", G2 = "male" === i.gender ? "man" : "femaleFuta" === i.gender ? "futa" : "woman";
        i.physical.shortDescription = `${m} ${p} ${G2} with ${r} ${l} hair, ${c} eyes, ${d} skin`;
        const g = { ...i, physical: { hairColor: i.physical.hair?.color, hairStyle: i.physical.hair?.style, hairLength: i.physical.hair?.length, hairTexture: i.physical.hair?.texture, eyeColor: i.physical.eyes?.color, eyeShape: i.physical.eyes?.shape, skinTone: i.physical.skin?.tone, bodyShape: i.physical.body?.shape || i.physical.bodyShape, heightBuild: i.physical.heightBuild, breastSize: i.physical.body?.chestSize || i.physical.breastSize, buttSize: i.physical.body?.buttSize || i.physical.buttSize, fashion: i.physical.fashion, accessories: i.physical.accessories, notableFeatures: i.physical.notableFeatures }, pendingFamilyLink: { relatedTo: e.id, relationship: a2 } };
        delete g.inheritedFeatures, delete g.pendingFamilyRelation;
        const h = gameState.products.find((e2) => e2.unlocked && !e2.managerHired), y = h?.id || gameState.products.find((e2) => e2.unlocked)?.id || "coffee";
        showNotification(`\u2728 ${o.label} character generated! Review and confirm to hire.`, "success"), yc(g, y, `${o.label} of ${e.name}`);
      } catch (u2) {
        console.error("Error during AI generation for family member:", u2), showNotification("\u274C Failed to generate family member. Please try again.", "error");
      }
    })();
  };
}
function loadChatHistory(e) {
  chatMessages && (chatMessages.innerHTML = "", (gameState.chatHistory[e] || []).forEach((t, n) => {
    if (t.isMoneyRequest && !t.isPlayer) {
      const a = gameState.employees.find((t2) => t2.id === e);
      a && Cy(a, t.amount || 100, t.reason, n, t.settled);
    } else if ("scene" === t.imageType) {
      const e2 = document.createElement("div");
      e2.style.cssText = "max-width:80%; padding:10px; margin:10px auto; text-align:center; position:relative;";
      const a = document.createElement("div");
      a.style.cssText = "position:relative; display:inline-block; max-width:400px; width:100%;";
      const o = document.createElement("img");
      if (o.src = t.imageUrl, o.style.cssText = "width:100%; border-radius:10px; cursor:pointer; box-shadow:0 2px 10px var(--am); display:block;", o.onclick = () => {
        const e3 = document.createElement("div");
        e3.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bn); z-index:99999; display:flex; justify-content:center; align-items:center; cursor:pointer;", e3.innerHTML = `<img src="${t.imageUrl}" style="max-width:90%; max-height:90%; border-radius:10px;">`, e3.onclick = () => e3.remove(), document.body.appendChild(e3);
      }, a.appendChild(o), t.imagePrompt) {
        const e3 = document.createElement("button");
        e3.innerHTML = "\u{1F504}", e3.style.cssText = "position:absolute; top:5px; right:5px; background:var(--el); border:none; border-radius:50%; width:28px; height:28px; color:var(--b); cursor:pointer; font-size:1rem; opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center;", e3.title = "Regenerate image", a.appendChild(e3), a.addEventListener("mouseenter", () => {
          e3.style.opacity = "1";
        }), a.addEventListener("mouseleave", () => {
          e3.style.opacity = "0";
        }), e3.addEventListener("click", async (e4) => {
          e4.stopPropagation(), await sf(n, t.imagePrompt);
        });
      }
      const i = document.createElement("p");
      i.style.cssText = "margin:8px 0 0 0; color:var(--a); font-size:0.85rem; font-style:italic;", i.textContent = t.content, e2.appendChild(a), e2.appendChild(i), chatMessages.appendChild(e2);
    } else if ("auto-scene" === t.imageType) {
      const a = document.createElement("div");
      a.style.cssText = "max-width:85%; padding:10px; margin:10px auto; text-align:center; background:rgba(233,69,96,0.1); border-radius:12px; border:1px solid rgba(233,69,96,0.3);", a.dataset.messageIndex = n;
      const o = document.createElement("img");
      o.src = t.imageUrl, o.style.cssText = "width:100%; max-width:450px; border-radius:10px; cursor:pointer; box-shadow:0 4px 15px var(--dv);", o.onclick = () => {
        const e2 = document.createElement("div");
        e2.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bn); z-index:99999; display:flex; justify-content:center; align-items:center; cursor:pointer;", e2.innerHTML = `<img src="${t.imageUrl}" style="max-width:90%; max-height:90%; border-radius:10px;">`, e2.onclick = () => e2.remove(), document.body.appendChild(e2);
      };
      const i = document.createElement("p");
      i.style.cssText = "margin:8px 0 0 0; color:var(--v); font-size:0.8rem; font-style:italic;";
      const s = { "first-person": "\u{1F464} First-Person POV", "third-person": "\u{1F3A5} Third-Person View", cinematic: "\u{1F3AC} Cinematic Shot", intimate: "\u{1F495} Intimate Close-Up", voyeur: "\u{1F52D} Voyeur Perspective", dynamic: "\u{1F3B2} Dynamic View" }[t.perspective] || "\u{1F3AC} Auto Scene";
      i.textContent = `${s} \u2022 Auto-Generated${t.regenerationCount ? ` (${t.regenerationCount}x)` : ""}`;
      const r = document.createElement("button");
      r.className = "auto-vis-regen-btn", r.innerHTML = "\u{1F504} Regenerate" + (t.regenerationCount ? ` (${t.regenerationCount}x)` : ""), r.style.cssText = "margin-top:8px; padding:6px 14px; background:rgba(233,69,96,0.3); border:1px solid var(--k); border-radius:6px; color:var(--v); cursor:pointer; font-size:0.8rem; transition:all 0.2s;", r.onmouseenter = () => {
        r.style.background = "rgba(233,69,96,0.5)", r.style.color = "var(--b)";
      }, r.onmouseleave = () => {
        r.style.background = "rgba(233,69,96,0.3)", r.style.color = "var(--v)";
      };
      const l = n, c = a;
      r.onclick = async (t2) => {
        t2.stopPropagation(), await _f(e, l, c);
      }, a.appendChild(o), a.appendChild(i), a.appendChild(r), chatMessages.appendChild(a);
    } else t.giftData ? Sy(t.sender, t.content, t.giftData, t.isPlayer) : addChatMessage(t.sender, t.content, t.isPlayer, t.imageUrl, n, t.imagePrompt, t.timestamp, t.isNarrator, t.isStoryRecap);
  }), chatMessages.scrollTop = chatMessages.scrollHeight);
}
function xy(e) {
  if (!e) return "";
  let t = e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\*\*([^*]+)\*\*/g, (e2, t2) => `<span style="color:var(--b); font-weight:600;">${t2}</span>`);
  return t = t.replace(/\*([^*]+)\*/g, (e2, t2) => `<span style="color:var(--e); font-style:italic; opacity:0.85;">${t2}</span>`), t = t.replace(/→/g, '<span style="color:var(--j);">\u2192</span>'), t;
}
function ky(e = null) {
  const t = e || gameState.time?.currentTime || Date.now(), n = new Date(t), a = n.getHours(), o = n.getMinutes(), i = a >= 12 ? "PM" : "AM";
  let s = "";
  return s = a >= 5 && a < 12 ? "Morning" : a >= 12 && a < 17 ? "Afternoon" : a >= 17 && a < 21 ? "Evening" : "Night", `${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][n.getDay()]} ${s}, ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][n.getMonth()]} ${n.getDate()} \u2022 ${a % 12 || 12}:${o.toString().padStart(2, "0")} ${i}`;
}
function addChatMessage(e, t, n, a = null, o = null, i = null, s = null, r = false, l = false) {
  if (!chatMessages) return;
  const c = gameState.settings.imagePreviewSize || 300, d = a ? `${c + 40}px` : "80%", p = document.createElement("div");
  s && (p.dataset.timestamp = s), p.className = "chat-bubble " + (l ? "chat-bubble--memory" : r ? "chat-bubble--narrator" : n ? "chat-bubble--self" : "chat-bubble--other"), p.style.cssText = l ? "max-width:95%; padding:15px 20px; margin:20px 0; word-wrap:break-word; position:relative; border-radius:12px; align-self:center;" : r ? "max-width:90%; padding:12px 20px; margin:15px 0; word-wrap:break-word; position:relative; border-radius:12px; align-self:center;" : `max-width:${d}; padding:10px 15px; border-radius:18px; margin-bottom:10px; word-wrap:break-word; position:relative; ${n ? "align-self:flex-end;" : "align-self:flex-start;"}`;
  const m = document.createElement("div");
  if (m.style.cssText = "font-size:0.7rem; opacity:0.6; margin-bottom:6px; font-style:italic;", m.textContent = s ? ky(s) : ky(), p.appendChild(m), l) {
    const e2 = document.createElement("div");
    e2.style.cssText = "display:flex; align-items:center; gap:8px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(102,126,234,0.2);", e2.innerHTML = '<span style="font-size:1.2rem;">\u{1F4D6}</span><span style="color:var(--j); font-weight:600; font-size:0.9rem;">Story Memory</span><span style="color:var(--e); font-size:0.75rem; margin-left:auto;">This character remembers...</span>', p.appendChild(e2);
  } else if (r) {
    const e2 = document.createElement("div");
    e2.style.cssText = "display:flex; align-items:center; gap:8px; margin-bottom:8px;", e2.innerHTML = '<span style="font-size:1rem;">\u{1F4DC}</span><span style="color:var(--x); font-weight:600; font-size:0.85rem;">Narrator</span>', p.appendChild(e2);
  }
  if (n && null !== o) {
    const e2 = document.createElement("div");
    e2.style.cssText = "position:absolute; top:5px; right:5px; display:flex; gap:4px; opacity:0.01; transition:opacity 0.2s;", e2.className = "message-action-buttons";
    const t2 = document.createElement("button");
    t2.innerHTML = "\u270F\uFE0F", t2.className = "edit-msg-btn", t2.style.cssText = "background:rgba(255,152,0,0.8); border:none; border-radius:50%; width:24px; height:24px; color:var(--b); cursor:pointer; font-size:0.8rem; display:flex; align-items:center; justify-content:center; padding:0;", t2.setAttribute("data-message-index", o), t2.title = "Edit message", t2.addEventListener("click", (e3) => {
      e3.stopPropagation(), Wy(o);
    });
    const n2 = document.createElement("button");
    n2.innerHTML = "\u{1F504}", n2.className = "resend-msg-btn", n2.style.cssText = "background:rgba(76,175,80,0.8); border:none; border-radius:50%; width:24px; height:24px; color:var(--b); cursor:pointer; font-size:0.8rem; display:flex; align-items:center; justify-content:center; padding:0;", n2.setAttribute("data-message-index", o), n2.title = "Resend message", n2.addEventListener("click", (e3) => {
      e3.stopPropagation(), Ky(o);
    }), e2.appendChild(t2), e2.appendChild(n2), p.appendChild(e2), p.addEventListener("mouseenter", () => {
      e2.style.opacity = "1";
    }), p.addEventListener("mouseleave", () => {
      e2.style.opacity = "0.01";
    });
  }
  if (!n && null !== o) {
    const e2 = document.createElement("button");
    e2.innerHTML = "\u267B\uFE0F", e2.className = "regenerate-btn", e2.style.cssText = "position:absolute; top:5px; right:5px; background:rgba(33,150,243,0.8); border:none; border-radius:50%; width:24px; height:24px; color:var(--b); cursor:pointer; font-size:0.9rem; opacity:0.01; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; padding:0;", e2.setAttribute("data-message-index", o), e2.title = "Regenerate response (click for new variation)", p.appendChild(e2), p.addEventListener("mouseenter", () => {
      e2.style.opacity = "1";
    }), p.addEventListener("mouseleave", () => {
      e2.style.opacity = "0.01";
    }), e2.addEventListener("click", async (e3) => {
      e3.stopPropagation(), await regenerateMessage(o);
    });
  }
  if (a) {
    const e2 = document.createElement("div"), t2 = gameState.settings.imagePreviewSize || 300;
    e2.style.cssText = `position:relative; display:inline-block; width:100%; max-width:${t2}px;`;
    const n2 = document.createElement("img");
    if (n2.src = a, n2.style.cssText = "width:100%; border-radius:10px; margin-bottom:8px; cursor:pointer; display:block;", n2.onclick = () => {
      const e3 = document.createElement("div");
      e3.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bn); z-index:99999; display:flex; justify-content:center; align-items:center; cursor:pointer;", e3.innerHTML = `<img src="${a}" style="max-width:90%; max-height:90%; border-radius:10px;">`, e3.onclick = () => e3.remove(), document.body.appendChild(e3);
    }, e2.appendChild(n2), i && null !== o) {
      const t3 = document.createElement("button");
      t3.innerHTML = "\u{1F504}", t3.style.cssText = "position:absolute; top:5px; right:5px; background:var(--el); border:none; border-radius:50%; width:28px; height:28px; color:var(--b); cursor:pointer; font-size:1rem; opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center;", t3.title = "Regenerate image", e2.appendChild(t3), e2.addEventListener("mouseenter", () => {
        t3.style.opacity = "1";
      }), e2.addEventListener("mouseleave", () => {
        t3.style.opacity = "0";
      }), t3.addEventListener("click", async (e3) => {
        e3.stopPropagation(), await sf(o, i);
      });
    }
    p.appendChild(e2);
  }
  const u2 = document.createElement("p");
  u2.style.margin = "0", u2.style.marginBottom = n ? "0" : "8px";
  const g = xy(t);
  if (u2.innerHTML = g, p.appendChild(u2), !n && null !== o) {
    const e2 = document.createElement("div");
    e2.style.cssText = "display:flex; align-items:center; gap:4px; background:var(--i); border-radius:12px; padding:2px 4px; width:fit-content; margin-top:6px;";
    const t2 = "string" == typeof gameState.activeChat ? gameState.activeChat : gameState.activeChat?.id, n2 = (gameState.chatHistory[t2] || [])[o], a2 = document.createElement("button");
    a2.style.cssText = `background:${"up" === n2?.playerVote ? "rgba(255, 69, 0, 0.2)" : "transparent"}; border:${"up" === n2?.playerVote ? "1px solid var(--ca)" : "1px solid transparent"}; padding:4px 6px; border-radius:6px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;`, a2.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="${"up" === n2?.playerVote ? "var(--ca)" : "var(--a)"}"><path d="M12 4l8 8h-6v8h-4v-8H4z"/></svg>`, a2.addEventListener("mouseenter", () => a2.style.transform = "scale(1.15)"), a2.addEventListener("mouseleave", () => a2.style.transform = "scale(1)"), a2.addEventListener("click", () => Zg(t2, o, "up"));
    const i2 = document.createElement("button");
    i2.style.cssText = `background:${"down" === n2?.playerVote ? "rgba(113, 147, 255, 0.2)" : "transparent"}; border:${"down" === n2?.playerVote ? "1px solid var(--bz)" : "1px solid transparent"}; padding:4px 6px; border-radius:6px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;`, i2.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="${"down" === n2?.playerVote ? "var(--bz)" : "var(--a)"}"><path d="M12 20l-8-8h6V4h4v8h6z"/></svg>`, i2.addEventListener("mouseenter", () => i2.style.transform = "scale(1.15)"), i2.addEventListener("mouseleave", () => i2.style.transform = "scale(1)"), i2.addEventListener("click", () => Zg(t2, o, "down")), e2.appendChild(a2), e2.appendChild(i2), p.appendChild(e2);
  }
  chatMessages.appendChild(p);
}
function Sy(e, t, n, a) {
  if (!chatMessages) return;
  const o = document.createElement("div");
  o.style.cssText = "max-width:80%; padding:12px; border-radius:15px; margin-bottom:10px; " + (a ? "background:var(--h); align-self:flex-end; border:2px solid var(--k);" : "background:var(--f); align-self:flex-start;");
  const i = document.createElement("div");
  i.style.cssText = "font-size:0.7rem; opacity:0.6; margin-bottom:6px; font-style:italic;", i.textContent = ky(), o.appendChild(i);
  const s = document.createElement("div");
  s.style.cssText = "display:flex; align-items:center; gap:8px; margin-bottom:10px;", s.innerHTML = `<span style="font-size:1.5rem;">${n.categoryEmoji || "\u{1F381}"}</span><strong style="color:var(--g);">Gift Given</strong>`, o.appendChild(s);
  const r = document.createElement("div");
  r.style.cssText = "background:var(--am); padding:10px; border-radius:10px; margin-bottom:10px;";
  const l = document.createElement("div");
  l.style.cssText = "font-size:1.1rem; font-weight:600; color:var(--b); margin-bottom:5px;", l.textContent = n.name, r.appendChild(l);
  const c = document.createElement("div");
  if (c.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;", c.innerHTML = ` <span style="color:var(--a); font-size:0.9rem;">${n.categoryEmoji} ${n.categoryName}</span> <span style="color:var(--g); font-weight:600; font-size:1.1rem;">$${xu(n.price)}</span> `, r.appendChild(c), n.description) {
    const e2 = document.createElement("div");
    e2.style.cssText = "color:var(--ao); font-size:0.85rem; line-height:1.4; margin-top:8px; padding-top:8px; border-top:1px solid var(--ba);", e2.textContent = n.description, r.appendChild(e2);
  }
  if (o.appendChild(r), t && "\u{1F381} Gave a gift" !== t) {
    const e2 = document.createElement("div");
    e2.style.cssText = "\n        margin-top: 12px;\n        padding: 10px 12px;\n        background: linear-gradient(135deg, rgba(255,105,180,0.15), rgba(147,112,219,0.15));\n        border-left: 3px solid var(--cl);\n        border-radius: 8px;\n        position: relative;\n      ";
    const n2 = document.createElement("span");
    n2.textContent = "\u{1F48C}", n2.style.cssText = "font-size:1.2rem; margin-right:6px; vertical-align:middle;", e2.appendChild(n2);
    const a2 = document.createElement("span");
    a2.style.cssText = "color:var(--b); font-size:0.95rem; line-height:1.5; font-style:italic;", a2.innerHTML = `"${xy(t)}"`, e2.appendChild(a2), o.appendChild(e2);
  }
  chatMessages.appendChild(o);
}
function $y(e, t, n) {
  e.name.split(" ")[0];
  const a = { rent: ["Hey boss, rent's due and I'm a bit short this month... Could really use some help \u{1F3E0}", "Rent is coming up and I'm not quite there yet. Any chance you could help me out? \u{1F3E2}", "My landlord's not gonna be happy if I'm late again... Could you spot me for rent? \u{1F64F}", "Struggling to make rent this month. Would really appreciate the help! \u{1F3E0}"], bills: ["Bills are piling up and I'm getting stressed... Could you help me out? \u{1F4B3}", "Got hit with some unexpected bills this month. Any way you could help? \u{1F4C4}", "My utilities are overdue and I'm worried they'll cut service... Help? \u{1F4A1}", "Credit card bill is brutal this month. Could really use some assistance \u{1F4B3}"], emergency: ["Boss, I have an emergency situation and really need your help \u{1F6A8}", "Something urgent came up and I need money ASAP. Can you help? \u{1F630}", "I'm in a bit of an emergency here... Could really use your support \u{1F198}", "This is urgent - I really need financial help right now \u{1F6A8}"], car_repair: ["My car broke down and the repair is expensive... Could you help me out? \u{1F697}", "Mechanic quoted me way more than expected for the repair. Any chance you could help? \u{1F527}", "Car's in the shop and I can't afford to get it out. Help? \u{1F699}", "Need to fix my car or I can't get to work... Could you spot me? \u{1F697}\u{1F4A8}"], medical: ["Medical bills are killing me... Could you help cover some of it? \u{1F3E5}", "Had to see the doctor and the bill is brutal. Any way you could help? \u{1F48A}", "Health insurance didn't cover everything... Could really use help with medical costs \u{1F3E5}", "These medical expenses are way more than I expected. Help? \u{1F489}"], help_family: ["My family needs help and I'm trying to support them... Could you spare something? \u{1F468}\u200D\u{1F469}\u200D\u{1F467}", "Family emergency - need to send money home. Can you help me out? \u2764\uFE0F", "My parents need financial help and I want to be there for them... \u{1F64F}", "Trying to help my family through a tough time. Could you contribute? \u{1F46A}"], special_occasion: ["There's a special event coming up and I want to make it memorable... Help? \u{1F389}", "Got something important to celebrate but I'm broke... Could you help? \u{1F38A}", "Want to do something nice for [occasion] but need financial help \u{1F381}", "Special occasion coming up and I'm short on cash... Any chance you could help? \u{1F973}"], treat_myself: ["I've been working so hard lately... Think I could get a little something to treat myself? \u{1F6CD}\uFE0F", "Been feeling stressed and want to do something nice for myself... Help me out? \u{1F486}", "I deserve a little treat after everything, right? Could you help? \u2728", "Want to pamper myself a bit but money's tight... Could you spare some? \u{1F485}", "Thinking of treating myself to something nice... Would you help make that happen? \u{1F381}"] }, o = a[t] || a.bills;
  return o[Math.floor(Math.random() * o.length)];
}
function Cy(e, t, n, a, o = false) {
  if (!chatMessages) return;
  t = "number" != typeof t || isNaN(t) ? 100 : t;
  const i = document.createElement("div");
  i.style.cssText = "max-width:80%; padding:10px 15px; border-radius:18px; margin-bottom:10px; word-wrap:break-word; position:relative; background:var(--f); align-self:flex-start; border:2px solid var(--g);";
  const s = document.createElement("p");
  let r;
  s.style.margin = "0 0 10px 0", r = ["rent", "bills", "emergency", "car_repair", "medical", "help_family", "special_occasion", "treat_myself"].includes(n) ? $y(e, n, t) : n, s.innerHTML = xy(r), i.appendChild(s);
  const l = document.createElement("div");
  if (l.style.cssText = "display:inline-block; background:var(--n); color:var(--q); padding:5px 10px; border-radius:8px; font-weight:600; margin-bottom:10px;", l.textContent = `\u{1F4B0} $${xu(t)}`, i.appendChild(l), !o) {
    const o2 = document.createElement("div");
    o2.style.cssText = "display:flex; gap:8px; margin-top:10px;", o2.id = `money-request-${a}`;
    const s2 = document.createElement("button");
    s2.style.cssText = "flex:1; padding:8px 12px; background:var(--n); border:none; border-radius:6px; color:var(--q); cursor:pointer; font-weight:600; transition:all 0.2s;", s2.textContent = "\u2713 Accept", s2.addEventListener("mouseenter", () => {
      s2.style.background = "#5efcb3";
    }), s2.addEventListener("mouseleave", () => {
      s2.style.background = "var(--n)";
    }), s2.addEventListener("click", async () => {
      await Ey(e, t, n, a, "accept");
    });
    const r2 = document.createElement("button");
    r2.style.cssText = "flex:1; padding:8px 12px; background:var(--bs); border:none; border-radius:6px; color:var(--q); cursor:pointer; font-weight:600; transition:all 0.2s;", r2.textContent = "\u2194\uFE0F Counter", r2.addEventListener("mouseenter", () => {
      r2.style.background = "var(--dn)";
    }), r2.addEventListener("mouseleave", () => {
      r2.style.background = "var(--bs)";
    }), r2.addEventListener("click", () => {
      Iy(e, t, n, a);
    });
    const l2 = document.createElement("button");
    l2.style.cssText = "flex:1; padding:8px 12px; background:var(--l); border:none; border-radius:6px; color:var(--s); cursor:pointer; font-weight:600; transition:all 0.2s;", l2.textContent = "\u2717 Deny", l2.addEventListener("mouseenter", () => {
      l2.style.background = "#ff5570";
    }), l2.addEventListener("mouseleave", () => {
      l2.style.background = "var(--l)";
    }), l2.addEventListener("click", async () => {
      await Ey(e, t, n, a, "deny");
    }), o2.appendChild(s2), o2.appendChild(r2), o2.appendChild(l2), i.appendChild(o2);
  }
  chatMessages.appendChild(i);
}
async function Ey(e, t, n, a, o) {
  const i = document.getElementById(`money-request-${a}`);
  if (i && i.remove(), gameState.chatHistory[e.id] && gameState.chatHistory[e.id][a] && (gameState.chatHistory[e.id][a].settled = true, gameState.chatHistory[e.id][a].settlementAction = o, gameState.chatHistory[e.id][a].settlementTimestamp = gameState.time?.currentTime || Date.now(), saveGame(false)), "accept" === o) {
    if (gameState.cash < t) {
      addChatMessage("You", `[Insufficient funds - need $${xu(t)}]`, true);
      const n2 = sanitizeNpcResponse(await queuedGenerateText(`${e.name} (${wr(e.personality)}) asked you for $${xu(t)} but you don't have enough money. Respond to being told you can't afford it (2-3 sentences, conversational).`, {}, `Generating insufficient funds response for ${e.name}`), 3);
      gameState.chatHistory[e.id].push({ sender: e.name, content: n2, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() });
      const a3 = gameState.chatHistory[e.id].length - 1;
      return void addChatMessage(e.name, n2, false, null, a3);
    }
    gameState.typingStates || (gameState.typingStates = {}), gameState.typingStates[e.id] = true, chatTypingIndicator && chatTypingName && gameState.activeChat?.id === e.id && (chatTypingIndicator.style.display = "block", chatTypingName.textContent = e.name), e.bankBalance || (e.bankBalance = 0), e.bankBalance += t, e.proactiveMessages && (e.proactiveMessages.hasUnrepliedMoneyRequest = false, console.log(`[Money Request] ${e.name}: Request accepted - flag cleared`)), gameState.cash = Math.max(0, gameState.cash - t), updateUI(), addChatMessage("You", `\u2713 Accepted - Sent $${xu(t)}`, true), gameState.chatHistory[e.id].push({ sender: "You", content: `\u2713 Accepted money request - Sent $${xu(t)}`, isPlayer: true, isMoneyRequest: true, accepted: true, amount: t, timestamp: gameState.time?.currentTime || Date.now() }), e.lastPlayerMessageTime = gameState.time?.currentTime || Date.now();
    const a2 = `${buildChatPrompt(e, Xs(e.id, 10), "").prompt}

You just asked the player for $${xu(t)} (reason: "${n}") and they ACCEPTED and sent you the money!

Respond with gratitude and acknowledgment (3-8 sentences). Consider:
- Your personality (${wr(e.personality)})
- Your relationship with them (Affection: ${e.stats?.affection || 0}, Obedience: ${e.obedience}, Desire: ${e.desire}, Trust: ${e.trust})
- What you asked the money for
- How this makes you feel about them

${e.name}'s response:`, o2 = sanitizeNpcResponse(await queuedGenerateText(a2, {}, `Generating money grant response for ${e.name}`), 10);
    if (gameState.typingStates[e.id] = false, chatTypingIndicator && gameState.activeChat?.id === e.id && (chatTypingIndicator.style.display = "none"), gameState.chatHistory[e.id].push({ sender: e.name, content: o2, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() }), gameState.activeChat?.id === e.id && chatMessages) {
      const t2 = gameState.chatHistory[e.id].length - 1;
      addChatMessage(e.name, o2, false, null, t2), chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    e.stats || (e.stats = {}), e.stats.affection = Math.min(100, (e.stats.affection || 0) + 8), e.stats.trust = Math.min(100, (e.stats.trust || 0) + 8), e.stats.obedience = Math.min(100, (e.stats.obedience || 0) + 5), e.stats.desire = Math.min(100, (e.stats.desire || 0) + 3), showNotification(`\u{1F4B0} Gave ${e.name} $${xu(t)}
+8 Affection, +8 Trust, +5 Obedience, +3 Desire`, "success"), remember(e, `Boss accepted my request for $${xu(t)} (${n})`, "event", 2), updateUI();
  } else if ("deny" === o) {
    addChatMessage("You", "\u2717 Denied money request", true), gameState.chatHistory[e.id].push({ sender: "You", content: `\u2717 Denied money request for $${xu(t)}`, isPlayer: true, isMoneyRequest: true, accepted: false, amount: t, timestamp: gameState.time?.currentTime || Date.now() }), e.lastPlayerMessageTime = gameState.time?.currentTime || Date.now(), e.proactiveMessages && (e.proactiveMessages.hasUnrepliedMoneyRequest = false, console.log(`[Money Request] ${e.name}: Request denied - flag cleared`)), gameState.typingStates || (gameState.typingStates = {}), gameState.typingStates[e.id] = true, chatTypingIndicator && chatTypingName && gameState.activeChat?.id === e.id && (chatTypingIndicator.style.display = "block", chatTypingName.textContent = e.name);
    const a2 = `${buildChatPrompt(e, Xs(e.id, 10), "").prompt}

You just asked the player for $${xu(t)} (reason: "${n}") and they DENIED your request.

Respond with disappointment but stay in character (3-6 sentences). Consider:
- Your personality (${wr(e.personality)})
- Your relationship with them (Affection: ${e.stats?.affection || 0}, Obedience: ${e.obedience}, Desire: ${e.desire}, Trust: ${e.trust})
- What you asked the money for
- How this rejection makes you feel

${e.name}'s response:`, o2 = sanitizeNpcResponse(await queuedGenerateText(a2, {}, `Generating money rejection response for ${e.name}`), 8);
    if (gameState.typingStates[e.id] = false, chatTypingIndicator && gameState.activeChat?.id === e.id && (chatTypingIndicator.style.display = "none"), gameState.chatHistory[e.id].push({ sender: e.name, content: o2, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() }), gameState.activeChat?.id === e.id && chatMessages) {
      const t2 = gameState.chatHistory[e.id].length - 1;
      addChatMessage(e.name, o2, false, null, t2), chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    e.stats || (e.stats = {}), e.stats.affection = Math.max(0, (e.stats.affection || 0) - 3), e.stats.trust = Math.max(0, (e.stats.trust || 0) - 3), e.stats.desire = Math.max(0, (e.stats.desire || 0) - 2), showNotification(`${e.name} was denied
-3 Affection, -3 Trust, -2 Desire`, "warning"), remember(e, `Boss denied my request for $${xu(t)} (${n})`, "event", 1.5), updateUI();
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function Iy(e, t, n, a) {
  window.counterOfferContext = { emp: e, requestedAmount: t, reason: n, messageIndex: a }, document.getElementById("counterOriginalAmount").textContent = "$" + xu(t), document.getElementById("counterYourBalance").textContent = "$" + xu(gameState.cash), document.getElementById("counterAmount").value = "", document.getElementById("counterJustification").value = "", document.getElementById("counterOfferModal").style.display = "flex";
}
async function Py() {
  const e = window.counterOfferContext;
  if (!e) return;
  const { emp: t, requestedAmount: n, reason: a, messageIndex: o } = e, i = parseInt(document.getElementById("counterAmount").value) || 0, s = document.getElementById("counterJustification").value.trim();
  if (i <= 0) return void showNotification("\u274C Please enter a valid amount", "error");
  if (i > gameState.cash) return void showNotification("\u274C Insufficient funds!", "error");
  document.getElementById("counterOfferModal").style.display = "none";
  const r = document.getElementById(`money-request-${o}`);
  r && r.remove(), gameState.chatHistory[t.id] && gameState.chatHistory[t.id][o] && (gameState.chatHistory[t.id][o].settled = true, gameState.chatHistory[t.id][o].settlementAction = "counter", gameState.chatHistory[t.id][o].counterAmount = i, gameState.chatHistory[t.id][o].settlementTimestamp = gameState.time?.currentTime || Date.now(), saveGame(false)), chatTypingIndicator && chatTypingName && (chatTypingIndicator.style.display = "block", chatTypingName.textContent = t.name), t.bankBalance || (t.bankBalance = 0), t.bankBalance += i, t.proactiveMessages && (t.proactiveMessages.hasUnrepliedMoneyRequest = false, console.log(`[Money Request] ${t.name}: Counter offer sent - flag cleared`)), gameState.cash = Math.max(0, gameState.cash - i), updateUI();
  const l = s ? `\u{1F4B0} Counter: Sending $${xu(i)} instead
"${s}"` : `\u{1F4B0} Counter: Sending $${xu(i)} instead of requested $${xu(n)}`;
  addChatMessage("You", l, true), gameState.chatHistory[t.id].push({ sender: "You", content: l, isPlayer: true, isCounterOffer: true, requestedAmount: n, counterAmount: i, justification: s, timestamp: gameState.time?.currentTime || Date.now() });
  const c = Xs(t.id, 10), d = i - n, p = Math.round(d / n * 100), m = d > 0, u2 = d < 0, g = 0 === d, h = `${buildChatPrompt(t, c, "").prompt}

You asked the boss for $${xu(n)} (reason: "${a}").
Instead of accepting or denying, they made a COUNTER OFFER: $${xu(i)} (${p > 0 ? "+" : ""}${p}% ${m ? "MORE" : u2 ? "LESS" : "same"}!)
${s ? `
Their justification: "${s}"` : ""}

Respond to this counter offer naturally (3-8 sentences). Consider:
- Your personality (${wr(t.personality)})
- The difference: ${m ? "They're giving you MORE than you asked for!" : u2 ? "They're offering LESS than you need" : "They agreed to the exact amount"}
- Your relationship with them (Affection: ${t.stats?.affection || 0}, Trust: ${t.trust}, Desire: ${t.desire})
- What you asked the money for originally
${s ? "- Their explanation for the amount" : ""}

Possible reactions:
${m ? `- Surprised, grateful, maybe a bit suspicious or excited
- "Wait, you're giving me MORE? Seriously? Thank you so much!"` : ""}
${u2 ? `- Disappointed but understanding, or frustrated depending on your personality
- "I appreciate it but... I really needed the full amount"
- Or: "That helps, thanks. I'll make it work"` : ""}
${g ? `- A bit confused why they didn't just accept, but grateful
- "Okay... so that's the same as I asked? Thanks I guess!"` : ""}

${t.name}'s response:`, y = sanitizeNpcResponse(await queuedGenerateText(h, {}, `Generating custom amount response for ${t.name}`), 10);
  if (chatTypingIndicator && (chatTypingIndicator.style.display = "none"), gameState.chatHistory[t.id].push({ sender: t.name, content: y, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() }), gameState.activeChat?.id === t.id && chatMessages) {
    const e2 = gameState.chatHistory[t.id].length - 1;
    addChatMessage(t.name, y, false, null, e2), chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  let f = 0, b = 0, v = 0;
  if (m) f = 12, b = 10, v = 6;
  else if (g) f = 8, b = 8, v = 3;
  else {
    const e2 = Math.min(5, Math.abs(p) / 20);
    f = Math.max(2, 8 - e2), b = Math.max(2, 8 - e2), v = Math.max(1, 3 - e2 / 2);
  }
  t.stats || (t.stats = {}), t.stats.affection = Math.min(100, (t.stats.affection || 0) + f), t.stats.trust = Math.min(100, (t.stats.trust || 0) + b), t.stats.desire = Math.min(100, (t.stats.desire || 0) + v), t.stats.obedience = Math.min(100, (t.stats.obedience || 0) + Math.floor(f / 2)), showNotification(`\u{1F4B0} Counter sent: $${xu(i)}
+${f} Affection, +${b} Trust, +${v} Desire`, "success"), remember(t, `Boss countered my $${xu(n)} request with $${xu(i)}${s ? ` - "${s}"` : ""}`, "event", 2), updateUI(), chatMessages.scrollTop = chatMessages.scrollHeight;
}
window.updateUnifiedAppearancePreview = function() {
  const e = window.profileEditState?.editedData?.physical;
  let desc = "";
  if (e) {
    const t = [];
    if ((e.heightBuild || e.height && e.build) && t.push(`${e.heightBuild || e.height + ", " + e.build}`), e.hair && (e.hair.color || e.hair.style || e.hair.length)) {
      const n = [];
      e.hair.length && n.push(e.hair.length), e.hair.color && n.push(e.hair.color), e.hair.style && n.push(e.hair.style), e.hair.texture && n.push(e.hair.texture), n.length && t.push(`Hair: ${n.join(", ")}`);
    }
    if (e.eyes?.color && t.push(`${e.eyes.color} eyes`), e.face) {
      const n = [];
      e.face.shape && n.push(/face/i.test(e.face.shape) ? e.face.shape : `${e.face.shape} face`), e.face.lips && n.push(/lip/i.test(e.face.lips) ? e.face.lips : `${e.face.lips} lips`), e.face.nose && n.push(/nose/i.test(e.face.nose) ? e.face.nose : `${e.face.nose} nose`), e.face.cheekbones && n.push(/cheek/i.test(e.face.cheekbones) ? e.face.cheekbones : `${e.face.cheekbones} cheekbones`), e.face.jawline && n.push(/jaw/i.test(e.face.jawline) ? e.face.jawline : `${e.face.jawline} jawline`), n.length && t.push(n.join(", "));
    }
    if ((e.skin?.tone || e.skinTone) && t.push(`${e.skin?.tone || e.skinTone} skin`), e.skin?.texture && t.push(`${e.skin.texture} texture`), (e.body?.shape || e.bodyShape) && t.push(`${e.body?.shape || e.bodyShape} body shape`), e.body) {
      if (e.body.chestSize || e.body.breastSize) {
        const n = e.body.chestSize || e.body.breastSize, a = "chest" === e.body.chestDescriptor ? "chest" : "breasts";
        t.push(`${n} ${a}`);
      }
      e.body.buttSize && t.push(/butt|bottom|rear/i.test(e.body.buttSize) ? e.body.buttSize : `${e.body.buttSize} butt`), e.body.legs && t.push(/leg|thigh/i.test(e.body.legs) ? e.body.legs : `${e.body.legs} legs`);
    }
    const u3 = ("function" == typeof rr ? rr(e) : Array.isArray(e.genitals) ? e.genitals : e.genitals ? [e.genitals] : []).filter((x) => x && (x.type || x.size)).map((x) => [x.type, x.size && x.size + " size", x.characteristics].filter(Boolean).join(", "));
    u3.length && t.push(`Intimate: ${u3.join("; ")}`);
    const G3 = (e.piercings || []).filter((x) => x && (x.location || x.type)).map((x) => `${[x.type, x.location && "on " + x.location].filter(Boolean).join(" ")}${x.description ? " (" + x.description + ")" : ""}`.trim());
    G3.length && t.push(`Piercings: ${G3.join(", ")}`);
    const U3 = (e.tattoos || []).filter((x) => x && (x.location || x.description)).map((x) => `${x.description || "tattoo"}${x.location ? " on " + x.location : ""}${x.style ? " (" + x.style + ")" : ""}`.trim());
    U3.length && t.push(`Tattoos: ${U3.join(", ")}`);
    const J3 = e.distinguishingFeatures && e.distinguishingFeatures.length ? e.distinguishingFeatures.filter(Boolean).join(", ") : e.distinguishingFeature;
    e.fashion && t.push(`Fashion: ${e.fashion}`), e.accessories && t.push(`Accessories: ${e.accessories}`), J3 && t.push(`Distinguishing feature: ${J3}`), desc = t.join(". ") + ".";
  }
  const preview = document.getElementById("appearanceDescPreview");
  preview && (preview.textContent = desc), window.profileEditState.editedData.physical || (window.profileEditState.editedData.physical = {}), window.profileEditState.editedData.physical.fullDescription = desc;
  const u2 = window.profileEditState.editedData.physical, G2 = u2.heightBuild || ((u2.height || "") + (u2.build ? ", " + u2.build : "")).trim(), U2 = [u2.hair && u2.hair.length || u2.hairLength, u2.hair && u2.hair.color || u2.hairColor].filter(Boolean).join(" "), J2 = u2.eyes && u2.eyes.color || u2.eyeColor || "", ee2 = u2.skin && u2.skin.tone || u2.skinTone || "", te2 = [U2 ? U2 + " hair" : "", J2 ? J2 + " eyes" : "", ee2 ? ee2 + " skin" : ""].filter(Boolean).join(", ");
  window.profileEditState.editedData.physical.shortDescription = (G2 + (te2 ? " with " + te2 : "")).trim(), "function" == typeof markProfileChange && markProfileChange();
}, window.profileEditState = { isEditMode: false, hasUnsavedChanges: false, editedData: null };
const Ay = [{ id: "continue", name: "\u25B6\uFE0F Continue", instruction: "Continue the conversation naturally. Add more detail or action to the scene.", autoSend: true, emoji: "\u25B6\uFE0F", enabled: true }, { id: "action", name: "\u{1F3AC} Action", instruction: "{{char}} does NOT speak or say anything. Output ONLY a highly-detailed physical action. Describe what {{char}} does with their body - movement, gestures, positioning, physical interaction with the environment or other characters. Focus purely on showing, not telling.", autoSend: true, emoji: "\u{1F3AC}", enabled: true }, { id: "thoughts", name: "\u{1F4AD} Thoughts", instruction: "Write internal thoughts. What is {{char}} thinking right now? Show inner monologue.", autoSend: true, emoji: "\u{1F4AD}", enabled: false }, { id: "flirt", name: "\u{1F495} Flirt", instruction: "{{char}} flirts or shows romantic/sexual interest. Be playful and suggestive.", autoSend: true, emoji: "\u{1F495}", enabled: false, minDesire: 20 }, { id: "react", name: "\u{1F62E} React", instruction: "Show emotional reaction to the current situation. Express feelings through words and actions.", autoSend: true, emoji: "\u{1F62E}", enabled: false }, { id: "tease", name: "\u{1F60F} Tease", instruction: "{{char}} teases or playfully challenges. Be cheeky and mischievous.", autoSend: true, emoji: "\u{1F60F}", enabled: false, minFlirty: 30 }, { id: "comply", name: "\u2705 Comply", instruction: "{{char}} agrees and complies with what was just said or requested.", autoSend: true, emoji: "\u2705", enabled: false }, { id: "resist", name: "\u26D4 Resist", instruction: "{{char}} pushes back, resists, or expresses reluctance. Stay in character.", autoSend: true, emoji: "\u26D4", enabled: false }, { id: "change_subject", name: "\u{1F504} Topic", instruction: "{{char}} smoothly changes the subject to something else.", autoSend: true, emoji: "\u{1F504}", enabled: false }, { id: "custom", name: "\u270F\uFE0F Custom", instruction: "", autoSend: false, emoji: "\u270F\uFE0F", enabled: false }];
let Ny = false;
const _y = { do: { emoji: "\u{1F3AD}", name: "Direct Command", desc: "NPC performs this action (no player message shown)", syntax: "/do instruction here", example: "/do walks over and sits next to you", category: "special" }, narrator: { emoji: "\u{1F4D6}", name: "Narrator", desc: "Third-person scene narration (1-1 chats)", syntax: "/narrator &lt;instructions&gt;", example: "/narrator <describe the romantic tension>", category: "special", aliases: ["n"] }, c: { emoji: "\u23E9", name: "Quick Continue", desc: "Shortcut for /continue", syntax: "/c", example: "/c", category: "special", aliasOf: "continue" }, continue: { emoji: "\u25B6\uFE0F", name: "Continue", desc: "Continue the conversation or scene naturally", syntax: "/continue or /continue {message}", example: "/continue {That sounds interesting}", category: "action" }, action: { emoji: "\u{1F3AC}", name: "Action", desc: "NPC performs physical action (no dialogue)", syntax: "/action or /action &lt;instructions&gt;", example: "/action <lean in closer>", category: "action" }, thoughts: { emoji: "\u{1F4AD}", name: "Thoughts", desc: "Show NPC's internal monologue and feelings", syntax: "/thoughts or /thoughts {message}", example: "/thoughts {What do you think about that?}", category: "action" }, flirt: { emoji: "\u{1F495}", name: "Flirt", desc: "NPC responds flirtatiously or suggestively", syntax: "/flirt {message}", example: "/flirt {You look nice today}", category: "action" }, react: { emoji: "\u{1F62E}", name: "React", desc: "Show emotional reaction to current situation", syntax: "/react or /react {message}", example: "/react", category: "action" }, tease: { emoji: "\u{1F60F}", name: "Tease", desc: "NPC teases or playfully challenges you", syntax: "/tease {message}", example: "/tease {Think you can beat me?}", category: "action" }, comply: { emoji: "\u2705", name: "Comply", desc: "NPC agrees and goes along with request", syntax: "/comply {message}", example: "/comply {Follow me}", category: "action" }, resist: { emoji: "\u26D4", name: "Resist", desc: "NPC pushes back or shows reluctance", syntax: "/resist {message}", example: "/resist {Come with me}", category: "action" }, change_subject: { emoji: "\u{1F504}", name: "Topic", desc: "NPC smoothly changes the subject", syntax: "/change_subject or /change_subject {message}", example: "/change_subject {Anyway...}", category: "action" }, custom: { emoji: "\u270F\uFE0F", name: "Custom", desc: "Provide your own instruction for NPC", syntax: "/custom {message} &lt;instruction&gt;", example: "/custom {Hi} <respond nervously>", category: "action" }, interact: { emoji: "\u{1F4AC}", name: "Interact", desc: "NPCs interact with each other (not player)", syntax: "/interact or /interact &lt;instructions&gt;", example: "/interact", category: "action", groupOnly: true }, narrate: { emoji: "\u{1F4DC}", name: "Narrate", desc: "Third-person scene description", syntax: "/narrate or /narrate &lt;instructions&gt;", example: "/narrate <describe the tension>", category: "action", groupOnly: true }, tension: { emoji: "\u26A1", name: "Tension", desc: "Increase drama or conflict between characters", syntax: "/tension or /tension &lt;instructions&gt;", example: "/tension", category: "action", groupOnly: true } };
function Ry(e, t = false) {
  const n = e.value, a = document.getElementById("commandHintPopup");
  if (a && a.remove(), !n.startsWith("/") || n.includes("{") || n.includes("<")) return;
  const o = n.slice(1).toLowerCase();
  let i;
  if (t) {
    const e2 = gameState.activeGroup;
    i = e2?.actionButtons || Bm;
  } else {
    const e2 = gameState.activeChat ? gameState.employees.find((e3) => e3.id === gameState.activeChat.id) : null;
    i = e2?.actionButtons || Ay;
  }
  const s = [];
  t ? (s.push({ ..._y.do, id: "do" }), s.push({ ..._y.c, id: "c" })) : (s.push({ ..._y.do, id: "do" }), s.push({ ..._y.narrator, id: "narrator" }), s.push({ ..._y.c, id: "c" })), i.forEach((e2) => {
    const t2 = _y[e2.id] || { emoji: e2.emoji, name: e2.name.replace(e2.emoji + " ", ""), desc: e2.instruction.substring(0, 60) + "...", syntax: `/${e2.id} {Your message}`, example: `/${e2.id} {Hello}`, category: "action" };
    s.push({ id: e2.id, emoji: e2.emoji || t2.emoji, name: t2.name, desc: t2.desc, syntax: t2.syntax, example: t2.example, category: "action", enabled: false !== e2.enabled, instruction: e2.instruction });
  });
  const r = s.filter((e2) => {
    const t2 = e2.id.startsWith(o) || "" === o;
    return e2.aliases ? t2 || e2.aliases.some((e3) => e3.startsWith(o)) : t2;
  }), l = /* @__PURE__ */ new Set(), c = r.filter((e2) => !l.has(e2.id) && (l.add(e2.id), true));
  if (0 === c.length) return;
  const d = document.createElement("div");
  d.id = "commandHintPopup", d.style.cssText = "\n      position: absolute;\n      bottom: 100%;\n      left: 0;\n      right: 0;\n      background: var(--h);\n      border: 1px solid var(--g);\n      border-radius: 8px;\n      padding: 8px;\n      margin-bottom: 5px;\n      max-height: 350px;\n      overflow-y: auto;\n      z-index: 100;\n      box-shadow: 0 -4px 15px var(--am);\n    ";
  const p = document.createElement("div");
  p.style.cssText = "color:var(--e); font-size:0.7rem; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid var(--t);";
  let m = "";
  if ("" === o) m = '<span style="color:var(--e);">Type a command name to see its syntax</span>';
  else if (1 === c.length) {
    const e2 = c[0];
    m = `<code style="color:var(--g);">${e2.syntax || `/${e2.id}`}</code>`;
  } else {
    const e2 = c[0];
    m = `<code style="color:var(--g);">${e2.syntax || `/${e2.id}`}</code> <span style="color:var(--e);">(${c.length} matches)</span>`;
  }
  p.innerHTML = ` <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;"> <span>\u2328\uFE0F Commands - Click to insert or keep typing</span> </div> <div style="font-size:0.65rem; font-family:monospace;"> ${m} </div> `, d.appendChild(p);
  const u2 = c.filter((e2) => "special" === e2.category), g = c.filter((e2) => "action" === e2.category);
  if (u2.length > 0) {
    const t2 = document.createElement("div");
    t2.style.cssText = "color:var(--bm); font-size:0.65rem; font-weight:bold; margin: 6px 0 4px 0; text-transform:uppercase;", t2.textContent = "\u2728 Special Commands", d.appendChild(t2), u2.forEach((t3) => h(t3, d, e, true));
  }
  if (g.length > 0) {
    const t2 = document.createElement("div");
    t2.style.cssText = "color:var(--g); font-size:0.65rem; font-weight:bold; margin: 10px 0 4px 0; text-transform:uppercase;", t2.textContent = "\u{1F3AC} Response Styles", d.appendChild(t2), g.forEach((t3) => h(t3, d, e, false));
  }
  function h(e2, t2, n2, a2) {
    const o2 = document.createElement("div"), i2 = false === e2.enabled;
    o2.style.cssText = `
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
        margin: 2px 0;
        transition: all 0.15s;
        position: relative;
        ${a2 ? "background: rgba(255,165,0,0.08); border-left: 3px solid var(--bm);" : ""}
        ${i2 ? "opacity: 0.5;" : ""}
      `;
    const s2 = document.createElement("div");
    s2.style.cssText = "display:flex; align-items:center; gap:8px;", s2.innerHTML = ` <span style="font-size:1rem; width:24px; text-align:center;">${e2.emoji}</span> <code style="color:${a2 ? "var(--bm)" : "var(--n)"}; font-size:0.85rem; font-weight:bold; min-width:80px;">/${e2.id}</code> <span style="color:var(--a); font-size:0.75rem; flex:1;">${e2.desc}</span> ${i2 ? '<span style="color:var(--e); font-size:0.6rem; background:var(--ag); padding:2px 6px; border-radius:3px;">OFF</span>' : ""}
      `, o2.appendChild(s2);
    const r2 = document.createElement("div");
    r2.className = "command-tooltip-row", r2.style.cssText = "\n        display: none;\n        margin-top: 6px;\n        padding-top: 6px;\n        border-top: 1px solid var(--ba);\n        font-size: 0.7rem;\n      ", r2.innerHTML = ` <div style="color:var(--e); margin-bottom:3px;"> <span style="color:var(--e);">Syntax:</span> <code style="color:var(--gh);">${e2.syntax || `/${e2.id} {message}`}</code> </div> <div style="color:var(--e);"> <span style="color:var(--e);">Example:</span> <code style="color:var(--fv);">${e2.example || `/${e2.id} {Hello}`}</code> </div> ${e2.aliases ? `<div style="color:var(--e); margin-top:3px;"><span style="color:var(--e);">Aliases:</span> <code style="color:var(--gd);">/${e2.aliases.join(", /")}</code></div>` : ""}
      `, o2.appendChild(r2), o2.addEventListener("mouseenter", () => {
      o2.style.background = a2 ? "rgba(255,165,0,0.15)" : "rgba(78,204,163,0.12)", r2.style.display = "block";
    }), o2.addEventListener("mouseleave", () => {
      o2.style.background = a2 ? "rgba(255,165,0,0.08)" : "transparent", r2.style.display = "none";
    }), o2.addEventListener("click", () => {
      Dy(e2, n2), d.remove();
    }), t2.appendChild(o2);
  }
  const y = e.parentElement;
  y && (y.style.position = "relative", y.appendChild(d));
  const f = (t2) => {
    d.contains(t2.target) || t2.target === e || (d.remove(), document.removeEventListener("click", f));
  };
  setTimeout(() => document.addEventListener("click", f), 10);
}
function Dy(e, t) {
  if ("do" === e.id) t.value = "/do ", t.focus();
  else if ("narrator" === e.id || "n" === e.id) {
    t.value = "/narrator <instructions>", t.focus();
    const e2 = t.value.indexOf("<") + 1, n = t.value.indexOf(">");
    t.setSelectionRange(e2, n);
  } else if ("c" === e.id) t.value = "/c", t.focus();
  else if ("continue" === e.id) {
    t.value = "/continue {Optional}", t.focus();
    const e2 = t.value.indexOf("{") + 1, n = t.value.indexOf("}");
    t.setSelectionRange(e2, n);
  } else if ("custom" === e.id) {
    t.value = "/custom {Your message} <your instruction>", t.focus();
    const e2 = t.value.indexOf("{") + 1, n = t.value.indexOf("}");
    t.setSelectionRange(e2, n);
  } else {
    t.value = `/${e.id} {Your message}`, t.focus();
    const n = t.value.indexOf("{") + 1, a = t.value.indexOf("}");
    t.setSelectionRange(n, a);
  }
}
function toggleNpcActionBar() {
  Ny = !Ny;
  const e = document.getElementById("npcActionButtonsContainer"), t = document.getElementById("npcActionToggleIcon");
  e && (Ny ? (e.style.maxHeight = "0", e.style.padding = "0 15px", e.style.opacity = "0", e.style.overflow = "hidden") : (e.style.maxHeight = "200px", e.style.padding = "4px 15px 10px 15px", e.style.opacity = "1", e.style.overflow = "auto")), t && (t.style.transform = Ny ? "rotate(-90deg)" : "rotate(0deg)"), gameState.settings && (gameState.settings.npcActionBarCollapsed = Ny);
}
function Oy(e) {
  const t = document.getElementById("npcActionButtonsContainer");
  if (!t) return;
  if (t.innerHTML = "", gameState.settings?.npcActionBarCollapsed) {
    Ny = true, t.style.maxHeight = "0", t.style.padding = "0 15px", t.style.opacity = "0", t.style.overflow = "hidden";
    const e2 = document.getElementById("npcActionToggleIcon");
    e2 && (e2.style.transform = "rotate(-90deg)");
  }
  const n = Fy(e), a = document.createElement("div");
  a.style.cssText = "\n      display:flex;\n      gap:6px;\n      flex-wrap:wrap;\n      align-items:center;\n      width:100%;\n    ", n.forEach((t2) => {
    const n2 = document.createElement("button");
    n2.className = "npc-action-btn", n2.dataset.actionId = t2.id, n2.style.cssText = `
        padding:6px 10px;
        background:${"custom" === t2.id ? "var(--af)" : "var(--t)"};
        border:1px solid ${"custom" === t2.id ? "var(--er)" : "var(--n)"};
        border-radius:16px;
        color:var(--b);
        cursor:pointer;
        font-size:0.75rem;
        font-weight:500;
        transition:all 0.2s;
        display:inline-flex;
        align-items:center;
        gap:3px;
        white-space:nowrap;
        flex-shrink:0;
        min-height:28px;
        touch-action:manipulation;
      `, n2.innerHTML = `${t2.emoji} <span class="action-btn-text">${t2.name.replace(t2.emoji + " ", "")}</span>`, n2.title = t2.instruction || "Custom action", n2.addEventListener("mouseenter", () => {
      n2.style.background = "custom" === t2.id ? "var(--as)" : "var(--n)", n2.style.color = "custom" === t2.id ? "white" : "var(--ae)";
    }), n2.addEventListener("mouseleave", () => {
      n2.style.background = "custom" === t2.id ? "var(--af)" : "var(--t)", n2.style.color = "var(--b)";
    }), n2.addEventListener("click", (n3) => {
      n3.stopPropagation(), jy(e, t2);
    }), a.appendChild(n2);
  });
  const o = document.createElement("button");
  o.style.cssText = "\n      padding:6px 10px;\n      background:transparent;\n      border:1px dashed var(--af);\n      border-radius:16px;\n      color:var(--q);\n      cursor:pointer;\n      font-size:0.7rem;\n      min-height:28px;\n      touch-action:manipulation;\n    ", o.textContent = "\u2699\uFE0F", o.title = "Configure action buttons", o.addEventListener("click", (t2) => {
    t2.stopPropagation(), Yy(e);
  }), a.appendChild(o), t.appendChild(a);
}
function Fy(e) {
  return (e.actionButtons || Ay).filter((t) => false !== t.enabled && (!(void 0 !== t.minDesire && (e.stats?.desire || 0) < t.minDesire) && (!(void 0 !== t.minFlirty && (e.personality?.flirty || 0) < t.minFlirty) && !(void 0 !== t.minAffection && (e.stats?.affection || 0) < t.minAffection))));
}
async function jy(e, t) {
  const n = document.getElementById("chatInput");
  if (!n) return;
  const a = t.id, o = n.value.trim();
  if (!o || o.startsWith("/")) {
    n.value = `/${a} {Optional}`, n.focus();
    const e2 = n.value.indexOf("{") + 1, t2 = n.value.indexOf("}");
    return void n.setSelectionRange(e2, t2);
  }
  n.value = `/${a} {${o}}`, n.focus(), n.setSelectionRange(n.value.length, n.value.length);
}
async function qy(e, t) {
  const n = e.id, a = e.name, o = $("chatTypingIndicator"), i = $("chatTypingName");
  o && i && (o.style.display = "block", i.textContent = a), gameState.typingStates || (gameState.typingStates = {}), gameState.typingStates[n] = true;
  try {
    const i2 = Xs(n, 10);
    ensureEmployeeMemory(e);
    const s = zy(e, i2, t), r = sanitizeNpcResponse(await queuedGenerateText(s, {}, `NPC Action for ${a}`), 10), l = gameState.time?.currentTime || Date.now();
    if (gameState.chatHistory[n].push({ sender: a, content: r, isPlayer: false, timestamp: l, isActionTriggered: true }), saveGame(false), gameState.typingStates[n] = false, o && (o.style.display = "none"), gameState.activeChat?.id === n) {
      const e2 = document.getElementById("chatMessages");
      e2 && (addChatMessage(a, r, false, null, gameState.chatHistory[n].length - 1, null, l), e2.scrollTop = e2.scrollHeight);
    } else e.unreadMessages || (e.unreadMessages = 0), e.unreadMessages++;
    await updateEmployeeStatsFromChat(e, "", r), Ia(e, r);
  } catch (e2) {
    console.error("Error triggering NPC action:", e2), gameState.typingStates[n] = false, o && (o.style.display = "none"), showNotification("Failed to generate action. Please try again.", "error");
  }
}
function zy(e, t, n) {
  const { prompt: a } = buildChatPrompt(e, t, "");
  return `${a}

[SYSTEM INSTRUCTION - UNPROMPTED ACTION]
The player has triggered an action button. You should now respond with the following:
${n.replace(/\{\{char\}\}/gi, e.name)}

This is NOT a message from the player. You are performing this action/thought unprompted.
Write ONLY as ${e.name}. Do not write for the player.
Keep the response natural and in-character.`;
}
async function Gy(e, t) {
  const n = e.id, a = $("chatTypingIndicator"), o = $("chatTypingName");
  a && o && (a.style.display = "block", o.innerHTML = '<span style="color:var(--x);">\u{1F4DC} Narrator</span>');
  try {
    Xs(n, 10);
    let o2 = "";
    e.chatSettings?.scenarioContext && (o2 += `[Current Scenario/Scene]
${e.chatSettings.scenarioContext}

`), o2 += "[Characters Present]\n", o2 += `- ${e.name} (${e.role || e.position || "Employee"})`, e.physicalDescription ? o2 += `: ${e.physicalDescription}` : e.appearance && (o2 += `: ${"string" == typeof e.appearance ? e.appearance : "N/A"}`), e.personality && (o2 += `. Personality: ${wr(e.personality)}`), o2 += "\n", o2 += "- The Boss (player character): The authority figure in this conversation\n\n";
    const i = e.chatCommMode || "auto";
    "in-person" === i ? o2 += "[Setting]: This is an in-person conversation.\n\n" : "remote" === i && (o2 += "[Setting]: This conversation is happening remotely (text/messaging).\n\n");
    const s = (gameState.chatHistory[n] || []).slice(-10);
    s.length > 0 && (o2 += "[Recent Conversation]\n", s.forEach((e2) => {
      if (e2.isNarrator) o2 += `[Previous narration]: ${e2.content.substring(0, 100)}...
`;
      else {
        const t2 = e2.isPlayer ? "The Boss" : e2.sender;
        o2 += `${t2}: ${e2.content}
`;
      }
    }));
    const r = `You are a third-person narrator describing events in an interactive story.

${o2}

Your role:
- Describe the scene, atmosphere, and subtle details the characters might not notice
- Narrate physical actions, body language, and unspoken tension
- Add sensory details (sights, sounds, atmosphere)
- DO NOT speak for any character - only describe what is observable
- Write in third person, past tense, like a novel
- Keep narration atmospheric and engaging (2-4 sentences typically)
- Focus on recent events and the current moment
- You may hint at emotions through physical cues but don't state what characters are thinking

[ADDITIONAL INSTRUCTION: ${t}]

Write a brief narration describing the current moment in this private conversation:`, l = sanitizeNpcResponse(await queuedGenerateText(r, {}, `Narrator for ${e.name} chat`), 8), c = gameState.time?.currentTime || Date.now();
    if (gameState.chatHistory[n] || (gameState.chatHistory[n] = []), gameState.chatHistory[n].push({ sender: "Narrator", content: l, isPlayer: false, isNarrator: true, timestamp: c }), saveGame(false), a && (a.style.display = "none"), gameState.activeChat?.id === n) {
      const e2 = document.getElementById("chatMessages");
      e2 && (addChatMessage("Narrator", l, false, null, gameState.chatHistory[n].length - 1, null, c, true), e2.scrollTop = e2.scrollHeight);
    }
  } catch (e2) {
    console.error("Error generating narrator response:", e2), a && (a.style.display = "none"), showNotification("Failed to generate narration. Please try again.", "error");
  }
}
async function Hy(e, t) {
  const n = e.id, a = e.name, o = $("chatTypingIndicator"), i = $("chatTypingName");
  o && i && (o.style.display = "block", i.textContent = a), gameState.typingStates || (gameState.typingStates = {}), gameState.typingStates[n] = true;
  try {
    const i2 = Xs(n, 10);
    ensureEmployeeMemory(e);
    const { prompt: s } = buildChatPrompt(e, i2, ""), r = t.instruction.replace(/\{\{char\}\}/gi, e.name), l = getPhysicalDescriptionForPrompt(e), c = `${s}

[RESPONSE STYLE MODIFIER - UNPROMPTED]
The player has requested you perform an action/response in a specific style without saying anything to you.
Your response MUST follow this instruction:
${r}

CHARACTER REMINDER: You are ${a}${e.race && "human" !== e.race ? ` (${e.race})` : ""}. ${l}. Your personality: ${e.personality || "professional"}.
Stay in character - your physical actions, mannerisms, and voice should reflect who you are.

This is an unprompted action - continue naturally from where the conversation left off.
Write ONLY as ${a}. Do not write for the player.
Keep the response natural and in-character.`, d = sanitizeNpcResponse(await queuedGenerateText(c, {}, `NPC Action (${t.type}) for ${a}`), 10), p = gameState.time?.currentTime || Date.now();
    if (gameState.chatHistory[n] || (gameState.chatHistory[n] = []), gameState.chatHistory[n].push({ sender: a, content: d, isPlayer: false, timestamp: p, isActionTriggered: true, actionType: t.type }), saveGame(false), gameState.typingStates[n] = false, o && (o.style.display = "none"), gameState.activeChat?.id === n) {
      const e2 = document.getElementById("chatMessages");
      e2 && (addChatMessage(a, d, false, null, gameState.chatHistory[n].length - 1, null, p), e2.scrollTop = e2.scrollHeight);
    } else e.unreadMessages || (e.unreadMessages = 0), e.unreadMessages++;
    await updateEmployeeStatsFromChat(e, "", d), Ia(e, d);
  } catch (e2) {
    console.error("Error triggering NPC action with modifier:", e2), gameState.typingStates[n] = false, o && (o.style.display = "none"), showNotification("Failed to generate action. Please try again.", "error");
  }
}
function Uy(e) {
  const t = document.createElement("div");
  t.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--ax); z-index:999999; display:flex; justify-content:center; align-items:center;", t.innerHTML = ` <div style="background:var(--h); padding:25px; border-radius:12px; max-width:500px; width:90%;"> <h3 style="margin:0 0 15px 0; color:var(--g);">\u270F\uFE0F Custom Action for ${e.name}</h3> <p style="color:var(--a); margin:0 0 15px 0; font-size:0.9rem;"> Describe what ${e.name} should do or say. This won't show as a player message. </p> <textarea id="customActionInput" placeholder="e.g., 'Lean in closer and whisper something suggestive' or 'Express worry about the upcoming deadline'" 
          style="width:100%; min-height:100px; padding:12px; background:var(--f); border:1px solid var(--g); border-radius:8px; color:var(--b); font-size:0.95rem; resize:vertical; font-family:inherit;"></textarea> <div style="display:flex; gap:10px; margin-top:15px; justify-content:flex-end;"> <button id="cancelCustomAction" style="padding:10px 20px; background:var(--af); border:none; border-radius:6px; color:var(--b); cursor:pointer;">Cancel</button> <button id="triggerCustomAction" style="padding:10px 20px; background:linear-gradient(135deg, var(--n) 0%, var(--u) 100%); border:none; border-radius:6px; color:var(--q); cursor:pointer; font-weight:600;"> \u2728 Trigger Action </button> </div> </div> `, document.body.appendChild(t);
  const n = t.querySelector("#customActionInput");
  n.focus(), t.querySelector("#cancelCustomAction").addEventListener("click", () => {
    t.remove();
  }), t.addEventListener("click", (e2) => {
    e2.target === t && t.remove();
  }), t.querySelector("#triggerCustomAction").addEventListener("click", async () => {
    const a = n.value.trim();
    a ? (t.remove(), await qy(e, a)) : showNotification("Please enter an action instruction", "error");
  }), n.addEventListener("keydown", async (a) => {
    if ("Enter" === a.key && !a.shiftKey) {
      a.preventDefault();
      const o = n.value.trim();
      o && (t.remove(), await qy(e, o));
    }
  });
}
function Yy(e) {
  const t = document.createElement("div");
  t.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--ax); z-index:999999; display:flex; justify-content:center; align-items:center; overflow-y:auto;";
  const n = (e.actionButtons || Ay).map((e2) => ({ ...e2 })), a = (e2) => e2.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) || "cmd", o = (t2, n2) => {
    const o2 = t2.id.startsWith("custom_") || !Ay.some((e2) => e2.id === t2.id), i2 = a(t2.name.replace(t2.emoji + " ", ""));
    return ` <div class="action-btn-config" data-index="${n2}" data-original-id="${t2.id}" style="background:var(--f); padding:12px; border-radius:8px; border-left:3px solid ${false !== t2.enabled ? "var(--n)" : "var(--af)"};"> <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;"> <input type="checkbox" ${false !== t2.enabled ? "checked" : ""} data-field="enabled" style="width:18px; height:18px; cursor:pointer; flex-shrink:0;"> <input type="text" value="${t2.emoji}" data-field="emoji" maxlength="2" 
              style="width:36px; padding:4px; background:var(--h); border:1px solid var(--r); border-radius:4px; color:var(--b); text-align:center; font-size:1.1rem; flex-shrink:0;">
            <code class="command-display" style="color:var(--g); font-size:0.8rem; background:var(--h); padding:2px 6px; border-radius:3px; white-space:nowrap;">/${i2}</code> <input type="text" value="${t2.name.replace(t2.emoji + " ", "").replace(/"/g, "&quot;")}" data-field="name" placeholder="Button name..." style="flex:1; padding:4px 8px; background:var(--h); border:1px solid var(--r); border-radius:4px; color:var(--b); font-weight:600; font-size:0.85rem; min-width:80px;"> <button class="delete-action-btn" data-index="${n2}" style="padding:4px 8px; background:${o2 ? "var(--l)" : "var(--ag)"}; border:none; border-radius:4px; color:${o2 ? "white" : "var(--as)"}; cursor:${o2 ? "pointer" : "not-allowed"}; font-size:0.8rem; flex-shrink:0;" ${o2 ? "" : 'disabled title="Cannot delete default actions"'}>\u{1F5D1}\uFE0F</button> </div> <div class="validation-warning" style="display:none; color:var(--au); font-size:0.75rem; margin:4px 0 8px 28px; padding:4px 8px; background:rgba(255,107,107,0.1); border-radius:4px;"> \u26A0\uFE0F Name cannot be empty </div> <div style="margin-left:28px;"> <div style="color:var(--e); font-size:0.7rem; margin-bottom:4px;">AI INSTRUCTION (what ${e.name} will do):</div> <textarea data-field="instruction" placeholder="Describe how the NPC should respond..." style="width:100%; padding:6px 8px; background:var(--h); border:1px solid var(--r); border-radius:4px; color:var(--ao); font-size:0.8rem; resize:vertical; min-height:40px; font-family:inherit;">${(t2.instruction || "").replace(/"/g, "&quot;")}</textarea> <div class="instruction-warning" style="display:none; color:var(--au); font-size:0.75rem; margin-top:4px;"> \u26A0\uFE0F Instruction cannot be empty </div> </div> </div> `;
  };
  t.innerHTML = ` <div style="background:var(--h); padding:25px; border-radius:12px; max-width:650px; width:90%; max-height:90vh; overflow-y:auto; margin:20px;"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;"> <h3 style="margin:0; color:var(--g);">\u2699\uFE0F Response Style Buttons</h3> <button id="closeActionConfig" style="background:transparent; border:none; color:var(--b); font-size:1.5rem; cursor:pointer;">\u2715</button> </div> <!-- How It Works Section --> <div style="background:linear-gradient(135deg, rgba(78,204,163,0.15) 0%, rgba(0,212,255,0.1) 100%); border:1px solid rgba(78,204,163,0.3); border-radius:10px; padding:15px; margin-bottom:20px;"> <h4 style="margin:0 0 10px 0; color:var(--g); font-size:0.95rem;">\u{1F4A1} How Response Styles Work</h4> <p style="color:var(--ao); margin:0 0 12px 0; font-size:0.85rem; line-height:1.5;"> These buttons let you <strong>control HOW ${e.name} responds</strong> to you. The command (e.g., <code style="color:var(--g);">/action</code>) is auto-generated from the button name. </p> <div style="background:var(--am); border-radius:6px; padding:10px; margin-bottom:10px;"> <div style="color:var(--m); font-size:0.8rem; margin-bottom:5px;">\u{1F4DD} Example Usage:</div> <code style="color:var(--g); font-size:0.85rem; display:block; margin-bottom:6px;">/action {I step closer and tilt your chin up}</code> <span style="color:var(--e); font-size:0.75rem;">\u2192 Your message appears, then ${e.name} responds with <em>only physical actions</em></span> </div> <div style="display:flex; gap:15px; flex-wrap:wrap; font-size:0.8rem; color:var(--a); margin-bottom:12px;"> <div><strong style="color:var(--g);">With message:</strong> You say something, they respond in that style</div> <div><strong style="color:var(--g);">Without message:</strong> They do an unprompted action in that style</div> </div> <!-- /do Command Explanation --> <div style="background:rgba(255,165,0,0.1); border:1px solid rgba(255,165,0,0.3); border-radius:6px; padding:10px; margin-bottom:10px;"> <div style="color:var(--bm); font-size:0.8rem; font-weight:600; margin-bottom:6px;">\u{1F3AD} Special Command: <code style="background:var(--h); padding:2px 6px; border-radius:3px;">/do</code></div> <p style="color:var(--ao); font-size:0.8rem; margin:0 0 6px 0;"> Unlike response styles, <code style="color:var(--bm);">/do</code> is a <strong>direct command</strong> \u2014 it tells the NPC exactly what to do without showing your message. </p> <code style="color:var(--bm); font-size:0.8rem; display:block; margin-bottom:4px;">/do lean in and whisper something flirty</code> <span style="color:var(--e); font-size:0.75rem;">\u2192 No player message shown. ${e.name} just does it.</span> </div> <!-- /narrator Command Explanation --> <div style="background:rgba(199,125,255,0.1); border:1px solid rgba(199,125,255,0.3); border-radius:6px; padding:10px;"> <div style="color:var(--x); font-size:0.8rem; font-weight:600; margin-bottom:6px;">\u{1F4DC} Special Command: <code style="background:var(--h); padding:2px 6px; border-radius:3px;">/narrator</code></div> <p style="color:var(--ao); font-size:0.8rem; margin:0 0 6px 0;"> Adds third-person narration to describe the scene. Use <code style="color:var(--x);">/n</code> as a shortcut. </p> <code style="color:var(--x); font-size:0.8rem; display:block; margin-bottom:4px;">/narrator &lt;Focus on the romantic tension&gt;</code> <span style="color:var(--e); font-size:0.75rem;">\u2192 Narrator describes the scene with your guidance.</span> </div> </div> <!-- Quick Reference - will update dynamically --> <div id="quickCommandRef" style="background:var(--f); border-radius:8px; padding:12px; margin-bottom:20px;"> <div style="color:var(--e); font-size:0.75rem; margin-bottom:8px;">\u2328\uFE0F QUICK COMMAND REFERENCE (updates as you type)</div> <div id="commandRefList" style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;"> <span style="background:rgba(255,165,0,0.2); border:1px solid rgba(255,165,0,0.4); padding:3px 8px; border-radius:4px; font-family:monospace; font-size:0.75rem; color:var(--bm);" title="Direct command - NPC does exactly this">/do</span> <span style="background:rgba(199,125,255,0.2); border:1px solid rgba(199,125,255,0.4); padding:3px 8px; border-radius:4px; font-family:monospace; font-size:0.75rem; color:var(--x);" title="Add narrator description">/narrator</span> </div> </div> <h4 style="margin:0 0 15px 0; color:var(--b); font-size:0.9rem;">\u{1F4CB} Available Response Styles <span style="color:var(--e); font-size:0.75rem;">(command auto-updates from name)</span></h4> <div id="actionButtonsList" style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px;"> ${n.map((e2, t2) => o(e2, t2)).join("")} </div> <!-- Add Custom Section --> <div style="background:linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.05) 100%); border:1px solid rgba(255,215,0,0.3); padding:15px; border-radius:8px; margin-bottom:20px;"> <h4 style="margin:0 0 12px 0; color:var(--m); font-size:0.9rem;">\u2795 Create Custom Response Style</h4> <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:8px; align-items:center;"> <input type="text" id="newActionEmoji" placeholder="\u{1F60A}" maxlength="2" style="width:50px; padding:8px; background:var(--h); border:1px solid var(--r); border-radius:4px; color:var(--b); text-align:center; font-size:1.2rem;"> <input type="text" id="newActionName" placeholder="Button Label" style="flex:1; min-width:120px; padding:8px; background:var(--h); border:1px solid var(--r); border-radius:4px; color:var(--b);"> <code id="newCommandPreview" style="color:var(--g); font-size:0.85rem; background:var(--h); padding:6px 10px; border-radius:4px; min-width:60px;">/...</code> </div> <textarea id="newActionInstruction" placeholder="Describe how ${e.name} should respond when this style is used...&#10;Example: {{char}} speaks seductively, using double meanings and suggestive body language." style="width:100%; padding:8px; background:var(--h); border:1px solid var(--r); border-radius:4px; color:var(--b); min-height:60px; resize:vertical; font-family:inherit; font-size:0.85rem;"></textarea> <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;"> <span style="color:var(--e); font-size:0.75rem;">\u{1F4A1} Use <code style="color:var(--g);">{{char}}</code> to reference the NPC's name</span> <button id="addNewActionBtn" style="padding:8px 16px; background:var(--z); border:none; border-radius:6px; color:var(--q); cursor:pointer; font-weight:600;"> + Add Style </button> </div> </div> <div style="display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap;"> <button id="resetToDefaultActions" style="padding:10px 20px; background:var(--af); border:none; border-radius:6px; color:var(--b); cursor:pointer;"> Reset to Defaults </button> <button id="saveActionConfig" style="padding:10px 20px; background:linear-gradient(135deg, var(--n) 0%, var(--u) 100%); border:none; border-radius:6px; color:var(--q); cursor:pointer; font-weight:600;"> \u{1F4BE} Save Changes </button> </div> </div> `, document.body.appendChild(t);
  const i = () => {
    const e2 = t.querySelector("#commandRefList");
    if (!e2) return;
    const n2 = t.querySelectorAll(".action-btn-config");
    let o2 = '<span style="background:rgba(255,165,0,0.2); border:1px solid rgba(255,165,0,0.4); padding:3px 8px; border-radius:4px; font-family:monospace; font-size:0.75rem; color:var(--bm);" title="Direct command - NPC does exactly this">/do</span>';
    o2 += '<span style="background:rgba(199,125,255,0.2); border:1px solid rgba(199,125,255,0.4); padding:3px 8px; border-radius:4px; font-family:monospace; font-size:0.75rem; color:var(--x);" title="Add narrator description">/narrator</span>', n2.forEach((e3) => {
      const t2 = e3.querySelector('[data-field="enabled"]')?.checked, n3 = e3.querySelector('[data-field="name"]')?.value?.trim() || "";
      if (t2 && n3) {
        const e4 = a(n3);
        o2 += `<span style="background:var(--h); padding:3px 8px; border-radius:4px; font-family:monospace; font-size:0.75rem; color:var(--g);">/${e4}</span>`;
      }
    }), e2.innerHTML = o2;
  };
  i(), t.querySelector("#closeActionConfig").addEventListener("click", () => {
    t.remove();
  }), t.addEventListener("click", (e2) => {
    e2.target === t && t.remove();
  });
  const s = (e2) => {
    const o2 = e2.querySelector('[data-field="enabled"]'), s2 = e2.querySelector('[data-field="name"]'), r2 = (e2.querySelector('[data-field="emoji"]'), e2.querySelector('[data-field="instruction"]')), l2 = e2.querySelector(".command-display"), c = e2.querySelector(".validation-warning"), d = e2.querySelector(".instruction-warning"), p = e2.querySelector(".delete-action-btn");
    o2 && o2.addEventListener("change", () => {
      e2.style.borderLeftColor = o2.checked ? "var(--n)" : "var(--af)", i();
    }), s2 && l2 && s2.addEventListener("input", () => {
      const e3 = s2.value.trim(), t2 = a(e3);
      l2.textContent = e3 ? `/${t2}` : "/...", l2.style.color = e3 ? "var(--n)" : "var(--au)", c && (c.style.display = e3 ? "none" : "block", s2.style.borderColor = e3 ? "var(--af)" : "var(--au)"), i();
    }), r2 && d && r2.addEventListener("input", () => {
      const e3 = r2.value.trim();
      d.style.display = e3 ? "none" : "block", r2.style.borderColor = e3 ? "var(--af)" : "var(--au)";
    }), p && !p.disabled && p.addEventListener("click", async () => {
      const a2 = parseInt(e2.dataset.index);
      await Ev("Delete this response style?", "Delete Style", { type: "danger", confirmText: "Delete" }) && (n.splice(a2, 1), e2.remove(), t.querySelectorAll(".action-btn-config").forEach((e3, t2) => {
        e3.dataset.index = t2;
        const n2 = e3.querySelector(".delete-action-btn");
        n2 && (n2.dataset.index = t2);
      }), i(), showNotification("Response style deleted", "success"));
    });
  };
  t.querySelectorAll(".action-btn-config").forEach(s);
  const r = t.querySelector("#newActionName"), l = t.querySelector("#newCommandPreview");
  r && l && r.addEventListener("input", () => {
    const e2 = r.value.trim(), t2 = a(e2);
    l.textContent = e2 ? `/${t2}` : "/...", l.style.color = e2 ? "var(--n)" : "var(--aw)";
  }), t.querySelector("#addNewActionBtn").addEventListener("click", () => {
    const e2 = t.querySelector("#newActionEmoji").value.trim() || "\u{1F3AF}", r2 = t.querySelector("#newActionName").value.trim(), c = t.querySelector("#newActionInstruction").value.trim();
    if (!r2) return void showNotification("Please enter a button label", "error");
    if (!c) return void showNotification("Please enter an instruction", "error");
    const d = { id: `custom_${Date.now()}`, name: `${e2} ${r2}`, instruction: c, emoji: e2, enabled: true };
    n.push(d);
    const p = t.querySelector("#actionButtonsList"), m = document.createElement("div");
    m.innerHTML = o(d, n.length - 1);
    const u2 = m.firstElementChild;
    p.appendChild(u2), s(u2), t.querySelector("#newActionEmoji").value = "", t.querySelector("#newActionName").value = "", t.querySelector("#newActionInstruction").value = "", l.textContent = "/...", l.style.color = "var(--q)", i(), showNotification(`Added /${a(r2)} command!`, "success");
  }), t.querySelector("#resetToDefaultActions").addEventListener("click", () => {
    e.actionButtons = void 0, t.remove(), Oy(e), showNotification("Reset to default actions", "success");
  }), t.querySelector("#saveActionConfig").addEventListener("click", () => {
    const n2 = t.querySelectorAll(".action-btn-config"), o2 = [];
    let i2 = false;
    n2.forEach((e2, t2) => {
      const n3 = e2.querySelector('[data-field="enabled"]')?.checked ?? true, s2 = e2.querySelector('[data-field="emoji"]')?.value?.trim() || "\u{1F3AF}", r2 = e2.querySelector('[data-field="name"]')?.value?.trim() || "", l2 = e2.querySelector('[data-field="instruction"]')?.value?.trim() || "", c = e2.dataset.originalId;
      if (n3 && !r2 && (e2.querySelector(".validation-warning").style.display = "block", e2.querySelector('[data-field="name"]').style.borderColor = "var(--au)", i2 = true), n3 && !l2 && (e2.querySelector(".instruction-warning").style.display = "block", e2.querySelector('[data-field="instruction"]').style.borderColor = "var(--au)", i2 = true), r2 || !n3) {
        const e3 = a(r2) || c;
        o2.push({ id: e3, name: `${s2} ${r2}`, instruction: l2, emoji: s2, enabled: n3 });
      }
    }), i2 ? showNotification("Please fill in all required fields for enabled styles", "error") : (e.actionButtons = o2, t.remove(), Oy(e), saveGame(), showNotification("Response styles saved!", "success"));
  });
}
async function sendChatMessage() {
  if (!chatInput || !chatMessages) return;
  let e = chatInput.value.trim();
  if (!e || !gameState.activeChat) return;
  const t = gameState.activeChat.id, n = gameState.activeChat.name, a = e.match(/^\/([a-z_]+)\s*(?:\{([^}]*)\})?\s*(?:<([^>]*)>)?$/i);
  let o = null;
  if (a) {
    const n2 = a[1].toLowerCase(), i2 = (a[2] || "").trim(), s2 = (a[3] || "").trim(), r2 = gameState.employees.find((e2) => e2.id === t), l2 = (r2?.actionButtons || Ay).find((e2) => e2.id === n2);
    l2 ? (o = { type: n2, instruction: s2 || l2.instruction, emoji: l2.emoji || "\u{1F3AC}", hasCustomInstructions: !!s2 }, e = i2 && "optional" !== i2.toLowerCase() && "" !== i2 ? i2 : "") : o = null;
  }
  if (e.toLowerCase().startsWith("/do ")) {
    const n2 = e.slice(4).trim();
    if (n2) {
      chatInput.value = "";
      const e2 = gameState.employees.find((e3) => e3.id === t);
      e2 && await qy(e2, n2);
    }
    return;
  }
  const i = e.match(/^\/(narrator|n)(?:\s+<([^>]*)>)?$/i);
  if (i) {
    chatInput.value = "";
    const e2 = gameState.employees.find((e3) => e3.id === t);
    if (e2) {
      const t2 = (i[2] || "").trim() || "Describe the current scene and atmosphere between the characters.";
      await Gy(e2, t2);
    }
    return;
  }
  const s = gameState.time?.currentTime || Date.now(), r = gameState.employees.find((e2) => e2.id === t);
  if (r && (r.lastPlayerMessageTime = s), o && !e) {
    if (!r) return;
    const e2 = document.createElement("div");
    return e2.className = "action-indicator", e2.style.cssText = "text-align:center; opacity:0.5; font-size:0.75rem; margin:4px 0; color:var(--e);", e2.textContent = `${o.emoji} ${o.type}`, chatMessages.appendChild(e2), chatMessages.scrollTop = chatMessages.scrollHeight, chatInput.value = "", void await Hy(r, o);
  }
  if (!e) return void (chatInput.value = "");
  addChatMessage("You", e, true, null, null, null, s), ze(t, { sender: "You", content: e, isPlayer: true, timestamp: s, actionModifier: o }), saveGame(false), ge.blockedProactiveMessages.delete(t), r && r.proactiveMessages && (r.proactiveMessages.consecutiveUnreplied = 0, console.log(`[Proactive Message] ${r.name}: Counter reset - Player responded`));
  const l = qs(e, gameState.activeChat);
  for (const e2 of l) remember(gameState.activeChat, `Player ${e2.text}`, e2.type, e2.importance);
  if (chatInput.value = "", r && ("sleeping" === r.npcStatus?.current || "vampire_rest" === r.npcStatus?.current)) {
    const t2 = (r.race || "").toLowerCase(), n2 = ["angel", "elf"].includes(t2), a2 = r.npcStatus.sleepThrough;
    if (!n2 && a2 && Math.random() < 0.75) return wa(r, e), void showNotification(`${r.name} is asleep \u{1F634}`, "info");
    r.npcStatus.current = "waking_up", r.npcStatus.label = "\u{1F634} Just Woke Up", r.npcStatus.responsiveness = 30, r.npcStatus.richLabel = null;
    const o2 = document.getElementById("chatStatus");
    o2 && (o2.innerHTML = va(r), o2.title = r.npcStatus.label);
  }
  gameState.typingStates || (gameState.typingStates = {}), gameState.typingStates[t] = true, chatTypingIndicator && chatTypingName && gameState.activeChat?.id === t && (chatTypingIndicator.style.display = "block", chatTypingName.textContent = n);
  try {
    const a2 = Xs(t), i2 = gameState.employees.find((e2) => e2.id === t);
    if (!i2) return void (gameState.typingStates[t] = false);
    ensureEmployeeMemory(i2);
    let { prompt: s2, personalAllowed: r2 } = buildChatPrompt(i2, a2, e);
    o && (s2 += `

[RESPONSE STYLE MODIFIER]
The player has requested a specific response style. Your response MUST follow this instruction:
${o.instruction.replace(/\{\{char\}\}/gi, i2.name)}

Still respond to their message naturally, but in this specific style/manner.`);
    const l2 = false !== gameState.settings?.enableStreamingResponses;
    chatTypingIndicator && (chatTypingIndicator.style.display = "none");
    let c = null;
    if (l2 && chatMessages && gameState.activeChat?.id === t) {
      c = document.createElement("div"), c.style.cssText = "max-width:80%; padding:10px 15px; border-radius:18px; margin-bottom:10px; word-wrap:break-word; position:relative; background:var(--f); align-self:flex-start; color:var(--cu);";
      const e2 = document.createElement("div");
      e2.style.cssText = "font-size:0.7rem; opacity:0.6; margin-bottom:6px; font-style:italic;", e2.textContent = ky(), c.appendChild(e2);
      const t2 = document.createElement("div");
      t2.className = "stream-text", t2.textContent = "\u258D", c.appendChild(t2), chatMessages.appendChild(c), chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    const d = await queuedGenerateText(s2, { ...c ? { onChunk: function(e2) {
      if (e2 && c && gameState.activeChat?.id === t) {
        const t2 = c.querySelector(".stream-text");
        t2 && (t2.textContent = e2.fullTextSoFar + "\u258D"), chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    } } : {} }, `Generating chat response for ${i2.name}`);
    c && (c.remove(), c = null);
    const p = sanitizeNpcResponse(d, 10), m = gameState.time?.currentTime || Date.now();
    if (ze(t, { sender: n, content: p, isPlayer: false, timestamp: m }), saveGame(false), gameState.typingStates[t] = false, gameState.activeChat && gameState.activeChat.id === t || (i2.unreadMessages || (i2.unreadMessages = 0), i2.unreadMessages++), chatTypingIndicator && gameState.activeChat?.id === t && (chatTypingIndicator.style.display = "none"), gameState.activeChat?.id === t && chatMessages) {
      const e2 = gameState.chatHistory[t].length - 1;
      addChatMessage(n, p, false, null, e2, null, m), chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    const u2 = qs(p, i2);
    for (const e2 of u2) remember(i2, `${i2.name} ${e2.text}`, e2.type, e2.importance);
    const g = (i2.hobbies || []).some((e2) => new RegExp(`\\b${e2}\\b`, "i").test(p)), h = i2.productManaged && new RegExp(`\\b${i2.productManaged}\\b`, "i").test(p), y = i2.position && new RegExp(`\\b${i2.position}\\b`, "i").test(p);
    i2.memory.styleCounters.total += 1, i2.memory.styleCounters.sincePersonal = g || h || y ? 0 : Math.min(10, (i2.memory.styleCounters.sincePersonal || 0) + 1), (h || y) && (i2.memory.styleCounters.jobMentions += 1, i2.memory.styleCounters.lastJobMention = i2.memory.styleCounters.total), g && (i2.memory.styleCounters.hobbyMentions += 1, i2.memory.styleCounters.lastHobbyMention = i2.memory.styleCounters.total), Es(i2, p), Ls(i2, p, {}), await ef(i2, e, p), await tf(i2, e, p), await considerMoneyRequest(i2, e, p), await updateEmployeeStatsFromChat(i2, e, p), Ia(i2, p, e), Ra(i2), Jt(i2, e, p), ei(i2, e, p), (/\b(date|dinner|coffee|love|cute|beautiful|sexy|promotion|raise|fire|bonus)\b/i.test(e) || /\b(date|dinner|coffee|love|cute|beautiful|sexy|thank|appreciate)\b/i.test(p)) && logCompanyEvent({ type: "boss_interaction", involvedEmployees: [t], location: i2.locationId, description: `Boss chat with ${n}: "${e.slice(0, 50)}${e.length > 50 ? "..." : ""}"`, sentiment: "neutral", importance: 5 }), await checkAutoVisualization(i2), "people" === gameState.activeTab && updatePeopleTab(), "dashboard" === gameState.activeTab && sd();
  } catch (e2) {
    console.error("Error generating chat response:", e2), gameState.typingStates && (gameState.typingStates[t] = false), chatTypingIndicator && gameState.activeChat?.id === t && (chatTypingIndicator.style.display = "none"), gameState.activeChat?.id === t && chatMessages && addChatMessage(n, "Sorry, I'm having trouble responding right now.", false);
  }
}
function Wy(e) {
  if (!gameState.activeChat) return;
  const t = gameState.activeChat, n = gameState.chatHistory[t.id];
  if (!n || e < 0 || e >= n.length) return;
  const a = n[e];
  if (a.isPlayer && chatInput) {
    chatInput.value = a.content, chatInput.focus(), chatInput.dataset.editingIndex = e;
    const t2 = document.getElementById("chatSendBtn");
    t2 && (t2.textContent = "\u270F\uFE0F Update", t2.style.backgroundColor = "var(--bs)"), showNotification("\u{1F4AC} Editing message. Press Update to replace it and regenerate response.", 3e3);
  }
}
async function Ky(e) {
  if (!gameState.activeChat) return;
  const t = gameState.activeChat, n = gameState.chatHistory[t.id];
  if (!n || e < 0 || e >= n.length) return;
  const a = n[e];
  if (a.isPlayer) {
    n[e].timestamp = Date.now(), gameState.chatHistory[t.id] = n.slice(0, e + 1), loadChatHistory(t.id), chatTypingIndicator && chatTypingName && (chatTypingIndicator.style.display = "block", chatTypingName.textContent = t.name), showNotification("\u{1F504} Resending message and generating new response...", 2e3);
    try {
      const e2 = Xs(t.id);
      ensureEmployeeMemory(t);
      const { prompt: n2 } = buildChatPrompt(t, e2, a.content), o = sanitizeNpcResponse(await queuedGenerateText(n2, {}, `Generating auto chat response for ${t.name}`), 5);
      gameState.chatHistory[t.id].push({ sender: t.name, content: o, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() }), chatTypingIndicator && (chatTypingIndicator.style.display = "none"), loadChatHistory(t.id), await updateEmployeeStatsFromChat(t, a.content, o), chatMessages.scrollTop = chatMessages.scrollHeight, showNotification("\u2705 Message resent and new response generated!", 2e3), ef(t, a.content, o), tf(t, a.content, o), considerMoneyRequest(t, a.content, o);
    } catch (e2) {
      console.error("Error generating response after resend:", e2), chatTypingIndicator && (chatTypingIndicator.style.display = "none"), showNotification("Failed to generate new response. Please try again.");
    }
  }
}
async function Jy() {
  if (!chatInput || !chatMessages) return;
  const e = chatInput.value.trim();
  if (!e || !gameState.activeChat) return;
  const t = chatInput.dataset.editingIndex;
  if (null != t) {
    const n = parseInt(t), a = gameState.activeChat, o = gameState.chatHistory[a.id];
    if (o && n >= 0 && n < o.length) {
      o[n].content = e, o[n].timestamp = gameState.time?.currentTime || Date.now(), gameState.chatHistory[a.id] = o.slice(0, n + 1), saveGame(false), delete chatInput.dataset.editingIndex;
      const t2 = document.getElementById("chatSendBtn");
      t2 && (t2.textContent = "Send", t2.style.backgroundColor = "#4CAF50"), loadChatHistory(a.id), chatInput.value = "", chatTypingIndicator && chatTypingName && (chatTypingIndicator.style.display = "block", chatTypingName.textContent = a.name);
      try {
        const t3 = Xs(a.id);
        ensureEmployeeMemory(a);
        const { prompt: n2 } = buildChatPrompt(a, t3, e), o2 = sanitizeNpcResponse(await queuedGenerateText(n2, {}, `Generating regenerated response for ${a.name}`), 5);
        gameState.chatHistory[a.id].push({ sender: a.name, content: o2, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() }), saveGame(false), chatTypingIndicator && (chatTypingIndicator.style.display = "none"), loadChatHistory(a.id), await updateEmployeeStatsFromChat(a, e, o2), chatMessages.scrollTop = chatMessages.scrollHeight, showNotification("\u2705 Message updated and response regenerated!", 2e3);
      } catch (e2) {
        console.error("Error generating response after edit:", e2), chatTypingIndicator && (chatTypingIndicator.style.display = "none"), showNotification("Failed to generate new response. Please try again.");
      }
      return;
    }
  }
  await sendChatMessage();
}
function Qy(u2, msg = {}) {
  if (!u2) return -1;
  const emp2 = gameState.employees.find((e) => e.id === u2), name = msg.sender || emp2?.name || "", G2 = msg.timestamp || gameState.time?.currentTime || Date.now();
  gameState.chatHistory[u2] || (gameState.chatHistory[u2] = []);
  const entry = { sender: name, content: msg.content ?? "", isPlayer: false, timestamp: G2 };
  ["imageUrl", "imagePrompt", "imageType", "isMoneyRequest", "amount", "reason", "settled"].forEach((k) => {
    void 0 !== msg[k] && (entry[k] = msg[k]);
  }), msg.extra && "object" == typeof msg.extra && Object.assign(entry, msg.extra), gameState.chatHistory[u2].push(entry);
  const U2 = gameState.chatHistory[u2].length - 1;
  try {
    saveGame(false);
  } catch (u3) {
  }
  return gameState.activeChat?.id === u2 && chatMessages ? false !== msg.render && (addChatMessage(name, entry.content, false, entry.imageUrl || null, U2, entry.imagePrompt || null, G2), chatMessages.scrollTop = chatMessages.scrollHeight) : (emp2 && (emp2.unreadMessages = (emp2.unreadMessages || 0) + 1), false !== msg.notify && name && showNotification(`\u{1F4AC} ${name} sent you a message`, "info")), U2;
}
function Xy(u2) {
  return !/\b(i\s+(won'?t|will not|can'?t|cannot|am not going to|am not gonna|don'?t think|do not think)|not comfortable|no way|i refuse|i'?d rather not|absolutely not|i don'?t want|maybe later|not right now|not ready|please stop)\b/i.test(String(u2 || ""));
}
async function Zy(u2, G2, kind) {
  const prompt = `A character in a chat was asked by the player to ${"post" === kind ? "make or share a social media post" : "send a photo of themselves"}.

Player's request: "${String(u2 || "").slice(0, 300)}"
Character's reply: "${String(G2 || "").slice(0, 500)}"

Did the character AGREE to do it? Treat playful, reluctant, or teasing agreement as YES. Answer NO only if they clearly refused or declined.
Answer with exactly one word: YES or NO.`;
  try {
    const raw = String(await queuedGenerateText(prompt, { temperature: 0, max_tokens: 3 }, `Classifying ${kind} agreement`) || "");
    return /\byes\b/i.test(raw) ? (console.log(`[Agreement] \u2705 classifier YES (${kind})`), true) : /\bno\b/i.test(raw) ? (console.log(`[Agreement] \u274C classifier NO (${kind})`), false) : (console.warn(`[Agreement] Ambiguous classifier output "${raw.slice(0, 30)}" - heuristic fallback`), Xy(G2));
  } catch (u3) {
    return console.warn("[Agreement] Classifier failed - heuristic fallback:", u3), Xy(G2);
  }
}
async function ef(e, t, n) {
  if (!/\b(post|share|put.*on.*feed|upload|publish|make.*post|dare.*you.*to.*post)\b/i.test(t) || !/\b(social|feed|instagram|twitter|snap)\b/i.test(t) && !/\b(picture|photo|selfie|video|nude|naked|masturbat|explicit|sexy|hot|revealing)\b/i.test(t)) return;
  let a = "text", o = t;
  if (/\b(masturbat|dildo|vibrator|toy|finger.*yourself|play.*with.*yourself|touch.*yourself|spread|cum|orgasm|penetrat|squirt)\b/i.test(t) ? a = "explicit" : /\b(nude|naked|full.*nude|nothing.*on|completely.*nude)\b/i.test(t) ? a = /\b(masturbat|touching|playing|spreading)\b/i.test(t) ? "explicit" : "nude" : /\b(thirst.*trap|sexy|hot.*pic|revealing|underwear|lingerie)\b/i.test(t) ? a = "thirst_trap" : /\b(selfie|picture.*of.*you|photo.*of.*you)\b/i.test(t) && (a = "selfie"), !await Zy(t, n, "post")) return void console.log("[Post Detection] \u274C NPC did not agree to post:", e.name);
  console.log("[Post Detection] \u2705 NPC agreed to post:", e.name);
  const u2 = e.id;
  setTimeout(() => {
    const G2 = ["Give me a sec...", "Working on it", "One moment...", "Let me set this up..."];
    Qy(u2, { content: G2[Math.floor(Math.random() * G2.length)], notify: false });
  }, 1e3 + 1e3 * Math.random()), setTimeout(async () => {
    await rf(e, a, o);
  }, 3e3 + 4e3 * Math.random());
}
async function tf(e, t, n) {
  if (/\b(post|share|put.*on.*feed|upload|publish|make.*post)\b/i.test(t) || /\b(social|feed|instagram|twitter|snap.*chat)\b/i.test(t)) return void console.log("[Image Detection] Skipping - looks like post request");
  const u2 = /\b(pic|pics|picture|pictures|photo|photos|selfie|selfies|nude|nudes|snap|snapshot)\b/i.test(t), G2 = /\b(nude|nudes|naked|topless|bottomless|lingerie|underwear|tits|boobs|breasts|ass|butt|booty|pussy|cock|dick|cleavage|thong|body|figure|curves)\b/i.test(t), U2 = /\b(send|show|snap|share|gimme|take)\b/i.test(t) || /\bgive\s+me\b/i.test(t), J2 = /\b(see|show|view|watch)\b/i.test(t) || /\blook\s+at\b/i.test(t), ee2 = /\b(want|wanna|need|lemme|gimme|please)\b/i.test(t) || /\b(let\s+me|can\s+i|could\s+i|may\s+i|would\s+you)\b/i.test(t), te2 = /\b(you|your|yourself)\b/i.test(t);
  if (!(u2 && (U2 || J2 || ee2) || G2 && J2 && te2 || G2 && U2 && /\b(me|us|to\s+me)\b/i.test(t))) return void console.log("[Image Detection] No image request detected");
  console.log("[Image Detection] Image request detected in:", t.substring(0, 60));
  let a = "casual", o = t;
  if (/\b(masturbat|dildo|vibrator|toy|finger.*yourself|play.*with.*yourself|spread|touch.*yourself|cum|orgasm|penetrat|squirt|body.*writing|degradation)\b/i.test(t) ? a = "explicit" : /\b(nude|naked|nothing.*on|completely.*nude|full.*nude|fully.*nude|bare|uncovered)\b/i.test(t) ? a = "nude" : /\b(lewd|sexy|revealing|underwear|lingerie|bra|panties|topless|partially.*clothed|see.*through)\b/i.test(t) ? a = "lewd" : /\b(work|office|professional)\b/i.test(t) ? a = "work" : /\b(selfie|picture|photo)\b/i.test(t) && (a = "casual"), console.log("[Image Detection] Requested type:", a), !await Zy(t, n, "image")) return console.log("[Image Detection] \u274C NPC did not agree to send image"), void console.log("[Image Detection] Response:", n.substring(0, 100));
  console.log("[Image Detection] \u2705 NPC agreed to send image:", e.name);
  const ne2 = e.id;
  setTimeout(async () => {
    await generateAndSendRequestedImage(ne2, a, o);
  }, 2e3 + 4e3 * Math.random());
}
async function considerMoneyRequest(e, t, n) {
}
async function nf(e = null, t = null) {
  if (!gameState.activeChat) return;
  const n = gameState.activeChat;
  let a = e || "text", o = "";
  t ? (o = t, /\b(masturbat|dildo|toy|vibrator|orgasm|cum|ejaculat|finger.*yourself|play.*with.*yourself|spread.*legs|degradation|body.*writing|explicit.*act)\b/i.test(t) ? a = "explicit" : /\b(nude|naked|full.*nude|completely.*nude|nothing.*on)\b/i.test(t) ? a = "nude" : /\b(thirst.*trap|sexy|revealing|underwear|lingerie|hot)\b/i.test(t) ? a = "thirst_trap" : /\b(selfie|picture)\b/i.test(t) && (a = "selfie")) : o = { text: "post a status update", selfie: "post a selfie", thirst_trap: "post a thirst trap (sexy/revealing photo)", nude: "post a nude photo", explicit: "post explicit sexual content (masturbation, toys, etc.)" }[a] || "make a post";
  const i = t || `Could you ${o}?`;
  chatInput && (chatInput.value = i), await sendChatMessage(), setTimeout(async () => {
    await af(n, a, o);
  }, 3e3);
}
async function af(e, t, n) {
  const a = e.memory?.intimacyLevel || 0, o = e.stats?.affection || 0, i = e.stats?.comfort || 0, s = e.stats?.desire || 0, r = e.personality || {};
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
  const c = "explicit" === t || "nude" === t ? 0.3 : 0.1, d = 0.1 * (r.flirty || 50), p = 0.35 * a + 0.25 * o + i * (0.3 - c) + s * c + d, m = p >= l || p >= 0.85 * l && Math.random() < 0.25;
  if (console.log("\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), console.log(`\u{1F4F1} SOCIAL POST REQUEST EVALUATION: ${e.name}`), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"), console.log(`Post Type: ${t.toUpperCase()}`), console.log(`Description: "${n}"`), console.log("\n\u{1F4CA} Stats:"), console.log(`  \u2022 Intimacy: ${a.toFixed(1)}`), console.log(`  \u2022 Affection: ${o.toFixed(1)}`), console.log(`  \u2022 Comfort: ${i.toFixed(1)}`), console.log(`  \u2022 Desire: ${s.toFixed(1)}`), console.log(`  \u2022 Flirty Personality: ${(r.flirty || 50).toFixed(1)}`), console.log("\n\u{1F9EE} Calculation:"), console.log(`  \u2022 Intimacy \xD7 0.35 = ${(0.35 * a).toFixed(2)}`), console.log(`  \u2022 Affection \xD7 0.25 = ${(0.25 * o).toFixed(2)}`), console.log(`  \u2022 Comfort \xD7 ${(0.3 - c).toFixed(2)} = ${(i * (0.3 - c)).toFixed(2)}`), console.log(`  \u2022 Desire \xD7 ${c} = ${(s * c).toFixed(2)}`), console.log(`  \u2022 Flirty \xD7 0.1 = ${d.toFixed(2)}`), console.log("  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"), console.log(`  \u2022 Willingness Score: ${p.toFixed(2)}`), console.log(`  \u2022 Required Threshold: ${l}`), console.log(`  \u2022 Grace Threshold (85%): ${(0.85 * l).toFixed(2)}`), console.log("\n\u{1F3B2} Decision:"), p >= l ? console.log("  \u2705 ACCEPTED - Score meets threshold") : p >= 0.85 * l ? console.log(`  \u{1F3B2} GRACE ZONE - 25% chance (rolled: ${m ? "SUCCESS" : "FAIL"})`) : console.log(`  \u274C REJECTED - Score too low (${(l - p).toFixed(2)} points short)`), console.log("\n\u{1F4DD} Final Result: " + (m ? "\u2705 WILL POST" : "\u274C WILL REFUSE")), console.log("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"), m) setTimeout(() => {
    if (gameState.activeChat?.id === e.id && chatMessages) {
      const n2 = { text: ["Sure, I can post something", "Okay, I'll write something"], selfie: ["Okay! Let me take a selfie", "Sure, give me a sec", "Fine, one sec..."], thirst_trap: ["Alright... let me find something sexy \u{1F60F}", "Okay okay... give me a minute", "Fine... but only because it's you \u{1F618}"], nude: ["Omg... okay. Give me a moment \u{1F633}", "I can't believe I'm doing this... one sec", "Fuck it, why not \u{1F60F}"], explicit: ["Holy shit... okay. This is so fucking hot \u{1F975}", "God, you make me so fucking wet... gimme a minute", "Fuck yes... this is so dirty \u{1F608}", "Can't believe you're making me do this... one sec \u{1F4A6}"] }[t] || ["Okay"], a2 = n2[Math.floor(Math.random() * n2.length)];
      gameState.chatHistory[e.id].push({ sender: e.name, content: a2, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() });
      const o2 = gameState.chatHistory[e.id].length - 1;
      addChatMessage(e.name, a2, false, null, o2), chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, 1500 + 1500 * Math.random()), setTimeout(async () => {
    await rf(e, t, n);
  }, 4e3 + 6e3 * Math.random());
  else {
    const n2 = { explicit: ["That's way too much for me", "I'm not comfortable posting that", "That's too explicit, sorry"], nude: ["I'm not ready to post nudes yet", "That's a bit too much for social media", "Maybe in private, but not on the feed"], thirst_trap: ["I don't think I'm comfortable with that", "That's a bit much for me", "Not really my style"], selfie: ["Not really feeling it right now", "Maybe later"], text: ["I don't really have anything to say", "Not in the mood to post"] }[t] || ["I don't think so"], a2 = n2[Math.floor(Math.random() * n2.length)];
    setTimeout(() => {
      if (gameState.activeChat?.id === e.id && chatMessages) {
        gameState.chatHistory[e.id].push({ sender: e.name, content: a2, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() });
        const t2 = gameState.chatHistory[e.id].length - 1;
        addChatMessage(e.name, a2, false, null, t2), chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 1500 + 1500 * Math.random());
  }
}
async function rf(e, t, n) {
  try {
    const a = getEmployeeAwarenessForPost(e.id);
    if (!a) return;
    a.requestedByBoss = true, a.requestContext = n, a.mustIncludeImage = true;
    const o = await uv(e, t, a);
    if (!o || !o.content) return;
    let i = null;
    if ("text" !== t) {
      if (!o.imagePrompt) {
        const a2 = [];
        a2.push(getPhysicalDescriptionForPrompt(e)), "explicit" === t ? a2.push(`${n || "explicit sexual content, masturbation"}`) : "nude" === t ? a2.push(`${n || "full nude photo, completely naked, revealing everything"}`) : "thirst_trap" === t ? a2.push(`${n || "sexy revealing photo, seductive pose, thirst trap"}`) : "selfie" === t && a2.push(`${n || "selfie photo"}`), o.imagePrompt = a2.join(", ");
      }
      try {
        i = await queuedGenerateImage(applyImageStyle(o.imagePrompt), `Requested post image for ${e.name}`), console.log(`[Request Post] Generated image for ${e.name}'s ${t} post`);
      } catch (t2) {
        console.error("Image generation failed for requested post:", t2);
        try {
          i = await queuedGenerateImage(applyImageStyle(o.imagePrompt), `Requested post image retry for ${e.name}`);
        } catch (e2) {
          console.error("Image retry failed:", e2);
        }
      }
    }
    const s = createPost({ authorId: e.id, content: o.content, type: t, imageUrl: i, imagePrompt: o.imagePrompt, explicitLevel: o.explicitLevel || 0, tags: o.tags || [], location: e.locationId || "headquarters" });
    gameState.socialNetwork.posts.unshift(s), "dashboard" === gameState.activeTab && sd(), gameState.socialNetwork.recentPostTypes || (gameState.socialNetwork.recentPostTypes = []), gameState.socialNetwork.recentPostTypes.unshift(t), gameState.socialNetwork.recentPostTypes.length > 50 && (gameState.socialNetwork.recentPostTypes = gameState.socialNetwork.recentPostTypes.slice(0, 50)), remember(e, `I posted on social media: "${o.content}"`, "action", 2), remember(e, "The boss requested I make this post", "interaction", 2);
    const u2 = ["Done! Check the feed \u{1F60A}", "Posted! Hope you like it \u{1F60F}", "There you go... posted", "Okay, it's up now", "Posted as requested \u{1F633}"];
    Qy(e.id, { content: u2[Math.floor(Math.random() * u2.length)] }), "social" === gameState.activeTab && renderSocialFeed();
  } catch (e2) {
    console.error("Error generating requested post:", e2);
  }
}
async function regenerateMessage(e) {
  if (!gameState.activeChat) return;
  const t = gameState.activeChat, n = gameState.chatHistory[t.id];
  if (!n || e < 1 || e >= n.length) return;
  const a = n[e - 1]?.content;
  if (a) {
    chatTypingIndicator && chatTypingName && (chatTypingIndicator.style.display = "block", chatTypingName.textContent = t.name);
    try {
      const o = n.slice(0, e).map((e2) => `${e2.sender}: ${e2.content}`).join("\n"), i = ["\n\nIMPORTANT: Use a completely new tone and approach. Include details you didn't mention before. Take this in a fresh direction.", "\n\nIMPORTANT: If you were formal before, be casual now. If you were brief, elaborate more. If you were serious, add personality. Show another side of yourself.", "\n\nIMPORTANT: Focus on aspects you haven't explored yet. Use new examples and emotions. Structure your sentences in a new way.", "\n\nIMPORTANT: Shift your emotional tone. If you were playful before, be thoughtful now. If you were enthusiastic, try subtle. Reveal a new facet of your personality.", "\n\nIMPORTANT: Include information or reactions you haven't shared yet. Use significantly varied word choices. Take this conversation somewhere new."], s = i[Math.floor(Math.random() * i.length)];
      n[e].regenerationCount || (n[e].regenerationCount = 0), n[e].regenerationCount++;
      const { prompt: r } = buildChatPrompt(t, o, a), l = r + s, c = Math.min(1.2, 0.7 + 0.1 * n[e].regenerationCount), d = sanitizeNpcResponse(await queuedGenerateText(l, { temperature: c, top_p: 0.95, frequency_penalty: 0.3 }, `Regenerating chat message with variation for ${t.name}`), 5);
      chatTypingIndicator && (chatTypingIndicator.style.display = "none"), n[e].content = d, gameState.chatHistory[t.id] = n.slice(0, e + 1), loadChatHistory(t.id), chatMessages.scrollTop = chatMessages.scrollHeight, showNotification(`\u267B\uFE0F Response regenerated with new variation (${n[e].regenerationCount}x)`, 2e3);
      const prev = n[e - 1];
      if (prev?.isPlayer && prev.content) {
        const emp2 = gameState.employees.find((x) => x.id === t.id) || t;
        ef(emp2, prev.content, d), tf(emp2, prev.content, d), considerMoneyRequest(emp2, prev.content, d);
      }
    } catch (e2) {
      console.error("Error regenerating message:", e2), chatTypingIndicator && (chatTypingIndicator.style.display = "none"), showNotification("Failed to regenerate message. Please try again.");
    }
  }
}
async function sf(e, t) {
  if (!gameState.activeChat) return;
  const n = gameState.activeChat, a = gameState.chatHistory[n.id];
  if (!a || e < 0 || e >= a.length) return;
  const o = a[e];
  if (o.imageUrl) try {
    const e2 = document.createElement("div");
    e2.textContent = "\u{1F3A8} Regenerating image...", e2.style.cssText = "text-align:center; padding:10px; opacity:0.7; font-style:italic;", chatMessages && (chatMessages.appendChild(e2), chatMessages.scrollTop = chatMessages.scrollHeight);
    const a2 = await queuedGenerateImage(applyImageStyle(t), "Regenerating player image");
    e2 && e2.parentElement && e2.remove(), o.imageUrl = a2, loadChatHistory(n.id), chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (e2) {
    console.error("Error regenerating image:", e2), showNotification("Failed to regenerate image");
  }
}
function lf(e, t, n, a, s) {
  if (n && n.trim()) return `${a}, ${n.trim()}`;
  if ("work" === t) return `professional workplace selfie, ${a}, ${e.position || "office worker"}, office environment, professional attire, confident expression`;
  if ("lewd" === t) return s < 40 ? `suggestive selfie, ${a}, flirty expression, casual clothing, teasing pose, playful atmosphere` : `seductive selfie, ${a}, alluring expression, revealing clothing, intimate pose, bedroom or private setting`;
  if ("nude" === t) return s < 60 ? `artistic nude selfie, ${a}, tasteful pose, soft lighting, partial nudity, intimate setting` : `explicit nude selfie, ${a}, seductive pose, full nudity, intimate bedroom setting, aroused expression`;
  if ("explicit" === t) {
    const o = [`explicit sexual content, ${a}, masturbating with hand, intense pleasure expression, legs spread, intimate bedroom setting, aroused and exposed`, `explicit sexual content, ${a}, using sex toy, dildo or vibrator, eyes closed in ecstasy, intimate bedroom setting, very aroused`, `explicit sexual content, ${a}, self-pleasure, fingers inside, intense orgasm expression, intimate bedroom setting, completely exposed`, `explicit sexual content, ${a}, degrading body writing, marked with text, submissive expression, intimate setting, fully nude`, `explicit sexual content, ${a}, masturbating, very aroused expression, touching self intimately, bedroom setting, explicit pose`, `explicit sexual content, ${a}, anal play with toy, intense pleasure face, intimate bedroom setting, very exposed and aroused`, `explicit sexual content, ${a}, using multiple toys, overwhelmed with pleasure, intimate bedroom setting, extremely explicit`, `explicit sexual content, ${a}, squirting orgasm, intense climax expression, legs spread wide, intimate bedroom setting, very wet`];
    return o[Math.floor(Math.random() * o.length)];
  }
  return `casual selfie, ${a}, friendly smile, relaxed setting, natural lighting, smartphone photo quality`;
}
const uf = { casual: "casual selfie, friendly smile, relaxed setting, natural lighting", work: "professional workplace selfie, office environment, professional attire, confident expression", lewd: "suggestive, flirty selfie, teasing alluring pose", nude: "tasteful nude selfie, intimate setting, soft lighting", explicit: "explicit sexual selfie, very aroused, intimate bedroom setting" };
async function mf({ employee: e, type: t = "custom", customRequest: n = null, recentHistory: i = "", sceneContext: u2 = "", mode = "1on1", includePlayer: G2 = false, previousState: U2 = "" } = {}) {
  if (Array.isArray(e)) return await gf({ employees: e, type: t, customRequest: n, recentHistory: i, sceneContext: u2, includePlayer: G2, previousState: U2 });
  const o = getPlayerDescription("image"), a = getPhysicalDescriptionForPrompt(e, { nude: ["nude", "explicit", "lewd"].includes(t) || /\b(nude|naked|undressed|topless|bottomless|stripped|no clothes|clothes off)\b/i.test((n || "") + " " + i) }), s = ((e.stats?.affection || 0) + (e.stats?.desire || 0)) / 2, J2 = !(!n || !n.trim()), request = J2 ? n.replace(/\[PLAYER\]/gi, o).trim() : uf[t] || uf.casual, ee2 = "the player" !== o ? `Player: Player description: ${o}` : "", te2 = "group" === mode ? "\nThis is a selfie the character is sending in a GROUP chat with their boss and colleagues; frame it as a believable self-taken photo." : "", ne2 = u2 ? `
SCENE / SETTING: ${u2}` : "", oe2 = i ? `

RECENT CONVERSATION:
${i}
(The image request is related to this conversation. Pay close attention to details like clothing, costumes, location, activities, or specific descriptions mentioned.)` : "", ae2 = U2 ? `

\u{1F4CC} PREVIOUS IMAGE STATE (continuity): ${U2}
Maintain this pose/position, location, and clothing UNLESS the conversation above explicitly indicates a change (e.g. standing up, moving, repositioning, undressing). Do NOT reset to a default standing pose if a different pose was already established.` : "", ie2 = J2 ? "PLAYER'S IMAGE REQUEST" : "REQUESTED PHOTO", se2 = Il(e.race || e.physical?.race || "human"), le2 = "slime" === se2 ? "\n\n\u{1F9EC} SPECIES (CRITICAL): This character is a SLIME. EVERY feature \u2014 face, hair, skin, body \u2014 is translucent colored gel. Do NOT give a normal human face, human hair, or opaque human skin; render the hair as gel-formed strands of the same gel, the eyes as large glossy gel, and the face as a smooth simple gel face. The whole figure is one cohesive slime girl made of gel." : "cyborg" === se2 ? "\n\n\u{1F9EC} SPECIES (CRITICAL): This character is an augmented HUMAN+ cyborg (advanced chrome, Cyberpunk 2077 style). Keep a human face and a human body silhouette, with sleek chrome cybernetics integrated INTO that human body and subtle cyber detailing on the face \u2014 NOT a non-descript robot body with a human face pasted on." : "", c = `Character: ${e.name}
Appearance: ${a}${le2}
${ee2}${te2}${ne2}
${oe2}${ae2}

${ie2}: "${request}"

TASK:
Generate a detailed image prompt that EXACTLY matches what the player is asking for. Consider:
1. What is the player's request asking for? (Be specific about "how you are right now", "exactly as described", etc.)
2. What was just discussed in the conversation? (Costumes, clothing, activities, locations, poses)
3. What details were explicitly mentioned? (Use EXACT descriptions from conversation)
4. Is this explicit/NSFW? (Don't shy away from explicit details if contextually appropriate)

CRITICAL RULES:
- This is a SOLO photo of ONLY ${e.name} \u2014 do NOT include any other person, coworker, or bystander in the scene, even if the recent conversation above mentions someone else by name or discusses other people. Only ${e.name} appears in the image.
- The character's NAME is only a label \u2014 NEVER depict its literal meaning. A name like "Rose", "Lily", "Crystal", "Brandy", or "Amber" must NOT add a flower, gem, drink, or color to the image. Describe ONLY the appearance given above.
- Do NOT include the character's name in the output prompt. Anchor the SUBJECT using the appearance details above (hair, eyes, body, skin) so the correct person is rendered.
- Begin the prompt with this character's key physical features so the subject is unmistakable, then ACTION/POSE, then setting, then lighting and camera angle.
- Convert any conversational phrasing ("show me\u2026", "I want to see\u2026") into concrete VISUAL descriptors. Do NOT echo the request's wording verbatim.
- If request says "exactly how you are right now" or "as you are" \u2192 use conversation context for current state
- If costume/clothing was just described \u2192 include EXACT costume details
- If location was mentioned \u2192 use that location
- If activity was described \u2192 show that activity
- Include: pose, expression, clothing (or lack thereof), setting, lighting, camera angle
- Use technical/specific tags for image generation
- For explicit content: use anatomical descriptions

Generate ONLY the detailed image prompt - no explanations:`;
  let r = "";
  try {
    r = await queuedGenerateText(c, { temperature: 0.7, max_tokens: 200, stopSequences: ["\n\n\n", "Note:", "Example:", "Camera angle:", "Mood:", "---", "IMAGE PROMPT:", "Explanation:"] }, `Refining ${mode} image prompt for ${e.name}`), r = r.replace(/^["']|["']$/g, "").trim(), r = r.split(/\n\s*\n/)[0], r = r.split(/\(Note:/i)[0].trim(), r = hf(r);
  } catch (u3) {
    console.error("[Image Prompt] LLM refinement failed, using fallback:", u3), r = "";
  }
  return r ? console.log(`[Image Prompt] \u{1F9E0} Refined (${mode}/${t}) for ${e.name}
  intent: ${request}
  \u2192 ${r}`) : (r = lf(e, t, J2 ? request : null, a, s), console.log(`[Image Prompt] \u{1F9F1} Fallback (${mode}/${t}) for ${e.name}: ${r}`)), ["nude", "explicit"].includes(t) && r && !/\b(nude|naked|topless|bottomless|bare|breasts?|nipples?|exposed|genital|pussy|vagina|cock|penis|cum|explicit|nsfw)\b/i.test(r) && (console.warn(`[Image Prompt] \u26A0\uFE0F Refiner sanitized a consented ${t} request for ${e.name} \u2014 substituting explicit fallback so the image matches consent.`), r = lf(e, t, null, a, s)), r;
}
async function gf({ employees, type = "group-photo", customRequest: u2 = null, recentHistory: G2 = "", sceneContext: U2 = "", includePlayer: J2 = false, previousState: ee2 = "" } = {}) {
  const people = (employees || []).filter(Boolean);
  if (!people.length) return "";
  const te2 = getPlayerDescription("image"), nude = ["nude", "explicit", "lewd"].includes(type) || /\b(nude|naked|undressed|topless|bottomless|stripped|no clothes|clothes off)\b/i.test((u2 || "") + " " + G2), ne2 = people.map((e) => {
    const u3 = getPhysicalDescriptionForPrompt(e, { nude }), species = e.race && "human" !== e.race ? e.race : "", G3 = e.physical?.raceFeatures?.description || "";
    return `CHARACTER: ${e.name} (${e.role || e.position || "Employee"})
Physical: ${u3}
${species ? `Species: ${species}${G3 ? ` - ${G3}` : ""}
` : ""}Gender: ${e.gender || "female"}`;
  }).join("\n\n"), oe2 = J2 ? `

CHARACTER: The Boss/Player
Gender: ${(gameState.playerProfile || {}).gender || gameState.settings?.playerGender || "unspecified"}
${gameState.settings?.playerBio || "The boss, a commanding presence in the office"}` : "", total = people.length + (J2 ? 1 : 0), intent = u2 && u2.trim() ? u2.replace(/\[PLAYER\]/gi, te2).trim() : "", scene = U2 || "Office/workplace setting", ae2 = `You are creating ONE image-generation prompt for a GROUP SCENE with MULTIPLE CHARACTERS.

\u{1F4CA} PARTICIPANTS: ${total} total \u2014 every one MUST be clearly visible and identifiable.

\u{1F3AD} CHARACTER DESCRIPTIONS (must be accurate):
${ne2}${oe2}

\u{1F4CD} SCENE: ${scene}${G2 ? `

\u{1F4AC} RECENT CONVERSATION (current actions/mood):
${G2}` : ""}${ee2 ? `

\u{1F4CC} PREVIOUS IMAGE STATE (continuity): ${ee2}
Keep the same poses/positions, location, and clothing UNLESS the conversation explicitly indicates a change (movement, standing up, repositioning, undressing). Do NOT reset everyone to a default standing line-up if other poses were already established.` : ""}

\u{1F3AC} REQUESTED PHOTO: "${intent || "a natural candid group photo together"}"

TASK:
Write ONE detailed image prompt (comma-separated visual tags, 50-200 words) that depicts the REQUESTED PHOTO with all ${total} characters together.

CRITICAL RULES:
- Lead with the GROUP ACTION/POSE from the request, then the characters, then setting, lighting, camera angle.
- Convert any conversational phrasing ("I want to see you make out", "show me\u2026") into concrete VISUAL descriptors of what the bodies are actually doing.
- EVERY character must be visible with their DISTINCTIVE features (hair, body type, race/species features like wings, horns, tails).
- Natural interaction and positioning \u2014 NOT a line-up of people standing side by side unless that is what was asked.
- Honor the requested activity faithfully; do NOT sanitize, soften, or replace it with generic posing.
- For explicit or intimate content: use clear anatomical and action descriptions.

Generate ONLY the image prompt \u2014 no labels, headers, markdown, or explanation:`;
  let r = "";
  try {
    r = await queuedGenerateText(ae2, { temperature: 0.8, max_tokens: 320, stopSequences: ["\n\n\n", "Note:", "Example:", "---", "IMAGE PROMPT:", "Explanation:"] }, `Refining group-photo prompt (${total} people)`), r = extractText(r).trim().replace(/^["']|["']$/g, "").replace(/\*\*[^*]*\*\*/g, "").trim(), r = r.split(/\n\s*\n/)[0].split(/\(Note:/i)[0].trim(), r = hf(r);
  } catch (u3) {
    console.error("[Image Prompt] Multi-char LLM refinement failed, using fallback:", u3), r = "";
  }
  if (r) console.log(`[Image Prompt] \u{1F9E0} Refined group-photo (${total} people) | intent: ${intent || "(none)"}
  \u2192 ${r}`);
  else {
    r = `group photo of ${total} people${intent ? `, ${intent}` : ""}, ${people.map((e) => `${e.name} (${getPhysicalDescriptionForPrompt(e, { nude })})`).join("; ")}${J2 ? "; with the boss/player" : ""}, ${scene}, natural group composition, everyone clearly visible`, console.log(`[Image Prompt] \u{1F9F1} Group-photo fallback (${total} people): ${r}`);
  }
  return r;
}
function hf(s) {
  if (!s || "string" != typeof s) return "";
  let t = s;
  return t = t.replace(/\bsame\s+(location|setting|place|background|scene|pose|position|outfit|clothing)\s+as\s+(the\s+)?(previous|prior|last)\s+image\b/gi, "$1 consistent with the scene"), t = t.replace(/\b(as|like)\s+(in\s+)?(the\s+)?(previous|prior|last)\s+image\b/gi, ""), t = t.replace(/\b(previous|prior|last)\s+image\b/gi, ""), t = t.replace(/\bas\s+described\s+above\b/gi, ""), t = t.replace(/\b(the\s+)?desired\s+look\s+(for|of)\s+[^,.]*/gi, ""), t = t.replace(/\b(as\s+)?(per|from)\s+the\s+(conversation|request|description)\s+above\b/gi, ""), t.replace(/\(\s*\)/g, "").replace(/([,;:])\s*([,.;:])/g, "$2").replace(/\s+([,.;:])/g, "$1").replace(/\s{2,}/g, " ").replace(/^[\s,;:.]+|[\s,;:.]+$/g, "").trim();
}
function yf(e) {
  const t = (e || []).filter((m) => m && m.imagePrompt);
  return t.length ? hf(String(t[t.length - 1].imagePrompt).slice(0, 240)) : "";
}
async function vf(e, t, n = null) {
  const i = gameState.chatHistory[e.id]?.slice(-10).map((e2) => `${e2.sender}: ${e2.content}`).join("\n") || "";
  return await mf({ employee: e, type: t, customRequest: n, recentHistory: i, mode: "1on1", previousState: yf(gameState.chatHistory[e.id]) });
}
async function wf(e) {
  if (!gameState.activeChat || !e.trim()) return;
  const t = gameState.activeChat, n = Xf(e);
  n !== e && (console.log("[Send Image] \u{1F504} Expanded @mentions in image prompt"), console.log("[Send Image] Original:", e), console.log("[Send Image] Expanded:", n)), chatTypingIndicator && chatTypingName && (chatTypingIndicator.style.display = "block", chatTypingName.textContent = t.name);
  try {
    const a = addChatMessage("You", "\u{1F3A8} Generating image...", true), o = await queuedGenerateImage(applyImageStyle(n), "Player custom image request");
    a && a.parentElement && a.remove(), gameState.chatHistory[t.id] || (gameState.chatHistory[t.id] = []), gameState.chatHistory[t.id].push({ sender: "You", content: e, isPlayer: true, imageUrl: o, imagePrompt: e, imageType: "sent", timestamp: gameState.time?.currentTime || Date.now() }), addChatMessage("You", e, true, o, gameState.chatHistory[t.id].length - 1, e);
    const i = Xs(t.id), s = gameState.settings?.playerBio || "", r = s ? `
Player description: ${s}` : "", l = `${buildChatPrompt(t, i, "").prompt}${r}

The player just sent you an image. Based on this description: "${e}", respond naturally to what they sent. Consider:
- What the image shows (understand the CONTEXT and meaning, not just literal technical tags)
- Your relationship with the player
- The context of your conversation
- Your personality and current mood

Respond as if you actually saw the image. Keep it conversational (3-5 sentences, completing your thought).

${t.name}'s response:`, c = sanitizeNpcResponse(await queuedGenerateText(l, {}, `Generating image response for ${t.name}`), 5) || "\u{1F60A}";
    if (chatTypingIndicator && (chatTypingIndicator.style.display = "none"), gameState.chatHistory[t.id].push({ sender: t.name, content: c, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() }), gameState.activeChat?.id === t.id && chatMessages) {
      const e2 = gameState.chatHistory[t.id].length - 1;
      addChatMessage(t.name, c, false, null, e2), chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    remember(t, `Player sent image: ${e}`, "event", 1.5), await updateEmployeeStatsFromChat(t, `[Sent image: ${e}]`, c);
  } catch (e2) {
    console.error("Error handling sent image:", e2), chatTypingIndicator && (chatTypingIndicator.style.display = "none"), gameState.activeChat?.id === t.id && chatMessages && addChatMessage(t.name, "Sorry, I couldn't process that image.", false);
  }
}
async function sendMoneyToNPC(e, t = "", n = null) {
  if (e <= 0) return;
  const a = n || gameState.activeChat?.id;
  if (!a) return;
  const o = gameState.employees.find((e2) => e2.id === a);
  if (o) {
    o.bankBalance || (o.bankBalance = 0), o.bankBalance += e, o.spendingRate || (o.spendingRate = calculateScaledSpendingRate()), gameState.cash = Math.max(0, gameState.cash - e), updateUI(), chatTypingIndicator && chatTypingName && (chatTypingIndicator.style.display = "block", chatTypingName.textContent = o.name);
    try {
      const n2 = t ? `\u{1F4B0} Sent $${xu(e)}
"${t}"` : `\u{1F4B0} Sent $${xu(e)}`;
      gameState.chatHistory[o.id] || (gameState.chatHistory[o.id] = []), gameState.chatHistory[o.id].push({ sender: "You", content: n2, isPlayer: true, isMoney: true, amount: e, message: t, timestamp: gameState.time?.currentTime || Date.now() }), gameState.activeChat?.id === o.id && addChatMessage("You", n2, true);
      const a2 = e / 1e5 * 12;
      let i = "gift", s = "small";
      e < 100 ? (s = "tiny", i = "tip") : e < 1e3 ? (s = "small", i = "gift") : e < 1e4 ? (s = "nice", i = t ? "gift with meaning" : "generous gift") : e < 5e4 ? (s = "substantial", i = "bonus") : e < 2e5 ? (s = "major", i = "windfall") : (s = "life-changing", i = "fortune");
      const r = Xs(o.id, 10), l = getPlayerDescription("conversation", o), c = "the boss" !== l ? `
\u{1F464} BOSS INFO: ${l}` : "", d = t ? `

\u{1F4AC} YOUR BOSS'S MESSAGE WITH THE MONEY:
"${t}"
**IMPORTANT**: Acknowledge this message in your response!` : "", p = `${buildChatPrompt(o, r, "").prompt}${c}

\u{1F4B0} SITUATION: Your boss just sent you $${xu(e)} (a ${s} ${i})!${d}

\u{1F4CA} CONTEXT FOR YOUR REACTION:
- Amount: $${xu(e)} (equivalent to ${a2.toFixed(1)} months of average salary)
- Your current bank balance: $${xu(o.bankBalance)}
- Your personality: ${wr(o.personality)}
- Your relationship: Affection ${o.stats?.affection || 0}, Trust ${o.stats?.trust || 0}, Obedience ${o.stats?.obedience || 0}, Desire ${o.stats?.desire || 0}

\u{1F4AD} HOW TO REACT:
1. **BE GENUINE**: Show real emotion appropriate to the amount (surprise, gratitude, excitement, suspicion, etc.)
2. **FRAME POSITIVELY**: Unless you have serious trust issues or the amount is suspicious, treat this as a nice gesture
3. **AVOID HR COMPLAINTS**: Don't immediately jump to "this feels wrong" unless amount is truly absurd
4. **ACKNOWLEDGE THE GESTURE**: Recognize why they might be sending money (help, appreciation, flirting, etc.)
5. **BE IN CHARACTER**: Respond based on YOUR personality and relationship with them
${t ? "6. **ADDRESS THEIR MESSAGE**: Make sure to respond to what they said!" : ""}

\u{1F4DD} SUGGESTED REACTIONS BY AMOUNT:
- Tiny ($1-99): Casual thanks, maybe confused why so small
- Small ($100-999): Sweet gesture, appreciated
- Nice ($1K-9K): Really grateful, touched by the thoughtfulness  
- Substantial ($10K-49K): Wow, this is amazing! What's the occasion?
- Major ($50K-199K): Holy shit, this is incredible! You're changing my life!
- Life-changing ($200K+): I... I don't know what to say. This is unreal. Are you serious?!

\u{1F3AD} RESPOND NOW (3-8 sentences, natural conversation):`, m = sanitizeNpcResponse(await queuedGenerateText(p, {}, `Generating gift money response for ${o.name}`), 10);
      chatTypingIndicator && (chatTypingIndicator.style.display = "none"), Qy(o.id, { sender: o.name, content: m }), t && (ef(o, t, m), tf(o, t, m), considerMoneyRequest(o, t, m)), remember(o, t ? `Received $${xu(e)} from boss (${i}) - "${t}"` : `Received $${xu(e)} from boss (${i})`, "event", 2);
      let u2 = 0, g = 0, h = 0;
      e < 1e3 ? (u2 = 2 + Math.floor(e / 200), g = 1, h = 1) : e < 1e4 ? (u2 = 5 + Math.floor(e / 1e3), g = 2, h = 2) : e < 1e5 ? (u2 = 10 + Math.floor(e / 5e3), g = 3, h = 4) : (u2 = 20, g = 5, h = 8), u2 = Math.min(25, u2), g = Math.min(10, g), h = Math.min(12, h), o.stats || (o.stats = {}), o.stats.affection = Math.min(100, (o.stats.affection || 0) + u2), o.stats.trust = Math.min(100, (o.stats.trust || 0) + g), o.stats.desire = Math.min(100, (o.stats.desire || 0) + h), o.stats.obedience = Math.min(100, (o.stats.obedience || 0) + Math.floor(u2 / 2));
      const y = e / 1e4, f = 50;
      o.spendingRate += Math.min(f, y), showNotification(`\u{1F4B0} ${o.name}: +$${xu(e)} to bank
+${u2} Affection, +${g} Trust, +${h} Desire`, "success"), updateUI(), chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (e2) {
      console.error("Error handling money transfer:", e2), chatTypingIndicator && (chatTypingIndicator.style.display = "none"), gameState.activeChat?.id === o.id && chatMessages && (addChatMessage(o.name, "Wow, thank you so much! This is amazing! \u{1F495}", false), chatMessages.scrollTop = chatMessages.scrollHeight), o.stats || (o.stats = {}), o.stats.affection = Math.min(100, (o.stats.affection || 0) + 5), o.stats.trust = Math.min(100, (o.stats.trust || 0) + 2), o.stats.desire = Math.min(100, (o.stats.desire || 0) + 3), updateUI();
    }
  }
}
