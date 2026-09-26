// ============================================================================
// 05-utils — Generic utils: $ DOM helper, extractText, sfwMode guards, custom context builder Ge, request badge updates.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function $(e) {
  return document.getElementById(e);
}
const qe = CAPS.CHAT_MESSAGES_PER_NPC;
function ze(e, t) {
  if (gameState.chatHistory[e] || (gameState.chatHistory[e] = []), gameState.chatHistory[e].push(t), gameState.chatHistory[e].length > qe) {
    const t2 = gameState.chatHistory[e].length - qe;
    gameState.chatHistory[e].splice(0, t2);
  }
}
function Ge(e = "full") {
  const t = gameState.settings?.customContext;
  if (!t) return "";
  const n = t.company && t.company.trim().length > 0, a = t.world && t.world.trim().length > 0, o = t.aiNotes && t.aiNotes.trim().length > 0;
  if (!n && !a && !o) return "";
  if ("image" === e) {
    const e2 = [];
    return n && e2.push(t.company.substring(0, 100)), a && e2.push(t.world.substring(0, 100)), e2.length > 0 ? `Setting: ${e2.join(". ")}` : "";
  }
  if ("brief" === e) {
    const e2 = [];
    return n && e2.push(`Company: ${t.company.substring(0, 150)}`), a && e2.push(`World: ${t.world.substring(0, 150)}`), e2.length > 0 ? `[CUSTOM SETTING: ${e2.join(" | ")}]` : "";
  }
  const i = [];
  return i.push(""), i.push("\u2550\u2550\u2550 \u{1F30D} CUSTOM WORLD CONTEXT \u2550\u2550\u2550"), i.push("The player has defined a CUSTOM SETTING for this game. You MUST incorporate these elements naturally:"), n && (i.push(""), i.push("\u{1F3E2} COMPANY SETTING:"), i.push(t.company)), a && (i.push(""), i.push("\u{1F310} WORLD RULES:"), i.push(t.world)), o && (i.push(""), i.push("\u{1F4DD} SPECIAL INSTRUCTIONS:"), i.push(t.aiNotes)), i.push(""), i.push("\u2192 Reference this setting naturally in conversation (don't force it every message)"), i.push("\u2192 Treat these world elements as normal parts of your reality"), i.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550"), i.push(""), i.join("\n");
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
function Ue() {
  return true === gameState.settings?.sfwMode;
}
function Ve(e = 0, t = 0) {
  return !!Ue() && (e > 0 || t > 0);
}
function Ke() {
  const e = Ue();
  document.querySelectorAll('.request-preset[data-preset="lewd"], .request-preset[data-preset="nude"], .request-preset[data-preset="explicit"]').forEach((t2) => {
    t2.style.display = e ? "none" : "";
  }), document.querySelectorAll('.request-post-preset[data-preset="lewd"], .request-post-preset[data-preset="nude"], .request-post-preset[data-preset="explicit"]').forEach((t2) => {
    t2.style.display = e ? "none" : "";
  }), document.querySelectorAll('.group-request-preset[data-preset="lewd"], .group-request-preset[data-preset="nude"], .group-request-preset[data-preset="explicit"]').forEach((t2) => {
    t2.style.display = e ? "none" : "";
  }), document.querySelectorAll('.group-post-preset[data-preset="lewd"], .group-post-preset[data-preset="nude"], .group-post-preset[data-preset="explicit"]').forEach((t2) => {
    t2.style.display = e ? "none" : "";
  });
  const t = document.querySelector("#playerPostExplicit")?.closest("label")?.closest('div[style*="background"]');
  t && (t.style.display = e ? "none" : ""), document.querySelectorAll('.content-filter-btn[data-rating="nsfw"], .content-filter-btn[data-rating="explicit"]').forEach((t2) => {
    t2.style.display = e ? "none" : "";
  });
  const n = $("socialTab");
  n && n.classList.contains("active") && "function" == typeof renderSocialFeed && renderSocialFeed(true), "function" == typeof renderLocationTabs && renderLocationTabs(), console.log(`[SFW Mode] ${e ? "Enabled" : "Disabled"} - NSFW content ${e ? "hidden" : "visible"}`);
}
