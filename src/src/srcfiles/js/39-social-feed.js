// ============================================================================
// 39-social-feed — Social feed: feed rendering, post modal, comments, notifications badge, post actions, poll rendering pieces.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

let resizeThrottleTimer = null;
window.addEventListener("resize", () => {
    resizeThrottleTimer ||
        (resizeThrottleTimer = setTimeout(() => {
            updateSidebarToggleVisibility(), (resizeThrottleTimer = null);
        }, 250));
});
let feedPaginationState = {
        postsPerPage: 20,
        currentPage: 1,
        totalPages: 1,
        pendingUpdates: new Set(),
        updateThrottle: null,
        allPosts: [],
    },
    postModalState = { activePostId: null, updateInterval: null, lastCommentCount: 0, lastLikeCount: 0 };
function updateSocialTab() {
    "social" === gameState.activeTab && (syncSocialFilterUI(), updateFeedStats(), renderSocialFeed());
}
function syncSocialFilterUI() {
    const e = gameState.socialNetwork?.algorithm || {},
        t = $("postTypeFilter");
    t && (t.value = e.postType || "all");
    const n = $("authorFilter");
    n && (n.value = e.author || "all");
    const a = $("engagementFilter");
    a && (a.value = e.engagement || "all");
    const o = e.contentRating || "all";
    document.querySelectorAll(".content-filter-btn").forEach((e) => {
        e.classList.toggle("active", e.dataset.rating === o);
    });
    const i = e.sort || "foryou";
    document.querySelectorAll(".algo-sort-btn").forEach((e) => {
        e.classList.toggle("active", e.dataset.sort === i);
    });
    const s = $("bestTimeFrameSelector");
    s && (s.style.display = "best" === i ? "block" : "none");
    const r = $("bestTimeFrameSelect");
    r && (r.value = e.bestTimeFrame || "all");
    const l = $("feedSearchInput"),
        c = $("clearSearchBtn");
    l && ((l.value = e.searchQuery || ""), c && (c.style.display = e.searchQuery ? "block" : "none"));
}
function requestSmartFeedUpdate(e = null) {
    e && feedPaginationState.pendingUpdates.add(e),
        feedPaginationState.updateThrottle && clearTimeout(feedPaginationState.updateThrottle),
        (feedPaginationState.updateThrottle = setTimeout(() => {
            performSmartFeedUpdate();
        }, 50));
}
function performSmartFeedUpdate() {
    $("socialFeedContent") &&
        (feedPaginationState.pendingUpdates.size > 0 &&
            feedPaginationState.pendingUpdates.forEach((e) => {
                updatePostInPlace(e);
            }),
        feedPaginationState.pendingUpdates.clear());
}
function performGentleUpdate() {
    if (!$("socialFeedContent")) return;
    const e = filterAndSortPosts(),
        t = feedPaginationState.allPosts,
        n = [];
    for (let a = 0; a < e.length && !t.find((t) => t.id === e[a].id); a++) n.push(e[a]);
    n.length > 0 && (showNewPostsNotification(n.length), (feedPaginationState.allPosts = e)),
        feedPaginationState.pendingUpdates.size > 0 &&
            feedPaginationState.pendingUpdates.forEach((e) => {
                updatePostInPlace(e);
            });
}
function showNewPostsNotification(e) {
    const t = $("newPostsNotification");
    t && t.remove();
    const n = document.createElement("div");
    (n.id = "newPostsNotification"),
        (n.style.cssText =
            "\n      position: fixed;\n      top: 80px;\n      left: 50%;\n      transform: translateX(-50%);\n      background: linear-gradient(135deg, var(--l-cyan) 0%, var(--l-cyan-dark) 100%);\n      color: var(--l-on-accent);\n      padding: 12px 24px;\n      border-radius: 24px;\n      box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);\n      cursor: pointer;\n      z-index: 10000;\n      font-weight: 600;\n      font-size: 0.9rem;\n      animation: slideDown 0.3s ease-out;\n      transition: transform 0.2s, box-shadow 0.2s;\n    "),
        (n.innerHTML = `\n      <span style="margin-right: 8px;">↑</span>\n      ${e} new post${e > 1 ? "s" : ""}\n      <span style="margin-left: 8px; font-size: 0.8rem; opacity: 0.9;">• Click to view</span>\n    `),
        (n.onclick = () => {
            const e = $("socialFeedContent");
            e &&
                (e.scrollTo({ top: 0, behavior: "smooth" }),
                setTimeout(() => {
                    renderSocialFeed(!0);
                }, 300)),
                n.remove();
        }),
        setTimeout(() => {
            n.parentNode &&
                ((n.style.opacity = "0"),
                (n.style.transform = "translateX(-50%) translateY(-20px)"),
                setTimeout(() => n.remove(), 300));
        }, 8e3),
        document.body.appendChild(n);
}
function updatePostInPlace(e) {
    const t = document.querySelector(`[data-post-id="${e}"]`);
    if (!t) return void console.warn(`[Feed Update] Could not find post element for ID: ${e}`);
    const n = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!n) return void console.warn(`[Feed Update] Could not find post data for ID: ${e}`);
    console.log(`[Feed Update] Updating post ${e} (${n.comments.length} comments)`),
        Array.isArray(n.likes) || (n.likes = []);
    const a = t.querySelector(".like-count");
    if (a) {
        const e = n.likes.includes("player");
        (a.innerHTML = `${e ? "❤️" : "🤍"} ${n.likes.length}`), (a.style.color = e ? "var(--l-red)" : "var(--text-dim)");
    }
    const o = t.querySelector(".comment-count");
    o && (o.innerHTML = `💬 ${n.comments.length}`);
    const i = t.querySelector(".post-comments-section");
    i &&
        (console.log(`[Feed Update] FORCE updating comments for post ${e} (${n.comments.length} comments)`),
        updateCommentsSection(t, n),
        delete i.dataset.needsRefresh);
}
function updateCommentsSection(e, t) {
    const n = e.querySelector(".post-comments-section");
    if (!n) return;
    const a = n.querySelector(".comments-list");
    if (!a) return;
    const o = n.querySelector("textarea"),
        i = o && document.activeElement === o,
        s = i ? o.value : "",
        r = i ? o.selectionStart : 0,
        l = n.scrollTop;
    if (((a.innerHTML = buildCommentsHTML(t)), (n.scrollTop = l), i && o)) {
        const e = n.querySelector("textarea");
        e && ((e.value = s), e.focus(), e.setSelectionRange(r, r));
    }
}
function buildCommentsHTML(e) {
    if (0 === e.comments.length)
        return '<div class="sp-no-comments">No comments yet. Be the first!</div>';
    const t = {},
        n = [],
        a = {};
    e.comments.forEach((e) => {
        t[e.id] = e;
    }),
        e.comments.forEach((e) => {
            e.replyToCommentId && t[e.replyToCommentId]
                ? ((a[e.replyToCommentId] = a[e.replyToCommentId] || []), a[e.replyToCommentId].push(e))
                : n.push(e);
        });
    const o = (e, n) => {
        const i =
                "player" === e.authorId
                    ? { name: "You", social: { username: "TheBoss" } }
                    : gameState.employees.find((t) => t.id === e.authorId) || {
                          name: e.authorName || "Unknown",
                          social: {},
                      },
            s = "player" === e.authorId,
            r = getTimeAgo(e.timestamp),
            l = n && t[e.replyToCommentId],
            c = l ? ("player" === l.authorId ? "You" : l.authorName || "someone") : null;
        let d = `\n        <div class="comment sp-comment${n ? " sp-comment--reply" : ""}">\n          <div style="flex: 1;">\n            <div class="sp-comment-h">\n              <span class="sp-comment-name${s ? " is-player" : ""}">${i.name}</span>\n              ${i.social?.username ? `<span class="sp-comment-handle">@${i.social.username}</span>` : ""}\n              <span class="sp-comment-time">${r}</span>\n            </div>\n            ${c ? `<div class="sp-reply-to">↪ replying to ${c}</div>` : ""}\n            <div class="sp-comment-body">${linkifyMentions(e.content, e.authorId, e.dmSent, e.dmMessageTimestamp)}</div>\n          </div>\n        </div>\n      `;
        return (a[e.id] || []).forEach((e) => (d += o(e, !0))), d;
    };
    return n.map((e) => o(e, !1)).join("");
}
function updateFeedStats() {
    const e = $("totalPostsCount"),
        t = $("activeUsersCount"),
        n = $("todayPostsCount");
    if ((e && (e.textContent = gameState.socialNetwork.posts.length), t)) {
        const e = gameState.employees.filter((e) => "active" === e.employmentStatus).length;
        t.textContent = e;
    }
    if (n) {
        const e = Date.now() - 864e5,
            t = gameState.socialNetwork.posts.filter((t) => t.timestamp > e).length;
        n.textContent = t;
    }
}
let _lastFeedFingerprint = "";
function renderSocialFeed(e = !1) {
    const t = $("socialFeedContent"),
        n = $("feedEmptyState");
    if (!t) return;
    let a = filterAndSortPosts();
    if (0 === a.length)
        return (
            (_lastFeedFingerprint = ""),
            (t.innerHTML = ""),
            n && ((n.style.display = "block"), t.appendChild(n)),
            void updateFeedStatsText(0, 0)
        );
    n && (n.style.display = "none"),
        (feedPaginationState.totalPages = Math.ceil(a.length / feedPaginationState.postsPerPage)),
        e && (feedPaginationState.currentPage = 1),
        feedPaginationState.currentPage > feedPaginationState.totalPages &&
            (feedPaginationState.currentPage = feedPaginationState.totalPages);
    const o = (feedPaginationState.currentPage - 1) * feedPaginationState.postsPerPage,
        i = o + feedPaginationState.postsPerPage,
        s = a.slice(o, i),
        r =
            feedPaginationState.currentPage +
            ":" +
            s
                .map(
                    (e) => e.id + "," + (e.likes || 0) + "," + (e.comments?.length || 0) + "," + (e.imageUrl || "")
                )
                .join("|");
    if (!e && r === _lastFeedFingerprint) return;
    _lastFeedFingerprint = r;
    const l = t.scrollTop;
    (t.innerHTML = ""),
        s.forEach((e) => {
            const n = createFeedPostCard(e);
            n && n.nodeType === Node.ELEMENT_NODE && t.appendChild(n);
        });
    const c = createPaginationControls(a.length);
    t.appendChild(c), updateFeedStatsText(a.length, s.length), (t.scrollTop = !e && l > 0 ? l : 0);
    try {
        renderStoriesBar();
    } catch (e) {
        console.error("Error rendering stories:", e);
    }
    try {
        updateNotifBadge();
    } catch (e) {
        console.warn("Error updating notification badge:", e);
    }
}
function createPaginationControls(e) {
    const t = document.createElement("div");
    t.style.cssText =
        "display:flex; justify-content:center; align-items:center; gap:10px; padding:30px 20px; margin-top:20px; border-top:1px solid var(--border);";
    const n = feedPaginationState.currentPage,
        a = feedPaginationState.totalPages,
        o = document.createElement("button");
    (o.textContent = "← Previous"),
        (o.disabled = 1 === n),
        (o.style.cssText = `\n      padding:10px 20px; \n      background:${1 === n ? "var(--l-slate-2)" : "linear-gradient(135deg, var(--l-cyan), var(--l-cyan-dark))"}; \n      border:none; \n      border-radius:8px; \n      color:${1 === n ? "var(--l-neutral-6)" : "white"}; \n      cursor:${1 === n ? "not-allowed" : "pointer"}; \n      font-weight:600;\n      transition:all 0.2s;\n    `),
        n > 1 &&
            ((o.onmouseenter = function () {
                this.style.transform = "translateY(-2px)";
            }),
            (o.onmouseleave = function () {
                this.style.transform = "translateY(0)";
            }),
            (o.onclick = () => {
                feedPaginationState.currentPage--, renderSocialFeed(!1);
            }));
    const i = document.createElement("div");
    (i.style.cssText = "color:var(--text); font-weight:600; padding:0 15px; font-size:0.95rem;"),
        (i.innerHTML = `Page <span style="color:var(--accent);">${n}</span> of <span style="color:var(--accent);">${a}</span>`);
    const s = document.createElement("button");
    return (
        (s.textContent = "Next →"),
        (s.disabled = n === a),
        (s.style.cssText = `\n      padding:10px 20px; \n      background:${n === a ? "var(--l-slate-2)" : "linear-gradient(135deg, var(--l-cyan), var(--l-cyan-dark))"}; \n      border:none; \n      border-radius:8px; \n      color:${n === a ? "var(--l-neutral-6)" : "white"}; \n      cursor:${n === a ? "not-allowed" : "pointer"}; \n      font-weight:600;\n      transition:all 0.2s;\n    `),
        n < a &&
            ((s.onmouseenter = function () {
                this.style.transform = "translateY(-2px)";
            }),
            (s.onmouseleave = function () {
                this.style.transform = "translateY(0)";
            }),
            (s.onclick = () => {
                feedPaginationState.currentPage++, renderSocialFeed(!1);
            })),
        t.appendChild(o),
        t.appendChild(i),
        t.appendChild(s),
        t
    );
}
function updateFeedStatsText(e, t) {
    const n = $("feedStatsText");
    n && (n.textContent = e === t ? `${e} post${1 !== e ? "s" : ""}` : `Showing ${t} of ${e} posts`);
}
function createFeedPostCard(e) {
    const t = document.createElement("div");
    (t.className = "social-post-card"),
        (t.dataset.postId = e.id),
        (t.style.cssText =
            "background:var(--surface); border:1px solid var(--border); border-radius:4px; padding:20px; margin-bottom:4px; box-shadow:0 1px 3px var(--l-veil-12); transition:all 0.3s ease; cursor:pointer; max-width:600px; margin-left:auto; margin-right:auto;"),
        (t.onmouseenter = function () {
            (this.style.background = "var(--surface-2)"), (this.style.borderColor = "var(--l-neutral-4)");
        }),
        (t.onmouseleave = function () {
            (this.style.background = "var(--surface)"), (this.style.borderColor = "var(--l-slate-2)");
        }),
        (t.onclick = function (t) {
            "BUTTON" === t.target.tagName ||
                "IMG" === t.target.tagName ||
                t.target.closest("button") ||
                openPostModal(e.id);
        });
    const n = e.isPlayerPost
            ? { name: "You", profileImage: null, employmentStatus: "active" }
            : gameState.employees.find((t) => t.id === e.authorId) || {
                  name: e.authorName,
                  profileImage: null,
                  employmentStatus: "unknown",
              },
        a = n.profileImage || placeholderImage(50, 50, (n.name?.[0] || "?")),
        o = "alumni" === n.employmentStatus,
        i = formatTimeAgo(e.timestamp);
    Array.isArray(e.likes) || (e.likes = []);
    const s = e.likes.includes("player");
    return (
        (t.innerHTML = `\n      \x3c!-- Post Header --\x3e\n      <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;">\n        <img src="${a}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid ${o ? "var(--border-strong)" : e.isPlayerPost ? "var(--danger)" : "var(--accent)"}; flex-shrink:0; cursor:${e.isPlayerPost ? "default" : "pointer"};" onclick="event.stopPropagation(); ${e.isPlayerPost ? "" : `openUnifiedProfile('${e.authorId}', 'overview')`}">\n        <div style="flex:1; min-width:0;">\n          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">\n            <strong style="font-size:0.95rem; font-weight:600; cursor:${e.isPlayerPost ? "default" : "pointer"}; transition:opacity 0.2s;" ${e.isPlayerPost ? "" : `onclick="openUnifiedProfile('${e.authorId}', 'overview')" onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'"`}>${e.isPlayerPost ? '<span style="color:var(--l-ink);">You</span>' : getColoredName(n)}</strong>\n            ${e.isPlayerPost ? '<span style="color:var(--danger); font-size:0.85rem; font-weight:600;">@TheBoss</span>' : n.social?.username ? `<span style="color:var(--text-dim); font-size:0.85rem;">@${n.social.username}</span>` : ""}\n            ${o ? '<span style="background:var(--l-neutral-5); padding:3px 10px; border-radius:12px; font-size:0.7rem; color:var(--l-ink-dim);">Alumni</span>' : ""}\n            ${e.explicitLevel >= 1 ? '<span style="background:linear-gradient(135deg, var(--l-red), #d63850); padding:3px 10px; border-radius:12px; font-size:0.7rem; color:var(--l-ink-on-fill); font-weight:600;">🔞</span>' : ""}${(() => { const sig = getPostSignal(e); return sig ? `<span class="sp-signal">${sig}</span>` : ""; })()}\n          </div>\n          <div style="color:var(--text-dim); font-size:0.8rem; margin-top:2px;">${i}</div>\n          ${e.activityLabel && !["at_work", "relaxing", "chatting_player", "in_person_player"].includes(e.activityStatus) ? `<div style="color:var(--l-indigo); font-size:0.72rem; margin-top:1px;">${e.activityLabel}</div>` : ""}\n        </div>\n      </div>\n\n      ${e.explicitLevel >= 3 ? '\n        <div style="background:rgba(233, 69, 96, 0.15); padding:10px 14px; border-radius:8px; border-left:4px solid var(--danger); margin-bottom:14px; font-size:0.85rem; color:var(--l-x-red-pale-2);">\n          <strong style="display:flex; align-items:center; gap:6px;"><span>🔞</span> Explicit Content Warning</strong>\n        </div>\n      ' : ""}\n      \n      \x3c!-- Post Content --\x3e\n      <div style="color:var(--text); line-height:1.6; margin-bottom:14px; font-size:0.95rem; word-wrap:break-word;">\n        ${linkifyMentions(e.content)}\n      </div>\n      \n      \x3c!-- Post Image --\x3e\n      ${e.imageUrl ? `\n        <div style="margin-bottom:14px; border-radius:12px; overflow:hidden; border:1px solid var(--border); position:relative;" \n             onmouseenter="\n               const btn = this.querySelector('.post-regen-btn');\n               if(btn && !btn.disabled) {\n                 btn.style.opacity='0.9';\n               }\n             "\n             onmouseleave="\n               const btn = this.querySelector('.post-regen-btn');\n               if(btn && !btn.disabled) {\n                 btn.style.opacity='0';\n               }\n             ">\n          <img src="${e.imageUrl}" \n               onerror="this.onerror=null; this.src=placeholderImage(600,400,'Image failed to load'); this.style.opacity='0.5';" \n               onload="this.style.opacity='1';"\n               style="width:100%; height:auto; display:block; cursor:pointer; opacity:0; transition:opacity 0.3s;" \n               onclick="event.stopPropagation(); openImageViewer('${e.imageUrl}')">\n          ${e.imagePrompt ? `\n            <button onclick="\n                      event.stopPropagation(); \n                      regeneratePostImage('${e.id}')\n                    " \n                    class="post-regen-btn"\n                    data-regen-post-id="${e.id}"\n                    style="position:absolute !important; top:10px !important; right:10px !important; background:var(--l-veil-80) !important; backdrop-filter:blur(10px); border:1px solid var(--l-sheen-30) !important; color:var(--l-ink) !important; padding:8px 14px !important; border-radius:8px !important; cursor:pointer !important; font-size:0.85rem !important; font-weight:600 !important; display:flex !important; align-items:center !important; gap:6px !important; transition:all 0.2s !important; opacity:0 !important; z-index:10 !important; box-shadow:0 4px 12px var(--l-veil-50) !important; pointer-events:auto !important;"\n                    onmouseenter="\n                      if(!this.disabled) {\n                        this.style.opacity='1'; \n                        this.style.background='var(--l-veil-95)'; \n                        this.style.transform='scale(1.05)';\n                      }\n                    "\n                    onmouseleave="\n                      if(!this.disabled) {\n                        this.style.opacity='0.9'; \n                        this.style.background='var(--l-veil-80)'; \n                        this.style.transform='scale(1)';\n                      }\n                    ">\n              🔄 Regenerate\n            </button>\n          ` : ""}\n        </div>\n      ` : ""}\n      \n      \x3c!-- Poll (if applicable) --\x3e\n      ${e.poll ? renderPollHTML(e, !1) : ""}\n      \n      \x3c!-- Post Actions --\x3e\n      <div style="display:flex; gap:20px; padding-top:10px; border-top:1px solid var(--border); align-items:center;">\n        \x3c!-- Reddit-style Vote Widget (replaces Like button) --\x3e\n        ${e.isPlayerPost ? `\n          \x3c!-- Player's own posts show NPC likes only --\x3e\n          <button onclick="event.stopPropagation(); handleLikePost('${e.id}')" style="background:transparent; border:none; color:${s ? "var(--l-red)" : "var(--text-dim)"}; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:0.9rem; padding:8px 12px; border-radius:8px; transition:all 0.2s;" onmouseenter="this.style.background='var(--l-sheen-05)'" onmouseleave="this.style.background='transparent'">\n            <span style="font-size:1.1rem;">${s ? "❤️" : "🤍"}</span>\n            <span>${e.likes.length}</span>\n          </button>\n        ` : `\n          <div style="display:flex; align-items:center; gap:4px; background:var(--bg); border-radius:20px; padding:4px 6px;">\n            \x3c!-- Upvote Arrow --\x3e\n            <button onclick="event.stopPropagation(); voteOnPost('${e.id}', 'up')" \n                    style="background:transparent; border:none; padding:2px 4px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;"\n                    onmouseenter="this.style.transform='scale(1.2)'"\n                    onmouseleave="this.style.transform='scale(1)'">\n              <svg width="20" height="20" viewBox="0 0 24 24" fill="${"up" === e.playerVote ? "var(--l-orange-red)" : "var(--text-dim)"}">\n                <path d="M12 4l8 8h-6v8h-4v-8H4z"/>\n              </svg>\n            </button>\n            \n            \x3c!-- Vote Count --\x3e\n            <span style="font-size:0.85rem; font-weight:600; color:${"up" === e.playerVote ? "var(--l-orange-red)" : "down" === e.playerVote ? "var(--l-indigo-lt)" : "var(--text-dim)"}; min-width:24px; text-align:center;">\n              ${(e.upvotes || 0) - (e.downvotes || 0) + (e.likes.length || 0)}\n            </span>\n            \n            \x3c!-- Downvote Arrow --\x3e\n            <button onclick="event.stopPropagation(); voteOnPost('${e.id}', 'down')" \n                    style="background:transparent; border:none; padding:2px 4px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;"\n                    onmouseenter="this.style.transform='scale(1.2)'"\n                    onmouseleave="this.style.transform='scale(1)'">\n              <svg width="20" height="20" viewBox="0 0 24 24" fill="${"down" === e.playerVote ? "var(--l-indigo-lt)" : "var(--text-dim)"}">\n                <path d="M12 20l-8-8h6V4h4v8h6z"/>\n              </svg>\n            </button>\n          </div>\n        `}\n        \n        \x3c!-- Comments Button --\x3e\n        <button onclick="event.stopPropagation(); openPostModal('${e.id}')" style="background:transparent; border:none; color:var(--text-dim); cursor:pointer; display:flex; align-items:center; gap:6px; font-size:0.9rem; padding:8px 12px; border-radius:8px; transition:all 0.2s;" onmouseenter="this.style.background='var(--l-sheen-05)'" onmouseleave="this.style.background='transparent'">\n          <span style="font-size:1.1rem;">💬</span>\n          <span>${e.comments.length}</span>\n        </button>\n        \n        \x3c!-- NEW: More Actions Menu (nested in [...]) - Only for NPC posts --\x3e\n        ${e.isPlayerPost ? "" : `\n          <div style="margin-left:auto; position:relative;">\n            <button \n              onclick="event.stopPropagation(); togglePostActionsMenu('${e.id}')"\n              id="postActionsBtn_${e.id}"\n              style="background:transparent; border:1px solid var(--border); color:var(--text-dim); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1.2rem; padding:6px 12px; border-radius:6px; transition:all 0.2s; font-weight:bold; letter-spacing:2px;"\n              onmouseenter="this.style.background='var(--l-sheen-08)'; this.style.borderColor='var(--l-cyan)'"\n              onmouseleave="this.style.background='transparent'; this.style.borderColor='var(--l-slate-2)'"\n              title="More actions">\n              ⋯\n            </button>\n            <div \n              id="postActionsMenu_${e.id}" \n              style="display:none; position:absolute; right:0; top:calc(100% + 4px); background:var(--surface-2); border:1px solid var(--border); border-radius:12px; min-width:180px; z-index:1000; box-shadow:0 8px 24px var(--l-veil-50); overflow:hidden;">\n              \x3c!-- Send Gift --\x3e\n              <button \n                onclick="event.stopPropagation(); closePostActionsMenu(); giftOnPost('${e.id}')"\n                style="width:100%; padding:12px 16px; background:transparent; border:none; color:var(--l-ink); cursor:pointer; display:flex; align-items:center; gap:10px; font-size:0.9rem; transition:all 0.15s; text-align:left;"\n                onmouseenter="this.style.background='rgba(83,52,131,0.3)'"\n                onmouseleave="this.style.background='transparent'">\n                <span style="font-size:1.1rem;">🎁</span> Send Gift\n              </button>\n              \x3c!-- Send Cash --\x3e\n              <button \n                onclick="event.stopPropagation(); closePostActionsMenu(); tipOnPost('${e.id}')"\n                style="width:100%; padding:12px 16px; background:transparent; border:none; color:var(--l-ink); cursor:pointer; display:flex; align-items:center; gap:10px; font-size:0.9rem; transition:all 0.15s; text-align:left;"\n                onmouseenter="this.style.background='rgba(78,204,163,0.3)'"\n                onmouseleave="this.style.background='transparent'">\n                <span style="font-size:1.1rem;">💵</span> Send Tip\n              </button>\n              <div style="border-top:1px solid var(--border);"></div>\n              \x3c!-- Request Image --\x3e\n              <button \n                onclick="event.stopPropagation(); closePostActionsMenu(); openRequestImageModal('${e.authorId}', false)"\n                style="width:100%; padding:12px 16px; background:transparent; border:none; color:var(--l-ink); cursor:pointer; display:flex; align-items:center; gap:10px; font-size:0.9rem; transition:all 0.15s; text-align:left;"\n                onmouseenter="this.style.background='rgba(0,212,255,0.2)'"\n                onmouseleave="this.style.background='transparent'">\n                <span style="font-size:1.1rem;">📸</span> Request Image\n              </button>\n              \x3c!-- Open Chat --\x3e\n              <button \n                onclick="event.stopPropagation(); closePostActionsMenu(); openUnifiedProfile('${e.authorId}', 'chat')"\n                style="width:100%; padding:12px 16px; background:transparent; border:none; color:var(--l-ink); cursor:pointer; display:flex; align-items:center; gap:10px; font-size:0.9rem; transition:all 0.15s; text-align:left;"\n                onmouseenter="this.style.background='rgba(102,126,234,0.2)'"\n                onmouseleave="this.style.background='transparent'">\n                <span style="font-size:1.1rem;">💬</span> Open Chat\n              </button>\n            </div>\n          </div>\n        `}\n      </div>\n    `),
        t
    );
}
function openPostModal(e) {
    console.log(`[PostModal] Opening modal for post ${e}`);
    const t = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!t) return void console.error(`[PostModal] Post ${e} not found!`);
    (postModalState.activePostId = e),
        (postModalState.lastCommentCount = t.comments.length),
        Array.isArray(t.likes) || (t.likes = []),
        Array.isArray(t.comments) || (t.comments = []),
        (postModalState.lastLikeCount = t.likes.length),
        console.log(`[PostModal] Initial state - Comments: ${t.comments.length}, Likes: ${t.likes.length}`);
    const n = t.isPlayerPost
            ? { name: "You", profileImage: null, employmentStatus: "active", id: "player" }
            : gameState.employees.find((e) => e.id === t.authorId) || {
                  name: t.authorName,
                  profileImage: null,
                  employmentStatus: "unknown",
                  id: t.authorId,
              },
        a = n.profileImage || placeholderImage(50, 50, (n.name?.[0] || "?")),
        o = "alumni" === n.employmentStatus,
        i = formatTimeAgo(t.timestamp),
        s = t.likes.includes("player"),
        r = document.createElement("div");
    (r.id = "postModal"),
        (r.style.background = "var(--l-veil-85)"),
        (r.style.padding = "10px"),
        (r.style.overflow = "auto");
    const l = window.innerWidth <= 768;
    (r.innerHTML = `\n      <div style="background:var(--surface); border:1px solid var(--border); border-radius:${l ? "16px" : "20px"}; max-width:${l ? "100%" : "700px"}; width:100%; max-height:${l ? "95vh" : "90vh"}; height:auto; overflow:hidden; box-shadow:0 8px 32px var(--l-veil-50); display:flex; flex-direction:column; margin:auto;">\n        \x3c!-- Modal Header --\x3e\n        <div style="padding:${l ? "12px 16px" : "16px 20px"}; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">\n          <h3 style="color:var(--l-ink); margin:0; font-size:${l ? "1rem" : "1.1rem"}; font-weight:600;">Post</h3>\n          <div style="display:flex; gap:8px; align-items:center;">\n            ${t.isPlayerPost ? `\n              <button onclick="editPost('${t.id}')" style="background:var(--l-panel-alt-2); border:1px solid var(--accent); color:var(--accent); cursor:pointer; font-size:0.85rem; padding:8px 14px; border-radius:8px; transition:all 0.2s; font-weight:600; display:flex; align-items:center; gap:6px;" onmouseenter="this.style.background='var(--l-cyan)'; this.style.color='var(--l-ink)'" onmouseleave="this.style.background='var(--l-panel-alt-2)'; this.style.color='var(--l-cyan)'">\n                <span>✏️</span> ${l ? "" : "Edit"}\n              </button>\n            ` : `\n              <button onclick="regeneratePost('${t.id}')" style="background:var(--l-panel-alt-2); border:1px solid var(--accent); color:var(--accent); cursor:pointer; font-size:0.85rem; padding:8px 14px; border-radius:8px; transition:all 0.2s; font-weight:600; display:flex; align-items:center; gap:6px;" onmouseenter="this.style.background='var(--l-cyan)'; this.style.color='var(--l-ink)'" onmouseleave="this.style.background='var(--l-panel-alt-2)'; this.style.color='var(--l-cyan)'">\n                <span>🔄</span> ${l ? "" : "Regenerate"}\n              </button>\n            `}\n            <button onclick="deletePost('${t.id}')" style="background:var(--l-panel-alt-2); border:1px solid var(--danger); color:var(--danger); cursor:pointer; font-size:0.85rem; padding:8px 14px; border-radius:8px; transition:all 0.2s; font-weight:600; display:flex; align-items:center; gap:6px;" onmouseenter="this.style.background='var(--l-red)'; this.style.color='var(--l-ink)'" onmouseleave="this.style.background='var(--l-panel-alt-2)'; this.style.color='var(--l-red)'">\n              <span>🗑️</span> ${l ? "" : "Delete"}\n            </button>\n            <button onclick="closePostModal()" style="background:transparent; border:none; color:var(--text-dim); cursor:pointer; font-size:1.5rem; padding:4px 10px; border-radius:50%; transition:all 0.2s; min-width:40px; min-height:40px; display:flex; align-items:center; justify-content:center;" onmouseenter="this.style.background='var(--l-sheen-10)'; this.style.color='var(--l-ink)'" onmouseleave="this.style.background='transparent'; this.style.color='var(--text-dim)'">×</button>\n          </div>\n        </div>\n        \n        \x3c!-- Post Content (Scrollable with comments) --\x3e\n        <div style="flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch;">\n          <div style="padding:${l ? "16px" : "20px"}; border-bottom:1px solid var(--border);">\n            \x3c!-- Post Header --\x3e\n          <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;">\n            <img src="${a}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid ${o ? "var(--border-strong)" : t.isPlayerPost ? "var(--danger)" : "var(--accent)"}; flex-shrink:0; cursor:${t.isPlayerPost ? "default" : "pointer"};" ${t.isPlayerPost ? "" : `onclick="closePostModal(); openUnifiedProfile('${t.authorId}', 'overview')"`}>\n            <div style="flex:1; min-width:0;">\n              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">\n                <strong style="font-size:0.95rem; font-weight:600; cursor:${t.isPlayerPost ? "default" : "pointer"}; transition:opacity 0.2s;" ${t.isPlayerPost ? "" : `onclick="closePostModal(); openUnifiedProfile('${t.authorId}', 'overview')" onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'"`}>${t.isPlayerPost ? '<span style="color:var(--l-ink);">You</span>' : getColoredName(n)}</strong>\n                ${t.isPlayerPost ? '<span style="color:var(--danger); font-size:0.85rem; font-weight:600;">@TheBoss</span>' : n.social?.username ? `<span style="color:var(--text-dim); font-size:0.85rem;">@${n.social.username}</span>` : ""}\n                ${o ? '<span style="background:var(--l-neutral-5); padding:3px 10px; border-radius:12px; font-size:0.7rem; color:var(--l-ink-dim);">Alumni</span>' : ""}\n                ${t.explicitLevel >= 1 ? '<span style="background:linear-gradient(135deg, var(--l-red), #d63850); padding:3px 10px; border-radius:12px; font-size:0.7rem; color:var(--l-ink-on-fill); font-weight:600;">🔞</span>' : ""}\n              </div>\n              <div style="color:var(--text-dim); font-size:0.8rem; margin-top:2px;">${i}</div>\n            </div>\n          </div>\n          \n          ${t.explicitLevel >= 3 ? '\n            <div style="background:rgba(233, 69, 96, 0.15); padding:10px 14px; border-radius:8px; border-left:4px solid var(--danger); margin-bottom:14px; font-size:0.85rem; color:var(--l-x-red-pale-2);">\n              <strong style="display:flex; align-items:center; gap:6px;"><span>🔞</span> Explicit Content Warning</strong>\n              <div style="margin-top:4px; opacity:0.9;">This post contains adult content</div>\n            </div>\n          ' : ""}\n          \n          \x3c!-- Post Text --\x3e\n          <div style="color:var(--text); line-height:1.6; margin-bottom:14px; font-size:0.95rem; word-wrap:break-word;">\n            ${linkifyMentions(t.content)}\n          </div>\n          \n          \x3c!-- Post Image --\x3e\n          ${t.imageUrl ? `\n            <div style="margin-bottom:14px; border-radius:12px; overflow:hidden; border:1px solid var(--border); position:relative;"\n                 onmouseenter="\n                   const btn = this.querySelector('.modal-regen-btn');\n                   if(btn && !btn.disabled) btn.style.opacity='1';\n                 "\n                 onmouseleave="\n                   const btn = this.querySelector('.modal-regen-btn');\n                   if(btn && !btn.disabled) btn.style.opacity='0.9';\n                 ">\n              <img src="${t.imageUrl}" style="width:100%; height:auto; display:block; cursor:pointer;" onclick="openImageViewer('${t.imageUrl}')">\n              ${t.imagePrompt ? `\n                <button onclick="\n                          event.stopPropagation(); \n                          regeneratePostImage('${t.id}')\n                        " \n                        class="modal-regen-btn"\n                        data-regen-post-id="${t.id}"\n                        style="position:absolute !important; top:12px !important; right:12px !important; background:var(--l-veil-80) !important; backdrop-filter:blur(10px); border:1px solid var(--l-sheen-30) !important; color:var(--l-ink) !important; padding:10px 16px !important; border-radius:8px !important; cursor:pointer !important; font-size:0.9rem !important; font-weight:600 !important; display:flex !important; align-items:center !important; gap:8px !important; transition:all 0.2s !important; opacity:0.9 !important; z-index:10 !important; box-shadow:0 4px 12px var(--l-veil-50) !important; pointer-events:auto !important;"\n                        onmouseenter="\n                          if(!this.disabled) {\n                            this.style.opacity='1'; \n                            this.style.background='var(--l-veil-95)'; \n                            this.style.transform='scale(1.05)';\n                          }\n                        "\n                        onmouseleave="\n                          if(!this.disabled) {\n                            this.style.opacity='0.9'; \n                            this.style.background='var(--l-veil-80)'; \n                            this.style.transform='scale(1)';\n                          }\n                        ">\n                  🔄 Regenerate\n                </button>\n              ` : ""}\n            </div>\n          ` : ""}\n          \n          \x3c!-- Poll (if applicable) --\x3e\n          ${t.poll ? renderPollHTML(t, !0) : ""}\n          \n          \x3c!-- Post Actions --\x3e\n          <div style="display:flex; gap:20px; padding-top:10px; border-top:1px solid var(--border); align-items:center;">\n            \x3c!-- Reddit-style Vote Widget --\x3e\n            ${t.isPlayerPost ? `\n              \x3c!-- Player's own posts show NPC likes only --\x3e\n              <button id="modalLikeBtn" onclick="handleLikePost('${t.id}')" style="background:transparent; border:none; color:${s ? "var(--l-red)" : "var(--text-dim)"}; cursor:pointer; display:flex; align-items:center; gap:6px; font-size:0.9rem; padding:8px 12px; border-radius:8px; transition:all 0.2s;" onmouseenter="this.style.background='var(--l-sheen-05)'" onmouseleave="this.style.background='transparent'">\n                <span id="modalLikeIcon" style="font-size:1.1rem;">${s ? "❤️" : "🤍"}</span>\n                <span id="modalLikeCount">${t.likes.length}</span>\n              </button>\n            ` : `\n              <div style="display:flex; align-items:center; gap:4px; background:var(--bg); border-radius:20px; padding:4px 6px;">\n                \x3c!-- Upvote Arrow --\x3e\n                <button onclick="voteOnPost('${t.id}', 'up')" \n                        style="background:${"up" === t.playerVote ? "rgba(255, 69, 0, 0.25)" : "transparent"}; border:${"up" === t.playerVote ? "1px solid var(--l-orange-red)" : "1px solid transparent"}; padding:4px 6px; border-radius:8px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;"\n                        onmouseenter="this.style.transform='scale(1.15)'"\n                        onmouseleave="this.style.transform='scale(1)'">\n                  <svg width="22" height="22" viewBox="0 0 24 24" fill="${"up" === t.playerVote ? "var(--l-orange-red)" : "var(--text-dim)"}">\n                    <path d="M12 4l8 8h-6v8h-4v-8H4z"/>\n                  </svg>\n                </button>\n                \n                \x3c!-- Vote Count --\x3e\n                <span id="modalVoteCount" style="font-size:0.9rem; font-weight:700; color:${"up" === t.playerVote ? "var(--l-orange-red)" : "down" === t.playerVote ? "var(--l-indigo-lt)" : "var(--text-dim)"}; min-width:28px; text-align:center;">\n                  ${(t.upvotes || 0) - (t.downvotes || 0) + (t.likes.length || 0)}\n                </span>\n                \n                \x3c!-- Downvote Arrow --\x3e\n                <button onclick="voteOnPost('${t.id}', 'down')" \n                        style="background:${"down" === t.playerVote ? "rgba(113, 147, 255, 0.25)" : "transparent"}; border:${"down" === t.playerVote ? "1px solid var(--l-indigo-lt)" : "1px solid transparent"}; padding:4px 6px; border-radius:8px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;"\n                        onmouseenter="this.style.transform='scale(1.15)'"\n                        onmouseleave="this.style.transform='scale(1)'">\n                  <svg width="22" height="22" viewBox="0 0 24 24" fill="${"down" === t.playerVote ? "var(--l-indigo-lt)" : "var(--text-dim)"}">\n                    <path d="M12 20l-8-8h6V4h4v8h6z"/>\n                  </svg>\n                </button>\n              </div>\n            `}\n            \n            \x3c!-- Comments Count --\x3e\n            <div style="color:var(--text-dim); display:flex; align-items:center; gap:6px; font-size:0.9rem; padding:8px 12px;">\n              <span style="font-size:1.1rem;">💬</span>\n              <span id="modalCommentCount">${t.comments.length}</span>\n            </div>\n          </div>\n        </div>\n        \n        \x3c!-- Comments Section (Inside scrollable area) --\x3e\n        <div id="modalCommentsContainer" style="padding:${l ? "16px" : "20px"}; padding-top:0;">\n          \x3c!-- Comments will be rendered here --\x3e\n        </div>\n        </div>\n        \n        \x3c!-- Comment Input (Fixed at bottom) --\x3e\n        <div style="padding:${l ? "12px 16px" : "16px 20px"}; border-top:1px solid var(--border); background:var(--bg); flex-shrink:0; position:relative;">\n          \x3c!-- @Mention Autocomplete Dropdown --\x3e\n          <div id="modalMentionSuggestions" style="position:absolute; bottom:100%; left:${l ? "16px" : "20px"}; right:${l ? "16px" : "20px"}; background:var(--surface); border:1px solid var(--border); border-radius:12px; max-height:280px; overflow-y:auto; display:none; z-index:10000; box-shadow:0 -4px 12px var(--l-veil-50); margin-bottom:8px;">\n            \x3c!-- Suggestions will be populated here --\x3e\n          </div>\n          \n          <div style="display:flex; gap:10px; align-items:start;">\n            <textarea id="modalCommentInput" placeholder="Write a comment..." style="flex:1; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:12px; color:var(--text); font-size:${l ? "16px" : "0.9rem"}; resize:none; min-height:${l ? "44px" : "40px"}; max-height:120px; font-family:inherit;" rows="1"></textarea>\n            <button onclick="submitModalComment('${t.id}')" style="background:linear-gradient(135deg, var(--l-cyan), var(--l-cyan-dark)); border:none; color:var(--l-on-accent); padding:${l ? "12px 20px" : "12px 24px"}; border-radius:12px; cursor:pointer; font-weight:600; font-size:0.9rem; transition:all 0.3s; box-shadow:0 2px 8px rgba(0,212,255,0.3); min-height:${l ? "44px" : "auto"};" onmouseenter="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,212,255,0.4)'" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,212,255,0.3)'">\n              ${l ? "📤" : "Send"}\n            </button>\n          </div>\n        </div>\n      </div>\n    `),
        ModalManager.show(r, "postModal"),
        r.addEventListener("click", (e) => {
            e.target === r && closePostModal();
        }),
        renderModalComments(t.id);
    const c = $("modalCommentInput");
    c &&
        (c.addEventListener("input", function () {
            (this.style.height = "auto"), (this.style.height = this.scrollHeight + "px");
        }),
        setupMentionAutocomplete(c, "modalMentionSuggestions")),
        startPostModalLiveUpdates();
}
function closePostModal() {
    stopPostModalLiveUpdates(), ModalManager.close("postModal");
}
function startPostModalLiveUpdates() {
    postModalState.updateInterval &&
        (clearInterval(postModalState.updateInterval), (postModalState.updateInterval = null)),
        console.log(`[PostModal] Setting up live updates for post ${postModalState.activePostId}...`),
        (postModalState.updateInterval = setInterval(() => {
            updatePostModalContent();
        }, 500)),
        console.log(`[PostModal] ✅ Live updates started - interval ID: ${postModalState.updateInterval}`);
}
function stopPostModalLiveUpdates() {
    postModalState.updateInterval &&
        (clearInterval(postModalState.updateInterval),
        (postModalState.updateInterval = null),
        console.log("[PostModal] Stopped live updates")),
        (postModalState.activePostId = null),
        (postModalState.lastCommentCount = 0),
        (postModalState.lastLikeCount = 0);
}
function updatePostModalContent() {
    if (!ModalManager.isOpen("postModal"))
        return console.log("[PostModal Live] Modal not open, stopping updates"), void stopPostModalLiveUpdates();
    if (!postModalState.activePostId)
        return console.log("[PostModal Live] No active post ID, stopping updates"), void stopPostModalLiveUpdates();
    const e = postModalState.activePostId,
        t = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!t) return console.log("[PostModal Live] Post deleted, closing modal"), void closePostModal();
    const n = $("modalVoteCount"),
        a = document.getElementById("postModal");
    if (n && a && !t.isPlayerPost) {
        const e = a.querySelector('[onclick*="voteOnPost"][onclick*="up"]'),
            o = a.querySelector('[onclick*="voteOnPost"][onclick*="down"]'),
            i = (t.upvotes || 0) - (t.downvotes || 0) + (t.likes.length || 0);
        if (
            ((n.textContent = i),
            "up" === t.playerVote
                ? (n.style.color = "var(--l-orange-red)")
                : "down" === t.playerVote
                  ? (n.style.color = "var(--l-indigo-lt)")
                  : (n.style.color = "var(--text-dim)"),
            e)
        ) {
            const n = e.querySelector("svg");
            "up" === t.playerVote
                ? ((e.style.background = "rgba(255, 69, 0, 0.25)"),
                  (e.style.border = "1px solid var(--l-orange-red)"),
                  n && n.setAttribute("fill", "#ff4500"))
                : ((e.style.background = "transparent"),
                  (e.style.border = "1px solid transparent"),
                  n && n.setAttribute("fill", "var(--text-dim)"));
        }
        if (o) {
            const e = o.querySelector("svg");
            "down" === t.playerVote
                ? ((o.style.background = "rgba(113, 147, 255, 0.25)"),
                  (o.style.border = "1px solid var(--l-indigo-lt)"),
                  e && e.setAttribute("fill", "#7193ff"))
                : ((o.style.background = "transparent"),
                  (o.style.border = "1px solid transparent"),
                  e && e.setAttribute("fill", "var(--text-dim)"));
        }
    }
    const o = $("modalLikeCount"),
        i = $("modalLikeIcon"),
        s = $("modalLikeBtn");
    if (
        (o &&
            t.likes.length !== postModalState.lastLikeCount &&
            ((o.style.transition = "all 0.3s ease"),
            (o.style.transform = "scale(1.3)"),
            (o.textContent = t.likes.length),
            setTimeout(() => {
                o.style.transform = "scale(1)";
            }, 300),
            (postModalState.lastLikeCount = t.likes.length)),
        i && s)
    ) {
        const e = t.likes.includes("player");
        (i.textContent = e ? "❤️" : "🤍"), (s.style.color = e ? "var(--l-red)" : "var(--text-dim)");
    }
    const r = $("modalCommentCount");
    if (r && t.comments.length !== postModalState.lastCommentCount) {
        if (
            ((r.style.transition = "all 0.3s ease"),
            (r.style.transform = "scale(1.3)"),
            (r.textContent = t.comments.length),
            setTimeout(() => {
                r.style.transform = "scale(1)";
            }, 300),
            t.comments.length > postModalState.lastCommentCount)
        ) {
            const t = $("modalCommentsContainer"),
                n = t && t.scrollHeight - t.scrollTop <= t.clientHeight + 100;
            renderModalComments(e, !0),
                n &&
                    t &&
                    setTimeout(() => {
                        t.scrollTop = t.scrollHeight;
                    }, 50);
        }
        postModalState.lastCommentCount = t.comments.length;
    }
}
function renderModalComments(e, t = !1) {
    const n = $("modalCommentsContainer");
    if (!n) return;
    const a = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!a) return;
    if (0 === a.comments.length)
        return void (n.innerHTML =
            '\n        <div style="text-align:center; padding:40px 20px; color:var(--text-dim);">\n          <div style="font-size:2rem; margin-bottom:10px;">💬</div>\n          <div style="font-size:0.9rem;">No comments yet</div>\n          <div style="font-size:0.8rem; margin-top:4px; opacity:0.7;">Be the first to comment!</div>\n        </div>\n      ');
    const o = {};
    a.comments.forEach((e) => {
        o[e.id] = e;
    });
    const i = [],
        s = {},
        rootOf = (e) => {
            let t = e,
                n = 0;
            for (; t.replyToCommentId && o[t.replyToCommentId] && n++ < 25; ) t = o[t.replyToCommentId];
            return t;
        };
    a.comments.forEach((e) => {
        if (e.replyToCommentId && o[e.replyToCommentId]) {
            const t = rootOf(e);
            s[t.id] || (s[t.id] = []), s[t.id].push(e);
        } else i.push(e);
    });
    const r = detectCommentWar(a.comments);
    if (t) {
        const existingIds = Array.from(n.querySelectorAll("[data-comment-id]")).map((e) => e.dataset.commentId);
        0 === existingIds.length && a.comments.length > 0 && (n.innerHTML = "");
        const queue = [];
        i.forEach((e) => {
            queue.push({ comment: e, isReply: !1, parentComment: null, rootComment: e }),
                (s[e.id] || []).forEach((t) =>
                    queue.push({
                        comment: t,
                        isReply: !0,
                        parentComment: o[t.replyToCommentId] || e,
                        rootComment: e,
                    })
                );
        }),
            queue.forEach(({ comment: t, isReply: a, parentComment: i, rootComment: l }) => {
                if (!existingIds.includes(t.id)) {
                    const r = createModalCommentElement(t, e, a, i);
                    (r.dataset.commentId = t.id),
                        (r.style.opacity = "0"),
                        (r.style.transform = "translateY(-10px)"),
                        (r.style.transition = "all 0.3s ease");
                    if (a && l) {
                        const e = [l.id, ...(s[l.id] || []).map((e) => e.id)]
                            .map((e) => n.querySelector(`[data-comment-id="${e}"]`))
                            .filter(Boolean);
                        e.length > 0 ? e[e.length - 1].insertAdjacentElement("afterend", r) : n.appendChild(r);
                    } else n.appendChild(r);
                    setTimeout(() => {
                        (r.style.opacity = "1"), (r.style.transform = "translateY(0)");
                    }, 50);
                }
            });
    } else {
        if (((n.innerHTML = ""), r)) {
            const e = document.createElement("div");
            (e.style.cssText =
                "text-align:center; padding:8px; margin-bottom:10px; background:rgba(233,69,96,0.1); border:1px solid rgba(233,69,96,0.3); border-radius:8px;"),
                (e.innerHTML =
                    '<span class="comment-war-badge">🍿 Comment War!</span> <span style="color:var(--text-dim); font-size:0.8rem;">Things are getting spicy in here</span>'),
                n.appendChild(e);
        }
        i.forEach((t) => {
            const a = createModalCommentElement(t, e, !1, null);
            (a.dataset.commentId = t.id), n.appendChild(a);
            (s[t.id] || []).forEach((a) => {
                const i = createModalCommentElement(a, e, !0, o[a.replyToCommentId] || t);
                (i.dataset.commentId = a.id), n.appendChild(i);
            });
        });
    }
}
function detectCommentWar(e) {
    const t = {};
    for (const n of e) {
        if (!n.replyToCommentId) continue;
        const a = e.find((e) => e.id === n.replyToCommentId);
        if (!a) continue;
        const o = [n.authorId, a.authorId].sort().join("|");
        t[o] = (t[o] || 0) + 1;
    }
    return Object.values(t).some((e) => e >= 3);
}
function createModalCommentElement(e, t, n = !1, a = null) {
    const o = document.createElement("div"),
        i = window.innerWidth <= 768;
    n
        ? ((o.className = "comment-thread-reply"),
          (o.style.cssText = `background:var(--surface-2); border:1px solid var(--border); border-radius:12px; padding:${i ? "10px" : "14px"}; margin-bottom:10px; margin-left:${i ? "24px" : "36px"}; border-left:2px solid var(--border);`))
        : (o.style.cssText = `background:var(--surface-2); border:1px solid var(--border); border-radius:12px; padding:${i ? "10px" : "14px"}; margin-bottom:10px;`);
    const s = e.isPlayerComment
            ? { name: "You", profileImage: null, employmentStatus: "active" }
            : gameState.employees.find((t) => t.id === e.authorId) || {
                  name: e.authorName,
                  profileImage: null,
                  employmentStatus: "unknown",
              },
        r = s.profileImage || placeholderImage(40, 40, (s.name?.[0] || "?")),
        l = "alumni" === s.employmentStatus,
        c = formatTimeAgo(e.timestamp),
        d = a
            ? a.isPlayerComment
                ? "You"
                : gameState.employees.find((e) => e.id === a.authorId)?.name || a.authorName || "someone"
            : null,
        p =
            n && d
                ? `<div class="comment-reply-label">Replying to <strong style="color:var(--l-indigo);">${d}</strong></div>`
                : "";
    return (
        (o.innerHTML = `\n      ${p}\n      <div style="display:flex; gap:${i ? "8px" : "10px"};">\n        <img src="${r}" style="width:${i ? "28px" : "32px"}; height:${i ? "28px" : "32px"}; border-radius:50%; object-fit:cover; border:2px solid ${l ? "var(--l-neutral-6)" : e.isPlayerComment ? "var(--l-red)" : "var(--l-cyan)"}; flex-shrink:0;">\n        <div style="flex:1; min-width:0;">\n          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">\n            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">\n              <strong style="font-size:${i ? "0.8rem" : "0.85rem"}; font-weight:600;">${e.isPlayerComment ? '<span style="color:var(--l-ink);">You</span>' : getColoredName(s)}</strong>\n              ${e.isPlayerComment ? `<span style="color:var(--danger); font-size:${i ? "0.7rem" : "0.75rem"}; font-weight:600;">@TheBoss</span>` : s.social?.username ? `<span style="color:var(--text-dim); font-size:${i ? "0.7rem" : "0.75rem"};">@${s.social.username}</span>` : ""}\n              ${l ? `<span style="background:var(--l-neutral-5); padding:2px 8px; border-radius:10px; font-size:${i ? "0.6rem" : "0.65rem"}; color:var(--l-ink-dim);">Alumni</span>` : ""}\n              <span style="color:var(--text-dim); font-size:${i ? "0.7rem" : "0.75rem"};">${c}</span>\n            </div>\n            ${e.isPlayerComment ? "" : `\n              <button onclick="replyToComment(this.dataset.cid,this.dataset.cname,this.dataset.uname)" data-cid="${e.id}" data-cname="${s.name.replace(/"/g, "&quot;")}" data-uname="${(s.social?.username || "").replace(/"/g, "&quot;")}" style="background:transparent; border:1px solid var(--border); color:var(--text-dim); padding:4px 10px; border-radius:6px; font-size:${i ? "0.7rem" : "0.75rem"}; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='rgba(0,212,255,0.1)'; this.style.borderColor='var(--l-cyan)'; this.style.color='var(--l-cyan)'" onmouseleave="this.style.background='transparent'; this.style.borderColor='var(--l-slate-2)'; this.style.color='var(--text-dim)'">\n                Reply\n              </button>\n            `}\n          </div>\n          <div style="color:var(--text); line-height:1.5; font-size:${i ? "0.85rem" : "0.9rem"}; word-wrap:break-word; overflow-wrap:break-word; margin-bottom:${e.isPlayerComment ? "0" : "6px"};">\n            ${linkifyMentions(e.content, e.authorId, e.dmSent, e.dmMessageTimestamp)}\n          </div>\n          ${e.imageUrl ? `\n            <div style="margin:8px 0; position:relative; display:inline-block;">\n              <img src="${e.imageUrl}" alt="${e.imageAlt || "Comment image"}" style="max-width:100%; max-height:400px; border-radius:12px; cursor:pointer; display:block; border:1px solid var(--border);" onclick="openImageViewer('${e.imageUrl}')">\n              ${e.imagePrompt ? `\n                <button onclick="event.stopPropagation(); regenerateCommentImage('${t}', '${e.id}')"\n                        data-regen-comment-id="${e.id}"\n                        style="position:absolute; top:8px; right:8px; background:var(--l-veil-75); backdrop-filter:blur(8px); border:1px solid var(--l-sheen-20); color:var(--l-ink); padding:6px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:600; display:flex; align-items:center; gap:4px; transition:all 0.2s; opacity:0.8;"\n                        onmouseenter="if(!this.disabled) { this.style.opacity='1'; this.style.background='var(--l-veil-90)'; this.style.transform='scale(1.05)'; }"\n                        onmouseleave="if(!this.disabled) { this.style.opacity='0.8'; this.style.background='var(--l-veil-75)'; this.style.transform='scale(1)'; }">\n                  🔄\n                </button>\n              ` : ""}\n            </div>\n          ` : ""}\n          ${e.isPlayerComment ? "" : `\n            <div style="display:flex; align-items:center; gap:3px; background:var(--bg); border-radius:12px; padding:2px 4px; width:fit-content;">\n              \x3c!-- Upvote Arrow --\x3e\n              <button onclick="voteOnComment('${e.id}', 'up')" \n                      style="background:${"up" === e.playerVote ? "rgba(255, 69, 0, 0.25)" : "transparent"}; border:${"up" === e.playerVote ? "1px solid var(--l-orange-red)" : "1px solid transparent"}; padding:3px 5px; border-radius:6px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;"\n                      onmouseenter="this.style.transform='scale(1.15)'"\n                      onmouseleave="this.style.transform='scale(1)'">\n                <svg width="18" height="18" viewBox="0 0 24 24" fill="${"up" === e.playerVote ? "var(--l-orange-red)" : "var(--text-dim)"}">\n                  <path d="M12 4l8 8h-6v8h-4v-8H4z"/>\n                </svg>\n              </button>\n              \n              \x3c!-- Vote Count --\x3e\n              <span style="font-size:0.8rem; font-weight:700; color:${"up" === e.playerVote ? "var(--l-orange-red)" : "down" === e.playerVote ? "var(--l-indigo-lt)" : "var(--text-dim)"}; min-width:20px; text-align:center;">\n                ${(e.upvotes || 0) - (e.downvotes || 0)}\n              </span>\n              \n              \x3c!-- Downvote Arrow --\x3e\n              <button onclick="voteOnComment('${e.id}', 'down')" \n                      style="background:${"down" === e.playerVote ? "rgba(113, 147, 255, 0.25)" : "transparent"}; border:${"down" === e.playerVote ? "1px solid var(--l-indigo-lt)" : "1px solid transparent"}; padding:3px 5px; border-radius:6px; cursor:pointer; display:flex; align-items:center; transition:all 0.2s;"\n                      onmouseenter="this.style.transform='scale(1.15)'"\n                      onmouseleave="this.style.transform='scale(1)'">\n                <svg width="18" height="18" viewBox="0 0 24 24" fill="${"down" === e.playerVote ? "var(--l-indigo-lt)" : "var(--text-dim)"}">\n                  <path d="M12 20l-8-8h6V4h4v8h6z"/>\n                </svg>\n              </button>\n            </div>\n          `}\n        </div>\n      </div>\n    `),
        o
    );
}
function submitModalComment(e) {
    const t = $("modalCommentInput");
    if (!t) return;
    const n = t.value.trim();
    if (!n) return;
    const a = t.dataset.replyToCommentId || null;
    addCommentToPost(e, n, a), cancelReply(), (t.value = ""), (t.style.height = "auto"), renderModalComments(e);
    const o = $("modalCommentCount"),
        i = gameState.socialNetwork.posts.find((t) => t.id === e);
    o && i && ((o.textContent = i.comments.length), (postModalState.lastCommentCount = i.comments.length)),
        renderSocialFeed();
}
function replyToComment(e, t, n) {
    const a = $("modalCommentInput");
    if (!a) return;
    a.dataset.replyToCommentId = e;
    let o = $("modalReplyIndicator");
    if (!o) {
        (o = document.createElement("div")),
            (o.id = "modalReplyIndicator"),
            (o.style.cssText =
                "padding:6px 12px; background:rgba(102,126,234,0.15); border-left:3px solid var(--l-indigo); border-radius:0 6px 6px 0; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; font-size:0.8rem;");
        const e = a.parentNode;
        e.parentNode.insertBefore(o, e);
    }
    (o.innerHTML = `\n      <span style="color:var(--l-indigo);">↳ Replying to <strong>${t}</strong></span>\n      <button onclick="cancelReply()" style="background:transparent; border:none; color:var(--text-dim); cursor:pointer; font-size:0.9rem; padding:2px 6px;">✕</button>\n    `),
        (o.style.display = "flex");
    const i = n ? `@${n} ` : `@${t.replace(/\s+/g, "_")} `;
    a.value.trim() ? (a.value = i + a.value) : (a.value = i),
        a.focus(),
        a.setSelectionRange(a.value.length, a.value.length),
        (a.style.height = "auto"),
        (a.style.height = a.scrollHeight + "px");
}
function cancelReply() {
    const e = $("modalCommentInput");
    e && delete e.dataset.replyToCommentId;
    const t = $("modalReplyIndicator");
    t && (t.style.display = "none");
}
function initSocialNotifications() {
    gameState.socialNetwork &&
        (gameState.socialNetwork.notifications ||
            ((gameState.socialNetwork.notifications = []),
            (gameState.socialNetwork.notifIdCounter = 0),
            (gameState.socialNetwork.lastNotifCheck = 0)));
}
function addSocialNotification({
    type: e,
    fromId: t,
    fromName: n,
    postId: a,
    commentId: o,
    preview: i,
    targetAuthorId: s,
}) {
    initSocialNotifications();
    if (!("player" === s || !s) && "mention" !== e && "viral" !== e) {
        const e = gameState.socialNetwork.posts.find((e) => e.id === a);
        if (!e?.isPlayerPost && "player" !== e?.authorId) return;
    }
    if (
        gameState.socialNetwork.notifications.find(
            (n) => n.type === e && n.fromId === t && n.postId === a && Date.now() - n.timestamp < 6e4
        )
    )
        return;
    const r = {
        id: "notif_" + ++gameState.socialNetwork.notifIdCounter,
        type: e,
        fromId: t,
        fromName: n,
        postId: a,
        commentId: o,
        preview: i?.substring(0, 80) || "",
        timestamp: Date.now(),
        read: !1,
    };
    gameState.socialNetwork.notifications.unshift(r),
        gameState.socialNetwork.notifications.length > 50 &&
            (gameState.socialNetwork.notifications = gameState.socialNetwork.notifications.slice(0, 50)),
        updateNotifBadge(),
        console.log(`[Notification] ${e}: ${n} - ${i?.substring(0, 40)}`);
}
function updateNotifBadge() {
    initSocialNotifications();
    const e = $("notifBadge");
    if (!e) return;
    const t = gameState.socialNetwork.notifications.filter((e) => !e.read).length;
    t > 0 ? ((e.textContent = t > 99 ? "99+" : t), (e.style.display = "flex")) : (e.style.display = "none"),
        updateDashboardNotifications();
}
function toggleNotificationPanel() {
    const e = $("socialNotifPanel");
    if (!e) return;
    const t = "none" !== e.style.display;
    (e.style.display = t ? "none" : "block"),
        t ||
            (renderNotificationList(),
            setTimeout(() => {
                gameState.socialNetwork.notifications.forEach((e) => (e.read = !0)), updateNotifBadge();
            }, 2e3));
}
function renderNotificationList() {
    initSocialNotifications();
    const e = $("notifList");
    if (!e) return;
    const t = gameState.socialNetwork.notifications;
    if (0 === t.length)
        return void (e.innerHTML =
            '<div style="text-align:center; padding:30px; color:var(--text-mute); font-style:italic;">No notifications yet</div>');
    const n = {
            like: "❤️",
            comment: "💬",
            mention: "📢",
            reply: "↩️",
            viral: "🔥",
            comment_war: "🍿",
            story: "📸",
            poll_vote: "📊",
        },
        a = {
            like: "liked your post",
            comment: "commented on your post",
            mention: "mentioned you",
            reply: "replied to a comment",
            viral: "Your post went viral!",
            comment_war: "Comment war on a post!",
            story: "posted a new story",
            poll_vote: "voted on your poll",
        };
    e.innerHTML = t
        .slice(0, 30)
        .map((e) => {
            const t = gameState.employees.find((t) => t.id === e.fromId),
                o = t?.profileImage || placeholderImage(36, 36, (e.fromName || "?")[0]),
                i = formatTimeAgo(e.timestamp);
            return `\n        <div class="notif-item ${e.read ? "" : "unread"}" onclick="handleNotifClick('${e.postId}', '${e.id}')">\n          <img src="${o}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; flex-shrink:0; border:1px solid var(--border);">\n          <div style="flex:1; min-width:0;">\n            <div class="notif-text">\n              <strong>${e.fromName || "Someone"}</strong> ${a[e.type] || "interacted with your post"}\n              ${e.preview ? `<div style="color:var(--text-dim); font-size:0.8rem; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">"${e.preview}"</div>` : ""}\n            </div>\n            <div class="notif-time">${i}</div>\n          </div>\n          <span class="notif-icon">${n[e.type] || "🔔"}</span>\n        </div>\n      `;
        })
        .join("");
}
function handleNotifClick(e, t) {
    const n = gameState.socialNetwork.notifications?.find((e) => e.id === t);
    n && (n.read = !0), updateNotifBadge();
    const a = $("socialNotifPanel");
    a && (a.style.display = "none"), e && openPostModal(e);
}
function clearAllNotifications() {
    gameState.socialNetwork?.notifications && (gameState.socialNetwork.notifications = []),
        updateNotifBadge(),
        renderNotificationList();
}
function updateDashboardNotifications() {
    const e = $("dashSocialMentions");
    if (!e) return;
    initSocialNotifications();
    const t = gameState.socialNetwork.notifications
        .filter((e) => ["mention", "like", "comment", "reply", "viral"].includes(e.type))
        .slice(0, 5);
    if (0 === t.length) {
        const t = (gameState.socialNetwork?.posts || [])
            .filter((e) => e.content && e.content.toLowerCase().includes("@theboss"))
            .sort((e, t) => t.timestamp - e.timestamp);
        return 0 === t.length
            ? void (e.innerHTML =
                  '<div style="text-align:center; color:var(--text-mute); padding:20px; font-style:italic;">No activity yet. Engage with employees!</div>')
            : void (e.innerHTML = t
                  .slice(0, 3)
                  .map((e) => {
                      const t = gameState.employees.find((t) => t.id === e.authorId);
                      if (!t) return "";
                      const n =
                              "function" == typeof getTimeAgo
                                  ? getTimeAgo(e.timestamp)
                                  : formatTimeAgo(e.timestamp),
                          a = e.content.substring(0, 100) + (e.content.length > 100 ? "..." : "");
                      return `\n          <div onclick="switchTab('social')" style="background:var(--surface-2); padding:12px; border-radius:8px; margin-bottom:10px; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='var(--l-panel-2)'" onmouseleave="this.style.background='var(--l-line)'">\n            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">\n              <div style="font-weight:600; color:var(--l-pink);">📢 ${t.name}</div>\n              <div style="font-size:0.75rem; color:var(--text-mute);">${n}</div>\n            </div>\n            <div style="color:var(--text-dim); font-size:0.85rem;">${a}</div>\n          </div>\n        `;
                  })
                  .filter((e) => e)
                  .join(""));
    }
    const n = { like: "❤️", comment: "💬", mention: "📢", reply: "↩️", viral: "🔥" };
    e.innerHTML = t
        .map((e) => {
            const t = "function" == typeof getTimeAgo ? getTimeAgo(e.timestamp) : formatTimeAgo(e.timestamp);
            return `\n        <div onclick="switchTab('social'); setTimeout(() => openPostModal('${e.postId}'), 300);" style="background:var(--surface-2); padding:12px; border-radius:8px; margin-bottom:10px; cursor:pointer; transition:all 0.2s;" onmouseenter="this.style.background='var(--l-panel-2)'" onmouseleave="this.style.background='var(--l-line)'">\n          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">\n            <div style="font-weight:600; color:var(--l-pink);">${n[e.type] || "🔔"} ${e.fromName}</div>\n            <div style="font-size:0.75rem; color:var(--text-mute);">${t}</div>\n          </div>\n          <div style="color:var(--text-dim); font-size:0.85rem;">${e.preview || "interacted with your post"}</div>\n        </div>\n      `;
        })
        .join("");
}
function initStories() {
    gameState.socialNetwork &&
        (gameState.socialNetwork.stories ||
            ((gameState.socialNetwork.stories = []),
            (gameState.socialNetwork.storyIdCounter = 0),
            (gameState.socialNetwork.lastStoryGen = 0)));
}
