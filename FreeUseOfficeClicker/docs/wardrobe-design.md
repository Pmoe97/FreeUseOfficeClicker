# NPC Wardrobe System — Design Doc

Status: **proposal, not implemented**. Written per Pmoe's request to scope this feature to a design doc before any code is written.

## Goal

NPCs should feel like they have a real (small) closet:
- A fresh outfit day-to-day, not the same static description forever.
- Continuity within a day/scene — no outfit-flickering across two closely-spaced events/messages.
- Different activities (work, gym, date, sleep, casual, etc.) pull different outfit types.
- Clothing gifts add new outfits to the wardrobe.
- Players can view and edit the wardrobe (meta-level control).

## What already exists today

- `gameState.currentDay` — integer day counter. Natural key for "same-day continuity."
- `employee.personalLife.currentActivity` (index.html ~35609-35680) — hourly lifecycle with types `gym`, `cooking`, `socializing`, `relaxing`, `hobby`, `date`. Already injected into AI prompt context. No `work` or `sleep` type exists yet — default/no-current-activity during work hours should be treated as `work`, and late-night hours (via `timeHelpers.getHour()`) as `sleep`.
- `giftedPossessions.wardrobe[]` (index.html ~40970-40993, see `applyGiftConsequences`) — clothing gifts (`category === "FASHION"`) already land here as `{item, category, price, timestamp, wearChance}`. `wearChance` is computed but never read by anything — this is the gift-intake half of the feature, already built, just disconnected from any selection logic.
- `physical.fashion` / `physical.accessories` — static strings set once at character creation. Consumed by `getPhysicalDescriptionForPrompt` (index.html ~39806-39901) and a handful of hardcoded portrait-prompt call sites (~21658, ~52160, ~69300). This is today's *entire* outfit representation: no activity-awareness, no rotation, no day-continuity.

## Data model

Add a structured array to each NPC's `physical` object:

```js
physical.wardrobe = [
  {
    id: "wd_<random>",
    outfit: "short description, e.g. 'fitted charcoal blazer, white blouse, pencil skirt'",
    activityTags: ["work", "casual"],   // one or more of: work, casual, gym, date, sleep, lounge, going-out
    source: "starter" | "gift",
    addedDay: 0,           // gameState.currentDay at the time it was added
    timesWorn: 0,
  },
  // ...
]

physical.currentOutfit = {
  wardrobeId: "wd_xxx",
  activityTags: ["work"],
  day: 0,                 // gameState.currentDay when this was picked
}
```

This is purely additive — old saves have `physical.wardrobe === undefined` / `[]`, and every consumer must fall back to the existing static `physical.fashion` string when the array is empty. No migration step is required (unlike the genitals-array migration done earlier — see `migratePhysicalSchema`), because empty array is a safe default rather than a different legacy shape.

**Seeding:** at character creation, generate 3-5 starter wardrobe entries derived from whatever the existing fashion/accessories generator already produces (one of the entries can literally be the original generated outfit, tagged `["work","casual"]`; a couple more cheap variants — e.g. a gym fit and a sleep fit — synthesized from the same generator with different activity hints). This keeps creation cost low and guarantees every new NPC has *something* to rotate through immediately.

## Selection / continuity algorithm

```js
function selectOutfitForActivity(emp, activityCategory) {
  const wardrobe = emp.physical?.wardrobe;
  if (!wardrobe || !wardrobe.length) return null; // caller falls back to physical.fashion

  const current = emp.physical.currentOutfit;
  if (current && current.day === gameState.currentDay && current.activityTags?.includes(activityCategory)) {
    const same = wardrobe.find(w => w.id === current.wardrobeId);
    if (same) return same; // same-day continuity: don't re-roll mid-day
  }

  const matching = wardrobe.filter(w => w.activityTags.includes(activityCategory));
  const pool = matching.length ? matching : wardrobe; // fallback: any entry beats nothing
  const pick = weightedRandomPick(pool); // weight by recency (favor less-recently-worn) — simple 1/(timesWorn+1) weighting is enough, no need for anything fancier

  emp.physical.currentOutfit = { wardrobeId: pick.id, activityTags: pick.activityTags, day: gameState.currentDay };
  pick.timesWorn = (pick.timesWorn || 0) + 1;
  return pick;
}
```

Key design choice: continuity is checked by **(day, activity category)**, not by "time since last pick." This means a player who switches from a work scene to a date scene on the same day *should* get a different outfit (correct — different activity), but two work-context messages an hour apart on the same day reuse the same pick (correct — no flicker). When the activity category has no day-matching entry yet (first pick of the day for that category), it weighted-randoms a new one and locks it in for the rest of that day/category combo.

`activityCategoryFor(emp)` helper (new, small): maps `emp.personalLife?.currentActivity?.type` to one of the wardrobe tag buckets, with `work` as the default during `timeHelpers` working hours and no active personal-life activity, and `sleep` for late-night hours — mirroring the gap already noted above in "what exists today."

## Gift integration

In `applyGiftConsequences()` (index.html ~40970-40993), alongside the existing `giftedPossessions.wardrobe.push(...)`, also push a `physical.wardrobe` entry:

```js
physical.wardrobe.push({
  id: "wd_" + Date.now() + "_" + Math.random().toString(36).slice(2,8),
  outfit: t.name,                       // gift item name as the outfit description; player can edit later
  activityTags: inferActivityTagsFromGift(t),  // simple keyword heuristic over t.name/t.category, default ["casual"]
  source: "gift",
  addedDay: gameState.currentDay,
  timesWorn: 0,
});
```

`wearChance` (already computed, currently unused) becomes redundant once the weighted-pick-by-recency logic exists, but can be folded in as an initial weight multiplier for gifted items if we want gifts to be more likely to get worn soon after being given (nice touch, not required for v1).

`inferActivityTagsFromGift` is a small keyword heuristic (e.g. "gym"/"workout" → `["gym"]`, "lingerie"/"dress" → `["date"]`, "pajama"/"sleep" → `["sleep"]`, else `["casual"]`) — same spirit as the existing jewelry-type/vehicle-type keyword inference already used elsewhere in `applyGiftConsequences`.

## Prompt-injection points

Replace the static `physical.fashion` read with a wardrobe-aware lookup, falling back to the old behavior when no wardrobe exists:

```js
const activity = activityCategoryFor(emp);
const outfit = (emp.physical?.wardrobe?.length)
  ? selectOutfitForActivity(emp, activity)?.outfit
  : null;
const fashionText = outfit || emp.physical.fashion; // unchanged fallback
```

Call sites to update:
- `getPhysicalDescriptionForPrompt` (index.html ~39806, fashion/accessories injected ~39896-39901) — the main chat-context description builder.
- Hardcoded portrait-prompt call sites (~21658, ~52160, ~69300) — currently read `physical.fashion` directly for image-generation prompts.

All three become a 2-3 line change (call the lookup, use its result in place of the direct field read) — no structural change to the surrounding prompt-building code.

## Player-facing UI

New "Wardrobe" section inside `openUnifiedProfile`'s Appearance tab (or its own subtab, if the Appearance tab is already crowded — see `[[project_character_edit_sync]]` for how that tab is currently organized). Rendered as cards, reusing the existing genital/piercing card pattern already established in `upgradeUnifiedAppearanceEdit()`:

- `renderWardrobeCards(containerId, wardrobe)` / `collectWardrobe(containerId)`, mirroring `renderGenitalCards`/`renderXCards`+`collectX`.
- Each card: an outfit-text combobox (reuse `comboField`), an activity-tag picker (reuse `renderTagPicker`/`collectTags`), a "📌 currently wearing" badge when the card's id matches `physical.currentOutfit.wardrobeId`, and ➕ Add / ➖ Remove controls.
- Must follow the established Perchance-safe rules for dynamically injected DOM (see `[[project_character_edit_sync]]`): no inline `on*` handlers (use the existing delegated `data-act` listener), no `[...]` bracket selectors in attribute values, no native `<datalist>`/`list=` — same constraints every other structured-editor section in this codebase already follows.
- Save wiring follows the same pattern as the other structured sections: `syncUnifiedStructured()` picks up wardrobe-card changes into `editedData.physical.wardrobe` alongside genitals/piercings/tattoos/features.

## Effort vs. benefit

This is the largest item in the current backlog:
- A new data field with a migration-free default (low risk on its own).
- A selection/continuity algorithm that has to be gotten right (mid-day flicker is the failure mode players will actually notice).
- Prompt-injection changes at 3+ call sites.
- A brand-new card-based editor UI section, built to the same Perchance-safe constraints as the rest of the editor.

None of it is individually hard, but bundling it into the same pass as the smaller confirmed bug fixes (Business tab reactivity, loan repayment, gift regen, group image prompts, caption parity, Quick Panel CSS) would risk a regression in a big new feature blocking small, low-risk, already-validated fixes. Recommendation: ship this design as its own follow-up pass, reviewed with Pmoe before writing any code.

## Open questions for review

1. Should `wearChance` (already computed on gift intake but currently dead) be wired in as a soft weight bump for newly-gifted items, or dropped entirely in favor of pure recency-weighting? (Doc above treats it as optional/nice-to-have.)
2. Is the activity-tag vocabulary (`work, casual, gym, date, sleep, lounge, going-out`) complete enough, or should it mirror `personalLife.currentActivity` types exactly (`gym, cooking, socializing, relaxing, hobby, date` + the two new implied ones `work`/`sleep`)? Doc above leans toward a slightly broader/coarser tag set than the activity-type enum itself, since multiple activity types (e.g. `cooking`, `relaxing`) plausibly share a `casual` outfit.
3. Starter wardrobe size (3-5 proposed) — fine as a default, or should higher-tier/richer NPCs get more starter variety?
