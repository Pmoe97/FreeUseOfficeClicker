// ============================================================================
// 38-groups — Groups: create/manage groups, group chat, speaker queue, autocomplete, action bar, group money/gift/photo/post/visualize requests.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

function openCreateGroupModal(e = null) {
    const t = $("createGroupModal");
    if (!t) return;
    const n = $("newGroupName");
    n && (n.value = ""),
        (window.selectedGroupParticipants = new Set()),
        e && window.selectedGroupParticipants.add(e);
    const a = $("convertChatOption"),
        o = $("convertExistingChat"),
        i = $("convertChatInfo");
    if (e) {
        const t = gameState.employees.find((t) => t.id === e),
            n = gameState.chatHistory[e] || [];
        t && n.length > 0
            ? (a && (a.style.display = "block"),
              i && (i.textContent = `Include ${n.length} messages from chat with ${t.name}`),
              o && (o.checked = !0),
              (window.convertFromEmployeeId = e))
            : (a && (a.style.display = "none"), (window.convertFromEmployeeId = null));
    } else a && (a.style.display = "none"), (window.convertFromEmployeeId = null);
    renderParticipantGrid(), updateSelectedCount(), (t.style.display = "flex");
}
function closeCreateGroupModal() {
    const e = $("createGroupModal");
    e && (e.style.display = "none"),
        (window.selectedGroupParticipants = new Set()),
        (window.convertFromEmployeeId = null);
}
function renderParticipantGrid() {
    const e = $("participantGrid");
    if (!e) return;
    const t = $("participantSearch"),
        n = t ? t.value.toLowerCase() : "",
        a = gameState.employees.filter(
            (e) => e.hired && "active" === e.employmentStatus && (!n || e.name.toLowerCase().includes(n))
        );
    (e.innerHTML = a
        .map((e) => {
            const t = window.selectedGroupParticipants?.has(e.id),
                n = e.profileImage || e.generatedPortrait || "",
                a = n && (n.startsWith("http") || n.startsWith("data:"));
            return `\n        <div class="participant-card" data-employee-id="${e.id}" \n             style="padding:12px; background:${t ? "rgba(102,126,234,0.3)" : "var(--l-bg)"}; \n                    border:2px solid ${t ? "var(--l-indigo)" : "transparent"}; \n                    border-radius:12px; cursor:pointer; text-align:center; transition:all 0.2s;"\n             onmouseenter="if(!this.classList.contains('selected')) this.style.background='rgba(102,126,234,0.1)';"\n             onmouseleave="if(!this.classList.contains('selected')) this.style.background='${t ? "rgba(102,126,234,0.3)" : "var(--l-bg)"}';">\n          <div style="width:50px; height:50px; margin:0 auto 8px; border-radius:50%; overflow:hidden; background:var(--surface); display:flex; align-items:center; justify-content:center; font-size:1.8rem;">\n            ${a ? `<img src="${n}" style="width:100%; height:100%; object-fit:cover;">` : "👤"}\n          </div>\n          <div style="font-size:0.85rem; color:var(--l-ink); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.name.split(" ")[0]}</div>\n          <div style="font-size:0.7rem; color:var(--text-mute);">${e.role || "Employee"}</div>\n          ${t ? '<div style="color:var(--positive); font-size:0.7rem; margin-top:4px;">✓ Selected</div>' : ""}\n        </div>\n      `;
        })
        .join("")),
        e.querySelectorAll(".participant-card").forEach((e) => {
            e.addEventListener("click", () => toggleParticipantSelection(e.dataset.employeeId));
        });
}
function toggleParticipantSelection(e) {
    window.selectedGroupParticipants || (window.selectedGroupParticipants = new Set()),
        window.selectedGroupParticipants.has(e)
            ? window.selectedGroupParticipants.delete(e)
            : window.selectedGroupParticipants.add(e),
        renderParticipantGrid(),
        updateSelectedCount(),
        updateSelectedPreview();
}
function updateSelectedCount() {
    const e = $("selectedCount"),
        t = window.selectedGroupParticipants?.size || 0;
    e && ((e.textContent = `${t} selected`), (e.style.background = t >= 2 ? "var(--l-green)" : "var(--l-indigo)"));
}
function updateSelectedPreview() {
    const e = $("selectedParticipantsPreview"),
        t = $("selectedAvatarRow");
    if (!e || !t) return;
    const n = Array.from(window.selectedGroupParticipants || []);
    0 !== n.length
        ? ((e.style.display = "block"),
          (t.innerHTML = n
              .map((e) => {
                  const t = gameState.employees.find((t) => t.id === e);
                  if (!t) return "";
                  const n = t.profileImage || t.generatedPortrait || "";
                  return `\n        <div style="display:flex; align-items:center; gap:8px; padding:6px 12px; background:var(--surface); border-radius:20px;">\n          <div style="width:24px; height:24px; border-radius:50%; overflow:hidden; background:var(--surface-2); display:flex; align-items:center; justify-content:center; font-size:1rem;">\n            ${n && (n.startsWith("http") || n.startsWith("data:")) ? `<img src="${n}" style="width:100%; height:100%; object-fit:cover;">` : "👤"}\n          </div>\n          <span style="font-size:0.85rem; color:var(--l-ink);">${t.name.split(" ")[0]}</span>\n          <button onclick="toggleParticipantSelection('${e}')" style="background:transparent; border:none; color:var(--danger); cursor:pointer; font-size:0.8rem; padding:0;">✕</button>\n        </div>\n      `;
              })
              .join("")))
        : (e.style.display = "none");
}
const MAX_GROUP_PARTICIPANTS = 8;
async function createGroupFromModal() {
    const e = Array.from(window.selectedGroupParticipants || []);
    if (e.length < 2) return void showNotification("Please select at least 2 participants", 2e3);
    if (e.length > MAX_GROUP_PARTICIPANTS)
        return void showNotification(`Groups are capped at ${MAX_GROUP_PARTICIPANTS} participants`, 2500);
    const t = $("newGroupName"),
        n = $("convertExistingChat"),
        a = $("generateAiPretext"),
        o = $("includeNarrator");
    let i = t?.value.trim();
    const s = n?.checked && window.convertFromEmployeeId,
        r = s && a?.checked,
        l = o?.checked || !1;
    if (!i) {
        const t = e
            .map((e) => gameState.employees.find((t) => t.id === e)?.name.split(" ")[0])
            .filter(Boolean)
            .slice(0, 3);
        i = t.length > 2 ? `${t.slice(0, 2).join(", ")} & others` : t.join(" & ");
    }
    r && showGroupCreationLoader();
    const c = {
        id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: i,
        participantIds: e,
        messages: [],
        createdAt: gameState.time?.currentTime || Date.now(),
        lastMessageAt: gameState.time?.currentTime || Date.now(),
        convertedFromChatId: s ? window.convertFromEmployeeId : null,
        pretext: null,
        hasNarrator: l,
        unreadCount: 0,
        settings: { includeContext: !0, replyLimit: 2 },
    };
    if (s && window.convertFromEmployeeId) {
        const t = gameState.chatHistory[window.convertFromEmployeeId] || [];
        if (t.length > 0) {
            const n = gameState.employees.find((e) => e.id === window.convertFromEmployeeId);
            if (((c.contextSummary = buildChatContextSummary(window.convertFromEmployeeId, t)), r))
                try {
                    updateLoaderStatus("Generating scene summary...", 30),
                        (c.pretext = await generateGroupPretext(window.convertFromEmployeeId, t, e)),
                        updateLoaderStatus("Finalizing group...", 90);
                } catch (e) {
                    console.error("Error generating pretext:", e);
                }
            c.messages.push({
                sender: "system",
                content: `📥 Group created from conversation with ${n?.name || "unknown"}. Previous chat context has been preserved.`,
                isSystem: !0,
                timestamp: c.createdAt,
            });
        }
    }
    hideGroupCreationLoader(),
        gameState.groups || (gameState.groups = []),
        gameState.groups.unshift(c),
        saveGame(!1),
        closeCreateGroupModal(),
        renderGroupsList(),
        selectGroup(c.id),
        showNotification(`✨ Group "${i}" created!`, 2e3);
}
function buildChatContextSummary(e, t) {
    const n = gameState.employees.find((t) => t.id === e);
    if (!n || !t.length) return "";
    const a = t
        .filter((e) => !e.isSystem && e.content && e.content.length > 10)
        .slice(-10)
        .map(
            (e) =>
                `${e.isPlayer ? "You" : n.name}: ${e.content.length > 150 ? e.content.substring(0, 147) + "..." : e.content}`
        )
        .join("\n");
    return `Recent conversation with ${n.name}:\n${a}`;
}
function showGroupCreationLoader() {
    const e = $("groupCreationLoader"),
        t = e?.parentElement;
    e && t && ((t.style.position = "relative"), (e.style.display = "flex"), updateLoaderStatus("Preparing...", 10));
}
function hideGroupCreationLoader() {
    const e = $("groupCreationLoader");
    e && (e.style.display = "none");
}
function updateLoaderStatus(e, t) {
    const n = $("loaderStatusText"),
        a = $("loaderProgressBar");
    n && (n.textContent = e), a && (a.style.width = `${t}%`);
}
async function generateGroupPretext(e, t, n) {
    const a = gameState.employees.find((t) => t.id === e);
    if (!a || !t.length) return null;
    const o = n.map((e) => gameState.employees.find((t) => t.id === e)?.name).filter(Boolean),
        i = t.filter((e) => !e.isSystem && e.content && e.content.length > 5).slice(-25);
    if (i.length < 3) return null;
    const s = i.map((e) => `${e.isPlayer ? "You (the boss)" : a.name}: ${e.content}`).join("\n"),
        r = `You are creating a "Pre-text" scene summary for a group chat that's being created from a 1-on-1 conversation.\n\nThis pre-text will:\n1. Set the scene for where the conversation is taking place\n2. Summarize the tone/mood and what's been discussed\n3. Provide context for new participants joining\n\nSource conversation was between: You (the boss) and ${a.name} (${a.role || "Employee"})\nNew group participants: ${o.join(", ")}\n\nRecent conversation:\n${s}\n\nWrite a vivid, engaging pre-text (3-5 sentences) that:\n- Describes the setting/scene (where, when, atmosphere)\n- Captures the emotional tone and dynamic\n- Summarizes key topics or themes discussed\n- Sets up context for the group conversation\n\nWrite in present tense, third person perspective. Be specific and evocative, not generic.\n\nPre-text:`;
    try {
        return (await queuedGenerateText(r, {}, "Generating group pre-text")).trim().replace(/^["']|["']$/g, "");
    } catch (e) {
        return console.error("Failed to generate pretext:", e), null;
    }
}
function formatGroupTimestamp(e) {
    if (!e) return "";
    const t = Date.now() - e;
    return t < 6e4
        ? "now"
        : t < 36e5
          ? Math.floor(t / 6e4) + "m"
          : t < 864e5
            ? Math.floor(t / 36e5) + "h"
            : t < 6048e5
              ? Math.floor(t / 864e5) + "d"
              : new Date(e).toLocaleDateString(void 0, { month: "short", day: "numeric" });
}
function renderGroupsList() {
    const e = $("groupsList"),
        t = $("noGroupsMessage"),
        n = $("groupSearchInput");
    if (!e) return;
    const a = n?.value?.toLowerCase() || "",
        o = (gameState.groups || []).filter((e) => !a || (e.name || "").toLowerCase().includes(a));
    if ((t && (t.style.display = 0 === o.length ? "block" : "none"), 0 === o.length)) return;
    const i = [...o].sort((e, t) => (t.lastMessageAt || 0) - (e.lastMessageAt || 0));
    (e.innerHTML = i
        .map((e) => {
            const t = gameState.activeGroup === e.id,
                n = resolveGroupParticipants(e, "groups list"),
                msgs = e.messages || [],
                a = msgs[msgs.length - 1],
                o = a
                    ? a.isSystem
                        ? a.content
                        : `${(a.sender || "Unknown").split(" ")[0]}: ${a.content || ""}`
                    : "No messages yet",
                i = n
                    .slice(0, 3)
                    .map((e, t) => {
                        const n = e.profileImage || e.generatedPortrait || "";
                        return `\n          <div style="width:32px; height:32px; border-radius:50%; border:2px solid var(--l-panel-2); background:var(--surface-2); \n                      margin-left:${t > 0 ? "-10px" : "0"}; z-index:${3 - t}; position:relative;\n                      display:flex; align-items:center; justify-content:center; overflow:hidden; font-size:1.2rem;">\n            ${n && (n.startsWith("http") || n.startsWith("data:")) ? `<img src="${n}" style="width:100%; height:100%; object-fit:cover;">` : "👤"}\n          </div>\n        `;
                    })
                    .join(""),
                s = n.length - 3,
                r = e.unreadCount || 0,
                l = formatGroupTimestamp(e.lastMessageAt);
            return `\n        <div class="group-item" data-group-id="${e.id}"\n             style="padding:10px 12px; margin-bottom:6px; background:${t ? "rgba(102,126,234,0.2)" : "transparent"};\n                    border-radius:10px; cursor:pointer; transition:all 0.2s; border:1px solid ${t ? "rgba(102,126,234,0.4)" : "transparent"};"\n             onmouseenter="if(this.dataset.groupId !== '${gameState.activeGroup}') this.style.background='var(--l-sheen-05)';"\n             onmouseleave="if(this.dataset.groupId !== '${gameState.activeGroup}') this.style.background='transparent';">\n          <div style="display:flex; align-items:center; gap:10px;">\n            <div style="position:relative; display:flex; align-items:center; flex-shrink:0;">\n              ${i}\n              ${s > 0 ? `<div style="width:28px; height:28px; border-radius:50%; background:var(--l-indigo); margin-left:-8px; display:flex; align-items:center; justify-content:center; font-size:0.65rem; color:var(--l-ink-on-fill); border:2px solid var(--l-panel-2);">+${s}</div>` : ""}\n              ${r > 0 ? `<div style="position:absolute; top:-4px; right:-4px; background:var(--l-red); color:var(--l-ink-on-fill); border-radius:50%; min-width:16px; height:16px; font-size:0.65rem; font-weight:700; display:flex; align-items:center; justify-content:center; padding:0 3px; border:2px solid var(--l-panel-2);">${r > 9 ? "9+" : r}</div>` : ""}\n            </div>\n            <div style="flex:1; min-width:0;">\n              <div style="display:flex; justify-content:space-between; align-items:baseline; gap:6px;">\n                <div style="font-weight:600; color:${r > 0 ? "var(--l-ink)" : "var(--l-ink-dim)"}; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.name}</div>\n                ${l ? `<div style="font-size:0.7rem; color:var(--l-on-accent); flex-shrink:0;">${l}</div>` : ""}\n              </div>\n              <div style="font-size:0.78rem; color:${r > 0 ? "var(--l-ink-dim-2)" : "var(--l-neutral-5)"}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">${o}</div>\n            </div>\n          </div>\n        </div>\n      `;
        })
        .join("")),
        e.querySelectorAll(".group-item").forEach((e) => {
            e.addEventListener("click", () => selectGroup(e.dataset.groupId));
        });
}
function selectGroup(e) {
    const t = gameState.groups?.find((t) => t.id === e);
    if (!t) return;
    (gameState.activeGroup = e), (t.unreadCount = 0);
    const n = $("noGroupSelected"),
        a = $("activeGroupChat");
    n && (n.style.display = "none"), a && (a.style.display = "flex"), updateMobileGroupView(!0);
    const o = $("groupTitle"),
        i = $("groupParticipantCount");
    o && (o.textContent = t.name),
        i && (i.textContent = `${t.participantIds.length} participants`),
        renderGroupHeaderAvatars(t),
        renderParticipantSelectorBar(t),
        renderGroupMessages(t),
        renderGroupActionButtons(t);
    const s = $("groupActionBarWrapper");
    s && (s.style.display = groupActionBarCollapsed ? "none" : "block"),
        (gameState.groupSpeakerQueue = []),
        updateQueueDisplay(),
        renderGroupsList(),
        // Persist the unread-count reset OFF the critical path. A synchronous saveGame here
        // ran estimateSize() → JSON.stringify(entire gameState) on the main thread, freezing
        // the group tab on every open regardless of image count. Defer so the open is instant;
        // the read-state still lands on this microtask-deferred save (and the next autosave).
        setTimeout(() => saveGame(!1), 0);
}
// Resolves a group's participantIds to employee records, warning (LogControl tag [Group]) on any
// id that no longer resolves instead of silently dropping it — diagnostic for the "member vanished" bug.
function resolveGroupParticipants(e, t = "group") {
    return (e?.participantIds || [])
        .map((id) => {
            const emp = gameState.employees.find((x) => x.id === id);
            return emp || (console.warn(`[Group] participant id ${id} no longer resolves (${t}) — dropping from display`), null);
        })
        .filter(Boolean);
}
function renderGroupHeaderAvatars(e) {
    const t = $("groupParticipantAvatars");
    if (!t) return;
    const n = resolveGroupParticipants(e, "header avatars");
    t.innerHTML = n
        .slice(0, 5)
        .map((e, t) => {
            const n = e.profileImage || e.generatedPortrait || "";
            return `\n        <div style="width:36px; height:36px; border-radius:50%; border:2px solid var(--l-line); background:var(--surface);\n                    margin-left:${t > 0 ? "-12px" : "0"}; z-index:${5 - t}; position:relative;\n                    display:flex; align-items:center; justify-content:center; overflow:hidden;">\n          ${n && (n.startsWith("http") || n.startsWith("data:")) ? `<img src="${n}" style="width:100%; height:100%; object-fit:cover;" title="${e.name}">` : '<span style="font-size:1.2rem;">👤</span>'}\n        </div>\n      `;
        })
        .join("");
}
function renderParticipantSelectorBar(e) {
    const t = $("participantSelector");
    if (!t) return;
    let n = resolveGroupParticipants(e, "selector bar")
        .map((e) => {
            const t = e.profileImage || e.generatedPortrait || "",
                n = t && (t.startsWith("http") || t.startsWith("data:")),
                a = gameState.groupSpeakerQueue?.includes(e.id),
                o = e.name.split(" ")[0],
                i = o.length > 8 ? o.substring(0, 7) + "…" : o;
            return `\n        <div class="participant-portrait-container" data-employee-id="${e.id}" \n             style="display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer;"\n             title="${e.name} - Click to queue, double-click for instant response">\n          <div class="participant-portrait"\n               style="width:48px; height:48px; border-radius:50%; position:relative;\n                      background:${a ? "linear-gradient(135deg, var(--l-indigo) 0%, var(--l-indigo-deep) 100%)" : "var(--l-bg)"};\n                      padding:3px; transition:all 0.2s; box-shadow:${a ? "0 0 15px rgba(102,126,234,0.5)" : "none"};">\n            <div style="width:100%; height:100%; border-radius:50%; overflow:hidden; background:var(--surface); display:flex; align-items:center; justify-content:center;">\n              ${n ? `<img src="${t}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="font-size:1.5rem;">👤</span>'}\n            </div>\n            ${a ? `<div style="position:absolute; bottom:-2px; right:-2px; background:var(--l-green); color:var(--l-on-accent); width:18px; height:18px; border-radius:50%; font-size:0.65rem; font-weight:bold; display:flex; align-items:center; justify-content:center;">${gameState.groupSpeakerQueue.indexOf(e.id) + 1}</div>` : ""}\n          </div>\n          <span style="font-size:0.7rem; color:var(--text-mute); text-align:center; max-width:60px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${i}</span>\n        </div>\n      `;
        })
        .join("");
    if (e.hasNarrator) {
        const e = gameState.groupSpeakerQueue?.includes("__narrator__");
        n += `\n        <div class="participant-portrait-container narrator-portrait" data-employee-id="__narrator__" \n             style="display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer;"\n             title="Narrator - Click to queue, double-click for instant narration">\n          <div class="participant-portrait"\n               style="width:48px; height:48px; border-radius:50%; position:relative;\n                      background:${e ? "linear-gradient(135deg, var(--l-violet) 0%, var(--l-violet-3) 100%)" : "rgba(199,125,255,0.2)"};\n                      padding:3px; transition:all 0.2s; box-shadow:${e ? "0 0 15px rgba(199,125,255,0.5)" : "none"};\n                      border:2px dashed rgba(199,125,255,0.5);">\n            <div style="width:100%; height:100%; border-radius:50%; overflow:hidden; background:var(--l-panel); display:flex; align-items:center; justify-content:center;">\n              <span style="font-size:1.5rem;">📜</span>\n            </div>\n            ${e ? `<div style="position:absolute; bottom:-2px; right:-2px; background:var(--l-violet); color:var(--l-on-accent); width:18px; height:18px; border-radius:50%; font-size:0.65rem; font-weight:bold; display:flex; align-items:center; justify-content:center;">${gameState.groupSpeakerQueue.indexOf("__narrator__") + 1}</div>` : ""}\n          </div>\n          <span style="font-size:0.7rem; color:var(--l-violet); text-align:center;">Narrator</span>\n        </div>\n      `;
    }
    (t.innerHTML = n),
        t.querySelectorAll(".participant-portrait-container").forEach((e) => {
            e.addEventListener("click", (t) => {
                t.preventDefault(), queueSpeaker(e.dataset.employeeId);
            }),
                e.addEventListener("dblclick", (t) => {
                    t.preventDefault(), instantSpeakerResponse(e.dataset.employeeId);
                });
        });
}
function queueSpeaker(e) {
    gameState.groupSpeakerQueue || (gameState.groupSpeakerQueue = []);
    const t = gameState.groupSpeakerQueue.indexOf(e);
    t > -1 ? gameState.groupSpeakerQueue.splice(t, 1) : gameState.groupSpeakerQueue.push(e);
    const n = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    n && renderParticipantSelectorBar(n), updateQueueDisplay();
}
async function instantSpeakerResponse(e) {
    const t = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!t) return;
    const n = gameState.groupSpeakerQueue?.indexOf(e) ?? -1;
    if ((n > -1 && (gameState.groupSpeakerQueue.splice(n, 1), updateQueueDisplay()), "__narrator__" === e))
        return void (await generateNarratorResponse(t));
    const a = gameState.employees.find((t) => t.id === e);
    a && (await generateGroupResponse(t, a));
}
function updateQueueDisplay() {
    const e = $("queuedSpeakers"),
        t = $("queuedSpeakersList");
    if (!e || !t) return;
    const n = gameState.groupSpeakerQueue || [];
    if (0 === n.length) return void (e.style.display = "none");
    e.style.display = "block";
    const a = n
        .map((e) => {
            if ("__narrator__" === e) return "📜 Narrator";
            const t = gameState.employees.find((t) => t.id === e);
            return t ? t.name.split(" ")[0] : "Unknown";
        })
        .join(" → ");
    t.textContent = a;
}
function clearSpeakerQueue() {
    (gameState.groupSpeakerQueue = []), updateQueueDisplay();
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    e && renderParticipantSelectorBar(e);
}
function selectGroupResponders(e, t, n) {
    const a = (e.participantIds || []).map((e) => gameState.employees.find((t) => t.id === e)).filter(Boolean);
    if (0 === a.length) return [];
    t = Math.max(1, Math.min(t || 1, a.length));
    const o = (n || "").toLowerCase(),
        i = [],
        s = e.messages || [];
    for (let e = s.length - 1; e >= 0 && i.length < 3; e--) {
        const t = s[e];
        t.employeeId && !i.includes(t.employeeId) && i.push(t.employeeId);
    }
    const r = a.map((e) => {
        let t = 1 + 0.6 * Math.random();
        const n = e.name.split(" ")[0].toLowerCase();
        o && (o.includes(n) || o.includes(e.name.toLowerCase())) && (t += 5),
            (t += ((e.personality?.outgoing ?? 50) / 100) * 0.8);
        const a = e.stats || {};
        t += (((a.affection || 0) + (a.desire || 0)) / 200) * 0.6;
        const s = i.indexOf(e.id);
        return 0 === s ? (t -= 1.2) : 1 === s && (t -= 0.6), { emp: e, score: t };
    });
    return r.sort((e, t) => t.score - e.score), r.slice(0, t).map((e) => e.emp);
}
async function sendGroupMessage() {
    const e = $("groupInput"),
        t = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!e || !t) return;
    const n = e.value.trim();
    if (!(n || (gameState.groupSpeakerQueue && 0 !== gameState.groupSpeakerQueue.length))) return;
    if (/^\/(help|\?)$/i.test(n)) return (e.value = ""), void showGroupCommandsHelp();
    if (
        ("function" == typeof resetGroupAutocompleteState && resetGroupAutocompleteState(),
        n && n.toLowerCase().startsWith("/do "))
    ) {
        const a = n.substring(4).trim();
        return (e.value = ""), void (await executeGroupDoCommand(t, a));
    }
    const a = n.match(/^\/([a-zA-Z]+)(?:\s+([A-Za-z]+))?\s*(?:\{([^}]*)\})?\s*(?:<([^>]*)>)?$/);
    if (a) {
        const n = a[1].toLowerCase(),
            o = (a[2] || "").trim();
        let i = (a[3] || "").trim();
        const s = (a[4] || "").trim(),
            r = t.actionButtons || DEFAULT_GROUP_ACTION_BUTTONS,
            l = (e) =>
                e
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "")
                    .slice(0, 15) || "cmd",
            c = r.find((e) => l(e.name.replace(e.emoji + " ", "")) === n || e.id === n);
        if (c) {
            (e.value = ""), ("optional" !== i.toLowerCase() && "" !== i) || (i = "");
            const n = s || c.instruction;
            i &&
                (t.messages.push({
                    sender: "You",
                    content: i,
                    isPlayer: !0,
                    timestamp: gameState.time?.currentTime || Date.now(),
                    intent: classifyBossIntent(i, t),
                }),
                (t.lastMessageAt = gameState.time?.currentTime || Date.now()),
                renderGroupMessages(t));
            let a = null;
            if (o) {
                if ("narrator" === o.toLowerCase() && t.hasNarrator)
                    return await generateNarratorResponseWithInstruction(t, n), void saveGame(!1);
                if (
                    ((a = t.participantIds
                        .map((e) => gameState.employees.find((t) => t.id === e))
                        .filter(Boolean)
                        .find(
                            (e) =>
                                e.name.split(" ")[0].toLowerCase() === o.toLowerCase() ||
                                e.name.toLowerCase() === o.toLowerCase()
                        )),
                    a)
                )
                    return await generateGroupResponseWithInstruction(t, a, n), void saveGame(!1);
            }
            const r = [...(gameState.groupSpeakerQueue || [])];
            if (
                ((gameState.groupSpeakerQueue = []),
                updateQueueDisplay(),
                renderParticipantSelectorBar(t),
                r.length > 0)
            )
                for (const e of r)
                    if ("__narrator__" === e) await generateNarratorResponseWithInstruction(t, n);
                    else {
                        const a = gameState.employees.find((t) => t.id === e);
                        a && (await generateGroupResponseWithInstruction(t, a, n));
                    }
            else if (c.forNarrator && t.hasNarrator) await generateNarratorResponseWithInstruction(t, n);
            else if ((t.settings?.replyLimit ?? 2) > 0) {
                // Hotfix 2: respect Manual mode (replyLimit 0) — don't auto-pick a speaker here; the
                // player must queue one (mirrors the Phase 1 gate on the plain-message path).
                const e = selectGroupResponders(t, 1, i)[0];
                e && (await generateGroupResponseWithInstruction(t, e, n));
            }
            return void saveGame(!1);
        }
    }
    if (n && ("/continue" === n.toLowerCase() || "/c" === n.toLowerCase())) {
        e.value = "";
        const n = (t.actionButtons || DEFAULT_GROUP_ACTION_BUTTONS).find((e) => "continue" === e.id);
        if (n) {
            const e = t.participantIds.map((e) => gameState.employees.find((t) => t.id === e)).filter(Boolean);
            if (e.length > 0 && (t.settings?.replyLimit ?? 2) > 0) {
                const a = e[Math.floor(Math.random() * e.length)];
                await generateGroupResponseWithInstruction(t, a, n.instruction);
            }
        }
        return;
    }
    const o = n?.match(/^\/(narrator|n)(?:\s+<([^>]*)>)?$/i);
    if (o) {
        if (((e.value = ""), t.hasNarrator)) {
            const e = (o[2] || "").trim(),
                n = (t.actionButtons || DEFAULT_GROUP_ACTION_BUTTONS).find((e) => "narrate" === e.id),
                a = e || n?.instruction || "Describe the scene.";
            await generateNarratorResponseWithInstruction(t, a);
        } else showNotification("Narrator is not enabled for this group. Enable it in group settings.", "warning");
        return;
    }
    n &&
        (t.messages.push({
            sender: "You",
            content: n,
            isPlayer: !0,
            timestamp: gameState.time?.currentTime || Date.now(),
            intent: classifyBossIntent(n, t),
        }),
        (t.lastMessageAt = gameState.time?.currentTime || Date.now()),
        (e.value = ""),
        "function" == typeof remember &&
            "function" == typeof extractSalientFacts &&
            t.participantIds.forEach((e) => {
                const a = gameState.employees.find((t) => t.id === e);
                if (!a) return;
                const o = extractSalientFacts(n, a);
                for (const e of o) remember(a, `In "${t.name}", Boss ${e.text}`, e.type, e.importance);
            }),
        renderGroupMessages(t));
    let i = [...(gameState.groupSpeakerQueue || [])];
    if (
        ((gameState.groupSpeakerQueue = []),
        updateQueueDisplay(),
        renderParticipantSelectorBar(t),
        0 === i.length && n && (t.settings?.replyLimit ?? 2) > 0)
    ) {
        const e = t.settings?.replyLimit ?? 2;
        i = selectGroupResponders(t, e, n).map((e) => e.id);
    }
    for (let e = 0; e < i.length; e++) {
        const n = i[e];
        if ((e > 0 && (await new Promise((e) => setTimeout(e, 600 + 900 * Math.random()))), "__narrator__" === n)) {
            await generateNarratorResponse(t);
            continue;
        }
        const a = gameState.employees.find((e) => e.id === n);
        a && (await generateGroupResponse(t, a));
    }
    saveGame(!1);
}
async function generateGroupResponse(e, t) {
    if (e && t) {
        addGroupTypingIndicator(t);
        try {
            const n = buildGroupContext(e, t);
            let a = null;
            const o = e.settings?.interCharacterChat,
                i = e.settings?.playerAbsent;
            if (o?.enabled && !i) {
                if (100 * Math.random() < (o.targetChance || 15)) {
                    const n = e.participantIds
                        .filter((e) => e !== t.id)
                        .map((e) => gameState.employees.find((t) => t.id === e))
                        .filter(Boolean);
                    n.length > 0 && (a = n[Math.floor(Math.random() * n.length)]);
                }
            }
            if (i) {
                const n = e.participantIds
                    .filter((e) => e !== t.id)
                    .map((e) => gameState.employees.find((t) => t.id === e))
                    .filter(Boolean);
                n.length > 0 && (a = n[Math.floor(Math.random() * n.length)]);
            }
            const s = buildGroupResponsePrompt(e, t, n, a, latestBossInstruction(e)),
                r = !1 !== gameState.settings?.enableStreamingResponses;
            let l = null,
                c = !1,
                streamedSoFar = "";
            const d = $("groupMessages");
            r &&
                d &&
                gameState.activeGroup === e.id &&
                ((l = document.createElement("div")),
                (l.style.cssText =
                    "display:flex; gap:8px; align-items:flex-start; padding:8px 12px; margin:4px 0; background:rgba(15,52,96,0.4); border-radius:12px; color:var(--l-ink-cool-3); align-self:flex-start; max-width:80%;"),
                (l.innerHTML = `<span style="color:var(--accent);font-weight:600;white-space:nowrap;">${t.name.split(" ")[0]}:</span><span class="stream-text">▍</span>`),
                d.appendChild(l),
                (d.scrollTop = d.scrollHeight));
            const p = await queuedGenerateText(
                s,
                {
                    ...(l
                        ? {
                              onChunk: function (e) {
                                  if (!e) return;
                                  c || (removeGroupTypingIndicator(), (c = !0));
                                  (streamedSoFar = e.fullTextSoFar || streamedSoFar);
                                  const t = l.querySelector(".stream-text");
                                  t && (t.textContent = e.fullTextSoFar + "▍"), d && (d.scrollTop = d.scrollHeight);
                              },
                          }
                        : {}),
                },
                `${t.name} responding in group`
            );
            l && (l.remove(), (l = null));
            let m = sanitizeNpcResponse(p, 5);
            (!m || m.startsWith("I'm having some difficulty")) &&
                streamedSoFar.trim().length > 0 &&
                (m = sanitizeNpcResponse(streamedSoFar, 5));
            if (
                (removeGroupTypingIndicator(),
                e.messages.push({
                    sender: t.name,
                    employeeId: t.id,
                    content: m,
                    isPlayer: !1,
                    timestamp: gameState.time?.currentTime || Date.now(),
                    targetedCharacter: a?.id || null,
                }),
                (e.lastMessageAt = gameState.time?.currentTime || Date.now()),
                "function" == typeof remember && "function" == typeof extractSalientFacts)
            ) {
                applySceneStateFromNarration(t, m);
                detectEventSignals(t, m, { involves: a && a.id ? [a.id] : [] });
                const n = extractSalientFacts(m, t);
                for (const a of n)
                    remember(t, `In "${e.name}", I ${a.text}`, a.type, a.importance),
                        e.participantIds.forEach((n) => {
                            if (n === t.id) return;
                            const o = gameState.employees.find((e) => e.id === n);
                            o &&
                                remember(
                                    o,
                                    `In "${e.name}", ${t.name} ${a.text}`,
                                    a.type,
                                    Math.max(0.8, a.importance - 0.3)
                                );
                        });
            }
            gameState.activeGroup !== e.id && (e.unreadCount = (e.unreadCount || 0) + 1),
                renderGroupMessages(e),
                renderGroupsList(),
                checkGroupAutoVisualization(e, m),
                saveGame(!1);
        } catch (e) {
            console.error("Error generating group response:", e),
                removeGroupTypingIndicator(),
                showNotification("Failed to generate response", 2e3);
        }
    }
}
async function generateNarratorResponse(e) {
    if (e) {
        addNarratorTypingIndicator();
        try {
            const t = buildNarratorPrompt(e, buildNarratorContext(e)),
                n = sanitizeNpcResponse(await queuedGenerateText(t, {}, "Narrator describing scene"), 8);
            removeGroupTypingIndicator(),
                e.messages.push({
                    sender: "Narrator",
                    content: n,
                    isNarrator: !0,
                    isPlayer: !1,
                    timestamp: gameState.time?.currentTime || Date.now(),
                }),
                (e.lastMessageAt = gameState.time?.currentTime || Date.now()),
                gameState.activeGroup !== e.id && (e.unreadCount = (e.unreadCount || 0) + 1),
                renderGroupMessages(e),
                renderGroupsList(),
                saveGame(!1);
        } catch (e) {
            console.error("Error generating narrator response:", e),
                removeGroupTypingIndicator(),
                showNotification("Failed to generate narration", 2e3);
        }
    }
}
function buildNarratorContext(e) {
    let t = "";
    e.settings?.scenarioContext && (t += `[Current Scenario/Setting]\n${e.settings.scenarioContext}\n\n`),
        e.pretext && (t += `[Scene Background]\n${e.pretext}\n\n`);
    const n = e.participantIds.map((e) => gameState.employees.find((t) => t.id === e)).filter(Boolean);
    (t += "[Characters Present]\n"),
        n.forEach((e) => {
            (t += `- ${e.name} (${e.role || "Employee"})`),
                e.physicalDescription
                    ? (t += `: ${e.physicalDescription}`)
                    : e.appearance && (t += `: ${"string" == typeof e.appearance ? e.appearance : "N/A"}`),
                e.personality && (t += `. Personality: ${formatPersonality(e.personality)}`),
                (t += "\n");
        }),
        (t += "- The Boss (player character): The authority figure overseeing this group\n\n");
    const a = e.messages.slice(-10);
    return (
        a.length > 0 &&
            ((t += "[Recent Conversation]\n"),
            a.forEach((e) => {
                if (!e.isSystem)
                    if (e.isNarrator) t += `[Previous narration]: ${e.content.substring(0, 100)}...\n`;
                    else {
                        const n = e.isPlayer ? "The Boss" : e.sender;
                        t += `${n}: ${e.content}\n`;
                    }
            })),
        t
    );
}
function buildNarratorPrompt(e, t) {
    return `You are a third-person narrator describing events in an interactive story.\n\n${t}\n\nYour role:\n- Describe the scene, atmosphere, and subtle details the characters might not notice\n- Narrate physical actions, body language, and unspoken tension\n- Add sensory details (sights, sounds, atmosphere)\n- DO NOT speak for any character - only describe what is observable\n- Write in third person, past tense, like a novel\n- Keep narration atmospheric and engaging (2-4 sentences typically)\n- Focus on recent events and current moment\n- You may hint at emotions through physical cues but don't state what characters are thinking\n\nWrite a brief narration describing the current moment or recent events in this scene:`;
}
function addNarratorTypingIndicator() {
    const e = $("groupMessages");
    if (!e) return;
    removeGroupTypingIndicator();
    const t = document.createElement("div");
    (t.id = "groupTypingIndicator"),
        (t.style.cssText =
            "margin:15px 0; padding:12px 20px; background:linear-gradient(135deg, rgba(199,125,255,0.1) 0%, rgba(157,78,221,0.1) 100%); border-left:3px solid var(--l-violet); border-radius:0 12px 12px 0;"),
        (t.innerHTML =
            '\n      <div style="display:flex; align-items:center; gap:8px;">\n        <span style="font-size:1rem;">📜</span>\n        <span style="color:var(--l-violet); font-weight:600; font-size:0.8rem;">Narrator</span>\n        <div style="display:flex; gap:4px; margin-left:10px;">\n          <span class="typing-dot" style="width:6px; height:6px; background:var(--l-violet); border-radius:50%; animation:typingBounce 1.4s infinite ease-in-out;"></span>\n          <span class="typing-dot" style="width:6px; height:6px; background:var(--l-violet); border-radius:50%; animation:typingBounce 1.4s infinite ease-in-out 0.2s;"></span>\n          <span class="typing-dot" style="width:6px; height:6px; background:var(--l-violet); border-radius:50%; animation:typingBounce 1.4s infinite ease-in-out 0.4s;"></span>\n        </div>\n      </div>\n    '),
        e.appendChild(t),
        (e.scrollTop = e.scrollHeight);
}
function buildGroupContext(e, t) {
    let n = "";
    const playerAbsent = e.settings?.playerAbsent,
        npcFirstName = t.name.split(" ")[0],
        anchorParts = [];
    e.name && anchorParts.push(`This group chat is called "${e.name}".`),
        e.settings?.scenarioContext && anchorParts.push(`Current scenario/scene: ${e.settings.scenarioContext}`),
        e.pretext && anchorParts.push(`Scene setting: ${e.pretext}`),
        e.currentTopic &&
            !playerAbsent &&
            anchorParts.push(`Current topic: ${e.currentTopic} — the Boss raised this and wants to discuss it.`),
        anchorParts.length > 0 && (n += `[Why this conversation is happening]\n${anchorParts.join("\n")}\n\n`),
        e.contextSummary &&
            !1 !== e.settings?.includeContext &&
            (n += `[Background context from previous conversation]\n${e.contextSummary}\n\n`);
    const clipSnippet = (s) => {
        if (s.length <= 150) return s;
        const cut = s.slice(0, 150),
            end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
        if (end > 40) return cut.slice(0, end + 1);
        const sp = cut.lastIndexOf(" ");
        return (sp > 40 ? cut.slice(0, sp) : cut.slice(0, 147)) + "...";
    };
    const a = gameState.chatHistory?.[t.id] || [];
    if (a.length > 0 && !playerAbsent) {
        const hist = a.filter((m) => !m.isSystem && m.content && m.content.length >= 30).slice(-5);
        hist.length > 0 &&
            ((n += "[Your recent 1-on-1 history with the Boss]\n"),
            hist.forEach((m) => {
                n += `${m.isPlayer ? "Boss" : npcFirstName}: ${clipSnippet(m.content)}\n`;
            }),
            (n += "\n"));
    }
    const o = e.participantIds
        .filter((e) => e !== t.id)
        .map((e) => gameState.employees.find((t) => t.id === e))
        .filter(Boolean);
    o.length > 0 &&
        ((n += "[Who else is in this group chat]\n"),
        o.forEach((e) => {
            (n += `- ${e.name}: ${e.role || "Employee"}`),
                e.personality && (n += `. Personality: ${formatPersonality(e.personality)}`);
            const a = getInterEmployeeRelationship(t, e);
            a && (n += `. ${a}`), (n += "\n");
        }),
        playerAbsent ||
            (n += "The Boss is the player character and your superior. They are present in this chat.\n"),
        (n += "\n"));
    const i = e.messages.slice(-15),
        fmtMsg = (m) => (m.isSystem ? `[System: ${m.content}]` : `${m.isPlayer ? "Boss" : m.sender}: ${m.content}`),
        timeGap = (prev, cur) => {
            if (!prev?.timestamp || !cur?.timestamp) return "";
            const gap = cur.timestamp - prev.timestamp;
            return gap > 72e6 ? "(the next day)\n" : gap > 108e5 ? "(hours later)\n" : "";
        };
    let lastBossIdx = -1;
    if (!playerAbsent)
        for (let k = i.length - 1; k >= 0; k--)
            if (i[k].isPlayer) {
                lastBossIdx = k;
                break;
            }
    if (i.length > 0)
        if (-1 === lastBossIdx)
            (n += "[Recent group conversation]\n"),
                i.forEach((m, k) => {
                    n += timeGap(i[k - 1], m) + fmtMsg(m) + "\n";
                });
        else {
            const before = i.slice(0, lastBossIdx),
                bossMsg = i[lastBossIdx],
                after = i.slice(lastBossIdx + 1);
            before.length > 0 &&
                ((n += "[Earlier in this conversation]\n"),
                before.forEach((m, k) => {
                    n += timeGap(before[k - 1], m) + fmtMsg(m) + "\n";
                }),
                (n += "\n"));
            (n += "[The Boss's most recent message — this is what you are responding to]\n"),
                (n += timeGap(before[before.length - 1], bossMsg)),
                (n += `Boss: ${bossMsg.content}\n`);
            const intent = bossMsg.intent || classifyBossIntent(bossMsg.content, null);
            intent?.note && (n += `Read on the Boss's message: ${intent.note}\n`),
                (n += "\n[Replies from coworkers since then]\n"),
                after.length > 0
                    ? (after.forEach((m) => {
                          n += fmtMsg(m) + "\n";
                      }),
                      (n +=
                          "These are other people's takes on the same message. Do not copy their tone, jokes, or targets — form your own reaction.\n"))
                    : (n += "(none — you are responding first)\n");
        }
    return n;
}
function getInterEmployeeRelationship(e, t) {
    const n = e.memory?.employeeOpinions?.[t.id];
    t.memory?.employeeOpinions?.[e.id];
    if (n) return `You think of ${t.name.split(" ")[0]} as ${n}`;
    if (e.role && t.role) {
        if (
            e.role.toLowerCase().includes(t.role.toLowerCase().split(" ")[0]) ||
            t.role.toLowerCase().includes(e.role.toLowerCase().split(" ")[0])
        )
            return "Works in similar area";
    }
    return null;
}
function classifyBossIntent(text, group) {
    const msg = (text || "").trim();
    if (!msg) return null;
    const lower = msg.toLowerCase(),
        hasHumor = /[\u{1F300}-\u{1FAFF}☀-➿]/u.test(msg) || /\b(lol|lmao|haha|hehe)\b/i.test(lower) || /\*[^*]+\*/.test(msg),
        socialQuestion = /\b(how (are|is|was) (we|you|everyone)|how'?s (it|everyone|everybody)|what'?s up|feeling (today|this))\b/i.test(lower),
        topicMatch = lower.match(
            /(?:wanted to (?:meet to )?talk about|let'?s (?:discuss|talk about)|here to (?:talk about|discuss)|this (?:meeting|chat) is about|need to (?:discuss|talk about))\s+(.{3,80}?)(?=[.!?,;]|$)/
        );
    let topic = null;
    topicMatch && ((topic = topicMatch[1].trim()), group && (group.currentTopic = topic));
    const isReprimand =
            /\b(unfortunately|disappoint\w*|not (good|great|acceptable|okay|happy)|slack\w*|falling behind|behind (on|schedule)|concern\w*|underperform\w*|we need to talk|problem|unacceptable|frustrat\w*)\b/i.test(
                lower
            ),
        isRedirect =
            /\b(anyway|anyways|back to|moving on|focus|losing the plot|lost the plot|as i was saying|let'?s get (back|serious|on track)|can we (get|talk|focus)|seriously though|enough of|knock it off|i'?m serious)\b/i.test(
                lower
            ),
        isBusiness =
            /\b(targets?|performance|budget|deadline|review|quarter\w*|revenue|profits?|metrics|numbers|projections?|agenda|productivity|kpis?|hiring|payroll)\b/i.test(
                lower
            );
    let register, note;
    isReprimand && !hasHumor
        ? ((register = "reprimand"),
          (note =
              "The Boss is voicing criticism or disappointment. Take it seriously — joking past it would read as not listening."))
        : isRedirect && !hasHumor
          ? ((register = "redirect"),
            (note =
                "The Boss is steering the conversation somewhere specific and sounds done with the banter. This is a redirect, not an invitation to riff."))
          : (topic || isBusiness) && !hasHumor
            ? ((register = "business"),
              (note = "The Boss is raising a work matter and wants a substantive conversation about it."))
            : msg.endsWith("?") && !socialQuestion
              ? ((register = "question"), (note = "The Boss asked a question and is expecting an actual answer."))
              : ((register = "casual"), (note = "The Boss is being casual. Relaxed conversation is fine."));
    if (group)
        if ("casual" === register) group.redirectStreak = 0;
        else if ("question" !== register) {
            group.redirectStreak = (group.redirectStreak || 0) + 1;
            group.redirectStreak >= 2 &&
                (note +=
                    " The Boss has now tried more than once to bring this conversation back on track. Another joke would read as ignoring your boss.");
        }
    return { register, note, topic };
}
// Assembles the instruction-foregrounding tail for a group reply (Phase 3, Bugs A+C):
// active-state block + addressed-instruction framing + situational-awareness, so the prompt
// ends on the player's instruction instead of coworker noise. Returns "" for idle/ambient
// turns (no instruction) beyond any always-true active-status block. Reuses the shared solo
// helpers so group and solo foreground identically.
// The player's most-recent instruction in a group (the message NPCs are responding to).
// Empty when the Boss is absent (idle/ambient turns) so the foreground tail stays silent.
function latestBossInstruction(group) {
    if (!group || group.settings?.playerAbsent) return "";
    const msgs = group.messages || [];
    for (let i = msgs.length - 1; i >= 0; i--) {
        const m = msgs[i];
        if (m && m.isPlayer && !m.isSystem && m.content) return m.content;
    }
    return "";
}
function groupInstructionTail(group, npc, instruction) {
    const roster = (group.participantIds || [])
        .map((id) => gameState.employees.find((x) => x.id === id))
        .filter(Boolean);
    const focus = buildInstructionFocusBlock(npc, instruction, roster);
    const signal = { incoming: instruction, addressedOther: !!instructionTargetsOther(npc, instruction, roster) };
    const parts = [
        buildCurrentStateBlock(npc, { lastMessage: instruction || "" }),
        focus,
        focus ? buildSituationalAwarenessBlock() : "",
        buildEmotionHintBlock(npc, signal),
        buildEventMemoryBlock(npc),
        buildVoiceBlock(npc),
    ]
        .map((s) => (s || "").trim())
        .filter(Boolean);
    return parts.length ? "\n\n" + parts.join("\n\n") : "";
}
function buildGroupResponsePrompt(e, t, n, a = null, instruction = "") {
    ensureEmployeeMemory(t);
    const o = t.bioData?.bio || t.bio || "",
        i = formatPersonality(t.personality) || "friendly and professional",
        s = t.mood || "neutral",
        r = t.stats?.friendship || 50,
        l = t.stats?.trust || 50;
    let c = "professional acquaintance";
    r > 80 && l > 80
        ? (c = "very close friend they trust deeply")
        : r > 60
          ? (c = "friendly colleague")
          : r < 30 && (c = "distant coworker");
    const d = e.settings?.playerAbsent;
    let p = "";
    a &&
        (p = `\n[IMPORTANT: Direct your response to ${a.name}. You are talking TO ${a.name.split(" ")[0]}, not to the Boss. Address them by name.]`);
    let m = "";
    d &&
        (m =
            "\n[SCENE NOTE: The Boss is NOT present in this scene. Do NOT address or reference the Boss. This is a conversation between employees only. Talk to the other characters in the group.]");
    const u = getConsentPolicy(),
        g =
            "open" === u
                ? '🔞 WORKPLACE CULTURE: This is an open, sex-positive workplace. Explicit content, sexual references, and adult humor are NORMAL and accepted by everyone. DO NOT act shocked, prudish, or suggest keeping things "PG" or "family-friendly". Be natural and comfortable with explicit content without moralizing.'
                : "professional" === u
                  ? "WORKPLACE CULTURE: Maintain professional boundaries. Sexual content should be addressed tactfully with appropriate workplace discretion."
                  : "WORKPLACE CULTURE: Relaxed office culture. Adult content is acceptable but address it naturally based on your comfort level and relationship.",
        f = t.name.split(" ")[0],
        b = d
            ? `- Engage with the most recent message in the conversation, in your own voice.\n- React the way ${f} specifically would, given your personality and mood. You can agree, push back, ask a question, or keep it short. Real reactions, not performance.`
            : `- Respond to the Boss's most recent message first. The mood of the earlier conversation does not override what the Boss just said.\n- Match the Boss's register. If the Boss is being serious, you may briefly acknowledge the shift, but then engage with the substance. Do not answer a serious message with a bit.\n- React the way ${f} specifically would, given your personality, mood, and relationship with the Boss. You can agree, push back, feel called out, get defensive, ask a clarifying question, or keep it short. Real reactions, not performance.`;
    return `You are ${t.name}, a ${t.role || "employee"} at this company.\n\n[Who you are]\n${o ? `Bio: ${o}\n` : ""}Personality: ${i}\nCurrent mood: ${s}\n${d ? "" : `Your relationship with the Boss: ${c}`}\n${m}\n\n${n}\n[How to respond]\n${b}\n- Work is the SETTING here, not the default subject. Don't fall back to work, projects, reports, or office tasks to fill space — talk like a real person about the moment, personal life, mood, or whatever was just said. Bring work up only when it's genuinely relevant or asked about.\n- Do not reuse jokes, imagery, or running gags that already appeared above.\n- Keep it concise (2-4 sentences). Body language in *asterisks* only when it adds something — at most one per message.${p}\n\n${g}${groupInstructionTail(e, t, instruction)}\n\n[Now respond as ${t.name}. Write only your message, nothing else.]`;
}
function addGroupTypingIndicator(e) {
    const t = $("groupMessages");
    if (!t) return;
    removeGroupTypingIndicator();
    const n = e.profileImage || e.generatedPortrait || "",
        a = n && (n.startsWith("http") || n.startsWith("data:")),
        o = document.createElement("div");
    (o.id = "groupTypingIndicator"),
        (o.style.cssText =
            "display:flex; align-items:center; gap:12px; padding:10px 15px; background:rgba(15,52,96,0.5); border-radius:18px; align-self:flex-start; max-width:200px;"),
        (o.innerHTML = `\n      <div style="width:28px; height:28px; border-radius:50%; overflow:hidden; background:var(--surface); display:flex; align-items:center; justify-content:center;">\n        ${a ? `<img src="${n}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="font-size:1rem;">👤</span>'}\n      </div>\n      <div>\n        <div style="font-size:0.8rem; color:var(--text-dim);">${e.name.split(" ")[0]} is typing...</div>\n        <div style="display:flex; gap:4px; margin-top:4px;">\n          <span class="typing-dot" style="width:6px; height:6px; background:var(--l-indigo); border-radius:50%; animation:typingBounce 1.4s infinite ease-in-out;"></span>\n          <span class="typing-dot" style="width:6px; height:6px; background:var(--l-indigo); border-radius:50%; animation:typingBounce 1.4s infinite ease-in-out 0.2s;"></span>\n          <span class="typing-dot" style="width:6px; height:6px; background:var(--l-indigo); border-radius:50%; animation:typingBounce 1.4s infinite ease-in-out 0.4s;"></span>\n        </div>\n      </div>\n    `),
        t.appendChild(o),
        (t.scrollTop = t.scrollHeight);
}
function removeGroupTypingIndicator() {
    const e = $("groupTypingIndicator");
    e && e.remove();
}
function renderGroupMessages(e) {
    const t = $("groupMessages");
    if (t && e) {
        if (((t.innerHTML = ""), e.pretext)) {
            const n = document.createElement("div");
            (n.className = "chat-bubble chat-bubble--memory"),
                (n.style.cssText = "margin-bottom:20px; padding:15px 18px; border-radius:12px;"),
                (n.innerHTML = `\n        <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">\n          <span style="font-size:1.1rem;">📖</span>\n          <span style="color:var(--l-indigo); font-weight:600; font-size:0.85rem;">Scene Context</span>\n          <button onclick="editGroupPretext()" style="margin-left:auto; background:transparent; border:none; color:var(--text-mute); cursor:pointer; font-size:0.75rem; padding:4px 8px;" title="Edit pre-text">✏️ Edit</button>\n        </div>\n        <p style="color:var(--text-dim); font-size:0.9rem; line-height:1.5; margin:0; font-style:italic;">${e.pretext}</p>\n      `),
                t.appendChild(n);
        }
        if (0 !== e.messages.length || e.pretext) {
            if (0 === e.messages.length) {
                const e = document.createElement("div");
                return (
                    (e.style.cssText = "text-align:center; padding:20px; color:var(--l-on-accent);"),
                    (e.innerHTML =
                        '<p style="font-size:0.85rem;">Type a message and the group will respond — or tap a face above to choose who speaks next.</p>'),
                    void t.appendChild(e)
                );
            }
            e.messages.forEach((n, a) => {
                if (n.isSystem) {
                    const o = document.createElement("div");
                    if (n.imageUrl) {
                        if (
                            ((o.style.cssText =
                                "text-align:center; padding:15px; background:rgba(233,69,96,0.1); border-radius:12px; margin:15px auto; max-width:90%; border:1px solid rgba(233,69,96,0.3); position:relative;"),
                            (o.innerHTML = `\n            <div style="font-size:0.85rem; color:var(--danger); margin-bottom:10px;">${n.content || "🎬 Scene visualization"}</div>\n            <div style="position:relative; display:inline-block;">\n              <img src="${n.imageUrl}" \n                   style="max-width:100%; max-height:400px; border-radius:10px; cursor:pointer; box-shadow:0 4px 15px var(--l-veil-40);"\n                   onclick="openImageViewer('${n.imageUrl}')"\n                   onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">\n              <div style="display:none; color:var(--text-mute); font-size:0.8rem; padding:10px;">Image failed to load</div>\n            </div>\n          `),
                            n.imagePrompt)
                        ) {
                            const e = o.querySelector("img");
                            e && (e.title = n.imagePrompt);
                        }
                        const t = o.querySelector('div[style*="position:relative"]');
                        if (t) {
                            const n = document.createElement("button");
                            (n.innerHTML = "🔄"),
                                (n.style.cssText =
                                    "position:absolute; top:8px; right:8px; background:rgba(233,69,96,0.9); border:none; border-radius:50%; width:28px; height:28px; color:var(--l-ink); cursor:pointer; font-size:0.9rem; opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; z-index:10;"),
                                (n.title = "Regenerate image"),
                                t.appendChild(n),
                                t.addEventListener("mouseenter", () => (n.style.opacity = "1")),
                                t.addEventListener("mouseleave", () => (n.style.opacity = "0"));
                            const o = a;
                            n.addEventListener("click", async (t) => {
                                t.stopPropagation(), await regenerateGroupImage(e.id, o);
                            });
                        }
                    } else
                        (o.style.cssText =
                            "text-align:center; padding:8px 15px; background:rgba(102,126,234,0.1); border-radius:10px; margin:10px auto; max-width:80%; font-size:0.85rem; color:var(--text-mute);"),
                            (o.textContent = n.content);
                    return void t.appendChild(o);
                }
                if (n.isNarrator) {
                    const o = document.createElement("div");
                    (o.className = "chat-bubble chat-bubble--narrator"),
                        (o.style.cssText = "margin:15px 0; padding:15px 20px; border-radius:12px;"),
                        (o.innerHTML = `\n          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">\n            <span style="font-size:1rem;">📜</span>\n            <span style="color:var(--l-violet); font-weight:600; font-size:0.8rem;">Narrator</span>\n            <span style="font-size:0.65rem; color:rgba(199,125,255,0.5); margin-left:auto;">${n.timestamp ? getContextAwareTimestamp(n.timestamp) : ""}</span>\n          </div>\n          <p style="color:var(--l-x-violet-pale-3); font-size:0.95rem; line-height:1.6; margin:0; font-style:italic;">${styleActionText(n.content)}</p>\n        `);
                    const i = document.createElement("button");
                    return (
                        (i.innerHTML = "♻️"),
                        (i.style.cssText =
                            "position:absolute; top:10px; right:10px; background:rgba(199,125,255,0.8); border:none; border-radius:50%; width:22px; height:22px; color:var(--l-ink); cursor:pointer; font-size:0.8rem; opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center;"),
                        (i.title = "Regenerate narration"),
                        (o.style.position = "relative"),
                        o.appendChild(i),
                        o.addEventListener("mouseenter", () => (i.style.opacity = "1")),
                        o.addEventListener("mouseleave", () => (i.style.opacity = "0")),
                        i.addEventListener("click", async (t) => {
                            t.stopPropagation(), await regenerateGroupMessage(e.id, a);
                        }),
                        void t.appendChild(o)
                    );
                }
                const o = n.isPlayer,
                    i = o ? null : gameState.employees.find((e) => e.id === (n.employeeId || n.senderId)),
                    s = document.createElement("div");
                if (
                    ((s.style.cssText =
                        "display:flex; gap:10px; align-items:flex-start; " +
                        (o ? "flex-direction:row-reverse;" : "")),
                    !o && i)
                ) {
                    const e = i.profileImage || i.generatedPortrait || "",
                        t = e && (e.startsWith("http") || e.startsWith("data:")),
                        n = document.createElement("div");
                    (n.style.cssText =
                        "width:36px; height:36px; border-radius:50%; overflow:hidden; background:var(--surface); flex-shrink:0; display:flex; align-items:center; justify-content:center;"),
                        (n.innerHTML = t
                            ? `<img src="${e}" style="width:100%; height:100%; object-fit:cover;">`
                            : '<span style="font-size:1.2rem;">👤</span>'),
                        s.appendChild(n);
                }
                const r = document.createElement("div");
                if (
                    ((r.className = "chat-bubble " + (o ? "chat-bubble--self" : "chat-bubble--other")),
                    (r.style.cssText =
                        "max-width:70%; padding:10px 15px; border-radius:18px; position:relative; " +
                        (o ? "border-bottom-right-radius:4px;" : "border-bottom-left-radius:4px;")),
                    !o)
                ) {
                    const e = document.createElement("div");
                    e.style.cssText = "font-size:0.75rem; color:var(--l-indigo); font-weight:600; margin-bottom:4px;";
                    let t = n.sender;
                    if (n.targetedCharacter) {
                        const e = gameState.employees.find((e) => e.id === n.targetedCharacter);
                        e && (t += ` → ${e.name.split(" ")[0]}`);
                    }
                    n.isDoCommand ? (t += " 🎬") : n.isIdleChat && (t += " 💭"),
                        (e.textContent = t),
                        r.appendChild(e);
                }
                const l = document.createElement("div");
                if (
                    ((l.style.cssText = "word-wrap:break-word;"),
                    (l.innerHTML = styleActionText(n.content)),
                    r.appendChild(l),
                    n.imageUrl)
                ) {
                    const t = document.createElement("div");
                    t.style.cssText = "margin-top:10px; position:relative;";
                    const o = document.createElement("img");
                    (o.src = n.imageUrl),
                        (o.style.cssText =
                            "max-width:100%; max-height:300px; border-radius:10px; cursor:pointer; display:block;"),
                        (o.onclick = () => openImageViewer(n.imageUrl)),
                        (o.onerror = function () {
                            this.style.display = "none";
                        }),
                        n.imagePrompt && (o.title = n.imagePrompt),
                        t.appendChild(o);
                    const i = document.createElement("button");
                    (i.innerHTML = "🔄"),
                        (i.style.cssText =
                            "position:absolute; top:8px; right:8px; background:rgba(233,69,96,0.9); border:none; border-radius:50%; width:28px; height:28px; color:var(--l-ink); cursor:pointer; font-size:0.9rem; opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; z-index:10;"),
                        (i.title = "Regenerate image"),
                        t.appendChild(i),
                        t.addEventListener("mouseenter", () => (i.style.opacity = "1")),
                        t.addEventListener("mouseleave", () => (i.style.opacity = "0")),
                        i.addEventListener("click", async (t) => {
                            t.stopPropagation(), await regenerateGroupImage(e.id, a);
                        }),
                        r.appendChild(t);
                }
                const c = document.createElement("div");
                if (
                    ((c.style.cssText =
                        "font-size:0.65rem; color:var(--l-sheen-40); margin-top:4px; text-align:right;"),
                    (c.textContent = n.timestamp ? getContextAwareTimestamp(n.timestamp) : ""),
                    r.appendChild(c),
                    !o && !n.isSystem)
                ) {
                    const t = document.createElement("button");
                    (t.innerHTML = "♻️"),
                        (t.style.cssText =
                            "position:absolute; top:5px; right:5px; background:rgba(33,150,243,0.8); border:none; border-radius:50%; width:22px; height:22px; color:var(--l-ink); cursor:pointer; font-size:0.8rem; opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center;"),
                        (t.title = "Regenerate this response"),
                        r.appendChild(t),
                        r.addEventListener("mouseenter", () => (t.style.opacity = "1")),
                        r.addEventListener("mouseleave", () => (t.style.opacity = "0")),
                        t.addEventListener("click", async (t) => {
                            t.stopPropagation(), await regenerateGroupMessage(e.id, a);
                        });
                }
                s.appendChild(r), t.appendChild(s);
            }),
                (t.scrollTop = t.scrollHeight);
        } else
            t.innerHTML =
                '\n        <div style="text-align:center; padding:40px; color:var(--l-on-accent);">\n          <div style="font-size:2rem; margin-bottom:10px; opacity:0.5;">💬</div>\n          <p>No messages yet. Start the conversation!</p>\n          <p style="font-size:0.85rem; color:var(--l-on-accent); margin-top:10px;">Type a message and the group will respond — or tap a face above to choose who speaks next.</p>\n        </div>\n      ';
    }
}
async function regenerateGroupMessage(e, t) {
    const n = gameState.groups?.find((t) => t.id === e);
    if (!n) return;
    const a = n.messages[t];
    if (!a || a.isPlayer || a.isSystem) return;
    if (a.isNarrator) {
        addNarratorTypingIndicator();
        try {
            n.messages = n.messages.slice(0, t);
            const e = buildNarratorPrompt(n, buildNarratorContext(n)),
                a = sanitizeNpcResponse(await queuedGenerateText(e, {}, "Regenerating narration"), 8);
            removeGroupTypingIndicator(),
                n.messages.push({
                    sender: "Narrator",
                    content: a,
                    isNarrator: !0,
                    isPlayer: !1,
                    timestamp: gameState.time?.currentTime || Date.now(),
                }),
                renderGroupMessages(n),
                saveGame(!1),
                showNotification("Narration regenerated!", 1500);
        } catch (e) {
            console.error("Error regenerating narration:", e),
                removeGroupTypingIndicator(),
                showNotification("Failed to regenerate", 2e3);
        }
        return;
    }
    const o = gameState.employees.find((e) => e.id === (a.employeeId || a.senderId));
    if (!o) return void showNotification("Couldn't find this message's sender to regenerate", 2e3);
    if (a.imageUrl) {
        // Image message: keep the photo, regenerate only the caption (in place — don't truncate the thread).
        // Rebuild the caption prompt the way the original builder does (group context + photo type +
        // original description) so the regen reproduces the original intent with variation rather than
        // reverting to a generic line or writing a disconnected new sentence.
        addGroupTypingIndicator(o);
        try {
            const groupCtx = ("function" == typeof buildGroupContext ? buildGroupContext(n, o) : "").trim(),
                reqType = a.imageReqType || (a.nude ? "nude" : "casual"),
                desc = a.imageDesc ? ` (${a.imageDesc})` : "",
                e = `You are ${o.name}, in a group chat with your boss and colleagues.\n${groupCtx ? groupCtx + "\n\n" : ""}You just sent a ${reqType} photo${desc} in response to the conversation above. Write a very short message (a few words) to accompany the photo that fits naturally with what's being discussed. No quotation marks.`,
                i =
                    extractText(await queuedGenerateText(e, { max_tokens: 30 }, `Regenerating ${o.name}'s caption`)).trim() ||
                    ("explicit" === reqType ? "😈" : "nude" === reqType ? "🙈" : "📸");
            removeGroupTypingIndicator(),
                (a.content = i),
                (a.regeneratedAt = Date.now()),
                renderGroupMessages(n),
                saveGame(!1),
                showNotification("Caption regenerated!", 1500);
        } catch (e) {
            console.error("Error regenerating caption:", e),
                removeGroupTypingIndicator(),
                showNotification("Failed to regenerate", 2e3);
        }
        return;
    }
    addGroupTypingIndicator(o);
    try {
        n.messages = n.messages.slice(0, t);
        const e = buildGroupResponsePrompt(n, o, buildGroupContext(n, o), null, latestBossInstruction(n)),
            r = sanitizeNpcResponse(await queuedGenerateText(e, {}, `Regenerating ${o.name}'s response`), 5);
        removeGroupTypingIndicator(),
            n.messages.push({
                sender: o.name,
                employeeId: o.id,
                content: r,
                isPlayer: !1,
                timestamp: gameState.time?.currentTime || Date.now(),
            }),
            renderGroupMessages(n),
            saveGame(!1),
            showNotification("Message regenerated!", 1500);
    } catch (e) {
        console.error("Error regenerating message:", e),
            removeGroupTypingIndicator(),
            showNotification("Failed to regenerate", 2e3);
    }
}
async function regenerateGroupImage(e, t) {
    const n = gameState.groups?.find((t) => t.id === e);
    if (!n) return;
    const a = n.messages[t];
    if (!a || !a.imageUrl) return;
    const o = a.employeeId || a.senderId ? gameState.employees.find((e) => e.id === (a.employeeId || a.senderId)) : null;
    showNotification("🔄 Regenerating image...", 2e3);
    try {
        let e;
        if ("group-photo" === a.imageType) {
            // Prefer the stored original prompt so the regen replays the original photo
            // description (parity with solo). Fall back to a rebuild only for legacy messages.
            let i = a.imagePrompt;
            if (!i) {
                const t = n.participantIds.map((e) => gameState.employees.find((t) => t.id === e)).filter(Boolean),
                    a = t
                        .map((e) => {
                            const t = getPhysicalDescriptionForPrompt(e);
                            return `${e.name}: ${t}`;
                        })
                        .join("\\n"),
                    o = n.settings?.scenarioContext || n.pretext || "office setting";
                i = `Group photo of ${t.length} people together:\\n${a}\\nScene/Setting: ${o}\\nCasual group photo, everyone smiling, standing together.\\nCreate a cohesive group photo showing all ${t.length} people in frame.`;
            }
            e = await queuedGenerateImage(applyImageStyle(i), "Regenerating group photo");
        } else if ("group-scene" === a.imageType) {
            // Replay the stored scene prompt (the description that produced the original image),
            // mirroring solo regen. Only legacy messages without one fall back to a minimal rebuild.
            let i = a.imagePrompt;
            if (!i) {
                i = n.messages
                    .slice(Math.max(0, t - 10), t)
                    .map((e) => `${e.sender || "Player"}: ${e.content}`)
                    .join("\\n");
            }
            e = await queuedGenerateImage(applyImageStyle(applyPerspective(i)), "Regenerating scene visualization");
        } else if (o) {
            const n =
                a.imagePrompt ||
                `${getPhysicalDescriptionForPrompt(o, { nude: !!a.nude })}, ${a.nude ? "nude, " : ""}${a.imageType || "selfie"} photo, selfie, looking at camera`;
            if (
                ((e = await queuedGenerateImage(
                    applyImageStyle(applyPerspective(n)),
                    `Regenerating ${o.name}'s photo`
                )),
                o.photoGallery)
            ) {
                const t = o.photoGallery.find((e) => e.url === a.imageUrl);
                t && ((t.url = e), (t.regeneratedAt = Date.now()));
            }
        } else {
            const t = a.imagePrompt || "professional photo, high quality";
            e = await queuedGenerateImage(applyImageStyle(t), "Regenerating image");
        }
        e && "string" == typeof e && (e.startsWith("http") || e.startsWith("data:") || e.startsWith("blob:"))
            ? ((a.imageUrl = e),
              (a.regeneratedAt = Date.now()),
              renderGroupMessages(n),
              saveGame(!1),
              showNotification("✅ Image regenerated!", 1500))
            : showNotification("❌ Failed to regenerate image", 2e3);
    } catch (e) {
        console.error("Error regenerating group image:", e), showNotification("❌ Failed to regenerate image", 2e3);
    }
}
async function deleteGroup(e) {
    const t = gameState.groups?.findIndex((t) => t.id === e);
    if (void 0 === t || -1 === t) return;
    const n = gameState.groups[t];
    if (
        await showConfirm(`Delete group "${n.name}"? This cannot be undone.`, "Delete Group", {
            type: "danger",
            confirmText: "Delete",
        })
    ) {
        if ((gameState.groups.splice(t, 1), gameState.activeGroup === e)) {
            gameState.activeGroup = null;
            const e = $("noGroupSelected"),
                t = $("activeGroupChat");
            e && (e.style.display = "flex"), t && (t.style.display = "none");
        }
        renderGroupsList(), saveGame(!1), showNotification("Group deleted", 2e3);
    }
}
async function editGroupName() {
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!e) return;
    const t = await showPrompt("Enter new group name:", "Rename Group", { defaultValue: e.name });
    if (t && t.trim() && t.trim() !== e.name) {
        e.name = t.trim();
        const n = $("groupTitle");
        n && (n.textContent = e.name), renderGroupsList(), saveGame(!1), showNotification("Group renamed!", 1500);
    }
}
function openGroupSettings() {
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!e) return;
    const t = $("groupSettingsModal"),
        n = $("editGroupName"),
        a = $("groupContextEnabled"),
        o = $("groupScenarioContext"),
        i = $("groupPretextEdit"),
        s = $("groupNarratorEnabled");
    n && (n.value = e.name),
        a && (a.checked = !1 !== e.settings?.includeContext),
        o && (o.value = e.settings?.scenarioContext || ""),
        i && (i.value = e.pretext || ""),
        s && (s.checked = e.hasNarrator || !1);
    const r = $("groupReplyLimit"),
        l = $("groupReplyLimitVal");
    r &&
        ((r.value = e.settings?.replyLimit ?? 2),
        (r.oninput = () => {
            l && (l.textContent = "0" === r.value ? "Manual" : r.value);
        }),
        r.oninput());
    const c = $("groupPlayerAbsent"),
        d = $("playerAbsenceExplanation");
    c &&
        ((c.checked = e.settings?.playerAbsent || !1),
        (c.onchange = () => {
            d && (d.style.display = c.checked ? "block" : "none");
        }),
        c.onchange());
    const p = $("groupInterCharacterChat"),
        m = $("interCharSettings"),
        u = $("interCharTargetChance"),
        g = $("interCharTargetVal"),
        h = e.settings?.interCharacterChat || {};
    p &&
        ((p.checked = h.enabled || !1),
        (p.onchange = () => {
            m &&
                ((m.style.opacity = p.checked ? "1" : "0.5"),
                (m.style.pointerEvents = p.checked ? "auto" : "none"));
        }),
        p.onchange()),
        u &&
            ((u.value = h.targetChance || 15),
            (u.oninput = () => {
                g && (g.textContent = u.value + "%");
            }),
            u.oninput());
    const y = $("groupIdleConversations"),
        f = $("idleConvSettings"),
        b = $("groupIdleThreshold"),
        v = e.settings?.idleConversations || {};
    y &&
        ((y.checked = v.enabled || !1),
        (y.onchange = () => {
            f &&
                ((f.style.opacity = y.checked ? "1" : "0.5"),
                (f.style.pointerEvents = y.checked ? "auto" : "none"));
        }),
        y.onchange()),
        b && (b.value = v.threshold || 120);
    const w = $("groupAutoVisEnabled"),
        x = $("groupAutoVisSettings"),
        S = $("groupAutoVisMinFreq"),
        k = $("groupAutoVisMaxFreq"),
        T = $("groupAutoVisMinVal"),
        C = $("groupAutoVisMaxVal"),
        E = $("groupAutoVisIncludePlayer"),
        I = $("groupAutoVisIntensity"),
        M = e.settings?.autoVisualization || {};
    w &&
        ((w.checked = M.enabled || !1),
        (w.onchange = () => {
            x &&
                ((x.style.opacity = w.checked ? "1" : "0.5"),
                (x.style.pointerEvents = w.checked ? "auto" : "none"));
        }),
        w.onchange()),
        S &&
            ((S.value = M.minFreq || 5),
            (S.oninput = () => {
                T && (T.textContent = S.value);
            }),
            S.oninput()),
        k &&
            ((k.value = M.maxFreq || 12),
            (k.oninput = () => {
                C && (C.textContent = k.value);
            }),
            k.oninput()),
        E && (E.checked = !1 !== M.includePlayer),
        I && (I.checked = M.intensityDetection || !1),
        renderManageParticipants(e),
        t && (t.style.display = "flex");
}
async function editGroupPretext() {
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!e) return;
    const t = await showPrompt("Edit Scene Pre-text:", "Edit Pre-text", {
        defaultValue: e.pretext || "",
        multiline: !0,
        placeholder: "Enter context that shapes NPC responses...",
    });
    null !== t &&
        ((e.pretext = t.trim()), renderGroupMessages(e), saveGame(!1), showNotification("Pre-text updated!", 1500));
}
function closeGroupSettings() {
    const e = $("groupSettingsModal");
    e && (e.style.display = "none");
}
function renderManageParticipants(e) {
    const t = $("manageParticipants");
    if (!t) return;
    const n = e.participantIds.map((e) => gameState.employees.find((t) => t.id === e)).filter(Boolean);
    t.innerHTML = n
        .map((e) => {
            const t = e.profileImage || e.generatedPortrait || "";
            return `\n        <div style="display:flex; align-items:center; gap:8px; padding:6px 12px; background:var(--surface); border-radius:20px;">\n          <div style="width:24px; height:24px; border-radius:50%; overflow:hidden; background:var(--surface-2); display:flex; align-items:center; justify-content:center;">\n            ${t && (t.startsWith("http") || t.startsWith("data:")) ? `<img src="${t}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="font-size:0.9rem;">👤</span>'}\n          </div>\n          <span style="font-size:0.85rem; color:var(--l-ink);">${e.name.split(" ")[0]}</span>\n          ${n.length > 2 ? `<button onclick="removeParticipantFromGroup('${e.id}')" style="background:transparent; border:none; color:var(--danger); cursor:pointer; padding:0; font-size:0.8rem;">✕</button>` : ""}\n        </div>\n      `;
        })
        .join("");
}
function removeParticipantFromGroup(e) {
    const t = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!t || t.participantIds.length <= 2)
        return void showNotification("Group must have at least 2 participants", 2e3);
    const n = t.participantIds.indexOf(e);
    n > -1 && (t.participantIds.splice(n, 1), renderManageParticipants(t), saveGame(!1));
}
function reconcileGroupParticipants() {
    if (!Array.isArray(gameState.groups) || 0 === gameState.groups.length) return 0;
    let e = 0;
    if (
        (gameState.groups.forEach((t) => {
            if (!Array.isArray(t.participantIds)) return void (t.participantIds = []);
            const n = t.participantIds.length;
            (t.participantIds = t.participantIds.filter((e) => {
                const t = gameState.employees.find((t) => t.id === e);
                return t && t.hired && "active" === t.employmentStatus;
            })),
                (e += n - t.participantIds.length);
        }),
        Array.isArray(gameState.groupSpeakerQueue) && gameState.groupSpeakerQueue.length)
    ) {
        const e = gameState.groups.find((e) => e.id === gameState.activeGroup),
            t = e ? e.participantIds : [];
        gameState.groupSpeakerQueue = gameState.groupSpeakerQueue.filter(
            (e) => "__narrator__" === e || t.includes(e)
        );
    }
    return e;
}
function saveGroupSettings() {
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!e) return;
    const t = $("editGroupName"),
        n = $("groupContextEnabled"),
        a = $("groupScenarioContext"),
        o = $("groupPretextEdit"),
        i = $("groupNarratorEnabled"),
        s = $("groupPlayerAbsent"),
        r = $("groupInterCharacterChat"),
        l = $("interCharTargetChance"),
        c = $("groupIdleConversations"),
        d = $("groupIdleThreshold");
    t && t.value.trim() && (e.name = t.value.trim()),
        e.settings || (e.settings = {}),
        (e.settings.includeContext = !1 !== n?.checked),
        (e.settings.scenarioContext = a?.value?.trim() || "");
    const p = $("groupReplyLimit"),
        replyLimitParsed = parseInt(p?.value, 10);
    (e.settings.replyLimit = Number.isNaN(replyLimitParsed) ? 2 : replyLimitParsed),
        o && (e.pretext = o.value.trim() || null);
    e.hasNarrator;
    (e.hasNarrator = i?.checked || !1),
        (e.settings.playerAbsent = s?.checked || !1),
        (e.settings.interCharacterChat = { enabled: r?.checked || !1, targetChance: parseInt(l?.value) || 15 }),
        (e.settings.idleConversations = { enabled: c?.checked || !1, threshold: parseInt(d?.value) || 120 });
    const m = $("groupAutoVisEnabled"),
        u = $("groupAutoVisMinFreq"),
        g = $("groupAutoVisMaxFreq"),
        h = $("groupAutoVisIncludePlayer"),
        y = $("groupAutoVisIntensity");
    (e.settings.autoVisualization = {
        enabled: m?.checked || !1,
        minFreq: parseInt(u?.value) || 5,
        maxFreq: parseInt(g?.value) || 12,
        includePlayer: !1 !== h?.checked,
        intensityDetection: y?.checked || !1,
    }),
        e.settings.autoVisualization.enabled &&
            !e.autoVisTracker &&
            (e.autoVisTracker = {
                messagesSinceLastVis: 0,
                nextTriggerAt: getRandomInt(
                    e.settings.autoVisualization.minFreq,
                    e.settings.autoVisualization.maxFreq
                ),
                totalVisualizations: 0,
            });
    const f = $("groupTitle");
    f && (f.textContent = e.name),
        renderGroupsList(),
        renderGroupMessages(e),
        renderParticipantSelectorBar(e),
        closeGroupSettings(),
        saveGame(!1),
        showNotification("Settings saved!", 1500);
}
async function regenerateGroupPretextFromSettings() {
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!e) return;
    const t = $("groupPretextEdit"),
        n = $("regeneratePretext");
    if (!t) return;
    const a = e.messages.slice(-25).filter((e) => !e.isSystem);
    if (a.length < 3) showNotification("Need more conversation to generate pre-text", 2e3);
    else {
        n && ((n.disabled = !0), (n.innerHTML = "⏳ Generating..."));
        try {
            const n = e.participantIds
                    .map((e) => gameState.employees.find((t) => t.id === e)?.name)
                    .filter(Boolean),
                o = a
                    .map(
                        (e) =>
                            `${e.isPlayer ? "You (the boss)" : gameState.employees.find((t) => t.id === e.senderId)?.name || "Unknown"}: ${e.content}`
                    )
                    .join("\n"),
                i = `You are creating a vivid "Pre-text" scene summary for a group chat.\n\nThis pre-text will set the scene and provide narrative context displayed at the top of the conversation.\n\nGroup participants: ${n.join(", ")}\n\nRecent conversation:\n${o}\n\nWrite an engaging pre-text (3-5 sentences) that:\n- Describes the setting/scene (where, when, atmosphere)\n- Captures the emotional tone and dynamic\n- Sets up context for the conversation\n\nWrite in present tense, third person perspective. Be evocative and specific.\n\nPre-text:`,
                s = (await queuedGenerateText(i, {}, "Regenerating pre-text")).trim().replace(/^["']|["']$/g, "");
            (t.value = s), showNotification("Pre-text regenerated!", 2e3);
        } catch (e) {
            console.error("Failed to regenerate pretext:", e), showNotification("Failed to generate pre-text", 2e3);
        } finally {
            n && ((n.disabled = !1), (n.innerHTML = "🔄 Regenerate with AI"));
        }
    }
}
async function autoGenerateGroupScenarioContext() {
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!e) return;
    const t = $("groupScenarioContext"),
        n = $("autoGenerateGroupContext");
    if (!t) return;
    const a = e.messages.slice(-20).filter((e) => !e.isSystem);
    if (a.length < 3) showNotification("Need more conversation to generate context", 2e3);
    else {
        n && ((n.disabled = !0), (n.innerHTML = "⏳ Generating..."));
        try {
            const n = e.participantIds
                    .map((e) => gameState.employees.find((t) => t.id === e)?.name)
                    .filter(Boolean),
                o = a.map((e) => `${e.sender}: ${e.content}`).join("\n"),
                i = `Analyze this group chat conversation and create a brief, vivid scenario context description (2-3 sentences max). \nDescribe: Where they seem to be, what's happening, the mood/atmosphere, and any implicit situation.\nWrite in present tense, as if setting a scene.\n\nParticipants: ${n.join(", ")}\nGroup name: ${e.name}\n\nRecent conversation:\n${o}\n\nScenario context (2-3 sentences, vivid and specific):`,
                s = (await queuedGenerateText(i, {}, "Generating scenario context"))
                    .trim()
                    .replace(/^["']|["']$/g, "");
            (t.value = s), showNotification("✨ Context generated!", 1500);
        } catch (e) {
            console.error("Error generating context:", e), showNotification("Failed to generate context", 2e3);
        } finally {
            n && ((n.disabled = !1), (n.innerHTML = "✨ Auto-Generate from Chat"));
        }
    }
}
function clearGroupScenarioContext() {
    const e = $("groupScenarioContext");
    e && ((e.value = ""), showNotification("Context cleared", 1e3));
}
async function autoGenerateChatScenarioContext() {
    const e = gameState.activeChatEmployee;
    if (!e) return;
    const t = gameState.employees.find((t) => t.id === e),
        n = gameState.chatHistory?.[e] || [],
        a = $("chatScenarioContext"),
        o = $("autoGenerateChatContext");
    if (!a || !t) return;
    const i = n.slice(-15).filter((e) => !e.isSystem && e.content);
    if (i.length < 3) showNotification("Need more conversation to generate context", 2e3);
    else {
        o && ((o.disabled = !0), (o.innerHTML = "⏳..."));
        try {
            const e = i.map((e) => `${e.isPlayer ? "You" : t.name}: ${e.content}`).join("\n"),
                n = `Analyze this 1-on-1 chat conversation and create a brief scenario context (1-2 sentences).\nDescribe: Where they seem to be, what's happening between them, and the current dynamic/mood.\nWrite in present tense, intimate/personal tone.\n\nPerson: ${t.name} (${t.role || "Employee"})\nPersonality: ${t.personality || "unknown"}\n\nRecent conversation:\n${e}\n\nScenario context (1-2 sentences, specific and evocative):`,
                o = (await queuedGenerateText(n, {}, "Generating chat context")).trim().replace(/^["']|["']$/g, "");
            (a.value = o),
                t.chatSettings || (t.chatSettings = {}),
                (t.chatSettings.scenarioContext = o),
                saveGame(!1),
                showNotification("✨ Context generated!", 1500);
        } catch (e) {
            console.error("Error generating context:", e), showNotification("Failed to generate context", 2e3);
        } finally {
            o && ((o.disabled = !1), (o.innerHTML = "✨ Auto-Generate"));
        }
    }
}
function clearChatScenarioContext() {
    const e = gameState.activeChatEmployee,
        t = gameState.employees.find((t) => t.id === e),
        n = $("chatScenarioContext");
    n && (n.value = ""),
        t && (t.chatSettings || (t.chatSettings = {}), (t.chatSettings.scenarioContext = ""), saveGame(!1)),
        showNotification("Context cleared", 1e3);
}
function saveChatScenarioContext() {
    const e = gameState.activeChatEmployee,
        t = gameState.employees.find((t) => t.id === e),
        n = $("chatScenarioContext");
    if (!t || !n) return;
    t.chatSettings || (t.chatSettings = {}), (t.chatSettings.scenarioContext = n.value.trim());
    const a = $("chatStatus");
    a &&
        (t.chatSettings.scenarioContext
            ? ((a.innerHTML = '<span style="color:var(--l-indigo);">📍 Scene Active</span>'),
              (a.title = t.chatSettings.scenarioContext))
            : t.npcStatus
              ? ((a.innerHTML = getNPCStatusBadgeHTML(t)), (a.title = t.npcStatus.richLabel || t.npcStatus.label))
              : ((a.textContent = "Online"), (a.title = ""))),
        saveGame(!1);
}
function initializeGroupsTab() {
    renderGroupsList(),
        gameState.activeGroup ? selectGroup(gameState.activeGroup) : updateMobileGroupView(!1),
        updateSidebarToggleVisibility();
}
function toggleGroupAttachmentMenu() {
    const e = $("groupAttachmentMenu");
    if (!e) return;
    const t = "block" === e.style.display;
    e.style.display = t ? "none" : "block";
}
function closeGroupAttachmentMenu() {
    const e = $("groupAttachmentMenu");
    e && (e.style.display = "none");
}
function openGroupTargetSelector(e, t = !1) {
    const n = $("groupTargetSelectorModal"),
        a = $("targetSelectorGrid"),
        o = $("targetSelectorTitle"),
        i = $("targetSelectorSubtitle"),
        s = $("confirmTargetSelection");
    if (!n || !a) return;
    const r = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!r) return;
    (window.groupActionState.actionType = e),
        (window.groupActionState.multiSelect = t),
        (window.groupActionState.selectedTargets = []);
    const l = {
        money: { title: "💰 Send Money To", subtitle: "Select who to send money to", color: "var(--l-green)" },
        gift: { title: "🎁 Give Gift To", subtitle: "Select who to give the gift to", color: "var(--l-pink)" },
        image: {
            title: "📷 Request Image From",
            subtitle: "Select who to request an image from",
            color: "var(--l-cyan)",
        },
        post: {
            title: "📱 Request Post From",
            subtitle: "Select who to request a social post from",
            color: "var(--l-amber-2)",
        },
        groupPhoto: {
            title: "👥 Group Photo Participants",
            subtitle: "Select who should be in the photo",
            color: "var(--l-violet)",
        },
    }[e] || { title: "👤 Select Target", subtitle: "Choose a recipient", color: "var(--l-indigo)" };
    (o.textContent = l.title),
        (o.style.color = l.color),
        (i.textContent = l.subtitle + (t ? " (multiple allowed)" : "")),
        (a.innerHTML = ""),
        r.participantIds.forEach((e) => {
            const t = gameState.employees.find((t) => t.id === e);
            if (!t) return;
            const n = document.createElement("div");
            (n.className = "target-selector-item"),
                (n.dataset.empId = e),
                (n.style.cssText =
                    "\n        display: flex; align-items: center; gap: 12px; padding: 12px 15px;\n        background: var(--bg); border-radius: 10px; cursor: pointer;\n        border: 2px solid transparent; transition: all 0.2s;\n      ");
            const o = t.profileImage || t.generatedPortrait || "";
            (n.innerHTML = `\n        <div style="width:45px; height:45px; border-radius:50%; background:${o ? `url('${o}') center/cover` : "var(--l-line)"}; display:flex; justify-content:center; align-items:center; font-size:1.5rem; flex-shrink:0;">\n          ${o ? "" : "👤"}\n        </div>\n        <div style="flex:1; min-width:0;">\n          <div style="font-weight:600; color:var(--l-ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.name}</div>\n          <div style="font-size:0.8rem; color:var(--text-mute);">${t.role || "Employee"}</div>\n        </div>\n        <div class="target-check" style="width:24px; height:24px; border-radius:50%; border:2px solid var(--border); display:flex; justify-content:center; align-items:center; color:transparent; font-size:0.9rem;">✓</div>\n      `),
                (n.onclick = () => toggleTargetSelection(n, e, l.color)),
                a.appendChild(n);
        }),
        (s.onclick = () => confirmTargetSelectionAndProceed(e)),
        (n.style.display = "flex");
}
function toggleTargetSelection(e, t, n) {
    const a = window.groupActionState,
        o = e.querySelector(".target-check");
    if (a.multiSelect) {
        const i = a.selectedTargets.indexOf(t);
        i > -1
            ? (a.selectedTargets.splice(i, 1),
              (e.style.borderColor = "transparent"),
              (e.style.background = "var(--l-bg)"),
              (o.style.color = "transparent"),
              (o.style.background = "transparent"),
              (o.style.borderColor = "var(--l-neutral-3)"))
            : (a.selectedTargets.push(t),
              (e.style.borderColor = n),
              (e.style.background = "rgba(102,126,234,0.1)"),
              (o.style.color = "var(--l-ink)"),
              (o.style.background = n),
              (o.style.borderColor = n));
    } else
        document.querySelectorAll(".target-selector-item").forEach((e) => {
            const t = e.querySelector(".target-check");
            (e.style.borderColor = "transparent"),
                (e.style.background = "var(--l-bg)"),
                (t.style.color = "transparent"),
                (t.style.background = "transparent"),
                (t.style.borderColor = "var(--l-neutral-3)");
        }),
            (a.selectedTargets = [t]),
            (e.style.borderColor = n),
            (e.style.background = "rgba(102,126,234,0.1)"),
            (o.style.color = "var(--l-ink)"),
            (o.style.background = n),
            (o.style.borderColor = n);
}
function closeGroupTargetSelector() {
    const e = $("groupTargetSelectorModal");
    e && (e.style.display = "none");
}
function confirmTargetSelectionAndProceed(e) {
    const t = window.groupActionState.selectedTargets;
    if (0 !== t.length)
        switch ((closeGroupTargetSelector(), e)) {
            case "money":
                updateGroupMoneyRecipients(t);
                break;
            case "gift":
                updateGroupGiftRecipients(t);
                break;
            case "image":
                updateGroupImageTarget(t);
                break;
            case "post":
                updateGroupPostTarget(t);
                break;
            case "groupPhoto":
                updateGroupPhotoParticipants(t);
        }
    else showNotification("Please select at least one person", 2e3);
}
function openAddParticipantSelector() {
    const e = $("groupTargetSelectorModal"),
        t = $("targetSelectorGrid"),
        n = $("targetSelectorTitle"),
        a = $("targetSelectorSubtitle"),
        o = $("confirmTargetSelection");
    if (!e || !t) return;
    const i = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!i) return;
    const s = MAX_GROUP_PARTICIPANTS - i.participantIds.length;
    if (s <= 0) return void showNotification(`Groups are capped at ${MAX_GROUP_PARTICIPANTS} participants`, 2500);
    const r = gameState.employees.filter(
        (e) => e.hired && "active" === e.employmentStatus && !i.participantIds.includes(e.id)
    );
    (window.groupActionState.actionType = "add-participant"),
        (window.groupActionState.multiSelect = !0),
        (window.groupActionState.selectedTargets = []);
    const l = "var(--l-indigo)";
    n && ((n.textContent = "➕ Add Participants"), (n.style.color = l)),
        a && (a.textContent = `Up to ${s} more (active employees not already here)`),
        (t.innerHTML = ""),
        0 === r.length
            ? (t.innerHTML =
                  '<div style="text-align:center; padding:30px; color:var(--text-mute);">No other active employees available to add.</div>')
            : r.forEach((e) => {
                  const n = document.createElement("div");
                  (n.className = "target-selector-item"),
                      (n.dataset.empId = e.id),
                      (n.style.cssText =
                          "\n          display: flex; align-items: center; gap: 12px; padding: 12px 15px;\n          background: var(--bg); border-radius: 10px; cursor: pointer;\n          border: 2px solid transparent; transition: all 0.2s;\n        ");
                  const a = e.profileImage || e.generatedPortrait || "";
                  (n.innerHTML = `\n          <div style="width:45px; height:45px; border-radius:50%; background:${a ? `url('${a}') center/cover` : "var(--l-line)"}; display:flex; justify-content:center; align-items:center; font-size:1.5rem; flex-shrink:0;">\n            ${a ? "" : "👤"}\n          </div>\n          <div style="flex:1; min-width:0;">\n            <div style="font-weight:600; color:var(--l-ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.name}</div>\n            <div style="font-size:0.8rem; color:var(--text-mute);">${e.role || "Employee"}</div>\n          </div>\n          <div class="target-check" style="width:24px; height:24px; border-radius:50%; border:2px solid var(--border); display:flex; justify-content:center; align-items:center; color:transparent; font-size:0.9rem;">✓</div>\n        `),
                      (n.onclick = () => toggleTargetSelection(n, e.id, l)),
                      t.appendChild(n);
              }),
        o && (o.onclick = () => confirmAddParticipants()),
        (e.style.display = "flex");
}
function confirmAddParticipants() {
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!e) return;
    const t = [...(window.groupActionState.selectedTargets || [])];
    if (0 === t.length) return void showNotification("Select at least one person to add", 2e3);
    const n = MAX_GROUP_PARTICIPANTS - e.participantIds.length,
        a = t.filter((t) => !e.participantIds.includes(t)).slice(0, n);
    if (0 === a.length)
        return void showNotification(`Groups are capped at ${MAX_GROUP_PARTICIPANTS} participants`, 2500);
    e.participantIds.push(...a);
    const o = a
        .map((e) => gameState.employees.find((t) => t.id === e)?.name.split(" ")[0])
        .filter(Boolean)
        .join(", ");
    e.messages.push({
        sender: "system",
        content: `➕ ${o} ${a.length > 1 ? "were" : "was"} added to the group.`,
        isSystem: !0,
        timestamp: gameState.time?.currentTime || Date.now(),
    }),
        closeGroupTargetSelector(),
        renderManageParticipants(e),
        renderParticipantSelectorBar(e),
        renderGroupHeaderAvatars(e),
        renderGroupMessages(e),
        renderGroupsList(),
        saveGame(!1),
        t.length > a.length
            ? showNotification(`Added ${a.length}; group is now full (${MAX_GROUP_PARTICIPANTS} max)`, 2500)
            : showNotification(`Added ${a.length} participant${a.length > 1 ? "s" : ""}`, 1500);
}
function computeGroupStats(e) {
    const t = e.messages || [],
        n = {
            total: 0,
            player: 0,
            npc: 0,
            narrator: 0,
            images: 0,
            moneySent: 0,
            perParticipant: {},
            firstAt: null,
            lastAt: null,
        };
    return (
        t.forEach((e) => {
            e.imageUrl && n.images++,
                e.isSystem
                    ? "money-sent" === e.systemType && "number" == typeof e.amount && (n.moneySent += e.amount)
                    : (n.total++,
                      e.timestamp && (n.firstAt || (n.firstAt = e.timestamp), (n.lastAt = e.timestamp)),
                      e.isPlayer
                          ? n.player++
                          : e.isNarrator
                            ? n.narrator++
                            : (n.npc++,
                              e.employeeId &&
                                  (n.perParticipant[e.employeeId] = (n.perParticipant[e.employeeId] || 0) + 1)));
        }),
        n
    );
}
function closeGroupRecap() {
    const e = $("groupRecapModal");
    e && (e.style.display = "none");
}
function openGroupRecap() {
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup),
        t = $("groupRecapModal"),
        n = $("groupRecapBody");
    if (!e || !t || !n) return;
    const a = computeGroupStats(e),
        o = Object.entries(a.perParticipant)
            .map(([e, t]) => ({
                name: gameState.employees.find((t) => t.id === e)?.name?.split(" ")[0] || "Unknown",
                count: t,
            }))
            .sort((e, t) => t.count - e.count),
        i = (e, t, n) =>
            `<div style="flex:1; min-width:90px; background:var(--bg); border-radius:10px; padding:12px; text-align:center;">\n         <div style="font-size:1.4rem; font-weight:700; color:${n};">${t}</div>\n         <div style="font-size:0.72rem; color:var(--text-mute); margin-top:2px;">${e}</div>\n       </div>`,
        s = o.length
            ? o
                  .map(
                      (e) =>
                          `<div style="display:flex; justify-content:space-between; padding:5px 0; font-size:0.85rem; color:var(--l-ink-dim);"><span>${e.name}</span><span style="color:var(--positive);">${e.count} msg${1 !== e.count ? "s" : ""}</span></div>`
                  )
                  .join("")
            : '<div style="color:var(--text-mute); font-size:0.85rem;">No one has spoken yet.</div>';
    (n.innerHTML = `\n      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px;">\n        ${i("Messages", a.total, "var(--l-indigo)")}\n        ${i("Participants", e.participantIds.length, "var(--l-violet)")}\n        ${i("Images", a.images, "var(--l-cyan)")}\n        ${i("Money sent", "$" + formatCash(a.moneySent), "var(--l-green)")}\n      </div>\n      <div style="margin-bottom:18px;">\n        <div style="color:var(--text-mute); font-size:0.8rem; font-weight:600; margin-bottom:6px;">WHO TALKED MOST</div>\n        ${s}\n      </div>\n      <div>\n        <div style="color:var(--text-mute); font-size:0.8rem; font-weight:600; margin-bottom:8px;">AI SUMMARY</div>\n        <div id="groupRecapSummary" style="color:var(--l-ink-dim); font-size:0.9rem; line-height:1.5; font-style:italic; background:rgba(102,126,234,0.08); border:1px solid rgba(102,126,234,0.2); border-radius:10px; padding:14px; min-height:40px;">\n          ${e.lastSummary ? e.lastSummary : '<span style="color:var(--text-mute);">No summary yet.</span>'}\n        </div>\n        <button id="generateGroupSummaryBtn" onclick="generateGroupMeetingSummary()" style="margin-top:10px; width:100%; padding:11px; background:linear-gradient(135deg, var(--l-indigo) 0%, var(--l-indigo-deep) 100%); border:none; border-radius:8px; color:var(--l-ink-on-fill); cursor:pointer; font-weight:600;">✨ ${e.lastSummary ? "Regenerate" : "Generate"} AI Summary</button>\n      </div>\n    `),
        (t.style.display = "flex");
}
async function generateGroupMeetingSummary() {
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!e) return;
    const t = $("generateGroupSummaryBtn"),
        n = $("groupRecapSummary"),
        a = (e.messages || [])
            .filter((e) => !e.isSystem && e.content)
            .slice(-40)
            .map((e) => `${e.isPlayer ? "Boss" : e.isNarrator ? "Narrator" : e.sender}: ${e.content}`)
            .join("\n");
    if (!a.trim()) return void showNotification("Nothing to summarize yet", 2e3);
    t && ((t.disabled = !0), (t.textContent = "⏳ Summarizing...")),
        n && (n.innerHTML = '<span style="color:var(--text-mute);">Generating summary...</span>');
    const o = `Summarize this group meeting/conversation in 2-4 concise sentences. Focus on what actually happened: key topics, decisions, notable interactions or tension, and the overall mood. Do not invent events that aren't shown. Participants: ${e.participantIds
            .map((e) => gameState.employees.find((t) => t.id === e)?.name)
            .filter(Boolean)
            .join(", ")}.\n\nConversation:\n${a}\n\nSummary:`;
    try {
        const t = ((await queuedGenerateText(o, {}, `Summary for group "${e.name}"`)) || "").trim();
        (e.lastSummary = t),
            (e.lastSummaryAt = gameState.time?.currentTime || Date.now()),
            n && (n.textContent = t || "Could not generate a summary."),
            saveGame(!1);
    } catch (e) {
        console.error("Group summary error:", e),
            n && (n.innerHTML = '<span style="color:var(--danger);">Failed to generate summary. Try again.</span>');
    } finally {
        t &&
            ((t.disabled = !1),
            (t.textContent = e.lastSummary ? "✨ Regenerate AI Summary" : "✨ Generate AI Summary"));
    }
}
function createRecipientChip(e, t = "var(--l-indigo)") {
    const n = gameState.employees.find((t) => t.id === e);
    if (!n) return null;
    const a = document.createElement("div");
    (a.className = "recipient-chip"),
        (a.dataset.empId = e),
        (a.style.cssText = `\n      display: flex; align-items: center; gap: 8px; padding: 6px 12px;\n      background: rgba(${"var(--l-green)" === t ? "78,204,163" : "var(--l-pink)" === t ? "255,107,157" : "var(--l-cyan)" === t ? "0,212,255" : "102,126,234"},0.2);\n      border: 1px solid ${t}; border-radius: 20px; font-size: 0.85rem;\n    `);
    const o = n.profileImage || n.generatedPortrait || "";
    return (
        (a.innerHTML = `\n      <div style="width:24px; height:24px; border-radius:50%; background:${o ? `url('${o}') center/cover` : "var(--l-line)"}; display:flex; justify-content:center; align-items:center; font-size:0.8rem;">\n        ${o ? "" : "👤"}\n      </div>\n      <span style="color:${t};">${n.name}</span>\n      <button onclick="removeRecipientChip(this, '${e}')" style="background:transparent; border:none; color:var(--danger); cursor:pointer; font-size:1rem; padding:0; margin-left:4px;">×</button>\n    `),
        a
    );
}
function removeRecipientChip(e, t) {
    const n = e.closest(".recipient-chip");
    n && n.remove();
    const a = window.groupActionState.selectedTargets.indexOf(t);
    a > -1 && window.groupActionState.selectedTargets.splice(a, 1);
}
function openGroupSendMoneyModal() {
    closeGroupAttachmentMenu();
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!e) return;
    window.groupActionState.selectedTargets = [];
    const t = gameState.cash || 0;
    $("groupSendMoneyBalance").textContent = "$" + formatCash(t);
    const n = Math.max(100, Math.floor(0.01 * t)),
        a = Math.max(1e3, Math.floor(0.05 * t)),
        o = Math.max(1e4, Math.floor(0.1 * t));
    ($("groupMoneySmall").textContent = "$" + formatCash(n)),
        ($("groupMoneyMedium").textContent = "$" + formatCash(a)),
        ($("groupMoneyLarge").textContent = "$" + formatCash(o)),
        ($("groupCustomMoneyAmount").value = ""),
        ($("groupMoneyMessage").value = ""),
        ($("groupMoneyRecipients").innerHTML =
            '<span style="color:var(--text-mute); font-size:0.85rem;">No recipient selected</span>'),
        ($("groupSendMoneyModal").style.display = "flex");
}
function closeGroupSendMoneyModal() {
    $("groupSendMoneyModal").style.display = "none";
}
function updateGroupMoneyRecipients(e) {
    const t = $("groupMoneyRecipients");
    (t.innerHTML = ""),
        e.forEach((e) => {
            const n = createRecipientChip(e, "var(--l-green)");
            n && t.appendChild(n);
        });
}
async function confirmGroupSendMoney() {
    const e = window.groupActionState.selectedTargets,
        t = parseInt($("groupCustomMoneyAmount").value) || 0,
        n = $("groupMoneyMessage").value.trim(),
        a = gameState.cash || 0;
    if (0 === e.length) return void showNotification("Please select a recipient", 2e3);
    if (t <= 0) return void showNotification("Please enter a valid amount", 2e3);
    const o = t * e.length;
    if (o > a) return void showNotification("Insufficient funds!", 2e3);
    closeGroupSendMoneyModal();
    const i = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (i) {
        for (const a of e) {
            const e = gameState.employees.find((e) => e.id === a);
            if (!e) continue;
            (gameState.cash -= t), e.receivedMoney || (e.receivedMoney = 0), (e.receivedMoney += t);
            const o = n
                ? `💰 You sent $${formatCash(t)} to ${e.name}: "${n}"`
                : `💰 You sent $${formatCash(t)} to ${e.name}`;
            i.messages.push({
                id: Date.now() + Math.random(),
                senderId: "system",
                content: o,
                timestamp: Date.now(),
                isSystem: !0,
                systemType: "money-sent",
                amount: t,
            }),
                await generateGroupMoneyReaction(i, e, t, n);
        }
        renderGroupMessages(i),
            saveGame(!1),
            updateUI(),
            showNotification(
                `💰 Sent $${formatCash(o)} to ${e.length} ${1 === e.length ? "person" : "people"}!`,
                2e3
            );
    }
}
function getRelationshipValue(e) {
    return e ? calculateAverageRelationship(e) : 0;
}
async function generateGroupMoneyReaction(e, t, n, a) {
    const o = getRelationshipValue(t),
        i = t.personality || {},
        s = `You are ${t.name}, a ${t.role || "employee"}. You're in a group chat with colleagues and your boss just sent you $${formatCash(n)}${a ? ` with the message: "${a}"` : ""}.\n\nYour personality: ${JSON.stringify(i)}\nRelationship with boss: ${o}/100\n\nWrite a SHORT reaction message (1-2 sentences) expressing your feelings about receiving this money IN FRONT of your colleagues. Consider:\n- How does the amount feel to you?\n- Are you grateful, surprised, embarrassed, suspicious?\n- How do you react knowing others in the group can see this?\n\nJust write your response, no quotes or labels:`;
    try {
        const n = await queuedGenerateText(s, { max_tokens: 100 }, `${t.name}'s money reaction`);
        e.messages.push({
            id: Date.now() + Math.random(),
            senderId: t.id,
            content: extractText(n).trim(),
            timestamp: Date.now() + 100,
            isSystem: !1,
        });
    } catch (e) {
        console.error("Failed to generate money reaction:", e);
    }
}
function openGroupGiftModal() {
    closeGroupAttachmentMenu();
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!e) return;
    (window.groupActionState.selectedTargets = []),
        (window.groupActionState.selectedGift = null),
        ($("groupGiftRecipients").innerHTML =
            '<span style="color:var(--text-mute); font-size:0.85rem;">No recipient selected</span>'),
        ($("groupGiftMessage").value = ""),
        populateGroupGiftGrid();
    const t = $("confirmGroupGift");
    (t.disabled = !0), (t.style.opacity = "0.5"), ($("groupGiftModal").style.display = "flex");
}
function closeGroupGiftModal() {
    $("groupGiftModal").style.display = "none";
}
function updateGroupGiftRecipients(e) {
    const t = $("groupGiftRecipients");
    (t.innerHTML = ""),
        e.forEach((e) => {
            const n = createRecipientChip(e, "var(--l-pink)");
            n && t.appendChild(n);
        }),
        updateGroupGiftButtonState();
}
// The gift inventory is { items: [...], capacity } (vaulted items are kept, not given).
// Selection is by item id, so the list can change underneath without mis-giving.
const groupGiftableItems = () => (gameState.giftInventory?.items || []).filter((i) => !i.vaulted && (i.quantity || 1) > 0),
    groupGiftEmoji = (g) => g.emoji || GIFT_CATEGORIES?.[g.category]?.emoji || "🎁";
function populateGroupGiftGrid() {
    const e = $("groupGiftSelectionGrid"),
        t = groupGiftableItems();
    (e.innerHTML = ""),
        0 !== t.length
            ? t.forEach((t) => {
                  const a = document.createElement("div");
                  (a.className = "group-gift-option"),
                      (a.dataset.giftId = t.id),
                      (a.style.cssText =
                          "\n        padding: 15px; background: var(--surface); border: 2px solid transparent;\n        border-radius: 10px; cursor: pointer; transition: all 0.2s; text-align: center;\n      "),
                      (a.innerHTML = `\n        <div style="font-size:2.5rem; margin-bottom:8px;">${groupGiftEmoji(t)}</div>\n        <div style="font-weight:600; color:var(--l-ink); margin-bottom:4px; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(t.name)}</div>\n        <div style="font-size:0.75rem; color:var(--positive);">Qty: ${t.quantity || 1}</div>\n      `),
                      (a.onclick = () => selectGroupGift(a, t.id)),
                      e.appendChild(a);
              })
            : (e.innerHTML =
                  '<div style="grid-column:1/-1; text-align:center; padding:30px; color:var(--text-mute);"><div style="font-size:3rem; margin-bottom:10px;">🎁</div><p>No gifts in inventory</p><p style="font-size:0.85rem;">Visit the Gifts tab to purchase some!</p></div>');
}
function selectGroupGift(e, t) {
    document.querySelectorAll(".group-gift-option").forEach((e) => {
        (e.style.borderColor = "transparent"), (e.style.background = "var(--l-panel-2)");
    }),
        (e.style.borderColor = "var(--l-pink)"),
        (e.style.background = "rgba(255,107,157,0.1)"),
        (window.groupActionState.selectedGift = t),
        updateGroupGiftButtonState();
}
function updateGroupGiftButtonState() {
    const e = $("confirmGroupGift"),
        t = window.groupActionState.selectedTargets.length > 0,
        n = null !== window.groupActionState.selectedGift;
    (e.disabled = !(t && n)), (e.style.opacity = t && n ? "1" : "0.5");
}
async function confirmGroupGift() {
    const e = window.groupActionState.selectedTargets,
        t = window.groupActionState.selectedGift,
        n = $("groupGiftMessage").value.trim();
    if (0 === e.length || null === t) return;
    const a = groupGiftableItems().find((g) => g.id === t);
    if (!a || (a.quantity || 1) < e.length) return void showNotification("Not enough gifts in inventory!", 2e3);
    closeGroupGiftModal();
    const o = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (o) {
        const snapshot = { ...a },
            emoji = groupGiftEmoji(snapshot);
        for (const i of e) {
            const e = gameState.employees.find((e) => e.id === i);
            if (!e) continue;
            removeGiftFromInventory(snapshot.id, 1);
            const s = n
                ? `🎁 You gave ${e.name} a ${emoji} ${snapshot.name}: "${n}"`
                : `🎁 You gave ${e.name} a ${emoji} ${snapshot.name}`;
            o.messages.push({
                id: Date.now() + Math.random(),
                senderId: "system",
                content: s,
                timestamp: gameState.time?.currentTime || Date.now(),
                isSystem: !0,
                systemType: "gift-sent",
            });
            // Same effects as a private gift (preferences, stats, memory, story) — only
            // the reaction lands here in the group instead of in their DMs.
            const result = await giveGiftToEmployee(e.id, snapshot, n, { deliverToChat: !1 });
            result?.reaction &&
                o.messages.push({
                    id: Date.now() + Math.random(),
                    senderId: e.id,
                    content: result.reaction,
                    timestamp: (gameState.time?.currentTime || Date.now()) + 100,
                    isSystem: !1,
                });
        }
        (lastInventoryRenderHash = null),
            "function" == typeof updateGiftInventory && updateGiftInventory(),
            renderGroupMessages(o),
            saveGame(!1),
            showNotification(
                `🎁 Gave ${emoji} ${snapshot.name} to ${e.length} ${1 === e.length ? "person" : "people"}!`,
                2e3
            );
    }
}
function openGroupRequestImageModal() {
    closeGroupAttachmentMenu(),
        (window.groupActionState.selectedTargets = []),
        ($("groupImageRequestTarget").innerHTML =
            '<span style="color:var(--text-mute); font-size:0.85rem;">No person selected</span>'),
        ($("groupImageRequestPrompt").value = ""),
        ($("groupImageCustomRequest").style.display = "none"),
        ($("groupImageCustomBtn").textContent = "✏️ Custom Request"),
        ($("groupRequestImageModal").style.display = "flex");
}
function closeGroupRequestImageModal() {
    $("groupRequestImageModal").style.display = "none";
}
function updateGroupImageTarget(e) {
    const t = $("groupImageRequestTarget");
    (t.innerHTML = ""),
        e.forEach((e) => {
            const n = createRecipientChip(e, "var(--l-cyan)");
            n && t.appendChild(n);
        });
}
function toggleGroupImageCustomRequest() {
    const e = $("groupImageCustomRequest"),
        t = $("groupImageCustomBtn");
    "none" === e.style.display
        ? ((e.style.display = "block"), (t.textContent = "⬆️ Use Presets"))
        : ((e.style.display = "none"), (t.textContent = "✏️ Custom Request"));
}
async function sendGroupImageRequest(e, t = null) {
    const n = window.groupActionState.selectedTargets;
    if (0 === n.length) return void showNotification("Please select who to request from", 2e3);
    if (isSFWMode()) {
        if (["lewd", "nude", "explicit"].includes(e))
            return void showNotification("🛡️ SFW Mode is enabled - NSFW image requests are blocked", "warning");
        if (
            t &&
            /\b(nude|naked|lewd|sexy|explicit|sexual|nsfw|topless|underwear|lingerie|masturbat|dildo|toy|vibrator|orgasm)\b/i.test(
                t
            )
        )
            return void showNotification("🛡️ SFW Mode is enabled - NSFW content requests are blocked", "warning");
    }
    closeGroupRequestImageModal();
    const a = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!a) return;
    const o = n[0],
        i = gameState.employees.find((e) => e.id === o);
    if (!i) return;
    const s = t ? `@${i.name}, ${t}` : `@${i.name}, send me a ${e} selfie`;
    a.messages.push({ id: Date.now(), senderId: "player", content: s, timestamp: Date.now(), isPlayer: !0 }),
        renderGroupMessages(a),
        showNotification(`📷 Requesting image from ${i.name}...`, 2e3),
        await generateGroupImageResponse(a, i, e, t);
}
async function generateGroupImageResponse(e, t, n, a) {
    const userDesc = a; // capture the description param before a placeholder-div `a` shadows it inside the try below
    const o = getRelationshipValue(t);
    console.log(`[Group Image] Request from ${t.name} | type: ${n} | relationship: ${o}/100 | userDesc: ${a || "(none)"}`);
    if (!(["nude", "explicit", "lewd"].includes(n) ? o >= 40 : o >= 20)) {
        console.log(`[Group Image] ❌ Refused by ${t.name} — relationship ${o} below threshold`);
        const a = `You are ${t.name}. Your boss asked you to send a ${n} image in a group chat. Your relationship: ${o}/100. \n      \nYou're going to refuse because you're not comfortable enough. Write a short refusal (1-2 sentences) that the whole group will see.`;
        try {
            const n = await queuedGenerateText(a, { max_tokens: 100 }, `${t.name}'s refusal`);
            e.messages.push({
                id: Date.now() + Math.random(),
                senderId: t.id,
                content: extractText(n).trim(),
                timestamp: Date.now(),
                isSystem: !1,
            }),
                renderGroupMessages(e),
                saveGame(!1);
        } catch (e) {
            console.error("Failed to generate refusal:", e);
        }
        return;
    }
    const recentHistory = (e.messages || [])
            .slice(-10)
            .map((m) => {
                const who = m.isPlayer
                    ? "Boss"
                    : gameState.employees.find((x) => x.id === m.senderId)?.name || (m.senderId === t.id ? t.name : "Colleague");
                return m.content ? `${who}: ${m.content}` : "";
            })
            .filter(Boolean)
            .join("\n"),
        sceneHint = (e.settings?.scenarioContext || e.pretext || "").replace(/\s+/g, " ").trim().slice(0, 200),
        r = await buildRefinedImagePrompt({
            employee: t,
            type: n,
            customRequest: userDesc,
            recentHistory,
            sceneContext: sceneHint,
            mode: "group",
            previousState: lastImageStateFromMessages(e.messages),
        });
    console.log(`[Group Image] 🎨 Refined image prompt (${r.length} chars): ${r}`);
    try {
        const a = document.createElement("div");
        (a.style.cssText = "text-align:center; padding:15px; color:var(--text-dim); font-style:italic;"),
            (a.textContent = `📷 ${t.name} is taking a photo...`);
        const o = $("groupMessagesContainer");
        o && (o.appendChild(a), (o.scrollTop = o.scrollHeight));
        const i = applyPerspective(r),
            styled = applyImageStyle(i);
        console.log(`[Group Image] 🚀 Final prompt to engine (${styled.prompt.length} chars): ${styled.prompt}`);
        const s = await queuedGenerateImage(styled, `${t.name}'s photo`);
        a.parentElement && a.remove();
        const groupCtx = ("function" == typeof buildGroupContext ? buildGroupContext(e, t) : "").trim(),
            l = `You are ${t.name}, in a group chat with your boss and colleagues.\n${groupCtx ? groupCtx + "\n\n" : ""}You just sent a ${n} selfie${userDesc ? ` (${userDesc})` : ""} in response to the conversation above. Write a very short message (a few words) to accompany the photo that fits naturally with what's being discussed. No quotation marks.`;
        console.log(`[Group Image] 📝 Caption prompt built (${l.length} chars, context: ${groupCtx ? "yes" : "none"})`);
        let c = "";
        try {
            c = extractText(await queuedGenerateText(l, { max_tokens: 40 }, "Photo caption")).trim();
        } catch (e) {
            c = "explicit" === n ? "😈" : "nude" === n ? "🙈" : "📸";
        }
        console.log(`[Group Image] 💬 Caption: "${c}"`);
        e.messages.push({
            id: Date.now() + Math.random(),
            senderId: t.id,
            content: c,
            timestamp: Date.now(),
            isSystem: !1,
            imageUrl: s,
            imageType: "selfie",
            imagePrompt: r,
            imageReqType: n,
            imageDesc: userDesc || "",
            nude: ["nude", "explicit", "lewd"].includes(n),
        }),
            t.photoGallery || (t.photoGallery = []),
            t.photoGallery.push({ url: s, type: n, timestamp: Date.now(), source: "group-request" }),
            renderGroupMessages(e),
            saveGame(!1),
            console.log(`[Group Image] ✅ Delivered ${n} photo from ${t.name}`);
    } catch (e) {
        console.error("[Group Image] ❌ Failed to generate image:", e), showNotification("Failed to generate image", 2e3);
    }
}
function openGroupPhotoRequestModal() {
    closeGroupAttachmentMenu();
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    e &&
        ((window.groupActionState.selectedTargets = [...e.participantIds]),
        updateGroupPhotoParticipants(e.participantIds),
        ($("groupPhotoDescription").value = ""),
        ($("groupPhotoRequestModal").style.display = "flex"));
}
function closeGroupPhotoRequestModal() {
    $("groupPhotoRequestModal").style.display = "none";
}
function updateGroupPhotoParticipants(e) {
    const t = $("groupPhotoParticipants");
    (t.innerHTML = ""),
        (window.groupActionState.selectedTargets = e),
        e.forEach((e) => {
            const n = createRecipientChip(e, "var(--l-violet)");
            n && t.appendChild(n);
        });
}
async function confirmGroupPhotoRequest() {
    const e = window.groupActionState.selectedTargets,
        t = $("groupPhotoDescription").value.trim();
    if (e.length < 2) return void showNotification("Select at least 2 people for a group photo", 2e3);
    closeGroupPhotoRequestModal();
    const n = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!n) return;
    const a = e.map((e) => gameState.employees.find((t) => t.id === e)).filter(Boolean),
        o = a.map((e) => e.name);
    n.messages.push({
        id: Date.now(),
        senderId: "player",
        content: `Hey ${o.join(", ")}, can you all take a group photo together? ${t || ""}`.trim(),
        timestamp: Date.now(),
        isPlayer: !0,
    }),
        renderGroupMessages(n),
        showNotification("👥 Requesting group photo...", 2e3),
        await generateGroupPhoto(n, a, t);
}
async function generateGroupPhoto(group, employees, customRequest) {
const recentHistory = (group.messages || [])
    .slice(-10)
    .map((m) => {
        const sender = m.isPlayer ? "Boss" : gameState.employees.find((e) => e.id === m.senderId)?.name || "Colleague";
        return m.content ? `${sender}: ${m.content}` : "";
    })
    .filter(Boolean)
    .join("\n");

const sceneContext = (group.settings?.scenarioContext || group.pretext || "office setting").replace(/\s+/g, " ").trim().slice(0, 200);

const refinedPrompt = await buildRefinedImagePrompt({
    employee: employees,
    type: 'group-photo',
    customRequest: customRequest,
    recentHistory: recentHistory,
    sceneContext: sceneContext,
    mode: 'group',
    previousState: lastImageStateFromMessages(group.messages),
});

console.log(
    `[Group Photo] 🎨 ${employees.length} people: ${employees.map((e) => e.name).join(", ")} | scene: ${sceneContext.slice(0, 80)} | prompt ${refinedPrompt.length} chars`
);
try {
    const placeholder = document.createElement("div");
    (placeholder.style.cssText = "text-align:center; padding:15px; color:var(--text-dim); font-style:italic;"),
        (placeholder.textContent = "📸 Taking group photo...");
    const messagesContainer = $("groupMessagesContainer");
    messagesContainer && (messagesContainer.appendChild(placeholder), (messagesContainer.scrollTop = messagesContainer.scrollHeight));

    const styled = applyImageStyle(applyPerspective(refinedPrompt));
    console.log(`[Group Photo] 🚀 Final prompt to engine (${styled.prompt.length} chars): ${styled.prompt}`);
    const imageUrl = await queuedGenerateImage(styled, "Group photo");

    placeholder.parentElement && placeholder.remove();

    const a = employees[Math.floor(Math.random() * employees.length)];
    group.messages.push({
        id: Date.now() + Math.random(),
        senderId: a.id,
        content: "📸 Here's our group photo!",
        timestamp: Date.now(),
        isSystem: !1,
        imageUrl: imageUrl,
        imageType: "group-photo",
        imagePrompt: refinedPrompt,
    }),
        renderGroupMessages(group),
        saveGame(!1),
        console.log(`[Group Photo] ✅ Delivered group photo (${employees.length} people)`);
} catch (e) {
    console.error("[Group Photo] ❌ Failed to generate group photo:", e),
        showNotification("Failed to generate group photo", 2e3);
}
}
function openGroupRequestPostModal() {
    closeGroupAttachmentMenu(),
        (window.groupActionState.selectedTargets = []),
        ($("groupPostRequestTarget").innerHTML =
            '<span style="color:var(--text-mute); font-size:0.85rem;">No person selected</span>'),
        ($("groupPostRequestPrompt").value = ""),
        ($("groupPostCustomRequest").style.display = "none"),
        ($("groupPostCustomBtn").textContent = "✏️ Custom Request"),
        ($("groupRequestPostModal").style.display = "flex");
}
function closeGroupRequestPostModal() {
    $("groupRequestPostModal").style.display = "none";
}
function updateGroupPostTarget(e) {
    const t = $("groupPostRequestTarget");
    (t.innerHTML = ""),
        e.forEach((e) => {
            const n = createRecipientChip(e, "var(--l-amber-2)");
            n && t.appendChild(n);
        });
}
function toggleGroupPostCustomRequest() {
    const e = $("groupPostCustomRequest"),
        t = $("groupPostCustomBtn");
    "none" === e.style.display
        ? ((e.style.display = "block"), (t.textContent = "⬆️ Use Presets"))
        : ((e.style.display = "none"), (t.textContent = "✏️ Custom Request"));
}
async function sendGroupPostRequest(e, t = null) {
    const n = window.groupActionState.selectedTargets;
    if (0 === n.length) return void showNotification("Please select who to request from", 2e3);
    closeGroupRequestPostModal();
    const a = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!a) return;
    const o = n[0],
        i = gameState.employees.find((e) => e.id === o);
    if (!i) return;
    const s = t || `a ${e} post`;
    a.messages.push({
        id: Date.now(),
        senderId: "player",
        content: `@${i.name}, can you make ${s} on social media?`,
        timestamp: Date.now(),
        isPlayer: !0,
    }),
        renderGroupMessages(a),
        showNotification(`📱 Requesting social post from ${i.name}...`, 2e3),
        setTimeout(() => requestSocialPost(i.id, e, t, a), 1e3);
}
// A group member's answer to "can you post X?". Same willingness as a private request
// (postRequestWillingness); the answer is said in front of the group, and a yes produces
// the post through the normal requested-post path. Used to be referenced but never
// defined, so group post requests silently did nothing.
function requestSocialPost(employeeId, preset, customText, group) {
    const emp = gameState.employees.find((e) => e.id === employeeId);
    if (!emp || !group) return;
    const type = "custom" === preset || !preset ? inferPostRequestType(customText || "") : preset,
        desc = customText || `a ${type.replace(/_/g, " ")} post`,
        willing = postRequestWillingness(emp, type, desc),
        pick = (arr) => arr[Math.floor(Math.random() * arr.length)],
        reply = willing
            ? pick({
                  text: ["Sure, I'll post something 📱", "On it — check the feed in a bit"],
                  selfie: ["Okay, selfie incoming 📸", "Fine, give me a sec 😄"],
              }[type] || ["Okay... give me a minute 😏", "Only because you asked 😘"])
            : pick({
                  text: ["Not really feeling it right now", "I don't have anything to post"],
                  selfie: ["Not today, sorry", "Maybe later"],
              }[type] || ["Not in front of everyone... 😳", "That's a bit much for me", "Ask me privately, maybe"]);
    group.messages.push({
        id: Date.now() + Math.random(),
        senderId: emp.id,
        content: reply,
        timestamp: gameState.time?.currentTime || Date.now(),
        isSystem: !1,
    }),
        renderGroupMessages(group),
        saveGame(!1),
        willing &&
            setTimeout(() => {
                generateRequestedPost(emp, type, desc).catch((err) => console.warn("[Group] Requested post failed:", err));
            }, 4e3 + 6e3 * Math.random());
}
function openGroupVisualizeModal() {
    closeGroupAttachmentMenu();
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!e) return;
    (window.groupActionState.selectedTargets = [...e.participantIds]), populateVisualizeParticipants(e);
    const t = $("visualizeSceneContext"),
        n =
            e.settings?.scenarioContext ||
            e.pretext ||
            "No specific scene context set. The AI will infer from conversation.";
    (t.textContent = n),
        ($("visualizeAdditionalPrompt").value = ""),
        ($("includePlayerInVis").checked = !0),
        ($("groupVisualizeModal").style.display = "flex");
}
function closeGroupVisualizeModal() {
    $("groupVisualizeModal").style.display = "none";
}
function populateVisualizeParticipants(e) {
    const t = $("visualizeParticipants");
    (t.innerHTML = ""),
        e.participantIds.forEach((e) => {
            const n = gameState.employees.find((t) => t.id === e);
            if (!n) return;
            const a = document.createElement("div");
            (a.className = "vis-participant-chip"),
                (a.dataset.empId = e),
                (a.dataset.selected = "true"),
                (a.style.cssText =
                    "\n        display: flex; align-items: center; gap: 8px; padding: 8px 14px;\n        background: rgba(233,69,96,0.2); border: 1px solid var(--danger);\n        border-radius: 20px; cursor: pointer; transition: all 0.2s;\n      ");
            const o = n.profileImage || n.generatedPortrait || "";
            (a.innerHTML = `\n        <div style="width:28px; height:28px; border-radius:50%; background:${o ? `url('${o}') center/cover` : "var(--l-line)"}; display:flex; justify-content:center; align-items:center; font-size:0.9rem;">\n          ${o ? "" : "👤"}\n        </div>\n        <span style="color:var(--danger); font-size:0.9rem;">${n.name}</span>\n      `),
                (a.onclick = () => toggleVisParticipant(a, e)),
                t.appendChild(a);
        });
}
function toggleVisParticipant(e, t) {
    if ("true" === e.dataset.selected) {
        (e.dataset.selected = "false"),
            (e.style.background = "transparent"),
            (e.style.borderColor = "var(--l-neutral-3)"),
            (e.querySelector("span").style.color = "var(--l-on-accent)");
        const n = window.groupActionState.selectedTargets.indexOf(t);
        n > -1 && window.groupActionState.selectedTargets.splice(n, 1);
    } else
        (e.dataset.selected = "true"),
            (e.style.background = "rgba(233,69,96,0.2)"),
            (e.style.borderColor = "var(--l-red)"),
            (e.querySelector("span").style.color = "var(--l-red)"),
            window.groupActionState.selectedTargets.includes(t) || window.groupActionState.selectedTargets.push(t);
}
function selectAllVisParticipants() {
    const e = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    e &&
        ((window.groupActionState.selectedTargets = [...e.participantIds]),
        document.querySelectorAll(".vis-participant-chip").forEach((e) => {
            (e.dataset.selected = "true"),
                (e.style.background = "rgba(233,69,96,0.2)"),
                (e.style.borderColor = "var(--l-red)"),
                (e.querySelector("span").style.color = "var(--l-red)");
        }));
}
function deselectAllVisParticipants() {
    (window.groupActionState.selectedTargets = []),
        document.querySelectorAll(".vis-participant-chip").forEach((e) => {
            (e.dataset.selected = "false"),
                (e.style.background = "transparent"),
                (e.style.borderColor = "var(--l-neutral-3)"),
                (e.querySelector("span").style.color = "var(--l-on-accent)");
        });
}
async function confirmGroupVisualize() {
    const e = window.groupActionState.selectedTargets,
        t = $("includePlayerInVis").checked,
        n = $("visualizeAdditionalPrompt").value.trim();
    if (0 === e.length) return void showNotification("Select at least one participant to visualize", 2e3);
    closeGroupVisualizeModal();
    const a = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    a && (showNotification("🎬 Generating scene visualization...", 2e3), await visualizeGroupScene(a, e, t, n));
}
window.groupActionState = { selectedTargets: [], actionType: null, selectedGift: null, multiSelect: !1 };
const GROUP_AUTOVIS_DEBUG = !1;
async function checkGroupAutoVisualization(e, t = "") {
    const n = e.settings?.autoVisualization;
    if (
        (GROUP_AUTOVIS_DEBUG &&
            console.log(`[Group Auto-Vis] check for ${e?.name || "unknown"}`, {
                hasConfig: !!n,
                enabled: n?.enabled,
                minFreq: n?.minFreq,
                maxFreq: n?.maxFreq,
            }),
        !n?.enabled)
    )
        return;
    e.autoVisTracker ||
        (e.autoVisTracker = {
            messagesSinceLastVis: 0,
            nextTriggerAt: getRandomInt(n.minFreq, n.maxFreq),
            totalVisualizations: 0,
        });
    const a = e.autoVisTracker;
    a.messagesSinceLastVis++;
    let o = a.messagesSinceLastVis >= a.nextTriggerAt;
    if ((n.intensityDetection && o && (o = analyzeGroupIntensity(e, t)), !o)) return;
    GROUP_AUTOVIS_DEBUG &&
        console.log(`[Group Auto-Vis] Triggering for ${e.name} (${a.messagesSinceLastVis} messages)`),
        (a.messagesSinceLastVis = 0),
        (a.nextTriggerAt = getRandomInt(n.minFreq, n.maxFreq)),
        a.totalVisualizations++;
    const i = !1 !== n.includePlayer;
    try {
        await visualizeGroupScene(e, e.participantIds, i, "");
    } catch (e) {
        console.error("[Group Auto-Vis] Failed:", e);
    }
}
function analyzeGroupIntensity(e, t) {
    const n = e.messages
            .filter((e) => !e.isSystem)
            .slice(-5)
            .map((e) => e.content || "")
            .join(" ")
            .toLowerCase(),
        a = [
            /\b(kiss|kissed|kissing)\b/,
            /\b(hug|hugged|hugging|embrace)\b/,
            /\b(touch|touched|touching|caress)\b/,
            /\b(grab|grabbed|pull|pulled)\b/,
            /\b(strip|stripped|undress|naked|nude)\b/,
            /\b(moan|groan|gasp|pant)\b/,
            /\b(slap|hit|punch|fight)\b/,
            /\b(cry|crying|tears|sobbing)\b/,
            /\b(laugh|laughing|giggle)\b/,
            /\b(dance|dancing)\b/,
            /\b(lean|leaning|close|closer)\b/,
            /\*[^*]+\*/,
        ];
    for (const e of a)
        if (e.test(n))
            return GROUP_AUTOVIS_DEBUG && console.log("[Group Auto-Vis] Intensity trigger matched:", e), !0;
    return !1;
}
function getRandomInt(e, t) {
    return (e = Math.ceil(e)), (t = Math.floor(t)), Math.floor(Math.random() * (t - e + 1)) + e;
}
async function visualizeGroupScene(e, t, n, a = "") {
    const o = t.map((e) => gameState.employees.find((t) => t.id === e)).filter(Boolean);
    if (0 === o.length) return void showNotification("No valid participants selected", 2e3);
    const i = o
            .map((e) => {
                const t = getPhysicalDescriptionForPrompt(e),
                    n = e.race && "human" !== e.race ? e.race : "",
                    a = e.physical?.raceFeatures?.description || "";
                return `\nCHARACTER: ${e.name} (${e.role || "Employee"})\nPhysical: ${t}\n${n ? `Species: ${n}${a ? ` - ${a}` : ""}` : ""}\nGender: ${e.gender || "female"}`;
            })
            .join("\n\n"),
        s = (gameState.playerProfile || {}).gender || "",
        r = gameState.settings?.playerBio || "",
        l = n
            ? `\nCHARACTER: The Boss/Player\nGender: ${s || "unspecified"}\n${r || "The boss, a commanding presence in the office"}`
            : "",
        c = e.settings?.scenarioContext || e.pretext || "",
        d = e.messages
            .filter((e) => !e.isSystem && e.content)
            .slice(-15)
            .map((e) => {
                if (e.isPlayer) return `You (the boss): ${e.content}`;
                const t = o.find((t) => t.id === e.senderId);
                return t ? `${t.name}: ${e.content}` : `Unknown: ${e.content}`;
            })
            .join("\n"),
        p = `You are creating an image prompt for a GROUP SCENE with MULTIPLE CHARACTERS.\n\n📊 SCENE PARTICIPANTS: ${o.length}${n ? " + the player/boss" : ""} people total\nEach character MUST be clearly visible and identifiable in the image.\n\n🎭 CHARACTER DESCRIPTIONS (MUST be accurate):\n${i}\n${l}\n\n📍 SCENE CONTEXT:\n${c || "Office/workplace setting"}\n\n💬 RECENT CONVERSATION (to understand current actions/mood):\n${d}\n\n${a ? `🎨 ADDITIONAL INSTRUCTIONS: ${a}` : ""}\n\nBased on all the above, create a DETAILED image prompt showing:\n1. ALL ${o.length}${n ? "+1" : ""} characters together in one scene\n2. Each character's DISTINCTIVE physical features (hair color, body type, race/species features)\n3. Their current positions, poses, and expressions based on the conversation\n4. The setting/location from the scenario context\n5. The emotional atmosphere/mood\n\n⚠️ CRITICAL RULES:\n- EVERY character must be visible and identifiable\n- Include distinctive features for EACH person\n- Show the scene from the conversation context\n- Natural positioning - not just standing in a line\n- Include any non-human features if characters have them\n\nWrite ONLY the raw image description (50-200 words). No labels, headers, or markdown:`;
    try {
        const t = document.createElement("div");
        (t.style.cssText = "text-align:center; padding:15px; color:var(--danger); font-style:italic;"),
            (t.innerHTML =
                '🎬 <span style="color:var(--text-dim);">Visualizing scene with ' +
                (o.length + (n ? 1 : 0)) +
                " characters...</span>");
        const a = $("groupMessages");
        a && (a.appendChild(t), (a.scrollTop = a.scrollHeight));
        let i = await queuedGenerateText(p, { temperature: 0.8, max_tokens: 300 }, "Generating group scene prompt");
        (i = extractText(i).trim()),
            (i = i.replace(/^["']|["']$/g, "")),
            (i = i.replace(/\*\*.*?\*\*/g, "").trim()),
            console.log("[Group Visualization] Generated prompt:", i);
        const s = await queuedGenerateImage(applyImageStyle(applyPerspective(i)), "Group scene visualization");
        t.parentElement && t.remove();
        if (
            !(
                s &&
                "string" == typeof s &&
                s.length > 20 &&
                (s.startsWith("http") || s.startsWith("data:") || s.startsWith("blob:"))
            )
        )
            return (
                console.error(
                    "[Group Visualization] Invalid imageUrl received:",
                    typeof s,
                    s?.substring?.(0, 100) || s
                ),
                void showNotification("Failed to generate scene image. Try again.", 2e3)
            );
        e.messages.push({
            id: Date.now() + Math.random(),
            senderId: "system",
            content: `🎬 Scene visualization (${o.length + (n ? 1 : 0)} characters)`,
            timestamp: Date.now(),
            isSystem: !0,
            systemType: "visualization",
            imageUrl: s,
            imagePrompt: i,
            imageType: "group-scene",
        }),
            e.autoVisTracker || (e.autoVisTracker = { messagesSinceLastVis: 0, totalVisualizations: 0 }),
            (e.autoVisTracker.messagesSinceLastVis = 0),
            e.autoVisTracker.totalVisualizations++,
            renderGroupMessages(e),
            saveGame(!1),
            showNotification("🎬 Scene visualization generated!", 2e3);
    } catch (e) {
        console.error("Failed to visualize group scene:", e),
            showNotification("Failed to generate visualization", 2e3);
        const t = $("groupMessages"),
            n = t?.querySelector('[style*="Visualizing scene"]');
        n && n.remove();
    }
}
let groupActionBarCollapsed = !0;
const DEFAULT_GROUP_ACTION_BUTTONS = [
    {
        id: "continue",
        name: "▶️ Continue",
        instruction: "Continue the scene naturally. Add more detail or action.",
        autoSend: !0,
        emoji: "▶️",
        enabled: !0,
    },
    {
        id: "action",
        name: "🎬 Action",
        instruction:
            "Characters perform physical actions. Describe movements, gestures, interactions. No dialogue, just actions.",
        autoSend: !0,
        emoji: "🎬",
        enabled: !0,
    },
    {
        id: "interact",
        name: "💬 Interact",
        instruction:
            "Characters interact with each other, not the player. Show dialogue and reactions between NPCs.",
        autoSend: !0,
        emoji: "💬",
        enabled: !0,
    },
    {
        id: "narrate",
        name: "📜 Narrate",
        instruction:
            "Describe the scene from a third-person narrator perspective. Set the atmosphere and describe character body language.",
        autoSend: !0,
        emoji: "📜",
        enabled: !0,
        forNarrator: !0,
    },
    {
        id: "thoughts",
        name: "💭 Thoughts",
        instruction: "Show internal thoughts of the speaking character. What are they really thinking?",
        autoSend: !0,
        emoji: "💭",
        enabled: !1,
    },
    {
        id: "tension",
        name: "⚡ Tension",
        instruction: "Increase the tension or drama. Characters have conflicting emotions, desires, or opinions.",
        autoSend: !0,
        emoji: "⚡",
        enabled: !1,
    },
    {
        id: "flirt",
        name: "💕 Flirt",
        instruction: "Characters engage in flirtatious behavior. Be playful and suggestive.",
        autoSend: !0,
        emoji: "💕",
        enabled: !1,
    },
    {
        id: "react",
        name: "😮 React",
        instruction:
            "Show emotional reactions to the current situation. Express feelings through words and body language.",
        autoSend: !0,
        emoji: "😮",
        enabled: !1,
    },
    {
        id: "comply",
        name: "✅ Comply",
        instruction: "Character agrees and complies with what was just said or requested.",
        autoSend: !0,
        emoji: "✅",
        enabled: !1,
    },
    {
        id: "resist",
        name: "⛔ Resist",
        instruction: "Character pushes back, resists, or expresses reluctance. Stay in character.",
        autoSend: !0,
        emoji: "⛔",
        enabled: !1,
    },
    { id: "custom", name: "✏️ Custom", instruction: "", autoSend: !1, emoji: "✏️", enabled: !1 },
];
function toggleGroupActionBar() {
    (groupActionBarCollapsed = !groupActionBarCollapsed),
        gameState.settings || (gameState.settings = {}),
        (gameState.settings.groupActionBarCollapsed = groupActionBarCollapsed);
    const e = $("groupActionBarWrapper"),
        t = $("groupActionsBtn");
    e && (e.style.display = groupActionBarCollapsed ? "none" : "block"),
        t && (t.style.color = groupActionBarCollapsed ? "var(--l-green)" : "var(--l-ink)");
}
function getAvailableGroupActionButtons(e) {
    return (e?.actionButtons || DEFAULT_GROUP_ACTION_BUTTONS).filter(
        (t) => !1 !== t.enabled && !(t.forNarrator && !e?.hasNarrator)
    );
}
function renderGroupActionButtons(e) {
    const t = $("groupActionButtonsContainer");
    if (!t || !e) return;
    (t.innerHTML = ""), gameState.settings?.groupActionBarCollapsed && (groupActionBarCollapsed = !0);
    const n = $("groupActionBarWrapper");
    n && (n.style.display = groupActionBarCollapsed ? "none" : "block");
    const a = getAvailableGroupActionButtons(e),
        o = document.createElement("div");
    (o.style.cssText = "display:flex; gap:6px; flex-wrap:wrap; align-items:center; width:100%;"),
        a.forEach((t) => {
            const n = document.createElement("button");
            (n.className = "group-action-btn"), (n.dataset.actionId = t.id);
            const a = t.forNarrator,
                i = "custom" === t.id;
            (n.style.cssText = `\n        padding:6px 10px;\n        background:${i ? "var(--l-neutral-5)" : a ? "rgba(199,125,255,0.2)" : "var(--l-line)"};\n        border:1px solid ${a ? "var(--l-violet)" : i ? "var(--l-neutral-7)" : "var(--l-green)"};\n        border-radius:16px;\n        color:var(--l-ink);\n        cursor:pointer;\n        font-size:0.75rem;\n        font-weight:500;\n        transition:all 0.2s;\n        display:inline-flex;\n        align-items:center;\n        gap:3px;\n        white-space:nowrap;\n        min-height:28px;\n        flex-shrink:0;\n        touch-action:manipulation;\n      `),
                (n.innerHTML = `${t.emoji} <span class="action-btn-text">${t.name.replace(t.emoji + " ", "")}</span>`),
                (n.title = t.instruction || "Custom action"),
                n.addEventListener("mouseenter", () => {
                    (n.style.background = a ? "var(--l-violet)" : i ? "var(--l-neutral-6)" : "var(--l-green)"),
                        (n.style.color = i ? "white" : "var(--l-bg)");
                }),
                n.addEventListener("mouseleave", () => {
                    (n.style.background = i ? "var(--l-neutral-5)" : a ? "rgba(199,125,255,0.2)" : "var(--l-line)"),
                        (n.style.color = "var(--l-ink)");
                }),
                n.addEventListener("click", (n) => {
                    n.stopPropagation(), handleGroupActionButtonClick(e, t);
                }),
                o.appendChild(n);
        });
    const i = document.createElement("button");
    (i.style.cssText =
        "\n      padding:6px 10px;\n      background:transparent;\n      border:1px dashed var(--l-neutral-5);\n      border-radius:16px;\n      color:var(--l-on-accent);\n      cursor:pointer;\n      font-size:0.7rem;\n      min-height:28px;\n      touch-action:manipulation;\n    "),
        (i.textContent = "⚙️"),
        (i.title = "Configure action buttons"),
        i.addEventListener("click", (t) => {
            t.stopPropagation(), showGroupActionButtonConfigModal(e);
        }),
        o.appendChild(i);
    const h = i.cloneNode(!0);
    (h.textContent = "❔"),
        (h.title = "Group commands (/help)"),
        h.addEventListener("click", (e) => {
            e.stopPropagation(), showGroupCommandsHelp();
        }),
        o.appendChild(h),
        t.appendChild(o);
}
async function handleGroupActionButtonClick(e, t) {
    // "✏️ Custom" asks what should happen, then runs it like "/do <action>".
    if ("custom" === t.id) {
        const t = await showPrompt("Describe what happens (e.g. \"Sarah pulls Mike aside\").", "✏️ Custom Action", {
            placeholder: "Someone does something…",
        });
        return void (t && t.trim() && (await executeGroupDoCommand(e, t.trim())));
    }
    const n = $("groupInput");
    if (!n) return;
    const a = t.id,
        o = n.value.trim();
    if (!o || o.startsWith("/")) {
        (n.value = `/${a} {Optional}`), n.focus();
        const e = n.value.indexOf("{") + 1,
            t = n.value.indexOf("}");
        return void n.setSelectionRange(e, t);
    }
    (n.value = `/${a} {${o}}`), n.focus(), n.setSelectionRange(n.value.length, n.value.length);
}
function showGroupActionButtonConfigModal(e) {
    const t = document.createElement("div");
    (t.id = "groupActionConfigModal"),
        (t.style.cssText =
            "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--l-veil-80); z-index:999999; display:flex; justify-content:center; align-items:center; overflow-y:auto;");
    const n = (e.actionButtons || DEFAULT_GROUP_ACTION_BUTTONS).map((e) => ({ ...e })),
        a = (e) =>
            e
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "")
                .slice(0, 15) || "cmd",
        o = (e, t) => {
            const n = e.id.startsWith("custom_") || !DEFAULT_GROUP_ACTION_BUTTONS.some((t) => t.id === e.id),
                o = a(e.name.replace(e.emoji + " ", ""));
            return `\n        <div class="action-btn-config" data-index="${t}" data-original-id="${e.id}" style="background:var(--surface-2); padding:12px; border-radius:8px; border-left:3px solid ${!1 !== e.enabled ? "var(--l-green)" : "var(--l-neutral-5)"};">\n          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">\n            <input type="checkbox" ${!1 !== e.enabled ? "checked" : ""} data-field="enabled" style="width:18px; height:18px; cursor:pointer; flex-shrink:0;">\n            <input type="text" value="${e.emoji}" data-field="emoji" maxlength="2" \n              style="width:36px; padding:4px; background:var(--surface); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); text-align:center; font-size:1.1rem; flex-shrink:0;">\n            <code class="command-display" style="color:var(--positive); font-size:0.8rem; background:var(--surface); padding:2px 6px; border-radius:3px; white-space:nowrap;">/${o}</code>\n            <input type="text" value="${e.name.replace(e.emoji + " ", "").replace(/"/g, "&quot;")}" data-field="name" placeholder="Button name..."\n              style="flex:1; padding:4px 8px; background:var(--surface); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); font-weight:600; font-size:0.85rem; min-width:80px;">\n            ${e.forNarrator ? '<span style="background:var(--l-violet); color:var(--l-on-accent); padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:600;">NARRATOR</span>' : ""}\n            <button class="delete-action-btn" data-index="${t}" style="padding:4px 8px; background:${n ? "var(--l-red)" : "var(--l-neutral-3)"}; border:none; border-radius:4px; color:${n ? "white" : "var(--l-neutral-6)"}; cursor:${n ? "pointer" : "not-allowed"}; font-size:0.8rem; flex-shrink:0;" ${n ? "" : 'disabled title="Cannot delete default actions"'}>🗑️</button>\n          </div>\n          <div style="margin-left:28px;">\n            <div style="color:var(--text-mute); font-size:0.7rem; margin-bottom:4px;">AI INSTRUCTION:</div>\n            <textarea data-field="instruction" placeholder="Describe how characters should respond..."\n              style="width:100%; padding:6px 8px; background:var(--surface); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink-dim); font-size:0.8rem; resize:vertical; min-height:40px; font-family:inherit;">${(e.instruction || "").replace(/"/g, "&quot;")}</textarea>\n          </div>\n        </div>\n      `;
        };
    (t.innerHTML = `\n      <div style="background:var(--surface); padding:25px; border-radius:12px; max-width:650px; width:90%; max-height:90vh; overflow-y:auto; margin:20px;">\n        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">\n          <h3 style="margin:0; color:var(--positive);">⚙️ Group Response Style Buttons</h3>\n          <button id="closeGroupActionConfig" style="background:transparent; border:none; color:var(--l-ink); font-size:1.5rem; cursor:pointer;">✕</button>\n        </div>\n        \n        \x3c!-- How It Works Section --\x3e\n        <div style="background:linear-gradient(135deg, rgba(78,204,163,0.15) 0%, rgba(0,212,255,0.1) 100%); border:1px solid rgba(78,204,163,0.3); border-radius:10px; padding:15px; margin-bottom:20px;">\n          <h4 style="margin:0 0 10px 0; color:var(--positive); font-size:0.95rem;">💡 How Group Response Styles Work</h4>\n          <p style="color:var(--l-ink-dim); margin:0 0 12px 0; font-size:0.85rem; line-height:1.5;">\n            These buttons control <strong>how characters respond</strong> in the group chat. The command (e.g., <code style="color:var(--positive);">/action</code>) is auto-generated from the button name.\n          </p>\n          \n          <div style="background:var(--l-veil-30); border-radius:6px; padding:10px; margin-bottom:10px;">\n            <div style="color:var(--accent-gold); font-size:0.8rem; margin-bottom:5px;">📝 Example Usage:</div>\n            <code style="color:var(--positive); font-size:0.85rem; display:block; margin-bottom:6px;">/action {Everyone stops what they're doing}</code>\n            <span style="color:var(--text-mute); font-size:0.75rem;">→ Your message appears, then characters respond with <em>only physical actions</em></span>\n          </div>\n          \n          \x3c!-- /do Command Explanation --\x3e\n          <div style="background:rgba(255,165,0,0.1); border:1px solid rgba(255,165,0,0.3); border-radius:6px; padding:10px;">\n            <div style="color:var(--l-orange); font-size:0.8rem; font-weight:600; margin-bottom:6px;">🎭 Special Command: <code style="background:var(--surface); padding:2px 6px; border-radius:3px;">/do</code></div>\n            <p style="color:var(--l-ink-dim); font-size:0.8rem; margin:0 0 6px 0;">\n              <code style="color:var(--l-orange);">/do</code> is a <strong>direct command</strong> — it tells a character exactly what to do.\n            </p>\n            <code style="color:var(--l-orange); font-size:0.8rem; display:block; margin-bottom:4px;">/do Sarah whispers something to Mike</code>\n            <span style="color:var(--text-mute); font-size:0.75rem;">→ No player message. Sarah just does it.</span>\n          </div>\n        </div>\n        \n        <h4 style="margin:0 0 15px 0; color:var(--l-ink); font-size:0.9rem;">📋 Available Response Styles</h4>\n        \n        <div id="groupActionButtonsList" style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px;">\n          ${n.map((e, t) => o(e, t)).join("")}\n        </div>\n        \n        \x3c!-- Add Custom Section --\x3e\n        <div style="background:linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.05) 100%); border:1px solid rgba(255,215,0,0.3); padding:15px; border-radius:8px; margin-bottom:20px;">\n          <h4 style="margin:0 0 12px 0; color:var(--accent-gold); font-size:0.9rem;">➕ Create Custom Response Style</h4>\n          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:8px; align-items:center;">\n            <input type="text" id="newGroupActionEmoji" placeholder="😊" maxlength="2" style="width:50px; padding:8px; background:var(--surface); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); text-align:center; font-size:1.2rem;">\n            <input type="text" id="newGroupActionName" placeholder="Button Label" style="flex:1; min-width:120px; padding:8px; background:var(--surface); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink);">\n            <code id="newGroupCommandPreview" style="color:var(--positive); font-size:0.85rem; background:var(--surface); padding:6px 10px; border-radius:4px; min-width:60px;">/...</code>\n          </div>\n          <textarea id="newGroupActionInstruction" placeholder="Describe how characters should respond when this style is used...&#10;Example: Characters speak seductively, using double meanings." \n            style="width:100%; padding:8px; background:var(--surface); border:1px solid var(--border-strong); border-radius:4px; color:var(--l-ink); min-height:60px; resize:vertical; font-family:inherit; font-size:0.85rem;"></textarea>\n          <div style="display:flex; justify-content:flex-end; margin-top:10px;">\n            <button id="addNewGroupActionBtn" style="padding:8px 16px; background:var(--l-gold); border:none; border-radius:6px; color:var(--l-on-accent); cursor:pointer; font-weight:600;">\n              + Add Style\n            </button>\n          </div>\n        </div>\n        \n        <div style="display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap;">\n          <button id="resetGroupToDefaultActions" style="padding:10px 20px; background:var(--l-neutral-5); border:none; border-radius:6px; color:var(--l-ink); cursor:pointer;">\n            Reset to Defaults\n          </button>\n          <button id="saveGroupActionConfig" style="padding:10px 20px; background:linear-gradient(135deg, var(--l-green) 0%, var(--l-cyan) 100%); border:none; border-radius:6px; color:var(--l-on-accent); cursor:pointer; font-weight:600;">\n            💾 Save Changes\n          </button>\n        </div>\n      </div>\n    `),
        document.body.appendChild(t),
        t.querySelector("#closeGroupActionConfig").addEventListener("click", () => {
            t.remove();
        }),
        t.addEventListener("click", (e) => {
            e.target === t && t.remove();
        });
    const i = (e) => {
        const o = e.querySelector('[data-field="enabled"]'),
            i = e.querySelector('[data-field="name"]'),
            s = e.querySelector(".command-display"),
            r = e.querySelector(".delete-action-btn");
        o &&
            o.addEventListener("change", () => {
                e.style.borderLeftColor = o.checked ? "var(--l-green)" : "var(--l-neutral-5)";
            }),
            i &&
                s &&
                i.addEventListener("input", () => {
                    const e = i.value.trim(),
                        t = a(e);
                    (s.textContent = e ? `/${t}` : "/..."), (s.style.color = e ? "var(--l-green)" : "var(--l-red-lt)");
                }),
            r &&
                !r.disabled &&
                r.addEventListener("click", async () => {
                    const a = parseInt(e.dataset.index);
                    (await showConfirm("Delete this response style?", "Delete Style", {
                        type: "danger",
                        confirmText: "Delete",
                    })) &&
                        (n.splice(a, 1),
                        e.remove(),
                        t.querySelectorAll(".action-btn-config").forEach((e, t) => {
                            e.dataset.index = t;
                            const n = e.querySelector(".delete-action-btn");
                            n && (n.dataset.index = t);
                        }));
                });
    };
    t.querySelectorAll(".action-btn-config").forEach(i);
    const s = t.querySelector("#newGroupActionName"),
        r = t.querySelector("#newGroupCommandPreview");
    s &&
        r &&
        s.addEventListener("input", () => {
            const e = s.value.trim(),
                t = a(e);
            r.textContent = e ? `/${t}` : "/...";
        }),
        t.querySelector("#addNewGroupActionBtn").addEventListener("click", () => {
            const e = t.querySelector("#newGroupActionEmoji").value.trim() || "🔹",
                a = t.querySelector("#newGroupActionName").value.trim(),
                s = t.querySelector("#newGroupActionInstruction").value.trim();
            if (!a) return void showNotification("Please enter a button name", 2e3);
            if (!s) return void showNotification("Please enter an instruction", 2e3);
            const l = {
                id: "custom_" + Date.now(),
                name: `${e} ${a}`,
                emoji: e,
                instruction: s,
                autoSend: !0,
                enabled: !0,
            };
            n.push(l);
            const c = t.querySelector("#groupActionButtonsList"),
                d = o(l, n.length - 1),
                p = document.createElement("div");
            p.innerHTML = d;
            const m = p.firstElementChild;
            c.appendChild(m),
                i(m),
                (t.querySelector("#newGroupActionEmoji").value = ""),
                (t.querySelector("#newGroupActionName").value = ""),
                (t.querySelector("#newGroupActionInstruction").value = ""),
                (r.textContent = "/..."),
                showNotification("Added new response style!", 1500);
        }),
        t.querySelector("#resetGroupToDefaultActions").addEventListener("click", async () => {
            if (
                await showConfirm(
                    "Reset all response styles to defaults? Custom styles will be lost.",
                    "Reset Styles"
                )
            ) {
                (n.length = 0), DEFAULT_GROUP_ACTION_BUTTONS.forEach((e) => n.push({ ...e }));
                (t.querySelector("#groupActionButtonsList").innerHTML = n.map((e, t) => o(e, t)).join("")),
                    t.querySelectorAll(".action-btn-config").forEach(i),
                    showNotification("Reset to default styles", 1500);
            }
        }),
        t.querySelector("#saveGroupActionConfig").addEventListener("click", () => {
            const a = [];
            t.querySelectorAll(".action-btn-config").forEach((e, t) => {
                const o = e.dataset.originalId,
                    i = e.querySelector('[data-field="enabled"]')?.checked ?? !0,
                    s = e.querySelector('[data-field="emoji"]')?.value || "🔹",
                    r = e.querySelector('[data-field="name"]')?.value?.trim() || "Action",
                    l = e.querySelector('[data-field="instruction"]')?.value?.trim() || "",
                    c = n.find((e) => e.id === o) || {};
                a.push({
                    ...c,
                    id: o || "custom_" + Date.now() + t,
                    name: `${s} ${r}`,
                    emoji: s,
                    instruction: l,
                    enabled: i,
                });
            }),
                (e.actionButtons = a),
                renderGroupActionButtons(e),
                t.remove(),
                saveGame(!1),
                showNotification("Group action buttons saved!", 2e3);
        });
}
async function executeGroupDoCommand(e, t) {
    if (!e || !t) return;
    const n = e.participantIds.map((e) => gameState.employees.find((t) => t.id === e)).filter(Boolean);
    let a = null,
        o = t;
    for (const e of n) {
        const n = e.name.split(" ")[0].toLowerCase(),
            i = e.name.toLowerCase();
        if (t.toLowerCase().startsWith(n + " ") || t.toLowerCase().startsWith(i + " ")) {
            (a = e), (o = t.substring(t.indexOf(" ") + 1));
            break;
        }
    }
    if (
        (!a &&
            (t.toLowerCase().startsWith("the scene") ||
                t.toLowerCase().startsWith("narrator") ||
                t.toLowerCase().startsWith("suddenly") ||
                t.toLowerCase().startsWith("meanwhile") ||
                t.toLowerCase().includes("atmosphere"))) ||
        (!a && e.hasNarrator)
    )
        await generateDoNarratorResponse(e, t);
    else if (a) await generateDoCharacterResponse(e, a, o);
    else {
        const a = n[Math.floor(Math.random() * n.length)];
        a && (await generateDoCharacterResponse(e, a, t));
    }
}
async function generateDoNarratorResponse(e, t) {
    addNarratorTypingIndicator();
    try {
        const n = `You are a third-person narrator describing events in an interactive story.\n\n${buildNarratorContext(e)}\n\n[DIRECTOR'S INSTRUCTION]\nThe player/director wants you to describe the following:\n"${t}"\n\nNarrate this as the omniscient narrator. Write in third person, past tense.\nDescribe the scene vividly, including character reactions and atmosphere.\nDo NOT include dialogue unless the instruction specifically asks for it.\nKeep the narration engaging (2-5 sentences).\n\nWrite only the narration:`,
            a = sanitizeNpcResponse(await queuedGenerateText(n, {}, "Narrator /do command"), 8);
        removeGroupTypingIndicator(),
            e.messages.push({
                sender: "Narrator",
                content: a,
                isNarrator: !0,
                isPlayer: !1,
                timestamp: gameState.time?.currentTime || Date.now(),
                isDoCommand: !0,
            }),
            (e.lastMessageAt = gameState.time?.currentTime || Date.now()),
            renderGroupMessages(e),
            checkGroupAutoVisualization(e, a),
            saveGame(!1);
    } catch (e) {
        console.error("Error generating narrator /do response:", e), removeGroupTypingIndicator();
    }
}
async function generateDoCharacterResponse(e, t, n) {
    addGroupTypingIndicator(t);
    try {
        const a = buildGroupContext(e, t),
            o = e.settings?.playerAbsent,
            i = `You are ${t.name}, a ${t.role || "employee"} in a company.\n${t.personality ? `Personality: ${formatPersonality(t.personality)}` : ""}\n${o ? "\n[NOTE: The boss/player is NOT in this scene. Do not address them.]" : ""}\n\n${a}\n\n[DIRECTOR'S INSTRUCTION]\nThe player/director wants you to do the following:\n"${n}"\n\nRespond as ${t.name} performing this action or saying this.\nStay in character. Make it feel natural.\nInclude physical actions in *asterisks* where appropriate.\nKeep the response appropriate length (2-4 sentences typically).\n\nWrite only ${t.name}'s response:`,
            s = sanitizeNpcResponse(await queuedGenerateText(i, {}, `${t.name} /do command`), 6);
        removeGroupTypingIndicator(),
            e.messages.push({
                sender: t.name,
                employeeId: t.id,
                content: s,
                isPlayer: !1,
                timestamp: gameState.time?.currentTime || Date.now(),
                isDoCommand: !0,
            }),
            (e.lastMessageAt = gameState.time?.currentTime || Date.now()),
            renderGroupMessages(e),
            checkGroupAutoVisualization(e, s),
            saveGame(!1);
    } catch (e) {
        console.error("Error generating character /do response:", e), removeGroupTypingIndicator();
    }
}
async function generateNarratorResponseWithInstruction(e, t) {
    addNarratorTypingIndicator();
    try {
        const n = `${buildNarratorPrompt(e, buildNarratorContext(e))}\n\n[ADDITIONAL INSTRUCTION: ${t}]`,
            a = sanitizeNpcResponse(await queuedGenerateText(n, {}, "Narrator with instruction"), 8);
        removeGroupTypingIndicator(),
            e.messages.push({
                sender: "Narrator",
                content: a,
                isNarrator: !0,
                isPlayer: !1,
                timestamp: gameState.time?.currentTime || Date.now(),
            }),
            (e.lastMessageAt = gameState.time?.currentTime || Date.now()),
            renderGroupMessages(e),
            checkGroupAutoVisualization(e, a);
    } catch (e) {
        console.error("Error generating narrator response:", e), removeGroupTypingIndicator();
    }
}
async function generateGroupResponseWithInstruction(e, t, n) {
    addGroupTypingIndicator(t);
    try {
        const a = `${buildGroupResponsePrompt(e, t, buildGroupContext(e, t), null, latestBossInstruction(e))}\n\n[RESPONSE STYLE INSTRUCTION: ${n}]`,
            o = !1 !== gameState.settings?.enableStreamingResponses;
        let i = null,
            s = !1,
            streamedSoFar = "";
        const r = $("groupMessages");
        o &&
            r &&
            gameState.activeGroup === e.id &&
            ((i = document.createElement("div")),
            (i.style.cssText =
                "display:flex; gap:8px; align-items:flex-start; padding:8px 12px; margin:4px 0; background:rgba(15,52,96,0.4); border-radius:12px; color:var(--l-ink-cool-3); align-self:flex-start; max-width:80%;"),
            (i.innerHTML = `<span style="color:var(--accent);font-weight:600;white-space:nowrap;">${t.name.split(" ")[0]}:</span><span class="stream-text">▍</span>`),
            r.appendChild(i),
            (r.scrollTop = r.scrollHeight));
        const l = await queuedGenerateText(
            a,
            {
                ...(i
                    ? {
                          onChunk: function (e) {
                              if (!e) return;
                              s || (removeGroupTypingIndicator(), (s = !0));
                              (streamedSoFar = e.fullTextSoFar || streamedSoFar);
                              const t = i.querySelector(".stream-text");
                              t && (t.textContent = e.fullTextSoFar + "▍"), r && (r.scrollTop = r.scrollHeight);
                          },
                      }
                    : {}),
            },
            `${t.name} with instruction`
        );
        i && (i.remove(), (i = null));
        let c = sanitizeNpcResponse(l, 5);
        (!c || c.startsWith("I'm having some difficulty")) &&
            streamedSoFar.trim().length > 0 &&
            (c = sanitizeNpcResponse(streamedSoFar, 5));
        removeGroupTypingIndicator(),
            e.messages.push({
                sender: t.name,
                employeeId: t.id,
                content: c,
                isPlayer: !1,
                timestamp: gameState.time?.currentTime || Date.now(),
            }),
            (e.lastMessageAt = gameState.time?.currentTime || Date.now()),
            renderGroupMessages(e),
            checkGroupAutoVisualization(e, c);
    } catch (e) {
        console.error("Error generating group response:", e), removeGroupTypingIndicator();
    }
}
function showGroupCommandsHelp() {
    const e = document.createElement("div");
    (e.id = "groupCommandsHelpModal"),
        (e.style.cssText =
            "\n      position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: var(--l-veil-85); z-index: 1000000;\n      display: flex; justify-content: center; align-items: center; padding: 20px;\n    ");
    const t = () => e.remove();
    (e.innerHTML =
        '\n      <div style="background: linear-gradient(135deg, var(--l-panel-2) 0%, var(--l-panel) 100%);\n                  border-radius: 15px; max-width: 550px; width: 100%; max-height: 90vh;\n                  overflow-y: auto; padding: 25px;">\n        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">\n          <h2 style="margin:0; color:var(--positive);">🎬 Group Commands</h2>\n          <button id="closeGroupCommandsHelp" style="background:transparent; border:none; color:var(--text-dim); font-size:1.5rem; cursor:pointer;">×</button>\n        </div>\n        \n        <div style="margin-bottom:25px;">\n          <h3 style="color:var(--danger); margin:0 0 10px 0; font-size:1rem;">🎭 /do Command</h3>\n          <p style="color:var(--text-mute); font-size:0.85rem; margin:0 0 15px 0;">\n            Direct control over characters and narrator. Type in the message input:\n          </p>\n          <div style="background:var(--bg); padding:12px; border-radius:8px; font-family:monospace; font-size:0.85rem;">\n            <div style="color:var(--l-orange); margin-bottom:8px;"><code>/do [Character] does something</code></div>\n            <div style="color:var(--text-mute); font-size:0.75rem; margin-bottom:12px;">Example: <code style="color:var(--positive);">/do Sarah leans over and whispers to Mike</code></div>\n            \n            <div style="color:var(--l-violet); margin-bottom:8px;"><code>/do The scene changes...</code></div>\n            <div style="color:var(--text-mute); font-size:0.75rem;">Triggers narrator if no character specified</div>\n          </div>\n        </div>\n        \n        <div style="margin-bottom:25px;">\n          <h3 style="color:var(--l-violet); margin:0 0 10px 0; font-size:1rem;">📜 /narrator Command</h3>\n          <p style="color:var(--text-mute); font-size:0.85rem; margin:0 0 10px 0;">\n            Trigger narrator with optional custom instructions:\n          </p>\n          <div style="background:var(--bg); padding:12px; border-radius:8px; font-family:monospace; font-size:0.85rem;">\n            <div style="color:var(--l-violet); margin-bottom:6px;"><code>/narrator</code> or <code>/n</code></div>\n            <div style="color:var(--text-mute); font-size:0.75rem; margin-bottom:10px;">→ Narrator describes the current scene</div>\n            \n            <div style="color:var(--l-violet); margin-bottom:6px;"><code>/narrator &lt;Focus on the tension in the room&gt;</code></div>\n            <div style="color:var(--text-mute); font-size:0.75rem;">→ Narrator follows your specific instruction</div>\n          </div>\n        </div>\n        \n        <div style="margin-bottom:25px;">\n          <h3 style="color:var(--l-indigo); margin:0 0 10px 0; font-size:1rem;">📝 Response Style Commands</h3>\n          <p style="color:var(--text-mute); font-size:0.85rem; margin:0 0 10px 0;">\n            Use /<em>style</em> {your message} to control how characters respond:\n          </p>\n          <div style="background:var(--bg); padding:12px; border-radius:8px; font-family:monospace; font-size:0.85rem;">\n            <div style="color:var(--positive); margin-bottom:6px;"><code>/action {Let\'s see what happens}</code></div>\n            <div style="color:var(--text-mute); font-size:0.75rem; margin-bottom:10px;">→ Characters respond with physical actions only</div>\n            \n            <div style="color:var(--positive); margin-bottom:6px;"><code>/interact {}</code></div>\n            <div style="color:var(--text-mute); font-size:0.75rem;">→ Characters talk to each other, not the player</div>\n          </div>\n        </div>\n        \n        <div style="margin-bottom:25px;">\n          <h3 style="color:var(--l-indigo); margin:0 0 10px 0; font-size:1rem;">⚙️ Group Settings</h3>\n          <ul style="color:var(--text-mute); font-size:0.85rem; padding-left:20px; margin:0;">\n            <li style="margin-bottom:8px;"><strong style="color:var(--danger);">Player Not Present</strong> - Watch NPCs interact without you</li>\n            <li style="margin-bottom:8px;"><strong style="color:var(--l-indigo);">Inter-Character Chat</strong> - NPCs address each other</li>\n            <li style="margin-bottom:8px;"><strong style="color:var(--positive);">Idle Conversations</strong> - NPCs chat when you\'re away</li>\n            <li><strong style="color:var(--l-violet);">Narrator</strong> - Third-person scene descriptions</li>\n          </ul>\n        </div>\n        \n        <div style="margin-bottom:15px;">\n          <h3 style="color:var(--positive); margin:0 0 10px 0; font-size:1rem;">🎬 Action Buttons</h3>\n          <p style="color:var(--text-mute); font-size:0.85rem; margin:0;">\n            Click action buttons to insert commands. Click ⚙️ to customize buttons - \n            add, remove, rename, or change instructions to match your style. Type <code>/help</code> (or tap ❔) to open this list again.\n          </p>\n        </div>\n        \n        <button id="closeGroupCommandsHelpBtn" style="width:100%; padding:12px; background:var(--l-green); border:none; border-radius:8px;\n                       color:var(--l-on-accent); font-weight:600; cursor:pointer; margin-top:10px;">\n          Got it!\n        </button>\n      </div>\n    '),
        document.body.appendChild(e),
        e.querySelector("#closeGroupCommandsHelp").addEventListener("click", t),
        e.querySelector("#closeGroupCommandsHelpBtn").addEventListener("click", t),
        e.addEventListener("click", (n) => {
            n.target === e && t();
        });
}
function checkGroupIdleConversations() {
    if (!gameState.groups) return;
    const e = gameNow(); // lastMessageAt is stamped on the game clock, so measure on it too
    gameState.groups.forEach((t) => {
        const n = t.settings?.idleConversations;
        if (!n?.enabled) return;
        const a = t.lastMessageAt || t.createdAt || e;
        (e - a) / 1e3 >= (n.threshold || 120) &&
            !t._idleConvInProgress &&
            gameState.activeGroup === t.id &&
            triggerIdleGroupConversation(t);
    });
}
async function triggerIdleGroupConversation(e) {
    if (!e._idleConvInProgress) {
        e._idleConvInProgress = !0;
        try {
            const t = e.participantIds.map((e) => gameState.employees.find((t) => t.id === e)).filter(Boolean);
            if (t.length < 2) return void (e._idleConvInProgress = !1);
            const n = [...t].sort(() => Math.random() - 0.5),
                a = n[0],
                o = n[1],
                i = buildGroupContext(e, a),
                s = `You are ${a.name} in a group setting.\nThe conversation has gone quiet. Start a new topic or make an observation to ${o.name}.\n${e.settings?.playerAbsent ? "The boss is not present." : ""}\n\n${i}\n\nStart a natural, casual conversation. Address ${o.name} directly.\nKeep it brief and natural (1-2 sentences).`,
                r = sanitizeNpcResponse(await queuedGenerateText(s, {}, `${a.name} idle conversation`), 4);
            e.messages.push({
                sender: a.name,
                employeeId: a.id,
                content: r,
                isPlayer: !1,
                timestamp: gameState.time?.currentTime || Date.now(),
                targetedCharacter: o.id,
                isIdleChat: !0,
            }),
                (e.lastMessageAt = gameState.time?.currentTime || Date.now()),
                gameState.activeGroup === e.id && renderGroupMessages(e),
                saveGame(!1),
                Math.random() < 0.6
                    ? setTimeout(
                          async () => {
                              await generateGroupResponse(e, o), (e._idleConvInProgress = !1);
                          },
                          2e3 + 3e3 * Math.random()
                      )
                    : (e._idleConvInProgress = !1);
        } catch (t) {
            console.error("Error generating idle conversation:", t), (e._idleConvInProgress = !1);
        }
    }
}
let groupAutocompleteState = { isActive: !1, selectedIndex: 0, matches: [], searchTerm: "", lockedTarget: null };
function initGroupCharacterAutocomplete() {
    const e = $("groupInput");
    if (!e) return;
    e.addEventListener("input", handleGroupAutocompleteInput),
        e.addEventListener("keydown", handleGroupAutocompleteKeydown),
        e.addEventListener("blur", () => {
            setTimeout(() => hideGroupAutocomplete(), 150);
        });
    const t = $("clearGroupTarget");
    t &&
        t.addEventListener("click", (e) => {
            e.stopPropagation(), clearGroupTargetLock();
        });
}
function handleGroupAutocompleteInput(e) {
    const t = e.target.value,
        n = gameState.groups?.find((e) => e.id === gameState.activeGroup);
    if (!n) return void hideGroupAutocomplete();
    const a = t.match(/^\/do\s+(.*)$/i);
    if (a) {
        const e = a[1];
        if (groupAutocompleteState.lockedTarget) return void hideGroupAutocomplete();
        const t = n.participantIds.map((e) => gameState.employees.find((t) => t.id === e)).filter(Boolean);
        if (0 === t.length) return void hideGroupAutocomplete();
        const o = e.toLowerCase().trim();
        if (0 === o.length) return void showGroupAutocomplete(t, "", n);
        const i = t.filter((e) => {
            const t = e.name.toLowerCase(),
                n = e.name.split(" ")[0].toLowerCase(),
                a = e.name.split(" ").slice(1).join(" ").toLowerCase();
            return t.startsWith(o) || n.startsWith(o) || (a && a.startsWith(o));
        });
        if (0 === i.length) {
            const e = t.filter((e) => e.name.toLowerCase().includes(o));
            if (e.length > 0) return void showGroupAutocomplete(e, o, n);
        }
        i.length > 0 ? showGroupAutocomplete(i, o, n) : hideGroupAutocomplete();
    } else hideGroupAutocomplete();
}
function showGroupAutocomplete(e, t, n) {
    const a = $("groupCharacterAutocomplete"),
        o = $("autocompleteResults"),
        i = $("autocompleteSearchTerm");
    a &&
        o &&
        ((groupAutocompleteState.isActive = !0),
        (groupAutocompleteState.matches = e),
        (groupAutocompleteState.searchTerm = t),
        (groupAutocompleteState.selectedIndex = 0),
        i && (i.textContent = t ? `"${t}"` : "(type name)"),
        (o.innerHTML = e
            .map((n, a) => {
                const o = n.profileImage || n.generatedPortrait || "",
                    i = o && (o.startsWith("http") || o.startsWith("data:")),
                    s = a === groupAutocompleteState.selectedIndex,
                    r = n.name.split(" ")[0],
                    l = e.filter((e) => e.name.split(" ")[0] === r).length > 1;
                return `\n        <div class="autocomplete-item" data-index="${a}" data-employee-id="${n.id}" \n             style="display:flex; align-items:center; gap:12px; padding:10px 12px; cursor:pointer; border-radius:8px; margin:2px 0;\n                    background:${s ? "rgba(78,204,163,0.2)" : "transparent"};\n                    border:${s ? "1px solid var(--positive)" : "1px solid transparent"};\n                    transition:all 0.15s;">\n          <div style="width:40px; height:40px; border-radius:50%; overflow:hidden; background:var(--surface-2); flex-shrink:0;\n                      border:2px solid ${s ? "var(--l-green)" : "var(--l-neutral-3)"};">\n            ${i ? `<img src="${o}" style="width:100%; height:100%; object-fit:cover;">` : '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">👤</div>'}\n          </div>\n          <div style="flex:1; min-width:0;">\n            <div style="font-weight:600; color:${s ? "var(--l-green)" : "white"}; font-size:0.95rem;">\n              ${((
                        e
                    ) => {
                        if (!t) return e;
                        const n = e.toLowerCase().indexOf(t.toLowerCase());
                        return -1 === n
                            ? e
                            : e.substring(0, n) +
                                  '<span style="background:var(--l-green); color:var(--l-on-accent); padding:0 2px; border-radius:2px;">' +
                                  e.substring(n, n + t.length) +
                                  "</span>" +
                                  e.substring(n + t.length);
                    })(
                        n.name
                    )}\n              ${l ? '<span style="color:var(--accent-gold); font-size:0.7rem; margin-left:5px;">⚠️ Similar name</span>' : ""}\n            </div>\n            <div style="color:var(--text-mute); font-size:0.75rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\n              ${n.role || "Employee"}\n            </div>\n          </div>\n          <div style="color:${s ? "var(--l-green)" : "var(--l-neutral-5)"}; font-size:0.7rem; font-weight:500;">\n            ${s ? "↵ Enter" : ""}\n          </div>\n        </div>\n      `;
            })
            .join("")),
        o.querySelectorAll(".autocomplete-item").forEach((t) => {
            t.addEventListener("click", () => {
                const n = t.dataset.employeeId,
                    a = e.find((e) => e.id === n);
                a && selectGroupAutocompleteCharacter(a);
            }),
                t.addEventListener("mouseenter", () => {
                    updateGroupAutocompleteSelection(parseInt(t.dataset.index));
                });
        }),
        (a.style.display = "block"));
}
function hideGroupAutocomplete() {
    const e = $("groupCharacterAutocomplete");
    e && (e.style.display = "none"),
        (groupAutocompleteState.isActive = !1),
        (groupAutocompleteState.matches = []),
        (groupAutocompleteState.selectedIndex = 0);
}
function updateGroupAutocompleteSelection(e) {
    const t = $("autocompleteResults");
    if (!t) return;
    const n = t.querySelectorAll(".autocomplete-item");
    n.forEach((e, t) => {
        (e.style.background = "transparent"), (e.style.border = "1px solid transparent");
        const n = e.querySelector("div > div:first-child");
        n && (n.style.color = "var(--l-ink)");
        const a = e.querySelector('div[style*="border-radius:50%"]');
        a && (a.style.borderColor = "var(--l-neutral-3)");
        const o = e.querySelector("div:last-child");
        o && ((o.textContent = ""), (o.style.color = "var(--l-on-accent)"));
    }),
        (groupAutocompleteState.selectedIndex = e);
    const a = n[e];
    if (a) {
        (a.style.background = "rgba(78,204,163,0.2)"), (a.style.border = "1px solid var(--positive)");
        const e = a.querySelector("div > div:first-child");
        e && (e.style.color = "var(--l-green)");
        const t = a.querySelector('div[style*="border-radius:50%"]');
        t && (t.style.borderColor = "var(--l-green)");
        const n = a.querySelector("div:last-child");
        n && ((n.textContent = "↵ Enter"), (n.style.color = "var(--l-green)")),
            a.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
}
function handleGroupAutocompleteKeydown(e) {
    if (!groupAutocompleteState.isActive) return;
    const { matches: t, selectedIndex: n } = groupAutocompleteState;
    switch (e.key) {
        case "ArrowDown":
            e.preventDefault();
            updateGroupAutocompleteSelection((n + 1) % t.length);
            break;
        case "ArrowUp":
            e.preventDefault();
            updateGroupAutocompleteSelection(0 === n ? t.length - 1 : n - 1);
            break;
        case "Tab":
            e.preventDefault(), t.length > 0 && selectGroupAutocompleteCharacter(t[n]);
            break;
        case "Enter":
            t.length > 0 &&
                groupAutocompleteState.isActive &&
                (e.preventDefault(), e.stopPropagation(), selectGroupAutocompleteCharacter(t[n]));
            break;
        case "Escape":
            hideGroupAutocomplete();
    }
}
function selectGroupAutocompleteCharacter(e) {
    const t = $("groupInput");
    if (!t || !e) return;
    t.value;
    const n = `/do ${e.name} `;
    (t.value = n),
        t.focus(),
        t.setSelectionRange(n.length, n.length),
        (groupAutocompleteState.lockedTarget = e),
        showGroupTargetIndicator(e),
        hideGroupAutocomplete(),
        (t.style.borderColor = "var(--l-green)"),
        (t.style.boxShadow = "0 0 10px rgba(78,204,163,0.3)"),
        setTimeout(() => {
            (t.style.borderColor = "var(--l-neutral-3)"), (t.style.boxShadow = "none");
        }, 500);
}
function showGroupTargetIndicator(e) {
    const t = $("groupTargetIndicator"),
        n = $("groupTargetName");
    if (t && n) {
        const a = e.profileImage || e.generatedPortrait || "",
            o = a && (a.startsWith("http") || a.startsWith("data:"));
        (n.innerHTML = `\n        <span style="display:inline-flex; align-items:center; gap:4px;">\n          ${o ? `<img src="${a}" style="width:16px; height:16px; border-radius:50%; object-fit:cover;">` : "🎯"}\n          <span>${e.name.split(" ")[0]}</span>\n        </span>\n      `),
            (t.style.display = "flex");
    }
}
function clearGroupTargetLock() {
    const e = $("groupTargetIndicator"),
        t = $("groupInput");
    e && (e.style.display = "none"),
        (groupAutocompleteState.lockedTarget = null),
        t && t.value.toLowerCase().startsWith("/do ") && ((t.value = "/do "), t.focus());
}
function resetGroupAutocompleteState() {
    hideGroupAutocomplete(), (groupAutocompleteState.lockedTarget = null);
    const e = $("groupTargetIndicator");
    e && (e.style.display = "none");
}
function initGroupAttachmentMenu() {
    const e = $("groupAttachBtn"),
        t = $("groupAttachmentMenu");
    e &&
        (e.onclick = (e) => {
            e.stopPropagation(), toggleGroupAttachmentMenu();
        }),
        document.addEventListener("click", (n) => {
            t &&
                "block" === t.style.display &&
                (t.contains(n.target) || n.target === e || closeGroupAttachmentMenu());
        }),
        document.querySelectorAll(".group-attach-menu-item").forEach((e) => {
            e.addEventListener("mouseenter", () => {
                e.style.background = "rgba(102,126,234,0.2)";
            }),
                e.addEventListener("mouseleave", () => {
                    e.style.background = "transparent";
                }),
                (e.onclick = () => {
                    switch (e.dataset.action) {
                        case "send-money":
                            openGroupSendMoneyModal();
                            break;
                        case "give-gift":
                            openGroupGiftModal();
                            break;
                        case "request-image":
                            openGroupRequestImageModal();
                            break;
                        case "request-group-photo":
                            openGroupPhotoRequestModal();
                            break;
                        case "request-post":
                            openGroupRequestPostModal();
                            break;
                        case "visualize":
                            openGroupVisualizeModal();
                    }
                });
        }),
        document.querySelectorAll(".group-money-preset").forEach((e) => {
            (e.onclick = () => {
                const t = e.dataset.preset,
                    n = gameState.cash || 0;
                let a = 0;
                "small" === t
                    ? (a = Math.max(100, Math.floor(0.01 * n)))
                    : "medium" === t
                      ? (a = Math.max(1e3, Math.floor(0.05 * n)))
                      : "large" === t && (a = Math.max(1e4, Math.floor(0.1 * n)));
                const o = $("groupCustomMoneyAmount");
                o && (o.value = a);
            }),
                e.addEventListener("mouseenter", () => {
                    (e.style.background = "var(--l-green)"), (e.style.borderColor = "var(--l-green)");
                }),
                e.addEventListener("mouseleave", () => {
                    (e.style.background = "var(--l-line)"), (e.style.borderColor = "var(--l-green)");
                });
        }),
        document.querySelectorAll(".group-request-preset").forEach((e) => {
            (e.onclick = () => sendGroupImageRequest(e.dataset.preset)),
                e.addEventListener("mouseenter", () => {
                    (e.style.background = "explicit" === e.dataset.preset ? "var(--l-crimson)" : "var(--l-cyan)"),
                        (e.style.color = "var(--l-ink)");
                }),
                e.addEventListener("mouseleave", () => {
                    (e.style.background = "var(--l-line)"),
                        (e.style.color = "explicit" === e.dataset.preset ? "var(--l-crimson)" : "white");
                });
        }),
        document.querySelectorAll(".group-post-preset").forEach((e) => {
            (e.onclick = () => sendGroupPostRequest(e.dataset.preset)),
                e.addEventListener("mouseenter", () => {
                    (e.style.background = "explicit" === e.dataset.preset ? "var(--l-crimson)" : "var(--l-amber-2)"),
                        (e.style.color = "explicit" === e.dataset.preset ? "white" : "var(--l-panel-2)");
                }),
                e.addEventListener("mouseleave", () => {
                    (e.style.background = "var(--l-line)"),
                        (e.style.color = "explicit" === e.dataset.preset ? "var(--l-crimson)" : "white");
                });
        });
    $("groupImageRequestPrompt")?.closest("div")?.querySelector("button:last-child");
}
function toggleGroupsSidebar() {
    const e = $("groupsSidebar"),
        t = $("sidebarToggleBtn"),
        n = $("collapseSidebarBtn");
    if (!e) return;
    const a = e.classList.toggle("collapsed");
    t && ((t.style.display = a ? "flex" : "none"), (t.innerHTML = "▶"), (t.title = "Show groups list")),
        n && ((n.innerHTML = "◀"), (n.title = "Collapse sidebar")),
        gameState.uiPreferences || (gameState.uiPreferences = {}),
        (gameState.uiPreferences.groupsSidebarCollapsed = a),
        saveGame(!1);
}
function showGroupsListMobile() {
    const e = $("groupsSidebar"),
        t = $("groupChatView"),
        n = $("groupBackBtn");
    window.innerWidth <= 768 &&
        (e && ((e.style.display = "flex"), e.classList.remove("mobile-hidden")),
        t && ((t.style.display = "none"), t.classList.add("mobile-hidden")),
        n && (n.style.display = "none"),
        (gameState.activeGroup = null),
        renderGroupsList());
}
function updateMobileGroupView(e = !0) {
    const t = $("groupsSidebar"),
        n = $("groupChatView"),
        a = $("groupBackBtn");
    window.innerWidth <= 768
        ? e
            ? (t && ((t.style.display = "none"), t.classList.add("mobile-hidden")),
              n && ((n.style.display = "flex"), n.classList.remove("mobile-hidden")),
              a && (a.style.display = "block"))
            : (t && ((t.style.display = "flex"), t.classList.remove("mobile-hidden")),
              n && ((n.style.display = "none"), n.classList.add("mobile-hidden")),
              a && (a.style.display = "none"))
        : (t && ((t.style.display = "flex"), t.classList.remove("mobile-hidden")),
          n && ((n.style.display = "flex"), n.classList.remove("mobile-hidden")),
          a && (a.style.display = "none"));
}
function updateSidebarToggleVisibility() {
    const e = $("groupsSidebar"),
        t = $("sidebarToggleBtn"),
        n = $("groupBackBtn");
    if (!e || !t) return;
    const a = window.innerWidth <= 768,
        o = e.classList.contains("collapsed");
    if (a)
        (t.style.display = "none"),
            n && gameState.activeGroup && (n.style.display = "block"),
            updateMobileGroupView(!!gameState.activeGroup);
    else {
        (t.style.display = o ? "flex" : "none"), n && (n.style.display = "none"), e && (e.style.display = "flex");
        const a = $("groupChatView");
        a && (a.style.display = "flex");
    }
    !a &&
        gameState.uiPreferences?.groupsSidebarCollapsed &&
        (e.classList.add("collapsed"), (t.style.display = "flex"));
}
setTimeout(initGroupAttachmentMenu, 100);
