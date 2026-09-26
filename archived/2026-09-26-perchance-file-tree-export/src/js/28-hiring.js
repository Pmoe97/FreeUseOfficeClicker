// ============================================================================
// 28-hiring — Hiring modal rendering (Sc), candidate hire/manager selection.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function Sc(e) {
  const t = gameState.products.find((t2) => t2.id === e);
  if (!t) return;
  gameState.currentHiringProductId = e, void 0 === gameState.hiringMode && (gameState.hiringMode = "new");
  const n = gameState.rehirePool && gameState.rehirePool.length > 0, a = document.createElement("div");
  function o() {
    let t2 = [];
    return t2 = "rehire" === gameState.hiringMode && n ? xc(3 + (gameState.globalUpgrades?.workforce?.recruiting || 0)).map((t3) => ({ ...t3, originalRehireId: t3.id, id: `rehire_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, productId: e, isRehire: true, loyaltyBonus: wc(t3.timesRehired || 0), hired: false, employmentStatus: "candidate" })) : vc(e), gameState.currentCandidates = t2, t2.map((e2, t3) => {
      const n2 = e2.isRehire || false;
      e2.skills || n2 || (e2.skills = { technical: { level: 1, xp: 0, maxXp: 500 }, creative: { level: 1, xp: 0, maxXp: 500 }, social: { level: 1, xp: 0, maxXp: 500 }, management: { level: 1, xp: 0, maxXp: 500 }, intimate: { level: 0, xp: 0, maxXp: 500 }, cooking: { level: 0, xp: 0, maxXp: 500 }, fitness: { level: 0, xp: 0, maxXp: 500 } }, e2.skills.technical.level = 1 + Math.floor(3 * Math.random()), e2.skills.creative.level = 1 + Math.floor(3 * Math.random()), e2.skills.social.level = 1 + Math.floor(3 * Math.random()), e2.skills.management.level = 1 + Math.floor(3 * Math.random()), e2.skills.fitness.level = Math.floor(3 * Math.random()), e2.skills.cooking.level = Math.floor(3 * Math.random()), Object.values(e2.skills).forEach((e3) => {
        e3.level > 0 && (e3.xp = Math.floor(Math.random() * e3.maxXp * 0.5));
      }));
      const a2 = e2.skills || {}, o2 = ((a2.technical?.level || 1) + (a2.creative?.level || 1) + (a2.social?.level || 1) + (a2.management?.level || 1)) / 4, i2 = Math.round(10 * (o2 - 1)), s2 = [{ name: "Technical", level: a2.technical?.level || 1, emoji: "\u{1F4BB}" }, { name: "Creative", level: a2.creative?.level || 1, emoji: "\u{1F3A8}" }, { name: "Social", level: a2.social?.level || 1, emoji: "\u{1F91D}" }, { name: "Management", level: a2.management?.level || 1, emoji: "\u{1F4CA}" }].sort((e3, t4) => t4.level - e3.level).slice(0, 2), l2 = ([{ name: "Fitness", level: a2.fitness?.level || 0, emoji: "\u{1F4AA}" }, { name: "Cooking", level: a2.cooking?.level || 0, emoji: "\u{1F373}" }].filter((e3) => e3.level > 0).slice(0, 2), n2 ? `<span class="pill pill--hn">\u2B50 FORMER \xB7 +${(100 * e2.loyaltyBonus).toFixed(0)}%</span>` : ""), c2 = vl(e2.race || "human");
      return `<div class="candidate-card cand${n2 ? " cand--rehire" : ""}"> <div class="cand-h"><span class="cand-av">${(e2.name || "?").charAt(0)}</span><div class="cand-id"><span class="nm">${yl(e2)}</span><span class="role">Manager Candidate \xB7 ${e2.age || "\u2014"} \xB7 ${c2.emoji} ${c2.label}</span></div>${l2}</div><div class="cand-stats"><div class="tile"><div class="k">Productivity</div><div class="big num">${Math.round((e2.stats?.productivity ?? 0) * (1 + (e2.loyaltyBonus || 0)))}%</div></div><div class="tile"><div class="k">Trust</div><div class="big num">${Math.round(e2.stats?.trust ?? 0)}%</div></div><div class="tile"><div class="k">Professional</div><div class="big num">${Math.round(e2.personality?.professional ?? 50)}%</div></div><div class="tile"><div class="k">Confidence</div><div class="big num">${Math.round(e2.personality?.confidence ?? 50)}%</div></div></div><div class="cand-skills">${s2.map((u3) => `<span class="pill">${u3.emoji} ${u3.name} ${u3.level}</span>`).join("")}${i2 > 0 ? `<span class="pill pill--fg">+${i2}% bonus</span>` : ""}</div><div class="meta">${e2.keyTrait || "Dedicated"}${(e2.personalityTraits || []).slice(0, 2).length ? " \xB7 " + (e2.personalityTraits || []).slice(0, 2).join(" \xB7 ") : ""}${(e2.hobbies || []).length ? " \xB7 likes " + e2.hobbies[0] : ""}</div><button class="select-candidate-btn btn btn--lg ${n2 ? "btn--hn" : "btn--fg"} w-full" data-index="${t3}">${n2 ? "\u2B50 Rehire" : "\u{1F4DD} Hire"}</button></div>`;
    }).join("");
  }
  a.id = "hiringModal", a.className = "fuoc-ui", a.style.background = "var(--bp)";
  const i = o();
  a.innerHTML = ` <div class="hiring-modal-panel" role="dialog" aria-modal="true" aria-label="Select an Employee" style="background:var(--h); width:92%; max-width:920px; max-height:85vh; overflow-y:auto; padding:18px; border-radius:var(--r3); box-shadow:var(--cm); pointer-events:auto; margin:auto;"> <div class="card-h" style="position:sticky; top:0; background:var(--h); z-index:10;"> <span class="t">Select Staff \xB7 ${t.name}</span> <button class="close-modal-btn" style="background:transparent; border:none; color:var(--a); font-size:1.3rem; cursor:pointer;">\u2715</button> </div> <!-- Hiring Mode Toggle (always visible) --> <div style="display:flex; justify-content:center; gap:10px; margin-bottom:16px; padding:8px; background:var(--f); border-radius:var(--r2);"> <button class="hiring-mode-toggle btn" data-mode="new" style="flex:1; background:${"new" === gameState.hiringMode ? "var(--bk)" : "transparent"}; border:1px solid ${"new" === gameState.hiringMode ? "var(--d)" : "var(--r)"}; color:${"new" === gameState.hiringMode ? "var(--bh)" : "var(--a)"};"> \u{1F4DD} New Hires </button> <button class="hiring-mode-toggle btn" data-mode="rehire" ${n ? "" : "disabled"} style="flex:1; background:${"rehire" === gameState.hiringMode && n ? "var(--cz)" : "transparent"}; border:1px solid ${"rehire" === gameState.hiringMode && n ? "var(--m)" : "var(--r)"}; color:${"rehire" === gameState.hiringMode && n ? "var(--m)" : n ? "var(--a)" : "var(--e)"}; cursor:${n ? "pointer" : "not-allowed"}; opacity:${n ? "1" : "0.5"};">
        \u2B50 Rehire Former Employees ${n ? `(${gameState.rehirePool.length})` : "(0)"} </button> <button class="hiring-mode-toggle btn" data-mode="custom" style="flex:1; background:${"custom" === gameState.hiringMode ? "var(--cs)" : "transparent"}; border:1px solid ${"custom" === gameState.hiringMode ? "var(--g)" : "var(--r)"}; color:${"custom" === gameState.hiringMode ? "var(--g)" : "var(--a)"};"> \u2728 Custom Employee </button> </div> <div id="candidates-container" class="hire-grid"> ${i} </div> <!-- Custom Employee Creation Container (hidden by default) --> <div id="custom-employee-container" class="panel" style="display:none; margin-top:10px;"> <!-- Import Character from File --> <div style="margin-bottom:14px;"> <button id="importCharacterBtn" class="btn" style="width:100%; padding:10px; background:linear-gradient(135deg, var(--x) 0%, var(--en) 100%); border:none; border-radius:8px; color:var(--q); font-weight:600; cursor:pointer;"> \u{1F4E5} Import Character from File </button> <p style="text-align:center; color:var(--e); font-size:0.75rem; margin:6px 0 0 0;">Port a character exported from another save (.json)</p> </div> <!-- Custom Mode Sub-Toggle --> <div style="display:flex; justify-content:center; gap:10px; margin-bottom:20px;"> <button class="custom-mode-toggle" data-submode="quick" style="padding:10px 20px; background:linear-gradient(135deg, var(--n) 0%, var(--u) 100%); border:2px solid var(--g); border-radius:8px; color:var(--q); cursor:pointer; font-weight:600; transition:all 0.3s;"> \u26A1 Quick (AI-Assisted) </button> <button class="custom-mode-toggle" data-submode="manual" style="padding:10px 20px; background:transparent; border:2px solid var(--r); border-radius:8px; color:var(--b); cursor:pointer; font-weight:600; transition:all 0.3s;"> \u{1F4CB} Manual (Full Form) </button> </div> <!-- Quick Mode Content --> <div id="quick-mode-content" style="display:block;"> <div style="text-align:center; margin-bottom:20px;"> <h3 style="margin:0 0 10px 0; color:var(--g);">\u26A1 Quick Character Creation</h3> <p style="color:var(--a); font-size:0.9rem; margin:0;">Create an employee from a URL (wiki page, character page) or describe them with AI</p> </div> <!-- Recover Last Character Button (only shows if there's pending data) --> <div id="recoverCharacterSection" style="display:none; background:linear-gradient(135deg, var(--au) 0%, #ffa502 100%); padding:15px; border-radius:8px; margin-bottom:15px;"> <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;"> <div> <div style="font-weight:600; color:var(--b);">\u{1F504} Recover Last Character</div> <div id="recoverCharacterInfo" style="font-size:0.85rem; color:var(--ej);"></div> </div> <button id="recoverCharacterBtn" style="padding:10px 20px; background:var(--b); border:none; border-radius:6px; color:var(--q); cursor:pointer; font-weight:600; white-space:nowrap;"> \u267B\uFE0F Recover </button> </div> </div> <!-- URL-based creation --> <div style="background:var(--f); padding:15px; border-radius:8px; margin-bottom:15px;"> <label style="display:block; margin-bottom:8px; color:var(--d); font-weight:600;">\u{1F517} Create from URL</label> <div style="display:flex; gap:10px;"> <input type="text" id="customEmployeeUrlInput" placeholder="https://wiki.example.com/Character_Name" style="flex:1; padding:10px; background:var(--i); border:1px solid var(--g); border-radius:6px; color:var(--b); font-size:0.95rem;"> <button id="generateFromUrlBtn" class="btn btn--fg" style="white-space:nowrap;"> \u2728 Generate </button> </div> <p style="color:var(--e); font-size:0.8rem; margin:8px 0 0 0;">Works with wiki pages, fandom pages, character databases, etc.</p> </div> <!-- AI Prompt-based creation --> <div style="background:var(--f); padding:15px; border-radius:8px; margin-bottom:15px;"> <label style="display:block; margin-bottom:8px; color:var(--v); font-weight:600;">\u{1F916} Create from Description</label> <textarea id="customEmployeePromptInput" placeholder="Describe your employee... e.g., 'A confident redhead in her late 20s who loves photography and has a mischievous personality. She's a former model turned marketing expert.'" style="width:100%; min-height:80px; padding:10px; background:var(--i); border:1px solid var(--v); border-radius:6px; color:var(--b); font-size:0.95rem; resize:vertical; font-family:inherit;"></textarea> <button id="generateFromPromptBtn" class="btn btn--be w-full" style="margin-top:10px;"> \u{1F3A8} Generate Employee from Description </button> </div> <!-- Family Member Creation --> <div style="background:var(--f); padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid var(--v);"> <label style="display:block; margin-bottom:8px; color:var(--v); font-weight:600;">\u{1F468}\u200D\u{1F469}\u200D\u{1F467} Create Relative of Existing Employee</label> <p style="color:var(--a); font-size:0.8rem; margin:0 0 12px 0;">Inherits ethnicity, some physical traits, and gets linked automatically</p> <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;"> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Related To</label> <select id="familySourceEmployee" style="width:100%; padding:10px; background:var(--i); border:1px solid var(--v); border-radius:6px; color:var(--b); font-size:0.9rem;"> <option value="">-- Select Employee --</option> </select> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Relationship</label> <select id="familyRelationshipType" style="width:100%; padding:10px; background:var(--i); border:1px solid var(--v); border-radius:6px; color:var(--b); font-size:0.9rem;"> <optgroup label="Parents"> <option value="mother">Mother</option> <option value="father">Father</option> <option value="stepmother">Stepmother</option> <option value="stepfather">Stepfather</option> </optgroup> <optgroup label="Siblings"> <option value="sister">Sister</option> <option value="brother">Brother</option> <option value="stepsister">Stepsister</option> <option value="stepbrother">Stepbrother</option> </optgroup> <optgroup label="Children (18+)"> <option value="daughter">Daughter</option> <option value="son">Son</option> </optgroup> <optgroup label="Extended Family"> <option value="aunt">Aunt</option> <option value="uncle">Uncle</option> <option value="cousin">Cousin</option> </optgroup> <optgroup label="Partners"> <option value="spouse">Spouse</option> <option value="exSpouse">Ex-Spouse</option> </optgroup> </select> </div> </div> <div id="familyPreviewBox" style="background:rgba(255,107,157,0.1); padding:10px; border-radius:6px; margin-bottom:12px; display:none;"> <div style="font-size:0.8rem; color:var(--a);">Preview:</div> <div id="familyPreviewText" style="color:var(--b); font-size:0.9rem;"></div> </div> <button id="generateFamilyMemberBtn" class="btn btn--be w-full" style="opacity:0.5;" disabled> \u{1F468}\u200D\u{1F469}\u200D\u{1F467} Generate Family Member </button> </div> <!-- Optional Extra Instructions --> <div style="background:var(--f); padding:15px; border-radius:8px;"> <label style="display:block; margin-bottom:8px; color:var(--m); font-weight:600;">\u2699\uFE0F Additional Instructions (Optional)</label> <input type="text" id="customEmployeeExtraInstructions" placeholder="e.g., 'Make her more dominant' or 'She should be shy at first'" style="width:100%; padding:10px; background:var(--i); border:1px solid var(--m); border-radius:6px; color:var(--b); font-size:0.95rem;"> </div> </div> <!-- Manual Mode Content --> <div id="manual-mode-content" style="display:none; max-height:60vh; overflow-y:auto; padding-right:8px; scrollbar-gutter:stable;"> <div style="text-align:center; margin-bottom:16px;"> <h3 style="margin:0 0 8px 0; color:var(--x);">\u{1F4CB} Full Character Creator</h3> <p style="color:var(--a); font-size:0.9rem; margin:0;">Complete control over every aspect - AI fills empty fields intelligently</p> </div> <!-- Collapsible Sections Container --> <!-- Basic Info Section --> <details open style="background:var(--f); border-radius:8px; margin-bottom:12px;"> <summary style="padding:12px 15px; cursor:pointer; color:var(--g); font-weight:600; user-select:none;">\u{1F464} Basic Information</summary> <div style="padding:8px 15px 15px 15px;"> <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;"> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Name</label> <input type="text" id="manualName" placeholder="Random" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.9rem;"> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Age (18+)</label> <input type="number" id="manualAge" placeholder="18+" min="18" max="99" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.9rem;"> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Gender</label> <select id="manualGender" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.9rem;"> <option value="">Auto</option> <option value="female">Female</option> <option value="male">Male</option> <option value="female_futa">Futa</option> <option value="trans_woman">Trans Woman</option> <option value="trans_man">Trans Man</option> <option value="non-binary">Non-Binary</option> </select> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Race/Species</label> <select id="manualRace" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.9rem;"> <option value="">Auto</option> <optgroup label="Standard"> <option value="human">Human</option> </optgroup> <optgroup label="Fantasy - Fae"> <option value="elf">Elf</option> <option value="fairy">Fairy</option> <option value="dryad">Dryad</option> </optgroup> <optgroup label="Fantasy - Beastfolk"> <option value="catgirl">Catgirl</option> <option value="catboy">Catboy</option> <option value="foxgirl">Foxgirl</option> <option value="foxboy">Foxboy</option> <option value="wolfgirl">Wolfgirl</option> <option value="wolfboy">Wolfboy</option> <option value="bunny">Bunnygirl/boy</option> <option value="werewolf">Werewolf</option> </optgroup> <optgroup label="Fantasy - Infernal/Divine"> <option value="succubus">Succubus</option> <option value="incubus">Incubus</option> <option value="demon">Demon</option> <option value="tiefling">Tiefling</option> <option value="angel">Angel</option> <option value="vampire">Vampire</option> </optgroup> <optgroup label="Fantasy - Classic"> <option value="orc">Orc</option> <option value="goblin">Goblin</option> <option value="dwarf">Dwarf</option> <option value="halfling">Halfling</option> <option value="dragonborn">Dragonborn</option> </optgroup> <optgroup label="Sci-Fi & Other"> <option value="robot">Robot/Android</option> <option value="cyborg">Cyborg</option> <option value="alien">Alien</option> <option value="slime">Slime</option> <option value="ghost">Ghost</option> <option value="mermaid">Mermaid/Merman</option> <option value="lamia">Lamia (Snake)</option> <option value="centaur">Centaur</option> <option value="harpy">Harpy</option> </optgroup> <optgroup label="Custom"> <option value="custom">\u2728 Custom Race...</option> </optgroup> </select> </div> </div> <!-- Custom Race Builder (hidden by default) --> <div id="customRaceBuilder" style="display:none; margin-top:12px; padding:12px; background:var(--ad); border-radius:8px; border:1px solid var(--x);"> <label style="display:block; margin-bottom:8px; color:var(--x); font-size:0.9rem; font-weight:600;">\u2728 Custom Race Details</label> <div style="margin-bottom:10px;"> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Race Name <span style="color:var(--k);">*</span></label> <input type="text" id="customRaceName" placeholder="e.g., Tiefling, Naga, Kitsune..." style="width:100%; padding:8px; background:var(--i); border:1px solid var(--x); border-radius:4px; color:var(--b); font-size:0.9rem;"> </div> <div id="customRaceDetails" style="margin-top:10px;"> <!-- Defining details will be added here dynamically --> </div> <button type="button" id="addCustomRaceDetail" style="margin-top:8px; padding:6px 12px; background:rgba(199,125,255,0.2); border:1px solid var(--x); border-radius:4px; color:var(--x); cursor:pointer; font-size:0.8rem; transition:all 0.2s;" onmouseover="this.style.background='rgba(199,125,255,0.4)'" onmouseout="this.style.background='rgba(199,125,255,0.2)'"> \u2795 Add Defining Detail </button> <div style="margin-top:10px; padding:8px; background:var(--bd); border-radius:4px; font-size:0.75rem; color:var(--e);"> \u{1F4A1} <strong>Examples:</strong> "Horns" \u2192 "Long, curved, obsidian black with red glow" | "Tail" \u2192 "Prehensile, scaled, 3ft long" | "Skin" \u2192 "Pale blue with bioluminescent markings" </div> </div> <!-- Ethnicity (only shown for humans) --> <div id="manualEthnicityRow" style="margin-top:10px;"> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Ethnicity (for humans)</label> <select id="manualEthnicity" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.9rem;"> <option value="">Auto</option> <optgroup label="Europe & Americas"> <option value="caucasian">Caucasian/European</option> <option value="latino">Latino/Hispanic</option> <option value="nativeAmerican">Native American/Indigenous</option> </optgroup> <optgroup label="Africa"> <option value="black">Black/African</option> </optgroup> <optgroup label="East Asia"> <option value="eastAsian">East Asian (General)</option> <option value="eastAsian-japanese">East Asian - Japanese</option> <option value="eastAsian-chinese">East Asian - Chinese</option> <option value="eastAsian-korean">East Asian - Korean</option> </optgroup> <optgroup label="Southeast Asia"> <option value="southeastAsian">Southeast Asian (General)</option> <option value="southeastAsian-thai">Southeast Asian - Thai</option> <option value="southeastAsian-vietnamese">Southeast Asian - Vietnamese</option> <option value="southeastAsian-filipino">Southeast Asian - Filipino</option> <option value="southeastAsian-indonesian">Southeast Asian - Indonesian</option> </optgroup> <optgroup label="South & Central Asia"> <option value="southAsian">South Asian (Indian, Pakistani, etc.)</option> <option value="centralAsian">Central Asian (Kazakh, Mongolian, etc.)</option> </optgroup> <optgroup label="Middle East"> <option value="middleEastern">Middle Eastern/North African</option> </optgroup> <optgroup label="Oceania"> <option value="pacificIslander">Pacific Islander (General)</option> <option value="pacificIslander-hawaiian">Pacific Islander - Hawaiian</option> <option value="pacificIslander-samoan">Pacific Islander - Samoan</option> <option value="pacificIslander-maori">Pacific Islander - M\u0101ori</option> <option value="indigenous">Indigenous Australian/Aboriginal</option> </optgroup> <optgroup label="Mixed"> <option value="mixed">Mixed Ethnicity</option> </optgroup> </select> </div> </div> </details> <!-- Personality Section (C.O.F.P.H.) --> <details open style="background:var(--f); border-radius:8px; margin-bottom:12px;"> <summary style="padding:12px 15px; cursor:pointer; color:var(--v); font-weight:600; user-select:none;">\u{1F4AB} Personality (C.O.F.P.H.)</summary> <div style="padding:8px 15px 15px 15px;"> <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px 16px;"> <div> <label style="display:block; margin-bottom:2px; color:var(--a); font-size:0.75rem;">Confidence <span id="manualConfidenceValue" style="color:var(--g);">50</span></label> <input type="range" id="manualConfidence" min="0" max="100" value="50" style="width:100%;"> </div> <div> <label style="display:block; margin-bottom:2px; color:var(--a); font-size:0.75rem;">Outgoing <span id="manualOutgoingValue" style="color:var(--g);">50</span></label> <input type="range" id="manualOutgoing" min="0" max="100" value="50" style="width:100%;"> </div> <div> <label style="display:block; margin-bottom:2px; color:var(--a); font-size:0.75rem;">Flirty <span id="manualFlirtyValue" style="color:var(--g);">50</span></label> <input type="range" id="manualFlirty" min="0" max="100" value="50" style="width:100%;"> </div> <div> <label style="display:block; margin-bottom:2px; color:var(--a); font-size:0.75rem;">Professional <span id="manualProfessionalValue" style="color:var(--g);">50</span></label> <input type="range" id="manualProfessional" min="0" max="100" value="50" style="width:100%;"> </div> <div> <label style="display:block; margin-bottom:2px; color:var(--a); font-size:0.75rem;">Humor <span id="manualHumorValue" style="color:var(--g);">50</span></label> <input type="range" id="manualHumor" min="0" max="100" value="50" style="width:100%;"> </div> </div> </div> </details> <!-- Relationship Stats Section --> <details style="background:var(--f); border-radius:8px; margin-bottom:12px;"> <summary style="padding:12px 15px; cursor:pointer; color:var(--k); font-weight:600; user-select:none;">\u2764\uFE0F Starting Relationship Stats</summary> <div style="padding:8px 15px 15px 15px;"> <p style="color:var(--e); font-size:0.75rem; margin:0 0 12px 0;">Set initial relationship levels (default: randomized based on HR settings)</p> <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px 16px;"> <div> <label style="display:block; margin-bottom:2px; color:var(--k); font-size:0.75rem;">\u2764\uFE0F Affection <span id="manualAffectionValue" style="color:var(--k);">-</span></label> <input type="range" id="manualAffection" min="0" max="100" value="-1" style="width:100%;"> </div> <div> <label style="display:block; margin-bottom:2px; color:var(--g); font-size:0.75rem;">\u{1F60A} Comfort <span id="manualComfortValue" style="color:var(--g);">-</span></label> <input type="range" id="manualComfort" min="0" max="100" value="-1" style="width:100%;"> </div> <div> <label style="display:block; margin-bottom:2px; color:var(--d); font-size:0.75rem;">\u{1F91D} Trust <span id="manualTrustValue" style="color:var(--d);">-</span></label> <input type="range" id="manualTrust" min="0" max="100" value="-1" style="width:100%;"> </div> <div> <label style="display:block; margin-bottom:2px; color:var(--v); font-size:0.75rem;">\u{1F495} Desire <span id="manualDesireValue" style="color:var(--v);">-</span></label> <input type="range" id="manualDesire" min="0" max="100" value="-1" style="width:100%;"> </div> <div> <label style="display:block; margin-bottom:2px; color:var(--m); font-size:0.75rem;">\u{1F917} Friendship <span id="manualFriendshipValue" style="color:var(--m);">-</span></label> <input type="range" id="manualFriendship" min="0" max="100" value="-1" style="width:100%;"> </div> <div> <label style="display:block; margin-bottom:2px; color:var(--x); font-size:0.75rem;">\u{1F517} Obedience <span id="manualObedienceValue" style="color:var(--x);">-</span></label> <input type="range" id="manualObedience" min="0" max="100" value="-1" style="width:100%;"> </div> </div> </div> </details> <!-- Work Stats Section --> <details style="background:var(--f); border-radius:8px; margin-bottom:12px;"> <summary style="padding:12px 15px; cursor:pointer; color:var(--m); font-weight:600; user-select:none;">\u{1F4BC} Work Performance</summary> <div style="padding:8px 15px 15px 15px;"> <div style="display:grid; grid-template-columns:1fr; gap:12px;"> <div> <label style="display:block; margin-bottom:2px; color:var(--m); font-size:0.75rem;">\u{1F4BC} Productivity <span id="manualProductivityValue" style="color:var(--m);">-</span></label> <input type="range" id="manualProductivity" min="0" max="100" value="-1" style="width:100%;"> </div> </div> <div style="margin-top:12px;"> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Starting Position Level</label> <select id="manualCareerLevel" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.9rem;"> <option value="1">Staff (Level 1) - Default</option> <option value="2">Local Manager (Level 2)</option> <option value="3">Regional Manager (Level 3)</option> <option value="4">Branch Manager (Level 4)</option> <option value="5">Division Head (Level 5)</option> </select> </div> <!-- Position Slot Selector (shown when level > 1 or when there are multiple slots) --> <div id="positionSlotSelector" style="margin-top:10px; display:none;"> <label style="display:block; margin-bottom:4px; color:var(--v); font-size:0.8rem;">\u26A0\uFE0F Assign to Position Slot</label> <select id="manualPositionSlot" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--v); border-radius:4px; color:var(--b); font-size:0.9rem;"> <!-- Options populated dynamically --> </select> <p id="positionSlotWarning" style="color:var(--v); font-size:0.75rem; margin:6px 0 0 0;"></p> </div> <div style="margin-top:10px;"> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Custom Salary (optional)</label> <input type="number" id="manualSalary" placeholder="Auto-calculate from level" min="0" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.9rem;"> </div> </div> </details> <!-- Traits & Interests Section --> <details style="background:var(--f); border-radius:8px; margin-bottom:12px;"> <summary style="padding:12px 15px; cursor:pointer; color:var(--d); font-weight:600; user-select:none;">\u{1F3AF} Traits & Interests</summary> <div style="padding:8px 15px 15px 15px;"> <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;"> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Personality Traits</label> <input type="text" id="manualTraits" placeholder="Playful, Confident, Witty" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Hobbies</label> <input type="text" id="manualHobbies" placeholder="Photography, Gaming, Yoga" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> </div> <div style="margin-top:10px;"> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Kinks/Preferences (comma separated)</label> <input type="text" id="manualKinks" placeholder="Roleplay, Teasing, Praise" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> <div style="margin-top:10px;"> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Key Trait (main defining trait)</label> <input type="text" id="manualKeyTrait" placeholder="e.g., Charismatic, Analytical, Creative" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> </div> </details> <!-- Physical Appearance Section --> <details style="background:var(--f); border-radius:8px; margin-bottom:12px;"> <summary style="padding:12px 15px; cursor:pointer; color:var(--x); font-weight:600; user-select:none;">\u{1F441}\uFE0F Physical Appearance</summary> <div style="padding:8px 15px 15px 15px;"> <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px 12px;"> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.75rem;">Hair Color</label> <input type="text" id="manualHairColor" placeholder="Red, Blonde" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.75rem;">Hair Style</label> <input type="text" id="manualHairStyle" placeholder="Long waves" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.75rem;">Hair Length</label> <select id="manualHairLength" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> <option value="">Auto</option> <option value="short">Short</option> <option value="medium">Medium</option> <option value="long">Long</option> <option value="very long">Very Long</option> </select> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.75rem;">Eye Color</label> <input type="text" id="manualEyeColor" placeholder="Blue, Green" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.75rem;">Eye Shape</label> <input type="text" id="manualEyeShape" placeholder="Almond, Round" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.75rem;">Skin Tone</label> <input type="text" id="manualSkinTone" placeholder="Fair, Tan, Dark" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.75rem;">Body Shape</label> <select id="manualBodyShape" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> <option value="">Auto</option> <option value="petite">Petite</option> <option value="slim">Slim</option> <option value="athletic">Athletic</option> <option value="average">Average</option> <option value="curvy">Curvy</option> <option value="plus-size">Plus-size</option> <option value="muscular">Muscular</option> </select> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.75rem;">Height/Build</label> <input type="text" id="manualHeightBuild" placeholder="5'6 slim" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.75rem;">Breast Size</label> <select id="manualBreastSize" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> <option value="">Auto</option> <option value="flat">Flat</option> <option value="small">Small</option> <option value="medium">Medium</option> <option value="large">Large</option> <option value="very large">Very Large</option> </select> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.75rem;">Butt Size</label> <select id="manualButtSize" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> <option value="">Auto</option> <option value="small">Small</option> <option value="medium">Medium</option> <option value="large">Large</option> <option value="very large">Very Large</option> </select> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.75rem;">Fashion Style</label> <input type="text" id="manualFashion" placeholder="Casual, Professional" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> </div> <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px;"> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Accessories</label> <select id="manualAccessories" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> <option value="">Auto-generate</option> <option value="none">None (no accessories)</option> <option value="glasses">Glasses</option> <option value="sunglasses">Sunglasses</option> <option value="earrings">Earrings</option> <option value="necklace">Necklace</option> <option value="choker">Choker</option> <option value="watch">Watch</option> <option value="bracelet">Bracelet</option> <option value="glasses, earrings">Glasses + Earrings</option> <option value="glasses, necklace">Glasses + Necklace</option> <option value="custom">Custom (type below)</option> </select> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Custom Accessories</label> <input type="text" id="manualAccessoriesCustom" placeholder="e.g. gold hoop earrings, reading glasses" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> </div> <div style="margin-top:10px;"> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Notable Features</label> <input type="text" id="manualNotableFeatures" placeholder="Freckles, Tattoos, Piercings, Beauty mark, etc." style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> </div> </details> <!-- Personal Life Section --> <details style="background:var(--f); border-radius:8px; margin-bottom:12px;"> <summary style="padding:12px 15px; cursor:pointer; color:var(--v); font-weight:600; user-select:none;">\u{1F3E0} Personal Life</summary> <div style="padding:8px 15px 15px 15px;"> <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;"> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Living Situation</label> <select id="manualLivingSituation" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> <option value="">Auto</option> <option value="apartment">Apartment</option> <option value="house">House</option> <option value="condo">Condo</option> <option value="studio">Studio</option> <option value="with-roommate">With Roommate</option> <option value="with-family">With Family</option> </select> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Relationship Status</label> <select id="manualRelationshipStatus" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> <option value="">Auto</option> <option value="single">Single</option> <option value="dating">Dating</option> <option value="serious">In Relationship</option> <option value="engaged">Engaged</option> <option value="married">Married</option> <option value="divorced">Divorced</option> <option value="widowed">Widowed</option> <option value="complicated">It's Complicated</option> </select> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Sexual Orientation</label> <select id="manualSexualOrientation" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> <option value="">Random</option> <option value="straight">Straight</option> <option value="bisexual">Bisexual</option> <option value="gay">Gay</option> <option value="lesbian">Lesbian</option> <option value="pansexual">Pansexual</option> <option value="asexual">Asexual</option> </select> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Has Pet?</label> <select id="manualHasPet" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> <option value="">Random</option> <option value="no">No</option> <option value="cat">Cat</option> <option value="dog">Dog</option> <option value="bird">Bird</option> <option value="fish">Fish</option> <option value="other">Other Pet</option> </select> </div> </div> </div> </details> <!-- Schedule Section --> <details style="background:var(--f); border-radius:8px; margin-bottom:12px;"> <summary style="padding:12px 15px; cursor:pointer; color:var(--g); font-weight:600; user-select:none;">\u{1F550} Work Schedule</summary> <div style="padding:8px 15px 15px 15px;"> <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;"> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Start Hour (24h)</label> <input type="number" id="manualWorkStart" placeholder="9" min="0" max="23" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.9rem;"> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">End Hour (24h)</label> <input type="number" id="manualWorkEnd" placeholder="17" min="0" max="23" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.9rem;"> </div> <div> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">PTO Days</label> <input type="number" id="manualPTO" placeholder="10" min="0" max="30" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.9rem;"> </div> </div> <div style="margin-top:10px;"> <label style="display:block; margin-bottom:4px; color:var(--a); font-size:0.8rem;">Work Days</label> <div style="display:flex; gap:5px; flex-wrap:wrap;"> <label style="display:flex; align-items:center; gap:3px; color:var(--a); font-size:0.8rem;"> <input type="checkbox" id="manualWorkMon" checked> Mon </label> <label style="display:flex; align-items:center; gap:3px; color:var(--a); font-size:0.8rem;"> <input type="checkbox" id="manualWorkTue" checked> Tue </label> <label style="display:flex; align-items:center; gap:3px; color:var(--a); font-size:0.8rem;"> <input type="checkbox" id="manualWorkWed" checked> Wed </label> <label style="display:flex; align-items:center; gap:3px; color:var(--a); font-size:0.8rem;"> <input type="checkbox" id="manualWorkThu" checked> Thu </label> <label style="display:flex; align-items:center; gap:3px; color:var(--a); font-size:0.8rem;"> <input type="checkbox" id="manualWorkFri" checked> Fri </label> <label style="display:flex; align-items:center; gap:3px; color:var(--a); font-size:0.8rem;"> <input type="checkbox" id="manualWorkSat"> Sat </label> <label style="display:flex; align-items:center; gap:3px; color:var(--a); font-size:0.8rem;"> <input type="checkbox" id="manualWorkSun"> Sun </label> </div> </div> </div> </details> <!-- Starting Flags Section --> <details style="background:var(--f); border-radius:8px; margin-bottom:12px;"> <summary style="padding:12px 15px; cursor:pointer; color:var(--k); font-weight:600; user-select:none;">\u{1F6A9} Starting Flags (Advanced)</summary> <div style="padding:8px 15px 15px 15px;"> <p style="color:var(--e); font-size:0.75rem; margin:0 0 10px 0;">Add custom flags/tags for this character (comma separated)</p> <input type="text" id="manualFlags" placeholder="e.g., exhibitionist_curious, dom_leaning, pet_owner" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--k); border-radius:4px; color:var(--b); font-size:0.85rem;"> <p style="color:var(--q); font-size:0.7rem; margin:8px 0 0 0;">Common flags: shy, dominant, submissive, curious, experienced, virgin, kinky, vanilla</p> </div> </details> <!-- Bio Section --> <details open style="background:var(--f); border-radius:8px; margin-bottom:12px;"> <summary style="padding:12px 15px; cursor:pointer; color:var(--m); font-weight:600; user-select:none;">\u{1F4DD} Biography & Backstory</summary> <div style="padding:8px 15px 15px 15px;"> <textarea id="manualBio" placeholder="Write their backstory, motivations, secrets, and personality quirks... Leave blank to auto-generate based on other fields." style="width:100%; min-height:100px; padding:10px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-family:inherit; resize:vertical; font-size:0.9rem;"></textarea> </div> </details> <!-- Create Button --> <button id="createManualEmployeeBtn" class="btn btn--lg btn--fg w-full" style="position:sticky; bottom:0;"> \u2728 Create Custom Employee </button> </div> </div> <p style="margin-top:12px; color:var(--a); font-size:.9rem;">You\u2019ll be charged <strong class="num">$${wu(Fu(t))}</strong> when you choose a candidate.</p> </div> `, ModalManager.show(a, "hiringModal"), a.addEventListener("click", (e2) => {
    e2.target === a && closeHiringModal();
  });
  const s = a.querySelector(".close-modal-btn");
  s && s.addEventListener("click", closeHiringModal), a.querySelectorAll(".select-candidate-btn").forEach((e2) => {
    e2.addEventListener("click", () => {
      const t2 = parseInt(e2.dataset.index, 10);
      if (!Number.isNaN(t2)) {
        const e3 = gameState.currentCandidates?.[t2];
        e3?.isRehire ? (finalizeRehire(t2, 1), closeHiringModal()) : selectManagerCandidate(t2);
      }
    });
  });
  const r = a.querySelectorAll(".hiring-mode-toggle");
  r.forEach((e2) => {
    e2.addEventListener("click", () => {
      const t2 = e2.dataset.mode;
      if (t2 && ("new" === t2 || "rehire" === t2 || "custom" === t2)) {
        gameState.hiringMode = t2;
        const e3 = a.querySelector("#candidates-container"), n2 = a.querySelector("#custom-employee-container");
        if ("custom" === t2) e3 && (e3.style.display = "none"), n2 && (n2.style.display = "block"), uc(a);
        else {
          e3 && (e3.style.display = "flex"), n2 && (n2.style.display = "none");
          const t3 = o();
          e3 && (e3.innerHTML = t3), a.querySelectorAll(".select-candidate-btn").forEach((e4) => {
            e4.addEventListener("click", () => {
              const t4 = parseInt(e4.dataset.index, 10);
              if (!Number.isNaN(t4)) {
                const e5 = gameState.currentCandidates?.[t4];
                e5?.isRehire ? (finalizeRehire(t4, 1), closeHiringModal()) : selectManagerCandidate(t4);
              }
            });
          });
        }
        r.forEach((e4) => {
          e4.dataset.mode === t2 ? "rehire" === t2 ? (e4.style.background = "linear-gradient(135deg, var(--z) 0%, #ff8c00 100%)", e4.style.borderColor = "var(--z)", e4.style.color = "var(--q)") : "custom" === t2 ? (e4.style.background = "linear-gradient(135deg, var(--n) 0%, var(--u) 100%)", e4.style.borderColor = "var(--n)", e4.style.color = "var(--b)") : (e4.style.background = "linear-gradient(135deg, var(--l) 0%, var(--t) 100%)", e4.style.borderColor = "var(--l)", e4.style.color = "var(--b)") : (e4.style.background = "transparent", e4.style.borderColor = "var(--af)", e4.style.color = "var(--b)");
        });
      }
    });
  });
  const l = a.querySelectorAll(".custom-mode-toggle");
  l.forEach((e2) => {
    e2.addEventListener("click", () => {
      const t2 = e2.dataset.submode, n2 = a.querySelector("#quick-mode-content"), o2 = a.querySelector("#manual-mode-content");
      "quick" === t2 ? (n2 && (n2.style.display = "block"), o2 && (o2.style.display = "none")) : (n2 && (n2.style.display = "none"), o2 && (o2.style.display = "block")), l.forEach((e3) => {
        e3.dataset.submode === t2 ? (e3.style.background = "linear-gradient(135deg, var(--n) 0%, var(--u) 100%)", e3.style.borderColor = "var(--n)") : (e3.style.background = "transparent", e3.style.borderColor = "var(--af)");
      });
    });
  });
  const u2 = a.querySelector("#importCharacterBtn");
  u2 && u2.addEventListener("click", () => hb(e)), [{ slider: "manualConfidence", value: "manualConfidenceValue" }, { slider: "manualOutgoing", value: "manualOutgoingValue" }, { slider: "manualFlirty", value: "manualFlirtyValue" }, { slider: "manualProfessional", value: "manualProfessionalValue" }, { slider: "manualHumor", value: "manualHumorValue" }, { slider: "manualAffection", value: "manualAffectionValue", showDash: true }, { slider: "manualComfort", value: "manualComfortValue", showDash: true }, { slider: "manualTrust", value: "manualTrustValue", showDash: true }, { slider: "manualDesire", value: "manualDesireValue", showDash: true }, { slider: "manualFriendship", value: "manualFriendshipValue", showDash: true }, { slider: "manualObedience", value: "manualObedienceValue", showDash: true }, { slider: "manualProductivity", value: "manualProductivityValue", showDash: true }].forEach((e2) => {
    const t2 = a.querySelector(`#${e2.slider}`), n2 = a.querySelector(`#${e2.value}`);
    t2 && n2 && (e2.showDash && (t2.value = -1, n2.textContent = "-"), t2.addEventListener("input", () => {
      const a2 = parseInt(t2.value);
      e2.showDash && a2 < 0 ? n2.textContent = "-" : (n2.textContent = Math.max(0, a2), a2 < 0 && (t2.value = 0));
    }));
  });
  const c = a.querySelector("#manualRace"), d = a.querySelector("#manualEthnicityRow"), p = a.querySelector("#customRaceBuilder"), m = a.querySelector("#customRaceDetails"), G2 = a.querySelector("#addCustomRaceDetail");
  let g = 0;
  const h = () => {
    g++;
    const e2 = g, t2 = document.createElement("div");
    t2.className = "custom-race-detail-row", t2.dataset.detailId = e2, t2.style.cssText = "display:grid; grid-template-columns:1fr 2fr auto; gap:8px; margin-bottom:8px; align-items:start;", t2.innerHTML = ` <div> <input type="text" class="custom-detail-name" placeholder="Feature name (e.g., Horns)" style="width:100%; padding:6px 8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> <div> <input type="text" class="custom-detail-desc" placeholder="Description (e.g., Long, curved, obsidian black)" style="width:100%; padding:6px 8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> </div> <button type="button" class="remove-detail-btn" style="padding:6px 10px; background:rgba(233,69,96,0.2); border:1px solid var(--k); border-radius:4px; color:var(--k); cursor:pointer; font-size:0.8rem;" onmouseover="this.style.background='rgba(233,69,96,0.4)'" onmouseout="this.style.background='rgba(233,69,96,0.2)'">&times;</button> `, t2.querySelector(".remove-detail-btn").addEventListener("click", () => {
      t2.remove();
    }), m.appendChild(t2);
  };
  if (G2 && G2.addEventListener("click", h), c && d) {
    const e2 = () => {
      const e3 = c.value.toLowerCase();
      if (p && ("custom" === e3 ? (p.style.display = "block", m && 0 === m.children.length && h()) : p.style.display = "none"), "" === e3 || "human" === e3) d.style.display = "block";
      else {
        d.style.display = "none";
        const e4 = a.querySelector("#manualEthnicity");
        e4 && (e4.value = "");
      }
    };
    c.addEventListener("change", e2), e2();
  }
  const y = a.querySelector("#manualAccessories"), f = a.querySelector("#manualAccessoriesCustom");
  if (y && f) {
    const e2 = () => {
      "custom" === y.value ? (f.placeholder = "Type your custom accessories...", f.style.borderColor = "var(--n)") : "none" === y.value ? (f.placeholder = "(No accessories selected)", f.style.borderColor = "var(--af)", f.value = "") : (f.placeholder = "Or type custom accessories here...", f.style.borderColor = "var(--af)");
    };
    y.addEventListener("change", e2), e2();
  }
  const b = a.querySelector("#manualCareerLevel"), v = a.querySelector("#positionSlotSelector"), w = a.querySelector("#manualPositionSlot"), x = a.querySelector("#positionSlotWarning");
  function S(t2) {
    if (!w || !v) return;
    const n2 = gameState.corporatePyramid?.positions?.[t2] || [], a2 = n2.filter((e2) => !e2.employeeId);
    w.innerHTML = "";
    let o2 = 0;
    if (0 === a2.length) w.innerHTML = '<option value="">\u26A0\uFE0F No empty slots at this level</option>', x.textContent = `All ${gameState.hierarchyLevels[t2]?.title || "Level " + t2} positions are filled. Promote or fire someone first.`, x.style.display = "block", x.style.color = "var(--v)";
    else {
      if (a2.forEach((a3, i3) => {
        const s2 = gameState.products.find((e2) => e2.id === a3.productId), r2 = s2?.name || a3.productId || "Unknown", l2 = gameState.hierarchyLevels[t2], c2 = document.createElement("option");
        c2.value = JSON.stringify({ level: a3.level, productId: a3.productId, index: n2.indexOf(a3) }), c2.textContent = `${l2?.title || "Level " + t2} - ${r2}`, a3.productId === e && (o2 = i3), w.appendChild(c2);
      }), w.options[o2] && (w.selectedIndex = o2), 1 === a2.length) x.textContent = "This is the only empty slot at this level.";
      else {
        const n3 = gameState.products.find((t3) => t3.id === e);
        a2.some((t3) => t3.productId === e) ? x.textContent = `${a2.length} slots available. Pre-selected: ${n3?.name || e}` : x.textContent = `${a2.length} slots available. The ${n3?.name || e} doesn't have a Level ${t2} slot.`;
      }
      x.style.color = "var(--n)", x.style.display = "block";
    }
    const i2 = (gameState.corporatePyramid?.positions?.[1] || []).filter((e2) => !e2.employeeId);
    t2 > 1 || i2.length > 1 ? v.style.display = "block" : v.style.display = "none";
  }
  b && (S(parseInt(b.value) || 1), b.addEventListener("change", () => {
    S(parseInt(b.value) || 1);
  }));
  const k = a.querySelector("#manualAge");
  k && (k.addEventListener("change", () => {
    const e2 = parseInt(k.value);
    !isNaN(e2) && e2 < 18 && (k.value = 18);
  }), k.addEventListener("blur", () => {
    const e2 = parseInt(k.value);
    !isNaN(e2) && e2 < 18 && (k.value = 18);
  }));
  const T = a.querySelector("#recoverCharacterBtn");
  T && T.addEventListener("click", () => {
    oc && yc(oc, rc || e, sc || "Recovered");
  }), uc(a);
  const C = a.querySelector("#generateFromUrlBtn");
  C && C.addEventListener("click", async () => {
    const t2 = a.querySelector("#customEmployeeUrlInput"), n2 = a.querySelector("#customEmployeeExtraInstructions"), o2 = t2?.value?.trim();
    if (o2) {
      closeHiringModal(), showNotification("\u{1F517} Generating character in background... You can continue playing!", "info", 5e3);
      try {
        const t3 = await generateEmployeeFromUrl(o2, n2?.value || "", e);
        t3 && yc(t3, e, "URL");
      } catch (u3) {
        console.error("URL generation error:", u3), showNotification("Failed to generate from URL. Try a different page or use description mode.", "error");
      }
    } else showNotification("Please enter a URL", "error");
  });
  const E = a.querySelector("#generateFromPromptBtn");
  E && E.addEventListener("click", async () => {
    const t2 = a.querySelector("#customEmployeePromptInput"), n2 = a.querySelector("#customEmployeeExtraInstructions"), o2 = t2?.value?.trim();
    if (o2) {
      closeHiringModal(), showNotification("\u{1F916} Generating character in background... You can continue playing!", "info", 5e3);
      try {
        const t3 = await generateEmployeeFromPrompt(o2, n2?.value || "", e);
        t3 && yc(t3, e, "Description");
      } catch (u3) {
        console.error("Prompt generation error:", u3), showNotification("Failed to generate employee. Please try again.", "error");
      }
    } else showNotification("Please describe your employee", "error");
  });
  const $2 = a.querySelector("#familySourceEmployee"), I = a.querySelector("#familyRelationshipType"), M = a.querySelector("#familyPreviewBox"), P = a.querySelector("#familyPreviewText"), A = a.querySelector("#generateFamilyMemberBtn");
  if ($2) {
    gameState.employees.filter((e3) => "active" === e3.employmentStatus || e3.hired).sort((e3, t2) => e3.name.localeCompare(t2.name)).forEach((e3) => {
      const t2 = document.createElement("option");
      t2.value = e3.id, t2.textContent = `${e3.name} (${e3.career?.title || "Staff"})`, $2.appendChild(t2);
    });
    const e2 = () => {
      const e3 = $2.value, t2 = I.value;
      if (e3 && t2) {
        const n2 = gameState.employees.find((t3) => t3.id === e3), a2 = Jl[t2];
        if (n2 && a2) {
          let e4 = "";
          const t3 = n2.age || 28;
          e4 = "older" === a2.ageDirection ? `Age: ${t3 + a2.ageAdjust[0]}-${t3 + a2.ageAdjust[1]}` : "younger" === a2.ageDirection ? "Age: 18-34" : `Age: ${Math.max(18, t3 + a2.ageAdjust[0])}-${t3 + a2.ageAdjust[1]}`;
          const o2 = a2.genderLock ? " \u2022 Gender: " + ("male" === a2.genderLock ? "Male" : "Female") : "", i2 = n2.ethnicity ? ` \u2022 Ethnicity: ${n2.ethnicity}` : "";
          P.innerHTML = ` <strong style="color:var(--v);">${a2.label}</strong> of <strong>${n2.name}</strong> <div style="color:var(--a); font-size:0.8rem; margin-top:4px;">${e4}${o2}${i2}</div> `, M.style.display = "block", A.disabled = false, A.style.opacity = "1";
        }
      } else M.style.display = "none", A.disabled = true, A.style.opacity = "0.5";
    };
    $2.addEventListener("change", e2), I.addEventListener("change", e2);
  }
  A && A.addEventListener("click", async () => {
    const t2 = $2?.value, n2 = I?.value;
    if (!t2 || !n2) return void showNotification("Please select an employee and relationship type", "error");
    const a2 = gameState.employees.find((e2) => e2.id === t2);
    if (!a2) return void showNotification("Selected employee not found", "error");
    const o2 = Zl(a2, n2);
    if (!o2) return void showNotification("Failed to generate family member", "error");
    const i2 = Jl[n2];
    A.disabled = true, A.innerHTML = '<span style="display:inline-block; animation:rotate 1.5s linear infinite;">\u23F3</span> Generating...', showNotification(`\u{1F916} Generating ${i2.label.toLowerCase()} for ${a2.name}...`, "info", 5e3);
    try {
      const t3 = `
Source Employee: ${a2.name}
Age: ${a2.age}
Gender: ${a2.gender}
Ethnicity: ${a2.ethnicity || "not specified"}
Personality: ${a2.personalityTraits?.join(", ") || "various"}
Key Trait: ${a2.keyTrait || "unknown"}
Bio: ${a2.bio || "A company employee"}`, u3 = o2.existingPartnerInfo ? `

IMPORTANT: ${a2.name} already has an established ${o2.existingPartnerInfo.relationshipType || "relationship"} with this exact person (${o2.name})${o2.existingPartnerInfo.occupation ? `, who works as a(n) ${o2.existingPartnerInfo.occupation}` : ""}${o2.existingPartnerInfo.yearsTogether ? `. They have been together ${o2.existingPartnerInfo.yearsTogether} year(s)` : ""}${o2.existingPartnerInfo.hasKids ? " and have kids together" : ""}${o2.existingPartnerInfo.endReason ? ` (the relationship ended due to ${o2.existingPartnerInfo.endReason})` : ""}. The bio you write MUST be consistent with this existing history, not a fresh unrelated backstory.` : "", s2 = `Create a detailed character profile for someone who is the ${i2.label.toUpperCase()} of this person:
${t3}${u3}

The new family member's basic info:
- Name: ${o2.name}
- Age: ${o2.age}
- Gender: ${o2.gender}
- Race: ${o2.race}
- Ethnicity: ${o2.ethnicity || "same as source"}

Create a complete profile that makes sense for this family relationship. The ${i2.label.toLowerCase()} should have their own distinct personality while sharing some family traits.

Return ONLY a JSON object (no markdown, no explanation) with these fields:
{
  "bio": "<2-3 sentence background mentioning their relationship to ${a2.name} and their own life/career path>",
  "personalityTraits": ["trait1", "trait2", "trait3"],
  "keyTrait": "<single defining characteristic>",
  "hobbies": ["hobby1", "hobby2"],
  "kinks": ["preference1", "preference2", "preference3"],
  "personality": {
    "confidence": <10-90>,
    "outgoing": <10-90>,
    "flirty": <10-90>,
    "professional": <10-90>,
    "humor": <10-90>
  },
  "physical": {
    "hairColor": "<color - ${o2.inheritedFeatures?.hairColor ? "should be " + o2.inheritedFeatures.hairColor + " (inherited)" : "choose appropriate"}>", "hairStyle": "<style>", "hairLength": "<length description>", "hairTexture": "<texture>", "eyeColor": "<color - ${o2.inheritedFeatures?.eyeColor ? "should be " + o2.inheritedFeatures.eyeColor + " (inherited)" : "choose appropriate"}>",
    "eyeShape": "<shape>",
    "skinTone": "<tone - ${o2.inheritedFeatures?.skinTone ? "should be " + o2.inheritedFeatures.skinTone + " (inherited)" : "choose appropriate for ethnicity"}>",
    "bodyShape": "<body type description>",
    "heightBuild": "<height and build>",
    "breastSize": "<for female/futa: size description, for male: chest description>",
    "buttSize": "<description>",
    "fashion": "<clothing style preference>",
    "accessories": "<any accessories or 'none'>",
    "notableFeatures": "<distinguishing features, birthmarks, etc>",
    "genitalType": "<vagina/penis/penis and vagina based on gender>",
    "genitalSize": "<size description>",
    "genitalCharacteristics": "<grooming/characteristics>"
  }
}`, r2 = await queuedGenerateText(s2, {}, `Family Member - ${i2.label} of ${a2.name}`);
      let l2;
      try {
        const e2 = r2.match(/\{[\s\S]*\}/);
        if (!e2) throw new Error("No JSON found in response");
        l2 = JSON.parse(e2[0]);
      } catch (u4) {
        throw console.error("Failed to parse AI response for family member:", u4, r2), new Error("AI returned invalid format");
      }
      const c2 = { ...o2, bio: l2.bio || `${a2.name}'s ${i2.label.toLowerCase()}, recently joined the company.`, personalityTraits: l2.personalityTraits || o2.personalityTraits, keyTrait: l2.keyTrait || o2.keyTrait, hobbies: l2.hobbies || o2.hobbies, kinks: l2.kinks || o2.kinks, personality: l2.personality || o2.personality, physical: { hairColor: l2.physical?.hairColor || o2.inheritedFeatures?.hairColor, hairStyle: l2.physical?.hairStyle, hairLength: l2.physical?.hairLength, hairTexture: l2.physical?.hairTexture, eyeColor: l2.physical?.eyeColor || o2.inheritedFeatures?.eyeColor, eyeShape: l2.physical?.eyeShape, skinTone: l2.physical?.skinTone || o2.inheritedFeatures?.skinTone, bodyShape: l2.physical?.bodyShape, heightBuild: l2.physical?.heightBuild, breastSize: l2.physical?.breastSize, buttSize: l2.physical?.buttSize, fashion: l2.physical?.fashion, accessories: l2.physical?.accessories, notableFeatures: l2.physical?.notableFeatures, genitalType: l2.physical?.genitalType, genitalSize: l2.physical?.genitalSize, genitalCharacteristics: l2.physical?.genitalCharacteristics } };
      c2.pendingFamilyLink = { relatedTo: a2.id, relationship: n2 }, delete c2.inheritedFeatures, delete c2.pendingFamilyRelation, closeHiringModal(), yc(c2, e, `${i2.label} of ${a2.name}`), showNotification(`\u2728 Generated ${i2.label} of ${a2.name}!`, "success");
    } catch (u3) {
      console.error("Family member generation error:", u3), showNotification("Failed to generate family member. Please try again.", "error"), A.disabled = false, A.innerHTML = "\u{1F468}\u200D\u{1F469}\u200D\u{1F467} Generate Family Member";
    }
  });
  const N = a.querySelector("#createManualEmployeeBtn");
  try {
    nr("manual"), ar("manual", { physical: {}, gender: a.querySelector("#manualGender")?.value || "female" }), ir("manualTraits", null, ii), ir("manualHobbies", null, ri), ir("manualKinks", null, si);
  } catch (e2) {
    console.warn("manual form upgrade failed", e2);
  }
  N && N.addEventListener("click", async () => {
    const t2 = parseInt(a.querySelector("#manualCareerLevel")?.value) || 1, n2 = a.querySelector("#manualPositionSlot")?.value;
    if (!(t2 > 1 || 1 === t2 && "none" !== a.querySelector("#positionSlotSelector")?.style.display) || n2 && !n2.includes("No empty slots")) {
      N.disabled = true, N.innerHTML = '<span style="display:inline-block; animation:rotate 1.5s linear infinite;">\u23F3</span> Creating...';
      try {
        const t3 = (e2) => {
          const t4 = parseInt(a.querySelector(`#${e2}`)?.value);
          return -1 === t4 || isNaN(t4) ? null : t4;
        }, n3 = [];
        a.querySelector("#manualWorkMon")?.checked && n3.push(1), a.querySelector("#manualWorkTue")?.checked && n3.push(2), a.querySelector("#manualWorkWed")?.checked && n3.push(3), a.querySelector("#manualWorkThu")?.checked && n3.push(4), a.querySelector("#manualWorkFri")?.checked && n3.push(5), a.querySelector("#manualWorkSat")?.checked && n3.push(6), a.querySelector("#manualWorkSun")?.checked && n3.push(0);
        const o2 = { name: a.querySelector("#manualName")?.value?.trim() || "", age: parseInt(a.querySelector("#manualAge")?.value) || null, gender: a.querySelector("#manualGender")?.value || "", race: a.querySelector("#manualRace")?.value || "", ethnicity: a.querySelector("#manualEthnicity")?.value || "", customRace: (() => {
          if ("custom" !== a.querySelector("#manualRace")?.value) return null;
          const e2 = a.querySelector("#customRaceName")?.value?.trim() || "";
          if (!e2) return null;
          const t4 = [];
          return a.querySelectorAll(".custom-race-detail-row").forEach((e3) => {
            const n4 = e3.querySelector(".custom-detail-name")?.value?.trim() || "", a2 = e3.querySelector(".custom-detail-desc")?.value?.trim() || "";
            (n4 || a2) && t4.push({ name: n4, description: a2 });
          }), { name: e2, details: t4 };
        })(), personality: { confidence: parseInt(a.querySelector("#manualConfidence")?.value) || 50, outgoing: parseInt(a.querySelector("#manualOutgoing")?.value) || 50, flirty: parseInt(a.querySelector("#manualFlirty")?.value) || 50, professional: parseInt(a.querySelector("#manualProfessional")?.value) || 50, humor: parseInt(a.querySelector("#manualHumor")?.value) || 50 }, stats: { affection: t3("manualAffection"), comfort: t3("manualComfort"), trust: t3("manualTrust"), desire: t3("manualDesire"), friendship: t3("manualFriendship"), obedience: t3("manualObedience"), productivity: t3("manualProductivity") }, career: { level: parseInt(a.querySelector("#manualCareerLevel")?.value) || 1, salary: parseInt(a.querySelector("#manualSalary")?.value) || null, selectedSlot: (() => {
          try {
            const e2 = a.querySelector("#manualPositionSlot")?.value;
            return e2 ? JSON.parse(e2) : null;
          } catch (u3) {
            return null;
          }
        })() }, personalityTraits: document.getElementById("manualTraits_tags") ? Zi("manualTraits_tags") : (a.querySelector("#manualTraits")?.value || "").split(",").map((e2) => e2.trim()).filter(Boolean), hobbies: document.getElementById("manualHobbies_tags") ? Zi("manualHobbies_tags") : (a.querySelector("#manualHobbies")?.value || "").split(",").map((e2) => e2.trim()).filter(Boolean), kinks: document.getElementById("manualKinks_tags") ? Zi("manualKinks_tags") : (a.querySelector("#manualKinks")?.value || "").split(",").map((e2) => e2.trim()).filter(Boolean), keyTrait: a.querySelector("#manualKeyTrait")?.value?.trim() || "", physical: { hair: { color: a.querySelector("#manualHairColor")?.value?.trim() || "", style: a.querySelector("#manualHairStyle")?.value?.trim() || "", length: a.querySelector("#manualHairLength")?.value || "" }, eyes: { color: a.querySelector("#manualEyeColor")?.value?.trim() || "", shape: a.querySelector("#manualEyeShape")?.value?.trim() || "" }, skinTone: a.querySelector("#manualSkinTone")?.value?.trim() || "", bodyShape: a.querySelector("#manualBodyShape")?.value || "", heightBuild: a.querySelector("#manualHeightBuild")?.value?.trim() || "", breastSize: a.querySelector("#manualBreastSize")?.value || "", buttSize: a.querySelector("#manualButtSize")?.value || "", fashion: a.querySelector("#manualFashion")?.value?.trim() || "", accessories: (() => {
          const e2 = a.querySelector("#manualAccessories")?.value || "", t4 = a.querySelector("#manualAccessoriesCustom")?.value?.trim() || "";
          return "custom" === e2 || t4 ? t4 || "" : "none" === e2 ? "none" : e2;
        })(), notableFeatures: a.querySelector("#manualNotableFeatures")?.value?.trim() || "" }, personalLife: { livingSituation: a.querySelector("#manualLivingSituation")?.value || "", relationshipStatus: a.querySelector("#manualRelationshipStatus")?.value || "", sexualOrientation: a.querySelector("#manualSexualOrientation")?.value || "", hasPet: a.querySelector("#manualHasPet")?.value || "" }, schedule: { workDays: n3.length > 0 ? n3 : [1, 2, 3, 4, 5], workStartHour: parseInt(a.querySelector("#manualWorkStart")?.value) || 9, workEndHour: parseInt(a.querySelector("#manualWorkEnd")?.value) || 17, ptoBalance: parseInt(a.querySelector("#manualPTO")?.value) || 10 }, startingFlags: (a.querySelector("#manualFlags")?.value || "").split(",").map((e2) => e2.trim()).filter(Boolean), bio: a.querySelector("#manualBio")?.value?.trim() || "" }, i2 = await createManualEmployee(o2, e);
        if (i2) {
          i2.physical || (i2.physical = {});
          const gen = Ui("manualGenitalCards");
          gen.length && (i2.physical.genitals = gen), i2.physical.piercings = Wi("manualPiercingCards"), i2.physical.tattoos = Vi("manualTattooCards"), "function" == typeof mr && mr(i2.physical, i2.gender), showNotification(`\u2728 Created ${i2.name}!`, "success"), closeHiringModal();
        }
      } catch (u3) {
        console.error("Manual creation error:", u3), showNotification("Failed to create employee. Please try again.", "error");
      } finally {
        N.disabled = false, N.innerHTML = "\u2728 Create Custom Employee";
      }
    } else showNotification(`\u26A0\uFE0F No empty ${gameState.hierarchyLevels?.[t2]?.title || "Level " + t2} positions available!`, "error");
  });
  const L = (e2) => {
    "Escape" === e2.key && (closeHiringModal(), window.removeEventListener("keydown", L));
  };
  window.addEventListener("keydown", L);
}
function closeHiringModal() {
  ModalManager.close("hiringModal"), gameState.currentCandidates = null, document.body.style.overflow = "";
}
async function Tc(e) {
  try {
    const t = e.stats || {}, n = e.intimacy || {}, a = (e.memory, e.chatHistory || []), o = e.conversationArchive || [], i = t.affection || 50, s = t.trust || 50, r = t.desire || 50, l = n.level || 0, c = n.sexCount || 0, d = e.timesRehired || 1, p = [...o, ...a].slice(-10).map((e2) => e2.content).join(" | "), m = (i + s) / 2, u2 = m >= 70 ? "excellent" : m >= 50 ? "good" : m >= 30 ? "strained" : "poor", g = l >= 50 || c > 0, h = i >= 70 && r >= 60, y = `You are ${e.name}, a ${e.age}-year-old ${e.gender} who previously worked for the player as a manager.

RELATIONSHIP CONTEXT:
- Affection: ${i}/100 (${i >= 70 ? "very high" : i >= 50 ? "positive" : i >= 30 ? "neutral" : "low"})
- Trust: ${s}/100 (${s >= 70 ? "very high" : s >= 50 ? "trusting" : s >= 30 ? "cautious" : "distrustful"})
- Desire: ${r}/100
- Intimacy Level: ${l}/100
- Sexual encounters: ${c}
- Times rehired: ${d}
- Overall relationship: ${u2}${g ? ", sexual" : ""}${h ? ", romantic" : ""}

PERSONALITY:
${e.personality || "Professional and dedicated"}

RECENT CONVERSATION TOPICS:
${p || "No recent conversation history"}

INSTRUCTIONS:
Generate a SINGLE short message (1-2 sentences, max 150 characters) that ${e.name} would send when being rehired.

IMPORTANT TONE GUIDELINES:
${g && i >= 60 ? `- Be flirty, suggestive, and reference your intimate past. Use innuendo or explicit language. Example: "Can't wait for those 'after hours' meetings again \u{1F60F}" or "Missed our special connection... ready to make up for lost time \u2764\uFE0F"` : ""}
${h && !g ? "- Be warm, affectionate, and emotionally connected. Show you missed them personally." : ""}
${m >= 70 && !g ? "- Be enthusiastic and happy to return. Express genuine excitement." : ""}
${m >= 40 && m < 70 ? "- Be professional but friendly. Acknowledge the working relationship." : ""}
${m < 40 ? `- Be distant, cold, or passive-aggressive. Maybe express reluctance or sarcasm. Example: "Well, here we are again..." or "Guess I'm back... for now."` : ""}

NO LIMITS on suggestiveness if intimacy is high. Match the energy of your past interactions.

Generate ONLY the message, no quotes, no explanation:`;
    return await queryLLM(y, { type: "rehire-message", employee: e.name, temperature: 0.9, maxTokens: 80 }) || "It's good to be back! Ready to get to work. \u{1F4BC}";
  } catch (u2) {
    console.error("Error generating rehire message:", u2);
    const n = e.stats?.affection || 50;
    return n >= 70 ? "Boss! I've missed you so much! \u{1F495} Ready to make this work... amazing. \u{1F60F}" : n >= 50 ? "Hey! Good to be back working with you again! \u{1F60A}" : "Well... I'm back. Let's see how this goes.";
  }
}
async function selectManagerCandidate(e) {
  const t = gameState.currentCandidates?.[e], n = gameState.products.find((e2) => e2.id === t?.productId);
  if (!t || !n) return;
  if (gameState.cash < Fu(n)) return void showNotification("Not enough cash!");
  const a = t.isFormerEmployee || false;
  t.hired = true, t.position = `Manager \u2013 ${n.name}`, t.productManaged = n.name, gameState.usedEmployeeNames || (gameState.usedEmployeeNames = /* @__PURE__ */ new Set()), gameState.usedEmployeeNames.add(t.name), console.log(`[Hire] Marked ${t.name} as used (${gameState.usedEmployeeNames.size} total names)`), t.hireDate || (t.hireDate = Date.now()), a ? (t.onboarding = false, t.bioComplete = true, t.chatHistory && t.chatHistory.length > 0 && (gameState.chatHistory[t.id] = t.chatHistory), t.conversationArchive ? t.conversationArchive = t.conversationArchive : t.conversationArchive = [], t.loyaltyBonus && (t.stats.productivity = Math.min(100, (t.stats.productivity || 70) * (1 + t.loyaltyBonus))), gameState.chatHistory[t.id] || (gameState.chatHistory[t.id] = []), Tc(t).then((e2) => {
    gameState.chatHistory[t.id].push({ sender: t.name, content: e2, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() }), saveGame(false), t.unreadMessages = (t.unreadMessages || 0) + 1, gameState.activeChat === t.id && renderChatMessages();
  }), showNotification(`${t.name} has returned! +${(100 * t.loyaltyBonus).toFixed(0)}% loyalty bonus!`)) : (t.onboarding = true, t.bioComplete = false), n.managerOnboarding = !a, n.managerId = t.id, n.managerLevel = 1, n.managerHired = true, t.locationId = n.locationId || "headquarters", t.location = t.locationId;
  const s = Fu(n);
  if (gameState.cash -= s, t.hireCostPaid = s, n.running || (n.running = true, n.timeRemainingMs = currentCycleTimeMs(n)), a || gameState.onboarding.push(t), closeHiringModal(), updatePeopleTab(), updateProductsList(), a) bc(t, n);
  else try {
    const e2 = `
  Create an in-world, adult female NPC profile (no meta-talk) for: ${t.name}, age ${t.age}.
  Gender: female.
  Role: ${t.position}. Product managed: ${n.name}.
  Personality traits: ${t.personalityTraits.join(", ")}. Key trait: ${t.keyTrait}.
  Hobbies: ${t.hobbies.join(", ")}. Kink preferences: ${t.kinks.join(", ")}.

  Respond as a compact JSON object with these keys ONLY:
  {
  "name": {"first":"", "last":""},
  "age": <number>,
  "gender": "female",
  "productManaged": "${n.name}",
  "bio": "<2-3 sentence personality/background, world-grounded>",
  "appearance": {
  "heightBuild": "",
  "hair": {"color":"","style":"","length":""},
  "eyes": {"color":"","shape":""},
  "skinTone": "",
  "bodyShape": "",
  "breastSize": "",
  "buttSize": "",
  "fashion": ""
  },
  "personalityTraits": [${t.personalityTraits.map((e3) => `"${e3}"`).join(", ")}],
  "kinks": [${t.kinks.map((e3) => `"${e3}"`).join(", ")}]
  }
  `, a2 = "function" == typeof generateText ? await queuedGenerateText(e2, {}, `Manager Profile - ${t.name}`) : `{"name":{"first":"${t.name.split(" ")[0]}","last":"${t.name.split(" ")[1] || ""}"},"age":${t.age},"productManaged":"${n.name}","bio":"Quick learner; keeps launches smooth.","appearance":{"heightBuild":"average","hair":{"color":"brown","style":"soft waves","length":"shoulder"},"eyes":{"color":"green","shape":"almond"},"skinTone":"light","bodyShape":"curvy","breastSize":"medium","buttSize":"full","fashion":"smart casual"},"personalityTraits":["${t.personalityTraits.join('","')}"],"kinks":["${t.kinks.join('","')}"]}`;
    let o;
    try {
      o = JSON.parse(a2);
    } catch {
      o = null;
    }
    if (o && o.name) {
      t.name = `${o.name.first} ${o.name.last}`.trim() || t.name, t.age = o.age ?? t.age, t.productManaged = o.productManaged || n.name, t.bio = o.bio || "Keeps things moving; loves clean launches.", t.physical = ni(t.gender || "female", t.race || "human", t.ethnicity || null);
      const e3 = o.appearance || {};
      e3.heightBuild && (t.physical.heightBuild = e3.heightBuild), e3.hair && (t.physical.hair = { ...t.physical.hair, ...e3.hair }), e3.eyes && (t.physical.eyes = { ...t.physical.eyes, ...e3.eyes }), e3.skinTone && (t.physical.skin.tone = e3.skinTone), e3.bodyShape && (t.physical.body.shape = e3.bodyShape), (e3.breastSize || e3.chestSize) && (t.physical.body.chestSize = e3.chestSize || e3.breastSize, t.physical.body.breastSize = e3.chestSize || e3.breastSize), e3.buttSize && (t.physical.body.buttSize = e3.buttSize), e3.fashion && (t.physical.fashion = e3.fashion), t.personalityTraits = o.personalityTraits || t.personalityTraits, t.kinks = o.kinks || t.kinks;
    } else t.bio = "Quick learner; keeps launches smooth. Friendly and playful in the office.", t.physical = ni(t.gender || "female", t.race || "human", t.ethnicity || null);
    if ("function" == typeof generateImage) {
      const e3 = `Professional portrait photo: ${t.physical.shortDescription}. ${t.physical.face.full}. ${t.physical.fashion} style outfit. Office setting, soft professional lighting, friendly expression, high quality`;
      try {
        const n2 = await queuedGenerateImage(applyImageStyle(e3), `Profile image for new hire ${t.name}`);
        n2 && (t.profileImage = n2, t.photos || (t.photos = []), t.photos.push({ url: n2, source: "profile", caption: "Initial profile picture", timestamp: Date.now() }));
      } catch (e4) {
        console.warn("[Hire] Profile image generation failed:", e4);
      }
    }
    t.onboarding = false, t.bioComplete = true, gameState.onboarding = gameState.onboarding.filter((e3) => e3.id !== t.id), t.hireDate || (t.hireDate = Date.now()), t.employmentStatus = "active", initializeEmployeeSocialData(t), gameState.employees.push(t), updateCompanyAwareness(), generateRandomRelationships(t.id), logCompanyEvent({ type: "hire", involvedEmployees: [t.id], location: t.locationId, description: `${t.name} joined as ${t.position}`, sentiment: "positive", importance: 6 }), generateFirstEmployeePost(t).catch((e3) => {
      console.error("First post generation failed:", e3);
    }), n.managerHired = true, n.managerId = t.id, n.managerLevel = 1, n.managerOnboarding = false;
    const i = gameState.corporatePyramid.positions[1]?.find((e3) => e3.productId === n.id);
    if (i) {
      i.employeeId = t.id, t.productManaged = n.name;
      const e3 = gameState.hierarchyLevels[i.level] || gameState.hierarchyLevels[1], premium = Math.max(0, (t.career.salary || 0) - getMarketRate(t, t.career.level));
      t.career.level = i.level, t.career.title = e3.title, t.career.salary = getMarketRate(t, i.level) + premium, console.log(`[Pyramid] Auto-assigned ${t.name} to ${i.title} - Career updated to ${t.career.title} (Level ${t.career.level})`);
    } else {
      Od();
      const e3 = gameState.corporatePyramid.positions[1]?.find((e4) => e4.productId === n.id);
      if (e3) {
        e3.employeeId = t.id, t.productManaged = n.name;
        const a3 = gameState.hierarchyLevels[e3.level] || gameState.hierarchyLevels[1], premium = Math.max(0, (t.career.salary || 0) - getMarketRate(t, t.career.level));
        t.career.level = e3.level, t.career.title = a3.title, t.career.salary = getMarketRate(t, e3.level) + premium, console.log(`[Pyramid] Created and assigned ${t.name} to ${e3.title} - Career updated to ${t.career.title} (Level ${t.career.level})`);
      }
    }
    if (updatePeopleTab(), updateProductsList(), showNotification(`${t.name} hired to manage ${n.name}!`), "dashboard" === gameState.activeTab && sd(), "function" == typeof Qn) try {
      Qn(t);
    } catch (e3) {
      console.warn("[Story] Employee hire hook error:", e3);
    }
  } catch (e2) {
    console.error("Onboarding error:", e2), showNotification("Onboarding hit a snag\u2014try again."), gameState.onboarding = gameState.onboarding.filter((e3) => e3.id !== t.id);
  }
}
