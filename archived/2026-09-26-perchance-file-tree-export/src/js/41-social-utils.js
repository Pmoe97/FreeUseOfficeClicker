// ============================================================================
// 41-social-utils — Social utils: like/comment/vote handlers, post/comment CRUD, image viewers, profile modal, mention helpers.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function Yg(e, t) {
  const n = Math.max(0, t - e.timestamp) / 36e5;
  return ((e.upvotes || 0) - (e.downvotes || 0) + (e.likes?.length || 0) + 2 * (e.comments?.length || 0)) / Math.pow(n + 2, 1.5);
}
function Wg(e) {
  const t = (e.upvotes || 0) + (e.likes?.length || 0), n = e.downvotes || 0, a = e.comments?.length || 0;
  return 0 === t && 0 === n ? 0 : (t + n) * (t < n ? t / n : n / t) * (1 + 0.5 * a);
}
function Vg(e, t) {
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
function linkifyMentions(e, t = null, n = false, a = null) {
  if (!e) return "";
  let o = Qg(e);
  if (o = o.replace(/@(\w+)/g, (e2, t2) => {
    if ("theboss" === t2.toLowerCase()) return '<span style="color:var(--k); cursor:default; font-weight:700; text-shadow:0 0 8px rgba(233,69,96,0.4);">@TheBoss</span>';
    const n2 = gameState.employees.find((e3) => e3.social?.username === t2);
    return n2 ? `<span style="color:var(--d); cursor:pointer; font-weight:600; transition:color 0.2s;" onclick="showEmployeeProfile('${n2.id}')" onmouseenter="this.style.color='var(--b)'; this.style.textDecoration='underline'" onmouseleave="this.style.color='var(--u)'; this.style.textDecoration='none'">@${t2}</span>` : `<span style="color:var(--d);">@${t2}</span>`;
  }), n && t && "player" !== t) {
    const e2 = gameState.employees.find((e3) => e3.id === t);
    if (e2) {
      const n2 = a ? `window.openChatAndScrollTo && window.openChatAndScrollTo('${t}', ${a})` : `window.openChat && window.openChat('${t}')`;
      o = o.replace(/\b(check (your |my )?(DM|DMs|inbox|messages?)|sent.*(your )?way|DM('d|ing|ed)? you|in (your |my )?(inbox|DMs?|messages)|sliding? into|slid into)/gi, (t2) => `<span style="color:var(--v); cursor:pointer; text-decoration:underline; font-weight:500;" onclick="${n2}" title="Open chat with ${e2.name} - click to view the DM!">${t2}</span>`);
    }
  }
  return o;
}
function Kg(e, t) {
  const n = gameState.employees.find((t2) => t2.id === e.authorId) || { name: e.authorName, profileImage: null }, a = n.profileImage || "https://placehold.co/32x32?text=" + (n.name?.[0] || "?"), o = Jg(e.timestamp), i = "player" === e.authorId;
  let s = "";
  if (e.replyToCommentId && gameState.socialNetwork?.posts) {
    const t2 = gameState.socialNetwork.posts.flatMap((e2) => e2.comments || []).find((t3) => t3.id === e.replyToCommentId);
    t2 && (s = `<div style="color:var(--a); font-size:0.82rem; margin-bottom:4px; display:flex; align-items:center; gap:4px;"> <span style="color:var(--fc);">\u21AA</span> Replying to <strong style="color:var(--d);">@${t2.authorName}</strong> </div>`);
  }
  return ` <div class="comment-item" data-comment-id="${e.id}" style="display:flex; gap:12px; margin-bottom:12px; padding:10px; background:var(--i); border-radius:12px; border:1px solid var(--cg);"> <img src="${a}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; flex-shrink:0; cursor:${i ? "default" : "pointer"};" ${i ? "" : `onclick="showEmployeeProfile('${e.authorId}')"`}> <div style="flex:1; min-width:0;"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;"> <div style="display:flex; align-items:center; gap:6px;"> <strong style="font-size:0.88rem; font-weight:600; cursor:${i ? "default" : "pointer"}; transition:opacity 0.2s;" ${i ? "" : `onclick="openUnifiedProfile('${e.authorId}', 'overview')" onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'"`}>${i ? '<span style="color:var(--d);">You</span>' : yl(n)}</strong> ${i ? '<span style="color:var(--a); font-size:0.75rem;">@TheBoss</span>' : n.social?.username ? `<span style="color:var(--a); font-size:0.75rem;">@${n.social.username}</span>` : ""} </div> <span style="color:var(--fc); font-size:0.78rem; white-space:nowrap;">${o}</span> </div> ${s} <p style="color:var(--y); margin:0 0 8px 0; font-size:0.9rem; line-height:1.5; word-wrap:break-word;">${linkifyMentions(e.content, e.authorId, e.dmSent, e.dmMessageTimestamp)}</p> ${e.imageUrl ? ` <div style="margin:8px 0;"> <img src="${e.imageUrl}" alt="${e.imageAlt || "Comment image"}" style="max-width:100%; max-height:400px; border-radius:12px; cursor:pointer; display:block; border:1px solid var(--cg);" onclick="openImageViewer('${e.imageUrl}')"> </div> ` : ""} <div style="display:flex; gap:12px; align-items:center;"> <button class="reply-to-comment-btn" data-post-id="${t}" data-comment-id="${e.id}" data-author-name="${e.authorName}" data-author-id="${e.authorId}" data-author-username="${i ? "TheBoss" : n.social?.username || ""}" style="background:transparent; border:none; color:var(--a); font-size:0.82rem; cursor:pointer; padding:2px 8px; transition:color 0.2s;" onmouseenter="this.style.color='var(--u)'" onmouseleave="this.style.color='var(--a)'"> \u21AA Reply </button> ${i ? ` <button onclick="editComment('${t}', '${e.id}')" style="background:transparent; border:none; color:var(--a); font-size:0.82rem; cursor:pointer; padding:2px 8px; transition:color 0.2s;" onmouseenter="this.style.color='var(--u)'" onmouseleave="this.style.color='var(--a)'"> \u270F\uFE0F Edit </button> ` : ` <button onclick="regenerateComment('${t}', '${e.id}')" style="background:transparent; border:none; color:var(--a); font-size:0.82rem; cursor:pointer; padding:2px 8px; transition:color 0.2s;" onmouseenter="this.style.color='var(--u)'" onmouseleave="this.style.color='var(--a)'"> \u{1F504} Regenerate </button> `} <button onclick="deleteComment('${t}', '${e.id}')" style="background:transparent; border:none; color:var(--k); font-size:0.82rem; cursor:pointer; padding:2px 8px; transition:color 0.2s;" onmouseenter="this.style.color='var(--ge)'" onmouseleave="this.style.color='var(--l)'"> \u{1F5D1}\uFE0F Delete </button> </div> </div> </div> `;
}
function Jg(e) {
  const a = gameState && gameState.time && gameState.time.currentTime || Date.now(), t = Math.floor((a - e) / 1e3);
  return t < 0 || t < 60 ? "Just now" : t < 3600 ? Math.floor(t / 60) + "m ago" : t < 86400 ? Math.floor(t / 3600) + "h ago" : t < 604800 ? Math.floor(t / 86400) + "d ago" : t < 2592e3 ? Math.floor(t / 604800) + "w ago" : Math.floor(t / 2592e3) + "mo ago";
}
function Qg(e) {
  const t = document.createElement("div");
  return t.textContent = e, t.innerHTML;
}
function Xg(e) {
  return String(null == e ? "" : e).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/\r?\n/g, " ");
}
function openImageViewer(e) {
  const t = document.createElement("div");
  t.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--bc); z-index:999999; display:flex; justify-content:center; align-items:center; cursor:pointer;", t.innerHTML = `<img src="${e}" style="max-width:90%; max-height:90%; border-radius:10px;">`, t.onclick = () => t.remove(), document.body.appendChild(t);
}
function showEmployeeProfile(e) {
  if (!e || "player" === e) return;
  const t = gameState.employees.find((t2) => t2.id === e);
  if (!t) return;
  const n = t.social, a = t.profileImage || `https://placehold.co/120x120?text=${t.name[0]}`, o = "alumni" === t.employmentStatus, i = gameState.socialNetwork.posts.filter((t2) => t2.authorId === e), s = gameState.socialNetwork.posts.filter((e2) => !!n.username && e2.content && e2.content.includes(`@${n.username}`)), r = (n.relationships, i.length), l = i.reduce((e2, t2) => e2 + t2.likes.length, 0), c = (i.reduce((e2, t2) => e2 + t2.comments.length, 0), s.length), d = gameState.employees.filter((t2) => t2.social?.relationships?.some((t3) => t3.employeeId === e && "unknown" !== t3.relationshipType)).length, p = (n.joinDate && new Date(n.joinDate).toLocaleDateString(), document.createElement("div"));
  p.id = "profileModal", p.style.background = "var(--an)", p.style.padding = "20px", p.style.overflow = "auto", p.innerHTML = ` <div style="background:var(--h); border:1px solid var(--o); border-radius:20px; max-width:800px; width:100%; max-height:90vh; overflow:auto; box-shadow:0 8px 32px var(--ab);"> <!-- Close button --> <div style="position:sticky; top:0; background:var(--h); padding:16px 20px; border-bottom:1px solid var(--o); display:flex; justify-content:space-between; align-items:center; z-index:10;"> <h3 style="color:var(--b); margin:0; font-size:1.1rem; font-weight:600;">Profile</h3> <button onclick="ModalManager.close('profileModal')" style="background:transparent; border:none; color:var(--a); cursor:pointer; font-size:1.5rem; padding:4px 10px; border-radius:50%; transition:all 0.2s;" onmouseenter="this.style.background='var(--ba)'; this.style.color='var(--b)'" onmouseleave="this.style.background='transparent'; this.style.color='var(--a)'">\xD7</button> </div> <!-- Profile Header --> <div style="padding:24px 20px; border-bottom:1px solid var(--o);"> <div style="display:flex; gap:20px; align-items:start; margin-bottom:20px;"> <img src="${a}" style="width:100px; height:100px; border-radius:50%; border:3px solid ${o ? "var(--as)" : "var(--u)"}; object-fit:cover;"> <div style="flex:1;"> <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;"> <h2 style="margin:0; font-size:1.5rem; font-weight:600;">${yl(t)}</h2> ${o ? '<span style="background:var(--af); padding:4px 12px; border-radius:14px; font-size:0.75rem; color:var(--ao); font-weight:600;">Alumni</span>' : ""} </div> ${n.username ? `<div style="color:var(--a); font-size:1rem; margin-bottom:12px;">@${n.username}</div>` : ""}
              ${n.bio ? `<p style="color:var(--y); margin:0 0 12px 0; line-height:1.5;">${n.bio}</p>` : ""} <!-- Career Info & Actions --> <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px; flex-wrap:wrap;"> ${t.career ? ` <div style="background:var(--f); padding:6px 14px; border-radius:8px; border:1px solid var(--d);"> <span style="color:var(--d); font-size:0.85rem; font-weight:600;">${t.career.title || "Employee"}</span> <span style="color:var(--a); font-size:0.75rem; margin-left:6px;">\u2022 Level ${t.career.level || 1}</span> </div> ` : ""}
                ${o ? "" : (() => {
    const n2 = "function" == typeof window.canPromoteEmployee && window.canPromoteEmployee(t);
    return ` <button id="profilePromoteBtn_${e}"
                      data-employee-id="${e}"
                      style="padding:8px 16px; background:${n2 ? "linear-gradient(135deg, var(--n), #38f9d7)" : "var(--af)"}; border:none; border-radius:8px; color:${n2 ? "var(--bj)" : "var(--eg)"}; font-weight:600; font-size:0.85rem; cursor:${n2 ? "pointer" : "not-allowed"}; transition:all 0.2s; box-shadow:${n2 ? "0 2px 8px rgba(78,204,163,0.3)" : "none"};"
                      ${n2 ? "" : "disabled"}
                    >
                      ${n2 ? "\u2B06\uFE0F Promote" : "\u{1F512} Not Eligible"} </button> `;
  })()} </div> <!-- Stats --> <div style="display:flex; gap:24px; margin-top:16px;"> <div style="text-align:center;"> <div style="color:var(--b); font-weight:700; font-size:1.2rem;">${r}</div> <div style="color:var(--a); font-size:0.8rem;">Posts</div> </div> <div style="text-align:center;"> <div style="color:var(--k); font-weight:700; font-size:1.2rem;">${l}</div> <div style="color:var(--a); font-size:0.8rem;">Likes</div> </div> <div style="text-align:center;"> <div style="color:var(--d); font-weight:700; font-size:1.2rem;">${c}</div> <div style="color:var(--a); font-size:0.8rem;">Mentions</div> </div> <div style="text-align:center;"> <div style="color:var(--b); font-weight:700; font-size:1.2rem;">${d}</div> <div style="color:var(--a); font-size:0.8rem;">Connections</div> </div> </div> </div> </div> </div> <!-- Tabs --> <div style="display:flex; border-bottom:1px solid var(--o); background:var(--i);"> <button class="profile-tab" data-tab="posts" style="flex:1; padding:16px; background:transparent; border:none; color:var(--a); cursor:pointer; font-weight:600; border-bottom:3px solid transparent; transition:all 0.2s;"> \u{1F4DD} Their Posts (${r}) </button> <button class="profile-tab" data-tab="mentions" style="flex:1; padding:16px; background:transparent; border:none; color:var(--a); cursor:pointer; font-weight:600; border-bottom:3px solid transparent; transition:all 0.2s;"> @ Mentions (${c}) </button> <button class="profile-tab" data-tab="friends" style="flex:1; padding:16px; background:transparent; border:none; color:var(--a); cursor:pointer; font-weight:600; border-bottom:3px solid transparent; transition:all 0.2s;"> \u2764\uFE0F Friends (${d}) </button> <button class="profile-tab" data-tab="about" style="flex:1; padding:16px; background:transparent; border:none; color:var(--a); cursor:pointer; font-weight:600; border-bottom:3px solid transparent; transition:all 0.2s;"> \u2139\uFE0F About </button> </div> <!-- Tab Content --> <div id="profileTabContent" style="padding:20px; min-height:300px; max-height:500px; overflow-y:auto;"> <!-- Content will be loaded here --> </div> </div> `, ModalManager.show(p, "profileModal"), p.addEventListener("click", (e2) => {
    e2.target === p && ModalManager.close("profileModal");
  });
  const m = p.querySelectorAll(".profile-tab");
  m.forEach((t2) => {
    t2.addEventListener("click", () => {
      m.forEach((e2) => {
        e2.style.color = "var(--a)", e2.style.borderBottomColor = "transparent", e2.style.background = "transparent";
      }), t2.style.color = "var(--u)", t2.style.borderBottomColor = "var(--u)", t2.style.background = "rgba(0, 212, 255, 0.05)", loadProfileTab(t2.dataset.tab, e, p);
    }), t2.addEventListener("mouseenter", () => {
      "rgb(0, 212, 255)" !== t2.style.color && (t2.style.background = "var(--bb)");
    }), t2.addEventListener("mouseleave", () => {
      "rgb(0, 212, 255)" !== t2.style.color && (t2.style.background = "transparent");
    });
  }), m[0].click();
}
function loadProfileTab(e, t, n) {
  const a = gameState.employees.find((e2) => e2.id === t);
  if (!a) return;
  const o = n.querySelector("#profileTabContent");
  if (!o) return;
  const i = a.social;
  if ("posts" === e) {
    const e2 = gameState.socialNetwork.posts.filter((e3) => e3.authorId === t).sort((e3, t2) => t2.timestamp - e3.timestamp);
    0 === e2.length ? o.innerHTML = ` <div style="text-align:center; padding:60px 20px; color:var(--a);"> <div style="font-size:3rem; margin-bottom:12px;">\u{1F4ED}</div> <div style="font-size:1.1rem; margin-bottom:6px;">No posts yet</div> <div style="font-size:0.9rem; opacity:0.7;">This user hasn't posted anything yet</div> </div> ` : o.innerHTML = e2.map((e3) => ` <div style="background:var(--i); border:1px solid var(--o); border-radius:12px; padding:16px; margin-bottom:12px;"> <div style="color:var(--a); font-size:0.8rem; margin-bottom:10px;">${Jg(e3.timestamp)}</div> ${e3.content ? `<p style="color:var(--y); margin:0 0 10px 0; line-height:1.6; white-space:pre-wrap;">${linkifyMentions(e3.content)}</p>` : ""}
              ${e3.imageUrl ? `<img src="${e3.imageUrl}" style="width:100%; border-radius:8px; margin-top:10px; object-fit:contain; max-height:400px; background:var(--bj); cursor:pointer;" onclick="openImageViewer('${e3.imageUrl}')">` : ""} <div style="display:flex; gap:20px; margin-top:12px; padding-top:12px; border-top:1px solid var(--bb); font-size:0.85rem;"> <span style="color:var(--k);">\u2764\uFE0F ${e3.likes.length}</span> <span style="color:var(--d);">\u{1F4AC} ${e3.comments.length}</span> </div> </div> `).join("");
  } else if ("mentions" === e) {
    const e2 = gameState.socialNetwork.posts.filter((e3) => e3.content && i.username && e3.content.includes(`@${i.username}`)).sort((e3, t2) => t2.timestamp - e3.timestamp);
    0 === e2.length ? o.innerHTML = ' <div style="text-align:center; padding:60px 20px; color:var(--a);"> <div style="font-size:3rem; margin-bottom:12px;">@</div> <div style="font-size:1.1rem; margin-bottom:6px;">No mentions yet</div> <div style="font-size:0.9rem; opacity:0.7;">Nobody has mentioned this user yet</div> </div> ' : o.innerHTML = e2.map((e3) => {
      const t2 = gameState.employees.find((t3) => t3.id === e3.authorId) || { name: e3.authorName }, n2 = Jg(e3.timestamp), a2 = linkifyMentions(e3.content);
      return ` <div style="background:var(--i); border:1px solid var(--o); border-radius:12px; padding:16px; margin-bottom:12px;"> <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;"> <strong style="color:var(--b); font-size:0.9rem; cursor:pointer; transition:color 0.2s;" onclick="showEmployeeProfile('${t2.id}')" onmouseenter="this.style.color='var(--u)'" onmouseleave="this.style.color='var(--b)'">${t2.name}</strong> ${t2.social?.username ? `<span style="color:var(--a); font-size:0.8rem; cursor:pointer;" onclick="showEmployeeProfile('${t2.id}')" onmouseenter="this.style.color='var(--u)'" onmouseleave="this.style.color='var(--a)'">@${t2.social.username}</span>` : ""} <span style="color:var(--a); font-size:0.75rem; margin-left:auto;">${n2}</span>
              </div>
              <p style="color:var(--y); margin:0; line-height:1.6; white-space:pre-wrap;">${a2}</p> ${e3.imageUrl ? `<img src="${e3.imageUrl}" style="width:100%; border-radius:8px; margin-top:10px; object-fit:contain; max-height:300px; background:var(--bj); cursor:pointer;" onclick="openImageViewer('${e3.imageUrl}')">` : ""} </div> `;
    }).join("");
  } else if ("friends" === e) {
    const e2 = (i.relationships || []).filter((e3) => "unknown" !== e3.relationshipType && "stranger" !== e3.relationshipType);
    0 === e2.length ? o.innerHTML = ` <div style="text-align:center; padding:60px 20px; color:var(--a);"> <div style="font-size:3rem; margin-bottom:12px;">\u{1F465}</div> <div style="font-size:1.1rem; margin-bottom:6px;">No close relationships yet</div> <div style="font-size:0.9rem; opacity:0.7;">This user hasn't formed any close bonds</div> </div> ` : o.innerHTML = e2.map((e3) => {
      const t2 = gameState.employees.find((t3) => t3.id === e3.employeeId);
      if (!t2) return "";
      const n2 = t2.profileImage || `https://placehold.co/50x50?text=${t2.name[0]}`, a2 = { best_friend: "\u{1F499}", friend: "\u{1F49A}", crush: "\u{1F497}", close_friend: "\u{1F49B}", rival: "\u2694\uFE0F", acquaintance: "\u{1F44B}" }[e3.relationshipType] || "\u{1F464}", o2 = { best_friend: "Best Friend", friend: "Friend", crush: "Crush", close_friend: "Close Friend", rival: "Rival", acquaintance: "Acquaintance" }[e3.relationshipType] || e3.relationshipType;
      return ` <div style="background:var(--i); border:1px solid var(--o); border-radius:12px; padding:16px; margin-bottom:12px; display:flex; align-items:center; gap:14px; cursor:pointer; transition:all 0.2s;" onclick="showEmployeeProfile('${t2.id}')" onmouseenter="this.style.background='var(--h)'; this.style.borderColor='var(--u)'" onmouseleave="this.style.background='var(--i)'; this.style.borderColor='var(--cd)'"> <img src="${n2}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--d);"> <div style="flex:1;"> <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;"> <strong style="font-size:0.95rem;">${yl(t2)}</strong> ${t2.social?.username ? `<span style="color:var(--a); font-size:0.8rem;">@${t2.social.username}</span>` : ""} </div> <div style="color:var(--d); font-size:0.85rem;">${a2} ${o2}</div> </div> </div> `;
    }).join("");
  } else if ("about" === e) {
    const e2 = i.joinDate ? new Date(i.joinDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Unknown", t2 = a.personality || {}, n2 = a.appearance || {};
    o.innerHTML = ` <div style="display:grid; gap:20px;"> <!-- Basic Info --> <div style="background:var(--i); border:1px solid var(--o); border-radius:12px; padding:20px;"> <h4 style="color:var(--d); margin:0 0 16px 0; font-size:1rem; font-weight:600;">Basic Info</h4> <div style="display:grid; gap:10px;"> <div style="display:flex; justify-content:space-between;"> <span style="color:var(--a);">Full Name:</span> <span style="font-weight:500;">${yl(a)}</span> </div> ${i.username ? ` <div style="display:flex; justify-content:space-between;"> <span style="color:var(--a);">Username:</span> <span style="color:var(--d); font-weight:500;">@${i.username}</span> </div> ` : ""} <div style="display:flex; justify-content:space-between;"> <span style="color:var(--a);">Joined:</span> <span style="color:var(--y); font-weight:500;">${e2}</span> </div> <div style="display:flex; justify-content:space-between;"> <span style="color:var(--a);">Status:</span> <span style="color:${"alumni" === a.employmentStatus ? "var(--eg)" : "#0f0"}; font-weight:600;">${"alumni" === a.employmentStatus ? "Alumni" : "Active"}</span> </div> </div> </div> <!-- Personality --> ${t2.traits && t2.traits.length > 0 ? ` <div style="background:var(--i); border:1px solid var(--o); border-radius:12px; padding:20px;"> <h4 style="color:var(--d); margin:0 0 16px 0; font-size:1rem; font-weight:600;">Personality</h4> <div style="display:flex; flex-wrap:wrap; gap:8px;"> ${t2.traits.map((e3) => ` <span style="background:rgba(0,212,255,0.1); color:var(--d); padding:6px 14px; border-radius:16px; font-size:0.85rem; border:1px solid rgba(0,212,255,0.2);">${e3}</span> `).join("")} </div> </div> ` : ""}
          
          <!-- Appearance -->
          ${n2.hairColor || n2.eyeColor ? ` <div style="background:var(--i); border:1px solid var(--o); border-radius:12px; padding:20px;"> <h4 style="color:var(--d); margin:0 0 16px 0; font-size:1rem; font-weight:600;">Appearance</h4> <div style="display:grid; gap:10px;"> ${n2.hairColor ? ` <div style="display:flex; justify-content:space-between;"> <span style="color:var(--a);">Hair:</span> <span style="color:var(--y); font-weight:500;">${n2.hairColor}</span> </div> ` : ""}
              ${n2.eyeColor ? ` <div style="display:flex; justify-content:space-between;"> <span style="color:var(--a);">Eyes:</span> <span style="color:var(--y); font-weight:500;">${n2.eyeColor}</span> </div> ` : ""} </div> </div> ` : ""} <!-- Social Stats --> <div style="background:var(--i); border:1px solid var(--o); border-radius:12px; padding:20px;"> <h4 style="color:var(--d); margin:0 0 16px 0; font-size:1rem; font-weight:600;">Social Activity</h4> <div style="display:grid; gap:10px;"> <div style="display:flex; justify-content:space-between;"> <span style="color:var(--a);">Total Posts:</span> <span style="color:var(--y); font-weight:600;">${i.postCount || 0}</span> </div> <div style="display:flex; justify-content:space-between;"> <span style="color:var(--a);">Likes Received:</span> <span style="color:var(--k); font-weight:600;">${i.totalLikesReceived || 0}</span> </div> <div style="display:flex; justify-content:space-between;"> <span style="color:var(--a);">Comments Received:</span> <span style="color:var(--d); font-weight:600;">${i.totalCommentsReceived || 0}</span> </div> <div style="display:flex; justify-content:space-between;"> <span style="color:var(--a);">Times Mentioned:</span> <span style="color:var(--d); font-weight:600;">${i.totalMentions || 0}</span> </div> </div> </div> </div> `;
  }
}
function handleLikePost(e) {
  const t = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!t) return;
  const n = t.likes.indexOf("player");
  n >= 0 ? t.likes.splice(n, 1) : (t.likes.push("player"), t.isPlayerPost || "player" === t.authorId || (gameState.employees.find((e2) => e2.id === t.authorId), addSocialNotification({ type: "like", fromId: "player", fromName: "The Boss", postId: t.id, preview: t.content?.substring(0, 60), targetAuthorId: t.authorId }))), wg(e);
}
async function regeneratePostImage(e) {
  const t = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (t && t.imagePrompt) if (t.isRegenerating) showNotification("\u23F3 Already regenerating...", "warning");
  else {
    t.isRegenerating = true, document.querySelectorAll(`[data-regen-post-id="${e}"]`).forEach((e2) => {
      e2.disabled = true, e2.style.opacity = "0.5", e2.style.cursor = "not-allowed", e2.innerHTML = "\u23F3 Regenerating...";
    }), showNotification("\u{1F3A8} Regenerating image...", "info");
    try {
      const n = await queuedGenerateImage(applyImageStyle(t.imagePrompt), "Regenerating social post image");
      if (t.imageUrl = n, !t.isPlayerPost && t.authorId) {
        const e2 = gameState.employees.find((e3) => e3.id === t.authorId);
        e2 && e2.photos && e2.photos.push({ url: n, prompt: t.imagePrompt, type: "social_regenerated", timestamp: gameState.time?.currentTime || Date.now() });
      }
      delete t.isRegenerating, saveGame(false), fg.activePostId === e && (closePostModal(), setTimeout(() => openPostModal(e), 100)), "social" === gameState.activeTab && renderSocialFeed(false), showNotification("\u2705 Image regenerated successfully!", "success");
    } catch (u2) {
      console.error("Error regenerating post image:", u2), showNotification("\u274C Failed to regenerate image", "error"), delete t.isRegenerating, document.querySelectorAll(`[data-regen-post-id="${e}"]`).forEach((e2) => {
        e2.disabled = false, e2.style.opacity = "0", e2.style.cursor = "pointer", e2.innerHTML = "\u{1F504} Regenerate";
      });
    }
  }
  else showNotification("\u274C Cannot regenerate: No image prompt found", "error");
}
async function regenerateCommentImage(e, t) {
  const n = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!n) return void showNotification("\u274C Post not found", "error");
  const a = n.comments.find((e2) => e2.id === t);
  if (!a || !a.imagePrompt) return void showNotification("\u274C Cannot regenerate: No image prompt found", "error");
  if (a.isRegenerating) return void showNotification("\u23F3 Already regenerating...", "warning");
  a.isRegenerating = true;
  const o = document.querySelector(`[data-regen-comment-id="${t}"]`);
  o && (o.disabled = true, o.style.opacity = "0.5", o.style.cursor = "not-allowed", o.innerHTML = "\u23F3 Regenerating..."), showNotification("\u{1F3A8} Regenerating comment image...", "info");
  try {
    const t2 = await queuedGenerateImage(applyImageStyle(a.imagePrompt), "Regenerating comment image");
    a.imageUrl = t2, delete a.isRegenerating, saveGame(false), fg.activePostId === e && Rg(e, false), showNotification("\u2705 Comment image regenerated!", "success");
  } catch (e2) {
    console.error("Error regenerating comment image:", e2), showNotification("\u274C Failed to regenerate image", "error"), delete a.isRegenerating, o && (o.disabled = false, o.style.opacity = "0.8", o.style.cursor = "pointer", o.innerHTML = "\u{1F504}");
  }
}
async function deletePost(e) {
  console.log("[DeletePost] Called with postId:", e, typeof e), console.log("[DeletePost] Total posts in array:", gameState.socialNetwork.posts.length), console.log("[DeletePost] First 5 post IDs:", gameState.socialNetwork.posts.slice(0, 5).map((e2) => e2.id));
  const t = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!t) {
    console.error(`[DeletePost] Post ${e} not found`), console.error("[DeletePost] Searching all posts for similar ID...");
    const t2 = gameState.socialNetwork.posts.filter((t3) => String(t3.id).includes(String(e)) || String(e).includes(String(t3.id)));
    if (console.error("[DeletePost] Similar IDs found:", t2.map((e2) => e2.id)), 1 === t2.length) {
      console.warn("[DeletePost] Found single match by partial ID, using that post instead");
      const e2 = t2[0], n2 = "Delete this post by " + (e2.isPlayerPost ? "You" : gameState.employees.find((t3) => t3.id === e2.authorId)?.name || e2.authorName) + '?\n\n"' + e2.content.substring(0, 100) + (e2.content.length > 100 ? "..." : "") + '"\n\nThis cannot be undone.';
      if (!await Ev(n2, "Delete Post", { type: "danger", confirmText: "Delete" })) return;
      const a2 = gameState.socialNetwork.posts.findIndex((t3) => t3.id === e2.id);
      return void (a2 >= 0 && (gameState.socialNetwork.posts.splice(a2, 1), console.log(`[DeletePost] Deleted post ${e2.id}`), closePostModal(), "social" === gameState.activeTab && renderSocialFeed(true), "dashboard" === gameState.activeTab && sd(), showNotification("\u{1F5D1}\uFE0F Post deleted", "info")));
    }
    return;
  }
  const n = "Delete this post by " + (t.isPlayerPost ? "You" : gameState.employees.find((e2) => e2.id === t.authorId)?.name || t.authorName) + '?\n\n"' + t.content.substring(0, 100) + (t.content.length > 100 ? "..." : "") + '"\n\nThis cannot be undone.';
  if (!await Ev(n, "Delete Post", { type: "danger", confirmText: "Delete" })) return;
  const a = gameState.socialNetwork.posts.findIndex((t2) => t2.id === e);
  a >= 0 && (gameState.socialNetwork.posts.splice(a, 1), console.log(`[DeletePost] Deleted post ${e}`), closePostModal(), "social" === gameState.activeTab && renderSocialFeed(true), "dashboard" === gameState.activeTab && sd(), showNotification("\u{1F5D1}\uFE0F Post deleted", "info"));
}
async function editPost(e) {
  const t = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!t || !t.isPlayerPost) return void console.error("[EditPost] Post not found or not owned by player");
  const n = await Iv("Edit your post:", "Edit Post", { defaultValue: t.content, multiline: true });
  null !== n && "" !== n.trim() && (t.content = n.trim(), t.editedAt = Date.now(), showNotification("\u270F\uFE0F Post updated", "success"), fg.activePostId === e && openPostModal(e), "social" === gameState.activeTab && renderSocialFeed(true));
}
async function regeneratePost(e) {
  const t = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!t || t.isPlayerPost) return void console.error("[RegeneratePost] Post not found or is player post");
  const n = gameState.employees.find((e2) => e2.id === t.authorId);
  if (n) {
    showNotification("\u{1F504} Regenerating post...", "info");
    try {
      const a = t.explicitLevel >= 3 ? "extremely explicit and sexual" : t.explicitLevel >= 2 ? "very suggestive and lewd" : t.explicitLevel >= 1 ? "mildly suggestive" : "safe for work", o = `You are ${n.name}, a ${n.position} at ${vr()}.

Character: ${n.traits?.join(", ") || "professional"}
Mood: ${t.mood || "neutral"}
Post Type: ${t.type || "social media update"}
Tone: ${a}

ORIGINAL POST: "${t.content}"

Your task: Rewrite the above post with different wording while keeping the same core idea, topic, and sentiment. ${t.explicitLevel >= 1 ? "Keep it flirty/suggestive." : "Keep it casual and professional."} ${t.imageUrl ? "The post includes an image - reference it naturally if relevant." : ""}

Write 2-4 sentences in your authentic voice:`, i = await queuedGenerateText(o, { temperature: 0.9, max_tokens: 150, stop: ["\n\n", "User:", "Assistant:"] }, `Regenerate Post - ${t.authorName || "Unknown"}`);
      if (!i || !i.trim()) throw new Error("Empty response from AI");
      t.content = i.trim(), t.regeneratedAt = Date.now(), showNotification("\u2705 Post regenerated", "success"), fg.activePostId === e && openPostModal(e), "social" === gameState.activeTab && renderSocialFeed(true);
    } catch (e2) {
      console.error("[RegeneratePost] Error:", e2), showNotification("\u274C Failed to regenerate post", "error");
    }
  } else console.error("[RegeneratePost] Employee not found");
}
async function deleteComment(e, t) {
  const n = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!n) return void console.error("[DeleteComment] Post not found");
  const a = n.comments.find((e2) => e2.id === t);
  if (!a) return void console.error("[DeleteComment] Comment not found");
  const o = "player" === a.authorId ? "You" : gameState.employees.find((e2) => e2.id === a.authorId)?.name || a.authorName, i = a.content.substring(0, 50), s = a.content.length > 50 ? "..." : "";
  if (!await Ev(`Delete comment by ${o}?

"${i}${s}"`, "Delete Comment", { type: "danger", confirmText: "Delete" })) return;
  const r = n.comments.findIndex((e2) => e2.id === t);
  if (r >= 0) {
    if (n.comments.splice(r, 1), showNotification("\u{1F5D1}\uFE0F Comment deleted", "info"), fg.activePostId === e) {
      Rg(e);
      const t2 = $("modalCommentCount");
      t2 && (t2.textContent = n.comments.length);
    }
    "social" === gameState.activeTab && renderSocialFeed(true);
  }
}
async function editComment(e, t) {
  const n = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!n) return void console.error("[EditComment] Post not found");
  const a = n.comments.find((e2) => e2.id === t);
  if (!a || "player" !== a.authorId) return void console.error("[EditComment] Comment not found or not owned by player");
  const o = await Iv("Edit your comment:", "Edit Comment", { defaultValue: a.content, multiline: true });
  null !== o && "" !== o.trim() && (a.content = o.trim(), a.editedAt = Date.now(), showNotification("\u270F\uFE0F Comment updated", "success"), fg.activePostId === e && Rg(e), "social" === gameState.activeTab && renderSocialFeed(true));
}
async function regenerateComment(e, t) {
  const n = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!n) return void console.error("[RegenerateComment] Post not found");
  const a = n.comments.find((e2) => e2.id === t);
  if (!a || "player" === a.authorId) return void console.error("[RegenerateComment] Comment not found or is player comment");
  const o = gameState.employees.find((e2) => e2.id === a.authorId);
  if (o) {
    showNotification("\u{1F504} Regenerating comment...", "info");
    try {
      const t2 = n.isPlayerPost ? "TheBoss" : gameState.employees.find((e2) => e2.id === n.authorId)?.name || n.authorName, i = `You are ${o.name}, commenting on ${t2}'s post: "${n.content}"

Generate a brief, natural comment (1-2 sentences) that ${o.name} would say. Be casual and authentic.`, s = await queuedGenerateText(i, { temperature: 0.9, max_tokens: 100, stop: ["\n\n", "User:", "Assistant:"] }, `Regenerate Comment - ${o.name}`);
      if (!s || !s.trim()) throw new Error("Empty response from AI");
      a.content = s.trim(), a.regeneratedAt = Date.now(), showNotification("\u2705 Comment regenerated", "success"), fg.activePostId === e && Rg(e), "social" === gameState.activeTab && renderSocialFeed(true);
    } catch (e2) {
      console.error("[RegenerateComment] Error:", e2), showNotification("\u274C Failed to regenerate comment", "error");
    }
  } else console.error("[RegenerateComment] Employee not found");
}
function voteOnPost(e, t) {
  const n = gameState.socialNetwork.posts.find((t2) => t2.id === e);
  if (!n || n.isPlayerPost) return;
  n.upvotes = n.upvotes || 0, n.downvotes = n.downvotes || 0;
  const a = n.playerVote;
  "up" === n.playerVote && (n.upvotes--, gameState.aiQuality.stats.upvotes--), "down" === n.playerVote && (n.downvotes--, gameState.aiQuality.stats.downvotes--), n.playerVote === t ? (n.playerVote = null, gameState.aiQuality.stats.totalVotes--) : (n.playerVote = t, "up" === t ? (n.upvotes++, gameState.aiQuality.stats.upvotes++, eh(n, "post"), showNotification("\u2705 Upvoted! AI will learn from this quality content", "success")) : (n.downvotes++, gameState.aiQuality.stats.downvotes++, nh(n, "post"), showNotification("\u274C Downvoted! AI will avoid this pattern", "warning")), a || (gameState.aiQuality.stats.totalVotes++, gameState.aiQuality.stats.postsVoted++), 1 !== gameState.aiQuality.stats.totalVotes || gameState.aiQuality.tutorialShown || rh()), ModalManager.isOpen("postModal") && fg.activePostId === e && _g(), renderSocialFeed(), saveGame();
}
function voteOnComment(e, t) {
  let n = null, a = null;
  for (const t2 of gameState.socialNetwork.posts) {
    const o2 = t2.comments?.find((t3) => t3.id === e);
    if (o2) {
      n = o2, a = t2;
      break;
    }
  }
  if (!n || n.isPlayerComment) return;
  n.upvotes = n.upvotes || 0, n.downvotes = n.downvotes || 0;
  const o = n.playerVote;
  if ("up" === n.playerVote && (n.upvotes--, gameState.aiQuality.stats.upvotes--), "down" === n.playerVote && (n.downvotes--, gameState.aiQuality.stats.downvotes--), n.playerVote === t ? (n.playerVote = null, gameState.aiQuality.stats.totalVotes--) : (n.playerVote = t, "up" === t ? (n.upvotes++, gameState.aiQuality.stats.upvotes++, eh(n, "comment"), showNotification("\u2705 Comment upvoted! AI will learn from this", "success")) : (n.downvotes++, gameState.aiQuality.stats.downvotes++, nh(n, "comment"), showNotification("\u274C Comment downvoted! AI will avoid this pattern", "warning")), o || (gameState.aiQuality.stats.totalVotes++, gameState.aiQuality.stats.commentsVoted++), 1 !== gameState.aiQuality.stats.totalVotes || gameState.aiQuality.tutorialShown || rh()), a) {
    const e2 = document.getElementById("postModal");
    if ("none" !== e2?.style.display) {
      const t2 = e2.querySelector("[data-post-id]")?.dataset.postId;
      t2 === a.id && Rg(a.id);
    }
  }
  saveGame();
}
function Zg(e, t, n) {
  const a = "string" == typeof e ? e : e?.id;
  if (!a) return;
  const o = (gameState.chatHistory[a] || [])[t];
  if (!o || o.isPlayer) return;
  o.upvotes = o.upvotes || 0, o.downvotes = o.downvotes || 0;
  const i = o.playerVote;
  "up" === o.playerVote && (o.upvotes--, gameState.aiQuality.stats.upvotes--), "down" === o.playerVote && (o.downvotes--, gameState.aiQuality.stats.downvotes--), o.playerVote === n ? (o.playerVote = null, gameState.aiQuality.stats.totalVotes--) : (o.playerVote = n, "up" === n ? (o.upvotes++, gameState.aiQuality.stats.upvotes++, eh({ content: o.content, id: `chat_${a}_${t}`, authorId: a }, "chat"), showNotification("\u2705 Chat upvoted! AI will learn from this", "success")) : (o.downvotes++, gameState.aiQuality.stats.downvotes++, nh({ content: o.content, id: `chat_${a}_${t}` }, "chat"), showNotification("\u274C Chat downvoted! AI will avoid this pattern", "warning")), i || (gameState.aiQuality.stats.totalVotes++, gameState.aiQuality.stats.chatsVoted++), 1 !== gameState.aiQuality.stats.totalVotes || gameState.aiQuality.tutorialShown || rh()), loadChatHistory(a), saveGame();
}
function eh(e, t) {
  const n = { content: "post" === t ? e.content : e.text || e.content, type: "post" === t ? e.type : t, authorPersonality: "post" === t && e.authorId ? ih(e.authorId) : null, timestamp: gameState.time?.currentTime || Date.now(), id: e.id };
  gameState.aiQuality.goodExamples["post" === t ? "posts" : "comment" === t ? "comments" : "chats"].unshift(n);
  const a = gameState.aiQuality.maxExamplesPerType;
  gameState.aiQuality.goodExamples.posts.length > a && gameState.aiQuality.goodExamples.posts.pop(), gameState.aiQuality.goodExamples.comments.length > a && gameState.aiQuality.goodExamples.comments.pop(), gameState.aiQuality.goodExamples.chats.length > a && gameState.aiQuality.goodExamples.chats.pop();
}
function nh(e, t) {
  const n = "post" === t ? e.content : e.text || e.content, a = { content: n, type: "post" === t ? e.type : t, timestamp: gameState.time?.currentTime || Date.now(), id: e.id };
  gameState.aiQuality.badExamples["post" === t ? "posts" : "comment" === t ? "comments" : "chats"].unshift(a);
  const o = gameState.aiQuality.maxExamplesPerType;
  gameState.aiQuality.badExamples.posts.length > o && gameState.aiQuality.badExamples.posts.pop(), gameState.aiQuality.badExamples.comments.length > o && gameState.aiQuality.badExamples.comments.pop(), gameState.aiQuality.badExamples.chats.length > o && gameState.aiQuality.badExamples.chats.pop(), ah(n).forEach((e2) => {
    gameState.aiQuality.bannedPatterns.includes(e2) || (gameState.aiQuality.bannedPatterns.push(e2), console.log(`[AI Training] Learned to ban pattern: "${e2}"`));
  });
}
