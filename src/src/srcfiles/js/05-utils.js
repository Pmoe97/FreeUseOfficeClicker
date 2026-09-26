// ============================================================================
// 05-utils — Generic utils: $ DOM helper, extractText, sfwMode guards, custom context builder getCustomWorldContext, request badge updates.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function $(e) {
    return document.getElementById(e);
}
// A stand-in image — an initial or a short label on a plain tile — as an inline SVG, so
// nothing depends on an outside placeholder service (via.placeholder.com shut down in
// 2024 and every failed image became a broken-image icon).
function placeholderImage(w = 200, h = 200, text = "", bg = "#3a3f4b", fg = "#e8eaf0") {
    const t = String(text ?? "")
            .slice(0, 40)
            .replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]),
        fs = Math.round(t.length <= 2 ? 0.45 * Math.min(w, h) : Math.min(0.18 * h, (1.6 * w) / t.length)),
        label = t
            ? `<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-weight="600" font-size="${fs}" fill="${fg}">${t}</text>`
            : "";
    return (
        "data:image/svg+xml," +
        encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${bg}"/>${label}</svg>`
        )
    );
}
const MAX_CHAT_MESSAGES_PER_NPC = CAPS.CHAT_MESSAGES_PER_NPC;
function pushChatMessage(e, t) {
    if (
        (gameState.chatHistory[e] || (gameState.chatHistory[e] = []),
        gameState.chatHistory[e].push(t),
        gameState.chatHistory[e].length > MAX_CHAT_MESSAGES_PER_NPC)
    ) {
        const t = gameState.chatHistory[e].length - MAX_CHAT_MESSAGES_PER_NPC;
        gameState.chatHistory[e].splice(0, t);
    }
}
function getCustomWorldContext(e = "full") {
    const t = gameState.settings?.customContext;
    if (!t) return "";
    const n = t.company && t.company.trim().length > 0,
        a = t.world && t.world.trim().length > 0,
        o = t.aiNotes && t.aiNotes.trim().length > 0;
    if (!n && !a && !o) return "";
    if ("image" === e) {
        const e = [];
        return (
            n && e.push(t.company.substring(0, 100)),
            a && e.push(t.world.substring(0, 100)),
            e.length > 0 ? `Setting: ${e.join(". ")}` : ""
        );
    }
    if ("brief" === e) {
        const e = [];
        return (
            n && e.push(`Company: ${t.company.substring(0, 150)}`),
            a && e.push(`World: ${t.world.substring(0, 150)}`),
            e.length > 0 ? `[CUSTOM SETTING: ${e.join(" | ")}]` : ""
        );
    }
    const i = [];
    return (
        i.push(""),
        i.push("═══ 🌍 CUSTOM WORLD CONTEXT ═══"),
        i.push(
            "The player has defined a CUSTOM SETTING for this game. You MUST incorporate these elements naturally:"
        ),
        n && (i.push(""), i.push("🏢 COMPANY SETTING:"), i.push(t.company)),
        a && (i.push(""), i.push("🌐 WORLD RULES:"), i.push(t.world)),
        o && (i.push(""), i.push("📝 SPECIAL INSTRUCTIONS:"), i.push(t.aiNotes)),
        i.push(""),
        i.push("→ Reference this setting naturally in conversation (don't force it every message)"),
        i.push("→ Treat these world elements as normal parts of your reality"),
        i.push("═══════════════════════════════"),
        i.push(""),
        i.join("\n")
    );
}
function extractText(e) {
    if (!e) return "";
    if ("string" == typeof e) return e.trim();
    if ("object" == typeof e) {
        const t = e.text || e.generatedText || e.prompt || String(e);
        return String(t).trim();
    }
    return String(e).trim();
}
function isSFWMode() {
    return !0 === gameState.settings?.sfwMode;
}
function shouldHideInSFWMode(e = 0, t = 0) {
    return !!isSFWMode() && (e > 0 || t > 0);
}
function applySFWModeFilters() {
    const e = isSFWMode();
    document
        .querySelectorAll(
            '.request-preset[data-preset="lewd"], .request-preset[data-preset="nude"], .request-preset[data-preset="explicit"]'
        )
        .forEach((t) => {
            t.style.display = e ? "none" : "";
        }),
        document
            .querySelectorAll(
                '.request-post-preset[data-preset="lewd"], .request-post-preset[data-preset="nude"], .request-post-preset[data-preset="explicit"]'
            )
            .forEach((t) => {
                t.style.display = e ? "none" : "";
            }),
        document
            .querySelectorAll(
                '.group-request-preset[data-preset="lewd"], .group-request-preset[data-preset="nude"], .group-request-preset[data-preset="explicit"]'
            )
            .forEach((t) => {
                t.style.display = e ? "none" : "";
            }),
        document
            .querySelectorAll(
                '.group-post-preset[data-preset="lewd"], .group-post-preset[data-preset="nude"], .group-post-preset[data-preset="explicit"]'
            )
            .forEach((t) => {
                t.style.display = e ? "none" : "";
            });
    const t = document.querySelector("#playerPostExplicit")?.closest("label")?.closest('div[style*="background"]');
    t && (t.style.display = e ? "none" : ""),
        document
            .querySelectorAll(
                '.content-filter-btn[data-rating="nsfw"], .content-filter-btn[data-rating="explicit"]'
            )
            .forEach((t) => {
                t.style.display = e ? "none" : "";
            });
    const n = $("socialTab");
    n && n.classList.contains("active") && "function" == typeof renderSocialFeed && renderSocialFeed(!0),
        "function" == typeof renderLocationTabs && renderLocationTabs(),
        console.log(`[SFW Mode] ${e ? "Enabled" : "Disabled"} - NSFW content ${e ? "hidden" : "visible"}`);
}
