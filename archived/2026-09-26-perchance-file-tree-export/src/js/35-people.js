// ============================================================================
// 35-people — People tab: relationship distance, employee list, sorting, updatePeopleTab.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function cu(e) {
  if (!e || !e.stats) return "distant";
  const t = ((e.stats.affection || 0) + (e.stats.trust || 0) + (e.stats.comfort || 0)) / 3;
  return t >= 80 ? "very close" : t >= 60 ? "close" : t >= 40 ? "friendly" : t >= 20 ? "professional" : "distant";
}
function du(e) {
  if (!e || !e.career) return 0.3;
  let t = 0.3;
  const n = Math.max(0, 0.05 * (e.career.level - 2));
  return t += Math.min(0.25, n), t += { "very close": 0.2, close: 0.15, friendly: 0.1, professional: 0.05, distant: 0 }[cu(e)] || 0, Math.min(0.5, t);
}
async function uu(e, t) {
  if (!e || !gameState.socialNetwork) return;
  const n = gameState.hierarchyLevels[t];
  if (!n) return;
  const a = `${Er(e, "social.post", { message: `Posting about being promoted to ${n.title}`, involves: ["player", "work", "promotion"], keywords: ["promotion", "career", n.title, e.fastTrack ? "fast-track" : "achievement"] })}

SITUATION: You just got promoted to ${n.title}!
${e.fastTrack ? "You were FAST-TRACKED - this is a rapid promotion!" : ""}

Write a social media post announcing your promotion.

INSTRUCTIONS:
1. Keep it 1-2 sentences
2. Be excited but professional
3. Use 1-2 emojis naturally
4. Thank @TheBoss
5. ${e.fastTrack ? "Mention the fast-track momentum!" : "Show you're proud of the achievement"}

EXAMPLES:
- "\u{1F389} Thrilled to announce my promotion to ${n.title}! Thank you @TheBoss for believing in me! \u{1F4BC}"
- "${e.fastTrack ? "\u{1F680} Fast-tracked to " : ""}Officially a ${n.title} now! Grateful for this opportunity @TheBoss \u2728"

Write the post:`;
  let o = `\u{1F389} Excited to announce that I've been promoted to ${n.title}! ${e.fastTrack ? "\u{1F680} Fast-tracked and loving the momentum! " : ""}Thank you @TheBoss for this opportunity! \u{1F4BC}\u2728`;
  try {
    const t2 = await queuedGenerateText(a, { temperature: 0.8, max_tokens: 60 }, `Promotion Post - ${e.name}`);
    t2 && t2.trim() && (o = t2.trim());
  } catch (e2) {
    console.warn("[Promotion Post] AI generation failed, using default caption:", e2);
  }
  const i = { id: `post_${++gameState.socialNetwork.postIdCounter}_${Date.now()}`, author: e.name, authorId: e.id, type: "work", category: "work", timestamp: gameState.time?.currentTime || Date.now(), contentType: "text", caption: o, likes: Math.floor(20 * Math.random()) + 10, comments: [], imageUrl: null, altText: null, hasImage: false, explicit: false };
  gameState.socialNetwork.posts.unshift(i), Fo(), gameState.socialNetwork.posts.length > CAPS.SOCIAL_POSTS && (gameState.socialNetwork.posts = gameState.socialNetwork.posts.slice(0, CAPS.SOCIAL_POSTS)), console.log(`[Promotion Post] Generated post for ${e.name}'s promotion to Level ${t}`);
}
function pu(e) {
  const t = gameState.chatHistory[e];
  if (!t || 0 === t.length) return 0;
  let n = 0;
  for (const e2 of t) {
    if (e2.isPlayer) continue;
    let t2 = 0;
    e2.timestamp && (t2 = "number" == typeof e2.timestamp ? e2.timestamp : e2.timestamp.getTime()), t2 > n && (n = t2);
  }
  if (0 === n && t.length > 0) {
    for (const e2 of t) if (!e2.isPlayer && (e2.proactive || e2.isMoneyRequest || e2.imageUrl || "You" !== e2.sender)) {
      let t2 = 0;
      e2.timestamp && (t2 = "number" == typeof e2.timestamp ? e2.timestamp : e2.timestamp.getTime()), t2 > n && (n = t2);
    }
  }
  return n;
}
function mu() {
  const e = gameState.peopleSorting, t = gameState.employees.filter((t2) => e.showAlumni ? "active" !== t2.employmentStatus : "active" === t2.employmentStatus), n = t.every((t2) => e.collapsedCards.includes(t2.id));
  e.collapsedCards = n ? [] : t.map((e2) => e2.id), updatePeopleTab();
}
function gu(e) {
  const t = gameState.peopleSorting.collapsedCards, n = t.indexOf(e);
  -1 === n ? t.push(e) : t.splice(n, 1);
  const a = document.querySelector(`[data-collapse-id="${e}"]`);
  if (a) {
    const e2 = a.closest(".employee-card").querySelector(".card-body"), t2 = -1 === n;
    e2 && (e2.style.display = t2 ? "none" : ""), a.textContent = t2 ? "\u25B6" : "\u25BC", a.title = t2 ? "Expand" : "Collapse";
  }
}
function hu() {
  const e = gameState.peopleSorting && gameState.peopleSorting.fieldVisibility, t = gameState.peopleSorting && gameState.peopleSorting.visibleStats;
  e && t && (["bio", "demographics", "stats", "career", "flags", "skills", "relationships", "actions"].forEach((t2) => {
    const n = document.getElementById(`fv_${t2}`);
    n && (n.checked = !!e[t2]);
  }), ["affection", "comfort", "trust", "desire", "obedience", "productivity"].forEach((e2) => {
    const n = document.getElementById(`vs_${e2}`);
    n && (n.checked = !!t[e2]);
  }));
}
function updatePeopleTab() {
  if (!employeesList) return;
  employeesList.innerHTML = "", gameState.peopleSorting || (gameState.peopleSorting = { sortBy: "recentMessages", showFavoritesOnly: false, showAlumni: false }), void 0 === gameState.peopleSorting.showAlumni && (gameState.peopleSorting.showAlumni = false), void 0 === gameState.peopleSorting.searchText && (gameState.peopleSorting.searchText = ""), void 0 === gameState.peopleSorting.filterDept && (gameState.peopleSorting.filterDept = "all"), void 0 === gameState.peopleSorting.filterLevel && (gameState.peopleSorting.filterLevel = "all"), void 0 === gameState.peopleSorting.viewMode && (gameState.peopleSorting.viewMode = "list"), gameState.peopleSorting.collapsedCards || (gameState.peopleSorting.collapsedCards = []), gameState.peopleSorting.fieldVisibility || (gameState.peopleSorting.fieldVisibility = { bio: true, demographics: true, stats: true, career: true, flags: true, skills: true, relationships: true, actions: true }), gameState.peopleSorting.visibleStats || (gameState.peopleSorting.visibleStats = { affection: true, comfort: true, trust: true, desire: true, obedience: true, productivity: true });
  const e = $("employeeCount"), t = gameState.employees.filter((e2) => "active" === e2.employmentStatus), n = gameState.employees.filter((e2) => "active" !== e2.employmentStatus);
  e && (gameState.peopleSorting.showAlumni ? e.textContent = `${n.length} alumni` : e.textContent = `${t.length} employee${1 !== t.length ? "s" : ""}`);
  for (const e2 of gameState.onboarding) {
    const t2 = document.createElement("div");
    t2.className = "employee-card", t2.style.cssText = "background:var(--h); border-radius:10px; padding:15px; box-shadow:0 4px 10px var(--bd); position:relative;", t2.innerHTML = ` <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;"> <div style="width:44px; height:44px; border-radius:50%; background:var(--f); display:flex; align-items:center; justify-content:center;">\u23F3</div> <div style="flex:1;"> <h3 style="margin:0 0 2px 0;">${yl(e2)}</h3> <p style="margin:0; color:var(--a); font-size:.9rem;">${e2.position}</p> <span style="display:inline-block; margin-top:6px; padding:3px 8px; font-size:.75rem; border-radius:999px; background:var(--f); color:var(--b);">Onboarding\u2026</span> </div> </div> <button onclick="resetOnboarding('${e2.id}')" style="width:100%; padding:8px; background:#ff6b00; border:none; border-radius:6px; color:var(--q); cursor:pointer; font-size:.85rem; font-weight:600; margin-top:8px;"> \u{1F504} Reset Onboarding (Emergency) </button> `, employeesList.appendChild(t2);
  }
  let a;
  a = gameState.peopleSorting.showAlumni ? gameState.employees.filter((e2) => "active" !== e2.employmentStatus) : gameState.employees.filter((e2) => "active" === e2.employmentStatus), gameState.peopleSorting.showFavoritesOnly && (a = a.filter((e2) => e2.isFavorite));
  const o = document.getElementById("peopleDeptFilter");
  if (o) {
    const e2 = [...new Set(a.map((e3) => e3.locationId).filter(Boolean))].sort(), t2 = gameState.peopleSorting.filterDept || "all";
    o.innerHTML = '<option value="all">\u{1F3E2} All Departments</option>' + e2.map((e3) => {
      const n2 = e3.replace(/_/g, " ").replace(/\b\w/g, (e4) => e4.toUpperCase());
      return `<option value="${e3}"${t2 === e3 ? " selected" : ""}>${n2}</option>`;
    }).join("");
  }
  const i = (gameState.peopleSorting.searchText || "").toLowerCase().trim();
  i && (a = a.filter((e2) => e2.name.toLowerCase().includes(i)));
  const s = gameState.peopleSorting.filterDept || "all";
  "all" !== s && (a = a.filter((e2) => e2.locationId === s));
  const r = gameState.peopleSorting.filterLevel || "all";
  "all" !== r && (a = a.filter((e2) => String(e2.career && e2.career.level) === r));
  const l = gameState.peopleSorting.sortBy, c = a.filter((e2) => e2.isFavorite), d = a.filter((e2) => !e2.isFavorite), p = (e2) => {
    switch (l) {
      case "oldest":
        return e2.sort((e3, t2) => (e3.hireDate || 0) - (t2.hireDate || 0));
      case "newest":
        return e2.sort((e3, t2) => (t2.hireDate || 0) - (e3.hireDate || 0));
      case "recentMessages":
        return e2.sort((e3, t2) => {
          const n2 = pu(e3.id);
          return pu(t2.id) - n2;
        });
      case "relationshipHigh":
        return e2.sort((e3, t2) => {
          const n2 = yd(e3);
          return yd(t2) - n2;
        });
      case "relationshipLow":
        return e2.sort((e3, t2) => yd(e3) - yd(t2));
      case "location":
        return e2.sort((e3, t2) => {
          const n2 = e3.locationId || "", a2 = t2.locationId || "";
          return n2.localeCompare(a2);
        });
      case "name":
        return e2.sort((e3, t2) => e3.name.localeCompare(t2.name));
      case "careerHigh":
        return e2.sort((e3, t2) => (t2.career && t2.career.level || 0) - (e3.career && e3.career.level || 0));
      case "careerLow":
        return e2.sort((e3, t2) => (e3.career && e3.career.level || 0) - (t2.career && t2.career.level || 0));
      case "salaryHigh":
        return e2.sort((e3, t2) => (t2.career && t2.career.salary || 0) - (e3.career && e3.career.salary || 0));
      case "salaryLow":
        return e2.sort((e3, t2) => (e3.career && e3.career.salary || 0) - (t2.career && t2.career.salary || 0));
      case "productivityHigh":
        return e2.sort((e3, t2) => (t2.stats && t2.stats.productivity || 0) - (e3.stats && e3.stats.productivity || 0));
      default:
        return e2;
    }
  };
  p(c), p(d);
  const m = [...c, ...d], u2 = gameState.peopleSorting.viewMode || "list";
  employeesList.className = "cards" === u2 ? "emp-grid" : "roster", gameState.peopleSorting.showAlumni && m.length && employeesList.insertAdjacentHTML("beforeend", '<div class="band-h mt-2" style="grid-column:1/-1"><span>Alumni</span><span class="grow"></span></div>');
  const G2 = m.map((e2) => {
    const G3 = "active" !== e2.employmentStatus, U3 = Math.max(1, Math.min(7, Math.floor(e2.career && e2.career.level || 1))), li = gameState.hierarchyLevels && gameState.hierarchyLevels[U3] || { title: "Staff", color: "var(--g)" }, J3 = li.color || "var(--g)", ee3 = ((gameState.locations || []).find((L) => L.id === e2.locationId) || {}).name || "", sub = `${li.title || "Staff"}${ee3 ? " \xB7 " + ee3 : ""}`, initial = (e2.name || "?").trim().charAt(0).toUpperCase(), avatar = e2.profileImage ? `<img class="avatar-sm" src="${e2.profileImage}" onclick="openUnifiedProfile('${e2.id}','overview')">` : `<div class="avatar-sm init" style="--cr:${J3}" onclick="openUnifiedProfile('${e2.id}','overview')">${initial}</div>`, prod = e2.stats && "number" == typeof e2.stats.productivity ? Math.round(e2.stats.productivity) : null, te3 = null !== prod ? `\u26A1 <span class="num">${prod}%</span>` : `\u2665 <span class="num">${Math.round(yd(e2))}%</span>`, ne3 = e2.unreadMessages > 0 ? `<span class="unread-dot">${e2.unreadMessages > 9 ? "9+" : e2.unreadMessages}</span>` : "", oe3 = !G3 && e2.npcStatus ? va(e2, { size: "sm" }) : "", ae3 = `<button class="employee-action-btn icon-btn" style="--ic:var(--k)" data-employee="${e2.id}" data-action="chat" title="Chat">\u{1F4AC}</button>`, ovf = `<span class="ovf-wrap"><button class="icon-btn ovf-btn" data-emp="${e2.id}" title="More actions">\u22EF</button><div class="row-menu" hidden><button class="employee-action-btn btn btn--aj" data-employee="${e2.id}" data-action="export-character">\u{1F4E4} Export</button><button class="employee-action-btn btn btn--aj" data-employee="${e2.id}" data-action="review">\u{1F4CA} Review</button><button class="employee-action-btn btn btn--aj" data-employee="${e2.id}" data-action="promote">\u2B06\uFE0F Promote</button><button class="employee-action-btn btn btn--aj" data-employee="${e2.id}" data-action="fire">\u{1F5D1}\uFE0F Fire</button></div></span>`;
    if ("cards" === u2) return `<div class="emp-card${G3 ? " is-alumni" : ""}"> <div class="row-between"> ${avatar} <button class="icon-btn" style="--ic:${e2.isFavorite ? "var(--m)" : "var(--e)"}" title="${e2.isFavorite ? "Remove favorite" : "Add favorite"}" onclick="toggleEmployeeFavorite('${e2.id}')">${e2.isFavorite ? "\u2B50" : "\u2606"}</button> </div> <div onclick="openUnifiedProfile('${e2.id}','overview')" style="cursor:pointer"> <div class="fw-600">${yl(e2)}${e2.age ? ", " + e2.age : ""}</div> <div class="text-dim fs-xs">${sub}</div> </div> <div class="row wrap" style="gap:var(--s2)"> <span class="lvl-chip" style="--cr:${J3}">Lv ${U3}</span> <span>${te3}</span> ${ne3}${oe3}${Ld(e2)} </div> <div class="row" style="gap:var(--s1)">${ae3}${ovf}</div> </div>`;
    const ie2 = [];
    e2.isFavorite && ie2.push('<span class="text-gold" title="Favorited">\u2B50</span>'), oe3 && ie2.push(oe3);
    const se2 = `<div class="chat-wrap"><button class="employee-action-btn icon-btn" style="--ic:var(--k)" data-employee="${e2.id}" data-action="chat" title="Chat">\u{1F4AC}</button>${e2.unreadMessages > 0 ? `<span class="chat-badge num">${e2.unreadMessages > 9 ? "9+" : e2.unreadMessages}</span>` : ""}</div>`, le2 = `<button class="btn btn--aj" title="${e2.isFavorite ? "Unfavorite" : "Favorite"}" onclick="toggleEmployeeFavorite('${e2.id}')">${e2.isFavorite ? "\u2B50 Unfavorite" : "\u2606 Favorite"}</button>`, ce2 = `<span class="ovf-wrap"><button class="icon-btn ovf-btn" data-emp="${e2.id}" title="More actions">\u22EF</button><div class="row-menu" hidden>${le2}<button class="employee-action-btn btn btn--aj" data-employee="${e2.id}" data-action="export-character">\u{1F4E4} Export</button><button class="employee-action-btn btn btn--aj" data-employee="${e2.id}" data-action="review">\u{1F4CA} Review</button><button class="employee-action-btn btn btn--aj" data-employee="${e2.id}" data-action="promote">\u2B06\uFE0F Promote</button><button class="employee-action-btn btn btn--aj" data-employee="${e2.id}" data-action="fire">\u{1F5D1}\uFE0F Fire</button></div></span>`;
    return `<div class="roster-row${G3 ? " is-alumni" : ""}">
            ${avatar} <div class="who" onclick="openUnifiedProfile('${e2.id}','overview')"> <span class="nm-line"><span class="nm">${yl(e2)}${e2.age ? ", " + e2.age : ""}</span><span class="lvl-chip" style="--cr:${J3}">Lv ${U3}</span>${e2.isFavorite ? '<span class="text-gold rost-fav" title="Favorited">\u2B50</span>' : ""}</span> <span class="sub">${sub}</span> </div> <div class="rost-prod">${te3}</div> <div class="status-col"> <span class="chip-slot">${Ld(e2)}</span> <span class="status-slot">${oe3}</span> </div> <span class="acts">${se2}${ce2}</span> </div>`;
  }).join("");
  employeesList.insertAdjacentHTML("beforeend", G2), employeesList.querySelectorAll(".ovf-btn").forEach((btn) => {
    btn.onclick = (u3) => {
      u3.stopPropagation();
      const menu = btn.parentElement.querySelector(".row-menu"), G3 = !menu.hasAttribute("hidden");
      employeesList.querySelectorAll(".row-menu").forEach((u4) => u4.setAttribute("hidden", "")), G3 || menu.removeAttribute("hidden");
    };
  });
  const U2 = document.getElementById("peopleTab");
  U2 && !U2._menuCloserAdded && (U2._menuCloserAdded = true, document.addEventListener("click", (u3) => {
    u3.target.closest && u3.target.closest(".ovf-wrap") || document.querySelectorAll("#employeesList .row-menu").forEach((u4) => u4.setAttribute("hidden", ""));
  })), document.querySelectorAll(".employee-action-btn").forEach((e2) => {
    e2.onclick = () => handleEmployeeAction(e2.dataset.employee, e2.dataset.action);
  });
  const J2 = document.getElementById("rosterViewToggle");
  J2 && J2.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.view === u2), btn.onclick = () => {
      gameState.peopleSorting.viewMode = btn.dataset.view, updatePeopleTab(), saveGame();
    };
  });
  const ee2 = document.getElementById("peopleSortSelect");
  ee2 && (ee2.value = gameState.peopleSorting.sortBy, ee2.onchange = (e2) => {
    gameState.peopleSorting.sortBy = e2.target.value, updatePeopleTab(), saveGame();
  });
  const g = document.getElementById("toggleFavoritesOnly");
  g && (g.textContent = gameState.peopleSorting.showFavoritesOnly ? "\u2B50 Show All" : "\u2B50 Show Favorites Only", g.style.background = gameState.peopleSorting.showFavoritesOnly ? "var(--z)" : "var(--at)", g.style.color = gameState.peopleSorting.showFavoritesOnly ? "var(--ae)" : "var(--b)", g.onclick = () => {
    gameState.peopleSorting.showFavoritesOnly = !gameState.peopleSorting.showFavoritesOnly, updatePeopleTab(), saveGame();
  });
  const h = document.getElementById("toggleAlumni");
  if (h) {
    const e2 = gameState.peopleSorting.showAlumni;
    h.textContent = e2 ? "\u{1F464} Show Active" : "\u{1F464} Show Alumni", h.style.background = e2 ? "var(--as)" : "var(--t)", h.style.borderColor = e2 ? "var(--ar)" : "var(--aw)", h.style.color = e2 ? "var(--s)" : "var(--aw)", h.onclick = () => {
      gameState.peopleSorting.showAlumni = !gameState.peopleSorting.showAlumni, updatePeopleTab(), saveGame();
    };
  }
  const y = document.getElementById("peopleSearchInput");
  y && (y.value = gameState.peopleSorting.searchText || "", y.oninput = (e2) => {
    gameState.peopleSorting.searchText = e2.target.value, updatePeopleTab();
  });
  const te2 = document.getElementById("programsToggle"), ne2 = document.getElementById("programsBody");
  if (te2 && ne2) {
    const open = "1" === localStorage.getItem("fuoc_programs_open");
    ne2.hidden = !open, te2.textContent = open ? "\u25B4" : "\u25BE", open && renderProgramsCard(), te2.onclick = () => {
      const u3 = ne2.hidden;
      ne2.hidden = !u3, te2.textContent = u3 ? "\u25B4" : "\u25BE", localStorage.setItem("fuoc_programs_open", u3 ? "1" : "0"), u3 && renderProgramsCard();
    };
  }
  const oe2 = document.getElementById("peopleFiltersToggle"), ae2 = document.getElementById("peopleFiltersPanel");
  if (oe2 && ae2) {
    const u3 = "1" === localStorage.getItem("fuoc_filters_open");
    ae2.hidden = !u3, oe2.textContent = u3 ? "Filters \u25B4" : "Filters \u25BE", oe2.onclick = () => {
      const u4 = ae2.hidden;
      ae2.hidden = !u4, oe2.textContent = u4 ? "Filters \u25B4" : "Filters \u25BE", localStorage.setItem("fuoc_filters_open", u4 ? "1" : "0");
    };
  }
  const f = document.getElementById("peopleDeptFilter");
  f && (f.onchange = (e2) => {
    gameState.peopleSorting.filterDept = e2.target.value, updatePeopleTab(), saveGame();
  });
  const b = document.getElementById("peopleLevelFilter");
  b && (b.value = gameState.peopleSorting.filterLevel || "all", b.onchange = (e2) => {
    gameState.peopleSorting.filterLevel = e2.target.value, updatePeopleTab(), saveGame();
  });
  const v = document.getElementById("collapseAllCards");
  if (v) {
    const e2 = m.map((e3) => e3.id), t2 = e2.length > 0 && e2.every((e3) => gameState.peopleSorting.collapsedCards.includes(e3));
    v.textContent = t2 ? "\u25BC Expand All" : "\u25B6 Collapse All", v.style.color = t2 ? "var(--u)" : "var(--ar)", v.style.borderColor = t2 ? "var(--u)" : "var(--aw)", v.onclick = () => {
      mu();
    };
  }
  const w = document.getElementById("toggleFieldsPanel");
  w && (w.onclick = () => {
    const e2 = document.getElementById("fieldVisibilityPanel");
    if (!e2) return;
    const t2 = "none" !== e2.style.display;
    e2.style.display = t2 ? "none" : "block", w.style.background = t2 ? "var(--at)" : "#7b4fa8", t2 || hu();
  }), ["bio", "demographics", "stats", "career", "flags", "skills", "relationships", "actions"].forEach((e2) => {
    const t2 = document.getElementById(`fv_${e2}`);
    t2 && (t2.checked = !(!gameState.peopleSorting.fieldVisibility || !gameState.peopleSorting.fieldVisibility[e2]), t2.onchange = (t3) => {
      gameState.peopleSorting.fieldVisibility[e2] = t3.target.checked, updatePeopleTab(), saveGame();
    });
  }), ["affection", "comfort", "trust", "desire", "obedience", "productivity"].forEach((e2) => {
    const t2 = document.getElementById(`vs_${e2}`);
    t2 && (t2.checked = !(!gameState.peopleSorting.visibleStats || !gameState.peopleSorting.visibleStats[e2]), t2.onchange = (t3) => {
      gameState.peopleSorting.visibleStats[e2] = t3.target.checked, updatePeopleTab(), saveGame();
    });
  });
  const x = document.getElementById("resetFieldDefaults");
  x && (x.onclick = () => {
    gameState.peopleSorting.fieldVisibility = { bio: true, demographics: true, stats: true, career: true, flags: true, skills: true, relationships: true, actions: true }, gameState.peopleSorting.visibleStats = { affection: true, comfort: true, trust: true, desire: true, obedience: true, productivity: true }, hu(), updatePeopleTab(), saveGame();
  });
}
