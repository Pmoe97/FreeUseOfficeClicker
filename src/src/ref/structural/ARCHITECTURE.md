# Architecture — file layout, load order, and the rules that keep it working

> Living document. Update it when a file is added, renamed, or reordered.

## The layout

The repo mirrors a Perchance generator that uses the **file tree**:

```
index.html                      Perchance HTML panel — markup + the small inline boot scripts
main.pjs                        Perchance lists panel — plugin imports, $meta, CEO chat config
src/                            stands in for Perchance's own top-level container
  src/                          the folder Perchance lets you download/upload as ONE zip
    srcfiles/
      css/NN-*.css              the stylesheet, in cascade order
      js/NN-*.js                the game script, in load order
    dev/tools/                  theme + CSS tooling (npm scripts at the repo root)
    ref/                        design docs (this folder)
archived/                       previous versions of the game, frozen
local-dev/                      offline dev server (Ollama text, ComfyUI images, IndexedDB saves)
reference-only/                 outside material; deliberately NOT under src/src (it would ship)
```

**Why `src/src/`:** Perchance's file tree has a top-level container that can't itself be
downloaded or uploaded, but any folder *inside* it can, as a single zip. Keeping everything
under the inner `src/` means the whole game moves in one zip; the outer `src/` exists only
so the paths the page uses (`src/src/srcfiles/...`) are identical locally and on Perchance.
This is the same layout as the Slice-of-Life generator.

Everything under `src/src/` ships to Perchance, `dev/` and `ref/` included. Don't put secrets
or large outside files there.

## How the page loads

In document order (`index.html`):

1. Three inline scripts that must run before anything paints: viewport meta, the
   **display-settings / theme boot** (`fuoc_display_settings` → `<html data-fuoc-theme>`),
   analytics.
2. Markup, with `css/00-keyframes.css` linked where the first inline `<style>` used to be.
3. The **plugin bridge** (inline): copies `kv`, `generateText`, `generateImage`, … from
   `window.root` onto `window`. The code used to be one inline `<script>`, where Perchance
   resolves those bare names itself; external files don't get that. **If you add an
   `{import:…}` to `main.pjs`, add its name to the bridge list too.**
4. `js/00-bootstrap.js` … `js/56-patch-notes.js`, in order. `53-exports.js` registers
   `DOMContentLoaded → initGame`; 54–56 load after it, which is fine because nothing in
   them runs until the game has booted (a save, a click).
5. A tiny inline script (`cycleCashDisplay`), then `css/01-theme.css` … `css/22-story.css`.
   The stylesheet stays *after* the scripts on purpose: that's where the old `<style>` block
   sat, so `<style>` elements the scripts inject while loading keep their cascade position.

## Rules for the JS files

They are classic scripts sharing **one global scope**, exactly like the old single block:
a top-level `function`/`let`/`const` in any file is visible to every other file once loaded.
What changed is hoisting:

- **Function hoisting stops at the file edge.** Code that runs *at load time* (top-level
  statements, IIFEs, and anything they call) can only use names declared in its own file or
  an earlier one. Calls made later — from `initGame`, the game tick, click handlers — can
  use anything. When the monolith was split, a static check found **zero** load-time forward
  references; keep it that way.
- **Don't reorder files.** The numbers are the load order.
- A new file: pick the next free number (or a gap), add its `<script src>` line in
  `index.html` at that position, and give it the standard header.
- A duplicate declaration across files is legal (last one wins) but is almost always a
  bug. `$` is intentionally declared in `05-utils.js` and `18-skills.js`, both identical.

## Cache busting

Every `<script src>`/`<link>` in `index.html` carries `?v=N` (the Slice-of-Life
convention). Browsers cache these files, so **bump `?v=` on every file you change** in a
release, or players can run a new `index.html` against an old copy of a file.

## Shipping to Perchance

There is no build step: the repo *is* the artifact.

1. Paste `index.html` into the HTML panel and `main.pjs` into the lists panel.
2. Zip `src/src/` and upload it into the generator's file tree, so the files resolve at
   `src/src/srcfiles/...`.

## Local development

`npm run dev` (or double-click `Launch FreeUseOfficeClicker.bat` for the control panel)
serves the repo at http://localhost:3000 with `local-dev/perchance-shim.js` injected ahead
of `index.html`. The server only serves `index.html` and `src/`, never `.git/`, `archived/`
or `local-dev/` config, since it listens on the LAN. See `local-dev/README.md`.

Top-level functions are on `window` in the console; `let`/`const` state such as
`gameState` is not, but `(0, eval)('gameState')` reaches it.

## Tooling

`npm run css:audit | theme:tokens | theme:audit | theme:suggest | theme:preview |
theme:picker | codemod:colors | colors:inventory`. All of them read the whole source through
`src/src/dev/tools/sources.mjs`. See `theming.md`.

## JS files (load order)

| File | Size | What it holds |
| --- | --- | --- |
| `00-bootstrap.js` | 32 KB | Boot & settings panel init — debug helpers, closeHiringModal, settings/log categories IIFE. |
| `01-core.js` | 42 KB | Global constants (CAPS, snapshot tiers), debugLog/debugWarn, core math (cycle time, values, click reduction), economy config `gameBalance`, emojiPicker, and the AI text queue `AIRequestQueue`. |
| `02-ai-queues.js` | 28 KB | AI text + image request queues (queuedGenerateText/queuedGenerateImage, ImageRequestQueue, debug hooks). |
| `03-game-state.js` | 145 KB | The `gameState` object literal, `timeHelpers`, aiOptimization, gift catalogs (GIFT_CATEGORIES/GIFT_SUGGESTIONS), boss variation pools/archetypes. |
| `04-boss-generation.js` | 22 KB | Boss generation (generateUniqueBoss, config proxy bossFightConfig, character/appearance builder buildBossImagePrompt, recruitment data). |
| `05-utils.js` | 5 KB | Generic utils: $ DOM helper, extractText, sfwMode guards, custom context builder getCustomWorldContext, request badge updates. |
| `06-social-model.js` | 25 KB | Social data model: createPost/createComment/createRelationship/createEvent, user ids, social data init + flag utilities (addFlag/removeFlag/updateFlag/getFlags, context builders). |
| `07-time.js` | 3 KB | Time engine: dilation, offline earnings, day/night cycles, scheduler hook helpers (fastForwardGameTime..setTimeContext). |
| `08-scheduler.js` | 26 KB | Scheduled events & NPC event triggers: auto-reply regexes, date math, NPC scheduled event queue (processNpcScheduledEvents..debugScheduledEvents). |
| `09-payroll.js` | 31 KB | Payroll: onHourChange/onDayChange, salary scaling, weekly payroll processing, payroll modal UI, payNow/auto-pay. |
| `10-loans.js` | 20 KB | Loans & credit: LOAN_TYPES, credit rating, loan products (pelican/investment/bond), interest, repayment. |
| `11-accountants.js` | 31 KB | Accountants: trait config ACCT_TRAITS, candidate pool, hiring/onboarding, PayrollMinigames, payroll coverage logic. |
| `12-raises.js` | 39 KB | Salary advances, raise requests, raise negotiation, bonus pool, updatePayrollTab. |
| `13-story-engine.js` | 666 KB | StoryEngine + StoryMinigames (multi-step events, minigame framework). |
| `14-story-events.js` | 69 KB | Story event runner: style injection, dynamic event generation, AI judge, event panel UI + openEventPanel exports. |
| `15-company-events.js` | 43 KB | Company events: event definitions COMPANY_EVENTS, checkForCompanyEvent, resolution, scheduled effects. |
| `16-npc-schedule.js` | 65 KB | NPC performance metrics, schedules, status messages, morning/evening posts, activity system, createSocialPost. |
| `17-flags-detection.js` | 130 KB | Flag detection: FLAG_DETECTION_PATTERNS, AI scans, flag chains, flag management modal, plus family/pregnancy/birth events. |
| `18-skills.js` | 13 KB | Skills: XP curve and pacing knobs (SKILL_GROWTH), passive on-the-job growth (accrueWorkHourSkills), aptitude/mentor multipliers, chat-topic XP, specializations, batched level-up notices + duplicate `$` helper. |
| `19-appearance.js` | 62 KB | Appearance/gender/race rendering: pools (APPEARANCE_OPTIONS), combo builders, card renderers, physical descriptions, getPhysicalDescriptionForPrompt. |
| `20-ai-context.js` | 29 KB | AI context: player profile/company helpers, context-usage tracking, NuclearEmbeddingService, token estimation, selectIntelligentContext context builder. |
| `21-gifts.js` | 48 KB | Gifts: generateCustomGift, gift store, reactions, pet names, giveGiftToEmployee. |
| `22-social-networking.js` | 39 KB | Social networking: relationships, company awareness, event log, gossip engine, coworker context, memory. |
| `23-npc-psychology.js` | 49 KB | NPC psychology: archetypes RACE_AXIS_PRIORS, scene state, memory/remember, voice, chat sanitization, spending rate, quality tracking. |
| `24-chat-context.js` | 31 KB | buildChatPrompt + final AI-context export chain. |
| `25-init.js` | 22 KB | Boot DOM refs (settingsBtn/chatName), initGame, getPlayerDescription, ModalManager export. |
| `26-employee-gen.js` | 225 KB | Employee generation: name pools, race/ethnicity config, appearance build plans, getRaceFeatures. |
| `27-employee-create.js` | 112 KB | Employee creation: family relations, URL/prompt/manual employee creation, rehire pool, hiring candidates. |
| `28-hiring.js` | 103 KB | Hiring modal rendering (showManagerHiringModal), candidate hire/manager selection. |
| `29-event-listeners.js` | 128 KB | setupEventListeners (all tab/global wiring) + switchTab. |
| `30-gifts-ui.js` | 31 KB | Gifts UI: gift genie, preview modal, store, inventory, vault, recipient picker, craft section. |
| `31-dashboard.js` | 37 KB | Dashboard: updateTabContent, updateDashboard, cash spark, action center, recent messages, top performers. |
| `32-business.js` | 37 KB | Business tab: locations, products list, progress bars, promotions, training workshops, team building, programs effects. |
| `33-programs.js` | 28 KB | Programs: program definitions PROGRAMS, runProgram, renderProgramsCard, target menus. |
| `34-corporate.js` | 83 KB | Corporate pyramid: structure math, modal, ladder, promotions, transfers, zoom. |
| `35-people.js` | 27 KB | People tab: relationship distance, employee list, sorting, updatePeopleTab. |
| `36-products.js` | 12 KB | Products: unlock levels, start/click product, image styles, cash formatting helpers. |
| `37-upgrades.js` | 22 KB | Upgrades: capital panes, workforce/location programs, flagship status, product upgrades, managers, gifts/hr tab updaters. |
| `38-groups.js` | 200 KB | Groups: create/manage groups, group chat, speaker queue, autocomplete, action bar, group money/gift/photo/post/visualize requests. |
| `39-social-feed.js` | 70 KB | Social feed: feed rendering, post modal, comments, notifications badge, post actions, poll rendering pieces. |
| `40-stories.js` | 43 KB | Stories bar: autonomous stories, story viewer, reactions, for-you scoring, polls, feed sorting. |
| `41-social-utils.js` | 50 KB | Social utils: like/comment/vote handlers, post/comment CRUD, image viewers, profile modal, mention helpers. |
| `42-social-comments-ai.js` | 144 KB | AI comments: comment generation pipeline, autonomous comments/likes, mention responses, image detection, news feed. |
| `43-game-loop.js` | 10 KB | Game loop: gameTick, updateUI, cash-per-second, core upgrade purchases (click/income/cost/time). |
| `44-boss-fights.js` | 55 KB | Boss fights: fight state, difficulty, startBossFight, combat actions, reaction minigames, victory/defeat, recruitment, rematch, discord promo. |
| `45-onboarding-profile.js` | 173 KB | Onboarding & profile: resetOnboarding, handleEmployeeAction, openChat, unified appearance/profile UI. |
| `46-chat.js` | 175 KB | Chat UI: chat history, addChatMessage, sendChatMessage, npc action bar, counter-offer flow, image/photo requests. |
| `47-chat-ai.js` | 79 KB | Chat AI: response generation, proactive DMs, money requests, image generation, scene visualization, stats updates. |
| `48-relationships.js` | 17 KB | Relationship batch engine: relationship queue, friendship/drama updates between NPCs. |
| `49-social-autonomy.js` | 243 KB | Social autonomy: news, mentions, player post composer, autonomous posts/comments/likes, test post generation. |
| `50-notifications.js` | 9 KB | Notifications: showNotification, confirm/input/prompt dialogs + export chain. |
| `51-save-system.js` | 188 KB | Save system: debounced save, SaveManager class (named saves, overwrite, "Playing" badge), slots, snapshots, autosave, export/import, reset, prestige, initial employees. |
| `52-encounters.js` | 251 KB | Encounter system: act catalog SexualActsDB, activeEncounter, skills, positions, combat acts, narration, image gen, request flow. |
| `53-exports.js` | 11 KB | Final window.* export chain + DOMContentLoaded boot listener (initGame). |
| `54-image-store.js` | 16 KB | Image store: every image kept once in its own kv entry (`fuoc_img_<id>`, content-hashed); saves hold `fuocimg:<id>` references. Save/load/export hooks, garbage collection, Settings → Data storage report. |
| `55-cheats.js` | 23 KB | Cheats & Debugging panel, rendered into `#cheatsModal` on open (`openCheatPanel`). |
| `56-patch-notes.js` | 275 KB | `PATCH_NOTES` (newest first — add releases at the top) + the collapsible renderer `loadPatchNotes`. |

## CSS files (cascade order)

| File | What it holds |
| --- | --- |
| `00-keyframes.css` | Global shared keyframes (pulse, shake, damageFloat, flash*) — was the first <style> block |
| `01-theme.css` | Theme palettes + a11y/system settings (fuoc-theme-*, scale, motion, flat, targets, focus, font) |
| `02-base.css` | Global base: .num, fuoc-ui reset, topbar/vitals/stats, stat-cycle, solvency + shared keyframes |
| `03-dashboard.css` | Dashboard/Command Center: page-h, bands, cards, tiles, gauges, sparklines, action center/triage, quick actions |
| `04-panels.css` | Panel/subpanel layout, mini-cards, form fields, buttons, scroll areas |
| `05-gifts.css` | Gifts UI: gift grid/cards/inventory, recipient sheet, craft grid |
| `06-capital.css` | Capital tab: atmosphere/comp sliders, stat blocks, upgrades, cap/prestige UI |
| `07-social.css` | Social: comments, filters, pills/bars, negotiator modal, account cards |
| `08-utilities.css` | Layout & text utilities: rows/cols/grid, spacing, text sizes/colors |
| `09-encounters.css` | Encounters: toggle-switch, loans, manual mode, fullscreen btn, encounter action grid + keyframes |
| `10-business.css` | Business tab: locations, products, production actions, hiring/candidates, generic cards/modals/buttons |
| `11-people.css` | People tab: roster rows, employee cards, chips, programs, ladder, chat-wrap, row menus |
| `12-chat.css` | Chat/social feed: chat messages, news ticker, hiring modal, candidate cards |
| `13-bossfight.css` | Boss fight combat: attack/block/parry/dodge UI, indicators, victory/defeat, keyframes |
| `14-chat-edit.css` | Message editing, regenerate count, meeting attach, a11y media overrides |
| `15-header.css` | Header collapse: topbar/news ticker, tab-nav icons-only, mainContent.header-collapsed |
| `16-save-manager.css` | Save manager modal: tabs, table, actions, export/delete, kbd, empty state |
| `17-settings.css` | Settings modal: tabs, content, keyframes + responsive |
| `18-stories.css` | Stories bar, notifications, comment replies, polls |
| `19-save-cards.css` | Save cards (quick save/load) + responsive |
| `20-groups.css` | Groups sidebar, participant portraits, recipient chips, group layout |
| `21-bossfight-modal.css` | Boss fight modal layout: portrait, HP bars, combat log, victory/defeat panels |
| `22-story.css` | Story mode: story modal, choices, timeline/journal, faction strength |
| `23-cheats.css` | Cheats & Debugging panel (55-cheats.js) |
| `24-patch-notes.css` | Collapsible patch notes (56-patch-notes.js) |

## Saves and images

A save (`fuoc_save_<slot>` in `kv.gameSave`) no longer contains images. `saveGameToSlot`
passes the state through `externalizeImagesForSave`, which writes any new image to
`fuoc_img_<id>` first and returns a copy-on-write copy with `fuocimg:<id>` references; loads
(`loadGame`, `loadGameFromSlot`) and `exportSaveSlot` run `internalizeImages` to put them
back. The live `gameState` always holds real `data:` URLs, so rendering code never sees a
reference. Unreferenced images are removed by `collectImageGarbage` (after a save is deleted,
snapshot rotation, a gallery delete, and a minute after boot), which never deletes an image
written in the last 10 minutes. `fuoc_img_index` caches each image's size for the report.

## History

- **Until 2026-09-26:** one `index.html` (~5.9 MB: markup + one 4.9 MB `<script>` + two
  `<style>` blocks) plus `perchance.logic`, minified by `build-perchance.mjs` to fit
  Perchance's database size limit. Kept, still buildable, in
  `archived/2026-07-27-monolith/`.
- **2026-09-26:** split into this layout. The boundaries follow the file-tree export
  that was live on Perchance (`archived/2026-09-26-perchance-file-tree-export/`, which was
  cut from the *minified* build). The files here were regenerated from the readable source
  at those same boundaries, so names and comments survive. Verified by: each file parsing to
  the same AST as its slice of the original; the whole program's AST unchanged; zero
  load-time forward references; and an in-browser A/B against the monolith (identical CSS
  rule count, global function set, `typeof` of all 1,360 top-level names, and computed
  styles).
- **2026-09-26 (later):** the bug-fix pass from `ref/wip/game-audit-2026-09-26.md` — image
  store, Save Manager overwrite, cheats and patch notes moved into their own files (54–56,
  css 23–24). Every file reference bumped to `?v=2`.
