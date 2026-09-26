// ============================================================================
// 41-social-utils — Social utils: like/comment/vote handlers, post/comment CRUD, image viewers, profile modal, mention helpers.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function calculateHotScore(e, t) {
    const n = Math.max(0, t - e.timestamp) / 36e5;
    return (
        ((e.upvotes || 0) - (e.downvotes || 0) + (e.likes?.length || 0) + 2 * (e.comments?.length || 0)) /
        Math.pow(n + 2, 1.5)
    );
}
function calculateControversialScore(e) {
    const t = (e.upvotes || 0) + (e.likes?.length || 0),
        n = e.downvotes || 0,
        a = e.comments?.length || 0;
    if (0 === t && 0 === n) return 0;
    return (t + n) * (t < n ? t / n : n / t) * (1 + 0.5 * a);
}
function getTimeFrameLimit(e, t) {
    switch (e) {
        case "hour":
            return t - 36e5;
        case "day":
            return t - 864e5;
        case "week":
            return t - 6048e5;
        case "month":
            return t - 2592e6;
        default:
            return 0;
    }
}
function linkifyMentions(e, t = null, n = !1, a = null) {
    if (!e) return "";
    let o = escapeHtml(e);
    if (
        ((o = o.replace(/@(\w+)/g, (e, t) => {
            if ("theboss" === t.toLowerCase())
                return '<span style="color:var(--danger); cursor:default; font-weight:700; text-shadow:0 0 8px rgba(233,69,96,0.4);">@TheBoss</span>';
            const n = gameState.employees.find((e) => e.social?.username === t);
            return n
                ? `<span style="color:var(--accent); cursor:pointer; font-weight:600; transition:color 0.2s;" onclick="showEmployeeProfile('${n.id}')" onmouseenter="this.style.color='var(--l-ink)'; this.style.textDecoration='underline'" onmouseleave="this.style.color='var(--l-cyan)'; this.style.textDecoration='none'">@${t}</span>`
                : `<span style="color:var(--accent);">@${t}</span>`;
        })),
        n && t && "player" !== t)
    ) {
        const e = gameState.employees.find((e) => e.id === t);
        if (e) {
            const n = a
                ? `window.openChatAndScrollTo && window.openChatAndScrollTo('${t}', ${a})`
                : `window.openChat && window.openChat('${t}')`;
            o = o.replace(
                /\b(check (your |my )?(DM|DMs|inbox|messages?)|sent.*(your )?way|DM('d|ing|ed)? you|in (your |my )?(inbox|DMs?|messages)|sliding? into|slid into)/gi,
                (t) =>
                    `<span style="color:var(--l-pink); cursor:pointer; text-decoration:underline; font-weight:500;" onclick="${n}" title="Open chat with ${e.name} - click to view the DM!">${t}</span>`
            );
        }
    }
    return o;
}
function createCommentHTML(e, t) {
    const n = gameState.employees.find((t) => t.id === e.authorId) || { name: e.authorName, profileImage: null },
        a = n.profileImage || placeholderImage(32, 32, (n.name?.[0] || "?")),
        o = formatTimeAgo(e.timestamp),
        i = "player" === e.authorId;
    let s = "";
    if (e.replyToCommentId && gameState.socialNetwork?.posts) {
        const t = gameState.socialNetwork.posts
            .flatMap((e) => e.comments || [])
            .find((t) => t.id === e.replyToCommentId);
        t &&
            (s = `<div style="color:var(--text-dim); font-size:0.82rem; margin-bottom:4px; display:flex; align-items:center; gap:4px;">\n          <span style="color:var(--l-x-grey);">↪</span> Replying to <strong style="color:var(--accent);">@${t.authorName}</strong>\n        </div>`);
    }
    return `\n      <div class="comment-item" data-comment-id="${e.id}" style="display:flex; gap:12px; margin-bottom:12px; padding:10px; background:var(--bg); border-radius:12px; border:1px solid var(--l-panel-alt-2);">\n        <img src="${a}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; flex-shrink:0; cursor:${i ? "default" : "pointer"};" ${i ? "" : `onclick="showEmployeeProfile('${e.authorId}')"`}>\n        <div style="flex:1; min-width:0;">\n          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;">\n            <div style="display:flex; align-items:center; gap:6px;">\n              <strong style="font-size:0.88rem; font-weight:600; cursor:${i ? "default" : "pointer"}; transition:opacity 0.2s;" ${i ? "" : `onclick="openUnifiedProfile('${e.authorId}', 'overview')" onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'"`}>${i ? '<span style="color:var(--accent);">You</span>' : getColoredName(n)}</strong>\n              ${i ? '<span style="color:var(--text-dim); font-size:0.75rem;">@TheBoss</span>' : n.social?.username ? `<span style="color:var(--text-dim); font-size:0.75rem;">@${n.social.username}</span>` : ""}\n            </div>\n            <span style="color:var(--l-x-grey); font-size:0.78rem; white-space:nowrap;">${o}</span>\n          </div>\n          ${s}\n          <p style="color:var(--text); margin:0 0 8px 0; font-size:0.9rem; line-height:1.5; word-wrap:break-word;">${linkifyMentions(e.content, e.authorId, e.dmSent, e.dmMessageTimestamp)}</p>\n          ${e.imageUrl ? `\n            <div style="margin:8px 0;">\n              <img src="${e.imageUrl}" alt="${e.imageAlt || "Comment image"}" style="max-width:100%; max-height:400px; border-radius:12px; cursor:pointer; display:block; border:1px solid var(--l-panel-alt-2);" onclick="openImageViewer('${e.imageUrl}')">\n            </div>\n          ` : ""}\n          <div style="display:flex; gap:12px; align-items:center;">\n            <button class="reply-to-comment-btn" data-post-id="${t}" data-comment-id="${e.id}" data-author-name="${e.authorName}" data-author-id="${e.authorId}" data-author-username="${i ? "TheBoss" : n.social?.username || ""}" style="background:transparent; border:none; color:var(--text-dim); font-size:0.82rem; cursor:pointer; padding:2px 8px; transition:color 0.2s;" onmouseenter="this.style.color='var(--l-cyan)'" onmouseleave="this.style.color='var(--text-dim)'">\n              ↪ Reply\n            </button>\n            ${i ? `\n              <button onclick="editComment('${t}', '${e.id}')" style="background:transparent; border:none; color:var(--text-dim); font-size:0.82rem; cursor:pointer; padding:2px 8px; transition:color 0.2s;" onmouseenter="this.style.color='var(--l-cyan)'" onmouseleave="this.style.color='var(--text-dim)'">\n                ✏️ Edit\n              </button>\n            ` : `\n              <button onclick="regenerateComment('${t}', '${e.id}')" style="background:transparent; border:none; color:var(--text-dim); font-size:0.82rem; cursor:pointer; padding:2px 8px; transition:color 0.2s;" onmouseenter="this.style.color='var(--l-cyan)'" onmouseleave="this.style.color='var(--text-dim)'">\n                🔄 Regenerate\n              </button>\n            `}\n            <button onclick="deleteComment('${t}', '${e.id}')" style="background:transparent; border:none; color:var(--danger); font-size:0.82rem; cursor:pointer; padding:2px 8px; transition:color 0.2s;" onmouseenter="this.style.color='var(--l-x-red)'" onmouseleave="this.style.color='var(--l-red)'">\n              🗑️ Delete\n            </button>\n          </div>\n        </div>\n      </div>\n    `;
}
function formatTimeAgo(e) {
    const a = (gameState && gameState.time && gameState.time.currentTime) || Date.now(),
        t = Math.floor((a - e) / 1e3);
    if (t < 0) return "Just now";
    return t < 60
        ? "Just now"
        : t < 3600
          ? Math.floor(t / 60) + "m ago"
          : t < 86400
            ? Math.floor(t / 3600) + "h ago"
            : t < 604800
              ? Math.floor(t / 86400) + "d ago"
              : t < 2592e3
                ? Math.floor(t / 604800) + "w ago"
                : Math.floor(t / 2592e3) + "mo ago";
}
function escapeHtml(e) {
    const t = document.createElement("div");
    return (t.textContent = e), t.innerHTML;
}
function jsAttr(e) {
    return String(null == e ? "" : e)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;")
        .replace(/\r?\n/g, " ");
}
function openImageViewer(e) {
    const t = document.createElement("div");
    (t.style.cssText =
        "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-95); z-index:999999; display:flex; justify-content:center; align-items:center; cursor:pointer;"),
        (t.innerHTML = `<img src="${e}" style="max-width:90%; max-height:90%; border-radius:10px;">`),
        (t.onclick = () => t.remove()),
        document.body.appendChild(t);
}
function showEmployeeProfile(e) {
    if (!e || "player" === e) return;
    const t = gameState.employees.find((t) => t.id === e);
    if (!t) return;
    const n = t.social,
        a = t.profileImage || placeholderImage(120, 120, t.name[0]),
        o = "alumni" === t.employmentStatus,
        i = gameState.socialNetwork.posts.filter((t) => t.authorId === e),
        s = gameState.socialNetwork.posts.filter(
            (e) => !!n.username && e.content && e.content.includes(`@${n.username}`)
        ),
        r = (n.relationships, i.length),
        l = i.reduce((e, t) => e + t.likes.length, 0),
        c = (i.reduce((e, t) => e + t.comments.length, 0), s.length),
        d = gameState.employees.filter((t) =>
            t.social?.relationships?.some((t) => t.employeeId === e && "unknown" !== t.relationshipType)
        ).length,
        p = (n.joinDate && new Date(n.joinDate).toLocaleDateString(), document.createElement("div"));
    (p.id = "profileModal"),
        (p.style.background = "var(--l-veil-85)"),
        (p.style.padding = "20px"),
        (p.style.overflow = "auto"),
        (p.innerHTML = `\n      <div style="background:var(--surface); border:1px solid var(--border); border-radius:20px; max-width:800px; width:100%; max-height:90vh; overflow:auto; box-shadow:0 8px 32px var(--l-veil-50);">\n        \x3c!-- Close button --\x3e\n        <div style="position:sticky; top:0; background:var(--surface); padding:16px 20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; z-index:10;">\n          <h3 style="color:var(--l-ink); margin:0; font-size:1.1rem; font-weight:600;">Profile</h3>\n          <button onclick="ModalManager.close('profileModal')" style="background:transparent; border:none; color:var(--text-dim); cursor:pointer; font-size:1.5rem; padding:4px 10px; border-radius:50%; transition:all 0.2s;" onmouseenter="this.style.background='var(--l-sheen-10)'; this.style.color='var(--l-ink)'" onmouseleave="this.style.background='transparent'; this.style.color='var(--text-dim)'">×</button>\n        </div>\n        \n        \x3c!-- Profile Header --\x3e\n        <div style="padding:24px 20px; border-bottom:1px solid var(--border);">\n          <div style="display:flex; gap:20px; align-items:start; margin-bottom:20px;">\n            <img src="${a}" style="width:100px; height:100px; border-radius:50%; border:3px solid ${o ? "var(--l-neutral-6)" : "var(--l-cyan)"}; object-fit:cover;">\n            <div style="flex:1;">\n              <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">\n                <h2 style="margin:0; font-size:1.5rem; font-weight:600;">${getColoredName(t)}</h2>\n                ${o ? '<span style="background:var(--l-neutral-5); padding:4px 12px; border-radius:14px; font-size:0.75rem; color:var(--l-ink-dim); font-weight:600;">Alumni</span>' : ""}\n              </div>\n              ${n.username ? `<div style="color:var(--text-dim); font-size:1rem; margin-bottom:12px;">@${n.username}</div>` : ""}\n              ${n.bio ? `<p style="color:var(--text); margin:0 0 12px 0; line-height:1.5;">${n.bio}</p>` : ""}\n              \n              \x3c!-- Career Info & Actions --\x3e\n              <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">\n                ${t.career ? `\n                  <div style="background:var(--surface-2); padding:6px 14px; border-radius:8px; border:1px solid var(--accent);">\n                    <span style="color:var(--accent); font-size:0.85rem; font-weight:600;">${t.career.title || "Employee"}</span>\n                    <span style="color:var(--text-dim); font-size:0.75rem; margin-left:6px;">• Level ${t.career.level || 1}</span>\n                  </div>\n                ` : ""}\n                ${
                o
                    ? ""
                    : (() => {
                          const n = "function" == typeof window.canPromoteEmployee && window.canPromoteEmployee(t);
                          return `\n                    <button \n                      id="profilePromoteBtn_${e}"\n                      data-employee-id="${e}"\n                      style="padding:8px 16px; background:${n ? "linear-gradient(135deg, var(--l-green), #38f9d7)" : "var(--l-neutral-5)"}; border:none; border-radius:8px; color:${n ? "var(--l-black)" : "var(--l-neutral-9)"}; font-weight:600; font-size:0.85rem; cursor:${n ? "pointer" : "not-allowed"}; transition:all 0.2s; box-shadow:${n ? "0 2px 8px rgba(78,204,163,0.3)" : "none"};"\n                      ${n ? "" : "disabled"}\n                    >\n                      ${n ? "⬆️ Promote" : "🔒 Not Eligible"}\n                    </button>\n                  `;
                      })()
            }\n              </div>\n              \n              \x3c!-- Stats --\x3e\n              <div style="display:flex; gap:24px; margin-top:16px;">\n                <div style="text-align:center;">\n                  <div style="color:var(--l-ink); font-weight:700; font-size:1.2rem;">${r}</div>\n                  <div style="color:var(--text-dim); font-size:0.8rem;">Posts</div>\n                </div>\n                <div style="text-align:center;">\n                  <div style="color:var(--danger); font-weight:700; font-size:1.2rem;">${l}</div>\n                  <div style="color:var(--text-dim); font-size:0.8rem;">Likes</div>\n                </div>\n                <div style="text-align:center;">\n                  <div style="color:var(--accent); font-weight:700; font-size:1.2rem;">${c}</div>\n                  <div style="color:var(--text-dim); font-size:0.8rem;">Mentions</div>\n                </div>\n                <div style="text-align:center;">\n                  <div style="color:var(--l-ink); font-weight:700; font-size:1.2rem;">${d}</div>\n                  <div style="color:var(--text-dim); font-size:0.8rem;">Connections</div>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n        \n        \x3c!-- Tabs --\x3e\n        <div style="display:flex; border-bottom:1px solid var(--border); background:var(--bg);">\n          <button class="profile-tab" data-tab="posts" style="flex:1; padding:16px; background:transparent; border:none; color:var(--text-dim); cursor:pointer; font-weight:600; border-bottom:3px solid transparent; transition:all 0.2s;">\n            📝 Their Posts (${r})\n          </button>\n          <button class="profile-tab" data-tab="mentions" style="flex:1; padding:16px; background:transparent; border:none; color:var(--text-dim); cursor:pointer; font-weight:600; border-bottom:3px solid transparent; transition:all 0.2s;">\n            @ Mentions (${c})\n          </button>\n          <button class="profile-tab" data-tab="friends" style="flex:1; padding:16px; background:transparent; border:none; color:var(--text-dim); cursor:pointer; font-weight:600; border-bottom:3px solid transparent; transition:all 0.2s;">\n            ❤️ Friends (${d})\n          </button>\n          <button class="profile-tab" data-tab="about" style="flex:1; padding:16px; background:transparent; border:none; color:var(--text-dim); cursor:pointer; font-weight:600; border-bottom:3px solid transparent; transition:all 0.2s;">\n            ℹ️ About\n          </button>\n        </div>\n        \n        \x3c!-- Tab Content --\x3e\n        <div id="profileTabContent" style="padding:20px; min-height:300px; max-height:500px; overflow-y:auto;">\n          \x3c!-- Content will be loaded here --\x3e\n        </div>\n      </div>\n    `),
        ModalManager.show(p, "profileModal"),
        p.addEventListener("click", (e) => {
            e.target === p && ModalManager.close("profileModal");
        });
    const m = p.querySelectorAll(".profile-tab");
    m.forEach((t) => {
        t.addEventListener("click", () => {
            m.forEach((e) => {
                (e.style.color = "var(--text-dim)"),
                    (e.style.borderBottomColor = "transparent"),
                    (e.style.background = "transparent");
            }),
                (t.style.color = "var(--l-cyan)"),
                (t.style.borderBottomColor = "var(--l-cyan)"),
                (t.style.background = "rgba(0, 212, 255, 0.05)"),
                loadProfileTab(t.dataset.tab, e, p);
        }),
            t.addEventListener("mouseenter", () => {
                "rgb(0, 212, 255)" !== t.style.color && (t.style.background = "var(--l-sheen-05)");
            }),
            t.addEventListener("mouseleave", () => {
                "rgb(0, 212, 255)" !== t.style.color && (t.style.background = "transparent");
            });
    }),
        m[0].click();
}
function loadProfileTab(e, t, n) {
    const a = gameState.employees.find((e) => e.id === t);
    if (!a) return;
    const o = n.querySelector("#profileTabContent");
    if (!o) return;
    const i = a.social;
    if ("posts" === e) {
        const e = gameState.socialNetwork.posts
            .filter((e) => e.authorId === t)
            .sort((e, t) => t.timestamp - e.timestamp);
        0 === e.length
            ? (o.innerHTML =
                  '\n          <div style="text-align:center; padding:60px 20px; color:var(--text-dim);">\n            <div style="font-size:3rem; margin-bottom:12px;">📭</div>\n            <div style="font-size:1.1rem; margin-bottom:6px;">No posts yet</div>\n            <div style="font-size:0.9rem; opacity:0.7;">This user hasn\'t posted anything yet</div>\n          </div>\n        ')
            : (o.innerHTML = e
                  .map(
                      (e) =>
                          `\n            <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:12px;">\n              <div style="color:var(--text-dim); font-size:0.8rem; margin-bottom:10px;">${formatTimeAgo(e.timestamp)}</div>\n              ${e.content ? `<p style="color:var(--text); margin:0 0 10px 0; line-height:1.6; white-space:pre-wrap;">${linkifyMentions(e.content)}</p>` : ""}\n              ${e.imageUrl ? `<img src="${e.imageUrl}" style="width:100%; border-radius:8px; margin-top:10px; object-fit:contain; max-height:400px; background:var(--l-black); cursor:pointer;" onclick="openImageViewer('${e.imageUrl}')">` : ""}\n              <div style="display:flex; gap:20px; margin-top:12px; padding-top:12px; border-top:1px solid var(--l-sheen-05); font-size:0.85rem;">\n                <span style="color:var(--danger);">❤️ ${e.likes.length}</span>\n                <span style="color:var(--accent);">💬 ${e.comments.length}</span>\n              </div>\n            </div>\n          `
                  )
                  .join(""));
    } else if ("mentions" === e) {
        const e = gameState.socialNetwork.posts
            .filter((e) => e.content && i.username && e.content.includes(`@${i.username}`))
            .sort((e, t) => t.timestamp - e.timestamp);
        0 === e.length
            ? (o.innerHTML =
                  '\n          <div style="text-align:center; padding:60px 20px; color:var(--text-dim);">\n            <div style="font-size:3rem; margin-bottom:12px;">@</div>\n            <div style="font-size:1.1rem; margin-bottom:6px;">No mentions yet</div>\n            <div style="font-size:0.9rem; opacity:0.7;">Nobody has mentioned this user yet</div>\n          </div>\n        ')
            : (o.innerHTML = e
                  .map((e) => {
                      const t = gameState.employees.find((t) => t.id === e.authorId) || { name: e.authorName },
                          n = formatTimeAgo(e.timestamp),
                          a = linkifyMentions(e.content);
                      return `\n            <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:12px;">\n              <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">\n                <strong style="color:var(--l-ink); font-size:0.9rem; cursor:pointer; transition:color 0.2s;" onclick="showEmployeeProfile('${t.id}')" onmouseenter="this.style.color='var(--l-cyan)'" onmouseleave="this.style.color='var(--l-ink)'">${t.name}</strong>\n                ${t.social?.username ? `<span style="color:var(--text-dim); font-size:0.8rem; cursor:pointer;" onclick="showEmployeeProfile('${t.id}')" onmouseenter="this.style.color='var(--l-cyan)'" onmouseleave="this.style.color='var(--text-dim)'">@${t.social.username}</span>` : ""}\n                <span style="color:var(--text-dim); font-size:0.75rem; margin-left:auto;">${n}</span>\n              </div>\n              <p style="color:var(--text); margin:0; line-height:1.6; white-space:pre-wrap;">${a}</p>\n              ${e.imageUrl ? `<img src="${e.imageUrl}" style="width:100%; border-radius:8px; margin-top:10px; object-fit:contain; max-height:300px; background:var(--l-black); cursor:pointer;" onclick="openImageViewer('${e.imageUrl}')">` : ""}\n            </div>\n          `;
                  })
                  .join(""));
    } else if ("friends" === e) {
        const e = (i.relationships || []).filter(
            (e) => "unknown" !== e.relationshipType && "stranger" !== e.relationshipType
        );
        0 === e.length
            ? (o.innerHTML =
                  '\n          <div style="text-align:center; padding:60px 20px; color:var(--text-dim);">\n            <div style="font-size:3rem; margin-bottom:12px;">👥</div>\n            <div style="font-size:1.1rem; margin-bottom:6px;">No close relationships yet</div>\n            <div style="font-size:0.9rem; opacity:0.7;">This user hasn\'t formed any close bonds</div>\n          </div>\n        ')
            : (o.innerHTML = e
                  .map((e) => {
                      const t = gameState.employees.find((t) => t.id === e.employeeId);
                      if (!t) return "";
                      const n = t.profileImage || placeholderImage(50, 50, t.name[0]),
                          a =
                              {
                                  best_friend: "💙",
                                  friend: "💚",
                                  crush: "💗",
                                  close_friend: "💛",
                                  rival: "⚔️",
                                  acquaintance: "👋",
                              }[e.relationshipType] || "👤",
                          o =
                              {
                                  best_friend: "Best Friend",
                                  friend: "Friend",
                                  crush: "Crush",
                                  close_friend: "Close Friend",
                                  rival: "Rival",
                                  acquaintance: "Acquaintance",
                              }[e.relationshipType] || e.relationshipType;
                      return `\n            <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:12px; display:flex; align-items:center; gap:14px; cursor:pointer; transition:all 0.2s;" onclick="showEmployeeProfile('${t.id}')" onmouseenter="this.style.background='var(--surface)'; this.style.borderColor='var(--l-cyan)'" onmouseleave="this.style.background='var(--bg)'; this.style.borderColor='var(--l-slate-2)'">\n              <img src="${n}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--accent);">\n              <div style="flex:1;">\n                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">\n                  <strong style="font-size:0.95rem;">${getColoredName(t)}</strong>\n                  ${t.social?.username ? `<span style="color:var(--text-dim); font-size:0.8rem;">@${t.social.username}</span>` : ""}\n                </div>\n                <div style="color:var(--accent); font-size:0.85rem;">${a} ${o}</div>\n              </div>\n            </div>\n          `;
                  })
                  .join(""));
    } else if ("about" === e) {
        const e = i.joinDate
                ? new Date(i.joinDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                  })
                : "Unknown",
            t = a.personality || {},
            n = a.appearance || {};
        o.innerHTML = `\n        <div style="display:grid; gap:20px;">\n          \x3c!-- Basic Info --\x3e\n          <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:20px;">\n            <h4 style="color:var(--accent); margin:0 0 16px 0; font-size:1rem; font-weight:600;">Basic Info</h4>\n            <div style="display:grid; gap:10px;">\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Full Name:</span>\n                <span style="font-weight:500;">${getColoredName(a)}</span>\n              </div>\n              ${i.username ? `\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Username:</span>\n                <span style="color:var(--accent); font-weight:500;">@${i.username}</span>\n              </div>\n              ` : ""}\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Joined:</span>\n                <span style="color:var(--text); font-weight:500;">${e}</span>\n              </div>\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Status:</span>\n                <span style="color:${"alumni" === a.employmentStatus ? "var(--l-neutral-9)" : "#0f0"}; font-weight:600;">${"alumni" === a.employmentStatus ? "Alumni" : "Active"}</span>\n              </div>\n            </div>\n          </div>\n          \n          \x3c!-- Personality --\x3e\n          ${t.traits && t.traits.length > 0 ? `\n          <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:20px;">\n            <h4 style="color:var(--accent); margin:0 0 16px 0; font-size:1rem; font-weight:600;">Personality</h4>\n            <div style="display:flex; flex-wrap:wrap; gap:8px;">\n              ${t.traits.map((e) => `\n                <span style="background:rgba(0,212,255,0.1); color:var(--accent); padding:6px 14px; border-radius:16px; font-size:0.85rem; border:1px solid rgba(0,212,255,0.2);">${e}</span>\n              `).join("")}\n            </div>\n          </div>\n          ` : ""}\n          \n          \x3c!-- Appearance --\x3e\n          ${n.hairColor || n.eyeColor ? `\n          <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:20px;">\n            <h4 style="color:var(--accent); margin:0 0 16px 0; font-size:1rem; font-weight:600;">Appearance</h4>\n            <div style="display:grid; gap:10px;">\n              ${n.hairColor ? `\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Hair:</span>\n                <span style="color:var(--text); font-weight:500;">${n.hairColor}</span>\n              </div>\n              ` : ""}\n              ${n.eyeColor ? `\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Eyes:</span>\n                <span style="color:var(--text); font-weight:500;">${n.eyeColor}</span>\n              </div>\n              ` : ""}\n            </div>\n          </div>\n          ` : ""}\n          \n          \x3c!-- Social Stats --\x3e\n          <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:20px;">\n            <h4 style="color:var(--accent); margin:0 0 16px 0; font-size:1rem; font-weight:600;">Social Activity</h4>\n            <div style="display:grid; gap:10px;">\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Total Posts:</span>\n                <span style="color:var(--text); font-weight:600;">${i.postCount || 0}</span>\n              </div>\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Likes Received:</span>\n                <span style="color:var(--danger); font-weight:600;">${i.totalLikesReceived || 0}</span>\n              </div>\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Comments Received:</span>\n                <span style="color:var(--accent); font-weight:600;">${i.totalCommentsReceived || 0}</span>\n              </div>\n              <div style="display:flex; justify-content:space-between;">\n                <span style="color:var(--text-dim);">Times Mentioned:</span>\n                <span style="color:var(--accent); font-weight:600;">${i.totalMentions || 0}</span>\n              </div>\n            </div>\n          </div>\n        </div>\n      `;
    }
}
function handleLikePost(e) {
    const t = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!t) return;
    const n = t.likes.indexOf("player");
    if (n >= 0) t.likes.splice(n, 1);
    else if ((t.likes.push("player"), !t.isPlayerPost && "player" !== t.authorId)) {
        gameState.employees.find((e) => e.id === t.authorId);
        addSocialNotification({
            type: "like",
            fromId: "player",
            fromName: "The Boss",
            postId: t.id,
            preview: t.content?.substring(0, 60),
            targetAuthorId: t.authorId,
        });
    }
    requestSmartFeedUpdate(e);
}
async function regeneratePostImage(e) {
    const t = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!t || !t.imagePrompt) return void showNotification("❌ Cannot regenerate: No image prompt found", "error");
    if (t.isRegenerating) return void showNotification("⏳ Already regenerating...", "warning");
    t.isRegenerating = !0;
    document.querySelectorAll(`[data-regen-post-id="${e}"]`).forEach((e) => {
        (e.disabled = !0),
            (e.style.opacity = "0.5"),
            (e.style.cursor = "not-allowed"),
            (e.innerHTML = "⏳ Regenerating...");
    }),
        showNotification("🎨 Regenerating image...", "info");
    try {
        const n = await queuedGenerateImage(applyImageStyle(t.imagePrompt), "Regenerating social post image");
        if (((t.imageUrl = n), !t.isPlayerPost && t.authorId)) {
            const e = gameState.employees.find((e) => e.id === t.authorId);
            e &&
                e.photos &&
                e.photos.push({
                    url: n,
                    prompt: t.imagePrompt,
                    type: "social_regenerated",
                    timestamp: gameState.time?.currentTime || Date.now(),
                });
        }
        delete t.isRegenerating,
            saveGame(!1),
            postModalState.activePostId === e && (closePostModal(), setTimeout(() => openPostModal(e), 100)),
            "social" === gameState.activeTab && renderSocialFeed(!1),
            showNotification("✅ Image regenerated successfully!", "success");
    } catch (n) {
        console.error("Error regenerating post image:", n),
            showNotification("❌ Failed to regenerate image", "error"),
            delete t.isRegenerating;
        document.querySelectorAll(`[data-regen-post-id="${e}"]`).forEach((e) => {
            (e.disabled = !1),
                (e.style.opacity = "0"),
                (e.style.cursor = "pointer"),
                (e.innerHTML = "🔄 Regenerate");
        });
    }
}
async function regenerateCommentImage(e, t) {
    const n = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!n) return void showNotification("❌ Post not found", "error");
    const a = n.comments.find((e) => e.id === t);
    if (!a || !a.imagePrompt) return void showNotification("❌ Cannot regenerate: No image prompt found", "error");
    if (a.isRegenerating) return void showNotification("⏳ Already regenerating...", "warning");
    a.isRegenerating = !0;
    const o = document.querySelector(`[data-regen-comment-id="${t}"]`);
    o &&
        ((o.disabled = !0),
        (o.style.opacity = "0.5"),
        (o.style.cursor = "not-allowed"),
        (o.innerHTML = "⏳ Regenerating...")),
        showNotification("🎨 Regenerating comment image...", "info");
    try {
        const t = await queuedGenerateImage(applyImageStyle(a.imagePrompt), "Regenerating comment image");
        (a.imageUrl = t),
            delete a.isRegenerating,
            saveGame(!1),
            postModalState.activePostId === e && renderModalComments(e, !1),
            showNotification("✅ Comment image regenerated!", "success");
    } catch (e) {
        console.error("Error regenerating comment image:", e),
            showNotification("❌ Failed to regenerate image", "error"),
            delete a.isRegenerating,
            o && ((o.disabled = !1), (o.style.opacity = "0.8"), (o.style.cursor = "pointer"), (o.innerHTML = "🔄"));
    }
}
async function deletePost(e) {
    console.log("[DeletePost] Called with postId:", e, typeof e),
        console.log("[DeletePost] Total posts in array:", gameState.socialNetwork.posts.length),
        console.log(
            "[DeletePost] First 5 post IDs:",
            gameState.socialNetwork.posts.slice(0, 5).map((e) => e.id)
        );
    const t = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!t) {
        console.error(`[DeletePost] Post ${e} not found`),
            console.error("[DeletePost] Searching all posts for similar ID...");
        const t = gameState.socialNetwork.posts.filter(
            (t) => String(t.id).includes(String(e)) || String(e).includes(String(t.id))
        );
        if (
            (console.error(
                "[DeletePost] Similar IDs found:",
                t.map((e) => e.id)
            ),
            1 === t.length)
        ) {
            console.warn("[DeletePost] Found single match by partial ID, using that post instead");
            const e = t[0],
                n =
                    "Delete this post by " +
                    (e.isPlayerPost
                        ? "You"
                        : gameState.employees.find((t) => t.id === e.authorId)?.name || e.authorName) +
                    '?\n\n"' +
                    e.content.substring(0, 100) +
                    (e.content.length > 100 ? "..." : "") +
                    '"\n\nThis cannot be undone.';
            if (!(await showConfirm(n, "Delete Post", { type: "danger", confirmText: "Delete" }))) return;
            const a = gameState.socialNetwork.posts.findIndex((t) => t.id === e.id);
            return void (
                a >= 0 &&
                (gameState.socialNetwork.posts.splice(a, 1),
                console.log(`[DeletePost] Deleted post ${e.id}`),
                closePostModal(),
                "social" === gameState.activeTab && renderSocialFeed(!0),
                "dashboard" === gameState.activeTab && refreshDashboardSections(),
                showNotification("🗑️ Post deleted", "info"))
            );
        }
        return;
    }
    const n =
        "Delete this post by " +
        (t.isPlayerPost ? "You" : gameState.employees.find((e) => e.id === t.authorId)?.name || t.authorName) +
        '?\n\n"' +
        t.content.substring(0, 100) +
        (t.content.length > 100 ? "..." : "") +
        '"\n\nThis cannot be undone.';
    if (!(await showConfirm(n, "Delete Post", { type: "danger", confirmText: "Delete" }))) return;
    const a = gameState.socialNetwork.posts.findIndex((t) => t.id === e);
    a >= 0 &&
        (gameState.socialNetwork.posts.splice(a, 1),
        console.log(`[DeletePost] Deleted post ${e}`),
        closePostModal(),
        "social" === gameState.activeTab && renderSocialFeed(!0),
        "dashboard" === gameState.activeTab && refreshDashboardSections(),
        showNotification("🗑️ Post deleted", "info"));
}
async function editPost(e) {
    const t = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!t || !t.isPlayerPost) return void console.error("[EditPost] Post not found or not owned by player");
    const n = await showPrompt("Edit your post:", "Edit Post", { defaultValue: t.content, multiline: !0 });
    null !== n &&
        "" !== n.trim() &&
        ((t.content = n.trim()),
        (t.editedAt = Date.now()),
        showNotification("✏️ Post updated", "success"),
        postModalState.activePostId === e && openPostModal(e),
        "social" === gameState.activeTab && renderSocialFeed(!0));
}
async function regeneratePost(e) {
    const t = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!t || t.isPlayerPost) return void console.error("[RegeneratePost] Post not found or is player post");
    const n = gameState.employees.find((e) => e.id === t.authorId);
    if (n) {
        showNotification("🔄 Regenerating post...", "info");
        try {
            const a =
                    t.explicitLevel >= 3
                        ? "extremely explicit and sexual"
                        : t.explicitLevel >= 2
                          ? "very suggestive and lewd"
                          : t.explicitLevel >= 1
                            ? "mildly suggestive"
                            : "safe for work",
                o = `You are ${n.name}, a ${n.position} at ${getCompanyName()}.\n\nCharacter: ${n.traits?.join(", ") || "professional"}\nMood: ${t.mood || "neutral"}\nPost Type: ${t.type || "social media update"}\nTone: ${a}\n\nORIGINAL POST: "${t.content}"\n\nYour task: Rewrite the above post with different wording while keeping the same core idea, topic, and sentiment. ${t.explicitLevel >= 1 ? "Keep it flirty/suggestive." : "Keep it casual and professional."} ${t.imageUrl ? "The post includes an image - reference it naturally if relevant." : ""}\n\nWrite 2-4 sentences in your authentic voice:`,
                i = await queuedGenerateText(
                    o,
                    { temperature: 0.9, max_tokens: 150, stop: ["\n\n", "User:", "Assistant:"] },
                    `Regenerate Post - ${t.authorName || "Unknown"}`
                );
            if (!i || !i.trim()) throw new Error("Empty response from AI");
            (t.content = i.trim()),
                (t.regeneratedAt = Date.now()),
                showNotification("✅ Post regenerated", "success"),
                postModalState.activePostId === e && openPostModal(e),
                "social" === gameState.activeTab && renderSocialFeed(!0);
        } catch (e) {
            console.error("[RegeneratePost] Error:", e), showNotification("❌ Failed to regenerate post", "error");
        }
    } else console.error("[RegeneratePost] Employee not found");
}
async function deleteComment(e, t) {
    const n = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!n) return void console.error("[DeleteComment] Post not found");
    const a = n.comments.find((e) => e.id === t);
    if (!a) return void console.error("[DeleteComment] Comment not found");
    const o =
            "player" === a.authorId
                ? "You"
                : gameState.employees.find((e) => e.id === a.authorId)?.name || a.authorName,
        i = a.content.substring(0, 50),
        s = a.content.length > 50 ? "..." : "";
    if (
        !(await showConfirm(`Delete comment by ${o}?\n\n"${i}${s}"`, "Delete Comment", {
            type: "danger",
            confirmText: "Delete",
        }))
    )
        return;
    const r = n.comments.findIndex((e) => e.id === t);
    if (r >= 0) {
        if (
            (n.comments.splice(r, 1),
            showNotification("🗑️ Comment deleted", "info"),
            postModalState.activePostId === e)
        ) {
            renderModalComments(e);
            const t = $("modalCommentCount");
            t && (t.textContent = n.comments.length);
        }
        "social" === gameState.activeTab && renderSocialFeed(!0);
    }
}
async function editComment(e, t) {
    const n = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!n) return void console.error("[EditComment] Post not found");
    const a = n.comments.find((e) => e.id === t);
    if (!a || "player" !== a.authorId)
        return void console.error("[EditComment] Comment not found or not owned by player");
    const o = await showPrompt("Edit your comment:", "Edit Comment", { defaultValue: a.content, multiline: !0 });
    null !== o &&
        "" !== o.trim() &&
        ((a.content = o.trim()),
        (a.editedAt = Date.now()),
        showNotification("✏️ Comment updated", "success"),
        postModalState.activePostId === e && renderModalComments(e),
        "social" === gameState.activeTab && renderSocialFeed(!0));
}
async function regenerateComment(e, t) {
    const n = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!n) return void console.error("[RegenerateComment] Post not found");
    const a = n.comments.find((e) => e.id === t);
    if (!a || "player" === a.authorId)
        return void console.error("[RegenerateComment] Comment not found or is player comment");
    const o = gameState.employees.find((e) => e.id === a.authorId);
    if (o) {
        showNotification("🔄 Regenerating comment...", "info");
        try {
            const t = n.isPlayerPost
                    ? "TheBoss"
                    : gameState.employees.find((e) => e.id === n.authorId)?.name || n.authorName,
                i = `You are ${o.name}, commenting on ${t}'s post: "${n.content}"\n\nGenerate a brief, natural comment (1-2 sentences) that ${o.name} would say. Be casual and authentic.`,
                s = await queuedGenerateText(
                    i,
                    { temperature: 0.9, max_tokens: 100, stop: ["\n\n", "User:", "Assistant:"] },
                    `Regenerate Comment - ${o.name}`
                );
            if (!s || !s.trim()) throw new Error("Empty response from AI");
            (a.content = s.trim()),
                (a.regeneratedAt = Date.now()),
                showNotification("✅ Comment regenerated", "success"),
                postModalState.activePostId === e && renderModalComments(e),
                "social" === gameState.activeTab && renderSocialFeed(!0);
        } catch (e) {
            console.error("[RegenerateComment] Error:", e),
                showNotification("❌ Failed to regenerate comment", "error");
        }
    } else console.error("[RegenerateComment] Employee not found");
}
function voteOnPost(e, t) {
    const n = gameState.socialNetwork.posts.find((t) => t.id === e);
    if (!n || n.isPlayerPost) return;
    (n.upvotes = n.upvotes || 0), (n.downvotes = n.downvotes || 0);
    const a = n.playerVote;
    "up" === n.playerVote && (n.upvotes--, gameState.aiQuality.stats.upvotes--),
        "down" === n.playerVote && (n.downvotes--, gameState.aiQuality.stats.downvotes--),
        n.playerVote === t
            ? ((n.playerVote = null), gameState.aiQuality.stats.totalVotes--)
            : ((n.playerVote = t),
              "up" === t
                  ? (n.upvotes++,
                    gameState.aiQuality.stats.upvotes++,
                    storeGoodExample(n, "post"),
                    showNotification("✅ Upvoted! AI will learn from this quality content", "success"))
                  : (n.downvotes++,
                    gameState.aiQuality.stats.downvotes++,
                    storeBadExample(n, "post"),
                    showNotification("❌ Downvoted! AI will avoid this pattern", "warning")),
              a || (gameState.aiQuality.stats.totalVotes++, gameState.aiQuality.stats.postsVoted++),
              1 !== gameState.aiQuality.stats.totalVotes ||
                  gameState.aiQuality.tutorialShown ||
                  showAITrainingTutorial()),
        ModalManager.isOpen("postModal") && postModalState.activePostId === e && updatePostModalContent(),
        renderSocialFeed(),
        saveGame();
}
function voteOnComment(e, t) {
    let n = null,
        a = null;
    for (const t of gameState.socialNetwork.posts) {
        const o = t.comments?.find((t) => t.id === e);
        if (o) {
            (n = o), (a = t);
            break;
        }
    }
    if (!n || n.isPlayerComment) return;
    (n.upvotes = n.upvotes || 0), (n.downvotes = n.downvotes || 0);
    const o = n.playerVote;
    if (
        ("up" === n.playerVote && (n.upvotes--, gameState.aiQuality.stats.upvotes--),
        "down" === n.playerVote && (n.downvotes--, gameState.aiQuality.stats.downvotes--),
        n.playerVote === t
            ? ((n.playerVote = null), gameState.aiQuality.stats.totalVotes--)
            : ((n.playerVote = t),
              "up" === t
                  ? (n.upvotes++,
                    gameState.aiQuality.stats.upvotes++,
                    storeGoodExample(n, "comment"),
                    showNotification("✅ Comment upvoted! AI will learn from this", "success"))
                  : (n.downvotes++,
                    gameState.aiQuality.stats.downvotes++,
                    storeBadExample(n, "comment"),
                    showNotification("❌ Comment downvoted! AI will avoid this pattern", "warning")),
              o || (gameState.aiQuality.stats.totalVotes++, gameState.aiQuality.stats.commentsVoted++),
              1 !== gameState.aiQuality.stats.totalVotes ||
                  gameState.aiQuality.tutorialShown ||
                  showAITrainingTutorial()),
        a)
    ) {
        const e = document.getElementById("postModal");
        if ("none" !== e?.style.display) {
            const t = e.querySelector("[data-post-id]")?.dataset.postId;
            t === a.id && renderModalComments(a.id);
        }
    }
    saveGame();
}
function voteOnChatMessage(e, t, n) {
    const a = "string" == typeof e ? e : e?.id;
    if (!a) return;
    const o = (gameState.chatHistory[a] || [])[t];
    if (!o || o.isPlayer) return;
    (o.upvotes = o.upvotes || 0), (o.downvotes = o.downvotes || 0);
    const i = o.playerVote;
    "up" === o.playerVote && (o.upvotes--, gameState.aiQuality.stats.upvotes--),
        "down" === o.playerVote && (o.downvotes--, gameState.aiQuality.stats.downvotes--),
        o.playerVote === n
            ? ((o.playerVote = null), gameState.aiQuality.stats.totalVotes--)
            : ((o.playerVote = n),
              "up" === n
                  ? (o.upvotes++,
                    gameState.aiQuality.stats.upvotes++,
                    storeGoodExample({ content: o.content, id: `chat_${a}_${t}`, authorId: a }, "chat"),
                    showNotification("✅ Chat upvoted! AI will learn from this", "success"))
                  : (o.downvotes++,
                    gameState.aiQuality.stats.downvotes++,
                    storeBadExample({ content: o.content, id: `chat_${a}_${t}` }, "chat"),
                    showNotification("❌ Chat downvoted! AI will avoid this pattern", "warning")),
              i || (gameState.aiQuality.stats.totalVotes++, gameState.aiQuality.stats.chatsVoted++),
              1 !== gameState.aiQuality.stats.totalVotes ||
                  gameState.aiQuality.tutorialShown ||
                  showAITrainingTutorial()),
        loadChatHistory(a),
        saveGame();
}
function storeGoodExample(e, t) {
    const n = {
        content: "post" === t ? e.content : e.text || e.content,
        type: "post" === t ? e.type : t,
        authorPersonality: "post" === t && e.authorId ? getEmployeePersonality(e.authorId) : null,
        timestamp: gameState.time?.currentTime || Date.now(),
        id: e.id,
    };
    gameState.aiQuality.goodExamples["post" === t ? "posts" : "comment" === t ? "comments" : "chats"].unshift(n);
    const a = gameState.aiQuality.maxExamplesPerType;
    gameState.aiQuality.goodExamples.posts.length > a && gameState.aiQuality.goodExamples.posts.pop(),
        gameState.aiQuality.goodExamples.comments.length > a && gameState.aiQuality.goodExamples.comments.pop(),
        gameState.aiQuality.goodExamples.chats.length > a && gameState.aiQuality.goodExamples.chats.pop();
}
function storeBadExample(e, t) {
    const n = "post" === t ? e.content : e.text || e.content,
        a = {
            content: n,
            type: "post" === t ? e.type : t,
            timestamp: gameState.time?.currentTime || Date.now(),
            id: e.id,
        };
    gameState.aiQuality.badExamples["post" === t ? "posts" : "comment" === t ? "comments" : "chats"].unshift(a);
    const o = gameState.aiQuality.maxExamplesPerType;
    gameState.aiQuality.badExamples.posts.length > o && gameState.aiQuality.badExamples.posts.pop(),
        gameState.aiQuality.badExamples.comments.length > o && gameState.aiQuality.badExamples.comments.pop(),
        gameState.aiQuality.badExamples.chats.length > o && gameState.aiQuality.badExamples.chats.pop();
    extractMetaPatterns(n).forEach((e) => {
        gameState.aiQuality.bannedPatterns.includes(e) ||
            (gameState.aiQuality.bannedPatterns.push(e),
            console.log(`[AI Training] Learned to ban pattern: "${e}"`));
    });
}
