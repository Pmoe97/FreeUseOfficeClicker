// ============================================================================
// 39-social-feed — Social feed: feed rendering, post modal, comments, notifications badge, post actions, poll rendering pieces.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

let hg = null;
window.addEventListener("resize", () => {
  hg || (hg = setTimeout(() => {
    gg(), hg = null;
  }, 250));
});
let yg = { postsPerPage: 20, currentPage: 1, totalPages: 1, pendingUpdates: /* @__PURE__ */ new Set(), updateThrottle: null, allPosts: [] }, fg = { activePostId: null, updateInterval: null, lastCommentCount: 0, lastLikeCount: 0 };
function updateSocialTab() {
  "social" === gameState.activeTab && (vg(), Eg(), renderSocialFeed());
}
function vg() {
  const e = gameState.socialNetwork?.algorithm || {}, t = $("postTypeFilter");
  t && (t.value = e.postType || "all");
  const n = $("authorFilter");
  n && (n.value = e.author || "all");
  const a = $("engagementFilter");
  a && (a.value = e.engagement || "all");
  const o = e.contentRating || "all";
  document.querySelectorAll(".content-filter-btn").forEach((e2) => {
    e2.classList.toggle("active", e2.dataset.rating === o);
  });
  const i = e.sort || "foryou";
  document.querySelectorAll(".algo-sort-btn").forEach((e2) => {
    e2.classList.toggle("active", e2.dataset.sort === i);
  });
  const s = $("bestTimeFrameSelector");
  s && (s.style.display = "best" === i ? "block" : "none");
  const r = $("bestTimeFrameSelect");
  r && (r.value = e.bestTimeFrame || "all");
  const l = $("feedSearchInput"), c = $("clearSearchBtn");
  l && (l.value = e.searchQuery || "", c && (c.style.display = e.searchQuery ? "block" : "none"));
}
function wg(e = null) {
  e && yg.pendingUpdates.add(e), yg.updateThrottle && clearTimeout(yg.updateThrottle), yg.updateThrottle = setTimeout(() => {
    xg();
  }, 50);
}
function xg() {
  $("socialFeedContent") && (yg.pendingUpdates.size > 0 && yg.pendingUpdates.forEach((e) => {
    Tg(e);
  }), yg.pendingUpdates.clear());
}
function kg() {
  if (!$("socialFeedContent")) return;
  const e = filterAndSortPosts(), t = yg.allPosts, n = [];
  for (let a = 0; a < e.length && !t.find((t2) => t2.id === e[a].id); a++) n.push(e[a]);
  n.length > 0 && (Sg(n.length), yg.allPosts = e), yg.pendingUpdates.size > 0 && yg.pendingUpdates.forEach((e2) => {
    Tg(e2);
  });
}
function Sg(e) {
  const t = $("newPostsNotification");
  t && t.remove();
  const n = document.createElement("div");
  n.id = "newPostsNotification", n.style.cssText = "\n      position: fixed;\n      top: 80px;\n      left: 50%;\n      transform: translateX(-50%);\n      background: linear-gradient(135deg, var(--u) 0%, var(--dg) 100%);\n      color: var(--q);\n      padding: 12px 24px;\n      border-radius: 24px;\n      box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);\n      cursor: pointer;\n      z-index: 10000;\n      font-weight: 600;\n      font-size: 0.9rem;\n      animation: slideDown 0.3s ease-out;\n      transition: transform 0.2s, box-shadow 0.2s;\n    ", n.innerHTML = ` <span style="margin-right: 8px;">\u2191</span> ${e} new post${e > 1 ? "s" : ""} <span style="margin-left: 8px; font-size: 0.8rem; opacity: 0.9;">\u2022 Click to view</span> `, n.onclick = () => {
    const e2 = $("socialFeedContent");
    e2 && (e2.scrollTo({ top: 0, behavior: "smooth" }), setTimeout(() => {
      renderSocialFeed(true);
    }, 300)), n.remove();
  }, setTimeout(() => {
    n.parentNode && (n.style.opacity = "0", n.style.transform = "translateX(-50%) translateY(-20px)", setTimeout(() => n.remove(), 300));
  }, 8e3), document.body.appendChild(n);
}
function Tg(e) {
  const t = document.querySelector(`[data-post-id="${e}"]`);
  if (!t) return void console.warn(`[Feed Update] Could not find post element for ID: ${e}`);
  const n = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!n) return void console.warn(`[Feed Update] Could not find post data for ID: ${e}`);
  console.log(`[Feed Update] Updating post ${e} (${n.comments.length} comments)`), Array.isArray(n.likes) || (n.likes = []);
  const a = t.querySelector(".like-count");
  if (a) {
    const e2 = n.likes.includes("player");
    a.innerHTML = `${e2 ? "\u2764\uFE0F" : "\u{1F90D}"} ${n.likes.length}`, a.style.color = e2 ? "var(--l)" : "var(--a)";
  }
  const o = t.querySelector(".comment-count");
  o && (o.innerHTML = `\u{1F4AC} ${n.comments.length}`);
  const i = t.querySelector(".post-comments-section");
  i && (console.log(`[Feed Update] FORCE updating comments for post ${e} (${n.comments.length} comments)`), $g(t, n), delete i.dataset.needsRefresh);
}
function $g(e, t) {
  const n = e.querySelector(".post-comments-section");
  if (!n) return;
  const a = n.querySelector(".comments-list");
  if (!a) return;
  const o = n.querySelector("textarea"), i = o && document.activeElement === o, s = i ? o.value : "", r = i ? o.selectionStart : 0, l = n.scrollTop;
  if (a.innerHTML = Cg(t), n.scrollTop = l, i && o) {
    const e2 = n.querySelector("textarea");
    e2 && (e2.value = s, e2.focus(), e2.setSelectionRange(r, r));
  }
}
function Cg(e) {
  if (0 === e.comments.length) return '<div class="sp-no-comments">No comments yet. Be the first!</div>';
  const t = {}, n = [], a = {};
  e.comments.forEach((e2) => {
    t[e2.id] = e2;
  }), e.comments.forEach((e2) => {
    e2.replyToCommentId && t[e2.replyToCommentId] ? (a[e2.replyToCommentId] = a[e2.replyToCommentId] || [], a[e2.replyToCommentId].push(e2)) : n.push(e2);
  });
  const o = (e2, n2) => {
    const i = "player" === e2.authorId ? { name: "You", social: { username: "TheBoss" } } : gameState.employees.find((t2) => t2.id === e2.authorId) || { name: e2.authorName || "Unknown", social: {} }, s = "player" === e2.authorId, r = ld(e2.timestamp), l = n2 && t[e2.replyToCommentId], c = l ? "player" === l.authorId ? "You" : l.authorName || "someone" : null;
    let d = ` <div class="comment sp-comment${n2 ? " sp-comment--reply" : ""}"> <div style="flex: 1;"> <div class="sp-comment-h"> <span class="sp-comment-name${s ? " is-player" : ""}">${i.name}</span> ${i.social?.username ? `<span class="sp-comment-handle">@${i.social.username}</span>` : ""} <span class="sp-comment-time">${r}</span> </div> ${c ? `<div class="sp-reply-to">\u21AA replying to ${c}</div>` : ""} <div class="sp-comment-body">${linkifyMentions(e2.content, e2.authorId, e2.dmSent, e2.dmMessageTimestamp)}</div> </div> </div> `;
    return (a[e2.id] || []).forEach((e3) => d += o(e3, true)), d;
  };
  return n.map((e2) => o(e2, false)).join("");
}
function Eg() {
  const e = $("totalPostsCount"), t = $("activeUsersCount"), n = $("todayPostsCount");
  if (e && (e.textContent = gameState.socialNetwork.posts.length), t) {
    const e2 = gameState.employees.filter((e3) => "active" === e3.employmentStatus).length;
    t.textContent = e2;
  }
  if (n) {
    const e2 = Date.now() - 864e5, t2 = gameState.socialNetwork.posts.filter((t3) => t3.timestamp > e2).length;
    n.textContent = t2;
  }
}
let Ig = "";
function renderSocialFeed(e = false) {
  const t = $("socialFeedContent"), n = $("feedEmptyState");
  if (!t) return;
  let a = filterAndSortPosts();
  if (0 === a.length) return Ig = "", t.innerHTML = "", n && (n.style.display = "block", t.appendChild(n)), void Pg(0, 0);
  n && (n.style.display = "none"), yg.totalPages = Math.ceil(a.length / yg.postsPerPage), e && (yg.currentPage = 1), yg.currentPage > yg.totalPages && (yg.currentPage = yg.totalPages);
  const o = (yg.currentPage - 1) * yg.postsPerPage, i = o + yg.postsPerPage, s = a.slice(o, i), r = yg.currentPage + ":" + s.map((e2) => e2.id + "," + (e2.likes || 0) + "," + (e2.comments?.length || 0) + "," + (e2.imageUrl || "")).join("|");
  if (!e && r === Ig) return;
  Ig = r;
  const l = t.scrollTop;
  t.innerHTML = "", s.forEach((e2) => {
    const n2 = Ag(e2);
    n2 && n2.nodeType === Node.ELEMENT_NODE && t.appendChild(n2);
  });
  const c = Mg(a.length);
  t.appendChild(c), Pg(a.length, s.length), t.scrollTop = !e && l > 0 ? l : 0;
  try {
    renderStoriesBar();
  } catch (e2) {
    console.error("Error rendering stories:", e2);
  }
  try {
    Fg();
  } catch (e2) {
    console.warn("Error updating notification badge:", e2);
  }
}
function Mg(e) {
  const t = document.createElement("div");
  t.style.cssText = "display:flex; justify-content:center; align-items:center; gap:10px; padding:30px 20px; margin-top:20px; border-top:1px solid var(--o);";
  const n = yg.currentPage, a = yg.totalPages, o = document.createElement("button");
  o.textContent = "\u2190 Previous", o.disabled = 1 === n, o.style.cssText = `
      padding:10px 20px; 
      background:${1 === n ? "var(--cd)" : "linear-gradient(135deg, var(--u), var(--dg))"}; 
      border:none; 
      border-radius:8px; 
      color:${1 === n ? "var(--as)" : "white"}; 
      cursor:${1 === n ? "not-allowed" : "pointer"}; 
      font-weight:600;
      transition:all 0.2s;
    `, n > 1 && (o.onmouseenter = function() {
    this.style.transform = "translateY(-2px)";
  }, o.onmouseleave = function() {
    this.style.transform = "translateY(0)";
  }, o.onclick = () => {
    yg.currentPage--, renderSocialFeed(false);
  });
  const i = document.createElement("div");
  i.style.cssText = "color:var(--y); font-weight:600; padding:0 15px; font-size:0.95rem;", i.innerHTML = `Page <span style="color:var(--d);">${n}</span> of <span style="color:var(--d);">${a}</span>`;
  const s = document.createElement("button");
  return s.textContent = "Next \u2192", s.disabled = n === a, s.style.cssText = `
      padding:10px 20px; 
      background:${n === a ? "var(--cd)" : "linear-gradient(135deg, var(--u), var(--dg))"}; 
      border:none; 
      border-radius:8px; 
      color:${n === a ? "var(--as)" : "white"}; 
      cursor:${n === a ? "not-allowed" : "pointer"}; 
      font-weight:600;
      transition:all 0.2s;
    `, n < a && (s.onmouseenter = function() {
    this.style.transform = "translateY(-2px)";
  }, s.onmouseleave = function() {
    this.style.transform = "translateY(0)";
  }, s.onclick = () => {
    yg.currentPage++, renderSocialFeed(false);
  }), t.appendChild(o), t.appendChild(i), t.appendChild(s), t;
}
function Pg(e, t) {
  const n = $("feedStatsText");
  n && (n.textContent = e === t ? `${e} post${1 !== e ? "s" : ""}` : `Showing ${t} of ${e} posts`);
}
function Ag(e) {
  const t = document.createElement("div");
  t.className = "social-post-card", t.dataset.postId = e.id, t.style.cssText = "background:var(--h); border:1px solid var(--o); border-radius:4px; padding:20px; margin-bottom:4px; box-shadow:0 1px 3px var(--ft); transition:all 0.3s ease; cursor:pointer; max-width:600px; margin-left:auto; margin-right:auto;", t.onmouseenter = function() {
    this.style.background = "var(--f)", this.style.borderColor = "var(--av)";
  }, t.onmouseleave = function() {
    this.style.background = "var(--h)", this.style.borderColor = "var(--cd)";
  }, t.onclick = function(t2) {
    "BUTTON" === t2.target.tagName || "IMG" === t2.target.tagName || t2.target.closest("button") || openPostModal(e.id);
  };
  const n = e.isPlayerPost ? { name: "You", profileImage: null, employmentStatus: "active" } : gameState.employees.find((t2) => t2.id === e.authorId) || { name: e.authorName, profileImage: null, employmentStatus: "unknown" }, a = n.profileImage || "https://placehold.co/50x50?text=" + (n.name?.[0] || "?"), o = "alumni" === n.employmentStatus, i = Jg(e.timestamp);
  Array.isArray(e.likes) || (e.likes = []);
  const s = e.likes.includes("player");
  return t.innerHTML = ` <!-- Post Header --> <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;"> <img src="${a}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid ${o ? "var(--r)" : e.isPlayerPost ? "var(--k)" : "var(--d)"}; flex-shrink:0; cursor:${e.isPlayerPost ? "default" : "pointer"};" onclick="event.stopPropagation(); ${e.isPlayerPost ? "" : `openUnifiedProfile('${e.authorId}', 'overview')`}"> <div style="flex:1; min-width:0;"> <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;"> <strong style="font-size:0.95rem; font-weight:600; cursor:${e.isPlayerPost ? "default" : "pointer"}; transition:opacity 0.2s;" ${e.isPlayerPost ? "" : `onclick="openUnifiedProfile('${e.authorId}', 'overview')" onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'"`}>${e.isPlayerPost ? '<span style="color:var(--b);">You</span>' : yl(n)}</strong> ${e.isPlayerPost ? '<span style="color:var(--k); font-size:0.85rem; font-weight:600;">@TheBoss</span>' : n.social?.username ? `<span style="color:var(--a); font-size:0.85rem;">@${n.social.username}</span>` : ""}
            ${o ? '<span style="background:var(--af); padding:3px 10px; border-radius:12px; font-size:0.7rem; color:var(--ao);">Alumni</span>' : ""}
            ${e.explicitLevel >= 1 ? '<span style="background:linear-gradient(135deg, var(--l), #d63850); padding:3px 10px; border-radius:12px; font-size:0.7rem; color:var(--s); font-weight:600;">\u{1F51E}</span>' : ""}${(() => {
    const sig = zo(e);
    return sig ? `<span class="sp-signal">${sig}</span>` : "";
  })()} </div> <div style="color:var(--a); font-size:0.8rem; margin-top:2px;">${i}</div> ${e.activityLabel && !["at_work", "relaxing", "chatting_player", "in_person_player"].includes(e.activityStatus) ? `<div style="color:var(--j); font-size:0.72rem; margin-top:1px;">${e.activityLabel}</div>` : ""} </div> </div> ${e.explicitLevel >= 3 ? ' <div style="background:rgba(233, 69, 96, 0.15); padding:10px 14px; border-radius:8px; border-left:4px solid var(--k); margin-bottom:14px; font-size:0.85rem; color:var(--fe);"> <strong style="display:flex; align-items:center; gap:6px;"><span>\u{1F51E}</span> Explicit Content Warning</strong> </div> ' : ""} <!-- Post Content --> <div style="color:var(--y); line-height:1.6; margin-bottom:14px; font-size:0.95rem; word-wrap:break-word;"> ${linkifyMentions(e.content)} </div> <!-- Post Image --> ${e.imageUrl ? ` <div style="margin-bottom:14px; border-radius:12px; overflow:hidden; border:1px solid var(--o); position:relative;" onmouseenter=" const btn = this.querySelector('.post-regen-btn'); if(btn && !btn.disabled) { btn.style.opacity='0.9'; } " onmouseleave=" const btn = this.querySelector('.post-regen-btn'); if(btn && !btn.disabled) { btn.style.opacity='0'; } "> <img src="${e.imageUrl}" 
               onerror="this.onerror=null; this.src='https://placehold.co/600x400?text=Image+Load+Failed'; this.style.opacity='0.5';" 
               onload="this.style.opacity='1';"
               style="width:100%; height:auto; display:block; cursor:pointer; opacity:0; transition:opacity 0.3s;" 
               onclick="event.stopPropagation(); openImageViewer('${e.imageUrl}')">
          ${e.imagePrompt ? ` <button onclick=" event.stopPropagation(); regeneratePostImage('${e.id}')
                    " 
                    class="post-regen-btn"
                    data-regen-post-id="${e.id}" style="position:absolute !important; top:10px !important; right:10px !important; background:var(--ax) !important; backdrop-filter:blur(10px); border:1px solid var(--du) !important; color:var(--b) !important; padding:8px 14px !important; border-radius:8px !important; cursor:pointer !important; font-size:0.85rem !important; font-weight:600 !important; display:flex !important; align-items:center !important; gap:6px !important; transition:all 0.2s !important; opacity:0 !important; z-index:10 !important; box-shadow:0 4px 12px var(--ab) !important; pointer-events:auto !important;" onmouseenter=" if(!this.disabled) { this.style.opacity='1'; this.style.background='var(--bc)'; this.style.transform='scale(1.05)'; } " onmouseleave=" if(!this.disabled) { this.style.opacity='0.9'; this.style.background='var(--ax)'; this.style.transform='scale(1)'; } "> \u{1F504} Regenerate </button> ` : ""} </div> ` : ""}
      
      <!-- Poll (if applicable) -->
      ${e.poll ? renderPollHTML(e, false) : ""} <!-- Post Actions --> <div style="display:flex; gap:20px; padding-top:10px; border-top:1px solid var(--o); align-items:center;"> <!-- Reddit-style Vote Widget (replaces Like button) --> ${e.isPlayerPost ? ` <!-- Player's own posts show NPC likes only --> <button onclick="event.stopPropagation(); handleLikePost('${e.id}')" style="background:transparent; border:none; color:${s ? "var(--l)" : "var(--a)"}; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:0.9rem; padding:8px 12px; border-radius:8px; transition:all 0.2s;" onmouseenter="this.style.background='var(--bb)'" onmouseleave="this.style.background='transparent'"> <span style="font-size:1.1rem;">${s ? "\u2764\uFE0F" : "\u{1F90D}"}</span> <span>${e.likes.length}</span> </button> ` : ` <div style="display:flex; align-items:center; gap:4px; background:var(--i); border-radius:20px; padding:4px 6px;"> <!-- Upvote Arrow --> <button onclick="event.stopPropagation(); voteOnPost('${e.id}', 'up')" 
                    style="background:transparent; border:none; padding:2px 4px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;"
                    onmouseenter="this.style.transform='scale(1.2)'"
                    onmouseleave="this.style.transform='scale(1)'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="${"up" === e.playerVote ? "var(--ca)" : "var(--a)"}"> <path d="M12 4l8 8h-6v8h-4v-8H4z"/> </svg> </button> <!-- Vote Count --> <span style="font-size:0.85rem; font-weight:600; color:${"up" === e.playerVote ? "var(--ca)" : "down" === e.playerVote ? "var(--bz)" : "var(--a)"}; min-width:24px; text-align:center;">
              ${(e.upvotes || 0) - (e.downvotes || 0) + (e.likes.length || 0)} </span> <!-- Downvote Arrow --> <button onclick="event.stopPropagation(); voteOnPost('${e.id}', 'down')" 
                    style="background:transparent; border:none; padding:2px 4px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;"
                    onmouseenter="this.style.transform='scale(1.2)'"
                    onmouseleave="this.style.transform='scale(1)'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="${"down" === e.playerVote ? "var(--bz)" : "var(--a)"}"> <path d="M12 20l-8-8h6V4h4v8h6z"/> </svg> </button> </div> `} <!-- Comments Button --> <button onclick="event.stopPropagation(); openPostModal('${e.id}')" style="background:transparent; border:none; color:var(--a); cursor:pointer; display:flex; align-items:center; gap:6px; font-size:0.9rem; padding:8px 12px; border-radius:8px; transition:all 0.2s;" onmouseenter="this.style.background='var(--bb)'" onmouseleave="this.style.background='transparent'"> <span style="font-size:1.1rem;">\u{1F4AC}</span> <span>${e.comments.length}</span> </button> <!-- NEW: More Actions Menu (nested in [...]) - Only for NPC posts --> ${e.isPlayerPost ? "" : ` <div style="margin-left:auto; position:relative;"> <button onclick="event.stopPropagation(); togglePostActionsMenu('${e.id}')"
              id="postActionsBtn_${e.id}" style="background:transparent; border:1px solid var(--o); color:var(--a); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1.2rem; padding:6px 12px; border-radius:6px; transition:all 0.2s; font-weight:bold; letter-spacing:2px;" onmouseenter="this.style.background='var(--fp)'; this.style.borderColor='var(--u)'" onmouseleave="this.style.background='transparent'; this.style.borderColor='var(--cd)'" title="More actions"> \u22EF </button> <div id="postActionsMenu_${e.id}" style="display:none; position:absolute; right:0; top:calc(100% + 4px); background:var(--f); border:1px solid var(--o); border-radius:12px; min-width:180px; z-index:1000; box-shadow:0 8px 24px var(--ab); overflow:hidden;"> <!-- Send Gift --> <button onclick="event.stopPropagation(); closePostActionsMenu(); giftOnPost('${e.id}')" style="width:100%; padding:12px 16px; background:transparent; border:none; color:var(--b); cursor:pointer; display:flex; align-items:center; gap:10px; font-size:0.9rem; transition:all 0.15s; text-align:left;" onmouseenter="this.style.background='rgba(83,52,131,0.3)'" onmouseleave="this.style.background='transparent'"> <span style="font-size:1.1rem;">\u{1F381}</span> Send Gift </button> <!-- Send Cash --> <button onclick="event.stopPropagation(); closePostActionsMenu(); tipOnPost('${e.id}')" style="width:100%; padding:12px 16px; background:transparent; border:none; color:var(--b); cursor:pointer; display:flex; align-items:center; gap:10px; font-size:0.9rem; transition:all 0.15s; text-align:left;" onmouseenter="this.style.background='rgba(78,204,163,0.3)'" onmouseleave="this.style.background='transparent'"> <span style="font-size:1.1rem;">\u{1F4B5}</span> Send Tip </button> <div style="border-top:1px solid var(--o);"></div> <!-- Request Image --> <button onclick="event.stopPropagation(); closePostActionsMenu(); openRequestImageModal('${e.authorId}', false)" style="width:100%; padding:12px 16px; background:transparent; border:none; color:var(--b); cursor:pointer; display:flex; align-items:center; gap:10px; font-size:0.9rem; transition:all 0.15s; text-align:left;" onmouseenter="this.style.background='rgba(0,212,255,0.2)'" onmouseleave="this.style.background='transparent'"> <span style="font-size:1.1rem;">\u{1F4F8}</span> Request Image </button> <!-- Open Chat --> <button onclick="event.stopPropagation(); closePostActionsMenu(); openUnifiedProfile('${e.authorId}', 'chat')" style="width:100%; padding:12px 16px; background:transparent; border:none; color:var(--b); cursor:pointer; display:flex; align-items:center; gap:10px; font-size:0.9rem; transition:all 0.15s; text-align:left;" onmouseenter="this.style.background='rgba(102,126,234,0.2)'" onmouseleave="this.style.background='transparent'"> <span style="font-size:1.1rem;">\u{1F4AC}</span> Open Chat </button> </div> </div> `} </div> `, t;
}
function openPostModal(e) {
  console.log(`[PostModal] Opening modal for post ${e}`);
  const t = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!t) return void console.error(`[PostModal] Post ${e} not found!`);
  fg.activePostId = e, fg.lastCommentCount = t.comments.length, Array.isArray(t.likes) || (t.likes = []), Array.isArray(t.comments) || (t.comments = []), fg.lastLikeCount = t.likes.length, console.log(`[PostModal] Initial state - Comments: ${t.comments.length}, Likes: ${t.likes.length}`);
  const n = t.isPlayerPost ? { name: "You", profileImage: null, employmentStatus: "active", id: "player" } : gameState.employees.find((e2) => e2.id === t.authorId) || { name: t.authorName, profileImage: null, employmentStatus: "unknown", id: t.authorId }, a = n.profileImage || "https://placehold.co/50x50?text=" + (n.name?.[0] || "?"), o = "alumni" === n.employmentStatus, i = Jg(t.timestamp), s = t.likes.includes("player"), r = document.createElement("div");
  r.id = "postModal", r.style.background = "var(--an)", r.style.padding = "10px", r.style.overflow = "auto";
  const l = window.innerWidth <= 768;
  r.innerHTML = ` <div style="background:var(--h); border:1px solid var(--o); border-radius:${l ? "16px" : "20px"}; max-width:${l ? "100%" : "700px"}; width:100%; max-height:${l ? "95vh" : "90vh"}; height:auto; overflow:hidden; box-shadow:0 8px 32px var(--ab); display:flex; flex-direction:column; margin:auto;"> <!-- Modal Header --> <div style="padding:${l ? "12px 16px" : "16px 20px"}; border-bottom:1px solid var(--o); display:flex; justify-content:space-between; align-items:center; flex-shrink:0;"> <h3 style="color:var(--b); margin:0; font-size:${l ? "1rem" : "1.1rem"}; font-weight:600;">Post</h3> <div style="display:flex; gap:8px; align-items:center;"> ${t.isPlayerPost ? ` <button onclick="editPost('${t.id}')" style="background:var(--cg); border:1px solid var(--d); color:var(--d); cursor:pointer; font-size:0.85rem; padding:8px 14px; border-radius:8px; transition:all 0.2s; font-weight:600; display:flex; align-items:center; gap:6px;" onmouseenter="this.style.background='var(--u)'; this.style.color='var(--b)'" onmouseleave="this.style.background='var(--cg)'; this.style.color='var(--u)'"> <span>\u270F\uFE0F</span> ${l ? "" : "Edit"} </button> ` : ` <button onclick="regeneratePost('${t.id}')" style="background:var(--cg); border:1px solid var(--d); color:var(--d); cursor:pointer; font-size:0.85rem; padding:8px 14px; border-radius:8px; transition:all 0.2s; font-weight:600; display:flex; align-items:center; gap:6px;" onmouseenter="this.style.background='var(--u)'; this.style.color='var(--b)'" onmouseleave="this.style.background='var(--cg)'; this.style.color='var(--u)'"> <span>\u{1F504}</span> ${l ? "" : "Regenerate"} </button> `} <button onclick="deletePost('${t.id}')" style="background:var(--cg); border:1px solid var(--k); color:var(--k); cursor:pointer; font-size:0.85rem; padding:8px 14px; border-radius:8px; transition:all 0.2s; font-weight:600; display:flex; align-items:center; gap:6px;" onmouseenter="this.style.background='var(--l)'; this.style.color='var(--b)'" onmouseleave="this.style.background='var(--cg)'; this.style.color='var(--l)'"> <span>\u{1F5D1}\uFE0F</span> ${l ? "" : "Delete"} </button> <button onclick="closePostModal()" style="background:transparent; border:none; color:var(--a); cursor:pointer; font-size:1.5rem; padding:4px 10px; border-radius:50%; transition:all 0.2s; min-width:40px; min-height:40px; display:flex; align-items:center; justify-content:center;" onmouseenter="this.style.background='var(--ba)'; this.style.color='var(--b)'" onmouseleave="this.style.background='transparent'; this.style.color='var(--a)'">\xD7</button> </div> </div> <!-- Post Content (Scrollable with comments) --> <div style="flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch;"> <div style="padding:${l ? "16px" : "20px"}; border-bottom:1px solid var(--o);"> <!-- Post Header --> <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;"> <img src="${a}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid ${o ? "var(--r)" : t.isPlayerPost ? "var(--k)" : "var(--d)"}; flex-shrink:0; cursor:${t.isPlayerPost ? "default" : "pointer"};" ${t.isPlayerPost ? "" : `onclick="closePostModal(); openUnifiedProfile('${t.authorId}', 'overview')"`}> <div style="flex:1; min-width:0;"> <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;"> <strong style="font-size:0.95rem; font-weight:600; cursor:${t.isPlayerPost ? "default" : "pointer"}; transition:opacity 0.2s;" ${t.isPlayerPost ? "" : `onclick="closePostModal(); openUnifiedProfile('${t.authorId}', 'overview')" onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'"`}>${t.isPlayerPost ? '<span style="color:var(--b);">You</span>' : yl(n)}</strong> ${t.isPlayerPost ? '<span style="color:var(--k); font-size:0.85rem; font-weight:600;">@TheBoss</span>' : n.social?.username ? `<span style="color:var(--a); font-size:0.85rem;">@${n.social.username}</span>` : ""}
                ${o ? '<span style="background:var(--af); padding:3px 10px; border-radius:12px; font-size:0.7rem; color:var(--ao);">Alumni</span>' : ""}
                ${t.explicitLevel >= 1 ? '<span style="background:linear-gradient(135deg, var(--l), #d63850); padding:3px 10px; border-radius:12px; font-size:0.7rem; color:var(--s); font-weight:600;">\u{1F51E}</span>' : ""} </div> <div style="color:var(--a); font-size:0.8rem; margin-top:2px;">${i}</div> </div> </div> ${t.explicitLevel >= 3 ? ' <div style="background:rgba(233, 69, 96, 0.15); padding:10px 14px; border-radius:8px; border-left:4px solid var(--k); margin-bottom:14px; font-size:0.85rem; color:var(--fe);"> <strong style="display:flex; align-items:center; gap:6px;"><span>\u{1F51E}</span> Explicit Content Warning</strong> <div style="margin-top:4px; opacity:0.9;">This post contains adult content</div> </div> ' : ""} <!-- Post Text --> <div style="color:var(--y); line-height:1.6; margin-bottom:14px; font-size:0.95rem; word-wrap:break-word;"> ${linkifyMentions(t.content)} </div> <!-- Post Image --> ${t.imageUrl ? ` <div style="margin-bottom:14px; border-radius:12px; overflow:hidden; border:1px solid var(--o); position:relative;" onmouseenter=" const btn = this.querySelector('.modal-regen-btn'); if(btn && !btn.disabled) btn.style.opacity='1'; " onmouseleave=" const btn = this.querySelector('.modal-regen-btn'); if(btn && !btn.disabled) btn.style.opacity='0.9'; "> <img src="${t.imageUrl}" style="width:100%; height:auto; display:block; cursor:pointer;" onclick="openImageViewer('${t.imageUrl}')">
              ${t.imagePrompt ? ` <button onclick=" event.stopPropagation(); regeneratePostImage('${t.id}')
                        " 
                        class="modal-regen-btn"
                        data-regen-post-id="${t.id}" style="position:absolute !important; top:12px !important; right:12px !important; background:var(--ax) !important; backdrop-filter:blur(10px); border:1px solid var(--du) !important; color:var(--b) !important; padding:10px 16px !important; border-radius:8px !important; cursor:pointer !important; font-size:0.9rem !important; font-weight:600 !important; display:flex !important; align-items:center !important; gap:8px !important; transition:all 0.2s !important; opacity:0.9 !important; z-index:10 !important; box-shadow:0 4px 12px var(--ab) !important; pointer-events:auto !important;" onmouseenter=" if(!this.disabled) { this.style.opacity='1'; this.style.background='var(--bc)'; this.style.transform='scale(1.05)'; } " onmouseleave=" if(!this.disabled) { this.style.opacity='0.9'; this.style.background='var(--ax)'; this.style.transform='scale(1)'; } "> \u{1F504} Regenerate </button> ` : ""} </div> ` : ""}
          
          <!-- Poll (if applicable) -->
          ${t.poll ? renderPollHTML(t, true) : ""} <!-- Post Actions --> <div style="display:flex; gap:20px; padding-top:10px; border-top:1px solid var(--o); align-items:center;"> <!-- Reddit-style Vote Widget --> ${t.isPlayerPost ? ` <!-- Player's own posts show NPC likes only --> <button id="modalLikeBtn" onclick="handleLikePost('${t.id}')" style="background:transparent; border:none; color:${s ? "var(--l)" : "var(--a)"}; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:0.9rem; padding:8px 12px; border-radius:8px; transition:all 0.2s;" onmouseenter="this.style.background='var(--bb)'" onmouseleave="this.style.background='transparent'"> <span id="modalLikeIcon" style="font-size:1.1rem;">${s ? "\u2764\uFE0F" : "\u{1F90D}"}</span> <span id="modalLikeCount">${t.likes.length}</span> </button> ` : ` <div style="display:flex; align-items:center; gap:4px; background:var(--i); border-radius:20px; padding:4px 6px;"> <!-- Upvote Arrow --> <button onclick="voteOnPost('${t.id}', 'up')" 
                        style="background:${"up" === t.playerVote ? "rgba(255, 69, 0, 0.25)" : "transparent"}; border:${"up" === t.playerVote ? "1px solid var(--ca)" : "1px solid transparent"}; padding:4px 6px; border-radius:8px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;"
                        onmouseenter="this.style.transform='scale(1.15)'"
                        onmouseleave="this.style.transform='scale(1)'">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="${"up" === t.playerVote ? "var(--ca)" : "var(--a)"}"> <path d="M12 4l8 8h-6v8h-4v-8H4z"/> </svg> </button> <!-- Vote Count --> <span id="modalVoteCount" style="font-size:0.9rem; font-weight:700; color:${"up" === t.playerVote ? "var(--ca)" : "down" === t.playerVote ? "var(--bz)" : "var(--a)"}; min-width:28px; text-align:center;">
                  ${(t.upvotes || 0) - (t.downvotes || 0) + (t.likes.length || 0)} </span> <!-- Downvote Arrow --> <button onclick="voteOnPost('${t.id}', 'down')" 
                        style="background:${"down" === t.playerVote ? "rgba(113, 147, 255, 0.25)" : "transparent"}; border:${"down" === t.playerVote ? "1px solid var(--bz)" : "1px solid transparent"}; padding:4px 6px; border-radius:8px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;"
                        onmouseenter="this.style.transform='scale(1.15)'"
                        onmouseleave="this.style.transform='scale(1)'">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="${"down" === t.playerVote ? "var(--bz)" : "var(--a)"}"> <path d="M12 20l-8-8h6V4h4v8h6z"/> </svg> </button> </div> `} <!-- Comments Count --> <div style="color:var(--a); display:flex; align-items:center; gap:6px; font-size:0.9rem; padding:8px 12px;"> <span style="font-size:1.1rem;">\u{1F4AC}</span> <span id="modalCommentCount">${t.comments.length}</span> </div> </div> </div> <!-- Comments Section (Inside scrollable area) --> <div id="modalCommentsContainer" style="padding:${l ? "16px" : "20px"}; padding-top:0;"> <!-- Comments will be rendered here --> </div> </div> <!-- Comment Input (Fixed at bottom) --> <div style="padding:${l ? "12px 16px" : "16px 20px"}; border-top:1px solid var(--o); background:var(--i); flex-shrink:0; position:relative;"> <!-- @Mention Autocomplete Dropdown --> <div id="modalMentionSuggestions" style="position:absolute; bottom:100%; left:${l ? "16px" : "20px"}; right:${l ? "16px" : "20px"}; background:var(--h); border:1px solid var(--o); border-radius:12px; max-height:280px; overflow-y:auto; display:none; z-index:10000; box-shadow:0 -4px 12px var(--ab); margin-bottom:8px;"> <!-- Suggestions will be populated here --> </div> <div style="display:flex; gap:10px; align-items:start;"> <textarea id="modalCommentInput" placeholder="Write a comment..." style="flex:1; background:var(--h); border:1px solid var(--o); border-radius:12px; padding:12px; color:var(--y); font-size:${l ? "16px" : "0.9rem"}; resize:none; min-height:${l ? "44px" : "40px"}; max-height:120px; font-family:inherit;" rows="1"></textarea> <button onclick="submitModalComment('${t.id}')" style="background:linear-gradient(135deg, var(--u), var(--dg)); border:none; color:var(--q); padding:${l ? "12px 20px" : "12px 24px"}; border-radius:12px; cursor:pointer; font-weight:600; font-size:0.9rem; transition:all 0.3s; box-shadow:0 2px 8px rgba(0,212,255,0.3); min-height:${l ? "44px" : "auto"};" onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,212,255,0.4)'" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,212,255,0.3)'">
              ${l ? "\u{1F4E4}" : "Send"} </button> </div> </div> </div> `, ModalManager.show(r, "postModal"), r.addEventListener("click", (e2) => {
    e2.target === r && closePostModal();
  }), Rg(t.id);
  const c = $("modalCommentInput");
  c && (c.addEventListener("input", function() {
    this.style.height = "auto", this.style.height = this.scrollHeight + "px";
  }), ov(c, "modalMentionSuggestions")), Lg();
}
function closePostModal() {
  Ng(), ModalManager.close("postModal");
}
function Lg() {
  fg.updateInterval && (clearInterval(fg.updateInterval), fg.updateInterval = null), console.log(`[PostModal] Setting up live updates for post ${fg.activePostId}...`), fg.updateInterval = setInterval(() => {
    _g();
  }, 500), console.log(`[PostModal] \u2705 Live updates started - interval ID: ${fg.updateInterval}`);
}
function Ng() {
  fg.updateInterval && (clearInterval(fg.updateInterval), fg.updateInterval = null, console.log("[PostModal] Stopped live updates")), fg.activePostId = null, fg.lastCommentCount = 0, fg.lastLikeCount = 0;
}
function _g() {
  if (!ModalManager.isOpen("postModal")) return console.log("[PostModal Live] Modal not open, stopping updates"), void Ng();
  if (!fg.activePostId) return console.log("[PostModal Live] No active post ID, stopping updates"), void Ng();
  const e = fg.activePostId, t = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!t) return console.log("[PostModal Live] Post deleted, closing modal"), void closePostModal();
  const n = $("modalVoteCount"), a = document.getElementById("postModal");
  if (n && a && !t.isPlayerPost) {
    const e2 = a.querySelector('[onclick*="voteOnPost"][onclick*="up"]'), o2 = a.querySelector('[onclick*="voteOnPost"][onclick*="down"]'), i2 = (t.upvotes || 0) - (t.downvotes || 0) + (t.likes.length || 0);
    if (n.textContent = i2, "up" === t.playerVote ? n.style.color = "var(--ca)" : "down" === t.playerVote ? n.style.color = "var(--bz)" : n.style.color = "var(--a)", e2) {
      const n2 = e2.querySelector("svg");
      "up" === t.playerVote ? (e2.style.background = "rgba(255, 69, 0, 0.25)", e2.style.border = "1px solid var(--ca)", n2 && n2.setAttribute("fill", "#ff4500")) : (e2.style.background = "transparent", e2.style.border = "1px solid transparent", n2 && n2.setAttribute("fill", "var(--a)"));
    }
    if (o2) {
      const e3 = o2.querySelector("svg");
      "down" === t.playerVote ? (o2.style.background = "rgba(113, 147, 255, 0.25)", o2.style.border = "1px solid var(--bz)", e3 && e3.setAttribute("fill", "#7193ff")) : (o2.style.background = "transparent", o2.style.border = "1px solid transparent", e3 && e3.setAttribute("fill", "var(--a)"));
    }
  }
  const o = $("modalLikeCount"), i = $("modalLikeIcon"), s = $("modalLikeBtn");
  if (o && t.likes.length !== fg.lastLikeCount && (o.style.transition = "all 0.3s ease", o.style.transform = "scale(1.3)", o.textContent = t.likes.length, setTimeout(() => {
    o.style.transform = "scale(1)";
  }, 300), fg.lastLikeCount = t.likes.length), i && s) {
    const e2 = t.likes.includes("player");
    i.textContent = e2 ? "\u2764\uFE0F" : "\u{1F90D}", s.style.color = e2 ? "var(--l)" : "var(--a)";
  }
  const r = $("modalCommentCount");
  if (r && t.comments.length !== fg.lastCommentCount) {
    if (r.style.transition = "all 0.3s ease", r.style.transform = "scale(1.3)", r.textContent = t.comments.length, setTimeout(() => {
      r.style.transform = "scale(1)";
    }, 300), t.comments.length > fg.lastCommentCount) {
      const t2 = $("modalCommentsContainer"), n2 = t2 && t2.scrollHeight - t2.scrollTop <= t2.clientHeight + 100;
      Rg(e, true), n2 && t2 && setTimeout(() => {
        t2.scrollTop = t2.scrollHeight;
      }, 50);
    }
    fg.lastCommentCount = t.comments.length;
  }
}
function Rg(e, t = false) {
  const n = $("modalCommentsContainer");
  if (!n) return;
  const a = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!a) return;
  if (0 === a.comments.length) return void (n.innerHTML = ' <div style="text-align:center; padding:40px 20px; color:var(--a);"> <div style="font-size:2rem; margin-bottom:10px;">\u{1F4AC}</div> <div style="font-size:0.9rem;">No comments yet</div> <div style="font-size:0.8rem; margin-top:4px; opacity:0.7;">Be the first to comment!</div> </div> ');
  const o = {};
  a.comments.forEach((e2) => {
    o[e2.id] = e2;
  });
  const i = [], s = {};
  a.comments.forEach((e2) => {
    if (e2.replyToCommentId && o[e2.replyToCommentId]) {
      const t2 = ((e3) => {
        let t3 = e3, n2 = 0;
        for (; t3.replyToCommentId && o[t3.replyToCommentId] && n2++ < 25; ) t3 = o[t3.replyToCommentId];
        return t3;
      })(e2);
      s[t2.id] || (s[t2.id] = []), s[t2.id].push(e2);
    } else i.push(e2);
  });
  const r = Dg(a.comments);
  if (t) {
    const u2 = Array.from(n.querySelectorAll("[data-comment-id]")).map((e2) => e2.dataset.commentId);
    0 === u2.length && a.comments.length > 0 && (n.innerHTML = "");
    const queue = [];
    i.forEach((e2) => {
      queue.push({ comment: e2, isReply: false, parentComment: null, rootComment: e2 }), (s[e2.id] || []).forEach((t2) => queue.push({ comment: t2, isReply: true, parentComment: o[t2.replyToCommentId] || e2, rootComment: e2 }));
    }), queue.forEach(({ comment: t2, isReply: a2, parentComment: i2, rootComment: l }) => {
      if (!u2.includes(t2.id)) {
        const r2 = Og(t2, e, a2, i2);
        if (r2.dataset.commentId = t2.id, r2.style.opacity = "0", r2.style.transform = "translateY(-10px)", r2.style.transition = "all 0.3s ease", a2 && l) {
          const e2 = [l.id, ...(s[l.id] || []).map((e3) => e3.id)].map((e3) => n.querySelector(`[data-comment-id="${e3}"]`)).filter(Boolean);
          e2.length > 0 ? e2[e2.length - 1].insertAdjacentElement("afterend", r2) : n.appendChild(r2);
        } else n.appendChild(r2);
        setTimeout(() => {
          r2.style.opacity = "1", r2.style.transform = "translateY(0)";
        }, 50);
      }
    });
  } else {
    if (n.innerHTML = "", r) {
      const e2 = document.createElement("div");
      e2.style.cssText = "text-align:center; padding:8px; margin-bottom:10px; background:rgba(233,69,96,0.1); border:1px solid rgba(233,69,96,0.3); border-radius:8px;", e2.innerHTML = '<span class="comment-war-badge">\u{1F37F} Comment War!</span> <span style="color:var(--a); font-size:0.8rem;">Things are getting spicy in here</span>', n.appendChild(e2);
    }
    i.forEach((t2) => {
      const a2 = Og(t2, e, false, null);
      a2.dataset.commentId = t2.id, n.appendChild(a2), (s[t2.id] || []).forEach((a3) => {
        const i2 = Og(a3, e, true, o[a3.replyToCommentId] || t2);
        i2.dataset.commentId = a3.id, n.appendChild(i2);
      });
    });
  }
}
function Dg(e) {
  const t = {};
  for (const n of e) {
    if (!n.replyToCommentId) continue;
    const a = e.find((e2) => e2.id === n.replyToCommentId);
    if (!a) continue;
    const o = [n.authorId, a.authorId].sort().join("|");
    t[o] = (t[o] || 0) + 1;
  }
  return Object.values(t).some((e2) => e2 >= 3);
}
function Og(e, t, n = false, a = null) {
  const o = document.createElement("div"), i = window.innerWidth <= 768;
  n ? (o.className = "comment-thread-reply", o.style.cssText = `background:var(--f); border:1px solid var(--o); border-radius:12px; padding:${i ? "10px" : "14px"}; margin-bottom:10px; margin-left:${i ? "24px" : "36px"}; border-left:2px solid var(--o);`) : o.style.cssText = `background:var(--f); border:1px solid var(--o); border-radius:12px; padding:${i ? "10px" : "14px"}; margin-bottom:10px;`;
  const s = e.isPlayerComment ? { name: "You", profileImage: null, employmentStatus: "active" } : gameState.employees.find((t2) => t2.id === e.authorId) || { name: e.authorName, profileImage: null, employmentStatus: "unknown" }, r = s.profileImage || "https://placehold.co/40x40?text=" + (s.name?.[0] || "?"), l = "alumni" === s.employmentStatus, c = Jg(e.timestamp), d = a ? a.isPlayerComment ? "You" : gameState.employees.find((e2) => e2.id === a.authorId)?.name || a.authorName || "someone" : null, p = n && d ? `<div class="comment-reply-label">Replying to <strong style="color:var(--j);">${d}</strong></div>` : "";
  return o.innerHTML = `
      ${p} <div style="display:flex; gap:${i ? "8px" : "10px"};"> <img src="${r}" style="width:${i ? "28px" : "32px"}; height:${i ? "28px" : "32px"}; border-radius:50%; object-fit:cover; border:2px solid ${l ? "var(--as)" : e.isPlayerComment ? "var(--l)" : "var(--u)"}; flex-shrink:0;"> <div style="flex:1; min-width:0;"> <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;"> <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;"> <strong style="font-size:${i ? "0.8rem" : "0.85rem"}; font-weight:600;">${e.isPlayerComment ? '<span style="color:var(--b);">You</span>' : yl(s)}</strong> ${e.isPlayerComment ? `<span style="color:var(--k); font-size:${i ? "0.7rem" : "0.75rem"}; font-weight:600;">@TheBoss</span>` : s.social?.username ? `<span style="color:var(--a); font-size:${i ? "0.7rem" : "0.75rem"};">@${s.social.username}</span>` : ""}
              ${l ? `<span style="background:var(--af); padding:2px 8px; border-radius:10px; font-size:${i ? "0.6rem" : "0.65rem"}; color:var(--ao);">Alumni</span>` : ""} <span style="color:var(--a); font-size:${i ? "0.7rem" : "0.75rem"};">${c}</span> </div> ${e.isPlayerComment ? "" : ` <button onclick="replyToComment(this.dataset.cid,this.dataset.cname,this.dataset.uname)" data-cid="${e.id}" data-cname="${s.name.replace(/"/g, "&quot;")}" data-uname="${(s.social?.username || "").replace(/"/g, "&quot;")}" style="background:transparent; border:1px solid var(--o); color:var(--a); padding:4px 10px; border-radius:6px; font-size:${i ? "0.7rem" : "0.75rem"}; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='rgba(0,212,255,0.1)'; this.style.borderColor='var(--u)'; this.style.color='var(--u)'" onmouseleave="this.style.background='transparent'; this.style.borderColor='var(--cd)'; this.style.color='var(--a)'"> Reply </button> `} </div> <div style="color:var(--y); line-height:1.5; font-size:${i ? "0.85rem" : "0.9rem"}; word-wrap:break-word; overflow-wrap:break-word; margin-bottom:${e.isPlayerComment ? "0" : "6px"};">
            ${linkifyMentions(e.content, e.authorId, e.dmSent, e.dmMessageTimestamp)} </div> ${e.imageUrl ? ` <div style="margin:8px 0; position:relative; display:inline-block;"> <img src="${e.imageUrl}" alt="${e.imageAlt || "Comment image"}" style="max-width:100%; max-height:400px; border-radius:12px; cursor:pointer; display:block; border:1px solid var(--o);" onclick="openImageViewer('${e.imageUrl}')">
              ${e.imagePrompt ? ` <button onclick="event.stopPropagation(); regenerateCommentImage('${t}', '${e.id}')"
                        data-regen-comment-id="${e.id}" style="position:absolute; top:8px; right:8px; background:var(--eu); backdrop-filter:blur(8px); border:1px solid var(--dt); color:var(--b); padding:6px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:600; display:flex; align-items:center; gap:4px; transition:all 0.2s; opacity:0.8;" onmouseenter="if(!this.disabled) { this.style.opacity='1'; this.style.background='var(--bn)'; this.style.transform='scale(1.05)'; }" onmouseleave="if(!this.disabled) { this.style.opacity='0.8'; this.style.background='var(--eu)'; this.style.transform='scale(1)'; }"> \u{1F504} </button> ` : ""} </div> ` : ""}
          ${e.isPlayerComment ? "" : ` <div style="display:flex; align-items:center; gap:3px; background:var(--i); border-radius:12px; padding:2px 4px; width:fit-content;"> <!-- Upvote Arrow --> <button onclick="voteOnComment('${e.id}', 'up')" 
                      style="background:${"up" === e.playerVote ? "rgba(255, 69, 0, 0.25)" : "transparent"}; border:${"up" === e.playerVote ? "1px solid var(--ca)" : "1px solid transparent"}; padding:3px 5px; border-radius:6px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;"
                      onmouseenter="this.style.transform='scale(1.15)'"
                      onmouseleave="this.style.transform='scale(1)'">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="${"up" === e.playerVote ? "var(--ca)" : "var(--a)"}"> <path d="M12 4l8 8h-6v8h-4v-8H4z"/> </svg> </button> <!-- Vote Count --> <span style="font-size:0.8rem; font-weight:700; color:${"up" === e.playerVote ? "var(--ca)" : "down" === e.playerVote ? "var(--bz)" : "var(--a)"}; min-width:20px; text-align:center;">
                ${(e.upvotes || 0) - (e.downvotes || 0)} </span> <!-- Downvote Arrow --> <button onclick="voteOnComment('${e.id}', 'down')" 
                      style="background:${"down" === e.playerVote ? "rgba(113, 147, 255, 0.25)" : "transparent"}; border:${"down" === e.playerVote ? "1px solid var(--bz)" : "1px solid transparent"}; padding:3px 5px; border-radius:6px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;"
                      onmouseenter="this.style.transform='scale(1.15)'"
                      onmouseleave="this.style.transform='scale(1)'">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="${"down" === e.playerVote ? "var(--bz)" : "var(--a)"}"> <path d="M12 20l-8-8h6V4h4v8h6z"/> </svg> </button> </div> `} </div> </div> `, o;
}
function submitModalComment(e) {
  const t = $("modalCommentInput");
  if (!t) return;
  const n = t.value.trim();
  if (!n) return;
  const a = t.dataset.replyToCommentId || null;
  addCommentToPost(e, n, a), cancelReply(), t.value = "", t.style.height = "auto", Rg(e);
  const o = $("modalCommentCount"), i = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  o && i && (o.textContent = i.comments.length, fg.lastCommentCount = i.comments.length), renderSocialFeed();
}
function replyToComment(e, t, n) {
  const a = $("modalCommentInput");
  if (!a) return;
  a.dataset.replyToCommentId = e;
  let o = $("modalReplyIndicator");
  if (!o) {
    o = document.createElement("div"), o.id = "modalReplyIndicator", o.style.cssText = "padding:6px 12px; background:rgba(102,126,234,0.15); border-left:3px solid var(--j); border-radius:0 6px 6px 0; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;";
    const e2 = a.parentNode;
    e2.parentNode.insertBefore(o, e2);
  }
  o.innerHTML = ` <span style="color:var(--j);">\u21B3 Replying to <strong>${t}</strong></span> <button onclick="cancelReply()" style="background:transparent; border:none; color:var(--a); cursor:pointer; font-size:0.9rem; padding:2px 6px;">\u2715</button> `, o.style.display = "flex";
  const i = n ? `@${n} ` : `@${t.replace(/\s+/g, "_")} `;
  a.value.trim() ? a.value = i + a.value : a.value = i, a.focus(), a.setSelectionRange(a.value.length, a.value.length), a.style.height = "auto", a.style.height = a.scrollHeight + "px";
}
function cancelReply() {
  const e = $("modalCommentInput");
  e && delete e.dataset.replyToCommentId;
  const t = $("modalReplyIndicator");
  t && (t.style.display = "none");
}
function Bg() {
  gameState.socialNetwork && (gameState.socialNetwork.notifications || (gameState.socialNetwork.notifications = [], gameState.socialNetwork.notifIdCounter = 0, gameState.socialNetwork.lastNotifCheck = 0));
}
function addSocialNotification({ type: e, fromId: t, fromName: n, postId: a, commentId: o, preview: i, targetAuthorId: s }) {
  if (Bg(), "player" !== s && s && "mention" !== e && "viral" !== e) {
    const e2 = gameState.socialNetwork.posts.find((e3) => e3.id === a);
    if (!e2?.isPlayerPost && "player" !== e2?.authorId) return;
  }
  if (gameState.socialNetwork.notifications.find((n2) => n2.type === e && n2.fromId === t && n2.postId === a && Date.now() - n2.timestamp < 6e4)) return;
  const r = { id: "notif_" + ++gameState.socialNetwork.notifIdCounter, type: e, fromId: t, fromName: n, postId: a, commentId: o, preview: i?.substring(0, 80) || "", timestamp: Date.now(), read: false };
  gameState.socialNetwork.notifications.unshift(r), gameState.socialNetwork.notifications.length > 50 && (gameState.socialNetwork.notifications = gameState.socialNetwork.notifications.slice(0, 50)), Fg(), console.log(`[Notification] ${e}: ${n} - ${i?.substring(0, 40)}`);
}
function Fg() {
  Bg();
  const e = $("notifBadge");
  if (!e) return;
  const t = gameState.socialNetwork.notifications.filter((e2) => !e2.read).length;
  t > 0 ? (e.textContent = t > 99 ? "99+" : t, e.style.display = "flex") : e.style.display = "none", qg();
}
function toggleNotificationPanel() {
  const e = $("socialNotifPanel");
  if (!e) return;
  const t = "none" !== e.style.display;
  e.style.display = t ? "none" : "block", t || (jg(), setTimeout(() => {
    gameState.socialNetwork.notifications.forEach((e2) => e2.read = true), Fg();
  }, 2e3));
}
function jg() {
  Bg();
  const e = $("notifList");
  if (!e) return;
  const t = gameState.socialNetwork.notifications;
  if (0 === t.length) return void (e.innerHTML = '<div style="text-align:center; padding:30px; color:var(--e); font-style:italic;">No notifications yet</div>');
  const n = { like: "\u2764\uFE0F", comment: "\u{1F4AC}", mention: "\u{1F4E2}", reply: "\u21A9\uFE0F", viral: "\u{1F525}", comment_war: "\u{1F37F}", story: "\u{1F4F8}", poll_vote: "\u{1F4CA}" }, a = { like: "liked your post", comment: "commented on your post", mention: "mentioned you", reply: "replied to a comment", viral: "Your post went viral!", comment_war: "Comment war on a post!", story: "posted a new story", poll_vote: "voted on your poll" };
  e.innerHTML = t.slice(0, 30).map((e2) => {
    const t2 = gameState.employees.find((t3) => t3.id === e2.fromId), o = t2?.profileImage || `https://placehold.co/36x36?text=${(e2.fromName || "?")[0]}`, i = Jg(e2.timestamp);
    return ` <div class="notif-item ${e2.read ? "" : "unread"}" onclick="handleNotifClick('${e2.postId}', '${e2.id}')"> <img src="${o}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; flex-shrink:0; border:1px solid var(--o);"> <div style="flex:1; min-width:0;"> <div class="notif-text"> <strong>${e2.fromName || "Someone"}</strong> ${a[e2.type] || "interacted with your post"}
              ${e2.preview ? `<div style="color:var(--a); font-size:0.8rem; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">"${e2.preview}"</div>` : ""} </div> <div class="notif-time">${i}</div> </div> <span class="notif-icon">${n[e2.type] || "\u{1F514}"}</span> </div> `;
  }).join("");
}
function handleNotifClick(e, t) {
  const n = gameState.socialNetwork.notifications?.find((e2) => e2.id === t);
  n && (n.read = true), Fg();
  const a = $("socialNotifPanel");
  a && (a.style.display = "none"), e && openPostModal(e);
}
function clearAllNotifications() {
  gameState.socialNetwork?.notifications && (gameState.socialNetwork.notifications = []), Fg(), jg();
}
function qg() {
  const e = $("dashSocialMentions");
  if (!e) return;
  Bg();
  const t = gameState.socialNetwork.notifications.filter((e2) => ["mention", "like", "comment", "reply", "viral"].includes(e2.type)).slice(0, 5);
  if (0 === t.length) {
    const t2 = (gameState.socialNetwork?.posts || []).filter((e2) => e2.content && e2.content.toLowerCase().includes("@theboss")).sort((e2, t3) => t3.timestamp - e2.timestamp);
    return 0 === t2.length ? void (e.innerHTML = '<div style="text-align:center; color:var(--e); padding:20px; font-style:italic;">No activity yet. Engage with employees!</div>') : void (e.innerHTML = t2.slice(0, 3).map((e2) => {
      const t3 = gameState.employees.find((t4) => t4.id === e2.authorId);
      if (!t3) return "";
      const n2 = "function" == typeof ld ? ld(e2.timestamp) : Jg(e2.timestamp), a = e2.content.substring(0, 100) + (e2.content.length > 100 ? "..." : "");
      return ` <div onclick="switchTab('social')" style="background:var(--f); padding:12px; border-radius:8px; margin-bottom:10px; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='var(--w)'" onmouseleave="this.style.background='var(--t)'"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;"> <div style="font-weight:600; color:var(--v);">\u{1F4E2} ${t3.name}</div> <div style="font-size:0.75rem; color:var(--e);">${n2}</div> </div> <div style="color:var(--a); font-size:0.85rem;">${a}</div> </div> `;
    }).filter((e2) => e2).join(""));
  }
  const n = { like: "\u2764\uFE0F", comment: "\u{1F4AC}", mention: "\u{1F4E2}", reply: "\u21A9\uFE0F", viral: "\u{1F525}" };
  e.innerHTML = t.map((e2) => {
    const t2 = "function" == typeof ld ? ld(e2.timestamp) : Jg(e2.timestamp);
    return ` <div onclick="switchTab('social'); setTimeout(() => openPostModal('${e2.postId}'), 300);" style="background:var(--f); padding:12px; border-radius:8px; margin-bottom:10px; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='var(--w)'" onmouseleave="this.style.background='var(--t)'"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;"> <div style="font-weight:600; color:var(--v);">${n[e2.type] || "\u{1F514}"} ${e2.fromName}</div> <div style="font-size:0.75rem; color:var(--e);">${t2}</div> </div> <div style="color:var(--a); font-size:0.85rem;">${e2.preview || "interacted with your post"}</div> </div> `;
  }).join("");
}
function zg() {
  gameState.socialNetwork && (gameState.socialNetwork.stories || (gameState.socialNetwork.stories = [], gameState.socialNetwork.storyIdCounter = 0, gameState.socialNetwork.lastStoryGen = 0));
}
