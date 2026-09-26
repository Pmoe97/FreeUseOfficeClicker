// ============================================================================
// 19-appearance — Appearance/gender/race rendering: pools (oi), combo builders, card renderers, physical descriptions, getPhysicalDescriptionForPrompt.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function ti(e, t, n, a) {
  const o = ni(t, n, a);
  if (!e || 0 === Object.keys(e).length) return o;
  const i = (e2) => null != e2 && "" !== e2, s = { ...o };
  if (e.bio && "object" == typeof e.bio) {
    const u3 = Il(n || s.race || "human");
    s.bio = { ...Nl(u3), ...s.bio || {}, ...e.bio }, s.raceFeatures = ql(u3, s.bio);
  }
  if (i(e.hairColor) && (s.hairColor = e.hairColor, s.hair && (s.hair.color = e.hairColor)), i(e.hairStyle) && (s.hairStyle = e.hairStyle, s.hair && (s.hair.style = e.hairStyle)), i(e.hairLength) && (s.hairLength = e.hairLength, s.hair && (s.hair.length = e.hairLength)), i(e.eyeColor) && (s.eyeColor = e.eyeColor, s.eyes && (s.eyes.color = e.eyeColor)), i(e.eyeShape) && (s.eyeShape = e.eyeShape, s.eyes && (s.eyes.shape = e.eyeShape)), i(e.skinTone) && (s.skinTone = e.skinTone, s.skin && (s.skin.tone = e.skinTone)), i(e.bodyShape) && (s.bodyShape = e.bodyShape), i(e.heightBuild)) {
    s.heightBuild = e.heightBuild;
    const t2 = e.heightBuild.split(/[,\s]+/);
    t2.length >= 2 && (s.height = t2[0], s.build = t2.slice(1).join(" "));
  }
  i(e.breastSize) && (s.breastSize = e.breastSize, s.body && (s.body.chestSize = e.breastSize)), i(e.buttSize) && (s.buttSize = e.buttSize, s.body && (s.body.buttSize = e.buttSize)), i(e.fashion) && (s.fashion = e.fashion), i(e.accessories) && (s.accessories = e.accessories), i(e.notableFeatures) && (s.distinguishingFeature = e.notableFeatures, s.notableFeatures = e.notableFeatures);
  const r = `${s.hairLength || ""} ${s.hairTexture || ""} ${s.hairColor || ""} hair`.trim(), l = `${s.eyeShape || ""} ${s.eyeColor || ""} eyes`.trim(), c = `${s.skinTexture || ""} ${s.skinTone || ""} skin`.trim(), d = "male" === t || "transMan" === t ? "man" : "woman";
  s.shortDescription = `${s.height || "average"} ${s.build || "average"} ${d} with ${r}, ${l}, ${c}`;
  const p = i(s.bodyShape) ? `${s.bodyShape} body shape` : `${s.build || "average"} build`, m = i(s.breastSize) ? `, ${s.breastSize} chest` : "", u2 = i(s.buttSize) ? `, ${s.buttSize} rear` : "";
  return s.fullDescription = `${s.height || "average"} ${s.build || "average"} ${d} with ${r} (${s.hairStyle || "natural"}), ${l}, ${c}. ${p}${m}${u2}. ${s.distinguishingFeature || ""} Style: ${s.fashion || "professional"}.`, s;
}
function ni(e = "female", t = "human", n = null) {
  let a, o, i, s, r;
  a = "male" === e || "transMan" === e ? ["lean", "slim", "athletic", "average", "stocky", "broad-shouldered", "muscular", "toned", "sturdy", "wiry"] : ["slender", "slim", "athletic", "average", "curvy", "voluptuous", "muscular", "toned"], "male" === e ? (o = ["athletic", "lean", "muscular", "stocky", "broad-shouldered", "rectangular", "V-shaped", "swimmer's build"], i = "chest", s = ["flat", "toned", "well-defined", "muscular", "broad", "barrel-chested"], r = ["flat", "toned", "athletic", "round", "muscular"]) : "transMan" === e ? (o = ["athletic", "lean", "rectangular", "androgynous", "toned", "muscular"], i = "chest", s = ["flat", "compact", "athletic", "toned", "bound", "masculine"], r = ["compact", "toned", "athletic", "round", "firm"]) : "femaleFuta" === e ? (o = ["hourglass", "athletic", "curvy", "statuesque", "amazonian", "voluptuous", "toned"], i = "bust", s = ["medium", "full", "large", "very full", "impressive", "ample"], r = ["round", "full", "curvy", "prominent", "shapely"]) : (o = ["hourglass", "pear-shaped", "athletic", "rectangular", "inverted triangle", "petite hourglass", "curvy", "willowy", "statuesque"], i = "bust", s = ["small", "modest", "medium", "full", "large", "very full"], r = ["small", "modest", "round", "full", "curvy", "prominent"]);
  const l = (e2) => e2[Math.floor(Math.random() * e2.length)];
  let c, d, p;
  "male" === e ? (c = "penis", d = l(["small", "average", "above average", "large", "very large"]), p = l(["circumcised", "uncircumcised", "well-groomed", "natural", "trimmed"])) : "transMan" === e ? (c = l(["enlarged clitoris", "post-op penis", "pre-op anatomy"]), d = l("post-op penis" === c ? ["average", "above average", "large"] : ["small", "moderate", "prominent"]), p = l(["well-groomed", "natural", "trimmed", "maintained"])) : "femaleFuta" === e ? (c = "penis and vagina", d = l(["average", "above average", "large", "very large", "impressive"]), p = l(["circumcised", "uncircumcised", "well-groomed", "natural", "dual anatomy"])) : "transWoman" === e ? (c = l(["vagina (post-op)", "penis (pre-op)", "tucked"]), d = c.includes("penis") ? l(["small", "average", "above average"]) : l(["tight", "normal", "accommodating"]), p = l(["well-groomed", "laser-treated", "smooth", "maintained", "natural"])) : (c = "vagina", d = l(["tight", "normal", "accommodating", "petite", "average"]), p = l(["well-groomed", "waxed", "trimmed", "natural", "shaved", "landing strip"]));
  const m = l(["petite", "short", "average height", "tall", "very tall"]), u2 = l(a);
  let g = l(["platinum blonde", "golden blonde", "honey blonde", "ash blonde", "strawberry blonde", "light brown", "chestnut brown", "dark brown", "chocolate brown", "auburn", "copper red", "ginger", "burgundy", "jet black", "raven black", "dark black with blue sheen", "silver-gray", "salt and pepper"]);
  const h = l(["straight", "wavy", "curly", "tight curls", "beach waves", "loose curls", "pin-straight", "naturally wavy", "tousled", "messy waves"]), y = l(["pixie cut", "short bob", "chin-length bob", "shoulder-length", "mid-back length", "waist-length", "very long"]);
  let f = l(["fine", "thick", "medium", "voluminous", "silky"]), b = l(["bright blue", "deep blue", "ocean blue", "ice blue", "steel blue", "emerald green", "jade green", "hazel green", "olive green", "dark brown", "amber brown", "honey brown", "chocolate brown", "hazel with green flecks", "hazel with gold flecks", "gray", "stormy gray", "gray-blue", "unusual violet", "heterochromic (one blue, one brown)"]), v = l(["almond-shaped", "round", "hooded", "upturned", "downturned", "doe eyes", "cat eyes", "deep-set", "wide-set", "close-set"]), w = l(["oval", "round", "heart-shaped", "square", "diamond", "long"]), x = l(["button nose", "straight nose", "slightly upturned nose", "roman nose", "ski-slope nose", "aquiline nose", "petite nose", "prominent nose"]);
  const S = l(["full lips", "thin lips", "heart-shaped lips", "bow-shaped lips", "plump lips", "pouty lips", "balanced lips", "wide lips"]), k = l(["high cheekbones", "prominent cheekbones", "soft cheekbones", "defined cheekbones", "subtle cheekbones", "angular cheekbones"]), T = l(["soft jawline", "defined jawline", "strong jawline", "delicate jawline", "angular jawline", "rounded jawline", "sharp jawline"]);
  let C = l(["porcelain", "fair", "light", "light-medium", "beige", "olive", "tan", "medium", "golden brown", "caramel", "bronze", "deep brown", "dark brown", "ebony", "rich mahogany"]);
  const E = l(["smooth", "flawless", "clear", "glowing", "radiant", "matte", "dewy", "sun-kissed", "naturally luminous"]), $2 = l(o), I = l(s), M = l(r), P = l(["long legs", "proportionate legs", "toned legs", "athletic legs", "shapely legs", "slender legs", "muscular legs"]), A = l(["business professional", "smart casual", "trendy", "classic elegant", "minimalist chic", "bohemian", "edgy modern", "preppy", "casual comfortable", "sophisticated", "artsy", "sporty chic"]), N = l(["often wears glasses", "statement earrings", "delicate jewelry", "minimalist accessories", "watches", "scarves", "no accessories"]), L = l(["dimples when smiling", "freckles across nose", "beauty mark", "gap-toothed smile", "striking eyes", "expressive face", "mysterious aura", "warm smile", "confident posture", "graceful movements", "energetic presence", "calm demeanor"]);
  let _ = null, R = null, D = null;
  if (!t || "human" === t) {
    if (_ = n || kl(), R = Sl(_), n && n.includes("-")) {
      const e2 = n.split("-");
      _ = e2[0], D = e2[1].charAt(0).toUpperCase() + e2[1].slice(1), R = Sl(_), R.subType = D;
    }
    C = R.skinTone, b = R.eyeColor, g = R.hairColor, v = R.eyeShape, R.hairTexture && (f = R.hairTexture), R.noseType && (x = R.noseType), R.faceShape && (w = R.faceShape);
  }
  const F = "male" === e || "transMan" === e ? "man" : "woman", G2 = Il(t || "human"), U2 = _l(G2, e), J2 = ql(G2, U2), B = "human" !== G2 ? J2.description + " " : "", O = R?.description ? R.description + " " : "", q = B || O, z = J2.build || u2;
  let j = C;
  J2.skin && (j = J2.skin);
  let H = b;
  J2.eyes && (H = J2.eyes);
  const ee2 = [];
  J2.ears && ee2.push(J2.ears), J2.tail && ee2.push(J2.tail), J2.fur && ee2.push(J2.fur), J2.furPattern && ee2.push(J2.furPattern), J2.horns && ee2.push(J2.horns), J2.wings && ee2.push(J2.wings), J2.skin && "human" !== G2 && ee2.push(J2.skin), J2.eyes && ee2.push(J2.eyes), J2.other.length > 0 && ee2.push(...J2.other);
  const Y = ee2.length > 0 ? ` Race features: ${ee2.join(", ")}.` : "", W = `${$2} physique with ${"chest" === i ? I + " chest" : I + " " + i}, ${M} bottom, ${P}`;
  return { height: m, build: z, gender: e, race: G2, ethnicity: _, ethnicityFeatures: R, raceFeatures: J2, bio: U2, heightBuild: `${m}, ${z}`, hair: { color: g, style: h, length: y, texture: f, full: `${y} ${f} ${g} hair, ${h}` }, eyes: { color: H, shape: v, full: `${v} ${H} eyes` }, face: { shape: w, nose: x, lips: S, cheekbones: k, jawline: T, full: `${w} face with ${x}, ${S}, ${k}, ${T}` }, skin: { tone: j, texture: E, full: `${E} ${j} skin` }, body: { shape: $2, chestDescriptor: i, chestSize: I, breastSize: I, buttSize: M, legs: P, full: W }, genitals: "femaleFuta" === e ? (() => {
    const vs = l(["tight", "average", "accommodating"]), u3 = l(["well-groomed", "waxed", "natural", "shaved"]);
    return [{ type: "penis", size: d, characteristics: p, full: `${d} penis, ${p}` }, { type: "vagina", size: vs, characteristics: u3, full: `${vs} vagina, ${u3}` }];
  })() : [{ type: c, size: d, characteristics: p, full: `${d} ${c}, ${p}` }], fashion: A, accessories: N, distinguishingFeature: L, shortDescription: `${m} ${z} ${q}${F} with ${y} ${g} hair, ${H} eyes, ${j} skin`, fullDescription: `${m} ${z} ${q}${F}${R ? ` (${R.description}${R.subType ? " - " + R.subType : ""})` : ""} with ${y} ${f} ${g} hair (${h}), ${v} ${H} eyes, ${E} ${j} skin. ${w} face with ${x}, ${S}, ${k}, ${T}.${Y} ${W}. Genitals: ${d} ${c}, ${p}. ${L}. Style: ${A}.` };
}
const oi = { hairColor: ["black", "jet black", "dark brown", "brown", "chestnut", "auburn", "red", "ginger", "strawberry blonde", "blonde", "platinum blonde", "dirty blonde", "honey blonde", "light brown", "ash brown", "silver", "gray", "white", "blue", "teal", "green", "purple", "lavender", "pink", "rose gold", "crimson", "burgundy", "copper", "caramel", "ombre", "two-tone", "rainbow"], hairStyle: ["straight", "wavy", "curly", "coily", "tousled", "slicked back", "ponytail", "high ponytail", "braided", "french braid", "twin braids", "bun", "messy bun", "top knot", "bob", "pixie cut", "undercut", "shaved sides", "mohawk", "afro", "dreadlocks", "cornrows", "layered", "with bangs", "side-swept bangs", "space buns", "half-up", "loose"], hairLength: ["bald", "buzzed", "very short", "short", "chin-length", "shoulder-length", "medium", "long", "very long", "waist-length", "hip-length"], hairTexture: ["fine", "silky", "thick", "coarse", "wavy", "curly", "kinky", "frizzy", "smooth", "glossy"], eyeColor: ["brown", "dark brown", "light brown", "hazel", "amber", "green", "emerald", "blue", "ice blue", "sky blue", "gray", "steel gray", "violet", "heterochromatic", "black", "golden", "red", "pink"], eyeShape: ["almond", "round", "hooded", "monolid", "upturned", "downturned", "wide-set", "close-set", "deep-set", "cat-like", "doe-eyed"], skinTone: ["porcelain", "fair", "light", "ivory", "beige", "olive", "tan", "golden", "bronze", "caramel", "brown", "deep brown", "ebony", "dark", "sun-kissed", "pale", "rosy"], skinTexture: ["smooth", "soft", "flawless", "freckled", "weathered", "glowing", "dewy", "matte"], faceShape: ["oval", "round", "square", "heart-shaped", "diamond", "oblong", "triangular", "rectangular", "angular", "soft"], nose: ["small button nose", "straight nose", "aquiline nose", "upturned nose", "wide nose", "narrow nose", "rounded nose", "refined nose", "roman nose", "petite nose"], lips: ["full lips", "plump lips", "thin lips", "heart-shaped lips", "wide lips", "bow-shaped lips", "pouty lips", "soft lips", "defined lips"], cheekbones: ["high cheekbones", "defined cheekbones", "soft cheekbones", "prominent cheekbones", "subtle cheekbones", "sharp cheekbones", "rounded cheeks"], jawline: ["sharp jawline", "defined jawline", "soft jawline", "square jawline", "rounded jawline", "delicate jawline", "strong jawline", "tapered jawline"], bodyShape: ["hourglass", "pear-shaped", "apple-shaped", "rectangular", "inverted triangle", "athletic", "curvy", "voluptuous", "petite", "slender", "willowy", "statuesque", "muscular", "stocky", "lean", "V-shaped", "broad-shouldered", "average"], height: ["very short", "short", "petite", "below average", "average height", "above average", "tall", "very tall", "statuesque"], build: ["slim", "slender", "lean", "petite", "athletic", "toned", "fit", "curvy", "voluptuous", "muscular", "stocky", "sturdy", "broad-shouldered", "soft", "average", "wiry"], chestSizeFemale: ["flat", "small", "modest", "medium", "full", "large", "very full", "ample", "busty"], chestSizeMale: ["flat", "toned", "defined", "muscular", "broad", "barrel-chested"], buttSize: ["flat", "small", "modest", "average", "round", "full", "curvy", "prominent", "bubble", "thick"], legs: ["slim legs", "toned legs", "athletic legs", "long legs", "shapely legs", "muscular legs", "thick thighs", "slender legs"], fashion: ["business professional", "business casual", "smart casual", "casual", "trendy", "streetwear", "sporty", "goth", "punk", "preppy", "bohemian", "elegant", "glamorous", "minimalist", "vintage", "edgy", "cute", "sophisticated", "provocative", "modest", "alternative"], accessories: ["none", "minimalist jewelry", "stud earrings", "hoop earrings", "necklace", "choker", "glasses", "reading glasses", "sunglasses", "watch", "bracelets", "rings", "hair clips", "headband", "scarf", "tie", "statement earrings"], distinguishingFeature: ["freckles across nose", "beauty mark", "dimples when smiling", "gap-toothed smile", "mole on cheek", "scar over eyebrow", "birthmark", "striking eyes", "heart-shaped birthmark", "sharp features", "soft features", "cleft chin", "strong brow"], piercingLocation: ["ears", "earlobes", "double lobe", "helix", "industrial", "tragus", "septum", "nostril", "eyebrow", "lip", "labret", "tongue", "navel", "nipples"], piercingType: ["stud", "hoop", "ring", "barbell", "captive bead ring", "horseshoe", "dangle", "gauge"], tattooLocation: ["left shoulder", "right shoulder", "upper back", "lower back", "left forearm", "right forearm", "left wrist", "right wrist", "ribcage", "thigh", "ankle", "neck", "chest", "hip", "behind ear", "full sleeve"], tattooStyle: ["fine line", "traditional", "neo-traditional", "blackwork", "watercolor", "tribal", "script/lettering", "floral", "geometric", "realism", "minimalist", "japanese"] }, ii = ["confident", "shy", "outgoing", "introverted", "ambitious", "laid-back", "flirty", "reserved", "sarcastic", "sweet", "bubbly", "serious", "playful", "caring", "competitive", "sassy", "gentle", "bold", "witty", "nurturing", "stubborn", "easygoing", "perfectionist", "rebellious", "loyal", "mischievous", "intellectual", "dramatic", "optimistic", "cynical", "empathetic", "blunt", "charming", "awkward", "passionate", "calm", "energetic", "moody", "cheerful", "mysterious"], ri = ["reading", "gaming", "yoga", "running", "cooking", "baking", "painting", "drawing", "photography", "hiking", "gardening", "dancing", "singing", "playing guitar", "piano", "gym/fitness", "swimming", "cycling", "knitting", "writing", "traveling", "movies", "anime", "fashion", "makeup", "collecting", "pottery", "rock climbing", "martial arts", "meditation", "volunteering", "wine tasting", "coffee", "board games", "skateboarding", "surfing", "skiing", "journaling", "astronomy"], si = ["roleplay", "dominance", "submission", "teasing", "exhibitionism", "voyeurism", "praise", "degradation", "bondage", "spanking", "public play", "dirty talk", "sensory play", "edging", "worship", "power exchange", "brat taming", "caregiver dynamics", "sensation play", "massage"];
function ci(g) {
  const c = dr(g);
  return "male" === c || "transMan" === c ? oi.chestSizeMale : oi.chestSizeFemale;
}
function di(g) {
  const c = dr(g);
  return "male" === c ? ["penis"] : "transMan" === c ? ["enlarged clitoris", "pre-op anatomy", "post-op penis"] : "femaleFuta" === c ? ["penis and vagina", "penis"] : "transWoman" === c ? ["vagina (post-op)", "penis (pre-op)", "tucked"] : ["vagina"];
}
function pi(type) {
  const m = String(type || "").toLowerCase();
  return m.includes("penis") && !m.includes("vagina") ? ["small", "modest", "average", "above average", "large", "very large"] : "penis and vagina" === m ? ["average", "above average", "large", "very large", "impressive"] : m.includes("vagina") || "pre-op anatomy" === m ? ["tight", "snug", "average", "relaxed", "accommodating"] : "enlarged clitoris" === m ? ["slightly enlarged", "noticeably enlarged", "significantly enlarged"] : ["average"];
}
function yi(type) {
  const m = String(type || "").toLowerCase();
  return m.includes("penis") && !m.includes("vagina") ? ["circumcised", "uncircumcised", "veiny", "thick", "curved"] : "penis and vagina" === m ? ["fully functional dual anatomy", "prominent dual features"] : m.includes("vagina") || "pre-op anatomy" === m ? ["waxed smooth", "neatly trimmed", "natural", "fully shaved", "landing strip", "shaped"] : "enlarged clitoris" === m ? ["sensitive and prominent", "HRT-enhanced"] : "tucked" === m ? ["carefully tucked", "HRT-softened"] : ["natural"];
}
function bi(options) {
  return (options || []).map((o) => `<span class="combo-opt" style="display:block; padding:6px 9px; cursor:pointer; color:var(--b); font-weight:400;">${String(o).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")}</span>`).join("");
}
function wi(options) {
  return `<span class="combo-menu" style="display:none; position:absolute; left:0; right:0; top:100%; z-index:100060; max-height:180px; overflow-y:auto; background:var(--h); border:1px solid var(--m); border-radius:4px; box-shadow:0 6px 16px var(--fa);">${bi(options)}</span>`;
}
function xi(input, options) {
  if (!input || input.closest(".combo-wrap")) return;
  input.classList.add("combo-input"), input.setAttribute("autocomplete", "off");
  const wrap = document.createElement("span");
  wrap.className = "combo-wrap", wrap.style.cssText = "position:relative; display:block;", input.parentNode.insertBefore(wrap, input), wrap.appendChild(input);
  const u2 = document.createElement("div");
  u2.innerHTML = wi(options), wrap.appendChild(u2.firstElementChild);
}
function ki(id, value, options, placeholder) {
  const u2 = document.getElementById(id);
  if (!u2) return;
  const parent = u2.parentElement, G2 = parent.innerHTML, v = null != value ? String(value).replace(/"/g, "&quot;") : "";
  return parent.innerHTML = ` <span class="combo-wrap" style="position:relative; display:block;"><input id="${id}" class="combo-input" value="${v}" placeholder="${placeholder || "Type or pick\u2026"}" autocomplete="off" style="width:100%; padding:6px; background:var(--h); border:1px solid var(--m); border-radius:4px; color:var(--m); font-weight:600;">${wi(options)}</span> `, G2;
}
function Ti(id, label, options, value, placeholder) {
  return `<div> <label style="display:block; margin-bottom:6px; color:var(--a); font-size:0.85rem;">${label}</label> <span class="combo-wrap" style="position:relative; display:block;"><input id="${id}" class="combo-input" value="${null != value ? String(value).replace(/"/g, "&quot;") : ""}" placeholder="${placeholder || ""}" autocomplete="off" style="width:100%; padding:10px; background:var(--i); border:1px solid var(--t); border-radius:6px; color:var(--b);">${wi(options)}</span> </div>`;
}
function $i(u2, value, options, placeholder) {
  return `<span class="combo-wrap" style="position:relative; display:block;"><input class="${u2} combo-input" value="${null != value ? String(value).replace(/"/g, "&quot;") : ""}" placeholder="${placeholder || ""}" autocomplete="off" style="width:100%; padding:6px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b);">${wi(options)}</span>`;
}
function Ci(item, gender) {
  return `<div class="struct-card" data-genital-card style="display:grid; grid-template-columns:1fr 1fr 1.2fr auto; gap:8px; align-items:end; margin-bottom:8px; padding:8px; background:var(--h); border:1px solid var(--o); border-radius:6px;"> <div><label style="font-size:.7rem; color:var(--a);">Type</label>${$i("g-type", (item = item || {}).type, di(gender), "type")}</div> <div><label style="font-size:.7rem; color:var(--a);">Size</label>${$i("g-size", item.size, pi(item.type), "size")}</div> <div><label style="font-size:.7rem; color:var(--a);">Details</label>${$i("g-char", item.characteristics, yi(item.type), "details")}</div> <button type="button" data-act="struct-remove" style="background:var(--l); border:none; border-radius:4px; color:var(--s); padding:8px 10px; cursor:pointer;">\u2796</button> </div>`;
}
function Ei(item) {
  return `<div class="struct-card" data-piercing-card style="display:grid; grid-template-columns:1fr 1fr 1.4fr auto; gap:8px; align-items:end; margin-bottom:8px; padding:8px; background:var(--h); border:1px solid var(--o); border-radius:6px;"> <div><label style="font-size:.7rem; color:var(--a);">Location</label>${$i("p-loc", (item = item || {}).location, oi.piercingLocation, "location")}</div> <div><label style="font-size:.7rem; color:var(--a);">Type</label>${$i("p-type", item.type, oi.piercingType, "type")}</div> <div><label style="font-size:.7rem; color:var(--a);">Detail</label>${$i("p-desc", item.description, [], "e.g. gold hoop")}</div> <button type="button" data-act="struct-remove" style="background:var(--l); border:none; border-radius:4px; color:var(--s); padding:8px 10px; cursor:pointer;">\u2796</button> </div>`;
}
function Ii(item) {
  return `<div class="struct-card" data-tattoo-card style="display:grid; grid-template-columns:1fr 1.4fr 1fr auto; gap:8px; align-items:end; margin-bottom:8px; padding:8px; background:var(--h); border:1px solid var(--o); border-radius:6px;"> <div><label style="font-size:.7rem; color:var(--a);">Location</label>${$i("t-loc", (item = item || {}).location, oi.tattooLocation, "location")}</div> <div><label style="font-size:.7rem; color:var(--a);">Description</label>${$i("t-desc", item.description, [], "e.g. rose, dragon")}</div> <div><label style="font-size:.7rem; color:var(--a);">Style</label>${$i("t-style", item.style, oi.tattooStyle, "style")}</div> <button type="button" data-act="struct-remove" style="background:var(--l); border:none; border-radius:4px; color:var(--s); padding:8px 10px; cursor:pointer;">\u2796</button> </div>`;
}
function Pi(item) {
  return `<div class="struct-card" data-feature-card style="display:flex; gap:8px; margin-bottom:6px;">${$i("f-val", item && null != item.value ? item.value : "string" == typeof item ? item : "", oi.distinguishingFeature, "feature")}<button type="button" data-act="struct-remove" style="background:var(--l); border:none; border-radius:4px; color:var(--s); padding:8px 10px; cursor:pointer;">\u2796</button></div>`;
}
function Ni(v) {
  const s = String(v).replace(/"/g, "&quot;");
  return `<span class="tag-chip" data-tag="${s}" style="display:inline-flex; align-items:center; gap:4px; background:var(--h); border:1px solid var(--d); border-radius:14px; padding:3px 10px; color:var(--d); font-size:.85rem;">${s}<button type="button" data-act="tag-remove" style="background:none; border:none; color:var(--k); cursor:pointer; font-size:1rem; line-height:1;">\xD7</button></span>`;
}
const _i = "background:var(--n); border:none; border-radius:4px; color:var(--q); font-weight:600; padding:6px 12px; cursor:pointer; margin-top:4px;";
function Ri(u2, G2, gender) {
  const g = dr(gender);
  return `<div id="${u2}">${(G2 || []).map((x) => Ci(x, g)).join("")}</div> <button type="button" data-act="genital-add" data-target="${u2}" data-gender="${g}" style="${_i}">\u2795 Add genital set</button>`;
}
function Di(u2, G2) {
  return `<div id="${u2}">${(G2 || []).map(Ei).join("")}</div> <button type="button" data-act="struct-add" data-target="${u2}" data-kind="piercing" style="${_i}">\u2795 Add piercing</button>`;
}
function Oi(u2, G2) {
  return `<div id="${u2}">${(G2 || []).map(Ii).join("")}</div> <button type="button" data-act="struct-add" data-target="${u2}" data-kind="tattoo" style="${_i}">\u2795 Add tattoo</button>`;
}
function Bi(u2, G2) {
  return `<div id="${u2}">${(G2 || []).filter(Boolean).map((v) => Pi(v)).join("")}</div> <button type="button" data-act="struct-add" data-target="${u2}" data-kind="feature" style="${_i}">\u2795 Add feature</button>`;
}
function qi(u2, values, options) {
  return `<div id="${u2}" data-tag-picker> <div class="tag-chips" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:6px;">${(values || []).filter(Boolean).map(Ni).join("")}</div> <div style="display:flex; gap:6px;"> <span class="combo-wrap" style="position:relative; display:block; flex:1;"><input class="tag-input combo-input" data-tag-target="${u2}" placeholder="Add\u2026 (type or pick)" autocomplete="off" style="width:100%; padding:8px; background:var(--i); border:1px solid var(--r); border-radius:4px; color:var(--b);">${wi(options)}</span> <button type="button" data-act="tag-add" data-target="${u2}" style="background:var(--n); border:none; border-radius:4px; color:var(--q); font-weight:600; padding:8px 12px; cursor:pointer;">\u2795</button> </div> </div>`;
}
const zi = { piercing: Ei, tattoo: Ii, feature: Pi };
if (window.addGenitalCard = (u2, gender) => {
  const c = document.getElementById(u2);
  if (!c) return;
  const G2 = document.createElement("div");
  G2.innerHTML = Ci({}, gender), c.appendChild(G2.firstElementChild);
}, window.addStructCard = (u2, kind) => {
  const c = document.getElementById(u2), G2 = zi[kind];
  if (!c || !G2) return;
  const U2 = document.createElement("div");
  U2.innerHTML = G2({}), c.appendChild(U2.firstElementChild);
}, window.addTag = (u2) => {
  const c = document.getElementById(u2);
  if (!c) return;
  const input = c.querySelector(".tag-input"), v = (input.value || "").trim();
  if (!v) return;
  const chips = c.querySelector(".tag-chips");
  if ([...chips.querySelectorAll(".tag-chip")].some((u3) => u3.dataset.tag.toLowerCase() === v.toLowerCase())) return void (input.value = "");
  const G2 = document.createElement("div");
  G2.innerHTML = Ni(v), chips.appendChild(G2.firstElementChild), input.value = "";
}, !window.__structDelegationBound) {
  window.__structDelegationBound = true, document.addEventListener("click", (u3) => {
    const btn = u3.target && u3.target.closest ? u3.target.closest("[data-act]") : null;
    if (!btn) return;
    const act = btn.getAttribute("data-act");
    if ("struct-remove" === act) {
      const c = btn.closest(".struct-card");
      c && c.remove();
    } else if ("genital-add" === act) window.addGenitalCard(btn.getAttribute("data-target"), btn.getAttribute("data-gender"));
    else if ("struct-add" === act) window.addStructCard(btn.getAttribute("data-target"), btn.getAttribute("data-kind"));
    else if ("tag-add" === act) window.addTag(btn.getAttribute("data-target"));
    else if ("tag-remove" === act) {
      const c = btn.closest(".tag-chip");
      c && c.remove();
    }
  }), document.addEventListener("keydown", (u3) => {
    const t = u3.target;
    t && t.classList && t.classList.contains("tag-input") && "Enter" === u3.key && (u3.preventDefault(), window.addTag(t.getAttribute("data-tag-target")));
  });
  const u2 = (u3, menu) => {
    const q = (u3.value || "").toLowerCase();
    let shown = 0;
    menu.querySelectorAll(".combo-opt").forEach((o) => {
      const m = !q || o.textContent.toLowerCase().indexOf(q) >= 0;
      o.style.display = m && shown < 60 ? "block" : "none", m && shown++;
    });
  }, G2 = (u3) => {
    const G3 = u3 && u3.closest ? u3.closest(".combo-input") : null;
    return G3 ? { inp: G3, menu: G3.parentElement && G3.parentElement.querySelector(".combo-menu") } : null;
  };
  document.addEventListener("focusin", (U2) => {
    const r = G2(U2.target);
    r && r.menu && (u2(r.inp, r.menu), r.menu.style.display = "block");
  }), document.addEventListener("input", (U2) => {
    const r = G2(U2.target);
    r && r.menu && (u2(r.inp, r.menu), r.menu.style.display = "block");
  }), document.addEventListener("focusout", (u3) => {
    const r = G2(u3.target);
    r && r.menu && setTimeout(() => r.menu.style.display = "none", 150);
  }), document.addEventListener("mousedown", (u3) => {
    const opt = u3.target && u3.target.closest ? u3.target.closest(".combo-opt") : null;
    if (!opt) return;
    u3.preventDefault();
    const wrap = opt.closest(".combo-wrap"), G3 = wrap && wrap.querySelector(".combo-input");
    if (!G3) return;
    G3.value = opt.textContent;
    const menu = wrap.querySelector(".combo-menu");
    menu && (menu.style.display = "none"), G3.dispatchEvent(new Event("change", { bubbles: true })), G3.classList.contains("tag-input") && window.addTag(G3.getAttribute("data-tag-target"));
  });
}
function Ui(u2, G2) {
  const c = document.getElementById(u2);
  return c ? [...c.querySelectorAll("[data-genital-card]")].map((card) => ({ type: (card.querySelector(".g-type")?.value || "").trim(), size: (card.querySelector(".g-size")?.value || "").trim(), characteristics: (card.querySelector(".g-char")?.value || "").trim() })).filter((x) => x.type || x.size || x.characteristics) : G2 && (G2.type || G2.size || G2.characteristics) ? [{ type: G2.type || "", size: G2.size || "", characteristics: G2.characteristics || "" }] : [];
}
function Wi(u2) {
  const c = document.getElementById(u2);
  return c ? [...c.querySelectorAll("[data-piercing-card]")].map((card) => ({ location: (card.querySelector(".p-loc")?.value || "").trim(), type: (card.querySelector(".p-type")?.value || "").trim(), description: (card.querySelector(".p-desc")?.value || "").trim() })).filter((x) => x.location || x.type || x.description) : [];
}
function Vi(u2) {
  const c = document.getElementById(u2);
  return c ? [...c.querySelectorAll("[data-tattoo-card]")].map((card) => ({ location: (card.querySelector(".t-loc")?.value || "").trim(), description: (card.querySelector(".t-desc")?.value || "").trim(), style: (card.querySelector(".t-style")?.value || "").trim() })).filter((x) => x.location || x.description || x.style) : [];
}
function Xi(u2) {
  const c = document.getElementById(u2);
  return c ? [...c.querySelectorAll("[data-feature-card] .f-val")].map((i) => (i.value || "").trim()).filter(Boolean) : [];
}
function Zi(u2) {
  const c = document.getElementById(u2);
  return c ? [...c.querySelectorAll(".tag-chip")].map((u3) => u3.dataset.tag).filter(Boolean) : [];
}
function er(map) {
  Object.entries(map).forEach(([id, opts]) => {
    const u2 = document.getElementById(id);
    u2 && "INPUT" === u2.tagName && xi(u2, opts);
  });
}
function nr(prefix) {
  const O = oi, both = O.chestSizeFemale.concat(O.chestSizeMale), u2 = O.height.concat(O.build);
  er({ [prefix + "HairColor"]: O.hairColor, [prefix + "HairStyle"]: O.hairStyle, [prefix + "HairLength"]: O.hairLength, [prefix + "HairTexture"]: O.hairTexture, [prefix + "EyeColor"]: O.eyeColor, [prefix + "EyeShape"]: O.eyeShape, [prefix + "FaceShape"]: O.faceShape, [prefix + "Nose"]: O.nose, [prefix + "Lips"]: O.lips, [prefix + "Jawline"]: O.jawline, [prefix + "SkinTone"]: O.skinTone, [prefix + "SkinTexture"]: O.skinTexture, [prefix + "BodyShape"]: O.bodyShape, [prefix + "ButtSize"]: O.buttSize, [prefix + "Legs"]: O.legs, [prefix + "ChestSize"]: both, [prefix + "BreastSize"]: both, [prefix + "Fashion"]: O.fashion, [prefix + "Accessories"]: O.accessories, [prefix + "DistinguishingFeature"]: O.distinguishingFeature, [prefix + "NotableFeatures"]: O.distinguishingFeature, [prefix + "HeightBuild"]: u2, [prefix + "BuildDetails"]: O.build });
}
function ar(prefix, opts) {
  const u2 = (opts = opts || {}).physical || {}, gender = opts.gender || u2.gender || "female";
  if (document.getElementById(prefix + "GenitalCards") || document.getElementById(prefix + "PiercingCards")) return;
  const gt = document.getElementById(prefix + "GenitalType");
  if (gt) {
    const cell = gt.closest("div"), grid = cell && cell.parentElement;
    grid && (grid.innerHTML = `<div style="grid-column:1/-1;"><label style="display:block; margin-bottom:6px; color:var(--a); font-size:0.85rem;">Genitals (add one or more sets)</label>${Ri(prefix + "GenitalCards", rr(u2), gender)}</div>`);
  }
  const G2 = document.getElementById(prefix + "DistinguishingFeature") || document.getElementById(prefix + "NotableFeatures") || document.getElementById(prefix + "Accessories") || document.getElementById(prefix + "Fashion");
  if (!G2) return;
  const host = G2.closest('[style*="background"]') || G2.parentElement;
  if (!host || !host.parentElement) return;
  const U2 = (title, color, inner) => {
    const div = document.createElement("div");
    return div.style.cssText = "background: var(--f); padding: 15px; border-radius: 8px; margin-bottom: 15px;", div.innerHTML = `<h4 style="margin:0 0 12px 0; color:${color};">${title}</h4>${inner}`, div;
  };
  let after = host;
  if (!gt) {
    const G3 = U2("\u{1F51E} Anatomy / Genitals", "var(--k)", Ri(prefix + "GenitalCards", rr(u2), gender));
    host.parentElement.insertBefore(G3, after.nextSibling), after = G3;
  }
  const J2 = U2("\u{1F48E} Piercings & Tattoos", "var(--m)", `<div style="margin-bottom:10px;">${Di(prefix + "PiercingCards", u2.piercings || [])}</div><div>${Oi(prefix + "TattooCards", u2.tattoos || [])}</div>`);
  host.parentElement.insertBefore(J2, after.nextSibling);
}
function ir(u2, G2, options) {
  const input = document.getElementById(u2);
  if (!input || document.getElementById(u2 + "_tags")) return;
  const values = (input.value || "").split(",").map((s) => s.trim()).filter(Boolean), U2 = document.createElement("div");
  U2.innerHTML = qi(u2 + "_tags", values, options), input.after(U2.firstElementChild), input.style.display = "none";
}
function rr(physical) {
  if (!physical || "object" != typeof physical) return [];
  let g = physical.genitals;
  return g = Array.isArray(g) ? g.filter((x) => x && (x.type || x.size || x.characteristics)) : g && "object" == typeof g && (g.type || g.size || g.characteristics) ? [g] : [], physical.genitals = g;
}
function sr(u2) {
  if (!(u2 = (u2 || []).filter((x) => x && (x.type || x.size))).length) return "";
  return `Genitals: ${u2.map((x) => `${[x.size, x.type].filter(Boolean).join(" ")}${x.characteristics ? ", " + x.characteristics : ""}`.trim()).join("; and ")}.`;
}
function lr(physical) {
  if (!physical || "object" != typeof physical) return physical;
  if (physical.race) {
    const raw = String(physical.race).toLowerCase().trim();
    if (RACES[raw] || Cl[raw]) {
      const u2 = Il(raw);
      physical.race = u2, "human" !== u2 && (physical.bio && "object" == typeof physical.bio || (physical.bio = Rl(u2, physical.raceFeatures)), physical.raceFeatures = ql(u2, physical.bio));
    }
  }
  return rr(physical), Array.isArray(physical.distinguishingFeatures) || (physical.distinguishingFeatures = physical.distinguishingFeature ? [physical.distinguishingFeature] : []), Array.isArray(physical.piercings) || (physical.piercings = []), Array.isArray(physical.tattoos) || (physical.tattoos = []), physical;
}
function cr(physical, gender) {
  const u2 = rr(physical || {});
  let G2 = false, U2 = false;
  if (u2.forEach((x) => {
    const u3 = String(x.type || "").toLowerCase();
    (u3.includes("penis") || u3.includes("cock") || u3.includes("phallo")) && (G2 = true), (u3.includes("vagina") || u3.includes("pussy") || u3.includes("clitoris") || u3.includes("pre-op anatomy")) && (U2 = true);
  }), !u2.length) {
    const i = dr(gender);
    "male" === i || "transWoman" === i ? G2 = true : "femaleFuta" === i ? (G2 = true, U2 = true) : U2 = true;
  }
  return { hasPenis: G2, hasVagina: U2 };
}
function dr(g) {
  if (null == g) return "female";
  const raw = String(g).trim(), s = raw.toLowerCase().replace(/[\s_\-]/g, "");
  return /^(transman|ftm|transmasc|transmasculine)$/.test(s) ? "transMan" : /^(transwoman|mtf|transfem|transfeminine)$/.test(s) ? "transWoman" : /futa|futanari|dickgirl/.test(s) ? "femaleFuta" : /^(male|m|man|boy|guy)$/.test(s) ? "male" : /^(female|f|woman|girl|gal)$/.test(s) ? "female" : /^(nonbinary|enby|nb|genderfluid|agender|genderqueer)$/.test(s) ? "nonbinary" : raw;
}
function ur(g) {
  const c = dr(g);
  return { male: "Male", female: "Female", transMan: "Trans Man", transWoman: "Trans Woman", femaleFuta: "Female Futa", nonbinary: "Non-binary" }[c] || c;
}
function pr(s) {
  return String(s || "").replace(/\b([A-Za-z]+)(?:\s+\1\b)+/gi, "$1");
}
function mr(p, gender) {
  if (!p || "object" != typeof p) return p;
  const g = dr(gender || p.gender || "female");
  p.gender = g, lr(p), p.distinguishingFeature = (p.distinguishingFeatures || []).filter(Boolean).join(", ");
  const u2 = "male" === g || "transMan" === g, G2 = Dl(p.race);
  if (p.hair) {
    const u3 = p.hair.length || "", U3 = p.hair.texture || "", col = p.hair.color || "", J3 = p.hair.style || "", ee3 = Ol(G2, { sty: J3 }, p.bio);
    p.hair.full = null !== ee3 ? ee3 : pr(`${u3} ${U3} ${col} hair, ${J3}`.replace(/\s+/g, " ").trim());
  }
  if (p.eyes) {
    const u3 = Bl(G2, { col: p.eyes.color, shape: p.eyes.shape }, p.bio);
    p.eyes.full = null !== u3 ? u3 : pr(`${p.eyes.shape || ""} ${p.eyes.color || ""} eyes`.replace(/\s+/g, " ").trim());
  }
  if (p.skin) {
    const u3 = Fl(G2);
    p.skin.full = null !== u3 ? u3 : pr(`${p.skin.texture || ""} ${p.skin.tone || ""} skin`.replace(/\s+/g, " ").trim());
  }
  if (p.face) {
    const u3 = jl(G2);
    if (null !== u3) p.face.full = u3;
    else {
      const u4 = [p.face.nose, p.face.lips, p.face.cheekbones, p.face.jawline].filter(Boolean).join(", ");
      p.face.full = `${p.face.shape || ""} face${u4 ? " with " + u4 : ""}`.replace(/\s+/g, " ").trim();
    }
  }
  if (p.body) {
    p.body.chestDescriptor = u2 ? "chest" : p.body.chestDescriptor && "chest" !== p.body.chestDescriptor ? p.body.chestDescriptor : "bust";
    const shape = p.body.shape || p.bodyShape || "average", chestSize = p.body.chestSize || p.body.breastSize || "", desc = p.body.chestDescriptor, G3 = chestSize ? "chest" === desc ? `${chestSize} chest` : `${chestSize} ${desc}` : "", butt = p.body.buttSize || "", legs = p.body.legs || "";
    p.body.full = `${shape} physique${G3 ? " with " + G3 : ""}${butt ? ", " + butt + " bottom" : ""}${legs ? ", " + legs : ""}`, p.bodyShape = shape;
  }
  rr(p).forEach((x) => {
    const u3 = x.size || "", G3 = x.type || "", U3 = x.characteristics || "";
    x.full = `${u3} ${G3}${U3 ? ", " + U3 : ""}`.replace(/\s+/g, " ").trim();
  }), (p.height || p.build) && (p.heightBuild = [p.height, p.build].filter(Boolean).join(", "));
  let U2 = "";
  const J2 = p.raceFeatures;
  if (J2 && "object" == typeof J2 && p.race && "human" !== p.race) {
    const u3 = [];
    J2.ears && u3.push(J2.ears), J2.tail && u3.push(J2.tail), J2.fur && u3.push(J2.fur), J2.furPattern && u3.push(J2.furPattern), J2.horns && u3.push(J2.horns), J2.skin && u3.push(J2.skin), J2.wings && u3.push(J2.wings), J2.eyes && u3.push(J2.eyes), Array.isArray(J2.other) && J2.other.length && u3.push(...J2.other), u3.length && (U2 = ` Race features: ${u3.join(", ")}.`);
  }
  const ee2 = u2 ? "man" : "woman", te2 = p.race && "human" !== p.race && J2 && J2.description ? J2.description + " " : "", ne2 = !te2 && p.ethnicityFeatures && p.ethnicityFeatures.description ? p.ethnicityFeatures.description + " " : "", prefix = te2 || ne2, m = p.height || "", z = p.build || "", oe2 = p.hair?.length || "", ae2 = p.hair?.texture || "", ie2 = p.hair?.color || "", se2 = p.hair?.style || "", le2 = p.eyes?.color || "", ce2 = p.eyes?.shape || "", de2 = p.skin?.tone || "", ue2 = p.skin?.texture || "", lead = [m, z].filter(Boolean).join(" "), pe2 = (() => {
    const c = Ol(G2, { sty: se2 }, p.bio);
    return null !== c ? c : `${[oe2, ie2].filter(Boolean).join(" ")} hair`;
  })(), ge2 = (() => {
    const c = Bl(G2, { col: le2, shape: ce2 }, p.bio);
    return null !== c ? c : `${le2} eyes`;
  })(), ye2 = (() => {
    const c = Fl(G2);
    return null !== c ? c : `${de2} skin`;
  })();
  p.shortDescription = pr(`${lead} ${prefix}${ee2} with ${[pe2, ge2, ye2].filter(Boolean).join(", ")}`.replace(/\s+/g, " ").replace(/\s+,/g, ",").trim());
  const fe2 = p.ethnicityFeatures, xe2 = fe2 && fe2.description ? ` (${fe2.description}${fe2.subType ? " - " + fe2.subType : ""})` : "", ke2 = p.face?.shape || "", Se2 = [p.face?.nose, p.face?.lips, p.face?.cheekbones, p.face?.jawline].filter(Boolean).join(", "), $e2 = p.body?.full || "", Ce2 = sr(p.genitals), Ee2 = Ce2 ? " " + Ce2 : "", Ie2 = (p.distinguishingFeatures || []).filter(Boolean), distinguishing = Ie2.length ? ` ${Ie2.join(", ")}.` : "", Pe2 = (p.piercings || []).filter((x) => x && (x.location || x.type)).map((x) => `${[x.type, x.location && "on " + x.location].filter(Boolean).join(" ")}${x.description ? " (" + x.description + ")" : ""}`.trim()), Ae2 = (p.tattoos || []).filter((x) => x && (x.location || x.description)).map((x) => `${x.description || "tattoo"}${x.location ? " on " + x.location : ""}${x.style ? " (" + x.style + ")" : ""}`.trim()), Ne2 = `${Pe2.length ? " Piercings: " + Pe2.join(", ") + "." : ""}${Ae2.length ? " Tattoos: " + Ae2.join(", ") + "." : ""}`, style2 = p.fashion ? ` Style: ${p.fashion}.` : "", _e2 = (() => {
    const c = Ol(G2, { sty: se2 }, p.bio);
    return null !== c ? c : `${[oe2, ae2, ie2].filter(Boolean).join(" ")} hair${se2 ? " (" + se2 + ")" : ""}`;
  })(), Oe2 = (() => {
    const c = Bl(G2, { col: le2, shape: ce2 }, p.bio);
    return null !== c ? c : `${[ce2, le2].filter(Boolean).join(" ")} eyes`;
  })(), Fe2 = (() => {
    const c = Fl(G2);
    return null !== c ? c : `${[ue2, de2].filter(Boolean).join(" ")} skin`;
  })(), je2 = (() => {
    const c = jl(G2);
    return null !== c ? c ? " " + c + "." : "" : ke2 ? " " + ke2 + " face" + (Se2 ? " with " + Se2 : "") + "." : "";
  })();
  return p.fullDescription = pr(`${lead} ${prefix}${ee2}${xe2} with ${[_e2, Oe2, Fe2].filter(Boolean).join(", ")}.${je2}${U2}${$e2 ? " " + $e2 + "." : ""}${Ee2}${distinguishing}${Ne2}${style2}`.replace(/\s+/g, " ").replace(/\s+,/g, ",").replace(/\.\.+/g, ".").trim()), p;
}
function getPhysicalDescriptionForPrompt(e, opts = {}) {
  e.physical || (e.physical = ni(e.gender || "female", e.race || "human")), e.physical.fullDescription || (e.physical = ni(e.gender || "female", e.race || "human"));
  const t = e.physical, n = [];
  t.heightBuild ? n.push(t.heightBuild) : t.height && t.build && n.push(`${t.height}, ${t.build}`);
  const a = e.race || t.race || "human";
  a && "human" !== a && t.raceFeatures?.description && n.push(t.raceFeatures.description), "human" !== a && a || !t.ethnicityFeatures?.description || n.push(t.ethnicityFeatures.description);
  const o = e.gender || t.gender || "female", i = "male" === o || "transMan" === o ? "man" : "woman";
  n.push(i);
  const u2 = Dl(a), G2 = t.bio || {}, s = t.hair?.color || t.hairColor || "", r = t.hair?.style || t.hairStyle || "", l = t.hair?.length || t.hairLength || "", c = t.hair?.texture || t.hairTexture || "", U2 = Ol(u2, { sty: r }, G2);
  if (null !== U2) U2 && n.push(U2);
  else if (s || r || l) {
    const e2 = [l, c, s, "hair"].filter(Boolean);
    r && e2.push(`(${r})`), n.push(e2.join(" "));
  }
  const d = t.eyes?.color || t.eyeColor || "", p = t.eyes?.shape || t.eyeShape || "", J2 = Bl(u2, { col: d, shape: p }, G2);
  null !== J2 ? J2 && n.push(J2) : (d || p) && n.push(`${p ? p + " " : ""}${d} eyes`);
  const m = t.skin?.tone || t.skinTone || "", ee2 = t.skin?.texture || "", te2 = Fl(u2);
  null !== te2 ? te2 && n.push(te2) : m && n.push(`${ee2 ? ee2 + " " : ""}${m} skin`);
  const g = t.face || {}, h = [], ne2 = jl(u2);
  if (null !== ne2 ? ne2 && n.push(ne2) : (g.shape && h.push(`${g.shape} face`), g.nose && h.push(g.nose), g.lips && h.push(g.lips), g.cheekbones && h.push(g.cheekbones), g.jawline && h.push(g.jawline), h.length > 0 && n.push(h.join(", "))), t.raceFeatures && "human" !== a) {
    const e2 = [];
    t.raceFeatures.ears && e2.push(t.raceFeatures.ears), t.raceFeatures.tail && e2.push(t.raceFeatures.tail), t.raceFeatures.horns && e2.push(t.raceFeatures.horns), t.raceFeatures.fur && e2.push(t.raceFeatures.fur), t.raceFeatures.wings && e2.push(t.raceFeatures.wings), "raceOnly" === u2.skinMode && t.raceFeatures.skin && e2.push(t.raceFeatures.skin), t.raceFeatures.other && t.raceFeatures.other.length > 0 && e2.push(...t.raceFeatures.other), e2.length > 0 && n.push(`Race features: ${e2.join(", ")}`);
    const G3 = RACES[Il(a)];
    G3 && G3.allure && G3.allure.length && n.push(G3.allure[Math.floor(Math.random() * G3.allure.length)]);
  }
  if ("string" == typeof t.raceFeatures && t.raceFeatures && n.push(`${e.race} features: ${t.raceFeatures}`), e.customRace && e.customRace.details) {
    const t2 = e.customRace.details.filter((e2) => e2.name || e2.description).map((e2) => e2.name && e2.description ? `${e2.name} (${e2.description})` : e2.name || e2.description).join(", ");
    t2 && n.push(`Custom ${e.race} traits: ${t2}`);
  }
  const y = t.body || {}, f = y.shape || t.bodyShape || "", b = y.chestSize || y.breastSize || t.breastSize || t.chestSize || "", v = y.buttSize || t.buttSize || "", w = y.legs || "", x = y.chestDescriptor || ("male" === o || "transMan" === o ? "chest" : "bust");
  if (f || b || v) {
    const e2 = [];
    f && e2.push(`${f} physique`), b && e2.push(`${b} ${x}`), v && e2.push(`${v} bottom`), w && e2.push(w), n.push(e2.join(", "));
  }
  lr(t);
  const oe2 = opts.noGenitals ? "" : sr(t.genitals);
  oe2 && n.push(oe2.replace(/\.\s*$/, ""));
  const ae2 = (t.distinguishingFeatures || []).filter(Boolean);
  ae2.length && n.push(ae2.join(", "));
  const ie2 = (t.piercings || []).filter((x2) => x2 && (x2.location || x2.type)).map((x2) => `${[x2.type, x2.location && "on " + x2.location].filter(Boolean).join(" ")}${x2.description ? " (" + x2.description + ")" : ""}`.trim());
  ie2.length && n.push(`Piercings: ${ie2.join(", ")}`);
  const se2 = (t.tattoos || []).filter((x2) => x2 && (x2.location || x2.description)).map((x2) => `${x2.description || "tattoo"}${x2.location ? " on " + x2.location : ""}${x2.style ? " (" + x2.style + ")" : ""}`.trim());
  se2.length && n.push(`Tattoos: ${se2.join(", ")}`);
  const le2 = opts.nude || "function" == typeof Ts && Ts(e);
  if (le2 || (t.fashion && n.push(`Style: ${t.fashion}`), t.accessories && "none" !== t.accessories.toLowerCase() && "no accessories" !== t.accessories.toLowerCase() && n.push(`Accessories: ${t.accessories}`)), le2 && "function" == typeof Ss) {
    const u3 = Ss(e);
    u3 && u3.clothing && n.push(`Currently ${u3.clothing}`);
  }
  let k = pr(n.filter(Boolean).join(". ").replace(/\.\./g, ".")) + ".";
  const T = Xe(e);
  if (T.length > 0) {
    const e2 = T.filter((e3) => "pregnant" === e3.key || "chastity" === e3.key || "pierced" === e3.key || "tattooed" === e3.key || "collar" === e3.key || "locked" === e3.key || "plugged" === e3.key || "marked" === e3.key || "bruised" === e3.key || "leashed" === e3.key || "bound" === e3.key || e3.affectsContext);
    e2.length > 0 && (k += "\n\n\u{1F3F7}\uFE0F CURRENT PHYSICAL STATE:", e2.forEach((e3) => {
      e3.playerDescription && (k += `
- ${e3.playerDescription}`), e3.aiGuidance && (k += ` (${e3.aiGuidance})`);
    }));
  }
  return k;
}
