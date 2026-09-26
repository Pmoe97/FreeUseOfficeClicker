// ============================================================================
// 27-employee-create — Employee creation: family relations, URL/prompt/manual employee creation, rehire pool, hiring candidates.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

const Jl = { mother: { label: "Mother", inverse: "child", ageAdjust: [20, 35], genderLock: "female", ageDirection: "older" }, father: { label: "Father", inverse: "child", ageAdjust: [20, 40], genderLock: "male", ageDirection: "older" }, sister: { label: "Sister", inverse: "sibling", ageAdjust: [-5, 5], genderLock: "female", ageDirection: "similar" }, brother: { label: "Brother", inverse: "sibling", ageAdjust: [-5, 5], genderLock: "male", ageDirection: "similar" }, daughter: { label: "Daughter", inverse: "parent", ageAdjust: [18, 25], genderLock: "female", ageDirection: "younger" }, son: { label: "Son", inverse: "parent", ageAdjust: [18, 25], genderLock: "male", ageDirection: "younger" }, aunt: { label: "Aunt", inverse: "nibling", ageAdjust: [5, 25], genderLock: "female", ageDirection: "older" }, uncle: { label: "Uncle", inverse: "nibling", ageAdjust: [5, 25], genderLock: "male", ageDirection: "older" }, cousin: { label: "Cousin", inverse: "cousin", ageAdjust: [-10, 10], genderLock: null, ageDirection: "similar" }, spouse: { label: "Spouse", inverse: "spouse", ageAdjust: [-10, 10], genderLock: null, ageDirection: "similar" }, exSpouse: { label: "Ex-Spouse", inverse: "exSpouse", ageAdjust: [-10, 10], genderLock: null, ageDirection: "similar" }, stepmother: { label: "Stepmother", inverse: "stepchild", ageAdjust: [10, 30], genderLock: "female", ageDirection: "older" }, stepfather: { label: "Stepfather", inverse: "stepchild", ageAdjust: [10, 30], genderLock: "male", ageDirection: "older" }, stepsister: { label: "Stepsister", inverse: "stepsibling", ageAdjust: [-5, 5], genderLock: "female", ageDirection: "similar" }, stepbrother: { label: "Stepbrother", inverse: "stepsibling", ageAdjust: [-5, 5], genderLock: "male", ageDirection: "similar" } };
function Ql(e) {
  const t = gameState.employees.find((t2) => t2.id === e);
  if (!t || !t.familyRelations) return [];
  const n = [];
  for (const [e2, a] of Object.entries(t.familyRelations)) {
    const t2 = gameState.employees.find((t3) => t3.id === e2);
    if (t2) {
      const e3 = Jl[a];
      n.push({ employee: t2, relationship: a, label: e3?.label || a });
    }
  }
  return n;
}
function Xl(e, t, n) {
  const a = gameState.employees.find((t2) => t2.id === e), o = gameState.employees.find((e2) => e2.id === t);
  if (!a || !o) return false;
  a.familyRelations || (a.familyRelations = {}), o.familyRelations || (o.familyRelations = {}), a.familyRelations[t] = n;
  const i = Jl[n];
  if (i) {
    let t2 = i.inverse;
    "child" === t2 ? t2 = "male" === a.gender ? "father" : "mother" : "parent" === t2 ? t2 = "male" === o.gender ? "son" : "daughter" : "sibling" === t2 ? t2 = "male" === a.gender ? "brother" : "sister" : "stepchild" === t2 ? t2 = "male" === a.gender ? "stepfather" : "stepmother" : "stepsibling" === t2 ? t2 = "male" === a.gender ? "stepbrother" : "stepsister" : "nibling" === t2 && (t2 = "male" === a.gender ? "uncle" : "aunt"), o.familyRelations[e] = t2;
  }
  return true;
}
function Zl(e, t) {
  const n = Jl[t];
  if (!n) return console.error("Unknown relationship type:", t), null;
  let a, u2 = null;
  if ("spouse" === t && e.personalLife?.significantOther?.name) u2 = e.personalLife.significantOther;
  else if ("exSpouse" === t) {
    const x = [...e.personalLife?.outsideContacts?.relationshipHistory || []].reverse().find((e2) => e2.partnerName);
    x && (u2 = { name: x.partnerName, relationshipType: x.status, endReason: x.endReason });
  }
  if (u2?.gender) a = u2.gender;
  else if (n.genderLock) a = n.genderLock;
  else {
    const e2 = ["male", "female"];
    a = e2[Math.floor(Math.random() * e2.length)];
  }
  const o = e.age || 28;
  let i;
  if ("older" === n.ageDirection) i = o + (n.ageAdjust[0] + Math.floor(Math.random() * (n.ageAdjust[1] - n.ageAdjust[0])));
  else if ("younger" === n.ageDirection) i = Math.max(18, Math.min(34, n.ageAdjust[0] + Math.floor(Math.random() * (n.ageAdjust[1] - n.ageAdjust[0]))));
  else {
    const e2 = n.ageAdjust[0] + Math.floor(Math.random() * (n.ageAdjust[1] - n.ageAdjust[0] + 1));
    i = Math.max(18, o + e2);
  }
  const s = e.ethnicity || e.physical?.ethnicity || null, r = e.race || "human";
  let m;
  if (u2?.name) m = u2.name;
  else {
    const l = generateUniqueName(a, s, r), c = e.name.split(" ");
    let d = c.length > 1 ? c[c.length - 1] : "";
    if (["spouse", "exSpouse", "mother", "aunt", "stepmother"].includes(t) && Math.random() < 0.5) {
      const e2 = l.split(" ");
      d = e2.length > 1 ? e2[e2.length - 1] : d;
    }
    const p = l.split(" ")[0];
    m = d ? `${p} ${d}` : p;
  }
  let G2 = {};
  !["spouse", "exSpouse", "stepmother", "stepfather", "stepsister", "stepbrother"].includes(t) && e.physical && (Math.random() < 0.7 && e.physical.eyes?.color && (G2.eyeColor = e.physical.eyes.color), Math.random() < 0.5 && e.physical.hair?.color && (G2.hairColor = e.physical.hair.color), Math.random() < 0.8 && e.physical.skin?.tone && (G2.skinTone = e.physical.skin.tone));
  const g = (e2, t2, n2) => {
    const a2 = Math.max(t2, Math.min(n2, Math.floor(Math.random() * (n2 - t2 + 1)) + t2)), o2 = /* @__PURE__ */ new Set();
    for (; o2.size < a2; ) o2.add(e2[Math.floor(Math.random() * e2.length)]);
    return [...o2];
  }, h = ["Charismatic", "Analytical", "Creative", "Detail-oriented", "Adaptable", "Empathetic", "Organized", "Bold", "Reliable", "Innovative", "Strategic", "Patient", "Decisive", "Collaborative", "Resilient", "Visionary", "Persuasive", "Curious", "Ambitious", "Supportive", "Meticulous", "Proactive", "Diligent", "Resourceful", "Versatile"];
  return { id: `emp_${Date.now()}_fam_${Math.floor(1e3 * Math.random())}`, name: m, age: i, gender: a, race: r, ethnicity: s, position: "Staff Candidate", pendingFamilyRelation: { relatedTo: e.id, relationship: t }, existingPartnerInfo: u2, personalityTraits: g(["Playful", "Reserved", "Confident", "Witty", "Thoughtful", "Cheeky", "Dry-humored", "Warm", "Ambitious", "Chill", "Inquisitive", "Loyal", "Optimistic", "Pessimistic", "Sarcastic", "Sincere", "Spontaneous", "Stoic", "Supportive", "Adventurous", "Cautious", "Curious", "Diligent", "Easygoing", "Energetic", "Focused", "Generous", "Humble", "Imaginative", "Meticulous", "Pragmatic", "Resourceful", "Sociable", "Tactful", "Versatile"], 3, 5), keyTrait: h[Math.floor(Math.random() * h.length)], hobbies: g(["Reading", "Photography", "Hiking", "Gaming", "Cooking", "Traveling", "Music", "Art", "Yoga", "Dancing", "Climbing", "Baking", "Thrifting", "Gardening", "Writing", "Cycling", "Swimming", "Crafting", "Meditation", "Volunteering", "Fishing", "Running", "Collecting", "Knitting", "Puzzles", "Board games", "Movies", "Theater", "Fitness"], 1, 2), kinks: g(["Roleplay", "Bondage", "Exhibitionism", "Voyeurism", "Dom/sub", "Praise", "Teasing", "Spanking", "Dirty talk", "Public play", "Costumes", "Sensory play", "Blindfolds", "Massage", "Hair pulling", "Fantasies", "Power exchange"], 2, 4), personality: { confidence: 30 + Math.floor(50 * Math.random()), outgoing: 20 + Math.floor(60 * Math.random()), flirty: 10 + Math.floor(70 * Math.random()), professional: 30 + Math.floor(50 * Math.random()), humor: 20 + Math.floor(60 * Math.random()) }, stats: { affection: bu("affection"), comfort: bu("comfort"), trust: bu("trust"), desire: bu("desire"), friendship: bu("friendship"), productivity: bu("productivity") }, giftPreferences: bl(), hired: false, onboarding: true, bioComplete: false, productManaged: null, physical: null, inheritedFeatures: G2, profileImage: null, bio: null, hireDate: Date.now(), career: { level: 1, title: "Staff", salary: 1e5, startDate: Date.now(), promotionHistory: [], directReports: [], managerId: null }, isRehire: false, fastTrack: false, previousLevel: null, previousTitle: null, timesRehired: 0, isFamilyMember: true, familySourceId: e.id, familyRelationType: t };
}
function nc(e) {
  const t = Ql(e);
  if (0 === t.length) return "";
  const n = t.filter((e2) => "active" === e2.employee.employmentStatus || e2.employee.hired);
  return 0 === n.length ? "" : `Has family at the company: ${n.map((e2) => `${e2.employee.name} (${e2.label.toLowerCase()})`).join(", ")}. (Note: This is background info - don't constantly bring up unless relevant to conversation)`;
}
let oc = null, rc = null, sc = null, lc = null;
function uc(e) {
  const t = e?.querySelector("#recoverCharacterSection"), n = e?.querySelector("#recoverCharacterInfo");
  if (t) if (oc && oc.name) {
    if (t.style.display = "block", n) {
      const e2 = oc.name || "Unknown", t2 = sc || "Unknown";
      n.textContent = `"${e2}" (from ${t2})`;
    }
  } else t.style.display = "none";
}
function togglePartnerFields() {
  const e = document.getElementById("confirmRelationshipStatus"), t = document.getElementById("partnerDetailsSection");
  if (e && t) {
    const n = e.value;
    t.style.display = n && "single" !== n ? "block" : "none";
  }
}
function yc(e, t, n = "URL") {
  oc = JSON.parse(JSON.stringify(e)), rc = t, sc = n;
  const a = document.createElement("div");
  a.id = "characterConfirmModal", a.style.cssText = "\n      position: fixed; top: 0; left: 0; right: 0; bottom: 0;\n      background: var(--an); z-index: 10001;\n      display: flex; align-items: center; justify-content: center;\n      padding: 20px; box-sizing: border-box;\n    ";
  const o = e.gender || "female", i = e.race || "human", s = e.ethnicity || null, r = ni(o, i, s), l = { ...e, name: e.name || generateUniqueName(o, s, i), age: e.age || 22 + Math.floor(12 * Math.random()), gender: o, race: i, bio: e.bio || `A dedicated ${"human" === i ? "professional" : i} who brings unique skills to the workplace.`, personalityTraits: e.personalityTraits?.length > 0 ? e.personalityTraits : ["Professional", "Dedicated", "Friendly"], keyTrait: e.keyTrait || "Dedicated", hobbies: e.hobbies?.length > 0 ? e.hobbies : ["Reading", "Fitness"], kinks: e.kinks?.length > 0 ? e.kinks : ["Roleplay", "Teasing"], personality: { confidence: e.personality?.confidence ?? 50, outgoing: e.personality?.outgoing ?? 50, flirty: e.personality?.flirty ?? 50, professional: e.personality?.professional ?? 50, humor: e.personality?.humor ?? 50 }, physical: { hairColor: e.physical?.hairColor || e.physical?.hair?.color || r.hair?.color || "brown", hairStyle: e.physical?.hairStyle || e.physical?.hair?.style || r.hair?.style || "wavy", hairLength: e.physical?.hairLength || e.physical?.hair?.length || r.hair?.length || "medium", hairTexture: e.physical?.hairTexture || e.physical?.hair?.texture || r.hair?.texture || "smooth", eyeColor: e.physical?.eyeColor || e.physical?.eyes?.color || r.eyes?.color || "brown", eyeShape: e.physical?.eyeShape || e.physical?.eyes?.shape || r.eyes?.shape || "almond-shaped", skinTone: e.physical?.skinTone || r.skin?.tone || "fair", bodyShape: e.physical?.bodyShape || r.body?.shape || "average", heightBuild: e.physical?.heightBuild || r.heightBuild || "average height", breastSize: e.physical?.breastSize || r.body?.chestSize || "average", buttSize: e.physical?.buttSize || r.body?.buttSize || "average", fashion: e.physical?.fashion || r.fashion || "business casual", accessories: e.physical?.accessories || r.accessories || "minimal jewelry", notableFeatures: e.physical?.notableFeatures || r.notableFeatures || "warm smile", genitalType: e.physical?.genitalType || r.genitals?.[0]?.type || null, genitalSize: e.physical?.genitalSize || r.genitals?.[0]?.size || null, genitalCharacteristics: e.physical?.genitalCharacteristics || r.genitals?.[0]?.characteristics || null, bio: e.physical?.bio || r.bio || Nl(Il(i)) }, generatedProfileImage: e.generatedProfileImage || null, pendingFamilyLink: e.pendingFamilyLink || null, nicknameForPlayer: e.nicknameForPlayer || null, pets: e.pets || [] };
  oc = JSON.parse(JSON.stringify(l)), a.innerHTML = ` <div style="background:linear-gradient(135deg, var(--ad) 0%, var(--w) 100%); border-radius:16px; max-width:600px; width:100%; max-height:90vh; overflow-y:auto; border:2px solid var(--g); box-shadow:0 20px 60px var(--ab);"> <div style="padding:20px; border-bottom:1px solid var(--o); display:flex; justify-content:space-between; align-items:center;"> <h2 style="margin:0; color:var(--g);">\u2728 Character Generated!</h2> <button id="closeConfirmModal" style="background:none; border:none; color:var(--e); font-size:24px; cursor:pointer;">&times;</button> </div> <div style="padding:20px;"> <p style="color:var(--a); margin-bottom:15px;">Review and edit the generated character before hiring:</p> <!-- Basic Info --> <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;"> <div> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">Name</label> <input type="text" id="confirmName" value="${l.name || ""}" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">Age (18+)</label> <input type="number" id="confirmAge" value="${Math.max(18, l.age || 25)}" min="18" max="99" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); box-sizing:border-box;"> </div> </div> <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;"> <div> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">Gender</label> <select id="confirmGender" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b);"> <option value="female" ${"female" === l.gender ? "selected" : ""}>Female</option> <option value="male" ${"male" === l.gender ? "selected" : ""}>Male</option> <option value="female_futa" ${"female_futa" === l.gender ? "selected" : ""}>Futa</option> <option value="trans_woman" ${"trans_woman" === l.gender ? "selected" : ""}>Trans Woman</option> <option value="trans_man" ${"trans_man" === l.gender ? "selected" : ""}>Trans Man</option> </select> </div> <div> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">Race/Species</label> <select id="confirmRace" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); box-sizing:border-box; cursor:pointer; appearance:menulist;"> ${Gl(Il(l.race || "human"))} </select> </div> </div> <!-- Ethnicity (only for humans) --> <div id="ethnicitySection" style="margin-bottom:15px; ${l.race && "human" !== l.race ? "display:none;" : ""}"> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">Ethnicity (for humans)</label> <select id="confirmEthnicity" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b);"> <option value="" ${l.ethnicity ? "" : "selected"}>-- Auto-generate --</option> <optgroup label="Europe & Americas"> <option value="caucasian" ${"caucasian" === l.ethnicity ? "selected" : ""}>Caucasian/European</option> <option value="latino" ${"latino" === l.ethnicity ? "selected" : ""}>Latino/Hispanic</option> <option value="nativeAmerican" ${"nativeAmerican" === l.ethnicity ? "selected" : ""}>Native American/Indigenous</option> </optgroup> <optgroup label="Africa"> <option value="black" ${"black" === l.ethnicity ? "selected" : ""}>Black/African</option> </optgroup> <optgroup label="East Asia"> <option value="eastAsian" ${"eastAsian" === l.ethnicity ? "selected" : ""}>East Asian (General)</option> <option value="eastAsian-japanese" ${"eastAsian-japanese" === l.ethnicity ? "selected" : ""}>East Asian - Japanese</option> <option value="eastAsian-chinese" ${"eastAsian-chinese" === l.ethnicity ? "selected" : ""}>East Asian - Chinese</option> <option value="eastAsian-korean" ${"eastAsian-korean" === l.ethnicity ? "selected" : ""}>East Asian - Korean</option> </optgroup> <optgroup label="Southeast Asia"> <option value="southeastAsian" ${"southeastAsian" === l.ethnicity ? "selected" : ""}>Southeast Asian (General)</option> <option value="southeastAsian-thai" ${"southeastAsian-thai" === l.ethnicity ? "selected" : ""}>Southeast Asian - Thai</option> <option value="southeastAsian-vietnamese" ${"southeastAsian-vietnamese" === l.ethnicity ? "selected" : ""}>Southeast Asian - Vietnamese</option> <option value="southeastAsian-filipino" ${"southeastAsian-filipino" === l.ethnicity ? "selected" : ""}>Southeast Asian - Filipino</option> <option value="southeastAsian-indonesian" ${"southeastAsian-indonesian" === l.ethnicity ? "selected" : ""}>Southeast Asian - Indonesian</option> </optgroup> <optgroup label="South & Central Asia"> <option value="southAsian" ${"southAsian" === l.ethnicity ? "selected" : ""}>South Asian (Indian, Pakistani, etc.)</option> <option value="centralAsian" ${"centralAsian" === l.ethnicity ? "selected" : ""}>Central Asian (Kazakh, Mongolian, etc.)</option> </optgroup> <optgroup label="Middle East"> <option value="middleEastern" ${"middleEastern" === l.ethnicity ? "selected" : ""}>Middle Eastern/North African</option> </optgroup> <optgroup label="Oceania"> <option value="pacificIslander" ${"pacificIslander" === l.ethnicity ? "selected" : ""}>Pacific Islander (General)</option> <option value="pacificIslander-hawaiian" ${"pacificIslander-hawaiian" === l.ethnicity ? "selected" : ""}>Pacific Islander - Hawaiian</option> <option value="pacificIslander-samoan" ${"pacificIslander-samoan" === l.ethnicity ? "selected" : ""}>Pacific Islander - Samoan</option> <option value="pacificIslander-maori" ${"pacificIslander-maori" === l.ethnicity ? "selected" : ""}>Pacific Islander - M\u0101ori</option> <option value="indigenous" ${"indigenous" === l.ethnicity ? "selected" : ""}>Indigenous Australian/Aboriginal</option> </optgroup> <optgroup label="Mixed"> <option value="mixed" ${"mixed" === l.ethnicity ? "selected" : ""}>Mixed Ethnicity</option> </optgroup> </select> </div> <!-- Sexual Orientation --> <div style="margin-bottom:15px;"> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">\u{1F495} Sexual Orientation</label> <select id="confirmSexualOrientation" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b);"> <option value="" ${l.sexualOrientation || l.personalLife?.sexualOrientation ? "" : "selected"}>-- Auto-generate --</option> <option value="straight" ${"straight" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Straight/Heterosexual</option> <option value="bisexual" ${"bisexual" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Bisexual</option> <option value="gay" ${"gay" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Gay</option> <option value="lesbian" ${"lesbian" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Lesbian</option> <option value="pansexual" ${"pansexual" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Pansexual</option> <option value="asexual" ${"asexual" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Asexual</option> <option value="demisexual" ${"demisexual" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Demisexual</option> <option value="queer" ${"queer" === (l.sexualOrientation || l.personalLife?.sexualOrientation) ? "selected" : ""}>Queer</option> </select> <p style="margin:4px 0 0 0; font-size:0.7rem; color:var(--e);">Defines romantic/sexual attraction. Strongly influences relationship dynamics.</p> </div> <!-- Relationship Status --> <div style="margin-bottom:15px;"> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">\u{1F48D} Relationship Status</label> <select id="confirmRelationshipStatus" onchange="togglePartnerFields()" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b);"> <option value="" ${l.relationshipStatus || l.personalLife?.outsideContacts?.relationshipStatus ? "" : "selected"}>-- Auto-generate --</option> <option value="single" ${"single" === (l.relationshipStatus || l.personalLife?.outsideContacts?.relationshipStatus) ? "selected" : ""}>Single</option> <option value="dating" ${"dating" === (l.relationshipStatus || l.personalLife?.outsideContacts?.relationshipStatus) ? "selected" : ""}>Dating Someone</option> <option value="serious" ${"serious" === (l.relationshipStatus || l.personalLife?.outsideContacts?.relationshipStatus) ? "selected" : ""}>Serious Relationship</option> <option value="engaged" ${"engaged" === (l.relationshipStatus || l.personalLife?.outsideContacts?.relationshipStatus) ? "selected" : ""}>Engaged</option> <option value="married" ${"married" === (l.relationshipStatus || l.personalLife?.outsideContacts?.relationshipStatus) ? "selected" : ""}>Married</option> </select> <p style="margin:4px 0 0 0; font-size:0.7rem; color:var(--e);">Whether this character has a significant other outside of work.</p> </div> <!-- Partner Details (shown when not single) --> <div id="partnerDetailsSection" style="margin-bottom:15px; padding:10px; background:rgba(255,215,0,0.1); border-radius:6px; border:1px solid rgba(255,215,0,0.3); display:${l.relationshipStatus && "single" !== l.relationshipStatus || l.personalLife?.significantOther ? "block" : "none"};"> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:8px;">\u{1F464} Partner Details <span style="color:var(--e); font-weight:normal;">(leave blank to auto-generate)</span></label> <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;"> <input type="text" id="confirmPartnerName" placeholder="Partner's Name" value="${l.partnerName || l.personalLife?.significantOther?.name || ""}" style="padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b);"> <select id="confirmPartnerGender" style="padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b);"> <option value="">-- Auto --</option> <option value="male" ${"male" === (l.partnerGender || l.personalLife?.significantOther?.gender) ? "selected" : ""}>Male</option> <option value="female" ${"female" === (l.partnerGender || l.personalLife?.significantOther?.gender) ? "selected" : ""}>Female</option> </select> </div> <input type="text" id="confirmPartnerOccupation" placeholder="Partner's Occupation (e.g. Teacher, Accountant)" value="${l.partnerOccupation || l.personalLife?.significantOther?.occupation || ""}" style="width:100%; margin-top:8px; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); box-sizing:border-box;"> </div> <!-- Bio --> <div style="margin-bottom:15px;"> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">Bio</label> <textarea id="confirmBio" rows="3" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); resize:vertical; box-sizing:border-box;">${l.bio || ""}</textarea> </div> <!-- Personality Traits --> <div style="margin-bottom:15px;"> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">Personality Traits (comma-separated)</label> <input type="text" id="confirmTraits" value="${(l.personalityTraits || []).join(", ")}" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); box-sizing:border-box;"> </div> <!-- Key Trait --> <div style="margin-bottom:15px;"> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">Key Trait (defines core behavior)</label> <input type="text" id="confirmKeyTrait" list="keyTraitSuggestions" value="${l.keyTrait || ""}" placeholder="e.g. Confident, Flirty, Analytical, Submissive" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); box-sizing:border-box;"> <datalist id="keyTraitSuggestions"> <option value="Charismatic"> <option value="Analytical"> <option value="Creative"> <option value="Detail-oriented"> <option value="Empathetic"> <option value="Bold"> <option value="Submissive"> <option value="Dominant"> <option value="Flirty"> <option value="Shy"> <option value="Confident"> <option value="Caring"> <option value="Playful"> <option value="Serious"> <option value="Adventurous"> <option value="Loyal"> <option value="Witty"> </datalist> </div> <!-- Hobbies & Kinks --> <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;"> <div> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">Hobbies</label> <input type="text" id="confirmHobbies" value="${(l.hobbies || []).join(", ")}" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">Kinks</label> <input type="text" id="confirmKinks" value="${(l.kinks || []).join(", ")}" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); box-sizing:border-box;"> </div> </div> <!-- Nickname for Player --> <div style="margin-bottom:15px;"> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">\u{1F4AC} What they call you (Nickname for Player)</label> <input type="text" id="confirmNicknameForPlayer" value="${l.nicknameForPlayer || ""}" placeholder="Leave blank for default 'Boss', or enter a custom name like 'Sir', 'Daddy', etc." style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); box-sizing:border-box;"> <p style="margin:4px 0 0 0; font-size:0.7rem; color:var(--e);">This character will always use this name for you instead of "Boss"</p> </div> <!-- Pets --> <div style="margin-bottom:15px;"> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">\u{1F43E} Pets (Name:Type, separated by semicolons)</label> <input type="text" id="confirmPets" value="${(l.pets || []).map((e2) => e2.name + ":" + e2.type).join("; ")}" placeholder="e.g. Whiskers:cat; Max:dog; Bubbles:fish" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); box-sizing:border-box;"> <p style="margin:4px 0 0 0; font-size:0.7rem; color:var(--e);">Format: PetName:PetType; separate multiple pets with semicolons</p> </div> <!-- Physical Appearance --> <details style="background:var(--f); border-radius:8px; margin-bottom:15px;"> <summary style="padding:10px 15px; cursor:pointer; color:var(--v); font-weight:600;">\u{1F441}\uFE0F Physical Appearance</summary> <div style="padding:0 15px 15px 15px;"> <div id="confirmBiologyHost" style="margin-bottom:14px;"></div> <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Hair Color</label> <input type="text" id="confirmHairColor" value="${l.physical?.hairColor || l.physical?.hair?.color || ""}" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Hair Style</label> <input type="text" id="confirmHairStyle" value="${l.physical?.hairStyle || l.physical?.hair?.style || ""}" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Hair Length</label> <input type="text" id="confirmHairLength" value="${l.physical?.hairLength || l.physical?.hair?.length || ""}" placeholder="e.g. pixie cut, shoulder-length, waist-length" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Hair Texture</label> <input type="text" id="confirmHairTexture" value="${l.physical?.hairTexture || l.physical?.hair?.texture || ""}" placeholder="e.g. silky, thick, curly, wavy" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Eye Color</label> <input type="text" id="confirmEyeColor" value="${l.physical?.eyeColor || l.physical?.eyes?.color || ""}" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Eye Shape</label> <input type="text" id="confirmEyeShape" value="${l.physical?.eyeShape || l.physical?.eyes?.shape || ""}" placeholder="e.g. almond, round, hooded, monolid" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Skin Tone</label> <input type="text" id="confirmSkinTone" value="${l.physical?.skinTone || ""}" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Body Shape</label> <input type="text" id="confirmBodyShape" value="${l.physical?.bodyShape || ""}" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Height/Build</label> <input type="text" id="confirmHeightBuild" value="${l.physical?.heightBuild || ""}" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Bust/Chest Size</label> <input type="text" id="confirmBreastSize" value="${l.physical?.breastSize || l.physical?.chestSize || ""}" placeholder="e.g. full, modest, muscular" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Butt Size</label> <input type="text" id="confirmButtSize" value="${l.physical?.buttSize || ""}" placeholder="e.g. round, full, athletic" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Fashion Style</label> <input type="text" id="confirmFashion" value="${l.physical?.fashion || ""}" placeholder="e.g. business professional, casual" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Accessories</label> <input type="text" id="confirmAccessories" value="${l.physical?.accessories || ""}" placeholder="e.g. glasses, earrings, none" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div style="grid-column: span 2;"> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Notable Features</label> <input type="text" id="confirmNotableFeatures" value="${l.physical?.notableFeatures || ""}" placeholder="e.g. dimples, freckles, beauty mark, tattoo" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> </div> <!-- Intimate Details (sub-collapsed) --> <details style="background:var(--ad); border-radius:6px; margin-top:10px;"> <summary style="padding:8px 12px; cursor:pointer; color:var(--v); font-size:0.85rem;">\u{1F51E} Intimate Details</summary> <div style="padding:8px 12px 12px 12px;"> <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Genital Type</label> <select id="confirmGenitalType" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem;"> <option value="" ${l.physical?.genitalType ? "" : "selected"}>-- Auto-generate --</option> <option value="vagina" ${"vagina" === l.physical?.genitalType ? "selected" : ""}>Vagina</option> <option value="penis" ${"penis" === l.physical?.genitalType ? "selected" : ""}>Penis</option> <option value="penis and vagina" ${"penis and vagina" === l.physical?.genitalType ? "selected" : ""}>Penis and Vagina (Futa)</option> <option value="vagina (post-op)" ${"vagina (post-op)" === l.physical?.genitalType ? "selected" : ""}>Vagina (Post-op)</option> <option value="penis (pre-op)" ${"penis (pre-op)" === l.physical?.genitalType ? "selected" : ""}>Penis (Pre-op)</option> </select> </div> <div> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Genital Size</label> <input type="text" id="confirmGenitalSize" value="${l.physical?.genitalSize || ""}" placeholder="e.g. average, large, tight" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> <div style="grid-column: span 2;"> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Grooming/Characteristics</label> <input type="text" id="confirmGenitalCharacteristics" value="${l.physical?.genitalCharacteristics || ""}" placeholder="e.g. well-groomed, natural, trimmed" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); font-size:0.85rem; box-sizing:border-box;"> </div> </div> </div> </details> </div> </details> <!-- Personality Axes + Voice (Pass 3) --> <details style="background:var(--f); border-radius:8px; margin-bottom:15px;"> <summary style="padding:10px 15px; cursor:pointer; color:var(--v); font-weight:600;">\u{1F4AB} Personality & Voice</summary> <div style="padding:0 15px 15px 15px;"> <div id="confirmAxesHost"></div> <div style="margin-bottom:8px;"> <label style="display:block; color:var(--a); font-size:0.75rem; margin-bottom:2px;">Humor (serious \u2194 humorous): <span id="confirmHumorVal" style="color:var(--m); font-weight:600;">${l.personality?.humor || 50}</span></label> <input type="range" id="confirmHumor" min="0" max="100" value="${l.personality?.humor || 50}" style="width:100%; accent-color:var(--g);"> </div> <div style="margin-top:10px;"> <label style="display:block; color:var(--m); font-size:0.8rem; margin-bottom:4px;">\u{1F5E3}\uFE0F Voice Override <span style="color:var(--e); font-weight:normal;">(how they speak \u2014 dialect/vocabulary; optional)</span></label> <textarea id="confirmVoiceOverride" rows="2" placeholder="e.g. speaks in clipped military jargon; warm Southern drawl" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b); resize:vertical; box-sizing:border-box; font-size:0.85rem;">${l.voice?.override || ""}</textarea> </div> </div> </details> <!-- Profile Image Generation --> <div style="background:var(--f); border-radius:8px; margin-bottom:15px; padding:15px;"> <div style="display:flex; align-items:center; gap:15px;"> <div id="profileImagePreview" style="width:100px; height:100px; border-radius:50%; background:var(--ad); border:3px solid var(--g); display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0;"> ${l.generatedProfileImage ? `<img src="${l.generatedProfileImage}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" alt="Generated profile">` : '<span style="color:var(--q); font-size:2rem;">\u{1F464}</span>'} </div> <div style="flex:1;"> <label style="display:block; color:var(--x); font-weight:600; margin-bottom:8px;">\u{1F4F8} Profile Image</label> <button id="generateProfileImageBtn" style="width:100%; padding:10px; background:linear-gradient(135deg, var(--x) 0%, var(--en) 100%); border:none; border-radius:6px; color:var(--q); cursor:pointer; font-weight:600;"> \u{1F3A8} ${l.generatedProfileImage ? "Regenerate" : "Generate"} Profile Image </button> <p style="color:var(--e); font-size:0.75rem; margin:6px 0 0 0;">Uses character details to create a matching portrait</p> </div> </div> <input type="hidden" id="generatedProfileImageUrl" value="${l.generatedProfileImage || ""}"> </div> <!-- Action Buttons --> <div style="display:flex; gap:10px; margin-top:20px;"> <button id="confirmHireBtn" style="flex:1; padding:12px; background:linear-gradient(135deg, var(--n) 0%, var(--u) 100%); border:none; border-radius:8px; color:var(--q); font-weight:bold; cursor:pointer; font-size:1rem;"> \u2705 Hire This Character </button> <button id="cancelConfirmBtn" style="flex:0 0 auto; padding:12px 20px; background:var(--ag); border:1px solid var(--r); border-radius:8px; color:var(--a); cursor:pointer;"> Cancel </button> </div> </div> </div> `, document.body.appendChild(a), ["Humor"].forEach((e2) => {
    const t2 = a.querySelector(`#confirm${e2}`), n2 = a.querySelector(`#confirm${e2}Val`);
    t2 && n2 && t2.addEventListener("input", () => {
      n2.textContent = t2.value;
    });
  });
  const u2 = l.personality && l.personality.axes && "object" == typeof l.personality.axes ? JSON.parse(JSON.stringify(l.personality.axes)) : "function" == typeof ys ? ys(l) : {};
  Kl(a.querySelector("#confirmAxesHost"), u2);
  const G2 = l.physical && l.physical.bio && "object" == typeof l.physical.bio ? JSON.parse(JSON.stringify(l.physical.bio)) : Nl(Il(l.race || "human")), U2 = a.querySelector("#confirmBiologyHost");
  Yl(U2, l.race || "human", G2);
  const c = a.querySelector("#confirmAge");
  c && c.addEventListener("change", () => {
    parseInt(c.value) < 18 && (c.value = 18);
  });
  const d = async (e2 = false) => {
    (e2 || await Ev('Close without hiring?\n\nYour generated character will be saved and can be recovered from the "Recover Last Character" button.', "Close Without Hiring?", { type: "warning", confirmText: "Close" })) && (lc = null, a.remove());
  };
  a.querySelector("#closeConfirmModal")?.addEventListener("click", () => d(false)), a.querySelector("#cancelConfirmBtn")?.addEventListener("click", () => d(false)), a.addEventListener("click", (e2) => {
    e2.target === a && d(false);
  });
  const p = (e2) => {
    "Escape" === e2.key && (e2.preventDefault(), d(false));
  };
  document.addEventListener("keydown", p);
  const m = new MutationObserver(() => {
    document.contains(a) || (document.removeEventListener("keydown", p), m.disconnect());
  });
  m.observe(document.body, { childList: true }), a.querySelector("#generateProfileImageBtn")?.addEventListener("click", async () => {
    const e2 = a.querySelector("#generateProfileImageBtn"), t2 = a.querySelector("#profileImagePreview"), n2 = a.querySelector("#generatedProfileImageUrl"), o2 = a.querySelector("#confirmGender")?.value || l.gender || "female", i2 = a.querySelector("#confirmRace")?.value?.trim() || "human", s2 = a.querySelector("#confirmEthnicity")?.value || "", r2 = a.querySelector("#confirmAge")?.value || l.age || 25, c2 = a.querySelector("#confirmHairColor")?.value?.trim() || l.physical?.hairColor || "brown", d2 = a.querySelector("#confirmHairStyle")?.value?.trim() || l.physical?.hairStyle || "medium length", p2 = a.querySelector("#confirmEyeColor")?.value?.trim() || l.physical?.eyeColor || "brown", m2 = a.querySelector("#confirmSkinTone")?.value?.trim() || l.physical?.skinTone || "fair", U3 = a.querySelector("#confirmBodyShape")?.value?.trim() || l.physical?.bodyShape || "average", g2 = a.querySelector("#confirmHeightBuild")?.value?.trim() || l.physical?.heightBuild || "average height";
    let h = "";
    "human" === i2 && s2 && (h = { caucasian: "Caucasian/European", black: "Black/African", latino: "Latino/Hispanic", eastAsian: "East Asian", "eastAsian-japanese": "Japanese", "eastAsian-chinese": "Chinese", "eastAsian-korean": "Korean", southeastAsian: "Southeast Asian", "southeastAsian-thai": "Thai", "southeastAsian-vietnamese": "Vietnamese", "southeastAsian-filipino": "Filipino", "southeastAsian-indonesian": "Indonesian", southAsian: "South Asian/Indian", centralAsian: "Central Asian", middleEastern: "Middle Eastern", pacificIslander: "Pacific Islander", "pacificIslander-hawaiian": "Hawaiian", "pacificIslander-samoan": "Samoan", "pacificIslander-maori": "M\u0101ori", nativeAmerican: "Native American", indigenous: "Indigenous Australian", mixed: "mixed ethnicity" }[s2] || s2);
    const J3 = (() => {
      const G3 = { personality: { axes: u2 } };
      return "function" == typeof bs && bs(G3), G3.personality;
    })(), y = J3.confidence || 50, f = J3.flirty || 50;
    let b = "neutral";
    y > 70 && (b = "confident"), f > 70 && (b = "flirty smirk"), (J3.professional || 50) > 70 && f < 50 && (b = "professional"), y > 70 && f > 70 && (b = "confident, seductive");
    const v = a.querySelector("#confirmAccessories")?.value?.trim() || "", ee2 = Il(i2), w = applyImageStyle(`portrait photo of a ${r2} year old ${("human" !== ee2 ? zl(ee2, { ...G2, gender: o2 }) : "") || `${h ? `${h}` : i2} ${o2}`}, ${c2} ${d2} hair, ${p2} eyes, ${m2} skin, ${U3} body type, ${g2}, ${b} expression${v && "none" !== v.toLowerCase() ? `, wearing ${v}` : ", no glasses, no accessories"}, professional headshot, office background, high quality, detailed face`);
    e2.disabled = true, e2.innerHTML = '<span style="display:inline-block; animation:rotate 1.5s linear infinite;">\u23F3</span> Generating...', t2.innerHTML = '<span style="color:var(--g); font-size:0.8rem;">Generating...</span>';
    try {
      const e3 = await queuedGenerateImage(w);
      if (!e3) throw new Error("No image URL returned");
      t2.innerHTML = `<img src="${e3}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" alt="Generated profile">`, n2.value = e3, oc && (oc.generatedProfileImage = e3), showNotification("\u2728 Profile image generated!", "success");
    } catch (e3) {
      console.error("Error generating profile image:", e3), t2.innerHTML = '<span style="color:var(--au); font-size:0.7rem;">Failed</span>', showNotification("Failed to generate image. Try again!", "error");
    }
    e2.disabled = false, e2.innerHTML = "\u{1F3A8} Generate Profile Image";
  });
  const J2 = a.querySelector("#confirmRace"), g = a.querySelector("#ethnicitySection");
  J2 && J2.addEventListener("change", () => {
    const e2 = J2.value;
    g && (g.style.display = "human" === Il(e2) ? "" : "none"), Wl(e2, G2), Yl(U2, e2, G2);
  }), a.querySelector("#confirmHireBtn")?.addEventListener("click", async () => {
    const e2 = a.querySelector("#confirmHireBtn");
    e2.disabled = true, e2.innerHTML = '<span style="display:inline-block; animation:rotate 1.5s linear infinite;">\u23F3</span> Creating...';
    try {
      const e3 = { name: a.querySelector("#confirmName")?.value?.trim() || l.name, age: parseInt(a.querySelector("#confirmAge")?.value) || l.age, gender: a.querySelector("#confirmGender")?.value || l.gender, race: Il(a.querySelector("#confirmRace")?.value || "human"), ethnicity: a.querySelector("#confirmEthnicity")?.value || null, bio: a.querySelector("#confirmBio")?.value?.trim() || l.bio, personalityTraits: (a.querySelector("#confirmTraits")?.value || "").split(",").map((e4) => e4.trim()).filter(Boolean), keyTrait: a.querySelector("#confirmKeyTrait")?.value?.trim() || l.keyTrait || null, hobbies: (a.querySelector("#confirmHobbies")?.value || "").split(",").map((e4) => e4.trim()).filter(Boolean), kinks: (a.querySelector("#confirmKinks")?.value || "").split(",").map((e4) => e4.trim()).filter(Boolean), personality: (() => {
        const G3 = { axes: JSON.parse(JSON.stringify(u2)), humor: parseInt(a.querySelector("#confirmHumor")?.value) || 50 };
        return "function" == typeof bs && bs({ personality: G3 }), G3;
      })(), voice: { override: a.querySelector("#confirmVoiceOverride")?.value?.trim() || "" }, physical: { bio: G2, hairColor: a.querySelector("#confirmHairColor")?.value?.trim() || l.physical?.hairColor || l.physical?.hair?.color, hairStyle: a.querySelector("#confirmHairStyle")?.value?.trim() || l.physical?.hairStyle || l.physical?.hair?.style, hairLength: a.querySelector("#confirmHairLength")?.value?.trim() || l.physical?.hairLength || l.physical?.hair?.length, hairTexture: a.querySelector("#confirmHairTexture")?.value?.trim() || l.physical?.hairTexture || l.physical?.hair?.texture, eyeColor: a.querySelector("#confirmEyeColor")?.value?.trim() || l.physical?.eyeColor || l.physical?.eyes?.color, eyeShape: a.querySelector("#confirmEyeShape")?.value?.trim() || l.physical?.eyeShape || l.physical?.eyes?.shape, skinTone: a.querySelector("#confirmSkinTone")?.value?.trim() || l.physical?.skinTone, bodyShape: a.querySelector("#confirmBodyShape")?.value?.trim() || l.physical?.bodyShape, heightBuild: a.querySelector("#confirmHeightBuild")?.value?.trim() || l.physical?.heightBuild, breastSize: a.querySelector("#confirmBreastSize")?.value?.trim() || l.physical?.breastSize, buttSize: a.querySelector("#confirmButtSize")?.value?.trim() || l.physical?.buttSize, fashion: a.querySelector("#confirmFashion")?.value?.trim() || l.physical?.fashion, accessories: a.querySelector("#confirmAccessories")?.value?.trim() || l.physical?.accessories, notableFeatures: a.querySelector("#confirmNotableFeatures")?.value?.trim() || l.physical?.notableFeatures, genitalType: a.querySelector("#confirmGenitalType")?.value || l.physical?.genitalType, genitalSize: a.querySelector("#confirmGenitalSize")?.value?.trim() || l.physical?.genitalSize, genitalCharacteristics: a.querySelector("#confirmGenitalCharacteristics")?.value?.trim() || l.physical?.genitalCharacteristics }, generatedProfileImage: a.querySelector("#generatedProfileImageUrl")?.value || null, pendingFamilyLink: l.pendingFamilyLink || null, existingPartnerInfo: l.existingPartnerInfo || null, nicknameForPlayer: a.querySelector("#confirmNicknameForPlayer")?.value?.trim() || null, sexualOrientation: a.querySelector("#confirmSexualOrientation")?.value || null, relationshipStatus: a.querySelector("#confirmRelationshipStatus")?.value || null, partnerName: a.querySelector("#confirmPartnerName")?.value?.trim() || null, partnerGender: a.querySelector("#confirmPartnerGender")?.value || null, partnerOccupation: a.querySelector("#confirmPartnerOccupation")?.value?.trim() || null, pets: (a.querySelector("#confirmPets")?.value || "").split(";").map((e4) => {
        const [t2, n3] = e4.split(":").map((e5) => e5?.trim());
        return t2 && n3 ? { name: t2, type: n3, giftedBy: null } : null;
      }).filter(Boolean) };
      lc && (e3.stats = lc.stats || e3.stats, e3.career = lc.career || e3.career, e3.customRace = e3.customRace || lc.customRace || null, e3.schedule = lc.schedule || null, e3.personality = { ...lc.personality || {}, ...e3.personality || {} }, e3.generatedProfileImage = e3.generatedProfileImage || lc.profileImage || null);
      const n2 = await fc(e3, t);
      n2 && (showNotification(`\u2728 Hired ${n2.name}!`, "success"), oc = null, rc = null, sc = null, d(true));
    } catch (u3) {
      console.error("Error finalizing character:", u3), showNotification("Failed to hire character. Please try again.", "error"), e2.disabled = false, e2.innerHTML = "\u2705 Hire This Character";
    }
  });
}
async function generateEmployeeFromUrl(e, t = "", n) {
  showNotification("\u{1F517} Fetching page content...", "info", 3e3);
  try {
    let n2 = "", a = "";
    try {
      const t2 = await fetch(e), o2 = await t2.text(), i2 = new DOMParser().parseFromString(o2, "text/html");
      a = i2.querySelector("title")?.textContent || "", i2.querySelectorAll("script, style, nav, footer, header, aside, .sidebar, #sidebar, .nav, .menu, .advertisement, .ad").forEach((e2) => e2.remove());
      const s2 = i2.querySelector("main, article, .content, .post-content, #content, .wiki-content, .mw-parser-output, .page-content, .entry-content");
      n2 = s2 ? s2.textContent.replace(/\s+/g, " ").trim() : i2.body?.textContent?.replace(/\s+/g, " ").trim() || "", n2 = n2.slice(0, 8e3);
    } catch (t2) {
      console.warn("Direct fetch failed, using basic URL info:", t2);
      const o2 = e.split("/").filter(Boolean), i2 = o2[o2.length - 1] || "";
      a = decodeURIComponent(i2).replace(/[_-]/g, " ").replace(/\(.*?\)/g, "").trim(), n2 = `Character from: ${e}
Name appears to be: ${a}`;
    }
    if (!n2 || n2.length < 50) throw new Error("Could not extract meaningful content from URL");
    showNotification("\u{1F916} Generating employee from page content...", "info", 5e3);
    const o = `Based on the following webpage content, create a game employee character. Extract personality, appearance, and background information.

PAGE CONTENT:
${n2.slice(0, 6e3)}

${t ? `ADDITIONAL INSTRUCTIONS: ${t}` : ""}

Create a detailed employee profile. Return ONLY a JSON object (no markdown, no explanation) with these fields:
{
  "name": "Full Name",
  "age": <number between 22-35>,
  "gender": "<female/male/female_futa/trans_woman/trans_man>",
  "bio": "<2-3 sentence background based on source material, adapted to office setting>",
  "personality": {
    "confidence": <10-90>,
    "outgoing": <10-90>,
    "flirty": <10-90>,
    "professional": <10-90>,
    "humor": <10-90>
  },
  "personalityTraits": ["trait1", "trait2", "trait3"],
  "hobbies": ["hobby1", "hobby2"],
  "kinks": ["preference1", "preference2"],
  "physical": {
    "hairColor": "color",
    "hairStyle": "style",
    "eyeColor": "color",
    "skinTone": "tone",
    "bodyShape": "shape",
    "heightBuild": "height and build description"
  }
}`, i = await queuedGenerateText(o, {}, "Custom Employee from URL");
    let s;
    try {
      const e2 = i.match(/\{[\s\S]*\}/);
      if (!e2) throw new Error("No JSON found in response");
      s = JSON.parse(e2[0]);
    } catch (e2) {
      throw console.error("Failed to parse AI response:", e2, i), new Error("AI returned invalid format");
    }
    return s;
  } catch (e2) {
    throw console.error("generateEmployeeFromUrl error:", e2), e2;
  }
}
async function generateEmployeeFromPrompt(e, t = "", n) {
  showNotification("\u{1F916} Generating employee from description...", "info", 5e3);
  try {
    const n2 = `Create a detailed game employee character based on this description:

DESCRIPTION: ${e}

${t ? `ADDITIONAL INSTRUCTIONS: ${t}` : ""}

Create a complete employee profile. Return ONLY a JSON object (no markdown, no explanation) with these fields:
{
  "name": "Full Name (make up a fitting name)",
  "age": <number between 22-35>,
  "gender": "<female/male/female_futa/trans_woman/trans_man - infer from description or default to female>",
  "bio": "<2-3 sentence background that fits the description, in an office/corporate setting>",
  "personality": {
    "confidence": <10-90>,
    "outgoing": <10-90>,
    "flirty": <10-90>,
    "professional": <10-90>,
    "humor": <10-90>
  },
  "personalityTraits": ["trait1", "trait2", "trait3"],
  "hobbies": ["hobby1", "hobby2"],
  "kinks": ["preference1", "preference2", "preference3"],
  "physical": {
    "hairColor": "color",
    "hairStyle": "style",
    "eyeColor": "color",
    "skinTone": "tone",
    "bodyShape": "shape",
    "heightBuild": "height and build description"
  }
}`, a = await queuedGenerateText(n2, {}, "Custom Employee from Description");
    let o;
    try {
      const e2 = a.match(/\{[\s\S]*\}/);
      if (!e2) throw new Error("No JSON found in response");
      o = JSON.parse(e2[0]);
    } catch (e2) {
      throw console.error("Failed to parse AI response:", e2, a), new Error("AI returned invalid format");
    }
    return o;
  } catch (e2) {
    throw console.error("generateEmployeeFromPrompt error:", e2), e2;
  }
}
async function createManualEmployee(e, t) {
  showNotification("\u2728 Creating custom employee...", "info", 3e3);
  try {
    const n = !e.name || !e.bio || 0 === e.personalityTraits.length || !e.physical.hair.color || 0 === e.hobbies.length;
    let a = JSON.parse(JSON.stringify(e));
    if (n) {
      showNotification("\u{1F916} AI is filling in missing details...", "info", 3e3);
      const t2 = [];
      if (e.name && t2.push(`Name: ${e.name}`), e.age && t2.push(`Age: ${e.age}`), e.gender && t2.push(`Gender: ${e.gender}`), e.race) if ("custom" === e.race && e.customRace?.name) {
        if (t2.push(`Race/Species: ${e.customRace.name} (Custom)`), e.customRace.details?.length > 0) {
          const n3 = e.customRace.details.filter((e2) => e2.name || e2.description).map((e2) => `${e2.name}: ${e2.description}`).join("; ");
          n3 && t2.push(`Custom Race Features: ${n3}`);
        }
      } else t2.push(`Race/Species: ${e.race}`);
      e.ethnicity && t2.push(`Ethnicity: ${e.ethnicity}`), e.bio && t2.push(`Bio: ${e.bio}`), e.personalityTraits.length > 0 && t2.push(`Traits: ${e.personalityTraits.join(", ")}`), e.hobbies.length > 0 && t2.push(`Hobbies: ${e.hobbies.join(", ")}`), e.kinks.length > 0 && t2.push(`Kinks: ${e.kinks.join(", ")}`), e.keyTrait && t2.push(`Key Trait: ${e.keyTrait}`), e.physical.hair.color && t2.push(`Hair: ${e.physical.hair.color} ${e.physical.hair.style || ""} ${e.physical.hair.length || ""}`), e.physical.eyes.color && t2.push(`Eyes: ${e.physical.eyes.color}`), e.physical.bodyShape && t2.push(`Body: ${e.physical.bodyShape}`), e.physical.skinTone && t2.push(`Skin: ${e.physical.skinTone}`), e.physical.accessories && t2.push(`Accessories: ${e.physical.accessories}`), e.physical.notableFeatures && t2.push(`Notable Features: ${e.physical.notableFeatures}`), e.ethnicity && e.ethnicity;
      const n2 = `Complete this employee profile by filling in ONLY the missing fields. Keep all existing data.

EXISTING DATA:
${t2.join("\n") || "None provided - create everything from scratch"}

PERSONALITY SETTINGS (use these exact values):
Confidence: ${e.personality.confidence}
Outgoing: ${e.personality.outgoing}
Flirty: ${e.personality.flirty}
Professional: ${e.personality.professional}
Humor: ${e.personality.humor}

Return ONLY a JSON object with the COMPLETE profile (including existing data):
{
  "name": "${e.name || "<generate a name appropriate for ethnicity if specified>"}",
  "age": ${e.age || "<22-35>"},
  "gender": "${e.gender || "female"}",
  "race": "${e.race || "human"}",
  "bio": "${e.bio || "<generate 2-3 sentence bio>"}",
  "personalityTraits": ${e.personalityTraits.length > 0 ? JSON.stringify(e.personalityTraits) : '["<trait1>", "<trait2>", "<trait3>"]'},
  "hobbies": ${e.hobbies.length > 0 ? JSON.stringify(e.hobbies) : '["<hobby1>", "<hobby2>"]'},
  "kinks": ${e.kinks.length > 0 ? JSON.stringify(e.kinks) : '["<pref1>", "<pref2>"]'},
  "keyTrait": "${e.keyTrait || "<trait>"}",
  "physical": {
    "hairColor": "${e.physical.hair.color || "<color>"}",
    "hairStyle": "${e.physical.hair.style || "<style>"}",
    "hairLength": "${e.physical.hair.length || "<length>"}",
    "eyeColor": "${e.physical.eyes.color || "<color>"}",
    "eyeShape": "${e.physical.eyes.shape || "<shape>"}",
    "skinTone": "${e.physical.skinTone || "<tone appropriate for ethnicity>"}",
    "bodyShape": "${e.physical.bodyShape || "<shape>"}",
    "heightBuild": "${e.physical.heightBuild || "<description>"}",
    "breastSize": "${e.physical.breastSize || "<size>"}",
    "buttSize": "${e.physical.buttSize || "<size>"}",
    "fashion": "${e.physical.fashion || "<style>"}",
    "accessories": "${e.physical.accessories || "<accessories or none>"}"
  }
}`, o2 = await queuedGenerateText(n2, {}, "Manual Employee AI Fill");
      try {
        const t3 = o2.match(/\{[\s\S]*\}/);
        if (t3) {
          const n3 = JSON.parse(t3[0]);
          a.name = e.name || n3.name, a.age = e.age || n3.age, a.gender = e.gender || n3.gender, a.race = e.race || n3.race, a.ethnicity = e.ethnicity, a.bio = e.bio || n3.bio, a.keyTrait = e.keyTrait || n3.keyTrait, a.personalityTraits = e.personalityTraits.length > 0 ? e.personalityTraits : n3.personalityTraits || [], a.hobbies = e.hobbies.length > 0 ? e.hobbies : n3.hobbies || [], a.kinks = e.kinks.length > 0 ? e.kinks : n3.kinks || [], n3.physical && (a.physical = { ...e.physical, hair: { color: e.physical.hair.color || n3.physical.hairColor || "brown", style: e.physical.hair.style || n3.physical.hairStyle || "medium length", length: e.physical.hair.length || n3.physical.hairLength || "medium" }, eyes: { color: e.physical.eyes.color || n3.physical.eyeColor || "brown", shape: e.physical.eyes.shape || n3.physical.eyeShape || "almond" }, skinTone: e.physical.skinTone || n3.physical.skinTone || "fair", bodyShape: e.physical.bodyShape || n3.physical.bodyShape || "average", heightBuild: e.physical.heightBuild || n3.physical.heightBuild || "5'6 average build", breastSize: e.physical.breastSize || n3.physical.breastSize || "medium", buttSize: e.physical.buttSize || n3.physical.buttSize || "medium", fashion: e.physical.fashion || n3.physical.fashion || "casual professional", accessories: e.physical.accessories || n3.physical.accessories || "", notableFeatures: e.physical.notableFeatures || "" });
        }
      } catch (e2) {
        console.warn("AI fill failed, using defaults:", e2);
      }
    }
    const o = { name: a.name, age: a.age, gender: a.gender, race: a.race, ethnicity: a.ethnicity, bio: a.bio, personality: a.personality, personalityTraits: a.personalityTraits, hobbies: a.hobbies, kinks: a.kinks, keyTrait: a.keyTrait, stats: a.stats, career: a.career, physical: { hairColor: a.physical.hair?.color, hairStyle: a.physical.hair?.style, hairLength: a.physical.hair?.length, eyeColor: a.physical.eyes?.color, eyeShape: a.physical.eyes?.shape, skinTone: a.physical.skinTone, bodyShape: a.physical.bodyShape, heightBuild: a.physical.heightBuild, breastSize: a.physical.breastSize, buttSize: a.physical.buttSize, fashion: a.physical.fashion, accessories: a.physical.accessories, notableFeatures: a.physical.notableFeatures }, personalLife: a.personalLife, schedule: a.schedule, startingFlags: a.startingFlags };
    return await fc(o, t);
  } catch (e2) {
    throw console.error("createManualEmployee error:", e2), e2;
  }
}
async function fc(e, t) {
  const n = gameState.products.find((e2) => e2.id === t);
  if (!n) throw new Error("Product not found");
  const a = { female_futa: "femaleFuta", trans_woman: "transWoman", trans_man: "transMan" }[o = e.gender] || o || wl();
  var o;
  let i = e.race || selectRaceForEmployee(), s = e.customRace || null;
  "custom" === i && s && s.name && (i = s.name);
  let r = null, l = null;
  if ("human" === i && e.ethnicity) if (e.ethnicity.includes("-")) {
    const t2 = e.ethnicity.split("-");
    r = t2[0], l = t2[1].charAt(0).toUpperCase() + t2[1].slice(1);
  } else r = e.ethnicity;
  const c = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34], d = { id: `emp_${Date.now()}_custom`, name: e.name || generateUniqueName(a, e.ethnicity || r, i), age: e.age || c[Math.floor(Math.random() * c.length)], gender: a, race: i, position: `Manager \u2013 ${n.name}`, productId: t, productManaged: n.name, personalityTraits: e.personalityTraits || ["Professional", "Dedicated", "Friendly"], keyTrait: e.keyTrait || e.personalityTraits?.[0] || "Dedicated", hobbies: e.hobbies || ["Reading", "Fitness"], kinks: e.kinks || ["Roleplay", "Teasing"], personality: { confidence: e.personality?.confidence ?? 50, outgoing: e.personality?.outgoing ?? 50, flirty: e.personality?.flirty ?? 50, professional: e.personality?.professional ?? 50, humor: e.personality?.humor ?? 50 }, stats: { affection: e.stats?.affection ?? bu("affection"), comfort: e.stats?.comfort ?? bu("comfort"), trust: e.stats?.trust ?? bu("trust"), desire: e.stats?.desire ?? bu("desire"), friendship: e.stats?.friendship ?? bu("friendship"), productivity: e.stats?.productivity ?? bu("productivity"), obedience: e.stats?.obedience ?? 10 }, giftPreferences: bl(), hired: true, onboarding: false, bioComplete: true, bio: e.bio || "A dedicated professional who brings energy to the workplace.", physical: ti(e.physical, a, i, e.ethnicity), profileImage: null, hireDate: Date.now(), employmentStatus: "active", locationId: n.locationId || "headquarters", career: { level: e.career?.level || 1, title: gameState.hierarchyLevels?.[e.career?.level || 1]?.title || "Staff", salary: e.career?.salary || gameState.hierarchyLevels?.[e.career?.level || 1]?.baseSalary || 1e5, startDate: Date.now(), promotionHistory: [], directReports: [], managerId: null }, skills: { technical: { level: 1 + Math.floor(3 * Math.random()), xp: 0, maxXp: 500 }, creative: { level: 1 + Math.floor(3 * Math.random()), xp: 0, maxXp: 500 }, social: { level: 1 + Math.floor(3 * Math.random()), xp: 0, maxXp: 500 }, management: { level: 1 + Math.floor(3 * Math.random()), xp: 0, maxXp: 500 }, intimate: { level: 0, xp: 0, maxXp: 500 }, cooking: { level: Math.floor(3 * Math.random()), xp: 0, maxXp: 500 }, fitness: { level: Math.floor(3 * Math.random()), xp: 0, maxXp: 500 } }, isRehire: false, fastTrack: false, previousLevel: null, previousTitle: null, timesRehired: 0, isCustomEmployee: true, nicknameForPlayer: e.nicknameForPlayer || null, customRace: s };
  if (e.career?.salary || (d.career.salary = getMarketRate(d)), s && s.details && s.details.length > 0) {
    const e2 = s.details.filter((e3) => e3.name || e3.description).map((e3) => e3.name && e3.description ? `${e3.name}: ${e3.description}` : e3.name || e3.description).join("; ");
    if (d.physical) {
      const t2 = d.physical.notableFeatures || "";
      d.physical.notableFeatures = t2 ? `${t2}; ${e2}` : e2, d.physical.raceFeatures = e2;
    }
  }
  if (e.physical) {
    e.physical.hairColor && (d.physical.hair = { ...d.physical.hair, color: e.physical.hairColor }), e.physical.hairStyle && (d.physical.hair = { ...d.physical.hair, style: e.physical.hairStyle }), e.physical.hairLength && (d.physical.hair = { ...d.physical.hair, length: e.physical.hairLength }), e.physical.hairTexture && (d.physical.hair = { ...d.physical.hair, texture: e.physical.hairTexture }), e.physical.eyeColor && (d.physical.eyes = { ...d.physical.eyes, color: e.physical.eyeColor }), e.physical.eyeShape && (d.physical.eyes = { ...d.physical.eyes, shape: e.physical.eyeShape }), e.physical.skinTone && (d.physical.skinTone = e.physical.skinTone, d.physical.skin && (d.physical.skin.tone = e.physical.skinTone, d.physical.skin.full = `${d.physical.skin.texture || "smooth"} ${e.physical.skinTone} skin`)), e.physical.bodyShape && (d.physical.bodyShape = e.physical.bodyShape), e.physical.heightBuild && (d.physical.heightBuild = e.physical.heightBuild), e.physical.breastSize && (d.physical.breastSize = e.physical.breastSize, d.physical.body && (d.physical.body.chestSize = e.physical.breastSize)), e.physical.buttSize && (d.physical.buttSize = e.physical.buttSize, d.physical.body && (d.physical.body.buttSize = e.physical.buttSize)), e.physical.fashion && (d.physical.fashion = e.physical.fashion), void 0 !== e.physical.accessories && "" !== e.physical.accessories && (d.physical.accessories = e.physical.accessories), e.physical.notableFeatures && (d.physical.notableFeatures = e.physical.notableFeatures), (e.physical.genitalType || e.physical.genitalSize || e.physical.genitalCharacteristics) && (d.physical.genitals = [{ type: e.physical.genitalType || "", size: e.physical.genitalSize || "", characteristics: e.physical.genitalCharacteristics || "", full: `${e.physical.genitalSize || "average"} ${e.physical.genitalType || "genitals"}, ${e.physical.genitalCharacteristics || "natural"}` }]);
    const t2 = d.physical.hair?.length || d.physical.hair?.style || "styled", n2 = d.physical.hair?.color || "dark", a2 = d.physical.eyes?.color || "brown", o2 = d.physical.skin?.tone || d.physical.skinTone || "fair", i2 = d.physical.body?.shape || d.physical.bodyShape || "average", s2 = d.physical.heightBuild || "average height", r2 = "male" === d.gender ? "man" : "femaleFuta" === d.gender ? "futa" : "woman";
    d.physical.shortDescription = `${s2} ${i2} ${r2} with ${t2} ${n2} hair, ${a2} eyes, ${o2} skin`;
  }
  if (e.schedule && (d.schedule = { workDays: e.schedule.workDays || [1, 2, 3, 4, 5], workStartHour: e.schedule.workStartHour ?? 9, workEndHour: e.schedule.workEndHour ?? 17, isCurrentlyWorking: false, lastClockIn: null, lastClockOut: null, hoursWorkedToday: 0, daysWorked: 0, lateDays: 0, ptoBalance: e.schedule.ptoBalance ?? 10, sickDays: 5, isOnLeave: false, leaveType: null, leaveEndDate: null }), e.personalLife && (d.personalLife || (d.personalLife = {}), e.personalLife.livingSituation && (d.personalLife.livingSituation = { type: e.personalLife.livingSituation, hasRoommate: "with-roommate" === e.personalLife.livingSituation, hasPet: e.personalLife.hasPet && "no" !== e.personalLife.hasPet, petType: e.personalLife.hasPet && "no" !== e.personalLife.hasPet ? e.personalLife.hasPet : null, petName: null, pets: [] }), e.personalLife.relationshipStatus && (d.personalLife.outsideContacts || (d.personalLife.outsideContacts = {}), d.personalLife.outsideContacts.relationshipStatus = e.personalLife.relationshipStatus, d.personalLife.outsideContacts.inRelationship = ["dating", "serious", "engaged", "married"].includes(e.personalLife.relationshipStatus)), e.personalLife.sexualOrientation && (d.personalLife.sexualOrientation = e.personalLife.sexualOrientation)), e.sexualOrientation && (d.personalLife || (d.personalLife = {}), d.personalLife.sexualOrientation = e.sexualOrientation), !d.personalLife?.sexualOrientation) {
    d.personalLife || (d.personalLife = {});
    const e2 = "female" === d.gender?.toLowerCase() || "femaleFuta" === d.gender || "transWoman" === d.gender, t2 = Math.random();
    d.personalLife.sexualOrientation = t2 < 0.75 ? "straight" : t2 < 0.85 ? "bisexual" : t2 < 0.92 ? e2 ? "lesbian" : "gay" : t2 < 0.99 ? "pansexual" : "asexual";
  }
  if (e.relationshipStatus) if (d.personalLife || (d.personalLife = {}), d.personalLife.outsideContacts || (d.personalLife.outsideContacts = {}), "single" === e.relationshipStatus) d.personalLife.outsideContacts.relationshipStatus = "single", d.personalLife.outsideContacts.inRelationship = false, d.personalLife.significantOther = null;
  else {
    d.personalLife.outsideContacts.relationshipStatus = e.relationshipStatus, d.personalLife.outsideContacts.inRelationship = true;
    const t2 = d.personalLife?.sexualOrientation || "straight";
    let n2 = e.partnerGender;
    if (!n2) {
      const e2 = "female" === d.gender?.toLowerCase() || "femaleFuta" === d.gender || "transWoman" === d.gender;
      n2 = "gay" === t2 ? "male" : "lesbian" === t2 ? "female" : "straight" === t2 ? e2 ? "male" : "female" : Math.random() < 0.5 ? "male" : "female";
    }
    const a2 = e.partnerName || generateUniqueName(n2), o2 = ["Teacher", "Accountant", "Engineer", "Nurse", "Lawyer", "Chef", "Artist", "Freelancer", "Manager", "Consultant", "Developer", "Designer", "Doctor", "Therapist", "Writer"], i2 = e.partnerOccupation || o2[Math.floor(Math.random() * o2.length)];
    let s2 = 1;
    "married" === e.relationshipStatus ? s2 = 2 + Math.floor(10 * Math.random()) : "engaged" === e.relationshipStatus ? s2 = 1 + Math.floor(4 * Math.random()) : "serious" === e.relationshipStatus ? s2 = 1 + Math.floor(3 * Math.random()) : "dating" === e.relationshipStatus && (s2 = Math.random() < 0.5 ? 0 : 1), d.personalLife.significantOther = { name: a2, gender: n2, relationshipType: e.relationshipStatus, occupation: i2, yearsTogether: s2, hasKids: "married" === e.relationshipStatus && Math.random() < 0.3 };
  }
  if (e.startingFlags && e.startingFlags.length > 0 && (d.flags || (d.flags = { systemFlags: [], customFlags: [] }), e.startingFlags.forEach((e2) => {
    d.flags.customFlags.includes(e2) || d.flags.customFlags.push(e2);
  })), e.pets && e.pets.length > 0 && (d.personalLife || (d.personalLife = {}), d.personalLife.livingSituation || (d.personalLife.livingSituation = { type: "apartment", pets: [] }), d.personalLife.livingSituation.pets = e.pets, d.personalLife.livingSituation.hasPet = true), gameState.usedEmployeeNames || (gameState.usedEmployeeNames = /* @__PURE__ */ new Set()), gameState.usedEmployeeNames.add(d.name), initializeEmployeeSocialData(d), ws(d), gameState.employees.push(d), e.pendingFamilyLink && e.pendingFamilyLink.relatedTo && e.pendingFamilyLink.relationship) {
    const t2 = gameState.employees.find((t3) => t3.id === e.pendingFamilyLink.relatedTo);
    t2 && (Xl(t2.id, d.id, e.pendingFamilyLink.relationship), "spouse" === e.pendingFamilyLink.relationship && (d.personalLife || (d.personalLife = {}), d.personalLife.significantOther = { name: t2.name, gender: t2.gender, relationshipType: "married", occupation: t2.position || "Employee", yearsTogether: e.existingPartnerInfo?.yearsTogether ?? 0, hasKids: e.existingPartnerInfo?.hasKids ?? false }), console.log(`[Family] Created ${e.pendingFamilyLink.relationship} relationship between ${t2.name} and ${d.name}`));
  }
  updateCompanyAwareness(), generateRandomRelationships(d.id), logCompanyEvent({ type: "hire", involvedEmployees: [d.id], location: d.locationId, description: `${d.name} was custom-hired as ${d.position}`, sentiment: "positive", importance: 7 }), n.managerHired = true, n.managerId = d.id, n.managerLevel = d.career.level, n.managerOnboarding = false;
  const p = d.career.level;
  let m = null;
  if (e.career?.selectedSlot) {
    const a2 = e.career.selectedSlot;
    if (m = gameState.corporatePyramid?.positions?.[a2.level]?.[a2.index], m && m.productId !== t) {
      const e2 = gameState.products.find((e3) => e3.id === m.productId);
      e2 && (d.productId = e2.id, d.productManaged = e2.name, d.position = `${gameState.hierarchyLevels?.[a2.level]?.title || "Manager"} \u2013 ${e2.name}`, n.managerHired = false, n.managerId = null, n.managerLevel = null, e2.managerHired = true, e2.managerId = d.id, e2.managerLevel = d.career.level);
    }
    console.log(`[Custom Employee] Using explicitly selected position slot: Level ${a2.level}, Index ${a2.index}`);
  } else m = gameState.corporatePyramid?.positions?.[p]?.find((e2) => e2.productId === n.id);
  if (m) {
    m.employeeId = d.id;
    const t2 = gameState.hierarchyLevels?.[m.level] || gameState.hierarchyLevels?.[1];
    t2 && (d.career.title = t2.title, e.career?.salary || (d.career.salary = t2.baseSalary));
  }
  if (e.generatedProfileImage) d.profileImage = e.generatedProfileImage, d.photos || (d.photos = []), d.photos.push({ url: e.generatedProfileImage, source: "profile", caption: "Initial profile picture", timestamp: Date.now() }), console.log("[Custom Employee] Using pre-generated profile image from confirmation modal");
  else {
    showNotification("\u{1F3A8} Generating profile image...", "info", 3e3);
    try {
      const e2 = buildEmployeeImagePrompt(d);
      if ("function" == typeof generateImage) {
        const t2 = await queuedGenerateImage(applyImageStyle(e2), `Profile Image - ${d.name}`);
        t2 && (d.profileImage = t2, d.photos || (d.photos = []), d.photos.push({ url: t2, source: "profile", caption: "Initial profile picture", timestamp: Date.now() }));
      }
    } catch (e2) {
      console.warn("Profile image generation failed:", e2);
    }
  }
  if (lc) {
    try {
      fb(d, lc);
    } catch (u2) {
      console.warn("[Import] skeleton overlay failed:", u2);
    }
    lc = null;
  }
  return generateFirstEmployeePost(d).catch((e2) => {
    console.warn("First post generation failed:", e2);
  }), updatePeopleTab(), updateProductsList(), saveGame(), console.log(`[Custom Employee] Created ${d.name} for ${n.name} at Level ${d.career.level}`), d;
}
function vc(e) {
  const t = ["Playful", "Reserved", "Confident", "Witty", "Thoughtful", "Cheeky", "Dry-humored", "Warm", "Ambitious", "Chill", "Inquisitive", "Loyal", "Optimistic", "Pessimistic", "Sarcastic", "Sincere", "Spontaneous", "Stoic", "Supportive", "Adventurous", "Cautious", "Curious", "Diligent", "Easygoing", "Energetic", "Focused", "Generous", "Humble", "Imaginative", "Meticulous", "Pragmatic", "Resourceful", "Sociable", "Tactful", "Versatile"], n = ["Charismatic", "Analytical", "Creative", "Detail-oriented", "Adaptable", "Empathetic", "Organized", "Bold", "Reliable", "Innovative", "Strategic", "Patient", "Decisive", "Collaborative", "Resilient", "Visionary", "Persuasive", "Curious", "Ambitious", "Supportive", "Meticulous", "Proactive", "Diligent", "Resourceful", "Versatile", "Submissive", "Dominant", "Flirty", "Shy", "Confident", "Caring", "Playful", "Serious", "Adventurous", "Loyal", "Spontaneous", "Thoughtful", "Cheeky", "Witty", "Warm", "Inquisitive"], a = ["Reading", "Photography", "Hiking", "Gaming", "Cooking", "Traveling", "Music", "Art", "Yoga", "Dancing", "Climbing", "Baking", "Thrifting", "Gardening", "Writing", "Cycling", "Swimming", "Crafting", "Meditation", "Volunteering", "Fishing", "Running", "Collecting", "Knitting", "Birdwatching", "Puzzles", "Board games", "Movies", "Theater", "Fitness", "Martial arts", "Skiing", "Snowboarding", "Surfing", "Skateboarding", "Camping", "Astronomy", "DIY projects", "Blogging", "Podcasting", "Learning languages", "Genealogy", "Magic tricks", "Robotics", "Woodworking", "Calligraphy", "Chess", "Travel blogging", "Vlogging", "Stand-up comedy", "Improv"], o = ["Roleplay", "Bondage", "Exhibitionism", "Voyeurism", "Dom/sub", "Praise", "Teasing", "Spanking", "Light impact", "Dirty talk", "Public play", "Costumes", "Sensory play", "Tickling", "Restraints", "Blindfolds", "Temperature play", "Massage", "Oral fixation", "Foot fetish", "Group play", "Cuddling", "Hair pulling", "Choking", "Anal play", "Threesomes", "Fantasies", "Power exchange", "Erotic humiliation", "Sensation play", "Mutual masturbation"], i = [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34], s = (e2, t2, n2) => {
    const a2 = Math.max(t2, Math.min(n2, Math.floor(Math.random() * (n2 - t2 + 1)) + t2)), o2 = /* @__PURE__ */ new Set();
    for (; o2.size < a2; ) o2.add(e2[Math.floor(Math.random() * e2.length)]);
    return [...o2];
  }, r = [], u2 = 3 + (gameState.globalUpgrades?.workforce?.recruiting || 0);
  for (let l = 0; l < u2; l++) {
    const c = wl(), d = selectRaceForEmployee(), p = "human" === d ? kl() : null, m = { id: `emp_${Date.now()}_${l}`, name: generateUniqueName(c, p, d), age: i[Math.floor(Math.random() * i.length)], gender: c, race: d, ethnicity: p, position: "Manager Candidate", productId: e, personalityTraits: s(t, 3, 5), keyTrait: n[Math.floor(Math.random() * n.length)], hobbies: s(a, 1, 2), kinks: s(o, 2, 4), personality: { confidence: 30 + Math.floor(50 * Math.random()), outgoing: 20 + Math.floor(60 * Math.random()), flirty: 10 + Math.floor(70 * Math.random()), professional: 30 + Math.floor(50 * Math.random()), humor: 20 + Math.floor(60 * Math.random()) }, stats: { affection: bu("affection"), comfort: bu("comfort"), trust: bu("trust"), desire: bu("desire"), friendship: bu("friendship"), productivity: bu("productivity") }, giftPreferences: bl(), hired: false, onboarding: true, bioComplete: false, productManaged: null, physical: { heightBuild: null, hair: { color: null, style: null, length: null }, eyes: { color: null, shape: null }, skinTone: null, bodyShape: null, breastSize: null, buttSize: null, fashion: null }, profileImage: null, bio: null, hireDate: Date.now(), career: { level: 1, title: "Staff", salary: 1e5, startDate: Date.now(), promotionHistory: [], directReports: [], managerId: null }, isRehire: false, fastTrack: false, previousLevel: null, previousTitle: null, timesRehired: 0 };
    r.push(m);
  }
  return r;
}
function bc(e, t) {
  e.socialData || initializeEmployeeSocialData(e), e.hireDate || (e.hireDate = Date.now()), e.employmentStatus = "active", e.locationId || (e.locationId = t.locationId || "headquarters", e.location = e.locationId), gameState.employees.push(e), updateCompanyAwareness(), generateRandomRelationships(e.id), logCompanyEvent({ type: "hire", involvedEmployees: [e.id], location: e.locationId || t.locationId || "headquarters", description: `${e.name} returned as ${e.position}`, sentiment: "positive", importance: 7 }), generateFirstEmployeePost(e).catch((e2) => {
    console.error("Welcome back post generation failed:", e2);
  }), t.managerHired = true, t.managerId = e.id, t.managerLevel = 1, t.managerOnboarding = false;
  const n = gameState.corporatePyramid.positions[1]?.find((e2) => e2.productId === t.id);
  if (n) {
    n.employeeId = e.id, e.productManaged = t.name;
    const a = gameState.hierarchyLevels[n.level] || gameState.hierarchyLevels[1], premium = Math.max(0, (e.career.salary || 0) - getMarketRate(e, e.career.level));
    e.career.level = n.level, e.career.title = a.title, e.career.salary = getMarketRate(e, n.level) + premium, console.log(`[Pyramid] Auto-assigned ${e.name} to ${n.title} - Career updated to ${e.career.title} (Level ${e.career.level})`);
  } else {
    Od();
    const n2 = gameState.corporatePyramid.positions[1]?.find((e2) => e2.productId === t.id);
    if (n2) {
      n2.employeeId = e.id, e.productManaged = t.name;
      const a = gameState.hierarchyLevels[n2.level] || gameState.hierarchyLevels[1], premium = Math.max(0, (e.career.salary || 0) - getMarketRate(e, e.career.level));
      e.career.level = n2.level, e.career.title = a.title, e.career.salary = getMarketRate(e, n2.level) + premium, console.log(`[Pyramid] Created and assigned ${e.name} to ${n2.title} - Career updated to ${e.career.title} (Level ${e.career.level})`);
    }
  }
  updatePeopleTab(), updateProductsList(), "dashboard" === gameState.activeTab && sd();
}
function wc(e) {
  return Math.min(0.5, 0.05 * e);
}
function xc(e) {
  if (!gameState.rehirePool || 0 === gameState.rehirePool.length) return [];
  const t = [...gameState.rehirePool].sort(() => Math.random() - 0.5);
  return t.slice(0, Math.min(e, t.length));
}
function finalizeRehire(e, t = 1) {
  const n = gameState.currentCandidates?.[e], a = n?.productId, o = gameState.products.find((e2) => e2.id === a);
  if (!n || !o) return void console.error("[Rehire] Invalid rehire data or product");
  if (!n.isRehire) return void console.error("[Rehire] Candidate is not marked as rehire");
  const u2 = Fu(o);
  if (gameState.cash < u2) return void showNotification("Not enough money to hire!", "error");
  gameState.cash -= u2;
  const i = { id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name: n.name, age: n.age, gender: n.gender, career: { level: t, title: gameState.hierarchyLevels[t].title, salary: gameState.hierarchyLevels[t].baseSalary, startDate: Date.now(), promotionHistory: [], directReports: [], managerId: null }, stats: { ...n.stats || {}, productivity: Math.min(100, (n.stats?.productivity ?? 50) * (1 + (n.rehireBonus ?? 0))) }, skills: n.skills ? JSON.parse(JSON.stringify(n.skills)) : {}, personality: { ...n.personality }, physical: { ...n.physical }, photos: n.photos ? JSON.parse(JSON.stringify(n.photos)) : [], profileImage: n.profileImage, bio: n.bio, memory: n.memory ? { ...n.memory } : {}, keyTrait: n.keyTrait, personalityTraits: n.personalityTraits ? [...n.personalityTraits] : [], hobbies: n.hobbies ? [...n.hobbies] : [], kinks: n.kinks ? [...n.kinks] : [], giftPreferences: n.giftPreferences, isRehire: true, fastTrack: true, previousLevel: n.previousLevel, previousTitle: n.previousTitle, timesRehired: (n.timesRehired || 0) + 1, productId: a, hired: true, onboarding: false, bioComplete: true, employmentStatus: "active", hireDate: Date.now() };
  n.chatHistory && n.chatHistory.length > 0 && (gameState.chatHistory[i.id] = [...n.chatHistory]), gameState.employees.push(i);
  const s = gameState.rehirePool.findIndex((e2) => e2.id === n.originalRehireId || e2.id === n.id);
  -1 !== s ? (gameState.rehirePool.splice(s, 1), console.log(`[Rehire] Removed ${i.name} from rehire pool (${gameState.rehirePool.length} remaining)`)) : console.warn(`[Rehire] Could not find ${i.name} in rehire pool to remove`), i.socialData || initializeEmployeeSocialData(i), Dd(), updateCompanyAwareness(), generateRandomRelationships(i.id), logCompanyEvent({ type: "hire", involvedEmployees: [i.id], location: o.locationId || "headquarters", description: `${i.name} returned as ${i.career.title}`, sentiment: "positive", importance: 8 }), kc(i, n), o.managerHired = true, o.managerId = i.id, o.managerLevel = 1, o.managerOnboarding = false, o.running = true;
  const r = gameState.corporatePyramid.positions[1]?.find((e2) => e2.productId === o.id);
  if (r) r.employeeId = i.id, i.productManaged = o.name, console.log(`[Pyramid] Auto-assigned ${i.name} to ${r.title}`);
  else {
    Od();
    const e2 = gameState.corporatePyramid.positions[1]?.find((e3) => e3.productId === o.id);
    e2 && (e2.employeeId = i.id, i.productManaged = o.name, console.log(`[Pyramid] Created and assigned ${i.name} to ${e2.title}`));
  }
  updatePeopleTab(), updateProductsList(), closeHiringModal(), showNotification(`\u2728 Welcome back, ${i.name}! Starting as ${i.career.title}`, "success"), console.log(`[Rehire] ${i.name} rehired at Level ${t} with ${Math.round(100 * n.rehireBonus)}% bonus`);
}
async function kc(e, t) {
  if (!e || !gameState.socialNetwork) return;
  const n = { "very close": "\u2764\uFE0F\u{1F495}", close: "\u{1F60A}\u{1F4BC}", friendly: "\u{1F44B}\u2728", professional: "\u{1F4BC}", distant: "\u{1F44B}" }[t.relationshipStrength] || "\u{1F4BC}", a = { id: `post_${++gameState.socialNetwork.postIdCounter}_${Date.now()}`, author: e.name, authorId: e.id, type: "work", category: "work", timestamp: gameState.time?.currentTime || Date.now(), contentType: "text", caption: `${n} I'm back! Excited to rejoin the team${e.fastTrack ? " and they've put me on the fast track! \u{1F680}" : "!"} Feels good to be home. @TheBoss let's do this! \u{1F4AA}`, likes: Math.floor(30 * Math.random()) + 15, comments: [], imageUrl: null, altText: null, hasImage: false, explicit: false };
  gameState.socialNetwork.posts.unshift(a), Fo(), gameState.socialNetwork.posts.length > CAPS.SOCIAL_POSTS && (gameState.socialNetwork.posts = gameState.socialNetwork.posts.slice(0, CAPS.SOCIAL_POSTS)), console.log(`[Welcome Back Post] Generated post for ${e.name}'s return`);
}
