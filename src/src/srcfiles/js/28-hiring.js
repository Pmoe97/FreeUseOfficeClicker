// ============================================================================
// 28-hiring — Hiring modal rendering (showManagerHiringModal), candidate hire/manager selection.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function showManagerHiringModal(e) {
    const t = gameState.products.find((t) => t.id === e);
    if (!t) return;
    (gameState.currentHiringProductId = e), void 0 === gameState.hiringMode && (gameState.hiringMode = "new");
    const n = gameState.rehirePool && gameState.rehirePool.length > 0,
        a = document.createElement("div");
    function o() {
        let t = [];
        (t =
            "rehire" === gameState.hiringMode && n
                ? selectRandomRehires(3 + (gameState.globalUpgrades?.workforce?.recruiting || 0)).map((t) => ({
                      ...t,
                      originalRehireId: t.id,
                      id: `rehire_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                      productId: e,
                      isRehire: !0,
                      loyaltyBonus: calculateLoyaltyBonus(t.timesRehired || 0),
                      hired: !1,
                      employmentStatus: "candidate",
                  }))
                : generatePotentialHires(e)),
            (gameState.currentCandidates = t);
        return t
            .map((e, t) => {
                const n = e.isRehire || !1;
                e.skills ||
                    n ||
                    ((e.skills = {
                        technical: { level: 1, xp: 0, maxXp: 500 },
                        creative: { level: 1, xp: 0, maxXp: 500 },
                        social: { level: 1, xp: 0, maxXp: 500 },
                        management: { level: 1, xp: 0, maxXp: 500 },
                        intimate: { level: 0, xp: 0, maxXp: 500 },
                        cooking: { level: 0, xp: 0, maxXp: 500 },
                        fitness: { level: 0, xp: 0, maxXp: 500 },
                    }),
                    (e.skills.technical.level = 1 + Math.floor(3 * Math.random())),
                    (e.skills.creative.level = 1 + Math.floor(3 * Math.random())),
                    (e.skills.social.level = 1 + Math.floor(3 * Math.random())),
                    (e.skills.management.level = 1 + Math.floor(3 * Math.random())),
                    (e.skills.fitness.level = Math.floor(3 * Math.random())),
                    (e.skills.cooking.level = Math.floor(3 * Math.random())),
                    Object.values(e.skills).forEach((e) => {
                        e.level > 0 && (e.xp = Math.floor(Math.random() * e.maxXp * 0.5));
                    }));
                const a = e.skills || {},
                    o =
                        ((a.technical?.level || 1) +
                            (a.creative?.level || 1) +
                            (a.social?.level || 1) +
                            (a.management?.level || 1)) /
                        4,
                    i = Math.round(10 * (o - 1)),
                    s = [
                        { name: "Technical", level: a.technical?.level || 1, emoji: "💻" },
                        { name: "Creative", level: a.creative?.level || 1, emoji: "🎨" },
                        { name: "Social", level: a.social?.level || 1, emoji: "🤝" },
                        { name: "Management", level: a.management?.level || 1, emoji: "📊" },
                    ]
                        .sort((e, t) => t.level - e.level)
                        .slice(0, 2),
                    r = [
                        { name: "Fitness", level: a.fitness?.level || 0, emoji: "💪" },
                        { name: "Cooking", level: a.cooking?.level || 0, emoji: "🍳" },
                    ]
                        .filter((e) => e.level > 0)
                        .slice(0, 2),
                    l = n
                        ? `<span class="pill pill--gold">⭐ FORMER · +${(100 * e.loyaltyBonus).toFixed(0)}%</span>`
                        : "",
                    c = getRaceDisplayInfo(e.race || "human");
                return `<div class="candidate-card cand${n ? " cand--rehire" : ""}">\n        <div class="cand-h"><span class="cand-av">${(e.name || "?").charAt(0)}</span><div class="cand-id"><span class="nm">${getColoredName(e)}</span><span class="role">Manager Candidate · ${e.age || "—"} · ${c.emoji} ${c.label}</span></div>${l}</div><div class="cand-stats"><div class="tile"><div class="k">Productivity</div><div class="big num">${Math.round((e.stats?.productivity ?? 0) * (1 + (e.loyaltyBonus || 0)))}%</div></div><div class="tile"><div class="k">Trust</div><div class="big num">${Math.round(e.stats?.trust ?? 0)}%</div></div><div class="tile"><div class="k">Professional</div><div class="big num">${Math.round(e.personality?.professional ?? 50)}%</div></div><div class="tile"><div class="k">Confidence</div><div class="big num">${Math.round(e.personality?.confidence ?? 50)}%</div></div></div><div class="cand-skills">${s.map((sk) => `<span class="pill">${sk.emoji} ${sk.name} ${sk.level}</span>`).join("")}${i > 0 ? `<span class="pill pill--pos">+${i}% bonus</span>` : ""}</div><div class="meta">${e.keyTrait || "Dedicated"}${(e.personalityTraits || []).slice(0, 2).length ? " · " + (e.personalityTraits || []).slice(0, 2).join(" · ") : ""}${(e.hobbies || []).length ? " · likes " + e.hobbies[0] : ""}</div><button class="select-candidate-btn btn btn--lg ${n ? "btn--gold" : "btn--pos"} w-full" data-index="${t}">${n ? "⭐ Rehire" : "📝 Hire"}</button></div>`;
            })
            .join("");
    }
    (a.id = "hiringModal"), (a.className = "fuoc-ui"), (a.style.background = "var(--l-veil-70)");
    const i = o();
    (a.innerHTML = `\n    <div class="hiring-modal-panel" role="dialog" aria-modal="true" aria-label="Select an Employee" style="background:var(--surface); width:92%; max-width:920px; max-height:85vh; overflow-y:auto; padding:18px; border-radius:var(--r3); box-shadow:var(--shadow-2); pointer-events:auto; margin:auto;">\n    <div class="card-h" style="position:sticky; top:0; background:var(--surface); z-index:10;">\n      <span class="t">Select Staff · ${t.name}</span>\n      <button class="close-modal-btn" style="background:transparent; border:none; color:var(--text-dim); font-size:1.3rem; cursor:pointer;">✕</button>\n    </div>\n    \n    \x3c!-- Hiring Mode Toggle (always visible) --\x3e\n    <div style="display:flex; justify-content:center; gap:10px; margin-bottom:16px; padding:8px; background:var(--surface-2); border-radius:var(--r2);">\n      <button class="hiring-mode-toggle btn" data-mode="new" style="flex:1; background:${"new" === gameState.hiringMode ? "var(--accent-dim)" : "transparent"}; border:1px solid ${"new" === gameState.hiringMode ? "var(--accent)" : "var(--border-strong)"}; color:${"new" === gameState.hiringMode ? "var(--accent-ink)" : "var(--text-dim)"};">\n        📝 New Hires\n      </button>\n      <button class="hiring-mode-toggle btn" data-mode="rehire" ${n ? "" : "disabled"} style="flex:1; background:${"rehire" === gameState.hiringMode && n ? "var(--accent-gold-dim)" : "transparent"}; border:1px solid ${"rehire" === gameState.hiringMode && n ? "var(--accent-gold)" : "var(--border-strong)"}; color:${"rehire" === gameState.hiringMode && n ? "var(--accent-gold)" : n ? "var(--text-dim)" : "var(--text-mute)"}; cursor:${n ? "pointer" : "not-allowed"}; opacity:${n ? "1" : "0.5"};">\n        ⭐ Rehire Former Employees ${n ? `(${gameState.rehirePool.length})` : "(0)"}\n      </button>\n      <button class="hiring-mode-toggle btn" data-mode="custom" style="flex:1; background:${"custom" === gameState.hiringMode ? "var(--positive-dim)" : "transparent"}; border:1px solid ${"custom" === gameState.hiringMode ? "var(--positive)" : "var(--border-strong)"}; color:${"custom" === gameState.hiringMode ? "var(--positive)" : "var(--text-dim)"};">\n        ✨ Custom Employee\n      </button>\n    </div>\n    \n    <div id="candidates-container" class="hire-grid">\n      ${i}\n    </div>\n    \n    \x3c!-- Custom Employee Creation Container (hidden by default) --\x3e\n    <div id="custom-employee-container" class="panel" style="display:none; margin-top:10px;">\n      \x3c!-- Import Character from File --\x3e\n      <div style="margin-bottom:14px;">\n        <button id="importCharacterBtn" class="btn" style="width:100%; padding:10px; background:linear-gradient(135deg, var(--l-violet) 0%, var(--l-violet-deep-2) 100%); border:none; border-radius:8px; color:var(--l-on-accent); font-weight:600; cursor:pointer;">\n          📥 Import Character from File\n        </button>\n        <p style="text-align:center; color:var(--text-mute); font-size:0.75rem; margin:6px 0 0 0;">Port a character exported from another save (.json)</p>\n      </div>\n      \x3c!-- Custom Mode Sub-Toggle --\x3e\n      <div style="display:flex; justify-content:center; gap:10px; margin-bottom:20px;">\n        <button class="custom-mode-toggle" data-submode="quick" style="padding:10px 20px; background:linear-gradient(135deg, var(--l-green) 0%, var(--l-cyan) 100%); border:2px solid var(--positive); border-radius:8px; color:var(--l-on-accent); cursor:pointer; font-weight:600; transition:all 0.3s;">\n          ⚡ Quick (AI-Assisted)\n        </button>\n        <button class="custom-mode-toggle" data-submode="manual" style="padding:10px 20px; background:transparent; border:2px solid var(--border-strong); border-radius:8px; color:var(--l-ink); cursor:pointer; font-weight:600; transition:all 0.3s;">\n          📋 Manual (Full Form)\n        </button>\n      </div>\n      \n      \x3c!-- Quick Mode Content --\x3e\n      <div id="quick-mode-content" style="display:block;">\n        <div style="text-align:center; margin-bottom:20px;">\n          <h3 style="margin:0 0 10px 0; color:var(--positive);">⚡ Quick Character Creation</h3>\n          <p style="color:var(--text-dim); font-size:0.9rem; margin:0;">Create an employee from a URL (wiki page, character page) or describe them with AI</p>\n        </div>\n        \n        \x3c!-- Recover Last Character Button (only shows if there's pending data) --\x3e\n        <div id="recoverCharacterSection" style="display:none; background:linear-gradient(135deg, var(--l-red-lt) 0%, #ffa502 100%); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">\n            <div>\n              <div style="font-weight:600; color:var(--l-ink);">🔄 Recover Last Character</div>\n              <div id="recoverCharacterInfo" style="font-size:0.85rem; color:var(--l-sheen-80);"></div>\n            </div>\n            <button id="recoverCharacterBtn" style="padding:10px 20px; background:var(--l-ink); border:none; border-radius:6px; color:var(--l-on-accent); cursor:pointer; font-weight:600; white-space:nowrap;">\n              ♻️ Recover\n            </button>\n          </div>\n        </div>\n        \n        \x3c!-- URL-based creation --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <label style="display:block; margin-bottom:8px; color:var(--accent); font-weight:600;">🔗 Create from URL</label>\n          <div style="display:flex; gap:10px;">\n            <input type="text" id="customEmployeeUrlInput" placeholder="https://wiki.example.com/Character_Name" style="flex:1; padding:10px; background:var(--bg); border:1px solid var(--positive); border-radius:6px; color:var(--l-ink); font-size:0.95rem;">\n            <button id="generateFromUrlBtn" class="btn btn--pos" style="white-space:nowrap;">\n              ✨ Generate\n            </button>\n          </div>\n          <p style="color:var(--text-mute); font-size:0.8rem; margin:8px 0 0 0;">Works with wiki pages, fandom pages, character databases, etc.</p>\n        </div>\n        \n        \x3c!-- AI Prompt-based creation --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px;">\n          <label style="display:block; margin-bottom:8px; color:var(--l-pink); font-weight:600;">🤖 Create from Description</label>\n          <textarea id="customEmployeePromptInput" placeholder="Describe your employee... e.g., 'A confident redhead in her late 20s who loves photography and has a mischievous personality. She's a former model turned marketing expert.'" style="width:100%; min-height:80px; padding:10px; background:var(--bg); border:1px solid var(--l-pink); border-radius:6px; color:var(--l-ink); font-size:0.95rem; resize:vertical; font-family:inherit;"></textarea>\n          <button id="generateFromPromptBtn" class="btn btn--primary w-full" style="margin-top:10px;">\n            🎨 Generate Employee from Description\n          </button>\n        </div>\n        \n        \x3c!-- Family Member Creation --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid var(--l-pink);">\n          <label style="display:block; margin-bottom:8px; color:var(--l-pink); font-weight:600;">👨‍👩‍👧 Create Relative of Existing Employee</label>\n          <p style="color:var(--text-dim); font-size:0.8rem; margin:0 0 12px 0;">Inherits ethnicity, some physical traits, and gets linked automatically</p>\n          \n          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">\n            <div>\n              <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Related To</label>\n              <select id="familySourceEmployee" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--l-pink); border-radius:6px; color:var(--l-ink); font-size:0.9rem;">\n                <option value="">-- Select Employee --</option>\n              </select>\n            </div>\n            <div>\n              <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Relationship</label>\n              <select id="familyRelationshipType" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--l-pink); border-radius:6px; color:var(--l-ink); font-size:0.9rem;">\n                <optgroup label="Parents">\n                  <option value="mother">Mother</option>\n                  <option value="father">Father</option>\n                  <option value="stepmother">Stepmother</option>\n                  <option value="stepfather">Stepfather</option>\n                </optgroup>\n                <optgroup label="Siblings">\n                  <option value="sister">Sister</option>\n                  <option value="brother">Brother</option>\n                  <option value="stepsister">Stepsister</option>\n                  <option value="stepbrother">Stepbrother</option>\n                </optgroup>\n                <optgroup label="Children (18+)">\n                  <option value="daughter">Daughter</option>\n                  <option value="son">Son</option>\n                </optgroup>\n                <optgroup label="Extended Family">\n                  <option value="aunt">Aunt</option>\n                  <option value="uncle">Uncle</option>\n                  <option value="cousin">Cousin</option>\n                </optgroup>\n                <optgroup label="Partners">\n                  <option value="spouse">Spouse</option>\n                  <option value="exSpouse">Ex-Spouse</option>\n                </optgroup>\n              </select>\n            </div>\n          </div>\n          \n          <div id="familyPreviewBox" style="background:rgba(255,107,157,0.1); padding:10px; border-radius:6px; margin-bottom:12px; display:none;">\n            <div style="font-size:0.8rem; color:var(--text-dim);">Preview:</div>\n            <div id="familyPreviewText" style="color:var(--l-ink); font-size:0.9rem;"></div>\n          </div>\n          \n          <button id="generateFamilyMemberBtn" class="btn btn--primary w-full" style="opacity:0.5;" disabled>\n            👨‍👩‍👧 Generate Family Member\n          </button>\n        </div>\n        \n        \x3c!-- Optional Extra Instructions --\x3e\n        <div style="background:var(--surface-2); padding:15px; border-radius:8px;">\n          <label style="display:block; margin-bottom:8px; color:var(--accent-gold); font-weight:600;">⚙️ Additional Instructions (Optional)</label>\n          <input type="text" id="customEmployeeExtraInstructions" placeholder="e.g., 'Make her more dominant' or 'She should be shy at first'" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--accent-gold); border-radius:6px; color:var(--l-ink); font-size:0.95rem;">\n        </div>\n      </div>\n      \n      \x3c!-- Manual Mode Content --\x3e\n      <div id="manual-mode-content" style="display:none; max-height:60vh; overflow-y:auto; padding-right:8px; scrollbar-gutter:stable;">\n        <div style="text-align:center; margin-bottom:16px;">\n          <h3 style="margin:0 0 8px 0; color:var(--l-violet);">📋 Full Character Creator</h3>\n          <p style="color:var(--text-dim); font-size:0.9rem; margin:0;">Complete control over every aspect - AI fills empty fields intelligently</p>\n        </div>\n        \n        \x3c!-- Collapsible Sections Container --\x3e\n        \n        \x3c!-- Basic Info Section --\x3e\n        <details open style="background:var(--surface-2); border-radius:8px; margin-bottom:12px;">\n          <summary style="padding:12px 15px; cursor:pointer; color:var(--positive); font-weight:600; user-select:none;">👤 Basic Information</summary>\n          <div style="padding:8px 15px 15px 15px;">\n            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;">\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Name</label>\n                <input type="text" id="manualName" placeholder="Random" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.9rem;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Age (18+)</label>\n                <input type="number" id="manualAge" placeholder="18+" min="18" max="99" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.9rem;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Gender</label>\n                <select id="manualGender" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.9rem;">\n                  <option value="">Auto</option>\n                  <option value="female">Female</option>\n                  <option value="male">Male</option>\n                  <option value="female_futa">Futa</option>\n                  <option value="trans_woman">Trans Woman</option>\n                  <option value="trans_man">Trans Man</option>\n                  <option value="non-binary">Non-Binary</option>\n                </select>\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Race/Species</label>\n                <select id="manualRace" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.9rem;">\n                  <option value="">Auto</option>\n                  <optgroup label="Standard">\n                    <option value="human">Human</option>\n                  </optgroup>\n                  <optgroup label="Fantasy - Fae">\n                    <option value="elf">Elf</option>\n                    <option value="fairy">Fairy</option>\n                    <option value="dryad">Dryad</option>\n                  </optgroup>\n                  <optgroup label="Fantasy - Beastfolk">\n                    <option value="catgirl">Catgirl</option>\n                    <option value="catboy">Catboy</option>\n                    <option value="foxgirl">Foxgirl</option>\n                    <option value="foxboy">Foxboy</option>\n                    <option value="wolfgirl">Wolfgirl</option>\n                    <option value="wolfboy">Wolfboy</option>\n                    <option value="bunny">Bunnygirl/boy</option>\n                    <option value="werewolf">Werewolf</option>\n                  </optgroup>\n                  <optgroup label="Fantasy - Infernal/Divine">\n                    <option value="succubus">Succubus</option>\n                    <option value="incubus">Incubus</option>\n                    <option value="demon">Demon</option>\n                    <option value="tiefling">Tiefling</option>\n                    <option value="angel">Angel</option>\n                    <option value="vampire">Vampire</option>\n                  </optgroup>\n                  <optgroup label="Fantasy - Classic">\n                    <option value="orc">Orc</option>\n                    <option value="goblin">Goblin</option>\n                    <option value="dwarf">Dwarf</option>\n                    <option value="halfling">Halfling</option>\n                    <option value="dragonborn">Dragonborn</option>\n                  </optgroup>\n                  <optgroup label="Sci-Fi & Other">\n                    <option value="robot">Robot/Android</option>\n                    <option value="cyborg">Cyborg</option>\n                    <option value="alien">Alien</option>\n                    <option value="slime">Slime</option>\n                    <option value="ghost">Ghost</option>\n                    <option value="mermaid">Mermaid/Merman</option>\n                    <option value="lamia">Lamia (Snake)</option>\n                    <option value="centaur">Centaur</option>\n                    <option value="harpy">Harpy</option>\n                  </optgroup>\n                  <optgroup label="Custom">\n                    <option value="custom">✨ Custom Race...</option>\n                  </optgroup>\n                </select>\n              </div>\n            </div>\n            \n            \x3c!-- Custom Race Builder (hidden by default) --\x3e\n            <div id="customRaceBuilder" style="display:none; margin-top:12px; padding:12px; background:var(--l-panel); border-radius:8px; border:1px solid var(--l-violet);">\n              <label style="display:block; margin-bottom:8px; color:var(--l-violet); font-size:0.9rem; font-weight:600;">✨ Custom Race Details</label>\n              \n              <div style="margin-bottom:10px;">\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Race Name <span style="color:var(--danger);">*</span></label>\n                <input type="text" id="customRaceName" placeholder="e.g., Tiefling, Naga, Kitsune..." \n                  style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--l-violet); border-radius:4px; color:var(--l-ink); font-size:0.9rem;">\n              </div>\n              \n              <div id="customRaceDetails" style="margin-top:10px;">\n                \x3c!-- Defining details will be added here dynamically --\x3e\n              </div>\n              \n              <button type="button" id="addCustomRaceDetail" style="margin-top:8px; padding:6px 12px; background:rgba(199,125,255,0.2); border:1px solid var(--l-violet); border-radius:4px; color:var(--l-violet); cursor:pointer; font-size:0.8rem; transition:all 0.2s;"\n                onmouseover="this.style.background='rgba(199,125,255,0.4)'" onmouseout="this.style.background='rgba(199,125,255,0.2)'">\n                ➕ Add Defining Detail\n              </button>\n              \n              <div style="margin-top:10px; padding:8px; background:var(--l-veil-20); border-radius:4px; font-size:0.75rem; color:var(--text-mute);">\n                💡 <strong>Examples:</strong> "Horns" → "Long, curved, obsidian black with red glow" | "Tail" → "Prehensile, scaled, 3ft long" | "Skin" → "Pale blue with bioluminescent markings"\n              </div>\n            </div>\n            \n            \x3c!-- Ethnicity (only shown for humans) --\x3e\n            <div id="manualEthnicityRow" style="margin-top:10px;">\n              <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Ethnicity (for humans)</label>\n              <select id="manualEthnicity" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.9rem;">\n                <option value="">Auto</option>\n                <optgroup label="Europe & Americas">\n                  <option value="caucasian">Caucasian/European</option>\n                  <option value="latino">Latino/Hispanic</option>\n                  <option value="nativeAmerican">Native American/Indigenous</option>\n                </optgroup>\n                <optgroup label="Africa">\n                  <option value="black">Black/African</option>\n                </optgroup>\n                <optgroup label="East Asia">\n                  <option value="eastAsian">East Asian (General)</option>\n                  <option value="eastAsian-japanese">East Asian - Japanese</option>\n                  <option value="eastAsian-chinese">East Asian - Chinese</option>\n                  <option value="eastAsian-korean">East Asian - Korean</option>\n                </optgroup>\n                <optgroup label="Southeast Asia">\n                  <option value="southeastAsian">Southeast Asian (General)</option>\n                  <option value="southeastAsian-thai">Southeast Asian - Thai</option>\n                  <option value="southeastAsian-vietnamese">Southeast Asian - Vietnamese</option>\n                  <option value="southeastAsian-filipino">Southeast Asian - Filipino</option>\n                  <option value="southeastAsian-indonesian">Southeast Asian - Indonesian</option>\n                </optgroup>\n                <optgroup label="South & Central Asia">\n                  <option value="southAsian">South Asian (Indian, Pakistani, etc.)</option>\n                  <option value="centralAsian">Central Asian (Kazakh, Mongolian, etc.)</option>\n                </optgroup>\n                <optgroup label="Middle East">\n                  <option value="middleEastern">Middle Eastern/North African</option>\n                </optgroup>\n                <optgroup label="Oceania">\n                  <option value="pacificIslander">Pacific Islander (General)</option>\n                  <option value="pacificIslander-hawaiian">Pacific Islander - Hawaiian</option>\n                  <option value="pacificIslander-samoan">Pacific Islander - Samoan</option>\n                  <option value="pacificIslander-maori">Pacific Islander - Māori</option>\n                  <option value="indigenous">Indigenous Australian/Aboriginal</option>\n                </optgroup>\n                <optgroup label="Mixed">\n                  <option value="mixed">Mixed Ethnicity</option>\n                </optgroup>\n              </select>\n            </div>\n          </div>\n        </details>\n        \n        \x3c!-- Personality Section (C.O.F.P.H.) --\x3e\n        <details open style="background:var(--surface-2); border-radius:8px; margin-bottom:12px;">\n          <summary style="padding:12px 15px; cursor:pointer; color:var(--l-pink); font-weight:600; user-select:none;">💫 Personality (C.O.F.P.H.)</summary>\n          <div style="padding:8px 15px 15px 15px;">\n            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px 16px;">\n              <div>\n                <label style="display:block; margin-bottom:2px; color:var(--text-dim); font-size:0.75rem;">Confidence <span id="manualConfidenceValue" style="color:var(--positive);">50</span></label>\n                <input type="range" id="manualConfidence" min="0" max="100" value="50" style="width:100%;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:2px; color:var(--text-dim); font-size:0.75rem;">Outgoing <span id="manualOutgoingValue" style="color:var(--positive);">50</span></label>\n                <input type="range" id="manualOutgoing" min="0" max="100" value="50" style="width:100%;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:2px; color:var(--text-dim); font-size:0.75rem;">Flirty <span id="manualFlirtyValue" style="color:var(--positive);">50</span></label>\n                <input type="range" id="manualFlirty" min="0" max="100" value="50" style="width:100%;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:2px; color:var(--text-dim); font-size:0.75rem;">Professional <span id="manualProfessionalValue" style="color:var(--positive);">50</span></label>\n                <input type="range" id="manualProfessional" min="0" max="100" value="50" style="width:100%;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:2px; color:var(--text-dim); font-size:0.75rem;">Humor <span id="manualHumorValue" style="color:var(--positive);">50</span></label>\n                <input type="range" id="manualHumor" min="0" max="100" value="50" style="width:100%;">\n              </div>\n            </div>\n          </div>\n        </details>\n        \n        \x3c!-- Relationship Stats Section --\x3e\n        <details style="background:var(--surface-2); border-radius:8px; margin-bottom:12px;">\n          <summary style="padding:12px 15px; cursor:pointer; color:var(--danger); font-weight:600; user-select:none;">❤️ Starting Relationship Stats</summary>\n          <div style="padding:8px 15px 15px 15px;">\n            <p style="color:var(--text-mute); font-size:0.75rem; margin:0 0 12px 0;">Set initial relationship levels (default: randomized based on HR settings)</p>\n            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px 16px;">\n              <div>\n                <label style="display:block; margin-bottom:2px; color:var(--danger); font-size:0.75rem;">❤️ Affection <span id="manualAffectionValue" style="color:var(--danger);">-</span></label>\n                <input type="range" id="manualAffection" min="0" max="100" value="-1" style="width:100%;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:2px; color:var(--positive); font-size:0.75rem;">😊 Comfort <span id="manualComfortValue" style="color:var(--positive);">-</span></label>\n                <input type="range" id="manualComfort" min="0" max="100" value="-1" style="width:100%;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:2px; color:var(--accent); font-size:0.75rem;">🤝 Trust <span id="manualTrustValue" style="color:var(--accent);">-</span></label>\n                <input type="range" id="manualTrust" min="0" max="100" value="-1" style="width:100%;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:2px; color:var(--l-pink); font-size:0.75rem;">💕 Desire <span id="manualDesireValue" style="color:var(--l-pink);">-</span></label>\n                <input type="range" id="manualDesire" min="0" max="100" value="-1" style="width:100%;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:2px; color:var(--accent-gold); font-size:0.75rem;">🤗 Friendship <span id="manualFriendshipValue" style="color:var(--accent-gold);">-</span></label>\n                <input type="range" id="manualFriendship" min="0" max="100" value="-1" style="width:100%;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:2px; color:var(--l-violet); font-size:0.75rem;">🔗 Obedience <span id="manualObedienceValue" style="color:var(--l-violet);">-</span></label>\n                <input type="range" id="manualObedience" min="0" max="100" value="-1" style="width:100%;">\n              </div>\n            </div>\n          </div>\n        </details>\n        \n        \x3c!-- Work Stats Section --\x3e\n        <details style="background:var(--surface-2); border-radius:8px; margin-bottom:12px;">\n          <summary style="padding:12px 15px; cursor:pointer; color:var(--accent-gold); font-weight:600; user-select:none;">💼 Work Performance</summary>\n          <div style="padding:8px 15px 15px 15px;">\n            <div style="display:grid; grid-template-columns:1fr; gap:12px;">\n              <div>\n                <label style="display:block; margin-bottom:2px; color:var(--accent-gold); font-size:0.75rem;">💼 Productivity <span id="manualProductivityValue" style="color:var(--accent-gold);">-</span></label>\n                <input type="range" id="manualProductivity" min="0" max="100" value="-1" style="width:100%;">\n              </div>\n            </div>\n            <div style="margin-top:12px;">\n              <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Starting Position Level</label>\n              <select id="manualCareerLevel" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.9rem;">\n                <option value="1">Staff (Level 1) - Default</option>\n                <option value="2">Local Manager (Level 2)</option>\n                <option value="3">Regional Manager (Level 3)</option>\n                <option value="4">Branch Manager (Level 4)</option>\n                <option value="5">Division Head (Level 5)</option>\n              </select>\n            </div>\n            \n            \x3c!-- Position Slot Selector (shown when level > 1 or when there are multiple slots) --\x3e\n            <div id="positionSlotSelector" style="margin-top:10px; display:none;">\n              <label style="display:block; margin-bottom:4px; color:var(--l-pink); font-size:0.8rem;">⚠️ Assign to Position Slot</label>\n              <select id="manualPositionSlot" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--l-pink); border-radius:4px; color:var(--l-ink); font-size:0.9rem;">\n                \x3c!-- Options populated dynamically --\x3e\n              </select>\n              <p id="positionSlotWarning" style="color:var(--l-pink); font-size:0.75rem; margin:6px 0 0 0;"></p>\n            </div>\n            \n            <div style="margin-top:10px;">\n              <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Custom Salary (optional)</label>\n              <input type="number" id="manualSalary" placeholder="Auto-calculate from level" min="0" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.9rem;">\n            </div>\n          </div>\n        </details>\n        \n        \x3c!-- Traits & Interests Section --\x3e\n        <details style="background:var(--surface-2); border-radius:8px; margin-bottom:12px;">\n          <summary style="padding:12px 15px; cursor:pointer; color:var(--accent); font-weight:600; user-select:none;">🎯 Traits & Interests</summary>\n          <div style="padding:8px 15px 15px 15px;">\n            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Personality Traits</label>\n                <input type="text" id="manualTraits" placeholder="Playful, Confident, Witty" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Hobbies</label>\n                <input type="text" id="manualHobbies" placeholder="Photography, Gaming, Yoga" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n              </div>\n            </div>\n            <div style="margin-top:10px;">\n              <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Kinks/Preferences (comma separated)</label>\n              <input type="text" id="manualKinks" placeholder="Roleplay, Teasing, Praise" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n            </div>\n            <div style="margin-top:10px;">\n              <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Key Trait (main defining trait)</label>\n              <input type="text" id="manualKeyTrait" placeholder="e.g., Charismatic, Analytical, Creative" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n            </div>\n          </div>\n        </details>\n        \n        \x3c!-- Physical Appearance Section --\x3e\n        <details style="background:var(--surface-2); border-radius:8px; margin-bottom:12px;">\n          <summary style="padding:12px 15px; cursor:pointer; color:var(--l-violet); font-weight:600; user-select:none;">👁️ Physical Appearance</summary>\n          <div style="padding:8px 15px 15px 15px;">\n            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px 12px;">\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.75rem;">Hair Color</label>\n                <input type="text" id="manualHairColor" placeholder="Red, Blonde" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.75rem;">Hair Style</label>\n                <input type="text" id="manualHairStyle" placeholder="Long waves" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.75rem;">Hair Length</label>\n                <select id="manualHairLength" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n                  <option value="">Auto</option>\n                  <option value="short">Short</option>\n                  <option value="medium">Medium</option>\n                  <option value="long">Long</option>\n                  <option value="very long">Very Long</option>\n                </select>\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.75rem;">Eye Color</label>\n                <input type="text" id="manualEyeColor" placeholder="Blue, Green" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.75rem;">Eye Shape</label>\n                <input type="text" id="manualEyeShape" placeholder="Almond, Round" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.75rem;">Skin Tone</label>\n                <input type="text" id="manualSkinTone" placeholder="Fair, Tan, Dark" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.75rem;">Body Shape</label>\n                <select id="manualBodyShape" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n                  <option value="">Auto</option>\n                  <option value="petite">Petite</option>\n                  <option value="slim">Slim</option>\n                  <option value="athletic">Athletic</option>\n                  <option value="average">Average</option>\n                  <option value="curvy">Curvy</option>\n                  <option value="plus-size">Plus-size</option>\n                  <option value="muscular">Muscular</option>\n                </select>\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.75rem;">Height/Build</label>\n                <input type="text" id="manualHeightBuild" placeholder="5'6 slim" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.75rem;">Breast Size</label>\n                <select id="manualBreastSize" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n                  <option value="">Auto</option>\n                  <option value="flat">Flat</option>\n                  <option value="small">Small</option>\n                  <option value="medium">Medium</option>\n                  <option value="large">Large</option>\n                  <option value="very large">Very Large</option>\n                </select>\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.75rem;">Butt Size</label>\n                <select id="manualButtSize" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n                  <option value="">Auto</option>\n                  <option value="small">Small</option>\n                  <option value="medium">Medium</option>\n                  <option value="large">Large</option>\n                  <option value="very large">Very Large</option>\n                </select>\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.75rem;">Fashion Style</label>\n                <input type="text" id="manualFashion" placeholder="Casual, Professional" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n              </div>\n            </div>\n            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px;">\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Accessories</label>\n                <select id="manualAccessories" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n                  <option value="">Auto-generate</option>\n                  <option value="none">None (no accessories)</option>\n                  <option value="glasses">Glasses</option>\n                  <option value="sunglasses">Sunglasses</option>\n                  <option value="earrings">Earrings</option>\n                  <option value="necklace">Necklace</option>\n                  <option value="choker">Choker</option>\n                  <option value="watch">Watch</option>\n                  <option value="bracelet">Bracelet</option>\n                  <option value="glasses, earrings">Glasses + Earrings</option>\n                  <option value="glasses, necklace">Glasses + Necklace</option>\n                  <option value="custom">Custom (type below)</option>\n                </select>\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Custom Accessories</label>\n                <input type="text" id="manualAccessoriesCustom" placeholder="e.g. gold hoop earrings, reading glasses" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n              </div>\n            </div>\n            <div style="margin-top:10px;">\n              <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Notable Features</label>\n              <input type="text" id="manualNotableFeatures" placeholder="Freckles, Tattoos, Piercings, Beauty mark, etc." style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n            </div>\n          </div>\n        </details>\n        \n        \x3c!-- Personal Life Section --\x3e\n        <details style="background:var(--surface-2); border-radius:8px; margin-bottom:12px;">\n          <summary style="padding:12px 15px; cursor:pointer; color:var(--l-pink); font-weight:600; user-select:none;">🏠 Personal Life</summary>\n          <div style="padding:8px 15px 15px 15px;">\n            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Living Situation</label>\n                <select id="manualLivingSituation" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n                  <option value="">Auto</option>\n                  <option value="apartment">Apartment</option>\n                  <option value="house">House</option>\n                  <option value="condo">Condo</option>\n                  <option value="studio">Studio</option>\n                  <option value="with-roommate">With Roommate</option>\n                  <option value="with-family">With Family</option>\n                </select>\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Relationship Status</label>\n                <select id="manualRelationshipStatus" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n                  <option value="">Auto</option>\n                  <option value="single">Single</option>\n                  <option value="dating">Dating</option>\n                  <option value="serious">In Relationship</option>\n                  <option value="engaged">Engaged</option>\n                  <option value="married">Married</option>\n                  <option value="divorced">Divorced</option>\n                  <option value="widowed">Widowed</option>\n                  <option value="complicated">It's Complicated</option>\n                </select>\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Sexual Orientation</label>\n                <select id="manualSexualOrientation" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n                  <option value="">Random</option>\n                  <option value="straight">Straight</option>\n                  <option value="bisexual">Bisexual</option>\n                  <option value="gay">Gay</option>\n                  <option value="lesbian">Lesbian</option>\n                  <option value="pansexual">Pansexual</option>\n                  <option value="asexual">Asexual</option>\n                </select>\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Has Pet?</label>\n                <select id="manualHasPet" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n                  <option value="">Random</option>\n                  <option value="no">No</option>\n                  <option value="cat">Cat</option>\n                  <option value="dog">Dog</option>\n                  <option value="bird">Bird</option>\n                  <option value="fish">Fish</option>\n                  <option value="other">Other Pet</option>\n                </select>\n              </div>\n            </div>\n          </div>\n        </details>\n        \n        \x3c!-- Schedule Section --\x3e\n        <details style="background:var(--surface-2); border-radius:8px; margin-bottom:12px;">\n          <summary style="padding:12px 15px; cursor:pointer; color:var(--positive); font-weight:600; user-select:none;">🕐 Work Schedule</summary>\n          <div style="padding:8px 15px 15px 15px;">\n            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Start Hour (24h)</label>\n                <input type="number" id="manualWorkStart" placeholder="9" min="0" max="23" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.9rem;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">End Hour (24h)</label>\n                <input type="number" id="manualWorkEnd" placeholder="17" min="0" max="23" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.9rem;">\n              </div>\n              <div>\n                <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">PTO Days</label>\n                <input type="number" id="manualPTO" placeholder="10" min="0" max="30" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.9rem;">\n              </div>\n            </div>\n            <div style="margin-top:10px;">\n              <label style="display:block; margin-bottom:4px; color:var(--text-dim); font-size:0.8rem;">Work Days</label>\n              <div style="display:flex; gap:5px; flex-wrap:wrap;">\n                <label style="display:flex; align-items:center; gap:3px; color:var(--text-dim); font-size:0.8rem;">\n                  <input type="checkbox" id="manualWorkMon" checked> Mon\n                </label>\n                <label style="display:flex; align-items:center; gap:3px; color:var(--text-dim); font-size:0.8rem;">\n                  <input type="checkbox" id="manualWorkTue" checked> Tue\n                </label>\n                <label style="display:flex; align-items:center; gap:3px; color:var(--text-dim); font-size:0.8rem;">\n                  <input type="checkbox" id="manualWorkWed" checked> Wed\n                </label>\n                <label style="display:flex; align-items:center; gap:3px; color:var(--text-dim); font-size:0.8rem;">\n                  <input type="checkbox" id="manualWorkThu" checked> Thu\n                </label>\n                <label style="display:flex; align-items:center; gap:3px; color:var(--text-dim); font-size:0.8rem;">\n                  <input type="checkbox" id="manualWorkFri" checked> Fri\n                </label>\n                <label style="display:flex; align-items:center; gap:3px; color:var(--text-dim); font-size:0.8rem;">\n                  <input type="checkbox" id="manualWorkSat"> Sat\n                </label>\n                <label style="display:flex; align-items:center; gap:3px; color:var(--text-dim); font-size:0.8rem;">\n                  <input type="checkbox" id="manualWorkSun"> Sun\n                </label>\n              </div>\n            </div>\n          </div>\n        </details>\n        \n        \x3c!-- Starting Flags Section --\x3e\n        <details style="background:var(--surface-2); border-radius:8px; margin-bottom:12px;">\n          <summary style="padding:12px 15px; cursor:pointer; color:var(--danger); font-weight:600; user-select:none;">🚩 Starting Flags (Advanced)</summary>\n          <div style="padding:8px 15px 15px 15px;">\n            <p style="color:var(--text-mute); font-size:0.75rem; margin:0 0 10px 0;">Add custom flags/tags for this character (comma separated)</p>\n            <input type="text" id="manualFlags" placeholder="e.g., exhibitionist_curious, dom_leaning, pet_owner" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--danger); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n            <p style="color:var(--l-on-accent); font-size:0.7rem; margin:8px 0 0 0;">Common flags: shy, dominant, submissive, curious, experienced, virgin, kinky, vanilla</p>\n          </div>\n        </details>\n        \n        \x3c!-- Bio Section --\x3e\n        <details open style="background:var(--surface-2); border-radius:8px; margin-bottom:12px;">\n          <summary style="padding:12px 15px; cursor:pointer; color:var(--accent-gold); font-weight:600; user-select:none;">📝 Biography & Backstory</summary>\n          <div style="padding:8px 15px 15px 15px;">\n            <textarea id="manualBio" placeholder="Write their backstory, motivations, secrets, and personality quirks... Leave blank to auto-generate based on other fields." style="width:100%; min-height:100px; padding:10px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-family:inherit; resize:vertical; font-size:0.9rem;"></textarea>\n          </div>\n        </details>\n        \n        \x3c!-- Create Button --\x3e\n        <button id="createManualEmployeeBtn" class="btn btn--lg btn--pos w-full" style="position:sticky; bottom:0;">\n          ✨ Create Custom Employee\n        </button>\n      </div>\n    </div>\n    <p style="margin-top:12px; color:var(--text-dim); font-size:.9rem;">You’ll be charged <strong class="num">$${formatNumber(getManagerHireCost(t))}</strong> when you choose a candidate.</p>\n    </div>\n  `),
        ModalManager.show(a, "hiringModal"),
        a.addEventListener("click", (e) => {
            e.target === a && closeHiringModal();
        });
    const s = a.querySelector(".close-modal-btn");
    s && s.addEventListener("click", closeHiringModal);
    a.querySelectorAll(".select-candidate-btn").forEach((e) => {
        e.addEventListener("click", () => {
            const t = parseInt(e.dataset.index, 10);
            if (!Number.isNaN(t)) {
                const e = gameState.currentCandidates?.[t];
                e?.isRehire ? (finalizeRehire(t, 1), closeHiringModal()) : selectManagerCandidate(t);
            }
        });
    });
    const r = a.querySelectorAll(".hiring-mode-toggle");
    r.forEach((e) => {
        e.addEventListener("click", () => {
            const t = e.dataset.mode;
            if (t && ("new" === t || "rehire" === t || "custom" === t)) {
                gameState.hiringMode = t;
                const e = a.querySelector("#candidates-container"),
                    n = a.querySelector("#custom-employee-container");
                if ("custom" === t)
                    e && (e.style.display = "none"),
                        n && (n.style.display = "block"),
                        updateRecoverCharacterButton(a);
                else {
                    e && (e.style.display = "flex"), n && (n.style.display = "none");
                    const t = o();
                    e && (e.innerHTML = t);
                    a.querySelectorAll(".select-candidate-btn").forEach((e) => {
                        e.addEventListener("click", () => {
                            const t = parseInt(e.dataset.index, 10);
                            if (!Number.isNaN(t)) {
                                const e = gameState.currentCandidates?.[t];
                                e?.isRehire
                                    ? (finalizeRehire(t, 1), closeHiringModal())
                                    : selectManagerCandidate(t);
                            }
                        });
                    });
                }
                r.forEach((e) => {
                    e.dataset.mode === t
                        ? "rehire" === t
                            ? ((e.style.background = "linear-gradient(135deg, var(--l-gold) 0%, #ff8c00 100%)"),
                              (e.style.borderColor = "var(--l-gold)"),
                              (e.style.color = "var(--l-on-accent)"))
                            : "custom" === t
                              ? ((e.style.background = "linear-gradient(135deg, var(--l-green) 0%, var(--l-cyan) 100%)"),
                                (e.style.borderColor = "var(--l-green)"),
                                (e.style.color = "var(--l-ink)"))
                              : ((e.style.background = "linear-gradient(135deg, var(--l-red) 0%, var(--l-line) 100%)"),
                                (e.style.borderColor = "var(--l-red)"),
                                (e.style.color = "var(--l-ink)"))
                        : ((e.style.background = "transparent"),
                          (e.style.borderColor = "var(--l-neutral-5)"),
                          (e.style.color = "var(--l-ink)"));
                });
            }
        });
    });
    const l = a.querySelectorAll(".custom-mode-toggle");
    l.forEach((e) => {
        e.addEventListener("click", () => {
            const t = e.dataset.submode,
                n = a.querySelector("#quick-mode-content"),
                o = a.querySelector("#manual-mode-content");
            "quick" === t
                ? (n && (n.style.display = "block"), o && (o.style.display = "none"))
                : (n && (n.style.display = "none"), o && (o.style.display = "block")),
                l.forEach((e) => {
                    e.dataset.submode === t
                        ? ((e.style.background = "linear-gradient(135deg, var(--l-green) 0%, var(--l-cyan) 100%)"),
                          (e.style.borderColor = "var(--l-green)"))
                        : ((e.style.background = "transparent"), (e.style.borderColor = "var(--l-neutral-5)"));
                });
        });
    });
    const importCharBtn = a.querySelector("#importCharacterBtn");
    importCharBtn && importCharBtn.addEventListener("click", () => importCharacterFromFile(e));
    [
        { slider: "manualConfidence", value: "manualConfidenceValue" },
        { slider: "manualOutgoing", value: "manualOutgoingValue" },
        { slider: "manualFlirty", value: "manualFlirtyValue" },
        { slider: "manualProfessional", value: "manualProfessionalValue" },
        { slider: "manualHumor", value: "manualHumorValue" },
        { slider: "manualAffection", value: "manualAffectionValue", showDash: !0 },
        { slider: "manualComfort", value: "manualComfortValue", showDash: !0 },
        { slider: "manualTrust", value: "manualTrustValue", showDash: !0 },
        { slider: "manualDesire", value: "manualDesireValue", showDash: !0 },
        { slider: "manualFriendship", value: "manualFriendshipValue", showDash: !0 },
        { slider: "manualObedience", value: "manualObedienceValue", showDash: !0 },
        { slider: "manualProductivity", value: "manualProductivityValue", showDash: !0 },
    ].forEach((e) => {
        const t = a.querySelector(`#${e.slider}`),
            n = a.querySelector(`#${e.value}`);
        t &&
            n &&
            (e.showDash && ((t.value = -1), (n.textContent = "-")),
            t.addEventListener("input", () => {
                const a = parseInt(t.value);
                e.showDash && a < 0
                    ? (n.textContent = "-")
                    : ((n.textContent = Math.max(0, a)), a < 0 && (t.value = 0));
            }));
    });
    const c = a.querySelector("#manualRace"),
        d = a.querySelector("#manualEthnicityRow"),
        p = a.querySelector("#customRaceBuilder"),
        m = a.querySelector("#customRaceDetails"),
        u = a.querySelector("#addCustomRaceDetail");
    let g = 0;
    const h = () => {
        g++;
        const e = g,
            t = document.createElement("div");
        (t.className = "custom-race-detail-row"),
            (t.dataset.detailId = e),
            (t.style.cssText =
                "display:grid; grid-template-columns:1fr 2fr auto; gap:8px; margin-bottom:8px; align-items:start;"),
            (t.innerHTML =
                '\n        <div>\n          <input type="text" class="custom-detail-name" placeholder="Feature name (e.g., Horns)" \n            style="width:100%; padding:6px 8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n        </div>\n        <div>\n          <input type="text" class="custom-detail-desc" placeholder="Description (e.g., Long, curved, obsidian black)" \n            style="width:100%; padding:6px 8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n        </div>\n        <button type="button" class="remove-detail-btn" style="padding:6px 10px; background:rgba(233,69,96,0.2); border:1px solid var(--danger); border-radius:4px; color:var(--danger); cursor:pointer; font-size:0.8rem;"\n          onmouseover="this.style.background=\'rgba(233,69,96,0.4)\'" onmouseout="this.style.background=\'rgba(233,69,96,0.2)\'">&times;</button>\n      ');
        t.querySelector(".remove-detail-btn").addEventListener("click", () => {
            t.remove();
        }),
            m.appendChild(t);
    };
    if ((u && u.addEventListener("click", h), c && d)) {
        const e = () => {
            const e = c.value.toLowerCase();
            if (
                (p &&
                    ("custom" === e
                        ? ((p.style.display = "block"), m && 0 === m.children.length && h())
                        : (p.style.display = "none")),
                "" === e || "human" === e)
            )
                d.style.display = "block";
            else {
                d.style.display = "none";
                const e = a.querySelector("#manualEthnicity");
                e && (e.value = "");
            }
        };
        c.addEventListener("change", e), e();
    }
    const y = a.querySelector("#manualAccessories"),
        f = a.querySelector("#manualAccessoriesCustom");
    if (y && f) {
        const e = () => {
            "custom" === y.value
                ? ((f.placeholder = "Type your custom accessories..."), (f.style.borderColor = "var(--l-green)"))
                : "none" === y.value
                  ? ((f.placeholder = "(No accessories selected)"), (f.style.borderColor = "var(--l-neutral-5)"), (f.value = ""))
                  : ((f.placeholder = "Or type custom accessories here..."), (f.style.borderColor = "var(--l-neutral-5)"));
        };
        y.addEventListener("change", e), e();
    }
    const b = a.querySelector("#manualCareerLevel"),
        v = a.querySelector("#positionSlotSelector"),
        w = a.querySelector("#manualPositionSlot"),
        x = a.querySelector("#positionSlotWarning");
    function S(t) {
        if (!w || !v) return;
        const n = gameState.corporatePyramid?.positions?.[t] || [],
            a = n.filter((e) => !e.employeeId);
        w.innerHTML = "";
        let o = 0;
        if (0 === a.length)
            (w.innerHTML = '<option value="">⚠️ No empty slots at this level</option>'),
                (x.textContent = `All ${gameState.hierarchyLevels[t]?.title || "Level " + t} positions are filled. Promote or fire someone first.`),
                (x.style.display = "block"),
                (x.style.color = "var(--l-pink)");
        else {
            if (
                (a.forEach((a, i) => {
                    const s = gameState.products.find((e) => e.id === a.productId),
                        r = s?.name || a.productId || "Unknown",
                        l = gameState.hierarchyLevels[t],
                        c = document.createElement("option");
                    (c.value = JSON.stringify({ level: a.level, productId: a.productId, index: n.indexOf(a) })),
                        (c.textContent = `${l?.title || "Level " + t} - ${r}`),
                        a.productId === e && (o = i),
                        w.appendChild(c);
                }),
                w.options[o] && (w.selectedIndex = o),
                1 === a.length)
            )
                x.textContent = "This is the only empty slot at this level.";
            else {
                const n = gameState.products.find((t) => t.id === e);
                a.some((t) => t.productId === e)
                    ? (x.textContent = `${a.length} slots available. Pre-selected: ${n?.name || e}`)
                    : (x.textContent = `${a.length} slots available. The ${n?.name || e} doesn't have a Level ${t} slot.`);
            }
            (x.style.color = "var(--l-green)"), (x.style.display = "block");
        }
        const i = (gameState.corporatePyramid?.positions?.[1] || []).filter((e) => !e.employeeId);
        t > 1 || i.length > 1 ? (v.style.display = "block") : (v.style.display = "none");
    }
    b &&
        (S(parseInt(b.value) || 1),
        b.addEventListener("change", () => {
            S(parseInt(b.value) || 1);
        }));
    const k = a.querySelector("#manualAge");
    k &&
        (k.addEventListener("change", () => {
            const e = parseInt(k.value);
            !isNaN(e) && e < 18 && (k.value = 18);
        }),
        k.addEventListener("blur", () => {
            const e = parseInt(k.value);
            !isNaN(e) && e < 18 && (k.value = 18);
        }));
    const T = a.querySelector("#recoverCharacterBtn");
    T &&
        T.addEventListener("click", () => {
            pendingCustomEmployeeData &&
                showCharacterConfirmationModal(
                    pendingCustomEmployeeData,
                    pendingCustomEmployeeProductId || e,
                    pendingCustomEmployeeSource || "Recovered"
                );
        }),
        updateRecoverCharacterButton(a);
    const C = a.querySelector("#generateFromUrlBtn");
    C &&
        C.addEventListener("click", async () => {
            const t = a.querySelector("#customEmployeeUrlInput"),
                n = a.querySelector("#customEmployeeExtraInstructions"),
                o = t?.value?.trim();
            if (o) {
                closeHiringModal(),
                    showNotification(
                        "🔗 Generating character in background... You can continue playing!",
                        "info",
                        5e3
                    );
                try {
                    const t = await generateEmployeeFromUrl(o, n?.value || "", e);
                    t && showCharacterConfirmationModal(t, e, "URL");
                } catch (e) {
                    console.error("URL generation error:", e),
                        showNotification(
                            "Failed to generate from URL. Try a different page or use description mode.",
                            "error"
                        );
                }
            } else showNotification("Please enter a URL", "error");
        });
    const E = a.querySelector("#generateFromPromptBtn");
    E &&
        E.addEventListener("click", async () => {
            const t = a.querySelector("#customEmployeePromptInput"),
                n = a.querySelector("#customEmployeeExtraInstructions"),
                o = t?.value?.trim();
            if (o) {
                closeHiringModal(),
                    showNotification(
                        "🤖 Generating character in background... You can continue playing!",
                        "info",
                        5e3
                    );
                try {
                    const t = await generateEmployeeFromPrompt(o, n?.value || "", e);
                    t && showCharacterConfirmationModal(t, e, "Description");
                } catch (e) {
                    console.error("Prompt generation error:", e),
                        showNotification("Failed to generate employee. Please try again.", "error");
                }
            } else showNotification("Please describe your employee", "error");
        });
    const $ = a.querySelector("#familySourceEmployee"),
        I = a.querySelector("#familyRelationshipType"),
        M = a.querySelector("#familyPreviewBox"),
        P = a.querySelector("#familyPreviewText"),
        A = a.querySelector("#generateFamilyMemberBtn");
    if ($) {
        gameState.employees
            .filter((e) => "active" === e.employmentStatus || e.hired)
            .sort((e, t) => e.name.localeCompare(t.name))
            .forEach((e) => {
                const t = document.createElement("option");
                (t.value = e.id), (t.textContent = `${e.name} (${e.career?.title || "Staff"})`), $.appendChild(t);
            });
        const e = () => {
            const e = $.value,
                t = I.value;
            if (e && t) {
                const n = gameState.employees.find((t) => t.id === e),
                    a = FAMILY_RELATIONSHIP_TYPES[t];
                if (n && a) {
                    let e = "";
                    const t = n.age || 28;
                    if ("older" === a.ageDirection) {
                        e = `Age: ${t + a.ageAdjust[0]}-${t + a.ageAdjust[1]}`;
                    } else if ("younger" === a.ageDirection) e = "Age: 18-34";
                    else {
                        e = `Age: ${Math.max(18, t + a.ageAdjust[0])}-${t + a.ageAdjust[1]}`;
                    }
                    const o = a.genderLock ? " • Gender: " + ("male" === a.genderLock ? "Male" : "Female") : "",
                        i = n.ethnicity ? ` • Ethnicity: ${n.ethnicity}` : "";
                    (P.innerHTML = `\n              <strong style="color:var(--l-pink);">${a.label}</strong> of <strong>${n.name}</strong>\n              <div style="color:var(--text-dim); font-size:0.8rem; margin-top:4px;">${e}${o}${i}</div>\n            `),
                        (M.style.display = "block"),
                        (A.disabled = !1),
                        (A.style.opacity = "1");
                }
            } else (M.style.display = "none"), (A.disabled = !0), (A.style.opacity = "0.5");
        };
        $.addEventListener("change", e), I.addEventListener("change", e);
    }
    A &&
        A.addEventListener("click", async () => {
            const t = $?.value,
                n = I?.value;
            if (!t || !n) return void showNotification("Please select an employee and relationship type", "error");
            const a = gameState.employees.find((e) => e.id === t);
            if (!a) return void showNotification("Selected employee not found", "error");
            const o = generateFamilyMemberData(a, n);
            if (!o) return void showNotification("Failed to generate family member", "error");
            const i = FAMILY_RELATIONSHIP_TYPES[n];
            (A.disabled = !0),
                (A.innerHTML =
                    '<span style="display:inline-block; animation:rotate 1.5s linear infinite;">⏳</span> Generating...'),
                showNotification(`🤖 Generating ${i.label.toLowerCase()} for ${a.name}...`, "info", 5e3);
            try {
                const t = `\nSource Employee: ${a.name}\nAge: ${a.age}\nGender: ${a.gender}\nEthnicity: ${a.ethnicity || "not specified"}\nPersonality: ${a.personalityTraits?.join(", ") || "various"}\nKey Trait: ${a.keyTrait || "unknown"}\nBio: ${a.bio || "A company employee"}`,
                    partnerCtx = o.existingPartnerInfo
                        ? `\n\nIMPORTANT: ${a.name} already has an established ${o.existingPartnerInfo.relationshipType || "relationship"} with this exact person (${o.name})${o.existingPartnerInfo.occupation ? `, who works as a(n) ${o.existingPartnerInfo.occupation}` : ""}${o.existingPartnerInfo.yearsTogether ? `. They have been together ${o.existingPartnerInfo.yearsTogether} year(s)` : ""}${o.existingPartnerInfo.hasKids ? " and have kids together" : ""}${o.existingPartnerInfo.endReason ? ` (the relationship ended due to ${o.existingPartnerInfo.endReason})` : ""}. The bio you write MUST be consistent with this existing history, not a fresh unrelated backstory.`
                        : "",
                    s = `Create a detailed character profile for someone who is the ${i.label.toUpperCase()} of this person:\n${t}${partnerCtx}\n\nThe new family member's basic info:\n- Name: ${o.name}\n- Age: ${o.age}\n- Gender: ${o.gender}\n- Race: ${o.race}\n- Ethnicity: ${o.ethnicity || "same as source"}\n\nCreate a complete profile that makes sense for this family relationship. The ${i.label.toLowerCase()} should have their own distinct personality while sharing some family traits.\n\nReturn ONLY a JSON object (no markdown, no explanation) with these fields:\n{\n  "bio": "<2-3 sentence background mentioning their relationship to ${a.name} and their own life/career path>",\n  "personalityTraits": ["trait1", "trait2", "trait3"],\n  "keyTrait": "<single defining characteristic>",\n  "hobbies": ["hobby1", "hobby2"],\n  "kinks": ["preference1", "preference2", "preference3"],\n  "personality": {\n    "confidence": <10-90>,\n    "outgoing": <10-90>,\n    "flirty": <10-90>,\n    "professional": <10-90>,\n    "humor": <10-90>\n  },\n  "physical": {\n    "hairColor": "<color - ${o.inheritedFeatures?.hairColor ? "should be " + o.inheritedFeatures.hairColor + " (inherited)" : "choose appropriate"}>",\n    "hairStyle": "<style>",\n    "hairLength": "<length description>",\n    "hairTexture": "<texture>",\n    "eyeColor": "<color - ${o.inheritedFeatures?.eyeColor ? "should be " + o.inheritedFeatures.eyeColor + " (inherited)" : "choose appropriate"}>",\n    "eyeShape": "<shape>",\n    "skinTone": "<tone - ${o.inheritedFeatures?.skinTone ? "should be " + o.inheritedFeatures.skinTone + " (inherited)" : "choose appropriate for ethnicity"}>",\n    "bodyShape": "<body type description>",\n    "heightBuild": "<height and build>",\n    "breastSize": "<for female/futa: size description, for male: chest description>",\n    "buttSize": "<description>",\n    "fashion": "<clothing style preference>",\n    "accessories": "<any accessories or 'none'>",\n    "notableFeatures": "<distinguishing features, birthmarks, etc>",\n    "genitalType": "<vagina/penis/penis and vagina based on gender>",\n    "genitalSize": "<size description>",\n    "genitalCharacteristics": "<grooming/characteristics>"\n  }\n}`,
                    r = await queuedGenerateText(s, {}, `Family Member - ${i.label} of ${a.name}`);
                let l;
                try {
                    const e = r.match(/\{[\s\S]*\}/);
                    if (!e) throw new Error("No JSON found in response");
                    l = JSON.parse(e[0]);
                } catch (e) {
                    throw (
                        (console.error("Failed to parse AI response for family member:", e, r),
                        new Error("AI returned invalid format"))
                    );
                }
                const c = {
                    ...o,
                    bio: l.bio || `${a.name}'s ${i.label.toLowerCase()}, recently joined the company.`,
                    personalityTraits: l.personalityTraits || o.personalityTraits,
                    keyTrait: l.keyTrait || o.keyTrait,
                    hobbies: l.hobbies || o.hobbies,
                    kinks: l.kinks || o.kinks,
                    personality: l.personality || o.personality,
                    physical: {
                        hairColor: l.physical?.hairColor || o.inheritedFeatures?.hairColor,
                        hairStyle: l.physical?.hairStyle,
                        hairLength: l.physical?.hairLength,
                        hairTexture: l.physical?.hairTexture,
                        eyeColor: l.physical?.eyeColor || o.inheritedFeatures?.eyeColor,
                        eyeShape: l.physical?.eyeShape,
                        skinTone: l.physical?.skinTone || o.inheritedFeatures?.skinTone,
                        bodyShape: l.physical?.bodyShape,
                        heightBuild: l.physical?.heightBuild,
                        breastSize: l.physical?.breastSize,
                        buttSize: l.physical?.buttSize,
                        fashion: l.physical?.fashion,
                        accessories: l.physical?.accessories,
                        notableFeatures: l.physical?.notableFeatures,
                        genitalType: l.physical?.genitalType,
                        genitalSize: l.physical?.genitalSize,
                        genitalCharacteristics: l.physical?.genitalCharacteristics,
                    },
                };
                (c.pendingFamilyLink = { relatedTo: a.id, relationship: n }),
                    delete c.inheritedFeatures,
                    delete c.pendingFamilyRelation,
                    closeHiringModal(),
                    showCharacterConfirmationModal(c, e, `${i.label} of ${a.name}`),
                    showNotification(`✨ Generated ${i.label} of ${a.name}!`, "success");
            } catch (e) {
                console.error("Family member generation error:", e),
                    showNotification("Failed to generate family member. Please try again.", "error"),
                    (A.disabled = !1),
                    (A.innerHTML = "👨‍👩‍👧 Generate Family Member");
            }
        });
    const N = a.querySelector("#createManualEmployeeBtn");
    try {
        upgradeCreationFormCombos("manual"),
            injectStructuredSections("manual", {
                physical: {},
                gender: a.querySelector("#manualGender")?.value || "female",
            }),
            upgradeTagPicker("manualTraits", null, TRAIT_OPTIONS),
            upgradeTagPicker("manualHobbies", null, HOBBY_OPTIONS),
            upgradeTagPicker("manualKinks", null, KINK_OPTIONS);
    } catch (e) {
        console.warn("manual form upgrade failed", e);
    }
    N &&
        N.addEventListener("click", async () => {
            const t = parseInt(a.querySelector("#manualCareerLevel")?.value) || 1,
                n = a.querySelector("#manualPositionSlot")?.value;
            if (
                !(t > 1 || (1 === t && "none" !== a.querySelector("#positionSlotSelector")?.style.display)) ||
                (n && !n.includes("No empty slots"))
            ) {
                (N.disabled = !0),
                    (N.innerHTML =
                        '<span style="display:inline-block; animation:rotate 1.5s linear infinite;">⏳</span> Creating...');
                try {
                    const t = (e) => {
                            const t = parseInt(a.querySelector(`#${e}`)?.value);
                            return -1 === t || isNaN(t) ? null : t;
                        },
                        n = [];
                    a.querySelector("#manualWorkMon")?.checked && n.push(1),
                        a.querySelector("#manualWorkTue")?.checked && n.push(2),
                        a.querySelector("#manualWorkWed")?.checked && n.push(3),
                        a.querySelector("#manualWorkThu")?.checked && n.push(4),
                        a.querySelector("#manualWorkFri")?.checked && n.push(5),
                        a.querySelector("#manualWorkSat")?.checked && n.push(6),
                        a.querySelector("#manualWorkSun")?.checked && n.push(0);
                    const o = {
                            name: a.querySelector("#manualName")?.value?.trim() || "",
                            age: parseInt(a.querySelector("#manualAge")?.value) || null,
                            gender: a.querySelector("#manualGender")?.value || "",
                            race: a.querySelector("#manualRace")?.value || "",
                            ethnicity: a.querySelector("#manualEthnicity")?.value || "",
                            customRace: (() => {
                                if ("custom" !== a.querySelector("#manualRace")?.value) return null;
                                const e = a.querySelector("#customRaceName")?.value?.trim() || "";
                                if (!e) return null;
                                const t = [];
                                return (
                                    a.querySelectorAll(".custom-race-detail-row").forEach((e) => {
                                        const n = e.querySelector(".custom-detail-name")?.value?.trim() || "",
                                            a = e.querySelector(".custom-detail-desc")?.value?.trim() || "";
                                        (n || a) && t.push({ name: n, description: a });
                                    }),
                                    { name: e, details: t }
                                );
                            })(),
                            personality: {
                                confidence: parseInt(a.querySelector("#manualConfidence")?.value) || 50,
                                outgoing: parseInt(a.querySelector("#manualOutgoing")?.value) || 50,
                                flirty: parseInt(a.querySelector("#manualFlirty")?.value) || 50,
                                professional: parseInt(a.querySelector("#manualProfessional")?.value) || 50,
                                humor: parseInt(a.querySelector("#manualHumor")?.value) || 50,
                            },
                            stats: {
                                affection: t("manualAffection"),
                                comfort: t("manualComfort"),
                                trust: t("manualTrust"),
                                desire: t("manualDesire"),
                                friendship: t("manualFriendship"),
                                obedience: t("manualObedience"),
                                productivity: t("manualProductivity"),
                            },
                            career: {
                                level: parseInt(a.querySelector("#manualCareerLevel")?.value) || 1,
                                salary: parseInt(a.querySelector("#manualSalary")?.value) || null,
                                selectedSlot: (() => {
                                    try {
                                        const e = a.querySelector("#manualPositionSlot")?.value;
                                        return e ? JSON.parse(e) : null;
                                    } catch (e) {
                                        return null;
                                    }
                                })(),
                            },
                            personalityTraits: document.getElementById("manualTraits_tags")
                                ? collectTags("manualTraits_tags")
                                : (a.querySelector("#manualTraits")?.value || "")
                                      .split(",")
                                      .map((e) => e.trim())
                                      .filter(Boolean),
                            hobbies: document.getElementById("manualHobbies_tags")
                                ? collectTags("manualHobbies_tags")
                                : (a.querySelector("#manualHobbies")?.value || "")
                                      .split(",")
                                      .map((e) => e.trim())
                                      .filter(Boolean),
                            kinks: document.getElementById("manualKinks_tags")
                                ? collectTags("manualKinks_tags")
                                : (a.querySelector("#manualKinks")?.value || "")
                                      .split(",")
                                      .map((e) => e.trim())
                                      .filter(Boolean),
                            keyTrait: a.querySelector("#manualKeyTrait")?.value?.trim() || "",
                            physical: {
                                hair: {
                                    color: a.querySelector("#manualHairColor")?.value?.trim() || "",
                                    style: a.querySelector("#manualHairStyle")?.value?.trim() || "",
                                    length: a.querySelector("#manualHairLength")?.value || "",
                                },
                                eyes: {
                                    color: a.querySelector("#manualEyeColor")?.value?.trim() || "",
                                    shape: a.querySelector("#manualEyeShape")?.value?.trim() || "",
                                },
                                skinTone: a.querySelector("#manualSkinTone")?.value?.trim() || "",
                                bodyShape: a.querySelector("#manualBodyShape")?.value || "",
                                heightBuild: a.querySelector("#manualHeightBuild")?.value?.trim() || "",
                                breastSize: a.querySelector("#manualBreastSize")?.value || "",
                                buttSize: a.querySelector("#manualButtSize")?.value || "",
                                fashion: a.querySelector("#manualFashion")?.value?.trim() || "",
                                accessories: (() => {
                                    const e = a.querySelector("#manualAccessories")?.value || "",
                                        t = a.querySelector("#manualAccessoriesCustom")?.value?.trim() || "";
                                    return "custom" === e || t ? t || "" : "none" === e ? "none" : e;
                                })(),
                                notableFeatures: a.querySelector("#manualNotableFeatures")?.value?.trim() || "",
                            },
                            personalLife: {
                                livingSituation: a.querySelector("#manualLivingSituation")?.value || "",
                                relationshipStatus: a.querySelector("#manualRelationshipStatus")?.value || "",
                                sexualOrientation: a.querySelector("#manualSexualOrientation")?.value || "",
                                hasPet: a.querySelector("#manualHasPet")?.value || "",
                            },
                            schedule: {
                                workDays: n.length > 0 ? n : [1, 2, 3, 4, 5],
                                workStartHour: parseInt(a.querySelector("#manualWorkStart")?.value) || 9,
                                workEndHour: parseInt(a.querySelector("#manualWorkEnd")?.value) || 17,
                                ptoBalance: parseInt(a.querySelector("#manualPTO")?.value) || 10,
                            },
                            startingFlags: (a.querySelector("#manualFlags")?.value || "")
                                .split(",")
                                .map((e) => e.trim())
                                .filter(Boolean),
                            bio: a.querySelector("#manualBio")?.value?.trim() || "",
                        },
                        i = await createManualEmployee(o, e);
                    if (i) {
                        i.physical || (i.physical = {});
                        const gen = collectGenitalCards("manualGenitalCards");
                        gen.length && (i.physical.genitals = gen);
                        (i.physical.piercings = collectPiercings("manualPiercingCards")),
                            (i.physical.tattoos = collectTattoos("manualTattooCards")),
                            "function" == typeof syncPhysicalDescriptions &&
                                syncPhysicalDescriptions(i.physical, i.gender),
                            showNotification(`✨ Created ${i.name}!`, "success"),
                            closeHiringModal();
                    }
                } catch (e) {
                    console.error("Manual creation error:", e),
                        showNotification("Failed to create employee. Please try again.", "error");
                } finally {
                    (N.disabled = !1), (N.innerHTML = "✨ Create Custom Employee");
                }
            } else
                showNotification(
                    `⚠️ No empty ${gameState.hierarchyLevels?.[t]?.title || "Level " + t} positions available!`,
                    "error"
                );
        });
    const L = (e) => {
        "Escape" === e.key && (closeHiringModal(), window.removeEventListener("keydown", L));
    };
    window.addEventListener("keydown", L);
}
function closeHiringModal() {
    ModalManager.close("hiringModal"), (gameState.currentCandidates = null), (document.body.style.overflow = "");
}
async function generateRehireMessage(e) {
    try {
        const t = e.stats || {},
            n = e.intimacy || {},
            a = (e.memory, e.chatHistory || []),
            o = e.conversationArchive || [],
            i = t.affection || 50,
            s = t.trust || 50,
            r = t.desire || 50,
            l = n.level || 0,
            c = n.sexCount || 0,
            d = e.timesRehired || 1,
            p = [...o, ...a]
                .slice(-10)
                .map((e) => e.content)
                .join(" | "),
            m = (i + s) / 2,
            u = m >= 70 ? "excellent" : m >= 50 ? "good" : m >= 30 ? "strained" : "poor",
            g = l >= 50 || c > 0,
            h = i >= 70 && r >= 60,
            y = `You are ${e.name}, a ${e.age}-year-old ${e.gender} who previously worked for the player as a manager.\n\nRELATIONSHIP CONTEXT:\n- Affection: ${i}/100 (${i >= 70 ? "very high" : i >= 50 ? "positive" : i >= 30 ? "neutral" : "low"})\n- Trust: ${s}/100 (${s >= 70 ? "very high" : s >= 50 ? "trusting" : s >= 30 ? "cautious" : "distrustful"})\n- Desire: ${r}/100\n- Intimacy Level: ${l}/100\n- Sexual encounters: ${c}\n- Times rehired: ${d}\n- Overall relationship: ${u}${g ? ", sexual" : ""}${h ? ", romantic" : ""}\n\nPERSONALITY:\n${e.personality || "Professional and dedicated"}\n\nRECENT CONVERSATION TOPICS:\n${p || "No recent conversation history"}\n\nINSTRUCTIONS:\nGenerate a SINGLE short message (1-2 sentences, max 150 characters) that ${e.name} would send when being rehired.\n\nIMPORTANT TONE GUIDELINES:\n${g && i >= 60 ? '- Be flirty, suggestive, and reference your intimate past. Use innuendo or explicit language. Example: "Can\'t wait for those \'after hours\' meetings again 😏" or "Missed our special connection... ready to make up for lost time ❤️"' : ""}\n${h && !g ? "- Be warm, affectionate, and emotionally connected. Show you missed them personally." : ""}\n${m >= 70 && !g ? "- Be enthusiastic and happy to return. Express genuine excitement." : ""}\n${m >= 40 && m < 70 ? "- Be professional but friendly. Acknowledge the working relationship." : ""}\n${m < 40 ? '- Be distant, cold, or passive-aggressive. Maybe express reluctance or sarcasm. Example: "Well, here we are again..." or "Guess I\'m back... for now."' : ""}\n\nNO LIMITS on suggestiveness if intimacy is high. Match the energy of your past interactions.\n\nGenerate ONLY the message, no quotes, no explanation:`;
        return (
            extractText(await queuedGenerateText(y, { temperature: 0.9, max_tokens: 80 }, `Rehire message - ${e.name}`)).trim() ||
            "It's good to be back! Ready to get to work. 💼"
        );
    } catch (t) {
        console.error("Error generating rehire message:", t);
        const n = e.stats?.affection || 50;
        return n >= 70
            ? "Boss! I've missed you so much! 💕 Ready to make this work... amazing. 😏"
            : n >= 50
              ? "Hey! Good to be back working with you again! 😊"
              : "Well... I'm back. Let's see how this goes.";
    }
}
async function selectManagerCandidate(e) {
    const t = gameState.currentCandidates?.[e],
        n = gameState.products.find((e) => e.id === t?.productId);
    if (!t || !n) return;
    if (gameState.cash < getManagerHireCost(n)) return void showNotification("Not enough cash!");
    const a = t.isFormerEmployee || !1;
    (t.hired = !0),
        (t.position = `Manager – ${n.name}`),
        (t.productManaged = n.name),
        gameState.usedEmployeeNames || (gameState.usedEmployeeNames = new Set()),
        gameState.usedEmployeeNames.add(t.name),
        console.log(`[Hire] Marked ${t.name} as used (${gameState.usedEmployeeNames.size} total names)`),
        t.hireDate || (t.hireDate = gameNow()),
        a
            ? ((t.onboarding = !1),
              (t.bioComplete = !0),
              t.chatHistory && t.chatHistory.length > 0 && (gameState.chatHistory[t.id] = t.chatHistory),
              t.conversationArchive
                  ? (t.conversationArchive = t.conversationArchive)
                  : (t.conversationArchive = []),
              t.loyaltyBonus &&
                  (t.stats.productivity = Math.min(100, (t.stats.productivity || 70) * (1 + t.loyaltyBonus))),
              gameState.chatHistory[t.id] || (gameState.chatHistory[t.id] = []),
              generateRehireMessage(t).then((e) => {
                  gameState.chatHistory[t.id].push({
                      sender: t.name,
                      content: e,
                      isPlayer: !1,
                      timestamp: gameState.time?.currentTime || Date.now(),
                  }),
                      saveGame(!1),
                      (t.unreadMessages = (t.unreadMessages || 0) + 1),
                      (gameState.activeChat?.id || gameState.activeChat) === t.id && loadChatHistory(t.id);
              }),
              showNotification(`${t.name} has returned! +${(100 * t.loyaltyBonus).toFixed(0)}% loyalty bonus!`))
            : ((t.onboarding = !0), (t.bioComplete = !1)),
        (n.managerOnboarding = !a),
        (n.managerId = t.id),
        (n.managerLevel = 1),
        (n.managerHired = !0),
        (t.locationId = n.locationId || "headquarters"),
        (t.location = t.locationId);
    const s = getManagerHireCost(n);
    if (
        ((gameState.cash -= s),
        (t.hireCostPaid = s),
        n.running || ((n.running = !0), (n.timeRemainingMs = currentCycleTimeMs(n))),
        a || gameState.onboarding.push(t),
        closeHiringModal(),
        updatePeopleTab(),
        updateProductsList(),
        a)
    )
        finalizeManagerHire(t, n);
    else
        try {
            const mg = normalizeGender(t.gender),
                mArticle = "male" === mg || "transMan" === mg ? "male" : "female"; // the candidate's own gender (this was hard-coded "female")
            // Roll the look first so the AI writes around it rather than inventing colours.
            t.physical = generateDetailedPhysicalAppearance(t.gender || "female", t.race || "human", t.ethnicity || null);
            const e = `\n  Create an in-world, adult ${mArticle} NPC profile (no meta-talk) for: ${t.name}, age ${t.age}.\n  Gender: ${mg}.\n  ${describeFixedLookForAi(t)}\n  Role: ${t.position}. Product managed: ${n.name}.\n  Personality traits: ${t.personalityTraits.join(", ")}. Key trait: ${t.keyTrait}.\n  Hobbies: ${t.hobbies.join(", ")}. Kink preferences: ${t.kinks.join(", ")}.\n\n  Respond as a compact JSON object with these keys ONLY:\n  {\n  "name": {"first":"", "last":""},\n  "age": <number>,\n  "gender": "${mg}",\n  "productManaged": "${n.name}",\n  "bio": "<2-3 sentence personality/background, world-grounded>",\n  "appearance": {\n  "bodyShape": "",\n  "breastSize": "",\n  "buttSize": "",\n  "fashion": ""\n  },\n  "personalityTraits": [${t.personalityTraits.map((e) => `"${e}"`).join(", ")}],\n  "kinks": [${t.kinks.map((e) => `"${e}"`).join(", ")}]\n  }\n  `,
                a =
                    "function" == typeof generateText
                        ? await queuedGenerateText(e, {}, `Manager Profile - ${t.name}`)
                        : `{"name":{"first":"${t.name.split(" ")[0]}","last":"${t.name.split(" ")[1] || ""}"},"age":${t.age},"productManaged":"${n.name}","bio":"Quick learner; keeps launches smooth.","appearance":{"heightBuild":"average","hair":{"color":"brown","style":"soft waves","length":"shoulder"},"eyes":{"color":"green","shape":"almond"},"skinTone":"light","bodyShape":"curvy","breastSize":"medium","buttSize":"full","fashion":"smart casual"},"personalityTraits":["${t.personalityTraits.join('","')}"],"kinks":["${t.kinks.join('","')}"]}`;
            let o;
            try {
                // Local models often wrap the JSON in prose or a code fence.
                o = JSON.parse((extractText(a).match(/\{[\s\S]*\}/) || ["null"])[0]);
            } catch {
                o = null;
            }
            if (o && o.name) {
                (t.name = `${o.name.first} ${o.name.last}`.trim() || t.name),
                    (t.age = o.age ?? t.age),
                    (t.productManaged = o.productManaged || n.name),
                    (t.bio = o.bio || "Keeps things moving; loves clean launches."),
                    mergeAiAppearance(t.physical, o.appearance, t.gender),
                    (t.personalityTraits = o.personalityTraits || t.personalityTraits),
                    (t.kinks = o.kinks || t.kinks);
            } else t.bio = "Quick learner; keeps launches smooth. Friendly and playful in the office.";
            if ("function" == typeof generateImage) {
                const e = buildProfilePortraitPrompt(t);
                try {
                    const n = await queuedGenerateImage(applyImageStyle(e), `Profile image for new hire ${t.name}`);
                    n &&
                        ((t.profileImage = n),
                        t.photos || (t.photos = []),
                        t.photos.push({
                            url: n,
                            source: "profile",
                            caption: "Initial profile picture",
                            timestamp: Date.now(),
                        }));
                } catch (e) {
                    console.warn("[Hire] Profile image generation failed:", e);
                }
            }
            (t.onboarding = !1),
                (t.bioComplete = !0),
                (gameState.onboarding = gameState.onboarding.filter((e) => e.id !== t.id)),
                t.hireDate || (t.hireDate = gameNow()),
                (t.employmentStatus = "active"),
                initializeEmployeeSocialData(t),
                gameState.employees.push(t),
                updateCompanyAwareness(),
                generateRandomRelationships(t.id),
                logCompanyEvent({
                    type: "hire",
                    involvedEmployees: [t.id],
                    location: t.locationId,
                    description: `${t.name} joined as ${t.position}`,
                    sentiment: "positive",
                    importance: 6,
                }),
                generateFirstEmployeePost(t).catch((e) => {
                    console.error("First post generation failed:", e);
                }),
                (n.managerHired = !0),
                (n.managerId = t.id),
                (n.managerLevel = 1),
                (n.managerOnboarding = !1);
            const i = gameState.corporatePyramid.positions[1]?.find((e) => e.productId === n.id);
            if (i) {
                (i.employeeId = t.id), (t.productManaged = n.name);
                const e = gameState.hierarchyLevels[i.level] || gameState.hierarchyLevels[1],
                    premium = Math.max(0, (t.career.salary || 0) - getMarketRate(t, t.career.level));
                (t.career.level = i.level),
                    (t.career.title = e.title),
                    (t.career.salary = getMarketRate(t, i.level) + premium),
                    console.log(
                        `[Pyramid] Auto-assigned ${t.name} to ${i.title} - Career updated to ${t.career.title} (Level ${t.career.level})`
                    );
            } else {
                initializeHierarchicalPyramid();
                const e = gameState.corporatePyramid.positions[1]?.find((e) => e.productId === n.id);
                if (e) {
                    (e.employeeId = t.id), (t.productManaged = n.name);
                    const a = gameState.hierarchyLevels[e.level] || gameState.hierarchyLevels[1],
                        premium = Math.max(0, (t.career.salary || 0) - getMarketRate(t, t.career.level));
                    (t.career.level = e.level),
                        (t.career.title = a.title),
                        (t.career.salary = getMarketRate(t, e.level) + premium),
                        console.log(
                            `[Pyramid] Created and assigned ${t.name} to ${e.title} - Career updated to ${t.career.title} (Level ${t.career.level})`
                        );
                }
            }
            if (
                (updatePeopleTab(),
                updateProductsList(),
                showNotification(`${t.name} hired to manage ${n.name}!`),
                "dashboard" === gameState.activeTab && refreshDashboardSections(),
                "function" == typeof onStoryEmployeeHired)
            )
                try {
                    onStoryEmployeeHired(t);
                } catch (e) {
                    console.warn("[Story] Employee hire hook error:", e);
                }
        } catch (e) {
            console.error("Onboarding error:", e),
                showNotification("Onboarding hit a snag—try again."),
                (gameState.onboarding = gameState.onboarding.filter((e) => e.id !== t.id));
        }
}
