// ============================================================================
// 45-onboarding-profile — Onboarding & profile: resetOnboarding, handleEmployeeAction, openChat, unified appearance/profile UI.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

async function resetOnboarding(e) {
    const t = gameState.onboarding.find((t) => t.id === e);
    if (!t) return void showNotification("Employee not found in onboarding queue");
    const n = t.hireCostPaid || 0,
        a = n > 0 ? `\n- Refund $${formatNumber(n)}` : "";
    if (
        !(await showConfirm(
            `Reset onboarding for ${t.name}?\n\nThis will:\n- Remove them from onboarding\n- Clear the manager slot${a}\n- Allow you to hire a new manager\n\nThis is an emergency fix for stuck employees.`,
            "Reset Onboarding",
            { type: "warning", confirmText: "Reset" }
        ))
    )
        return;
    const o = gameState.products.find((e) => e.managerOnboarding && e.name === t.productManaged);
    n > 0 && ((gameState.cash += n), console.log(`Refunded $${n} for ${t.name}`)),
        (gameState.onboarding = gameState.onboarding.filter((t) => t.id !== e)),
        o &&
            ((o.managerOnboarding = !1),
            (o.managerHired = !1),
            console.log(`Cleared onboarding flag for product: ${o.name}`)),
        updatePeopleTab(),
        updateProductsList();
    const i = n > 0 ? ` Refunded $${formatNumber(n)}.` : "";
    showNotification(`${t.name}'s onboarding has been reset.${i} You can now hire a new employee.`),
        console.log(`Emergency reset completed for ${t.name} (${e})`);
}
async function handleEmployeeAction(e, t) {
    const n = gameState.employees.find((t) => t.id === e);
    if (n)
        switch (t) {
            case "bio":
                openUnifiedProfile(e, "overview");
                break;
            case "gift":
                showNotification(`Gift given to ${n.name}!`);
                break;
            case "chat":
                openChat(n);
                break;
            case "flags":
                openFlagManagementModal(n);
                break;
            case "promote":
                openCorporatePyramidModal(e);
                break;
            case "review":
                conductPerformanceReview(e);
                break;
            case "export-character":
                openCharacterExportModal(e);
                break;
            case "encounter":
                startEncounter(n);
                break;
            case "fire":
                if (
                    await showConfirm(`Are you sure you want to fire ${n.name}?`, "Fire Employee", {
                        type: "danger",
                        confirmText: "Fire",
                    })
                ) {
                    const e = getEmployeeLevel(n.id),
                        t = n.stats?.trust || 50,
                        a = n.stats?.affection || 0,
                        o = getEmployeePosition(n.id);
                    if (
                        (o &&
                            ((o.employeeId = null),
                            (o.isVacant = !0),
                            console.log(`[Fire] Removed ${n.name} from position: ${o.title}`)),
                        n.productManaged)
                    ) {
                        const e = gameState.products.find((e) => e.name === n.productManaged);
                        e &&
                            ((e.managerHired = !1),
                            (e.managerId = null),
                            (e.managerLevel = 0),
                            (e.managerOnboarding = !1),
                            (e.running = !1),
                            (e.timeRemainingMs = 0),
                            console.log(`[Fire] Cleared product management for: ${e.name}`));
                    }
                    if (
                        (gameState.products.forEach((e) => {
                            e.managerId === n.id &&
                                ((e.managerHired = !1),
                                (e.managerId = null),
                                (e.managerLevel = 0),
                                (e.managerOnboarding = !1),
                                (e.running = !1),
                                (e.timeRemainingMs = 0),
                                console.log(`[Fire] Cleared stale product reference for: ${e.name}`));
                        }),
                        (n.employmentStatus = "alumni"),
                        (n.hired = !1),
                        (n.firedDate = Date.now()),
                        (n.productManaged = null),
                        "function" == typeof reconcileGroupParticipants && reconcileGroupParticipants(),
                        n.career &&
                            ((n.career.previousLevel = n.career.level),
                            (n.career.previousTitle = n.career.title),
                            (n.career.level = 0),
                            (n.career.title = "Former Employee")),
                        void 0 !== StoryEngine && StoryEngine.trackAction)
                    ) {
                        const o = t < 30 || a > 50;
                        StoryEngine.trackAction(o ? "fired_employee_cruelly" : "fired_employee_fairly", {
                            employeeId: n.id,
                            employeeName: n.name,
                            employeeLevel: e,
                            employeeTrust: t,
                            employeeAffection: a,
                        });
                    }
                    logCompanyEvent({
                        type: "fire",
                        involvedEmployees: [n.id],
                        location: n.locationId,
                        description: `${n.name} was let go`,
                        sentiment: "negative",
                        importance: 8,
                    }),
                        gameState.companyContext.recentFires || (gameState.companyContext.recentFires = []),
                        gameState.companyContext.recentFires.unshift({ id: n.id, name: n.name, date: Date.now() }),
                        gameState.companyContext.recentFires.length > 5 &&
                            (gameState.companyContext.recentFires = gameState.companyContext.recentFires.slice(
                                0,
                                5
                            )),
                        updateCompanyAwareness(),
                        showNotification(`${n.name} has been fired.`),
                        updatePeopleTab(),
                        updateProductsList();
                }
        }
}
function openChat(e) {
    if ("string" == typeof e && !(e = gameState.employees.find((t) => t.id === e)))
        return void console.error("Employee not found");
    const t = document.getElementById("encounterRequestModal");
    t && (t.style.display = "none");
    const n = document.getElementById("attachmentMenu");
    n && (n.style.display = "none"),
        (gameState.activeChat = e),
        (gameState.activeChatEmployee = e.id),
        ensureEmployeeMemory(e),
        (e.unreadMessages = 0);
    const a = $("chatTypingIndicator"),
        o = $("chatTypingName");
    if (
        (a &&
            o &&
            (gameState.typingStates && gameState.typingStates[e.id]
                ? ((a.style.display = "block"), (o.textContent = e.nicknameFromPlayer || e.name))
                : (a.style.display = "none")),
        chatModal &&
            ((chatModal.hidden = !1),
            (chatModal.style.display = "flex"),
            (chatModal.style.pointerEvents = "auto"),
            "function" == typeof applyChatStyles && applyChatStyles()),
        chatName)
    ) {
        const t = e.nicknameFromPlayer || e.name;
        (chatName.textContent = t),
            (chatName.style.color = getGenderColor(e.gender || "female")),
            e.nicknameFromPlayer
                ? ((chatName.title = `Real name: ${e.name}`), (chatName.style.cursor = "help"))
                : ((chatName.title = ""), (chatName.style.cursor = "default"));
    }
    chatAvatar && (chatAvatar.src = e.profileImage || placeholderImage(80, 80)),
        gameState.chatHistory[e.id] || (gameState.chatHistory[e.id] = []),
        loadChatHistory(e.id);
    const i = e.chatCommMode || "auto";
    document.querySelectorAll('input[name="chatCommMode"]').forEach((e) => {
        e.checked = e.value === i;
    });
    const s = $("chatScenarioContext");
    s && (s.value = e.chatSettings?.scenarioContext || "");
    const r = $("chatStatus");
    r &&
        (e.chatSettings?.scenarioContext
            ? ((r.innerHTML = '<span style="color:var(--l-indigo);">📍 Scene Active</span>'),
              (r.title = e.chatSettings.scenarioContext))
            : e.npcStatus
              ? ((r.innerHTML = getNPCStatusBadgeHTML(e)),
                (r.title = e.npcStatus.richLabel || e.npcStatus.label),
                tryEnrichStatusLabel(e))
              : ((r.textContent = "Online"), (r.title = ""))),
        renderNpcActionButtons(e),
        "people" === gameState.activeTab && updatePeopleTab();
}
function openChatAndScrollTo(e, t) {
    const n = gameState.employees.find((t) => t.id === e);
    n
        ? (openChat(n),
          setTimeout(() => {
              const e = $("chatMessages");
              if (!e) return void console.warn("[openChatAndScrollTo] Chat history container not found");
              const n = e.querySelector(`[data-timestamp="${t}"]`);
              n
                  ? (n.scrollIntoView({ behavior: "smooth", block: "center" }),
                    (n.style.transition = "background-color 0.3s, box-shadow 0.3s"),
                    (n.style.backgroundColor = "rgba(255, 107, 157, 0.3)"),
                    (n.style.boxShadow = "0 0 15px rgba(255, 107, 157, 0.5)"),
                    setTimeout(() => {
                        (n.style.backgroundColor = ""), (n.style.boxShadow = "");
                    }, 2e3),
                    console.log("[openChatAndScrollTo] Scrolled to message at timestamp:", t))
                  : (console.warn("[openChatAndScrollTo] Message not found with timestamp:", t),
                    (e.scrollTop = e.scrollHeight));
          }, 300))
        : console.error("[openChatAndScrollTo] Employee not found:", e);
}
function createStatControls(e, t, n = 0, a = 100) {
    const o = document.getElementById(e);
    if (!o) return;
    const i = o.parentElement,
        s = i.innerHTML;
    return (
        (i.innerHTML = `\n      <div style="display:flex; flex-direction:column; gap:6px; align-items:center;">\n        <div style="font-size:1.5rem; font-weight:bold; color:inherit;">\n          <span id="${e}">${Math.round(t)}</span>%\n        </div>\n        <div style="display:flex; gap:2px; flex-wrap:wrap; justify-content:center;">\n          <button class="stat-btn" data-change="-10" style="padding:2px 6px; background:var(--l-red); border:none; border-radius:3px; color:var(--l-ink-on-fill); font-size:0.7rem; cursor:pointer;">&lt;&lt;&lt;</button>\n          <button class="stat-btn" data-change="-5" style="padding:2px 6px; background:var(--l-pink); border:none; border-radius:3px; color:var(--l-on-accent); font-size:0.7rem; cursor:pointer;">&lt;&lt;</button>\n          <button class="stat-btn" data-change="-1" style="padding:2px 6px; background:#ffa7c4; border:none; border-radius:3px; color:var(--l-on-accent); font-size:0.7rem; cursor:pointer;">&lt;</button>\n          <button class="stat-btn" data-change="1" style="padding:2px 6px; background:var(--l-green); border:none; border-radius:3px; color:var(--l-on-accent); font-size:0.7rem; cursor:pointer;">&gt;</button>\n          <button class="stat-btn" data-change="5" style="padding:2px 6px; background:var(--l-cyan); border:none; border-radius:3px; color:var(--l-on-accent); font-size:0.7rem; cursor:pointer;">&gt;&gt;</button>\n          <button class="stat-btn" data-change="10" style="padding:2px 6px; background:#0096c7; border:none; border-radius:3px; color:var(--l-ink-on-fill); font-size:0.7rem; cursor:pointer;">&gt;&gt;&gt;</button>\n        </div>\n      </div>\n    `),
        i.querySelectorAll(".stat-btn").forEach((t) => {
            t.onclick = (o) => {
                o.stopPropagation();
                const i = parseInt(t.dataset.change),
                    s = document.getElementById(e);
                let r = parseInt(s.textContent) + i;
                (r = Math.max(n, Math.min(a, r))), (s.textContent = r);
            };
        }),
        s
    );
}
function createDropdownControl(e, t, n) {
    const a = document.getElementById(e);
    if (!a) return;
    const o = a.parentElement,
        i = o.innerHTML,
        s = n
            .map((e) => `<option value="${e.value}" ${e.value === t ? "selected" : ""}>${e.label}</option>`)
            .join("");
    return (
        (o.innerHTML = `\n      <select id="${e}" style="width:100%; padding:6px; background:var(--surface); border:1px solid var(--accent-gold); border-radius:4px; color:var(--accent-gold); font-weight:600;">\n        ${s}\n      </select>\n    `),
        i
    );
}
window.updateUnifiedAppearancePreview = function () {
    const e = window.profileEditState?.editedData?.physical;
    let desc = "";
    if (e) {
        const t = [];
        (e.heightBuild || (e.height && e.build)) && t.push(`${e.heightBuild || e.height + ", " + e.build}`);
        if (e.hair && (e.hair.color || e.hair.style || e.hair.length)) {
            const n = [];
            e.hair.length && n.push(e.hair.length),
                e.hair.color && n.push(e.hair.color),
                e.hair.style && n.push(e.hair.style),
                e.hair.texture && n.push(e.hair.texture),
                n.length && t.push(`Hair: ${n.join(", ")}`);
        }
        e.eyes?.color && t.push(`${e.eyes.color} eyes`);
        if (e.face) {
            const n = [];
            e.face.shape && n.push(/face/i.test(e.face.shape) ? e.face.shape : `${e.face.shape} face`),
                e.face.lips && n.push(/lip/i.test(e.face.lips) ? e.face.lips : `${e.face.lips} lips`),
                e.face.nose && n.push(/nose/i.test(e.face.nose) ? e.face.nose : `${e.face.nose} nose`),
                e.face.cheekbones &&
                    n.push(/cheek/i.test(e.face.cheekbones) ? e.face.cheekbones : `${e.face.cheekbones} cheekbones`),
                e.face.jawline &&
                    n.push(/jaw/i.test(e.face.jawline) ? e.face.jawline : `${e.face.jawline} jawline`),
                n.length && t.push(n.join(", "));
        }
        (e.skin?.tone || e.skinTone) && t.push(`${e.skin?.tone || e.skinTone} skin`),
            e.skin?.texture && t.push(`${e.skin.texture} texture`),
            (e.body?.shape || e.bodyShape) && t.push(`${e.body?.shape || e.bodyShape} body shape`);
        if (e.body) {
            if (e.body.chestSize || e.body.breastSize) {
                const n = e.body.chestSize || e.body.breastSize,
                    a = "chest" === e.body.chestDescriptor ? "chest" : "breasts";
                t.push(`${n} ${a}`);
            }
            e.body.buttSize && t.push(/butt|bottom|rear/i.test(e.body.buttSize) ? e.body.buttSize : `${e.body.buttSize} butt`),
                e.body.legs && t.push(/leg|thigh/i.test(e.body.legs) ? e.body.legs : `${e.body.legs} legs`);
        }
        const garr =
            "function" == typeof normalizeGenitals
                ? normalizeGenitals(e)
                : Array.isArray(e.genitals)
                  ? e.genitals
                  : e.genitals
                    ? [e.genitals]
                    : [];
        const gp = garr
            .filter((x) => x && (x.type || x.size))
            .map((x) => [x.type, x.size && x.size + " size", x.characteristics].filter(Boolean).join(", "));
        gp.length && t.push(`Intimate: ${gp.join("; ")}`);
        const _pier = (e.piercings || [])
            .filter((x) => x && (x.location || x.type))
            .map(
                (x) =>
                    `${[x.type, x.location && "on " + x.location].filter(Boolean).join(" ")}${x.description ? " (" + x.description + ")" : ""}`.trim()
            );
        _pier.length && t.push(`Piercings: ${_pier.join(", ")}`);
        const _tat = (e.tattoos || [])
            .filter((x) => x && (x.location || x.description))
            .map(
                (x) =>
                    `${x.description || "tattoo"}${x.location ? " on " + x.location : ""}${x.style ? " (" + x.style + ")" : ""}`.trim()
            );
        _tat.length && t.push(`Tattoos: ${_tat.join(", ")}`);
        const feats =
            e.distinguishingFeatures && e.distinguishingFeatures.length
                ? e.distinguishingFeatures.filter(Boolean).join(", ")
                : e.distinguishingFeature;
        e.fashion && t.push(`Fashion: ${e.fashion}`),
            e.accessories && t.push(`Accessories: ${e.accessories}`),
            feats && t.push(`Distinguishing feature: ${feats}`),
            (desc = t.join(". ") + ".");
    }
    const preview = document.getElementById("appearanceDescPreview");
    preview && (preview.textContent = desc),
        window.profileEditState.editedData.physical || (window.profileEditState.editedData.physical = {}),
        (window.profileEditState.editedData.physical.fullDescription = desc);
    const _p = window.profileEditState.editedData.physical,
        _hb = _p.heightBuild || ((_p.height || "") + (_p.build ? ", " + _p.build : "")).trim(),
        _hair = [(_p.hair && _p.hair.length) || _p.hairLength, (_p.hair && _p.hair.color) || _p.hairColor]
            .filter(Boolean)
            .join(" "),
        _eyes = (_p.eyes && _p.eyes.color) || _p.eyeColor || "",
        _skin = (_p.skin && _p.skin.tone) || _p.skinTone || "",
        _withParts = [_hair ? _hair + " hair" : "", _eyes ? _eyes + " eyes" : "", _skin ? _skin + " skin" : ""]
            .filter(Boolean)
            .join(", ");
    (window.profileEditState.editedData.physical.shortDescription = (
        _hb + (_withParts ? " with " + _withParts : "")
    ).trim()),
        "function" == typeof markProfileChange && markProfileChange();
};
function syncUnifiedStructured() {
    const ed = window.profileEditState && window.profileEditState.editedData;
    if (!ed) return;
    ed.physical || (ed.physical = {});
    const p = ed.physical;
    document.getElementById("uaGenitalCards") && (p.genitals = collectGenitalCards("uaGenitalCards"));
    document.getElementById("uaPiercingCards") && (p.piercings = collectPiercings("uaPiercingCards"));
    document.getElementById("uaTattooCards") && (p.tattoos = collectTattoos("uaTattooCards"));
    document.getElementById("uaFeatureList") &&
        ((p.distinguishingFeatures = collectFeatureList("uaFeatureList")),
        (p.distinguishingFeature = p.distinguishingFeatures.join(", ")));
    "function" == typeof updateUnifiedAppearancePreview && updateUnifiedAppearancePreview(),
        "function" == typeof markProfileChange && markProfileChange();
}
function upgradeUnifiedAppearanceEdit() {
    const modal = document.getElementById("unifiedProfileModal");
    if (!modal) return;
    const ed = window.profileEditState.editedData,
        phys = (ed && ed.physical) || {},
        gender = (ed && ed.gender) || phys.gender || "female",
        O = APPEARANCE_OPTIONS,
        byPath = (frag) => modal.querySelector(`input[onchange*="physical.${frag} = this.value"]`),
        combo = (frag, opts) => {
            const el = byPath(frag);
            el && wrapInputAsCombo(el, opts);
        };
    try {
        combo("heightBuild", O.height.concat(O.build)),
            combo("hair.color", O.hairColor),
            combo("hair.style", O.hairStyle),
            combo("hair.length", O.hairLength),
            combo("hair.texture", O.hairTexture),
            combo("eyes.color", O.eyeColor),
            combo("eyes.shape", O.eyeShape),
            combo("face.shape", O.faceShape),
            combo("face.nose", O.nose),
            combo("face.lips", O.lips),
            combo("face.cheekbones", O.cheekbones),
            combo("face.jawline", O.jawline),
            combo("skin.tone", O.skinTone),
            combo("body.shape", O.bodyShape),
            combo("body.chestSize", O.chestSizeFemale.concat(O.chestSizeMale)),
            combo("body.buttSize", O.buttSize),
            combo("body.legs", O.legs),
            combo("fashion", O.fashion),
            combo("accessories", O.accessories);
        // ---- Reactive race & biology editor ----
        try {
            const _race = canonicalRace(ed.race || phys.race || "human");
            ed.physical = ed.physical || {};
            ed.physical.race || (ed.physical.race = ed.race || _race);
            (ed.physical.bio && "object" == typeof ed.physical.bio) ||
                (ed.physical.bio = bioFromLegacyRaceFeatures(_race, ed.physical.raceFeatures));
            const anchorEl = byPath("skin.tone") || byPath("hair.color"),
                sect = anchorEl && anchorEl.closest('div[style*="background:var(--surface-2)"]');
            if (sect && sect.parentElement && !document.getElementById("uaBiologyWrap")) {
                const wrap = document.createElement("div");
                (wrap.id = "uaBiologyWrap"),
                    wrap.setAttribute("data-ua-structured", "1"),
                    (wrap.style.cssText = "background: var(--surface-2); padding: 15px; border-radius: 8px; margin-bottom: 15px;"),
                    (wrap.innerHTML = `<h4 style="margin:0 0 10px 0; color:var(--accent-gold);">🧬 Race & Biology</h4><label style="display:block; color:var(--text-dim); font-size:0.8rem; margin-bottom:4px;">Species</label><select id="uaRaceSelect" style="width:100%; padding:7px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); margin-bottom:12px;">${buildRaceOptionsHTML(_race)}</select><div id="uaBiologyHost"></div>`),
                    sect.parentElement.insertBefore(wrap, sect);
                const host = wrap.querySelector("#uaBiologyHost"),
                    sel = wrap.querySelector("#uaRaceSelect"),
                    markChg = () => "function" == typeof window.markProfileChange && window.markProfileChange(),
                    reDerive = () => { ed.physical.raceFeatures = deriveRaceFeaturesFromBio(ed.race || _race, ed.physical.bio); };
                renderBiologyFields(host, ed.race || _race, ed.physical.bio);
                sel &&
                    sel.addEventListener("change", function () {
                        const nr = canonicalRace(this.value);
                        (ed.race = nr), (ed.physical.race = nr), reconcileBio(nr, ed.physical.bio), reDerive(), renderBiologyFields(host, nr, ed.physical.bio), markChg();
                    });
                host.addEventListener("change", () => { reDerive(), markChg(); });
                host.addEventListener("input", () => { reDerive(), markChg(); });
                // Pass 3: data-driven personality-axis + per-NPC voice editor, alongside biology.
                ed.personality || (ed.personality = {});
                (ed.personality.axes && "object" == typeof ed.personality.axes) ||
                    (ed.personality.axes = "function" == typeof derivePersonalityAxes ? derivePersonalityAxes(ed) : {});
                ed.voice || (ed.voice = { override: "" });
                const pWrap = document.createElement("div");
                pWrap.style.cssText = "background: var(--surface-2); padding: 15px; border-radius: 8px; margin-bottom: 15px;";
                pWrap.innerHTML = `<h4 style="margin:0 0 10px 0; color:var(--accent-gold);">💫 Personality &amp; Voice</h4><div id="uaAxesHost"></div><div style="margin-bottom:8px;"><label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Humor (serious ↔ humorous): <span id="uaHumorVal" style="color:var(--accent-gold); font-weight:600;">${ed.personality.humor ?? 50}</span></label><input type="range" id="uaHumor" min="0" max="100" value="${ed.personality.humor ?? 50}" style="width:100%; accent-color:var(--positive);"></div><label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">🗣️ Voice Override <span style="color:var(--text-mute); font-weight:normal;">(dialect/vocabulary; optional)</span></label><textarea id="uaVoiceOverride" rows="2" placeholder="e.g. clipped military jargon; warm Southern drawl" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); resize:vertical; box-sizing:border-box; font-size:0.85rem;">${ed.voice.override || ""}</textarea>`;
                sect.parentElement.insertBefore(pWrap, sect);
                renderPersonalityAxes(pWrap.querySelector("#uaAxesHost"), ed.personality.axes);
                const _hum = pWrap.querySelector("#uaHumor"),
                    _humVal = pWrap.querySelector("#uaHumorVal");
                _hum &&
                    _hum.addEventListener("input", () => {
                        (ed.personality.humor = parseInt(_hum.value) || 0), _humVal && (_humVal.textContent = _hum.value), markChg();
                    });
                pWrap
                    .querySelector("#uaAxesHost")
                    .addEventListener("input", () => {
                        "function" == typeof syncFlatFiveFromAxes && syncFlatFiveFromAxes(ed), markChg();
                    });
                const _vo = pWrap.querySelector("#uaVoiceOverride");
                _vo && _vo.addEventListener("input", () => { (ed.voice.override = _vo.value), markChg(); });
            }
        } catch (e2) {
            console.warn("biology editor (unified) failed", e2);
        }
        const genderEl = modal.querySelector('input[onchange*="editedData.gender = this.value"]');
        genderEl &&
            wrapInputAsCombo(genderEl, ["Female", "Male", "Non-binary", "Trans Woman", "Trans Man", "Female Futa"]);
        if (genderEl) {
            let _prevG = normalizeGender(ed.gender || "female");
            genderEl.addEventListener("change", function() {
                const newG = normalizeGender(this.value);
                const nameInput = document.getElementById("profileNameInput");
                if (nameInput) nameInput.style.color = getGenderColor(newG);
                if (newG !== _prevG) {
                    _prevG = newG;
                    const emp = gameState.employees.find(function(x) { return x.id === ed.id; });
                    const race = ed.race || (emp && emp.race) || "human";
                    const ethnicity = ed.ethnicity || (emp && emp.ethnicity) || null;
                    const newPhys = generateDetailedPhysicalAppearance(newG, race, ethnicity);
                    ed.physical = ed.physical || {};
                    ed.physical.body = newPhys.body;
                    ed.physical.genitals = newPhys.genitals;
                    const bsEl = byPath("body.shape"); if (bsEl) bsEl.value = newPhys.body.shape || "";
                    const bcEl = byPath("body.chestSize"); if (bcEl) bcEl.value = newPhys.body.chestSize || "";
                    const bbEl = byPath("body.buttSize"); if (bbEl) bbEl.value = newPhys.body.buttSize || "";
                    const blEl = byPath("body.legs"); if (blEl) blEl.value = newPhys.body.legs || "";
                    const genHost = document.getElementById("uaGenitalCards");
                    if (genHost) {
                        const tmp = document.createElement("div");
                        tmp.innerHTML = renderGenitalCards("uaGenitalCards", normalizeGenitals(ed.physical), newG);
                        genHost.replaceWith(tmp.firstElementChild);
                    }
                    syncUnifiedStructured();
                    showNotification("✨ " + (ed.name || "Character") + " is now " + formatGenderLabel(newG) + " — body & genitals regenerated. Fine-tune the cards above.");
                }
            });
        }
        const gType = byPath("genitals.type");
        if (gType) {
            const sizeEl = byPath("genitals.size"),
                groomEl = byPath("genitals.characteristics"),
                typeCell = gType.closest("div"),
                host = document.createElement("div");
            (host.style.gridColumn = "1 / -1"),
                host.setAttribute("data-ua-structured", "1"),
                (host.innerHTML = `<label style="color:var(--text-dim); font-size:0.85rem;">Genitals (add one or more sets):</label>${renderGenitalCards("uaGenitalCards", normalizeGenitals(phys), gender)}`),
                typeCell && typeCell.replaceWith(host),
                sizeEl && sizeEl.closest("div") && sizeEl.closest("div").remove(),
                groomEl && groomEl.closest("div") && groomEl.closest("div").remove();
        }
        const distEl = byPath("distinguishingFeature");
        if (distEl) {
            const cell = distEl.closest("div"),
                host = document.createElement("div"),
                feats =
                    phys.distinguishingFeatures && phys.distinguishingFeatures.length
                        ? phys.distinguishingFeatures
                        : phys.distinguishingFeature
                          ? [phys.distinguishingFeature]
                          : [];
            (host.style.gridColumn = "1 / -1"),
                host.setAttribute("data-ua-structured", "1"),
                (host.innerHTML = `<label style="color:var(--text-dim); font-size:0.85rem;">Distinguishing Features:</label>${renderFeatureList("uaFeatureList", feats)}`),
                cell && cell.replaceWith(host);
        }
        if (!document.getElementById("uaPiercingCards")) {
            const anchor = document.getElementById("uaGenitalCards") || document.getElementById("uaFeatureList"),
                section = anchor && anchor.closest('div[style*="background:var(--surface-2)"]');
            if (section && section.parentElement) {
                const div = document.createElement("div");
                (div.style.cssText =
                    "background: var(--surface-2); padding: 15px; border-radius: 8px; margin-bottom: 15px;"),
                    div.setAttribute("data-ua-structured", "1"),
                    (div.innerHTML = `<h4 style="margin:0 0 10px 0; color:var(--accent-gold);">💎 Piercings & Tattoos</h4><div style="margin-bottom:10px;">${renderPiercingCards("uaPiercingCards", phys.piercings || [])}</div><div>${renderTattooCards("uaTattooCards", phys.tattoos || [])}</div>`),
                    section.parentElement.insertBefore(div, section.nextSibling);
            }
        }
    } catch (err) {
        console.warn("upgradeUnifiedAppearanceEdit failed", err);
    }
    if (!window.__uaStructDelegationBound) {
        window.__uaStructDelegationBound = true;
        const handler = (ev) =>
            ev.target && ev.target.closest && ev.target.closest("[data-ua-structured]") && syncUnifiedStructured();
        document.addEventListener("change", handler),
            document.addEventListener("input", handler),
            document.addEventListener("click", (ev) => {
                ev.target &&
                    ev.target.closest &&
                    ev.target.closest("[data-ua-structured]") &&
                    ev.target.closest("[data-act]") &&
                    setTimeout(syncUnifiedStructured, 0);
            });
    }
}
function openUnifiedProfile(e, t = "overview") {
    const n = gameState.employees.find((t) => t.id === e);
    if (!n) return;
    n.skills || initializeEmployeeSocialData(n);
    let a = !1,
        o = !1,
        i = JSON.parse(JSON.stringify(n));
    (window.profileEditState.isEditMode = a),
        (window.profileEditState.hasUnsavedChanges = o),
        (window.profileEditState.editedData = i);
    const s = document.createElement("div");
    (s.id = "unifiedProfileModal"), (s.style.background = "var(--l-veil-85)");
    const r = () => {
            const e = gameState.employees.find((e) => e.id === n.id);
            if (!e) return '<p style="color:var(--danger);">Employee not found</p>';
            const t = a ? i : e;
            return `\n        <div style="display:flex; gap:20px; margin-bottom:20px; flex-wrap:wrap;">\n          <img src="${e.profileImage || placeholderImage(150, 150)}" \n            style="width:120px; height:120px; border-radius:10px; object-fit:cover; flex-shrink:0;">\n          <div style="flex:1; min-width:250px;">\n            ${window.profileEditState.isEditMode ? `\n              <input type="text" \n                value="${t.name || ""}" \n                onchange="window.profileEditState.editedData.name = this.value.trim(); markProfileChange();"\n                style="margin:0 0 8px 0; font-size:1.5rem; font-weight:600; background:var(--surface); border:1px solid var(--accent); color:${getGenderColor(t.gender || e.gender || "female")}; padding:8px 12px; border-radius:6px; width:100%; font-family:inherit;" id="profileNameInput"\n                placeholder="Enter name..."\n                maxlength="50">\n            ` : `\n              <h2 style="margin:0 0 8px 0;">${getColoredName(e)}</h2>\n            `}\n            <p style="margin:0; color:var(--text-dim);">${e.age || "N/A"} • ${e.gender || "Female"}${e.race && "human" !== e.race ? ` • ${e.race.charAt(0).toUpperCase() + e.race.slice(1)}` : ""}${"human" === e.race && e.ethnicity ? ` • ${formatEthnicity(e.ethnicity)}` : ""}</p>\n            <p style="margin:4px 0 0 0; color:var(--accent); font-weight:600;">${e.position || "Employee"}</p>\n            ${e.productManaged ? `<p style="margin:4px 0 0 0; color:var(--text-dim);">Managing: ${e.productManaged}</p>` : ""}\n          </div>\n        </div>\n        \n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Quick Stats</h4>\n          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:10px;">\n            <div><span style="color:var(--text-dim);">Affection:</span> <strong style="color:var(--danger);">${Math.round(e.stats?.affection || 0)}%</strong></div>\n            <div><span style="color:var(--text-dim);">Trust:</span> <strong style="color:var(--accent);">${Math.round(e.stats?.trust || 0)}%</strong></div>\n            <div><span style="color:var(--text-dim);">Productivity:</span> <strong style="color:var(--accent-gold);">${Math.round(e.stats?.productivity || 0)}%</strong></div>\n          </div>\n        </div>\n        \n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Biography</h4>\n          ${window.profileEditState.isEditMode ? `\n            <textarea onchange="window.profileEditState.editedData.bio = this.value; markProfileChange();"\n              style="width:100%; min-height:150px; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:10px; border-radius:4px; resize:vertical; line-height:1.6; font-family:inherit;"\n              placeholder="Enter biography...">${t.bio || ""}</textarea>\n          ` : `\n            <p style="margin:0; line-height:1.6;">${t.bio || '<em style="color:var(--text-dim);">No biography set</em>'}</p>\n          `}\n        </div>\n        \n        \x3c!-- Nickname for Player --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">💬 What They Call You</h4>\n          ${window.profileEditState.isEditMode ? `\n            <input type="text" \n              value="${e.nicknameForPlayer || ""}"\n              onchange="window.profileEditState.editedData.nicknameForPlayer = this.value.trim() || null; markProfileChange();"\n              style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:10px; border-radius:4px; font-family:inherit;"\n              placeholder="Leave blank for 'Boss', or enter a custom name like 'Sir', 'Daddy', 'Sweetie'...">\n            <p style="margin:8px 0 0 0; font-size:0.75rem; color:var(--text-mute);">This overrides the default - they'll always use this name for you in conversations.</p>\n          ` : `\n            <p style="margin:0; color:var(--accent); font-size:1.1rem;">\n              ${e.nicknameForPlayer ? `<strong>"${e.nicknameForPlayer}"</strong> <span style="color:var(--text-mute); font-size:0.85rem;">(custom)</span>` : '<span style="color:var(--text-mute);">Boss (default)</span>'}\n            </p>\n          `}\n        </div>\n        \n        \x3c!-- What You Call Them (Player's nickname for this employee) --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">🏷️ What You Call Them</h4>\n          ${window.profileEditState.isEditMode ? `\n            <input type="text" \n              value="${e.nicknameFromPlayer || ""}"\n              onchange="window.profileEditState.editedData.nicknameFromPlayer = this.value.trim() || null; markProfileChange();"\n              style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:10px; border-radius:4px; font-family:inherit;"\n              placeholder="Your personal nickname for them (e.g., 'Abby', 'Sweetie', 'Princess')...">\n            <p style="margin:8px 0 0 0; font-size:0.75rem; color:var(--text-mute);">A personal nickname you use for this character. Displayed in chat and other UI.</p>\n          ` : `\n            <p style="margin:0; color:var(--accent); font-size:1.1rem;">\n              ${e.nicknameFromPlayer ? `<strong>"${e.nicknameFromPlayer}"</strong> <span style="color:var(--text-mute); font-size:0.85rem;">(your nickname)</span>` : `<span style="color:var(--text-mute);">${e.name} (default)</span>`}\n            </p>\n          `}\n        </div>\n        \n        \x3c!-- Sexual Orientation --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">💕 Sexual Orientation</h4>\n          ${
                    window.profileEditState.isEditMode
                        ? `\n            <select \n              onchange="if(!window.profileEditState.editedData.personalLife) window.profileEditState.editedData.personalLife = {}; window.profileEditState.editedData.personalLife.sexualOrientation = this.value; markProfileChange();"\n              style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:10px; border-radius:4px; font-family:inherit; cursor:pointer;">\n              <option value="straight" ${"straight" === (e.personalLife?.sexualOrientation || "straight") ? "selected" : ""}>Straight/Heterosexual</option>\n              <option value="bisexual" ${"bisexual" === e.personalLife?.sexualOrientation ? "selected" : ""}>Bisexual</option>\n              <option value="gay" ${"gay" === e.personalLife?.sexualOrientation ? "selected" : ""}>Gay</option>\n              <option value="lesbian" ${"lesbian" === e.personalLife?.sexualOrientation ? "selected" : ""}>Lesbian</option>\n              <option value="pansexual" ${"pansexual" === e.personalLife?.sexualOrientation ? "selected" : ""}>Pansexual</option>\n              <option value="asexual" ${"asexual" === e.personalLife?.sexualOrientation ? "selected" : ""}>Asexual</option>\n              <option value="demisexual" ${"demisexual" === e.personalLife?.sexualOrientation ? "selected" : ""}>Demisexual</option>\n              <option value="queer" ${"queer" === e.personalLife?.sexualOrientation ? "selected" : ""}>Queer</option>\n            </select>\n            <p style="margin:8px 0 0 0; font-size:0.75rem; color:var(--text-mute);">Core identity trait that strongly influences romantic interactions and attraction.</p>\n          `
                        : `\n            <p style="margin:0; color:var(--l-pink); font-size:1.1rem;">\n              <strong>${(() => {
                              const t = e.personalLife?.sexualOrientation || "straight";
                              return (
                                  {
                                      straight: "Straight/Heterosexual",
                                      bisexual: "Bisexual",
                                      gay: "Gay",
                                      lesbian: "Lesbian",
                                      pansexual: "Pansexual",
                                      asexual: "Asexual",
                                      demisexual: "Demisexual",
                                      queer: "Queer",
                                  }[t] || t.charAt(0).toUpperCase() + t.slice(1)
                              );
                          })()}</strong>\n            </p>\n          `
                }\n        </div>\n        \n        \x3c!-- Relationship Status (Significant Other) --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">💍 Relationship Status</h4>\n          ${
                    window.profileEditState.isEditMode
                        ? `\n            <select id="profileRelationshipStatus"\n              onchange="updateProfileRelationshipStatus(this.value);"\n              style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:10px; border-radius:4px; font-family:inherit; cursor:pointer; margin-bottom:10px;">\n              <option value="single" ${e.personalLife?.significantOther ? "" : "selected"}>Single</option>\n              <option value="dating" ${"dating" === e.personalLife?.significantOther?.relationshipType ? "selected" : ""}>Dating Someone</option>\n              <option value="serious" ${"serious" === e.personalLife?.significantOther?.relationshipType ? "selected" : ""}>Serious Relationship</option>\n              <option value="engaged" ${"engaged" === e.personalLife?.significantOther?.relationshipType ? "selected" : ""}>Engaged</option>\n              <option value="married" ${"married" === e.personalLife?.significantOther?.relationshipType ? "selected" : ""}>Married</option>\n            </select>\n            <div id="profilePartnerDetails" style="display:${e.personalLife?.significantOther ? "block" : "none"}; padding:10px; background:rgba(255,215,0,0.1); border-radius:6px; border:1px solid rgba(255,215,0,0.3);">\n              <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:8px;">👤 Partner Details</label>\n              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">\n                <input type="text" id="profilePartnerName" placeholder="Partner's Name" \n                  value="${e.personalLife?.significantOther?.name || ""}"\n                  onchange="updateProfilePartnerField('name', this.value.trim());"\n                  style="padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink);">\n                <select id="profilePartnerGender" \n                  onchange="updateProfilePartnerField('gender', this.value);"\n                  style="padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink);">\n                  <option value="male" ${"male" === (e.personalLife?.significantOther?.gender || "male") ? "selected" : ""}>Male</option>\n                  <option value="female" ${"female" === e.personalLife?.significantOther?.gender ? "selected" : ""}>Female</option>\n                </select>\n              </div>\n              <input type="text" id="profilePartnerOccupation" placeholder="Partner's Occupation" \n                value="${e.personalLife?.significantOther?.occupation || ""}"\n                onchange="updateProfilePartnerField('occupation', this.value.trim());"\n                style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); box-sizing:border-box;">\n            </div>\n            <p style="margin:8px 0 0 0; font-size:0.75rem; color:var(--text-mute);">Whether this character has a significant other outside of work. Affects conversations and availability.</p>\n          `
                        : `\n            ${
                              e.personalLife?.significantOther
                                  ? `\n              <div style="display:flex; align-items:center; gap:12px;">\n                <div style="width:40px; height:40px; background:${"female" === e.personalLife.significantOther.gender ? "var(--l-red)" : "var(--l-cyan)"}; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">\n                  ${"female" === e.personalLife.significantOther.gender ? "♀" : "♂"}\n                </div>\n                <div>\n                  <p style="margin:0; color:var(--l-ink); font-weight:600;">${e.personalLife.significantOther.name}</p>\n                  <p style="margin:2px 0 0 0; color:var(--text-dim); font-size:0.85rem;">\n                    ${(() => {
                                        const t = e.personalLife.significantOther.relationshipType;
                                        return (
                                            {
                                                dating: "Dating",
                                                serious: "In Serious Relationship",
                                                engaged: "Engaged",
                                                married: "Married",
                                            }[t] || t
                                        );
                                    })()}\n                    ${e.personalLife.significantOther.yearsTogether ? ` • ${e.personalLife.significantOther.yearsTogether} year${1 !== e.personalLife.significantOther.yearsTogether ? "s" : ""}` : ""}\n                  </p>\n                  <p style="margin:2px 0 0 0; color:var(--text-mute); font-size:0.8rem;">${e.personalLife.significantOther.occupation || "Unknown occupation"}</p>\n                </div>\n              </div>\n            `
                                  : '\n              <p style="margin:0; color:var(--text-mute); font-style:italic;">Single - no significant other</p>\n            '
                          }\n          `
                }\n        </div>\n        \n        ${e.personalityTraits ? `\n          <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Personality Traits</h4>\n            <div style="display:flex; flex-wrap:wrap; gap:8px;">\n              ${e.personalityTraits.map((e) => `\n                <span style="background:var(--surface); padding:6px 12px; border-radius:6px; color:var(--accent);">\n                  ${e}\n                </span>\n              `).join("")}\n            </div>\n          </div>\n        ` : ""}\n        \n        ${e.hobbies ? `\n          <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Hobbies & Interests</h4>\n            <div style="display:flex; flex-wrap:wrap; gap:8px;">\n              ${e.hobbies.map((e) => `\n                <span style="background:var(--surface); padding:6px 12px; border-radius:6px; color:var(--positive);">\n                  ${e}\n                </span>\n              `).join("")}\n            </div>\n          </div>\n        ` : ""}\n        \n        \x3c!-- Pets Section - Always show in edit mode, or when pets exist --\x3e\n        ${window.profileEditState.isEditMode || e.personalLife?.livingSituation?.pets?.length > 0 ? `\n          <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">🐾 Pets</h4>\n            ${window.profileEditState.isEditMode ? `\n              <div id="petsEditContainer">\n                ${(e.personalLife?.livingSituation?.pets || []).map((e, t) => `\n                  <div class="pet-edit-row" style="display:flex; gap:8px; margin-bottom:8px; align-items:center;">\n                    <input type="text" value="${e.name}" placeholder="Pet name" \n                      onchange="updatePetData(${t}, 'name', this.value)"\n                      style="flex:1; padding:8px; background:var(--surface); border:1px solid var(--accent); border-radius:4px; color:var(--l-ink);">\n                    <input type="text" value="${e.type}" placeholder="Type (cat, dog...)" \n                      onchange="updatePetData(${t}, 'type', this.value)"\n                      style="flex:1; padding:8px; background:var(--surface); border:1px solid var(--accent); border-radius:4px; color:var(--l-ink);">\n                    ${"boss" === e.giftedBy ? '<span style="color:var(--accent-gold); padding:0 8px;">🎁</span>' : ""}\n                    <button onclick="removePet(${t})" style="background:var(--l-red); border:none; padding:8px 12px; border-radius:4px; color:var(--l-ink-on-fill); cursor:pointer;">✕</button>\n                  </div>\n                `).join("")}\n              </div>\n              <button onclick="addNewPet()" style="margin-top:8px; background:var(--l-green); border:none; padding:8px 16px; border-radius:4px; color:var(--l-on-accent); font-weight:600; cursor:pointer;">\n                ➕ Add Pet\n              </button>\n              <p style="margin:8px 0 0 0; font-size:0.75rem; color:var(--text-mute);">Add, edit, or remove pets. Gifted pets (🎁) were given by you.</p>\n            ` : `\n              <div style="display:flex; flex-wrap:wrap; gap:10px;">\n                ${e.personalLife.livingSituation.pets.map((e) => `\n                  <div style="background:var(--surface); padding:10px 15px; border-radius:8px; border-left:3px solid var(--positive);">\n                    <strong style="color:var(--positive);">${e.name}</strong>\n                    <span style="color:var(--text-dim); margin-left:8px;">• ${e.type}</span>\n                    ${"boss" === e.giftedBy ? '<span style="color:var(--accent-gold); margin-left:8px;">🎁</span>' : ""}\n                  </div>\n                `).join("")}\n              </div>\n            `}\n          </div>\n        ` : ""}\n        \n        ${e.personalLife?.livingSituation?.type ? `\n          <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">🏠 Living Situation</h4>\n            <p style="margin:0; color:var(--accent);">\n              <strong>${e.personalLife.livingSituation.type.charAt(0).toUpperCase() + e.personalLife.livingSituation.type.slice(1)}</strong>\n              ${e.personalLife.livingSituation.hasRoommate ? " (has roommate)" : ""}\n            </p>\n            ${e.giftedPossessions?.homeUpgrades?.length > 0 ? `\n              <div style="margin-top:8px; padding-top:8px; border-top:1px solid var(--l-panel-2);">\n                <small style="color:var(--text-dim);">Gifted upgrades:</small>\n                ${e.giftedPossessions.homeUpgrades.map((e) => `\n                  <div style="margin-top:4px; color:var(--accent-gold);">🎁 ${e.item}</div>\n                `).join("")}\n              </div>\n            ` : ""}\n          </div>\n        ` : ""}\n        \n        ${e.giftedPossessions?.vehicles?.length > 0 ? `\n          <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">🚗 Vehicles</h4>\n            ${e.giftedPossessions.vehicles.map((e) => `\n              <div style="background:var(--surface); padding:10px; border-radius:6px; margin-bottom:8px; border-left:3px solid var(--danger);">\n                <strong style="color:var(--danger);">${e.item}</strong>\n                <span style="color:var(--text-dim); margin-left:8px;">• ${e.type}</span>\n                <span style="color:var(--accent-gold); margin-left:8px;">🎁 $${e.price.toLocaleString()}</span>\n              </div>\n            `).join("")}\n          </div>\n        ` : ""}\n      `;
        },
        l = (e) => {
            switch (e) {
                case "overview":
                case "bio":
                default:
                    return r();
                case "stats":
                    return (() => {
                        const e = a ? i.stats || {} : n.stats || {};
                        return `\n        <h3 style="margin:0 0 15px 0; color:var(--accent);">Relationship Statistics</h3>\n        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:15px;">\n          ${Object.entries(
                                {
                                    affection: {
                                        label: "Affection",
                                        color: "var(--l-red)",
                                        icon: "❤️",
                                        desc: "How much they like you personally",
                                    },
                                    comfort: {
                                        label: "Comfort",
                                        color: "var(--l-green)",
                                        icon: "😊",
                                        desc: "How relaxed they feel around you",
                                    },
                                    trust: {
                                        label: "Trust",
                                        color: "var(--l-cyan)",
                                        icon: "🤝",
                                        desc: "How much they believe in you",
                                    },
                                    desire: {
                                        label: "Desire",
                                        color: "var(--l-pink)",
                                        icon: "💕",
                                        desc: "Romantic/sexual attraction level",
                                    },
                                    obedience: {
                                        label: "Obedience",
                                        color: "var(--l-violet)",
                                        icon: "🔗",
                                        desc: "Willingness to follow directions",
                                    },
                                    productivity: {
                                        label: "Productivity",
                                        color: "var(--l-gold)",
                                        icon: "💼",
                                        desc: "Work efficiency and output",
                                    },
                                }
                            )
                                .map(
                                    ([t, n]) =>
                                        `\n            <div style="background:var(--surface-2); padding:15px; border-radius:8px;">\n              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">\n                <span style="color:var(--text-dim);">${n.icon} ${n.label}</span>\n                ${a ? `\n                  <div style="display:flex; align-items:center; gap:5px;">\n                    <button onclick="\n                      const val = Math.max(0, (window.profileEditState.editedData.stats.${t} || 0) - 5);\n                      window.profileEditState.editedData.stats.${t} = val;\n                      this.nextElementSibling.value = val;\n                      markProfileChange();\n                    " style="background:var(--surface); border:none; color:var(--l-ink); padding:4px 8px; border-radius:4px; cursor:pointer;">−</button>\n                    <input type="number" value="${Math.round(e[t] || 0)}" min="0" max="100" \n                      onchange="window.profileEditState.editedData.stats.${t} = Math.min(100, Math.max(0, parseFloat(this.value) || 0)); markProfileChange();"\n                      style="width:60px; background:var(--surface); border:1px solid ${n.color}; color:${n.color}; padding:4px 8px; border-radius:4px; text-align:center; font-size:1.1rem; font-weight:600;">\n                    <button onclick="\n                      const val = Math.min(100, (window.profileEditState.editedData.stats.${t} || 0) + 5);\n                      window.profileEditState.editedData.stats.${t} = val;\n                      this.previousElementSibling.value = val;\n                      markProfileChange();\n                    " style="background:var(--surface); border:none; color:var(--l-ink); padding:4px 8px; border-radius:4px; cursor:pointer;">+</button>\n                  </div>\n                ` : `\n                  <strong style="color:${n.color}; font-size:1.3rem;">${Math.round(e[t] || 0)}%</strong>\n                `}\n              </div>\n              <div style="background:var(--surface); height:8px; border-radius:4px; overflow:hidden;">\n                <div style="background:${n.color}; height:100%; width:${e[t] || 0}%; transition:width 0.3s;"></div>\n              </div>\n              <p style="margin:8px 0 0 0; font-size:0.85rem; color:var(--text-dim);">${n.desc}</p>\n            </div>\n          `
                                )
                                .join(
                                    ""
                                )}\n        </div>\n        \n        \x3c!-- Intimacy Level (calculated field) --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-top:15px;">\n          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">\n            <span style="color:var(--text-dim);">🔥 Overall Intimacy Level</span>\n            ${a ? `\n              <div style="display:flex; align-items:center; gap:5px;">\n                <button onclick="\n                  if (!window.profileEditState.editedData.memory) window.profileEditState.editedData.memory = {};\n                  const val = Math.max(0, (window.profileEditState.editedData.memory.intimacyLevel || 0) - 5);\n                  window.profileEditState.editedData.memory.intimacyLevel = val;\n                  this.nextElementSibling.value = val;\n                  markProfileChange();\n                " style="background:var(--surface); border:none; color:var(--l-ink); padding:4px 8px; border-radius:4px; cursor:pointer;">−</button>\n                <input type="number" value="${Math.round((n.memory && n.memory.intimacyLevel) || 0)}" min="0" max="100" \n                  onchange="\n                    if (!window.profileEditState.editedData.memory) window.profileEditState.editedData.memory = {};\n                    window.profileEditState.editedData.memory.intimacyLevel = Math.min(100, Math.max(0, parseFloat(this.value) || 0));\n                    markProfileChange();\n                  "\n                  style="width:60px; background:var(--surface); border:1px solid var(--l-pink); color:var(--l-pink); padding:4px 8px; border-radius:4px; text-align:center; font-size:1.1rem; font-weight:600;">\n                <button onclick="\n                  if (!window.profileEditState.editedData.memory) window.profileEditState.editedData.memory = {};\n                  const val = Math.min(100, (window.profileEditState.editedData.memory.intimacyLevel || 0) + 5);\n                  window.profileEditState.editedData.memory.intimacyLevel = val;\n                  this.previousElementSibling.value = val;\n                  markProfileChange();\n                " style="background:var(--surface); border:none; color:var(--l-ink); padding:4px 8px; border-radius:4px; cursor:pointer;">+</button>\n              </div>\n            ` : `\n              <strong style="color:var(--l-pink); font-size:1.3rem;">${Math.round((n.memory && n.memory.intimacyLevel) || 0)}%</strong>\n            `}\n          </div>\n          <div style="background:var(--surface); height:8px; border-radius:4px; overflow:hidden;">\n            <div style="background:var(--l-pink); height:100%; width:${(n.memory && n.memory.intimacyLevel) || 0}%; transition:width 0.3s;"></div>\n          </div>\n          <p style="margin:8px 0 0 0; font-size:0.85rem; color:var(--text-dim);">Combined measure of emotional and physical closeness (calculated from affection, comfort, desire)</p>\n        </div>\n      `;
                    })();
                case "skills":
                    return (() => {
                        const e = a ? i.skills || {} : n.skills || {};
                        return `\n        <h3 style="margin:0 0 15px 0; color:var(--accent);">Skills & Progression</h3>\n        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:15px;">\n          ${Object.entries(
                                {
                                    technical: { icon: "💻", color: "var(--l-cyan)", label: "Technical" },
                                    creative: { icon: "🎨", color: "var(--l-red)", label: "Creative" },
                                    social: { icon: "🤝", color: "var(--l-green)", label: "Social" },
                                    management: { icon: "📊", color: "var(--l-gold)", label: "Management" },
                                    intimate: { icon: "💋", color: "var(--l-pink)", label: "Intimate" },
                                    cooking: { icon: "🍳", color: "var(--l-amber-5)", label: "Cooking" },
                                    fitness: { icon: "💪", color: "#2ec4b6", label: "Fitness" },
                                }
                            )
                                .map(([t, n]) => {
                                    const o = e[t] || { level: 0, xp: 0, maxXp: 500 },
                                        i = o.maxXp > 0 ? (o.xp / o.maxXp) * 100 : 0;
                                    return `\n              <div style="background:var(--surface-2); padding:15px; border-radius:8px;">\n                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">\n                  <span style="color:var(--text-dim);">${n.icon} ${n.label}</span>\n                  ${a ? `\n                    <div style="display:flex; align-items:center; gap:5px;">\n                      <button onclick="\n                        if (!window.profileEditState.editedData.skills.${t}) window.profileEditState.editedData.skills.${t} = {level:0, xp:0, maxXp:500};\n                        window.profileEditState.editedData.skills.${t}.level = Math.max(0, window.profileEditState.editedData.skills.${t}.level - 1);\n                        this.nextElementSibling.textContent = 'Lv ' + window.profileEditState.editedData.skills.${t}.level;\n                        markProfileChange();\n                      " style="background:var(--surface); border:none; color:var(--l-ink); padding:4px 8px; border-radius:4px; cursor:pointer;">−</button>\n                      <span style="color:${n.color}; font-size:1.2rem; font-weight:600; min-width:50px; text-align:center;">Lv ${o.level}</span>\n                      <button onclick="\n                        if (!window.profileEditState.editedData.skills.${t}) window.profileEditState.editedData.skills.${t} = {level:0, xp:0, maxXp:500};\n                        window.profileEditState.editedData.skills.${t}.level = Math.min(10, window.profileEditState.editedData.skills.${t}.level + 1);\n                        this.previousElementSibling.textContent = 'Lv ' + window.profileEditState.editedData.skills.${t}.level;\n                        markProfileChange();\n                      " style="background:var(--surface); border:none; color:var(--l-ink); padding:4px 8px; border-radius:4px; cursor:pointer;">+</button>\n                    </div>\n                  ` : `\n                    <strong style="color:${n.color}; font-size:1.2rem;">Lv ${o.level}</strong>\n                  `}\n                </div>\n                ${a ? `\n                  <div style="margin-bottom:8px;">\n                    <label style="font-size:0.8rem; color:var(--text-dim); display:block; margin-bottom:4px;">XP:</label>\n                    <input type="number" value="${o.xp}" min="0" max="${o.maxXp}"\n                      onchange="\n                        if (!window.profileEditState.editedData.skills.${t}) window.profileEditState.editedData.skills.${t} = {level:0, xp:0, maxXp:500};\n                        window.profileEditState.editedData.skills.${t}.xp = Math.min(${o.maxXp}, Math.max(0, parseFloat(this.value) || 0));\n                        markProfileChange();\n                      "\n                      style="width:100%; background:var(--surface); border:1px solid ${n.color}; color:var(--l-ink); padding:6px; border-radius:4px;">\n                  </div>\n                ` : `\n                  <div style="background:var(--surface); height:8px; border-radius:4px; overflow:hidden; margin-bottom:4px;">\n                    <div style="background:${n.color}; height:100%; width:${i}%; transition:width 0.3s;"></div>\n                  </div>\n                  <p style="margin:0; font-size:0.8rem; color:var(--text-dim);">${o.xp} / ${o.maxXp} XP</p>\n                `}\n              </div>\n            `;
                                })
                                .join(
                                    ""
                                )}\n        </div>\n        \n        ${n.specializations && n.specializations.length > 0 ? `\n          <div style="margin-top:20px; background:var(--surface-2); padding:15px; border-radius:8px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">🌟 Specializations</h4>\n            <div style="display:flex; flex-wrap:wrap; gap:8px;">\n              ${n.specializations.map((e) => `\n                <span style="background:var(--surface); padding:6px 12px; border-radius:6px; border:1px solid var(--accent-gold); color:var(--accent-gold); font-size:0.9rem;">\n                  ${e}\n                </span>\n              `).join("")}\n            </div>\n          </div>\n        ` : ""}\n      `;
                    })();
                case "possessions":
                    return (() => {
                        const e = gameState.employees.find((e) => e.id === n.id);
                        if (!e) return '<p style="color:var(--danger);">Employee not found</p>';
                        const t = e.giftedPossessions || {},
                            a = e.giftPreferences?.recentGifts || [];
                        return (t.wardrobe?.length || 0) +
                            (t.jewelry?.length || 0) +
                            (t.vehicles?.length || 0) +
                            (t.homeUpgrades?.length || 0) +
                            (t.experiences?.length || 0) +
                            (t.tech?.length || 0) +
                            (t.other?.length || 0) +
                            a.length >
                            0
                            ? `\n        <h3 style="margin:0 0 15px 0; color:var(--accent);">🎁 Gifted Possessions</h3>\n        \n        ${
                                      a.length > 0
                                          ? `\n          <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">📜 All Gifts Received</h4>\n            <p style="margin:0 0 10px 0; color:var(--text-dim); font-size:0.85rem;">\n              Total: ${a.length} gift${1 !== a.length ? "s" : ""} • \n              Worth: $${a.reduce((e, t) => e + (t.price || 0), 0).toLocaleString()}\n            </p>\n            <div style="display:grid; gap:8px; max-height:400px; overflow-y:auto;">\n              ${a
                                                .slice()
                                                .reverse()
                                                .map((e) => {
                                                    const t = GIFT_CATEGORIES[e.category],
                                                        n = t?.emoji || "🎁",
                                                        a = t?.name || e.category,
                                                        o = new Date(e.timestamp).toLocaleDateString(),
                                                        i =
                                                            "delighted" === e.reaction
                                                                ? "var(--l-green)"
                                                                : "grateful" === e.reaction
                                                                  ? "var(--l-cyan)"
                                                                  : "confused" === e.reaction
                                                                    ? "var(--l-gold)"
                                                                    : "underwhelmed" === e.reaction
                                                                      ? "var(--l-amber-5)"
                                                                      : "suspicious" === e.reaction
                                                                        ? "var(--l-red)"
                                                                        : "overwhelmed" === e.reaction
                                                                          ? "var(--l-violet)"
                                                                          : "var(--l-ink-dim-2)",
                                                        s = e.reaction
                                                            ? e.reaction.charAt(0).toUpperCase() + e.reaction.slice(1)
                                                            : "Neutral";
                                                    return `\n                  <div style="background:var(--surface); padding:10px; border-radius:6px; border-left:3px solid ${i};">\n                    <div style="display:flex; justify-content:space-between; align-items:start; flex-wrap:wrap; gap:8px;">\n                      <div style="flex:1; min-width:200px;">\n                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">\n                          <span style="font-size:1.2rem;">${n}</span>\n                          <strong style="color:var(--l-ink);">${e.name}</strong>\n                        </div>\n                        <div style="font-size:0.8rem; color:var(--text-dim);">\n                          ${a} • ${o} • \n                          <span style="color:${i};">${s}</span>\n                        </div>\n                      </div>\n                      <span style="color:var(--accent-gold); font-weight:600; white-space:nowrap;">$${e.price.toLocaleString()}</span>\n                    </div>\n                  </div>\n                `;
                                                })
                                                .join("")}\n            </div>\n          </div>\n        `
                                          : ""
                                  }\n        \n        ${(t.wardrobe?.length || 0) + (t.jewelry?.length || 0) + (t.vehicles?.length || 0) + (t.homeUpgrades?.length || 0) + (t.experiences?.length || 0) + (t.tech?.length || 0) + (t.other?.length || 0) > 0 ? '\n          <h4 style="margin:20px 0 15px 0; color:var(--accent);">📦 Categorized Possessions</h4>\n        ' : ""}\n        \n        ${t.wardrobe?.length > 0 ? `\n          <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">👗 Wardrobe</h4>\n            <div style="display:grid; gap:10px;">\n              ${t.wardrobe.map((e) => `\n                <div style="background:var(--surface); padding:12px; border-radius:6px; border-left:3px solid var(--l-pink);">\n                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">\n                    <div>\n                      <strong style="color:var(--l-pink);">${e.item}</strong>\n                      <span style="color:var(--text-dim); margin-left:10px;">Wears ${(100 * e.wearChance).toFixed(0)}% of the time</span>\n                    </div>\n                    <span style="color:var(--accent-gold);">$${e.price.toLocaleString()}</span>\n                  </div>\n                </div>\n              `).join("")}\n            </div>\n          </div>\n        ` : ""}\n        \n        ${t.jewelry?.length > 0 ? `\n          <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">💎 Jewelry</h4>\n            <div style="display:grid; gap:10px;">\n              ${t.jewelry.map((e) => `\n                <div style="background:var(--surface); padding:12px; border-radius:6px; border-left:3px solid var(--danger);">\n                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">\n                    <div>\n                      <strong style="color:var(--danger);">${e.item}</strong>\n                      <span style="color:var(--text-dim); margin-left:10px;">• ${e.type}</span>\n                      <span style="color:var(--text-dim); margin-left:10px;">Wears ${(100 * e.wearChance).toFixed(0)}% of the time</span>\n                    </div>\n                    <span style="color:var(--accent-gold);">$${e.price.toLocaleString()}</span>\n                  </div>\n                </div>\n              `).join("")}\n            </div>\n          </div>\n        ` : ""}\n        \n        ${t.vehicles?.length > 0 ? `\n          <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">🚗 Vehicles</h4>\n            <div style="display:grid; gap:10px;">\n              ${t.vehicles.map((e) => `\n                <div style="background:var(--surface); padding:12px; border-radius:6px; border-left:3px solid var(--accent);">\n                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">\n                    <div>\n                      <strong style="color:var(--accent);">${e.item}</strong>\n                      <span style="color:var(--text-dim); margin-left:10px;">• ${e.type}</span>\n                    </div>\n                    <span style="color:var(--accent-gold);">$${e.price.toLocaleString()}</span>\n                  </div>\n                </div>\n              `).join("")}\n            </div>\n          </div>\n        ` : ""}\n        \n        ${t.tech?.length > 0 ? `\n          <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">📱 Tech & Gadgets</h4>\n            <div style="display:grid; gap:10px;">\n              ${t.tech.map((e) => `\n                <div style="background:var(--surface); padding:12px; border-radius:6px; border-left:3px solid var(--positive);">\n                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">\n                    <div>\n                      <strong style="color:var(--positive);">${e.item}</strong>\n                      <span style="color:var(--text-dim); margin-left:10px;">• ${e.type}</span>\n                      ${e.inUse ? '<span style="color:var(--positive); margin-left:10px;">✓ In use</span>' : ""}\n                    </div>\n                    <span style="color:var(--accent-gold);">$${e.price.toLocaleString()}</span>\n                  </div>\n                </div>\n              `).join("")}\n            </div>\n          </div>\n        ` : ""}\n        \n        ${t.experiences?.length > 0 ? `\n          <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">✈️ Experiences & Memories</h4>\n            <div style="display:grid; gap:10px;">\n              ${t.experiences.map((e) => `\n                <div style="background:var(--surface); padding:12px; border-radius:6px; border-left:3px solid var(--l-violet);">\n                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">\n                    <div>\n                      <strong style="color:var(--l-violet);">${e.item}</strong>\n                      <span style="color:var(--text-dim); margin-left:10px;">Memory strength: ${"⭐".repeat(Math.min(5, e.memoryStrength))}</span>\n                    </div>\n                    <span style="color:var(--accent-gold);">$${e.price.toLocaleString()}</span>\n                  </div>\n                </div>\n              `).join("")}\n            </div>\n          </div>\n        ` : ""}\n        \n        ${t.other?.length > 0 ? `\n          <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">🎁 Other Gifts</h4>\n            <div style="display:grid; gap:10px;">\n              ${t.other.map((e) => `\n                <div style="background:var(--surface); padding:12px; border-radius:6px;">\n                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">\n                    <div>\n                      <strong style="color:var(--l-ink);">${e.item}</strong>\n                      <span style="color:var(--text-dim); margin-left:10px;">• ${e.category}</span>\n                    </div>\n                    <span style="color:var(--accent-gold);">$${e.price.toLocaleString()}</span>\n                  </div>\n                </div>\n              `).join("")}\n            </div>\n          </div>\n        ` : ""}\n        \n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-top:20px; border:2px dashed var(--l-cyan);">\n          <p style="margin:0; color:var(--text-dim); text-align:center;">\n            <strong style="color:var(--accent);">Pro Tip:</strong> Gifts affect more than just stats! \n            Clothing items may appear in their descriptions, vehicles change their lifestyle, \n            and pets become part of their family!\n          </p>\n        </div>\n      `
                            : `\n          <div style="text-align:center; padding:60px 20px; color:var(--text-dim);">\n            <div style="font-size:4rem; margin-bottom:20px;">🎁</div>\n            <h3 style="color:var(--accent); margin-bottom:10px;">No Gifts Yet</h3>\n            <p style="margin:0;">Gifts you give to ${e.name} will appear here and affect their life!</p>\n            <p style="margin-top:10px; color:var(--accent-gold);">Try gifting clothing, vehicles, or even a pet!</p>\n          </div>\n        `;
                    })();
                case "flags":
                    return (() => {
                        const e = gameState.employees.find((e) => e.id === n.id);
                        if (!e) return '<p style="color:var(--danger);">Employee not found</p>';
                        const t = getActiveFlags(e);
                        return `\n        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">\n          <h3 style="margin:0; color:var(--accent);">Active Flags</h3>\n          <button onclick="openFlagManagementModal(gameState.employees.find(function(emp) { return emp.id === '${jsAttr(e.id)}'; }))" \n            style="background:linear-gradient(135deg, var(--l-indigo) 0%, var(--l-indigo-deep) 100%); border:none; padding:10px 20px; border-radius:8px; color:var(--l-ink-on-fill); cursor:pointer; font-weight:600; font-size:0.95rem; box-shadow:0 2px 8px rgba(102,126,234,0.3); transition:all 0.2s;"\n            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102,126,234,0.5)';"\n            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(102,126,234,0.3)';">\n            🏷️ Manage Flags\n          </button>\n        </div>\n        ${t.length > 0 ? `\n          <div style="display:grid; gap:10px;">\n            ${t.map((t) => `\n              <div style="background:var(--surface-2); padding:12px; border-radius:8px; border-left:4px solid ${getPriorityColor(t.priority || "medium")};">\n                <div style="display:flex; justify-content:space-between; align-items:start;">\n                  <div style="flex:1;">\n                    <div style="font-weight:600; margin-bottom:4px;">\n                      ${t.emoji || "🏷️"} ${t.description || t.playerDescription || t.key || "Unnamed Flag"}\n                    </div>\n                    <div style="font-size:0.85rem; color:var(--text-dim);">\n                      Priority: ${t.priority || "medium"} • \n                      ${t.playerSet || "player" === t.source ? "Player-set" : "System"} • \n                      ${t.timestamp ? new Date(t.timestamp).toLocaleDateString() : "Unknown date"}\n                    </div>\n                    ${t.details || t.aiGuidance ? `<p style="margin:8px 0 0 0; color:var(--text); font-size:0.9rem;">${t.details || t.aiGuidance || ""}</p>` : ""}\n                  </div>\n                  ${a ? `\n                    <button onclick="removeFlagAndRefresh('${jsAttr(e.id)}', '${jsAttr(t.id || t.key)}')"\n                      style="background:var(--l-red); border:none; padding:6px 12px; border-radius:4px; color:var(--l-ink-on-fill); cursor:pointer; font-size:0.9rem; margin-left:10px; flex-shrink:0;">\n                      ✕ Remove\n                    </button>\n                  ` : ""}\n                </div>\n              </div>\n            `).join("")}\n          </div>\n        ` : '<p style="color:var(--text-dim); text-align:center; padding:40px 0;">No active flags. Click "Manage Flags" to add some!</p>'}\n      `;
                    })();
                case "schedule":
                    return (() => {
                        const e = a ? i.schedule || {} : n.schedule || {},
                            t =
                                (gameState.time,
                                timeHelpers && timeHelpers.getHour(),
                                !timeHelpers || !timeHelpers.isWeekend()),
                            o = e.isCurrentlyWorking || !1,
                            s = e.workDays || [1, 2, 3, 4, 5];
                        return `\n        <h3 style="margin:0 0 15px 0; color:var(--accent);">Work Schedule</h3>\n        \n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Current Status</h4>\n          <div style="font-size:1.2rem; margin-bottom:8px;">\n            ${o ? '✅ <strong style="color:var(--positive);">At Work</strong>' : '🏠 <strong style="color:var(--text-dim);">Off Duty</strong>'}\n          </div>\n          <p style="margin:0; color:var(--text-dim); font-size:0.9rem;">\n            Current time: ${timeHelpers ? timeHelpers.getFormattedTime() : "12:00 PM"} • \n            ${t ? "Weekday" : "Weekend"}\n          </p>\n        </div>\n        \n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Work Hours</h4>\n          ${
                                a
                                    ? `\n            <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">\n              <div style="flex:1;">\n                <label style="font-size:0.85rem; color:var(--text-dim); display:block; margin-bottom:4px;">Start Time:</label>\n                <select onchange="if(!window.profileEditState.editedData.schedule) window.profileEditState.editedData.schedule = {}; window.profileEditState.editedData.schedule.workStartHour = parseInt(this.value); markProfileChange();"\n                  style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:8px; border-radius:4px;">\n                  ${Array.from(
                                          { length: 13 },
                                          (e, t) => t + 6
                                      )
                                          .map(
                                              (t) =>
                                                  `\n                    <option value="${t}" ${(e.workStartHour || 9) === t ? "selected" : ""}>${t}:00</option>\n                  `
                                          )
                                          .join(
                                              ""
                                          )}\n                </select>\n              </div>\n              <div style="flex:1;">\n                <label style="font-size:0.85rem; color:var(--text-dim); display:block; margin-bottom:4px;">End Time:</label>\n                <select onchange="if(!window.profileEditState.editedData.schedule) window.profileEditState.editedData.schedule = {}; window.profileEditState.editedData.schedule.workEndHour = parseInt(this.value); markProfileChange();"\n                  style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:8px; border-radius:4px;">\n                  ${Array.from(
                                          { length: 11 },
                                          (e, t) => t + 14
                                      )
                                          .map(
                                              (t) =>
                                                  `\n                    <option value="${t}" ${(e.workEndHour || 17) === t ? "selected" : ""}>${t}:00</option>\n                  `
                                          )
                                          .join(
                                              ""
                                          )}\n                </select>\n              </div>\n            </div>\n          `
                                    : `\n            <p style="margin:0; font-size:1.1rem;">\n              ${e.workStartHour || 9}:00 - ${e.workEndHour || 17}:00\n            </p>\n          `
                            }\n          \n          ${a ? `\n            <div style="margin-top:15px;">\n              <label style="font-size:0.85rem; color:var(--text-dim); display:block; margin-bottom:8px;">Work Days:</label>\n              <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px;">\n                ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((e, t) => `\n                  <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:6px; background:${s.includes(t) ? "var(--l-panel-2)" : "transparent"}; border-radius:4px; border:1px solid ${s.includes(t) ? "var(--l-cyan)" : "var(--l-neutral-6)"};">\n                    <input type="checkbox" \n                      ${s.includes(t) ? "checked" : ""}\n                      onchange="\n                        if (!window.profileEditState.editedData.schedule) window.profileEditState.editedData.schedule = {};\n                        if (!window.profileEditState.editedData.schedule.workDays) window.profileEditState.editedData.schedule.workDays = [1,2,3,4,5];\n                        if (this.checked) {\n                          if (!window.profileEditState.editedData.schedule.workDays.includes(${t})) window.profileEditState.editedData.schedule.workDays.push(${t});\n                        } else {\n                          window.profileEditState.editedData.schedule.workDays = window.profileEditState.editedData.schedule.workDays.filter(d => d !== ${t});\n                        }\n                        markProfileChange();\n                        openUnifiedProfile('${n.id}', 'schedule');\n                      "\n                      style="cursor:pointer;">\n                    <span style="font-size:0.9rem; color:${s.includes(t) ? "var(--l-cyan)" : "var(--l-ink-dim-2)"};">${e.substring(0, 3)}</span>\n                  </label>\n                `).join("")}\n              </div>\n            </div>\n          ` : `\n            <p style="margin:8px 0 0 0; color:var(--text-dim); font-size:0.9rem;">\n              ${s.length} days per week\n            </p>\n          `}\n        </div>\n        \n        ${void 0 !== e.hoursWorkedToday ? `\n          <div style="background:var(--surface-2); padding:15px; border-radius:8px;">\n            <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Today's Progress</h4>\n            <div style="background:var(--surface); height:12px; border-radius:6px; overflow:hidden; margin-bottom:8px;">\n              <div style="background:var(--l-green); height:100%; width:${(e.hoursWorkedToday / 8) * 100}%; transition:width 0.3s;"></div>\n            </div>\n            <p style="margin:0; color:var(--text-dim);">${e.hoursWorkedToday || 0} / 8 hours worked</p>\n          </div>\n        ` : ""}\n      `;
                    })();
                case "social":
                    return (() => {
                        const e = n.social || {},
                            t =
                                gameState.socialNetwork?.posts?.filter((e) => e.authorId === n.id).slice(0, 10) ||
                                [];
                        return `\n        <h3 style="margin:0 0 15px 0; color:var(--accent);">Social Activity</h3>\n        \n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Profile Stats</h4>\n          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; text-align:center;">\n            <div>\n              <div style="font-size:1.5rem; color:var(--accent);">${e.postCount || 0}</div>\n              <div style="font-size:0.8rem; color:var(--text-dim);">Posts</div>\n            </div>\n            <div>\n              <div style="font-size:1.5rem; color:var(--danger);">${e.totalLikesReceived || 0}</div>\n              <div style="font-size:0.8rem; color:var(--text-dim);">Likes</div>\n            </div>\n            <div>\n              <div style="font-size:1.5rem; color:var(--positive);">${e.totalCommentsReceived || 0}</div>\n              <div style="font-size:0.8rem; color:var(--text-dim);">Comments</div>\n            </div>\n          </div>\n        </div>\n        \n        <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Recent Posts (${t.length})</h4>\n        ${t.length > 0 ? t.map((e) => `\n          <div onclick="openPostModal('${e.id}')" \n            style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:12px; cursor:pointer; transition:all 0.2s; border:2px solid transparent;"\n            onmouseover="this.style.borderColor='var(--l-cyan)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,212,255,0.3)';"\n            onmouseout="this.style.borderColor='transparent'; this.style.transform='translateY(0)'; this.style.boxShadow='none';">\n            \n            \x3c!-- Post Content --\x3e\n            <p style="margin:0 0 ${e.imageUrl ? "12px" : "8px"} 0; line-height:1.6; color:var(--l-ink);">${e.content || ""}</p>\n            \n            \x3c!-- Post Image (if exists) --\x3e\n            ${e.imageUrl ? `\n              <div style="margin-bottom:12px; border-radius:8px; overflow:hidden; max-height:400px; display:flex; align-items:center; justify-content:center; background:var(--l-black);">\n                <img src="${e.imageUrl}" \n                  style="width:100%; height:auto; max-height:400px; object-fit:contain; display:block;"\n                  alt="Post image">\n              </div>\n            ` : ""}\n            \n            \x3c!-- Post Metadata --\x3e\n            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:var(--text-dim);">\n              <div>\n                ${new Date(e.timestamp).toLocaleDateString()} ${new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}\n              </div>\n              <div style="display:flex; gap:15px; align-items:center;">\n                <span style="display:flex; align-items:center; gap:4px;">\n                  ❤️ <strong style="color:var(--danger);">${e.likes?.length || 0}</strong>\n                </span>\n                <span style="display:flex; align-items:center; gap:4px;">\n                  💬 <strong style="color:var(--positive);">${e.comments?.length || 0}</strong>\n                </span>\n              </div>\n            </div>\n            \n            \x3c!-- Click hint --\x3e\n            <div style="margin-top:8px; text-align:center; font-size:0.75rem; color:var(--accent); opacity:0.7;">\n              Click to view, like, or comment\n            </div>\n          </div>\n        `).join("") : '<p style="color:var(--text-dim); text-align:center; padding:20px 0;">No posts yet</p>'}\n        \n        ${t.length >= 10 ? '\n          <div style="text-align:center; margin-top:15px;">\n            <button onclick="switchTab(\'social\')" \n              style="padding:10px 20px; background:var(--l-cyan); border:none; border-radius:8px; color:var(--l-on-accent); font-weight:600; cursor:pointer; font-size:0.9rem;">\n              📱 View All Posts in Social Feed\n            </button>\n          </div>\n        ' : ""}\n      `;
                    })();
                case "relationship":
                    return (() => {
                        const e = gameState.employees
                            .filter((e) => e.id !== n.id && e.relationships && e.relationships[n.id])
                            .map((e) => {
                                const t = e.relationships[n.id];
                                return {
                                    name: e.name,
                                    type: t.type || "coworker",
                                    strength: Math.round(t.strength || 0),
                                    color: getColoredName(e),
                                };
                            })
                            .sort((e, t) => t.strength - e.strength)
                            .slice(0, 10);
                        return `\n        <h3 style="margin:0 0 15px 0; color:var(--accent);">Office Relationships</h3>\n        \n        ${e.length > 0 ? `\n          <div style="display:grid; gap:10px;">\n            ${e.map((e) => `\n              <div style="background:var(--surface-2); padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">\n                <div style="flex:0 0 auto;">\n                  ${e.color}\n                  <div style="color:var(--text-mute); font-size:0.8rem; margin-top:2px;">${e.type}</div>\n                </div>\n                <div style="flex:1; margin:0 15px;">\n                  <div style="background:var(--surface); height:8px; border-radius:4px; overflow:hidden;">\n                    <div style="background:${e.strength >= 70 ? "var(--l-green)" : e.strength >= 40 ? "var(--l-cyan)" : "var(--l-ink-dim-2)"}; height:100%; width:${e.strength}%; transition:width 0.3s;"></div>\n                  </div>\n                </div>\n                <strong style="color:${e.strength >= 70 ? "var(--l-green)" : e.strength >= 40 ? "var(--l-cyan)" : "var(--l-ink-dim-2)"};">${e.strength}</strong>\n              </div>\n            `).join("")}\n          </div>\n        ` : '<p style="color:var(--text-dim); text-align:center; padding:40px 0;">No relationships yet</p>'}\n        \n        <div style="margin-top:20px; background:var(--surface-2); padding:15px; border-radius:8px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Relationship Levels</h4>\n          <div style="font-size:0.9rem; color:var(--text-dim); line-height:1.8;">\n            <div>0-20: 😐 Strangers</div>\n            <div>20-40: 🙂 Acquaintances</div>\n            <div>40-60: 😊 Friends</div>\n            <div>60-80: 🤗 Close Friends</div>\n            <div>80-100: 💖 Best Friends</div>\n          </div>\n        </div>\n      `;
                    })();
                case "family":
                    return (() => {
                        const e = n.familyRelations || {},
                            t = Object.entries(e)
                                .map(([e, t]) => {
                                    const n = gameState.employees.find((t) => t.id === e);
                                    return n
                                        ? { employee: n, relationship: t, isFired: "alumni" === n.employmentStatus }
                                        : null;
                                })
                                .filter(Boolean);
                        return `\n        <h3 style="margin:0 0 15px 0; color:var(--accent);">👨‍👩‍👧 Family at Company</h3>\n        \n        <div style="margin-bottom:20px;">\n          <button onclick="showCreateFamilyMemberModal(gameState.employees.find(e => e.id === '${n.id}'))" \n            style="width:100%; padding:14px 20px; background:linear-gradient(135deg, var(--l-pink) 0%, var(--l-violet) 100%); \n                   border:none; border-radius:10px; color:var(--l-on-accent); font-weight:600; cursor:pointer; \n                   font-size:1rem; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:10px;">\n            <span style="font-size:1.2rem;">➕</span> Add Family Member\n          </button>\n          <p style="color:var(--text-mute); font-size:0.85rem; margin-top:8px; text-align:center;">\n            Create a relative who will be hired at the company\n          </p>\n        </div>\n        \n        ${
                                t.length > 0
                                    ? `\n          <div style="display:grid; gap:12px;">\n            ${t
                                          .map(({ employee: e, relationship: t, isFired: n }) => {
                                              return `\n              <div style="background:${n ? "var(--l-panel)" : "var(--l-line)"}; padding:15px; border-radius:10px; display:flex; align-items:center; gap:15px; cursor:pointer; transition:all 0.2s; border:1px solid ${n ? "var(--l-neutral-5)" : "transparent"}; ${n ? "opacity:0.7;" : ""}"\n                   onmouseover="this.style.borderColor='${n ? "var(--l-neutral-8)" : "var(--l-pink)"}'" \n                   onmouseout="this.style.borderColor='${n ? "var(--l-neutral-5)" : "transparent"}'"\n                   onclick="document.getElementById('unifiedProfileModal')?.remove(); openUnifiedProfile('${e.id}');">\n                <div style="position:relative; flex-shrink:0;">\n                  <img src="${e.profileImage || placeholderImage(60, 60)}" \n                       style="width:50px; height:50px; border-radius:8px; object-fit:cover; ${n ? "filter:grayscale(70%);" : ""}">\n                  ${n ? '\n                    <div style="position:absolute; bottom:-4px; left:50%; transform:translateX(-50%); background:var(--l-red); color:var(--l-ink-on-fill); padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:bold; white-space:nowrap;">\n                      FIRED\n                    </div>\n                  ' : ""}\n                </div>\n                <div style="flex:1; min-width:0;">\n                  <div style="font-weight:600; color:${n ? "var(--l-neutral-8)" : "var(--l-ink)"}; margin-bottom:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\n                    ${e.name} ${n ? '<span style="color:var(--danger); font-size:0.8rem;">(Former Employee)</span>' : ""}\n                  </div>\n                  <div style="color:${n ? "var(--l-neutral-6)" : "var(--l-pink)"}; font-size:0.9rem;">${((a = t), { mother: "👩 Mother", father: "👨 Father", stepmother: "👩 Stepmother", stepfather: "👨 Stepfather", sister: "👧 Sister", brother: "👦 Brother", stepsister: "👧 Stepsister", stepbrother: "👦 Stepbrother", daughter: "👧 Daughter", son: "👦 Son", stepdaughter: "👧 Stepdaughter", stepson: "👦 Stepson", aunt: "👩 Aunt", uncle: "👨 Uncle", niece: "👧 Niece", nephew: "👦 Nephew", cousin: "🧑 Cousin", spouse: "💍 Spouse", exSpouse: "💔 Ex-Spouse", relative: "👥 Relative" }[a] || "👥 " + a)}</div>\n                </div>\n                <div style="text-align:right; flex-shrink:0;">\n                  <div style="color:${n ? "var(--l-neutral-5)" : "var(--l-ink-dim-2)"}; font-size:0.85rem;">${n ? "No longer employed" : e.position || "Employee"}</div>\n                  <div style="color:var(--text-mute); font-size:0.8rem; margin-top:2px;">${e.age || "?"} years old</div>\n                </div>\n              </div>\n            `;
                                              var a;
                                          })
                                          .join("")}\n          </div>\n        `
                                    : '\n          <div style="background:var(--surface-2); padding:40px 20px; border-radius:10px; text-align:center;">\n            <div style="font-size:3rem; margin-bottom:15px;">👨‍👩‍👧</div>\n            <p style="color:var(--text-dim); margin:0;">No family members working at the company yet.</p>\n            <p style="color:var(--text-mute); font-size:0.85rem; margin-top:8px;">Use the button above to add one!</p>\n          </div>\n        '
                            }\n        \n        <div style="margin-top:20px; background:var(--surface); padding:15px; border-radius:8px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold); font-size:0.95rem;">💡 About Family Members</h4>\n          <div style="font-size:0.85rem; color:var(--text-dim); line-height:1.6;">\n            <p style="margin:0 0 8px 0;">Family members you create will:</p>\n            <ul style="margin:0; padding-left:20px;">\n              <li>Inherit ethnicity and some physical features</li>\n              <li>Be automatically hired at your company</li>\n              <li>Have their relationship remembered</li>\n              <li>Be an appropriate age for their relation</li>\n            </ul>\n          </div>\n        </div>\n      `;
                    })();
                case "children":
                    return (() => {
                        gameState.children || (gameState.children = []);
                        const e = getEmployeeChildren(n.id);
                        return 0 === e.length
                            ? '\n          <h3 style="margin:0 0 15px 0; color:var(--accent);">Children</h3>\n          <p style="color:var(--text-dim); text-align:center; padding:40px 0;">No children yet</p>\n        '
                            : `\n        <h3 style="margin:0 0 15px 0; color:var(--accent);">Children (${e.length})</h3>\n        <div style="display:grid; gap:15px;">\n          ${e
                                      .map((e) => {
                                          const t =
                                                  "player" === e.fatherID
                                                      ? { name: gameState.player?.name || "You", color: "var(--l-gold)" }
                                                      : gameState.employees.find((t) => t.id === e.fatherID),
                                              a = t ? t.name : "Unknown",
                                              o = t?.color || "var(--l-ink-dim-2)",
                                              i = e.age,
                                              s =
                                                  i < 1
                                                      ? "Newborn"
                                                      : i < 30
                                                        ? `${i} day${i > 1 ? "s" : ""} old`
                                                        : i < 365
                                                          ? `${Math.floor(i / 30)} month${Math.floor(i / 30) > 1 ? "s" : ""} old`
                                                          : `${Math.floor(i / 365)} year${Math.floor(i / 365) > 1 ? "s" : ""} old`;
                                          return `\n              <div style="background:var(--surface-2); padding:15px; border-radius:8px;">\n                <div style="display:flex; gap:15px; align-items:center; margin-bottom:10px;">\n                  <div style="font-size:3rem; flex-shrink:0;">${e.photo || ("boy" === e.gender ? "👶" : "👧")}</div>\n                  <div style="flex:1;">\n                    <h4 style="margin:0 0 4px 0; color:var(--accent-gold);">${e.name}</h4>\n                    <div style="color:var(--text-dim); font-size:0.9rem;">${s}</div>\n                    <div style="color:var(--text-dim); font-size:0.9rem; margin-top:4px;">\n                      ${"boy" === e.gender ? "♂️" : "♀️"} ${"boy" === e.gender ? "Boy" : "Girl"}\n                    </div>\n                  </div>\n                </div>\n                \n                <div style="background:var(--surface); padding:12px; border-radius:6px; margin-bottom:10px;">\n                  <div style="color:var(--text-mute); font-size:0.85rem; margin-bottom:6px;">PARENTS</div>\n                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">\n                    <span style="color:var(--text-dim);">Mother:</span>\n                    <span style="color:${getColoredName(n).match(/color:([^;]+)/)?.[1] || "var(--l-ink)"}; font-weight:600;">${n.name}</span>\n                  </div>\n                  <div style="display:flex; justify-content:space-between; align-items:center;">\n                    <span style="color:var(--text-dim);">Father:</span>\n                    <span style="color:${o}; font-weight:600;">${a}</span>\n                  </div>\n                </div>\n                \n                <div style="background:var(--surface); padding:12px; border-radius:6px;">\n                  <div style="color:var(--text-mute); font-size:0.85rem; margin-bottom:6px;">GENETICS</div>\n                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.85rem;">\n                    <div>\n                      <span style="color:var(--text-dim);">Hair:</span> \n                      <span style="color:var(--l-ink);">${e.genetics.hairColor || "brown"}</span>\n                    </div>\n                    <div>\n                      <span style="color:var(--text-dim);">Eyes:</span> \n                      <span style="color:var(--l-ink);">${e.genetics.eyeColor || "brown"}</span>\n                    </div>\n                    <div>\n                      <span style="color:var(--text-dim);">Skin:</span> \n                      <span style="color:var(--l-ink);">${e.genetics.skinTone || "fair"}</span>\n                    </div>\n                    <div>\n                      <span style="color:var(--text-dim);">Height:</span> \n                      <span style="color:var(--l-ink);">${e.genetics.height || "average"}</span>\n                    </div>\n                  </div>\n                </div>\n                \n                ${e.traits && e.traits.length > 0 ? `\n                  <div style="margin-top:10px;">\n                    <div style="color:var(--text-mute); font-size:0.85rem; margin-bottom:6px;">PERSONALITY TRAITS</div>\n                    <div style="display:flex; flex-wrap:wrap; gap:6px;">\n                      ${e.traits.map((e) => `\n                        <span style="background:var(--surface); color:var(--accent); padding:4px 10px; border-radius:4px; font-size:0.8rem;">\n                          ${e}\n                        </span>\n                      `).join("")}\n                    </div>\n                  </div>\n                ` : ""}\n              </div>\n            `;
                                      })
                                      .join("")}\n        </div>\n      `;
                    })();
                case "appearance":
                    return (() => {
                        const e = (a ? window.profileEditState.editedData : n).physical || {},
                            t = e.hair || {},
                            o = e.eyes || {},
                            i = e.face || {},
                            s = e.skin || {},
                            r = e.body || {},
                            l = (Array.isArray(e.genitals) ? e.genitals[0] : e.genitals) || {},
                            c = "updateUnifiedAppearancePreview()";
                        return `\n        <h3 style="margin:0 0 15px 0; color:var(--accent);">Physical Appearance ${a ? '<span style="color:var(--accent-gold); font-size:0.8rem;">(Edit Mode)</span>' : ""}</h3>\n        \n        <div style="text-align:center; margin-bottom:20px;">\n          <img src="${n.profileImage || placeholderImage(200, 200)}" \n            style="width:200px; height:200px; border-radius:10px; object-fit:cover; box-shadow:0 4px 15px var(--l-veil-30);">\n          <div style="margin-top:10px;">\n            <button onclick="openGalleryForProfileUpdate('${n.id}')" \n              style="padding:8px 16px; background:var(--l-cyan); border:none; border-radius:6px; color:var(--l-on-accent); font-weight:600; cursor:pointer;">\n              📷 Update Profile Picture\n            </button>\n          </div>\n        </div>\n        \n        \x3c!-- Basic Information --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Basic Info</h4>\n          ${a ? `\n            <div style="display:grid; gap:10px;">\n              <div>\n                <label style="color:var(--text-dim); font-size:0.85rem; display:block; margin-bottom:4px;">Height & Build:</label>\n                <input type="text" value="${e.heightBuild || (e.height && e.build ? e.height + ", " + e.build : "")}" \n                  onchange="if (!window.profileEditState.editedData.physical) window.profileEditState.editedData.physical = {}; window.profileEditState.editedData.physical.heightBuild = this.value; ${c}"\n                  style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:8px; border-radius:4px;"\n                  placeholder="e.g., 5'7&quot;, athletic build">\n              </div>\n              <div>\n                <label style="color:var(--text-dim); font-size:0.85rem; display:block; margin-bottom:4px;">Gender:</label>\n                <input type="text" value="${n.gender || ""}" \n                  onchange="window.profileEditState.editedData.gender = this.value; ${c}"\n                  style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:8px; border-radius:4px;"\n                  placeholder="e.g., Female, Male, Non-binary, Trans Woman, Trans Man">\n              </div>\n              <div>\n                <label style="color:var(--text-dim); font-size:0.85rem; display:block; margin-bottom:4px;">Age (18+):</label>\n                <input type="number" min="18" max="99" value="${n.age || 18}" \n                  onchange="const age = Math.max(18, Math.min(99, parseInt(this.value) || 18)); this.value = age; window.profileEditState.editedData.age = age; ${c}"\n                  style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:8px; border-radius:4px;"\n                  placeholder="Minimum age 18">\n              </div>\n              <div>\n                <label style="color:var(--text-dim); font-size:0.85rem; display:block; margin-bottom:4px;">Race/Species:</label>\n                <select id="editRaceSelect" onchange="window.profileEditState.editedData.race = this.value; const ethSection = document.getElementById('editEthnicitySection'); if (ethSection) ethSection.style.display = this.value === 'human' ? 'block' : 'none'; const customSection = document.getElementById('editCustomRaceSection'); if (customSection) customSection.style.display = this.value === 'custom' ? 'block' : 'none'; ${c}"\n                  style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:8px; border-radius:4px; cursor:pointer;">\n                  <optgroup label="Standard">\n                    <option value="human" ${"human" === (n.race || "human") ? "selected" : ""}>Human</option>\n                  </optgroup>\n                  <optgroup label="Fantasy - Fae">\n                    <option value="elf" ${"elf" === n.race ? "selected" : ""}>Elf</option>\n                    <option value="fairy" ${"fairy" === n.race ? "selected" : ""}>Fairy</option>\n                    <option value="dryad" ${"dryad" === n.race ? "selected" : ""}>Dryad</option>\n                  </optgroup>\n                  <optgroup label="Fantasy - Beastfolk">\n                    <option value="catgirl" ${"catgirl" === n.race ? "selected" : ""}>Catgirl</option>\n                    <option value="catboy" ${"catboy" === n.race ? "selected" : ""}>Catboy</option>\n                    <option value="cat" ${"cat" === n.race ? "selected" : ""}>Catkin (Generic)</option>\n                    <option value="foxgirl" ${"foxgirl" === n.race ? "selected" : ""}>Foxgirl</option>\n                    <option value="foxboy" ${"foxboy" === n.race ? "selected" : ""}>Foxboy</option>\n                    <option value="fox" ${"fox" === n.race ? "selected" : ""}>Foxkin (Generic)</option>\n                    <option value="wolfgirl" ${"wolfgirl" === n.race ? "selected" : ""}>Wolfgirl</option>\n                    <option value="wolfboy" ${"wolfboy" === n.race ? "selected" : ""}>Wolfboy</option>\n                    <option value="wolf" ${"wolf" === n.race ? "selected" : ""}>Wolfkin (Generic)</option>\n                    <option value="bunny" ${"bunny" === n.race ? "selected" : ""}>Bunnygirl/boy</option>\n                    <option value="rabbit" ${"rabbit" === n.race ? "selected" : ""}>Rabbitkin</option>\n                    <option value="werewolf" ${"werewolf" === n.race ? "selected" : ""}>Werewolf</option>\n                  </optgroup>\n                  <optgroup label="Fantasy - Infernal/Divine">\n                    <option value="succubus" ${"succubus" === n.race ? "selected" : ""}>Succubus</option>\n                    <option value="incubus" ${"incubus" === n.race ? "selected" : ""}>Incubus</option>\n                    <option value="demon" ${"demon" === n.race ? "selected" : ""}>Demon</option>\n                    <option value="tiefling" ${"tiefling" === n.race ? "selected" : ""}>Tiefling</option>\n                    <option value="angel" ${"angel" === n.race ? "selected" : ""}>Angel</option>\n                    <option value="vampire" ${"vampire" === n.race ? "selected" : ""}>Vampire</option>\n                  </optgroup>\n                  <optgroup label="Fantasy - Classic">\n                    <option value="orc" ${"orc" === n.race ? "selected" : ""}>Orc</option>\n                    <option value="goblin" ${"goblin" === n.race ? "selected" : ""}>Goblin</option>\n                    <option value="dwarf" ${"dwarf" === n.race ? "selected" : ""}>Dwarf</option>\n                    <option value="halfling" ${"halfling" === n.race ? "selected" : ""}>Halfling</option>\n                    <option value="dragonborn" ${"dragonborn" === n.race || "dragon" === n.race ? "selected" : ""}>Dragonborn</option>\n                  </optgroup>\n                  <optgroup label="Sci-Fi & Other">\n                    <option value="robot" ${"robot" === n.race ? "selected" : ""}>Robot/Android</option>\n                    <option value="cyborg" ${"cyborg" === n.race ? "selected" : ""}>Cyborg</option>\n                    <option value="alien" ${"alien" === n.race ? "selected" : ""}>Alien</option>\n                    <option value="slime" ${"slime" === n.race ? "selected" : ""}>Slime</option>\n                    <option value="ghost" ${"ghost" === n.race ? "selected" : ""}>Ghost</option>\n                  </optgroup>\n                  <optgroup label="Exotic Hybrids">\n                    <option value="mermaid" ${"mermaid" === n.race ? "selected" : ""}>Mermaid/Merman</option>\n                    <option value="lamia" ${"lamia" === n.race ? "selected" : ""}>Lamia (Snake)</option>\n                    <option value="centaur" ${"centaur" === n.race ? "selected" : ""}>Centaur</option>\n                    <option value="harpy" ${"harpy" === n.race ? "selected" : ""}>Harpy</option>\n                  </optgroup>\n                  <optgroup label="Custom">\n                    <option value="custom" ${n.customRace ? "selected" : ""}>✨ Custom Race...</option>\n                  </optgroup>\n                </select>\n                <div id="editCustomRaceSection" style="display:${n.customRace ? "block" : "none"}; margin-top:8px; padding:8px; background:var(--l-panel); border-radius:4px; border:1px solid var(--l-violet);">\n                  <input type="text" id="editCustomRaceName" value="${n.customRace?.name || n.race || ""}" placeholder="Custom race name..." \n                    onchange="window.profileEditState.editedData.customRaceName = this.value;"\n                    style="width:100%; background:var(--bg); border:1px solid var(--l-violet); color:var(--l-ink); padding:6px; border-radius:4px;">\n                </div>\n              </div>\n              <div id="editEthnicitySection" style="${"human" === (n.race || "human") ? "" : "display:none;"}">\n                <label style="color:var(--text-dim); font-size:0.85rem; display:block; margin-bottom:4px;">Ethnicity (for humans):</label>\n                <select onchange="window.profileEditState.editedData.ethnicity = this.value || null; ${c}"\n                  style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:8px; border-radius:4px; cursor:pointer;">\n                  <option value="" ${n.ethnicity ? "" : "selected"}>-- Not specified --</option>\n                  <option value="caucasian" ${"caucasian" === n.ethnicity ? "selected" : ""}>Caucasian/European</option>\n                  <option value="black" ${"black" === n.ethnicity ? "selected" : ""}>Black/African</option>\n                  <option value="latino" ${"latino" === n.ethnicity ? "selected" : ""}>Latino/Hispanic</option>\n                  <option value="eastAsian" ${"eastAsian" === n.ethnicity ? "selected" : ""}>East Asian</option>\n                  <option value="southeastAsian" ${"southeastAsian" === n.ethnicity ? "selected" : ""}>Southeast Asian</option>\n                  <option value="southAsian" ${"southAsian" === n.ethnicity ? "selected" : ""}>South Asian</option>\n                  <option value="middleEastern" ${"middleEastern" === n.ethnicity ? "selected" : ""}>Middle Eastern</option>\n                  <option value="pacificIslander" ${"pacificIslander" === n.ethnicity ? "selected" : ""}>Pacific Islander</option>\n                  <option value="nativeAmerican" ${"nativeAmerican" === n.ethnicity ? "selected" : ""}>Native American</option>\n                  <option value="mixed" ${"mixed" === n.ethnicity ? "selected" : ""}>Mixed Ethnicity</option>\n                </select>\n              </div>\n            </div>\n          ` : `\n            <div style="display:grid; gap:8px;">\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Height & Build:</span>\n                <span style="color:var(--l-ink); font-weight:600;">${e.heightBuild || (e.height && e.build ? e.height + ", " + e.build : "Not specified")}</span>\n              </div>\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Gender:</span>\n                <span style="color:var(--l-ink); font-weight:600;">${n.gender || "Not specified"}</span>\n              </div>\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Age:</span>\n                <span style="color:var(--l-ink); font-weight:600;">${n.age || "Not specified"}</span>\n              </div>\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Race/Species:</span>\n                <span style="color:var(--l-ink); font-weight:600;">${n.race ? n.race.charAt(0).toUpperCase() + n.race.slice(1) : "Human"}</span>\n              </div>\n              ${"human" === (n.race || "human") && n.ethnicity ? `\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Ethnicity:</span>\n                <span style="color:var(--l-ink); font-weight:600;">${formatEthnicity(n.ethnicity)}</span>\n              </div>\n              ` : ""}\n            </div>\n          `}\n        </div>\n        \n        \x3c!-- Hair Details --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Hair</h4>\n          ${a ? `\n            <div style="display:grid; gap:10px;">\n              <div>\n                <label style="color:var(--text-dim); font-size:0.85rem; display:block; margin-bottom:4px;">Color:</label>\n                <input type="text" value="${t.color || ""}" \n                  onchange="if (!window.profileEditState.editedData.physical.hair) window.profileEditState.editedData.physical.hair = {}; window.profileEditState.editedData.physical.hair.color = this.value; ${c}"\n                  style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:8px; border-radius:4px;"\n                  placeholder="e.g., dark brown, blonde">\n              </div>\n              <div>\n                <label style="color:var(--text-dim); font-size:0.85rem; display:block; margin-bottom:4px;">Style:</label>\n                <input type="text" value="${t.style || ""}" \n                  onchange="if (!window.profileEditState.editedData.physical.hair) window.profileEditState.editedData.physical.hair = {}; window.profileEditState.editedData.physical.hair.style = this.value; ${c}"\n                  style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:8px; border-radius:4px;"\n                  placeholder="e.g., wavy, straight, curly">\n              </div>\n              <div>\n                <label style="color:var(--text-dim); font-size:0.85rem; display:block; margin-bottom:4px;">Length:</label>\n                <input type="text" value="${t.length || ""}" \n                  onchange="if (!window.profileEditState.editedData.physical.hair) window.profileEditState.editedData.physical.hair = {}; window.profileEditState.editedData.physical.hair.length = this.value; ${c}"\n                  style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:8px; border-radius:4px;"\n                  placeholder="e.g., shoulder-length, long">\n              </div>\n              <div>\n                <label style="color:var(--text-dim); font-size:0.85rem; display:block; margin-bottom:4px;">Texture:</label>\n                <input type="text" value="${t.texture || ""}" \n                  onchange="if (!window.profileEditState.editedData.physical.hair) window.profileEditState.editedData.physical.hair = {}; window.profileEditState.editedData.physical.hair.texture = this.value; ${c}"\n                  style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:8px; border-radius:4px;"\n                  placeholder="e.g., silky, thick">\n              </div>\n            </div>\n          ` : `\n            <div style="display:grid; gap:8px;">\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Color:</span>\n                <span style="color:var(--l-ink); font-weight:600;">${t.color || "Not specified"}</span>\n              </div>\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Style:</span>\n                <span style="color:var(--l-ink); font-weight:600;">${t.style || "Not specified"}</span>\n              </div>\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Length:</span>\n                <span style="color:var(--l-ink); font-weight:600;">${t.length || "Not specified"}</span>\n              </div>\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Texture:</span>\n                <span style="color:var(--l-ink); font-weight:600;">${t.texture || "Not specified"}</span>\n              </div>\n            </div>\n          `}\n        </div>\n        \n        \x3c!-- Face & Eyes --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Face & Eyes</h4>\n          ${a ? `\n            <div style="display:grid; gap:10px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Eye Color:</label><input type="text" value="${o.color || ""}" onchange="if (!window.profileEditState.editedData.physical.eyes) window.profileEditState.editedData.physical.eyes = {}; window.profileEditState.editedData.physical.eyes.color = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Eye Shape:</label><input type="text" value="${o.shape || ""}" onchange="if (!window.profileEditState.editedData.physical.eyes) window.profileEditState.editedData.physical.eyes = {}; window.profileEditState.editedData.physical.eyes.shape = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Face Shape:</label><input type="text" value="${i.shape || ""}" onchange="if (!window.profileEditState.editedData.physical.face) window.profileEditState.editedData.physical.face = {}; window.profileEditState.editedData.physical.face.shape = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Nose:</label><input type="text" value="${i.nose || ""}" onchange="if (!window.profileEditState.editedData.physical.face) window.profileEditState.editedData.physical.face = {}; window.profileEditState.editedData.physical.face.nose = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Lips:</label><input type="text" value="${i.lips || ""}" onchange="if (!window.profileEditState.editedData.physical.face) window.profileEditState.editedData.physical.face = {}; window.profileEditState.editedData.physical.face.lips = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Cheekbones:</label><input type="text" value="${i.cheekbones || ""}" onchange="if (!window.profileEditState.editedData.physical.face) window.profileEditState.editedData.physical.face = {}; window.profileEditState.editedData.physical.face.cheekbones = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Jawline:</label><input type="text" value="${i.jawline || ""}" onchange="if (!window.profileEditState.editedData.physical.face) window.profileEditState.editedData.physical.face = {}; window.profileEditState.editedData.physical.face.jawline = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n            </div>\n          ` : `\n            <div style="display:grid; gap:8px;">\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Eye Color:</span><span style="color:var(--l-ink); font-weight:600;">${o.color || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Eye Shape:</span><span style="color:var(--l-ink); font-weight:600;">${o.shape || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Face Shape:</span><span style="color:var(--l-ink); font-weight:600;">${i.shape || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Nose:</span><span style="color:var(--l-ink); font-weight:600;">${i.nose || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Lips:</span><span style="color:var(--l-ink); font-weight:600;">${i.lips || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Cheekbones:</span><span style="color:var(--l-ink); font-weight:600;">${i.cheekbones || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Jawline:</span><span style="color:var(--l-ink); font-weight:600;">${i.jawline || "Not specified"}</span></div>\n            </div>\n          `}\n        </div>\n        \n        \x3c!-- Skin, Body, Intimate, Style all editable... --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Skin & Body</h4>\n          ${a ? `\n            <div style="display:grid; gap:10px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Skin Tone:</label><input type="text" value="${s.tone || e.skinTone || ""}" onchange="if (!window.profileEditState.editedData.physical.skin) window.profileEditState.editedData.physical.skin = {}; window.profileEditState.editedData.physical.skin.tone = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Body Shape:</label><input type="text" value="${r.shape || e.bodyShape || ""}" onchange="if (!window.profileEditState.editedData.physical.body) window.profileEditState.editedData.physical.body = {}; window.profileEditState.editedData.physical.body.shape = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Chest/Breast Size:</label><input type="text" value="${r.chestSize || r.breastSize || ""}" onchange="if (!window.profileEditState.editedData.physical.body) window.profileEditState.editedData.physical.body = {}; window.profileEditState.editedData.physical.body.chestSize = this.value; window.profileEditState.editedData.physical.body.breastSize = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Butt Size:</label><input type="text" value="${r.buttSize || ""}" onchange="if (!window.profileEditState.editedData.physical.body) window.profileEditState.editedData.physical.body = {}; window.profileEditState.editedData.physical.body.buttSize = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Legs:</label><input type="text" value="${r.legs || ""}" onchange="if (!window.profileEditState.editedData.physical.body) window.profileEditState.editedData.physical.body = {}; window.profileEditState.editedData.physical.body.legs = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Genitals Type:</label><input type="text" value="${l.type || ""}" onchange="if (!window.profileEditState.editedData.physical.genitals) window.profileEditState.editedData.physical.genitals = {}; window.profileEditState.editedData.physical.genitals.type = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Genitals Size:</label><input type="text" value="${l.size || ""}" onchange="if (!window.profileEditState.editedData.physical.genitals) window.profileEditState.editedData.physical.genitals = {}; window.profileEditState.editedData.physical.genitals.size = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Grooming:</label><input type="text" value="${l.characteristics || ""}" onchange="if (!window.profileEditState.editedData.physical.genitals) window.profileEditState.editedData.physical.genitals = {}; window.profileEditState.editedData.physical.genitals.characteristics = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Fashion Style:</label><input type="text" value="${e.fashion || ""}" onchange="if (!window.profileEditState.editedData.physical) window.profileEditState.editedData.physical = {}; window.profileEditState.editedData.physical.fashion = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n              <div><label style="color:var(--text-dim); font-size:0.85rem;">Accessories:</label><input type="text" value="${e.accessories || ""}" onchange="if (!window.profileEditState.editedData.physical) window.profileEditState.editedData.physical = {}; window.profileEditState.editedData.physical.accessories = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;" placeholder="e.g., glasses, earrings, necklace (or leave empty)"></div>\n              <div style="grid-column: 1 / -1;"><label style="color:var(--text-dim); font-size:0.85rem;">Distinguishing Feature:</label><input type="text" value="${e.distinguishingFeature || ""}" onchange="if (!window.profileEditState.editedData.physical) window.profileEditState.editedData.physical = {}; window.profileEditState.editedData.physical.distinguishingFeature = this.value; ${c}" style="width:100%; background:var(--surface); border:1px solid var(--accent); color:var(--l-ink); padding:6px; border-radius:4px;"></div>\n            </div>\n          ` : `\n            <div style="display:grid; gap:8px;">\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Skin Tone:</span><span style="color:var(--l-ink); font-weight:600;">${s.tone || e.skinTone || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Body Shape:</span><span style="color:var(--l-ink); font-weight:600;">${r.shape || e.bodyShape || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Chest/Breast Size:</span><span style="color:var(--l-ink); font-weight:600;">${r.chestSize || r.breastSize || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Butt Size:</span><span style="color:var(--l-ink); font-weight:600;">${r.buttSize || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Legs:</span><span style="color:var(--l-ink); font-weight:600;">${r.legs || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Genitals:</span><span style="color:var(--l-ink); font-weight:600;">${l.type || "Not specified"}, ${l.size || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Grooming:</span><span style="color:var(--l-ink); font-weight:600;">${l.characteristics || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Fashion:</span><span style="color:var(--l-ink); font-weight:600;">${e.fashion || "Not specified"}</span></div>\n              <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-dim);">Accessories:</span><span style="color:var(--l-ink); font-weight:600;">${e.accessories || "None"}</span></div>\n              ${e.distinguishingFeature ? `<div style="padding-top:8px; border-top:1px solid var(--l-sheen-10);"><div style="color:var(--text-dim); font-size:0.85rem;">Distinguishing Feature:</div><div style="color:var(--accent); font-style:italic;">${e.distinguishingFeature}</div></div>` : ""}\n            </div>\n          `}\n        </div>\n        \n        \x3c!-- Auto-Generated Complete Description --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px;">\n          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Complete Description ${a ? '<span style="color:var(--positive); font-size:0.75rem;">(Auto-Updates)</span>' : ""}</h4>\n          <p id="appearanceDescPreview" style="margin:0; line-height:1.6; color:var(--text);">${e.fullDescription || "Edit fields above to generate description"}</p>\n        </div>\n      `;
                    })();
                case "gallery":
                    return renderProfileGallery(n.id);
            }
        };
    var c;
    (s.innerHTML = `\n      <div style="background:var(--bg); width:95%; max-width:1000px; max-height:90vh; border-radius:15px; box-shadow:0 5px 30px var(--l-veil-50); display:flex; flex-direction:column; overflow:hidden; margin:20px auto; position:relative;">\n        \x3c!-- Header --\x3e\n        <div style="padding:15px 20px; border-bottom:2px solid var(--accent); display:flex; justify-content:space-between; align-items:center; background:var(--surface); flex-shrink:0;">\n          <h2 style="margin:0; color:var(--l-ink); font-size:1.3rem;">👤 ${n.name}'s Profile</h2>\n          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">\n            <button id="saveProfileBtn" style="background:var(--l-green); border:none; padding:8px 16px; border-radius:8px; color:var(--l-on-accent); font-weight:600; cursor:pointer; display:none; font-size:0.9rem;">\n              💾 Save\n            </button>\n            <button id="toggleEditBtn" style="background:var(--l-cyan); border:none; padding:8px 16px; border-radius:8px; color:var(--l-on-accent); font-weight:600; cursor:pointer; font-size:0.9rem;">\n              ✏️ Edit\n            </button>\n            <button id="exportCharacterBtn" style="background:var(--l-violet); border:none; padding:8px 16px; border-radius:8px; color:var(--l-on-accent); font-weight:600; cursor:pointer; font-size:0.9rem;" title="Export this character to a file you can import into another save">\n              📤 Export\n            </button>\n            <button id="closeUnifiedProfile" style="background:transparent; border:none; color:var(--l-ink); font-size:1.8rem; cursor:pointer; padding:0 8px; line-height:1;">✕</button>\n          </div>\n        </div>\n        \n        \x3c!-- Tabs (Sticky with shadow on scroll) --\x3e\n        <div id="tabsContainer" style="display:flex; gap:2px; padding:8px 10px 0 10px; background:var(--bg); overflow-x:auto; flex-shrink:0; position:sticky; top:0; z-index:10; border-bottom:1px solid transparent; transition:all 0.2s; scrollbar-width:thin;">\n          ${
            ((c = t),
            [
                { id: "overview", label: "📊 Overview", emoji: "📊" },
                { id: "stats", label: "📈 Stats", emoji: "📈" },
                { id: "skills", label: "⭐ Skills", emoji: "⭐" },
                { id: "possessions", label: "🎁 Possessions", emoji: "🎁" },
                { id: "flags", label: "🏷️ Flags", emoji: "🏷️" },
                { id: "schedule", label: "📅 Schedule", emoji: "📅" },
                { id: "social", label: "📱 Social", emoji: "📱" },
                { id: "relationship", label: "💕 Relationship", emoji: "💕" },
                { id: "family", label: "👨‍👩‍👧 Family", emoji: "👨‍👩‍👧" },
                { id: "children", label: "👶 Children", emoji: "👶" },
                { id: "appearance", label: "👤 Appearance", emoji: "👤" },
                { id: "gallery", label: "📷 Gallery", emoji: "📷" },
            ]
                .map(
                    (e) =>
                        `\n        <button class="profile-tab ${c === e.id ? "active" : ""}" data-tab="${e.id}" \n          style="background:${c === e.id ? "var(--l-cyan)" : "var(--l-panel-2)"}; \n                 color:${c === e.id ? "var(--l-bg)" : "var(--l-ink)"}; \n                 border:none; padding:8px 12px; border-radius:8px 8px 0 0; \n                 cursor:pointer; font-weight:600; transition:all 0.2s; font-size:0.9rem;\n                 border-bottom:${c === e.id ? "3px solid var(--accent-gold)" : "none"}; white-space:nowrap;">\n          ${e.emoji} ${e.label.split(" ")[1]}\n        </button>\n      `
                )
                .join(""))
        }\n        </div>\n        \n        \x3c!-- Content --\x3e\n        <div id="profileContent" style="flex:1; overflow-y:auto; padding:20px; background:var(--surface); min-height:0; -webkit-overflow-scrolling:touch;">\n          ${l(t)}\n        </div>\n      </div>\n      \n      <style>\n        /* Mobile-friendly scrollbars */\n        #profileContent::-webkit-scrollbar {\n          width:8px;\n        }\n        #profileContent::-webkit-scrollbar-track {\n          background:var(--surface);\n        }\n        #profileContent::-webkit-scrollbar-thumb {\n          background:var(--l-cyan);\n          border-radius:4px;\n        }\n        #profileContent::-webkit-scrollbar-thumb:hover {\n          background:var(--l-cyan-dark);\n        }\n        \n        #tabsContainer::-webkit-scrollbar {\n          height:6px;\n        }\n        #tabsContainer::-webkit-scrollbar-track {\n          background:var(--bg);\n        }\n        #tabsContainer::-webkit-scrollbar-thumb {\n          background:var(--l-cyan);\n          border-radius:3px;\n        }\n        \n        /* Mobile responsive adjustments - PORTRAIT OPTIMIZED */\n        @media (max-width: 768px) {\n          #unifiedProfileModal > div {\n            width:100% !important;\n            height:100vh !important;\n            max-height:100vh !important;\n            border-radius:0 !important;\n            margin:0 !important;\n          }\n          \n          #profileContent {\n            padding:12px !important;\n          }\n          \n          .profile-tab {\n            font-size:0.8rem !important;\n            padding:6px 8px !important;\n          }\n          \n          /* Portrait-specific optimizations */\n          #unifiedProfileModal h2 {\n            font-size:1.1rem !important;\n          }\n          \n          #unifiedProfileModal button {\n            font-size:0.85rem !important;\n            padding:6px 12px !important;\n          }\n        }\n        \n        /* PORTRAIT MODE: Max vertical space, minimal horizontal waste */\n        @media (max-width: 768px) and (orientation: portrait) {\n          /* Header more compact */\n          #unifiedProfileModal > div > div:first-child {\n            padding:10px 12px !important;\n          }\n          \n          /* Tabs even more compact */\n          #tabsContainer {\n            padding:6px 8px 0 8px !important;\n          }\n          \n          .profile-tab {\n            font-size:0.75rem !important;\n            padding:5px 7px !important;\n          }\n          \n          /* Content takes maximum space */\n          #profileContent {\n            padding:10px !important;\n          }\n          \n          /* Single column layouts for portrait */\n          #profileContent > div > div[style*="grid-template-columns"] {\n            grid-template-columns: 1fr !important;\n          }\n          \n          /* Overview profile section - stack vertically */\n          #profileContent > div > div[style*="display:flex"][style*="gap:20px"] {\n            flex-direction: column !important;\n            gap: 12px !important;\n          }\n          \n          /* Profile image centered in portrait */\n          #profileContent img[style*="width:120px"] {\n            margin: 0 auto !important;\n            display: block !important;\n          }\n          \n          /* Text sections more compact */\n          #profileContent h3 {\n            font-size: 1.1rem !important;\n            margin-bottom: 10px !important;\n          }\n          \n          #profileContent h4 {\n            font-size: 1rem !important;\n          }\n          \n          /* Reduce gaps in portrait */\n          #profileContent > div > div[style*="gap:15px"],\n          #profileContent > div > div[style*="gap:20px"] {\n            gap: 10px !important;\n          }\n        }\n        \n        /* LANDSCAPE MODE: Utilize horizontal space better */\n        @media (max-width: 768px) and (orientation: landscape) {\n          /* Keep 2 columns in landscape if space allows */\n          #profileContent > div > div[style*="grid-template-columns"][style*="auto-fit"] {\n            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;\n          }\n          \n          /* Tabs can be slightly larger */\n          .profile-tab {\n            font-size:0.85rem !important;\n            padding:6px 10px !important;\n          }\n        }\n        \n        /* Sticky tab shadow effect */\n        .tabs-scrolled {\n          border-bottom:1px solid var(--accent) !important;\n          box-shadow:0 2px 8px var(--l-veil-30) !important;\n        }\n      </style>\n    `),
        ModalManager.show(s, "unifiedProfileModal");
    const d = s.querySelectorAll(".profile-tab"),
        p = s.querySelector("#profileContent"),
        m = s.querySelector("#tabsContainer"),
        u = s.querySelector("#toggleEditBtn"),
        g = s.querySelector("#saveProfileBtn"),
        h = s.querySelector("#closeUnifiedProfile");
    const exportBtn = s.querySelector("#exportCharacterBtn");
    exportBtn && exportBtn.addEventListener("click", () => openCharacterExportModal(n.id));
    let y = t;
    p.addEventListener("scroll", () => {
        p.scrollTop > 10 ? m.classList.add("tabs-scrolled") : m.classList.remove("tabs-scrolled");
    });
    const f = (e) => {
        (y = e),
            (p.innerHTML = l(e)),
            "appearance" === e &&
                window.profileEditState.isEditMode &&
                "function" == typeof upgradeUnifiedAppearanceEdit &&
                upgradeUnifiedAppearanceEdit();
    };
    // Gallery buttons (★ / 🗑 / filters / set as profile) — one delegated listener.
    p.addEventListener("click", (e) => {
        const t = e.target.closest("[data-gal-action]");
        t &&
            (e.stopPropagation(),
            handleGalleryAction(n.id, t.dataset.galAction, t.dataset.idx).then((e) => e && f("gallery")));
    });
    u.addEventListener("click", () => {
        (a = !a),
            (window.profileEditState.isEditMode = a),
            (u.textContent = a ? "👁️ View" : "✏️ Edit"),
            (u.style.background = a ? "var(--l-red)" : "var(--l-cyan)"),
            f(y);
    }),
        g.addEventListener("click", () => {
            "function" == typeof syncUnifiedStructured && syncUnifiedStructured();
            if (window.profileEditState.editedData.name) {
                const e = window.profileEditState.editedData.name.trim(),
                    t = n.name;
                if (e !== t) {
                    if (!e || 0 === e.length) return void showNotification("❌ Name cannot be empty!", "error");
                    if (e.length < 2)
                        return void showNotification("❌ Name must be at least 2 characters!", "error");
                    if (gameState.employees.find((t) => t.id !== n.id && t.name.toLowerCase() === e.toLowerCase()))
                        return void showNotification(
                            `❌ Name "${e}" is already taken by another employee!`,
                            "error"
                        );
                    if (gameState.onboardingQueue) {
                        if (gameState.onboardingQueue.find((t) => t.name.toLowerCase() === e.toLowerCase()))
                            return void showNotification(`❌ Name "${e}" is already used in onboarding!`, "error");
                    }
                    gameState.usedEmployeeNames &&
                        (gameState.usedEmployeeNames.delete(t), gameState.usedEmployeeNames.add(e)),
                        console.log(`[Name Change] Renamed "${t}" → "${e}"`),
                        showNotification(`✅ Renamed employee: ${t} → ${e}`, "success");
                }
            }
            Object.assign(n, i),
                Object.assign(n, window.profileEditState.editedData),
                "function" == typeof syncFlatFiveFromAxes && syncFlatFiveFromAxes(n), // Pass 3 bridge-sync: flat-five follows edited axes
                window.profileEditState.editedData.hasOwnProperty("nicknameForPlayer") &&
                    (n.nicknameForPlayer = window.profileEditState.editedData.nicknameForPlayer),
                window.profileEditState.editedData.hasOwnProperty("nicknameFromPlayer") &&
                    (n.nicknameFromPlayer = window.profileEditState.editedData.nicknameFromPlayer),
                window.profileEditState.editedData.personalLife?.sexualOrientation &&
                    (n.personalLife || (n.personalLife = {}),
                    (n.personalLife.sexualOrientation =
                        window.profileEditState.editedData.personalLife.sexualOrientation)),
                window.profileEditState.editedData.personalLife?.outsideContacts &&
                    (n.personalLife || (n.personalLife = {}),
                    n.personalLife.outsideContacts || (n.personalLife.outsideContacts = {}),
                    window.profileEditState.editedData.personalLife.outsideContacts.relationshipStatus &&
                        ((n.personalLife.outsideContacts.relationshipStatus =
                            window.profileEditState.editedData.personalLife.outsideContacts.relationshipStatus),
                        (n.personalLife.outsideContacts.inRelationship =
                            window.profileEditState.editedData.personalLife.outsideContacts.inRelationship))),
                window.profileEditState.editedData.personalLife?.hasOwnProperty("significantOther") &&
                    (n.personalLife || (n.personalLife = {}),
                    (n.personalLife.significantOther =
                        window.profileEditState.editedData.personalLife.significantOther)),
                window.profileEditState.editedData.personalLife?.livingSituation?.pets &&
                    (n.personalLife || (n.personalLife = {}),
                    n.personalLife.livingSituation || (n.personalLife.livingSituation = { type: "apartment" }),
                    (n.personalLife.livingSituation.pets =
                        window.profileEditState.editedData.personalLife.livingSituation.pets),
                    (n.personalLife.livingSituation.hasPet = n.personalLife.livingSituation.pets.length > 0)),
                (o = !1),
                (window.profileEditState.hasUnsavedChanges = !1),
                (g.style.display = "none"),
                saveGame(),
                showNotification("✅ Profile updated successfully!", "success"),
                updateUI();
        }),
        d.forEach((e) => {
            e.addEventListener("click", () => {
                const t = e.dataset.tab;
                d.forEach((e) => {
                    e.classList.remove("active"),
                        (e.style.background = "var(--l-panel-2)"),
                        (e.style.color = "var(--l-ink)"),
                        (e.style.borderBottom = "none");
                }),
                    e.classList.add("active"),
                    (e.style.background = "var(--l-cyan)"),
                    (e.style.color = "var(--l-on-accent)"),
                    (e.style.borderBottom = "3px solid var(--accent-gold)"),
                    f(t);
            });
        }),
        h.addEventListener("click", async () => {
            (o &&
                !(await showConfirm(
                    "You have unsaved changes. Are you sure you want to close?",
                    "Unsaved Changes",
                    { type: "warning", confirmText: "Close Anyway" }
                ))) ||
                ModalManager.close("unifiedProfileModal");
        });
    const b = s.querySelector(`#profilePromoteBtn_${e}`);
    b &&
        !b.disabled &&
        b.addEventListener("click", () => {
            ModalManager.close("unifiedProfileModal"),
                setTimeout(() => {
                    openCorporatePyramidModal(e);
                }, 150);
        }),
        (window.markProfileChange = () => {
            (o = !0), (window.profileEditState.hasUnsavedChanges = !0), (g.style.display = "block");
        }),
        (window.updateProfileRelationshipStatus = (e) => {
            window.profileEditState.editedData.personalLife ||
                (window.profileEditState.editedData.personalLife = {}),
                window.profileEditState.editedData.personalLife.outsideContacts ||
                    (window.profileEditState.editedData.personalLife.outsideContacts = {});
            const t = document.getElementById("profilePartnerDetails");
            if ("single" === e)
                (window.profileEditState.editedData.personalLife.outsideContacts.relationshipStatus = "single"),
                    (window.profileEditState.editedData.personalLife.outsideContacts.inRelationship = !1),
                    (window.profileEditState.editedData.personalLife.significantOther = null),
                    t && (t.style.display = "none");
            else {
                if (
                    ((window.profileEditState.editedData.personalLife.outsideContacts.relationshipStatus = e),
                    (window.profileEditState.editedData.personalLife.outsideContacts.inRelationship = !0),
                    !window.profileEditState.editedData.personalLife.significantOther)
                ) {
                    const t = gameState.employees.find((e) => e.id === n.id);
                    window.profileEditState.editedData.personalLife.significantOther = t?.personalLife
                        ?.significantOther
                        ? JSON.parse(JSON.stringify(t.personalLife.significantOther))
                        : { name: "", gender: "male", relationshipType: e, occupation: "", yearsTogether: 1 };
                }
                (window.profileEditState.editedData.personalLife.significantOther.relationshipType = e),
                    t && (t.style.display = "block");
            }
            window.markProfileChange();
        }),
        (window.updateProfilePartnerField = (e, t) => {
            if (
                (window.profileEditState.editedData.personalLife ||
                    (window.profileEditState.editedData.personalLife = {}),
                !window.profileEditState.editedData.personalLife.significantOther)
            ) {
                const e = gameState.employees.find((e) => e.id === n.id);
                window.profileEditState.editedData.personalLife.significantOther = e?.personalLife?.significantOther
                    ? JSON.parse(JSON.stringify(e.personalLife.significantOther))
                    : { name: "", gender: "male", relationshipType: "dating", occupation: "", yearsTogether: 1 };
            }
            (window.profileEditState.editedData.personalLife.significantOther[e] = t), window.markProfileChange();
        }),
        (window.updatePetData = (e, t, a) => {
            if (
                (window.profileEditState.editedData.personalLife ||
                    (window.profileEditState.editedData.personalLife = {}),
                window.profileEditState.editedData.personalLife.livingSituation ||
                    (window.profileEditState.editedData.personalLife.livingSituation = { pets: [] }),
                !window.profileEditState.editedData.personalLife.livingSituation.pets)
            ) {
                const e = gameState.employees.find((e) => e.id === n.id);
                window.profileEditState.editedData.personalLife.livingSituation.pets = JSON.parse(
                    JSON.stringify(e?.personalLife?.livingSituation?.pets || [])
                );
            }
            window.profileEditState.editedData.personalLife.livingSituation.pets[e] &&
                ((window.profileEditState.editedData.personalLife.livingSituation.pets[e][t] = a.trim()),
                window.markProfileChange());
        }),
        (window.removePet = (e) => {
            if (!window.profileEditState.editedData.personalLife?.livingSituation?.pets) {
                const e = gameState.employees.find((e) => e.id === n.id);
                window.profileEditState.editedData.personalLife ||
                    (window.profileEditState.editedData.personalLife = {}),
                    window.profileEditState.editedData.personalLife.livingSituation ||
                        (window.profileEditState.editedData.personalLife.livingSituation = {}),
                    (window.profileEditState.editedData.personalLife.livingSituation.pets = JSON.parse(
                        JSON.stringify(e?.personalLife?.livingSituation?.pets || [])
                    ));
            }
            window.profileEditState.editedData.personalLife.livingSituation.pets.splice(e, 1),
                window.markProfileChange(),
                f("overview");
        }),
        (window.addNewPet = () => {
            if (
                (window.profileEditState.editedData.personalLife ||
                    (window.profileEditState.editedData.personalLife = {}),
                window.profileEditState.editedData.personalLife.livingSituation ||
                    (window.profileEditState.editedData.personalLife.livingSituation = {}),
                !window.profileEditState.editedData.personalLife.livingSituation.pets)
            ) {
                const e = gameState.employees.find((e) => e.id === n.id);
                window.profileEditState.editedData.personalLife.livingSituation.pets = JSON.parse(
                    JSON.stringify(e?.personalLife?.livingSituation?.pets || [])
                );
            }
            window.profileEditState.editedData.personalLife.livingSituation.pets.push({
                name: "",
                type: "",
                giftedBy: null,
            }),
                window.markProfileChange(),
                f("overview");
        }),
        (window.refreshUnifiedProfileTab = (e) => {
            n.id === e && p && f(y);
        });
}
function setProfilePicture(e, t) {
    const n = gameState.employees.find((t) => t.id === e);
    if (!n) return;
    (n.profileImage = t), showNotification(`📷 Profile picture updated for ${n.name}!`), saveGame();
    const a = document.getElementById("unifiedProfileModal");
    if (a) {
        if (a.querySelector('[id^="profileContent"]')) {
            const t = a.querySelector(".profile-tab.active");
            t && "gallery" === t.dataset.tab
                ? openUnifiedProfile(e, "gallery")
                : t && "appearance" === t.dataset.tab && openUnifiedProfile(e, "appearance");
        }
    }
    updatePeopleTab();
}
// ── Photo gallery ───────────────────────────────────────────────────────────
// Everything the gallery shows: the employee's own photos, plus images from their social
// posts and their chat with the player. Favourites first, then newest. Cards carry an
// index into galleryView.items (the image itself used to be inlined into each card's
// onclick, a second copy of every 50–150 KB image in the page).
let galleryView = { empId: null, items: [], filter: "all" };
function isGalleryImage(e) {
    return "string" == typeof e && e.length > 0 && !e.startsWith("data:image/svg"); // not a placeholder tile
}
function buildGalleryItems(e) {
    const t = new Set(e.galleryFavorites || []),
        n = [],
        a = new Set(),
        o = (e) => {
            isGalleryImage(e.url) && !a.has(e.url) && (a.add(e.url), n.push({ ...e, favorite: t.has(e.url) }));
        };
    (e.photos || []).forEach((e) =>
        o({
            url: "string" == typeof e ? e : e?.url,
            source: e?.source || "profile",
            caption: e?.caption || "",
            timestamp: e?.timestamp || 0,
        })
    ),
        (e.generatedImages || []).forEach((e) =>
            o({ url: "string" == typeof e ? e : e?.url, source: "generated", caption: e?.caption || "", timestamp: e?.timestamp || 0 })
        ),
        (gameState.socialNetwork?.posts || []).forEach(
            (t) =>
                t.authorId === e.id &&
                t.imageUrl &&
                o({
                    url: t.imageUrl,
                    source: "social",
                    caption: t.caption || t.content || "",
                    timestamp: t.timestamp || 0,
                    likes: Array.isArray(t.likes) ? t.likes.length : t.likes || 0,
                })
        ),
        (gameState.chatHistory[e.id] || []).forEach(
            (e) => e.imageUrl && o({ url: e.imageUrl, source: "chat", caption: e.caption || e.content || "", timestamp: e.timestamp || 0 })
        );
    return n.sort((e, t) => t.favorite - e.favorite || (t.timestamp || 0) - (e.timestamp || 0));
}
function renderProfileGallery(e) {
    const t = gameState.employees.find((t) => t.id === e);
    if (!t) return '<p style="color:var(--danger);">Employee not found</p>';
    galleryView.empId !== e && (galleryView.filter = "all");
    const n = buildGalleryItems(t),
        a = n.filter((e) => e.favorite).length,
        o = "fav" === galleryView.filter ? n.filter((e) => e.favorite) : n,
        i = t.profileImage,
        s = (e) => n.filter((t) => t.source === e).length,
        r = n.reduce((e, t) => e + t.url.length, 0),
        l = r >= 1048576 ? `${(r / 1048576).toFixed(1)} MB` : `${Math.round(r / 1024)} KB`,
        c = { social: ["📱", "var(--l-cyan)"], chat: ["💬", "var(--l-pink)"], "auto-vis": ["🎬", "var(--l-red)"] };
    galleryView = { empId: e, items: o, filter: galleryView.filter };
    const d = o
        .map((e, t) => {
            const [n, a] = c[e.source] || ["🖼️", "var(--l-green)"],
                o = e.url === i;
            return `
            <div class="gal-card${o ? " is-current" : ""}" data-gal-action="profile" data-idx="${t}" title="${o ? "Current profile picture" : "Set as profile picture"}">
              <img src="${e.url}" loading="lazy" alt="">
              <span class="gal-source" style="background:${a};">${n} ${e.source}</span>
              <div class="gal-btns">
                <button class="gal-btn gal-fav${e.favorite ? " on" : ""}" data-gal-action="fav" data-idx="${t}" title="${e.favorite ? "Remove from favourites" : "Favourite"}">${e.favorite ? "★" : "☆"}</button>
                ${o ? "" : `<button class="gal-btn gal-del" data-gal-action="delete" data-idx="${t}" title="Delete photo">🗑</button>`}
              </div>
              ${o ? "" : '<div class="gal-set">Set as Profile</div>'}
              <div class="gal-foot">
                ${o ? '<span class="gal-current">✓ CURRENT</span>' : ""}
                ${e.caption ? `<div class="gal-caption">${escapeHtml(String(e.caption))}</div>` : ""}
                ${e.likes ? `<div style="color:var(--accent-gold); font-size:0.7rem;">❤️ ${e.likes}</div>` : ""}
                ${e.timestamp ? `<div style="color:var(--text-dim); font-size:0.7rem;">${new Date(e.timestamp).toLocaleDateString()}</div>` : ""}
              </div>
            </div>`;
        })
        .join("");
    return `
        <h3 style="margin:0 0 15px 0; color:var(--accent);">Photo Gallery</h3>
        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:20px;">
          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">Current Profile Picture</h4>
          <div style="text-align:center;">
            <img src="${i || placeholderImage(200, 200)}" style="width:200px; height:200px; border-radius:10px; object-fit:cover; box-shadow:0 4px 15px var(--l-veil-30); border:3px solid var(--accent-gold);">
            <div style="margin-top:10px; color:var(--text-dim); font-size:0.9rem;">Click any photo below to set as profile picture</div>
            <button onclick="generateNewProfilePicture('${t.id}')" class="gal-generate">🎨 Generate New Profile Picture</button>
          </div>
        </div>
        <div style="background:var(--surface-2); padding:15px; border-radius:8px;">
          <h4 style="margin:0 0 10px 0; color:var(--accent-gold);">
            All Photos (${n.length})
            ${n.length ? `<span style="font-size:0.8rem; color:var(--text-dim); margin-left:10px;">(${s("social")} social, ${s("chat")} chat, ${s("auto-vis")} auto-vis, ${s("generated")} generated)</span>` : ""}
          </h4>
          ${
              n.length
                  ? `<div class="gal-toolbar">
              <button class="gal-chip${"fav" !== galleryView.filter ? " on" : ""}" data-gal-action="filter-all">All ${n.length}</button>
              <button class="gal-chip${"fav" === galleryView.filter ? " on" : ""}" data-gal-action="filter-fav">★ Favourites ${a}</button>
              <span class="gal-note">${l} of images · ★ pins a photo to the top · 🗑 deletes it</span>
            </div>`
                  : ""
          }
          ${
              o.length
                  ? `<div class="gal-grid">${d}</div>`
                  : n.length
                    ? '<div class="gal-empty">No favourites yet — tap ☆ on a photo to add it.</div>'
                    : '<div class="gal-empty"><div style="font-size:3rem; margin-bottom:10px;">📷</div><p style="margin:0;">No photos yet</p><p style="margin:5px 0 0 0; font-size:0.85rem;">Photos will appear here as they are generated through chats, social posts, and other interactions</p></div>'
          }
        </div>`;
}
// Returns true when the gallery tab should re-render.
async function handleGalleryAction(e, t, n) {
    const a = gameState.employees.find((t) => t.id === e);
    if (!a) return !1;
    if ("filter-all" === t || "filter-fav" === t) return (galleryView.filter = "filter-fav" === t ? "fav" : "all"), !0;
    const o = galleryView.empId === e ? galleryView.items[+n] : null;
    if (!o) return !1;
    if ("profile" === t) return o.url !== a.profileImage && setProfilePicture(e, o.url), !1;
    if ("fav" === t) {
        const e = new Set(a.galleryFavorites || []);
        return e.has(o.url) ? e.delete(o.url) : e.add(o.url), (a.galleryFavorites = [...e]), saveGame(!1), !0;
    }
    if ("delete" !== t) return !1;
    if (o.url === a.profileImage) return showNotification("That's the profile picture — set a different one first.", "info"), !1;
    const i =
        { social: "\n\nIt will also be removed from the social post it was on.", chat: "\n\nIt will also be removed from the chat message it came with." }[
            o.source
        ] || "";
    return (
        !!(await showConfirm(
            `Delete this photo from ${a.name}'s gallery?${i}${o.favorite ? "\n\n★ It's one of your favourites." : ""}\n\nSaves and snapshots made before now keep their copy until they're replaced.`,
            "Delete Photo",
            { type: "danger", confirmText: "Delete" }
        )) && (deleteGalleryImage(a, o.url), showNotification("🗑️ Photo deleted", "success"), saveGame(!1), !0)
    );
}
function deleteGalleryImage(e, t) {
    const n = (e) => ("string" == typeof e ? e : e?.url) !== t;
    e.photos && (e.photos = e.photos.filter(n)),
        e.generatedImages && (e.generatedImages = e.generatedImages.filter(n)),
        e.galleryFavorites && (e.galleryFavorites = e.galleryFavorites.filter((e) => e !== t)),
        (gameState.socialNetwork?.posts || []).forEach(
            (n) => n.authorId === e.id && n.imageUrl === t && ((n.imageUrl = null), (n.imageDeleted = !0))
        ),
        // A chat message just loses its picture; a scene image becomes a plain message.
        (gameState.chatHistory[e.id] || []).forEach(
            (e) => e.imageUrl === t && ((e.imageUrl = null), "scene" === e.imageType && delete e.imageType)
        ),
        // The stored image goes once no save or snapshot still uses it.
        "function" == typeof scheduleImageGc && scheduleImageGc("gallery delete", 12e4);
}
async function generateNewProfilePicture(e) {
    const t = gameState.employees.find((t) => t.id === e);
    if (t) {
        showNotification(`🎨 Generating new profile picture for ${t.name}...`, "info", 5e3);
        try {
            const n = `Professional portrait photo: ${getPhysicalDescriptionForPrompt(t)}. ${t.physical?.fashion || "professional"} style outfit. Office setting, soft professional lighting, friendly expression, high quality portrait`,
                a = await queuedGenerateImage(applyImageStyle(n), {}, `New Profile Picture - ${t.name}`);
            a
                ? ((t.profileImage = a),
                  t.photos || (t.photos = []),
                  t.photos.push({
                      url: a,
                      source: "profile",
                      caption: "Generated profile picture",
                      timestamp: Date.now(),
                  }),
                  showNotification(`✅ New profile picture generated for ${t.name}!`),
                  saveGame(),
                  openUnifiedProfile(e, "gallery"),
                  updatePeopleTab())
                : showNotification("❌ Failed to generate image", "error");
        } catch (e) {
            console.error("[Profile] Error generating profile picture:", e),
                showNotification("❌ Error generating profile picture", "error");
        }
    } else showNotification("❌ Employee not found", "error");
}
function openGalleryForProfileUpdate(e) {
    openUnifiedProfile(e, "gallery");
}
