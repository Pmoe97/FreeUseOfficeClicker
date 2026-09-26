// ============================================================================
// 30-gifts-ui — Gifts UI: gift genie, preview modal, store, inventory, vault, recipient picker, craft section.
// ----------------------------------------------------------------------------
// Part of the split of the original monolithic index.html <script> block.
// Files are numbered and loaded in order; they share global scope, so statement
// order is preserved exactly (do not reorder these files).
// ============================================================================

let $c = 0, Cc = null;
const giftGenieInput = $("giftGenieInput"), giftGenieSuggestion = $("giftGenieSuggestion");
function Ec() {
  giftGenieInput && giftGenieSuggestion && (0 === giftGenieInput.value.length ? (giftGenieSuggestion.style.opacity = "1", giftGenieSuggestion.textContent = fe[$c], $c = ($c + 1) % fe.length) : giftGenieSuggestion.style.opacity = "0");
}
giftGenieInput && !Cc && (Cc = setInterval(Ec, 1500), Ec(), giftGenieInput.addEventListener("input", () => {
  giftGenieInput.value.length > 0 ? giftGenieSuggestion.style.opacity = "0" : Ec();
}));
const generateGiftBtn = $("generateGiftBtn");
let Ic = null;
function showGiftPreview(e) {
  const t = $("giftPreviewModal"), n = $("giftPreviewName"), a = $("giftPreviewPrice"), o = $("giftPreviewCategory"), i = $("giftPreviewDescription"), s = $("giftPreviewUnique");
  if (t) {
    if (n && (n.textContent = e.name), a && (a.textContent = "$" + e.price.toLocaleString()), o) {
      const t2 = ye[e.category];
      o.textContent = (t2?.emoji || "") + " " + (t2?.name || e.category);
    }
    i && (i.textContent = e.description), s && (s.style.display = "UNIQUE" === e.category ? "block" : "none"), window.currentPreviewGift = e, t.style.display = "block";
  }
}
generateGiftBtn && generateGiftBtn.addEventListener("click", async () => {
  const e = giftGenieInput?.value.trim();
  if (!e) return void showNotification("Please describe a gift!", "warning");
  const t = parseFloat($("giftBudgetLimit")?.value || "Infinity");
  Ic = { cancelled: false };
  const n = Ic;
  generateGiftBtn.disabled = true, generateGiftBtn.style.opacity = "0.6", generateGiftBtn.style.cursor = "not-allowed", generateGiftBtn.innerHTML = "\u23F3 Creating gift...";
  const a = document.createElement("button");
  a.id = "cancelGenerationBtn", a.innerHTML = "\u{1F6AB} Cancel", a.className = "btn btn--k", a.style.marginLeft = "10px", a.onclick = () => {
    n.cancelled = true, showNotification("\u{1F6AB} Generation cancelled", "info");
  }, generateGiftBtn.parentElement.appendChild(a), showNotification("\u{1F9DE}\u200D\u2642\uFE0F Gift Genie is working...", "info");
  try {
    const a2 = await generateCustomGift(e, t, n);
    if (n.cancelled) return void console.log("[Gift] Generation cancelled by user");
    window.lastGiftGenerationParams = { userDescription: e, maxBudget: t }, showGiftPreview(a2), giftGenieInput.value = "", Ec(), showNotification("\u2728 Gift created successfully!", "success");
  } catch (e2) {
    if (n.cancelled) return;
    console.error("[Gift] Generation failed:", e2), "Genie refused this request" !== e2.message && showNotification("\u274C Failed to create gift. Please try again.", "error");
  } finally {
    const e2 = $("cancelGenerationBtn");
    e2 && e2.remove(), Ic === n && (generateGiftBtn.disabled = false, generateGiftBtn.style.opacity = "1", generateGiftBtn.style.cursor = "pointer", generateGiftBtn.innerHTML = "\u2728 Create Gift", Ic = null);
  }
});
const generateGiftImageBtn = $("generateGiftImageBtn");
generateGiftImageBtn && generateGiftImageBtn.addEventListener("click", async () => {
  if (!window.currentPreviewGift) return;
  const e = window.currentPreviewGift, t = $("giftPreviewImage");
  generateGiftImageBtn.disabled = true, generateGiftImageBtn.textContent = "\u{1F3A8} Generating...";
  try {
    const n = await queuedGenerateImage(applyImageStyle(e.imagePrompt), `Gift image: ${e.name}`);
    t && (t.innerHTML = `<img src="${n}" class="img-fill">`), e.imageUrl = n;
  } catch (e2) {
    console.error("[Gift] Image generation failed:", e2), showNotification("Failed to generate image", "error");
  } finally {
    generateGiftImageBtn.disabled = false, generateGiftImageBtn.textContent = "\u{1F4F8} Generate Image";
  }
});
const approveGiftBtn = $("approveGiftBtn");
approveGiftBtn && approveGiftBtn.addEventListener("click", () => {
  if (window.currentPreviewGift && Nr(window.currentPreviewGift)) {
    $("giftPreviewModal").style.display = "none", window.currentPreviewGift = null;
    const e = $("giftPreviewImage");
    e && (e.innerHTML = "\u{1F381}"), updateGiftStore(), updateGiftInventory();
  }
});
const denyGiftBtn = $("denyGiftBtn");
denyGiftBtn && denyGiftBtn.addEventListener("click", async () => {
  if (!window.currentPreviewGift) return;
  const g = window.currentPreviewGift;
  if ("UNIQUE" === g.category && !await Ev(`Discard the one-of-a-kind "${g.name}"? You'll lose this exact version and would have to roll it again.`, "Discard One-of-a-Kind?", { type: "danger", confirmText: "Discard" })) return;
  const e = g.name;
  $("giftPreviewModal").style.display = "none", window.currentPreviewGift = null;
  const t = $("giftPreviewImage");
  t && (t.innerHTML = "\u{1F381}"), showNotification(`\u{1F5D1}\uFE0F Deleted "${e}"`, "info");
});
const redoGiftBtn = $("redoGiftBtn");
redoGiftBtn && redoGiftBtn.addEventListener("click", async () => {
  if (!window.lastGiftGenerationParams) return void showNotification("No previous generation to redo", "warning");
  if ("UNIQUE" === window.currentPreviewGift?.category && !await Ev(`Re-rolling discards the current one-of-a-kind "${window.currentPreviewGift.name}". You'll lose this exact version. Continue?`, "Re-roll One-of-a-Kind?", { type: "warning", confirmText: "Re-roll" })) return;
  const { userDescription: e, maxBudget: t } = window.lastGiftGenerationParams;
  $("giftPreviewModal").style.display = "none";
  const n = $("giftPreviewImage");
  n && (n.innerHTML = "\u{1F381}"), redoGiftBtn.disabled = true, redoGiftBtn.style.opacity = "0.6", showNotification("\u{1F504} Regenerating gift with same prompt...", "info");
  const a = { cancelled: false };
  try {
    const n2 = await generateCustomGift(e, t, a);
    if (a.cancelled) return void console.log("[Gift] Regeneration cancelled by user");
    showGiftPreview(n2), showNotification("\u2728 New gift generated!", "success");
  } catch (e2) {
    console.error("[Gift] Regeneration failed:", e2), "Genie refused this request" !== e2.message && showNotification("\u274C Failed to regenerate gift. Please try again.", "error");
  } finally {
    redoGiftBtn.disabled = false, redoGiftBtn.style.opacity = "1";
  }
});
let Mc = null, Pc = null;
function updateGiftStore() {
  const e = $("giftStoreGrid"), t = $("giftStoreCount");
  if (!e) return;
  gameState.giftStore || (gameState.giftStore = { items: [] });
  const n = JSON.stringify(gameState.giftStore.items.map((e2) => e2.id));
  n !== Mc && (Mc = n, t && (t.textContent = gameState.giftStore.items.length), 0 !== gameState.giftStore.items.length ? (e.innerHTML = "", gameState.giftStore.items.forEach((t2) => {
    const n2 = ye[t2.category], a = document.createElement("div");
    a.className = "gift-card" + ("UNIQUE" === t2.category ? " gift-card--unique" : ""), a.innerHTML = ` <div class="gift-thumb">${t2.imageUrl ? `<img src="${t2.imageUrl}" alt="">` : n2?.emoji || "\u{1F381}"}${"UNIQUE" === t2.category ? '<span class="gift-badge">\u2B50 Unique</span>' : ""}</div> <div class="gift-body"> <div class="gift-name" title="${t2.name}">${t2.name}</div> <div class="gift-cat">${n2?.emoji || ""} ${n2?.name || t2.category}</div> <div class="gift-price-row"><span class="gift-price num">$${xu(t2.price)}</span></div> <div class="gift-actions"><button onclick="purchaseGiftFromStore('${t2.id}')" class="btn btn--fg w-full">\u{1F4B0} Purchase</button></div> </div>`, e.appendChild(a);
  })) : e.innerHTML = ' <div class="text-center text-dim" style="grid-column:1/-1; padding:40px;"> <div class="mb-1" style="font-size:3rem;">\u{1F3EA}</div> <p class="mt-0 mb-1">No gifts in store yet!</p> <p class="mt-0 mb-0 fs-sm">Use the Gift Genie above to create and approve gifts.</p> </div> ');
}
const Ac = { search: "", category: "all", sort: "date", view: "all", bulk: false, selected: /* @__PURE__ */ new Set() };
let Lc = null, Nc = "store";
function _c() {
  let items = (gameState.giftInventory?.items || []).filter((i) => !i.vaulted);
  "fav" === Ac.view && (items = items.filter((i) => i.isFavorite)), "all" !== Ac.category && (items = items.filter((i) => i.category === Ac.category));
  const q = Ac.search.trim().toLowerCase();
  q && (items = items.filter((i) => (i.name || "").toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q)));
  const u2 = (c) => "UNIQUE" === c ? 5 : "LUXURY" === c ? 4 : "EXPERIENCES" === c ? 3 : "ROMANTIC" === c || "TECH" === c ? 2 : 1;
  return items.sort((a, b) => {
    switch (Ac.sort) {
      case "value":
        return (b.price || 0) - (a.price || 0);
      case "type":
        return (a.category || "").localeCompare(b.category || "");
      case "rarity":
        return u2(b.category) - u2(a.category) || (b.price || 0) - (a.price || 0);
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      default:
        return (b.purchasedAt || b.addedAt || b.stockedAt || 0) - (a.purchasedAt || a.addedAt || a.stockedAt || 0);
    }
  }), items.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
}
function Rc() {
  const host = $("giftInvControls");
  if (!host) return;
  const h = `${Ac.view}|${Ac.bulk ? 1 : 0}`;
  if (host.children.length && h === Lc) return;
  Lc = h;
  const u2 = ['<option value="all">All categories</option>'].concat(Object.keys(ye).map((c) => `<option value="${c}"${Ac.category === c ? " selected" : ""}>${ye[c].emoji} ${ye[c].name}</option>`)).join(""), G2 = [["date", "Newest"], ["value", "Value"], ["type", "Type"], ["rarity", "Rarity"], ["name", "Name"]].map(([v, l]) => `<option value="${v}"${Ac.sort === v ? " selected" : ""}>${l}</option>`).join(""), seg = [["all", "All"], ["fav", "\u2605 Favorites"]].map(([v, l]) => `<button${Ac.view === v ? ' class="is-active"' : ""} onclick="setGiftInvView('${v}')">${l}</button>`).join("");
  host.innerHTML = ` <div class="gift-inv-bar"> <input type="text" class="input gift-inv-search" placeholder="\u{1F50D} Search gifts..." value="${Ac.search.replace(/"/g, "&quot;")}" oninput="setGiftInvSearch(this.value)"> <select class="select gift-inv-select" onchange="setGiftInvCategory(this.value)">${u2}</select> <select class="select gift-inv-select" onchange="setGiftInvSort(this.value)">${G2}</select> <button class="btn ${Ac.bulk ? "btn--be" : "btn--outline"}" onclick="toggleGiftBulk()">\u2611\uFE0F Bulk</button> </div> <div class="seg gift-inv-seg">${seg}</div>`;
}
function Dc() {
  const host = $("giftInvBulkBar");
  host && (Ac.bulk ? host.innerHTML = ` <div class="gift-bulk-bar"> <span class="text-dim fs-sm num">${Ac.selected.size}</span><span class="text-dim fs-sm">selected</span> <button class="btn btn--aj" onclick="bulkSelectAllVisible()">Select all</button> <button class="btn btn--aj" onclick="bulkClearGiftSelection()">Clear</button> <span class="gift-bulk-spacer"></span> <button class="btn btn--k" onclick="bulkSellSelectedGifts()">\u{1F4B0} Sell selected</button> <button class="btn btn--outline" onclick="bulkDiscardDuplicateGifts()">\u{1F9F9} Discard dupes</button> </div>` : host.innerHTML = "");
}
function Oc(e) {
  const t = ye[e.category], sel = Ac.selected.has(e.id), fav = e.isFavorite, badge = e.vaulted ? '<span class="gift-badge">\u{1F512} Vaulted</span>' : "UNIQUE" === e.category ? '<span class="gift-badge">\u2B50 Unique</span>' : "", tags = (e.personalizedFor ? ` \xB7 <span class="text-gold">\u{1F49D} ${e.personalizedForName || "Personalized"}</span>` : "") + (e.crafted && !e.personalizedFor ? ' \xB7 <span class="text-accent">\u{1F6E0}\uFE0F Crafted</span>' : "");
  return ` <div class="gift-card gift-card--inv${e.vaulted ? " gift-card--vault" : ""}${Ac.bulk && sel ? " is-selected" : ""}"> <div class="gift-thumb"> ${e.imageUrl ? `<img src="${e.imageUrl}" alt="">` : t?.emoji || "\u{1F381}"}
            ${Ac.bulk ? `<label class="gift-sel-box"><input type="checkbox" ${sel ? "checked" : ""} onchange="toggleGiftInvSelect('${e.id}')"></label>` : ""} <button class="gift-thumb-btn" title="${fav ? "Unfavorite" : "Favorite"}" onclick="toggleGiftFavorite('${e.id}')">${fav ? "\u2605" : "\u2606"}</button> ${badge} </div> <div class="gift-body"> <div class="gift-name" title="${e.name}">${e.name}</div> <div class="gift-cat">${t?.emoji || ""} ${t?.name || e.category}${tags}</div> ${e.description ? `<div class="gift-desc" title="${Xg(e.description)}">${e.description}</div>` : ""} <div class="gift-price-row"><span class="gift-price num">$${e.price.toLocaleString()}</span><span class="gift-qty num">\xD7${e.quantity || 1}</span></div> <div class="gift-actions"> <button onclick="openGiftRecipientModal('${e.id}')" class="btn btn--fg w-full">\u{1F381} Give to\u2026</button> ${e.vaulted ? `<button onclick="toggleGiftVault('${e.id}')" class="btn btn--outline w-full" style="--hk: var(--m)">\u{1F513} Unvault</button>` : `<div class="row"> <button onclick="regenerateGiftImage('${e.id}')" class="btn btn--aj flex-1" title="${e.imageUrl ? "Regenerate this gift's image" : "Generate an image for this gift"}">\u{1F3A8} ${e.imageUrl ? "Re-image" : "Add image"}</button> <button onclick="regenerateGiftDescription('${e.id}')" class="btn btn--aj flex-1" title="Rewrite this gift's description">\u{1F4DD} Rewrite</button> </div> <div class="row"> <button onclick="toggleGiftVault('${e.id}')" class="btn btn--outline flex-1" style="--hk: var(--m)" title="Move to vault">\u{1F512} Vault</button> <button onclick="deleteGiftFromInventory('${e.id}')" class="btn btn--k flex-1" title="Delete">\u{1F5D1}\uFE0F Delete</button> </div>`} </div> </div> </div>`;
}
function Bc() {
  const e = $("giftInventoryGrid"), t = $("giftInventoryCount"), n = $("giftScaleInfo"), a = $("recommendedGiftRange");
  if (!e) return;
  const total = gameState.giftInventory.items.filter((i) => !i.vaulted).length, visible = _c(), o = JSON.stringify({ s: Ac.sort, c: Ac.category, q: Ac.search, v: Ac.view, b: Ac.bulk ? 1 : 0, items: visible.map((e2) => `${e2.id}:${e2.quantity || 1}:${e2.vaulted ? 1 : 0}:${e2.isFavorite ? 1 : 0}:${Ac.selected.has(e2.id) ? 1 : 0}`) });
  if (o !== Pc) {
    if (Pc = o, t && (t.textContent = total), n && a) {
      const s = Pr();
      a.textContent = `$${Math.round(s.minRecommended).toLocaleString()} - $${Math.round(s.maxRecommended).toLocaleString()}`;
    }
    Dc(), e.innerHTML = 0 === total ? ' <div class="text-center text-dim" style="grid-column:1/-1; padding:60px 20px; font-size:1.1rem;"> Your inventory is empty. Create gifts above to get started! \u2728 </div> ' : 0 === visible.length ? ' <div class="empty-note" style="grid-column:1/-1; padding:40px 20px;">No gifts match your filters.</div> ' : visible.map(Oc).join("");
  }
}
function updateGiftInventory() {
  $("giftInventoryGrid") && (gameState.giftInventory || (gameState.giftInventory = { items: [], capacity: 1 / 0 }), Rc(), Bc());
}
function Fc() {
  const host = $("giftVaultGrid"), u2 = $("giftVaultCount");
  if (!host) return;
  const items = (gameState.giftInventory?.items || []).filter((i) => i.vaulted);
  u2 && (u2.textContent = items.length), host.innerHTML = items.length ? items.map(Oc).join("") : ' <div class="empty-note" style="grid-column:1/-1; padding:60px 20px;">Your vault is empty. Use \u{1F512} Vault on any gift to protect it from regeneration, deletion, and bulk-sell.</div> ';
}
window.setGiftPane = function(pane) {
  Nc = pane;
  Object.entries({ store: "giftPaneStore", inventory: "giftPaneInventory", vault: "giftPaneVault", craft: "giftCraftSection" }).forEach(([k, id]) => {
    const u2 = $(id);
    u2 && (u2.hidden = k !== pane);
  }), document.querySelectorAll("#giftPaneSeg button").forEach((b, i) => b.classList.toggle("is-active", ["store", "inventory", "vault", "craft"][i] === pane)), "inventory" === pane ? updateGiftInventory() : "vault" === pane ? Fc() : "craft" === pane ? Hc() : updateGiftStore();
}, window.setGiftInvSearch = function(v) {
  Ac.search = v || "", Bc();
}, window.setGiftInvCategory = function(v) {
  Ac.category = v || "all", Bc();
}, window.setGiftInvSort = function(v) {
  Ac.sort = v || "date", Bc();
}, window.setGiftInvView = function(v) {
  Ac.view = v || "all", Rc(), Bc();
}, window.toggleGiftBulk = function() {
  Ac.bulk = !Ac.bulk, Ac.bulk || Ac.selected.clear(), Rc(), Bc();
}, window.toggleGiftInvSelect = function(e) {
  Ac.selected.has(e) ? Ac.selected.delete(e) : Ac.selected.add(e), Bc();
}, window.bulkSelectAllVisible = function() {
  _c().forEach((i) => Ac.selected.add(i.id)), Bc();
}, window.bulkClearGiftSelection = function() {
  Ac.selected.clear(), Bc();
}, window.toggleGiftFavorite = function(e) {
  const t = gameState.giftInventory.items.find((t2) => t2.id === e);
  t && (t.isFavorite = !t.isFavorite, Bc(), "function" == typeof saveGame && saveGame(false));
}, window.bulkSellSelectedGifts = async function() {
  const u2 = [...Ac.selected], items = gameState.giftInventory.items.filter((i) => u2.includes(i.id) && !i.vaulted);
  if (!items.length) return void showNotification("Nothing to sell \u2014 vaulted gifts are protected.", "warning");
  let G2 = 0;
  if (items.forEach((i) => G2 += Math.round(0.5 * (i.price || 0)) * (i.quantity || 1)), !await Ev(`Sell ${items.length} gift type(s) for $${G2.toLocaleString()} (50% of value)? Vaulted gifts are skipped.`, "Sell Gifts", { type: "warning", confirmText: "Sell" })) return;
  const U2 = items.map((i) => i.id);
  gameState.giftInventory.items = gameState.giftInventory.items.filter((i) => !U2.includes(i.id)), gameState.cash += G2, Ac.selected.clear(), Bc(), updateUI(), "function" == typeof saveGame && saveGame(false), showNotification(`\u{1F4B0} Sold ${items.length} gift(s) for $${G2.toLocaleString()}`, "success");
}, window.bulkDiscardDuplicateGifts = async function() {
  const u2 = gameState.giftInventory.items.filter((i) => !i.vaulted && (i.quantity || 1) > 1);
  if (!u2.length) return void showNotification("No duplicate copies to discard.", "info");
  let G2 = 0, count = 0;
  u2.forEach((i) => {
    const extra = (i.quantity || 1) - 1;
    G2 += Math.round(0.5 * (i.price || 0)) * extra, count += extra;
  }), await Ev(`Discard ${count} duplicate copies for $${G2.toLocaleString()} back (50%)? One of each is kept; vaulted gifts untouched.`, "Discard Duplicates", { type: "warning", confirmText: "Discard" }) && (u2.forEach((i) => i.quantity = 1), gameState.cash += G2, Bc(), updateUI(), "function" == typeof saveGame && saveGame(false), showNotification(`\u{1F9F9} Discarded ${count} duplicate(s) for $${G2.toLocaleString()}`, "success"));
};
let jc = { giftId: null, npcId: null };
function qc(gift) {
  const grid = $("giftRecipientGrid"), empty = $("giftRecipientEmpty");
  if (!grid) return;
  const u2 = (gameState.employees || []).filter((e) => false !== e.hired);
  if (!u2.length) return grid.style.display = "none", void (empty && (empty.style.display = "block"));
  grid.style.display = "grid", empty && (empty.style.display = "none"), grid.innerHTML = u2.map((e) => {
    const u3 = qr(e, gift), img = e.profileImage || e.generatedPortrait || "", G2 = img && (img.startsWith("http") || img.startsWith("data:")), init = (e.name || "?").split(" ").map((s) => s[0]).slice(0, 2).join("");
    return ` <div class="gift-recipient-card" data-id="${e.id}" onclick="selectGiftRecipient('${e.id}')"> <div class="avatar-sm">${G2 ? `<img src="${img}" alt="">` : `<span class="init">${init}</span>`}</div> <div class="grc-meta"> <div class="grc-name">${e.name}</div> <div class="text-mute fs-xs">${e.position || e.role || "Employee"}</div> </div> <span class="chip ${u3.cls}"><span>${u3.emoji}</span><span class="lbl">${u3.label}</span></span> </div>`;
  }).join("");
}
window.openGiftRecipientModal = function(u2) {
  const gift = gameState.giftInventory?.items.find((i) => i.id === u2);
  if (!gift) return void showNotification("Gift not found.", "error");
  jc = { giftId: u2, npcId: null };
  const G2 = $("giftRecipientGiftName");
  G2 && (G2.textContent = `${gift.name} \u2014 $${gift.price.toLocaleString()}`), qc(gift);
  const send = $("giftRecipientSendBtn");
  send && (send.disabled = true);
  const msg = $("giftRecipientMessage");
  msg && (msg.value = "");
  const modal = $("giftRecipientModal");
  modal && (modal.style.display = "flex");
}, window.selectGiftRecipient = function(id) {
  jc.npcId = id, document.querySelectorAll("#giftRecipientGrid .gift-recipient-card").forEach((c) => c.classList.toggle("is-selected", c.dataset.id === id));
  const send = $("giftRecipientSendBtn");
  send && (send.disabled = false);
}, window.closeGiftRecipientModal = function() {
  const modal = $("giftRecipientModal");
  modal && (modal.style.display = "none"), jc = { giftId: null, npcId: null };
}, window.confirmGiftRecipient = async function() {
  const { giftId: u2, npcId: G2 } = jc;
  if (!u2 || !G2) return;
  const gift = gameState.giftInventory.items.find((i) => i.id === u2), npc = gameState.employees.find((e) => e.id === G2);
  if (!gift || !npc) return void showNotification("Gift or recipient missing.", "error");
  const U2 = $("giftRecipientMessage"), msg = U2 ? U2.value.trim() : "", snapshot = { ...gift };
  closeGiftRecipientModal();
  const inv = gameState.giftInventory.items.find((i) => i.id === u2);
  inv && (inv.quantity = (inv.quantity || 1) - 1, inv.quantity <= 0 && (gameState.giftInventory.items = gameState.giftInventory.items.filter((i) => i.id !== u2)));
  const cat = ye[snapshot.category], J2 = gameState.chatHistory[npc.id] || [];
  J2.push({ sender: "player", content: msg || "\u{1F381} Gave a gift", timestamp: gameState.time?.currentTime || Date.now(), isPlayer: true, giftData: { name: snapshot.name, price: snapshot.price, category: snapshot.category, categoryName: cat?.name || snapshot.category, categoryEmoji: cat?.emoji || "\u{1F381}", description: snapshot.description, imageUrl: snapshot.imageUrl } }), gameState.chatHistory[npc.id] = J2, showNotification(`\u{1F381} Giving ${snapshot.name} to ${npc.name}\u2026`, "info"), await giveGiftToEmployee(npc.id, snapshot, msg), Pc = null, "function" == typeof updateGiftInventory && updateGiftInventory(), updateUI(), gameState.activeChat && gameState.activeChat.id === npc.id && "function" == typeof refreshChatDisplay && refreshChatDisplay();
};
const zc = (c) => "UNIQUE" === c ? 5 : "LUXURY" === c ? 4 : "EXPERIENCES" === c ? 3 : "ROMANTIC" === c || "TECH" === c ? 2 : 1;
let Gc = null;
function Hc() {
  if (!$("giftCraftSection")) return;
  const items = (gameState.giftInventory?.items || []).filter((i) => !i.vaulted), u2 = (gameState.employees || []).filter((e) => false !== e.hired), h = JSON.stringify({ i: items.map((i) => `${i.id}:${i.quantity || 1}`), e: u2.map((e) => e.id) });
  if (h === Gc) return;
  Gc = h;
  const G2 = (sel2) => ['<option value="">\u2014 select a gift \u2014</option>'].concat(items.map((i) => `<option value="${i.id}"${sel2 === i.id ? " selected" : ""}>${i.name} ($${(i.price || 0).toLocaleString()})${(i.quantity || 1) > 1 ? " \xD7" + i.quantity : ""}</option>`)).join(""), A = $("craftCombineA"), B = $("craftCombineB"), PG = $("craftPersGift"), U2 = $("craftPersNpc");
  var sel;
  A && (A.innerHTML = G2(A.value)), B && (B.innerHTML = G2(B.value)), PG && (PG.innerHTML = G2(PG.value)), U2 && (U2.innerHTML = (sel = U2.value, ['<option value="">\u2014 select a person \u2014</option>'].concat(u2.map((e) => `<option value="${e.id}"${sel === e.id ? " selected" : ""}>${e.name}</option>`)).join(""))), updateCraftCombineInfo(), updateCraftPersInfo();
}
