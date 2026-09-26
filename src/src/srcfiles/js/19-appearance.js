// ============================================================================
// 19-appearance — Appearance/gender/race rendering: pools (APPEARANCE_OPTIONS), combo builders, card renderers, physical descriptions, getPhysicalDescriptionForPrompt.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function createCustomPhysicalAppearance(e, t, n, a) {
    const o = generateDetailedPhysicalAppearance(t, n, a);
    if (!e || 0 === Object.keys(e).length) return o;
    const i = (e) => null != e && "" !== e,
        s = { ...o };
    if (e.bio && "object" == typeof e.bio) {
        const cr = canonicalRace(n || s.race || "human");
        s.bio = { ...getDefaultBio(cr), ...(s.bio || {}), ...e.bio };
        s.raceFeatures = deriveRaceFeaturesFromBio(cr, s.bio);
    }
    if (
        (i(e.hairColor) && ((s.hairColor = e.hairColor), s.hair && (s.hair.color = e.hairColor)),
        i(e.hairStyle) && ((s.hairStyle = e.hairStyle), s.hair && (s.hair.style = e.hairStyle)),
        i(e.hairLength) && ((s.hairLength = e.hairLength), s.hair && (s.hair.length = e.hairLength)),
        i(e.eyeColor) && ((s.eyeColor = e.eyeColor), s.eyes && (s.eyes.color = e.eyeColor)),
        i(e.eyeShape) && ((s.eyeShape = e.eyeShape), s.eyes && (s.eyes.shape = e.eyeShape)),
        i(e.skinTone) && ((s.skinTone = e.skinTone), s.skin && (s.skin.tone = e.skinTone)),
        i(e.bodyShape) && (s.bodyShape = e.bodyShape),
        i(e.heightBuild))
    ) {
        s.heightBuild = e.heightBuild;
        const t = e.heightBuild.split(/[,\s]+/);
        t.length >= 2 && ((s.height = t[0]), (s.build = t.slice(1).join(" ")));
    }
    i(e.breastSize) && ((s.breastSize = e.breastSize), s.body && (s.body.chestSize = e.breastSize)),
        i(e.buttSize) && ((s.buttSize = e.buttSize), s.body && (s.body.buttSize = e.buttSize)),
        i(e.fashion) && (s.fashion = e.fashion),
        i(e.accessories) && (s.accessories = e.accessories),
        i(e.notableFeatures) &&
            ((s.distinguishingFeature = e.notableFeatures), (s.notableFeatures = e.notableFeatures));
    const r = `${s.hairLength || ""} ${s.hairTexture || ""} ${s.hairColor || ""} hair`.trim(),
        l = `${s.eyeShape || ""} ${s.eyeColor || ""} eyes`.trim(),
        c = `${s.skinTexture || ""} ${s.skinTone || ""} skin`.trim(),
        d = "male" === t || "transMan" === t ? "man" : "woman";
    s.shortDescription = `${s.height || "average"} ${s.build || "average"} ${d} with ${r}, ${l}, ${c}`;
    const p = i(s.bodyShape) ? `${s.bodyShape} body shape` : `${s.build || "average"} build`,
        m = i(s.breastSize) ? `, ${s.breastSize} chest` : "",
        u = i(s.buttSize) ? `, ${s.buttSize} rear` : "";
    return (
        (s.fullDescription = `${s.height || "average"} ${s.build || "average"} ${d} with ${r} (${s.hairStyle || "natural"}), ${l}, ${c}. ${p}${m}${u}. ${s.distinguishingFeature || ""} Style: ${s.fashion || "professional"}.`),
        s
    );
}
function generateDetailedPhysicalAppearance(e = "female", t = "human", n = null) {
    let a;
    a =
        "male" === e || "transMan" === e
            ? [
                  "lean",
                  "slim",
                  "athletic",
                  "average",
                  "stocky",
                  "broad-shouldered",
                  "muscular",
                  "toned",
                  "sturdy",
                  "wiry",
              ]
            : ["slender", "slim", "athletic", "average", "curvy", "voluptuous", "muscular", "toned"];
    let o, i, s, r;
    "male" === e
        ? ((o = [
              "athletic",
              "lean",
              "muscular",
              "stocky",
              "broad-shouldered",
              "rectangular",
              "V-shaped",
              "swimmer's build",
          ]),
          (i = "chest"),
          (s = ["flat", "toned", "well-defined", "muscular", "broad", "barrel-chested"]),
          (r = ["flat", "toned", "athletic", "round", "muscular"]))
        : "transMan" === e
          ? ((o = ["athletic", "lean", "rectangular", "androgynous", "toned", "muscular"]),
            (i = "chest"),
            (s = ["flat", "compact", "athletic", "toned", "bound", "masculine"]),
            (r = ["compact", "toned", "athletic", "round", "firm"]))
          : "femaleFuta" === e
            ? ((o = ["hourglass", "athletic", "curvy", "statuesque", "amazonian", "voluptuous", "toned"]),
              (i = "bust"),
              (s = ["medium", "full", "large", "very full", "impressive", "ample"]),
              (r = ["round", "full", "curvy", "prominent", "shapely"]))
            : ((o = [
                  "hourglass",
                  "pear-shaped",
                  "athletic",
                  "rectangular",
                  "inverted triangle",
                  "petite hourglass",
                  "curvy",
                  "willowy",
                  "statuesque",
              ]),
              (i = "bust"),
              (s = ["small", "modest", "medium", "full", "large", "very full"]),
              (r = ["small", "modest", "round", "full", "curvy", "prominent"]));
    const l = (e) => e[Math.floor(Math.random() * e.length)];
    let c, d, p;
    "male" === e
        ? ((c = "penis"),
          (d = l(["small", "average", "above average", "large", "very large"])),
          (p = l(["circumcised", "uncircumcised", "well-groomed", "natural", "trimmed"])))
        : "transMan" === e
          ? ((c = l(["enlarged clitoris", "post-op penis", "pre-op anatomy"])),
            (d = l(
                "post-op penis" === c ? ["average", "above average", "large"] : ["small", "moderate", "prominent"]
            )),
            (p = l(["well-groomed", "natural", "trimmed", "maintained"])))
          : "femaleFuta" === e
            ? ((c = "penis and vagina"),
              (d = l(["average", "above average", "large", "very large", "impressive"])),
              (p = l(["circumcised", "uncircumcised", "well-groomed", "natural", "dual anatomy"])))
            : "transWoman" === e
              ? ((c = l(["vagina (post-op)", "penis (pre-op)", "tucked"])),
                (d = c.includes("penis")
                    ? l(["small", "average", "above average"])
                    : l(["tight", "normal", "accommodating"])),
                (p = l(["well-groomed", "laser-treated", "smooth", "maintained", "natural"])))
              : ((c = "vagina"),
                (d = l(["tight", "normal", "accommodating", "petite", "average"])),
                (p = l(["well-groomed", "waxed", "trimmed", "natural", "shaved", "landing strip"])));
    const m = l(["petite", "short", "average height", "tall", "very tall"]),
        u = l(a);
    let g = l([
        "platinum blonde",
        "golden blonde",
        "honey blonde",
        "ash blonde",
        "strawberry blonde",
        "light brown",
        "chestnut brown",
        "dark brown",
        "chocolate brown",
        "auburn",
        "copper red",
        "ginger",
        "burgundy",
        "jet black",
        "raven black",
        "dark black with blue sheen",
        "silver-gray",
        "salt and pepper",
    ]);
    const h = l([
            "straight",
            "wavy",
            "curly",
            "tight curls",
            "beach waves",
            "loose curls",
            "pin-straight",
            "naturally wavy",
            "tousled",
            "messy waves",
        ]),
        y = l([
            "pixie cut",
            "short bob",
            "chin-length bob",
            "shoulder-length",
            "mid-back length",
            "waist-length",
            "very long",
        ]);
    let f = l(["fine", "thick", "medium", "voluminous", "silky"]),
        b = l([
            "bright blue",
            "deep blue",
            "ocean blue",
            "ice blue",
            "steel blue",
            "emerald green",
            "jade green",
            "hazel green",
            "olive green",
            "dark brown",
            "amber brown",
            "honey brown",
            "chocolate brown",
            "hazel with green flecks",
            "hazel with gold flecks",
            "gray",
            "stormy gray",
            "gray-blue",
            "unusual violet",
            "heterochromic (one blue, one brown)",
        ]),
        v = l([
            "almond-shaped",
            "round",
            "hooded",
            "upturned",
            "downturned",
            "doe eyes",
            "cat eyes",
            "deep-set",
            "wide-set",
            "close-set",
        ]),
        w = l(["oval", "round", "heart-shaped", "square", "diamond", "long"]),
        x = l([
            "button nose",
            "straight nose",
            "slightly upturned nose",
            "roman nose",
            "ski-slope nose",
            "aquiline nose",
            "petite nose",
            "prominent nose",
        ]);
    const S = l([
            "full lips",
            "thin lips",
            "heart-shaped lips",
            "bow-shaped lips",
            "plump lips",
            "pouty lips",
            "balanced lips",
            "wide lips",
        ]),
        k = l([
            "high cheekbones",
            "prominent cheekbones",
            "soft cheekbones",
            "defined cheekbones",
            "subtle cheekbones",
            "angular cheekbones",
        ]),
        T = l([
            "soft jawline",
            "defined jawline",
            "strong jawline",
            "delicate jawline",
            "angular jawline",
            "rounded jawline",
            "sharp jawline",
        ]);
    let C = l([
        "porcelain",
        "fair",
        "light",
        "light-medium",
        "beige",
        "olive",
        "tan",
        "medium",
        "golden brown",
        "caramel",
        "bronze",
        "deep brown",
        "dark brown",
        "ebony",
        "rich mahogany",
    ]);
    const E = l([
            "smooth",
            "flawless",
            "clear",
            "glowing",
            "radiant",
            "matte",
            "dewy",
            "sun-kissed",
            "naturally luminous",
        ]),
        $ = l(o),
        I = l(s),
        M = l(r),
        P = l([
            "long legs",
            "proportionate legs",
            "toned legs",
            "athletic legs",
            "shapely legs",
            "slender legs",
            "muscular legs",
        ]),
        A = l([
            "business professional",
            "smart casual",
            "trendy",
            "classic elegant",
            "minimalist chic",
            "bohemian",
            "edgy modern",
            "preppy",
            "casual comfortable",
            "sophisticated",
            "artsy",
            "sporty chic",
        ]),
        N = l([
            "often wears glasses",
            "statement earrings",
            "delicate jewelry",
            "minimalist accessories",
            "watches",
            "scarves",
            "no accessories",
        ]),
        L = l([
            "dimples when smiling",
            "freckles across nose",
            "beauty mark",
            "gap-toothed smile",
            "striking eyes",
            "expressive face",
            "mysterious aura",
            "warm smile",
            "confident posture",
            "graceful movements",
            "energetic presence",
            "calm demeanor",
        ]);
    let _ = null,
        R = null,
        D = null;
    if (!t || "human" === t) {
        if (((_ = n || selectEthnicityForEmployee()), (R = getEthnicityFeatures(_)), n && n.includes("-"))) {
            const e = n.split("-");
            (_ = e[0]),
                (D = e[1].charAt(0).toUpperCase() + e[1].slice(1)),
                (R = getEthnicityFeatures(_)),
                (R.subType = D);
        }
        (C = R.skinTone),
            (b = R.eyeColor),
            (g = R.hairColor),
            (v = R.eyeShape),
            R.hairTexture && (f = R.hairTexture),
            R.noseType && (x = R.noseType),
            R.faceShape && (w = R.faceShape);
    }
    const F = "male" === e || "transMan" === e ? "man" : "woman",
        _canonRace = canonicalRace(t || "human"),
        _bio = randomizeBio(_canonRace, e),
        G = deriveRaceFeaturesFromBio(_canonRace, _bio),
        B = "human" !== _canonRace ? G.description + " " : "",
        O = R?.description ? R.description + " " : "",
        q = B || O,
        z = G.build || u;
    let j = C;
    G.skin && (j = G.skin);
    let H = b;
    G.eyes && (H = G.eyes);
    const U = [];
    G.ears && U.push(G.ears),
        G.tail && U.push(G.tail),
        G.fur && U.push(G.fur),
        G.furPattern && U.push(G.furPattern),
        G.horns && U.push(G.horns),
        G.wings && U.push(G.wings),
        G.skin && "human" !== _canonRace && U.push(G.skin),
        G.eyes && U.push(G.eyes),
        G.other.length > 0 && U.push(...G.other);
    const Y = U.length > 0 ? ` Race features: ${U.join(", ")}.` : "",
        W = `${$} physique with ${"chest" === i ? I + " chest" : I + " " + i}, ${M} bottom, ${P}`;
    return {
        height: m,
        build: z,
        gender: e,
        race: _canonRace,
        ethnicity: _,
        ethnicityFeatures: R,
        raceFeatures: G,
        bio: _bio,
        heightBuild: `${m}, ${z}`,
        hair: { color: g, style: h, length: y, texture: f, full: `${y} ${f} ${g} hair, ${h}` },
        eyes: { color: H, shape: v, full: `${v} ${H} eyes` },
        face: {
            shape: w,
            nose: x,
            lips: S,
            cheekbones: k,
            jawline: T,
            full: `${w} face with ${x}, ${S}, ${k}, ${T}`,
        },
        skin: { tone: j, texture: E, full: `${E} ${j} skin` },
        body: { shape: $, chestDescriptor: i, chestSize: I, breastSize: I, buttSize: M, legs: P, full: W },
        genitals:
            "femaleFuta" === e
                ? (() => {
                      const vs = l(["tight", "average", "accommodating"]),
                          vc = l(["well-groomed", "waxed", "natural", "shaved"]);
                      return [
                          { type: "penis", size: d, characteristics: p, full: `${d} penis, ${p}` },
                          { type: "vagina", size: vs, characteristics: vc, full: `${vs} vagina, ${vc}` },
                      ];
                  })()
                : [{ type: c, size: d, characteristics: p, full: `${d} ${c}, ${p}` }],
        fashion: A,
        accessories: N,
        distinguishingFeature: L,
        shortDescription: `${m} ${z} ${q}${F} with ${y} ${g} hair, ${H} eyes, ${j} skin`,
        fullDescription: `${m} ${z} ${q}${F}${R ? ` (${R.description}${R.subType ? " - " + R.subType : ""})` : ""} with ${y} ${f} ${g} hair (${h}), ${v} ${H} eyes, ${E} ${j} skin. ${w} face with ${x}, ${S}, ${k}, ${T}.${Y} ${W}. Genitals: ${d} ${c}, ${p}. ${L}. Style: ${A}.`,
    };
}
const APPEARANCE_OPTIONS = {
    hairColor: ["black","jet black","dark brown","brown","chestnut","auburn","red","ginger","strawberry blonde","blonde","platinum blonde","dirty blonde","honey blonde","light brown","ash brown","silver","gray","white","blue","teal","green","purple","lavender","pink","rose gold","crimson","burgundy","copper","caramel","ombre","two-tone","rainbow"],
    hairStyle: ["straight","wavy","curly","coily","tousled","slicked back","ponytail","high ponytail","braided","french braid","twin braids","bun","messy bun","top knot","bob","pixie cut","undercut","shaved sides","mohawk","afro","dreadlocks","cornrows","layered","with bangs","side-swept bangs","space buns","half-up","loose"],
    hairLength: ["bald","buzzed","very short","short","chin-length","shoulder-length","medium","long","very long","waist-length","hip-length"],
    hairTexture: ["fine","silky","thick","coarse","wavy","curly","kinky","frizzy","smooth","glossy"],
    eyeColor: ["brown","dark brown","light brown","hazel","amber","green","emerald","blue","ice blue","sky blue","gray","steel gray","violet","heterochromatic","black","golden","red","pink"],
    eyeShape: ["almond","round","hooded","monolid","upturned","downturned","wide-set","close-set","deep-set","cat-like","doe-eyed"],
    skinTone: ["porcelain","fair","light","ivory","beige","olive","tan","golden","bronze","caramel","brown","deep brown","ebony","dark","sun-kissed","pale","rosy"],
    skinTexture: ["smooth","soft","flawless","freckled","weathered","glowing","dewy","matte"],
    faceShape: ["oval","round","square","heart-shaped","diamond","oblong","triangular","rectangular","angular","soft"],
    nose: ["small button nose","straight nose","aquiline nose","upturned nose","wide nose","narrow nose","rounded nose","refined nose","roman nose","petite nose"],
    lips: ["full lips","plump lips","thin lips","heart-shaped lips","wide lips","bow-shaped lips","pouty lips","soft lips","defined lips"],
    cheekbones: ["high cheekbones","defined cheekbones","soft cheekbones","prominent cheekbones","subtle cheekbones","sharp cheekbones","rounded cheeks"],
    jawline: ["sharp jawline","defined jawline","soft jawline","square jawline","rounded jawline","delicate jawline","strong jawline","tapered jawline"],
    bodyShape: ["hourglass","pear-shaped","apple-shaped","rectangular","inverted triangle","athletic","curvy","voluptuous","petite","slender","willowy","statuesque","muscular","stocky","lean","V-shaped","broad-shouldered","average"],
    height: ["very short","short","petite","below average","average height","above average","tall","very tall","statuesque"],
    build: ["slim","slender","lean","petite","athletic","toned","fit","curvy","voluptuous","muscular","stocky","sturdy","broad-shouldered","soft","average","wiry"],
    chestSizeFemale: ["flat","small","modest","medium","full","large","very full","ample","busty"],
    chestSizeMale: ["flat","toned","defined","muscular","broad","barrel-chested"],
    buttSize: ["flat","small","modest","average","round","full","curvy","prominent","bubble","thick"],
    legs: ["slim legs","toned legs","athletic legs","long legs","shapely legs","muscular legs","thick thighs","slender legs"],
    fashion: ["business professional","business casual","smart casual","casual","trendy","streetwear","sporty","goth","punk","preppy","bohemian","elegant","glamorous","minimalist","vintage","edgy","cute","sophisticated","provocative","modest","alternative"],
    accessories: ["none","minimalist jewelry","stud earrings","hoop earrings","necklace","choker","glasses","reading glasses","sunglasses","watch","bracelets","rings","hair clips","headband","scarf","tie","statement earrings"],
    distinguishingFeature: ["freckles across nose","beauty mark","dimples when smiling","gap-toothed smile","mole on cheek","scar over eyebrow","birthmark","striking eyes","heart-shaped birthmark","sharp features","soft features","cleft chin","strong brow"],
    piercingLocation: ["ears","earlobes","double lobe","helix","industrial","tragus","septum","nostril","eyebrow","lip","labret","tongue","navel","nipples"],
    piercingType: ["stud","hoop","ring","barbell","captive bead ring","horseshoe","dangle","gauge"],
    tattooLocation: ["left shoulder","right shoulder","upper back","lower back","left forearm","right forearm","left wrist","right wrist","ribcage","thigh","ankle","neck","chest","hip","behind ear","full sleeve"],
    tattooStyle: ["fine line","traditional","neo-traditional","blackwork","watercolor","tribal","script/lettering","floral","geometric","realism","minimalist","japanese"],
};
const TRAIT_OPTIONS = ["confident","shy","outgoing","introverted","ambitious","laid-back","flirty","reserved","sarcastic","sweet","bubbly","serious","playful","caring","competitive","sassy","gentle","bold","witty","nurturing","stubborn","easygoing","perfectionist","rebellious","loyal","mischievous","intellectual","dramatic","optimistic","cynical","empathetic","blunt","charming","awkward","passionate","calm","energetic","moody","cheerful","mysterious"];
const HOBBY_OPTIONS = ["reading","gaming","yoga","running","cooking","baking","painting","drawing","photography","hiking","gardening","dancing","singing","playing guitar","piano","gym/fitness","swimming","cycling","knitting","writing","traveling","movies","anime","fashion","makeup","collecting","pottery","rock climbing","martial arts","meditation","volunteering","wine tasting","coffee","board games","skateboarding","surfing","skiing","journaling","astronomy"];
const KINK_OPTIONS = ["roleplay","dominance","submission","teasing","exhibitionism","voyeurism","praise","degradation","bondage","spanking","public play","dirty talk","sensory play","edging","worship","power exchange","brat taming","caregiver dynamics","sensation play","massage"];
function chestSizeOptions(g) {
    const c = normalizeGender(g);
    return "male" === c || "transMan" === c ? APPEARANCE_OPTIONS.chestSizeMale : APPEARANCE_OPTIONS.chestSizeFemale;
}
function genitalTypeOptions(g) {
    const c = normalizeGender(g);
    return "male" === c
        ? ["penis"]
        : "transMan" === c
          ? ["enlarged clitoris", "pre-op anatomy", "post-op penis"]
          : "femaleFuta" === c
            ? ["penis and vagina", "penis"]
            : "transWoman" === c
              ? ["vagina (post-op)", "penis (pre-op)", "tucked"]
              : ["vagina"];
}
function genitalSizeOptions(type) {
    const m = String(type || "").toLowerCase();
    return m.includes("penis") && !m.includes("vagina")
        ? ["small", "modest", "average", "above average", "large", "very large"]
        : "penis and vagina" === m
          ? ["average", "above average", "large", "very large", "impressive"]
          : m.includes("vagina") || "pre-op anatomy" === m
            ? ["tight", "snug", "average", "relaxed", "accommodating"]
            : "enlarged clitoris" === m
              ? ["slightly enlarged", "noticeably enlarged", "significantly enlarged"]
              : ["average"];
}
function genitalCharacteristicsOptions(type) {
    const m = String(type || "").toLowerCase();
    return m.includes("penis") && !m.includes("vagina")
        ? ["circumcised", "uncircumcised", "veiny", "thick", "curved"]
        : "penis and vagina" === m
          ? ["fully functional dual anatomy", "prominent dual features"]
          : m.includes("vagina") || "pre-op anatomy" === m
            ? ["waxed smooth", "neatly trimmed", "natural", "fully shaved", "landing strip", "shaped"]
            : "enlarged clitoris" === m
              ? ["sensitive and prominent", "HRT-enhanced"]
              : "tucked" === m
                ? ["carefully tucked", "HRT-softened"]
                : ["natural"];
}
function comboOptsHTML(options) {
    return (options || [])
        .map((o) => {
            const s = String(o).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            return `<span class="combo-opt" style="display:block; padding:6px 9px; cursor:pointer; color:var(--l-ink); font-weight:400;">${s}</span>`;
        })
        .join("");
}
function comboMenuHTML(options) {
    return `<span class="combo-menu" style="display:none; position:absolute; left:0; right:0; top:100%; z-index:100060; max-height:180px; overflow-y:auto; background:var(--surface); border:1px solid var(--accent-gold); border-radius:4px; box-shadow:0 6px 16px var(--l-veil-45);">${comboOptsHTML(options)}</span>`;
}
function wrapInputAsCombo(input, options) {
    if (!input || input.closest(".combo-wrap")) return;
    input.classList.add("combo-input"), input.setAttribute("autocomplete", "off");
    const wrap = document.createElement("span");
    (wrap.className = "combo-wrap"), (wrap.style.cssText = "position:relative; display:block;");
    input.parentNode.insertBefore(wrap, input), wrap.appendChild(input);
    const holder = document.createElement("div");
    (holder.innerHTML = comboMenuHTML(options)), wrap.appendChild(holder.firstElementChild);
}
function createComboControl(id, value, options, placeholder) {
    const el = document.getElementById(id);
    if (!el) return;
    const parent = el.parentElement,
        orig = parent.innerHTML,
        v = null != value ? String(value).replace(/"/g, "&quot;") : "";
    return (
        (parent.innerHTML = `\n      <span class="combo-wrap" style="position:relative; display:block;"><input id="${id}" class="combo-input" value="${v}" placeholder="${placeholder || "Type or pick…"}" autocomplete="off" style="width:100%; padding:6px; background:var(--surface); border:1px solid var(--accent-gold); border-radius:4px; color:var(--accent-gold); font-weight:600;">${comboMenuHTML(options)}</span>\n    `),
        orig
    );
}
function comboField(id, label, options, value, placeholder) {
    const v = null != value ? String(value).replace(/"/g, "&quot;") : "";
    return `<div>\n      <label style="display:block; margin-bottom:6px; color:var(--text-dim); font-size:0.85rem;">${label}</label>\n      <span class="combo-wrap" style="position:relative; display:block;"><input id="${id}" class="combo-input" value="${v}" placeholder="${placeholder || ""}" autocomplete="off" style="width:100%; padding:10px; background:var(--bg); border:1px solid var(--l-line); border-radius:6px; color:var(--l-ink);">${comboMenuHTML(options)}</span>\n    </div>`;
}
function comboInput(cls, value, options, placeholder) {
    const v = null != value ? String(value).replace(/"/g, "&quot;") : "";
    return `<span class="combo-wrap" style="position:relative; display:block;"><input class="${cls} combo-input" value="${v}" placeholder="${placeholder || ""}" autocomplete="off" style="width:100%; padding:6px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink);">${comboMenuHTML(options)}</span>`;
}
function genitalCardHTML(item, gender) {
    item = item || {};
    return `<div class="struct-card" data-genital-card style="display:grid; grid-template-columns:1fr 1fr 1.2fr auto; gap:8px; align-items:end; margin-bottom:8px; padding:8px; background:var(--surface); border:1px solid var(--border); border-radius:6px;">\n      <div><label style="font-size:.7rem; color:var(--text-dim);">Type</label>${comboInput("g-type", item.type, genitalTypeOptions(gender), "type")}</div>\n      <div><label style="font-size:.7rem; color:var(--text-dim);">Size</label>${comboInput("g-size", item.size, genitalSizeOptions(item.type), "size")}</div>\n      <div><label style="font-size:.7rem; color:var(--text-dim);">Details</label>${comboInput("g-char", item.characteristics, genitalCharacteristicsOptions(item.type), "details")}</div>\n      <button type="button" data-act="struct-remove" style="background:var(--l-red); border:none; border-radius:4px; color:var(--l-ink-on-fill); padding:8px 10px; cursor:pointer;">➖</button>\n    </div>`;
}
function piercingCardHTML(item) {
    item = item || {};
    return `<div class="struct-card" data-piercing-card style="display:grid; grid-template-columns:1fr 1fr 1.4fr auto; gap:8px; align-items:end; margin-bottom:8px; padding:8px; background:var(--surface); border:1px solid var(--border); border-radius:6px;">\n      <div><label style="font-size:.7rem; color:var(--text-dim);">Location</label>${comboInput("p-loc", item.location, APPEARANCE_OPTIONS.piercingLocation, "location")}</div>\n      <div><label style="font-size:.7rem; color:var(--text-dim);">Type</label>${comboInput("p-type", item.type, APPEARANCE_OPTIONS.piercingType, "type")}</div>\n      <div><label style="font-size:.7rem; color:var(--text-dim);">Detail</label>${comboInput("p-desc", item.description, [], "e.g. gold hoop")}</div>\n      <button type="button" data-act="struct-remove" style="background:var(--l-red); border:none; border-radius:4px; color:var(--l-ink-on-fill); padding:8px 10px; cursor:pointer;">➖</button>\n    </div>`;
}
function tattooCardHTML(item) {
    item = item || {};
    return `<div class="struct-card" data-tattoo-card style="display:grid; grid-template-columns:1fr 1.4fr 1fr auto; gap:8px; align-items:end; margin-bottom:8px; padding:8px; background:var(--surface); border:1px solid var(--border); border-radius:6px;">\n      <div><label style="font-size:.7rem; color:var(--text-dim);">Location</label>${comboInput("t-loc", item.location, APPEARANCE_OPTIONS.tattooLocation, "location")}</div>\n      <div><label style="font-size:.7rem; color:var(--text-dim);">Description</label>${comboInput("t-desc", item.description, [], "e.g. rose, dragon")}</div>\n      <div><label style="font-size:.7rem; color:var(--text-dim);">Style</label>${comboInput("t-style", item.style, APPEARANCE_OPTIONS.tattooStyle, "style")}</div>\n      <button type="button" data-act="struct-remove" style="background:var(--l-red); border:none; border-radius:4px; color:var(--l-ink-on-fill); padding:8px 10px; cursor:pointer;">➖</button>\n    </div>`;
}
function featureCardHTML(item) {
    const v = item && null != item.value ? item.value : "string" == typeof item ? item : "";
    return `<div class="struct-card" data-feature-card style="display:flex; gap:8px; margin-bottom:6px;">${comboInput("f-val", v, APPEARANCE_OPTIONS.distinguishingFeature, "feature")}<button type="button" data-act="struct-remove" style="background:var(--l-red); border:none; border-radius:4px; color:var(--l-ink-on-fill); padding:8px 10px; cursor:pointer;">➖</button></div>`;
}
function tagChipHTML(v) {
    const s = String(v).replace(/"/g, "&quot;");
    return `<span class="tag-chip" data-tag="${s}" style="display:inline-flex; align-items:center; gap:4px; background:var(--surface); border:1px solid var(--accent); border-radius:14px; padding:3px 10px; color:var(--accent); font-size:.85rem;">${s}<button type="button" data-act="tag-remove" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:1rem; line-height:1;">×</button></span>`;
}
const __addBtnStyle =
    "background:var(--l-green); border:none; border-radius:4px; color:var(--l-on-accent); font-weight:600; padding:6px 12px; cursor:pointer; margin-top:4px;";
function renderGenitalCards(containerId, arr, gender) {
    const g = normalizeGender(gender);
    return `<div id="${containerId}">${(arr || []).map((x) => genitalCardHTML(x, g)).join("")}</div>\n      <button type="button" data-act="genital-add" data-target="${containerId}" data-gender="${g}" style="${__addBtnStyle}">➕ Add genital set</button>`;
}
function renderPiercingCards(containerId, arr) {
    return `<div id="${containerId}">${(arr || []).map(piercingCardHTML).join("")}</div>\n      <button type="button" data-act="struct-add" data-target="${containerId}" data-kind="piercing" style="${__addBtnStyle}">➕ Add piercing</button>`;
}
function renderTattooCards(containerId, arr) {
    return `<div id="${containerId}">${(arr || []).map(tattooCardHTML).join("")}</div>\n      <button type="button" data-act="struct-add" data-target="${containerId}" data-kind="tattoo" style="${__addBtnStyle}">➕ Add tattoo</button>`;
}
function renderFeatureList(containerId, arr) {
    return `<div id="${containerId}">${(arr || []).filter(Boolean).map((v) => featureCardHTML(v)).join("")}</div>\n      <button type="button" data-act="struct-add" data-target="${containerId}" data-kind="feature" style="${__addBtnStyle}">➕ Add feature</button>`;
}
function renderTagPicker(containerId, values, options) {
    return `<div id="${containerId}" data-tag-picker>\n      <div class="tag-chips" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:6px;">${(values || []).filter(Boolean).map(tagChipHTML).join("")}</div>\n      <div style="display:flex; gap:6px;">\n        <span class="combo-wrap" style="position:relative; display:block; flex:1;"><input class="tag-input combo-input" data-tag-target="${containerId}" placeholder="Add… (type or pick)" autocomplete="off" style="width:100%; padding:8px; background:var(--bg); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink);">${comboMenuHTML(options)}</span>\n        <button type="button" data-act="tag-add" data-target="${containerId}" style="background:var(--l-green); border:none; border-radius:4px; color:var(--l-on-accent); font-weight:600; padding:8px 12px; cursor:pointer;">➕</button>\n      </div>\n    </div>`;
}
const __structCardRenderers = { piercing: piercingCardHTML, tattoo: tattooCardHTML, feature: featureCardHTML };
(window.addGenitalCard = (containerId, gender) => {
    const c = document.getElementById(containerId);
    if (!c) return;
    const tmp = document.createElement("div");
    (tmp.innerHTML = genitalCardHTML({}, gender)), c.appendChild(tmp.firstElementChild);
}),
    (window.addStructCard = (containerId, kind) => {
        const c = document.getElementById(containerId),
            fn = __structCardRenderers[kind];
        if (!c || !fn) return;
        const tmp = document.createElement("div");
        (tmp.innerHTML = fn({})), c.appendChild(tmp.firstElementChild);
    }),
    (window.addTag = (containerId) => {
        const c = document.getElementById(containerId);
        if (!c) return;
        const input = c.querySelector(".tag-input"),
            v = (input.value || "").trim();
        if (!v) return;
        const chips = c.querySelector(".tag-chips");
        if ([...chips.querySelectorAll(".tag-chip")].some((ch) => ch.dataset.tag.toLowerCase() === v.toLowerCase()))
            return void (input.value = "");
        const tmp = document.createElement("div");
        (tmp.innerHTML = tagChipHTML(v)), chips.appendChild(tmp.firstElementChild), (input.value = "");
    });
if (!window.__structDelegationBound) {
    window.__structDelegationBound = true;
    document.addEventListener("click", (ev) => {
        const btn = ev.target && ev.target.closest ? ev.target.closest("[data-act]") : null;
        if (!btn) return;
        const act = btn.getAttribute("data-act");
        if ("struct-remove" === act) {
            const c = btn.closest(".struct-card");
            c && c.remove();
        } else if ("genital-add" === act)
            window.addGenitalCard(btn.getAttribute("data-target"), btn.getAttribute("data-gender"));
        else if ("struct-add" === act)
            window.addStructCard(btn.getAttribute("data-target"), btn.getAttribute("data-kind"));
        else if ("tag-add" === act) window.addTag(btn.getAttribute("data-target"));
        else if ("tag-remove" === act) {
            const c = btn.closest(".tag-chip");
            c && c.remove();
        }
    });
    document.addEventListener("keydown", (ev) => {
        const t = ev.target;
        if (t && t.classList && t.classList.contains("tag-input") && "Enter" === ev.key)
            ev.preventDefault(), window.addTag(t.getAttribute("data-tag-target"));
    });
    const __comboFilter = (inp, menu) => {
        const q = (inp.value || "").toLowerCase();
        let shown = 0;
        menu.querySelectorAll(".combo-opt").forEach((o) => {
            const m = !q || o.textContent.toLowerCase().indexOf(q) >= 0;
            (o.style.display = m && shown < 60 ? "block" : "none"), m && shown++;
        });
    };
    const __comboMenuFor = (el) => {
        const inp = el && el.closest ? el.closest(".combo-input") : null;
        if (!inp) return null;
        return { inp, menu: inp.parentElement && inp.parentElement.querySelector(".combo-menu") };
    };
    document.addEventListener("focusin", (ev) => {
        const r = __comboMenuFor(ev.target);
        r && r.menu && (__comboFilter(r.inp, r.menu), (r.menu.style.display = "block"));
    });
    document.addEventListener("input", (ev) => {
        const r = __comboMenuFor(ev.target);
        r && r.menu && (__comboFilter(r.inp, r.menu), (r.menu.style.display = "block"));
    });
    document.addEventListener("focusout", (ev) => {
        const r = __comboMenuFor(ev.target);
        r && r.menu && setTimeout(() => (r.menu.style.display = "none"), 150);
    });
    document.addEventListener("mousedown", (ev) => {
        const opt = ev.target && ev.target.closest ? ev.target.closest(".combo-opt") : null;
        if (!opt) return;
        ev.preventDefault();
        const wrap = opt.closest(".combo-wrap"),
            inp = wrap && wrap.querySelector(".combo-input");
        if (!inp) return;
        inp.value = opt.textContent;
        const menu = wrap.querySelector(".combo-menu");
        menu && (menu.style.display = "none"),
            inp.dispatchEvent(new Event("change", { bubbles: true })),
            inp.classList.contains("tag-input") && window.addTag(inp.getAttribute("data-tag-target"));
    });
}
function collectGenitalCards(containerId, legacyFallback) {
    const c = document.getElementById(containerId);
    if (c)
        return [...c.querySelectorAll("[data-genital-card]")]
            .map((card) => ({
                type: (card.querySelector(".g-type")?.value || "").trim(),
                size: (card.querySelector(".g-size")?.value || "").trim(),
                characteristics: (card.querySelector(".g-char")?.value || "").trim(),
            }))
            .filter((x) => x.type || x.size || x.characteristics);
    return legacyFallback && (legacyFallback.type || legacyFallback.size || legacyFallback.characteristics)
        ? [
              {
                  type: legacyFallback.type || "",
                  size: legacyFallback.size || "",
                  characteristics: legacyFallback.characteristics || "",
              },
          ]
        : [];
}
function collectPiercings(containerId) {
    const c = document.getElementById(containerId);
    return c
        ? [...c.querySelectorAll("[data-piercing-card]")]
              .map((card) => ({
                  location: (card.querySelector(".p-loc")?.value || "").trim(),
                  type: (card.querySelector(".p-type")?.value || "").trim(),
                  description: (card.querySelector(".p-desc")?.value || "").trim(),
              }))
              .filter((x) => x.location || x.type || x.description)
        : [];
}
function collectTattoos(containerId) {
    const c = document.getElementById(containerId);
    return c
        ? [...c.querySelectorAll("[data-tattoo-card]")]
              .map((card) => ({
                  location: (card.querySelector(".t-loc")?.value || "").trim(),
                  description: (card.querySelector(".t-desc")?.value || "").trim(),
                  style: (card.querySelector(".t-style")?.value || "").trim(),
              }))
              .filter((x) => x.location || x.description || x.style)
        : [];
}
function collectFeatureList(containerId) {
    const c = document.getElementById(containerId);
    return c
        ? [...c.querySelectorAll("[data-feature-card] .f-val")].map((i) => (i.value || "").trim()).filter(Boolean)
        : [];
}
function collectTags(containerId) {
    const c = document.getElementById(containerId);
    return c ? [...c.querySelectorAll(".tag-chip")].map((ch) => ch.dataset.tag).filter(Boolean) : [];
}
function enhanceComboInputs(map) {
    Object.entries(map).forEach(([id, opts]) => {
        const el = document.getElementById(id);
        if (!el || "INPUT" !== el.tagName) return;
        wrapInputAsCombo(el, opts);
    });
}
function upgradeCreationFormCombos(prefix) {
    const O = APPEARANCE_OPTIONS,
        both = O.chestSizeFemale.concat(O.chestSizeMale),
        hb = O.height.concat(O.build);
    enhanceComboInputs({
        [prefix + "HairColor"]: O.hairColor,
        [prefix + "HairStyle"]: O.hairStyle,
        [prefix + "HairLength"]: O.hairLength,
        [prefix + "HairTexture"]: O.hairTexture,
        [prefix + "EyeColor"]: O.eyeColor,
        [prefix + "EyeShape"]: O.eyeShape,
        [prefix + "FaceShape"]: O.faceShape,
        [prefix + "Nose"]: O.nose,
        [prefix + "Lips"]: O.lips,
        [prefix + "Jawline"]: O.jawline,
        [prefix + "SkinTone"]: O.skinTone,
        [prefix + "SkinTexture"]: O.skinTexture,
        [prefix + "BodyShape"]: O.bodyShape,
        [prefix + "ButtSize"]: O.buttSize,
        [prefix + "Legs"]: O.legs,
        [prefix + "ChestSize"]: both,
        [prefix + "BreastSize"]: both,
        [prefix + "Fashion"]: O.fashion,
        [prefix + "Accessories"]: O.accessories,
        [prefix + "DistinguishingFeature"]: O.distinguishingFeature,
        [prefix + "NotableFeatures"]: O.distinguishingFeature,
        [prefix + "HeightBuild"]: hb,
        [prefix + "BuildDetails"]: O.build,
    });
}
function injectStructuredSections(prefix, opts) {
    opts = opts || {};
    const phys = opts.physical || {},
        gender = opts.gender || phys.gender || "female";
    if (document.getElementById(prefix + "GenitalCards") || document.getElementById(prefix + "PiercingCards"))
        return;
    const gt = document.getElementById(prefix + "GenitalType");
    if (gt) {
        const cell = gt.closest("div"),
            grid = cell && cell.parentElement;
        grid &&
            (grid.innerHTML = `<div style="grid-column:1/-1;"><label style="display:block; margin-bottom:6px; color:var(--text-dim); font-size:0.85rem;">Genitals (add one or more sets)</label>${renderGenitalCards(prefix + "GenitalCards", normalizeGenitals(phys), gender)}</div>`);
    }
    const anchorEl =
        document.getElementById(prefix + "DistinguishingFeature") ||
        document.getElementById(prefix + "NotableFeatures") ||
        document.getElementById(prefix + "Accessories") ||
        document.getElementById(prefix + "Fashion");
    if (!anchorEl) return;
    const host = anchorEl.closest('[style*="background"]') || anchorEl.parentElement;
    if (!host || !host.parentElement) return;
    const makeSection = (title, color, inner) => {
        const div = document.createElement("div");
        return (
            (div.style.cssText =
                "background: var(--surface-2); padding: 15px; border-radius: 8px; margin-bottom: 15px;"),
            (div.innerHTML = `<h4 style="margin:0 0 12px 0; color:${color};">${title}</h4>${inner}`),
            div
        );
    };
    let after = host;
    if (!gt) {
        const gsec = makeSection(
            "🔞 Anatomy / Genitals",
            "var(--danger)",
            renderGenitalCards(prefix + "GenitalCards", normalizeGenitals(phys), gender)
        );
        host.parentElement.insertBefore(gsec, after.nextSibling), (after = gsec);
    }
    const bsec = makeSection(
        "💎 Piercings & Tattoos",
        "var(--accent-gold)",
        `<div style="margin-bottom:10px;">${renderPiercingCards(prefix + "PiercingCards", phys.piercings || [])}</div><div>${renderTattooCards(prefix + "TattooCards", phys.tattoos || [])}</div>`
    );
    host.parentElement.insertBefore(bsec, after.nextSibling);
}
function upgradeTagPicker(inputId, containerHostId, options) {
    const input = document.getElementById(inputId);
    if (!input || document.getElementById(inputId + "_tags")) return;
    const values = (input.value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const holder = document.createElement("div");
    holder.innerHTML = renderTagPicker(inputId + "_tags", values, options);
    input.after(holder.firstElementChild), (input.style.display = "none");
}
function normalizeGenitals(physical) {
    if (!physical || "object" != typeof physical) return [];
    let g = physical.genitals;
    Array.isArray(g)
        ? (g = g.filter((x) => x && (x.type || x.size || x.characteristics)))
        : (g = g && "object" == typeof g && (g.type || g.size || g.characteristics) ? [g] : []);
    return (physical.genitals = g);
}
function genitalsToString(arr) {
    arr = (arr || []).filter((x) => x && (x.type || x.size));
    if (!arr.length) return "";
    const parts = arr.map((x) =>
        `${[x.size, x.type].filter(Boolean).join(" ")}${x.characteristics ? ", " + x.characteristics : ""}`.trim()
    );
    return `Genitals: ${parts.join("; and ")}.`;
}
function migratePhysicalSchema(physical) {
    if (!physical || "object" != typeof physical) return physical;
    if (physical.race) {
        const raw = String(physical.race).toLowerCase().trim();
        // Only remap keys the registry actually knows; leave genuine custom races untouched.
        if (RACES[raw] || RACE_REMAP[raw]) {
            const cr = canonicalRace(raw);
            physical.race = cr;
            if ("human" !== cr) {
                if (!physical.bio || "object" != typeof physical.bio)
                    physical.bio = bioFromLegacyRaceFeatures(cr, physical.raceFeatures);
                physical.raceFeatures = deriveRaceFeaturesFromBio(cr, physical.bio);
            }
        }
    }
    return (
        normalizeGenitals(physical),
        Array.isArray(physical.distinguishingFeatures) ||
            (physical.distinguishingFeatures = physical.distinguishingFeature
                ? [physical.distinguishingFeature]
                : []),
        Array.isArray(physical.piercings) || (physical.piercings = []),
        Array.isArray(physical.tattoos) || (physical.tattoos = []),
        physical
    );
}
function genitalCapabilities(physical, gender) {
    const arr = normalizeGenitals(physical || {});
    let hasPenis = false,
        hasVagina = false;
    arr.forEach((x) => {
        const tt = String(x.type || "").toLowerCase();
        (tt.includes("penis") || tt.includes("cock") || tt.includes("phallo")) && (hasPenis = true),
            (tt.includes("vagina") ||
                tt.includes("pussy") ||
                tt.includes("clitoris") ||
                tt.includes("pre-op anatomy")) &&
                (hasVagina = true);
    });
    if (!arr.length) {
        const i = normalizeGender(gender);
        "male" === i || "transWoman" === i
            ? (hasPenis = true)
            : "femaleFuta" === i
              ? ((hasPenis = true), (hasVagina = true))
              : (hasVagina = true);
    }
    return { hasPenis, hasVagina };
}
function normalizeGender(g) {
    if (null == g) return "female";
    const raw = String(g).trim(),
        s = raw.toLowerCase().replace(/[\s_\-]/g, "");
    if (/^(transman|ftm|transmasc|transmasculine)$/.test(s)) return "transMan";
    if (/^(transwoman|mtf|transfem|transfeminine)$/.test(s)) return "transWoman";
    if (/futa|futanari|dickgirl/.test(s)) return "femaleFuta";
    if (/^(male|m|man|boy|guy)$/.test(s)) return "male";
    if (/^(female|f|woman|girl|gal)$/.test(s)) return "female";
    if (/^(nonbinary|enby|nb|genderfluid|agender|genderqueer)$/.test(s)) return "nonbinary";
    return raw;
}
function formatGenderLabel(g) {
    const c = normalizeGender(g);
    return (
        {
            male: "Male",
            female: "Female",
            transMan: "Trans Man",
            transWoman: "Trans Woman",
            femaleFuta: "Female Futa",
            nonbinary: "Non-binary",
        }[c] || c
    );
}
// Collapses runs of an immediately-repeated word ("faint eyes eyes" → "faint eyes",
// "beige skin skin" → "beige skin"). Appearance fields sometimes store the noun inside the
// value (color = "faint eyes"); templates then append the noun again. Adjacent duplicate words
// are always errors in this controlled vocabulary, so collapsing them is safe.
function dedupeAdjacentWords(s) {
    return String(s || "").replace(/\b([A-Za-z]+)(?:\s+\1\b)+/gi, "$1");
}
function syncPhysicalDescriptions(p, gender) {
    if (!p || "object" != typeof p) return p;
    const g = normalizeGender(gender || p.gender || "female");
    p.gender = g;
    migratePhysicalSchema(p);
    p.distinguishingFeature = (p.distinguishingFeatures || []).filter(Boolean).join(", ");
    const isMasc = "male" === g || "transMan" === g;
    // Race-aware composition (slime gel / cyborg human+). null = run the human inline assembly.
    const _plan = getRaceBodyPlan(p.race);
    if (p.hair) {
        const len = p.hair.length || "",
            tex = p.hair.texture || "",
            col = p.hair.color || "",
            sty = p.hair.style || "";
        const _hc = composeHairDescriptor(_plan, { sty }, p.bio);
        p.hair.full = _hc !== null ? _hc : dedupeAdjacentWords(`${len} ${tex} ${col} hair, ${sty}`.replace(/\s+/g, " ").trim());
    }
    if (p.eyes) {
        const _ec = composeEyeDescriptor(_plan, { col: p.eyes.color, shape: p.eyes.shape }, p.bio);
        p.eyes.full = _ec !== null ? _ec : dedupeAdjacentWords(`${p.eyes.shape || ""} ${p.eyes.color || ""} eyes`.replace(/\s+/g, " ").trim());
    }
    if (p.skin) {
        const _sc = composeSkinDescriptor(_plan);
        p.skin.full = _sc !== null ? _sc : dedupeAdjacentWords(`${p.skin.texture || ""} ${p.skin.tone || ""} skin`.replace(/\s+/g, " ").trim());
    }
    if (p.face) {
        const _fc = composeFaceDescriptor(_plan);
        if (_fc !== null) p.face.full = _fc;
        else {
            const fp = [p.face.nose, p.face.lips, p.face.cheekbones, p.face.jawline].filter(Boolean).join(", ");
            p.face.full = `${p.face.shape || ""} face${fp ? " with " + fp : ""}`.replace(/\s+/g, " ").trim();
        }
    }
    if (p.body) {
        p.body.chestDescriptor = isMasc
            ? "chest"
            : p.body.chestDescriptor && "chest" !== p.body.chestDescriptor
              ? p.body.chestDescriptor
              : "bust";
        const shape = p.body.shape || p.bodyShape || "average",
            chestSize = p.body.chestSize || p.body.breastSize || "",
            desc = p.body.chestDescriptor,
            chestPhrase = chestSize ? ("chest" === desc ? `${chestSize} chest` : `${chestSize} ${desc}`) : "",
            butt = p.body.buttSize || "",
            legs = p.body.legs || "";
        p.body.full = `${shape} physique${chestPhrase ? " with " + chestPhrase : ""}${butt ? ", " + butt + " bottom" : ""}${legs ? ", " + legs : ""}`;
        p.bodyShape = shape;
    }
    normalizeGenitals(p).forEach((x) => {
        const sz = x.size || "",
            ty = x.type || "",
            ch = x.characteristics || "";
        x.full = `${sz} ${ty}${ch ? ", " + ch : ""}`.replace(/\s+/g, " ").trim();
    });
    (p.height || p.build) && (p.heightBuild = [p.height, p.build].filter(Boolean).join(", "));
    let raceFeat = "";
    const rf = p.raceFeatures;
    if (rf && "object" == typeof rf && p.race && "human" !== p.race) {
        const u = [];
        rf.ears && u.push(rf.ears),
            rf.tail && u.push(rf.tail),
            rf.fur && u.push(rf.fur),
            rf.furPattern && u.push(rf.furPattern),
            rf.horns && u.push(rf.horns),
            rf.skin && u.push(rf.skin),
            rf.wings && u.push(rf.wings),
            rf.eyes && u.push(rf.eyes),
            Array.isArray(rf.other) && rf.other.length && u.push(...rf.other),
            u.length && (raceFeat = ` Race features: ${u.join(", ")}.`);
    }
    const genderNoun = isMasc ? "man" : "woman",
        raceDesc = p.race && "human" !== p.race && rf && rf.description ? rf.description + " " : "",
        ethDesc =
            !raceDesc && p.ethnicityFeatures && p.ethnicityFeatures.description
                ? p.ethnicityFeatures.description + " "
                : "",
        prefix = raceDesc || ethDesc,
        m = p.height || "",
        z = p.build || "",
        hLen = p.hair?.length || "",
        hTex = p.hair?.texture || "",
        hCol = p.hair?.color || "",
        hSty = p.hair?.style || "",
        eCol = p.eyes?.color || "",
        eShape = p.eyes?.shape || "",
        sTone = p.skin?.tone || "",
        sTex = p.skin?.texture || "",
        lead = [m, z].filter(Boolean).join(" ");
    const _shHair = (() => { const c = composeHairDescriptor(_plan, { sty: hSty }, p.bio); return c !== null ? c : `${[hLen, hCol].filter(Boolean).join(" ")} hair`; })();
    const _shEyes = (() => { const c = composeEyeDescriptor(_plan, { col: eCol, shape: eShape }, p.bio); return c !== null ? c : `${eCol} eyes`; })();
    const _shSkin = (() => { const c = composeSkinDescriptor(_plan); return c !== null ? c : `${sTone} skin`; })();
    p.shortDescription = dedupeAdjacentWords(
        `${lead} ${prefix}${genderNoun} with ${[_shHair, _shEyes, _shSkin].filter(Boolean).join(", ")}`
            .replace(/\s+/g, " ")
            .replace(/\s+,/g, ",")
            .trim()
    );
    const ef = p.ethnicityFeatures,
        ethParen = ef && ef.description ? ` (${ef.description}${ef.subType ? " - " + ef.subType : ""})` : "",
        faceShape = p.face?.shape || "",
        faceParts = [p.face?.nose, p.face?.lips, p.face?.cheekbones, p.face?.jawline].filter(Boolean).join(", "),
        bodyFull = p.body?.full || "",
        genitalsStr = genitalsToString(p.genitals),
        genitalStr = genitalsStr ? " " + genitalsStr : "",
        featList = (p.distinguishingFeatures || []).filter(Boolean),
        distinguishing = featList.length ? ` ${featList.join(", ")}.` : "",
        piercingsArr = (p.piercings || [])
            .filter((x) => x && (x.location || x.type))
            .map((x) =>
                `${[x.type, x.location && "on " + x.location].filter(Boolean).join(" ")}${x.description ? " (" + x.description + ")" : ""}`.trim()
            ),
        tattoosArr = (p.tattoos || [])
            .filter((x) => x && (x.location || x.description))
            .map((x) =>
                `${x.description || "tattoo"}${x.location ? " on " + x.location : ""}${x.style ? " (" + x.style + ")" : ""}`.trim()
            ),
        bodyMods = `${piercingsArr.length ? " Piercings: " + piercingsArr.join(", ") + "." : ""}${tattoosArr.length ? " Tattoos: " + tattoosArr.join(", ") + "." : ""}`,
        style = p.fashion ? ` Style: ${p.fashion}.` : "";
    const _fdHair = (() => { const c = composeHairDescriptor(_plan, { sty: hSty }, p.bio); return c !== null ? c : `${[hLen, hTex, hCol].filter(Boolean).join(" ")} hair${hSty ? " (" + hSty + ")" : ""}`; })();
    const _fdEyes = (() => { const c = composeEyeDescriptor(_plan, { col: eCol, shape: eShape }, p.bio); return c !== null ? c : `${[eShape, eCol].filter(Boolean).join(" ")} eyes`; })();
    const _fdSkin = (() => { const c = composeSkinDescriptor(_plan); return c !== null ? c : `${[sTex, sTone].filter(Boolean).join(" ")} skin`; })();
    const _fdFace = (() => { const c = composeFaceDescriptor(_plan); if (c !== null) return c ? " " + c + "." : ""; return faceShape ? " " + faceShape + " face" + (faceParts ? " with " + faceParts : "") + "." : ""; })();
    return (
        (p.fullDescription = dedupeAdjacentWords(
            `${lead} ${prefix}${genderNoun}${ethParen} with ${[_fdHair, _fdEyes, _fdSkin].filter(Boolean).join(", ")}.${_fdFace}${raceFeat}${bodyFull ? " " + bodyFull + "." : ""}${genitalStr}${distinguishing}${bodyMods}${style}`
                .replace(/\s+/g, " ")
                .replace(/\s+,/g, ",")
                .replace(/\.\.+/g, ".")
                .trim()
        )),
        p
    );
}
function getPhysicalDescriptionForPrompt(e, opts = {}) {
    e.physical || (e.physical = generateDetailedPhysicalAppearance(e.gender || "female", e.race || "human")),
        e.physical.fullDescription ||
            (e.physical = generateDetailedPhysicalAppearance(e.gender || "female", e.race || "human"));
    const t = e.physical,
        n = [];
    t.heightBuild ? n.push(t.heightBuild) : t.height && t.build && n.push(`${t.height}, ${t.build}`);
    const a = e.race || t.race || "human";
    a && "human" !== a && t.raceFeatures?.description && n.push(t.raceFeatures.description),
        ("human" !== a && a) || !t.ethnicityFeatures?.description || n.push(t.ethnicityFeatures.description);
    const o = e.gender || t.gender || "female",
        i = "male" === o || "transMan" === o ? "man" : "woman";
    n.push(i);
    // Race-aware composition: slime renders hair/eyes/skin/face as gel; cyborg keeps human
    // structure (its chrome detail arrives via raceFeatures). null = use the human inline path.
    const _plan = getRaceBodyPlan(a),
        _bio = t.bio || {};
    const s = t.hair?.color || t.hairColor || "",
        r = t.hair?.style || t.hairStyle || "",
        l = t.hair?.length || t.hairLength || "",
        c = t.hair?.texture || t.hairTexture || "";
    const _hairC = composeHairDescriptor(_plan, { sty: r }, _bio);
    if (_hairC !== null) _hairC && n.push(_hairC);
    else if (s || r || l) {
        const e = [l, c, s, "hair"].filter(Boolean);
        r && e.push(`(${r})`), n.push(e.join(" "));
    }
    const d = t.eyes?.color || t.eyeColor || "",
        p = t.eyes?.shape || t.eyeShape || "";
    const _eyeC = composeEyeDescriptor(_plan, { col: d, shape: p }, _bio);
    if (_eyeC !== null) _eyeC && n.push(_eyeC);
    else (d || p) && n.push(`${p ? p + " " : ""}${d} eyes`);
    const m = t.skin?.tone || t.skinTone || "",
        u = t.skin?.texture || "";
    const _skinC = composeSkinDescriptor(_plan);
    if (_skinC !== null) _skinC && n.push(_skinC);
    else m && n.push(`${u ? u + " " : ""}${m} skin`);
    const g = t.face || {},
        h = [];
    const _faceC = composeFaceDescriptor(_plan);
    if (_faceC !== null) _faceC && n.push(_faceC);
    else {
        g.shape && h.push(`${g.shape} face`),
            g.nose && h.push(g.nose),
            g.lips && h.push(g.lips),
            g.cheekbones && h.push(g.cheekbones),
            g.jawline && h.push(g.jawline),
            h.length > 0 && n.push(h.join(", "));
    }
    if (t.raceFeatures && "human" !== a) {
        const e = [];
        t.raceFeatures.ears && e.push(t.raceFeatures.ears),
            t.raceFeatures.tail && e.push(t.raceFeatures.tail),
            t.raceFeatures.horns && e.push(t.raceFeatures.horns),
            t.raceFeatures.fur && e.push(t.raceFeatures.fur),
            t.raceFeatures.wings && e.push(t.raceFeatures.wings),
            // When the human skin slot was suppressed (slime: skinMode raceOnly), surface the
            // species body itself (e.g. "translucent sky-blue gel body") so its colour isn't lost.
            "raceOnly" === _plan.skinMode && t.raceFeatures.skin && e.push(t.raceFeatures.skin),
            t.raceFeatures.other && t.raceFeatures.other.length > 0 && e.push(...t.raceFeatures.other),
            e.length > 0 && n.push(`Race features: ${e.join(", ")}`);
        const _rd = RACES[canonicalRace(a)];
        _rd && _rd.allure && _rd.allure.length && n.push(_rd.allure[Math.floor(Math.random() * _rd.allure.length)]);
    }
    if (
        ("string" == typeof t.raceFeatures && t.raceFeatures && n.push(`${e.race} features: ${t.raceFeatures}`),
        e.customRace && e.customRace.details)
    ) {
        const t = e.customRace.details
            .filter((e) => e.name || e.description)
            .map((e) => (e.name && e.description ? `${e.name} (${e.description})` : e.name || e.description))
            .join(", ");
        t && n.push(`Custom ${e.race} traits: ${t}`);
    }
    const y = t.body || {},
        f = y.shape || t.bodyShape || "",
        b = y.chestSize || y.breastSize || t.breastSize || t.chestSize || "",
        v = y.buttSize || t.buttSize || "",
        w = y.legs || "",
        x = y.chestDescriptor || ("male" === o || "transMan" === o ? "chest" : "bust");
    if (f || b || v) {
        const e = [];
        f && e.push(`${f} physique`),
            b && e.push(`${b} ${x}`),
            v && e.push(`${v} bottom`),
            w && e.push(w),
            n.push(e.join(", "));
    }
    migratePhysicalSchema(t);
    // Genitals are omitted for clothed / non-explicit contexts (opts.noGenitals) so a SFW
    // selfie/fashion image prompt isn't flooded with anatomical detail it can't show.
    const gStr = opts.noGenitals ? "" : genitalsToString(t.genitals);
    gStr && n.push(gStr.replace(/\.\s*$/, ""));
    const _feat = (t.distinguishingFeatures || []).filter(Boolean);
    _feat.length && n.push(_feat.join(", "));
    const _pierce = (t.piercings || [])
        .filter((x) => x && (x.location || x.type))
        .map(
            (x) =>
                `${[x.type, x.location && "on " + x.location].filter(Boolean).join(" ")}${x.description ? " (" + x.description + ")" : ""}`.trim()
        );
    _pierce.length && n.push(`Piercings: ${_pierce.join(", ")}`);
    const _tat = (t.tattoos || [])
        .filter((x) => x && (x.location || x.description))
        .map(
            (x) =>
                `${x.description || "tattoo"}${x.location ? " on " + x.location : ""}${x.style ? " (" + x.style + ")" : ""}`.trim()
        );
    _tat.length && n.push(`Tattoos: ${_tat.join(", ")}`);
    // Phase 4 Bug B: a persisted undressed sceneState suppresses re-adding attire (the image-revert
    // chokepoint). Default-state NPCs are unaffected, so existing image/dialogue output is unchanged.
    const _effNude = opts.nude || ("function" == typeof sceneStateIsUndressed && sceneStateIsUndressed(e));
    _effNude ||
        (t.fashion && n.push(`Style: ${t.fashion}`),
        t.accessories &&
            "none" !== t.accessories.toLowerCase() &&
            "no accessories" !== t.accessories.toLowerCase() &&
            n.push(`Accessories: ${t.accessories}`));
    if (_effNude && "function" == typeof activeSceneState) {
        const _sc = activeSceneState(e);
        _sc && _sc.clothing && n.push(`Currently ${_sc.clothing}`);
    }
    let k = dedupeAdjacentWords(n.filter(Boolean).join(". ").replace(/\.\./g, ".")) + ".";
    const T = getActiveFlags(e);
    if (T.length > 0) {
        const e = T.filter(
            (e) =>
                "pregnant" === e.key ||
                "chastity" === e.key ||
                "pierced" === e.key ||
                "tattooed" === e.key ||
                "collar" === e.key ||
                "locked" === e.key ||
                "plugged" === e.key ||
                "marked" === e.key ||
                "bruised" === e.key ||
                "leashed" === e.key ||
                "bound" === e.key ||
                e.affectsContext
        );
        e.length > 0 &&
            ((k += "\n\n🏷️ CURRENT PHYSICAL STATE:"),
            e.forEach((e) => {
                e.playerDescription && (k += `\n- ${e.playerDescription}`),
                    e.aiGuidance && (k += ` (${e.aiGuidance})`);
            }));
    }
    return k;
}
