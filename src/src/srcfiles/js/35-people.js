// ============================================================================
// 35-people — People tab: relationship distance, employee list, sorting, updatePeopleTab.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function calculateRelationshipStrength(e) {
    if (!e || !e.stats) return "distant";
    const t = ((e.stats.affection || 0) + (e.stats.trust || 0) + (e.stats.comfort || 0)) / 3;
    return t >= 80 ? "very close" : t >= 60 ? "close" : t >= 40 ? "friendly" : t >= 20 ? "professional" : "distant";
}
function calculateRehireBonus(e) {
    if (!e || !e.career) return 0.3;
    let t = 0.3;
    const n = Math.max(0, 0.05 * (e.career.level - 2));
    t += Math.min(0.25, n);
    return (
        (t +=
            { "very close": 0.2, close: 0.15, friendly: 0.1, professional: 0.05, distant: 0 }[
                calculateRelationshipStrength(e)
            ] || 0),
        Math.min(0.5, t)
    );
}
async function generatePromotionPost(e, t) {
    if (!e || !gameState.socialNetwork) return;
    const n = gameState.hierarchyLevels[t];
    if (!n) return;
    const a = `${getIntelligentContext(e, "social.post", { message: `Posting about being promoted to ${n.title}`, involves: ["player", "work", "promotion"], keywords: ["promotion", "career", n.title, e.fastTrack ? "fast-track" : "achievement"] })}\n\nSITUATION: You just got promoted to ${n.title}!\n${e.fastTrack ? "You were FAST-TRACKED - this is a rapid promotion!" : ""}\n\nWrite a social media post announcing your promotion.\n\nINSTRUCTIONS:\n1. Keep it 1-2 sentences\n2. Be excited but professional\n3. Use 1-2 emojis naturally\n4. Thank @TheBoss\n5. ${e.fastTrack ? "Mention the fast-track momentum!" : "Show you're proud of the achievement"}\n\nEXAMPLES:\n- "🎉 Thrilled to announce my promotion to ${n.title}! Thank you @TheBoss for believing in me! 💼"\n- "${e.fastTrack ? "🚀 Fast-tracked to " : ""}Officially a ${n.title} now! Grateful for this opportunity @TheBoss ✨"\n\nWrite the post:`;
    let o = `🎉 Excited to announce that I've been promoted to ${n.title}! ${e.fastTrack ? "🚀 Fast-tracked and loving the momentum! " : ""}Thank you @TheBoss for this opportunity! 💼✨`;
    try {
        const t = await queuedGenerateText(a, { temperature: 0.8, max_tokens: 60 }, `Promotion Post - ${e.name}`);
        t && t.trim() && (o = t.trim());
    } catch (e) {
        console.warn("[Promotion Post] AI generation failed, using default caption:", e);
    }
    const i = {
        id: `post_${++gameState.socialNetwork.postIdCounter}_${Date.now()}`,
        author: e.name,
        authorId: e.id,
        type: "work",
        category: "work",
        timestamp: gameState.time?.currentTime || Date.now(),
        contentType: "text",
        caption: o,
        likes: Math.floor(20 * Math.random()) + 10,
        comments: [],
        imageUrl: null,
        altText: null,
        hasImage: !1,
        explicit: !1,
    };
    gameState.socialNetwork.posts.unshift(i),
        salvagePrunedPostImages(),
        gameState.socialNetwork.posts.length > CAPS.SOCIAL_POSTS &&
            (gameState.socialNetwork.posts = gameState.socialNetwork.posts.slice(0, CAPS.SOCIAL_POSTS)),
        console.log(`[Promotion Post] Generated post for ${e.name}'s promotion to Level ${t}`);
}
function getLastMessageTimestamp(e) {
    const t = gameState.chatHistory[e];
    if (!t || 0 === t.length) return 0;
    let n = 0;
    for (const e of t) {
        if (e.isPlayer) continue;
        let t = 0;
        e.timestamp && (t = "number" == typeof e.timestamp ? e.timestamp : e.timestamp.getTime()), t > n && (n = t);
    }
    if (0 === n && t.length > 0)
        for (const e of t)
            if (!e.isPlayer && (e.proactive || e.isMoneyRequest || e.imageUrl || "You" !== e.sender)) {
                let t = 0;
                e.timestamp && (t = "number" == typeof e.timestamp ? e.timestamp : e.timestamp.getTime()),
                    t > n && (n = t);
            }
    return n;
}
function collapseAllEmployeeCards() {
    const e = gameState.peopleSorting,
        t = gameState.employees.filter((t) =>
            e.showAlumni ? "active" !== t.employmentStatus : "active" === t.employmentStatus
        ),
        n = t.every((t) => e.collapsedCards.includes(t.id));
    (e.collapsedCards = n ? [] : t.map((e) => e.id)), updatePeopleTab();
}
function toggleCardCollapse(e) {
    const t = gameState.peopleSorting.collapsedCards,
        n = t.indexOf(e);
    -1 === n ? t.push(e) : t.splice(n, 1);
    const a = document.querySelector(`[data-collapse-id="${e}"]`);
    if (a) {
        const e = a.closest(".employee-card").querySelector(".card-body"),
            t = -1 === n;
        e && (e.style.display = t ? "none" : ""),
            (a.textContent = t ? "▶" : "▼"),
            (a.title = t ? "Expand" : "Collapse");
    }
}
function syncFieldCheckboxes() {
    const e = gameState.peopleSorting && gameState.peopleSorting.fieldVisibility,
        t = gameState.peopleSorting && gameState.peopleSorting.visibleStats;
    e &&
        t &&
        (["bio", "demographics", "stats", "career", "flags", "skills", "relationships", "actions"].forEach((t) => {
            const n = document.getElementById(`fv_${t}`);
            n && (n.checked = !!e[t]);
        }),
        ["affection", "comfort", "trust", "desire", "obedience", "productivity"].forEach((e) => {
            const n = document.getElementById(`vs_${e}`);
            n && (n.checked = !!t[e]);
        }));
}
function updatePeopleTab() {
    if (!employeesList) return;
    (employeesList.innerHTML = ""),
        gameState.peopleSorting ||
            (gameState.peopleSorting = { sortBy: "recentMessages", showFavoritesOnly: !1, showAlumni: !1 }),
        void 0 === gameState.peopleSorting.showAlumni && (gameState.peopleSorting.showAlumni = !1),
        void 0 === gameState.peopleSorting.searchText && (gameState.peopleSorting.searchText = ""),
        void 0 === gameState.peopleSorting.filterDept && (gameState.peopleSorting.filterDept = "all"),
        void 0 === gameState.peopleSorting.filterLevel && (gameState.peopleSorting.filterLevel = "all"),
        void 0 === gameState.peopleSorting.viewMode && (gameState.peopleSorting.viewMode = "list"),
        gameState.peopleSorting.collapsedCards || (gameState.peopleSorting.collapsedCards = []),
        gameState.peopleSorting.fieldVisibility ||
            (gameState.peopleSorting.fieldVisibility = {
                bio: !0,
                demographics: !0,
                stats: !0,
                career: !0,
                flags: !0,
                skills: !0,
                relationships: !0,
                actions: !0,
            }),
        gameState.peopleSorting.visibleStats ||
            (gameState.peopleSorting.visibleStats = {
                affection: !0,
                comfort: !0,
                trust: !0,
                desire: !0,
                obedience: !0,
                productivity: !0,
            });
    const e = $("employeeCount"),
        t = gameState.employees.filter((e) => "active" === e.employmentStatus),
        n = gameState.employees.filter((e) => "active" !== e.employmentStatus);
    e &&
        (gameState.peopleSorting.showAlumni
            ? (e.textContent = `${n.length} alumni`)
            : (e.textContent = `${t.length} employee${1 !== t.length ? "s" : ""}`));
    for (const e of gameState.onboarding) {
        const t = document.createElement("div");
        (t.className = "employee-card"),
            (t.style.cssText =
                "background:var(--surface); border-radius:10px; padding:15px; box-shadow:0 4px 10px var(--l-veil-20); position:relative;"),
            (t.innerHTML = `\n        <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">\n            <div style="width:44px; height:44px; border-radius:50%; background:var(--surface-2); display:flex; align-items:center; justify-content:center;">⏳</div>\n            <div style="flex:1;">\n            <h3 style="margin:0 0 2px 0;">${getColoredName(e)}</h3>\n            <p style="margin:0; color:var(--text-dim); font-size:.9rem;">${e.position}</p>\n            <span style="display:inline-block; margin-top:6px; padding:3px 8px; font-size:.75rem; border-radius:999px; background:var(--surface-2); color:var(--l-ink);">Onboarding…</span>\n            </div>\n        </div>\n        <button onclick="resetOnboarding('${e.id}')" style="width:100%; padding:8px; background:#ff6b00; border:none; border-radius:6px; color:var(--l-on-accent); cursor:pointer; font-size:.85rem; font-weight:600; margin-top:8px;">\n            🔄 Reset Onboarding (Emergency)\n        </button>\n        `),
            employeesList.appendChild(t);
    }
    let a;
    (a = gameState.peopleSorting.showAlumni
        ? gameState.employees.filter((e) => "active" !== e.employmentStatus)
        : gameState.employees.filter((e) => "active" === e.employmentStatus)),
        gameState.peopleSorting.showFavoritesOnly && (a = a.filter((e) => e.isFavorite));
    const o = document.getElementById("peopleDeptFilter");
    if (o) {
        // Every site you've opened, in game order — not just sites someone already works at
        // (a new factory used to be missing until you hired straight into it) — plus any
        // other id still on the listed people (e.g. alumni from a site since sold).
        const known = (gameState.locations || []).filter((l) => l.unlocked || l.owned),
            extra = [...new Set(a.map((e) => e.locationId).filter(Boolean))].filter((id) => !known.some((l) => l.id === id)),
            t = gameState.peopleSorting.filterDept || "all",
            label = (id) => known.find((l) => l.id === id)?.name || id.replace(/_/g, " ").replace(/\b\w/g, (e) => e.toUpperCase()),
            count = (id) => a.filter((e) => e.locationId === id).length;
        o.innerHTML =
            '<option value="all">🏢 All Locations</option>' +
            [...known.map((l) => l.id), ...extra]
                .map((id) => `<option value="${id}"${t === id ? " selected" : ""}>${label(id)} (${count(id)})</option>`)
                .join("");
    }
    const i = (gameState.peopleSorting.searchText || "").toLowerCase().trim();
    i && (a = a.filter((e) => e.name.toLowerCase().includes(i)));
    const s = gameState.peopleSorting.filterDept || "all";
    "all" !== s && (a = a.filter((e) => e.locationId === s));
    const r = gameState.peopleSorting.filterLevel || "all";
    "all" !== r && (a = a.filter((e) => String(e.career && e.career.level) === r));
    const l = gameState.peopleSorting.sortBy,
        c = a.filter((e) => e.isFavorite),
        d = a.filter((e) => !e.isFavorite),
        p = (e) => {
            switch (l) {
                case "oldest":
                    return e.sort((e, t) => (e.hireDate || 0) - (t.hireDate || 0));
                case "newest":
                    return e.sort((e, t) => (t.hireDate || 0) - (e.hireDate || 0));
                case "recentMessages":
                    return e.sort((e, t) => {
                        const n = getLastMessageTimestamp(e.id);
                        return getLastMessageTimestamp(t.id) - n;
                    });
                case "relationshipHigh":
                    return e.sort((e, t) => {
                        const n = calculateAverageRelationship(e);
                        return calculateAverageRelationship(t) - n;
                    });
                case "relationshipLow":
                    return e.sort((e, t) => calculateAverageRelationship(e) - calculateAverageRelationship(t));
                case "location":
                    return e.sort((e, t) => {
                        const n = e.locationId || "",
                            a = t.locationId || "";
                        return n.localeCompare(a);
                    });
                case "name":
                    return e.sort((e, t) => e.name.localeCompare(t.name));
                case "careerHigh":
                    return e.sort(
                        (e, t) => ((t.career && t.career.level) || 0) - ((e.career && e.career.level) || 0)
                    );
                case "careerLow":
                    return e.sort(
                        (e, t) => ((e.career && e.career.level) || 0) - ((t.career && t.career.level) || 0)
                    );
                case "salaryHigh":
                    return e.sort(
                        (e, t) => ((t.career && t.career.salary) || 0) - ((e.career && e.career.salary) || 0)
                    );
                case "salaryLow":
                    return e.sort(
                        (e, t) => ((e.career && e.career.salary) || 0) - ((t.career && t.career.salary) || 0)
                    );
                case "productivityHigh":
                    return e.sort(
                        (e, t) =>
                            ((t.stats && t.stats.productivity) || 0) - ((e.stats && e.stats.productivity) || 0)
                    );
                default:
                    return e;
            }
        };
    p(c), p(d);
    const m = [...c, ...d];
    const viewMode = gameState.peopleSorting.viewMode || "list";
    employeesList.className = "cards" === viewMode ? "emp-grid" : "roster";
    if (gameState.peopleSorting.showAlumni && m.length) {
        employeesList.insertAdjacentHTML(
            "beforeend",
            '<div class="band-h mt-2" style="grid-column:1/-1"><span>Alumni</span><span class="grow"></span></div>'
        );
    }
    const rowHTML = m
        .map((e) => {
            const alum = "active" !== e.employmentStatus,
                lvNum = Math.max(1, Math.min(7, Math.floor((e.career && e.career.level) || 1))),
                li =
                    (gameState.hierarchyLevels && gameState.hierarchyLevels[lvNum]) || {
                        title: "Staff",
                        color: "var(--positive)",
                    },
                lvlColor = li.color || "var(--positive)",
                locName = ((gameState.locations || []).find((L) => L.id === e.locationId) || {}).name || "",
                sub = `${li.title || "Staff"}${locName ? " · " + locName : ""}`,
                initial = (e.name || "?").trim().charAt(0).toUpperCase(),
                avatar = e.profileImage
                    ? `<img class="avatar-sm" src="${e.profileImage}" onclick="openUnifiedProfile('${e.id}','overview')">`
                    : `<div class="avatar-sm init" style="--lvl:${lvlColor}" onclick="openUnifiedProfile('${e.id}','overview')">${initial}</div>`,
                prod = e.stats && "number" == typeof e.stats.productivity ? Math.round(e.stats.productivity) : null,
                statHTML =
                    null !== prod
                        ? `⚡ <span class="num">${prod}%</span>`
                        : `♥ <span class="num">${Math.round(calculateAverageRelationship(e))}%</span>`,
                unreadHTML =
                    e.unreadMessages > 0
                        ? `<span class="unread-dot">${e.unreadMessages > 9 ? "9+" : e.unreadMessages}</span>`
                        : "",
                npcHTML = !alum && e.npcStatus ? getNPCStatusBadgeHTML(e, { size: "sm" }) : "",
                chatBtn = `<button class="employee-action-btn icon-btn" style="--ic:var(--danger)" data-employee="${e.id}" data-action="chat" title="Chat">💬</button>`,
                ovf = `<span class="ovf-wrap"><button class="icon-btn ovf-btn" data-emp="${e.id}" title="More actions">⋯</button><div class="row-menu" hidden><button class="employee-action-btn btn btn--ghost" data-employee="${e.id}" data-action="export-character">📤 Export</button><button class="employee-action-btn btn btn--ghost" data-employee="${e.id}" data-action="review">📊 Review</button><button class="employee-action-btn btn btn--ghost" data-employee="${e.id}" data-action="promote">⬆️ Promote</button><button class="employee-action-btn btn btn--ghost" data-employee="${e.id}" data-action="fire">🗑️ Fire</button></div></span>`;
            if ("cards" === viewMode) {
                return `<div class="emp-card${alum ? " is-alumni" : ""}">
            <div class="row-between">
              ${avatar}
              <button class="icon-btn" style="--ic:${e.isFavorite ? "var(--accent-gold)" : "var(--text-mute)"}" title="${e.isFavorite ? "Remove favorite" : "Add favorite"}" onclick="toggleEmployeeFavorite('${e.id}')">${e.isFavorite ? "⭐" : "☆"}</button>
            </div>
            <div onclick="openUnifiedProfile('${e.id}','overview')" style="cursor:pointer">
              <div class="fw-600">${getColoredName(e)}${e.age ? ", " + e.age : ""}</div>
              <div class="text-dim fs-xs">${sub}</div>
            </div>
            <div class="row wrap" style="gap:var(--s2)">
              <span class="lvl-chip" style="--lvl:${lvlColor}">Lv ${lvNum}</span>
              <span>${statHTML}</span>
              ${unreadHTML}${npcHTML}${renderProgramChips(e)}
            </div>
            <div class="row" style="gap:var(--s1)">${chatBtn}${ovf}</div>
          </div>`;
            }
            const stBits = [];
            e.isFavorite && stBits.push('<span class="text-gold" title="Favorited">⭐</span>');
            npcHTML && stBits.push(npcHTML);
            const chatWrap = `<div class="chat-wrap"><button class="employee-action-btn icon-btn" style="--ic:var(--danger)" data-employee="${e.id}" data-action="chat" title="Chat">💬</button>${e.unreadMessages > 0 ? `<span class="chat-badge num">${e.unreadMessages > 9 ? "9+" : e.unreadMessages}</span>` : ""}</div>`,
                favItem = `<button class="btn btn--ghost" title="${e.isFavorite ? "Unfavorite" : "Favorite"}" onclick="toggleEmployeeFavorite('${e.id}')">${e.isFavorite ? "⭐ Unfavorite" : "☆ Favorite"}</button>`,
                listOvf = `<span class="ovf-wrap"><button class="icon-btn ovf-btn" data-emp="${e.id}" title="More actions">⋯</button><div class="row-menu" hidden>${favItem}<button class="employee-action-btn btn btn--ghost" data-employee="${e.id}" data-action="export-character">📤 Export</button><button class="employee-action-btn btn btn--ghost" data-employee="${e.id}" data-action="review">📊 Review</button><button class="employee-action-btn btn btn--ghost" data-employee="${e.id}" data-action="promote">⬆️ Promote</button><button class="employee-action-btn btn btn--ghost" data-employee="${e.id}" data-action="fire">🗑️ Fire</button></div></span>`;
            return `<div class="roster-row${alum ? " is-alumni" : ""}">
            ${avatar}
            <div class="who" onclick="openUnifiedProfile('${e.id}','overview')">
              <span class="nm-line"><span class="nm">${getColoredName(e)}${e.age ? ", " + e.age : ""}</span><span class="lvl-chip" style="--lvl:${lvlColor}">Lv ${lvNum}</span>${e.isFavorite ? '<span class="text-gold rost-fav" title="Favorited">⭐</span>' : ""}</span>
              <span class="sub">${sub}</span>
            </div>
            <div class="rost-prod">${statHTML}</div>
            <div class="status-col">
              <span class="chip-slot">${renderProgramChips(e)}</span>
              <span class="status-slot">${npcHTML}</span>
            </div>
            <span class="acts">${chatWrap}${listOvf}</span>
          </div>`;
        })
        .join("");
    employeesList.insertAdjacentHTML("beforeend", rowHTML);
    employeesList.querySelectorAll(".ovf-btn").forEach((btn) => {
        btn.onclick = (ev) => {
            ev.stopPropagation();
            const menu = btn.parentElement.querySelector(".row-menu"),
                isOpen = !menu.hasAttribute("hidden");
            employeesList.querySelectorAll(".row-menu").forEach((mn) => mn.setAttribute("hidden", ""));
            isOpen || menu.removeAttribute("hidden");
        };
    });
    // Outside-click closer for the row overflow menu. Guard on the #peopleTab
    // element (not window) so it re-attaches naturally if the tab is torn down.
    const peopleTabEl = document.getElementById("peopleTab");
    if (peopleTabEl && !peopleTabEl._menuCloserAdded) {
        (peopleTabEl._menuCloserAdded = !0),
            document.addEventListener("click", (ev) => {
                (ev.target.closest && ev.target.closest(".ovf-wrap")) ||
                    document
                        .querySelectorAll("#employeesList .row-menu")
                        .forEach((mn) => mn.setAttribute("hidden", ""));
            });
    }
    // Legacy large-card render removed in Step 3 — roster now uses compact .roster-row list above.
    document.querySelectorAll(".employee-action-btn").forEach((e) => {
        e.onclick = () => handleEmployeeAction(e.dataset.employee, e.dataset.action);
    });
    const rvToggle = document.getElementById("rosterViewToggle");
    rvToggle &&
        rvToggle.querySelectorAll("button").forEach((btn) => {
            btn.classList.toggle("is-active", btn.dataset.view === viewMode);
            btn.onclick = () => {
                (gameState.peopleSorting.viewMode = btn.dataset.view), updatePeopleTab(), saveGame();
            };
        });
    const u = document.getElementById("peopleSortSelect");
    u &&
        ((u.value = gameState.peopleSorting.sortBy),
        (u.onchange = (e) => {
            (gameState.peopleSorting.sortBy = e.target.value), updatePeopleTab(), saveGame();
        }));
    const g = document.getElementById("toggleFavoritesOnly");
    g &&
        ((g.textContent = gameState.peopleSorting.showFavoritesOnly ? "⭐ Show All" : "⭐ Show Favorites Only"),
        (g.style.background = gameState.peopleSorting.showFavoritesOnly ? "var(--l-gold)" : "var(--l-purple-deep)"),
        (g.style.color = gameState.peopleSorting.showFavoritesOnly ? "var(--l-bg)" : "var(--l-ink)"),
        (g.onclick = () => {
            (gameState.peopleSorting.showFavoritesOnly = !gameState.peopleSorting.showFavoritesOnly),
                updatePeopleTab(),
                saveGame();
        }));
    const h = document.getElementById("toggleAlumni");
    if (h) {
        const e = gameState.peopleSorting.showAlumni;
        (h.textContent = e ? "👤 Show Active" : "👤 Show Alumni"),
            (h.style.background = e ? "var(--l-neutral-6)" : "var(--l-line)"),
            (h.style.borderColor = e ? "var(--l-ink-dim-2)" : "var(--l-neutral-8)"),
            (h.style.color = e ? "var(--l-ink-on-fill)" : "var(--l-neutral-8)"),
            (h.onclick = () => {
                (gameState.peopleSorting.showAlumni = !gameState.peopleSorting.showAlumni),
                    updatePeopleTab(),
                    saveGame();
            });
    }
    const y = document.getElementById("peopleSearchInput");
    y &&
        ((y.value = gameState.peopleSorting.searchText || ""),
        (y.oninput = (e) => {
            (gameState.peopleSorting.searchText = e.target.value), updatePeopleTab();
        }));
    // Company Programs card: collapse state (localStorage) + dynamic render
    const progToggle = document.getElementById("programsToggle"),
        progBody = document.getElementById("programsBody");
    if (progToggle && progBody) {
        const open = "1" === localStorage.getItem("fuoc_programs_open");
        (progBody.hidden = !open),
            (progToggle.textContent = open ? "▴" : "▾"),
            open && renderProgramsCard(),
            (progToggle.onclick = () => {
                const nowOpen = progBody.hidden;
                (progBody.hidden = !nowOpen),
                    (progToggle.textContent = nowOpen ? "▴" : "▾"),
                    localStorage.setItem("fuoc_programs_open", nowOpen ? "1" : "0"),
                    nowOpen && renderProgramsCard();
            });
    }
    // Filters disclosure: collapse state (localStorage) + restore on render
    const filtersToggle = document.getElementById("peopleFiltersToggle"),
        filtersPanel = document.getElementById("peopleFiltersPanel");
    if (filtersToggle && filtersPanel) {
        const fOpen = "1" === localStorage.getItem("fuoc_filters_open");
        (filtersPanel.hidden = !fOpen),
            (filtersToggle.textContent = fOpen ? "Filters ▴" : "Filters ▾"),
            (filtersToggle.onclick = () => {
                const nowOpen = filtersPanel.hidden;
                (filtersPanel.hidden = !nowOpen),
                    (filtersToggle.textContent = nowOpen ? "Filters ▴" : "Filters ▾"),
                    localStorage.setItem("fuoc_filters_open", nowOpen ? "1" : "0");
            });
    }
    const f = document.getElementById("peopleDeptFilter");
    f &&
        (f.onchange = (e) => {
            (gameState.peopleSorting.filterDept = e.target.value), updatePeopleTab(), saveGame();
        });
    const b = document.getElementById("peopleLevelFilter");
    b &&
        ((b.value = gameState.peopleSorting.filterLevel || "all"),
        (b.onchange = (e) => {
            (gameState.peopleSorting.filterLevel = e.target.value), updatePeopleTab(), saveGame();
        }));
    const v = document.getElementById("collapseAllCards");
    if (v) {
        const e = m.map((e) => e.id),
            t = e.length > 0 && e.every((e) => gameState.peopleSorting.collapsedCards.includes(e));
        (v.textContent = t ? "▼ Expand All" : "▶ Collapse All"),
            (v.style.color = t ? "var(--l-cyan)" : "var(--l-ink-dim-2)"),
            (v.style.borderColor = t ? "var(--l-cyan)" : "var(--l-neutral-8)"),
            (v.onclick = () => {
                collapseAllEmployeeCards();
            });
    }
    const w = document.getElementById("toggleFieldsPanel");
    w &&
        (w.onclick = () => {
            const e = document.getElementById("fieldVisibilityPanel");
            if (!e) return;
            const t = "none" !== e.style.display;
            (e.style.display = t ? "none" : "block"),
                (w.style.background = t ? "var(--l-purple-deep)" : "#7b4fa8"),
                t || syncFieldCheckboxes();
        }),
        ["bio", "demographics", "stats", "career", "flags", "skills", "relationships", "actions"].forEach((e) => {
            const t = document.getElementById(`fv_${e}`);
            t &&
                ((t.checked = !(
                    !gameState.peopleSorting.fieldVisibility || !gameState.peopleSorting.fieldVisibility[e]
                )),
                (t.onchange = (t) => {
                    (gameState.peopleSorting.fieldVisibility[e] = t.target.checked), updatePeopleTab(), saveGame();
                }));
        }),
        ["affection", "comfort", "trust", "desire", "obedience", "productivity"].forEach((e) => {
            const t = document.getElementById(`vs_${e}`);
            t &&
                ((t.checked = !(!gameState.peopleSorting.visibleStats || !gameState.peopleSorting.visibleStats[e])),
                (t.onchange = (t) => {
                    (gameState.peopleSorting.visibleStats[e] = t.target.checked), updatePeopleTab(), saveGame();
                }));
        });
    const x = document.getElementById("resetFieldDefaults");
    x &&
        (x.onclick = () => {
            (gameState.peopleSorting.fieldVisibility = {
                bio: !0,
                demographics: !0,
                stats: !0,
                career: !0,
                flags: !0,
                skills: !0,
                relationships: !0,
                actions: !0,
            }),
                (gameState.peopleSorting.visibleStats = {
                    affection: !0,
                    comfort: !0,
                    trust: !0,
                    desire: !0,
                    obedience: !0,
                    productivity: !0,
                }),
                syncFieldCheckboxes(),
                updatePeopleTab(),
                saveGame();
        });
}
