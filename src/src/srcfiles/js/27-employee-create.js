// ============================================================================
// 27-employee-create — Employee creation: family relations, URL/prompt/manual employee creation, rehire pool, hiring candidates.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

const FAMILY_RELATIONSHIP_TYPES = {
    mother: { label: "Mother", inverse: "child", ageAdjust: [20, 35], genderLock: "female", ageDirection: "older" },
    father: { label: "Father", inverse: "child", ageAdjust: [20, 40], genderLock: "male", ageDirection: "older" },
    sister: {
        label: "Sister",
        inverse: "sibling",
        ageAdjust: [-5, 5],
        genderLock: "female",
        ageDirection: "similar",
    },
    brother: {
        label: "Brother",
        inverse: "sibling",
        ageAdjust: [-5, 5],
        genderLock: "male",
        ageDirection: "similar",
    },
    daughter: {
        label: "Daughter",
        inverse: "parent",
        ageAdjust: [18, 25],
        genderLock: "female",
        ageDirection: "younger",
    },
    son: { label: "Son", inverse: "parent", ageAdjust: [18, 25], genderLock: "male", ageDirection: "younger" },
    aunt: { label: "Aunt", inverse: "nibling", ageAdjust: [5, 25], genderLock: "female", ageDirection: "older" },
    uncle: { label: "Uncle", inverse: "nibling", ageAdjust: [5, 25], genderLock: "male", ageDirection: "older" },
    cousin: { label: "Cousin", inverse: "cousin", ageAdjust: [-10, 10], genderLock: null, ageDirection: "similar" },
    spouse: { label: "Spouse", inverse: "spouse", ageAdjust: [-10, 10], genderLock: null, ageDirection: "similar" },
    exSpouse: {
        label: "Ex-Spouse",
        inverse: "exSpouse",
        ageAdjust: [-10, 10],
        genderLock: null,
        ageDirection: "similar",
    },
    stepmother: {
        label: "Stepmother",
        inverse: "stepchild",
        ageAdjust: [10, 30],
        genderLock: "female",
        ageDirection: "older",
    },
    stepfather: {
        label: "Stepfather",
        inverse: "stepchild",
        ageAdjust: [10, 30],
        genderLock: "male",
        ageDirection: "older",
    },
    stepsister: {
        label: "Stepsister",
        inverse: "stepsibling",
        ageAdjust: [-5, 5],
        genderLock: "female",
        ageDirection: "similar",
    },
    stepbrother: {
        label: "Stepbrother",
        inverse: "stepsibling",
        ageAdjust: [-5, 5],
        genderLock: "male",
        ageDirection: "similar",
    },
};
function getEmployeeFamilyMembers(e) {
    const t = gameState.employees.find((t) => t.id === e);
    if (!t || !t.familyRelations) return [];
    const n = [];
    for (const [e, a] of Object.entries(t.familyRelations)) {
        const t = gameState.employees.find((t) => t.id === e);
        if (t) {
            const e = FAMILY_RELATIONSHIP_TYPES[a];
            n.push({ employee: t, relationship: a, label: e?.label || a });
        }
    }
    return n;
}
function createFamilyRelationship(e, t, n) {
    const a = gameState.employees.find((t) => t.id === e),
        o = gameState.employees.find((e) => e.id === t);
    if (!a || !o) return !1;
    a.familyRelations || (a.familyRelations = {}),
        o.familyRelations || (o.familyRelations = {}),
        (a.familyRelations[t] = n);
    const i = FAMILY_RELATIONSHIP_TYPES[n];
    if (i) {
        let t = i.inverse;
        "child" === t
            ? (t = "male" === a.gender ? "father" : "mother")
            : "parent" === t
              ? (t = "male" === o.gender ? "son" : "daughter")
              : "sibling" === t
                ? (t = "male" === a.gender ? "brother" : "sister")
                : "stepchild" === t
                  ? (t = "male" === a.gender ? "stepfather" : "stepmother")
                  : "stepsibling" === t
                    ? (t = "male" === a.gender ? "stepbrother" : "stepsister")
                    : "nibling" === t && (t = "male" === a.gender ? "uncle" : "aunt"),
            (o.familyRelations[e] = t);
    }
    return !0;
}
function generateFamilyMemberData(e, t) {
    const n = FAMILY_RELATIONSHIP_TYPES[t];
    if (!n) return console.error("Unknown relationship type:", t), null;
    let existingPartner = null;
    if ("spouse" === t && e.personalLife?.significantOther?.name)
        existingPartner = e.personalLife.significantOther;
    else if ("exSpouse" === t) {
        const h = e.personalLife?.outsideContacts?.relationshipHistory || [],
            x = [...h].reverse().find((e) => e.partnerName);
        x && (existingPartner = { name: x.partnerName, relationshipType: x.status, endReason: x.endReason });
    }
    let a;
    if (existingPartner?.gender) a = existingPartner.gender;
    else if (n.genderLock) a = n.genderLock;
    else {
        const e = ["male", "female"];
        a = e[Math.floor(Math.random() * e.length)];
    }
    const o = e.age || 28;
    let i;
    if ("older" === n.ageDirection) {
        i = o + (n.ageAdjust[0] + Math.floor(Math.random() * (n.ageAdjust[1] - n.ageAdjust[0])));
    } else if ("younger" === n.ageDirection)
        i = Math.max(
            18,
            Math.min(34, n.ageAdjust[0] + Math.floor(Math.random() * (n.ageAdjust[1] - n.ageAdjust[0])))
        );
    else {
        const e = n.ageAdjust[0] + Math.floor(Math.random() * (n.ageAdjust[1] - n.ageAdjust[0] + 1));
        i = Math.max(18, o + e);
    }
    const s = e.ethnicity || e.physical?.ethnicity || null,
        r = e.race || "human";
    let m;
    if (existingPartner?.name) m = existingPartner.name;
    else {
        const l = generateUniqueName(a, s, r),
            c = e.name.split(" ");
        let d = c.length > 1 ? c[c.length - 1] : "";
        if (["spouse", "exSpouse", "mother", "aunt", "stepmother"].includes(t) && Math.random() < 0.5) {
            const e = l.split(" ");
            d = e.length > 1 ? e[e.length - 1] : d;
        }
        const p = l.split(" ")[0];
        m = d ? `${p} ${d}` : p;
    }
    let u = {};
    !["spouse", "exSpouse", "stepmother", "stepfather", "stepsister", "stepbrother"].includes(t) &&
        e.physical &&
        (Math.random() < 0.7 && e.physical.eyes?.color && (u.eyeColor = e.physical.eyes.color),
        Math.random() < 0.5 && e.physical.hair?.color && (u.hairColor = e.physical.hair.color),
        Math.random() < 0.8 && e.physical.skin?.tone && (u.skinTone = e.physical.skin.tone));
    const g = (e, t, n) => {
            const a = Math.max(t, Math.min(n, Math.floor(Math.random() * (n - t + 1)) + t)),
                o = new Set();
            for (; o.size < a; ) o.add(e[Math.floor(Math.random() * e.length)]);
            return [...o];
        },
        h = [
            "Charismatic",
            "Analytical",
            "Creative",
            "Detail-oriented",
            "Adaptable",
            "Empathetic",
            "Organized",
            "Bold",
            "Reliable",
            "Innovative",
            "Strategic",
            "Patient",
            "Decisive",
            "Collaborative",
            "Resilient",
            "Visionary",
            "Persuasive",
            "Curious",
            "Ambitious",
            "Supportive",
            "Meticulous",
            "Proactive",
            "Diligent",
            "Resourceful",
            "Versatile",
        ];
    return {
        id: `emp_${Date.now()}_fam_${Math.floor(1e3 * Math.random())}`,
        name: m,
        age: i,
        gender: a,
        race: r,
        ethnicity: s,
        position: "Staff Candidate",
        pendingFamilyRelation: { relatedTo: e.id, relationship: t },
        existingPartnerInfo: existingPartner,
        personalityTraits: g(
            [
                "Playful",
                "Reserved",
                "Confident",
                "Witty",
                "Thoughtful",
                "Cheeky",
                "Dry-humored",
                "Warm",
                "Ambitious",
                "Chill",
                "Inquisitive",
                "Loyal",
                "Optimistic",
                "Pessimistic",
                "Sarcastic",
                "Sincere",
                "Spontaneous",
                "Stoic",
                "Supportive",
                "Adventurous",
                "Cautious",
                "Curious",
                "Diligent",
                "Easygoing",
                "Energetic",
                "Focused",
                "Generous",
                "Humble",
                "Imaginative",
                "Meticulous",
                "Pragmatic",
                "Resourceful",
                "Sociable",
                "Tactful",
                "Versatile",
            ],
            3,
            5
        ),
        keyTrait: h[Math.floor(Math.random() * h.length)],
        hobbies: g(
            [
                "Reading",
                "Photography",
                "Hiking",
                "Gaming",
                "Cooking",
                "Traveling",
                "Music",
                "Art",
                "Yoga",
                "Dancing",
                "Climbing",
                "Baking",
                "Thrifting",
                "Gardening",
                "Writing",
                "Cycling",
                "Swimming",
                "Crafting",
                "Meditation",
                "Volunteering",
                "Fishing",
                "Running",
                "Collecting",
                "Knitting",
                "Puzzles",
                "Board games",
                "Movies",
                "Theater",
                "Fitness",
            ],
            1,
            2
        ),
        kinks: g(
            [
                "Roleplay",
                "Bondage",
                "Exhibitionism",
                "Voyeurism",
                "Dom/sub",
                "Praise",
                "Teasing",
                "Spanking",
                "Dirty talk",
                "Public play",
                "Costumes",
                "Sensory play",
                "Blindfolds",
                "Massage",
                "Hair pulling",
                "Fantasies",
                "Power exchange",
            ],
            2,
            4
        ),
        personality: {
            confidence: 30 + Math.floor(50 * Math.random()),
            outgoing: 20 + Math.floor(60 * Math.random()),
            flirty: 10 + Math.floor(70 * Math.random()),
            professional: 30 + Math.floor(50 * Math.random()),
            humor: 20 + Math.floor(60 * Math.random()),
        },
        stats: {
            affection: generateEmployeeStat("affection"),
            comfort: generateEmployeeStat("comfort"),
            trust: generateEmployeeStat("trust"),
            desire: generateEmployeeStat("desire"),
            friendship: generateEmployeeStat("friendship"),
            productivity: generateEmployeeStat("productivity"),
        },
        giftPreferences: generateGiftPreferences(),
        hired: !1,
        onboarding: !0,
        bioComplete: !1,
        productManaged: null,
        physical: null,
        inheritedFeatures: u,
        profileImage: null,
        bio: null,
        hireDate: gameNow(),
        career: {
            level: 1,
            title: "Staff",
            salary: 1e5,
            startDate: Date.now(),
            promotionHistory: [],
            directReports: [],
            managerId: null,
        },
        isRehire: !1,
        fastTrack: !1,
        previousLevel: null,
        previousTitle: null,
        timesRehired: 0,
        isFamilyMember: !0,
        familySourceId: e.id,
        familyRelationType: t,
    };
}
function getFamilyContextForAI(e) {
    const t = getEmployeeFamilyMembers(e);
    if (0 === t.length) return "";
    const n = t.filter((e) => "active" === e.employee.employmentStatus || e.employee.hired);
    if (0 === n.length) return "";
    return `Has family at the company: ${n.map((e) => `${e.employee.name} (${e.label.toLowerCase()})`).join(", ")}. (Note: This is background info - don't constantly bring up unless relevant to conversation)`;
}
let pendingCustomEmployeeData = null,
    pendingCustomEmployeeProductId = null,
    pendingCustomEmployeeSource = null,
    pendingImportedSkeleton = null;
function updateRecoverCharacterButton(e) {
    const t = e?.querySelector("#recoverCharacterSection"),
        n = e?.querySelector("#recoverCharacterInfo");
    if (t)
        if (pendingCustomEmployeeData && pendingCustomEmployeeData.name) {
            if (((t.style.display = "block"), n)) {
                const e = pendingCustomEmployeeData.name || "Unknown",
                    t = pendingCustomEmployeeSource || "Unknown";
                n.textContent = `"${e}" (from ${t})`;
            }
        } else t.style.display = "none";
}
function togglePartnerFields() {
    const e = document.getElementById("confirmRelationshipStatus"),
        t = document.getElementById("partnerDetailsSection");
    if (e && t) {
        const n = e.value;
        t.style.display = n && "single" !== n ? "block" : "none";
    }
}
function showCharacterConfirmationModal(e, t, n = "URL") {
    (pendingCustomEmployeeData = JSON.parse(JSON.stringify(e))),
        (pendingCustomEmployeeProductId = t),
        (pendingCustomEmployeeSource = n);
    const a = document.createElement("div");
    (a.id = "characterConfirmModal"),
        (a.style.cssText =
            "\n      position: fixed; top: 0; left: 0; right: 0; bottom: 0;\n      background: var(--l-veil-85); z-index: 10001;\n      display: flex; align-items: center; justify-content: center;\n      padding: 20px; box-sizing: border-box;\n    ");
    const o = e.gender || "female",
        i = e.race || "human",
        s = e.ethnicity || null,
        r = generateDetailedPhysicalAppearance(o, i, s),
        l = {
            ...e,
            name: e.name || generateUniqueName(o, s, i),
            age: e.age || 22 + Math.floor(12 * Math.random()),
            gender: o,
            race: i,
            // The look below was rolled from an ethnicity even when none was given; show that
            // one rather than "Auto-generate", which would roll a different one at hire.
            ethnicity: s || ("human" === canonicalRace(i) ? r.ethnicity || null : null),
            bio:
                e.bio ||
                `A dedicated ${"human" === i ? "professional" : i} who brings unique skills to the workplace.`,
            personalityTraits:
                e.personalityTraits?.length > 0 ? e.personalityTraits : ["Professional", "Dedicated", "Friendly"],
            keyTrait: e.keyTrait || "Dedicated",
            hobbies: e.hobbies?.length > 0 ? e.hobbies : ["Reading", "Fitness"],
            kinks: e.kinks?.length > 0 ? e.kinks : ["Roleplay", "Teasing"],
            personality: {
                confidence: e.personality?.confidence ?? 50,
                outgoing: e.personality?.outgoing ?? 50,
                flirty: e.personality?.flirty ?? 50,
                professional: e.personality?.professional ?? 50,
                humor: e.personality?.humor ?? 50,
            },
            physical: {
                hairColor: e.physical?.hairColor || e.physical?.hair?.color || r.hair?.color || "brown",
                hairStyle: e.physical?.hairStyle || e.physical?.hair?.style || r.hair?.style || "wavy",
                hairLength: e.physical?.hairLength || e.physical?.hair?.length || r.hair?.length || "medium",
                hairTexture: e.physical?.hairTexture || e.physical?.hair?.texture || r.hair?.texture || "smooth",
                eyeColor: e.physical?.eyeColor || e.physical?.eyes?.color || r.eyes?.color || "brown",
                eyeShape: e.physical?.eyeShape || e.physical?.eyes?.shape || r.eyes?.shape || "almond-shaped",
                skinTone: e.physical?.skinTone || r.skin?.tone || "fair",
                bodyShape: e.physical?.bodyShape || r.body?.shape || "average",
                heightBuild: e.physical?.heightBuild || r.heightBuild || "average height",
                breastSize: e.physical?.breastSize || r.body?.chestSize || "average",
                buttSize: e.physical?.buttSize || r.body?.buttSize || "average",
                fashion: e.physical?.fashion || r.fashion || "business casual",
                accessories: e.physical?.accessories || r.accessories || "minimal jewelry",
                notableFeatures: e.physical?.notableFeatures || r.notableFeatures || "warm smile",
                genitalType: e.physical?.genitalType || r.genitals?.[0]?.type || null,
                genitalSize: e.physical?.genitalSize || r.genitals?.[0]?.size || null,
                genitalCharacteristics: e.physical?.genitalCharacteristics || r.genitals?.[0]?.characteristics || null,
                bio: e.physical?.bio || r.bio || getDefaultBio(canonicalRace(i)),
            },
            generatedProfileImage: e.generatedProfileImage || null,
            pendingFamilyLink: e.pendingFamilyLink || null,
            nicknameForPlayer: e.nicknameForPlayer || null,
            pets: e.pets || [],
        };
    (pendingCustomEmployeeData = JSON.parse(JSON.stringify(l))),
        (a.innerHTML = `\n      <div style="background:linear-gradient(135deg, var(--l-panel) 0%, var(--l-panel-2) 100%); border-radius:16px; max-width:600px; width:100%; max-height:90vh; overflow-y:auto; border:2px solid var(--positive); box-shadow:0 20px 60px var(--l-veil-50);">\n        <div style="padding:20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">\n          <h2 style="margin:0; color:var(--positive);">✨ Character Generated!</h2>\n          <button id="closeConfirmModal" style="background:none; border:none; color:var(--text-mute); font-size:24px; cursor:pointer;">&times;</button>\n        </div>\n        \n        <div style="padding:20px;">\n          <p style="color:var(--text-dim); margin-bottom:15px;">Review and edit the generated character before hiring:</p>\n          \n          \x3c!-- Basic Info --\x3e\n          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">\n            <div>\n              <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">Name</label>\n              <input type="text" id="confirmName" value="${l.name || ""}" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); box-sizing:border-box;">\n            </div>\n            <div>\n              <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">Age (18+)</label>\n              <input type="number" id="confirmAge" value="${Math.max(18, l.age || 25)}" min="18" max="99" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); box-sizing:border-box;">\n            </div>\n          </div>\n          \n          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">\n            <div>\n              <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">Gender</label>\n              <select id="confirmGender" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink);">\n                <option value="female" ${"female" === l.gender ? "selected" : ""}>Female</option>\n                <option value="male" ${"male" === l.gender ? "selected" : ""}>Male</option>\n                <option value="female_futa" ${"female_futa" === l.gender ? "selected" : ""}>Futa</option>\n                <option value="trans_woman" ${"trans_woman" === l.gender ? "selected" : ""}>Trans Woman</option>\n                <option value="trans_man" ${"trans_man" === l.gender ? "selected" : ""}>Trans Man</option>\n              </select>\n            </div>\n            <div>\n              <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">Race/Species</label>\n              <select id="confirmRace" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); box-sizing:border-box; cursor:pointer; appearance:menulist;">\n                ${buildRaceOptionsHTML(canonicalRace(l.race || "human"))}\n              </select>\n            </div>\n          </div>\n          \n          \x3c!-- Ethnicity (only for humans) --\x3e\n          <div id="ethnicitySection" style="margin-bottom:15px; ${l.race && "human" !== l.race ? "display:none;" : ""}">\n            <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">Ethnicity (for humans)</label>\n            <select id="confirmEthnicity" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink);">\n              <option value="" ${l.ethnicity ? "" : "selected"}>-- Auto-generate --</option>\n              <optgroup label="Europe & Americas">\n                <option value="caucasian" ${"caucasian" === l.ethnicity ? "selected" : ""}>Caucasian/European</option>\n                <option value="latino" ${"latino" === l.ethnicity ? "selected" : ""}>Latino/Hispanic</option>\n                <option value="nativeAmerican" ${"nativeAmerican" === l.ethnicity ? "selected" : ""}>Native American/Indigenous</option>\n              </optgroup>\n              <optgroup label="Africa">\n                <option value="black" ${"black" === l.ethnicity ? "selected" : ""}>Black/African</option>\n              </optgroup>\n              <optgroup label="East Asia">\n                <option value="eastAsian" ${"eastAsian" === l.ethnicity ? "selected" : ""}>East Asian (General)</option>\n                <option value="eastAsian-japanese" ${"eastAsian-japanese" === l.ethnicity ? "selected" : ""}>East Asian - Japanese</option>\n                <option value="eastAsian-chinese" ${"eastAsian-chinese" === l.ethnicity ? "selected" : ""}>East Asian - Chinese</option>\n                <option value="eastAsian-korean" ${"eastAsian-korean" === l.ethnicity ? "selected" : ""}>East Asian - Korean</option>\n              </optgroup>\n              <optgroup label="Southeast Asia">\n                <option value="southeastAsian" ${"southeastAsian" === l.ethnicity ? "selected" : ""}>Southeast Asian (General)</option>\n                <option value="southeastAsian-thai" ${"southeastAsian-thai" === l.ethnicity ? "selected" : ""}>Southeast Asian - Thai</option>\n                <option value="southeastAsian-vietnamese" ${"southeastAsian-vietnamese" === l.ethnicity ? "selected" : ""}>Southeast Asian - Vietnamese</option>\n                <option value="southeastAsian-filipino" ${"southeastAsian-filipino" === l.ethnicity ? "selected" : ""}>Southeast Asian - Filipino</option>\n                <option value="southeastAsian-indonesian" ${"southeastAsian-indonesian" === l.ethnicity ? "selected" : ""}>Southeast Asian - Indonesian</option>\n              </optgroup>\n              <optgroup label="South & Central Asia">\n                <option value="southAsian" ${"southAsian" === l.ethnicity ? "selected" : ""}>South Asian (Indian, Pakistani, etc.)</option>\n                <option value="centralAsian" ${"centralAsian" === l.ethnicity ? "selected" : ""}>Central Asian (Kazakh, Mongolian, etc.)</option>\n              </optgroup>\n              <optgroup label="Middle East">\n                <option value="middleEastern" ${"middleEastern" === l.ethnicity ? "selected" : ""}>Middle Eastern/North African</option>\n              </optgroup>\n              <optgroup label="Oceania">\n                <option value="pacificIslander" ${"pacificIslander" === l.ethnicity ? "selected" : ""}>Pacific Islander (General)</option>\n                <option value="pacificIslander-hawaiian" ${"pacificIslander-hawaiian" === l.ethnicity ? "selected" : ""}>Pacific Islander - Hawaiian</option>\n                <option value="pacificIslander-samoan" ${"pacificIslander-samoan" === l.ethnicity ? "selected" : ""}>Pacific Islander - Samoan</option>\n                <option value="pacificIslander-maori" ${"pacificIslander-maori" === l.ethnicity ? "selected" : ""}>Pacific Islander - Māori</option>\n                <option value="indigenous" ${"indigenous" === l.ethnicity ? "selected" : ""}>Indigenous Australian/Aboriginal</option>\n              </optgroup>\n              <optgroup label="Mixed">\n                <option value="mixed" ${"mixed" === l.ethnicity ? "selected" : ""}>Mixed Ethnicity</option>\n              </optgroup>\n            </select>\n          </div>\n          \n          \x3c!-- Sexual Orientation --\x3e\n          <div style="margin-bottom:15px;">\n            <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">💕 Sexual Orientation</label>\n            <select id="confirmSexualOrientation" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink);">\n              <option value="" ${l.sexualOrientation || l.personalLife?.sexualOrientation ? "" : "selected"}>-- Auto-generate --</option>\n              <option value="straight" ${"straight" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Straight/Heterosexual</option>\n              <option value="bisexual" ${"bisexual" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Bisexual</option>\n              <option value="gay" ${"gay" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Gay</option>\n              <option value="lesbian" ${"lesbian" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Lesbian</option>\n              <option value="pansexual" ${"pansexual" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Pansexual</option>\n              <option value="asexual" ${"asexual" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Asexual</option>\n              <option value="demisexual" ${"demisexual" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Demisexual</option>\n              <option value="queer" ${"queer" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Queer</option>\n            </select>\n            <p style="margin:4px 0 0 0; font-size:0.7rem; color:var(--text-mute);">Defines romantic/sexual attraction. Strongly influences relationship dynamics.</p>\n          </div>\n          \n          \x3c!-- Relationship Status --\x3e\n          <div style="margin-bottom:15px;">\n            <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">💍 Relationship Status</label>\n            <select id="confirmRelationshipStatus" onchange="togglePartnerFields()" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink);">\n              <option value="" ${l.relationshipStatus || l.personalLife?.outsideContacts?.relationshipStatus ? "" : "selected"}>-- Auto-generate --</option>\n              <option value="single" ${"single" === (l.relationshipStatus || l.personalLife?.outsideContacts?.relationshipStatus) ? "selected" : ""}>Single</option>\n              <option value="dating" ${"dating" === (l.relationshipStatus || l.personalLife?.outsideContacts?.relationshipStatus) ? "selected" : ""}>Dating Someone</option>\n              <option value="serious" ${"serious" === (l.relationshipStatus || l.personalLife?.outsideContacts?.relationshipStatus) ? "selected" : ""}>Serious Relationship</option>\n              <option value="engaged" ${"engaged" === (l.relationshipStatus || l.personalLife?.outsideContacts?.relationshipStatus) ? "selected" : ""}>Engaged</option>\n              <option value="married" ${"married" === (l.relationshipStatus || l.personalLife?.outsideContacts?.relationshipStatus) ? "selected" : ""}>Married</option>\n            </select>\n            <p style="margin:4px 0 0 0; font-size:0.7rem; color:var(--text-mute);">Whether this character has a significant other outside of work.</p>\n          </div>\n          \n          \x3c!-- Partner Details (shown when not single) --\x3e\n          <div id="partnerDetailsSection" style="margin-bottom:15px; padding:10px; background:rgba(255,215,0,0.1); border-radius:6px; border:1px solid rgba(255,215,0,0.3); display:${(l.relationshipStatus && "single" !== l.relationshipStatus) || l.personalLife?.significantOther ? "block" : "none"};">\n            <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:8px;">👤 Partner Details <span style="color:var(--text-mute); font-weight:normal;">(leave blank to auto-generate)</span></label>\n            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">\n              <input type="text" id="confirmPartnerName" placeholder="Partner's Name" value="${l.partnerName || l.personalLife?.significantOther?.name || ""}" style="padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink);">\n              <select id="confirmPartnerGender" style="padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink);">\n                <option value="">-- Auto --</option>\n                <option value="male" ${"male" === (l.partnerGender || l.personalLife?.significantOther?.gender) ? "selected" : ""}>Male</option>\n                <option value="female" ${"female" === (l.partnerGender || l.personalLife?.significantOther?.gender) ? "selected" : ""}>Female</option>\n              </select>\n            </div>\n            <input type="text" id="confirmPartnerOccupation" placeholder="Partner's Occupation (e.g. Teacher, Accountant)" value="${l.partnerOccupation || l.personalLife?.significantOther?.occupation || ""}" style="width:100%; margin-top:8px; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); box-sizing:border-box;">\n          </div>\n          \n          \x3c!-- Bio --\x3e\n          <div style="margin-bottom:15px;">\n            <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">Bio</label>\n            <textarea id="confirmBio" rows="3" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); resize:vertical; box-sizing:border-box;">${l.bio || ""}</textarea>\n          </div>\n          \n          \x3c!-- Personality Traits --\x3e\n          <div style="margin-bottom:15px;">\n            <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">Personality Traits (comma-separated)</label>\n            <input type="text" id="confirmTraits" value="${(l.personalityTraits || []).join(", ")}" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); box-sizing:border-box;">\n          </div>\n          \n          \x3c!-- Key Trait --\x3e\n          <div style="margin-bottom:15px;">\n            <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">Key Trait (defines core behavior)</label>\n            <input type="text" id="confirmKeyTrait" list="keyTraitSuggestions" value="${l.keyTrait || ""}" placeholder="e.g. Confident, Flirty, Analytical, Submissive" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); box-sizing:border-box;">\n            <datalist id="keyTraitSuggestions">\n              <option value="Charismatic">\n              <option value="Analytical">\n              <option value="Creative">\n              <option value="Detail-oriented">\n              <option value="Empathetic">\n              <option value="Bold">\n              <option value="Submissive">\n              <option value="Dominant">\n              <option value="Flirty">\n              <option value="Shy">\n              <option value="Confident">\n              <option value="Caring">\n              <option value="Playful">\n              <option value="Serious">\n              <option value="Adventurous">\n              <option value="Loyal">\n              <option value="Witty">\n            </datalist>\n          </div>\n          \n          \x3c!-- Hobbies & Kinks --\x3e\n          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">\n            <div>\n              <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">Hobbies</label>\n              <input type="text" id="confirmHobbies" value="${(l.hobbies || []).join(", ")}" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); box-sizing:border-box;">\n            </div>\n            <div>\n              <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">Kinks</label>\n              <input type="text" id="confirmKinks" value="${(l.kinks || []).join(", ")}" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); box-sizing:border-box;">\n            </div>\n          </div>\n          \n          \x3c!-- Nickname for Player --\x3e\n          <div style="margin-bottom:15px;">\n            <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">💬 What they call you (Nickname for Player)</label>\n            <input type="text" id="confirmNicknameForPlayer" value="${l.nicknameForPlayer || ""}" placeholder="Leave blank for default 'Boss', or enter a custom name like 'Sir', 'Daddy', etc." style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); box-sizing:border-box;">\n            <p style="margin:4px 0 0 0; font-size:0.7rem; color:var(--text-mute);">This character will always use this name for you instead of "Boss"</p>\n          </div>\n          \n          \x3c!-- Pets --\x3e\n          <div style="margin-bottom:15px;">\n            <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">🐾 Pets (Name:Type, separated by semicolons)</label>\n            <input type="text" id="confirmPets" value="${(l.pets || []).map((e) => e.name + ":" + e.type).join("; ")}" placeholder="e.g. Whiskers:cat; Max:dog; Bubbles:fish" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); box-sizing:border-box;">\n            <p style="margin:4px 0 0 0; font-size:0.7rem; color:var(--text-mute);">Format: PetName:PetType; separate multiple pets with semicolons</p>\n          </div>\n          \n          \x3c!-- Physical Appearance --\x3e\n          <details style="background:var(--surface-2); border-radius:8px; margin-bottom:15px;">\n            <summary style="padding:10px 15px; cursor:pointer; color:var(--l-pink); font-weight:600;">👁️ Physical Appearance</summary>\n            <div style="padding:0 15px 15px 15px;">\n              <div id="confirmBiologyHost" style="margin-bottom:14px;"></div>\n              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Hair Color</label>\n                  <input type="text" id="confirmHairColor" value="${l.physical?.hairColor || l.physical?.hair?.color || ""}" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Hair Style</label>\n                  <input type="text" id="confirmHairStyle" value="${l.physical?.hairStyle || l.physical?.hair?.style || ""}" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Hair Length</label>\n                  <input type="text" id="confirmHairLength" value="${l.physical?.hairLength || l.physical?.hair?.length || ""}" placeholder="e.g. pixie cut, shoulder-length, waist-length" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Hair Texture</label>\n                  <input type="text" id="confirmHairTexture" value="${l.physical?.hairTexture || l.physical?.hair?.texture || ""}" placeholder="e.g. silky, thick, curly, wavy" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Eye Color</label>\n                  <input type="text" id="confirmEyeColor" value="${l.physical?.eyeColor || l.physical?.eyes?.color || ""}" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Eye Shape</label>\n                  <input type="text" id="confirmEyeShape" value="${l.physical?.eyeShape || l.physical?.eyes?.shape || ""}" placeholder="e.g. almond, round, hooded, monolid" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Skin Tone</label>\n                  <input type="text" id="confirmSkinTone" value="${l.physical?.skinTone || ""}" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Body Shape</label>\n                  <input type="text" id="confirmBodyShape" value="${l.physical?.bodyShape || ""}" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Height/Build</label>\n                  <input type="text" id="confirmHeightBuild" value="${l.physical?.heightBuild || ""}" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Bust/Chest Size</label>\n                  <input type="text" id="confirmBreastSize" value="${l.physical?.breastSize || l.physical?.chestSize || ""}" placeholder="e.g. full, modest, muscular" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Butt Size</label>\n                  <input type="text" id="confirmButtSize" value="${l.physical?.buttSize || ""}" placeholder="e.g. round, full, athletic" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Fashion Style</label>\n                  <input type="text" id="confirmFashion" value="${l.physical?.fashion || ""}" placeholder="e.g. business professional, casual" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n                <div>\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Accessories</label>\n                  <input type="text" id="confirmAccessories" value="${l.physical?.accessories || ""}" placeholder="e.g. glasses, earrings, none" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n                <div style="grid-column: span 2;">\n                  <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Notable Features</label>\n                  <input type="text" id="confirmNotableFeatures" value="${l.physical?.notableFeatures || ""}" placeholder="e.g. dimples, freckles, beauty mark, tattoo" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                </div>\n              </div>\n              \n              \x3c!-- Intimate Details (sub-collapsed) --\x3e\n              <details style="background:var(--l-panel); border-radius:6px; margin-top:10px;">\n                <summary style="padding:8px 12px; cursor:pointer; color:var(--l-pink); font-size:0.85rem;">🔞 Intimate Details</summary>\n                <div style="padding:8px 12px 12px 12px;">\n                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">\n                    <div>\n                      <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Genital Type</label>\n                      <select id="confirmGenitalType" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem;">\n                        <option value="" ${l.physical?.genitalType ? "" : "selected"}>-- Auto-generate --</option>\n                        <option value="vagina" ${"vagina" === l.physical?.genitalType ? "selected" : ""}>Vagina</option>\n                        <option value="penis" ${"penis" === l.physical?.genitalType ? "selected" : ""}>Penis</option>\n                        <option value="penis and vagina" ${"penis and vagina" === l.physical?.genitalType ? "selected" : ""}>Penis and Vagina (Futa)</option>\n                        <option value="vagina (post-op)" ${"vagina (post-op)" === l.physical?.genitalType ? "selected" : ""}>Vagina (Post-op)</option>\n                        <option value="penis (pre-op)" ${"penis (pre-op)" === l.physical?.genitalType ? "selected" : ""}>Penis (Pre-op)</option>\n                      </select>\n                    </div>\n                    <div>\n                      <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Genital Size</label>\n                      <input type="text" id="confirmGenitalSize" value="${l.physical?.genitalSize || ""}" placeholder="e.g. average, large, tight" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                    </div>\n                    <div style="grid-column: span 2;">\n                      <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Grooming/Characteristics</label>\n                      <input type="text" id="confirmGenitalCharacteristics" value="${l.physical?.genitalCharacteristics || ""}" placeholder="e.g. well-groomed, natural, trimmed" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-size:0.85rem; box-sizing:border-box;">\n                    </div>\n                  </div>\n                </div>\n              </details>\n            </div>\n          </details>\n          \n          \x3c!-- Personality Axes + Voice (Pass 3) --\x3e\n          <details style="background:var(--surface-2); border-radius:8px; margin-bottom:15px;">\n            <summary style="padding:10px 15px; cursor:pointer; color:var(--l-pink); font-weight:600;">💫 Personality & Voice</summary>\n            <div style="padding:0 15px 15px 15px;">\n              <div id="confirmAxesHost"></div>\n              <div style="margin-bottom:8px;">\n                <label style="display:block; color:var(--text-dim); font-size:0.75rem; margin-bottom:2px;">Humor (serious ↔ humorous): <span id="confirmHumorVal" style="color:var(--accent-gold); font-weight:600;">${l.personality?.humor || 50}</span></label>\n                <input type="range" id="confirmHumor" min="0" max="100" value="${l.personality?.humor || 50}" style="width:100%; accent-color:var(--positive);">\n              </div>\n              <div style="margin-top:10px;">\n                <label style="display:block; color:var(--accent-gold); font-size:0.8rem; margin-bottom:4px;">🗣️ Voice Override <span style="color:var(--text-mute); font-weight:normal;">(how they speak — dialect/vocabulary; optional)</span></label>\n                <textarea id="confirmVoiceOverride" rows="2" placeholder="e.g. speaks in clipped military jargon; warm Southern drawl" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); resize:vertical; box-sizing:border-box; font-size:0.85rem;">${l.voice?.override || ""}</textarea>\n              </div>\n            </div>\n          </details>\n          \n          \x3c!-- Profile Image Generation --\x3e\n          <div style="background:var(--surface-2); border-radius:8px; margin-bottom:15px; padding:15px;">\n            <div style="display:flex; align-items:center; gap:15px;">\n              <div id="profileImagePreview" style="width:100px; height:100px; border-radius:50%; background:var(--l-panel); border:3px solid var(--positive); display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0;">\n                ${l.generatedProfileImage ? `<img src="${l.generatedProfileImage}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" alt="Generated profile">` : '<span style="color:var(--l-on-accent); font-size:2rem;">👤</span>'}\n              </div>\n              <div style="flex:1;">\n                <label style="display:block; color:var(--l-violet); font-weight:600; margin-bottom:8px;">📸 Profile Image</label>\n                <button id="generateProfileImageBtn" style="width:100%; padding:10px; background:linear-gradient(135deg, var(--l-violet) 0%, var(--l-violet-deep-2) 100%); border:none; border-radius:6px; color:var(--l-on-accent); cursor:pointer; font-weight:600;">\n                  🎨 ${l.generatedProfileImage ? "Regenerate" : "Generate"} Profile Image\n                </button>\n                <p style="color:var(--text-mute); font-size:0.75rem; margin:6px 0 0 0;">Uses character details to create a matching portrait</p>\n              </div>\n            </div>\n            <input type="hidden" id="generatedProfileImageUrl" value="${l.generatedProfileImage || ""}">\n          </div>\n          \n          \x3c!-- Action Buttons --\x3e\n          <div style="display:flex; gap:10px; margin-top:20px;">\n            <button id="confirmHireBtn" style="flex:1; padding:12px; background:linear-gradient(135deg, var(--l-green) 0%, var(--l-cyan) 100%); border:none; border-radius:8px; color:var(--l-on-accent); font-weight:bold; cursor:pointer; font-size:1rem;">\n              ✅ Hire This Character\n            </button>\n            <button id="cancelConfirmBtn" style="flex:0 0 auto; padding:12px 20px; background:var(--l-neutral-3); border:1px solid var(--border-strong); border-radius:8px; color:var(--text-dim); cursor:pointer;">\n              Cancel\n            </button>\n          </div>\n        </div>\n      </div>\n    `),
        document.body.appendChild(a),
        ["Humor"].forEach((e) => {
            const t = a.querySelector(`#confirm${e}`),
                n = a.querySelector(`#confirm${e}Val`);
            t &&
                n &&
                t.addEventListener("input", () => {
                    n.textContent = t.value;
                });
        });
    const confirmAxesState =
        l.personality && l.personality.axes && "object" == typeof l.personality.axes
            ? JSON.parse(JSON.stringify(l.personality.axes))
            : "function" == typeof derivePersonalityAxes
              ? derivePersonalityAxes(l)
              : {};
    renderPersonalityAxes(a.querySelector("#confirmAxesHost"), confirmAxesState);
    const confirmBioState =
        l.physical && l.physical.bio && "object" == typeof l.physical.bio
            ? JSON.parse(JSON.stringify(l.physical.bio))
            : getDefaultBio(canonicalRace(l.race || "human"));
    const confirmBioHost = a.querySelector("#confirmBiologyHost");
    renderBiologyFields(confirmBioHost, l.race || "human", confirmBioState);
    // The form's appearance fields, read the same way for the preview portrait and the hire.
    const readConfirmPhysical = () => ({
        bio: confirmBioState,
        hairColor:
            a.querySelector("#confirmHairColor")?.value?.trim() ||
            l.physical?.hairColor ||
            l.physical?.hair?.color,
        hairStyle:
            a.querySelector("#confirmHairStyle")?.value?.trim() ||
            l.physical?.hairStyle ||
            l.physical?.hair?.style,
        hairLength:
            a.querySelector("#confirmHairLength")?.value?.trim() ||
            l.physical?.hairLength ||
            l.physical?.hair?.length,
        hairTexture:
            a.querySelector("#confirmHairTexture")?.value?.trim() ||
            l.physical?.hairTexture ||
            l.physical?.hair?.texture,
        eyeColor:
            a.querySelector("#confirmEyeColor")?.value?.trim() ||
            l.physical?.eyeColor ||
            l.physical?.eyes?.color,
        eyeShape:
            a.querySelector("#confirmEyeShape")?.value?.trim() ||
            l.physical?.eyeShape ||
            l.physical?.eyes?.shape,
        skinTone: a.querySelector("#confirmSkinTone")?.value?.trim() || l.physical?.skinTone,
        bodyShape: a.querySelector("#confirmBodyShape")?.value?.trim() || l.physical?.bodyShape,
        heightBuild:
            a.querySelector("#confirmHeightBuild")?.value?.trim() || l.physical?.heightBuild,
        breastSize:
            a.querySelector("#confirmBreastSize")?.value?.trim() || l.physical?.breastSize,
        buttSize: a.querySelector("#confirmButtSize")?.value?.trim() || l.physical?.buttSize,
        fashion: a.querySelector("#confirmFashion")?.value?.trim() || l.physical?.fashion,
        accessories:
            a.querySelector("#confirmAccessories")?.value?.trim() || l.physical?.accessories,
        notableFeatures:
            a.querySelector("#confirmNotableFeatures")?.value?.trim() ||
            l.physical?.notableFeatures,
        genitalType: a.querySelector("#confirmGenitalType")?.value || l.physical?.genitalType,
        genitalSize:
            a.querySelector("#confirmGenitalSize")?.value?.trim() || l.physical?.genitalSize,
        genitalCharacteristics:
            a.querySelector("#confirmGenitalCharacteristics")?.value?.trim() ||
            l.physical?.genitalCharacteristics,
    });
    const readConfirmCharacter = () => {
        const gender = normalizeGender(a.querySelector("#confirmGender")?.value || l.gender),
            race = canonicalRace(a.querySelector("#confirmRace")?.value || "human"),
            ethnicity = ("human" === race && a.querySelector("#confirmEthnicity")?.value) || null;
        return {
            gender,
            race,
            ethnicity,
            physical: createCustomPhysicalAppearance(readConfirmPhysical(), gender, race, ethnicity, r),
        };
    };
    const c = a.querySelector("#confirmAge");
    c &&
        c.addEventListener("change", () => {
            parseInt(c.value) < 18 && (c.value = 18);
        });
    const d = async (e = !1) => {
        if (!e) {
            if (
                !(await showConfirm(
                    'Close without hiring?\n\nYour generated character will be saved and can be recovered from the "Recover Last Character" button.',
                    "Close Without Hiring?",
                    { type: "warning", confirmText: "Close" }
                ))
            )
                return;
        }
        pendingImportedSkeleton = null;
        a.remove();
    };
    a.querySelector("#closeConfirmModal")?.addEventListener("click", () => d(!1)),
        a.querySelector("#cancelConfirmBtn")?.addEventListener("click", () => d(!1)),
        a.addEventListener("click", (e) => {
            e.target === a && d(!1);
        });
    const p = (e) => {
        "Escape" === e.key && (e.preventDefault(), d(!1));
    };
    document.addEventListener("keydown", p);
    const m = new MutationObserver(() => {
        document.contains(a) || (document.removeEventListener("keydown", p), m.disconnect());
    });
    m.observe(document.body, { childList: !0 }),
        a.querySelector("#generateProfileImageBtn")?.addEventListener("click", async () => {
            const e = a.querySelector("#generateProfileImageBtn"),
                t = a.querySelector("#profileImagePreview"),
                n = a.querySelector("#generatedProfileImageUrl"),
                // Same description the character will have after hiring, so the portrait
                // matches the photos that come later.
                w = applyImageStyle(buildProfilePortraitPrompt(readConfirmCharacter()));
            (e.disabled = !0),
                (e.innerHTML =
                    '<span style="display:inline-block; animation:rotate 1.5s linear infinite;">⏳</span> Generating...'),
                (t.innerHTML = '<span style="color:var(--positive); font-size:0.8rem;">Generating...</span>');
            try {
                const e = await queuedGenerateImage(w);
                if (!e) throw new Error("No image URL returned");
                (t.innerHTML = `<img src="${e}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" alt="Generated profile">`),
                    (n.value = e),
                    pendingCustomEmployeeData && (pendingCustomEmployeeData.generatedProfileImage = e),
                    showNotification("✨ Profile image generated!", "success");
            } catch (e) {
                console.error("Error generating profile image:", e),
                    (t.innerHTML = '<span style="color:var(--l-red-lt); font-size:0.7rem;">Failed</span>'),
                    showNotification("Failed to generate image. Try again!", "error");
            }
            (e.disabled = !1), (e.innerHTML = "🎨 Generate Profile Image");
        });
    const u = a.querySelector("#confirmRace"),
        g = a.querySelector("#ethnicitySection");
    u &&
        u.addEventListener("change", () => {
            const e = u.value;
            g && (g.style.display = "human" === canonicalRace(e) ? "" : "none");
            reconcileBio(e, confirmBioState);
            renderBiologyFields(confirmBioHost, e, confirmBioState);
        });
    // Picking an ethnicity re-rolls the looks that come from it, so the skin tone and eyes in
    // the form can't be left describing the previous one.
    const ethSel = a.querySelector("#confirmEthnicity");
    ethSel &&
        ethSel.addEventListener("change", () => {
            const f = applyEthnicityLook(r, ethSel.value || null);
            if (!f) return;
            const set = (id, v) => {
                const el = a.querySelector(id);
                el && v && (el.value = v);
            };
            set("#confirmSkinTone", r.skin.tone),
                set("#confirmEyeColor", r.eyes.color),
                set("#confirmEyeShape", r.eyes.shape),
                set("#confirmHairColor", r.hair.color),
                set("#confirmHairTexture", r.hair.texture),
                showNotification(`🧬 Skin tone, eyes and hair colour updated for ${formatEthnicity(ethSel.value)}.`, "info");
        }),
        a.querySelector("#confirmHireBtn")?.addEventListener("click", async () => {
            const e = a.querySelector("#confirmHireBtn");
            (e.disabled = !0),
                (e.innerHTML =
                    '<span style="display:inline-block; animation:rotate 1.5s linear infinite;">⏳</span> Creating...');
            try {
                const e = {
                        name: a.querySelector("#confirmName")?.value?.trim() || l.name,
                        age: parseInt(a.querySelector("#confirmAge")?.value) || l.age,
                        gender: a.querySelector("#confirmGender")?.value || l.gender,
                        race: canonicalRace(a.querySelector("#confirmRace")?.value || "human"),
                        ethnicity: a.querySelector("#confirmEthnicity")?.value || null,
                        bio: a.querySelector("#confirmBio")?.value?.trim() || l.bio,
                        personalityTraits: (a.querySelector("#confirmTraits")?.value || "")
                            .split(",")
                            .map((e) => e.trim())
                            .filter(Boolean),
                        keyTrait: a.querySelector("#confirmKeyTrait")?.value?.trim() || l.keyTrait || null,
                        hobbies: (a.querySelector("#confirmHobbies")?.value || "")
                            .split(",")
                            .map((e) => e.trim())
                            .filter(Boolean),
                        kinks: (a.querySelector("#confirmKinks")?.value || "")
                            .split(",")
                            .map((e) => e.trim())
                            .filter(Boolean),
                        personality: (() => {
                            const _p = {
                                axes: JSON.parse(JSON.stringify(confirmAxesState)),
                                humor: parseInt(a.querySelector("#confirmHumor")?.value) || 50,
                            };
                            return "function" == typeof syncFlatFiveFromAxes && syncFlatFiveFromAxes({ personality: _p }), _p;
                        })(),
                        voice: { override: a.querySelector("#confirmVoiceOverride")?.value?.trim() || "" },
                        physical: readConfirmPhysical(),
                        // The look rolled when this modal opened, so the saved character keeps
                        // the face and figure the preview portrait was drawn from.
                        basePhysical: r,
                        generatedProfileImage: a.querySelector("#generatedProfileImageUrl")?.value || null,
                        pendingFamilyLink: l.pendingFamilyLink || null,
                        existingPartnerInfo: l.existingPartnerInfo || null,
                        nicknameForPlayer: a.querySelector("#confirmNicknameForPlayer")?.value?.trim() || null,
                        sexualOrientation: a.querySelector("#confirmSexualOrientation")?.value || null,
                        relationshipStatus: a.querySelector("#confirmRelationshipStatus")?.value || null,
                        partnerName: a.querySelector("#confirmPartnerName")?.value?.trim() || null,
                        partnerGender: a.querySelector("#confirmPartnerGender")?.value || null,
                        partnerOccupation: a.querySelector("#confirmPartnerOccupation")?.value?.trim() || null,
                        pets: (a.querySelector("#confirmPets")?.value || "")
                            .split(";")
                            .map((e) => {
                                const [t, n] = e.split(":").map((e) => e?.trim());
                                return t && n ? { name: t, type: n, giftedBy: null } : null;
                            })
                            .filter(Boolean),
                    };
                if (pendingImportedSkeleton) {
                    e.stats = pendingImportedSkeleton.stats || e.stats;
                    e.career = pendingImportedSkeleton.career || e.career;
                    e.customRace = e.customRace || pendingImportedSkeleton.customRace || null;
                    e.schedule = pendingImportedSkeleton.schedule || null;
                    e.personality = { ...(pendingImportedSkeleton.personality || {}), ...(e.personality || {}) };
                    e.generatedProfileImage = e.generatedProfileImage || pendingImportedSkeleton.profileImage || null;
                }
                const n = await finalizeCustomEmployee(e, t);
                n &&
                    (showNotification(`✨ Hired ${n.name}!`, "success"),
                    (pendingCustomEmployeeData = null),
                    (pendingCustomEmployeeProductId = null),
                    (pendingCustomEmployeeSource = null),
                    d(!0));
            } catch (t) {
                console.error("Error finalizing character:", t),
                    showNotification("Failed to hire character. Please try again.", "error"),
                    (e.disabled = !1),
                    (e.innerHTML = "✅ Hire This Character");
            }
        });
}
async function generateEmployeeFromUrl(e, t = "", n) {
    showNotification("🔗 Fetching page content...", "info", 3e3);
    try {
        let n = "",
            a = "";
        try {
            const t = await fetch(e),
                o = await t.text(),
                i = new DOMParser().parseFromString(o, "text/html");
            (a = i.querySelector("title")?.textContent || ""),
                i
                    .querySelectorAll(
                        "script, style, nav, footer, header, aside, .sidebar, #sidebar, .nav, .menu, .advertisement, .ad"
                    )
                    .forEach((e) => e.remove());
            const s = i.querySelector(
                "main, article, .content, .post-content, #content, .wiki-content, .mw-parser-output, .page-content, .entry-content"
            );
            (n = s
                ? s.textContent.replace(/\s+/g, " ").trim()
                : i.body?.textContent?.replace(/\s+/g, " ").trim() || ""),
                (n = n.slice(0, 8e3));
        } catch (t) {
            console.warn("Direct fetch failed, using basic URL info:", t);
            const o = e.split("/").filter(Boolean),
                i = o[o.length - 1] || "";
            (a = decodeURIComponent(i)
                .replace(/[_-]/g, " ")
                .replace(/\(.*?\)/g, "")
                .trim()),
                (n = `Character from: ${e}\nName appears to be: ${a}`);
        }
        if (!n || n.length < 50) throw new Error("Could not extract meaningful content from URL");
        showNotification("🤖 Generating employee from page content...", "info", 5e3);
        const o = `Based on the following webpage content, create a game employee character. Extract personality, appearance, and background information.\n\nPAGE CONTENT:\n${n.slice(0, 6e3)}\n\n${t ? `ADDITIONAL INSTRUCTIONS: ${t}` : ""}\n\nCreate a detailed employee profile. Return ONLY a JSON object (no markdown, no explanation) with these fields:\n{\n  "name": "Full Name",\n  "age": <number between 22-35>,\n  "gender": "<female/male/female_futa/trans_woman/trans_man>",\n  "bio": "<2-3 sentence background based on source material, adapted to office setting>",\n  "personality": {\n    "confidence": <10-90>,\n    "outgoing": <10-90>,\n    "flirty": <10-90>,\n    "professional": <10-90>,\n    "humor": <10-90>\n  },\n  "personalityTraits": ["trait1", "trait2", "trait3"],\n  "hobbies": ["hobby1", "hobby2"],\n  "kinks": ["preference1", "preference2"],\n  "physical": {\n    "hairColor": "color",\n    "hairStyle": "style",\n    "eyeColor": "color",\n    "skinTone": "tone",\n    "bodyShape": "shape",\n    "heightBuild": "height and build description"\n  }\n}`,
            i = await queuedGenerateText(o, {}, "Custom Employee from URL");
        let s;
        try {
            const e = i.match(/\{[\s\S]*\}/);
            if (!e) throw new Error("No JSON found in response");
            s = JSON.parse(e[0]);
        } catch (e) {
            throw (console.error("Failed to parse AI response:", e, i), new Error("AI returned invalid format"));
        }
        return s;
    } catch (e) {
        throw (console.error("generateEmployeeFromUrl error:", e), e);
    }
}
async function generateEmployeeFromPrompt(e, t = "", n) {
    showNotification("🤖 Generating employee from description...", "info", 5e3);
    try {
        const n = `Create a detailed game employee character based on this description:\n\nDESCRIPTION: ${e}\n\n${t ? `ADDITIONAL INSTRUCTIONS: ${t}` : ""}\n\nCreate a complete employee profile. Return ONLY a JSON object (no markdown, no explanation) with these fields:\n{\n  "name": "Full Name (make up a fitting name)",\n  "age": <number between 22-35>,\n  "gender": "<female/male/female_futa/trans_woman/trans_man - infer from description or default to female>",\n  "bio": "<2-3 sentence background that fits the description, in an office/corporate setting>",\n  "personality": {\n    "confidence": <10-90>,\n    "outgoing": <10-90>,\n    "flirty": <10-90>,\n    "professional": <10-90>,\n    "humor": <10-90>\n  },\n  "personalityTraits": ["trait1", "trait2", "trait3"],\n  "hobbies": ["hobby1", "hobby2"],\n  "kinks": ["preference1", "preference2", "preference3"],\n  "physical": {\n    "hairColor": "color",\n    "hairStyle": "style",\n    "eyeColor": "color",\n    "skinTone": "tone",\n    "bodyShape": "shape",\n    "heightBuild": "height and build description"\n  }\n}`,
            a = await queuedGenerateText(n, {}, "Custom Employee from Description");
        let o;
        try {
            const e = a.match(/\{[\s\S]*\}/);
            if (!e) throw new Error("No JSON found in response");
            o = JSON.parse(e[0]);
        } catch (e) {
            throw (console.error("Failed to parse AI response:", e, a), new Error("AI returned invalid format"));
        }
        return o;
    } catch (e) {
        throw (console.error("generateEmployeeFromPrompt error:", e), e);
    }
}
async function createManualEmployee(e, t) {
    showNotification("✨ Creating custom employee...", "info", 3e3);
    try {
        const n =
            !e.name ||
            !e.bio ||
            0 === e.personalityTraits.length ||
            !e.physical.hair.color ||
            0 === e.hobbies.length;
        let a = JSON.parse(JSON.stringify(e));
        if (n) {
            showNotification("🤖 AI is filling in missing details...", "info", 3e3);
            const t = [];
            if (
                (e.name && t.push(`Name: ${e.name}`),
                e.age && t.push(`Age: ${e.age}`),
                e.gender && t.push(`Gender: ${e.gender}`),
                e.race)
            )
                if ("custom" === e.race && e.customRace?.name) {
                    if ((t.push(`Race/Species: ${e.customRace.name} (Custom)`), e.customRace.details?.length > 0)) {
                        const n = e.customRace.details
                            .filter((e) => e.name || e.description)
                            .map((e) => `${e.name}: ${e.description}`)
                            .join("; ");
                        n && t.push(`Custom Race Features: ${n}`);
                    }
                } else t.push(`Race/Species: ${e.race}`);
            e.ethnicity && t.push(`Ethnicity: ${e.ethnicity}`),
                e.bio && t.push(`Bio: ${e.bio}`),
                e.personalityTraits.length > 0 && t.push(`Traits: ${e.personalityTraits.join(", ")}`),
                e.hobbies.length > 0 && t.push(`Hobbies: ${e.hobbies.join(", ")}`),
                e.kinks.length > 0 && t.push(`Kinks: ${e.kinks.join(", ")}`),
                e.keyTrait && t.push(`Key Trait: ${e.keyTrait}`),
                e.physical.hair.color &&
                    t.push(
                        `Hair: ${e.physical.hair.color} ${e.physical.hair.style || ""} ${e.physical.hair.length || ""}`
                    ),
                e.physical.eyes.color && t.push(`Eyes: ${e.physical.eyes.color}`),
                e.physical.bodyShape && t.push(`Body: ${e.physical.bodyShape}`),
                e.physical.skinTone && t.push(`Skin: ${e.physical.skinTone}`),
                e.physical.accessories && t.push(`Accessories: ${e.physical.accessories}`),
                e.physical.notableFeatures && t.push(`Notable Features: ${e.physical.notableFeatures}`);
            e.ethnicity && e.ethnicity;
            const n = `Complete this employee profile by filling in ONLY the missing fields. Keep all existing data.\n\nEXISTING DATA:\n${t.join("\n") || "None provided - create everything from scratch"}\n\nPERSONALITY SETTINGS (use these exact values):\nConfidence: ${e.personality.confidence}\nOutgoing: ${e.personality.outgoing}\nFlirty: ${e.personality.flirty}\nProfessional: ${e.personality.professional}\nHumor: ${e.personality.humor}\n\nReturn ONLY a JSON object with the COMPLETE profile (including existing data):\n{\n  "name": "${e.name || "<generate a name appropriate for ethnicity if specified>"}",\n  "age": ${e.age || "<22-35>"},\n  "gender": "${e.gender || "female"}",\n  "race": "${e.race || "human"}",\n  "bio": "${e.bio || "<generate 2-3 sentence bio>"}",\n  "personalityTraits": ${e.personalityTraits.length > 0 ? JSON.stringify(e.personalityTraits) : '["<trait1>", "<trait2>", "<trait3>"]'},\n  "hobbies": ${e.hobbies.length > 0 ? JSON.stringify(e.hobbies) : '["<hobby1>", "<hobby2>"]'},\n  "kinks": ${e.kinks.length > 0 ? JSON.stringify(e.kinks) : '["<pref1>", "<pref2>"]'},\n  "keyTrait": "${e.keyTrait || "<trait>"}",\n  "physical": {\n    "hairColor": "${e.physical.hair.color || "<color>"}",\n    "hairStyle": "${e.physical.hair.style || "<style>"}",\n    "hairLength": "${e.physical.hair.length || "<length>"}",\n    "eyeColor": "${e.physical.eyes.color || "<color>"}",\n    "eyeShape": "${e.physical.eyes.shape || "<shape>"}",\n    "skinTone": "${e.physical.skinTone || "<tone appropriate for ethnicity>"}",\n    "bodyShape": "${e.physical.bodyShape || "<shape>"}",\n    "heightBuild": "${e.physical.heightBuild || "<description>"}",\n    "breastSize": "${e.physical.breastSize || "<size>"}",\n    "buttSize": "${e.physical.buttSize || "<size>"}",\n    "fashion": "${e.physical.fashion || "<style>"}",\n    "accessories": "${e.physical.accessories || "<accessories or none>"}"\n  }\n}`,
                o = await queuedGenerateText(n, {}, "Manual Employee AI Fill");
            try {
                const t = o.match(/\{[\s\S]*\}/);
                if (t) {
                    const n = JSON.parse(t[0]);
                    (a.name = e.name || n.name),
                        (a.age = e.age || n.age),
                        (a.gender = e.gender || n.gender),
                        (a.race = e.race || n.race),
                        (a.ethnicity = e.ethnicity),
                        (a.bio = e.bio || n.bio),
                        (a.keyTrait = e.keyTrait || n.keyTrait),
                        (a.personalityTraits =
                            e.personalityTraits.length > 0 ? e.personalityTraits : n.personalityTraits || []),
                        (a.hobbies = e.hobbies.length > 0 ? e.hobbies : n.hobbies || []),
                        (a.kinks = e.kinks.length > 0 ? e.kinks : n.kinks || []),
                        n.physical &&
                            (a.physical = {
                                ...e.physical,
                                hair: {
                                    color: e.physical.hair.color || n.physical.hairColor || "brown",
                                    style: e.physical.hair.style || n.physical.hairStyle || "medium length",
                                    length: e.physical.hair.length || n.physical.hairLength || "medium",
                                },
                                eyes: {
                                    color: e.physical.eyes.color || n.physical.eyeColor || "brown",
                                    shape: e.physical.eyes.shape || n.physical.eyeShape || "almond",
                                },
                                skinTone: e.physical.skinTone || n.physical.skinTone || "fair",
                                bodyShape: e.physical.bodyShape || n.physical.bodyShape || "average",
                                heightBuild:
                                    e.physical.heightBuild || n.physical.heightBuild || "5'6 average build",
                                breastSize: e.physical.breastSize || n.physical.breastSize || "medium",
                                buttSize: e.physical.buttSize || n.physical.buttSize || "medium",
                                fashion: e.physical.fashion || n.physical.fashion || "casual professional",
                                accessories: e.physical.accessories || n.physical.accessories || "",
                                notableFeatures: e.physical.notableFeatures || "",
                            });
                }
            } catch (e) {
                console.warn("AI fill failed, using defaults:", e);
            }
        }
        const o = {
            name: a.name,
            age: a.age,
            gender: a.gender,
            race: a.race,
            ethnicity: a.ethnicity,
            bio: a.bio,
            personality: a.personality,
            personalityTraits: a.personalityTraits,
            hobbies: a.hobbies,
            kinks: a.kinks,
            keyTrait: a.keyTrait,
            stats: a.stats,
            career: a.career,
            physical: {
                hairColor: a.physical.hair?.color,
                hairStyle: a.physical.hair?.style,
                hairLength: a.physical.hair?.length,
                eyeColor: a.physical.eyes?.color,
                eyeShape: a.physical.eyes?.shape,
                skinTone: a.physical.skinTone,
                bodyShape: a.physical.bodyShape,
                heightBuild: a.physical.heightBuild,
                breastSize: a.physical.breastSize,
                buttSize: a.physical.buttSize,
                fashion: a.physical.fashion,
                accessories: a.physical.accessories,
                notableFeatures: a.physical.notableFeatures,
            },
            personalLife: a.personalLife,
            schedule: a.schedule,
            startingFlags: a.startingFlags,
        };
        return await finalizeCustomEmployee(o, t);
    } catch (e) {
        throw (console.error("createManualEmployee error:", e), e);
    }
}
async function finalizeCustomEmployee(e, t) {
    const n = gameState.products.find((e) => e.id === t);
    if (!n) throw new Error("Product not found");
    const a =
        { female_futa: "femaleFuta", trans_woman: "transWoman", trans_man: "transMan" }[(o = e.gender)] ||
        o ||
        selectGenderForEmployee();
    var o;
    let i = e.race || selectRaceForEmployee(),
        s = e.customRace || null;
    "custom" === i && s && s.name && (i = s.name);
    let r = null,
        l = null;
    if ("human" === i && e.ethnicity)
        if (e.ethnicity.includes("-")) {
            const t = e.ethnicity.split("-");
            (r = t[0]), (l = t[1].charAt(0).toUpperCase() + t[1].slice(1));
        } else r = e.ethnicity;
    const c = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
        d = {
            id: `emp_${Date.now()}_custom`,
            name: e.name || generateUniqueName(a, e.ethnicity || r, i),
            age: e.age || c[Math.floor(Math.random() * c.length)],
            gender: a,
            race: i,
            position: `Manager – ${n.name}`,
            productId: t,
            productManaged: n.name,
            personalityTraits: e.personalityTraits || ["Professional", "Dedicated", "Friendly"],
            keyTrait: e.keyTrait || e.personalityTraits?.[0] || "Dedicated",
            hobbies: e.hobbies || ["Reading", "Fitness"],
            kinks: e.kinks || ["Roleplay", "Teasing"],
            personality: {
                confidence: e.personality?.confidence ?? 50,
                outgoing: e.personality?.outgoing ?? 50,
                flirty: e.personality?.flirty ?? 50,
                professional: e.personality?.professional ?? 50,
                humor: e.personality?.humor ?? 50,
            },
            stats: {
                affection: e.stats?.affection ?? generateEmployeeStat("affection"),
                comfort: e.stats?.comfort ?? generateEmployeeStat("comfort"),
                trust: e.stats?.trust ?? generateEmployeeStat("trust"),
                desire: e.stats?.desire ?? generateEmployeeStat("desire"),
                friendship: e.stats?.friendship ?? generateEmployeeStat("friendship"),
                productivity: e.stats?.productivity ?? generateEmployeeStat("productivity"),
                obedience: e.stats?.obedience ?? 10,
            },
            giftPreferences: generateGiftPreferences(),
            hired: !0,
            onboarding: !1,
            bioComplete: !0,
            bio: e.bio || "A dedicated professional who brings energy to the workplace.",
            physical: createCustomPhysicalAppearance(e.physical, a, i, e.ethnicity, e.basePhysical),
            profileImage: null,
            hireDate: gameNow(),
            employmentStatus: "active",
            locationId: n.locationId || "headquarters",
            career: {
                level: e.career?.level || 1,
                title: gameState.hierarchyLevels?.[e.career?.level || 1]?.title || "Staff",
                salary: e.career?.salary || gameState.hierarchyLevels?.[e.career?.level || 1]?.baseSalary || 1e5,
                startDate: Date.now(),
                promotionHistory: [],
                directReports: [],
                managerId: null,
            },
            skills: {
                technical: { level: 1 + Math.floor(3 * Math.random()), xp: 0, maxXp: 500 },
                creative: { level: 1 + Math.floor(3 * Math.random()), xp: 0, maxXp: 500 },
                social: { level: 1 + Math.floor(3 * Math.random()), xp: 0, maxXp: 500 },
                management: { level: 1 + Math.floor(3 * Math.random()), xp: 0, maxXp: 500 },
                intimate: { level: 0, xp: 0, maxXp: 500 },
                cooking: { level: Math.floor(3 * Math.random()), xp: 0, maxXp: 500 },
                fitness: { level: Math.floor(3 * Math.random()), xp: 0, maxXp: 500 },
            },
            isRehire: !1,
            fastTrack: !1,
            previousLevel: null,
            previousTitle: null,
            timesRehired: 0,
            isCustomEmployee: !0,
            nicknameForPlayer: e.nicknameForPlayer || null,
            customRace: s,
        };
    // The ethnicity picked in the confirmation modal was only used for the name; keep it (or
    // the one the look was rolled from) so the profile and every prompt agree with the skin tone.
    "human" === i && (d.ethnicity = e.ethnicity || d.physical?.ethnicity || null);
    e.career?.salary || (d.career.salary = getMarketRate(d));
    if (s && s.details && s.details.length > 0) {
        const e = s.details
            .filter((e) => e.name || e.description)
            .map((e) => (e.name && e.description ? `${e.name}: ${e.description}` : e.name || e.description))
            .join("; ");
        if (d.physical) {
            const t = d.physical.notableFeatures || "";
            (d.physical.notableFeatures = t ? `${t}; ${e}` : e), (d.physical.raceFeatures = e);
        }
    }
    if (e.physical) {
        e.physical.hairColor && (d.physical.hair = { ...d.physical.hair, color: e.physical.hairColor }),
            e.physical.hairStyle && (d.physical.hair = { ...d.physical.hair, style: e.physical.hairStyle }),
            e.physical.hairLength && (d.physical.hair = { ...d.physical.hair, length: e.physical.hairLength }),
            e.physical.hairTexture && (d.physical.hair = { ...d.physical.hair, texture: e.physical.hairTexture }),
            e.physical.eyeColor && (d.physical.eyes = { ...d.physical.eyes, color: e.physical.eyeColor }),
            e.physical.eyeShape && (d.physical.eyes = { ...d.physical.eyes, shape: e.physical.eyeShape }),
            e.physical.skinTone &&
                ((d.physical.skinTone = e.physical.skinTone),
                d.physical.skin &&
                    ((d.physical.skin.tone = e.physical.skinTone),
                    (d.physical.skin.full = `${d.physical.skin.texture || "smooth"} ${e.physical.skinTone} skin`))),
            e.physical.bodyShape && (d.physical.bodyShape = e.physical.bodyShape),
            e.physical.heightBuild && (d.physical.heightBuild = e.physical.heightBuild),
            e.physical.breastSize &&
                ((d.physical.breastSize = e.physical.breastSize),
                d.physical.body && (d.physical.body.chestSize = e.physical.breastSize)),
            e.physical.buttSize &&
                ((d.physical.buttSize = e.physical.buttSize),
                d.physical.body && (d.physical.body.buttSize = e.physical.buttSize)),
            e.physical.fashion && (d.physical.fashion = e.physical.fashion),
            void 0 !== e.physical.accessories &&
                "" !== e.physical.accessories &&
                (d.physical.accessories = e.physical.accessories),
            e.physical.notableFeatures && (d.physical.notableFeatures = e.physical.notableFeatures),
            (e.physical.genitalType || e.physical.genitalSize || e.physical.genitalCharacteristics) &&
                (d.physical.genitals = [
                    {
                        type: e.physical.genitalType || "",
                        size: e.physical.genitalSize || "",
                        characteristics: e.physical.genitalCharacteristics || "",
                        full: `${e.physical.genitalSize || "average"} ${e.physical.genitalType || "genitals"}, ${e.physical.genitalCharacteristics || "natural"}`,
                    },
                ]);
        const t = d.physical.hair?.length || d.physical.hair?.style || "styled",
            n = d.physical.hair?.color || "dark",
            a = d.physical.eyes?.color || "brown",
            o = d.physical.skin?.tone || d.physical.skinTone || "fair",
            i = d.physical.body?.shape || d.physical.bodyShape || "average",
            s = d.physical.heightBuild || "average height",
            r = "male" === d.gender ? "man" : "femaleFuta" === d.gender ? "futa" : "woman";
        d.physical.shortDescription = `${s} ${i} ${r} with ${t} ${n} hair, ${a} eyes, ${o} skin`;
    }
    if (
        (e.schedule &&
            (d.schedule = {
                workDays: e.schedule.workDays || [1, 2, 3, 4, 5],
                workStartHour: e.schedule.workStartHour ?? 9,
                workEndHour: e.schedule.workEndHour ?? 17,
                isCurrentlyWorking: !1,
                lastClockIn: null,
                lastClockOut: null,
                hoursWorkedToday: 0,
                daysWorked: 0,
                lateDays: 0,
                ptoBalance: e.schedule.ptoBalance ?? 10,
                sickDays: 5,
                isOnLeave: !1,
                leaveType: null,
                leaveEndDate: null,
            }),
        e.personalLife &&
            (d.personalLife || (d.personalLife = {}),
            e.personalLife.livingSituation &&
                (d.personalLife.livingSituation = {
                    type: e.personalLife.livingSituation,
                    hasRoommate: "with-roommate" === e.personalLife.livingSituation,
                    hasPet: e.personalLife.hasPet && "no" !== e.personalLife.hasPet,
                    petType: e.personalLife.hasPet && "no" !== e.personalLife.hasPet ? e.personalLife.hasPet : null,
                    petName: null,
                    pets: [],
                }),
            e.personalLife.relationshipStatus &&
                (d.personalLife.outsideContacts || (d.personalLife.outsideContacts = {}),
                (d.personalLife.outsideContacts.relationshipStatus = e.personalLife.relationshipStatus),
                (d.personalLife.outsideContacts.inRelationship = [
                    "dating",
                    "serious",
                    "engaged",
                    "married",
                ].includes(e.personalLife.relationshipStatus))),
            e.personalLife.sexualOrientation &&
                (d.personalLife.sexualOrientation = e.personalLife.sexualOrientation)),
        e.sexualOrientation &&
            (d.personalLife || (d.personalLife = {}), (d.personalLife.sexualOrientation = e.sexualOrientation)),
        !d.personalLife?.sexualOrientation)
    ) {
        d.personalLife || (d.personalLife = {});
        const e = "female" === d.gender?.toLowerCase() || "femaleFuta" === d.gender || "transWoman" === d.gender,
            t = Math.random();
        d.personalLife.sexualOrientation =
            t < 0.75
                ? "straight"
                : t < 0.85
                  ? "bisexual"
                  : t < 0.92
                    ? e
                        ? "lesbian"
                        : "gay"
                    : t < 0.99
                      ? "pansexual"
                      : "asexual";
    }
    if (e.relationshipStatus)
        if (
            (d.personalLife || (d.personalLife = {}),
            d.personalLife.outsideContacts || (d.personalLife.outsideContacts = {}),
            "single" === e.relationshipStatus)
        )
            (d.personalLife.outsideContacts.relationshipStatus = "single"),
                (d.personalLife.outsideContacts.inRelationship = !1),
                (d.personalLife.significantOther = null);
        else {
            (d.personalLife.outsideContacts.relationshipStatus = e.relationshipStatus),
                (d.personalLife.outsideContacts.inRelationship = !0);
            const t = d.personalLife?.sexualOrientation || "straight";
            let n = e.partnerGender;
            if (!n) {
                const e =
                    "female" === d.gender?.toLowerCase() || "femaleFuta" === d.gender || "transWoman" === d.gender;
                n =
                    "gay" === t
                        ? "male"
                        : "lesbian" === t
                          ? "female"
                          : "straight" === t
                            ? e
                                ? "male"
                                : "female"
                            : Math.random() < 0.5
                              ? "male"
                              : "female";
            }
            const a = e.partnerName || generateUniqueName(n),
                o = [
                    "Teacher",
                    "Accountant",
                    "Engineer",
                    "Nurse",
                    "Lawyer",
                    "Chef",
                    "Artist",
                    "Freelancer",
                    "Manager",
                    "Consultant",
                    "Developer",
                    "Designer",
                    "Doctor",
                    "Therapist",
                    "Writer",
                ],
                i = e.partnerOccupation || o[Math.floor(Math.random() * o.length)];
            let s = 1;
            "married" === e.relationshipStatus
                ? (s = 2 + Math.floor(10 * Math.random()))
                : "engaged" === e.relationshipStatus
                  ? (s = 1 + Math.floor(4 * Math.random()))
                  : "serious" === e.relationshipStatus
                    ? (s = 1 + Math.floor(3 * Math.random()))
                    : "dating" === e.relationshipStatus && (s = Math.random() < 0.5 ? 0 : 1),
                (d.personalLife.significantOther = {
                    name: a,
                    gender: n,
                    relationshipType: e.relationshipStatus,
                    occupation: i,
                    yearsTogether: s,
                    hasKids: "married" === e.relationshipStatus && Math.random() < 0.3,
                });
        }
    if (
        (e.startingFlags &&
            e.startingFlags.length > 0 &&
            (d.flags || (d.flags = { systemFlags: [], customFlags: [] }),
            e.startingFlags.forEach((e) => {
                d.flags.customFlags.includes(e) || d.flags.customFlags.push(e);
            })),
        e.pets &&
            e.pets.length > 0 &&
            (d.personalLife || (d.personalLife = {}),
            d.personalLife.livingSituation || (d.personalLife.livingSituation = { type: "apartment", pets: [] }),
            (d.personalLife.livingSituation.pets = e.pets),
            (d.personalLife.livingSituation.hasPet = !0)),
        gameState.usedEmployeeNames || (gameState.usedEmployeeNames = new Set()),
        gameState.usedEmployeeNames.add(d.name),
        initializeEmployeeSocialData(d),
        ensureEmployeeStateSurface(d),
        gameState.employees.push(d),
        e.pendingFamilyLink && e.pendingFamilyLink.relatedTo && e.pendingFamilyLink.relationship)
    ) {
        const t = gameState.employees.find((t) => t.id === e.pendingFamilyLink.relatedTo);
        t &&
            (createFamilyRelationship(t.id, d.id, e.pendingFamilyLink.relationship),
            "spouse" === e.pendingFamilyLink.relationship &&
                (d.personalLife || (d.personalLife = {}),
                (d.personalLife.significantOther = {
                    name: t.name,
                    gender: t.gender,
                    relationshipType: "married",
                    occupation: t.position || "Employee",
                    yearsTogether: e.existingPartnerInfo?.yearsTogether ?? 0,
                    hasKids: e.existingPartnerInfo?.hasKids ?? !1,
                })),
            console.log(
                `[Family] Created ${e.pendingFamilyLink.relationship} relationship between ${t.name} and ${d.name}`
            ));
    }
    updateCompanyAwareness(),
        generateRandomRelationships(d.id),
        logCompanyEvent({
            type: "hire",
            involvedEmployees: [d.id],
            location: d.locationId,
            description: `${d.name} was custom-hired as ${d.position}`,
            sentiment: "positive",
            importance: 7,
        }),
        (n.managerHired = !0),
        (n.managerId = d.id),
        (n.managerLevel = d.career.level),
        (n.managerOnboarding = !1);
    const p = d.career.level;
    let m = null;
    if (e.career?.selectedSlot) {
        const a = e.career.selectedSlot;
        if (((m = gameState.corporatePyramid?.positions?.[a.level]?.[a.index]), m && m.productId !== t)) {
            const e = gameState.products.find((e) => e.id === m.productId);
            e &&
                ((d.productId = e.id),
                (d.productManaged = e.name),
                (d.position = `${gameState.hierarchyLevels?.[a.level]?.title || "Manager"} – ${e.name}`),
                (n.managerHired = !1),
                (n.managerId = null),
                (n.managerLevel = null),
                (e.managerHired = !0),
                (e.managerId = d.id),
                (e.managerLevel = d.career.level));
        }
        console.log(
            `[Custom Employee] Using explicitly selected position slot: Level ${a.level}, Index ${a.index}`
        );
    } else m = gameState.corporatePyramid?.positions?.[p]?.find((e) => e.productId === n.id);
    if (m) {
        m.employeeId = d.id;
        const t = gameState.hierarchyLevels?.[m.level] || gameState.hierarchyLevels?.[1];
        t && ((d.career.title = t.title), e.career?.salary || (d.career.salary = t.baseSalary));
    }
    if (e.generatedProfileImage)
        (d.profileImage = e.generatedProfileImage),
            d.photos || (d.photos = []),
            d.photos.push({
                url: e.generatedProfileImage,
                source: "profile",
                caption: "Initial profile picture",
                timestamp: Date.now(),
            }),
            console.log("[Custom Employee] Using pre-generated profile image from confirmation modal");
    else {
        showNotification("🎨 Generating profile image...", "info", 3e3);
        try {
            // Same portrait as a normal hire's (selectManagerCandidate).
            const e = buildProfilePortraitPrompt(d);
            if ("function" == typeof generateImage) {
                const t = await queuedGenerateImage(applyImageStyle(e), `Profile Image - ${d.name}`);
                t &&
                    ((d.profileImage = t),
                    d.photos || (d.photos = []),
                    d.photos.push({
                        url: t,
                        source: "profile",
                        caption: "Initial profile picture",
                        timestamp: Date.now(),
                    }));
            }
        } catch (e) {
            console.warn("Profile image generation failed:", e);
        }
    }
    if (pendingImportedSkeleton) {
        try {
            applyImportedSkeletonOverlay(d, pendingImportedSkeleton);
        } catch (err) {
            console.warn("[Import] skeleton overlay failed:", err);
        }
        pendingImportedSkeleton = null;
    }
    return (
        generateFirstEmployeePost(d).catch((e) => {
            console.warn("First post generation failed:", e);
        }),
        updatePeopleTab(),
        updateProductsList(),
        saveGame(),
        console.log(`[Custom Employee] Created ${d.name} for ${n.name} at Level ${d.career.level}`),
        d
    );
}
function generatePotentialHires(e) {
    const t = [
            "Playful",
            "Reserved",
            "Confident",
            "Witty",
            "Thoughtful",
            "Cheeky",
            "Dry-humored",
            "Warm",
            "Ambitious",
            "Chill",
            "Inquisitive",
            "Loyal",
            "Optimistic",
            "Pessimistic",
            "Sarcastic",
            "Sincere",
            "Spontaneous",
            "Stoic",
            "Supportive",
            "Adventurous",
            "Cautious",
            "Curious",
            "Diligent",
            "Easygoing",
            "Energetic",
            "Focused",
            "Generous",
            "Humble",
            "Imaginative",
            "Meticulous",
            "Pragmatic",
            "Resourceful",
            "Sociable",
            "Tactful",
            "Versatile",
        ],
        n = [
            "Charismatic",
            "Analytical",
            "Creative",
            "Detail-oriented",
            "Adaptable",
            "Empathetic",
            "Organized",
            "Bold",
            "Reliable",
            "Innovative",
            "Strategic",
            "Patient",
            "Decisive",
            "Collaborative",
            "Resilient",
            "Visionary",
            "Persuasive",
            "Curious",
            "Ambitious",
            "Supportive",
            "Meticulous",
            "Proactive",
            "Diligent",
            "Resourceful",
            "Versatile",
            "Submissive",
            "Dominant",
            "Flirty",
            "Shy",
            "Confident",
            "Caring",
            "Playful",
            "Serious",
            "Adventurous",
            "Loyal",
            "Spontaneous",
            "Thoughtful",
            "Cheeky",
            "Witty",
            "Warm",
            "Inquisitive",
        ],
        a = [
            "Reading",
            "Photography",
            "Hiking",
            "Gaming",
            "Cooking",
            "Traveling",
            "Music",
            "Art",
            "Yoga",
            "Dancing",
            "Climbing",
            "Baking",
            "Thrifting",
            "Gardening",
            "Writing",
            "Cycling",
            "Swimming",
            "Crafting",
            "Meditation",
            "Volunteering",
            "Fishing",
            "Running",
            "Collecting",
            "Knitting",
            "Birdwatching",
            "Puzzles",
            "Board games",
            "Movies",
            "Theater",
            "Fitness",
            "Martial arts",
            "Skiing",
            "Snowboarding",
            "Surfing",
            "Skateboarding",
            "Camping",
            "Astronomy",
            "DIY projects",
            "Blogging",
            "Podcasting",
            "Learning languages",
            "Genealogy",
            "Magic tricks",
            "Robotics",
            "Woodworking",
            "Calligraphy",
            "Chess",
            "Travel blogging",
            "Vlogging",
            "Stand-up comedy",
            "Improv",
        ],
        o = [
            "Roleplay",
            "Bondage",
            "Exhibitionism",
            "Voyeurism",
            "Dom/sub",
            "Praise",
            "Teasing",
            "Spanking",
            "Light impact",
            "Dirty talk",
            "Public play",
            "Costumes",
            "Sensory play",
            "Tickling",
            "Restraints",
            "Blindfolds",
            "Temperature play",
            "Massage",
            "Oral fixation",
            "Foot fetish",
            "Group play",
            "Cuddling",
            "Hair pulling",
            "Choking",
            "Anal play",
            "Threesomes",
            "Fantasies",
            "Power exchange",
            "Erotic humiliation",
            "Sensation play",
            "Mutual masturbation",
        ],
        i = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
        s = (e, t, n) => {
            const a = Math.max(t, Math.min(n, Math.floor(Math.random() * (n - t + 1)) + t)),
                o = new Set();
            for (; o.size < a; ) o.add(e[Math.floor(Math.random() * e.length)]);
            return [...o];
        },
        r = [];
    const candidateCount = 3 + (gameState.globalUpgrades?.workforce?.recruiting || 0);
    for (let l = 0; l < candidateCount; l++) {
        const c = selectGenderForEmployee(),
            d = selectRaceForEmployee(),
            p = "human" === d ? selectEthnicityForEmployee() : null,
            m = {
                id: `emp_${Date.now()}_${l}`,
                name: generateUniqueName(c, p, d),
                age: i[Math.floor(Math.random() * i.length)],
                gender: c,
                race: d,
                ethnicity: p,
                position: "Manager Candidate",
                productId: e,
                personalityTraits: s(t, 3, 5),
                keyTrait: n[Math.floor(Math.random() * n.length)],
                hobbies: s(a, 1, 2),
                kinks: s(o, 2, 4),
                personality: {
                    confidence: 30 + Math.floor(50 * Math.random()),
                    outgoing: 20 + Math.floor(60 * Math.random()),
                    flirty: 10 + Math.floor(70 * Math.random()),
                    professional: 30 + Math.floor(50 * Math.random()),
                    humor: 20 + Math.floor(60 * Math.random()),
                },
                stats: {
                    affection: generateEmployeeStat("affection"),
                    comfort: generateEmployeeStat("comfort"),
                    trust: generateEmployeeStat("trust"),
                    desire: generateEmployeeStat("desire"),
                    friendship: generateEmployeeStat("friendship"),
                    productivity: generateEmployeeStat("productivity"),
                },
                giftPreferences: generateGiftPreferences(),
                hired: !1,
                onboarding: !0,
                bioComplete: !1,
                productManaged: null,
                physical: {
                    heightBuild: null,
                    hair: { color: null, style: null, length: null },
                    eyes: { color: null, shape: null },
                    skinTone: null,
                    bodyShape: null,
                    breastSize: null,
                    buttSize: null,
                    fashion: null,
                },
                profileImage: null,
                bio: null,
                hireDate: gameNow(),
                career: {
                    level: 1,
                    title: "Staff",
                    salary: 1e5,
                    startDate: Date.now(),
                    promotionHistory: [],
                    directReports: [],
                    managerId: null,
                },
                isRehire: !1,
                fastTrack: !1,
                previousLevel: null,
                previousTitle: null,
                timesRehired: 0,
            };
        r.push(m);
    }
    return r;
}
function finalizeManagerHire(e, t) {
    e.socialData || initializeEmployeeSocialData(e),
        e.hireDate || (e.hireDate = gameNow()),
        (e.employmentStatus = "active"),
        e.locationId || ((e.locationId = t.locationId || "headquarters"), (e.location = e.locationId)),
        gameState.employees.push(e),
        updateCompanyAwareness(),
        generateRandomRelationships(e.id),
        logCompanyEvent({
            type: "hire",
            involvedEmployees: [e.id],
            location: e.locationId || t.locationId || "headquarters",
            description: `${e.name} returned as ${e.position}`,
            sentiment: "positive",
            importance: 7,
        }),
        generateFirstEmployeePost(e).catch((e) => {
            console.error("Welcome back post generation failed:", e);
        }),
        (t.managerHired = !0),
        (t.managerId = e.id),
        (t.managerLevel = 1),
        (t.managerOnboarding = !1);
    const n = gameState.corporatePyramid.positions[1]?.find((e) => e.productId === t.id);
    if (n) {
        (n.employeeId = e.id), (e.productManaged = t.name);
        const a = gameState.hierarchyLevels[n.level] || gameState.hierarchyLevels[1],
            premium = Math.max(0, (e.career.salary || 0) - getMarketRate(e, e.career.level));
        (e.career.level = n.level),
            (e.career.title = a.title),
            (e.career.salary = getMarketRate(e, n.level) + premium),
            console.log(
                `[Pyramid] Auto-assigned ${e.name} to ${n.title} - Career updated to ${e.career.title} (Level ${e.career.level})`
            );
    } else {
        initializeHierarchicalPyramid();
        const n = gameState.corporatePyramid.positions[1]?.find((e) => e.productId === t.id);
        if (n) {
            (n.employeeId = e.id), (e.productManaged = t.name);
            const a = gameState.hierarchyLevels[n.level] || gameState.hierarchyLevels[1],
                premium = Math.max(0, (e.career.salary || 0) - getMarketRate(e, e.career.level));
            (e.career.level = n.level),
                (e.career.title = a.title),
                (e.career.salary = getMarketRate(e, n.level) + premium),
                console.log(
                    `[Pyramid] Created and assigned ${e.name} to ${n.title} - Career updated to ${e.career.title} (Level ${e.career.level})`
                );
        }
    }
    updatePeopleTab(), updateProductsList(), "dashboard" === gameState.activeTab && refreshDashboardSections();
}
function calculateLoyaltyBonus(e) {
    return Math.min(0.5, 0.05 * e);
}
function selectRandomRehires(e) {
    if (!gameState.rehirePool || 0 === gameState.rehirePool.length) return [];
    const t = [...gameState.rehirePool].sort(() => Math.random() - 0.5);
    return t.slice(0, Math.min(e, t.length));
}
function finalizeRehire(e, t = 1) {
    const n = gameState.currentCandidates?.[e],
        a = n?.productId,
        o = gameState.products.find((e) => e.id === a);
    if (!n || !o) return void console.error("[Rehire] Invalid rehire data or product");
    if (!n.isRehire) return void console.error("[Rehire] Candidate is not marked as rehire");
    const hireCost = getManagerHireCost(o);
    if (gameState.cash < hireCost) return void showNotification("Not enough money to hire!", "error");
    gameState.cash -= hireCost;
    const i = {
        id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: n.name,
        age: n.age,
        gender: n.gender,
        career: {
            level: t,
            title: gameState.hierarchyLevels[t].title,
            salary: gameState.hierarchyLevels[t].baseSalary,
            startDate: Date.now(),
            promotionHistory: [],
            directReports: [],
            managerId: null,
        },
        stats: {
            ...(n.stats || {}),
            productivity: Math.min(100, (n.stats?.productivity ?? 50) * (1 + (n.rehireBonus ?? 0))),
        },
        skills: n.skills ? JSON.parse(JSON.stringify(n.skills)) : {},
        personality: { ...n.personality },
        physical: { ...n.physical },
        photos: n.photos ? JSON.parse(JSON.stringify(n.photos)) : [],
        profileImage: n.profileImage,
        bio: n.bio,
        memory: n.memory ? { ...n.memory } : {},
        keyTrait: n.keyTrait,
        personalityTraits: n.personalityTraits ? [...n.personalityTraits] : [],
        hobbies: n.hobbies ? [...n.hobbies] : [],
        kinks: n.kinks ? [...n.kinks] : [],
        giftPreferences: n.giftPreferences,
        isRehire: !0,
        fastTrack: !0,
        previousLevel: n.previousLevel,
        previousTitle: n.previousTitle,
        timesRehired: (n.timesRehired || 0) + 1,
        productId: a,
        hired: !0,
        onboarding: !1,
        bioComplete: !0,
        employmentStatus: "active",
        hireDate: gameNow(),
    };
    n.chatHistory && n.chatHistory.length > 0 && (gameState.chatHistory[i.id] = [...n.chatHistory]),
        gameState.employees.push(i);
    const s = gameState.rehirePool.findIndex((e) => e.id === n.originalRehireId || e.id === n.id);
    -1 !== s
        ? (gameState.rehirePool.splice(s, 1),
          console.log(`[Rehire] Removed ${i.name} from rehire pool (${gameState.rehirePool.length} remaining)`))
        : console.warn(`[Rehire] Could not find ${i.name} in rehire pool to remove`),
        i.socialData || initializeEmployeeSocialData(i),
        updateCorporateHierarchy(),
        updateCompanyAwareness(),
        generateRandomRelationships(i.id),
        logCompanyEvent({
            type: "hire",
            involvedEmployees: [i.id],
            location: o.locationId || "headquarters",
            description: `${i.name} returned as ${i.career.title}`,
            sentiment: "positive",
            importance: 8,
        }),
        generateWelcomeBackPost(i, n),
        (o.managerHired = !0),
        (o.managerId = i.id),
        (o.managerLevel = 1),
        (o.managerOnboarding = !1),
        (o.running = !0);
    const r = gameState.corporatePyramid.positions[1]?.find((e) => e.productId === o.id);
    if (r)
        (r.employeeId = i.id),
            (i.productManaged = o.name),
            console.log(`[Pyramid] Auto-assigned ${i.name} to ${r.title}`);
    else {
        initializeHierarchicalPyramid();
        const e = gameState.corporatePyramid.positions[1]?.find((e) => e.productId === o.id);
        e &&
            ((e.employeeId = i.id),
            (i.productManaged = o.name),
            console.log(`[Pyramid] Created and assigned ${i.name} to ${e.title}`));
    }
    updatePeopleTab(),
        updateProductsList(),
        closeHiringModal(),
        showNotification(`✨ Welcome back, ${i.name}! Starting as ${i.career.title}`, "success"),
        console.log(`[Rehire] ${i.name} rehired at Level ${t} with ${Math.round(100 * n.rehireBonus)}% bonus`);
}
async function generateWelcomeBackPost(e, t) {
    if (!e || !gameState.socialNetwork) return;
    const n =
            { "very close": "❤️💕", close: "😊💼", friendly: "👋✨", professional: "💼", distant: "👋" }[
                t.relationshipStrength
            ] || "💼",
        a = {
            id: `post_${++gameState.socialNetwork.postIdCounter}_${Date.now()}`,
            author: e.name,
            authorId: e.id,
            type: "work",
            category: "work",
            timestamp: gameState.time?.currentTime || Date.now(),
            contentType: "text",
            caption: `${n} I'm back! Excited to rejoin the team${e.fastTrack ? " and they've put me on the fast track! 🚀" : "!"} Feels good to be home. @TheBoss let's do this! 💪`,
            likes: Math.floor(30 * Math.random()) + 15,
            comments: [],
            imageUrl: null,
            altText: null,
            hasImage: !1,
            explicit: !1,
        };
    gameState.socialNetwork.posts.unshift(a),
        salvagePrunedPostImages(),
        gameState.socialNetwork.posts.length > CAPS.SOCIAL_POSTS &&
            (gameState.socialNetwork.posts = gameState.socialNetwork.posts.slice(0, CAPS.SOCIAL_POSTS)),
        console.log(`[Welcome Back Post] Generated post for ${e.name}'s return`);
}
