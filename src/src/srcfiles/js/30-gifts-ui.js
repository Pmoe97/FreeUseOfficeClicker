// ============================================================================
// 30-gifts-ui — Gifts UI: gift genie, preview modal, store, inventory, vault, recipient picker, craft section.
// ----------------------------------------------------------------------------
// Loaded in order by index.html; every file shares one global scope. Code that
// runs at LOAD time may only use names declared in this file or an earlier one
// (function hoisting does not cross files). Do not reorder these files.
// ============================================================================

let currentSuggestionIndex = 0,
    suggestionIntervalId = null;
const giftGenieInput = $("giftGenieInput"),
    giftGenieSuggestion = $("giftGenieSuggestion");
function cycleSuggestions() {
    giftGenieInput &&
        giftGenieSuggestion &&
        (0 === giftGenieInput.value.length
            ? ((giftGenieSuggestion.style.opacity = "1"),
              (giftGenieSuggestion.textContent = GIFT_SUGGESTIONS[currentSuggestionIndex]),
              (currentSuggestionIndex = (currentSuggestionIndex + 1) % GIFT_SUGGESTIONS.length))
            : (giftGenieSuggestion.style.opacity = "0"));
}
giftGenieInput &&
    !suggestionIntervalId &&
    ((suggestionIntervalId = setInterval(cycleSuggestions, 1500)),
    cycleSuggestions(),
    giftGenieInput.addEventListener("input", () => {
        giftGenieInput.value.length > 0 ? (giftGenieSuggestion.style.opacity = "0") : cycleSuggestions();
    }));
const generateGiftBtn = $("generateGiftBtn");
let currentGenerationController = null;
function showGiftPreview(e) {
    const t = $("giftPreviewModal"),
        n = $("giftPreviewName"),
        a = $("giftPreviewPrice"),
        o = $("giftPreviewCategory"),
        i = $("giftPreviewDescription"),
        s = $("giftPreviewUnique");
    if (t) {
        if ((n && (n.textContent = e.name), a && (a.textContent = "$" + e.price.toLocaleString()), o)) {
            const t = GIFT_CATEGORIES[e.category];
            o.textContent = (t?.emoji || "") + " " + (t?.name || e.category);
        }
        i && (i.textContent = e.description),
            s && (s.style.display = "UNIQUE" === e.category ? "block" : "none"),
            (window.currentPreviewGift = e),
            (t.style.display = "block");
    }
}
generateGiftBtn &&
    generateGiftBtn.addEventListener("click", async () => {
        const e = giftGenieInput?.value.trim();
        if (!e) return void showNotification("Please describe a gift!", "warning");
        const t = parseFloat($("giftBudgetLimit")?.value || "Infinity");
        currentGenerationController = { cancelled: !1 };
        const n = currentGenerationController;
        (generateGiftBtn.disabled = !0),
            (generateGiftBtn.style.opacity = "0.6"),
            (generateGiftBtn.style.cursor = "not-allowed"),
            (generateGiftBtn.innerHTML = "⏳ Creating gift...");
        const a = document.createElement("button");
        (a.id = "cancelGenerationBtn"),
            (a.innerHTML = "🚫 Cancel"),
            (a.className = "btn btn--danger"),
            (a.style.marginLeft = "10px"),
            (a.onclick = () => {
                (n.cancelled = !0), showNotification("🚫 Generation cancelled", "info");
            }),
            generateGiftBtn.parentElement.appendChild(a),
            showNotification("🧞‍♂️ Gift Genie is working...", "info");
        try {
            const a = await generateCustomGift(e, t, n);
            if (n.cancelled) return void console.log("[Gift] Generation cancelled by user");
            (window.lastGiftGenerationParams = { userDescription: e, maxBudget: t }),
                showGiftPreview(a),
                (giftGenieInput.value = ""),
                cycleSuggestions(),
                showNotification("✨ Gift created successfully!", "success");
        } catch (e) {
            if (n.cancelled) return;
            console.error("[Gift] Generation failed:", e),
                "Genie refused this request" !== e.message &&
                    showNotification("❌ Failed to create gift. Please try again.", "error");
        } finally {
            const e = $("cancelGenerationBtn");
            e && e.remove(),
                currentGenerationController === n &&
                    ((generateGiftBtn.disabled = !1),
                    (generateGiftBtn.style.opacity = "1"),
                    (generateGiftBtn.style.cursor = "pointer"),
                    (generateGiftBtn.innerHTML = "✨ Create Gift"),
                    (currentGenerationController = null));
        }
    });
const generateGiftImageBtn = $("generateGiftImageBtn");
generateGiftImageBtn &&
    generateGiftImageBtn.addEventListener("click", async () => {
        if (!window.currentPreviewGift) return;
        const e = window.currentPreviewGift,
            t = $("giftPreviewImage");
        (generateGiftImageBtn.disabled = !0), (generateGiftImageBtn.textContent = "🎨 Generating...");
        try {
            const n = await queuedGenerateImage(applyImageStyle(e.imagePrompt), `Gift image: ${e.name}`);
            t && (t.innerHTML = `<img src="${n}" class="img-fill">`), (e.imageUrl = n);
        } catch (e) {
            console.error("[Gift] Image generation failed:", e),
                showNotification("Failed to generate image", "error");
        } finally {
            (generateGiftImageBtn.disabled = !1), (generateGiftImageBtn.textContent = "📸 Generate Image");
        }
    });
const approveGiftBtn = $("approveGiftBtn");
approveGiftBtn &&
    approveGiftBtn.addEventListener("click", () => {
        if (!window.currentPreviewGift) return;
        if (addGiftToStore(window.currentPreviewGift)) {
            ($("giftPreviewModal").style.display = "none"), (window.currentPreviewGift = null);
            const e = $("giftPreviewImage");
            e && (e.innerHTML = "🎁"), updateGiftStore(), updateGiftInventory();
        }
    });
const denyGiftBtn = $("denyGiftBtn");
denyGiftBtn &&
    denyGiftBtn.addEventListener("click", async () => {
        if (!window.currentPreviewGift) return;
        const g = window.currentPreviewGift;
        if (
            "UNIQUE" === g.category &&
            !(await showConfirm(
                `Discard the one-of-a-kind "${g.name}"? You'll lose this exact version and would have to roll it again.`,
                "Discard One-of-a-Kind?",
                { type: "danger", confirmText: "Discard" }
            ))
        )
            return;
        const e = g.name;
        ($("giftPreviewModal").style.display = "none"), (window.currentPreviewGift = null);
        const t = $("giftPreviewImage");
        t && (t.innerHTML = "🎁"), showNotification(`🗑️ Deleted "${e}"`, "info");
    });
const redoGiftBtn = $("redoGiftBtn");
redoGiftBtn &&
    redoGiftBtn.addEventListener("click", async () => {
        if (!window.lastGiftGenerationParams)
            return void showNotification("No previous generation to redo", "warning");
        if (
            "UNIQUE" === window.currentPreviewGift?.category &&
            !(await showConfirm(
                `Re-rolling discards the current one-of-a-kind "${window.currentPreviewGift.name}". You'll lose this exact version. Continue?`,
                "Re-roll One-of-a-Kind?",
                { type: "warning", confirmText: "Re-roll" }
            ))
        )
            return;
        const { userDescription: e, maxBudget: t } = window.lastGiftGenerationParams;
        $("giftPreviewModal").style.display = "none";
        const n = $("giftPreviewImage");
        n && (n.innerHTML = "🎁"),
            (redoGiftBtn.disabled = !0),
            (redoGiftBtn.style.opacity = "0.6"),
            showNotification("🔄 Regenerating gift with same prompt...", "info");
        const a = { cancelled: !1 };
        try {
            const n = await generateCustomGift(e, t, a);
            if (a.cancelled) return void console.log("[Gift] Regeneration cancelled by user");
            showGiftPreview(n), showNotification("✨ New gift generated!", "success");
        } catch (e) {
            console.error("[Gift] Regeneration failed:", e),
                "Genie refused this request" !== e.message &&
                    showNotification("❌ Failed to regenerate gift. Please try again.", "error");
        } finally {
            (redoGiftBtn.disabled = !1), (redoGiftBtn.style.opacity = "1");
        }
    });
let lastStoreRenderHash = null,
    lastInventoryRenderHash = null;
function updateGiftStore() {
    const e = $("giftStoreGrid"),
        t = $("giftStoreCount");
    if (!e) return;
    gameState.giftStore || (gameState.giftStore = { items: [] });
    const n = JSON.stringify(gameState.giftStore.items.map((e) => e.id));
    n !== lastStoreRenderHash &&
        ((lastStoreRenderHash = n),
        t && (t.textContent = gameState.giftStore.items.length),
        0 !== gameState.giftStore.items.length
            ? ((e.innerHTML = ""),
              gameState.giftStore.items.forEach((t) => {
                  const n = GIFT_CATEGORIES[t.category],
                      a = document.createElement("div");
                  a.className = "gift-card" + ("UNIQUE" === t.category ? " gift-card--unique" : "");
                  a.innerHTML = `
        <div class="gift-thumb">${t.imageUrl ? `<img src="${t.imageUrl}" alt="">` : n?.emoji || "🎁"}${"UNIQUE" === t.category ? '<span class="gift-badge">⭐ Unique</span>' : ""}</div>
        <div class="gift-body">
          <div class="gift-name" title="${t.name}">${t.name}</div>
          <div class="gift-cat">${n?.emoji || ""} ${n?.name || t.category}</div>
          <div class="gift-price-row"><span class="gift-price num">$${formatCash(t.price)}</span></div>
          <div class="gift-actions"><button onclick="purchaseGiftFromStore('${t.id}')" class="btn btn--pos w-full">💰 Purchase</button></div>
        </div>`,
                      e.appendChild(a);
              }))
            : (e.innerHTML =
                  '\n        <div class="text-center text-dim" style="grid-column:1/-1; padding:40px;">\n          <div class="mb-1" style="font-size:3rem;">🏪</div>\n          <p class="mt-0 mb-1">No gifts in store yet!</p>\n          <p class="mt-0 mb-0 fs-sm">Use the Gift Genie above to create and approve gifts.</p>\n        </div>\n      '));
}
// ---- Inventory management: filter / sort / search / favorite / bulk ----
const giftInvState = { search: "", category: "all", sort: "date", view: "all", bulk: !1, selected: new Set() };
let lastInvControlsHash = null,
    giftPane = "store";
// Vaulted gifts live in their own pane, so the Inventory pane always excludes them.
function getVisibleInventory() {
    let items = (gameState.giftInventory?.items || []).filter((i) => !i.vaulted);
    "fav" === giftInvState.view && (items = items.filter((i) => i.isFavorite));
    "all" !== giftInvState.category && (items = items.filter((i) => i.category === giftInvState.category));
    const q = giftInvState.search.trim().toLowerCase();
    q &&
        (items = items.filter(
            (i) => (i.name || "").toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q)
        ));
    const rank = (c) =>
        "UNIQUE" === c ? 5 : "LUXURY" === c ? 4 : "EXPERIENCES" === c ? 3 : "ROMANTIC" === c || "TECH" === c ? 2 : 1;
    return (
        items.sort((a, b) => {
            switch (giftInvState.sort) {
                case "value":
                    return (b.price || 0) - (a.price || 0);
                case "type":
                    return (a.category || "").localeCompare(b.category || "");
                case "rarity":
                    return rank(b.category) - rank(a.category) || (b.price || 0) - (a.price || 0);
                case "name":
                    return (a.name || "").localeCompare(b.name || "");
                default:
                    return (b.purchasedAt || b.addedAt || b.stockedAt || 0) - (a.purchasedAt || a.addedAt || a.stockedAt || 0);
            }
        }),
        items.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))
    );
}
function renderGiftInventoryControls() {
    const host = $("giftInvControls");
    if (!host) return;
    // Only rebuild when the view/bulk toggles change (so typing in search never steals focus).
    const h = `${giftInvState.view}|${giftInvState.bulk ? 1 : 0}`;
    if (host.children.length && h === lastInvControlsHash) return;
    lastInvControlsHash = h;
    const catOpts = ['<option value="all">All categories</option>']
            .concat(
                Object.keys(GIFT_CATEGORIES).map(
                    (c) =>
                        `<option value="${c}"${giftInvState.category === c ? " selected" : ""}>${GIFT_CATEGORIES[c].emoji} ${GIFT_CATEGORIES[c].name}</option>`
                )
            )
            .join(""),
        sortOpts = [
            ["date", "Newest"],
            ["value", "Value"],
            ["type", "Type"],
            ["rarity", "Rarity"],
            ["name", "Name"],
        ]
            .map(([v, l]) => `<option value="${v}"${giftInvState.sort === v ? " selected" : ""}>${l}</option>`)
            .join(""),
        seg = [
            ["all", "All"],
            ["fav", "★ Favorites"],
        ]
            .map(
                ([v, l]) =>
                    `<button${giftInvState.view === v ? ' class="is-active"' : ""} onclick="setGiftInvView('${v}')">${l}</button>`
            )
            .join("");
    host.innerHTML = `
        <div class="gift-inv-bar">
          <input type="text" class="input gift-inv-search" placeholder="🔍 Search gifts..." value="${giftInvState.search.replace(/"/g, "&quot;")}" oninput="setGiftInvSearch(this.value)">
          <select class="select gift-inv-select" onchange="setGiftInvCategory(this.value)">${catOpts}</select>
          <select class="select gift-inv-select" onchange="setGiftInvSort(this.value)">${sortOpts}</select>
          <button class="btn ${giftInvState.bulk ? "btn--primary" : "btn--outline"}" onclick="toggleGiftBulk()">☑️ Bulk</button>
        </div>
        <div class="seg gift-inv-seg">${seg}</div>`;
}
function renderGiftBulkBar() {
    const host = $("giftInvBulkBar");
    if (!host) return;
    if (!giftInvState.bulk) return void (host.innerHTML = "");
    host.innerHTML = `
        <div class="gift-bulk-bar">
          <span class="text-dim fs-sm num">${giftInvState.selected.size}</span><span class="text-dim fs-sm">selected</span>
          <button class="btn btn--ghost" onclick="bulkSelectAllVisible()">Select all</button>
          <button class="btn btn--ghost" onclick="bulkClearGiftSelection()">Clear</button>
          <span class="gift-bulk-spacer"></span>
          <button class="btn btn--danger" onclick="bulkSellSelectedGifts()">💰 Sell selected</button>
          <button class="btn btn--outline" onclick="bulkDiscardDuplicateGifts()">🧹 Discard dupes</button>
        </div>`;
}
function giftInvCard(e) {
    const t = GIFT_CATEGORIES[e.category],
        sel = giftInvState.selected.has(e.id),
        fav = e.isFavorite,
        badge = e.vaulted
            ? '<span class="gift-badge">🔒 Vaulted</span>'
            : "UNIQUE" === e.category
              ? '<span class="gift-badge">⭐ Unique</span>'
              : "",
        tags =
            (e.personalizedFor ? ` · <span class="text-gold">💝 ${e.personalizedForName || "Personalized"}</span>` : "") +
            (e.crafted && !e.personalizedFor ? ' · <span class="text-accent">🛠️ Crafted</span>' : "");
    return `
        <div class="gift-card gift-card--inv${e.vaulted ? " gift-card--vault" : ""}${giftInvState.bulk && sel ? " is-selected" : ""}">
          <div class="gift-thumb">
            ${e.imageUrl ? `<img src="${e.imageUrl}" alt="">` : t?.emoji || "🎁"}
            ${giftInvState.bulk ? `<label class="gift-sel-box"><input type="checkbox" ${sel ? "checked" : ""} onchange="toggleGiftInvSelect('${e.id}')"></label>` : ""}
            <button class="gift-thumb-btn" title="${fav ? "Unfavorite" : "Favorite"}" onclick="toggleGiftFavorite('${e.id}')">${fav ? "★" : "☆"}</button>
            ${badge}
          </div>
          <div class="gift-body">
            <div class="gift-name" title="${e.name}">${e.name}</div>
            <div class="gift-cat">${t?.emoji || ""} ${t?.name || e.category}${tags}</div>
            ${e.description ? `<div class="gift-desc" title="${jsAttr(e.description)}">${e.description}</div>` : ""}
            <div class="gift-price-row"><span class="gift-price num">$${e.price.toLocaleString()}</span><span class="gift-qty num">×${e.quantity || 1}</span></div>
            <div class="gift-actions">
              <button onclick="openGiftRecipientModal('${e.id}')" class="btn btn--pos w-full">🎁 Give to…</button>
              ${
                  e.vaulted
                      ? `<button onclick="toggleGiftVault('${e.id}')" class="btn btn--outline w-full" style="--btn-edge: var(--accent-gold)">🔓 Unvault</button>`
                      : `<div class="row">
                <button onclick="regenerateGiftImage('${e.id}')" class="btn btn--ghost flex-1" title="${e.imageUrl ? "Regenerate this gift's image" : "Generate an image for this gift"}">🎨 ${e.imageUrl ? "Re-image" : "Add image"}</button>
                <button onclick="regenerateGiftDescription('${e.id}')" class="btn btn--ghost flex-1" title="Rewrite this gift's description">📝 Rewrite</button>
              </div>
              <div class="row">
                <button onclick="toggleGiftVault('${e.id}')" class="btn btn--outline flex-1" style="--btn-edge: var(--accent-gold)" title="Move to vault">🔒 Vault</button>
                <button onclick="deleteGiftFromInventory('${e.id}')" class="btn btn--danger flex-1" title="Delete">🗑️ Delete</button>
              </div>`
              }
            </div>
          </div>
        </div>`;
}
function renderGiftInventoryGrid() {
    const e = $("giftInventoryGrid"),
        t = $("giftInventoryCount"),
        n = $("giftScaleInfo"),
        a = $("recommendedGiftRange");
    if (!e) return;
    const total = gameState.giftInventory.items.filter((i) => !i.vaulted).length,
        visible = getVisibleInventory(),
        o = JSON.stringify({
            s: giftInvState.sort,
            c: giftInvState.category,
            q: giftInvState.search,
            v: giftInvState.view,
            b: giftInvState.bulk ? 1 : 0,
            items: visible.map(
                (e) =>
                    `${e.id}:${e.quantity || 1}:${e.vaulted ? 1 : 0}:${e.isFavorite ? 1 : 0}:${giftInvState.selected.has(e.id) ? 1 : 0}`
            ),
        });
    if (o === lastInventoryRenderHash) return;
    lastInventoryRenderHash = o;
    t && (t.textContent = total);
    if (n && a) {
        const s = calculateGiftPriceScale();
        a.textContent = `$${Math.round(s.minRecommended).toLocaleString()} - $${Math.round(s.maxRecommended).toLocaleString()}`;
    }
    renderGiftBulkBar(),
        (e.innerHTML =
            0 === total
                ? '\n        <div class="text-center text-dim" style="grid-column:1/-1; padding:60px 20px; font-size:1.1rem;">\n          Your inventory is empty. Create gifts above to get started! ✨\n        </div>\n      '
                : 0 === visible.length
                  ? '\n        <div class="empty-note" style="grid-column:1/-1; padding:40px 20px;">No gifts match your filters.</div>\n      '
                  : visible.map(giftInvCard).join(""));
}
function updateGiftInventory() {
    const e = $("giftInventoryGrid");
    if (!e) return;
    gameState.giftInventory || (gameState.giftInventory = { items: [], capacity: 1 / 0 }),
        renderGiftInventoryControls(),
        renderGiftInventoryGrid();
}
function renderGiftVaultGrid() {
    const host = $("giftVaultGrid"),
        cnt = $("giftVaultCount");
    if (!host) return;
    const items = (gameState.giftInventory?.items || []).filter((i) => i.vaulted);
    cnt && (cnt.textContent = items.length),
        (host.innerHTML = items.length
            ? items.map(giftInvCard).join("")
            : '\n        <div class="empty-note" style="grid-column:1/-1; padding:60px 20px;">Your vault is empty. Use 🔒 Vault on any gift to protect it from regeneration, deletion, and bulk-sell.</div>\n      ');
}
window.setGiftPane = function (pane) {
    giftPane = pane;
    const map = {
        store: "giftPaneStore",
        inventory: "giftPaneInventory",
        vault: "giftPaneVault",
        craft: "giftCraftSection",
    };
    Object.entries(map).forEach(([k, id]) => {
        const el = $(id);
        el && (el.hidden = k !== pane);
    }),
        document
            .querySelectorAll("#giftPaneSeg button")
            .forEach((b, i) =>
                b.classList.toggle("is-active", ["store", "inventory", "vault", "craft"][i] === pane)
            ),
        "inventory" === pane
            ? updateGiftInventory()
            : "vault" === pane
              ? renderGiftVaultGrid()
              : "craft" === pane
                ? renderCraftControls()
                : updateGiftStore();
};
window.setGiftInvSearch = function (v) {
    (giftInvState.search = v || ""), renderGiftInventoryGrid();
};
window.setGiftInvCategory = function (v) {
    (giftInvState.category = v || "all"), renderGiftInventoryGrid();
};
window.setGiftInvSort = function (v) {
    (giftInvState.sort = v || "date"), renderGiftInventoryGrid();
};
window.setGiftInvView = function (v) {
    (giftInvState.view = v || "all"), renderGiftInventoryControls(), renderGiftInventoryGrid();
};
window.toggleGiftBulk = function () {
    (giftInvState.bulk = !giftInvState.bulk),
        giftInvState.bulk || giftInvState.selected.clear(),
        renderGiftInventoryControls(),
        renderGiftInventoryGrid();
};
window.toggleGiftInvSelect = function (e) {
    giftInvState.selected.has(e) ? giftInvState.selected.delete(e) : giftInvState.selected.add(e),
        renderGiftInventoryGrid();
};
window.bulkSelectAllVisible = function () {
    getVisibleInventory().forEach((i) => giftInvState.selected.add(i.id)), renderGiftInventoryGrid();
};
window.bulkClearGiftSelection = function () {
    giftInvState.selected.clear(), renderGiftInventoryGrid();
};
window.toggleGiftFavorite = function (e) {
    const t = gameState.giftInventory.items.find((t) => t.id === e);
    t &&
        ((t.isFavorite = !t.isFavorite),
        renderGiftInventoryGrid(),
        "function" == typeof saveGame && saveGame(!1));
};
window.bulkSellSelectedGifts = async function () {
    const ids = [...giftInvState.selected],
        items = gameState.giftInventory.items.filter((i) => ids.includes(i.id) && !i.vaulted);
    if (!items.length)
        return void showNotification("Nothing to sell — vaulted gifts are protected.", "warning");
    let refund = 0;
    items.forEach((i) => (refund += Math.round((i.price || 0) * 0.5) * (i.quantity || 1)));
    if (
        !(await showConfirm(
            `Sell ${items.length} gift type(s) for $${refund.toLocaleString()} (50% of value)? Vaulted gifts are skipped.`,
            "Sell Gifts",
            { type: "warning", confirmText: "Sell" }
        ))
    )
        return;
    const sellIds = items.map((i) => i.id);
    (gameState.giftInventory.items = gameState.giftInventory.items.filter((i) => !sellIds.includes(i.id))),
        (gameState.cash += refund),
        giftInvState.selected.clear(),
        renderGiftInventoryGrid(),
        updateUI(),
        "function" == typeof saveGame && saveGame(!1),
        showNotification(`💰 Sold ${items.length} gift(s) for $${refund.toLocaleString()}`, "success");
};
window.bulkDiscardDuplicateGifts = async function () {
    const dups = gameState.giftInventory.items.filter((i) => !i.vaulted && (i.quantity || 1) > 1);
    if (!dups.length) return void showNotification("No duplicate copies to discard.", "info");
    let refund = 0,
        count = 0;
    dups.forEach((i) => {
        const extra = (i.quantity || 1) - 1;
        (refund += Math.round((i.price || 0) * 0.5) * extra), (count += extra);
    });
    if (
        !(await showConfirm(
            `Discard ${count} duplicate copies for $${refund.toLocaleString()} back (50%)? One of each is kept; vaulted gifts untouched.`,
            "Discard Duplicates",
            { type: "warning", confirmText: "Discard" }
        ))
    )
        return;
    dups.forEach((i) => (i.quantity = 1)),
        (gameState.cash += refund),
        renderGiftInventoryGrid(),
        updateUI(),
        "function" == typeof saveGame && saveGame(!1),
        showNotification(`🧹 Discarded ${count} duplicate(s) for $${refund.toLocaleString()}`, "success");
};
// ---- Gift targeting: give a chosen gift to a chosen NPC with a live reaction preview ----
let _giftGiveCtx = { giftId: null, npcId: null };
function renderGiftRecipientGrid(gift) {
    const grid = $("giftRecipientGrid"),
        empty = $("giftRecipientEmpty");
    if (!grid) return;
    const emps = (gameState.employees || []).filter((e) => !1 !== e.hired);
    if (!emps.length) return (grid.style.display = "none"), void (empty && (empty.style.display = "block"));
    (grid.style.display = "grid"), empty && (empty.style.display = "none");
    grid.innerHTML = emps
        .map((e) => {
            const pv = giftReactionPreview(e, gift),
                img = e.profileImage || e.generatedPortrait || "",
                hasImg = img && (img.startsWith("http") || img.startsWith("data:")),
                init = (e.name || "?")
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("");
            return `
        <div class="gift-recipient-card" data-id="${e.id}" onclick="selectGiftRecipient('${e.id}')">
          <div class="avatar-sm">${hasImg ? `<img src="${img}" alt="">` : `<span class="init">${init}</span>`}</div>
          <div class="grc-meta">
            <div class="grc-name">${e.name}</div>
            <div class="text-mute fs-xs">${e.position || e.role || "Employee"}</div>
          </div>
          <span class="chip ${pv.cls}"><span>${pv.emoji}</span><span class="lbl">${pv.label}</span></span>
        </div>`;
        })
        .join("");
}
window.openGiftRecipientModal = function (giftId) {
    const gift = gameState.giftInventory?.items.find((i) => i.id === giftId);
    if (!gift) return void showNotification("Gift not found.", "error");
    _giftGiveCtx = { giftId, npcId: null };
    const nameEl = $("giftRecipientGiftName");
    nameEl && (nameEl.textContent = `${gift.name} — $${gift.price.toLocaleString()}`),
        renderGiftRecipientGrid(gift);
    const send = $("giftRecipientSendBtn");
    send && (send.disabled = !0);
    const msg = $("giftRecipientMessage");
    msg && (msg.value = "");
    const modal = $("giftRecipientModal");
    modal && (modal.style.display = "flex");
};
window.selectGiftRecipient = function (id) {
    (_giftGiveCtx.npcId = id),
        document
            .querySelectorAll("#giftRecipientGrid .gift-recipient-card")
            .forEach((c) => c.classList.toggle("is-selected", c.dataset.id === id));
    const send = $("giftRecipientSendBtn");
    send && (send.disabled = !1);
};
window.closeGiftRecipientModal = function () {
    const modal = $("giftRecipientModal");
    modal && (modal.style.display = "none"), (_giftGiveCtx = { giftId: null, npcId: null });
};
window.confirmGiftRecipient = async function () {
    const { giftId, npcId } = _giftGiveCtx;
    if (!giftId || !npcId) return;
    const gift = gameState.giftInventory.items.find((i) => i.id === giftId),
        npc = gameState.employees.find((e) => e.id === npcId);
    if (!gift || !npc) return void showNotification("Gift or recipient missing.", "error");
    const msgEl = $("giftRecipientMessage"),
        msg = msgEl ? msgEl.value.trim() : "",
        snapshot = { ...gift };
    closeGiftRecipientModal();
    const inv = gameState.giftInventory.items.find((i) => i.id === giftId);
    inv &&
        ((inv.quantity = (inv.quantity || 1) - 1),
        inv.quantity <= 0 && (gameState.giftInventory.items = gameState.giftInventory.items.filter((i) => i.id !== giftId)));
    const cat = GIFT_CATEGORIES[snapshot.category],
        hist = gameState.chatHistory[npc.id] || [];
    hist.push({
        sender: "player",
        content: msg || "🎁 Gave a gift",
        timestamp: gameState.time?.currentTime || Date.now(),
        isPlayer: !0,
        giftData: {
            name: snapshot.name,
            price: snapshot.price,
            category: snapshot.category,
            categoryName: cat?.name || snapshot.category,
            categoryEmoji: cat?.emoji || "🎁",
            description: snapshot.description,
            imageUrl: snapshot.imageUrl,
        },
    }),
        (gameState.chatHistory[npc.id] = hist),
        showNotification(`🎁 Giving ${snapshot.name} to ${npc.name}…`, "info");
    await giveGiftToEmployee(npc.id, snapshot, msg);
    (lastInventoryRenderHash = null),
        "function" == typeof updateGiftInventory && updateGiftInventory(),
        updateUI(),
        gameState.activeChat &&
            gameState.activeChat.id === npc.id &&
            "function" == typeof refreshChatDisplay &&
            refreshChatDisplay();
};
// ---- Gift Workshop: combine + personalize (builds on the genie infra) ----
const _rarityRank = (c) =>
    "UNIQUE" === c ? 5 : "LUXURY" === c ? 4 : "EXPERIENCES" === c ? 3 : "ROMANTIC" === c || "TECH" === c ? 2 : 1;
let lastCraftControlsHash = null;
function renderCraftControls() {
    const host = $("giftCraftSection");
    if (!host) return;
    const items = (gameState.giftInventory?.items || []).filter((i) => !i.vaulted),
        emps = (gameState.employees || []).filter((e) => !1 !== e.hired),
        h = JSON.stringify({ i: items.map((i) => `${i.id}:${i.quantity || 1}`), e: emps.map((e) => e.id) });
    if (h === lastCraftControlsHash) return;
    lastCraftControlsHash = h;
    const giftOpt = (sel) =>
            ['<option value="">— select a gift —</option>']
                .concat(
                    items.map(
                        (i) =>
                            `<option value="${i.id}"${sel === i.id ? " selected" : ""}>${i.name} ($${(i.price || 0).toLocaleString()})${(i.quantity || 1) > 1 ? " ×" + i.quantity : ""}</option>`
                    )
                )
                .join(""),
        npcOpt = (sel) =>
            ['<option value="">— select a person —</option>']
                .concat(emps.map((e) => `<option value="${e.id}"${sel === e.id ? " selected" : ""}>${e.name}</option>`))
                .join(""),
        A = $("craftCombineA"),
        B = $("craftCombineB"),
        PG = $("craftPersGift"),
        PN = $("craftPersNpc");
    A && (A.innerHTML = giftOpt(A.value)),
        B && (B.innerHTML = giftOpt(B.value)),
        PG && (PG.innerHTML = giftOpt(PG.value)),
        PN && (PN.innerHTML = npcOpt(PN.value)),
        updateCraftCombineInfo(),
        updateCraftPersInfo();
}
