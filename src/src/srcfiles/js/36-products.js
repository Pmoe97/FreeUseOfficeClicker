// ============================================================================
// 36-products — Products: unlock levels, start/click product, image styles, cash formatting helpers.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

const PRODUCT_UNLOCK_REQUIRED_LEVEL = 5;
function getPreviousProductInLocation(e) {
    const t = gameState.products.filter((t) => t.locationId === e.locationId),
        n = t.findIndex((t) => t.id === e.id);
    return n <= 0 ? null : t[n - 1];
}
function canUnlockProduct(e) {
    if (e.unlocked) return { canUnlock: !1, reason: "Already unlocked", previousProduct: null };
    if ((gameState.globalUpgrades?.expressPermit?.[e.locationId] || 0) > 0)
        return { canUnlock: !0, reason: null, previousProduct: null };
    const t = getPreviousProductInLocation(e);
    return t
        ? t.unlocked
            ? t.level < PRODUCT_UNLOCK_REQUIRED_LEVEL
                ? {
                      canUnlock: !1,
                      reason: `"${t.name}" must be Level ${PRODUCT_UNLOCK_REQUIRED_LEVEL} (currently Lv${t.level})`,
                      previousProduct: t,
                  }
                : { canUnlock: !0, reason: null, previousProduct: t }
            : { canUnlock: !1, reason: `Unlock "${t.name}" first`, previousProduct: t }
        : { canUnlock: !0, reason: null, previousProduct: null };
}
function unlockProduct(e) {
    const t = gameState.products.find((t) => t.id === e);
    if (!t) return;
    if (t.unlocked) return showNotification("Product already unlocked!");
    const n = canUnlockProduct(t);
    if (!n.canUnlock) return showNotification(`🔒 ${n.reason}`, "warning");
    const i = getProductUnlockCost(t);
    if (gameState.cash < i) return showNotification("Not enough cash to unlock this product!");
    (gameState.cash -= i),
        (t.unlocked = !0),
        showNotification(`${t.name} unlocked! You can now start selling.`),
        checkAndPreloadBossImage(t.locationId),
        updateProductsList(),
        updateBusinessTab(),
        updateUI();
}
function startOrClickProduct(e) {
    const t = gameState.products.find((t) => t.id === e);
    if (!t) return;
    t.running
        ? (t.timeRemainingMs = Math.max(0, t.timeRemainingMs - clickReductionMs(t)))
        : ((t.running = !0), (t.timeRemainingMs = currentCycleTimeMs(t)));
    const n = $(`selltxt-${t.id}`);
    n && (n.textContent = t.running ? "Click: -1s" : "Sell");
}
function applyImageStyle(e) {
    let t = extractText(e);
    "object" == typeof e && e && e.prompt && (t = extractText(e.prompt));
    const n = gameState.settings?.imageStyle || "photorealistic";
    console.log("[Image Style] Base prompt length:", t.length, "chars"),
        console.log("[Image Style] Selected style:", n);
    const a = {
            photorealistic:
                "photorealistic, professional DSLR photography, 85mm lens, f/1.4 aperture, natural lighting, high detail, 8k resolution, sharp focus, bokeh background, realistic skin texture, professional color grading, lifelike proportions",
            professional:
                "professional studio portrait, three-point lighting setup, seamless backdrop, commercial headshot, high-end retouching, polished composition, corporate photography, clean and refined, natural expression, business quality",
            cinematic:
                "cinematic movie still, dramatic volumetric lighting, film grain texture, anamorphic lens flare, Hollywood blockbuster quality, 2.39:1 aspect ratio feel, color graded with teal and orange, atmospheric depth, professional cinematography, story-driven composition",
            portrait:
                "fine art portrait photography, Rembrandt lighting, classical composition, gallery exhibition quality, medium format camera, rich tonal range, timeless elegance, sophisticated mood, museum-worthy, professional fine art print",
            fashion:
                "high fashion editorial photography, dramatic pose, runway style, Vogue magazine quality, bold lighting, designer aesthetic, glamorous composition, professional makeup and styling, contemporary fashion photography, striking presence",
            artistic:
                "artistic painting style, impressionist brush strokes, oil on canvas texture, rich vibrant colors, fine art composition, museum quality, painterly detail, artistic lighting, expressive technique, masterwork quality",
            watercolor:
                "watercolor painting, soft wet-on-wet technique, flowing pigments, delicate color bleeds, artistic paper texture, translucent layers, dreamy atmosphere, hand-painted quality, gentle gradients, traditional medium",
            oilpainting:
                "classical oil painting, thick impasto brushwork, Renaissance technique, rich color palette, museum masterpiece, old masters style, detailed layering, warm lighting, timeless composition, fine art quality, textured canvas",
            vintage:
                "vintage 1950s pinup art style, Gil Elvgren inspiration, retro charm, classic Americana, nostalgic color palette, playful pose, golden age illustration, period-accurate fashion, wholesome glamour, mid-century aesthetic, hand-painted quality",
            noir: "film noir style, black and white photography, dramatic chiaroscuro lighting, high contrast shadows, 1940s Hollywood aesthetic, moody atmosphere, detective movie feel, cigarette smoke haze, venetian blind shadows, classic noir composition",
            "3d": "3D rendered, Octane render engine, Cinema 4D quality, photorealistic PBR materials, subsurface scattering on skin, high-poly topology, physically-based shading, HDRI environment lighting, ray-traced reflections, ultra-detailed normal maps, 4K textures, global illumination, ambient occlusion, professional CG quality",
            celshaded:
                "cel-shaded 3D rendering, toon shader, bold outlines, flat color regions, anime-inspired lighting, stylized shading, video game cutscene quality, clean geometric forms, vibrant saturated colors, artistic edge detection",
            anime: "anime art style, high-quality manga illustration, detailed cel-shading, expressive large eyes, clean precise linework, Japanese animation studio quality, vibrant color palette, dynamic shading, professional character design, Kyoto Animation level detail",
            cartoon:
                "modern cartoon illustration, clean vector-style linework, bold expressive outlines, flat color fills with gradient accents, Pixar-inspired character design, playful proportions, appealing silhouette, contemporary animation style, friendly and approachable",
            digital:
                "digital illustration, professional concept art quality, Wacom tablet artwork, industry-standard rendering, fantasy game asset style, detailed painting techniques, contemporary digital artist, ArtStation portfolio quality, polished and refined",
            fantasy:
                "fantasy art illustration, magical atmosphere, ethereal lighting effects, detailed armor and clothing, mystical aura, RPG game art quality, mythical setting, glowing magical elements, epic composition, enchanted mood, professional fantasy artist quality",
            scifi: "sci-fi concept art, futuristic technology, neon accent lights, cybernetic elements, blade runner aesthetic, advanced materials, holographic displays, sleek design, professional game concept art, detailed technical rendering, speculative future setting",
            neon: "neon cyberpunk aesthetic, vibrant pink and cyan lighting, dark moody atmosphere, reflective wet surfaces, futuristic urban setting, glowing neon signs, synthwave color palette, blade runner meets tron, electric atmosphere, night city vibes",
            dreamy: "soft dreamy aesthetic, pastel color palette, gentle diffused lighting, ethereal glow, romantic atmosphere, bokeh light particles, hazy soft focus, tender mood, whimsical feeling, fairy tale quality, delicate and gentle",
            custom: gameState.settings?.customStylePrompt || "high quality, detailed",
        },
        o = a[n] || a.photorealistic;
    let i = t;
    const s = getCustomWorldContext("image");
    s && (i = `${s}, ${i}`), i.toLowerCase().includes(o.split(",")[0].toLowerCase()) || (i = `${i}, ${o}`);
    const r = i.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
    return (
        console.log("[Image Style] Final prompt ending:", "..." + r.slice(-120)),
        console.log("[Image Style] ✅ Style directive applied successfully"),
        { prompt: r }
    );
}
// When the player IS the camera (POV / selfie) they must not be drawn. The text model likes to
// write "next to the player" / "with the player" anyway, and the image model reads that as a
// second person (usually a man) hovering in the background. Turn looks at the player into looks
// at the camera and drop every other mention.
function scrubPlayerReferences(e) {
    if (!e || "string" != typeof e) return e;
    const who = "(?:the\\s+)?(?:player|boss|viewer)(?:'s)?",
        t = e
            .replace(
                new RegExp(`\\b(looking|looks|smiling|smiles|gazing|gazes|staring|stares|glancing|glances|winking|winks|eye contact)\\s+(?:at|with)\\s+${who}`, "gi"),
                (m, v) => (/eye contact/i.test(v) ? "eye contact with the camera" : `${v} at the camera`)
            )
            .replace(
                new RegExp(`,?\\s*\\b(?:(?:and|&)\\s+${who}|(?:close(?:\\s+to)?|closer\\s+to|next(?:\\s+to)?|near|beside|alongside|with|facing|opposite|across\\s+from|touching|kissing|hugging|embracing|leaning\\s+(?:on|against|into))\\s+${who})(?=\\W|$)`, "gi"),
                ""
            )
            .replace(/\b(?:two|2)\s+(?:people|persons|characters)\b/gi, "one person")
            .replace(/\bthe\s+player\b/gi, "the camera");
    return t
        .replace(/\(\s*\)/g, "")
        .replace(/([,;:])\s*([,.;:])/g, "$2")
        .replace(/\s+([,.;:])/g, "$1")
        .replace(/\s{2,}/g, " ")
        .trim();
}
function applyPerspective(e, t = !1) {
    if (t) return e;
    const n = gameState.settings?.imagePerspective || "standard";
    if ("standard" === n) return e;
    const g = String((gameState.playerProfile || {}).gender || "").toLowerCase(),
        nobody = /fem|woman|girl/.test(g)
            ? "no other person visible in frame, no second figure"
            : "no male figure visible, no man in frame",
        a = {
            pov: `POV shot, first-person perspective, from viewer point of view, ${nobody}, subjective camera angle, intimate close perspective, as if you are there`,
            selfie: "selfie photo, subject holding camera at arm's length, looking directly at camera, smartphone selfie style, casual self-portrait",
        }[n];
    return a
        ? (console.log(`[Perspective] Applying ${n} perspective`), `${"string" == typeof e ? scrubPlayerReferences(e) : e}, ${a}`)
        : e;
}
function generateEmployeeStat(e) {
    const t = gameState.hrSettings.startingStatRanges[e];
    return t ? Math.floor(Math.random() * (t.max - t.min + 1)) + t.min : Math.floor(31 * Math.random()) + 30;
}
function formatNumber(e) {
    return e >= 1e18
        ? (e / 1e18).toFixed(2) + "Qi"
        : e >= 1e15
          ? (e / 1e15).toFixed(2) + "Q"
          : e >= 1e12
            ? (e / 1e12).toFixed(2) + "T"
            : e >= 1e9
              ? (e / 1e9).toFixed(2) + "B"
              : e >= 1e6
                ? (e / 1e6).toFixed(2) + "M"
                : e >= 1e3
                  ? (e / 1e3).toFixed(2) + "K"
                  : e >= 100
                    ? e.toFixed(0)
                    : e >= 10
                      ? e.toFixed(1)
                      : e.toFixed(2).replace(/\.?0+$/, "");
}
function formatCashDisplay(e) {
    let t, n, a, o, i;
    return (
        e >= 1e18
            ? ((t = (e / 1e18).toFixed(2) + "Qi"),
              (n = "2.2rem"),
              (a = "var(--l-gold)"),
              (o = "0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5)"),
              (i = "cash-glow-intense 2s ease-in-out infinite"))
            : e >= 1e15
              ? ((t = (e / 1e15).toFixed(2) + "Q"),
                (n = "2rem"),
                (a = "var(--l-orange)"),
                (o = "0 0 15px rgba(255, 165, 0, 0.7), 0 0 30px rgba(255, 165, 0, 0.4)"),
                (i = "cash-glow 2.5s ease-in-out infinite"))
              : e >= 1e12
                ? ((t = (e / 1e12).toFixed(2) + "T"),
                  (n = "1.8rem"),
                  (a = "#FF6347"),
                  (o = "0 0 10px rgba(255, 99, 71, 0.6)"),
                  (i = "none"))
                : e >= 1e9
                  ? ((t = (e / 1e9).toFixed(2) + "B"),
                    (n = "1.6rem"),
                    (a = "var(--l-pink-3)"),
                    (o = "0 0 8px rgba(255, 105, 180, 0.5)"),
                    (i = "none"))
                  : e >= 1e6
                    ? ((t = (e / 1e6).toFixed(2) + "M"),
                      (n = "1.4rem"),
                      (a = "var(--l-cyan)"),
                      (o = "0 0 6px rgba(0, 212, 255, 0.4)"),
                      (i = "none"))
                    : e >= 1e3
                      ? ((t = (e / 1e3).toFixed(2) + "K"),
                        (n = "1.2rem"),
                        (a = "var(--l-green)"),
                        (o = "none"),
                        (i = "none"))
                      : ((t =
                            e >= 100 ? e.toFixed(0) : e >= 10 ? e.toFixed(1) : e.toFixed(2).replace(/\.?0+$/, "")),
                        (n = "1rem"),
                        (a = "white"),
                        (o = "none"),
                        (i = "none")),
        { displayText: t, fontSize: n, color: a, textShadow: o, animation: i }
    );
}
function formatCash(e) {
    return formatCashDisplay(e).displayText;
}
