// ============================================================================
// 38-groups — Groups: create/manage groups, group chat, speaker queue, autocomplete, action bar, group money/gift/photo/post/visualize requests.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

function openCreateGroupModal(e = null) {
  const t = $("createGroupModal");
  if (!t) return;
  const n = $("newGroupName");
  n && (n.value = ""), window.selectedGroupParticipants = /* @__PURE__ */ new Set(), e && window.selectedGroupParticipants.add(e);
  const a = $("convertChatOption"), o = $("convertExistingChat"), i = $("convertChatInfo");
  if (e) {
    const t2 = gameState.employees.find((t3) => t3.id === e), n2 = gameState.chatHistory[e] || [];
    t2 && n2.length > 0 ? (a && (a.style.display = "block"), i && (i.textContent = `Include ${n2.length} messages from chat with ${t2.name}`), o && (o.checked = true), window.convertFromEmployeeId = e) : (a && (a.style.display = "none"), window.convertFromEmployeeId = null);
  } else a && (a.style.display = "none"), window.convertFromEmployeeId = null;
  Gu(), Uu(), t.style.display = "flex";
}
function closeCreateGroupModal() {
  const e = $("createGroupModal");
  e && (e.style.display = "none"), window.selectedGroupParticipants = /* @__PURE__ */ new Set(), window.convertFromEmployeeId = null;
}
function Gu() {
  const e = $("participantGrid");
  if (!e) return;
  const t = $("participantSearch"), n = t ? t.value.toLowerCase() : "", a = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && (!n || e2.name.toLowerCase().includes(n)));
  e.innerHTML = a.map((e2) => {
    const t2 = window.selectedGroupParticipants?.has(e2.id), n2 = e2.profileImage || e2.generatedPortrait || "", a2 = n2 && (n2.startsWith("http") || n2.startsWith("data:"));
    return ` <div class="participant-card" data-employee-id="${e2.id}" 
             style="padding:12px; background:${t2 ? "rgba(102,126,234,0.3)" : "var(--ae)"}; 
                    border:2px solid ${t2 ? "var(--j)" : "transparent"}; 
                    border-radius:12px; cursor:pointer; text-align:center; transition:all 0.2s;"
             onmouseenter="if(!this.classList.contains('selected')) this.style.background='rgba(102,126,234,0.1)';"
             onmouseleave="if(!this.classList.contains('selected')) this.style.background='${t2 ? "rgba(102,126,234,0.3)" : "var(--ae)"}';"> <div style="width:50px; height:50px; margin:0 auto 8px; border-radius:50%; overflow:hidden; background:var(--h); display:flex; align-items:center; justify-content:center; font-size:1.8rem;"> ${a2 ? `<img src="${n2}" style="width:100%; height:100%; object-fit:cover;">` : "\u{1F464}"} </div> <div style="font-size:0.85rem; color:var(--b); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e2.name.split(" ")[0]}</div> <div style="font-size:0.7rem; color:var(--e);">${e2.role || "Employee"}</div> ${t2 ? '<div style="color:var(--g); font-size:0.7rem; margin-top:4px;">\u2713 Selected</div>' : ""} </div> `;
  }).join(""), e.querySelectorAll(".participant-card").forEach((e2) => {
    e2.addEventListener("click", () => toggleParticipantSelection(e2.dataset.employeeId));
  });
}
function toggleParticipantSelection(e) {
  window.selectedGroupParticipants || (window.selectedGroupParticipants = /* @__PURE__ */ new Set()), window.selectedGroupParticipants.has(e) ? window.selectedGroupParticipants.delete(e) : window.selectedGroupParticipants.add(e), Gu(), Uu(), Ku();
}
function Uu() {
  const e = $("selectedCount"), t = window.selectedGroupParticipants?.size || 0;
  e && (e.textContent = `${t} selected`, e.style.background = t >= 2 ? "var(--n)" : "var(--j)");
}
function Ku() {
  const e = $("selectedParticipantsPreview"), t = $("selectedAvatarRow");
  if (!e || !t) return;
  const n = Array.from(window.selectedGroupParticipants || []);
  0 !== n.length ? (e.style.display = "block", t.innerHTML = n.map((e2) => {
    const t2 = gameState.employees.find((t3) => t3.id === e2);
    if (!t2) return "";
    const n2 = t2.profileImage || t2.generatedPortrait || "";
    return ` <div style="display:flex; align-items:center; gap:8px; padding:6px 12px; background:var(--h); border-radius:20px;"> <div style="width:24px; height:24px; border-radius:50%; overflow:hidden; background:var(--f); display:flex; align-items:center; justify-content:center; font-size:1rem;"> ${n2 && (n2.startsWith("http") || n2.startsWith("data:")) ? `<img src="${n2}" style="width:100%; height:100%; object-fit:cover;">` : "\u{1F464}"} </div> <span style="font-size:0.85rem; color:var(--b);">${t2.name.split(" ")[0]}</span> <button onclick="toggleParticipantSelection('${e2}')" style="background:transparent; border:none; color:var(--k); cursor:pointer; font-size:0.8rem; padding:0;">\u2715</button> </div> `;
  }).join("")) : e.style.display = "none";
}
const Ju = 8;
async function Qu() {
  const e = Array.from(window.selectedGroupParticipants || []);
  if (e.length < 2) return void showNotification("Please select at least 2 participants", 2e3);
  if (e.length > Ju) return void showNotification(`Groups are capped at ${Ju} participants`, 2500);
  const t = $("newGroupName"), n = $("convertExistingChat"), a = $("generateAiPretext"), o = $("includeNarrator");
  let i = t?.value.trim();
  const s = n?.checked && window.convertFromEmployeeId, r = s && a?.checked, l = o?.checked || false;
  if (!i) {
    const t2 = e.map((e2) => gameState.employees.find((t3) => t3.id === e2)?.name.split(" ")[0]).filter(Boolean).slice(0, 3);
    i = t2.length > 2 ? `${t2.slice(0, 2).join(", ")} & others` : t2.join(" & ");
  }
  r && ep();
  const c = { id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name: i, participantIds: e, messages: [], createdAt: gameState.time?.currentTime || Date.now(), lastMessageAt: gameState.time?.currentTime || Date.now(), convertedFromChatId: s ? window.convertFromEmployeeId : null, pretext: null, hasNarrator: l, unreadCount: 0, settings: { includeContext: true, replyLimit: 2 } };
  if (s && window.convertFromEmployeeId) {
    const t2 = gameState.chatHistory[window.convertFromEmployeeId] || [];
    if (t2.length > 0) {
      const n2 = gameState.employees.find((e2) => e2.id === window.convertFromEmployeeId);
      if (c.contextSummary = Zu(window.convertFromEmployeeId, t2), r) try {
        np("Generating scene summary...", 30), c.pretext = await ap(window.convertFromEmployeeId, t2, e), np("Finalizing group...", 90);
      } catch (e2) {
        console.error("Error generating pretext:", e2);
      }
      c.messages.push({ sender: "system", content: `\u{1F4E5} Group created from conversation with ${n2?.name || "unknown"}. Previous chat context has been preserved.`, isSystem: true, timestamp: c.createdAt });
    }
  }
  tp(), gameState.groups || (gameState.groups = []), gameState.groups.unshift(c), saveGame(false), closeCreateGroupModal(), rp(), lp(c.id), showNotification(`\u2728 Group "${i}" created!`, 2e3);
}
function Zu(e, t) {
  const n = gameState.employees.find((t2) => t2.id === e);
  if (!n || !t.length) return "";
  const a = t.filter((e2) => !e2.isSystem && e2.content && e2.content.length > 10).slice(-10).map((e2) => `${e2.isPlayer ? "You" : n.name}: ${e2.content.length > 150 ? e2.content.substring(0, 147) + "..." : e2.content}`).join("\n");
  return `Recent conversation with ${n.name}:
${a}`;
}
function ep() {
  const e = $("groupCreationLoader"), t = e?.parentElement;
  e && t && (t.style.position = "relative", e.style.display = "flex", np("Preparing...", 10));
}
function tp() {
  const e = $("groupCreationLoader");
  e && (e.style.display = "none");
}
function np(e, t) {
  const n = $("loaderStatusText"), a = $("loaderProgressBar");
  n && (n.textContent = e), a && (a.style.width = `${t}%`);
}
async function ap(e, t, n) {
  const a = gameState.employees.find((t2) => t2.id === e);
  if (!a || !t.length) return null;
  const o = n.map((e2) => gameState.employees.find((t2) => t2.id === e2)?.name).filter(Boolean), i = t.filter((e2) => !e2.isSystem && e2.content && e2.content.length > 5).slice(-25);
  if (i.length < 3) return null;
  const s = i.map((e2) => `${e2.isPlayer ? "You (the boss)" : a.name}: ${e2.content}`).join("\n"), r = `You are creating a "Pre-text" scene summary for a group chat that's being created from a 1-on-1 conversation.

This pre-text will:
1. Set the scene for where the conversation is taking place
2. Summarize the tone/mood and what's been discussed
3. Provide context for new participants joining

Source conversation was between: You (the boss) and ${a.name} (${a.role || "Employee"})
New group participants: ${o.join(", ")}

Recent conversation:
${s}

Write a vivid, engaging pre-text (3-5 sentences) that:
- Describes the setting/scene (where, when, atmosphere)
- Captures the emotional tone and dynamic
- Summarizes key topics or themes discussed
- Sets up context for the group conversation

Write in present tense, third person perspective. Be specific and evocative, not generic.

Pre-text:`;
  try {
    return (await queuedGenerateText(r, {}, "Generating group pre-text")).trim().replace(/^["']|["']$/g, "");
  } catch (e2) {
    return console.error("Failed to generate pretext:", e2), null;
  }
}
function ip(e) {
  if (!e) return "";
  const t = Date.now() - e;
  return t < 6e4 ? "now" : t < 36e5 ? Math.floor(t / 6e4) + "m" : t < 864e5 ? Math.floor(t / 36e5) + "h" : t < 6048e5 ? Math.floor(t / 864e5) + "d" : new Date(e).toLocaleDateString(void 0, { month: "short", day: "numeric" });
}
function rp() {
  const e = $("groupsList"), t = $("noGroupsMessage"), n = $("groupSearchInput");
  if (!e) return;
  const a = n?.value?.toLowerCase() || "", o = (gameState.groups || []).filter((e2) => !a || (e2.name || "").toLowerCase().includes(a));
  if (t && (t.style.display = 0 === o.length ? "block" : "none"), 0 === o.length) return;
  const i = [...o].sort((e2, t2) => (t2.lastMessageAt || 0) - (e2.lastMessageAt || 0));
  e.innerHTML = i.map((e2) => {
    const t2 = gameState.activeGroup === e2.id, n2 = cp(e2, "groups list"), u2 = e2.messages || [], a2 = u2[u2.length - 1], o2 = a2 ? a2.isSystem ? a2.content : `${(a2.sender || "Unknown").split(" ")[0]}: ${a2.content || ""}` : "No messages yet", i2 = n2.slice(0, 3).map((e3, t3) => {
      const n3 = e3.profileImage || e3.generatedPortrait || "";
      return ` <div style="width:32px; height:32px; border-radius:50%; border:2px solid var(--w); background:var(--f); margin-left:${t3 > 0 ? "-10px" : "0"}; z-index:${3 - t3}; position:relative;
                      display:flex; align-items:center; justify-content:center; overflow:hidden; font-size:1.2rem;">
            ${n3 && (n3.startsWith("http") || n3.startsWith("data:")) ? `<img src="${n3}" style="width:100%; height:100%; object-fit:cover;">` : "\u{1F464}"} </div> `;
    }).join(""), s = n2.length - 3, r = e2.unreadCount || 0, l = ip(e2.lastMessageAt);
    return ` <div class="group-item" data-group-id="${e2.id}"
             style="padding:10px 12px; margin-bottom:6px; background:${t2 ? "rgba(102,126,234,0.2)" : "transparent"};
                    border-radius:10px; cursor:pointer; transition:all 0.2s; border:1px solid ${t2 ? "rgba(102,126,234,0.4)" : "transparent"};"
             onmouseenter="if(this.dataset.groupId !== '${gameState.activeGroup}') this.style.background='var(--bb)';"
             onmouseleave="if(this.dataset.groupId !== '${gameState.activeGroup}') this.style.background='transparent';"> <div style="display:flex; align-items:center; gap:10px;"> <div style="position:relative; display:flex; align-items:center; flex-shrink:0;"> ${i2}
              ${s > 0 ? `<div style="width:28px; height:28px; border-radius:50%; background:var(--j); margin-left:-8px; display:flex; align-items:center; justify-content:center; font-size:0.65rem; color:var(--s); border:2px solid var(--w);">+${s}</div>` : ""}
              ${r > 0 ? `<div style="position:absolute; top:-4px; right:-4px; background:var(--l); color:var(--s); border-radius:50%; min-width:16px; height:16px; font-size:0.65rem; font-weight:700; display:flex; align-items:center; justify-content:center; padding:0 3px; border:2px solid var(--w);">${r > 9 ? "9+" : r}</div>` : ""} </div> <div style="flex:1; min-width:0;"> <div style="display:flex; justify-content:space-between; align-items:baseline; gap:6px;"> <div style="font-weight:600; color:${r > 0 ? "var(--b)" : "var(--ao)"}; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e2.name}</div> ${l ? `<div style="font-size:0.7rem; color:var(--q); flex-shrink:0;">${l}</div>` : ""} </div> <div style="font-size:0.78rem; color:${r > 0 ? "var(--ar)" : "var(--af)"}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">${o2}</div> </div> </div> </div> `;
  }).join(""), e.querySelectorAll(".group-item").forEach((e2) => {
    e2.addEventListener("click", () => lp(e2.dataset.groupId));
  });
}
function lp(e) {
  const t = gameState.groups?.find((t2) => t2.id === e);
  if (!t) return;
  gameState.activeGroup = e, t.unreadCount = 0;
  const n = $("noGroupSelected"), a = $("activeGroupChat");
  n && (n.style.display = "none"), a && (a.style.display = "flex"), mg(true);
  const o = $("groupTitle"), i = $("groupParticipantCount");
  o && (o.textContent = t.name), i && (i.textContent = `${t.participantIds.length} participants`), dp(t), pp(t), Np(t), jm(t);
  const s = $("groupActionBarWrapper");
  s && (s.style.display = Om ? "none" : "block"), gameState.groupSpeakerQueue = [], hp(), rp(), setTimeout(() => saveGame(false), 0);
}
function cp(e, t = "group") {
  return (e?.participantIds || []).map((id) => gameState.employees.find((x) => x.id === id) || (console.warn(`[Group] participant id ${id} no longer resolves (${t}) \u2014 dropping from display`), null)).filter(Boolean);
}
function dp(e) {
  const t = $("groupParticipantAvatars");
  if (!t) return;
  const n = cp(e, "header avatars");
  t.innerHTML = n.slice(0, 5).map((e2, t2) => {
    const n2 = e2.profileImage || e2.generatedPortrait || "";
    return ` <div style="width:36px; height:36px; border-radius:50%; border:2px solid var(--t); background:var(--h); margin-left:${t2 > 0 ? "-12px" : "0"}; z-index:${5 - t2}; position:relative;
                    display:flex; align-items:center; justify-content:center; overflow:hidden;">
          ${n2 && (n2.startsWith("http") || n2.startsWith("data:")) ? `<img src="${n2}" style="width:100%; height:100%; object-fit:cover;" title="${e2.name}">` : '<span style="font-size:1.2rem;">\u{1F464}</span>'} </div> `;
  }).join("");
}
function pp(e) {
  const t = $("participantSelector");
  if (!t) return;
  let n = cp(e, "selector bar").map((e2) => {
    const t2 = e2.profileImage || e2.generatedPortrait || "", n2 = t2 && (t2.startsWith("http") || t2.startsWith("data:")), a = gameState.groupSpeakerQueue?.includes(e2.id), o = e2.name.split(" ")[0], i = o.length > 8 ? o.substring(0, 7) + "\u2026" : o;
    return ` <div class="participant-portrait-container" data-employee-id="${e2.id}" 
             style="display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer;"
             title="${e2.name} - Click to queue, double-click for instant response">
          <div class="participant-portrait"
               style="width:48px; height:48px; border-radius:50%; position:relative;
                      background:${a ? "linear-gradient(135deg, var(--j) 0%, var(--ak) 100%)" : "var(--ae)"};
                      padding:3px; transition:all 0.2s; box-shadow:${a ? "0 0 15px rgba(102,126,234,0.5)" : "none"};"> <div style="width:100%; height:100%; border-radius:50%; overflow:hidden; background:var(--h); display:flex; align-items:center; justify-content:center;"> ${n2 ? `<img src="${t2}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="font-size:1.5rem;">\u{1F464}</span>'} </div> ${a ? `<div style="position:absolute; bottom:-2px; right:-2px; background:var(--n); color:var(--q); width:18px; height:18px; border-radius:50%; font-size:0.65rem; font-weight:bold; display:flex; align-items:center; justify-content:center;">${gameState.groupSpeakerQueue.indexOf(e2.id) + 1}</div>` : ""} </div> <span style="font-size:0.7rem; color:var(--e); text-align:center; max-width:60px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${i}</span> </div> `;
  }).join("");
  if (e.hasNarrator) {
    const e2 = gameState.groupSpeakerQueue?.includes("__narrator__");
    n += ` <div class="participant-portrait-container narrator-portrait" data-employee-id="__narrator__" style="display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer;" title="Narrator - Click to queue, double-click for instant narration"> <div class="participant-portrait" style="width:48px; height:48px; border-radius:50%; position:relative; background:${e2 ? "linear-gradient(135deg, var(--x) 0%, var(--bt) 100%)" : "rgba(199,125,255,0.2)"};
                      padding:3px; transition:all 0.2s; box-shadow:${e2 ? "0 0 15px rgba(199,125,255,0.5)" : "none"}; border:2px dashed rgba(199,125,255,0.5);"> <div style="width:100%; height:100%; border-radius:50%; overflow:hidden; background:var(--ad); display:flex; align-items:center; justify-content:center;"> <span style="font-size:1.5rem;">\u{1F4DC}</span> </div> ${e2 ? `<div style="position:absolute; bottom:-2px; right:-2px; background:var(--x); color:var(--q); width:18px; height:18px; border-radius:50%; font-size:0.65rem; font-weight:bold; display:flex; align-items:center; justify-content:center;">${gameState.groupSpeakerQueue.indexOf("__narrator__") + 1}</div>` : ""} </div> <span style="font-size:0.7rem; color:var(--x); text-align:center;">Narrator</span> </div> `;
  }
  t.innerHTML = n, t.querySelectorAll(".participant-portrait-container").forEach((e2) => {
    e2.addEventListener("click", (t2) => {
      t2.preventDefault(), mp(e2.dataset.employeeId);
    }), e2.addEventListener("dblclick", (t2) => {
      t2.preventDefault(), gp(e2.dataset.employeeId);
    });
  });
}
function mp(e) {
  gameState.groupSpeakerQueue || (gameState.groupSpeakerQueue = []);
  const t = gameState.groupSpeakerQueue.indexOf(e);
  t > -1 ? gameState.groupSpeakerQueue.splice(t, 1) : gameState.groupSpeakerQueue.push(e);
  const n = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  n && pp(n), hp();
}
async function gp(e) {
  const t = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!t) return;
  const n = gameState.groupSpeakerQueue?.indexOf(e) ?? -1;
  if (n > -1 && (gameState.groupSpeakerQueue.splice(n, 1), hp()), "__narrator__" === e) return void await wp(t);
  const a = gameState.employees.find((t2) => t2.id === e);
  a && await bp(t, a);
}
function hp() {
  const e = $("queuedSpeakers"), t = $("queuedSpeakersList");
  if (!e || !t) return;
  const n = gameState.groupSpeakerQueue || [];
  if (0 === n.length) return void (e.style.display = "none");
  e.style.display = "block";
  const a = n.map((e2) => {
    if ("__narrator__" === e2) return "\u{1F4DC} Narrator";
    const t2 = gameState.employees.find((t3) => t3.id === e2);
    return t2 ? t2.name.split(" ")[0] : "Unknown";
  }).join(" \u2192 ");
  t.textContent = a;
}
function yp() {
  gameState.groupSpeakerQueue = [], hp();
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  e && pp(e);
}
function fp(e, t, n) {
  const a = (e.participantIds || []).map((e2) => gameState.employees.find((t2) => t2.id === e2)).filter(Boolean);
  if (0 === a.length) return [];
  t = Math.max(1, Math.min(t || 1, a.length));
  const o = (n || "").toLowerCase(), i = [], s = e.messages || [];
  for (let e2 = s.length - 1; e2 >= 0 && i.length < 3; e2--) {
    const t2 = s[e2];
    t2.employeeId && !i.includes(t2.employeeId) && i.push(t2.employeeId);
  }
  const r = a.map((e2) => {
    let t2 = 1 + 0.6 * Math.random();
    const n2 = e2.name.split(" ")[0].toLowerCase();
    o && (o.includes(n2) || o.includes(e2.name.toLowerCase())) && (t2 += 5), t2 += (e2.personality?.outgoing ?? 50) / 100 * 0.8;
    const a2 = e2.stats || {};
    t2 += ((a2.affection || 0) + (a2.desire || 0)) / 200 * 0.6;
    const s2 = i.indexOf(e2.id);
    return 0 === s2 ? t2 -= 1.2 : 1 === s2 && (t2 -= 0.6), { emp: e2, score: t2 };
  });
  return r.sort((e2, t2) => t2.score - e2.score), r.slice(0, t).map((e2) => e2.emp);
}
async function vp() {
  const e = $("groupInput"), t = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!e || !t) return;
  const n = e.value.trim();
  if (!(n || gameState.groupSpeakerQueue && 0 !== gameState.groupSpeakerQueue.length)) return;
  if ("function" == typeof ug && ug(), n && n.toLowerCase().startsWith("/do ")) {
    const a2 = n.substring(4).trim();
    return e.value = "", void await Gm(t, a2);
  }
  const a = n.match(/^\/([a-zA-Z]+)(?:\s+([A-Za-z]+))?\s*(?:\{([^}]*)\})?\s*(?:<([^>]*)>)?$/);
  if (a) {
    const n2 = a[1].toLowerCase(), o2 = (a[2] || "").trim();
    let i2 = (a[3] || "").trim();
    const s = (a[4] || "").trim(), r = t.actionButtons || Bm, l = (e2) => e2.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) || "cmd", c = r.find((e2) => l(e2.name.replace(e2.emoji + " ", "")) === n2 || e2.id === n2);
    if (c) {
      e.value = "", "optional" !== i2.toLowerCase() && "" !== i2 || (i2 = "");
      const n3 = s || c.instruction;
      i2 && (t.messages.push({ sender: "You", content: i2, isPlayer: true, timestamp: gameState.time?.currentTime || Date.now(), intent: Ep(i2, t) }), t.lastMessageAt = gameState.time?.currentTime || Date.now(), Np(t));
      let a2 = null;
      if (o2) {
        if ("narrator" === o2.toLowerCase() && t.hasNarrator) return await Vm(t, n3), void saveGame(false);
        if (a2 = t.participantIds.map((e2) => gameState.employees.find((t2) => t2.id === e2)).filter(Boolean).find((e2) => e2.name.split(" ")[0].toLowerCase() === o2.toLowerCase() || e2.name.toLowerCase() === o2.toLowerCase()), a2) return await Km(t, a2, n3), void saveGame(false);
      }
      const r2 = [...gameState.groupSpeakerQueue || []];
      if (gameState.groupSpeakerQueue = [], hp(), pp(t), r2.length > 0) for (const e2 of r2) if ("__narrator__" === e2) await Vm(t, n3);
      else {
        const a3 = gameState.employees.find((t2) => t2.id === e2);
        a3 && await Km(t, a3, n3);
      }
      else if (c.forNarrator && t.hasNarrator) await Vm(t, n3);
      else if ((t.settings?.replyLimit ?? 2) > 0) {
        const e2 = fp(t, 1, i2)[0];
        e2 && await Km(t, e2, n3);
      }
      return void saveGame(false);
    }
  }
  if (n && ("/continue" === n.toLowerCase() || "/c" === n.toLowerCase())) {
    e.value = "";
    const n2 = (t.actionButtons || Bm).find((e2) => "continue" === e2.id);
    if (n2) {
      const e2 = t.participantIds.map((e3) => gameState.employees.find((t2) => t2.id === e3)).filter(Boolean);
      if (e2.length > 0 && (t.settings?.replyLimit ?? 2) > 0) {
        const a2 = e2[Math.floor(Math.random() * e2.length)];
        await Km(t, a2, n2.instruction);
      }
    }
    return;
  }
  const o = n?.match(/^\/(narrator|n)(?:\s+<([^>]*)>)?$/i);
  if (o) {
    if (e.value = "", t.hasNarrator) {
      const e2 = (o[2] || "").trim(), n2 = (t.actionButtons || Bm).find((e3) => "narrate" === e3.id), a2 = e2 || n2?.instruction || "Describe the scene.";
      await Vm(t, a2);
    } else showNotification("Narrator is not enabled for this group. Enable it in group settings.", "warning");
    return;
  }
  n && (t.messages.push({ sender: "You", content: n, isPlayer: true, timestamp: gameState.time?.currentTime || Date.now(), intent: Ep(n, t) }), t.lastMessageAt = gameState.time?.currentTime || Date.now(), e.value = "", "function" == typeof remember && "function" == typeof qs && t.participantIds.forEach((e2) => {
    const a2 = gameState.employees.find((t2) => t2.id === e2);
    if (!a2) return;
    const o2 = qs(n, a2);
    for (const e3 of o2) remember(a2, `In "${t.name}", Boss ${e3.text}`, e3.type, e3.importance);
  }), Np(t));
  let i = [...gameState.groupSpeakerQueue || []];
  if (gameState.groupSpeakerQueue = [], hp(), pp(t), 0 === i.length && n && (t.settings?.replyLimit ?? 2) > 0) {
    const e2 = t.settings?.replyLimit ?? 2;
    i = fp(t, e2, n).map((e3) => e3.id);
  }
  for (let e2 = 0; e2 < i.length; e2++) {
    const n2 = i[e2];
    if (e2 > 0 && await new Promise((e3) => setTimeout(e3, 600 + 900 * Math.random())), "__narrator__" === n2) {
      await wp(t);
      continue;
    }
    const a2 = gameState.employees.find((e3) => e3.id === n2);
    a2 && await bp(t, a2);
  }
  saveGame(false);
}
async function bp(e, t) {
  if (e && t) {
    Ap(t);
    try {
      const n = $p(e, t);
      let a = null;
      const o = e.settings?.interCharacterChat, i = e.settings?.playerAbsent;
      if (o?.enabled && !i && 100 * Math.random() < (o.targetChance || 15)) {
        const n2 = e.participantIds.filter((e2) => e2 !== t.id).map((e2) => gameState.employees.find((t2) => t2.id === e2)).filter(Boolean);
        n2.length > 0 && (a = n2[Math.floor(Math.random() * n2.length)]);
      }
      if (i) {
        const n2 = e.participantIds.filter((e2) => e2 !== t.id).map((e2) => gameState.employees.find((t2) => t2.id === e2)).filter(Boolean);
        n2.length > 0 && (a = n2[Math.floor(Math.random() * n2.length)]);
      }
      const s = Pp(e, t, n, a, Ip(e)), r = false !== gameState.settings?.enableStreamingResponses;
      let l = null, c = false, u2 = "";
      const d = $("groupMessages");
      r && d && gameState.activeGroup === e.id && (l = document.createElement("div"), l.style.cssText = "display:flex; gap:8px; align-items:flex-start; padding:8px 12px; margin:4px 0; background:rgba(15,52,96,0.4); border-radius:12px; color:var(--cu); align-self:flex-start; max-width:80%;", l.innerHTML = `<span style="color:var(--d);font-weight:600;white-space:nowrap;">${t.name.split(" ")[0]}:</span><span class="stream-text">\u258D</span>`, d.appendChild(l), d.scrollTop = d.scrollHeight);
      const p = await queuedGenerateText(s, { ...l ? { onChunk: function(e2) {
        if (!e2) return;
        c || (Lp(), c = true), u2 = e2.fullTextSoFar || u2;
        const t2 = l.querySelector(".stream-text");
        t2 && (t2.textContent = e2.fullTextSoFar + "\u258D"), d && (d.scrollTop = d.scrollHeight);
      } } : {} }, `${t.name} responding in group`);
      l && (l.remove(), l = null);
      let m = sanitizeNpcResponse(p, 5);
      if ((!m || m.startsWith("I'm having some difficulty")) && u2.trim().length > 0 && (m = sanitizeNpcResponse(u2, 5)), Lp(), e.messages.push({ sender: t.name, employeeId: t.id, content: m, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now(), targetedCharacter: a?.id || null }), e.lastMessageAt = gameState.time?.currentTime || Date.now(), "function" == typeof remember && "function" == typeof qs) {
        Es(t, m), Ls(t, m, { involves: a && a.id ? [a.id] : [] });
        const n2 = qs(m, t);
        for (const a2 of n2) remember(t, `In "${e.name}", I ${a2.text}`, a2.type, a2.importance), e.participantIds.forEach((n3) => {
          if (n3 === t.id) return;
          const o2 = gameState.employees.find((e2) => e2.id === n3);
          o2 && remember(o2, `In "${e.name}", ${t.name} ${a2.text}`, a2.type, Math.max(0.8, a2.importance - 0.3));
        });
      }
      gameState.activeGroup !== e.id && (e.unreadCount = (e.unreadCount || 0) + 1), Np(e), rp(), Nm(e, m), saveGame(false);
    } catch (e2) {
      console.error("Error generating group response:", e2), Lp(), showNotification("Failed to generate response", 2e3);
    }
  }
}
async function wp(e) {
  if (e) {
    Tp();
    try {
      const t = Sp(e, kp(e)), n = sanitizeNpcResponse(await queuedGenerateText(t, {}, "Narrator describing scene"), 8);
      Lp(), e.messages.push({ sender: "Narrator", content: n, isNarrator: true, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() }), e.lastMessageAt = gameState.time?.currentTime || Date.now(), gameState.activeGroup !== e.id && (e.unreadCount = (e.unreadCount || 0) + 1), Np(e), rp(), saveGame(false);
    } catch (e2) {
      console.error("Error generating narrator response:", e2), Lp(), showNotification("Failed to generate narration", 2e3);
    }
  }
}
function kp(e) {
  let t = "";
  e.settings?.scenarioContext && (t += `[Current Scenario/Setting]
${e.settings.scenarioContext}

`), e.pretext && (t += `[Scene Background]
${e.pretext}

`);
  const n = e.participantIds.map((e2) => gameState.employees.find((t2) => t2.id === e2)).filter(Boolean);
  t += "[Characters Present]\n", n.forEach((e2) => {
    t += `- ${e2.name} (${e2.role || "Employee"})`, e2.physicalDescription ? t += `: ${e2.physicalDescription}` : e2.appearance && (t += `: ${"string" == typeof e2.appearance ? e2.appearance : "N/A"}`), e2.personality && (t += `. Personality: ${wr(e2.personality)}`), t += "\n";
  }), t += "- The Boss (player character): The authority figure overseeing this group\n\n";
  const a = e.messages.slice(-10);
  return a.length > 0 && (t += "[Recent Conversation]\n", a.forEach((e2) => {
    if (!e2.isSystem) if (e2.isNarrator) t += `[Previous narration]: ${e2.content.substring(0, 100)}...
`;
    else {
      const n2 = e2.isPlayer ? "The Boss" : e2.sender;
      t += `${n2}: ${e2.content}
`;
    }
  })), t;
}
function Sp(e, t) {
  return `You are a third-person narrator describing events in an interactive story.

${t}

Your role:
- Describe the scene, atmosphere, and subtle details the characters might not notice
- Narrate physical actions, body language, and unspoken tension
- Add sensory details (sights, sounds, atmosphere)
- DO NOT speak for any character - only describe what is observable
- Write in third person, past tense, like a novel
- Keep narration atmospheric and engaging (2-4 sentences typically)
- Focus on recent events and current moment
- You may hint at emotions through physical cues but don't state what characters are thinking

Write a brief narration describing the current moment or recent events in this scene:`;
}
function Tp() {
  const e = $("groupMessages");
  if (!e) return;
  Lp();
  const t = document.createElement("div");
  t.id = "groupTypingIndicator", t.style.cssText = "margin:15px 0; padding:12px 20px; background:linear-gradient(135deg, rgba(199,125,255,0.1) 0%, rgba(157,78,221,0.1) 100%); border-left:3px solid var(--x); border-radius:0 12px 12px 0;", t.innerHTML = ' <div style="display:flex; align-items:center; gap:8px;"> <span style="font-size:1rem;">\u{1F4DC}</span> <span style="color:var(--x); font-weight:600; font-size:0.8rem;">Narrator</span> <div style="display:flex; gap:4px; margin-left:10px;"> <span class="typing-dot" style="width:6px; height:6px; background:var(--x); border-radius:50%; animation:typingBounce 1.4s infinite ease-in-out;"></span> <span class="typing-dot" style="width:6px; height:6px; background:var(--x); border-radius:50%; animation:typingBounce 1.4s infinite ease-in-out 0.2s;"></span> <span class="typing-dot" style="width:6px; height:6px; background:var(--x); border-radius:50%; animation:typingBounce 1.4s infinite ease-in-out 0.4s;"></span> </div> </div> ', e.appendChild(t), e.scrollTop = e.scrollHeight;
}
function $p(e, t) {
  let n = "";
  const u2 = e.settings?.playerAbsent, G2 = t.name.split(" ")[0], U2 = [];
  e.name && U2.push(`This group chat is called "${e.name}".`), e.settings?.scenarioContext && U2.push(`Current scenario/scene: ${e.settings.scenarioContext}`), e.pretext && U2.push(`Scene setting: ${e.pretext}`), e.currentTopic && !u2 && U2.push(`Current topic: ${e.currentTopic} \u2014 the Boss raised this and wants to discuss it.`), U2.length > 0 && (n += `[Why this conversation is happening]
${U2.join("\n")}

`), e.contextSummary && false !== e.settings?.includeContext && (n += `[Background context from previous conversation]
${e.contextSummary}

`);
  const a = gameState.chatHistory?.[t.id] || [];
  if (a.length > 0 && !u2) {
    const u3 = a.filter((m) => !m.isSystem && m.content && m.content.length >= 30).slice(-5);
    u3.length > 0 && (n += "[Your recent 1-on-1 history with the Boss]\n", u3.forEach((m) => {
      n += `${m.isPlayer ? "Boss" : G2}: ${((s) => {
        if (s.length <= 150) return s;
        const cut = s.slice(0, 150), end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
        if (end > 40) return cut.slice(0, end + 1);
        const sp = cut.lastIndexOf(" ");
        return (sp > 40 ? cut.slice(0, sp) : cut.slice(0, 147)) + "...";
      })(m.content)}
`;
    }), n += "\n");
  }
  const o = e.participantIds.filter((e2) => e2 !== t.id).map((e2) => gameState.employees.find((t2) => t2.id === e2)).filter(Boolean);
  o.length > 0 && (n += "[Who else is in this group chat]\n", o.forEach((e2) => {
    n += `- ${e2.name}: ${e2.role || "Employee"}`, e2.personality && (n += `. Personality: ${wr(e2.personality)}`);
    const a2 = Cp(t, e2);
    a2 && (n += `. ${a2}`), n += "\n";
  }), u2 || (n += "The Boss is the player character and your superior. They are present in this chat.\n"), n += "\n");
  const i = e.messages.slice(-15), J2 = (m) => m.isSystem ? `[System: ${m.content}]` : `${m.isPlayer ? "Boss" : m.sender}: ${m.content}`, ee2 = (prev, u3) => {
    if (!prev?.timestamp || !u3?.timestamp) return "";
    const gap = u3.timestamp - prev.timestamp;
    return gap > 72e6 ? "(the next day)\n" : gap > 108e5 ? "(hours later)\n" : "";
  };
  let te2 = -1;
  if (!u2) {
    for (let k = i.length - 1; k >= 0; k--) if (i[k].isPlayer) {
      te2 = k;
      break;
    }
  }
  if (i.length > 0) if (-1 === te2) n += "[Recent group conversation]\n", i.forEach((m, k) => {
    n += ee2(i[k - 1], m) + J2(m) + "\n";
  });
  else {
    const before = i.slice(0, te2), u3 = i[te2], after = i.slice(te2 + 1);
    before.length > 0 && (n += "[Earlier in this conversation]\n", before.forEach((m, k) => {
      n += ee2(before[k - 1], m) + J2(m) + "\n";
    }), n += "\n"), n += "[The Boss's most recent message \u2014 this is what you are responding to]\n", n += ee2(before[before.length - 1], u3), n += `Boss: ${u3.content}
`;
    const intent = u3.intent || Ep(u3.content, null);
    intent?.note && (n += `Read on the Boss's message: ${intent.note}
`), n += "\n[Replies from coworkers since then]\n", after.length > 0 ? (after.forEach((m) => {
      n += J2(m) + "\n";
    }), n += "These are other people's takes on the same message. Do not copy their tone, jokes, or targets \u2014 form your own reaction.\n") : n += "(none \u2014 you are responding first)\n";
  }
  return n;
}
function Cp(e, t) {
  const n = e.memory?.employeeOpinions?.[t.id];
  return t.memory?.employeeOpinions?.[e.id], n ? `You think of ${t.name.split(" ")[0]} as ${n}` : e.role && t.role && (e.role.toLowerCase().includes(t.role.toLowerCase().split(" ")[0]) || t.role.toLowerCase().includes(e.role.toLowerCase().split(" ")[0])) ? "Works in similar area" : null;
}
function Ep(text, group) {
  const msg = (text || "").trim();
  if (!msg) return null;
  const lower = msg.toLowerCase(), u2 = /[\u{1F300}-\u{1FAFF}☀-➿]/u.test(msg) || /\b(lol|lmao|haha|hehe)\b/i.test(lower) || /\*[^*]+\*/.test(msg), G2 = /\b(how (are|is|was) (we|you|everyone)|how'?s (it|everyone|everybody)|what'?s up|feeling (today|this))\b/i.test(lower), U2 = lower.match(/(?:wanted to (?:meet to )?talk about|let'?s (?:discuss|talk about)|here to (?:talk about|discuss)|this (?:meeting|chat) is about|need to (?:discuss|talk about))\s+(.{3,80}?)(?=[.!?,;]|$)/);
  let topic = null;
  U2 && (topic = U2[1].trim(), group && (group.currentTopic = topic));
  const J2 = /\b(unfortunately|disappoint\w*|not (good|great|acceptable|okay|happy)|slack\w*|falling behind|behind (on|schedule)|concern\w*|underperform\w*|we need to talk|problem|unacceptable|frustrat\w*)\b/i.test(lower), ee2 = /\b(anyway|anyways|back to|moving on|focus|losing the plot|lost the plot|as i was saying|let'?s get (back|serious|on track)|can we (get|talk|focus)|seriously though|enough of|knock it off|i'?m serious)\b/i.test(lower), te2 = /\b(targets?|performance|budget|deadline|review|quarter\w*|revenue|profits?|metrics|numbers|projections?|agenda|productivity|kpis?|hiring|payroll)\b/i.test(lower);
  let register, note;
  return J2 && !u2 ? (register = "reprimand", note = "The Boss is voicing criticism or disappointment. Take it seriously \u2014 joking past it would read as not listening.") : ee2 && !u2 ? (register = "redirect", note = "The Boss is steering the conversation somewhere specific and sounds done with the banter. This is a redirect, not an invitation to riff.") : !topic && !te2 || u2 ? msg.endsWith("?") && !G2 ? (register = "question", note = "The Boss asked a question and is expecting an actual answer.") : (register = "casual", note = "The Boss is being casual. Relaxed conversation is fine.") : (register = "business", note = "The Boss is raising a work matter and wants a substantive conversation about it."), group && ("casual" === register ? group.redirectStreak = 0 : "question" !== register && (group.redirectStreak = (group.redirectStreak || 0) + 1, group.redirectStreak >= 2 && (note += " The Boss has now tried more than once to bring this conversation back on track. Another joke would read as ignoring your boss."))), { register, note, topic };
}
function Ip(group) {
  if (!group || group.settings?.playerAbsent) return "";
  const u2 = group.messages || [];
  for (let i = u2.length - 1; i >= 0; i--) {
    const m = u2[i];
    if (m && m.isPlayer && !m.isSystem && m.content) return m.content;
  }
  return "";
}
function Mp(group, npc, instruction) {
  const roster = (group.participantIds || []).map((id) => gameState.employees.find((x) => x.id === id)).filter(Boolean), focus = nl(npc, instruction, roster), signal = { incoming: instruction, addressedOther: !!Ns(npc, instruction, roster) }, parts = [el(npc, { lastMessage: instruction || "" }), focus, focus ? tl() : "", Rs(npc, signal), Ds(npc), Os(npc)].map((s) => (s || "").trim()).filter(Boolean);
  return parts.length ? "\n\n" + parts.join("\n\n") : "";
}
function Pp(e, t, n, a = null, instruction = "") {
  ensureEmployeeMemory(t);
  const o = t.bioData?.bio || t.bio || "", i = wr(t.personality) || "friendly and professional", s = t.mood || "neutral", r = t.stats?.friendship || 50, l = t.stats?.trust || 50;
  let c = "professional acquaintance";
  r > 80 && l > 80 ? c = "very close friend they trust deeply" : r > 60 ? c = "friendly colleague" : r < 30 && (c = "distant coworker");
  const d = e.settings?.playerAbsent;
  let p = "";
  a && (p = `
[IMPORTANT: Direct your response to ${a.name}. You are talking TO ${a.name.split(" ")[0]}, not to the Boss. Address them by name.]`);
  let m = "";
  d && (m = "\n[SCENE NOTE: The Boss is NOT present in this scene. Do NOT address or reference the Boss. This is a conversation between employees only. Talk to the other characters in the group.]");
  const u2 = ol(), g = "open" === u2 ? '\u{1F51E} WORKPLACE CULTURE: This is an open, sex-positive workplace. Explicit content, sexual references, and adult humor are NORMAL and accepted by everyone. DO NOT act shocked, prudish, or suggest keeping things "PG" or "family-friendly". Be natural and comfortable with explicit content without moralizing.' : "professional" === u2 ? "WORKPLACE CULTURE: Maintain professional boundaries. Sexual content should be addressed tactfully with appropriate workplace discretion." : "WORKPLACE CULTURE: Relaxed office culture. Adult content is acceptable but address it naturally based on your comfort level and relationship.", f = t.name.split(" ")[0], b = d ? `- Engage with the most recent message in the conversation, in your own voice.
- React the way ${f} specifically would, given your personality and mood. You can agree, push back, ask a question, or keep it short. Real reactions, not performance.` : `- Respond to the Boss's most recent message first. The mood of the earlier conversation does not override what the Boss just said.
- Match the Boss's register. If the Boss is being serious, you may briefly acknowledge the shift, but then engage with the substance. Do not answer a serious message with a bit.
- React the way ${f} specifically would, given your personality, mood, and relationship with the Boss. You can agree, push back, feel called out, get defensive, ask a clarifying question, or keep it short. Real reactions, not performance.`;
  return `You are ${t.name}, a ${t.role || "employee"} at this company.

[Who you are]
${o ? `Bio: ${o}
` : ""}Personality: ${i}
Current mood: ${s}
${d ? "" : `Your relationship with the Boss: ${c}`}
${m}

${n}
[How to respond]
${b}
- Work is the SETTING here, not the default subject. Don't fall back to work, projects, reports, or office tasks to fill space \u2014 talk like a real person about the moment, personal life, mood, or whatever was just said. Bring work up only when it's genuinely relevant or asked about.
- Do not reuse jokes, imagery, or running gags that already appeared above.
- Keep it concise (2-4 sentences). Body language in *asterisks* only when it adds something \u2014 at most one per message.${p}

${g}${Mp(e, t, instruction)}

[Now respond as ${t.name}. Write only your message, nothing else.]`;
}
function Ap(e) {
  const t = $("groupMessages");
  if (!t) return;
  Lp();
  const n = e.profileImage || e.generatedPortrait || "", a = n && (n.startsWith("http") || n.startsWith("data:")), o = document.createElement("div");
  o.id = "groupTypingIndicator", o.style.cssText = "display:flex; align-items:center; gap:12px; padding:10px 15px; background:rgba(15,52,96,0.5); border-radius:18px; align-self:flex-start; max-width:200px;", o.innerHTML = ` <div style="width:28px; height:28px; border-radius:50%; overflow:hidden; background:var(--h); display:flex; align-items:center; justify-content:center;"> ${a ? `<img src="${n}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="font-size:1rem;">\u{1F464}</span>'} </div> <div> <div style="font-size:0.8rem; color:var(--a);">${e.name.split(" ")[0]} is typing...</div> <div style="display:flex; gap:4px; margin-top:4px;"> <span class="typing-dot" style="width:6px; height:6px; background:var(--j); border-radius:50%; animation:typingBounce 1.4s infinite ease-in-out;"></span> <span class="typing-dot" style="width:6px; height:6px; background:var(--j); border-radius:50%; animation:typingBounce 1.4s infinite ease-in-out 0.2s;"></span> <span class="typing-dot" style="width:6px; height:6px; background:var(--j); border-radius:50%; animation:typingBounce 1.4s infinite ease-in-out 0.4s;"></span> </div> </div> `, t.appendChild(o), t.scrollTop = t.scrollHeight;
}
function Lp() {
  const e = $("groupTypingIndicator");
  e && e.remove();
}
function Np(e) {
  const t = $("groupMessages");
  if (t && e) {
    if (t.innerHTML = "", e.pretext) {
      const n = document.createElement("div");
      n.className = "chat-bubble chat-bubble--memory", n.style.cssText = "margin-bottom:20px; padding:15px 18px; border-radius:12px;", n.innerHTML = ` <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;"> <span style="font-size:1.1rem;">\u{1F4D6}</span> <span style="color:var(--j); font-weight:600; font-size:0.85rem;">Scene Context</span> <button onclick="editGroupPretext()" style="margin-left:auto; background:transparent; border:none; color:var(--e); cursor:pointer; font-size:0.75rem; padding:4px 8px;" title="Edit pre-text">\u270F\uFE0F Edit</button> </div> <p style="color:var(--a); font-size:0.9rem; line-height:1.5; margin:0; font-style:italic;">${e.pretext}</p> `, t.appendChild(n);
    }
    if (0 !== e.messages.length || e.pretext) {
      if (0 === e.messages.length) {
        const e2 = document.createElement("div");
        return e2.style.cssText = "text-align:center; padding:20px; color:var(--q);", e2.innerHTML = '<p style="font-size:0.85rem;">Type a message and the group will respond \u2014 or tap a face above to choose who speaks next.</p>', void t.appendChild(e2);
      }
      e.messages.forEach((n, a) => {
        if (n.isSystem) {
          const o2 = document.createElement("div");
          if (n.imageUrl) {
            if (o2.style.cssText = "text-align:center; padding:15px; background:rgba(233,69,96,0.1); border-radius:12px; margin:15px auto; max-width:90%; border:1px solid rgba(233,69,96,0.3); position:relative;", o2.innerHTML = ` <div style="font-size:0.85rem; color:var(--k); margin-bottom:10px;">${n.content || "\u{1F3AC} Scene visualization"}</div> <div style="position:relative; display:inline-block;"> <img src="${n.imageUrl}" 
                   style="max-width:100%; max-height:400px; border-radius:10px; cursor:pointer; box-shadow:0 4px 15px var(--dv);"
                   onclick="openImageViewer('${n.imageUrl}')" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"> <div style="display:none; color:var(--e); font-size:0.8rem; padding:10px;">Image failed to load</div> </div> `, n.imagePrompt) {
              const e2 = o2.querySelector("img");
              e2 && (e2.title = n.imagePrompt);
            }
            const t2 = o2.querySelector('div[style*="position:relative"]');
            if (t2) {
              const n2 = document.createElement("button");
              n2.innerHTML = "\u{1F504}", n2.style.cssText = "position:absolute; top:8px; right:8px; background:rgba(233,69,96,0.9); border:none; border-radius:50%; width:28px; height:28px; color:var(--b); cursor:pointer; font-size:0.9rem; opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; z-index:10;", n2.title = "Regenerate image", t2.appendChild(n2), t2.addEventListener("mouseenter", () => n2.style.opacity = "1"), t2.addEventListener("mouseleave", () => n2.style.opacity = "0");
              const o3 = a;
              n2.addEventListener("click", async (t3) => {
                t3.stopPropagation(), await Rp(e.id, o3);
              });
            }
          } else o2.style.cssText = "text-align:center; padding:8px 15px; background:rgba(102,126,234,0.1); border-radius:10px; margin:10px auto; max-width:80%; font-size:0.85rem; color:var(--e);", o2.textContent = n.content;
          return void t.appendChild(o2);
        }
        if (n.isNarrator) {
          const o2 = document.createElement("div");
          o2.className = "chat-bubble chat-bubble--narrator", o2.style.cssText = "margin:15px 0; padding:15px 20px; border-radius:12px;", o2.innerHTML = ` <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;"> <span style="font-size:1rem;">\u{1F4DC}</span> <span style="color:var(--x); font-weight:600; font-size:0.8rem;">Narrator</span> <span style="font-size:0.65rem; color:rgba(199,125,255,0.5); margin-left:auto;">${n.timestamp ? ky(n.timestamp) : ""}</span> </div> <p style="color:var(--gl); font-size:0.95rem; line-height:1.6; margin:0; font-style:italic;">${xy(n.content)}</p> `;
          const i2 = document.createElement("button");
          return i2.innerHTML = "\u267B\uFE0F", i2.style.cssText = "position:absolute; top:10px; right:10px; background:rgba(199,125,255,0.8); border:none; border-radius:50%; width:22px; height:22px; color:var(--b); cursor:pointer; font-size:0.8rem; opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center;", i2.title = "Regenerate narration", o2.style.position = "relative", o2.appendChild(i2), o2.addEventListener("mouseenter", () => i2.style.opacity = "1"), o2.addEventListener("mouseleave", () => i2.style.opacity = "0"), i2.addEventListener("click", async (t2) => {
            t2.stopPropagation(), await _p(e.id, a);
          }), void t.appendChild(o2);
        }
        const o = n.isPlayer, i = o ? null : gameState.employees.find((e2) => e2.id === (n.employeeId || n.senderId)), s = document.createElement("div");
        if (s.style.cssText = "display:flex; gap:10px; align-items:flex-start; " + (o ? "flex-direction:row-reverse;" : ""), !o && i) {
          const e2 = i.profileImage || i.generatedPortrait || "", t2 = e2 && (e2.startsWith("http") || e2.startsWith("data:")), n2 = document.createElement("div");
          n2.style.cssText = "width:36px; height:36px; border-radius:50%; overflow:hidden; background:var(--h); flex-shrink:0; display:flex; align-items:center; justify-content:center;", n2.innerHTML = t2 ? `<img src="${e2}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="font-size:1.2rem;">\u{1F464}</span>', s.appendChild(n2);
        }
        const r = document.createElement("div");
        if (r.className = "chat-bubble " + (o ? "chat-bubble--self" : "chat-bubble--other"), r.style.cssText = "max-width:70%; padding:10px 15px; border-radius:18px; position:relative; " + (o ? "border-bottom-right-radius:4px;" : "border-bottom-left-radius:4px;"), !o) {
          const e2 = document.createElement("div");
          e2.style.cssText = "font-size:0.75rem; color:var(--j); font-weight:600; margin-bottom:4px;";
          let t2 = n.sender;
          if (n.targetedCharacter) {
            const e3 = gameState.employees.find((e4) => e4.id === n.targetedCharacter);
            e3 && (t2 += ` \u2192 ${e3.name.split(" ")[0]}`);
          }
          n.isDoCommand ? t2 += " \u{1F3AC}" : n.isIdleChat && (t2 += " \u{1F4AD}"), e2.textContent = t2, r.appendChild(e2);
        }
        const l = document.createElement("div");
        if (l.style.cssText = "word-wrap:break-word;", l.innerHTML = xy(n.content), r.appendChild(l), n.imageUrl) {
          const t2 = document.createElement("div");
          t2.style.cssText = "margin-top:10px; position:relative;";
          const o2 = document.createElement("img");
          o2.src = n.imageUrl, o2.style.cssText = "max-width:100%; max-height:300px; border-radius:10px; cursor:pointer; display:block;", o2.onclick = () => openImageViewer(n.imageUrl), o2.onerror = function() {
            this.style.display = "none";
          }, n.imagePrompt && (o2.title = n.imagePrompt), t2.appendChild(o2);
          const i2 = document.createElement("button");
          i2.innerHTML = "\u{1F504}", i2.style.cssText = "position:absolute; top:8px; right:8px; background:rgba(233,69,96,0.9); border:none; border-radius:50%; width:28px; height:28px; color:var(--b); cursor:pointer; font-size:0.9rem; opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; z-index:10;", i2.title = "Regenerate image", t2.appendChild(i2), t2.addEventListener("mouseenter", () => i2.style.opacity = "1"), t2.addEventListener("mouseleave", () => i2.style.opacity = "0"), i2.addEventListener("click", async (t3) => {
            t3.stopPropagation(), await Rp(e.id, a);
          }), r.appendChild(t2);
        }
        const c = document.createElement("div");
        if (c.style.cssText = "font-size:0.65rem; color:var(--dl); margin-top:4px; text-align:right;", c.textContent = n.timestamp ? ky(n.timestamp) : "", r.appendChild(c), !o && !n.isSystem) {
          const t2 = document.createElement("button");
          t2.innerHTML = "\u267B\uFE0F", t2.style.cssText = "position:absolute; top:5px; right:5px; background:rgba(33,150,243,0.8); border:none; border-radius:50%; width:22px; height:22px; color:var(--b); cursor:pointer; font-size:0.8rem; opacity:0; transition:opacity 0.2s; display:flex; align-items:center; justify-content:center;", t2.title = "Regenerate this response", r.appendChild(t2), r.addEventListener("mouseenter", () => t2.style.opacity = "1"), r.addEventListener("mouseleave", () => t2.style.opacity = "0"), t2.addEventListener("click", async (t3) => {
            t3.stopPropagation(), await _p(e.id, a);
          });
        }
        s.appendChild(r), t.appendChild(s);
      }), t.scrollTop = t.scrollHeight;
    } else t.innerHTML = ' <div style="text-align:center; padding:40px; color:var(--q);"> <div style="font-size:2rem; margin-bottom:10px; opacity:0.5;">\u{1F4AC}</div> <p>No messages yet. Start the conversation!</p> <p style="font-size:0.85rem; color:var(--q); margin-top:10px;">Type a message and the group will respond \u2014 or tap a face above to choose who speaks next.</p> </div> ';
  }
}
async function _p(e, t) {
  const n = gameState.groups?.find((t2) => t2.id === e);
  if (!n) return;
  const a = n.messages[t];
  if (!a || a.isPlayer || a.isSystem) return;
  if (a.isNarrator) {
    Tp();
    try {
      n.messages = n.messages.slice(0, t);
      const e2 = Sp(n, kp(n)), a2 = sanitizeNpcResponse(await queuedGenerateText(e2, {}, "Regenerating narration"), 8);
      Lp(), n.messages.push({ sender: "Narrator", content: a2, isNarrator: true, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() }), Np(n), saveGame(false), showNotification("Narration regenerated!", 1500);
    } catch (e2) {
      console.error("Error regenerating narration:", e2), Lp(), showNotification("Failed to regenerate", 2e3);
    }
    return;
  }
  const o = gameState.employees.find((e2) => e2.id === (a.employeeId || a.senderId));
  if (o) if (a.imageUrl) {
    Ap(o);
    try {
      const u2 = ("function" == typeof $p ? $p(n, o) : "").trim(), G2 = a.imageReqType || (a.nude ? "nude" : "casual"), desc = a.imageDesc ? ` (${a.imageDesc})` : "", e2 = `You are ${o.name}, in a group chat with your boss and colleagues.
${u2 ? u2 + "\n\n" : ""}You just sent a ${G2} photo${desc} in response to the conversation above. Write a very short message (a few words) to accompany the photo that fits naturally with what's being discussed. No quotation marks.`, i = extractText(await queuedGenerateText(e2, { max_tokens: 30 }, `Regenerating ${o.name}'s caption`)).trim() || ("explicit" === G2 ? "\u{1F608}" : "nude" === G2 ? "\u{1F648}" : "\u{1F4F8}");
      Lp(), a.content = i, a.regeneratedAt = Date.now(), Np(n), saveGame(false), showNotification("Caption regenerated!", 1500);
    } catch (e2) {
      console.error("Error regenerating caption:", e2), Lp(), showNotification("Failed to regenerate", 2e3);
    }
  } else {
    Ap(o);
    try {
      n.messages = n.messages.slice(0, t);
      const e2 = Pp(n, o, $p(n, o), null, Ip(n)), r = sanitizeNpcResponse(await queuedGenerateText(e2, {}, `Regenerating ${o.name}'s response`), 5);
      Lp(), n.messages.push({ sender: o.name, employeeId: o.id, content: r, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() }), Np(n), saveGame(false), showNotification("Message regenerated!", 1500);
    } catch (e2) {
      console.error("Error regenerating message:", e2), Lp(), showNotification("Failed to regenerate", 2e3);
    }
  }
  else showNotification("Couldn't find this message's sender to regenerate", 2e3);
}
async function Rp(e, t) {
  const n = gameState.groups?.find((t2) => t2.id === e);
  if (!n) return;
  const a = n.messages[t];
  if (!a || !a.imageUrl) return;
  const o = a.employeeId || a.senderId ? gameState.employees.find((e2) => e2.id === (a.employeeId || a.senderId)) : null;
  showNotification("\u{1F504} Regenerating image...", 2e3);
  try {
    let e2;
    if ("group-photo" === a.imageType) {
      let i = a.imagePrompt;
      if (!i) {
        const t2 = n.participantIds.map((e3) => gameState.employees.find((t3) => t3.id === e3)).filter(Boolean), a2 = t2.map((e3) => {
          const t3 = getPhysicalDescriptionForPrompt(e3);
          return `${e3.name}: ${t3}`;
        }).join("\\n"), o2 = n.settings?.scenarioContext || n.pretext || "office setting";
        i = `Group photo of ${t2.length} people together:\\n${a2}\\nScene/Setting: ${o2}\\nCasual group photo, everyone smiling, standing together.\\nCreate a cohesive group photo showing all ${t2.length} people in frame.`;
      }
      e2 = await queuedGenerateImage(applyImageStyle(i), "Regenerating group photo");
    } else if ("group-scene" === a.imageType) {
      let i = a.imagePrompt;
      i || (i = n.messages.slice(Math.max(0, t - 10), t).map((e3) => `${e3.sender || "Player"}: ${e3.content}`).join("\\n")), e2 = await queuedGenerateImage(applyImageStyle(fu(i)), "Regenerating scene visualization");
    } else if (o) {
      const n2 = a.imagePrompt || `${getPhysicalDescriptionForPrompt(o, { nude: !!a.nude })}, ${a.nude ? "nude, " : ""}${a.imageType || "selfie"} photo, selfie, looking at camera`;
      if (e2 = await queuedGenerateImage(applyImageStyle(fu(n2)), `Regenerating ${o.name}'s photo`), o.photoGallery) {
        const t2 = o.photoGallery.find((e3) => e3.url === a.imageUrl);
        t2 && (t2.url = e2, t2.regeneratedAt = Date.now());
      }
    } else {
      const t2 = a.imagePrompt || "professional photo, high quality";
      e2 = await queuedGenerateImage(applyImageStyle(t2), "Regenerating image");
    }
    e2 && "string" == typeof e2 && (e2.startsWith("http") || e2.startsWith("data:") || e2.startsWith("blob:")) ? (a.imageUrl = e2, a.regeneratedAt = Date.now(), Np(n), saveGame(false), showNotification("\u2705 Image regenerated!", 1500)) : showNotification("\u274C Failed to regenerate image", 2e3);
  } catch (e2) {
    console.error("Error regenerating group image:", e2), showNotification("\u274C Failed to regenerate image", 2e3);
  }
}
async function Dp(e) {
  const t = gameState.groups?.findIndex((t2) => t2.id === e);
  if (void 0 === t || -1 === t) return;
  const n = gameState.groups[t];
  if (await Ev(`Delete group "${n.name}"? This cannot be undone.`, "Delete Group", { type: "danger", confirmText: "Delete" })) {
    if (gameState.groups.splice(t, 1), gameState.activeGroup === e) {
      gameState.activeGroup = null;
      const e2 = $("noGroupSelected"), t2 = $("activeGroupChat");
      e2 && (e2.style.display = "flex"), t2 && (t2.style.display = "none");
    }
    rp(), saveGame(false), showNotification("Group deleted", 2e3);
  }
}
async function editGroupName() {
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!e) return;
  const t = await Iv("Enter new group name:", "Rename Group", { defaultValue: e.name });
  if (t && t.trim() && t.trim() !== e.name) {
    e.name = t.trim();
    const n = $("groupTitle");
    n && (n.textContent = e.name), rp(), saveGame(false), showNotification("Group renamed!", 1500);
  }
}
function Op() {
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!e) return;
  const t = $("groupSettingsModal"), n = $("editGroupName"), a = $("groupContextEnabled"), o = $("groupScenarioContext"), i = $("groupPretextEdit"), s = $("groupNarratorEnabled");
  n && (n.value = e.name), a && (a.checked = false !== e.settings?.includeContext), o && (o.value = e.settings?.scenarioContext || ""), i && (i.value = e.pretext || ""), s && (s.checked = e.hasNarrator || false);
  const r = $("groupReplyLimit"), l = $("groupReplyLimitVal");
  r && (r.value = e.settings?.replyLimit ?? 2, r.oninput = () => {
    l && (l.textContent = "0" === r.value ? "Manual" : r.value);
  }, r.oninput());
  const c = $("groupPlayerAbsent"), d = $("playerAbsenceExplanation");
  c && (c.checked = e.settings?.playerAbsent || false, c.onchange = () => {
    d && (d.style.display = c.checked ? "block" : "none");
  }, c.onchange());
  const p = $("groupInterCharacterChat"), m = $("interCharSettings"), u2 = $("interCharTargetChance"), g = $("interCharTargetVal"), h = e.settings?.interCharacterChat || {};
  p && (p.checked = h.enabled || false, p.onchange = () => {
    m && (m.style.opacity = p.checked ? "1" : "0.5", m.style.pointerEvents = p.checked ? "auto" : "none");
  }, p.onchange()), u2 && (u2.value = h.targetChance || 15, u2.oninput = () => {
    g && (g.textContent = u2.value + "%");
  }, u2.oninput());
  const y = $("groupIdleConversations"), f = $("idleConvSettings"), b = $("groupIdleThreshold"), v = e.settings?.idleConversations || {};
  y && (y.checked = v.enabled || false, y.onchange = () => {
    f && (f.style.opacity = y.checked ? "1" : "0.5", f.style.pointerEvents = y.checked ? "auto" : "none");
  }, y.onchange()), b && (b.value = v.threshold || 120);
  const w = $("groupAutoVisEnabled"), x = $("groupAutoVisSettings"), S = $("groupAutoVisMinFreq"), k = $("groupAutoVisMaxFreq"), T = $("groupAutoVisMinVal"), C = $("groupAutoVisMaxVal"), E = $("groupAutoVisIncludePlayer"), I = $("groupAutoVisIntensity"), M = e.settings?.autoVisualization || {};
  w && (w.checked = M.enabled || false, w.onchange = () => {
    x && (x.style.opacity = w.checked ? "1" : "0.5", x.style.pointerEvents = w.checked ? "auto" : "none");
  }, w.onchange()), S && (S.value = M.minFreq || 5, S.oninput = () => {
    T && (T.textContent = S.value);
  }, S.oninput()), k && (k.value = M.maxFreq || 12, k.oninput = () => {
    C && (C.textContent = k.value);
  }, k.oninput()), E && (E.checked = false !== M.includePlayer), I && (I.checked = M.intensityDetection || false), Fp(e), t && (t.style.display = "flex");
}
async function editGroupPretext() {
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!e) return;
  const t = await Iv("Edit Scene Pre-text:", "Edit Pre-text", { defaultValue: e.pretext || "", multiline: true, placeholder: "Enter context that shapes NPC responses..." });
  null !== t && (e.pretext = t.trim(), Np(e), saveGame(false), showNotification("Pre-text updated!", 1500));
}
function Bp() {
  const e = $("groupSettingsModal");
  e && (e.style.display = "none");
}
function Fp(e) {
  const t = $("manageParticipants");
  if (!t) return;
  const n = e.participantIds.map((e2) => gameState.employees.find((t2) => t2.id === e2)).filter(Boolean);
  t.innerHTML = n.map((e2) => {
    const t2 = e2.profileImage || e2.generatedPortrait || "";
    return ` <div style="display:flex; align-items:center; gap:8px; padding:6px 12px; background:var(--h); border-radius:20px;"> <div style="width:24px; height:24px; border-radius:50%; overflow:hidden; background:var(--f); display:flex; align-items:center; justify-content:center;"> ${t2 && (t2.startsWith("http") || t2.startsWith("data:")) ? `<img src="${t2}" style="width:100%; height:100%; object-fit:cover;">` : '<span style="font-size:0.9rem;">\u{1F464}</span>'} </div> <span style="font-size:0.85rem; color:var(--b);">${e2.name.split(" ")[0]}</span> ${n.length > 2 ? `<button onclick="removeParticipantFromGroup('${e2.id}')" style="background:transparent; border:none; color:var(--k); cursor:pointer; padding:0; font-size:0.8rem;">\u2715</button>` : ""} </div> `;
  }).join("");
}
function removeParticipantFromGroup(e) {
  const t = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!t || t.participantIds.length <= 2) return void showNotification("Group must have at least 2 participants", 2e3);
  const n = t.participantIds.indexOf(e);
  n > -1 && (t.participantIds.splice(n, 1), Fp(t), saveGame(false));
}
function jp() {
  if (!Array.isArray(gameState.groups) || 0 === gameState.groups.length) return 0;
  let e = 0;
  if (gameState.groups.forEach((t) => {
    if (!Array.isArray(t.participantIds)) return void (t.participantIds = []);
    const n = t.participantIds.length;
    t.participantIds = t.participantIds.filter((e2) => {
      const t2 = gameState.employees.find((t3) => t3.id === e2);
      return t2 && t2.hired && "active" === t2.employmentStatus;
    }), e += n - t.participantIds.length;
  }), Array.isArray(gameState.groupSpeakerQueue) && gameState.groupSpeakerQueue.length) {
    const e2 = gameState.groups.find((e3) => e3.id === gameState.activeGroup), t = e2 ? e2.participantIds : [];
    gameState.groupSpeakerQueue = gameState.groupSpeakerQueue.filter((e3) => "__narrator__" === e3 || t.includes(e3));
  }
  return e;
}
function saveGroupSettings() {
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!e) return;
  const t = $("editGroupName"), n = $("groupContextEnabled"), a = $("groupScenarioContext"), o = $("groupPretextEdit"), i = $("groupNarratorEnabled"), s = $("groupPlayerAbsent"), r = $("groupInterCharacterChat"), l = $("interCharTargetChance"), c = $("groupIdleConversations"), d = $("groupIdleThreshold");
  t && t.value.trim() && (e.name = t.value.trim()), e.settings || (e.settings = {}), e.settings.includeContext = false !== n?.checked, e.settings.scenarioContext = a?.value?.trim() || "";
  const p = $("groupReplyLimit"), u2 = parseInt(p?.value, 10);
  e.settings.replyLimit = Number.isNaN(u2) ? 2 : u2, o && (e.pretext = o.value.trim() || null), e.hasNarrator, e.hasNarrator = i?.checked || false, e.settings.playerAbsent = s?.checked || false, e.settings.interCharacterChat = { enabled: r?.checked || false, targetChance: parseInt(l?.value) || 15 }, e.settings.idleConversations = { enabled: c?.checked || false, threshold: parseInt(d?.value) || 120 };
  const m = $("groupAutoVisEnabled"), G2 = $("groupAutoVisMinFreq"), g = $("groupAutoVisMaxFreq"), h = $("groupAutoVisIncludePlayer"), y = $("groupAutoVisIntensity");
  e.settings.autoVisualization = { enabled: m?.checked || false, minFreq: parseInt(G2?.value) || 5, maxFreq: parseInt(g?.value) || 12, includePlayer: false !== h?.checked, intensityDetection: y?.checked || false }, e.settings.autoVisualization.enabled && !e.autoVisTracker && (e.autoVisTracker = { messagesSinceLastVis: 0, nextTriggerAt: Rm(e.settings.autoVisualization.minFreq, e.settings.autoVisualization.maxFreq), totalVisualizations: 0 });
  const f = $("groupTitle");
  f && (f.textContent = e.name), rp(), Np(e), pp(e), Bp(), saveGame(false), showNotification("Settings saved!", 1500);
}
async function regenerateGroupPretextFromSettings() {
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!e) return;
  const t = $("groupPretextEdit"), n = $("regeneratePretext");
  if (!t) return;
  const a = e.messages.slice(-25).filter((e2) => !e2.isSystem);
  if (a.length < 3) showNotification("Need more conversation to generate pre-text", 2e3);
  else {
    n && (n.disabled = true, n.innerHTML = "\u23F3 Generating...");
    try {
      const n2 = e.participantIds.map((e2) => gameState.employees.find((t2) => t2.id === e2)?.name).filter(Boolean), o = a.map((e2) => `${e2.isPlayer ? "You (the boss)" : gameState.employees.find((t2) => t2.id === e2.senderId)?.name || "Unknown"}: ${e2.content}`).join("\n"), i = `You are creating a vivid "Pre-text" scene summary for a group chat.

This pre-text will set the scene and provide narrative context displayed at the top of the conversation.

Group participants: ${n2.join(", ")}

Recent conversation:
${o}

Write an engaging pre-text (3-5 sentences) that:
- Describes the setting/scene (where, when, atmosphere)
- Captures the emotional tone and dynamic
- Sets up context for the conversation

Write in present tense, third person perspective. Be evocative and specific.

Pre-text:`, s = (await queuedGenerateText(i, {}, "Regenerating pre-text")).trim().replace(/^["']|["']$/g, "");
      t.value = s, showNotification("Pre-text regenerated!", 2e3);
    } catch (e2) {
      console.error("Failed to regenerate pretext:", e2), showNotification("Failed to generate pre-text", 2e3);
    } finally {
      n && (n.disabled = false, n.innerHTML = "\u{1F504} Regenerate with AI");
    }
  }
}
async function qp() {
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!e) return;
  const t = $("groupScenarioContext"), n = $("autoGenerateGroupContext");
  if (!t) return;
  const a = e.messages.slice(-20).filter((e2) => !e2.isSystem);
  if (a.length < 3) showNotification("Need more conversation to generate context", 2e3);
  else {
    n && (n.disabled = true, n.innerHTML = "\u23F3 Generating...");
    try {
      const n2 = e.participantIds.map((e2) => gameState.employees.find((t2) => t2.id === e2)?.name).filter(Boolean), o = a.map((e2) => `${e2.sender}: ${e2.content}`).join("\n"), i = `Analyze this group chat conversation and create a brief, vivid scenario context description (2-3 sentences max). 
Describe: Where they seem to be, what's happening, the mood/atmosphere, and any implicit situation.
Write in present tense, as if setting a scene.

Participants: ${n2.join(", ")}
Group name: ${e.name}

Recent conversation:
${o}

Scenario context (2-3 sentences, vivid and specific):`, s = (await queuedGenerateText(i, {}, "Generating scenario context")).trim().replace(/^["']|["']$/g, "");
      t.value = s, showNotification("\u2728 Context generated!", 1500);
    } catch (e2) {
      console.error("Error generating context:", e2), showNotification("Failed to generate context", 2e3);
    } finally {
      n && (n.disabled = false, n.innerHTML = "\u2728 Auto-Generate from Chat");
    }
  }
}
function zp() {
  const e = $("groupScenarioContext");
  e && (e.value = "", showNotification("Context cleared", 1e3));
}
async function Gp() {
  const e = gameState.activeChatEmployee;
  if (!e) return;
  const t = gameState.employees.find((t2) => t2.id === e), n = gameState.chatHistory?.[e] || [], a = $("chatScenarioContext"), o = $("autoGenerateChatContext");
  if (!a || !t) return;
  const i = n.slice(-15).filter((e2) => !e2.isSystem && e2.content);
  if (i.length < 3) showNotification("Need more conversation to generate context", 2e3);
  else {
    o && (o.disabled = true, o.innerHTML = "\u23F3...");
    try {
      const e2 = i.map((e3) => `${e3.isPlayer ? "You" : t.name}: ${e3.content}`).join("\n"), n2 = `Analyze this 1-on-1 chat conversation and create a brief scenario context (1-2 sentences).
Describe: Where they seem to be, what's happening between them, and the current dynamic/mood.
Write in present tense, intimate/personal tone.

Person: ${t.name} (${t.role || "Employee"})
Personality: ${t.personality || "unknown"}

Recent conversation:
${e2}

Scenario context (1-2 sentences, specific and evocative):`, o2 = (await queuedGenerateText(n2, {}, "Generating chat context")).trim().replace(/^["']|["']$/g, "");
      a.value = o2, t.chatSettings || (t.chatSettings = {}), t.chatSettings.scenarioContext = o2, saveGame(false), showNotification("\u2728 Context generated!", 1500);
    } catch (e2) {
      console.error("Error generating context:", e2), showNotification("Failed to generate context", 2e3);
    } finally {
      o && (o.disabled = false, o.innerHTML = "\u2728 Auto-Generate");
    }
  }
}
function Hp() {
  const e = gameState.activeChatEmployee, t = gameState.employees.find((t2) => t2.id === e), n = $("chatScenarioContext");
  n && (n.value = ""), t && (t.chatSettings || (t.chatSettings = {}), t.chatSettings.scenarioContext = "", saveGame(false)), showNotification("Context cleared", 1e3);
}
function Yp() {
  const e = gameState.activeChatEmployee, t = gameState.employees.find((t2) => t2.id === e), n = $("chatScenarioContext");
  if (!t || !n) return;
  t.chatSettings || (t.chatSettings = {}), t.chatSettings.scenarioContext = n.value.trim();
  const a = $("chatStatus");
  a && (t.chatSettings.scenarioContext ? (a.innerHTML = '<span style="color:var(--j);">\u{1F4CD} Scene Active</span>', a.title = t.chatSettings.scenarioContext) : t.npcStatus ? (a.innerHTML = va(t), a.title = t.npcStatus.richLabel || t.npcStatus.label) : (a.textContent = "Online", a.title = "")), saveGame(false);
}
function Wp() {
  rp(), gameState.activeGroup ? lp(gameState.activeGroup) : mg(false), gg();
}
function Vp() {
  const e = $("groupAttachmentMenu");
  if (!e) return;
  const t = "block" === e.style.display;
  e.style.display = t ? "none" : "block";
}
function Kp() {
  const e = $("groupAttachmentMenu");
  e && (e.style.display = "none");
}
function openGroupTargetSelector(e, t = false) {
  const n = $("groupTargetSelectorModal"), a = $("targetSelectorGrid"), o = $("targetSelectorTitle"), i = $("targetSelectorSubtitle"), s = $("confirmTargetSelection");
  if (!n || !a) return;
  const r = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!r) return;
  window.groupActionState.actionType = e, window.groupActionState.multiSelect = t, window.groupActionState.selectedTargets = [];
  const l = { money: { title: "\u{1F4B0} Send Money To", subtitle: "Select who to send money to", color: "var(--n)" }, gift: { title: "\u{1F381} Give Gift To", subtitle: "Select who to give the gift to", color: "var(--v)" }, image: { title: "\u{1F4F7} Request Image From", subtitle: "Select who to request an image from", color: "var(--u)" }, post: { title: "\u{1F4F1} Request Post From", subtitle: "Select who to request a social post from", color: "var(--cf)" }, groupPhoto: { title: "\u{1F465} Group Photo Participants", subtitle: "Select who should be in the photo", color: "var(--x)" } }[e] || { title: "\u{1F464} Select Target", subtitle: "Choose a recipient", color: "var(--j)" };
  o.textContent = l.title, o.style.color = l.color, i.textContent = l.subtitle + (t ? " (multiple allowed)" : ""), a.innerHTML = "", r.participantIds.forEach((e2) => {
    const t2 = gameState.employees.find((t3) => t3.id === e2);
    if (!t2) return;
    const n2 = document.createElement("div");
    n2.className = "target-selector-item", n2.dataset.empId = e2, n2.style.cssText = "\n        display: flex; align-items: center; gap: 12px; padding: 12px 15px;\n        background: var(--i); border-radius: 10px; cursor: pointer;\n        border: 2px solid transparent; transition: all 0.2s;\n      ";
    const o2 = t2.profileImage || t2.generatedPortrait || "";
    n2.innerHTML = ` <div style="width:45px; height:45px; border-radius:50%; background:${o2 ? `url('${o2}') center/cover` : "var(--t)"}; display:flex; justify-content:center; align-items:center; font-size:1.5rem; flex-shrink:0;">
          ${o2 ? "" : "\u{1F464}"} </div> <div style="flex:1; min-width:0;"> <div style="font-weight:600; color:var(--b); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t2.name}</div> <div style="font-size:0.8rem; color:var(--e);">${t2.role || "Employee"}</div> </div> <div class="target-check" style="width:24px; height:24px; border-radius:50%; border:2px solid var(--o); display:flex; justify-content:center; align-items:center; color:transparent; font-size:0.9rem;">\u2713</div> `, n2.onclick = () => Jp(n2, e2, l.color), a.appendChild(n2);
  }), s.onclick = () => Qp(e), n.style.display = "flex";
}
function Jp(e, t, n) {
  const a = window.groupActionState, o = e.querySelector(".target-check");
  if (a.multiSelect) {
    const i = a.selectedTargets.indexOf(t);
    i > -1 ? (a.selectedTargets.splice(i, 1), e.style.borderColor = "transparent", e.style.background = "var(--ae)", o.style.color = "transparent", o.style.background = "transparent", o.style.borderColor = "var(--ag)") : (a.selectedTargets.push(t), e.style.borderColor = n, e.style.background = "rgba(102,126,234,0.1)", o.style.color = "var(--b)", o.style.background = n, o.style.borderColor = n);
  } else document.querySelectorAll(".target-selector-item").forEach((e2) => {
    const t2 = e2.querySelector(".target-check");
    e2.style.borderColor = "transparent", e2.style.background = "var(--ae)", t2.style.color = "transparent", t2.style.background = "transparent", t2.style.borderColor = "var(--ag)";
  }), a.selectedTargets = [t], e.style.borderColor = n, e.style.background = "rgba(102,126,234,0.1)", o.style.color = "var(--b)", o.style.background = n, o.style.borderColor = n;
}
function closeGroupTargetSelector() {
  const e = $("groupTargetSelectorModal");
  e && (e.style.display = "none");
}
function Qp(e) {
  const t = window.groupActionState.selectedTargets;
  if (0 !== t.length) switch (closeGroupTargetSelector(), e) {
    case "money":
      rm(t);
      break;
    case "gift":
      hm(t);
      break;
    case "image":
      xm(t);
      break;
    case "post":
      Em(t);
      break;
    case "groupPhoto":
      Tm(t);
  }
  else showNotification("Please select at least one person", 2e3);
}
function Xp() {
  const e = $("groupTargetSelectorModal"), t = $("targetSelectorGrid"), n = $("targetSelectorTitle"), a = $("targetSelectorSubtitle"), o = $("confirmTargetSelection");
  if (!e || !t) return;
  const i = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!i) return;
  const s = Ju - i.participantIds.length;
  if (s <= 0) return void showNotification(`Groups are capped at ${Ju} participants`, 2500);
  const r = gameState.employees.filter((e2) => e2.hired && "active" === e2.employmentStatus && !i.participantIds.includes(e2.id));
  window.groupActionState.actionType = "add-participant", window.groupActionState.multiSelect = true, window.groupActionState.selectedTargets = [];
  const l = "var(--j)";
  n && (n.textContent = "\u2795 Add Participants", n.style.color = l), a && (a.textContent = `Up to ${s} more (active employees not already here)`), t.innerHTML = "", 0 === r.length ? t.innerHTML = '<div style="text-align:center; padding:30px; color:var(--e);">No other active employees available to add.</div>' : r.forEach((e2) => {
    const n2 = document.createElement("div");
    n2.className = "target-selector-item", n2.dataset.empId = e2.id, n2.style.cssText = "\n          display: flex; align-items: center; gap: 12px; padding: 12px 15px;\n          background: var(--i); border-radius: 10px; cursor: pointer;\n          border: 2px solid transparent; transition: all 0.2s;\n        ";
    const a2 = e2.profileImage || e2.generatedPortrait || "";
    n2.innerHTML = ` <div style="width:45px; height:45px; border-radius:50%; background:${a2 ? `url('${a2}') center/cover` : "var(--t)"}; display:flex; justify-content:center; align-items:center; font-size:1.5rem; flex-shrink:0;">
            ${a2 ? "" : "\u{1F464}"} </div> <div style="flex:1; min-width:0;"> <div style="font-weight:600; color:var(--b); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e2.name}</div> <div style="font-size:0.8rem; color:var(--e);">${e2.role || "Employee"}</div> </div> <div class="target-check" style="width:24px; height:24px; border-radius:50%; border:2px solid var(--o); display:flex; justify-content:center; align-items:center; color:transparent; font-size:0.9rem;">\u2713</div> `, n2.onclick = () => Jp(n2, e2.id, l), t.appendChild(n2);
  }), o && (o.onclick = () => Zp()), e.style.display = "flex";
}
function Zp() {
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!e) return;
  const t = [...window.groupActionState.selectedTargets || []];
  if (0 === t.length) return void showNotification("Select at least one person to add", 2e3);
  const n = Ju - e.participantIds.length, a = t.filter((t2) => !e.participantIds.includes(t2)).slice(0, n);
  if (0 === a.length) return void showNotification(`Groups are capped at ${Ju} participants`, 2500);
  e.participantIds.push(...a);
  const o = a.map((e2) => gameState.employees.find((t2) => t2.id === e2)?.name.split(" ")[0]).filter(Boolean).join(", ");
  e.messages.push({ sender: "system", content: `\u2795 ${o} ${a.length > 1 ? "were" : "was"} added to the group.`, isSystem: true, timestamp: gameState.time?.currentTime || Date.now() }), closeGroupTargetSelector(), Fp(e), pp(e), dp(e), Np(e), rp(), saveGame(false), t.length > a.length ? showNotification(`Added ${a.length}; group is now full (${Ju} max)`, 2500) : showNotification(`Added ${a.length} participant${a.length > 1 ? "s" : ""}`, 1500);
}
function tm(e) {
  const t = e.messages || [], n = { total: 0, player: 0, npc: 0, narrator: 0, images: 0, moneySent: 0, perParticipant: {}, firstAt: null, lastAt: null };
  return t.forEach((e2) => {
    e2.imageUrl && n.images++, e2.isSystem ? "money-sent" === e2.systemType && "number" == typeof e2.amount && (n.moneySent += e2.amount) : (n.total++, e2.timestamp && (n.firstAt || (n.firstAt = e2.timestamp), n.lastAt = e2.timestamp), e2.isPlayer ? n.player++ : e2.isNarrator ? n.narrator++ : (n.npc++, e2.employeeId && (n.perParticipant[e2.employeeId] = (n.perParticipant[e2.employeeId] || 0) + 1)));
  }), n;
}
function closeGroupRecap() {
  const e = $("groupRecapModal");
  e && (e.style.display = "none");
}
function openGroupRecap() {
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup), t = $("groupRecapModal"), n = $("groupRecapBody");
  if (!e || !t || !n) return;
  const a = tm(e), o = Object.entries(a.perParticipant).map(([e2, t2]) => ({ name: gameState.employees.find((t3) => t3.id === e2)?.name?.split(" ")[0] || "Unknown", count: t2 })).sort((e2, t2) => t2.count - e2.count), i = (e2, t2, n2) => `<div style="flex:1; min-width:90px; background:var(--i); border-radius:10px; padding:12px; text-align:center;"> <div style="font-size:1.4rem; font-weight:700; color:${n2};">${t2}</div> <div style="font-size:0.72rem; color:var(--e); margin-top:2px;">${e2}</div> </div>`, s = o.length ? o.map((e2) => `<div style="display:flex; justify-content:space-between; padding:5px 0; font-size:0.85rem; color:var(--ao);"><span>${e2.name}</span><span style="color:var(--g);">${e2.count} msg${1 !== e2.count ? "s" : ""}</span></div>`).join("") : '<div style="color:var(--e); font-size:0.85rem;">No one has spoken yet.</div>';
  n.innerHTML = ` <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px;"> ${i("Messages", a.total, "var(--j)")}
        ${i("Participants", e.participantIds.length, "var(--x)")}
        ${i("Images", a.images, "var(--u)")}
        ${i("Money sent", "$" + xu(a.moneySent), "var(--n)")} </div> <div style="margin-bottom:18px;"> <div style="color:var(--e); font-size:0.8rem; font-weight:600; margin-bottom:6px;">WHO TALKED MOST</div> ${s} </div> <div> <div style="color:var(--e); font-size:0.8rem; font-weight:600; margin-bottom:8px;">AI SUMMARY</div> <div id="groupRecapSummary" style="color:var(--ao); font-size:0.9rem; line-height:1.5; font-style:italic; background:rgba(102,126,234,0.08); border:1px solid rgba(102,126,234,0.2); border-radius:10px; padding:14px; min-height:40px;"> ${e.lastSummary ? e.lastSummary : '<span style="color:var(--e);">No summary yet.</span>'} </div> <button id="generateGroupSummaryBtn" onclick="generateGroupMeetingSummary()" style="margin-top:10px; width:100%; padding:11px; background:linear-gradient(135deg, var(--j) 0%, var(--ak) 100%); border:none; border-radius:8px; color:var(--s); cursor:pointer; font-weight:600;">\u2728 ${e.lastSummary ? "Regenerate" : "Generate"} AI Summary</button> </div> `, t.style.display = "flex";
}
async function generateGroupMeetingSummary() {
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!e) return;
  const t = $("generateGroupSummaryBtn"), n = $("groupRecapSummary"), a = (e.messages || []).filter((e2) => !e2.isSystem && e2.content).slice(-40).map((e2) => `${e2.isPlayer ? "Boss" : e2.isNarrator ? "Narrator" : e2.sender}: ${e2.content}`).join("\n");
  if (!a.trim()) return void showNotification("Nothing to summarize yet", 2e3);
  t && (t.disabled = true, t.textContent = "\u23F3 Summarizing..."), n && (n.innerHTML = '<span style="color:var(--e);">Generating summary...</span>');
  const o = `Summarize this group meeting/conversation in 2-4 concise sentences. Focus on what actually happened: key topics, decisions, notable interactions or tension, and the overall mood. Do not invent events that aren't shown. Participants: ${e.participantIds.map((e2) => gameState.employees.find((t2) => t2.id === e2)?.name).filter(Boolean).join(", ")}.

Conversation:
${a}

Summary:`;
  try {
    const t2 = (await queuedGenerateText(o, {}, `Summary for group "${e.name}"`) || "").trim();
    e.lastSummary = t2, e.lastSummaryAt = gameState.time?.currentTime || Date.now(), n && (n.textContent = t2 || "Could not generate a summary."), saveGame(false);
  } catch (e2) {
    console.error("Group summary error:", e2), n && (n.innerHTML = '<span style="color:var(--k);">Failed to generate summary. Try again.</span>');
  } finally {
    t && (t.disabled = false, t.textContent = e.lastSummary ? "\u2728 Regenerate AI Summary" : "\u2728 Generate AI Summary");
  }
}
function om(e, t = "var(--j)") {
  const n = gameState.employees.find((t2) => t2.id === e);
  if (!n) return null;
  const a = document.createElement("div");
  a.className = "recipient-chip", a.dataset.empId = e, a.style.cssText = `
      display: flex; align-items: center; gap: 8px; padding: 6px 12px;
      background: rgba(${"var(--n)" === t ? "78,204,163" : "var(--v)" === t ? "255,107,157" : "var(--u)" === t ? "0,212,255" : "102,126,234"},0.2);
      border: 1px solid ${t}; border-radius: 20px; font-size: 0.85rem;
    `;
  const o = n.profileImage || n.generatedPortrait || "";
  return a.innerHTML = ` <div style="width:24px; height:24px; border-radius:50%; background:${o ? `url('${o}') center/cover` : "var(--t)"}; display:flex; justify-content:center; align-items:center; font-size:0.8rem;">
        ${o ? "" : "\u{1F464}"} </div> <span style="color:${t};">${n.name}</span> <button onclick="removeRecipientChip(this, '${e}')" style="background:transparent; border:none; color:var(--k); cursor:pointer; font-size:1rem; padding:0; margin-left:4px;">\xD7</button> `, a;
}
function removeRecipientChip(e, t) {
  const n = e.closest(".recipient-chip");
  n && n.remove();
  const a = window.groupActionState.selectedTargets.indexOf(t);
  a > -1 && window.groupActionState.selectedTargets.splice(a, 1);
}
function im() {
  Kp();
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!e) return;
  window.groupActionState.selectedTargets = [];
  const t = gameState.cash || 0;
  $("groupSendMoneyBalance").textContent = "$" + xu(t);
  const n = Math.max(100, Math.floor(0.01 * t)), a = Math.max(1e3, Math.floor(0.05 * t)), o = Math.max(1e4, Math.floor(0.1 * t));
  $("groupMoneySmall").textContent = "$" + xu(n), $("groupMoneyMedium").textContent = "$" + xu(a), $("groupMoneyLarge").textContent = "$" + xu(o), $("groupCustomMoneyAmount").value = "", $("groupMoneyMessage").value = "", $("groupMoneyRecipients").innerHTML = '<span style="color:var(--e); font-size:0.85rem;">No recipient selected</span>', $("groupSendMoneyModal").style.display = "flex";
}
function closeGroupSendMoneyModal() {
  $("groupSendMoneyModal").style.display = "none";
}
function rm(e) {
  const t = $("groupMoneyRecipients");
  t.innerHTML = "", e.forEach((e2) => {
    const n = om(e2, "var(--n)");
    n && t.appendChild(n);
  });
}
async function confirmGroupSendMoney() {
  const e = window.groupActionState.selectedTargets, t = parseInt($("groupCustomMoneyAmount").value) || 0, n = $("groupMoneyMessage").value.trim(), a = gameState.cash || 0;
  if (0 === e.length) return void showNotification("Please select a recipient", 2e3);
  if (t <= 0) return void showNotification("Please enter a valid amount", 2e3);
  const o = t * e.length;
  if (o > a) return void showNotification("Insufficient funds!", 2e3);
  closeGroupSendMoneyModal();
  const i = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (i) {
    for (const a2 of e) {
      const e2 = gameState.employees.find((e3) => e3.id === a2);
      if (!e2) continue;
      gameState.cash -= t, e2.receivedMoney || (e2.receivedMoney = 0), e2.receivedMoney += t;
      const o2 = n ? `\u{1F4B0} You sent $${xu(t)} to ${e2.name}: "${n}"` : `\u{1F4B0} You sent $${xu(t)} to ${e2.name}`;
      i.messages.push({ id: Date.now() + Math.random(), senderId: "system", content: o2, timestamp: Date.now(), isSystem: true, systemType: "money-sent", amount: t }), await cm(i, e2, t, n);
    }
    Np(i), saveGame(false), updateUI(), showNotification(`\u{1F4B0} Sent $${xu(o)} to ${e.length} ${1 === e.length ? "person" : "people"}!`, 2e3);
  }
}
function lm(e) {
  return e ? yd(e) : 0;
}
async function cm(e, t, n, a) {
  const o = lm(t), i = t.personality || {}, s = `You are ${t.name}, a ${t.role || "employee"}. You're in a group chat with colleagues and your boss just sent you $${xu(n)}${a ? ` with the message: "${a}"` : ""}.

Your personality: ${JSON.stringify(i)}
Relationship with boss: ${o}/100

Write a SHORT reaction message (1-2 sentences) expressing your feelings about receiving this money IN FRONT of your colleagues. Consider:
- How does the amount feel to you?
- Are you grateful, surprised, embarrassed, suspicious?
- How do you react knowing others in the group can see this?

Just write your response, no quotes or labels:`;
  try {
    const n2 = await queuedGenerateText(s, { max_tokens: 100 }, `${t.name}'s money reaction`);
    e.messages.push({ id: Date.now() + Math.random(), senderId: t.id, content: extractText(n2).trim(), timestamp: Date.now() + 100, isSystem: false });
  } catch (e2) {
    console.error("Failed to generate money reaction:", e2);
  }
}
function gm() {
  Kp();
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!e) return;
  window.groupActionState.selectedTargets = [], window.groupActionState.selectedGift = null, $("groupGiftRecipients").innerHTML = '<span style="color:var(--e); font-size:0.85rem;">No recipient selected</span>', $("groupGiftMessage").value = "", ym();
  const t = $("confirmGroupGift");
  t.disabled = true, t.style.opacity = "0.5", $("groupGiftModal").style.display = "flex";
}
function closeGroupGiftModal() {
  $("groupGiftModal").style.display = "none";
}
function hm(e) {
  const t = $("groupGiftRecipients");
  t.innerHTML = "", e.forEach((e2) => {
    const n = om(e2, "var(--v)");
    n && t.appendChild(n);
  }), vm();
}
function ym() {
  const e = $("groupGiftSelectionGrid"), t = gameState.giftInventory || [];
  e.innerHTML = "", 0 !== t.length ? t.forEach((t2, n) => {
    const a = document.createElement("div");
    a.className = "group-gift-option", a.dataset.index = n, a.style.cssText = "\n        padding: 15px; background: var(--h); border: 2px solid transparent;\n        border-radius: 10px; cursor: pointer; transition: all 0.2s; text-align: center;\n      ", a.innerHTML = ` <div style="font-size:2.5rem; margin-bottom:8px;">${t2.emoji || "\u{1F381}"}</div> <div style="font-weight:600; color:var(--b); margin-bottom:4px; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t2.name}</div> <div style="font-size:0.75rem; color:var(--g);">Qty: ${t2.quantity || 1}</div> `, a.onclick = () => fm(a, n), e.appendChild(a);
  }) : e.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:30px; color:var(--e);"><div style="font-size:3rem; margin-bottom:10px;">\u{1F381}</div><p>No gifts in inventory</p><p style="font-size:0.85rem;">Visit the Gifts tab to purchase some!</p></div>';
}
function fm(e, t) {
  document.querySelectorAll(".group-gift-option").forEach((e2) => {
    e2.style.borderColor = "transparent", e2.style.background = "var(--w)";
  }), e.style.borderColor = "var(--v)", e.style.background = "rgba(255,107,157,0.1)", window.groupActionState.selectedGift = t, vm();
}
function vm() {
  const e = $("confirmGroupGift"), t = window.groupActionState.selectedTargets.length > 0, n = null !== window.groupActionState.selectedGift;
  e.disabled = !(t && n), e.style.opacity = t && n ? "1" : "0.5";
}
async function confirmGroupGift() {
  const e = window.groupActionState.selectedTargets, t = window.groupActionState.selectedGift, n = $("groupGiftMessage").value.trim();
  if (0 === e.length || null === t) return;
  const a = gameState.giftInventory[t];
  if (!a || (a.quantity || 1) < e.length) return void showNotification("Not enough gifts in inventory!", 2e3);
  closeGroupGiftModal();
  const o = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (o) {
    for (const i of e) {
      const e2 = gameState.employees.find((e3) => e3.id === i);
      if (!e2) continue;
      a.quantity = (a.quantity || 1) - 1, a.quantity <= 0 && gameState.giftInventory.splice(t, 1), e2.receivedGifts || (e2.receivedGifts = []), e2.receivedGifts.push({ ...a, from: "player", timestamp: Date.now() });
      const s = n ? `\u{1F381} You gave ${e2.name} a ${a.emoji} ${a.name}: "${n}"` : `\u{1F381} You gave ${e2.name} a ${a.emoji} ${a.name}`;
      o.messages.push({ id: Date.now() + Math.random(), senderId: "system", content: s, timestamp: Date.now(), isSystem: true, systemType: "gift-sent" }), await bm(o, e2, a, n);
    }
    Np(o), saveGame(false), showNotification(`\u{1F381} Gave ${a.emoji} ${a.name} to ${e.length} ${1 === e.length ? "person" : "people"}!`, 2e3);
  }
}
async function bm(e, t, n, a) {
  const o = lm(t), i = t.giftPreferences || { loves: [], hates: [] }, s = n.category || "general", r = i.loves?.includes(s), l = i.hates?.includes(s), c = `You are ${t.name}. In a group chat, your boss just gave you a gift: ${n.emoji} ${n.name}${a ? ` with the message: "${a}"` : ""}.

Your reaction to this type of gift: ${r ? "You LOVE this kind of gift!" : l ? "You actually DISLIKE this kind of gift..." : "You feel neutral about this type of gift."}
Relationship with boss: ${o}/100

Write a SHORT reaction (1-2 sentences) that others in the group will see. Be authentic to whether you liked it or not.

Response:`;
  try {
    const n2 = await queuedGenerateText(c, { max_tokens: 100 }, `${t.name}'s gift reaction`);
    e.messages.push({ id: Date.now() + Math.random(), senderId: t.id, content: extractText(n2).trim(), timestamp: Date.now() + 100, isSystem: false });
  } catch (e2) {
    console.error("Failed to generate gift reaction:", e2);
  }
}
function wm() {
  Kp(), window.groupActionState.selectedTargets = [], $("groupImageRequestTarget").innerHTML = '<span style="color:var(--e); font-size:0.85rem;">No person selected</span>', $("groupImageRequestPrompt").value = "", $("groupImageCustomRequest").style.display = "none", $("groupImageCustomBtn").textContent = "\u270F\uFE0F Custom Request", $("groupRequestImageModal").style.display = "flex";
}
function closeGroupRequestImageModal() {
  $("groupRequestImageModal").style.display = "none";
}
function xm(e) {
  const t = $("groupImageRequestTarget");
  t.innerHTML = "", e.forEach((e2) => {
    const n = om(e2, "var(--u)");
    n && t.appendChild(n);
  });
}
function toggleGroupImageCustomRequest() {
  const e = $("groupImageCustomRequest"), t = $("groupImageCustomBtn");
  "none" === e.style.display ? (e.style.display = "block", t.textContent = "\u2B06\uFE0F Use Presets") : (e.style.display = "none", t.textContent = "\u270F\uFE0F Custom Request");
}
async function sendGroupImageRequest(e, t = null) {
  const n = window.groupActionState.selectedTargets;
  if (0 === n.length) return void showNotification("Please select who to request from", 2e3);
  if (Ue()) {
    if (["lewd", "nude", "explicit"].includes(e)) return void showNotification("\u{1F6E1}\uFE0F SFW Mode is enabled - NSFW image requests are blocked", "warning");
    if (t && /\b(nude|naked|lewd|sexy|explicit|sexual|nsfw|topless|underwear|lingerie|masturbat|dildo|toy|vibrator|orgasm)\b/i.test(t)) return void showNotification("\u{1F6E1}\uFE0F SFW Mode is enabled - NSFW content requests are blocked", "warning");
  }
  closeGroupRequestImageModal();
  const a = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!a) return;
  const o = n[0], i = gameState.employees.find((e2) => e2.id === o);
  if (!i) return;
  const s = t ? `@${i.name}, ${t}` : `@${i.name}, send me a ${e} selfie`;
  a.messages.push({ id: Date.now(), senderId: "player", content: s, timestamp: Date.now(), isPlayer: true }), Np(a), showNotification(`\u{1F4F7} Requesting image from ${i.name}...`, 2e3), await km(a, i, e, t);
}
async function km(e, t, n, a) {
  const userDesc = a, o = lm(t);
  if (console.log(`[Group Image] Request from ${t.name} | type: ${n} | relationship: ${o}/100 | userDesc: ${a || "(none)"}`), !(["nude", "explicit", "lewd"].includes(n) ? o >= 40 : o >= 20)) {
    console.log(`[Group Image] \u274C Refused by ${t.name} \u2014 relationship ${o} below threshold`);
    const a2 = `You are ${t.name}. Your boss asked you to send a ${n} image in a group chat. Your relationship: ${o}/100. 
      
You're going to refuse because you're not comfortable enough. Write a short refusal (1-2 sentences) that the whole group will see.`;
    try {
      const n2 = await queuedGenerateText(a2, { max_tokens: 100 }, `${t.name}'s refusal`);
      e.messages.push({ id: Date.now() + Math.random(), senderId: t.id, content: extractText(n2).trim(), timestamp: Date.now(), isSystem: false }), Np(e), saveGame(false);
    } catch (e2) {
      console.error("Failed to generate refusal:", e2);
    }
    return;
  }
  const u2 = (e.messages || []).slice(-10).map((m) => {
    const who = m.isPlayer ? "Boss" : gameState.employees.find((x) => x.id === m.senderId)?.name || (m.senderId === t.id ? t.name : "Colleague");
    return m.content ? `${who}: ${m.content}` : "";
  }).filter(Boolean).join("\n"), G2 = (e.settings?.scenarioContext || e.pretext || "").replace(/\s+/g, " ").trim().slice(0, 200), r = await mf({ employee: t, type: n, customRequest: userDesc, recentHistory: u2, sceneContext: G2, mode: "group", previousState: yf(e.messages) });
  console.log(`[Group Image] \u{1F3A8} Refined image prompt (${r.length} chars): ${r}`);
  try {
    const a2 = document.createElement("div");
    a2.style.cssText = "text-align:center; padding:15px; color:var(--a); font-style:italic;", a2.textContent = `\u{1F4F7} ${t.name} is taking a photo...`;
    const o2 = $("groupMessagesContainer");
    o2 && (o2.appendChild(a2), o2.scrollTop = o2.scrollHeight);
    const styled = applyImageStyle(fu(r));
    console.log(`[Group Image] \u{1F680} Final prompt to engine (${styled.prompt.length} chars): ${styled.prompt}`);
    const s = await queuedGenerateImage(styled, `${t.name}'s photo`);
    a2.parentElement && a2.remove();
    const u3 = ("function" == typeof $p ? $p(e, t) : "").trim(), l = `You are ${t.name}, in a group chat with your boss and colleagues.
${u3 ? u3 + "\n\n" : ""}You just sent a ${n} selfie${userDesc ? ` (${userDesc})` : ""} in response to the conversation above. Write a very short message (a few words) to accompany the photo that fits naturally with what's being discussed. No quotation marks.`;
    console.log(`[Group Image] \u{1F4DD} Caption prompt built (${l.length} chars, context: ${u3 ? "yes" : "none"})`);
    let c = "";
    try {
      c = extractText(await queuedGenerateText(l, { max_tokens: 40 }, "Photo caption")).trim();
    } catch (e2) {
      c = "explicit" === n ? "\u{1F608}" : "nude" === n ? "\u{1F648}" : "\u{1F4F8}";
    }
    console.log(`[Group Image] \u{1F4AC} Caption: "${c}"`), e.messages.push({ id: Date.now() + Math.random(), senderId: t.id, content: c, timestamp: Date.now(), isSystem: false, imageUrl: s, imageType: "selfie", imagePrompt: r, imageReqType: n, imageDesc: userDesc || "", nude: ["nude", "explicit", "lewd"].includes(n) }), t.photoGallery || (t.photoGallery = []), t.photoGallery.push({ url: s, type: n, timestamp: Date.now(), source: "group-request" }), Np(e), saveGame(false), console.log(`[Group Image] \u2705 Delivered ${n} photo from ${t.name}`);
  } catch (e2) {
    console.error("[Group Image] \u274C Failed to generate image:", e2), showNotification("Failed to generate image", 2e3);
  }
}
function Sm() {
  Kp();
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  e && (window.groupActionState.selectedTargets = [...e.participantIds], Tm(e.participantIds), $("groupPhotoDescription").value = "", $("groupPhotoRequestModal").style.display = "flex");
}
function closeGroupPhotoRequestModal() {
  $("groupPhotoRequestModal").style.display = "none";
}
function Tm(e) {
  const t = $("groupPhotoParticipants");
  t.innerHTML = "", window.groupActionState.selectedTargets = e, e.forEach((e2) => {
    const n = om(e2, "var(--x)");
    n && t.appendChild(n);
  });
}
async function confirmGroupPhotoRequest() {
  const e = window.groupActionState.selectedTargets, t = $("groupPhotoDescription").value.trim();
  if (e.length < 2) return void showNotification("Select at least 2 people for a group photo", 2e3);
  closeGroupPhotoRequestModal();
  const n = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!n) return;
  const a = e.map((e2) => gameState.employees.find((t2) => t2.id === e2)).filter(Boolean), o = a.map((e2) => e2.name);
  n.messages.push({ id: Date.now(), senderId: "player", content: `Hey ${o.join(", ")}, can you all take a group photo together? ${t || ""}`.trim(), timestamp: Date.now(), isPlayer: true }), Np(n), showNotification("\u{1F465} Requesting group photo...", 2e3), await $m(n, a, t);
}
async function $m(group, employees, u2) {
  const G2 = (group.messages || []).slice(-10).map((m) => {
    const sender = m.isPlayer ? "Boss" : gameState.employees.find((e) => e.id === m.senderId)?.name || "Colleague";
    return m.content ? `${sender}: ${m.content}` : "";
  }).filter(Boolean).join("\n"), U2 = (group.settings?.scenarioContext || group.pretext || "office setting").replace(/\s+/g, " ").trim().slice(0, 200), J2 = await mf({ employee: employees, type: "group-photo", customRequest: u2, recentHistory: G2, sceneContext: U2, mode: "group", previousState: yf(group.messages) });
  console.log(`[Group Photo] \u{1F3A8} ${employees.length} people: ${employees.map((e) => e.name).join(", ")} | scene: ${U2.slice(0, 80)} | prompt ${J2.length} chars`);
  try {
    const placeholder = document.createElement("div");
    placeholder.style.cssText = "text-align:center; padding:15px; color:var(--a); font-style:italic;", placeholder.textContent = "\u{1F4F8} Taking group photo...";
    const u3 = $("groupMessagesContainer");
    u3 && (u3.appendChild(placeholder), u3.scrollTop = u3.scrollHeight);
    const styled = applyImageStyle(fu(J2));
    console.log(`[Group Photo] \u{1F680} Final prompt to engine (${styled.prompt.length} chars): ${styled.prompt}`);
    const imageUrl = await queuedGenerateImage(styled, "Group photo");
    placeholder.parentElement && placeholder.remove();
    const a = employees[Math.floor(Math.random() * employees.length)];
    group.messages.push({ id: Date.now() + Math.random(), senderId: a.id, content: "\u{1F4F8} Here's our group photo!", timestamp: Date.now(), isSystem: false, imageUrl, imageType: "group-photo", imagePrompt: J2 }), Np(group), saveGame(false), console.log(`[Group Photo] \u2705 Delivered group photo (${employees.length} people)`);
  } catch (u3) {
    console.error("[Group Photo] \u274C Failed to generate group photo:", u3), showNotification("Failed to generate group photo", 2e3);
  }
}
function Cm() {
  Kp(), window.groupActionState.selectedTargets = [], $("groupPostRequestTarget").innerHTML = '<span style="color:var(--e); font-size:0.85rem;">No person selected</span>', $("groupPostRequestPrompt").value = "", $("groupPostCustomRequest").style.display = "none", $("groupPostCustomBtn").textContent = "\u270F\uFE0F Custom Request", $("groupRequestPostModal").style.display = "flex";
}
function closeGroupRequestPostModal() {
  $("groupRequestPostModal").style.display = "none";
}
function Em(e) {
  const t = $("groupPostRequestTarget");
  t.innerHTML = "", e.forEach((e2) => {
    const n = om(e2, "var(--cf)");
    n && t.appendChild(n);
  });
}
function toggleGroupPostCustomRequest() {
  const e = $("groupPostCustomRequest"), t = $("groupPostCustomBtn");
  "none" === e.style.display ? (e.style.display = "block", t.textContent = "\u2B06\uFE0F Use Presets") : (e.style.display = "none", t.textContent = "\u270F\uFE0F Custom Request");
}
async function sendGroupPostRequest(e, t = null) {
  const n = window.groupActionState.selectedTargets;
  if (0 === n.length) return void showNotification("Please select who to request from", 2e3);
  closeGroupRequestPostModal();
  const a = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!a) return;
  const o = n[0], i = gameState.employees.find((e2) => e2.id === o);
  if (!i) return;
  const s = t || `a ${e} post`;
  a.messages.push({ id: Date.now(), senderId: "player", content: `@${i.name}, can you make ${s} on social media?`, timestamp: Date.now(), isPlayer: true }), Np(a), showNotification(`\u{1F4F1} Requesting social post from ${i.name}...`, 2e3), "function" == typeof requestSocialPost && setTimeout(() => {
    requestSocialPost(i.id, e, t), a.messages.push({ id: Date.now() + Math.random(), senderId: i.id, content: "Okay, I'll post something! Check the social feed \u{1F4F1}", timestamp: Date.now(), isSystem: false }), Np(a), saveGame(false);
  }, 1e3);
}
function Im() {
  Kp();
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!e) return;
  window.groupActionState.selectedTargets = [...e.participantIds], Mm(e);
  const t = $("visualizeSceneContext"), n = e.settings?.scenarioContext || e.pretext || "No specific scene context set. The AI will infer from conversation.";
  t.textContent = n, $("visualizeAdditionalPrompt").value = "", $("includePlayerInVis").checked = true, $("groupVisualizeModal").style.display = "flex";
}
function closeGroupVisualizeModal() {
  $("groupVisualizeModal").style.display = "none";
}
function Mm(e) {
  const t = $("visualizeParticipants");
  t.innerHTML = "", e.participantIds.forEach((e2) => {
    const n = gameState.employees.find((t2) => t2.id === e2);
    if (!n) return;
    const a = document.createElement("div");
    a.className = "vis-participant-chip", a.dataset.empId = e2, a.dataset.selected = "true", a.style.cssText = "\n        display: flex; align-items: center; gap: 8px; padding: 8px 14px;\n        background: rgba(233,69,96,0.2); border: 1px solid var(--k);\n        border-radius: 20px; cursor: pointer; transition: all 0.2s;\n      ";
    const o = n.profileImage || n.generatedPortrait || "";
    a.innerHTML = ` <div style="width:28px; height:28px; border-radius:50%; background:${o ? `url('${o}') center/cover` : "var(--t)"}; display:flex; justify-content:center; align-items:center; font-size:0.9rem;">
          ${o ? "" : "\u{1F464}"} </div> <span style="color:var(--k); font-size:0.9rem;">${n.name}</span> `, a.onclick = () => Pm(a, e2), t.appendChild(a);
  });
}
function Pm(e, t) {
  if ("true" === e.dataset.selected) {
    e.dataset.selected = "false", e.style.background = "transparent", e.style.borderColor = "var(--ag)", e.querySelector("span").style.color = "var(--q)";
    const n = window.groupActionState.selectedTargets.indexOf(t);
    n > -1 && window.groupActionState.selectedTargets.splice(n, 1);
  } else e.dataset.selected = "true", e.style.background = "rgba(233,69,96,0.2)", e.style.borderColor = "var(--l)", e.querySelector("span").style.color = "var(--l)", window.groupActionState.selectedTargets.includes(t) || window.groupActionState.selectedTargets.push(t);
}
function selectAllVisParticipants() {
  const e = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  e && (window.groupActionState.selectedTargets = [...e.participantIds], document.querySelectorAll(".vis-participant-chip").forEach((e2) => {
    e2.dataset.selected = "true", e2.style.background = "rgba(233,69,96,0.2)", e2.style.borderColor = "var(--l)", e2.querySelector("span").style.color = "var(--l)";
  }));
}
function deselectAllVisParticipants() {
  window.groupActionState.selectedTargets = [], document.querySelectorAll(".vis-participant-chip").forEach((e) => {
    e.dataset.selected = "false", e.style.background = "transparent", e.style.borderColor = "var(--ag)", e.querySelector("span").style.color = "var(--q)";
  });
}
async function confirmGroupVisualize() {
  const e = window.groupActionState.selectedTargets, t = $("includePlayerInVis").checked, n = $("visualizeAdditionalPrompt").value.trim();
  if (0 === e.length) return void showNotification("Select at least one participant to visualize", 2e3);
  closeGroupVisualizeModal();
  const a = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  a && (showNotification("\u{1F3AC} Generating scene visualization...", 2e3), await Dm(a, e, t, n));
}
window.groupActionState = { selectedTargets: [], actionType: null, selectedGift: null, multiSelect: false };
const Lm = false;
async function Nm(e, t = "") {
  const n = e.settings?.autoVisualization;
  if (Lm && console.log(`[Group Auto-Vis] check for ${e?.name || "unknown"}`, { hasConfig: !!n, enabled: n?.enabled, minFreq: n?.minFreq, maxFreq: n?.maxFreq }), !n?.enabled) return;
  e.autoVisTracker || (e.autoVisTracker = { messagesSinceLastVis: 0, nextTriggerAt: Rm(n.minFreq, n.maxFreq), totalVisualizations: 0 });
  const a = e.autoVisTracker;
  a.messagesSinceLastVis++;
  let o = a.messagesSinceLastVis >= a.nextTriggerAt;
  if (n.intensityDetection && o && (o = _m(e, t)), !o) return;
  Lm && console.log(`[Group Auto-Vis] Triggering for ${e.name} (${a.messagesSinceLastVis} messages)`), a.messagesSinceLastVis = 0, a.nextTriggerAt = Rm(n.minFreq, n.maxFreq), a.totalVisualizations++;
  const i = false !== n.includePlayer;
  try {
    await Dm(e, e.participantIds, i, "");
  } catch (e2) {
    console.error("[Group Auto-Vis] Failed:", e2);
  }
}
function _m(e, t) {
  const n = e.messages.filter((e2) => !e2.isSystem).slice(-5).map((e2) => e2.content || "").join(" ").toLowerCase(), a = [/\b(kiss|kissed|kissing)\b/, /\b(hug|hugged|hugging|embrace)\b/, /\b(touch|touched|touching|caress)\b/, /\b(grab|grabbed|pull|pulled)\b/, /\b(strip|stripped|undress|naked|nude)\b/, /\b(moan|groan|gasp|pant)\b/, /\b(slap|hit|punch|fight)\b/, /\b(cry|crying|tears|sobbing)\b/, /\b(laugh|laughing|giggle)\b/, /\b(dance|dancing)\b/, /\b(lean|leaning|close|closer)\b/, /\*[^*]+\*/];
  for (const e2 of a) if (e2.test(n)) return Lm && console.log("[Group Auto-Vis] Intensity trigger matched:", e2), true;
  return false;
}
function Rm(e, t) {
  return e = Math.ceil(e), t = Math.floor(t), Math.floor(Math.random() * (t - e + 1)) + e;
}
async function Dm(e, t, n, a = "") {
  const o = t.map((e2) => gameState.employees.find((t2) => t2.id === e2)).filter(Boolean);
  if (0 === o.length) return void showNotification("No valid participants selected", 2e3);
  const i = o.map((e2) => {
    const t2 = getPhysicalDescriptionForPrompt(e2), n2 = e2.race && "human" !== e2.race ? e2.race : "", a2 = e2.physical?.raceFeatures?.description || "";
    return `
CHARACTER: ${e2.name} (${e2.role || "Employee"})
Physical: ${t2}
${n2 ? `Species: ${n2}${a2 ? ` - ${a2}` : ""}` : ""}
Gender: ${e2.gender || "female"}`;
  }).join("\n\n"), s = (gameState.playerProfile || {}).gender || "", r = gameState.settings?.playerBio || "", l = n ? `
CHARACTER: The Boss/Player
Gender: ${s || "unspecified"}
${r || "The boss, a commanding presence in the office"}` : "", c = e.settings?.scenarioContext || e.pretext || "", d = e.messages.filter((e2) => !e2.isSystem && e2.content).slice(-15).map((e2) => {
    if (e2.isPlayer) return `You (the boss): ${e2.content}`;
    const t2 = o.find((t3) => t3.id === e2.senderId);
    return t2 ? `${t2.name}: ${e2.content}` : `Unknown: ${e2.content}`;
  }).join("\n"), p = `You are creating an image prompt for a GROUP SCENE with MULTIPLE CHARACTERS.

\u{1F4CA} SCENE PARTICIPANTS: ${o.length}${n ? " + the player/boss" : ""} people total
Each character MUST be clearly visible and identifiable in the image.

\u{1F3AD} CHARACTER DESCRIPTIONS (MUST be accurate):
${i}
${l}

\u{1F4CD} SCENE CONTEXT:
${c || "Office/workplace setting"}

\u{1F4AC} RECENT CONVERSATION (to understand current actions/mood):
${d}

${a ? `\u{1F3A8} ADDITIONAL INSTRUCTIONS: ${a}` : ""}

Based on all the above, create a DETAILED image prompt showing:
1. ALL ${o.length}${n ? "+1" : ""} characters together in one scene
2. Each character's DISTINCTIVE physical features (hair color, body type, race/species features)
3. Their current positions, poses, and expressions based on the conversation
4. The setting/location from the scenario context
5. The emotional atmosphere/mood

\u26A0\uFE0F CRITICAL RULES:
- EVERY character must be visible and identifiable
- Include distinctive features for EACH person
- Show the scene from the conversation context
- Natural positioning - not just standing in a line
- Include any non-human features if characters have them

Write ONLY the raw image description (50-200 words). No labels, headers, or markdown:`;
  try {
    const t2 = document.createElement("div");
    t2.style.cssText = "text-align:center; padding:15px; color:var(--k); font-style:italic;", t2.innerHTML = '\u{1F3AC} <span style="color:var(--a);">Visualizing scene with ' + (o.length + (n ? 1 : 0)) + " characters...</span>";
    const a2 = $("groupMessages");
    a2 && (a2.appendChild(t2), a2.scrollTop = a2.scrollHeight);
    let i2 = await queuedGenerateText(p, { temperature: 0.8, max_tokens: 300 }, "Generating group scene prompt");
    i2 = extractText(i2).trim(), i2 = i2.replace(/^["']|["']$/g, ""), i2 = i2.replace(/\*\*.*?\*\*/g, "").trim(), console.log("[Group Visualization] Generated prompt:", i2);
    const s2 = await queuedGenerateImage(applyImageStyle(fu(i2)), "Group scene visualization");
    if (t2.parentElement && t2.remove(), !(s2 && "string" == typeof s2 && s2.length > 20 && (s2.startsWith("http") || s2.startsWith("data:") || s2.startsWith("blob:")))) return console.error("[Group Visualization] Invalid imageUrl received:", typeof s2, s2?.substring?.(0, 100) || s2), void showNotification("Failed to generate scene image. Try again.", 2e3);
    e.messages.push({ id: Date.now() + Math.random(), senderId: "system", content: `\u{1F3AC} Scene visualization (${o.length + (n ? 1 : 0)} characters)`, timestamp: Date.now(), isSystem: true, systemType: "visualization", imageUrl: s2, imagePrompt: i2, imageType: "group-scene" }), e.autoVisTracker || (e.autoVisTracker = { messagesSinceLastVis: 0, totalVisualizations: 0 }), e.autoVisTracker.messagesSinceLastVis = 0, e.autoVisTracker.totalVisualizations++, Np(e), saveGame(false), showNotification("\u{1F3AC} Scene visualization generated!", 2e3);
  } catch (e2) {
    console.error("Failed to visualize group scene:", e2), showNotification("Failed to generate visualization", 2e3);
    const t2 = $("groupMessages"), n2 = t2?.querySelector('[style*="Visualizing scene"]');
    n2 && n2.remove();
  }
}
let Om = true;
const Bm = [{ id: "continue", name: "\u25B6\uFE0F Continue", instruction: "Continue the scene naturally. Add more detail or action.", autoSend: true, emoji: "\u25B6\uFE0F", enabled: true }, { id: "action", name: "\u{1F3AC} Action", instruction: "Characters perform physical actions. Describe movements, gestures, interactions. No dialogue, just actions.", autoSend: true, emoji: "\u{1F3AC}", enabled: true }, { id: "interact", name: "\u{1F4AC} Interact", instruction: "Characters interact with each other, not the player. Show dialogue and reactions between NPCs.", autoSend: true, emoji: "\u{1F4AC}", enabled: true }, { id: "narrate", name: "\u{1F4DC} Narrate", instruction: "Describe the scene from a third-person narrator perspective. Set the atmosphere and describe character body language.", autoSend: true, emoji: "\u{1F4DC}", enabled: true, forNarrator: true }, { id: "thoughts", name: "\u{1F4AD} Thoughts", instruction: "Show internal thoughts of the speaking character. What are they really thinking?", autoSend: true, emoji: "\u{1F4AD}", enabled: false }, { id: "tension", name: "\u26A1 Tension", instruction: "Increase the tension or drama. Characters have conflicting emotions, desires, or opinions.", autoSend: true, emoji: "\u26A1", enabled: false }, { id: "flirt", name: "\u{1F495} Flirt", instruction: "Characters engage in flirtatious behavior. Be playful and suggestive.", autoSend: true, emoji: "\u{1F495}", enabled: false }, { id: "react", name: "\u{1F62E} React", instruction: "Show emotional reactions to the current situation. Express feelings through words and body language.", autoSend: true, emoji: "\u{1F62E}", enabled: false }, { id: "comply", name: "\u2705 Comply", instruction: "Character agrees and complies with what was just said or requested.", autoSend: true, emoji: "\u2705", enabled: false }, { id: "resist", name: "\u26D4 Resist", instruction: "Character pushes back, resists, or expresses reluctance. Stay in character.", autoSend: true, emoji: "\u26D4", enabled: false }, { id: "custom", name: "\u270F\uFE0F Custom", instruction: "", autoSend: false, emoji: "\u270F\uFE0F", enabled: false }];
function toggleGroupActionBar() {
  Om = !Om, gameState.settings || (gameState.settings = {}), gameState.settings.groupActionBarCollapsed = Om;
  const e = $("groupActionBarWrapper"), t = $("groupActionsBtn");
  e && (e.style.display = Om ? "none" : "block"), t && (t.style.color = Om ? "var(--n)" : "var(--b)");
}
function Fm(e) {
  return (e?.actionButtons || Bm).filter((t) => false !== t.enabled && !(t.forNarrator && !e?.hasNarrator));
}
function jm(e) {
  const t = $("groupActionButtonsContainer");
  if (!t || !e) return;
  t.innerHTML = "", gameState.settings?.groupActionBarCollapsed && (Om = true);
  const n = $("groupActionBarWrapper");
  n && (n.style.display = Om ? "none" : "block");
  const a = Fm(e), o = document.createElement("div");
  o.style.cssText = "display:flex; gap:6px; flex-wrap:wrap; align-items:center; width:100%;", a.forEach((t2) => {
    const n2 = document.createElement("button");
    n2.className = "group-action-btn", n2.dataset.actionId = t2.id;
    const a2 = t2.forNarrator, i2 = "custom" === t2.id;
    n2.style.cssText = `
        padding:6px 10px;
        background:${i2 ? "var(--af)" : a2 ? "rgba(199,125,255,0.2)" : "var(--t)"};
        border:1px solid ${a2 ? "var(--x)" : i2 ? "var(--er)" : "var(--n)"};
        border-radius:16px;
        color:var(--b);
        cursor:pointer;
        font-size:0.75rem;
        font-weight:500;
        transition:all 0.2s;
        display:inline-flex;
        align-items:center;
        gap:3px;
        white-space:nowrap;
        min-height:28px;
        flex-shrink:0;
        touch-action:manipulation;
      `, n2.innerHTML = `${t2.emoji} <span class="action-btn-text">${t2.name.replace(t2.emoji + " ", "")}</span>`, n2.title = t2.instruction || "Custom action", n2.addEventListener("mouseenter", () => {
      n2.style.background = a2 ? "var(--x)" : i2 ? "var(--as)" : "var(--n)", n2.style.color = i2 ? "white" : "var(--ae)";
    }), n2.addEventListener("mouseleave", () => {
      n2.style.background = i2 ? "var(--af)" : a2 ? "rgba(199,125,255,0.2)" : "var(--t)", n2.style.color = "var(--b)";
    }), n2.addEventListener("click", (n3) => {
      n3.stopPropagation(), qm(e, t2);
    }), o.appendChild(n2);
  });
  const i = document.createElement("button");
  i.style.cssText = "\n      padding:6px 10px;\n      background:transparent;\n      border:1px dashed var(--af);\n      border-radius:16px;\n      color:var(--q);\n      cursor:pointer;\n      font-size:0.7rem;\n      min-height:28px;\n      touch-action:manipulation;\n    ", i.textContent = "\u2699\uFE0F", i.title = "Configure action buttons", i.addEventListener("click", (t2) => {
    t2.stopPropagation(), zm(e);
  }), o.appendChild(i), t.appendChild(o);
}
async function qm(e, t) {
  const n = $("groupInput");
  if (!n) return;
  const a = t.id, o = n.value.trim();
  if (!o || o.startsWith("/")) {
    n.value = `/${a} {Optional}`, n.focus();
    const e2 = n.value.indexOf("{") + 1, t2 = n.value.indexOf("}");
    return void n.setSelectionRange(e2, t2);
  }
  n.value = `/${a} {${o}}`, n.focus(), n.setSelectionRange(n.value.length, n.value.length);
}
function zm(e) {
  const t = document.createElement("div");
  t.id = "groupActionConfigModal", t.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:var(--ax); z-index:999999; display:flex; justify-content:center; align-items:center; overflow-y:auto;";
  const n = (e.actionButtons || Bm).map((e2) => ({ ...e2 })), a = (e2) => e2.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) || "cmd", o = (e2, t2) => {
    const n2 = e2.id.startsWith("custom_") || !Bm.some((t3) => t3.id === e2.id), o2 = a(e2.name.replace(e2.emoji + " ", ""));
    return ` <div class="action-btn-config" data-index="${t2}" data-original-id="${e2.id}" style="background:var(--f); padding:12px; border-radius:8px; border-left:3px solid ${false !== e2.enabled ? "var(--n)" : "var(--af)"};"> <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;"> <input type="checkbox" ${false !== e2.enabled ? "checked" : ""} data-field="enabled" style="width:18px; height:18px; cursor:pointer; flex-shrink:0;"> <input type="text" value="${e2.emoji}" data-field="emoji" maxlength="2" 
              style="width:36px; padding:4px; background:var(--h); border:1px solid var(--r); border-radius:4px; color:var(--b); text-align:center; font-size:1.1rem; flex-shrink:0;">
            <code class="command-display" style="color:var(--g); font-size:0.8rem; background:var(--h); padding:2px 6px; border-radius:3px; white-space:nowrap;">/${o2}</code> <input type="text" value="${e2.name.replace(e2.emoji + " ", "").replace(/"/g, "&quot;")}" data-field="name" placeholder="Button name..."
              style="flex:1; padding:4px 8px; background:var(--h); border:1px solid var(--r); border-radius:4px; color:var(--b); font-weight:600; font-size:0.85rem; min-width:80px;">
            ${e2.forNarrator ? '<span style="background:var(--x); color:var(--q); padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:600;">NARRATOR</span>' : ""} <button class="delete-action-btn" data-index="${t2}" style="padding:4px 8px; background:${n2 ? "var(--l)" : "var(--ag)"}; border:none; border-radius:4px; color:${n2 ? "white" : "var(--as)"}; cursor:${n2 ? "pointer" : "not-allowed"}; font-size:0.8rem; flex-shrink:0;" ${n2 ? "" : 'disabled title="Cannot delete default actions"'}>\u{1F5D1}\uFE0F</button>
          </div>
          <div style="margin-left:28px;">
            <div style="color:var(--e); font-size:0.7rem; margin-bottom:4px;">AI INSTRUCTION:</div>
            <textarea data-field="instruction" placeholder="Describe how characters should respond..."
              style="width:100%; padding:6px 8px; background:var(--h); border:1px solid var(--r); border-radius:4px; color:var(--ao); font-size:0.8rem; resize:vertical; min-height:40px; font-family:inherit;">${(e2.instruction || "").replace(/"/g, "&quot;")}</textarea> </div> </div> `;
  };
  t.innerHTML = ` <div style="background:var(--h); padding:25px; border-radius:12px; max-width:650px; width:90%; max-height:90vh; overflow-y:auto; margin:20px;"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;"> <h3 style="margin:0; color:var(--g);">\u2699\uFE0F Group Response Style Buttons</h3> <button id="closeGroupActionConfig" style="background:transparent; border:none; color:var(--b); font-size:1.5rem; cursor:pointer;">\u2715</button> </div> <!-- How It Works Section --> <div style="background:linear-gradient(135deg, rgba(78,204,163,0.15) 0%, rgba(0,212,255,0.1) 100%); border:1px solid rgba(78,204,163,0.3); border-radius:10px; padding:15px; margin-bottom:20px;"> <h4 style="margin:0 0 10px 0; color:var(--g); font-size:0.95rem;">\u{1F4A1} How Group Response Styles Work</h4> <p style="color:var(--ao); margin:0 0 12px 0; font-size:0.85rem; line-height:1.5;"> These buttons control <strong>how characters respond</strong> in the group chat. The command (e.g., <code style="color:var(--g);">/action</code>) is auto-generated from the button name. </p> <div style="background:var(--am); border-radius:6px; padding:10px; margin-bottom:10px;"> <div style="color:var(--m); font-size:0.8rem; margin-bottom:5px;">\u{1F4DD} Example Usage:</div> <code style="color:var(--g); font-size:0.85rem; display:block; margin-bottom:6px;">/action {Everyone stops what they're doing}</code> <span style="color:var(--e); font-size:0.75rem;">\u2192 Your message appears, then characters respond with <em>only physical actions</em></span> </div> <!-- /do Command Explanation --> <div style="background:rgba(255,165,0,0.1); border:1px solid rgba(255,165,0,0.3); border-radius:6px; padding:10px;"> <div style="color:var(--bm); font-size:0.8rem; font-weight:600; margin-bottom:6px;">\u{1F3AD} Special Command: <code style="background:var(--h); padding:2px 6px; border-radius:3px;">/do</code></div> <p style="color:var(--ao); font-size:0.8rem; margin:0 0 6px 0;"> <code style="color:var(--bm);">/do</code> is a <strong>direct command</strong> \u2014 it tells a character exactly what to do. </p> <code style="color:var(--bm); font-size:0.8rem; display:block; margin-bottom:4px;">/do Sarah whispers something to Mike</code> <span style="color:var(--e); font-size:0.75rem;">\u2192 No player message. Sarah just does it.</span> </div> </div> <h4 style="margin:0 0 15px 0; color:var(--b); font-size:0.9rem;">\u{1F4CB} Available Response Styles</h4> <div id="groupActionButtonsList" style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px;"> ${n.map((e2, t2) => o(e2, t2)).join("")} </div> <!-- Add Custom Section --> <div style="background:linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.05) 100%); border:1px solid rgba(255,215,0,0.3); padding:15px; border-radius:8px; margin-bottom:20px;"> <h4 style="margin:0 0 12px 0; color:var(--m); font-size:0.9rem;">\u2795 Create Custom Response Style</h4> <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:8px; align-items:center;"> <input type="text" id="newGroupActionEmoji" placeholder="\u{1F60A}" maxlength="2" style="width:50px; padding:8px; background:var(--h); border:1px solid var(--r); border-radius:4px; color:var(--b); text-align:center; font-size:1.2rem;"> <input type="text" id="newGroupActionName" placeholder="Button Label" style="flex:1; min-width:120px; padding:8px; background:var(--h); border:1px solid var(--r); border-radius:4px; color:var(--b);"> <code id="newGroupCommandPreview" style="color:var(--g); font-size:0.85rem; background:var(--h); padding:6px 10px; border-radius:4px; min-width:60px;">/...</code> </div> <textarea id="newGroupActionInstruction" placeholder="Describe how characters should respond when this style is used...&#10;Example: Characters speak seductively, using double meanings." 
            style="width:100%; padding:8px; background:var(--h); border:1px solid var(--r); border-radius:4px; color:var(--b); min-height:60px; resize:vertical; font-family:inherit; font-size:0.85rem;"></textarea> <div style="display:flex; justify-content:flex-end; margin-top:10px;"> <button id="addNewGroupActionBtn" style="padding:8px 16px; background:var(--z); border:none; border-radius:6px; color:var(--q); cursor:pointer; font-weight:600;"> + Add Style </button> </div> </div> <div style="display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap;"> <button id="resetGroupToDefaultActions" style="padding:10px 20px; background:var(--af); border:none; border-radius:6px; color:var(--b); cursor:pointer;"> Reset to Defaults </button> <button id="saveGroupActionConfig" style="padding:10px 20px; background:linear-gradient(135deg, var(--n) 0%, var(--u) 100%); border:none; border-radius:6px; color:var(--q); cursor:pointer; font-weight:600;"> \u{1F4BE} Save Changes </button> </div> </div> `, document.body.appendChild(t), t.querySelector("#closeGroupActionConfig").addEventListener("click", () => {
    t.remove();
  }), t.addEventListener("click", (e2) => {
    e2.target === t && t.remove();
  });
  const i = (e2) => {
    const o2 = e2.querySelector('[data-field="enabled"]'), i2 = e2.querySelector('[data-field="name"]'), s2 = e2.querySelector(".command-display"), r2 = e2.querySelector(".delete-action-btn");
    o2 && o2.addEventListener("change", () => {
      e2.style.borderLeftColor = o2.checked ? "var(--n)" : "var(--af)";
    }), i2 && s2 && i2.addEventListener("input", () => {
      const e3 = i2.value.trim(), t2 = a(e3);
      s2.textContent = e3 ? `/${t2}` : "/...", s2.style.color = e3 ? "var(--n)" : "var(--au)";
    }), r2 && !r2.disabled && r2.addEventListener("click", async () => {
      const a2 = parseInt(e2.dataset.index);
      await Ev("Delete this response style?", "Delete Style", { type: "danger", confirmText: "Delete" }) && (n.splice(a2, 1), e2.remove(), t.querySelectorAll(".action-btn-config").forEach((e3, t2) => {
        e3.dataset.index = t2;
        const n2 = e3.querySelector(".delete-action-btn");
        n2 && (n2.dataset.index = t2);
      }));
    });
  };
  t.querySelectorAll(".action-btn-config").forEach(i);
  const s = t.querySelector("#newGroupActionName"), r = t.querySelector("#newGroupCommandPreview");
  s && r && s.addEventListener("input", () => {
    const e2 = s.value.trim(), t2 = a(e2);
    r.textContent = e2 ? `/${t2}` : "/...";
  }), t.querySelector("#addNewGroupActionBtn").addEventListener("click", () => {
    const e2 = t.querySelector("#newGroupActionEmoji").value.trim() || "\u{1F539}", a2 = t.querySelector("#newGroupActionName").value.trim(), s2 = t.querySelector("#newGroupActionInstruction").value.trim();
    if (!a2) return void showNotification("Please enter a button name", 2e3);
    if (!s2) return void showNotification("Please enter an instruction", 2e3);
    const l = { id: "custom_" + Date.now(), name: `${e2} ${a2}`, emoji: e2, instruction: s2, autoSend: true, enabled: true };
    n.push(l);
    const c = t.querySelector("#groupActionButtonsList"), d = o(l, n.length - 1), p = document.createElement("div");
    p.innerHTML = d;
    const m = p.firstElementChild;
    c.appendChild(m), i(m), t.querySelector("#newGroupActionEmoji").value = "", t.querySelector("#newGroupActionName").value = "", t.querySelector("#newGroupActionInstruction").value = "", r.textContent = "/...", showNotification("Added new response style!", 1500);
  }), t.querySelector("#resetGroupToDefaultActions").addEventListener("click", async () => {
    await Ev("Reset all response styles to defaults? Custom styles will be lost.", "Reset Styles") && (n.length = 0, Bm.forEach((e2) => n.push({ ...e2 })), t.querySelector("#groupActionButtonsList").innerHTML = n.map((e2, t2) => o(e2, t2)).join(""), t.querySelectorAll(".action-btn-config").forEach(i), showNotification("Reset to default styles", 1500));
  }), t.querySelector("#saveGroupActionConfig").addEventListener("click", () => {
    const a2 = [];
    t.querySelectorAll(".action-btn-config").forEach((e2, t2) => {
      const o2 = e2.dataset.originalId, i2 = e2.querySelector('[data-field="enabled"]')?.checked ?? true, s2 = e2.querySelector('[data-field="emoji"]')?.value || "\u{1F539}", r2 = e2.querySelector('[data-field="name"]')?.value?.trim() || "Action", l = e2.querySelector('[data-field="instruction"]')?.value?.trim() || "", c = n.find((e3) => e3.id === o2) || {};
      a2.push({ ...c, id: o2 || "custom_" + Date.now() + t2, name: `${s2} ${r2}`, emoji: s2, instruction: l, enabled: i2 });
    }), e.actionButtons = a2, jm(e), t.remove(), saveGame(false), showNotification("Group action buttons saved!", 2e3);
  });
}
async function Gm(e, t) {
  if (!e || !t) return;
  const n = e.participantIds.map((e2) => gameState.employees.find((t2) => t2.id === e2)).filter(Boolean);
  let a = null, o = t;
  for (const e2 of n) {
    const n2 = e2.name.split(" ")[0].toLowerCase(), i = e2.name.toLowerCase();
    if (t.toLowerCase().startsWith(n2 + " ") || t.toLowerCase().startsWith(i + " ")) {
      a = e2, o = t.substring(t.indexOf(" ") + 1);
      break;
    }
  }
  if (!a && (t.toLowerCase().startsWith("the scene") || t.toLowerCase().startsWith("narrator") || t.toLowerCase().startsWith("suddenly") || t.toLowerCase().startsWith("meanwhile") || t.toLowerCase().includes("atmosphere")) || !a && e.hasNarrator) await Hm(e, t);
  else if (a) await Ym(e, a, o);
  else {
    const a2 = n[Math.floor(Math.random() * n.length)];
    a2 && await Ym(e, a2, t);
  }
}
async function Hm(e, t) {
  Tp();
  try {
    const n = `You are a third-person narrator describing events in an interactive story.

${kp(e)}

[DIRECTOR'S INSTRUCTION]
The player/director wants you to describe the following:
"${t}"

Narrate this as the omniscient narrator. Write in third person, past tense.
Describe the scene vividly, including character reactions and atmosphere.
Do NOT include dialogue unless the instruction specifically asks for it.
Keep the narration engaging (2-5 sentences).

Write only the narration:`, a = sanitizeNpcResponse(await queuedGenerateText(n, {}, "Narrator /do command"), 8);
    Lp(), e.messages.push({ sender: "Narrator", content: a, isNarrator: true, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now(), isDoCommand: true }), e.lastMessageAt = gameState.time?.currentTime || Date.now(), Np(e), Nm(e, a), saveGame(false);
  } catch (e2) {
    console.error("Error generating narrator /do response:", e2), Lp();
  }
}
async function Ym(e, t, n) {
  Ap(t);
  try {
    const a = $p(e, t), o = e.settings?.playerAbsent, i = `You are ${t.name}, a ${t.role || "employee"} in a company.
${t.personality ? `Personality: ${wr(t.personality)}` : ""}
${o ? "\n[NOTE: The boss/player is NOT in this scene. Do not address them.]" : ""}

${a}

[DIRECTOR'S INSTRUCTION]
The player/director wants you to do the following:
"${n}"

Respond as ${t.name} performing this action or saying this.
Stay in character. Make it feel natural.
Include physical actions in *asterisks* where appropriate.
Keep the response appropriate length (2-4 sentences typically).

Write only ${t.name}'s response:`, s = sanitizeNpcResponse(await queuedGenerateText(i, {}, `${t.name} /do command`), 6);
    Lp(), e.messages.push({ sender: t.name, employeeId: t.id, content: s, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now(), isDoCommand: true }), e.lastMessageAt = gameState.time?.currentTime || Date.now(), Np(e), Nm(e, s), saveGame(false);
  } catch (e2) {
    console.error("Error generating character /do response:", e2), Lp();
  }
}
async function Wm(e, t, n) {
  const a = $("groupInput");
  t && (e.messages.push({ sender: "You", content: t, isPlayer: true, timestamp: gameState.time?.currentTime || Date.now(), intent: Ep(t, e) }), e.lastMessageAt = gameState.time?.currentTime || Date.now(), a && (a.value = ""), Np(e));
  const o = [...gameState.groupSpeakerQueue || []];
  gameState.groupSpeakerQueue = [], hp(), pp(e);
  for (const t2 of o) if ("__narrator__" === t2) await Vm(e, n);
  else {
    const a2 = gameState.employees.find((e2) => e2.id === t2);
    a2 && await Km(e, a2, n);
  }
  saveGame(false);
}
async function Vm(e, t) {
  Tp();
  try {
    const n = `${Sp(e, kp(e))}

[ADDITIONAL INSTRUCTION: ${t}]`, a = sanitizeNpcResponse(await queuedGenerateText(n, {}, "Narrator with instruction"), 8);
    Lp(), e.messages.push({ sender: "Narrator", content: a, isNarrator: true, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() }), e.lastMessageAt = gameState.time?.currentTime || Date.now(), Np(e), Nm(e, a);
  } catch (e2) {
    console.error("Error generating narrator response:", e2), Lp();
  }
}
async function Km(e, t, n) {
  Ap(t);
  try {
    const a = `${Pp(e, t, $p(e, t), null, Ip(e))}

[RESPONSE STYLE INSTRUCTION: ${n}]`, o = false !== gameState.settings?.enableStreamingResponses;
    let i = null, s = false, u2 = "";
    const r = $("groupMessages");
    o && r && gameState.activeGroup === e.id && (i = document.createElement("div"), i.style.cssText = "display:flex; gap:8px; align-items:flex-start; padding:8px 12px; margin:4px 0; background:rgba(15,52,96,0.4); border-radius:12px; color:var(--cu); align-self:flex-start; max-width:80%;", i.innerHTML = `<span style="color:var(--d);font-weight:600;white-space:nowrap;">${t.name.split(" ")[0]}:</span><span class="stream-text">\u258D</span>`, r.appendChild(i), r.scrollTop = r.scrollHeight);
    const l = await queuedGenerateText(a, { ...i ? { onChunk: function(e2) {
      if (!e2) return;
      s || (Lp(), s = true), u2 = e2.fullTextSoFar || u2;
      const t2 = i.querySelector(".stream-text");
      t2 && (t2.textContent = e2.fullTextSoFar + "\u258D"), r && (r.scrollTop = r.scrollHeight);
    } } : {} }, `${t.name} with instruction`);
    i && (i.remove(), i = null);
    let c = sanitizeNpcResponse(l, 5);
    (!c || c.startsWith("I'm having some difficulty")) && u2.trim().length > 0 && (c = sanitizeNpcResponse(u2, 5)), Lp(), e.messages.push({ sender: t.name, employeeId: t.id, content: c, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now() }), e.lastMessageAt = gameState.time?.currentTime || Date.now(), Np(e), Nm(e, c);
  } catch (e2) {
    console.error("Error generating group response:", e2), Lp();
  }
}
function Jm() {
  const e = document.createElement("div");
  e.id = "groupCommandsHelpModal", e.style.cssText = "\n      position: fixed; top: 0; left: 0; width: 100%; height: 100%;\n      background: var(--an); z-index: 1000000;\n      display: flex; justify-content: center; align-items: center; padding: 20px;\n    ";
  const t = () => e.remove();
  e.innerHTML = ` <div style="background: linear-gradient(135deg, var(--w) 0%, var(--ad) 100%); border-radius: 15px; max-width: 550px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 25px;"> <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"> <h2 style="margin:0; color:var(--g);">\u{1F3AC} Group Commands</h2> <button id="closeGroupCommandsHelp" style="background:transparent; border:none; color:var(--a); font-size:1.5rem; cursor:pointer;">\xD7</button> </div> <div style="margin-bottom:25px;"> <h3 style="color:var(--k); margin:0 0 10px 0; font-size:1rem;">\u{1F3AD} /do Command</h3> <p style="color:var(--e); font-size:0.85rem; margin:0 0 15px 0;"> Direct control over characters and narrator. Type in the message input: </p> <div style="background:var(--i); padding:12px; border-radius:8px; font-family:monospace; font-size:0.85rem;"> <div style="color:var(--bm); margin-bottom:8px;"><code>/do [Character] does something</code></div> <div style="color:var(--e); font-size:0.75rem; margin-bottom:12px;">Example: <code style="color:var(--g);">/do Sarah leans over and whispers to Mike</code></div> <div style="color:var(--x); margin-bottom:8px;"><code>/do The scene changes...</code></div> <div style="color:var(--e); font-size:0.75rem;">Triggers narrator if no character specified</div> </div> </div> <div style="margin-bottom:25px;"> <h3 style="color:var(--x); margin:0 0 10px 0; font-size:1rem;">\u{1F4DC} /narrator Command</h3> <p style="color:var(--e); font-size:0.85rem; margin:0 0 10px 0;"> Trigger narrator with optional custom instructions: </p> <div style="background:var(--i); padding:12px; border-radius:8px; font-family:monospace; font-size:0.85rem;"> <div style="color:var(--x); margin-bottom:6px;"><code>/narrator</code> or <code>/n</code></div> <div style="color:var(--e); font-size:0.75rem; margin-bottom:10px;">\u2192 Narrator describes the current scene</div> <div style="color:var(--x); margin-bottom:6px;"><code>/narrator &lt;Focus on the tension in the room&gt;</code></div> <div style="color:var(--e); font-size:0.75rem;">\u2192 Narrator follows your specific instruction</div> </div> </div> <div style="margin-bottom:25px;"> <h3 style="color:var(--j); margin:0 0 10px 0; font-size:1rem;">\u{1F4DD} Response Style Commands</h3> <p style="color:var(--e); font-size:0.85rem; margin:0 0 10px 0;"> Use /<em>style</em> {your message} to control how characters respond: </p> <div style="background:var(--i); padding:12px; border-radius:8px; font-family:monospace; font-size:0.85rem;"> <div style="color:var(--g); margin-bottom:6px;"><code>/action {Let's see what happens}</code></div> <div style="color:var(--e); font-size:0.75rem; margin-bottom:10px;">\u2192 Characters respond with physical actions only</div> <div style="color:var(--g); margin-bottom:6px;"><code>/interact {}</code></div> <div style="color:var(--e); font-size:0.75rem;">\u2192 Characters talk to each other, not the player</div> </div> </div> <div style="margin-bottom:25px;"> <h3 style="color:var(--j); margin:0 0 10px 0; font-size:1rem;">\u2699\uFE0F Group Settings</h3> <ul style="color:var(--e); font-size:0.85rem; padding-left:20px; margin:0;"> <li style="margin-bottom:8px;"><strong style="color:var(--k);">Player Not Present</strong> - Watch NPCs interact without you</li> <li style="margin-bottom:8px;"><strong style="color:var(--j);">Inter-Character Chat</strong> - NPCs address each other</li> <li style="margin-bottom:8px;"><strong style="color:var(--g);">Idle Conversations</strong> - NPCs chat when you're away</li> <li><strong style="color:var(--x);">Narrator</strong> - Third-person scene descriptions</li> </ul> </div> <div style="margin-bottom:15px;"> <h3 style="color:var(--g); margin:0 0 10px 0; font-size:1rem;">\u{1F3AC} Action Buttons</h3> <p style="color:var(--e); font-size:0.85rem; margin:0;"> Click action buttons to insert commands. Click \u2699\uFE0F to customize buttons - add, remove, rename, or change instructions to match your style. </p> </div> <button id="closeGroupCommandsHelpBtn" style="width:100%; padding:12px; background:var(--n); border:none; border-radius:8px; color:var(--q); font-weight:600; cursor:pointer; margin-top:10px;"> Got it! </button> </div> `, document.body.appendChild(e), e.querySelector("#closeGroupCommandsHelp").addEventListener("click", t), e.querySelector("#closeGroupCommandsHelpBtn").addEventListener("click", t), e.addEventListener("click", (n) => {
    n.target === e && t();
  });
}
function Qm() {
  if (!gameState.groups) return;
  const e = Date.now();
  gameState.groups.forEach((t) => {
    const n = t.settings?.idleConversations;
    if (!n?.enabled) return;
    const a = t.lastMessageAt || t.createdAt || e;
    (e - a) / 1e3 >= (n.threshold || 120) && !t._idleConvInProgress && gameState.activeGroup === t.id && Xm(t);
  });
}
async function Xm(e) {
  if (!e._idleConvInProgress) {
    e._idleConvInProgress = true;
    try {
      const t = e.participantIds.map((e2) => gameState.employees.find((t2) => t2.id === e2)).filter(Boolean);
      if (t.length < 2) return void (e._idleConvInProgress = false);
      const n = [...t].sort(() => Math.random() - 0.5), a = n[0], o = n[1], i = $p(e, a), s = `You are ${a.name} in a group setting.
The conversation has gone quiet. Start a new topic or make an observation to ${o.name}.
${e.settings?.playerAbsent ? "The boss is not present." : ""}

${i}

Start a natural, casual conversation. Address ${o.name} directly.
Keep it brief and natural (1-2 sentences).`, r = sanitizeNpcResponse(await queuedGenerateText(s, {}, `${a.name} idle conversation`), 4);
      e.messages.push({ sender: a.name, employeeId: a.id, content: r, isPlayer: false, timestamp: gameState.time?.currentTime || Date.now(), targetedCharacter: o.id, isIdleChat: true }), e.lastMessageAt = gameState.time?.currentTime || Date.now(), gameState.activeGroup === e.id && Np(e), saveGame(false), Math.random() < 0.6 ? setTimeout(async () => {
        await bp(e, o), e._idleConvInProgress = false;
      }, 2e3 + 3e3 * Math.random()) : e._idleConvInProgress = false;
    } catch (u2) {
      console.error("Error generating idle conversation:", u2), e._idleConvInProgress = false;
    }
  }
}
let Zm = { isActive: false, selectedIndex: 0, matches: [], searchTerm: "", lockedTarget: null };
function eg() {
  const e = $("groupInput");
  if (!e) return;
  e.addEventListener("input", ng), e.addEventListener("keydown", rg), e.addEventListener("blur", () => {
    setTimeout(() => ag(), 150);
  });
  const t = $("clearGroupTarget");
  t && t.addEventListener("click", (e2) => {
    e2.stopPropagation(), dg();
  });
}
function ng(e) {
  const t = e.target.value, n = gameState.groups?.find((e2) => e2.id === gameState.activeGroup);
  if (!n) return void ag();
  const a = t.match(/^\/do\s+(.*)$/i);
  if (a) {
    const e2 = a[1];
    if (Zm.lockedTarget) return void ag();
    const t2 = n.participantIds.map((e3) => gameState.employees.find((t3) => t3.id === e3)).filter(Boolean);
    if (0 === t2.length) return void ag();
    const o = e2.toLowerCase().trim();
    if (0 === o.length) return void og(t2, "", n);
    const i = t2.filter((e3) => {
      const t3 = e3.name.toLowerCase(), n2 = e3.name.split(" ")[0].toLowerCase(), a2 = e3.name.split(" ").slice(1).join(" ").toLowerCase();
      return t3.startsWith(o) || n2.startsWith(o) || a2 && a2.startsWith(o);
    });
    if (0 === i.length) {
      const e3 = t2.filter((e4) => e4.name.toLowerCase().includes(o));
      if (e3.length > 0) return void og(e3, o, n);
    }
    i.length > 0 ? og(i, o, n) : ag();
  } else ag();
}
function og(e, t, n) {
  const a = $("groupCharacterAutocomplete"), o = $("autocompleteResults"), i = $("autocompleteSearchTerm");
  a && o && (Zm.isActive = true, Zm.matches = e, Zm.searchTerm = t, Zm.selectedIndex = 0, i && (i.textContent = t ? `"${t}"` : "(type name)"), o.innerHTML = e.map((n2, a2) => {
    const o2 = n2.profileImage || n2.generatedPortrait || "", i2 = o2 && (o2.startsWith("http") || o2.startsWith("data:")), s = a2 === Zm.selectedIndex, r = n2.name.split(" ")[0], l = e.filter((e2) => e2.name.split(" ")[0] === r).length > 1;
    return ` <div class="autocomplete-item" data-index="${a2}" data-employee-id="${n2.id}" 
             style="display:flex; align-items:center; gap:12px; padding:10px 12px; cursor:pointer; border-radius:8px; margin:2px 0;
                    background:${s ? "rgba(78,204,163,0.2)" : "transparent"};
                    border:${s ? "1px solid var(--g)" : "1px solid transparent"}; transition:all 0.15s;"> <div style="width:40px; height:40px; border-radius:50%; overflow:hidden; background:var(--f); flex-shrink:0; border:2px solid ${s ? "var(--n)" : "var(--ag)"};">
            ${i2 ? `<img src="${o2}" style="width:100%; height:100%; object-fit:cover;">` : '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">\u{1F464}</div>'} </div> <div style="flex:1; min-width:0;"> <div style="font-weight:600; color:${s ? "var(--n)" : "white"}; font-size:0.95rem;">
              ${((e2) => {
      if (!t) return e2;
      const n3 = e2.toLowerCase().indexOf(t.toLowerCase());
      return -1 === n3 ? e2 : e2.substring(0, n3) + '<span style="background:var(--n); color:var(--q); padding:0 2px; border-radius:2px;">' + e2.substring(n3, n3 + t.length) + "</span>" + e2.substring(n3 + t.length);
    })(n2.name)}
              ${l ? '<span style="color:var(--m); font-size:0.7rem; margin-left:5px;">\u26A0\uFE0F Similar name</span>' : ""} </div> <div style="color:var(--e); font-size:0.75rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"> ${n2.role || "Employee"} </div> </div> <div style="color:${s ? "var(--n)" : "var(--af)"}; font-size:0.7rem; font-weight:500;">
            ${s ? "\u21B5 Enter" : ""} </div> </div> `;
  }).join(""), o.querySelectorAll(".autocomplete-item").forEach((t2) => {
    t2.addEventListener("click", () => {
      const n2 = t2.dataset.employeeId, a2 = e.find((e2) => e2.id === n2);
      a2 && sg(a2);
    }), t2.addEventListener("mouseenter", () => {
      ig(parseInt(t2.dataset.index));
    });
  }), a.style.display = "block");
}
function ag() {
  const e = $("groupCharacterAutocomplete");
  e && (e.style.display = "none"), Zm.isActive = false, Zm.matches = [], Zm.selectedIndex = 0;
}
function ig(e) {
  const t = $("autocompleteResults");
  if (!t) return;
  const n = t.querySelectorAll(".autocomplete-item");
  n.forEach((e2, t2) => {
    e2.style.background = "transparent", e2.style.border = "1px solid transparent";
    const n2 = e2.querySelector("div > div:first-child");
    n2 && (n2.style.color = "var(--b)");
    const a2 = e2.querySelector('div[style*="border-radius:50%"]');
    a2 && (a2.style.borderColor = "var(--ag)");
    const o = e2.querySelector("div:last-child");
    o && (o.textContent = "", o.style.color = "var(--q)");
  }), Zm.selectedIndex = e;
  const a = n[e];
  if (a) {
    a.style.background = "rgba(78,204,163,0.2)", a.style.border = "1px solid var(--g)";
    const e2 = a.querySelector("div > div:first-child");
    e2 && (e2.style.color = "var(--n)");
    const t2 = a.querySelector('div[style*="border-radius:50%"]');
    t2 && (t2.style.borderColor = "var(--n)");
    const n2 = a.querySelector("div:last-child");
    n2 && (n2.textContent = "\u21B5 Enter", n2.style.color = "var(--n)"), a.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}
function rg(e) {
  if (!Zm.isActive) return;
  const { matches: t, selectedIndex: n } = Zm;
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault(), ig((n + 1) % t.length);
      break;
    case "ArrowUp":
      e.preventDefault(), ig(0 === n ? t.length - 1 : n - 1);
      break;
    case "Tab":
      e.preventDefault(), t.length > 0 && sg(t[n]);
      break;
    case "Enter":
      t.length > 0 && Zm.isActive && (e.preventDefault(), e.stopPropagation(), sg(t[n]));
      break;
    case "Escape":
      ag();
  }
}
function sg(e) {
  const t = $("groupInput");
  if (!t || !e) return;
  t.value;
  const n = `/do ${e.name} `;
  t.value = n, t.focus(), t.setSelectionRange(n.length, n.length), Zm.lockedTarget = e, cg(e), ag(), t.style.borderColor = "var(--n)", t.style.boxShadow = "0 0 10px rgba(78,204,163,0.3)", setTimeout(() => {
    t.style.borderColor = "var(--ag)", t.style.boxShadow = "none";
  }, 500);
}
function cg(e) {
  const t = $("groupTargetIndicator"), n = $("groupTargetName");
  if (t && n) {
    const a = e.profileImage || e.generatedPortrait || "", o = a && (a.startsWith("http") || a.startsWith("data:"));
    n.innerHTML = ` <span style="display:inline-flex; align-items:center; gap:4px;"> ${o ? `<img src="${a}" style="width:16px; height:16px; border-radius:50%; object-fit:cover;">` : "\u{1F3AF}"} <span>${e.name.split(" ")[0]}</span> </span> `, t.style.display = "flex";
  }
}
function dg() {
  const e = $("groupTargetIndicator"), t = $("groupInput");
  e && (e.style.display = "none"), Zm.lockedTarget = null, t && t.value.toLowerCase().startsWith("/do ") && (t.value = "/do ", t.focus());
}
function ug() {
  ag(), Zm.lockedTarget = null;
  const e = $("groupTargetIndicator");
  e && (e.style.display = "none");
}
function pg() {
  const e = $("groupAttachBtn"), t = $("groupAttachmentMenu");
  e && (e.onclick = (e2) => {
    e2.stopPropagation(), Vp();
  }), document.addEventListener("click", (n) => {
    t && "block" === t.style.display && (t.contains(n.target) || n.target === e || Kp());
  }), document.querySelectorAll(".group-attach-menu-item").forEach((e2) => {
    e2.addEventListener("mouseenter", () => {
      e2.style.background = "rgba(102,126,234,0.2)";
    }), e2.addEventListener("mouseleave", () => {
      e2.style.background = "transparent";
    }), e2.onclick = () => {
      switch (e2.dataset.action) {
        case "send-money":
          im();
          break;
        case "give-gift":
          gm();
          break;
        case "request-image":
          wm();
          break;
        case "request-group-photo":
          Sm();
          break;
        case "request-post":
          Cm();
          break;
        case "visualize":
          Im();
      }
    };
  }), document.querySelectorAll(".group-money-preset").forEach((e2) => {
    e2.onclick = () => {
      const t2 = e2.dataset.preset, n = gameState.cash || 0;
      let a = 0;
      "small" === t2 ? a = Math.max(100, Math.floor(0.01 * n)) : "medium" === t2 ? a = Math.max(1e3, Math.floor(0.05 * n)) : "large" === t2 && (a = Math.max(1e4, Math.floor(0.1 * n)));
      const o = $("groupCustomMoneyAmount");
      o && (o.value = a);
    }, e2.addEventListener("mouseenter", () => {
      e2.style.background = "var(--n)", e2.style.borderColor = "var(--n)";
    }), e2.addEventListener("mouseleave", () => {
      e2.style.background = "var(--t)", e2.style.borderColor = "var(--n)";
    });
  }), document.querySelectorAll(".group-request-preset").forEach((e2) => {
    e2.onclick = () => sendGroupImageRequest(e2.dataset.preset), e2.addEventListener("mouseenter", () => {
      e2.style.background = "explicit" === e2.dataset.preset ? "var(--bq)" : "var(--u)", e2.style.color = "var(--b)";
    }), e2.addEventListener("mouseleave", () => {
      e2.style.background = "var(--t)", e2.style.color = "explicit" === e2.dataset.preset ? "var(--bq)" : "white";
    });
  }), document.querySelectorAll(".group-post-preset").forEach((e2) => {
    e2.onclick = () => sendGroupPostRequest(e2.dataset.preset), e2.addEventListener("mouseenter", () => {
      e2.style.background = "explicit" === e2.dataset.preset ? "var(--bq)" : "var(--cf)", e2.style.color = "explicit" === e2.dataset.preset ? "white" : "var(--w)";
    }), e2.addEventListener("mouseleave", () => {
      e2.style.background = "var(--t)", e2.style.color = "explicit" === e2.dataset.preset ? "var(--bq)" : "white";
    });
  }), $("groupImageRequestPrompt")?.closest("div")?.querySelector("button:last-child");
}
function toggleGroupsSidebar() {
  const e = $("groupsSidebar"), t = $("sidebarToggleBtn"), n = $("collapseSidebarBtn");
  if (!e) return;
  const a = e.classList.toggle("collapsed");
  t && (t.style.display = a ? "flex" : "none", t.innerHTML = "\u25B6", t.title = "Show groups list"), n && (n.innerHTML = "\u25C0", n.title = "Collapse sidebar"), gameState.uiPreferences || (gameState.uiPreferences = {}), gameState.uiPreferences.groupsSidebarCollapsed = a, saveGame(false);
}
function showGroupsListMobile() {
  const e = $("groupsSidebar"), t = $("groupChatView"), n = $("groupBackBtn");
  window.innerWidth <= 768 && (e && (e.style.display = "flex", e.classList.remove("mobile-hidden")), t && (t.style.display = "none", t.classList.add("mobile-hidden")), n && (n.style.display = "none"), gameState.activeGroup = null, rp());
}
function mg(e = true) {
  const t = $("groupsSidebar"), n = $("groupChatView"), a = $("groupBackBtn");
  window.innerWidth <= 768 ? e ? (t && (t.style.display = "none", t.classList.add("mobile-hidden")), n && (n.style.display = "flex", n.classList.remove("mobile-hidden")), a && (a.style.display = "block")) : (t && (t.style.display = "flex", t.classList.remove("mobile-hidden")), n && (n.style.display = "none", n.classList.add("mobile-hidden")), a && (a.style.display = "none")) : (t && (t.style.display = "flex", t.classList.remove("mobile-hidden")), n && (n.style.display = "flex", n.classList.remove("mobile-hidden")), a && (a.style.display = "none"));
}
function gg() {
  const e = $("groupsSidebar"), t = $("sidebarToggleBtn"), n = $("groupBackBtn");
  if (!e || !t) return;
  const a = window.innerWidth <= 768, o = e.classList.contains("collapsed");
  if (a) t.style.display = "none", n && gameState.activeGroup && (n.style.display = "block"), mg(!!gameState.activeGroup);
  else {
    t.style.display = o ? "flex" : "none", n && (n.style.display = "none"), e && (e.style.display = "flex");
    const a2 = $("groupChatView");
    a2 && (a2.style.display = "flex");
  }
  !a && gameState.uiPreferences?.groupsSidebarCollapsed && (e.classList.add("collapsed"), t.style.display = "flex");
}
setTimeout(pg, 100);
