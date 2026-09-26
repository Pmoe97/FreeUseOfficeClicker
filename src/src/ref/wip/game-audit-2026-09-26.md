# Game audit — 2026-09-26

> **Status: findings only, nothing fixed yet.** Written after the file-tree restructure,
> before the three queued player reports. Paths are `src/src/srcfiles/js/…` unless noted;
> line numbers are as of this date.

## How this was done

- **Whole-program lint.** All 54 game files plus the inline `index.html` scripts, bundled in
  load order and run through ESLint's correctness rules (undefined names, const reassignment,
  duplicate keys, unreachable code, …), with every hit mapped back to file:line.
- **Structural scans.** Duplicate top-level declarations, functions nothing calls, empty
  stubs, inline `onclick` handlers that call undefined functions, element ids the code looks
  up that nothing creates, settings that are saved but never read, listeners added in hot
  paths, U+FFFD characters.
- **Live sweep.** In the local build with AI stubbed (instant canned text, generated JPEG
  images), a company was built through the real flows: 18 hires across garage, home office,
  office suite and factory, a boss fight won, a transfer, chat, group chat, social actions,
  payroll, loans, raises, programs, encounters, story events. Every tab, every Settings tab,
  and ~30 modals were opened while page errors were captured. A/B timing of the tick and
  autosave. Save contents measured.
- **Reading.** Offline time, payroll proration, hiring/ladder seating, unlock paths, save
  load/merge.

Every finding below was confirmed either live or at the call site. The "Checked and cleared"
list at the end records things that looked wrong but aren't, so they don't get re-investigated.

## Summary

| | Count |
|---|---|
| High — money/time integrity, crashes in normal play, broken features | 5 |
| Medium — wrong behaviour or silently dead feature | 13 |
| Low — cosmetic, cheats, latent | 9 |
| Incomplete / unwired systems | 6 groups |
| QoL | 8 |

---

## High

### H1. Every reload pays out AFK earnings for the whole previous session, and fast-forwards the clock again
`51-save-system.js:1851` (`offlineAnchor`), `checkAfkIncome` at `:1883`.

"Time away" is measured from `offlineEarnings.lastPlayedRealTime || lastInteractionTime ||
lastPlayTime`. The first one is only written at boot and when earnings are claimed — never
during play — so it always wins over the two fields that *are* kept fresh (on interaction,
`visibilitychange`, `beforeunload` at `29-event-listeners.js:2521-2553`). Effect of any
reload: "Welcome back, you were away <length of your last session>" with AFK income for it
(25%, capped at 8 h), **and** `applyOfflineTimePassage` (`07-time.js:26`) fast-forwards game
time by twice that span (`OFFLINE_TIME_SCALE = 2`, capped at 48 game-hours).

Seen live: reloaded ~1 minute after a save → "Time away 46m", $246.97M offered. After one
session the game clock was **13.1 h ahead** of real time — extra day changes, schedules and
payroll runs came with it.

Fix: anchor on the most recent of the three (or stamp `lastPlayedRealTime` in
`saveGameToSlot` and on `pagehide`/`visibilitychange`).

### H2. Transfers don't move the employee (player report #3)
`showTransferModal` `34-corporate.js:983` → `assignEmployeeToPosition` `:355`;
`updatePeopleTab` `35-people.js:114`; `getEmployeeWorkLocation` `11-accountants.js:36`.

A transfer moves the ladder seat and sets `productManaged`, but leaves `emp.locationId`,
`emp.location` and `emp.productId` on the old site. Everything that shows or filters by
location reads `locationId` (People rows, the location filter/sort, coworker context in
prompts). `getEmployeeWorkLocation` doesn't save it either: it matches `productId` *or*
`productManaged`, and the stale `productId` hits the old site's product first. Seen live:
Lynda transferred to a factory seat, still "🏠 Garage" everywhere.

The People-tab location filter is also built only from locations some listed employee
already has (`35-people.js:165`), so a newly opened site never appears until someone is
hired directly into it — the "factory not in the filter" half of the report.

Fix: one helper that derives location from the ladder seat (fallback: managed product),
called on assign/transfer/demote/promote and on load; filter options from unlocked
`gameState.locations`.

### H3. Giving gifts from a group chat crashes
`38-groups.js:2025, 2061, 2070` (`populateGroupGiftGrid`, `selectGroupGift`).

The gifts overhaul changed `gameState.giftInventory` from an array to `{ items, capacity }`;
the group gift code still does `giftInventory.forEach / [i] / .splice`. Seen live:
`TypeError: t.forEach is not a function` on opening the group Gift modal. (It would also
offer vaulted items.) Nothing else still uses the old shape.

### H4. SFW mode + an explicit post type throws
`49-social-autonomy.js:972` reassigns `i`, declared `const` at `:897` in
`generateEmployeePost`. `TypeError: Assignment to constant variable` whenever SFW mode is on
and the requested type is explicit/thirst_trap/lewd/nude (e.g. a chat request for a spicy
post) — the post is lost. Random post types are already SFW-filtered, so it only bites when a
type is passed in. Seen live.

### H5. Saves grow without bound because of images (player report #2)
Images are stored as base64 `data:` URLs inside `gameState` and never leave it:
- every portrait is stored twice (`profileImage` + `photos[]`);
- `socialNetwork.posts` keeps up to 1,000 post images (`CAPS.SOCIAL_POST_IMAGES_KEEP`,
  `01-core.js:18`), and when posts are pruned their images are *salvaged into the author's
  gallery* (`salvagePrunedPostImages`, `16-npc-schedule.js:113`);
- galleries have **no cap and no delete** — no UI or code path removes a photo;
- `gameState.activeChat` serializes a full second copy of the open-chat employee (gallery
  included) whenever a chat is open at save time;
- each of up to 26 curated snapshots is a full copy of all of it.

Measured on the 18-employee test save: 587K chars, 27% images, only 27 of 49 images unique —
with stub images of ~6 KB. Real generated images are roughly 50–150 KB each, so a long-lived
save reaches tens of MB, times the snapshot count in storage. Save cost is linear in size:
20–35 ms per autosave here (every 5 s), so seconds-long stalls at that scale.

Direction needs a decision — see Questions.

---

## Medium

| # | Where | What happens |
|---|---|---|
| M1 | `29-event-listeners.js:1429` | **Clear History** in chat wipes and archives the conversation, then throws `renderChatMessages is not defined`: old messages stay on screen, no confirmation. Seen live. Call `loadChatHistory(id)`. |
| M2 | `39-social-feed.js:313` | Every post's **⋯ → Request Image** calls `openRequestImageModal`, which doesn't exist. Dead button. |
| M3 | `38-groups.js:2402` | Group **Request Post**: posts your message and a "Requesting social post…" toast, then nothing — the call is guarded behind a `requestSocialPost` that doesn't exist. |
| M4 | `02-ai-queues.js` (6 sites) | Failed images fall back to `via.placeholder.com`, which shut down in 2024 → broken-image icons (seen on the boss victory portrait). 23 more `placehold.co` URLs elsewhere are a live external dependency. Use an inline SVG. |
| M5 | `28-hiring.js:742` | The manager-profile prompt hard-codes "adult female NPC… Gender: female" for every new hire, whatever the candidate's gender — male/trans/futa hires get a female-written bio and appearance. |
| M6 | `09-payroll.js:407` + 11 `hireDate = Date.now()` sites | `hireDate` is on the real clock; payroll proration and raise tenure measure it against the game clock. With the drift from H1, new hires are paid for days before they were hired and tenure is inflated. Stamp `gameState.time.currentTime`. |
| M7 | `27-employee-create.js:1259` | Custom employees without a pre-made picture never get one: `buildEmployeeImagePrompt` doesn't exist; the `try` swallows it. |
| M8 | `28-hiring.js:673` | Rehire welcome message is always the canned fallback: `queryLLM` doesn't exist. |
| M9 | `49-social-autonomy.js:3737` | "Tea"/call-out replies are always canned: `${emp.name}` where the variable is `e` → ReferenceError inside the `try`. |
| M10 | `45-onboarding-profile.js:205` | Clicking an @mention in a post opens the chat but never scrolls to the message: looks for `#chatHistory`, the container is `#chatMessages`. |
| M11 | 6 files, 12 places | Emojis destroyed into `�` (U+FFFD), all visible: 5 corporate-ladder level icons (`03-game-state.js:2542-2596`), the prestige-locked location button (`32-business.js:26`), "no clothes" flag suggestion (`17-flags-detection.js:31`), an NPC line "As promised �" (`42-social-comments-ai.js:1065`), Orc/Wolfkin/Catkin in the race list (`49-social-autonomy.js:5809-5814`), the import confirm's money line (`51-save-system.js:3239`). |
| M12 | `32-business.js:107`, `51-save-system.js:3491` | `unlockLocation` is defined twice; the later one wins. It builds the ladder but never applies the new location's theme (old theme stays until you click a location tab) and doesn't save; the dead one did both but skipped the ladder. Merge into one. |
| M13 | `28-hiring.js`, `34-corporate.js` | Nothing reconciles "manages product X" with "holds X's ladder seat". A manager hired while no seat existed stays unseated forever — the seat appears later, empty — so they can't be transferred or promoted and stay Lv1. Normal hiring creates the seat; old saves and edge flows don't. Add a reconcile pass after `initializeHierarchicalPyramid`. (Seen with 11 unseated in the test company.) |

---

## Low

| # | Where | What |
|---|---|---|
| L1 | `03-game-state.js:2716` & `:3286` | The `gameState` literal has two `settings` keys; the second replaces the first, dropping defaults for atmosphere, guidelines, policy, image style/perspective, AI limits, streaming, auto-visualization, chat sizes. Read sites all have fallbacks, so the only visible effect: no Office Policy button highlighted on a new game. Merge the blocks. |
| L2 | `49-social-autonomy.js:1792` | Duplicate key `waking_up`; the first text is dead. |
| L3 | `29-event-listeners.js:829, 839, 857` | Cheats: Unlock All Locations/Products throw after unlocking (`renderLocations`/`renderProducts` undefined); Hire All's filter is inverted and leaves hired people in the candidate pool. |
| L4 | `51-save-system.js` load | `activeChat` survives a reload when a chat was open (re-linked correctly, but a "ghost" open chat) and doubles that employee in the save (see H5). Null it on save or load. |
| L5 | `29-event-listeners.js:243`, `51-save-system.js:3128` | Autosave toggle: stops the 5 s timer, but the checkbox isn't restored from the save and ~140 event-driven `saveGame()` calls ignore it. |
| L6 | export/import | Export turns the `Set` fields (`usedEmployeeNames`, `blockedProactiveMessages`) into `{}`; the name generator self-heals with an empty set, so name-uniqueness history is lost after an import (duplicate names possible). |
| L7 | `16-npc-schedule.js:1052` | Emoji-stripping regex puts variation-selector emojis in a character class; can leave a stray U+FE0F. |
| L8 | `23-npc-psychology.js:346` | Game function `remember` shadows the Perchance `remember` plugin import in `main.pjs`; the plugin is dead weight (and its name is in the bridge list). |
| L9 | `13-story-engine.js:559, 568` | The "modal already open" guard also checks `#multiStepEventModal`, an id nothing creates (multi-step events reuse `#storyEventModal`). Harmless dead check. |

---

## Incomplete / unwired systems

1. **Money requests from chat** — `considerMoneyRequest` (`46-chat.js:2159`) is an empty
   function still awaited on 4 chat paths, while the in-game patch notes advertise it as
   "enhanced with financial intelligence". Either the logic moved into the chat-delivery
   funnel (then remove the calls and the patch-note line) or it was lost.
2. **People-tab field visibility & card collapse** — code for `#toggleFieldsPanel`,
   `#fieldVisibilityPanel`, `#resetFieldDefaults`, `#collapseAllCards` still runs, but the
   markup went in the UI overhaul, so `peopleSorting.fieldVisibility`/`collapsedCards` can't
   be changed.
3. **Social feed posts-per-page** — `#postsPerPageSlider` is wired, no markup.
4. **Features with code but no entry point** (35 functions nothing calls). The ones that
   look like unfinished features: chat quick actions `quickSendCash` / `openGiftModal`
   (`47-chat-ai.js`); `showCustomActionInputModal` (custom NPC action, `46-chat.js`);
   group slash-command help `showGroupCommandsHelp` + `sendGroupMessageWithInstruction`;
   `checkForPromotions` (promotion posts); `removeEmployeeFromPosition` (unseat from ladder);
   `cleanupExpiredFlags` (flag expiry never cleaned); `wasTopicRecentlyUsed` (post-topic
   de-dupe never applied); the coworker-awareness prompt builders
   (`buildCoworkerAwarenessContext`, `getOfficeDynamicsSummary`, `getRecentSocialContext`,
   `shouldMentionCoworkerActivity`, `getCompanyWideContextString`); `getSkillXPFromAction`;
   `showCompanyEventModal`. Full list: rerun the structural scan (see bottom).
5. **"Messages" tab** — `renderMessagesList` is called when `activeTab === "messages"`; that
   tab and function don't exist (`42-social-comments-ai.js:708, 1138`).
6. **Pre-overhaul DOM references** — ~25 lookups of ids that no longer exist (`dash*`,
   `revenueEl`, `saveBtn`/`loadBtn`/`exportBtn`, `buy*Btn`, …). All null-guarded; dead code.

---

## QoL

1. **Save Manager** (player report #1): no way to overwrite a manual save; "Create New Save"
   makes `manual_<timestamp>` and you rename it inline; no marker for which save you're
   playing. Want: Overwrite on each manual save, name prompt on create, "current" badge.
2. **Gallery management**: no delete, favourite/protect, or cap (feeds H5).
3. **Storage visibility**: save size and snapshot footprint only exist as
   `window.snapshotReport()` in the console. A line in Settings → Data would let players see
   when they're heavy.
4. **People-tab location filter** lists only locations someone already works at; should list
   every unlocked location (part of H2).
5. **Location theme** doesn't switch when you unlock a new site (M12).
6. **Office Policy** shows no selection on a new game (L1).
7. **Hard-to-diagnose AI failures**: failed images show a broken icon (M4) and several
   generators silently fall back to canned text (M7-M9) with only a console line — a small
   "AI fell back" indicator would help players report problems.
8. **Cheat panel** buttons that throw (L3) look like game bugs to anyone who tries them.

---

## Questions for you

1. **Images (H5).** Options, not exclusive:
   a. *Store each image once, outside the save* — a content-addressed image store; saves and
      snapshots keep a short reference, duplicates collapse, snapshots stop copying images,
      exports re-inline them. Biggest win, no visible change to players, most work.
   b. *Caps + controls* — per-employee gallery limit with favourites protected, a delete
      button, fewer kept post images.
   c. *Shrink* — re-encode stored images smaller (quality trade-off).
   Which do you want — (a) alone, (a)+(b), or just (b)?
2. **AFK/offline (H1).** Fix to "time since you last played" — yes? And should offline time
   still advance the game clock at 2× real time, or 1×?
3. **Dead features** (Incomplete 2-4): restore or delete? In particular the People-tab
   field-visibility panel, the group command help, the chat quick-send-cash/gift buttons, and
   `considerMoneyRequest`.
4. **Cheats (L3)**: fix, or leave as developer-only?

---

## Checked and cleared (not bugs)

- **Factory manager costs $56M** vs $350 in the garage — intended tier scaling (a factory
  product earns $1.1M per cycle).
- **Unlocking a location via `unlockLocation` skips the boss** — only reachable after the
  boss is defeated ("Claim Victory"); the button gating is right.
- **`activeChat` after reload** — re-linked to the real employee object (only L4 remains).
- **Dropped `settings` defaults** — every reader has a fallback (only L1's cosmetic effect).
- **`#uaGenitalCards` etc. "missing"** — created at runtime by `renderGenitalCards(id, …)`.
- **Story events blocked by a lingering modal** — resolving a choice removes
  `#storyEventModal`; the guard doesn't stick.
- **Listener leaks in hot paths** — the one document-level listener in `updatePeopleTab` is
  guarded; the rest attach to freshly created elements.
- **Performance at normal size** — UI refresh ≈1 ms at 10 Hz; not a problem until H5's
  save growth.

## Re-running the scans

The lint bundle, structural scan and settings-usage scan were throwaway scripts in a session
scratchpad. If they're wanted again, the recipe: concatenate `index.html`'s inline scripts
and `src/src/srcfiles/js/*.js` in load order, lint as one `sourceType: script` program with
browser globals + the `main.pjs` plugin names, and treat `window.X =` assignments as globals.
